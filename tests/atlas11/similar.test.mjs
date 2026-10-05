// 「불장 닮은 7곳」 · 저녁 7시 「들고 남」(lib/atlas11/similar.mjs) — 2026-10-05 05:03 사장님 「불장에 공통된점을 찾아 아직 불징이 아닌 종목 7개를 … 매일 저녁 7시에 … 여러 주건들에 이동이 내영되게 하라」 · 05:07 「해」
// 셈 규칙은 가짜 회사로 따로 보고, 지금 판(실제 입력 · 실제 관측 묶음)으로 판 검사(validateBoard)와 앞날 말 없음을 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {similarBoard, movesOf, eveningRecordOf, upsOf, r5Of, TRAITS, SIMILAR_RULES} from '../../lib/atlas11/similar.mjs';
import {validateBoard, hidesPrediction} from '../../lib/atlas11/board.mjs';
import {buildViewFiles, eveningReady} from '../../scripts/atlas11/build_view.mjs';
import {readJSON} from './helpers.mjs';

const sha = x => createHash('sha256').update(x).digest('hex');
const rehash = files => { const m = structuredClone(files.get('manifest.json')); for (const [n, v] of files) if (n !== 'manifest.json') m.files[n] = {sha256: sha(JSON.stringify(v)), bytes: 0}; files.set('manifest.json', m); return files; };
/** 21개 종가 — ups 날 오르고(+1%) 나머지는 내림(−0.5%) · last5: 끝 5거래일 오름(true)/내림 */
function closes(ups, {last5 = true} = {}) {
  const cs = [100]; for (let i = 0; i < 20; i++) { const up = last5 ? (i >= 20 - Math.min(5, ups) || i < ups - Math.min(5, ups)) : i < ups; cs.push(Number((cs.at(-1) * (up ? 1.01 : 0.995)).toFixed(4))); }
  return cs;
}
/** 가짜 회사 하나 — 공통점 후보 값을 바로 정함 */
function co(code, g, {ups = 12, last5 = true, fgn = 1, ins = 1, hold = [10, 11], ret252 = 0.2, pos52 = 0.5, named = 1} = {}) {
  const c = closes(ups, {last5});
  return {code, name: '회사' + code, group: {id: 'g' + g, label: '업종' + g}, c, change20: Number((c[20] / c[0] - 1).toFixed(6)), info: {ret252, pos52},
    brief: {flows: {foreign: fgn, institution: ins, ...(hold ? {holdPct: {first: hold[0], last: hold[1]}} : {})}, newsNamed: named, newsCount: 6, missing: []}};
}

test('셈 도우미: 오른 날 수(+0.1% 넘게) · 최근 5거래일 변화 · 종가가 모자라면 모름(null)', () => {
  assert.equal(upsOf(closes(12)), 12); assert.equal(upsOf(closes(0)), 0); assert.equal(upsOf([1, 2, 3]), null);
  assert.ok(r5Of(closes(12)) > 0); assert.ok(r5Of(closes(3, {last5: false})) < 0); assert.equal(r5Of([1, 2]), null);
  assert.equal(TRAITS.length, 9); assert.deepEqual(SIMILAR_RULES, {want: 7, perIndustry: 2, minShare: 0.5, minGap: 0.10, minCommon: 3});
});

test('공통점: 불장 회사의 절반 넘게 가졌고 나머지보다 10%p 넘게 많은 것만 · 닮은 곳 = 불장 밖 · 공통점 많은 차례(같으면 20거래일 많이 오른 차례) · 한 업종 2곳 · 절반 넘게 가진 곳만', () => {
  // 불장 업종 g1·g2(10곳): 오른 날 많음 · 최근 5거래일 오름 · 20거래일 오름 · 기관 순매수 · 1년 전보다 높음 — 외국인 순매수는 반반 · 기사는 다 가짐(나머지도 다 가짐 → 공통점 아님)
  const hot = [...Array(10)].map((_, i) => co('1' + String(i).padStart(5, '0'), i < 5 ? 1 : 2, {fgn: i % 2 ? 1 : -1, hold: [10, 9]}));
  // 나머지: g3(4곳 — 모두 다 가짐) · g4(공통점 3가지) · g5(1가지 · 빠져야 함) · g6(값 모름 섞임)
  const rest = [
    ...[...Array(4)].map((_, i) => co('3' + String(i).padStart(5, '0'), 3, {ups: 12 + i})),
    co('400000', 4, {ups: 12, ins: -1, ret252: -0.1}), co('400001', 4, {ups: 11, ins: -1, ret252: -0.1}),
    co('500000', 5, {ups: 4, last5: false, ins: -1, ret252: -0.3}),
    {...co('600000', 6, {ups: 12}), brief: null},
    ...[...Array(8)].map((_, i) => co('7' + String(i).padStart(5, '0'), 7 + i, {ups: 3, last5: false, ins: -1, fgn: -1, ret252: -0.2, hold: [10, 9]}))];
  const sim = similarBoard([...hot, ...rest], new Set(['g1', 'g2']));
  assert.equal(sim.hotCompanies, 10); assert.equal(sim.restCompanies, 16);
  assert.deepEqual(sim.common, ['ups', 'r5', 'r20', 'ins', 'y1'], '외국인 순매수(반반)·기사(모두 가짐)·보유(불장 0%)는 공통점 아님');
  assert.equal(sim.filled, false); assert.equal(sim.need, 3, '5가지의 절반 넘게 = 3가지');
  const t = Object.fromEntries(sim.traits.map(x => [x.id, x]));
  assert.deepEqual(t.ups.hot, {yes: 10, known: 10}); assert.equal(t.news.common, false); assert.equal(t.fgn.common, false);
  assert.deepEqual(t.ins.rest, {yes: 4, known: 15}, '값을 모르는 회사(수급 없음)는 셈에서 뺌');
  assert.deepEqual(sim.items.map(x => x.matched), [5, 5, 4, 3, 3]);
  const codes = sim.items.map(x => x.code);
  assert.ok(!codes.some(c => c.startsWith('1')), '불장 업종 회사는 없음');
  assert.deepEqual(codes.slice(0, 2), ['300003', '300002'], 'g3 은 2곳까지 · 같은 수면 20거래일 많이 오른 차례');
  assert.ok(!codes.includes('300001') && !codes.includes('300000'), '한 업종 2곳까지');
  assert.ok(codes.includes('600000'), '수급을 몰라도 아는 공통점이 3가지 넘으면 들어옴');
  assert.deepEqual(sim.items.find(x => x.code === '600000').unknown, ['ins'], '모르는 공통점은 따로 적음');
  assert.ok(!codes.includes('500000') && !codes.some(c => c.startsWith('7')), '공통점이 절반에 못 미치면 넣지 않음');
  for (let i = 1; i < sim.items.length; i++) assert.ok(sim.items[i - 1].matched >= sim.items[i].matched, '공통점 많은 차례');
  assert.ok(sim.items.every(x => x.matched === x.has.length && x.has.every(id => sim.common.includes(id))));
});

test('공통점이 셋보다 적으면 차이가 큰 차례로 셋까지 채우고(채웠다고 적음) · 불장 업종이 없으면 빈 목록', () => {
  const hot = [...Array(6)].map((_, i) => co('1' + String(i).padStart(5, '0'), 1, {ups: i < 2 ? 12 : 3, last5: i < 3, ins: i < 2 ? 1 : -1, fgn: -1, ret252: i < 2 ? 0.1 : -0.1, hold: [10, 9], named: 0}));
  const rest = [...Array(6)].map((_, i) => co('2' + String(i).padStart(5, '0'), 2 + i, {ups: 3, last5: false, ins: -1, fgn: -1, ret252: -0.1, hold: [10, 9], named: 0}));
  const sim = similarBoard([...hot, ...rest], new Set(['g1']));
  assert.equal(sim.filled, true); assert.equal(sim.common.length, 3);
  const none = similarBoard(rest, new Set());
  assert.equal(none.hotCompanies, 0); assert.deepEqual(none.common, []); assert.deepEqual(none.items, []); assert.equal(none.filled, false);
});

test('들고 남: 기록 없음 → null · 하나 → 처음 기록 · 둘 → 불장에 든·빠진 업종 · 7곳에서 불장이 된 회사(빠짐에서 뺌) · 7곳·22곳 들고 남', () => {
  assert.equal(movesOf([]), null);
  const rec = (asOf, hot, similar, next) => ({schema: 'atlas11-evening-1', universe: 'u', asOf, recordedAt: asOf + 'T10:02:00Z', hot: hot.map(id => ({id, label: '업종' + id})), similar: similar.map(([code, g]) => ({code, name: '회사' + code, groupId: g, groupLabel: '업종' + g})), next: next.map(code => ({code, name: '회사' + code, groupId: 'gx'}))});
  const a = rec('2026-10-02', ['g1', 'g2'], [['000001', 'g3'], ['000002', 'g4'], ['000003', 'g5']], ['100001', '100002']);
  assert.deepEqual(movesOf([a]), {universe: 'u', to: '2026-10-02', at: '2026-10-02T10:02:00Z', records: 1, first: true, from: null});
  const b = rec('2026-10-05', ['g1', 'g3'], [['000002', 'g4'], ['000009', 'g9']], ['100002', '100003']);
  const m = movesOf([b, a]);
  assert.equal(m.first, false); assert.equal(m.from, '2026-10-02'); assert.equal(m.to, '2026-10-05');
  assert.deepEqual(m.hotIn.map(x => x.id), ['g3']); assert.deepEqual(m.hotOut.map(x => x.id), ['g2']);
  assert.deepEqual(m.becameHot.map(x => x.code), ['000001'], 'g3 이 불장이 되어 000001 은 「불장이 됨」');
  assert.deepEqual(m.similarOut.map(x => x.code), ['000003'], '불장이 된 회사는 「빠짐」에 두 번 적지 않음');
  assert.deepEqual(m.similarIn.map(x => x.code), ['000009']);
  assert.deepEqual(m.nextIn.map(x => x.code), ['100003']); assert.deepEqual(m.nextOut.map(x => x.code), ['100001']);
});

test('저녁 기록은 그 종가 날짜의 저녁 7시(KST)가 지난 뒤에만 · 기록 한 장은 판의 불장·닮은 7곳·22곳 id 와 이름만', () => {
  assert.equal(eveningReady('2026-10-05', '2026-10-05T09:59:59Z'), false, '18:59:59 KST');
  assert.equal(eveningReady('2026-10-05', '2026-10-05T10:00:00Z'), true, '19:00 KST');
  assert.equal(eveningReady('2026-10-02', '2026-10-05T07:00:00Z'), true, '지난 날짜');
  assert.equal(eveningReady(null, '2026-10-05T10:00:00Z'), false);
  const board = {asOf: '2026-10-05', boardId: 'board-x', hot: {items: [{id: 'g1', label: 'A', change20: 0.1, up: 5, measured: 5}]}, similar: {common: ['ups'], items: [{code: '000001', name: 'X', groupId: 'g2', groupLabel: 'B', matched: 1, has: ['ups'], change20: 0.01}]}, next: {items: [{code: '000002', name: 'Y', groupId: 'g3', groupLabel: 'C', change20: 0.2}]}};
  assert.deepEqual(eveningRecordOf(board, {universe: 'u', recordedAt: '2026-10-05T10:01:00Z'}), {schema: 'atlas11-evening-1', universe: 'u', asOf: '2026-10-05', recordedAt: '2026-10-05T10:01:00Z', run: 'evening', boardId: 'board-x',
    hot: [{id: 'g1', label: 'A', change20: 0.1}], similar: [{code: '000001', name: 'X', groupId: 'g2', groupLabel: 'B', matched: 1}], common: ['ups'], next: [{code: '000002', name: 'Y', groupId: 'g3', groupLabel: 'C'}]});
});

test('지금 판(실제 입력 · 관측 묶음): 닮은 곳은 7곳까지 · 불장 밖 · 판 검사 통과 · 앞날 말 없음 · 불장 업종 회사를 심으면 판 검사가 막음', async () => {
  const files = await buildViewFiles({now: '2026-10-05T05:00:00Z'}), b = files.get('board.json'), m = files.get('manifest.json'), input = await readJSON('public/data/input.json');
  const hot = new Set(b.hot.items.map(x => x.id)), byCode = new Map(b.companies.map(c => [c.code, c]));
  assert.ok(b.similar.items.length > 0 && b.similar.items.length <= 7);
  assert.ok(b.similar.items.every(x => !hot.has(byCode.get(x.code).group.id)));
  assert.deepEqual(m.counts, {hot: b.hot.items.length, next: b.next.items.length, similar: b.similar.items.length, groups: b.groups.length});
  assert.ok(!hidesPrediction(JSON.stringify(b.similar)) && !hidesPrediction(JSON.stringify(b.moves ?? {})));
  assert.equal(validateBoard(files, {input, now: '2026-10-05T05:00:00Z'}), true);
  const bad = structuredClone(b), hotCo = b.companies.find(c => hot.has(c.group.id));
  bad.similar.items[0] = {...bad.similar.items[0], code: hotCo.code, name: hotCo.name, groupId: hotCo.group.id, groupLabel: hotCo.group.label, change20: hotCo.change20};
  const planted = rehash(new Map([...files, ['board.json', bad]]));
  assert.throws(() => validateBoard(planted, {input, now: '2026-10-05T05:00:00Z'}), /BOARD_SIMILAR/);
});
