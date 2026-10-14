// 새 ATLAS 바탕 365곳(t365-v1) ① 모음 → 후보 표 — 사장님 2026-10-10 23:18 「우리나라 대표 우량주365개 … 2026 트랜드 주식과 2027년 트랜드가 될 주식만 어떤 기준을 세워 먼저 축출」
//   쓰는 법: node scripts/atlas11/t365/dump.mjs <모음 bundle.json.gz> <후보 표 json> [기준일 YYYY-MM-DD] — 받은 원문을 풀기만(네트워크 없음 · 고르는 셈은 select.py)
import fs from 'node:fs';
import zlib from 'node:zlib';
import {candidatesFromBundle} from '../collect_universe.mjs';
import {parseFinanceJson, parseCopAnalysisHtml, notCommon, parseIntegration, kindOf, KIND_NAME} from '../../../lib/atlas11/universe.mjs';
const [,, bundlePath, out, asOfArg] = process.argv;
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(bundlePath)).toString('utf8'));
const input = JSON.parse(fs.readFileSync(new URL('../../../public/data/input.json', import.meta.url), 'utf8'));
const sessions = input.calendar.sessions, asOf = asOfArg ?? '2026-10-02'; // 모음 날(10월 5일 아침) 앞 마지막 거래일
const cands = candidatesFromBundle(bundle, {sessions, asOf, input});
const rowsOf = (fin, names) => { if (!fin) return null; for (const n of names) { const k = Object.keys(fin.rows).find(x => x === n) ?? Object.keys(fin.rows).find(x => x.startsWith(n)); if (k) return fin.rows[k]; } return null; };
const res = cands.map(c => {
  const s = bundle.stocks[c.code]; let fin = null;
  try { fin = s.finance?.text ? (s.finance.kind === 'json' ? parseFinanceJson(s.finance.text) : parseCopAnalysisHtml(s.finance.text)) : null; } catch {}
  const per = fin ? fin.periods : [];
  const pick = names => { const r = rowsOf(fin, names); return r ? Object.fromEntries(per.map(p => [p.title + (p.consensus ? 'E' : ''), r[p.key] ?? null])) : null; };
  const rows = (c._rows ?? []).filter(r => r.date <= asOf && r.close > 0);
  const n = rows.length, last = rows.at(-1);
  const at = k => (n > k ? rows[n - 1 - k] : null);
  const ret = k => { const a = at(k); return a && last ? last.close / a.close - 1 : null; };
  const tv60 = rows.slice(-60).map(r => r.close * r.volume); const atv = tv60.length ? tv60.reduce((a, b) => a + b, 0) / tv60.length / 1e8 : null; // 억원
  let peak = 0, mdd = 0; for (const r of rows.slice(-252)) { peak = Math.max(peak, r.close); mdd = Math.min(mdd, r.close / peak - 1); }
  const hi252 = Math.max(...rows.slice(-252).map(r => r.close));
  return {code: c.code, name: c.name, market: c.market, endType: c.endType, notCommon: notCommon(c.code, c.name), sector: c.sector, ksic: c.ksic, products: c.products,
    capRank: c.capRank, capEok: c.marketCapEok, per: c.per, pbr: c.pbr, metrics: c.metrics, financeSource: c.financeSource,
    fin: {periods: per.map(p => p.title + (p.consensus ? 'E' : '')), rev: pick(['매출액', '영업수익']), op: pick(['영업이익']), net: pick(['당기순이익', '지배주주순이익', '순이익']), roe: pick(['ROE']), debt: pick(['부채비율'])},
    px: {n, last: last?.date ?? null, close: last?.close ?? null, r1y: ret(252), r6m: ret(126), r3m: ret(63), r1m: ret(21), r1yskip: n > 252 ? at(20).close / at(252).close - 1 : null, mdd1y: n >= 60 ? mdd : null, offHigh: last && isFinite(hi252) ? last.close / hi252 - 1 : null, atvEok: atv},
    histOk: c.history?.ok ?? false};
});
// 목록에 오른 것 모두(모음 every — 사장님 2026-10-14 11:02(싱가포르) 「이거 다 올려」): 보통주 후보가 아닌 것(펀드 · 증권 · 우선주 · 스팩 · 리츠 · 요약을 못 받은 곳)도
//   후보 표에 「보통주 아님」(notCommon) 줄로 더함 — 두 조건 모두 「모름」 · 찾기 이름표에 나옴 · 결산 · 일봉 없음 · 옛 모음(every 아님)은 그대로
if (bundle.every) {
  const have = new Set(res.map(r => r.code)), none = {n: 0, last: null, close: null, r1y: null, r6m: null, r3m: null, r1m: null, r1yskip: null, mdd1y: null, offHigh: null, atvEok: null};
  for (const [code, s] of Object.entries(bundle.stocks).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (have.has(code)) continue;
    let integ = null; try { integ = s.integration?.text ? parseIntegration(s.integration.text) : null; } catch { integ = null; }
    const name = integ?.name ?? s.list?.name ?? code, endType = s.list?.endType ?? integ?.endType ?? null, kind = kindOf(code, name, endType) ?? 'nodata';
    res.push({code, name, market: s.list?.market ?? null, endType, notCommon: true, kind, kindName: KIND_NAME[kind] ?? '자료 모자람', sector: null, ksic: null, products: null,
      capRank: null, capEok: integ?.marketCapEok > 0 ? integ.marketCapEok : null, per: null, pbr: null, metrics: null, financeSource: null,
      fin: {periods: [], rev: null, op: null, net: null, roe: null, debt: null}, px: {...none}, histOk: false});
  }
}
fs.writeFileSync(out, JSON.stringify({asOf, collectedAt: bundle.collectedAt, n: res.length, ...(bundle.every ? {every: true} : {}), rows: res}));
console.log(res.length, res.filter(r => r.fin.op).length, res.filter(r => (r.fin.periods || []).some(p => p.endsWith('E'))).length);
