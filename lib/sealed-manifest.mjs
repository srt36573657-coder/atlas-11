import {sha256} from './cycle-math.mjs';

export const SEAL_CANONICALIZATION = 'atlas-canonical-json-v1';
const plain = value => value !== null && typeof value === 'object' &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const fail = reason => { throw new Error(reason); };

/** Strict JSON, sorted object keys, original array order. Undefined, NaN, cycles,
 * accessors and objects with implicit serialization are rejected, never silently
 * transformed into null or dropped. Explicit null remains the unavailable value. */
export function canonicalSealJSON(value) {
  const active = new Set();
  function walk(item, depth) {
    if (depth > 128) fail('MANIFEST_TOO_DEEP');
    if (item === null || typeof item === 'boolean' || typeof item === 'string') return JSON.stringify(item);
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) fail('NON_FINITE_MANIFEST_NUMBER');
      return JSON.stringify(item);
    }
    if (typeof item !== 'object') fail('NON_JSON_MANIFEST_VALUE');
    if (active.has(item)) fail('CYCLIC_MANIFEST');
    if (!Array.isArray(item) && !plain(item)) fail('NON_PLAIN_MANIFEST_OBJECT');
    if (Object.getOwnPropertySymbols(item).length) fail('SYMBOL_MANIFEST_KEY');
    active.add(item);
    const keys = Object.getOwnPropertyNames(item);
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (!('value' in descriptor)) fail('MANIFEST_ACCESSOR');
      if (!descriptor.enumerable && !(Array.isArray(item) && key === 'length')) fail('HIDDEN_MANIFEST_VALUE');
    }
    let text;
    if (Array.isArray(item)) {
      if (keys.length !== item.length + 1 || keys.some(k => k !== 'length' && !/^(0|[1-9]\d*)$/.test(k))) fail('NON_JSON_MANIFEST_ARRAY');
      text = '[' + Array.from({length: item.length}, (_, i) => {
        if (!Object.hasOwn(item, i)) fail('SPARSE_MANIFEST_ARRAY');
        return walk(item[i], depth + 1);
      }).join(',') + ']';
    } else {
      text = '{' + keys.sort().map(key => JSON.stringify(key) + ':' + walk(item[key], depth + 1)).join(',') + '}';
    }
    active.delete(item);
    return text;
  }
  return walk(value, 0);
}

function payload(study) {
  // Validate before copying so a getter, hidden property or NaN cannot disappear.
  canonicalSealJSON(study);
  if (!plain(study) || study.schema !== 1 || typeof study.id !== 'string' || !study.id ||
      typeof study.createdAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(study.createdAt) || !Number.isFinite(Date.parse(study.createdAt)))
    fail('INVALID_STUDY_IDENTITY');
  return Object.fromEntries(Object.entries(study).filter(([key]) => key !== 'seal'));
}

export function studyManifestJSON(study) { return canonicalSealJSON(payload(study)); }
export function studyDigest(study) { return sha256(studyManifestJSON(study)); }

/** Creates a local content seal only. It never asserts an external timestamp. */
export function sealStudy(study) {
  if (Object.hasOwn(study, 'seal')) fail('ALREADY_SEALED_CREATE_NEW_STUDY');
  const text = studyManifestJSON(study), copy = JSON.parse(text);
  return {...copy, seal: {schema: 1, algorithm: 'SHA-256', canonicalization: SEAL_CANONICALIZATION,
    digest: sha256(text), sealedAt: study.createdAt,
    externalTimestamp: {status: 'PENDING', reason: 'EXTERNAL_TIMESTAMP_NOT_OBTAINED'}}};
}

export function verifyStudySeal(study) {
  let digest = null;
  try {
    digest = studyDigest(study);
    const seal = study.seal;
    if (!plain(seal) || seal.schema !== 1 || seal.algorithm !== 'SHA-256' ||
        seal.canonicalization !== SEAL_CANONICALIZATION || !/^[a-f0-9]{64}$/.test(seal.digest ?? ''))
      return {valid: false, digest, reason: 'INVALID_OR_MISSING_SEAL'};
    if (seal.sealedAt !== study.createdAt) return {valid: false, digest, reason: 'SEAL_TIME_MISMATCH'};
    // External evidence belongs in append-only proofs, outside the frozen study.
    const expected = {schema: 1, algorithm: 'SHA-256', canonicalization: SEAL_CANONICALIZATION,
      digest: seal.digest, sealedAt: study.createdAt,
      externalTimestamp: {status: 'PENDING', reason: 'EXTERNAL_TIMESTAMP_NOT_OBTAINED'}};
    if (canonicalSealJSON(seal) !== canonicalSealJSON(expected)) return {valid: false, digest, reason: 'SEAL_METADATA_CHANGED'};
    return seal.digest === digest ? {valid: true, digest} : {valid: false, digest, reason: 'MANIFEST_DIGEST_MISMATCH'};
  } catch (error) { return {valid: false, digest, reason: error.message}; }
}
