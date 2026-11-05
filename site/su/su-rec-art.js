/* 수르 — 기록 탭의 큰 그림 둘(su-rec-art · 다섯째 판 r5-brief.md 「R」 · 심사 4회 judge-r4.md 를 고침 · 알폰스 무하 화풍)
   ① 기록 한곳(#/r) — 큰 아치 · 아치를 따라 휜 리본 제목(흰 테 없음) · 공용 메달(v=5 · 꽃잎 고리 · 머리 큰 덩어리 셋이 두 창 꼭대기 꽃까지)
      창 둘 = 아치 머리(색유리 꽃잎 띠 · 이름)와 100칸 판이 한 금테 · 빈 칸 = 크림 · 연분홍 · 연두 빛이 조금씩 다른 둥근 모자이크 조각 · 칸 사이 금빛 납선 · 찬 칸 = 보석 윤(호박빛 금 · 초록)
      100칸 = su-fig.js waffle 과 같은 값 · 같은 칸 수 · 위 줄부터 채움 · 가운데 금 기둥에 덩굴 한 줄
      아래 = 「100번에 33번 · 24번」 한 줄(양옆 꽃 · 굵기 변하는 금선) + 서랍 여섯 = 위 창과 같은 작은 아치 칸(두 줄 세 칸 · 칸 사이 덩굴 · 어두운 판은 짙은 갈색 바탕에 금빛 글씨)
      서랍 차례(토론으로 정함 · 그대로): 달마다 → 한 달 뒤 → 내 매매일지 → 못 된 까닭 → 날마다 → 옛 기록 더 보기(누르면 #/r/y)
      서랍 값은 su.js vHub 서랍과 같은 셈(su-six.js eMonths · eDays · eYears) · 한 달 뒤 = 매매일지의 「한 달 뒤 물은 기록」 수(su-why.js)
   ② 달마다(#/r/m) — 막대 = 둥근 줄기(값 길이 그대로 · 꼭지에 꽃 · 봉오리 · 밑동에 잎 둘) · 꽃 된 달 = 핀 꽃 · 못한 달 = 닫힌 붉은 봉오리(여덟이면 여덟) · 세는 중 = 새싹
      su-fig.js cols 와 같은 값 · 같은 차례 · 같은 높이 비 · 두 그래프 뒤에 가는 금테 아치 창 둘(「두 개의 창」)
      눈금 = 금 구슬 줄(beads) · 숫자 금갈색 · 아무 회사 = 막대 옆 금테 작은 잎 · 「2025년」 · 「2026년」 은 해마다 따로 작은 리본 · 범례 셋은 아치 머리 아래 한 줄 · 두 창 사이 꽃덩굴 · 맨 아래 꽃 모자이크 띠
      메달(v=6) 머리 = 밤색 · 금빛 굵은 다발이 어깨 위로 돌아 양옆 틀을 따라 흘러내리고 끝이 말림(왼쪽은 「2025년」 리본에 감김) · 두 자리 달(10 · 11 · 12)은 글자 폭만 좁혀 띄움(글씨 18px 그대로)
   부품 꼴(docs/design/su-musk-2026-11-05/pic-brief.md): load(get, 'hub'|'months') · picture(d) · CSS
   보안: 글 꽂아 넣기 · 글 속 꾸밈 없음 — createElementNS · setAttribute(su-fig.js s · 공용 부품 svg)만
   색: su-rec-art.css 클래스 · 살 · 머리 · 옷 · 두루마리는 공용 부품 고정 색(어두운 판에서도 같음) · 메달 몸 · 눈 · 머리는 공용 부품 그대로(덧그리지 않음)
   움직임: 꽃 · 별 · 머리카락에만(transform) · 들어옴은 0.6초 안에 끝 · 글씨는 처음부터 진하게 */
import {s} from '/su/su-fig.js';
import {NEED, num, eMonths, eDays, eYears} from '/su/su-six.js';
import {svg, taper, strands, medallion, stemBar, vine, beads, rays, ribbon} from './su-mucha-kit.js';

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
/** 머리 다발 — 메달 뒤에서 나와 S 로 흘러내림(공용 strands) · 큰 덩어리 셋(뒤 그늘 둘 + 앞 셋 · 안쪽 결은 부품이 몇 줄만) · 끝은 소용돌이 · tone = 메달 머리 색 */
const hairFlow = (pts, tone, seed, flip, sp = 10, w = 6) => svg('g', {class: 'mk-hair mk-t' + tone, 'data-mucha': 'whiplash', 'aria-hidden': 'true'},
  svg('g', {class: 'mk-sway' + (flip ? '2' : '')}, strands(pts, {n: 2, spread: sp * 0.7, w0: w * 0.75, w1: 0.5, curl: 1, seed: seed + 1, cls: 'mk-hd'}),
    strands(pts, {n: 3, spread: sp, w0: w, w1: 0.45, curl: 1, seed, cls: 'mk-hb'})));
/** 잎 한 장 — (x, y) 밑동 · ang 방향(라디안) · 길이 len · 반폭 wd */
const leafD = (x, y, ang, len, wd) => { const c = Math.cos(ang), n = Math.sin(ang), Q = (u, v) => r1(x + c * u - n * v) + ' ' + r1(y + n * u + c * v);
  return 'M' + Q(0, 0) + 'C' + Q(len * 0.3, -wd * 1.3) + ' ' + Q(len * 0.75, -wd * 1.1) + ' ' + Q(len, 0) + 'C' + Q(len * 0.75, wd * 1.1) + ' ' + Q(len * 0.3, wd * 1.3) + ' ' + Q(0, 0) + 'Z'; };
/** 작은 아치 칸 — 위 창과 같은 꼴(위가 둥근 아치 · rise 만큼 솟음) · i = 안쪽으로 들인 만큼 */
const cellD = (x, y, w, h, rise, i = 0) => 'M' + r1(x + i) + ' ' + r1(y + h - i) + 'V' + r1(y + rise + i * 0.6) + 'A' + r1(w / 2 - i) + ' ' + r1(Math.max(1, rise - i * 0.4)) + ' 0 0 1 ' + r1(x + w - i) + ' ' + r1(y + rise + i * 0.6) + 'V' + r1(y + h - i) + 'Z';

/* ① 기록 한곳 — 아치 · 휜 리본 제목 · 메달(머리가 두 창 꼭대기 꽃까지) · 한 금테 창 둘(빈 칸 크림 모자이크 · 찬 칸 둥근 유리) · 아래 아치 판 하나(값 한 줄 + 서랍 여섯 꽃 명판) · 덩굴 · 꽃 모자이크 띠 */
function hub(d, id) {
  const AC = [195, 206], AO = 190, AI = 178, MC = [195, 128], MR = 60;
  const WW = 142, WR = 71, RIM = 5, LEAD = 2.1, PAD = 2.2, PH = 13, ST = 21, SPR = 226, WX = [30, 218];
  const PW = (WW - 2 * RIM - 2 * PAD - 9 * LEAD) / 10, GT = SPR + ST + 3.2, GB = GT + 10 * PH + 9 * LEAD, WB = r1(GB + PAD + RIM);
  const VL = 433, RY = [445, 521], RH = 70, RISE = 12, IX = [17, 373], VG = 16;
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
  art.append(skies([34, 42, 15], [352, 38, 12, 5], [[78, 22, 6, 2.5], [17, 96, 5.5, 2.3], [312, 18, 6, 2.5], [373, 98, 5.5, 2.3]], [[108, 10], [56, 66], [334, 66], [282, 9], [16, 22], [374, 16]]));

  // 후광 — 메달 뒤 아주 옅은 빛살 · 가는 금 고리
  art.append(s('g', {'data-mucha': 'halo', class: 'ra-halo', 'aria-hidden': 'true'}, rays(MC[0], MC[1], MR, MR + 40, {n: 48}), s('circle', {cx: MC[0], cy: MC[1], r: MR + 6, class: 'ra-ring'})));

  // 아치 띠(살구 바탕에 금 · 잎 · 살구 조각)
  const band = [s('path', {d: sector(AC[0], AC[1], AI, AO, -90, 90), class: 'ra-aband'})];
  for (let k = -86, i = 0; k <= 86; k += 4.3, i++) { const [x, y] = P(AC[0], AC[1], (AO + AI) / 2, k);
    band.push(i % 2 ? s('circle', {cx: r1(x), cy: r1(y), r: 2.1, class: TC[(i >> 1) % 3]}) : s('rect', {x: r1(x - 2.4), y: r1(y - 2.4), width: 4.8, height: 4.8, rx: 1.2, class: TC[(i >> 1) % 3], transform: 'rotate(' + r1(k + 45) + ' ' + r1(x) + ' ' + r1(y) + ')'})); }
  art.append(s('g', {'data-mucha': 'arch', class: 'ra-arch', 'aria-hidden': 'true'}, band));

  // 굵기가 변하는 윤곽 — 아치 바깥 금선(꼭대기 굵고 발치로 가늘게) · 창 그림자
  art.append(s('g', {'data-mucha': 'outline', class: 'ra-outline', 'aria-hidden': 'true'},
    s('path', {d: arcInk(AC[0], AC[1], AO, -89, 89, 5), class: 'ra-ink'}),
    WX.map(x => s('path', {d: winD(x + 1.8, SPR + 2.4, WB + 2.4, WR), class: 'ra-cont'}))));

  // 덩굴 — 맨 아래 칸 발치(굵게)에서 옆선을 따라 제목 리본 끝(가늘게)까지 끊기지 않고 오름
  const side = flip => { const X = x => (flip ? 390 - x : x);
    return vine([[10, 592], [7, 548], [11, 504], [7, 462], [12, 420], [9, 380], [14, 340], [10, 300], [16, 266], [12, 232], [20, 198], [32, 168], [46, 144], [60, 126]].map(([x, y]) => [X(x), y]), {w0: 5.5, w1: 1, leaves: 13, buds: 3, seed: flip ? 23 : 7}); };
  art.append(s('g', {class: 'ra-vines', 'aria-hidden': 'true'}, side(false), side(true)));

  // 메달 머리 — 메달 뒤에서 나와 S 로 흘러 두 아치 창 꼭대기 꽃까지(꽃이 다발 끝을 덮음)
  const flowL = [[162, 112], [138, 118], [121, 127], [113, 139], [104, 146], [101, 153]];
  art.append(hairFlow(flowL, 5, 51, false), hairFlow(flowL.map(([x, y]) => [390 - x, y]), 5, 57, true));

  // 창 둘 — 한 금테 안에 아치 머리(상아 유리 · 둘레 꽃잎 색유리 · 이름)와 100칸 판
  //   빈 칸 = 크림 · 연분홍 · 연두 빛이 조금씩 다른 둥근 모자이크 조각(여섯 결) · 칸 사이 = 금빛 납선 · 찬 칸 = 보석 윤(둥근 빛 + 왼쪽 위 반짝임) · 위 줄 왼쪽부터 채움(su-fig.js waffle 과 같은 차례)
  const A = fin(d.rate) ? Math.round(d.rate) : 0, Bn = fin(d.base) ? Math.round(d.base) : 0;
  const GC = ['ra-g1', 'ra-g2', 'ra-g3'];
  const window_ = (x, who, n, cls, gid, late) => {
    const wc = x + WR, x0 = x + RIM + PAD, rl = WR - RIM - 2.2, g = s('g', {class: 'ra-win'});
    g.append(s('path', {d: winD(x, SPR, WB, WR), class: 'ra-rim'}), s('path', {d: winD(x + RIM, SPR, WB - RIM, WR - RIM), class: 'ra-came'}));
    g.append(s('path', {d: 'M' + r1(wc - rl) + ' ' + r1(SPR + ST) + 'V' + SPR + 'A' + r1(rl) + ' ' + r1(rl) + ' 0 0 1 ' + r1(wc + rl) + ' ' + SPR + 'V' + r1(SPR + ST) + 'Z', class: 'ra-lun'}));
    for (let i = 0; i < 9; i++) { const a = -90 + i * 20; g.append(s('path', {d: sector(wc, SPR, rl - 9, rl, a + 0.9, a + 19.1), class: 'ra-glass ' + GC[i % 3]})); }
    const glints = [];
    g.append(s('g', {class: 'ra-grid', 'data-who': who, 'data-n': String(n)}, Array.from({length: 100}, (_, k) => {
      const on = k < n, tone = (k * 7 + Math.floor(k / 10) * 5 + (k % 3)) % 6, cx = x0 + (k % 10) * (PW + LEAD), cy = GT + Math.floor(k / 10) * (PH + LEAD);
      if (on) glints.push(s('ellipse', {cx: r1(cx + PW * 0.33), cy: r1(cy + PH * 0.27), rx: r1(PW * 0.2), ry: r1(PH * 0.11), class: 'ra-glint'}));
      return s('rect', {x: r1(cx), y: r1(cy), width: r1(PW), height: PH, rx: on ? 4 : 3, fill: on ? 'url(#' + gid + ')' : null, class: on ? cls + ' ra-on' : 'ra-empty ra-e' + tone, 'data-cell': ''});
    })), s('g', {class: 'ra-glints', 'aria-hidden': 'true'}, glints));
    g.append(s('path', {d: winD(x + 2.2, SPR, WB - 2.2, WR - 2.2), class: 'ra-rim2'}));
    g.append(flower(wc, SPR - WR - 1, 7.5, 'ra-pet', late));
    return g;
  };
  const gems = []; for (let y = 236; y < WB - 10; y += 40) gems.push(s('path', {d: 'M195 ' + y + 'l5 7 -5 7 -5 -7Z', class: 'ra-gem'}));
  // 가운데 금 기둥에 감겨 오르는 덩굴 한 줄(발치 굵게 → 위 가늘게)
  const pv = []; for (let y = WB - 2, i = 0; y > 214; y -= 19, i++) pv.push([195 + (i % 2 ? 5.5 : -5.5) * (i ? 1 : 0), y]); pv.push([195, 212]);
  art.append(s('g', {'data-mucha': 'panel', class: 'ra-panel'},
    s('rect', {x: 191, y: 196, width: 8, height: r1(WB - 196), rx: 4, class: 'ra-pillar'}), gems,
    vine(pv, {w0: 2.8, w1: 0.7, leaves: 9, buds: 2, seed: 31}),
    s('path', {d: star(195, 200, 9, 3.6), class: 'ra-star ra-tw1'}),
    window_(WX[0], 'pick', A, 'ra-ok', ga, 1), window_(WX[1], 'any', Bn, 'ra-basefill', gb, 2)));

  // 메달(공용 v=5 · 반측면 · 꽃잎 고리)
  art.append(medallion({cx: MC[0], cy: MC[1], r: MR, v: 5, dir: 1, ring: 'petal'}));

  // 아래 숫자 판 — 위 창과 같은 작은 아치 칸 여섯(두 줄 세 칸 · 가는 금 두 겹 테 · 꼭대기 꽃) · 칸 사이는 덩굴 · 어두운 판은 짙은 갈색 바탕
  const dr = (d.drawers ?? []).slice(0, 6), rowsD = [dr.slice(0, 3), dr.slice(3, 6)], cells = [];
  rowsD.forEach((row, ri) => {
    if (!row.length) return;
    const ws0 = row.map(x => Math.max(64, estK(x.name, 18), estK(x.v, 20)) + 22), extra = Math.max(0, (IX[1] - IX[0] - ws0.reduce((a, b) => a + b, 0) - VG * (row.length - 1)) / row.length);
    let cx = IX[0];
    row.forEach((x, i) => { const w = ws0[i] + extra; cells.push({x: cx, y: RY[ri], w, d: x, n: ri * 3 + i}); cx += w + VG; });
  });
  const cellG = s('g', {'data-mucha': 'arch', class: 'ra-cells', 'aria-hidden': 'true'});
  cells.forEach((c, j) => { const nx = cells[j + 1];
    if (nx && nx.y === c.y) { const gx = (c.x + c.w + nx.x) / 2; cellG.append(vine([[gx, c.y + RH - 1], [gx - 3, c.y + RH * 0.68], [gx + 3, c.y + RH * 0.36], [gx, c.y + 9]], {w0: 3, w1: 0.8, leaves: 4, buds: 1, seed: 40 + j})); }
  });
  cells.forEach(c => cellG.append(s('path', {d: cellD(c.x, c.y, c.w, RH, RISE), class: 'ra-crim'}), s('path', {d: cellD(c.x, c.y, c.w, RH, RISE, 2), class: 'ra-cbg'}),
    s('path', {d: cellD(c.x, c.y, c.w, RH, RISE, 4.2), class: 'ra-cin'}), flower(c.x + c.w / 2, c.y + 1, 4.4, 'ra-pqf', (c.n % 3) + 1)));
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
  cells.forEach(c => { const x = c.d, isNeed = x.v === NEED, mid = c.x + c.w / 2;
    L.push(s('a', {href: x.href, class: 'ra-lab ra-d' + (c.n + 1), 'aria-label': x.name + ' ' + x.v, 'data-k': x.k, 'data-v': x.v, 'data-also': x.also ?? null},
      s('rect', {x: r1(c.x - VG / 2 + 0.5), y: c.y + 4, width: r1(c.w + VG - 1), height: RH - 4, rx: 12, class: 'ra-hit'}),
      T(mid, c.y + 37, x.name, 'ra-ln', {'text-anchor': 'middle'}),
      T(mid, c.y + 61, x.v, 'ra-lv' + (isNeed ? ' ra-needt' : ''), {'text-anchor': 'middle'})));
  });
  kids.push(s('g', {'data-mucha': 'lettering', class: 'ra-letters'}, L));
  return svgRoot('hub', '기록 한곳 · 100번에 몇 번 꽃이 됐나 · 한 금테 창 둘 · 아래 작은 아치 칸 여섯에 기록 서랍', ...kids);
}

/* ② 달마다 — 큰 아치 · 휜 리본 제목 · 메달(밤색 · 금빛 머리 다발이 「2025년」 리본으로) · 두 개의 창(해마다 한 창 · 가는 금테 아치) · 꽃대 막대 · 아래 꽃 모자이크 띠 */
function months(d, id) {
  const rows = d.rows, M = Math.max(10, ...rows.flatMap(r => [r.v, r.v2]).filter(fin)); // cols 와 같은 끝 값
  const years = [...new Set(rows.map(r => String(r.key).slice(0, 4)))].sort(), nY = Math.max(1, years.length);
  const AC = [195, 195], AO = 189, AI = 177, MC = [195, 116], MR = 58;
  const L = 56, R = 356, cw = (R - L) / 12, bw = 12, WX0 = 22, WX1 = 368, RISE = 18, TOP0 = 240, GAP = 44, LGY = 201;
  const hB = Math.max(30, Math.min(200, Math.floor((584 - TOP0 - 64 * nY - (nY - 1) * GAP) / nY))); // 단 높이 — 막대 높이 비는 그대로(높이 = hB × 값 ÷ 끝 값)
  const tops = years.map((_, i) => TOP0 + i * (64 + hB + GAP)), y0s = tops.map(t => t + 20 + hB);
  const clip = id + '-clip', TC = ['ra-t1', 'ra-t2', 'ra-t3'], SG = t => id + '-s' + t;
  // 둥근 줄기의 빛 — 가로로 짙음 → 밝음 → 짙음(원기둥처럼)
  const sgrad = t => s('linearGradient', {id: SG(t), x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'ra-s' + t + '0'}), s('stop', {offset: 0.38, class: 'ra-s' + t + '1'}), s('stop', {offset: 1, class: 'ra-s' + t + '0'}));
  const archPath = (r, bot) => 'M' + (195 - r) + ' ' + bot + 'L' + (195 - r) + ' ' + AC[1] + 'A' + r + ' ' + r + ' 0 0 1 ' + (195 + r) + ' ' + AC[1] + 'L' + (195 + r) + ' ' + bot + 'Z';
  const hw = (WX1 - WX0) / 2, WRr = (hw * hw + RISE * RISE) / (2 * RISE), wcx = (WX0 + WX1) / 2;
  const archY = (x, top) => top + WRr - Math.sqrt(WRr * WRr - (x - wcx) ** 2);
  const winD = (top, bot, k = 0) => { const x0 = WX0 + k, x1 = WX1 - k, rr = WRr - k; return 'M' + r1(x0) + ' ' + r1(bot - k) + 'V' + r1(archY(x0, top) + k) + 'A' + r1(rr) + ' ' + r1(rr) + ' 0 0 1 ' + r1(x1) + ' ' + r1(archY(x1, top) + k) + 'V' + r1(bot - k) + 'Z'; };
  const winInk = (top, bot) => [-1, 1].map(sg => { const pts = []; for (let i = 0; i <= 12; i++) { const x = wcx + sg * hw * i / 12; pts.push([x, archY(x, top)]); } pts.push([wcx + sg * hw, (archY(WX0, top) + bot) / 2], [wcx + sg * hw, bot]); return taper(pts, {w0: 2.6, w1: 0.5, cls: 'ra-wink'}); });
  const kids = [s('defs', {}, s('clipPath', {id: clip}, s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24})), sgrad('gold'), sgrad('red'), sgrad('sage'))];
  const art = s('g', {'clip-path': 'url(#' + clip + ')'});
  art.append(s('rect', {x: 2, y: 2, width: 386, height: 616, rx: 24, class: 'ra-bg'}));
  art.append(skies([30, 32, 13], [360, 32, 10.5, 4.4], [[72, 16, 5, 2.1], [320, 14, 5, 2.1]], [[100, 8], [14, 76], [376, 78], [290, 8], [52, 50], [340, 54]]));
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
    s('path', {d: 'M' + (195 - AO - 1.2) + ' ' + AC[1] + 'L' + (195 - AO - 1.2) + ' 596L' + (195 - AO) + ' 596L' + (195 - AO) + ' ' + AC[1] + 'Z', class: 'ra-ink'}),
    s('path', {d: 'M' + (195 + AO) + ' ' + AC[1] + 'L' + (195 + AO) + ' 596L' + (195 + AO + 1.2) + ' 596L' + (195 + AO + 1.2) + ' ' + AC[1] + 'Z', class: 'ra-ink'})));

  // 두 개의 창 — 해마다 한 창(가는 금테 아치 · 굵기 변하는 윤곽 · 꼭대기 꽃)
  const wins = s('g', {'data-mucha': 'panel', class: 'ra-wins', 'aria-hidden': 'true'});
  tops.forEach((t, i) => { const bot = y0s[i] + 44;
    wins.append(s('path', {d: winD(t, bot), class: 'ra-wfield'}), ...winInk(t, bot), s('path', {d: winD(t, bot, 3.5), class: 'ra-wrim2'}), flower(wcx, t + 1, 6, 'ra-pet', i + 1)); });
  art.append(wins);

  // 후광 — 메달 뒤 아주 옅은 빛살 · 가는 금 고리
  art.append(s('g', {'data-mucha': 'halo', class: 'ra-halo', 'aria-hidden': 'true'}, rays(MC[0], MC[1], MR, MR + 38, {n: 48}), s('circle', {cx: MC[0], cy: MC[1], r: MR + 6, class: 'ra-ring'})));
  // 머리 다발 — 밤색 · 금빛 굵은 다발이 메달 뒤에서 나와 어깨 위로 둥글게 돌아 양옆 틀을 따라 아래로 흐르고 끝이 말림(왼쪽은 「2025년」 리본 뒤로 지나 감김)
  //   긴 다발 = 물결치며 틀까지 가서 아래로(끝 말림) · 짧은 다발 = 어깨 곁에서 갈라져 말림(갈라지는 다발이라 띠 · 콧수염으로 읽히지 않음)
  const HL = [[168, 146], [148, 154], [126, 150], [104, 139], [82, 141], [62, 153], [45, 171], [32, 192], [26, 214], [28, 234], [38, 248]];
  const HS = [[170, 152], [152, 166], [132, 171], [116, 168], [106, 175]];
  const mir = q => q.map(([x, y]) => [390 - x, y]);
  art.append(hairFlow(HL, 6, 41, false, 6.5, 4.2), hairFlow(HS, 6, 43, false, 5, 3.6), hairFlow(mir(HL), 6, 61, true, 6.5, 4.2), hairFlow(mir(HS), 6, 63, true, 5, 3.6));
  art.append(medallion({cx: MC[0], cy: MC[1], r: MR, v: 6, dir: 1, ring: 'mosaic'}));

  // 두 창 사이 꽃덩굴 띠 — 해 리본에서 돋아 오른쪽 테까지(굵게 → 가늘게) · 꽃 셋
  const vy = tops.slice(1).map(t => t - GAP / 2 + 4);
  art.append(s('g', {'data-mucha': 'vine', class: 'ra-vband', 'aria-hidden': 'true'},
    vy.map((y, i) => [vine([[150, y + 1], [190, y - 5], [230, y + 4], [270, y - 4], [310, y + 4], [346, y - 3], [366, y]], {w0: 4.4, w1: 0.9, leaves: 9, buds: 3, seed: 11 + i}),
      flower(214, y - 1, 5.6, 'ra-pet', 1), flower(290, y + 1, 6.2, 'ra-pet2', 2), flower(352, y - 2, 5.2, 'ra-pet', 3)])));

  // 꽃 모자이크 띠 — 맨 아래
  const mb = [s('rect', {x: 8, y: 594, width: 374, height: 20, rx: 6, class: 'ra-mband'}), s('path', {d: 'M12 594.6H378M12 613.4H378', class: 'ra-mline'})];
  for (let x = 17, i = 0; x <= 374; x += 11.2, i++) {
    if (i % 6 === 3) mb.push(flower(x, 604, 5.6, i % 12 === 3 ? 'ra-pet' : 'ra-pet2', i % 4));
    else mb.push(s('rect', {x: r1(x - 2.7), y: 601.3, width: 5.4, height: 5.4, rx: 1.4, class: TC[i % 3], transform: 'rotate(45 ' + r1(x) + ' 604)'}));
  }
  art.append(s('g', {'data-mucha': 'mosaic', class: 'ra-mosaic', 'aria-hidden': 'true'}, mb));
  kids.push(art);

  // 막대 — cols 와 같은 값 · 같은 차례 · 같은 높이 비(줄기 길이 = hB × 값 ÷ 끝 값) · 둥근 줄기(꼭지에 꽃 · 봉오리 · 밑동에 잎 둘) · 꽃 된 달 = 핀 꽃 · 못한 달 = 닫힌 붉은 봉오리 · 세는 중 = 새싹 · 아무 회사 = 막대 옆 금테 작은 잎 · 움직이지 않음(값)
  const chart = s('g', {class: 'ra-cols', 'data-max': String(M), 'data-h': String(hB)});
  const ribbons = [];
  let order = 0;
  years.forEach((yv, i) => {
    const y0 = y0s[i], yy = v => y0 - hB * Math.min(1, v / M);
    chart.append(s('rect', {x: L - 8, y: r1(y0 + 18), width: R - L + 14, height: 21, rx: 10.5, class: 'ra-strip ' + (i % 2 ? 'ra-c2' : 'ra-c1')}));
    for (const g of [0, 25, 50].filter(v => v <= M)) {
      chart.append(g ? beads(L - 2, r1(yy(g)), R + 6, r1(yy(g)), {gap: 8, r: 1.5}) : s('line', {x1: L - 4, y1: r1(y0), x2: R + 8, y2: r1(y0), class: 'ra-axis'}),
        T(L - 9, yy(g) + 6, String(g), 'ra-gl', {'text-anchor': 'end'}));
    }
    rows.forEach(r => {
      if (String(r.key).slice(0, 4) !== yv) return;
      const mo = +String(r.key).slice(5, 7), cx = L + cw * (mo - 1) + cw / 2, worse = fin(r.v) && fin(r.v2) && r.v < r.v2 && !r.open, k = order++;
      const len = fin(r.v) ? r1(hB * Math.min(1, Math.max(0, r.v) / M)) : null, tone = r.open ? 'sage' : worse ? 'red' : 'gold', tip = r.open ? 'bud' : worse ? 'closed' : 'flower';
      const g = s('g', {class: 'ra-mo' + (worse ? ' ra-sq' : ''), 'data-k': r.key, 'data-i': String(k), 'data-v': fin(r.v) ? String(r.v) : '', 'data-v2': fin(r.v2) ? String(r.v2) : '', 'data-len': len == null ? '' : String(len), 'data-tip': tip},
        len != null ? s('g', {class: 'ra-st', 'data-mucha': 'vine'}, stem(cx, y0, len, tone), stemBar({x: r1(cx), y: r1(y0 - len), len: 0, dir: 'up', w: bw, tip, tone, seed: k})) : null,
        fin(r.v2) ? baseLeaf(cx + 4.4, yy(r.v2)) : null,
        T(cx, y0 + 34, String(mo), 'ra-mn', mo > 9 ? {'text-anchor': 'middle', textLength: 16.5, lengthAdjust: 'spacingAndGlyphs'} : {'text-anchor': 'middle'}));
      chart.append(g);
      if (r.open) chart.append(T(cx + 9, y0 - 5, '세는 중', 'ra-lg ra-opent')); // 세는 중 — 10월 새싹 바로 옆에 작게
    });
    // 해 리본 — 해마다 따로 작은 리본(창 왼쪽 위)
    const ry = tops[i] - 18;
    ribbons.push(ribbon([[14, ry + 3], [60, ry - 2], [110, ry + 1], [156, ry - 1]], {w: 28, tone: 'cream'}), T(85, ry + 7.5, yv + '년', 'ra-yr', {'text-anchor': 'middle'}));
  });
  kids.push(chart);

  // 범례 셋 — 아치 머리 아래 한 줄(가운데 맞춤 · 띠 없이 바탕에 새김)
  const items = [['flower', '꽃 된 달'], ['closed', '못한 달'], ['leaf', '아무 회사']], iw = items.map(([kind, t]) => (kind === 'leaf' ? 16 : 13) + est(t, 18)), ig = 16;
  let lx = 195 - (iw.reduce((a, b) => a + b, 0) + ig * (items.length - 1)) / 2;
  const legend = [];
  items.forEach(([kind, t], j) => {
    const ix = lx + 5;
    legend.push(kind === 'leaf' ? baseLeaf(ix - 4, LGY - 6.5) : s('g', {}, stem(ix, LGY + 2, 5, kind === 'flower' ? 'gold' : 'red').slice(0, 3), stemBar({x: ix, y: LGY - 3, len: 0, dir: 'up', w: 11, tip: kind, tone: kind === 'flower' ? 'gold' : 'red', seed: 2})),
      T(lx + iw[j] - est(t, 18), LGY, t, 'ra-lg ra-legt'));
    lx += iw[j] + ig;
  });

  // 머리 끝 한 가닥이 「2025년」 리본 왼쪽 꼬리를 앞으로 감아 내림(리본 뒤 다발과 이어짐)
  const wrap = svg('g', {class: 'mk-hair mk-t6', 'data-mucha': 'whiplash', 'aria-hidden': 'true'}, strands([[30, 196], [21, 210], [24, 224], [34, 236], [40, 250]], {n: 1, spread: 2, w0: 4.2, w1: 0.4, curl: 1, seed: 47, cls: 'mk-hb'}));

  // 그림에 녹인 글씨 — 아치 리본 제목 · 범례 한 줄 · 해 리본
  kids.push(s('g', {'data-mucha': 'lettering', class: 'ra-letters'}, archRibbon(AC[0], AC[1], 160, -50, 50, 30, '달마다 꽃이 된 횟수', 'ra-title'), s('g', {class: 'ra-legend'}, legend), s('g', {class: 'ra-years'}, ribbons), wrap));
  return svgRoot('months', '달마다 꽃이 된 횟수 · 해마다 한 창 · 꽃 된 달은 핀 꽃 · 못한 달은 닫힌 붉은 봉오리 · 아무 회사는 막대 옆 작은 잎', ...kids);
}
/** 아무 회사 — 막대 옆 가는 금테만 있는 작은 잎((x, y) 밑동 = 값 높이 · 오른쪽으로 누움) */
const baseLeaf = (x, y) => s('g', {class: 'ra-bl'},
  s('path', {d: 'M' + r1(x) + ' ' + r1(y) + 'C' + r1(x + 3) + ' ' + r1(y - 4.4) + ' ' + r1(x + 8) + ' ' + r1(y - 4.6) + ' ' + r1(x + 11) + ' ' + r1(y - 1) + 'C' + r1(x + 8) + ' ' + r1(y + 2.8) + ' ' + r1(x + 3) + ' ' + r1(y + 3.6) + ' ' + r1(x) + ' ' + r1(y) + 'Z', class: 'ra-blf'}),
  s('path', {d: 'M' + r1(x + 0.8) + ' ' + r1(y) + 'Q' + r1(x + 5) + ' ' + r1(y - 0.9) + ' ' + r1(x + 9.4) + ' ' + r1(y - 1.1), class: 'ra-blv'}));
