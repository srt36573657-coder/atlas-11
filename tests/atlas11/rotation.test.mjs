// 돈의 이동(lib/atlas11/rotation.mjs) — 사장님 2026-10-07 22:06 「어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐」
//   · 돈의 파장 1~5차 — 2026-10-08 06:46 「그리고 돈에 흐름이 1차 파장만 있다 5차 파장까지 도입하라」
import test from 'node:test';
import assert from 'node:assert/strict';
import {ROT, chainIndex, closeMap, price6At, fomoOf, fomoWord, troughOf, buildRotation, checkRotation} from '../../lib/atlas11/rotation.mjs';
import {rotationOf, ROT_PLACES} from '../../scripts/atlas11/story/build.mjs';
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
  // 날마다 값(매수 검토 후보의 1만 번 다시 뽑기 · 2026-10-09 10:14) — 달라고 할 때만 · 열 날을 더하면 10거래일 값과 같음 · 날마다 업종을 모두 더하면 0
  assert.equal(r.daily, undefined, '보통은 싣지 않음(story.json 크기 그대로)');
  const rd = buildRotation({assets, groups, sessions, asOf, capDay: sessions.at(-3), flows, daily: true}), D = rd.daily;
  assert.deepEqual(D.dates, sessions.slice(-ROT.window));
  for (const row of [...rd.in, ...rd.out]) {
    const g = D.sectors.find(x => x.id === row.id), sum = a => a.reduce((x, y) => x + y, 0);
    assert.ok(Math.abs(sum(g.c) - row.amount) <= 0.5 + 1e-6, `${row.label} 옮겨 간 돈 ${sum(g.c)} vs ${row.amount}`);
    assert.ok(Math.abs(Math.exp(sum(g.lr)) - 1 - row.change) < 1e-6, `${row.label} 값 오르내림`);
  }
  for (let i = 0; i < ROT.window; i++) assert.ok(Math.abs(D.sectors.reduce((x, g) => x + g.c[i], 0)) < 1e-6, '그날 업종을 모두 더하면 0');
  const g0 = D.sectors.find(x => x.id === 'g0'); assert.ok(Math.abs(g0.fi[ROT.window - 2] - (-1e7 + 5e6) * assets[0].prices.at(-2).close / 1e8) < 1e-9); assert.equal(g0.fi.filter(x => x !== 0).length, 1);
  assert.deepEqual(checkRotation(rd), []);
});

/* ── 돈의 파장 1~5차 ── */
/** 파장 시험 자료 — leads: 오래된 마디부터 그 마디에 오르는 업종 번호(null = 모두 그대로) · pre: 맨 앞 자투리 거래일(10 미만 · 쓰이면 안 됨)
   업종 다섯(한 곳씩 · 시가총액 1,000억) + 빠지는 업종 Z(5,000억 · 앞선 업종이 있는 마디에 하루 −0.3%) · 앞선 업종은 그 마디에 하루 +1%
   · 자투리에는 업종3 이 하루 +5%(미끼 — 앞에서부터 끊으면 첫 마디의 앞선 업종이 됨) */
const IDS = [0, 1, 2, 3, 4, 'Z'];
function waveData(leads, pre = 5) {
  const n = pre + 10 * leads.length + 1, sessions = sessionsOf(n);
  const rate = (k, i) => { if (i <= pre) return k === 3 ? 0.05 : 0; const lead = leads[Math.floor((i - pre - 1) / 10)]; return lead == null ? 0 : k === lead ? 0.01 : k === 'Z' ? -0.003 : 0; };
  const assets = IDS.map(k => { let c = 100; return {code: `C${k}`, name: `회사${k}`, quality: {marketCapEok: k === 'Z' ? 5000 : 1000}, prices: sessions.map((date, i) => { if (i > 0) c *= 1 + rate(k, i); return {date, close: c}; })}; });
  const groups = IDS.map(k => ({id: `g${k}`, label: `업종${k}`, codes: [`C${k}`]}));
  return {assets, groups, sessions, asOf: sessions.at(-1), capDay: sessions.at(-1), pre};
}
/** 따로 센 옮겨 간 돈 — 한 곳짜리 업종이라 업종 시가총액 = 시가총액 × 종가 ÷ 기준 날 종가 */
function movedBy(d, k, a, b) {
  const T = d.sessions.length - 1, L = (j, i) => d.assets[j].quality.marketCapEok * d.assets[j].prices[i].close / d.assets[j].prices[T].close;
  const M = i => IDS.reduce((s, _, j) => s + L(j, i), 0), j = IDS.indexOf(k);
  return L(j, b) - L(j, a) * M(b) / M(a);
}
const near = (got, want, msg) => assert.ok(Math.abs(got - Math.round(want)) <= 1, `${msg}: ${got} vs ${want}`);

test('돈의 파장 — 세 업종이 차례로 앞서면 그 차례 그대로 1 · 2 · 3차 · 마지막 종가 날부터 거꾸로 10거래일씩(맨 앞 자투리는 안 씀)', () => {
  const d = waveData([0, 1, 2]), r = buildRotation(d), at = j => d.sessions[d.pre + 10 * j];
  assert.equal(r.none, false);
  assert.deepEqual(r.waves.map(w => [w.n, w.to.label, w.from.label, w.start, w.end, w.days]),
    [[1, '업종0', '업종Z', at(0), at(1), 10], [2, '업종1', '업종Z', at(1), at(2), 10], [3, '업종2', '업종Z', at(2), at(3), 10]]);
  assert.ok(!r.waves.some(w => w.to.label === '업종3')); // 자투리(앞 5거래일)의 미끼는 어느 마디에도 없음
  r.waves.forEach((w, j) => { near(w.amount, movedBy(d, [0, 1, 2][j], d.pre + 10 * j, d.pre + 10 * (j + 1)), `${w.n}차 들어간 돈`); near(w.fromAmount, movedBy(d, 'Z', d.pre + 10 * j, d.pre + 10 * (j + 1)), `${w.n}차 빠진 돈`); });
  assert.ok(r.waves.every(w => w.amount > 0 && w.fromAmount < 0));
  assert.equal(r.waves.at(-1).to.id, r.pair.to.id); assert.equal(r.waves.at(-1).end, r.asOf); assert.equal(r.waves.at(-1).start, r.window.from);
  assert.deepEqual(r.waves.map(w => w.atLeast), [true, false, false]); // 맨 앞 마디 — 그보다 앞은 자료가 없어 「넘게」
  assert.deepEqual(checkRotation(r), []);
});

test('돈의 파장 — 같은 업종이 이어 앞서면 한 파장(기간을 합치고 다시 셈) · 가장 새 다섯만 · 들어간 업종이 없는 마디는 파장을 끊음 · 12마디까지만', () => {
  const d = waveData([0, 1, 2, 2, 3, 0, 1]), r = buildRotation(d), at = j => d.sessions[d.pre + 10 * j];
  // 파장 여섯(0 · 1 · 2+2 · 3 · 0 · 1) 가운데 가장 새 다섯
  assert.deepEqual(r.waves.map(w => [w.n, w.to.label, w.start, w.end, w.days, w.atLeast]),
    [[1, '업종1', at(1), at(2), 10, false], [2, '업종2', at(2), at(4), 20, false], [3, '업종3', at(4), at(5), 10, false], [4, '업종0', at(5), at(6), 10, false], [5, '업종1', at(6), at(7), 10, false]]);
  const merged = r.waves[1];
  near(merged.amount, movedBy(d, 2, d.pre + 20, d.pre + 40), '합친 파장은 합친 기간 전체로 다시 셈');
  near(merged.fromAmount, movedBy(d, 'Z', d.pre + 20, d.pre + 40), '합친 파장의 빠진 돈');
  assert.deepEqual(checkRotation(r), []);
  // 들어간 업종이 없는 마디(모두 그대로 — 옮겨 간 돈 0)를 사이에 두면 같은 업종이라도 잇지 않음
  const g = buildRotation(waveData([0, null, 0, 1])), gat = j => d.sessions[d.pre + 10 * j];
  assert.deepEqual(g.waves.map(w => [w.n, w.to.label, w.start, w.end]), [[1, '업종0', gat(0), gat(1)], [2, '업종0', gat(2), gat(3)], [3, '업종1', gat(3), gat(4)]]);
  assert.deepEqual(checkRotation(g), []);
  // 12마디(120거래일)보다 앞은 보지 않음 — 그 안이 모두 한 업종이면 파장 하나 · 「넘게」
  const h = waveData([0, 0, ...new Array(12).fill(1)]), hr = buildRotation(h), T = h.sessions.length - 1;
  assert.deepEqual(hr.waves.map(w => [w.n, w.to.label, w.from.label, w.start, w.end, w.days, w.atLeast]), [[1, '업종1', '업종Z', h.sessions[T - 120], h.sessions[T], 120, true]]);
  near(hr.waves[0].amount, movedBy(h, 1, T - 120, T), '120거래일 파장');
  assert.deepEqual(checkRotation(hr), []);
});

test('돈의 파장 — 들어간 돈이 똑같으면 판 차례 앞 업종 · 「들어가는 업종」과 같은 잣대라 마지막 파장 = pair.to', () => {
  for (const before of [false, true]) {
    const d = waveData([0, 1, 2]), twin = {...d.assets[2], code: 'CT'}, g = {id: 'gT', label: '업종T', codes: ['CT']};
    d.assets.push(twin); d.groups.splice(before ? 2 : 3, 0, g); // 업종2 와 똑같은 쌍둥이를 앞 또는 뒤에
    const r = buildRotation(d), want = before ? '업종T' : '업종2';
    assert.equal(r.in[0].label, want); assert.equal(r.pair.to.label, want); assert.equal(r.waves.at(-1).to.label, want);
    assert.deepEqual(checkRotation(r), []);
  }
});

test('돈의 파장 검사 — 차례 · 날짜 · 방향 · 마지막 = 지금 들어가는 업종이 어긋나면 막음', () => {
  const r = buildRotation(waveData([0, 1, 2, 3, 4, 0]));
  assert.deepEqual(checkRotation(r), []);
  const w = r.waves, bad = waves => checkRotation({...r, waves});
  assert.deepEqual(bad(undefined), ['파장 수']);
  assert.deepEqual(bad([...w, {...w.at(-1), n: 6}]), ['파장 수', '파장 날짜']);
  assert.ok(bad([...w].reverse()).includes('파장 차례'));
  assert.deepEqual(bad(w.map(x => ({...x, n: 6 - x.n})).reverse()), ['파장 날짜', '마지막 파장 ≠ 지금 들어가는 업종']); // 차례 번호만 맞추고 날짜는 거꾸로
  assert.deepEqual(bad(w.map((x, i) => i === 1 ? {...x, amount: -x.amount} : x)), ['파장 방향']);
  assert.deepEqual(bad(w.map((x, i) => i === 2 ? {...x, fromAmount: 0} : x)), ['파장 방향']);
  assert.deepEqual(bad(w.map((x, i) => i === 4 ? {...x, to: w[0].to} : x)), ['마지막 파장 ≠ 지금 들어가는 업종']);
  assert.deepEqual(bad(w.map((x, i) => i === 0 ? {...x, from: x.to} : x)), ['파장 업종']);
  assert.deepEqual(bad(w.map((x, i) => i === 3 ? {...x, start: w[2].start} : x)), ['파장 날짜']); // 앞 파장과 겹침
});

test('돈의 파장 — 다섯 나라 실제 자료: 검사 통과 · 1차부터 · 날짜 겹치지 않음 · 마지막 파장 = 지금 들어가는 업종 · 마지막 종가 날', async () => {
  for (const [place] of ROT_PLACES) {
    const r = await rotationOf(process.cwd(), place);
    assert.equal(r.none, false, `${place}: ${r.reason}`);
    assert.deepEqual(checkRotation(r), [], place);
    assert.ok(r.waves.length >= 1 && r.waves.length <= ROT.waves, place);
    assert.deepEqual(r.waves.map(w => w.n), r.waves.map((_, i) => i + 1), place);
    r.waves.forEach((w, i) => { assert.ok(w.start < w.end && (i === 0 || r.waves[i - 1].end <= w.start), `${place} ${w.n}차 날짜`); assert.ok(w.days % ROT.window === 0 && w.days <= ROT.window * ROT.waveWindows, `${place} ${w.n}차 기간`); assert.ok(w.amount > 0 && w.fromAmount < 0, `${place} ${w.n}차 방향`); });
    assert.equal(r.waves.at(-1).to.id, r.pair.to.id, place);
    assert.equal(r.waves.at(-1).to.label, r.in[0].label, place);
    assert.equal(r.waves.at(-1).end, r.asOf, place);
  }
});
