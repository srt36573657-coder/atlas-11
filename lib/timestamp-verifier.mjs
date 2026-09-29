// Node-only RFC3161 adapter. No browser/service import and no built-in authority.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {request as httpsRequest} from 'node:https';
import {lookup as dnsLookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {canonicalSourceURL, isPublicAddress} from './news-collection52.mjs';
import {verifyStudySeal, studyManifestJSON} from './sealed-manifest.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const failure = reason => Object.assign(new Error(reason), {code: reason});
const iso = value => {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  if (!Number.isFinite(date.getTime())) throw failure('INVALID_VERIFICATION_TIME');
  return date.toISOString();
};
function execute(args) {
  const result = spawnSync('openssl', args, {encoding: 'utf8', timeout: 20000, maxBuffer: 2 * 1024 * 1024, shell: false});
  if (result.error || result.status !== 0) throw failure('OPENSSL_TIMESTAMP_OPERATION_FAILED');
  return result.stdout;
}
async function boundedRead(file, limit = 2 * 1024 * 1024) {
  const stat = await fs.stat(file);
  if (!stat.isFile() || stat.size === 0 || stat.size > limit) throw failure('INVALID_TIMESTAMP_FILE_SIZE');
  const bytes = await fs.readFile(file);
  if (!bytes.length || bytes.length > limit) throw failure('INVALID_TIMESTAMP_FILE_SIZE');
  return bytes;
}
function requireSeal(study) {
  const verification = verifyStudySeal(study);
  if (!verification.valid) throw failure('INVALID_STUDY_SEAL:' + verification.reason);
  return verification.digest;
}

export async function prepareTimestampRequest(study, {directory, now = new Date()} = {}) {
  const digest = requireSeal(study), createdAt = iso(now);
  if (!directory) throw failure('TIMESTAMP_DIRECTORY_REQUIRED');
  // An existing request is never silently replaced. A fresh directory is required.
  await fs.mkdir(directory, {recursive: false});
  const queryPath = path.join(directory, 'request.tsq');
  await fs.writeFile(path.join(directory, 'manifest.json'), studyManifestJSON(study), {flag: 'wx'});
  execute(['ts', '-query', '-digest', digest, '-sha256', '-cert', '-out', queryPath]);
  const query = await boundedRead(queryPath);
  const record = {schema: 1, studyId: study.id, studyDigest: digest, digestAlgorithm: 'SHA-256',
    status: 'EXTERNAL_TIMESTAMP_PENDING', createdAt, querySha256: hash(query),
    queryBase64: query.toString('base64'), reason: 'NO_CONFIGURED_AUTHORITY_RESPONSE',
    meaning: 'Local query creation does not prove external time or historical publication.'};
  await fs.writeFile(path.join(directory, 'request.json'), JSON.stringify(record, null, 2) + '\n', {flag: 'wx'});
  return {...record, queryPath};
}

export function validateTSAConfiguration({url, allowedOrigins} = {}) {
  if (!url || !Array.isArray(allowedOrigins) || !allowedOrigins.length) throw failure('EXPLICIT_TSA_CONFIGURATION_REQUIRED');
  const normalized = canonicalSourceURL(url), parsed = new URL(normalized);
  if (parsed.protocol !== 'https:' || !allowedOrigins.includes(parsed.origin)) throw failure('TSA_ORIGIN_NOT_ALLOWED');
  return parsed;
}

/** Explicit opt-in POST; no redirect, retries, authority guessing or access bypass. */
export async function requestTimestamp({queryPath, responsePath, url, allowedOrigins, timeoutMs = 15000} = {}) {
  const endpoint = validateTSAConfiguration({url, allowedOrigins});
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 60000) throw failure('INVALID_TSA_TIMEOUT');
  const query = await boundedRead(queryPath, 65536);
  const response = await new Promise((resolve, reject) => {
    const req = httpsRequest(endpoint, {method: 'POST', agent: false, autoSelectFamily: false,
      signal: AbortSignal.timeout(timeoutMs),
      headers: {'content-type': 'application/timestamp-query', 'accept': 'application/timestamp-reply', 'content-length': query.length},
      lookup(host, options, callback) {
        dnsLookup(host, {all: true, verbatim: true}).then(answers => {
          if (!answers.length || answers.some(a => !isPublicAddress(a.address))) throw failure('NON_PUBLIC_TSA_DNS');
          if (options?.all) callback(null, answers);
          else callback(null, answers[0].address, answers[0].family || isIP(answers[0].address));
        }).catch(callback);
      },
    }, res => {
      if (res.statusCode !== 200 || !/^application\/timestamp-reply(?:;|$)/i.test(res.headers['content-type'] ?? '')) {
        res.resume(); reject(failure('TSA_INVALID_HTTP_RESPONSE')); return;
      }
      const chunks = []; let size = 0;
      res.on('data', chunk => { size += chunk.length; if (size > 2 * 1024 * 1024) res.destroy(failure('TSA_RESPONSE_TOO_LARGE')); else chunks.push(chunk); });
      res.on('error', reject);
      res.on('end', () => size ? resolve(Buffer.concat(chunks)) : reject(failure('EMPTY_TSA_RESPONSE')));
    });
    req.on('error', reject); req.end(query);
  });
  await fs.writeFile(responsePath, response, {flag: 'wx'});
  return {status: 'RESPONSE_RECEIVED_UNVERIFIED', endpoint: endpoint.origin + endpoint.pathname,
    responsePath, responseSha256: hash(response), receivedAt: new Date().toISOString()};
}

/** A trust anchor is always supplied by the caller, never extracted from the
 * response and declared trusted. Both nonce/query binding and manifest digest
 * are checked. This does not independently establish the authority's identity. */
export async function verifyTimestampProof({study, queryPath, responsePath, trustRootPath, untrustedPath = null,
  fixtureOnly = false, now = new Date()} = {}) {
  const digest = requireSeal(study), verifiedAt = iso(now);
  fixtureOnly = fixtureOnly || study.fixtureOnly === true;
  if (!trustRootPath) throw failure('EXPLICIT_TRUST_ROOT_REQUIRED');
  const [query, response, trustRoot, chain] = await Promise.all([
    boundedRead(queryPath, 65536), boundedRead(responsePath), boundedRead(trustRootPath),
    untrustedPath ? boundedRead(untrustedPath) : null,
  ]);
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-rfc3161-'));
  try {
    // Snapshot inputs once; later filesystem changes cannot alter verified bytes.
    const queryFile = path.join(temp, 'request.tsq'), responseFile = path.join(temp, 'response.tsr'),
      rootFile = path.join(temp, 'root.pem'), chainFile = path.join(temp, 'chain.pem'), emptyCAPath = path.join(temp, 'empty');
    await fs.mkdir(emptyCAPath);
    await Promise.all([fs.writeFile(queryFile, query), fs.writeFile(responseFile, response), fs.writeFile(rootFile, trustRoot),
      ...(chain ? [fs.writeFile(chainFile, chain)] : [])]);
    const verification = ['ts', '-verify', '-in', responseFile, '-CAfile', rootFile, '-CApath', emptyCAPath,
      ...(chain ? ['-untrusted', chainFile] : [])];
    execute([...verification, '-queryfile', queryFile]);
    execute([...verification, '-digest', digest]);
    const tokenText = execute(['ts', '-reply', '-in', responseFile, '-text']);
    const timestampText = tokenText.match(/^Time stamp:\s*(.+)$/m)?.[1];
    const timestamp = timestampText ? Date.parse(timestampText) : NaN;
    if (!Number.isFinite(timestamp)) throw failure('INVALID_RFC3161_TIMESTAMP');
    if (timestamp > Date.parse(verifiedAt) + 5 * 60000) throw failure('FUTURE_RFC3161_TIMESTAMP');
    // OpenSSL's human rendering may expose only whole seconds; permit that
    // sub-second representation loss, never a historical-day backdate.
    if (timestamp + 1000 < Date.parse(study.createdAt)) throw failure('TIMESTAMP_PRECEDES_STUDY_CREATION');
    const proof = {schema: 1, studyId: study.id, studyDigest: digest, type: 'RFC3161',
      status: fixtureOnly ? 'LOCAL_TEST_FIXTURE' : 'VERIFIED_AGAINST_PROVIDED_ROOT',
      verificationMethod: 'OPENSSL_QUERY_NONCE_AND_SHA256_CHAIN', verifiedAt,
      timestamp: new Date(timestamp).toISOString(), fixtureOnly,
      creationTimeComparisonToleranceMs: 1000,
      trustBasis: 'EXPLICIT_CALLER_PROVIDED_ROOT', authorityIdentityIndependentlyVerified: false,
      studyInformationCutoff: study.informationCutoff ?? null,
      querySha256: hash(query), responseSha256: hash(response), trustRootSha256: hash(trustRoot),
      queryBase64: query.toString('base64'), responseBase64: response.toString('base64'),
      trustRootBase64: trustRoot.toString('base64'), untrustedChainBase64: chain?.toString('base64') ?? null,
      opensslVersion: execute(['version']).trim(),
      meaning: 'Signature and time verify under the supplied trust root; this is not proof of past issuance, price truth or forecasting accuracy.'};
    proof.id = 'rfc3161-' + hash(JSON.stringify({studyId: proof.studyId, digest, responseSha256: proof.responseSha256,
      trustRootSha256: proof.trustRootSha256})).slice(0, 24);
    return proof;
  } finally { await fs.rm(temp, {recursive: true, force: true}); }
}

/** Reverify embedded raw bytes before accepting a saved proof. Boolean flags and
 * copied JSON status fields alone are never sufficient. Trust root is external. */
export async function reverifyTimestampProof(study, proof, {trustRootPath, fixtureOnly = false, now = new Date()} = {}) {
  if (proof?.studyDigest !== requireSeal(study) || proof.studyId !== study.id) throw failure('PROOF_STUDY_MISMATCH');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(proof.queryBase64 ?? '') || !/^[A-Za-z0-9+/]+={0,2}$/.test(proof.responseBase64 ?? ''))
    throw failure('INVALID_PROOF_ENCODING');
  const query = Buffer.from(proof.queryBase64, 'base64'), response = Buffer.from(proof.responseBase64, 'base64');
  if (hash(query) !== proof.querySha256 || hash(response) !== proof.responseSha256) throw failure('PROOF_BYTES_CHANGED');
  const root = await boundedRead(trustRootPath);
  if (hash(root) !== proof.trustRootSha256) throw failure('PROOF_TRUST_ROOT_MISMATCH');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-proof-recheck-'));
  try {
    const queryPath = path.join(temp, 'request.tsq'), responsePath = path.join(temp, 'response.tsr');
    await Promise.all([fs.writeFile(queryPath, query), fs.writeFile(responsePath, response)]);
    let untrustedPath = null;
    if (proof.untrustedChainBase64) { untrustedPath = path.join(temp, 'chain.pem'); await fs.writeFile(untrustedPath, Buffer.from(proof.untrustedChainBase64, 'base64')); }
    return await verifyTimestampProof({study, queryPath, responsePath, trustRootPath, untrustedPath, fixtureOnly, now});
  } finally { await fs.rm(temp, {recursive: true, force: true}); }
}
