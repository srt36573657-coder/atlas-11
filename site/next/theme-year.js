/* 지난 한 해 다시 보기 — 움직임과 자료(사장님 2026-10-21(서울) 10:44 「1.2.3 번에 행성이 어떻게 움직었는지 지난 1년에 주식 변화를 그래프로도 이 우주안에서 동영상으로 보여줘야해 1번 보여주고 그다음 2번 보여주고 그다음 3번 보려주는거야」 · 11:07 「음 단추가 아니라 자동으로 보여주게해」)
   theme-home.js yearBox 가 칸 뼈대(단추 · 머리 줄 · 아래 글)를 첫 그림에 그리고, 창 load 뒤 한가할 때 이 파일을 받음(첫 그림 가볍게 — 느린 4G 2.5초 · check_white ③) · 모양 = theme-year.css(같이 받고 붙은 뒤 그림)
   첫 화면이 열리면 저절로 돎: 1번 행성이 지난 한 해를 9초에 돌고(궤도 위 행성 + 아래 줄 그림이 함께 · 그 업종 지수와 시장 지수 · 한 해 전 = 100) → 1.8초 머묾 → 2번 → 3번 → 멈춤
   그림 칸 전체가 단추 하나 — 누르면 멈춤 · 이어 보기 · 끝나면 다시 보기(5초 넘게 움직이는 것은 멈추는 길이 있어야 함 · WCAG 2.2.2)
   자료 = /next/data/theme-path.json(올릴 때 셈 — theme-engine.js pathOf) · 첫 화면 자료와 같은 날 · 같은 셋일 때만 씀(아니면 「?」 한 줄 · 궤도는 멈춘 그대로)
   날짜 글은 쓰지 않음(첫 화면에 보이는 날짜는 띠에 한 번 — [6] 2 · 「1년 전」 · 「오늘」만) · 앞날 말 없음 · 사고팔기 권하지 않음 · 지난 기록만
   움직임 줄이기(prefers-reduced-motion)면 저절로 돌지 않음 · 한 번 연 쪽에서 한 번만 저절로(다른 쪽에 갔다 오면 멈춘 그림 + 다시 보기) · 쪽이 숨거나 그림이 화면 밖이면 쉼
   글은 textContent 로만(보안 규칙) · 그림 속 움직임은 그림 단위 값만 바꿈(칸 밀림 0) */
import {ORB_R, planetSrc, seasonAngle} from './theme-home.js';

const nx = () => globalThis.NX;
const sv = (...a) => nx().sv(...a);
const txt = (x, y, s, a = {}) => { const e = sv('text', {x, y, ...a}); e.textContent = s; return e; };
const YR = {ran: false, k: 0}; // 이 쪽에서 저절로 돈 적 있나 · 마지막에 보인 번호(모듈은 한 번만 받으므로 쪽을 오가도 그대로)
let SEQ = 0;
const okPath = (P, TH, names) => !!P && P.schema === 'dori-theme-1-path' && P.asOf === TH.asOf && Array.isArray(P.M) && P.M.length >= 2 && P.M.every(Number.isFinite) && Array.isArray(P.inds) && P.inds.length === names.length
  && P.inds.every((i, k) => i.n === names[k] && [i.x, i.y, i.I].every(a => Array.isArray(a) && a.length === P.M.length && a.every(Number.isFinite)) && typeof i.z === 'string' && i.z.length === P.M.length);
const pctTxt = v => { const a = Math.round(v); return (a > 0 ? '+' : a < 0 ? '−' : '') + Math.abs(a) + '%'; };
const lerpA = (a0, a1, f) => { let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a0 + d * f; }; // 짧은 쪽으로 돎
/** 다시 보기 화살(↻ — 글꼴에 맡기지 않고 그림으로) */
const REPLAY = (() => { const c = [310, 14], r = 7, Q = a => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)], s = -Math.PI / 3, e = Math.PI * 4 / 3, [x0, y0] = Q(s), [x1, y1] = Q(e), tx = -Math.sin(e), ty = Math.cos(e), qx = Math.cos(e), qy = Math.sin(e), f = v => v.toFixed(1);
  return {arc: `M${f(x0)} ${f(y0)}A${r} ${r} 0 1 1 ${f(x1)} ${f(y1)}`, head: `M${f(x1 + 4.5 * tx)} ${f(y1 + 4.5 * ty)}L${f(x1 + 3.5 * qx)} ${f(y1 + 3.5 * qy)}L${f(x1 - 3.5 * qx)} ${f(y1 - 3.5 * qy)}Z`}; })();
/** 모양 파일 — 붙은 뒤에 그림(늦어도 3초) */
const sheet = () => new Promise(res => {
  const href = '/next/theme-year.css';
  let l = [...document.querySelectorAll('link[rel="stylesheet"]')].find(x => x.getAttribute('href') === href);
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); }
  if (l.sheet) { res(); return; }
  const done = () => res(); l.addEventListener('load', done, {once: true}); l.addEventListener('error', done, {once: true}); setTimeout(done, 3000);
});

/** 움직임 붙이기 — TH = 첫 화면 자료 · top = 1 · 2 · 3번 업종(theme-home.json) · orb = 궤도 그림 · btn · svg · tt = yearBox 뼈대 */
export async function run({TH, top, orb, btn, svg, tt}) {
  const W = 326, H = 112, X1 = 236, Y0 = 34, Y1 = 84, RUN = 9000, HOLD = 1800, TAIL = 12, LO = 42, HI = 88, GAP = 19;
  const live = () => btn.isConnected;
  const [J] = await Promise.all([Promise.resolve(nx()?.need?.('themePath')).catch(() => null), sheet()]);
  if (!live()) return;
  if (!okPath(J, TH, top.map(i => i.n))) { svg.append(txt(0, 64, '? 한 해 길을 받지 못했어요.', {class: 'th-yra'})); return; } // 자료가 없거나 첫 화면 자료와 날이 다름 — 멈춘 궤도 그대로
  const M = J.M, last = M.length - 1, xS = i => X1 * i / last;

  // 오른쪽 위 작은 표(멈춤 ⏸ · 이어 보기 ▶ · 다시 보기 ↻)
  const ic = sv('g', {class: 'th-yri'}), icPause = sv('g'), icPlay = sv('path', {d: 'M305 6.5L318 14L305 21.5Z', display: 'none'}), icAgain = sv('g', {display: 'none'});
  icPause.append(sv('rect', {x: 304, y: 8, width: 4, height: 12, rx: 1}), sv('rect', {x: 312, y: 8, width: 4, height: 12, rx: 1}));
  icAgain.append(sv('path', {d: REPLAY.arc, class: 'th-yrar'}), sv('path', {d: REPLAY.head}));
  ic.append(sv('circle', {cx: 310, cy: 14, r: 14, class: 'th-yric'}), icPause, icPlay, icAgain);
  // 줄 그림: 100 줄(한 해 전) · 업종 한 해 흐린 길 · 지금까지의 두 줄(가림 네모로 늘려 감) · 두 머리 · 끝 수
  const cid = 'th-yrc' + (++SEQ), defs = sv('defs'), cp = sv('clipPath', {id: cid}), clip = sv('rect', {x: -6, y: 0, width: 0, height: H});
  cp.append(clip); defs.append(cp);
  const base = sv('line', {x1: 0, x2: X1, y1: Y1, y2: Y1, class: 'th-yrb0'}), ghost = sv('path', {class: 'th-yrgh'});
  const lines = sv('g', {'clip-path': `url(#${cid})`}), lm = sv('path', {class: 'th-yrlm'}), li = sv('path', {class: 'th-yrli'}); lines.append(lm, li);
  const hm = sv('circle', {r: 3.5, class: 'th-yrhm'}), hd = sv('circle', {r: 5, class: 'th-yrhi'});
  const vi = txt(W, LO, '', {class: 'th-yrv', 'text-anchor': 'end'}), vm = txt(W, HI, '', {class: 'th-yrv th-yrvm', 'text-anchor': 'end'});
  svg.append(defs, ic, base, ghost, lines, hm, hd, vi, vm);
  // 궤도 위 움직이는 행성(그림 무리 맨 위 · 누르는 곳보다 아래 · 손가락을 받지 않음): 꼬리 · 빛 테 · 행성 · 번호
  const vb = orb.viewBox?.baseVal, OW = vb?.width || 326, OH = vb?.height || 240, ocx = OW / 2, ocy = OH / 2, R = ORB_R;
  const PO = (r, a) => [ocx + r * Math.cos(a), ocy - r * Math.sin(a)];
  const og = orb.querySelector('g[aria-hidden="true"]') ?? orb, ov = sv('g', {class: 'th-yro'});
  const tails = Array.from({length: TAIL}, (_, j) => sv('circle', {r: (3 - j * 0.15).toFixed(2), class: 'th-yrtl', opacity: 0}));
  const glow = sv('circle', {r: 16, class: 'th-yrgw'}), pl = sv('image', {width: 24, height: 24}), nb = sv('circle', {cx: ocx, cy: ocy, r: 12, class: 'th-yrnb'}), nbt = txt(ocx, ocy + 6, '1', {class: 'th-nbt', 'text-anchor': 'middle'}); // 움직이는 번호는 th-nb 가 아님(오늘 자리 번호 셋만 th-nb — check_theme 「번호가 그림 밖」)
  ov.append(...tails, glow, pl, nb, nbt); og.append(ov);
  const zls = [...orb.querySelectorAll('.th-zl[data-z]')];

  const PL = J.inds.map((p, j) => {
    const vals = [...p.I, ...M, 100], lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.08 || 5;
    const yS = v => Y1 - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * (Y1 - Y0);
    const dOf = arr => arr.map((v, i) => (i ? 'L' : 'M') + xS(i).toFixed(1) + ' ' + yS(v).toFixed(1)).join('');
    return {n: p.n, g: top[j]?.g, a: p.x.map((x, i) => seasonAngle(x, p.y[i])), z: p.z, I: p.I, yS, dI: dOf(p.I), dM: dOf(M)};
  });
  let k = 0, t = 0, mode = 'wait', hold = 0, prev = 0, raf = 0, hid = document.hidden, off = false, cur = -1, sI = '', sM = '';
  const valAt = (arr, u) => { const i = Math.max(0, Math.min(last, Math.floor(u))), f = u - i; return i < last ? arr[i] + (arr[i + 1] - arr[i]) * f : arr[last]; };
  const angAt = (p, u) => { const i = Math.max(0, Math.min(last, Math.floor(u))), f = u - i; return i < last ? lerpA(p.a[i], p.a[i + 1], f) : p.a[last]; };
  const fit = () => { try { tt.removeAttribute('textLength'); tt.removeAttribute('lengthAdjust'); const max = 268; if (tt.getComputedTextLength() > max) { tt.setAttribute('textLength', max); tt.setAttribute('lengthAdjust', 'spacingAndGlyphs'); } } catch { /* 못 잼 */ } }; // 긴 이름(영어 판)이 작은 표에 닿지 않게
  function setIcon() {
    const m = mode === 'play' ? 'p' : mode === 'pause' ? 'r' : 'a';
    icPause.setAttribute('display', m === 'p' ? 'inline' : 'none'); icPlay.setAttribute('display', m === 'r' ? 'inline' : 'none'); icAgain.setAttribute('display', m === 'a' ? 'inline' : 'none');
    btn.setAttribute('aria-label', m === 'p' ? '멈춤' : m === 'r' ? '이어 보기' : '한 해 다시 보기');
  }
  function setPlanet(j) {
    if (cur === j) return; cur = j; YR.k = j; const p = PL[j];
    tt.textContent = `${j + 1}번 ${p.n}`; requestAnimationFrame(fit); // 영어 판은 바꿈 알림(마이크로 일) 뒤에 잼
    nbt.textContent = String(j + 1); pl.setAttribute('href', planetSrc(p.g));
    const b = p.yS(100).toFixed(1); base.setAttribute('y1', b); base.setAttribute('y2', b);
    ghost.setAttribute('d', p.dI); li.setAttribute('d', p.dI); lm.setAttribute('d', p.dM);
  }
  function drawGraph(p) { // 줄 그림 — t 까지
    const hx = xS(t), vI = valAt(p.I, t), vM = valAt(M, t), yI = p.yS(vI), yM = p.yS(vM);
    clip.setAttribute('width', (hx + 8).toFixed(1));
    hd.setAttribute('cx', hx.toFixed(1)); hd.setAttribute('cy', yI.toFixed(1)); hm.setAttribute('cx', hx.toFixed(1)); hm.setAttribute('cy', yM.toFixed(1));
    const a = pctTxt(vI - 100), b = pctTxt(vM - 100);
    if (a !== sI) { vi.textContent = a; sI = a; } if (b !== sM) { vm.textContent = b; sM = b; }
    let a1 = yI + 6, a2 = yM + 6; // 끝 수는 머리 옆 높이 · 서로 겹치지 않게 · 머리 줄과 아래 글에 닿지 않게
    if (Math.abs(a1 - a2) < GAP) { const m = (a1 + a2) / 2, s = a1 <= a2 ? -1 : 1; a1 = m + s * GAP / 2; a2 = m - s * GAP / 2; }
    const up = a1 <= a2; let lo = Math.min(a1, a2), hi = Math.max(a1, a2);
    if (lo < LO) { hi += LO - lo; lo = LO; } if (hi > HI) { lo -= hi - HI; hi = HI; } lo = Math.max(LO, lo);
    vi.setAttribute('y', (up ? lo : hi).toFixed(1)); vm.setAttribute('y', (up ? hi : lo).toFixed(1));
  }
  function draw() {
    const p = PL[k]; setPlanet(k); drawGraph(p);
    const a = angAt(p, t), [px, py] = PO(R, a);
    pl.setAttribute('x', (px - 12).toFixed(1)); pl.setAttribute('y', (py - 12).toFixed(1)); glow.setAttribute('cx', px.toFixed(1)); glow.setAttribute('cy', py.toFixed(1));
    tails.forEach((c, j) => { const u = t - (j + 1) * 1.5; if (u < 0) { c.setAttribute('opacity', 0); return; } const [x, y] = PO(R, angAt(p, u)); c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('opacity', (0.55 * (1 - j / TAIL)).toFixed(2)); });
    let [bx, by] = PO(R - 32, a); bx = Math.max(14, Math.min(OW - 14, bx)); by = Math.max(14, Math.min(OH - 14, by));
    nb.setAttribute('cx', bx.toFixed(1)); nb.setAttribute('cy', by.toFixed(1)); nbt.setAttribute('x', bx.toFixed(1)); nbt.setAttribute('y', (by + 6).toFixed(1));
    const z = p.z[Math.max(0, Math.min(last, Math.floor(t)))];
    for (const e of zls) e.classList.toggle('on', e.dataset.z === z);
  }
  function rest() { mode = 'done'; t = last; orb.classList.remove('th-run'); setPlanet(k); drawGraph(PL[k]); setIcon(); } // 멈춘 그림 — 궤도는 오늘 자리 그대로 · 줄 그림은 한 해 전부
  function tick(now) {
    raf = 0; if (mode !== 'play' || hid || off) return;
    if (!live()) { mode = 'gone'; return; }
    const dt = Math.min(64, now - (prev || now)); prev = now;
    if (hold > 0) { hold -= dt; if (hold <= 0) { if (k < PL.length - 1) { k++; t = 0; draw(); } else { rest(); return; } } } // 한 해 끝 — 1.8초 머문 뒤 다음 번호(머무는 동안은 그리지 않음)
    else { t += dt * last / RUN; if (t >= last) { t = last; hold = HOLD; } draw(); }
    raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (mode === 'play' && !hid && !off && !raf) { prev = 0; raf = requestAnimationFrame(tick); } };
  function play() { mode = 'play'; YR.ran = true; orb.classList.add('th-run'); setIcon(); draw(); wake(); }
  btn.addEventListener('click', () => {
    if (mode === 'play') { mode = 'pause'; setIcon(); } // 그 자리에 멈춤(궤도 · 줄 그림 그대로)
    else if (mode === 'pause') play();
    else if (mode === 'done') { k = 0; t = 0; hold = 0; play(); } // 다시 보기 = 1번부터
  });
  const onVis = () => { if (!live()) { document.removeEventListener('visibilitychange', onVis); return; } hid = document.hidden; wake(); }; // 쪽이 숨으면 쉼 · 돌아오면 이어 감
  document.addEventListener('visibilitychange', onVis);
  if (globalThis.IntersectionObserver) { const seen = new Map(), io = new IntersectionObserver(es => { if (!live()) { io.disconnect(); return; } for (const e of es) seen.set(e.target, e.isIntersecting); off = ![...seen.values()].some(Boolean); wake(); }); io.observe(orb); io.observe(btn); } // 그림이 화면 밖이면 쉼
  btn.disabled = false; requestAnimationFrame(fit);
  const still = YR.ran || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (still) { k = Math.min(YR.k, PL.length - 1); rest(); } else play();
}
