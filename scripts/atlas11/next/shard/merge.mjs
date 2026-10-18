#!/usr/bin/env node
// 쪽 검사 몫 결과 합치기(2026-10-18 고도리 길 1 · C1) — check_co · check_range · check_past · check_grow 의 --shard k/n 결과를 쪼개기 전 꼴 그대로 하나로(영어는 next_en_check.mjs --merge)
//   쓰는 법: node scripts/atlas11/next/shard/merge.mjs 몫1.json 몫2.json … --shards n --out 합친.json · 끝 코드 0 = 몫이 모두 · 같은 일감 목록 · 실패 0
//   맞대 봄(problems — 하나라도 있으면 ok: false): 몫 1 ~ n 이 한 번씩 · 몫마다 같은 일감 목록(units.hash · total · 마디마다 total) · 몫 일감 합 = 전체(마디마다도) ·
//     같은 다짐(몫마다 달라질 수 없는 칸 — base · asOf · all · companies …)
//   합침: counts 더함(숫자 · 안의 숫자) · fails 잇기(500 까지 · counts.fail 은 모두) · warn 잇기(50 까지) · seconds(sec) = 가장 긴 몫 · secondsSum · time · net 더함 ·
//     shard = all/n · units(합) · shards = 몫마다 한 줄 · problems · ok
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const files = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--shards' && argv[i - 1] !== '--out');
const OUT = arg('--out', null), want = Number(arg('--shards', 0)) || null;
const OWN = new Set(['at', 'made', 'seconds', 'sec', 'time', 'net', 'counts', 'fails', 'warn', 'ok', 'shard', 'units']); // 몫마다 다른 칸 — 나머지는 몫마다 같아야 함
const problems = [], P = [];
for (const f of files) {
  let j = null; try { j = JSON.parse(await fs.readFile(f, 'utf8')); } catch (e) { problems.push(`${path.basename(f)} 못 읽음 — ${String(e.message).slice(0, 120)}`); continue; }
  const m = /^(\d+)\/(\d+)$/.exec(j?.shard ?? '');
  if (!m || !j.units) { problems.push(`${path.basename(f)} 은 몫 결과가 아님(shard · units 없음)`); continue; }
  P.push({k: +m[1], n: +m[2], j, f: path.basename(f)});
}
P.sort((a, b) => a.k - b.k);
const n = want ?? P[0]?.n ?? 0;
if (!P.length) problems.push('몫 결과가 하나도 없음');
for (const x of P) if (x.n !== n) problems.push(`${x.f} 몫 수 ${x.n} ≠ ${n}`);
for (let k = 1; k <= n; k++) { const c = P.filter(x => x.k === k).length; if (c !== 1) problems.push(c ? `${k}/${n} 몫이 ${c}번` : `${k}/${n} 몫 결과 없음`); }
const lists = new Set(P.map(x => `${x.j.units.hash}·${x.j.units.total}`));
if (lists.size > 1) problems.push('몫마다 일감 목록이 다름(도는 사이 자료가 바뀜?) ' + [...lists].join(' | '));
const J0 = P[0]?.j ?? {}, total = J0.units?.total ?? 0, sumMine = P.reduce((a, x) => a + (x.j.units?.mine ?? 0), 0);
if (P.length && lists.size === 1 && sumMine !== total) problems.push(`몫 일감 합 ${sumMine} ≠ 전체 ${total}`);
const kinds = {};
for (const {j} of P) for (const [kd, v] of Object.entries(j.units?.kinds ?? {})) { const K = kinds[kd] ??= {total: v.total, mine: 0}; if (K.total !== v.total) problems.push(`마디 ${kd} 일감 수가 몫마다 다름 ${K.total} · ${v.total}`); K.mine += v.mine; }
if (P.length === n) for (const [kd, K] of Object.entries(kinds)) if (K.mine !== K.total) problems.push(`마디 ${kd} 몫 합 ${K.mine} ≠ 전체 ${K.total}`);
for (const key of new Set(P.flatMap(x => Object.keys(x.j)))) if (!OWN.has(key) && new Set(P.map(x => JSON.stringify(x.j[key] ?? null))).size > 1) problems.push(`몫마다 ${key} 가 다름`);

/** 더하기 — 숫자는 더함 · 안의 칸은 칸마다 · 글은 같으면 그대로(다르면 「 | 」로 이음) · 목록은 이음 */
function add(a, b) {
  if (a === undefined) return structuredClone(b);
  if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (a && b && typeof a === 'object' && typeof b === 'object') { const o = {...a}; for (const k of Object.keys(b)) o[k] = add(a[k], b[k]); return o; }
  return a === b ? a : [...new Set([...String(a).split(' | '), String(b)])].join(' | ');
}
const pieceOk = j => (j.ok ?? ((j.counts?.fail ?? 0) === 0 && !(j.fails?.length))) === true;
let counts = {}, net, failsAll = [], warn = [];
for (const {j} of P) { counts = add(counts, j.counts ?? {}); net = add(net, j.net); failsAll.push(...(j.fails ?? [])); warn.push(...(j.warn ?? [])); }
const sec = x => x.j.seconds ?? x.j.sec ?? 0, secs = P.map(sec);
const T = P.map(x => x.j.time).filter(Boolean), tsum = k => T.reduce((a, t) => a + (t[k] || 0), 0), r1 = x => Math.round(x * 10) / 10;
const time = T.length ? {old: r1(tsum('old')), new: r1(tsum('new')), wall: Math.max(...T.map(t => t.wall || 0)), wallSum: r1(tsum('wall')), opensOld: tsum('opensOld'), opensNew: tsum('opensNew'),
  oldPct: tsum('wall') ? Math.round(tsum('old') / tsum('wall') * 1000) / 10 : 0, oldShare: tsum('old') + tsum('new') ? Math.round(tsum('old') / (tsum('old') + tsum('new')) * 1000) / 10 : 0} : undefined;
const ok = !problems.length && P.length === n && P.every(x => pieceOk(x.j));
const res = {};
for (const [k, v] of Object.entries(J0)) if (!OWN.has(k)) res[k] = v; // 쪼개기 전 꼴 — 같은 칸은 첫 몫 것(모두 같음을 위에서 맞댐)
if ('at' in J0) res.at = new Date().toISOString(); if ('made' in J0) res.made = new Date().toISOString();
Object.assign(res, {shard: `all/${n}`, units: {total, mine: sumMine, hash: J0.units?.hash ?? null, kinds},
  ['sec' in J0 && !('seconds' in J0) ? 'sec' : 'seconds']: Math.max(0, ...secs), secondsSum: secs.reduce((a, b) => a + b, 0),
  ...(time ? {time} : {}), ...(net ? {net} : {}), counts, fails: failsAll.slice(0, 500), ...('warn' in J0 ? {warn: warn.slice(0, 50)} : {}),
  shards: P.map(x => ({shard: x.j.shard, ok: pieceOk(x.j), fails: x.j.counts?.fail ?? x.j.fails?.length ?? 0, seconds: sec(x), mine: x.j.units?.mine ?? null, kinds: Object.fromEntries(Object.entries(x.j.units?.kinds ?? {}).map(([kd, v]) => [kd, v.mine]))})),
  problems, ok});
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok, shards: n, got: P.length, units: res.units, fails: counts.fail || 0, seconds: res.seconds ?? res.sec, secondsSum: res.secondsSum, pieces: res.shards.map(s => `${s.shard} ${s.ok ? 'ok' : 'FAIL'} ${s.seconds}s ${s.mine}`), problems}));
process.exit(ok ? 0 : 1);
