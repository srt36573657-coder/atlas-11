// 쉬운 말(규칙 48) — 사장님 2026-10-09 22:40(마카오 시각) 「아이큐 92 남자 고등학생이 이해하고 공감가며 사용할수 있도록 … 글은 참쉽게 … 교차 검증을 100만번」
//   쉬운 말 셈(site/app/easy.js)과 사전(site/app/easy-ko.js)의 약속 — 숫자 · 날짜 · 이름은 그대로 · 조사는 받침에 맞춤 · 낱말 안은 바꾸지 않음 · 두 번 바꿔도 같음 · 어려운 말 0
//   전체(1,000,000번)는 node scripts/atlas11/verify/easy_million.mjs → reports/atlas11/verify/easy-million-latest.json
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ez, hardLeft, addEasyNames, josaFor, finalOf, easyTemplateOf} from '../../site/app/easy.js';
import {WORDS, TPL, WHAT, HARD} from '../../site/app/easy-ko.js';

const ROOT = path.resolve(import.meta.dirname, '../..');

test('쉬운 말 — 자주 보이는 말 · 조사 맞춤 · 숫자 그대로', () => {
  const cases = [
    ['10월 8일(목) 15:30 종가', '10월 8일(목) 15:30 마감 가격'],
    ['종가는 15:30', '마감 가격은 15:30'],
    ['기준선이 높다', '커트라인이 높다'],
    ['공시를 봄', '회사 발표를 봄'],
    ['20거래일 ▼ −20.8%', '20영업일 ▼ −20.8%'],
    ['코스피 대비 −15.5%p', '코스피에 비해 −15.5%포인트'],
    ['수급 · 외국인 −95,151주 · 기관 +128,572주 · 5거래일 순매수 주식 수(공식 값)', '누가 사고팔았나 · 외국인 −95,151주 · 기관 +128,572주 · 5영업일 더 산 주식 수(공식 값)'],
    ['그물 57곳 · 물 위로 막 올라온 7곳', '명단 57곳 · 그 가운데 막 들어온 7곳'],
    ['어떤 조건에서 진입을 검토하는가?', '어떤 조건이면 살지 따져 보나?'],
    ['16:50 KST', '16:50 한국 시각'],
  ];
  for (const [a, b] of cases) assert.equal(ez(a), b, a);
});

test('쉬운 말 — 낱말 안 · 이름은 바꾸지 않음(「종가집」 · 「추세선」 · 회사 이름 안의 말)', () => {
  assert.equal(ez('종가집 김치'), '종가집 김치');
  assert.equal(ez('추세선을 그림'), '추세선을 그림');
  addEasyNames(['종가식품', '증권']);
  assert.equal(ez('종가식품 종가'), '종가식품 마감 가격');
  assert.equal(ez('증권사 추정치'), '증권사가 어림한 숫자'); // 「증권」(업종 이름)이 「증권사」 안에 있어도 이름 자리가 아님
});

test('쉬운 말 — 조사: 받침 · ㄹ 받침(으로/로) · 숫자 끝 · 괄호 끝', () => {
  assert.equal(josaFor('마감 가격', '은', '는'), '은');
  assert.equal(josaFor('회사 발표', '이', '가'), '가');
  assert.equal(josaFor('영업일', '으로', '로'), '로');
  assert.equal(josaFor('커트라인', '으로', '로'), '으로');
  assert.equal(josaFor('마감 가격(종가)', '을', '를'), '을');
  assert.deepEqual(finalOf('20'), {b: true, l: false}); // 이십
  assert.deepEqual(finalOf('5'), {b: false, l: false}); // 오
  assert.deepEqual(finalOf('7'), {b: true, l: true});
});

test('쉬운 말 — 사전: 두 번 바꿔도 같음 · 어려운 말이 쉬운 말 안에 없음 · 어려운 말은 모두 바꿀 길이 있음', () => {
  for (const [k, v] of WORDS) { assert.equal(ez(v), v, `「${k}」 → 「${v}」 를 다시 바꿈`); assert.deepEqual(hardLeft(v), [], `「${v}」 안에 어려운 말`); }
  for (const h of HARD) { const s = h.startsWith('%') ? '3' + h : h; assert.deepEqual(hardLeft(ez(s)), [], `어려운 말 「${h}」을 바꿀 길이 없음`); }
});

test('쉬운 말 — 틀: 값 자리({n} {d} {t} {e} {q}) 수가 같고 · 열쇠가 실제 글에서 나옴', () => {
  const fillK = k => k.replace(/\{n\}/g, '12').replace(/\{d\}/g, '10월 8일(목)').replace(/\{t\}/g, '15:30').replace(/\{q\}/g, '「가격」').replace(/\{e\}/g, 'NHN');
  addEasyNames(['NHN']);
  for (const [k, v] of Object.entries(TPL)) {
    for (const c of ['n', 'd', 't', 'e', 'q']) assert.equal((k.match(new RegExp(`\\{${c}\\}`, 'g')) ?? []).length, (v.match(new RegExp(`\\{${c}\\}`, 'g')) ?? []).length, `틀 「${k}」 의 {${c}} 수`);
    const s = fillK(k); assert.ok(easyTemplateOf(s).key === k || easyTemplateOf(s, {noEnt: true}).key === k, `틀 열쇠 「${k}」 가 실제 글에서 나오지 않음(${easyTemplateOf(s).key})`);
  }
});

test('쉬운 말 — 「이 화면은?」: 모든 화면(app.js 길 이름)에 한 줄 · 30자 안 · 어려운 말 없음', async () => {
  const app = await fs.readFile(path.join(ROOT, 'site/app/app.js'), 'utf8');
  const ids = [...app.matchAll(/\{id: '([a-z]+)', tab:/g)].map(m => m[1]);
  assert.ok(ids.length >= 20, `길 ${ids.length}개`);
  for (const id of ids) { assert.ok(WHAT[id], `「${id}」 화면의 「이 화면은?」 없음`); assert.ok(WHAT[id].length <= 30, `「${id}」 ${WHAT[id].length}자`); assert.deepEqual(hardLeft(WHAT[id]), []); }
});

test('쉬운 말 — 맞대기 12만 번(씨앗 고정) 실패 0', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'easy-')), out = path.join(dir, 'e.json');
  await promisify(execFile)(process.execPath, ['scripts/atlas11/verify/easy_million.mjs', '--target', '120000', '--out', out], {cwd: ROOT, maxBuffer: 1e7}).catch(e => e);
  const r = JSON.parse(await fs.readFile(out, 'utf8'));
  assert.equal(r.failed, 0, JSON.stringify(r.fails?.slice(0, 3)));
  assert.ok(r.checks >= 120000 && r.strings > 1000, `맞댄 수 ${r.checks} · 무작위 글 ${r.strings}`);
  for (const k of ['무작위 · 쉬운 말 = 따로 만든 답(낱말 · 조사까지 글자 하나 같음)', '무작위 · 숫자 모음이 같음(빠짐 · 바뀜 0)', '틀 · 쉬운 말 = 틀의 쉬운 말에 같은 값']) assert.ok(r.perKind[k] > 0, k);
  await fs.rm(dir, {recursive: true, force: true});
});
