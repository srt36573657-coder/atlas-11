/* ATLAS 11 · 종목별 채점 칸(score-cells.json · 명령서 6판 R1 · 시험 T1~T4 · 따지는 이 G1 보류)
   기록 장부의 실제 채점 기록 + 채점판(scores.json 과 같은 계산)으로 만든다. 시각을 9/30(수) 21:00 KST 로 고정해 9/29·9/30 두 채점일만 본다. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildScoreboard} from '../../lib/atlas11/score.mjs';
import {readAllPublications} from '../../lib/atlas11/forecast.mjs';
import {readRecords} from '../../lib/atlas11/records.mjs';
import {buildScoreCells, validateScoreCells, derive, groupOf, SCORE_CELL_KEYS, GROUP_LABELS} from '../../lib/atlas11/score_cells.mjs';
import {buildViewBundle, validateViewBundle} from '../../lib/atlas11/view.mjs';
import {readJSON, realInputs, root} from './helpers.mjs';

const NOW = '2026-09-30T12:00:00.000Z';
const sha = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
let shared = null;
async function real(now = NOW) {
  const input = await readJSON('public/data/input.json'), calendar = await readJSON('public/data/rolling-calendar.json');
  const publications = await readAllPublications(root), scoreRecords = await readRecords(root, 'score');
  const scoreboard = buildScoreboard({publications, input, calendar, now});
  return {scoreboard, scoreRecords, file: buildScoreCells({scoreboard, scoreRecords})};
}
const once = async () => (shared ??= await real());
const recompute = c => { const d = derive(c.anchor, c.p50, c.actual); Object.assign(c, {predRet: d.predRet, actRet: d.actRet, errWon: d.errWon, apeRatio: d.apeRatio, actDir: d.actDir, sizeOk: d.sizeOk}); c.dirOk = c.predDir === c.actDir; c.group = groupOf(c.dirOk, c.sizeOk); return c; };

test('T1 · 채점일마다 52줄(9/29·9/30 = 104줄) · 칸 16개 · 날짜·종목 순서 · 보류 0 · 채점판과 차이 0', async () => {
  const {scoreboard, file} = await once();
  assert.equal(file.schema, 'atlas11-score-cells-1'); assert.equal(file.horizon, 1);
  assert.deepEqual(Object.keys(file), ['schema', 'horizon', 'dates', 'cells', 'held']);
  assert.deepEqual(file.dates.map(d => d.date), ['2026-09-29', '2026-09-30']);
  assert.deepEqual(file.dates.map(d => d.count), [52, 52]); assert.deepEqual(file.dates.map(d => d.held), [0, 0]); assert.equal(file.cells.length, 104); assert.deepEqual(file.held, []);
  assert.equal(file.dates[0].forecastId, '2026-09-28-rolling20-13cd892134e517b4', '9/29 대표 발행본 = 그 세션 첫 발행본');
  assert.equal(file.dates[1].forecastId, '2026-09-29-atlas11-128de9174cfdfa1f', '9/30 대표 발행본');
  for (const c of file.cells) assert.deepEqual(Object.keys(c), [...SCORE_CELL_KEYS]);
  assert.equal(SCORE_CELL_KEYS.length, 16); assert.ok(SCORE_CELL_KEYS.includes('apeRatio') && !SCORE_CELL_KEYS.includes('ape'), '오차율은 비율(apeRatio) — 장부·scores.json 의 ape(%)와 이름을 달리함');
  const keys = file.cells.map(c => c.date + '|' + c.code); assert.deepEqual(keys, [...keys].sort()); assert.equal(new Set(keys).size, 104);
  assert.equal(validateScoreCells(file, scoreboard), true);
  // 본보기 칸(명령서 W4): 9/29 HD현대중공업 — 예측 443,445원 +0.33% → 실제 429,000원 −2.94% · 오차 +14,445원 · 3.37% · ④
  const hd = file.cells.find(c => c.date === '2026-09-29' && c.name === 'HD현대중공업');
  assert.equal(hd.anchor, 442000); assert.equal(Math.round(hd.p50), 443445); assert.equal(hd.actual, 429000); assert.equal((hd.predRet * 100).toFixed(2), '0.33'); assert.equal((hd.actRet * 100).toFixed(2), '-2.94');
  assert.equal(Math.round(hd.errWon), 14445); assert.equal((hd.apeRatio * 100).toFixed(2), '3.37'); assert.equal(hd.group, 4); assert.equal(hd.dirOk, false); assert.equal(hd.sizeOk, false);
  assert.match(hd.scoreId, /^score-[0-9a-f]{16}$/);
});

test('T2 · 네 묶음: 날짜별로 정답표(expected.json)와 같음 · 합 52 · 보합 6칸 · 가운데 값 ±0.10% 안 55칸(같은 부호 47 · 반대 부호 8)', async () => {
  const {file} = await once();
  const expected = await readJSON('reports/atlas11/overhaul/expected.json');
  assert.deepEqual(file.dates.find(d => d.date === '2026-09-29').groups, expected['네묶음']['9/29']);
  assert.deepEqual(file.dates.find(d => d.date === '2026-09-30').groups, expected['네묶음']['9/30']);
  for (const d of file.dates) assert.equal(d.groups.reduce((s, v) => s + v, 0), 52);
  assert.equal(file.cells.filter(c => c.dirOk).length, expected['방향맞음']); assert.equal(file.cells.filter(c => !c.dirOk).length, expected['방향틀림']);
  assert.equal(file.cells.filter(c => c.actDir === 'flat').length, 6, '실제 보합(출발 종가 대비 ±0.1% 안) 6칸');
  const band = file.cells.filter(c => Math.abs(c.predRet) <= 0.001), opposite = file.cells.filter(c => (c.predRet > 0 && c.predDir === 'down') || (c.predRet < 0 && c.predDir === 'up'));
  assert.equal(band.length, 55); assert.equal(opposite.length, 8); assert.ok(opposite.every(c => Math.abs(c.predRet) <= 0.001), '반대 부호 8칸은 모두 ±0.10% 안');
  assert.equal(GROUP_LABELS.length, 4);
  for (const c of file.cells) assert.equal(c.group, groupOf(c.dirOk, c.sizeOk));
});

test('T3 · 보인 줄 한 칸을 1원 바꾸면 VIEW_SCORE_CELLS 로 실패(파생 값까지 맞춰 고쳐도) · 한 줄을 지워도 실패', async () => {
  const {scoreboard, file} = await once();
  const i = file.cells.findIndex(c => c.name === 'HD현대중공업');
  const tamper = (field, re) => { const f = structuredClone(file), c = f.cells[i]; c[field] += 1; if (re) recompute(c); return f; };
  for (const field of ['p50', 'actual', 'anchor']) for (const re of [false, true]) assert.throws(() => validateScoreCells(tamper(field, re), scoreboard), /VIEW_SCORE_CELLS/, `${field} +1원 (파생 다시 셈 ${re})`);
  const dropped = structuredClone(file); dropped.cells.splice(7, 1);
  assert.throws(() => validateScoreCells(dropped, scoreboard), /VIEW_SCORE_CELLS count/);
  const flipped = structuredClone(file); flipped.cells[i].group = 1;
  assert.throws(() => validateScoreCells(flipped, scoreboard), /VIEW_SCORE_CELLS/);
  const stamped = structuredClone(file); stamped.generatedAt = NOW;
  assert.throws(() => validateScoreCells(stamped, scoreboard), /VIEW_SCORE_CELLS top-level keys/, '시각을 넣으면 실패(T4 를 지키려고)');
  // 맞는 줄을 까닭 없이 보류로 옮겨 숨기면 실패
  const hidden = structuredClone(file), [moved] = hidden.cells.splice(i, 1); hidden.dates[0].count--; hidden.dates[0].held++; hidden.dates[0].groups[moved.group - 1]--;
  hidden.held.push({date: moved.date, code: moved.code, name: moved.name, scoreId: moved.scoreId, reasons: [{field: 'p50', ledger: moved.p50, scoreboard: moved.p50}]});
  assert.throws(() => validateScoreCells(hidden, scoreboard), /VIEW_SCORE_CELLS held reason/);
});

test('T4 · 두 번 만들기(다른 시각) → score-cells sha256 같음', async () => {
  const a = await once(), b = await real('2026-09-30T22:59:00.000Z');
  assert.notEqual(a.scoreboard.generatedAt, b.scoreboard.generatedAt);
  assert.equal(sha(a.file), sha(b.file));
});

test('G1 · 발행 뒤 출발 종가 정정(9/29 HD현대중공업 329180 출발 종가 +1,000원) → 그 칸은 보류 · 화면 묶음은 멈추지 않고 검사 통과', async () => {
  const input = await readJSON('public/data/input.json'), calendar = await readJSON('public/data/rolling-calendar.json');
  const publications = await readAllPublications(root), scoreRecords = await readRecords(root, 'score');
  const publication = await readJSON('reports/atlas11/versions/2026-09-30-atlas11-d63a7866e135fbc2.json');
  // 9/30 종가까지만 남긴 입력(뒤 날짜가 쌓여도 같은 시험) · 장부는 발행 때 출발 종가(442,000원)를 지니고, 입력(채점판이 읽는 값)만 정정됨
  const cut = structuredClone(input); for (const a of cut.assets) a.prices = a.prices.filter(p => p.date <= '2026-09-30'); cut.actualAsOf = '2026-09-30';
  const row = cut.assets.find(a => a.code === '329180').prices.find(p => p.date === '2026-09-28'); assert.equal(row.close, 442000); row.close += 1000;
  let files; assert.doesNotThrow(() => { files = buildViewBundle({publication, input: cut, calendar, publications, scoreRecords, now: NOW}); }, '정정된 칸이 있어도 화면 묶음 만들기는 멈추지 않는다');
  const sc = files.get('score-cells.json');
  assert.equal(sc.held.length, 1); assert.equal(sc.held[0].code, '329180'); assert.equal(sc.held[0].date, '2026-09-29'); assert.equal(sc.held[0].name, 'HD현대중공업');
  assert.deepEqual(sc.held[0].reasons.find(r => r.field === 'anchor'), {field: 'anchor', ledger: 442000, scoreboard: 443000});
  assert.deepEqual(sc.dates.map(d => [d.date, d.count, d.held]), [['2026-09-29', 51, 1], ['2026-09-30', 52, 0]]);
  assert.equal(sc.dates[0].groups.reduce((s, v) => s + v, 0), 51); assert.ok(!sc.cells.some(c => c.code === '329180' && c.date === '2026-09-29'), '보류 칸은 표에 없다');
  assert.equal(validateViewBundle(files, publication), true);
  // 보인 줄은 여전히 1원 변조를 막는다 · 보류 칸을 장부 값 그대로 다시 표에 넣어도 막는다
  const t = new Map(files), s2 = structuredClone(sc); s2.cells[0].p50 += 1; t.set('score-cells.json', s2);
  assert.throws(() => validateViewBundle(t, publication), /VIEW_SCORE_CELLS/);
  const back = new Map(files), s3 = structuredClone(sc), h = s3.held.pop(), b = scoreRecords.filter(r => r.body?.kind === 'live' && r.body.horizon === 1 && r.body.code === '329180' && r.body.targetDate === '2026-09-29' && r.body.forecastId === sc.dates[0].forecastId).at(-1).body;
  s3.cells.push(recompute({date: h.date, code: h.code, name: h.name, anchor: b.anchor, p50: b.predicted.p50, predRet: 0, actual: b.actual, actRet: 0, errWon: 0, apeRatio: 0, predDir: b.predictedDirection, actDir: 'flat', dirOk: false, sizeOk: false, group: 4, scoreId: h.scoreId}));
  s3.cells.sort((x, y) => (x.date + x.code < y.date + y.code ? -1 : 1)); s3.dates[0].count++; s3.dates[0].held--; s3.dates[0].groups = [1, 2, 3, 4].map(g => s3.cells.filter(c => c.date === '2026-09-29' && c.group === g).length); back.set('score-cells.json', s3);
  assert.throws(() => validateViewBundle(back, publication), /VIEW_SCORE_CELLS anchor vs scores.json/);
});

test('화면 묶음: score-cells.json 이 들어가고 validateViewBundle 이 VIEW_SCORE_CELLS 로 막는다(9/28 고정 입력 · 채점 칸 0)', async () => {
  const {input, calendar} = await realInputs();
  const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'); const publications = await readAllPublications(root);
  const files = buildViewBundle({publication: p, input, calendar, publications, now: '2026-09-28T13:40:00.000Z'});
  const sc = files.get('score-cells.json'); assert.deepEqual(sc, {schema: 'atlas11-score-cells-1', horizon: 1, dates: [], cells: [], held: []});
  assert.ok(files.get('manifest.json').files['score-cells.json'].sha256);
  const planted = new Map(files); planted.set('score-cells.json', {...sc, cells: [{date: '2026-09-29', code: '005930', name: '삼성전자', anchor: 1, p50: 1, predRet: 0, actual: 1, actRet: 0, errWon: 0, apeRatio: 0, predDir: 'flat', actDir: 'flat', dirOk: true, sizeOk: true, group: 1, scoreId: 'score-0000000000000000'}]});
  assert.throws(() => validateViewBundle(planted, p), /VIEW_SCORE_CELLS/);
  const missing = new Map(files); missing.delete('score-cells.json');
  assert.throws(() => validateViewBundle(missing, p), /VIEW_SCORE_CELLS/);
});
