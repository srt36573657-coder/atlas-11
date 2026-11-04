// 수르 두 길(/su/) 자료 고르기 시험 — 주문 2049(사장님 2026-11-03 15:49(+04) · docs/design/su-two-2026-11-03/order-2049.txt)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, whyOf, reasonsFor, idxLine, coLine, indRows, forwardTo, jo, w5hCo, w5hInd, w5hRec, say5} from '../../site/su/su-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SAY = ['그날 몸값이 큰 쪽 위 20% 회사예요', '업종이 한 달 동안 시장보다 15% 넘게 더 올랐어요', '회사는 아직 싹이에요'];

test('숫자 말 — 퍼센트 · 더 덜 · 날짜', () => {
  assert.equal(pct(31.93), '+31.9%');
  assert.equal(pct(-5.67), '−5.7%');
  assert.equal(pct(0.02), '0.0%');
  assert.equal(pct(NaN), '?');
  assert.equal(moreLess(8.87), '8.9% 더');
  assert.equal(moreLess(-32.15), '32% 덜');
  assert.equal(moreLess(17.49), '17% 더');
  assert.equal(dateKo('2026-11-03'), '11월 3일');
  assert.equal(dateKo('x'), '?');
});

test('꽃이 될 회사 — 고른 날 · 빈 날(가까운 곳 · 섞지 않음) · 아무것도 없음', () => {
  const pick = bloomList({today: {rule: {say: SAY}, inds: [{n: '반도체', co: [['000660', 'SK하이닉스', 0, 1], ['bad', '나쁜 줄']]}]}, honest: {rate: 33.1, base: 24.38, n: 1580, hits: 523}, near: {today: [['127120', '제이에스링크', '바이오', 8.87, -32]]}});
  assert.equal(pick.mode, 'pick');
  assert.deepEqual(pick.rows, [{code: '000660', name: 'SK하이닉스', ind: '반도체'}]); // 번호가 아닌 줄은 뺌 · 고른 날에는 가까운 곳을 섞지 않음
  assert.deepEqual(pick.rec, {rate: 33, base: 24, n: 1580, hits: 523});
  const near = bloomList({today: {rule: {say: SAY}, inds: []}, honest: {rate: 33.1, base: 24.38}, near: {rule: {atom: 'ix4', min: 15, say: SAY[1]}, today: [['127120', '제이에스링크', '바이오 도구·서비스', 8.87, -32.15], ['032830', '삼성생명', '보험', 8.01, 3.56]], rec: {n: 132, hits: 21, rate: 15.91, base: 26.21}}});
  assert.equal(near.mode, 'near');
  assert.equal(near.rows.length, 2);
  assert.equal(near.rows[0].ix, 8.87);
  assert.equal(near.miss, SAY[1]);
  assert.deepEqual(near.rec, {rate: 16, base: 26, n: 132, hits: 21}); // 빈 날에는 가까운 회사 기록(아무 회사 26번)
  const none = bloomList({today: {inds: []}});
  assert.equal(none.mode, 'none');
  assert.deepEqual(none.rows, []);
  assert.equal(bloomList(null).mode, 'none');
});

test('돈이 몰린 회사 — 한 달 앞선 업종 셋의 대장 회사 · 까닭 한 줄과 켜진 까닭만', () => {
  const TH = {inds: [
    {n: '음료', x: 15.1, lead: ['000080', '하이트진로', 1]}, {n: '항공', x: 17.5, lead: ['180640', '한진칼', 1]}, {n: '물류·운송', x: 11.2, lead: ['002320', '한진', 1]},
    {n: '보험', x: 8.0, lead: ['032830', '삼성생명', 1]}, {n: '반도체', x: -16, lead: ['005930', '삼성전자', 1]}, {n: '빈 대장', x: 30, lead: null}]};
  const W = {inds: [{n: '항공', why: {ko: ['외국인과 기관이 샀고,', '한진칼이 끌었어요.']}, items: [{k: 1, s: 'on', ko: {t: '외국인이 샀어요.', sub: '대한항공'}}, {k: 3, s: 'off', ko: {t: '개인은 팔았어요.'}}]}]};
  const mo = moneyList(TH, W);
  assert.deepEqual(mo.map(r => r.name), ['한진칼', '하이트진로', '한진']); // x 큰 차례 셋 · 대장이 없는 업종은 뺌
  assert.equal(mo[0].why.line, '외국인과 기관이 샀고, 한진칼이 끌었어요.');
  assert.deepEqual(mo[0].why.items, [{k: 1, t: '외국인이 샀어요.', sub: '대한항공'}]); // 꺼진 까닭(개인 팖)은 뺌
  assert.equal(mo[1].why, null);
  assert.equal(whyOf(W, '없는 업종'), null);
  assert.deepEqual(moneyList({inds: [{n: '반도체', x: -3, lead: ['005930', '삼성전자']}]}, null), []); // 시장보다 더 오른 업종이 없으면 비움
});

test('왜 여기 있나 — 가까운 회사는 맞은 조건 · 안 맞은 조건을 가름 · 돈이 몰린 회사 · 둘 다', () => {
  const bl = {mode: 'near', rows: [{code: '127120', name: '제이에스링크', ind: '바이오', ix: 8.87}], say: SAY, miss: SAY[1], min: 15, rec: {rate: 16, base: 26}};
  const mo = [{code: '127120', name: '제이에스링크', ind: '바이오', x: 20, why: null}, {code: '180640', name: '한진칼', ind: '항공', x: 17.5, why: null}];
  const r = reasonsFor('127120', bl, mo);
  assert.deepEqual(r.map(x => x.kind), ['near', 'money']);
  assert.deepEqual(r[0].ok, [SAY[0], SAY[2]]);
  assert.deepEqual(r[0].no, [SAY[1]]);
  assert.deepEqual(reasonsFor('180640', bl, mo).map(x => x.kind), ['money']);
  assert.deepEqual(reasonsFor('999999', bl, mo), []);
  assert.deepEqual(reasonsFor('000660', {mode: 'pick', rows: [{code: '000660', name: 'SK하이닉스', ind: '반도체'}], say: SAY, rec: null}, []).map(x => [x.kind, x.ok.length, x.no.length]), [['pick', 3, 0]]);
});

test('한 달 그림 — 지수는 회사와 같은 날들 · 코스닥 회사는 코스닥 · 기준일 100', () => {
  const H = {idx: {KOSPI: {rows: [['2026-10-01', 90], ['2026-10-02', 200], ['2026-10-05', 210], ['2026-11-03', 180]]}, KOSDAQ: {rows: [['2026-10-02', 50], ['2026-11-03', 40]]}}};
  const k = idxLine(H, 'KOSPI', '2026-10-02', '2026-11-03');
  assert.equal(k.name, '코스피');
  assert.deepEqual(k.line, [100, 105, 90]);
  assert.equal(k.from, '2026-10-02');
  assert.equal(idxLine(H, 'KOSDAQ', '2026-10-02', '2026-11-03').name, '코스닥');
  assert.equal(idxLine(H, 'KOSPI', null, '2026-11-03'), null);
  assert.deepEqual(coLine({line: [10000, 13193]}), [100, 131.93]);
  assert.equal(coLine({line: [10000]}), null);
});

test('업종 회사 — 그 업종만 · 한 달 많이 오른 차례 · 값 모르면 뒤', () => {
  const M = {companies: {'003490': {n: '대한항공', i: '항공', c: -5.67}, '180640': {n: '한진칼', i: '항공', c: 31.93}, '091810': {n: '트리니티항공', i: '항공', c: null}, '005930': {n: '삼성전자', i: '반도체', c: 1}, bad: {n: '나쁜', i: '항공', c: 3}}};
  assert.deepEqual(indRows(M, '항공').map(r => r.name), ['한진칼', '대한항공', '트리니티항공']);
  assert.deepEqual(indRows(null, '항공'), []);
});

test('저장소 자료 그대로 — 꽃이 될 회사 · 돈이 몰린 회사 줄이 모두 회사 번호를 가짐', () => {
  const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const B = rd('site/next/data/theme-bloom.json'), TH = rd('site/next/data/theme.json'), W = rd('site/next/data/flow-why.json');
  const bl = bloomList(B);
  assert.ok(['pick', 'near', 'none'].includes(bl.mode));
  for (const r of bl.rows) assert.match(r.code, CODE);
  const mo = moneyList(TH, W);
  assert.ok(mo.length <= 3);
  for (const r of mo) { assert.match(r.code, CODE); assert.ok(r.x > 0); }
});

test('첫 화면이 된 뒤 — 지금 수르 고리 · 말 · 카톡 표는 /next/ 로 그대로 · 수르 두 길 길과 다른 표는 그대로', () => {
  for (const h of ['', '#', '#/', '#/c/005930', '#/i/%ED%95%AD%EA%B3%B5']) assert.equal(forwardTo('', h), null, h);
  for (const h of ['#/b', '#/k', '#/r', '#/p', '#/k/127120', '#/r/127120', '#/p/005930']) assert.equal(forwardTo('', h), null, h); // 새 판 탭(주문 1238)
  assert.equal(forwardTo('', '#/p/abc'), '/next/#/p/abc'); // 번호 꼴이 아니면 지금 수르
  assert.equal(forwardTo('?v=123', '#/'), null);
  assert.equal(forwardTo('?fbclid=abc', ''), null);
  assert.equal(forwardTo('', '#/w/005930'), '/next/#/w/005930');
  assert.equal(forwardTo('', '#/s/abc%20def'), '/next/#/s/abc%20def'); // 카톡으로 받은 보내기
  assert.equal(forwardTo('', '#/why'), '/next/#/why');
  assert.equal(forwardTo('', '#/c/'), '/next/#/c/'); // 번호 없는 옛 회사 길은 지금 수르가 풂
  assert.equal(forwardTo('?lang=en', '#/'), '/next/?lang=en#/');
  assert.equal(forwardTo('?kakao=ok', ''), '/next/?kakao=ok');
  assert.equal(forwardTo('?v=1&sw=1', '#/c/005930'), '/next/?v=1&sw=1#/c/005930');
});

test('육하원칙 엔진 — 여섯 칸 · 문장(이름표 없음) · 토씨 · 지난 사실만(주문 1238 · 사장님 2026-11-04 07:38(+04))', () => {
  assert.equal(jo('삼성생명', '은'), '삼성생명은'); assert.equal(jo('제이에스링크', '은'), '제이에스링크는'); assert.equal(jo('코스닥', '이'), '코스닥이'); assert.equal(jo('반도체', '을'), '반도체를');
  const near = {kind: 'near', ok: SAY.filter(x => x !== SAY[1]), no: [SAY[1]], ind: '바이오 도구·서비스', ix: 9.06, min: 15, rec: {rate: 16, base: 26, n: 132, hits: 21}};
  const w = w5hCo({co: {code: '127120', name: '제이에스링크', ind: '바이오 도구·서비스', market: 'KOSDAQ'}, reasons: [near], line: [100, 80, 60.6], index: {name: '코스닥', line: [100, 90, 78.9]}, asOf: '2026-11-03'});
  assert.deepEqual(Object.keys(w).filter(k => ['who', 'when', 'where', 'what', 'how', 'why'].includes(k)), ['who', 'when', 'where', 'what', 'how', 'why']);
  assert.equal(w.who, '제이에스링크'); assert.equal(w.when, '11월 3일'); assert.equal(w.where, '코스닥 바이오 도구·서비스 업종'); assert.equal(w.kind, 'near');
  const t = say5(w);
  assert.equal(t[0], '제이에스링크는 11월 3일 코스닥 바이오 도구·서비스 업종에서 이달 꽃 조건 3가지 가운데 2가지에 맞았어요.');
  assert.equal(t[1], '한 달 동안 −39.4% 움직였고, 같은 때 코스닥은 −21.1%였어요.');
  assert.match(t[2], /조건 하나만 못 맞았어요\.$/);
  for (const x of t) assert.doesNotMatch(x, /누가|언제|어디서|무엇을|어떻게|왜:|추천|예측|매수|매도|오를 것|내릴 것/, '이름표 · 쓰지 않을 말 0');
  const m = w5hCo({co: {code: '180640', name: '한진칼', ind: '항공', market: 'KOSPI'}, reasons: [{kind: 'money', ind: '항공', x: 16.82, why: {line: '기관이 샀고, 한진칼이 끌었어요.', items: []}}], asOf: '2026-11-03'});
  assert.equal(say5(m)[0], '한진칼은 11월 3일 코스피에서 한 달 동안 시장보다 17% 더 오른 항공 업종의 대장이에요.');
  assert.equal(say5(m)[1], '기관이 샀고, 한진칼이 끌었어요.', '줄이 없으면 어떻게 칸은 건너뜀 · 왜 = 자료의 까닭 그대로');
  assert.equal(w5hCo({co: {code: 'x', name: 'y'}}), null); assert.deepEqual(say5(null), []);
  const ind = w5hInd({name: '보험', x: 7.86, rows: [{c: 3}, {c: -1}, {c: null}], count: 12, asOf: '2026-11-03', why: {line: '외국인이 샀어요.'}});
  assert.deepEqual(say5(ind), ['보험 업종은 11월 3일까지 한 달 동안 시장보다 7.9% 더 올랐어요.', '값을 아는 회사 2곳 가운데 1곳이 한 달 동안 올랐어요.', '외국인이 샀어요.']);
  const rec = say5(w5hRec({rate: 16, base: 26, n: 132, hits: 21}, 'near'));
  assert.equal(rec[0], '조건에 가까웠던 회사는 지난 기록에서 100번에 16번 꽃이 됐어요.'); assert.equal(rec[1], '아무 회사나 고르면 100번에 26번이었어요.');
  assert.match(rec[2], /적었어요\.$/, '정직하게 — 가까운 회사가 아무 회사보다 적었으면 적었다고');
  assert.equal(w5hRec(null), null);
});

test('새 판 화면 — 일곱 걸음 · 탭 넷 기승전결 · 「왜 사?」 열한 질문이 지금 수르와 글자 그대로 · 화면 낱말 거르기 0(주문 1238)', async () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  const arr = (src, name) => { const m = new RegExp('export const ' + name + ' = Object\\.freeze\\((\\[[\\s\\S]*?\\])\\);').exec(src); assert.ok(m, name); return JSON.parse(m[1].replace(/'/g, '"')); };
  const qs = [...why.matchAll(/\{q: '([^']+)'/g)].map(m => m[1]);
  assert.equal(qs.length, 11);
  assert.deepEqual(arr(su, 'WHY_QS'), qs, '열한 질문 = site/next/p-why.js QS 의 q 그대로');
  const g = /export const GROUPS = (\[\[[^\n]*\]\]);/.exec(why); assert.ok(g);
  assert.deepEqual(arr(su, 'WHY_GROUPS'), JSON.parse(g[1].replace(/'/g, '"')), '네 묶음 = p-why.js GROUPS 그대로');
  const steps = arr(su, 'STEPS'), tabs = arr(su, 'TABS');
  assert.equal(steps.length, 7, '일곱 걸음');
  assert.deepEqual(tabs.map(t => t[0]), ['기', '승', '전', '결'], '탭 넷 = 기승전결 차례');
  assert.deepEqual([...new Set(steps.map(s => s[1]))], ['기', '승', '전', '결'], '걸음도 기승전결 차례로 이어짐');
  for (const [, , href] of tabs) assert.equal(forwardTo('', href), null, '탭 고리는 새 판 안 — ' + href);
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...su.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
});

test('새 판 「왜 사?」 답하기 — 답 셋 · 한마디 · 왜 묻나 · 판정 이름이 지금 수르와 글자 그대로 · 판정 셈이 같음 · 기록 열쇠가 같음(주문 1506)', async () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8'), look = fs.readFileSync(path.join(ROOT, 'site/next/why-look.js'), 'utf8');
  const block = (src, head, end) => { const s = src.indexOf(head); assert.ok(s >= 0, head); const e = src.indexOf(end, s); return src.slice(s + head.length, e + end.length - 1); };
  const QS = new Function('return ' + block(why, 'export const QS = ', '\n];'))();
  const LOOK = new Function('return ' + block(look, 'export const LOOK = Object.freeze(', '\n])'))();
  const TYPE = new Function('const Object = {freeze: x => x}; return ' + block(look, 'export const TYPE_OF = Object.freeze(', '\n})'))();
  const A = new Function('return ' + block(su, 'export const WHY_A = Object.freeze(', '\n])'))();
  const W = new Function('return ' + block(su, 'export const WHY_WHY = Object.freeze(', '\n])'))();
  const T = new Function('return ' + block(su, 'export const WHY_TYPE = Object.freeze(', '});').slice(0, -1))();
  assert.deepEqual(A, QS.map(q => q.a), '답 셋 · 한마디 = p-why.js QS 의 a 그대로(차례까지)');
  assert.deepEqual(W, LOOK.map(l => l.why), '왜 묻나 = why-look.js LOOK 의 why 그대로');
  for (const k of ['go', 'wait', 'rest']) { assert.equal(T[k][0], TYPE[k].name, k); assert.equal(T[k][1], TYPE[k].q, k); }
  assert.equal(T.rest[2], TYPE.rest.stopQ);
  // 판정 셈 = p-why.js judge(문턱 · 쉬어 가는 답 · 점수표가 글자 그대로)
  for (const frag of ["stop || score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '좋아, 정해 둔 대로만'", "{g: 0, y: 1, r: 2}", "'거의 다·빌린 돈'", "a[1] === '곧'"]) {
    assert.ok(why.includes(frag), 'p-why.js — ' + frag); assert.ok(su.includes(frag), 'su.js — ' + frag);
  }
  assert.ok(why.includes("const KEY = 'atlas:godori-why'") && su.includes("WHY_KEY = 'atlas:godori-why'"), '매매일지 열쇠가 같음');
  assert.ok(why.includes("tally(V_CODE[J.verdict] === 'rest' ? 'stop_rest' : 'stop')") && su.includes("tally(v === 'rest' ? 'stop_rest' : 'stop')"), '합계 칸 신호가 같음');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...A.flat(2), ...W, ...Object.values(T).flat()];
  assert.deepEqual(texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)]), [], '답하기 글에 쓰지 않을 말 0');
  assert.equal(forwardTo('', '#/q'), null); assert.equal(forwardTo('', '#/q/127120'), null);
});

test('새 판 매매일지 — 지금 수르 매매일지와 같은 열쇠 · 같은 약속 꼴 · 같은 한 달 셈 · 같은 신호(주문 1519)', async () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  for (const frag of ["{a: yes ? 'yes' : 'no', at: new Date().toISOString()}", "const LATER = 20;", "(Date.now() - Date.parse(r.at)) / 864e5 >= 30", "'/next/data/median20.json'",
    "'그날 정한 대로 했어?'", "text: '했어'", "text: '안 했어'", "tally(yes ? 'promise_yes' : 'promise')", '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.']) {
    assert.ok(why.includes(frag), 'p-why.js — ' + frag); assert.ok(su.includes(frag), 'su.js — ' + frag);
  }
  assert.equal(forwardTo('', '#/j'), null, '매매일지 길은 새 판 안');
});
