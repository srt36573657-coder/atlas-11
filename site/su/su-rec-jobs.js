/* 수르 — 기록 탭의 큰 그림 둘 · 잡스 판(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」)
   옛 무하 판(su-rec-art.js)과 같은 자료 · 같은 셈 · 같은 서랍 주소 — 그림만 첫 페이지(su-apple.js) 말투로 다시 그림
   ① 기록 한곳(#/r · arg 'hub') — 부제 두 줄 → 물건 하나: 100칸 구슬 판 둘(조건에 맞은 회사 = 호박색 빛나는 구슬 · 아무 회사 = 맑은 유리 구슬)
      su-fig.js waffle 과 같은 값 · 같은 칸 수 · 위 줄 왼쪽부터 채움 → 큰 숫자 둘(가는 세로선으로 나눔) → 짧은 안전 줄 → 서랍 여섯(두 칸씩 세 줄 · 가는 선)
      서랍 차례(토론으로 정함 · 그대로): 달마다 → 한 달 뒤 → 내 매매일지 → 못 된 까닭 → 날마다 → 옛 기록 더 보기(누르면 #/r/y)
      서랍 값은 su.js vHub 서랍과 같은 셈(su-six.js eMonths · eDays · eYears) · 한 달 뒤 = 매매일지의 「한 달 뒤 물은 기록」 수(su-why.js)
   ② 달마다(#/r/m · arg 'months') — 부제 두 줄 → 범례 한 줄 → 해마다 한 칸(굵은 선 · 해 이름) · 달마다 가는 막대 둘(호박색 = 고른 회사 · 회색 유리 = 아무 회사)
      su-fig.js cols 와 같은 값 · 같은 차례 · 같은 높이 비(막대 = 단 높이 × 값 ÷ 끝 값) · 아무 회사보다 못한 달 = 빈 호박색 막대(색만으로 가르지 않음) · 세는 중 = 고리 점(◎)
   부품 꼴(옛 부품과 같음): load(get, 'hub'|'months') · picture(d, opt) → svg 하나 · CSS
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-rec-jobs.css(움직임 줄이기면 끝 모습) · 흐림 필터 · 아무 수 0 · 사람 그림 · 덩굴 · 꽃 · 금 테 0 */
import {s} from '/su/su-fig.js';
import {NEED, num, eMonths, eDays, eYears} from '/su/su-six.js';

export const CSS = '/su/su-rec-jobs.css';
const B_URL = '/next/data/theme-bloom.json';
const W = 390, MID = W / 2;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const f1 = v => Math.round(v * 10) / 10;
let UID = 0;

/** 글 넓이 어림(굵은 글 · 한글 0.94em · 숫자 0.6em — 시험대 실측 0.91em 보다 조금 넉넉) — 점과 이름을 함께 가운데 둘 때 · 칸에 들어가는지 볼 때만 씀 */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch)) w += 0.94;
    else if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.7;
  }
  return w * px;
}
const T = (x, y, text, cls, extra = {}) => s('text', {x, y, class: cls, ...extra, text});
const MIDA = {'text-anchor': 'middle'};
/** 둥근 빛(radialGradient) — 색은 꾸밈 파일의 stop 클래스 */
const rg = (gid, stops, at = {}) => s('radialGradient', {id: gid, ...at}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
/** 가로 빛(linearGradient · 왼쪽 → 오른쪽) — 둥근 막대의 원기둥 빛 */
const lg = (gid, stops) => s('linearGradient', {id: gid, x1: 0, y1: 0, x2: 1, y2: 0}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
const root = (kind, H, label) => s('svg', {class: 'su-svg su-rec-jobs rj-' + kind, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'data-kind': kind});
/** 지금 빛(호박색 구슬 둘레 빛과 같은 네 단) */
const haloStops = [[0, 'rj-hl0'], [0.4, 'rj-hl1'], [0.72, 'rj-hl2'], [1, 'rj-hl3']];

/* ── 받기(옛 부품과 같은 자료 · 같은 셈) ── */
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
    {k: 'm', name: '달마다', href: '#/r/m', v: ms ? (ms.big.v ?? NEED) : NEED, unit: '달'},
    {k: 'later', name: '한 달 뒤', href: later ?? '#/j', v: fin(asked) ? asked + '번' : NEED},
    {k: 'j', name: '내 매매일지', href: '#/j', v: fin(mine) ? mine + '번' : NEED},
    {k: 'w', name: '못 된 이유', href: '#/r/w', v: num(miss) ? num(miss) + '번' : NEED},
    {k: 'd', name: '날마다', href: '#/r/d', v: dd?.big?.v != null ? dd.big.v + '날' : NEED},
    {k: 'y', name: '옛 기록 더 보기', href: '#/r/y', v: yy?.big?.v != null ? yy.big.v + ' 대 ' + yy.big.v2 : NEED, also: '#/r/n'}]; // 해마다 · 가까운 회사를 한 이름표로 — 값은 해마다(누르면 여는 쪽)
  return {kind, asOf, rate: hon?.rate ?? null, base: hon?.base ?? null, drawers};
}

/* ── 그리기 ── */
export function picture(d, opt = {}) {
  const id = 'rj' + (++UID) + (opt?.id ? '-' + opt.id : '');
  if (d?.kind === 'months') return d.rows?.length ? months(d, id) : need('months', id, '달마다 꽃이 된 횟수 · 확인 필요');
  return d && (fin(d.rate) || fin(d.base) || d.drawers?.length) ? hub(d, id) : need('hub', id, '100번에 몇 번 꽃이 됐나 · 확인 필요');
}

/** 자료를 못 받았을 때 — 같은 흰 판 · 빛 하나 · 「확인 필요」 */
function need(kind, id, label) {
  const H = 660, svg = root(kind, H, label);
  svg.append(s('defs', {}, rg(id + 'h', haloStops)), s('rect', {x: 0, y: 0, width: W, height: H, class: 'rj-bg'}),
    s('g', {class: 'rj-in rj-in1'},
      T(MID, 42, kind === 'months' ? '달마다 꽃이 된 횟수를' : '100번에 몇 번 꽃이 됐나?', 'rj-sub', MIDA),
      T(MID, 70, '셀 자료를 받지 못했어요.', 'rj-sub', MIDA)),
    s('circle', {cx: MID, cy: 300, r: 130, fill: `url(#${id}h)`, class: 'rj-halo'}),
    T(MID, 310, NEED, 'rj-need', MIDA),
    T(MID, 352, '잠시 뒤 다시 열어 보세요.', 'rj-safe', MIDA));
  return svg;
}

/* ① 기록 한곳 — 부제 → 100칸 구슬 판 둘 → 큰 숫자 둘 → 서랍 여섯(첫 화면 390 × 844 안에 모두 · 머리 줄 아래 625 안) → 안전 줄 */
function hub(d, id) {
  const H = 668;
  const okA = fin(d.rate), okB = fin(d.base), A = okA ? Math.round(d.rate) : 0, Bn = okB ? Math.round(d.base) : 0; // su-fig.js waffle 과 같은 반올림
  const tA = okA ? A + '번' : NEED, tB = okB ? Bn + '번' : NEED;
  const svg = root('hub', H, '기록 한곳 · 100번에 몇 번 꽃이 됐나 · 조건에 맞은 회사 ' + tA + ' · 아무 회사 ' + tB + ' · 아래에 기록 서랍 여섯');
  const u = k => `url(#${id}${k})`;
  svg.append(s('defs', {},
    rg(id + 'h', haloStops),
    rg(id + 'a', [[0, 'rj-b0'], [0.2, 'rj-b1'], [0.46, 'rj-b2'], [0.7, 'rj-b3'], [0.88, 'rj-b4'], [1, 'rj-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '38%', fy: '32%'}),
    rg(id + 'g', [[0, 'rj-g0'], [0.55, 'rj-g1'], [0.8, 'rj-g2'], [0.94, 'rj-g3'], [1, 'rj-g4']], {cx: '46%', cy: '42%', r: '58%', fx: '40%', fy: '34%'})),
  s('rect', {x: 0, y: 0, width: W, height: H, class: 'rj-bg'}));

  /* 1 부제 두 줄 */
  svg.append(s('g', {class: 'rj-top rj-in rj-in1'},
    T(MID, 42, '지난 기록으로 셌어요.', 'rj-sub', MIDA),
    T(MID, 70, '100번에 몇 번 꽃이 됐나?', 'rj-sub', MIDA)));

  /* 2 물건 하나 — 100칸 구슬 판 둘(위 줄 왼쪽부터 · 찬 칸 = 구슬 · 빈 칸 = 가는 고리) */
  const P = 17, R = 7, FY = 142, CX = [102, 288], KY = 116;
  const field = (cx, n, who, gid, cls) => {
    const x0 = cx - 4.5 * P;
    return s('g', {class: 'rj-grid', 'data-who': who, 'data-n': String(n)}, Array.from({length: 100}, (_, k) => {
      const on = k < n;
      return s('circle', {cx: f1(x0 + (k % 10) * P), cy: FY + Math.floor(k / 10) * P, r: on ? R : R - 0.6, fill: on ? u(gid) : null, class: on ? cls : 'rj-empty', 'data-cell': ''});
    }));
  };
  /** 이름 줄 — 점(호박색 찬 점 · 유리 고리 점)과 이름을 함께 가운데에 */
  const key = (cx, label, amber) => {
    const x0 = cx - (est(label, 20) + 22) / 2;
    return [s('circle', {cx: f1(x0 + 7), cy: KY - 7, r: amber ? 7 : 6.5, class: amber ? 'rj-dotA' : 'rj-dotB'}), T(f1(x0 + 22), KY, label, 'rj-key')];
  };
  const rowsA = Math.ceil(A / 10), keyX = CX[0] - (est('조건에 맞은 회사', 20) + 22) / 2 + 7; // 찬 줄 수 — 빛은 찬 구슬 둘레에만(빈 고리를 물들이지 않게) · 찬 구슬이 없으면 호박색 이름 점 둘레
  svg.append(rowsA ? s('ellipse', {cx: CX[0], cy: f1(FY + (rowsA - 1) * P / 2), rx: 112, ry: f1(rowsA * P / 2 + 38), fill: u('h'), class: 'rj-halo', 'aria-hidden': 'true'}) // 호박색 구슬 둘레 빛(숨 쉼 · 투명도만)
    : s('ellipse', {cx: f1(keyX), cy: KY - 7, rx: 40, ry: 30, fill: u('h'), class: 'rj-halo', 'aria-hidden': 'true'}));
  svg.append(s('path', {d: `M${MID} 94V380`, class: 'rj-div'}));
  svg.append(s('g', {class: 'rj-side rj-grow'}, key(CX[0], '조건에 맞은 회사', true), field(CX[0], A, 'pick', 'a', 'rj-amber')),
    s('g', {class: 'rj-side rj-grow rj-grow2'}, key(CX[1], '아무 회사', false), field(CX[1], Bn, 'any', 'g', 'rj-glass')));

  /* 3 큰 숫자 둘 — 숫자와 「번」을 한 글로(가운데 맞춤이 글꼴과 상관없이 맞음) */
  const big = (cx, ok, n) => (ok ? s('text', {x: cx, y: 370, class: 'rj-n', 'text-anchor': 'middle'}, s('tspan', {text: String(n)}), s('tspan', {class: 'rj-unit', dx: 4, text: '번'}))
    : T(cx, 362, NEED, 'rj-need', MIDA));
  svg.append(s('g', {class: 'rj-waffle rj-in rj-in2', 'aria-label': '100번에 몇 번 꽃이 됐나 · 조건에 맞은 회사 ' + tA + ' · 아무 회사 ' + tB, 'data-rate': okA ? String(d.rate) : '', 'data-base': okB ? String(d.base) : ''},
    big(CX[0], okA, A), big(CX[1], okB, Bn)));

  /* 4 서랍 여섯 — 두 칸씩 세 줄(왼 → 오른 · 위 → 아래 = 토론 차례) · 이름 · 값 · 꺾쇠 · 누름 칸 178 × 60 */
  const dr = (d.drawers ?? []).slice(0, 6), Y0 = 404, RH = 68, CWD = 172, XS = [20, 198], nR = Math.max(1, Math.ceil(dr.length / 2));
  const box = s('g', {class: 'rj-drawers rj-fade', 'aria-label': '기록 서랍 — 중요한 차례'});
  box.append(s('path', {d: `M20 ${Y0}H370`, class: 'rj-rule'}));
  for (let i = 1; i <= nR; i++) box.append(s('path', {d: `M20 ${Y0 + i * RH}H370`, class: 'rj-line'}));
  if (dr.length > 1) box.append(s('path', {d: `M${MID} ${Y0 + 12}V${Y0 + nR * RH - 12}`, class: 'rj-line'}));
  dr.forEach((x, i) => {
    const cx = XS[i % 2], cy = Y0 + Math.floor(i / 2) * RH, isNeed = x.v === NEED;
    const vt = isNeed ? NEED : x.unit && !String(x.v).endsWith(x.unit) ? x.v + x.unit : x.v; // 달마다 「13 · 8」 → 「13 · 8달」(쪽 머리 큰 값과 같은 단위)
    const small = est(x.name, 20) > CWD - 30; // 꺾쇠 앞까지 142 — 넘으면 18px
    box.append(s('a', {href: x.href, class: 'rj-lab rj-d' + (i + 1), 'aria-label': x.name + ' ' + x.v, 'data-k': x.k, 'data-v': x.v, 'data-also': x.also ?? null},
      s('rect', {x: cx - 6, y: cy + 4, width: CWD + 6, height: RH - 8, rx: 12, class: 'rj-hit'}),
      T(cx + 4, cy + 30, x.name, small ? 'rj-dn rj-dn18' : 'rj-dn'),
      T(cx + 4, cy + 57, vt, isNeed ? 'rj-dv rj-needv' : 'rj-dv'),
      s('path', {d: `M${cx + CWD - 17} ${cy + 27}l6 7l-6 7`, class: 'rj-chev'})));
  });
  svg.append(box);
  /* 5 안전 줄 — 맨 아래(쪽 맺음과 같은 뜻) */
  svg.append(T(MID, Y0 + nR * RH + 40, '지난 기록이에요. 앞날을 정해 주지 않아요.', 'rj-safe rj-in rj-in3', MIDA));
  return svg;
}

/* ② 달마다 — 부제 → 범례 → 해마다 한 칸(굵은 선 · 해 이름 · 세는 중 표) · 달마다 막대 둘 · 눈금 0 · 25 · 50 · 달 이름 */
/** 둥근 막대(위가 둥긂) — (x, y0) 밑동 왼쪽 · len 길이 · w 넓이 */
const rodD = (x, y0, len, w) => { const t = y0 - len, ry = Math.min(w / 2, len);
  return `M${f1(x)} ${f1(y0)}V${f1(t + ry)}A${f1(w / 2)} ${f1(ry)} 0 0 1 ${f1(x + w)} ${f1(t + ry)}V${f1(y0)}Z`; };
function months(d, id) {
  const rows = d.rows, M = Math.max(10, ...rows.flatMap(r => [r.v, r.v2]).filter(fin)); // cols 와 같은 끝 값
  const years = [...new Set(rows.map(r => String(r.key).slice(0, 4)))].sort(), nY = Math.max(1, years.length);
  const L = 51, R = 372, cw = (R - L) / 12, RW = 8, TOP0 = 132, HEAD = 48, FOOT = 38, GAP = 12, FOOT0 = 26; // 눈금 숫자 「50」이 왼쪽 20 에서 시작 · 달 한 칸 26.75
  const hB = Math.max(96, Math.floor((642 - FOOT0 - TOP0 - nY * (HEAD + FOOT) - (nY - 1) * GAP) / nY)); // 단 높이(두 해면 150 — 첫 화면 390 × 844 안에 두 해 모두) · 막대 높이 비는 그대로(높이 = hB × 값 ÷ 끝 값)
  const tops = years.map((_, i) => TOP0 + i * (HEAD + hB + FOOT + GAP)), H = TOP0 + nY * (HEAD + hB + FOOT) + (nY - 1) * GAP + FOOT0;
  const anyOpen = rows.some(r => r.open);
  const svg = root('months', H, '달마다 꽃이 된 횟수 · 해마다 한 칸 · 호박색 막대는 고른 회사 · 회색 유리 막대는 아무 회사 · 아무 회사보다 못한 달은 빈 막대' + (anyOpen ? ' · 세는 중인 달은 고리 점' : ''));
  const u = k => `url(#${id}${k})`;
  svg.append(s('defs', {},
    lg(id + 'ra', [[0, 'rj-ra0'], [0.36, 'rj-ra1'], [1, 'rj-ra2']]),
    lg(id + 'rg', [[0, 'rj-rg0'], [0.36, 'rj-rg1'], [1, 'rj-rg2']]),
    lg(id + 'w', [[0, 'rj-w0'], [0.5, 'rj-w1'], [1, 'rj-w0']])),
  s('rect', {x: 0, y: 0, width: W, height: H, class: 'rj-bg'}));

  /* 1 부제 두 줄 */
  svg.append(s('g', {class: 'rj-top rj-in rj-in1'},
    T(MID, 42, '달마다 100번에 몇 번 꽃이 됐나,', 'rj-sub', MIDA),
    T(MID, 70, '아무 회사와 나란히 놓았어요.', 'rj-sub', MIDA)));

  /* 2 범례 한 줄 — 찬 호박색 = 고른 회사 · 회색 유리 = 아무 회사 · 빈 호박색 = 못한 달 */
  const LG = [['a', '고른 회사'], ['g', '아무 회사'], ['h', '못한 달']], IW = 16, LGAP = 22, LY = 110;
  const lw = LG.map(([, t]) => IW + est(t, 18)), tot = lw.reduce((a, b) => a + b, 0) + LGAP * (LG.length - 1);
  const legend = s('g', {class: 'rj-legend rj-in rj-in2'});
  let lx = MID - tot / 2;
  LG.forEach(([k, t], j) => {
    legend.append(k === 'h' ? s('path', {d: rodD(lx + 0.8, LY + 1, 17.2, RW - 1.6), class: 'rj-hollow'}) : s('path', {d: rodD(lx, LY + 1, 18, RW), fill: u(k === 'a' ? 'ra' : 'rg'), class: k === 'a' ? 'rj-rodA' : 'rj-rodB'}),
      T(f1(lx + IW), LY, t, 'rj-lg'));
    lx += lw[j] + LGAP;
  });
  svg.append(legend);

  /* 3 해마다 한 칸 — 막대는 cols 와 같은 값 · 같은 차례 · 같은 높이 비 */
  const halo = s('g', {class: 'rj-halo', 'aria-hidden': 'true'}); // 찬 호박색 막대 둘레 옅은 빛(숨 쉼 · 투명도만)
  const chart = s('g', {class: 'rj-cols', 'data-max': String(M), 'data-h': String(hB)});
  let order = 0;
  years.forEach((yv, i) => {
    const top = tops[i], y0 = top + HEAD + hB, yy = v => y0 - hB * Math.min(1, Math.max(0, v) / M), open = [];
    const pg = s('g', {class: 'rj-panel rj-fade' + (i ? ' rj-fade2' : ''), 'data-year': yv});
    pg.append(s('path', {d: `M20 ${top}H370`, class: 'rj-rule'}), T(20, top + 32, yv + '년', 'rj-yr'));
    for (const g of [25, 50].filter(v => v <= M)) pg.append(s('path', {d: `M${L - 2} ${f1(yy(g))}H${R}`, class: 'rj-gridl'}));
    for (const g of [0, 25, 50].filter(v => v <= M)) pg.append(T(L - 10, f1(yy(g) + 6), String(g), 'rj-gl', {'text-anchor': 'end'}));
    pg.append(s('path', {d: `M${L - 2} ${y0}H${R}`, class: 'rj-axis'}));
    chart.append(pg);
    rows.forEach(r => {
      if (String(r.key).slice(0, 4) !== yv) return;
      const mo = +String(r.key).slice(5, 7), cx = L + cw * (mo - 1) + cw / 2, worse = fin(r.v) && fin(r.v2) && r.v < r.v2 && !r.open, k = order++;
      const len = fin(r.v) ? f1(hB * Math.min(1, Math.max(0, r.v) / M)) : null, len2 = fin(r.v2) ? f1(hB * Math.min(1, Math.max(0, r.v2) / M)) : null;
      const tip = r.open ? 'bud' : worse ? 'closed' : 'flower', xa = cx - RW - 1, xb = cx + 1;
      const rods = s('g', {class: 'rj-rods rj-rise' + (i ? ' rj-rise2' : '')});
      if (len2 != null) rods.append(s('path', {d: rodD(xb, y0, Math.max(0.6, len2), RW), fill: u('rg'), class: 'rj-rodB'}));
      if (len != null && !r.open) {
        if (len <= 0.6) rods.append(s('path', {d: `M${f1(xa)} ${f1(y0 - 1)}h${RW}`, class: 'rj-flat'})); // 0번 — 밑줄 위 짧은 호박색 줄
        else if (worse) rods.append(s('path', {d: rodD(xa + 0.8, y0, len - 0.8, RW - 1.6), class: 'rj-hollow'}));
        else { rods.append(s('path', {d: rodD(xa, y0, len, RW), fill: u('ra'), class: 'rj-rodA'})); halo.append(s('rect', {x: f1(xa - 6), y: f1(y0 - len - 5), width: RW + 12, height: f1(len + 5), rx: 10, fill: u('w')})); }
      }
      if (r.open) { // 세는 중 — 값이 있으면 점선 막대 · 그 위에 고리 점(◎ — 첫 페이지 「될 듯 · 아직」과 같은 꼴)
        const l0 = len ?? 0, cy = y0 - l0 - 9;
        if (l0 > 0.6) rods.append(s('path', {d: rodD(xa + 0.7, y0, l0 - 0.7, RW - 1.4), class: 'rj-dash'}));
        rods.append(s('circle', {cx: f1(xa + RW / 2 - 1), cy: f1(cy), r: 6, class: 'rj-ring'}), s('circle', {cx: f1(xa + RW / 2 - 1), cy: f1(cy), r: 2.4, class: 'rj-ember'}));
        open.push(mo);
      }
      chart.append(s('g', {class: 'rj-mo' + (worse ? ' rj-sq' : ''), 'data-k': r.key, 'data-i': String(k), 'data-v': fin(r.v) ? String(r.v) : '', 'data-v2': fin(r.v2) ? String(r.v2) : '', 'data-len': len == null ? '' : String(len), 'data-tip': tip},
        rods, T(f1(cx), y0 + 26, String(mo), 'rj-mn', mo > 9 ? {...MIDA, textLength: 19, lengthAdjust: 'spacingAndGlyphs'} : MIDA))); // 두 자리 달은 글자 폭만 조금 좁혀 띄움(글씨 18px 그대로 · 옛 판과 같은 수)
    });
    if (open.length) { // 해 이름 줄 오른쪽 — 「◎ 10월 세는 중」(막대 · 달 이름과 떨어진 자리)
      const t = open.join(' · ') + '월 세는 중', x = 370 - est(t, 18) - 16;
      chart.append(s('g', {class: 'rj-openk'}, s('circle', {cx: f1(x + 6), cy: top + 26, r: 6, class: 'rj-ring'}), s('circle', {cx: f1(x + 6), cy: top + 26, r: 2.4, class: 'rj-ember'}),
        T(370, top + 32, t, 'rj-open', {'text-anchor': 'end'})));
    }
  });
  svg.append(halo, chart);
  return svg;
}
