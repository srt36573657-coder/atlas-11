#!/usr/bin/env node
// 고도리 칸 분기 결산 받기 quarter-v1 — 사장님 2026-10-18 00:15 [8] 7 「이익 문은 최근 4분기 합으로 바꾸고, 매출도 함께 늘었는지 …」
//   결정표 docs/design/godori-2026-10-18/gdr-v2.md 「자료」 분기 결산 칸 꼴 그대로(G1c normQuarters 가 읽음) → reports/atlas11/godori/quarter-latest.json
//     {schema:'godori-quarter-1', asOf(받은 날 · 서울), fetchedAt, source, rule, co:{번호: [{key:'YYYYMM', sales, op, net}] | null}, got:{번호: 'YYYY-MM-DD'}, failed:[번호], skipped:[번호]}
//   값 = 억 원 · 그 분기 석 달 값(누적 아님 — 네이버 분기 실적) · 매출 = 매출액(없으면 영업수익) · 영업이익 · 당기순이익 · 「-」 · 빈칸 = null
//   확정 칸만(API isConsensus 'N' · 쪽 표는 「(E)」 없는 칸) — 예상 · 컨센서스 칸은 처음부터 담지 않음 · DART 는 열쇠가 없어 안 씀
//   앞 파일과 합침: 새로 받은 key 가 이김 · 앞 파일에만 있는 key 는 남김(네이버는 최근 다섯 분기만 보여 줌 → 4분기 합 둘(다섯 분기)을 잃지 않게) · 회사마다 16분기까지
//   못 받은 회사 = 앞 값 그대로(없으면 null) + failed · 시간이 모자라 못 간 회사 = 앞 값 그대로 + skipped · 받은 지 --max-age-days(6일) 안인 회사는 다시 안 받음
//   받는 곳: m.stock.naver.com/api/stock/{번호}/finance/quarter(collect_universe 의 finance/annual 과 같은 집) · 안 되거나 매출 · 영업이익이 다 있는 분기가
//     다섯이 안 되면 finance.naver.com/item/main.naver 「기업실적분석」 분기 칸도 받아 합침(겹친 분기는 API 값)
//   받기 = scripts/atlas11/collect_naver.mjs fetchWithRetry(같은 UA · 다시 2번 · 800 · 2,400ms) · 셋씩 · 곳마다 200ms 쉼(collect_universe 와 같음)
//   usableAt(key, {fyEnd}) — 그 분기 숫자를 쓸 수 있는 첫날(USABLE_RULE · G1c 결정표와 같은 뜻)
//   이 기계(일꾼)는 네이버에 닿지 않는다 — 받기는 깃허브 실행기(.github/workflows/godori-pick.yml)에서만 · 시험은 견본(tests/atlas11/fixtures/quarter)
//   쓰는 법: node scripts/atlas11/next/gdr/quarter.mjs [--out reports/atlas11/godori/quarter-latest.json] [--site site/atlas/data | --codes 005930,000660]
//            [--max-age-days 6] [--all] [--budget-s 1800] [--fixture <폴더>]
//   끝 코드 0 = 파일을 씀 · 1 = 파일을 못 씀 또는 한 곳도 못 받았고 앞 파일도 없음
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fetchWithRetry} from '../../collect_naver.mjs';
import {decodeKr, fixtureFetch, seoulDay, writeJson} from './kind.mjs';

export const SCHEMA = 'godori-quarter-1';
export const API_URL = code => `https://m.stock.naver.com/api/stock/${code}/finance/quarter`;
export const HTML_URL = code => `https://finance.naver.com/item/main.naver?code=${code}`;
export const KEEP = 16; // 회사마다 남길 분기 수(4년)
/**
 * 쓸 수 있는 첫날 — 결산 달이 아닌 분기: 끝 달 + 3 달째 1일 · 결산 달 분기(fyEnd 와 끝 달이 같음): 끝 달 + 4 달째 1일
 *   까닭: 분기 · 반기보고서는 분기가 끝나고 45일 안(예외 60일 · 자본시장법 160조) → + 3 달째 1일은 늘 62일 넘게 뒤 ·
 *         넷째 분기 숫자는 사업보고서(사업연도 끝 90일 안 · 159조)로만 나옴 → + 4 달째 1일은 늘 90일 넘게 뒤
 *   fyEnd 를 모르면 + 3(결정표 normQuarters 의 from 과 같음 · 결산 달 판단은 pick2 안에서)
 */
export const USABLE_RULE = '분기 끝 달 + 3 달째 1일(분기 · 반기보고서 45일 · 예외 60일) · 결산 달 분기는 + 4 달째 1일(사업보고서 90일) · 예상 칸은 안 씀';
export function usableAt(key, {fyEnd = null} = {}) {
  const m = /^(\d{4})(\d{2})/.exec(String(key ?? '').replace(/\D/g, '')); if (!m) return null;
  let y = +m[1], mo = +m[2]; if (mo < 1 || mo > 12) return null;
  mo += fyEnd != null && +fyEnd === mo ? 4 : 3; while (mo > 12) { mo -= 12; y++; }
  return `${y}-${String(mo).padStart(2, '0')}-01`;
}
/** 「3,336,059」 · 「-1,234」 · 「12.5%」 → 수 · 「-」 · 빈칸 · 글 → null(G1c data.mjs num 과 같은 잣대) */
export const num = s => { if (s === null || s === undefined) return null; if (typeof s === 'number') return Number.isFinite(s) ? s : null; const t = String(s).replace(/,/g, '').replace(/[원배%\s]/g, ''); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null; };
const keyOf = s => { const m = /^(\d{4})\D?(\d{2})/.exec(String(s ?? '').trim()); return m && +m[2] >= 1 && +m[2] <= 12 ? m[1] + m[2] : null; };
const SALES = ['매출액', '영업수익'], OP = ['영업이익'], NET = ['당기순이익'];

/** m.stock 분기 JSON → [{key, sales, op, net}](확정 칸만 · key 차례) — 꼴이 다르면 던짐 */
export function parseQuarterJson(text) {
  let j; try { j = typeof text === 'string' ? JSON.parse(text) : text; } catch { throw Error('QUARTER_JSON_INVALID'); }
  if (j?.financePeriodType && j.financePeriodType !== 'quarter') throw Error('QUARTER_NOT_QUARTER:' + j.financePeriodType);
  const fi = j?.financeInfo ?? j;
  if (!Array.isArray(fi?.trTitleList) || !Array.isArray(fi?.rowList)) throw Error('QUARTER_JSON_SHAPE');
  const cols = fi.trTitleList.filter(t => t && t.isConsensus === 'N').map(t => ({raw: String(t.key ?? ''), key: keyOf(t.key ?? t.title)})).filter(c => c.key);
  const row = names => { for (const nm of names) { const r = fi.rowList.find(x => String(x?.title ?? '').replace(/\s/g, '') === nm); if (r) return r; } return null; };
  const rS = row(SALES), rO = row(OP), rN = row(NET);
  const at = (r, c) => (r ? num(r.columns?.[c.raw]?.value ?? r.columns?.[c.key]?.value) : null);
  return tidy(cols.map(c => ({key: c.key, sales: at(rS, c), op: at(rO, c), net: at(rN, c)})));
}
/** finance.naver.com 종목 쪽 「기업실적분석」 표 → 분기 칸(「최근 분기 실적」 · (E) 칸 뺌) — API 가 안 될 때만 */
export function parseCopQuarterHtml(html) {
  const s = String(html ?? ''), at = s.indexOf('cop_analysis'); if (at < 0) throw Error('COP_ANALYSIS_ABSENT');
  const sec = s.slice(at, s.indexOf('</table>', at) + 8), strip = h => String(h ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const thead = /<thead[^>]*>([\s\S]*?)<\/thead>/i.exec(sec)?.[1] ?? '';
  const nA = Number(/colspan="(\d+)"[^>]*>(?:(?!<\/th>)[\s\S])*?최근\s*연간\s*실적/i.exec(thead)?.[1] ?? 4) || 4;
  const trs = [...thead.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(x => strip(x[1])));
  const per = (trs.find(r => r.some(x => /^\d{4}\.\d{2}/.test(x))) ?? []).filter(x => /^\d{4}\.\d{2}/.test(x));
  if (per.length <= nA) throw Error('COP_ANALYSIS_NO_QUARTER');
  const cols = per.map((x, i) => ({i, key: keyOf(x), est: /\(E\)/.test(x)})).slice(nA).filter(c => c.key && !c.est);
  const tbody = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(sec)?.[1] ?? '', rows = {};
  for (const tr of tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) { const nm = strip(/<th[^>]*>([\s\S]*?)<\/th>/i.exec(tr[1])?.[1]).replace(/\s/g, ''); if (nm && !rows[nm]) rows[nm] = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => num(strip(m[1]))); }
  const pick = names => names.map(n => rows[n]).find(Boolean) ?? null;
  const rS = pick(SALES), rO = pick(OP), rN = pick(NET); if (!rS && !rO) throw Error('COP_ANALYSIS_SHAPE');
  return tidy(cols.map(c => ({key: c.key, sales: rS?.[c.i] ?? null, op: rO?.[c.i] ?? null, net: rN?.[c.i] ?? null})));
}
const tidy = rows => { const m = new Map(); for (const r of rows) if (!m.has(r.key)) m.set(r.key, r); return [...m.values()].sort((a, b) => (a.key < b.key ? -1 : 1)); };
/** 합치기: 앞 줄 + 새 줄 → 새 줄이 이김 · key 차례 · 마지막 KEEP 개 */
export function mergeRows(prev, fresh) {
  const m = new Map(); for (const r of prev ?? []) if (r?.key) m.set(r.key, {key: r.key, sales: r.sales ?? null, op: r.op ?? null, net: r.net ?? null});
  for (const r of fresh ?? []) m.set(r.key, r);
  return [...m.values()].sort((a, b) => (a.key < b.key ? -1 : 1)).slice(-KEEP);
}

/**
 * collectQuarters({codes, prev, fetch, now, maxAgeDays, all, budgetMs, concurrency, pauseMs, backoffMs}) → quarter-latest.json 객체(쓰지는 않음)
 *   prev = 앞 파일 객체(없으면 null) · 받은 지 maxAgeDays 안이고 값이 있는 회사는 그대로(all 이면 모두 다시)
 */
export async function collectQuarters({codes, prev = null, fetch = globalThis.fetch, now = new Date(), maxAgeDays = 6, all = false, budgetMs = 1800e3, concurrency = 3, pauseMs = 200, backoffMs = [800, 2400], log = () => {}} = {}) {
  const t0 = Date.now(), today = seoulDay(now), fetchedAt = new Date(now).toISOString();
  const pco = prev?.schema === SCHEMA && prev.co ? prev.co : {}, pgot = prev?.schema === SCHEMA && prev.got ? prev.got : {};
  const age = c => (pgot[c] ? (Date.parse(today) - Date.parse(pgot[c])) / 864e5 : Infinity);
  const want = [...new Set(codes)].sort(), todo = want.filter(c => all || !Array.isArray(pco[c]) || !(age(c) < maxAgeDays)).sort((a, b) => age(b) - age(a) || (a < b ? -1 : 1));
  const co = {}, got = {}, failed = [], skipped = [], via = {api: 0, html: 0};
  for (const c of want) { co[c] = Array.isArray(pco[c]) ? pco[c] : null; if (pgot[c]) got[c] = pgot[c]; }
  let next = 0;
  // API 가 안 되거나, 합쳐도 매출 · 영업이익이 다 있는 분기가 다섯이 안 되면(4분기 합 둘 = 다섯 분기) 쪽 표도 받아 합침 — 겹친 분기는 API 값
  const five = (c, rows) => mergeRows(co[c], rows).filter(r => r.sales != null && r.op != null).length >= 5;
  const one = async c => {
    let api = null, html = null;
    try { const r = await fetchWithRetry(API_URL(c), {fetch, retries: 2, backoffMs, timeoutMs: 20000}); api = parseQuarterJson(r.text); via.api++; } catch { api = null; }
    if (!api || !five(c, api)) { try { const r = await fetchWithRetry(HTML_URL(c), {fetch, retries: 2, backoffMs, timeoutMs: 20000}); html = parseCopQuarterHtml(decodeKr(r.bytes, r.text)); via.html++; } catch { html = null; } }
    if (api || html) { co[c] = mergeRows(mergeRows(co[c], html ?? []), api ?? []); got[c] = today; } else failed.push(c);
  };
  await Promise.all(Array.from({length: Math.max(1, Math.min(concurrency, todo.length))}, async () => {
    while (next < todo.length) { const c = todo[next++]; if (Date.now() - t0 > budgetMs) { skipped.push(c); continue; } await one(c); if (pauseMs) await new Promise(r => setTimeout(r, pauseMs)); }
  }));
  log(`분기 결산: 받음 ${todo.length - failed.length - skipped.length} (api ${via.api} · 쪽 ${via.html}) · 못 받음 ${failed.length} · 시간 넘음 ${skipped.length} · 그대로 ${want.length - todo.length}`);
  return {schema: SCHEMA, asOf: today, fetchedAt, source: {api: API_URL('{번호}'), html: HTML_URL('{번호}'), via}, rule: USABLE_RULE,
    co, got: Object.fromEntries(Object.entries(got).sort()), failed: failed.sort(), skipped: skipped.sort()};
}
/** 한 줄에 한 회사(깃 기록이 작게 바뀜) */
export function toText(o) {
  const head = Object.entries(o).filter(([k]) => k !== 'co').map(([k, v]) => JSON.stringify(k) + ':' + JSON.stringify(v));
  return '{' + head.join(',') + ',"co":{\n' + Object.entries(o.co).map(([c, r]) => JSON.stringify(c) + ':' + JSON.stringify(r)).join(',\n') + '\n}}\n';
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
async function cli() {
  const argv = process.argv.slice(2), arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
  const out = path.resolve(ROOT, arg('--out', 'reports/atlas11/godori/quarter-latest.json'));
  let codes = arg('--codes', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
  if (!codes) codes = Object.keys(JSON.parse(fs.readFileSync(path.join(path.resolve(ROOT, arg('--site', 'site/atlas/data')), 'mkt.json'), 'utf8')).companies);
  let prev = null; try { prev = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { /* 처음 */ }
  const fx = arg('--fixture', null);
  const res = await collectQuarters({codes, prev, fetch: fx ? fixtureFetch(path.resolve(fx)) : globalThis.fetch, maxAgeDays: +arg('--max-age-days', 6), all: argv.includes('--all'),
    budgetMs: Math.max(30, +arg('--budget-s', 1800) || 1800) * 1000, pauseMs: fx ? 0 : 200, log: m => console.log(m)});
  const have = Object.values(res.co).filter(Array.isArray).length;
  if (!have) { console.error('한 곳도 못 받았고 앞 파일도 없음 — 쓰지 않음'); process.exit(1); }
  try { writeJson(out, null, toText(res)); } catch (e) { console.error('못 씀: ' + e.message); process.exit(1); }
  console.log(JSON.stringify({file: path.relative(ROOT, out), asOf: res.asOf, codes: codes.length, have, failed: res.failed.length, skipped: res.skipped.length, via: res.source.via}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli().catch(e => { console.error(e); process.exit(1); });
