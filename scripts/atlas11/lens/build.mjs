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
import {lensOf, checkLens, lensJson} from '../../../lib/atlas11/lens.mjs';

const readJson = async f => JSON.parse(await fs.readFile(f, 'utf8'));
const maybe = async f => { try { return await readJson(f); } catch { return null; } };
const dirName = id => String(id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_');
export const LENS_PLACES = {
  kr: {view: 'public/data/atlas11/view', input: 'public/data/input.json', index: 'public/data/atlas11/market/KOSPI.json', evening: 'public/data/atlas11/evening', calendar: 'public/data/rolling-calendar.json', closeAt: '15:30 KST'},
  us: {view: 'public/data/atlas11/us/view', input: 'public/data/atlas11/us/input.json', index: 'public/data/atlas11/us/market/INX.json', evening: 'public/data/atlas11/us/evening', calendar: null, context: 'public/data/atlas11/us/context.json'},
};
async function readEvening(root, dir, universe) {
  const d = path.join(root, dir, dirName(universe)); let names = [];
  try { names = (await fs.readdir(d)).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort(); } catch { return []; }
  return (await Promise.all(names.map(n => maybe(path.join(d, n))))).filter(Boolean);
}
export async function lensFrom(root, place, {made = new Date().toISOString()} = {}) {
  const P = LENS_PLACES[place]; if (!P) throw Error('판 없음: ' + place);
  const v = path.join(root, P.view);
  const [board, manifest, agenda, input, index] = await Promise.all([readJson(path.join(v, 'board.json')), readJson(path.join(v, 'manifest.json')), maybe(path.join(v, 'agenda.json')), readJson(path.join(root, P.input)), maybe(path.join(root, P.index))]);
  let snap = null;
  if (place === 'kr') { // 판이 쓴 관측 묶음(같은 판 안에서 자료 버전이 섞이지 않게) — 없으면 가장 새 묶음
    const rec = manifest.market?.record;
    if (/^reports\/atlas11\/context\/[\w./-]+\.json$/.test(rec ?? '')) snap = await maybe(path.join(root, rec));
    if (!snap) { const l = await maybe(path.join(root, 'reports/atlas11/context/latest.json')); if (/^reports\/atlas11\/context\/[\w./-]+\.json$/.test(l?.file ?? '')) snap = await maybe(path.join(root, l.file)); }
  } else if (P.context) snap = await maybe(path.join(root, P.context));
  const cal = P.calendar ? await maybe(path.join(root, P.calendar)) : null;
  const sessions = [...new Set([...(input.calendar?.sessions ?? []), ...(cal?.sessions ?? [])])].sort();
  const evening = await readEvening(root, P.evening, manifest.universeSet?.id);
  const placeInfo = {closeAt: manifest.place?.closeAt ?? P.closeAt ?? null, flowsNone: manifest.place?.flowsNone ?? null};
  const sched = place === 'kr' ? await maybe(path.join(root, 'public/data/atlas11/schedule-events.json')) : null; // 확인된 일정표(공식 출처) — 미국 판은 일정 묶음(agenda)만
  const lens = lensOf({place, board, manifest, agenda, assets: input.assets ?? [], snap, evening, events: sched?.events ?? [], index: index ? {symbol: index.symbol, name: index.name, rows: index.rows, source: index.seed?.source ?? null} : null, sessions, made, placeInfo});
  lens.sources = {board: `${P.view}/board.json`, prices: P.input, index: index ? P.index : null, context: place === 'kr' ? manifest.market?.record ?? null : P.context ?? null, evening: evening.length ? `${P.evening}/${dirName(manifest.universeSet?.id)}` : null, calendar: P.calendar};
  const bad = checkLens(lens); if (bad.length) lens.problems.push(...bad.map(x => '검사: ' + x));
  return lens;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const place = process.argv[2] ?? 'kr', i = process.argv.indexOf('--out');
  const l = await lensFrom(process.cwd(), place);
  if (i > 0) await fs.writeFile(process.argv[i + 1], lensJson(l));
  console.log(JSON.stringify({place, boardId: l.boardId, asOf: l.asOf, bytes: JSON.stringify(l).length, problems: l.problems, when: {...l.when, lateList: l.when.lateList.length}, breadth: l.breadth, buckets: l.buckets, firstDue: l.verify.firstDue, done: l.verify.done}, null, 1));
}
