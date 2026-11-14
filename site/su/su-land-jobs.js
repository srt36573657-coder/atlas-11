/* 수르 — 땅 지도 큰 그림 둘 · 잡스 판(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」 · docs/design/su-jobs-all-2026-11-08/brief.md)
   옛 무하 판(su-land-art.js)과 같은 자료(su21-map.json) · 같은 누름 주소 · 같은 aria-label 꼴 — 그림만 첫 페이지(su-apple) 말투로 빈 파일에서 새로 그림
   ① 열 땅 #/m — 맨 위 부제 두 줄 → 땅 칸 열(두 칸 다섯 층 · 층 사이 가는 선 · 다섯 층 모두 첫 화면 안) · 칸마다 구슬(밑에 ✦ 수) · 땅 이름 · 회사 수(큰 숫자)
      21곳(✦)이 든 땅 = 빛나는 호박색 구슬(둘레 빛이 천천히 숨 쉼) · 없는 땅 = 맑은 유리 구슬 · 차례 = ✦ 많은 땅 먼저(같으면 자료 차례 — 옛 판과 같음) · 누르면 #/m/<땅 id>
   ② 한 땅 #/m/<id> — 부제 두 줄 → 업종 줄마다 이름 · 값(20거래일 · 자료 그대로) · 가로 막대(같은 값 → 같은 길이 · 차례는 자료 그대로 · 오름 = 호박색 · 내림 = 회색 · 오름 · 내림이 섞인 땅만 0 자리 눈금)
      → 굵은 선 아래 「21곳에 든 회사」(구슬 · 큰 숫자 · 두 칸 줄 · 누르면 #/c/<번호>) · 없으면 맑은 구슬과 「이 땅에는 이번 21곳이 없어요」
   덜어냄: 여인 · 아치 · 덩굴 · 꽃 · 금 테 · 별 그림 · 그림자 덩어리 · 흐림 필터 · 아무 수 0(같은 자료 → 같은 그림)
   그리기는 s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-land-jobs.css(움직임 줄이기면 끝 모습) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-land-jobs.css';
const MAP = '/su/data/su21-map.json';
const W = 390, MID = W / 2, PAD = 20, NEED = '확인 필요';
const fin = x => typeof x === 'number' && Number.isFinite(x);
const f1 = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100; // f2 = 막대 길이(같은 값 → 같은 길이를 0.01 까지)
const isStar = c => Array.isArray(c?.in) && c.in.length > 0;
const sgnP = v => (fin(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + String(Math.abs(f1(v))) + '%' : NEED); // 옛 판과 같은 값 글
const KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
let UID = 0;

/** 글 넓이 어림(굵은 글 · 넉넉히 — 시험대 글꼴은 한글 한 자가 1em · 휴대폰 글꼴은 더 좁음) */
function est(t, px) {
  let w = 0;
  for (const ch of String(t ?? '')) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch) || ch === '✦') w += 1;
    else if (/[A-Z&]/.test(ch)) w += 0.72;
    else if (/[a-z]/.test(ch)) w += 0.58;
    else if (/[0-9]/.test(ch)) w += 0.62;
    else if (/[+−]/.test(ch)) w += 0.7;
    else if (ch === '%') w += 0.9;
    else if (/[ .,]/.test(ch)) w += 0.32;
    else if (/[·()-]/.test(ch)) w += 0.45;
    else w += 0.8;
  }
  return w * px;
}
const T = (x, y, text, cls, extra = {}) => s('text', {x: f1(x), y: f1(y), class: cls, ...extra, text});
/** 회사 이름 앞 묶음 이름 — 두 줄일 때 이 자리에서 나눔(「포스코 | 인터내셔널」 · 옛 판 nameLines 와 같은 목록) */
const PRE = ['포스코', '현대', '효성', '삼성', '한화', '롯데', '두산', '한국', '대한', '신세계', '제주', '한진', '아이티센', '제이에스', 'LG', 'SK', 'CJ', 'GS', 'HD', 'KT'];
/** 이름을 한두 줄로 — 「 · 」 자리 → 묶음 이름 자리 → 띄어쓰기 자리 차례로(긴 줄이 가장 짧아지게 · 줄 안 「·」 는 붙여 씀) · hard = 그래도 안 되면 글자 자리까지 */
function lines2(name, px, maxW, pre = [], hard = false) {
  const t = String(name ?? '').trim(), parts = t.split(/\s*·\s*/).filter(Boolean), one = parts.join('·') || t, ch = [...one];
  if (est(one, px) <= maxW) return [one];
  const pick = cuts => { let b = null; for (const l of cuts) { const m = Math.max(est(l[0], px), est(l[1], px)); if (!b || m < b.m) b = {m, l}; } return b; };
  const tiers = [parts.slice(1).map((_, i) => [parts.slice(0, i + 1).join('·'), parts.slice(i + 1).join('·')]),
    pre.filter(p => one.startsWith(p) && one.length > p.length + 1).map(p => [p, one.slice(p.length)]),
    [...one.matchAll(/ /g)].map(m => [one.slice(0, m.index), one.slice(m.index + 1)])];
  if (hard) tiers.push(ch.slice(1).map((_, i) => [ch.slice(0, i + 1).join(''), ch.slice(i + 1).join('')]));
  for (const cuts of tiers) { const b = pick(cuts); if (b && b.m <= maxW) return b.l; }
  return [one];
}
/** 넘치는 줄 끝을 「…」로(이름 전체는 누름 자리 aria-label · 쪽 아래 목록에 그대로) */
function clip(t, px, maxW) {
  const c = [...String(t ?? '')];
  if (est(t, px) <= maxW) return String(t ?? '');
  while (c.length > 1 && est(c.join('') + '…', px) > maxW) c.pop();
  return c.join('') + '…';
}
/** 폭에 맞는 글 크기와 줄 — 낱말 자리 나눔(20 → 18) → 글자 자리 나눔(20 → 18) 차례로 · 그래도 넘치면 18 로 첫 줄을 채우고(「·」 · 띄어쓰기 자리에서) 나머지 둘째 줄 끝을 「…」로 */
function fit(name, maxW, pre = []) {
  for (const hard of [false, true]) for (const px of [20, 18]) { const L = lines2(name, px, maxW, pre, hard); if (Math.max(...L.map(l => est(l, px))) <= maxW) return {px, L}; }
  const one = String(name ?? '').trim().split(/\s*·\s*/).filter(Boolean).join('·'), ch = [...one];
  let i = ch.length; while (i > 1 && est(ch.slice(0, i).join(''), 18) > maxW) i--;
  let a = ch.slice(0, i).join(''); const sep = Math.max(a.lastIndexOf('·'), a.lastIndexOf(' '));
  if (sep > 0) a = a.slice(0, sep);
  return {px: 18, L: [a, clip(one.slice(a.length).replace(/^[\s·]+/, ''), 18, maxW)]};
}

/* ── 구슬 — 밝기 차만으로 빛남(흐림 필터 없음 · 첫 페이지 구슬과 같은 색 단계) ── */
function defs(id) {
  const rg = (k, stops, at = {}) => s('radialGradient', {id: id + k, ...at}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
  const lg = (k, a, b) => s('linearGradient', {id: id + k, x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: a}), s('stop', {offset: 1, class: b}));
  return s('defs', {},
    rg('h', [[0, 'lj-hl0'], [0.4, 'lj-hl1'], [0.72, 'lj-hl2'], [1, 'lj-hl3']]),
    rg('b', [[0, 'lj-b0'], [0.2, 'lj-b1'], [0.46, 'lj-b2'], [0.7, 'lj-b3'], [0.88, 'lj-b4'], [1, 'lj-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '40%', fy: '34%'}),
    rg('c', [[0, 'lj-c0'], [0.5, 'lj-c1'], [1, 'lj-c2']]),
    rg('s', [[0, 'lj-s0'], [0.6, 'lj-s1'], [1, 'lj-s2']]),
    rg('g', [[0, 'lj-g0'], [0.55, 'lj-g1'], [0.8, 'lj-g2'], [0.94, 'lj-g3'], [1, 'lj-g4']], {cx: '48%', cy: '44%', r: '56%'}),
    lg('p', 'lj-p0', 'lj-p1'), lg('n', 'lj-n0', 'lj-n1'));
}
/** 구슬 하나 — lit = 빛나는 호박색(21곳이 든 땅) · 아니면 맑은 유리 · breathe = 숨 쉬는 빛(호박색은 둘레 빛 · 유리는 겉 빛) */
function orb(id, cx, cy, r, lit, breathe) {
  const u = k => `url(#${id}${k})`, X = (a, b) => [f1(cx + a * r), f1(cy + b * r)];
  if (lit) {
    const [sx, sy] = X(-0.39, -0.55), [gx, gy] = X(-0.54, -0.31), [kx, ky] = X(-0.14, -0.24);
    return s('g', {class: 'lj-orb lj-lit', 'aria-hidden': 'true'},
      s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r * 1.5), fill: u('h'), class: 'lj-halo' + (breathe ? ' lj-breathe' : '')}),
      s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r * 1.07), class: 'lj-bloom'}),
      s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r), fill: u('b')}),
      s('circle', {cx: kx, cy: ky, r: f1(r * 0.55), fill: u('c')}),
      s('ellipse', {cx: f1(cx), cy: f1(cy + 0.7 * r), rx: f1(r * 0.6), ry: f1(r * 0.16), class: 'lj-under'}),
      s('ellipse', {cx: sx, cy: sy, rx: f1(r * 0.32), ry: f1(r * 0.13), transform: `rotate(-38 ${sx} ${sy})`, fill: u('s')}),
      s('circle', {cx: gx, cy: gy, r: f1(Math.max(1.2, r * 0.045)), class: 'lj-glint'}),
      s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r - 0.7), class: 'lj-rimA'}));
  }
  const [sx, sy] = X(-0.41, -0.48), [gx, gy] = X(-0.57, -0.2), [ax, ay] = X(0.61, -0.72), [bx, by] = X(0.83, 0.33);
  return s('g', {class: 'lj-orb lj-glass', 'aria-hidden': 'true'},
    s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r), fill: u('g')}),
    s('ellipse', {cx: f1(cx), cy: f1(cy + 0.7 * r), rx: f1(r * 0.6), ry: f1(r * 0.16), class: 'lj-underB'}),
    s('g', {class: breathe ? 'lj-breathe' : null},
      s('ellipse', {cx: sx, cy: sy, rx: f1(r * 0.31), ry: f1(r * 0.13), transform: `rotate(-36 ${sx} ${sy})`, fill: u('s')}),
      s('circle', {cx: gx, cy: gy, r: f1(Math.max(1.1, r * 0.045)), class: 'lj-glint'})),
    s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r - 0.6), class: 'lj-rimB'}),
    s('path', {d: `M${ax} ${ay}A${f1(r * 0.93)} ${f1(r * 0.93)} 0 0 1 ${bx} ${by}`, class: 'lj-edge'}));
}
const svgOf = (H, cls, label) => s('svg', {class: 'su-svg su-land-jobs ' + cls, viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'aria-label': label});
const dly = i => 'lj-d' + Math.max(0, Math.min(9, i)); // 들어오는 차례(0.05초씩 · 1.2초 안에 끝)

/* ── 빈 자료 — 「확인 필요」 그림(멈추지 않음) ── */
function needPic(d) {
  const id = 'lj' + (++UID), H = 660;
  const svg = svgOf(H, 'lj-needp', '땅 지도 · ' + NEED);
  svg.append(defs(id), s('rect', {x: 0, y: 0, width: W, height: H, class: 'lj-bg'}),
    s('g', {class: 'lj-in ' + dly(0)}, T(MID, 40, '땅 지도', 'lj-sub', {'text-anchor': 'middle'})),
    orb(id, MID, 230, 64, false, true),
    s('g', {class: 'lj-in ' + dly(3)}, T(MID, 372, NEED, 'lj-need', {'text-anchor': 'middle'}),
      T(MID, 408, d?.mode === 'one' ? '이 땅 자료를 받지 못했어요' : '땅 자료를 받지 못했어요', 'lj-sub', {'text-anchor': 'middle'})));
  return svg;
}

/* ── ① 열 땅 — 두 칸 다섯 층 ── */
function allPic(d) {
  const id = 'lj' + (++UID);
  const lands = [...d.lands].sort((a, b) => b.star - a.star || a.i - b.i); // ✦ 가 많은 땅이 윗자리 · 같으면 자료 차례(옛 판과 같음)
  const total = lands.reduce((a, u) => a + (fin(u.n) ? u.n : 0), 0), lit = lands.some(u => u.star > 0);
  const TOP = 80, RH = 106, TW = 177, XS = [16, 197], OR = 23, rows = Math.ceil(lands.length / 2), H = Math.max(652, TOP + rows * RH + 28); // 다섯 층 모두 첫 화면(390 × 844 · 머리 줄 아래 ~ 이야기 막대 위 611) 안
  const svg = svgOf(H, 'lj-all', '땅 지도 · 우량주 ' + total + '곳을 ' + lands.length + '땅으로 · ✦ 는 21곳에 든 회사 수 · 21곳이 든 땅은 구슬이 빛나요');
  svg.append(defs(id), s('rect', {x: 0, y: 0, width: W, height: H, class: 'lj-bg'}),
    s('g', {class: 'lj-top lj-in ' + dly(0)},
      T(MID, 36, '우량주 ' + total + '곳을 ' + (KO[lands.length] ?? lands.length) + ' 땅에 나눴어요.', 'lj-sub', {'text-anchor': 'middle'}),
      T(MID, 63, lit ? '21곳(✦)이 든 땅은 구슬이 빛나요.' : '이번에는 21곳(✦)이 든 땅이 없어요.', 'lj-sub', {'text-anchor': 'middle'})));
  const lines = s('g', {class: 'lj-lines', 'aria-hidden': 'true'});
  for (let r = 1; r < rows; r++) lines.append(s('path', {d: `M${PAD} ${TOP + r * RH}H${W - PAD}`, class: 'lj-line'}));
  const units = s('g', {class: 'lj-units'});
  lands.forEach((u, i) => {
    const r = Math.floor(i / 2), x0 = XS[i % 2], y0 = TOP + r * RH, on = u.star > 0, tx = x0 + 61, maxW = x0 + TW - 6 - tx;
    const {px, L} = fit(u.name, maxW), cls = 'lj-name' + (px < 20 ? ' lj-f18' : '');
    const names = L.length > 1 ? [T(tx, y0 + 26, L[0], cls, {'data-proper': ''}), T(tx, y0 + 50, L[1], cls, {'data-proper': ''})] : [T(tx, y0 + 42, L[0], cls, {'data-proper': ''})];
    const cnt = fin(u.n) ? String(u.n) : NEED, big = est(cnt, 36) + 2 + est('곳', 19) <= maxW; // 회사 수가 세 자리여도 칸 안(넘치면 30px)
    units.append(s('a', {href: '#/m/' + u.id, class: 'lj-u lj-in ' + dly(r + 1), 'aria-label': u.name + ' 땅 · 우량주 ' + u.n + '곳 · 21곳에 든 회사 ' + u.star + '곳'},
      s('rect', {x: x0, y: y0 + 2, width: TW, height: RH - 4, rx: 14, class: 'lj-hit'}),
      orb(id, x0 + 31, y0 + 48, OR, on, on || !lit),
      T(x0 + 31, y0 + 94, '✦ ' + u.star, 'lj-st ' + (on ? 'lj-st-on' : 'lj-st-off'), {'text-anchor': 'middle'}), // ✦ 수 = 구슬 밑(빛나는 구슬 = 21곳이 든 땅)
      names,
      T(tx, y0 + 94, cnt, 'lj-n' + (big ? '' : ' lj-n30')), fin(u.n) ? T(tx + est(cnt, big ? 36 : 30) + 2, y0 + 94, '곳', 'lj-unit') : null));
  });
  svg.append(lines, units);
  return svg;
}

/* ── ② 한 땅 — 업종 막대 · 21곳에 든 회사 ── */
function onePic(d) {
  const inds = (d.inds ?? []).filter(g => g && g.name);
  if (!inds.length) return needPic(d);
  const id = 'lj' + (++UID), seen = new Set();
  const stars = (d.stars ?? []).filter(c => c?.code && !seen.has(c.code) && seen.add(c.code));
  const N = inds.length, TOP = 92, RH = Math.max(42, Math.min(58, Math.floor(428 / N))), bh = RH >= 56 ? 12 : RH >= 48 ? 10 : 8; // 업종이 열 개까지면 막대 모두와 「21곳에 든 회사」 줄이 첫 화면 안
  const R = inds.map(g => ({g, v: fin(g.ch20) ? g.ch20 : 0}));
  const neg = Math.max(0, ...R.map(r => -r.v)), pos = Math.max(0, ...R.map(r => r.v));
  const k = neg + pos > 0 ? (W - 2 * PAD) / (neg + pos) : 0, axis = f1(PAD + neg * k); // 한 땅 안은 한 잣대(같은 값 → 같은 길이) · 0 자리 = 내린 만큼 왼쪽 · 오른 만큼 오른쪽
  const edge = !(neg > 0 && pos > 0); // 모두 내림(또는 모두 오름)이면 0 자리가 끝 — 막대 끝이 줄을 맞춰 눈금이 따로 없어도 보임(값 글 곁에 선을 긋지 않음)
  const off = Math.max(0, (RH - 30 - bh) / 2);
  const rows = s('g', {class: 'lj-bars'}, R.map((r, i) => {
    const y = TOP + i * RH, nb = f1(y + off + 18), bt = f1(nb + 9), len = Math.abs(r.v) * k, x = r.v < 0 ? axis - len : axis, up = r.v > 0;
    const bar = len > 0 ? s('rect', {x: f2(x), y: bt, width: f2(len), height: bh, rx: bh / 2, fill: `url(#${id}${up ? 'p' : 'n'})`, class: 'lj-bar ' + (up ? 'lj-pos' : 'lj-neg')}) : null;
    /* 이름 자리 = 줄 폭 − 값 글 폭 — 넘치면 18 · 그래도 넘치면 끝을 「…」(값 글과 겹치지 않게) */
    const vt = sgnP(r.g.ch20), st = r.g.star ? '✦ ' : '', room = W - 2 * PAD - est(vt, 19) - 14, npx = est(st + r.g.name, 19) <= room ? 19 : 18;
    return s('g', {class: 'lj-row lj-in ' + dly(i + 1), 'data-v': f1(r.v), 'data-len': f2(len)},
      up && len > 0 ? s('g', {class: 'lj-breathe', 'aria-hidden': 'true'}, s('rect', {x: f2(x - 3), y: f1(bt - 3), width: f2(len + 6), height: bh + 6, rx: (bh + 6) / 2, class: 'lj-glow lj-bar lj-pos'})) : null,
      edge ? null : s('path', {d: `M${axis} ${f1(bt - 3)}V${f1(bt + bh + 3)}`, class: 'lj-axis'}),
      bar,
      s('text', {x: PAD, y: nb, class: 'lj-ind' + (npx < 19 ? ' lj-f18' : ''), 'data-proper': ''}, st ? s('tspan', {class: 'lj-star', text: st}) : null, s('tspan', {text: clip(r.g.name, npx, room - est(st, npx))})),
      T(W - PAD, nb, vt, 'lj-val' + (up ? ' lj-up' : ''), {'text-anchor': 'end'}));
  }));
  /* 굵은 선 아래 — 21곳에 든 회사(구슬 · 큰 숫자 · 두 칸 줄) · 없으면 맑은 구슬 한 줄 */
  const ys = f1(TOP + N * RH + 24), S = stars.length, TW = 177, XS = [16, 197];
  const head = s('g', {class: 'lj-sec lj-in ' + dly(Math.min(9, N + 1))},
    s('path', {d: `M${PAD} ${ys}H${W - PAD}`, class: 'lj-rule'}),
    orb(id, PAD + 20, ys + 40, 19, S > 0, true),
    S ? [T(PAD + 52, ys + 47, '21곳에 든 회사', 'lj-kh'), T(W - PAD - est('곳', 20) - 3, ys + 52, String(S), 'lj-n2', {'text-anchor': 'end'}), T(W - PAD, ys + 52, '곳', 'lj-unit', {'text-anchor': 'end'})]
      : T(PAD + 52, ys + 47, '이 땅에는 이번 21곳이 없어요', 'lj-note'));
  /* 칸 — 이름(한 줄 20 · 넘치면 18 · 그래도 넘치면 두 줄) · 업종 · 누르는 자리 = 칸 모두(높이 74 넘게) */
  const cells = stars.map(c => ({...c, ...fit(c.name, TW - 14, PRE)}));
  const tags = s('g', {class: 'lj-tags'});
  let y = ys + 76;
  for (let i = 0; i < cells.length; i += 2) {
    const pair = cells.slice(i, i + 2), two = pair.some(c => c.L.length > 1), CH = two ? 96 : 76, r = i / 2;
    tags.append(s('path', {d: `M${PAD} ${f1(y)}H${W - PAD}`, class: 'lj-line'}));
    pair.forEach((c, j) => {
      const x0 = XS[j], cls = 'lj-cn' + (c.px < 20 ? ' lj-f18' : ''), nb = c.L.length > 1 ? [y + 30, y + 53] : [y + 32];
      tags.append(s('a', {href: '#/c/' + c.code, class: 'lj-tag lj-in ' + dly(Math.min(9, N + 2 + r)), 'aria-label': c.name + ' · 21곳에 든 회사 · ' + c.ind + ' 업종'},
        s('rect', {x: x0, y: f1(y + 2), width: TW, height: CH - 4, rx: 12, class: 'lj-hit'}),
        c.L.map((l, q) => T(x0 + 7, nb[q], l, cls, {'data-proper': ''})),
        T(x0 + 7, nb[nb.length - 1] + 26, clip(c.ind ?? NEED, 18, TW - 14), 'lj-ci', {'data-proper': ''})));
    });
    y += CH;
  }
  const bottom = S ? y : ys + 80, H = f1(Math.max(660, bottom + 24));
  const svg = svgOf(H, 'lj-one', d.name + ' 땅 · 업종 ' + N + '개 · 20거래일 동안 움직인 만큼 · 21곳에 든 회사 ' + S + '곳');
  svg.append(defs(id), s('rect', {x: 0, y: 0, width: W, height: H, class: 'lj-bg'}),
    s('g', {class: 'lj-top lj-in ' + dly(0)},
      T(MID, 40, '업종 ' + N + '개가 20거래일 동안', 'lj-sub', {'text-anchor': 'middle'}),
      T(MID, 68, '움직인 만큼이에요.', 'lj-sub', {'text-anchor': 'middle'})),
    rows, head, tags);
  return svg;
}

/** 자료 받기 — id 가 없으면 ① 열 땅 · 있으면 ② 한 땅(옛 판 load 와 같은 꼴 · 같은 파일) */
export async function load(get, id = null) {
  const M = await get(MAP);
  const lands = Array.isArray(M?.lands) ? M.lands : null;
  if (!lands || !lands.length) return {mode: id ? 'one' : 'all', need: true, id: id ?? null};
  const asOf = M?.asOf?.board ?? null;
  if (!id) return {mode: 'all', asOf, lands: lands.map((L, i) => { const cos = (L.inds ?? []).flatMap(g => g?.cos ?? []); return {id: L.id, name: L.name, n: cos.length, star: cos.filter(isStar).length, i}; })};
  const L = lands.find(x => x.id === id);
  if (!L) return {mode: 'one', need: true, id};
  return {mode: 'one', asOf, id: L.id, name: L.name,
    inds: (L.inds ?? []).map(g => ({name: g?.name, ch20: g?.ch20, star: (g?.cos ?? []).filter(isStar).length})),
    stars: (L.inds ?? []).flatMap(g => (g?.cos ?? []).filter(isStar).map(c => ({code: c.code, name: c.name, ind: g.name})))};
}
/** 그림 — <svg viewBox="0 0 390 H"> 하나(H 652 넘게 · 자료가 없으면 「확인 필요」 그림) · opt 는 받기만(부르는 쪽이 {} 를 넘김) */
export function picture(d, opt = {}) {
  void opt;
  if (!d || d.need) return needPic(d);
  return d.mode === 'one' ? onePic(d) : allPic(d);
}
