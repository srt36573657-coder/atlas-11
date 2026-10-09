// 매수 검토 후보 규칙 cand-rules-5 「기르기판 — 1년 추세 상위 20% 그물 · 새로 든 초입 7곳 · 석 달 담아 두기」(연구용 · 성능 검증 전) — lib/atlas11/cand.mjs
// 사장님 2026-10-09 13:48 「난 하루에 돈이 몰리는 것을 찾는게 아닌데 요즘 올리곳을 찾아 시스템에 도입 하는거야」 · 14:21 · 14:36 · 15:00 「더 현명하고 지혜로운 방법을 찾아봐」 · 15:21 「만들어 줘」
//   4판(20만 번 다시 뽑기) 셈 도구(seedOf · rngOf · mcDraw · mcOf)는 4판 기록 따로 세기용으로 남아 그대로 시험
import test from 'node:test';
import assert from 'node:assert/strict';
import {candOf, candRecordOf, candPubOf, CAND_RULES, RULES4, FLAGS5, seedOf, rngOf, mcOf, mcDraw, drawsTxt, inflowIndexOf, quantileOf, trendOf, plantOf} from '../../lib/atlas11/cand.mjs';

const even = (v, n = 10) => Array(n).fill(v / n);
// 5판 작은 판 — 거래일 300개(그물은 252 + 20 거래일 기록이 있어야) · 값은 쓰는 날에만(판 날 · 20 · 40 · 252 · 272거래일 전)
const SES = Array.from({length: 300}, (_, i) => new Date(Date.parse('2025-08-01T00:00:00Z') + i * 86400e3).toISOString().slice(0, 10));
const K0 = 299, ASOF = SES[K0], fundOk = {fy: '2025.12', roe: 10, op: 100, net: 80, debt: 60, cap: 10000};
const stock = (code, g, o = {}) => ({code, name: '회사' + code, g, gl: '업종' + g, status: 'ok', date: ASOF, close: 1000, r20: 5, r5: 1, vsIdx20: 3, fund: fundOk, fl: {f10e: 6e8, i10e: 4e8, f10: 1, i10: 1}, ...o});
const disc = (title, at, level = 2) => ({id: title + at, publishedAt: at, title, level});
const agendaOf = map => ({byCode: Object.fromEntries(Object.entries(map).map(([code, ds]) => [code, {disclosures: ds, upcoming: []}]))});
/** m = 오늘 1년 추세 · mp = 20거래일 전 1년 추세 · c = 오늘 종가(담은 날 = 20거래일 전 값 100에서) */
function boardOf(spec) {
  const prices = new Map(), stocks = [], groups = {};
  for (const [code, g, m, mp, c = 100 * (1 + m), o = {}] of spec) {
    const p = new Map([[SES[K0 - 252], 100], [SES[K0 - 20], 100 * (1 + m)], [SES[K0], c], [SES[K0 - 272], 100], [SES[K0 - 40], 100 * (1 + mp)]]);
    prices.set(code, p); stocks.push(stock(code, g, o)); (groups[g] ??= []).push(code);
  }
  return {stocks, priceAt: (code, d) => prices.get(code)?.get(d) ?? null, board: {groups: Object.entries(groups).map(([id, codes]) => ({id, label: '업종' + id, codes})), companies: stocks.map(s => ({code: s.code, info: {pos52: 0.5}}))}};
}
// 쉰 곳 — 오래 그물 안 넷(o) · 새로 든 여섯(n · 같은 업종 g1 넷) · 아래 마흔(l)
const SPEC = [...[3.0, 2.9, 2.8, 2.7].map((m, i) => [`o${i + 1}`, 'g0', m, 2.5]),
  ['n1', 'g1', 2.6, 0.105], ['n2', 'g1', 2.5, 0.115], ['n3', 'g2', 2.4, 0.125, undefined, {fund: {...fundOk, op: -5}}], ['n4', 'g3', 2.3, 0.135], ['n5', 'g1', 2.2, 0.145], ['n6', 'g1', 2.1, 0.155],
  ...Array.from({length: 40}, (_, i) => [`l${String(i + 1).padStart(2, '0')}`, 'g9', i / 100, i / 100])];
const RISK = {n4: [disc('관리종목 지정', `${SES[K0 - 3]}T09:00:00+09:00`)]};

test('씨앗 · 고른 수 — 32비트 정수 셈(같은 씨앗 → 같은 줄 · 파이썬 따로 세기와 같은 값)', () => {
  assert.equal(seedOf(''), 2166136261); assert.equal(seedOf('a'), 3826002220); assert.equal(seedOf('cand-rules-4|2026-10-08'), 3486102883);
  const r = rngOf(1); assert.deepEqual([r(), r(), r()].map(x => x.toFixed(12)), ['0.627073940588', '0.002735721180', '0.527447039960']);
  const a = rngOf(7), b = rngOf(7); for (let i = 0; i < 1000; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1); }
  assert.equal(RULES4.id, 'cand-rules-4'); assert.equal(RULES4.draws, 200000); assert.equal(CAND_RULES.id, 'cand-rules-5'); assert.equal(drawsTxt(200000), '20만 번'); assert.equal(drawsTxt(2500), '2,500번');
});

test('포모지수(돈 유입) = 비율이 여럿 가운데 어디쯤 — 1등 100 · 꼴찌 0 · 같은 값은 가운데 · 값 없으면 null', () => {
  const ix = inflowIndexOf([3, 1, 2, null, 2]);
  assert.equal(ix(3), 100); assert.equal(ix(1), 0); assert.equal(ix(2), 50); assert.equal(ix(null), null);
  assert.equal(inflowIndexOf([5])(5), 100);
});


test('한 번 뽑기(소거법 한 번) — 열 날 그대로면 다시 뽑기 전 차례 · 진입 조건 먼저 · 비율 큰 순 · 같은 업종 3곳 · 7곳', () => {
  const mk = (code, g, cap, met, d) => ({code, g, cap, met, fi: d});
  const base = [mk('a1', 'A', 1000, 1, even(30)), mk('a2', 'A', 1000, 1, even(20)), mk('a3', 'A', 1000, 1, even(10)), mk('a4', 'A', 1000, 1, even(40)),
    mk('b1', 'B', 100, 0, even(50)), mk('c1', 'C', 1000, 1, [100, ...Array(9).fill(-5)]), mk('d1', 'D', 1000, 1, even(-10))];
  const id = mcDraw(base, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(id, ['c1', 'a4', 'a1', 'a2', 'b1'], 'c1 5.5% · a4 4% · a1 3% · a2 2% (a3 는 같은 업종 넷째) · 조건 대기 b1(50%)은 뒤 · d1 순매도 빠짐');
  assert.deepEqual(mcDraw(base, [1, 1, 2, 3, 4, 5, 6, 7, 8, 9]), ['a4', 'a1', 'a2', 'b1'], '큰 날(0)이 빠지면 c1 은 순매도');
});

test('20만 번 — 하루에 기댄 회사는 열에 일곱이 못 됨((9/10)^10 ≈ 35%는 그 날이 빠짐) · 같은 씨앗이면 같은 횟수', () => {
  const base = [{code: 'x', g: 'A', cap: 100, met: 1, fi: [50, ...Array(9).fill(-1)]}, {code: 'y', g: 'B', cap: 100, met: 1, fi: even(10)}];
  const m = mcOf({base, days: 10, seed: 42, draws: 20000}), m2 = mcOf({base, days: 10, seed: 42, draws: 20000});
  assert.deepEqual([...m.counts], [...m2.counts]);
  assert.equal(m.counts.get('y'), 20000); const x = m.counts.get('x'); assert.ok(x > 12600 && x < 13400, `x = ${x} ≈ 1 − 0.9^10 = 65%`);
});



test('넘파이 분위수와 같은 직선 보간 · 1년 추세(마지막 20거래일 뺌 · 소수 넷째 자리) · 담는 날(60거래일마다)', () => {
  assert.equal(quantileOf([1, 2, 3, 4, 5], 80), 4.2); assert.equal(quantileOf([null, 5, 1], 50), 3); assert.equal(quantileOf([], 80), null);
  const {priceAt} = boardOf([['a', 'g', 0.123456, 0]]);
  assert.equal(trendOf('a', K0, SES, priceAt), 0.1235); assert.equal(trendOf('zz', K0, SES, priceAt), null); assert.equal(trendOf('a', 100, SES, priceAt), null, '252거래일 기록이 모자람');
  const R = {...CAND_RULES, plantFrom: SES[100], hold: 60};
  assert.deepEqual(plantOf(SES[100], SES, R), {at: SES[100], k: 100, next: SES[160], day: 0});
  assert.deepEqual(plantOf(SES[219], SES, R), {at: SES[160], k: 160, next: SES[220], day: 59});
  assert.deepEqual(plantOf(SES[290], SES, R), {at: SES[280], k: 280, next: null, day: 10}, '다음 담는 날이 달력 밖이면 null');
  assert.equal(plantOf(SES[50], SES, R).at, SES[50], '첫 담는 날 전이면 그날');
  assert.equal(CAND_RULES.netPct, 20); assert.equal(CAND_RULES.hold, 60); assert.equal(CAND_RULES.plantFrom, '2026-10-08');
});

test('담는 날 — 그물(상위 20%) · 초입(20거래일 전 그물 밖) · 기준(흑자 · 위험 공시 없음) · 1년 추세 큰 순 · 같은 업종 3곳', () => {
  const {stocks, priceAt, board} = boardOf(SPEC);
  const c = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(RISK), sessions: SES, priceAt});
  assert.equal(c.ready, true); assert.equal(c.rules, 'cand-rules-5');
  assert.equal(c.pool.valid, 50); assert.equal(c.pool.net, 10, '오래 넷 + 새로 여섯'); assert.equal(c.pool.netElig, 8, '적자 n3 · 관리종목 n4 뺌'); assert.equal(c.pool.newc, 4);
  assert.deepEqual(c.items.map(x => x.code), ['n1', 'n2', 'n5'], 'n6 은 같은 업종 넷째(밀림) · 모자라면 모자란 대로(7곳을 채우지 않음)');
  assert.deepEqual(c.held.map(x => x.code), ['n6']);
  assert.ok(c.items.every(x => x.status === 'met' && x.grow.newc && x.grow.inNet && x.grow.plantedAt === ASOF));
  assert.equal(c.items[0].grow.m12D, 260); assert.equal(c.grow.planted.src, 'today'); assert.equal(c.grow.since, null);
  assert.equal(c.flags.n1, '111111'); assert.equal(c.flags.o1, '111110', '오래 그물 안 — 초입 아님'); assert.equal(c.flags.n3, '101111'); assert.equal(c.flags.l01, '111100');
  assert.equal(FLAGS5.length, 6); assert.equal(c.grow.netCodes.join(), 'o1,o2,o3,o4,n1,n2,n5,n6');
  assert.ok(c.items[0].reason.includes('1년 추세 +260.0%') && c.items[0].reason.includes('상위 20% 그물'));
  assert.equal(c.rank.length, 50); assert.ok(c.rank.every(r => ['net', 'out', 'na'].includes(r.st)));
});

test('담는 날 사이 — 담는 날 첫 기록의 7곳 그대로 · 상태만(그물 밖 · 재검토) · 담은 뒤 7곳 · 그물 · 평균', () => {
  const spec = SPEC.map(r => [...r]); spec[4][4] = 100 * 1.3; // n1 은 담은 날 값 100 × 3.6 에서 오늘 130(그물 밖 아님 — 1년 추세는 20거래일 전 값으로 셈)
  const {stocks, priceAt, board} = boardOf(spec);
  const R = {...CAND_RULES, plantFrom: SES[K0 - 20]};
  const rec = {asOf: SES[K0 - 20], recordedAt: '2026-01-01T00:00:00Z', rules: 'cand-rules-5', cand: [{rank: 1, code: 'n2'}, {rank: 2, code: 'l05'}, {rank: 3, code: 'n4'}], src: 'pub'};
  const c = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(RISK), sessions: SES, priceAt, rules: R, records: [rec]});
  assert.deepEqual(c.items.map(x => x.code), ['n2', 'l05', 'n4'], '기록 차례 그대로');
  assert.deepEqual(c.items.map(x => x.status), ['met', 'wait', 'recheck'], 'l05 그물 밖 · n4 관리종목');
  assert.equal(c.grow.planted.at, SES[K0 - 20]); assert.equal(c.grow.planted.day, 20); assert.equal(c.grow.planted.src, 'pub');
  assert.ok(c.items[1].waitWhy.startsWith('그물 밖') && c.items[1].risk.kind === 'outnet');
  const ret = code => { const a = priceAt(code, SES[K0 - 20]), b = priceAt(code, ASOF); return (b / a - 1) * 100; };
  const avg = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert.ok(Math.abs(c.grow.since.seven.r - avg(['n2', 'l05', 'n4'].map(ret))) < 1e-9);
  assert.ok(Math.abs(c.grow.since.all.r - avg(stocks.map(s => ret(s.code)))) < 1e-9);
  assert.equal(c.grow.since.gap7, Number((c.grow.since.seven.r - c.grow.since.all.r).toFixed(1)));
  assert.equal(c.items[0].grow.since.rD, Number(ret('n2').toFixed(1)));
  const c2 = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(RISK), sessions: SES, priceAt, rules: R, records: []});
  assert.equal(c2.grow.planted.src, 'recount', '담는 날 기록이 없으면 그날 종가로 다시 셈'); assert.ok(c2.items.length > 0 && c2.items.every(x => x.status !== 'recheck'));
  const c3 = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(RISK), sessions: SES, priceAt, rules: R, records: [], growPubs: [{...rec, src: undefined}]});
  assert.deepEqual(c3.items.map(x => x.code), ['n2', 'l05', 'n4'], '규칙 폴더 발행본(첫 담는 날)도 읽음'); assert.equal(c3.grow.planted.src, 'pub5');
});

test('고르지 않는 날 — 미국 판 · 1년 기록 모자람(지어내지 않음) · 장 마감 뒤 공시는 상태만', () => {
  const {stocks, priceAt, board} = boardOf(SPEC);
  const us = candOf({place: 'us', asOf: ASOF, stocks, board, sessions: SES, priceAt});
  assert.equal(us.ready, false); assert.ok(us.why.includes('지어내지 않음'));
  const short = candOf({asOf: SES[200], stocks, board, sessions: SES, priceAt});
  assert.equal(short.ready, false); assert.ok(short.why.includes('272거래일'));
  const late = {...RISK, n1: [disc('관리종목 지정', `${ASOF}T16:10:00+09:00`)]};
  const c = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(late), sessions: SES, priceAt});
  assert.deepEqual(c.items.map(x => x.code), ['n1', 'n2', 'n5'], '마감 뒤 공시는 고르는 데 쓰지 않음');
  assert.equal(c.items[0].status, 'recheck'); assert.equal(c.items[0].risk.kind, 'after');
});

test('글에 앞날 · 권유 말 없음 · 기록 모양(grow) · 발행본', () => {
  const {stocks, priceAt, board} = boardOf(SPEC);
  const c = candOf({asOf: ASOF, stocks, board, agenda: agendaOf(RISK), sessions: SES, priceAt});
  const txt = JSON.stringify(c.items.map(x => [x.reason, x.risk.text, x.statusText, x.waitWhy, x.entry.rule, x.exit])) + c.label;
  for (const w of ['예측', '추천', '목표가', '확률', '오를 것', '곧 오른다', '보장', '무조건', '사라', '팔라']) assert.ok(!txt.includes(w), w);
  const rec = candRecordOf(c); assert.equal(rec.length, 3); assert.equal(rec[0].grow.plantedAt, ASOF); assert.equal(rec[0].grow.m12, 260);
  const pub = candPubOf({place: 'kr', asOf: ASOF, cand: c, universe: {id: 'u'}}, '2026-10-09T08:00:00Z');
  assert.equal(pub.rules, 'cand-rules-5'); assert.equal(pub.grow.planted.at, ASOF); assert.equal(pub.grow.netCodes.length, 8); assert.equal(pub.cand.length, 3);
});
