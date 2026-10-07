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
import {artStage} from './art.js'; // 한 번에 하나 · 기승전결 · 다시 보기 · 소리로 듣기 — 모든 그림이 같이 쓰는 틀

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

/* ── 그림 한 장(2026-10-08 00:12 사장님 「자 더 깊게 생각해봐 글이 너무 많아 더 과감하게 움직이는 도식화를 예술적으로 만들어봐 예술적으로 말이야」) ──
   네 줄 글 대신 청자 그림 한 장: 빠지는 곳의 매병(왼쪽 위 받침)이 기울어 금빛 물줄기를 쏟고 → 들어가는 곳의 매병(오른쪽 아래 가마 위)에 금빛이 차오른다
   · 위: 달이 기간을 건넌다(거래일마다 점 하나) · 들어가는 곳 아래: 가마 불(높이 = 포모값 ÷ 100) · 이름 밑: 붉은 낙관(판 쪽 · 산 쪽)
   · 글은 이름과 숫자만(모두 이미 말 73개로 옮긴 낱말) · 움직임은 한 번에 하나(규칙 28): 기(기울기 → 물줄기 → 차오름) · 승(달) · 전(불) · 결(낙관 둘) — 끝나면 불만 아주 조금 일렁임
   · 그림에는 글자가 없다(화면 읽기 프로그램은 아래 이름 · 숫자를 읽음) · 움직임 줄이기 설정이면 처음부터 끝 모습 · 글은 흐려졌다 나타나지 않음(낙관은 크기만 움직임) */
const VASE = 'M29.7,0 L42.3,0 L41.4,7.2 C63,10.8 72,23.4 68.4,36 C64.8,55.8 55.8,77.4 52.2,90 L56.7,99 L15.3,99 L19.8,90 C16.2,77.4 7.2,55.8 3.6,36 C0,23.4 9,10.8 30.6,7.2 Z'; // 매병(폭 72 · 높이 99 · 입 가운데 36,0)
const INLAY = '<circle cx="36" cy="34" r="10" fill="none" stroke="#F4F1EA" stroke-opacity=".5" stroke-width="1.1"/><path d="M30,35 c2,-4 7,-5 9,-1 c1,3 -2,5 -4,3" fill="none" stroke="#F4F1EA" stroke-opacity=".6" stroke-width="1.1" stroke-linecap="round"/>'
  + '<path d="M17,60 c5,-5 11,-4 13,1 M42,66 c4,-4 10,-3 11,2 M24,78 c3,-3 8,-2 9,1" fill="none" stroke="#F4F1EA" stroke-opacity=".38" stroke-width="1" stroke-linecap="round"/>'
  + '<path d="M12,44 l7,5 M58,47 l-6,6 M47,84 l4,6 M23,25 l5,3" stroke="#0B1411" stroke-opacity=".22" stroke-width=".7"/>'; // 상감 구름 · 둥근 창 · 빙렬(가는 금)
const ARC = {cx: 180, cy: 576.1, r: 564.1, a: 16.05}; // 달 길(위로 굽은 활 · 왼쪽 끝 = 시작 날 · 오른쪽 끝 = 마지막 종가 날)
function artSvg(r) {
  const p = r.pair, n = Math.max(2, Math.min(21, p.days + 1)), rad = d => d * Math.PI / 180;
  const marks = Array.from({length: n}, (_, i) => { const t = rad(-ARC.a + (2 * ARC.a) * i / (n - 1)); return `<circle cx="${(ARC.cx + ARC.r * Math.sin(t)).toFixed(1)}" cy="${(ARC.cy - ARC.r * Math.cos(t)).toFixed(1)}" r="${i === 0 || i === n - 1 ? 3 : 2}" fill="#F4F1EA" fill-opacity="${i === 0 || i === n - 1 ? '.8' : '.45'}"/>`; }).join('');
  return `<svg class="ra-svg" viewBox="0 0 360 246" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="ra-glaze" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#3F6E5E"/><stop offset=".3" stop-color="#9CCDB8"/><stop offset=".58" stop-color="#77AE98"/><stop offset="1" stop-color="#335C4E"/></linearGradient>
<linearGradient id="ra-glaze2" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#4E8673"/><stop offset=".3" stop-color="#BFE6D4"/><stop offset=".6" stop-color="#8CC4AE"/><stop offset="1" stop-color="#3D6D5D"/></linearGradient>
<linearGradient id="ra-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE7AE"/><stop offset="1" stop-color="#D99A35"/></linearGradient>
<linearGradient id="ra-pour" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#D99A35"/><stop offset=".45" stop-color="#FFE7AE"/><stop offset="1" stop-color="#F2C46B"/></linearGradient>
<linearGradient id="ra-flame" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#FF6B45"/><stop offset=".55" stop-color="#FFAE5C"/><stop offset="1" stop-color="#FFE3A0" stop-opacity=".85"/></linearGradient>
<radialGradient id="ra-halo"><stop offset="0" stop-color="#F4F1EA" stop-opacity=".42"/><stop offset="1" stop-color="#F4F1EA" stop-opacity="0"/></radialGradient>
<filter id="ra-glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="ra-in"><path d="${VASE}"/></clipPath>
<linearGradient id="ra-hill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8FD3B6" stop-opacity=".09"/><stop offset="1" stop-color="#8FD3B6" stop-opacity="0"/></linearGradient>
</defs>
<path d="M0,214 C40,176 78,150 118,170 C150,186 170,160 204,150 C240,140 268,170 300,160 C326,152 344,166 360,172 L360,250 L0,250 Z" fill="url(#ra-hill)"/>
<path d="M0,232 C50,206 96,196 140,212 C176,224 214,200 252,206 C292,212 330,200 360,210 L360,250 L0,250 Z" fill="url(#ra-hill)"/>
<path d="M${24},34 A${ARC.r},${ARC.r} 0 0 1 ${336},34" fill="none" stroke="#F4F1EA" stroke-opacity=".2" stroke-width="1" stroke-dasharray="2 6"/>
${marks}
<g class="ra-moon" data-at="3"><circle cx="180" cy="12" r="17" fill="url(#ra-halo)"/><circle cx="180" cy="12" r="7.5" fill="#F4F1EA"/><circle cx="183.5" cy="10" r="6" fill="#DCD8CC" fill-opacity=".55"/></g>
<path d="M8,238 C80,233 150,241 222,236 C276,233 318,239 352,236" fill="none" stroke="#5B7D70" stroke-width="2.2" stroke-linecap="round"/>
<path d="M30,242 C110,240 190,244 330,241" fill="none" stroke="#5B7D70" stroke-opacity=".45" stroke-width="1" stroke-linecap="round"/>
<g fill="#24352F" stroke="#4E6E62" stroke-width="1"><rect x="68" y="150" width="56" height="6" rx="3"/><rect x="92.5" y="156" width="7" height="76"/><rect x="76" y="231" width="40" height="7" rx="3.5"/></g>
<g transform="translate(30,36.15) scale(1.15)"><g class="ra-tilt" data-at="0"><path d="${VASE}" fill="url(#ra-glaze)" stroke="#264A3F" stroke-width=".9"/>${INLAY}<ellipse cx="36" cy="1.6" rx="6.5" ry="2" fill="#D4EEE2"/></g></g>
<path class="ra-pour" data-at="1" d="M147,46 C186,28 253,34 289,86" pathLength="100" fill="none" stroke="url(#ra-pour)" stroke-width="7" stroke-linecap="round" filter="url(#ra-glow)"/>
<path d="M258,238 L258,214 C258,200 322,200 322,214 L322,238 Z" fill="#1A2722" stroke="#4E6E62" stroke-width="1"/>
<path d="M270,238 L270,220 C270,210 310,210 310,220 L310,238 Z" fill="#0A100E"/>
<g transform="translate(270,198)"><path class="ra-fire" data-at="4" d="M20,40 C8,35 5,23 11,14 C12,22 16,25 18,21 C16,12 20,6 26,0 C26,10 35,16 33,27 C32,33 27,38 20,40 Z" fill="url(#ra-flame)"/></g>
<g transform="translate(248.6,89.15) scale(1.15)"><path d="${VASE}" fill="url(#ra-glaze2)" stroke="#264A3F" stroke-width=".9"/><g clip-path="url(#ra-in)"><rect class="ra-fill" data-at="2" x="0" y="0" width="72" height="99" fill="url(#ra-gold)" fill-opacity=".88"/></g>${INLAY}<ellipse cx="36" cy="1.6" rx="6.5" ry="2" fill="#E2F4EB"/></g>
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
  return h('div', {class: 'ra-lab'},
    h('div', {class: 'ra-col ra-ca'}, h('p', {class: 'ra-n' + longCls(p.from.label)}, p.from.label), h('p', {class: 'ra-m'}, ...amt(a.amount, u)), r.flows ? seal('판 쪽', w.sell?.actor, 5) : cold()),
    h('div', {class: 'ra-col ra-cb'}, h('p', {class: 'ra-n' + longCls(p.to.label)}, p.to.label), h('p', {class: 'ra-m'}, ...amt(b.amount, u)),
      h('p', {class: 'ra-fomo'}, h('span', {class: 'ra-fk'}, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(r.fomo.to)}, score(r.fomo.to)), ' ', h('span', {class: 'ra-fw'}, r.fomo.toWord ?? '없음')),
      r.flows ? seal('산 쪽', w.buy?.actor, 6) : null));
}
/** 걸음 일곱(한 번에 하나) — c = 기승전결 차례 · at = 움직이는 그림 · ms = 머무는 시간 */
const ART_STEPS = [{c: 0, at: 0, ms: 1050}, {c: 0, at: 1, ms: 1500}, {c: 0, at: 2, ms: 1350}, {c: 1, at: 3, ms: 2000}, {c: 2, at: 4, ms: 1600}, {c: 3, at: 5, ms: 750}, {c: 3, at: 6, ms: 1400}];
const ART_STEPS6 = [...ART_STEPS.slice(0, 5), {c: 3, at: 5, ms: 1400}]; // 순매매 자료가 없는 판 — 결 낙관 하나
/** 소리 — 차례마다 한 덩이(그 말로 읽음) */
function sayOf(r) {
  const p = r.pair, w = whoMoved(r);
  return [['빠지는 곳', p.from.label, '들어가는 곳', p.to.label], [`${korDate(p.start)}부터`, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`],
    ['포모값', score(r.fomo.to), r.fomo.toWord ?? '없음'], r.flows ? ['판 쪽', w.sell?.actor ?? '없음', '산 쪽', w.buy?.actor ?? '없음'] : ['빠지는 곳', p.from.label, '포모값', score(r.fomo.from), r.fomo.fromWord ?? '없음']];
}
/** 그림 한 장 — art.js 틀(한 번에 하나 · 차례 점 넷 · 다시 보기 · 소리로 듣기 · 화면 밖이면 멈춤 · 움직임 줄이기면 끝 모습) */
const artPlayer = r => artStage({key: 'rot', svg: artSvg(r), labels: labelsOf(r), steps: r.flows ? ART_STEPS : ART_STEPS6, says: sayOf(r),
  setup: art => art.querySelector('.ra-fire')?.style.setProperty('--f', String(finite(r.fomo.to) ? Math.max(0.08, r.fomo.to / 100).toFixed(3) : '0.08'))}); // 불 높이 = 포모값 ÷ 100(CSSOM · 글 속 style 속성 없음)

/** 맨 위 무대 — 제목 · 기간(달 위) · 그림 한 장 · 이름 · 숫자 · 낙관 · 차례 점 · 단추 둘 · 아래에 빠지는 곳 셋 · 들어가는 곳 셋 · 셈 방법(접힘) */
export function rotationBox(r) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  const u = unitOf(r), li = x => h('li', {class: 'rt-li'}, h('span', {class: 'rt-l'}, x.label), h('span', {class: 'rt-v'}, ...amt(x.amount, u)), h('span', {class: 'rt-f'}, h('span', null, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(x.fomo)}, score(x.fomo))));
  return h('section', {class: 'sy rt', 'aria-label': '돈의 이동', 'data-from': p.from.id, 'data-to': p.to.id, 'data-place': r.place ?? 'kr',
    'data-check': JSON.stringify({from: p.from.id, to: p.to.id, start: p.start, days: p.days, outAmt: r.out[0].amount, inAmt: r.in[0].amount, fomo: r.fomo.to})}, // 빠짐없이 도는 검사기가 /story.json 과 맞댐(규칙 34)
    h('p', {class: 'sy-k'}, h('span', null, '돈의 이동'), h('span', {class: 'sy-kw'}, `지난 ${r.window.days}거래일 · ${korDate(r.asOf)} 종가까지`)),
    h('p', {class: 'ra-t'}, h('span', {class: 'ra-ts'}, `${korDate(p.start)}부터`), ' ', h('b', {class: 'ra-td'}, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`)),
    artPlayer(r),
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
