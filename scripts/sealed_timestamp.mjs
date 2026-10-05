#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {prepareTimestampRequest, requestTimestamp, verifyTimestampProof, reverifyTimestampProof} from '../lib/timestamp-verifier.mjs';

const help = `ATLAS RFC3161 — explicit authority setup only; no default network request.
node scripts/sealed_timestamp.mjs prepare --study study.json --out NEW_DIRECTORY
node scripts/sealed_timestamp.mjs request --query DIRECTORY/request.tsq --response DIRECTORY/response.tsr --tsa-url https://YOUR-TSA/path --allow-origin https://YOUR-TSA
node scripts/sealed_timestamp.mjs verify --study study.json --query DIRECTORY/request.tsq --response DIRECTORY/response.tsr --trust-root independently-obtained-root.pem --out proof.json [--untrusted intermediate.pem]
node scripts/sealed_timestamp.mjs attach --bundle public/data/atlas.json --proof proof.json --trust-root independently-obtained-root.pem
--study may also be a bundle with sealedStudy.studies; select --study-id ID.
prepare/verify write new files only. attach reverifies raw proof bytes and appends
to proofs; it never rewrites a study. A local fixture is not an external authority.`;
async function main() {
  const [command, ...args] = process.argv.slice(2), options = {};
  if (!command || command === '--help') { process.stdout.write(help + '\n'); return; }
  const allowed = new Set(['study', 'study-id', 'out', 'query', 'response', 'trust-root', 'untrusted', 'tsa-url', 'allow-origin', 'bundle', 'proof']);
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i]?.startsWith('--') || !args[i + 1] || !allowed.has(args[i].slice(2)) || Object.hasOwn(options, args[i].slice(2))) throw Error('INVALID_CLI_ARGUMENT');
    options[args[i].slice(2)] = args[i + 1];
  }
  const required = key => { if (!options[key]) throw Error('MISSING_OPTION:' + key); return options[key]; };
  const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
  const select = raw => {
    if (raw?.seal && (!options['study-id'] || raw.id === options['study-id'])) return raw;
    const candidates = raw?.sealedStudy?.studies ?? [];
    const found = options['study-id'] ? candidates.find(s => s.id === options['study-id']) : candidates.length === 1 ? candidates[0] : null;
    if (!found) throw Error('EXPLICIT_VALID_STUDY_SELECTION_REQUIRED'); return found;
  };
  let result;
  if (command === 'prepare') result = await prepareTimestampRequest(select(await readJSON(required('study'))), {directory: required('out')});
  else if (command === 'request') result = await requestTimestamp({queryPath: required('query'), responsePath: required('response'),
    url: required('tsa-url'), allowedOrigins: [required('allow-origin')]});
  else if (command === 'verify') {
    result = await verifyTimestampProof({study: select(await readJSON(required('study'))), queryPath: required('query'), responsePath: required('response'),
      trustRootPath: required('trust-root'), untrustedPath: options.untrusted ?? null});
    await fs.writeFile(required('out'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
  } else if (command === 'attach') {
    const bundlePath = required('bundle'), original = await fs.readFile(bundlePath, 'utf8'), bundle = JSON.parse(original), proof = await readJSON(required('proof'));
    if (proof.fixtureOnly || proof.status === 'LOCAL_TEST_FIXTURE') throw Error('LOCAL_FIXTURE_CANNOT_BE_ATTACHED');
    const study = bundle.sealedStudy?.studies?.find(s => s.id === proof.studyId);
    if (!study) throw Error('PROOF_STUDY_NOT_FOUND');
    const checked = await reverifyTimestampProof(study, proof, {trustRootPath: required('trust-root')});
    bundle.sealedStudy.proofs ??= [];
    const old = bundle.sealedStudy.proofs.find(p => p.id === checked.id);
    if (old && (old.responseSha256 !== checked.responseSha256 || old.studyDigest !== checked.studyDigest)) throw Error('PROOF_ID_CONFLICT');
    if (!old) {
      bundle.sealedStudy.proofs.push(checked);
      if (await fs.readFile(bundlePath, 'utf8') !== original) throw Error('BUNDLE_CHANGED_RETRY_WITH_LATEST');
      const temp = path.join(path.dirname(bundlePath), path.basename(bundlePath) + '.proof-' + process.pid + '.tmp');
      await fs.writeFile(temp, JSON.stringify(bundle), {flag: 'wx'});
      if (await fs.readFile(bundlePath, 'utf8') !== original) { await fs.unlink(temp); throw Error('BUNDLE_CHANGED_RETRY_WITH_LATEST'); }
      await fs.rename(temp, bundlePath);
    }
    result = {status: old ? 'PROOF_ALREADY_ATTACHED' : 'PROOF_APPENDED', studyId: study.id, proofId: checked.id,
      authorityIdentityIndependentlyVerified: false};
  } else throw Error('UNKNOWN_COMMAND');
  // Raw cryptographic bytes are in saved files, never splashed onto the terminal.
  process.stdout.write(JSON.stringify({status: result.status, studyId: result.studyId ?? null, studyDigest: result.studyDigest ?? null,
    timestamp: result.timestamp ?? null, queryPath: result.queryPath ?? null, proofId: result.proofId ?? result.id ?? null,
    authorityIdentityIndependentlyVerified: result.authorityIdentityIndependentlyVerified ?? false}, null, 2) + '\n');
}
main().catch(error => { process.stderr.write('Timestamp operation failed: ' + (error.code ?? error.message) + '\n'); process.exitCode = 2; });
