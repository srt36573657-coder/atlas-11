/* 수르 하늘 — 뒷배경에 하나씩 천천히 나는 무하풍 그림 열다섯(빈 파일에서 새로 씀)
   사장님 명령서(docs/design/su-jobs-2026-11-05/order-0054.txt) [6] 6 · 8 · 9
   「옛 하늘 풍경을 모두 무하풍으로 다시 그려라」 「하늘은 뒷배경에서 하나씩 천천히 날게 해라」(10월 22일 「너무 번잡해」 말씀)
   「장식은 값과 글을 가리지 않게 해라」
   · 층 하나(.su-sky) — 화면에 고정 · 글판 뒤(z-index -1) · 누를 수 없음 · 읽어 주기에서 숨김 · 글과 값 위로 올라오지 않음
   · 한 번에 그림 하나 — 40 ~ 70초 동안 천천히 가로지르며 나타났다 흐려짐 → 잠깐 쉼 → 다음 그림(열다섯을 차례로 · 끝없이)
   · 그림 = 무하풍 선 그림(채찍처럼 휜 곡선 · 후광 고리 · 가는 금빛 선 · 살구와 연두 덧칠) · 그림 안 글자 없음 · 바깥 파일 없음
   · 움직임 줄이기 = 별 한 장만 멈춘 채 둠 · 첫 그림을 늦추지 않음(창 load 뒤 3초 + 한가할 때 시작)
   · 자리와 움직임은 CSS 클래스와 @keyframes 로만(su-sky.css) — 글 속 꾸밈을 쓰지 않음(보안 규칙) */
const NS = 'http://www.w3.org/2000/svg';
const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const f = v => Math.round(v * 10) / 10;

/** 하늘 그림 열다섯 — 차례 그대로 난다 */
export const SKY_ITEMS = Object.freeze([
  ['star', '별'], ['polaris', '북극성'], ['aurora', '오로라'], ['meteor', '별똥별'], ['dragon', '용'],
  ['angels', '천사 다섯'], ['peterpan', '피터팬과 팅커벨'], ['bichon', '하얀 비숑'], ['parrot', '나는 앵무새'], ['heart', '하트 별자리'],
  ['solar', '태양계'], ['comet', '혜성'], ['rocket', '우주선'], ['ufo', '비행접시'], ['dragons', '용 두 마리'],
].map(([id, name]) => Object.freeze({id, name})));

/* ── 그리는 손 ── */
function el(tag, at, kids) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) if (at[k] != null) e.setAttribute(k, String(at[k]));
  if (kids) for (const c of kids.flat(4)) if (c) e.appendChild(c);
  return e;
}
const P = (c, d) => el('path', {class: c, d});
const O = (c, cx, cy, r) => el('circle', {class: c, cx, cy, r});
const V = (c, cx, cy, rx, ry, a) => el('ellipse', {class: c, cx, cy, rx, ry, transform: a ? `rotate(${a} ${cx} ${cy})` : null});
const G = (t, kids) => el('g', {transform: t}, kids);
/** 다섯 뿔 별 */
function star(x, y, R, k = .42) {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = PI * i / 5 - PI / 2, r = i % 2 ? R * k : R; d += (i ? 'L' : 'M') + f(x + r * cos(a)) + ' ' + f(y + r * sin(a)); }
  return d + 'Z';
}
/** 네 갈래 반짝임(안으로 휜 네 변) */
const spark = (x, y, r) => { const a = f(x - r), b = f(x + r), c = f(y - r), e = f(y + r); return `M${x} ${c}Q${x} ${y} ${b} ${y}Q${x} ${y} ${x} ${e}Q${x} ${y} ${a} ${y}Q${x} ${y} ${x} ${c}Z`; };
/** 무하 후광 — 옅은 살구 빛 · 가는 금 고리 · 점 고리 */
const halo = (x, y, r) => [O('kg', x, y, r + 2), O('k kt', x, y, r), O('k kd', x, y, f(r - 3.5))];
/** 구름 털 — 타원 둘레를 밖으로 부푼 물결로(비숑) */
function puff(cx, cy, rx, ry, n, a0 = 0) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = a0 + i / n * 2 * PI, x = f(cx + rx * cos(a)), y = f(cy + ry * sin(a));
    if (!i) { d = `M${x} ${y}`; continue; }
    const m = a - PI / n;
    d += `Q${f(cx + rx * 1.3 * cos(m))} ${f(cy + ry * 1.3 * sin(m))} ${x} ${y}`;
  }
  return d + 'Z';
}

/* ── 그림 열다섯(모두 오른쪽을 보고 그림 · 왼쪽으로 날 때는 뒤집음) ── */

/** 별 — 후광 속 큰 별 · 작은 별 넷 · 반짝임 · 아래 덩굴 곡선 */
function aStar() {
  return [
    halo(100, 74, 38),
    P('k ka', star(100, 74, 24)),
    P('k ka', star(38, 34, 9) + star(164, 38, 7.5) + star(162, 122, 9.5) + star(40, 120, 6.5)),
    P('k', spark(134, 16, 6) + spark(16, 80, 5) + spark(186, 86, 5) + spark(100, 134, 4.5)),
    P('k kl', 'M6 148C34 152 50 128 74 136S120 156 146 142S180 132 194 146'),
  ];
}

/** 북극성 — 여덟 빛살 큰 별 · 후광 · 북두칠성 국자와 가리키는 점선 */
function aPolaris() {
  const dip = [[30, 116], [48, 104], [64, 100], [80, 102], [118, 96], [108, 116], [84, 122]];
  return [
    halo(142, 46, 20),
    P('k ka', spark(142, 46, 30)),
    G('rotate(45 142 46)', [P('k', spark(142, 46, 15))]),
    O('ke', 142, 46, 3),
    P('k kt', 'M' + dip.map(p => p.join(' ')).join('L') + 'L80 102'),
    P('k kh', 'M121 89L135 62'),
    dip.map(([x, y], i) => P('k ka', spark(x, y, i === 4 || i === 5 ? 5 : 4))),
    P('k kl', 'M98 150C110 134 136 136 150 124S178 104 192 112'),
  ];
}

/** 오로라 — 물결치는 빛의 띠 둘 · 아래 끝이 밝고 위로 올라갈수록 옅어지는 빛줄기 커튼 */
function aAurora() {
  const curtain = (ph, amp, base, len, step) => {
    let edge = '', rays = '';
    for (let x = 8; x <= 272; x += step) {
      const y = base + amp * sin(x / 40 + ph) + 4 * sin(x / 13 + ph * 2), h = len * (.5 + .5 * sin(x / 21 + ph)) * (.65 + .35 * sin(x / 47)) + 10;
      edge += (edge ? 'L' : 'M') + x + ' ' + f(y);
      rays += `M${x} ${f(y)}q${f(2 * sin(x / 7))} ${f(-h / 2)} ${f(1.5 * sin(x / 11))} ${f(-h)}`;
    }
    return [edge, rays];
  };
  const [e1, r1] = curtain(0, 16, 84, 62, 5), [e2, r2] = curtain(2.3, 11, 108, 40, 7);
  const grad = (id, a) => el('linearGradient', {id, x1: 0, y1: 1, x2: 0, y2: 0}, [el('stop', {offset: 0, class: a + '1'}), el('stop', {offset: 1, class: a + '2'})]);
  return [
    el('defs', {}, [grad('su-sky-au', 'ku'), grad('su-sky-av', 'kv')]),
    P('k ku', r1), P('k kl', e1),
    P('k kv kt', r2), P('k kp kt', e2),
    P('k', spark(40, 12, 4) + spark(140, 8, 3.5) + spark(238, 14, 4)),
  ];
}

/** 별똥별 — 살구 별 머리 · 휘어 흐르는 꼬리 셋 · 끝은 채찍 고리 */
function aMeteor() {
  return [
    halo(178, 96, 20),
    P('k', 'M164 86C128 62 84 40 30 24S2 16 10 8'),
    P('k kp', 'M168 100C134 84 100 72 50 60'),
    P('k kl kt', 'M160 92C132 74 106 62 74 48'),
    P('k ka', star(178, 96, 13)),
    P('k', spark(116, 52, 4) + spark(72, 34, 3) + spark(46, 48, 2.5)),
  ];
}

/** 용 몸 — 꼬리(왼쪽)에서 목(오른쪽)까지 S 자 · 등 지느러미 · 배 비늘 · 다리 넷 · 뿔 난 머리 · 벌린 입 · 수염 */
function dragon(pearl) {
  const N = 34, C = [], W = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    C.push([16 + 162 * s, 102 - 32 * sin(2 * PI * 1.05 * s + .25) * (.55 + .45 * s)]);
    W.push(1 + 10.5 * sin(PI * Math.min(1, s * .85)) ** .7);
  }
  const T = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(N, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const back = [], belly = [];
  for (let i = 0; i <= N; i++) { const [tx, ty] = T(i), w = W[i]; back.push([C[i][0] + ty * w, C[i][1] - tx * w]); belly.push([C[i][0] - ty * w, C[i][1] + tx * w]); }
  let d = `M${f(back[0][0])} ${f(back[0][1])}`, rung = '';
  for (let i = 0; i < N; i++) {
    const [tx, ty] = T(i), a = back[i], b = back[i + 1];
    if (i > 1 && i < N - 1) { const k = 2.6 + W[i] * .35; d += `L${f((a[0] + b[0]) / 2 + ty * k - tx * 2)} ${f((a[1] + b[1]) / 2 - tx * k - ty * 2)}`; }
    d += `L${f(b[0])} ${f(b[1])}`;
  }
  for (let i = N; i >= 0; i--) d += `L${f(belly[i][0])} ${f(belly[i][1])}`;
  for (let i = 3; i < N - 1; i += 2) { const [tx, ty] = T(i), w = W[i] * .4; rung += `M${f(belly[i][0])} ${f(belly[i][1])}L${f(C[i][0] - ty * w)} ${f(C[i][1] + tx * w)}`; }
  const ang = i => f(Math.atan2(T(i)[1], T(i)[0]) * 180 / PI);
  const at = (i, p, kids, k = 1) => G(`translate(${f(p[i][0])} ${f(p[i][1])}) rotate(${f(ang(i) * k)})`, kids);
  const leg = (i, far) => at(i, belly, [P(far ? 'k kt' : 'k', 'M0 0C2 9 8 15 17 15M17 15l6 -4M17 15l7 1M17 15l5 5')]);
  return [
    leg(12, 1), leg(28, 1),
    P('k kf', d + 'Z'), P('k kt', rung),
    at(0, C, [P('k kl', 'M0 0C-8 -3 -14 -10 -13 -18M0 0C-9 1 -17 -2 -22 -7M0 0C-8 5 -12 12 -10 19')]),
    leg(9), leg(25),
    G(`translate(${f(C[N][0])} ${f(C[N][1])}) rotate(${f(ang(N) * .3)}) scale(1.2)`, [
      P('k kl', 'M-4 -12C-12 -22 -22 -20 -30 -28M-6 -6C-16 -10 -24 -4 -34 -10M-4 8C-12 14 -20 12 -28 18'),
      P('k', 'M10 -16C8 -28 0 -34 -14 -38M2 -31C-1 -36 0 -40 4 -44M18 -17C18 -28 14 -35 4 -42'),
      P('k kf', 'M-4 -10C4 -18 18 -20 28 -15L46 -13C52 -12 54 -6 49 -4L32 -3Q26 0 30 2L46 10C49 12 47 15 43 15C30 15 14 13 -4 10Z'),
      O('ke', 20, -9, 2.4), P('k kt', 'M14 -14Q20 -17 26 -13M46 -10q2 -3 4 0M20 14C18 22 12 26 6 28'),
      P('k kp', 'M48 -6C62 -14 68 -30 58 -38S42 -40 46 -32M42 12C54 22 54 38 40 42'),
    ]),
    pearl ? [halo(250, 40, 12), O('k ka', 250, 40, 6.5), P('k kp kt', 'M242 31C238 25 242 19 248 18M258 32C264 28 264 22 260 18')] : null,
  ];
}
const aDragon = () => dragon(true);

/** 천사 하나 — 후광 · 깃털 날개 둘 · 흘러내린 흰 옷 · 옷자락 리본 */
const WING = 'M-3 -12C-10 -25 -25 -29 -32 -20C-27 -20 -24 -17 -23 -13C-27 -13 -29 -10 -29 -6C-22 -9 -15 -8 -10 -4C-7 -7 -5 -10 -3 -12Z';
const angel = () => [
  O('kg', 0, -21, 10), O('k kt', 0, -21, 8.5),
  P('k ka', WING), G('scale(-1 1)', [P('k ka', WING)]),
  P('k kt', 'M-8 -14L-25 -20M-10 -9L-24 -11M8 -14L25 -20M10 -9L24 -11'),
  P('k kw', 'M-3 -15C-6 -4 -10 8 -15 18C-8 22 6 22 13 17C8 8 6 -4 3 -15Z'),
  P('k kt', 'M-1 -5L-3 13M2 -5L4 13'),
  O('k kw', 0, -21, 4.4),
  P('k kl kt', 'M-15 18C-21 22 -27 20 -31 13'),
];
/** 천사 다섯 — 둥근 아치로 줄지어 */
function aAngels() {
  return [[38, 88, .82], [88, 64, .95], [140, 50, 1.1], [192, 64, .95], [242, 88, .82]].map(([x, y, s]) => G(`translate(${x} ${y}) scale(${s})`, angel()))
    .concat([P('k kl', 'M20 120C70 104 100 132 140 114S214 102 262 120')]);
}

/** 피터팬과 팅커벨 — 깃털 꽂은 뾰족 모자 소년이 한 팔을 앞으로 뻗고 엎드려 날고 · 앞에 날개 달린 작은 요정 · 반짝이 꼬리 */
function aPeter() {
  return [
    P('k kd kp', 'M210 50C198 76 176 100 140 108S66 110 24 128'),
    P('k', spark(178, 92, 4) + spark(112, 110, 3.5) + spark(60, 116, 3)),
    P('k kw', 'M108 66C92 62 76 60 60 60L60 65C76 66 92 69 106 72ZM60 60C55 58 50 56 45 57C49 60 54 64 60 65Z'),
    P('k kw', 'M108 72C100 78 94 84 92 92L97 93C99 86 104 81 111 76ZM92 92C84 94 76 96 68 96L68 101C77 101 86 99 96 96ZM68 96C63 95 58 93 53 94C57 97 62 100 68 101Z'),
    P('k kw', 'M138 73C134 81 128 87 120 91L118 88C125 84 129 79 132 72Z'),
    P('k kf', 'M153 64C140 60 122 62 110 66L102 63L106 69L97 71L105 75L99 80L110 78C124 80 140 78 153 74Z'),
    P('k kt', 'M123 63L124 78'),
    P('k kw', 'M150 66C160 62 172 56 186 50L188 54C174 60 162 67 152 71Z'), O('k kw', 190, 50, 3),
    O('k kw', 160, 57, 9),
    P('k kw', 'M155 61l-7 -5l2 8'), O('ke', 164, 55, 1.4), P('k kt', 'M163 62q3 2 6 -1'),
    P('k kf', 'M150 55C151 46 160 43 170 50C158 46 146 42 133 34C139 42 145 48 150 55Z'),
    P('k kp', 'M152 47C146 36 136 28 122 24M145 38l-6 -1M139 33l-6 -1M133 29l-6 0'),
    O('kg', 216, 34, 17),
    V('k kt', 207, 27, 10, 4.5, -32), V('k kt', 206, 37, 8, 3.5, 22),
    P('k kf', 'M216 31C222 37 221 44 216 49C212 44 211 37 216 31Z'), O('k kw', 216, 27, 3.4), O('k', 218, 23.5, 1.6),
    P('k kt', 'M215 49l-2 6M217 49l1 6'),
  ];
}

/** 하얀 비숑 — 동그란 솜털 머리 · 늘어진 귀 · 까만 눈 둘과 코 · 분홍 혀 · 머리 리본 · 등 위로 말린 꼬리 · 앞뒤로 뻗은 다리 · 작은 날개 */
function aBichon() {
  const pr = (x, y, rx, ry, n, r) => G(`rotate(${r} ${x} ${y})`, [P('k kw', puff(x, y, rx, ry, n))]);
  return [
    halo(150, 58, 32),
    pr(58, 62, 11, 15, 7, -35), P('k kt', 'M60 74C50 68 50 56 58 52'),
    pr(52, 98, 12, 7, 6, 18), pr(64, 106, 11, 7, 6, 12),
    P('k kw', puff(94, 84, 42, 22, 13)),
    pr(128, 104, 12, 7, 6, -18), pr(140, 98, 11, 7, 6, -24),
    P('k kw', 'M90 64C84 46 92 32 112 28C104 36 108 40 100 44C108 46 106 52 98 56C100 60 96 63 90 64Z'),
    P('k kw', puff(150, 56, 24, 23, 12)),
    P('k kw', puff(164, 66, 11, 9, 7)),
    P('k kw', puff(134, 66, 8, 14, 7)),
    P('k ka', 'M150 34C142 25 135 31 139 37C143 40 147 37 150 34ZM150 34C156 25 164 29 161 36C157 40 153 37 150 34Z'), O('k ka', 150, 34, 2.4),
    O('kn', 149, 53, 2.9), O('kn', 161, 51, 2.7), O('kn', 170, 62, 3.4),
    P('k ka', 'M164 69q2 7 7 1Z'),
  ];
}

/** 나는 앵무새 — 굽은 부리 · 눈 둘레 흰 테 · 올린 날개 · 길게 흐르는 꼬리 깃 셋 */
function aParrot() {
  return [
    P('k kf', 'M106 90C80 92 50 104 16 118C46 110 78 100 106 96Z'),
    P('k ka', 'M106 94C82 104 58 120 30 136C60 124 86 110 108 99Z'),
    P('k kf', 'M104 88C78 86 52 92 22 100C52 96 78 94 104 93Z'),
    P('k kf', 'M128 86C120 100 108 114 92 122C104 110 112 98 118 88Z'),
    P('k kf', 'M152 52C168 50 180 60 178 72C176 84 160 92 140 94C124 96 112 96 100 94C116 86 132 66 152 52Z'),
    P('k kf', 'M150 66C140 50 126 34 118 14C128 22 134 26 140 28C136 18 136 12 140 4C146 16 150 22 156 26C156 18 160 12 166 8C166 26 164 44 158 62Z'),
    P('k kt', 'M150 60L128 22M154 58L144 16M157 58L160 18'),
    O('k kf', 166, 60, 13),
    P('k kw', 'M168 54C176 52 180 58 178 64C174 66 168 64 166 60Z'), O('ke', 172, 58, 2),
    P('k ka', 'M177 54C188 52 194 60 190 72C187 67 183 65 178 66ZM178 66C182 66 185 68 186 72C182 72 179 70 178 66Z'),
    P('k kt', 'M140 92q2 6 -2 9M146 92q2 6 -2 9'),
  ];
}

/** 하트 별자리 — 하트 둘레의 별 열 개를 가는 선으로 이음 */
function aHeart() {
  const pt = t => [f(100 + 4.6 * 16 * sin(t) ** 3), f(76 - 4.6 * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t)))];
  const ts = [0, .4, .82, 1.22, 1.58, 1.98, 2.5, PI], ps = ts.concat(ts.slice(1, -1).reverse().map(t => -t)).map(pt);
  return [
    P('k kt', 'M' + ps.map(p => p.join(' ')).join('L') + 'Z'),
    ps.map(([x, y], i) => P('k ka', spark(x, y, i % 7 ? 4.5 : 7))),
    P('k', spark(24, 22, 3) + spark(182, 146, 3.5) + spark(20, 140, 2.5) + spark(186, 16, 2.5)),
  ];
}

/** 태양계 — 꽃잎 빛살 해 · 기운 궤도 셋 · 행성 넷(고리 행성 하나) */
function aSolar() {
  const cx = 115, cy = 75, on = (rx, ry, a) => [f(cx + rx * cos(a)), f(cy + ry * sin(a))];
  let rays = '';
  for (let i = 0; i < 12; i++) { const a = i * PI / 6; rays += `M${f(cx + 16 * cos(a))} ${f(cy + 16 * sin(a))}L${f(cx + 22 * cos(a))} ${f(cy + 22 * sin(a))}`; }
  const [p1, p2, p3, p4] = [on(46, 15, 3.5), on(74, 25, 5.8), on(104, 36, 2.6), on(104, 36, .35)];
  return [
    G(`rotate(-14 ${cx} ${cy})`, [
      V('k kt', cx, cy, 46, 15), V('k kt', cx, cy, 74, 25), V('k kd', cx, cy, 104, 36),
      O('k kf', p1[0], p1[1], 3.5), O('k ka', p2[0], p2[1], 5.5), O('k kf', p3[0], p3[1], 6), V('k', p3[0], p3[1], 11, 3.4, -18), O('k ka', p4[0], p4[1], 3),
    ]),
    halo(cx, cy, 27), P('k kp', rays), O('k ka', cx, cy, 12),
  ];
}

/** 혜성 — 빛나는 둥근 머리 · 머리카락처럼 퍼져 흐르는 넓은 꼬리 */
function aComet() {
  return [
    P('k', 'M208 88C170 60 120 36 22 26'),
    P('k kl', 'M208 84C176 52 140 26 62 10'),
    P('k kp', 'M210 96C166 84 120 76 34 64S4 56 12 48'),
    P('k kl kt', 'M206 92C160 72 110 54 42 44'),
    P('k kt', 'M212 98C176 96 130 100 72 92'),
    halo(214, 92, 13), O('k ka', 214, 92, 7),
    P('k', spark(150, 120, 3) + spark(96, 18, 2.5) + spark(244, 60, 3)),
  ];
}

/** 우주선 — 뾰족한 머리 · 둥근 창 · 날개 셋 · 살구 불꽃과 말린 연기 */
function aRocket() {
  return G('rotate(40 85 88)', [
    P('k kp', 'M78 118C70 136 58 140 50 136M92 118C100 136 112 142 116 154'),
    P('k ka', 'M77 115C73 127 81 135 85 147C89 135 97 127 93 115Z'),
    P('k kf', 'M69 94C59 100 55 112 57 122L69 112ZM101 94C111 100 115 112 113 122L101 112Z'),
    P('k kw', 'M85 38C99 52 103 74 101 110L69 110C67 74 71 52 85 38Z'),
    P('k ka', 'M85 38C92 45 95 51 96 58Q85 62 74 58C75 51 78 45 85 38Z'),
    O('k', 85, 78, 7.5), O('k kf', 85, 78, 4.5),
    P('k', 'M76 110L74 116L96 116L94 110'),
    P('k', spark(40, 60, 4) + spark(130, 40, 3.5) + spark(132, 120, 3)),
  ]);
}

/** 비행접시 — 둥근 유리 지붕 · 넓은 접시 · 가장자리 불빛 · 아래로 옅은 빛 */
function aUfo() {
  return [
    halo(100, 58, 34),
    P('kg', 'M86 82L64 132L136 132L114 82Z'), P('k kh kt', 'M86 82L64 132M114 82L136 132'),
    P('k kf', 'M76 66C78 42 122 42 124 66Z'), P('k kt', 'M86 52Q92 47 99 47'),
    P('k', 'M100 44L100 34'), O('k ka', 100, 32, 2.5),
    V('k ka', 100, 70, 58, 13), P('k kt', 'M46 68Q100 82 154 68'),
    [66, 83, 100, 117, 134].map((x, i) => O('k kw', x, i === 2 ? 78 : i % 4 ? 77 : 75, 2.6)),
  ];
}

/** 용 두 마리 — 여의주 하나를 두고 마주 봄 */
function aDragons() {
  return [
    halo(150, 50, 13), O('k ka', 150, 50, 7), P('k kp kt', 'M142 40C138 34 142 28 148 27M158 41C164 37 164 31 160 27'),
    G('translate(4 22) scale(.58)', dragon(false)),
    G('translate(296 22) scale(-.58 .58)', dragon(false)),
  ];
}

/* 그림표 — [그리기, 가로, 세로, 길(su-sky.css .su-fly-*), 뒤집기(왼쪽으로 날 때), 넓은 그림] */
const ART = [
  [aStar, 200, 160, 'a'], [aPolaris, 200, 160, 'b'], [aAurora, 280, 130, 'a', 0, 1], [aMeteor, 220, 130, 'e', 0, 1], [aDragon, 266, 165, 'b', 1, 1],
  [aAngels, 280, 130, 'a', 0, 1], [aPeter, 240, 150, 'c', 0, 1], [aBichon, 200, 150, 'd', 1], [aParrot, 220, 150, 'a', 0, 1], [aHeart, 200, 170, 'b'],
  [aSolar, 230, 150, 'd', 0, 1], [aComet, 260, 140, 'e', 0, 1], [aRocket, 170, 176, 'c'], [aUfo, 200, 140, 'b'], [aDragons, 300, 125, 'a', 0, 1],
];

/** 그림 하나 — 연(날리는 틀) 안에 출렁임 틀 안에 SVG */
function kite(i, cls) {
  const [draw, w, h, , flip, wide] = ART[i];
  const svg = el('svg', {class: 'su-sky-art' + (wide ? ' su-sky-wide' : '') + (flip && !/still/.test(cls) ? ' su-sky-flip' : ''), viewBox: `0 0 ${w} ${h}`, width: w, height: h, 'aria-hidden': 'true', focusable: 'false'}, [draw()]);
  const bob = document.createElement('div'); bob.className = 'su-sky-b'; bob.appendChild(svg);
  const k = document.createElement('div'); k.className = 'su-sky-k ' + cls; k.dataset.sky = SKY_ITEMS[i].id; k.appendChild(bob);
  return k;
}

/* ── 하늘 돌리기 ── */
const PAUSE = 4500, LONGEST = 75000; // 다음 그림까지 쉼 · 한 번 나는 길이의 넉넉한 끝(su-sky.css 의 가장 긴 길 64초보다 김)
let layer = null, timer = 0, run = false, started = false, mq = null;
const still = () => !!(mq && mq.matches);
function ensure() {
  if (layer && layer.isConnected) return layer;
  layer = document.querySelector('.su-sky');
  if (!layer) { layer = document.createElement('div'); layer.className = 'su-sky'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  return layer;
}
function clear() { clearTimeout(timer); timer = 0; if (layer) while (layer.firstChild) layer.firstChild.remove(); }
/** 그림 i 를 한 번 날림 → 끝나면 잠깐 쉬고 다음 그림 */
function fly(i) {
  clear();
  if (!run) return;
  if (still()) { rest(); return; }
  const k = kite(i, 'su-fly-' + ART[i][3]), next = () => { if (!k.isConnected) return; k.remove(); clearTimeout(timer); timer = setTimeout(() => fly((i + 1) % ART.length), PAUSE); };
  k.addEventListener('animationend', e => { if (e.target === k && e.animationName === 'su-sky-fade') next(); });
  ensure().appendChild(k);
  timer = setTimeout(next, LONGEST);
}
/** 움직임 줄이기 — 별 한 장만 멈춘 채 */
function rest() { clear(); ensure().appendChild(kite(0, 'su-sky-still')); }

/** 하늘 켜기 — 층은 하나만 · 그림은 창 load 뒤 3초 + 한가할 때부터 */
export function startSky() {
  if (started) return; started = true;
  const make = () => ensure();
  if (document.body) make(); else document.addEventListener('DOMContentLoaded', make, {once: true});
  mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const begin = () => { run = true; ensure(); if (still()) rest(); else fly(0); };
  const idle = () => setTimeout(() => (window.requestIdleCallback ? window.requestIdleCallback(begin, {timeout: 3000}) : begin()), 3000);
  if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, {once: true});
  const flip = () => { if (!run) return; if (still()) rest(); else fly(0); };
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', flip); else if (mq.addListener) mq.addListener(flip); }
}

/** 시험용 — 그림 i 를 화면 가운데에 멈춘 채 보임(돌던 하늘은 멈춤) · 돌려줌 = 그 SVG */
export function showSkyItem(i) {
  run = false; ensure(); clear();
  const k = kite(((i % ART.length) + ART.length) % ART.length, 'su-sky-still su-sky-mid');
  layer.appendChild(k);
  return k.querySelector('svg');
}
