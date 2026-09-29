/* ATLAS 11 · 종목 정보 + 연쇄 지도(도미노·나비효과) — 한 종목이 흔들리면 누가 얼마나 따라 흔들리나 (1차 → 5차)
   과거 동조 관계에서 계산한 설명·탐색 도구. 인과 확정이 아니고 전망 숫자에 넣지 않는다. */
import {h, won, pct, pctPoint, num, wonShort, finite, reducedMotion, DIR} from './util.js';
import {loadJSON} from './store.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v); return el; };
const text = (attrs, content) => { const t = svgEl('text', attrs); t.textContent = content; return t; };
export const loadNetwork = () => loadJSON('network.json');

/** 화면에서 쓰는 파급 계산 — lib/atlas11/network.mjs 의 propagate 와 같은 식 */
export function propagate(network, code, delta, {damping = network.method?.damping ?? 0.5, orders = 5} = {}) {
  const byCode = new Map(network.nodes.map(x => [x.code, x])), src = byCode.get(code);
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

/* ---------- 종목 정보 ---------- */
const kv = (k, v, cls = '') => h('div', {class: 'kv-item ' + cls}, h('span', {class: 'k'}, k), h('b', {class: 'v'}, v));
const signCls = v => v > 0 ? 'up' : v < 0 ? 'down' : '';
export function renderInfo(container, d) {
  const i = d.info; if (!i) { container.replaceChildren(); return; }
  const rangeBar = h('div', {class: 'range', role: 'img', 'aria-label': `1년 범위 ${wonShort(i.low52)}~${wonShort(i.high52)} 중 현재 위치 ${pctPoint(i.pos52, 0)}`}, h('span', {class: 'range-lo'}, wonShort(i.low52)), h('span', {class: 'range-track'}, h('span', {class: 'range-dot'})), h('span', {class: 'range-hi'}, wonShort(i.high52)));
  rangeBar.querySelector('.range-dot').style.left = (Math.max(0, Math.min(1, i.pos52 ?? 0)) * 100).toFixed(1) + '%';
  container.replaceChildren(
    h('h3', null, '종목 정보'),
    h('div', {class: 'info-row', 'data-speak': `1년 범위 ${wonShort(i.low52)}에서 ${wonShort(i.high52)}, 현재 위치 ${pctPoint(i.pos52, 0)}`}, h('span', {class: 'lbl'}, '1년 범위'), rangeBar, h('b', {class: 'small'}, `위치 ${pctPoint(i.pos52, 0)}`)),
    h('div', {class: 'kv six'}, kv('1주', pct(i.ret5), signCls(i.ret5)), kv('1개월', pct(i.ret21), signCls(i.ret21)), kv('3개월', pct(i.ret63), signCls(i.ret63)), kv('6개월', pct(i.ret126), signCls(i.ret126)), kv('1년', pct(i.ret252), signCls(i.ret252)), kv('20일 변동성(연율)', pctPoint(i.vol20Annual, 0))),
    h('div', {class: 'kv six'}, kv('60일 최대 낙폭', pct(i.mdd60), 'down'), kv('1년 최대 낙폭', pct(i.mdd252), 'down'), kv('20일 평균 대비', pct(i.close / i.ma20 - 1), signCls(i.close / i.ma20 - 1)), kv('60일 평균 대비', i.ma60 ? pct(i.close / i.ma60 - 1) : '미산출', signCls(i.close / i.ma60 - 1)), kv('120일 평균 대비', i.ma120 ? pct(i.close / i.ma120 - 1) : '미산출', signCls(i.close / i.ma120 - 1)), kv(`거래량(최근 ${i.volumeDays}일 평균 대비)`, i.volumeRatio ? `${num(i.lastVolume)}주 · ${i.volumeRatio.toFixed(2)}배` : '미확보')),
    h('div', {class: 'kv six'}, kv('시장 베타', i.beta?.toFixed(2) ?? '미산출'), kv('시장 설명력 R²', pctPoint(i.r2, 0)), kv('고유 움직임 비중', pctPoint(i.idioShare, 0)), kv('연간 변동성(2년)', pctPoint(i.volAnnualLong, 0)), kv('묶음', i.groupName ?? '—'), kv('계산 창', `${i.window?.days ?? 504}거래일`)),
    h('p', {class: 'muted xs'}, '동조 상위 5: ' + (i.topCorrelated ?? []).map(t => `${t.name} ρ ${t.rho.toFixed(2)}`).join(' · ') + ' · 베타·상관은 최근 2년 일별 로그수익률 · 시장 = 52종목 등가중 평균(코스피 아님) · 배당·기업행위 미조정'));
}

/* ---------- 연쇄 지도 ---------- */
export function renderChain(container, {network, code, delta = -0.05, onNavigate}) {
  const state = {delta, cumulative: false, playing: false, timer: null};
  const chips = h('div', {class: 'toggles shock'}, h('span', {class: 'lbl muted xs'}, `${network.nodes.find(x => x.code === code)?.name} 이(가)`), ...[-0.1, -0.05, 0.05, 0.1].map(v => h('button', {class: 'ctl toggle' + (v === state.delta ? ' on' : ''), type: 'button', 'aria-pressed': String(v === state.delta), onclick: ev => { state.delta = v; for (const b of chips.querySelectorAll('.ctl')) { b.classList.toggle('on', b === ev.currentTarget); b.setAttribute('aria-pressed', String(b === ev.currentTarget)); } draw(); }}, (v > 0 ? '+' : '') + (v * 100).toFixed(0) + '%')), h('span', {class: 'lbl muted xs'}, '움직이면'));
  const cumBtn = h('button', {class: 'ctl toggle', type: 'button', 'aria-pressed': 'false', onclick: ev => { state.cumulative = !state.cumulative; ev.currentTarget.classList.toggle('on', state.cumulative); ev.currentTarget.setAttribute('aria-pressed', String(state.cumulative)); draw(); }}, '누적으로 보기');
  const playBtn = h('button', {class: 'ctl primary', type: 'button', 'aria-pressed': 'false', 'aria-label': '파급 재생 또는 정지'}, '▶ 파급 재생');
  const mapBox = h('div', {class: 'netmap-box'}), strip = h('div', {class: 'chain-strip'}), channel = h('div', {class: 'channel'}), note = h('p', {class: 'muted xs'});
  function draw() {
    stop();
    const p = propagate(network, code, state.delta);
    drawMap(mapBox, network, p, {code, cumulative: state.cumulative, onNavigate});
    drawStrip(strip, p, {cumulative: state.cumulative, onNavigate});
    const top = p.levels[1].effects[0];
    const srcName = network.nodes.find(x => x.code === code).name;
    const spoken = `연쇄 지도. ${srcName}이 ${pct(state.delta, 0)} 움직이면, 2차로 가장 크게 따라 움직이는 종목은 ${p.levels[1].effects.slice(0, 3).map(e => `${e.name} ${pct(e.total, 1)}`).join(', ')}. 시장 전체가 같이 움직이는 몫 ${pct(p.impliedMarketMove, 2)}, 이 종목만의 몫 ${pct(p.residualShock, 2)}. 과거 동조 관계로 계산한 값이며 전망 숫자에 넣지 않습니다.`;
    channel.setAttribute('data-speak', spoken);
    channel.replaceChildren(h('b', null, `시장 통로와 직접 통로`), h('span', {class: 'small'}, ` — ${srcName}의 ${pct(state.delta, 0)} 중 시장 전체가 같이 움직이는 몫은 ${pct(p.impliedMarketMove, 2)}(52종목 평균 기준), 이 종목만의 몫은 ${pct(p.residualShock, 2)}. 예: ${top.name} ${pct(top.total, 2)} = 시장 통로 ${pct(top.market, 2)} + 직접 통로 ${pct(top.direct, 2)}.`));
    note.textContent = `${network.method.note} · 계산 창 ${network.window.first}~${network.window.last}(${network.window.days}거래일) · 잔차 이웃 ${network.method.residualNetwork} · 감쇠 ${network.method.damping}`;
  }
  function play() {
    if (state.playing) { stop(); return; }
    state.playing = true; playBtn.textContent = '❚❚ 정지'; playBtn.setAttribute('aria-pressed', 'true');
    const nodes = [...mapBox.querySelectorAll('.node')], links = [...mapBox.querySelectorAll('.link')];
    for (const n of nodes) n.classList.remove('lit'); for (const l of links) l.classList.remove('lit');
    mapBox.classList.add('playing'); strip.classList.add('playing');
    const stepMs = reducedMotion() ? 0 : 650;
    let k = 1;
    const step = () => { if (!state.playing) return; for (const n of nodes) if (Number(n.dataset.order) === k) n.classList.add('lit'); for (const l of links) if (Number(l.dataset.order) === k) l.classList.add('lit'); for (const col of strip.querySelectorAll('.order')) col.classList.toggle('lit', Number(col.dataset.order) <= k); k++; if (k <= 5) state.timer = setTimeout(step, stepMs); else stop(true); };
    step();
  }
  function stop(keep = false) { state.playing = false; clearTimeout(state.timer); playBtn.textContent = '▶ 파급 재생'; playBtn.setAttribute('aria-pressed', 'false'); if (!keep) { mapBox.classList.remove('playing'); strip.classList.remove('playing'); for (const el of mapBox.querySelectorAll('.lit')) el.classList.remove('lit'); for (const col of strip.querySelectorAll('.order')) col.classList.remove('lit'); } }
  playBtn.addEventListener('click', play);
  container.replaceChildren(h('h3', null, '연쇄 지도 — 이 종목이 흔들리면 (설명·탐색 도구)'), chips, h('div', {class: 'toggles'}, playBtn, cumBtn), mapBox, channel, strip, h('p', {class: 'muted xs mobile-only'}, '← 옆으로 밀면 3·4·5차가 보입니다'), note);
  draw();
  return {draw, stop};
}

function drawMap(box, network, p, {code, cumulative, onNavigate}) {
  const width = Math.max(320, box.clientWidth || 720), mobile = width < 600, size = mobile ? width : Math.min(width, 720), cx = size / 2, cy = size / 2;
  // 반지름 배치(바깥→안): 묶음 이름 띠(PC) · 종목 이름 구역 · 점
  const labelZone = mobile ? 64 : 118, groupRing = mobile ? 12 : 22, R = size / 2 - labelZone - groupRing - 6;
  const svg = svgEl('svg', {viewBox: `0 0 ${size} ${size}`, width: '100%', class: 'netmap', role: 'img', 'aria-label': `연쇄 지도: ${network.nodes.find(x => x.code === code).name}에서 시작하는 1차~5차 파급`});
  const rad = a => (a - 90) * Math.PI / 180;
  const pos = new Map(network.nodes.map(n => { const a = rad(n.angle); return [n.code, {x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a: n.angle}]; }));
  // 묶음 호(점 바깥 이름 구역 너머) + 호를 따라 흐르는 묶음 이름(PC) — 아래쪽 반원은 글자가 뒤집히지 않도록 반대 방향 호
  const defs = svgEl('defs'); svg.append(defs);
  network.groups.forEach((g, gi) => {
    const angles = g.codes.map(c => network.nodes.find(n => n.code === c)?.angle).filter(finite); if (!angles.length) return;
    const lo = Math.min(...angles) - 2.5, hi = Math.max(...angles) + 2.5, mid = (lo + hi) / 2, bottom = mid > 90 && mid < 270;
    const rg = mobile ? R + labelZone + 4 : R + labelZone + 8, rPath = bottom ? rg + 9 : rg;
    const P = a => `${cx + rPath * Math.cos(rad(a))},${cy + rPath * Math.sin(rad(a))}`;
    const d = bottom ? `M${P(hi)} A${rPath},${rPath} 0 0 0 ${P(lo)}` : `M${P(lo)} A${rPath},${rPath} 0 0 1 ${P(hi)}`;
    const id = `garc-${code}-${gi}`;
    svg.append(svgEl('path', {d, class: 'group-arc', id}));
    if (!mobile) { const t = svgEl('text', {class: 'group-label'}); const tp = svgEl('textPath', {href: '#' + id, startOffset: '50%', 'text-anchor': 'middle'}); tp.textContent = g.name; t.append(tp); svg.append(t); }
  });
  // 파급 크기(누적 또는 2차) → 크기·색
  const effect = new Map(); if (cumulative) for (const e of p.cumulative) effect.set(e.code, e.total); else for (const e of p.levels[1].effects) effect.set(e.code, e.total);
  const orderOf = new Map(); for (const l of p.levels) { const top = l.order === 1 ? l.effects : l.effects.slice(0, 6); for (const e of top) if (!orderOf.has(e.code) && Math.abs(e.total) > 1e-4) orderOf.set(e.code, l.order); }
  const maxAbs = Math.max(1e-9, ...[...effect.values()].map(Math.abs));
  // 연결선: 1차→2차 상위, 2차→3차 상위 … (해당 차수의 이웃 관계망 간선) · 가운데를 살짝 비워 중심 글자가 보이게
  const linkLayer = svgEl('g'); svg.append(linkLayer);
  const incoming = new Map(); for (const e of network.edges) { if (!incoming.has(e.to)) incoming.set(e.to, []); incoming.get(e.to).push(e); }
  for (const l of p.levels.slice(1)) { const tops = l.effects.slice(0, 6); for (const e of tops) { const sources = l.order === 2 ? [code] : (incoming.get(e.code) ?? []).filter(x => orderOf.get(x.from) === l.order - 1).map(x => x.from); for (const s of sources.slice(0, 2)) { const a = pos.get(s), b = pos.get(e.code); if (!a || !b) continue; const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, qx = cx + (mx - cx) * 0.3, qy = cy + (my - cy) * 0.3; linkLayer.append(svgEl('path', {d: `M${a.x},${a.y} Q${qx},${qy} ${b.x},${b.y}`, class: 'link o' + l.order, 'data-order': l.order})); } } }
  // 노드
  const rMax = mobile ? 6.5 : 9, rMin = mobile ? 2.5 : 3;
  for (const n of network.nodes) {
    const q = pos.get(n.code), v = effect.get(n.code) ?? 0, isSrc = n.code === code, ord = isSrc ? 1 : orderOf.get(n.code) ?? 0;
    const r = isSrc ? rMax : rMin + (rMax - rMin - 0.5) * Math.min(1, Math.abs(v) / maxAbs);
    const g = svgEl('g', {class: 'node' + (isSrc ? ' src' : '') + (v > 0 ? ' up' : v < 0 ? ' down' : ''), 'data-order': ord, 'data-code': n.code, role: 'button', tabindex: '0', 'aria-label': `${n.name} ${isSrc ? '출발' : pct(v, 2)}`});
    const tip = svgEl('title'); tip.textContent = isSrc ? `${n.name} · 출발 ${pct(p.delta, 0)} · ${n.groupName}` : `${n.name} · ${cumulative ? '누적' : '2차'} ${pct(v, 2)}${ord ? ` · ${ord}차에서 처음 닿음` : ' · 파급 미미'} · ${n.groupName}`; g.append(tip);
    g.append(svgEl('circle', {cx: q.x, cy: q.y, r, class: 'dot'}));
    if (!mobile || isSrc || ord === 2) { const a = rad(n.angle), rl = R + rMax + 3, tx = cx + rl * Math.cos(a), ty = cy + rl * Math.sin(a); const left = n.angle > 180, rot = left ? n.angle + 90 : n.angle - 90; g.append(text({x: tx, y: ty + 3.5, class: 'node-label' + (ord ? ' hot' : ''), 'text-anchor': left ? 'end' : 'start', transform: `rotate(${rot} ${tx} ${ty})`}, n.name + (ord && !isSrc && !mobile ? ` ${pct(v, 1)}` : ''))); }
    g.addEventListener('click', () => onNavigate?.(n.code)); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onNavigate?.(n.code); } });
    svg.append(g);
  }
  // 중심 안내
  svg.append(text({x: cx, y: cy - 8, class: 'center-t', 'text-anchor': 'middle'}, `${network.nodes.find(x => x.code === code).name} ${pct(p.delta, 0)}`));
  svg.append(text({x: cx, y: cy + 12, class: 'center-s', 'text-anchor': 'middle'}, cumulative ? '누적 파급(1~5차)' : '2차(직접 동조) 크기'));
  box.replaceChildren(svg);
}

function drawStrip(strip, p, {cumulative, onNavigate}) {
  const cols = p.levels.map(l => {
    const rows = (l.order === 1 ? l.effects : l.effects.slice(0, 5));
    return h('div', {class: 'order', dataset: {order: l.order}},
      h('div', {class: 'order-h'}, h('b', null, `${l.order}차`), h('span', {class: 'muted xs'}, l.order === 1 ? '출발' : l.order === 2 ? '시장+직접 동조' : '이웃의 이웃(감쇠)')),
      ...rows.map(e => h('button', {class: 'order-row ' + (e.total > 0 ? 'up' : e.total < 0 ? 'down' : ''), type: 'button', onclick: () => onNavigate?.(e.code), 'aria-label': `${e.name} ${pct(e.total, 2)} 상세`}, h('span', {class: 'nm'}, e.name), h('b', null, pct(e.total, 2)))));
  });
  if (cumulative) cols.push(h('div', {class: 'order cum', dataset: {order: 6}}, h('div', {class: 'order-h'}, h('b', null, '누적'), h('span', {class: 'muted xs'}, '1~5차 합')), ...p.cumulative.slice(0, 5).map(e => h('button', {class: 'order-row ' + (e.total > 0 ? 'up' : 'down'), type: 'button', onclick: () => onNavigate?.(e.code)}, h('span', {class: 'nm'}, e.name), h('b', null, pct(e.total, 2))))));
  strip.replaceChildren(...cols);
}
