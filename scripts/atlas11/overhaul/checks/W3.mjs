/**
 * W3 · R1 시험 T1~T4 — 만든 파일(public/data/atlas11/view/score-cells.json · scores.json)에서 잰다(명령서 6판 13절·10절)
 *   T1 score-cells: 9/29 52줄 · 9/30 52줄(칸 16개 · VIEW_SCORE_CELLS 통과)
 *   T2 네 묶음: 날짜별로 정답표(expected.json 「네묶음」)와 같음
 *   T3 한 칸 1원 변조 → VIEW_SCORE_CELLS 실패(score-cells 검사와 화면 묶음 검사 validateViewBundle 둘 다)
 *   T4 두 번 만들기(메모리 · 다른 시각) → score-cells sha256 같음 · 디스크에 만든 파일과도 같음
 *   결함 심기(10절): T1 한 줄 지우기 · T3 1원 바꾸기 — 막지 못하면 그 시험은 없는 것으로 본다
 *   G1(따지는 이 10/01 오후): 발행 뒤 출발 종가 정정(9/29 HD현대중공업 출발 종가 +1,000원)을 입력에만 넣으면 그 칸은 보류(held)로 가고
 *      화면 묶음 만들기는 멈추지 않으며 validateViewBundle 이 통과한다 — 매일 실행이 VIEW_SCORE_CELLS 로 멈추지 않음
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
  report('T1', rows['9/29'] === 52 && rows['9/30'] === 52 && file.held.length === 0 && keys16 && v.ok, {rows, held: file.held.length, total: rows['9/29'] + rows['9/30'], expectedCells: expected['칸'], columns: SCORE_CELL_KEYS.length, validate: v.ok ? 'VIEW_SCORE_CELLS 통과' : v.error, dates: file.dates.map(d => `${d.date} ${d.count}줄 · 보류 ${d.held} · ${Array.isArray(d.forecastId) ? d.forecastId.join('+') : d.forecastId}`)});
  // T2
  const groups = Object.fromEntries(Object.entries(D).map(([k, d]) => [k, file.dates.find(x => x.date === d)?.groups ?? null]));
  const counted = Object.fromEntries(Object.entries(D).map(([k, d]) => [k, [1, 2, 3, 4].map(g => file.cells.filter(c => c.date === d && c.group === g).length)]));
  const t2 = Object.keys(D).every(k => JSON.stringify(groups[k]) === JSON.stringify(expected['네묶음'][k]) && JSON.stringify(counted[k]) === JSON.stringify(expected['네묶음'][k]));
  report('T2', t2, {groups, countedFromRows: counted, expected: expected['네묶음']});
  // T3 — 1원 변조: 예측·실제·출발 종가 각각, 파생 값을 그대로 둔 것과 맞춰 고친 것 · 화면 묶음 검사로도
  const i = Math.max(0, file.cells.findIndex(c => c.date === D['9/29'] && c.name === 'HD현대중공업'));
  const tamper = (field, recompute) => { const f = structuredClone(file), c = f.cells[i]; c[field] += 1; if (recompute) { const d = derive(c.anchor, c.p50, c.actual); Object.assign(c, {predRet: d.predRet, actRet: d.actRet, errWon: d.errWon, apeRatio: d.apeRatio, actDir: d.actDir, sizeOk: d.sizeOk}); c.dirOk = c.predDir === c.actDir; c.group = groupOf(c.dirOk, c.sizeOk); } return f; };
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
  // G1 — 발행 뒤 출발 종가 정정을 입력(채점판이 읽는 값)에만 넣고 9/30 발행본으로 화면 묶음을 만든다(장부는 그대로)
  const {buildViewBundle} = await load('lib/atlas11/view.mjs');
  const {readAllPublications} = await load('lib/atlas11/forecast.mjs');
  const {readRecords} = await load('lib/atlas11/records.mjs');
  const input = JSON.parse(fs.readFileSync(rel('public/data/input.json'), 'utf8')), calendar = JSON.parse(fs.readFileSync(rel('public/data/rolling-calendar.json'), 'utf8'));
  const pub930 = JSON.parse(fs.readFileSync(rel('reports/atlas11/versions/2026-09-30-atlas11-d63a7866e135fbc2.json'), 'utf8'));
  for (const a of input.assets) a.prices = a.prices.filter(p => p.date <= '2026-09-30'); input.actualAsOf = '2026-09-30';
  const anchorRow = input.assets.find(a => a.code === '329180').prices.find(p => p.date === '2026-09-28'), before = anchorRow.close; anchorRow.close += 1000;
  let g1 = null, g1err = null;
  try { const files = buildViewBundle({publication: pub930, input, calendar, publications: await readAllPublications(rel('.')), scoreRecords: await readRecords(rel('.'), 'score'), now: '2026-09-30T12:00:00.000Z'}); const sc = files.get('score-cells.json'); g1 = {held: sc.held.map(h => ({date: h.date, code: h.code, name: h.name, reasons: h.reasons})), dates: sc.dates.map(d => `${d.date} 보인 ${d.count} · 보류 ${d.held}`), valid: validateViewBundle(files, pub930) === true}; } catch (e) { g1err = String(e.message); }
  const anchorReason = g1?.held?.[0]?.reasons?.find(r => r.field === 'anchor');
  report('G1', !g1err && g1.valid && g1.held.length === 1 && g1.held[0].code === '329180' && anchorReason?.ledger === before && anchorReason?.scoreboard === before + 1000, {planted: `입력의 9/28 HD현대중공업 종가 ${before}원 → ${before + 1000}원(장부는 그대로)`, built: !g1err, error: g1err, ...g1});
}
