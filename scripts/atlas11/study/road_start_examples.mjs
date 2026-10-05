#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 「대세 상승 초입의 출목표」 셋째 — 같은 날 · 같은 모양 · 다른 결과 예 찾기(보고서 그림용 · 사이트는 바꾸지 않음)
 *   초입에 많이 보인 세 모양(하루 빨강 5개 · 긴 빨강 줄 · 하루 파랑 5개)을 모두 가진 출목표가 같은 날 여러 회사에 있을 때,
 *   그 뒤 6달에 ① 크게 오른 곳(+50% 넘음 · −33% 안 감) ② 크게 떨어진 곳(−33% 넘게 · +50% 안 감) ③ 둘 다 아닌 곳(+20% 안 · −15% 안)이 모두 있는 날을 찾는다.
 *   고르는 차례: 그날 세 갈래가 모두 있는 날 가운데, 세 회사 시가총액 순위 합이 가장 작은 날(이름이 널리 알려진 회사가 나오게) · 2025년 날만
 *   출목표 셈은 사이트 그대로(site/app/road.js roadOf)
 *   쓰는 법: node scripts/atlas11/study/road_start_examples.mjs <rs365.csv.gz> <결과.json>
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import {roadOf} from '../../../site/app/road.js';

const [src, out] = process.argv.slice(2);
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync('reports/atlas11/universe/2026-10-05-0940/bundle.json.gz')));
const prop = JSON.parse(fs.readFileSync('reports/atlas11/universe/2026-10-05-0940/proposal.json', 'utf8'));
const capRank = new Map(prop.picked.map(p => [p.code, p.capRank])), nameOf = new Map(prop.picked.map(p => [p.code, p.name])), indOf = new Map(prop.picked.map(p => [p.code, p.industry]));
const lines = zlib.gunzipSync(fs.readFileSync(src)).toString().split('\n');
const head = lines[0].split(','), col = k => head.indexOf(k);
const C = {code: col('code'), date: col('date'), i: col('i'), fmax: col('fmax'), fmin: col('fmin'), a: col('bigRedDay'), b: col('longRed'), c: col('bigBlueDay')};
const byDate = new Map();
for (const ln of lines.slice(1)) {
  const f = ln.split(','); if (f[C.a] !== '1' || f[C.b] !== '1' || f[C.c] !== '1') continue;
  const date = f[C.date]; if (date < '20250101' || date > '20251231') continue;
  const fmax = +f[C.fmax], fmin = +f[C.fmin];
  const cls = fmax >= 1.5 && fmin > 1 / 1.5 ? 'up' : fmin <= 1 / 1.5 && fmax < 1.5 ? 'down' : fmax < 1.2 && fmin > 0.85 ? 'flat' : null;
  if (!cls) continue;
  if (!byDate.has(date)) byDate.set(date, {up: [], down: [], flat: []});
  byDate.get(date)[cls].push({code: f[C.code], i: +f[C.i], fmax, fmin, rank: capRank.get(f[C.code]) ?? 9999});
}
let best = null;
for (const [date, g] of byDate) {
  if (!g.up.length || !g.down.length || !g.flat.length) continue;
  const pick = ['up', 'down', 'flat'].map(k => g[k].sort((x, y) => x.rank - y.rank)[0]);
  const score = pick.reduce((s, x) => s + x.rank, 0);
  if (!best || score < best.score) best = {date, score, pick, counts: {up: g.up.length, down: g.down.length, flat: g.flat.length}};
}
const ex = best.pick.map((x, k) => {
  const rows = bundle.stocks[x.code].fchart.rows, cs = rows.map(r => Number(r[4]));
  const road = roadOf(cs.slice(x.i - 20, x.i + 1));
  return {kind: ['up', 'down', 'flat'][k], code: x.code, name: nameOf.get(x.code), industry: indOf.get(x.code), capRank: x.rank, date: best.date, close: cs[x.i], fmax: x.fmax, fmin: x.fmin,
    unit: road.unit, cols: road.cols, red: road.all.up, blue: road.all.down, cells: road.cells.map(c => [c.col, c.row, c.side === 'up' ? 1 : 0]),
    after: cs.slice(x.i, x.i + 121).map(v => +(v / cs[x.i]).toFixed(4))};
});
fs.writeFileSync(out, JSON.stringify({date: best.date, counts: best.counts, examples: ex}, null, 1));
console.log(best.date, JSON.stringify(best.counts), ex.map(e => `${e.kind}:${e.name}(${e.industry} · 시총 ${e.capRank}위) 최고 ${e.fmax} 최저 ${e.fmin} 동그라미 빨강 ${e.red} 파랑 ${e.blue} 칸 ${e.unit}`).join(' / '));
