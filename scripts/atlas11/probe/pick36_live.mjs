// 탐침 — 올라간 사이트의 36곳 자료(pick36.json)를 받아 몇 곳인지 · 왜 그런지 셈(사장님 2026-10-13 04:28 「36 거기 너 계산 하지 않네 18」)
import fs from 'node:fs/promises';
const B = 'https://aaa7377.com/atlas/data/', dir = 'reports/atlas11/probe/pick36-live'; await fs.mkdir(dir, {recursive: true});
const get = async f => JSON.parse(Buffer.from(await (await fetch(B + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).arrayBuffer()).toString('utf8'));
const out = {made: new Date().toISOString()};
try {
  const p = await get('pick36.json'), c = await get('core.json');
  const byI = {}; for (const x of p.picks ?? []) byI[x.i] = (byI[x.i] ?? 0) + 1;
  out.pick = {asOf: p.asOf, picks: p.picks?.length ?? null, eligible: p.eligible ?? null, cutN: p.cutN ?? null, spec: p.spec ? {perIndustry: p.spec.perIndustry, horizon: p.spec.horizon, version: p.spec.version, n: p.spec.n ?? p.spec.k ?? p.spec.want ?? null, paths: p.spec.paths, totalPairs: p.spec.totalPairs} : null, byIndustry: byI, industries: Object.keys(byI).length, keys: Object.keys(p)};
  const inds = new Set(); for (const g of c.groups ?? []) for (const x of g.inds ?? g.industries ?? []) inds.add(x.name ?? x.id ?? x);
  out.core = {asOf: c.asOf, groups: c.groups?.length ?? null, groupNames: (c.groups ?? []).map(g => g.short ?? g.name), companies: c.all?.n ?? null, keys: Object.keys(c).slice(0, 30)};
} catch (e) { out.error = String(e.message).slice(0, 200); }
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 2000));
