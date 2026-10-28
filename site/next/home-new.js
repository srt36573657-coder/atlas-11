/* 새 첫 화면 칸들(사장님 2026-10-28(서울) 10:55 처음 본 사람의 말 · 11:12 「어」 — 첫 화면부터 처음 보는 사람 눈높이로 다시 짜기 · 11:21 「5배빨리해」
   · 12:00 「배경을 최고급 핑크로」 · 12:09 「글보다는 주식 도식화로 표현을 정말 많이해 대범하게 해」)
   명령문 docs/design/why-mock-2026-10-28/order-1055.txt · order-1112.txt · order-1200.txt · order-1209.txt — 글은 짧게 · 숫자는 그림으로 · 긴 풀이는 「읽는 법」 안에
   위에서 아래: 소개(코스피 석 달 그림) → 업종 지도(점 그림 · 네 자리 막대 · 조건 수별 막대) → 조건으로 고른 회사(기둥 둘 · 100만 원 막대 · 해마다 · 틀린 까닭 고리 · 날마다 · 고른 길 깔때기)
   → 오늘 시장(코스닥 석 달 · 오른 · 내린 회사 · 사고판 돈) → 사기 전 확인(네 걸음 그림) → 공식 안내
   숫자는 자료 그대로(home.json · theme-home.json · theme-bloom.json · 요약 파일) — 지어 채우지 않음 · 못 받으면 「?」
   글은 textContent 로만 · 색은 home-new.css(글 속 style 없음 · 너비만 CSSOM) · 그림은 svg(바둑판 셈 밖) · 앞날 말 없음 · 사고팔기 권하지 않음 */
import {RULE} from './theme-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const num = n => Number(n).toLocaleString('ko-KR');
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r0 = v => Math.round(v);
const md = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? `${+m[2]}월 ${+m[3]}일` : '?'; };
const mdS = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? `${+m[2]}.${+m[3]}` : '?'; };
const ym = d => { const m = /^(\d{4})-(\d{2})/.exec(String(d ?? '')); return m ? `${m[1]}년 ${+m[2]}월` : '?'; };
const won = v => num(Math.abs(Math.round(v))) + '원';
const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '');
const p2 = v => sgn(v) + Math.abs(v).toFixed(2) + '%';
const T = (s, x, y, t, cls, anchor = 'start') => { const e = sv('text', {class: cls, x: (+x).toFixed(1), y: (+y).toFixed(1), 'text-anchor': anchor}); e.textContent = t; s.append(e); return e; };
const svgBox = (cls, W, H, label) => sv('svg', {class: 'nh-svg ' + cls, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label});
/** 「읽는 법」 접은 칸 — 긴 풀이 글은 여기(처음에는 닫힘 · 그림이 먼저) */
const more = (...kids) => h('details', {class: 'nh-more'}, h('summary', {}, h('span', {text: '읽는 법'}), h('i', {'aria-hidden': 'true', text: '›'})), h('div', {class: 'nh-mbody'}, ...kids));

/** 네 자리 쉬운 이름(예전 이름은 「읽는 법」 한 줄로만) — 놓는 자리는 theme-rule.js zoneOf 그대로(가로 RULE.bloomX · 세로 0) */
export const ZNAME = Object.freeze({S: '막 오르기 시작', B: '한 달 내내 강함', W: '강하다 꺾임', Q: '조용함'});
const ZOLD = Object.freeze({S: '싹', B: '꽃', W: '시듦', Q: '잠잠'});
const ZORDER = ['S', 'B', 'Q', 'W']; // 위 왼쪽 · 위 오른쪽 · 아래 왼쪽 · 아래 오른쪽

/** 석 달 선 그림(지수 · 날마다 마감 값) — 칠한 넓이(한 색 · 옅게) · 가장 높은 · 낮은 날 점 · 마지막 값 */
function lineChart(x, {W = 340, H = 168, cls = 'nh-kc', name = ''} = {}) {
  const rows = (Array.isArray(x?.rows) ? x.rows : []).filter(r => Array.isArray(r) && fin(r[1]));
  if (rows.length < 2) return null;
  const L = 6, R = 6, Tp = 26, B = 26, pw = W - L - R, ph = H - Tp - B, vs = rows.map(r => r[1]), lo = Math.min(...vs), hi = Math.max(...vs), pad = (hi - lo) * 0.08 || 1;
  const sx = i => L + (i / (rows.length - 1)) * pw, sy = v => Tp + ((hi + pad - v) / (hi - lo + 2 * pad)) * ph;
  const s = svgBox(cls, W, H, `${name} 석 달 · ${md(rows[0][0])}부터 ${md(rows[rows.length - 1][0])}까지 · 마지막 ${num(r0(vs[vs.length - 1]))}`);
  const pts = rows.map((r, i) => `${sx(i).toFixed(1)},${sy(r[1]).toFixed(1)}`);
  s.append(sv('path', {class: 'nh-ka', d: `M${sx(0).toFixed(1)},${Tp + ph} L${pts.join(' L')} L${sx(rows.length - 1).toFixed(1)},${Tp + ph} Z`}), sv('path', {class: 'nh-kl', d: 'M' + pts.join(' L')}));
  const iHi = vs.indexOf(hi), iLo = vs.indexOf(lo), last = rows.length - 1;
  const mark = (i, t, up) => { const x = sx(i), y = sy(vs[i]); s.append(sv('circle', {class: 'nh-km', cx: x.toFixed(1), cy: y.toFixed(1), r: 4}));
    if (up) T(s, Math.min(Math.max(x, L + 46), W - R - 46), y - 9, t, 'nh-kt', 'middle'); else { const right = x < W * 0.6; T(s, right ? x + 9 : x - 9, y + 6, t, 'nh-kt', right ? 'start' : 'end'); } };
  mark(iHi, '높은 ' + num(r0(hi)), true); if (iLo !== iHi) mark(iLo, '낮은 ' + num(r0(lo)), false);
  s.append(sv('circle', {class: 'nh-klast', cx: sx(last).toFixed(1), cy: sy(vs[last]).toFixed(1), r: 6}));
  T(s, L, H - 4, mdS(rows[0][0]), 'nh-kd'); T(s, W - R, H - 4, mdS(rows[last][0]), 'nh-kd', 'end');
  return s;
}
/** 지수 칸 — 이름 · 마지막 값 · 하루 % · 석 달 그림 */
function idxCard(x, name, big = false) {
  const g = lineChart(x, {W: 340, H: big ? 168 : 132, name}); if (!g) return null;
  const c = fin(x.day) ? (Math.round(x.day * 100) === 0 ? 'fl' : x.day > 0 ? 'up' : 'dn') : '';
  return h('div', {class: 'nh-idx' + (big ? ' nh-idx-big' : ''), 'data-num': ''},
    h('div', {class: 'nh-ih'}, h('span', {class: 'nh-in', text: name + ' 석 달'}), h('b', {class: 'num nh-iv', text: fin(x.close) ? num(Math.round(x.close * 100) / 100) : '?'}), h('b', {class: 'num nh-ic ' + c, text: fin(x.day) ? p2(x.day) : '?'})), g);
}

/** 맨 위 소개 — 무엇을 하는 곳인지 · 숫자 셋 · 코스피 석 달 그림 · 권하지 않음 */
export function heroBox({coN = null, indN = null, years = null, kospi = null} = {}) {
  const fact = (v, label) => h('div', {class: 'nh-fact'}, h('b', {class: 'num', text: v == null ? '?' : num(v)}), h('span', {text: label})); // 큰 숫자는 숫자만(320 폭 한 줄 · 영어 엔진이 단위를 두 번 쓰지 않게)
  return h('section', {class: 'nh-hero', 'aria-label': '이 사이트 소개'},
    h('p', {class: 'nh-kick', text: '주식 지난 기록 확인'}),
    h('h2', {class: 'nh-h1'}, h('span', {text: '주식을 사기 전에,'}), ' ', h('span', {class: 'nh-acc', text: '지난 기록으로 한 번 더 확인하세요'})), // 한 줄 통째(영어 엔진이 문장을 나누지 않게)
    h('p', {class: 'nh-sub', text: '코스피와 코스닥 회사, 업종의 지난 기록을 숫자로 보여 드립니다.'}),
    h('div', {class: 'nh-facts', 'data-num': ''}, fact(coN, '회사'), fact(indN, '업종'), fact(years, '년 기록')),
    kospi ? idxCard(kospi, '코스피', true) : null,
    h('p', {class: 'nh-no', text: '앞날을 맞히거나 사고팔기를 권하지 않습니다.'}));
}

/** 업종 점 그림 — 점 하나 = 업종 하나 · 가로 = 최근 20거래일 시장보다 더 오른 정도(%p) · 세로 = 최근 5거래일 · 기준선 가로 RULE.bloomX · 세로 0 · 축 화살표와 뜻은 그림 안에 */
function plot(TH) {
  const I = (TH?.inds ?? []).filter(i => fin(i?.x) && fin(i?.y) && ZNAME[i.z]);
  const W = 340, H = 360, L = 28, Tp = 10, R = 8, B = 54, pw = W - L - R, ph = H - Tp - B;
  const X0 = Math.floor(Math.min(-5, ...I.map(i => i.x)) - 2), X1 = Math.ceil(Math.max(RULE.bloomX + 10, ...I.map(i => i.x)) + 2);
  const Y0 = Math.floor(Math.min(-5, ...I.map(i => i.y)) - 3), Y1 = Math.ceil(Math.max(5, ...I.map(i => i.y)) + 3.5); // 위 · 아래 이름 자리를 비움(점이 이름을 가리지 않게)
  const sx = x => L + ((x - X0) / (X1 - X0)) * pw, sy = y => Tp + ((Y1 - y) / (Y1 - Y0)) * ph, qx = sx(RULE.bloomX), qy = sy(0);
  const cnt = TH?.count ?? {};
  const s = svgBox('nh-plot', W, H, `업종 ${num(I.length)}개 점 그림 · ` + ZORDER.map(z => `${ZNAME[z]} ${fin(cnt[z]) ? cnt[z] : '?'}개`).join(' · '));
  const rect = (z, x, y, w, hh) => s.append(sv('rect', {class: 'nh-zq nh-zq-' + z, x: x.toFixed(1), y: y.toFixed(1), width: Math.max(0, w).toFixed(1), height: Math.max(0, hh).toFixed(1)}));
  rect('S', L, Tp, qx - L, qy - Tp); rect('B', qx, Tp, L + pw - qx, qy - Tp); rect('Q', L, qy, qx - L, Tp + ph - qy); rect('W', qx, qy, L + pw - qx, Tp + ph - qy);
  s.append(sv('line', {class: 'nh-zline', x1: qx.toFixed(1), y1: Tp, x2: qx.toFixed(1), y2: Tp + ph}), sv('line', {class: 'nh-zline', x1: L, y1: qy.toFixed(1), x2: L + pw, y2: qy.toFixed(1)}));
  // 지나온 길(조건 넷을 다 채운 곳 · 한 달 동안 가장 센 곳) — 옅은 선 · 처음 자리 작은 점
  const hiX = [...I].sort((a, b) => b.x - a.x)[0], lab = [...new Set([...I.filter(i => i.sc === 4), hiX].filter(Boolean))];
  for (const i of lab) { const t = (Array.isArray(i.t) ? i.t : []).filter(p => Array.isArray(p) && fin(p[0]) && fin(p[1])); if (t.length < 2) continue;
    s.append(sv('polyline', {class: 'nh-trail', points: t.map(p => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')}), sv('circle', {class: 'nh-trail0', cx: sx(t[0][0]).toFixed(1), cy: sy(t[0][1]).toFixed(1), r: 3})); }
  for (const i of I) s.append(sv('circle', {class: 'nh-dot nh-dot-' + i.z + (i.sc === 4 ? ' nh-dot4' : ''), cx: sx(i.x).toFixed(1), cy: sy(i.y).toFixed(1), r: i.sc === 4 ? 8 : 5.5}));
  T(s, L + 6, Tp + 20, `${ZNAME.S} ${fin(cnt.S) ? cnt.S : '?'}`, 'nh-zl nh-zl-S'); T(s, L + pw - 6, Tp + 20, `${ZNAME.B} ${fin(cnt.B) ? cnt.B : '?'}`, 'nh-zl nh-zl-B', 'end');
  T(s, L + 6, Tp + ph - 9, `${ZNAME.Q} ${fin(cnt.Q) ? cnt.Q : '?'}`, 'nh-zl nh-zl-Q'); T(s, L + pw - 6, Tp + ph - 9, `${ZNAME.W} ${fin(cnt.W) ? cnt.W : '?'}`, 'nh-zl nh-zl-W', 'end');
  for (const i of lab) { const x = sx(i.x), y = sy(i.y), right = x < L + pw * 0.62; T(s, right ? x + 11 : x - 11, y + 5, i.n, 'nh-dl', right ? 'start' : 'end'); }
  // 축 — 화살표와 기준 숫자를 그림 안에(글 풀이 대신)
  s.append(sv('line', {class: 'nh-axl', x1: L, y1: H - 22, x2: L + pw, y2: H - 22}), sv('path', {class: 'nh-axh', d: `M${L + pw - 7},${H - 26} L${L + pw},${H - 22} L${L + pw - 7},${H - 18}`}));
  T(s, L + pw - 10, H - 28, '한 달 동안 시장보다 더 오름', 'nh-axt', 'end'); T(s, qx, H - 3, `+${RULE.bloomX}%p`, 'nh-tick', 'middle');
  s.append(sv('line', {class: 'nh-axl', x1: 10, y1: Tp + ph, x2: 10, y2: Tp}), sv('path', {class: 'nh-axh', d: `M6,${Tp + 7} L10,${Tp} L14,${Tp + 7}`}));
  T(s, 20, Tp + ph * 0.26, '닷새 동안 더 오름', 'nh-axt nh-axv', 'middle').setAttribute('transform', `rotate(-90 20 ${(Tp + ph * 0.26).toFixed(1)})`); T(s, L - 4, qy + 4, '0', 'nh-tick', 'end');
  return {svg: s, n: I.length};
}
/** 네 자리 수 막대 — 한 줄 막대를 네 칸으로(이름 · 수) */
function zoneBar(cnt) {
  const tot = ZORDER.reduce((a, z) => a + (fin(cnt?.[z]) ? cnt[z] : 0), 0); if (!tot) return null;
  return h('div', {class: 'nh-cnt', role: 'img', 'aria-label': '네 자리 업종 수 · ' + ZORDER.map(z => `${ZNAME[z]} ${fin(cnt[z]) ? cnt[z] : 0}개`).join(' · ')},
    ...ZORDER.map(z => { const v = fin(cnt[z]) ? cnt[z] : 0, e = h('span', {class: 'nh-cz nh-cz-' + z}, h('b', {class: 'num', text: String(v)}), h('small', {text: ZNAME[z]})); e.style.flexGrow = String(Math.max(v, tot * 0.12)); return e; }));
}
/** 조건 수별 — 막 오르기 시작한 업종이 조건을 몇 개 채웠을 때 한 달 뒤 강해졌나(theme-engine.js recordOf byDots · 100번 가운데) */
function dotsChart(R) {
  const rows = (R?.byDots ?? []).map((b, k) => [k, b?.p]).filter(([, p]) => fin(p)); if (rows.length < 2 || !fin(R?.all?.p)) return null;
  const W = 340, H = 206, L = 8, B = 46, Tp = 28, cols = [...rows, ['all', R.all.p]], bw = (W - L * 2) / cols.length, max = Math.max(...cols.map(c => c[1])) * 1.15;
  const s = svgBox('nh-dots', W, H, '조건 수별 한 달 뒤 강해진 비율 · ' + cols.map(([k, p]) => `${k === 'all' ? '모든 업종' : '조건 ' + k + '개'} ${r0(p)}%`).join(' · '));
  cols.forEach(([k, p], i) => { const x = L + i * bw + bw * 0.18, w = bw * 0.64, hh = (p / max) * (H - Tp - B), y = H - B - hh;
    s.append(sv('rect', {class: 'nh-db ' + (k === 4 ? 'nh-db4' : k === 'all' ? 'nh-dball' : ''), x: x.toFixed(1), y: y.toFixed(1), width: w.toFixed(1), height: hh.toFixed(1), rx: 4}));
    T(s, x + w / 2, y - 6, r0(p) + '%', 'nh-dv' + (k === 4 ? ' nh-dv4' : ''), 'middle');
    T(s, x + w / 2, H - B + 20, k === 'all' ? '모든' : k + '개', 'nh-dk', 'middle'); if (k === 'all') T(s, x + w / 2, H - B + 40, '업종', 'nh-dk', 'middle'); });
  return s;
}

/** 업종 칸 — 둘이 물음(「?」로 끝남 · data-say) · 날짜 · 점 그림 · 네 자리 막대 · 조건 수별 막대 · 읽는 법 */
export function mapBox(TH, news = null) {
  if (!TH?.inds?.length) return h('section', {class: 'nh-sec nh-map', 'data-w': 'theme'}, h('h2', {class: 'nh-h2', 'data-say': '', text: '지금 업종은 어디쯤 있나요?'}), h('p', {class: 'nh-p', text: '? 업종 자료를 아직 못 받았습니다. 잠시 뒤 다시 열어 주세요.'}));
  const {svg, n} = plot(TH), cnt = TH.count ?? {}, real = TH.inds.filter(i => i.sc === 4).map(i => i.n), dc = dotsChart(TH.record);
  const ax = (k, t) => h('li', {}, h('b', {text: k}), h('span', {text: t}));
  return h('section', {class: 'nh-sec nh-map', 'data-w': 'theme', 'aria-label': '업종 점 그림'},
    h('h2', {class: 'nh-h2', 'data-say': '', text: `지금 업종 ${num(n)}개는 어디쯤 있나요?`}),
    h('p', {class: 'nh-d', text: `${md(TH.asOf)} 종가 기준 · 점 하나가 업종 하나`}), news,
    h('div', {class: 'nh-plotw'}, svg), zoneBar(cnt),
    h('ul', {class: 'nh-leg', 'aria-label': '네 자리 이름과 업종 수'}, ...ZORDER.map(z => h('li', {class: 'nh-lg nh-lg-' + z}, h('i', {'aria-hidden': 'true'}), h('span', {text: ZNAME[z]}), h('b', {class: 'num', text: fin(cnt[z]) ? cnt[z] + '개' : '?'})))),
    real.length ? h('p', {class: 'nh-real'}, h('span', {class: 'nh-rk', text: '조건 4개를 다 채운 업종'}), h('b', {text: real.join(', ')})) : h('p', {class: 'nh-real nh-real0'}, h('span', {class: 'nh-rk', text: '조건 4개를 다 채운 업종은 오늘 없습니다.'})),
    dc ? h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '조건을 많이 채울수록 한 달 뒤 강해졌나요?'}), dc, h('p', {class: 'nh-cap', text: '막 오르기 시작한 업종 · 100번 가운데'})) : null,
    more(
      h('ul', {class: 'nh-ax'},
        ax('가로', `최근 20거래일 동안 시장보다 더 오른 정도입니다. ${RULE.bloomX}%p를 넘으면 오른쪽입니다.`),
        ax('세로', '최근 5거래일 동안 시장보다 더 오른 정도입니다. 0을 넘으면 위쪽입니다.'),
        ax('%p', '업종이 오른 비율에서 시장이 오른 비율을 뺀 값입니다.')),
      h('p', {class: 'nh-old', text: '예전 이름: ' + ZORDER.map(z => `${ZOLD[z]} = ${ZNAME[z]}`).join(', ')}),
      h('ol', {class: 'nh-rl'},
        h('li', {text: '최근 5거래일 동안 시장보다 2%p 넘게 더 올랐습니다.'}),
        h('li', {text: '업종 회사 절반 넘게 최근 10거래일 동안 2% 넘게 올랐습니다.'}),
        h('li', {text: '업종에서 가장 큰 회사 3곳도 10거래일 평균 1% 넘게 올랐습니다.'}),
        h('li', {text: '업종 지수가 10거래일 전보다 높습니다.'}))),
    h('a', {class: 'nh-link', href: '#/f/ind'}, h('span', {text: `업종 ${num(n)}개 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'})));
}

/** 기둥 둘 — 고른 회사 · 모든 회사(같은 날 고를 수 있던 회사 전부) · 큰 숫자 위에 */
function cols2(title, a, b, kind) {
  const W = 160, H = 176, Tp = 32, B = 30, max = Math.max(a, b, 1) * 1.08, bw = 46;
  const s = svgBox('nh-c2 nh-c2-' + kind, W, H, `${title} · 조건으로 고른 회사 ${r0(a)}% · 모든 회사 ${r0(b)}%`);
  [[a, 'nh-me', '고른 회사'], [b, 'nh-all', '모든 회사']].forEach(([v, c, lb], i) => { const x = 18 + i * (bw + 30), hh = (v / max) * (H - Tp - B), y = H - B - hh;
    s.append(sv('rect', {class: 'nh-cb ' + c, x, y: y.toFixed(1), width: bw, height: hh.toFixed(1), rx: 6}));
    T(s, x + bw / 2, y - 8, r0(v) + '%', 'nh-cv ' + c, 'middle'); T(s, x + bw / 2, H - 7, lb, 'nh-cl', 'middle'); });
  return h('figure', {class: 'nh-fig'}, h('figcaption', {text: title}), s);
}
/** 100만 원 막대 — 가운데 0 에서 오른쪽 = 시장보다 더 · 왼쪽 = 덜 */
function wonBars(a, b) {
  const W = 340, H = 120, mid = 150, sc = 110 / Math.max(Math.abs(a), Math.abs(b), 1); // 가장 긴 막대 110 — 끝 글(+25,000원)이 그림 안에
  const s = svgBox('nh-won2', W, H, `100만 원어치 한 달 뒤 시장보다 · 조건으로 고른 회사 ${sgn(a)}${won(a)} · 모든 회사 ${sgn(b)}${won(b)}`);
  s.append(sv('line', {class: 'nh-wz', x1: mid, y1: 8, x2: mid, y2: H - 8}));
  [[a, 'nh-me', '고른 회사', 30], [b, 'nh-all', '모든 회사', 84]].forEach(([v, c, lb, y]) => { const w = Math.max(3, Math.abs(v) * sc), x = v >= 0 ? mid : mid - w;
    s.append(sv('rect', {class: 'nh-wb ' + c, x: x.toFixed(1), y: y - 14, width: w.toFixed(1), height: 28, rx: 5}));
    T(s, v >= 0 ? mid + w + 6 : mid - w - 6, y + 6, `${sgn(v)}${won(v)}`, 'nh-wv ' + c, v >= 0 ? 'start' : 'end'); T(s, v >= 0 ? mid - 8 : mid + 8, y + 6, lb, 'nh-wl', v >= 0 ? 'end' : 'start'); });
  return s;
}
/** 해마다 — 고른 회사 · 모든 회사 짝 기둥(시장보다 5% 넘게 더 오른 비율) · 고른 수가 적은 해는 옅게 */
function yearsChart(Y) {
  const ys = Object.keys(Y ?? {}).filter(k => /^\d{4}$/.test(k) && fin(Y[k]?.rate) && fin(Y[k]?.base)).sort(); if (ys.length < 2) return null;
  const W = 340, H = 200, Tp = 28, B = 46, gw = (W - 16) / ys.length, max = Math.max(...ys.flatMap(k => [Y[k].rate, Y[k].base])) * 1.15;
  const s = svgBox('nh-yrs', W, H, '해마다 시장보다 5% 넘게 더 오른 비율 · ' + ys.map(k => `${k}년 고른 회사 ${r0(Y[k].rate)}% 모든 회사 ${r0(Y[k].base)}%`).join(' · '));
  ys.forEach((k, i) => { const x0 = 8 + i * gw, bw = gw * 0.32, few = (Y[k].n ?? 0) < 200;
    [[Y[k].rate, 'nh-me'], [Y[k].base, 'nh-all']].forEach(([v, c], j) => { const x = x0 + gw * 0.12 + j * (bw + 6), hh = (v / max) * (H - Tp - B), y = H - B - hh;
      s.append(sv('rect', {class: 'nh-yb ' + c + (few ? ' nh-few' : ''), x: x.toFixed(1), y: y.toFixed(1), width: bw.toFixed(1), height: hh.toFixed(1), rx: 3}));
      T(s, x + bw / 2, y - 5, String(r0(v)), 'nh-yv ' + c, 'middle'); });
    T(s, x0 + gw / 2, H - B + 20, k + '년', 'nh-yk', 'middle'); T(s, x0 + gw / 2, H - B + 40, num(Y[k].n ?? 0) + '번', 'nh-yn', 'middle'); });
  return s;
}
/** 틀린 까닭 고리 — 셋(업종째 식음 · 조금 모자람 · 회사만 처짐) · 가운데 틀린 수 */
function donut(Wy) {
  const [w0, w1, w2] = Wy.why, tot = Wy.miss, parts = [[w1, 'nh-w1'], [w0, 'nh-w0'], [w2, 'nh-w2']], W = 150, c = 75, r = 54, L2 = 2 * Math.PI * r;
  const s = svgBox('nh-donut', W, W, `틀린 ${num(tot)}번의 까닭 · 업종째 식음 ${r0(w1 / tot * 100)}% · 조금 모자람 ${r0(w0 / tot * 100)}% · 회사만 처짐 ${r0(w2 / tot * 100)}%`);
  let off = 0;
  for (const [v, cls] of parts) { const len = (v / tot) * L2; s.append(sv('circle', {class: 'nh-dn ' + cls, cx: c, cy: c, r, 'stroke-dasharray': `${Math.max(0, len - 2).toFixed(1)} ${(L2 - Math.max(0, len - 2)).toFixed(1)}`, 'stroke-dashoffset': (-off).toFixed(1), transform: `rotate(-90 ${c} ${c})`})); off += len; }
  T(s, c, c - 2, num(tot), 'nh-dnv', 'middle'); T(s, c, c + 20, '번', 'nh-dnk', 'middle');
  return s;
}
/** 날마다 — 최근 60거래일 날마다 고른 수(기둥 높이) · 한 달 뒤 꽃이 됨 · 못 됨 · 아직 한 달 안 됨 */
function dayStrip(days) {
  const D = (Array.isArray(days) ? days : []).filter(d => d && typeof d.d === 'string'); if (D.length < 5) return null;
  const W = 340, H = 126, Tp = 8, B = 26, bw = (W - 8) / D.length, max = Math.max(1, ...D.map(d => d.n ?? 0));
  const s = svgBox('nh-days', W, H, `최근 ${D.length}거래일 날마다 고른 수 · 꽃이 됨 ${D.reduce((a, d) => a + (d.hit ?? 0), 0)}번 · 못 됨 ${D.reduce((a, d) => a + (d.miss ?? 0), 0)}번 · 아직 ${D.reduce((a, d) => a + (d.wait ?? 0), 0)}번`);
  const u = (H - Tp - B) / max;
  D.forEach((d, i) => { let y = H - B; const x = 4 + i * bw + 0.6, w = Math.max(1.5, bw - 1.2);
    for (const [v, cls] of [[d.hit, 'nh-sh'], [d.miss, 'nh-sm'], [d.wait, 'nh-sw']]) { if (!(v > 0)) continue; const hh = v * u; y -= hh; s.append(sv('rect', {class: 'nh-sb ' + cls, x: x.toFixed(1), y: y.toFixed(1), width: w.toFixed(1), height: hh.toFixed(1)})); }
    if (!(d.n > 0)) s.append(sv('rect', {class: 'nh-s0', x: x.toFixed(1), y: H - B - 2, width: w.toFixed(1), height: 2})); });
  T(s, 4, H - 4, mdS(D[0].d), 'nh-kd'); T(s, W - 4, H - 4, mdS(D[D.length - 1].d), 'nh-kd', 'end');
  return s;
}
/** 고른 길 깔때기 — 조건 후보 → 옛 기록 잣대를 넘은 것 → 추린 것 → 깊이 잰 셋 → 쓰는 하나(theme-bloom.json pick) */
function funnel(P) {
  if (!P || !Number.isInteger(P.n) || !Number.isInteger(P.ok) || !Number.isInteger(P.short) || !Array.isArray(P.three)) return null;
  const st = [[P.n, '후보'], [P.ok, '잣대 넘음'], [P.short, '추림'], [P.three.length, '깊이 잼'], [1, '지금 씀']], W = 340, rowH = 34, H = st.length * rowH + 4;
  const s = svgBox('nh-fun', W, H, '고르는 조건을 정한 길 · ' + st.map(([v, t]) => `${t} ${v}`).join(' · '));
  st.forEach(([v, t], i) => { const w = 54 + (W - 160) * Math.sqrt(v / P.n), x = (W - 96 - w) / 2, y = 2 + i * rowH;
    s.append(sv('rect', {class: 'nh-fb' + (i === st.length - 1 ? ' nh-fb1' : ''), x: x.toFixed(1), y, width: w.toFixed(1), height: rowH - 6, rx: 6}));
    T(s, x + w / 2, y + rowH / 2 + 2, num(v), 'nh-fv' + (i === st.length - 1 ? ' nh-fv1' : ''), 'middle'); T(s, W - 88, y + rowH / 2 + 4, t, 'nh-fl'); });
  return s;
}
/** 최근 두 달(기록 달력 가운데 한 달이 지난 날 — theme-home.js pickPQ 와 같은 셈) */
function recent(B) {
  const days = Array.isArray(B?.cal?.days) ? B.cal.days.filter(d => d && typeof d.d === 'string') : [];
  const done = days.filter(d => d.hit + d.miss > 0), sum = f => done.reduce((p, d) => p + (Number(f(d)) || 0), 0);
  const D = sum(d => d.hit + d.miss), N = sum(d => d.bn);
  return {P: D ? Math.round((sum(d => d.hit) / D) * 100) : null, Q: N ? Math.round((sum(d => d.bh) / N) * 100) : null, n: D};
}

/** 조건으로 고른 회사의 지난 기록 — 기둥 둘 둘 · 100만 원 막대 · 해마다 · 틀린 까닭 고리 · 날마다 · 고른 길 · 읽는 법 · 기록 쪽 고리 */
export function recordBox(B) {
  const R = B?.record?.all, Wy = B?.why?.all;
  const box = h('section', {class: 'nh-sec nh-rec', 'data-w': 'record', 'aria-label': '조건으로 고른 회사의 지난 기록'}, h('h2', {class: 'nh-h2', text: '조건으로 고른 회사, 지난 기록'}));
  if (!R || !fin(R.rate) || !fin(R.base) || !Number.isInteger(R.n)) { box.append(h('p', {class: 'nh-p', text: '? 지난 기록을 아직 못 받았습니다. 잠시 뒤 다시 열어 주세요.'}), recLinks()); return box; }
  box.append(h('p', {class: 'nh-d', text: `${ym(B.span?.from)}부터 ${ym(B.span?.to)}까지 ${num(R.n)}번 · 고른 날부터 한 달 뒤`}));
  box.append(h('div', {class: 'nh-c2w'}, cols2('시장보다 5% 넘게 더 오름', R.rate, R.base, 'up'), fin(R.fall) && fin(R.fallBase) ? cols2('시장보다 5% 넘게 뒤처짐', R.fall, R.fallBase, 'dn') : null));
  if (fin(R.ex) && fin(R.exBase)) box.append(h('div', {class: 'nh-chart nh-wonw'}, h('p', {class: 'nh-ck', text: '100만 원어치라면 한 달 뒤 시장보다'}), wonBars(R.ex * 10000, R.exBase * 10000), h('p', {class: 'nh-cap', text: '평균입니다 · 같은 결과가 다시 나온다는 뜻이 아닙니다'})));
  const yc = yearsChart(B.record?.years);
  if (yc) box.append(h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '해마다 · 시장보다 5% 넘게 더 오른 비율'}), yc, legend2()));
  if (Number.isInteger(Wy?.miss) && Wy.miss > 0 && Array.isArray(Wy.why) && Wy.why.length === 3) {
    const [w0, w1, w2] = Wy.why, p = v => Math.round((v / Wy.miss) * 100);
    box.append(h('div', {class: 'nh-chart nh-missw'}, h('p', {class: 'nh-ck', text: '5% 못 넘은 까닭'}),
      h('div', {class: 'nh-miss2'}, donut(Wy), h('ul', {class: 'nh-ml'}, ...[['nh-w1', '업종째 식음', w1], ['nh-w0', '조금 모자람', w0], ['nh-w2', '회사만 처짐', w2]].map(([c, t, v]) => h('li', {class: c}, h('i', {'aria-hidden': 'true'}), h('span', {class: 'nh-mt', text: t}), h('b', {class: 'num nh-mp', text: p(v) + '%'})))))));
  }
  const rc = recent(B), ds = dayStrip(B.cal?.days);
  if (ds) box.append(h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '최근 60거래일 · 날마다 고른 수'}), ds,
    h('ul', {class: 'nh-lg3', 'aria-hidden': 'true'}, h('li', {class: 'nh-l-sh'}, h('i'), h('span', {text: '꽃이 됨'})), h('li', {class: 'nh-l-sm'}, h('i'), h('span', {text: '못 됨'})), h('li', {class: 'nh-l-sw'}, h('i'), h('span', {text: '아직'})))));
  if (rc.P != null && rc.Q != null) box.append(h('div', {class: 'nh-warn' + (rc.P < rc.Q ? ' nh-worse' : '')}, h('p', {class: 'nh-wt', text: rc.P < rc.Q ? '최근 두 달은 모든 회사보다 못했습니다.' : '최근 두 달 기록입니다.'}),
    h('div', {class: 'nh-vs', 'data-num': ''}, h('span', {class: 'nh-vsa'}, h('b', {class: 'num', text: rc.P + '%'}), h('small', {text: '고른 회사'})), h('span', {class: 'nh-vsx', text: '대'}), h('span', {class: 'nh-vsb'}, h('b', {class: 'num', text: rc.Q + '%'}), h('small', {text: '모든 회사'})))));
  const fu = funnel(B.pick);
  if (fu) box.append(h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '고르는 조건은 이렇게 정했습니다'}), fu));
  box.append(more(
    h('p', {class: 'nh-how', text: '고르는 조건: 업종은 한 달 내내 강하고, 회사는 막 힘이 붙었고, 회사 값은 반년 가장 높은 값 가까이일 때 고릅니다.'}),
    h('p', {class: 'nh-p', text: '「시장보다 5% 넘게 더 오름」은 고른 날부터 한 달 뒤 값을 시장과 견준 것입니다.'}),
    h('ul', {class: 'nh-ml nh-ml2'},
      h('li', {class: 'nh-w1'}, h('i', {'aria-hidden': 'true'}), h('span', {class: 'nh-mt', text: '업종째 식음: 회사도 업종도 시장보다 덜 올랐습니다.'})),
      h('li', {class: 'nh-w0'}, h('i', {'aria-hidden': 'true'}), h('span', {class: 'nh-mt', text: '조금 모자람: 시장보다는 더 올랐지만 5%를 못 넘었습니다.'})),
      h('li', {class: 'nh-w2'}, h('i', {'aria-hidden': 'true'}), h('span', {class: 'nh-mt', text: '회사만 처짐: 업종은 괜찮았는데 회사만 시장보다 덜 올랐습니다.'})))));
  box.append(recLinks());
  return box;
}
const legend2 = () => h('ul', {class: 'nh-lg3', 'aria-hidden': 'true'}, h('li', {class: 'nh-l-me'}, h('i'), h('span', {text: '조건으로 고른 회사'})), h('li', {class: 'nh-l-all'}, h('i'), h('span', {text: '모든 회사'})));
const recLinks = () => h('div', {class: 'nh-links'},
  h('a', {class: 'nh-link', href: '#/t/pick'}, h('span', {text: '날짜별 기록과 고르는 법 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
  h('a', {class: 'nh-link', href: '#/t/picks'}, h('span', {text: '오늘 조건에 맞은 회사 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));

/** 사고판 돈 — 개인 · 외국인 · 기관 한 줄씩(이름 · 막대 길이 = 크기 · 빨강 = 더 산 돈 · 파랑 = 더 판 돈 · 값 글) — 억 원 */
function flowBars(F) {
  const x = F?.KOSPI ?? null; if (!x) return null;
  const who = [['개인', x.personal], ['외국인', x.foreign], ['기관', x.institutional]].filter(([, v]) => fin(v)); if (!who.length) return null;
  const W = 340, rowH = 42, H = who.length * rowH + 4, x0 = 62, maxW = 150, sc = maxW / Math.max(...who.map(([, v]) => Math.abs(v)), 1);
  const eok = v => { const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? num(j) + '조' + (r ? ' ' : '') : '') + (r || !j ? num(r) + '억' : ''); };
  const s = svgBox('nh-flow', W, H, `${md(x.date)} 코스피 사고판 돈 · ` + who.map(([n, v]) => `${n} ${v >= 0 ? '더 산 돈' : '더 판 돈'} ${eok(v)} 원`).join(' · '));
  who.forEach(([n, v], i) => { const y = 2 + i * rowH, w = Math.max(4, Math.abs(v) * sc), c = v >= 0 ? 'nh-buy' : 'nh-sell';
    T(s, 0, y + rowH / 2 + 2, n, 'nh-wl');
    s.append(sv('rect', {class: 'nh-fbar ' + c, x: x0, y: y + 6, width: w.toFixed(1), height: rowH - 16, rx: 5}));
    T(s, x0 + w + 8, y + rowH / 2 + 2, (v >= 0 ? '+' : '−') + eok(v), 'nh-fvv ' + c); });
  return s;
}
/** 오늘 시장 — app.js 가 만든 띠(data-w=today)와 시황 사실(data-w=news) · 코스닥 석 달 · 사고판 돈 */
export function mktBox(band, news, H = null) {
  const kq = H?.idx?.KOSDAQ ? idxCard(H.idx.KOSDAQ, '코스닥') : null, fl = flowBars(H?.flows);
  return h('section', {class: 'nh-sec nh-mkt', 'aria-label': '오늘 시장'}, h('h2', {class: 'nh-h2', text: '오늘 시장'}), band, kq, news,
    fl ? h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '코스피 · 누가 더 사고 팔았나'}), fl, h('ul', {class: 'nh-lg3', 'aria-hidden': 'true'}, h('li', {class: 'nh-l-buy'}, h('i'), h('span', {text: '더 산 돈'})), h('li', {class: 'nh-l-sell'}, h('i'), h('span', {text: '더 판 돈'})))) : null);
}

/** 사기 전에 확인하기 — 네 걸음 그림 · 첫 고리는 열한 질문 전 #/why · 다 답한 기기 #/gdr(본질 문 ④ — data-w=gdr 첫 고리) */
function steps4() {
  const st = [['1', '회사 고르기'], ['11', '질문 11개'], ['✓', '내 결과'], ['30', '한 달 뒤']], W = 340, H = 104, gw = W / st.length;
  const s = svgBox('nh-steps', W, H, '네 걸음 · ' + st.map(x => x[1]).join(' · '));
  st.forEach(([k, t], i) => { const cx = gw * i + gw / 2;
    if (i) s.append(sv('path', {class: 'nh-sarr', d: `M${(cx - gw + 30).toFixed(1)},34 L${(cx - 30).toFixed(1)},34 M${(cx - 37).toFixed(1)},28 L${(cx - 30).toFixed(1)},34 L${(cx - 37).toFixed(1)},40`}));
    s.append(sv('circle', {class: 'nh-sc' + (i === 1 ? ' nh-sc1' : ''), cx: cx.toFixed(1), cy: 34, r: 25}));
    T(s, cx, 41, k, 'nh-sk' + (i === 1 ? ' nh-sk1' : ''), 'middle'); T(s, cx, 88, t, 'nh-st', 'middle'); });
  return s;
}
export function whyBox({done = false, month = null} = {}) {
  const go = h('a', {class: 'nh-go', href: '#/why'}, h('span', {text: '「왜 사?」 시작하기'}), h('i', {'aria-hidden': 'true', text: '›'}));
  const back = done ? h('a', {class: 'nh-link', href: '#/gdr'}, h('span', {text: '지난 답 돌아보기'}), h('i', {'aria-hidden': 'true', text: '›'})) : null;
  return h('section', {class: 'nh-sec nh-why', 'data-w': 'gdr', 'aria-label': '사기 전에 확인하기'},
    h('h2', {class: 'nh-h2', text: '사기 전에 확인하기'}), steps4(),
    h('p', {class: 'nh-d', text: '약 2분 걸립니다. 답은 이 기기에만 남습니다.'}),
    back, go, month);
}

/** 맨 아래 공식 안내 — 본질 세 줄 칸(app.js essenceBox · data-w=ess)과 안내 두 줄 */
export function footBox(ess) {
  return h('section', {class: 'nh-foot', 'aria-label': '안내'},
    h('h2', {class: 'nh-fh', text: '안내'}), ess,
    h('p', {class: 'nh-fp', text: '이 사이트는 투자 자문이 아닙니다. 지난 기록은 앞날을 보장하지 않습니다.'}),
    h('p', {class: 'nh-fp', text: '투자 판단과 그 결과는 투자하는 사람에게 있습니다.'}));
}
