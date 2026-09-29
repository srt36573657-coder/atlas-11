import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {canonicalSealJSON, studyManifestJSON, sealStudy, verifyStudySeal} from '../lib/sealed-manifest.mjs';

const example = () => ({schema: 1, id: 'fixture-study', createdAt: '2026-09-28T00:00:00Z',
  origin: '2026-09-17', end: '2026-10-30', informationCutoff: '2026-09-17T16:00:00+09:00',
  policy: {width: 'same', alpha: 0.2, tolerance: null}, provenance: {inputDigest: 'abc', model: 'fixture'},
  assets: [{code: '005930', rows: [{date: '2026-09-18', a: {price: 100}, b: {price: null}}]}]});

test('seal uses strict canonical UTF-8 SHA256 checked against Node and does not mutate source', () => {
  const original = example(), copy = structuredClone(original), sealed = sealStudy(original);
  assert.deepEqual(original, copy); assert.equal(Object.hasOwn(original, 'seal'), false);
  assert.equal(sealed.seal.digest, createHash('sha256').update(studyManifestJSON(original)).digest('hex'));
  assert.equal(verifyStudySeal(sealed).valid, true);
  assert.equal(sealed.seal.externalTimestamp.status, 'PENDING');
  original.assets[0].rows[0].a.price = 300; assert.equal(sealed.assets[0].rows[0].a.price, 100);
  assert.throws(() => sealStudy(sealed), /ALREADY_SEALED/);
});

test('key order is canonical but path order, identity, policy, provenance and all prices are protected', () => {
  const original = example(), reversed = Object.fromEntries(Object.entries(original).reverse());
  assert.equal(sealStudy(original).seal.digest, sealStudy(reversed).seal.digest);
  const changes = [s => s.id += '-changed', s => s.createdAt = '2026-09-17T00:00:00Z',
    s => s.informationCutoff = '2026-09-20T00:00:00Z', s => s.policy.alpha = 0.1,
    s => s.provenance.inputDigest = 'different', s => s.assets[0].rows[0].a.price = 101,
    s => s.assets[0].rows[0].b.price = 0, s => s.assets[0].code = '000660',
    s => s.assets.push({...s.assets[0]}), s => s.unknownNewMetadata = {trusted: true}];
  for (const mutate of changes) { const s = sealStudy(original); mutate(s); assert.equal(verifyStudySeal(s).valid, false); }
});

test('external status or seal time changes cannot masquerade as verified local content', () => {
  for (const mutate of [s => s.seal.externalTimestamp.status = 'VERIFIED', s => s.seal.sealedAt = '2026-09-17T00:00:00Z',
    s => s.seal.extra = true, s => s.seal.algorithm = 'MD5', s => s.seal.digest = '0'.repeat(64)]) {
    const sealed = sealStudy(example()); mutate(sealed); assert.equal(verifyStudySeal(sealed).valid, false);
  }
});

test('explicit null is unavailable while NaN, infinity and undefined are rejected rather than erased', () => {
  for (const value of [NaN, Infinity, -Infinity, undefined, BigInt(2), Symbol('x'), () => 0, new Date(), /x/]) {
    const source = example(); source.policy.invalid = value;
    assert.throws(() => sealStudy(source)); assert.equal(verifyStudySeal({...source, seal: {}}).valid, false);
  }
  assert.equal(canonicalSealJSON({absent: null, zero: 0}), '{"absent":null,"zero":0}');
});

test('cycles, sparse arrays, accessors, hidden keys, symbols and implicit toJSON are rejected', () => {
  const cyclic = {}; cyclic.self = cyclic;
  const getter = {}; Object.defineProperty(getter, 'x', {enumerable: true, get() { throw Error('MUST_NOT_EXECUTE'); }});
  const hidden = {}; Object.defineProperty(hidden, 'x', {value: 1});
  const symbol = {[Symbol('secret')]: 1};
  const extraArray = [1]; extraArray.note = 'hidden-by-json';
  for (const value of [cyclic, Array(2), getter, hidden, symbol, extraArray, {toJSON() { return null; }}]) assert.throws(() => canonicalSealJSON(value));
  assert.throws(() => canonicalSealJSON(getter), /MANIFEST_ACCESSOR/);
});

test('portable canonical SHA256 matches Unicode and reordered nested object reference cases', () => {
  for (let n = 0; n < 128; n++) {
    const source = {...example(), policy: {n, korean: '봉인 · 아틀라스', emoji: '📈', nested: {z: n / 7, a: null}}};
    const sealed = sealStudy(source);
    assert.equal(sealed.seal.digest, createHash('sha256').update(studyManifestJSON(source)).digest('hex'));
  }
});
