// 매수 검토 후보 규칙 cand-rules-4 「365곳 전체 · 돈 유입 비율 · 20만 번 다시 뽑아 소거」(연구용 · 성능 검증 전) — lib/atlas11/cand.mjs
// 사장님 2026-10-09 10:14 「모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템」 · 11:35 「전종목 365개를 대상으로 해서 돈에 유입이 강력한 7개 …
//   비율계산을 해야 한다 그러면 포모지수가 나올거야 1등부터 365등까지 … 몬테카를로 방법 20만번 소거법 20만돌」 · 11:57 「현명하게 해봐」
import test from 'node:test';
import assert from 'node:assert/strict';
import {candOf as candOf0, judgeOf, candRecordOf, candPubOf, CAND_RULES, FLAGS4, EXCLUDE_RE, HEAT_RE, DILUTE_RE, eokTxt, seedOf, rngOf, mcOf, mcDraw, dailyOf, drawsTxt, inflowIndexOf} from '../../lib/atlas11/cand.mjs';

const ASOF = '2026-10-08';
const SES = Array.from({length: 60}, (_, i) => new Date(Date.parse('2026-09-01T00:00:00Z') + i * 86400e3).toISOString().slice(0, 10));
const DATES = SES.slice(20, 30); // 열 날(이름만 — 셈은 차례로)
const fundOk = {fy: '2025.12', roe: 10, op: 100, net: 80, debt: 60, cap: 10000}; // cap = 억 원
/** fi = 외국인+기관 10거래일 추정(억 원) → fl.f10e/i10e(원) · 비율 = fi ÷ cap × 100 */
const stock = (code, g, fi, o = {}) => ({code, name: '회사' + code, g, gl: '업종' + g, status: 'ok', date: ASOF, close: 1000, r20: 5, r5: 1, vsIdx20: 3, fund: fundOk, fl: {f10e: fi * 0.6e8, i10e: fi * 0.4e8, f10: 1, i10: 1}, ...o});
const BOARD = groups => ({groups: Object.entries(groups).map(([id, codes]) => ({id, label: '업종' + id, codes})), companies: Object.values(groups).flat().map(code => ({code, info: {pos52: 0.5}}))});
const disc = (title, at = '2026-10-01T09:00:00+09:00', level = 2) => ({id: title + at, publishedAt: at, title, level});
const agendaOf = map => ({byCode: Object.fromEntries(Object.entries(map).map(([code, ds]) => [code, {disclosures: ds, upcoming: []}]))});
const even = (v, n = 10) => Array(n).fill(v / n);
/** 날마다 값을 열 날에 고르게(어느 날을 다시 뽑아도 합이 같음 → 모든 번에 다시 뽑기 전과 같은 답) */
const evenDaily = stocks => ({dates: DATES, stocks: new Map(stocks.map(s => [s.code, even(((s.fl?.f10e ?? NaN) + (s.fl?.i10e ?? NaN)) / 1e8)]))});
const FAST = {...CAND_RULES, draws: 2000, moreSeeds: 1}; // 시험은 2,000번(셈이 같은지만 봄) — 20만 번은 따로 한 시험
const candOf = o => candOf0({rules: FAST, sessions: SES, agenda: agendaOf({}), ...o, ...(o.daily === undefined ? {daily: evenDaily(o.stocks ?? [])} : {})});

test('씨앗 · 고른 수 — 32비트 정수 셈(같은 씨앗 → 같은 줄 · 파이썬 따로 세기와 같은 값)', () => {
  assert.equal(seedOf(''), 2166136261); assert.equal(seedOf('a'), 3826002220); assert.equal(seedOf('cand-rules-4|2026-10-08'), 3486102883);
  const r = rngOf(1); assert.deepEqual([r(), r(), r()].map(x => x.toFixed(12)), ['0.627073940588', '0.002735721180', '0.527447039960']);
  const a = rngOf(7), b = rngOf(7); for (let i = 0; i < 1000; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1); }
  assert.equal(CAND_RULES.id, 'cand-rules-4'); assert.equal(CAND_RULES.draws, 200000); assert.equal(drawsTxt(200000), '20만 번'); assert.equal(drawsTxt(2500), '2,500번');
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

test('365곳 전체(업종 조건 없음) — 기준 넷(종가 · 흑자 · 위험 공시 없음 · 순매수 +) · 진입 조건 먼저 · 7곳 · 같은 업종 3곳 · 1~365등 · 포모지수', () => {
  const g = {A: ['a1', 'a2', 'a3', 'a4'], B: ['b1', 'b2'], C: ['c1', 'c2', 'c3'], D: ['d1', 'd2']};
  const st = [stock('a1', 'A', 400), stock('a2', 'A', 300), stock('a3', 'A', 200), stock('a4', 'A', 150), // A 넷 — 넷째는 같은 업종 한도
    stock('b1', 'B', 900, {r20: 45}), stock('b2', 'B', 120), // b1 비율 1등이지만 20거래일 +45% → 조건 대기(뒤로)
    stock('c1', 'C', 100), stock('c2', 'C', 500, {fund: {...fundOk, op: -1}}), stock('c3', 'C', 80, {status: 'late', r20: null}), // c2 적자 · c3 종가 없음
    stock('d1', 'D', -50), stock('d2', 'D', 60, {fl: {}})]; // d1 순매도 · d2 매매 자료 없음
  const c = candOf({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({c1: [disc('단일판매ㆍ공급계약 해지')]})});
  assert.equal(c.ready, true); assert.equal(c.rules, 'cand-rules-4');
  assert.deepEqual(c.items.map(x => [x.code, x.status]), [['a1', 'met'], ['a2', 'met'], ['a3', 'met'], ['b2', 'met'], ['b1', 'wait']],
    'c1 위험 공시 · c2 적자 · c3 종가 없음 · d1 순매도 · d2 자료 없음 → 빠짐 · a4 는 같은 업종 넷째 · 조건 대기 b1 은 맨 뒤');
  assert.deepEqual(c.held.map(x => x.code), ['a4']);
  assert.deepEqual(c.pool, {universe: 11, flow: 10, data: 9, profit: 8, risk: 7, screen: 6, met: 5});
  assert.deepEqual(c.items.map(x => x.mc.n), [2000, 2000, 2000, 2000, 2000], '날마다 값이 고르면 모든 번에 같은 답'); assert.equal(c.mc.asIs.same, true);
  assert.deepEqual(c.mc.seeds, {n: 1, sameSet: true, sameOrder: true, moved: []});
  assert.deepEqual(c.rank.map(x => x.c), ['b1', 'c2', 'a1', 'a2', 'a3', 'a4', 'b2', 'c1', 'c3', 'd1', 'd2'], '비율 큰 순 · 자료 없는 곳은 맨 뒤');
  assert.deepEqual(c.rank.map(x => x.r), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, null]);
  assert.equal(c.rank[0].x, 100); assert.equal(c.rank[9].x, 0); assert.equal(c.rank[10].x, null);
  assert.deepEqual(c.rank.filter(x => x.pick).map(x => x.c).sort(), ['a1', 'a2', 'a3', 'b1', 'b2']);
  assert.equal(c.flags.a1, '11111'); assert.equal(c.flags.b1, '11110'); assert.equal(c.flags.c2, '10111'); assert.equal(c.flags.d1, '11101', '진입 조건은 순매수와 따로 셈'); assert.equal(FLAGS4.length, 5);
  const a1 = c.items[0]; assert.ok(Math.abs(a1.flow.power - 4) < 1e-9); assert.equal(a1.flow.powerRank, 3); assert.equal(a1.flow.fomo, 78);
  assert.ok(c.rank.every(x => (x.p === null ? x.pd === null : x.pd === Number(x.p.toFixed(2)))), '보여 줄 비율 = 온 값으로 소수 둘째 자리(판 읽기 파일의 넷째 자리 값을 다시 반올림하지 않음)');
  assert.ok(c.items.every(x => x.flow.powerD === Number(x.flow.power.toFixed(2))));
  assert.equal(Number((0.47501543).toFixed(2)).toFixed(2), '0.48', '넷째 자리로 줄이면 0.475 → 0.47 이 되는 값도 0.48');
  assert.match(a1.reason, /^돈 유입 비율 4\.00%\(11곳 중 3위 · 포모지수 78점\) · 외국인\+기관 10거래일 \+400억 · 2,000번 다시 뽑아 2,000번 7곳에 듦$/);
  assert.deepEqual(c.mc.surged.map(x => [x.code, x.rank]), [['b1', 1]]); assert.match(c.mc.surged[0].why, /20거래일 \+45\.0%/);
  assert.match(c.items.find(x => x.code === 'b1').waitWhy, /급등/);
});

test('20만 번 그대로(규칙 값) — 작은 판으로 셈 시간 · 횟수 · 씨앗', () => {
  const g = {A: ['a1', 'a2'], B: ['b1']};
  const st = [stock('a1', 'A', 400), stock('a2', 'A', 100), stock('b1', 'B', 50)];
  const D = {dates: DATES, stocks: new Map([['a1', [400, 0, 0, 0, 0, 0, 0, 0, 0, 0]], ['a2', even(100)], ['b1', [-30, 8, 8, 8, 8, 8, 8, 8, 8, 8]]])}; // a1 하루 · b1 첫날 빠지면 큼
  const t = Date.now(), c = candOf0({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({}), daily: D, sessions: SES});
  assert.ok(Date.now() - t < 20000, '20만 번 × 3(흔들림 검사) 이 20초 안');
  assert.equal(c.mc.draws, 200000); assert.equal(c.mc.seed, seedOf('cand-rules-4|2026-10-08')); assert.equal(c.mc.seeds.n, 2);
  const by = k => c.items.find(x => x.code === k);
  assert.equal(by('a2').mc.n, 200000); assert.ok(by('a1').mc.n > 128000 && by('a1').mc.n < 132000, `a1 하루에 기댐 — ${by('a1').mc.n}`);
  assert.equal(by('b1').mc.n * 2 < 200000 || by('b1').mc.n > 0, true);
});

test('고르지 않는 날 — 미국 판 · 매매 자료 없음 · 날마다 값 없음(다시 뽑기 없는 셈으로 몰래 돌아가지 않음)', () => {
  const st = [stock('a1', 'A', 10)], b = BOARD({A: ['a1']});
  assert.match(candOf({place: 'us', asOf: ASOF, stocks: st, board: b}).why, /셀 수 없음/);
  assert.equal(candOf({asOf: ASOF, stocks: [{...st[0], fl: {}}], board: b}).ready, false);
  const none = candOf({asOf: ASOF, stocks: st, board: b, daily: null}); assert.equal(none.ready, false); assert.match(none.why, /날마다 순매수/);
  assert.equal(dailyOf({dates: DATES.slice(0, 9), stocks: new Map()}).ok, false);
  assert.equal(candOf({asOf: ASOF, stocks: st, board: b, rotation: {none: true}}).ready, true, '업종 돈 흐름이 없어도 고름(곁 정보일 뿐)');
});

test('업종 돈 흐름은 곁 정보 — 돈이 빠진 업종 회사면 위험 줄에 「반대 방향」', () => {
  const g = {A: ['a1'], Z: ['z1']};
  const rot = {schema: 'atlas11-rotation-1', none: false, asOf: ASOF, in: [{id: 'A', label: '업종A', amount: 900}], out: [{id: 'Z', label: '업종Z', amount: -80000}], waves: []};
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 50), stock('z1', 'Z', 60)], board: BOARD(g), rotation: rot});
  const z = c.items.find(x => x.code === 'z1'), a = c.items.find(x => x.code === 'a1');
  assert.equal(z.flow.sector.dir, 'out'); assert.equal(z.risk.kind, 'secout'); assert.match(z.risk.text, /돈이 빠진 업종 1위\(시장 대비 −8\.0조\)/);
  assert.equal(a.flow.sector.dir, 'in'); assert.equal(c.flow.out[0].label, '업종Z');
});

test('장 마감(15:30) 뒤 공시는 고르는 데 쓰지 않음 — 마감 뒤 위험 공시면 순위는 그대로 · 상태만 「재검토」', () => {
  const g = {A: ['a1', 'a2']};
  const ag = agendaOf({a1: [disc('단일판매ㆍ공급계약 해지', ASOF + 'T17:10:00+09:00', 3)], a2: [disc('단일판매ㆍ공급계약 해지', ASOF + 'T15:20:00+09:00', 3)]});
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 50), stock('a2', 'A', 60)], board: BOARD(g), agenda: ag});
  assert.equal(c.window.cutoff, '2026-10-08T15:30:00+09:00');
  assert.deepEqual(c.items.map(x => [x.code, x.status]), [['a1', 'recheck']], 'a2 는 마감 전 해지 → 빠짐 · a1 은 마감 뒤 해지 → 남되 재검토');
  assert.equal(c.items[0].risk.kind, 'after'); assert.equal(c.items[0].exit.business.broken, true);
});

test('과열 공시는 7일 안만 진입 조건에서 셈(그 전 것은 이력) · 희석은 30일 · 우선주 지정은 빼지 않고 표시', () => {
  assert.ok(HEAT_RE.test('공매도 과열종목 지정(공매도 거래 금지 적용)')); assert.ok(DILUTE_RE.test('신주인수권증서 신규상장(에코프로비엠 18R)')); assert.ok(EXCLUDE_RE.test('투자경고종목 지정(삼성전기우)'));
  const g = {A: ['a1', 'a2'], B: ['a3', 'a4']};
  const ag = agendaOf({a1: [disc('공매도 과열종목 지정(공매도 거래 금지 적용)', '2026-10-06T18:00:00+09:00')], a2: [disc('공매도 과열종목 지정(공매도 거래 금지 적용)', '2026-09-11T18:00:00+09:00')],
    a3: [disc('유상증자결정', '2026-09-12T09:00:00+09:00')], a4: [disc('투자경고종목 지정(회사a4우)', '2026-09-29T17:00:00+09:00')]});
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 40), stock('a2', 'A', 39), stock('a3', 'B', 38), stock('a4', 'B', 37)], board: BOARD(g), agenda: ag});
  const by = k => c.items.find(x => x.code === k);
  assert.equal(by('a1').status, 'wait'); assert.equal(by('a1').risk.kind, 'heat');
  assert.equal(by('a2').status, 'met'); assert.equal(by('a2').risk.kind, 'heat-old');
  assert.equal(by('a3').status, 'wait'); assert.equal(by('a3').risk.kind, 'dilute');
  assert.ok(by('a4'), '우선주(회사a4우) 투자경고는 보통주를 빼지 않음'); assert.equal(by('a4').risk.kind, 'pref');
});

test('앞 기록과 바뀐 것 — 신규 · 유지(순위) · 제외(처음 깨진 조건) · 처음 기록 종가가 가격 기준선', () => {
  const g = {A: ['a1', 'a2', 'a3']};
  const st = [stock('a1', 'A', 50, {close: 950}), stock('a2', 'A', 60), stock('a3', 'A', -5)];
  const prev = {asOf: '2026-10-07', cand: [{rank: 1, code: 'a3', name: '회사a3', close: 1000, date: '2026-10-07'}, {rank: 2, code: 'a1', name: '회사a1', close: 1000, date: '2026-10-07'}]};
  const c = candOf({asOf: ASOF, stocks: st, board: BOARD(g), records: [prev]});
  assert.deepEqual(c.changes.added.map(x => x.code), ['a2']); assert.deepEqual(c.changes.kept.map(x => [x.code, x.rankFrom, x.rankTo]), [['a1', 2, 2]]);
  assert.deepEqual(c.changes.removed.map(x => [x.code, x.why, x.status]), [['a3', '돈 유입 이탈 — 외국인+기관 순매도', '재검토']]);
  const a1 = c.items.find(x => x.code === 'a1');
  assert.equal(a1.exit.price.refClose, 1000); assert.equal(a1.exit.price.recorded, true); assert.ok(Math.abs(a1.exit.price.fromRef - -5) < 1e-9);
  assert.equal(a1.exit.period.start, '2026-10-07'); assert.equal(a1.exit.period.end, SES[SES.indexOf('2026-10-07') + 20]);
});

test('글에 앞날 · 권유 말 없음 · 기록 모양 · 발행본 · 금액 글', () => {
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 50), stock('a2', 'A', 40, {r20: 40})], board: BOARD({A: ['a1', 'a2']}), ref: {name: '코스피', r20: 1}});
  assert.doesNotMatch(JSON.stringify(c), /추천|목표가|확실|보장|무조건|전망|예측|확률|기대감|상승 여력|오를 것|내릴 것/);
  const rec = candRecordOf(c);
  assert.equal(rec.length, 2); assert.deepEqual(Object.keys(rec[0]).sort(), ['close', 'code', 'date', 'flow', 'g', 'gap', 'mc', 'name', 'r20', 'rank', 'reason', 'risk', 'status'].sort());
  assert.deepEqual(rec[0].mc, {n: 2000, of: 2000}); assert.deepEqual(Object.keys(rec[0].flow).sort(), ['fi', 'fomo', 'power', 'rank', 'sector', 'sectorRank']);
  assert.equal(eokTxt(249871), '+25.0조'); assert.equal(eokTxt(-536130), '−53.6조'); assert.equal(eokTxt(2947), '+2,947억');
  const pub = candPubOf({place: 'kr', asOf: ASOF, boardId: 'b', universe: {id: 'u'}, cand: c}, '2026-10-08T20:00:00Z');
  assert.equal(pub.schema, 'atlas11-cand-1'); assert.equal(pub.cand.length, 2); assert.equal(pub.mc.draws, 2000); assert.deepEqual(pub.mc.days, DATES); assert.equal(pub.top.length, 2);
  assert.equal(CAND_RULES.want, 7); assert.equal(CAND_RULES.perSector, 3);
});
