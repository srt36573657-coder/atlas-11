// 매수 검토 후보 규칙 cand-rules-3 「돈이 들어온 업종 안에서 · 1만 번 다시 뽑아 소거」(연구용 · 성능 검증 전) — lib/atlas11/cand.mjs
// 사장님 2026-10-09 03:53 「아틀란스 365개에서 돈에 흐름이 강한 업종내에서 종목을 찾아내야 해」 · 03:59 「잡스라면 … 애플의 방식이 중심」
//   · 10:14 「모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템을 구축하여 다시 7개에 종목을 찾아내라」
import test from 'node:test';
import assert from 'node:assert/strict';
import {candOf as candOf0, judgeOf, flowSectorsOf, candRecordOf, candPubOf, CAND_RULES, EXCLUDE_RE, HEAT_RE, DILUTE_RE, eokTxt, seedOf, rngOf, mcOf, mcDraw, mcBySec, dailyOf, drawsTxt} from '../../lib/atlas11/cand.mjs';

const ASOF = '2026-10-08';
const SES = Array.from({length: 60}, (_, i) => new Date(Date.parse('2026-09-01T00:00:00Z') + i * 86400e3).toISOString().slice(0, 10));
const fundOk = {fy: '2025.12', roe: 10, op: 100, net: 80, debt: 60, cap: 10000}; // cap = 억 원
/** fi = 외국인+기관 10거래일 추정(억 원) → fl.f10e/i10e(원) */
const stock = (code, g, fi, o = {}) => ({code, name: '회사' + code, g, gl: '업종' + g, status: 'ok', date: ASOF, close: 1000, r20: 5, r5: 1, vsIdx20: 3, fund: fundOk, fl: {f10e: fi * 0.6e8, i10e: fi * 0.4e8, f10: 1, i10: 1}, ...o});
const sec = (id, amount, fi, change = 0.05) => ({id, label: '업종' + id, n: 5, amount, change, who: {foreign: fi / 2, institution: fi / 2, individual: -fi}});
const ROT = (ins, o = {}) => ({schema: 'atlas11-rotation-1', none: false, asOf: ASOF, window: {from: '2026-09-21', to: ASOF, days: 10}, in: ins, out: [{id: 'zz', label: '빠진 곳', amount: -500}], pair: null, waves: [], ...o});
const BOARD = groups => ({groups: Object.entries(groups).map(([id, codes]) => ({id, label: '업종' + id, codes})), companies: Object.values(groups).flat().map(code => ({code, info: {pos52: 0.5}}))});
const disc = (title, at = '2026-10-01T09:00:00+09:00', level = 2) => ({id: title + at, publishedAt: at, title, level});
const agendaOf = map => ({byCode: Object.fromEntries(Object.entries(map).map(([code, ds]) => [code, {disclosures: ds, upcoming: []}]))});
const DATES = SES.slice(20, 30); // 열 날(날짜 이름만 — 셈은 차례로)
/** 고른 날마다 값 — 열 날에 똑같이 나눔(어느 날을 다시 뽑아도 합이 같음 → 1만 번 모두 2판과 같은 답) */
const even = (v, n = 10) => Array(n).fill(v / n);
function evenDaily(rotation, stocks) {
  if (!rotation?.in) return {rotation, daily: null};
  const sectors = [...rotation.in, ...(rotation.out ?? [])].map(g => ({id: g.id, label: g.label, c: even(g.amount), lr: even(Math.log(1 + (g.change ?? 0))), fi: even((g.who?.foreign ?? 0) + (g.who?.institution ?? 0))}));
  return {rotation: {...rotation, daily: {dates: DATES, sectors}}, daily: {dates: DATES, stocks: new Map(stocks.map(s => [s.code, even(((s.fl?.f10e ?? NaN) + (s.fl?.i10e ?? NaN)) / 1e8)]))}};
}
/** 시험마다 날마다 값을 함께 넘김(따로 준 rotation.daily · daily 가 있으면 그대로) */
const candOf = o => (o.daily !== undefined || o.rotation?.daily ? candOf0(o) : candOf0({...o, ...evenDaily(o.rotation, o.stocks ?? [])}));

test('돈이 들어온 업종 = 「늘어난 곳」 1~3위 가운데 외국인+기관 순매수 + · 업종 값도 오른 곳만', () => {
  const s = flowSectorsOf(ROT([sec('A', 900, 50), sec('B', 800, -20), sec('C', 700, 30, -0.01), sec('D', 600, 80)]));
  assert.deepEqual(s.map(x => [x.id, x.ok]), [['A', true], ['B', false], ['C', false]], '1~3위만 보고(D 는 4위라 안 봄) · B 순매도 · C 값 내림');
  assert.match(s[1].why, /순매도/); assert.match(s[2].why, /값이 내림/);
  assert.deepEqual(flowSectorsOf({none: true}), []);
});

test('그 업종 안 회사 = 종가 · 흑자 · 위험 공시 없음 · 외국인+기관 순매수 — 차례는 조건 충족 먼저 → 회사 크기에 견준 세기', () => {
  const g = {A: ['a1', 'a2', 'a3', 'a4', 'a5'], B: ['b1', 'b2'], X: ['x1']};
  const st = [stock('a1', 'A', 50), stock('a2', 'A', 200, {fund: {...fundOk, cap: 5000}}), stock('a3', 'A', 30, {status: 'late', r20: null}), stock('a4', 'A', 40, {fund: {...fundOk, op: -1}}), stock('a5', 'A', -10),
    stock('b1', 'B', 100, {r20: 45}), stock('b2', 'B', 20), stock('x1', 'X', 999)];
  const c = candOf({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({b2: [disc('단일판매ㆍ공급계약 해지')]}), rotation: ROT([sec('A', 900, 50), sec('B', 800, 40)]), sessions: SES, ref: {name: '코스피', r20: 1}});
  assert.equal(c.ready, true); assert.equal(c.rules, 'cand-rules-3');
  assert.deepEqual(c.items.map(x => x.mc.n), [10000, 10000, 10000], '날마다 값이 고르면 1만 번 모두 같은 답'); assert.equal(c.mc.asIs.same, true);
  assert.deepEqual(c.mc.seeds, {n: 4, sameSet: true, sameOrder: true, moved: []}, '씨앗을 바꿔도 같은 답');
  assert.deepEqual(c.items.map(x => [x.code, x.status]), [['a2', 'met'], ['a1', 'met'], ['b1', 'wait']], 'a3 종가 없음 · a4 적자 · a5 순매도 · b2 위험 공시 · x1 업종 밖 → 빠짐 · a2(세기 4%) > a1(0.5%) · b1 급등은 조건 대기라 뒤');
  assert.deepEqual(c.pool, {universe: 8, sectors: 2, inSector: 7, data: 6, profit: 5, risk: 4, screen: 3, met: 2});
  const a2 = c.items[0]; assert.ok(Math.abs(a2.flow.power - 4) < 1e-9); assert.match(a2.reason, /돈이 들어온 업종 1위 업종A/); assert.match(a2.reason, /\+200억 = 시가총액의 4\.00%/);
  assert.match(c.items[2].waitWhy, /급등/);
  assert.equal(c.flags.x1[0], '0', '업종 밖이면 첫 조건이 막힘'); assert.equal(c.flags.a2, '111111');
});

test('같은 업종 3곳까지 · 7곳 상한 · 모자라면 모자란 대로 · 없으면 없다고(기준을 낮추지 않음)', () => {
  const g = {A: ['a1', 'a2', 'a3', 'a4', 'a5'], B: ['b1', 'b2', 'b3', 'b4', 'b5'], C: ['c1']};
  const st = [...g.A.map((c, i) => stock(c, 'A', 100 - i)), ...g.B.map((c, i) => stock(c, 'B', 90 - i)), stock('c1', 'C', 10)];
  const c = candOf({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({}), rotation: ROT([sec('A', 900, 50), sec('B', 800, 40), sec('C', 100, 5)]), sessions: SES});
  assert.equal(c.items.length, 7); assert.deepEqual(c.items.map(x => x.code), ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1']);
  assert.deepEqual(c.held.map(x => x.code), ['a4', 'a5', 'b4', 'b5']); assert.match(c.held[0].why, /같은 업종 3곳 한도/);
  assert.ok(c.common.some(x => x.g === 'A' && x.n === 3));
  const none = candOf({asOf: ASOF, stocks: [stock('a1', 'A', -5)], board: BOARD({A: ['a1']}), agenda: agendaOf({}), rotation: ROT([sec('A', 900, 50)]), sessions: SES});
  assert.equal(none.ready, true); assert.equal(none.items.length, 0);
});

test('고르지 않는 날 — 미국 판 · 돈 흐름 없음 · 날짜 다름 · 매매 자료 없음(숫자를 지어내지 않음)', () => {
  const st = [stock('a1', 'A', 10)], b = BOARD({A: ['a1']});
  assert.match(candOf({place: 'us', asOf: ASOF, stocks: st, board: b, rotation: ROT([sec('A', 9, 9)])}).why, /셀 수 없음/);
  assert.equal(candOf({asOf: ASOF, stocks: st, board: b, rotation: {none: true, reason: '거래일이 모자람'}}).ready, false);
  assert.match(candOf({asOf: ASOF, stocks: st, board: b, rotation: ROT([sec('A', 9, 9)], {asOf: '2026-10-07'})}).why, /날짜/);
  assert.equal(candOf({asOf: ASOF, stocks: [{...st[0], fl: {}}], board: b, rotation: ROT([sec('A', 9, 9)])}).ready, false);
});

test('장 마감(15:30) 뒤 공시는 고르는 데 쓰지 않음 — 마감 뒤 위험 공시면 순위는 그대로 · 상태만 「재검토」', () => {
  const g = {A: ['a1', 'a2']};
  const ag = agendaOf({a1: [disc('단일판매ㆍ공급계약 해지', ASOF + 'T17:10:00+09:00', 3)], a2: [disc('단일판매ㆍ공급계약 해지', ASOF + 'T15:20:00+09:00', 3)]});
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 50), stock('a2', 'A', 60)], board: BOARD(g), agenda: ag, rotation: ROT([sec('A', 900, 50)]), sessions: SES});
  assert.equal(c.window.cutoff, '2026-10-08T15:30:00+09:00');
  assert.deepEqual(c.items.map(x => [x.code, x.status]), [['a1', 'recheck']], 'a2 는 마감 전 해지 → 빠짐 · a1 은 마감 뒤 해지 → 남되 재검토');
  assert.equal(c.items[0].risk.kind, 'after'); assert.equal(c.items[0].exit.business.broken, true);
});

test('과열 공시는 7일 안만 진입 조건에서 셈(그 전 것은 이력) · 희석은 30일 · 우선주 지정은 빼지 않고 표시', () => {
  assert.ok(HEAT_RE.test('공매도 과열종목 지정(공매도 거래 금지 적용)')); assert.ok(DILUTE_RE.test('신주인수권증서 신규상장(에코프로비엠 18R)')); assert.ok(EXCLUDE_RE.test('투자경고종목 지정(삼성전기우)'));
  const g = {A: ['a1', 'a2'], B: ['a3', 'a4']}; // 업종 둘(같은 업종 3곳 한도에 걸리지 않게)
  const ag = agendaOf({a1: [disc('공매도 과열종목 지정(공매도 거래 금지 적용)', '2026-10-06T18:00:00+09:00')], a2: [disc('공매도 과열종목 지정(공매도 거래 금지 적용)', '2026-09-11T18:00:00+09:00')],
    a3: [disc('유상증자결정', '2026-09-12T09:00:00+09:00')], a4: [disc('투자경고종목 지정(회사a4우)', '2026-09-29T17:00:00+09:00')]});
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 40), stock('a2', 'A', 39), stock('a3', 'B', 38), stock('a4', 'B', 37)], board: BOARD(g), agenda: ag, rotation: ROT([sec('A', 900, 50), sec('B', 800, 40)]), sessions: SES});
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
  const c = candOf({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({}), rotation: ROT([sec('A', 900, 50)]), records: [prev], sessions: SES});
  assert.deepEqual(c.changes.added.map(x => x.code), ['a2']); assert.deepEqual(c.changes.kept.map(x => [x.code, x.rankFrom, x.rankTo]), [['a1', 2, 2]]);
  assert.deepEqual(c.changes.removed.map(x => [x.code, x.why, x.status]), [['a3', '돈 흐름 이탈 — 외국인+기관 순매도', '재검토']]);
  const a1 = c.items.find(x => x.code === 'a1');
  assert.equal(a1.exit.price.refClose, 1000); assert.equal(a1.exit.price.recorded, true); assert.ok(Math.abs(a1.exit.price.fromRef - -5) < 1e-9);
  assert.equal(a1.exit.period.start, '2026-10-07'); assert.equal(a1.exit.period.end, SES[SES.indexOf('2026-10-07') + 20]);
});

test('글에 앞날 · 권유 말 없음 · 기록 모양 · 금액 글', () => {
  const c = candOf({asOf: ASOF, stocks: [stock('a1', 'A', 50), stock('a2', 'A', 40, {r20: 40})], board: BOARD({A: ['a1', 'a2']}), agenda: agendaOf({}), rotation: ROT([sec('A', 249871, 3608)]), sessions: SES, ref: {name: '코스피', r20: 1}});
  assert.doesNotMatch(JSON.stringify(c), /추천|목표가|확실|보장|무조건|전망|예측|확률|기대감|상승 여력|오를 것|내릴 것/);
  const rec = candRecordOf(c);
  assert.equal(rec.length, 2); assert.deepEqual(Object.keys(rec[0]).sort(), ['close', 'code', 'date', 'flow', 'g', 'gap', 'mc', 'name', 'r20', 'rank', 'reason', 'risk', 'status'].sort());
  assert.deepEqual(rec[0].mc, {n: 10000, of: 10000}); assert.match(rec[0].reason, /1만 번 다시 뽑아 10,000번 7곳에 듦/);
  assert.equal(eokTxt(249871), '+25.0조'); assert.equal(eokTxt(-536130), '−53.6조'); assert.equal(eokTxt(2947), '+2,947억');
  const pub = candPubOf({place: 'kr', asOf: ASOF, boardId: 'b', universe: {id: 'u'}, cand: c}, '2026-10-08T20:00:00Z');
  assert.equal(pub.schema, 'atlas11-cand-1'); assert.equal(pub.cand.length, 2); assert.equal(pub.flow.sectors[0].label, '업종A');
  assert.equal(pub.mc.draws, 10000); assert.equal(pub.mc.seed, seedOf('cand-rules-3|2026-10-08')); assert.deepEqual(pub.mc.days, DATES);
  assert.equal(CAND_RULES.want, 7); assert.equal(CAND_RULES.perSector, 3);
});

/* ── 3판: 1만 번 다시 뽑기(몬테카를로) · 소거법 ── */
test('씨앗 · 고른 수 — 32비트 정수 셈(같은 씨앗 → 같은 줄 · 파이썬 따로 세기와 같은 값)', () => {
  assert.equal(seedOf(''), 2166136261); assert.equal(seedOf('a'), 3826002220); assert.equal(seedOf('cand-rules-3|2026-10-08'), 606297296);
  const r = rngOf(1); assert.deepEqual([r(), r(), r()].map(x => x.toFixed(12)), ['0.627073940588', '0.002735721180', '0.527447039960']);
  const a = rngOf(7), b = rngOf(7); for (let i = 0; i < 1000; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1); }
  assert.equal(CAND_RULES.draws, 10000); assert.equal(drawsTxt(10000), '1만 번'); assert.equal(drawsTxt(2500), '2,500번');
});

/** 날마다 값을 손으로 — 업종 A(늘 들어옴) · B(하루 크게 · 나머지 조금 빠짐) · C(조금씩 꾸준히) · Z(빠짐) */
const D3 = () => ({dates: DATES, sectors: [
  {id: 'A', label: '업종A', c: even(1000), lr: even(0.05), fi: even(100)},
  {id: 'B', label: '업종B', c: [1400, -20, -20, -20, -20, -20, -20, -20, -20, -20], lr: even(0.03), fi: even(50)},
  {id: 'C', label: '업종C', c: even(1000), lr: even(0.02), fi: even(40)},
  {id: 'D', label: '업종D', c: even(900), lr: even(0.02), fi: even(30)},
  {id: 'Z', label: '업종Z', c: even(-4130), lr: even(-0.05), fi: even(-300)}]});

test('한 번 뽑기 — 열 날을 그대로 한 번씩이면 지난 열 날 그대로의 답(2판과 같은 셈) · 하루에 기댄 업종은 그 날이 빠지면 빠짐', () => {
  const D = D3(), base = [{code: 'a1', g: 'A', cap: 1000, met: true, fi: even(10)}, {code: 'b1', g: 'B', cap: 1000, met: true, fi: even(20)}, {code: 'c1', g: 'C', cap: 1000, met: true, fi: even(5)}, {code: 'd1', g: 'D', cap: 1000, met: true, fi: even(50)}];
  const id = mcDraw(D, mcBySec(base), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(id.sectors, ['B', 'A', 'C'], '그대로: B(1,220) > A = C(1,000 · 같으면 앞 차례) > D(900)');
  assert.deepEqual(id.picked, ['b1', 'a1', 'c1']);
  const noBig = mcDraw(D, mcBySec(base), [1, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // 큰 날(0)이 빠지고 1이 두 번
  assert.deepEqual(noBig.sectors, ['A', 'C', 'D'], 'B 는 −200 이 되어 빠지고 D 가 들어옴'); assert.deepEqual(noBig.picked, ['d1', 'a1', 'c1'], '세기 큰 순');
});

test('1만 번 다시 뽑기 — 하루에 기댄 업종은 열에 일곱이 못 됨((9/10)^10 ≈ 35%는 그 날이 빠짐) · 꾸준한 업종은 늘 듦 · 같은 씨앗이면 같은 횟수', () => {
  const D = D3(), base = [{code: 'a1', g: 'A', cap: 1000, met: true, fi: even(10)}, {code: 'b1', g: 'B', cap: 1000, met: true, fi: even(20)}, {code: 'c1', g: 'C', cap: 1000, met: true, fi: even(5)}, {code: 'd1', g: 'D', cap: 1000, met: true, fi: even(50)}];
  const m = mcOf({D, base, seed: 42}), m2 = mcOf({D, base, seed: 42});
  assert.deepEqual([...m.picked], [...m2.picked]); assert.deepEqual([...m.top], [...m2.top]);
  assert.equal(m.top.get('A'), 10000); assert.equal(m.top.get('C'), 10000);
  const b = m.top.get('B'); assert.ok(b > 6000 && b < 6700, `B 가 3곳에 든 횟수 ${b} ≈ 1 − 0.9^10 = 65%`);
  assert.equal(m.top.get('D'), 10000 - b, 'B 가 빠진 번마다 D 가 들어옴');
  assert.equal([...m.picked.values()].reduce((x, y) => x + y, 0), 3 * 10000, '한 번에 세 곳(업종마다 하나)');
});

test('소거법 — 기준(①②)을 넘은 곳만 · 진입 조건 → 7곳에 든 횟수(1% 단위) → 세기 차례 · 같은 업종 3곳 · 7곳 · 뺀 곳은 까닭과 횟수 · 절반 아래는 위험 줄에', () => {
  const g = {A: ['a1', 'a2', 'a3', 'a4'], B: ['b1', 'b2'], C: ['c1', 'c2']};
  const st = [stock('a1', 'A', 50), stock('a2', 'A', 40), stock('a3', 'A', 30), stock('a4', 'A', 20), stock('b1', 'B', 300), stock('b2', 'B', 10, {r20: 45}), stock('c1', 'C', 60), stock('c2', 'C', 5)];
  const rot = ROT([sec('B', 1220, 50, 0.03), sec('A', 1000, 100), sec('C', 1000, 40, 0.02)], {out: [{id: 'Z', label: '업종Z', amount: -4130}]});
  const D = D3(); D.sectors.push({id: 'D', label: '업종D', c: even(0), lr: even(0), fi: even(0)}); D.sectors.splice(3, 1);
  const fiOf = {a1: even(50), a2: even(40), a3: even(30), a4: even(20), b1: [0, 300, 0, 0, 0, 0, 0, 0, 0, 0], b2: even(10), c1: even(60), c2: [-40, 5, 5, 5, 5, 5, 5, 5, 5, 5]}; // b1 = 업종은 첫날 · 회사는 둘째 날에 기댐(둘 다 뽑힐 때만 ≈ 41%)
  const c = candOf0({asOf: ASOF, stocks: st, board: BOARD(g), agenda: agendaOf({}), rotation: {...rot, daily: D}, daily: {dates: DATES, stocks: new Map(Object.entries(fiOf))}, sessions: SES});
  assert.equal(c.ready, true); assert.equal(c.mc.asIs.same, true, '열 날 그대로면 2판과 같은 7곳');
  const by = k => c.items.find(x => x.code === k);
  assert.equal(by('a1').mc.n, 10000); assert.equal(by('c1').mc.n, 10000);
  const nb = by('b1').mc.n; assert.ok(nb > 3800 && nb < 4400, `b1 = 첫날 · 둘째 날이 둘 다 뽑힐 때만(1 − 2 × 0.9^10 + 0.8^10 ≈ 41%) — ${nb}번`);
  assert.equal(by('b1').risk.kind, 'mc'); assert.match(by('b1').risk.text, /1만 번 다시 뽑아 [\d,]+번만 7곳에 듦\(절반 아래\) — 업종B 업종이 돈이 들어온 3곳에 든 것 [\d,]+번/);
  assert.ok(by('c2').mc.n > 6000 && by('c2').mc.n < 8000, 'c2 = 첫날(−40)이 두 번 넘게 뽑히면 순매도');
  assert.deepEqual(c.items.map(x => x.code), ['c1', 'a1', 'a2', 'a3', 'c2', 'b1', 'b2'], '조건 충족 먼저 → 7곳에 든 횟수(1% 단위 · 100% 넷은 세기 순) → 조건 대기(b2 급등)는 맨 뒤');
  assert.equal(by('b2').status, 'wait'); assert.equal(by('b1').mc.low, true); assert.equal(by('c1').mc.low, false); assert.equal(c.mc.low, 1);
  assert.deepEqual(c.held.map(x => [x.code, x.why]), [['a4', '같은 업종 3곳 한도']]); assert.equal(c.held[0].mc, 0);
  assert.deepEqual(c.mc.out.map(x => x.code), ['a4']); assert.equal(c.mc.base, 8); assert.equal(c.mc.draws, 10000);
  assert.ok(c.flow.sectors.every(x => Number.isInteger(x.mc)));
});

test('날마다 값이 없거나 날짜가 다르면 고르지 않음(2판으로 몰래 돌아가지 않음 · 숫자를 지어내지 않음)', () => {
  const st = [stock('a1', 'A', 10)], b = BOARD({A: ['a1']}), rot = ROT([sec('A', 900, 50)]);
  const none = candOf0({asOf: ASOF, stocks: st, board: b, rotation: rot, sessions: SES});
  assert.equal(none.ready, false); assert.match(none.why, /날마다 값/); assert.equal(none.items.length, 0);
  const ev = evenDaily(rot, st);
  const other = candOf0({asOf: ASOF, stocks: st, board: b, rotation: ev.rotation, daily: {...ev.daily, dates: SES.slice(21, 31)}, sessions: SES});
  assert.equal(other.ready, false); assert.match(other.why, /날짜가 돈 흐름 날짜와 다름/);
  const hole = {...ev.rotation, daily: {...ev.rotation.daily, sectors: [{...ev.rotation.daily.sectors[0], c: [1, 2, 3]}]}};
  assert.equal(dailyOf(hole, ev.daily).ok, false);
  assert.equal(candOf0({asOf: ASOF, stocks: st, board: b, rotation: ev.rotation, daily: ev.daily, sessions: SES}).ready, true);
});
