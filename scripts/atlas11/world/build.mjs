/**
 * ATLAS 중국 · 일본 · 베트남 판 · 화면 묶음 만들기 — public/data/atlas11/<시장>/view/ (예측 없음)
 *   사장님 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
 *   한국 · 미국 판과 같은 셈(lib/atlas11/board.mjs buildBoard)을 그대로 쓴다 · 입력만 그 시장 것 · 판 목록(manifest)에 place(그 나라 돈 · 마감 시각 · 수급 없음)와 지수 띠
 *   일정: 이 세 시장의 일정표는 아직 없어 싣지 않는다(빈 일정 · 화면에 그렇게 적힘)
 *   node scripts/atlas11/world/build.mjs --market cn|jp|vn [--now ISO]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildBoard} from '../../../lib/atlas11/board.mjs';
import {worldOf, worldPlace, worldMarketOf} from '../../../lib/atlas11/world/markets.mjs';
import {recordBoardChange, recordIssue} from '../../../lib/atlas11/changelog.mjs';
import {EN_PREDICTION} from '../us/build.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
export const dataDir = id => `public/data/atlas11/${id}`;

export async function buildWorldFiles(market, {root = process.cwd(), now = new Date().toISOString()} = {}) {
  const M = worldOf(market), DATA = dataDir(M.id);
  const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
  const [input, ctx] = await Promise.all([read(DATA + '/input.json'), read(DATA + '/context.json', null)]);
  if (input?.place !== M.id || !Array.isArray(input.assets) || !input.assets.length) throw Error(`${M.id.toUpperCase()}_INPUT — ${M.label} 판 입력이 아님`);
  const news = (ctx?.news ?? []).map(n => ({...n, items: (n.items ?? []).filter(i => !EN_PREDICTION.test(i.title ?? ''))}));
  const snap = ctx ? {day: ctx.day, fetchedAt: ctx.fetchedAt, news, index: ctx.index ?? []} : null;
  const files = buildBoard({input, snap, contextFile: ctx ? DATA + '/context.json' : null, events: [], eventsSource: `${M.label} 시장 일정표는 아직 싣지 않음`, indexHistory: null, now});
  Object.defineProperty(files, 'snap', {value: snap, enumerable: false});
  const m = files.get('manifest.json');
  m.place = worldPlace(M, input.sources ?? {});
  m.market = worldMarketOf(M, snap, ctx ? DATA + '/context.json' : null);
  m.sources = input.sources ?? null;
  return files;
}

/** 다른 곳에 다 쓴 뒤 바꿔 끼운다(view.next → view) */
export async function writeWorldView(market, files, {root = process.cwd()} = {}) {
  const dir = path.join(root, dataDir(worldOf(market).id), 'view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  const m = files.get('manifest.json'), b = files.get('board.json');
  return {market, boardId: m.boardId, asOf: m.asOf, companies: m.companies, groups: b.groups.length, hot: b.hot.items.map(x => x.label), late: m.late.length, market: m.market?.items?.map(i => `${i.name} ${i.date}`) ?? []};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const market = arg('--market'), now = arg('--now') ?? new Date().toISOString(), files = await buildWorldFiles(market, {now});
  const out = await writeWorldView(market, files);
  let changelog = null; try { changelog = await recordBoardChange(process.cwd(), files.get('board.json'), {place: market, made: files.get('manifest.json')?.generatedAt ?? now}); } catch (e) { console.warn(`${market} changelog write: ` + e.message); changelog = {wrote: false, error: e.message}; }
  let issue = null; try { issue = await recordIssue(process.cwd(), files.get('board.json'), files.get('manifest.json'), files.snap, {place: market, made: files.get('manifest.json')?.generatedAt ?? now}); } catch (e) { console.warn(`${market} issue write: ` + e.message); issue = {wrote: false, error: e.message}; }
  console.log(JSON.stringify({...out, changelog, issue}));
}
