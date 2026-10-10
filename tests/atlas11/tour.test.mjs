// 첫 화면 저절로 둘러보기 — 걸음 글과 셈(site/app/tour-model.js) · 규칙 49 ④(사장님 2026-10-10 05:14 「4너에제안대로 해」) · 설계 보고 ④ 「자동 재생 8단계」
//   숫자는 판 읽기에서만 · 몬테카를로 숫자 곁에는 늘 「모형 가정 아래 추정 · 검증 전」 · 평균(mean)은 싣지 않음 · 값이 없으면 까닭(지어내지 않음) · 앞날 말 · 권유 말 없음
import test from 'node:test';
import assert from 'node:assert/strict';
import {tourOf, fanOf, dwellOf, plainOf, speakOf, pctR, TOUR_STEPS, KSS, MC_TAG} from '../../site/app/tour-model.js';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';
import {BANNED} from '../../lib/atlas11/changelog.mjs';
import {TPL} from '../../site/app/easy-ko.js';

const BAN = new RegExp([PREDICTION_WORDS.source, '사라[!.\\s]|팔라[!.\\s]|추천|목표가|확실|보장|무조건|확률', ...BANNED.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))].join('|'));
const item = (rank, code, g, extra = {}) => ({rank, code, name: `회사${rank}`, sector: `업종${g}`, g, status: 'met', grow: {m12D: 100 - rank, plantedAt: '2026-10-08'}, risk: {text: '한 곳만 보면 흔들림이 큼'}, ...extra});
const C = {ready: true, asOf: '2026-10-08', hold: 60, netPct: 20, pool: {universe: 365}, grow: {qD: 66.1, planted: {at: '2026-10-08', next: null}}, items: [item(1, 'A', 'g1'), item(2, 'B', 'g2'), item(3, 'C', 'g1')]};
const stocks = [{code: 'A', name: '회사1', g: 'g1'}, {code: 'B', name: '회사2', g: 'g2'}, {code: 'C', name: '회사3', g: 'g1'}, {code: 'D', name: '이웃', g: 'g1'}];
const row = code => ({code, n: 22153, mean: 0.0777, median: -0.037, ploss: 0.538, q05: -0.52, q10: -0.42, q90: 0.725, cvar5: -0.608});
const days = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], band = {n: 22153, q: days.map(d => [-0.007 * d, -0.004 * d, -0.0006 * d, 0.004 * d, 0.012 * d]), rep: [0.1, 0.5, 0.9].map((f, k) => ({f, idx: k, end: [-0.42, -0.037, 0.725][k], path: Array.from({length: 61}, (_, d) => [-0.007, -0.0006, 0.012][k] * d)}))};
const mc = {runId: 'r', asOf: '2026-10-08', rows: [row('A'), row('B'), row('C')], track: {codes: ['A', 'B', 'C'], days}, bands: {A: band}};
const chk = (id, verdict, value) => ({id, label: id, verdict, value});
const elim = {rows: [{code: 'A', state: 'pass', first: null, flags: ['tail'], checks: [chk('close', 'pass', '종가 56,100'), chk('tail', 'na', '표시만')]}, {code: 'B', state: 'hold', first: 'risk', flags: [], checks: [chk('risk', 'hold', '확인 못 함')]}]};
const T = tourOf({C, mc, elim, stocks});
const all = T.items.flatMap(it => it.steps);
const text = s => [s.title, ...s.lines.map(plainOf), s.note ?? '', ...(s.checks ?? []).map(c => `${c.label} ${c.value}`)].join(' ');

test('후보마다 8걸음 — 기승전결 차례 · 이름 · 그림 손잡이(막대 그림 — 2026-10-10 입체 섬 · 바둑판을 바꿈)', () => {
  assert.equal(T.items.length, 3);
  for (const it of T.items) {
    assert.deepEqual(it.steps.map(s => [s.k, s.name]), TOUR_STEPS.map(x => [...x]));
    assert.deepEqual(it.steps.map(s => s.act), ['to', null, 'rise', 'wave', null, null, null, null]);
    assert.ok(it.steps.every(s => s.ms >= 3800 && s.ms <= 11500), '읽을 시간 3.8 ~ 11.5초');
  }
  assert.deepEqual(KSS.map(x => x[0]), ['기', '승', '전', '결']);
  assert.equal(T.items[0].steps[0].title, '1위 · 회사1');
  assert.match(plainOf(T.items[0].steps[0].lines[0]), /미리 정한 규칙 차례 1번째 · 1년 추세 \+99\.0% · 업종g1/);
});
test('핵심 숫자 = 판 읽기 몬테카를로 행 · 꼬리표 · 평균(mean)은 어디에도 없음', () => {
  const s = T.items[0].steps[1], t = text(s);
  assert.ok(s.title.includes(MC_TAG));
  assert.ok(t.includes(`경로 100번 중 80번이 ${pctR(-0.42)} ~ ${pctR(0.725)} 사이`)); assert.ok(t.includes(`가운데 값 ${pctR(-0.037)}`)); // 2026-10-10 18:22 다섯 팀 전체 검토 — 자연 빈도 · ▲▼ 없이
  assert.ok(t.includes('손실로 끝난 경로 100번 중 54번')); assert.ok(t.includes(`가장 나쁜 5% 경로 평균 ${pctR(-0.608)}`));
  assert.ok(s.lines.flat().filter(x => typeof x === 'object').every(x => 'm' in x), '셈 틀 숫자는 {m}(먹색 · 부호만 — 지난 기록 숫자 꼴 아님)');
  for (const x of all) assert.ok(!text(x).includes('+7.8%') && !text(x).includes('7.77'), '평균(mean +7.8%)을 싣지 않음');
  assert.ok(T.items[0].steps[4].title.includes(MC_TAG), '시뮬레이션 요약에도 꼬리표');
});
test('같은 업종(판 읽기 g)만 함께 움직이는 곳 · 원인 자료는 없다고 밝힘', () => {
  const s = T.items[0].steps[3];
  assert.deepEqual(s.peers, ['C', 'D']); assert.match(text(s), /같은 업종 2곳\(회사3 · 이웃\) — 같은 사건에 함께 흔들릴 수 있음/); assert.match(s.note, /자료는 아직 없음/);
  assert.ok(!all.some(x => /솟|탑|섬|돎|돌기|입체|칸에 테|바둑판/.test(text(x))), '입체 섬 · 바둑판 말(솟음 · 탑 · 섬 · 돎 · 입체 · 칸 · 바둑판) 없음 — 2026-10-10 「3d 영구 삭제해」 · 「바둑판 영구 삭제해」');
  assert.deepEqual(T.items[1].steps[3].peers, []); assert.match(text(T.items[1].steps[3]), /같은 업종 회사 없음/);
});
test('범위 띠 — 따라간 회사만 그림 · 없으면 까닭', () => {
  assert.ok(T.items[0].steps[4].fan); assert.equal(T.items[0].steps[4].fan.H, 60);
  assert.equal(T.items[1].steps[4].fan, undefined); assert.match(text(T.items[1].steps[4]), /범위 띠 없음/);
});
test('소거 까닭 — 통과 · 보류(처음 걸린 것) · 하락 위험은 표시만 · 판정 없음은 까닭', () => {
  const a = T.items[0].steps[5], b = T.items[1].steps[5], c = T.items[2].steps[5];
  assert.equal(a.title, '소거 기준을 모두 넘음'); assert.deepEqual(a.checks.map(x => x.mark), ['✓', '·']); assert.match(a.note, /표시만/);
  assert.equal(b.title, '보류 — 자료가 없어 확인 못 한 것: risk'); assert.match(text(b), /확인 못 함/); // 보류는 「걸린 것」이 아니라 확인 못 함(2026-10-10 18:22 다섯 팀 전체 검토)
  assert.equal(c.title, '소거 판정 없음');
});
test('판단과 다음 확인 — 한국 · 미국(위험 공시 확인 못 함) · 마지막 걸음은 처음으로 돌아가 멈춤', () => {
  assert.match(text(T.items[0].steps[6]), /위험 공시 없음/);
  const U = tourOf({C, mc, elim, stocks, us: true});
  assert.match(text(U.items[0].steps[6]), /위험 공시는 확인 못 함/);
  assert.match(text(T.items[0].steps[7]), /다음은 2위 · 회사2/);
  assert.match(text(T.items[2].steps[7]), /3곳을 다 봤어요 — 처음\(1위 회사1\)으로 돌아가 멈춤/);
  assert.match(text(T.items[0].steps[6]), /다음 담는 날\(10월 8일부터 60거래일 뒤\)/);
});
test('몬테카를로가 없는 날 — 숫자를 지어내지 않고 까닭', () => {
  const N = tourOf({C, mc: {none: true, why: '입력 지문이 판의 입력과 다름'}, elim: null, stocks});
  assert.match(text(N.items[0].steps[1]), /이번 회차 범위 없음 — 입력 지문이 판의 입력과 다름/);
  assert.ok(!/\d+\.\d%/.test(text(N.items[0].steps[1]).replace(MC_TAG, '')), '범위 숫자 없음');
  assert.match(text(N.items[0].steps[4]), /범위 띠 없음 — 입력 지문/);
  assert.equal(tourOf({C: {...C, items: []}, mc, elim, stocks}), null); assert.equal(tourOf({C: {...C, ready: false}, mc}), null);
});
test('앞날 말 · 권유 말 · 「확률」 없음(모든 걸음 · 읽는 글)', () => {
  for (const U of [T, tourOf({C, mc, elim, stocks, us: true}), tourOf({C, mc: {none: true, why: 'x'}, elim: null, stocks})]) for (const s of U.items.flatMap(it => it.steps)) {
    assert.ok(!BAN.test(text(s)), text(s)); assert.ok(!BAN.test(speakOf(s)));
  }
});
test('범위 띠 그림 자리 — 0% 포함 · 위가 큰 값 · 띠 · 선 · 점선 셋 · 모양이 틀리면 null', () => {
  const g = fanOf({days, q: band.q, rep: band.rep});
  assert.ok(g.hi >= 0.72 && g.lo <= -0.42 && g.lo < 0 && g.hi > 0); assert.equal(g.ticks.length, 3); assert.deepEqual(g.ticks.map(t => t.v), [g.hi, 0, g.lo]);
  assert.ok(g.ticks[0].y < g.ticks[1].y && g.ticks[1].y < g.ticks[2].y, '위가 큰 값');
  assert.equal(g.reps.length, 3); assert.equal(g.b80.split(' ').length, days.length * 2); assert.equal(g.mid.split(' ').length, days.length);
  assert.ok(g.reps.every(r => r.pts.split(' ').length === 61));
  assert.equal(fanOf(null), null); assert.equal(fanOf({days, q: band.q.slice(1)}), null);
  const y0 = Number(g.zero), ys = g.mid.split(' ').map(p => Number(p.split(',')[1]));
  assert.ok(Math.abs(ys[0] - y0) < 0.11, '0일 가운데 값 = 0% 선');
});
test('읽을 시간 — 글이 길수록 길게 · 그림이 움직이는 걸음은 그만큼 더', () => {
  const base = {title: '가', lines: [], note: null, act: null};
  assert.equal(dwellOf(base), 3800); assert.equal(dwellOf({...base, act: 'to'}), 4700); assert.equal(dwellOf({...base, act: 'rise'}), 4900);
  assert.equal(dwellOf({...base, title: '가'.repeat(400)}), 10000);
  assert.ok(dwellOf({...base, title: '가'.repeat(60)}) > dwellOf({...base, title: '가'.repeat(20)}));
});
test('쉬운 말 화면에서 뜻이 틀어지지 않음 — 기승전결 칸 · 걸음 이름 · 단추의 「 · 」 조각이 통째 틀(TPL · 아래 탭 이름 등) 열쇠가 아님', () => {
  const keys = new Set(Object.keys(TPL)), segs = [...KSS.map(([k, w]) => `${k} · ${w}`), ...TOUR_STEPS.map(([k, n], i) => `${k} · ${i + 1}/8 ${n}`), '저절로 설명', '멈춤', '이어 보기', '자세히', '처음', '저절로 설명: 켬', '저절로 설명: 꺼짐(이 기기)', '이 기기에서 끄기', '다시 켜기'].flatMap(t => t.split(/ · | — /).map(x => x.trim()));
  assert.deepEqual(segs.filter(x => keys.has(x)), [], '「전 · 검증」 → 「전 · 지난 결과」 같은 것');
  assert.ok(!segs.includes('둘러보기'), '단추 이름이 쉬운 말 아래 탭 「둘러보기」(탐색)와 겹치지 않음');
});
