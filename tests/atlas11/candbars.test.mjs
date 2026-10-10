// 「후보 7」 막대 그래프 셈(site/app/candbars.js) — 사장님 2026-10-10 11:19(마카오) 「바둑판 영구 삭제해」(같은 날 09:51 「3d 영구 삭제해」로 옛 입체 섬을 바꾼 365칸 바둑판 tiles.js 를 지움)
//   줄 하나 = 후보 한 곳(순위 차례) · 막대 = 오늘 1년 추세(판 읽기 cand.grow.m 첫째 × 100 · 소수 첫째) · 짧은 세로 줄 = 20거래일 전(둘째) · 점선 = 그물 기준선(grow.qD) · 한 그림 안은 같은 축
//   그 밖 365곳은 글 한 줄(그물 안 곳 수 = flags 다섯째 · 그 가운데 기준 셋을 넘은 곳 = 앞 셋 '111') — 바둑판 없이 · 입체 없이(규칙 50 · 51)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {barsModel, barGeo, pctTxt} from '../../site/app/candbars.js';
import {posOf} from '../../site/app/charts.js';

/** 작은 판 — m = [오늘 1년 추세, 20거래일 전](비율) · flags = 그날 종가 · 흑자 · 위험 공시 없음 · 추세 셈 · 그물 안 · 새로 듦 */
const C = {
  grow: {m: {a1: [1.2, 0.3], b1: [0.7, 0.1], c1: [0.66, null], a2: [0.9, 0.95], z9: [null, 0.2]}, q: 66.128, qD: 66.1, qp: 47.818},
  flags: {a1: '111111', b1: '111111', c1: '111111', a2: '011110', z9: '110000', n0: '111100'},
  items: [{code: 'b1', rank: 2, status: 'met', name: '회사b1', sector: '업종나', g: 7}, {code: 'c1', rank: 3, status: 'wait'}, {code: 'a1', rank: 1, status: 'met', name: '회사a1', sector: '업종가', g: '3'}]};

test('줄 = 후보(순위 차례) · 1년 추세 % = 판 읽기 값 × 100(소수 첫째) · 이름이 없으면 기호 · 상태 · 업종은 그대로', () => {
  const M = barsModel(C);
  assert.deepEqual(M.rows.map(r => r.code), ['a1', 'b1', 'c1']); assert.deepEqual(M.rows.map(r => r.rank), [1, 2, 3]); assert.equal(M.n, 3);
  assert.deepEqual(M.rows.map(r => [r.m12, r.m12p]), [[120, 30], [70, 10], [66, null]], '20거래일 전 값이 없으면 null(지어내지 않음)');
  assert.equal(M.rows[2].name, 'c1'); assert.equal(M.rows[0].name, '회사a1');
  assert.deepEqual(M.rows.map(r => r.status), ['met', 'met', 'wait']); assert.deepEqual(M.rows.map(r => r.g), ['3', '7', null]); assert.equal(M.rows[1].sector, '업종나');
});

test('점선 = 오늘 기준선(grow.qD) · 20거래일 전 기준선 = grow.qp(소수 첫째) · 같은 축이 0 · 두 기준선 · 모든 값을 담음 · 자리는 값 차례 그대로', () => {
  const M = barsModel(C);
  assert.equal(M.q, 66.1); assert.equal(M.qp, 47.8);
  assert.equal(barsModel({...C, grow: {...C.grow, qD: undefined}}).q, 66.1, 'qD 가 없으면 q 를 소수 첫째로');
  const vals = [0, M.q, M.qp, ...M.rows.flatMap(r => [r.m12, r.m12p]).filter(v => v !== null)];
  for (const v of vals) { assert.ok(M.ax.lo <= v && v <= M.ax.hi, `축 밖 ${v}`); const p = posOf(M.ax, v); assert.ok(p >= 0 && p <= 100); }
  const s = [...vals].sort((x, y) => x - y); for (let i = 1; i < s.length; i++) if (s[i] > s[i - 1]) assert.ok(posOf(M.ax, s[i]) > posOf(M.ax, s[i - 1]), '큰 값이 오른쪽');
  const neg = barsModel({...C, grow: {...C.grow, m: {...C.grow.m, a1: [-0.4, -0.9]}}});
  assert.ok(neg.ax.lo <= -90 && neg.ax.hi >= 70, '내린 값도 축 안(왼쪽)');
});

test('막대 자리 — 0 에서 값까지(오르면 0 의 오른쪽 · 내리면 왼쪽) · 아주 짧아도 0.6% · 값이 없으면 그리지 않음', () => {
  const M = barsModel(C), z = posOf(M.ax, 0);
  for (const v of [120, 70, 30, 1e-9]) { const g = barGeo(M.ax, v); assert.ok(Math.abs(g.l - z) < 1e-9); assert.ok(Math.abs(g.l + g.w - Math.max(posOf(M.ax, v), z + 0.6)) < 1e-9, `${v}`); }
  const ax2 = {lo: -50, hi: 150}; const g2 = barGeo(ax2, -40); assert.ok(Math.abs(g2.l - posOf(ax2, -40)) < 1e-9 && Math.abs(g2.l + g2.w - posOf(ax2, 0)) < 1e-9, '내림 = 값에서 0 까지');
  assert.equal(barGeo(M.ax, 0).w, 0.6); assert.equal(barGeo(M.ax, null), null); assert.equal(barGeo(M.ax, NaN), null); assert.equal(barGeo(null, 5), null);
});

test('그 밖 곳 수 — 그물 안 = flags 다섯째 1 · 1년 추세 값이 있음 · 기준 셋을 넘은 곳 = 그 가운데 앞 셋 111', () => {
  const M = barsModel(C);
  assert.equal(M.above, 4, 'a1 b1 c1 a2(n0 은 그물 밖 · z9 는 값 없음)'); assert.equal(M.green, 3, 'a2 는 그날 종가 없음 011');
});

test('값이 없으면 그리지 않음(지어내지 않음) · 숫자 글', () => {
  assert.equal(barsModel(null), null); assert.equal(barsModel({grow: null, items: C.items}), null); assert.equal(barsModel({...C, items: []}), null); assert.equal(barsModel({...C, grow: {q: 1}}), null);
  assert.equal(pctTxt(70), '+70.0%'); assert.equal(pctTxt(-0.04), '0.0%'); assert.equal(pctTxt(-12.34), '−12.3%'); assert.equal(pctTxt(null), '셀 수 없음');
});

test('입체 · 바둑판 없음 — ATLAS 화면 코드(site/app · 초대장 사진 · 소개 영상 빼고)에 입체 섬 · 지도 섬 · 원근 · 365칸 바둑판(칸 그림)이 없음(2026-10-10 「3d 영구 삭제해」 · 「가 나 는 지우지마」 · 「바둑판 영구 삭제해」)', () => {
  const dir = path.resolve(import.meta.dirname, '../../site/app'), KEEP = new Set(['invite.js', 'invite-photo.js', 'invite.css', 'hello.js', 'hello.css', 'hello-page.js', 'hello-share.js']); // 가(초대장 사진) · 나(공주님 영상)는 사장님 10:00 「가 나 는 지우지마」
  const BAD = /perspective\s*:|preserve-3d|rotate[XY]\(|rotate3d\(|translate3d\(|translateZ\(|matrix3d\(|getContext\(\s*['"]webgl|skew[XY]\(|--d3\b|drop-shadow\(|from '\.\/island|islandmap|candIsland/;
  const BOARD = /from '\.\/tiles|tilesModel|candTiles|tapStep|['" .]tl(-[a-z0-9]+)?['" {,:]/; // 옛 칸 그림 모듈 · 셈 · 칸 이름(.tl · .tl-grid · .tl-c …)
  const hits = [], board = [];
  for (const f of fs.readdirSync(dir)) { if (KEEP.has(f) || !/\.(js|css)$/.test(f)) continue; const t = fs.readFileSync(path.join(dir, f), 'utf8'); t.split('\n').forEach((l, n) => { if (BAD.test(l)) hits.push(`${f}:${n + 1}`); if (BOARD.test(l)) board.push(`${f}:${n + 1}`); }); }
  assert.deepEqual(hits, []); assert.deepEqual(board, []);
  for (const f of ['island.js', 'island-model.js', 'islandmap.js', 'tiles.js', 'tiles-model.js']) assert.ok(!fs.existsSync(path.join(dir, f)), `${f} 이 남아 있음`);
  const idx = fs.readFileSync(path.resolve(dir, '../index.html'), 'utf8'); assert.ok(!/<canvas/i.test(idx)); assert.ok(!/tiles(-model)?\.js/.test(idx));
});
