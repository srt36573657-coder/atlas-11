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
import {topBar, stepTag, endSec, dockNav, tabNav, recNav, meanCap} from '/su/su-sonja-top.js';
import {PIC, PM} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {STORY36, ACTS, STORY_TAG} from '/su/su-sonja-story.js'; // 그림 속 이야기 네 막(주문 1117-0102 — 36초짜리 한 편 · 막마다 한 줄 · 감정)
import {D36, DST, load21, n36of, okSun, sp36, rec36, chip, spark, head, endSeal, chev, mday, ym, day, w100, monOf, MONW, none36, fin, funnel36, eqBox, trSpark} from '/su/su-sonja.js';
import {base36} from '/su/su-sonja-36.js'; // 꾀 칸 자료를 못 받은 날의 바탕 글(su21_s36.py 그대로)
import {kkoePic, ridgePic, heroPic, brushBar, sonmuPic} from '/su/su-sonja-ink.js'; // 먹그림(주문 1116-0118 — 손무의 이야기: 제3장 꾀를 펼치다 · 제4장 성을 살피다 · 장부 · 병서)
import {kkoeTile, fold7, FOLD7} from '/su/su-sonja.js'; // 긴 줄 접기 한 틀(주문 1127-1714 · 첫 쪽 격언도 같은 틀 — 주문 1127-2148)
import {stance3, STANCES} from '/su/su-stance.js'; // 세 태세(주문 1120-0728 · 꾀 쪽 맨 위 표지 — 주문 1120-0950)
import {picksOf, monthLow, dayCounts} from '/su/su-picks.js';
import {findBox} from '/su/su-find.js'; // 회사 찾기(주문 1120-1447 — 회사 탭 맨 위)
import {coValSec, coLinkSec} from '/su/su-coval.js';
import {ledgerOf, ledFind, tradesOf, ledgerView, LEDGER_VIEWS, LEDGER_SPANS, LEDGER_RES, LEDGER_SORTS, LEDGER_PICK0, judgeOf, judgeLines, judgeTail, JUDGE_DAYS, sameAgeOf, sameText} from '/su/su-ledger-core.js'; // 장부(주문 1120-1705) · 장부에서 회사 찾기(주문 1120-1804) // 회사 쪽 값과 실적 · 더 알아보기(주문 1120-1447) // 여러 꾀가 고른 회사(주문 1120-0950) · 회사 쪽 날마다 고른 꾀 수(주문 1120-1040)
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
  const lv = d => (D.mk && fin(D.mk[d]) && D.mk[d] > 0 ? D.mk[d] : null); // 판 전체가 걸어온 길(주문 1123-2358 · 장부 잣대 1번 「시장과 나란히」)
  const hzOf = (i, dd, buy) => { // 같은 날수로(주문 1124-0226 · 장부 잣대 2번) — 산 뒤 1 · 5 · 20 장날의 값 · 그날 시장(판 전체) · 아직 안 지났으면 null
    const ts = D.hz?.days?.[dd], ps = D.hz?.p?.[i];
    return Array.isArray(ts) && Array.isArray(ps) ? ts.map((t, j) => (typeof t === 'string' && fin(ps[j]) && ps[j] > 0 ? {t, val: ps[j] * q, mv: lv(dd) && lv(t) ? buy * q * lv(t) / lv(dd) : null} : null)) : null; };
  return D.buys.map((b, i) => [b, i]).filter(([b]) => Array.isArray(b) && KKOE.test(D.kinds[b[1]] ?? '') && fin(b[3]) && b[3] > 0).map(([[dd, ki, code, buy], i]) => {
    const [now, nowDay] = Array.isArray(D.now?.[code]) && fin(D.now[code][0]) ? D.now[code] : [buy, dd], [name] = D.co?.[code] ?? [code];
    const l0 = lv(dd), l1 = lv(nowDay); // mv = 같은 날 같은 돈을 판 전체에 고르게 나눠 산 셈의 지금(그 회사 「지금」 날까지) · 길이 없으면 null
    return {day: dd, k: D.kinds[ki], code, name: name ?? code, buy, now, nowDay, cost: buy * q, val: now * q, one: !(nowDay > dd), mv: l0 && l1 ? buy * q * l1 / l0 : null, hz: hzOf(i, dd, buy)};
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
function frame({title, page, kids, step = null, next = null, tab = -1, rec = null, lc = null, attrs = {}}) {
  const main = h('main', {class: 'sj-page sj-sub', 'data-page': page, ...attrs}, ...kids);
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = '';
  return {title, dom: [topBar(), rec == null ? null : recNav(rec), main, dockNav(step, next), tabNav(tab, lc)].filter(Boolean)}; // 기록 탭 쪽은 맨 위 갈래 줄(주문 1124-1942)
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

/* ── 꾀 모음(#/k) ── 요즘 많이 오른 차례(주문 1126-1752 · 사장님 2026-11-26(서울) 17:52 「꾀 탭에서 말이야 여러 꾀가 상황에 꾀를 나타내게 되어 있다 그걸 요즘 상승률 순위에
   순으로 배치하라 1위부터 36위까지 그리고 매일 그 순위에 등락을 화살표로 표기하라 7일 자료를 말이야」 — docs/design/kkoe-rank-2026-11-26/order-1752.txt)
   차례 = 정산 장부(su21-settle.json)에서 꾀마다 처음 넣은 100원이 지금 얼마가 됐는지(정산 쪽과 같은 셈 settle36 — 본질 8번 · 주문 1113-2224 「수익율이 높은 순으로」) · 1등부터 36등(「1위」는 쓰지 않을 말)
   줄마다 앞 장날보다 오르내린 칸(▲ · ▼ · ―) + 지난 7일 날마다 오르내린 칸 · 날마다 차례 = 장부가 적은 차례(D.rk) + 오늘 차례(rankMoves · 정산 쪽과 같음) · 산 셈이 아직 없으면 옛 여섯 묶음 그대로 */
const WEEK = 7;
/** 지난 7일 날마다 오르내린 칸 — [{day, mv}] (mv = 앞 장날 차례 − 그날 차례 · 늘면 오름) · 앞 날이 없으면 null */
export const weekOf = (M, k) => { if (!M || !Array.isArray(M.order) || M.order.length < 2) return null; const j = K36.indexOf(k), rk = M.order.map(o => o.indexOf(j) + 1), out = [];
  for (let i = Math.max(1, rk.length - WEEK); i < rk.length; i++) if (rk[i] > 0 && rk[i - 1] > 0) out.push({day: M.days[i], mv: rk[i - 1] - rk[i]});
  return out.length ? out : null; };
const wkSay = mv => (mv > 0 ? mv + '칸 오름' : mv < 0 ? -mv + '칸 내림' : '그대로');
function weekRow(W) {
  return h('div', {class: 'sj-kwk', 'data-n': String(W.length), role: 'img', 'aria-label': '지난 ' + W.length + '일 차례 · ' + W.map(w => (mday(w.day) ?? '') + ' ' + wkSay(w.mv)).join(' · ')},
    h('span', {class: 'sj-kwkk', 'aria-hidden': 'true', text: '지난 ' + W.length + '일'}),
    h('span', {class: 'sj-kwkl', 'aria-hidden': 'true'}, ...W.map(w => h('span', {class: 'sj-kwa', 'data-m': w.mv > 0 ? 'up' : w.mv < 0 ? 'dn' : 'eq', 'data-day': w.day, text: w.mv > 0 ? '▲' + w.mv : w.mv < 0 ? '▼' + -w.mv : '―'}))));
}
function rankRow(g, x, i, M) {
  const k = x.key, v = rateOf(x), W = weekOf(M, k), mv = M ? M.move.get(k) : null;
  return h('li', {class: 'sj-kr sj-krr', 'data-k': k, 'data-rank': String(i + 1), 'data-st': x.st},
    meanCap(PIC[k]), kkoeTile(k, g.name[k], 'sj-kpic', 120, 90), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
    h('a', {class: 'sj-ka', href: '#/k/' + k, 'aria-label': (i + 1) + '등 · 제' + kNo(k) + '계 · ' + g.name[k] + ' · ' + (v !== null ? '처음 넣은 100원이 지금 ' + w100(v / 1e6) : resText(x)) + (mv != null ? ' · ' + mvSay(mv) : '')},
      h('span', {class: 'sj-krn', text: (i + 1) + '등'}),
      h('span', {class: 'sj-kno', text: '제' + kNo(k) + '계'}),
      h('span', {class: 'sj-kt'}, h('b', {text: g.name[k]}), h('span', {class: 'sj-khan', text: g.han[k]})),
      mv != null ? mvMark(mv) : null, h('i', {'aria-hidden': 'true', text: '›'})),
    h('p', {class: 'sj-krv', 'data-st': x.st}, shapeI(x.st), h('span', {text: v !== null ? '처음 넣은 100원이 지금 ' + w100(v / 1e6) + '이에요.' : resText(x)})),
    W ? weekRow(W) : null,
    h('p', {class: 'sj-kmean', text: g.mean[k]}));
}
export async function vKkoeAll(X) {
  const [T, {S}, D] = await Promise.all([load21(X.get), X.base(), Promise.resolve(X.get(DST)).catch(() => null)]), g = await g36Of(X, T);
  const RB = rankOf(T), sun = okSun(T?.sun) ? T.sun : null;
  const ST = D && Array.isArray(D.buys) && Array.isArray(D.kinds) ? settle36(D) : null, K = ST ? ST.K : null, rated = !!K && K.some(x => rateOf(x) !== null), M = rated ? rankMoves(D, K) : null;
  const first = rated ? K[0].key : sun?.rank[0]?.k ?? null, quote = sun?.rankQ?.quote ? [sun.rankQ.quote, '손자병법 ' + (sun.rankQ.pian ?? '')] : null;
  const fig = h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.book, 'figcaption'), heroPic('book')), tap = h('p', {class: 'sj-lead', text: '꾀 그림이나 이름을 누르면, 그 꾀를 자세히 볼 수 있어요.'});
  const nW = rated ? Math.max(0, ...K.map(x => weekOf(M, x.key)?.length ?? 0)) : 0;
  const body = rated ? [h('section', {class: 'sj-sec sj-krank', 'aria-label': '요즘 많이 오른 차례', 'data-n': String(K.length), 'data-days': String(nW)},
      head('차례', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '요즘 많이 오른 차례'}))),
      h('p', {class: 'sj-rule', text: (ST.rows.length ? mday(ST.rows.map(r => r.day).sort()[0]) + '부터 ' : '') + '날마다 꾀마다 고른 회사를 샀다고 치고 셌어요. 처음 넣은 100원이 지금 많이 늘어난 꾀가 1등이에요. 날마다 다시 줄을 세워요. 가짜 돈이에요.'}),
      M ? h('p', {class: 'sj-stmk', text: '▲는 앞 장날보다 오른 칸, ▼는 내린 칸, ―는 그대로예요.' + (nW ? ' 줄마다 지난 ' + nW + '일을 날마다 보여 줘요. 왼쪽이 ' + mday(M.days[M.days.length - nW]) + ', 오른쪽이 ' + mday(M.days[M.days.length - 1]) + '이에요.' : '')}) : null,
      ...fold7(h('ol', {class: 'sj-kl sj-krl'}, ...K.map((x, i) => rankRow(g, x, i, M))), (o, n) => (o + 1) + '등부터 ' + n + '등까지 더 보기'),
      endSeal('차례'))]
    : (() => { const sets = []; for (let i = 0; i < 6; i++) sets.push(K36.slice(i * 6, i * 6 + 6)); // 산 셈이 아직 없는 날 — 옛 여섯 묶음 그대로
      return sets.map((ks, i) => h('section', {class: 'sj-sec sj-kset', 'data-set': String(i + 1), 'aria-label': g.set[ks[0]]},
        head(SETW[i], '제' + (i + 1) + '묶음', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: g.set[ks[0]]})), i % 2 === 1),
        h('ol', {class: 'sj-kl'}, ...ks.map(k => kkoeRow(g, k, RB[k]))),
        endSeal(SETW[i]))); })();
  const kids = [
    pageHead({kick: rated ? '삼십육계 · 요즘 많이 오른 차례' : '삼십육계 · 여섯 묶음', h1: '병법 서른여섯 가지', seal: '꾀', quote,
      say: '삼십육계는 옛날부터 전해 오는 꾀 서른여섯 가지예요. ' + (rated ? '요즘 많이 오른 차례로 1등부터 36등까지 놓았어요.' : '여섯 묶음에 꾀가 여섯 가지씩 있어요.' + (sun ? ' 지금 같은 ' + sun.name + '에서 덜 잃은 차례도 함께 적었어요.' : '')),
      more: [fig, tap]}),
    ...body,
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
    coValSec(co), // 값과 실적(주문 1120-1447 — 지금 값 · 1년 흐름 손실 먼저 · 때마다 100원이 · 번 돈 세 해)
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
    coLinkSec(code, c), // 더 알아보기(주문 1120-1447 — 옛 7단 분석 · 뉴스 · 공시 · 증권사 글은 바깥 고리만)
    h('section', {class: 'sj-sec sj-costop', 'aria-label': '사기 전에 한 번 멈춰요'},
      h('a', {class: 'sj-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 질문 열한 개에 답하며, 내 이유부터 적어 봐요.'}))),
    endSec(day(G?.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  return frame({title: name, page: 'co', attrs: {'data-code': code}, kids, step: 3, tab: -1, lc: code,
    next: {href: '#/q/' + code, k: '4 / 5', label: '사기 전에 한 번 멈출까?'}});
}

/* ── 정산(#/r/t) — 서른여섯 꾀 표만 ── */
/** 사고 팔기 셈(주문 1125-0049 · 사장님 2026-11-25(서울) 00:40 「이제는 매수 와 매도를 하자 … 그 기준 날짜로 팔고 … 12프로 하락이면 자동으로 팔게 … 오늘까지 한것과 … 매도 기준을 잡고 난 이후애 결과는 어떻게 됐는지 직관적으로 잘보이개 상대 비교」
 *    · 00:49 「어린이도 알수있게 설명과 실제에 심플들을 만들어서 설명칸을 만들고 … 모든 거래는 종가 기준」) — 정산 장부 sell(su21_settle.mjs sellsOf)
 *  사기만 = 오늘까지 한 셈(산 뒤 계속 들고 있음 · 지금 = 가장 늦은 종가) · 사고 팔기 = 같은 산 셈을 새 규칙으로 다시 센 셈(판 것 = 판 종가 · 아직 정한 날 전 = 가장 늦은 종가) */
const S36K = Object.freeze(Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')));
const stOfD = d => (!fin(Math.abs(d)) && d !== 0 ? 'none' : Math.round(d) > 0 ? 'up' : Math.round(d) < 0 ? 'dn' : 'eq');
export function sellSum(D) {
  const q = Number.isFinite(D?.qty) ? D.qty : 10, SV = D?.sell;
  if (!SV || !Array.isArray(SV.s) || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return null;
  const blank = k => ({k, cost: 0, valB: 0, valS: 0, d: 0, c: 0, h: 0, n: 0}), per = new Map(), tot = blank('all');
  D.buys.forEach((b, i) => {
    const x = SV.s[i];
    if (!Array.isArray(b) || !Array.isArray(x) || !KKOE.test(D.kinds[b[1]] ?? '') || !(b[3] > 0) || !(x[2] > 0)) return;
    const k = D.kinds[b[1]], nowV = Array.isArray(D.now?.[b[2]]) && D.now[b[2]][0] > 0 ? D.now[b[2]][0] : b[3], g = per.get(k) ?? blank(k);
    for (const o of [g, tot]) { o.cost += b[3] * q; o.valB += nowV * q; o.valS += x[2] * q; o[x[0]] = (o[x[0]] ?? 0) + 1; o.n++; }
    per.set(k, g);
  });
  return {q, tot, per, days: SV.days ?? {}, ex: Array.isArray(SV.ex) ? SV.ex : [], cut: SV.cut ?? 88};
}
const svBar = (m, label, d, mx) => { // 붓 막대 — 가운데 줄에서 늘면 오른쪽(먹) · 줄면 왼쪽(남빛) · 그림 속 값(글은 밖) · 인라인 꾸밈 없음(보안 규칙 style-src 'self')
  const st = stOfD(d), f = mx > 0 ? Math.min(1, Math.abs(d) / mx) : 0, w = 100 * f;
  return h('div', {class: 'sj-svbr', 'data-m': m, 'data-st': st},
    h('span', {class: 'sj-svbl', text: label}),
    s('svg', {class: 'sj-svtrack', viewBox: '0 0 200 18', preserveAspectRatio: 'none', 'aria-hidden': 'true'},
      s('rect', {class: 'sj-svtr', x: 0, y: 0, width: 200, height: 18}),
      s('rect', {class: 'sj-svfill', x: (st === 'dn' ? 100 - w : 100).toFixed(2), y: 3, width: w.toFixed(2), height: 12}),
      s('rect', {class: 'sj-svmid', x: 99, y: 0, width: 2, height: 18})),
    h('span', {class: 'sj-svbv', text: moved(d)}));
};
function svCompare(SV, nameOf) {
  const T = SV.tot, dB = T.valB - T.cost, dS = T.valS - T.cost, gap = dS - dB, mx = Math.max(Math.abs(dB), Math.abs(dS));
  const card = (m, title, sub, d, val, extra) => h('div', {class: 'sj-svcard', 'data-m': m, 'data-st': stOfD(d)},
    h('p', {class: 'sj-svt'}, h('b', {text: title}), h('span', {text: sub})),
    h('p', {class: 'sj-svbig sj-res', 'data-st': stOfD(d)}, shapeI(stOfD(d)), h('b', {text: moved(d)})),
    h('p', {class: 'sj-svl', text: '산 돈 ' + won(T.cost)}), h('p', {class: 'sj-svl', text: val}), extra ?? null);
  const kd = S36K.map(k => SV.per.get(k)).filter(Boolean), mxK = Math.max(0, ...kd.flatMap(g => [Math.abs(g.valB - g.cost), Math.abs(g.valS - g.cost)]));
  return h('section', {class: 'sj-sec sj-sv', 'aria-label': '사기만과 사고 팔기 견줌', 'data-n': String(T.n)},
    head('견줌', '사고 팔기', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '사기만 · 사고 팔기'}))),
    h('p', {class: 'sj-rule', text: '같은 날, 같은 회사를, 같은 값에 샀어요. 파는 법만 달라요.'}),
    h('div', {class: 'sj-svc'},
      card('buy', '사기만', '오늘까지 한 셈', dB, '지금 ' + won(T.valB)),
      card('sell', '사고 팔기', '새 규칙으로 다시 센 셈', dS, '판 돈과 남은 것 ' + won(T.valS), h('p', {class: 'sj-svl', text: '판 것 ' + NF.format(T.d + T.c) + '번 · 들고 있는 것 ' + NF.format(T.h) + '번'}))),
    h('figure', {class: 'sj-svfig', 'aria-label': '두 셈의 늘고 준 돈'}, svBar('buy', '사기만', dB, mx), svBar('sell', '사고 팔기', dS, mx),
      h('figcaption', {class: 'sj-svcap', text: '가운데 줄보다 오른쪽은 늘어난 돈, 왼쪽은 줄어든 돈이에요.'})),
    h('p', {class: 'sj-svsay', 'data-say': '', text: Math.round(gap) === 0 ? '두 셈이 같아요.' : '사고 팔기 셈이 사기만 셈보다 ' + won(Math.abs(gap)) + (gap > 0 ? ' 더 많아요.' : ' 더 적어요.')}),
    h('p', {class: 'sj-svnote', text: '판 것 가운데 정한 날에 판 것 ' + NF.format(T.d) + '번, 88원 줄에서 판 것 ' + NF.format(T.c) + '번이에요. 판 돈은 다시 사지 않아요. 아직 정한 날이 안 온 것은 가장 늦은 종가로 셌어요.'}),
    h('div', {class: 'sj-svgo'}, goLink('#/l/s', '판 회사 낱낱이 보기'), goLink('#/l/b', '산 회사 낱낱이 보기')), // 주문 1125-1144
    h('details', {class: 'sj-svk'}, h('summary', {class: 'sj-svks'}, h('span', {text: '꾀마다 견줘 보기'}), h('span', {class: 'sj-svksn', text: kd.length + '가지'})),
      h('ol', {class: 'sj-svkl'}, ...kd.map(g => h('li', {class: 'sj-svkr', 'data-k': g.k},
        h('p', {class: 'sj-svkn'}, h('b', {text: nameOf(g.k)}), h('span', {text: (SV.days[g.k] ?? '?') + '일째에 팔아요'})),
        svBar('buy', '사기만', g.valB - g.cost, mxK), svBar('sell', '사고 팔기', g.valS - g.cost, mxK))))));
}
const SV_STEPS = Object.freeze([
  ['buy', '사요', '꾀가 고른 회사를, 그날 장이 끝날 때 값(종가)으로 10주 사요.'],
  ['count', '날을 세요', '산 다음 장날이 1일째예요. 꾀마다 파는 날이 정해져 있어요.'],
  ['day', '정한 날에 팔아요', '정한 날이 되면 그날 종가로 팔아요. 올랐든 안 올랐든 팔아요.'],
  ['cut', '많이 내리면 바로 팔아요', '100원에 산 것이 88원 이하로 마감하면, 정한 날 전이라도 그날 종가로 팔아요.']]);
const SV_ICON = Object.freeze({buy: 'M5 12h14M12 5v14', count: 'M7 4v4M17 4v4M4 9h16M5 6h14v14H5zM9 13h2M13 13h2M9 17h2', day: 'M5 13l4 4L19 7', cut: 'M4 7l6 6 4-4 6 6M20 10v5h-5'});
const svIcon = k => s('svg', {class: 'sj-svic', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: SV_ICON[k] ?? '', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}));
function svExPic(e, buy, cutAt) { // 산 날부터 판 날까지 종가 꺾은선 — 산 날 동그라미 · 판 날 네모 · 88원 줄(점선)
  const pts = e.ser.map(([, v], i) => [i, v]).filter(([, v]) => v > 0), W = 300, H = 120, L = 14, R = 14, Tp = 14, B = 14;
  const vs = [...pts.map(([, v]) => v), buy, ...(cutAt ? [cutAt] : [])], lo = Math.min(...vs), hi = Math.max(...vs), n = Math.max(1, e.ser.length - 1);
  const x = i => L + (W - L - R) * i / n, y = v => (hi === lo ? H / 2 : Tp + (H - Tp - B) * (hi - v) / (hi - lo));
  const last = pts[pts.length - 1];
  return s('svg', {class: 'sj-svpic', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '산 날부터 판 날까지 종가 꺾은선'},
    s('line', {class: 'sj-svbuyl', x1: L, x2: W - R, y1: y(buy).toFixed(1), y2: y(buy).toFixed(1)}),
    cutAt ? s('line', {class: 'sj-svcutl', x1: L, x2: W - R, y1: y(cutAt).toFixed(1), y2: y(cutAt).toFixed(1)}) : null,
    s('polyline', {class: 'sj-svln', points: pts.map(([i, v]) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ')}),
    s('circle', {class: 'sj-svb0', cx: x(0).toFixed(1), cy: y(buy).toFixed(1), r: 7}),
    last ? s('rect', {class: 'sj-svs1', x: (x(last[0]) - 7).toFixed(1), y: (y(last[1]) - 7).toFixed(1), width: 14, height: 14, rx: 2}) : null);
}
function svExplain(SV, D, nameOf) {
  const byN = new Map(); for (const k of S36K) { const n = SV.days[k]; if (n) byN.set(n, (byN.get(n) ?? 0) + 1); }
  const KIND = {up: '정한 날에 팔았더니 올라 있었어요', flat: '정한 날에 팔았더니 내려 있었어요', cut: '88원 줄 밑으로 내려 바로 팔았어요'};
  const exs = SV.ex.map(e => {
    const b = D.buys[e.i], x = SV.s?.[e.i] ?? D.sell?.s?.[e.i];
    if (!Array.isArray(b) || !Array.isArray(x)) return null;
    const [dd, ki, code, buy] = b, k = D.kinds[ki], co = D.co?.[code]?.[0] ?? code, cutAt = Math.ceil(buy * SV.cut / 100), d = (x[2] - buy) * SV.q;
    return h('li', {class: 'sj-svex', 'data-kind': e.kind, 'data-k': k},
      h('p', {class: 'sj-svexh'}, h('b', {text: KIND[e.kind] ?? ''})),
      svExPic(e, buy, e.kind === 'cut' ? cutAt : null),
      h('p', {class: 'sj-svexl', text: mday(dd) + ', 「' + nameOf(k) + '」 꾀가 고른 ' + josa(co, '를') + ' 종가 ' + won(buy) + '에 10주 샀어요.'}),
      e.kind === 'cut'
        ? h('p', {class: 'sj-svexl', text: x[3] + '일째인 ' + mday(x[1]) + ', 종가가 ' + won(x[2]) + '이었어요. 88원 줄인 ' + won(cutAt) + '보다 낮아서 바로 팔았어요.'})
        : h('p', {class: 'sj-svexl', text: '이 꾀는 ' + (SV.days[k] ?? x[3]) + '일째에 팔아요. ' + x[3] + '일째인 ' + mday(x[1]) + ', 종가 ' + won(x[2]) + '에 팔았어요.'}),
      h('p', {class: 'sj-svexr sj-res', 'data-st': stOfD(d)}, shapeI(stOfD(d)), h('b', {text: moved(d)})));
  }).filter(Boolean);
  return h('section', {class: 'sj-sec sj-svx', 'aria-label': '사고 팔기 설명칸'},
    head('설명', '사고 팔기', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이렇게 사고 팔아요'}))),
    h('ol', {class: 'sj-svstep'}, ...SV_STEPS.map(([ic, t, say], i) => h('li', {class: 'sj-svst', 'data-step': String(i + 1)}, svIcon(ic), h('b', {text: (i + 1) + '. ' + t}), h('span', {text: say})))),
    h('details', {class: 'sj-drawer sj-svmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '꾀마다 파는 날과 실제 보기'}), chev()), // 네 걸음만 펼치고 나머지는 서랍(주문 1127-1922 · 다음 정리 ⑤)
    h('div', {class: 'sj-svdays', 'aria-label': '꾀마다 파는 날'}, h('p', {class: 'sj-svdt', text: '꾀마다 파는 날'}),
      h('ul', {class: 'sj-svdl'}, ...[...byN.entries()].sort((a, b) => a[0] - b[0]).map(([n, c]) => h('li', {class: 'sj-svdr'}, h('b', {text: n + '일째'}), h('span', {text: '꾀 ' + c + '가지'})))),
      h('p', {class: 'sj-svdn', text: '파는 날은 지난 기록에서 그 꾀가 오른 뒤 절반이 끝난 날이에요. 기록이 모자란 꾀는 아무렇게나 고른 회사처럼 4일째예요.'})),
    exs.length ? h('h3', {class: 'sj-svh3', text: '실제 보기'}) : null,
    exs.length ? h('ol', {class: 'sj-svexs'}, ...exs) : h('p', {class: 'sj-svnote', text: '아직 판 셈이 없어요. 정한 날이 지나면 실제 보기가 생겨요.'}),
    exs.length ? h('p', {class: 'sj-svlg', text: '동그라미는 산 날, 네모는 판 날이에요. 가로줄은 산 값이고, 점선은 88원 줄이에요.'}) : null,
    h('p', {class: 'sj-svnote', text: '정한 날에 종가 기록이 빠져 있으면, 다음 장날 종가로 팔아요.'})));
}
/** 산 회사 · 판 회사(주문 1125-1144 · 사장님 2026-11-25(서울) 11:44 「기록 탭에 말이야 그안안 탭을 두개 만들어줘 매수한종목 매동한 종목 그리고 언제 얼망에 매수해고 매도 했는지 그래서 보유기간은 몇일이였고 몇프로에 변동이 있었으며 수익은 어땠는지」)
 *  사고 팔기 셈(sell-v1 · 종가) 낱건 — 산 회사 = 아직 들고 있는 것('h') · 판 회사 = 판 것('d' 정한 날 · 'c' 88원 줄)
 *  줄마다 회사 · 꾀 · 산 날 · 산 값 · 판 날 · 판 값(들고 있으면 가장 늦은 종가) · 들고 있은 날(장날) · 변동(프로) · 늘고 준 돈(10주) · 판 까닭 · 새것 먼저 · 처음 일곱 개 · 「더 보기」마다 서른 개씩(주문 1127-1922) */
export function sellTrades(D) {
  const SV = D?.sell, q = Number.isFinite(D?.qty) ? D.qty : 10;
  if (!SV || !Array.isArray(SV.s) || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return null;
  const hold = [], sold = [];
  D.buys.forEach((b, i) => {
    const x = SV.s[i];
    if (!Array.isArray(b) || !Array.isArray(x) || !KKOE.test(D.kinds[b[1]] ?? '') || !(b[3] > 0) || !(x[2] > 0)) return;
    const k = D.kinds[b[1]], t = {i, k, code: b[2], co: D.co?.[b[2]]?.[0] ?? b[2], d0: b[0], p0: b[3], how: x[0], d1: x[1], p1: x[2], days: x[3], n: SV.days?.[k] ?? null, diff: (x[2] - b[3]) * q, r: x[2] / b[3] - 1};
    (x[0] === 'h' ? hold : sold).push(t);
  });
  const newer = key => (a, b) => String(b[key]).localeCompare(String(a[key])) || a.k.localeCompare(b.k) || a.code.localeCompare(b.code);
  hold.sort(newer('d0')); sold.sort(newer('d1'));
  const sum = L => ({n: L.length, up: L.filter(t => Math.round(t.diff) > 0).length, dn: L.filter(t => Math.round(t.diff) < 0).length, diff: L.reduce((a, t) => a + t.diff, 0), cost: L.reduce((a, t) => a + t.p0 * q, 0), days: L.length ? L.reduce((a, t) => a + t.days, 0) / L.length : 0});
  return {q, hold, sold, H: sum(hold), S: sum(sold), cut: SV.cut ?? 88};
}
export const pctText = r => { const v = Math.round(r * 1000) / 10; return !Number.isFinite(v) ? '' : v > 0 ? v.toFixed(1) + '프로 올랐어요' : v < 0 ? (-v).toFixed(1) + '프로 내렸어요' : '그대로예요'; };
const TR_STEP = 30, TR_FIRST = FOLD7; // 처음엔 일곱 줄(주문 1127-1922 · 같은 틀 「위 일곱」) · 「더 보기」마다 서른 줄
/** 회사 줄 값 꺾은선(주문 1127-2306) — 산 날부터 판 날(들고 있으면 가장 늦은 종가 날)까지 그 회사 종가 · 점선 = 산 값 · 끝 점 · 오르면 빨강 · 내리면 파랑 · 종가가 둘 넘을 때만 */
export function trPxOf(PX, t) {
  const d = PX?.d, c = PX?.c?.[t.code]; if (!Array.isArray(d) || !Array.isArray(c)) return null;
  const i0 = d.indexOf(t.d0), i1 = d.indexOf(t.d1); if (i0 < 0 || i1 < i0) return null;
  const pts = []; for (let i = i0; i <= i1; i++) if (fin(c[i]) && c[i] > 0) pts.push([i - i0, c[i]]);
  return pts.length >= 2 ? {n: i1 - i0, pts} : null;
}
function trPxLine(PX, t) {
  const S = trPxOf(PX, t); if (!S) return null;
  const vs = [...S.pts.map(([, v]) => v), t.p0], lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || 1, st = stOfD(t.diff);
  const X = i => 6 + (S.n ? i / S.n : 0) * 288, Y = v => 40 - (v - lo) / span * 32, [lx, lv] = S.pts[S.pts.length - 1];
  return s('svg', {class: 'sj-trsp', 'data-st': st, 'data-n': String(S.pts.length), viewBox: '0 0 300 48', preserveAspectRatio: 'none', role: 'img',
      'aria-label': t.co + ' 종가 꺾은선 — ' + mday(t.d0) + ' ' + won(S.pts[0][1]) + '부터 ' + mday(t.d1) + ' ' + won(lv) + '까지 · 점선은 산 값 ' + won(t.p0)},
    s('line', {class: 'sj-trspb', x1: 6, x2: 294, y1: Y(t.p0).toFixed(1), y2: Y(t.p0).toFixed(1)}),
    s('path', {class: 'sj-trspl', d: S.pts.map(([i, v], j) => (j ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ')}),
    s('path', {class: 'sj-trspd', d: 'M' + X(lx).toFixed(1) + ' ' + Y(lv).toFixed(1) + ' h0.01'}));
}
function trRow(t, mode, nameOf, PX = null) {
  const st = stOfD(t.diff), sold = mode === 's';
  return h('li', {class: 'sj-trow', 'data-how': t.how, 'data-st': st, 'data-i': String(t.i)},
    h('p', {class: 'sj-trh'}, h('b', {text: t.co}), h('span', {class: 'sj-trk', text: nameOf(t.k)})),
    h('p', {class: 'sj-trl', 'data-f': 'buy', text: '산 날 ' + mday(t.d0) + ' · 산 값 ' + won(t.p0)}),
    h('p', {class: 'sj-trl', 'data-f': 'sell', text: sold ? '판 날 ' + mday(t.d1) + ' · 판 값 ' + won(t.p1) : mday(t.d1) + ' 종가 ' + won(t.p1)}),
    h('p', {class: 'sj-trl', 'data-f': 'days', text: (sold ? '들고 있은 날 ' : '들고 있는 날 ') + t.days + '일 · ' + (sold ? (t.how === 'c' ? '88원 줄 밑으로 내려 팔았어요' : '정한 날(' + t.n + '일째)에 팔았어요') : '정한 날(' + t.n + '일째)까지 ' + Math.max(0, t.n - t.days) + '일')}),
    trPxLine(PX, t), // 그 회사 값 꺾은선(주문 1127-2306)
    h('p', {class: 'sj-trr sj-res', 'data-st': st}, shapeI(st), h('b', {text: pctText(t.r)}), h('span', {class: 'sj-trm', text: moved(t.diff)})));
}
export async function vTrades(X, mode = 's') {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  const sold = mode === 's', title = sold ? '판 회사' : '산 회사', TR = D ? sellTrades(D) : null;
  if (!TR) return missPage(X, title, '사고 팔기 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const L = sold ? TR.sold : TR.hold, M = sold ? TR.S : TR.H, st = stOfD(M.diff);
  const list = h('ol', {class: 'sj-trl0', 'aria-label': title + ' 목록'}), more = h('button', {class: 'sj-trmore', type: 'button'});
  let shown = 0;
  const fill = () => { const end = Math.min(L.length, shown + (shown ? TR_STEP : TR_FIRST)); for (; shown < end; shown++) list.append(trRow(L[shown], mode, nameOf, D?.sell?.px)); const left = L.length - shown; more.hidden = left <= 0; more.textContent = left > 0 ? Math.min(TR_STEP, left) + '개 더 보기 · 남은 ' + NF.format(left) + '개' : ''; };
  more.addEventListener('click', fill); fill();
  const kids = [
    pageHead({kick: '기록 · ' + (sold ? '판 회사' : '산 회사'), h1: sold ? '판 회사' : '산 회사 · 들고 있는 것', seal: sold ? '팖' : '삼', sealDn: st === 'dn',
      say: sold ? '사고 팔기 셈으로 판 회사예요. 언제 얼마에 사고 팔았는지, 며칠 들고 있었는지 적었어요.' : '사고 팔기 셈으로 사서 아직 들고 있는 회사예요. 정한 날이 오면 그날 종가로 팔아요.',
      more: [h('dl', {class: 'sj-money sj-trsum', 'data-st': st}, // 회사 수 · 그대로 · 지금 값 모두(판 돈 모두) · 판 까닭(주문 1126-2137 · 일꾼 50명이 찾은 빈 곳)
        h('dt', {text: sold ? '판 것' : '들고 있는 것'}), h('dd', {text: NF.format(M.n) + '번 · ' + NF.format(new Set(L.map(t => t.code)).size) + '곳'}),
        h('dt', {text: '오른 · 내린 · 그대로'}), h('dd', {text: NF.format(M.up) + '번 · ' + NF.format(M.dn) + '번 · ' + NF.format(M.n - M.up - M.dn) + '번'}),
        h('dt', {text: sold ? '들고 있은 날' : '들고 있는 날'}), h('dd', {text: '평균 ' + (Math.round(M.days * 10) / 10) + '일'}),
        h('dt', {text: '산 돈'}), h('dd', {text: won(M.cost)}),
        h('dt', {text: sold ? '판 돈 모두' : '지금 값 모두'}), h('dd', {text: won(L.reduce((x, t) => x + t.p1 * TR.q, 0))}),
        ...(sold ? [h('dt', {text: '정한 날 · 88원 줄 밑'}), h('dd', {text: NF.format(L.filter(t => t.how !== 'c').length) + '번 · ' + NF.format(L.filter(t => t.how === 'c').length) + '번'})] : [])),
        h('p', {class: 'sj-res sj-res-big', 'data-st': st}, shapeI(st), h('b', {text: (sold ? '판 것 모두 ' : '지금 값으로 모두 ') + moved(M.diff)})),
        h('p', {class: 'sj-note', text: '날은 장이 열린 날로 셌어요. 모두 종가로 10주씩 샀다고 친 가짜 돈이에요.'})]}),
    h('section', {class: 'sj-sec sj-tr', 'data-mode': sold ? 's' : 'b', 'data-n': String(L.length), 'aria-label': title + ' 낱낱이'},
      head(sold ? '팖' : '삼', sold ? '판 것' : '산 것', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: sold ? '판 날이 늦은 것부터' : '산 날이 늦은 것부터'}), h('span', {class: 'sj-h2n', text: ' ' + NF.format(L.length) + '번'}))),
      L.length ? list : h('p', {class: 'sj-svnote', text: sold ? '아직 판 회사가 없어요.' : '지금 들고 있는 회사가 없어요.'}),
      L.length ? more : null),
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title, page: sold ? 'sold' : 'held', kids, tab: 4, rec: sold ? 6 : 5, next: {href: '#/r/t', label: '두 셈 견줌도 볼까?'}});
}
/* ── 7단 사고판 기록(#/l/t · 주문 1127-1457 · 사장님 2026-11-27(서울) 14:57 「그리고 기록을 누르면 어떤 종목들 매매했고 얼마에 사서 얼마에 매도해서 얼마 수익났는지도 하고 7단 클릭 구조로 만들어」
   · docs/design/record-2026-11-27/order-1457.txt) — 1단 기록 → 2단 판 것 · 들고 있는 것 → 3단 꾀 → 4단 업종 → 5단 종목 → 6단 사고판 건 → 7단 한 건(산 값 · 판 값 · 수익)
   단마다 누르는 줄(48 넘게) · 위에 일곱 단 길(지금 단 · 앞 단은 눌러 돌아감) · 줄마다 몇 번 · 산 돈 → 판 돈(들고 있으면 지금 값) · 수익(▲ 빨강 · ▼ 파랑 · 프로 · 원)
   차례 = 수익률 높은 차례(같으면 이름 차례) · 사고 팔기 셈(sell-v1 · 종가 · 10주 · 가짜 돈) · 「매수 · 매도」는 「산 · 판」 ── */
export const WK7 = Object.freeze(['기록', '판 것 · 들고 있는 것', '꾀', '업종', '종목', '사고판 건', '한 건']);
const wkHref = segs => '#/l/t' + segs.map(x => '/' + encodeURIComponent(x)).join('');
export const wkSum = (L, q) => { const c = L.reduce((a, t) => a + t.p0 * q, 0), v = L.reduce((a, t) => a + t.p1 * q, 0); return {n: L.length, c, v, d: v - c, r: c > 0 ? v / c - 1 : 0}; };
const wkInd = D => c => (typeof D?.co?.[c]?.[1] === 'string' && D.co[c][1].trim()) || '그 밖 업종';
const wkRes = m => { const st = stOfD(m.d); return h('span', {class: 'sj-wkg sj-res', 'data-st': st}, shapeI(st), h('b', {text: glRateT(m.r)}), h('span', {class: 'sj-wkgm', text: moved(m.d)})); };
function wkRow(href, title, sub, m, held) {
  return h('li', {class: 'sj-wki', 'data-st': stOfD(m.d)}, h('a', {class: 'sj-wkrow', href},
    h('span', {class: 'sj-wkt'}, h('b', {text: title}), sub ? h('span', {class: 'sj-wks', text: sub}) : null),
    h('span', {class: 'sj-wkm', text: NF.format(m.n) + '번 · 산 돈 ' + won(m.c) + ' → ' + (held ? '지금 ' : '판 돈 ') + won(m.v)}),
    wkRes(m), h('i', {class: 'sj-wkgo', 'aria-hidden': 'true', text: '›'})));
}
/** 묶기 — L 을 key 로 나눠 [key, 묶음, 셈] · 수익률 높은 차례(같으면 이름 차례) */
const wkGroup = (L, key, q, name) => { const m = new Map(); for (const t of L) { const k = key(t); if (!m.has(k)) m.set(k, []); m.get(k).push(t); }
  return [...m.entries()].map(([k, G]) => [k, G, wkSum(G, q)]).sort((a, b) => b[2].r - a[2].r || String(name(a[0])).localeCompare(String(name(b[0])))); };
export async function vWalk(X, rest = '') {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  const TR = D ? sellTrades(D) : null;
  if (!TR) return missPage(X, '7단 사고판 기록', '사고 팔기 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const q = TR.q, ind = wkInd(D), seg = String(rest ?? '').split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch { return x; } }).slice(0, 5);
  const [st, k, iv, code, ix] = seg, held = st === 'h';
  // 단마다 거르기 — 맞는 것이 없으면 그 앞 단까지만
  const LV = [[...TR.sold, ...TR.hold]];
  if (st === 's' || st === 'h') LV.push(held ? TR.hold : TR.sold);
  if (LV.length === 2 && k != null && KKOE.test(k)) LV.push(LV[1].filter(t => t.k === k));
  if (LV.length === 3 && iv != null) LV.push(LV[2].filter(t => ind(t.code) === iv));
  if (LV.length === 4 && code != null) LV.push(LV[3].filter(t => t.code === code));
  if (LV.length === 5 && ix != null) LV.push(LV[4].filter(t => String(t.i) === ix));
  while (LV.length > 1 && !LV[LV.length - 1].length) LV.pop();
  const lv = LV.length - 1, segs = seg.slice(0, lv), L = LV[lv]; // lv 0 = 2단(판 것 · 들고 있는 것 고르기) … lv 5 = 7단(한 건)
  const coOf = c => D.co?.[c]?.[0] ?? c, labels = [st === 'h' ? '들고 있는 것' : '판 것', lv >= 2 ? nameOf(k) : '', lv >= 3 ? iv : '', lv >= 4 ? coOf(code) : '', lv >= 5 && L[0] ? mday(L[0].d0) + ' 산 것' : ''];
  const step = lv + 2, hrefs = Array.from({length: 6}, (_, i) => wkHref(seg.slice(0, i)));
  const path = h('ol', {class: 'sj-wkp', 'aria-label': '일곱 단 길 — 지금 ' + step + '단'},
    ...WK7.map((w, i) => { const on = i + 1 === step, done = i + 1 < step, t = (i + 1) + '단 ' + (i >= 1 && i <= lv ? labels[i - 1] : w);
      return h('li', {class: on ? 'sj-wkon' : done ? 'sj-wkdone' : 'sj-wknext', 'aria-current': on ? 'step' : null}, done ? h('a', {href: i === 0 ? '#/l/a' : hrefs[i - 1], text: t}) : h('span', {text: t})); }));
  const all = wkSum(L, q);
  let body;
  if (lv === 0) body = h('ol', {class: 'sj-wkl'}, wkRow(wkHref(['s']), '판 것', '정한 날이나 88원 줄 밑에서 판 것', wkSum(TR.sold, q), false), wkRow(wkHref(['h']), '들고 있는 것', '아직 들고 있는 것(그날 종가로 셈)', wkSum(TR.hold, q), true));
  else if (lv === 1) body = h('ol', {class: 'sj-wkl'}, ...wkGroup(L, t => t.k, q, nameOf).map(([kk, , m]) => wkRow(wkHref([st, kk]), nameOf(kk), null, m, held)));
  else if (lv === 2) body = h('ol', {class: 'sj-wkl'}, ...wkGroup(L, t => ind(t.code), q, x => x).map(([x, , m]) => wkRow(wkHref([st, k, x]), x, null, m, held)));
  else if (lv === 3) body = h('ol', {class: 'sj-wkl'}, ...wkGroup(L, t => t.code, q, coOf).map(([c, , m]) => wkRow(wkHref([st, k, iv, c]), coOf(c), c, m, held)));
  else if (lv === 4) body = h('ol', {class: 'sj-wkl'}, ...[...L].sort((a, b) => String(b.d0).localeCompare(String(a.d0)) || a.i - b.i).map(t => wkRow(wkHref([st, k, iv, code, String(t.i)]), mday(t.d0) + ' 산 것', held ? mday(t.d1) + ' 종가까지' : mday(t.d1) + ' 판 것', wkSum([t], q), held)));
  else { const t = L[0], m = wkSum([t], q);
    body = h('div', {class: 'sj-wk1'},
      h('dl', {class: 'sj-wkdl'},
        h('dt', {text: '회사'}), h('dd', {text: coOf(t.code) + ' · ' + t.code}),
        h('dt', {text: '꾀 · 업종'}), h('dd', {text: nameOf(t.k) + ' · ' + ind(t.code)}),
        h('dt', {text: '산 날 · 산 값'}), h('dd', {text: mday(t.d0) + ' · 한 주 ' + won(t.p0)}),
        h('dt', {text: '산 돈'}), h('dd', {text: won(t.p0 * q) + '(' + q + '주)'}),
        h('dt', {text: held ? '지금 값' : '판 날 · 판 값'}), h('dd', {text: mday(t.d1) + (held ? ' 종가 · 한 주 ' : ' · 한 주 ') + won(t.p1)}),
        h('dt', {text: held ? '지금 값 모두' : '판 돈'}), h('dd', {text: won(t.p1 * q) + '(' + q + '주)'}),
        h('dt', {text: held ? '들고 있는 날' : '들고 있은 날'}), h('dd', {text: t.days + '일 · ' + (held ? '정한 날(' + t.n + '일째)까지 ' + Math.max(0, t.n - t.days) + '일' : t.how === 'c' ? '88원 줄 밑으로 내려 팔았어요' : '정한 날(' + t.n + '일째)에 팔았어요')})),
      h('p', {class: 'sj-wkbig', 'data-st': stOfD(m.d)}, h('span', {class: 'sj-wkbk', text: '수익'}), wkRes(m))); }
  const title = step + '단 · ' + (lv === 0 ? '판 것 · 들고 있는 것' : labels[lv - 1]);
  const kids = [
    h('section', {class: 'sj-sec sj-wk', 'data-lv': String(step), 'data-n': String(L.length), 'aria-label': '7단 사고판 기록'},
      h('p', {class: 'sj-k', text: '기록 · 7단 사고판 기록'}),
      h('h1', {class: 'sj-wkh1', text: title}),
      path,
      lv < 5 ? h('p', {class: 'sj-wksum'}, h('span', {text: (lv === 0 ? '모두 ' : '이 안에 ') + NF.format(all.n) + '번 · 산 돈 ' + won(all.c) + ' → ' + (lv === 0 ? '판 돈과 지금 값 ' : held ? '지금 ' : '판 돈 ') + won(all.v)}), wkRes(all)) : null,
      lv < 5 ? h('p', {class: 'sj-gllead', text: (lv === 0 ? '눌러서 한 단씩 들어가요. ' : '') + (lv < 4 ? '수익률이 높은 차례예요.' : '산 날이 늦은 것부터예요.')}) : null,
      body,
      lv > 0 ? h('a', {class: 'sj-go sj-wkback', href: hrefs[lv - 1]}, h('span', {text: '한 단 위로'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      h('p', {class: 'sj-note', text: '오르면 빨강 ▲, 내리면 파랑 ▼이에요. 모두 종가로 10주씩 샀다고 친 가짜 돈이에요.'})),
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title: '7단 사고판 기록', page: 'walk', kids, tab: 4, rec: 7, next: lv < 5 ? null : {href: '#/l/t', label: '처음 단으로 볼까?'}});
}
/* ── 한눈에(#/l/a · 주문 1125-2101 · 사장님 2026-11-25(서울) 20:52 「전체 투자 자산, 수익률, 자산 배분, 기간별 추이까지 한 화면에서 … 어떠한 꾀가 많이 골랐던 업종이 어떠한 분야였는지 그림으로도 한 눈에」 · 21:01 「응 한시간 이내 만들어」) ──
 *  사고 팔기 셈(sell-v1 · 종가 · 10주) 모두 — 들인 돈 · 지금 값(판 돈 + 들고 있는 회사 가장 늦은 종가) · 늘고 준 돈 · 프로
 *  지금 값 나눔 = 들고 있는 회사 업종별 + 판 돈(동그라미) · 지나온 흐름 = 쌓인 장부 전체(tt · 사기만 셈 · 기간 고르기) · 꾀마다 고른 업종(모든 산 셈 번수 · 막대 = 가장 많이 · 두 번째 · 나머지)
 *  업종 색 = 들고 있는 값 큰 업종 여덟(같으면 고른 번수 · 이름 차례) · 나머지는 「그 밖 업종」 회색 · 빨강 없음 · 그림 속 글 없음(글은 밖) · 인라인 꾸밈 없음 */
const GL_COL = Object.freeze(['#20323A', '#2F7F86', '#D99A00', '#5B6FB5', '#7FB08F', '#A07A4A', '#8A6FB0', '#4F9A6B']), GL_ETC = '#B9C6CA', GL_CASH = '#E6D9B8', GL_ETCN = '그 밖 업종', GL_K1 = '#20323A', GL_K2 = '#2F7F86';
export const glIeyo = w => { const c = String(w ?? '').trim().slice(-1).charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 === 0 ? '예요' : '이에요'; }; // 받침 없으면 「예요」
export const glShare = (a, b) => (b > 0 ? Math.round(a / b * 100) : 0);
export function glanceOf(D) {
  const TR = sellTrades(D); if (!TR) return null;
  const q = TR.q, all = [...TR.hold, ...TR.sold], indOf = code => (typeof D.co?.[code]?.[1] === 'string' && D.co[code][1].trim()) || GL_ETCN;
  const cost = all.reduce((a, t) => a + t.p0 * q, 0), cash = TR.sold.reduce((a, t) => a + t.p1 * q, 0), held = TR.hold.reduce((a, t) => a + t.p1 * q, 0), val = cash + held;
  const pickN = new Map(); for (const t of all) { const i = indOf(t.code); pickN.set(i, (pickN.get(i) ?? 0) + 1); }
  const heldV = new Map(); for (const t of TR.hold) { const i = indOf(t.code); heldV.set(i, (heldV.get(i) ?? 0) + t.p1 * q); } // 색 차례 = 들고 있는 값 큰 업종 → 고른 번수 → 이름
  const top = [...pickN.keys()].filter(i => i !== GL_ETCN).sort((a, b) => (heldV.get(b) ?? 0) - (heldV.get(a) ?? 0) || pickN.get(b) - pickN.get(a) || a.localeCompare(b)).slice(0, GL_COL.length);
  const keyOf = i => (top.includes(i) ? i : GL_ETCN), colOf = i => (top.includes(i) ? GL_COL[top.indexOf(i)] : GL_ETC);
  const byInd = new Map(); for (const t of TR.hold) { const k = keyOf(indOf(t.code)); byInd.set(k, (byInd.get(k) ?? 0) + t.p1 * q); }
  const parts = [...top.filter(i => byInd.has(i)).map(i => ({name: i, v: byInd.get(i), col: colOf(i)})), ...(byInd.has(GL_ETCN) ? [{name: GL_ETCN, v: byInd.get(GL_ETCN), col: GL_ETC}] : []), ...(cash > 0 ? [{name: '판 돈', v: cash, col: GL_CASH, cash: true}] : [])];
  const per = new Map(); for (const t of all) { const m = per.get(t.k) ?? {n: 0, raw: new Map(), seg: new Map()}; const i = indOf(t.code); m.n++; m.raw.set(i, (m.raw.get(i) ?? 0) + 1); m.seg.set(keyOf(i), (m.seg.get(keyOf(i)) ?? 0) + 1); per.set(t.k, m); }
  const kk = [...per.keys()].sort().map(k => { const m = per.get(k), L = [...m.raw.entries()].filter(([i]) => i !== GL_ETCN).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), best = L[0] ?? null, next = L[1] ?? null, rest = m.n - (best?.[1] ?? 0) - (next?.[1] ?? 0);
    return {k, n: m.n, best, next, segs: [...(best ? [{name: best[0], c: best[1], col: GL_K1}] : []), ...(next ? [{name: next[0], c: next[1], col: GL_K2}] : []), ...(rest > 0 ? [{name: '나머지 업종', c: rest, col: GL_ETC}] : [])]}; }); // 막대 = 그 꾀가 가장 많이 고른 업종(진한 색) · 두 번째(청록) · 나머지(회색)
  return {q, cost, val, cash, held, diff: val - cost, r: cost > 0 ? val / cost - 1 : 0, n: all.length, nHold: TR.hold.length, nSold: TR.sold.length, parts, top, kk};
}
/* 꾀별 나눔 서른여섯 꾀 모두(주문 1127-0938 · 사장님 2026-11-27(서울) 09:38 「지금은 몇개만 표현했다 36개 모두를 표기 하라」 · docs/design/record-2026-11-27/order-0938.txt)
   색 = 여섯 집안(먹 · 청록 · 금 · 남 · 쑥 · 밤) × 여섯 단(진함 → 옅음) — 지금 값 큰 차례로 집안을 돌려 이웃 조각은 늘 다른 집안 · 첫 여섯은 옛 색 그대로 · 빨강 없음 */
const GL_FAM = Object.freeze([['#20323A', '#3B5562', '#56717E', '#7690A0', '#9CB2BE', '#C3D3DA'], ['#2F7F86', '#4B959B', '#68AAAF', '#88BFC3', '#ABD3D6', '#CDE6E8'], ['#D99A00', '#E2AC2E', '#E8BD59', '#EECD84', '#F3DDAD', '#F8EDD4'],
  ['#5B6FB5', '#7383C1', '#8C99CD', '#A6AFDA', '#C1C8E6', '#DDE1F2'], ['#7FB08F', '#93BDA1', '#A7CAB3', '#BCD7C5', '#D0E4D7', '#E5F1E9'], ['#A07A4A', '#B08E63', '#C0A27D', '#D0B798', '#DFCCB4', '#EFE3D3']]);
export const GL_COL36 = Object.freeze(Array.from({length: 36}, (_, j) => GL_FAM[j % 6][Math.floor(j / 6)]));
const GL_PALE = new Set(GL_FAM.flatMap(f => f.slice(3))); // 옅은 단 — 이름표 점에 테두리(흰 바탕에서도 보이게)
const glDot = col => s('svg', {class: 'sj-gldot', viewBox: '0 0 10 10', 'aria-hidden': 'true'}, s('rect', {x: 0.5, y: 0.5, width: 9, height: 9, rx: 4.5, fill: col, ...(GL_PALE.has(col) ? {stroke: '#7690A0', 'stroke-width': 1} : {})}));
const GL_LIGHT = new Set([GL_ETC, GL_CASH, '#7FB08F', '#D99A00', ...GL_FAM.flatMap((f, i) => (i === 2 || i === 4 ? f : f.slice(2)))]); // 밝은 조각 위 숫자는 먹색
export const glWonS = v => { const a = Math.abs(v); return a >= 1e8 ? (Math.round(a / 1e6) / 100).toFixed(2) + '억' : a >= 1e4 ? NF.format(Math.round(a / 1e4)) + '만' : NF.format(Math.round(a)); }; // 동그라미 가운데 줄인 값(14.48억 · 7,575만)
function glDonut(parts) { // 동그라미(보내 주신 본보기 그대로 — 조각 · 조각 안 몫 숫자 · 가운데 총 자산은 글로 겹침) · 12시에서 시계 방향 · 140 × 140 그대로(글 17 그대로 보이게)
  const tot = parts.reduce((a, x) => a + x.v, 0), R = 54, C = 2 * Math.PI * R; let at = 0;
  const arcs = [], labs = [];
  for (const x of parts) {
    const f = tot > 0 ? x.v / tot : 0, len = f * C, gap = parts.length > 1 && len > 3 ? 2 : 0, mid = (at + len / 2) / C * 2 * Math.PI - Math.PI / 2, sh = glShare(x.v, tot);
    arcs.push(s('circle', {cx: 70, cy: 70, r: R, fill: 'none', stroke: x.col, 'stroke-width': 28, transform: 'rotate(-90 70 70)', 'stroke-dasharray': Math.max(0, len - gap).toFixed(2) + ' ' + (C - len + gap).toFixed(2), 'stroke-dashoffset': (-at).toFixed(2), 'data-part': x.name}));
    if (sh >= 8) labs.push(s('text', {class: 'sj-pfsl' + (GL_LIGHT.has(x.col) ? ' sj-pfsl-dk' : ''), x: (70 + R * Math.cos(mid)).toFixed(1), y: (70 + R * Math.sin(mid)).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'aria-hidden': 'true', text: String(sh)}));
    at += len;
  }
  return s('svg', {class: 'sj-gldo', viewBox: '0 0 140 140', width: 140, height: 140, role: 'img', 'aria-label': '나눔 — ' + parts.map(x => x.name + ' ' + glShare(x.v, tot) + '프로').join(' · ')}, s('circle', {cx: 70, cy: 70, r: R, fill: 'none', stroke: '#EEF3F2', 'stroke-width': 28}), ...arcs, ...labs);
}
export const GL_SPAN = Object.freeze([['1개월', 21], ['3개월', 63], ['6개월', 126], ['1년', 250]]); // 본보기 그대로 넷 · 앞 기간보다 쌓인 날이 많아야 누를 수 있음
export const glPp = r => { const v = Math.round(r * 1000) / 10; return (v > 0 ? '+' : v < 0 ? '-' : '') + Math.abs(v).toFixed(1) + '프로'; }; // 눈금 글(+1.0프로 · 0.0프로 · -2.5프로)
export function glTT(D) { const T = D?.sell?.tt; if (!T || !Array.isArray(T.days)) return []; return T.days.map((d, i) => [d, T.c?.[i], T.v?.[i]]).filter(([d, c, v]) => typeof d === 'string' && fin(c) && c > 0 && fin(v)).map(([d, c, v]) => [d, v / c - 1]); }
function glTrend(D) { // 최근 수익률 추이(보내 주신 본보기 그대로 — 제목 · 기간 넷 한 덩이 · 끝 값 말풍선 · 왼쪽 눈금 셋 · 옅은 가로줄 · 점 찍은 꺾은선과 밑 칠 · 아래 날짜) — 사고 팔기 셈 날마다(sell.tt)
  // 점 누르기(주문 1127-1705 · 사장님 2026-11-27(서울) 17:05 「어」 — 「다음은 꺾은선의 점을 누르면 그날 숫자가 뜨게 할까요?」의 답 · docs/design/record-2026-11-27/order-1705.txt)
  //   그림을 누르면 가장 가까운 장날 · 「앞 장날 · 뒤 장날」 단추(48 넘게) — 고른 날에 세로 줄 · 큰 점 · 아래 칸에 그날 수익률(▲ 빨강 · ▼ 파랑) · 늘고 준 돈 · 들인 돈 · 그날 값 · 처음엔 마지막 날
  const T = D?.sell?.tt, P = !T || !Array.isArray(T.days) ? [] : T.days.map((d, i) => [d, T.c?.[i], T.v?.[i]]).filter(([d, c, v]) => typeof d === 'string' && fin(c) && c > 0 && fin(v)).map(([d, c, v]) => [d, v / c - 1, c, v]);
  if (P.length < 2) return h('section', {class: 'sj-sec sj-pftr', 'data-n': String(P.length)}, h('h2', {class: 'sj-pfh2', text: '최근 수익률 추이'}), h('p', {class: 'sj-gllead', text: '아직 쌓인 날이 이틀이 안 돼요.'}));
  const svg = s('svg', {class: 'sj-gltrs', viewBox: '0 0 300 150', preserveAspectRatio: 'none', 'aria-hidden': 'true'}), yl = h('div', {class: 'sj-pfy', 'aria-hidden': 'true'}), xl = h('div', {class: 'sj-pfx'}), last = h('p', {class: 'sj-pflast sj-res'}), cap = h('p', {class: 'sj-gltrc'});
  const prev = h('button', {class: 'sj-glpkb', type: 'button', 'data-go': '-1', text: '‹ 앞 장날'}), next = h('button', {class: 'sj-glpkb', type: 'button', 'data-go': '1', text: '뒤 장날 ›'}), dayB = h('b', {class: 'sj-glpkd'});
  const pkh = h('p', {class: 'sj-glpkh'}), pkt = h('p', {class: 'sj-glpkt'}), pick = h('div', {class: 'sj-glpk', 'aria-live': 'polite'}, h('div', {class: 'sj-glpkn', role: 'group', 'aria-label': '그날 보기'}, prev, dayB, next), pkh, pkt);
  let L = P, sel = 0, X = () => 0, Y = () => 0;
  const mark = () => { // 고른 날 — 세로 줄 · 큰 점 · 아래 칸
    svg.querySelectorAll('.sj-glpkl, .sj-glpkc').forEach(e => e.remove());
    const [d, r, c, v] = L[sel], x = X(sel).toFixed(1), y = Y(r).toFixed(1), st = stOfD(v - c);
    svg.append(s('line', {class: 'sj-glpkl', x1: x, x2: x, y1: 0, y2: 150}), s('path', {class: 'sj-glpkc', d: 'M' + x + ' ' + y + ' l0 0'}));
    pick.dataset.day = d; pick.dataset.i = String(sel);
    dayB.textContent = mday(d) + '(' + glWk(d) + ')';
    pkh.replaceChildren(h('span', {class: 'sj-glpkk', text: '수익률'}), h('span', {class: 'sj-wkg sj-res', 'data-st': st}, shapeI(st), h('b', {text: glRateT(r)}), h('span', {class: 'sj-wkgm', text: moved(v - c)})));
    pkt.textContent = '들인 돈 ' + won(c) + ' · 그날 값 ' + won(v);
    prev.disabled = sel <= 0; next.disabled = sel >= L.length - 1;
  };
  const go = i => { sel = Math.max(0, Math.min(L.length - 1, i)); mark(); };
  prev.addEventListener('click', () => go(sel - 1)); next.addEventListener('click', () => go(sel + 1));
  svg.addEventListener('click', e => { const q = svg.getBoundingClientRect(); if (!(q.width > 0)) return; const x = (e.clientX - q.left) / q.width * 300; go(L.length > 1 ? Math.round((x - 5) / 290 * (L.length - 1)) : 0); });
  const draw = ([t, n]) => {
    L = P.slice(-(n + 1)); const vs = L.map(x => x[1]), mx = Math.max(-Math.min(0, ...vs), Math.max(0, ...vs)) || 0.01, y0 = -mx * 1.15, y1 = mx * 1.15; // 0 을 가운데에 — 가운데 눈금 「0.0프로」 = 점선(주문 1126-2137 · 일꾼 19 「점선이 0이라는데 눈금은 −0.7」)
    X = i => (L.length > 1 ? i / (L.length - 1) * 290 + 5 : 150); Y = v => 146 - (v - y0) / (y1 - y0) * 142;
    const pts = L.map((x, i) => [X(i).toFixed(1), Y(x[1]).toFixed(1)]), line = pts.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join(' ');
    svg.replaceChildren(s('rect', {class: 'sj-gltrbg', x: 0, y: 0, width: 300, height: 150}), ...[4, 75, 146].map(y => s('line', {class: 'sj-pfgrid', x1: 0, x2: 300, y1: y, y2: y})), s('line', {class: 'sj-gltr100', x1: 0, x2: 300, y1: Y(0).toFixed(1), y2: Y(0).toFixed(1)}),
      s('path', {class: 'sj-pfarea', d: line + ' L' + pts[pts.length - 1][0] + ' 150 L' + pts[0][0] + ' 150 Z'}), s('path', {class: 'sj-gltrp', d: line, 'data-n': String(L.length)}),
      ...pts.map(([x, y], i) => s('path', {class: 'sj-pfdot' + (i === pts.length - 1 ? ' sj-pfdot-end' : ''), d: 'M' + x + ' ' + y + ' l0 0'})));
    yl.replaceChildren(...[y1, (y0 + y1) / 2, y0].map(v => h('span', {text: glPp(v)})));
    xl.replaceChildren(...[L[0][0], L[Math.floor((L.length - 1) / 2)][0], L[L.length - 1][0]].map(d => h('span', {text: mday(d)})));
    const r = L[L.length - 1][1], st = stOfD(Math.round(r * 1000));
    last.dataset.st = st; last.replaceChildren(shapeI(st), h('b', {text: glPp(r)}));
    cap.textContent = mday(L[0][0]) + '부터 ' + mday(L[L.length - 1][0]) + '까지 · 장날 ' + L.length + '일 · ' + mday(L[L.length - 1][0]) + ' ' + pctText(r);
    for (const b of btns) b.setAttribute('aria-pressed', b.dataset.span === t ? 'true' : 'false');
    go(L.length - 1); // 기간을 바꾸면 마지막 날부터
  };
  const btns = GL_SPAN.map(([t, n], j) => { const on = j === 0 || P.length - 1 > GL_SPAN[j - 1][1], b = h('button', {class: 'sj-glsp', type: 'button', 'data-span': t, text: t, disabled: on ? null : ''}); if (on) b.addEventListener('click', () => draw([t, n])); return b; });
  draw(GL_SPAN[0]);
  return h('section', {class: 'sj-sec sj-pftr', 'data-n': String(P.length), 'aria-label': '최근 수익률 추이'},
    h('div', {class: 'sj-pftrhd'}, h('h2', {class: 'sj-pfh2', text: '최근 수익률 추이'}), h('div', {class: 'sj-glsps', role: 'group', 'aria-label': '기간 고르기'}, ...btns)),
    last, h('div', {class: 'sj-pfch'}, yl, svg, h('i', {class: 'sj-pfxs', 'aria-hidden': 'true'}), xl), cap, pick,
    h('p', {class: 'sj-gllead', text: '꾀 서른여섯이 사고 판 것을 날마다 모두 합쳐, 들인 돈보다 몇 프로 늘고 줄었는지 그렸어요. 점선이 0이에요. 그림의 점이나 「앞 장날 · 뒤 장날」을 누르면 그날 숫자가 나와요. 쌓인 날보다 긴 기간 단추는 날이 쌓이면 눌려요.'}));
}
/* ── 날마다 보기 · 총 보유 금액 · 보유 종목(주문 1126-2137 · 사장님 2026-11-26(서울) 21:37 「총 매수 금액은 표기 되어 있는대 총 보유 금액은 표기가 되어 있지 않아 그리고 몇종목 보유하고 있는지
   수자가 나타나지 않고 있고 날짜별 표기와 기타등등은 에이전트 50개 가동해서 뭐가 더 필요한지 찾아내서 더 채워라」 — docs/design/record-2026-11-26/order-2137.txt · 일꾼 50명의 답 rec50-sum.md)
   날마다 = 장부가 날마다 적은 sell.tt(c 그날까지 들인 돈 · v 그날 값 모두 = 들고 있는 것 그날 종가 + 판 돈) + 그날 산 것 · 판 것 · 그날 끝에 들고 있는 것(번 · 곳) · 새 날이 위 · 처음 다섯 날 + 「더 보기」
   늘어난 날도 줄어든 날도 같은 크기 · 같은 모양(▲ · ▼ · ―) · 가장 좋은 날 뽐내기 없음 · 가짜 돈 · 앞날을 맞히지 않음 ── */
const GL_WK = '일월화수목금토';
export const glWk = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? '')); return m ? GL_WK[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()] : ''; };
/** [{d, c, v, g = v − c, dg = 앞 장날보다 바뀐 g(첫날 null), nBuy, nSell, nHeld, cHeld(곳)}] · 날 차례(옛 날 → 새 날) */
export function glDays(D) {
  const TR = sellTrades(D), T = D?.sell?.tt;
  if (!TR || !T || !Array.isArray(T.days)) return [];
  const all = [...TR.hold, ...TR.sold], R = T.days.map((d, i) => [d, T.c?.[i], T.v?.[i]]).filter(([d, c, v]) => typeof d === 'string' && fin(c) && c > 0 && fin(v));
  return R.map(([d, c, v], j) => {
    const held = all.filter(t => t.d0 <= d && (t.how === 'h' || t.d1 > d));
    return {d, c, v, g: v - c, dg: j ? (v - c) - (R[j - 1][2] - R[j - 1][1]) : null, nBuy: all.filter(t => t.d0 === d).length, nSell: TR.sold.filter(t => t.d1 === d).length, nHeld: held.length, cHeld: new Set(held.map(t => t.code)).size};
  });
}
const GL_DAY0 = 5; // 처음 보이는 날 수(새 날부터) — 나머지는 「더 보기」
const glVs = (lab, v) => (Math.round(v) === 0 ? lab + '과 같아요' : lab + '보다 ' + moved(v)); // 「앞 장날보다 ○원 늘었어요」 · 같으면 「앞 장날과 같아요」
function glDaySec(R) {
  if (!R.length) return null;
  const L = [...R].reverse(), ol = h('ol', {class: 'sj-gldl'}), more = h('button', {class: 'sj-gldmore', type: 'button'});
  const row = x => { const st = stOfD(x.g), sd = x.dg == null ? null : stOfD(x.dg);
    return h('li', {class: 'sj-gldr', 'data-day': x.d, 'data-st': st},
      h('p', {class: 'sj-gldh'}, h('b', {text: mday(x.d) + '(' + glWk(x.d) + ')'}),
        sd ? h('span', {class: 'sj-gldd sj-res', 'data-st': sd}, shapeI(sd), h('span', {text: glVs('앞 장날', x.dg)})) : h('span', {class: 'sj-gldd', text: '첫날이에요'})),
      h('p', {class: 'sj-gldt', 'data-f': 'n', text: '산 것 ' + NF.format(x.nBuy) + '번 · 판 것 ' + NF.format(x.nSell) + '번 · 들고 있는 것 ' + NF.format(x.nHeld) + '번(' + NF.format(x.cHeld) + '곳)'}),
      h('p', {class: 'sj-gldt', 'data-f': 'won', text: '들인 돈 ' + won(x.c) + ' · 그날 값 ' + won(x.v)}),
      h('p', {class: 'sj-gldg sj-res', 'data-st': st}, shapeI(st), h('span', {text: glVs('들인 돈', x.g)}))); };
  let shown = 0;
  const fill = all => { const end = all ? L.length : Math.min(L.length, GL_DAY0); for (; shown < end; shown++) ol.append(row(L[shown])); const left = L.length - shown; more.hidden = left <= 0; more.textContent = left > 0 ? '남은 ' + NF.format(left) + '날 더 보기' : ''; };
  more.addEventListener('click', () => fill(true)); fill(false);
  const short = R.length < 20 ? ' 기록이 ' + NF.format(R.length) + '일뿐이라, 오르고 내림이 우연일 수 있어요.' : '';
  return h('section', {class: 'sj-sec sj-glday', 'data-n': String(R.length), 'aria-label': '날마다 보기'},
    h('h2', {class: 'sj-pfh2', text: '날마다 보기'}),
    h('p', {class: 'sj-gllead', text: '장이 열린 날마다, 그날 종가로 센 값이에요. 새 날이 위예요.' + short}),
    ol, more,
    h('p', {class: 'sj-gllead', text: '「그날 값」은 그날 들고 있던 것의 종가 값과 그때까지 판 돈을 더한 값이에요. 모두 가짜 돈이에요.'}));
}
/* 꾀별 이름표 한 줄(주문 1127-1137 · 사장님 2026-11-27(서울) 11:37 「매수한 비중이라고 표기하고 그래서 수익률이 얼마인지도 표기하라」 · docs/design/record-2026-11-27/order-1137.txt)
   윗줄 = 점 · 꾀 이름 · 「산 비중 ○프로」(모든 산 돈 가운데 그 꾀가 쓴 몫 · 동그라미 조각과 같은 셈) · 아랫줄 = 「산 돈 ○원」 · 「수익률 ▲ ○프로」(그 꾀의 지금 값 ÷ 산 돈 − 1)
   「매수」는 사이트 규칙대로 「산」 · 오른 것도 내린 것도 같은 크기 · 같은 모양(▲ · ▼ · ―)
   주문 1127-1244(사장님 2026-11-27(서울) 12:44 「배치를 수익률순으로 하고 수익은 빨강 화살펴 내림은 파랑으로 해」 · docs/design/record-2026-11-27/order-1244.txt) — 차례 = 수익률 높은 차례 · 오름 ▲ 과 그 프로 = 빨강 · 내림 ▼ 과 그 프로 = 파랑(이 줄에만 · 사장님 말씀) */
export const GL_KCAP = Object.freeze(['서른여섯 꾀 모두예요. 수익률이 높은 차례예요.', '산 비중은 모든 산 돈에서 그 꾀가 쓴 몫이에요.', '수익률은 그 꾀가 쓴 돈이 지금 몇 프로 늘거나 줄었는지예요. 판 것은 판 돈으로 셌어요.', '꾀 줄을 누르면 그 꾀가 사고판 회사가 나와요.']); // 세 줄(한 줄씩 끊어 「산 비중」이 갈라지지 않게)
export const glRateT = r => Math.abs(Math.round(r * 1000) / 10).toFixed(1) + '프로'; // 「2.5프로」 — 오르내림은 앞 모양(▲ · ▼ · ―)으로
/* ── 꾀마다 수익률 추이(주문 1127-1412 · 사장님 2026-11-27(서울) 14:12 「꾀별로 꺾은선 그래프를 만들어 자료를 수집한 날부터 지금까지 수익률 변화를 꺾은선 그래프로 36개 전부 다해」 · docs/design/record-2026-11-27/order-1412.txt)
   자료 = 장부가 날마다 꾀마다 적은 sell.tk(산 돈 c · 그날 값 v — tt 와 같은 날 · 같은 셈 · 꾀를 모두 더하면 tt) · 그날 수익률 = v ÷ c − 1
   그림 서른여섯 = 이름표와 같은 차례(수익률 높은 차례) · 눈금은 서른여섯 모두 같음(가장 크게 움직인 꾀에 맞춤 · 크기를 견줄 수 있게) · 가운데 점선 = 0
   오른 꾀 = 빨강 꺾은선 · 내린 꾀 = 파랑(주문 1127-1244 와 같은 색) · 첫 산 날 전은 그리지 않음 · 그림 속 글 없음(글은 밖 · 17 넘게) ── */
const glPctS = v => { const a = Math.round(v * 1000) / 10; return (a % 1 === 0 ? a.toFixed(0) : a.toFixed(1)) + '프로'; }; // 눈금 글(10프로 · 2.5프로)
export function glKSeries(D, keys) { // → {days, mx, S: [{k, r: [날마다 수익률 | null]}]} · 자료가 없으면 null
  const T = D?.sell?.tt, K = D?.sell?.tk;
  if (!T || !K || !Array.isArray(T.days) || T.days.length < 2 || !Array.isArray(K.k) || K.k.length !== 36 || !Array.isArray(K.c) || !Array.isArray(K.v)) return null;
  const at = new Map(K.k.map((k, j) => [k, j]));
  const S = keys.map(k => { const j = at.get(k); return {k, r: T.days.map((d, i) => { const c = j == null ? null : K.c[j]?.[i], v = j == null ? null : K.v[j]?.[i]; return fin(c) && c > 0 && fin(v) ? v / c - 1 : null; })}; });
  const top = Math.max(0, ...S.flatMap(o => o.r.filter(v => v != null).map(v => Math.abs(v))));
  const mx = [0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1, 2, 5, 10].find(s => s >= top) ?? Math.ceil(top);
  return {days: T.days, mx, S};
}
/** 꾀 한 가지 사고판 회사(주문 1127-2155 · 사장님 2026-11-27(서울) 21:55 「여기를 클릭하면 어떤 종목을 매수 매도 했고 지금 보유하고 있는 종목들이 나오게 하고 언제 사고 얼마에 사서 얼마가 됐는지 그리고 꺾은선 그래프로 나오게 하고 수익이 높은 순으로 배열해라」)
 *  #/l/k/g01 — 한눈에 꾀 줄을 누르면 · 맨 위 = 이 꾀 모두(산 돈 · 지금 값 · 수익률) · 꺾은선 = 이 꾀 날마다 수익률(sell.tk) · 줄 = 판 것 + 들고 있는 것을 수익률 높은 차례(같으면 늘어난 돈 · 산 날 늦은 차례) · 위 일곱 + 더 보기 */
export const ktrRows = (TR, k) => [...TR.sold.map(t => ({t, m: 's'})), ...TR.hold.map(t => ({t, m: 'b'}))].filter(x => x.t.k === k)
  .sort((a, b) => b.t.r - a.t.r || b.t.diff - a.t.diff || String(b.t.d0).localeCompare(String(a.t.d0)) || a.t.i - b.t.i);
function ktrChart(D, k, name) {
  const G = glKSeries(D, [k]); if (!G) return null;
  const r = G.S[0].r, N = G.days.length, pts = r.map((v, i) => (v == null ? null : [i, v])).filter(Boolean); if (pts.length < 2) return null;
  const top = Math.max(...pts.map(([, v]) => Math.abs(v))), mx = [0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1, 2, 5, 10].find(x => x >= top) ?? Math.ceil(top);
  const X = i => 8 + i / (N - 1) * 304, Y = v => 64 - v / mx * 56, last = pts[pts.length - 1][1], st = stOfD(Math.round(last * 1000));
  const d = pts.map(([i, v], j) => (j ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  return h('section', {class: 'sj-sec sj-ktc', 'data-k': k, 'data-st': st, 'data-n': String(pts.length), 'data-mx': String(mx)},
    h('h2', {class: 'sj-pfh2', text: '이 꾀 수익률 추이'}),
    h('p', {class: 'sj-gllead', text: '날마다 이 꾀가 쓴 돈이 몇 프로 늘거나 줄었는지 이은 꺾은선이에요. 맨 위가 +' + glRateT(mx) + ', 점선이 0, 맨 아래가 -' + glRateT(mx) + '예요.'}),
    s('svg', {class: 'sj-ktcs', 'data-st': st, viewBox: '0 0 320 128', preserveAspectRatio: 'none', role: 'img', 'aria-label': name + ' 날마다 수익률 — ' + mday(G.days[0]) + '부터 ' + mday(G.days[N - 1]) + '까지 · 끝 ' + (last < 0 ? '-' : '+') + glRateT(last)},
      s('rect', {class: 'sj-ktcb', x: 0, y: 0, width: 320, height: 128, rx: 10}),
      s('line', {class: 'sj-ktcz', x1: 8, x2: 312, y1: 64, y2: 64}),
      s('path', {class: 'sj-ktcp', d}),
      s('path', {class: 'sj-ktcd', d: 'M' + X(pts[pts.length - 1][0]).toFixed(1) + ' ' + Y(last).toFixed(1) + ' h0.01'})),
    h('p', {class: 'sj-glkr sj-res sj-ktcr', 'data-st': st}, h('span', {class: 'sj-glkrl', text: mday(G.days[N - 1]) + ' 수익률'}), shapeI(st), h('b', {text: glRateT(last)})),
    h('p', {class: 'sj-gllead', text: '가로는 ' + mday(G.days[0]) + '부터 ' + mday(G.days[N - 1]) + '까지 장날 ' + N + '일이에요. 오르면 빨강, 내리면 파랑이에요.'}));
}
export async function vKkoeTr(X, k) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = kk => G.name[kk] ?? '제' + kNo(kk) + '계';
  const TR = D ? sellTrades(D) : null;
  if (!TR || !K36.includes(k)) return missPage(X, '꾀 사고판 회사', '이 꾀의 사고 팔기 장부를 찾지 못했어요. 한눈에에서 다시 눌러 주세요.');
  const name = nameOf(k), L = ktrRows(TR, k), q = TR.q, cost = L.reduce((a, x) => a + x.t.p0 * q, 0), val = L.reduce((a, x) => a + x.t.p1 * q, 0), diff = val - cost, st = stOfD(diff);
  const nS = L.filter(x => x.m === 's').length, nH = L.length - nS;
  const kids = [
    pageHead({kick: '기록 · 꾀 사고판 회사', h1: name, seal: '꾀', sealDn: st === 'dn',
      say: '이 꾀가 사고판 회사와 아직 들고 있는 회사예요. 수익률이 높은 차례로 놓았어요.',
      more: L.length ? [h('dl', {class: 'sj-money sj-trsum sj-ktsum', 'data-st': st},
          h('dt', {text: '판 것 · 들고 있는 것'}), h('dd', {text: NF.format(nS) + '번 · ' + NF.format(nH) + '번'}),
          h('dt', {text: '산 돈'}), h('dd', {text: won(cost)}),
          h('dt', {text: '판 돈과 지금 값'}), h('dd', {text: won(val)})),
        h('p', {class: 'sj-res sj-res-big', 'data-st': st}, shapeI(st), h('b', {text: '수익률 ' + (cost > 0 ? glRateT(val / cost - 1) : '0.0프로') + ' · ' + moved(diff)})),
        h('p', {class: 'sj-note', text: '모두 종가로 10주씩 샀다고 친 가짜 돈이에요. 들고 있는 것은 가장 늦은 종가로 셌어요.'})] : []}),
    ktrChart(D, k, name),
    h('section', {class: 'sj-sec sj-tr sj-ktl', 'data-k': k, 'data-n': String(L.length), 'aria-label': name + ' 사고판 회사'},
      h('h2', {class: 'sj-pfh2', text: '사고판 회사 · 들고 있는 회사'}),
      L.length ? h('p', {class: 'sj-gllead', text: '수익률이 높은 차례예요. 줄마다 산 날 · 산 값, 판 날 · 판 값(들고 있으면 가장 늦은 종가)이에요.'}) : null,
      ...(L.length ? fold7(h('ol', {class: 'sj-trl0', 'aria-label': name + ' 사고판 회사 목록'}, ...L.map(x => trRow(x.t, x.m, nameOf, D?.sell?.px))), (o, n) => '나머지 ' + (n - o) + '개 더 보기')
        : [h('p', {class: 'sj-tnone', text: '이 꾀는 아직 산 회사가 없어요. 억지로 채우지 않았어요.'})]),
      h('a', {class: 'sj-go', href: '#/k/' + k}, h('span', {text: '이 꾀는 어떤 꾀일까?'}), h('i', {'aria-hidden': 'true', text: '›'}))),
    h('p', {class: 'sj-safe sj-sec', text: '지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title: name + ' · 사고판 회사', page: 'ktr', kids, tab: 4, rec: 0, next: {href: '#/l/a', label: '한눈에로 돌아갈까?'}});
}
function glKTrends(D, P) { // P = 꾀별 이름표 차례(kParts)
  const G = glKSeries(D, P.map(x => x.k)); if (!G) return null;
  const N = G.days.length, X = i => 5 + i / (N - 1) * 140, Y = v => 32 - v / G.mx * 28, nm = new Map(P.map(x => [x.k, x.name]));
  const card = ({k, r}) => {
    const pts = r.map((v, i) => (v == null ? null : [X(i).toFixed(1), Y(v).toFixed(1)])).filter(Boolean), last = [...r].reverse().find(v => v != null) ?? null;
    const st = last == null ? 'none' : stOfD(Math.round(last * 1000)), name = nm.get(k) ?? k;
    return h('li', {class: 'sj-kglc', 'data-k': k, 'data-st': st, 'data-n': String(pts.length)},
      h('p', {class: 'sj-kglh', text: name}),
      last == null ? h('p', {class: 'sj-glkr sj-kglr', text: '산 적 없음'}) : h('p', {class: 'sj-glkr sj-res sj-kglr', 'data-st': st}, shapeI(st), h('b', {text: glRateT(last)})),
      s('svg', {class: 'sj-kgls', viewBox: '0 0 150 64', preserveAspectRatio: 'none', role: 'img', 'aria-label': name + ' 날마다 수익률 — ' + mday(G.days[0]) + '부터 ' + mday(G.days[N - 1]) + '까지' + (last == null ? ' · 산 적 없음' : ' · 끝 ' + glPp(last))},
        s('rect', {class: 'sj-kglb', x: 0, y: 0, width: 150, height: 64}), s('line', {class: 'sj-kglz', x1: 0, x2: 150, y1: 32, y2: 32}),
        ...(pts.length ? [s('path', {class: 'sj-kglp', d: pts.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join(' ')}), s('path', {class: 'sj-kgld', d: 'M' + pts[pts.length - 1][0] + ' ' + pts[pts.length - 1][1] + ' l0 0'})] : [])));
  };
  return h('section', {class: 'sj-sec sj-kgl', 'data-n': String(G.S.length), 'data-mx': String(G.mx), 'aria-label': '꾀마다 수익률 추이'},
    h('h2', {class: 'sj-pfh2', text: '꾀마다 수익률 추이'}),
    h('p', {class: 'sj-gllead', text: '서른여섯 꾀마다 처음 산 날부터 장날마다 수익률을 그렸어요. 수익률이 높은 차례예요.'}),
    h('p', {class: 'sj-gllead sj-kglk', text: '그림 서른여섯 개 모두 눈금이 같아요. 맨 위가 +' + glPctS(G.mx) + ', 점선이 0, 맨 아래가 -' + glPctS(G.mx) + '예요.'}),
    h('p', {class: 'sj-gllead sj-kglx', text: '가로는 ' + mday(G.days[0]) + '부터 ' + mday(G.days[N - 1]) + '까지 장날 ' + NF.format(N) + '일이에요.'}),
    h('ol', {class: 'sj-kgll'}, ...G.S.map(card)),
    h('p', {class: 'sj-gllead', text: '오른 꾀는 빨강, 내린 꾀는 파랑이에요. 모두 종가로 센 가짜 돈이에요.'}));
}
/* 업종별 이름표 한 줄(주문 1127-1554 · 사장님 2026-11-27(서울) 15:54 「어 붙여」 — 「업종별 분포에도 무엇의 비중인지 이름을 붙일까요?」의 답 · docs/design/record-2026-11-27/order-1554.txt)
   윗줄 = 점 · 이름 · 「지금 값 비중 ○프로」(총 평가 금액 = 들고 있는 것 + 판 돈 에서 그 칸의 몫) · 아랫줄 = 「지금 값 ○원」(판 돈 칸은 「판 돈 ○원」) · 칸은 그대로(큰 업종 넷 + 그 밖 업종 + 판 돈) */
export const GL_ICAP = Object.freeze(['들고 있는 회사의 업종 가운데 큰 넷과 그 밖 업종, 그리고 판 돈이에요.', '지금 값 비중은 총 평가 금액에서 그 칸이 차지하는 몫이에요.', '총 평가 금액은 들고 있는 것과 판 돈을 더한 값이에요.']);
function glIRow(x, tot) {
  return h('li', {class: 'sj-gllegi sj-glil', 'data-part': x.name}, glDot(x.col), h('b', {text: x.name}),
    h('span', {class: 'sj-pfsh', text: '지금 값 비중 ' + glShare(x.v, tot) + '프로'}),
    h('span', {class: 'sj-pfam', text: (x.cash ? '판 돈 ' : '지금 값 ') + glWonS(x.v) + '원'}));
}
function glKRow(x, tot) {
  const r = x.v > 0 ? x.now / x.v - 1 : null, st = r == null ? 'none' : stOfD(Math.round(r * 1000));
  return h('li', {class: 'sj-gllegi sj-glkl', 'data-part': x.name, 'data-k': x.k, 'data-st': st},
    h('a', {class: 'sj-glka', href: '#/l/k/' + x.k, 'aria-label': x.name + ' · 이 꾀가 사고판 회사 보기'}), // 꾀 줄을 누르면 그 꾀가 사고판 회사(주문 1127-2155) — 줄 모양은 그대로 · 줄 전체가 누르는 곳
    glDot(x.col), h('b', {text: x.name}),
    h('span', {class: 'sj-pfsh', text: '산 비중 ' + glShare(x.v, tot) + '프로'}),
    h('p', {class: 'sj-glkm'}, h('span', {class: 'sj-pfam', text: '산 돈 ' + glWonS(x.v) + '원'}),
      r == null ? h('span', {class: 'sj-glkr', text: '산 적 없음'}) : h('span', {class: 'sj-glkr sj-res', 'data-st': st}, h('span', {class: 'sj-glkrl', text: '수익률'}), shapeI(st), h('b', {text: glRateT(r)}))));
}
export async function vGlance(X) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  const A = D ? glanceOf(D) : null;
  if (!A || !A.n) return missPage(X, '한눈에', '사고 팔기 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const st = stOfD(A.diff);
  // 꾀별 나눔(본보기의 「상품별 분포」) — 서른여섯 꾀 모두(주문 1127-0938) · 꾀마다 산 돈(조각 · 산 비중) + 지금 값(들고 있는 것 + 판 돈 → 수익률)(주문 1127-1137)
  const TR = sellTrades(D), byK = new Map(), byKV = new Map(); for (const t of [...TR.hold, ...TR.sold]) { byK.set(t.k, (byK.get(t.k) ?? 0) + t.p0 * TR.q); byKV.set(t.k, (byKV.get(t.k) ?? 0) + t.p1 * TR.q); }
  const nCo = new Set(TR.hold.map(t => t.code)).size, DY = glDays(D), d1 = DY.length > 1 ? DY[DY.length - 1] : null, asOf = DY.length ? DY[DY.length - 1].d : typeof D.asOf === 'string' ? D.asOf : null; // 보유 종목 · 날마다 · 앞 장날 · 기준 날(주문 1126-2137)
  const kRate = k => ((byK.get(k) ?? 0) > 0 ? (byKV.get(k) ?? 0) / byK.get(k) - 1 : null); // 꾀 수익률 = 지금 값 ÷ 산 돈 − 1(산 적 없으면 null)
  const kTop = K36.map(k => [k, byK.get(k) ?? 0, kRate(k)]).sort((a, b) => (a[2] == null) - (b[2] == null) || (b[2] ?? 0) - (a[2] ?? 0) || K36.indexOf(a[0]) - K36.indexOf(b[0])), kParts = kTop.map(([k, v], j) => ({name: nameOf(k), v, now: byKV.get(k) ?? 0, col: GL_COL36[j], k})); // 서른여섯 꾀 모두 — 수익률 높은 차례(같으면 꾀 차례 · 산 적 없는 꾀는 맨 끝 0원)(주문 1127-0938 · 1127-1137 「매수한 비중」 = 산 돈 몫 · 1127-1244 「배치를 수익률순으로」)
  const iTop = A.parts.filter(x => !x.cash && x.name !== GL_ETCN).sort((a, b) => b.v - a.v), iEtc = A.parts.filter(x => x.name === GL_ETCN).reduce((a, x) => a + x.v, 0) + iTop.slice(4).reduce((a, x) => a + x.v, 0), cashP = A.parts.find(x => x.cash);
  const iParts = [...iTop.slice(0, 4), ...(iEtc > 0 ? [{name: GL_ETCN, v: iEtc, col: GL_ETC}] : []), ...(cashP ? [cashP] : [])]; // 업종도 여섯 칸 — 큰 업종 넷 + 그 밖 업종 + 판 돈
  const VIEWS = {k: {label: '꾀별 분포', parts: kParts}, i: {label: '업종별 분포', parts: iParts}};
  const insight = view => { const P = VIEWS[view].parts, tot = P.reduce((a, x) => a + x.v, 0), cash = P.find(x => x.cash), big = [...P].filter(x => !x.cash && !/^그 밖/.test(x.name)).sort((a, b) => b.v - a.v)[0];
    return view === 'k' ? (big ? '산 돈이 가장 큰 꾀는 「' + big.name + '」' + glIeyo(big.name) + '. 모든 산 돈의 ' + glShare(big.v, tot) + '프로예요.' : '')
      : (cash ? '지금 값의 ' + glShare(cash.v, tot) + '프로는 판 돈이에요. ' : '') + (big ? '들고 있는 회사 가운데는 ' + josa(big.name, '이') + ' 가장 커요.' : ''); };
  const box = h('div', {class: 'sj-pfdo'}), leg = h('ul', {class: 'sj-glleg'}), legCap = h('p', {class: 'sj-gllegcap'}), ins = h('b', {class: 'sj-pfinb'}), sec = h('section', {class: 'sj-sec sj-pf sj-glal', 'aria-label': '자산 포트폴리오'});
  const show = view => { const P = VIEWS[view].parts, tot = P.reduce((a, x) => a + x.v, 0);
    box.replaceChildren(glDonut(P), h('div', {class: 'sj-pfctr', 'aria-hidden': 'true'}, h('span', {text: '총 자산'}), h('b', {text: glWonS(A.val)}), h('span', {class: 'sj-pfctrr', 'data-st': st, text: ({up: '▲', dn: '▼'}[st] ?? '') + glPp(A.r)})));
    leg.replaceChildren(...P.map(x => (view === 'k' ? glKRow(x, tot) : glIRow(x, tot)))); // 업종별도 이름표(주문 1127-1554)
    legCap.hidden = false; { const C = view === 'k' ? GL_KCAP : GL_ICAP; legCap.replaceChildren(...C.map((x, i) => h('span', {text: x + (i < C.length - 1 ? ' ' : '')}))); } // 업종별도 머리말(주문 1127-1554)
    ins.textContent = insight(view); sec.dataset.view = view;
    for (const b of segB) b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'); };
  const segB = Object.entries(VIEWS).map(([v, o]) => { const b = h('button', {class: 'sj-pfsb', type: 'button', 'data-view': v, text: o.label}); b.addEventListener('click', () => show(v)); return b; });
  const seg = h('div', {class: 'sj-pfseg', role: 'group', 'aria-label': '나눔 고르기'}, ...segB);
  sec.append(
    h('div', {class: 'sj-pfhd'}, h('h1', {class: 'sj-pfh1'}, h('span', {text: '자산 포트폴리오'}), s('svg', {class: 'sj-pfi', viewBox: '0 0 20 20', 'aria-hidden': 'true'}, s('circle', {cx: 10, cy: 10, r: 8.5}), s('path', {d: 'M10 9v5.5M10 5.8v.2'}))),
      h('div', {class: 'sj-pftot'}, h('span', {class: 'sj-pftl', text: '총 평가 금액'}), h('b', {class: 'sj-pfval sj-glval', text: won(A.val)}),
        h('p', {class: 'sj-res sj-glres', 'data-st': st}, shapeI(st), h('b', {text: moved(A.diff)})), h('p', {class: 'sj-glpct', 'data-st': st}, h('b', {text: pctText(A.r)})),
        d1 ? h('p', {class: 'sj-res sj-glday1', 'data-st': stOfD(d1.dg)}, shapeI(stOfD(d1.dg)), h('span', {text: glVs('앞 장날', d1.dg)})) : null)),
    asOf ? h('p', {class: 'sj-glasof', text: mday(asOf) + '(' + glWk(asOf) + ') 종가로 셌어요 · 모두 가짜 돈이에요'}) : null,
    h('dl', {class: 'sj-glsum'}, // 총 보유 금액 · 보유 종목 · 판 돈 · 들인 돈(주문 1126-2137)
      h('div', {class: 'sj-glsc', 'data-f': 'held'}, h('dt', {text: '총 보유 금액'}), h('dd', {text: won(A.held)}), h('dd', {class: 'sj-glss', text: '들고 있는 ' + NF.format(A.nHold) + '번을 그날 종가로'})),
      h('div', {class: 'sj-glsc', 'data-f': 'cos'}, h('dt', {text: '보유 종목'}), h('dd', {text: NF.format(nCo) + '곳'}), h('dd', {class: 'sj-glss', text: '같은 회사를 여러 번 산 것은 한 곳으로 셌어요'})),
      h('div', {class: 'sj-glsc', 'data-f': 'cash'}, h('dt', {text: '판 돈'}), h('dd', {text: won(A.cash)}), h('dd', {class: 'sj-glss', text: '판 것 ' + NF.format(A.nSold) + '번'})),
      h('div', {class: 'sj-glsc', 'data-f': 'cost'}, h('dt', {text: '들인 돈'}), h('dd', {text: won(A.cost)}), h('dd', {class: 'sj-glss', text: '산 것 ' + NF.format(A.n) + '번'}))),
    h('ul', {class: 'sj-glsplit', 'aria-label': '늘고 준 돈 나눠 보기'}, // 들고 있는 것 · 판 것 · 모두 — 같은 크기(줄어든 것을 숨기지 않음)
      ...[['hold', '들고 있는 것', TR.H.diff, '산 돈 ' + won(TR.H.cost) + ' → 지금 ' + won(A.held), '오른 것 ' + NF.format(TR.H.up) + '번 · 내린 것 ' + NF.format(TR.H.dn) + '번 · 그대로 ' + NF.format(TR.H.n - TR.H.up - TR.H.dn) + '번'],
        ['sold', '판 것', TR.S.diff, '산 돈 ' + won(TR.S.cost) + ' → 판 돈 ' + won(A.cash), '정한 날에 판 것 ' + NF.format(TR.sold.filter(t => t.how !== 'c').length) + '번 · 88원 줄 밑으로 판 것 ' + NF.format(TR.sold.filter(t => t.how === 'c').length) + '번'],
        ['all', '모두', A.diff, '들고 있는 것과 판 것을 더했어요', null]].map(([f, k, v, l1, l2]) => { const t = stOfD(v);
        return h('li', {class: 'sj-glsr', 'data-f': f, 'data-st': t}, h('b', {class: 'sj-glsrk', text: k}), h('p', {class: 'sj-res sj-glsrv', 'data-st': t}, shapeI(t), h('span', {text: moved(v)})),
          h('p', {class: 'sj-glsrs', text: l1}), l2 ? h('p', {class: 'sj-glsrs', text: l2}) : null); })),
    h('div', {class: 'sj-pfbody'}, box, legCap, leg),
    h('a', {class: 'sj-pfin', href: '#/l/b'}, s('svg', {class: 'sj-pfini', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: 'M4 20V14M9 20V10M14 20V12M19 20V6', 'stroke-width': 3, 'stroke-linecap': 'round'})), h('span', {class: 'sj-pfint'}, ins, h('span', {text: '들고 있는 회사를 낱낱이 볼까요?'})), h('i', {'aria-hidden': 'true', text: '›'})),
    h('p', {class: 'sj-note', text: '산 것 ' + NF.format(A.n) + '번 · 들고 있는 것 ' + NF.format(A.nHold) + '번 · 판 것 ' + NF.format(A.nSold) + '번. 모두 종가로 10주씩 샀다고 친 가짜 돈이에요.'}));
  show('k');
  const keys = [{name: '그 꾀가 가장 많이 고른 업종', col: GL_K1}, {name: '두 번째로 많이 고른 업종', col: GL_K2}, {name: '나머지 업종', col: GL_ETC}];
  const kkRow = r => h('li', {class: 'sj-glk', 'data-k': r.k, 'data-n': String(r.n)},
    h('p', {class: 'sj-glkh'}, h('b', {text: nameOf(r.k)}), h('span', {class: 'sj-glkn', text: NF.format(r.n) + '번 샀어요'})),
    s('svg', {class: 'sj-glkb', viewBox: '0 0 300 20', preserveAspectRatio: 'none', 'aria-hidden': 'true'}, ...(() => { let x = 0; return r.segs.map(g => { const w = g.c / r.n * 300, e = s('rect', {x: x.toFixed(2), y: 0, width: Math.max(0, w - (r.segs.length > 1 ? 1.5 : 0)).toFixed(2), height: 20, rx: 3, fill: g.col, 'data-part': g.name}); x += w; return e; }); })()),
    h('p', {class: 'sj-glkt', text: r.best ? '가장 많이 고른 업종은 ' + r.best[0] + glIeyo(r.best[0]) + ' · ' + NF.format(r.n) + '번 가운데 ' + NF.format(r.best[1]) + '번' : '업종을 모르는 회사만 샀어요'}),
    r.next ? h('p', {class: 'sj-glk2', text: '두 번째는 ' + r.next[0] + glIeyo(r.next[0]) + ' · ' + NF.format(r.next[1]) + '번'}) : null);
  const walk = h('section', {class: 'sj-sec sj-wk sj-wkin', 'data-lv': '1', 'aria-label': '7단 사고판 기록'}, // 기록을 누르면 바로 7단 길(주문 1127-1457 · 1단 기록 → 2단 판 것 · 들고 있는 것 …)
    h('h2', {class: 'sj-pfh2', text: '7단 사고판 기록'}),
    h('p', {class: 'sj-gllead', text: '어떤 회사를 얼마에 사서 얼마에 팔았는지, 눌러서 한 단씩 들어가요. 판 것 · 꾀 · 업종 · 종목 · 사고판 건 · 한 건 차례예요.'}),
    h('ol', {class: 'sj-wkl'}, wkRow('#/l/t/s', '판 것', '정한 날이나 88원 줄 밑에서 판 것', wkSum(TR.sold, TR.q), false), wkRow('#/l/t/h', '들고 있는 것', '아직 들고 있는 것(그날 종가로 셈)', wkSum(TR.hold, TR.q), true)));
  const kids = [walk, seg, sec, glTrend(D), glKTrends(D, kParts), glDaySec(DY), // 꾀마다 수익률 추이(주문 1127-1412) · 날마다 보기(주문 1126-2137)
    h('section', {class: 'sj-sec sj-glkk', 'data-n': String(A.kk.length), 'aria-label': '꾀마다 많이 고른 업종'},
      h('h2', {class: 'sj-pfh2', text: '꾀마다 많이 고른 업종'}),
      h('p', {class: 'sj-gllead', text: '막대 하나가 꾀 하나예요. 진한 칸이 길수록 그 꾀가 한 업종을 많이 골랐어요.'}),
      h('ul', {class: 'sj-glleg'}, ...keys.map(x => h('li', {class: 'sj-gllegi'}, glDot(x.col), h('b', {text: x.name})))),
      ...fold7(h('ol', {class: 'sj-glks'}, ...A.kk.map(kkRow)), (o, n) => '나머지 꾀 ' + (n - o) + '가지 더 보기')), // 위 일곱만(주문 1127-1922 · 다음 정리 ③)
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title: '한눈에', page: 'glance', kids, tab: 4, rec: 0, next: {href: '#/l/b', label: '산 회사도 볼까?'}});
}
export async function vSettle36(X) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return missPage(X, '정산', '정산 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const ST = settle36(D), {K, T: TT, rows} = ST, first = rows.map(r => r.day).sort()[0] ?? null, rated = K.some(x => rateOf(x) !== null), M = rankMoves(D, K), TK = trackOf(D, K); // M = 날마다 바뀐 차례(주문 1119-0243) · TK = 쌓인 값(주문 1119-0829)
  const mx = Math.max(0, ...K.map(rateOf).filter(v => v !== null).map(Math.abs));
  const dn = K.filter(x => x.st === 'dn').sort((a, b) => a.diff - b.diff);
  const SVS = sellSum(D); // 사고 팔기(주문 1125-0049) — 자료에 sell 이 없으면 null(옛 자료 · 보이지 않음)
  const bar = x => brushBar(rateOf(x), mx); // 붓 막대 — 늘면 오른쪽 먹 획 · 줄면 왼쪽 남빛 획(주문 1116-0118)
  const kids = [
    pageHead({kick: '정산 · 가짜 돈으로 해 본 셈', h1: '서른여섯 꾀 정산', seal: '셈', sealDn: TT.st === 'dn', pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.ledger, 'figcaption'), heroPic('ledger')),
      say: (first ? mday(first) + '부터 ' : '') + '날마다 서른여섯 꾀가 고른 회사를 10주씩 샀다고 치고 셌어요. 진짜 돈이 아니에요. 돈이 줄어든 꾀도 숨기지 않아요.',
      more: [h('dl', {class: 'sj-money sj-money-big', 'data-st': TT.st}, h('dt', {text: '산 돈'}), h('dd', {text: won(TT.cost)}), h('dt', {text: '지금'}), h('dd', {text: TT.n ? won(TT.val) : SAID.none})),
        h('p', {class: 'sj-res sj-res-big', 'data-st': TT.st}, shapeI(TT.st), h('b', {text: resText(TT)})),
        h('p', {class: 'sj-note', text: (first ? mday(first) + '부터 · ' : '') + '산 횟수 ' + NF.format(rows.length) + '번 · 고른 날 ' + NF.format(TT.days) + '일' + (ST.miss ? ' · 값이 없어 못 센 ' + NF.format(ST.miss) + '번' : '') + (ST.asOf ? ' · ' + mday(ST.asOf) + ' 값까지' : '')})]}),
    ...(SVS ? [svCompare(SVS, nameOf), svExplain(SVS, D, nameOf)] : []), // 사고 팔기 견줌 · 설명칸(주문 1125-0049)
    h('section', {class: 'sj-sec sj-st36', 'aria-label': '꾀마다 정산', 'data-n': String(K.length)},
      head('셈', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '꾀마다 정산'}), h('span', {class: 'sj-h2n', text: ' ' + K.length + '가지'}))),
      h('p', {class: 'sj-rule', text: rated ? '산 돈에 비해 많이 늘어난 꾀가 맨 위예요. 날마다 다시 줄을 세워요. 줄어든 꾀도 숨기지 않아요.' : '아직 하루밖에 안 지나서 꾀 차례대로 놓았어요. 하루가 더 지나면 많이 늘어난 꾀가 맨 위로 가요.'}),
      h('p', {class: 'sj-loss', 'data-say': '', text: dn.length ? '돈이 줄어든 꾀는 ' + dn.length + '가지예요. 가장 많이 줄어든 꾀는 「' + nameOf(dn[0].key) + '」로, ' + won(-dn[0].diff) + ' 줄었어요.' : '돈이 줄어든 꾀는 아직 없어요.'}),
      TK ? trackChart(TK, K, nameOf) : null, // 쌓인 값 꺾은선 — 기본 그림(주문 1119-0829)
      M ? h('p', {class: 'sj-st1', text: topSay(M, nameOf)}) : null, // 맨 위 한 줄(주문 1119-0243)
      M ? h('p', {class: 'sj-stmk', text: '▲는 앞 장날보다 오른 칸, ▼는 내린 칸이에요.'}) : null,
      meanCap(PM.bars), // 붓 막대 그림 뜻 — 줄 맨 위 한 번(주문 1116-1313)
      ...fold7(h('ol', {class: 'sj-stl'}, ...K.map((x, i) => h('li', {class: 'sj-str', 'data-k': x.key, 'data-st': x.st},
        h('a', {class: 'sj-sta', href: '#/k/' + x.key, 'aria-label': (i + 1) + '번째 · ' + nameOf(x.key) + ' · ' + resText(x) + (M ? ' · ' + mvSay(M.move.get(x.key)) : '')},
          h('span', {class: 'sj-stn', text: String(i + 1)}), h('b', {class: 'sj-stk', text: nameOf(x.key)}), M ? mvMark(M.move.get(x.key)) : null, h('i', {'aria-hidden': 'true', text: '›'})),
        h('p', {class: 'sj-stv'}, h('span', {text: '산 돈 ' + won(x.cost)}), h('span', {class: 'sj-res', 'data-st': x.st}, shapeI(x.st), h('span', {text: resText(x)})), trackSpark(TK, x.key)), // 줄마다 쌓인 값 작은 꺾은선(주문 1119-0829)
        bar(x)))), (o, n) => (o + 1) + '번째부터 ' + n + '번째까지 더 보기'),
      h('div', {class: 'sj-sttot', 'data-st': TT.st}, h('b', {text: '모두'}), h('span', {text: '산 돈 ' + won(TT.cost)}), h('span', {class: 'sj-res', 'data-st': TT.st}, shapeI(TT.st), h('span', {text: resText(TT)}))),
      h('p', {class: 'sj-safe', text: '가짜 돈으로 지난 기록을 센 표예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('셈')),
    M ? rankRace(M, nameOf) : null, // 날마다 바뀐 차례(주문 1119-0243)
    endSec(ST.asOf ? day(ST.asOf) : day(T?.asOf?.board), gotOf(S), '「지금」은 그 회사의 가장 최근 마지막 값이에요. 산 날 뒤에 값이 아직 없으면, 하루밖에 안 지난 것으로 셈해요.')];
  return frame({title: '정산', page: 'settle', kids, tab: 4, rec: 2, lc: X.cur?.()?.code ?? null, next: {href: '#/k', label: '서른여섯 꾀는 어떤 꾀일까?'}});
}
/* ── 장부(#/l · 탭 「장부」 · 주문 1120-1705 · 사장님 2026-11-20(마카오) 17:05 「그동안 날짜별로 어떤종목을 … 얼마나 … 그래서 어떻게 됐는지 그래프와 데이타로 … 하단에 … 탭을 만들어서 한눈에 …
   이름이 너무 길어 … 적당한 이름 … 그동안 약 8억 정도를 … 모든 거래내역 추적하고 기록하는 것이다」) — 정산 장부(su21-settle.json)의 모든 산 셈을 날마다 · 회사마다
   한 가지만 크게: 쌓인 산 돈(점선)과 그 지금 값(실선) 꺾은선 → 날마다 산 돈 막대(점 = 그날 산 것의 지금 값) → 날마다 산 회사(손실 먼저) → 회사마다 모은 장부(산 돈 차례 · 수익 차례 아님)
   가짜 돈 · 진짜 돈 아님 · 「%」 0 · 줄어든 것을 숨기지 않음 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 ── */
const LDW = 320, LDH = 150, LDP = 12, LDK = 'su-ledger-pick'; // LDK = 거르개 고른 것 기억 이름(이 휴대폰 localStorage · 주문 1120-1935)
/** 누르면 그날 숫자(주문 1120-2041 · 사장님 20:41 「어 그렇게 해」 — 「장부 꺾은선을 누르면 그날 숫자가 뜨게 할까요?」의 답)
 *  그림을 누르거나 손가락으로 끌면 가장 가까운 날을 골라 세로 줄 · 점으로 표시하고 그림 아래 큰 글 한 줄(HTML · 17px 넘게)로 그날 숫자 · 처음은 마지막 날
 *  세로로 쓸어 넘기는 것은 그대로(touch-action pan-y) · 글은 읽어 주기에도 바로 알림(aria-live) */
function ledTap(g, n, xOf, marks, say, cls) {
  const mk = s('g', {class: 'sj-ldmk', 'aria-hidden': 'true'}), read = h('p', {class: 'sj-ldread ' + cls, 'aria-live': 'polite'}), f = v => Math.round(v * 10) / 10;
  g.append(mk);
  const show = i => { mk.replaceChildren(s('path', {class: 'sj-ldmkl', d: `M${f(xOf(i))} ${LDP - 4}V${LDH - LDP}`}), ...marks(i)); const t = say(i); read.textContent = t.text;
    for (const [k, v] of Object.entries(t.data)) read.setAttribute('data-' + k, String(v)); g.setAttribute('data-i', String(i)); };
  const pick = ev => { const r = g.getBoundingClientRect(); if (!r.width) return; const vx = (ev.clientX - r.left) / r.width * LDW; let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) { const dd = Math.abs(xOf(i) - vx); if (dd < bd) { bd = dd; best = i; } } show(best); };
  g.addEventListener('pointerdown', e => { pick(e); try { g.setPointerCapture(e.pointerId); } catch { /* 못 잡으면 누른 것만 */ } });
  g.addEventListener('pointermove', e => { if (e.buttons) pick(e); });
  show(n - 1);
  return read;
}
function ledCum(L) {
  const D = L.days, hi = Math.max(1, ...D.map(d => Math.max(d.cumCost, d.cumVal))) * 1.05, f = v => Math.round(v * 10) / 10;
  const x = i => (D.length < 2 ? LDW / 2 : LDP + (LDW - 2 * LDP) * i / (D.length - 1)), y = v => LDH - LDP - (LDH - 2 * LDP) * v / hi;
  const g = s('svg', {class: 'sj-ldc sj-ldtap', viewBox: `0 0 ${LDW} ${LDH}`, 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('path', {class: 'sj-ld0', d: `M${LDP} ${f(y(0))}H${LDW - LDP}`}));
  if (D.length > 1) { g.append(s('polyline', {class: 'sj-ldval', points: D.map((d, i) => f(x(i)) + ',' + f(y(d.cumVal))).join(' ')})); g.append(s('polyline', {class: 'sj-ldcost', points: D.map((d, i) => f(x(i)) + ',' + f(y(d.cumCost))).join(' ')})); } // 점선을 위에(두 선이 거의 겹쳐도 둘 다 보이게)
  const e = D[D.length - 1]; g.append(s('circle', {class: 'sj-ldce', cx: f(x(D.length - 1)), cy: f(y(e.cumCost)), r: 4})); g.append(s('circle', {class: 'sj-ldve' + (e.cumVal < e.cumCost ? ' sj-lddn' : ''), cx: f(x(D.length - 1)), cy: f(y(e.cumVal)), r: 5}));
  const oneTo = i => D.slice(0, i + 1).every(d => d.one);
  const read = ledTap(g, D.length, x, i => [s('circle', {class: 'sj-ldmkc', cx: f(x(i)), cy: f(y(D[i].cumCost)), r: 6}), s('circle', {class: 'sj-ldmkv' + (D[i].cumVal < D[i].cumCost ? ' sj-lddn' : ''), cx: f(x(i)), cy: f(y(D[i].cumVal)), r: 7})],
    i => ({text: (mday(D[i].day) ?? D[i].day) + '까지 · 쌓인 산 돈 ' + won(D[i].cumCost) + ' · 그 지금 값 ' + won(D[i].cumVal) + ' · ' + ledRes(D[i].cumCost, D[i].cumVal, oneTo(i)),
      data: {day: D[i].day, cost: Math.round(D[i].cumCost), val: Math.round(D[i].cumVal)}}), 'sj-ldreadc');
  return [g, read];
}
function ledBars(L) {
  const D = L.days, hi = Math.max(1, ...D.map(d => Math.max(d.cost, d.val))) * 1.08, f = v => Math.round(v * 10) / 10, n = D.length, slot = (LDW - 2 * LDP) / Math.max(1, n), bw = Math.min(34, slot * 0.6);
  const y = v => LDH - LDP - (LDH - 2 * LDP) * v / hi, g = s('svg', {class: 'sj-ldb sj-ldtap', viewBox: `0 0 ${LDW} ${LDH}`, 'aria-hidden': 'true', focusable: 'false'}), cxOf = i => LDP + slot * (i + 0.5);
  g.append(s('path', {class: 'sj-ld0', d: `M${LDP} ${f(y(0))}H${LDW - LDP}`}));
  D.forEach((d, i) => { const cx = cxOf(i);
    g.append(s('rect', {class: 'sj-ldbar', x: f(cx - bw / 2), y: f(y(d.cost)), width: f(bw), height: f(Math.max(1, y(0) - y(d.cost))), rx: 3}));
    g.append(s('circle', {class: 'sj-lddot' + (d.val < d.cost ? ' sj-lddn' : ''), cx: f(cx), cy: f(y(d.val)), r: 5})); });
  const read = ledTap(g, n, cxOf, i => [s('rect', {class: 'sj-ldmkb', x: f(cxOf(i) - bw / 2 - 3), y: f(y(D[i].cost) - 3), width: f(bw + 6), height: f(Math.max(1, y(0) - y(D[i].cost)) + 3), rx: 5})],
    i => ({text: (mday(D[i].day) ?? D[i].day) + ' · 그날 산 돈 ' + won(D[i].cost) + ' · 그날 산 것 지금 ' + won(D[i].val) + ' · ' + ledRes(D[i].cost, D[i].val, D[i].one),
      data: {day: D[i].day, cost: Math.round(D[i].cost), val: Math.round(D[i].val)}}), 'sj-ldreadb');
  return [g, read];
}
const ledSt = (cost, val, one) => (one ? 'one' : Math.round(val - cost) > 0 ? 'up' : Math.round(val - cost) < 0 ? 'dn' : 'eq');
/** 장부 맨 위 칸 「100원을 넣었다면」(주문 1123-2358 · 1124-0226 · 1124-0336 — 사장님 2026-11-24(서울) 03:35 「너 말이 글이 헷갈리게 어렵게 표현하고 있어 바보도 알수 있게 해」 · 03:36 「그래 더 쉽게 해」)
 *  장부 머리 「늘고 줆」 바로 아래 — 큰 세 줄(우리 장부는 지금 ○원이에요 · 모든 회사에 나눠 넣었으면 ○원이에요 · 우리가 ○원 더 많아요) · 사고 나서 며칠 뒤? · 가장 나빴던 날 · 아직 일러요
 *  한 줄에 한 가지 · 원 단위 · 만든 이름 0 · 「%」 0 · 줄어든 것을 숨기지 않음 */
function judgeBox(RW, tt) {
  const J = judgeOf(RW, tt), L3 = judgeLines(J), SA = sameAgeOf(RW);
  const items = [['사고 나서 며칠 뒤?', SA.map(sameText)],
    ['가장 나빴던 날', J.deep ? (mday(J.deep.day) ?? J.deep.day) + ', ' + Math.round(J.deep.r) + '원이에요.' : '아직 몰라요.'],
    ['아직 일러요', J.early ? '아직 ' + J.days + '일치뿐이에요. ' + JUDGE_DAYS + '일치가 모일 때까지 지켜봐야 해요.' : J.days + '일치가 모였어요.']];
  return h('div', {class: 'sj-judge', role: 'group', 'aria-label': '100원을 넣었다면', 'data-rule': J.rule, 'data-st': J.st ?? 'none', 'data-r': J.r === null ? '' : String(Math.round(J.r)),
    'data-rm': J.rm === null ? '' : String(Math.round(J.rm)), 'data-d': J.d === null ? '' : String(J.d), 'data-n': String(J.n), 'data-deep': J.deep ? J.deep.day + ' ' + Math.round(J.deep.r) : '',
    'data-days': String(J.days), 'data-early': J.early ? '1' : '0'},
    h('p', {class: 'sj-jk', text: '100원을 넣었다면'}),
    h('p', {class: 'sj-jbig', 'data-say': '', text: L3.ours}),
    h('p', {class: 'sj-jbig', text: L3.all}),
    L3.cmp ? h('p', {class: 'sj-jbig sj-jcmp', text: L3.cmp}) : null,
    h('ul', {class: 'sj-jl'}, ...items.map(([k, v]) => h('li', Array.isArray(v) ? {class: 'sj-jsame', 'data-same': SA.map(x => x.k + ':' + (x.n ? Math.round(x.r) : '') + ':' + (x.n && x.rm !== null ? Math.round(x.rm) : '')).join('|')} : {},
      h('b', {text: k}), Array.isArray(v) ? h('span', {class: 'sj-jsv'}, ...v.map(t => h('span', {class: 'sj-jsl', text: t}))) : h('span', {text: v})))),
    h('p', {class: 'sj-jn', text: '모든 회사는 이 사이트가 보는 우량주 회사를 다 합친 거예요.'}));
}
const ledRes = (cost, val, one) => (one ? SAID.one : moved(val - cost));
export async function vLedger(X) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return missPage(X, '장부', '정산 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const q = Number.isFinite(D.qty) ? D.qty : 10, RW = settleRows(D), L = ledgerOf(RW, q), TT = L.T, st = TT.days ? ledSt(TT.cost, TT.val, TT.one) : 'none', first = L.days[0]?.day ?? null;
  const dn = L.cos.filter(c => !c.one && Math.round(c.val - c.cost) < 0).sort((a, b) => (a.val - a.cost) - (b.val - b.cost)), last = L.days[L.days.length - 1] ?? null;
  const filtSec = () => { // 거르개 열여덟(주문 1120-1817 · 사장님 18:17 「날짜별 이익별 꾀별 많은순 수익율 필터를 18가지로 … 잡스라면」) — 묶음 넷 · 고르면 아래 줄이 바로 바뀜 · 처음은 손실 먼저
    const P = {...LEDGER_PICK0}, chips = [], list = h('div', {class: 'sj-ldlist', 'aria-live': 'polite'}), sum = h('p', {class: 'sj-ldsum'}), mk = h('p', {class: 'sj-ldmk'});
    // 고른 것 기억(주문 1120-1935 · 사장님 19:35 「어 그렇게 해」 — 「거르개에서 고른 것을 다음에 열어도 그대로 두게 할까요?」의 답) — 이 휴대폰에만 · 못 읽으면 처음대로(줄어든 돈 먼저)
    try { const sv = JSON.parse(localStorage.getItem(LDK) ?? 'null'); if (sv && typeof sv === 'object') for (const g of Object.keys(LEDGER_PICK0)) if (typeof sv[g] === 'string') P[g] = sv[g]; } catch { /* 저장소 없음 */ }
    Object.assign(P, ledgerView([], P).pick); // 모르는 값은 처음 값으로
    const keepP = () => { try { localStorage.setItem(LDK, JSON.stringify(P)); } catch { /* 저장소 없음 — 이번만 */ } };
    const press = () => { for (const c of chips) c.setAttribute('aria-pressed', P[c.dataset.g] === c.dataset.v ? 'true' : 'false'); };
    const lab = (L, v) => (L.find(x => x[0] === v) ?? L[0])[1];
    const r100 = x => (x.cost > 0 ? (100 * x.val / x.cost).toFixed(1).replace(/\.0$/, '') + '원' : '?');
    const row = (x, kind) => { const st = ledSt(x.cost, x.val, x.one), isK = kind === 'k';
      return h('li', {class: 'sj-ldr', 'data-key': x.key, 'data-st': st},
        h('a', {class: 'sj-lda', href: isK ? '#/k/' + x.key : '#/c/' + x.key}, isK ? h('b', {text: nameOf(x.key)}) : h('b', {'data-proper': '', text: x.name}), h('i', {'aria-hidden': 'true', text: '›'})),
        h('p', {class: 'sj-ldv'}, h('span', {text: (kind === 'day' ? x.times * q + '주 · 꾀 ' + x.times + '가지' : x.days + '날 · ' + x.times + '번 · ' + x.times * q + '주') + ' · 산 돈 ' + won(x.cost) + ' → 지금 ' + won(x.val)}),
          h('span', {class: 'sj-res', 'data-st': st}, shapeI(st), h('span', {text: ledRes(x.cost, x.val, x.one) + (x.one ? '' : ' · 100원이 ' + r100(x))})))); };
    const draw = () => {
      const V = ledgerView(RW, P), T = V.T, n = V.groups ? V.groups.reduce((s, g) => s + g.items.length, 0) : V.items.length;
      sum.textContent = [lab(LEDGER_VIEWS, P.view), lab(LEDGER_SPANS, P.span), lab(LEDGER_RES, P.res), lab(LEDGER_SORTS, P.sort)].join(' · ') + ' — '
        + (V.groups ? V.groups.length + '날 · ' + n + '줄' : P.view === 'k' ? '꾀 ' + n + '가지' : '회사 ' + n + '곳') + (n ? ' · 산 돈 ' + won(T.cost) + ' → 지금 ' + won(T.val) : '')
      ; mk.textContent = n ? judgeTail(T) : ''; mk.hidden = !mk.textContent; mk.setAttribute('data-mk', mk.textContent); // 모든 회사와 견줌(주문 1123-2358 · 1124-0336 쉬운 말 — 거르개를 고를 때마다 · 한 줄에 한 가지)
      for (const [k, v] of Object.entries(P)) list.setAttribute('data-' + k, v);
      list.setAttribute('data-n', String(n)); list.setAttribute('data-cost', String(Math.round(T.cost))); list.setAttribute('data-val', String(Math.round(T.val)));
      if (!n) { list.replaceChildren(h('p', {class: 'sj-tnone', text: '고른 거르개에 맞는 줄이 없어요. 억지로 채우지 않았어요.'})); return; }
      if (V.groups) { const op = Math.max(0, V.groups.findIndex(g => g.items.some(x => !x.one))); // 처음 펼친 날 = 값이 움직인 가장 새 날(마지막 날은 아직 하루치뿐일 때가 많음)
        list.replaceChildren(...V.groups.map((g, i) => { const gs = ledSt(g.cost, g.val, g.items.every(x => x.one));
        return h('details', {class: 'sj-ldd', 'data-day': g.day, 'data-n': String(g.items.length), 'data-st': gs, open: i === op || null},
          h('summary', {}, h('span', {class: 'sj-ldds'}, h('b', {text: mday(g.day) ?? g.day}), h('span', {text: '회사 ' + g.items.length + '곳 · ' + g.times + '번 · 산 돈 ' + won(g.cost)})),
            h('span', {class: 'sj-res', 'data-st': gs}, shapeI(gs), h('span', {text: ledRes(g.cost, g.val, gs === 'one')})), chev()),
          ...fold7(h('ol', {class: 'sj-ldl'}, ...g.items.map(x => row(x, 'day'))), (o, n) => '나머지 ' + (n - o) + '줄 더 보기', 20)); })); return; }
      const TOP = 40, xs = V.items;
      list.replaceChildren(h('ol', {class: 'sj-ldl sj-ldl1'}, ...xs.slice(0, TOP).map(x => row(x, P.view))),
        xs.length > TOP ? h('details', {class: 'sj-drawer sj-ldmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '나머지 ' + (xs.length - TOP) + '줄도 펼치기'}), chev()), h('ol', {class: 'sj-ldl'}, ...xs.slice(TOP).map(x => row(x, P.view)))) : null);
    };
    const grp = (g, label, opts) => h('div', {class: 'sj-ldfg', role: 'group', 'aria-label': label + ' — ' + opts.length + '가지', 'data-g': g}, h('p', {class: 'sj-ldfl', text: label}),
      h('div', {class: 'sj-ldcs'}, ...opts.map(([v, t]) => { const b = h('button', {class: 'sj-ldchip', type: 'button', 'data-g': g, 'data-v': v, 'aria-pressed': P[g] === v ? 'true' : 'false', text: t});
        b.addEventListener('click', () => { P[g] = v; press(); keepP(); draw(); }); chips.push(b); return b; })));
    const reset = h('button', {class: 'sj-ldreset', type: 'button', 'aria-label': '거르개를 처음대로 — 날짜별 · 모두 · 모두 · 줄어든 돈 먼저', text: '처음대로'});
    reset.addEventListener('click', () => { Object.assign(P, LEDGER_PICK0); press(); keepP(); draw(); });
    const sec = h('section', {class: 'sj-sec sj-ldf', 'aria-label': '거르개 열여덟', 'data-rule': 'ledger-filter-v1'},
      head('거', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '거르개 열여덟'}))),
      h('p', {class: 'sj-rule', text: '보기 · 기간 · 결과 · 차례에서 하나씩 고르면 아래 줄이 바로 바뀌어요. 고른 것은 이 휴대폰이 기억해 다음에도 그대로예요. 처음에는 줄어든 돈이 큰 것부터 보여요. 줄어든 것도 숨기지 않아요.'}),
      grp('view', '보기', LEDGER_VIEWS),
      h('details', {class: 'sj-drawer sj-ldfmore', 'data-n': String(LEDGER_SPANS.length + LEDGER_RES.length + LEDGER_SORTS.length)}, h('summary', {}, h('span', {class: 'sj-s1', text: '거르개 더 보기 — 기간 · 결과 · 차례'}), chev()), // 자주 쓰는 「보기」 셋만 펼치고 나머지 열다섯은 서랍(주문 1127-1922 · 일꾼 100명 다음 정리 ①) · 고른 것은 아래 한 줄에 늘 보임
        grp('span', '기간', LEDGER_SPANS), grp('res', '결과', LEDGER_RES), grp('sort', '차례', LEDGER_SORTS)),
      h('div', {class: 'sj-ldsumr'}, sum, reset), mk, list, endSeal('거'));
    draw(); return sec;
  };
  const findSec = () => { // 장부에서 회사 찾기(주문 1120-1804) — 이름 · 번호를 쓰면 그 회사를 산 날을 모두(날 · 꾀 · 주 · 산 값 → 지금)
    const inp = h('input', {class: 'sj-findi sj-ldfi', type: 'search', name: 'q', placeholder: '회사 이름이나 번호', 'aria-label': '장부에서 회사 찾기 — 이름이나 번호', enterkeyhint: 'search', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false'});
    const base = '이 장부에 적힌 회사 ' + NF.format(TT.cos) + '곳에서 찾아요. 한 글자부터 찾아요.', note = h('p', {class: 'sj-findn', text: base}), out = h('div', {class: 'sj-ldfo', 'aria-live': 'polite'});
    const one = c => { const ts = tradesOf(RW, c.code), cs = ledSt(c.cost, c.val, c.one);
      return h('div', {class: 'sj-ldfc', 'data-code': c.code, 'data-n': String(ts.length)},
        h('a', {class: 'sj-lda', href: '#/c/' + c.code}, h('b', {'data-proper': '', text: c.name}), h('i', {'aria-hidden': 'true', text: '›'})),
        h('p', {class: 'sj-ldv'}, h('span', {text: c.days + '날 · ' + c.times + '번 · ' + c.qty + '주 · 산 돈 ' + won(c.cost) + ' → 지금 ' + won(c.val)}),
          h('span', {class: 'sj-res', 'data-st': cs}, shapeI(cs), h('span', {text: ledRes(c.cost, c.val, c.one)}))),
        h('ol', {class: 'sj-ldt'}, ...ts.map(t => h('li', {'data-day': t.day, 'data-k': t.k}, h('b', {text: mday(t.day) ?? t.day}),
          h('span', {text: '「' + nameOf(t.k) + '」 · ' + q + '주 · 산 값 ' + won(t.buy) + ' → 지금 ' + won(t.now)})))));
    };
    const run = () => { const v = inp.value.trim(); if (!v) { out.replaceChildren(); note.textContent = base; return; }
      const hits = ledFind(L, v); out.replaceChildren(...hits.map(one)); note.textContent = hits.length ? '이 회사를 산 날을 모두 적었어요. 오래된 날이 위에 있어요.' : '「' + v + '」 — 이 장부에는 없는 회사예요.'; };
    inp.addEventListener('input', run);
    const form = h('form', {class: 'sj-findf', role: 'search', 'aria-label': '장부에서 회사 찾기'}, inp);
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    return h('section', {class: 'sj-sec sj-ldfind', 'aria-label': '장부에서 회사 찾기', 'data-n': String(TT.cos)},
      head('찾', '이름으로', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '회사로 찾기'}))), form, note, out, endSeal('찾'));
  };
  const kids = [
    pageHead({kick: '가짜 돈 장부 · 꾀가 산 모든 회사', h1: '장부', seal: '장', sealDn: st === 'dn', pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.ledger, 'figcaption'), heroPic('ledger')),
      say: (first ? mday(first) + '부터 ' : '') + '날마다 서른여섯 꾀가 고른 회사를 ' + q + '주씩 샀다고 치고 한 번도 빠짐없이 적었어요. 진짜 돈이 아니에요. 줄어든 것도 숨기지 않아요.',
      more: [h('dl', {class: 'sj-money sj-money-big', 'data-st': st}, h('dt', {text: '산 돈'}), h('dd', {text: won(TT.cost)}), h('dt', {text: '지금'}), h('dd', {text: TT.days ? won(TT.val) : SAID.none})),
        h('p', {class: 'sj-res sj-res-big', 'data-st': st}, shapeI(st), h('b', {text: TT.days ? ledRes(TT.cost, TT.val, TT.one) : SAID.none})),
        TT.days ? judgeBox(RW, D.tt) : null, // 판정 한 줄(주문 1123-2358) — 시장과 나란히 · 가장 깊이 빠진 때 · 아직 일러요
        h('p', {class: 'sj-loss', 'data-say': '', text: dn.length ? '돈이 줄어든 회사는 ' + dn.length + '곳이에요. 가장 많이 줄어든 회사는 「' + dn[0].name + '」로, ' + won(dn[0].cost - dn[0].val) + ' 줄었어요.' : '아직 돈이 줄어든 회사는 없어요.'}),
        h('p', {class: 'sj-note', text: (first ? mday(first) + '부터 · ' : '') + '산 날 ' + TT.days + '일 · 산 횟수 ' + NF.format(TT.buys) + '번 · 회사 ' + NF.format(TT.cos) + '곳'})]}),
    TT.cos ? findSec() : null, // 장부에서 회사 찾기(주문 1120-1804) — 머리 바로 아래
    h('section', {class: 'sj-sec sj-ldg', 'aria-label': '날마다 산 돈', 'data-rule': L.rule, 'data-days': String(TT.days), 'data-cost': String(Math.round(TT.cost)), 'data-val': String(Math.round(TT.val))},
      head('돈', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '날마다 산 돈'}))),
      TT.days ? h('p', {class: 'sj-rule sj-ldtip', text: '꺾은선이나 막대를 누르면 그날 숫자가 아래에 떠요. 손가락으로 옆으로 끌어도 돼요.'}) : null,
      TT.days ? h('figure', {class: 'sj-ldfig', 'aria-label': '쌓인 산 돈과 그 지금 값 꺾은선 · 산 돈 ' + won(TT.cost) + ' · 지금 ' + won(TT.val) + ' · 누르면 그날 숫자'}, ledCum(L),
        h('figcaption', {}, h('span', {class: 'sj-ldk sj-ldkc', text: '점선 = 쌓인 산 돈 ' + won(TT.cost)}), h('span', {class: 'sj-ldk sj-ldkv', text: '실선 = 그 지금 값 ' + won(TT.val)}))) : null,
      TT.days ? h('figure', {class: 'sj-ldfig', 'aria-label': '날마다 산 돈 막대 · 점은 그날 산 것의 지금 값 · 막대를 누르면 그날 숫자'}, ledBars(L),
        h('figcaption', {}, h('span', {text: '막대 = 그날 산 돈'}), h('span', {text: '점 = 그날 산 것의 지금 값'}), h('span', {text: (mday(first) ?? '') + ' → ' + (mday(last?.day) ?? '')}))) : null,
      TT.days ? null : h('p', {class: 'sj-tnone', text: SAID.none}),
      endSeal('돈')),
    TT.days ? filtSec() : null, // 거르개 열여덟(주문 1120-1817) — 날마다 · 회사마다 줄을 한곳에
    h('p', {class: 'sj-safe sj-sec', text: '가짜 돈으로 지난 기록을 적은 장부예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSec(D.asOf ? day(D.asOf) : day(T?.asOf?.board), gotOf(S), '「지금」은 그 회사의 가장 최근 마지막 값이에요. 산 날 뒤에 값이 아직 없으면, 하루밖에 안 지난 것으로 적어요.')];
    return frame({title: '장부', page: 'ledger', kids, tab: 4, rec: 1, lc: X.cur?.()?.code ?? null, next: {href: '#/r/t', label: '꾀마다 정산은 어떻게 됐을까?'}});
}

/* ── 오름 날수(#/l/d · 장부 옆 · 주문 1124-0432 — 사장님 2026-11-24(서울) 04:32 「어 그래」(물음 「이 분석 창을 사이트 장부 옆에 넣어 볼까요?」의 답) · 04:39 「1시간내에 작업 마무리해」
   분석 주문 1124-0354(03:54 「이런 하락 장에서 … 상승하는 꾀들이 대체 몇일이나 지속 되는지 … 몬테카를로 방식과 소거법 … 36가지의 도표」)
   내리는 시장인 날 꾀가 고른 일곱 회사가 다음 장날 올랐으면 산 값 위에 며칠 머물렀는지 · 아무렇게나 고른 일곱과 견줌 · 하나씩 빼 보기
   셈 scripts/atlas11/next/su21_fall.py → su/data/su21-fall.json · 지난 기록만 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · 「%」 0 ── */
const FALLD = '/su/data/su21-fall.json';
const okFall = F => !!F && F.rule === 'fall36-v1' && Array.isArray(F.rows) && F.rows.length === 36 && !!F.steps && !!F.rand && Array.isArray(F.rand.share);
const dn1 = v => (v == null ? '?' : String(Math.round(v * 10) / 10));
/* 머스크 판(주문 1124-1625 · 사장님 2026-11-24(서울) 16:25 「분석이 직관적이지 않고 그래 … 에이전트 100명 만들어서 공부 한뒤 머스크라면 어떻게 만들 것인지 해서 만들어」 · 16:29 「1시간안에 작업 다 해」)
   에이전트 100명 공부 → 지운 것: 하나씩 빼 보기 칸 · 띠와 점 그림 · 막대 다섯 칸 서른여섯 장
   남긴 것: 물음 하나 · 답 하나(가운데 날 「절반은 ○일 안에」 — 잣대 먼저) · 그림 하나(열 번 가운데 몇 번이 아직 산 값 위 — 점 열 개 두 줄 · 이 꾀 대 아무렇게나) · 꾀 고르기 하나 · 꾀 목록(무리별 · 제○계 차례) · 접힌 「어떻게 셌나요?」
   무리 = 두 번 견줘 두 번 다 같은 쪽일 때만 「뚜렷하게」(sure) — 한 줄 답과 목록이 같은 수 */
const FALL_DAYS = ['이틀째', '닷새째', '열흘째', '스무 날째'];
/** 산 날 뒤 이틀째 · 닷새째 · 열흘째 · 스무 날째에도 산 값 위였던 몫(열 번에 몇 번) — 칸 b = [1일 · 2~4일 · 5~9일 · 10~19일 · 스무 날 내내] */
const svOf = (b, n) => [1, 2, 3, 4].map(k => (n ? Math.round(10 * b.slice(k).reduce((x, y) => x + y, 0) / n) : 0));
const svRand = sh => [1, 2, 3, 4].map(k => Math.round(sh.slice(k).reduce((x, y) => x + y, 0)));
const dcOf = r => (r.cls === 'long' || r.cls === 'short' ? (r.sure ? r.cls : 'like') : r.cls);
const FALL_CO = ['long', 'like', 'short', 'few', 'none'];
const FALL_CLS = {long: '아무렇게나 고른 것보다 뚜렷하게 오래 버텼어요', like: '아무렇게나 고른 것과 뚜렷한 차이가 없었어요', short: '아무렇게나 고른 것보다 뚜렷하게 빨리 끝났어요', few: '오른 날이 적어 아직 가를 수 없어요', none: '거래량 자료가 없어 셀 수 없어요'};
const FALL_GH = {long: '더 오래 버틴 꾀', like: '차이가 없던 꾀', short: '빨리 끝난 꾀', few: '아직 가를 수 없는 꾀', none: '셀 수 없는 꾀'};
/** 점 열 개 한 줄 — 칠한 점 = 아직 산 값 위 */
const dots10 = (n, cls) => h('span', {class: 'sj-fdots ' + cls, 'aria-hidden': 'true'}, ...Array.from({length: 10}, (_, i) => h('i', {class: i < n ? 'on' : 'off'})));
export async function vFall(X) {
  const [F, T, {S}] = await Promise.all([X.get(FALLD).catch(() => null), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  if (!okFall(F)) return missPage(X, '분석', '분석 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const st = F.steps, rd = F.rand, rows = F.rows, cnt = rows.filter(r => ['long', 'like', 'short'].includes(r.cls)).sort((a, b) => kNo(a.k) - kNo(b.k));
  const allB = cnt.reduce((a, r) => a.map((x, i) => x + r.b[i]), [0, 0, 0, 0, 0]), allN = cnt.reduce((a, r) => a + r.rose, 0), randSv = svRand(rd.share), nLike = st.counted - st.sureLong - st.sureShort;
  const pickOf = k => { const r = cnt.find(x => x.k === k);
    return r ? {k, name: '제' + kNo(k) + '계 ' + nameOf(k), me: '이 꾀', sv: svOf(r.b, r.rose), n: r.rose, dc: dcOf(r), med: r.median} : {k: 'all', name: '꾀 ' + cnt.length + '가지 모두', me: '꾀 모두', sv: svOf(allB, allN), n: allN, dc: null, med: null}; };
  const ans = h('div', {class: 'sj-judge sj-fans', role: 'group', 'aria-label': '한 줄 답', 'data-rule': F.rule, 'data-rm': String(rd.median)},
    h('p', {class: 'sj-jk', text: '한 줄 답'}),
    h('p', {class: 'sj-fhero'}, h('span', {text: '오른 뒤 절반은 '}), h('b', {text: dn1(rd.median) + '일'}), h('span', {text: ' 안에 끝나요.'})),
    h('p', {class: 'sj-jn', text: '아무렇게나 고른 회사로 센 잣대예요.'}),
    h('p', {class: 'sj-jbig', text: '꾀 ' + st.counted + '가지 가운데 ' + nLike + '가지는 이 잣대와 뚜렷한 차이가 없었어요.'}),
    h('p', {class: 'sj-jbig', text: st.sureLong ? '뚜렷하게 더 오래 버틴 꾀는 ' + st.sureLong + '가지예요.' : '뚜렷하게 더 오래 버틴 꾀는 없었어요.'}),
    h('p', {class: 'sj-jbig', text: st.sureShort ? '뚜렷하게 빨리 끝난 꾀는 ' + st.sureShort + '가지예요.' : '뚜렷하게 빨리 끝난 꾀는 없었어요.'}));
  // 그림 하나 — 고른 꾀 대 아무렇게나 · 열 번 가운데 몇 번이 아직 산 값 위
  const sel = h('select', {class: 'sj-fsel', 'aria-label': '꾀 고르기'}, h('option', {value: 'all', text: '꾀 ' + cnt.length + '가지 모두'}),
    ...cnt.map(r => h('option', {value: r.k, text: '제' + kNo(r.k) + '계 ' + nameOf(r.k)})));
  const box = h('div', {class: 'sj-fbox', 'aria-live': 'polite'});
  const draw = k => { const P = pickOf(k);
    box.replaceChildren(
      h('p', {class: 'sj-fpick', 'data-k': P.k, 'data-n': String(P.n), 'data-sv': P.sv.join(' '), 'data-rsv': randSv.join(' ')}, h('b', {text: P.name}), h('span', {text: ' 오른 날 ' + NF.format(P.n) + '번'})),
      h('ol', {class: 'sj-fdl'}, ...FALL_DAYS.map((w, i) => h('li', {class: 'sj-fd'},
        h('p', {class: 'sj-fdw', text: w + ', 열 번에 몇 번이 산 값 위?'}),
        h('p', {class: 'sj-fdr sj-fme'}, h('span', {class: 'sj-fdn', text: P.me}), dots10(P.sv[i], 'me'), h('b', {text: P.sv[i] + '번'})),
        h('p', {class: 'sj-fdr sj-frnd'}, h('span', {class: 'sj-fdn', text: '아무렇게나'}), dots10(randSv[i], 'rnd'), h('span', {class: 'sj-fdc', text: randSv[i] + '번'}))))),
      h('p', {class: 'sj-fverd', text: P.dc ? FALL_CLS[P.dc] + '.' : '꾀를 하나 고르면, 그 꾀가 아무렇게나 고른 것과 어땠는지 나와요.'})); };
  draw('all');
  sel.addEventListener('change', () => draw(sel.value));
  const picSec = h('section', {class: 'sj-sec sj-fpic', 'aria-label': '열 번 가운데 몇 번이 버텼나'},
    head('날', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '열 번 가운데 몇 번이 버텼나'}))),
    h('p', {class: 'sj-rule', text: '점 열 개가 열 번이에요. 칠한 점이 산 값보다 아직 높은 것이에요. 꾀를 고르면 그림이 바뀌어요.'}),
    sel, box, endSeal('날'));
  // 꾀 목록 — 무리별 · 제○계 차례 · 누르면 위 그림이 그 꾀로
  const row = r => { const c = dcOf(r), go = ['long', 'like', 'short'].includes(c);
    const kids = [h('span', {class: 'sj-kno', text: '제' + kNo(r.k) + '계'}), h('b', {text: nameOf(r.k)}), h('span', {class: 'sj-fw', text: go ? '보통 ' + dn1(r.median) + '일' : c === 'few' ? '오른 날 ' + r.rose + '번' : '자료 없음'})];
    if (!go) return h('div', {class: 'sj-frow sj-frow0', 'data-k': r.k, 'data-cls': c}, ...kids);
    const b = h('button', {type: 'button', class: 'sj-frow', 'data-k': r.k, 'data-cls': c}, ...kids);
    b.addEventListener('click', () => { sel.value = r.k; draw(r.k); picSec.scrollIntoView({behavior: 'smooth', block: 'start'}); });
    return b; };
  const listSec = h('section', {class: 'sj-sec sj-flist', 'aria-label': '꾀마다 보기', 'data-n': String(rows.length)},
    head('꾀', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '꾀마다 보기'})), true),
    h('p', {class: 'sj-rule', text: '보통은 가운데 날이에요. 꾀를 누르면 위 그림이 그 꾀로 바뀌어요.'}),
    ...FALL_CO.map(c => { const rr = rows.filter(r => dcOf(r) === c).sort((a, b) => kNo(a.k) - kNo(b.k)); return rr.length ? h('div', {class: 'sj-fgrp', 'data-cls': c, 'data-n': String(rr.length)},
      h('h3', {class: 'sj-fgh', text: FALL_GH[c] + ' ' + rr.length + '가지'}), h('div', {class: 'sj-frows'}, ...rr.map(row))) : null; }),
    endSeal('꾀'));
  const how = h('section', {class: 'sj-sec sj-fhow'},
    h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '어떻게 셌나요?'}), chev()),
      h('p', {class: 'sj-rule', text: '내리는 시장인 날만 셌어요. ' + day(F.fallFrom) + '부터 ' + day(F.fallTo) + '까지 ' + F.fallDays + '날이에요.'}),
      h('p', {class: 'sj-rule', text: '그날 꾀가 고른 일곱 회사가 다음 장날 올랐으면, 산 값보다 높은 채로 며칠 갔는지 셌어요.'}),
      h('p', {class: 'sj-rule', text: '같은 날 아무렇게나 고른 일곱 회사도 똑같이 셌어요. 이것이 견줄 잣대예요.'}),
      h('p', {class: 'sj-rule', text: '아무렇게나 고르기를 ' + NF.format(F.sims) + '번 해 견주고, 이웃한 날을 빼고 한 번 더 견줬어요. 두 번 다 같은 쪽일 때만 뚜렷하다고 적었어요.'}),
      h('p', {class: 'sj-rule', text: '꾀 ' + st.counted + '가지를 한꺼번에 견주면, 우연으로도 ' + dn1(st.chance) + '가지쯤은 한쪽으로 나와요.'}),
      h('p', {class: 'sj-rule', text: '오른 날이 ' + F.minRose + '번이 안 되는 꾀 ' + st.few + '가지는 아직 가르지 않았어요. 거래량 자료가 없는 꾀 ' + st.none + '가지는 셀 수 없었어요.'})));
  const kids = [
    pageHead({kick: '분석 · 지난 기록', h1: '오른 꾀, 며칠 버틸까', seal: '날',
      say: '내리는 시장에서 다음 날 오른 회사가, 산 값보다 높게 며칠 갔는지 셌어요.', more: [ans]}),
    picSec, listSec, how,
    h('p', {class: 'sj-safe sj-sec', text: '지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSec(day(F.asOf), gotOf(S))];
  return frame({title: '분석', page: 'fall', kids, tab: 4, rec: 3, lc: X.cur?.()?.code ?? null, next: {href: '#/l', label: '장부도 볼까?'}});
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
    findBox(X.get), // 회사 찾기(주문 1120-1447 · 사장님 14:47 「원하는 회사명이나 종목명을 직접 검색할 수 있는 검색창」)
    h('section', {class: 'sj-sec sj-pks', 'aria-label': '오늘 여러 꾀가 고른 회사', 'data-n': String(P.rows.length), 'data-rule': P.rule},
      head('곳', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '오늘 여러 꾀가 고른 회사'}), h('span', {class: 'sj-h2n', text: ' ' + P.rows.length + '곳'}))),
      h('p', {class: 'sj-dayl', text: (bd ? bd + ' 마지막 값으로 고른 회사예요. ' : '') + '꾀 두 가지 넘게 고른 곳만 적었어요. 꺾은선은 날마다 고른 꾀 수예요.'}),
      ...(P.rows.length ? fold7(h('ol', {class: 'sj-pkl'}, ...P.rows.map(row)), (o, n) => '나머지 ' + (n - o) + '곳 더 보기') : [h('p', {class: 'sj-tnone', text: '오늘은 꾀 두 가지 넘게 고른 회사가 없어요. 억지로 채우지 않았어요.'})]),
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
  return frame({title: '여러 꾀가 고른 회사', page: 'picks', kids, tab: 2, lc: X.cur?.()?.code ?? null, next: {href: '#/k', label: '서른여섯 꾀 모두 볼까?'}});
}
