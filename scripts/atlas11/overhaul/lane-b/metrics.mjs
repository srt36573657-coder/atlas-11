/**
 * 후향 칸 자료(run-retro.mjs 결과)에서 기준일별 숫자를 센다 — 실전 정의(가장 높은 확률 · 보합→상승→하락)
 * 칸 열: k i up1 flat1 down1 sel1 p50_1 actual1 up20 flat20 down20 sel20 p50_20 actual20 anchor prevClose zero
 */
import {mean, dirOf} from './common.mjs';

export function unpack(run) {
  const c = Object.fromEntries(run.columns.map((n, j) => [n, j]));
  return run.cells.map(r => ({k: r[c.k], i: r[c.i], up1: r[c.up1], flat1: r[c.flat1], down1: r[c.down1], sel1: r[c.sel1], p50_1: r[c.p50_1], actual1: r[c.actual1], up20: r[c.up20], flat20: r[c.flat20], down20: r[c.down20], sel20: r[c.sel20], p50_20: r[c.p50_20], actual20: r[c.actual20], anchor: r[c.anchor], prevClose: r[c.prevClose], zero: r[c.zero] === 1}));
}

/** 기준일 k 마다 칸 묶음(filter)에 대해 숫자를 낸다 · 빈 묶음은 null */
export function perOrigin(run, filter = () => true) {
  const cells = unpack(run), K = run.origins.length, P = run.protocol.paths, out = [];
  for (let k = 0; k < K; k++) {
    const all = cells.filter(x => x.k === k), rows = all.filter(filter);
    if (!rows.length) { out.push(null); continue; }
    const act1 = rows.map(x => dirOf(x.actual1 / x.anchor - 1)), act20 = rows.map(x => dirOf(x.actual20 / x.anchor - 1));
    const prev = rows.map(x => dirOf(x.anchor / x.prevClose - 1));
    const market = dirOf(mean(all.map(x => x.anchor / x.prevClose - 1))); // 시장 어제 = 52종목 단순 수익률 평균
    out.push({k, n: rows.length,
      dir1sel: mean(rows.map((x, j) => x.sel1 === act1[j] ? 1 : 0)), dir20sel: mean(rows.map((x, j) => x.sel20 === act20[j] ? 1 : 0)),
      up1: mean(act1.map(a => a === 'up' ? 1 : 0)), down1: mean(act1.map(a => a === 'down' ? 1 : 0)), prev1: mean(prev.map((p, j) => p === act1[j] ? 1 : 0)), market1: mean(act1.map(a => a === market ? 1 : 0)),
      up20: mean(act20.map(a => a === 'up' ? 1 : 0)), down20: mean(act20.map(a => a === 'down' ? 1 : 0)), prev20: mean(prev.map((p, j) => p === act20[j] ? 1 : 0)), market20: mean(act20.map(a => a === market ? 1 : 0)),
      ape1: mean(rows.map(x => Math.abs(x.p50_1 - x.actual1) / x.actual1 * 100)), ape1close: mean(rows.map(x => Math.abs(x.anchor - x.actual1) / x.actual1 * 100)),
      ape20: mean(rows.map(x => Math.abs(x.p50_20 - x.actual20) / x.actual20 * 100)), ape20close: mean(rows.map(x => Math.abs(x.anchor - x.actual20) / x.actual20 * 100)),
      size1: rows.filter(x => Math.abs(x.p50_1 - x.actual1) / x.actual1 * 100 <= 1.5).length, size1close: rows.filter(x => Math.abs(x.anchor - x.actual1) / x.actual1 * 100 <= 1.5).length,
      size20: rows.filter(x => Math.abs(x.p50_20 - x.actual20) / x.actual20 * 100 <= 8).length, size20close: rows.filter(x => Math.abs(x.anchor - x.actual20) / x.actual20 * 100 <= 8).length,
      gap1: mean(rows.map(x => (x.down1 - x.up1) / P)), downPicks1: rows.filter(x => x.sel1 === 'down').length, upPicks1: rows.filter(x => x.sel1 === 'up').length, flatPicks1: rows.filter(x => x.sel1 === 'flat').length,
      realizedGap1: mean(act1.map(a => (a === 'down' ? 1 : 0) - (a === 'up' ? 1 : 0))),
      right1: rows.filter((x, j) => x.sel1 === act1[j]).length, right20: rows.filter((x, j) => x.sel20 === act20[j]).length});
  }
  return out;
}

/** 기준일 평균(저장된 요약과 같은 묶는 순서) + 칸 수 합 */
export function summarize(series) {
  const ok = series.filter(Boolean), keys = ['dir1sel', 'dir20sel', 'up1', 'down1', 'prev1', 'market1', 'up20', 'down20', 'prev20', 'market20', 'ape1', 'ape1close', 'ape20', 'ape20close', 'gap1', 'realizedGap1'];
  const s = Object.fromEntries(keys.map(k => [k, mean(ok.map(x => x[k]))]));
  for (const k of ['n', 'size1', 'size1close', 'size20', 'size20close', 'downPicks1', 'upPicks1', 'flatPicks1', 'right1', 'right20']) s[k] = ok.reduce((a, x) => a + x[k], 0);
  s.origins = ok.length;
  return s;
}
