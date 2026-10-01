/**
 * W3 · R1 시험 T1~T4 — 만든 파일(public/data/atlas11/view/score-cells.json · scores.json)에서 잰다(명령서 6판 13절·10절)
 *   T1 score-cells: 9/29 52줄 · 9/30 52줄(칸 16개 · VIEW_SCORE_CELLS 통과)
 *   T2 네 묶음: 날짜별로 정답표(expected.json 「네묶음」)와 같음
 *   T3 한 칸 1원 변조 → VIEW_SCORE_CELLS 실패(score-cells 검사와 화면 묶음 검사 validateViewBundle 둘 다)
 *   T4 두 번 만들기(메모리 · 다른 시각) → score-cells sha256 같음 · 디스크에 만든 파일과도 같음
 *   결함 심기(10절): T1 한 줄 지우기 · T3 1원 바꾸기 — 막지 못하면 그 시험은 없는 것으로 본다
 */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export default async function ({report, sha, rel}) {
  const load = p => import(pathToFileURL(rel(p)).href);
  const cellsPath = rel('public/data/atlas11/view/score-cells.json'), scoresPath = rel('public/data/atlas11/view/scores.json');
  if (!fs.existsSync(cellsPath)) { for (const t of ['T1', 'T2', 'T3', 'T4']) report(t, false, {error: 'public/data/atlas11/view/score-cells.json 없음 — build_view 가 아직 만들지 않음'}); return; }
  const {validateScoreCells, derive, groupOf, SCORE_CELL_KEYS} = await load('lib/atlas11/score_cells.mjs');
  const buf = fs.readFileSync(cellsPath), file = JSON.parse(buf.toString('utf8')), scores = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
  const expected = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/expected.json'), 'utf8'));
  const run = f => { try { return {ok: validateScoreCells(f, scores) === true, error: null}; } catch (e) { return {ok: false, error: String(e.message)}; } };
  const D = {'9/29': '2026-09-29', '9/30': '2026-09-30'};
  // T1
  const rows = Object.fromEntries(Object.entries(D).map(([k, d]) => [k, file.cells.filter(c => c.date === d).length]));
  const keys16 = file.cells.every(c => Object.keys(c).join(',') === SCORE_CELL_KEYS.join(',')) && SCORE_CELL_KEYS.length === 16;
  const v = run(file);
  report('T1', rows['9/29'] === 52 && rows['9/30'] === 52 && keys16 && v.ok, {rows, total: rows['9/29'] + rows['9/30'], expectedCells: expected['칸'], columns: SCORE_CELL_KEYS.length, validate: v.ok ? 'VIEW_SCORE_CELLS 통과' : v.error, dates: file.dates.map(d => `${d.date} ${d.count}줄 · ${Array.isArray(d.forecastId) ? d.forecastId.join('+') : d.forecastId}`)});
  // T2
  const groups = Object.fromEntries(Object.entries(D).map(([k, d]) => [k, file.dates.find(x => x.date === d)?.groups ?? null]));
  const counted = Object.fromEntries(Object.entries(D).map(([k, d]) => [k, [1, 2, 3, 4].map(g => file.cells.filter(c => c.date === d && c.group === g).length)]));
  const t2 = Object.keys(D).every(k => JSON.stringify(groups[k]) === JSON.stringify(expected['네묶음'][k]) && JSON.stringify(counted[k]) === JSON.stringify(expected['네묶음'][k]));
  report('T2', t2, {groups, countedFromRows: counted, expected: expected['네묶음']});
  // T3 — 1원 변조: 예측·실제·출발 종가 각각, 파생 값을 그대로 둔 것과 맞춰 고친 것 · 화면 묶음 검사로도
  const i = Math.max(0, file.cells.findIndex(c => c.date === D['9/29'] && c.name === 'HD현대중공업'));
  const tamper = (field, recompute) => { const f = structuredClone(file), c = f.cells[i]; c[field] += 1; if (recompute) { const d = derive(c.anchor, c.p50, c.actual); Object.assign(c, {predRet: d.predRet, actRet: d.actRet, errWon: d.errWon, ape: d.ape, actDir: d.actDir, sizeOk: d.sizeOk}); c.dirOk = c.predDir === c.actDir; c.group = groupOf(c.dirOk, c.sizeOk); } return f; };
  const tries = [];
  for (const field of ['p50', 'actual', 'anchor']) for (const recompute of [false, true]) { const r = run(tamper(field, recompute)); tries.push({field, recompute, caught: !r.ok && /^VIEW_SCORE_CELLS/.test(r.error ?? ''), error: r.error}); }
  // 화면 묶음 전체(메모리에서 다시 만든 것)에 1원 변조를 넣어 validateViewBundle 이 VIEW_SCORE_CELLS 로 막는지
  const {buildViewFiles} = await load('scripts/atlas11/build_view.mjs');
  const {validateViewBundle} = await load('lib/atlas11/view.mjs');
  const publication = JSON.parse(fs.readFileSync(rel('public/data/atlas11/forecast.json'), 'utf8'));
  const t0 = Date.now(), files1 = await buildViewFiles({now: new Date().toISOString()});
  const bundle = new Map(files1), sc = structuredClone(files1.get('score-cells.json')); sc.cells[i].p50 += 1; bundle.set('score-cells.json', sc);
  let bundleErr = null; try { validateViewBundle(bundle, publication); } catch (e) { bundleErr = String(e.message); }
  tries.push({field: 'p50 (화면 묶음 validateViewBundle)', recompute: false, caught: /^VIEW_SCORE_CELLS/.test(bundleErr ?? ''), error: bundleErr});
  report('T3', tries.every(t => t.caught), {cell: `${file.cells[i].date} ${file.cells[i].name}`, tries});
  // 결함 심기 10절: T1 한 줄 지우기 · T3 1원 바꾸기
  const dropped = structuredClone(file); dropped.cells.splice(i, 1); const rd = run(dropped);
  report('inject:T1', !rd.ok && /^VIEW_SCORE_CELLS/.test(rd.error ?? ''), {planted: `한 줄 지움(${file.cells[i].date} ${file.cells[i].name})`, caught: !rd.ok, error: rd.error});
  report('inject:T3', tries[0].caught, {planted: '한 칸 예측 가격 +1원', caught: tries[0].caught, error: tries[0].error});
  // T4 — 메모리에서 두 번(다른 시각) + 디스크 파일
  const files2 = await buildViewFiles({now: new Date(Date.now() + 61000).toISOString()});
  const h1 = sha(JSON.stringify(files1.get('score-cells.json'))), h2 = sha(JSON.stringify(files2.get('score-cells.json'))), hd = sha(buf);
  const m1 = files1.get('manifest.json'), m2 = files2.get('manifest.json');
  report('T4', h1 === h2 && h2 === hd && m1.files['score-cells.json'].sha256 === h1 && m2.generatedAt !== m1.generatedAt, {build1: h1, build2: h2, onDisk: hd, manifestTimesDiffer: m2.generatedAt !== m1.generatedAt, seconds: Math.round((Date.now() - t0) / 1000)});
}
