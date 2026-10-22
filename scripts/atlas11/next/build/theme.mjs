#!/usr/bin/env node
// 테마 시계 자료 — 올릴 때 한 번(사장님 2026-10-19(싱가포르) 16:54 「이제 aaa7377.com에 올려 … 더 스마트한 내부 시스템을 만들어서 올려」)
//   셈 = site/next/theme-engine.js computeTheme(결정표 docs/design/theme-2026-10-19/theme-engine.md) — 이 파일은 파일 읽기 · 쓰기만
//   읽음: <site>/atlas/data/days.json · co/*.json(close · k0) · mkt.json(이름 · 업종) · core.json(업종 무리) · cond.json(업종 안 몸값 차례)
//   씀:   <site>/next/data/theme.json(목록 · 업종 쪽 — 모든 업종 자리 · 점 넷 · 성적표) · theme-more.json(업종 쪽 회사 줄 — 큰 회사 셋 · 함께 움직인 8곳) · theme-home.json(첫 화면 칸만 · 4KB 남짓)
//         · theme-co.json(회사 한 곳의 자리 — 결정표 9 · v1.3 · 2026-10-20 「맞아 정말 맞아」 박승혁 님 생각 · 회사 화면 탭 아래 한 줄)
//   사이트 자료는 바꾸지 않음 · 못 만들면 던짐(build_data.mjs 가 받아 적고 나머지는 만듦 — 화면은 파일이 없으면 「?」 한 줄)
//   쓰는 법: node scripts/atlas11/next/build/theme.mjs [--site site]   ·   import {build} from './theme.mjs'; await build({siteDir})
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {computeTheme} from '../../../../site/next/theme-engine.js';

const J = async f => JSON.parse(await fs.readFile(f, 'utf8'));
/** 첫 화면 칸 자료 — 시계 점(이름 · 자리 · x · y)과 싹 앞 셋의 꼬리 · 점 넷 · 며칠째 · 세 칸 수 · 성적표만(theme.json 의 같은 값 그대로) */
export function homeOf(theme) {
  const top = theme.order.S.slice(0, 3);
  return {schema: 'dori-theme-1-home', made: theme.made, asOf: theme.asOf, provisional: theme.provisional, recFrom: theme.recFrom, recTo: theme.recTo, count: theme.count, order: {S: top}, record: theme.record,
    inds: theme.inds.map(i => (top.includes(i.n) ? {n: i.n, g: i.g, z: i.z, x: i.x, y: i.y, d: i.d, t: i.t, dots: i.dots, sc: i.sc} : {n: i.n, g: i.g, z: i.z, x: i.x, y: i.y}))}; // g = 큰 업종 무리(시계 행성 사진 — 2026-10-20 22:17)
}
/* 싹 달력 지킨 기록(사장님 2026-10-22 11:55 「제시만 해가지고 기록이 없으면 그건 하수야」) — 그날 장 마감 때 처음 셈한 세 곳을 날마다 한 줄 남김 · 한 번 적은 날은 바꾸지 않음
   올리기 작업(atlas11-site.yml · package.mjs keepCal)만 씀 → 그 작업이 reports/ 를 저장소에 넣음 · 장중 값(provisional)인 마지막 날은 아직 안 적음 · 검사 · 시험 · 손 셈은 읽기만 */
export const KEPT_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../reports/atlas11/theme-cal/kept.json');
export const KEEP_FROM = '2026-10-22';
const KEPT_SCHEMA = 'dori-theme-cal-kept-1';
async function readKept(f) { try { const k = JSON.parse(await fs.readFile(f, 'utf8')); return k?.schema === KEPT_SCHEMA && k.days && typeof k.days === 'object' ? k.days : {}; } catch { return {}; } }
/** 새로 적을 날 — KEEP_FROM 뒤 · 아직 안 적은 날 · 장 마감 값인 날(마지막 날이 장중이면 뺌) */
export function keepNew(cal, kept, {provisional = false, made} = {}) {
  const add = {};
  for (const x of cal.days) {
    if (x.d < KEEP_FROM || kept[x.d] || x.k) continue;
    if (provisional && x.d === cal.asOf) continue;
    add[x.d] = {s: x.s, top: x.top.map(({n, sc, y}) => ({n, sc, y})), at: made};
  }
  return add;
}
export async function build({siteDir = 'site', made = new Date().toISOString(), keepCal = false, keptFile = KEPT_FILE} = {}) {
  const dd = path.join(siteDir, 'atlas', 'data');
  const [days, mkt, core, cond] = await Promise.all(['days.json', 'mkt.json', 'core.json', 'cond.json'].map(f => J(path.join(dd, f))));
  const dates = days?.dates;
  if (!Array.isArray(dates) || dates.some((d, i) => typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d) || (i && d <= dates[i - 1]))) throw Error('theme: days.json 날짜 줄이 비었거나 차례가 틀림');
  const N = dates.length, companies = mkt?.companies;
  if (!companies || typeof companies !== 'object') throw Error('theme: mkt.json 회사 칸 없음');
  const closes = new Map();
  const files = (await fs.readdir(path.join(dd, 'co'))).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort();
  await Promise.all(files.map(async f => {
    const code = f.slice(0, 6); if (!companies[code]) return;
    let c; try { c = await J(path.join(dd, 'co', f)); } catch { return; }
    const cl = c?.close, k0 = c?.k0; if (!Array.isArray(cl) || !Number.isInteger(k0)) return;
    const a = new Float64Array(N); // 0 = 없음
    for (let j = 0; j < cl.length; j++) { const t = j + k0, v = cl[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
    closes.set(code, a);
  }));
  if (closes.size < 100) throw Error('theme: 종가 파일이 너무 적음 ' + closes.size);
  const co = cond?.co, rk = new Map();
  if (co && Array.isArray(co.c) && Array.isArray(co.rk)) co.c.forEach((c, k) => { if (Number.isInteger(co.rk[k])) rk.set(c, co.rk[k]); });
  const kept = await readKept(keptFile);
  const {theme, more, co: coz, path: yr, cal} = computeTheme({dates, closes, companies, industries: core?.industries ?? [], groups: core?.groups ?? [], rk, provisional: core?.provisional === true || cond?.provisional === true, made, kept});
  cal.keepFrom = KEEP_FROM;
  if (keepCal) { // 올리기 작업만 — 새 날을 더하고 옛 날은 그대로
    const add = keepNew(cal, kept, {provisional: theme.provisional, made});
    if (Object.keys(add).length) {
      const all = {...kept, ...add}, body = {schema: KEPT_SCHEMA, from: KEEP_FROM, rule: 'theme-engine calOf · 결정표 4 차례 · 그날 장 마감 값', days: Object.fromEntries(Object.keys(all).sort().map(d => [d, all[d]]))};
      await fs.mkdir(path.dirname(keptFile), {recursive: true});
      const tmp = keptFile + '.tmp' + process.pid; await fs.writeFile(tmp, JSON.stringify(body, null, 1) + '\n'); await fs.rename(tmp, keptFile);
    }
  }
  const out = path.join(siteDir, 'next', 'data');
  await fs.mkdir(out, {recursive: true});
  const a = JSON.stringify(theme), b = JSON.stringify(more), c = JSON.stringify(homeOf(theme));
  const put = async (f, s) => { const p = path.join(out, f), tmp = p + '.tmp' + process.pid; await fs.writeFile(tmp, s + '\n'); await fs.rename(tmp, p); }; // 다 쓴 뒤 바꿔 끼움(쓰는 동안 화면이 반쪽 파일을 받지 않게 · 새 눈 검사 12)
  await put('theme.json', a);
  await put('theme-more.json', b);
  await put('theme-home.json', c); // 첫 화면 칸만(느린 4G 첫 그림 · check_white ③)
  await put('theme-co.json', JSON.stringify(coz)); // 회사 자리(결정표 9) — 회사 화면만 받음(첫 화면은 안 받음)
  await put('theme-cal.json', JSON.stringify(cal)); // 싹 달력(2026-10-22 11:55 「1 · 2 · 3 … 달력으로 · 기록이 없으면 하수」) — #/t/cal 만 받음
  await put('theme-path.json', JSON.stringify(yr)); // 1 · 2 · 3번 지난 한 해 길(2026-10-21 11:07 「자동으로 보여주게해」) — 첫 화면이 첫 그림 뒤에만 받음
  const R = theme.record;
  return `회사 자리 ${coz.n}곳(못 셈 ${coz.skip}) · 업종 ${theme.inds.length}곳 · 기준 ${theme.asOf} · 싹 ${theme.count.S} 꽃 ${theme.count.B} 시듦 ${theme.count.W} 잠잠 ${theme.count.Q} · 진짜 싹 ${theme.count.real} · 성적표 모든 날 ${R.all.p}%(${R.all.n}) 진짜 싹 ${R.real.p}%(${R.real.n}) 두 절반 ${R.more ? '모두 높음' : '차이 없음'} · ${Buffer.byteLength(a) + 1}+${Buffer.byteLength(b) + 1}바이트`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), si = a.indexOf('--site');
  console.log(await build({siteDir: si >= 0 ? a[si + 1] : 'site'}));
}
