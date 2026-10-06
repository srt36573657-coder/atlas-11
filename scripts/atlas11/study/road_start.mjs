#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 「대세 상승 초입의 출목표」 — 날마다 출목표 모양을 세고, 그 뒤 6달에 무슨 일이 있었는지 붙인다(공부 기록 · 사이트는 바꾸지 않음)
 *   사장님 2026-10-06 01:17 「어떤 출목표가 나와야 대세 상승을 하는 초입에 출목표인지 분석」 · 01:24 「제안대로해」
 *     ① 대세 상승 = 그 날 종가에서 그 뒤 120거래일(6달) 안에 종가가 50% 넘게 오른 적이 있음
 *     ② 회사 하나하나(ATLAS 365곳 · 같은 셈을 1,300곳에도 돌려 고르기 치우침을 본다)
 *     ③ 결과는 공부 보고서로만 — 사이트에 「곧 오른다」 표시를 넣지 않는다(2026-10-04 「예측 … 표현하지 마라」)
 *   출목표 셈은 사이트 코드 그대로(site/app/road.js roadOf · site/app/shapes.js SHAPES) — 날마다 직전 21개 종가(20거래일)
 *   후보 모양은 결과를 보기 전에 정했다(2026-10-06 01:35): 사이트 8가지 + 아래 EXTRA 6가지. 결과를 본 뒤 더하거나 빼지 않는다.
 *   크게 떨어짐 = 그 뒤 120거래일 안에 종가가 1/1.5(−33.3%) 아래로 내려간 적이 있음 — 「크게 오름」이 그냥 「크게 움직임」인지 가리려고 함께 센다
 *   이상한 날 걸러내기: 하루 등락이 ±31%를 넘는 날(한국 하루 한도 ±30% 밖 = 액면 분할·병합 같은 자료 끊김)이 창(앞 20일 · 뒤 120일)에 있으면 뺀다
 *   원천: reports/atlas11/universe/2026-10-05-0940/bundle.json.gz(네이버 일봉 원문 · 2023-04-20 ~ 2026-10-02 · 회사마다 최대 840거래일)
 *   쓰는 법: node scripts/atlas11/study/road_start.mjs --set 365|all --out <파일.csv.gz>
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import {roadOf} from '../../../site/app/road.js';
import {SHAPES} from '../../../site/app/shapes.js';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SET = arg('--set', '365'), OUT = arg('--out');
const BUNDLE = 'reports/atlas11/universe/2026-10-05-0940/bundle.json.gz', BOARD = 'public/data/atlas11/view/board.json';
// 2026-10-06 10:06 사장님 「그러면 6개월에 30%도 찾아봐 5개월 4개월 3개월 1개월도」 — 기간(--ahead 거래일)과 오름 폭(--up 배)을 바꿔 셀 수 있게(기본은 첫 판 그대로 120 · 1.5)
//   --range: 날짜 범위를 가장 긴 기간(120)에 맞춰 기간끼리 같은 날들을 견주게(짧은 기간도 2026-04-07 까지만)
const WIN = 20, AHEAD = Number(arg('--ahead', '120')), UP = Number(arg('--up', '1.5')), DOWN = 1 / UP, RANGE = Math.max(AHEAD, Number(arg('--range', '0'))), JUMP = 0.31;

/* 사이트 shapes.js 안의 도우미와 같은 셈(내보내지 않아서 같은 뜻으로 다시 적음) */
const runsOf = road => { const out = []; for (const c of road.cells) { const l = out.at(-1); if (l && l.side === c.side) l.n++; else out.push({side: c.side, n: 1}); } return out; };
const perDayMap = (road, side) => { const m = new Map(); for (const c of road.cells) if (c.side === side) m.set(c.day, (m.get(c.day) ?? 0) + 1); return m; };
/** 결과를 보기 전에 정한 더 볼 모양 여섯(2026-10-06 01:35) — 초입에 있을 법한 모양과 그 반대 모양 */
export const EXTRA = [
  {id: 'quiet', name: '잔잔함', text: '동그라미가 모두 10개 이하(한 칸 = 1%일 때) — 20거래일 동안 움직임이 작음', test: r => r.unit === 0.01 && r.all.up + r.all.down <= 10},
  {id: 'blueMore', name: '파랑이 더 많음', text: '파랑 동그라미가 빨강보다 많음 — 지난 20거래일 내림이 셈', test: r => r.all.down > r.all.up},
  {id: 'turnUp', name: '끝에서 돌아섬', text: '끝 줄이 빨강이고 바로 앞 파랑 줄이 3개 이상', test: r => { const rs = runsOf(r); return rs.length >= 2 && rs.at(-1).side === 'up' && rs.at(-2).side === 'down' && rs.at(-2).n >= 3; }},
  {id: 'freshBigRed', name: '끝 5일 큰 빨강', text: '최근 5거래일 안에 하루 빨강 5개 이상인 날이 있음', test: r => { const m = perDayMap(r, 'up'); for (const [d, n] of m) if (n >= 5 && d >= r.days - r.recentDays) return true; return false; }},
  {id: 'redLonger', name: '빨강 줄이 길어짐', text: '끝 빨강 줄이 3개 이상이고 그 앞 어느 빨강 줄보다 김', test: r => { const rs = runsOf(r); const last = rs.at(-1); if (!last || last.side !== 'up' || last.n < 3) return false; return rs.slice(0, -1).filter(x => x.side === 'up').every(x => x.n < last.n); }},
  {id: 'bigBlueDay', name: '하루 파랑 5개', text: '하루에 파랑 동그라미 5개 이상인 날이 있음(하루 빨강 5개의 거울)', test: r => [...perDayMap(r, 'down').values()].some(n => n >= 5)},
];
export const ALL = [...SHAPES.map(s => ({id: s.id, name: s.name, text: s.text, test: s.test, site: true})), ...EXTRA.map(s => ({...s, site: false}))];

function main() {
  const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(BUNDLE)));
  const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
  const inBoard = new Set(board.companies.map(c => c.code));
  const codes = SET === 'all' ? Object.keys(bundle.stocks) : board.companies.map(c => c.code);
  const head = ['code', 'date', 'i', 'n', 'unit', 'up', 'down', 'ret20', 'fmax', 'fmin', 'up50', 'down33', 'board', ...ALL.map(s => s.id)];
  const lines = [head.join(',')];
  let stocks = 0, windows = 0, cut = 0;
  for (const code of codes) {
    const rows = bundle.stocks[code]?.fchart?.rows;
    if (!Array.isArray(rows) || rows.length < WIN + 1 + AHEAD) continue;
    const ds = rows.map(r => String(r[0])), cs = rows.map(r => Number(r[4]));
    if (cs.some(v => !(v > 0))) continue;
    const jump = cs.map((c, i) => i > 0 && Math.abs(c / cs[i - 1] - 1) > JUMP); // 이 날의 등락이 한도 밖
    const bad = [0]; for (let i = 1; i < cs.length; i++) bad.push(bad[i - 1] + (jump[i] ? 1 : 0)); // 누적 — 구간 안 이상한 날 수
    const badIn = (a, b) => bad[b] - bad[a]; // (a, b] 사이 날의 등락 중 이상한 것
    stocks++;
    for (let t = WIN; t + RANGE < cs.length; t++) {
      if (badIn(t - WIN, t + RANGE) > 0) { cut++; continue; }
      const road = roadOf(cs.slice(t - WIN, t + 1));
      let fmax = -Infinity, fmin = Infinity; for (let k = t + 1; k <= t + AHEAD; k++) { if (cs[k] > fmax) fmax = cs[k]; if (cs[k] < fmin) fmin = cs[k]; }
      const up50 = fmax >= cs[t] * UP ? 1 : 0, down33 = fmin <= cs[t] * DOWN ? 1 : 0;
      const bits = ALL.map(s => (s.test(road) ? 1 : 0));
      lines.push([code, ds[t], t, cs.length, road.unit, road.all.up, road.all.down, (cs[t] / cs[t - WIN] - 1).toFixed(4), (fmax / cs[t]).toFixed(4), (fmin / cs[t]).toFixed(4), up50, down33, inBoard.has(code) ? 1 : 0, ...bits].join(','));
      windows++;
    }
  }
  fs.writeFileSync(OUT, zlib.gzipSync(lines.join('\n')));
  const meta = {set: SET, ahead: AHEAD, upX: UP, range: RANGE, stocks, windows, cut, shapes: ALL.map(s => ({id: s.id, name: s.name, text: s.text, site: s.site})), win: WIN, ahead: AHEAD, up: UP, down: DOWN, jump: JUMP, bundle: BUNDLE, at: new Date().toISOString()};
  fs.writeFileSync(OUT.replace(/\.csv\.gz$/, '') + '.meta.json', JSON.stringify(meta, null, 1));
  console.log(JSON.stringify({set: SET, stocks, windows, cut}));
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main();
