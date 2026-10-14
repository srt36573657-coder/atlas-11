#!/usr/bin/env node
// 새 ATLAS — 1억 번 눌러 보기(사장님 2026-10-12 02:21 「이제 전체 검검을 하라 구글 클로드 애플 cia 관점으로 1억번 하라」)
//   길 지도 = site_check.mjs --links 가 실제 화면(390 · 보통 글씨)에서 모은 「화면마다 누를 수 있는 길」 — 화면을 1억 번 그리는 것이 아니라,
//   그 지도 위에서 사람이 누르듯 아무 길이나 1억 번 누르며 누를 때마다 본다:
//     ① 깨진 길 — 누른 곳이 지도에 있는 화면인가(찾기 · 365곳 밖 판 #/x/ 는 판이라 뺌)
//     ② 단 건너뛰기 — 같은 회사 안에서 n단 → n+2단 이상으로 바로 가는 길이 없나(「지나온 단 · 바로 다음 단만」 · 7단)
//     ③ 막다른 화면 — 화면마다 처음(#/)으로 가는 길 · 회사 n단(3~6)마다 n+1단 길이 있나
//     ④ 깊이 — 첫 화면에서 가장 짧은 누름 수(지도 전체를 넓게 셈): 회사 3번 · n단 n번 안
//   무작위: 정해진 씨앗(xorshift32)이라 다시 돌리면 같은 길 · 누를 때마다 2% 는 새 사람(첫 화면부터)
// 쓰는 법: node scripts/atlas11/t365/click_walk.mjs --links <길 지도.json> [--n 100000000] [--seed 20261012] [--out reports/atlas11/verify/atlas-new-walk-latest.json]
//   ⑤ 점검용 길 지도(inspect4.mjs siteGraph — 회차마다 도는 네 눈 점검 · 애플 눈이 씀)가 이 실제 길 지도와 길 하나하나 같은가(2026-10-12 12:41 「업데이트 할때마다 … 점검」 · --data 자료 폴더 = 화면에 쓴 자료)
import fs from 'node:fs';
import path from 'node:path';
import {siteGraph} from './inspect4.mjs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const map = JSON.parse(fs.readFileSync(path.resolve(arg('--links')), 'utf8'));
// 맨 위 막대의 「?」 단추(도움말 #/info)는 링크가 아니라 단추라 길 지도에 없음 — 모든 화면 맨 위에 있으므로 모든 화면에서 #/info 로 가는 길로 셈(site/atlas/index.html #helpBtn)
const BTN = ['#/info']; for (const r of Object.keys(map)) for (const b of BTN) if (r !== b && b in map && !map[r].includes(b)) map[r] = [...map[r], b];
const N = +arg('--n', 1e8), SEED = +arg('--seed', 20261012) >>> 0, out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/atlas-new-walk-latest.json'));
const SUB = {'': 3, past: 4, rivals: 5, grow: 6, range: 7};
const stepOf = r => { if (r === '#/') return 0; if (r.startsWith('#/g/')) return 1; if (r.startsWith('#/i/')) return 2; const m = r.match(/^#\/c\/([^/]+)\/?([a-z]*)$/); return m && m[2] in SUB ? SUB[m[2]] : null; };
const coOf = r => r.match(/^#\/c\/([^/]+)/)?.[1] ?? null;
const sheet = r => r.startsWith('#/x/') || r.startsWith('#/find');
const routes = Object.keys(map), idx = new Map(routes.map((r, i) => [r, i]));
const bad = {broken: new Map(), skip: new Map(), noHome: [], noNext: []};
// 지도를 숫자로(빠르게) — 길마다 [갈 곳 번호 · 깨짐 · 건너뜀]
const L = routes.map(r => { const s = stepOf(r), c = coOf(r);
  return (map[r] || []).map(h => { const j = idx.get(h); const broken = j == null && !sheet(h); const t = j == null ? null : stepOf(h);
    const skip = j != null && s != null && s >= 3 && t != null && t >= 3 && coOf(h) === c && t > s + 1; return {j: j ?? -1, broken, skip, h}; }); });
routes.forEach((r, i) => { const hs = map[r] || []; if (!hs.includes('#/')) bad.noHome.push(r); const s = stepOf(r); if (s != null && s >= 3 && s < 7 && !hs.some(h => coOf(h) === coOf(r) && stepOf(h) === s + 1)) bad.noNext.push(r); });
// ④ 깊이 — 첫 화면에서 넓게
const depth = new Int32Array(routes.length).fill(-1), q = [idx.get('#/')]; depth[q[0]] = 0;
for (let k = 0; k < q.length; k++) for (const e of L[q[k]]) if (e.j >= 0 && depth[e.j] < 0) { depth[e.j] = depth[q[k]] + 1; q.push(e.j); }
const deep = {}; let unreached = 0, overDeep = 0;
routes.forEach((r, i) => { const s = stepOf(r); if (depth[i] < 0) unreached++; if (s != null && s >= 3) { const d = depth[i]; deep[s] = Math.max(deep[s] ?? 0, d); if (d < 0 || d > s) overDeep++; } });
// 1억 번 누름
let x = SEED || 1; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
const home = idx.get('#/'), seen = new Uint8Array(routes.length), hits = new Float64Array(routes.length);
let cur = home, clicks = 0, users = 1, brokenN = 0, skipN = 0;
const t0 = Date.now();
while (clicks < N) {
  seen[cur] = 1; hits[cur]++;
  const ls = L[cur];
  if (!ls.length || rnd() < 0.02) { cur = home; users++; continue; } // 새 사람(첫 화면부터) — 누름으로 세지 않음
  const e = ls[(rnd() * ls.length) | 0]; clicks++;
  if (e.broken) { brokenN++; bad.broken.set(e.h, (bad.broken.get(e.h) ?? 0) + 1); cur = home; continue; }
  if (e.skip) { skipN++; bad.skip.set(routes[cur] + ' → ' + e.h, (bad.skip.get(routes[cur] + ' → ' + e.h) ?? 0) + 1); }
  cur = e.j < 0 ? home : e.j; // 판(#/x/ · 찾기)은 닫고 처음으로
}
const ms = Date.now() - t0, visited = seen.reduce((a, b) => a + b, 0);
// ⑤ 점검용 길 지도 맞대기(도움말 판 #/info 의 보기 고리는 판이라 뺌)
const mirror = (() => { const D = path.resolve(ROOT, arg('--data', 'site/atlas/data')), J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
  const S = {core: J('core.json'), comp: J('comp.json'), range: J('range.json'), home: fs.existsSync(path.join(D, 'home.json')) ? J('home.json') : null}; S.codes = Object.keys(S.comp.companies); S.gid = new Map(S.core.groups.map(g => [g.id, g])); S.iby = new Map(S.core.industries.map(i => [i.name, i]));
  S.mkt = S.core.mkt ? J('mkt.json') : null; S.mk = S.mkt?.companies ?? null; // 모든 회사(2026-10-14 「나」) — 업종 화면 회사 줄이 고른 곳 #/c/ · 나머지 #/x/
  const {nodes} = siteGraph(S), real = Object.keys(map).filter(r => r !== '#/info'), diff = [];
  for (const r of real) if (!nodes.has(r)) diff.push('점검 지도에 없는 화면 ' + r);
  for (const r of nodes.keys()) if (r !== '#/info' && !sheet(r) && !(r in map)) diff.push('실제에 없는 화면 ' + r); // 밖 칸(#/x/)은 판이라 실제 지도에 화면으로 없음 — 그리로 가는 길은 아래에서 맞댐
  for (const r of real) { if (!nodes.has(r)) continue; const a = new Set(map[r].filter(x => x !== '#/info')), b = new Set(nodes.get(r).links.filter(x => x !== '#/info'));
    for (const x of a) if (!b.has(x)) diff.push(`${r} → ${x} 점검 지도에 없음`); for (const x of b) if (!a.has(x)) diff.push(`${r} → ${x} 실제에 없음`); }
  return {pages: nodes.size, diff: diff.length, first: diff.slice(0, 10)}; })();
const fails = brokenN + skipN + bad.noHome.length + bad.noNext.length + unreached + overDeep + mirror.diff;
const res = {schema: 'atlas-new-walk-1', made: new Date().toISOString(), why: '사장님 2026-10-12 02:21 「이제 전체 검검을 하라 구글 클로드 애플 cia 관점으로 1억번 하라」 — 실제 화면에서 모은 길 지도 위에서 무작위로 1억 번 누름',
  links: path.basename(arg('--links')), seed: SEED, clicks, users, ms, pages: routes.length, edges: L.reduce((a, l) => a + l.length, 0), visited, notVisited: routes.filter((r, i) => !seen[i]).slice(0, 20),
  broken: brokenN, brokenLinks: [...bad.broken].slice(0, 20), skip: skipN, skipLinks: [...bad.skip].slice(0, 20), noHome: bad.noHome.slice(0, 20), noNext: bad.noNext.slice(0, 20),
  depth: {unreached, overDeep, deepestByStep: deep}, mirror, fails};
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({clicks, users, ms, pages: res.pages, visited, broken: brokenN, skip: skipN, noHome: bad.noHome.length, noNext: bad.noNext.length, depth: res.depth, mirror: {pages: mirror.pages, diff: mirror.diff}, fails}));
process.exit(fails ? 1 : 0);
