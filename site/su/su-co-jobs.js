/* 수르 — 회사 쪽 큰 그림 「su-co-jobs」(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」)
   옛 무하 판 su-co-art 를 첫 페이지 잡스 판(su-apple)과 같은 말투로 다시 그림 — 흰 바탕 · 검정 · 회색 · 호박색 하나 · 무하 꾸밈 0 · 흐림 필터 0
   한 장 = 위에서 아래로 생각 하나씩
     ① 회사 이름(크게) → 현재가(큰 숫자 · 회사 자료 c.price) → 「현재가는 ○월 ○일 마지막 값이에요.」(첫 페이지 칸과 같은 말)
     ② 한 달 꺾은선(회사 co.line 그대로 · 회색 2px · 한 달 전 값에 옅은 가로줄 · 끝 점 호박색 + 흰 고리 + 숨 쉬는 빛) · 시장 줄(코스피 · 코스닥 그대로 · 옅은 회색)
        첫 페이지 42칸 회사는 칸과 같은 21 마지막 값 · 같은 날짜(주문 0806 — boardRoad · 장 중에는 liveRoad 로 칸과 똑같이 밀림)
        끝값 이름표(su-lg-c · su-lg-i · 값 tspan.v — 검사가 회사 자료와 맞대 봄) · 아래 처음 날 · 끝 날
     ③ 「왜 여기 있나」 — 가는 선으로 나눈 줄: 업종 줄(누르면 그 업종 · 옛 부품과 같은 주소 · 같은 aria-label) → 목록마다 「불장 7곳에 들었어요」 · 기간 · 업종 값 · 회사 값(su-21.js whyRoad 와 같은 값)
   숫자는 자료 그대로(새 셈 없음 — su-data.js coLine · idxLine · pct 그대로) · 빈 값은 「확인 필요」
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-co-jobs.css 에만(움직임 줄이기면 끝 모습) · 아무 수 0 · 옛 아이폰 사파리를 위해 뒤돌아보기 글꼴 · .at() · ??= 없음 */
import {s} from '/su/su-fig.js';
import {CODE, pct, dateKo, coLine, idxLine} from '/su/su-data.js';
import {NEED, num} from '/su/su-six.js';
import {KIND} from '/su/su-21.js';

export const CSS = '/su/su-co-jobs.css';
const W = 390, PAD = 20, MID = W / 2, HMIN = 660, KEY = ['hot', 'bloom', 'money'], KEY6 = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'];
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r1 = v => Math.round(v * 10) / 10;
const lastOf = a => (Array.isArray(a) && a.length ? a[a.length - 1] : null);
/* whyRoad 와 같은 꼴(su-21.js sgn · sgnP 그대로) */
const sgn = x => (fin(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + num(Math.abs(Math.round(x * 10) / 10)) : NEED);
const sgnP = x => (fin(x) ? sgn(x) + '%' : NEED);
const indHref = n => '#/i/' + encodeURIComponent(n);
const dk = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? dateKo(d) : null);
let SEQ = 0;

/* ── 글 폭 어림(굵은 글 · 넉넉히 — 한글 1 · 숫자 0.62 글자) · 줄 나누기(띄어쓰기 · 가운뎃점 뒤에서 · 글은 바꾸지 않음) ── */
const EM = ch => (/[가-힣ㄱ-ㅣ]/.test(ch) ? 1 : /[0-9]/.test(ch) ? 0.62 : /[A-Z&]/.test(ch) ? 0.74 : /[a-z]/.test(ch) ? 0.58 : ch === ' ' ? 0.3
  : /[·.,:]/.test(ch) ? 0.34 : ch === '%' ? 0.9 : /[+−~-]/.test(ch) ? 0.64 : ch === '›' ? 0.5 : 0.72);
const tw = (t, px) => Array.from(String(t == null ? '' : t)).reduce((a, ch) => a + EM(ch), 0) * px;
function hard(l, px, maxW) {
  const chs = Array.from(l), k = Math.max(1, Math.ceil(tw(l, px) / maxW)), per = Math.ceil(chs.length / k), even = [];
  for (let i = 0; i < chs.length; i += per) even.push(chs.slice(i, i + per).join(''));
  if (even.every(x => tw(x, px) <= maxW)) return even;
  const out = []; let cur = '';
  for (const ch of chs) { if (cur && tw(cur + ch, px) > maxW) { out.push(cur); cur = ch; } else cur += ch; }
  if (cur) out.push(cur);
  return out;
}
function wrap(t, px, maxW) {
  const toks = []; let cur = '';
  for (const ch of Array.from(String(t == null ? '' : t))) { cur += ch; if (ch === ' ' || ch === '·') { toks.push(cur); cur = ''; } }
  if (cur) toks.push(cur);
  const out = []; let line = '';
  for (const k of toks) { if (line.trim() && tw((line + k).trim(), px) > maxW) { out.push(line.trim()); line = k; } else line += k; }
  if (line.trim()) out.push(line.trim());
  const all = out.reduce((a, l) => a.concat(tw(l, px) <= maxW ? [l] : hard(l, px, maxW)), []);
  return all.length ? all : [''];
}
/** 기간 줄 — 「20거래일 · 11월 6일까지」 · 넘치면 둘로 · 날짜가 없으면 줄 없음(옛 부품 spanLines 와 같음) */
function spanLines(len, b, px, maxW) {
  if (!b) return [];
  const one = len + ' · ' + b + '까지';
  return tw(one, px) <= maxW ? [one] : [len, b + '까지'];
}
const T = (x, y, t, cls, extra = {}) => s('text', {x: r1(x), y: r1(y), class: cls, ...extra, text: t});

/* ═══ 자료 ═══ */
/** 자료 셋 — 회사 · 첫 화면(지수) · 21곳(옛 su-co-art 와 같은 파일) · 못 받으면 null(그림은 「확인 필요」로 그려짐) */
export async function load(get, code) {
  const c = typeof code === 'string' && CODE.test(code) ? code : null;
  if (!c || typeof get !== 'function') return {code: c, co: null, H: null, T: null};
  const safe = u => Promise.resolve().then(() => get(u)).catch(() => null);
  const [co, H, T21, N21] = await Promise.all([safe('/atlas/data/co/' + c + '.json'), safe('/atlas/data/home.json'), safe('/su/data/su21.json'), safe('/su/data/su21-next.json')]);
  return {code: c, co, H, T: T21, N: N21};
}

/** 자료 → 그릴 값(새 셈 없음 — su-data.js coLine · idxLine · pct 와 whyRoad 의 값 그대로 · 기간은 자료 날짜에서 · 현재가 = 회사 자료 c.price 그대로) */
function model(d) {
  const code = d && typeof d.code === 'string' ? d.code : null, co = d ? d.co : null, c = co ? co.c : null, H = d ? d.H : null, T21 = d ? d.T : null;
  if (!c || typeof c.name !== 'string' || !c.name) return {ok: false, code};
  const ind = typeof c.i === 'string' && c.i ? c.i : null;
  const lists = T21 && T21.lists ? T21.lists : {}, asOf = T21 && T21.asOf ? T21.asOf : {};
  const roads = KEY.filter(k => Array.isArray(lists[k]) && lists[k].some(x => x && x.code === code)).map(k => {
    const x = lists[k].find(y => y && y.code === code), w = x.why || {};
    // 기간: 불장 업종 = 20거래일(why.to) · 회사 = 20거래일(그날 값 날짜) · 시장보다 = 한 달(theme 자료 날짜) · 회사 크기 = 20거래일(mkt 자료 날짜) — 옛 부품과 같음
    const ivp = k === 'hot' ? (fin(w.ind20) ? ['20거래일', dk(w.to) || dk(x.date)] : null) : (fin(w.indX) ? ['한 달', dk(asOf.data)] : null);
    const cvp = k === 'money' ? (fin(w.gain) ? ['20거래일', dk(asOf.mkt)] : null) : k === 'hot' ? (fin(x.ch20) ? ['20거래일', dk(x.date)] : null) : null;
    const ivL = k === 'hot' ? '업종' : '시장보다', ivN = k === 'hot' ? sgnP(w.ind20) : sgn(w.indX);
    return {k, kind: KIND[k], n: lists[k].length, ind: x.ind || ind || NEED, iv: ivL + ' ' + ivN, ivL, ivN,
      name: x.name || c.name, cv: k === 'money' ? (fin(w.gain) ? '+' + num(w.gain) + '억 원' : NEED) : k === 'bloom' ? '아직 싹' : sgnP(x.ch20), ivp, cvp};
  });
  // 현재가 = 첫 페이지 칸과 같은 값(주문 0200 · 사장님 2026-11-09 02:00 「어」 — 물음 「회사 쪽 현재가도 첫 페이지와 같은 날 값으로 맞출까요?」)
  //   42칸에 든 회사는 그날 판 값(su21.json · su21-next.json 의 close · date = asOf.board) · 아니면 회사 자료 c.price 그대로 · 장 중에는 live() 가 1분마다 바꿈
  const N21 = d ? d.N : null, pool = [...KEY6.flatMap(k => (lists[k] || [])), ...KEY6.flatMap(k => ((N21 && N21.lists && N21.lists[k]) || []))];
  const bd = pool.find(x => x && x.code === code && fin(x.close) && x.close > 0 && typeof x.date === 'string' && x.date === asOf.board) || null;
  // 한 달 꺾은선 = 첫 페이지 칸과 같은 21 마지막 값(주문 0806 · 사장님 2026-11-09 08:06 「어 그렇게 해」) — 처음 날 · 끝 날도 칸 값 날짜 그대로 · 시장 줄은 날짜 21개가 꼭 맞을 때만
  //   42칸에 없는 회사(또는 칸 값이 첫 페이지 잣대에 안 맞으면) = 옛 길 그대로(회사 자료 co.line · 지수 base ~ asOf)
  const B = boardRoad(bd, H, c.market);
  const cl = B ? B.cl : coLine(co), il = B ? B.il : idxLine(H, c.market, H ? H.base : null, H ? H.asOf : null);
  const from = B ? B.from : H && typeof H.base === 'string' ? H.base : null, to = B ? B.to : typeof c.priceDate === 'string' ? c.priceDate : H && typeof H.asOf === 'string' ? H.asOf : null;
  return {ok: true, code, name: c.name, ind, cl, il, last: cl ? lastOf(cl) - 100 : null, ilast: il ? lastOf(il.line) - 100 : null, from, to, roads, market: c.market,
    lsrc: B ? 'board' : 'co', lv: B ? B.v : null, cd: B ? B.cd : null,
    price: bd ? bd.close : fin(c.price) && c.price > 0 ? c.price : null, pday: bd ? dk(bd.date) : dk(c.priceDate), pdate: bd ? bd.date : typeof c.priceDate === 'string' ? c.priceDate : null, psrc: bd ? 'board' : 'co'};
}

/* ── 한 달 꺾은선 = 첫 페이지 칸 값(주문 0806) ──
   칸 값 잣대는 첫 페이지 su-apple.js spOf 와 같음: c 가 21개 · 모두 0 보다 큰 수 · 끝 값 = 그날 현재가(close)
   날짜 21개 = su21 자료 cd(같은 판의 회사 파일 날짜 · 값이 모두 같을 때만) · 없으면 지수 날짜에서 cFrom ~ date 가 꼭 21날일 때만(빠진 날이 없을 때) · 그것도 아니면 날짜 없음(처음 날 글을 쓰지 않음)
   시장 줄 = 그 21날의 코스피 · 코스닥 값(21날이 모두 지수 자료에 있을 때만 · 하나라도 없으면 그리지 않음) · 둘 다 처음 날 = 100 */
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const idxRows = (H, market) => { const k = market === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI', r = H && H.idx && H.idx[k] ? H.idx[k].rows : null; return {k, rows: Array.isArray(r) ? r.filter(x => Array.isArray(x) && typeof x[0] === 'string' && fin(x[1]) && x[1] > 0) : []}; };
const norm = v => v.map(x => x / v[0] * 100);
function idxAt(H, market, cd) {
  if (!cd) return null;
  const {k, rows} = idxRows(H, market), by = new Map(rows.map(r => [r[0], r[1]])), v = cd.map(d => by.get(d));
  return v.every(fin) ? {name: k === 'KOSDAQ' ? '코스닥' : '코스피', line: norm(v), from: cd[0], to: cd[cd.length - 1]} : null;
}
function boardRoad(bd, H, market) {
  if (!bd || !Array.isArray(bd.c) || bd.c.length !== 21 || !bd.c.every(v => fin(v) && v > 0) || bd.c[20] !== bd.close) return null;
  const from0 = typeof bd.cFrom === 'string' && ISO.test(bd.cFrom) ? bd.cFrom : null;
  let cd = Array.isArray(bd.cd) && bd.cd.length === 21 && bd.cd.every((x, i) => typeof x === 'string' && ISO.test(x) && (!i || x > bd.cd[i - 1])) && bd.cd[20] === bd.date && (!from0 || bd.cd[0] === from0) ? bd.cd.slice() : null;
  if (!cd && from0) { const ds = idxRows(H, market).rows.map(r => r[0]).filter(x => x >= from0 && x <= bd.date); if (ds.length === 21 && ds[0] === from0 && ds[20] === bd.date) cd = ds; }
  const v = bd.c.slice();
  return {v, cd, cl: norm(v), il: idxAt(H, market, cd), from: cd ? cd[0] : from0, to: bd.date};
}

/* ═══ ① 이름 · 현재가 ═══ */
const NAMEPX = [30, 28, 26, 24, 22, 20];
function topPlan(m) {
  const px = NAMEPX.find(q => tw(m.name, q) <= W - 2 * PAD), lines = px ? [m.name] : wrap(m.name, 20, W - 2 * PAD);
  const fpx = px || 20, yName = 38, yLast = yName + (lines.length - 1) * (fpx + 6), yPrice = yLast + 62;
  return {lines, fpx, yName, yPrice, bottom: yPrice + 40};
}
function topG(m, P) {
  const g = s('g', {class: 'cj-top cj-in cj-in1', 'data-top': ''});
  P.lines.forEach((t, i) => g.append(T(MID, P.yName + i * (P.fpx + 6), t, 'cj-name cj-f' + P.fpx, {'text-anchor': 'middle', 'data-proper': ''})));
  if (m.price != null) {
    g.append(s('text', {x: MID, y: P.yPrice, 'text-anchor': 'middle', class: 'cj-px'}, s('tspan', {class: 'cj-n', text: num(m.price)}), s('tspan', {class: 'cj-unit', dx: 6, text: '원'})),
      T(MID, P.yPrice + 32, m.pday ? '현재가는 ' + m.pday + ' 마지막 값이에요.' : '현재가는 마지막 값이에요.', 'cj-d', {'text-anchor': 'middle'}));
  } else g.append(T(MID, P.yPrice - 10, '현재가 ' + NEED, 'cj-need', {'text-anchor': 'middle'}));
  return g;
}

/* ═══ ② 한 달 꺾은선 — 회색 줄 · 한 달 전 옅은 가로줄 · 끝 점(호박색 · 흰 고리 · 숨 쉬는 빛) · 끝값 이름표 · 처음 날 · 끝 날 ═══ */
const VPX = [24, 22, 20, 18], LWMAX = 116;
function labPlan(m) {
  const ca = m.cl ? [dk(m.from), dk(m.to)] : null, ia = m.il ? [dk(m.il.from), dk(m.il.to)] : null;
  const same = !ca || !ia || (ca[0] === ia[0] && ca[1] === ia[1]), axis = (same ? ca || ia : ca) || [null, null];
  const labs = [];
  if (m.cl) labs.push({k: 'c', cls: 'su-lg-c', val: pct(m.last), name: m.name, proper: true, per: []});
  labs.push({k: 'i', cls: 'su-lg-i', val: m.il ? pct(m.ilast) : NEED, name: m.il ? m.il.name : '시장', proper: false,
    per: !same && ia ? [ia[0] ? ia[0] + ' ~' : '', ia[1] || ''].filter(Boolean) : []});
  for (const b of labs) {
    b.px = VPX.find(q => tw(b.val, q) <= LWMAX) || 18;
    b.names = wrap(b.name, 18, LWMAX);
    b.w = Math.min(LWMAX, Math.max(tw(b.val, b.px), ...b.names.map(t => tw(t, 18)), ...b.per.map(t => tw(t, 18))));
    b.h = 26 + (b.names.length + b.per.length) * 22;
  }
  const LX = W - PAD - Math.max(...labs.map(b => b.w)), PR = Math.max(214, Math.min(280, LX - 24));
  return {labs, axis, LX: Math.max(LX, PR + 18), PR};
}
function chartG(m, P, id) {
  const {PL, PR, PT, PB, LX, labs, axis} = P, out = [];
  const all = [...(m.cl || []), ...(m.il ? m.il.line : [])].filter(fin), lo = Math.min(97, ...all), hi = Math.max(103, ...all);
  const N = Math.max(m.cl ? m.cl.length : 0, m.il ? m.il.line.length : 0), step = N > 1 ? (PR - PL) / (N - 1) : 0;
  const X = i => PL + i * step, Y = v => PT + (PB - PT) * (1 - (v - lo) / (hi - lo));
  const pts = a => a.map((v, i) => r1(X(i)) + ',' + r1(Y(v))).join(' ');
  const y100 = r1(Y(100));
  out.push(s('defs', {}, s('radialGradient', {id: id + 'h'}, [[0, 'cj-hl0'], [0.42, 'cj-hl1'], [0.74, 'cj-hl2'], [1, 'cj-hl3']].map(([o, c]) => s('stop', {offset: o, class: c})))));
  // 한 달 전 값 — 옅은 가로줄(두 줄 모두 처음 = 100 에서 시작)
  out.push(s('path', {d: `M${r1(PL - 6)} ${y100}H${r1(PR + 6)}`, class: 'cj-base', 'data-base': ''}));
  // 시장 줄(옅은 회색 · 아래) → 회사 줄(회색 2px · 위 · 흰 밑줄로 겹친 곳도 또렷이)
  // data-* = 검사가 자료와 맞대 보는 값(주문 0806 — 줄이 어디서 왔나 · 처음 날 · 끝 날 · 점 수 · 칸 값 21개)
  if (m.il) out.push(s('g', {'data-line': 'idx', 'data-from': m.il.from || '', 'data-to': m.il.to || '', 'data-n': m.il.line.length}, s('polyline', {points: pts(m.il.line), class: 'cj-idx'})));
  if (m.cl) out.push(s('g', {'data-line': 'co', 'data-src': m.lsrc || 'co', 'data-from': m.from || '', 'data-to': m.to || '', 'data-n': m.cl.length, 'data-v': m.lv ? m.lv.join(',') : ''},
    s('polyline', {points: pts(m.cl), class: 'cj-cou'}), s('polyline', {points: pts(m.cl), class: 'cj-co'})));
  else out.push(T((PL + PR) / 2, (PT + PB) / 2 + 7, '한 달 줄 ' + NEED, 'cj-need cj-halo', {'text-anchor': 'middle'}));
  // 「한 달 전」 — 가로줄 위 · 아래 가운데 줄이 지나가지 않는 첫 자리(왼쪽부터 · 끝 점 빛과 떨어져)
  const segs = [];
  for (const a of [m.cl, m.il ? m.il.line : null]) if (a) for (let i = 1; i < a.length; i++) segs.push([X(i - 1), Y(a[i - 1]), X(i), Y(a[i])]);
  const bw = tw('한 달 전', 18), hitN = b => { let n = 0; for (const [x1, y1, x2, y2] of segs) for (let t = 0; t <= 1; t += 0.125) { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; if (x >= b.x - 5 && x <= b.x + b.w + 5 && y >= b.y - 5 && y <= b.y + b.h + 5) n++; } return n; };
  let best = null;
  scan: for (let x = PL + 2; x <= PR - bw - 22; x += 6) for (const up of [true, false]) {
    const b = {x, y: up ? y100 - 25 : y100 + 6, w: bw, h: 19, up};
    if (b.y < PT - 16 || b.y + b.h > PB + 12) continue;
    const n = hitN(b); if (!best || n < best.n) best = {...b, n};
    if (!n) break scan;
  }
  if (best) out.push(T(best.x, best.up ? y100 - 9 : y100 + 21, '한 달 전', 'cj-d cj-halo', {'data-base-label': ''}));
  // 처음 날 · 끝 날(자료 날짜 그대로)
  out.push(s('g', {'data-per': 'line'}, axis[0] ? T(PL, PB + 34, axis[0], 'cj-d') : null, axis[1] ? T(PR, PB + 34, axis[1], 'cj-d', {'text-anchor': 'end'}) : null));
  // 끝 점 · 끝값 이름표 — 오른쪽 칸 · 줄 끝 높이에 맞추되 겹치지 않게
  const ends = {c: m.cl ? [X(m.cl.length - 1), Y(lastOf(m.cl))] : null, i: m.il ? [X(m.il.line.length - 1), Y(lastOf(m.il.line))] : null};
  for (const b of labs) { const e = ends[b.k]; b.ex = e ? e[0] : PR; b.ey = e ? e[1] : PB; b.top = b.ey - 14; }
  const minT = PT - 18, maxB = PB + 22, L = labs.slice().sort((a, b) => a.ey - b.ey);
  for (let it = 0; it < 10; it++) {
    for (const b of L) b.top = Math.max(minT, Math.min(maxB - b.h, b.top));
    for (let i = 1; i < L.length; i++) { const a = L[i - 1], b = L[i], ov = a.top + a.h + 12 - b.top; if (ov > 0) { a.top -= ov / 2; b.top += ov / 2; } }
  }
  for (const b of L) b.top = Math.max(minT, Math.min(maxB - b.h, b.top));
  // 이음 가는 선(이름표가 끝 점 높이에서 비켜났을 때만)
  for (const b of labs) { const vy = b.top + 14; if (ends[b.k] && (Math.abs(vy - b.ey) > 4 || LX - b.ex > 34)) out.push(s('path', {d: `M${r1(b.ex + 9)} ${r1(b.ey)}L${r1(LX - 7)} ${r1(vy)}`, class: 'cj-lead'})); }
  if (ends.i) out.push(s('circle', {cx: r1(ends.i[0]), cy: r1(ends.i[1]), r: 4.5, class: 'cj-dotI'}));
  if (ends.c) out.push(s('g', {class: 'cj-end'}, s('circle', {cx: r1(ends.c[0]), cy: r1(ends.c[1]), r: 18, fill: `url(#${id}h)`, class: 'cj-glow'}),
    s('circle', {cx: r1(ends.c[0]), cy: r1(ends.c[1]), r: 6, class: 'cj-dotC'})));
  for (const b of labs) {
    const vy = b.top + 22, rows = [];
    let y = vy + 22;
    for (const t of b.names) { rows.push(T(LX, y, t, 'cj-lname', b.proper ? {'data-proper': ''} : {})); y += 22; }
    for (const t of b.per) { rows.push(T(LX, y, t, 'cj-d')); y += 22; }
    out.push(s('g', {class: b.cls + ' cj-lab', 'data-end': b.k},
      s('text', {x: r1(LX), y: r1(vy), class: 'cj-v cj-v-' + b.k + ' cj-f' + b.px}, s('tspan', {class: 'v', text: b.val})), rows));
  }
  return s('g', {class: 'cj-chart cj-grow', 'data-chart': ''}, out);
}

/* ═══ ③ 「왜 여기 있나」 — 업종 줄(누르면 그 업종) → 목록마다 이름 · 기간 · 업종 값 · 회사 값(가는 선으로 나눔) ═══ */
const X0 = PAD + 20, XR = W - PAD;
function linkPlan(ind) {
  const lines = wrap(ind + ' 업종', 21, W - 2 * PAD - 44);
  return {lines, h: Math.max(64, 34 + lines.length * 26)};
}
function linkG(ind, L, y) {
  const y0 = y + L.h / 2 + 7.5 - (L.lines.length - 1) * 13;
  return s('g', {'data-road': 'ind'}, s('a', {href: indHref(ind), class: 'cj-link', 'aria-label': ind + ' 업종 보기'},
    s('rect', {x: PAD - 8, y: r1(y), width: W - 2 * PAD + 16, height: L.h, rx: 12, class: 'cj-hit'}),
    L.lines.map((t, i) => T(PAD, y0 + i * 26, t, 'cj-kh', {'data-proper': ''})),
    T(XR - 2, y + L.h / 2 + 8, '›', 'cj-chev', {'text-anchor': 'end'})));
}
/** 값 한 줄 — 왼쪽 이름(20 · 넘치면 18 · 그래도 넘치면 두 줄) · 오른쪽 값(24 → 20) · 이름 아래 기간 */
function valPlan(lab, val, per) {
  const vpx = [24, 22, 20].find(q => tw(val, q) <= 200) || 20, room = XR - tw(val, vpx) - 18 - X0;
  const lpx = tw(lab, 20) <= room ? 20 : 18, labs = tw(lab, lpx) <= room ? [lab] : wrap(lab, 18, room);
  return {lab, val, per, vpx, lpx, labs, h: 36 + (labs.length - 1) * 22 + per.length * 24};
}
function roadPlan(r) {
  const pers = [r.ivp, r.cvp].filter(Boolean), maxW = XR - X0;
  const same = pers.length > 0 && pers.every(p => p[0] === pers[0][0] && p[1] === pers[0][1]), sameD = pers.length > 0 && !!pers[0][1] && pers.every(p => p[1] === pers[0][1]);
  const head = same ? spanLines(pers[0][0], pers[0][1], 18, maxW) : sameD ? [pers[0][1] + '까지'] : [];
  const perOf = p => (!p || same ? [] : sameD ? [p[0]] : spanLines(p[0], p[1], 18, maxW - 10));
  const kind = wrap(r.kind + ' ' + r.n + '곳에 들었어요', 21, maxW);
  const iv = valPlan(r.ivL, r.ivN, perOf(r.ivp)), cv = valPlan(r.name, r.cv, perOf(r.cvp));
  return {r, head, kind, iv, cv, h: 14 + kind.length * 28 + 6 + head.length * 26 + iv.h + cv.h + 12};
}
function valG(V, y, tag, proper, amber) {
  const g = s('g', {'data-road': tag});
  V.labs.forEach((t, i) => g.append(T(X0, y + 26 + i * 22, t, 'cj-rlab cj-f' + V.lpx, proper ? {'data-proper': ''} : {})));
  g.append(T(XR, y + 26, V.val, 'cj-num cj-f' + V.vpx + (amber && V.val !== NEED ? ' cj-amb' : V.val === NEED ? ' cj-needv' : ''), {'text-anchor': 'end'}));
  const py = y + 26 + (V.labs.length - 1) * 22;
  V.per.forEach((t, i) => g.append(T(X0, py + 24 + i * 24, t, 'cj-d')));
  return g;
}
function roadG(R, y, i) {
  const g = s('g', {class: 'cj-road cj-fade cj-fd' + Math.min(i, 2), 'data-list': R.r.k});
  let yy = y + 14;
  g.append(s('g', {'data-road': 'list'}, s('circle', {cx: PAD + 7, cy: r1(yy + 15), r: 6, class: 'cj-dotA'}),
    R.kind.map((t, j) => T(X0, yy + 22 + j * 28, t, 'cj-k'))));
  yy += R.kind.length * 28 + 6;
  if (R.head.length) g.append(s('g', {'data-road': 'per'}, R.head.map((t, j) => T(X0, yy + 18 + j * 26, t, 'cj-d'))));
  yy += R.head.length * 26;
  g.append(valG(R.iv, yy, 'indv', false, false));
  yy += R.iv.h;
  g.append(valG(R.cv, yy, 'co', true, true));
  return g;
}

/* ═══ 그림 한 장 — load 가 준 것으로 <svg viewBox="0 0 390 H"> 하나(H 는 660 넘게 · 목록이 많으면 길어짐) ═══ */
export function picture(d, opt = {}) {
  const m = model(d), id = 'cj' + (++SEQ) + (m.code || 'x');
  if (!m.ok) {
    const svg = s('svg', {class: 'su-svg su-co-jobs', viewBox: `0 0 ${W} ${HMIN}`, role: 'img', 'aria-label': '회사 자료 ' + NEED, preserveAspectRatio: 'xMidYMid meet', 'data-g': 'su-co-jobs', 'data-clean': 'jobs', 'data-mode': 'need'},
      s('rect', {x: 0, y: 0, width: W, height: HMIN, class: 'cj-bg'}),
      s('g', {class: 'cj-in cj-in1'}, T(MID, 64, NEED, 'cj-name cj-f28', {'text-anchor': 'middle'}), T(MID, 112, '이 회사 자료를', 'cj-sub', {'text-anchor': 'middle'}), T(MID, 140, '아직 받지 못했어요.', 'cj-sub', {'text-anchor': 'middle'}),
        T(MID, 182, '회사 번호 ' + (m.code || NEED), 'cj-d', {'text-anchor': 'middle'})),
      s('path', {d: `M${PAD} 330H${W - PAD}`, class: 'cj-base'}), s('g', {class: 'cj-end'}, s('circle', {cx: MID, cy: 330, r: 6, class: 'cj-dotN cj-glow'})));
    if (opt && opt.still) svg.classList.add('cj-still');
    return svg;
  }
  const TP = topPlan(m), LP = labPlan(m);
  const roads = m.roads.map(roadPlan), link = m.roads.length ? linkPlan(m.roads[0].ind) : m.ind ? linkPlan(m.ind) : null;
  const secH = link ? link.h + roads.reduce((a, R) => a + R.h, 0) + (roads.length ? 2 : 0) : 0;
  // 꺾은선 높이 — 목록 줄이 있으면 200 · 없으면 남는 자리를 채움(그림 높이 660 넘게 · 340 까지)
  const PT = TP.bottom + 30, fixed = PT + 48 + (link ? 14 + secH : 0) + 24;
  const plotH = roads.length ? 200 : Math.max(220, Math.min(340, HMIN - fixed));
  const PB = PT + plotH, P = {PL: 24, PR: LP.PR, PT, PB, LX: LP.LX, labs: LP.labs, axis: LP.axis};
  const secY = PB + 48 + 14, H = Math.round(Math.max(HMIN, (link ? secY + secH : PB + 48) + 24));
  // 줄 · 칸
  let sec = null;
  if (link) {
    const ind = m.roads.length ? m.roads[0].ind : m.ind;
    sec = s('g', {class: 'cj-sec cj-in cj-in3', 'data-why': ''}, s('path', {d: `M${PAD} ${secY}H${W - PAD}`, class: 'cj-rule'}), linkG(ind, link, secY));
    let y = secY + link.h;
    roads.forEach((R, i) => { sec.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'cj-line'}), roadG(R, y, i)); y += R.h; });
  }
  const svg = s('svg', {class: 'su-svg su-co-jobs', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': labelOf(m), preserveAspectRatio: 'xMidYMid meet', 'data-g': 'su-co-jobs', 'data-clean': 'jobs',
    'data-mode': roads.length ? 'road' + roads.length : m.ind ? 'ind' : 'line'},
    s('rect', {x: 0, y: 0, width: W, height: H, class: 'cj-bg'}), topG(m, TP), chartG(m, P, id), sec);
  if (opt && opt.still) svg.classList.add('cj-still');
  svg.setAttribute('data-px', m.price != null ? String(m.price) : ''); svg.setAttribute('data-pdate', m.pdate || ''); svg.setAttribute('data-psrc', m.psrc || ''); svg.setAttribute('data-lsrc', m.lsrc || '');
  if (m.price != null && (!opt || opt.live !== false)) live(svg, m, P, id);
  return svg;
}
/** 그림 이름표(aria-label) — 현재가 · 한 달 줄 · 시장 줄 · 기간 · 21곳에 든 길 */
function labelOf(m) {
  const per = m.from && m.to ? ' · ' + dk(m.from) + ' ~ ' + dk(m.to) : '';
  return m.name + ' 현재가 ' + (m.price != null ? num(m.price) + '원' + (m.plab ? '(' + m.plab + ')' : m.pday ? '(' + m.pday + ' 마지막 값)' : '') : NEED)
    + ' · 한 달 줄 ' + (m.cl ? pct(m.last) : NEED) + ' · ' + (m.il ? m.il.name + ' ' + pct(m.ilast) : '시장 ' + NEED) + per
    + (m.roads.length ? ' · 21곳에 든 길 ' + m.roads.map(r => r.ind + (r.k === 'hot' ? ' ' : ' 업종 ') + r.iv + (r.ivp && r.ivp[1] ? ' ' + r.ivp[0] + ' ' + r.ivp[1] + '까지' : '') + ' → ' + r.name + ' ' + r.cv
      + (r.cvp && r.cvp[1] ? ' ' + r.cvp[0] + ' ' + r.cvp[1] + '까지' : '') + ' → ' + r.kind + ' ' + r.n + '곳').join(' · ') : m.ind ? ' · ' + m.ind + ' 업종' : '');
}
/** 장 중 한 달 꺾은선 — 첫 페이지 relive 와 같은 셈(오늘이 판 날보다 뒤 = 맨 앞 하루를 빼고 오늘 값을 끝에 · 같은 날 = 끝 값만 바꿈) · 날짜도 함께 밀림 · 오늘 지수 값은 자료에 없으니 밀리면 시장 줄은 그리지 않음 */
function liveRoad(m, p, day, jday) {
  if (!m || !m.lv || !fin(p) || p <= 0 || typeof jday !== 'string' || !(jday >= (day || ''))) return null;
  const sh = jday > (day || ''), v = sh ? m.lv.slice(1).concat([p]) : m.lv.slice(0, 20).concat([p]);
  const cd = m.cd ? (sh ? m.cd.slice(1).concat([jday]) : m.cd.slice()) : null, cl = norm(v), il = sh ? null : m.il;
  return {...m, lv: v, cd, cl, il, last: lastOf(cl) - 100, ilast: il ? lastOf(il.line) - 100 : null, from: sh ? (cd ? cd[0] : null) : m.from, to: sh ? jday : m.to};
}

/* ── 장 중 현재가(주문 0200 — 첫 페이지 칸과 같은 길 · /api/price · 네이버 증권 분봉 그대로) ──
   그림을 돌려준 뒤 물음 · 받은 값이 판 날보다 앞이 아니면 큰 숫자 · 날짜 글 · 이름표를 바꿈 · 장 중이면 1분마다(화면이 보일 때 · 그림이 쪽에서 빠지면 멈춤) · 못 받으면 그대로 */
const hmK = t => { const q = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(t || '')); if (!q) return null; const H = +q[4]; return +q[2] + '월 ' + +q[3] + '일 ' + (H < 12 ? '오전 ' : '오후 ') + (H % 12 || 12) + '시' + (+q[5] ? ' ' + +q[5] + '분' : ''); };
function live(svg, m, P, id) {
  const code = m.code, day = m.pdate;
  if (!code || typeof fetch !== 'function') return;
  const ask = async () => {
    if (!svg.isConnected && svg.dataset.asked) return;
    svg.dataset.asked = '1';
    try {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        const r = await fetch('/api/price?codes=' + code), j = r.ok ? await r.json() : null, v = j && j.items ? j.items[code] : null;
        if (!j || typeof j.day !== 'string' || !(j.day >= (day || ''))) return;
        if (v && fin(v.p) && v.p > 0 && typeof v.t === 'string') {
          const n = svg.querySelector('text.cj-px tspan.cj-n'), dl = svg.querySelector('text.cj-d');
          if (n) n.textContent = num(v.p);
          if (dl) dl.textContent = j.status === 'open' ? '현재가는 ' + hmK(v.t) + ' 값이에요.' : '현재가는 ' + dk(j.day) + ' 마지막 값이에요.';
          // 한 달 꺾은선도 첫 페이지 칸과 똑같이 바뀜(주문 0806) — 칸 값으로 그린 줄일 때만 · 이름표 · 처음 날 · 끝 날 · 끝 점이 함께
          const m2 = liveRoad(m, v.p, day, j.day) || m;
          if (m2 !== m) {
            const LP = labPlan(m2), g = chartG(m2, {PL: P.PL, PR: LP.PR, PT: P.PT, PB: P.PB, LX: LP.LX, labs: LP.labs, axis: LP.axis}, id);
            g.classList.remove('cj-grow'); g.setAttribute('data-live', v.t);
            const old = svg.querySelector('g.cj-chart'); if (old) old.replaceWith(g);
          }
          svg.setAttribute('aria-label', labelOf({...m2, price: v.p, pday: null, plab: j.status === 'open' ? hmK(v.t) + ' 값' : dk(j.day) + ' 마지막 값'}));
          svg.setAttribute('data-px', String(v.p)); svg.setAttribute('data-live', v.t);
        }
        if (j.status !== 'open') return;
      }
    } catch (e) { return; }
    setTimeout(ask, 60000);
  };
  setTimeout(ask, 0);
}
