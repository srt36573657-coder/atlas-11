/* 큐피트 — 「오른 날 · 내린 날 줄 · 21거래일 줄」 잡스 판 큰 그림(su-more-jobs · 주문 2011 — 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」 · docs/design/su-jobs-all-2026-11-08/brief.md)
   옛 무하 그림(su-more-art)과 같은 자료 · 같은 숫자 · 같은 꼴 — load(get, 회사 번호) · picture(d, opt) · 회사 자세히 #/c/<번호>/more 큰 그림 · 누르는 곳 없음(옛 그림도 없음)
   한 화면에 생각 하나: 부제 두 줄 → 물건 하나(그날 마지막 값 꺾은선 · 첫날 옅은 가로줄 · 끝에 빛나는 호박색 구슬 · 양 끝 값은 큰 검정 숫자)
     → 오른 날 · 내린 날 한 줄(점 하나 = 하루 · 찬 점 = 오른 날 · 빈 고리 = 내린 날 · 작은 회색 점 = 같은 날) → 큰 숫자 둘(오른 날 | 내린 날 · 첫 페이지 지금 | 될 듯 과 같은 꼴)
   아래로(가는 선으로 나눔): 닷새 동안 사고판 주식 수(외국인 · 기관 · 개인 — 가운데 세로줄에서 들어옴은 오른쪽 호박색 막대 · 나감은 왼쪽 회색 막대 · 길이 = 주식 수)
     → 1년 자리(가는 줄 위 점 · 옛 그림과 같은 글) → 뉴스 수(닷새 동안 모두 · 그 가운데 이 회사 이름이 나온 것 — 「왜?」 쪽과 같은 두 수)
   셈은 옛 그림 그대로: 오른 날 · 내린 날(오른 날 1 · 내린 날 −1 · 같은 날 0) · 사고판 주식 수 글(1억 · 1만 넘으면 줄여 씀) · 1년 자리(0.95 넘게면 가장 높은 값 가까이) · 읽는 기계용 한 줄
   값이 없으면 지어내지 않고 「확인 필요」 · 덜어냄: 사람 그림 · 아치 · 덩굴 · 꽃 · 금 테 · 별 · 흐림 필터 · 아무 수 0 · 색은 검정 · 회색 · 호박색 하나
   그리기는 s() 만(createElementNS · setAttribute) · 색 · 움직임은 짝 꾸밈 파일에만(들어올 때 한 번 1.2초 안 + 끝 구슬 둘레 빛이 천천히 숨 쉼) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-more-jobs.css';
const D = '/su/data/su21.json', KEYS = ['hot', 'bloom', 'money'], NEED = '확인 필요';
const W = 390, MID = W / 2, PAD = 20;
const fin = x => typeof x === 'number' && Number.isFinite(x);
const NF = new Intl.NumberFormat('ko-KR', {maximumFractionDigits: 3});
const num = n => NF.format(n);
const f1 = v => Math.round(v * 10) / 10;
const day = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d == null ? '' : d)); return m ? +m[2] + '월 ' + +m[3] + '일' : null; };
/** 사고판 주식 수 — 1억 넘으면 「+1.2억 주」 · 1만 넘으면 「+11.8만 주」 · 그 아래는 「+5,432 주」(빼기는 U+2212 · 옛 그림과 같은 셈) */
const trim = x => x.replace(/\.0$/, '');
const shares = v => { const a = Math.abs(v), sg = v > 0 ? '+' : v < 0 ? '−' : ''; return sg + (a >= 1e8 ? trim((a / 1e8).toFixed(1)) + '억' : a >= 1e4 ? trim((a / 1e4).toFixed(1)) + '만' : num(a)) + ' 주'; };
let SEQ = 0;

/** 자료 — 그 회사 항목(불장 → 꽃이 될 → 돈이 몰리는 차례로 처음 찾은 것 · 없으면 될 듯 21곳 su21-next.json · 옛 그림 load 와 같음) */
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

/** 글 넓이 어림(굵은 글 · su-apple 과 같은 셈) */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch)) w += 0.94;
    else if (/[A-Z&]/.test(ch)) w += 0.7;
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (/[0-9+−-]/.test(ch)) w += 0.62;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.8;
  }
  return w * px;
}
const T = (x, y, text, cls, extra = {}) => s('text', {x: f1(x), y: f1(y), class: cls, ...extra, text});
const R = (x1, y1, x2, y2, cls) => s('path', {d: `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`, class: cls});

/** 그림 한 장 */
export function picture(d, opt = {}) {
  const id = 'mj' + (++SEQ), c = d && d.c ? d.c : null, kind = d && d.kind ? d.kind : null;
  const lv = (c && Array.isArray(c.c) ? c.c : []).filter(fin), n = lv.length, ok = n >= 2;
  const dd = ok ? lv.slice(1).map((v, i) => (v > lv[i] ? 1 : v < lv[i] ? -1 : 0)) : []; // 오른 날 · 내린 날 — 오른 날 1 · 내린 날 −1 · 같은 날 0
  const up = dd.filter(v => v > 0).length, dn = dd.filter(v => v < 0).length, eq = dd.length - up - dn;
  const dt = c ? day(c.date) : null;
  const u = k => `url(#${id}${k})`;
  const rg = (k, stops, at = {}) => s('radialGradient', {id: id + k, ...at}, stops.map(([o, cl]) => s('stop', {offset: o, class: cl})));
  const defs = s('defs', {},
    rg('h', [[0, 'mj-hl0'], [0.4, 'mj-hl1'], [0.72, 'mj-hl2'], [1, 'mj-hl3']]),
    rg('b', [[0, 'mj-b0'], [0.2, 'mj-b1'], [0.46, 'mj-b2'], [0.7, 'mj-b3'], [0.88, 'mj-b4'], [1, 'mj-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '40%', fy: '34%'}),
    s('linearGradient', {id: id + 'a', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'mj-a0'}), s('stop', {offset: 1, class: 'mj-a1'})));
  const out = [s('rect', {x: 0, y: 0, width: W, height: 10, class: 'mj-bg', 'data-bg': ''}), defs];

  /* 1 부제 두 줄(20 회색 · 가운데) */
  const L1 = ok ? (dt ? dt + '까지 ' : '날짜 ' + NEED + ' · ') + (n - 1) + '거래일,' : '그날 마지막 값을 하루씩 잇는 줄은',
    L2 = ok ? '그날 마지막 값을 하루씩 이었어요.' : NEED + '예요.';
  out.push(s('g', {class: 'mj-top mj-in mj-in1', 'data-tag': 'period'}, T(MID, 34, L1, 'mj-sub', {'text-anchor': 'middle'}), T(MID, 62, L2, 'mj-sub', {'text-anchor': 'middle'})));

  /* 2 물건 하나 — 꺾은선(가장 낮은 값 = 아래 · 가장 높은 값 = 위 · 같은 간격) · 양 끝 값은 위에 큰 검정 숫자 */
  const VY = 100, PX0 = 28, PX1 = W - 28, PY0 = 170, PY1 = 300;
  if (ok) {
    const lo = Math.min(...lv), hi = Math.max(...lv);
    const x = i => PX0 + (PX1 - PX0) * i / (n - 1), y = v => (hi === lo ? (PY0 + PY1) / 2 : PY0 + (PY1 - PY0) * (hi - v) / (hi - lo));
    const P = lv.map((v, i) => [x(i), y(v)]), [x0, y0] = P[0], [xe, ye] = P[n - 1];
    const vF = num(lv[0]) + '원', vL = num(lv[n - 1]) + '원', room = MID - PAD - 14;
    const fs = Math.max(20, Math.min(30, Math.floor(Math.min(room / est(vF, 1), room / est(vL, 1)))));
    out.push(s('g', {class: 'mj-ends mj-in mj-in2', 'data-tag': 'ends'},
      T(PAD, VY, '첫날', 'mj-lab'), T(PAD, VY + 34, vF, 'mj-val', {'font-size': fs}),
      T(W - PAD, VY, '마지막 날', 'mj-lab', {'text-anchor': 'end'}), T(W - PAD, VY + 34, vL, 'mj-val', {'font-size': fs, 'text-anchor': 'end'})));
    const top = VY + 46; // 큰 숫자 아래 → 그 끝 점까지 가는 점선(어느 숫자가 어느 끝인지)
    const drop = [];
    if (y0 - 9 > top + 4) drop.push(R(x0, top, x0, y0 - 9, 'mj-drop'));
    if (ye - 14 > top + 4) drop.push(R(xe, top, xe, ye - 14, 'mj-drop'));
    const line = 'M' + P.map(q => f1(q[0]) + ' ' + f1(q[1])).join('L');
    out.push(s('g', {class: 'mj-plot', 'data-line': 'close'},
      s('path', {d: line + `L${f1(xe)} ${PY1 + 16}L${f1(x0)} ${PY1 + 16}Z`, fill: u('a'), class: 'mj-area'}),
      R(PX0, y0, PX1, y0, 'mj-base'), drop,
      s('path', {d: line, class: 'mj-path mj-draw', pathLength: 1}),
      s('circle', {cx: f1(x0), cy: f1(y0), r: 5, class: 'mj-start'}),
      s('g', {'data-end': 'last', class: 'mj-orb'}, // 끝 구슬 — 줄이 닿을 때 커지며 나타남
        s('circle', {cx: f1(xe), cy: f1(ye), r: 26, fill: u('h'), class: 'mj-halo'}), // 끝 구슬 둘레 빛(숨 쉼 · 390 안)
        s('circle', {cx: f1(xe), cy: f1(ye), r: 9.5, fill: u('b')}), s('circle', {cx: f1(xe - 3.4), cy: f1(ye - 3.6), r: 2, class: 'mj-glint'}), s('circle', {cx: f1(xe), cy: f1(ye), r: 8.9, class: 'mj-rim'}))));
    /* 3 오른 날 · 내린 날 한 줄 — 점 하나 = 하루(그 날 꺾은선 점 바로 아래) · 가는 선 위 */
    const SY = 334;
    out.push(s('g', {class: 'mj-road mj-fade mj-f2', 'data-legend': 'road'},
      R(PX0, SY, PX1, SY, 'mj-row'), R(x0, SY - 7, x0, SY + 7, 'mj-tick'),
      dd.map((v, i) => (v > 0 ? s('circle', {cx: f1(x(i + 1)), cy: SY, r: 5.5, class: 'mj-up'}) : v < 0 ? s('circle', {cx: f1(x(i + 1)), cy: SY, r: 4.8, class: 'mj-dn'}) : s('circle', {cx: f1(x(i + 1)), cy: SY, r: 2.6, class: 'mj-eq'})))));
  } else {
    out.push(s('g', {class: 'mj-plot', 'data-line': 'none'}, R(PX0, PY1, PX1, PY1, 'mj-row'), T(MID, (PY0 + PY1) / 2 + 8, '그날 마지막 값 ' + NEED, 'mj-d', {'text-anchor': 'middle'})));
  }

  /* 4 큰 숫자 둘 — 오른 날 | 내린 날(첫 페이지 「지금 | 될 듯」 과 같은 꼴) */
  const PY = 362;
  const big = (cx, v, word) => (ok ? [T(cx, PY + 96, String(v), 'mj-n', {'text-anchor': 'middle'}), T(cx + est(String(v), 58) / 2 + 4, PY + 96, '일', 'mj-unit')] : [T(cx, PY + 90, NEED, 'mj-d', {'text-anchor': 'middle'})]).concat(T(cx, PY + 124, word, 'mj-d', {'text-anchor': 'middle'}));
  out.push(s('g', {class: 'mj-pair mj-in mj-in3', 'data-tag': 'road'},
    R(MID, PY + 6, MID, PY + 128, 'mj-div'),
    s('circle', {cx: 74, cy: PY + 22, r: 7, class: 'mj-up'}), T(88, PY + 29, '오른 날', 'mj-k'), big(105, up, '전날보다 오른 날'),
    s('circle', {cx: 248, cy: PY + 22, r: 6.2, class: 'mj-dn'}), T(262, PY + 29, '내린 날', 'mj-k'), big(285, dn, '전날보다 내린 날')));
  let y = PY + 150;
  if (ok && eq) { const t = '값이 같은 날 ' + eq + '일', w = est(t, 18); out.push(s('g', {class: 'mj-in mj-in3', 'data-tag': 'same'}, s('circle', {cx: f1(MID - w / 2 - 6), cy: y + 2, r: 3, class: 'mj-eq'}), T(MID + 6, y + 8, t, 'mj-d', {'text-anchor': 'middle'}))); y += 30; }

  /* 5 닷새 동안 사고판 주식 수 — 가운데 세로줄 · 들어옴(+) 오른쪽 호박색 · 나감(−) 왼쪽 회색 · 길이 = 주식 수(가장 큰 값 = 가장 긴 막대) */
  const f = c && c.flows ? c.flows : {}, FL = [['외국인', f.foreign], ['기관', f.institution], ['개인', f.individual]];
  const fdays = fin(f.days) ? (f.days === 5 ? '닷새' : f.days + '거래일') : '닷새';
  const per2 = day(f.from) && day(f.to) ? day(f.from) + ' ~ ' + day(f.to) : '기간 ' + NEED;
  const R0 = y + 14, RY = R0 + 82, RH = 62;
  const vt = FL.map(([, v]) => (fin(v) ? shares(v) : NEED)), dir = FL.map(([, v]) => (fin(v) ? (v > 0 ? '들어옴' : v < 0 ? '나감' : '같음') : NEED));
  const nameR = PAD + Math.max(...FL.map(([nm], i) => Math.max(est(nm, 20), est(dir[i], 18)))), valL = W - PAD - Math.max(...vt.map((t, i) => est(t, fin(FL[i][1]) ? 22 : 18)));
  const AX = f1((nameR + valL) / 2), BM = Math.max(16, Math.min(64, (valL - nameR) / 2 - 18)), M = Math.max(0, ...FL.map(([, v]) => (fin(v) ? Math.abs(v) : 0)));
  out.push(s('g', {class: 'mj-flows mj-fade mj-f3', 'data-plate': 'flows'},
    R(PAD, R0, W - PAD, R0, 'mj-rule'),
    T(PAD, R0 + 40, fdays + ' 동안 사고판 주식 수', 'mj-kh'),
    T(PAD, R0 + 67, per2, 'mj-d', {'data-tag': 'period2'}),
    R(AX, RY + 10, AX, RY + 3 * RH - 10, 'mj-axis'),
    FL.map(([nm, v], i) => {
      const t = RY + i * RH, len = fin(v) && M > 0 && v !== 0 ? Math.max(4, BM * Math.abs(v) / M) : 0;
      return s('g', {'data-flow': nm},
        R(PAD, t, W - PAD, t, 'mj-line'),
        T(PAD, t + 29, nm, 'mj-name'), T(PAD, t + 52, dir[i], 'mj-d'),
        len ? s('rect', {x: f1(v > 0 ? AX : AX - len), y: t + 22, width: f1(len), height: 16, rx: 8, class: v > 0 ? 'mj-bin' : 'mj-bout'}) : null,
        T(W - PAD, t + 38, vt[i], fin(v) ? 'mj-fv' : 'mj-d', {'text-anchor': 'end'}));
    })));
  y = RY + 3 * RH;

  /* 6 1년 자리 — 가는 줄(1년 가장 낮은 값 ~ 가장 높은 값) 위 호박색 점 · 글은 옛 그림 그대로 */
  const p = c ? c.pos52 : null;
  const yTag = fin(p) ? (p >= 0.95 ? '1년 가장 높은 값 가까이' : '1년 100칸 가운데 ' + Math.round(p * 100) + '번째') : '1년 자리 ' + NEED;
  const Y0 = y, TX0 = PAD + 8, TX1 = W - PAD - 8, TY = Y0 + 70;
  out.push(s('g', {class: 'mj-year mj-fade mj-f4', 'data-tag': 'year'},
    R(PAD, Y0, W - PAD, Y0, 'mj-line'),
    T(PAD, Y0 + 40, yTag, fin(p) ? 'mj-kh' : 'mj-kh mj-need'),
    R(TX0, TY, TX1, TY, 'mj-track'),
    fin(p) ? s('circle', {cx: f1(TX0 + (TX1 - TX0) * Math.max(0, Math.min(1, p))), cy: TY, r: 8, class: 'mj-pos'}) : null,
    T(PAD, TY + 34, '1년 가장 낮은 값', 'mj-d'), T(W - PAD, TY + 34, '가장 높은 값', 'mj-d', {'text-anchor': 'end'})));
  y = TY + 52;

  /* 7 뉴스 수 — newsCount = 닷새 동안 나온 뉴스 모두 · newsNamed = 그 가운데 이 회사 이름이 나온 것(「왜?」 쪽 글과 같은 두 수) */
  const nc = c && c.news ? c.news.newsCount : null, nn = c && c.news ? c.news.newsNamed : null;
  out.push(s('g', {class: 'mj-news mj-fade mj-f4', 'data-tag': 'news'},
    R(PAD, y, W - PAD, y, 'mj-line'),
    T(PAD, y + 40, '닷새 동안 뉴스', 'mj-kh'), T(PAD, y + 66, fin(nn) ? '그 가운데 이 회사 이름이 나온 것 ' + num(nn) + '건' : '이 회사 이름이 나온 것 ' + NEED, 'mj-d'),
    T(W - PAD, y + 44, fin(nc) ? num(nc) + '건' : NEED, fin(nc) ? 'mj-fv mj-fvb' : 'mj-d', {'text-anchor': 'end'})));
  const H = Math.ceil(y + 90);
  out[0].setAttribute('height', H);

  /* 읽는 기계용 한 줄(옛 그림과 같은 글) */
  const say = [c && c.name ? c.name : NEED,
    ok ? '그날 마지막 값 ' + n + '개 · ' + (n - 1) + '거래일 · ' + (dt || NEED) + '까지 · 첫날 ' + num(lv[0]) + '원 · 마지막 날 ' + num(lv[n - 1]) + '원 · 오른 날 ' + up + ' · 내린 날 ' + dn : '그날 마지막 값 ' + NEED,
    fdays + ' 수급(사고판 주식 수) ' + FL.map(([nm, v]) => nm + ' ' + (fin(v) ? shares(v) : NEED)).join(' · '),
    fin(nc) ? '닷새 동안 뉴스 ' + num(nc) + '건' + (fin(nn) ? '(이 회사 이름이 나온 것 ' + num(nn) + '건)' : '') : '뉴스 ' + NEED, yTag].join(' · ');
  const svg = s('svg', {class: 'su-svg su-more-jobs' + (kind ? ' mj-k-' + kind : ''), viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opt && opt.label ? opt.label + ' · ' + say : say,
    preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'data-g': 'more-jobs'}, out);
  if (opt && opt.still) svg.classList.add('mj-still');
  return svg;
}
