/* 수르 — 기록 탭의 큰 그림 둘(su-rec-art · 일곱째 판 r7-brief.md 「R」 · 심사 6회 judge-r6.md 를 고침 · 알폰스 무하 화풍)
   ① 기록 한곳(#/r) — 큰 아치(어깨에서 금선이 소용돌이로 풀림) · 아치를 따라 휜 리본 제목(흰 테 없음) · 공용 메달(v=5 · 꽃잎 고리)
      머리 = 메달 뒤에서 나온 굵기 다른 다발 셋(좌우 다르게)이 두 창 아치 꼭대기를 감싸며 바깥 옆으로 흘러내림 · 끝 소용돌이 크기 다르게(창을 붙잡지 않음)
      창 둘 = 아치 머리(색유리 꽃잎 띠 · 이름)와 100칸 판이 한 금테 · 빈 칸 = 한 가지 옅은 크림(어두운 판은 한 가지 짙은 밤색) · 가는 금 줄눈 · 찬 칸만 색유리 구슬(금 · 초록)
      100칸 = su-fig.js waffle 과 같은 값 · 같은 칸 수 · 위 줄부터 채움 · 두 창 사이 = 여인 가슴께에서 내려오는 덩굴 줄기 한 가닥(위 굵고 아래 가늚)
      아래 = 「100번에 33번 · 24번」 한 줄(양옆 꽃 · 굵기 변하는 금선) + 서랍 여섯 = 기둥을 나눠 쓰는 아치 회랑 두 층(층마다 세 칸 · 위아래 기둥 줄 맞춤 · 기둥머리 꽃 · 안쪽 기둥에 가는 덩굴 한 줄)
      서랍 차례(토론으로 정함 · 그대로): 달마다 → 한 달 뒤 → 내 매매일지 → 못 된 까닭 → 날마다 → 옛 기록 더 보기(누르면 #/r/y)
      서랍 값은 su.js vHub 서랍과 같은 셈(su-six.js eMonths · eDays · eYears) · 한 달 뒤 = 매매일지의 「한 달 뒤 물은 기록」 수(su-why.js)
   ② 달마다(#/r/m) — 막대 = 둥근 줄기(값 길이 그대로 · 꼭지에 꽃 · 봉오리 · 밑동에 잎 둘) · 꽃 된 달 = 핀 꽃 · 못한 달 = 닫힌 붉은 봉오리(여덟이면 여덟) · 세는 중 = 새싹
      su-fig.js cols 와 같은 값 · 같은 차례 · 같은 높이 비 · 해마다 아치 창 하나(금 띠에 색유리 점 모자이크 · 09 창과 한 식구)
      눈금 = 금 구슬 줄(beads) · 숫자는 옅은 금빛 · 틀 안쪽 8 넘게 · 아무 회사 = 막대 옆 짧은 금선 + 점 · 「2025년」 · 「2026년」 = 양끝이 말린 둥근 이름판 · 범례 셋은 첫 창 위 한 줄 · 두 창 사이 꽃덩굴 · 맨 아래 꽃 모자이크 띠
      메달(v=6) 머리 = 한 단계 밝은 적갈색 · 가는 다발이 메달 뒤에서 솟아 아치 테두리를 따라 흘러내리고 끝이 말림(범례 · 이름판 · 눈금에서 떨어짐) · 두 자리 달(10 · 11 · 12)은 글자 폭만 좁혀 띄움(글씨 18px 그대로)
   부품 꼴(docs/design/su-musk-2026-11-05/pic-brief.md): load(get, 'hub'|'months') · picture(d) · CSS
   보안: 글 꽂아 넣기 · 글 속 꾸밈 없음 — createElementNS · setAttribute(su-fig.js s · 공용 부품 svg)만
   색: su-rec-art.css 클래스 · 살 · 머리 · 옷 · 두루마리는 공용 부품 고정 색(어두운 판에서도 같음) · 메달 몸 · 눈 · 머리는 공용 부품 그대로(덧그리지 않음)
   움직임: 꽃 · 별 · 머리카락에만(transform) · 들어옴은 0.6초 안에 끝 · 글씨는 처음부터 진하게 */
import {s} from '/su/su-fig.js';
import {NEED, num, eMonths, eDays, eYears} from '/su/su-six.js';
import {svg, taper, medallion, stemBar, vine, beads, rays, ribbon, sleeve} from './su-mucha-kit.js';

export const CSS = '/su/su-rec-art.css';
const B_URL = '/next/data/theme-bloom.json';
const XL = 'http://www.w3.org/1999/xlink';
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r1 = v => Math.round(v * 10) / 10;
let SEQ = 0;

/** 글자 폭 어림(한글 1em · 숫자 0.56em · 빈칸 0.26em · 그 밖 0.5em) — 칸 넓이를 정할 때(실제보다 조금 넉넉) */
const est = (t, px) => [...String(t)].reduce((a, ch) => a + px * (/[가-힣]/.test(ch) ? 1 : /\d/.test(ch) ? 0.56 : ch === ' ' ? 0.26 : 0.5), 0);
/** 칸 나누기용 — 한글을 0.95em 로(실제 글꼴에 가깝게 · 남는 자리를 칸 사이에 고르게) */
const estK = (t, px) => est(t, px) - [...String(t)].filter(ch => /[가-힣]/.test(ch)).length * px * 0.05;
/** 둥근 자리 — deg 0 = 위 · 시계 방향 */
const P = (cx, cy, r, deg) => { const a = deg * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
const pt = p => r1(p[0]) + ' ' + r1(p[1]);
const T = (x, y, t, cls, extra = {}) => s('text', {x: r1(x), y: r1(y), class: cls, ...extra, text: t});
/** 고리 조각 — ri 안 · ro 밖 · a → b 도(시계 방향) */
function sector(cx, cy, ri, ro, a, b) {
  const L = Math.abs(b - a) > 180 ? 1 : 0;
  return 'M' + pt(P(cx, cy, ro, a)) + 'A' + ro + ' ' + ro + ' 0 ' + L + ' 1 ' + pt(P(cx, cy, ro, b)) + 'L' + pt(P(cx, cy, ri, b)) + 'A' + ri + ' ' + ri + ' 0 ' + L + ' 0 ' + pt(P(cx, cy, ri, a)) + 'Z';
}
/** 호(글씨 길) — a → b 도 시계 방향 */
const arcD = (cx, cy, r, a, b) => 'M' + pt(P(cx, cy, r, a)) + 'A' + r + ' ' + r + ' 0 ' + (Math.abs(b - a) > 180 ? 1 : 0) + ' 1 ' + pt(P(cx, cy, r, b));
/** 아치 바깥 금선 — 가운데가 굵고(w) 끝이 가늘게 · 채운 모양 */
function arcInk(cx, cy, r, a, b, w) {
  const n = 40, out = [], inn = [];
  for (let i = 0; i <= n; i++) { const t = i / n, d = a + (b - a) * t, k = 1 + (w - 1) * Math.sin(Math.PI * t); out.push(P(cx, cy, r + k, d)); inn.push(P(cx, cy, r, d)); }
  return 'M' + out.map(pt).join('L') + 'L' + inn.reverse().map(pt).join('L') + 'Z';
}
/** 다섯 갈래 별 */
function star(cx, cy, R, r) {
  const p = []; for (let i = 0; i < 10; i++) p.push(P(cx, cy, i % 2 ? r : R, i * 36));
  return 'M' + p.map(pt).join('L') + 'Z';
}
/** 초승달 — 왼쪽으로 부푼 달 */
const moon = (cx, cy, r) => 'M' + pt([cx, cy - r]) + 'A' + r + ' ' + r + ' 0 1 0 ' + pt([cx, cy + r]) + 'A' + r * 1.25 + ' ' + r * 1.25 + ' 0 0 1 ' + pt([cx, cy - r]) + 'Z';
/** 다섯 잎 꽃 — 피어나는 겉 묶음(0.45초 · 늦음 0 ~ 0.12초) 안에 천천히 도는 속 묶음 */
function flower(cx, cy, r, cls = 'ra-pet', late = 0) {
  const kids = [[0, 72, 144, 216, 288].map(dg => { const [x, y] = P(cx, cy, r * 0.9, dg); return s('circle', {cx: r1(x), cy: r1(y), r: r1(r * 0.62), class: cls}); }),
    s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r * 0.42), class: 'ra-core'})];
  return s('g', {class: 'ra-fl ra-fd' + late}, s('g', {class: 'ra-sw' + (late % 2 ? ' ra-sw2' : '')}, kids));
}
const svgRoot = (kind, label, ...kids) => s('svg', {class: 'su-svg su-art4 su-rec-art ra-' + kind, viewBox: '0 0 390 620', role: 'group', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet'}, ...kids);
const need = (kind, label) => svgRoot(kind, label, s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24, class: 'ra-bg'}),
  T(195, 300, NEED, 'ra-need', {'text-anchor': 'middle'}), T(195, 336, '자료를 받지 못했어요', 'ra-lg', {'text-anchor': 'middle'}));
/** 별과 달 — 아치 밖 위 두 귀퉁이(「달과 별」 1902) */
const skies = (m, big, small, dots) => s('g', {'data-mucha': 'stars', class: 'ra-stars', 'aria-hidden': 'true'},
  s('path', {d: moon(...m), class: 'ra-moon'}), s('path', {d: star(...big), class: 'ra-star ra-tw1'}),
  small.map(([x, y, R, r], i) => s('path', {d: star(x, y, R, r), class: 'ra-star ra-tw' + (2 + i % 2)})),
  dots.map(([x, y]) => s('circle', {cx: x, cy: y, r: 1.8, class: 'ra-dot'})));

/* ── 받기 ── */
export async function load(get, which = 'hub') {
  const kind = which === 'months' ? 'months' : 'hub';
  let B = null; try { B = await get(B_URL); } catch (e) { console.error(e); }
  const asOf = B?.asOf ?? null;
  if (kind === 'months') {
    const e = B ? eMonths({B}) : null;
    return {kind, asOf, rows: (e?.ms ?? []).map(m => ({v: m.rec.rate, v2: m.rec.base, open: m.rec.complete !== true, key: m.month}))}; // vMonths hero cols 와 같은 줄
  }
  const hon = B?.honest ?? null, ms = B ? eMonths({B}) : null, dd = B ? eDays({B}) : null, yy = B ? eYears({B}) : null, miss = B?.why?.all?.miss;
  let mine = null, asked = null, later = null;
  try { const Y = await import('/su/su-why.js'), full = (Y.readWhy() ?? []).filter(Y.fullWhy); mine = full.length; asked = full.filter(r => r?.kept?.a === 'yes' || r?.kept?.a === 'no').length; } catch (e) { console.error(e); }
  try { const R = await import('/su/su-roads.js'), F = await R.feats(), f = F.find(x => x.name === '한 달 뒤'); later = f ? R.hrefOf(f) : null; } catch (e) { console.error(e); }
  const drawers = [ // 서랍 차례 — 토론으로 정함 · 값은 vHub 서랍과 같은 셈
    {k: 'm', name: '달마다', href: '#/r/m', v: ms ? (ms.big.v ?? NEED) : NEED},
    {k: 'later', name: '한 달 뒤', href: later ?? '#/j', v: fin(asked) ? asked + '번' : NEED},
    {k: 'j', name: '내 매매일지', href: '#/j', v: fin(mine) ? mine + '번' : NEED},
    {k: 'w', name: '못 된 까닭', href: '#/r/w', v: num(miss) ? num(miss) + '번' : NEED},
    {k: 'd', name: '날마다', href: '#/r/d', v: dd?.big?.v != null ? dd.big.v + '날' : NEED},
    {k: 'y', name: '옛 기록 더 보기', href: '#/r/y', v: yy?.big?.v != null ? yy.big.v + ' 대 ' + yy.big.v2 : NEED, also: '#/r/n'}]; // 해마다 · 가까운 회사를 한 이름표로 — 값은 해마다(누르면 여는 쪽)
  return {kind, asOf, rate: hon?.rate ?? null, base: hon?.base ?? null, drawers};
}

/* ── 그리기 ── */
export function picture(d, opt = {}) {
  const id = 'ra' + (++SEQ) + (opt.id ? '-' + opt.id : '');
  if (d?.kind === 'months') return d.rows?.length ? months(d, id) : need('months', '달마다 꽃이 된 횟수 · 확인 필요');
  return d && (fin(d.rate) || fin(d.base) || d.drawers?.length) ? hub(d, id) : need('hub', '100번에 몇 번 꽃이 됐나 · 확인 필요');
}

/** 아치를 따라 휜 리본(공용 ribbon) 위 제목 — 흰 테 없이 갈색으로 띠 안에 새김 · a0 → a1 도 */
function archRibbon(cx, cy, r, a0, a1, w, text, cls) {
  const pts = []; for (let i = 0; i <= 18; i++) pts.push(P(cx, cy, r, a0 + (a1 - a0) * i / 18));
  const rb = ribbon(pts, {w, tone: 'cream'}), pid = rb.getAttribute('data-path');
  const tp = s('textPath', {href: '#' + pid, startOffset: '50%', text});
  try { tp.setAttributeNS(XL, 'xlink:href', '#' + pid); } catch (e) { /* 새 브라우저는 href 만으로 됨 */ }
  return [rb, s('text', {class: cls, 'text-anchor': 'middle', 'dominant-baseline': 'central'}, tp)];
}
/** 점 사이를 매끈하게(캣멀-롬) */
function smooth(p, k = 8) {
  const o = [p[0]], at = i => p[Math.max(0, Math.min(p.length - 1, i))];
  for (let i = 0; i < p.length - 1; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 1; j <= k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(q => 0.5 * (2 * p1[q] + (p2[q] - p0[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t2 + (3 * p1[q] - p0[q] - 3 * p2[q] + p3[q]) * t3))); } }
  return o;
}
/** 끝 말림 — 마지막 접선을 그대로 이어받아 안으로 말리는 소용돌이(dir 1 = 화면에서 시계 방향 · 꺾임 없음) */
function curlEnd(A, r, dir, turns = 1.15) {
  const a = A[A.length - 2], b = A[A.length - 1];
  let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [b[0] + N[0] * r, b[1] + N[1] * r], a0 = Math.atan2(b[1] - c[1], b[0] - c[0]), B = [];
  for (let i = 1; i <= 26; i++) { const t = i / 26, an = a0 + dir * t * turns * 2 * Math.PI, rr = r * (1 - 0.8 * t); B.push([c[0] + rr * Math.cos(an), c[1] + rr * Math.sin(an)]); }
  return [...A, ...B];
}
/** 굵기가 변하는 채운 띠 — wf(t) = 길이 비율 t(0 뿌리 → 1 끝)에서의 온 폭 */
function fillBand(A, wf) {
  const n = A.length, Ls = [0]; for (let i = 1; i < n; i++) Ls.push(Ls[i - 1] + Math.hypot(A[i][0] - A[i - 1][0], A[i][1] - A[i - 1][1]));
  const tot = Ls[n - 1] || 1, Lf = [], Rt = [];
  for (let i = 0; i < n; i++) { const a = A[Math.max(0, i - 1)], b = A[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, h = Math.max(0.12, wf(Ls[i] / tot)) / 2;
    Lf.push([A[i][0] - dy / l * h, A[i][1] + dx / l * h]); Rt.push([A[i][0] + dy / l * h, A[i][1] - dx / l * h]); }
  return 'M' + Lf.map(pt).join('L') + 'L' + Rt.reverse().map(pt).join('L') + 'Z';
}
/** 머리 한 다발(08 친구에게의 그리는 법) — 메달 뒤 뿌리에서 부풀었다가 끝으로 가늘어지는 채운 띠 · 속 결 둘(어둡게 · 밝게) · 한쪽 가는 그늘선 · 끝 소용돌이 */
function lock(p, {w = 6, r = 6, dir = 1, turns = 1.1, hold = 0} = {}) {
  const A = r > 0 ? curlEnd(smooth(p, 8), r, dir, turns) : smooth(p, 8), n = A.length;
  const wf = hold ? t => (t <= hold ? w * (0.8 + 0.2 * Math.sin(Math.PI * t / hold)) : w * 0.8 * Math.pow(Math.max(0, 1 - (t - hold) / (1 - hold)), 0.7)) + 0.4 * t // 길게 굵기를 지키다 끝에서 가늘어짐(뿌리가 리본 뒤에 숨는 다발)
    : t => w * (0.62 + 0.38 * Math.sin(Math.PI * Math.min(1, 0.5 + t * 0.9))) * Math.pow(Math.max(0, 1 - t), 0.55) + 0.4 * t;
  const off = (k, f, cut = 1) => { const m = Math.max(3, Math.round(n * cut)), Ls = [0]; for (let i = 1; i < n; i++) Ls.push(Ls[i - 1] + Math.hypot(A[i][0] - A[i - 1][0], A[i][1] - A[i - 1][1]));
    return A.slice(0, m).map((q, i) => { const a = A[Math.max(0, i - 1)], b = A[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, o = wf(Ls[i] / Ls[n - 1]) / 2 * k + f; return [q[0] - dy / l * o, q[1] + dx / l * o]; }); };
  const line = (B, w0, w1, cls) => s('path', {d: fillBand(B, t => w0 + (w1 - w0) * t), class: cls});
  return [s('path', {d: fillBand(A, wf), class: 'mk-hb'}),
    line(off(-0.42, 0, 0.8), w * 0.16, 0.3, 'mk-hd'), line(off(0.3, 0, 0.66), w * 0.13, 0.25, 'mk-hl'), line(off(0.62, 0, 0.5), w * 0.08, 0.2, 'mk-hd'),
    line(off(-1, 0.35), Math.min(1.3, w * 0.2), 0.25, 'mk-hd')];
}
/** 기둥에 감긴 가는 덩굴 한 줄 — 옆으로 뻗는 덩굴손 없이 잎 셋만(글씨 쪽으로 나가지 않게) */
function colVine(x, yb, yt) {
  const h = yb - yt, A = smooth([[x, yb], [x - 2.4, yb - h * 0.33], [x + 2.4, yb - h * 0.66], [x, yt]], 8);
  const lv = [0.24, 0.5, 0.76].map((u, i) => leafD(x + (i % 2 ? 1.6 : -1.6), yb - h * u, i % 2 ? -0.55 : -Math.PI + 0.55, 5.4, 1.7)).join('');
  return [s('path', {d: fillBand(A, t => 1.7 - 1.1 * t), class: 'ra-cvs'}), s('path', {d: lv, class: 'ra-cvl'})];
}
/** 머리 다발 묶음 — tone = 메달 머리 색(공용 부품 색) */
const locks = (tone, list) => svg('g', {class: 'mk-hair mk-t' + tone, 'data-mucha': 'whiplash', 'aria-hidden': 'true'}, list.map(([p, o]) => lock(p, o)));
/** 아치 어깨에서 풀려 나오는 금선 소용돌이(굵게 시작해 가늘게) */
const unwind = (pts, r, dir) => taper(curlEnd(smooth(pts, 8), r, dir, 1.3), {w0: 2.6, w1: 0.35, cls: 'ra-ink'});
/** 잎 한 장 — (x, y) 밑동 · ang 방향(라디안) · 길이 len · 반폭 wd */
const leafD = (x, y, ang, len, wd) => { const c = Math.cos(ang), n = Math.sin(ang), Q = (u, v) => r1(x + c * u - n * v) + ' ' + r1(y + n * u + c * v);
  return 'M' + Q(0, 0) + 'C' + Q(len * 0.3, -wd * 1.3) + ' ' + Q(len * 0.75, -wd * 1.1) + ' ' + Q(len, 0) + 'C' + Q(len * 0.75, wd * 1.1) + ' ' + Q(len * 0.3, wd * 1.3) + ' ' + Q(0, 0) + 'Z'; };
/** 작은 아치 칸 — 위 창과 같은 꼴(위가 둥근 아치 · rise 만큼 솟음) · i = 안쪽으로 들인 만큼 */
const cellD = (x, y, w, h, rise, i = 0) => 'M' + r1(x + i) + ' ' + r1(y + h - i) + 'V' + r1(y + rise + i * 0.6) + 'A' + r1(w / 2 - i) + ' ' + r1(Math.max(1, rise - i * 0.4)) + ' 0 0 1 ' + r1(x + w - i) + ' ' + r1(y + rise + i * 0.6) + 'V' + r1(y + h - i) + 'Z';

/** 작은 아치 바깥 금선 — 타원 아치(반폭 a · 솟음 b) 위에 꼭대기 굵고(w) 발치로 가늘게 · 채운 모양 */
function archInk(mx, spr, a, b, w) {
  const n = 36, out = [], inn = [];
  for (let i = 0; i <= n; i++) { const t = i / n, f = Math.PI * (1 - t), k = 0.45 + (w - 0.45) * Math.sin(Math.PI * t);
    out.push([mx + (a + k) * Math.cos(f), spr - (b + k) * Math.sin(f)]); inn.push([mx + a * Math.cos(f), spr - b * Math.sin(f)]); }
  return 'M' + out.map(pt).join('L') + 'L' + inn.reverse().map(pt).join('L') + 'Z';
}
/** 09 흉상(여덟째 판) — 공용 메달의 망토 덩어리 위에 이 쪽만의 옷을 덮음(메달 원 안으로 자름)
 *  높은 깃 상아 옷 · 두 어깨에 걸친 하늘빛 겉옷(어깨 주름 넷씩 · 바깥선 어깨 굵고 목으로 가늘게) · 금 구슬 목걸이와 붉은 방울
 *  두 손 = 공용 부품 손(hold) 둘을 가운데로 모아 내려가는 덩굴 줄기를 위아래로 쥠 · 줄기 끝은 손 위에서 작게 말림 */
function bust09(clipId) {
  const Ls = a => smooth(a, 6).map(pt).join('L');
  const shL = [[128, 171], [137, 163.6], [147, 156.6], [158, 151], [170, 146.4], [180, 142.4], [184.4, 139.5]];
  const neck = [[184.4, 139.5], [188.6, 140.8], [192.6, 141.3], [196.8, 140.3], [201.6, 138.4]];
  const shR = [[201.6, 138.4], [206.2, 141.4], [216, 145.4], [228, 148.8], [240, 153.6], [252, 160.6], [262, 170]];
  const edgeL = [[184.8, 141.2], [186.6, 147.4], [183.4, 157], [178.6, 168], [176.4, 182], [178, 200]];
  const edgeR = [[200.8, 140.6], [201.8, 147.4], [204.4, 156.4], [208.6, 168], [211.4, 184], [213, 200]];
  const fold = (a, w0 = 1.3) => taper(smooth(a, 6), {w0, w1: 0.2, cls: 'mk-cld-sky'});
  const cloth = s('g', {'clip-path': 'url(#' + clipId + ')', class: 'ra-bust', 'data-mucha': 'outline', 'aria-hidden': 'true'},
    s('path', {d: 'M' + Ls([...shL, ...neck.slice(1), ...shR.slice(1)]) + 'L262 200L128 200Z', class: 'mk-cl-ivory'}),
    s('path', {d: 'M' + Ls(shL.slice(0, -1).concat([[184.8, 141.2]])) + 'L' + Ls(edgeL) + 'L128 200Z', class: 'mk-cl-sky'}),
    s('path', {d: 'M' + Ls([[200.8, 140.6], ...shR.slice(1)]) + 'L262 200L' + Ls(edgeR.slice().reverse()) + 'Z', class: 'mk-cl-sky'}),
    // 어깨 주름 — 어깨 꼭대기에서 손 쪽으로 휘어 내려옴
    fold([[150, 158], [158, 166], [165, 178], [168, 194]], 1.5), fold([[161, 151.6], [167.6, 159], [172, 170], [173.4, 184]]), fold([[140, 165], [146, 175], [151, 190]], 1.1), fold([[171, 147.4], [176.4, 154], [179, 162]], 1),
    fold([[236, 155.6], [228.6, 164.4], [221.4, 176], [218, 193]], 1.5), fold([[225, 151], [218.6, 158.6], [214.4, 170], [213, 184]]), fold([[247, 162], [241.4, 172.6], [236, 189]], 1.1), fold([[213, 145.6], [208, 152.4], [206, 160]], 1),
    // 바깥선 — 어깨 굵게 · 목으로 가늘게 · 겉옷 앞자락은 목에서 아래로 가늘어짐
    taper(smooth(shL, 6), {w0: 2, w1: 0.5, cls: 'mk-ink'}), taper(smooth(shR.slice().reverse(), 6), {w0: 2, w1: 0.5, cls: 'mk-ink'}),
    taper(smooth(edgeL, 6), {w0: 1.2, w1: 0.3, cls: 'mk-ink'}), taper(smooth(edgeR, 6), {w0: 1.2, w1: 0.3, cls: 'mk-ink'}),
    taper(smooth(neck, 6), {w0: 0.9, w1: 0.5, cls: 'mk-ink'}),
    s('path', {d: fillBand(smooth([[185.4, 146.6], [189, 148.2], [192.8, 148.6], [197, 147.8], [201.2, 146]], 6), () => 1.3), class: 'mk-gold'}));
  // 목걸이 — 깃 아래로 늘어진 금 구슬 줄 · 끝에 붉은 방울
  const nk = smooth([[186, 148.6], [187.8, 153.4], [191.8, 157.4], [196, 153], [198.8, 147.8]], 10), beadsD = [];
  for (let i = 1, acc = 0; i < nk.length; i++) { acc += Math.hypot(nk[i][0] - nk[i - 1][0], nk[i][1] - nk[i - 1][1]); if (acc >= 2.3) { acc = 0; beadsD.push('M' + r1(nk[i][0] - 0.95) + ' ' + r1(nk[i][1]) + 'a0.95 0.95 0 1 0 1.9 0a0.95 0.95 0 1 0 -1.9 0Z'); } }
  const gem = 'M191.8 157.2C194 158.6 194 162.2 191.8 164.4C189.6 162.2 189.6 158.6 191.8 157.2Z';
  const jewel = s('g', {class: 'ra-jewel', 'aria-hidden': 'true'}, s('path', {d: beadsD.join(''), class: 'mk-bead'}), s('path', {d: gem, class: 'ra-gem'}), s('circle', {cx: 191.8, cy: 156.6, r: 1.1, class: 'mk-bead'}));
  // 덩굴 줄기 — 손 위에서 작게 말리고 두 손 사이를 지나 메달 아래 덩굴로 이어짐(위 가늘고 아래 굵게)
  const stem = s('g', {class: 'ra-hold', 'data-mucha': 'vine', 'aria-hidden': 'true'},
    taper(smooth([[197.4, 163], [195.6, 169], [195, 176], [196.2, 184.6], [197.4, 193]], 6), {w0: 1.6, w1: 4.4, cls: 'mk-vstem'}),
    taper(curlEnd(smooth([[195.6, 169], [196.4, 164.6], [198.6, 160.6]], 6), 2.6, 1, 1.25), {w0: 1.7, w1: 0.3, cls: 'mk-vstem'}),
    s('path', {d: leafD(196.2, 166, -2.5, 7.5, 2.3) + leafD(196.6, 167.4, -0.5, 6.5, 2), class: 'mk-vleaf'}));
  // 두 손 — 왼손은 위에서 · 오른손은 아래에서 줄기를 감아쥠(엄지가 위)
  return [cloth, jewel, stem, sleeve({x: 152, y: 157, ang: -66, len: 30, w: 12.5, hand: 'hold', dir: 1, tone: 'cream'}),
    sleeve({x: 238, y: 160, ang: 62, len: 32, w: 12.5, hand: 'hold', dir: -1, tone: 'cream'})];
}

/* ① 기록 한곳 — 아치 · 휜 리본 제목 · 메달(머리가 두 창 꼭대기 꽃까지) · 한 금테 창 둘(빈 칸 크림 모자이크 · 찬 칸 둥근 유리) · 아래 아치 판 하나(값 한 줄 + 서랍 여섯 꽃 명판) · 덩굴 · 꽃 모자이크 띠 */
function hub(d, id) {
  const AC = [195, 206], AO = 190, AI = 178, MC = [195, 128], MR = 60;
  const WW = 142, WR = 71, RIM = 5, LEAD = 2.1, PAD = 2.2, PH = 13, ST = 21, SPR = 226, WX = [30, 218];
  const PW = (WW - 2 * RIM - 2 * PAD - 9 * LEAD) / 10, GT = SPR + ST + 3.2, GB = GT + 10 * PH + 9 * LEAD, WB = r1(GB + PAD + RIM);
  const VL = 433, RY = [441, 511], RHS = [66, 82], RISE = 18, IX = [21, 369], CW = 6; // 칸 폭 같게 · 둘째 층은 두 줄 이름 자리만큼 높게
  const TC = ['ra-t1', 'ra-t2', 'ra-t3'], clip = id + '-clip', ga = id + '-ga', gb = id + '-gb';
  const winD = (x, ys, bot, r) => 'M' + r1(x) + ' ' + r1(bot) + 'V' + r1(ys) + 'A' + r1(r) + ' ' + r1(r) + ' 0 0 1 ' + r1(x + 2 * r) + ' ' + r1(ys) + 'V' + r1(bot) + 'Z';
  // 찬 칸 = 보석(카보숑) — 왼쪽 위가 밝고 가장자리가 짙은 둥근 빛
  const grad = (gid, c0, c1, c2) => s('radialGradient', {id: gid, cx: 0.36, cy: 0.3, r: 0.85, fx: 0.3, fy: 0.22}, s('stop', {offset: 0, class: c0}), s('stop', {offset: 0.48, class: c1}), s('stop', {offset: 1, class: c2}));
  const kids = [s('defs', {}, s('clipPath', {id: clip}, s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24})), grad(ga, 'ra-ga0', 'ra-ga1', 'ra-ga2'), grad(gb, 'ra-gb0', 'ra-gb1', 'ra-gb2'))];
  const art = s('g', {'clip-path': 'url(#' + clip + ')'});
  art.append(s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24, class: 'ra-bg'}));

  // 파스텔 색면 — 큰 아치 안 옅은 금빛 한 면
  art.append(s('g', {'data-mucha': 'pastel', class: 'ra-pastel', 'aria-hidden': 'true'},
    s('path', {d: 'M' + (AC[0] - AI) + ' 596V' + AC[1] + 'A' + AI + ' ' + AI + ' 0 0 1 ' + (AC[0] + AI) + ' ' + AC[1] + 'V596Z', class: 'ra-field'})));
  art.append(skies([34, 42, 15], [352, 38, 12, 5], [[78, 22, 6, 2.5], [312, 18, 6, 2.5]], [[108, 10], [56, 66], [334, 66], [282, 9], [16, 22], [374, 16]]));

  // 후광 — 메달 뒤 아주 옅은 빛살 · 가는 금 고리
  art.append(s('g', {'data-mucha': 'halo', class: 'ra-halo', 'aria-hidden': 'true'}, rays(MC[0], MC[1], MR, MR + 40, {n: 48}), s('circle', {cx: MC[0], cy: MC[1], r: MR + 6, class: 'ra-ring'})));

  // 아치 띠(살구 바탕에 금 · 잎 · 살구 조각)
  const band = [s('path', {d: sector(AC[0], AC[1], AI, AO, -90, 90), class: 'ra-aband'})];
  for (let k = -86, i = 0; k <= 86; k += 4.3, i++) { const [x, y] = P(AC[0], AC[1], (AO + AI) / 2, k);
    band.push(i % 2 ? s('circle', {cx: r1(x), cy: r1(y), r: 2.1, class: TC[(i >> 1) % 3]}) : s('rect', {x: r1(x - 2.4), y: r1(y - 2.4), width: 4.8, height: 4.8, rx: 1.2, class: TC[(i >> 1) % 3], transform: 'rotate(' + r1(k + 45) + ' ' + r1(x) + ' ' + r1(y) + ')'})); }
  art.append(s('g', {'data-mucha': 'arch', class: 'ra-arch', 'aria-hidden': 'true'}, band));

  // 굵기가 변하는 윤곽 — 아치 바깥 금선(꼭대기 굵고 발치로 가늘게) · 두 어깨에서 소용돌이로 풀림 · 창 그림자
  art.append(s('g', {'data-mucha': 'outline', class: 'ra-outline', 'aria-hidden': 'true'},
    s('path', {d: arcInk(AC[0], AC[1], AO, -89, 89, 5), class: 'ra-ink'}),
    unwind([P(AC[0], AC[1], AO + 1, -63), [23.5, 111], [19, 101]], 6, 1), unwind([P(AC[0], AC[1], AO + 1, 61), [368, 113], [372.5, 104]], 5, -1),
    WX.map(x => s('path', {d: winD(x + 1.8, SPR + 2.4, WB + 2.4, WR), class: 'ra-cont'}))));

  // 덩굴 — 맨 아래 칸 발치(굵게)에서 아치 띠를 따라 제목 리본 끝(가늘게)까지 끊기지 않고 오름(창 위 머리채와 겹치지 않게 띠 위로)
  //   서랍 칸 옆(y 430 아래)은 잎 없는 줄기만 · 잎은 위로 붙여 칸 테를 덮지 않음
  const side = flip => { const X = x => (flip ? 390 - x : x), up = flip ? -Math.PI / 2 + 0.36 : -Math.PI / 2 - 0.36;
    const lo = [[10, 594], [8.6, 560], [10.4, 526], [8.8, 492], [10.2, 458], [9.6, 430]].map(([x, y]) => [X(x), y]);
    const hi = [[9.6, 430], [12, 400], [9, 370], [12, 340], [9, 300], [12, 266], [10, 236], [11, 206], [13.8, 174], [21, 146], [31, 123]].map(([x, y]) => [X(x), y]);
    return [taper(lo, {w0: 5.4, w1: 4.3, cls: 'mk-vstem'}), s('path', {d: [566, 530, 496, 462].map((y, i) => leafD(X(i % 2 ? 9.2 : 10), y, up, 7.5, 2.1)).join(''), class: 'mk-vleaf'}),
      vine(hi, {w0: 4.3, w1: 1, leaves: 10, buds: 3, seed: flip ? 23 : 7})]; };
  art.append(s('g', {class: 'ra-vines', 'aria-hidden': 'true'}, side(false), side(true)));

  // 창 둘 — 한 금테 안에 아치 머리(상아 유리 · 둘레 꽃잎 색유리 · 이름)와 100칸 판
  //   빈 칸 = 한 가지 옅은 크림(어두운 판은 한 가지 짙은 밤색) · 칸 사이 = 가는 금 줄눈 · 찬 칸만 색유리 구슬(둥근 빛 + 왼쪽 위 반짝임) · 위 줄 왼쪽부터 채움(su-fig.js waffle 과 같은 차례)
  const A = fin(d.rate) ? Math.round(d.rate) : 0, Bn = fin(d.base) ? Math.round(d.base) : 0;
  const GC = ['ra-g1', 'ra-g2', 'ra-g3'];
  const window_ = (x, who, n, cls, gid) => {
    const wc = x + WR, x0 = x + RIM + PAD, rl = WR - RIM - 2.2, g = s('g', {class: 'ra-win'});
    g.append(s('path', {d: winD(x, SPR, WB, WR), class: 'ra-rim'}), s('path', {d: winD(x + RIM, SPR, WB - RIM, WR - RIM), class: 'ra-came'}));
    g.append(s('path', {d: 'M' + r1(wc - rl) + ' ' + r1(SPR + ST) + 'V' + SPR + 'A' + r1(rl) + ' ' + r1(rl) + ' 0 0 1 ' + r1(wc + rl) + ' ' + SPR + 'V' + r1(SPR + ST) + 'Z', class: 'ra-lun'}));
    for (let i = 0; i < 9; i++) { const a = -90 + i * 20; g.append(s('path', {d: sector(wc, SPR, rl - 9, rl, a + 0.9, a + 19.1), class: 'ra-glass ' + GC[i % 3]})); }
    const glints = [];
    g.append(s('g', {class: 'ra-grid', 'data-who': who, 'data-n': String(n)}, Array.from({length: 100}, (_, k) => {
      const on = k < n, cx = x0 + (k % 10) * (PW + LEAD), cy = GT + Math.floor(k / 10) * (PH + LEAD);
      if (on) glints.push(s('ellipse', {cx: r1(cx + PW * 0.33), cy: r1(cy + PH * 0.27), rx: r1(PW * 0.2), ry: r1(PH * 0.11), class: 'ra-glint'}));
      const row = Math.floor(k / 10), col = k % 10, tone = (row * 7 + col * 3 + ((row * col) % 4)) % 5; // 빈 칸 = 옅은 크림 · 연분홍 · 상아 유리 조각(색유리 창 · 자리 그대로)
      return s('rect', {x: r1(cx), y: r1(cy), width: r1(PW), height: PH, rx: on ? 4.4 : 1.6, fill: on ? 'url(#' + gid + ')' : null, class: on ? cls + ' ra-on' : 'ra-empty ra-e' + (tone < 2 ? 0 : tone < 4 ? 1 : 2), 'data-cell': ''});
    })), s('g', {class: 'ra-glints', 'aria-hidden': 'true'}, glints));
    g.append(s('path', {d: winD(x + 2.2, SPR, WB - 2.2, WR - 2.2), class: 'ra-rim2'}));
    return g;
  };
  // 두 창 사이 — 여인 가슴께(메달 아래 끝 뒤)에서 내려오는 덩굴 줄기 한 가닥(위 굵고 아래 가늚 · 잎 · 봉오리 · 끝은 작은 말림)
  const pv = [[195, 176], [199, 204], [190, 234], [200, 266], [190, 298], [199, 330], [191, 362], [197, 388], [195, 400]];
  art.append(s('g', {'data-mucha': 'panel', class: 'ra-panel'},
    window_(WX[0], 'pick', A, 'ra-ok', ga), window_(WX[1], 'any', Bn, 'ra-basefill', gb),
    vine(pv, {w0: 4.6, w1: 0.9, leaves: 10, buds: 3, seed: 31})));

  // 머리 — 메달 뒤에서 나온 굵기 다른 다발 셋이 두 창 아치 꼭대기를 감싸고(창 금테 밖 6 단위) 바깥 옆으로 흘러내림 · 좌우 다르게(길이 · 말림 크기)
  //   u = 창 가운데에서 잰 각(0 = 꼭대기 · 바깥쪽이 +) · 메달 쪽 뿌리는 메달 뒤에 숨음
  //   여덟째 판: 굵은 밧줄 셋 → 한 뿌리에서 갈라지는 가는 가닥 여섯(굵기 4.2 → 1.8 · 끝 가늘게) · 끝 소용돌이가 창 아치 위 여기저기에서 아치 쪽으로 감김(넷) · 바깥으로 말림(둘)
  const hairSide = (wc, sgn, o) => { const W = (r, u) => P(wc, SPR, r, sgn * u), X = x => (sgn < 0 ? x : 390 - x), A = sgn, B = -sgn;
    return [
      [[[X(176), 130], [X(150), 132], [X(138), 133], W(86, -20), W(83, -6), W(82, 8), W(82, 22), W(82.5, o.e[0])], {w: 5.6, r: o.r[0], dir: A, turns: 1.3}],
      [[[X(176), 126], [X(150), 127], [X(138), 128.5], W(91, -17), W(89.5, -2), W(89, 18), W(88.5, 36), W(88, o.e[1])], {w: 4.6, r: o.r[1], dir: A, turns: 1.3}],
      [[[X(176), 122], [X(150), 122], [X(138), 124], W(96, -14), W(96, 0), W(96.5, 14), W(97, o.e[2])], {w: 3.8, r: o.r[2], dir: B, turns: 1.25}],
      [[[X(176), 134], [X(150), 136], [X(139), 137.5], W(81, -25), W(79.5, o.e[3])], {w: 3.2, r: o.r[3], dir: A, turns: 1.45}],
      [[[X(176), 118], [X(150), 117], [X(139), 119.5], W(101, -12), W(101, 2), W(100, o.e[4])], {w: 2.8, r: o.r[4], dir: B, turns: 1.4}],
      [[[X(176), 128], [X(150), 130], [X(138), 131], W(88.5, -19), W(88, -11), W(88, o.e[5])], {w: 2.2, r: o.r[5], dir: A, turns: 1.5}]]; };
  const WCL = WX[0] + WR, WCR = WX[1] + WR;
  art.append(locks(5, [...hairSide(WCL, -1, {e: [36, 54, 24, -14, 12, -4], r: [5.2, 6.4, 4.4, 3.6, 4, 3.2]}), ...hairSide(WCR, 1, {e: [40, 56, 20, -12, 14, -2], r: [5.8, 5.6, 4.8, 3.4, 4.4, 3]})]));
  // 머리채 위 꽃 — 창 꼭대기에서 다발을 묶은 꽃 장식
  art.append(s('g', {'aria-hidden': 'true'}, flower(WCL, SPR - WR - 6, 7.5, 'ra-pet', 1), flower(WCR, SPR - WR - 6, 7.5, 'ra-pet', 2)));

  // 메달(공용 v=5 · 꽃잎 고리) — 얼굴이 7도 기울어 두 눈 높이가 달랐음 → 메달을 통째로 7도 되돌려 두 눈을 같은 높이로(둥근 테는 그대로)
  //   그 위에 이 쪽만의 흉상: 높은 깃 상아 옷 · 두 어깨에 걸친 하늘빛 겉옷(어깨 주름) · 금 구슬 목걸이 · 두 손을 모아 내려가는 덩굴 줄기를 쥠
  art.append(s('g', {transform: 'rotate(-7 ' + MC[0] + ' ' + MC[1] + ')'}, medallion({cx: MC[0], cy: MC[1], r: MR, v: 5, dir: 1, ring: 'petal'})));
  kids[0].append(s('clipPath', {id: id + '-bust'}, s('circle', {cx: MC[0], cy: MC[1], r: MR})));
  art.append(...bust09(id + '-bust'));

  // 아래 숫자 판 — 기둥을 나눠 쓰는 아치 회랑 두 층(층마다 세 칸 · 칸 폭 같음 · 위아래 기둥 줄 맞춤 · 기둥머리 꽃)
  //   머리 아치 = 위 두 창처럼 분홍 · 연두 · 노랑 쐐기돌 아홉(가는 금 줄눈) · 바깥 금선은 꼭대기 굵고 발치로 가늘게 · 기둥에 덩굴 없음(테를 덮지 않게)
  const dr = (d.drawers ?? []).slice(0, 6), rowsD = [dr.slice(0, 3), dr.slice(3, 6)].filter(r => r.length), cells = [];
  const nB = 3, bw = (IX[1] - IX[0] - CW * (nB + 1)) / nB, colX = Array.from({length: nB + 1}, (_, i) => IX[0] + i * (CW + bw)); // 기둥 왼쪽 끝 — 두 층이 같은 자리
  rowsD.forEach((row, ri) => row.forEach((x, i) => cells.push({x: colX[i] + CW, y: RY[ri], w: bw, h: RHS[ri], d: x, n: ri * 3 + i})));
  const cellG = s('g', {'data-mucha': 'arch', class: 'ra-cells', 'aria-hidden': 'true'});
  rowsD.forEach((row, ri) => { const y = RY[ri], RH = RHS[ri], spr = y + RISE, bot = y + RH;
    row.forEach((_, i) => { const xa = colX[i] + CW, w = bw, mx = xa + w / 2, a = w / 2, t = 6.4;
      const E = (rx, ry, f) => [mx + rx * Math.cos(f), spr - ry * Math.sin(f)];
      cellG.append(s('path', {d: cellD(xa, y, w, RH, RISE), class: 'ra-cbg'}),
        s('path', {d: 'M' + r1(xa + 3) + ' ' + r1(spr + 1) + 'V' + r1(bot - 3) + 'H' + r1(xa + w - 3) + 'V' + r1(spr + 1), class: 'ra-cin'}));
      for (let j = 0; j < 9; j++) { const f0 = Math.PI * (1 - j / 9), f1 = Math.PI * (1 - (j + 1) / 9), q = [];
        for (let u = 0; u <= 4; u++) q.push(E(a, RISE, f0 + (f1 - f0) * u / 4));
        for (let u = 4; u >= 0; u--) q.push(E(a - t, RISE - t, f0 + (f1 - f0) * u / 4));
        cellG.append(s('path', {d: 'M' + q.map(pt).join('L') + 'Z', class: 'ra-glass ' + GC[(j + ri + i) % 3]})); }
      cellG.append(s('path', {d: archInk(mx, spr, a, RISE, 2.4), class: 'ra-ink'}));
    });
    const cols = colX.slice(0, row.length + 1);
    cols.forEach(cx => cellG.append(s('rect', {x: r1(cx), y: r1(spr - 0.5), width: CW, height: r1(bot - spr + 0.5), class: 'ra-crim'})));
    cellG.append(s('rect', {x: r1(cols[0] - 1.5), y: r1(bot - 0.5), width: r1(cols[cols.length - 1] + CW - cols[0] + 3), height: 3.2, rx: 1.4, class: 'ra-crim'}));
    cols.forEach((cx, i) => cellG.append(flower(cx + CW / 2, spr - 3.4, 4, 'ra-pqf', (ri + i) % 3 + 1)));
  });
  art.append(cellG);

  // 꽃 모자이크 띠 — 맨 아래
  const mb = [s('rect', {x: 8, y: 597, width: 374, height: 18, rx: 6, class: 'ra-mband'}), s('path', {d: 'M12 597.6H378M12 614.4H378', class: 'ra-mline'})];
  for (let x = 17, i = 0; x <= 374; x += 11.2, i++) {
    if (i % 6 === 3) mb.push(flower(x, 606, 5.4, i % 12 === 3 ? 'ra-pet' : 'ra-pet2', i % 4));
    else mb.push(s('rect', {x: r1(x - 2.6), y: 603.4, width: 5.2, height: 5.2, rx: 1.4, class: TC[i % 3], transform: 'rotate(45 ' + r1(x) + ' 606)'}));
  }
  art.append(s('g', {'data-mucha': 'mosaic', class: 'ra-mosaic', 'aria-hidden': 'true'}, mb));
  art.append(s('rect', {x: 3.5, y: 3.5, width: 383, height: 613, rx: 22, class: 'ra-frame', 'aria-hidden': 'true'}));
  kids.push(art);

  // 그림에 녹인 글씨 — 아치 리본 제목 · 창 머리 이름 · 값 한 줄(양옆 꽃 · 굵기 변하는 금선) · 서랍 여섯 = 작은 아치 칸(누르면 그 서랍)
  const L = [...archRibbon(AC[0], AC[1], 160, -55, 55, 30, '100번에 몇 번 꽃이 됐나', 'ra-title')];
  const nm = [[WX[0] + WR, ['조건에 맞은', '회사']], [WX[1] + WR, ['아무 회사']]];
  nm.forEach(([cx, lines]) => lines.forEach((t, i) => L.push(T(cx, lines.length > 1 ? SPR - 7 + i * 21 : SPR + 4, t, 'ra-wn', {'text-anchor': 'middle'}))));
  const okA = fin(d.rate), okB = fin(d.base), sw = est('100번에 ' + (okA ? A + '번' : NEED) + ' · ' + (okB ? Bn + '번' : NEED), 22) / 2 + 12;
  L.push(s('g', {class: 'ra-waffle', 'aria-label': '100번에 몇 번 꽃이 됐나 · 조건에 맞은 회사 ' + (okA ? A + '번' : NEED) + ' · 아무 회사 ' + (okB ? Bn + '번' : NEED), 'data-rate': okA ? String(d.rate) : '', 'data-base': okB ? String(d.base) : ''},
    s('text', {x: 195, y: VL, class: 'ra-wv', 'text-anchor': 'middle'}, s('tspan', {text: '100번에 '}), s('tspan', {class: okA ? 'ra-vA' : 'ra-needt', text: okA ? A + '번' : NEED}),
      s('tspan', {class: 'ra-vdot', text: ' · '}), s('tspan', {class: okB ? 'ra-vB' : 'ra-needt', text: okB ? Bn + '번' : NEED}))));
  L.push(s('g', {'aria-hidden': 'true'}, taper([[195 - sw - 8, VL - 7], [26, VL - 7]], {w0: 2, w1: 0.2, cls: 'ra-rule'}), taper([[195 + sw + 8, VL - 7], [364, VL - 7]], {w0: 2, w1: 0.2, cls: 'ra-rule'}),
    flower(195 - sw, VL - 7, 4.6, 'ra-pet', 2), flower(195 + sw, VL - 7, 4.6, 'ra-pet', 3)));
  //   서랍 칸 글: 이름은 작게(18) · 값은 금빛 큰 숫자 하나(24) · 칸 폭에 안 들어가는 이름(옛 기록 더 보기)은 낱말 경계에서 두 줄
  const gv = id + '-gv';
  kids[0].append(s('linearGradient', {id: gv, x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'ra-gv0'}), s('stop', {offset: 0.55, class: 'ra-gv1'}), s('stop', {offset: 1, class: 'ra-gv2'})));
  cells.forEach(c => { const x = c.d, isNeed = x.v === NEED, mid = c.x + c.w / 2, tall = c.h > 70;
    let lines = [x.name];
    if (est(x.name, 18) * 0.93 > c.w - 16) { const sp = [...x.name].map((ch, i) => (ch === ' ' ? i : -1)).filter(i => i > 0);
      const at = sp.sort((p, q) => Math.abs(est(x.name.slice(0, p), 18) - est(x.name.slice(p + 1), 18)) - Math.abs(est(x.name.slice(0, q), 18) - est(x.name.slice(q + 1), 18)))[0];
      if (at) lines = [x.name.slice(0, at), x.name.slice(at + 1)]; }
    const two = lines.length > 1, ny = two ? [c.y + 28, c.y + 50] : [c.y + (tall ? 45 : 31)], vy = c.y + (tall ? 74 : 58);
    L.push(s('a', {href: x.href, class: 'ra-lab ra-d' + (c.n + 1), 'aria-label': x.name + ' ' + x.v, 'data-k': x.k, 'data-v': x.v, 'data-also': x.also ?? null},
      s('rect', {x: r1(c.x - CW / 2 + 0.5), y: c.y + 4, width: r1(c.w + CW - 1), height: c.h - 4, rx: 12, class: 'ra-hit'}),
      lines.map((t, i) => T(mid, ny[i], t, 'ra-ln', {'text-anchor': 'middle'})),
      T(mid, vy, x.v, 'ra-lv' + (two ? ' ra-lv2' : '') + (isNeed ? ' ra-needt' : ' ra-lvg'), {'text-anchor': 'middle', fill: isNeed ? null : 'url(#' + gv + ')'})));
  });
  kids.push(s('g', {'data-mucha': 'lettering', class: 'ra-letters'}, L));
  return svgRoot('hub', '기록 한곳 · 100번에 몇 번 꽃이 됐나 · 한 금테 창 둘 · 아래 아치 회랑 두 층 여섯 칸에 기록 서랍', ...kids);
}

/* ② 달마다 — 큰 아치(어깨에서 금선이 소용돌이로 풀림) · 휜 리본 제목 · 메달(적갈색 가는 머리 다발이 아치 테두리를 따라) · 해마다 아치 창 하나(금 띠 색유리 점 모자이크) · 꽃대 막대 · 아래 꽃 모자이크 띠 */
function months(d, id) {
  const rows = d.rows, M = Math.max(10, ...rows.flatMap(r => [r.v, r.v2]).filter(fin)); // cols 와 같은 끝 값
  const years = [...new Set(rows.map(r => String(r.key).slice(0, 4)))].sort(), nY = Math.max(1, years.length);
  const AC = [195, 195], AO = 189, AI = 177, MC = [195, 114], MR = 56;
  const L = 60, R = 358, cw = (R - L) / 12, bw = 12, WX0 = 22, WX1 = 368, RISE = 28, BAND = 6.5, TOP0 = 236, HEAD = 30, FOOT = 50, GAP = 38, LGY = 194;
  const hB = Math.max(30, Math.min(200, Math.floor((584 - TOP0 - (HEAD + FOOT) * nY - GAP * (nY - 1)) / nY))); // 단 높이 — 막대 높이 비는 그대로(높이 = hB × 값 ÷ 끝 값)
  const tops = years.map((_, i) => TOP0 + i * (HEAD + hB + FOOT + GAP)), y0s = tops.map(t => t + HEAD + hB);
  const clip = id + '-clip', TC = ['ra-t1', 'ra-t2', 'ra-t3'], SG = t => id + '-s' + t;
  // 둥근 줄기의 빛 — 가로로 짙음 → 밝음 → 짙음(원기둥처럼)
  const sgrad = t => s('linearGradient', {id: SG(t), x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'ra-s' + t + '0'}), s('stop', {offset: 0.38, class: 'ra-s' + t + '1'}), s('stop', {offset: 1, class: 'ra-s' + t + '0'}));
  const archPath = (r, bot) => 'M' + (195 - r) + ' ' + bot + 'L' + (195 - r) + ' ' + AC[1] + 'A' + r + ' ' + r + ' 0 0 1 ' + (195 + r) + ' ' + AC[1] + 'L' + (195 + r) + ' ' + bot + 'Z';
  const hw = (WX1 - WX0) / 2, wcx = (WX0 + WX1) / 2;
  /** 아치 창 하나의 길(여덟째 판) — 어깨 높이(top + RISE)는 그대로 · 윗변 아치를 10 높임(솟음 RISE2) · 아래 두 모서리를 크게 둥글림(RC) · k = 안으로 들인 만큼 */
  const RISE2 = RISE + 10, RC = 22;
  const winPts = (top, bot, k = 0) => { const spr = top + RISE, a = hw - k, b = RISE2 - k * 0.85, rc = Math.max(3, RC - k), p = [[WX0 + k, bot - k - rc]];
    for (let i = 0; i <= 64; i++) { const f = Math.PI * (1 - i / 64); p.push([wcx + a * Math.cos(f), spr - b * Math.sin(f)]); }
    for (let i = 0; i <= 10; i++) { const f = Math.PI / 2 * i / 10; p.push([WX1 - k - rc + rc * Math.cos(f), bot - k - rc + rc * Math.sin(f)]); }
    for (let i = 0; i <= 10; i++) { const f = Math.PI / 2 + Math.PI / 2 * i / 10; p.push([WX0 + k + rc + rc * Math.cos(f), bot - k - rc + rc * Math.sin(f)]); }
    return p; };
  const winD = (top, bot, k = 0) => 'M' + winPts(top, bot, k).map(pt).join('L') + 'Z';
  /** 금 띠 위 색유리 점 모자이크 — 띠 가운데 길(아치 · 두 옆 · 둥근 모서리 · 바닥)을 따라 8.6 단위마다 점 · 마름모 번갈아(세 빛 · 한 빛에 한 길) */
  const winDots = (top, bot) => { const k = BAND / 2, w0 = winPts(top, bot, k);
    const path = [...w0, w0[0]], dd = ['', '', ''], dm = ['', '', ''];
    let acc = 4.3, j = 0;
    for (let i = 1; i < path.length; i++) { const [x0, y0] = path[i - 1], [x1, y1] = path[i], seg = Math.hypot(x1 - x0, y1 - y0);
      for (let u = acc; u <= seg; u += 8.6, acc = u) { const x = x0 + (x1 - x0) * u / seg, y = y0 + (y1 - y0) * u / seg, c = (j >> 1) % 3;
        if (j % 2) dd[c] += 'M' + r1(x - 1.5) + ' ' + r1(y) + 'a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0Z'; else dm[c] += 'M' + r1(x) + ' ' + r1(y - 2.2) + 'l2.2 2.2 -2.2 2.2 -2.2 -2.2Z'; j++; }
      acc -= seg; if (acc < 0) acc = 0; }
    return [0, 1, 2].map(c => s('path', {d: dm[c] + dd[c], class: 'ra-wdot ra-g' + (c + 1)})); };
  const kids = [s('defs', {}, s('clipPath', {id: clip}, s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24})), sgrad('gold'), sgrad('red'), sgrad('sage'))];
  const art = s('g', {'clip-path': 'url(#' + clip + ')'});
  art.append(s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24, class: 'ra-bg'}));
  art.append(skies([30, 32, 13], [360, 32, 10.5, 4.4], [[72, 16, 5, 2.1], [320, 14, 5, 2.1]], [[100, 8], [290, 8], [52, 50], [340, 54]]));
  /** 둥근 줄기 — 밑동(y0)에서 len 만큼 곧게(값 그대로) · 위로 살짝 가늘어짐 · 원기둥 빛 · 바깥선 밑동 굵게 끝 가늘게 · 밑동에 잎 둘 */
  const stem = (cx, y0, len, tone) => { const b = 3.6, t = 2.7, rr = Math.min(t, len / 2), top = y0 - len, k = [];
    if (len > 0.5) k.push(s('path', {d: 'M' + r1(cx - b) + ' ' + r1(y0) + 'L' + r1(cx - t) + ' ' + r1(top + rr) + 'A' + r1(t) + ' ' + r1(rr) + ' 0 0 1 ' + r1(cx + t) + ' ' + r1(top + rr) + 'L' + r1(cx + b) + ' ' + r1(y0) + 'Z', fill: 'url(#' + SG(tone) + ')', class: 'ra-stem'}),
      taper([[cx - b, y0], [cx - t, top + rr]], {w0: 1.3, w1: 0.35, cls: 'ra-sl ra-sl-' + tone}), taper([[cx + b, y0], [cx + t, top + rr]], {w0: 0.9, w1: 0.25, cls: 'ra-sl ra-sl-' + tone}));
    k.push(s('path', {d: leafD(cx - 1.2, y0 - 0.6, -Math.PI * 0.8, 9.5, 2.6) + leafD(cx + 1.2, y0 - 0.6, -Math.PI * 0.2, 9.5, 2.6), class: 'ra-sleaf'}));
    return k; };

  // 아치 틀 — 띠 폭 12 · 안은 옅은 금빛 파스텔 한 면
  art.append(s('g', {'data-mucha': 'arch', class: 'ra-arch', 'aria-hidden': 'true'},
    s('path', {d: archPath(AO, 596) + archPath(AI, 596), class: 'ra-aband'}),
    s('path', {d: archPath(AI, 596), class: 'ra-field ra-ain'})));
  const tiles = [];
  for (let k = -86, i = 0; k <= 86; k += 6, i++) { const [x, y] = P(AC[0], AC[1], (AO + AI) / 2, k);
    tiles.push(i % 2 ? s('circle', {cx: r1(x), cy: r1(y), r: 2.1, class: TC[(i >> 1) % 3]}) : s('rect', {x: r1(x - 2.4), y: r1(y - 2.4), width: 4.8, height: 4.8, rx: 1.2, class: TC[(i >> 1) % 3], transform: 'rotate(' + r1(k + 45) + ' ' + r1(x) + ' ' + r1(y) + ')'})); }
  for (let y = 214, i = 0; y < 590; y += 14, i++) for (const x of [195 - (AO + AI) / 2, 195 + (AO + AI) / 2]) tiles.push(i % 2 ? s('circle', {cx: x, cy: y, r: 2.1, class: TC[i % 3]}) : s('rect', {x: x - 2.4, y: y - 2.4, width: 4.8, height: 4.8, rx: 1.2, class: TC[i % 3], transform: 'rotate(45 ' + x + ' ' + y + ')'}));
  art.append(s('g', {'data-mucha': 'mosaic', class: 'ra-mosaic', 'aria-hidden': 'true'}, tiles));
  art.append(s('g', {'data-mucha': 'outline', class: 'ra-outline', 'aria-hidden': 'true'},
    s('path', {d: arcInk(AC[0], AC[1], AO, -90, 90, 5), class: 'ra-ink'}),
    unwind([P(AC[0], AC[1], AO + 1, -62), [21.5, 99], [18, 88]], 5.6, 1), unwind([P(AC[0], AC[1], AO + 1, 63), [369.5, 101], [373, 91.5]], 4.8, -1),
    s('path', {d: 'M' + (195 - AO - 1.2) + ' ' + AC[1] + 'L' + (195 - AO - 1.2) + ' 596L' + (195 - AO) + ' 596L' + (195 - AO) + ' ' + AC[1] + 'Z', class: 'ra-ink'}),
    s('path', {d: 'M' + (195 + AO) + ' ' + AC[1] + 'L' + (195 + AO) + ' 596L' + (195 + AO + 1.2) + ' 596L' + (195 + AO + 1.2) + ' ' + AC[1] + 'Z', class: 'ra-ink'})));

  // 해마다 아치 창 하나 — 금 띠(바깥 · 안 가는 금선) 위 색유리 점 모자이크 · 안은 옅은 크림 한 면 · 안쪽 가는 금선 한 겹(09 창과 한 식구)
  const wins = s('g', {'data-mucha': 'panel', class: 'ra-wins', 'aria-hidden': 'true'});
  tops.forEach((t, i) => { const bot = y0s[i] + FOOT;
    wins.append(s('path', {d: winD(t, bot), class: 'ra-wband'}), s('path', {d: winD(t, bot, BAND), class: 'ra-wfield'}), ...winDots(t, bot),
      s('path', {d: winD(t, bot) + winD(t, bot, BAND), class: 'ra-wline'}), s('path', {d: winD(t, bot, BAND + 2.4), class: 'ra-wrim2'})); });
  art.append(wins);

  // 후광 — 메달 뒤 아주 옅은 빛살 · 가는 금 고리
  art.append(s('g', {'data-mucha': 'halo', class: 'ra-halo', 'aria-hidden': 'true'}, rays(MC[0], MC[1], MR, MR + 36, {n: 48}), s('circle', {cx: MC[0], cy: MC[1], r: MR + 6, class: 'ra-ring'})));
  // 머리 — 메달 뒤에서 솟아(제목 리본 뒤로 지나) 아치 테두리 안쪽을 따라 흘러내리고 끝이 말림 · 좌우 다르게(굵기 · 길이 · 말림 크기)
  //   메달 어깨에서 비스듬히 솟아 리본 뒤로 지나감(손잡이 · 뿔 꼴 아님) · 왼쪽은 범례 · 「2025년」 이름판 위에서 끝남 · 오른쪽은 조금 더 내려와 창 어깨 위에서 끝남
  //   여덟째 판: 뻣뻣한 두 줄기 → 한 뿌리에서 갈라지며 가늘어지는 가닥 다섯씩 · 왼쪽 끝 소용돌이 셋이 「2025년」 판 왼끝을 위 · 옆 · 아래로 감음 · 오른쪽은 창 오른 어깨 위에서 말림
  const AR = (r, a) => P(AC[0], AC[1], r, a), mir = q => q.map(([x, y]) => [390 - x, y]);
  const fan10 = (r0, e, sgn) => { const Q = (r, a) => AR(r, a); const b = [[176, 100 + r0 * 0.1], [154, 97], [136, 88], [124, 76], [110, 68]];
    return [
      [[...b, Q(163, -40), Q(164.5, -54), Q(165.5, -66), Q(166, -78), [27.4, 194], [24.6, 207], [26.4, e[0]]], {w: 5.6, r: 5.4, dir: -sgn, turns: 1.3}],
      [[...b, Q(160, -40), Q(161, -54), Q(161.5, -66), [42, 178], [37.4, 190], [40, e[1]]], {w: 4.4, r: 4.6, dir: sgn, turns: 1.3}],
      [[...b, Q(166, -40), Q(167.5, -54), Q(168.6, -66), Q(169.4, -78), [23, 196], [19.6, 214], [20.6, e[2]]], {w: 3.6, r: 4.8, dir: -sgn, turns: 1.35}],
      [[[174, 96], [152, 90], [134, 84], Q(158, -42), Q(158.6, -56), Q(158, e[3])], {w: 2.8, r: 3.8, dir: -sgn, turns: 1.45}],
      [[[174, 92], [150, 84], [132, 74], Q(170, -42), Q(171, e[4])], {w: 2.2, r: 3.4, dir: sgn, turns: 1.5}]]; };
  const HL = fan10(0, [221, 199, 236, -68, -55], 1), HR = fan10(2, [216, 196, 232, -70, -58], -1).map(([p, o]) => [mir(p), o]);
  art.append(locks(6, [...HL, ...HR]));
  art.append(medallion({cx: MC[0], cy: MC[1], r: MR, v: 6, dir: 1, ring: 'mosaic'}));
  // 이 쪽만의 손짓 — 메달 왼쪽 아래에서 올린 손(공용 부품 hold)이 초승달 아래 뿔을 쥠(「달과 별」 1902)
  art.append(s('g', {class: 'ra-moonhand', 'aria-hidden': 'true'}, s('path', {d: moon(160, 109, 9.4), class: 'rx-moon', 'data-mucha': 'stars'}),
    sleeve({x: 172, y: 160, ang: 162, len: 30, w: 10.5, hand: 'hold', dir: -1, tone: 'cream'})));

  // 두 창 사이 꽃덩굴 띠 — 해 이름판 오른쪽 말림에서 돋아 오른쪽 테까지(굵게 → 가늘게) · 꽃 셋
  const vy = tops.slice(1).map(t => t - GAP / 2 - 1);
  art.append(s('g', {'data-mucha': 'vine', class: 'ra-vband', 'aria-hidden': 'true'},
    vy.map((y, i) => [vine([[146, y + 1], [186, y - 5], [228, y + 4], [270, y - 4], [310, y + 4], [344, y - 3], [362, y]], {w0: 4, w1: 0.9, leaves: 9, buds: 3, seed: 11 + i}),
      flower(212, y - 1, 5.6, 'ra-pet', 1), flower(290, y + 1, 6.2, 'ra-pet2', 2), flower(348, y - 2, 5.2, 'ra-pet', 3)])));

  // 꽃 모자이크 띠 — 맨 아래
  const mb = [s('rect', {x: 8, y: 594, width: 374, height: 20, rx: 6, class: 'ra-mband'}), s('path', {d: 'M12 594.6H378M12 613.4H378', class: 'ra-mline'})];
  for (let x = 17, i = 0; x <= 374; x += 11.2, i++) {
    if (i % 6 === 3) mb.push(flower(x, 604, 5.6, i % 12 === 3 ? 'ra-pet' : 'ra-pet2', i % 4));
    else mb.push(s('rect', {x: r1(x - 2.7), y: 601.3, width: 5.4, height: 5.4, rx: 1.4, class: TC[i % 3], transform: 'rotate(45 ' + r1(x) + ' 604)'}));
  }
  art.append(s('g', {'data-mucha': 'mosaic', class: 'ra-mosaic', 'aria-hidden': 'true'}, mb));
  kids.push(art);

  // 막대 — cols 와 같은 값 · 같은 차례 · 같은 높이 비(줄기 길이 = hB × 값 ÷ 끝 값) · 둥근 줄기(꼭지에 꽃 · 봉오리 · 밑동에 잎 둘) · 꽃 된 달 = 핀 꽃 · 못한 달 = 닫힌 붉은 봉오리 · 세는 중 = 새싹 · 아무 회사 = 막대 옆 짧은 금선 + 점 · 움직이지 않음(값)
  const chart = s('g', {class: 'ra-cols', 'data-max': String(M), 'data-h': String(hB)});
  const plates = [];
  let order = 0;
  years.forEach((yv, i) => {
    const y0 = y0s[i], yy = v => y0 - hB * Math.min(1, v / M);
    for (const g of [0, 25, 50].filter(v => v <= M)) {
      chart.append(g ? beads(L - 1, r1(yy(g)), R + 1, r1(yy(g)), {gap: 8, r: 1.4}) : s('line', {x1: L - 2, y1: r1(y0), x2: R + 2, y2: r1(y0), class: 'ra-axis'}),
        T(WX0 + BAND + 8.5, yy(g) + 6, String(g), 'ra-gl'));
    }
    rows.forEach(r => {
      if (String(r.key).slice(0, 4) !== yv) return;
      const mo = +String(r.key).slice(5, 7), cx = L + cw * (mo - 1) + cw / 2, worse = fin(r.v) && fin(r.v2) && r.v < r.v2 && !r.open, k = order++;
      const len = fin(r.v) ? r1(hB * Math.min(1, Math.max(0, r.v) / M)) : null, tone = r.open ? 'sage' : worse ? 'red' : 'gold', tip = r.open ? 'bud' : worse ? 'closed' : 'flower';
      const g = s('g', {class: 'ra-mo' + (worse ? ' ra-sq' : ''), 'data-k': r.key, 'data-i': String(k), 'data-v': fin(r.v) ? String(r.v) : '', 'data-v2': fin(r.v2) ? String(r.v2) : '', 'data-len': len == null ? '' : String(len), 'data-tip': tip},
        len != null ? s('g', {class: 'ra-st', 'data-mucha': 'vine'}, stem(cx, y0, len, tone), stemBar({x: r1(cx), y: r1(y0 - len), len: 0, dir: 'up', w: bw, tip, tone, seed: k})) : null,
        fin(r.v2) ? baseMark(cx + cw / 2, yy(r.v2)) : null,
        s('circle', {cx: r1(cx), cy: r1(y0 + 27.6), r: 11.8, class: 'rx-mdl ' + (i % 2 ? 'ra-c2' : 'ra-c1')}), s('circle', {cx: r1(cx), cy: r1(y0 + 27.6), r: 9.9, class: 'rx-mdl2'}),
        T(cx, y0 + 34, String(mo), 'ra-mn', mo > 9 ? {'text-anchor': 'middle', textLength: 16.5, lengthAdjust: 'spacingAndGlyphs'} : {'text-anchor': 'middle'}));
      chart.append(g);
      if (r.open) chart.append(T(cx + 9, y0 - 5, '세는 중', 'ra-lg ra-opent')); // 세는 중 — 10월 새싹 바로 옆에 작게
    });
    // 해 이름판 — 창 왼쪽 어깨 위 · 양끝이 말린 둥근 판
    plates.push(namePlate(40, tops[i] - 18, yv + '년'));
  });
  kids.push(chart);

  // 범례 셋 — 첫 창 위 한 줄(가운데 맞춤 · 띠 없이 바탕에 새김)
  const items = [['flower', '꽃 된 달'], ['closed', '못한 달'], ['mark', '아무 회사']], iw = items.map(([kind, t]) => 13 + est(t, 18)), ig = 16;
  let lx = 195 - (iw.reduce((a, b) => a + b, 0) + ig * (items.length - 1)) / 2;
  const legend = [];
  items.forEach(([kind, t], j) => {
    const ix = lx + 5;
    legend.push(kind === 'mark' ? baseMark(ix, LGY - 6.5) : s('g', {},stem(ix, LGY + 2, 5, kind === 'flower' ? 'gold' : 'red').slice(0, 3), stemBar({x: ix, y: LGY - 3, len: 0, dir: 'up', w: 11, tip: kind, tone: kind === 'flower' ? 'gold' : 'red', seed: 2})),
      T(lx + iw[j] - est(t, 18), LGY, t, 'ra-lg ra-legt'));
    lx += iw[j] + ig;
  });

  // 그림에 녹인 글씨 — 아치 리본 제목 · 범례 한 줄 · 해 이름판
  kids.push(s('g', {'data-mucha': 'lettering', class: 'ra-letters'}, archRibbon(AC[0], AC[1], 160, -50, 50, 30, '달마다 꽃이 된 횟수', 'ra-title'), s('g', {class: 'ra-legend'}, legend), s('g', {class: 'ra-years'}, plates)));
  return svgRoot('months', '달마다 꽃이 된 횟수 · 해마다 아치 창 하나 · 꽃 된 달은 핀 꽃 · 못한 달은 닫힌 붉은 봉오리 · 아무 회사는 막대 옆 짧은 금선과 점', ...kids);
}
/** 아무 회사 — 값 높이의 작은 금구슬 하나((x, y) = 구슬 가운데 · 꽃대에서 반 칸) · 왼쪽 위 작은 빛 */
const baseMark = (x, y) => s('g', {class: 'ra-bl'},
  s('circle', {cx: r1(x), cy: r1(y), r: 2.9, class: 'ra-bld'}), s('circle', {cx: r1(x - 0.9), cy: r1(y - 0.9), r: 0.85, class: 'ra-bls'}));
/** 해 이름판 — 둥근 판(가는 금 두 겹 테) · 양끝에서 금선이 위아래로 말려 나옴 · 글씨는 판 가운데(테에서 8 넘게) */
function namePlate(x, cy, text) {
  const tw = est(text, 20), w = tw + 30, h = 26, y = cy - h / 2, xr = x + w;
  const curls = [[[[x + 3, cy - 1], [x - 4, cy - 3], [x - 8, cy - 8]], 4.2, 1], [[[x + 3, cy + 1.5], [x - 3, cy + 4], [x - 6, cy + 8]], 3.2, -1],
    [[[xr - 3, cy - 1], [xr + 4, cy - 3], [xr + 8, cy - 8]], 4.2, -1], [[[xr - 3, cy + 1.5], [xr + 3, cy + 4], [xr + 6, cy + 8]], 3.2, 1]];
  return s('g', {class: 'ra-plate', 'data-mucha': 'scroll'},
    curls.map(([p, r, dir]) => taper(curlEnd(smooth(p, 6), r, dir, 1.25), {w0: 2.2, w1: 0.35, cls: 'ra-pcurl'})),
    s('rect', {x: r1(x), y: r1(y), width: r1(w), height: h, rx: h / 2, class: 'ra-pbody'}),
    s('rect', {x: r1(x + 3), y: r1(y + 3), width: r1(w - 6), height: h - 6, rx: (h - 6) / 2, class: 'ra-pin'}),
    T(x + w / 2, cy + 7, text, 'ra-yr', {'text-anchor': 'middle'}));
}
