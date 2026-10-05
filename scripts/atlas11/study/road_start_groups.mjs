#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 「대세 상승 초입의 출목표」 둘째 판 — 업종(73개)과 시장 전체(365곳 · 1,287곳 평균)의 출목표(사이트는 바꾸지 않음)
 *   사장님 2026-10-06 07:36 「이작업 하다가 멈추었잖아 계속하자」(07:00 답의 「1. 시장 전체나 업종의 출목표로 같은 공부를 해 볼까요?」를 이음)
 *   업종 지수 = 그 업종 회사 다섯(판 board.groups 의 codes)의 하루 변화를 똑같은 무게로 평균해 이어 붙인 값(첫날 100)
 *   시장 지수 = 같은 방법으로 365곳(판) · 1,287곳(묶음 전체) 평균 — 시장 전체 출목표(지수 자체 기록은 저장소에 없어 회사 평균으로 대신)
 *   출목표 · 모양은 회사 공부(road_start.mjs)와 같은 셈(site/app/road.js roadOf · shapes.js SHAPES + EXTRA 6가지) — 모양 목록을 새로 더하지 않음
 *   대세 상승 = 그 뒤 120거래일 안에 지수가 UP 배 이상(기본 1.5) · 크게 떨어짐 = 1/UP 이하 — --up 1.3 로 「30%」도 셈(업종 지수는 회사보다 덜 출렁여서)
 *   하루 평균에 넣는 회사가 3곳보다 적은 날은 업종 지수에서 뺀다 · 하루 ±31% 넘는 회사 등락은 그 회사만 그날 뺀다
 *   쓰는 법: node scripts/atlas11/study/road_start_groups.mjs --up 1.5 --out <업종.csv.gz> --mkt <시장.json>
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import {roadOf} from '../../../site/app/road.js';
import {ALL} from './road_start.mjs';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const UP = Number(arg('--up', '1.5')), DOWN = 1 / UP, OUT = arg('--out'), MKT = arg('--mkt');
const WIN = 20, AHEAD = 120, JUMP = 0.31, MIN_MEMBERS = 3;
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync('reports/atlas11/universe/2026-10-05-0940/bundle.json.gz')));
const board = JSON.parse(fs.readFileSync('public/data/atlas11/view/board.json', 'utf8'));

/** 회사 하나 → 날짜별 하루 변화(Map 날짜 → 변화) */
function retsOf(code) {
  const rows = bundle.stocks[code]?.fchart?.rows; const m = new Map();
  if (!Array.isArray(rows)) return m;
  for (let i = 1; i < rows.length; i++) { const a = Number(rows[i - 1][4]), b = Number(rows[i][4]); if (!(a > 0 && b > 0)) continue; const r = b / a - 1; if (Math.abs(r) > JUMP) continue; m.set(String(rows[i][0]), r); }
  return m;
}
const allDates = [...new Set(Object.values(bundle.stocks).flatMap(s => (s.fchart?.rows ?? []).map(r => String(r[0]))))].sort();
/** 회사 여럿 → 똑같은 무게 지수(날짜 · 값 · 그날 들어간 회사 수) */
function indexOf(codes, minMembers) {
  const rs = codes.map(retsOf).filter(m => m.size);
  const dates = [], vals = [], ns = []; let v = 100, started = false;
  for (const d of allDates) {
    const xs = rs.map(m => m.get(d)).filter(x => x !== undefined);
    if (xs.length < minMembers) { if (started) { dates.length = 0; vals.length = 0; ns.length = 0; started = false; v = 100; } continue; } // 끊기면 처음부터(이어 붙이지 않음)
    if (!started) { dates.push(prevDate(d)); vals.push(v); ns.push(xs.length); started = true; }
    v *= 1 + xs.reduce((s, x) => s + x, 0) / xs.length; dates.push(d); vals.push(v); ns.push(xs.length);
  }
  return {dates, vals, ns};
}
function prevDate(d) { const i = allDates.indexOf(d); return i > 0 ? allDates[i - 1] : d; }

/** 지수 하나 → 날마다 줄(회사 공부와 같은 칸) */
function windowsOf(id, s) {
  const out = []; const cs = s.vals, ds = s.dates;
  for (let t = WIN; t + AHEAD < cs.length; t++) {
    const road = roadOf(cs.slice(t - WIN, t + 1));
    let fmax = -Infinity, fmin = Infinity; for (let k = t + 1; k <= t + AHEAD; k++) { if (cs[k] > fmax) fmax = cs[k]; if (cs[k] < fmin) fmin = cs[k]; }
    out.push({id, date: ds[t], i: t, n: cs.length, unit: road.unit, up: road.all.up, down: road.all.down, ret20: cs[t] / cs[t - WIN] - 1, fmax: fmax / cs[t], fmin: fmin / cs[t],
      up50: fmax >= cs[t] * UP ? 1 : 0, down33: fmin <= cs[t] * DOWN ? 1 : 0, bits: ALL.map(x => (x.test(road) ? 1 : 0)), cells: road.cells});
  }
  return out;
}

const head = ['code', 'date', 'i', 'n', 'unit', 'up', 'down', 'ret20', 'fmax', 'fmin', 'up50', 'down33', 'board', ...ALL.map(s => s.id)];
const lines = [head.join(',')]; let windows = 0; const lens = [];
for (const g of board.groups) {
  const s = indexOf(g.codes, MIN_MEMBERS); lens.push(s.vals.length);
  for (const w of windowsOf(g.id, s)) { lines.push([w.id, w.date, w.i, w.n, w.unit, w.up, w.down, w.ret20.toFixed(4), w.fmax.toFixed(4), w.fmin.toFixed(4), w.up50, w.down33, 1, ...w.bits].join(',')); windows++; }
}
fs.writeFileSync(OUT, zlib.gzipSync(lines.join('\n')));
fs.writeFileSync(OUT.replace(/\.csv\.gz$/, '') + '.meta.json', JSON.stringify({set: 'groups', unitOfStudy: '업종 지수(회사 다섯 똑같은 무게)', groups: board.groups.length, windows, up: UP, down: DOWN, win: WIN, ahead: AHEAD, minMembers: MIN_MEMBERS, seriesLen: {min: Math.min(...lens), max: Math.max(...lens)}, shapes: ALL.map(s => ({id: s.id, name: s.name, text: s.text, site: s.site})), at: new Date().toISOString()}, null, 1));

// 시장 전체 — 365곳(판) · 1,287곳(묶음에서 기록이 141일 넘는 회사)
const all1287 = Object.keys(bundle.stocks).filter(c => (bundle.stocks[c].fchart?.rows?.length ?? 0) >= WIN + 1 + AHEAD);
const mk = {};
for (const [k, codes, minM] of [['m365', board.companies.map(c => c.code), 200], ['m1287', all1287, 600]]) {
  const s = indexOf(codes, minM); const ws = windowsOf(k, s);
  mk[k] = {members: codes.length, minMembers: minM, dates: s.dates, vals: s.vals.map(v => +v.toFixed(3)), windows: ws.map(w => ({date: w.date, i: w.i, unit: w.unit, up: w.up, down: w.down, ret20: +w.ret20.toFixed(4), fmax: +w.fmax.toFixed(4), fmin: +w.fmin.toFixed(4), up50: w.up50, down33: w.down33, bits: w.bits, cells: w.cells.map(c => [c.col, c.row, c.side === 'up' ? 1 : 0])}))};
}
fs.writeFileSync(MKT, JSON.stringify({up: UP, shapes: ALL.map(s => s.id), ...mk}));
console.log(JSON.stringify({up: UP, groups: board.groups.length, windows, seriesLen: [Math.min(...lens), Math.max(...lens)], m365: mk.m365.windows.length, m1287: mk.m1287.windows.length, m365pos: mk.m365.windows.filter(w => w.up50).length, m1287pos: mk.m1287.windows.filter(w => w.up50).length}));
