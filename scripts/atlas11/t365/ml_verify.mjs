// 멍거 · 린치 조건(ml-v1) 따로 세기 — ml.py · munger.py · lynch.py 와 코드를 나누지 않고 노드로 처음부터 다시 셈 · 하나라도 다르면 1 로 끝남
//   사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」 · 06:03 「가」 · 06:05 「가」(멍거 26곳과 린치 18곳을 함께 · 겹치면 한 번)
//   쓰는 법: node scripts/atlas11/t365/ml_verify.mjs <now.json(dump.mjs)> <proposal.json> [<결과 json>]   (모음은 universe.json bundle)
//   보는 것: 고른 곳(차례 · 꼬리표까지) · 밖 회사마다 두 갈래 멈춘 자리 · 두 갈래 셈 · 회사마다 멍거 3해 값 · 린치 EPS · 성장 · 값 점수
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const [, , NOWF, PROF, OUTF] = process.argv;
if (!NOWF || !PROF) { console.error('쓰는 법: ml_verify.mjs <now.json> <proposal.json> [<결과 json>]'); process.exit(2); }
const N = JSON.parse(fs.readFileSync(NOWF, 'utf8')), P = JSON.parse(fs.readFileSync(PROF, 'utf8'));
const ACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8'));
const B = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, process.env.ATLAS_BUNDLE || ACT.bundle))).toString('utf8')); // 시험은 ATLAS_BUNDLE 로 옛 모음 고정
const bad = [];
// ── 멍거 갈래(munger_verify.mjs 와 같은 뜻 · 따로 적음) ──
const FIN = new Set(['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자']);
const fin = r => FIN.has(String(r.sector ?? '').replaceAll(' ', ''));
const mst = {}, mcnt = {q: 0, loss: 0, debt: 0, roe: 0}, mins = [];
for (const r of N.rows) {
  if (r.notCommon) { mst[r.code] = 'q'; mcnt.q++; continue; }
  const ps = (r.fin?.periods ?? []).filter(p => !String(p).endsWith('E')).slice(-3);
  const g = (k, p) => r.fin?.[k]?.[p];
  if (ps.length < 3) { mst[r.code] = 'q'; mcnt.q++; continue; }
  const net = ps.map(p => g('net', p)), op = ps.map(p => g('op', p)), roe = ps.map(p => g('roe', p)), debt = ps.map(p => g('debt', p));
  if ([...net, ...roe, ...debt].some(x => x == null) || (!fin(r) && op.some(x => x == null))) { mst[r.code] = 'q'; mcnt.q++; continue; }
  if (net.some(x => !(x > 0)) || (!fin(r) && op.some(x => !(x > 0)))) { mst[r.code] = 'loss'; mcnt.loss++; continue; }
  if (Math.max(...debt) > 100) { mst[r.code] = 'debt'; mcnt.debt++; continue; }
  if (Math.min(...roe) < 18) { mst[r.code] = 'roe'; mcnt.roe++; continue; }
  mst[r.code] = 'in'; mins.push({code: r.code, minRoe: Math.min(...roe), roe, debt, years: ps});
}
mins.sort((a, b) => b.minRoe - a.minRoe || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
// ── 린치 갈래 — 모음의 네이버 연간 표(EPS · 주당배당금) · 모음 날까지 마지막 종가 · 후보 표 PER ──
const num = s => { if (s == null) return null; const t = String(s).replace(/,/g, '').trim(); if (!t || t === '-' || t === 'N/A') return null; const v = Number(t); return Number.isFinite(v) ? v : null; };
const a8 = N.asOf.replaceAll('-', '');
const lst = {}, lcnt = {q: 0, loss: 0, g: 0, peg: 0}, lins = [];
for (const r of N.rows) {
  if (r.notCommon) { lst[r.code] = 'q'; lcnt.q++; continue; }
  const s = B.stocks?.[r.code];
  let keys = [], eps = [], dps = [];
  try { const t = JSON.parse(s.finance.text).financeInfo; keys = t.trTitleList.filter(x => x.isConsensus === 'N').map(x => x.key).slice(-3);
    const row = ttl => t.rowList.find(x => x.title === ttl)?.columns ?? {}; eps = keys.map(k => num(row('EPS')[k]?.value)); dps = keys.map(k => num(row('주당배당금')[k]?.value)); } catch { keys = []; }
  const cl = (s?.fchart?.rows ?? []).filter(x => x[0] <= a8 && x[4] > 0), px = cl.length ? cl.at(-1)[4] : null;
  if (keys.length < 3) { lst[r.code] = 'q'; lcnt.q++; continue; }
  const [e0, , e2] = eps;
  if (e0 == null || e2 == null || px == null) { lst[r.code] = 'q'; lcnt.q++; continue; }
  if (!(e0 > 0) || !(e2 > 0)) { lst[r.code] = 'loss'; lcnt.loss++; continue; }
  const gr = (Math.sqrt(e2 / e0) - 1) * 100;
  if (gr < 20 || gr > 25) { lst[r.code] = 'g'; lcnt.g++; continue; }
  if (r.per == null || !(r.per > 0)) { lst[r.code] = 'q'; lcnt.q++; continue; }
  const sc = (gr + (dps[2] ?? 0) / px * 100) / r.per;
  if (sc < 2) { lst[r.code] = 'peg'; lcnt.peg++; continue; }
  lst[r.code] = 'in'; lins.push({code: r.code, g: gr, score: sc, eps: [e0, e2], years: [keys[0].slice(0, 4), keys[2].slice(0, 4)]});
}
// ── 합치기 ──
const mset = new Set(mins.map(x => x.code));
const order = [...mins.map(x => x.code), ...lins.filter(x => !mset.has(x.code)).sort((a, b) => b.score - a.score || (a.code < b.code ? -1 : 1)).map(x => x.code)];
const theirs = P.picked.map(p => p.code);
if (P.rules?.version !== 'ml-v1') bad.push(`판 이름 ${P.rules?.version} ≠ ml-v1`);
if (order.join(',') !== theirs.join(',')) bad.push(`고른 곳(차례)이 다름: 노드 ${order.length}곳 · 파이썬 ${theirs.length}곳`);
const lset = new Set(lins.map(x => x.code));
for (const p of P.picked) {
  const tags = [mset.has(p.code) ? 'mg' : null, lset.has(p.code) ? 'ly' : null].filter(Boolean);
  if (tags.join() !== (p.tags ?? []).join()) bad.push(`${p.code} ${p.name} 꼬리표 노드 ${tags} ≠ 파이썬 ${p.tags}`);
}
for (const o of P.outside) {
  if (mst[o.code] !== o.mg?.s) bad.push(`${o.code} ${o.name} 멍거 멈춘 자리 노드 ${mst[o.code]} ≠ 파이썬 ${o.mg?.s}`);
  if (lst[o.code] !== o.ly?.s) bad.push(`${o.code} ${o.name} 린치 멈춘 자리 노드 ${lst[o.code]} ≠ 파이썬 ${o.ly?.s}`);
  const u = mst[o.code] === 'q' && lst[o.code] === 'q' ? 'q' : 'out';
  if (u !== o.s) bad.push(`${o.code} ${o.name} 밖 표시 노드 ${u} ≠ 파이썬 ${o.s}`);
}
const C = P.counts, U = N.rows.length;
const mk = U - mcnt.q, s1 = mk - mcnt.loss, s2 = s1 - mcnt.debt, lk = U - lcnt.q, l0 = lk - lcnt.loss, l1 = l0 - lcnt.g;
const both = lins.filter(x => mset.has(x.code)).length;
for (const [k, a, b] of [['후보', U, C.universe], ['고른 수', order.length, C.picked], ['둘 다', both, C.both],
  ['멍거 모름', mcnt.q, C.mg?.q], ['멍거 ①', s1, C.mg?.s1], ['멍거 ②', s2, C.mg?.s2], ['멍거 고른 수', mins.length, C.mg?.picked],
  ['린치 모름', lcnt.q, C.ly?.q], ['린치 성장 셈', l0, C.ly?.l0], ['린치 ①', l1, C.ly?.l1], ['린치 고른 수', lins.length, C.ly?.picked]])
  if (a !== b) bad.push(`${k} 노드 ${a} ≠ 파이썬 ${b}`);
const mb = Object.fromEntries(mins.map(x => [x.code, x])), lb = Object.fromEntries(lins.map(x => [x.code, x]));
const near = (a, b) => a != null && b != null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a));
for (const p of P.picked) {
  const m = mb[p.code], l = lb[p.code];
  if (m && (!p.mg || m.years.join() !== p.mg.years.join() || m.roe.some((v, i) => !near(v, p.mg.roe[i])) || m.debt.some((v, i) => !near(v, p.mg.debt[i])))) bad.push(`${p.code} ${p.name} 멍거 3해 값이 다름`);
  if (!m && p.mg) bad.push(`${p.code} ${p.name} 멍거 값이 있으면 안 됨`);
  if (l && (!p.ly || l.years.join() !== p.ly.years.join() || !near(l.g, p.ly.g) || !near(l.score, p.ly.score) || l.eps.some((v, i) => !near(v, p.ly.eps[i])))) bad.push(`${p.code} ${p.name} 린치 값이 다름`);
  if (!l && p.ly) bad.push(`${p.code} ${p.name} 린치 값이 있으면 안 됨`);
}
const out = {schema: 'atlas11-ml-verify-1', at: new Date().toISOString(), version: 'ml-v1', picked: order.length, mg: mins.length, ly: lins.length, both, mq: mcnt.q, lq: lcnt.q, fails: bad.length, bad: bad.slice(0, 20)};
if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(out, null, 1) + '\n');
console.log(`멍거 · 린치 조건 따로 세기 — 고른 곳 ${order.length} · 멍거 ${mins.length} · 린치 ${lins.length} · 둘 다 ${both} · 틀림 ${bad.length}`);
if (bad.length) { for (const b of bad.slice(0, 10)) console.error('틀림: ' + b); process.exit(1); }
