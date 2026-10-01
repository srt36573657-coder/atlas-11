/* ATLAS 11 · 종목별 채점 칸(score-cells.json · 명령서 6판 R1 · 시험 T1~T4)
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

test('T1 · 채점일마다 52줄(9/29·9/30 = 104줄) · 칸 16개 · 날짜·종목 순서 · 채점판과 차이 0', async () => {
  const {scoreboard, file} = await once();
  assert.equal(file.schema, 'atlas11-score-cells-1'); assert.equal(file.horizon, 1);
  assert.deepEqual(Object.keys(file), ['schema', 'horizon', 'dates', 'cells']);
  assert.deepEqual(file.dates.map(d => d.date), ['2026-09-29', '2026-09-30']);
  assert.deepEqual(file.dates.map(d => d.count), [52, 52]); assert.equal(file.cells.length, 104);
  assert.equal(file.dates[0].forecastId, '2026-09-28-rolling20-13cd892134e517b4', '9/29 대표 발행본 = 그 세션 첫 발행본');
  assert.equal(file.dates[1].forecastId, '2026-09-29-atlas11-128de9174cfdfa1f', '9/30 대표 발행본');
  for (const c of file.cells) assert.deepEqual(Object.keys(c), [...SCORE_CELL_KEYS]);
  assert.equal(SCORE_CELL_KEYS.length, 16);
  const keys = file.cells.map(c => c.date + '|' + c.code); assert.deepEqual(keys, [...keys].sort()); assert.equal(new Set(keys).size, 104);
  assert.equal(validateScoreCells(file, scoreboard), true);
  // 본보기 칸(명령서 W4): 9/29 HD현대중공업 — 예측 443,445원 +0.33% → 실제 429,000원 −2.94% · 오차 +14,445원 · 3.37% · ④
  const hd = file.cells.find(c => c.date === '2026-09-29' && c.name === 'HD현대중공업');
  assert.equal(Math.round(hd.p50), 443445); assert.equal(hd.actual, 429000); assert.equal((hd.predRet * 100).toFixed(2), '0.33'); assert.equal((hd.actRet * 100).toFixed(2), '-2.94');
  assert.equal(Math.round(hd.errWon), 14445); assert.equal((hd.ape * 100).toFixed(2), '3.37'); assert.equal(hd.group, 4); assert.equal(hd.dirOk, false); assert.equal(hd.sizeOk, false);
  assert.match(hd.scoreId, /^score-[0-9a-f]{16}$/);
});

test('T2 · 네 묶음: 날짜별로 정답표(expected.json)와 같음 · 합 52 · 보합 6칸', async () => {
  const {file} = await once();
  const expected = await readJSON('reports/atlas11/overhaul/expected.json');
  assert.deepEqual(file.dates.find(d => d.date === '2026-09-29').groups, expected['네묶음']['9/29']);
  assert.deepEqual(file.dates.find(d => d.date === '2026-09-30').groups, expected['네묶음']['9/30']);
  for (const d of file.dates) assert.equal(d.groups.reduce((s, v) => s + v, 0), 52);
  assert.equal(file.cells.filter(c => c.dirOk).length, expected['방향맞음']); assert.equal(file.cells.filter(c => !c.dirOk).length, expected['방향틀림']);
  assert.equal(file.cells.filter(c => c.actDir === 'flat').length, 6, '실제 보합(출발 종가 대비 ±0.1% 안) 6칸');
  assert.equal(GROUP_LABELS.length, 4);
  for (const c of file.cells) assert.equal(c.group, groupOf(c.dirOk, c.sizeOk));
});

test('T3 · 한 칸을 1원 바꾸면 VIEW_SCORE_CELLS 로 실패(파생 값까지 맞춰 고쳐도) · 한 줄을 지워도 실패', async () => {
  const {scoreboard, file} = await once();
  const i = file.cells.findIndex(c => c.name === 'HD현대중공업');
  const tamper = (field, recompute) => { const f = structuredClone(file), c = f.cells[i]; c[field] += 1; if (recompute) { const d = derive(c.anchor, c.p50, c.actual); Object.assign(c, {predRet: d.predRet, actRet: d.actRet, errWon: d.errWon, ape: d.ape, actDir: d.actDir, sizeOk: d.sizeOk}); c.dirOk = c.predDir === c.actDir; c.group = groupOf(c.dirOk, c.sizeOk); } return f; };
  for (const field of ['p50', 'actual', 'anchor']) for (const recompute of [false, true]) assert.throws(() => validateScoreCells(tamper(field, recompute), scoreboard), /VIEW_SCORE_CELLS/, `${field} +1원 (파생 다시 셈 ${recompute})`);
  const dropped = structuredClone(file); dropped.cells.splice(7, 1);
  assert.throws(() => validateScoreCells(dropped, scoreboard), /VIEW_SCORE_CELLS count/);
  const flipped = structuredClone(file); flipped.cells[i].group = 1;
  assert.throws(() => validateScoreCells(flipped, scoreboard), /VIEW_SCORE_CELLS/);
  const stamped = structuredClone(file); stamped.generatedAt = NOW;
  assert.throws(() => validateScoreCells(stamped, scoreboard), /VIEW_SCORE_CELLS top-level keys/, '시각을 넣으면 실패(T4 를 지키려고)');
});

test('T4 · 두 번 만들기(다른 시각) → score-cells sha256 같음', async () => {
  const a = await once(), b = await real('2026-09-30T22:59:00.000Z');
  assert.notEqual(a.scoreboard.generatedAt, b.scoreboard.generatedAt);
  assert.equal(sha(a.file), sha(b.file));
});

test('화면 묶음: score-cells.json 이 들어가고 validateViewBundle 이 VIEW_SCORE_CELLS 로 막는다(9/28 고정 입력 · 채점 칸 0)', async () => {
  const {input, calendar} = await realInputs();
  const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'); const publications = await readAllPublications(root);
  const files = buildViewBundle({publication: p, input, calendar, publications, now: '2026-09-28T13:40:00.000Z'});
  const sc = files.get('score-cells.json'); assert.deepEqual(sc, {schema: 'atlas11-score-cells-1', horizon: 1, dates: [], cells: []});
  assert.ok(files.get('manifest.json').files['score-cells.json'].sha256);
  const planted = new Map(files); planted.set('score-cells.json', {...sc, cells: [{date: '2026-09-29', code: '005930', name: '삼성전자', anchor: 1, p50: 1, predRet: 0, actual: 1, actRet: 0, errWon: 0, ape: 0, predDir: 'flat', actDir: 'flat', dirOk: true, sizeOk: true, group: 1, scoreId: 'score-0000000000000000'}]});
  assert.throws(() => validateViewBundle(planted, p), /VIEW_SCORE_CELLS/);
  const missing = new Map(files); missing.delete('score-cells.json');
  assert.throws(() => validateViewBundle(missing, p), /VIEW_SCORE_CELLS/);
});
