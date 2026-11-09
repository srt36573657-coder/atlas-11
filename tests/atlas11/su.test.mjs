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
  assert.equal(forwardTo('', '#/r/k'), null, '#/r/k 기록창(주문 0814) — 수르 안');
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

/** 주문 1532(사장님 2026-11-08 15:32 「6번으로 해서 잡스에 빙식으로 해서 만들어봐」) — 잡스 판 첫 페이지(su-apple · 샘플 j06) — 부품 꼴 · 꾸밈 파일 · 글 속 꾸밈 0 · 처음 쪽과 될 듯 21곳이 이 판 */
test('잡스 판 첫 페이지 — su-apple 부품 꼴 · 처음 쪽과 될 듯 21곳', () => {
  const t = fs.readFileSync(path.join(ROOT, 'site/su/su-apple.js'), 'utf8');
  assert.ok(/export async function load\(/.test(t) && /export function picture\(/.test(t), '부품 꼴');
  assert.ok(/export const CSS = '\/su\/su-apple\.css'/.test(t) && fs.existsSync(path.join(ROOT, 'site/su/su-apple.css')), '꾸밈 파일');
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\.style\b|Math\.random/.test(t), '글 속 꾸밈 · 아무 수 0');
  assert.ok(/'data-show': 'now-next'/.test(t) && /'data-clean': 'jobs'/.test(t), '지금 · 될 듯 한 판 · 덜어낸 판 표시');
  const u = fs.readFileSync(path.join(ROOT, 'site/su/su-21.js'), 'utf8');
  assert.equal((u.match(/artHero\('su-apple'/g) ?? []).length, 2, '처음 쪽 · 될 듯 21곳이 잡스 판');
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
  const t = fs.readFileSync(path.join(ROOT, 'site/su/su-apple.js'), 'utf8');
  assert.ok(/get\('\/su\/data\/su21-next\.json'\)\.catch\(\(\) => null\)/.test(t) && /const NXF = \['close', 'date', 'c'\]/.test(t), '될 듯 셋의 현재가 · 21 마지막 값은 su21-next.json 에서(못 받으면 「확인 필요」)');
  assert.ok(/function note2\(y, a, b, k = ''\)/.test(t), '설명 글은 두 조각(첫 화면 가장 큰 칠함이 되지 않게)');
  assert.ok(/function spark\(sp, x, y, w, h, side\)/.test(t) && /class: 'sa-sp0'/.test(t) && /class: 'sa-spA'/.test(t) && /class: 'sa-spB'/.test(t), '꺾은선 · 한 달 전 줄 · 마지막 점(찬 점 · 고리)');
  assert.ok(/pxOf\(c\) === c\.c\[20\]/.test(t) && /c\.date === day/.test(t), '끝 값 = 현재가 · 그날 값일 때만(아니면 「확인 필요」)');
  assert.ok(/note2\(PY \+ 202, '현재가는', \(mday\(day\) \? mday\(day\) \+ ' ' : ''\) \+ '마지막 값이에요\.', 'note1'\)/.test(t), '현재가 날짜 글');
  // 장 중 현재가(주문 2011 · 20:11 「어 그렇게 하고」) — 그린 뒤 /api/price 를 물어 받은 칸만 바꿈 · 오늘이 판보다 뒤면 맨 앞 하루를 빼고 오늘 값을 끝에 · 장 중이면 1분마다
  assert.ok(/fetch\('\/api\/price\?codes=' \+ codes\.join\(','\)\)/.test(t) && /j\.day > day \? \[\.\.\.c\.it\.sp\.slice\(1\), v\.p\] : \[\.\.\.c\.it\.sp\.slice\(0, 20\), v\.p\]/.test(t) && /setTimeout\(ask, 60000\)/.test(t), '장 중 현재가 — 받은 칸만 · 한 달 꺾은선 끝 · 1분마다');
  assert.ok(/if \(opt\.live !== false\) live\(svg, d\?\.asOf\?\.board \?\? null\)/.test(t), '그림은 바로 · 값은 받은 뒤');
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\.style\b|Math\.random/.test(t), '글 속 꾸밈 · 아무 수 0');
  const css = fs.readFileSync(path.join(ROOT, 'site/su/su-apple.css'), 'utf8');
  assert.ok(/\.su-apple \.sa-sp \{ fill: none; stroke: #86868B; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; \}/.test(css), '선 2px 둥근 이음');
  assert.ok(/\.su-apple \.sa-spA \{ fill: #D97706; stroke: #FFFFFF; stroke-width: 2; \}/.test(css), '마지막 점 흰 고리 2px');
  const L = h => { const c = [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const C = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  assert.ok(C('#D97706', '#FFFFFF') >= 3 && C('#86868B', '#FFFFFF') >= 3, '점 · 선 색 대비 3 넘게(흰 바탕)');
});

/** 주문 1708(사장님 2026-11-08 17:08 「왜? 이 디자인이 남아 있어! 구슬으로 첫페이지 해서 다 변경해야 하잖아」 · 17:18 「맞아」) — 첫 페이지 위아래까지 흰 구슬 판 · 새 판이면 스스로 새로 고침 */
test('첫 페이지 위아래까지 흰 구슬 판 · 새 판이면 스스로 새로 고침(주문 1708)', () => {
  const css = fs.readFileSync(path.join(ROOT, 'site/su/su-apple.css'), 'utf8');
  const P = ':root:has(#su)'; // 주문 2011(20:11 「모든 페이지를 첫페이지 기준으로」) — 수르 모든 쪽에 같은 흰 판(1708 에는 구슬 그림이 있는 쪽만)
  const i = css.indexOf(P + ' {'); assert.ok(i >= 0, '수르 쪽(#su)마다 색 이름을 흰 판 값으로');
  const V = Object.fromEntries([...css.slice(i, css.indexOf('}', i)).matchAll(/--([a-z0-9]+):\s*(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2]]));
  const art = fs.readFileSync(path.join(ROOT, 'site/su/su-art.css'), 'utf8'), a0 = art.indexOf(':root {');
  const names = [...art.slice(a0, art.indexOf('}', a0)).matchAll(/--([a-z0-9]+):/g)].map(m => m[1]);
  for (const k of [...names, 'sky1', 'sky2']) assert.ok(V[k], '어두운 모드 값이 남지 않게 색 이름 모두 — ' + k);
  assert.equal(V.bg, '#FFFFFF'); assert.equal(V.card, '#FFFFFF'); assert.equal(V.sky1, '#FFFFFF'); assert.equal(V.sky2, '#FFFFFF');
  assert.ok(/color-scheme: light;/.test(css.slice(i, css.indexOf('}', i))), '어두운 모드 휴대폰에서도 흰 판');
  const L = h => { const c = [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const C = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  assert.ok(C(V.ink, V.bg) >= 7 && C(V.mute, V.bg) >= 4.5 && C(V.mute, V.soft) >= 4.5 && C(V.chipt, V.chip) >= 4.5 && C(V.warn, V.bg) >= 4.5, '글 대비(본문 7 · 흐린 글 4.5 넘게)');
  for (const s of ['.su-corners', '.su-orn', '.su-sky']) assert.ok(css.includes(P + ' ' + s), '무하 꾸밈 뺌 — ' + s);
  for (const s of ['.su-top::after { content: none; }', '.su-tabs::before { content: none; }']) assert.ok(css.includes(P + ' ' + s), '금빛 물결 줄 뺌 — ' + s);
  for (const s of ['.su-top {', '.su-dock {', '.su-tabs {']) assert.ok(new RegExp(P.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' ' + s.replace(/[.{]/g, '\\$&') + ' background: #FFFFFF;').test(css), '위아래 흰 바탕 — ' + s);
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const sels = [...flat.matchAll(/([^{}]+)\{[^{}]*\}/g)].map(m => m[1].trim()).filter(s => !s.startsWith('@')).flatMap(s => s.split(',').map(x => x.trim()));
  const OK = [P, '#su::before', '#su::after', '.su-apple ', '.su-news > .su-hero[data-g="su-apple"]'];
  assert.ok(sels.length > 40 && sels.every(s => OK.some(o => s.startsWith(o))), '수르 밖(지금 수르 /next/ 등)에는 걸리지 않음(꾸밈마다 #su 안) — ' + sels.filter(s => !OK.some(o => s.startsWith(o))).slice(0, 3).join(' | '));
  const html = fs.readFileSync(path.join(ROOT, 'site/su/index.html'), 'utf8');
  assert.ok(html.includes('<link rel="stylesheet" href="/su/su-apple.css">'), '처음부터 붙임(위아래가 옛 색으로 깜빡이지 않게)');
  const js = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8');
  assert.ok(js.includes("const VER = '/su/version.json'") && js.includes("document.addEventListener('visibilitychange', fresh)") && /pageshow', e => \{ if \(e\.persisted\) fresh\(\); \}/.test(js), '화면이 다시 보일 때 판 표를 새로 받음');
  assert.ok(/if \(v !== ver0\) \{ ver0 = v; location\.reload\(\); \}/.test(js) && /if \(!v\) return;/.test(js), '표가 바뀌었을 때만 한 번 새로 고침 · 못 받으면 그대로');
  assert.ok(html.includes('<meta name="theme-color" content="#FFFFFF">') && !/theme-color" content="#(?!FFFFFF)/.test(html), '휴대폰 맨 위 띠 색도 흰색(모든 쪽 — 주문 2011)');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/version.json'), 'utf8')), {v: 'dev'}, '저장소 판 표 = dev');
  assert.ok(/fs\.writeFile\(path\.join\(dist, 'su\/version\.json'\)/.test(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/package.mjs'), 'utf8')), '묶을 때마다 새 판 표');
});

/** 주문 1023 「머스크 판 4」 — 일꾼 열하나가 서로 모르게 만든 무하 그림 부품(docs/design/su-musk-2026-11-05/pic-brief.md) */
const ART4 = ['su-show.js', 'su-women-e.js', 'su-mucha.js', 'su-land-art.js', 'su-co-art.js', 'su-more-art.js', 'su-stop-art.js', 'su-rec-art.js', 'su-road-art.js'];
test('무하 그림 부품 — 부품 꼴(load · picture · CSS) · 꾸밈 파일 · 신 72 · 스승 39 무하 얼굴(기계가 그린 그대로 · 글자 · style · 스크립트 0) · 앵무새(주문 1023 [3] 4 · [5] 3)', async () => {
  for (const f of ART4) {
    const t = fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8');
    assert.ok(/export async function load\(/.test(t) && /export function picture\(/.test(t), f + ' 부품 꼴');
    const css = /export const CSS = '\/su\/([a-z0-9-]+\.css)'/.exec(t); assert.ok(css && fs.existsSync(path.join(ROOT, 'site/su', css[1])), f + ' 꾸밈 파일');
    const used = ['su.js', 'su-21.js', 'su-why.js', 'su-roads.js'].some(u => fs.readFileSync(path.join(ROOT, 'site/su', u), 'utf8').includes("'" + f.replace(/\.js$/, '') + "'"));
    if (used) assert.ok(fs.readFileSync(path.join(ROOT, 'site/su/index.html'), 'utf8').includes('/su/' + css[1]) || /await cssOf\(M\.CSS\)/.test(fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8')), f + ' 쓰는 부품의 꾸밈 파일을 쪽이 받음(첫 화면은 index.html · 나머지는 부품을 쓸 때)');
    assert.ok(/data-mucha/.test(t), f + ' 무하 요소 이름표');
  }
  // 공용 부품(su-mucha-kit.js — 심사 2회 공통 약점 다섯을 한 번 잘 그림 · 일꾼 둘이 따로 만든 a · b 가운데 a · docs/design/su-musk-2026-11-05/kit-brief.md · r4-brief.md 2판)
  const K = fs.readFileSync(path.join(ROOT, 'site/su/su-mucha-kit.js'), 'utf8');
  for (const n of ['svg', 'taper', 'strands', 'face', 'hair', 'medallion', 'scroll', 'stemBar', 'vine', 'beads', 'rays', 'sleeve', 'leafBar', 'plaque', 'ribbon']) assert.ok(new RegExp('export function ' + n + '\\(').test(K), '공용 부품 ' + n);
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\.style\b|Math\.random/.test(K), '공용 부품 — 글 속 꾸밈 · 아무 수 0(같은 입력 → 같은 그림)');
  { // 주문 2011 — 쓰는 쪽이 모두 잡스 판 부품으로 바뀌어 공용 무하 꾸밈 · 부품을 첫 화면이 받지 않음(느린 휴대폰 첫 그림) · 옛 무하 부품을 다시 쓰면 다시 받게
    const callers = ['su.js', 'su-21.js', 'su-why.js', 'su-roads.js'].map(u => fs.readFileSync(path.join(ROOT, 'site/su', u), 'utf8')).join('\n');
    const kitUsed = ART4.filter(f => /su-mucha-kit/.test(fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8'))).some(f => callers.includes("'" + f.replace(/\.js$/, '') + "'"));
    const ix = fs.readFileSync(path.join(ROOT, 'site/su/index.html'), 'utf8');
    assert.equal(ix.includes('/su/su-mucha-kit.css'), kitUsed, '공용 부품 꾸밈은 쓰는 부품이 있을 때만 쪽이 받음');
    assert.equal(ix.includes('/su/su-mucha-kit.js'), kitUsed, '공용 부품은 쓰는 부품이 있을 때만 미리 받음');
  }
  const {execFileSync} = await import('node:child_process');
  execFileSync('node', [path.join(ROOT, 'scripts/atlas11/next/su_faces.mjs'), '--check'], {cwd: ROOT, stdio: 'pipe'}); // 다르면 끝 코드 1 → 던짐
  const R = fs.readFileSync(path.join(ROOT, 'site/next/roman72.js'), 'utf8'), nums = [...new Set([...R.matchAll(/^\s*\[(\d+), '/gm)].map(m => +m[1]))];
  const sg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/next/data/sage39.json'), 'utf8')).people.map(p => p.id);
  const faces = [...nums.map(n => 'site/su/faces/roman/' + n + '.svg'), ...sg.map(id => 'site/su/faces/sage/' + id + '.svg')];
  assert.equal(faces.length, 111, '신 72 + 스승 39');
  for (const f of [...faces, 'site/media/su-parrot.svg']) {
    const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/<text|style=|<style|<script|href="http|xlink:href="http/.test(t), f + ' 글자 · style · 스크립트 · 바깥 그림 0');
    assert.ok(t.length < 16000, f + ' 16KB 안');
  }
  const G = fs.readFileSync(path.join(ROOT, 'site/su/su-gods.js'), 'utf8');
  assert.ok(G.includes("'/su/faces/roman/'") && G.includes("'/su/faces/sage/'"), '수르는 무하 얼굴을 씀(옛 얼굴은 옛 화면이 그대로)');
  assert.ok(fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8').includes("'/media/su-parrot.svg'"), '다음 단추 앵무새 = 무하풍');
});

/** 주문 2011 「모든 페이지를 첫페이지 기준으로」 — 무하 그림 부품을 첫 페이지(흰 구슬 판 su-apple) 말투로 새로 그린 잡스 판 부품(옛 무하 부품은 지우지 않고 둠 · docs/design/su-jobs-all-2026-11-08/brief.md) */
const JOBS = ['su-land-jobs.js', 'su-co-jobs.js', 'su-more-jobs.js', 'su-stop-jobs.js', 'su-rec-jobs.js', 'su-road-jobs.js'];
test('잡스 판 부품 — 부품 꼴 · 꾸밈 파일(제 이름 아래만) · 깨끗한 판 표시 · 글 속 꾸밈 · 아무 수 0 · 쓰는 쪽이 옛 무하 부품 대신 부름(주문 2011)', () => {
  const callers = ['su.js', 'su-21.js', 'su-why.js', 'su-roads.js'].map(u => fs.readFileSync(path.join(ROOT, 'site/su', u), 'utf8')).join('\n');
  for (const f of [...JOBS, 'su-frame-jobs.js']) {
    const t = fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8'), name = f.replace(/\.js$/, '');
    if (f === 'su-frame-jobs.js') assert.ok(/export function frame\(/.test(t), f + ' 틀 꼴');
    else assert.ok(/export async function load\(/.test(t) && /export function picture\(/.test(t), f + ' 부품 꼴');
    const css = /export const CSS = '\/su\/([a-z0-9-]+\.css)'/.exec(t); assert.ok(css && css[1] === name + '.css' && fs.existsSync(path.join(ROOT, 'site/su', css[1])), f + ' 꾸밈 파일');
    assert.ok(/data-clean['"]?\s*[:,]\s*['"]jobs['"]|'data-clean', 'jobs'/.test(t), f + ' 깨끗한 판 표시(data-clean="jobs")');
    assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\.style\b|Math\.random/.test(t), f + ' 글 속 꾸밈 · 아무 수 0');
    assert.ok(!/data-mucha/.test(t), f + ' 무하 요소 0');
    const C = fs.readFileSync(path.join(ROOT, 'site/su', css[1]), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const sels = [...C.matchAll(/(^|[{}])\s*([^@{}\s][^{}]*?)\s*\{/g)].map(m => m[2].trim()).filter(x => x && !/^(from|to|\d+%)/.test(x));
    assert.ok(sels.length > 5 && sels.every(x => x.split(',').every(y => y.trim().startsWith('.' + name))), f + ' 꾸밈은 제 이름(.' + name + ') 아래만');
    if (f !== 'su-frame-jobs.js') assert.ok(callers.includes("'" + name + "'"), f + ' 쓰는 쪽이 부름');
  }
  for (const old of ['su-land-art', 'su-co-art', 'su-more-art', 'su-stop-art', 'su-rec-art', 'su-road-art']) assert.ok(!callers.includes("'" + old + "'"), old + ' 대신 잡스 판(옛 파일은 남김)');
});

test('새 판 화면(새로 씀) — 일곱 번 누름 여덟 화면 · 탭 넷 기승전결 · 「왜 사?」 열한 질문이 지금 수르와 글자 그대로 · 화면 낱말 거르기 0(주문 1616)', async () => {
  const src = f => fs.readFileSync(path.join(ROOT, 'site/su/' + f), 'utf8');
  const su = src('su.js'), wy = src('su-why.js'), all = su + wy + src('su-six.js') + src('su-fig.js') + src('su-word.js') + src('su-art.js') + src('su-21.js') + src('su-gods.js') + src('su-roads.js') + src('su-wrap.js') + src('su-sky.js') + ART4.map(src).join('') + JOBS.map(src).join('') + src('su-frame-jobs.js') + src('su-mucha-kit.js'), why = fs.readFileSync(path.join(ROOT, 'site/next/p-why.js'), 'utf8');
  const arr = (s, name) => { const m = new RegExp('export const ' + name + ' = Object\\.freeze\\((\\[[\\s\\S]*?\\])\\);').exec(s); assert.ok(m, name); return JSON.parse(m[1].replace(/'/g, '"')); };
  const qs = [...why.matchAll(/\{q: '([^']+)'/g)].map(m => m[1]);
  assert.equal(qs.length, 11);
  assert.deepEqual(arr(wy, 'WHY_QS'), qs, '열한 질문 = site/next/p-why.js QS 의 q 그대로');
  const g = /export const GROUPS = (\[\[[^\n]*\]\]);/.exec(why); assert.ok(g);
  assert.deepEqual(arr(wy, 'WHY_GROUPS'), JSON.parse(g[1].replace(/'/g, '"')), '네 묶음 = p-why.js GROUPS 그대로');
  const st = /export const STEPS = (\[null, [^\n]*\]);/.exec(su); assert.ok(st, 'STEPS');
  const steps = new Function('return ' + st[1])().slice(1);
  assert.equal(steps.length, 8, '여덟 화면 = 다음 단추 일곱 번');
  assert.deepEqual(steps.map(x => x[1]), [0, 1, 1, 2, 2, 3, 3, 3], '걸음이 기승전결 차례로 이어짐(주문 2044 — 21곳 · 땅 지도 · 업종 · 회사 · 자세히 · 왜 사? · 매매일지 · 친구에게)');
  const tl = /const TABS = \(\) => \[([\s\S]*?)\]\];/.exec(su); assert.ok(tl, 'TABS');
  const tabNames = [...tl[1].matchAll(/\['([0-9가-힣]+)', /g)].map(m => m[1]);
  assert.deepEqual(tabNames.slice(0, 4), ['21곳', '지도', '기록', '멈춤'], '탭 넷 = 쪽마다 tab 값 차례(0 21곳 · 1 지도 · 2 기록 · 3 멈춤 — 주문 2044)');
  const to = /export const TAB_ORDER = Object\.freeze\((\[[0-9, ]+\])\);/.exec(su); assert.ok(to, 'TAB_ORDER');
  assert.deepEqual(JSON.parse(to[1]).map(i => tabNames[i]), ['21곳', '지도', '멈춤', '기록'], '보이는 차례 = 중요한 차례 21곳 · 지도 · 멈춤 · 기록(주문 1023 [4] 토론)');
  assert.ok(su.includes("'탭 — 중요한 차례 21곳 · 지도 · 멈춤 · 기록'"));
  for (const href of ['#/', '#/r', '#/r/m', '#/r/w', '#/r/d', '#/r/y', '#/r/n', '#/q', '#/q/127120', '#/j', '#/c/127120', '#/m', '#/m/hold', '#/f', '#/c/127120/more']) assert.equal(forwardTo('', href), null, '새 판 안 — ' + href);
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...all.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|['"]style['"]|\.style\./.test(all + src('su-feat.js')), '보안 규칙 — innerHTML · 글 속 style 없음');
  // 옛 기능 명단(주문 0054 [4]) — name 은 자료 2 글자 그대로라 화면에는 say ?? name 과 how 가 보임 → 그 글에 쓰지 않을 말 0
  const {FEAT} = await import('../../site/su/su-feat.js');
  assert.equal(FEAT.length, 82, '자료 2 옛 기능 82가지');
  const fbad = FEAT.flatMap(f => { const t = (f.say ?? f.name) + ' ' + f.how; return [...screenHits(t), ...ruinHits(t).map(x => x.word)].map(w => w + ' ← ' + f.id); });
  assert.deepEqual(fbad, [], '옛 기능 화면 이름 · 한 줄에 쓰지 않을 말 0');
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


test('21곳(주문 2044 · 사장님 2026-11-04 15:44(+04) 「수르 전면 개편 명령서」 [1]) — 상장 회사 모두 → 우량주 365 → 셋 일곱씩 · 21곳은 365 안에서만 · 겹친 곳 표시 · 숫자는 받은 자료 그대로', () => {
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21.json'), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/atlas11/view/board.json'), 'utf8'));
  const in365 = new Set(B.companies.map(c => c.code));
  assert.equal(T.schema, 'su21-2');
  assert.ok(Number.isInteger(T.counts.listed) && T.counts.listed > 2000, '상장 회사 수 = 받은 자료(mkt.json n)');
  assert.equal(T.counts.b365, in365.size, '우량주 = 지금 판(board.json) 그대로');
  // 엄격 셈(주문 0854 · 2026-11-09 09:02 「어」) — 묶음마다 기준을 모두 지난 곳만(일곱 이하) · 남는 자리는 비움 · 수 = su21.json strict.groups 의 final
  const ST = T.strict?.rule ? T.strict : null, seven = k => (ST ? (assert.ok(T.lists[k].length <= 7, k + ' 일곱 이하(엄격)'), assert.equal(T.lists[k].length, ST.groups[k].final, k + ' = 엄격 셈 마지막 수')) : assert.equal(T.lists[k].length, 7, k + ' 일곱'));
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
    if (k === 'hot') assert.ok(Number.isFinite(w.ind20) && Number.isFinite(c.ch20), 'hot 까닭 ' + c.name);
    if (k === 'money') assert.ok(Number.isFinite(w.indX) && Number.isFinite(w.gain), 'money 까닭 ' + c.name);
    if (k === 'bloom') assert.ok(Number.isFinite(w.indX), 'bloom 까닭 ' + c.name); }
  // 될 듯 셋(주문 1103 · 사장님 2026-11-08 11:03 「불장이 될듯 · 돈이 몰릴듯 · 싹에서 꽃이 될듯 7개 추가하자」 · 11:08 「응」) — 일곱씩 · 365 안 · 지금 셋과 같은 종류에는 겹치지 않음 · 까닭 값 · 지난 1년 기록
  const NOWK = {hotNext: 'hot', bloomNext: 'bloom', moneyNext: 'money'};
  for (const k of ['hotNext', 'bloomNext', 'moneyNext']) {
    seven(k);
    const now = new Set(T.lists[NOWK[k]].map(c => c.code));
    for (const c of T.lists[k]) { assert.ok(in365.has(c.code), k + ' ' + c.name + ' 365 안'); assert.ok(c.in.includes(k)); assert.ok(!now.has(c.code), k + ' ' + c.name + ' — 지금 일곱과 겹치지 않음');
      const w = c.why ?? {};
      if (k === 'hotNext') assert.ok(Number.isFinite(w.r20) && (w.how === 'rank' ? Number.isInteger(w.rank) && w.rank >= 8 && w.rank <= 14 : w.how === 'five'), 'hotNext 까닭 ' + c.name);
      if (k === 'moneyNext') assert.ok(Number.isFinite(w.gain) && w.gain > 0, 'moneyNext 까닭 ' + c.name);
      if (k === 'bloomNext') assert.ok(Number.isFinite(w.x5) && w.x5 >= 0 && Number.isFinite(w.x20) && w.x20 < 5, 'bloomNext 까닭(싹) ' + c.name); }
    assert.ok(Number.isFinite(T.past?.[k]?.per100) && Number.isFinite(T.past?.[k]?.base100) && T.past[k].n > (T.past.strict ? 50 : 500), k + ' 지난 1년 기록(엄격 셈은 고른 수가 적음 — 80 ~ 180번)');
  }
  assert.ok(T.rules.hotNext && T.rules.moneyNext && T.rules.bloomNext, '될 듯 셋 규칙 글');
  const js = fs.readFileSync(path.join(ROOT, 'site/su/su-21.js'), 'utf8');
  assert.ok(!/[가-힣][^'\n]*%/.test([...js.matchAll(/'([^'\n]*)'/g)].map(m => m[1]).join('\n')), '새 글에 % 없음');
});

test('잡스 판(주문 0054 · 사장님 2026-11-04 18:54(+03)) — 칸 이름 녹이기 · 신 지킴이 · 수르 틀 · 본질 세 줄', async () => {
  const {sixSay} = await import('../../site/su/su-fig.js');
  for (const k of ['누가', '언제', '어디서', '무엇을', '어떻게', '왜']) {
    const empty = sixSay(k, ''), full = sixSay(k, '한진칼 · 항공 업종');
    assert.ok(empty.includes('확인 필요') && empty !== k + ' 확인 필요' && !new RegExp('^' + k + '\\s*[:·]').test(empty), '빈 칸은 「확인 필요」를 그 자리 말과 함께(이름표 「누가:」 꼴 아님) — ' + k);
    assert.ok(!full.startsWith(k + ' ') && !full.startsWith(k + ':'), '칸 이름표 없이 문장 — ' + k);
  }
  assert.equal(sixSay('누가', '한진칼'), '한진칼 이야기예요.');
  assert.equal(sixSay('왜', '까닭이에요.'), '까닭이에요.', '이미 문장이면 그대로');
  const R = fs.readFileSync(path.join(ROOT, 'site/next/roman72.js'), 'utf8'), G = fs.readFileSync(path.join(ROOT, 'site/su/su-gods.js'), 'utf8');
  const nums = new Set([...R.matchAll(/^\s*\[(\d+), '/gm)].map(m => +m[1]));
  assert.equal(nums.size, 72, '옛 신 명단 일흔둘');
  const rooms = /SU_ROOMS = Object\.freeze\(\{([\s\S]*?)\}\);/.exec(G)?.[1] ?? '';
  const used = [...rooms.matchAll(/:\s*(\d+)/g)].map(m => +m[1]);
  assert.ok(used.length >= 15 && used.every(n => nums.has(n)), '수르 방마다 지킴이 신 = 옛 명단 안의 신');
  const sg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/next/data/sage39.json'), 'utf8'));
  assert.equal(sg.people.length, 39, '스승 서른아홉');
  for (const p of sg.people) assert.ok(fs.existsSync(path.join(ROOT, 'site/next/sage-art', p.id + '.svg')), '스승 얼굴 그림 — ' + p.id);
  const W = fs.readFileSync(path.join(ROOT, 'site/su/su-wrap.js'), 'utf8');
  { // 주문 2011 · 2250 — 옛 쪽 첫 페이지 색 파일 셋(모든 선택자가 html.su-jobs 로 시작) · 밤 판을 뗀 뒤 자리 · 크기 지킴 칸 = 옛 꾸밈 파일에서 지은 그대로 · 색 파일을 받은 뒤 밤 판을 뗌
    const {execFileSync} = await import('node:child_process');
    execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/wrap_keep.py'), '--check'], {cwd: ROOT, stdio: 'pipe'});
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
    assert.ok(/'\/privacy\.html': '\/su\/privacy\.html'/.test(W) && fs.readFileSync(path.join(ROOT, 'site/su/su-roads.js'), 'utf8').includes("if (o === '/privacy.html') return '/su/privacy.html';"), '수르 쪽 · 수르 틀 안 옛 쪽 고리 → 짝 쪽');
  }
  assert.ok(/new URLSearchParams\(search\)\.get\('su'\)/.test(W) && /hasOwnProperty\.call\(GROUPS, g\)/.test(W), '수르 틀은 ?su=<묶음> 일 때만(모르는 값은 씌우지 않음)');
  for (const f of ['site/next/index.html', 'site/atlas/index.html']) assert.ok(fs.readFileSync(path.join(ROOT, f), 'utf8').includes('/su/su-wrap.js'), '옛 쪽에 수르 틀 — ' + f);
  const {ESSENCE} = await import('../../site/next/essence.js');
  assert.ok(ESSENCE[0].includes('불장') && ESSENCE[0].includes('꽃이 될') && ESSENCE[0].includes('돈이 몰리는') && ESSENCE[0].includes('365'), '첫 화면 본질 첫 줄 = 셋 · 365(자료 0)');
  const doc = fs.readFileSync(path.join(ROOT, 'docs/수르_본질.md'), 'utf8');
  assert.ok(/^1\. 수르의 본질: 불장 종목, 꽃이 될 종목, 돈이 몰리는 종목을 찾아내는 탐지다\./m.test(doc), '본질 문서 1번 = 자료 0');
  assert.ok(/^2\. 셋을 돕는 일/m.test(doc), '옛 하는 일 셋 → 셋을 돕는 일');
});

/** 주문 0123(사장님 2026-11-09 01:23 · 01:44 · 02:01 · 02:02 · 02:04 「어」) · 주문 0200(02:00 「어」) — 「왜?」 쪽 · 42칸 첫 발견 · 며칠째 · 포모지수 · 회사 쪽 현재가 */
test('「왜?」 쪽 — 길 · 서른여섯 가지 · 기준 일곱 · 포모 까닭 · 42칸 줄 · 회사 쪽 현재가', () => {
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8'), y = fs.readFileSync(path.join(ROOT, 'site/su/su-why36.js'), 'utf8');
  const ap = fs.readFileSync(path.join(ROOT, 'site/su/su-apple.js'), 'utf8'), cj = fs.readFileSync(path.join(ROOT, 'site/su/su-co-jobs.js'), 'utf8'), pk = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/package.mjs'), 'utf8');
  assert.ok(/\\\/y\\\/\(hot\|bloom\|money\|hotNext\|moneyNext\|bloomNext\)\$\/\.test\(a\)\) v = await \(await import\('\/su\/su-why36\.js'\)\)\.vWhy\(X21, a\.slice\(0, 6\), a\.slice\(9\)\)/.test(su), '길 #/c/<번호>/y/<묶음>');
  assert.ok(fs.existsSync(path.join(ROOT, 'site/su/su-why36.css')) && /export const CSS = '\/su\/su-why36\.css'/.test(y), '꾸밈 파일');
  for (const k of ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext']) assert.ok(new RegExp(`\\b${k}: \\{기: \\[`).test(y), '중요한 차례 — ' + k);
  assert.ok(/PARTS = Object\.freeze\(\[\s*\{id: '기'/.test(y) && /items\.length >= 9/.test(y) && /while \(p\.items\.length < 9 && spare\.length\)/.test(y), '기 · 승 · 전 · 결 아홉씩');
  assert.ok(/export function crit7/.test(y) && /fomo11/.test(y) && /rows\.slice\(0, 11\)/.test(y), '기준 일곱 · 포모 까닭 열하나');
  assert.ok(/'#\/c\/' \+ encodeURIComponent\(it\.code\) \+ '\/y\/' \+ it\.k/.test(ap) && /'sa-found'/.test(ap) && /'sa-days'/.test(ap) && /const ROW = 140/.test(ap), '첫 페이지 칸 — 누르면 「왜?」 · 첫 발견 · 며칠째 · 포모지수');
  assert.ok(/psrc: bd \? 'board' : 'co'/.test(cj) && /function live\(svg, m, P, id\)/.test(cj) && /su21-next\.json/.test(cj), '회사 쪽 현재가 = 첫 페이지 값 · 장 중 1분마다');
  // 주문 0806(사장님 2026-11-09 08:06 「어 그렇게 해」) — 회사 쪽 한 달 꺾은선 = 첫 페이지 칸 값 21개 · 같은 날짜 · 시장 줄은 날짜가 꼭 맞을 때만 · 장 중에는 칸과 똑같이 밀림
  assert.ok(/bd\.c\.length !== 21/.test(cj) && /bd\.c\[20\] !== bd\.close/.test(cj) && /lsrc: B \? 'board' : 'co'/.test(cj), '칸 값 잣대 = 첫 페이지 spOf 와 같음(21개 · 끝 값 = 현재가)');
  assert.ok(/function idxAt\(H, market, cd\)/.test(cj) && /v\.every\(fin\) \?/.test(cj), '시장 줄 = 그 21날 지수 값이 모두 있을 때만');
  assert.ok(/const sh = jday > \(day \|\| ''\), v = sh \? m\.lv\.slice\(1\)\.concat\(\[p\]\) : m\.lv\.slice\(0, 20\)\.concat\(\[p\]\)/.test(cj) && /il = sh \? null : m\.il/.test(cj), '장 중 — 첫 페이지 relive 와 같은 셈 · 밀리면 시장 줄 없음');
  assert.ok(/const sp = j\.day > day \? \[\.\.\.c\.it\.sp\.slice\(1\), v\.p\] : \[\.\.\.c\.it\.sp\.slice\(0, 20\), v\.p\]/.test(ap), '첫 페이지 셈(맞댄 짝)');
  const S21 = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/next/su21.py'), 'utf8');
  assert.ok(/HEAVY = \('c', 'cFrom', 'cd',/.test(S21) && /'cFrom': v\.get\('cFrom'\), 'cd': cdOf\(c\)/.test(S21) && /st\.get\('boardId'\) == b\.get\('boardId'\)/.test(S21), '판 날짜 21개(같은 판 회사 파일 · 값이 모두 같을 때만)');
  for (const f of ['su21_replay.mjs', 'su21_days.mjs', 'su21_fomo.mjs']) assert.ok(pk.includes('scripts/atlas11/next/' + f), '묶을 때 셈 — ' + f);
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21.json'), 'utf8')), W = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/su21-why.json'), 'utf8'));
  const all = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'].flatMap(k => T.lists[k]);
  assert.ok(T.strict ? all.length <= 42 : all.length === 42, '저장된 판 칸 수(엄격 셈이면 42 아래 · 주문 0854)');
  assert.ok(all.every(c => Number.isInteger(c.days) && c.days >= 1 && /^\d{4}-\d{2}-\d{2}$/.test(c.found) && (c.fomo === null || (Number.isInteger(c.fomo) && c.fomo >= 0 && c.fomo <= 100))), '저장된 판 42칸 — 며칠째 · 첫 발견 · 포모');
  assert.equal(W.board, T.asOf.board); assert.equal(W.checks.length, 7); assert.ok(W.mc.paths >= 20000);
});

/** 주문 0814(사장님 2026-11-09 08:14 「… 총 7가지를 파악해서 기록창을 만들어 먼저 기재 하라 에이전트 활용하라」 · 08:25 「수르에 올려야해」) — 기록창 「한국 시장 일곱 가지」 */
test('기록창 — 한국 시장 일곱 가지(자료 꼴 · 쓰지 않을 말 0 · 「%」 0 · 영어 글자 0 · 길 · 서랍)', async () => {
  const K = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/su/data/kr7.json'), 'utf8'));
  assert.equal(K.schema, 'su-kr7-1'); assert.match(K.at, /^\d{4}-\d{2}-\d{2}$/); assert.equal(K.items.length, 7);
  const W = await import('../../site/next/words.js');
  const strs = [K.lead, ...(K.how ?? [])];
  for (const it of K.items) {
    for (const k of ['t', 'one', 'kr', 'why', 'culture', 'tag']) { assert.equal(typeof it[k], 'string', it.t + ' ' + k); assert.ok(it[k].trim().length > 1, it.t + ' ' + k); strs.push(it[k]); }
    assert.ok([...it.culture].length <= 5 && [...it.tag].length <= 8, it.t + ' 한눈 그림 글 길이(문화 다섯 · 모습 여덟 글자 안)');
    assert.ok(Array.isArray(it.vs) && it.vs.length >= 2 && it.vs.every(v => v.who && v.s), it.t + ' 다른 나라 둘 넘게'); for (const v of it.vs) strs.push(v.who, v.s);
    assert.ok(Array.isArray(it.src) && it.src.length >= 1 && it.src.every(x => typeof x === 'string' && /\d{4}/.test(x)), it.t + ' 근거(해 적힘)'); strs.push(...it.src);
    if (it.bars) { assert.ok(it.bars.rows.length >= 2 && it.bars.rows.some(r => r.who === '한국' || r.kr === true) && it.bars.rows.every(r => Number.isFinite(r.v) && r.v >= 0 && r.t), it.t + ' 견줌 그림'); strs.push(it.bars.title, ...(it.bars.note ? [it.bars.note] : []), ...it.bars.rows.flatMap(r => [r.who, r.t])); }
  }
  const all = strs.join('\n');
  assert.deepEqual([...W.screenHits(all), ...W.ruinHits(all)].map(x => x.word ?? x), [], '쓰지 않을 말 0');
  assert.ok(!all.includes('%'), '「%」 없음'); assert.ok(!/[A-Za-z]/.test(all), '영어 글자 없음');
  const su = fs.readFileSync(path.join(ROOT, 'site/su/su.js'), 'utf8'), k7 = fs.readFileSync(path.join(ROOT, 'site/su/su-kr7.js'), 'utf8');
  assert.ok(/a === 'k' \? await \(await import\('\/su\/su-kr7\.js'\)\)\.vKr7\(X21\)/.test(su) && /drawer\('#\/r\/k', '한국 시장 일곱 가지'/.test(su), '길 #/r/k · 기록 쪽 서랍');
  assert.ok(/export const CSS = '\/su\/su-kr7\.css'/.test(k7) && fs.existsSync(path.join(ROOT, 'site/su/su-kr7.css')) && !/innerHTML|outerHTML|insertAdjacentHTML|\.style\b|Math\.random|https?:\/\//.test(k7), '꾸밈 파일 · 글 속 꾸밈 0 · 아무 수 0 · 바깥 고리 0');
});

/** 주문 0854(사장님 2026-11-09 08:54 「몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로」 · 09:02 「어」) — 엄격 셈 · 빈 자리 · 「왜?」 쪽 */
test('엄격 셈 — su21.py 가 지금 셈 일곱을 거름 · 첫 페이지 빈 자리 · 「왜?」 쪽 기준 31가지 · 묶을 때 su21-strict.json', () => {
  const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const py = src('scripts/atlas11/next/su21.py'), ap = src('site/su/su-apple.js'), y = src('site/su/su-why36.js'), pk = src('scripts/atlas11/package.mjs'), rp = src('scripts/atlas11/next/su21_replay.mjs');
  assert.ok(/import su21_strict as ST/.test(py) && /PICK, STRICT = ST\.select\(CTX, OLD7, fin_of\)/.test(py) && /su21-strict\.json/.test(py) && /past-strict\.json/.test(py), 'su21.py — 일곱 → 엄격 셈 · 자세히 파일 · 지난 1년');
  assert.ok(/function empty\(x, y, w, h, side, first\)/.test(ap) && /const rowsOf = k => STRICT \? 7/.test(ap) && /'31가지 기준을', '모두 지난 곳만 보여요\.'/.test(ap), '첫 페이지 — 일곱 줄 · 빈 자리 · 한 줄 글');
  assert.ok(/export function strict31\(SX, T, k, code\)/.test(y) && /su21-strict\.json/.test(y) && /strictBox/.test(y), '「왜?」 쪽 — 더 엄격하게 상자');
  assert.ok(pk.includes("'su21-strict.json'") && rp.includes("'days.json'") && rp.includes('RULE_NOW'), '묶을 때 · 지난 판 다시 세기(하루 값 · 규칙이 바뀌면 다시 셈)');
});
