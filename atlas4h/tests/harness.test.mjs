/**
 * 하네스 검사(check_harness.mjs)가 제 일을 하는지 — 심은 흠을 잡는지 본다.
 *   node --test 'atlas4h/tests/*.test.mjs'
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {checkPasslist, checkLock, specLines, checkHarness} from '../scripts/check_harness.mjs';

const spec = specLines();
const fresh = () => ({items: spec.map(s => ({id: s.id, group: '', text: s.text, how: s.how, status: '안 통과', changedBy: null, evaluatorCommit: null, evidence: null}))});
const evalSubject = c => (c === 'eva1234' ? 'atlas4h EVAL: T5 통과' : c === 'bad1234' ? 'atlas4h 7: engine' : null);

test('사양 줄은 T1~T23·K1~K7 서른 줄', () => {
  assert.equal(spec.length, 30);
  assert.equal(spec[0].id, 'T1');
  assert.equal(spec.at(-1).id, 'K7');
});

test('깨끗한 통과 목록은 문제 0', () => {
  assert.deepEqual(checkPasslist(fresh(), spec, evalSubject), []);
});

test('평가 일꾼이 근거와 함께 표시한 통과는 받아들인다', () => {
  const d = fresh(); Object.assign(d.items[4], {status: '통과', changedBy: '평가 일꾼', evaluatorCommit: 'eva1234', evidence: 'spec-latest.json T5 · 판 12개'});
  assert.deepEqual(checkPasslist(d, spec, evalSubject), []);
});

test('흠 1 · 짓는 일꾼이 통과를 표시하면 잡는다', () => {
  const d = fresh(); Object.assign(d.items[4], {status: '통과', changedBy: '고리 일꾼', evaluatorCommit: 'bad1234', evidence: 'x'});
  const p = checkPasslist(d, spec, evalSubject);
  assert.ok(p.some(x => x.startsWith('H3 T5 통과를 평가 일꾼이 아닌')));
  assert.ok(p.some(x => x.startsWith('H3 T5 통과 표시 커밋이')));
});

test('흠 2 · 근거 없는 통과를 잡는다', () => {
  const d = fresh(); Object.assign(d.items[4], {status: '통과', changedBy: '평가 일꾼', evaluatorCommit: 'eva1234', evidence: null});
  assert.ok(checkPasslist(d, spec, evalSubject).some(x => x.startsWith('H3 T5 통과 근거 없음')));
});

test('흠 3 · 시험 글을 고치면 잡는다', () => {
  const d = fresh(); d.items[12].text = '80% 덮음 60~95%';
  assert.ok(checkPasslist(d, spec, evalSubject).some(x => x.startsWith('H2 T13 글이')));
});

test('흠 4 · 줄을 빼면 잡는다', () => {
  const d = fresh(); d.items.splice(22, 1);
  assert.ok(checkPasslist(d, spec, evalSubject).some(x => x.startsWith('H2 줄 번호')));
});

test('흠 5 · 이상한 상태를 잡는다', () => {
  const d = fresh(); d.items[0].status = '거의 통과';
  assert.ok(checkPasslist(d, spec, evalSubject).some(x => x.startsWith('H2 T1 상태')));
});

test('잠금: 같으면 0 · 고침·지움·더함을 모두 잡는다', () => {
  const lock = {files: {'a.test.mjs': '1', 'b.mjs': '2'}};
  assert.deepEqual(checkLock(lock, {'a.test.mjs': '1', 'b.mjs': '2'}), []);
  assert.ok(checkLock(lock, {'a.test.mjs': '9', 'b.mjs': '2'})[0].startsWith('H4 시험 파일이 바뀜'));
  assert.ok(checkLock(lock, {'a.test.mjs': '1'})[0].startsWith('H4 시험 파일이 없어짐'));
  assert.ok(checkLock(lock, {'a.test.mjs': '1', 'b.mjs': '2', 'c.test.mjs': '3'})[0].startsWith('H4 잠금에 없는'));
});

test('지금 저장소의 하네스는 어긋남 0', () => {
  const r = checkHarness();
  const bad = r.checks.filter(c => !c.ok);
  assert.deepEqual(bad.map(c => `${c.id}: ${c.problems.join(' / ')}`), []);
});
