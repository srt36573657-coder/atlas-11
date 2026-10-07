// 돈의 이동(lib/atlas11/rotation.mjs) — 사장님 2026-10-07 22:06 「어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐」
import test from 'node:test';
import assert from 'node:assert/strict';
import {ROT, chainIndex, closeMap, price6At, fomoOf, fomoWord, troughOf, buildRotation, checkRotation} from '../../lib/atlas11/rotation.mjs';
import {calculateFomo} from '../../lib/fomo.mjs';

const sessionsOf = n => { const out = []; for (let k = 0; out.length < n; k++) { const d = new Date(Date.UTC(2025, 0, 1 + k)); if (d.getUTCDay() % 6 !== 0) out.push(d.toISOString().slice(0, 10)); } return out; };

test('업종 지수는 시가총액 무게 · 사슬 — 빠진 날은 앞 종가를 들고 가고 오르내림을 지어내지 않는다', () => {
  const days = ['2026-01-02', '2026-01-05', '2026-01-06'];
  const big = {cap: 300, ref: 100, closes: new Map([['2026-01-02', 100], ['2026-01-05', 110], ['2026-01-06', 110]])};
  const small = {cap: 100, ref: 50, closes: new Map([['2026-01-02', 50], ['2026-01-06', 40]])}; // 01-05 빠짐
  const idx = chainIndex(days, [big, small]);
  assert.equal(idx[0], 1);
  assert.ok(Math.abs(idx[1] - 1.1) < 1e-12); // 01-05: 큰 회사만 셈(+10%)
  // 01-06: 큰 회사 무게 300×110/100=330 · 0% / 작은 회사 무게 100×50/50=100 · −20% → (0×330 − 0.2×100)/430
  assert.ok(Math.abs(idx[2] - 1.1 * (1 - 20 / 430)) < 1e-12);
  assert.deepEqual([...closeMap([{date: '2026-01-02', close: 1}, {date: '2026-01-05', close: 0}, {date: '2026-01-06', close: 2, finalClose: false}, {date: '2026-01-07', close: 3}], '2026-01-06').keys()], ['2026-01-02']);
});

test('포모값(가격 열기 6가지)은 옛 ATLAS FOMO(lib/fomo.mjs)와 같은 식 — 같은 종가면 같은 값', () => {
  const sessions = sessionsOf(430);
  let c = 100; const prices = sessions.map((date, i) => { c *= Math.exp(0.001 + 0.012 * Math.sin(i * 0.53) + 0.004 * Math.cos(i * 0.11)); return {date, close: c}; });
  const input = {origin: sessions[400], end: sessions.at(-1), actualAsOf: sessions.at(-1), informationAsOf: sessions.at(-1) + 'T20:00:00+09:00', calendar: {sessions}, assets: [{code: '005930', name: '시험 기업', prices}]};
  const old = calculateFomo({input, code: '005930', date: input.actualAsOf});
  const mine = fomoOf(prices.map(p => p.close), prices.length - 1);
  assert.ok(Number.isFinite(old.priceHeat));
  assert.ok(Math.abs(mine.score - old.priceHeat) <= 0.06, `${mine.score} vs ${old.priceHeat}`);
  assert.equal(mine.refs, 252);
  // 모두 같은 값이면 50(동률은 가운데)
  assert.equal(fomoOf(new Array(400).fill(7), 399).score, 50);
  // 비교 기간이 60개 미만이면 값 없음(0 으로 채우지 않음)
  assert.equal(fomoOf(prices.slice(0, 120).map(p => p.close), 119).score, null);
  assert.equal(price6At([1, 2, 3], 2).return10, null);
});

test('포모값 말 다섯 등급', () => {
  assert.deepEqual([95, 61.1, 50, 27.9, 3, null].map(fomoWord), ['아주 높다', '높다', '보통', '낮다', '아주 낮다', null]);
});

test('앞서기 시작한 날 = 마지막 바닥(그 앞으로 5% 넘게 높았던 날이 있음) · 없으면 「넘게」', () => {
  const a = new Array(30).fill(1);
  const b = [...new Array(10).fill(1.2), 1.1, 1.0, 0.95, 0.9, 0.92, 0.94, 0.96, 0.98, 1, 1.02, 1.04, 1.06, 1.08, 1.1, 1.12, 1.14, 1.16, 1.18, 1.2, 1.22];
  assert.deepEqual(troughOf(b, a, 29), {start: 13, found: true, atLeast: false});
  const up = Array.from({length: 30}, (_, k) => 1 + k * 0.01);
  assert.equal(troughOf(up, a, 29, {lookback: 20}).atLeast, true);
  // 오래 나란히 가다(차이 1% 안) 갈라지면 갈라진 날
  const flat = [...Array.from({length: 40}, (_, k) => 1 + 0.003 * Math.sin(k)), ...Array.from({length: 10}, (_, k) => 1.003 + 0.02 * (k + 1))];
  const t = troughOf(flat, new Array(50).fill(1), 49);
  assert.ok(t.start >= 37 && t.start <= 39, String(t.start));
});

test('돈의 이동 — 오른 업종이 들어가는 쪽 · 내린 업종이 빠지는 쪽 · 기간 · 포모값 · 누가', () => {
  const sessions = sessionsOf(330), asOf = sessions.at(-1);
  const path = (k, i) => 100 * Math.exp(0.002 * Math.sin(i * 0.37 + k) + (i > 300 ? (k === 0 ? -0.01 : k === 1 ? 0.012 : 0) * (i - 300) : 0));
  const assets = [0, 1, 2].flatMap(k => [0, 1].map(j => ({code: `${k}${j}0000`, name: `회사${k}${j}`, quality: {marketCapEok: 1000 * (k + 1) * (j + 1)}, prices: sessions.map((date, i) => ({date, close: path(k, i) * (1 + j * 0.01)}))})));
  const groups = [0, 1, 2].map(k => ({id: 'g' + k, label: ['내린 업종', '오른 업종', '그대로 업종'][k], codes: [`${k}00000`, `${k}10000`]}));
  const flows = [{code: '000000', rows: [{date: sessions.at(-2), foreignNet: -1e7, institutionNet: 5e6, individualNet: 5e6}]}];
  const r = buildRotation({assets, groups, sessions, asOf, capDay: sessions.at(-3), flows});
  assert.equal(r.none, false);
  assert.equal(r.window.days, ROT.window);
  assert.equal(r.out[0].label, '내린 업종'); assert.ok(r.out[0].amount < 0);
  assert.equal(r.in[0].label, '오른 업종'); assert.ok(r.in[0].amount > 0);
  assert.equal(r.pair.from.label, '내린 업종'); assert.equal(r.pair.to.label, '오른 업종');
  assert.ok(r.pair.days >= 20 && r.pair.days <= 40, String(r.pair.days)); // 300번째 날 무렵부터 갈라짐
  assert.ok(r.fomo.to > r.fomo.from);
  assert.equal(r.out[0].who.foreign < 0, true); assert.equal(r.flows.days, 1);
  assert.deepEqual(checkRotation(r), []);
  // 거래일이 모자라면 지어내지 않음
  assert.equal(buildRotation({assets, groups, sessions: sessions.slice(0, 5), asOf: sessions[4], capDay: sessions[4]}).none, true);
});
