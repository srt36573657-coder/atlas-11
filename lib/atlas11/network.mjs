/**
 * ATLAS 11 · 연쇄 지도(도미노·나비효과) — 52종목이 과거에 얼마나 같이 움직였는가로 「한 종목이 흔들리면 누가 얼마나 따라 흔들리나」를 계산하는 설명·탐색 도구.
 *
 *   r_j = β_j · m + ε_j            (m = 52종목 등가중 평균 수익률 = 시장 통로, ε = 시장을 뺀 나머지 = 직접 통로)
 *   종목 i 가 Δ 만큼 움직일 때
 *     시장 통로: Δ_m = cov(m, r_i)/var(r_i) · Δ  →  종목 j 에 β_j · Δ_m
 *     직접 통로: b^ε_ji · (Δ − β_i · Δ_m)          (b^ε_ji = cov(ε_j, ε_i)/var(ε_i))
 *     두 통로의 합 = b_ji · Δ = cov(r_j, r_i)/var(r_i) · Δ   (항등식 · 검사로 확인)
 *   3차~5차: 직접 통로의 효과가 「나머지 동조 관계망」(종목마다 가장 강한 K개 이웃)을 따라 감쇠 d 로 번지는 양
 *     e^(k+1)_j = d · Σ_m W_jm · e^(k)_m
 *   ★ 과거 동조 관계에서 계산한 크기이며 인과 확정이 아니고, 전망 숫자에 넣지 않는다. 3~5차는 「친구의 친구」 노출을 보는 탐색값이다.
 *
 * 참고: 시장·잔차 분해는 단일지수 모형(Sharpe 1963, Management Science), 관계망 전파는 Katz(1953, Psychometrika) 방식.
 */
import {FROZEN_GROUPS, groupsFor} from './groups.mjs';
const finite = x => typeof x === 'number' && Number.isFinite(x);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const cov = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0; for (let t = 0; t < a.length; t++) s += (a[t] - ma) * (b[t] - mb); return s / (a.length - 1); };

/** 편집 분류(설명용) — 같은 산업끼리 묶어 원형 지도에 이웃하게 놓는다.
 *  2026-10-04 종목 바꾸기: 묶음은 groups.mjs 가 「지금 보는 52종목」에 맞춰 만든다(옛 52종목이면 옛 묶음 그대로). GROUPS·groupOf 는 옛 묶음(옛 기록용). */
export const GROUPS = FROZEN_GROUPS;
export const groupOf = code => GROUPS.find(g => g.codes.includes(code)) ?? null;

export function stockStats(asset, sessions, {asOf}) {
  const closes = sessions.filter(d => d <= asOf).map(d => asset.prices.find(p => p.date === d)?.close ?? null);
  const px = closes.filter(finite);
  const last = px.at(-1), at = n => px.length > n ? px[px.length - 1 - n] : null;
  const ret = n => at(n) ? last / at(n) - 1 : null;
  const win = px.slice(-252), hi52 = Math.max(...win), lo52 = Math.min(...win);
  const logr = px.slice(-21).map((v, k, a) => k ? Math.log(v / a[k - 1]) : null).filter(finite);
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); };
  const mdd = a => { let peak = -Infinity, worst = 0; for (const v of a) { peak = Math.max(peak, v); worst = Math.min(worst, v / peak - 1); } return worst; };
  const ma = n => px.length >= n ? mean(px.slice(-n)) : null;
  const vols = asset.prices.filter(p => p.date <= asOf && finite(p.volume)).slice(-20), avgVol = vols.length ? mean(vols.map(p => p.volume)) : null, lastVol = vols.at(-1)?.volume ?? null;
  return {close: last, high52: hi52, low52: lo52, pos52: hi52 > lo52 ? (last - lo52) / (hi52 - lo52) : null, ret5: ret(5), ret21: ret(21), ret63: ret(63), ret126: ret(126), ret252: ret(252), vol20Annual: logr.length >= 10 ? sd(logr) * Math.sqrt(252) : null, mdd60: mdd(px.slice(-60)), mdd252: mdd(win), ma20: ma(20), ma60: ma(60), ma120: ma(120), avgVolume: avgVol, lastVolume: lastVol, volumeDays: vols.length, volumeRatio: avgVol && lastVol ? lastVol / avgVol : null};
}

export function buildNetwork(input, {window = 504, topK = 5, minAbsRho = 0.15, damping = 0.5} = {}) {
  const sessions = input.calendar.sessions.filter(d => d <= input.actualAsOf), dates = sessions.slice(-(window + 1));
  const assets = input.assets, n = assets.length;
  const returns = assets.map(a => { const m = new Map(a.prices.map(p => [p.date, p.close])); return dates.slice(1).map((d, k) => Math.log(m.get(d) / m.get(dates[k]))); });
  if (returns.some(r => r.length !== window || r.some(x => !finite(x)))) throw Error('NETWORK_RETURNS_INCOMPLETE');
  const T = window, market = Array.from({length: T}, (_, t) => mean(returns.map(r => r[t])));
  const varM = cov(market, market);
  const beta = returns.map(r => cov(r, market) / varM);
  const eps = returns.map((r, i) => r.map((x, t) => x - beta[i] * market[t]));
  const varR = returns.map(r => cov(r, r)), varE = eps.map(e => cov(e, e));
  const r2 = beta.map((b, i) => b * b * varM / varR[i]);
  // 잔차 상관·잔차 베타 (j ← i)
  const rhoE = Array.from({length: n}, () => Array(n).fill(0)), bE = Array.from({length: n}, () => Array(n).fill(0)), rho = Array.from({length: n}, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const c = cov(eps[j], eps[i]); rhoE[j][i] = c / Math.sqrt(varE[j] * varE[i]); bE[j][i] = c / varE[i]; rho[j][i] = cov(returns[j], returns[i]) / Math.sqrt(varR[j] * varR[i]); }
  const edges = [];
  for (let i = 0; i < n; i++) {
    const cand = Array.from({length: n}, (_, j) => j).filter(j => j !== i && Math.abs(rhoE[j][i]) >= minAbsRho).sort((a, b) => Math.abs(rhoE[b][i]) - Math.abs(rhoE[a][i])).slice(0, topK);
    for (const j of cand) edges.push({from: assets[i].code, to: assets[j].code, w: Number(bE[j][i].toFixed(5)), rho: Number(rhoE[j][i].toFixed(4))});
  }
  const groups = groupsFor(assets);
  const order = groups.flatMap(g => g.codes), gOf = code => groups.find(g => g.codes.includes(code)) ?? null;
  const nodes = assets.map((a, i) => { const g = gOf(a.code); const top = Array.from({length: n}, (_, j) => j).filter(j => j !== i).sort((x, y) => rho[y][i] - rho[x][i]).slice(0, 5).map(j => ({code: assets[j].code, name: assets[j].name, rho: Number(rho[j][i].toFixed(3)), beta: Number((cov(returns[j], returns[i]) / varR[i]).toFixed(3))})); return {code: a.code, name: a.name, group: g?.id ?? null, groupName: g?.name ?? null, angle: Number((order.indexOf(a.code) / n * 360).toFixed(2)), beta: Number(beta[i].toFixed(4)), r2: Number(r2[i].toFixed(4)), idioShare: Number((1 - r2[i]).toFixed(4)), marketResponse: Number((cov(market, returns[i]) / varR[i]).toFixed(5)), volAnnual: Number((Math.sqrt(varR[i] * 252)).toFixed(4)), topCorrelated: top}; });
  return {schema: 'atlas11-network-1', actualAsOf: input.actualAsOf, window: {days: T, first: dates[1], last: dates.at(-1)}, method: {factor: 'equal_weight_52_basket_single_index', residualNetwork: `top${topK}_residual_neighbors_|rho|>=${minAbsRho}`, damping, orders: 5, note: '과거 동조 관계에서 계산한 파급 크기 · 인과 확정 아님 · 전망 숫자에 넣지 않음 · 3~5차는 「친구의 친구」 노출 탐색값'}, market: {varDaily: Number(varM.toFixed(8)), volAnnual: Number(Math.sqrt(varM * 252).toFixed(4))}, groups, nodes, edges};
}

/** 파급 계산(화면에서도 같은 식을 쓴다): 종목 code 가 delta(비율) 만큼 움직일 때 1~5차 효과 */
export function propagate(network, code, delta, {damping = network.method?.damping ?? 0.5, orders = 5} = {}) {
  const byCode = new Map(network.nodes.map(x => [x.code, x])), src = byCode.get(code); if (!src) throw Error('NETWORK_CODE');
  const deltaM = src.marketResponse * delta, residual = delta - src.beta * deltaM;
  const incoming = new Map(); for (const e of network.edges) { if (!incoming.has(e.to)) incoming.set(e.to, []); incoming.get(e.to).push(e); }
  const order2 = network.nodes.filter(x => x.code !== code).map(x => { const direct = (network.edges.find(e => e.from === code && e.to === x.code)?.w ?? 0) * residual, market = x.beta * deltaM; return {code: x.code, name: x.name, market, direct, total: market + direct}; });
  const levels = [{order: 1, effects: [{code, name: src.name, total: delta, market: 0, direct: delta}]}, {order: 2, effects: order2.sort((a, b) => Math.abs(b.total) - Math.abs(a.total))}];
  let prev = new Map(order2.map(x => [x.code, x.direct]));
  for (let k = 3; k <= orders; k++) {
    const next = new Map();
    for (const x of network.nodes) { if (x.code === code) continue; let s = 0; for (const e of incoming.get(x.code) ?? []) { if (e.from === code) continue; s += e.w * (prev.get(e.from) ?? 0); } next.set(x.code, damping * s); }
    levels.push({order: k, effects: network.nodes.filter(x => x.code !== code).map(x => ({code: x.code, name: x.name, total: next.get(x.code) ?? 0})).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))});
    prev = next;
  }
  const cumulative = new Map(); for (const l of levels) for (const e of l.effects) cumulative.set(e.code, (cumulative.get(e.code) ?? 0) + e.total);
  return {code, delta, impliedMarketMove: deltaM, residualShock: residual, levels, cumulative: [...cumulative.entries()].filter(([c]) => c !== code).map(([c, v]) => ({code: c, name: byCode.get(c).name, total: v})).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))};
}
