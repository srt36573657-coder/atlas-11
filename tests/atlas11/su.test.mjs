// 수르 두 길(/su/) 자료 고르기 시험 — 주문 2049(사장님 2026-11-03 15:49(+04) · docs/design/su-two-2026-11-03/order-2049.txt)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as SUD from '../../site/su/su-data.js';
import {CODE, won100, more100, dateKo, bloomList, moneyList, whyOf, reasonsFor, idxLine, coLine, indRows, forwardTo, jo} from '../../site/su/su-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SAY = ['그날 몸값이 큰 쪽 위 20% 회사예요', '업종이 한 달 동안 시장보다 15% 넘게 더 올랐어요', '회사는 아직 싹이에요'];

test('숫자 말 — 100원 말(「%」 대신) · 더 덜 · 날짜', () => { // 주문 1114-1306(사장님 2026-11-14 13:06 「「몇 %」를 「100원이 ○원」으로 바꾸는 일이 가장 커요 다 해」)
  assert.equal(won100(31.93), '100원이 131.9원');
  assert.equal(won100(-5.67), '100원이 94.3원');
  assert.equal(won100(0.02), '100원이 100원');
  assert.equal(won100(1134.5), '100원이 1,234.5원');
  assert.equal(won100(NaN), '?');
  assert.equal(more100(8.87), '100원에 8.9원 더');
  assert.equal(more100(-32.15), '100원에 32원 덜');
  assert.equal(more100(17.49), '100원에 17원 더');
  assert.equal(more100(NaN), '?');
  assert.ok(!('pct' in SUD) && !('moreLess' in SUD), '옛 「%」 말 함수(pct · moreLess)는 없음 — 부르는 곳이 모두 100원 말로 바뀜');
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

test('돈이 몰린 회사 — 한 달 앞선 업종 셋의 대장 회사 · 이유 한 줄과 켜진 이유만', () => {
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
  assert.equal(forwardTo('', '#/r/k'), null, '#/r/k 기록창(주문 0814) — 수르 안');
  assert.equal(forwardTo('', '#/r/i'), null, '#/r/i 한국 투자자 특징 열하나(주문 2235) — 수르 안');
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
  assert.ok(E.eMiss({B}).big.six.왜.includes('업종째 식었어요'), '왜 = 자료에 있는 지난 이유(가장 많은 것)');
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

/** 주문 1837(사장님 2026-11-08 18:37 「첫패이지에 나온 종목들에 현재가와 꺽기 그래프 한달 올려」) — 첫 페이지 종목마다 현재가 · 한 달 꺾은선 */
test('첫 페이지 종목마다 현재가 · 한 달 꺾은선(주문 1837)', () => {
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21.json'), 'utf8'));
  const N = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21-next.json'), 'utf8')); // 될 듯 셋의 현재가 · 21 마지막 값(첫 화면 자료 su21.json 은 가볍게 그대로)
  const BD = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/atlas11/view/board.json'), 'utf8'));
  const B = new Map(BD.companies.map(c => [c.code, c])), sameDay = BD.asOf === T.asOf.board; // 저장된 21곳 판이 지금 판과 같은 날이면 값까지 맞대 봄(날마다 판이 바뀌어도 시험이 흔들리지 않게)
  for (const k of ['hotNext', 'bloomNext', 'moneyNext']) assert.deepEqual(N.lists[k].map(c => c.code), T.lists[k].map(c => c.code), k + ' 될 듯 두 파일이 같은 회사 · 같은 차례');
  for (const k of ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext']) for (const c of (k.endsWith('Next') ? N : T).lists[k]) {
    assert.ok(Number.isFinite(c.close) && c.close > 0 && Array.isArray(c.c) && c.c.length === 21 && c.c.every(v => Number.isFinite(v) && v > 0) && c.c[20] === c.close, k + ' ' + c.name + ' 현재가 · 한 달 21 마지막 값 · 끝 = 현재가');
    assert.equal(c.date, T.asOf.board, k + ' ' + c.name + ' 그날 값');
    if (sameDay) { const b = B.get(c.code); assert.ok(c.close === b.close && c.date === b.date && JSON.stringify(c.c) === JSON.stringify(b.c), k + ' ' + c.name + ' = 판 값 그대로'); }
  }
});

/** 주문 1708(사장님 2026-11-08 17:08 「왜? 이 디자인이 남아 있어! 구슬으로 첫페이지 해서 다 변경해야 하잖아」 · 17:18 「맞아」) — 첫 페이지 위아래까지 흰 구슬 판 · 새 판이면 스스로 새로 고침 */
test('첫 페이지 위아래까지 흰 구슬 판 · 새 판이면 스스로 새로 고침(주문 1708)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'site/su/index.html'), 'utf8');
  assert.ok(!html.includes('data-old-css') && !/l\[i\]\.media = 'all'/.test(fs.readFileSync(path.join(ROOT, 'site/su/su-boot.js'), 'utf8')), '옛 쪽 꾸밈 파일 0 · 켜는 갈래 0(주문 1116-0300 — 모든 쪽이 손자병법 판 · 옛 디자인 모두 지움)');
  const js = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8');
  assert.ok(js.includes("const VER = '/su/version.json'") && js.includes("document.addEventListener('visibilitychange', fresh)") && /pageshow', e => \{ if \(e\.persisted\) fresh\(\); \}/.test(js), '화면이 다시 보일 때 판 표를 새로 받음');
  assert.ok(/if \(v !== ver0\) \{ ver0 = v; location\.reload\(\); \}/.test(js) && /if \(!v\) return;/.test(js), '표가 바뀌었을 때만 한 번 새로 고침 · 못 받으면 그대로');
  assert.ok(html.includes('<meta name="theme-color" content="#FFFFFF">') && !/theme-color" content="#(?!FFFFFF)/.test(html), '휴대폰 맨 위 띠 색도 흰색(모든 쪽 — 주문 2011)');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/version.json'), 'utf8')), {v: 'dev'}, '저장소 판 표 = dev');
  assert.ok(/fs\.writeFile\(path\.join\(dist, 'su\/version\.json'\)/.test(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/package.mjs'), 'utf8')), '묶을 때마다 새 판 표');
});

/** 주문 1023 「머스크 판 4」 — 일꾼 열하나가 서로 모르게 만든 무하 그림 부품(docs/design/su-musk-2026-11-05/pic-brief.md) */
// 주문 1114-1306 ⑨ — 아무도 부르지 않던 넷(su-show · su-co-art · su-more-art · su-road-art)은 지움 · 남은 옛 부품만
const ART4 = ['su-women-e.js', 'su-mucha.js', 'su-land-art.js', 'su-stop-art.js', 'su-rec-art.js'];
const JOBS_GONE = ['su-land-jobs.js', 'su-co-jobs.js', 'su-more-jobs.js', 'su-stop-jobs.js', 'su-rec-jobs.js', 'su-road-jobs.js', 'su-frame-jobs.js', 'su-sky.js'];
const ART_GONE = ['su-show', 'su-co-art', 'su-more-art', 'su-road-art'];
test('무하 그림 부품 — 부품 꼴(load · picture · CSS) · 꾸밈 파일 · 지운 수호 카드 · 얼굴 · 옛 부품 넷이 되살아나지 않음 · 앵무새(주문 1023 [3] 4 · [5] 3 · 주문 1114-1306 ⑨)', async () => {
  // 주문 1116-0300 — 옛 무하 그림 부품 · 공용 부품 · 잡스 판 부품은 모두 지움(옛 틀과 함께 · 「예전 디자인은 모두 삭제」)
  for (const f of [...ART4, 'su-mucha-kit.js', ...JOBS_GONE]) assert.ok(!fs.existsSync(path.join(ROOT, 'site/su', f)), '지운 옛 부품 — ' + f);
  // 주문 1114-1306 ⑨ — 수호 카드(신 72 지킴이 · 스승 39 길잡이) 파일 · 무하 얼굴 111장 · 얼굴 만드는 것 · 아무도 부르지 않던 옛 부품 넷을 지움(큐피트 쪽만 — 옛 앱 roman72 · sage39 · sage-art 는 옛 앱이 씀)
  for (const f of ['site/su/su-gods.js', 'site/su/faces', 'scripts/atlas11/next/su_faces.mjs', ...ART_GONE.flatMap(n => ['site/su/' + n + '.js', 'site/su/' + n + '.css'])]) assert.ok(!fs.existsSync(path.join(ROOT, f)), '지운 파일이 되살아나지 않음 — ' + f);
  const suAll = fs.readdirSync(path.join(ROOT, 'site/su')).filter(f => /\.(js|css|html)$/.test(f)).map(f => fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8')).join('\n');
  for (const w of ['/su/faces/', "'su-gods'", '/su/su-gods.js', ...ART_GONE.map(n => "'" + n + "'"), ...ART_GONE.map(n => '/su/' + n + '.')]) assert.ok(!suAll.includes(w), '손자병법 쪽이 지운 파일을 부르지 않음 — ' + w);
  for (const f of ['site/next/roman72.js', 'site/next/data/sage39.json']) assert.ok(fs.existsSync(path.join(ROOT, f)), '옛 앱 쪽 짝은 그대로(옛 앱이 씀) — ' + f);
  assert.ok(!fs.existsSync(path.join(ROOT, 'site/media/su-parrot.svg')), '옛 다음 단추 앵무새 그림 지움(주문 1116-0300)');
  assert.ok(!fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8').includes('su-parrot'), '옛 다음 단추 앵무새 0(주문 1116-0300 — 옛 틀 지움)');
});

/** 주문 2011 「모든 페이지를 첫페이지 기준으로」 — 무하 그림 부품을 첫 페이지(흰 구슬 판 su-apple) 말투로 새로 그린 잡스 판 부품(옛 무하 부품은 지우지 않고 둠 · docs/design/su-jobs-all-2026-11-08/brief.md) */
// (옛 잡스 판 부품 목록 JOBS 는 지움 — 주문 1116-0300 · 위 JOBS_GONE 이 지운 것을 잼)
// (지움 — 주문 1115-2328 「어고쳐」: 이 시험이 보던 쪽(옛 회사 · 「왜?」 · 기록창 한국 시장 · 무하 부품 쪽)을 지움 · 옛 고리는 첫 쪽으로 감을 check_su.mjs ⑨ 가 잼)
test('새 판 화면(새로 씀) — 다음 단추 네 번 다섯 화면(주문 1115-2328) · 탭 다섯 · 「왜 사?」 열한 질문이 지금 수르와 글자 그대로 · 화면 낱말 거르기 0(주문 1616)', async () => {
  const src = f => fs.readFileSync(path.join(ROOT, 'site/su/' + f), 'utf8');
  const su = src('su.js'), wy = src('su-why.js'), all = su + wy + src('su-six.js') + src('su-fig.js') + src('su-word.js') + src('su-wrap.js') + src('su-sonja.js') + src('su-sonja-top.js') + src('su-sonja-kkoe.js') + src('su-sonja-ink.js') + src('su-sonja-mean.js'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  const arr = (s, name) => { const m = new RegExp('export const ' + name + ' = Object\\.freeze\\((\\[[\\s\\S]*?\\])\\);').exec(s); assert.ok(m, name); return JSON.parse(m[1].replace(/'/g, '"')); };
  const qs = [...why.matchAll(/\{q: '([^']+)'/g)].map(m => m[1]);
  assert.equal(qs.length, 11);
  assert.deepEqual(arr(wy, 'WHY_QS'), qs, '열한 질문 = site/next/p-why.js QS 의 q 그대로');
  const g = /export const GROUPS = (\[\[[^\n]*\]\]);/.exec(why); assert.ok(g);
  assert.deepEqual(arr(wy, 'WHY_GROUPS'), JSON.parse(g[1].replace(/'/g, '"')), '네 묶음 = p-why.js GROUPS 그대로');
  const st = /export const STEPS = (\[null, [^\n]*\]);/.exec(su); assert.ok(st, 'STEPS');
  const steps = new Function('return ' + st[1])().slice(1);
  assert.equal(steps.length, 5, '다섯 화면 = 다음 단추 네 번(주문 1115-2328 — 오늘 · 꾀 · 회사 · 「왜 사?」 · 매매일지)');
  assert.deepEqual(steps.map(x => x[0]), ['오늘', '꾀', '회사', '「왜 사?」', '내 매매일지'], '다섯 화면 이름');
  assert.deepEqual(steps.map(x => x[1]), [0, 1, 2, 3, 3], '걸음이 기승전결 차례로 이어짐(주문 2044 — 21곳 · 땅 지도 · 업종 · 회사 · 자세히 · 왜 사? · 매매일지 · 친구에게)');
  const top = src('su-sonja-top.js'), t5 = /export const TAB5 = Object\.freeze\((\[[^\n]*\])\);/.exec(top); assert.ok(t5, 'TAB5'); // 탭은 손자병법 판 한 곳(주문 1116-0300 — 옛 틀 tabs · TABS · TAB_ORDER 지움)
  const tabs5 = JSON.parse(t5[1].replace(/'/g, '"'));
  assert.deepEqual(tabs5, [['오늘', '#/'], ['꾀', '#/k'], ['멈춤', '#/q'], ['일지', '#/j'], ['정산', '#/r/t']], '탭 다섯 = 오늘 · 꾀 · 멈춤 · 일지 · 정산(주문 1115-2328 · 옛 지도 · 기록 · 달력 지움)');
  assert.ok(top.includes("'aria-label': '탭 — ' + TAB5.map(x => x[0]).join(' · ')") && !/['"]301곳/.test(su) && !su.includes("['달력', ") && !su.includes("['지도', ") && !su.includes('function tabs(') && !su.includes('export function page('), '탭은 손자병법 판 한 곳 · 옛 틀 page() · tabs 0');
  assert.ok(/#su \.sj-tabs \{[^}]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/.test(fs.readFileSync(path.join(ROOT, 'site/su/su-sonja.css'), 'utf8')), '탭 줄 다섯 칸(손자병법 판)');
  for (const href of ['#/', '#/r', '#/r/m', '#/r/w', '#/r/d', '#/r/y', '#/r/s', '#/r/c', '#/r/t', '#/s', '#/q', '#/q/127120', '#/j', '#/c/127120', '#/m', '#/m/hold', '#/f', '#/c/127120/more', '#/k', '#/k/g01', '#/k/g36']) assert.equal(forwardTo('', href), null, '새 판 안 — ' + href); // 지운 쪽 옛 고리도 /next/ 로 넘기지 않고 손자병법 안에서 첫 쪽(주문 1115-2328)
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...all.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|['"]style['"]|\.style\./.test(all), '보안 규칙 — innerHTML · 글 속 style 없음');
  // 주문 1114-1306 ⑧ — 옛 기능 쪽(#/g · su-feat.js 82가지)과 가까운 회사 쪽(#/r/n)을 버림 · 그 쪽을 그리던 파일(su.js · su-roads.js · su-road-jobs.js)에 그 길 · 고리 0(주석 빼고)
  //   ② 닫히는 옛 쪽(/next/ 시황 · 급등 · 급등 달력 · 오늘 시장)과 /atlas/ 화면으로 가는 고리 0 · 꼭 있어야 할 길 둘(개인정보 처리방침 · 고객센터)은 쪽마다 맨 아래 출처 칸(FOOT)
  assert.ok(!fs.existsSync(path.join(ROOT, 'site/su/su-feat.js')), '옛 기능 명단(su-feat.js) 지움');
  const codeOf = f => src(f).replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/(^|\s)\/\/\s.*$/, '')).join('\n'); // 주석 뺀 코드
  const mine = ['su.js', 'su-roads.js', 'su-road-jobs.js'].filter(f => fs.existsSync(path.join(ROOT, 'site/su', f))).map(f => [f, codeOf(f)]); // su-roads.js 는 기록 쪽 그림이 더는 부르지 않아 지움(주문 1114-1306 ⑧ — 있으면 검사)
  const dead = mine.flatMap(([f, c]) => [...c.matchAll(/['"`](#\/(g|r\/n)(\/[a-z]*)?|\/next\/[^'"`]*#\/(talk|surge|cal|today)\b[^'"`]*|\/atlas\/[^'"`]*#[^'"`]*|\/atlas\/(index\.html)?)['"`]/g)].map(m => f + ' ' + m[0]));
  assert.deepEqual(dead, [], '버린 쪽(#/g · #/r/n) · 닫히는 옛 쪽 · /atlas/ 화면으로 가는 고리 0');
  assert.ok(!/\b(vRoads|vNear|eNear|roadM|surgeBox|roadBars)\b/.test(mine.map(x => x[1]).join('\n')) && !fs.existsSync(path.join(ROOT, 'site/su/su-road-jobs.js')), '버린 쪽 그리는 함수 · 길 0 · 옛 그림 부품 su-road-jobs.js 지움(주문 1116-0300)');
  assert.ok(top.includes("export const FOOT = Object.freeze([['/su/privacy.html', '개인정보 처리방침'], ['/next/?su=back#/help', '고객센터']]);") && top.includes("...FOOT.map(([href, t]) => h('a', {href}"), '꼭 있어야 할 길 둘(개인정보 처리방침 · 고객센터)은 쪽마다 맨 아래 끝 줄(손자병법 판 su-sonja-top.js · 주문 1116-0300)');
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
  assert.equal(T.rest[3], TYPE.rest.sellQ, '팔 곳을 안 정해 쉬어 가는 까닭 줄(주문 1114-1306 ④)');
  // 판정 셈 = p-why.js judge(문턱 · 쉬어 가는 답 · 점수표가 글자 그대로 · 판정 이름 「준비됐어, 정해 둔 대로만」 — 주문 1114-1306 ④)
  for (const frag of ["stop || score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '준비됐어, 정해 둔 대로만'", "{g: 0, y: 1, r: 2}", "'거의 다·빌린 돈'", "a[1] === '곧'", "a[1] === '안 정함'", "'팔 곳을 정하기 전에는 사지 않아요.'"]) {
    assert.ok(why.includes(frag), 'p-why.js — ' + frag); assert.ok(su.includes(frag), 'su.js — ' + frag);
  }
  assert.ok(why.includes("const KEY = 'atlas:godori-why'") && su.includes("WHY_KEY = 'atlas:godori-why'"), '매매일지 열쇠가 같음');
  assert.ok(why.includes("tally(V_CODE[J.verdict] === 'rest' ? 'stop_rest' : 'stop')") && su.includes("tally(v === 'rest' ? 'stop_rest' : 'stop')"), '합계 칸 신호가 같음');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...A.flat(2), ...W, ...Object.values(T).flat()];
  assert.deepEqual(texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)]), [], '답하기 글에 쓰지 않을 말 0');
  assert.equal(forwardTo('', '#/q'), null); assert.equal(forwardTo('', '#/q/127120'), null);
});

test('「왜 사?」 판정(주문 1114-1306 ④) — 「떨어지면? → 안 정함」은 바로 쉬어 · 판정 이름 「준비됐어, 정해 둔 대로만」 · 두 앱 셈이 답 3^11 가지 모두 같고 이 시험이 따로 센 판정과 같음 · 옛 기록 이름은 새 이름으로 보임', () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su-why.js'), 'utf8'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  const block = (src, head, end) => { const s = src.indexOf(head); assert.ok(s >= 0, head); const e = src.indexOf(end, s); return src.slice(s + head.length, e + end.length - 1); };
  const lineOf = (src, head) => { const s = src.indexOf(head); assert.ok(s >= 0, head); return src.slice(s, src.indexOf('\n', s)).replace(/^export /, ''); };
  const fnOf = (src, re) => { const m = re.exec(src); assert.ok(m, String(re)); return m[0].replace(/^export /, ''); };
  const QS = new Function('return ' + block(why, 'export const QS = ', '\n];'))(), GROUPS = JSON.parse(/export const GROUPS = (\[\[[^\n]*\]\]);/.exec(why)[1].replace(/'/g, '"'));
  const A = new Function('return ' + block(su, 'export const WHY_A = Object.freeze(', '\n])'))(), SQS = JSON.parse(/export const WHY_QS = Object\.freeze\((\[[^\n]*\])\);/.exec(su)[1].replace(/'/g, '"'));
  // 화면 코드의 셈 글을 그대로 떼어 돌림(두 앱 각자)
  const suJ = new Function('WHY_A', 'WHY_QS', 'WHY_GROUPS', [lineOf(su, 'const WHY_PT = '), lineOf(su, 'const WHY_MONEY = '), lineOf(su, 'const WHY_SELL = '), lineOf(su, 'const WHY_REST = '),
    fnOf(su, /export function judgeWhy\(ans\) \{[\s\S]*?\n\}/), 'return judgeWhy;'].join('\n'))(A, SQS, GROUPS);
  const pJ = new Function('QS', 'GROUPS', [lineOf(why, 'const PT = '), 'const MAX = QS.length * 2;', lineOf(why, 'export const REST_MONEY = '), lineOf(why, 'export const REST_SELL = '), lineOf(why, 'export const REST_AT = '), lineOf(why, 'const stopOf = '),
    fnOf(why, /export function judge\(ans\) \{[\s\S]*?\n\}/), 'return judge;'].join('\n'))(QS, GROUPS);
  // 이 시험이 따로 센 판정 — 답 색(● 0 · ▲ 1 · ■ 2) · 쉬어 가는 답 셋(4번 「거의 다·빌린 돈」 · 7번 「안 정함」 · 9번 「곧」 — 질문 차례 그대로)
  const PT = {g: 0, y: 1, r: 2}, REST = [[3, '거의 다·빌린 돈'], [6, '안 정함'], [8, '곧']], NAMES = ['준비됐어, 정해 둔 대로만', '반만 준비됐어', '오늘은 쉬어 가자'];
  const mine = ans => { const p = ans.map((k, q) => PT[QS[q].a[k][0]]), sc = p.reduce((a, b) => a + b, 0), reds = p.filter(x => x === 2).length, stop = REST.some(([q, t]) => QS[q].a[ans[q]][1] === t);
    return {v: stop || sc >= 12 || reds >= 4 ? NAMES[2] : sc >= 6 ? NAMES[1] : NAMES[0], stop, sell: QS[6].a[ans[6]][1] === '안 정함', money: REST.some(([q, t]) => q !== 6 && QS[q].a[ans[q]][1] === t), sc, reds}; };
  assert.equal(QS[6].q, '떨어지면?', '7번 = 「떨어지면?」(질문 차례 그대로 — 기록 열쇠 · 답 자리가 이어짐)');
  const bad = [], cnt = {}; let sellOnly = 0;
  for (let n = 0; n < 3 ** 11; n++) {
    const ans = []; for (let x = n, q = 0; q < 11; q++, x = Math.floor(x / 3)) ans.push(x % 3);
    const w = mine(ans), s = suJ(ans), o = pJ(ans);
    if (s.verdict !== w.v || o.verdict !== w.v || s.stop !== w.stop || o.stop !== w.stop || s.money !== w.money || s.sell !== w.sell || s.score !== w.sc || o.score !== w.sc) { if (bad.length < 3) bad.push({ans, w, s, o}); }
    cnt[w.v] = (cnt[w.v] ?? 0) + 1;
    if (w.sell && !w.money && w.sc < 12 && w.reds < 4) sellOnly++;
  }
  assert.deepEqual(bad, [], '두 앱 판정 = 따로 센 판정(3^11 가지 모두)');
  assert.deepEqual(Object.keys(cnt).sort(), [...NAMES].sort(), '판정 이름 셋뿐(「좋아」 없음)');
  assert.ok(sellOnly > 1000, '「안 정함」 하나로만 쉬어 가는 답이 있음(점수 · 빨간 답으로는 쉬지 않을 판) — ' + sellOnly);
  const first = new Array(11).fill(0), sell = first.map((k, q) => (q === 6 ? 2 : k));
  assert.deepEqual([suJ(first).verdict, pJ(first).verdict], [NAMES[0], NAMES[0]], '답 첫째씩(1번만 빨강 · 점수 2) = 준비됐어');
  assert.deepEqual([suJ(sell).verdict, pJ(sell).verdict, suJ(sell).score], [NAMES[2], NAMES[2], 4], '그 판에서 7번만 「안 정함」(점수 4 · 빨간 답 둘) = 바로 쉬어');
  // 옛 기록(판정 글 「좋아, 정해 둔 대로만」)도 읽음 — 열쇠 · 꼴은 그대로 · 화면에는 새 이름
  const shownV = new Function([lineOf(su, 'export const WHY_V = '), lineOf(su, 'const VNAME = '), lineOf(su, 'const shownV = '), 'return [shownV, WHY_V];'].join('\n'))();
  const vShow = new Function([lineOf(why, 'const V_OLD = '), lineOf(why, 'const V_CODE = '), lineOf(why, 'const VTONE = '), lineOf(why, 'const vShow = '), 'return [vShow, V_CODE, VTONE];'].join('\n'))();
  assert.equal(shownV[0]('좋아, 정해 둔 대로만'), NAMES[0], '손자병법 매매일지 — 옛 이름은 새 이름으로 보임');
  assert.equal(vShow[0]('좋아, 정해 둔 대로만'), NAMES[0], '예전 앱 매매일지 — 옛 이름은 새 이름으로 보임');
  for (const v of NAMES) { assert.equal(shownV[0](v), v); assert.equal(vShow[0](v), v); }
  assert.deepEqual([shownV[1]['좋아, 정해 둔 대로만'], vShow[1]['좋아, 정해 둔 대로만'], vShow[2]['좋아, 정해 둔 대로만']], ['go', 'go', 'g'], '옛 기록 판정 = 준비됨(색 · 셈 · 오늘 판정 todayResult 그대로)');
  assert.deepEqual(NAMES.map(v => [shownV[1][v], vShow[1][v]]), [['go', 'go'], ['wait', 'wait'], ['rest', 'rest']]);
  assert.ok(su.includes("tallyInk([{name: VSHORT.rest, v: vc.rest}, {name: VSHORT.wait, v: vc.wait}, {name: VSHORT.go, v: vc.go}])") && su.includes("const VSHORT = {rest: '쉬어', wait: '반만', go: '준비됨'};"), '매매일지 판정 칸 차례 = 쉬어 → 반만 → 준비됨(손실 먼저)');
  assert.ok(!/\bpct\(/.test(su) && su.includes('won100(x)'), '매매일지 한 달 뒤 값 = 「100원이 ○원」(① · 「%」 글 0)');
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
  // 자료 글의 「%」 → 100원 말(주문 1114-1306 — 조건 글 theme-bloom.json · 까닭 글 flow-why.json 은 예전 앱도 쓰므로 큐피트 화면에 내기 직전에만 바꿈)
  for (const [a, b] of [['그날 몸값이 큰 쪽 위 20% 회사예요', '그날 회사 크기가 위에서 다섯에 하나 안에 드는 회사예요'], ['업종이 한 달 동안 시장보다 15% 넘게 더 올랐어요', '업종이 한 달 동안 시장보다 100원에 15원 넘게 더 올랐어요'],
    ['회사가 닷새 동안 시장보다 2% 이상 5% 아래로 더 올랐어요', '회사가 닷새 동안 시장보다 100원에 2원 이상 5원 아래로 더 올랐어요'], ['회사 값이 반년 가장 높은 값의 95% 이상이에요', '회사 값이 반년 가장 높은 값을 100원으로 치면 95원 이상이에요'],
    ['시장이 1.3% 내릴 때 17.0% 올랐어요.', '시장이 100원에 1.3원 내릴 때 100원에 17.0원 올랐어요.'], ['반도체 +4.7%예요.', '반도체 100원이 104.7원이에요.'], ['평균 −1.3%였어요.', '평균 100원이 98.7원이었어요.']]) {
    assert.equal(W.easy(a), b, '「%」 → 100원 말 — ' + a); assert.equal(W.easy(W.easy(a)), b, '두 번 바꿔도 같음 — ' + a);
  }
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
  for (const k of ['고른 회사가 시장보다 더 오른 평균', '아무 회사가 시장보다 더 오른 평균', '100번에 · 시장보다 100원에 5원 넘게 덜 오름', '아무 회사 · 100번에 · 100원에 5원 넘게 덜 오름', '센 거래일', '고른 회사가 있던 날']) assert.ok(pro.has(k) && pro.get(k).v !== E.NEED, '전문가 칸에 빠지지 않음 — ' + k); // 「5」 대신 100원 말(주문 1114-1306)
  assert.ok(/^100원에 [\d.,]+원 (더|덜)$/.test(pro.get('고른 회사가 시장보다 더 오른 평균').v), '시장보다 더 오른 평균도 100원 말 — ' + pro.get('고른 회사가 시장보다 더 오른 평균').v);
  assert.ok([...pro.keys()].some(k => k.startsWith('plain')) && [...pro.keys()].some(k => k.startsWith('old')), '뜻 모르는 값도 빼지 않고 「뜻 확인 필요」');
  const few = E.eNear({B: {near: {rec: {n: 12, hits: 2, rate: 16.67, base: 26.21, from: '2026-06-10', to: '2026-10-02'}}}});
  assert.ok(few.big.mean.includes('센 수가 12번뿐이라'), '센 수가 적으면 「이 숫자만 믿기 어렵다」');
});

test('21곳(주문 2044 · 사장님 2026-11-04 15:44(+04) 「수르 전면 개편 명령서」 [1]) — 상장 회사 모두 → 우량주 365 → 셋 일곱씩 · 21곳은 365 안에서만 · 겹친 곳 표시 · 숫자는 받은 자료 그대로', () => {
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21.json'), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/atlas11/view/board.json'), 'utf8'));
  const in365 = new Set(B.companies.map(c => c.code));
  assert.equal(T.schema, 'su21-2');
  assert.ok(Number.isInteger(T.counts.listed) && T.counts.listed > 2000, '상장 회사 수 = 받은 자료(mkt.json n)');
  assert.equal(T.counts.b365, in365.size, '우량주 = 지금 판(board.json) 그대로');
  // 엄격 셈(주문 0854 · 2026-11-09 09:02 「어」) — 묶음마다 기준을 모두 지난 곳만(일곱 이하) · 남는 자리는 비움 · 수 = su21.json strict.groups 의 final
  //   주문 1209(사장님 2026-11-09 12:09 「42개를 다 보이고 엄격한 2개를 … 별도로 표기」) — 표시 판(mode mark)은 일곱 그대로 · 표(sx) 수 = 엄격 셈 마지막 수
  const ST = T.strict?.rule ? T.strict : null, FIL = !!ST && ST.mode !== 'mark';
  const seven = k => (FIL ? (assert.ok(T.lists[k].length <= 7, k + ' 일곱 이하(엄격)'), assert.equal(T.lists[k].length, ST.groups[k].final, k + ' = 엄격 셈 마지막 수'))
    : (assert.equal(T.lists[k].length, 7, k + ' 일곱'), ST && assert.equal(T.lists[k].filter(c => c.sx === true).length, ST.groups[k].final, k + ' 손자병법 계산법 표 = 엄격 셈 마지막 수')));
  for (const k of ['hot', 'bloom', 'money']) {
    seven(k);
    for (const c of T.lists[k]) { assert.ok(in365.has(c.code), k + ' ' + c.name + ' — 365곳 안에서만([7] 5)'); assert.ok(c.in.includes(k)); }
  }
  const cnt = {}; for (const k of ['hot', 'bloom', 'money']) for (const c of T.lists[k]) cnt[c.code] = (cnt[c.code] ?? 0) + 1;
  assert.deepEqual(T.overlap.map(o => o.code).sort(), Object.keys(cnt).filter(c => cnt[c] > 1).sort(), '두 곳에 걸린 회사 = 겹침([1] 7)');
  assert.equal(T.distinct, Object.keys(cnt).length, '서로 다른 회사 수');
  const M = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21-map.json'), 'utf8'));
  assert.equal(M.lands.reduce((a, L) => a + L.inds.reduce((b, g) => b + g.cos.length, 0), 0), in365.size, '땅 지도 = 365곳 모두(빠진 곳 없음)');
  for (const k of ['hot', 'bloom', 'money']) for (const c of T.lists[k]) { const w = c.why ?? {}; // 까닭 칸이 그 목록 셈으로 채워짐(겹친 곳도 목록마다 따로)
    if (k === 'hot') assert.ok(Number.isFinite(w.ind20) && Number.isFinite(c.ch20), 'hot 이유 ' + c.name);
    if (k === 'money') assert.ok(Number.isFinite(w.indX) && Number.isFinite(w.gain), 'money 이유 ' + c.name);
    if (k === 'bloom') assert.ok(Number.isFinite(w.indX), 'bloom 이유 ' + c.name); }
  // 될 듯 셋(주문 1103 · 사장님 2026-11-08 11:03 「불장이 될듯 · 돈이 몰릴듯 · 싹에서 꽃이 될듯 7개 추가하자」 · 11:08 「응」) — 일곱씩 · 365 안 · 지금 셋과 같은 종류에는 겹치지 않음 · 까닭 값 · 지난 1년 기록
  const NOWK = {hotNext: 'hot', bloomNext: 'bloom', moneyNext: 'money'};
  for (const k of ['hotNext', 'bloomNext', 'moneyNext']) {
    seven(k);
    const now = new Set(T.lists[NOWK[k]].map(c => c.code));
    for (const c of T.lists[k]) { assert.ok(in365.has(c.code), k + ' ' + c.name + ' 365 안'); assert.ok(c.in.includes(k)); assert.ok(!now.has(c.code), k + ' ' + c.name + ' — 지금 일곱과 겹치지 않음');
      const w = c.why ?? {};
      if (k === 'hotNext') assert.ok(Number.isFinite(w.r20) && (['mc365-v1', 'culture7-v1'].includes(T.listRule) ? ['rank', 'five'].includes(w.how) : w.how === 'rank' ? Number.isInteger(w.rank) && w.rank >= 8 && w.rank <= 14 : w.how === 'five'), 'hotNext 이유 ' + c.name); // 주문 1422 — 몬테카를로 차례 판은 불장 업종(rank) · 업종 닷새 오름(five)
      if (k === 'moneyNext') assert.ok(Number.isFinite(w.gain) && w.gain > 0, 'moneyNext 이유 ' + c.name);
      if (k === 'bloomNext') assert.ok(Number.isFinite(w.x5) && w.x5 >= 0 && Number.isFinite(w.x20) && w.x20 < 5, 'bloomNext 이유(싹) ' + c.name); }
    assert.ok(Number.isFinite(T.past?.[k]?.per100) && Number.isFinite(T.past?.[k]?.base100) && T.past[k].n > (T.past.strict ? 50 : 500), k + ' 지난 1년 기록(엄격 셈은 고른 수가 적음 — 80 ~ 180번)');
  }
  assert.ok(T.rules.hotNext && T.rules.moneyNext && T.rules.bloomNext, '될 듯 셋 규칙 글');
});

test('잡스 판(주문 0054 · 사장님 2026-11-04 18:54(+03)) — 칸 이름 녹이기 · 옛 앱 신 · 스승 명단 · 수르 틀 · 본질 세 줄', async () => {
  const {sixSay} = await import('../../site/su/su-fig.js');
  for (const k of ['누가', '언제', '어디서', '무엇을', '어떻게', '왜']) {
    const empty = sixSay(k, ''), full = sixSay(k, '한진칼 · 항공 업종');
    assert.ok(empty.includes('확인 필요') && empty !== k + ' 확인 필요' && !new RegExp('^' + k + '\\s*[:·]').test(empty), '빈 칸은 「확인 필요」를 그 자리 말과 함께(이름표 「누가:」 꼴 아님) — ' + k);
    assert.ok(!full.startsWith(k + ' ') && !full.startsWith(k + ':'), '칸 이름표 없이 문장 — ' + k);
  }
  assert.equal(sixSay('누가', '한진칼'), '한진칼 이야기예요.');
  assert.equal(sixSay('왜', '이유예요.'), '이유예요.', '이미 문장이면 그대로');
  // 큐피트 방마다 붙던 지킴이 신 칸(su-gods.js)은 지움(주문 1114-1306 ⑨) — 아래 신 · 스승 명단은 옛 앱(#/roman · #/sage)이 그대로 씀
  const R = fs.readFileSync(path.join(ROOT, 'site/next/roman72.js'), 'utf8');
  const nums = new Set([...R.matchAll(/^\s*\[(\d+), '/gm)].map(m => +m[1]));
  assert.equal(nums.size, 72, '옛 신 명단 일흔둘');
  const sg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/next/data/sage39.json'), 'utf8'));
  assert.equal(sg.people.length, 39, '스승 서른아홉');
  for (const p of sg.people) assert.ok(fs.existsSync(path.join(ROOT, 'site/next/sage-art', p.id + '.svg')), '스승 얼굴 그림 — ' + p.id);
  const W = fs.readFileSync(path.join(ROOT, 'site/su/su-wrap.js'), 'utf8');
  { // 주문 2011 · 2250 — 옛 쪽 첫 페이지 색 파일 셋(모든 선택자가 html.su-jobs 로 시작) · 밤 판을 뗀 뒤 자리 · 크기 지킴 칸 = 옛 꾸밈 파일에서 지은 그대로 · 색 파일을 받은 뒤 밤 판을 뗌
    const {execFileSync} = await import('node:child_process');
    execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/wrap_keep.py'), '--check'], {cwd: ROOT, stdio: 'pipe'});
    // 주문 1116-0300 — 손자병법에서 넘어간 옛 쪽 종이 판 색(su-wrap-sj.css)은 옛 쪽 색 파일에서 지은 그대로 · 손자병법에서 넘어온 때만 받음(바로 온 손님 첫 그림 2.5초 — check_white ③)
    execFileSync('node', [path.join(ROOT, 'scripts/atlas11/next/wrap_sj.mjs'), '--check'], {cwd: ROOT, stdio: 'pipe'});
    assert.ok(/SJ_CSS = '\/su\/su-wrap-sj\.css'/.test(W) && !/su-wrap-sj/.test(['next/index.html', 'hello.html', 'letter.html', 'invite.html', 'atlas/index.html'].map(f => fs.readFileSync(path.join(ROOT, 'site', f), 'utf8')).join('')), '종이 판 색은 손자병법에서 넘어온 때만(쪽 머리는 받지 않음)');
    const J = ['su-wrap-jobs.css', 'su-wrap-app.css', 'su-wrap-solo.css'].map(f => fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const top = []; let d = 0, cur = '', ins = [];
    for (const ch of J) { if (ch === '{') { const pre = cur.trim(); if (!pre.startsWith('@')) top.push(pre); ins.push(pre.startsWith('@')); cur = ''; d++; } else if (ch === '}') { ins.pop(); cur = ''; d--; } else if (ch === ';' && !ins.length) cur = ''; else cur += ch; }
    const parts = top.flatMap(x => { const o = []; let q = 0, c = ''; for (const ch of x) { if (ch === '(') q++; if (ch === ')') q--; if (ch === ',' && !q) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o.filter(Boolean); });
    assert.ok(parts.length > 500 && parts.every(x => /^html(:where\(\.white\.su-jobs\)|\.)/.test(x) && /su-jobs/.test(x.split(' ')[0])), '옛 쪽 색은 첫 페이지 판(html.su-jobs)일 때만 — ' + parts.filter(x => !/su-jobs/.test(x.split(' ')[0])).slice(0, 3).join(' | '));
    // 주문 2250(22:50 「이것도 구슬로 해」) — 옛 주소로 바로 온 손님도: 옛 쪽 머리가 색 파일을 처음부터 받고 <html> 에 su-jobs · 창 위 띠 흰색 · 밤 판 파일은 받지 않음
    const head = f => fs.readFileSync(path.join(ROOT, 'site', f), 'utf8');
    for (const f of ['next/index.html', 'atlas/index.html', 'hello.html', 'letter.html', 'invite.html']) {
      const t = head(f);
      assert.ok(t.includes('<link rel="stylesheet" href="/su/su-wrap-jobs.css">') && /<html lang="ko" class="[^"]*\bsu-jobs\b/.test(t) && t.includes('<meta name="theme-color" content="#FFFFFF">') && !/<html[^>]*\bclock\b/.test(t), f + ' 첫 그림부터 흰 구슬 판');
    }
    assert.ok(!head('next/index.html').includes('href="/next/clock.css"') && head('next/index.html').indexOf('/su/su-wrap.js') < head('next/index.html').indexOf('/next/app.js'), '옛 앱 — 밤 판 파일 안 받음 · 수르 틀이 app.js 보다 먼저(밤 판을 곧바로 뗌)');
    for (const f of ['hello.html', 'letter.html', 'invite.html']) assert.ok(head(f).includes('/su/su-wrap-solo.css'), f + ' 쪽 색');
    { // 옛 아틀란스(/atlas/) 남은 색 — 그 쪽 머리만 받고 · 모든 선택자가 html.su-jobs …:not(.white)(옛 앱 /next/ 는 늘 white) 로 시작
      assert.ok(head('atlas/index.html').includes('<link rel="stylesheet" href="/su/su-atlas-jobs.css">') && head('atlas/index.html').includes('<meta name="color-scheme" content="light">'), '옛 아틀란스 — 남은 색 파일 · 밝은 판');
      const A = fs.readFileSync(path.join(ROOT, 'site/su/su-atlas-jobs.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const sel = []; let cur = '', depth = 0; for (const ch of A) { if (ch === '{') { const pre = cur.trim(); if (!pre.startsWith('@')) sel.push(pre); cur = ''; depth++; } else if (ch === '}') { cur = ''; depth--; } else cur += ch; }
      const ps = sel.flatMap(x => { const o = []; let q = 0, c = ''; for (const ch of x) { if (ch === '(') q++; if (ch === ')') q--; if (ch === ',' && !q) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o.filter(Boolean); });
      assert.ok(ps.length > 50 && ps.every(x => /^html\.su-jobs(\.su-jobs)*:not\(\.white\)/.test(x)) && !/!important|@import|gradient|box-shadow:\s*(?!none)/.test(A), '옛 아틀란스 색은 그 쪽에만 · 그림자 · 그러데이션 0 — ' + ps.filter(x => !/^html\.su-jobs(\.su-jobs)*:not\(\.white\)/.test(x)).slice(0, 2).join(' | '));
    }
    assert.ok(head('privacy.html').includes('/su/su-privacy.css') && head('privacy.html').includes('class="su-jobs"') && !/<script/.test(head('privacy.html')), '개인정보 — 스크립트 0 그대로 · 첫 페이지 색');
    assert.ok(/APP_CSS = '\/su\/su-wrap-app\.css'/.test(W) && /\{ jobsLook\(\); wrap\(\); \}/.test(W), '첫 페이지 판은 모든 손님 · 옛 앱 쪽마다 색은 뒤에 붙임(첫 그림 2.5초)');
    assert.ok(/l\.addEventListener\('load', on, \{once: true\}\)/.test(W) && /de\.classList\.remove\('clock'\)/.test(W), '색 파일을 받은 뒤에 밤 판을 뗌(반쯤 바뀐 화면 없음)');
  }
  { // 주문 2011 — 개인정보 처리방침은 수르 틀을 미리 입힌 짝 쪽(원본 글 그대로 · 원본에서 지은 그대로인지)
    const {execFileSync} = await import('node:child_process');
    execFileSync('node', [path.join(ROOT, 'scripts/atlas11/next/su_privacy.mjs'), '--check'], {cwd: ROOT, stdio: 'pipe'});
    const P = fs.readFileSync(path.join(ROOT, 'site/su/privacy.html'), 'utf8');
    assert.ok(!/<script|style=/.test(P) && P.includes('default-src \'none\'') && /<html lang="ko" class="(?=[^"]*\bsu-wrapped\b)(?=[^"]*\bsu-jobs\b)[^"]*">/.test(P) && P.includes('/su/su-privacy.css'), '짝 쪽도 스크립트 · 글 속 style 0 · 원본 보안 규칙 그대로 · 첫 페이지 색');
    assert.ok(/'\/privacy\.html': '\/su\/privacy\.html'/.test(W) && fs.readFileSync(path.join(ROOT, 'site/su/su-sonja-top.js'), 'utf8').includes("['/su/privacy.html', '개인정보 처리방침']"), '큐피트 쪽마다 맨 아래(su-sonja-top.js FOOT · 주문 1116-0300 옛 틀 지움 · 옛 기능 쪽 #/g 에서 옮김 — 주문 1114-1306 ⑧) · 큐피트 틀 안 옛 쪽 고리 → 짝 쪽');
    // 빈 「?」 0(점검 P1 · 주문 1114-1306 ⑥) — 서버가 있는 나라 · 편지와 선물 초대장 지우는 날은 정하기 전까지 같은 말(원본 · 짝 쪽 · 영어 칸)
    for (const [f, t] of [['site/privacy.html', fs.readFileSync(path.join(ROOT, 'site/privacy.html'), 'utf8')], ['site/su/privacy.html', P]]) {
      const body = t.replace(/<!--[\s\S]*?-->/g, '');
      assert.ok(!/\?\s*예요|:\s*\?\)/.test(body), f + ' — 빈 「?」 칸(「? 예요」 · 「: ?)」)이 남음');
      assert.ok(body.includes('서버가 있는 나라는 아직 정하지 못했어요. 정하면 여기에 먼저 알려요.') && body.includes('지우는 날은 아직 정하지 못했어요. 정하면 여기에 먼저 알려요.') && body.includes('(server country: not decided yet; we will post it here first)'), f + ' — 정하지 못한 두 칸은 같은 말로(한국어 · 영어)');
    }
  }
  assert.ok(/new URLSearchParams\(search\)\.get\('su'\)/.test(W) && /hasOwnProperty\.call\(GROUPS, g\)/.test(W), '수르 틀은 ?su=<묶음> 일 때만(모르는 값은 씌우지 않음)');
  for (const f of ['site/next/index.html', 'site/atlas/index.html']) assert.ok(fs.readFileSync(path.join(ROOT, f), 'utf8').includes('/su/su-wrap.js'), '옛 쪽에 수르 틀 — ' + f);
  const {ESSENCE} = await import('../../site/next/essence.js');
  assert.ok(ESSENCE[0].includes('병법') && ESSENCE[0].includes('서른여섯') && ESSENCE[0].includes('손실을 덜 보는지') && !/불장|꽃이 될|돈이 몰리는/.test(ESSENCE[0]), '첫 화면 본질 첫 줄 = 병법 서른여섯 · 손실을 덜 봄(주문 1115-1843 — 불장 · 꽃 · 돈은 지움)');
  const doc = fs.readFileSync(path.join(ROOT, 'docs/손자병법_본질.md'), 'utf8');
  assert.ok(/^1\. 손자병법의 본질: 병법으로 주식해서 손실을 보지 않도록 돕는 곳이다\./m.test(doc) && /병법 서른여섯 가지로 풀어 낸다/.test(doc), '본질 문서 1번 = 사장님 2026-11-15 17:43 말씀');
  assert.ok(/^2\. 꾀를 돕는 일/m.test(doc) && /^7\. \(지움/m.test(doc), '셋을 돕는 일 → 꾀를 돕는 일 · 7번(될 듯 일곱) 지움');
});

/** 주문 0123(사장님 2026-11-09 01:23 · 01:44 · 02:01 · 02:02 · 02:04 「어」) · 주문 0200(02:00 「어」) — 「왜?」 쪽 · 42칸 첫 발견 · 며칠째 · 포모지수 · 회사 쪽 현재가 */
// (지움 — 주문 1115-2328 「어고쳐」: 이 시험이 보던 쪽(옛 회사 · 「왜?」 · 기록창 한국 시장 · 무하 부품 쪽)을 지움 · 옛 고리는 첫 쪽으로 감을 check_su.mjs ⑨ 가 잼)
// (지움 — 주문 1115-2328 「어고쳐」: 이 시험이 보던 쪽(옛 회사 · 「왜?」 · 기록창 한국 시장 · 무하 부품 쪽)을 지움 · 옛 고리는 첫 쪽으로 감을 check_su.mjs ⑨ 가 잼)
test('엄격 셈 — su21.py 가 지금 셈 일곱을 거름 · 첫 페이지 빈 자리 · 「왜?」 쪽 기준 31가지 · 묶을 때 su21-strict.json', () => {
  const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const py = src('scripts/atlas11/next/su21.py'), pk = src('scripts/atlas11/package.mjs'), rp = src('scripts/atlas11/next/su21_replay.mjs');
  // 주문 1422 뒤: su21.py 는 엄격 셈 거르기(ST.select)를 더 쓰지 않음(몬테카를로 차례 · 1억 번 셈) — 엄격 셈 틀(su21_strict.py)은 바탕(Ctx · 몬테카를로)으로 씀 · 화면은 옛 자료도 그림
  const st = src('scripts/atlas11/next/su21_strict.py');
  assert.ok(/import su21_strict as ST/.test(py) && /CTX = ST\.Ctx\(/.test(py) && /def select\(ctx, pools, fin_of\)/.test(st) && /assert len\(CRIT\) == 31/.test(st) && /past-strict\.json/.test(py), 'su21_strict.py — 엄격 셈 틀 · su21.py 바탕');
  assert.ok(pk.includes("'su21-strict.json'") && rp.includes("'days.json'") && rp.includes('RULE_NOW'), '묶을 때 · 지난 판 다시 세기(하루 값 · 규칙이 바뀌면 다시 셈)');
});

/** 주문 1209(사장님 2026-11-09 12:09 「아니 이렇게 해 42개를 다 보이고 엄격한 2개를 손자병법 계산법으로 찾은 종목이라고 해서 별도로 표기를 해봐」) — 42칸 그대로 · 엄격 셈을 모두 지난 칸에 「손자병법 계산법」 표 */
test('손자병법 계산법 표 — 42칸 그대로 · 엄격 셈을 모두 지난 칸만 표 · 풀이 한 줄 · 「왜?」 쪽 42칸 모두 · 며칠째는 옛 규칙', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const py = rd('scripts/atlas11/next/su21.py'), ck = rd('scripts/atlas11/next/check_su.mjs'), rp = rd('scripts/atlas11/next/su21_replay.mjs'), dy = rd('scripts/atlas11/next/su21_days.mjs');
  assert.ok(!/HOT, BLOOM, MONEY, HOTN, MONEYN, BLOOMN = PICK/.test(py), 'su21.py — 칸은 일곱 그대로(주문 1422 뒤에는 몬테카를로 차례 · 표는 1등 · 2등 · 3등)');
  // (주문 1115-2328 — 첫 쪽 · 「왜?」 쪽 · 기록창 쪽을 지워 검사 ⑳ 과 그 길도 지움 · 자료 셈 시험은 그대로)
  assert.ok(rp.includes("s?.mode === 'mark' ? null") && dy.includes("su?.strict?.mode === 'mark' ? null"), '며칠째 — 표시 판은 칸이 옛 셈 일곱이라 옛 규칙');
  for (const t2 of ['손자병법 계산법', '손자병법 계산법으로 찾은 종목', '31가지 기준을 모두 지난 곳이에요.']) assert.ok(!/[A-Za-z%]/.test(t2), '새 글에 영어 · % 없음 — ' + t2);
});

/** 주문 1422(사장님 2026-11-09 14:22 「돈 · 꽃 · 불장 찾는 조건을 처음에 365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고 42개를 찾은 것 중에서 다시 몬테카를로 …
    1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기」 · 14:37 「42곳도 표기 하고 그중에서 가장 … 좋은 1.2.3을 수르계산법으로 표기」) */
test('몬테카를로 차례 · 1억 번 셈 — 365곳 몬테카를로 · 소거 한 번 · 일곱씩 · 42칸 1등 · 2등 · 3등 표 · 「왜?」 쪽 · 지난 1년', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const py = rd('scripts/atlas11/next/su21.py'), mc = rd('scripts/atlas11/next/su21_mc.py'), t3 = rd('scripts/atlas11/next/su21_top3.py'), pk = rd('scripts/atlas11/package.mjs'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(/RULE_ID = 'mc365-v1'/.test(mc) && /def order\(ctx, pool, k\)/.test(mc) && /def scan\(ctx\)/.test(mc), '① 몬테카를로 · 드문 차례');
  assert.ok(/TOTAL = 100_000_000/.test(t3) && /np\.argpartition\(-z, 3, axis=1\)/.test(t3), '④ 1억 판 · 판마다 마지막 셋');
  assert.ok(/import su21_mc as MC/.test(py) && /HOT = per2\(_o\)/.test(py) && /T3 = (TOP3\.top3\(CTX, CELLS\)|UP3\.top3\(CTX, list\(B\), cap, nm\)) if A\.top3 else None/.test(py) && /out\['listRule'\] = (MC|CUL)\.RULE_ID/.test(py) && /'r3': PLACE\.get\(\(k, c\)\)/.test(py), 'su21.py — 일곱 · 1억 번 셈 · 규칙 이름');
  assert.ok(pk.includes("'--mc365', '--top3'"), '올릴 때 365곳 · 1억 번');
  // (주문 1115-2328 — 첫 쪽 · 「왜?」 쪽 · 기록창 쪽을 지워 검사 ⑳ 과 그 길도 지움 · 자료 셈 시험은 그대로)
  const P = JSON.parse(rd('reports/atlas11/su-next/past-mc.json'));
  assert.equal(P.rule, 'mc365-v1');
  for (const g of ['hotNext', 'moneyNext', 'bloomNext']) for (const k of ['mc', 'old', 'base']) assert.ok(P.res[g][k].picks > 0 && Number.isFinite(P.res[g][k].per100), g + ' ' + k);
  const T = JSON.parse(rd('site/su/data/su21.json'));
  assert.ok(['mc365-v1', 'culture7-v1'].includes(T.listRule), '몬테카를로 차례 판(주문 1912 뒤에는 문화 셈 판)');
  const r3 = Object.values(T.lists).flat().filter(c => [1, 2, 3].includes(c.r3)).map(c => c.r3).sort();
  if (T.top3?.v === 'up3-v1') { // 주문 1111-1857 뒤 — 새 잣대(우량주 365곳)로 바뀜 · 칸에 든 회사만 칸 등수(아래 「새 잣대」 시험)
    assert.ok(T.top3.rank.length === 3 && !('cells' in T.top3), '저장된 판 — 새 잣대 셋');
    assert.deepEqual(r3, Object.values(T.lists).flat().filter(c => T.top3.rank.some(r => r.code === c.code)).map(c => c.r3).sort(), '칸 등수 = 그 칸 회사가 새 잣대 등수일 때만');
  } else {
    assert.ok(T.top3 && T.top3.total === 100000000 && T.top3.rank.length === 3, '저장된 판 — 1억 번 셈');
    assert.deepEqual(r3, [1, 2, 3], '1등 · 2등 · 3등 칸 셋');
    for (const j of [0, 1, 2]) assert.equal(Object.values(T.top3.cells).reduce((a, x) => a + x[j], 0), T.top3.total, '판마다 ' + (j + 1) + '등 하나씩');
  }
  for (const t2 of ['1등', '2등', '3등', '손자병법 계산법 차례', '1억 번 섞어', '끝까지 남은 차례예요.']) assert.ok(!/[A-Za-z%]/.test(t2) && !/매수|추천/.test(t2), '새 글에 영어 · % · 쓰지 않을 말 없음 — ' + t2);
});

/** 주문 1912(사장님 2026-11-09 19:12 「한국에 주식하는 사람들에 특징 11가지를 에이전트 11개를 돌려서 찾아낸 다음 7가지에 정의를 내린 다음
    42개에 종목을 찾아내는데 문화에 중심으로 세팅한 다음 42개를 다시 찾아내고 그중에 이전에 했던 몬테카를로 방식 소급법(소거법)을 더 진화시켜서 작업 해봐」) */
test('문화 셈 — 특징 열하나 · 일곱 정의 · 문화로 42칸 · 요즘 흔들림 길 · 1억 번 셈 v2 · 지난 1년(앞 · 뒤 반년)', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const cu = rd('scripts/atlas11/next/su21_culture.py'), py = rd('scripts/atlas11/next/su21.py'), mc = rd('scripts/atlas11/next/su21_mc.py'), t3 = rd('scripts/atlas11/next/su21_top3.py');
  const ck = rd('scripts/atlas11/next/check_su.mjs'), doc = rd('docs/design/su-culture-2026-11-09/traits11.md');
  assert.equal((doc.match(/^# \d+ /gm) ?? []).length, 11, '특징 열하나 — 도우미 열하나가 찾은 근거');
  assert.ok(/RULE_ID = 'culture7-v1'/.test(cu) && /TRAITS = \['herd', 'near', 'rev', 'casc', 'big', 'lot', 'attn'\]/.test(cu) && /def fhs_paths\(/.test(cu) && /def mkt_null\(/.test(cu), '일곱 정의 · 요즘 흔들림 길 · 365곳 모두의 길');
  for (const k of ['herd', 'near', 'rev', 'casc', 'big', 'lot', 'attn']) assert.ok(new RegExp("'" + k + "': '[^']+'").test(cu), '이름 · 풀이 · 쓰는 곳 — ' + k);
  assert.ok(/METHOD = 'fhs'/.test(mc) && /CUL\.fhs_p\(/.test(mc), '몬테카를로 — 요즘 흔들림에 맞춘 길');
  assert.ok(/import su21_culture as CUL/.test(py) && /def cfilt\(k, lst\)/.test(py) && /con\(x\[1\], 'big'\)/.test(py) && /out\['listRule'\] = CUL\.RULE_ID/.test(py) && /out\['culture'\] = /.test(py) && /'cu': cu_of\(c\)/.test(py), 'su21.py — 문화로 빼고 세움 · 국민주 대장 · 규칙 이름');
  assert.ok(/VERSION = 'top3-v2'/.test(t3) && /G = 12/.test(t3) && /def measures\(x, now\)/.test(t3) && /seen\.add\(cells\[j\]\[1\]\)/.test(t3), '1억 번 셈 v2 — 잣대 셋 · 무게 열둘 · 서로 다른 회사');
  // (주문 1115-2328 — 첫 쪽 · 「왜?」 쪽 · 기록창 쪽을 지워 검사 ⑳ 과 그 길도 지움 · 자료 셈 시험은 그대로)
  const P = JSON.parse(rd('reports/atlas11/su-next/past-culture.json'));
  assert.equal(P.rule, 'culture7-v1');
  for (const g of ['hotNext', 'moneyNext', 'bloomNext']) for (const k of ['culture', 'mc1422', 'old', 'base']) assert.ok(P.res[g][k].picks > 0 && Number.isFinite(P.res[g][k].per100) && Number.isFinite(P.halves[g].first[k].per100) && Number.isFinite(P.halves[g].second[k].per100), g + ' ' + k);
  for (const [k, v] of Object.entries(P.calib)) assert.ok(v.n >= 1000 && v.new < v.old, '요즘 흔들림 길이 더 정직 — ' + k + ' ' + JSON.stringify(v));
  const T = JSON.parse(rd('site/su/data/su21.json'));
  assert.equal(T.listRule, 'culture7-v1');
  const CUJ = JSON.parse(rd('site/su/data/su21-cu.json'));
  assert.ok(T.culture?.rule === 'culture7-v1' && T.culture.pos && CUJ.rule === 'culture7-v1' && CUJ.asOf.board === T.asOf.board && CUJ.culture.traits.length === 7, '저장된 판 — 문화 일곱(su21-cu.json)');
  for (const [k, L] of Object.entries(T.lists)) if (k !== 'quiet') for (const c of L) assert.ok(!('cu' in c) && Array.isArray(CUJ.cu[k + ':' + c.code]?.on), '칸마다 흔적은 su21-cu.json 에만(첫 화면이 가볍게) — ' + k + ' ' + c.name); // 넷째 창(주문 1111-1334)은 「왜?」 쪽이 없어 흔적을 싣지 않음(su21.py CUOUT)
  assert.ok(['top3-v2', 'up3-v1'].includes(T.top3?.v) && new Set(T.top3.rank.map(r => r.code)).size === 3, '저장된 판 — 1억 번 셈 v2(주문 1111-1857 뒤 새 잣대) · 서로 다른 회사 셋');
  for (const t2 of ['문화 일곱으로 고르고', '1억 번 섞었어요.', '한국 투자자 문화 일곱 — 이 칸', '테마 몰림', '고점 앞 팔기', '본전 버티기', '빚투 쏠림', '국민주 쏠림', '한방 쫓기', '눈길 따라 사기', '바로 앞 셈은'])
    assert.ok(!/[A-Za-z%]/.test(t2) && !/매수|매도|추천|예측|확률|유망|신호/.test(t2), '새 글에 영어 · % · 쓰지 않을 말 없음 — ' + t2);
});

/** 주문 0103(사장님 2026-11-10 01:03 「어」 — 물음 「꽃이 될 듯 맞음을 고른 날부터 세도록 바꿀까요?」의 답) — 꽃이 될 듯 맞음 잣대 */
test('꽃이 될 듯 맞음 — 고른 날 값부터 셈 · 옛 잣대는 견줌으로만 · 화면 글 「고른 날부터」', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const P = JSON.parse(rd('reports/atlas11/su-next/past-culture.json')), py = rd('scripts/atlas11/next/su_culture_past.py');
  assert.equal(P.flower, 'pick'); assert.equal(P.schema, 'su-culture-past-2');
  assert.ok(P.what.bloomNext.includes('고른 날 값부터') && P.what.hotNext.includes('불장 일곱') && P.what.moneyNext.includes('돈이 몰리는 일곱'), '꽃만 바뀜 — 불장 · 돈 잣대는 그대로');
  for (const k of ['culture', 'mc1422', 'old', 'base']) assert.ok(P.bloomTrail.all[k] >= P.res.bloomNext[k].per100, '옛 잣대(덤 섞임)가 새 잣대보다 크거나 같음 — ' + k);
  assert.ok(P.res.bloomNext.culture.per100 > P.res.bloomNext.base.per100 && P.halves.bloomNext.first.culture.per100 > P.halves.bloomNext.first.base.per100 && P.halves.bloomNext.second.culture.per100 > P.halves.bloomNext.second.base.per100, '고른 날부터 세어도 아무 회사보다 많음(두 반년)');
  assert.ok(/def bloom_hit\(j, t\)/.test(py) && /EXF\[t\] = best/.test(py) && /resTrail = score\(PC, 'trail'\)/.test(py), 'su_culture_past.py — 고른 날부터 셈 · 옛 잣대 견줌');
  const T = JSON.parse(rd('site/su/data/su21.json'));
  assert.equal(T.past.bloomFrom, 'pick');
  assert.equal(T.past.bloomNext.per100, Math.round(P.res.bloomNext.culture.per100));
  assert.equal(T.past.hotNext.per100, Math.round(P.res.hotNext.culture.per100));
  const py21 = rd('scripts/atlas11/next/su21.py'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(py21.includes("'bloomFrom': PASTC.get('flower')"), 'su21.py — 고른 날 값부터 셈(주문 0103 · 화면 검사 ⑳ 은 그 쪽과 함께 지움 — 주문 1115-2328)');
  for (const t2 of ['고른 날부터 시장보다 100원에 15원 넘게 앞섰어요', '고른 날부터 ', P.what.bloomNext])
    assert.ok(!/[A-Za-z%]/.test(t2) && !/매수|매도|추천|예측|확률|유망|신호/.test(t2), '새 글에 영어 · % · 쓰지 않을 말 없음 — ' + t2);
});

/** 주문 0243(사장님 2026-11-10 02:43 「수르를 큐피트로 변경하고 만수를 천사로 변경하고  10번도 작업해」) — 이름 · 천사 단추 · 꽃이 될 듯 다듬기 */
test('이름 손자병법(옛 큐피트 · 주문 1115-1706) · 천사 단추 · 꽃이 될 듯은 빚투 · 본전을 빼지 않음(새 잣대로 지난 1년 네 철 모두 늘어남)', async () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const {BRAND, NAME, NAME_EN} = await import('../../site/next/brand.js');
  // 주문 1115-1706(사장님 2026-11-15(마카오) 16:10 「이름도 손자 병법으로 변경해」) — 이름 = 손자병법 · 영어 Sun Tzu · 큐피트는 was 맨 앞 · 수르는 그다음
  assert.equal(NAME, '손자병법'); assert.equal(NAME_EN, 'Sun Tzu'); assert.equal(BRAND.was[0].ko, '큐피트'); assert.equal(BRAND.was[0].en, 'Cupid'); assert.equal(BRAND.was[1].ko, '수르'); assert.equal(BRAND.was[1].en, 'Sur');
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/손자병법_본질.md')) && !fs.existsSync(path.join(ROOT, 'docs/큐피트_본질.md')) && !fs.existsSync(path.join(ROOT, 'docs/수르_본질.md')), '본질 파일 이름 따라감');
  const lock = JSON.parse(rd('config/atlas11/essence.lock.json')), rows = lock.files['docs/손자병법_본질.md'];
  assert.ok(rows && rows.some(r => r.words.includes('수르를 큐피트로 변경하고')) && rows.some(r => r.words.includes('이름도 손자 병법으로 변경해')) && rows.at(-1).sha256 === crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'docs/손자병법_본질.md'))).digest('hex'), '잠금 — 이름 바꾼 말씀 줄 둘(큐피트 · 손자병법) · 마지막 줄 = 지금 해시');
  const su = rd('site/su/su-sonja-top.js'), hn = rd('site/next/home-new.js'), boot = rd('site/next/boot-home.js'); // 옛 기능 명단(su-feat.js 「천사 단추」 줄)은 쪽과 함께 버림(주문 1114-1306 ⑧)
  // 천사 단추는 손자병법 판 머리 줄(su-sonja-top.js · 주문 1116-0300 — 옛 틀 page() 지움)
  assert.ok(su.includes("'aria-label': '천사 바로가기 · 새 창'}, h('b', {text: '천사'})") && su.includes("href: 'https://shin-yxy.gino.im/'")
    && hn.includes("h('span', {text: EN ? 'Angel' : '천사'})") && boot.includes("ms.append(el('span', null, '천사')"), '천사 단추 — 같은 바깥 주소');
  for (const [f, src] of [['su.js', su], ['home-new.js', hn], ['boot-home.js', boot]])
    assert.ok(!/['"`][^'"`\n]*만수르[^'"`\n]*['"`]/.test(src.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).map(l => l.replace(/\/\/.*$/, '')).join('\n')), '화면 글에 만수르 없음 — ' + f);
  const cu = rd('scripts/atlas11/next/su21_culture.py'), P = JSON.parse(rd('reports/atlas11/su-next/past-culture.json')), T = JSON.parse(rd('site/su/data/su21.json'));
  assert.ok(cu.includes("'bloomNext': [], 'money': [], 'moneyNext': []}") && cu.includes("NEG = {'hot': ['casc', 'rev'], 'bloom': ['casc'], 'hotNext': ['casc', 'rev'],"), '꽃이 될 듯만 빼기 없음 — 불장 · 꽃이 될 · 불장이 될 듯은 그대로');
  assert.ok(P.res.bloomNext.culture.per100 >= 32 && P.halves.bloomNext.first.culture.per100 > 31.8 && P.halves.bloomNext.second.culture.per100 > 29.6, '지난 1년 꽃이 될 듯 — 두 반년 모두 늘어남(31.8 · 29.6 보다)');
  assert.deepEqual(T.culture.neg.bloomNext, []); assert.ok(!T.rules.bloomNext.includes('본전 버티기는 뺌'), '42칸 셈 풀이');
});

/** 주문 0510(사장님 2026-11-10 05:10 「이곳에 글이 너무 어렵고 많아 핵심을 도식화로 만들어서 한눈에 알수있도록 해 11개 에이전트 활용하고 잡스라면 어떻기 했을지 공부 한다음 혁신적으로 개선해」)
 *  — 「왜?」 쪽 맨 위 한눈 그림(답 한 줄 · 고른 길 다섯 칸 · 칸 안에 기준 일곱) · 우연이었나 백 칸 · 지난 1년 백 칸 둘 · 긴 글은 접음 · 온도계 뒤 멈춤 · 검사 */
// (지움 — 주문 1115-2328 「어고쳐」: 이 시험이 보던 쪽(옛 회사 · 「왜?」 · 기록창 한국 시장 · 무하 부품 쪽)을 지움 · 옛 고리는 첫 쪽으로 감을 check_su.mjs ⑨ 가 잼)
test('옛 쪽 /new/ 버림 — site/new 없음 · 옛 주소 /new · /new/* 는 /su/ 로(302) · 넓은 말 줄보다 앞', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'site/new')), 'site/new 가 남음');
  const red = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/package.mjs'), 'utf8').split('\n').find(l => l.includes("path.join(dist, '_redirects')")) ?? '';
  const a = red.indexOf("'/new/*  /su/  302\\n/new  /su/  302\\n'"), b = red.indexOf('LANGS.map(');
  assert.ok(a > 0 && b > a, '_redirects 에 /new 두 줄(넓은 말 줄 /en/* · /zh/* 보다 앞)');
});

/** 주문 1116-0505(사장님 2026-11-16(마카오) 04:05 「이렇개 색도 넣고 깊이 있게 아주 자세하개 모든 그림과 동영상을 만둘어 …」 · 04:12 「어 맞아」) — 먹그림 색 판
    색은 그림 코드 · 표지 그림 · 꾸밈 파일의 종이 결에만 · 빨강 0(한국에서 빨강은 오름 — 꽃은 연분홍 · 도장은 밤색) · 남빛(#1F2A44)은 뜻이 있는 곳(꺾인 화살 · 오늘 돌 · 내림 · 판정)에만 · 표지 그림은 첫 쪽 글 속 데이터 주소와 같음 */
test('먹그림 색 판 — 빨강 0 · 연분홍 꽃 · 밤색 도장 · 종이 결 · 표지 그림 = 첫 쪽 글 속 그림(주문 1116-0505)', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const ink = rd('site/su/su-sonja-ink.js'), hero = rd('site/su/su-sonja-hero.svg'), html = rd('site/su/index.html'), css = rd('site/su/su-sonja.css');
  const reds = src => [...new Set([...src.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map(m => m[1].toUpperCase()))].filter(h => {
    const R = parseInt(h.slice(0, 2), 16), G = parseInt(h.slice(2, 4), 16), B = parseInt(h.slice(4, 6), 16), mx = Math.max(R, G, B), mn = Math.min(R, G, B), sat = mx ? (mx - mn) / mx : 0;
    let hue = 0; if (mx !== mn) hue = mx === R ? ((G - B) / (mx - mn)) * 60 : mx === G ? (2 + (B - R) / (mx - mn)) * 60 : (4 + (R - G) / (mx - mn)) * 60; if (hue < 0) hue += 360;
    return (hue >= 340 || hue <= 18) && sat > 0.45 && R > 140 && G < 120; });
  assert.deepEqual(reds(ink), [], '그림 코드 빨강 0');
  assert.deepEqual(reds(hero), [], '표지 그림 빨강 0');
  assert.ok(/export const C = Object\.freeze\(\{/.test(ink) && /pink: '#EFBFCA'/.test(ink) && /indigoDeep: '#4F6274'/.test(ink), '색 판(C) — 연분홍 꽃 · 쪽빛 잿빛');
  assert.ok(/KIT = Object\.freeze\(\{[^}]*\bC, tint, soft, offP, dryStroke, bark, mossDots, foliage, needles, flower, blossomBranch, grassTuft, reflection, spline, M, kkoeSvg\}/.test(ink), '그림 부품 모음에 색 판 부품');
  assert.ok(/#su svg\.ik-anim:not\(\.sj-stbar\) \{ background-image: url\("data:image\/svg\+xml,/.test(css), '종이 결(먹그림 바탕 무늬 · 정산 붓 막대는 뺌)');
  const enc = x => x.replace(/"/g, "'").replace(/\n/g, '').replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E');
  assert.ok(html.includes('<img class="sj-art" src="data:image/svg+xml,' + enc(hero) + '"'), '표지 그림 = 첫 쪽 글 속 데이터 주소(su-sonja-hero.svg 를 고치면 index.html 도 같이)');
  for (const k of ['g01', 'g18', 'g36']) assert.ok(new RegExp('^ {2}' + k + ': \\(\\) => ', 'm').test(ink), '꾀 장면 ' + k);
});

/** 주문 1116-1313(사장님 2026-11-16(마카오) 12:12 「정말 쉽게 뜻을 풀어줘 / 아이큐 85고 이해할수 있게」 · 12:13 「어」 — 그림마다 맨 위에 「이 그림 뜻」을 쉬운 한 줄로 크게)
    글은 site/su/su-sonja-mean.js 한 곳(가져오는 파일 0) · 만드는 곳 su-sonja-top.js meanCap · 그림을 그리는 자리마다 바로 앞에 그림 뜻 · 첫 칠함 판(index.html) 표지도 같은 글 */
test('그림 뜻 한 줄 — 그림마다 맨 위 · 꾀 서른여섯 · 쉬운 말 · 크게(주문 1116-1313)', async () => {
  const M = await import('../../site/su/su-sonja-mean.js'), D = await import('../../site/su/su-sonja-36.js'), W = await import('../../site/su/su-word.js');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  assert.deepEqual(Object.keys(M.PIC), [...D.K36], '꾀 그림 서른여섯마다 그림 뜻');
  const all = [...Object.values(M.PIC), ...Object.values(M.PM)];
  for (const t of all) {
    assert.ok(t && !t.includes('%') && !/[A-Za-z]/.test(t) && !/[㐀-鿿]/.test(t), '「%」 · 영어 · 한자 0 — ' + t);
    assert.deepEqual([...screenHits(t), ...ruinHits(t)], [], '쓰지 않을 말 0 — ' + t);
    assert.deepEqual(W.HARD.filter(w => W.has(t, w)), [], '어려운 낱말 0 — ' + t);
    for (const sn of t.split(/(?<=[.?!])\s+/)) assert.ok(sn.replace(/\s/g, '').length <= 35, '한 문장 35자 안(띄어쓰기 빼고) — ' + sn);
    assert.ok(/요\.$/.test(t), '「…요.」로 끝남 — ' + t);
  }
  for (const k of D.K36) assert.ok(/ 회사를 골라요\.$/.test(M.PIC[k]) && /(듯|처럼|끈),/.test(M.PIC[k]), k + ' — 그림 속 이야기처럼, 이런 회사를 골라요');
  assert.equal(M.whyMean('ik-why ik-anim', '0'), M.PM.why); assert.equal(M.whyMean('ik-why', ''), M.PM.whyDone); assert.equal(M.whyMean('ik-journal', '', '3'), M.PM.journal);
  assert.equal(M.whyMean('ik-journal', '', '0'), M.PM.journal0); assert.equal(M.whyMean('ik-tally'), M.PM.tally); assert.equal(M.whyMean('ik-groups'), M.PM.groups); assert.equal(M.whyMean('ik-arrows'), null);
  // 그림을 그리는 자리마다 바로 앞에 그림 뜻(꾀 그림 · 형세 · 화살 · 손무 · 쪽 머리 그림 · 산세 · 붓 막대 · 「왜 사?」 그림)
  const src = f => fs.readFileSync(path.join(ROOT, 'site/su/' + f), 'utf8'), sj = src('su-sonja.js'), kk = src('su-sonja-kkoe.js'), wy = src('su-sonja-why.js'), top = src('su-sonja-top.js');
  const calls = (s, re) => [...s.matchAll(re)].length;
  assert.equal(calls(sj + kk, /kkoeTile\(k,/g), calls(sj + kk, /meanCap\(PIC\[k\]\), kkoeTile\(k,/g), '꾀 그림 단추마다 바로 앞에 그림 뜻');
  assert.ok(/meanCap\(PIC\[k\], 'figcaption'\), kkoePic\(k, \{w: 390/.test(kk), '꾀 쪽 큰 그림 맨 위');
  assert.ok(/meanCap\(PM\.land, 'figcaption'\), landPic\(/.test(sj) && /meanCap\(PM\.arrows, 'figcaption'\), arrowsPic\(k\)/.test(sj), '형세 그림 · 화살 열 맨 위');
  assert.equal(calls(sj + kk + wy, /sonmuPic\(\{w: 84/g), calls(sj + kk + wy, /meanCap\(PM\.sonmu\), h\('span', \{class: 'sj-saysp'/g), '손무 말 상자마다 그림 뜻');
  for (const w of ['book', 'castle', 'ledger']) assert.ok(new RegExp("meanCap\\(PM\\." + w + ", 'figcaption'\\), heroPic\\('" + w + "'\\)").test(kk), '쪽 머리 그림 ' + w);
  assert.ok(/line \? meanCap\(PM\.ridge\) : null, line,/.test(kk) && /meanCap\(PM\.bars\),[^\n]*\n\s*h\('ol', \{class: 'sj-stl'\}/.test(kk), '회사 산세 · 정산 붓 막대 바로 위');
  assert.ok(/meanCap\(PM\.themes\),[^\n]*\n\s*h\('ol', \{class: 'sj-thl'\}/.test(sj), '첫 쪽 큰 갈래 붓 막대 바로 위(주문 1116-1601)');
  assert.ok(/capOf\(m\.ink\), m\.ink/.test(wy) && /capOf\(f\), f\)/.test(wy), '「왜 사?」 · 매매일지 그림 맨 위');
  assert.ok(/meanCap\(PM\.cover\)/.test(top) && src('index.html').includes('<section class="sj-cover" aria-label="손자병법 표지"><p class="sj-pm"><span class="sj-pmt">' + M.MEAN_TAG + '</span><b class="sj-pmb">' + M.PM.cover + '</b></p><div class="sj-artw">'), '표지 그림 뜻 = 첫 칠함 판 글 그대로');
  const css = src('su-sonja.css'), fz = sel => { const m = new RegExp(sel.replace(/[.]/g, '\\.') + ' \\{[^}]*font-size: ([\\d.]+)rem').exec(css); return m ? +m[1] * 16 : 0; };
  assert.ok(fz('#su .sj-page .sj-pmb') >= 22 && fz('#su .sj-page .sj-pmt') >= 17, '그림 뜻 글 크게(22px 넘게) · 이름표 17px 넘게');
});

test('세 거름 · 큰 갈래 차례 — 흉내 내 보기 · 소거 · 꾀 뜻을 모두 지난 곳만 · 채우지 않음 · 갈래 다섯 · 100원이 평균(주문 1116-1539 · 1116-1601)', async () => {
  const W = await import('../../site/su/su-word.js'), {screenHits, ruinHits} = await import('../../site/next/words.js');
  const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), sj = src('site/su/su-sonja.js'), kk = src('site/su/su-sonja-kkoe.js'), css = src('site/su/su-sonja.css');
  const py = src('scripts/atlas11/next/su21.py'), s36 = src('scripts/atlas11/next/su21_s36.py'), ck = src('scripts/atlas11/next/check_su.mjs');
  // 화면 글 — 영어 · 「%」 · 쓰지 않을 말 · 어려운 낱말 0 · 쪽 코드에 그대로 있음
  const said = ['꾀가 고른 회사, 큰 갈래 차례', '서른여섯 꾀 답에 회사가 많이 나온 갈래부터 ', '가지예요. 같은 일 하는 회사끼리 묶었어요.', '나온 회사 ', '곳 · 꾀 답에 ', '한 달 동안 100원이 평균 ', '한 달 값이 모자라 평균을 못 셌어요.', '오른 곳 ', ' · 내린 곳 ', ' · 그대로 ', '이 갈래 회사 ',
    '많이 나온 차례예요. 많이 오른 차례가 아니에요.', '오늘은 꾀 뜻에 맞는 곳이 없어요. 다른 곳으로 채우지 않았어요.', '세 가지 거름을 모두 지난 곳 가운데, 점수가 높은 일곱 곳까지예요. 점수는 수학 식과 정서 식으로 매겨요.', '곳을 세 가지로 걸렀어요.',
    '열 가지로 빼고 남은 곳', '꾀 뜻에 맞는 곳', '흉내 내 보기를 지난 곳', '셋 다 지난 곳', '셋 다 지난 곳이 없어 오늘은 고르지 않았어요.', '그 가운데 점수가 높은 7곳을 골랐어요.', '곳을 모두 골랐어요.',
    '하나, 빼기 ', ' — 이런 곳만 남겨요.', '둘, 꾀 뜻', ' — 「고르는 법」에 적힌 값 모습과 맞아야 해요.', '셋, 흉내 내 보기', '번 다시 놓아 봐요. 우연으로 보기 어려울 때만 남겨요.', '셋 다 지난 곳이 일곱 곳보다 적으면 적은 대로 둬요. 다른 곳으로 채우지 않아요.',
    '넷, 점수', ' — 꾀마다 수학 식과 정서 식을 골라 같은 무게로 더해요. 점수가 높은 차례로 일곱 곳까지 골라요.', // 꾀 점수(주문 1116-2134)
    '수학 식 — 값이 움직인 모습', '정서 식 — 사람 마음이 남긴 흔적', '이렇게 점수를 매겨요', ' 식을 같은 무게로 더해 점수를 매겨요. 고르는 법에 맞는 곳 가운데 점수가 높은 차례로 골라요.',
    '이렇게 해서 찾아낸 회사가 아래 제3장 「이렇게 해서 찾아낸 곳」이에요.', '이렇게 해서 찾아낸 곳', '제1장의 식으로 점수를 매겨 찾아낸 회사예요. '];
  const cutN = [...(/^CUT = \[([^\]]*)\]/m.exec(s36)?.[1] ?? '').matchAll(/\('\w+',\s*'([^']+)'\)/g)].map(m => m[1]); // 빼기 열 가지 이름(센 법 칸에 그대로 보임)
  assert.equal(cutN.length, 10, '빼기 열 가지 이름');
  for (const t of [...said, ...cutN]) {
    assert.ok(cutN.includes(t) || sj.includes(t) || kk.includes(t), '쪽 코드에 있음 — ' + t); // 꾀 쪽 글(su-sonja-kkoe.js)도
    assert.ok(!/[A-Za-z%]/.test(t) && !/[㐀-鿿]/.test(t), '영어 · 「%」 · 한자 0 — ' + t);
    assert.deepEqual([...screenHits(t), ...ruinHits(t)], [], '쓰지 않을 말 0 — ' + t);
    assert.deepEqual(W.HARD.filter(w => W.has(t, w)), [], '어려운 낱말 0 — ' + t);
    assert.ok(!/(^|[^0-9])위([^가-힣]|$)/.test(t) && !/수익률|추천|매수|매도/.test(t), '「○위」 · 권하는 말 0 — ' + t);
  }
  // 첫 쪽 · 꾀 쪽 자리 — 큰 갈래는 꾀 일곱 바로 앞 · 세 거름 수는 「고르는 법」 칸과 꾀 쪽 · 센 법 칸에 풀이 · 회사 단추가 아닌 이름(꾀 칸 회사 수 검사를 흔들지 않음)
  assert.ok(/themesBox\(g\),[^\n]*\n\s*h\('ol', \{class: 'sj-tricks'\}/.test(sj), '큰 갈래 = 꾀 일곱 바로 앞');
  assert.ok(/h\('p', \{class: 'sj-say', text: g\.say\?\.\[k\] \?\? ''\}\), funnel36\(g, k\)\)/.test(sj) && /\.\.\.pickHow\(g\)/.test(sj) && /funnel36\(g, k\),/.test(kk), '세 거름 수 · 풀이 자리');
  assert.ok(/class: 'sj-thco'/.test(sj) && !/sj-thco[^']*sj-chip|sj-chip[^']*sj-thco/.test(sj), '갈래 회사 단추 = sj-thco(꾀 칸 sj-chip 과 따로)');
  assert.ok(/#su \.sj-thco \{[^}]*min-height: 52px/.test(css) && /#su svg\.ik-anim\.sj-thbar \{ background-image: none; \}/.test(css), '갈래 회사 단추 누름 48 넘게 · 붓 막대에 종이 결 없음');
  for (const m of css.matchAll(/#su \.sj-(?:th|fun|pick)[^{]*\{[^}]*font-size: ([\d.]+)rem/g)) assert.ok(+m[1] * 16 >= 17, '글씨 17px 넘게 — ' + m[0].slice(0, 60));
  // 자료 — 꾀 칸 자료에 거른 법 · 걸러진 수 · 큰 갈래 · 회사마다 갈래 · 꺾은선 = 꾀를 고른 값
  assert.ok(/RULE_ID = 's36-v3'/.test(s36) && /^MC_RUNS = 10\b/m.test(s36) && /^MC_PATHS = 200\b/m.test(s36), 'su21_s36.py — s36-v3 · 흉내 내 보기 200번씩 10번');
  assert.ok(/NONE_MEAN = '꾀 뜻에 맞는 곳이 없어 고르지 않음'/.test(s36) && !/BON|가장 가까운 곳으로 채움/.test(s36.split('\n').filter(l => !l.trim().startsWith('#')).join('\n')), '모자라면 모자란 대로(채우지 않음)');
  assert.ok(/rows\.sort\(key=lambda r: \(-r\['n'\], -r\['hits'\], r\['name'\]\)\)/.test(py) && /'ind': \{c: ind36\(c\) for c in sorted/.test(py) && /'line': \{c: line36\(c\) for c in sorted/.test(py), 'su21.py — 회사 수 차례(같으면 나온 번) · 회사마다 갈래 · 꺾은선 = 꾀를 고른 값');
  const easy = /EASY_IND = (\{[^}]*\})/.exec(py); assert.ok(easy && !/[A-Za-z]/.test(Object.values(JSON.parse(easy[1].replace(/'/g, '"'))).join('')), '영어 든 갈래 이름 = 우리말');
  assert.ok(/㉘ 세 거름 자료/.test(ck) && /㉘ 꾀 뜻 = 고른 회사/.test(ck) && /㉘ 큰 갈래 다섯 자료/.test(ck) && /ol\.sj-stl, ol\.sj-thl'/.test(ck), 'check_su — 세 거름 · 꾀 뜻 · 큰 갈래 따로 셈 · 붓 막대 그림 뜻');
  // 꾀 점수(주문 1116-2134 · 사장님 2026-11-16(마카오) 20:34 「이 방정식을 36걔 병법에 올려라 각 방에 맞게 … 이헎개 해서 찾아낸 종목이라고 하라」) — 차례 = 수학 식 + 정서 식 · 꾀 쪽마다 쉬운 풀이 · 찾아낸 곳
  assert.ok(/Sc = \{k: mixscore\(k, T, Q\) for k in KINDS if k not in BY\}/.test(s36) && /Sc\.update\(\{k: mixscore\(k, T, Q\) for k in BY\}\)/.test(s36) && !/^def scores\(/m.test(s36), 'su21_s36.py — 차례 = 꾀 점수(옛 닮은 값 하나 차례 없앰)');
  assert.ok(/'mix': \{'rule': S36\.MIX_RULE, 'eq':/.test(py), 'su21.py — 꾀 칸 자료에 여섯 식 · 섞은 식 · 고른 곳 점수');
  assert.ok(/eqBox\(k\), \/\/ 꾀 점수 풀이/.test(kk) && /'aria-label': '이렇게 해서 찾아낸 곳'/.test(kk) && /export function eqBox\(k\)/.test(sj), '꾀 쪽 — 꾀 점수 풀이 칸 · 「이렇게 해서 찾아낸 곳」');
  for (const m of css.matchAll(/#su \.sj-eq[^{]*\{[^}]*font-size: ([\d.]+)rem/g)) assert.ok(+m[1] * 16 >= 16, '글씨 16px 넘게 — ' + m[0].slice(0, 60));
  assert.ok(/㉘ 꾀 점수 자료/.test(ck) && /eqWant\(k\)/.test(ck), 'check_su — 꾀 점수 따로 셈 · 꾀 쪽 풀이 칸 맞댐');
});

/** 주문 1116-2310 → 1117-0102(사장님 2026-11-16(마카오) 22:10 「… 한편에 영화처럼 중국 영화처럼 말이다 11처짜리 말이다」 · 2026-11-17 00:02 「36초짜리로 만들고 이야기를 풍성하개 스토리를 만들아 감정을 담아 영상을 지금보다 10배는 더 풍성하개 해」)
    그림마다 36초짜리 한 편 — 네 막(고요 · 긴장 · 반전 · 여운) · 한 번 놀고 멈춤 · 끝 모습 = 멈춘 그림 · 묶음 여섯마다 날씨 · 움직임 줄인 휴대폰 = 멈춘 그림 · 빨강 0 */
test('영화 한 편 36초 — 네 막 · 꾀 그림 · 쪽 머리 · 땅 · 손무 · 표지 덧칠이 36초 안에 한 번 · 묶음 여섯 날씨 · 움직임 줄이면 멈춘 그림(주문 1116-2310 → 1117-0102)', () => {
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const ink = rd('site/su/su-sonja-ink.js'), css = rd('site/su/su-sonja.css'), sj = rd('site/su/su-sonja.js'), kk = rd('site/su/su-sonja-kkoe.js');
  // 그림 코드 — 카메라 묶음 · 막마다 색 셋 · 날씨 두 겹 · 터짐 · 번쩍 · 짙은 가장자리 · (꾀 쪽 큰 그림 · 쪽 머리) 빛 기둥 · 바람 줄기 · 끝 도장 · 물결
  assert.ok(/export const FX = Object\.freeze\(\['gold', 'leaf', 'ember', 'rain', 'petal', 'snow'\]\);/.test(ink) && /export const fxOfK = k => FX\[Math\.floor\(\(\+String\(k\)\.slice\(1\) - 1\) \/ 6\)\]/.test(ink), '묶음 여섯 = 날씨 여섯(이김 금빛 · 맞섬 잎 · 공격 불티 · 혼란 비 · 연합 꽃비 · 패배 눈)');
  assert.ok(/fl \? s\('g', \{class: 'ik-cam'\}, scene\) : scene/.test(ink) && /class: fl \? 'ik-stamp' : null/.test(ink) && /class: 'ik-ring'/.test(ink), '꾀 그림 — 카메라 · 끝 도장 · 물결');
  assert.ok(/export const NA = 12, NB = 16, NC = 12, NG = 4, NR = 3;/.test(ink) && /export const LITE = Object\.freeze\(\{a: 8, b: 10, c: 6\}\);/.test(ink), '날씨 두 겹 · 터짐 · 바람 · 빛 기둥 수(가벼운 판 = 첫 쪽 작은 그림 · 땅 · 손무 · 표지)');
  assert.ok(/rich \? rays\(W, H\) : null/.test(ink) && /rich \? gusts\(W, H\) : null/.test(ink) && /burst\(W, H, seed, rich \? NC : LITE\.c\)/.test(ink) && ["'ik-flash'", "'ik-gc'", "'ik-gg'", "'ik-vig2'", "'ik-grade ik-gw'"].every(c => ink.includes('class: ' + c)), '막마다 색 셋 · 번쩍 · 짙은 가장자리 · 빛 기둥 · 바람');
  assert.ok(/class:"ik-hero"[^)]*\),FXHERO\[what\]\?\?"gold",390,170,\{seed:3,cam:!0,rich:!0\}\)\)/.test(ink) && /FXLAND\[land\]\?\?"petal",W,H,\{seed:5,bars:!1\}\)\)/.test(ink) && /'petal', 200, 240, \{seed: 7, bars: false, sweep: false\}/.test(ink), '쪽 머리(풍성한 판) · 땅 · 손무 그림도 한 편');
  assert.ok(/label: name \+ ' 그림', rich: false\}\)\)/.test(sj) && /kkoePic\(k, \{w: 390, h: 292, label: g\.name\[k\] \+ ' 그림'\}\), storyOl\(k\)\)/.test(kk), '첫 쪽 작은 그림 = 가벼운 판 · 꾀 쪽 큰 그림 = 풍성한 판 + 그림 속 이야기 네 막');
  assert.ok(/export const nCls = m => m >= 1 && m < 7 \? 'ik-n' \+ Math\.max\(4, m\) : null;/.test(ink) && /nc = fl \? nCls\(lastStage\(scene\)\) : null/.test(ink) && /const nc = nCls\(lastStage\(svg\)\); if \(nc\) svg\.classList\.add\(nc\);/.test(ink), '마지막 막이 반전에 오는 표(ik-n4 ~ ik-n6)');
  assert.ok(/export function coverFilm\(\)/.test(ink) && /aw\.insertBefore\(coverFilm\(\), aw\.querySelector\(':scope > \.sj-hwa'\)\)/.test(sj), '표지 덧칠(그림 파일은 그대로 — 그림 파일 안 꾸밈은 보안 규칙에 막힘)');
  assert.ok(!/style:|\.style\.|innerHTML/.test(ink.slice(ink.indexOf('/* ── 영화 한 편'), ink.indexOf('/** 그림 부품 → 움직임'))), '글 속 style · innerHTML 0');
  // 꾸밈 — 영화 그림의 움직임은 모두 36.5초 안에 끝(지연 + 길이) · 한 번
  const film = css.split('\n').filter(l => /^#su svg\.(ik-film|ik-hero\.ik-film|ik-land\.ik-film|sj-artfx)/.test(l));
  assert.ok(film.length >= 120, '영화 칸 ' + film.length);
  const sec = v => parseFloat(v), LIM = 36.5;
  const mdur = Math.max(...film.map(l => /^#su svg\.ik-film\.ik-play \.ik-\w+ \{ animation-duration: ([\d.]+)s; \}$/.exec(l)).filter(Boolean).map(m => sec(m[1])));
  assert.ok(mdur >= 1 && mdur <= 4.8, '그림 속 움직임 길이(보통 그림의 두 배 · 4.8초 안) ' + mdur);
  let nAnim = 0;
  for (const l of film) {
    const m = /animation: ([\w-]+) ([\d.]+)s [^;]*?([\d.]+)s 1 both/.exec(l); if (m) { nAnim++; assert.ok(sec(m[2]) + sec(m[3]) <= LIM, '36.5초 안 — ' + l.slice(0, 90)); }
    const d = /animation-delay: ([\d.]+)s;(?: animation-duration: ([\d.]+)s;)?/.exec(l);
    if (d && d[2]) assert.ok(sec(d[1]) + sec(d[2]) <= LIM, '36.5초 안 — ' + l.slice(0, 90));
    if (d && !d[2] && /\.ik-s\d/.test(l)) assert.ok(sec(d[1]) + mdur <= LIM && sec(d[1]) <= 20.6, '막 끝 36.5초 안 · 마지막 막은 반전(20.6초)까지 — ' + l.slice(0, 90));
    assert.ok(!/infinite/.test(l), '한 번만 — ' + l.slice(0, 80));
  }
  assert.ok(nAnim >= 15, '한 번 노는 움직임 ' + nAnim);
  for (const n of ['ik-cam', 'ik-bar', 'ik-gw', 'ik-gc', 'ik-gg', 'ik-vig2']) assert.ok(new RegExp('animation: ' + n + ' 36s ').test(css), n + ' — 36초 한 편');
  for (const n of [6, 5, 4]) assert.ok(new RegExp('#su svg\\.ik-film\\.ik-n' + n + '\\.ik-play \\.ik-s' + n + ' \\{ animation-delay: 20\\.6s; \\}').test(css), 'ik-n' + n + ' 마지막 막 = 반전 20.6초');
  assert.ok(/#su svg\.ik-film\.ik-play \.ik-s7 \{ animation-delay: 20\.6s; \}/.test(css), '일곱 막 마지막 = 반전 20.6초');
  // 처음부터 안 보이는 덧칠(움직임 줄인 휴대폰 = 멈춘 그림)
  const hid = /^#su svg\.ik-film \.ik-fx \.ik-p, (.*) \{ opacity: 0; \}$/m.exec(css)?.[1] ?? '';
  for (const c of ['ik-sweep', 'ik-ring', 'ik-swash', 'ik-gc', 'ik-gg', 'ik-flash', 'ik-vig2', 'ik-ray', 'ik-q', 'ik-gu']) assert.ok(hid.includes('#su svg.ik-film .' + c), '놀 때만 보임 — ' + c);
  // 끝 모습 = 멈춘 그림
  const kf = n => new RegExp('@keyframes ' + n + ' \\{[^\\n]*\\}').exec(css)?.[0] ?? '';
  assert.ok(/100% \{ transform: none; \} \}$/.test(kf('ik-cam')) && /100% \{ transform: none; \} \}$/.test(kf('ik-bar')), '카메라 · 검은 띠 끝 = 제자리');
  assert.ok(/100% \{ opacity: 1; \} \}$/.test(kf('ik-gw')) && ['ik-gc', 'ik-gg', 'ik-vig2', 'ik-flash'].every(n => /100% \{ opacity: 0; \} \}$/.test(kf(n))), '막마다 색 끝 = 처음 그림 색');
  for (const k of ['ik-up', 'ik-ember', 'ik-leaf', 'ik-petal', 'ik-snow', 'ik-rain', 'ik-upS', 'ik-emberS', 'ik-leafS', 'ik-petalS', 'ik-snowS', 'ik-rainS', 'ik-gust', 'ik-ray', ...Array.from({length: 12}, (_, i) => 'ik-bst' + i)]) assert.ok(/^@keyframes [\w-]+ \{ 0% \{ opacity: 0;.*100% \{ opacity: 0;/.test(kf(k)), k + ' — 처음과 끝은 안 보임');
  for (let i = 0; i < 12; i++) assert.ok(new RegExp('#su svg\\.ik-film\\.ik-play \\.ik-a' + i + ' \\{').test(css) && new RegExp('#su svg\\.ik-film\\.ik-play \\.ik-c' + i + ' \\{').test(css), '날씨 a · 터짐 칸 ' + i);
  for (let i = 0; i < 16; i++) assert.ok(new RegExp('#su svg\\.ik-film\\.ik-play \\.ik-b' + i + ' \\{').test(css), '날씨 b 칸 ' + i);
  // 전쟁 영화 · 옛 동양 영화(주문 1117-0243 「더 전쟁 영화처럼 더 고전 동양 영화처럼」) — 옛 필름 빛깔 · 깜빡임 · 긁힘 · 티끌 · 먹 번짐 · 북소리 · 화살 비 · 깃발 · 흙먼지 · 큰 해
  assert.ok(/oldFilm\(W, H, seed, rich\),/.test(ink) && /inkWash\(W, H\),/.test(ink) && /drums\(W, H\),/.test(ink) && /rich \? volley\(W, H, seed\) : null/.test(ink) && /rich \? banners\(W, H\) : null/.test(ink) && /rich \? warDust\(W, H\) : null/.test(ink) && /rich \? bigSun\(W, H\) : null/.test(ink), '전쟁 · 옛 필름 덧칠(가벼운 판 = 옛 필름 · 먹 번짐 · 북소리)');
  for (const c of ['ik-sepia', 'ik-flick', 'ik-scr', 'ik-dust', 'ik-ink', 'ik-drum', 'ik-arw', 'ik-ban', 'ik-dst', 'ik-bsun']) assert.ok(hid.includes('#su svg.ik-film .' + c), '놀 때만 보임 — ' + c);
  for (const k of ['ik-ink', 'ik-drum', 'ik-arrow', 'ik-ban', 'ik-wdust', 'ik-bsun', 'ik-scr0', 'ik-scr1', 'ik-scr2', ...Array.from({length: 8}, (_, i) => 'ik-dust' + i)]) assert.ok(/^@keyframes [\w-]+ \{ 0% \{ opacity: 0;.*100% \{ opacity: 0;[^}]*\} \}$/.test(kf(k)), k + ' — 처음과 끝은 안 보임');
  assert.ok(/100% \{ opacity: 0; \} \}$/.test(kf('ik-sepia')) && /100% \{ opacity: 0; \} \}$/.test(kf('ik-flick')) && /100% \{ transform: none; \} \}$/.test(kf('ik-flag')), '옛 필름 빛 · 깜빡임 · 깃발 끝 = 멈춘 그림');
});

/** 주문 1117-0102 — 꾀 쪽 큰 그림 바로 아래 「그림 속 이야기」 네 막(고요 · 긴장 · 반전 · 여운) · 막마다 한 줄 · 감정 · 쉬운 말 · 그림이 그 막에 오면 그 줄이 밝아짐 */
test('그림 속 이야기 네 막 — 꾀 서른여섯마다 네 줄 · 쉬운 말 · 감정 · 넷째 줄 = 이렇게 찾은 회사 · 36초에 맞춰 밝아짐(주문 1117-0102)', async () => {
  const S = await import('../../site/su/su-sonja-story.js'), D = await import('../../site/su/su-sonja-36.js'), W = await import('../../site/su/su-word.js');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  assert.deepEqual(Object.keys(S.STORY36), [...D.K36], '꾀 서른여섯마다 이야기');
  assert.deepEqual([...S.ACTS], ['고요', '긴장', '반전', '여운'], '네 막 이름');
  for (const t of [S.STORY_TAG, ...S.ACTS, ...Object.values(S.STORY36).flat()]) {
    assert.ok(t && !/[A-Za-z%]/.test(t) && !/[㐀-鿿]/.test(t), '「%」 · 영어 · 한자 0 — ' + t);
    assert.deepEqual([...screenHits(t), ...ruinHits(t)].map(x => x.word ?? x), [], '쓰지 않을 말 0 — ' + t);
    assert.deepEqual(W.HARD.filter(w => W.has(t, w)), [], '어려운 낱말 0 — ' + t);
    assert.ok(!/(^|[^0-9])위([^가-힣]|$)/.test(t) && !/수익률|추천|매수|매도|가장|급등/.test(t), '「○위」 · 권하는 말 0 — ' + t);
    for (const sn of t.split(/(?<=[.?!])\s+/)) assert.ok(sn.replace(/\s/g, '').length <= 35, '한 문장 35자 안(띄어쓰기 빼고) — ' + sn);
  }
  for (const k of D.K36) {
    const L = S.STORY36[k];
    assert.equal(L.length, 4, k + ' — 네 막');
    for (const t of L) assert.ok(/요[.!]$/.test(t), k + ' — 「…요.」 — ' + t);
    assert.ok(/회사(를 (이렇게 )?찾아요|예요)\./.test(L[3]), k + ' — 넷째 줄 = 이렇게 찾은 회사 — ' + L[3]);
    assert.ok(!/오를 거|오를 것|오릅니다|사세요|파세요|팔아요/.test(L.join(' ')), k + ' — 앞날을 맞히지 않고 사고팔기를 권하지 않음');
  }
  for (const k of ['g34', 'g36']) assert.ok(S.STORY36[k][3].endsWith('더 내릴 수도 있어요.'), k + ' — 내린 곳을 고르는 꾀는 「더 내릴 수도 있어요」');
  assert.ok(S.STORY36.g31[3].includes('꺾이기도'), 'g31 — 하루 만에 꺾이는 일');
  // 쪽 · 꾸밈 — 큰 그림 바로 아래 · 막마다 밝아짐 · 끝 = 네 줄 그대로 · 움직임 줄이면 그대로 · 글씨 17px 넘게 · 검사가 글 그대로 맞댐
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), kk = rd('site/su/su-sonja-kkoe.js'), css = rd('site/su/su-sonja.css'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(/import \{STORY36, ACTS, STORY_TAG\} from '\/su\/su-sonja-story\.js';/.test(kk) && /h\('ol', \{class: 'sj-story', 'aria-label': STORY_TAG\}/.test(kk), '꾀 쪽 — ol.sj-story');
  for (let i = 1; i <= 4; i++) assert.ok(new RegExp('@keyframes sj-act' + i + ' \\{[^\\n]*100% \\{ opacity: 1;[^\\n]*\\} \\}').test(css), 'sj-act' + i + ' 끝 = 그대로');
  assert.ok(/animation: sj-act1 36s linear 0s 1 both;/.test(css) && /@media \(prefers-reduced-motion: reduce\) \{ #su ol\.sj-story > li \{ animation: none !important; \} \}/.test(css), '36초 한 번 · 움직임 줄이면 그대로');
  const fs17 = [...css.matchAll(/#su \.sj-kfig \.sj-act[tb] \{[^}]*font-size: ([\d.]+)rem/g)];
  assert.equal(fs17.length, 2); for (const m of fs17) assert.ok(+m[1] * 16 >= 17, '글씨 17px 넘게 — ' + m[0].slice(0, 60));
  assert.ok(/story: \(STORYC\.STORY36\[k\] \?\? \[\]\)\.map\(\(t, i\) => \[STORYC\.ACTS\[i\], t\]\)/.test(ck) && /\? 36500 : 7000/.test(ck), 'check_su — 이야기 네 줄 = 글 그대로 · 영화 36.5초 안');
});
