import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sealStudy} from '../lib/sealed-manifest.mjs';
import {prepareTimestampRequest, verifyTimestampProof, reverifyTimestampProof, validateTSAConfiguration} from '../lib/timestamp-verifier.mjs';

let temp, study, queryPath, responsePath, trustRootPath;
const openssl = args => { const r = spawnSync('openssl', args, {encoding: 'utf8', timeout: 20000}); assert.equal(r.status, 0, r.stderr); return r.stdout; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
before(async () => {
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-tsa-fixture-'));
  study = sealStudy({schema: 1, id: 'LOCAL-TEST-ONLY', createdAt: new Date(Date.now() - 60000).toISOString(),
    informationCutoff: '2026-09-17T16:00:00+09:00', fixtureOnly: true, assets: [], policy: {alpha: 0.2}});
  trustRootPath = path.join(temp, 'LOCAL-TEST-ca.pem');
  const caKey = path.join(temp, 'LOCAL-TEST-ca.key'), signerKey = path.join(temp, 'LOCAL-TEST-tsa.key'),
    signerCSR = path.join(temp, 'LOCAL-TEST-tsa.csr'), signerCert = path.join(temp, 'LOCAL-TEST-tsa.pem'),
    ext = path.join(temp, 'extensions.cnf'), config = path.join(temp, 'tsa.cnf'), serial = path.join(temp, 'serial');
  openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', caKey, '-out', trustRootPath,
    '-subj', '/CN=ATLAS LOCAL FIXTURE ROOT NOT REAL AUTHORITY', '-days', '2', '-addext', 'basicConstraints=critical,CA:TRUE']);
  openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', signerKey, '-out', signerCSR,
    '-subj', '/CN=ATLAS LOCAL FIXTURE TIMESTAMP ONLY']);
  await fs.writeFile(ext, 'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=critical,timeStamping\n');
  openssl(['x509', '-req', '-in', signerCSR, '-CA', trustRootPath, '-CAkey', caKey, '-set_serial', '2', '-days', '2', '-extfile', ext, '-out', signerCert]);
  await fs.writeFile(serial, '01\n');
  await fs.writeFile(config, `[tsa]\ndefault_tsa = tsa_config\n[tsa_config]\nserial = ${serial}\nsigner_cert = ${signerCert}\nsigner_key = ${signerKey}\ncerts = ${trustRootPath}\nsigner_digest = sha256\ndefault_policy = 1.2.3.4.5\ndigests = sha256\naccuracy = secs:1\nordering = yes\ntsa_name = yes\ness_cert_id_chain = no\n`);
  const request = await prepareTimestampRequest(study, {directory: path.join(temp, 'request')});
  queryPath = request.queryPath; responsePath = path.join(temp, 'LOCAL-TEST-response.tsr');
  openssl(['ts', '-reply', '-config', config, '-queryfile', queryPath, '-out', responsePath]);
});
after(async () => { if (temp) await fs.rm(temp, {recursive: true, force: true}); });

test('request is SHA256-bound, nonce-bearing, pending and cannot overwrite previous request', async () => {
  const text = openssl(['ts', '-query', '-in', queryPath, '-text']);
  assert.match(text, /Hash Algorithm: sha256/); assert.match(text, /Nonce: 0x[0-9A-F]+/i);
  const metadata = JSON.parse(await fs.readFile(path.join(temp, 'request', 'request.json'), 'utf8'));
  assert.equal(metadata.status, 'EXTERNAL_TIMESTAMP_PENDING'); assert.equal(metadata.studyDigest, study.seal.digest);
  assert.equal(metadata.querySha256, sha(await fs.readFile(queryPath)));
  await assert.rejects(prepareTimestampRequest(study, {directory: path.join(temp, 'request')}), /EEXIST/);
});

test('LOCAL fixture proves verification implementation, never external authority or historical publication', async () => {
  const proof = await verifyTimestampProof({study, queryPath, responsePath, trustRootPath, fixtureOnly: true});
  assert.equal(proof.status, 'LOCAL_TEST_FIXTURE'); assert.equal(proof.authorityIdentityIndependentlyVerified, false);
  assert.equal(proof.studyDigest, study.seal.digest); assert.equal(proof.fixtureOnly, true);
  assert.equal(proof.responseSha256, sha(Buffer.from(proof.responseBase64, 'base64')));
  assert.ok(Date.parse(proof.timestamp) >= Date.parse(study.createdAt));
  const rechecked = await reverifyTimestampProof(study, proof, {trustRootPath, fixtureOnly: true});
  assert.equal(rechecked.id, proof.id);
});

test('invalid or independently resealed data cannot borrow another timestamp', async () => {
  const changed = structuredClone(study); changed.policy.alpha = 0.1;
  await assert.rejects(verifyTimestampProof({study: changed, queryPath, responsePath, trustRootPath}), /INVALID_STUDY_SEAL/);
  delete changed.seal; const resealed = sealStudy(changed);
  await assert.rejects(verifyTimestampProof({study: resealed, queryPath, responsePath, trustRootPath}), /OPENSSL/);
  await assert.rejects(verifyTimestampProof({study, queryPath, responsePath}), /EXPLICIT_TRUST_ROOT/);
  const differentRequest = await prepareTimestampRequest(study, {directory: path.join(temp, 'different-nonce')});
  await assert.rejects(verifyTimestampProof({study, queryPath: differentRequest.queryPath, responsePath, trustRootPath}), /OPENSSL/);
  const corrupted = path.join(temp, 'corrupted.tsr'); await fs.writeFile(corrupted, 'not-a-timestamp');
  await assert.rejects(verifyTimestampProof({study, queryPath, responsePath: corrupted, trustRootPath}), /OPENSSL/);
  const wrongRoot = path.join(temp, 'wrong-root.pem');
  openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(temp, 'wrong.key'), '-out', wrongRoot,
    '-subj', '/CN=WRONG LOCAL ROOT', '-days', '2']);
  await assert.rejects(verifyTimestampProof({study, queryPath, responsePath, trustRootPath: wrongRoot}), /OPENSSL/);
});

test('saved receipt status is not trusted: reverify bytes and explicitly supplied trust anchor', async () => {
  const proof = await verifyTimestampProof({study, queryPath, responsePath, trustRootPath, fixtureOnly: true});
  await assert.rejects(reverifyTimestampProof(study, {...proof, studyDigest: '0'.repeat(64)}, {trustRootPath}), /PROOF_STUDY_MISMATCH/);
  await assert.rejects(reverifyTimestampProof(study, {...proof, responseBase64: Buffer.from('bad').toString('base64')}, {trustRootPath}), /PROOF_BYTES_CHANGED/);
  await assert.rejects(reverifyTimestampProof(study, {...proof, trustRootSha256: '0'.repeat(64)}, {trustRootPath}), /PROOF_TRUST_ROOT_MISMATCH/);
});

test('timestamp cannot be backdated onto a study created after it', async () => {
  const future = structuredClone(study); delete future.seal; future.createdAt = new Date(Date.now() + 3600000).toISOString();
  await assert.rejects(verifyTimestampProof({study: sealStudy(future), queryPath, responsePath, trustRootPath}), /OPENSSL/);
});

test('network request requires configured allowlisted public HTTPS origin and no credentials', () => {
  for (const config of [{}, {url: 'https://tsa.company.com'}, {url: 'http://tsa.company.com', allowedOrigins: ['http://tsa.company.com']},
    {url: 'https://127.0.0.1', allowedOrigins: ['https://127.0.0.1']},
    {url: 'https://u:p@tsa.company.com', allowedOrigins: ['https://tsa.company.com']},
    {url: 'https://tsa.company.com', allowedOrigins: ['https://another.company.com']}]) assert.throws(() => validateTSAConfiguration(config));
  assert.equal(validateTSAConfiguration({url: 'https://tsa.company.com/timestamp', allowedOrigins: ['https://tsa.company.com']}).pathname, '/timestamp');
});

test('CLI help is offline and local fixtures cannot be attached to operating bundle', async () => {
  const cli = path.resolve('scripts/sealed_timestamp.mjs');
  const help = spawnSync(process.execPath, [cli, '--help'], {encoding: 'utf8'});
  assert.equal(help.status, 0); assert.match(help.stdout, /no default network request/);
  const proof = await verifyTimestampProof({study, queryPath, responsePath, trustRootPath, fixtureOnly: true});
  const proofPath = path.join(temp, 'fixture-proof.json'), bundlePath = path.join(temp, 'bundle.json');
  const original = JSON.stringify({sealedStudy: {studies: [study], proofs: []}});
  await fs.writeFile(proofPath, JSON.stringify(proof)); await fs.writeFile(bundlePath, original);
  const r = spawnSync(process.execPath, [cli, 'attach', '--bundle', bundlePath, '--proof', proofPath, '--trust-root', trustRootPath], {encoding: 'utf8'});
  assert.equal(r.status, 2); assert.match(r.stderr, /LOCAL_FIXTURE_CANNOT_BE_ATTACHED/);
  assert.equal(await fs.readFile(bundlePath, 'utf8'), original);
});
