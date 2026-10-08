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
import {actor} from './cast.js'; // 배우 둘(신사 · 숙녀 — 2026-10-08 10:34 마카오 시각 「사람으로」)
import {ON} from './i18n.js'; // 한국어 화면이 아니면 true(2위 · 3위 줄 자리)

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

/* ── 그림 한 장 — 돈의 이동(2026-10-08 10:27 마카오 시각 사장님 「돈에 이동을 이렇게 표현하냐 · 아까 청자가 백배 나아 · 청자보다 더 잘 표현 해야지」
     · 10:34 「로미오 줄리엣 그거 빼 · 신사 숙녀다운 애들로 · 사람으로」 · 06:46 「1차 파장만 있다 5차 파장까지」)
   앞 판(청자 매병 둘 · 00:12)의 힘(병이 기울어 금빛을 쏟고 → 다른 병에 금빛이 차오름)을 그대로 살리고 더함:
   · 기: 빠지는 곳의 큰 병(보라)이 받침 위에서 기울고 → 금빛 물줄기가 물결 다섯(돈의 파장 1차~5차 · 물결 높이 = 그 파장에 들어간 돈)을 넘어 → 들어가는 곳의 큰 병(분홍)에 금빛이 차오름
   · 승: 금화 하나가 물결 다섯을 차례로 넘어(꼭짓점 · 골) 들어가는 병 입으로 — 1차부터 지금까지 돈이 옮겨 온 길
   · 전: 들어가는 병 밑 가마 불(높이 = 포모값 ÷ 100)
   · 결: 낙관(판 쪽 · 산 쪽 — 순매매가 없는 판은 빠지는 곳 포모값)
   · 배우 둘(움직이지 않음 · 표정만): 빠지는 병 옆 신사(깜짝 — 돈이 나감) · 들어가는 병 옆 숙녀(활짝 — 돈이 들어옴)
   · 물결 위 점 = 몇 차(아래 칩 「1차 … 5차」와 같은 차례) · 그림에는 글자가 없다(이름 · 숫자는 아래 HTML) · 한 번에 하나
   · 12:43 「돈에 흐름이 지금 어디로 가는가 1등부터 3등까지」: 들어가는 병을 셋으로 — 시상대(가운데 1위 · 왼쪽 2위 · 오른쪽 3위) · 물줄기는 1위 병으로,
     1위 병 입 바로 위에서 갈래 둘이 2위 · 3위 병으로 · 세 병에 금빛이 함께 차오름(움직이는 것 하나 — 세 병을 한 무리로) · 메달 금 · 은 · 동 · 1위 칸 아치 안 가마 불 = 포모값 */
const RVASE = 'M29.7,0 L42.3,0 L41.4,7.2 C63,10.8 72,23.4 68.4,36 C64.8,55.8 55.8,77.4 52.2,90 L56.7,99 L15.3,99 L19.8,90 C16.2,77.4 7.2,55.8 3.6,36 C0,23.4 9,10.8 30.6,7.2 Z'; // 매병(폭 72 · 높이 99 · 입 가운데 36,0) — art.js VASE 와 같은 모양
const RINLAY = '<circle cx="36" cy="34" r="10" fill="none" stroke="#FFF8E7" stroke-opacity=".55" stroke-width="1.1"/><path d="M30,35 c2,-4 7,-5 9,-1 c1,3 -2,5 -4,3" fill="none" stroke="#FFF8E7" stroke-opacity=".65" stroke-width="1.1" stroke-linecap="round"/>'
  + '<path d="M17,60 c5,-5 11,-4 13,1 M42,66 c4,-4 10,-3 11,2 M24,78 c3,-3 8,-2 9,1" fill="none" stroke="#FFF8E7" stroke-opacity=".42" stroke-width="1" stroke-linecap="round"/>'
  + '<path d="M19.8,90 L52.2,90" stroke="#F2C46B" stroke-opacity=".8" stroke-width="1.4"/>'; // 상감 구름 · 둥근 창 · 금 띠
const P = (x, y) => ({x, y}), f1 = v => (Math.round(v * 10) / 10).toFixed(1);
/** 물결 다섯을 지나는 금빛 물줄기 — 쏟아진 금빛이 그리는 활(병 입 → 위로 솟았다가 → 들어가는 병 입) 위에 잔물결 다섯(꼭짓점 T · 골 V) · 꼭짓점 높이 = 그 파장에 들어간 돈 */
function riverOf(ws, S, E) {
  const n = ws.length, C = P(214, 12), bz = t => P((1 - t) ** 2 * S.x + 2 * (1 - t) * t * C.x + t * t * E.x, (1 - t) ** 2 * S.y + 2 * (1 - t) * t * C.y + t * t * E.y);
  const amts = ws.map(w => (finite(w.amount) ? Math.abs(w.amount) : 0)), mx = Math.max(...amts, 1e-9);
  const ts = ws.map((_, i) => (n > 1 ? 0.14 + i * (0.66 / (n - 1)) : 0.47));
  const tops = ts.map((t, i) => { const b = bz(t); return P(b.x, b.y - (4 + 9 * amts[i] / mx)); });
  const vals = ts.slice(0, -1).map((t, i) => { const b = bz((t + ts[i + 1]) / 2); return P(b.x, b.y + 1.5); });
  const pts = [S]; tops.forEach((t, i) => { pts.push(t); if (vals[i]) pts.push(vals[i]); });
  let d = `M${f1(S.x)},${f1(S.y)}`;
  for (let k = 1; k < pts.length; k++) { const a = pts[k - 1], b = pts[k], h = (b.x - a.x) / 2; d += ` C${f1(a.x + h)},${f1(a.y)} ${f1(b.x - h)},${f1(b.y)} ${f1(b.x)},${f1(b.y)}`; }
  const T = tops.at(-1), c1 = P(T.x + 9, T.y), c2 = P(E.x, E.y - 18); d += ` C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(E.x)},${f1(E.y)}`;
  return {d, tops, pts, fork: cubicAt(T, c1, c2, E, 0.55)}; // fork = 마지막 내리막 위 한 점 — 2위 · 3위로 가는 갈래가 여기서 나뉨
}
const cubicAt = (a, b, c, e, u) => { const v = 1 - u, k0 = v * v * v, k1 = 3 * v * v * u, k2 = 3 * v * u * u, k3 = u * u * u; return P(k0 * a.x + k1 * b.x + k2 * c.x + k3 * e.x, k0 * a.y + k1 * b.y + k2 * c.y + k3 * e.y); };
/** 시상대 — 들어가는 곳 1위 · 2위 · 3위(2026-10-08 12:43 마카오 시각 사장님 「돈에 흐름이 지금 어디로 가는가 1등부터 3등까지 나타내어야 한다」)
   가운데 가장 높은 칸 = 1위 · 왼쪽 = 2위 · 오른쪽 = 3위(올림픽 시상대 차례) · 칸 위 병 하나(크기 = 차례 · 금빛 높이 = 그곳에 들어간 돈 ÷ 1위에 들어간 돈)
   · 칸 앞 메달(금 · 은 · 동 — 안의 점 1개 · 2개 · 3개 = 몇 위 · 그림에 글자 없음) · 1위 칸은 가마(아치 안 불 = 포모값) */
const POD = [{x: 248, w: 62, h: 50, s: 0.78}, {x: 192, w: 56, h: 30, s: 0.6}, {x: 310, w: 44, h: 16, s: 0.5}];
const MEDAL = [['#F2C46B', '#7A4E0E', 6.5], ['#D5DAE3', '#3E4554', 6], ['#D08A52', '#4E2A10', 5]];
/** 빠지는 곳 2위 · 3위(12:59 「돈이 빠지는 곳도 3곳 · 가장 많이 나간 순」) — 큰 받침(1위 · 기우는 큰 병) 왼쪽 낮은 받침 둘 · 병이 작을수록 덜 나감 · 15도 기운 채(움직이지 않음 — 한 번에 하나) · 입에서 금빛 방울 둘 */
const OUT2 = [{cx: 34, w: 26, h: 30, s: 0.42}, {cx: 13, w: 22, h: 16, s: 0.34}];
const medalAt = (x, y, i) => { const [mc, mi, mr] = MEDAL[i]; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${mr}" fill="${mc}" stroke="#1E1840" stroke-width="1"/>` + Array.from({length: i + 1}, (_, k) => `<circle cx="${f1(x - i * 1.4 + k * 2.8)}" cy="${f1(y)}" r="1" fill="${mi}"/>`).join(''); }; // 메달 안 점 = 몇 위
function artSvg(r) {
  const p = 'rt', H = 228, fy = H - 14, ws = r.waves?.length ? r.waves : [{n: 1, to: r.pair.to, amount: r.in?.[0]?.amount}];
  const ins = (r.in ?? []).slice(0, 3), a1 = Math.max(Math.abs(ins[0]?.amount ?? 0), 1e-9);
  const pods = ins.map((x, i) => { const q = POD[i], cx = q.x + q.w / 2, bot = fy - q.h, top = bot - 99 * q.s; return {...q, cx, bot, top, k: Math.min(0.72, Math.max(0.1, 0.72 * Math.abs(x.amount ?? 0) / a1)), mouth: P(cx, top), at: `translate(${f1(cx - 36 * q.s)},${f1(top)}) scale(${q.s})`}; });
  const S = P(144, 50), E = pods[0]?.mouth ?? P(279, 86.8); // 기운 병의 입(받침 위 병 38도 — 축 96.7,139) · 1위 병의 입
  const {d, tops, pts, fork} = riverOf(ws, S, E);
  const pips = tops.map((t, i) => Array.from({length: i + 1}, (_, k) => `<circle cx="${f1(t.x - i * 2.6 + k * 5.2)}" cy="${f1(t.y - 8)}" r="1.9" fill="#FFE7A3" fill-opacity="${i === tops.length - 1 ? 1 : 0.8}"/>`).join('')).join(''); // 물결 위 점 = 몇 차
  const rp = [...pts]; while (rp.length < 10) rp.push(tops.at(-1)); // 물결이 다섯보다 적은 판도 꼭짓점 열 자리(CSS 변수)를 다 채움
  const ride = rp.slice(0, 10).map((q, i) => `x${i}:${f1(q.x - E.x)}px;y${i}:${f1(q.y - 6 - (E.y - 4))}px`).join(';'); // 금화가 넘는 꼭짓점 · 골(끝 = 1위 병 입 위)
  const fo = finite(r.fomo.to) ? Math.max(0.12, Math.min(1, r.fomo.to / 100)) : 0.12;
  // 갈래 물줄기 — 1위 병 입 바로 위(fork)에서 2위 · 3위 병 입으로(선 하나에 갈래 둘 · 걸음 하나 · 물줄기보다 가늘게 = 덜 들어감)
  const br = pods.slice(1).map(q => { const m = q.mouth, dx = m.x < fork.x ? -22 : 26; return `M${f1(fork.x)},${f1(fork.y)} C${f1(fork.x + dx)},${f1(fork.y + 2)} ${f1(m.x)},${f1(m.y - (m.y - fork.y) * 0.5)} ${f1(m.x)},${f1(m.y)}`; }).join(' ') || `M${f1(fork.x)},${f1(fork.y)} L${f1(fork.x)},${f1(fork.y)}`;
  const c1 = pods[0]?.cx ?? 279, sc = (0.3 + 0.4 * fo).toFixed(2);
  const blocks = pods.map(q => `<rect x="${q.x}" y="${f1(q.bot)}" width="${q.w}" height="${q.h}" rx="2"/>`).join('');
  const medals = pods.map((q, i) => medalAt(q.cx, i === 0 ? q.bot + 9 : q.bot + q.h / 2, i)).join('');
  // 빠지는 곳 2위 · 3위 — 낮은 받침 · 15도 기운 작은 병(보라 · 빠지는 쪽 색) · 받침 앞 은 · 동 메달 · 큰 받침(1위) 기둥에 금 메달
  const outs = (r.out ?? []).slice(1, 3).map((x, j) => { const q = OUT2[j], bot = fy - q.h, left = q.cx - 36 * q.s, top = bot - 99 * q.s, pv = P(left + 56.7 * q.s, bot), c = Math.cos(Math.PI / 12), sn = Math.sin(Math.PI / 12), rx = -20.7 * q.s, ry = -99 * q.s;
    return {...q, bot, left, top, pv, mouth: P(pv.x + rx * c - ry * sn, pv.y + rx * sn + ry * c), i: j + 1}; });
  const outArt = outs.map(o => `<rect x="${f1(o.cx - o.w / 2)}" y="${f1(o.bot)}" width="${o.w}" height="${o.h}" rx="2" fill="#2A2156" stroke="#8E7BFF" stroke-opacity=".5" stroke-width="1"/>`
    + `<g transform="rotate(15 ${f1(o.pv.x)} ${f1(o.pv.y)})"><g transform="translate(${f1(o.left)},${f1(o.top)}) scale(${o.s})"><path d="${RVASE}" fill="url(#${p}-glz)" stroke="#2A1F5C" stroke-width="${f1(1 / o.s)}"/>${RINLAY}<ellipse cx="36" cy="1.6" rx="6.5" ry="2" fill="#F2C46B"/></g></g>`
    + `<circle cx="${f1(o.mouth.x + 3)}" cy="${f1(o.mouth.y + 6)}" r="1.5" fill="#FFE7A3" fill-opacity=".85"/><circle cx="${f1(o.mouth.x + 4.5)}" cy="${f1(o.mouth.y + 12)}" r="1.1" fill="#FFE7A3" fill-opacity=".6"/>`
    + medalAt(o.cx, o.bot + o.h / 2, o.i)).join('');
  const golds = pods.map(q => { const gh = 99 * q.s * q.k; return `<rect x="${f1(q.cx - 38 * q.s)}" y="${f1(q.bot - gh)}" width="${f1(76 * q.s)}" height="${f1(gh)}"/>`; }).join('');
  const gentFace = 'shock', ladyFace = 'joy';
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}${hills(p, H, 0.45)}
<defs><clipPath id="${p}-in3">${pods.map(q => `<path transform="${q.at}" d="${RVASE}"/>`).join('')}</clipPath><linearGradient id="${p}-pour" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#D99A35"/><stop offset=".45" stop-color="#FFE7AE"/><stop offset="1" stop-color="#F2C46B"/></linearGradient>
<linearGradient id="${p}-fl" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#FF6B45"/><stop offset=".55" stop-color="#FFAE5C"/><stop offset="1" stop-color="#FFE3A0" stop-opacity=".85"/></linearGradient></defs>
<path d="${d}" fill="none" stroke="#FFE7A3" stroke-opacity=".22" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"/>${pips}
<g fill="#2A2156" stroke="#8E7BFF" stroke-opacity=".5" stroke-width="1"><rect x="54" y="139" width="64" height="6" rx="3"/><rect x="82" y="145" width="8" height="${fy - 151}"/><rect x="66" y="${fy - 6}" width="40" height="6" rx="3"/></g>${(r.out ?? []).length ? medalAt(86, fy - 36, 0) : ''}${outArt}
<g class="ak-turn" data-at="0" data-v="ox:96.7px;oy:139px;a0:0deg;a1:38deg"><g transform="translate(40,40)"><path d="${RVASE}" fill="url(#${p}-glz)" stroke="#2A1F5C" stroke-width=".9"/>${RINLAY}<ellipse cx="36" cy="1.6" rx="6.5" ry="2" fill="#F2C46B"/></g></g>
<path class="ak-draw" data-at="1" pathLength="100" d="${d}" fill="none" stroke="url(#${p}-pour)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-glow)"/>
<path class="ak-draw" data-at="2" pathLength="100" d="${br}" fill="none" stroke="url(#${p}-pour)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-glow)"/>
<g fill="#2A2156" stroke="#8E7BFF" stroke-opacity=".5" stroke-width="1">${blocks}</g><path d="M${c1 - 16},${fy} L${c1 - 16},${fy - 22} C${c1 - 16},${fy - 31} ${c1 + 16},${fy - 31} ${c1 + 16},${fy - 22} L${c1 + 16},${fy} Z" fill="#100C24"/>
<g class="ak-pop" data-at="5"><ellipse cx="${c1}" cy="${fy - 2}" rx="${f1(9 + 6 * fo)}" ry="${f1(2 + 2 * fo)}" fill="#FF8A50" fill-opacity=".35"/><g transform="translate(${c1},${fy}) scale(${sc}) translate(${-c1},${-fy})"><path class="rt-flame" d="M${c1},${fy} C${c1 - 12},${fy - 5} ${c1 - 15},${fy - 17} ${c1 - 9},${fy - 26} C${c1 - 8},${fy - 18} ${c1 - 4},${fy - 15} ${c1 - 2},${fy - 19} C${c1 - 4},${fy - 28} ${c1},${fy - 34} ${c1 + 6},${fy - 40} C${c1 + 6},${fy - 30} ${c1 + 15},${fy - 24} ${c1 + 13},${fy - 13} C${c1 + 12},${fy - 7} ${c1 + 7},${fy - 2} ${c1},${fy} Z" fill="url(#${p}-fl)"/></g></g>
${medals}
${pods.map(q => `<path transform="${q.at}" d="${RVASE}" fill="url(#${p}-glz2)" stroke="#2A1F5C" stroke-width="${f1(1 / q.s)}"/>`).join('')}
<g clip-path="url(#${p}-in3)"><g class="ak-up" data-at="3" data-v="k:1" fill="url(#${p}-gold)" fill-opacity=".9">${golds}</g></g>
${pods.map(q => `<g transform="${q.at}">${RINLAY}<ellipse cx="36" cy="1.6" rx="6.5" ry="2" fill="#F2C46B"/></g>`).join('')}
<g class="ak-ride" data-at="4" data-v="${ride}"><circle cx="${f1(E.x)}" cy="${f1(E.y - 4)}" r="9" fill="url(#${p}-halo)"/><circle cx="${f1(E.x)}" cy="${f1(E.y - 4)}" r="5.6" fill="url(#${p}-gold)" stroke="#C8891E" stroke-width="1"/><circle cx="${f1(E.x)}" cy="${f1(E.y - 4)}" r="3.6" fill="none" stroke="#C8891E" stroke-width=".7"/></g>
${actor('gent', {x: 128, y: fy + 1, s: 0.54, face: gentFace, prop: ['cane'], P: p})}${actor('lady', {x: 170, y: fy + 1, s: 0.54, face: ladyFace, prop: ['fan'], P: p})}
</svg>`;
}
/** 긴 업종 이름(바깥 판 「다각적 산업용 제품 도매」 등)은 글씨를 줄여 한 화면에(규칙 30) */
export const longCls = t => (String(t).length > 12 ? ' ra-long2' : String(t).length > 6 ? ' ra-long' : '');
/** 이름 · 숫자 · 낙관 — 왼쪽(빠지는 곳) · 오른쪽(들어가는 곳 1위 · 포모값 · 2위 · 3위 — 12:43 「1등부터 3등까지」) */
function labelsOf(r) {
  const p = r.pair, a = r.out[0], b = r.in[0], w = whoMoved(r), u = unitOf(r);
  const seal = (tag, who, k) => h('p', {class: 'ra-seal', 'data-at': String(k)}, h('span', {class: 'ra-st'}, tag), ' ', h('span', {class: 'ra-sw'}, who ?? '없음'));
  // 순매매 자료가 없는 판 — 결 낙관 하나: 빠지는 곳 포모값(식은 쪽) · 들어가는 곳 포모값(불)과 견줌
  const cold = () => h('p', {class: 'ra-seal ra-seal-f', 'data-at': '6'}, h('span', {class: 'ra-st'}, '포모값'), ' ', h('span', {class: 'ra-sw'}, score(r.fomo.from)), ' ', h('span', {class: 'ra-sw'}, r.fomo.fromWord ?? '없음'));
  const ws = r.waves ?? [];
  // 돈의 파장 1~5차(06:46) — 지난 기록에서 돈이 차례로 가장 많이 들어간 업종 · 마지막이 지금 · 이름은 그 말로(73개 말 · 업종 이름 사전)
  // 자리: 지금 짝(빠지는 곳 → 들어가는 곳) 이름 · 숫자 다음(지나온 이야기 — 「지난 줄거리」) · 긴 말에서도 지금 짝이 첫 화면에(규칙 30)
  const rw = ws.length ? h('ol', {class: 'rw', 'aria-label': '돈의 파장'}, ...ws.map((x, i) => h('li', {class: 'rw-c' + (i === ws.length - 1 ? ' rw-now' : ''), 'data-n': String(x.n)}, h('b', {class: 'rw-k'}, `${x.n}차`), ' ', h('span', {class: 'rw-l'}, x.to.label)))) : null;
  // 메달 — 금 · 은 · 동 동그라미 안 숫자(그림 메달과 같은 색 · 숫자는 CSS 로 그림) · 화면 읽기 프로그램은 「1위」(aria-label · 사전 틀 {n}위 · 73개 말)
  const medal = i => [h('span', {class: 'ra-md ra-md' + (i + 1), role: 'img', 'aria-label': `${i + 1}위`, 'data-n': String(i + 1)})]; // 메달 숫자는 CSS(::before) — 글자로 넣으면 또렷함 검사가 「단위 없는 숫자」로 셈 · 화면 읽기는 aria-label 「1위」(숨긴 글 칸은 글씨 200% 에서 화면 밖으로 잡혀 뺌)
  const outs = (r.out ?? []).slice(0, 3), ins = (r.in ?? []).slice(0, 3);
  // 줄 맞춘 두 칸(왼쪽 = 빠지는 곳 · 가장 많이 나간 순 / 오른쪽 = 들어가는 곳 · 가장 많이 들어간 순 — 12:43 · 12:59 「1등부터 3등까지」)
  //   1위: 이름 크게 · 금액 크게 / 포모값(오른쪽 = 들어가는 1위 · 그림 1위 칸 가마 불) / 2위 · 3위: 메달 · 이름 · 금액 한 줄(좁으면 줄을 바꿈)
  const top1 = (side, x) => h('p', {class: `ra-n ra-rkr ra-${side}` + longCls(x.label), 'data-rank': '1'}, ...medal(0), h('span', {class: 'ra-nm'}, x.label));
  const row = (side, i, x) => (x ? h('p', {class: `ra-rk ra-${side}`, 'data-rank': String(i + 1), 'data-side': side === 'a' ? 'out' : 'in'}, ...medal(i), h('span', {class: 'ra-n2'}, x.label), ' ', h('span', {class: 'ra-m2'}, ...amt(x.amount, u))) : h('span', {class: `ra-gap ra-${side}`}));
  const main = h('div', {class: 'ra-lab ra-lab-rot ra-lab-rk'},
    top1('a', p.from), top1('b', p.to),
    h('p', {class: 'ra-m ra-a'}, ...amt(a.amount, u)), h('p', {class: 'ra-m ra-b'}, ...amt(b.amount, u)),
    h('span', {class: 'ra-gap ra-a'}), h('p', {class: 'ra-fomo ra-b'}, h('span', {class: 'ra-fk'}, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(r.fomo.to)}, score(r.fomo.to)), ' ', h('span', {class: 'ra-fw'}, r.fomo.toWord ?? '없음')),
  );
  // 2위 · 3위 두 줄 — 한국어 화면은 첫 화면 이름 · 숫자(.ra-lab · 검사기가 아래 탭 위인지 잼) · 다른 말은 1위 짝 바로 아래(긴 말 — 줄루어 · 아르메니아어 등은 여섯 이름이 한 화면에 다 들어가지 않음 · 1위 짝과 포모값이 첫 화면)
  const rows23 = h('div', {class: (ON ? '' : 'ra-lab ') + 'ra-lab-rk ra-lab-23'}, row('a', 1, outs[1]), row('b', 1, ins[1]), row('a', 2, outs[2]), row('b', 2, ins[2]));
  // 결 낙관(판 쪽 · 산 쪽 = 누가 팔고 샀나)은 두 칸(어디서 어디로 · 얼마 · 포모값) 다음 한 줄 — 긴 말에서 오른쪽 칸만 길어져 첫 화면을 넘던 것(2026-10-08 말 73개 가장 긴 글 검사)
  const seals = h('div', {class: 'ra-srow ra-srow2'}, r.flows ? [seal('판 쪽', w.sell?.actor, 6), seal('산 쪽', w.buy?.actor, 7)] : cold());
  return h('div', {class: 'ra-fwrap ra-rotwrap'}, main, rows23, seals, rw);
}
/** 걸음 여덟(한 번에 하나) — c = 기승전결 차례 · at = 움직이는 그림 · ms = 머무는 시간 */
const ART_STEPS = [{c: 0, at: 0, ms: 950}, {c: 0, at: 1, ms: 1300}, {c: 0, at: 2, ms: 1000}, {c: 0, at: 3, ms: 1150}, {c: 1, at: 4, ms: 2700}, {c: 2, at: 5, ms: 1200}, {c: 3, at: 6, ms: 750}, {c: 3, at: 7, ms: 1400}]; // 기울기 → 물줄기(물결 다섯 · 1위로) → 갈래(2위 · 3위로) → 세 병에 차오름 → 금화가 물결 다섯을 넘음 → 가마 불(포모) → 낙관 둘
const ART_STEPS6 = [...ART_STEPS.slice(0, 6), {c: 3, at: 6, ms: 1400}]; // 순매매 자료가 없는 판 — 결 낙관 하나
/** 소리 — 차례마다 한 덩이(그 말로 읽음) */
function sayOf(r) {
  const p = r.pair, w = whoMoved(r);
  const rk = xs => (xs ?? []).slice(0, 3).flatMap((x, i) => [`${i + 1}위`, x.label]);
  return [['빠지는 곳', ...rk(r.out), '들어가는 곳', ...rk(r.in)], ['돈의 파장', ...(r.waves ?? []).map(x => `${x.n}차 ${x.to.label}`), `${korDate(p.start)}부터`, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`],
    ['포모값', score(r.fomo.to), r.fomo.toWord ?? '없음'], r.flows ? ['판 쪽', w.sell?.actor ?? '없음', '산 쪽', w.buy?.actor ?? '없음'] : ['빠지는 곳', p.from.label, '포모값', score(r.fomo.from), r.fomo.fromWord ?? '없음']];
}
/** 그림 한 장 — art.js 틀(한 번에 하나 · 차례 점 넷 · 다시 보기 · 소리로 듣기 · 화면 밖이면 멈춤 · 움직임 줄이기면 끝 모습) */
const artPlayer = r => artStage({key: 'rot', svg: artSvg(r), labels: labelsOf(r), steps: r.flows ? ART_STEPS : ART_STEPS6, says: sayOf(r)}); // 자막 띠 뺌(2026-10-08 10:34 마카오 시각)

/** 맨 위 무대 — 제목 · 기간(달 위) · 그림 한 장 · 이름 · 숫자 · 낙관 · 차례 점 · 단추 둘 · 아래에 빠지는 곳 셋 · 들어가는 곳 셋 · 셈 방법(접힘) */
export function rotationBox(r) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  const u = unitOf(r), li = x => h('li', {class: 'rt-li'}, h('span', {class: 'rt-l'}, x.label), h('span', {class: 'rt-v'}, ...amt(x.amount, u)), h('span', {class: 'rt-f'}, h('span', null, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(x.fomo)}, score(x.fomo))));
  return h('section', {class: 'sy rt', 'aria-label': '돈의 이동', 'data-from': p.from.id, 'data-to': p.to.id, 'data-place': r.place ?? 'kr',
    'data-check': JSON.stringify({from: p.from.id, to: p.to.id, start: p.start, days: p.days, outAmt: r.out[0].amount, inAmt: r.in[0].amount, outs: (r.out ?? []).slice(0, 3).map(x => [x.id, x.amount]), ins: (r.in ?? []).slice(0, 3).map(x => [x.id, x.amount]), fomo: r.fomo.to, waves: (r.waves ?? []).map(x => [x.n, x.to.id, x.start, x.end])})}, // 빠짐없이 도는 검사기가 /story.json 과 맞댐(규칙 34 · 파장은 scripts/atlas11/verify/waves_verify.py 가 따로 셈)
    h('p', {class: 'sy-k'}, h('span', null, '돈의 이동'), h('span', {class: 'sy-kw'}, `지난 ${r.window.days}거래일 · ${korDate(r.asOf)} 종가까지`)),
    h('p', {class: 'ra-t'}, h('span', {class: 'ra-ts'}, `${korDate(p.start)}부터`), ' ', h('b', {class: 'ra-td'}, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`)), // 기간(자막 띠를 빼며 그림 위로 되돌림)
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
