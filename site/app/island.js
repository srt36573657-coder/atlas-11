/* ATLAS 11 · 「후보 7」 섬 그림 — 첫 화면(#/) ② 그림 칸 · 옛 탑 일곱 줄(land3d.js)을 바꿈
   사장님 2026-10-09 17:02(마카오) 「잡스가 이 아틀란스를 개선한다면 3d방식으로 입체감과 정적인 상태를 만들고 상호 직용속에 유기적인 아틀란스를 만든다면」
   → 17:36 「어 변경하고 아주 색시한 전달력 있개 만들어서 반영해」
   잡스라면(애플 방식에서 옮김 — 잡스가 주식 화면을 말한 자료는 없음):
   · 가만히 두면 조각 — 처음에는 그날 종가 그대로 멈춘 그림(저절로 움직이지 않음 · 규칙 42) · 움직임은 사람이 손댈 때만
   · 만지면 살아남 — 옆으로 끌면 섬이 돌고 놓으면 천천히 멈춤(아이폰 2007 · 손가락이 곧 도구) · 탑을 누르면 그 탑이 솟고 같은 업종 다섯 곳이 차례로 따라 솟았다 가라앉음 · 물 위면 물결
   · 하나만 빛남(교본 「봐야 할 것 하나만 빛나고 나머지는 어둠」) — 고른 한 곳 = 금빛 탑 + 빛줄기 + 위 이름표(이름 · 1년 추세) · 나머지 여섯 = 옥빛 · 그물 안 = 옅은 청자 · 물 아래 = 어둠
   · 「막 올라옴」을 그림으로 — 7곳이 물을 뚫고 나온 자리에 멈춘 물결 두 겹 · 앞 탑에 가려도 7곳의 테두리가 옅게 보임(엑스선) — 7곳이 한눈에
   · 시간은 움직임으로 — 「재생」 = 20거래일 전(7곳이 물 아래) → 한 걸음에 한 곳씩 물 위로(물결) → 카드의 위험 줄 → 카드의 단추(기승전결 · 한 번에 하나)
   셈은 island-model.js(판 읽기 값만) · 이 파일은 그리기와 손 다루기
   · 그림 속 글자는 모두 HTML(이름표 · 핀 번호 · 경고) — 또렷함 · 말 바꾸기 · 화면 읽기 · 캔버스에는 글자가 없음
   · 캔버스 움직임은 rAF(손댈 때 · 재생 걸음 동안만) — 다 멈추면 그리지 않음(정적인 상태) · 움직임 줄이기 설정이면 바로 바뀜 */
import {h, finite} from './util.js';
import {islandModel, A, tapInfo, zoneOf, hullOf, hitCell} from './island-model.js';

const mm = q => typeof matchMedia === 'function' && matchMedia(q).matches;
export const PAL = {
  light: {sky: ['#F4F8F5', '#E2EBE5'], halo: 'rgba(79,143,119,0.16)', base: [210, 220, 214], stone: [190, 201, 195], stoneT: [220, 228, 223], net: [143, 191, 171], netT: [214, 236, 226],
    gray: [178, 186, 182], grayT: [214, 219, 216], seven: [38, 128, 99], sevenT: [94, 196, 158], hero: [176, 124, 26], heroT: [242, 190, 80], focus: [23, 48, 42], focusT: [79, 143, 119],
    fade: [228, 235, 231], sea: 'rgba(79,143,119,0.20)', rim: 'rgba(56,120,98,0.45)', ring: 'rgba(38,128,99,', beam: 'rgba(214,160,40,', lead: 'rgba(150,104,18,0.95)', stem: 'rgba(38,128,99,0.9)', glow7: null, glowH: 'rgba(214,160,40,0.55)'},
  dark: {sky: ['#0C1714', '#070E0C'], halo: 'rgba(95,201,162,0.13)', base: [20, 32, 28], stone: [26, 40, 35], stoneT: [36, 54, 47], net: [44, 76, 65], netT: [70, 112, 97],
    gray: [42, 49, 47], grayT: [60, 68, 65], seven: [60, 170, 132], sevenT: [146, 242, 204], hero: [222, 166, 52], heroT: [255, 220, 128], focus: [196, 228, 214], focusT: [240, 251, 246],
    fade: [15, 25, 21], sea: 'rgba(28,70,60,0.58)', rim: 'rgba(95,201,162,0.30)', ring: 'rgba(146,242,204,', beam: 'rgba(255,214,120,', lead: 'rgba(255,214,120,0.9)', stem: 'rgba(146,242,204,0.85)', glow7: 'rgba(95,231,177,0.5)', glowH: 'rgba(255,200,90,0.8)'},
};
export {A}; // 탑 한 변의 반(칸 = 1 · island-model.js) — 지도 섬이 함께 씀
export const FACES = [[1, 2, 1, 0], [3, 0, -1, 0], [2, 3, 0, 1], [0, 1, 0, -1]]; // 모서리 둘 · 바깥쪽 방향(x, y)
const pctTxt = v => (finite(v) ? `${Number(Math.abs(v).toFixed(1)) === 0 ? '' : v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%` : '셀 수 없음');

/**
 * C = 판 읽기 후보 묶음(lens.cand) · stocks = 판 읽기 종목(lens.stocks) · sel = 처음 고른 후보 기호 · onPick(code) = 후보를 고름(아래 카드)
 * 반환 {el, model, setSel(code, picked), bind(raBox)} 또는 null(값이 없음)
 */
export function candIsland(C, stocks, {sel = null, onPick = () => {}} = {}) {
  const M = islandModel(C, stocks); if (!M) return null;
  const cells = M.cells, n = cells.length, W0 = M.w, seven = M.seven, isSeven = new Set(seven);
  const canvas = h('canvas', {class: 'isl-cv', role: 'img', 'aria-label': `섬 하나 = ${n}곳 · 탑 높이 = 1년 추세 차례 · 물 높이 = 그물 기준선 · 물 위 ${M.above}곳 = 그물 안 · 빛나는 탑 ${seven.length}개 = 막 올라온 후보 · 금빛 = 고른 한 곳`});
  const hud = h('div', {class: 'isl-hud', 'aria-live': 'polite'}), tag = h('p', {class: 'isl-tag', hidden: true}), when = h('p', {class: 'isl-when', hidden: true});
  const zone = h('div', {class: 'imap-zone isl-zone', hidden: true, 'aria-live': 'polite'}); // 3단 클릭(2026-10-09 21:33) — 누른 탑의 업종: 업종 보기 › · 같은 업종 회사 이름(누르면 회사 화면) · 지도 섬과 같은 칸
  const pins = seven.map((i, k) => { const c = cells[i];
    return h('button', {type: 'button', class: 'isl-pin', 'data-at': String(k + 1), 'data-code': c.code, 'data-rank': String(c.rank), 'aria-label': `검토 순위 ${c.rank}위 ${c.name} — 1년 추세 ${pctTxt(c.m12)}`,
      onclick: e => { e.stopPropagation(); pickCand(i, true); }}); }); // 번호는 CSS(::before · data-rank) — 글자로 넣으면 단위 없는 숫자로 읽힘
  const stage = h('div', {class: 'isl-stage'}, canvas, ...pins, tag, when);
  const el = h('div', {class: 'isl', 'data-at': '0', 'data-nav': '3'}, stage, hud, zone); // 이름표는 섬 위(아주 큰 글씨면 섬 아래 — lens.css) · 업종 칸은 섬 아래
  const ctx = canvas.getContext('2d');
  // 상태 — hero = 아래 카드의 후보(금빛) · focus = 누른 탑(후보가 아니면 이름표만) · H = 지금 그리는 높이(0~1)
  let pal = mm('(prefers-color-scheme: dark)') ? PAL.dark : PAL.light, rm = mm('(prefers-reduced-motion: reduce)');
  let Wp = 0, Hp = 0, s = 12, cx = 0, cy = 0, zmax = 100, tilt = 0.6, dpr = 1, th = 0, sinT = 0, cosT = 1;
  let hero = Math.max(0, seven.findIndex(i => cells[i].code === sel)), heroI = seven[hero] ?? -1, focus = -1, picked = false;
  const H = Float64Array.from(cells, c => c.hN), lift = new Float32Array(n), liftV = new Float32Array(n), liftT = new Float32Array(n), liftAt = new Float64Array(n), dropAt = new Float64Array(n);
  let fade = 0, fadeT = 0, vth = 0, dragging = false, raf = 0, spin = null, rise = null, ripples = [], order = cells.map((_, i) => i);
  const quadOf = i => { if (i < 0) return 0.62; const c = cells[i], phi = Math.atan2(c.x, c.y), q = Math.PI / 4 + Math.round((phi - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2); return q; }; // 고른 탑이 앞쪽 4분의 1에 오는 등축 각도
  th = quadOf(heroI);
  const P = (x, y, z) => { const xr = x * cosT - y * sinT, yr = x * sinT + y * cosT; return [cx + xr * s, cy + yr * s * tilt - z * zmax]; };
  const rgb = (c, k = 1, a = 1) => `rgba(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)},${a})`;
  const mix = (c, k) => (k <= 0 ? c : [c[0] + (pal.fade[0] - c[0]) * k, c[1] + (pal.fade[1] - c[1]) * k, c[2] + (pal.fade[2] - c[2]) * k]);
  const corners = i => { const x = cells[i].x, y = cells[i].y; return [[x - A, y - A], [x + A, y - A], [x + A, y + A], [x - A, y + A]]; };
  function size() { // 실제 폭이 잡힌 뒤에만 — 폭이 0(아직 자리 없음)이면 그리지 않음(지레짐작한 폭으로 핀을 놓으면 섬 밖으로 나가 화면이 옆으로 넘침 · 2026-10-09 전체 검사 fa · 글씨 200%에서 한 번 잡힘)
    const w = Math.round(stage.clientWidth); if (!w) return false;
    Wp = w; Hp = Math.round(Wp * 0.94); dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(Wp * dpr); canvas.height = Math.round(Hp * dpr); canvas.style.height = Hp + 'px'; stage.style.height = Hp + 'px';
    s = (Wp - 12) / 26.4; cx = Wp / 2; cy = Hp * 0.665; zmax = Wp * 0.30;
    return true;
  }
  function prism(i, z0, z1, side, top, glow) {
    const cs = corners(i);
    for (const f of FACES) {
      const nyr = f[2] * sinT + f[3] * cosT; if (nyr <= 0.001) continue;
      const nxr = f[2] * cosT - f[3] * sinT, sh = 0.80 - 0.20 * nxr, a = cs[f[0]], b = cs[f[1]];
      const p1 = P(a[0], a[1], z0), p2 = P(b[0], b[1], z0), p3 = P(b[0], b[1], z1), p4 = P(a[0], a[1], z1);
      ctx.fillStyle = rgb(side, sh); ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.closePath(); ctx.fill();
    }
    if (top) {
      if (glow) { ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 14; }
      ctx.fillStyle = rgb(top); ctx.beginPath(); cs.forEach(([x, y], k) => { const q = P(x, y, z1); if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
      if (glow) ctx.restore();
    }
  }
  const fadeOf = i => (focus < 0 || i === focus || i === heroI || isSeven.has(i) || cells[i].d === cells[focus].d ? 0 : 0.72 * fade);
  function colorsOf(i, under) {
    const c = cells[i], k = fadeOf(i);
    const pair = i === heroI ? [pal.hero, pal.heroT] : i === focus ? [pal.focus, pal.focusT] : under ? [pal.stone, pal.stoneT] : c.rank ? [pal.seven, pal.sevenT] : c.elig ? [pal.net, pal.netT] : [pal.gray, pal.grayT];
    return [mix(pair[0], k), mix(pair[1], k)];
  }
  const zOf = i => H[i] + lift[i] / zmax;
  function ellipse(z, r, fill, line) { const c = P(0, 0, z); ctx.beginPath(); ctx.ellipse(c[0], c[1], r * s, r * s * tilt, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); } }
  function draw() {
    if (!Wp) return; // 폭이 잡히기 전(size)에는 그리지 않음
    sinT = Math.sin(th); cosT = Math.cos(th);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Wp, Hp);
    const sky = ctx.createLinearGradient(0, 0, 0, Hp); sky.addColorStop(0, pal.sky[0]); sky.addColorStop(1, pal.sky[1]); ctx.fillStyle = sky; ctx.fillRect(0, 0, Wp, Hp);
    const halo = ctx.createRadialGradient(cx, cy - zmax * 0.35, 4, cx, cy - zmax * 0.35, Wp * 0.62); halo.addColorStop(0, pal.halo); halo.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = halo; ctx.fillRect(0, 0, Wp, Hp);
    order.sort((a, b) => (cells[a].x * sinT + cells[a].y * cosT) - (cells[b].x * sinT + cells[b].y * cosT));
    ellipse(0, 13.4, rgb(pal.base));
    for (const i of order) { const z = zOf(i), [sd, tp] = colorsOf(i, true); if (z <= 0.006) { prism(i, 0, 0.006, sd, tp, null); continue; } prism(i, 0, Math.min(z, W0), sd, z <= W0 ? tp : null, null); } // 물 아래 몸통(물 아래 탑은 꼭대기까지)
    ellipse(W0, 14.4, pal.sea, pal.rim);
    const now = performance.now();
    ripples = ripples.filter(r => now - r.t < 1200);
    for (const r of ripples) { const p = (now - r.t) / 1200, c = P(cells[r.i].x, cells[r.i].y, W0), rad = (0.7 + 2.8 * p) * s; ctx.beginPath(); ctx.ellipse(c[0], c[1], rad, rad * tilt, 0, 0, Math.PI * 2); ctx.strokeStyle = pal.ring + (0.85 * (1 - p)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.stroke(); }
    for (const i of seven) { // 막 올라온 7곳 — 물을 뚫고 나온 자리에 멈춘 물결 두 겹(움직이지 않음 · 「물 위로 막 올라옴」을 그림으로)
      if (zOf(i) <= W0 + 0.004 || fadeOf(i)) continue;
      const c = P(cells[i].x, cells[i].y, W0), col = i === heroI ? pal.beam : pal.ring;
      for (const [rr, a] of [[0.9, 0.6], [1.5, 0.28]]) { ctx.beginPath(); ctx.ellipse(c[0], c[1], rr * s, rr * s * tilt, 0, 0, Math.PI * 2); ctx.strokeStyle = col + a + ')'; ctx.lineWidth = i === heroI ? 1.6 : 1.2; ctx.stroke(); }
    }
    for (const i of order) {
      const z = zOf(i); if (z <= W0) continue;
      const [sd, tp] = colorsOf(i, false), glow = i === heroI ? pal.glowH : cells[i].rank && !fadeOf(i) ? pal.glow7 : null;
      prism(i, W0, z, sd, tp, glow);
    }
    for (const i of seven) { // 앞 탑에 가려도 7곳이 보이게 — 물 위 몸의 테두리만 옅게 한 번 더(엑스선처럼)
      const z = zOf(i); if (z <= W0 + 0.004 || fadeOf(i)) continue;
      const pts = []; for (const [x, y] of corners(i)) pts.push(P(x, y, W0), P(x, y, z));
      const hl = hullOf(pts); ctx.beginPath(); hl.forEach((q, k) => (k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      ctx.strokeStyle = (i === heroI ? pal.beam : pal.ring) + '0.75)'; ctx.lineWidth = 1.1; ctx.stroke();
    }
    if (heroI >= 0) { // 금빛 빛줄기 — 고른 한 곳 위로(하나만 빛남)
      const t = P(cells[heroI].x, cells[heroI].y, zOf(heroI)), g = ctx.createLinearGradient(0, t[1], 0, Math.max(0, t[1] - zmax * 0.9));
      g.addColorStop(0, pal.beam + '0.42)'); g.addColorStop(1, pal.beam + '0)'); ctx.fillStyle = g; ctx.fillRect(t[0] - s * 0.42, Math.max(0, t[1] - zmax * 0.9), s * 0.84, t[1] - Math.max(0, t[1] - zmax * 0.9));
    }
    // 핀(HTML) 자리 — 겹치지 않게(고른 한 곳 먼저 · 순위 차례 · 위로 쌓거나 옆으로) · 위 이름표 자리를 피함 · 줄기는 탑 꼭대기에서
    const hudR = hud.offsetWidth && hud.offsetTop + hud.offsetHeight < Hp ? [hud.offsetLeft - 4, hud.offsetTop - 4, hud.offsetLeft + hud.offsetWidth + 4, hud.offsetTop + hud.offsetHeight + 4] : null;
    const placed = [], spot = new Map();
    for (const i of [...seven].sort((a, b) => (b === heroI) - (a === heroI) || cells[a].rank - cells[b].rank)) {
      const t = P(cells[i].x, cells[i].y, zOf(i)), r = i === heroI ? 16 : 13, off = i === heroI ? 30 : 24;
      const tries = [[0, -off]]; // 곧장 위 → 둘레 30 · 60 · 90px 를 위쪽부터 돌며 빈 자리
      for (const ring of [30, 60, 90]) for (const deg of [-90, -60, -120, -30, -150, 0, 180, 30, 150]) tries.push([ring * Math.cos(deg * Math.PI / 180), -off + ring * Math.sin(deg * Math.PI / 180)]);
      let best = null;
      for (const strict of [true, false]) { // 둘째 바퀴 — 위 이름표 자리도 허락(핀끼리는 겹치지 않음)
        for (const [dx, dy] of tries) {
          const x = t[0] + dx, y = t[1] + dy;
          if (x < r + 2 || x > Wp - r - 2 || y < r + 2 || y > Hp - r - 2) continue;
          if (placed.some(q => Math.hypot(q[0] - x, q[1] - y) < q[2] + r + 3)) continue;
          if (strict && hudR && x + r > hudR[0] && x - r < hudR[2] && y + r > hudR[1] && y - r < hudR[3]) continue;
          best = [x, y]; break;
        }
        if (best) break;
      }
      if (!best) best = [t[0], t[1] - off];
      placed.push([best[0], best[1], r]); spot.set(i, best);
      ctx.strokeStyle = i === heroI ? pal.lead : pal.stem; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(best[0], best[1] + r - 2); ctx.stroke();
    }
    seven.forEach((i, k) => { const q = spot.get(i), b = pins[k]; b.style.left = `${Math.round(q[0])}px`; b.style.top = `${Math.round(q[1])}px`; });
    if (heroI >= 0) {
      const t = P(cells[heroI].x, cells[heroI].y, zOf(heroI)), py = spot.get(heroI)[1], hx = hud.offsetLeft + hud.offsetWidth, hy = hud.offsetTop + hud.offsetHeight - 6;
      const hxp = spot.get(heroI)[0]; if (hudR && Math.hypot(hxp - hx, py - hy) > 34) { ctx.strokeStyle = pal.lead; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(hx + 2, hy); ctx.lineTo(hxp - (hxp > hx ? 17 : -17), py); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (focus >= 0 && focus !== heroI) { // 누른 탑 이름표 — 탑 위 → 오른쪽 → 왼쪽 → 탑 발(물 높이 아래) 차례로 위 이름표 · 핀과 겹치지 않는 첫 자리(글 위에 글 없음)
      const t = P(cells[focus].x, cells[focus].y, zOf(focus)), f = P(cells[focus].x, cells[focus].y, Math.min(zOf(focus), W0)); tag.hidden = false;
      const w = tag.offsetWidth || 120, hh = tag.offsetHeight || 24, cl = (x, y) => [Math.max(4, Math.min(Wp - w - 4, x)), Math.max(4, Math.min(Hp - hh - 4, y))];
      const onHud = ([x, y]) => !!hudR && x + w > hudR[0] && x < hudR[2] && y + hh > hudR[1] && y < hudR[3];
      const onPin = ([x, y]) => placed.some(q => q[0] + q[2] > x && q[0] - q[2] < x + w && q[1] + q[2] > y && q[1] - q[2] < y + hh);
      const tries = [cl(t[0] - w / 2, t[1] - 10 - hh), cl(t[0] + 12, t[1] - hh / 2), cl(t[0] - 12 - w, t[1] - hh / 2), cl(f[0] - w / 2, f[1] + 10)];
      const pick = tries.find(q => !onHud(q) && !onPin(q)) ?? tries.find(q => !onHud(q)) ?? tries[0], [x, y] = pick;
      tag.style.left = `${Math.round(x)}px`; tag.style.top = `${Math.round(y)}px`;
      const inY = t[1] >= y && t[1] <= y + hh, inX = t[0] >= x && t[0] <= x + w;
      if (pick !== tries[0] && !(inX && inY)) { // 탑에서 떨어진 이름표 — 누른 탑 꼭대기에서 이름표까지 가는 줄 하나
        const ax = inY ? (t[0] < x ? x : x + w) : Math.max(x + 8, Math.min(x + w - 8, t[0])), ay = inY ? t[1] : (t[1] < y ? y : y + hh);
        ctx.strokeStyle = rgb(pal.focusT, 1, 0.85); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(ax, ay); ctx.stroke();
      }
    } else tag.hidden = true;
  }
  // 움직임 — 다 멈추면 그리지 않음(정적인 상태)
  const busy = () => dragging || vth !== 0 || spin || rise || ripples.length || Math.abs(fade - fadeT) > 0.004 || liftT.some((v, i) => v !== lift[i] || liftV[i] !== 0);
  function step() {
    raf = 0; const now = performance.now();
    if (spin) { const p = Math.min(1, (now - spin.t) / spin.ms), e = 1 - Math.pow(1 - p, 3); th = spin.a + (spin.b - spin.a) * e; if (p >= 1) spin = null; }
    else if (!dragging && vth) { th += vth; vth *= 0.92; if (Math.abs(vth) < 0.0004) vth = 0; }
    for (let i = 0; i < n; i++) {
      if (dropAt[i] && now >= dropAt[i]) { liftT[i] = 0; dropAt[i] = 0; }
      const tgt = now >= liftAt[i] ? liftT[i] : lift[i]; if (tgt === lift[i] && liftV[i] === 0) continue;
      liftV[i] += (tgt - lift[i]) * 0.16 - liftV[i] * 0.30; lift[i] += liftV[i];
      if (Math.abs(tgt - lift[i]) < 0.05 && Math.abs(liftV[i]) < 0.05 && now >= liftAt[i]) { lift[i] = tgt; liftV[i] = 0; }
    }
    fade += (fadeT - fade) * 0.2; if (Math.abs(fade - fadeT) <= 0.004) fade = fadeT;
    if (rise) { const p = Math.min(1, (now - rise.t) / rise.ms), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, c = cells[rise.i], z = c.hP + (c.hN - c.hP) * e;
      if (H[rise.i] <= W0 && z > W0) ripples.push({i: rise.i, t: now}); H[rise.i] = z; if (p >= 1) { H[rise.i] = c.hN; rise = null; } }
    draw();
    if (busy()) raf = requestAnimationFrame(step);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
  function settle() { // 움직임 줄이기 — 바로 끝 모습
    if (spin) { th = spin.b; spin = null; } vth = 0; fade = fadeT; ripples = [];
    for (let i = 0; i < n; i++) { if (dropAt[i]) { liftT[i] = 0; dropAt[i] = 0; } lift[i] = liftT[i]; liftV[i] = 0; liftAt[i] = 0; }
    if (rise) { H[rise.i] = cells[rise.i].hN; rise = null; }
    draw();
  }
  const go = () => (rm ? settle() : kick());
  function hudFill(past = false) { // past = 「재생」에서 고른 곳이 아직 물 위로 오르기 전(20거래일 전 값 — 그림과 이름표가 같은 때를 말함)
    const c = cells[heroI]; if (!c) { hud.replaceChildren(); return; }
    const say = past ? '20거래일 전 1년 추세 · 그물 밖(물 아래)' : c.status === 'met' || c.status == null ? '1년 추세 · 물 위로 막 올라옴' : c.status === 'wait' ? '1년 추세 · 그물 밖(물 아래)' : '1년 추세 · 재검토';
    hud.replaceChildren(h('p', {class: 'isl-h1'}, h('span', {class: 'isl-rk'}, `${c.rank}위`), ' ', h('span', {class: 'isl-nm', 'data-ident': ''}, c.name)),
      h('p', {class: 'isl-h2'}, h('b', {class: 'isl-big'}, pctTxt(past ? c.m12p : c.m12))), h('p', {class: 'isl-cap'}, say));
  }
  function liftWave(i) { // 누른 탑이 솟고 같은 업종이 가까운 차례로 따라 솟았다 가라앉음
    const now = performance.now(); let k = 0;
    for (let j = 0; j < n; j++) if (j !== i && cells[j].d === cells[i].d) { k++; liftT[j] = 7; liftAt[j] = now + 90 * k; dropAt[j] = now + 90 * k + 900; }
    if (cells[i].hN > W0) ripples.push({i, t: now});
  }
  function zoneFill(i) { // 3단 클릭 ② — 누른 탑의 업종(업종 보기 › · 같은 업종 회사 이름 → 회사 화면) · i < 0 = 닫음
    const info = i >= 0 ? tapInfo(cells, {z: zoneOf(cells[i]), i}) : null;
    if (!info) { zone.hidden = true; zone.replaceChildren(); return; }
    zone.replaceChildren(h('p', {class: 'imap-zh'}, h('b', null, info.zone.label ?? '업종 없음'), ` · ${info.zone.cos.length}곳 · `, info.zone.href ? h('a', {href: info.zone.href}, '업종 보기 ›') : '업종 화면 없음'),
      h('p', {class: 'imap-cos'}, ...info.zone.cos.map(x => h('a', {class: 'imap-co', href: x.href, 'aria-current': x.on ? 'true' : null, 'data-ident': ''}, x.name))));
    zone.hidden = false;
  }
  function pickCand(i, user, notify = true) { // 후보 고름 — 카드 · 금빛 · 이름표 · (사람이 고르면) 섬이 그 탑 쪽으로 돎
    if (!isSeven.has(i)) return;
    const prev = heroI; heroI = i; hero = seven.indexOf(i); focus = -1; fadeT = 0; zoneFill(-1);
    if (user) { picked = true; el.classList.add('picked'); for (let j = 0; j < n; j++) { liftT[j] = 0; dropAt[j] = 0; } liftT[i] = 10; liftAt[i] = performance.now(); liftWave(i);
      const b = quadOf(i); let d = b - th; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 0.01) spin = {a: th, b: th + d, t: performance.now(), ms: 700}; }
    pins.forEach((p, k) => { p.classList.toggle('sel', seven[k] === i); p.setAttribute('aria-pressed', String(seven[k] === i)); });
    hudFill();
    if (user && notify && prev !== i) onPick(cells[i].code);
    go();
  }
  function pickAny(i) { // 후보가 아닌 탑 — 이름표(회사 보기 ›) · 섬 아래 업종 칸(카드는 후보만) · 같은 업종이 답함 · 나머지는 흐려짐
    if (i < 0) { focus = -1; fadeT = 0; zoneFill(-1); go(); return; }
    if (isSeven.has(i)) { pickCand(i, true); return; }
    focus = i; fadeT = 1; for (let j = 0; j < n; j++) { liftT[j] = 0; dropAt[j] = 0; } liftT[i] = 10; liftAt[i] = performance.now(); liftWave(i);
    const c = cells[i];
    tag.replaceChildren(`${c.name} ${pctTxt(c.m12)} · ${c.hN > W0 ? (c.elig ? '그물 안' : '그물 안 · 기준 못 넘음') : c.m12 == null ? '1년 추세 셀 수 없음' : '그물 밖'} · `, h('a', {href: `#/stock/${c.code}`}, '회사 보기 ›'));
    zoneFill(i); go();
  }
  // 손 — 누르기(탑 · 핀) · 옆으로 끌기(돎 · 놓으면 천천히 멈춤) · 세로로 끌면 화면이 내려감(touch-action: pan-y)
  function hit(px, py) { sinT = Math.sin(th); cosT = Math.cos(th); return hitCell(cells, {th, s, cx, cy, tilt, zmax}, zOf, px, py); } // 셈은 island-model.js(지도 섬 · 백만 번 맞대기와 같은 셈)
  let down = null;
  stage.addEventListener('pointerdown', e => { if (e.target.closest?.('.isl-pin')) return; down = {x: e.clientX, y: e.clientY, th, moved: false, lx: e.clientX, lt: performance.now()}; vth = 0; spin = null; });
  stage.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!down.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) { down.moved = true; dragging = true; try { stage.setPointerCapture(e.pointerId); } catch {} }
    if (down.moved) { const now = performance.now(), dt = Math.max(8, now - down.lt); th = down.th - dx * 0.012; vth = rm ? 0 : -(e.clientX - down.lx) * 0.012 * 16 / dt * 0.4; down.lx = e.clientX; down.lt = now; kick(); }
  });
  const end = (e, cancel) => { if (!down) return; const d = down; down = null; dragging = false;
    if (!d.moved && !cancel) { const r = canvas.getBoundingClientRect(), i = hit(e.clientX - r.left, e.clientY - r.top); pickAny(i === focus ? -1 : i); }
    if (performance.now() - d.lt > 90) vth = 0; go(); };
  stage.addEventListener('pointerup', e => end(e, false));
  stage.addEventListener('pointercancel', e => end(e, true));
  // 재생 걸음(art.js 의 data-step) — 0 = 20거래일 전(7곳 물 아래) · 1~7 = 한 걸음에 한 곳씩 물 위로 · 그 뒤(카드 위험 줄 · 단추)와 끝 = 그날
  let wasDone = true;
  function onStep(box) {
    const done = box.classList.contains('ra-done'), i = Number(box.dataset.step), moving = box.classList.contains('ra-moving');
    if (!done && i === 0 && moving && wasDone) { const r = stage.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 70) stage.scrollIntoView({block: 'center', behavior: rm ? 'auto' : 'smooth'}); } // 「재생」은 그림 아래 — 섬을 화면 가운데로
    wasDone = done; rise = null;
    if (done || !(i >= 0)) { seven.forEach(j => { H[j] = cells[j].hN; }); when.hidden = true; }
    else if (i === 0) { seven.forEach(j => { H[j] = cells[j].hP; }); when.hidden = false; when.textContent = '20거래일 전 — 7곳은 물 아래'; }
    else if (i <= seven.length) {
      seven.forEach((j, k) => { H[j] = k < i - 1 ? cells[j].hN : cells[j].hP; });
      const j = seven[i - 1]; when.hidden = false; when.textContent = `물 위로 ${i}곳째 — ${cells[j].name}`;
      if (moving && !rm) rise = {i: j, t: performance.now(), ms: 520}; else H[j] = cells[j].hN;
    } else { seven.forEach(j => { H[j] = cells[j].hN; }); when.hidden = true; }
    const past = !done && i >= 0 && i < seven.indexOf(heroI) + 1; hudFill(past); // 고른 곳이 오르기 전 걸음 = 20거래일 전 값 · 오른 뒤 = 그날 값
    kick(); if (rm) settle();
  }
  function bind(box) { if (!box) return; new MutationObserver(() => onStep(box)).observe(box, {attributes: true, attributeFilter: ['class', 'data-step']}); }
  // 크기 · 색 판 바뀜
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { const w = Math.round(stage.clientWidth); if (w && w !== Wp) { size(); draw(); } }) : null;
  ro?.observe(stage);
  if (typeof matchMedia === 'function') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', ev => { pal = ev.matches ? PAL.dark : PAL.light; draw(); });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', ev => { rm = ev.matches; });
  }
  function setSel(code, user = false) { const i = cells.findIndex(c => c.code === code); if (i >= 0 && isSeven.has(i)) pickCand(i, user, false); } // 아래 줄 · 카드에서 고름 — 카드는 이미 바뀜(다시 알리지 않음)
  // 처음 — 그날 종가 그대로 멈춘 그림(고른 것 아님 — 1위가 금빛)
  pins.forEach((p, k) => { p.classList.toggle('sel', seven[k] === heroI); p.setAttribute('aria-pressed', String(seven[k] === heroI)); });
  hudFill();
  let waits = 0; const first = () => { if (!el.isConnected) return; if (size()) draw(); else if (!ro && ++waits < 60) requestAnimationFrame(first); }; // 폭이 아직 없으면 크기 알림(ResizeObserver)이 잡힐 때 그림
  requestAnimationFrame(first);
  el.__isl = {state: () => ({th, hero: heroI >= 0 ? cells[heroI].code : null, focus: focus >= 0 ? cells[focus].code : null, busy: !!busy(), w: W0, seven: seven.map(i => [cells[i].code, H[i]]), picked}),
    pointOf: code => { const i = cells.findIndex(c => c.code === code); if (i < 0) return null; sinT = Math.sin(th); cosT = Math.cos(th); return P(cells[i].x, cells[i].y, zOf(i)); },
    tallest: () => cells.reduce((b, c, i) => (c.hN > cells[b].hN && !isSeven.has(i) ? i : b), cells.findIndex((c, i) => !isSeven.has(i))), codeAt: i => cells[i]?.code ?? null, redraw: first,
    tapPoint: code => { // 검사기용 — 그 탑을 누를 수 있는 점(핀 · 이름표에 가리지 않고 hit 이 그 탑)
      const i = cells.findIndex(c => c.code === code); if (i < 0) return null; sinT = Math.sin(th); cosT = Math.cos(th);
      const z = Math.max(zOf(i), 0.006), sr = stage.getBoundingClientRect(), boxes = [...pins.map(b => b.getBoundingClientRect()), hud.getBoundingClientRect()];
      for (const f of [1, 0.9, 0.75, 0.6, 0.45, 0.3]) for (const [ox, oy] of [[0, 0], [-0.2, 0], [0.2, 0], [0, 0.2], [0, -0.2]]) {
        const q = P(cells[i].x + ox, cells[i].y + oy, z * f), X = sr.left + q[0], Y = sr.top + q[1] + 1;
        if (boxes.some(r => r.width && X >= r.left - 2 && X <= r.right + 2 && Y >= r.top - 2 && Y <= r.bottom + 2)) continue;
        if (hit(q[0], q[1] + 1) === i) return [q[0], q[1] + 1];
      }
      return null; }};
  return {el, model: M, setSel, bind};
}
