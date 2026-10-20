#!/usr/bin/env node
// 새 화면(/next/) 작은 자료 만들기 — 올릴 때 한 번(사장님 2026-10-18 [9] 7 「첫 화면용 작은 요약 파일(몇 KB)을 만들고 …」 · [5] 9 한 달 뒤 가운데 값)
//   부르는 것: build/home_summary.mjs(첫 화면 요약 · 8KB 아래) · build/median20.mjs(매매일지 · 모든 회사 한 달 가운데 값) · essenceFacts(아래 · 첫 화면 본질 세 줄) · build/theme.mjs(테마 시계 · theme.json · theme-more.json)
//   읽음: <site>/atlas/data/*.json · co/*.json · 저장소 업데이트 기록 reports/atlas11/t365/updates/*.json — 쓰는 곳: <site>/next/data/{home-summary,median20}.json(사이트 자료는 바꾸지 않음)
//   쓰는 법: node scripts/atlas11/next/build_data.mjs [--site site|dist] [--verify]
//            import {buildData} from './next/build_data.mjs'; await buildData({siteDir: dist})   ← package.mjs 가 rollAtlas 뒤에 부름(dist 의 굴린 자료로 셈 · 업데이트 기록은 rollAtlas 가 막 적은 것까지)
//   하나가 못 만들면 그 파일은 그대로 두고 나머지는 만듦 · 첫 화면은 요약이 없거나 옛것(src.home ≠ home.json kst)이면 home.json 으로 그림(빈 첫 화면 없음)
//
// 첫 화면 본질 세 줄(사장님 2026-10-18(싱가포르) 16:39 [5] 3 「n과 받은 때는 자료에서 셈하라. 손으로 박지 마라.」 · [5] 4 「「하루 4번 새로 받아요」 글은 지난 7일 업데이트 기록으로 세어
//   맞을 때만 둬라.」 · 일꾼 KC) — 요약 파일에 더하는 칸(화면 · 본질 문이 읽음 · 셈 글은 site/next/essence.js 머리말):
//   coN       = <site>/atlas/data/mkt.json 회사 수(essence.js coCount)
//   fetchedAt = 이 자료를 만든 업데이트 기록의 받은 때(ISO · UTC) — 「받은 기록」(아래 received) 가운데 at 이 <site>/atlas/data/home.json 의 made 와 같은 것
//               (회차는 home_build 에 --now 로 같은 때를 넘김 · 지금 사이트 자료를 그대로 받아 올린 회차면 그 자료를 만든 앞 회차가 맞음) · 못 찾으면 null(화면 「?」 —
//               저장소 자료로 묶은 이 기계 · 깃허브 검사 묶음처럼 일봉을 새로 받지 않은 자료)
//   fetchFile = 그 기록 파일(저장소 경로) · 못 찾으면 null
//   updates7  = [{day, n, slots}] 서울 날짜로 오늘 앞 7일(오늘은 아직 덜 끝나 뺌) · n = 그날 받은 기록 수 · slots = 그 가운데 정해진 업데이트(기록의 slot 이름이 있는 것)
//   fourADay  = 7일 가운데 평일(월 ~ 금)마다 n = 4 이고 slots = 4 일 때만 true(평일이 하나도 없으면 false) — 화면은 이것이 true 일 때만 「하루 4번」
//   받은 기록 = served 'rolled'(새로 굴린 자료를 올림) · fetch.ok > 0(네이버 일봉을 받음) · result 가 「실패」 아님 — 손 올림(stored · 받지 않음) · 지금 사이트 자료를 다시 올린 것(live)은 셈 밖
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build as homeSummary} from './build/home_summary.mjs';
import {build as median20} from './build/median20.mjs';
import {build as themeBuild} from './build/theme.mjs'; // 테마 시계(사장님 2026-10-19 16:54 · 결정표 docs/design/theme-2026-10-19/theme-engine.md) — 못 만들면 옛 파일을 지움(지난 판 자리를 오늘 것처럼 보이지 않게)
import {coCount} from '../../../site/next/essence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const UPDATES_DIR = 'reports/atlas11/t365/updates';
/** 받은 기록 — 위 머리말 */
export const received = r => r?.served === 'rolled' && (r.fetch?.ok ?? 0) > 0 && r.result !== '실패' && typeof r.at === 'string' && Number.isFinite(Date.parse(r.at));
const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
/** 지난 7일(서울 · 오늘 뺌) 날마다 받은 기록 수 · 하루 4번이 맞나 */
export function updates7(recs, now = new Date()) {
  const [y, m, d] = seoulDay(+now).split('-').map(Number);
  const days = Array.from({length: 7}, (_, k) => new Date(Date.UTC(y, m - 1, d - 7 + k)).toISOString().slice(0, 10));
  const got = recs.filter(received), rows = days.map(day => { const rs = got.filter(r => seoulDay(Date.parse(r.at)) === day); return {day, n: rs.length, slots: rs.filter(r => r.slot != null).length}; });
  const wk = rows.filter(r => { const w = new Date(r.day + 'T00:00:00Z').getUTCDay(); return w >= 1 && w <= 5; });
  return {updates7: rows, fourADay: wk.length > 0 && wk.every(r => r.n === 4 && r.slots === 4)};
}
/** 이 자료를 만든 받은 기록(위 머리말) — 없으면 null */
export function fetchedRecord(recs, home, core = null) {
  if (!home?.made) return null;
  return [...recs].reverse().find(r => received(r) && r.at === home.made && (core?.asOf == null || r.asOf == null || r.asOf === core.asOf)) ?? null;
}
/** 본질 세 줄 자료를 요약 파일에 더함 — 요약 파일이 먼저 있어야 함(homeSummary) */
export function essenceFacts({siteDir = 'site', root = ROOT, now = new Date()} = {}) {
  const J = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
  const dd = path.join(siteDir, 'atlas', 'data'), M = J(path.join(dd, 'mkt.json')), H = J(path.join(dd, 'home.json')), C = J(path.join(dd, 'core.json'));
  // 기록은 지난 31일(파일 이름 = 받은 때 UTC)만 읽음 — 기록이 늘어도 빠르게
  const dir = path.join(root, UPDATES_DIR), from = new Date(+now - 31 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f) && f.slice(0, 8) >= from).sort() : [];
  const recs = names.map(f => { const r = J(path.join(dir, f)); return r && {...r, file: f}; }).filter(Boolean);
  const R = fetchedRecord(recs, H, C), u = updates7(recs, now);
  const file = path.join(siteDir, 'next', 'data', 'home-summary.json'), S = J(file);
  if (!S) throw Error('요약 파일이 없음 ' + file);
  Object.assign(S, {coN: coCount(M), fetchedAt: R?.at ?? null, fetchFile: R ? UPDATES_DIR + '/' + R.file : null, updates7: u.updates7, fourADay: u.fourADay});
  const body = JSON.stringify(S), bytes = Buffer.byteLength(body) + 1;
  if (bytes > 8192) throw Error('본질 세 줄 칸을 더하니 요약이 8KB 넘음 ' + bytes);
  fs.writeFileSync(file, body + '\n');
  return {coN: S.coN, fetchedAt: S.fetchedAt, fetchFile: S.fetchFile, updates7: u.updates7, fourADay: u.fourADay, records: recs.length, bytes};
}

export async function buildData({siteDir = 'site', verify = false, log = console.log} = {}) {
  const out = {};
  try {
    const r = homeSummary({siteDir, verify}); out.homeSummary = r;
    log(`첫 화면 요약 ${r.bytes}바이트 · 급등 칸 ${r.n}곳 중 반값 아래 ${r.half}곳(값 있는 ${r.known}곳)` + (verify ? ` · 따로 셈 다름 ${r.diff}` : ''));
    if (r.bytes > 8192) throw Error('첫 화면 요약이 8KB 넘음 ' + r.bytes);
    if (verify && r.diff) throw Error('반값 셈 다름 ' + r.diff);
  } catch (e) { out.homeSummaryError = e.message; log('첫 화면 요약 못 만듦 — ' + e.message); }
  if (out.homeSummary) { // 이번에 새로 쓴 요약에만 더함(옛 요약에 새 받은 때를 붙이지 않게)
    try {
      const r = essenceFacts({siteDir}); out.essence = r;
      log(`본질 세 줄 — 회사 ${r.coN ?? '?'}곳 · 받은 때 ${r.fetchedAt ?? '?'}(${r.fetchFile ?? '이 자료를 만든 받은 기록 없음'}) · 지난 7일 받은 수 ${r.updates7.map(x => `${x.day.slice(5)} ${x.n}(정해진 ${x.slots})`).join(' · ')} · 하루 4번 ${r.fourADay ? '맞음' : '아님'} · ${r.bytes}바이트`);
    } catch (e) { out.essenceError = e.message; log('본질 세 줄 자료 못 만듦 — ' + e.message); }
  }
  try { const r = await median20({siteDir}); out.median20 = r; log('한 달 가운데 값 ' + (typeof r === 'string' ? r : JSON.stringify(r))); }
  catch (e) { out.median20Error = e.message; log('한 달 가운데 값 못 만듦 — ' + e.message); }
  try { const r = await themeBuild({siteDir}); out.theme = r; log('테마 시계 ' + r); }
  catch (e) {
    out.themeError = e.message; log('테마 시계 못 만듦 — ' + e.message);
    for (const f of ['theme.json', 'theme-more.json', 'theme-home.json', 'theme-co.json']) fs.rmSync(path.join(siteDir, 'next', 'data', f), {force: true}); // 화면은 파일이 없으면 「?」 한 줄
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), si = a.indexOf('--site');
  const r = await buildData({siteDir: si >= 0 ? a[si + 1] : 'site', verify: a.includes('--verify')});
  if (r.homeSummaryError || r.median20Error || r.essenceError || r.themeError) process.exit(1);
}
