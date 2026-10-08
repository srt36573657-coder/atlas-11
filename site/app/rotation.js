/* ATLAS 11 · 「돈의 이동」 — 탭 「불장」(#/) 맨 위 · 한국 판
   사장님 2026-10-07 21:55 「너가 이해를 잘못이해 한게 있어 뭐야 돈에 흐름이 지금 현재 뭐냐 현실적으로 지금은 거시적이잖아」
     → 22:06 「아니 내말은 어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐 이거야」
   앞 판(16:34 「ATLAS가 고른 돈 이야기」)은 기사로 고른 사슬 하나(일 → 돈 받는 곳 ⇢ 다음)였다 — 시장의 돈이 실제로 어디서 어디로 옮겨 가는지는 아니었다
   → 첫 화면 한 장(규칙 30): 기(결론) 빠지는 곳 → 들어가는 곳 / 승(기간) 언제부터 · 며칠째 / 전(포모값) 0점~100점 · 말 다섯 등급 / 결(누가) 판 쪽 · 산 쪽
   → 2026-10-08 00:12 「글이 너무 많아 · 더 과감하게 움직이는 도식화를 예술적으로」: 네 줄 글을 청자 그림 한 장으로(아래 artSvg · 규칙 32)
   셈은 lib/atlas11/rotation.mjs(/story.json 의 rotation · 판을 쌀 때 저절로) · 이 파일은 그리기만 · 움직임은 한 번에 하나(artPlayer)
   「조 원」 = 업종 시가총액 몫(시장 전체가 같은 비율로 움직였을 때와 견준 차이 · 업종 73개를 더하면 0원) — 숫자와 단위는 따로 적음(다른 말에서 「조」를 큰 숫자로 펼치지 않게)
   2026-10-08 01:27 「다해 전나라」: 다섯 나라 모두 — 단위는 나라 돈(조 원 · 조 달러 · 조 위안 · 조 엔 · 조 동) · 순매매 자료가 없는 판(미국 · 중국 · 일본 · 베트남)은 결 낙관이 「빠지는 곳 포모값」(지어내지 않음)
   재생기는 art.js 한 틀(모든 화면 그림이 같이 씀 · 규칙 33) */
import {h, korDate, finite} from './util.js';
import {pic} from './story.js';
import {artStage, defs, hills} from './art.js'; // 한 번에 하나 · 기승전결 · 다시 보기 · 소리로 듣기 — 모든 그림이 같이 쓰는 틀 · 무대 · 배우 색
import {actor} from './cast.js'; // 배우 셋(2026-10-08 06:40 영화)

const ACTOR = {foreign: '외국인', institution: '기관', individual: '개인'};
const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '');
/** 억 원 → 「−14.7」 + 「조 원」(숫자 · 단위 따로) · 1조 원보다 작으면 소수 둘째 자리 */
const UNIT = {kr: '조 원', us: '조 달러', cn: '조 위안', jp: '조 엔', vn: '조 동'};
export const unitOf = r => UNIT[r?.place] ?? '조 원';
const amt = (v, u = '조 원') => [h('span', {class: 'rt-a'}, h('b', {class: 'rt-n' + (v > 0 ? ' up' : v < 0 ? ' down' : '')}, sign(v) + (Math.abs(v) / 1e4).toFixed(Math.abs(v) >= 1e4 ? 1 : 2)), h('span', {class: 'rt-u'}, u))]; // 한국어는 숫자와 「조 원」이 한 줄(「원」만 다음 줄로 떨어지지 않게)
const heatOf = s => (!finite(s) ? 'none' : s >= 80 ? '5' : s >= 60 ? '4' : s >= 40 ? '3' : s >= 20 ? '2' : '1');
const score = s => (finite(s) ? `${Math.round(s)}점` : '없음');
const sinceLine = p => `${korDate(p.start)}부터 · ${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`;

/** 판 쪽 · 산 쪽 — 빠지는 곳에서 가장 많이 판 쪽 · 들어가는 곳에서 가장 많이 산 쪽(외국인 · 기관 · 개인) */
function whoMoved(r) {
  const a = r.out[0]?.who, b = r.in[0]?.who;
  const sell = a ? Object.entries(a).sort((x, y) => x[1] - y[1])[0] : null, buy = b ? Object.entries(b).sort((x, y) => y[1] - x[1])[0] : null;
  return {sell: sell && sell[1] < 0 ? {actor: ACTOR[sell[0]], v: sell[1]} : null, buy: buy && buy[1] > 0 ? {actor: ACTOR[buy[0]], v: buy[1]} : null};
}

/* ── 그림 한 장 — 영화 「로미오와 줄리엣」 프롤로그(2026-10-08 06:40 「청자로 하지 말고 이 세 캐릭터를 주식 캐릭터로 … 한편에 영화처럼」 · 06:46 「1차 파장만 있다 5차 파장까지」) ──
   청자 매병 대신 무대: 돈의 파장 1~5차(lib/atlas11/rotation.mjs waves — 10거래일씩 돈이 가장 많이 들어간 업종을 차례로 · 지난 기록만)를 집 다섯 채로
   · 기: 집들이 서고(파장마다 한 채 · 지붕 위 점 = 몇 차) → 로미오(돼지 · 돈)가 1차 집에서 지금 집까지 걸어감
   · 승: 지나온 길(점선)이 그려짐 · 전: 지금 집 발코니에 줄리엣(반함) → 티볼트(고슴도치 · 가시 = 포모값)
   · 결: 낙관(판 쪽 · 산 쪽 — 순매매가 없는 판은 빠지는 곳 포모값) · 그림에는 글자가 없다(이름 · 숫자는 아래 HTML) · 한 번에 하나 */
const HOUSE = ['#B9A8FF', '#FFB3C7', '#FFD9A0', '#9FE0C8', '#F7A8D8'];
function house(x, base, w, hh, i, cur) {
  const c = HOUSE[i % HOUSE.length], roof = `M${x - w / 2 - 4},${base - hh} L${x},${base - hh - w * 0.55} L${x + w / 2 + 4},${base - hh}Z`;
  const pips = Array.from({length: i + 1}, (_, k) => `<circle cx="${(x - (i * 3.5) + k * 7).toFixed(1)}" cy="${(base - hh - w * 0.55 - 6).toFixed(1)}" r="2.2" fill="#FFE7A3"/>`).join(''); // 몇 차 = 점 수
  return `<rect x="${(x - w / 2).toFixed(1)}" y="${base - hh}" width="${w}" height="${hh}" rx="3" fill="${c}" fill-opacity="${cur ? 1 : 0.82}" stroke="#2A1F5C" stroke-opacity=".35"/>`
    + `<path d="${roof}" fill="#7E1730" fill-opacity="${cur ? 1 : 0.85}"/><rect x="${(x - w * 0.16).toFixed(1)}" y="${(base - hh * 0.5).toFixed(1)}" width="${(w * 0.32).toFixed(1)}" height="${(hh * 0.5).toFixed(1)}" rx="2" fill="#3B2F7A"/>`
    + (cur ? `<rect x="${(x - w / 2 - 6).toFixed(1)}" y="${(base - hh * 0.62).toFixed(1)}" width="${w + 12}" height="4" rx="2" fill="#F2E6D0"/>` : '') + pips;
}
function artSvg(r) {
  const p = 'rt', H = 168, base = 158, ws = r.waves?.length ? r.waves : [{n: 1, to: r.pair.to}], k = ws.length;
  const xs = ws.map((_, i) => (k === 1 ? 250 : 46 + i * (230 / (k - 1)))), sz = ws.map((_, i) => 32 + i * 3), hz = ws.map((_, i) => 32 + i * 6); // 집 크게(휴대폰에서 보이게 · 옆집과 지붕이 닿지 않게 — 간격 57.5 · 가장 큰 집 지붕 폭 52)
  const last = k - 1, xL = xs[last], topL = base - hz[last];
  const trail = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${(base - hz[i] - sz[i] * 0.55 - 14).toFixed(1)}`).join(' ');
  const f = finite(r.fomo.to) ? r.fomo.to : 0, kk = 0.6 + 0.75 * Math.min(1, f / 100), hogFace = f >= 80 ? 'angry' : f >= 60 ? 'shock' : f >= 40 ? 'happy' : 'sleepy';
  const pigEnd = xL - sz[last] / 2 - 16;
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}${hills(p, H, 0.5)}
<g class="ak-pop" data-at="0">${ws.map((w, i) => house(xs[i], base, sz[i], hz[i], i, i === last)).join('')}</g>
<g class="ak-mv" data-at="1" data-v="x0:${(xs[0] - pigEnd).toFixed(1)}px">${actor('pig', {x: pigEnd, y: base + 1, s: 0.44, face: 'love', prop: ['coin'], P: p})}</g>
<path class="ak-draw" data-at="2" pathLength="100" d="${trail}" fill="none" stroke="#FFE7A3" stroke-width="2" stroke-linecap="round" stroke-opacity=".9"/>
<g class="ak-pop" data-at="3">${actor('cat', {x: xL, y: topL + hz[last] * 0.38 - 2, s: 0.38, face: 'love', prop: ['heart'], P: p})}</g>
<g class="ak-pop" data-at="4">${actor('hog', {x: Math.min(334, xL + sz[last] / 2 + 20), y: base + 1, s: 0.42, face: hogFace, k: kk, P: p, flip: true})}</g>
</svg>`;
}
/** 긴 업종 이름(바깥 판 「다각적 산업용 제품 도매」 등)은 글씨를 줄여 한 화면에(규칙 30) */
export const longCls = t => (String(t).length > 12 ? ' ra-long2' : String(t).length > 6 ? ' ra-long' : '');
/** 이름 · 숫자 · 낙관 — 왼쪽(빠지는 곳) · 오른쪽(들어가는 곳 · 포모값) */
function labelsOf(r) {
  const p = r.pair, a = r.out[0], b = r.in[0], w = whoMoved(r), u = unitOf(r);
  const seal = (tag, who, k) => h('p', {class: 'ra-seal', 'data-at': String(k)}, h('span', {class: 'ra-st'}, tag), ' ', h('span', {class: 'ra-sw'}, who ?? '없음'));
  // 순매매 자료가 없는 판 — 결 낙관 하나: 빠지는 곳 포모값(식은 쪽) · 들어가는 곳 포모값(불)과 견줌
  const cold = () => h('p', {class: 'ra-seal ra-seal-f', 'data-at': '5'}, h('span', {class: 'ra-st'}, '포모값'), ' ', h('span', {class: 'ra-sw'}, score(r.fomo.from)), ' ', h('span', {class: 'ra-sw'}, r.fomo.fromWord ?? '없음'));
  const ws = r.waves ?? [];
  // 돈의 파장 1~5차(06:46) — 지난 기록에서 돈이 차례로 가장 많이 들어간 업종 · 마지막이 지금 · 이름은 그 말로(73개 말 · 업종 이름 사전)
  // 자리: 지금 짝(빠지는 곳 → 들어가는 곳) 이름 · 숫자 다음(지나온 이야기 — 「지난 줄거리」) · 긴 말에서도 지금 짝이 첫 화면에(규칙 30)
  const rw = ws.length ? h('ol', {class: 'rw', 'aria-label': '돈의 파장'}, ...ws.map((x, i) => h('li', {class: 'rw-c' + (i === ws.length - 1 ? ' rw-now' : ''), 'data-n': String(x.n)}, h('b', {class: 'rw-k'}, `${x.n}차`), ' ', h('span', {class: 'rw-l'}, x.to.label)))) : null;
  const main = h('div', {class: 'ra-lab ra-lab-rot'},
    h('div', {class: 'ra-col ra-ca'}, h('p', {class: 'ra-n' + longCls(p.from.label)}, p.from.label), h('p', {class: 'ra-m'}, ...amt(a.amount, u))),
    h('div', {class: 'ra-col ra-cb'}, h('p', {class: 'ra-n' + longCls(p.to.label)}, p.to.label), h('p', {class: 'ra-m'}, ...amt(b.amount, u)),
      h('p', {class: 'ra-fomo'}, h('span', {class: 'ra-fk'}, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(r.fomo.to)}, score(r.fomo.to)), ' ', h('span', {class: 'ra-fw'}, r.fomo.toWord ?? '없음'))),
  );
  // 결 낙관(판 쪽 · 산 쪽 = 누가 팔고 샀나)은 두 칸(어디서 어디로 · 얼마 · 포모값) 다음 한 줄 — 긴 말에서 오른쪽 칸만 길어져 첫 화면을 넘던 것(2026-10-08 말 73개 가장 긴 글 검사)
  const seals = h('div', {class: 'ra-srow ra-srow2'}, r.flows ? [seal('판 쪽', w.sell?.actor, 5), seal('산 쪽', w.buy?.actor, 6)] : cold());
  return h('div', {class: 'ra-fwrap ra-rotwrap'}, main, seals, rw);
}
/** 걸음 일곱(한 번에 하나) — c = 기승전결 차례 · at = 움직이는 그림 · ms = 머무는 시간 */
const ART_STEPS = [{c: 0, at: 0, ms: 950}, {c: 0, at: 1, ms: 1900}, {c: 1, at: 2, ms: 1300}, {c: 2, at: 3, ms: 1000}, {c: 2, at: 4, ms: 1150}, {c: 3, at: 5, ms: 750}, {c: 3, at: 6, ms: 1400}]; // 집 → 로미오 걸음 → 지나온 길 → 줄리엣 → 티볼트(포모) → 낙관 둘
const ART_STEPS6 = [...ART_STEPS.slice(0, 5), {c: 3, at: 5, ms: 1400}]; // 순매매 자료가 없는 판 — 결 낙관 하나
/** 소리 — 차례마다 한 덩이(그 말로 읽음) */
function sayOf(r) {
  const p = r.pair, w = whoMoved(r);
  return [['빠지는 곳', p.from.label, '들어가는 곳', p.to.label], ['돈의 파장', ...(r.waves ?? []).map(x => `${x.n}차 ${x.to.label}`), `${korDate(p.start)}부터`, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`],
    ['포모값', score(r.fomo.to), r.fomo.toWord ?? '없음'], r.flows ? ['판 쪽', w.sell?.actor ?? '없음', '산 쪽', w.buy?.actor ?? '없음'] : ['빠지는 곳', p.from.label, '포모값', score(r.fomo.from), r.fomo.fromWord ?? '없음']];
}
/** 그림 한 장 — art.js 틀(한 번에 하나 · 차례 점 넷 · 다시 보기 · 소리로 듣기 · 화면 밖이면 멈춤 · 움직임 줄이기면 끝 모습) */
const artPlayer = r => artStage({key: 'rot', svg: artSvg(r), labels: labelsOf(r), steps: r.flows ? ART_STEPS : ART_STEPS6, says: sayOf(r),
  cap: {t: [`로미오(돈)가 집 ${(r.waves ?? []).length || 1}곳을 건넜다`, ' — ', h('span', {class: 'ra-ts'}, `${korDate(r.pair.start)}부터`), ' ', h('b', {class: 'ra-td'}, `${r.pair.days}거래일${r.pair.atLeast ? ' 넘게' : '째'}`)], who: 'pig', face: 'love', prop: ['coin']}}); // 포모값은 티볼트 가시 크기(그림 속 transform 속성 — 글 속 style 없음)

/** 맨 위 무대 — 제목 · 기간(달 위) · 그림 한 장 · 이름 · 숫자 · 낙관 · 차례 점 · 단추 둘 · 아래에 빠지는 곳 셋 · 들어가는 곳 셋 · 셈 방법(접힘) */
export function rotationBox(r) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  const u = unitOf(r), li = x => h('li', {class: 'rt-li'}, h('span', {class: 'rt-l'}, x.label), h('span', {class: 'rt-v'}, ...amt(x.amount, u)), h('span', {class: 'rt-f'}, h('span', null, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(x.fomo)}, score(x.fomo))));
  return h('section', {class: 'sy rt', 'aria-label': '돈의 이동', 'data-from': p.from.id, 'data-to': p.to.id, 'data-place': r.place ?? 'kr',
    'data-check': JSON.stringify({from: p.from.id, to: p.to.id, start: p.start, days: p.days, outAmt: r.out[0].amount, inAmt: r.in[0].amount, fomo: r.fomo.to, waves: (r.waves ?? []).map(x => [x.n, x.to.id, x.start, x.end])})}, // 빠짐없이 도는 검사기가 /story.json 과 맞댐(규칙 34 · 파장은 scripts/atlas11/verify/waves_verify.py 가 따로 셈)
    h('p', {class: 'sy-k'}, h('span', null, '돈의 이동'), h('span', {class: 'sy-kw'}, `지난 ${r.window.days}거래일 · ${korDate(r.asOf)} 종가까지`)),
    artPlayer(r), // 기간(○월 ○일부터 ○거래일째)은 그림 아래 자막 끝으로(규칙 1 — 자막 띠를 넣으면서 그림 위 기간 줄을 뺌 · 긴 말에서 그림이 첫 화면 아래로 밀리던 것)
    h('div', {class: 'rt-all'},
      h('div', {class: 'rt-col', 'data-side': 'out'}, h('p', {class: 'rt-h'}, '빠지는 곳'), h('ol', {class: 'rt-ol'}, ...r.out.map(li))),
      h('div', {class: 'rt-col', 'data-side': 'in'}, h('p', {class: 'rt-h'}, '들어가는 곳'), h('ol', {class: 'rt-ol'}, ...r.in.map(li)))),
    h('details', {class: 'rt-how'}, h('summary', null, '어떻게 셌나'),
      h('p', null, `「${u}」 = 업종 시가총액 몫 — 시장 전체가 같은 비율로 움직였을 때와 견준 차이(업종 ${r.groups}개 · 더하면 0)`),
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
