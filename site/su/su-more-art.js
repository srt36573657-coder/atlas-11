/* 수르 — 「출목표와 수급」 큰 그림(su-more-art · 주문 1023 「머스크 판 4」 · 넷째 판 — docs/design/su-musk-2026-11-05/r4-brief.md 「C」 · judge-r3.md 공통 여덟)
   일곱째 판(r7-brief.md 「C」 · judge-r6.md): 뉴스 수는 판 머리의 작은 휜 리본 하나 · 첫날 · 마지막 날 값은 목걸이 양 끝 꼬리표 · 여인 손(긴 손가락 · 상아빛 소매)이 쥔 금실 진주 줄은 판 머리 금고리에 걸림(판 테를 가로지르지 않음)
   · 꽃 1.3배 · 이름은 꽃잎 끝 리본 · 아래 수급은 꽃 아래 작은 아치 칸 셋(칸 머리에 봉오리)
   · 같은 꼴 꽃잎 셋(크기만 다름 · 굵기 변하는 윤곽) · 꽃잎 끝 금빛 줄기 → 이름 · 안으로 휘어 꽃을 감싸는 덩굴 · 04 와 다른 여인(왼쪽을 봄 · 진주 목걸이를 든 손 → 아래 금사 매듭)
   무하 포스터 한 장(viewBox 0 0 390 620 · 틀은 su-co-art 의 MU.poster — 아치 따라 휘어 쓴 회사 이름 · 공용 메달 여인 v=4(반측면 · 월계관) · 양옆 덩굴 · 아치 머리 글씨판 · 꽃 모자이크 띠)
   그림은 둘:
   ① 출목표 + 그날 마지막 값 줄을 하나로 — 금실(polyline · su-21.js line21 과 같은 셈 · 가장 낮은 값 = 아래 · 가장 높은 값 = 위 · 같은 간격)에 꿴 진주 목걸이(road 와 같은 셈 · 오른 날 금 진주 · 내린 날 초록 고리)
      첫 구슬 = 매듭과 잎 · 마지막 구슬 = 꽃
   ② 닷새 수급 세 꽃잎을 양귀비 한 송이로(둥근 후광 안) — 꽃잎 넓이 = 값의 크기(같은 값 → 같은 크기) · 찬 꽃잎 = 들어옴 + · 빈 꽃잎 = 나감 − · 이름은 꽃잎 곁 · 단위 = 주(사고판 주식 수)
   뉴스 수는 메달 밑 작은 둥근 칸 · 1년 자리는 작은 해 이름표 · 기간은 두루마리(20거래일 · 그날 값 날짜까지) / 값 칸 아치 머리(닷새 · 수급 날짜) · 값이 없으면 지어내지 않고 「확인 필요」
   글씨는 처음부터 진하게 · 움직임은 꽃 · 별 · 머리카락에만(transform) · 글 속 style 없음 */
import {s} from '/su/su-fig.js';
import {MU} from '/su/su-co-art.js';
import {beads as kBeads, rays as kRays, taper as kTaper, sleeve as kSleeve, plaque as kPlaque, ribbon as kRibbon} from './su-mucha-kit.js';

export const CSS = '/su/su-more-art.css';
const D = '/su/data/su21.json', KEYS = ['hot', 'bloom', 'money'], NEED = '확인 필요';
const W = 390, CX = 195;
const fin = x => typeof x === 'number' && Number.isFinite(x);
const NF = new Intl.NumberFormat('ko-KR', {maximumFractionDigits: 3});
const num = n => NF.format(n);
const {r1, tw, flower, leaf, star, scrollT} = MU;
const day = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d == null ? '' : d)); return m ? +m[2] + '월 ' + +m[3] + '일' : null; };
/** 사고판 주식 수 — 1억 넘으면 「+1.2억 주」 · 1만 넘으면 「+11.8만 주」 · 그 아래는 「+5,432 주」(빼기는 U+2212) */
const trim = x => x.replace(/\.0$/, '');
const shares = v => { const a = Math.abs(v), sg = v > 0 ? '+' : v < 0 ? '−' : ''; return sg + (a >= 1e8 ? trim((a / 1e8).toFixed(1)) + '억' : a >= 1e4 ? trim((a / 1e4).toFixed(1)) + '만' : num(a)) + ' 주'; };
let SEQ = 0;

/** 자료 — 그 회사 항목(불장 → 꽃이 될 → 돈이 몰리는 차례로 처음 찾은 것 · su-21.js find21 과 같음) */
export async function load(get, code) {
  let T = null;
  try { T = await get(D); } catch (e) { T = null; }
  let c = null, kind = null;
  for (const k of KEYS) { const L = T && T.lists && Array.isArray(T.lists[k]) ? T.lists[k] : []; const x = L.find(r => r && r.code === code); if (x) { c = x; kind = k; break; } }
  return {code: code == null ? null : code, c, kind, asOf: T && T.asOf ? T.asOf.board : null};
}

const txt = (x, y, t, cls, a = {}) => s('text', {x: r1(x), y: r1(y), class: cls, ...a, text: t});
/** 출목표 — 오른 날 1 · 내린 날 −1 · 같은 날 0(su-21.js road 와 같은 셈) */
const dirs = l => l.slice(1).map((v, i) => (v > l[i] ? 1 : v < l[i] ? -1 : 0));
/** 진주 — 금 진주(오른 날) · 초록 고리(내린 날) · 작은 점(같은 날) */
const pearl = (x, y, v, r = 6) => (v > 0 ? s('g', {}, s('circle', {cx: r1(x), cy: r1(y), r, class: 'ma-up'}), s('circle', {cx: r1(x - r * 0.32), cy: r1(y - r * 0.34), r: r1(r * 0.3), class: 'ma-shine'}))
  : v < 0 ? s('circle', {cx: r1(x), cy: r1(y), r: r - 1, class: 'ma-dn'}) : s('circle', {cx: r1(x), cy: r1(y), r: 3.6, class: 'ma-eq'}));
/** 양귀비 꽃잎 하나(위를 봄 · 길이 L) — 넓은 부채꼴 · 끝이 물결 */
function poppyD(L) {
  const w = L * 0.4;
  return `M0 0C${r1(w * 1.25)} ${r1(-L * 0.12)} ${r1(w * 1.55)} ${r1(-L * 0.8)} ${r1(w * 0.62)} ${r1(-L * 0.97)}Q${r1(w * 0.3)} ${r1(-L * 1.06)} 0 ${r1(-L * 0.96)}Q${r1(-w * 0.3)} ${r1(-L * 1.06)} ${r1(-w * 0.62)} ${r1(-L * 0.97)}C${r1(-w * 1.55)} ${r1(-L * 0.8)} ${r1(-w * 1.25)} ${r1(-L * 0.12)} 0 0Z`;
}

/** 그림 한 장 */
export function picture(d, opt = {}) {
  const id = 'ma' + (++SEQ), c = d && d.c ? d.c : null, kind = d && d.kind ? d.kind : null;
  const BOT = 592, MY = 98, MR = 50, QX = 30, QW = W - 60, QY = 164, QB = 330, LG = QB + 21;
  // 양옆 덩굴 — 옆을 따라 내려오다 안으로 휘어 꽃 옆에서 말림(아래 수급 칸 위에서 끝남)
  const vinePts = side => [[128, 490], [94, 482], [62, 464], [38, 430], [27, 388], [24, 342], [30, 296], [20, 250], [28, 204], [22, 164]].map(([x, y]) => [side ? W - x : x, y]);
  const F = MU.poster({id, title: c && c.name ? c.name : NEED, proper: !!(c && c.name), v: 4, dir: -1, side: -1, ring: 'petal', my: MY, mr: MR, plateTop: null, bot: BOT, vinePts});
  const art = [], labs = [], taken = [];
  const keep = (x, y, w, h) => taken.push([x, y, w, h]);
  const tpath = (rb, t, cls) => { const pid = rb.getAttribute('data-path'), tp = s('textPath', {href: '#' + pid, startOffset: '50%', text: t}); tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + pid); return s('text', {'text-anchor': 'middle', class: cls, dy: 6.5}, tp); };

  /* ① 위가 둥근 아치 판 — 머리에 작은 휜 리본(뉴스 수) · 기간 · 1년 자리 · 진주 목걸이(출목표 + 그날 마지막 값 줄) · 양 끝 꼬리표(첫날 · 마지막 날) */
  art.push(s('g', {class: 'ma-plq', 'data-mucha': 'panel'}, kPlaque({x: QX, y: QY, w: QW, h: QB - QY, tone: 'cream', knots: true})));
  const nc = c && c.news ? c.news.newsCount : null, p = c ? c.pos52 : null;
  const nT = fin(nc) ? '뉴스 ' + num(nc) + '건' : '뉴스 ' + NEED, nw = Math.max(64, tw(nT, 18)) + 52;
  const rb = kRibbon([[CX - nw / 2, QY + 8], [CX - nw / 4, QY - 1], [CX, QY - 3], [CX + nw / 4, QY - 1], [CX + nw / 2, QY + 8]], {w: 25, tone: 'cream'});
  labs.push(s('g', {'data-tag': 'news'}, rb, tpath(rb, nT, 'ma-rbt ma-t18' + (fin(nc) ? '' : ' ma-need'))));
  keep(CX - nw / 2, QY - 16, nw, 30);
  const lv = (c && Array.isArray(c.c) ? c.c : []).filter(fin), dd = lv.length >= 2 ? dirs(lv) : [];
  const per1 = lv.length >= 2 ? lv.length - 1 + '거래일 · ' + (day(c.date) || NEED) + '까지' : '그날 마지막 값 ' + NEED;
  labs.push(s('g', {'data-tag': 'period'}, txt(CX, QY + 42, per1, 'ma-t ma-t18 ma-m ma-onq', {'text-anchor': 'middle'})));
  keep(CX - tw(per1, 18) / 2, QY + 27, tw(per1, 18), 20);
  const yTag = fin(p) ? (p >= 0.95 ? '1년 가장 높은 값 가까이' : '1년 100칸 가운데 ' + Math.round(p * 100) + '번째') : '1년 자리 ' + NEED;
  labs.push(s('g', {'data-tag': 'year'}, txt(CX, QY + 64, yTag, 'ma-t ma-t18 ma-onq' + (fin(p) ? '' : ' ma-need'), {'text-anchor': 'middle'})));
  keep(CX - tw(yTag, 18) / 2, QY + 49, tw(yTag, 18), 20);
  const BX0 = 64, BX1 = 326, BY0 = QY + 98, BY1 = QB - 40;
  if (lv.length >= 2) {
    const lo = Math.min(...lv), hi = Math.max(...lv), y = v => BY0 + (BY1 - BY0) * (1 - (v - lo) / Math.max(1, hi - lo)), x = i => BX0 + (BX1 - BX0) * i / (lv.length - 1);
    const P = lv.map((v, i) => [x(i), y(v)]), pts = P.map(q => r1(q[0]) + ',' + r1(q[1])).join(' '), [x0, y0] = P[0], [xe, ye] = P[P.length - 1];
    const [rq, rc] = MU.ribbonD(P, t => 4.4 - 3 * t);
    const bow = s('g', {class: 'ma-bow', 'data-mucha': 'whiplash'},
      s('path', {d: `M${r1(x0)} ${r1(y0)}C${r1(x0 - 6)} ${r1(y0 - 14)} ${r1(x0 - 19)} ${r1(y0 - 12)} ${r1(x0 - 15)} ${r1(y0 - 3)}C${r1(x0 - 12)} ${r1(y0 + 2)} ${r1(x0 - 5)} ${r1(y0 + 1)} ${r1(x0)} ${r1(y0)}Z`, class: 'ma-bowl'}),
      s('path', {d: `M${r1(x0)} ${r1(y0)}C${r1(x0 + 3)} ${r1(y0 - 14)} ${r1(x0 + 15)} ${r1(y0 - 16)} ${r1(x0 + 13)} ${r1(y0 - 6)}C${r1(x0 + 11)} ${r1(y0 - 1)} ${r1(x0 + 5)} ${r1(y0)} ${r1(x0)} ${r1(y0)}Z`, class: 'ma-bowl'}),
      s('circle', {cx: r1(x0), cy: r1(y0), r: 3.4, class: 'ma-first'}));
    const lastUp = dd[dd.length - 1] > 0;
    const medal = s('g', {'data-end': 'last', class: 'ma-medal', 'data-mucha': 'halo'}, s('circle', {cx: r1(xe), cy: r1(ye), r: 11.5, class: lastUp ? 'ma-mdu' : 'ma-mdd'}),
      s('circle', {cx: r1(xe), cy: r1(ye), r: 8.8, class: 'ma-mdl'}), pearl(xe, ye, dd[dd.length - 1], 5.8));
    art.push(s('g', {'data-line': 'close'}, s('polyline', {points: pts, class: 'ma-lineu'}), s('path', {d: rq, class: 'ma-rib'}), s('path', {d: rc, class: 'ma-rib'}), s('polyline', {points: pts, class: 'ma-line'}),
      dd.map((v, i) => (i === dd.length - 1 ? null : pearl(P[i + 1][0], P[i + 1][1], v))), bow, medal));
    // 꼬리표 — 목걸이 끝(매듭 · 메달)에 금실로 매단 작은 이름표 · 줄 · 구슬 · 판 머리 글 · 다른 꼬리표를 덮지 않는 자리(위 · 아래 · 옆 가운데 겹침이 가장 적은 곳)
    const hits = (bx, by, bw, bh) => taken.reduce((n, b) => n + (bx < b[0] + b[2] + 4 && b[0] < bx + bw + 4 && by < b[1] + b[3] + 3 && b[1] < by + bh + 3 ? 99 : 0), 0) + P.reduce((n, q, i) => { let k = n; if (q[0] > bx - 8 && q[0] < bx + bw + 8 && q[1] > by - 8 && q[1] < by + bh + 8) k += 3;
      if (i) for (let t = 0.25; t < 1; t += 0.25) { const xx = P[i - 1][0] + (q[0] - P[i - 1][0]) * t, yy = P[i - 1][1] + (q[1] - P[i - 1][1]) * t; if (xx > bx - 4 && xx < bx + bw + 4 && yy > by - 4 && yy < by + bh + 4) k++; } return k; }, 0);
    const tag = (tt, q, side, key) => {
      const bw = tw(tt, 19) + 22, bh = 27, R = side ? -1 : 1, cand = [[q[0] - 12 * R - (side ? bw : 0) + (side ? 0 : 0), q[1] + 15], [q[0] - (side ? bw - 12 : 12), q[1] - 15 - bh], [side ? q[0] - 18 - bw : q[0] + 18, q[1] - bh / 2], [side ? q[0] - bw + 30 : q[0] - 30, q[1] + 15], [side ? q[0] - bw + 30 : q[0] - 30, q[1] - 15 - bh]];
      let best = null;
      for (const [bx0, by] of cand) { const bx = Math.max(QX + 12, Math.min(QX + QW - 12 - bw, bx0)), out = by < QY + 40 || by + bh > QB - 7 ? 60 : 0, sc = hits(bx, by, bw, bh) + out; if (!best || sc < best.sc) best = {bx, by, sc}; }
      keep(best.bx, best.by, bw, bh);
      const ax = Math.max(best.bx + 12, Math.min(best.bx + bw - 12, q[0])), ay = best.by + bh / 2 < q[1] ? best.by + bh : best.by, mid = (ay + q[1]) / 2;
      return s('g', {'data-end-tag': key},
        s('path', {d: MU.brush(`M${r1(q[0])} ${r1(q[1])}C${r1(q[0])} ${r1(mid)} ${r1(ax)} ${r1(mid)} ${r1(ax)} ${r1(ay)}`, MU.fall(1.4, 0.9), 10), class: 'ma-thread'}),
        s('rect', {x: r1(best.bx), y: r1(best.by), width: r1(bw), height: bh, rx: 13.5, class: 'ma-tag'}), s('rect', {x: r1(best.bx + 3), y: r1(best.by + 3), width: r1(bw - 6), height: bh - 6, rx: 10.5, class: 'ma-tag2'}),
        s('circle', {cx: r1(ax), cy: r1(ay), r: 2.6, class: 'ma-tring'}),
        txt(best.bx + bw / 2, best.by + 20, tt, 'ma-t ma-t19 ma-tb ma-ontag', {'text-anchor': 'middle'}));
    };
    labs.push(tag('마지막 날 ' + num(lv[lv.length - 1]) + '원', P[P.length - 1], 1, 'last'), tag('첫날 ' + num(lv[0]) + '원', P[0], 0, 'first'));
    // 범례 — 판 아래 띠(금 진주 = 오른 날 · 초록 고리 = 내린 날 · 같은 날)
    const up = dd.filter(v => v > 0).length, dn = dd.filter(v => v < 0).length, eq = dd.length - up - dn;
    const items = [[1, '오름 ' + up], [-1, '내림 ' + dn], ...(eq ? [[0, '같음 ' + eq]] : [])];
    const iw = items.map(([, tt]) => tw(tt, 19) + 24), tot = iw.reduce((a2, b2) => a2 + b2, 0) + (items.length - 1) * 18, bw2 = tot + 44;
    let lx = CX - tot / 2;
    labs.push(s('g', {'data-legend': 'road'}, s('rect', {x: r1(CX - bw2 / 2), y: QB + 2, width: r1(bw2), height: 28, rx: 14, class: 'ma-lgb'}), s('rect', {x: r1(CX - bw2 / 2 + 3), y: QB + 5, width: r1(bw2 - 6), height: 22, rx: 11, class: 'ma-lgb2'}),
      items.map(([v, tt], k) => { const g = [pearl(lx + 7, LG - 6, v, 6.5), txt(lx + 20, LG + 1, tt, 'ma-t ma-t19 ma-onh')]; lx += iw[k] + 18; return g; })));
  } else labs.push(txt(CX, (BY0 + BY1) / 2 + 7, '그날 마지막 값 ' + NEED, 'ma-t ma-t19 ma-need ma-onq', {'text-anchor': 'middle'}));

  /* 진주 줄을 손에 든 여인 — 상아빛 속소매 · 가늘고 긴 손가락이 금실을 살며시 쥐고 늘어뜨림 · 금실 한 줄과 진주 다섯이 판 머리 금고리에 걸림(판 테를 가로지르지 않음) */
  const HX = 147, HYd = 152, ah = Math.min(QW / 2, (QB - QY) * 0.4), RX = 98, RY = QY + ah - ah * Math.sqrt(Math.max(0, 1 - Math.pow((CX - RX) / (QW / 2), 2))) - 1;
  const c1 = [HX - 14, HYd + 26], c2 = [RX + 16, RY - 8], cub = u => { const q = 1 - u; return [0, 1].map(j => q * q * q * [HX, HYd][j] + 3 * q * q * u * c1[j] + 3 * q * u * u * c2[j] + u * u * u * [RX, RY - 4][j]); };
  const strand = MU.brush(`M${HX} ${HYd}C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${RX} ${r1(RY - 4)}`, MU.fall(1.5, 1.1), 16);
  const np = [0.2, 0.38, 0.55, 0.71, 0.86].map((u, k) => { const [bx, by] = cub(u), r = [3.1, 3.5, 3.8, 3.5, 3.1][k]; return s('g', {}, s('circle', {cx: r1(bx), cy: r1(by), r, class: 'ma-np'}), s('circle', {cx: r1(bx - r * 0.32), cy: r1(by - r * 0.34), r: r1(r * 0.32), class: 'ma-shine'})); });
  const hold = s('g', {'data-mucha': 'outline', class: 'ma-hold'}, s('path', {d: strand, class: 'ma-nkt'}), np,
    s('circle', {cx: RX, cy: r1(RY), r: 4.2, class: 'ma-ring'}), s('circle', {cx: RX, cy: r1(RY), r: 1.6, class: 'ma-ring2'}),
    kSleeve({x: CX - 22, y: MY + 28, ang: 44, len: 24, w: 16, hand: 'hold', dir: -1, tone: 'ivory'}));

  /* ② 닷새 수급 — 둥근 후광 안 꽃 한 송이(1.3배 · 같은 꼴 꽃잎 셋 · 크기만 다르게 · 찬 꽃잎 = 들어옴 · 옅은 꽃잎 = 나감) · 이름은 꽃잎 끝 리본 · 기간은 꽃 위 한 줄 · 아래 작은 아치 칸 셋(칸 머리에 봉오리) */
  const f = c && c.flows ? c.flows : {}, FL = [['외국인', f.foreign], ['기관', f.institution], ['개인', f.individual]];
  const fdays = fin(f.days) ? (f.days === 5 ? '닷새' : f.days + '거래일') : '닷새';
  const per2 = fdays + ' · ' + (day(f.from) && day(f.to) ? day(f.from) + ' ~ ' + day(f.to) : NEED);
  labs.push(s('g', {'data-tag': 'period2'}, txt(CX, QB + 50, per2, 'ma-t ma-t18 ma-m', {'text-anchor': 'middle'})));
  const RH = 50, HY = 456, FX = CX, FY = HY + 8, LM = 50, ANG = [-160, -90, -20], M = Math.max(0, ...FL.map(([, v]) => (fin(v) ? Math.abs(v) : 0)));
  const RBC = [[FX - RH - 38, FY - 30, -1], [FX, HY - RH - 2, 0], [FX + RH + 38, FY - 30, 1]];
  const gst = [], names = [];
  const petals = FL.map(([nm, v], i) => {
    const rot = `translate(${FX} ${r1(FY)}) rotate(${ANG[i] + 90})`, a = ANG[i] * Math.PI / 180;
    const L = fin(v) && M > 0 ? Math.max(18, LM * Math.sqrt(Math.abs(v) / M)) : 28, w = L * 0.4, tip = [FX + Math.cos(a) * L * 0.97, FY + Math.sin(a) * L * 0.97];
    const [rx0, ry0, sd] = RBC[i], half = Math.max(30, tw(nm, 19) / 2 + 22), ex = sd ? rx0 - sd * (half - 6) : rx0, ey = sd ? ry0 + 6 : ry0 + 12;
    if (sd) gst.push(s('path', {d: MU.brush(`M${r1(tip[0])} ${r1(tip[1])}C${r1(tip[0] + Math.cos(a) * 12)} ${r1(tip[1] + Math.sin(a) * 12)} ${r1(ex + sd * 6)} ${r1(ey + 10)} ${r1(ex)} ${r1(ey)}`, MU.fall(1.6, 0.6), 12), class: 'ma-gst'}));
    const rbn = kRibbon(sd ? [[rx0 - half, ry0 + (sd < 0 ? 5 : -1)], [rx0, ry0 - 3], [rx0 + half, ry0 + (sd < 0 ? -1 : 5)]] : [[rx0 - half, ry0 + 4], [rx0, ry0 - 3], [rx0 + half, ry0 + 4]], {w: 25, tone: 'cream'});
    names.push(s('g', {'data-petal-name': nm}, rbn, tpath(rbn, nm, 'ma-rbt ma-t19')));
    if (!fin(v)) return s('g', {transform: rot}, s('path', {d: poppyD(L), class: 'ma-pneed'}));
    const cls = v > 0 ? 'ma-pin' : v < 0 ? 'ma-pout' : 'ma-peq';
    const veins = [-0.5, -0.18, 0.18, 0.5].map(u => `M0 -3Q${r1(u * w * 0.6)} ${r1(-L * 0.45)} ${r1(u * w * 1.15)} ${r1(-L * 0.84)}`).join('');
    return s('g', {transform: rot, 'data-flow': nm},
      s('path', {d: poppyD(L), class: cls}), s('path', {d: veins + `M0 -3V${r1(-L * 0.88)}`, class: v > 0 ? 'ma-vein' : 'ma-vein2'}),
      kTaper([[-w * 0.15, -1], [-w * 1.05, -L * 0.3], [-w * 1.2, -L * 0.72], [-w * 0.6, -L * 0.96]], {w0: 2.8, w1: 0.4, cls: v > 0 ? 'ma-pink' : 'ma-pink2'}),
      kTaper([[w * 0.15, -1], [w * 1.05, -L * 0.3], [w * 1.2, -L * 0.72], [w * 0.6, -L * 0.96]], {w0: 2, w1: 0.3, cls: v > 0 ? 'ma-pink' : 'ma-pink2'}));
  });
  const stam = [];
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r0 = 7.5, r2 = 13.5; stam.push(s('line', {x1: r1(FX + Math.cos(a) * r0), y1: r1(FY + Math.sin(a) * r0), x2: r1(FX + Math.cos(a) * r2), y2: r1(FY + Math.sin(a) * r2), class: 'ma-stl'}), s('circle', {cx: r1(FX + Math.cos(a) * r2), cy: r1(FY + Math.sin(a) * r2), r: 1.7, class: 'ma-std'})); }
  // 아래 작은 아치 칸 셋 — 칸 머리에 봉오리(들어옴 = 핀 봉오리 살구 · 나감 = 닫힌 봉오리 연두) · 이름 · 들고 남 한 줄 · 주식 수 크게
  const CT = 514, CBt = 589, CG = 6, CX0 = 14, CW = (W - 2 * CX0 - 2 * CG) / 3, cells = [], buds = [];
  FL.forEach(([nm, v], i) => {
    const x0 = CX0 + i * (CW + CG), x1 = x0 + CW, cx = (x0 + x1) / 2, ry = 15, rb = 12;
    const cd = i2 => `M${r1(x0 + i2)} ${r1(CBt - i2 - rb)}V${r1(CT + i2 + ry)}A${r1(CW / 2 - i2)} ${r1(ry - i2 * 0.6)} 0 0 1 ${r1(x1 - i2)} ${r1(CT + i2 + ry)}V${r1(CBt - i2 - rb)}Q${r1(x1 - i2)} ${r1(CBt - i2)} ${r1(x1 - i2 - rb)} ${r1(CBt - i2)}H${r1(x0 + i2 + rb)}Q${r1(x0 + i2)} ${r1(CBt - i2)} ${r1(x0 + i2)} ${r1(CBt - i2 - rb)}Z`;
    cells.push(s('path', {d: cd(0), class: 'ma-cell'}), s('path', {d: cd(4), class: 'ma-cell2'}));
    const open = fin(v) && v > 0, bt = CT - 1;
    buds.push(s('g', {class: 'ma-bud'}, s('path', {d: `M${r1(cx)} ${r1(bt)}C${r1(cx - 1)} ${r1(bt - 4)} ${r1(cx + 1)} ${r1(bt - 6)} ${r1(cx)} ${r1(bt - 8)}`, class: 'ma-budst'}),
      leaf(cx, bt - 3, -150, 9, 'ma-leaf'), leaf(cx, bt - 3, -30, 9, 'ma-leaf'),
      s('path', {d: `M${r1(cx)} ${r1(bt - 6)}C${r1(cx + 7)} ${r1(bt - 8)} ${r1(cx + 4.5)} ${r1(bt - 18)} ${r1(cx)} ${r1(bt - 20)}C${r1(cx - 4.5)} ${r1(bt - 18)} ${r1(cx - 7)} ${r1(bt - 8)} ${r1(cx)} ${r1(bt - 6)}Z`, class: open ? 'ma-budo' : 'ma-budc'})));
    const st = fin(v) ? (v > 0 ? '들어옴' : v < 0 ? '나감' : '같음') : '';
    const sv = fin(v) ? shares(v) : NEED, mm = /^([+−]?[0-9.,]+)(.*)$/.exec(sv), inner = CW - 18, npx = mm ? [21, 20, 19, 18].find(q => tw(mm[1], q) + tw(mm[2], 18) <= inner) || 18 : 19;
    labs.push(s('g', {'data-plate': 'flows', 'data-cell': nm}, s('text', {x: r1(cx), y: CT + 37, 'text-anchor': 'middle', class: 'ma-t ma-t18 ma-onc'}, s('tspan', {class: 'ma-tb', text: nm}), st ? s('tspan', {class: 'ma-m', text: ' ' + st}) : null),
      s('text', {x: r1(cx), y: CT + 63, 'text-anchor': 'middle', class: 'ma-t ma-num ma-onc' + (fin(v) ? (v > 0 ? ' ma-in2' : v < 0 ? ' ma-out2' : '') : ' ma-need')}, mm ? [s('tspan', {class: 'ma-t' + npx, text: mm[1]}), s('tspan', {class: 'ma-t18', text: mm[2]})] : s('tspan', {class: 'ma-t19', text: sv}))));
  });
  art.push(s('g', {'data-flower': 'flows', 'data-mucha': 'halo'},
    s('circle', {cx: FX, cy: r1(HY), r: RH, class: 'ma-halo'}), s('g', {class: 'ma-hray'}, kRays(FX, HY, 14, RH - 4, {n: 32})), s('circle', {cx: FX, cy: r1(HY), r: RH - 6, class: 'ma-halo2'}),
    s('path', {d: MU.brush(`M${FX} ${r1(FY + 6)}C${FX - 4} ${r1(FY + 18)} ${FX + 4} ${CT - 30} ${FX} ${CT - 20}`, MU.fall(4.6, 2.2), 10), class: 'ma-stem'}),
    leaf(FX, HY + RH + 2, 200, 22, 'ma-leaf'), leaf(FX, HY + RH, -20, 20, 'ma-leaf'),
    s('g', {'data-mucha': 'whiplash'}, gst), petals, s('circle', {cx: FX, cy: r1(FY), r: 8, class: 'ma-fcore'}), stam, s('circle', {cx: FX, cy: r1(FY), r: 3.2, class: 'ma-fcore2'})),
    s('g', {'data-mucha': 'panel', class: 'ma-cells'}, cells), buds);
  labs.push(s('g', {'data-petal': 'names'}, names));
  art.push(hold);

  /* 읽는 기계용 한 줄 */
  const up = dd.filter(v => v > 0).length, dn = dd.filter(v => v < 0).length;
  const say = [c && c.name ? c.name : NEED,
    lv.length >= 2 ? '그날 마지막 값 ' + lv.length + '개 · ' + (lv.length - 1) + '거래일 · ' + (day(c.date) || NEED) + '까지 · 첫날 ' + num(lv[0]) + '원 · 마지막 날 ' + num(lv[lv.length - 1]) + '원 · 오른 날 ' + up + ' · 내린 날 ' + dn : '그날 마지막 값 ' + NEED,
    fdays + ' 수급(사고판 주식 수) ' + FL.map(([nm, v]) => nm + ' ' + (fin(v) ? shares(v) : NEED)).join(' · '),
    fin(nc) ? '뉴스 ' + num(nc) + '건' : '뉴스 ' + NEED, yTag].join(' · ');

  const svg = s('svg', {class: 'su-svg su-art4 su-more-art' + (kind ? ' ma-k-' + kind : ''), viewBox: `0 0 ${W} 620`, role: 'img', 'aria-label': opt.label ? opt.label + ' · ' + say : say, preserveAspectRatio: 'xMidYMid meet', 'data-g': 'more-art'},
    s('defs', {}, F.defs), F.back, art.filter(x => x !== hold), s('g', {'data-mucha': 'lettering'}, labs), F.front, hold);
  if (opt && opt.still) svg.classList.add('mu-still');
  return svg;
}
