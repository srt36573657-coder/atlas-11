/* ATLAS 11 · 「왜 예비인가」 · 「왜 태양인가」 — 근거를 기승전결 넷으로(지난 기록만 · 앞날 말 없음)
   사장님 2026-10-08 06:48 「그리고 왜 예비 후보인지 그 근거와 이유가 분명히 기승전결로 있어야 한다」
        2026-10-08 06:49 「태양도 왜 태양인지 마찮가지로 그 근거가 있러야 한다」
   · 새로 셈하지 않는다 — 예비는 판을 만들 때 센 값(board.similar · lib/atlas11/similar.mjs) · 태양은 판마다 한 번 센 값(shapes.js sunOf)만 읽는다
   · 기 = 무엇이 공통점인가(불장 회사들 · 오른 회사들) · 승 = 이 회사는 몇 가지를 가졌나(✓ 가짐 · 「·」 안 가짐 · 「?」 값 모름)
     전 = 견줌(예비: 이 회사의 업종은 불장 밖 · 업종 자리와 평균 · 이 회사 변화 / 태양: 이 회사의 오른 순 자리 · 변화 · 오른 회사 안인가 밖인가)
     결 = 그래서 예비 · 태양에 들었다 + 고른 법 + 「지난 기록을 견준 것일 뿐 앞날을 맞히지 않습니다」 한 줄
   · 글 틀은 적게(말 73개로 옮길 틀) — 숫자 · 이름만 바뀌고 틀은 같다 · 이미 사전에 있는 틀(「업종 {n}개 가운데 {n}위」 · 「오른 순 {n}곳 가운데 {n}위」 ·
     「닮은 {n}곳 = …」 · 「태양 {n}곳 = …」 · 공통점 · 모양 이름 …)은 「 · 」로 이어 붙여 그대로 씀(번역은 「 · 」로 나눠 조각마다 틀을 찾음)
     새 틀 목록은 tests/atlas11/reason.test.mjs 의 NEW_TEMPLATES(시험이 사전과 맞대어 그 밖의 틀이 생기면 막음)
   · 회사 이름은 글에 넣지 않는다(「이 회사」) — 이름 뒤 조사(은/는)가 이름마다 달라지지 않게 · 이름 속 숫자가 틀을 흔들지 않게
   · 글 함수(similarReason · sunReason)는 화면 없이 돈다(시험) · 그리기(beatsEl)만 h 를 씀 · 움직임 없음(한 번에 하나는 그림 몫 — 규칙 28) */
import {h, pct, korDate, finite} from './util.js';
import {riseDesc} from './family.js';
import {SHAPE_MIN, SHAPE_GAP} from './shapes.js';

export const BEATS = Object.freeze(['기', '승', '전', '결']);
const DAYS = 20; // 기간 잣대는 지난 20거래일 하나(규칙 3)
/** 변화 한 개(소수 한 자리 · 아주 작으면 둘째 자리 — 논평 · 회사 그림과 같은 모양) */
const p1 = v => pct(v, finite(v) && Math.abs(v) < 0.0005 ? 2 : 1);
const pc = x => Math.round(x * 100);
const FILLED = n => `그런 것이 ${n}가지보다 적어 차이가 큰 차례로 채움`; // 사전에 있는 틀(예비 「어떻게 셌나」)
/** 줄 하나 — c 차례(0~3) · k 글자 · head 머리 한 줄 · chips 이름표 · why 근거 줄 · note 끝 한 줄 · text 글 전체(시험 · 소리) */
function beat(c, head, {chips = null, why = [], note = null} = {}) {
  const w = why.filter(Boolean), ch = chips?.length ? chips : null;
  const text = [head, ch ? ch.map(x => (x.mark ? `${x.mark} ` : '') + x.name).join(', ') : null, ...w, note].filter(Boolean).join(' / ');
  return {c, k: BEATS[c], head, chips: ch, why: w, note, text};
}

/** 예비 한 곳의 근거 넷 — item = 판의 예비 한 줄(board.similar.items) 또는 종목 번호 · 예비가 아니면 null */
export function similarReason(board, item) {
  const sim = board?.similar, items = sim?.items ?? [];
  const x = items.find(i => i.code === (typeof item === 'string' ? item : item?.code));
  if (!x) return null;
  const traits = (sim.common ?? []).map(id => (sim.traits ?? []).find(t => t.id === id)).filter(Boolean), k = traits.length;
  const hotN = board.hot?.items?.length ?? 0;
  if (!k || !hotN) return null;
  const r = sim.rules ?? {}, groups = board.groups ?? [], g = groups.find(gr => gr.id === x.groupId) ?? null;
  const has = new Set(x.has ?? []), unk = new Set(x.unknown ?? []), m = has.size;
  const rank = [...items].sort(riseDesc).findIndex(i => i.code === x.code) + 1; // 보이는 차례(예비 화면 줄 번호와 같음 · 지난 20거래일 많이 오른 순 — 규칙 9)
  const gRank = g ? (g.rank ?? groups.indexOf(g) + 1) : null;
  const moves = [finite(g?.change20) ? `업종 평균 ${p1(g.change20)}` : null, finite(x.change20) ? `이 회사 ${p1(x.change20)}` : null].filter(Boolean);
  return [
    // 기 — 불장 회사들의 공통점(무엇 · 몇 가지 · 어떻게 골랐나)
    beat(0, `불장 ${hotN}개 업종 ${sim.hotCompanies}곳의 공통점 ${k}가지`, {
      chips: traits.map(t => ({id: t.id, name: t.chip})),
      why: [`불장 회사의 ${pc(r.minShare ?? 0.5)}% 넘게 가졌고 나머지 ${sim.restCompanies}곳보다 ${pc(r.minGap ?? 0.1)}%p 넘게 많이 가진 점${sim.filled ? ` · ${FILLED(r.minCommon ?? 3)}` : ''}`]}),
    // 승 — 이 회사가 가진 것(✓) · 안 가진 것(·) · 값을 모르는 것(?)
    beat(1, m === k ? `이 회사는 ${k}가지를 모두 가졌다` : `이 회사는 ${k}가지 가운데 ${m}가지를 가졌다`, {
      chips: traits.map(t => ({id: t.id, name: t.chip, mark: has.has(t.id) ? '✓' : unk.has(t.id) ? '?' : '·'}))}),
    // 전 — 그런데 이 회사의 업종은 불장 밖(업종 자리 · 업종 평균과 이 회사 변화)
    beat(2, `그런데 이 회사의 업종은 불장(업종 1위~${hotN}위) 밖이다`, {
      why: [g ? `${g.label} · 업종 ${groups.length}개 가운데 ${gRank}위` : x.groupLabel ?? '업종 모름', moves.length ? [`지난 ${DAYS}거래일`, ...moves].join(' · ') : null]}),
    // 결 — 그래서 예비(몇 번째 · 고른 법) + 앞날을 맞히지 않는다는 한 줄
    beat(3, `그래서 예비 ${items.length}곳에 들었다`, {
      why: [`오른 순 ${items.length}곳 가운데 ${rank}위`,
        `닮은 ${sim.want ?? 7}곳 = 불장 업종 밖 회사 가운데 공통점을 많이 가진 차례(${sim.need}가지 이상만) · 같으면 지난 ${DAYS}거래일 많이 오른 차례 · 한 업종 ${sim.perIndustry}곳까지`],
      note: board.asOf ? `${korDate(board.asOf)} 종가까지 지난 기록을 견준 것일 뿐 앞날을 맞히지 않습니다` : '앞날을 맞히지 않습니다'}),
  ];
}

/** 태양 한 곳의 근거 넷 — shp = sunOf(판) · 태양(공통 모양을 모두 가진 곳)이 아니면 null */
export function sunReason(shp, board, code) {
  if (!shp?.common?.length || !shp.sparkle?.has(code)) return null;
  const cs = board?.companies ?? [], c = cs.find(x => x.code === code);
  if (!c) return null;
  const T = shp.common.map(id => (shp.traits ?? []).find(t => t.id === id)).filter(Boolean), k = T.length;
  const rank = [...cs].sort(riseDesc).findIndex(x => x.code === code) + 1, inTop = rank <= shp.topN; // 오른 순 — 회사 화면 「오른 순 n곳 가운데 n위」와 같은 셈
  const filled = T.some(t => !(t.topShare > SHAPE_MIN && t.gap > SHAPE_GAP)); // 50% · 10%p 를 넘는 모양이 셋보다 적어 차이가 큰 차례로 채운 판(shapes.js)
  return [
    // 기 — 오른 회사들(지난 20거래일 오른 순 위 20%)의 출목표 공통 모양
    beat(0, `오른 회사 ${shp.topN}곳의 출목표 공통 모양 ${k}가지`, {
      chips: T.map(t => ({id: t.id, name: t.name})),
      why: [`오른 회사 = 지난 ${DAYS}거래일 오른 순 1위~${shp.topN}위`,
        `오른 회사의 ${pc(SHAPE_MIN)}% 넘게 가졌고 나머지 ${shp.restN}곳보다 ${pc(SHAPE_GAP)}%p 넘게 많이 가진 모양${filled ? ` · ${FILLED(3)}` : ''}`]}),
    // 승 — 이 회사는 그 모양을 모두 가졌다(모양마다 ✓)
    beat(1, `이 회사는 ${k}가지를 모두 가졌다`, {chips: T.map(t => ({id: t.id, name: t.name, mark: '✓'}))}),
    // 전 — 이 회사의 숫자(오른 순 자리 · 지난 20거래일 변화) · 오른 회사 안인가 밖인가
    beat(2, inTop ? `이 회사도 오른 회사 ${shp.topN}곳 안에 든다` : `그런데 이 회사는 오른 회사 ${shp.topN}곳 밖이다`, {
      why: [[`오른 순 ${cs.length}곳 가운데 ${rank}위`, finite(c.change20) ? `지난 ${DAYS}거래일 ${p1(c.change20)}` : null].filter(Boolean).join(' · ')]}),
    // 결 — 그래서 태양 + 앞날을 맞히지 않는다는 한 줄
    beat(3, `그래서 태양 ${shp.sparkle.size}곳에 들었다`, {
      why: [`태양 ${shp.sparkle.size}곳 = 오른 회사 출목표의 공통 모양 ${k}가지를 모두 가진 곳`],
      note: board.asOf ? `${korDate(board.asOf)} 종가까지 지난 ${DAYS}거래일 출목표 모양을 견준 것일 뿐 앞날을 맞히지 않습니다` : '앞날을 맞히지 않습니다'}),
  ];
}

/* ── 그리기(화면에서만) — 줄마다 왼쪽 동그라미에 기 · 승 · 전 · 결(한국어 화면만 · 다른 말은 차례 숫자 — CSS 셈 · 글자가 아님) ── */
const SR = {'✓': ' 가짐', '·': ' 안 가짐', '?': ' 모름'}; // 표시 글자는 색만이 아니라 글자로 · 화면 읽기 프로그램은 말로
const chipEl = x => h('li', {class: 'rs-c' + (x.mark === '✓' ? ' on' : x.mark === '?' ? ' unk' : x.mark === '·' ? ' off' : ''), 'data-id': x.id, 'data-mark': x.mark ?? null},
  x.mark ? h('span', {class: 'rs-ck', 'aria-hidden': 'true'}, x.mark) : null, h('span', null, x.name), x.mark ? h('span', {class: 'sr-only'}, SR[x.mark]) : null);
/** 근거 줄 — 「 · 」로 이은 조각마다 한 덩이(줄은 조각 사이에서 바뀜 · 「·」는 앞 조각 덩이 끝에 붙음) · 조각 글은 따로 번역(안쪽 칸 · 사전의 틀 그대로) */
const frags = s => { const ps = s.split(' · '); return ps.flatMap((p, i) => [i ? ' ' : null, h('span', {class: 'rs-f'}, h('span', null, p), i < ps.length - 1 ? '\u00a0·' : null)]); };
/** 네 줄 — speak: 머리 한 줄을 「소리로 듣기」가 읽음(보일 때만 · 닫힌 접힘 안은 읽지 않음) */
export function beatsEl(beats, {speak = false} = {}) {
  if (!beats?.length) return null;
  return h('ol', {class: 'rs-beats'}, ...beats.map(b => h('li', {class: 'rs-beat', 'data-c': String(b.c)},
    h('span', {class: 'rs-k', 'aria-hidden': 'true'}, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': ''}, b.k)),
    h('div', {class: 'rs-b'},
      h('p', {class: 'rs-h', 'data-speak': speak ? '' : null}, b.head),
      b.chips ? h('ul', {class: 'rs-chips'}, ...b.chips.map(chipEl)) : null,
      ...b.why.map(w => h('p', {class: 'rs-w'}, ...frags(w))),
      b.note ? h('p', {class: 'rs-n'}, b.note) : null))));
}
