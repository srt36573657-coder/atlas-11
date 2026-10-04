/**
 * ATLAS 11 · 판 화면 묶음 만들기 — public/data/atlas11/view/ (예측 없음 · 2026-10-04 21:04 업종 36개 · 180곳 · 요즘 불장 업종 · 다음 불장 후보)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   node scripts/atlas11/build_view.mjs [--now ISO]
 *   읽는 것: public/data/input.json(지난 주가) · reports/atlas11/context/latest.json 이 가리키는 관측 묶음(수급·기사·공시·지수)
 *           · public/data/atlas11/schedule-events.json(확인된 일정) · config/atlas11/universe.json(바뀔 묶음 미리 보기)
 *   지난 예측 묶음은 git 기록(1958247 까지)에 남아 있다 — 이 묶음은 그 파일들을 지우고 새로 쓴다(화면 묶음은 매일 다시 만드는 사본).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildBoard, universeNextOf, universeSetOf} from '../../lib/atlas11/board.mjs';
import {eveningRecordOf} from '../../lib/atlas11/similar.mjs';
import {loadUniverseConfig, loadNextInput, universeIdOf} from '../../lib/atlas11/universe-switch.mjs';

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
  return buildBoard({input, snap, contextFile: contextLatest?.file ?? null, events: schedule?.events ?? [], eventsSource: '확인된 일정표(public/data/atlas11/schedule-events.json · 일정마다 공식 출처 주소)', universeNext, evening, now});
}

/** 그날 판을 저녁 기록으로 남긴다 — 그 종가 날짜의 저녁 7시가 지났을 때만 · 이미 있으면 남기지 않음('wx' 로 새로 만들 때만) → {file, wrote, reason} */
export async function writeEvening(files, {now, run = 'evening'}) {
  const st = await eveningState(files, now), b = files.get('board.json');
  if (!st.asOf) return {file: null, wrote: false, reason: '종가 날짜 없음'};
  if (!st.ready) return {file: st.file, wrote: false, reason: `${st.asOf} 저녁 7시 전`};
  await fs.mkdir(path.dirname(path.join(root, st.file)), {recursive: true});
  try { await fs.writeFile(path.join(root, st.file), JSON.stringify(eveningRecordOf(b, {universe: st.universe, recordedAt: now, run}), null, 1), {flag: 'wx'}); return {file: st.file, wrote: true}; }
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
  const manifest = files.get('manifest.json');
  const b = files.get('board.json');
  return {boardId: manifest.boardId, asOf: manifest.asOf, companies: manifest.companies, files: files.size, dir: path.relative(root, dir), universeNext: manifest.universeNext?.id ?? null, bytes: [...files.values()].reduce((s, v) => s + Buffer.byteLength(JSON.stringify(v)), 0),
    similar: b.similar?.items?.map(x => x.name) ?? [], moves: b.moves ? (b.moves.first ? `처음 기록 ${b.moves.to}` : `${b.moves.from} → ${b.moves.to}`) : null, evening};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  // --record evening : 거래일 저녁 7시 실행(atlas11-evening) · --record first : 손으로 남기는 첫 기록
  const record = arg('--record');
  if (record && !['evening', 'first'].includes(record)) throw Error('--record 는 evening 또는 first');
  console.log(JSON.stringify(await buildAndWriteView({now: arg('--now') ?? new Date().toISOString(), record})));
}
