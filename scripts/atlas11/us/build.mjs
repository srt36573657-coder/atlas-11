/**
 * ATLAS 미국 판 · 화면 묶음 만들기 — public/data/atlas11/us/view/ (예측 없음)
 *   2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   한국 판과 같은 셈(lib/atlas11/board.mjs buildBoard — 업종 · 불장 11 · 오름 상위 22 · 예비 7 · 출목표 · 검사)을 그대로 쓴다 · 입력만 미국 것
 *     public/data/atlas11/us/input.json(365곳 지난 종가 · 고른 규칙) · public/data/atlas11/us/context.json(기사 · 지수 — 없어도 됨)
 *     · public/data/atlas11/schedule-events.json 가운데 미국 시장 일정(연준 금리 · 물가 · 고용 — lib/atlas11/us/place.mjs US_EVENT_KINDS)
 *   판 목록(manifest)에 place(달러 · 뉴욕 16:00 · 수급 없음)와 미국 지수 띠를 넣는다 — 화면 코드는 한국 판과 같음
 *   한국 판 파일은 읽지도 쓰지도 않는다(일정표만 읽음)
 *   node scripts/atlas11/us/build.mjs [--now ISO]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildBoard} from '../../../lib/atlas11/board.mjs';
import {usPlace, usMarketOf, US_EVENT_KINDS} from '../../../lib/atlas11/us/place.mjs';

export const US_DATA = 'public/data/atlas11/us';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };

/** 영어 기사 제목이 섞여 오면 앞날 말을 영어로도 거른다(한국말 거르기는 buildBoard 가 함) */
export const EN_PREDICTION = /\b(forecasts?|predicts?|predictions?|outlook|price targets?|target price|expected to|expects?|could (rise|fall|soar|plunge)|upgrades?|downgrades?|buy rating|sell rating|overweight|underweight)\b/i;

export async function buildUsFiles({root = process.cwd(), now = new Date().toISOString()} = {}) {
  const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
  const [input, ctx, schedule] = await Promise.all([read(US_DATA + '/input.json'), read(US_DATA + '/context.json', null), read('public/data/atlas11/schedule-events.json', null)]);
  if (input?.place !== 'us' || !Array.isArray(input.assets) || !input.assets.length) throw Error('US_INPUT — 미국 판 입력이 아님');
  const news = (ctx?.news ?? []).map(n => ({...n, items: (n.items ?? []).filter(i => !EN_PREDICTION.test(i.title ?? ''))}));
  const snap = ctx ? {day: ctx.day, fetchedAt: ctx.fetchedAt, news, index: ctx.index ?? []} : null;
  const events = (schedule?.events ?? []).filter(e => e.scope?.type === 'market' && US_EVENT_KINDS.includes(e.kind));
  const files = buildBoard({input, snap, contextFile: ctx ? US_DATA + '/context.json' : null, events, eventsSource: '확인된 일정표(미국 연준 금리 · 물가 · 고용 발표 · 일정마다 공식 출처 주소)', now});
  const m = files.get('manifest.json');
  m.place = usPlace(input.sources ?? {});
  m.market = usMarketOf(snap, ctx ? US_DATA + '/context.json' : null);
  m.sources = input.sources ?? null;
  return files;
}

/** 다른 곳에 다 쓴 뒤 바꿔 끼운다(view.next → view) — 반쯤 쓴 묶음을 화면이 읽지 않게 */
export async function writeUsView(files, {root = process.cwd()} = {}) {
  const dir = path.join(root, US_DATA, 'view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  const m = files.get('manifest.json'), b = files.get('board.json');
  return {boardId: m.boardId, asOf: m.asOf, companies: m.companies, groups: b.groups.length, hot: b.hot.items.map(x => x.label), next: b.next.items.length, similar: b.similar?.items?.length ?? 0, late: m.late.length, market: m.market?.items?.map(i => `${i.name} ${i.close}`) ?? null, dir: path.relative(root, dir)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const files = await buildUsFiles({now: arg('--now') ?? new Date().toISOString()});
  console.log(JSON.stringify(await writeUsView(files)));
}
