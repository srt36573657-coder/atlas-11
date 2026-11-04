// 수르 두 길(/su/) 자료 고르기 시험 — 주문 2049(사장님 2026-11-03 15:49(+04) · docs/design/su-two-2026-11-03/order-2049.txt)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, whyOf, reasonsFor, idxLine, coLine, indRows, forwardTo, jo} from '../../site/su/su-data.js';

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

test('육하원칙 엔진(새로 씀) — 값마다 여섯 칸 · 빈 칸은 null(화면 「확인 필요」) · 자료 숫자 그대로 · 토씨(주문 1616 · 사장님 2026-11-04 11:16(+04) [안쪽 엔진])', async () => {
  const E = await import('../../site/su/su-six.js');
  assert.deepEqual([...E.SIX], ['누가', '언제', '어디서', '무엇을', '어떻게', '왜']);
  assert.equal(E.NEED, '확인 필요');
  const v = E.val(3, '곳', '이름', {누가: '나', 언제: '', 어디서: '  ', 무엇을: '셌어요'});
  assert.deepEqual(Object.keys(v.six), [...E.SIX], '여섯 칸 차례 그대로');
  assert.deepEqual(E.holes(v.six), ['언제', '어디서', '어떻게', '왜'], '빈 글 · 띄어쓰기만 · 없는 칸은 빈 칸');
  assert.equal(E.val(NaN, '', 'x', {}).v, null, '값이 숫자가 아니면 null(화면 「확인 필요」 · 「?」로 지어 넣지 않음)');
  assert.equal(E.val(1580, '번', 'x', {}).v, '1,580');
  const B = {asOf: '2026-11-03', bloomMeaning: '꽃은 한 달 동안 시장보다 5% 넘게 더 오른 것이에요.', today: {rule: {month: '2026-11', decided: '2026-11', say: SAY}},
    honest: {from: '2025-01-02', to: '2026-10-02', n: 1580, hits: 523, rate: 33.1, base: 24.38, months: 22, up: 13, down: 8, scored: 22},
    why: {all: {miss: 1057, why: [251, 573, 233]}, names: ['조금 모자랐어요', '업종째 식었어요', '회사만 처졌어요']},
    near: {rec: {n: 132, hits: 21, rate: 15.91, base: 26.21, from: '2026-06-10', to: '2026-10-02'}},
    months: [{month: '2026-09', say: SAY, rec: {n: 17, h: 7, rate: 41.18, base: 26.17, complete: true}}, {month: '2026-10', say: SAY, rec: {n: 6, h: 0, rate: 0, base: 33.55, complete: false}}, {month: '2026-11', say: SAY, rec: {n: 0, h: 0, rate: null, base: null, complete: false}}]};
  const bl = bloomList({today: {rule: {say: SAY}, inds: []}, honest: B.honest, near: {rule: {atom: 'ix4', min: 15, say: SAY[1]}, today: [['127120', '제이에스링크', '바이오 도구·서비스', 9.06, -31.36]], rec: B.near.rec}});
  const home = E.eHome({S: {coN: 2557}, B, bl, mo: [], asOf: '2026-11-03'});
  assert.equal(home.big.v, '0', '꽃 조건에 모두 맞은 회사가 없는 날은 0곳(가까운 회사를 꽃으로 세지 않음)');
  assert.equal(home.say.length, 4); assert.ok(home.say[2].startsWith('그런데') && home.say[3].startsWith('그래서'), '기승전결 — 셋째 그런데 · 넷째 그래서');
  assert.ok(home.mids.some(x => x.v === '33' && x.v2 === '24'), '지난 기록은 기준 값과 같이(33 대 24)');
  const hub = E.eHub({B, mine: []});
  assert.equal(hub.big.v, '33'); assert.equal(hub.big.v2, '24'); assert.equal(E.holes(hub.big.six).length, 0, '큰 값의 여섯 칸이 다 참');
  const ms = E.eMonths({B});
  assert.equal(ms.big.v, '1 · 0', '다 센 달만 셈(세는 중인 달 · 빈 달은 빼고 따로 표시)');
  assert.ok(ms.rows.find(r => r.month === '2026-10').open, '세는 중인 달 표시');
  const pz = E.eMiss({B});
  assert.equal(pz.big.v, '1,057'); assert.deepEqual(pz.mids.map(x => x.v), ['251', '573', '233']);
  assert.ok(E.eMiss({B}).big.six.왜.includes('업종째 식었어요'), '왜 = 자료에 있는 지난 까닭(가장 많은 것)');
  const nr = E.eNear({B});
  assert.equal(nr.big.v, '16'); assert.equal(nr.big.v2, '26');
  const yr = E.eYears({B: {record: {all: {n: 1580, hits: 523, rate: 33.1, base: 23.65}, years: {'2024': {n: 0, hits: 0, rate: null, base: 22.71}, '2025': {n: 1118, hits: 373, rate: 33.36, base: 22.04}}}}});
  assert.equal(yr.rows[0].v, null, '고른 적 없는 해는 값 없음(「확인 필요」 · 0으로 지어 넣지 않음)');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const all = [home, hub, ms, pz, nr, yr, E.eDays({B: {cal: {from: '2026-08-05', to: '2026-11-03', days: [{d: '2026-08-05', n: 2, hit: 1, miss: 1, wait: 0}]}}}), E.eJournal({recs: []})];
  const texts = all.flatMap(m => [...m.say, ...[m.big, ...m.mids, ...m.rows].flatMap(x => [x.label, ...Object.values(x.six)])]).filter(Boolean);
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '엔진 글에 쓰지 않을 말 0');
  assert.ok(!texts.some(t => /셋가지|하나번째|둘가지/.test(t)), '셈 낱말(세 가지 · 첫째)');
});

test('새 판 화면(새로 씀) — 일곱 번 누름 여덟 화면 · 탭 넷 기승전결 · 「왜 사?」 열한 질문이 지금 수르와 글자 그대로 · 화면 낱말 거르기 0(주문 1616)', async () => {
  const src = f => fs.readFileSync(path.join(ROOT, 'site/su/' + f), 'utf8');
  const su = src('su.js'), wy = src('su-why.js'), all = su + wy + src('su-six.js') + src('su-fig.js') + src('su-word.js') + src('su-art.js'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  const arr = (s, name) => { const m = new RegExp('export const ' + name + ' = Object\\.freeze\\((\\[[\\s\\S]*?\\])\\);').exec(s); assert.ok(m, name); return JSON.parse(m[1].replace(/'/g, '"')); };
  const qs = [...why.matchAll(/\{q: '([^']+)'/g)].map(m => m[1]);
  assert.equal(qs.length, 11);
  assert.deepEqual(arr(wy, 'WHY_QS'), qs, '열한 질문 = site/next/p-why.js QS 의 q 그대로');
  const g = /export const GROUPS = (\[\[[^\n]*\]\]);/.exec(why); assert.ok(g);
  assert.deepEqual(arr(wy, 'WHY_GROUPS'), JSON.parse(g[1].replace(/'/g, '"')), '네 묶음 = p-why.js GROUPS 그대로');
  const st = /export const STEPS = (\[null, [^\n]*\]);/.exec(su); assert.ok(st, 'STEPS');
  const steps = new Function('return ' + st[1])().slice(1);
  assert.equal(steps.length, 8, '여덟 화면 = 다음 단추 일곱 번');
  assert.deepEqual(steps.map(x => x[1]), [0, 1, 1, 2, 2, 2, 3, 3], '걸음이 기승전결 차례로 이어짐');
  const tl = /const TABS = \(\) => \[([\s\S]*?)\]\];/.exec(su); assert.ok(tl, 'TABS');
  const tabNames = [...tl[1].matchAll(/\['([가-힣]+)', /g)].map(m => m[1]);
  assert.deepEqual(tabNames.slice(0, 4), ['오늘', '회사', '기록', '멈춤'], '탭 넷 = 기 오늘 · 승 회사 · 전 기록 · 결 멈춤');
  assert.ok(su.includes("'탭 — 기 오늘 · 승 회사 · 전 기록 · 결 멈춤'"));
  for (const href of ['#/', '#/r', '#/r/m', '#/r/w', '#/r/d', '#/r/y', '#/r/n', '#/q', '#/q/127120', '#/j', '#/c/127120']) assert.equal(forwardTo('', href), null, '새 판 안 — ' + href);
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...all.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|['"]style['"]|\.style\./.test(all), '보안 규칙 — innerHTML · 글 속 style 없음');
});

test('새 판 「왜 사?」 답하기 — 답 셋 · 한마디 · 왜 묻나 · 판정 이름이 지금 수르와 글자 그대로 · 판정 셈이 같음 · 기록 열쇠가 같음(주문 1506)', async () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su-why.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8'), look = fs.readFileSync(path.join(ROOT, 'site/next/why-look.js'), 'utf8');
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
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su-why.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  for (const frag of ["{a: yes ? 'yes' : 'no', at: new Date().toISOString()}", "const LATER = 20;", "(Date.now() - Date.parse(r.at)) / 864e5 >= 30", "'/next/data/median20.json'",
    "'그날 정한 대로 했어?'", "text: '했어'", "text: '안 했어'", "tally(yes ? 'promise_yes' : 'promise')", '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.']) {
    assert.ok(why.includes(frag), 'p-why.js — ' + frag); assert.ok(su.includes(frag), 'su.js — ' + frag);
  }
  assert.equal(forwardTo('', '#/j'), null, '매매일지 길은 새 판 안');
});

test('쉬운 말과 전문가 정보(주문 1807 · 사장님 2026-11-04 13:07(+04)) — 숫자마다 「그래서」 · 전문가 칸은 셈과 출처 · 바꿀 낱말은 바꾸고 못 바꾸면 풀이 · 「꽃잎」은 「꽃」이 아님', async () => {
  const W = await import('../../site/su/su-word.js'), E = await import('../../site/su/su-six.js');
  assert.equal(W.easy('시가총액이 컸어요'), '회사 크기가 컸어요', '바꾼 말 뒤 토씨도 받침에 맞춤');
  assert.equal(W.easy('수익률은 몰라요'), '오른 만큼은 몰라요');
  assert.equal(W.easy('종가를 봐요'), '그날 마지막 값을 봐요');
  assert.ok(W.has('꽃이 됐어요', '꽃') && !W.has('빈 꽃잎', '꽃'), '꽃잎은 꽃이 아님');
  for (const w of ['코스피', '코스닥', '업종', '꽃', '싹', '대장', '거래일']) assert.ok(W.GLOSS.some(g => g[0] === w && g[1].length > 8), '풀이 한 줄 — ' + w);
  assert.deepEqual(W.hardLeft('코스피와 업종을 봐요', ['코스피']), ['업종'], '풀이 없이 남은 낱말만 셈');
  assert.deepEqual(W.hardLeft('시가총액', []), ['시가총액'], '바꿨어야 할 낱말이 남으면 셈');
  const B = {honest: {from: '2025-01-02', to: '2026-10-02', n: 1580, hits: 523, rate: 33.1, base: 24.38, baseN: 1038744, baseHits: 253231, days: 426, pickDays: 292, months: 22, up: 13, down: 8, scored: 22},
    record: {all: {n: 1580, hits: 523, rate: 33.1, base: 23.65, baseN: 1708573, baseHits: 404033, ex: 2.2, exBase: -0.44, fall: 32.34, fallBase: 36}}, why: {all: {miss: 1057, why: [251, 573, 233]}, names: ['조금 모자랐어요', '업종째 식었어요', '회사만 처졌어요']}};
  const hub = E.eHub({B, mine: []});
  for (const v of [hub.big, ...hub.mids]) assert.ok(typeof v.mean === 'string' && v.mean.endsWith('요.'), '값마다 「그래서」 한 줄 — ' + v.label);
  assert.ok(hub.big.mean.includes('100번에 67번은 못 됐어요') && hub.big.label.includes('대 아무 회사'), '33 대 24 → 셋 가운데 둘은 못 됨을 숨기지 않음');
  const pro = new Map(hub.pro.map(p => [p.k, p]));
  assert.ok(pro.get('100번에 꽃').how.startsWith('523 ÷ 1,580 × 100 = 33.1 · 자료 값과 ✓ 맞음'), '셈을 그대로 — 다시 셀 수 있게');
  assert.ok(pro.get('아무 회사 100번에 꽃').how.startsWith('253,231 ÷ 1,038,744 × 100 = 24.38 · 자료 값과 ✓ 맞음'));
  for (const k of ['고른 회사가 시장보다 더 오른 평균', '아무 회사가 시장보다 더 오른 평균', '100번에 시장보다 5 넘게 덜 오름', '아무 회사 · 100번에 5 넘게 덜 오름', '센 거래일', '고른 회사가 있던 날']) assert.ok(pro.has(k) && pro.get(k).v !== E.NEED, '전문가 칸에 빠지지 않음 — ' + k);
  assert.ok([...pro.keys()].some(k => k.startsWith('plain')) && [...pro.keys()].some(k => k.startsWith('old')), '뜻 모르는 값도 빼지 않고 「뜻 확인 필요」');
  const few = E.eNear({B: {near: {rec: {n: 12, hits: 2, rate: 16.67, base: 26.21, from: '2026-06-10', to: '2026-10-02'}}}});
  assert.ok(few.big.mean.includes('센 수가 12번뿐이라'), '센 수가 적으면 「이 숫자만 믿기 어렵다」');
});

test('아름다움(주문 1833 · 사장님 2026-11-04 13:33(+04) [아름다움]) — 금빛 · 연두 · 살구 · 글 대비 · 고른 회사와 아무 회사 같은 무게 · 어두운 판 · 움직임 2초 안 · 움직임 줄이기', () => {
  const css = fs.readFileSync(path.join(ROOT, 'site/su/su-art.css'), 'utf8');
  const block = sel => { const i = css.indexOf(sel); assert.ok(i >= 0, sel); const a = css.indexOf('{', i), b = css.indexOf('}', a); return Object.fromEntries([...css.slice(a + 1, b).matchAll(/--([a-z0-9]+):\s*(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2]])); };
  const lt = block(':root {'), dk1 = block(':root:not([data-theme="light"])'), dk2 = block(':root[data-theme="dark"]');
  for (const k of Object.keys(lt)) { assert.ok(dk1[k] && dk2[k], '어두운 판에도 같은 이름 — ' + k); assert.equal(dk1[k], dk2[k], '어두운 판 두 곳이 같은 값 — ' + k); }
  const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const C = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  for (const [nm, P] of [['밝은 판', lt], ['어두운 판', dk1]]) {
    assert.ok(C(P.ink, P.bg) >= 7 && C(P.mute, P.bg) >= 4.5 && C(P.mute, P.card) >= 4.5 && C(P.mute, P.soft) >= 4.5, nm + ' — 글 대비(본문 7 · 흐린 글 4.5 넘게)');
    assert.ok(C(P.ok, P.bg) >= 3 && C(P.base, P.bg) >= 3 && C(P.no, P.bg) >= 3, nm + ' — 그림 색 대비 3 넘게');
    assert.ok(Math.abs(L(P.ok) - L(P.base)) < 0.02, nm + ' — 고른 회사와 아무 회사가 같은 무게(밝기 차이 0.02 안)');
    assert.ok(C(P.chipt, P.chip) >= 4.5 && C(P.warn, P.bg) >= 4.5, nm + ' — 「그래서」 딱지 · 「확인 필요」 글 대비');
  }
  assert.ok(C(lt.okt, lt.ok) >= 4.5, '고른 회사 칸 위 흰 글');
  const delays = [...css.matchAll(/\.art-b\d \{ animation-delay: ([\d.]+)s; \}/g)].map(m => +m[1]), durs = [...css.matchAll(/animation: su-art-[a-z]+ ([\d.]+)s/g)].map(m => +m[1]);
  assert.ok(delays.length === 4 && durs.length >= 3 && Math.max(...delays) + Math.max(...durs) <= 2, '네 박자 · 2초 안에 한 번');
  assert.ok(/@media \(prefers-reduced-motion: reduce\) \{\s*\.art-draw, \.art-pop, \.art-fade \{ animation: none;/.test(css), '움직임 줄이기면 끝 모습');
  const js = fs.readFileSync(path.join(ROOT, 'site/su/su-art.js'), 'utf8');
  assert.ok(js.includes("'aria-hidden': 'true'") && css.includes('.su-orn-off { display: none !important; }') && /pointer-events: none/.test(css), '장식은 읽지 않고 누를 수 없음 · 글과 겹치면 숨김');
});

