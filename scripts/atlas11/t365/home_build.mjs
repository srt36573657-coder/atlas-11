#!/usr/bin/env node
// 새 ATLAS 첫 화면 종합 정보 자료(home.json) — 사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 나와야 하고 365개 종목도 나와야 그리고 오늘 어떤 업종이 강했는지
//   약했는 각각 7가지 도 나와해고 수급도 나와야 하고 미국장 분위기도 나와야 즉 첫 페이지에서 종합정보가 있어야 해 … 애플 구글 cia 클로드라면 … 토론후 결정해서 만들어」
//   네 팀(애플 · 구글 · CIA · 클로드)을 서로 모르게 따로 돌려 합친 안(docs/design/new-atlas-2026-10-11.md 「첫 화면 종합 정보」) — 이 파일은 자료만 만듦(화면은 site/atlas/atlas.js viewHome)
//   받은 원문(market_fetch.mjs 가 깃허브 실행기에서 받음 · 이름은 탐침 scripts/atlas11/probe/home.mjs 와 같음):
//     kospi-day.json · kosdaq-day.json(지수 날마다 · 네이버 증권) · kospi-trend.json · kosdaq-trend.json(오늘 개인 · 외국인 · 기관 순매수 · 억 원)
//     industry.json(네이버 업종 79개 · 오늘 바뀐 비율 · 오른 · 내린 · 그대로 수 · 장 상태) · us-inx · us-ixic · us-dji · us-sox · us-vix.json(미국 지수 60거래일)
//   자료(그 회차 site_build 자료 폴더): core.json(기준일 · 고른 날 · 365곳 지수) · lines.json(365곳 20거래일 선 — 마지막 두 칸 = 오늘) · comp.json(이름 · 네이버 업종)
//   못 받은 조각은 앞 자료(--prev = 지금 올라가 있는 home.json)의 같은 조각을 「앞 회차 값」(stale) 꼬리표와 함께 · 그것도 없으면 null(화면 「?」)
//   지난 사실만 — 앞날 · 사고팔기 말 없음(규칙 49) · 문턱은 미리 정함(HOME_RULE)
// 쓰는 법: node scripts/atlas11/t365/home_build.mjs --data <자료 폴더> [--raw <원문 폴더>] [--prev <앞 home.json>] [--out <home.json>] [--now <ISO>]
import fs from 'node:fs';
import path from 'node:path';

export const HOME_RULE = {id: 'home-v2', minSector: 5, top: 7, months: 3, minRows: 40, alertIdx: 3, alertFlow: 10000, open: '09:00', close: '15:30'}; // minRows = 3개월에 거래일이 이보다 적게 오면 덜 받은 것으로 보고 앞 회차 값(네 눈 점검 구글 눈 「3개월 안」과 같은 문턱 — 덜 받은 값 하나가 회차 전체를 막지 않게)
const US = [['INX', '.INX', 'S&P 500', 'us-inx.json'], ['IXIC', '.IXIC', '나스닥', 'us-ixic.json'], ['DJI', '.DJI', '다우', 'us-dji.json'], ['SOX', '.SOX', '미국 반도체', 'us-sox.json'], ['VIX', '.VIX', '미국 불안 지수', 'us-vix.json']];
const num = x => { if (x == null) return null; const v = typeof x === 'number' ? x : +String(x).replace(/[,+\s]/g, ''); return Number.isFinite(v) ? v : null; };
const iso8 = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
const r2 = x => (x == null ? null : Math.round(x * 100) / 100);
const readRaw = (dir, f) => { if (!dir) return null; try { const t = fs.readFileSync(path.join(dir, f), 'utf8'); return t.trim() ? JSON.parse(t) : null; } catch { return null; } };

/** 지수 3개월 — [[날, 종가]] · 오늘 바뀐 비율 · 가장 높던 · 낮던 날 · 20거래일(기준일 → 고른 날) */
export function indexPiece(raw, name, {months, base, asOf, live, today, minRows = HOME_RULE.minRows}) {
  if (!Array.isArray(raw) || !raw.length) return null;
  const all = raw.map(r => [iso8(String(r.localDate)), num(r.closePrice)]).filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && v > 0).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  if (all.length < 2) return null;
  const last = all.at(-1)[0], from = new Date(last + 'T00:00:00Z'); from.setUTCMonth(from.getUTCMonth() - months);
  const rows = all.filter(([d]) => d >= from.toISOString().slice(0, 10));
  if (rows.length < minRows) return null;
  const prevClose = all.at(-2)[1], lastClose = all.at(-1)[1];
  let hi = rows[0], lo = rows[0]; for (const r of rows) { if (r[1] > hi[1]) hi = r; if (r[1] < lo[1]) lo = r; }
  const at = d => all.find(r => r[0] === d)?.[1] ?? null, b = at(base), a = at(asOf);
  return {name, rows, date: last, close: lastClose, day: r2((lastClose / prevClose - 1) * 100), live: !!live && last === today,
    hi: {d: hi[0], v: hi[1], vs: r2((lastClose / hi[1] - 1) * 100)}, lo: {d: lo[0], v: lo[1], vs: r2((lastClose / lo[1] - 1) * 100)}, chg20: b && a ? r2((a / b - 1) * 100) : null};
}
/** 수급 — 억 원(+ = 더 삼 · − = 더 팖) */
export function flowPiece(raw) {
  if (!raw || !raw.bizdate) return null;
  const p = num(raw.personalValue), f = num(raw.foreignValue), i = num(raw.institutionalValue);
  if (p == null && f == null && i == null) return null;
  return {date: iso8(String(raw.bizdate)), personal: p, foreign: f, institutional: i};
}
/** 업종 — 회사 minSector 곳 이상 · 「기타」 뺌 · 위 7 · 아래 7 · 365곳이 든 수 · 시장 전체 오른 · 내린 수(기타 뺌) */
export function sectorPiece(raw, comp, rule = HOME_RULE) {
  const G = raw?.groups; if (!Array.isArray(G) || !G.length) return null;
  const in365 = {}; for (const c of Object.values(comp)) in365[c.sector] = (in365[c.sector] ?? 0) + 1;
  const rows = G.map(g => ({name: String(g.name), chg: num(g.changeRate), up: g.riseCount ?? null, down: g.fallCount ?? null, flat: g.steadyCount ?? null, n: g.totalCount ?? null, in365: in365[g.name] ?? 0}))
    .filter(g => g.chg != null && g.n != null);
  const named = rows.filter(g => g.name !== '기타'), ok = named.filter(g => g.n >= rule.minSector).sort((a, b) => b.chg - a.chg || b.n - a.n);
  const strong = ok.slice(0, rule.top), weak = ok.slice(-rule.top).reverse();
  const sum = k => named.reduce((t, g) => t + (g[k] ?? 0), 0);
  const avgStrong = strong.length ? strong.reduce((t, g) => t + g.chg, 0) / strong.length : null;
  return {n: rows.length, ranked: ok.length, skipped: named.length - ok.length, other: rows.find(g => g.name === '기타')?.n ?? null, status: raw.marketStatus ?? null,
    label: avgStrong != null && avgStrong < 0 ? '덜 내린 7' : '강한 7', strong, weak,
    breadth: {up: sum('up'), down: sum('down'), flat: sum('flat'), n: sum('n')},
    bias: {strong365: strong.reduce((t, g) => t + g.in365, 0), weak365: weak.reduce((t, g) => t + g.in365, 0)}};
}
/** 미국 — 마지막 장 · 60거래일 가장 낮음 ~ 높음 자리 */
export function usPiece(raws) {
  const rows = [];
  for (const [key, sym, name, , raw] of raws) {
    if (!Array.isArray(raw) || !raw.length) { rows.push({key, sym, name, close: null, chg: null, date: null, lo: null, hi: null}); continue; }
    const cl = raw.map(r => num(r.closePrice)).filter(v => v > 0);
    rows.push({key, sym, name, close: num(raw[0].closePrice), chg: num(raw[0].fluctuationsRatio), date: String(raw[0].localTradedAt ?? '').slice(0, 10) || null, lo: cl.length ? Math.min(...cl) : null, hi: cl.length ? Math.max(...cl) : null, n: cl.length});
  }
  if (!rows.some(r => r.close != null)) return null;
  const idx = rows.filter(r => r.key !== 'VIX' && r.chg != null), dates = rows.map(r => r.date).filter(Boolean).sort();
  return {date: dates.at(-1) ?? null, rows, up: idx.filter(r => r.chg > 0).length, n: idx.length};
}
/** 365곳 오늘(선의 마지막 두 칸) · 많이 오른 차례 */
export function s365Piece(core, lines, comp) {
  const list = [];
  for (const [c, L] of Object.entries(lines)) { const a = L.at(-2), b = L.at(-1); if (a == null || b == null || !a || !comp[c]) continue; list.push([c, r2((b / a - 1) * 100)]); }
  list.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const up = list.filter(x => x[1] > 0).length, down = list.filter(x => x[1] < 0).length;
  const end = x => (x ? {c: x[0], n: comp[x[0]].name, chg: x[1]} : null);
  return {date: core.asOf, prev: core.dates?.at(-2) ?? null, n: Object.keys(lines).length, up, down, flat: list.length - up - down, none: Object.keys(lines).length - list.length, list, top: end(list[0]), bot: end(list.at(-1))};
}

export function buildHome({dataDir, rawDir = null, prev = null, now = new Date(), fetchedAt = null}) {
  const J = f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const core = J('core.json'), lines = J('lines.json').lines, comp = J('comp.json').companies;
  const kst = new Date((fetchedAt ? Date.parse(fetchedAt) : now.getTime()) + 9 * 36e5).toISOString();
  // 장 중 = 서울 정규장 9:00 ~ 15:30 사이에 받았고 네이버 업종 장 상태도 「OPEN」(home-v2 · 2026-10-12 16:04 회차에서 찾음: 15:30 뒤에도 네이버는 시간외 · 저녁 장 때문에 「OPEN」 —
  //   그대로 쓰면 장이 끝난 뒤에도 첫 화면이 「장 중」이라 적음 · 지수 종가는 15:30에 정해짐) · 업종을 못 받았으면 시각과 지수 날짜로만
  const ind = readRaw(rawDir, 'industry.json'), hm = kst.slice(11, 16), live0 = hm >= HOME_RULE.open && hm < HOME_RULE.close && (ind ? ind.marketStatus === 'OPEN' : true);
  const opt = {months: HOME_RULE.months, base: core.base, asOf: core.asOf, live: live0, today: kst.slice(0, 10)};
  const got = {
    idx: (() => { const k = indexPiece(readRaw(rawDir, 'kospi-day.json'), '코스피', opt), q = indexPiece(readRaw(rawDir, 'kosdaq-day.json'), '코스닥', opt); return k || q ? {KOSPI: k, KOSDAQ: q} : null; })(),
    flows: (() => { const k = flowPiece(readRaw(rawDir, 'kospi-trend.json')), q = flowPiece(readRaw(rawDir, 'kosdaq-trend.json')); return k || q ? {KOSPI: k, KOSDAQ: q, live: false} : null; })(),
    sectors: sectorPiece(ind, comp),
    us: usPiece(US.map(([key, sym, name, f]) => [key, sym, name, f, readRaw(rawDir, f)])),
  };
  const live = live0 && (got.idx ? !!(got.idx.KOSPI?.live || got.idx.KOSDAQ?.live) : !!ind); // 지수 마지막 날이 오늘이어야(쉬는 날 · 장 열기 전은 장 중 아님)
  if (got.sectors) got.sectors.date = got.idx?.KOSPI?.date ?? got.idx?.KOSDAQ?.date ?? null; // 업종 · 시장 오르내림 값의 날 = 같이 받은 지수의 마지막 날(업종 원문에는 날짜 칸이 없음 · CIA팀 2026-10-12 18:31 — 화면 「오늘 업종」을 보는 날짜로 셈)
  if (got.flows) got.flows.live = live;
  const out = {schema: 'atlas-new-home-1', rule: HOME_RULE.id, made: now.toISOString(), kst: kst.slice(0, 16).replace('T', ' '), live, asOf: core.asOf, base: core.base, days: core.days, stale: {}, errors: []};
  // 못 받은 조각 = 앞 자료의 같은 조각(앞 회차 값 꼬리표) · 그것도 없으면 null
  for (const k of ['idx', 'flows', 'sectors', 'us']) {
    if (got[k]) { out[k] = got[k]; continue; }
    out.errors.push(k + ' 못 받음');
    if (prev?.[k]) { out[k] = prev[k]; out.stale[k] = prev.stale?.[k] ?? prev.kst ?? null; } else out[k] = null;
  }
  // 업종의 「365곳 n곳」 · 치우침은 늘 이번 회차 365곳으로 다시 셈(앞 회차 업종 조각을 쓸 때도 — 네 눈 점검 구글 눈이 잡은 것 2026-10-12)
  if (out.sectors) { const cnt = {}; for (const c of Object.values(comp)) cnt[c.sector] = (cnt[c.sector] ?? 0) + 1;
    const re = g => ({...g, in365: cnt[g.name] ?? 0}); out.sectors = {...out.sectors, strong: out.sectors.strong.map(re), weak: out.sectors.weak.map(re)};
    out.sectors.bias = {strong365: out.sectors.strong.reduce((t, g) => t + g.in365, 0), weak365: out.sectors.weak.reduce((t, g) => t + g.in365, 0)}; }
  // 20거래일 견줌 — 지수는 앞 조각을 썼으면 기준일이 다를 수 있어 그 회차의 20거래일 값을 그대로(같은 기준일일 때만)
  out.s365 = s365Piece(core, lines, comp);
  const i20 = k => { const x = out.idx?.[k]; if (!x) return null; if (out.stale.idx) return null; return x.chg20; };
  out.cmp20 = {base: core.base, asOf: core.asOf, kospi: i20('KOSPI'), kosdaq: i20('KOSDAQ'), eq: core.all.chg, cw: core.all.cwChg};
  // 미리 정한 문턱을 넘으면 「!」(금빛 · 조심) — 지난 사실만
  const alerts = [];
  for (const k of ['KOSPI', 'KOSDAQ']) { const x = out.idx?.[k]; if (x?.day != null && Math.abs(x.day) >= HOME_RULE.alertIdx && !out.stale.idx) alerts.push({kind: 'idx', key: k, name: x.name, v: x.day}); }
  for (const k of ['KOSPI', 'KOSDAQ']) { const f = out.flows?.[k]?.foreign; if (f != null && Math.abs(f) >= HOME_RULE.alertFlow && !out.stale.flows) alerts.push({kind: 'flow', key: k, name: k === 'KOSPI' ? '코스피' : '코스닥', v: f}); }
  out.alerts = alerts;
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
  const dataDir = path.resolve(arg('--data', 'site/atlas/data')), raw = arg('--raw', '') || null, prevF = arg('--prev', '') || null, outF = path.resolve(arg('--out', path.join(dataDir, 'home.json')));
  let prev = null; if (prevF) { try { prev = JSON.parse(fs.readFileSync(prevF, 'utf8')); } catch { prev = null; } }
  let fetchedAt = null; if (raw) { try { fetchedAt = JSON.parse(fs.readFileSync(path.join(raw, 'summary.json'), 'utf8')).map(x => x.fetchedAt).filter(Boolean).sort().at(-1) ?? null; } catch { /* 없음 */ } }
  const home = buildHome({dataDir, rawDir: raw && path.resolve(raw), prev, now: new Date(arg('--now', new Date().toISOString())), fetchedAt});
  fs.writeFileSync(outF, JSON.stringify(home) + '\n');
  console.log(JSON.stringify({ok: true, kst: home.kst, live: home.live, idx: !!home.idx, flows: !!home.flows, sectors: !!home.sectors, us: !!home.us, stale: home.stale, errors: home.errors, alerts: home.alerts.length}));
}
