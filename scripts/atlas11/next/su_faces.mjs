#!/usr/bin/env node
/* 수르 얼굴 — 신 72 · 스승 39 를 알폰스 무하의 화풍으로 새로 그림(수르만 씀)
   사장님 2026-11-05 「머스크 판 4」 명령서(docs/design/su-musk-2026-11-05/order-1023.txt)
     [5] 3 「앵무새와 신·스승 얼굴도 무하풍으로 다시 그려라」 · [5] 4 「원화는 붙이지 말고 화풍으로 새로 그려라」
   무하 공부 = docs/design/su-musk-2026-11-05/mucha-guide.md(요소 열 가지 · 얼굴 그리는 법 · 색)
   얼굴마다: 머리 뒤 후광 원(무리 색 · 동심원 · 점 무늬) · 3/4 얼굴(반쯤 감은 눈 · 선 하나 코 · 작은 입술 · 살구빛 볼)
     · 머리카락(짧은 머리는 머리띠 끈)이 소용돌이 곡선으로 후광 밖까지 흐름 · 굵은 바깥 윤곽(겹친 그림자) + 가는 안쪽 결
     · 신마다 이야기 속 물건 하나(옛 기계의 물건을 읽어 이어받음) · 파스텔과 금빛 · 아래 반원 모자이크 띠 · 꽃 한두 송이
   무하 요소는 맨 바깥 <g> 에 data-mucha 이름(halo · outline · whiplash · pastel · mosaic · vine · stars)
   옛 그림(site/next/roman-art · sage-art)과 옛 기계(roman_art.mjs · sage_art.mjs)는 읽기만 함 — 옛 화면이 그대로 씀
   만든 것 = site/su/faces/roman/<번호>.svg(72) · site/su/faces/sage/<id>.svg(39) · 글자 · style · 스크립트 · 바깥 그림 · 글꼴 없음 · 같은 입력 = 같은 파일
   쓰는 법: node scripts/atlas11/next/su_faces.mjs          — 그림 111장을 다시 씀
            node scripts/atlas11/next/su_faces.mjs --check  — 파일이 이 기계가 그린 것과 같은지만 봄(다르면 1) */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GODS} from '../../../site/next/roman72.js';
import {ART as GOD_ART, GROUP_BG, KIT} from './roman_art.mjs';
import {ART as SAGE_ART, STEP_BG, PEOPLE} from './sage_art.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUT_ROMAN = path.resolve(HERE, '../../../site/su/faces/roman');
export const OUT_SAGE = path.resolve(HERE, '../../../site/su/faces/sage');
export const FACE_URL = {roman: n => `/su/faces/roman/${n}.svg`, sage: id => `/su/faces/sage/${id}.svg`};

/* ── 옛 스승 기계의 물건(IT2 · EX2)을 읽어 옴 — 그 파일은 내보내지 않으므로 글을 읽어 같은 손(KIT)으로 다시 짬(그 파일은 안 바뀜) ── */
function oldSageItems() {
  const src = fs.readFileSync(path.join(HERE, 'sage_art.mjs'), 'utf8');
  const i = src.indexOf('const fan ='), j = src.indexOf('/* ── 스승 서른아홉', i);
  if (i < 0 || j < 0) throw new Error('옛 스승 기계(sage_art.mjs)에서 물건 표를 못 찾음');
  const names = Object.keys(KIT);
  return new Function(...names, 'PAPER', 'CAP', 'JADE', src.slice(i, j) + '\nreturn {IT2, EX2};')(...names.map(k => KIT[k]), '#FFF8E6', '#22202A', '#5FA65A');
}
const {IT2, EX2} = oldSageItems();

/* ── 그리는 도구(그림 속성만) ── */
const f = v => { const s = String(Math.round(v * 10) / 10); return s.startsWith('0.') ? s.slice(1) : s.startsWith('-0.') ? '-' + s.slice(2) : s; };
const at = o => Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== false && v !== '').map(([k, v]) => ` ${k}="${typeof v === 'number' ? f(v) : v}"`).join('');
const el = (t, o = {}, inner = '') => (inner ? `<${t}${at(o)}>${inner}</${t}>` : `<${t}${at(o)}/>`);
const P = (d, fill = 'none', o = {}) => el('path', {d, fill, ...o});
const C = (cx, cy, r, fill = 'none', o = {}) => el('circle', {cx, cy, r, fill, ...o});
const E = (cx, cy, rx, ry, fill, o = {}) => el('ellipse', {cx, cy, rx, ry, fill, ...o});
const G = (o, inner) => (inner ? el('g', o, inner) : '');
const NS = {stroke: 'none'};
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
const seed = k => { let h = 2166136261; for (const ch of String(k)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };

/* 빛 — 파스텔과 금빛(su-art.css 의 빛과 같은 결) */
const CREAM = '#FCF5E6', GOLD = '#C9A04A', GOLDL = '#E9C877', GOLDD = '#A9812F', INKD = '#4A2C24', LID = '#3A2420', IRIS = '#4F3A34';
const SKIN = {a: '#FBE3D0', b: '#F6D3B8', c: '#E9BC97', d: '#D49E78', g: '#E3EAF4', stone: '#D9D2C4'};
const PETALS = ['#F4B6C2', '#F7D7A6', '#FFFFFF', '#E6C6EA', '#F6AE92', '#CFE3F2'];

/* 꼬리 굵기가 변하는 소용돌이 — 3차 베지에 하나 + 끝에서 말려 들어감(채운 모양 · 뿌리 굵고 끝 가늘게) */
function whip([p0, p1, p2, p3], dir, w0, rr = 5) {
  const pts = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6, u = 1 - t; pts.push([0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k])); }
  let [x, y] = pts[6], a = Math.atan2(y - pts[5][1], x - pts[5][0]);
  for (let k = 0; k < 5; k++) { a += dir * 0.82; const s = rr * (1 - k / 6) * 0.8; x += Math.cos(a) * s; y += Math.sin(a) * s; pts.push([x, y]); }
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
    const w = (w0 * (1 - i / (n - 1)) ** 1.15 + 0.35) / 2, nx = (-dy / d) * w, ny = (dx / d) * w;
    L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return rel([...L, ...R.reverse()]);
}
/** 점들을 짧은 상대 좌표 글로(반올림한 절대값의 차이라 어긋남이 쌓이지 않음) */
function rel(pts) {
  const q = pts.map(([u, v]) => [Math.round(u * 10), Math.round(v * 10)]);
  const nums = [q[0][0], q[0][1]]; let o = 'M' + f(q[0][0] / 10) + ' ' + f(q[0][1] / 10) + 'l';
  const out = []; for (let i = 1; i < q.length; i++) out.push(f((q[i][0] - q[i - 1][0]) / 10), f((q[i][1] - q[i - 1][1]) / 10));
  return o + out.reduce((a, t, i) => a + (i && !t.startsWith('-') ? ' ' : '') + t, '') + 'z';
}
/** 물방울 잎 — 밑동 b · 방향 deg · 길이 l · 폭 w */
function leaf(bx, by, deg, l, w) {
  const t = (deg * Math.PI) / 180, ux = Math.cos(t), uy = Math.sin(t), mx = bx + ux * l * 0.5, my = by + uy * l * 0.5;
  return `M${f(bx)} ${f(by)}Q${f(mx - uy * w)} ${f(my + ux * w)} ${f(bx + ux * l)} ${f(by + uy * l)}Q${f(mx + uy * w)} ${f(my - ux * w)} ${f(bx)} ${f(by)}Z`;
}
/** 꽃 — 꽃잎 다섯(동그란 꽃잎) + 금빛 가운데 */
const bloom = (x, y, s, petal, turn = 0) => { const r = s * 0.72, L = 2 * Math.PI * r; return C(x, y, r, 'none', {stroke: mix(petal, '#8A5A4A', 0.45), 'stroke-width': s * 1.32, 'stroke-dasharray': `0 ${f(L / 5)}`, 'stroke-linecap': 'round', transform: `rotate(${f(turn - 90)} ${f(x)} ${f(y)})`}) + C(x, y, r, 'none', {stroke: petal, 'stroke-width': s * 1.12, 'stroke-dasharray': `0 ${f(L / 5)}`, 'stroke-linecap': 'round', transform: `rotate(${f(turn - 90)} ${f(x)} ${f(y)})`}) + C(x, y, s * 0.42, GOLDL, {stroke: GOLDD, 'stroke-width': 0.5}); };
/** 네 갈래 별(반짝임) */
const spark = (x, y, r) => `M${f(x)} ${f(y - r)}Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)}Q${f(x)} ${f(y)} ${f(x - r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - r)}Z`;

/* ── 얼굴(3/4 · 왼쪽을 봄) — 머리 쪽 좌표 ── */
const FACE = 'M47 37C42.5 41 40 47 40.5 53C40.8 55 41.6 56.5 41 58.5C40.5 61 41 63.5 42.5 65.5C43.5 71 47.5 78 53 82C55.5 84 58.5 84.6 61 83.6C67 81 73.5 74.5 75.5 66C77.5 57 76.5 45 71 39.5C65 34 53 33.5 47 37Z';
const NECK = 'M52 79C53.5 86 53 91 50.5 97L71 97C68.5 91 68 85 69.5 76Z';
const FACE_BALD = 'M40.5 53C38.5 41 47 30.5 60 30.5C73 30.5 82 39 81 52C80.5 57 78 61 76.5 64C75 72 68 81 61 83.6C58.5 84.6 55.5 84 53 82C47.5 78 43.5 71 42.5 65.5C41 63.5 40.5 61 41 58.5C41.6 56.5 40.8 55 40.5 53Z';
const HAIR = {
  long: {b: 'M58 25C39 25 30 38 31 55C31.5 67 29 77 25 87C32 93 40 93 44 88C42 80 41.5 72 42 66L76 66C78 74 80 82 78 91C84 95 93 93 96 85C89 76 87 66 86.5 55C86 37 76 25 58 25Z',
    f: 'M40 62C37 50 42 37 55 33.5C67 30.5 80 37 80.5 52C81 58 79.5 63 78 67C76.5 60 74.5 53 70 48.5C66 45.5 63.5 42.5 63 40C59 44.5 51 47.5 45 49.5C42.5 53 41 57 40 62Z',
    s: 'M45 47C50 42 56 39 62 37.5M66 41C71 44 75 50 77 58M35 64C33.5 72 31.5 80 28.5 86M84.5 62C85.5 70 86.5 78 89.5 86'},
  bun: {b: 'M58 26C42 26 33 37 34 52C34.5 59 36 63 39 66L79 66C83 61 85 56 85 50C85 36 75 26 58 26Z',
    f: 'M40 62C37 50 42 37 55 33.5C67 30.5 80 37 80.5 52C80.6 56 80 59 79 61.5C77.5 57 75 52 70 48.5C66 45.5 63.5 42.5 63 40C59 44.5 51 47.5 45 49.5C42.5 53 41 57 40 62Z',
    s: 'M45 47C50 42 56 39 62 37.5M66 41C71 44 75 49 77.5 55', bun: 1},
  short: {f: 'M40.5 60C37 46 44 32 58 31C72 30 82 38 81.5 52C81.5 57 80.5 61 79 63C77.5 57 75.5 52 72 49C67 46.5 61 45 56 46C50 47 45 50 42.5 54C41.5 56 41 58 40.5 60Z',
    s: 'M46 49C50 44 56 41 63 40M68 43C72 46 76 51 78 57', ear: 1},
  wild: {f: 'M40 60C36 52 37 44 40 40C38 35 43 31 47 32C49 27 56 26 59 29C63 25 71 27 72 31C77 30 82 35 81 41C85 45 85 53 81 61C79 55 76 51 72 49C66 47 59 46 54 47C48 48 44 52 42 56Z',
    s: 'M47 44C52 39 58 37 64 37M70 42C74 45 77 49 79 54', ear: 1},
  child: {f: 'M41 60C38 47 45 34 58 33C71 32 81 40 80.5 53C80 57 79 60 78 62C76 56 73 51 68 49C62 47 55 47 50 49C46 51 43 55 41 60Z',
    s: 'M57 33C53 26 58 21 64 23C61 25 60 28 61 32', ear: 1, curls: 7},
  curly: {f: 'M40.5 60C37 46 44 32 58 31C72 30 82 38 81.5 52C81.5 57 80.5 61 79 63C77.5 57 75.5 52 72 49C67 46.5 61 45 56 46C50 47 45 50 42.5 54C41.5 56 41 58 40.5 60Z', ear: 1, curls: 11},
  bald: {skull: 1, f: 'M74.5 50C80.5 52 83 60 81 69C79 67 77 63 75.5 60Z', s: 'M77 54C79 58 80 62 80 66', ear: 1},
  snail: {f: 'M40.5 60C37 46 44 32 58 31C72 30 82 38 81.5 52C81.5 57 80.5 61 79 63C77.5 57 75.5 52 72 49C67 46.5 61 45 56 46C50 47 45 50 42.5 54C41.5 56 41 58 40.5 60Z', ear: 'long', curls: 13, knot: 1},
  shaved: {skull: 1, ear: 1, shade: 1},
  wig: {f: 'M40.5 58C37 45 44 32 58 31C72 30 82 38 81.5 52C81.5 55 81 57 80 59C77 55 74.5 51 71 49C66 47 61 46 56 46.5C50 47.5 45 50.5 42.5 54C41.5 55.5 41 57 40.5 58Z', rolls: 1},
  baldLong: {skull: 1, b: 'M74 50C82 54 86 64 85 78C84 86 82 92 78 96L72 88C76 80 77 70 75 60Z', f: 'M74.5 50C80.5 52 83 60 81 69C79 67 77 63 75.5 60Z', s: 'M78 58C80 66 81 76 79 86'},
  none: {},
};
const BEARD = {
  full: 'M41.5 62C41 72 45 85 56 89.5C67 90.5 76 81 77 66C74 71 69.5 74.5 64.5 75.6C60 77.6 52 77.6 47.5 73C44.5 70 42.5 66 41.5 62Z',
  long: 'M41.5 62C40 76 43 92 51 103C54 107 60 109 62.5 104C70 95 76 82 77 66C74 71 69.5 74.5 64.5 75.6C60 77.6 52 77.6 47.5 73C44.5 70 42.5 66 41.5 62Z',
  short: 'M42.5 66C44.5 77 50 84.5 57 86C66 86.5 73.5 79 75.5 68C72 73 68 76 63.5 77C58.5 78.5 51.5 78 47.5 74C45 71.5 43.5 69 42.5 66Z',
  chin: 'M43 68C45 80 50 87.5 57 89C66 89.5 73.5 81 75.5 69C72.5 77 67 81.5 59 82C52 82 46.5 76 43 68Z',
  goatee: 'M53 79C53 86 55.5 90 58 90C61 90 62.5 86 62 79C59.5 80.5 55.5 80.5 53 79Z',
};
const MUST = 'M50.5 72C52.5 70 55.5 70 57 71.2C58.8 70 62 70 64 72.5C61.5 73.5 59 73 57 72.4C55 73.2 52.5 73.4 50.5 72Z';
const BEARD_S = 'M50 80C51 86 53 90 56 92M60.5 79C61.5 85 61.5 89 60.5 94M68 77C67 83 65 87 63 90';

/* 소용돌이 머리채 · 끈 — [베지에 네 점, 말림 방향, 뿌리 굵기, 말림 크기] */
const LOCKS = {
  /* 옆 머리채는 귀 옆(높이 54 ~ 62)에서 시작해 아래로만 흐르고, 어깨 높이(80 ~ 88)에서 바깥으로 말림 — 위로 솟는 머리채 없음(작게 볼 때 뿔처럼 보였음) */
  long: [[[[36, 62], [31, 72], [23, 76], [20, 86]], 1, 5.2, 5], [[[37, 56], [31, 63], [24, 66], [19, 76]], 1, 3.4, 3.8], [[[84, 62], [89, 72], [97, 76], [100, 86]], -1, 5.2, 5], [[[83, 56], [89, 63], [96, 66], [101, 76]], -1, 3.4, 3.8]],
  front: [[[[79, 66], [83, 76], [78, 83], [82, 91]], 1, 4, 3.6]],
  bun: [[[[86, 44], [92, 52], [93, 64], [100, 74]], -1, 4.2, 4.5], [[[40, 60], [35, 69], [29, 70], [26, 79]], 1, 2.8, 3.6], [[[82, 58], [88, 66], [96, 68], [99, 78]], -1, 2.8, 3.6]],
  ribbon: [[[[82, 49], [88, 55], [93, 64], [99, 76]], -1, 3.4, 4.5], [[[82, 51], [85, 61], [85, 73], [92, 84]], 1, 3, 4]],
  tuft: [[[[39, 58], [33, 66], [25, 68], [21, 78]], 1, 3, 3.6]],
  fringe: [[[[80, 60], [87, 68], [95, 72], [99, 82]], -1, 4, 4.5], [[[79, 66], [83, 78], [77, 86], [84, 96]], -1, 3.2, 3.6]],
};

/* ── 머리에 쓰는 것(새로 그림) — {b: 머리 뒤, f: 머리 앞, free: 관자놀이에 꽃을 꽂을 자리가 남나} ── */
const wreathOf = (c1, c2, berry) => {
  let d1 = '', d2 = '', bb = '';
  for (let i = 0; i < 11; i++) {
    const a = ((178 + i * 18.5) * Math.PI) / 180, x = 60 + 22.5 * Math.cos(a), y = 51 + 20 * Math.sin(a), tg = (Math.atan2(20 * Math.cos(a), -22.5 * Math.sin(a)) * 180) / Math.PI;
    const l = leaf(x, y, tg + 180 + (i % 2 ? 32 : -32), 7.5, 2.4);
    if (i % 2) d2 += l; else d1 += l;
    if (berry && i % 3 === 1) bb += `M${f(x + 1.6)} ${f(y)}a1.6 1.6 0 1 0 -3.2 0a1.6 1.6 0 1 0 3.2 0`;
  }
  return {f: P(d1, c1, {'stroke-width': 0.5}) + P(d2, c2, {'stroke-width': 0.5}) + (bb ? P(bb, berry, {'stroke-width': 0.4}) : '')};
};
const HEAD = {
  wreath: (c1 = '#7FA85E', c2 = '#A9C77A', berry) => wreathOf(c1, c2, berry),
  diadem: (j = '#7FB6D9') => ({f: P('M40.5 52C49 45 67 42.5 80.5 47.5', 'none', {stroke: GOLDD, 'stroke-width': 3}) + P('M40.5 52C49 45 67 42.5 80.5 47.5', 'none', {stroke: GOLDL, 'stroke-width': 1.6}) + C(60.5, 45, 2.7, j, {stroke: GOLDD, 'stroke-width': 0.8}) + C(60.5, 49, 1, GOLDL, {'stroke-width': 0.4}), free: 1}),
  pearls: () => ({f: P('M40.5 52C49 45 67 42.5 80.5 47.5', 'none', {stroke: '#FFFDF6', 'stroke-width': 2.4, 'stroke-dasharray': '0 2.9', 'stroke-linecap': 'round'}), free: 1}),
  crown: (c = GOLDL, j = '#D9534F') => ({f: P('M42 38L43.5 24L49.5 31L55.5 20L61 29.5L66.5 20L71.5 31L77 24L78 38C66 34.5 54 34.5 42 38Z', c, {stroke: GOLDD, 'stroke-width': 0.8}) + C(55.5, 20, 1.5, j, {'stroke-width': 0.4}) + C(66.5, 20, 1.5, j, {'stroke-width': 0.4}) + C(60.5, 34, 1.8, j, {'stroke-width': 0.4})}),
  turret: (c = '#D8C08A') => ({f: P('M43 38L43 26L48 26L48 30L53 30L53 26L58.5 26L58.5 30L63.5 30L63.5 26L69 26L69 30L74 30L74 26L78 26L78 38C66 34.5 54 34.5 43 38Z', c, {stroke: GOLDD, 'stroke-width': 0.8})}),
  helmet: (m = '#C9D2DC', crest = '#2BA39A') => ({f: P('M44 30C46 15 66 9 80 18C83 21 84 26 82 31C76 24 66 21 56 22C51 23 47 25 44 30Z', crest) + P('M38.5 55C36 39 45 27 59.5 26.5C74 26 83.5 36 82 51L77.5 49C70 45 51 44.5 44 48.5L41 53Z', m, {'stroke-width': 0.7}) + P('M42.5 50C52 44.5 69 44.5 79 49M58 27C55 33 54 39 55 46', 'none', {stroke: mix(m, INKD, 0.45), 'stroke-width': 0.6})}),
  veil: (c = '#FFFFFF') => ({b: P('M36 52C34 34 46 21 60 21C77 21 87 34 85 52C86 70 92 90 100 104L80 106C82 88 80 68 78 56ZM36 52C36 70 32 86 22 100L38 104C42 88 44 72 42 58Z', c),
    f: P('M38.5 54C37 38 47 27 60 27C73 27 83 36 82.5 50C77 41 69 37 60 37C51 37 43 43 38.5 54Z', c) + P('M43 45C49 38 57 35 66 36', 'none', {stroke: mix(c, INKD, 0.25), 'stroke-width': 0.5})}),
  hood: (c = '#8C8178') => ({b: P('M35 54C33 34 45 20 60 20C77 20 88 34 86 54C87 72 93 92 101 106L19 106C29 90 35 72 35 54Z', c),
    f: P('M38 60C36 38 47 25 60 25C74 25 84 36 83 58C79 47 71 41 60 41C49 41 42 48 38 60Z', c)}),
  wings: (c = '#FFFFFF') => ({f: P('M80 45C86 37 95 33 103 34C99 36.5 96 39 94 41.5C98 41 101 42 103.5 43.5C99 45.5 95 46.5 90 46.5C93 47.5 95 49 96.5 51C90 51.5 84 50 80 48ZM42 42C37 36 31 33 26 34C29 36 31 38.5 32.5 41C29 41 26.5 42 24.5 43.5C29 45 34 45.5 40 45Z', c)}),
  phrygian: (c = '#5DAA5E') => ({f: P('M39 54C36 38 46 27 61 27C72 27 79 34 80 44C81 48 81 51 80 53C73 47 52 46 39 54ZM45 31C40 25 39 18 44 15C46 21 52 25 59 27Z', c, {'stroke-width': 0.7})}),
  cap: (c = '#9B6B45') => ({f: P('M39 52C37 38 47 28 60 28C73 28 82 37 81 50C72 45 50 44 39 52Z', c, {'stroke-width': 0.7}) + P('M40 49C50 44 70 44 80.5 47', 'none', {stroke: mix(c, INKD, 0.4), 'stroke-width': 0.6})}),
  petasos: (c = '#B7A06A') => ({f: E(60, 38, 31, 6.5, c, {'stroke-width': 0.7}) + P('M45 37C45 26 52 21 60 21C68 21 75 26 75 37Z', c, {'stroke-width': 0.7})}),
  apex: (c = '#F2EADA') => ({f: P('M41 51C39 37 48 30 60 30C72 30 81 37 80 51C72 46 50 46 41 51Z', c, {'stroke-width': 0.7}) + P('M58.5 30.5L60 14L61.5 30.5Z', GOLDL, {'stroke-width': 0.5}) + C(60, 13, 1.7, GOLDL, {'stroke-width': 0.4})}),
  horns: () => ({f: P('M47 34C44 26 39 22 33 22C37 25 40 30 42 36ZM71 32C73 24 78 20 84 20C80 23 77 28 76 34Z', '#EBDDC0')}),
  band: (c = '#2E9C8F') => ({f: P('M40.5 51C49 44.5 68 42 81 47.5', 'none', {stroke: c, 'stroke-width': 3}) + C(81, 48, 2.2, c, {'stroke-width': 0.5}), free: 1}),
  flame: () => ({f: P('M60 28C54 22 56 15 61 9C61 14 65 16 66.5 20C67.5 24 64.5 28 60 28Z', '#F59A3C', {'stroke-width': 0.5}) + P('M60.5 27C58 24 59 20 61 17C62 20 64 21.5 63.5 24C63 26 62 27 60.5 27Z', '#FFD45A', NS)}),
  star: () => ({f: P(spark(60, 16, 7), GOLDL, {stroke: GOLDD, 'stroke-width': 0.5})}),
  crescent: () => ({f: P('M54 30C57 23 66 21.5 70.5 25.5C65 24.5 60 26 56.5 32Z', '#FFFBEF', {stroke: GOLDD, 'stroke-width': 0.6}), free: 1}),
  tuft: () => ({f: P('M55 31C52 22 56 15 63 13C60 18 62 22 66 24C64 26 62 28 61 32Z', '#E2363F', {'stroke-width': 0.5})}),
  eastCap: (c = '#22202A') => ({f: P('M52 33C52 24 55 19 60.5 19C66 19 69 24 69 33Z', c) + P('M46.5 25.5L74.5 25.5', 'none', {stroke: GOLDL, 'stroke-width': 1.6})}),
  tallCap: (c = '#22202A', wing) => ({f: (wing ? E(34, 38, 10, 3, c, {'stroke-width': 0.5}) + E(87, 36, 10, 3, c, {'stroke-width': 0.5}) : '') + P('M42 48L44 20C51 16 70 16 77 20L79 48C70 43.5 51 43.5 42 48Z', c) + P('M43 39C52 36 69 36 78 39', 'none', {stroke: '#5A5666', 'stroke-width': 0.8})}),
  gat: () => ({f: E(60, 38, 33, 6, '#1B1A22', {opacity: 0.86, 'stroke-width': 0.5}) + P('M49 38L50 20C54 17.5 66 17.5 70 20L71 38Z', '#1B1A22', {opacity: 0.92, 'stroke-width': 0.5})}),
  tophat: () => ({f: el('rect', {x: 45, y: 5, width: 30, height: 29, rx: 2, fill: '#1E1C24', 'stroke-width': 0.5}) + el('rect', {x: 45, y: 27, width: 30, height: 5, fill: '#4A4652', stroke: 'none'}) + E(60, 34, 25, 4.5, '#1E1C24', {'stroke-width': 0.5})}),
  beret: (c = '#7A2E3A') => ({f: P('M36 48C33 36 46 27 63 28C80 29 88 38 84 48C76 43 48 42 36 48Z', c, {'stroke-width': 0.7}) + C(63, 28, 1.8, c, {'stroke-width': 0.5})}),
  cloth: (c = '#2F5D9E') => ({b: P('M80 44C88 52 92 66 90 82C86 78 84 70 82 62Z', c), f: P('M40.5 51C49 44.5 68 42 81 47.5', 'none', {stroke: c, 'stroke-width': 3.2}), free: 1}),
};
/** 옛 기계의 「쓴 것」 이름 → 새 머리 장식 */
function headOf(hw = []) {
  const out = [];
  for (const it of hw) {
    const [k, a1, a2] = Array.isArray(it) ? it : [it];
    const W = {oak: ['#6E9A55', '#93B86E'], laurel: ['#6E9A55', '#9BBE78'], goldLaurel: [GOLDL, '#F3DC9A'], wheatCrown: ['#E3B95A', '#F0D48A'], pineCrown: ['#3F7350', '#5E9068'], olive: ['#8FAE6A', '#B7CB8E'], reeds: ['#5E9C8E', '#8CC0B3'], grapes: ['#7FA85E', '#A9C77A']};
    if (W[k]) out.push(HEAD.wreath(...W[k], k === 'grapes' ? '#8E5FB8' : k === 'oak' ? '#B98A4A' : null));
    else if (k === 'leafCrown') out.push(HEAD.wreath(a1?.[0] ?? '#7FA85E', a1?.[1] ?? '#A9C77A', a1?.[2] ?? null));
    else if (k === 'flowerCrown') out.push(HEAD.wreath('#7FA85E', '#A9C77A', a1?.[0] ?? '#F48FB1'));
    else if (k === 'helmet' || k === 'helmetK') out.push(HEAD.helmet(a1 ?? '#4E5566', a2 === 'fire' ? '#E8573A' : a2 ?? '#C8452F'));
    else if (k === 'veil') out.push(HEAD.veil(a1 ?? '#FFFFFF'));
    else if (k === 'hood' || k === 'wolfHood') out.push(HEAD.hood(k === 'wolfHood' ? '#8A6A4E' : a1 ?? '#8C8178'));
    else if (k === 'diadem' || k === 'infula') out.push(HEAD.diadem('#E06A7A'));
    else if (k === 'waterTiara') out.push(HEAD.diadem('#8FD0F5'));
    else if (k === 'starPin') out.push(HEAD.diadem(GOLDL), HEAD.star());
    else if (k === 'pearls') out.push(HEAD.pearls());
    else if (k === 'crown' || k === 'seaCrown' || k === 'darkCrown') out.push(HEAD.crown(k === 'darkCrown' ? '#8E83A8' : k === 'seaCrown' ? '#9FD6DF' : GOLDL, k === 'seaCrown' ? '#3E8FC4' : '#D9534F'));
    else if (k === 'turret') out.push(HEAD.turret());
    else if (k === 'wingedCap' || k === 'sleepWings') out.push(HEAD.wings(k === 'sleepWings' ? '#C6CFF0' : '#FFFFFF'));
    else if (k === 'phrygian') out.push(HEAD.phrygian('#5DAA5E'));
    else if (k === 'workCap') out.push(HEAD.cap('#9B6B45'));
    else if (k === 'travelHat') out.push(HEAD.petasos());
    else if (k === 'apex') out.push(HEAD.apex());
    else if (k === 'goatHorns') out.push(HEAD.horns());
    else if (k === 'band') out.push(HEAD.band(a1 ?? '#2E9C8F'));
    else if (k === 'flameTop') out.push(HEAD.flame());
    else if (k === 'starAbove') out.push(HEAD.star());
    else if (k === 'crescentSmall') out.push(HEAD.crescent());
    else if (k === 'woodTuft') out.push(HEAD.tuft());
    else if (k === 'lily') out.push(HEAD.wreath('#6E9A55', '#93B86E', '#FFFFFF'));
    else if (k === 'scholarCap') out.push(HEAD.eastCap(a1 ?? '#22202A'));
    else if (k === 'hanCap' || k === 'tallCap' || k === 'jeongja' || k === 'yugeon') out.push(HEAD.tallCap());
    else if (k === 'mingHat' || k === 'iksun') out.push(HEAD.tallCap('#22202A', 1));
    else if (k === 'gat') out.push(HEAD.gat());
    else if (k === 'tophat') out.push(HEAD.tophat());
    else if (k === 'beret') out.push(HEAD.beret());
    else if (k === 'guanjin') out.push(HEAD.cloth());
    else throw new Error('모르는 머리 장식 ' + k);
  }
  return out;
}

/* ── 몸(가슴까지) — 파스텔 옷 · 금빛 목걸이 ── */
const BUST = 'M13 121C16 105 30 97.5 47 96C53 99 66 99.5 73 96C90 97.5 103 105 107 121Z';
function bust(a, skin) {
  const robe = mix(a.robe ?? '#8EC5F0', CREAM, a.body === 'suit' || a.body === 'mao' ? 0.12 : 0.38), drape = mix(a.drape ?? CREAM, CREAM, 0.25), fold = mix(robe, INKD, 0.4);
  let o = P(BUST, robe, {'stroke-width': 0.7});
  if (a.body === 'suit') {
    o += P('M50 96.5L60 113L70 96.5Z', mix(a.shirt ?? '#FFFFFF', CREAM, 0.2))
      + (a.tie ? P('M57.6 98L62.4 98L63.4 108L60 112L56.6 108Z', a.tie, {'stroke-width': 0.5}) : a.neck === 'cravat' || a.neck === 'band' ? P('M54 97L66 97L64 104L60 107.5L56 104Z', '#FFFDF6', {'stroke-width': 0.5}) : '')
      + P('M47 96L58.5 116L51.5 100.5ZM73 96L61.5 116L68.5 100.5Z', mix(robe, INKD, 0.15));
  } else if (a.body === 'mao') {
    o += P('M50 95.5L60 101L70 95.5L70 99.5L60 105L50 99.5Z', robe) + P('M60 105L60 121', 'none', {stroke: fold, 'stroke-width': 0.6});
  } else if (a.body === 'east' || a.body === 'hanbok') {
    const col = mix(a.col ?? '#2E3448', CREAM, 0.15);
    o += P('M51 96.5L57 96.5L73 121L66 121ZM64 96.5L70 96.5L59.5 109L56.5 105Z', col)
      + (a.badge ? C(36, 108, 6, a.badge, {'stroke-width': 0.5}) : '');
  } else if (a.body === 'armor') {
    const ar = mix(a.armor ?? '#C9D2DC', CREAM, 0.15);
    o += P('M33 121C34 108 41 100 50 98C56 101 64 101 70 98C79 100 86 108 87 121Z', ar) + P('M47 106C54 110 66 110 73 106M45 114C53 118 67 118 75 114', 'none', {stroke: mix(ar, INKD, 0.4), 'stroke-width': 0.6})
      + P('M13 121C16 106 26 99 40 96.6C44 104 46 112 47 121Z', drape);
  } else if (a.body === 'stone') {
    o = P('M22 121L26 98C36 95 50 95 60 96C70 95 84 95 94 98L98 121Z', '#CFC6B4', {'stroke-width': 0.7}) + P('M30 108L46 106M74 104L90 107M52 114L70 115', 'none', {stroke: '#A39985', 'stroke-width': 0.6});
    return G({'data-mucha': 'pastel'}, o);
  } else {
    o += P('M13 121C16 106 26 99 40 96.6C47 104 51 112 53 121Z', drape);
  }
  o += P('M27 104C30 110 31 115 31 121M88 103C86 110 85 116 85 121M79 99C78 106 77 113 77 121', 'none', {stroke: fold, 'stroke-width': 0.5});
  if (a.body !== 'suit' && a.body !== 'mao') o += P('M47.5 97.5C53.5 103 66.5 103 72.5 97.5', 'none', {stroke: GOLDD, 'stroke-width': 2.2, 'stroke-dasharray': '0 2.7', 'stroke-linecap': 'round'}) + C(60, 104, 1.9, GOLDL, {stroke: GOLDD, 'stroke-width': 0.5});
  return G({'data-mucha': 'pastel'}, o);
}

/* ── 이목구비 — 반쯤 감은 눈 · 선 하나 코 · 작은 두 곡선 입술 · 살구빛 볼 ── */
function features(a, x) {
  const fem = x.fem, hc = x.hair;
  const brow = mix(hc === '#F4F1EA' || hc === '#ADA9A6' ? '#8A7F78' : hc, LID, fem ? 0.55 : 0.35);
  let o = E(65.5, 66.5, 5.2, 3.2, '#F29C80', {...NS, opacity: fem ? 0.42 : 0.24}) + E(45.5, 65.4, 2.3, 1.8, '#F29C80', {...NS, opacity: fem ? 0.3 : 0.18});
  o += P('M43.4 51.8C45.3 49.6 48.6 49.1 51.2 50.3M57.4 50.9C61.4 47.6 66.8 47.4 70.8 50.2', 'none', {stroke: brow, 'stroke-width': fem ? 0.9 : a.old ? 2 : 1.5});
  if (a.e === 'sleep') {
    o += P('M44 57C46 58.8 49 58.8 50.8 57M57 56.8C60 59.6 65 59.6 68.4 56.6', 'none', {stroke: LID, 'stroke-width': 1.3});
  } else {
    o += P('M44.8 57.2C46.5 58.9 48.8 58.9 50.2 57.1ZM58 57C60.2 59.7 64.6 59.7 67.3 56.9Z', IRIS, NS)
      + P('M43.8 57.4C45.5 55.6 48.6 55.4 50.8 57M56.8 57.2C59.5 54.4 64.6 54.2 68.4 56.6L69.7 55.6', 'none', {stroke: LID, 'stroke-width': fem ? 1.5 : 1.3})
      + P('M58.2 55C61 52.7 65 52.7 67.8 54.5M45.6 59.1C47 59.8 48.6 59.7 49.8 58.9M59.5 59.7C61.5 60.7 64 60.7 66.2 59.5', 'none', {stroke: LID, 'stroke-width': 0.45, opacity: 0.7});
  }
  o += P('M53.4 55.5C53.2 60 51.6 64.5 51.2 66.6C51 68 52.6 68.9 54.2 68.4M55.8 68C56.5 68.6 57.6 68.5 58.1 67.9', 'none', {stroke: mix(x.skin, LID, 0.6), 'stroke-width': 0.8});
  if (a.old) o += P('M58 46C62 44.8 66 44.8 70 46M68.5 61C70 62 71 63.5 71.5 65', 'none', {stroke: mix(x.skin, LID, 0.45), 'stroke-width': 0.5});
  const up = fem ? '#C46F66' : mix(x.skin, '#9A5448', 0.45), lo = fem ? '#E08A7E' : mix(x.skin, '#B2665A', 0.4);
  o += P('M51.2 73.4C53 72.6 55 72.3 56.6 73C58.2 72.3 60.3 72.6 62 73.6C58.5 74.4 54.5 74.4 51.2 73.4Z', up, NS) + P('M52.4 73.9C54.5 76.3 59.2 76.3 61 74.1C58 74.7 55 74.7 52.4 73.9Z', lo, NS);
  if (a.gl) o += P('M52.3 57.5a4.8 4.8 0 1 0 -9.6 0a4.8 4.8 0 1 0 9.6 0M68.8 57a6 6 0 1 0 -12 0a6 6 0 1 0 12 0M52.3 57C53.8 55.8 55.3 55.8 56.8 56.8', 'none', {stroke: '#6B5A4A', 'stroke-width': 0.8});
  return o;
}

/* ── 사람 한 명 — 머리(뒤 · 앞) + 몸 + 물건 ── */
function figure(a, x, item) {
  const H = HAIR[x.hs] ?? HAIR.short, heads = headOf(a.hw), hasFront = heads.some(h => h.b);
  const hair = x.hair, strand = mix(hair, '#2A1A14', 0.38), skin = x.skin;
  const locks = x.hs === 'long' ? LOCKS.long : x.hs === 'bun' ? LOCKS.bun : x.hs === 'bald' || x.hs === 'baldLong' ? LOCKS.fringe : x.hs === 'none' || x.hs === 'shaved' ? LOCKS.ribbon : [...LOCKS.ribbon, ...(x.hs === 'curly' || x.hs === 'wild' || x.hs === 'child' || x.hs === 'snail' ? LOCKS.tuft : [])];
  const jit = (k, s) => s.map(([pts, dir, w, r], i) => [pts.map(([px, py], j) => (j ? [px + (seed(k + 'x' + i + j) - 0.5) * 5, py + (seed(k + 'y' + i + j) - 0.5) * 5] : [px, py])), dir, w, r]);
  const L = jit(x.key, locks);
  const ribbonC = x.ribbon;
  const isHair = x.hs === 'long' || x.hs === 'bun' || x.hs === 'bald' || x.hs === 'baldLong';
  const lockD = L.map(([p, d, w, r]) => whip(p, d, w, r)).join('');
  // 뒤 머리 · 끈(소용돌이)
  let back = heads.map(h => h.b ?? '').join('');
  back += G({'data-mucha': 'whiplash'}, P(lockD, isHair ? hair : ribbonC));
  if (H.b) back += P(H.b, hair);
  if (H.bun) back += C(81, 35, 9.5, hair) + P('M75 31C79 28 84 29 87 33M76 38C80 41 85 40 88 37', 'none', {stroke: strand, 'stroke-width': 0.5}) + P('M71 27L93 41', 'none', {stroke: GOLDD, 'stroke-width': 1.2});
  back += P(NECK, skin) + P('M53.5 82C58 85.5 64 85 69 79.5', 'none', {stroke: mix(skin, LID, 0.25), 'stroke-width': 0.5});
  // 앞 — 얼굴 · 이목구비 · 수염 · 앞머리 · 장식
  let fr = '';
  if (x.hs === 'long' && !hasFront) fr += P(L.length ? jit(x.key + 'f', LOCKS.front).map(([p, d, w, r]) => whip(p, d, w, r)).join('') : '', hair);
  if (H.ear) fr += H.ear === 'long' ? E(78.5, 64, 3.4, 9, skin) : E(78.6, 61.5, 2.9, 5.2, skin) + P('M78.2 58.5C79.6 59.5 79.8 62 78.6 64', 'none', {stroke: mix(skin, LID, 0.4), 'stroke-width': 0.45});
  fr += P(H.skull ? FACE_BALD : FACE, skin);
  if (H.shade) fr += P('M41 55C39 43 47 32 60 31.5C73 31 81.5 39 80.8 51C79 45 74 40 67 38.5C58 37 46 42 41 55Z', '#8C93A3', {...NS, opacity: 0.3});
  fr += features(a, x);
  const bc = a.bc ?? (hair === '#F4F1EA' ? '#EDE8DD' : hair);
  if (a.b && BEARD[a.b]) fr += P(BEARD[a.b], bc) + (a.b === 'goatee' ? '' : P(BEARD_S, 'none', {stroke: mix(bc, '#2A1A14', 0.35), 'stroke-width': 0.5}));
  if (a.mu || (a.b && a.b !== 'short' && a.b !== 'chin' && a.b !== 'goatee')) fr += P(MUST, bc, {'stroke-width': 0.5});
  if (H.f) fr += P(H.f, hair);
  if (H.s) fr += P(H.s, 'none', {stroke: strand, 'stroke-width': 0.55});
  if (H.curls) {
    let d = '';
    const n = H.curls;
    for (let i = 0; i < n; i++) { const t = ((168 + (i * 210) / (n - 1)) * Math.PI) / 180, cx = 61 + 21.5 * Math.cos(t), cy = 50 + 18 * Math.sin(t), r = H.knot ? 3.4 : 4.4; d += `M${f(cx + r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0`; }
    if (H.knot) d += 'M68 31a7.5 7.5 0 1 0 -15 0a7.5 7.5 0 1 0 15 0';
    fr += P(d, hair, {'stroke-width': 0.55});
  }
  if (H.rolls) fr += P('M44.5 56a4.5 3.6 0 1 0 -9 0a4.5 3.6 0 1 0 9 0M44.5 64a4.5 3.6 0 1 0 -9 0a4.5 3.6 0 1 0 9 0M85 55a4.5 3.6 0 1 0 -9 0a4.5 3.6 0 1 0 9 0M85 63a4.5 3.6 0 1 0 -9 0a4.5 3.6 0 1 0 9 0', hair, {'stroke-width': 0.55});
  fr += heads.map(h => h.f).join('');
  const freeTemple = !heads.length || heads.every(h => h.free);
  if (freeTemple && x.hs !== 'bald' && x.hs !== 'shaved') fr += bloom(39.5, 47, 4.2, x.petal, 18);
  const T = x.mirror ? 'matrix(-1 0 0 1 120 0) rotate(-4 60 80)' : 'rotate(-4 60 80)';
  const headB = G({transform: T}, back), headF = G({transform: T}, fr);
  return {headB, headF, body: bust(a, skin), item};
}

/* ── 물건 — 옛 기계가 그린 물건을 작게(손 동그라미는 빼고) 오른쪽 아래에 ── */
const MARK = '#010203';
function itemOf(draw, skin) {
  if (!draw) return '';
  const s = draw(MARK).replace(/<circle[^>]*r="5\.6" fill="#010203"[^>]*\/>/g, '').split(MARK).join(skin).replace(/ d="([^"]+)"/g, (_, d) => ' d="' + d.replace(/-?\d*\.\d+/g, v => String(Math.round(+v))) + '"');
  return G({transform: 'matrix(.56 0 0 .56 38.8 45.9)', stroke: '#3A2430', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}, s);
}

/* ── 후광 · 모자이크 · 덩굴 · 별 ── */
const HALO_DASH = ['1.1 2.25', '5 1.7', '2.6 2.6', '.9 1.6', '7 2.4', '1.8 1.6'];
function halo(bg, ring, k) {
  return G({'data-mucha': 'halo', fill: 'none'},
    C(60, 52, 44, mix(bg, '#FFFFFF', 0.12), {stroke: ring, 'stroke-width': 1.6})
    + C(60, 52, 40.6, 'none', {stroke: GOLD, 'stroke-width': 0.7})
    + C(60, 52, 38, 'none', {stroke: GOLD, 'stroke-width': 1.8, 'stroke-dasharray': '0 3.98', 'stroke-linecap': 'round'})
    + C(60, 52, 32.5, 'none', {stroke: mix(ring, '#FFFFFF', 0.74), 'stroke-width': 4.4, 'stroke-dasharray': HALO_DASH[k % 6]})
    + C(60, 52, 29, 'none', {stroke: GOLD, 'stroke-width': 0.6}));
}
const ARC = r => `M${f(60 - r)} 60A${f(r)} ${f(r)} 0 0 0 ${f(60 + r)} 60`;
const MOSAIC = G({'data-mucha': 'mosaic', fill: 'none'},
  G({'stroke-width': 6, 'stroke-dasharray': '4.2 9.8'}, el('path', {d: ARC(53.5), stroke: '#D4AA4F'}) + el('path', {d: ARC(53.5), stroke: '#2F4A7A', 'stroke-dashoffset': -4.67}) + el('path', {d: ARC(53.5), stroke: '#5E8F5A', 'stroke-dashoffset': -9.33}))
  + P(ARC(50.3) + ARC(56.7), 'none', {stroke: GOLDD, 'stroke-width': 0.9})
  + P(ARC(53.5), 'none', {stroke: '#FFF8E8', 'stroke-width': 1.3, 'stroke-dasharray': '0 4.67', 'stroke-dashoffset': -2.1, 'stroke-linecap': 'round'})
  + C(6.5, 60, 3.4, GOLDL, {stroke: GOLDD, 'stroke-width': 0.7}) + C(113.5, 60, 3.4, GOLDL, {stroke: GOLDD, 'stroke-width': 0.7}));
function vine(petal, bud) {
  // 덩굴은 왼쪽 어깨 위(높이 91 아래)에만 — 어깨에서 말리는 머리채와 겹치지 않게
  const leaves = leaf(38, 110.5, 290, 7, 2.3) + leaf(30.5, 104.5, 230, 7, 2.3) + leaf(42, 112.5, 250, 6, 2);
  return G({'data-mucha': 'vine', stroke: '#4E6B3A', 'stroke-width': 0.5},
    P('M45 114C37 111 30 106.5 27 100C25 95 27.5 91.5 31 93C34 94.5 32.5 98.5 29.7 97.6', 'none', {stroke: '#6E9A4F', 'stroke-width': 1.5})
    + P(leaves, '#8DB36A') + bloom(36.5, 104, 4.6, petal, 0) + P('M24.5 98C22 95.5 22.3 92 24.6 90.8C27 92 27.1 95.5 24.5 98Z', bud, {'stroke-width': 0.5}));
}
const STARS = G({'data-mucha': 'stars', fill: GOLDL, stroke: GOLDD, 'stroke-width': 0.4}, P(spark(27, 33, 4) + spark(94, 30, 3.4) + spark(86, 15, 2.6) + spark(34, 18, 2.2) + spark(100, 47, 2)));
const SUNRAY = G({'data-mucha': 'stars', fill: 'none'}, C(60, 52, 40, 'none', {stroke: GOLDL, 'stroke-width': 7, 'stroke-dasharray': '1.2 3'}));
const MOON = G({'data-mucha': 'stars'}, P('M30 20C22 26 20 38 25 46C17 41 15 29 21 22C24 19 27 19 30 20Z', '#FFF6D8', {stroke: GOLDD, 'stroke-width': 0.6}) + P(spark(92, 26, 3.6) + spark(100, 42, 2.4) + spark(84, 13, 2.2), GOLDL, {stroke: GOLDD, 'stroke-width': 0.4}));

/* ── 그림 한 장 ── */
function svg(a, x, extra = '') {
  const fig = figure(a, x, x.item);
  const heads = x.janus
    ? G({transform: 'translate(-9 0)'}, fig.headB) + G({transform: 'translate(9 0) matrix(-1 0 0 1 120 0)'}, fig.headB) + fig.body + G({transform: 'translate(9 0) matrix(-1 0 0 1 120 0)'}, fig.headF) + G({transform: 'translate(-9 0)'}, fig.headF)
    : fig.headB + fig.body + fig.headF;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">'
    + '<defs><clipPath id="c"><circle cx="60" cy="60" r="58"/></clipPath>'
    + '<filter id="o" x="-.1" y="-.1" width="1.2" height="1.2"><feMorphology in="SourceAlpha" operator="dilate" radius="1.15"/><feColorMatrix values="0 0 0 0 .24 0 0 0 0 .15 0 0 0 0 .13 0 0 0 1 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
    + C(60, 60, 58.6, CREAM)
    + `<g clip-path="url(#c)">` + halo(x.bg, x.ring, x.k) + (x.sky ?? '') + MOSAIC
    + G({'data-mucha': 'outline', filter: 'url(#o)', stroke: INKD, 'stroke-width': 0.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}, heads)
    + fig.item + extra + vine(x.petal, x.bud) + '</g>'
    + C(60, 60, 58.6, 'none', {stroke: GOLDD, 'stroke-width': 1.4}) + '</svg>\n';
}

/* ── 신 일흔둘 ── */
const FEM = /여신|여왕|어머니예요|요정|아내|딸이에요/;
const SKY = {7: STARS, 14: STARS, 34: STARS, 35: SUNRAY, 36: MOON, 46: STARS, 48: STARS, 2: STARS};
function godCfg(n) {
  const g = GODS[n]; if (!g) throw new Error('없는 번호 ' + n);
  let a = GOD_ART[n]; if (!a) throw new Error('옛 그림 표에 없는 번호 ' + n);
  const [bg, ring] = GROUP_BG[g[5]];
  const x = {key: 'r' + n, k: g[5], bg, ring, fem: FEM.test(g[4 - 1]), mirror: n % 2 === 0, petal: PETALS[Math.floor(seed('p' + n) * PETALS.length)], bud: '#F2A3B6'};
  if (a.sp === 'janus') { a = {...a, s: 'b', hs: 'short', b: 'full', old: 1, hw: [['band', GOLDL]]}; x.janus = 1; }
  if (a.sp === 'stone') { a = {s: 'stone', h: '#BDB3A2', hs: 'bald', b: 'short', e: 'sleep', body: 'stone', robe: '#CFC6B4'}; }
  if (a.sp === 'ghost') { a = {s: 'g', h: '#C9D6EA', hs: 'long', e: 'sleep', robe: '#DCE6F4', drape: '#F4F7FC'}; x.fem = 0; }
  x.skin = SKIN[a.s] ?? SKIN.b; x.hair = a.h === '#2F2629' ? '#3B2C2D' : a.h ?? '#8A5A3B'; x.hs = a.hs ?? 'short';
  if (x.fem && x.hs === 'short') x.hs = 'long';
  x.ribbon = mix(a.drape && a.drape !== '#FFFFFF' ? a.drape : GOLDL, CREAM, 0.1);
  x.sky = SKY[n] ?? '';
  x.item = itemOf(a.it ? KIT.IT[a.it] : null, x.skin);
  return [a, x];
}
export function romanSvg(n) { const [a, x] = godCfg(n); return svg(a, x); }

/* ── 스승 서른아홉 ── */
function sageCfg(id) {
  const a0 = SAGE_ART[id], p = PEOPLE.find(q => q.id === id);
  if (!a0 || !p) throw new Error('없는 이름 ' + id);
  const [bg, ring] = STEP_BG[p.step];
  const a = {...a0, hw: (a0.hw ?? []).filter(h => h !== 'halo')};
  const x = {key: 's' + id, k: p.step + 2, bg, ring, fem: id === 'curie', mirror: PEOPLE.findIndex(q => q.id === id) % 2 === 1, petal: PETALS[Math.floor(seed('q' + id) * PETALS.length)], bud: '#F2A3B6'};
  x.skin = SKIN[a.s] ?? SKIN.b; x.hair = a.h === '#2F2629' ? '#3B2C2D' : a.h ?? '#8A5A3B'; x.hs = a.hs ?? 'short';
  x.ribbon = mix(a.drape ?? a.col ?? GOLDL, CREAM, 0.1);
  if (x.hs === 'long' && !x.fem && a.b) x.hs = 'long';
  x.item = itemOf(a.it ? IT2[a.it] : null, x.skin);
  const extra = a.x?.includes('cats') ? itemOf(EX2.cats, x.skin) : '';
  return [a, x, extra];
}
export function sageSvg(id) { const [a, x, extra] = sageCfg(id); return svg(a, x, extra); }

/* 무하 요소 이름 셈(data-mucha) — 검사 · 보고용 */
export const muchaNames = s => [...new Set([...s.matchAll(/data-mucha="([a-z]+)"/g)].map(m => m[1]))];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const jobs = [...Array.from({length: 72}, (_, i) => [path.join(OUT_ROMAN, i + 1 + '.svg'), romanSvg(i + 1)]), ...PEOPLE.map(p => [path.join(OUT_SAGE, p.id + '.svg'), sageSvg(p.id)])];
  let bad = 0;
  if (!check) { fs.mkdirSync(OUT_ROMAN, {recursive: true}); fs.mkdirSync(OUT_SAGE, {recursive: true}); }
  for (const [file, s] of jobs) {
    if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== s) { bad++; console.log('다름 ' + path.relative(process.cwd(), file)); } } else fs.writeFileSync(file, s);
  }
  const n = jobs.length;
  console.log(check ? (bad ? `얼굴 ${bad}장이 기계와 다름` : `얼굴 ${n}장 모두 기계와 같음(신 72 · 스승 ${PEOPLE.length})`) : `얼굴 ${n}장을 씀 — ${path.relative(process.cwd(), OUT_ROMAN)} · ${path.relative(process.cwd(), OUT_SAGE)}`);
  process.exit(bad ? 1 : 0);
}
