/* 손자병법 다른 쪽 — 꾀 모음 · 꾀 한 가지 · 회사 · 정산(주문 1115-2328 · 빈 파일에서 새로 씀 · 첫 쪽과 같은 기준 = 샘플 사 「화제와 도장」)
   사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 물음 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답
   · 앞 말씀 17:43 「… 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」(원문 docs/design/sonja-ink-2026-11-15/order-2328.txt)
   길 다섯 화면: 1 오늘(#/ · su-sonja.js) → 2 꾀(#/k/g01 ~ g36) → 3 회사(#/c/<번호>) → 4 「왜 사?」(#/q/<번호> · su-why.js) → 5 내 매매일지(#/j)
   탭 쪽: 꾀 모음(#/k · 여섯 묶음 × 여섯 꾀) · 정산(#/r/t · 서른여섯 꾀 표만 — 옛 여덟 묶음 · 겹친 곳은 지움)
   자료: su21.json(형세 · 덜 잃은 차례 · 첫 화면과 같은 판) · su21-s36.json(꾀 이름 · 뜻 · 고르는 법 · 오늘 일곱 곳 · 한 달 값) · su21-settle.json(10주씩 산 셈 · 가짜 돈) · 회사 자료 /atlas/data/co/<번호>.json(이름 · 시장)
   앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · 「%」 0(「100원이 ○원」) · 늘어도 줄어도 같은 크기 · 모양 + 글(색만으로 뜻 0)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NAME, josa} from '/next/brand.js';
import {kstText} from '/next/essence.js';
import {hardLeft} from '/su/su-word.js';
import {topBar, stepTag, endSec, dockNav, tabNav, meanCap} from '/su/su-sonja-top.js';
import {PIC, PM} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {STORY36, ACTS, STORY_TAG} from '/su/su-sonja-story.js'; // 그림 속 이야기 네 막(주문 1117-0102 — 36초짜리 한 편 · 막마다 한 줄 · 감정)
import {D36, DST, load21, n36of, okSun, sp36, rec36, chip, spark, head, endSeal, chev, mday, ym, day, w100, monOf, MONW, none36, fin, funnel36, eqBox, trSpark} from '/su/su-sonja.js';
import {base36} from '/su/su-sonja-36.js'; // 꾀 칸 자료를 못 받은 날의 바탕 글(su21_s36.py 그대로)
import {kkoePic, ridgePic, heroPic, brushBar, sonmuPic} from '/su/su-sonja-ink.js'; // 먹그림(주문 1116-0118 — 손무의 이야기: 제3장 꾀를 펼치다 · 제4장 성을 살피다 · 장부 · 병서)
import {kkoeTile} from '/su/su-sonja.js';
import {stance3, STANCES} from '/su/su-stance.js'; // 세 태세(주문 1120-0728 · 꾀 쪽 맨 위 표지 — 주문 1120-0950)
import {picksOf, monthLow, dayCounts} from '/su/su-picks.js'; // 여러 꾀가 고른 회사(주문 1120-0950) · 회사 쪽 날마다 고른 꾀 수(주문 1120-1040)
/** 그림 속 이야기 네 막(주문 1117-0102) — 큰 그림 바로 아래 · 그림이 그 막에 오면 그 줄이 밝아짐(꾸밈 sj-story) */
const storyOl = k => STORY36[k] ? h('ol', {class: 'sj-story', 'aria-label': STORY_TAG}, ...STORY36[k].map((t, i) => h('li', {'data-act': String(i + 1)}, h('b', {class: 'sj-actt', text: ACTS[i]}), h('span', {class: 'sj-actb', text: t})))) : null;

const CODE = /^[0-9A-Z]{6}$/;
export const KKOE = /^g(0[1-9]|[12]\d|3[0-6])$/;
const K36 = Object.freeze(Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')));
const SETW = ['이김', '맞섬', '공격', '혼란', '연합', '패배']; // 여섯 묶음 머리 붓 글씨(묶음 이름은 자료 set 그대로)
const NF = new Intl.NumberFormat('ko-KR');
const coUrl = c => '/atlas/data/co/' + c + '.json';

/* ── 자료 ── */
/** 꾀 칸 자료(su21-s36.json)가 쓸 만한가 — 이름 · 뜻 · 고르는 법 · 묶음이 서른여섯 모두 있음 */
const okG = g => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && g.kinds.every((k, i) => k === K36[i])
  && ['name', 'han', 'mean', 'say', 'set'].every(f => g[f] && K36.every(k => typeof g[f][k] === 'string' && g[f][k])) && !!g.lists && typeof g.lists === 'object';
/** 꾀 칸 자료 — 첫 화면 자료(su21.json)에 꾀 수(s36n)가 있을 때만 받음(없는 날 404 를 부르지 않음) · 못 받거나 꼴이 틀리면 바탕 글(오늘 고른 곳 0 · fallback) */
const g36Of = async (X, T) => { const g = n36of(T) != null ? await X.get(D36) : null; return okG(g) ? g : base36(); };
/** 덜 잃은 차례 — {k: {…기록, i: 차례}} · 형세가 없으면 빈 것 */
const rankOf = T => (okSun(T?.sun) && new Set(T.sun.rank.map(r => r.k)).size === 36 ? Object.fromEntries(T.sun.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {});
const kNo = k => +k.slice(1); // 제 몇 계
/** 돈 — 「196만 1,000원」 · 「4,500원」(억 · 만 자리) */
export const won = v => {
  if (!fin(v)) return '?';
  const a = Math.round(Math.abs(v)), e = Math.floor(a / 1e8), m = Math.floor((a % 1e8) / 1e4), r = a % 1e4;
  return [e ? NF.format(e) + '억' : '', m ? NF.format(m) + '만' : '', r || (!e && !m) ? NF.format(r) : ''].filter(Boolean).join(' ') + '원';
};
/** 늘고 준 말 — 「11만 4,000원 늘었어요」 · 「그대로예요」 */
export const moved = d => (!fin(d) ? '?' : Math.round(d) > 0 ? won(d) + ' 늘었어요' : Math.round(d) < 0 ? won(d) + ' 줄었어요' : '그대로예요');
const SHAPE = Object.freeze({up: '▲', dn: '▼', eq: '―', one: '○', none: '·'});
const SAID = Object.freeze({one: '아직 하루밖에 안 지났어요', none: '아직 산 적이 없어요'});

/** 정산 장부(su21-settle.json) → 산 셈 줄 — {day, k, code, name, buy, now, nowDay, cost, val, one}(지금 = 그 회사 가장 늦은 값 · 산 날 뒤 값이 없으면 아직 하루치) */
export function settleRows(D) {
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return [];
  const q = Number.isFinite(D.qty) ? D.qty : 10;
  return D.buys.filter(b => Array.isArray(b) && KKOE.test(D.kinds[b[1]] ?? '') && fin(b[3]) && b[3] > 0).map(([dd, ki, code, buy]) => {
    const [now, nowDay] = Array.isArray(D.now?.[code]) && fin(D.now[code][0]) ? D.now[code] : [buy, dd], [name] = D.co?.[code] ?? [code];
    return {day: dd, k: D.kinds[ki], code, name: name ?? code, buy, now, nowDay, cost: buy * q, val: now * q, one: !(nowDay > dd)};
  });
}
/** 더함 — 산 돈 · 지금 · 늘고 준 돈 · 모양(모두 아직 하루치면 one · 늘고 줆은 반올림한 원으로) */
export function sumOf(rs) {
  const cost = rs.reduce((a, r) => a + r.cost, 0), val = rs.reduce((a, r) => a + r.val, 0), diff = val - cost, one = rs.length > 0 && rs.every(r => r.one);
  return {n: rs.length, days: new Set(rs.map(r => r.day)).size, cost, val, diff, one, st: !rs.length ? 'none' : one ? 'one' : Math.round(diff) > 0 ? 'up' : Math.round(diff) < 0 ? 'dn' : 'eq'};
}
/** 늘고 준 몫(산 돈에 견줘 · 백만에 하나까지) — 하루치 · 산 셈 없음은 null */
export const rateOf = g => (g.n && g.cost > 0 && !g.one ? Math.round((g.val - g.cost) / g.cost * 1e6) : null);
/** 꾀마다 — 서른여섯 모두(산 셈이 없는 꾀도) · 수익이 높은 차례(본질 8번 · 주문 1113-2224 「정산표에는 수익율이 높은 순으로」) · 같으면 꾀 차례 · 하루치 · 산 셈 없음은 맨 아래 */
export function settle36(D) {
  const rows = settleRows(D), by = new Map(K36.map(k => [k, []]));
  for (const r of rows) by.get(r.k)?.push(r);
  const K = K36.map(k => ({key: k, ...sumOf(by.get(k))}));
  K.sort((a, b) => (rateOf(a) === null) - (rateOf(b) === null) || (rateOf(b) ?? 0) - (rateOf(a) ?? 0) || K36.indexOf(a.key) - K36.indexOf(b.key));
  const miss = K36.reduce((a, k) => a + (Number.isInteger(D?.miss?.[k]) ? D.miss[k] : 0), 0);
  return {rows, K, T: sumOf(rows), miss, asOf: typeof D?.asOf === 'string' ? D.asOf : null};
}
const resText = g => (g.st === 'none' ? SAID.none : g.st === 'one' ? SAID.one : moved(g.diff));
const shapeI = st => h('i', {class: 'sj-shp sj-shp-' + st, 'aria-hidden': 'true', text: SHAPE[st] ?? ''});

/* ── 날마다 바뀐 차례(주문 1119-0243 · 사장님 2026-11-19(마카오) 02:43 「그 순위가 매일 매일 어떻게 변화하는지 잡스라면 어떻개 표현할까」 · 02:46 「응」
   — docs/design/settle-rank-2026-11-19/order-0243.txt) — 한 가지만 크게: 맨 위 한 줄(지금 맨 위 · 며칠째) · 줄마다 앞 장날보다 오르내린 칸 · 날짜를 누르면 자리를 바꾸는 위 열 ── */
/** 지난 날 차례(장부가 셈 · D.rk) + 지금 차례(settle36 · 이 쪽과 같은 셈) → {days, order, move(꾀 → 오른 칸 · 앞 날이 없으면 null), top(맨 위 며칠째), prevDay} · 앞 장날이 없으면 null */
export function rankMoves(D, K) {
  const R = D?.rk, today = typeof D?.asOf === 'string' ? D.asOf : null;
  if (!today || !R || !Array.isArray(R.days) || !Array.isArray(R.order) || R.days.length !== R.order.length || !K.some(x => rateOf(x) !== null)) return null;
  const days = [], order = [], ok = o => Array.isArray(o) && o.length === 36 && new Set(o).size === 36 && o.every(j => Number.isInteger(j) && j >= 0 && j < 36);
  R.days.forEach((d, i) => { if (typeof d === 'string' && d < today && ok(R.order[i])) { days.push(d); order.push(R.order[i]); } });
  if (!days.length) return null;
  const cur = K.map(x => K36.indexOf(x.key)), prev = order[order.length - 1];
  days.push(today); order.push(cur);
  let top = 1; for (let i = order.length - 2; i >= 0 && order[i][0] === cur[0]; i--) top++;
  return {days, order, top, prevDay: days[days.length - 2], move: new Map(K.map((x, i) => [x.key, prev.indexOf(K36.indexOf(x.key)) - i]))};
}
/* ── 쌓인 값 꺾은선(주문 1119-0829 · 사장님 2026-11-19(마카오) 08:29 「하루치는 알수 있으나 누적값을 알수가 없다 … 꺽기 그래프는 기존이 되어야 하고
   … 추적 시스템은 정말 소중한 데이타가 된다 … 탈무드에 지혜를 학습해」 · 08:43 「응」 — docs/design/settle-track-2026-11-19/order-0829.txt)
   랍비 아키바의 물방울(하루 한 방울보다 쌓인 값) — 꺾은선이 기본 그림 · 꾀마다 처음 넣은 100원이 날마다 얼마가 됐는지 · 지난 날은 날마다 기록(장부 · 지문으로 이은 줄) · 오늘은 이 쪽이 센 값 ── */
/** {days, w(날마다 꾀 차례대로 100원이 ○원 · 산 셈 없으면 null)} · 지난 날이 없으면 null */
export function trackOf(D, K) {
  const T = D?.tr, today = typeof D?.asOf === 'string' ? D.asOf : null;
  if (!today || !T || !Array.isArray(T.days) || !Array.isArray(T.w) || T.days.length !== T.w.length) return null;
  const days = [], w = [];
  T.days.forEach((d, i) => { const x = T.w[i]; if (typeof d === 'string' && d < today && Array.isArray(x) && x.length === 36) { days.push(d); w.push(x.map(v => (Number.isFinite(v) && v > 0 ? v / 1e4 : null))); } }); // w = 100원이 ○원 × 10000(주문 1119-1317)
  if (!days.length) return null;
  const by = new Map(K.map(x => [x.key, x]));
  days.push(today); w.push(K36.map(k => { const x = by.get(k); return x && x.n && x.cost > 0 ? 100 * x.val / x.cost : null; }));
  return {days, w};
}
/** 쌓인 값 꺾은선 그림 — hi = [[꾀, 'sj-trkt'(먹 진한 선) | 'sj-trkl'(남빛 선)]…] · 나머지 옅은 선 · 점선 = 처음 넣은 100원 · 강조 선 끝 점 */
function trackSvg(TK, hi) {
  const W = 340, H = 200, PX = 10, PT = 12, PB = 12, n = TK.days.length, all = TK.w.flat().filter(v => v != null), on = hi.map(([k]) => k);
  const lo = Math.min(100, ...all), up = Math.max(100, ...all), pad = Math.max(0.15, (up - lo) * 0.1), y0 = lo - pad, y1 = up + pad;
  const x = i => PX + (W - 2 * PX) * i / (n - 1), y = v => PT + (H - PT - PB) * (1 - (v - y0) / (y1 - y0)), f = v => Math.round(v * 10) / 10;
  const pts = j => TK.w.map((r, i) => (r[j] == null ? null : [f(x(i)), f(y(r[j]))])).filter(Boolean);
  const line = (j, cls) => { const p = pts(j); return p.length > 1 ? s('polyline', {points: p.map(q => q.join(',')).join(' '), class: cls}) : null; };
  const g = s('svg', {class: 'sj-trk', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('path', {d: `M${PX} ${f(y(100))}H${W - PX}`, class: 'sj-trk0'}));
  K36.forEach((k, j) => { if (!on.includes(k)) { const p = line(j, 'sj-trkf'); if (p) g.append(p); } });
  for (const [k, cls] of hi) { const j = K36.indexOf(k), p = line(j, cls), e = pts(j).at(-1); if (p) g.append(p, s('circle', {cx: e[0], cy: e[1], r: 4.2, class: cls + 'e'})); }
  return g;
}
const trackDays2 = TK => h('p', {class: 'sj-trkd', 'aria-hidden': 'true'}, h('span', {text: mday(TK.days[0])}), h('span', {text: mday(TK.days[TK.days.length - 1])}));
/** 쌓인 값 꺾은선(정산 쪽) — 먹 진한 선 = 지금 위 세 꾀 · 남빛 선 = 지금 맨 아래 꾀 · 옅은 선 = 나머지 · 점선 = 처음 넣은 100원 · 글은 그림 밖(크게) */
function trackChart(TK, K, nameOf) {
  const n = TK.days.length, rated = K.filter(g => rateOf(g) !== null), top = rated.slice(0, 3).map(g => g.key), low = rated.length > 3 ? rated[rated.length - 1].key : null;
  const now = k => TK.w[n - 1][K36.indexOf(k)], say = k => '「' + nameOf(k) + '」 100원이 ' + w100(now(k) / 100 - 1);
  return h('figure', {class: 'sj-trkf-box', 'data-days': String(n), 'aria-label': '쌓인 값 꺾은선 · ' + mday(TK.days[0]) + '부터 ' + mday(TK.days[n - 1]) + '까지 · ' + [...top, low].filter(Boolean).map(say).join(' · ')},
    h('p', {class: 'sj-trkh', text: '처음 넣은 100원이 날마다 얼마가 됐는지 이었어요.'}),
    trackSvg(TK, [...(low ? [[low, 'sj-trkl']] : []), ...top.map(k => [k, 'sj-trkt'])]), trackDays2(TK),
    h('ul', {class: 'sj-trkg'}, ...top.map(k => h('li', {'data-m': 'top'}, h('i', {class: 'sj-trks sj-trks-t', 'aria-hidden': 'true'}), h('span', {text: say(k)}))),
      low ? h('li', {'data-m': 'low'}, h('i', {class: 'sj-trks sj-trks-l', 'aria-hidden': 'true'}), h('span', {text: say(low)})) : null),
    h('p', {class: 'sj-trkn', text: '진한 먹 선은 지금 위 세 꾀예요. 남빛 선은 지금 맨 아래 꾀예요.'}),
    h('p', {class: 'sj-trkn', text: '옅은 선은 나머지 꾀예요. 점선은 처음 넣은 100원이에요.'}));
}
/** 이 꾀의 쌓인 값 꺾은선(꾀 쪽 제4장 · 주문 1119-1005 · 사장님 2026-11-19(마카오) 10:05 「응」 — 물음 「꾀 쪽에도 그 꾀의 쌓인 값 꺾은선을 보여 줄까요?」)
 *  먹 진한 선 = 이 꾀 · 옅은 선 = 다른 꾀 서른다섯 · 점선 = 처음 넣은 100원 · 이 꾀에 산 셈이 없으면 그리지 않음 */
export function kkoeTrack(TK, k) {
  const n = TK?.days?.length ?? 0, v = n ? TK.w[n - 1][K36.indexOf(k)] : null;
  if (n < 2 || v == null || TK.w.filter(r => r[K36.indexOf(k)] != null).length < 2) return null;
  return h('figure', {class: 'sj-trkf-box sj-ktrk', 'data-days': String(n), 'aria-label': '이 꾀의 쌓인 값 꺾은선 · ' + mday(TK.days[0]) + '부터 ' + mday(TK.days[n - 1]) + '까지 · 처음 넣은 100원이 지금 ' + w100(v / 100 - 1)},
    h('p', {class: 'sj-trkh', text: '이 꾀의 100원이 날마다 얼마가 됐는지 이었어요.'}),
    trackSvg(TK, [[k, 'sj-trkt']]), trackDays2(TK),
    h('p', {class: 'sj-trkv', text: '처음 넣은 100원이 지금 ' + w100(v / 100 - 1) + '이에요.'}),
    h('p', {class: 'sj-trkn', text: '먹 선이 이 꾀예요. 옅은 선은 다른 꾀예요. 점선은 처음 넣은 100원이에요.'}));
}
/** 꾀 줄마다 쌓인 값 작은 꺾은선(이미 있는 「한 달 꺾은선」 모양 그대로 — 처음 100원 점선 · 끝 점 늘면 먹 · 줄면 남빛) */
const trackSpark = (TK, k) => { const sp = TK ? TK.w.map(r => r[K36.indexOf(k)]).filter(v => v != null) : []; return sp.length > 1 ? spark(sp, 72, 26, 'sj-stsp') : null; };
/** 오르내린 칸 표 — ▲3 · ▼2 · ―(그대로) */
const mvMark = mv => h('span', {class: 'sj-stm', 'data-m': mv > 0 ? 'up' : mv < 0 ? 'dn' : 'eq', 'aria-hidden': 'true', text: mv > 0 ? '▲' + mv : mv < 0 ? '▼' + -mv : '―'});
const mvSay = mv => (mv > 0 ? '앞 장날보다 ' + mv + '칸 올랐어요' : mv < 0 ? '앞 장날보다 ' + -mv + '칸 내렸어요' : '앞 장날과 같은 자리예요');
/** 맨 위 한 줄 — 지금 맨 위 꾀 · 며칠째(이틀 넘게) 또는 앞 장날 몇 번째였는지 */
export const topSay = (M, nameOf) => {
  const k = K36[M.order[M.order.length - 1][0]], p = M.order[M.order.length - 2].indexOf(K36.indexOf(k));
  return '지금 맨 위는 「' + nameOf(k) + '」예요. ' + (M.top > 1 ? M.top + '일째 맨 위예요.' : mday(M.prevDay) + '에는 ' + (p + 1) + '번째였어요.');
};
/** 날마다 바뀐 차례 — 날짜 단추 · 처음부터 보기 · 위 열(날을 바꾸면 자리를 옮겨 감 · 움직임 줄이기면 바로) */
function rankRace(M, nameOf) {
  const N = 10, last = M.days.length - 1, ol = h('ol', {class: 'sj-drl'});
  const chips = M.days.map((d, i) => h('button', {type: 'button', class: 'sj-drd', 'aria-pressed': i === last ? 'true' : 'false', text: mday(d)}));
  const play = h('button', {type: 'button', class: 'sj-drp', text: '▶ 처음부터 보기'});
  const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = (i, anim) => {
    const was = new Map([...ol.children].map(li => [li.getAttribute('data-k'), li.getBoundingClientRect().top])), pv = i > 0 ? M.order[i - 1] : null;
    const rows = M.order[i].slice(0, N).map((j, r) => { const mv = pv ? pv.indexOf(j) - r : null;
      return h('li', {class: 'sj-drr', 'data-k': K36[j], 'aria-label': (r + 1) + '번째 · ' + nameOf(K36[j]) + (pv ? ' · ' + mvSay(mv) : '')},
        h('span', {class: 'sj-drn', 'aria-hidden': 'true', text: String(r + 1)}), h('b', {class: 'sj-drk', text: nameOf(K36[j])}), pv ? mvMark(mv) : null); });
    ol.replaceChildren(...rows);
    chips.forEach((c, x) => c.setAttribute('aria-pressed', x === i ? 'true' : 'false'));
    if (anim && !calm()) for (const li of rows) { const b = was.get(li.getAttribute('data-k')), a = li.getBoundingClientRect().top;
      li.animate(b == null ? [{opacity: 0, transform: 'translateY(28px)'}, {opacity: 1, transform: 'none'}] : [{transform: 'translateY(' + (b - a) + 'px)'}, {transform: 'none'}], {duration: 560, easing: 'cubic-bezier(.2,.7,.2,1)'}); }
  };
  let tm = null; const stop = () => { if (tm) { clearTimeout(tm); tm = null; } };
  chips.forEach((c, i) => c.addEventListener('click', () => { stop(); draw(i, true); }));
  play.addEventListener('click', () => { stop(); let i = 0; draw(0, true); const go = () => { i++; if (i > last) { tm = null; return; } draw(i, true); tm = setTimeout(go, 1400); }; tm = setTimeout(go, 1400); });
  draw(last, false);
  return h('section', {class: 'sj-sec sj-dr', 'aria-label': '날마다 바뀐 차례', 'data-days': String(M.days.length)},
    head('셈', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '날마다 바뀐 차례'}))),
    h('p', {class: 'sj-drt', text: '날짜를 누르면 그날 차례로 바뀌어요. 위 열 가지만 보여요.'}),
    h('div', {class: 'sj-drds'}, ...chips), play, ol);
}

/* ── 쪽 틀 ── */
/** 쪽 하나 — 머리 줄 · main(쪽 이름 data-page) · 이야기 막대 · 탭 · 풀이 없이 남은 어려운 낱말 셈(main data-hard) */
function frame({title, page, kids, step = null, next = null, tab = -1, lc = null, attrs = {}}) {
  const main = h('main', {class: 'sj-page sj-sub', 'data-page': page, ...attrs}, ...kids);
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = '';
  return {title, dom: [topBar(), main, dockNav(step, next), tabNav(tab, lc)]};
}
/** 쪽 머리 — 걸음 · 작은 머리 글 · 큰 제목(도장) · 말씀 · 읽어 줄 한 줄 */
function pageHead({step = null, dd = null, kick, h1, proper = false, seal = null, sealDn = false, quote = null, say = null, pic = null, more = [], top = null}) {
  return h('section', {class: 'sj-sec sj-ph', 'aria-label': h1},
    step ? stepTag(step, dd) : null,
    h('p', {class: 'sj-k', text: kick}),
    top, // 맨 위 표지(주문 1120-0950 — 오늘 세 태세 가운데 이 꾀의 자리)
    h('div', {class: 'sj-today'}, h('h1', {class: 'sj-h1', ...(proper ? {'data-proper': ''} : {})}, h('b', {class: 'sj-land', text: h1})),
      seal ? h('span', {class: 'sj-seal sj-seal-big ' + (sealDn ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: seal}) : null),
    pic,
    quote ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + quote[0] + '」'}), h('cite', {text: quote[1]})) : null,
    say ? h('div', {class: 'sj-says'}, h('p', {class: 'sj-do', 'data-say': '', text: say})) : null, // 손무 얼굴 칸은 첫 쪽에만(주문 1120-0001 · 참모 m02 「되풀이 칸」 — 쪽마다 같은 얼굴 · 그림 뜻을 지우고 말 글만) // 손무가 들려주는 한 줄(이야기의 한 사람) · 맨 위 그림 뜻
    ...more);
}
const goLink = (href, t) => h('a', {class: 'sj-go', href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'}));
const gotOf = S => (S?.fetchedAt ? kstText(S.fetchedAt) : null);
/** 자료를 못 받은 쪽 · 없는 쪽 — 같은 판 · 처음으로 */
function missPage(X, title, say) {
  return frame({title, page: 'miss', tab: -1, lc: X.cur?.()?.code ?? null, kids: [pageHead({kick: NAME, h1: '찾지 못했어요', say}), h('section', {class: 'sj-sec'}, goLink('#/', '처음으로 · 오늘 시장 보기')), endSec(NEED_DAY)]});
}
const NEED_DAY = '확인 필요';

/* ── 꾀 한 줄(꾀 모음 · 회사 쪽) ── */
function kkoeRow(g, k, r, extra = null) {
  return h('li', {class: 'sj-kr', 'data-k': k, 'data-rank': r ? String(r.i) : null},
    meanCap(PIC[k]), kkoeTile(k, g.name[k], 'sj-kpic', 120, 90), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
    h('a', {class: 'sj-ka', href: '#/k/' + k, 'aria-label': '제' + kNo(k) + '계 · ' + g.name[k] + (r ? ' · 오늘 덜 잃은 차례 ' + r.i + '번째' : '')},
      h('span', {class: 'sj-kno', text: '제' + kNo(k) + '계'}),
      h('span', {class: 'sj-kt'}, h('b', {text: g.name[k]}), h('span', {class: 'sj-khan', text: g.han[k]})),
      r ? h('span', {class: 'sj-krk', text: r.i + '번째'}) : null, h('i', {'aria-hidden': 'true', text: '›'})), // 「○위」 대신 「○번째」(쓰지 않을 말 「1위」 — 수익 순위로 읽히지 않게)
    trSpark(g, k), // 쌓인 값 작은 꺾은선 — 누르지 않아도(주문 1119-1317)
    h('p', {class: 'sj-kmean', text: g.mean[k]}), extra);
}

/* ── 꾀 모음(#/k) ── */
export async function vKkoeAll(X) {
  const [T, {S}] = await Promise.all([load21(X.get), X.base()]), g = await g36Of(X, T);
  const RB = rankOf(T), sun = okSun(T?.sun) ? T.sun : null, first = sun?.rank[0]?.k ?? null;
  const sets = []; for (let i = 0; i < 6; i++) sets.push(K36.slice(i * 6, i * 6 + 6));
  const kids = [
    pageHead({kick: '삼십육계 · 여섯 묶음', h1: '병법 서른여섯 가지', seal: '꾀', quote: sun?.rankQ?.quote ? [sun.rankQ.quote, '손자병법 ' + (sun.rankQ.pian ?? '')] : null,
      say: '삼십육계는 옛날부터 전해 오는 꾀 서른여섯 가지예요. 여섯 묶음에 꾀가 여섯 가지씩 있어요.' + (sun ? ' 지금 같은 ' + sun.name + '에서 덜 잃은 차례도 함께 적었어요.' : ''),
      more: [h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.book, 'figcaption'), heroPic('book')), h('p', {class: 'sj-lead', text: '꾀 그림이나 이름을 누르면, 그 꾀를 자세히 볼 수 있어요.'})]}),
    ...sets.map((ks, i) => h('section', {class: 'sj-sec sj-kset', 'data-set': String(i + 1), 'aria-label': g.set[ks[0]]},
      head(SETW[i], '제' + (i + 1) + '묶음', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: g.set[ks[0]]})), i % 2 === 1),
      h('ol', {class: 'sj-kl'}, ...ks.map(k => kkoeRow(g, k, RB[k]))),
      endSeal(SETW[i]))),
    h('section', {class: 'sj-sec sj-pkin'}, goLink('#/o', '여러 꾀가 고른 회사 보기')), // 주문 1120-0950
    h('p', {class: 'sj-safe sj-sec', text: '꾀 이름과 뜻은 옛 병법 그대로예요. 차례는 지난 기록으로 정했어요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title: '서른여섯 꾀', page: 'kkoes', kids, tab: 1, lc: X.cur?.()?.code ?? null,
    next: first ? {href: '#/k/' + first, label: '맨 위 꾀는 어떤 꾀일까?'} : {href: '#/k/g01', label: '첫째 꾀는 어떤 꾀일까?'}});
}

/* ── 꾀 한 가지(#/k/g01 ~ g36) ── */
export async function vKkoe(X, k) {
  if (!KKOE.test(k)) return missPage(X, '꾀', '이 꾀를 찾지 못했어요.');
  const [T, D, {S}] = await Promise.all([load21(X.get), X.get(DST), X.base()]), g = await g36Of(X, T);
  const RB = rankOf(T), r = RB[k] ?? null, sun = okSun(T?.sun) ? T.sun : null, H = sun?.hist ?? null;
  const S3 = sun ? stance3(sun) : null, my = S3 ? STANCES.find(d => S3[d.st]?.k === k) ?? null : null; // 오늘 세 태세 가운데 이 꾀의 자리(주문 1120-0950)
  const L = (Array.isArray(g.lists[k]) ? g.lists[k] : []).filter(c => CODE.test(String(c?.code ?? ''))).slice(0, 7), bd = mday(g.asOf?.board), dd = mday(g.asOf?.data) ?? bd;
  const anySp = L.some(c => sp36(g, c.code)), vol = g.by?.[k] === 'vol';
  const ST = D && Array.isArray(D.buys) ? settle36(D) : null, me = ST?.K.find(x => x.key === k) ?? null, meAt = me ? ST.K.indexOf(me) + 1 : null
  const TK = ST ? trackOf(D, ST.K) : null; // 이 꾀의 쌓인 값(주문 1119-1005)
  const order = sun ? sun.rank.map(x => x.k) : K36, at = order.indexOf(k), prev = at > 0 ? order[at - 1] : null, nxt = at >= 0 && at < order.length - 1 ? order[at + 1] : null;
  const kids = [
    pageHead({step: 2, dd: bd, kick: '삼십육계 제' + kNo(k) + '계 · ' + g.set[k], h1: g.name[k], seal: r ? '차례 ' + r.i : '꾀', sealDn: sun?.land === 'fall',
      quote: [g.mean[k], '삼십육계 제' + kNo(k) + '계 ' + g.han[k]],
      pic: h('figure', {class: 'sj-ink sj-kfig'}, meanCap(PIC[k], 'figcaption'), kkoePic(k, {w: 390, h: 292, label: g.name[k] + ' 그림'}), storyOl(k)),
      top: my ? h('a', {class: 'sj-kst3', href: '#/', 'data-st': my.st}, h('span', {class: 'sj-tsg', text: my.tag}), h('span', {class: 'sj-kst3t', text: '오늘 ' + sun.name + '의 ' + my.tag + ' 꾀예요. ' + my.say + '로 골랐어요.'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      say: sun ? (r?.n ? '지금은 ' + sun.name + '이에요. 예전에 이런 시장이었을 때, 이 꾀는 서른여섯 꾀 가운데 ' + r.i + '번째로 덜 잃었어요.' : '지금은 ' + sun.name + '이에요. 이 꾀는 지난 기록을 세지 못해서 맨 아래에 놓았어요.') : '오늘 시장 모습은 아직 세지 못했어요. 그래서 꾀를 원래 차례대로 놓았어요.'}),
    h('section', {class: 'sj-sec sj-kway', 'aria-label': '주식에서는 이렇게 골라요'},
      head('법', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '주식에서는 이렇게 골라요'}))),
      h('p', {class: 'sj-lead', 'data-say': '', text: g.say[k]}),
      vol ? h('p', {class: 'sj-note', text: '이 꾀는 그날 사고판 양 자료가 있어야 고를 수 있어요.'}) : null,
      funnel36(g, k), // 세 거름을 지난 수(주문 1116-1539 — 소거 · 꾀 뜻 · 흉내 내 보기를 모두 지난 곳만)
      eqBox(k), // 꾀 점수 풀이(주문 1116-2134 — 수학 식 · 정서 식 · 이렇게 해서 찾아낸 회사)
      h('details', {class: 'sj-drawer sj-src'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이름과 고르는 법은 어디서 왔나요'}), chev()),
        h('p', {class: 'sj-note', text: '꾀 이름과 뜻은 옛 병법 그대로예요. 고르는 법은 ' + josa(NAME, '가') + ' 그 뜻을 주식 값에 빗대어 정했어요.'})),
      endSeal('법')),
    h('section', {class: 'sj-sec sj-krec', 'aria-label': '이 꾀의 지난 기록'},
      head('기록', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이 꾀의 지난 기록'})), true),
      ...(r ? rec36(r, true) : [h('p', {class: 'sj-tl sj-tnorec', text: '오늘 시장 모습을 아직 세지 못해서, 지난 기록이 없어요.'})]),
      sun && H ? h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이렇게 셌어요'}), chev()),
        h('p', {class: 'sj-rule', text: (H.all ? '장이 열린 날로 지난 ' + H.days + '일을 모두 봤어요. ' : '장이 열린 날로 지난 ' + H.days + '일을 봤어요. 그 가운데 오늘처럼 ' + sun.name + '이었던 ' + H.same + '일을 골랐어요. ')
          + '그날마다 이 꾀가 고른 회사 일곱 곳의 닷새 뒤 값을 봤어요.' + (ym(H.from) && ym(H.to) ? ' 센 기간은 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}),
        h('p', {class: 'sj-note', text: '화살 열 개는 지난 기록을 열 번으로 줄여 그린 거예요. 꺾인 화살이 잃은 때예요.'})) : null,
      h('p', {class: 'sj-safe', text: '지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('기록')),
    h('section', {class: 'sj-sec sj-kco', 'aria-label': '이렇게 해서 찾아낸 회사', 'data-n': String(L.length)}, // 주문 1116-2134 「이헎개 해서 찾아낸 종목이라고 하라」
      head('곳', '제3장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이렇게 해서 찾아낸 회사'}), h('span', {class: 'sj-h2n', text: ' ' + L.length + '곳'}))),
      h('p', {class: 'sj-dayl', text: (L.length ? '제1장의 식으로 점수를 매겨 찾아낸 회사예요. ' : '') + (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '회사 이름 옆 꺾은선은 한 달 동안의 값이에요. 점선은 한 달 전 값이에요. ' : '') + '사도 된다는 뜻이 아니에요.'}),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: g.fallback ? '오늘 고른 회사 자료를 아직 받지 못했어요.' : none36(g.why?.[k])}),
      endSeal('곳')),
    me ? h('section', {class: 'sj-sec sj-kst', 'aria-label': '이 꾀 정산', 'data-st': me.st},
      head('셈', '제4장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이 꾀 정산'})), true),
      h('p', {class: 'sj-lead', text: (mday(ST.rows.map(x => x.day).sort()[0]) ? mday(ST.rows.map(x => x.day).sort()[0]) + '부터 ' : '') + '날마다 이 꾀가 고른 회사를 10주씩 샀다고 치고 셌어요. 진짜 돈이 아니에요.'}),
      h('dl', {class: 'sj-money'}, h('dt', {text: '산 돈'}), h('dd', {text: won(me.cost)}), h('dt', {text: '지금'}), h('dd', {text: me.n ? won(me.val) : SAID.none})),
      h('p', {class: 'sj-res', 'data-st': me.st}, shapeI(me.st), h('b', {text: resText(me)})),
      TK ? kkoeTrack(TK, k) : null, // 이 꾀의 쌓인 값 꺾은선(주문 1119-1005)
      meAt && rateOf(me) !== null ? h('p', {class: 'sj-note', text: '정산 표에서 서른여섯 꾀 가운데 ' + meAt + '번째예요. 돈이 많이 늘어난 꾀가 위에 있어요.'}) : null,
      goLink('#/r/t', '서른여섯 꾀 정산 보기'),
      endSeal('셈')) : null,
    h('nav', {class: 'sj-sec sj-kpn', 'aria-label': '앞뒤 꾀'},
      prev ? h('a', {class: 'sj-kp', href: '#/k/' + prev}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: (sun ? at + '번째 · ' : '') + g.name[prev]})) : null,
      nxt ? h('a', {class: 'sj-kp sj-kn', href: '#/k/' + nxt}, h('span', {text: (sun ? (at + 2) + '번째 · ' : '') + g.name[nxt]}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      goLink('#/k', '서른여섯 꾀 모두 보기')),
    endSec(day(g.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  const c0 = L[0] ?? null;
  return frame({title: g.name[k], page: 'kkoe', attrs: {'data-k': k}, kids, step: 2, tab: 1, lc: X.cur?.()?.code ?? null,
    next: c0 ? {href: '#/c/' + c0.code, k: '3 / 5', label: '이 꾀가 고른 ' + josa(String(c0.name ?? '첫 회사'), '는') + ' 어떤 회사일까?'} : {href: '#/q', k: '4 / 5', label: '사기 전에 한 번 멈출까?'}});
}

/* ── 회사(#/c/<번호>) ── */
/** 한 달 사이 가장 깊이 빠진 때(주문 1117-1120 · 샘플 다 「손실 먼저」) — 그날 마지막 값 21개에서 그때까지 가장 높았던 값 → 그 뒤 가장 낮은 값(셈만 · 앞날 아님) */
export const ddOf = sp => { if (!Array.isArray(sp) || sp.length < 2) return null; let pk = sp[0], best = null;
  for (const v of sp) { if (v > pk) pk = v; const r = v / pk; if (r < 1 && (!best || r < best.r)) best = {r, hi: pk, lo: v}; } return best; };
function ddCard(sp) {
  if (!sp) return null;
  const d = ddOf(sp);
  return h('div', {class: 'sj-loss sj-codd', 'data-dd': d ? String(Math.round(d.r * 1000) / 10) : '100'},
    h('p', {class: 'sj-lossk', text: '▼ 한 달 사이 가장 깊이 빠진 때'}),
    d ? h('p', {class: 'sj-lossv'}, h('span', {class: 'sj-lossw'}, h('span', {text: '100원이 '}), h('b', {text: w100(d.r - 1)})), h('span', {class: 'sj-lossf', text: won(d.hi) + '에서 ' + won(d.lo) + '까지 내렸어요.'}))
      : h('p', {class: 'sj-lossv'}, h('b', {class: 'sj-lossn', text: '한 달 동안 그 전보다 내린 날이 없어요.'})));
}
/** 회사 쪽 — 날마다 이 회사를 고른 꾀 수 꺾은선(주문 1120-1040 · 사장님 2026-11-20(마카오) 10:40 「응 30분안에 해」 — 물음 「회사 쪽에도 그 회사를 고른 꾀 수 꺾은선을 붙일까요?」)
 *  정산 장부(날마다 적고 고치지 않음) + 오늘 꾀 칸 · 바닥 = 0 · 점마다 그날 꾀 수 · 「추천」이라는 말을 쓰지 않음 */
function coPickBox(days, n) {
  const W = 320, H = 96, PX = 12, PT = 14, PB = 12, m = Math.max(3, ...n), f = v => Math.round(v * 10) / 10, c = n.length;
  const x = i => (c < 2 ? W / 2 : PX + (W - 2 * PX) * i / (c - 1)), y = v => PT + (H - PT - PB) * (1 - v / m);
  const g = s('svg', {class: 'sj-cpk', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('path', {d: `M${PX} ${f(y(0))}H${W - PX}`, class: 'sj-pksp0'}));
  if (c > 1) g.append(s('polyline', {points: n.map((v, i) => f(x(i)) + ',' + f(y(v))).join(' '), class: 'sj-pksp1'}));
  n.forEach((v, i) => g.append(s('circle', {cx: f(x(i)), cy: f(y(v)), r: i === c - 1 ? 5 : 3.5, class: 'sj-pkspe'})));
  const tot = n.reduce((a, v) => a + v, 0);
  return h('div', {class: 'sj-cpkbox', 'data-days': String(c), 'data-now': String(n[c - 1])},
    h('p', {class: 'sj-pkch', text: '그림 뜻 · 날마다 이 회사를 고른 꾀 수예요. 위로 갈수록 많은 꾀가 골랐어요.'}), g,
    h('p', {class: 'sj-pkcd', 'aria-hidden': 'true'}, h('span', {text: mday(days[0]) ?? ''}), h('span', {text: mday(days[c - 1]) ?? ''})),
    h('p', {class: 'sj-cpkt', text: (c > 1 ? mday(days[0]) + '부터 ' + c + '일 동안 꾀가 모두 ' + tot + '번 골랐어요. ' : '아직 하루치예요. ') + '마지막 날은 꾀 ' + n[c - 1] + '가지예요.'}),
    goLink('#/o', '여러 꾀가 고른 회사 보기'));
}
export async function vCo36(X, code) {
  const [T, co, {S}, D] = await Promise.all([load21(X.get), X.get(coUrl(code)), X.base(), Promise.resolve(X.get(DST)).catch(() => null)]), g = await g36Of(X, T);
  const DC = dayCounts(D, g.fallback ? null : g), pkN = DC.days.map(d => DC.cnt.get(d).get(code) ?? 0), pkBox = pkN.some(v => v > 0) ? coPickBox(DC.days, pkN) : null; // 날마다 고른 꾀 수(주문 1120-1040)
  const G = g, mine = G ? K36.filter(k => (G.lists[k] ?? []).slice(0, 7).some(c => String(c?.code) === code)) : [];
  const inList = mine.length ? (G.lists[mine[0]] ?? []).find(c => String(c?.code) === code) : null;
  const c = co?.c ?? null, name = typeof c?.name === 'string' && c.name ? c.name : typeof inList?.name === 'string' ? inList.name : null;
  if (!name) return missPage(X, '찾지 못했어요', '이 회사를 찾지 못했어요.');
  X.setCur?.({code, name, ind: typeof c?.i === 'string' ? c.i : null});
  const RB = rankOf(T), sun = okSun(T?.sun) ? T.sun : null, sorted = [...mine].sort((a, b) => (RB[a]?.i ?? 99) - (RB[b]?.i ?? 99) || kNo(a) - kNo(b));
  const sp = G ? sp36(G, code) : null, m = monOf(sp), bd = mday(G?.asOf?.board), mk = c?.market === 'KOSDAQ' ? '코스닥' : c?.market === 'KOSPI' ? '코스피' : null;
  const kick = [mk, typeof c?.i === 'string' && c.i ? c.i + ' 업종' : null].filter(Boolean).join(' · ') || '회사';
  const line = sp ? h('figure', {class: 'sj-coline', 'data-mon': m ?? 'na', 'aria-label': '한 달 꺾은선 · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m]},
    ridgePic(sp, {down: m === 'dn'}), // 한 달 값 = 산등성이 먹선 · 마지막 봉우리에 작은 성(제4장 성을 살피다)
    h('figcaption', {}, h('span', {text: '한 달 전 ' + won(sp[0])}), h('span', {text: (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20])}),
      h('b', {text: '한 달 동안 100원이 ' + w100(sp[20] / sp[0] - 1) + '이 됐어요.'}))) : null;
  const kids = [
    pageHead({step: 3, dd: bd, kick, h1: name, proper: true, seal: m ? {dn: '내림', up: '오름', eq: '같음'}[m] : null, sealDn: m === 'dn',
      say: mine.length ? '오늘 서른여섯 꾀 가운데 ' + mine.length + '가지가 이 회사를 골랐어요.' : '오늘은 서른여섯 꾀 가운데 어느 꾀도 이 회사를 고르지 않았어요.',
      pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.castle, 'figcaption'), heroPic('castle')),
      more: [ddCard(sp), line ? meanCap(PM.ridge) : null, line, sp ? null : h('p', {class: 'sj-note', text: '한 달 값 그림은 오늘 꾀가 고른 회사만 그려요.'})]}), // 손실 먼저 — 한 달 사이 가장 깊이 빠진 때(주문 1117-1120) // 산세 그림 뜻은 그림 바로 위(그림 아래 글 figcaption 은 값 셋 그대로)
    h('section', {class: 'sj-sec sj-cok', 'aria-label': '이 회사를 고른 꾀', 'data-n': String(mine.length)},
      head('꾀', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이 회사를 고른 꾀'}), h('span', {class: 'sj-h2n', text: ' ' + mine.length + '가지'}))),
      mine.length && sun ? h('p', {class: 'sj-rule', text: '꾀마다 지난 기록을 적었어요. 지금 같은 ' + sun.name + '에서 덜 잃은 꾀가 위에 있어요.'}) : null,
      pkBox, // 날마다 이 회사를 고른 꾀 수 꺾은선(주문 1120-1040)
      mine.length ? h('ol', {class: 'sj-tricks sj-cotricks'}, ...sorted.map(k => { const r = RB[k] ?? null;
        return h('li', {class: 'sj-tk', 'data-k': k, 'data-rank': r ? String(r.i) : null},
          meanCap(PIC[k]), kkoeTile(k, G.name[k]), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
          h('a', {class: 'sj-tkh', href: '#/k/' + k, 'aria-label': (r ? '차례 ' + r.i + ' · ' : '') + G.name[k] + ' · 이 꾀 자세히'}, r ? h('span', {class: 'sj-rk' + (r.i <= 3 ? ' sj-rk3' : ''), text: String(r.i)}) : null,
            h('p', {class: 'sj-tn'}, h('b', {text: G.name[k]}), h('span', {text: ' ' + G.han[k]})), h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})),
          ...rec36(r), h('p', {class: 'sj-say', text: G.say[k]})); }))
        : h('p', {class: 'sj-lead', text: '꾀가 고른 회사만 여기에 꾀 이름이 나와요. 서른여섯 꾀는 꾀 모음에서 볼 수 있어요.'}),
      mine.length ? null : goLink('#/k', '서른여섯 꾀 모두 보기'),
      h('p', {class: 'sj-safe', text: '꾀가 골랐다고 사도 된다는 뜻이 아니에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('꾀')),
    h('section', {class: 'sj-sec sj-costop', 'aria-label': '사기 전에 한 번 멈춰요'},
      h('a', {class: 'sj-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 질문 열한 개에 답하며, 내 이유부터 적어 봐요.'}))),
    endSec(day(G?.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  return frame({title: name, page: 'co', attrs: {'data-code': code}, kids, step: 3, tab: -1, lc: code,
    next: {href: '#/q/' + code, k: '4 / 5', label: '사기 전에 한 번 멈출까?'}});
}

/* ── 정산(#/r/t) — 서른여섯 꾀 표만 ── */
export async function vSettle36(X) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return missPage(X, '정산', '정산 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const ST = settle36(D), {K, T: TT, rows} = ST, first = rows.map(r => r.day).sort()[0] ?? null, rated = K.some(x => rateOf(x) !== null), M = rankMoves(D, K), TK = trackOf(D, K); // M = 날마다 바뀐 차례(주문 1119-0243) · TK = 쌓인 값(주문 1119-0829)
  const mx = Math.max(0, ...K.map(rateOf).filter(v => v !== null).map(Math.abs));
  const dn = K.filter(x => x.st === 'dn').sort((a, b) => a.diff - b.diff);
  const bar = x => brushBar(rateOf(x), mx); // 붓 막대 — 늘면 오른쪽 먹 획 · 줄면 왼쪽 남빛 획(주문 1116-0118)
  const kids = [
    pageHead({kick: '정산 · 가짜 돈으로 해 본 셈', h1: '서른여섯 꾀 정산', seal: '셈', sealDn: TT.st === 'dn', pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.ledger, 'figcaption'), heroPic('ledger')),
      say: (first ? mday(first) + '부터 ' : '') + '날마다 서른여섯 꾀가 고른 회사를 10주씩 샀다고 치고 셌어요. 진짜 돈이 아니에요. 돈이 줄어든 꾀도 숨기지 않아요.',
      more: [h('dl', {class: 'sj-money sj-money-big', 'data-st': TT.st}, h('dt', {text: '산 돈'}), h('dd', {text: won(TT.cost)}), h('dt', {text: '지금'}), h('dd', {text: TT.n ? won(TT.val) : SAID.none})),
        h('p', {class: 'sj-res sj-res-big', 'data-st': TT.st}, shapeI(TT.st), h('b', {text: resText(TT)})),
        h('p', {class: 'sj-note', text: (first ? mday(first) + '부터 · ' : '') + '산 횟수 ' + NF.format(rows.length) + '번 · 고른 날 ' + NF.format(TT.days) + '일' + (ST.miss ? ' · 값이 없어 못 센 ' + NF.format(ST.miss) + '번' : '') + (ST.asOf ? ' · ' + mday(ST.asOf) + ' 값까지' : '')})]}),
    h('section', {class: 'sj-sec sj-st36', 'aria-label': '꾀마다 정산', 'data-n': String(K.length)},
      head('셈', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '꾀마다 정산'}), h('span', {class: 'sj-h2n', text: ' ' + K.length + '가지'}))),
      h('p', {class: 'sj-rule', text: rated ? '산 돈에 비해 많이 늘어난 꾀가 맨 위예요. 날마다 다시 줄을 세워요. 줄어든 꾀도 숨기지 않아요.' : '아직 하루밖에 안 지나서 꾀 차례대로 놓았어요. 하루가 더 지나면 많이 늘어난 꾀가 맨 위로 가요.'}),
      h('p', {class: 'sj-loss', 'data-say': '', text: dn.length ? '돈이 줄어든 꾀는 ' + dn.length + '가지예요. 가장 많이 줄어든 꾀는 「' + nameOf(dn[0].key) + '」로, ' + won(-dn[0].diff) + ' 줄었어요.' : '돈이 줄어든 꾀는 아직 없어요.'}),
      TK ? trackChart(TK, K, nameOf) : null, // 쌓인 값 꺾은선 — 기본 그림(주문 1119-0829)
      M ? h('p', {class: 'sj-st1', text: topSay(M, nameOf)}) : null, // 맨 위 한 줄(주문 1119-0243)
      M ? h('p', {class: 'sj-stmk', text: '▲는 앞 장날보다 오른 칸, ▼는 내린 칸이에요.'}) : null,
      meanCap(PM.bars), // 붓 막대 그림 뜻 — 줄 맨 위 한 번(주문 1116-1313)
      h('ol', {class: 'sj-stl'}, ...K.map((x, i) => h('li', {class: 'sj-str', 'data-k': x.key, 'data-st': x.st},
        h('a', {class: 'sj-sta', href: '#/k/' + x.key, 'aria-label': (i + 1) + '번째 · ' + nameOf(x.key) + ' · ' + resText(x) + (M ? ' · ' + mvSay(M.move.get(x.key)) : '')},
          h('span', {class: 'sj-stn', text: String(i + 1)}), h('b', {class: 'sj-stk', text: nameOf(x.key)}), M ? mvMark(M.move.get(x.key)) : null, h('i', {'aria-hidden': 'true', text: '›'})),
        h('p', {class: 'sj-stv'}, h('span', {text: '산 돈 ' + won(x.cost)}), h('span', {class: 'sj-res', 'data-st': x.st}, shapeI(x.st), h('span', {text: resText(x)})), trackSpark(TK, x.key)), // 줄마다 쌓인 값 작은 꺾은선(주문 1119-0829)
        bar(x)))),
      h('div', {class: 'sj-sttot', 'data-st': TT.st}, h('b', {text: '모두'}), h('span', {text: '산 돈 ' + won(TT.cost)}), h('span', {class: 'sj-res', 'data-st': TT.st}, shapeI(TT.st), h('span', {text: resText(TT)}))),
      h('p', {class: 'sj-safe', text: '가짜 돈으로 지난 기록을 센 표예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('셈')),
    M ? rankRace(M, nameOf) : null, // 날마다 바뀐 차례(주문 1119-0243)
    endSec(ST.asOf ? day(ST.asOf) : day(T?.asOf?.board), gotOf(S), '「지금」은 그 회사의 가장 최근 마지막 값이에요. 산 날 뒤에 값이 아직 없으면, 하루밖에 안 지난 것으로 셈해요.')];
  return frame({title: '정산', page: 'settle', kids, tab: 4, lc: X.cur?.()?.code ?? null, next: {href: '#/k', label: '서른여섯 꾀는 어떤 꾀일까?'}});
}
export {chev};

/* ── 여러 꾀가 고른 회사(#/o · 주문 1120-0950 · 사장님 2026-11-20(마카오) 09:50 「36가지 종목 중 많이 추천된 순서대로 정리 … 별도의 분석 페이지 … 데이터 추적 시스템 … 꺾은선 그래프」)
   「추천 횟수」 = 그날 그 회사를 고른 꾀의 수(화면 글 「꾀 ○가지가 골랐어요」) · 날마다 기록은 정산 장부(올리기 작업이 장 끝난 날마다 적음 · 고치지 않음) · 오늘은 꾀 칸 자료
   줄마다 손실 먼저(한 달 가운데 가장 낮을 때 → 지금) · 차례는 고른 꾀 수(수익 차례 아님) · 「%」 0 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 ── */
const PKC = ['sj-pkl1', 'sj-pkl2', 'sj-pkl3', 'sj-pkl4', 'sj-pkl5']; // 선 다섯 — 굵기 · 점선 모양이 서로 다름(색만으로 가르지 않음)
/** 날마다 고른 꾀 수 작은 꺾은선(회사 한 줄) — 바닥 = 0 · 끝 점 */
function pickSpark(n, hi) {
  const W = 120, H = 40, P = 5, m = Math.max(3, hi), f = v => Math.round(v * 10) / 10;
  const x = i => (n.length < 2 ? W / 2 : P + (W - 2 * P) * i / (n.length - 1)), y = v => P + (H - 2 * P) * (1 - v / m);
  const g = s('svg', {class: 'sj-pksp', viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('path', {d: `M${P} ${f(y(0))}H${W - P}`, class: 'sj-pksp0'}));
  if (n.length > 1) g.append(s('polyline', {points: n.map((v, i) => f(x(i)) + ',' + f(y(v))).join(' '), class: 'sj-pksp1'}));
  g.append(s('circle', {cx: f(x(n.length - 1)), cy: f(y(n[n.length - 1])), r: 4, class: 'sj-pkspe'}));
  return g;
}
/** 많이 고른 다섯 곳의 날마다 꾀 수(큰 꺾은선) — 선마다 모양이 다름 · 이름은 그림 밖 글로 */
function pickChart(P) {
  const R = P.rows.slice(0, 5), n = P.days.length, W = 340, H = 190, PX = 14, PT = 12, PB = 14, hi = Math.max(3, ...R.flatMap(r => r.n)), f = v => Math.round(v * 10) / 10;
  const x = i => (n < 2 ? W / 2 : PX + (W - 2 * PX) * i / (n - 1)), y = v => PT + (H - PT - PB) * (1 - v / hi);
  const g = s('svg', {class: 'sj-pkc', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false'});
  for (let v = 0; v <= hi; v += Math.max(1, Math.round(hi / 3))) g.append(s('path', {d: `M${PX} ${f(y(v))}H${W - PX}`, class: v ? 'sj-pkcg' : 'sj-pkc0'}));
  R.forEach((r, j) => { if (n > 1) g.append(s('polyline', {points: r.n.map((v, i) => f(x(i)) + ',' + f(y(v))).join(' '), class: PKC[j]}));
    g.append(s('circle', {cx: f(x(n - 1)), cy: f(y(r.n[n - 1])), r: 4.5, class: PKC[j] + 'e'})); });
  return h('div', {class: 'sj-pkcbox', 'data-days': String(n)},
    h('p', {class: 'sj-pkch', text: '그림 뜻 · 선 하나가 회사 하나예요. 위로 갈수록 많은 꾀가 골랐어요.'}), g,
    h('p', {class: 'sj-pkcd', 'aria-hidden': 'true'}, h('span', {text: mday(P.days[0]) ?? ''}), h('span', {text: mday(P.days[n - 1]) ?? ''})),
    h('ul', {class: 'sj-pkcl'}, ...R.map((r, j) => h('li', {'data-j': String(j + 1)}, h('i', {class: 'sj-pkck ' + PKC[j] + 'k', 'aria-hidden': 'true'}), h('span', {'data-proper': '', text: r.name}), h('span', {text: ' · 오늘 꾀 ' + r.now + '가지'})))),
    n < 2 ? h('p', {class: 'sj-note', text: '아직 하루치예요. 장이 끝난 날마다 한 점씩 늘어요.'}) : null);
}
export async function vPicks(X) {
  const [T, D, {S}] = await Promise.all([load21(X.get), X.get(DST).catch(() => null), X.base()]), g = await g36Of(X, T);
  const P = picksOf(D, g.fallback ? null : g), hi = Math.max(3, ...P.rows.flatMap(r => r.n)), bd = mday(g.asOf?.board);
  const row = (r, i) => { const ml = monthLow(sp36(g, r.code));
    return h('li', {class: 'sj-pk', 'data-code': r.code, 'data-now': String(r.now)},
      h('a', {class: 'sj-pka', href: '#/c/' + r.code},
        h('span', {class: 'sj-pkno', 'aria-hidden': 'true', text: String(i + 1)}),
        h('span', {class: 'sj-pkt'}, h('b', {'data-proper': '', text: r.name}), r.sec ? h('span', {class: 'sj-pksec', text: r.sec}) : null),
        h('i', {'aria-hidden': 'true', text: '›'})),
      h('p', {class: 'sj-pkn'}, h('b', {text: '꾀 ' + r.now + '가지가 골랐어요.'}), h('span', {text: P.days.length > 1 ? ' 지난 ' + P.days.length + '일 동안 모두 ' + r.total + '번이에요.' : ''})),
      pickSpark(r.n, hi),
      ml ? h('p', {class: 'sj-pkm'}, h('span', {class: 'sj-pkml', text: '한 달 가운데 가장 낮을 때 100원이 ' + w100(ml.low)}), h('span', {class: 'sj-pkmn', text: '지금 100원이 ' + w100(ml.now)})) : null); };
  const kids = [
    pageHead({kick: '서른여섯 꾀 · 함께 고른 회사', h1: '여러 꾀가 고른 회사', seal: '곳',
      say: '서른여섯 꾀는 날마다 회사를 골라요. 한 회사를 여러 꾀가 함께 고르기도 해요. 오늘 많은 꾀가 고른 회사부터 모았어요.'}),
    h('section', {class: 'sj-sec sj-pks', 'aria-label': '오늘 여러 꾀가 고른 회사', 'data-n': String(P.rows.length), 'data-rule': P.rule},
      head('곳', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '오늘 여러 꾀가 고른 회사'}), h('span', {class: 'sj-h2n', text: ' ' + P.rows.length + '곳'}))),
      h('p', {class: 'sj-dayl', text: (bd ? bd + ' 마지막 값으로 고른 회사예요. ' : '') + '꾀 두 가지 넘게 고른 곳만 적었어요. 꺾은선은 날마다 고른 꾀 수예요.'}),
      P.rows.length ? h('ol', {class: 'sj-pkl'}, ...P.rows.map(row)) : h('p', {class: 'sj-tnone', text: '오늘은 꾀 두 가지 넘게 고른 회사가 없어요. 억지로 채우지 않았어요.'}),
      endSeal('곳')),
    P.rows.length ? h('section', {class: 'sj-sec sj-pkg', 'aria-label': '날마다 고른 꾀 수'},
      head('선', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '날마다 고른 꾀 수'})), true),
      pickChart(P),
      h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이렇게 셌어요'}), chev()),
        h('p', {class: 'sj-rule', text: (mday(P.from) ? mday(P.from) + '부터 ' : '') + '장이 끝난 날마다, 서른여섯 꾀가 고른 회사를 장부에 적었어요. 한 번 적은 날은 고치지 않아요.'}),
        h('p', {class: 'sj-rule', text: '한 회사를 꾀 여러 가지가 고르면 그 꾀 수를 셌어요. 날이 지날수록 꺾은선에 점이 하나씩 늘어요.'})),
      endSeal('선')) : null,
    h('p', {class: 'sj-safe sj-sec', text: '여러 꾀가 골랐다고 오르는 것은 아니에요. 지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSec(day(g.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  return frame({title: '여러 꾀가 고른 회사', page: 'picks', kids, tab: 1, lc: X.cur?.()?.code ?? null, next: {href: '#/k', label: '서른여섯 꾀 모두 볼까?'}});
}
