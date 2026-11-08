/* 수르 — 「출목표와 수급」 큰 그림(su-more-art · 주문 1023 「머스크 판 4」 · 넷째 판 — docs/design/su-musk-2026-11-05/r4-brief.md 「C」 · judge-r3.md 공통 여덟)
   넷째 판: 떠 있던 조각(뉴스 · 1년 자리 · 기간 · 구슬 줄)을 위가 둥근 아치 판(공용 plaque) 하나에 · 해 그림 뺌 · 범례는 판 아래 띠 · 굵기 변하는 금사 · 왼쪽 리본 매듭 · 오른쪽 금테 메달(안에 마지막 날 구슬)
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
import {beads as kBeads, rays as kRays, taper as kTaper, sleeve as kSleeve, plaque as kPlaque} from './su-mucha-kit.js';

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
  if (!c) { // 될 듯 21곳(주문 1103) — 21 마지막 값 · 수급 · 뉴스는 su21-next.json 에 따로(첫 화면이 가볍게)
    let N = null;
    try { N = await get('/su/data/su21-next.json'); } catch (e) { N = null; }
    for (const k of ['hotNext', 'bloomNext', 'moneyNext']) { const L = N && N.lists && Array.isArray(N.lists[k]) ? N.lists[k] : []; const x = L.find(r => r && r.code === code); if (x) { c = x; kind = k === 'hotNext' ? 'hot' : k === 'bloomNext' ? 'bloom' : 'money'; break; } }
  }
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
  const PLATE = 500, BOT = 592, MY = 98, MR = 50, QX = 30, QW = W - 60, QY = 166, QB = 348;
  // 양옆 덩굴 — 옆을 따라 내려오다 안으로 휘어 꽃을 감싸고 아래 「닷새」 판까지
  const vinePts = side => [[150, PLATE + 14], [116, 492], [76, 466], [44, 430], [27, 386], [20, 340], [30, 296], [18, 250], [28, 206], [22, 164]].map(([x, y]) => [side ? W - x : x, y]);
  const F = MU.poster({id, title: c && c.name ? c.name : NEED, proper: !!(c && c.name), v: 4, dir: -1, side: -1, ring: 'petal', my: MY, mr: MR, plateTop: PLATE, bot: BOT, vinePts});
  const art = [], labs = [], taken = [];
  const keep = (x, y, w, h) => taken.push([x, y, w, h]);

  /* 위가 둥근 아치 판 하나 — 뉴스 수 · 1년 자리 · 기간 · 진주 목걸이(출목표 + 그날 마지막 값 줄) · 아래 띠 = 범례 */
  const plq = kPlaque({x: QX, y: QY, w: QW, h: QB - QY, tone: 'cream', knots: true});
  art.push(s('g', {class: 'ma-plq', 'data-mucha': 'panel'}, plq));
  const nc = c && c.news ? c.news.newsCount : null, p = c ? c.pos52 : null;
  const nT = fin(nc) ? '뉴스 ' + num(nc) + '건' : '뉴스 ' + NEED, nw = tw(nT, 18) + 16;
  labs.push(s('g', {'data-tag': 'news'}, star(CX - nw / 2 + 4, QY + 27, 5.2, 1, 'ma-tagstar'), txt(CX - nw / 2 + 14, QY + 33, nT, 'ma-t ma-t18 ma-onq' + (fin(nc) ? '' : ' ma-need'))));
  keep(CX - nw / 2, QY + 14, nw, 22);
  const yTag = fin(p) ? (p >= 0.95 ? '1년 가장 높은 값 가까이' : '1년 100칸 가운데 ' + Math.round(p * 100) + '번째') : '1년 자리 ' + NEED;
  labs.push(s('g', {'data-tag': 'year'}, txt(CX, QY + 57, yTag, 'ma-t ma-t18 ma-onq' + (fin(p) ? '' : ' ma-need'), {'text-anchor': 'middle'})));
  keep(CX - tw(yTag, 18) / 2, QY + 40, tw(yTag, 18), 22);
  const lv = (c && Array.isArray(c.c) ? c.c : []).filter(fin), dd = lv.length >= 2 ? dirs(lv) : [];
  const per1 = lv.length >= 2 ? lv.length - 1 + '거래일 · ' + (day(c.date) || NEED) + '까지' : '그날 마지막 값 ' + NEED;
  labs.push(s('g', {'data-tag': 'period'}, txt(CX, QY + 81, per1, 'ma-t ma-t18 ma-m ma-onq', {'text-anchor': 'middle'}), s('g', {class: 'ma-base'}, kBeads(CX - 46, QY + 91, CX + 46, QY + 91, {gap: 7, r: 1.4}))));
  keep(CX - tw(per1, 18) / 2, QY + 64, tw(per1, 18), 22);
  const BX0 = 62, BX1 = 328, BY0 = QY + 112, BY1 = QB - 38, LG = QB + 21;
  let first = null;
  if (lv.length >= 2) {
    const lo = Math.min(...lv), hi = Math.max(...lv), y = v => BY0 + (BY1 - BY0) * (1 - (v - lo) / Math.max(1, hi - lo)), x = i => BX0 + (BX1 - BX0) * i / (lv.length - 1);
    const P = lv.map((v, i) => [x(i), y(v)]), pts = P.map(q => r1(q[0]) + ',' + r1(q[1])).join(' '), [x0, y0] = P[0], [xe, ye] = P[P.length - 1];
    first = P[0];
    // 금사 — 줄 모양 그대로(polyline) + 굵다가 가늘어지는 금 리본(점과 점을 곧게 잇는 그대로)
    const [rq, rc] = MU.ribbonD(P, t => 4.4 - 3 * t);
    // 왼쪽 끝 리본 매듭(고리 둘 · 꼬리 둘) · 오른쪽 끝 금테 메달
    const bow = s('g', {class: 'ma-bow', 'data-mucha': 'whiplash'},
      s('path', {d: `M${r1(x0)} ${r1(y0)}C${r1(x0 - 6)} ${r1(y0 - 14)} ${r1(x0 - 19)} ${r1(y0 - 12)} ${r1(x0 - 15)} ${r1(y0 - 3)}C${r1(x0 - 12)} ${r1(y0 + 2)} ${r1(x0 - 5)} ${r1(y0 + 1)} ${r1(x0)} ${r1(y0)}Z`, class: 'ma-bowl'}),
      s('path', {d: `M${r1(x0)} ${r1(y0)}C${r1(x0 + 3)} ${r1(y0 - 14)} ${r1(x0 + 15)} ${r1(y0 - 16)} ${r1(x0 + 13)} ${r1(y0 - 6)}C${r1(x0 + 11)} ${r1(y0 - 1)} ${r1(x0 + 5)} ${r1(y0)} ${r1(x0)} ${r1(y0)}Z`, class: 'ma-bowl'}),
      s('path', {d: MU.brush(`M${r1(x0)} ${r1(y0)}C${r1(x0 - 4)} ${r1(y0 + 6)} ${r1(x0 - 12)} ${r1(y0 + 9)} ${r1(x0 - 13)} ${r1(y0 + 18)}`, MU.fall(4, 1.2), 8), class: 'ma-bowl'}),
      s('path', {d: MU.brush(`M${r1(x0)} ${r1(y0)}C${r1(x0 + 3)} ${r1(y0 + 7)} ${r1(x0 + 1)} ${r1(y0 + 12)} ${r1(x0 + 6)} ${r1(y0 + 19)}`, MU.fall(3.6, 1), 8), class: 'ma-bowl'}),
      s('circle', {cx: r1(x0), cy: r1(y0), r: 3.4, class: 'ma-first'}));
    const lastUp = dd[dd.length - 1] > 0;
    // 금테 메달 안에 마지막 날 구슬(오른 날 금 진주 · 내린 날 초록 고리 — 구슬 수 그대로)
    const medal = s('g', {'data-end': 'last', class: 'ma-medal', 'data-mucha': 'halo'}, s('circle', {cx: r1(xe), cy: r1(ye), r: 11.5, class: lastUp ? 'ma-mdu' : 'ma-mdd'}),
      s('circle', {cx: r1(xe), cy: r1(ye), r: 8.8, class: 'ma-mdl'}), pearl(xe, ye, dd[dd.length - 1], 5.8));
    art.push(s('g', {'data-line': 'close'}, s('polyline', {points: pts, class: 'ma-lineu'}), s('path', {d: rq, class: 'ma-rib'}), s('path', {d: rc, class: 'ma-rib'}), s('polyline', {points: pts, class: 'ma-line'}),
      dd.map((v, i) => (i === dd.length - 1 ? null : pearl(P[i + 1][0], P[i + 1][1], v))), bow, medal));
    // 첫날 · 마지막 날 이름표 — 줄 · 구슬 · 판 머리 글을 덮지 않는 자리(후보 가운데 겹침이 가장 적은 곳)
    const hits = (bx, by, bw, bh) => taken.reduce((n, b) => n + (bx < b[0] + b[2] + 6 && b[0] < bx + bw + 6 && by < b[1] + b[3] + 4 && b[1] < by + bh + 4 ? 99 : 0), 0) + P.reduce((n, q, i) => { let k = n; if (q[0] > bx - 8 && q[0] < bx + bw + 8 && q[1] > by - 8 && q[1] < by + bh + 8) k += 3;
      if (i) for (let t = 0.25; t < 1; t += 0.25) { const xx = P[i - 1][0] + (q[0] - P[i - 1][0]) * t, yy2 = P[i - 1][1] + (q[1] - P[i - 1][1]) * t; if (xx > bx - 4 && xx < bx + bw + 4 && yy2 > by - 4 && yy2 < by + bh + 4) k++; } return k; }, 0);
    const place = (tt, q, side) => {
      const bw = tw(tt, 19), cand = side ? [[q[0] - 18 - bw, q[1] - 11], [q[0] - bw + 6, q[1] - 38], [q[0] - bw, q[1] + 14], [q[0] - 18 - bw, q[1] + 6]] : [[q[0] + 16, q[1] - 11], [q[0] - 6, q[1] - 38], [q[0], q[1] + 14], [q[0] + 16, q[1] - 26]];
      let best = null;
      for (const [bx0, by] of cand) { const bx = Math.max(QX + 14, Math.min(QX + QW - 14 - bw, bx0)), out = by < BY0 - 30 || by + 22 > QB - 4 ? 50 : 0, sc = hits(bx, by, bw, 22) + out; if (!best || sc < best.sc) best = {bx, by, sc}; }
      keep(best.bx, best.by, bw, 22);
      return txt(best.bx, best.by + 17, tt, 'ma-t ma-t19 ma-tb ma-onq');
    };
    const lastT = place('마지막 날 ' + num(lv[lv.length - 1]) + '원', P[P.length - 1], 1);
    labs.push(place('첫날 ' + num(lv[0]) + '원', P[0], 0), lastT);
    // 범례 — 판 아래 띠(금 진주 = 오른 날 · 초록 고리 = 내린 날 · 같은 날)
    const up = dd.filter(v => v > 0).length, dn = dd.filter(v => v < 0).length, eq = dd.length - up - dn;
    const items = [[1, '오름 ' + up], [-1, '내림 ' + dn], ...(eq ? [[0, '같음 ' + eq]] : [])];
    const iw = items.map(([, tt]) => tw(tt, 19) + 24), tot = iw.reduce((a2, b2) => a2 + b2, 0) + (items.length - 1) * 18, bw2 = tot + 44;
    let lx = CX - tot / 2;
    labs.push(s('g', {'data-legend': 'road'}, s('rect', {x: r1(CX - bw2 / 2), y: QB + 2, width: r1(bw2), height: 28, rx: 14, class: 'ma-lgb'}), s('rect', {x: r1(CX - bw2 / 2 + 3), y: QB + 5, width: r1(bw2 - 6), height: 22, rx: 11, class: 'ma-lgb2'}),
      items.map(([v, tt], k) => { const g = [pearl(lx + 7, LG - 6, v, 6.5), txt(lx + 20, LG + 1, tt, 'ma-t ma-t19 ma-onh')]; lx += iw[k] + 18; return g; })));
  } else labs.push(txt(CX, (BY0 + BY1) / 2 + 7, '그날 마지막 값 ' + NEED, 'ma-t ma-t19 ma-need ma-onq', {'text-anchor': 'middle'}));

  /* 진주 목걸이를 손에 든 여인(반신) — 소매와 손이 메달 밖으로 · 목걸이가 아래 금사 매듭으로 이어짐 */
  const HX = 151, HYd = 153, fx = first ? first[0] : 62, fy = first ? first[1] : BY0;
  const nk = MU.brush(`M${HX} ${HYd}C${r1(HX - 40)} ${r1(HYd + 36)} ${r1(fx - 18)} ${r1(fy - 62)} ${r1(fx - 2)} ${r1(fy - 6)}`, MU.fall(1.8, 1.1), 16), np = [];
  for (let k = 1; k < 14; k++) { const u = k / 14, q = 1 - u, bx = q * q * q * HX + 3 * q * q * u * (HX - 40) + 3 * q * u * u * (fx - 18) + u * u * u * (fx - 2), by = q * q * q * HYd + 3 * q * q * u * (HYd + 36) + 3 * q * u * u * (fy - 62) + u * u * u * (fy - 6); np.push(s('circle', {cx: r1(bx), cy: r1(by), r: k % 3 ? 2.4 : 3.1, class: 'ma-np'})); }
  const hold = s('g', {'data-mucha': 'outline', class: 'ma-hold'}, s('path', {d: nk, class: 'ma-nkt'}), np,
    kSleeve({x: CX - 22, y: MY + 28, ang: 44, len: 26, w: 17, hand: 'hold', dir: -1, tone: 'sage'}));

  /* ② 닷새 수급 — 둥근 후광 안 꽃 한 송이(같은 꼴 꽃잎 셋 · 크기만 다르게 · 굵기 변하는 윤곽 · 찬 꽃잎 = 들어옴 · 옅은 꽃잎 = 나감) · 꽃잎 끝에서 가는 금빛 줄기로 이름까지 */
  const f = c && c.flows ? c.flows : {}, FL = [['외국인', f.foreign], ['기관', f.institution], ['개인', f.individual]];
  const fdays = fin(f.days) ? (f.days === 5 ? '닷새' : f.days + '거래일') : '닷새';
  const FX = CX, FY = 458, HY = 448, RH = 40, LM = 38, ANG = [-160, -90, -20], M = Math.max(0, ...FL.map(([, v]) => (fin(v) ? Math.abs(v) : 0)));
  const NA = [[FX - 70, FY - 34, 'end'], [FX, HY - RH - 12, 'middle'], [FX + 70, FY - 34, 'start']];
  const gst = [];
  const petals = FL.map(([nm, v], i) => {
    const rot = `translate(${FX} ${r1(FY)}) rotate(${ANG[i] + 90})`, a = ANG[i] * Math.PI / 180;
    const L = fin(v) && M > 0 ? Math.max(14, LM * Math.sqrt(Math.abs(v) / M)) : 22, w = L * 0.4, tip = [FX + Math.cos(a) * L * 0.97, FY + Math.sin(a) * L * 0.97];
    const [nx, ny, an] = NA[i], ex = an === 'end' ? nx + 4 : an === 'start' ? nx - 4 : nx, ey = an === 'middle' ? ny + 6 : ny - 6;
    gst.push(s('path', {d: MU.brush(`M${r1(tip[0])} ${r1(tip[1])}C${r1(tip[0] + Math.cos(a) * 10)} ${r1(tip[1] + Math.sin(a) * 10)} ${r1(ex + (FX - ex) * 0.2)} ${r1(ey + 8)} ${r1(ex)} ${r1(ey)}`, MU.fall(1.6, 0.5), 12), class: 'ma-gst'}), s('circle', {cx: r1(ex), cy: r1(ey), r: 1.8, class: 'ma-gst'}));
    if (!fin(v)) return s('g', {transform: rot}, s('path', {d: poppyD(L), class: 'ma-pneed'}));
    const cls = v > 0 ? 'ma-pin' : v < 0 ? 'ma-pout' : 'ma-peq';
    const veins = [-0.5, -0.18, 0.18, 0.5].map(u => `M0 -3Q${r1(u * w * 0.6)} ${r1(-L * 0.45)} ${r1(u * w * 1.15)} ${r1(-L * 0.84)}`).join('');
    return s('g', {transform: rot, 'data-flow': nm},
      s('path', {d: poppyD(L), class: cls}), s('path', {d: veins + `M0 -3V${r1(-L * 0.88)}`, class: v > 0 ? 'ma-vein' : 'ma-vein2'}),
      kTaper([[-w * 0.15, -1], [-w * 1.05, -L * 0.3], [-w * 1.2, -L * 0.72], [-w * 0.6, -L * 0.96]], {w0: 2.4, w1: 0.4, cls: v > 0 ? 'ma-pink' : 'ma-pink2'}),
      kTaper([[w * 0.15, -1], [w * 1.05, -L * 0.3], [w * 1.2, -L * 0.72], [w * 0.6, -L * 0.96]], {w0: 1.8, w1: 0.3, cls: v > 0 ? 'ma-pink' : 'ma-pink2'}));
  });
  const stam = [];
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r0 = 6, r2 = 10.5; stam.push(s('line', {x1: r1(FX + Math.cos(a) * r0), y1: r1(FY + Math.sin(a) * r0), x2: r1(FX + Math.cos(a) * r2), y2: r1(FY + Math.sin(a) * r2), class: 'ma-stl'}), s('circle', {cx: r1(FX + Math.cos(a) * r2), cy: r1(FY + Math.sin(a) * r2), r: 1.4, class: 'ma-std'})); }
  art.push(s('g', {'data-flower': 'flows', 'data-mucha': 'halo'},
    s('circle', {cx: FX, cy: r1(HY), r: RH, class: 'ma-halo'}), s('g', {class: 'ma-hray'}, kRays(FX, HY, 12, RH - 3, {n: 28})), s('circle', {cx: FX, cy: r1(HY), r: RH - 5, class: 'ma-halo2'}),
    s('path', {d: MU.brush(`M${FX} ${r1(FY + 6)}C${FX - 4} ${r1(FY + 20)} ${FX + 5} ${PLATE - 24} ${FX} ${PLATE - 6}`, MU.fall(4.6, 2.4), 10), class: 'ma-stem'}),
    leaf(FX, PLATE - 12, 198, 26, 'ma-leaf'), leaf(FX, PLATE - 14, -18, 24, 'ma-leaf'),
    s('g', {'data-mucha': 'whiplash'}, gst), petals, s('circle', {cx: FX, cy: r1(FY), r: 6.5, class: 'ma-fcore'}), stam, s('circle', {cx: FX, cy: r1(FY), r: 2.6, class: 'ma-fcore2'})));
  // 꽃잎 끝 이름 — 금빛 줄기 끝(아래 값 칸과 같은 차례)
  labs.push(s('g', {'data-petal': 'names'}, FL.map(([nm], i) => txt(NA[i][0], NA[i][1], nm, 'ma-t ma-t19 ma-tb', {'text-anchor': NA[i][2]}))));
  // 아래 값 칸 — 아치 머리에 기간 한 번 · 셋의 이름 · 들고 남 · 주식 수(꽃잎과 같은 차례 · 왼쪽 → 오른쪽)
  const per2 = fdays + ' · ' + (day(f.from) && day(f.to) ? day(f.from) + ' ~ ' + day(f.to) : NEED);
  labs.push(s('g', {'data-tag': 'period2'}, txt(CX, PLATE + 20, per2, 'ma-t ma-t18 ma-onp ma-m', {'text-anchor': 'middle'}), s('g', {class: 'ma-base'}, kBeads(CX - 60, PLATE + 30, CX + 60, PLATE + 30, {gap: 7, r: 1.5}))));
  const COLX = [76, 195, 314];
  labs.push(s('g', {'data-plate': 'flows'}, FL.map(([nm, v], i) => [
    txt(COLX[i], PLATE + 53, fin(v) ? nm + ' · ' + (v > 0 ? '들어옴' : v < 0 ? '나감' : '같음') : nm, 'ma-t ma-t19 ma-tb ma-onp', {'text-anchor': 'middle'}),
    txt(COLX[i], PLATE + 79, fin(v) ? shares(v) : NEED, 'ma-t ma-t21 ma-num ma-onp' + (fin(v) ? (v > 0 ? ' ma-in2' : v < 0 ? ' ma-out2' : '') : ' ma-need'), {'text-anchor': 'middle'})])));
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
