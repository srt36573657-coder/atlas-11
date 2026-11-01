#!/usr/bin/env node
/* 서른아홉 스승 캐릭터 그림 — 사장님 2026-11-01 05:46(+04) 「응 캐릭터 만들어서」(물음 「서른아홉 스승이 남긴 말도 소리로 읽어 드릴까요?」의 답 · docs/design/sage-art-2026-11-01/order-1046.txt)
   스승마다 새로 그린 얼굴 그림 하나(다른 그림을 베끼지 않음 · 초상을 따라 그리지 않음) — 로마 신 일흔둘(roman_art.mjs · order-1332b)과 같은 손 · 같은 꼴
   동그라미 판(네 걸음 빛 — p-sage.css --sg1 ~ --sg4 와 같은 빛 · 바탕은 옅게) · 큰 머리 · 그 시대 옷과 쓰개 · 스승마다 큰 낱말을 보여 주는 물건 하나(연꽃 · 죽간 · 물음 말풍선 …)
   만든 것 = site/next/sage-art/<이름>.svg(서른아홉) · 글자 없는 그림 · 글 속 style 없음(모양은 그림 속성만) · 바깥 그림 · 글꼴 · 스크립트 없음
   쓰는 법: node scripts/atlas11/next/sage_art.mjs          — 그림 파일 서른아홉을 다시 씀
            node scripts/atlas11/next/sage_art.mjs --check  — 파일이 이 기계가 그린 것과 같은지만 봄(다르면 1)
   검사 = scripts/atlas11/next/check_sage.mjs ⑧(같은지 · 크기 · 얼굴 단추 · 남긴 말 듣기) */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {KIT} from './roman_art.mjs';

const {INK, SKIN, GOLD, WOOD, METAL, LEAF, WHITE, BLK, DBR, BRN, GLD, WHT, GRY, r1, el, TH, NS, P, C, E, R, LN, OL, MIR, ROT, arc, flower, drop, hand, band, laurel, HAIR, BEARD, MUST, HW, BACK, IT, body, ears} = KIT;

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = path.resolve(HERE, '../../../site/next/sage-art');
export const DATA_FILE = path.resolve(HERE, '../../../site/next/data/sage39.json');
export const ART_URL = id => `/next/sage-art/${id}.svg`;

/** 네 걸음 — [판 바탕, 테] (p-sage.css .sg --sg1 ~ --sg4 와 같은 테 빛 · 바탕은 옅게) */
export const STEP_BG = Object.freeze({1: ['#D5EEF4', '#018EAE'], 2: ['#F6E7C6', '#9D6D1C'], 3: ['#E4DAF9', '#5A30B9'], 4: ['#F6DCE7', '#8D2A59']});
const CAP = '#22202A', PAPER = '#FFF8E6', JADE = '#5FA65A';

/* ── 머리카락 더함 ── */
const HAIR2 = {
  ...HAIR,
  /** 붓다 — 작은 소라 곱슬 + 정수리 솟음 */
  snail: c => ({f: P('M36 58C35 41 46 33 60 33C74 33 85 41 84 58C80 50 72 46 60 46C48 46 40 50 36 58Z', c, NS)
    + C(60, 30, 8.5, c, {'stroke-width': 1.6}) + arc(60, 30, 4.6, 3.6, 200, 340, 4).map(p => C(p.x, p.y, 2.4, c, {'stroke-width': 1})).join('')
    + [...arc(60, 52, 23, 20, 190, 350, 11), ...arc(60, 47, 15, 11, 205, 335, 6)].map(p => C(p.x, p.y, 3.9, c, {'stroke-width': 1.1})).join('')}),
  /** 스님 — 깎은 머리(옅은 빛만) */
  shaved: c => ({f: P('M36 57C35 41 46 34 60 34C74 34 85 41 84 57C80 49 72 45 60 45C48 45 40 49 36 57Z', c, {...NS, opacity: 0.5})}),
  /** 흰 가발 — 옆 말이 둘씩(귀를 덮음) */
  wig: c => ({b: P('M40 60C38 72 40 82 46 86L74 86C80 82 82 72 80 60Z', c),
    f: P('M35.5 60C34 41 45 32 60 32C75 32 86 41 84.5 60C82 52 77 47 70 46C64 48 56 48 50 46C43 47 38 52 35.5 60Z', c)
      + E(34.5, 57, 5.4, 4.3, c) + E(34.5, 66, 5.4, 4.3, c) + E(85.5, 57, 5.4, 4.3, c) + E(85.5, 66, 5.4, 4.3, c)}),
  /** 정수리가 벗어지고 옆 머리가 어깨까지 */
  baldLong: c => ({f: P('M36 60C33 70 33 82 37 90C41 91 44 89 45 86C41 78 40 70 42 61Z', c) + P(MIR('M36 60C33 70 33 82 37 90C41 91 44 89 45 86C41 78 40 70 42 61Z'), c)
    + P('M63 39.5C67 38.5 71 40 73.5 43', 'none', {stroke: WHITE, 'stroke-width': 2.6, opacity: 0.8})}),
};

/* ── 수염 더함 — chin = 턱수염만(콧수염 없음) · goatee = 아래턱 끝만 ── */
const BEARD2 = {
  ...BEARD,
  chin: 'M38.5 64C40 84 49 93 60 93C71 93 80 84 81.5 64C78 75 71 81.5 60 81.5C49 81.5 42 75 38.5 64Z',
  goatee: 'M54.5 79C54 87 57 92 60 92C63 92 66 87 65.5 79C62.5 80.5 57.5 80.5 54.5 79Z',
};

/* ── 쓰개 더함 — {b: 뒤, f: 앞, ears: 귀를 덮나} ── */
const HW2 = {
  ...HW,
  /** 상투를 덮는 작은 관 + 비녀 */
  scholarCap: (c = CAP) => ({f: P('M50 36C50 25 53 19 60 19C67 19 70 25 70 36Z', c) + OL('M41 27.5L79 27.5', GOLD, 2)}),
  /** 한나라 벼슬 관(뒤가 높음) */
  hanCap: () => ({f: P('M37 50C36 34 46 25 58 24L82 22L80 50Z', CAP) + P('M58 24.5L60 12L81 10L82 22Z', CAP) + P('M44 36C52 31 70 29 79 30', 'none', {stroke: '#4A4656', 'stroke-width': 1.4})}),
  /** 높은 검은 모자 */
  tallCap: () => ({f: P('M41 46L43 17C50 13 70 13 77 17L79 46Z', CAP) + band('#4A4656', -5)}),
  /** 양옆 날개 달린 검은 모자 */
  mingHat: () => ({f: E(26, 37, 11, 3.6, CAP, {transform: ROT(-8, 26, 37)}) + E(94, 37, 11, 3.6, CAP, {transform: ROT(8, 94, 37)})
    + P('M38 50C37 33 47 24 60 24C73 24 83 33 82 50Z', CAP) + C(60, 22, 6.5, CAP) + band('#4A4656', -2)}),
  /** 익선관 — 둥근 검은 관 뒤로 솟은 둥근 날개 둘 */
  iksun: () => ({f: P('M43 33C44 20 76 20 77 33Z', '#1F1E2B') + P('M37 51C36 36 47 29 60 29C73 29 84 36 83 51Z', '#1F1E2B')
    + P('M45 30C52 26.5 68 26.5 75 30', 'none', {stroke: '#4A4656', 'stroke-width': 1.4}) + band(GOLD, -1)}),
  /** 조선 장수 투구 — 쇠 투구 · 꼭대기 붉은 술 · 옆 드림 */
  helmetK: () => ({f: P('M33 62C31 39 44 27 60 27C76 27 89 39 87 62L88 73L80 73L79 54C73 50 47 50 41 54L40 73L32 73Z', '#4E5566')
    + P('M60 5C67 9 68 16 60 19C52 16 53 9 60 5Z', '#D63B3B') + R(56.5, 16.5, 7, 11.5, 2, '#C9A04A', TH) + band('#C9A04A', -2)
    + P('M38 58C39 50 42 46 46 44', 'none', {stroke: WHITE, 'stroke-width': 2, opacity: 0.5}), ears: 1}),
  /** 갓 — 넓은 챙(반쯤 비침) · 갓끈 */
  gat: () => ({f: E(60, 41.5, 37, 6.6, '#1B1A22', {opacity: 0.86}) + P('M47.5 41.5L48.5 21C53 18.5 67 18.5 71.5 21L72.5 41.5Z', '#1B1A22', {opacity: 0.9})
    + LN(40, 46, 52, 86, '#4A3F36', 1.4) + LN(80, 46, 68, 86, '#4A3F36', 1.4)}),
  /** 정자관 — 두 층 검은 관 */
  jeongja: () => ({f: P('M39 49L41 30L79 30L81 49Z', '#1F1E2B') + P('M46 30.5L48 17L72 17L74 30.5Z', '#1F1E2B') + P('M42 39L78 39M47.5 24L72.5 24', 'none', {stroke: '#4A4656', 'stroke-width': 1.4})}),
  /** 유건 — 검은 천 선비 모자(두 귀 솟음) */
  yugeon: () => ({f: P('M44.5 31L46.5 21L73.5 21L75.5 31Z', CAP) + P('M37 51C37 35 46 28 60 28C74 28 83 35 83 51Z', CAP) + P('M47 26L73 26', 'none', {stroke: '#4A4656', 'stroke-width': 1.3})}),
  /** 윤건 — 푸른 비단 두건 · 뒤로 늘어진 끈 */
  guanjin: () => ({b: P('M77 42C87 52 91 68 88 86C84 82 82 72 80 62Z', '#2F5D9E'),
    f: P('M36 53C35 33 47 24 60 24C73 24 85 33 84 53C78 47 70 44 60 44C50 44 42 47 36 53Z', '#2F5D9E') + P('M44 34C50 30 70 30 76 34', 'none', {stroke: '#9DBCE8', 'stroke-width': 1.6})}),
  /** 높은 검은 모자(링컨) */
  tophat: () => ({f: R(43, 5, 34, 35, 2.5, '#1E1C24') + R(43, 31, 34, 5, 1, '#3B3743', TH) + E(60, 40.5, 28, 5.2, '#1E1C24')}),
  /** 납작한 베레모 */
  beret: () => ({f: P('M33 47C30 34 44 24 62 25C80 26 90 35 85 47C78 41 46 40 33 47Z', '#7A2E3A') + C(62, 25, 2.2, '#7A2E3A', TH)}),
};

/* ── 몸 뒤 더함 ── */
const BACK2 = {
  ...BACK,
  /** 붓다 — 머리 뒤 둥근 빛 */
  halo: () => C(60, 57, 35, '#FFE9A8', {stroke: '#F2C14E', 'stroke-width': 2.2}),
};

/* ── 목 둘레 ── */
const NECK = {
  ruff: () => E(60, 89.5, 23, 7, WHITE) + P('M39 88Q44 94 49.5 88.5Q55 95 60 89Q65 95 70.5 88.5Q76 94 81 88', 'none', {stroke: '#C9CED6', 'stroke-width': 1.2}),
  cravat: () => P('M54 89L66 89L64.5 100L60 104.5L55.5 100Z', WHITE, TH),
  band: () => P('M44 90C50 97 70 97 76 90L72.5 98.5C66 101.5 54 101.5 47.5 98.5Z', WHITE, TH),
};

/* ── 몸 — 양복 · 깃 선 옷 · 한복 · 동양 옷(오른쪽으로 여민 깃) · 그 밖은 로마 신과 같은 몸 ── */
const TORSO = 'M14 122C16 101 33 90 60 90C87 90 104 101 106 122Z';
const neckOf = s => R(54, 76, 12, 14.5, 3, s, {'stroke-width': 1.8});
function bodyS(a, s) {
  const robe = a.robe ?? '#8EC5F0';
  if (a.body === 'suit') {
    const lap = 'M47 90L58 113L50.5 97.5L45 92.5Z';
    return P(TORSO, robe) + neckOf(s) + P('M48 90L60 111L72 90Z', a.shirt ?? WHITE) + (a.tie ? P('M57.5 92L62.5 92L63.5 104L60 108.5L56.5 104Z', a.tie, TH) : '')
      + P(lap, robe, TH) + P(MIR(lap), robe, TH);
  }
  if (a.body === 'mao') return P(TORSO, robe) + neckOf(s) + P('M49.5 88.5L60 95.5L70.5 88.5L70.5 93L60 100L49.5 93Z', robe, TH) + LN(60, 100, 60, 122, INK, 1.2) + [105, 113].map(y => C(60, y, 1.6, '#3A3D45', NS)).join('');
  if (a.body === 'hanbok' || a.body === 'east') {
    const col = a.col ?? '#2E3448';
    return P(TORSO, robe) + neckOf(s) + P('M52 90L60 98.5L68 90Z', s, {'stroke-width': 1.6})
      + P('M47 90L53 90L72 122L65 122Z', col, TH) + P('M67 90L73 90L59.5 107.5L56.5 103Z', col, TH)
      + (a.badge ? C(41, 106, 7, a.badge, TH) + P('M37.5 106C39 103 43 103 44.5 106C43 109 39 109 37.5 106Z', '#C8312F', {...TH, opacity: 0.8}) : '');
  }
  return body(a, s);
}
/** 귀 — long = 길게 늘어진 귓불(붓다) */
const earsS = (s, kind) => (kind === 'long' ? E(35.5, 66, 4.6, 9.5, s) + E(84.5, 66, 4.6, 9.5, s) + P('M35 61C37 63 37 69 35 71M85 61C83 63 83 69 85 71', 'none', {stroke: INK, 'stroke-width': 1.1, opacity: 0.5}) : ears(s, kind === 'pointy'));
/** 얼굴 — 로마 신과 같은 눈 · 입 · 볼 · 눈썹 + 턱수염 · 아래턱 수염 · 콧수염만 · 둥근 안경 */
function faceS(a, hc) {
  const bc = a.bc ?? hc, mu = a.mu || (a.b && a.b !== 'short' && a.b !== 'chin'), dy = mu || a.b === 'short' ? 4.5 : 0;
  let o = E(45.5, 68.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.6}) + E(74.5, 68.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.6});
  if (a.b) o += P(BEARD2[a.b], bc);
  if (mu) o += P(MUST, bc, TH);
  const m = a.m ?? 'smile';
  o += m === 'open' ? P(`M55.5 ${70 + dy}Q60 ${78 + dy} 64.5 ${70 + dy}Z`, '#8C3442', {'stroke-width': 1.6})
    : m === 'grin' ? P(`M53.5 ${69.5 + dy}Q60 ${77 + dy} 66.5 ${69.5 + dy}`, 'none', {'stroke-width': 2.1})
      : m === 'flat' ? P(`M56.5 ${71.5 + dy}L63.5 ${71.5 + dy}`, 'none')
        : P(`M56 ${70.5 + dy}Q60 ${74.5 + dy} 64 ${70.5 + dy}`, 'none');
  const e = a.e ?? 'dot', small = a.old;
  const dot = (x, y) => E(x, y, small ? 2.5 : 3.1, small ? 3 : 3.9, INK, NS) + C(x + 1.1, y - 1.5, small ? 0.9 : 1.15, WHITE, NS);
  const happy = x => P(`M${x - 3.4} 63.5Q${x} 58.8 ${x + 3.4} 63.5`, 'none', {'stroke-width': 2.3});
  const sleep = x => P(`M${x - 3.4} 61.5Q${x} 65.5 ${x + 3.4} 61.5`, 'none', {'stroke-width': 2.3});
  o += e === 'happy' ? happy(51) + happy(69) : e === 'sleep' ? sleep(51) + sleep(69) : dot(51, 62) + dot(69, 62);
  if (a.gl) o += C(51, 62, 6.6, WHITE, {'stroke-width': 1.7, 'fill-opacity': 0.25}) + C(69, 62, 6.6, WHITE, {'stroke-width': 1.7, 'fill-opacity': 0.25}) + P('M57.6 61.5Q60 59.5 62.4 61.5M44.4 61L37 59M75.6 61L83 59', 'none', {'stroke-width': 1.5});
  if (a.br === 'stern') o += P('M46 55.5L55.5 58M74 55.5L64.5 58', 'none', {'stroke-width': 2.4});
  if (a.br === 'soft' || a.old) o += P('M46.5 55.5Q51 52.8 55.5 55.5M64.5 55.5Q69 52.8 73.5 55.5', 'none', {stroke: a.old ? bc : INK, 'stroke-width': a.old ? 3 : 2, opacity: a.old ? 1 : 0.8});
  return o;
}

/* ── 손에 든 것(오른쪽) — 스승마다 큰 낱말을 보여 주는 물건 · 인자 = 살빛 ── */
const fan = (cx, cy, n, a0, step, d, f) => Array.from({length: n}, (_, i) => { const a = a0 + i * step, t = (a * Math.PI) / 180; return f(cx + d * Math.sin(t), cy - d * Math.cos(t), a, i); }).join('');
const IT2 = {
  ...IT,
  /** 붓다 — 연꽃(직접 알기) */
  lotus: s => OL('M94 118L94 93', '#4E9A54', 2) + fan(94, 93, 5, -56, 28, 8.5, (x, y, a, i) => E(x, y, 4.3, 9, i === 2 ? '#F7B5CB' : '#F39BBB', {...TH, transform: ROT(a, x, y)})) + E(94, 93.5, 8.5, 2.6, '#5DA04A', TH) + hand(92, 109, s),
  /** 공자 — 엮은 죽간(배운 것을 적은 대쪽) */
  slips: s => Array.from({length: 6}, (_, i) => R(79.5 + i * 5.2, 73, 4.8, 35, 1.2, i % 2 ? '#E2C27A' : '#D7B467', TH)).join('') + LN(78, 81, 112, 81, '#8A5A33', 1.7) + LN(78, 100, 112, 100, '#8A5A33', 1.7) + hand(95, 110, s),
  /** 소크라테스 — 물음 말풍선(그림 물음표 · 글자 아님) */
  ask: s => P('M79 71C79 62 87 57 96.5 57C106 57 114 62 114 71C114 80 106 85 96.5 85L90 85L83.5 92L84.5 84C81 82 79 77 79 71Z', WHITE)
    + P('M92 66.5C92 62.2 101 62.2 101 66.5C101 70 96.5 70.2 96.5 74.6', 'none', {stroke: '#8E1A5C', 'stroke-width': 2.6}) + C(96.5, 79.4, 1.7, '#8E1A5C', NS) + hand(84, 104, s),
  /** 장자 — 우물 밖 개구리 */
  frog: () => E(91, 101, 13, 9, '#7CC26B') + C(84, 91.5, 4.8, '#7CC26B') + C(98, 91.5, 4.8, '#7CC26B') + C(84, 91.5, 2, INK, NS) + C(98, 91.5, 2, INK, NS)
    + P('M85 102Q91 106.5 97 102', 'none', {'stroke-width': 1.6}) + E(81.5, 109, 4.2, 2.4, '#5DA04A', TH) + E(100.5, 109, 4.2, 2.4, '#5DA04A', TH),
  /** 원효 — 물 한 그릇(한마음) */
  bowl: s => el('g', {transform: 'translate(-5 -7)'}, P('M80 93L110 93C110 105 103 111 95 111C87 111 80 105 80 93Z', '#B98A5A') + E(95, 93, 15, 3.6, '#9FD4F2') + drop(95, 85) + hand(84, 110, s) + hand(106, 110, s)),
  /** 베이컨 — 손거울(마음이 비춘 모습을 의심) */
  mirror: s => OL('M95 97L95 118', WOOD, 3.4) + C(95, 84, 12.5, '#D9DEE6') + C(95, 84, 9, '#F2F6FB', TH) + P('M89.5 80C90.5 77 93.5 75.5 96.5 75.8', 'none', {stroke: WHITE, 'stroke-width': 2.2}) + hand(95, 108, s),
  /** 칸트 — 회중시계(날마다 같은 때) */
  watch: s => P('M95 63C89 63 86 67 87 71', 'none', {stroke: GOLD, 'stroke-width': 1.8}) + C(95, 72.5, 2.3, GOLD, TH) + C(95, 86, 11.5, GOLD) + C(95, 86, 8.4, '#FFFDF5', TH)
    + LN(95, 86, 95, 80.5, INK, 1.7) + LN(95, 86, 99.2, 88.4, INK, 1.7) + hand(93, 105, s),
  /** 아인슈타인 — 원자(상상) */
  atom: s => [0, 60, 120].map(a => E(96, 84, 15.5, 5.6, 'none', {stroke: '#4A6FD0', 'stroke-width': 2.1, transform: ROT(a, 96, 84)})).join('') + C(96, 84, 3.6, '#F2C14E', TH) + hand(93, 107, s),
  /** 아르키메데스 — 그리는 컴퍼스(재 보기) */
  compass: () => OL('M95 72L85 116', '#B9C3CF', 2.6) + OL('M95 72L106 116', '#B9C3CF', 2.6) + P('M88 104Q95.5 108 103 104', 'none', {stroke: '#9AA6B4', 'stroke-width': 1.6}) + C(95, 70, 3.6, GOLD, TH) + OL('M95 66L95 58', '#B9C3CF', 2),
  /** 사마천 — 붓과 종이(기록) */
  brush: s => el('g', {transform: 'translate(-6 -7)'}, R(78, 98, 32, 20, 2, PAPER) + P('M82 103.5L104 103.5M82 108.5L99 108.5M82 113.5L102 113.5', 'none', {stroke: '#B9A88A', 'stroke-width': 1.4})
    + OL('M110 63L95 95', '#8A5A33', 3) + P('M95 95L90.5 103.5L97.5 97Z', '#2A2630', TH) + hand(102, 80, s)),
  /** 세종 — 측우기(비를 재 물어 앎) */
  rainGauge: () => R(80, 108, 30, 9, 2, '#B7B0A6') + R(86, 79, 18, 30, 2, '#8FA3B8') + E(95, 79, 9, 2.6, '#BFD8EA') + LN(86, 89, 104, 89, INK, 1.2) + LN(86, 99, 104, 99, INK, 1.2)
    + drop(83, 71) + drop(97, 65) + drop(110, 73),
  /** 이순신 — 거북선(열두 척) */
  turtleShip: () => el('g', {transform: 'translate(-7 -12)'}, P('M73 109L117 109L111 119L79 119Z', '#8A5A33') + P('M77 109C79 95 108 95 112 109Z', '#5E8C6A')
    + [[83, 102], [90, 98], [97, 97], [104, 98], [110, 102]].map(([x, y]) => P(`M${x - 2} ${y + 1}L${x} ${y - 3.2}L${x + 2} ${y + 1}Z`, '#E7ECF1', TH)).join('')
    + C(71, 104.5, 4.6, '#C8452F') + C(69.8, 103.3, 1.1, INK, NS) + P('M67 122C75 117 81 121 89 117C97 121 103 117 111 121', 'none', {stroke: '#5BA9B0', 'stroke-width': 2.2})),
  /** 갈릴레오 — 망원경 */
  telescope: s => R(73, 88, 44, 9, 3, '#B8863B', {transform: ROT(-40, 95, 92.5)}) + R(84, 87.2, 4, 10.6, 1, '#7A5A2A', {...TH, transform: ROT(-40, 95, 92.5)}) + R(101, 87.2, 4, 10.6, 1, '#7A5A2A', {...TH, transform: ROT(-40, 95, 92.5)})
    + E(112, 78.5, 2.4, 5.4, '#8FD0F5', {...TH, transform: ROT(-40, 112, 78.5)}) + hand(86, 106, s),
  /** 다윈 — 공책과 연필(어긋난 사실을 바로 적기) */
  notebook: s => R(79, 75, 25, 33, 3, '#6B8E4E') + R(83, 79, 19, 25, 1.5, PAPER, TH) + P('M86.5 85L98.5 85M86.5 90.5L96.5 90.5M86.5 96L98.5 96', 'none', {stroke: '#B9A88A', 'stroke-width': 1.3})
    + OL('M110 70L101 100', '#E8B44C', 2.4) + P('M101 100L99.4 105.4L103 101.6Z', INK, TH) + hand(92, 110, s),
  /** 퀴리 — 빛나는 플라스크(끈기) */
  flask: () => P('M90 70L100 70L100 82L110 104C112 110 108 114 102 114L88 114C82 114 78 110 80 104L90 82Z', '#EAF6F4') + P('M84.6 97L105.4 97L110 104C112 110 108 114 102 114L88 114C82 114 78 110 80 104Z', '#7FE0B8', TH)
    + C(92, 106, 1.8, WHITE, NS) + C(99, 102, 1.4, WHITE, NS) + R(88.5, 66, 13, 5, 1.5, '#C9D2DC', TH) + [[84, 61], [106, 59], [96, 53]].map(([x, y]) => C(x, y, 2, '#8EEBC4', NS)).join(''),
  /** 손자 — 셈 막대 묶음(미리 셈) */
  rods: s => [-18, -9, 0, 9, 18].map((a, i) => { const t = (a * Math.PI) / 180; return OL(`M95 112L${r1(95 + 36 * Math.sin(t))} ${r1(112 - 36 * Math.cos(t))}`, i % 2 ? '#C99A3E' : '#E2C27A', 2.4); }).join('')
    + R(88, 98, 14, 5, 2, '#B5532F', TH) + hand(95, 110, s),
  /** 묵자 — 목수의 곱자(세 잣대) */
  square: () => el('g', {transform: 'translate(-6 -8)'}, P('M83 68L90 68L90 106L113 106L113 113L83 113Z', '#C9D2DC') + [75, 82, 89, 96].map(y => LN(83, y, 86.5, y, INK, 1.1)).join('') + [97, 104].map(x => LN(x, 113, x, 109.5, INK, 1.1)).join('')),
  /** 한비자 — 그루터기와 토끼 */
  rabbit: () => el('g', {transform: 'translate(-9 -10)'}, R(93, 106, 20, 13, 3, '#9C6B45') + E(103, 106, 10, 3, '#C99A6B') + E(103, 106, 5.5, 1.5, 'none', {stroke: '#9C6B45', 'stroke-width': 1})
    + E(80, 111, 9, 6.5, WHITE) + C(86, 102.5, 5.8, WHITE) + E(83.5, 92, 2.3, 7, WHITE, {transform: ROT(-10, 83.5, 92)}) + E(89, 92.5, 2.3, 7, WHITE, {transform: ROT(12, 89, 92.5)})
    + E(83.5, 92.5, 0.9, 4.2, '#F6B4C3', {...NS, transform: ROT(-10, 83.5, 92.5)}) + C(88, 101.5, 1.2, INK, NS) + C(91.3, 104, 1, '#F27C96', NS)),
  /** 정약용 — 펼친 책(뽑아 적기) */
  book: s => P('M75 86C83 82 90 83 95 87L95 112C90 108 83 107 75 111Z', PAPER) + P('M115 86C107 82 100 83 95 87L95 112C100 108 107 107 115 111Z', PAPER)
    + P('M79 92C84 90 88 90 91.5 91.5M79 98C84 96 88 96 91.5 97.5M98.5 91.5C102 90 106 90 111 92M98.5 97.5C102 96 106 96 111 98', 'none', {stroke: '#B9A88A', 'stroke-width': 1.3}) + hand(84, 113, s) + hand(106, 113, s),
  /** 데카르트 — 눈금 종이(쪼개기) */
  grid: s => R(78, 71, 32, 32, 2, WHITE) + [86, 94, 102].map(v => LN(v, 71, v, 103, '#C9D2DC', 1)).join('') + [79, 87, 95].map(v => LN(78, v, 110, v, '#C9D2DC', 1)).join('')
    + LN(78, 87, 110, 87, '#5A30B9', 1.8) + LN(94, 71, 94, 103, '#5A30B9', 1.8) + C(102, 79, 2.6, '#D9443F', TH) + hand(84, 108, s),
  /** 프랭클린 — 두 칸 종이(찬성 · 반대) */
  twoCol: s => R(78, 69, 34, 41, 2, '#FFFDF5') + LN(95, 73, 95, 106, INK, 1.4) + LN(80, 77, 110, 77, INK, 1.2)
    + [84, 91, 98].map(y => P(`M83 ${y}L89 ${y}M86 ${y - 3}L86 ${y + 3}`, 'none', {stroke: '#0F7A5C', 'stroke-width': 1.8})).join('') + [84, 91].map(y => LN(100, y, 106, y, '#C8452F', 1.8)).join('') + hand(84, 112, s),
  /** 애덤 스미스 — 쌓은 금화(값의 까닭) */
  coins: () => [0, 1, 2, 3].map(i => E(96, 112 - i * 5.2, 12, 4.2, GOLD, TH) + P(`M84 ${112 - i * 5.2}L84 ${115 - i * 5.2}Q96 ${120.5 - i * 5.2} 108 ${115 - i * 5.2}L108 ${112 - i * 5.2}`, '#D9A63A', TH)).join('') + E(96, 96.4, 6, 1.8, 'none', {stroke: '#B8862B', 'stroke-width': 1.2}),
  /** 퍼스 — 돋보기(알아보는 길) */
  lens: s => OL('M88 97L79 113', WOOD, 4) + C(97, 85, 12, '#CDEBFA', {'stroke-width': 5.5}) + C(97, 85, 12, 'none', {stroke: '#B8863B', 'stroke-width': 3}) + P('M90 81C91 77 94 75 98 75', 'none', {stroke: WHITE, 'stroke-width': 2}) + hand(83, 108, s),
  /** 리콴유 — 톱니바퀴(되는가) */
  gear: s => Array.from({length: 8}, (_, i) => R(92.4, 70, 5.2, 7.5, 1, '#7F8B99', {...TH, transform: ROT(i * 45, 95, 84)})).join('') + C(95, 84, 11, '#9AA6B4') + C(95, 84, 4.2, '#E7ECF1', TH) + hand(93, 105, s),
  /** 노자 — 호리병 단 지팡이(멈춤) */
  gourd: s => OL('M99 124L99 40', WOOD, 3.4) + C(99, 38, 4, WOOD) + LN(99, 47, 105, 53, '#8A5A33', 1.4) + C(106, 57, 4.2, '#E2B84A', TH) + C(107, 65.5, 6.2, '#E2B84A', TH) + hand(98, 97, s),
  /** 맹자 — 화분의 새싹(기다림) */
  sprout: () => P('M81 107L109 107L105.5 119L84.5 119Z', '#B5532F') + E(95, 107, 14, 3, '#7A4F2A') + OL('M95 106L95 88', '#4E9A54', 2.2)
    + E(88.5, 88, 6.5, 3.1, '#7DBB5A', {...TH, transform: ROT(-28, 88.5, 88)}) + E(101.5, 85, 6.5, 3.1, '#7DBB5A', {...TH, transform: ROT(28, 101.5, 85)}),
  /** 제갈량 — 깃털 부채(고요) */
  fan: s => OL('M96 120L96 99', '#8A5A33', 3) + fan(96, 99, 7, -54, 18, 13.5, (x, y, a) => E(x, y, 4.2, 12.5, WHITE, {stroke: '#9AA3B0', 'stroke-width': 1.4, transform: ROT(a, x, y)})) + C(96, 99, 3.2, GOLD, TH) + hand(95, 111, s),
  /** 왕양명 — 대나무(알고 행함) */
  bamboo: () => [[86, 3], [101, 2.6]].map(([x, w]) => OL(`M${x} 122L${x} 61`, JADE, w) + [75, 89, 103].map(y => LN(x - w - 1, y, x + w + 1, y, '#3E7F43', 1.4)).join('')).join('')
    + [[79, 70, -40], [108, 66, 40], [78, 93, -35], [109, 97, 35], [93.5, 59, -10]].map(([x, y, a]) => E(x, y, 7.4, 2.7, '#7DBB5A', {...TH, transform: ROT(a, x, y)})).join(''),
  /** 이황 — 매화 가지(그치지 않음) */
  plum: s => OL('M84 119C88 104 94 94 106 80', '#6B4532', 2.6) + OL('M95 97C101 95 106 97 110 101', '#6B4532', 1.8)
    + [[106, 80], [99, 89], [110, 101], [90.5, 104]].map(([x, y]) => flower(x, y, 2.9, '#FCE6EC', '#F2C14E')).join('') + hand(86, 111, s),
  /** 이이 — 끊어진 쇠사슬(옛 습관 끊기) */
  chain: s => [[80, 88], [100, 99]].map(([x, y]) => E(x, y, 10, 6, 'none', {'stroke-width': 7, transform: ROT(-28, x, y)}) + E(x, y, 10, 6, 'none', {stroke: '#7D8898', 'stroke-width': 4, transform: ROT(-28, x, y)})).join('')
    + P('M88.5 95.5L91.5 89.5M91 98.5L96 94M87.5 99.5L91.5 100.5', 'none', {stroke: '#F2B230', 'stroke-width': 2.4}) + hand(75, 96, s),
  /** 파스칼 — 셈하는 상자(바퀴 셋) */
  pascaline: () => R(78, 88, 34, 22, 3, '#C9A04A') + R(80, 84, 30, 5, 2, '#A8733F', TH) + [85, 95, 105].map(x => C(x, 99, 4.5, '#F7EBC8', TH) + LN(x, 99, x, 95.4, INK, 1.2)).join(''),
  /** 링컨 — 봉한 편지(안 보낸 편지) */
  letter: s => R(78, 80, 34, 24, 2, '#FFFDF5') + P('M78 80L95 94L112 80', 'none', {stroke: INK, 'stroke-width': 1.4}) + C(95, 94, 3.8, '#C8452F', TH) + hand(84, 109, s),
};
/* ── 곁에 있는 것(왼쪽) ── */
const cat = (x, y, c, eye) => E(x, y + 9, 9.5, 7.5, c) + P(`M${x - 6.5} ${y - 1.5}L${x - 5.5} ${y - 10.5}L${x - 1} ${y - 5}Z`, c) + P(`M${x + 6.5} ${y - 1.5}L${x + 5.5} ${y - 10.5}L${x + 1} ${y - 5}Z`, c)
  + C(x, y, 7, c) + C(x - 2.6, y - 0.4, 1.4, eye, NS) + C(x + 2.6, y - 0.4, 1.4, eye, NS) + P(`M${x - 1.2} ${y + 2.6}Q${x} ${y + 3.6} ${x + 1.2} ${y + 2.6}`, 'none', {stroke: eye, 'stroke-width': 1});
const EX2 = {
  /** 아르키메데스 — 튀는 물방울(유레카) */
  drops: () => drop(17, 82) + drop(26, 92) + drop(15, 101) + drop(29, 74),
  /** 덩샤오핑 — 누런 고양이와 검은 고양이 */
  cats: () => cat(27, 95, '#E8B44C', INK) + cat(93, 95, '#2F2629', '#F2D27E'),
};

/* ── 스승 서른아홉 — 살빛(s) · 머리빛(h) · 머리꼴(hs) · 수염(b · bc · mu 콧수염) · 눈(e) · 입(m) · 눈썹(br) · 늙음(old) · 몸(body · robe · drape · col 깃 · shirt · tie · badge)
       · 목(neck) · 쓴 것(hw) · 뒤(bk) · 귀(ear) · 안경(gl) · 든 것(it) · 곁(x) ── */
export const ART = Object.freeze({
  buddha: {s: 'c', h: '#2E3550', hs: 'snail', e: 'sleep', robe: '#E59A2F', drape: '#F2C14E', ear: 'long', bk: ['halo'], it: 'lotus'},
  confucius: {s: 'b', h: GRY, hs: 'short', b: 'long', old: 1, body: 'east', robe: '#2F4F7F', col: '#F2EBDD', hw: ['scholarCap'], it: 'slips'},
  socrates: {s: 'b', h: WHT, hs: 'bald', b: 'full', old: 1, m: 'open', robe: '#E9E2D0', drape: '#B9AA8F', it: 'ask'},
  plato: {s: 'b', h: '#9A8F86', hs: 'curly', b: 'full', robe: '#3F7BD8', drape: WHITE, it: 'torch'},
  zhuangzi: {s: 'b', h: BLK, hs: 'bun', b: 'short', e: 'happy', m: 'grin', body: 'east', robe: '#79B07A', col: '#F4F1EA', bk: ['butterfly'], it: 'frog'},
  wonhyo: {s: 'c', h: '#8C93A3', hs: 'shaved', e: 'happy', robe: '#8E8E96', drape: '#A5562D', it: 'bowl'},
  leonardo: {s: 'b', h: WHT, hs: 'long', b: 'long', old: 1, robe: '#5A6B8C', drape: '#C9A04A', hw: ['beret'], it: 'woodpecker'},
  bacon: {s: 'a', h: BRN, hs: 'short', b: 'short', br: 'stern', robe: '#2D2A35', drape: '#3B3743', neck: 'ruff', it: 'mirror'},
  kant: {s: 'a', h: WHT, hs: 'wig', body: 'suit', robe: '#3E5A7A', neck: 'cravat', it: 'watch'},
  einstein: {s: 'a', h: WHT, hs: 'wild', mu: 1, old: 1, m: 'grin', body: 'suit', robe: '#6E7380', it: 'atom'},
  aristotle: {s: 'b', h: DBR, hs: 'short', b: 'short', robe: '#F7F1E3', drape: '#9D6D1C', it: 'bird'},
  archimedes: {s: 'c', h: GRY, hs: 'curly', b: 'full', e: 'happy', m: 'open', robe: '#F09A3E', drape: WHITE, it: 'compass', x: ['drops']},
  simaqian: {s: 'b', h: BLK, hs: 'short', b: 'long', bc: '#3A3438', body: 'east', robe: '#8C2F2F', col: '#F2EBDD', hw: ['hanCap'], it: 'brush'},
  sejong: {s: 'b', h: BLK, hs: 'short', b: 'short', body: 'east', robe: '#C8312F', col: '#F2C14E', badge: GOLD, hw: ['iksun'], it: 'rainGauge'},
  yisunsin: {s: 'c', h: BLK, hs: 'short', b: 'full', br: 'stern', body: 'armor', armor: '#4E5566', robe: '#8C2F2F', drape: '#C8452F', hw: ['helmetK'], it: 'turtleShip'},
  galileo: {s: 'b', h: '#B8AFA5', hs: 'short', b: 'full', old: 1, robe: '#2D2A35', drape: '#7A2E3A', it: 'telescope'},
  newton: {s: 'a', h: '#E7E1D6', hs: 'long', body: 'suit', robe: '#5A3A2E', neck: 'cravat', it: 'apple'},
  dasan: {s: 'b', h: BLK, hs: 'short', b: 'long', bc: '#3A3438', body: 'hanbok', robe: '#F4F1EA', hw: ['gat'], it: 'book'},
  darwin: {s: 'a', h: WHT, hs: 'bald', b: 'long', old: 1, body: 'suit', robe: '#3A3D45', it: 'notebook'},
  curie: {s: 'a', h: '#6E5E58', hs: 'bun', body: 'suit', robe: '#2D2A35', shirt: '#F4F1EA', it: 'flask'},
  sunzi: {s: 'b', h: BLK, hs: 'bun', b: 'long', br: 'stern', body: 'armor', armor: '#B08D57', robe: '#5A30B9', drape: '#C8452F', hw: [['band', '#C8452F']], it: 'rods'},
  mozi: {s: 'c', h: BLK, hs: 'bun', b: 'short', m: 'flat', body: 'east', robe: '#8A7A5E', col: '#4A4356', it: 'square'},
  hanfeizi: {s: 'b', h: BLK, hs: 'short', b: 'short', br: 'stern', body: 'east', robe: '#3E6E8C', col: '#F2EBDD', hw: [['scholarCap', '#1E3A2E']], it: 'rabbit'},
  zhuxi: {s: 'b', h: GRY, hs: 'short', b: 'long', old: 1, body: 'east', robe: '#4A4356', col: '#F2EBDD', hw: ['mingHat'], it: 'scroll'},
  descartes: {s: 'a', h: '#3A2E2A', hs: 'long', b: 'goatee', mu: 1, body: 'suit', robe: '#2D2A35', neck: 'band', it: 'grid'},
  franklin: {s: 'a', h: GRY, hs: 'baldLong', gl: 1, body: 'suit', robe: '#8A5A3B', neck: 'cravat', it: 'twoCol'},
  adamsmith: {s: 'a', h: WHT, hs: 'wig', body: 'suit', robe: '#2F5D4E', neck: 'cravat', it: 'coins'},
  peirce: {s: 'a', h: DBR, hs: 'short', b: 'full', body: 'suit', robe: '#3A3D45', tie: '#8E1A5C', it: 'lens'},
  dengxiaoping: {s: 'b', h: BLK, hs: 'short', e: 'happy', m: 'grin', body: 'mao', robe: '#7A7F8A', x: ['cats']},
  leekuanyew: {s: 'b', h: '#4A4652', hs: 'short', br: 'stern', body: 'suit', robe: '#F4F1EA', it: 'gear'},
  laozi: {s: 'b', h: WHT, hs: 'bald', b: 'long', old: 1, e: 'happy', body: 'east', robe: '#C9B48A', col: '#7A6E62', it: 'gourd'},
  mencius: {s: 'b', h: BLK, hs: 'short', b: 'full', body: 'east', robe: '#2E5E4E', col: '#F2EBDD', hw: [['scholarCap', '#1F2A44']], it: 'sprout'},
  marcus: {s: 'b', h: BRN, hs: 'curly', b: 'full', robe: '#7B54C9', drape: '#F7F1E3', hw: ['laurel'], it: 'tablet'},
  zhugeliang: {s: 'a', h: BLK, hs: 'short', b: 'goatee', mu: 1, e: 'sleep', body: 'east', robe: '#E9E2D0', col: '#2F5D9E', hw: ['guanjin'], it: 'fan'},
  wangyangming: {s: 'b', h: BLK, hs: 'short', b: 'short', body: 'east', robe: '#4A6E8C', col: '#F2EBDD', hw: ['tallCap'], it: 'bamboo'},
  yihwang: {s: 'b', h: GRY, hs: 'short', b: 'long', old: 1, body: 'hanbok', robe: '#F4F1EA', hw: ['jeongja'], it: 'plum'},
  yii: {s: 'b', h: BLK, hs: 'short', b: 'short', body: 'hanbok', robe: '#E9EEF4', hw: ['yugeon'], it: 'chain'},
  pascal: {s: 'a', h: '#5B3A2B', hs: 'long', body: 'suit', robe: '#2D2A35', neck: 'band', it: 'pascaline'},
  lincoln: {s: 'b', h: BLK, hs: 'short', b: 'chin', br: 'soft', body: 'suit', robe: '#1E1C24', tie: '#1E1C24', hw: ['tophat'], it: 'letter'},
});

/* ── 사람 꼴 하나 ── */
function figureS(a) {
  const s = SKIN[a.s ?? 'b'], hc = a.h ?? BRN;
  const hw = (a.hw ?? []).map(k => (typeof k === 'string' ? HW2[k]() : HW2[k[0]](...k.slice(1))));
  const hair = HAIR2[a.hs ?? 'short'](hc);
  const noEars = hw.some(x => x.ears) || a.hs === 'long' || a.hs === 'wig';
  return (a.bk ?? []).map(k => BACK2[k]()).join('') + hw.map(x => x.b ?? '').join('') + (hair.b ?? '') + bodyS(a, s) + (a.neck ? NECK[a.neck]() : '')
    + (noEars ? '' : earsS(s, a.ear)) + E(60, 58, 24, 23, s) + faceS(a, hc) + (hair.f ?? '') + hw.map(x => x.f ?? '').join('')
    + (a.it ? IT2[a.it](s) : '') + (a.x ?? []).map(k => EX2[k](s)).join('');
}

/** 자료의 사람 차례 · 걸음(sage39.json — 그림 기계와 화면이 같은 자료를 봄) */
export const PEOPLE = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).people.map(p => ({id: p.id, step: p.step}));

/** 그림 하나(자료 이름) — 글자 없는 svg 글 */
export function svgOf(id) {
  const a = ART[id], p = PEOPLE.find(x => x.id === id);
  if (!a || !p) throw new Error('없는 이름 ' + id);
  const [bg, ring] = STEP_BG[p.step];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">`
    + `<defs><clipPath id="c"><circle cx="60" cy="60" r="56.5"/></clipPath></defs>`
    + el('circle', {cx: 60, cy: 60, r: 58, fill: bg}) + `<g clip-path="url(#c)" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${figureS(a)}</g>`
    + el('circle', {cx: 60, cy: 60, r: 57, fill: 'none', stroke: ring, 'stroke-width': 3.5}) + '</svg>\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const ids = PEOPLE.map(p => p.id), extra = Object.keys(ART).filter(k => !ids.includes(k));
  let bad = 0;
  if (extra.length || ids.some(id => !ART[id])) { console.log('자료와 그림 이름이 다름 — 그림만 ' + extra.join(',') + ' · 자료만 ' + ids.filter(id => !ART[id]).join(',')); process.exit(1); }
  if (!check) fs.mkdirSync(OUT_DIR, {recursive: true});
  for (const id of ids) {
    const f = path.join(OUT_DIR, id + '.svg'), s = svgOf(id);
    if (check) { if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s) { bad++; console.log('다름 ' + id); } } else fs.writeFileSync(f, s);
  }
  console.log(check ? (bad ? `그림 ${bad}장이 기계와 다름` : `그림 ${ids.length}장 모두 기계와 같음`) : `그림 ${ids.length}장을 씀 — ${OUT_DIR}`);
  process.exit(bad ? 1 : 0);
}
