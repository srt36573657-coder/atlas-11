#!/usr/bin/env node
// 테마 시계 자료 — 올릴 때 한 번(사장님 2026-10-19(싱가포르) 16:54 「이제 aaa7377.com에 올려 … 더 스마트한 내부 시스템을 만들어서 올려」)
//   셈 = site/next/theme-engine.js computeTheme(결정표 docs/design/theme-2026-10-19/theme-engine.md) — 이 파일은 파일 읽기 · 쓰기만
//   읽음: <site>/atlas/data/days.json · co/*.json(close · k0) · mkt.json(이름 · 업종) · core.json(업종 무리) · cond.json(업종 안 몸값 차례)
//   씀:   <site>/next/data/theme.json(목록 · 업종 쪽 — 모든 업종 자리 · 점 넷 · 성적표) · theme-more.json(업종 쪽 회사 줄 — 큰 회사 셋 · 함께 움직인 8곳) · theme-home.json(첫 화면 칸만 · 4KB 남짓)
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
export async function build({siteDir = 'site', made = new Date().toISOString()} = {}) {
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
  const {theme, more} = computeTheme({dates, closes, companies, industries: core?.industries ?? [], groups: core?.groups ?? [], rk, provisional: core?.provisional === true || cond?.provisional === true, made});
  const out = path.join(siteDir, 'next', 'data');
  await fs.mkdir(out, {recursive: true});
  const a = JSON.stringify(theme), b = JSON.stringify(more), c = JSON.stringify(homeOf(theme));
  const put = async (f, s) => { const p = path.join(out, f), tmp = p + '.tmp' + process.pid; await fs.writeFile(tmp, s + '\n'); await fs.rename(tmp, p); }; // 다 쓴 뒤 바꿔 끼움(쓰는 동안 화면이 반쪽 파일을 받지 않게 · 새 눈 검사 12)
  await put('theme.json', a);
  await put('theme-more.json', b);
  await put('theme-home.json', c); // 첫 화면 칸만(느린 4G 첫 그림 · check_white ③)
  const R = theme.record;
  return `업종 ${theme.inds.length}곳 · 기준 ${theme.asOf} · 싹 ${theme.count.S} 꽃 ${theme.count.B} 시듦 ${theme.count.W} 잠잠 ${theme.count.Q} · 진짜 싹 ${theme.count.real} · 성적표 모든 날 ${R.all.p}%(${R.all.n}) 진짜 싹 ${R.real.p}%(${R.real.n}) 두 절반 ${R.more ? '모두 높음' : '차이 없음'} · ${Buffer.byteLength(a) + 1}+${Buffer.byteLength(b) + 1}바이트`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), si = a.indexOf('--site');
  console.log(await build({siteDir: si >= 0 ? a[si + 1] : 'site'}));
}
