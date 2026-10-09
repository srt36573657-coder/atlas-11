/**
 * 판 읽기(lens.json) 만들기 — 판마다 저장소 자료로 셈(lib/atlas11/lens.mjs) · 사이트 묶음(package.mjs)이 판마다 data/atlas11/view/lens.json 으로 싣는다
 *   「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) — 시장 · 돈 흐름 · 종목 · 일정 · 검증 다섯 탭이 함께 읽는 한 파일
 *   node scripts/atlas11/lens/build.mjs [kr|us] [--out file]   (따로 돌려 볼 때)
 * 읽는 곳(저장소 안 · 새로 받지 않음):
 *   한국: public/data/atlas11/view(board · manifest · agenda) · public/data/input.json(종가 · 선정 때 실적) · 판이 쓴 관측 묶음(manifest.market.record — 순매매 · 공시)
 *         · public/data/atlas11/evening/<묶음>/(저녁 기록 · 고치지 않음) · public/data/atlas11/market/KOSPI.json · public/data/rolling-calendar.json(거래일 · 앞날 휴장 포함)
 *   미국: public/data/atlas11/us/view · us/input.json · us/market/INX.json · us/evening(있으면) — 순매매 · 공시 자료는 없음(만들어 넣지 않음)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {lensOf, checkLens, lensJson} from '../../../lib/atlas11/lens.mjs';
import {elimOf} from '../../../lib/atlas11/elim.mjs'; // 소거 1판(2026-10-10 사장님 승인 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 3)
import {rotationOf} from '../story/build.mjs'; // 돈 흐름(업종 순환) — 매수 검토 후보가 「돈이 들어온 업종」을 고를 때(2026-10-09 03:53 「돈에 흐름이 강한 업종내에서 종목을 찾아내야 해」)

const readJson = async f => JSON.parse(await fs.readFile(f, 'utf8'));
const maybe = async f => { try { return await readJson(f); } catch { return null; } };
const dirName = id => String(id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_');
export const LENS_PLACES = {
  kr: {view: 'public/data/atlas11/view', input: 'public/data/input.json', index: 'public/data/atlas11/market/KOSPI.json', evening: 'public/data/atlas11/evening', calendar: 'public/data/rolling-calendar.json', closeAt: '15:30 KST', cand: 'public/data/atlas11/cand'}, // cand = 매수 검토 후보 발행본(2026-10-09 · 고치지 않음 · scripts/atlas11/cand_record.mjs)
  us: {view: 'public/data/atlas11/us/view', input: 'public/data/atlas11/us/input.json', index: 'public/data/atlas11/us/market/INX.json', evening: 'public/data/atlas11/us/evening', calendar: null, context: 'public/data/atlas11/us/context.json', cand: 'public/data/atlas11/us/cand'}, // cand = 후보 발행본(2026-10-09 19:29 「미국장 까지 다 대입」 — 미국 판 저녁 기록이 없어 발행본이 첫 기록)
};
async function readEvening(root, dir, universe) {
  const d = path.join(root, dir, dirName(universe)); let names = [];
  try { names = (await fs.readdir(d)).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort(); } catch { return []; }
  return (await Promise.all(names.map(n => maybe(path.join(d, n))))).filter(Boolean);
}
export {dirName};
/** 몬테카를로 결과 칸만 판 읽기에 싣는 모양(값은 비율 · 화면이 쓰는 칸만) */
const MC_ROW_KEYS = ['code', 'n', 'nBase', 'nExtra', 'nonfinite', 'extreme', 'mean', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5', 'se', 'volNow'];
/**
 * 몬테카를로 결과를 판 읽기에 붙일지 — 같은 기준일 · 같은 입력 지문(파일 바이트 sha256)일 때만 · 아니면 {none: true, why}(지어내지 않음) · 순수 함수
 *   latest = public/data/atlas11/mc/<판>/latest.json · result = 그 파일이 가리키는 결과(atlas11-mc-2)
 */
export function mcFor({latest, result, asOf, inputSha}) {
  if (!latest) return {none: true, why: '이번 회차 몬테카를로 결과 없음'};
  if (latest.schema !== 'atlas11-mc-latest-1') return {none: true, why: '가리키는 파일 모양이 다름'};
  if (latest.asOf !== asOf) return {none: true, why: `몬테카를로 기준일(${latest.asOf ?? '없음'})이 판 기준일(${asOf ?? '없음'})과 다름`};
  if (!inputSha || latest.inputSha256 !== inputSha) return {none: true, why: '입력 지문이 판의 입력과 다름 — 입력이 바뀐 뒤 아직 다시 셈 안 함'};
  if (!result || result.schema !== 'atlas11-mc-2' || result.runId !== latest.runId || result.asOf !== asOf || !Array.isArray(result.rows)) return {none: true, why: '결과 파일을 못 읽거나 가리키는 파일과 다름'};
  return {runId: result.runId, made: result.made ?? null, asOf: result.asOf, model: result.model ?? null, rng: result.rng ?? null,
    alloc: result.alloc ? {base: result.alloc.base, extra: result.alloc.extra, extraBoard: result.alloc.extraBoard, cap: result.alloc.cap, threshold: result.alloc.threshold, floor: result.alloc.floor ?? null} : null,
    paths: result.paths ?? null, input: result.input ? {file: result.input.file, sha256: result.input.sha256, days: result.input.days, from: result.input.from, to: result.input.to} : null,
    track: result.track && Array.isArray(result.track.codes) ? {codes: result.track.codes, missing: result.track.missing ?? [], days: result.track.days, q: result.track.q, rep: result.track.rep, from: result.track.from ?? null} : null, // 범위 띠(2026-10-10 2단계 · 엔진 --track) — 후보 둘러보기 「시뮬레이션 요약」
    bands: result.track && result.bands && typeof result.bands === 'object' ? Object.fromEntries(result.track.codes.filter(c => result.bands[c]).map(c => [c, result.bands[c]])) : null,
    rows: result.rows.map(r => Object.fromEntries(MC_ROW_KEYS.filter(k => k in r).map(k => [k, r[k]])))};
}
/** 사이트에 싣는 판 읽기(사이트 묶음 package.mjs) — 후보(cand.items)는 몬테카를로 행 · 소거 행을 다 싣고, 나머지 회사는 판정 · 처음 걸린 검사 · 범위 숫자만(휴대폰 첫 화면 파일을 가볍게)
 *   다 센 행은 회차 기록(public/data/atlas11/mc · reports/atlas11/rounds 검사 파일)에 그대로 · 순수 함수(들어온 판 읽기를 바꾸지 않음) */
const MC_SLIM = ['code', 'n', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5'];
export function siteLens(l) {
  if (!l || l.none) return l;
  const keep = new Set((l.cand?.ready ? l.cand.items ?? [] : []).map(x => String(x.code))), out = {...l}, why = '사이트 파일을 가볍게 — 후보만 전부 · 나머지는 줄임(다 센 행은 회차 기록에)';
  if (Array.isArray(l.elim?.rows)) out.elim = {...l.elim, rows: l.elim.rows.map(r => (keep.has(String(r.code)) ? r : {code: r.code, state: r.state, first: r.first})), slim: {full: [...keep], why}};
  if (Array.isArray(l.mc?.rows)) out.mc = {...l.mc, rows: l.mc.rows.map(r => (keep.has(String(r.code)) ? r : Object.fromEntries(MC_SLIM.filter(k => k in r).map(k => [k, r[k]])))), slim: {full: [...keep], keys: MC_SLIM, why}};
  return out;
}
export async function lensFrom(root, place, {made = new Date().toISOString(), view = null} = {}) { // view = {board, manifest, agenda} — 막 만든 판(저녁 기록이 쓰기 전 · 파일로 내리기 전)
  const P = LENS_PLACES[place]; if (!P) throw Error('판 없음: ' + place);
  const v = path.join(root, P.view);
  const [board, manifest, agenda, input, index] = await Promise.all([view?.board ?? readJson(path.join(v, 'board.json')), view?.manifest ?? readJson(path.join(v, 'manifest.json')), view ? view.agenda ?? null : maybe(path.join(v, 'agenda.json')), readJson(path.join(root, P.input)), maybe(path.join(root, P.index))]);
  let snap = null;
  if (place === 'kr') { // 판이 쓴 관측 묶음(같은 판 안에서 자료 버전이 섞이지 않게) — 없으면 가장 새 묶음
    const rec = manifest.market?.record;
    if (/^reports\/atlas11\/context\/[\w./-]+\.json$/.test(rec ?? '')) snap = await maybe(path.join(root, rec));
    if (!snap) { const l = await maybe(path.join(root, 'reports/atlas11/context/latest.json')); if (/^reports\/atlas11\/context\/[\w./-]+\.json$/.test(l?.file ?? '')) snap = await maybe(path.join(root, l.file)); }
  } else if (P.context) snap = await maybe(path.join(root, P.context));
  const cal = P.calendar ? await maybe(path.join(root, P.calendar)) : null;
  const sessions = [...new Set([...(input.calendar?.sessions ?? []), ...(cal?.sessions ?? [])])].sort();
  const evening = await readEvening(root, P.evening, manifest.universeSet?.id);
  const candPubs = P.cand ? await readEvening(root, P.cand, manifest.universeSet?.id) : [];
  const growPubs = P.cand ? await readEvening(root, `${P.cand}/${dirName(manifest.universeSet?.id)}`, 'cand-rules-5') : []; // 5판 규칙 폴더 발행본(첫 담는 날 2026-10-08 — 그날 첫 기록은 다른 규칙이라 따로 남음 · 담는 날 사이 판이 그 7곳을 그대로 보임) // 후보 발행본(저녁 기록에 후보가 없던 날 처음 낸 목록 — 같은 날 저녁 기록에 후보가 있으면 먼저 남은 쪽)
  const placeInfo = {closeAt: manifest.place?.closeAt ?? P.closeAt ?? null, flowsNone: manifest.place?.flowsNone ?? null};
  const sched = place === 'kr' ? await maybe(path.join(root, 'public/data/atlas11/schedule-events.json')) : null; // 확인된 일정표(공식 출처) — 미국 판은 일정 묶음(agenda)만
  const rotation = place === 'kr' ? await rotationOf(root, place, {board}).catch(() => null) : null; // 한국 판만 · 후보 4판은 업종 돈 흐름을 곁 정보로만 씀(고르는 셈은 회사 날마다 순매수 — lens.mjs candDaily)
  const lens = lensOf({place, board, manifest, agenda, assets: input.assets ?? [], snap, evening, events: sched?.events ?? [], candPubs, growPubs, rotation, index: index ? {symbol: index.symbol, name: index.name, rows: index.rows, source: index.seed?.source ?? null} : null, sessions, made, placeInfo});
  lens.sources = {board: `${P.view}/board.json`, prices: P.input, index: index ? P.index : null, context: place === 'kr' ? manifest.market?.record ?? null : P.context ?? null, evening: evening.length ? `${P.evening}/${dirName(manifest.universeSet?.id)}` : null, cand: candPubs.length ? `${P.cand}/${dirName(manifest.universeSet?.id)}` : null, calendar: P.calendar};
  // 몬테카를로(위험 · 범위 — 사장님 2026-10-10 「1예측한다 2a안」) · 소거 1판 — 셈이 멈춰도 판 읽기는 그대로(그 칸만 「없음」 · 까닭은 problems)
  try {
    const latest = await maybe(path.join(root, `public/data/atlas11/mc/${place}/latest.json`));
    const file = typeof latest?.file === 'string' && new RegExp(`^public/data/atlas11/mc/${place}/[\\w.-]+\\.json$`).test(latest.file) ? latest.file : null;
    const result = file ? await maybe(path.join(root, file)) : null;
    const inputSha = createHash('sha256').update(await fs.readFile(path.join(root, P.input))).digest('hex');
    lens.mc = mcFor({latest, result, asOf: lens.asOf, inputSha});
    if (latest && !file) lens.mc = {none: true, why: '가리키는 파일 이름이 이 판 결과 폴더 밖'};
  } catch (e) { lens.mc = {none: true, why: '셈 멈춤: ' + e.message}; lens.problems.push('몬테카를로: ' + e.message); }
  try { lens.elim = elimOf({place, asOf: lens.asOf, at: made, stocks: lens.stocks, cand: lens.cand, agendaByCode: agenda?.byCode ?? null, mc: lens.mc?.none ? null : lens.mc, calibrated: false}); }
  catch (e) { lens.elim = {none: true, why: '셈 멈춤: ' + e.message}; lens.problems.push('소거: ' + e.message); }
  const bad = checkLens(lens); if (bad.length) lens.problems.push(...bad.map(x => '검사: ' + x));
  return lens;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const place = process.argv[2] ?? 'kr', i = process.argv.indexOf('--out');
  const l = await lensFrom(process.cwd(), place);
  if (i > 0) await fs.writeFile(process.argv[i + 1], lensJson(l));
  console.log(JSON.stringify({place, boardId: l.boardId, asOf: l.asOf, bytes: JSON.stringify(l).length, problems: l.problems, when: {...l.when, lateList: l.when.lateList.length}, breadth: l.breadth, buckets: l.buckets, firstDue: l.verify.firstDue, done: l.verify.done}, null, 1));
}
