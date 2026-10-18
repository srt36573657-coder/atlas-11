// 고도리 칸 셈 gdr-v2 — 자료 불러오기(결정표 docs/design/godori-2026-10-18/gdr-v2.md 「자료」 칸)
//   모음(bundle) 하나 → 회사 주식(사이트 mkt.json 회사)마다 날짜 줄(종가 · 거래량 · 거래대금 앞 합) · 해마다 결산(예상 칸 안 읽음) · 회사 요약(EPS · BPS · 시가총액)
//   + 업종 · 큰 업종(사이트 mkt.json · core.json groups) + 분기 결산(G3q 파일 · 없으면 null) + 거래소 · DART 목록(G3k 파일 · 없으면 null)
//   loadData 는 모음을 바꾸지 않고, 쓸 값만 옮겨 담음(모음 객체를 붙잡아 두지 않음 → 부른 쪽이 버릴 수 있음)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const readJ = f => JSON.parse(fs.readFileSync(f, 'utf8'));
/** 모음 파일(.json.gz · .json) 읽기 */
export function readBundle(p) { const b = fs.readFileSync(p); return JSON.parse(p.endsWith('.gz') ? zlib.gunzipSync(b) : b); }
/** 「3,336,059」 · 「-1,234」 · 「22,292원」 · 「10.68배」 → 수 · 「-」 · 빈칸 · 글 → null */
export const num = s => { if (s === null || s === undefined) return null; const t = String(s).replace(/,/g, '').replace(/[원배%\s]/g, ''); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null; };
/** 'YYYYMM'(끝 달 M) → M + add 달의 1일 'YYYY-MM-01' */
export function monthPlus1(key, add) { let y = +key.slice(0, 4), m = +key.slice(4, 6) + add; while (m > 12) { m -= 12; y++; } return `${y}-${String(m).padStart(2, '0')}-01`; }
export const FY_LAG = 4, Q_LAG = 3; // 해마다 결산 = 끝 달 + 4 달째 1일부터 · 분기 = 끝 달 + 3 달째 1일부터

/** 네이버 해마다 결산 글 → [{key, from, sales, op, net, eps, bps}] (isConsensus 'N' 칸만 · 차례 = 끝 달 차례) */
export function parseAnnual(text) {
  let j; try { j = typeof text === 'string' ? JSON.parse(text) : text; } catch { return []; }
  const fi = j?.financeInfo; if (!fi) return [];
  const keys = (fi.trTitleList ?? []).filter(t => t && t.isConsensus === 'N' && /^\d{6}$/.test(String(t.key))).map(t => String(t.key));
  const want = {'매출액': 'sales', '영업이익': 'op', '당기순이익': 'net', 'EPS': 'eps', 'BPS': 'bps'};
  const out = [...new Set(keys)].sort().map(key => ({key, from: monthPlus1(key, FY_LAG), sales: null, op: null, net: null, eps: null, bps: null}));
  for (const r of fi.rowList ?? []) { const f = want[r?.title]; if (!f) continue; for (const o of out) o[f] = num(r.columns?.[o.key]?.value); }
  return out;
}
/** 회사 요약(integration) → {eps, epsKey, bps, bpsKey} — 'YYYY.MM.' 기준 달 · 없으면 null */
export function parseInteg(text) {
  let j; try { j = typeof text === 'string' ? JSON.parse(text) : text; } catch { return null; }
  const o = {eps: null, epsKey: null, bps: null, bpsKey: null};
  for (const t of j?.totalInfos ?? []) {
    if (t?.code !== 'eps' && t?.code !== 'bps') continue;
    const m = /^(\d{4})\.(\d{2})/.exec(String(t.valueDesc ?? ''));
    o[t.code] = num(t.value); o[t.code + 'Key'] = m ? m[1] + m[2] : null;
  }
  return o;
}
/** 분기 결산(G3q quarter-latest.json) → 번호 → [{key, from, sales, op, net}] · 꼴: {co: {번호: [{key|period, sales|rev, op, net}]}} 또는 {co: {번호: {q: [...]}}} */
export function normQuarters(Q) {
  const out = new Map(); if (!Q || typeof Q !== 'object') return null;
  const co = Q.co ?? Q.companies ?? Q.stocks; if (!co || typeof co !== 'object') return null;
  for (const [c, v] of Object.entries(co)) {
    const arr = Array.isArray(v) ? v : Array.isArray(v?.q) ? v.q : Array.isArray(v?.rows) ? v.rows : null; if (!arr) continue;
    const rows = [];
    for (const r of arr) {
      const key = String(r?.key ?? r?.period ?? '').replace(/\D/g, '').slice(0, 6); if (!/^\d{6}$/.test(key)) continue;
      if (r?.isConsensus === 'Y' || r?.est === true || r?.consensus === true) continue; // 예상 칸은 안 씀
      const g = (...ks) => { for (const k of ks) if (r[k] !== undefined) return typeof r[k] === 'number' ? r[k] : num(r[k]); return null; };
      rows.push({key, from: monthPlus1(key, Q_LAG), sales: g('sales', 'rev', '매출액'), op: g('op', '영업이익'), net: g('net', '당기순이익')});
    }
    rows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    out.set(c, rows.filter((r, i) => i === 0 || r.key !== rows[i - 1].key));
  }
  return out;
}
/** 거래소 · DART 목록(G3k kind-latest.json) → {sets: Map(이름 → Set|null), asOf} · 받은 목록 = 6자리 번호 배열 · 못 받은 목록 = null */
export const LIST_KEYS = {managed: ['managed', '관리'], warning: ['warning', '투자경고'], danger: ['danger', 'risk', '투자위험'], halted: ['halted', 'halt', '거래정지'], cb: ['cb', '전환사채'], rights: ['rights', '유상증자']};
export function normLists(L) {
  if (!L || typeof L !== 'object') return null;
  const src = {...(L.lists ?? {}), ...(L.dart && typeof L.dart === 'object' ? L.dart : {})}, sets = new Map();
  for (const [k, al] of Object.entries(LIST_KEYS)) {
    let v; for (const a of al) if (src[a] !== undefined) { v = src[a]; break; }
    sets.set(k, Array.isArray(v) ? new Set(v.map(x => String(x).padStart(6, '0'))) : null);
  }
  if (L.dart && L.dart.ok === false) { sets.set('cb', null); sets.set('rights', null); }
  return {sets, asOf: L.asOf ?? L.at ?? null};
}

/**
 * loadData({bundle, site, quarters, lists}) — bundle = 읽은 객체 또는 파일 길 · site = 사이트 자료 폴더(mkt.json · core.json)
 * 돌려줌: {days, codes, D, N, close, vol, tvPre, missPre, ind, big, name, fy, integ, cap, inds, indMembers, indTvPre, bigNames, quarters, lists, src}
 */
export function loadData({bundle, site = 'site/atlas/data', quarters = null, lists = null, root = process.cwd()} = {}) {
  const B = typeof bundle === 'string' ? readBundle(path.resolve(root, bundle)) : bundle;
  if (!B?.stocks) throw new Error('모음에 stocks 칸이 없음');
  const siteDir = path.resolve(root, site);
  const mkt = readJ(path.join(siteDir, 'mkt.json')), core = readJ(path.join(siteDir, 'core.json'));
  const codes = Object.keys(mkt.companies).sort();
  // 거래일 달력 = 회사 주식 절반 넘게 일봉 줄이 있는 날(G2b 바탕 비교 baseline.mjs 와 같은 잣대 · 839날)
  const dayCnt = new Map();
  for (const c of codes) for (const r of B.stocks[c]?.fchart?.rows ?? []) { const d = String(r[0]); dayCnt.set(d, (dayCnt.get(d) ?? 0) + 1); }
  const days = [...dayCnt].filter(([, m]) => 2 * m > codes.length).map(([d]) => d).sort().map(d => d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8));
  const D = days.length, N = codes.length, dIdx = new Map(days.map((d, i) => [d.replace(/-/g, ''), i]));
  const close = new Float64Array(N * D).fill(NaN), vol = new Float64Array(N * D).fill(NaN);
  const tvPre = new BigInt64Array(N * (D + 1)), missPre = new Int32Array(N * (D + 1));
  const fy = [], integ = [], cap = new Float64Array(N).fill(NaN), name = [], ind = [], big = [];
  const ind2big = new Map(); for (const g of core.groups ?? []) for (const i of g.inds ?? []) ind2big.set(i, g.name);
  codes.forEach((c, n) => {
    const S = B.stocks[c] ?? {}, o = n * D, p = n * (D + 1);
    for (const r of S.fchart?.rows ?? []) {
      const d = dIdx.get(String(r[0])); if (d === undefined) continue;
      const cl = Number(r[4]), v = Number(r[5]);
      if (Number.isFinite(cl) && cl > 0) close[o + d] = cl;
      if (Number.isFinite(v) && v >= 0) vol[o + d] = v;
    }
    let s = 0n, m = 0;
    for (let d = 0; d < D; d++) {
      const cl = close[o + d], v = vol[o + d];
      if (Number.isFinite(cl) && Number.isFinite(v)) s += BigInt(Math.round(cl)) * BigInt(Math.round(v)); else m++;
      tvPre[p + d + 1] = s; missPre[p + d + 1] = m;
    }
    fy.push(S.finance?.text ? parseAnnual(S.finance.text) : []);
    integ.push(S.integration?.text ? parseInteg(S.integration.text) : null);
    const lv = Number(S.list?.listValue); if (Number.isFinite(lv) && lv > 0) cap[n] = lv; // 억 원 · 받은 때
    const co = mkt.companies[c]; name.push(co.n ?? c); ind.push(co.i ?? null); big.push(co.i ? (ind2big.get(co.i) ?? null) : null);
  });
  // 업종마다 날마다 거래대금 합(빠진 줄 = 0 · v1 과 같음)의 앞 합
  const inds = [...new Set(ind.filter(Boolean))].sort(), indIdx = new Map(inds.map((x, i) => [x, i]));
  const indMembers = inds.map(() => []); ind.forEach((x, n) => { if (x) indMembers[indIdx.get(x)].push(n); });
  const indTvPre = inds.map((x, i) => {
    const P = new BigInt64Array(D + 1); let s = 0n;
    for (let d = 0; d < D; d++) { for (const n of indMembers[i]) { const cl = close[n * D + d], v = vol[n * D + d]; if (Number.isFinite(cl) && Number.isFinite(v)) s += BigInt(Math.round(cl)) * BigInt(Math.round(v)); } P[d + 1] = s; }
    return P;
  });
  const Q = quarters ? normQuarters(typeof quarters === 'string' ? readJ(path.resolve(root, quarters)) : quarters) : null;
  const Lr = lists ? normLists(typeof lists === 'string' ? readJ(path.resolve(root, lists)) : lists) : null;
  return {days, codes, D, N, close, vol, tvPre, missPre, name, ind, big, fy, integ, cap, inds, indIdx, indMembers, indTvPre,
    bigNames: [...new Set(big.filter(Boolean))], quarters: Q, lists: Lr, siteAsOf: mkt.asOf ?? null, listed: Object.keys(B.stocks).length,
    src: {bundle: typeof bundle === 'string' ? bundle : null, collectedAt: B.collectedAt ?? null, site}};
}
