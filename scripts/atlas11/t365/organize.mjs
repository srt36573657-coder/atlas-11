// 새 ATLAS 바탕 365곳(t365-v1) ④ 업종 정리 — 사장님 2026-10-10 23:36 「365개를 업종별로 정리 정돈 한다」
//   쓰는 법: node scripts/atlas11/t365/organize.mjs <후보 표 json(dump.mjs)> <proposal.json> <기록 폴더>
//   큰 갈래(groups.json) → 업종(ATLAS 업종 이름 · group365Of) → 회사(시가총액 큰 순) · 빠진 업종이 있으면 멈춤(지어내지 않음)
import fs from 'node:fs';
import path from 'node:path';
import {group365Of} from '../../../lib/atlas11/universe.mjs';
const [,, candsPath, propPath, outDir] = process.argv;
const C = JSON.parse(fs.readFileSync(candsPath, 'utf8')).rows, P = JSON.parse(fs.readFileSync(propPath, 'utf8'));
const G = JSON.parse(fs.readFileSync(new URL('./groups.json', import.meta.url), 'utf8')).groups;
const by = new Map(C.map(c => [c.code, c])), gOf = new Map(G.flatMap(g => g.industries.map(i => [i, g.id])));
const rows = P.picked.map(p => { const c = by.get(p.code); return {...p, industry: group365Of({sector: c?.sector, ksic: c?.ksic})}; });
const lost = [...new Set(rows.filter(r => !gOf.has(r.industry)).map(r => r.industry))];
if (lost.length) { console.error('큰 갈래에 없는 업종:', lost.join(' · ')); process.exit(1); }
const groups = G.map(g => {
  const inds = g.industries.map(name => { const cs = rows.filter(r => r.industry === name).sort((a, b) => b.capEok - a.capEok || a.code.localeCompare(b.code));
    return {name, n: cs.length, capEok: cs.reduce((t, r) => t + r.capEok, 0), t26: cs.filter(r => r.t26).length, t27: cs.filter(r => r.t27).length,
      companies: cs.map(r => ({code: r.code, name: r.name, market: r.market, capEok: r.capEok, r1y: r.r1y, t26: r.t26, t27: r.t27, theme: r.theme, why: r.why}))}; }).filter(i => i.n)
    .sort((a, b) => b.n - a.n || b.capEok - a.capEok);
  const n = inds.reduce((t, i) => t + i.n, 0);
  return {id: g.id, name: g.name, say: g.say, n, capEok: inds.reduce((t, i) => t + i.capEok, 0), t26: inds.reduce((t, i) => t + i.t26, 0), t27: inds.reduce((t, i) => t + i.t27, 0), industries: inds};
}).filter(g => g.n).sort((a, b) => b.n - a.n || b.capEok - a.capEok);
const total = groups.reduce((t, g) => t + g.n, 0);
if (total !== rows.length) { console.error('합이 안 맞음', total, rows.length); process.exit(1); }
const out = {schema: 'atlas11-t365-by-industry-1', made: new Date().toISOString(), from: path.basename(path.dirname(propPath)) + '/proposal.json', rules: P.rules.version,
  order: '큰 갈래 = 회사 수 많은 순(같으면 시가총액 합 큰 순) · 업종 = 회사 수 많은 순 · 회사 = 시가총액 큰 순', counts: {companies: total, groups: groups.length, industries: groups.reduce((t, g) => t + g.industries.length, 0)}, groups};
fs.writeFileSync(path.join(outDir, 'by-industry.json'), JSON.stringify(out, null, 1));
const csv = [['큰 갈래', '업종', '차례', '종목코드', '회사', '시장', '시가총액(억 원)', '1년 주가(%)', '2026 흐름', '2027 흐름', '까닭'].join(',')];
for (const g of groups) for (const i of g.industries) i.companies.forEach((c, k) => csv.push([g.name, i.name, k + 1, c.code, c.name, c.market, c.capEok, c.r1y == null ? '' : (c.r1y * 100).toFixed(1), c.t26 ? 'O' : '', c.t27 ? 'O' : '', `"${String(c.why).replace(/"/g, '""')}"`].join(',')));
fs.writeFileSync(path.join(outDir, 'by-industry.csv'), '﻿' + csv.join('\n') + '\n');
console.log(JSON.stringify(out.counts), groups.map(g => `${g.name} ${g.n}곳(업종 ${g.industries.length})`).join(' / '));
