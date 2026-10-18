#!/usr/bin/env node
// 고도리 칸 목록 받기 kind-v1 — 사장님 2026-10-18 00:15 [8] 2 「거래소 KIND의 관리, 투자경고, 위험, 거래 정지 목록과 DART 최근 1년 전환사채,
//   유상증자. 목록을 못 받은 날은 칸을 「?」로 둬라」 · 결정표 docs/design/godori-2026-10-18/gdr-v2.md 「자료」 목록 칸 꼴 그대로(G1c normLists 가 읽음)
//   → reports/atlas11/godori/kind-latest.json
//     {schema:'godori-kind-1', asOf(받은 날 · 서울), fetchedAt, lists:{managed, warning, danger, halted}, dart:{ok:false, cb:null, rights:null, why},
//      why:{이름: 까닭|null}, n:{이름: 수|null}, via:{이름: 'kind'|'naver'|null}, src:[{name, via, url, status, bytes, sha, why}]}
//   값 = 6자리 번호 배열(차례 · 겹침 없음) · 못 받은 목록 = null(화면 「?」) — 「위험 없음」([])으로 바꾸지 않는다:
//     받기 실패 · 표 없음 · 머리줄(회사명 · 종목명 · 종목코드) 없음 · 최소 수 미달(관리 10 · 거래정지 5) · 이름을 번호로 못 바꾼 줄이 하나라도 있음 → null
//     빈 목록 [] 은 KIND 표가 날짜 칸 있는 머리줄로 줄 없이 왔을 때만(검색 칸 form 이 든 쪽은 아님) · 비어 있을 수 있는 목록(투자경고 · 투자위험)만 · 네이버로 대신 받은 목록은 한 곳 이상일 때만
//   해제된 투자경고 · 투자위험(해제일 ≤ 오늘)은 뺀다 · 해제일 칸이 없으면 남겨 둔다(더 빼는 쪽 = 안전한 쪽)
//   받는 곳: ① 한국거래소 KIND 내려받기 표(EUC-KR) ② 안 되면 네이버 금융의 같은 목록 쪽(번호가 /item/main.naver?code= 고리에 있음 · via 'naver')
//     이름만 있는 표는 KIND 상장회사 목록(collect_universe 와 같은 주소) + 사이트 mkt.json 회사 이름으로 번호를 찾는다(같은 이름이 둘이면 못 찾음으로 셈)
//   받기 = scripts/atlas11/collect_naver.mjs fetchWithRetry(같은 UA · 다시 2번 · 800 · 2,400ms 쉼 · 목록 사이 400ms 쉼) — 이 저장소 다른 수집기와 같음
//   DART: OpenDART 열쇠가 저장소에 없음 → 부르지 않음 · dart.ok false · cb · rights null(결정표대로 모든 회사 「?」 → 고른 곳 0 · 사장님 할 일 = OpenDART 인증키)
//   이 기계(일꾼)는 KIND · 네이버에 닿지 않는다 — 받기는 깃허브 실행기(.github/workflows/godori-pick.yml)에서만 · 시험은 견본(tests/atlas11/fixtures/kind)
//   쓰는 법: node scripts/atlas11/next/gdr/kind.mjs [--out reports/atlas11/godori/kind-latest.json] [--site site/atlas/data] [--raw <폴더>] [--fixture <폴더>] [--no-naver]
//   끝 코드 0 = 파일을 씀(못 받은 목록은 null 로) · 1 = 파일을 못 씀
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {fetchWithRetry} from '../../collect_naver.mjs';

export const SCHEMA = 'godori-kind-1';
export const NAMES = Object.freeze(['managed', 'warning', 'danger', 'halted']);
/** 최소 수 — 이보다 적게 오면 표가 잘린 것으로 보고 null(「?」) · 0 = 비어 있어도 됨 */
export const MIN = Object.freeze({managed: 10, warning: 0, danger: 0, halted: 5});
const KIND = 'https://kind.krx.co.kr';
const q = o => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
const COMMON = {currentPageSize: '5000', pageIndex: '1', orderStat: 'D', searchMode: '', searchCodeType: '', searchCorpName: '', repIsuSrtCd: '', paxreq: '', outsideCorpName: '', marketType: '', searchCorpNameTmp: ''};
/** 한국거래소 KIND 내려받기 주소(표 HTML · EUC-KR) — 시장 모두(코스피 · 코스닥 · 코넥스) · 시장경보는 지정일 2년 안 + 해제일로 거름 */
export const KIND_URLS = Object.freeze({
  managed: () => `${KIND}/investwarn/adminissue.do?${q({method: 'searchAdminIssueSub', ...COMMON, orderMode: '1', forward: 'adminissue_down'})}`,
  halted: () => `${KIND}/investwarn/tradinghaltissue.do?${q({method: 'searchTradingHaltIssueSub', ...COMMON, orderMode: '1', forward: 'tradinghaltissue_down'})}`,
  warning: (from, to) => `${KIND}/investwarn/investattentwarnrisky.do?${q({method: 'investattentwarnriskySub', ...COMMON, orderMode: '3', menuIndex: '2', forward: 'invstattentwarnrisky_down', searchFromDate: from, searchToDate: to, etcVar: ''})}`,
  danger: (from, to) => `${KIND}/investwarn/investattentwarnrisky.do?${q({method: 'investattentwarnriskySub', ...COMMON, orderMode: '3', menuIndex: '3', forward: 'invstattentwarnrisky_down', searchFromDate: from, searchToDate: to, etcVar: ''})}`,
});
/** 이름만 있는 표의 번호 찾기 — collect_universe.mjs 의 URLS.kind 와 같은 주소 */
export const KIND_CORP_URL = `${KIND}/corpgeneral/corpList.do?method=download&searchType=13`;
/** 네이버 금융의 같은 목록(안 되면) — 번호가 고리에 들어 있음 */
export const NAVER_URLS = Object.freeze({
  managed: 'https://finance.naver.com/sise/management.naver',
  halted: 'https://finance.naver.com/sise/trading_halt.naver',
  warning: 'https://finance.naver.com/sise/investment_alert.naver?type=warning',
  danger: 'https://finance.naver.com/sise/investment_alert.naver?type=risk',
});
export const DART_WHY = 'NO_OPENDART_KEY'; // 저장소에 OpenDART 열쇠가 없음 — 부르지 않음

const NAME_H = ['회사명', '종목명', '기업명'], CODE_H = ['종목코드', '단축코드', '코드'], REL_H = ['해제일', '해제일자', '해제예정일'];
const sha = b => createHash('sha256').update(b).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = h => String(h ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#40;/g, '(').replace(/&#41;/g, ')').replace(/\s+/g, ' ').trim();
/** 서울 날짜 'YYYY-MM-DD' */
export const seoulDay = (t = Date.now()) => new Date(+new Date(t) + 9 * 3600000).toISOString().slice(0, 10);
const dayPlus = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);

/** 받은 바이트 → 글 — 글자가 깨졌거나 한글이 없으면 EUC-KR 로 다시 읽음(collect_universe 와 같은 잣대) */
export function decodeKr(bytes, text = null) {
  let t = text ?? Buffer.from(bytes).toString('utf8');
  if (/�/.test(t) || !/[가-힣]/.test(t)) { try { const e = new TextDecoder('euc-kr').decode(bytes); if (/[가-힣]/.test(e)) t = e; } catch { /* 그대로 */ } }
  return t;
}
/** 번호 칸 → 6자리(앞 0 이 빠진 숫자 · 'A005930' · 새 번호 '0126Z0') 또는 null */
export function normCode(v) {
  let s = String(v ?? '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (/^A[0-9A-Z]{6}$/.test(s)) s = s.slice(1);
  if (/^\d{1,6}$/.test(s)) return s.padStart(6, '0');
  return /^[0-9A-Z]{6}$/.test(s) && /\d/.test(s) ? s : null;
}
/** 이름 맞대기용 — 띄어쓰기 · (주) · ㈜ · 주식회사 · 「*」 표시를 빼고 영어는 대문자 */
export const normName = s => String(s ?? '').replace(/\(주\)|㈜|주식회사|\*/g, '').replace(/\s+/g, '').toUpperCase();
/** 'YYYY-MM-DD' · 'YYYY/MM/DD' · 'YYYY.MM.DD' · 'YYYYMMDD' → 'YYYY-MM-DD' 또는 null */
export function normDate(s) {
  const m = /(\d{4})[-./]?(\d{2})[-./]?(\d{2})/.exec(String(s ?? '')); if (!m) return null;
  const d = `${m[1]}-${m[2]}-${m[3]}`; return new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d ? d : null;
}
/** 표 HTML → {head, rows} — 회사명 · 종목명 · 종목코드 중 하나가 든 첫 줄이 머리줄 · 칸 하나뿐인 줄(「조회된 결과가 없습니다」 등)은 줄로 안 셈 */
export function parseTable(html) {
  const trs = [...String(html ?? '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(x => strip(x[1])));
  if (!trs.length) return {head: null, rows: [], why: 'NO_TABLE'};
  const hi = trs.findIndex(r => r.some(c => NAME_H.includes(c) || CODE_H.includes(c)));
  if (hi < 0) return {head: null, rows: [], why: 'NO_HEADER'};
  return {head: trs[hi], rows: trs.slice(hi + 1).filter(r => r.length >= 2 && r.some(c => c)), why: null};
}
/** 이름 → 번호 지도: KIND 상장회사 목록(표) + 사이트 mkt.json 회사 · 같은 이름에 다른 번호 = 못 씀('#') */
export function buildNameMap({corpHtml = null, mkt = null} = {}) {
  const map = new Map(), put = (name, code) => { const k = normName(name), c = normCode(code); if (!k || !c) return; const o = map.get(k); map.set(k, o && o !== c ? '#' : c); };
  if (corpHtml) { const t = parseTable(corpHtml); if (t.head) { const iN = t.head.indexOf('회사명'), iC = t.head.indexOf('종목코드'); if (iN >= 0 && iC >= 0) for (const r of t.rows) put(r[iN], r[iC]); } }
  for (const [c, o] of Object.entries(mkt?.companies ?? {})) if (o?.n) put(o.n, c);
  return map;
}
/**
 * KIND 표 한 장 → {codes, why, n, unmapped, released}
 *   codes = 차례 · 겹침 없는 6자리 배열 또는 null(못 씀) · today 'YYYY-MM-DD'(해제일 견줌) · nameMap = buildNameMap 결과
 */
export function parseKindList(html, name, {today, nameMap = new Map()} = {}) {
  const t = parseTable(html); if (!t.head) return {codes: null, why: t.why, n: null};
  const iC = t.head.findIndex(c => CODE_H.includes(c)), iN = t.head.findIndex(c => NAME_H.includes(c)), iR = t.head.findIndex(c => REL_H.includes(c));
  const out = new Set(), unmapped = [], released = [];
  for (const r of t.rows) {
    if (iR >= 0) { const d = normDate(r[iR]); if (d && today && d <= today) { released.push(r[iN] ?? r[iC]); continue; } }
    let c = iC >= 0 ? normCode(r[iC]) : null;
    if (!c && iN >= 0) { const m = nameMap.get(normName(r[iN])); c = m && m !== '#' ? m : null; }
    if (c) out.add(c); else unmapped.push(r[iN] ?? r[iC] ?? '');
  }
  const n = out.size;
  if (unmapped.length) return {codes: null, why: `UNMAPPED:${unmapped.length}`, n, unmapped: unmapped.slice(0, 20), released: released.length};
  if (n < (MIN[name] ?? 0)) return {codes: null, why: `BELOW_MIN:${n}<${MIN[name]}`, n, released: released.length};
  // 빈 목록은 진짜 목록 표일 때만(날짜 칸이 있는 머리줄 · 검색 칸(form)이 든 다른 쪽이 아님) — 엉뚱한 쪽을 「위험 없음」으로 읽지 않음
  if (n === 0 && (!t.head.some(c => /지정일|정지일|공시일/.test(c)) || /<form/i.test(html))) return {codes: null, why: 'EMPTY_UNSURE', n, released: released.length};
  return {codes: [...out].sort(), why: null, n, released: released.length};
}
/** 네이버 금융 목록 쪽 → {codes, why, n} — 번호는 /item/main.naver?code= 고리 · 머리줄(종목명)이 없으면 못 씀 · 대신 받은 곳이라 빈 목록은 안 받음(한 곳 이상) */
export function parseNaverList(html, name) {
  const s = String(html ?? '');
  if (!/<table/i.test(s)) return {codes: null, why: 'NO_TABLE', n: null};
  if (!/종목명/.test(s)) return {codes: null, why: 'NO_HEADER', n: null};
  const out = new Set(); for (const m of s.matchAll(/\/item\/main\.(?:naver|nhn)\?code=([0-9A-Za-z]{6})/g)) { const c = normCode(m[1]); if (c) out.add(c); }
  const n = out.size, min = Math.max(1, MIN[name] ?? 0);
  if (n < min) return {codes: null, why: `BELOW_MIN:${n}<${min}`, n};
  return {codes: [...out].sort(), why: null, n};
}

/**
 * collectLists({fetch, now, mkt, naver, raw, pauseMs, backoffMs}) → kind-latest.json 객체(쓰지는 않음)
 *   fetch = 받기 함수(시험에는 가짜) · mkt = 사이트 mkt.json 객체(이름 → 번호) · naver false = 네이버로 대신 받지 않음 · raw = 받은 바이트를 둘 폴더
 */
export async function collectLists({fetch = globalThis.fetch, now = new Date(), mkt = null, naver = true, raw = null, pauseMs = 400, backoffMs = [800, 2400], log = () => {}} = {}) {
  const fetchedAt = new Date(now).toISOString(), today = seoulDay(now), from = dayPlus(today, -730), src = [];
  const get = async (name, via, url) => {
    let r = null, why = null;
    try { r = await fetchWithRetry(url, {fetch, retries: 2, backoffMs, timeoutMs: 30000}); }
    catch (e) { why = 'FETCH_FAILED:' + (e.attempts?.at(-1)?.status ?? e.attempts?.at(-1)?.error ?? String(e.message)).toString().slice(0, 60); }
    const text = r ? decodeKr(r.bytes, r.text) : null;
    src.push({name, via, url, status: r?.status ?? null, bytes: r?.bytes?.length ?? null, sha: r ? sha(r.bytes) : null, why});
    if (raw && r) { try { fs.mkdirSync(raw, {recursive: true}); fs.writeFileSync(path.join(raw, `${name}-${via}.html`), r.bytes); } catch { /* 기록만 못 함 */ } }
    if (pauseMs) await sleep(pauseMs);
    return {text, why};
  };
  let nameMap = null;
  const names = async () => { if (nameMap) return nameMap; const c = await get('corplist', 'kind', KIND_CORP_URL); nameMap = buildNameMap({corpHtml: c.text, mkt}); return nameMap; };
  const lists = {}, why = {}, n = {}, via = {};
  for (const name of NAMES) {
    const url = name === 'warning' || name === 'danger' ? KIND_URLS[name](from, today) : KIND_URLS[name]();
    const k = await get(name, 'kind', url);
    let res = k.text == null ? {codes: null, why: k.why, n: null} : parseKindList(k.text, name, {today, nameMap: new Map()});
    if (res.why && /^UNMAPPED/.test(res.why)) res = parseKindList(k.text, name, {today, nameMap: await names()}); // 이름만 있는 표 → 상장 목록으로 번호
    let v = res.codes ? 'kind' : null;
    if (!res.codes && naver) { const w = await get(name, 'naver', NAVER_URLS[name]); const r2 = w.text == null ? {codes: null, why: w.why, n: null} : parseNaverList(w.text, name); if (r2.codes) { res = {...r2, why: null, kindWhy: res.why}; v = 'naver'; } else res = {...res, why: `${res.why} · naver ${r2.why}`}; }
    lists[name] = res.codes; why[name] = res.codes ? null : res.why; n[name] = res.codes ? res.codes.length : null; via[name] = v;
    if (res.kindWhy) src.push({name, via: 'kind', note: 'KIND 대신 네이버 · KIND 까닭 ' + res.kindWhy});
    log(`${name}: ${res.codes ? res.codes.length + '곳 · ' + v : '? · ' + why[name]}`);
  }
  return {schema: SCHEMA, asOf: today, fetchedAt, lists, dart: {ok: false, cb: null, rights: null, why: DART_WHY}, why, n, via, src};
}

/** 재생: <dir>/urls.json 의 {주소: 파일} 대로 읽음(없는 주소 = 404) — quarter.mjs 도 씀 */
export function fixtureFetch(dir) {
  let map = null;
  return async url => {
    map ??= JSON.parse(fs.readFileSync(path.join(dir, 'urls.json'), 'utf8'));
    const file = map[url]; if (!file || typeof file !== 'string') return new Response('fixture missing', {status: 404});
    const bytes = fs.readFileSync(path.join(dir, file)), ct = file.endsWith('.json') ? 'application/json; charset=utf-8' : /euckr|euc-kr/i.test(file) ? 'text/html' : 'text/html; charset=utf-8';
    return new Response(bytes, {status: 200, headers: {'content-type': ct}});
  };
}
/** 쓰기(임시 파일 → 이름 바꾸기) */
export function writeJson(file, obj, text = JSON.stringify(obj, null, 1) + '\n') {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const tmp = file + '.tmp-' + process.pid; fs.writeFileSync(tmp, text); fs.renameSync(tmp, file);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
async function cli() {
  const argv = process.argv.slice(2), arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
  const out = path.resolve(ROOT, arg('--out', 'reports/atlas11/godori/kind-latest.json'));
  let mkt = null; try { mkt = JSON.parse(fs.readFileSync(path.join(path.resolve(ROOT, arg('--site', 'site/atlas/data')), 'mkt.json'), 'utf8')); } catch { /* 이름 지도는 KIND 목록만 */ }
  const fx = arg('--fixture', null), raw = arg('--raw', null);
  const res = await collectLists({fetch: fx ? fixtureFetch(path.resolve(fx)) : globalThis.fetch, mkt, naver: !argv.includes('--no-naver'), raw: raw ? path.resolve(raw) : null, pauseMs: fx ? 0 : 400, log: m => console.log(m)});
  try { writeJson(out, res); } catch (e) { console.error('못 씀: ' + e.message); process.exit(1); }
  console.log(JSON.stringify({file: path.relative(ROOT, out), asOf: res.asOf, n: res.n, via: res.via, why: res.why, dart: res.dart.why}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli().catch(e => { console.error(e); process.exit(1); });
