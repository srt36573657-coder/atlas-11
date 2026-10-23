/* 꺾은선 그래프(사장님 2026-10-23 10:09 「달력 싹달력 그랴프로 쉽게 보이개 해봐 이거 잡스 구르이라면」 · 10:42 「그래프를 막대가 아니라 꺽기 그래프로 해야 해」)
   첫 화면 기록 칸(theme-home.js — 자료가 온 뒤에만 받음 · 첫 그림 무게 0) · 기록 달력(#/t/pick) · 싹 달력(#/t/cal)이 같이 씀
   초록 실선 = 고른 것 · 검은 점선 = 아무 것 · 줄 = 그날까지 모아 센 100번에 몇 번(줄 끝 = 맨 위 결론 숫자) · 오른쪽 옅은 칸 = 한 달을 기다리는 날 · 아래 끝 = 0(부풀리지 않음)
   그림 안 글자 없음(글은 그림 밖) · 큰 그래프는 전체가 누르는 자리 — 손가락으로 쓸거나 왼쪽 · 오른쪽 단추로 그날을 고름 · 안 눌러도 결론은 위 글에 있음
   근거: 애플 그래프 안내서(developer.apple.com/design/human-interface-guidelines/charts) 「Summarize the main message」 · 「drag a vertical indicator … revealing the value」
         · 「don't require interaction to reveal critical information」 · 「Avoid relying solely on color」(실선 · 점선 · 글 옆 줄 견본) */
const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);

/** 줄 견본(글 옆에 붙여 어느 줄인지 알림) — k = 'o'(고른 것) | 'b'(아무 것) */
export function lineKey(k) { const s = sv('svg', {class: 'th-lnk', viewBox: '0 0 28 10', 'aria-hidden': 'true', focusable: 'false'}); s.append(sv('line', {class: k, x1: 2, x2: 26, y1: 5, y2: 5})); return s; }

/** 고른 싹 회사 기록(theme-bloom.json cal.days · 날 차례) → 줄 — o = 그날까지 모아 센 고른 회사 꽃 비율 · b = 같은 날 아무 회사(모아 셈) · w = 기다리는 날 · x = 그날 자료 */
export function pickRows(days) {
  let cH = 0, cD = 0, bH = 0, bN = 0;
  return days.map(d => {
    if (d.wait) return {d: d.d, w: true, x: d};
    const D = (Number(d.hit) || 0) + (Number(d.miss) || 0);
    if (D > 0) { cH += Number(d.hit) || 0; cD += D; bH += Number(d.bh) || 0; bN += Number(d.bn) || 0; }
    return {d: d.d, o: cD ? (cH / cD) * 100 : null, b: bN ? (bH / bN) * 100 : null, x: d};
  });
}

/** 꺾은선 — rows = [{o, b, w}] · onPick(i) 를 주면 누르는 그래프(처음 = start) · mini = 첫 화면 칸(그림만 · 칸 전체가 고리) */
export function lineChart({rows, label, onPick = null, start = null, mini = false}) {
  const W = 300, H = mini ? 64 : 150, P = 6, n = rows.length, step = (W - 2 * P) / Math.max(1, n - 1);
  const vals = rows.flatMap(r => [r.o, r.b]).filter(Number.isFinite), top = Math.max(10, Math.ceil((Math.max(0, ...vals) * 1.2) / 10) * 10);
  const X = i => (n > 1 ? P + i * step : W / 2), Y = v => H - P - (v / top) * (H - 2 * P);
  const svg = sv('svg', {class: 'th-lnsvg', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false'});
  const w0 = rows.findIndex(r => r.w);
  if (w0 >= 0) { const x0 = Math.max(P, X(w0) - step / 2); svg.append(sv('rect', {class: 'wz', x: x0.toFixed(1), y: P, width: (W - P - x0).toFixed(1), height: H - 2 * P, rx: 4})); }
  svg.append(sv('line', {class: 'z', x1: P, x2: W - P, y1: Y(0), y2: Y(0)}));
  const path = k => { let d = '', on = false; rows.forEach((r, i) => { const v = r[k]; if (Number.isFinite(v)) { d += `${on ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`; on = true; } else on = false; }); return d; };
  for (const k of ['b', 'o']) { const d = path(k); if (d) svg.append(sv('path', {class: k, d})); }
  const box = h('div', {class: 'th-ln' + (mini ? ' mini' : '')}, svg);
  if (!onPick) { box.setAttribute('aria-hidden', 'true'); return box; } // 첫 화면 칸 — 뜻은 칸 글 두 줄이 말함
  box.setAttribute('role', 'group'); box.setAttribute('aria-label', label); box.tabIndex = 0;
  const sel = sv('line', {class: 'sel', y1: P, y2: H - P}), so = sv('circle', {class: 'so', r: 5}), sb = sv('circle', {class: 'sb', r: 5});
  svg.append(sel, sb, so);
  let k = -1;
  const pickAt = (i, call = true) => {
    i = Math.max(0, Math.min(n - 1, i)); if (i === k) return; k = i;
    const x = X(i).toFixed(1), r = rows[i]; sel.setAttribute('x1', x); sel.setAttribute('x2', x);
    for (const [c, v] of [[so, r.o], [sb, r.b]]) { if (Number.isFinite(v)) { c.setAttribute('cx', x); c.setAttribute('cy', Y(v).toFixed(1)); c.removeAttribute('display'); } else c.setAttribute('display', 'none'); }
    if (call) onPick(i);
  };
  const at = ev => { const b = svg.getBoundingClientRect(); if (b.width) pickAt(Math.round((((ev.clientX - b.left) / b.width) * W - P) / step)); };
  box.addEventListener('pointerdown', ev => { try { box.setPointerCapture(ev.pointerId); } catch { /* 잡기 없음 */ } at(ev); });
  box.addEventListener('pointermove', ev => { if (ev.buttons || ev.pointerType === 'mouse') at(ev); });
  box.addEventListener('keydown', ev => { const m = {ArrowLeft: -1, ArrowRight: 1}[ev.key]; if (m) { pickAt(k + m); ev.preventDefault(); } else if (ev.key === 'Home' || ev.key === 'End') { pickAt(ev.key === 'Home' ? 0 : n - 1); ev.preventDefault(); } });
  box.pickAt = pickAt;
  pickAt(start ?? n - 1);
  return box;
}
