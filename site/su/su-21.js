/* 수르 — 21곳 길(빈 파일에서 새로 씀 · 주문 2044 · 사장님 2026-11-04 15:44(+04) 「수르 전면 개편 명령서」)
   [한 문장] 「수르는 주식을 전혀 모르는 사람도 7번 눌러 지금 볼 21곳을 알게 하는 곳이다.」
   ① 21곳 한눈에 #/ → ② 땅 지도 #/m → ③ 업종 #/m/<땅> → ④ 회사 #/c/<번호>(su.js) → ⑤ 회사 자세히 #/c/<번호>/more(출목표 · 그래프 · 뉴스 · 수급)
   → ⑥ 「왜 사?」 #/q/<번호>(su-why.js) → ⑦ 매매일지 · 내 종목 점검 #/j → ⑧ 친구에게 #/f(카톡 · 커피 쿠폰 · 상품권 · 소개 영상 · 만수르 · 영어 · 진화)
   자료 /su/data/su21.json(scripts/atlas11/next/su21.py — 상장 2,557곳 → 우량주 365곳(n365-v1) → 불장 7 · 꽃이 될 7 · 돈이 몰리는 7 · 겹침) · 숫자는 자료 그대로 */
import {h, s} from '/su/su-fig.js';
import {NEED, val, num, ymd} from '/su/su-six.js';
import {NAME, josa} from '/next/brand.js';

export const D21 = '/su/data/su21.json';
export const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는'};
const KEY = ['hot', 'bloom', 'money'], BEAT = ['b1', 'b2', 'b3', 'b4'];
const fin = x => typeof x === 'number' && Number.isFinite(x);
const sgn = x => (fin(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + num(Math.abs(Math.round(x * 10) / 10)) : NEED);
const SRC = '네이버 증권 그날 마지막 값 · 수르가 셈';
const day = d => ymd(d) ?? NEED;

/** 21곳 자료 — 한 번만 받음 */
let CACHE = null;
export async function load21(get) { if (!CACHE) CACHE = await get(D21); return CACHE; }
export const D21M = '/su/data/su21-map.json'; // 땅 지도(365곳 모두)는 따로 받음 — 첫 화면이 가볍게
let MAP = null;
async function loadMap(get) { const [T, M] = await Promise.all([load21(get), MAP ?? get(D21M)]); MAP = M; return {...T, lands: M.lands ?? []}; }
export function find21(T, code) { for (const k of KEY) for (const c of T?.lists?.[k] ?? []) if (c.code === code) return c; return null; }

/** 까닭 한 줄(학생 말) — 왜 이 회사가 21곳에 들었나 */
export function why21(c, k, T) {
  const w = c.why ?? {};
  if (k === 'hot') return c.ind + ' 업종이 지난 20거래일 동안 365곳 업종 평균으로 ' + sgn(w.ind20) + ' 움직였어요. 그 가운데 ' + josa(c.name, '은') + ' ' + day(c.date) + '까지 20거래일 동안 ' + sgn(c.ch20) + ' 올라 불장 7곳에 들었어요.';
  if (k === 'bloom') return c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + ' 더 갔어요. ' + josa(c.name, '은') + ' 아직 「싹」이에요. ' + (w.full ? '꽃 조건을 모두 채웠어요.' : '꽃 조건을 다 채우지는 못한, 가장 가까운 곳이에요.');
  return c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + ' 더 갔어요. 그 업종 365곳 가운데 ' + c.name + '의 회사 크기가 20거래일 동안 ' + num(w.gain) + '억 원 늘어 가장 많았어요.';
}
const six21 = (c, k, T) => ({누가: c.name + ' · ' + c.ind + ' 업종', 언제: day(T?.asOf?.board) + ' 자료', 어디서: '우량주 365곳 안(' + (c.land ?? NEED) + ')', 무엇을: KIND[k] + ' 7곳에 들었어요', 어떻게: T?.rules?.[k] ?? null, 왜: why21(c, k, T)});

/* ── 그림 ── */
/** 깔때기 띠 — 상장 2,557 → 우량주 365 → 21 */
function funnel3(T) {
  const W = 390, n = [T.counts.listed, T.counts.b365, T.distinct], H = 150;
  const lab = ['상장 회사 ' + num(n[0]) + '곳', '우량주 ' + n[1] + '곳', '21곳 · 겹침 빼면 ' + n[2] + '곳'];
  const w = v => 40 + 310 * Math.sqrt(v / n[0]); // 넓이 = 회사 수의 제곱근(작은 수도 보이게)
  return s('svg', {class: 'su-svg su-f3', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '상장 ' + num(n[0]) + '곳 → 우량주 ' + n[1] + '곳 → 21곳(겹침 빼면 ' + n[2] + '곳)'},
    n.map((v, i) => { const ww = w(v), inside = ww >= 250; // 막대 안에 글이 안 들어가면 막대 오른쪽에(글이 잘리지 않게)
      return [s('rect', {x: 12, y: 8 + i * 46, width: ww, height: 36, rx: 18, class: ['g-basefill', 'g-ok', 'g-bad'][i] + ' ' + BEAT[i] + ' a-gx'}),
        s('text', {x: inside ? 12 + ww / 2 : 12 + ww + 10, y: 33 + i * 46, 'text-anchor': inside ? 'middle' : 'start', class: 'g-tl ' + (inside ? 'g-tw' : 'g-tland') + ' ' + BEAT[i] + ' a-up', text: lab[i]})]; }));
}
/** 21곳 한눈에 — 셋 줄 × 일곱 · 겹친 곳은 ✦ */
function grid21(T) {
  const col = k => h('ol', {class: 'su-21c su-21-' + k, 'aria-label': KIND[k] + ' 7곳'}, h('li', {class: 'su-21h', text: KIND[k]}),
    (T.lists[k] ?? []).map((c, i) => h('li', {class: 'su-21t' + (c.in.length > 1 ? ' su-21x' : '')},
      h('a', {href: '#/c/' + c.code, 'data-proper': ''}, c.in.length > 1 ? h('i', {'aria-label': '겹침', text: '✦'}) : null, h('span', {text: c.name})))));
  return h('div', {class: 'su-g su-21g'}, KEY.map(col));
}
/** 땅 지도 — 열 땅 · 칸 크기 = 365곳 가운데 회사 수 · 별 = 21곳 */
function landMap(T) {
  const W = 390, cols = 2, cw = (W - 24 - 10) / cols, rows = Math.ceil(T.lands.length / cols), rh = 74, H = rows * (rh + 8) + 8;
  return s('svg', {class: 'su-svg su-land', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '땅 지도 · 열 땅 · 별은 21곳'},
    T.lands.map((L, i) => { const x = 12 + (i % cols) * (cw + 10), y = 8 + Math.floor(i / cols) * (rh + 8), cos = L.inds.flatMap(g => g.cos), star = cos.filter(c => c.in.length).length;
      return s('a', {href: '#/m/' + L.id}, s('rect', {x, y, width: cw, height: rh, rx: 16, class: (star ? 'g-landon' : 'g-land') + ' ' + BEAT[i % 4] + ' a-pop'}),
        s('text', {x: x + 12, y: y + 30, class: 'g-tl g-tland', text: L.name.length > 9 ? L.name.slice(0, 9) + '…' : L.name}),
        s('text', {x: x + 12, y: y + 58, class: 'g-tl g-tsub', text: cos.length + '곳' + (star ? ' · ✦ ' + star : '')})); }));
}
/** 업종 막대 — 이 땅의 업종 · 20거래일 365곳 평균 */
function indBars(L) {
  const W = 390, rh = 60, H = L.inds.length * rh + 10, max = Math.max(1, ...L.inds.map(g => Math.abs(g.ch20 ?? 0))), mid = 200, span = 125; // 이름은 막대 위 줄에 — 막대와 겹치지 않게
  return s('svg', {class: 'su-svg su-ib', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': L.name + ' 업종 · 20거래일 오른 만큼'},
    s('line', {x1: mid, y1: 4, x2: mid, y2: H - 4, class: 'g-axis'}),
    L.inds.map((g, i) => { const v = g.ch20 ?? 0, w = span * Math.abs(v) / max, y = 6 + i * rh;
      return [s('text', {x: 12, y: y + 20, class: 'g-tl g-tsub', text: g.name.length > 15 ? g.name.slice(0, 15) + '…' : g.name}),
        s('rect', {x: v >= 0 ? mid : mid - w, y: y + 28, width: Math.max(2, w), height: 24, rx: 8, class: (v >= 0 ? 'g-ok' : 'g-bad') + ' ' + BEAT[i % 4] + ' a-gx'}),
        s('text', {x: v >= 0 ? mid + w + 6 : mid - w - 6, y: y + 47, 'text-anchor': v >= 0 ? 'start' : 'end', class: 'g-tl g-tsub', text: sgn(g.ch20)})]; }));
}
/** 출목표 — 날마다 오른 날 ● · 내린 날 ○ · 같은 쪽이 이어지면 아래로(바카라 판 모양) */
function road(c) {
  const l = c?.c ?? [], d = l.slice(1).map((v, i) => (v > l[i] ? 1 : v < l[i] ? -1 : 0)), cols = [];
  for (const x of d) { const lc = cols[cols.length - 1]; if (lc && lc.v === x && lc.n.length < 6) lc.n.push(x); else cols.push({v: x, n: [x]}); }
  const W = 390, cs = 30, H = 6 * cs + 20, x0 = (W - cols.length * cs) / 2;
  return s('svg', {class: 'su-svg su-road', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '출목표 · 오른 날 ' + d.filter(x => x > 0).length + ' · 내린 날 ' + d.filter(x => x < 0).length},
    cols.map((cl, i) => cl.n.map((x, j) => s('circle', {cx: x0 + i * cs + cs / 2, cy: 10 + j * cs + cs / 2, r: 11, class: (x > 0 ? 'g-up' : x < 0 ? 'g-dn' : 'g-eq') + ' ' + BEAT[Math.min(3, Math.floor(4 * i / Math.max(1, cols.length)))] + ' a-pop'}))));
}
/** 21일 줄 — 그날 마지막 값 */
function line21(c) {
  const l = (c?.c ?? []).filter(fin); if (l.length < 2) return null;
  const W = 390, H = 220, lo = Math.min(...l), hi = Math.max(...l), y = v => 20 + (H - 40) * (1 - (v - lo) / Math.max(1, hi - lo)), x = i => 20 + (W - 40) * i / (l.length - 1);
  return s('svg', {class: 'su-svg su-l21', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': c.name + ' 21거래일 그날 마지막 값'},
    s('polyline', {points: l.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), class: 'g-co b2 a-draw', pathLength: 1}),
    s('circle', {cx: x(l.length - 1), cy: y(l[l.length - 1]), r: 6, class: 'g-ok b4 a-pop'}));
}
/** 친구에게 — 꽃잎 여섯(카톡 · 가입 · 쿠폰 · 상품권 · 영상 · 만수르) */
/** 뜨거운 태양 — 1년 가장 낮은 값과 가장 높은 값 사이 어디쯤(pos52 · 0~1) · 가장 높은 값 가까이(0.95 넘게)면 해살 */
function sun52(c) {
  const p = c?.pos52; if (!fin(p)) return null;
  const W = 390, H = 150, x0 = 36, x1 = 354, x = x0 + (x1 - x0) * Math.max(0, Math.min(1, p)), y = 84, hot = p >= 0.95;
  return s('svg', {class: 'su-svg su-sun', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '1년 사이 값 자리 · 100칸 가운데 ' + Math.round(p * 100) + '번째'},
    s('line', {x1: x0, y1: y, x2: x1, y2: y, class: 'g-axis'}),
    s('rect', {x: x0, y: y - 8, width: Math.max(2, x - x0), height: 16, rx: 8, class: 'g-ok b1 a-gx'}),
    hot ? Array.from({length: 8}, (_, i) => s('line', {x1: x + 22 * Math.cos(i * Math.PI / 4), y1: y + 22 * Math.sin(i * Math.PI / 4), x2: x + 32 * Math.cos(i * Math.PI / 4), y2: y + 32 * Math.sin(i * Math.PI / 4), class: 'g-ray b3 a-up'})) : null,
    s('circle', {cx: x, cy: y, r: 16, class: (hot ? 'g-bad' : 'g-up') + ' b2 a-pop'}),
    s('text', {x: x0, y: 136, class: 'g-tl g-tsub', text: '1년 가장 낮은 값'}),
    s('text', {x: x1, y: 136, 'text-anchor': 'end', class: 'g-tl g-tsub', text: '가장 높은 값'}),
    s('text', {x: Math.min(Math.max(x, 120), 270), y: 40, 'text-anchor': 'middle', class: 'g-tl g-tland', text: hot ? '☀ 1년 가장 높은 값 가까이' : '100칸 가운데 ' + Math.round(p * 100) + '번째'}));
}
function petals6() {
  const W = 390, H = 440, cx = W / 2, cy = 220;
  return s('svg', {class: 'su-svg su-p6', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '친구에게 건네는 여섯 가지'},
    Array.from({length: 6}, (_, i) => s('g', {transform: `rotate(${i * 60} ${cx} ${cy})`}, s('ellipse', {cx, cy: cy - 106, rx: 48, ry: 102, class: 'o-pet ' + BEAT[i % 4] + ' a-pop'}))),
    ['카톡 보내기', '선물', '커피 쿠폰', '소개 영상', '내 종목', '진화'].map((t, i) => s('text', {x: cx + 150 * Math.sin(i * Math.PI / 3), y: cy - 150 * Math.cos(i * Math.PI / 3) + 8, 'text-anchor': 'middle', class: 'g-tl g-tland ' + BEAT[i % 4] + ' a-up', text: t})), // 꽃잎마다 친구에게 건네는 것
    s('circle', {cx, cy, r: 34, class: 'o-core b4 a-pop'}), s('text', {x: cx, y: cy + 8, 'text-anchor': 'middle', class: 'g-tl g-tw', text: '21곳'}));
}

/* ── 쪽 ── */
const ruleRows = T => [{k: '상장 회사', v: num(T.counts.listed) + '곳', how: (T.counts.listedWhat ?? '') + ' · /atlas/data/mkt.json · 자료 ' + day(T.asOf.mkt)},
  {k: '우량주', v: T.counts.b365 + '곳', how: T.rules.b365 + ' · 고른 갈래 ' + Object.entries(T.counts.kinds ?? {}).map(([k, v]) => k + ' ' + v).join(' · ')},
  {k: '불장 업종', v: T.counts.hotInds + '곳', how: T.rules.hot + ' · 후보 ' + T.counts.hotPool + '곳'},
  {k: '꽃이 될 후보', v: T.counts.bloomPool + '곳', how: T.rules.bloom + ' · 꽃 조건을 모두 채운 곳 ' + T.counts.bloomFull + '곳'},
  {k: '돈이 몰리는', v: (T.lists.money ?? []).length + '곳', how: T.rules.money},
  {k: '겹침', v: T.overlap.length + '곳', how: T.overlap.map(o => o.name + '(' + o.in.map(k => KIND[k]).join(' · ') + ')').join(' · ') || '없음'},
  {k: '값이 늦은 회사', v: T.counts.late + '곳', how: '불장 셈에서 뺌'}];

export async function v21Home(X) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const big = val(21, '곳', '지금 볼 곳 · 불장 7 · 꽃이 될 7 · 돈이 몰리는 7', {누가: NAME, 언제: day(T.asOf.board) + ' 자료', 어디서: '우량주 365곳 안', 무엇을: '불장 · 꽃이 될 · 돈이 몰리는 회사를 7곳씩 찾았어요', 어떻게: '세 가지 셈을 365곳에 똑같이 대어 봤어요', 왜: '주식을 몰라도 지금 볼 곳을 한눈에 알게 하려고요'},
    {mean: '세 목록을 합치면 21곳이고, 두 목록에 함께 든 ' + T.overlap.length + '곳을 한 번씩만 세면 ' + T.distinct + '곳이라는 뜻이에요.'});
  const mids = [
    val(T.counts.listed, '곳', '한국 상장 회사', {누가: '코스피 · 코스닥', 언제: day(T.asOf.mkt), 어디서: '한국 주식 시장', 무엇을: T.counts.listedWhat, 어떻게: '그날 값이 있는 보통주를 셌어요', 왜: '모두에서 시작해야 빠진 곳이 없어요'}, {mean: '한국에서 주식을 사고팔 수 있는 회사가 이만큼이라는 뜻이에요. 펀드와 우선주는 빼고 셌어요.'}),
    val(T.counts.b365, '곳', '우량주', {누가: '상장 회사 가운데 튼튼한 곳', 언제: '2026년 10월 5일에 정함', 어디서: '73개 업종 · 업종마다 5곳', 무엇을: '우량주를 골랐어요', 어떻게: T.rules.b365, 왜: '튼튼한 회사 안에서만 찾으려고요'}, {mean: '이익을 꾸준히 내는 큰 회사 ' + T.counts.b365 + '곳 안에서만 21곳을 찾는다는 뜻이에요.'}),
    val(T.overlap.length, '곳', '두 목록에 함께 든 곳', {누가: T.overlap.map(o => o.name).join(' · ') || null, 언제: day(T.asOf.board), 어디서: '21곳 안', 무엇을: '불장과 돈이 몰리는 목록에 함께 들었어요', 어떻게: '두 목록에서 같은 회사 번호를 찾았어요', 왜: '겹친 곳은 두 셈이 같은 곳을 가리킨다는 뜻이에요'}, {mean: '겹친 곳은 ✦ 로 보여요. 두 셈이 함께 가리킨 곳이라는 뜻이에요.'})];
  const rows = KEY.flatMap(k => (T.lists[k] ?? []).map(c => ({...val(c.ch20, '', KIND[k] + ' · ' + c.name, six21(c, k, T), {mean: why21(c, k, T)}), href: '#/c/' + c.code})));
  const first = T.lists.hot?.[0] ?? T.lists.money?.[0];
  X.setFirst?.(first?.code);
  return {title: '21곳', tab: 0, step: 1, kick: day(T.asOf.board) + ' · 우량주 365곳 안', h1: '지금 볼 21곳', big,
    hero: X.fig('21', [funnel3(T), grid21(T)], {label: '상장 회사 → 우량주 → 21곳', hero: true, cap: ['한국 상장 회사 ' + num(T.counts.listed) + '곳을 셌어요.', '그 가운데 우량주 ' + T.counts.b365 + '곳을 먼저 골랐어요.', '그런데 셋에 함께 든 곳이 ' + T.overlap.length + '곳 있어요(✦).', '그래서 지금 볼 곳은 21곳, 겹침을 빼면 ' + T.distinct + '곳이에요.']}),
    mids, pro: [...ruleRows(T), ...KEY.flatMap(k => (T.lists[k] ?? []).map(c => ({k: KIND[k] + ' · ' + c.name, v: sgn(c.ch20), how: why21(c, k, T) + ' · ' + Object.entries(six21(c, k, T)).map(([a, b]) => a + ' ' + (b ?? NEED)).join(' · ')})))], after: [X.essBox(S)], // 21곳 하나씩은 서랍에(첫 화면은 그림 — 주문 2044 [5] 7 · 8)
    next: {href: '#/m', label: '21곳은 어느 땅에 있나?', step: 2, k: '2 / 8'}, asOf: T.asOf.board, S, note: '21곳은 ' + day(T.asOf.board) + ' 자료로 고른 곳이에요. 앞날을 맞히는 목록이 아니에요.'};
}
export async function vLand(X) {
  const [{S}, T] = await Promise.all([X.base(), loadMap(X.get)]);
  const big = val(T.lands.length, '땅', '우량주 365곳을 열 땅으로', {누가: '우량주 365곳', 언제: day(T.asOf.board), 어디서: '73개 업종 → 열 땅', 무엇을: '하는 일이 비슷한 업종을 땅으로 묶었어요', 어떻게: '땅 → 업종 → 회사 세 번 누르면 회사에 닿아요', 왜: '어디서 21곳이 나왔는지 지도로 보려고요'}, {mean: '365곳이 열 갈래 땅에 나뉘어 있다는 뜻이에요. 별 ✦ 이 있는 땅에 21곳이 있어요.'});
  const L0 = T.lists.hot?.[0]?.landId ?? T.lands[0].id;
  return {title: '땅 지도', tab: 1, step: 2, kick: '우량주 365곳 지도', h1: '땅 지도', big,
    hero: X.fig('land', [landMap(T)], {label: '땅 지도', hero: true, cap: ['우량주 365곳을 열 땅에 나눴어요.', '칸마다 회사 수와 21곳(✦) 수를 적었어요.', '그런데 21곳이 모든 땅에 고르게 있지는 않아요.', '그래서 ✦ 가 많은 땅부터 들어가 봐요.']}),
    mids: [], pro: T.lands.map(L => ({k: L.name, v: L.inds.reduce((a, g) => a + g.cos.length, 0) + '곳', how: L.inds.map(g => g.name).join(' · ')})),
    next: {href: '#/m/' + L0, label: (T.lands.find(L => L.id === L0)?.name ?? '') + ' 땅에는?', step: 3, k: '3 / 8'}, asOf: T.asOf.board, S};
}
export async function vLandOne(X, id) {
  const [{S}, T] = await Promise.all([X.base(), loadMap(X.get)]);
  const L = T.lands.find(x => x.id === id); if (!L) return X.notFound('이 땅을 찾지 못했어요.');
  const cos = L.inds.flatMap(g => g.cos), star = cos.filter(c => c.in.length);
  const big = val(cos.length, '곳', L.name + ' 땅의 우량주', {누가: L.name, 언제: day(T.asOf.board), 어디서: L.inds.length + '개 업종', 무엇을: L.say ?? null, 어떻게: '업종마다 우량주 5곳씩이에요', 왜: '21곳 가운데 ' + star.length + '곳이 이 땅에 있어요'}, {mean: star.length ? '이 땅에서 21곳에 든 회사가 ' + star.length + '곳이라는 뜻이에요. ✦ 를 누르면 그 회사로 가요.' : '이 땅에는 이번 21곳이 없다는 뜻이에요.'});
  const go = star[0] ?? cos[0];
  const list = h('section', {class: 'su-list', 'aria-label': L.name + ' 업종과 회사'}, h('h2', {class: 'su-ft', text: '업종 → 회사 · ✦ 은 21곳'}),
    L.inds.map(g => h('div', {class: 'su-indc'}, h('p', {class: 'su-indn'}, h('b', {text: g.name}), ' · 20거래일 ' + sgn(g.ch20) + (g.hot ? ' · 불장 업종' : '')),
      h('p', {class: 'su-chips'}, g.cos.map(c => h('a', {class: 'su-chipa' + (c.in.length ? ' su-chip21' : ''), href: '#/c/' + c.code, 'data-proper': ''}, c.in.length ? '✦ ' : '', c.name))))));
  return {title: L.name, tab: 1, step: 3, kick: '땅 지도 · ' + L.name, h1: L.name + ' 땅', proper: false, big,
    hero: X.fig('ib', [indBars(L)], {label: L.name + ' 업종 막대', hero: true, cap: [L.name + ' 땅에는 업종이 ' + L.inds.length + '개 있어요.', '막대는 업종마다 20거래일 동안 365곳 평균으로 움직인 만큼이에요.', '그런데 내린 업종도 숨기지 않아요.', '그래서 오른 업종의 ✦ 회사부터 봐요.']}),
    mids: [], body: [list], pro: L.inds.map(g => ({k: g.name, v: sgn(g.ch20), how: '20거래일 365곳 평균 · ' + g.cos.map(c => c.name).join(' · ')})),
    next: go ? {href: '#/c/' + go.code, label: josa(go.name, '은') + ' 왜 21곳에?', step: 4, k: '4 / 8'} : {href: '#/', label: '처음으로'}, asOf: T.asOf.board, S};
}
export async function vMore(X, code) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const c = find21(T, code); if (!c) return X.notFound('이 회사의 출목표 자료가 없어요. 21곳만 있어요.');
  X.setCur?.({code, name: c.name, ind: c.ind});
  const l = c.c ?? [], d = l.slice(1).map((v, i) => Math.sign(v - l[i])), up = d.filter(x => x > 0).length, dn = d.filter(x => x < 0).length, f = c.flows ?? {};
  const big = val(fin(c.ch20) ? sgn(c.ch20) : null, '%', c.name + ' · ' + day(c.date) + '까지 20거래일 오른 만큼', {누가: c.name, 언제: day(c.date) + '까지 20거래일', 어디서: c.ind + ' 업종', 무엇을: '그날 마지막 값으로 셌어요', 어떻게: '첫날 값과 마지막 날 값을 견줬어요', 왜: '21곳에 든 까닭을 값으로 보려고요'}, {mean: day(c.date) + ' 마지막 값으로 보면, 20거래일 전에 100원이었다면 지금 ' + (fin(c.ch20) ? num(Math.round((100 + c.ch20) * 10) / 10) : NEED) + '원이라는 뜻이에요.'});
  const mids = [
    val(up, '일', '오른 날 · 내린 날 ' + dn + '일', {누가: c.name, 언제: day(c.date) + '까지', 어디서: '출목표', 무엇을: '날마다 오른 날과 내린 날을 셌어요', 어떻게: '● 오른 날 · ○ 내린 날', 왜: '오른 날이 이어졌는지 보려고요'}, {mean: '20일 가운데 ' + up + '일 올랐고 ' + dn + '일 내렸다는 뜻이에요.'}),
    val(f.foreign, '', '외국인 닷새 · 기관 ' + (fin(f.institution) ? num(f.institution) : NEED) + ' · 개인 ' + (fin(f.individual) ? num(f.individual) : NEED), {누가: '외국인 · 기관 · 개인', 언제: f.from && f.to ? day(f.from) + '부터 ' + day(f.to) + '까지' : null, 어디서: c.name, 무엇을: '닷새 동안 들어온 돈과 나간 돈의 차이', 어떻게: '자료 값 그대로 · 단위 확인 필요', 왜: null}, {mean: fin(f.foreign) ? (f.foreign > 0 ? '외국인은 닷새 동안 판 것보다 산 것이 많았다는 뜻이에요.' : '외국인은 닷새 동안 산 것보다 판 것이 많았다는 뜻이에요.') : null}),
    val(c.news?.newsCount, '건', '뉴스', {누가: c.name, 언제: day(c.date), 어디서: '뉴스', 무엇을: '이 회사 이름이 나온 뉴스 수', 어떻게: '자료 값 그대로', 왜: null}, {mean: fin(c.news?.newsCount) ? '이 회사 이야기가 뉴스에 ' + c.news.newsCount + '번 나왔다는 뜻이에요.' : null})];
  return {title: c.name + ' 자세히', tab: 2, step: 5, kick: c.name + ' · ' + c.ind, h1: c.name + ' 출목표', proper: true, big,
    hero: X.fig('road', [road(c), line21(c)].filter(Boolean), {label: '출목표 · 21거래일 줄', hero: true, cap: ['20거래일을 하루씩 놓았어요.', '오른 날은 ●, 내린 날은 ○ 예요. 같은 쪽이 이어지면 아래로 쌓여요.', '그런데 오른 날이 많아도 앞날을 알려 주지는 않아요.', '그래서 줄 그림과 함께 봐요.']}),
    mids, figs: sun52(c) ? [X.fig('sun', [sun52(c)], {label: '뜨거운 태양 · 1년 사이 값 자리', title: '1년 사이 값 자리(뜨거운 태양 = 1년 가장 높은 값 가까이)'})] : [],
    pro: [{k: '그날 마지막 값 21개', v: l.map(num).join(' · '), how: SRC + ' · ' + day(c.date) + '까지'}, {k: '닷새 수급', v: [f.foreign, f.institution, f.individual].map(v => (fin(v) ? num(v) : NEED)).join(' · '), how: '외국인 · 기관 · 개인 · 자료 값 · 단위 확인 필요'}, {k: '52주 자리', v: fin(c.pos52) ? num(Math.round(c.pos52 * 1000) / 10) : NEED, how: '52주 가장 낮은 값 0 · 가장 높은 값 100'}, {k: '회사 크기', v: fin(c.cap) ? num(c.cap) + '억 원' : NEED, how: '/atlas/data/cond.json · ' + day(T.asOf.cond)}],
    next: {href: '#/q/' + code, label: '내 이유는 무엇인가?', step: 6, k: '6 / 8'}, asOf: c.date, S};
}
export async function vFriend(X) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const big = val(21, '곳', '친구에게 건넬 목록', {누가: '나와 친구', 언제: day(T.asOf.board), 어디서: '카카오톡', 무엇을: '21곳 목록과 까닭을 건네요', 어떻게: '카톡 보내기 · 카톡 가입 · 커피 쿠폰 · 상품권 · 소개 영상', 왜: '혼자보다 함께 보면 덜 서두르니까요'}, {mean: '내가 본 21곳을 친구도 같은 잣대로 볼 수 있다는 뜻이에요.'});
  const card = (href, title, say, helps) => h('a', {class: 'su-fcard', href}, h('b', {text: title}), h('span', {text: say}), h('em', {class: 'su-help', text: '돕는 일 · ' + helps}));
  const cards = h('section', {class: 'su-flist', 'aria-label': '친구에게'}, h('h2', {class: 'su-ft', text: '친구에게 · 옛 기능도 여기서'}),
    card('/next/#/share', '카톡 보내기', '21곳 가운데 한 곳을 친구에게 보내요.', '셋 모두'), card('/next/#/gift', '상품권 · 카톡 가입', '친구 셋이 열면 상품권을 받아요.', '셋 모두'),
    card('/next/#/why', '커피 쿠폰', '「왜 사?」를 열 번 끝까지 하면 한 달에 한 장.', '셋 모두'), card('/hello.html', '소개 영상', '수르가 무엇을 하는 곳인지 1분 영상.', '셋 모두'),
    card('/next/#/me', '내 종목 점검', '내가 가진 회사를 같은 잣대로 봐요.', '셋 모두'), card('/next/#/jinhwa', '진화', '수르가 스스로 고친 것을 모두 보여요.', '셋 모두'),
    card('/next/#/find', '종목 찾기', '상장 회사 모두에서 이름으로 찾아요.', '셋 모두'), card('/next/?lang=en', '영어', '영어로 봐요.', '셋 모두'),
    card('https://shin-yxy.gino.im/', '만수르', '사장님이 정하신 바깥 길이에요.', '셋과 안 이어짐'));
  return {title: '친구에게', tab: 3, step: 8, kick: '함께 보기', h1: '친구에게', big,
    hero: X.fig('p6', [petals6()], {label: '친구에게 건네는 여섯 가지', hero: true, cap: ['21곳을 친구와 함께 봐요.', '카톡으로 보내고, 친구가 열면 가입은 두 번이면 돼요.', '그런데 친구에게도 사고팔기를 권하지 않아요.', '그래서 까닭과 함께 건네요.']}),
    mids: [], body: [cards], pro: [{k: '카톡 가입', v: '켜짐', how: 'config/atlas11/kakao.json'}, {k: '커피 쿠폰', v: '열 번에 한 장', how: '한 달에 한 번 · 사장님이 직접 보냄'}, {k: '옛 기능', v: '13줄 모두 길 위에', how: '21곳 · 땅 지도 · 회사 · 자세히 · 왜 사? · 매매일지 · 친구에게 여덟 쪽에 나눠 둠 · 지운 것 없음'}, {k: '셋과 안 이어진 것', v: '1', how: '만수르(바깥 길) — 사장님이 정하실 것'}],
    next: {href: '#/', label: '처음으로', step: null, k: '끝'}, asOf: T.asOf.board, S};
}
/** 회사 쪽 — 21곳 까닭 상자 */
export function reasonBox21(T, code) {
  const ks = KEY.filter(k => (T?.lists?.[k] ?? []).some(c => c.code === code)); if (!ks.length) return null;
  const ck = k => T.lists[k].find(c => c.code === code); // 목록마다 그 목록의 까닭(겹친 곳은 두 줄 — 불장 까닭 · 돈 까닭)
  return h('section', {class: 'su-why su-why21', 'aria-label': '21곳에 든 까닭'}, h('h2', {class: 'su-ft', text: '21곳에 든 까닭 · ' + ks.map(k => KIND[k]).join(' · ')}),
    ks.map(k => h('p', {class: 'su-lead', text: why21(ck(k), k, T)})), h('p', {class: 'su-note', text: '자료 ' + day(T.asOf.board) + ' · ' + SRC}));
}
