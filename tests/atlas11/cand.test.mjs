// 매수 검토 후보 규칙 cand-rules-2 「돈이 들어온 업종 안에서」(연구용 · 성능 검증 전) — lib/atlas11/cand.mjs
// 사장님 2026-10-09 03:53 「아틀란스 365개에서 돈에 흐름이 강한 업종내에서 종목을 찾아내야 해」 · 03:59 「잡스라면 … 애플의 방식이 중심」
import test from 'node:test';
import assert from 'node:assert/strict';
import {candOf, judgeOf, flowSectorsOf, candRecordOf, candPubOf, CAND_RULES, EXCLUDE_RE, HEAT_RE, DILUTE_RE, eokTxt} from '../../lib/atlas11/cand.mjs';

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
  assert.equal(c.ready, true); assert.equal(c.rules, 'cand-rules-2');
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
  assert.equal(rec.length, 2); assert.deepEqual(Object.keys(rec[0]).sort(), ['close', 'code', 'date', 'flow', 'g', 'gap', 'name', 'r20', 'rank', 'reason', 'risk', 'status'].sort());
  assert.equal(eokTxt(249871), '+25.0조'); assert.equal(eokTxt(-536130), '−53.6조'); assert.equal(eokTxt(2947), '+2,947억');
  const pub = candPubOf({place: 'kr', asOf: ASOF, boardId: 'b', universe: {id: 'u'}, cand: c}, '2026-10-08T20:00:00Z');
  assert.equal(pub.schema, 'atlas11-cand-1'); assert.equal(pub.cand.length, 2); assert.equal(pub.flow.sectors[0].label, '업종A');
  assert.equal(CAND_RULES.want, 7); assert.equal(CAND_RULES.perSector, 3);
});
