#!/usr/bin/env node
/* 로마 신 72 캐릭터 그림 — 사장님 2026-10-31 07:32(+03) 「어 달면서 신들에 / 이미지도 캐릭터화해서 해」(docs/design/roman72-site-2026-10-31/order-1332.txt)
   신마다 새로 그린 얼굴 그림 하나(다른 그림을 베끼지 않음) — 동그라미 판(무리 여섯 색) · 큰 머리 · 신마다 이야기 속 물건 하나(번개 · 공작 깃 · 부엉이 …)
   만든 것 = site/next/roman-art/<번호>.svg(일흔둘) · 글자 없는 그림 · 글 속 style 없음(모양은 그림 속성만) · 바깥 그림 · 글꼴 · 스크립트 없음
   쓰는 법: node scripts/atlas11/next/roman_art.mjs          — 그림 파일 일흔둘을 다시 씀
            node scripts/atlas11/next/roman_art.mjs --check  — 파일이 이 기계가 그린 것과 같은지만 봄(다르면 1)
   검사 = scripts/atlas11/next/check_roman.mjs ①(같은지 · 크기 · 겹침 없음) */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GODS} from '../../../site/next/roman72.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = path.resolve(HERE, '../../../site/next/roman-art');
export const ART_URL = n => `/next/roman-art/${n}.svg`;

const INK = '#3A2430';
/** 무리 여섯 — [판 바탕, 테] (p-roman.css .rm --g1 ~ --g6 과 같은 빛 · 바탕은 옅게) */
export const GROUP_BG = Object.freeze({1: ['#F9DDE9', '#8E1A5C'], 2: ['#F6E7C6', '#9D6D1C'], 3: ['#D3EFE1', '#0F7A5C'], 4: ['#E4DAF9', '#5A30B9'], 5: ['#FADED0', '#B4451F'], 6: ['#D7E6F7', '#1F5FA8']});
const SKIN = {a: '#FFE4CF', b: '#F8CFAE', c: '#E8B48E', d: '#CB946D', g: '#E2EAF6'};
const GOLD = '#F4C54E', WOOD = '#A8733F', METAL = '#D3DBE4', LEAF = '#64B05E', WHITE = '#FFFFFF';
const BLK = '#2F2629', DBR = '#5B3A2B', BRN = '#8A5A3B', AUB = '#B5552E', GLD = '#E8B44C', BLD = '#F2D27E', WHT = '#F4F1EA', GRY = '#ADA9A6', SEA = '#5BA9B0', RED = '#C8452F';

/* ── 그리는 도구(글자 · style 없이 그림 속성만) ── */
const r1 = v => Math.round(v * 10) / 10;
const at = o => Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== false).map(([k, v]) => ` ${k}="${typeof v === 'number' ? r1(v) : v}"`).join('');
const el = (t, o = {}, inner = '') => (inner ? `<${t}${at(o)}>${inner}</${t}>` : `<${t}${at(o)}/>`);
const ST = {}; // 먹 테(빛 · 굵기 2 · 둥근 끝)는 그림 묶음(g)에 한 번 — 파일 크기를 줄임
const TH = {'stroke-width': 1.4};
const NS = {stroke: 'none'};
const P = (d, fill = 'none', o = {}) => el('path', {d, fill, ...ST, ...o});
const C = (cx, cy, r, fill, o = {}) => el('circle', {cx, cy, r, fill, ...ST, ...o});
const E = (cx, cy, rx, ry, fill, o = {}) => el('ellipse', {cx, cy, rx, ry, fill, ...ST, ...o});
const R = (x, y, w, h, rx, fill, o = {}) => el('rect', {x, y, width: w, height: h, rx, fill, ...ST, ...o});
const LN = (x1, y1, x2, y2, stroke = INK, w = 1.4) => el('line', {x1, y1, x2, y2, stroke, 'stroke-width': w});
/** 굵은 선 — 먹 테 아래 · 빛 위(막대 · 활 · 줄기) */
const OL = (d, color, w = 3.5) => P(d, 'none', {'stroke-width': w + 3}) + P(d, 'none', {stroke: color, 'stroke-width': w});
/** 좌우 뒤집기(가운데 x = 60) — M L C Q Z 만(쓰는 쪽이 A · H · V 를 안 씀) */
const MIR = d => { let i = 0; return d.replace(/-?\d*\.?\d+|[A-Za-z]/g, t => { if (/[A-Za-z]/.test(t)) { i = 0; return t; } const o = i % 2 === 0 ? r1(120 - +t) : +t; i++; return String(o); }); };
const ROT = (deg, x, y) => `rotate(${r1(deg)} ${r1(x)} ${r1(y)})`;
/** 타원 둘레 점(각도는 그림 좌표 — 270 = 위) · t = 접선 각 */
const arc = (cx, cy, rx, ry, a0, a1, n) => Array.from({length: n}, (_, i) => {
  const a = ((a0 + (a1 - a0) * (n === 1 ? 0.5 : i / (n - 1))) * Math.PI) / 180;
  return {x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), t: (Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180) / Math.PI, a};
});
const star = (cx, cy, R1, R2, n = 5) => { let d = ''; for (let i = 0; i < 2 * n; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, r = i % 2 ? R2 : R1; d += (i ? 'L' : 'M') + r1(cx + r * Math.cos(a)) + ' ' + r1(cy + r * Math.sin(a)); } return d + 'Z'; };
const flower = (x, y, s, petal, mid = '#FFD45A') => Array.from({length: 5}, (_, i) => { const a = ((i * 72 - 90) * Math.PI) / 180; return C(x + s * Math.cos(a), y + s * Math.sin(a), s, petal, TH); }).join('') + C(x, y, s * 0.62, mid, {'stroke-width': 1.2});
const drop = (x, y, fill = '#8FD0F5') => P(`M${x} ${y - 7}C${x + 3.6} ${y - 2} ${x + 3.6} ${y + 2} ${x} ${y + 2.4}C${x - 3.6} ${y + 2} ${x - 3.6} ${y - 2} ${x} ${y - 7}Z`, fill, TH);
const hand = (x, y, s) => C(x, y, 5.6, s, {'stroke-width': 1.8});
/** 이삭(줄기 끝 쪽에 낟알이 번갈아) */
function ear(x0, y0, x1, y1, grain = '#EDBE52') {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  let s = OL(`M${r1(x0)} ${r1(y0)}L${r1(x1)} ${r1(y1)}`, '#C99A3E', 1.8);
  for (let i = 0; i < 6; i++) { const t = 0.5 + i * 0.1, side = i % 2 ? 1 : -1, cx = x0 + dx * t - uy * side * 2.4, cy = y0 + dy * t + ux * side * 2.4; s += E(cx, cy, 3.2, 1.7, grain, {...TH, transform: ROT(ang + side * 35, cx, cy)}); }
  return s + E(x1 + ux * 1.5, y1 + uy * 1.5, 2.6, 1.6, grain, {...TH, transform: ROT(ang, x1 + ux * 1.5, y1 + uy * 1.5)});
}

/* ── 머리카락 — {b: 머리 뒤, f: 머리 앞} ── */
const HAIR = {
  short: c => ({f: P('M35.5 60C34 41 45 32 60 32C75 32 86 41 84.5 60C83 53 80 49 76 47C70 50 62 50 56 47C50 51 43 52 39.5 50C37.5 53 36.3 56 35.5 60Z', c)}),
  curly: c => {
    const top = arc(60, 52, 24, 21, 190, 350, 9).map(p => [p.x, p.y, 7.6]), front = [[46, 46, 6.2], [53.5, 44, 6.2], [61, 43.5, 6.2], [68.5, 44.5, 6.2], [75, 47, 6.2]], side = [[36.5, 57, 5.6], [83.5, 57, 5.6]];
    const all = [...side, ...top, ...front];
    return {f: all.map(([x, y, r]) => C(x, y, r, c, {'stroke-width': 4})).join('') + E(60, 45, 22, 12, c, NS) + all.map(([x, y, r]) => C(x, y, r, c, NS)).join('') + P('M50 38C52 35 55 34 58 34M64 37C66 35 69 35 71 36', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.35})};
  },
  long: c => ({
    b: P('M33 58C29 76 28 98 34 112L86 112C92 98 91 76 87 58C84 36 36 36 33 58Z', c),
    f: P('M37 56C31 70 31 90 36 102C40 104 44 102 45 98C40 86 40 72 42 59Z', c) + P(MIR('M37 56C31 70 31 90 36 102C40 104 44 102 45 98C40 86 40 72 42 59Z'), c)
      + P('M35 62C33 40 45 31 60 31C75 31 87 40 85 62C83 54 79 48 72 45C64 49 52 50 42 49C39.5 52 37 56 35 62Z', c),
  }),
  bun: c => ({f: C(60, 29.5, 9.5, c) + P('M35.5 60C34 41 45 32 60 32C75 32 86 41 84.5 60C82 51 76 46 68 45C64 47 56 47 52 45C44 46 38 51 35.5 60Z', c) + P('M53 29C55 26 58 25 61 25.5', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.4})}),
  child: c => ({f: P('M36 60C35 42 46 33 60 33C74 33 85 42 84 60C80 52 72 48 64 47C58 49 48 49 42 51C39 54 37 57 36 60Z', c) + P('M56 34C51 26 59 19 66 23C62 24.5 60 28 62 33Z', c)}),
  bald: c => ({f: P('M36.5 64C35 55 37 50 41 48C40.5 54 41 60 43 65Z', c) + P(MIR('M36.5 64C35 55 37 50 41 48C40.5 54 41 60 43 65Z'), c) + P('M63 39.5C67 38.5 71 40 73.5 43', 'none', {stroke: WHITE, 'stroke-width': 2.6, opacity: 0.8})}),
  wild: c => ({f: P('M35 62C30 52 33 44 38 40C36 34 42 30 46 31C48 26 56 26 58 29C62 25 70 27 71 31C76 29 82 34 81 39C86 43 88 52 85 62C82 54 78 50 72 48C66 51 58 51 52 49C46 51 40 54 35 62Z', c)}),
  none: () => ({}),
};
/* 수염 */
const BEARD = {
  full: 'M36.5 60C36 82 47 93 60 93C73 93 84 82 83.5 60C80 71 72 77 60 77C48 77 40 71 36.5 60Z',
  long: 'M36.5 60C35 86 46 106 60 108C74 106 85 86 83.5 60C80 71 72 77 60 77C48 77 40 71 36.5 60Z',
  short: 'M39 64C41 81 50 87 60 87C70 87 79 81 81 64C75 72 68 76 60 76C52 76 45 72 39 64Z',
};
const MUST = 'M51.5 72.5C54 69.5 58 69.5 60 71.5C62 69.5 66 69.5 68.5 72.5C65 74 62 73.5 60 72.5C58 73.5 55 74 51.5 72.5Z';

/* ── 머리에 쓰는 것 — {b: 뒤, f: 앞, ears: 귀를 덮나} ── */
function laurel(c, n = 6) {
  const stem = OL('M33.5 61C35 40 47 32 58 31.5', '#3E7F43', 1.6) + OL(MIR('M33.5 61C35 40 47 32 58 31.5'), '#3E7F43', 1.6);
  const leaf = (p, k) => E(p.x, p.y, 5.2, 2.5, c, {...TH, transform: ROT(p.t + (k % 2 ? 28 : -28), p.x, p.y)});
  return stem + arc(60, 57, 27, 25.5, 194, 262, n).map(leaf).join('') + arc(60, 57, 27, 25.5, 346, 278, n).map(leaf).join('');
}
function leafCrown(colors, rx = 5, ry = 3.2) {
  return arc(60, 56, 26.5, 25, 192, 348, 11).map((p, i) => E(p.x, p.y, rx, ry, colors[i % colors.length], {...TH, transform: ROT(p.t + (i % 2 ? 22 : -22), p.x, p.y)})).join('');
}
const crownD = 'M40 41L39 28L47 34L53 23L60 32L67 23L73 34L81 28L80 41Z';
const crown = (c, j) => P(crownD, c) + LN(40, 37.5, 80, 37.5, INK, 1.2) + C(60, 38.5, 2.6, j, TH) + C(48, 39, 1.8, '#5AA9E6', TH) + C(72, 39, 1.8, '#5AA9E6', TH) + C(53, 23.5, 1.7, j, TH) + C(67, 23.5, 1.7, j, TH);
const veilB = c => P('M28 66C26 36 42 25 60 25C78 25 94 36 92 66L98 114L22 114Z', c);
const veilF = c => P('M35.5 55C38 39 49 32 60 32C71 32 82 39 84.5 55C78 47 70 43 60 43C50 43 42 47 35.5 55Z', c);
const hoodB = c => P('M26 68C24 34 42 22 60 22C78 22 96 34 94 68L100 116L20 116Z', c);
const hoodF = c => P('M34 60C35.5 38 47.5 29 60 29C72.5 29 84.5 38 86 60C80 49 71 44.5 60 44.5C49 44.5 40 49 34 60Z', c);
function helmet(m, crest) {
  const crestD = 'M51 31C49 15 54 7 60 7C66 7 71 15 69 31Z';
  const top = crest === 'fire'
    ? P('M51 31C46 22 50 14 55 9C55 15 58 17 60 12C61 6 66 3 69 2C67 8 70 13 72 15C75 20 72 27 69 31Z', '#F48C2E') + P('M55 30C53 24 56 19 59 16C59 20 61 21 63 18C64 22 66 26 65 30Z', '#FFD458', NS)
    : crest ? P(crestD, crest) + P('M55 30C54 18 57 12 60 11M65 30C66 18 63 12 60 11', 'none', {stroke: WHITE, 'stroke-width': 1.4, opacity: 0.55}) : '';
  return top + R(55, 26.5, 10, 5.5, 2, m, TH)
    + P('M34 60C32 37 45 27 60 27C75 27 88 37 86 60L86.5 67L79 67L78.5 54C72 49.5 48 49.5 41.5 54L41 67L33.5 67Z', m)
    + P('M60 28.5L60 49.5', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.35}) + P('M38 58C39 50 42 46 46 44', 'none', {stroke: WHITE, 'stroke-width': 2, opacity: 0.6});
}
const WING = 'M44 35C38 32 30 27 25 19C28 20.5 31 21 33 21C31 23.5 32 25.5 35 26.5C33 28.5 35 31 39 31.5C38 33.5 41 34.5 44 35Z', WINGF = 'M39 31C35 29.5 31 26.5 28 23';
const wing = fill => P(WING, fill) + P(WINGF, 'none', {stroke: '#B9C3CF', 'stroke-width': 1.2}) + P(MIR(WING), fill) + P(MIR(WINGF), 'none', {stroke: '#B9C3CF', 'stroke-width': 1.2});
const brimHat = (c, wings) => (wings ? wing(WHITE) : '')
  + P('M41 40C41 24 79 24 79 40Z', c) + E(60, 40.5, 31, 6.4, c) + P('M42 37.5C50 35 70 35 78 37.5', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.4});
const band = (c, y = 0) => P(`M35.5 ${51 + y}C46 ${47 + y} 74 ${47 + y} 84.5 ${51 + y}L84.5 ${55.5 + y}C74 ${51.5 + y} 46 ${51.5 + y} 35.5 ${55.5 + y}Z`, c, TH);

const HW = {
  laurel: () => ({f: laurel(LEAF)}),
  goldLaurel: () => ({f: laurel('#F2C14E')}),
  oak: () => ({f: OL('M33.5 61C35 40 47 32 58 31.5', '#3E7F43', 1.6) + OL(MIR('M33.5 61C35 40 47 32 58 31.5'), '#3E7F43', 1.6)
    + [...arc(60, 56.5, 27.5, 26, 196, 262, 5), ...arc(60, 56.5, 27.5, 26, 344, 278, 5)].map((p, i) => E(p.x, p.y, 5.8, 3.6, i % 2 ? '#7DBB5A' : '#5DA04A', {...TH, transform: ROT(p.t + (i % 2 ? 20 : -20), p.x, p.y)})).join('')
    + E(36.5, 47, 2.6, 3.2, '#B7793B', TH) + P('M33.6 45C34.5 42.5 38.5 42.5 39.4 45Z', '#7A4F2A', TH) + E(83.5, 47, 2.6, 3.2, '#B7793B', TH) + P('M80.6 45C81.5 42.5 85.5 42.5 86.4 45Z', '#7A4F2A', TH)}),
  crown: () => ({f: crown(GOLD, '#D6455D')}),
  darkCrown: () => ({f: crown('#77708A', '#A884F0')}),
  seaCrown: () => ({f: crown('#62C6CC', '#F47C6A')}),
  diadem: () => ({f: P('M38 47C45 33 75 33 82 47L77.5 48.5C71 41 49 41 42.5 48.5Z', GOLD) + C(60, 37.6, 3.2, '#3FA7C9', TH)}),
  pearls: () => ({f: arc(60, 55, 25.5, 23.5, 198, 342, 11).map(p => C(p.x, p.y, 2.3, WHITE, TH)).join('') + C(60, 31.5, 3.2, '#FFD6E2', TH)}),
  veil: c => ({b: veilB(c), f: veilF(c), ears: 1}),
  hood: c => ({b: hoodB(c), f: hoodF(c), ears: 1}),
  helmet: (m, crest) => ({f: helmet(m, crest), ears: 1}),
  wingedCap: () => ({f: brimHat('#E9B949', true)}),
  travelHat: () => ({f: brimHat('#DCC08A', false) + P('M41.5 36.5C50 34 70 34 78.5 36.5L78.6 39.4C70 37 50 37 41.4 39.4Z', '#9B6B45', TH)}),
  workCap: () => ({f: P('M37 49C36 30 47 19 60 19C73 19 84 30 83 49Z', '#8C5A3C') + band('#6B4430', -2)}),
  phrygian: () => ({f: P('M37 51C35 31 45 21 58 20C66 19 74 22 78 28C82 23 89 25 88 32C86 30 82 30 80 32C84 38 84 45 83 51Z', '#D9443F') + band('#A9302E')}),
  apex: () => ({f: OL('M60 30L60 13', '#8A5A33', 2.4) + C(60, 12, 3.4, WHITE, TH) + P('M37 51C37 34 47 28 60 28C73 28 83 34 83 51Z', '#F2EBDD') + band('#C9B48A')}),
  turret: () => ({f: P('M39 45L39 29L45 29L45 33L51 33L51 29L57 29L57 33L63 33L63 29L69 29L69 33L75 33L75 29L81 29L81 45Z', '#D8B26A') + P('M56.5 45L56.5 39.5C56.5 35.5 63.5 35.5 63.5 39.5L63.5 45Z', '#8A6A3A', TH) + R(43.5, 36, 4, 4, 1, '#8A6A3A', TH) + R(72.5, 36, 4, 4, 1, '#8A6A3A', TH)}),
  flowerCrown: colors => ({f: arc(60, 56, 26.5, 25, 196, 344, 8).map((p, i) => (i % 2 ? '' : E(p.x, p.y + 1.5, 4.5, 2.2, LEAF, {...TH, transform: ROT(p.t, p.x, p.y + 1.5)})) + flower(p.x, p.y, 3, colors[i % colors.length])).join('')}),
  leafCrown: colors => ({f: leafCrown(colors)}),
  grapes: () => {
    const bunch = (x, y) => [[x - 4, y], [x, y], [x + 4, y], [x - 2, y + 4], [x + 2, y + 4], [x, y + 8]].map(([a, b]) => C(a, b, 2.7, '#7E4DB8', TH)).join('');
    return {f: arc(60, 55.5, 26.5, 24.5, 198, 342, 7).map((p, i) => E(p.x, p.y, 6, 3.8, i % 2 ? '#7DBB5A' : '#5DA04A', {...TH, transform: ROT(p.t + (i % 2 ? 15 : -15), p.x, p.y)})).join('') + bunch(37, 47) + bunch(83, 47)};
  },
  wheatCrown: () => ({f: arc(60, 58, 24, 23, 222, 318, 5).map(p => ear(p.x, p.y, 60 + 39 * Math.cos(p.a), 58 + 37 * Math.sin(p.a))).join('') + band('#E2A847', -6)}),
  reeds: () => ({f: arc(60, 58, 23, 22, 212, 328, 7).map((p, i) => { const L1 = i % 2 ? 15 : 19, tx = p.x + L1 * Math.cos(p.a), ty = p.y + L1 * Math.sin(p.a), nx = -Math.sin(p.a) * 2.6, ny = Math.cos(p.a) * 2.6;
    return P(`M${r1(p.x - nx)} ${r1(p.y - ny)}Q${r1((p.x + tx) / 2 - nx * 1.2)} ${r1((p.y + ty) / 2 - ny * 1.2)} ${r1(tx)} ${r1(ty)}Q${r1((p.x + tx) / 2 + nx * 1.2)} ${r1((p.y + ty) / 2 + ny * 1.2)} ${r1(p.x + nx)} ${r1(p.y + ny)}Z`, i % 2 ? '#8CC97A' : '#6DB35F', TH); }).join('') + band('#4E9A8C', -5)}),
  pineCrown: () => { let d = ''; for (let i = 0; i <= 22; i++) { const a = ((190 + (160 * i) / 22) * Math.PI) / 180, r = i % 2 ? 24 : 31; d += (i ? 'L' : 'M') + r1(60 + r * Math.cos(a)) + ' ' + r1(57 + r * 0.94 * Math.sin(a)); }
    return {f: P(d + 'L' + r1(60 + 22 * Math.cos((350 * Math.PI) / 180)) + ' ' + r1(57 + 20 * Math.sin((350 * Math.PI) / 180)) + 'C70 38 50 38 ' + r1(60 + 22 * Math.cos((190 * Math.PI) / 180)) + ' ' + r1(57 + 20 * Math.sin((190 * Math.PI) / 180)) + 'Z', '#3E7D4F') + E(42, 37, 3, 4, '#9A6234', {...TH, transform: ROT(-30, 42, 37)}) + E(78, 37, 3, 4, '#9A6234', {...TH, transform: ROT(30, 78, 37)})}; },
  crescentSmall: () => ({f: P('M53.5 41C54.5 48 65.5 48 66.5 41C63 44.5 57 44.5 53.5 41Z', '#F2F5FA', TH)}),
  starAbove: () => ({f: P(star(60, 19, 9, 4), '#FFD54A')}),
  goatHorns: () => ({f: P('M46 37C41 30 41 21 47 16C47 22 49 28 52 34Z', '#F1E6CF') + P(MIR('M46 37C41 30 41 21 47 16C47 22 49 28 52 34Z'), '#F1E6CF')}),
  woodTuft: () => ({f: P('M53 32C51 20 59 13 68 14C63 18 63 25 65 31Z', '#E2363F')}),
  wolfHood: () => ({b: hoodB('#8E8A93'), ears: 1,
    f: P('M34 34L38 10L52 25Z', '#8E8A93') + P('M38.5 27L40 15.5L47.5 24Z', '#F2B8C6', TH) + P(MIR('M34 34L38 10L52 25Z'), '#8E8A93') + P(MIR('M38.5 27L40 15.5L47.5 24Z'), '#F2B8C6', TH)
      + hoodF('#A9A5AE') + C(52, 36, 1.9, INK, NS) + C(68, 36, 1.9, INK, NS) + E(60, 40.5, 3, 2.1, INK, NS)}),
  sleepWings: () => { const w = 'M39 55C33 52 26 47 22 38C26 40 29 40 31 40C29 43 30 45 33 46C31 48 33 50 36 50C35 52 37 54 39 55Z', f = 'M35 51C31 49 27 46 25 42';
    return {f: P(w, '#EEF1F8') + P(f, 'none', {stroke: '#B9C3CF', 'stroke-width': 1.1}) + P(MIR(w), '#EEF1F8') + P(MIR(f), 'none', {stroke: '#B9C3CF', 'stroke-width': 1.1})}; },
  waterTiara: () => ({f: OL('M40 46C50 41 70 41 80 46', '#BFD3E6', 2) + drop(50, 40) + drop(60, 37) + drop(70, 40)}),
  lily: () => ({f: [0, 60, 120, 180, 240, 300].map(a => E(79 + 4.6 * Math.cos((a * Math.PI) / 180), 43 + 4.6 * Math.sin((a * Math.PI) / 180), 4.6, 2.2, a % 120 ? '#FFFFFF' : '#FBD3E0', {...TH, transform: ROT(a, 79 + 4.6 * Math.cos((a * Math.PI) / 180), 43 + 4.6 * Math.sin((a * Math.PI) / 180))})).join('') + C(79, 43, 2.4, '#F7C948', TH)}),
  starPin: () => ({f: P(star(71, 27, 5.6, 2.4), '#FFD54A', TH)}),
  infula: () => ({f: band('#D64A5A', -3)}),
  band: c => ({f: band(c)}),
  flameTop: () => ({f: P('M60 26C53 20 55 12 60 5C61.5 11 67 14 65 20C64.5 23.5 62.5 26 60 26Z', '#F48C2E', TH) + P('M60 25C57.5 21.5 58.5 17.5 60 14C61 17.5 63 19.5 62.4 22.5C62 24 61 25 60 25Z', '#FFD458', NS)}),
};

/* ── 뒤 장식(몸 뒤) ── */
const BACK = {
  rays: () => Array.from({length: 14}, (_, i) => { const a = (i * 2 * Math.PI) / 14 - Math.PI / 2, b = 0.2, p = (r, d) => `${r1(60 + r * Math.cos(a + d))} ${r1(57 + r * Math.sin(a + d))}`; return P(`M${p(27, -b)}L${p(46, 0)}L${p(27, b)}Z`, i % 2 ? '#FFD54A' : '#FFB938', {'stroke-width': 1.6}); }).join(''),
  shell: () => P('M60 64L20 52C22 16 98 16 100 52Z', '#FBD3DE') + arc(60, 64, 40, 44, 197, 343, 9).map(p => LN(60, 64, p.x, p.y, '#E79AB0', 1.6)).join('') ,
  crescentBig: () => P('M31 18C31 52 89 52 89 18C82 40 38 40 31 18Z', '#EEF2F8') + C(96, 22, 2, '#FFE27A', TH) + C(22, 30, 1.6, '#FFE27A', TH),
  wingsSmall: () => { const w = 'M42 98C30 86 16 86 12 96C18 97 19 101 23 103C18 105 19 110 24 112L44 110Z'; return P(w, WHITE) + P(MIR(w), WHITE) + P('M38 100C30 96 24 96 20 99M38 106C32 104 27 105 24 107', 'none', {stroke: '#C9D2DC', 'stroke-width': 1.2}) + P(MIR('M38 100C30 96 24 96 20 99M38 106C32 104 27 105 24 107'), 'none', {stroke: '#C9D2DC', 'stroke-width': 1.2}); },
  wingsBig: () => { const w = 'M44 94C28 66 8 58 3 70C11 74 8 80 14 84C6 88 9 94 16 96C9 100 12 106 20 108L46 104Z', f = 'M40 92C30 80 20 74 12 74M40 98C30 92 22 90 16 90M42 102C34 100 26 100 20 102'; return P(w, WHITE) + P(MIR(w), WHITE) + P(f, 'none', {stroke: '#C9D2DC', 'stroke-width': 1.3}) + P(MIR(f), 'none', {stroke: '#C9D2DC', 'stroke-width': 1.3}); },
  butterfly: () => { const u = 'M50 94C36 70 14 64 10 80C8 92 26 99 47 98Z', l = 'M48 101C32 102 18 108 22 118C30 122 42 116 50 106Z'; return P(u, '#BBA8F4') + P(MIR(u), '#BBA8F4') + P(l, '#A3D6F4') + P(MIR(l), '#A3D6F4') + C(26, 82, 4, WHITE, {...NS, opacity: 0.75}) + C(94, 82, 4, WHITE, {...NS, opacity: 0.75}) + C(30, 111, 2.6, WHITE, {...NS, opacity: 0.75}) + C(90, 111, 2.6, WHITE, {...NS, opacity: 0.75}); },
};

/* ── 손에 든 것(오른쪽) — 인자 = 살빛 ── */
const IT = {
  thunder: s => P('M98 56L84 86L94 86L86 116L108 80L97 80L106 56Z', GOLD) + P('M99 60L89 82', 'none', {stroke: WHITE, 'stroke-width': 1.6, opacity: 0.7}) + hand(91, 93, s),
  feather: s => OL('M86 118C90 102 95 88 100 76', '#6E8B3D', 2.2) + P('M90 104C84 100 82 96 82 92M93 96C87 92 86 88 86 84M96 88C102 86 106 84 108 80', 'none', {stroke: '#7CBF8E', 'stroke-width': 1.4}) + E(101, 66, 10, 13, '#43B07E') + E(101, 67.5, 6.4, 8.4, '#2F78C4', TH) + E(101, 69, 3.3, 4.3, '#22305F', NS) + hand(90, 106, s),
  owl: () => P('M82 86L84 78L89.5 84Z', '#8E5E3C') + P('M102 86L100 78L94.5 84Z', '#8E5E3C') + E(92, 97, 12.5, 14, '#9C6B45') + E(92, 102, 7.6, 8.6, '#EBD3AE', TH) + C(87, 91.5, 4.5, WHITE, TH) + C(97, 91.5, 4.5, WHITE, TH) + C(87.7, 92, 2.2, INK, NS) + C(96.3, 92, 2.2, INK, NS) + P('M90.3 95.5L93.7 95.5L92 99Z', '#F1A23A', TH) + P('M86 110L86 113M90 110.5L90 113.5M94 110.5L94 113.5M98 110L98 113', 'none', {stroke: '#E79B3A', 'stroke-width': 1.8}),
  spear: s => OL('M97 124L97 40', WOOD, 3.6) + P('M97 16C102 24 102 34 97 42C92 34 92 24 97 16Z', METAL) + P('M97 20L97 38', 'none', {stroke: '#9AA6B4', 'stroke-width': 1.2}) + R(93.5, 40, 7, 4, 1.5, GOLD, TH) + hand(96, 98, s),
  dove: s => hand(92, 106, s) + P('M80 98L72 93L76 102Z', WHITE) + P('M80 98C82 88 94 85 104 89C109 91 111 95 109 99C101 106 89 106 80 98Z', WHITE) + P('M86 96C89 88 99 87 102 93C98 98 91 99 86 96Z', '#E4E9F2', TH) + C(105, 86, 5.2, WHITE) + C(106.6, 85, 1.1, INK, NS) + P('M109.6 85.8L114 87L109.6 88.4Z', '#F2A33A', TH),
  lyre: s => OL('M85 113C78 96 81 79 87 71', GOLD, 4) + OL('M109 113C116 96 113 79 107 71', GOLD, 4) + LN(92, 78, 92, 112) + LN(97, 78, 97, 113) + LN(102, 78, 102, 112) + OL('M85 77L109 77', GOLD, 3.2) + OL('M85 111C92 117 102 117 109 111', GOLD, 4) + C(87, 70, 2.4, GOLD, TH) + C(107, 70, 2.4, GOLD, TH) + hand(84, 104, s),
  bow: s => OL('M101 50C82 68 82 102 101 120', WOOD, 3.4) + LN(101, 50, 101, 120, INK, 1.2) + OL('M82 86L111 86', WOOD, 2) + P('M111 82L118 86L111 90Z', METAL, TH) + P('M82 82L86 86L82 90L78 86Z', '#E15B5B', TH) + hand(88, 87, s),
  caduceus: s => OL('M97 124L97 30', GOLD, 3.2) + OL('M92 36C102 40 102 46 92 50C82 54 102 60 102 64', '#5EAA5A', 2.2) + OL('M102 36C92 40 92 46 102 50C112 54 92 60 92 64', '#5EAA5A', 2.2) + C(92, 35, 2.6, '#5EAA5A', TH) + C(102, 35, 2.6, '#5EAA5A', TH) + P('M97 26C90 24 84 18 84 12C89 16 93 17 97 19C101 17 105 16 110 12C110 18 104 24 97 26Z', WHITE, TH) + C(97, 22, 3.2, GOLD, TH) + hand(96, 100, s),
  trident: s => OL('M97 124L97 34', '#E2B84A', 3.4) + OL('M88 22L88 34C88 41 106 41 106 34L106 22', GOLD, 3) + OL('M97 14L97 40', GOLD, 3) + P('M85 24L88 15L91 24Z', GOLD, TH) + P('M94 16L97 7L100 16Z', GOLD, TH) + P('M103 24L106 15L109 24Z', GOLD, TH) + hand(96, 100, s),
  hammer: s => OL('M86 118L101 80', WOOD, 4) + P('M88 77L105 67L112 79L95 89Z', '#8E98A6') + P('M91 79L105 71', 'none', {stroke: WHITE, 'stroke-width': 1.4, opacity: 0.6}) + hand(91, 105, s),
  flameBowl: s => P('M93 96C81 87 87 72 93 63C94 74 105 78 102 89C101 93 97 96 93 96Z', '#F48C2E') + P('M93 95C88 89 90.5 83 93 78C94 84 98.5 87 97 91.5C96.5 93.5 95 95 93 95Z', '#FFD458', NS) + P('M78 97L108 97C108 108 100 114 93 114C86 114 78 108 78 97Z', '#D9A54A') + LN(80, 101, 106, 101, '#A8733F', 1.4) + hand(93, 116, s),
  wheat: s => ear(92, 118, 83, 72) + ear(92, 118, 93, 66) + ear(92, 118, 103, 72) + R(85.5, 99, 13, 5, 2, '#B5532F', TH) + hand(91, 110, s),
  sickle: s => P('M92 64C110 60 120 80 108 96C111 82 104 72 92 72Z', METAL) + OL('M106 94L96 118', WOOD, 4) + hand(100, 110, s),
  cornucopia: s => [[112, 82], [115, 86], [110, 86]].map(([x, y]) => C(x, y, 2.6, '#7E4DB8', TH)).join('') + C(98, 80, 4.4, '#76B85B', TH) + C(104, 84, 5.4, '#E2504F', TH) + C(110, 91, 4.6, '#F59A3A', TH)
    + P('M76 118C74 102 86 90 104 86C109 87 112 92 110 98C97 100 89 107 87 119Z', '#E2A847') + P('M82 108C88 101 95 97 104 95M80 114C84 108 89 104 96 101', 'none', {stroke: '#B07A2A', 'stroke-width': 1.4}) + hand(85, 110, s),
  pipes: s => Array.from({length: 5}, (_, i) => R(83 + i * 5.6, 78, 5.4, 36 - i * 4.5, 2, '#D9A85B', TH)).join('') + R(81.5, 88, 30, 5, 2, '#9B5A2E', TH) + hand(86, 112, s),
  pine: s => OL('M84 118L104 72', '#8A5A33', 3.2) + [0.25, 0.4, 0.55, 0.7, 0.85].map(t => { const x = 84 + 20 * t, y = 118 - 46 * t; return LN(x, y, x - 8, y - 4, '#3F8A4E', 2) + LN(x, y, x + 6, y - 8, '#3F8A4E', 2); }).join('') + E(103, 69, 5.5, 7.5, '#9A6234') + P('M98.5 67L107.5 67M98 71L108 71M99 75L107 75', 'none', {stroke: INK, 'stroke-width': 1.1, opacity: 0.5}) + hand(90, 105, s),
  crook: s => OL('M97 124L97 36C97 22 113 22 113 33C113 40 106 40 106 35', WOOD, 3.6) + hand(96, 100, s),
  key: s => C(95, 72, 8, 'none', {'stroke-width': 6.5}) + C(95, 72, 8, 'none', {stroke: GOLD, 'stroke-width': 3.4}) + OL('M95 80L95 117', GOLD, 3.4) + OL('M95 106L103 106L103 111', GOLD, 2.8) + OL('M95 114L101 114', GOLD, 2.8) + hand(94, 94, s),
  sack: () => ear(90, 90, 85, 74) + ear(94, 90, 94, 70) + ear(98, 90, 103, 74) + P('M79 120C75 105 81 93 87 88L101 88C107 93 113 105 109 120Z', '#C9A46E') + OL('M85 90L103 90', '#8A5A33', 2.4) + P('M88 102C90 106 94 108 98 106', 'none', {stroke: '#9B7A48', 'stroke-width': 1.4}),
  torch: s => P('M98.5 70C86 62 91 46 98.5 38C100 50 110 54 107 64C106 68 103 70 98.5 70Z', '#F48C2E') + P('M98.5 69C94 64 95.5 58 98.5 53C99.5 58 103.5 60 102.6 64.5C102 67 100.5 69 98.5 69Z', '#FFD458', NS) + P('M91 78L106 78L104 70L93 70Z', '#8E8E9C') + P('M92 116L95.5 78L101.5 78L99 116Z', WOOD) + hand(96, 100, s),
  woodpecker: s => hand(92, 106, s) + P('M80 103L71 109L77 99Z', '#2E2E36') + P('M78 100C80 90 92 86 100 89L104 92C100 100 90 106 78 100Z', '#2E2E36') + P('M84 95C89 91.5 95 91.5 99 94', 'none', {stroke: WHITE, 'stroke-width': 2.2}) + P('M86 100C92 99 98 96 102 93C100 99 94 103 86 100Z', '#F1EDE4', TH)
    + C(102, 84, 6.5, '#2E2E36') + P('M96.5 82C97 76 103 74.5 108 78C105 79 101 80 96.5 82Z', '#E2363F', TH) + E(103.5, 87, 3, 1.9, WHITE, NS) + C(104, 83, 1.4, WHITE, NS) + P('M108 84L118 82.5L108 86.8Z', '#B9B2A6', TH),
  bouquet: s => [[86, 80], [94, 74], [102, 80], [96, 86]].map(([x, y]) => OL(`M93 110L${x} ${y}`, '#4E9A54', 1.6)).join('') + E(88, 92, 4.5, 2.2, LEAF, {...TH, transform: ROT(-40, 88, 92)}) + E(99, 92, 4.5, 2.2, LEAF, {...TH, transform: ROT(40, 99, 92)})
    + flower(86, 78, 3.2, '#FF8FB1') + flower(103, 79, 3.2, '#F9A8D4') + flower(95, 71, 3.4, WHITE, '#F7C948') + flower(95, 85, 3, '#FFC94D', '#E46A2E') + P('M93 101C86 97 84 105 93 103C102 105 100 97 93 101Z', '#E85C8A', TH) + hand(93, 109, s),
  apple: s => C(94, 86, 10, '#E2474F') + P('M88 81C89.5 78.5 92 77.5 94 77.8', 'none', {stroke: WHITE, 'stroke-width': 2, opacity: 0.75}) + OL('M94 76.5L95.5 71', '#7A4A2A', 1.6) + P('M95.5 73C99 68 105 69.5 106 72.5C101.5 75.5 98 75.5 95.5 73Z', '#6CB65A', TH) + hand(91, 99, s),
  fruitBasket: () => P('M87 95C83 89 86 83 89 79C92 83 96 89 92 95Z', '#B6D35A', TH) + LN(89, 79, 90, 75, '#7A4A2A', 1.6) + [[98, 88], [101.5, 91], [95, 91.5], [99, 94.5]].map(([x, y]) => C(x, y, 3, '#8B5CC9', TH)).join('') + C(105, 91, 5, '#F59A3A', TH)
    + P('M78 96L110 96L105 116L83 116Z', '#C08A4E') + P('M84 102L104 102M85 108L103 108M90 96L91 116M98 96L97 116', 'none', {stroke: '#8A5A33', 'stroke-width': 1.2}) + R(77, 93, 34, 5, 2.5, WOOD, TH),
  cup: s => E(94, 80, 12.5, 3, '#7B3FA0') + P('M81.5 80L106.5 80C106.5 93 101 98 94 98C87 98 81.5 93 81.5 80Z', GOLD) + OL('M82 83C73 82 74 95 84 93', GOLD, 2.4) + OL('M106 83C115 82 114 95 104 93', GOLD, 2.4) + P('M91.5 98L96.5 98L98 107L90 107Z', GOLD, TH) + E(94, 109, 9, 2.6, GOLD, TH) + hand(94, 103, s),
  wheatShield: () => ear(84, 120, 92, 66) + C(101, 98, 13, '#D6A24C') + C(101, 98, 8.6, 'none', {stroke: '#A8733F', 'stroke-width': 1.6}) + C(101, 98, 3.6, GOLD, TH),
  oar: s => OL('M97 124L97 46', WOOD, 3.2) + P('M97 14C104 20 104 40 97 48C90 40 90 20 97 14Z', '#C08A4E') + P('M97 20L97 42', 'none', {stroke: '#8A5A33', 'stroke-width': 1.2}) + hand(96, 98, s),
  pitcher: () => drop(84, 74) + drop(80, 84) + OL('M104 86C115 86 115 104 106 107', '#D9845A', 3) + P('M84 120C79 108 81 96 88 90L88 83C86 81 86.5 77 90 77L101 77C104.5 77 105 81 103 83L103 90C110 96 112 108 107 120Z', '#D9845A') + P('M83 104L108 104', 'none', {stroke: '#A8552F', 'stroke-width': 1.6}),
  scroll: s => R(82, 72, 22, 38, 2, '#FFF4D6') + E(93, 72, 13, 4, '#F0DEB0') + E(93, 110, 13, 4, '#F0DEB0') + P('M86 81L100 81M86 87L98 87M86 93L100 93M86 99L95 99', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.7}) + hand(84, 104, s),
  bird: s => hand(90, 105, s) + P('M84 98L76 102L81 94Z', '#7DAE52', TH) + C(91, 94, 8, '#9CCB64') + P('M86 92C90 89 96 91 96 95C92 98 88 97 86 92Z', '#6E9E44', TH) + C(98, 86, 5.6, '#9CCB64') + C(99.6, 85, 1.2, INK, NS) + P('M103.4 85.4L108 86.6L103.4 88Z', '#F2A33A', TH),
  baby: s => E(92, 98, 14, 9.5, '#FFF1D8', {transform: ROT(-18, 92, 98)}) + P('M84 104C90 96 98 92 104 94M82 98C88 92 94 90 98 90', 'none', {stroke: '#E3C99A', 'stroke-width': 1.4}) + C(101, 89, 6.6, s) + P('M98 89Q99.5 90.6 101 89M102.6 89Q104 90.6 105.4 89', 'none', {stroke: INK, 'stroke-width': 1.3}) + E(103.5, 92, 1.8, 1, '#F49AAB', {...NS, opacity: 0.7}) + P('M95.5 85C97 81 104 80 106.5 84Z', '#FFD9E4', TH) + hand(84, 106, s),
  sunOrb: s => Array.from({length: 10}, (_, i) => { const a = (i * Math.PI) / 5; return LN(94 + 11.5 * Math.cos(a), 88 + 11.5 * Math.sin(a), 94 + 16 * Math.cos(a), 88 + 16 * Math.sin(a), '#F2A33A', 2.4); }).join('') + C(94, 88, 9, '#FFCF48') + hand(92, 102, s),
  star: s => OL('M95 96L90 120', '#C9D2DC', 2.6) + P(star(96, 86, 10.5, 4.6), '#FFE27A') + hand(92, 108, s),
  horn: s => P('M80 112C82 99 92 84 109 76C112 80 110 86 104 90C97 96 93 104 91 114Z', GOLD) + P('M100 80C104 81 107 83 108 86', 'none', {stroke: '#B07A2A', 'stroke-width': 1.4}) + E(108.5, 79, 3.6, 4.6, '#B04A5A', {...TH, transform: ROT(35, 108.5, 79)}) + hand(86, 110, s),
  amphora: () => OL('M89 81C81 80 81 90 87 92', '#C8693F', 2.4) + OL('M99 81C107 80 107 90 101 92', '#C8693F', 2.4) + P('M88 74L100 74L99 80C108 86 109 103 99 114L89 114C79 103 80 86 89 80Z', '#C8693F') + P('M83 94L105 94M84 100L104 100', 'none', {stroke: '#8A3F22', 'stroke-width': 1.6}) + R(86.5, 71, 15, 4, 1.5, '#A8552F', TH),
  patera: s => P('M94 84C90 80 91.5 76 94 72C94.8 75.5 97.8 77 97 80.6C96.6 82.4 95.5 84 94 84Z', '#F48C2E', TH) + E(94, 89, 15, 5, GOLD) + E(94, 88, 10, 2.8, '#E8B43D', TH) + hand(94, 97, s),
  violets: s => [[88, 80], [97, 74], [103, 84], [93, 88]].map(([x, y]) => OL(`M93 112L${x} ${y}`, '#4E9A54', 1.4)).join('') + flower(88, 80, 2.8, '#9B6BD6') + flower(97, 74, 3, '#B48AE6') + flower(103, 84, 2.8, '#8A5CC9') + flower(93, 88, 2.6, '#C3A3F0') + hand(93, 108, s),
  beans: () => E(101, 64, 3.8, 2.6, '#6B4532', {...TH, transform: ROT(-20, 101, 64)}) + E(109, 74, 3.8, 2.6, '#6B4532', {...TH, transform: ROT(25, 109, 74)}) + E(99, 79, 3.8, 2.6, '#6B4532', {...TH, transform: ROT(60, 99, 79)}) + P('M106 60C108 62 109 64 109 66M113 68C115 70 115 72 114 74', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.45}),
  herbs: () => [[-28, 86, 84], [-8, 92, 80], [12, 98, 81], [30, 104, 86]].map(([a, x, y]) => E(x, y, 3, 7, a % 2 ? '#7DBB5A' : '#5DA04A', {...TH, transform: ROT(a, x, y)})).join('') + C(103, 91, 4.4, '#6DB35F') + C(104.5, 90, 1, INK, NS) + P('M107 92L110 93', 'none', {stroke: '#E2363F', 'stroke-width': 1.2})
    + P('M80 96L108 96L104 114L84 114Z', '#C79A5A') + P('M84 102L104 102M85 108L103 108', 'none', {stroke: '#8A5A33', 'stroke-width': 1.2}),
  tablet: s => R(80, 72, 26, 34, 3, WOOD) + R(84, 76, 18, 26, 1.5, '#5C4636', TH) + P('M87 82L99 82M87 88L97 88M87 94L99 94', 'none', {stroke: '#EAD9B6', 'stroke-width': 1.5}) + OL('M109 66L99 90', '#C9D2DC', 2.2) + hand(99, 92, s),
  bident: s => OL('M97 124L97 40', '#5A536A', 3.4) + OL('M90 22L90 34C90 40 104 40 104 34L104 22', '#9C97B0', 3) + P('M87 24L90 15L93 24Z', '#9C97B0', TH) + P('M101 24L104 15L107 24Z', '#9C97B0', TH) + hand(96, 100, s),
  pomegranate: s => C(94, 88, 10.5, '#C93A52') + P('M89 79L89.5 74L92.5 77.5L94 73L95.5 77.5L98.5 74L99 79Z', '#C93A52', TH) + P('M88 84C89 81.5 91 80.5 93 80.5', 'none', {stroke: WHITE, 'stroke-width': 2, opacity: 0.7}) + hand(92, 100, s),
  cupidBow: s => OL('M106 64C96 76 96 100 106 112', WOOD, 3) + LN(106, 64, 106, 112, INK, 1.2) + OL('M80 104L104 81', WOOD, 1.8) + P('M106 75C106 71.5 110.5 71.5 110.5 75C110.5 78 106 81 106 81C106 81 101.5 78 101.5 75C101.5 71.5 106 71.5 106 75Z', '#F05A7E', TH) + P('M80 104L76 104L80 100M80 104L80 108L84 104', 'none', {stroke: '#E15B5B', 'stroke-width': 1.6}) + hand(92, 93, s),
  lamp: s => P('M110 88C106 84 108 79 110 75C111 79 115 82 113 86C112.5 87.5 111.5 88 110 88Z', '#F48C2E', TH) + OL('M79 98C73 96 73 90 79 90', '#D9A25A', 2.2) + P('M78 100C78 92 90 90 99 92L110 89C113 91 111 96 106 96C104 101 96 105 88 105C83 105 78 103 78 100Z', '#D9A25A') + C(91, 95, 2.2, '#8A5A33', TH) + hand(90, 108, s),
  poppy: s => OL('M90 120C92 106 92 94 94 84', '#5DAA5E', 2.2) + C(89, 79, 5.2, '#E5484D', TH) + C(99, 79, 5.2, '#E5484D', TH) + C(94, 73.5, 5.2, '#E5484D', TH) + C(94, 84, 5, '#E5484D', TH) + C(94, 79, 3, '#2B1E24', TH) + hand(91, 104, s),
  handshake: s => P('M62 118L79 99L87 107L70 126Z', WHITE) + P('M124 116L107 97L99 105L116 124Z', '#7FA7E0')
    + P('M79 100C82 93 90 90 97 92L101 94L95 103C90 106 83 105 79 100Z', s) + P('M107 97C105 91 97 88 90 91L87 95C92 94 96 96 98 100C100 104 104 103 107 97Z', s)
    + P('M92 92.5L95.5 97M95.5 91.5L99 96M99 91.5L102 95.5', 'none', {'stroke-width': 1.2}) + P('M88 93C88.5 88.5 93 87 96 89', 'none', {'stroke-width': 1.6}),
  heart: s => P('M94 82C94 74 106 72 107 82C108 90 98 96 94 100C90 96 80 90 81 82C82 72 94 74 94 82Z', '#EE5A79') + P('M85 80C86 77 88 76 90 76.5', 'none', {stroke: WHITE, 'stroke-width': 2, opacity: 0.75}) + hand(94, 104, s),
  olive: s => OL('M84 118C90 102 97 88 107 72', '#7B6A3A', 2.8) + [[90, 104, -60], [95, 94, 40], [99, 87, -50], [103, 79, 35], [106, 72, -40]].map(([x, y, a]) => E(x + (a > 0 ? 5 : -5), y, 5.2, 2.2, '#8FB46A', {...TH, transform: ROT(a, x + (a > 0 ? 5 : -5), y)})).join('') + C(96, 100, 2.4, '#4F6B2E', TH) + C(103, 85, 2.4, '#4F6B2E', TH) + hand(88, 110, s),
  bud: s => OL('M92 120C93 106 94 94 94 84', '#5DAA5E', 2.2) + E(88, 100, 5, 2.2, LEAF, {...TH, transform: ROT(-35, 88, 100)}) + E(100, 96, 5, 2.2, LEAF, {...TH, transform: ROT(35, 100, 96)}) + P('M94 66C86 74 87 86 94 88C101 86 102 74 94 66Z', '#F48FB1') + P('M89 84C91 86 93 87 94 88C95 87 97 86 99 84C97 88 91 88 89 84Z', LEAF, TH) + hand(93, 107, s),
  bowlSnake: s => OL('M90 96C84 86 100 84 97 76C95 71 91 72 91 68', '#5DAA5E', 3.4) + E(92, 66, 4, 3, '#5DAA5E') + C(93.5, 65.5, 0.9, INK, NS) + P('M95.5 67L99 68.5', 'none', {stroke: '#E2363F', 'stroke-width': 1.2}) + P('M80 96L108 96C106 104 100 108 94 108C88 108 82 104 80 96Z', GOLD) + hand(94, 112, s),
  stork: () => OL('M96 104L94 120', '#E0544F', 1.8) + OL('M101 104L101 120', '#E0544F', 1.8) + E(98, 98, 11, 7.5, WHITE) + P('M87 98C90 104 98 106 104 103C98 102 92 101 87 98Z', '#2B2B33', TH) + OL('M105 94C109 86 107 79 103 74', WHITE, 3.2) + C(103, 72, 4.6, WHITE) + P('M106.5 71L117 73.5L106.5 74.6Z', '#E8743B', TH) + C(104, 71, 1.1, INK, NS),
  scepter: s => OL('M97 124L97 36', GOLD, 3.4) + C(97, 32, 5, GOLD) + C(97, 32, 2, '#D6455D', TH) + C(97, 24.5, 2.4, GOLD, TH) + hand(96, 98, s),
  parazonium: s => P('M97.5 60L102.5 60L102.5 96L100 101L97.5 96Z', METAL) + P('M100 63L100 94', 'none', {stroke: '#9AA6B4', 'stroke-width': 1.2}) + R(92, 95, 16, 4, 2, GOLD, TH) + R(97.5, 99, 5, 11, 1.5, '#7A4A2A', TH) + C(100, 112, 3.6, GOLD, TH) + hand(100, 104, s),
  wreath: s => C(95, 84, 10, 'none', {'stroke-width': 5.6}) + C(95, 84, 10, 'none', {stroke: '#5FA65A', 'stroke-width': 3}) + Array.from({length: 10}, (_, i) => { const a = (i * Math.PI) / 5, x = 95 + 10 * Math.cos(a), y = 84 + 10 * Math.sin(a); return E(x, y, 3.6, 1.8, LEAF, {...TH, transform: ROT((a * 180) / Math.PI + 90 + (i % 2 ? 25 : -25), x, y)}); }).join('') + P('M92 94L88 106L93 102L95 107L97 94Z', '#E85C5C', TH) + hand(104, 97, s),
  capStaff: s => OL('M97 124L97 34', WOOD, 3.2) + P('M87 34C86 18 108 18 107 34Z', '#EFE8DA') + R(86, 31, 22, 5, 2, '#C9433E', TH) + hand(96, 100, s),
  wheel: s => C(94, 92, 14, '#FFF0C9', {'stroke-width': 6.5}) + C(94, 92, 14, 'none', {stroke: '#E7B04A', 'stroke-width': 3.4}) + Array.from({length: 6}, (_, i) => { const a = (i * Math.PI) / 3; return LN(94 + 3.6 * Math.cos(a), 92 + 3.6 * Math.sin(a), 94 + 12.4 * Math.cos(a), 92 + 12.4 * Math.sin(a), '#C98F35', 2); }).join('') + C(94, 92, 3.6, GOLD, TH) + hand(83, 104, s),
  scales: s => OL('M94 114L94 73', GOLD, 2.8) + OL('M78 78L110 78', GOLD, 2.8) + C(94, 71, 3, GOLD, TH) + LN(78, 78, 73, 93, INK, 1.1) + LN(78, 78, 83, 93, INK, 1.1) + LN(110, 78, 105, 93, INK, 1.1) + LN(110, 78, 115, 93, INK, 1.1)
    + P('M71 93C71 99 85 99 85 93Z', GOLD, TH) + P('M103 93C103 99 117 99 117 93Z', GOLD, TH) + R(87, 112, 14, 4, 2, GOLD, TH) + hand(94, 104, s),
  shield: () => C(99, 97, 15.5, '#D6A24C') + C(99, 97, 11, 'none', {stroke: '#A8733F', 'stroke-width': 1.8}) + P(star(99, 97, 6.4, 2.7), '#FFF1B8', TH),
  cane: s => OL('M98 124L98 70C98 60 87 60 87 69', WOOD, 3.4) + hand(97, 92, s),
  oxhide: s => { let d = ''; for (let i = 0; i <= 48; i++) { const t = (i / 48) * 5 * Math.PI, r = 1.5 + t * 0.85; d += (i ? 'L' : 'M') + r1(95 + r * Math.cos(t)) + ' ' + r1(92 + r * Math.sin(t)); } return OL(d, '#C8915A', 2.6) + hand(108, 104, s); },
  twins: s => C(88, 93, 6, s) + C(100, 93, 6, s) + P('M85 93Q86.5 94.6 88 93M89.4 93Q90.9 94.6 92.4 93M97 93Q98.5 94.6 100 93M101.4 93Q102.9 94.6 104.4 93', 'none', {stroke: INK, 'stroke-width': 1.2}) + P('M85.5 88C86.5 85.5 89.5 85 91 87M97.5 88C98.5 85.5 101.5 85 103 87', 'none', {stroke: DBR, 'stroke-width': 1.8})
    + P('M77 96L111 96C109 109 101 114 94 114C87 114 79 109 77 96Z', '#C79A5A') + P('M80 102L108 102M83 108L105 108M88 96L88 113M100 96L100 113', 'none', {stroke: '#8A5A33', 'stroke-width': 1.2}) + OL('M77 96L111 96', WOOD, 2.2),
  ancile: () => P('M94 68C105 68 109 77 102 85C109 93 105 104 94 104C83 104 79 93 86 85C79 77 83 68 94 68Z', '#D6A24C') + LN(94, 69.5, 94, 102.5, '#A8733F', 1.6) + C(94, 77, 1.8, GOLD, TH) + C(94, 86, 1.8, GOLD, TH) + C(94, 95, 1.8, GOLD, TH),
  sword: s => P('M98 46L103 46L103 94L100.5 99L98 94Z', METAL) + P('M100.5 49L100.5 92', 'none', {stroke: '#9AA6B4', 'stroke-width': 1.2}) + R(92, 93, 17, 4.5, 2, '#C9433E', TH) + R(98, 97.5, 5, 11, 1.5, '#7A4A2A', TH) + C(100.5, 110.5, 3.6, GOLD, TH) + hand(100.5, 103, s),
  staff: s => OL('M98 124L98 40', WOOD, 3.4) + C(98, 38, 4, WOOD) + hand(97, 96, s),
  ring: s => C(95, 86, 8, 'none', {'stroke-width': 6}) + C(95, 86, 8, 'none', {stroke: GOLD, 'stroke-width': 3.2}) + C(95, 77, 4, '#E2363F') + P('M93.5 75.5L95 74.5', 'none', {stroke: WHITE, 'stroke-width': 1.2}) + hand(94, 100, s),
};

/* ── 곁에 있는 것 ── */
const EX = {
  sheep: () => { const w = [[25, 98, 8], [33, 94, 8.5], [41, 98, 8], [32, 104, 8.5], [23, 105, 7], [41, 105, 7]];
    return w.map(([x, y, r]) => C(x, y, r, WHITE, {'stroke-width': 4})).join('') + w.map(([x, y, r]) => C(x, y, r, WHITE, NS)).join('') + E(42.5, 90.5, 3.4, 2, '#5A4A4E', TH) + E(53.5, 90.5, 3.4, 2, '#5A4A4E', TH) + E(48, 95, 6.4, 7.6, '#5A4A4E') + C(45.8, 94, 1.2, WHITE, NS) + C(50.2, 94, 1.2, WHITE, NS) + E(48, 99.5, 2, 1.2, '#F2B8C6', NS); },
  wolfPup: () => P('M20 98L22 86L30 94Z', '#8E8A93') + P('M46 98L44 86L36 94Z', '#8E8A93') + P('M18 114C16 100 24 92 33 92C42 92 50 100 48 114Z', '#8E8A93') + E(33, 106, 7, 5, '#CFCBD3', TH) + E(33, 103, 2.6, 1.8, INK, NS) + C(28, 99, 1.4, INK, NS) + C(38, 99, 1.4, INK, NS),
  soot: () => E(73, 73, 3.2, 1.6, '#5A5550', {...NS, opacity: 0.4}) + E(47, 75, 2.4, 1.3, '#5A5550', {...NS, opacity: 0.35}),
  wisps: () => P('M20 74C24 70 20 66 24 62M101 58C97 54 101 50 97 46M16 50C19 47 16 44 19 41', 'none', {stroke: '#AFC3E0', 'stroke-width': 2}),
};

/* ── 사람 꼴 하나 ── */
function body(a, s) {
  const robe = a.robe ?? '#8EC5F0', drape = a.drape ?? WHITE;
  let o = P('M14 122C16 101 33 90 60 90C87 90 104 101 106 122Z', robe);
  if (a.body === 'armor') {
    const m = a.armor ?? '#D9C07A';
    o += P('M33 122C33 106 44 97 60 97C76 97 87 106 87 122Z', m) + P('M60 99L60 122M46 108C51 105 69 105 74 108', 'none', {stroke: INK, 'stroke-width': 1.3, opacity: 0.5}) + P('M27 100C38 93 47 92 54 95L52 106C44 104 36 106 29 112Z', drape, TH);
  } else o += P('M27 100C38 93 47 92 54 95L88 122L68 122Z', drape, {'stroke-width': 1.8});
  return o + R(54, 76, 12, 14.5, 3, s, {'stroke-width': 1.8}) + P('M52 90L60 98.5L68 90Z', s, {'stroke-width': 1.6});
}
function ears(s, pointy) {
  if (pointy) return P('M38 58C32 56 26 50 26 46C31 47 35 50 39 53Z', s) + P(MIR('M38 58C32 56 26 50 26 46C31 47 35 50 39 53Z'), s);
  return E(36.5, 62, 4.6, 5.6, s) + E(83.5, 62, 4.6, 5.6, s) + P('M35.5 59.5C37.5 60.5 37.5 63.5 35.5 64.5M84.5 59.5C82.5 60.5 82.5 63.5 84.5 64.5', 'none', {stroke: INK, 'stroke-width': 1.1, opacity: 0.5});
}
function face(a, hc) {
  const bc = a.bc ?? hc, dy = a.b ? 4.5 : 0;
  let o = E(45.5, 68.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.6}) + E(74.5, 68.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.6});
  if (a.b) o += P(BEARD[a.b], bc) + (a.b !== 'short' ? P(MUST, bc, TH) : '');
  const m = a.m ?? 'smile';
  o += m === 'open' ? P(`M55.5 ${70 + dy}Q60 ${78 + dy} 64.5 ${70 + dy}Z`, '#8C3442', {'stroke-width': 1.6})
    : m === 'grin' ? P(`M53.5 ${69.5 + dy}Q60 ${77 + dy} 66.5 ${69.5 + dy}`, 'none', {'stroke-width': 2.1})
      : m === 'flat' ? P(`M56.5 ${71.5 + dy}L63.5 ${71.5 + dy}`, 'none')
        : m === 'o' ? E(60, 72 + dy, 2, 2.5, '#8C3442', TH)
          : P(`M56 ${70.5 + dy}Q60 ${74.5 + dy} 64 ${70.5 + dy}`, 'none');
  const e = a.e ?? 'dot', small = a.old;
  const dot = (x, y) => E(x, y, small ? 2.5 : 3.1, small ? 3 : 3.9, INK, NS) + C(x + 1.1, y - 1.5, small ? 0.9 : 1.15, WHITE, NS);
  const happy = x => P(`M${x - 3.4} 63.5Q${x} 58.8 ${x + 3.4} 63.5`, 'none', {'stroke-width': 2.3});
  const sleep = x => P(`M${x - 3.4} 61.5Q${x} 65.5 ${x + 3.4} 61.5`, 'none', {'stroke-width': 2.3});
  o += e === 'happy' ? happy(51) + happy(69) : e === 'sleep' ? sleep(51) + sleep(69) : e === 'wink' ? dot(51, 62) + happy(69) : dot(51, 62) + dot(69, 62);
  if (a.br === 'stern') o += P('M46 55.5L55.5 58M74 55.5L64.5 58', 'none', {'stroke-width': 2.4});
  if (a.br === 'soft' || a.old) o += P('M46.5 55.5Q51 52.8 55.5 55.5M64.5 55.5Q69 52.8 73.5 55.5', 'none', {stroke: a.old ? bc : INK, 'stroke-width': a.old ? 3 : 2, opacity: a.old ? 1 : 0.8});
  return o;
}
function figure(a) {
  const s = SKIN[a.s ?? 'b'], hc = a.h ?? BRN;
  const hw = (a.hw ?? []).map(k => (typeof k === 'string' ? HW[k]() : HW[k[0]](...k.slice(1))));
  const hair = HAIR[a.hs ?? 'short'](hc);
  const noEars = hw.some(x => x.ears) || a.hs === 'long';
  return (a.bk ?? []).map(k => BACK[k]()).join('') + hw.map(x => x.b ?? '').join('') + (hair.b ?? '') + body(a, s)
    + (noEars ? '' : ears(s, a.ear === 'pointy')) + E(60, 58, 24, 23, s) + face(a, hc) + (hair.f ?? '') + hw.map(x => x.f ?? '').join('')
    + (a.it ? IT[a.it](s) : '') + (a.x ?? []).map(k => EX[k](s)).join('');
}

/* ── 남다른 꼴 셋 ── */
const SP = {
  /** 야누스 — 앞뒤 두 얼굴(왼쪽 = 수염 난 옛 얼굴 · 오른쪽 = 젊은 얼굴) */
  janus: a => {
    const s = SKIN[a.s ?? 'b'], hc = a.h ?? '#6E6A73', bc = '#ECE8E2';
    const blush = x => E(x, 66, 3.4, 2, '#F49AAB', {...NS, opacity: 0.6});
    return body(a, s)
      + P('M29 55L21.5 62.5L29 66Z', s) + E(46, 59, 18, 20.5, s) + P('M28.5 64C27 77 34 85 43 85C40.5 81 39 77 39 73C35 75 30.5 71 28.5 64Z', bc) + P('M27.5 68.5C30 67 33.5 67 36 68.5C33.5 70 30 70 27.5 68.5Z', bc, TH)
      + E(34.5, 57.5, 2.7, 3.4, INK, NS) + C(33.6, 56.2, 0.95, WHITE, NS) + blush(39) + P('M33.5 54L38.5 55.5', 'none', {stroke: bc, 'stroke-width': 2.6})
      + P('M91 55L98.5 62.5L91 66Z', s) + E(74, 59, 18, 20.5, s) + E(85.5, 57.5, 2.7, 3.4, INK, NS) + C(86.4, 56.2, 0.95, WHITE, NS) + blush(81) + P('M84 69Q88 71.5 91 68.5', 'none', {'stroke-width': 1.8})
      + P('M30 54C28 38 40 30 52 32C56 29 64 29 68 32C80 30 92 38 90 54C86 47 82 44 76 43C70 46 66 50 64 58L64 78L56 78L56 58C54 50 50 46 44 43C38 44 34 47 30 54Z', hc) + P('M60 33L60 76', 'none', {stroke: INK, 'stroke-width': 1.3, opacity: 0.45})
      + OL('M106 124L106 52', WOOD, 3) + C(106, 50, 3.6, GOLD, TH);
  },
  /** 테르미누스 — 경계 돌 기둥에 얼굴 */
  stone: () => P('M34 124L34 46C34 26 46 18 60 18C74 18 86 26 86 46L86 124Z', '#BDB7AE') + E(45, 92, 4.5, 2.6, '#A39C92', NS) + E(74, 102, 5, 3, '#A39C92', NS) + E(70, 34, 3.4, 2, '#A39C92', NS) + E(48, 110, 3, 1.8, '#A39C92', NS)
    + P('M43 27C47 19 55 17 61 19C67 17 75 21 77 27C71 24 66 25 60 23C54 25 48 24 43 27Z', '#7DAA55', TH) + P('M60 46L60 82', 'none', {stroke: INK, 'stroke-width': 1.2, opacity: 0.25})
    + E(45.5, 66.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.55}) + E(74.5, 66.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.55}) + E(51, 59, 3.1, 3.9, INK, NS) + C(52.1, 57.5, 1.15, WHITE, NS) + E(69, 59, 3.1, 3.9, INK, NS) + C(70.1, 57.5, 1.15, WHITE, NS) + P('M56 70L64 70', 'none', {'stroke-width': 2.2})
    + P('M26 124L31 112L35 124M85 124L89 112L94 124', 'none', {stroke: '#5DA04A', 'stroke-width': 2.6}),
  /** 레무레스 — 떠도는 넋(콩을 던져 쫓음) */
  ghost: () => E(28, 86, 6.5, 4.4, '#F4F7FF', {transform: ROT(-25, 28, 86)}) + E(92, 80, 6.5, 4.4, '#F4F7FF', {transform: ROT(25, 92, 80)}) + P('M30 124L30 62C30 36 44 24 60 24C76 24 90 36 90 62L90 124Z', '#F4F7FF')
    + P('M38 50C40 40 46 35 52 33', 'none', {stroke: '#D9E2F2', 'stroke-width': 3})
    + E(45.5, 66.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.55}) + E(74.5, 66.5, 4.2, 2.4, '#F49AAB', {...NS, opacity: 0.55}) + E(51, 58, 3.4, 4.4, INK, NS) + C(52.2, 56.4, 1.2, WHITE, NS) + E(69, 58, 3.4, 4.4, INK, NS) + C(70.2, 56.4, 1.2, WHITE, NS) + E(60, 70, 2.6, 3.2, '#8C3442', TH)
    + IT.beans(),
};

/* ── 신 일흔둘 — 살빛(s) · 머리빛(h) · 머리꼴(hs) · 수염(b) · 눈(e) · 입(m) · 옷(robe · drape) · 쓴 것(hw) · 뒤(bk) · 든 것(it) · 곁(x) ── */
export const ART = Object.freeze({
  1: {s: 'b', h: WHT, hs: 'curly', b: 'full', old: 1, robe: '#7B54C9', drape: GOLD, hw: ['oak'], it: 'thunder'},
  2: {s: 'a', h: DBR, hs: 'long', robe: '#3F7BD8', drape: '#F3E3B0', hw: [['veil', '#FFFFFF'], 'diadem'], it: 'feather'},
  3: {s: 'b', h: BRN, hs: 'long', robe: '#7F8F3A', drape: '#E9DDB8', hw: [['helmet', '#C9D2DC', '#2BA39A']], it: 'owl'},
  4: {s: 'c', h: BLK, hs: 'short', b: 'short', br: 'stern', robe: '#D9443F', drape: GOLD, body: 'armor', armor: '#F0BE4F', hw: [['helmet', '#F0BE4F', '#D9443F']], it: 'spear'},
  5: {s: 'a', h: GLD, hs: 'long', robe: '#F28DB2', drape: WHITE, bk: ['shell'], hw: ['pearls'], it: 'dove'},
  6: {s: 'b', h: GLD, hs: 'curly', robe: WHITE, drape: GOLD, hw: ['laurel'], it: 'lyre'},
  7: {s: 'b', h: AUB, hs: 'bun', robe: '#4FA36B', drape: '#E9DDB8', hw: ['crescentSmall'], it: 'bow'},
  8: {s: 'c', h: BRN, hs: 'short', m: 'grin', robe: '#F09A3E', drape: WHITE, hw: ['wingedCap'], it: 'caduceus'},
  9: {s: 'c', h: SEA, hs: 'curly', b: 'long', old: 1, robe: '#2F86C9', drape: '#8FD0F5', hw: ['seaCrown'], it: 'trident'},
  10: {s: 'd', h: BLK, hs: 'short', b: 'full', robe: '#9B6B45', drape: '#6B4430', hw: ['workCap'], it: 'hammer', x: ['soot']},
  11: {s: 'a', h: BRN, hs: 'short', robe: '#F7F1E3', drape: '#E7D7B0', hw: [['veil', '#FFFFFF'], 'infula'], it: 'flameBowl'},
  12: {s: 'b', h: GLD, hs: 'long', robe: '#E3A23B', drape: '#FFF1C9', hw: ['wheatCrown'], it: 'wheat'},
  13: {sp: 'janus', s: 'b', h: '#6E6A73', robe: '#8C6A4E', drape: '#E9DDB8'},
  14: {s: 'c', h: DBR, hs: 'short', b: 'short', robe: '#F7F1E3', drape: '#8E3B9E', hw: ['starAbove'], it: 'spear'},
  15: {s: 'b', h: WHT, hs: 'none', b: 'long', old: 1, robe: '#7A6E62', drape: '#B9AA8F', hw: [['hood', '#8C8178']], it: 'sickle'},
  16: {s: 'c', h: DBR, hs: 'long', robe: '#5E9F57', drape: '#E3C27A', hw: ['turret'], it: 'cornucopia'},
  17: {s: 'c', h: BRN, hs: 'wild', b: 'short', m: 'grin', ear: 'pointy', robe: '#7FA34D', drape: '#B98A55', hw: ['goatHorns'], it: 'pipes'},
  18: {s: 'd', h: GRY, hs: 'short', b: 'full', old: 1, robe: '#5C8A4B', drape: WOOD, hw: ['pineCrown'], it: 'pine'},
  19: {s: 'b', h: BLD, hs: 'curly', m: 'open', robe: '#8EC5F0', drape: WHITE, it: 'crook', x: ['sheep']},
  20: {sp: 'stone'},
  21: {s: 'c', h: BLK, hs: 'short', robe: '#2E9C8F', drape: GOLD, hw: [['band', '#2E9C8F']], it: 'key'},
  22: {s: 'c', h: BRN, hs: 'short', b: 'short', robe: '#A47A4C', drape: '#D9B77A', hw: [['hood', '#7C5B3E']], it: 'sack'},
  23: {s: 'b', h: BLK, hs: 'long', br: 'stern', robe: '#B3263A', drape: BLK, hw: [['helmet', '#77708A', '#2F2629']], it: 'torch'},
  24: {s: 'b', h: DBR, hs: 'short', robe: '#3E5E9E', drape: '#E2363F', hw: ['woodTuft', 'crown'], it: 'woodpecker'},
  25: {s: 'a', h: BLD, hs: 'long', robe: '#F6A8C4', drape: WHITE, hw: [['flowerCrown', ['#FF8FB1', '#FFFFFF', '#FFC94D']]], it: 'bouquet'},
  26: {s: 'b', h: BRN, hs: 'bun', robe: '#6DB35F', drape: '#F3E3B0', hw: [['leafCrown', ['#6DB35F', '#8CCB6A']]], it: 'apple'},
  27: {s: 'c', h: '#D9822B', hs: 'curly', robe: '#C98A3A', drape: '#7FB65A', hw: [['leafCrown', ['#7DC36B', '#F49AC1', '#F28A30', '#E9EEF6']]], it: 'fruitBasket'},
  28: {s: 'c', h: BLK, hs: 'curly', m: 'open', robe: '#8E4FC0', drape: '#E9DDF8', hw: ['grapes'], it: 'cup'},
  29: {s: 'b', h: RED, hs: 'wild', robe: '#C9A04A', drape: AUB, it: 'wheatShield'},
  30: {s: 'c', h: SEA, hs: 'curly', b: 'long', old: 1, robe: '#4D9FC4', drape: '#B9E2F2', hw: ['reeds'], it: 'oar'},
  31: {s: 'a', h: '#6CB4D8', hs: 'long', robe: '#8FD0F5', drape: WHITE, hw: ['waterTiara'], it: 'pitcher'},
  32: {s: 'b', h: '#3C8D93', hs: 'long', robe: '#2E9C8F', drape: '#CDEFEA', hw: ['lily'], it: 'scroll'},
  33: {s: 'c', h: DBR, hs: 'long', robe: '#5E8F43', drape: '#E3C27A', hw: [['leafCrown', ['#4E9A54', '#A7CF5E']]], it: 'bird'},
  34: {s: 'b', h: '#E07A4A', hs: 'bun', robe: '#F7B27A', drape: '#FFE1C2', hw: ['starPin'], it: 'baby'},
  35: {s: 'b', h: GLD, hs: 'curly', m: 'open', robe: GOLD, drape: WHITE, bk: ['rays'], it: 'sunOrb'},
  36: {s: 'a', h: '#2F3A6B', hs: 'long', robe: '#33437A', drape: '#C9D6F5', bk: ['crescentBig'], it: 'star'},
  37: {s: 'c', h: DBR, hs: 'curly', e: 'happy', m: 'open', robe: '#5DAA5E', drape: GOLD, it: 'horn'},
  38: {s: 'b', h: BRN, hs: 'short', robe: '#B07A4A', drape: '#F3E3B0', it: 'amphora'},
  39: {s: 'c', h: BLK, hs: 'short', robe: WHITE, drape: '#E6D6B8', hw: [['veil', '#F3EEE2']], it: 'patera'},
  40: {s: 'g', h: WHT, hs: 'bald', b: 'long', old: 1, e: 'happy', robe: '#C9D6EA', drape: '#E9EEF6', it: 'violets', x: ['wisps']},
  41: {sp: 'ghost'},
  42: {s: 'c', h: DBR, hs: 'long', robe: '#C2557A', drape: '#F3E3B0', hw: [['veil', '#F7E4EC']], it: 'herbs'},
  43: {s: 'b', h: GRY, hs: 'bun', old: 1, robe: '#8E6FC0', drape: '#F3E3B0', it: 'tablet'},
  44: {s: 'b', h: BLK, hs: 'short', b: 'full', br: 'soft', robe: '#3E3550', drape: '#8E6FC0', hw: ['darkCrown'], it: 'bident'},
  45: {s: 'a', h: '#3B2A3F', hs: 'long', robe: '#6E3C8E', drape: '#F2D7E6', hw: [['flowerCrown', ['#C93A52', '#F4C2D2']]], it: 'pomegranate'},
  46: {s: 'a', h: BLD, hs: 'child', e: 'wink', robe: '#FFD3DF', drape: WHITE, bk: ['wingsSmall'], it: 'cupidBow'},
  47: {s: 'a', h: BRN, hs: 'long', robe: '#B9A6F2', drape: WHITE, bk: ['butterfly'], it: 'lamp'},
  48: {s: 'b', h: '#5C5A8A', hs: 'curly', e: 'sleep', m: 'o', robe: '#33437A', drape: '#9FB0E8', hw: ['sleepWings'], it: 'poppy'},
  49: {s: 'b', h: DBR, hs: 'long', robe: WHITE, drape: '#7FA7E0', hw: [['veil', '#EAF1FB']], it: 'handshake'},
  50: {s: 'c', h: BRN, hs: 'bun', robe: '#4FB0A6', drape: WHITE, it: 'heart'},
  51: {s: 'b', h: BLD, hs: 'long', robe: '#9FD3F2', drape: WHITE, hw: [['leafCrown', ['#8FB46A', '#A9C987']]], it: 'olive'},
  52: {s: 'a', h: '#E9A06A', hs: 'long', e: 'happy', robe: '#F9C46B', drape: WHITE, it: 'bud'},
  53: {s: 'c', h: DBR, hs: 'bun', robe: '#5DB3A0', drape: WHITE, it: 'bowlSnake'},
  54: {s: 'b', h: BRN, hs: 'long', robe: '#9B7BC9', drape: '#F3E3B0', hw: [['veil', '#F2EAF8']], it: 'stork'},
  55: {s: 'c', h: DBR, hs: 'curly', robe: WHITE, drape: '#D9443F', hw: ['goldLaurel'], it: 'scepter'},
  56: {s: 'c', h: BRN, hs: 'short', robe: '#4D6FB8', drape: '#E9DDB8', body: 'armor', armor: '#C9D2DC', hw: [['helmet', '#C9D2DC', '#FFFFFF']], it: 'parazonium'},
  57: {s: 'a', h: GLD, hs: 'long', e: 'happy', robe: WHITE, drape: GOLD, bk: ['wingsBig'], hw: ['laurel'], it: 'wreath'},
  58: {s: 'b', h: BRN, hs: 'long', robe: '#5B8DE0', drape: WHITE, it: 'capStaff'},
  59: {s: 'a', h: AUB, hs: 'long', robe: '#F2A541', drape: '#7B54C9', it: 'wheel'},
  60: {s: 'b', h: BLK, hs: 'bun', robe: '#6F7FC9', drape: WHITE, it: 'scales'},
  61: {s: 'c', h: DBR, hs: 'short', b: 'short', robe: '#3F7BD8', drape: '#D9443F', body: 'armor', armor: '#E3B04E', hw: [['helmet', '#E3B04E', '#3F7BD8']], it: 'shield'},
  62: {s: 'b', h: WHT, hs: 'bald', b: 'long', old: 1, robe: '#8C7AA8', drape: '#E9DDB8', it: 'cane'},
  63: {s: 'a', h: BRN, hs: 'child', m: 'open', robe: '#5DAA5E', drape: GOLD, hw: ['phrygian', 'flameTop']},
  64: {s: 'a', h: GLD, hs: 'long', robe: WHITE, drape: '#F59A45', hw: [['veil', '#F59A45'], 'diadem'], it: 'ring'},
  65: {s: 'b', h: WHT, hs: 'short', b: 'long', old: 1, robe: '#9E2F5E', drape: GOLD, hw: ['crown'], it: 'scepter'},
  66: {s: 'c', h: BLK, hs: 'short', br: 'stern', robe: '#8E3B9E', drape: BLK, body: 'armor', armor: '#9AA3AD', hw: [['helmet', '#9AA3AD', 'fire']], it: 'sword'},
  67: {s: 'c', h: GRY, hs: 'bald', b: 'full', old: 1, robe: '#7F9A5A', drape: '#E9DDB8', hw: ['travelHat'], it: 'staff'},
  68: {s: 'c', h: BLK, hs: 'long', robe: '#7B2D6E', drape: GOLD, hw: ['crown'], it: 'oxhide'},
  69: {s: 'b', h: BRN, hs: 'long', robe: WHITE, drape: '#CFE3F5', hw: [['veil', '#CFE3F5']], it: 'twins'},
  70: {s: 'c', h: DBR, hs: 'short', robe: '#B3263A', drape: GOLD, hw: ['crown'], it: 'spear', x: ['wolfPup']},
  71: {s: 'c', h: DBR, hs: 'short', robe: '#3F7BD8', drape: GOLD, hw: ['wolfHood']},
  72: {s: 'b', h: GRY, hs: 'short', b: 'long', old: 1, robe: '#F7F1E3', drape: '#8E3B9E', hw: ['apex'], it: 'ancile'},
});

/** 그림 하나(번호 1 ~ 72) — 글자 없는 svg 글 */
export function svgOf(n) {
  const a = ART[n], g = GODS[n]?.[5];
  if (!a || !g) throw new Error('없는 번호 ' + n);
  const [bg, ring] = GROUP_BG[g];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">`
    + `<defs><clipPath id="c"><circle cx="60" cy="60" r="56.5"/></clipPath></defs>`
    + el('circle', {cx: 60, cy: 60, r: 58, fill: bg}) + `<g clip-path="url(#c)" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${a.sp ? SP[a.sp](a) : figure(a)}</g>`
    + el('circle', {cx: 60, cy: 60, r: 57, fill: 'none', stroke: ring, 'stroke-width': 3.5}) + '</svg>\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let bad = 0;
  if (!check) fs.mkdirSync(OUT_DIR, {recursive: true});
  for (let n = 1; n <= 72; n++) {
    const f = path.join(OUT_DIR, n + '.svg'), s = svgOf(n);
    if (check) { if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s) { bad++; console.log('다름 ' + n); } } else fs.writeFileSync(f, s);
  }
  console.log(check ? (bad ? `그림 ${bad}장이 기계와 다름` : '그림 72장 모두 기계와 같음') : `그림 72장을 씀 — ${OUT_DIR}`);
  process.exit(bad ? 1 : 0);
}
