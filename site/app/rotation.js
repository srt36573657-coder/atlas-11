/* ATLAS 11 · 「돈의 이동」 — 탭 「불장」(#/) 맨 위 · 한국 판
   사장님 2026-10-07 21:55 「너가 이해를 잘못이해 한게 있어 뭐야 돈에 흐름이 지금 현재 뭐냐 현실적으로 지금은 거시적이잖아」
     → 22:06 「아니 내말은 어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐 이거야」
   앞 판(16:34 「ATLAS가 고른 돈 이야기」)은 기사로 고른 사슬 하나(일 → 돈 받는 곳 ⇢ 다음)였다 — 시장의 돈이 실제로 어디서 어디로 옮겨 가는지는 아니었다
   → 첫 화면 한 장(규칙 30)에 네 줄: 기(결론) 빠지는 곳 → 들어가는 곳 / 승(기간) 언제부터 · 며칠째 / 전(포모값) 0점~100점 · 말 다섯 등급 / 결(누가) 판 쪽 · 산 쪽
   셈은 lib/atlas11/rotation.mjs(/story.json 의 rotation · 판을 쌀 때 저절로) · 이 파일은 그리기만 · 움직임은 한 번에 하나(story.js player)
   「조 원」 = 업종 시가총액 몫(시장 전체가 같은 비율로 움직였을 때와 견준 차이 · 업종 73개를 더하면 0원) — 숫자와 단위는 따로 적음(다른 말에서 「조」를 큰 숫자로 펼치지 않게) */
import {h, korDate, pct, finite} from './util.js';
import {player, pic, at, readMs} from './story.js';

const RCH = [['기', '결론'], ['승', '기간'], ['전', '포모값'], ['결', '누가 옮겼나']]; // 줄 이름(한국어 글자 기승전결은 한국어 화면에만)
const ACTOR = {foreign: '외국인', institution: '기관', individual: '개인'};
const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '');
/** 억 원 → 「−14.7」 + 「조 원」(숫자 · 단위 따로) · 1조 원보다 작으면 소수 둘째 자리 */
const amt = v => [h('span', {class: 'rt-a'}, h('b', {class: 'rt-n' + (v > 0 ? ' up' : v < 0 ? ' down' : '')}, sign(v) + (Math.abs(v) / 1e4).toFixed(Math.abs(v) >= 1e4 ? 1 : 2)), h('span', {class: 'rt-u'}, '조 원'))]; // 한국어는 숫자와 「조 원」이 한 줄(「원」만 다음 줄로 떨어지지 않게)
const heatOf = s => (!finite(s) ? 'none' : s >= 80 ? '5' : s >= 60 ? '4' : s >= 40 ? '3' : s >= 20 ? '2' : '1');
const score = s => (finite(s) ? `${Math.round(s)}점` : '없음');
const sinceLine = p => `${korDate(p.start)}부터 · ${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`;

/** 판 쪽 · 산 쪽 — 빠지는 곳에서 가장 많이 판 쪽 · 들어가는 곳에서 가장 많이 산 쪽(외국인 · 기관 · 개인) */
function whoMoved(r) {
  const a = r.out[0]?.who, b = r.in[0]?.who;
  const sell = a ? Object.entries(a).sort((x, y) => x[1] - y[1])[0] : null, buy = b ? Object.entries(b).sort((x, y) => y[1] - x[1])[0] : null;
  return {sell: sell && sell[1] < 0 ? {actor: ACTOR[sell[0]], v: sell[1]} : null, buy: buy && buy[1] > 0 ? {actor: ACTOR[buy[0]], v: buy[1]} : null};
}

/** 네 줄(기승전결) */
function rowsOf(r) {
  const p = r.pair, A = p.from.label, B = p.to.label, a = r.out[0], b = r.in[0], w = whoMoved(r);
  const span = t => h('span', null, t);
  return [
    {lab: ['빠지는 곳 → 들어가는 곳'], main: `${A} → ${B}`, big: true, say: ['빠지는 곳', A, '들어가는 곳', B],
      sub: {parts: [span(A), ' ', ...amt(a.amount), ' · ', span(B), ' ', ...amt(b.amount)]}},
    {lab: ['언제부터'], main: sinceLine(p),
      sub: {icon: 'm:cal', at: 3, parts: [span(B), ' ', h('b', {class: 'chg20 ' + (p.toChange > 0 ? 'up' : 'down')}, pct(p.toChange, 1)), ' · ', span(A), ' ', h('b', {class: 'chg20 ' + (p.fromChange > 0 ? 'up' : 'down')}, pct(p.fromChange, 1))]}},
    {lab: ['0점~100점'], main: [span(B), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(r.fomo.to)}, score(r.fomo.to)), ' · ', span(r.fomo.toWord ?? '없음')],
      say: [B, score(r.fomo.to), r.fomo.toWord ?? '없음'],
      sub: {parts: [span(A), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(r.fomo.from)}, score(r.fomo.from)), ' · ', span(r.fomo.fromWord ?? '없음')]}},
    {lab: [r.flows ? `${r.flows.days}거래일 순매매` : '순매매'], icon: 'm:who', iconAt: 6,
      main: w.sell ? [span('판 쪽'), ': ', span(w.sell.actor), ' ', span(A), ' ', ...amt(w.sell.v)] : [span('판 쪽'), ': ', span('없음')],
      say: w.sell ? ['판 쪽', w.sell.actor, A] : ['판 쪽', '없음'],
      sub: {parts: w.buy ? [span('산 쪽'), ': ', span(w.buy.actor), ' ', span(B), ' ', ...amt(w.buy.v)] : [span('산 쪽'), ': ', span('없음')]}},
  ];
}
/** 걸음 일곱 — 기: 빠지는 곳 켜짐 → 줄 · 동전(빠지는 곳 → 들어가는 곳) → 들어가는 곳 켜짐 / 승: 달력 / 전: 줄 → 온도계 / 결: 사람 둘 */
function stepsOf(rows) {
  const r = c => readMs(rows[c], c, RCH);
  return [{c: 0, at: 0, ms: 900}, {c: 0, at: 1, ms: 1750}, {c: 0, at: 2, ms: Math.max(1200, r(0) - 2650)}, {c: 1, at: 3, ms: r(1)},
    {c: 2, at: 4, ms: 900}, {c: 2, at: 5, ms: Math.max(1200, r(2) - 900)}, {c: 3, at: 6, ms: r(3)}];
}
/** 한눈 그림 — 빠지는 곳(상자에서 나감) → 동전 → 들어가는 곳(크고 빛남) ┄ 온도계(포모값) · 그림에는 글자가 없다(옆 네 줄이 말함) */
const mapOf = r => h('div', {class: 'sy-map rt-map', 'aria-hidden': 'true'},
  at(pic('m:out', 'sy-mn sy-mn1'), 0), at(h('span', {class: 'sy-tr'}, h('i', {class: 'sy-coin'})), 1),
  at(pic('m:in', 'sy-mn sy-mn2'), 2), at(h('span', {class: 'sy-tr sy-tr-d'}), 4),
  at(pic('m:heat', 'sy-mn sy-mn3 rt-th'), 5));

let played = false; // 저절로 한 번은 이 창에서 처음 그릴 때만(story.js 와 같은 뜻)
/** 맨 위 무대 — 제목 · 한눈 그림 · 네 줄 · 다시 보기 · 소리로 듣기 · 아래에 빠지는 곳 셋 · 들어가는 곳 셋 · 셈 방법(접힘) */
export function rotationBox(r) {
  if (!r || r.none || !r.pair) return null;
  const fresh = !played; played = true;
  const rows = rowsOf(r), map = mapOf(r);
  map.querySelector('.rt-th').dataset.heat = heatOf(r.fomo.to);
  const li = x => h('li', {class: 'rt-li'}, h('span', {class: 'rt-l'}, x.label), h('span', {class: 'rt-v'}, ...amt(x.amount)), h('span', {class: 'rt-f'}, h('span', null, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(x.fomo)}, score(x.fomo))));
  return h('section', {class: 'sy rt' + (fresh ? ' sy-in' : ''), 'aria-label': '돈의 이동', 'data-from': r.pair.from.id, 'data-to': r.pair.to.id},
    h('p', {class: 'sy-k'}, h('span', null, '돈의 이동'), h('span', {class: 'sy-kw'}, `지난 ${r.window.days}거래일 · ${korDate(r.asOf)} 종가까지`)),
    player({rows, steps: stepsOf(rows), map, ch: RCH}, fresh),
    h('div', {class: 'rt-all'},
      h('div', {class: 'rt-col', 'data-side': 'out'}, h('p', {class: 'rt-h'}, '빠지는 곳'), h('ol', {class: 'rt-ol'}, ...r.out.map(li))),
      h('div', {class: 'rt-col', 'data-side': 'in'}, h('p', {class: 'rt-h'}, '들어가는 곳'), h('ol', {class: 'rt-ol'}, ...r.in.map(li)))),
    h('details', {class: 'rt-how'}, h('summary', null, '어떻게 셌나'),
      h('p', null, `조 원 = 업종 시가총액 몫 — 시장 전체가 같은 비율로 움직였을 때와 견준 차이(${r.groups}개 업종 · 더하면 0원)`),
      h('p', null, '기간 = 들어가는 곳이 빠지는 곳보다 앞서기 시작한 날(두 업종 지수 비의 마지막 바닥)부터'),
      h('p', null, `포모값 = 옛 ATLAS FOMO ${r.fomo.of}가지 가운데 종가로 셀 수 있는 ${r.fomo.items}가지(10일 상승률 · 상승 가속 · 상승일 비중 · 20일 평균 이격 · 60일 고점 돌파 · 상승 변동 집중)를 지난 ${r.fomo.refs}번과 견준 백분위 · 거래량 · 장중 · 개인 · 관심 ${r.fomo.of - r.fomo.items}가지는 자료가 없어 뺌`),
      r.flows ? h('p', null, `순매매 = 외국인 · 기관 · 개인이 사고판 주식 수 × 그날 종가(어림) · ${korDate(r.flows.from)}~${korDate(r.flows.to)}`) : null));
}

/** 탭 「불장」 맨 아래 「결」 — 맨 위 결론을 한 번 더(2026-10-07 20:04 「기승전결」) */
export function rotationEnd(r) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  return h('section', {class: 'sy-end rt-end', 'aria-label': '돈의 이동'},
    h('p', {class: 'sy-end-k'}, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': '', 'aria-hidden': 'true'}, '결'), h('span', null, '돈의 이동')),
    h('p', {class: 'sy-end-m', 'data-speak': ''}, pic('m:in', 'sy-ifi'), h('span', null, `${p.from.label} → ${p.to.label}`)),
    h('p', {class: 'sy-end-s'}, sinceLine(p)),
    h('p', {class: 'sy-end-s'}, h('span', null, '포모값'), ' ', h('b', null, score(r.fomo.to)), ' · ', h('span', null, r.fomo.toWord ?? '없음')));
}

/** 소리로 듣기 한 줄(화면 요약) */
export const rotationSay = r => (!r || r.none || !r.pair ? '' : `돈의 이동. 빠지는 곳: ${r.pair.from.label}. 들어가는 곳: ${r.pair.to.label}. ${sinceLine(r.pair)}. 포모값 ${score(r.fomo.to)}, ${r.fomo.toWord ?? '없음'}. `);
