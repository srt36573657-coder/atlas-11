/* ATLAS 11 · 지도 섬 — 모든 화면 그림 칸 맨 아래(첫 화면 「후보 7」은 섬이 곧 그림이라 뺌)
   사장님 2026-10-09 19:27 · 19:45 「모든곳에 3d를 다 적용시키고 정말 스마트하게 하라 · 미국장 한국장 모든 페이지를 말하는것이다
   · 잡스라면 어떻게 할것인가 36번 고민 하라 · 아틀란스에 본질이 중심이 되어야 한다」
   본질(잡스 36 고민 1 · 6 · 8) = ATLAS 는 지도 — 첫 화면 섬(island.js)과 같은 섬 · 같은 자리(업종 십자 구역) · 같은 높이(1년 추세 차례) · 같은 물(그물 기준선)
   · 어느 화면에서나 같은 방향(지도는 움직이지 않음) · 화면마다 다른 것은 빛나는 곳 하나
   · 빛나는 곳 = 그 화면 그림이 말하는 회사(그림 속 회사 고리 #/stock/… · 업종 고리 #/i/… 의 회사들 · 관심 화면은 이 기기에 남긴 회사) = 옥빛 · 화면의 주인공(회사 화면 · 비교 첫째) = 금빛 · 나머지는 어둠
   · 빛낼 곳이 없거나 절반을 넘으면(시장 · 지도처럼 전체를 말하는 화면) = 20거래일 오름 빨강 · 내림 파랑(지도의 날씨 — 탑마다 판 읽기 r20 부호)
   · 가만히 두면 멈춤 · 탑을 누르면 이름표(이름 · 업종 · 「회사 보기 ›」) · 옆으로 끌면 돎 · 놓으면 천천히 멈춤 · 움직임 줄이기 = 바로
   · 그림 값(data-check) 없음 — 그 화면의 값은 위 자료 그림 · 이 섬은 자리를 보이는 지도(새 셈 없음 · 판 읽기 값만 · 그림 속 글자는 HTML) */
import {h, finite} from './util.js';
import {islandModel, A, MAP, tapStep, tapInfo, zoneOf, hullOf, hitCell, tapPointOf} from './island-model.js';
import {PAL, FACES} from './island.js';

const mm = q => typeof matchMedia === 'function' && matchMedia(q).matches;
const TH = MAP.th, TILT = MAP.tilt; // 지도는 늘 같은 방향 · 모양은 island-model.js MAP(백만 번 맞대기가 같은 값으로 잼)
const SKIP = new Set(['cand']); // 첫 화면만 뺌(섬이 곧 그림 · 같은 3단 클릭) — 2026-10-09 21:33 「모든곳에 하나도 빠짐없이」부터 안내 · 기록 · 읽는 법 연습 · 빈 하늘 화면에도 지도 섬(그 화면에 빛낼 회사가 없으면 지도의 날씨)
const UP = [214, 69, 69], DOWN = [53, 110, 196]; // 오름 빨강 · 내림 파랑(화면 색 변수를 못 읽을 때)
function cssRgb(name, fb) { // 화면 색 변수(--up · --down) → [r, g, b]
  try { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); let m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) return [0, 2, 4].map(k => parseInt(m[1].slice(k, k + 2), 16));
    m = v.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/i); if (m) return [Number(m[1]), Number(m[2]), Number(m[3])]; } catch {}
  return fb;
}

/**
 * C = 판 읽기 후보 묶음(lens.cand — 섬 자리 · 높이 · 물) · stocks = 판 읽기 종목 · lit = 빛낼 회사 기호들 · gold = 주인공 기호 · heat = 지도의 날씨(오름 · 내림)
 * 반환 {el, model} 또는 null(값이 없음 — 그리지 않음)
 */
export function islandMap(C, stocks, {lit = [], gold = null, heat = false, who = '이 그림의'} = {}) {
  const M = islandModel(C, stocks); if (!M) return null;
  const cells = M.cells, n = cells.length, W0 = M.w, byCode = new Map(cells.map((c, i) => [c.code, i]));
  const litSet = new Set([...lit].filter(c => byCode.has(c))), goldI = gold != null && byCode.has(String(gold)) ? byCode.get(String(gold)) : -1;
  const r20 = new Map(stocks.map(s => [String(s.code), finite(s.r20) ? s.r20 : null])), sgn = i => { const v = r20.get(cells[i].code); return v == null ? 0 : v > 0 ? 1 : v < 0 ? -1 : 0; };
  const nUp = heat ? cells.filter((_, i) => sgn(i) > 0).length : 0, nDown = heat ? cells.filter((_, i) => sgn(i) < 0).length : 0;
  const capTxt = heat ? `지도 · ${n}곳 · 빨강 = 20거래일 오름 ${nUp}곳 · 파랑 = 내림 ${nDown}곳 · 탑 높이 = 1년 추세 차례 · 물 = 그물 기준선`
    : `지도 · ${n}곳 가운데 ${who} ${litSet.size + (goldI >= 0 && !litSet.has(cells[goldI].code) ? 1 : 0)}곳이 빛남${goldI >= 0 ? ` · 금빛 = ${cells[goldI].name}` : ''} · 탑 높이 = 1년 추세 차례 · 물 = 그물 기준선`;
  const canvas = h('canvas', {class: 'imap-cv', role: 'img', 'aria-label': `ATLAS 지도 — ${capTxt}`});
  const tag = h('p', {class: 'imap-tag', hidden: true});
  const zone = h('div', {class: 'imap-zone', hidden: true, 'aria-live': 'polite'}); // 3단 클릭 — 누른 탑의 업종(업종 보기 · 같은 업종 회사 이름 → 회사 화면)
  const stage = h('div', {class: 'imap-stage'}, canvas, tag);
  const el = h('div', {class: 'imap', 'data-nav': '3', 'data-map': JSON.stringify({n, lit: litSet.size, gold: goldI >= 0 ? cells[goldI].code : null, heat, up: nUp, down: nDown})},
    stage, zone, h('p', {class: 'imap-cap'}, capTxt + ' · 탑을 누르면 회사 · 업종'));
  const ctx = canvas.getContext('2d');
  let pal = mm('(prefers-color-scheme: dark)') ? PAL.dark : PAL.light, rm = mm('(prefers-reduced-motion: reduce)'), upC = UP, downC = DOWN;
  let Wp = 0, Hp = 0, s = 10, cx = 0, cy = 0, zmax = 60, dpr = 1, th = TH, sinT = 0, cosT = 1, vth = 0, raf = 0, dragging = false, st = {z: null, i: -1};
  const tilt = TILT, order = cells.map((_, i) => i); // 눕힘 0.7 · 탑 높이 0.15 — 처음 모습에서 업종 73개 모두 누를 수 있게(앞 탑에 통째로 가린 업종 0 · 백만 번 맞대기가 잼)
  const view = () => ({th, s, cx, cy, tilt, zmax});
  const P = (x, y, z) => { const xr = x * cosT - y * sinT, yr = x * sinT + y * cosT; return [cx + xr * s, cy + yr * s * tilt - z * zmax]; };
  const rgb = (c, k = 1, a = 1) => `rgba(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)},${a})`;
  const mix = (c, k) => (k <= 0 ? c : [c[0] + (pal.fade[0] - c[0]) * k, c[1] + (pal.fade[1] - c[1]) * k, c[2] + (pal.fade[2] - c[2]) * k]);
  const lighten = (c, k) => [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k];
  const corners = i => { const x = cells[i].x, y = cells[i].y; return [[x - A, y - A], [x + A, y - A], [x + A, y + A], [x - A, y + A]]; };
  const lights = i => i === goldI || litSet.has(cells[i].code);
  const dim = !heat && (litSet.size > 0 || goldI >= 0);
  const pinIs = heat ? [] : cells.map((_, i) => i).filter(lights), PINS = pinIs.length > 0 && pinIs.length <= 7; // 빛나는 곳이 일곱 곳 이하면 탑마다 작은 핀(앞 탑에 가려도 자리가 보임 · 글자 없음)
  function colorsOf(i, under) { // [옆면, 윗면]
    if (i === goldI) return [pal.hero, pal.heroT];
    if (i === st.i) return [pal.focus, pal.focusT];
    if (heat) { const g = sgn(i), base = g > 0 ? upC : g < 0 ? downC : pal.gray; return under ? [mix(base, 0.78), mix(base, 0.66)] : [base, lighten(base, 0.35)]; } // 물 아래는 같은 색을 옅게(물 위 오름 · 내림이 먼저 읽히게)
    if (litSet.has(cells[i].code)) return [pal.seven, pal.sevenT];
    const pair = under ? [pal.stone, pal.stoneT] : cells[i].elig ? [pal.net, pal.netT] : [pal.gray, pal.grayT];
    return dim ? [mix(pair[0], 0.55), mix(pair[1], 0.55)] : pair;
  }
  function size() { const w = Math.round(stage.clientWidth); if (!w) return false; // 폭이 잡힌 뒤에만(지레짐작한 폭으로 그리지 않음)
    Wp = w; Hp = Math.round(stage.clientHeight) || Math.round(Wp * MAP.h); dpr = Math.min(2, window.devicePixelRatio || 1); // 높이는 CSS(가로 100 : 세로 80)가 붙는 순간 정함 — 그린 뒤 칸 높이가 바뀌어 「보던 자리」가 밀리지 않게
    canvas.width = Math.round(Wp * dpr); canvas.height = Math.round(Hp * dpr);
    s = (Wp - 12) / 26.4; cx = Wp / 2; cy = Hp * MAP.cy; zmax = Wp * MAP.z; upC = cssRgb('--up', UP); downC = cssRgb('--down', DOWN); return true; }
  function prism(i, z0, z1, side, top, glow) {
    const cs = corners(i);
    for (const f of FACES) {
      const nyr = f[2] * sinT + f[3] * cosT; if (nyr <= 0.001) continue;
      const nxr = f[2] * cosT - f[3] * sinT, sh = 0.80 - 0.20 * nxr, a = cs[f[0]], b = cs[f[1]];
      const p1 = P(a[0], a[1], z0), p2 = P(b[0], b[1], z0), p3 = P(b[0], b[1], z1), p4 = P(a[0], a[1], z1);
      ctx.fillStyle = rgb(side, sh); ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.closePath(); ctx.fill();
    }
    if (top) { if (glow) { ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 10; }
      ctx.fillStyle = rgb(top); ctx.beginPath(); cs.forEach(([x, y], k) => { const q = P(x, y, z1); if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
      if (glow) ctx.restore(); }
  }
  function ellipse(z, r, fill, line) { const c = P(0, 0, z); ctx.beginPath(); ctx.ellipse(c[0], c[1], r * s, r * s * tilt, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); } }
  const inZone = i => st.z != null && zoneOf(cells[i]) === st.z;
  const zOf = i => cells[i].hN + (i === st.i ? 8 / zmax : inZone(i) ? 5 / zmax : 0); // 누른 탑 · 그 업종은 조금 솟음
  function draw() {
    if (!Wp) return;
    sinT = Math.sin(th); cosT = Math.cos(th);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Wp, Hp);
    const sky = ctx.createLinearGradient(0, 0, 0, Hp); sky.addColorStop(0, pal.sky[0]); sky.addColorStop(1, pal.sky[1]); ctx.fillStyle = sky; ctx.fillRect(0, 0, Wp, Hp);
    order.sort((a, b) => (cells[a].x * sinT + cells[a].y * cosT) - (cells[b].x * sinT + cells[b].y * cosT));
    ellipse(0, 13.4, rgb(pal.base));
    for (const i of order) { const z = zOf(i), [sd, tp] = colorsOf(i, true); if (z <= 0.006) { prism(i, 0, 0.006, sd, tp, null); continue; } prism(i, 0, Math.min(z, W0), sd, z <= W0 ? tp : null, null); }
    ellipse(W0, 14.4, pal.sea, pal.rim);
    for (const i of order) { const z = zOf(i); if (z <= W0) continue; const [sd, tp] = colorsOf(i, false); prism(i, W0, z, sd, tp, i === goldI ? pal.glowH : lights(i) ? pal.glow7 : null); }
    for (const i of order) { const L = !heat && lights(i), Z = inZone(i); if (!L && !Z) continue; // 앞 탑에 가려도 빛나는 곳 · 누른 업종이 보이게 — 테두리만 한 번 더(첫 화면 섬과 같은 법)
      const z = Math.max(zOf(i), 0.006), pts = []; for (const [x, y] of corners(i)) pts.push(P(x, y, 0), P(x, y, z));
      const hl = hullOf(pts); ctx.beginPath(); hl.forEach((q, k) => (k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      ctx.strokeStyle = Z ? rgb(pal.focusT, 1, 0.95) : (i === goldI ? pal.beam : pal.ring) + '0.75)'; ctx.lineWidth = Z ? 1.6 : 1.1; ctx.stroke(); }
    if (PINS) for (const i of pinIs.slice().sort((a, b) => (cells[a].x * sinT + cells[a].y * cosT) - (cells[b].x * sinT + cells[b].y * cosT))) { // 핀 — 뒤에서 앞으로 · 금빛은 조금 크게
      const g = i === goldI, r = g ? 6 : 4.5, t = P(cells[i].x, cells[i].y, Math.max(zOf(i), 0.006)), top = Math.max(r + 2, t[1] - (g ? 17 : 14)), ink = g ? pal.lead : pal.stem;
      ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(t[0], top + r); ctx.stroke();
      ctx.fillStyle = rgb(g ? pal.heroT : pal.sevenT); ctx.beginPath(); ctx.arc(t[0], top, r, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = ink; ctx.stroke(); }
    if (st.i >= 0) { // 누른 탑 이름표 — 탑 위(섬 칸 안으로)
      const focus = st.i, t = P(cells[focus].x, cells[focus].y, zOf(focus)); tag.hidden = false;
      const w = tag.offsetWidth || 140, hh = tag.offsetHeight || 26, x = Math.max(4, Math.min(Wp - w - 4, t[0] - w / 2)), y = Math.max(4, Math.min(Hp - hh - 4, t[1] - 10 - hh));
      tag.style.left = `${Math.round(x)}px`; tag.style.top = `${Math.round(y)}px`;
    } else tag.hidden = true;
  }
  const busy = () => dragging || vth !== 0;
  function step() { raf = 0; if (!dragging && vth) { th += vth; vth *= 0.92; if (Math.abs(vth) < 0.0004) vth = 0; } draw(); if (busy()) raf = requestAnimationFrame(step); }
  const kick = () => { if (rm) { vth = 0; draw(); return; } if (!raf) raf = requestAnimationFrame(step); };
  const hit = (px, py) => hitCell(cells, view(), zOf, px, py); // 셈은 island-model.js(첫 화면 섬 · 백만 번 맞대기와 같은 셈)
  function pick(i) { // 3단 클릭 — ① 섬 ② 누른 탑 = 그 회사(이름표 「회사 보기 ›」) + 그 업종(섬 아래 「업종 보기 ›」 · 같은 업종 회사 이름) ③ 누르면 그 화면
    st = tapStep(cells, st, i); const info = tapInfo(cells, st);
    if (!info) { tag.hidden = true; zone.hidden = true; zone.replaceChildren(); draw(); return; }
    tag.replaceChildren(h('span', {class: 'imap-nm', 'data-ident': ''}, info.co.name), ` · ${info.co.sec ?? '업종 없음'} · `, h('a', {href: info.co.href}, '회사 보기 ›'));
    zone.replaceChildren(h('p', {class: 'imap-zh'}, h('b', null, info.zone.label ?? '업종 없음'), ` · ${info.zone.cos.length}곳 · `, info.zone.href ? h('a', {href: info.zone.href}, '업종 보기 ›') : '업종 화면 없음'),
      h('p', {class: 'imap-cos'}, ...info.zone.cos.map(x => h('a', {class: 'imap-co', href: x.href, 'aria-current': x.on ? 'true' : null, 'data-ident': ''}, x.name))));
    zone.hidden = false; draw();
  }
  let down = null;
  stage.addEventListener('pointerdown', e => { if (e.target.closest?.('a')) return; down = {x: e.clientX, y: e.clientY, th, moved: false, lx: e.clientX, lt: performance.now()}; vth = 0; });
  stage.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!down.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) { down.moved = true; dragging = true; try { stage.setPointerCapture(e.pointerId); } catch {} }
    if (down.moved) { const now = performance.now(), dt = Math.max(8, now - down.lt); th = down.th - dx * 0.012; vth = rm ? 0 : -(e.clientX - down.lx) * 0.012 * 16 / dt * 0.4; down.lx = e.clientX; down.lt = now; kick(); }
  });
  const end = (e, cancel) => { if (!down) return; const d = down; down = null; dragging = false;
    if (!d.moved && !cancel) { const r = canvas.getBoundingClientRect(); pick(hit(e.clientX - r.left, e.clientY - r.top)); }
    if (performance.now() - d.lt > 90) vth = 0; kick(); };
  stage.addEventListener('pointerup', e => end(e, false));
  stage.addEventListener('pointercancel', e => end(e, true));
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { const w = Math.round(stage.clientWidth); if (w && w !== Wp) { size(); draw(); } }) : null;
  ro?.observe(stage);
  if (typeof matchMedia === 'function') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', ev => { pal = ev.matches ? PAL.dark : PAL.light; upC = cssRgb('--up', UP); downC = cssRgb('--down', DOWN); draw(); });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', ev => { rm = ev.matches; });
  }
  let waits = 0; const first = () => { if (!el.isConnected) { if (++waits < 60) requestAnimationFrame(first); return; } if (size()) draw(); else if (!ro && ++waits < 60) requestAnimationFrame(first); };
  requestAnimationFrame(first);
  el.__imap = {state: () => ({th, focus: st.i >= 0 ? cells[st.i].code : null, zone: st.z, busy: busy(), gold: goldI >= 0 ? cells[goldI].code : null, lit: [...litSet], heat}),
    tapPoint: code => { const i = byCode.get(String(code)); if (i == null) return null; return tapPointOf(cells, view(), zOf, i); }};
  return {el, model: M};
}

/** 화면을 그린 뒤 그림 칸 맨 아래에 지도 섬 하나(app.js route) — 첫 화면 · 안내 · 기록 화면은 뺌 · 판 읽기를 못 읽거나 섬을 그릴 값이 없으면 조용히 넘어감(지어내지 않음) */
export async function attachMap(main, view, hash, loadLens) {
  if (SKIP.has(view)) return null;
  const sec = main.querySelector('section[data-art], section.rt[data-place]'); // 그림 칸(업종 순환은 순환 그림 칸)
  if (!sec || sec.querySelector('.isl, .imap') || sec.dataset.art === 'cand') return null; // 빈 하늘(그 화면 그림 값이 없는 날)에도 지도는 붙임 — 지도는 그 화면의 값이 아니라 길(판 읽기를 못 읽으면 아래에서 조용히 넘어감)
  let lens = null; try { lens = await loadLens(); } catch { return null; }
  const C = lens?.cand, stocks = lens?.stocks ?? []; if (!C?.ready || !C.grow?.m || !stocks.length || !sec.isConnected) return null;
  const codes = new Set(), secs = new Set(), all = new Set(stocks.map(s => String(s.code)));
  for (const a of sec.querySelectorAll('a[href]')) { const href = a.getAttribute('href') ?? ''; let m;
    if ((m = href.match(/^#\/stock\/([A-Za-z0-9][A-Za-z0-9.\-]{0,11})$/)) && all.has(m[1])) codes.add(m[1]);
    else if ((m = href.match(/^#\/i\/([a-z0-9]+)$/))) secs.add(m[1]); }
  for (const s of stocks) if (secs.has(s.g)) codes.add(String(s.code));
  if (view === 'watch') { // 관심 — 이 기기에 남긴 회사가 빛남(빼면 지도도 다시 · 모두 빼면 지도의 날씨)
    const ol = main.querySelector('.wl-list');
    if (ol && !ol.__imapObs) { ol.__imapObs = new MutationObserver(() => { sec.querySelector('.imap')?.remove(); attachMap(main, view, hash, loadLens).catch(() => {}); }); ol.__imapObs.observe(ol, {childList: true}); }
    for (const li of main.querySelectorAll('.wl-row[data-code]')) if (all.has(li.dataset.code)) codes.add(li.dataset.code); } // 모두 빼면 지도의 날씨
  let gold = null;
  if (view === 'stock') { gold = hash.match(/^#\/stock\/([A-Za-z0-9][A-Za-z0-9.\-]{0,11})$/)?.[1] ?? null; for (const s of stocks) if (String(s.code) === gold) { for (const t of stocks) if (t.g === s.g) codes.add(String(t.code)); } } // 회사 화면 — 그 탑 금빛 · 같은 업종 옥빛
  if (view === 'compare') { // 비교 — 첫째 금빛 · 둘째 옥빛(그림 값 data-check 의 짝 · 짝을 바꾸면 지도도 다시)
    const lab = sec.querySelector('[data-check]'); let pr = null; try { pr = JSON.parse(lab?.dataset.check ?? 'null'); } catch {}
    if (pr?.a) { gold = String(pr.a); if (pr.b) codes.add(String(pr.b)); }
    if (lab && !lab.__imapObs) { lab.__imapObs = new MutationObserver(() => { sec.querySelector('.imap')?.remove(); attachMap(main, view, hash, loadLens).catch(() => {}); }); lab.__imapObs.observe(lab, {attributes: true, attributeFilter: ['data-check']}); } }
  if (gold && !all.has(gold)) gold = null;
  if (gold) codes.delete(gold);
  const heat = !gold && (!codes.size || codes.size > stocks.length * 0.5); // 빛낼 곳이 없거나 절반을 넘으면 = 지도의 날씨(오름 · 내림)
  const m = islandMap(C, stocks, {lit: heat ? [] : [...codes], gold, heat, who: view === 'watch' ? '관심 종목' : '이 그림의'});
  if (m && sec.isConnected && !sec.querySelector('.imap')) { const ra = [...sec.children].find(c => c.classList.contains('ra')); if (ra) ra.after(m.el); else sec.append(m.el); } // 그림 바로 아래(업종 순환처럼 긴 목록이 뒤따르는 칸도 그림 곁에)
  return m;
}
