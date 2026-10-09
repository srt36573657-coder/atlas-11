/**
 * ATLAS 11 · 판 화면 묶음 만들기 — public/data/atlas11/view/ (예측 없음 · 2026-10-04 21:04 업종 36개 · 180곳 · 요즘 불장 업종 · 다음 불장 후보)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   node scripts/atlas11/build_view.mjs [--now ISO]
 *   읽는 것: public/data/input.json(지난 주가) · reports/atlas11/context/latest.json 이 가리키는 관측 묶음(수급·기사·공시·지수)
 *           · public/data/atlas11/market/KOSPI.json(코스피 종가 쌓아 두기 — 지도 탭 「지난 6개월 앞서 달린 곳」 · 2026-10-06 14:55 「해」 · 새로 붙은 날이 있으면 다시 씀)
 *           · public/data/atlas11/schedule-events.json(확인된 일정) · config/atlas11/universe.json(바뀔 묶음 미리 보기)
 *   쓰는 것(판 밖): 아래 탭 「기록」의 자료 변경 한 줄 — reports/atlas11/changelog/data-kr/(앞 기록과 견줘 종가 · 회사 · 모은 자료 · 들고 남이 바뀌었을 때만 · 2026-10-06 16:10 「기록 하는 탭」)
 *                  + 그 종가 날짜의 이슈 한 줄(같은 폴더 issue-kr-* · 날짜마다 한 번 · 그 날 종가가 90% 넘게 모였을 때 · 2026-10-06 18:37 「이슈칸」)
 *   지난 예측 묶음은 git 기록(1958247 까지)에 남아 있다 — 이 묶음은 그 파일들을 지우고 새로 쓴다(화면 묶음은 매일 다시 만드는 사본).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildBoard, universeNextOf, universeSetOf, boardAsOf} from '../../lib/atlas11/board.mjs';
import {mergeIndexRows} from '../../lib/atlas11/lead6.mjs';
import {eveningRecordOf} from '../../lib/atlas11/similar.mjs';
import {candRecordOf} from '../../lib/atlas11/cand.mjs'; // 매수 검토 후보를 저녁 기록에(2026-10-09 「ATLAS 제품 재설계 명령」 13 「선정 당시를 보존」)
import {lensFrom} from './lens/build.mjs';
import {loadUniverseConfig, loadNextInput, universeIdOf} from '../../lib/atlas11/universe-switch.mjs';
import {recordBoardChange, recordIssue} from '../../lib/atlas11/changelog.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };

/* 저녁 7시 기록(「들고 남」) — 2026-10-05 05:03 사장님 「매일 … 저녁 7시에 … 여러 주건들에 이동이 내영되게 하라」
   public/data/atlas11/evening/<묶음 id>/<종가 날짜>.json · 거래일 저녁 7시 실행(atlas11-evening)만 쓴다 · 한 번 쓰면 고치지 않음(이미 있으면 그대로 둠)
   묶음이 바뀌면 폴더가 달라 앞 묶음 기록과 견주지 않는다 */
export const EVENING_DIR = 'public/data/atlas11/evening';
export const dirName = id => String(id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_');
/** 그 종가 날짜의 저녁 7시(KST)가 지났나 — 16:00 판이 일찍 끝나도 기록은 저녁 7시 뒤에만 */
export const eveningReady = (asOf, now) => Boolean(asOf) && Date.parse(asOf + 'T19:00:00+09:00') <= Date.parse(now);
/** 지금 판의 저녁 기록 자리 → {asOf, universe, file, exists, ready} */
export async function eveningState(files, now) {
  const m = files.get('manifest.json'), b = files.get('board.json'), asOf = b?.asOf ?? null;
  const file = asOf ? path.join(EVENING_DIR, dirName(m.universeSet?.id), asOf + '.json') : null;
  let exists = false; if (file) try { await fs.access(path.join(root, file)); exists = true; } catch {}
  return {asOf, universe: m.universeSet?.id ?? null, file, exists, ready: eveningReady(asOf, now)};
}
export async function readEvening(universeId) {
  const dir = path.join(root, EVENING_DIR, dirName(universeId));
  let names = [];
  try { names = (await fs.readdir(dir)).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  return Promise.all(names.map(async n => JSON.parse(await fs.readFile(path.join(dir, n), 'utf8'))));
}

/* 코스피 종가 쌓아 두기 — 지도 탭 「지난 6개월 앞서 달린 곳」 상자의 지수 자리(2026-10-06 14:55 「해」 · lib/atlas11/lead6.mjs)
   쌓아 둔 줄 + 관측 묶음의 지수 원문 행(판 날짜까지 · 없는 날만) — 쌓아 둔 줄은 고치지 않는다 · 파일이 없거나 읽지 못하면 지수 자리만 빼고 판은 그대로 만든다
   이어 붙인 줄은 buildAndWriteView 가 파일에 다시 쓴다(날마다 16:00 실행이 public/data/ 를 기록에 남김) */
export const MARKET_FILE = 'public/data/atlas11/market/KOSPI.json';
export async function marketHistory({input, snap, now}) {
  let stored = null; try { stored = await read(MARKET_FILE, null); } catch (e) { console.warn('market history: ' + e.message); return null; }
  if (!Array.isArray(stored?.rows) || !stored.rows.length) return null;
  const live = (snap?.index ?? []).find(i => i.symbol === stored.symbol)?.rows ?? [];
  const merged = mergeIndexRows(stored.rows, live, {upTo: boardAsOf(input, now)});
  if (merged.mismatch.length) console.warn('market history mismatch (stored kept): ' + JSON.stringify(merged.mismatch.slice(0, 5)));
  return {stored, ...merged};
}

/** 화면 묶음을 메모리에서만 만든다(파일에 쓰지 않음) */
export async function buildViewFiles({now = new Date().toISOString()} = {}) {
  const [input, calendar, contextLatest, schedule] = await Promise.all([read('public/data/input.json'), read('public/data/rolling-calendar.json', null), read('reports/atlas11/context/latest.json', null), read('public/data/atlas11/schedule-events.json', null)]);
  const evening = await readEvening(universeSetOf(input).id);
  const snap = contextLatest?.file ? await read(contextLatest.file, null) : null;
  // 바뀔 묶음 미리 보기 — 설정에 next 가 있고 아직 안 바꿨을 때만 · 새 입력은 매일 실행기와 같은 방법(작업본 또는 해시 확인한 제안 파일)으로 읽는다
  //   읽지 못하면 미리 보기만 빼고 화면은 그대로 만든다(바꾸기는 매일 실행기가 따로 판단)
  let universeNext = null;
  const uniConfig = await loadUniverseConfig(root);
  if (uniConfig?.next?.id && universeIdOf(input) !== uniConfig.next.id) {
    try { universeNext = universeNextOf({config: uniConfig, nextInput: (await loadNextInput(root, uniConfig.next)).input, input, sessions: calendar?.sessions ?? input.calendar?.sessions ?? [], now}); }
    catch (e) { console.warn('universe next preview: ' + e.message); }
  }
  const mh = await marketHistory({input, snap, now});
  const indexHistory = mh ? {symbol: mh.stored.symbol, name: mh.stored.name, rows: mh.rows, source: {file: MARKET_FILE, seed: mh.stored.seed?.source ?? null, live: (snap?.index ?? []).find(i => i.symbol === mh.stored.symbol)?.sourceUrl ?? null}} : null;
  return buildBoard({input, snap, contextFile: contextLatest?.file ?? null, events: schedule?.events ?? [], eventsSource: '확인된 일정표(public/data/atlas11/schedule-events.json · 일정마다 공식 출처 주소)', universeNext, evening, indexHistory, now});
}

/** 이어 붙인 지수 줄을 쌓아 두는 파일에 다시 쓴다 — 새로 붙은 날이 있을 때만 · 쌓아 둔 줄은 그대로(mergeIndexRows 가 고치지 않음) */
export async function writeMarketHistory({now = new Date().toISOString()} = {}) {
  const [input, contextLatest] = await Promise.all([read('public/data/input.json'), read('reports/atlas11/context/latest.json', null)]);
  const snap = contextLatest?.file ? await read(contextLatest.file, null) : null;
  const mh = await marketHistory({input, snap, now});
  if (!mh?.added.length) return {file: MARKET_FILE, added: [], mismatch: mh?.mismatch ?? []};
  await fs.writeFile(path.join(root, MARKET_FILE), JSON.stringify({...mh.stored, rows: mh.rows, appended: [...(mh.stored.appended ?? []), {at: now, dates: mh.added}]}, null, 0));
  return {file: MARKET_FILE, added: mh.added, mismatch: mh.mismatch};
}

/** 그날 판을 저녁 기록으로 남긴다 — 그 종가 날짜의 저녁 7시가 지났을 때만 · 이미 있으면 남기지 않음('wx' 로 새로 만들 때만) → {file, wrote, reason} */
export async function writeEvening(files, {now, run = 'evening'}) {
  const st = await eveningState(files, now), b = files.get('board.json');
  if (!st.asOf) return {file: null, wrote: false, reason: '종가 날짜 없음'};
  if (!st.ready) return {file: st.file, wrote: false, reason: `${st.asOf} 저녁 7시 전`};
  await fs.mkdir(path.dirname(path.join(root, st.file)), {recursive: true});
  let cand = null; // 막 만든 판으로 후보를 셈(판 읽기와 같은 셈) — 못 세도 저녁 기록은 그대로 남김(까닭은 실행 기록에)
  try { const l = await lensFrom(root, 'kr', {made: now, view: {board: b, manifest: files.get('manifest.json'), agenda: files.get('agenda.json')}}); if (l.cand?.ready) cand = {items: candRecordOf(l.cand), rules: l.cand.rules, pool: l.cand.pool, mc: l.cand.mc ? {draws: l.cand.mc.draws, seed: l.cand.mc.seed, days: l.cand.mc.days, base: l.cand.mc.base, sectors: l.cand.mc.sectors, out: l.cand.mc.out, seeds: l.cand.mc.seeds} : null}; } catch (e) { console.warn('cand for evening: ' + e.message); }
  try { await fs.writeFile(path.join(root, st.file), JSON.stringify(eveningRecordOf(b, {universe: st.universe, recordedAt: now, run, cand}), null, 1), {flag: 'wx'}); return {file: st.file, wrote: true, cand: cand?.items.length ?? null}; }
  catch (e) { if (e.code === 'EEXIST') return {file: st.file, wrote: false, reason: '이미 있음'}; throw e; }
}

export async function buildAndWriteView({now = new Date().toISOString(), record = null} = {}) {
  let files = await buildViewFiles({now}), evening = null;
  // 저녁 기록을 남긴 뒤 다시 만든다 — 방금 남긴 기록까지 넣어 들고 남을 센다
  if (record) { evening = await writeEvening(files, {now, run: record}); if (evening.wrote) files = await buildViewFiles({now}); }
  const dir = path.join(root, 'public/data/atlas11/view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  let market = null; try { market = await writeMarketHistory({now}); } catch (e) { console.warn('market history write: ' + e.message); } // 판은 이미 다 썼다 — 여기서 못 써도 판은 그대로
  const manifest = files.get('manifest.json');
  const b = files.get('board.json');
  // 아래 탭 「기록」 — 자료가 바뀌었으면 한 줄(한 파일 · 고치지 않음) · 못 써도 판은 그대로(이유는 실행 기록에)
  let changelog = null; try { changelog = await recordBoardChange(root, b, {place: 'kr', made: manifest.generatedAt ?? now}); } catch (e) { console.warn('changelog write: ' + e.message); changelog = {wrote: false, reason: e.message}; }
  // 아래 탭 「기록」의 이슈 — 그 종가 날짜에 처음 다 모인 판으로 한 줄(지수 · 오른/내린 곳 · 업종 · 기사 · 공시 · 2026-10-06 18:37 「이슈칸」) · 못 써도 판은 그대로
  let issue = null; try { const cl = await read('reports/atlas11/context/latest.json', null); issue = await recordIssue(root, b, manifest, cl?.file ? await read(cl.file, null) : null, {place: 'kr', made: manifest.generatedAt ?? now}); } catch (e) { console.warn('issue write: ' + e.message); issue = {wrote: false, reason: e.message}; }
  return {boardId: manifest.boardId, asOf: manifest.asOf, companies: manifest.companies, files: files.size, dir: path.relative(root, dir), universeNext: manifest.universeNext?.id ?? null, bytes: [...files.values()].reduce((s, v) => s + Buffer.byteLength(JSON.stringify(v)), 0),
    similar: b.similar?.items?.map(x => x.name) ?? [], moves: b.moves ? (b.moves.first ? `처음 기록 ${b.moves.to}` : `${b.moves.from} → ${b.moves.to}`) : null, evening,
    lead6: b.lead6 ? {groups: b.lead6.lead.groups, companies: b.lead6.lead.companies, both: b.lead6.lead.both, index: b.lead6.index ? `${b.lead6.index.name} ${b.lead6.index.date} ${(b.lead6.index.gap * 100).toFixed(1)}%` : b.lead6.indexMissing} : null, market, changelog, issue};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  // --record evening : 거래일 저녁 7시 실행(atlas11-evening) · --record first : 손으로 남기는 첫 기록
  const record = arg('--record');
  if (record && !['evening', 'first'].includes(record)) throw Error('--record 는 evening 또는 first');
  console.log(JSON.stringify(await buildAndWriteView({now: arg('--now') ?? new Date().toISOString(), record})));
}
