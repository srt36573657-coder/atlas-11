// 새 ATLAS 바탕 365곳(t365-v1) ⑤ 업종 지수 + 회사마다 3개월 선(23:52 「각종목들 … 한곳에」) — 사장님 2026-10-10 23:40 「정리 정돈한 업종을 각각에 지수화 · 지난 3개월 데이타를 수집하여 업종 주가 그래프를 업종마다 다 만들어」
//   쓰는 법: node scripts/atlas11/t365/index.mjs <모음 bundle.json.gz> <by-industry.json> <결과 json> [기준일 YYYY-MM-DD]
//   셈(ATLAS 날씨 · cand.mjs weatherOf 와 같은 방법): 3개월(63거래일) 전 종가 = 100 · 날마다 (그날 종가 ÷ 앞 거래일 종가 − 1)을 두 값이 다 있는 회사끼리
//   같은 무게로 평균(하루 ±50% 넘는 값은 자료 오류로 보고 뺌)해 이어 곱함 · 그날 값이 있는 회사가 하나도 없으면 그날은 그대로(0%)로 두고 셈 · 가격수익률(배당 빼고)
import fs from 'node:fs';
import zlib from 'node:zlib';
const [,, bundlePath, indPath, outPath, asOfArg] = process.argv;
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(bundlePath)).toString('utf8'));
const IND = JSON.parse(fs.readFileSync(indPath, 'utf8'));
const cal = JSON.parse(fs.readFileSync(new URL('../../../public/data/input.json', import.meta.url), 'utf8')).calendar.sessions;
const px = new Map(); // code → Map(date → close)
for (const g of IND.groups) for (const i of g.industries) for (const c of i.companies) {
  const rows = bundle.stocks[c.code]?.fchart?.rows ?? [];
  px.set(c.code, new Map(rows.map(([d, , , , close]) => [`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, close]).filter(([, v]) => v > 0)));
}
const lastData = [...px.values()].reduce((m, mp) => { for (const d of mp.keys()) if (d > m) m = d; return m; }, '');
const asOf = asOfArg ?? lastData;
const ses = cal.filter(d => d <= asOf), W = ses.slice(-64); // 기준일 + 63거래일
const at = (code, d) => px.get(code)?.get(d) ?? null;
function indexOf(codes) {
  let lvl = 100, thin = 0; const series = [{d: W[0], v: 100, n: codes.filter(c => at(c, W[0])).length}];
  for (let k = 1; k < W.length; k++) {
    let s = 0, n = 0;
    for (const c of codes) { const a = at(c, W[k - 1]), b = at(c, W[k]); if (a && b) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s += r; n++; } } }
    if (n) lvl *= 1 + s / n; else thin++;
    series.push({d: W[k], v: Math.round(lvl * 100) / 100, n});
  }
  let peak = -Infinity, mdd = 0; for (const p of series) { peak = Math.max(peak, p.v); mdd = Math.min(mdd, p.v / peak - 1); }
  const mem = codes.map(c => ({code: c, r: at(c, W[0]) && at(c, W.at(-1)) ? at(c, W.at(-1)) / at(c, W[0]) - 1 : null})).filter(m => m.r != null).sort((a, b) => b.r - a.r);
  return {series, chg: series.at(-1).v / 100 - 1, mdd, thinDays: thin, best: mem[0] ?? null, worst: mem.at(-1) ?? null, priced: mem.length};
}
/** 회사 하나의 3개월 선 — 기준일 종가 = 100 · 그날 종가가 없으면 null(지어내지 않음) · 기준일 값이 없으면 창 안 첫 종가 = 100(start 에 그 날짜) */
function memberLine(code) {
  const k0 = W.findIndex(d => at(code, d)); if (k0 < 0) return {code, v: W.map(() => null), chg: null, start: null};
  const b = at(code, W[k0]), v = W.map((d, k) => (k < k0 || !at(code, d) ? null : Math.round(at(code, d) / b * 10000) / 100));
  const last = [...v].reverse().find(x => x != null);
  return {code, v, chg: last != null ? last / 100 - 1 : null, start: W[k0]};
}
const nameOf = new Map(IND.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => [c.code, c.name]))));
const nm = m => m ? {...m, name: nameOf.get(m.code)} : null;
const groups = IND.groups.map(g => {
  const all = g.industries.flatMap(i => i.companies.map(c => c.code)), gi = indexOf(all);
  return {id: g.id, name: g.name, n: all.length, ...gi, best: nm(gi.best), worst: nm(gi.worst),
    industries: g.industries.map(i => { const codes = i.companies.map(c => c.code), ii = indexOf(codes); return {name: i.name, n: codes.length, ...ii, best: nm(ii.best), worst: nm(ii.worst), members: codes.map(c => ({...memberLine(c), name: nameOf.get(c)})).sort((a, b) => (b.chg ?? -9) - (a.chg ?? -9))}; })};
});
const allCodes = IND.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => c.code))), whole = indexOf(allCodes);
const out = {schema: 'atlas11-t365-industry-index-1', made: new Date().toISOString(), bundle: bundlePath.replace(/^.*reports\//, 'reports/'), collectedAt: bundle.collectedAt ?? null,
  asOf, base: W[0], days: W.length - 1, lastData, method: '3개월(63거래일) 전 종가 = 100 · 같은 무게 날마다 평균 이어 곱하기(ATLAS 날씨와 같은 셈) · 하루 ±50% 넘는 값은 뺌 · 가격수익률(배당 빼고) · 수정주가 확인 안 됨',
  all: {n: allCodes.length, ...whole, best: nm(whole.best), worst: nm(whole.worst)}, groups};
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({asOf, base: W[0], days: W.length - 1, all: Math.round(whole.chg * 1000) / 10}), groups.map(g => `${g.name} ${(g.chg * 100).toFixed(1)}%`).join(' / '));
