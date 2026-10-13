// 멍거 조건(mg-v1) 따로 세기 — munger.py 와 코드를 나누지 않고 노드로 처음부터 다시 셈 · 하나라도 다르면 1 로 끝남
//   사장님 2026-10-13 23:34(서울) 「철저하게 찰리 망거 조건만 해」 · 2026-10-14 00:03 「가 로 하자」(빚이 자기 돈보다 적으면 통과)
//   쓰는 법: node scripts/atlas11/t365/munger_verify.mjs <now.json(dump.mjs)> <proposal.json> [<결과 json>]
//   보는 것: 고른 곳(차례까지) · 밖 회사마다 멈춘 자리(모름 · ① · ② · ③) · 셈(모름 · ① · ② · ③ · 고른 수) · 회사마다 3해 값
import fs from 'node:fs';
const [, , NOWF, PROF, OUTF] = process.argv;
if (!NOWF || !PROF) { console.error('쓰는 법: munger_verify.mjs <now.json> <proposal.json> [<결과 json>]'); process.exit(2); }
const N = JSON.parse(fs.readFileSync(NOWF, 'utf8')), P = JSON.parse(fs.readFileSync(PROF, 'utf8'));
const FIN = new Set(['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자']); // rules.py FIN 과 같은 글(따로 적음)
const fin = r => FIN.has(String(r.sector ?? '').replaceAll(' ', ''));
const DEBT = 100, ROE = 18, bad = [];
const st = {}, cnt = {q: 0, loss: 0, debt: 0, roe: 0}, ins = [];
for (const r of N.rows) {
  if (r.notCommon) { st[r.code] = 'q'; cnt.q++; continue; }
  const ps = (r.fin?.periods ?? []).filter(p => !String(p).endsWith('E')).slice(-3);
  const g = (k, p) => r.fin?.[k]?.[p];
  if (ps.length < 3) { st[r.code] = 'q'; cnt.q++; continue; }
  const net = ps.map(p => g('net', p)), op = ps.map(p => g('op', p)), roe = ps.map(p => g('roe', p)), debt = ps.map(p => g('debt', p));
  if ([...net, ...roe, ...debt].some(x => x == null) || (!fin(r) && op.some(x => x == null))) { st[r.code] = 'q'; cnt.q++; continue; }
  if (net.some(x => !(x > 0)) || (!fin(r) && op.some(x => !(x > 0)))) { st[r.code] = 'loss'; cnt.loss++; continue; }
  if (Math.max(...debt) > DEBT) { st[r.code] = 'debt'; cnt.debt++; continue; }
  if (Math.min(...roe) < ROE) { st[r.code] = 'roe'; cnt.roe++; continue; }
  st[r.code] = 'in'; ins.push({code: r.code, minRoe: Math.min(...roe), roe, debt, years: ps});
}
ins.sort((a, b) => b.minRoe - a.minRoe || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
const mine = ins.map(x => x.code), theirs = P.picked.map(p => p.code);
if (P.rules?.version !== 'mg-v1') bad.push(`판 이름 ${P.rules?.version} ≠ mg-v1`);
if (mine.join(',') !== theirs.join(',')) bad.push(`고른 곳(차례)이 다름: 노드 ${mine.length}곳 · 파이썬 ${theirs.length}곳`);
for (const o of P.outside) if (st[o.code] !== o.s) bad.push(`${o.code} ${o.name} 멈춘 자리 노드 ${st[o.code]} ≠ 파이썬 ${o.s}`);
const C = P.counts, known = N.rows.length - cnt.q, s1 = known - cnt.loss, s2 = s1 - cnt.debt;
for (const [k, a, b] of [['후보', N.rows.length, C.universe], ['모름', cnt.q, C.q], ['①', s1, C.s1], ['②', s2, C.s2], ['고른 수', ins.length, C.picked], ['① 빠짐', cnt.loss, C.loss], ['② 빠짐', cnt.debt, C.debt], ['③ 빠짐', cnt.roe, C.roe]])
  if (a !== b) bad.push(`${k} 노드 ${a} ≠ 파이썬 ${b}`);
const byc = Object.fromEntries(ins.map(x => [x.code, x]));
for (const p of P.picked) {
  const x = byc[p.code]; if (!x) continue;
  if (x.years.join() !== p.years.join() || x.roe.some((v, i) => Math.abs(v - p.roe[i]) > 1e-9) || x.debt.some((v, i) => Math.abs(v - p.debt[i]) > 1e-9)) bad.push(`${p.code} ${p.name} 3해 값이 다름`);
}
const out = {schema: 'atlas11-munger-verify-1', at: new Date().toISOString(), version: 'mg-v1', picked: ins.length, q: cnt.q, s1, s2, fails: bad.length, bad: bad.slice(0, 20)};
if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(out, null, 1) + '\n');
console.log(`멍거 조건 따로 세기 — 고른 곳 ${ins.length} · 모름 ${cnt.q} · ① ${s1} · ② ${s2} · 틀림 ${bad.length}`);
if (bad.length) { for (const b of bad.slice(0, 10)) console.error('틀림: ' + b); process.exit(1); }
