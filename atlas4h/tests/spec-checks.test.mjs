/**
 * 사양 T1~T23 · 극한 K1~K7 시험 코드가 제대로 재는지 본다 (첫 실행 5번)
 *   node --test atlas4h/tests/
 *
 * - 좋은 기록(atlas4h/spec/fixtures/good)은 서른 개 모두 통과한다.
 * - 한 곳만 망가뜨린 복사본(심어 둔 흠)은 맞는 까닭으로 「안 통과」 한다.
 * - 엔진 시험(T4·T15·K1~K7)은 규칙을 지키는 작은 엔진으로는 통과, 규칙을 어기거나 멈추는 엔진으로는 안 통과.
 * - 30판이 넘는 채점(T13)과 재현 결과(T12)는 씨앗을 고정해 이 파일 안에서 만든다 (큰 파일을 두지 않음).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  loadState, CHECKS, IDS, runAll, runExtreme, checkOldEngineUntouched, collectAtlas4hChanges,
  boardSha256, canonicalJson, FORBIDDEN, EXTREMES_DIR,
} from '../spec/checks.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GOOD = path.join(HERE, '..', 'spec', 'fixtures', 'good');
const REPO = path.join(HERE, '..', '..');

// ── 시험용 작은 엔진 (규칙을 지키는 쪽) — 진짜 엔진이 아니다. 시험이 제대로 잡는지 보려고 둔다 ──
// 좋은 기록의 판 kospi·stocks 는 이 엔진으로 만들었다 (T4 가 다시 돌려 같은 값인지 본다).
const H4 = 4 * 3600e3;
const RESEAL = '변수 그대로 → 앞 판 다시 봉인';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sortedNormals(seed, n) {
  const r = mulberry32(seed);
  const z = [];
  while (z.length < n) {
    const u = 1 - r();
    const v = r();
    z.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
  }
  return z.sort((a, b) => a - b);
}

const r2 = x => Math.round(x * 100) / 100;

function judge(v, inputs) {
  const now = Date.parse(inputs.now ?? '');
  const srcs = v.sources ?? [];
  const ok = srcs.filter(s => s && s.value !== null && s.value !== undefined && !s.error);
  const marks = new Set((v.marks ?? []).filter(m => m === '거래정지' || m === '가격 제한'));
  let value = null;
  let observedAt = null;
  if (!ok.length) {
    if (srcs.some(s => s && s.error)) marks.add('끊김');
    if (v.previous && v.previous.value !== null && v.previous.value !== undefined) {
      value = v.previous.value;
      observedAt = v.previous.observedAt;
      marks.add('옛값');
    } else marks.add('없음');
  } else {
    value = ok[0].value;
    observedAt = ok[0].observedAt;
    if (ok.length === 1) marks.add('한 출처');
    else {
      const tol = v.compare?.tolerance ?? 0.0005;
      const differs = v.compare?.rule === 'exact' ? ok[1].value !== ok[0].value : Math.abs(ok[1].value - ok[0].value) / Math.abs(ok[0].value) > tol;
      if (differs) marks.add('확인 중');
    }
    const closed = inputs.calendar?.us?.closed ?? [];
    if (v.market === 'US' && ok.some(s => closed.includes(s.sessionDate))) marks.add('확인 중');
  }
  if (Number.isFinite(now) && observedAt && now - Date.parse(observedAt) > H4) marks.add('옛값');
  const us = inputs.calendar?.us;
  if (v.market === 'US' && us && (us.closed ?? []).includes(us.session)) marks.add('장 닫힘');
  if (v.prevClose && value !== null && (value >= Math.floor(v.prevClose * 1.3) || value <= Math.ceil(v.prevClose * 0.7))) marks.add('가격 제한');
  if (v.threshold && v.previous && value !== null && !marks.has('확인 중') && Math.abs(value / v.previous.value - 1) > v.threshold) marks.add('크게 바뀜');
  return {id: v.id, value, observedAt, status: marks.size ? [...marks][0] : 'ok', marks: [...marks]};
}

function stubEngine(inputs, seed) {
  const vars = (inputs.variables ?? []).map(v => judge(v, inputs));
  const by = new Map(vars.map(v => [v.id, v]));
  const usable = v => v && v.value !== null && !v.marks.includes('확인 중');
  const out = {createdAt: inputs.now ?? null, status: '봉인', trigger: null, flags: [], variables: vars, derived: {}, regime: null};
  if (vars.length && vars.every(v => v.marks.includes('끊김'))) return {...out, status: RESEAL, kospi: null, stocks: []};
  const kr = inputs.calendar?.kr;
  if (kr?.lastSession) {
    const cum = {};
    for (const v of inputs.variables ?? []) {
      const h = (v.history ?? []).filter(x => x.date >= kr.lastSession);
      if (h.length) cum[v.id] = (h.reduce((a, x) => a * (1 + x.changePct / 100), 1) - 1) * 100;
    }
    out.derived.usCumulativePct = cum;
  }
  const now = Date.parse(inputs.now ?? '');
  for (const ev of inputs.events ?? []) {
    const at = Date.parse(ev.at);
    if (ev.result !== null && ev.result !== undefined && Number.isFinite(now) && now >= at && now - at <= 30 * 60e3) {
      out.trigger = {kind: '발표', reason: `${ev.name} 발표`, at: ev.at};
    }
  }
  const big = vars.find(v => v.marks.includes('크게 바뀜'));
  if (!out.trigger && big) out.trigger = {kind: '문턱', reason: `${big.id} 크게 바뀜`, at: big.observedAt};
  if (inputs.market?.circuitBreaker) out.flags.push('서킷브레이커');
  if (inputs.market?.sidecar) out.flags.push('사이드카');
  const vk = by.get('vkospi');
  const vix = by.get('vix');
  const level = usable(vk) ? vk.value : usable(vix) ? vix.value : 18;
  const sig = x => 1 / (1 + Math.exp(-x));
  const rough = sig((level - 25) / 3);
  const calm = sig((15 - level) / 3) * (1 - rough);
  out.regime = {probs: {잔잔: calm, 보통: 1 - rough - calm, 사나움: rough}};
  const k = by.get('kospi');
  if (!usable(k)) throw new Error('코스피 값 없음');
  const anchor = k.value;
  const vol = ((inputs.constants?.dailyVolPct ?? 1) * (1 + 1.5 * rough) * (out.flags.includes('서킷브레이커') ? 2 : 1)) / 100;
  const zs = sortedNormals(seed, 2001);
  const at = p => zs[Math.floor(p * (zs.length - 1))];
  const q = {p10: r2(anchor * (1 + vol * at(0.1))), p25: r2(anchor * (1 + vol * at(0.25))), p50: r2(anchor * (1 + vol * at(0.5))), p75: r2(anchor * (1 + vol * at(0.75))), p90: r2(anchor * (1 + vol * at(0.9)))};
  const kospi = {
    anchor: {value: anchor, asOf: k.observedAt},
    center: q.p50,
    quantiles: q,
    scenarios: [
      {name: '위', premise: '밤사이 미국 흐름이 이어짐', kospi: {low: q.p75, high: q.p90}, prob: 0.25, invalidator: '첫 30분 안에 가운데 값 아래로 내려감'},
      {name: '가운데', premise: '큰 소식 없이 흔들림 폭 안', kospi: {low: q.p25, high: q.p75}, prob: 0.5, invalidator: '흔들림 폭을 넘는 움직임'},
      {name: '아래', premise: '미국 흐름이 꺾임', kospi: {low: q.p10, high: q.p25}, prob: 0.25, invalidator: '첫 30분 안에 가운데 값 위로 올라감'},
    ],
  };
  const stocks = [];
  for (const v of inputs.variables ?? []) {
    if (!String(v.id).startsWith('stock-price:')) continue;
    const j = by.get(v.id);
    const code = v.id.slice('stock-price:'.length);
    if (j.marks.includes('거래정지') || j.value === null) {
      stocks.push({code, center: null, quantiles: null, status: j.marks});
      continue;
    }
    const hi = v.prevClose ? Math.floor(v.prevClose * 1.3) : Infinity;
    const lo = v.prevClose ? Math.ceil(v.prevClose * 0.7) : -Infinity;
    const clip = x => Math.min(hi, Math.max(lo, Math.round(x)));
    const sq = {p10: clip((j.value * q.p10) / anchor), p50: clip((j.value * q.p50) / anchor), p90: clip((j.value * q.p90) / anchor)};
    stocks.push({code, center: sq.p50, quantiles: sq, status: j.marks});
  }
  return {...out, kospi, stocks};
}

// 규칙 하나를 어기는 엔진 — 좋은 엔진 결과에서 한 곳만 바꾼다
const breaking = change => (inputs, seed) => {
  const out = stubEngine(inputs, seed);
  change(out, inputs);
  return out;
};
const BAD = {
  throws: () => {
    throw new Error('일부러 멈춤');
  },
  jitter: (inputs, seed) => {
    const out = stubEngine(inputs, seed);
    out.kospi.center += Math.random() + 0.01;
    return out;
  },
  holidayZero: breaking(out => out.variables.forEach(v => { if (v.marks.includes('장 닫힘')) v.value = 0; })),
  noCarry: breaking(out => { delete out.derived.usCumulativePct; }),
  zeroFill: breaking(out => out.variables.forEach(v => { if (v.value === null) v.value = 0; })),
  noReseal: breaking(out => { if (out.status === RESEAL) out.status = '봉인'; }),
  noFlags: breaking(out => { out.flags = []; }),
  nan: breaking(out => { if (out.kospi) out.kospi.quantiles.p90 = NaN; }),
  noClip: breaking(out => out.stocks.forEach(s => { if (s.quantiles) for (const k of Object.keys(s.quantiles)) s.quantiles[k] = Math.round(s.quantiles[k] * 1.5); })),
  haltZero: breaking(out => out.stocks.forEach(s => { if (s.center === null) s.center = 0; })),
  noTrigger: breaking(out => { out.trigger = null; }),
  lateTrigger: breaking((out, inputs) => { out.createdAt = new Date(Date.parse(inputs.now) + 45 * 60e3).toISOString(); }),
  noBigMark: breaking(out => out.variables.forEach(v => { v.marks = v.marks.filter(m => m !== '크게 바뀜'); if (v.status === '크게 바뀜') v.status = 'ok'; })),
  noRegime: breaking(out => { out.regime = null; }),
  flatWidth: breaking(out => {
    if (!out.kospi) return;
    const c = out.kospi.center;
    Object.assign(out.kospi.quantiles, {p10: c - 30, p25: c - 15, p50: c, p75: c + 15, p90: c + 30});
    out.kospi.scenarios[0].kospi = {low: c + 15, high: c + 30};
  }),
};

// ── 씨앗을 고정해 만드는 자료 ──
function normal(r) {
  return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}

/** T13 용: 봉인 판이 없는 채점 40줄 (덮음 32/40 = 80% · 위기 5줄 중 4줄 덮음) */
function makeScores(n = 40, seed = 20261005) {
  const r = mulberry32(seed);
  return Array.from({length: n}, (_, i) => {
    const day = String(5 + Math.floor(i / 3)).padStart(2, '0');
    const covered = i % 5 !== 0;
    return {
      boardId: `g-202610${day}-${['08', '12', '16'][i % 3]}-${String(i).padStart(4, '0')}`,
      target: `2026-10-${day}`,
      scoredAt: `2026-10-${day}T15:41:00+09:00`,
      actual: {value: r2(2650 + 20 * normal(r)), asOf: `2026-10-${day}T15:30:00+09:00`, source: '시험용'},
      interval: {alpha: 0.2, score: r2(40 + 5 * Math.abs(normal(r))), covered},
      crisis: i % 8 === 0,
    };
  });
}

/** T12 용: 재현 60줄 (20날 × 하루 세 판) — 엔진이 기준 셋보다 폭 점수가 낮다 */
function makeRetro(seed = 20261001) {
  const r = mulberry32(seed);
  const rows = [];
  for (let d = 0; d < 20; d++) {
    const target = `2026-09-${String(d + 1).padStart(2, '0')}`;
    for (const slot of ['08', '12', '16']) {
      const e = r2(50 + 10 * Math.abs(normal(r)));
      rows.push({
        boardId: `r4h-${target.replaceAll('-', '')}-${slot}-${String(rows.length).padStart(4, '0')}`,
        target,
        scoredAt: '2026-10-01T19:00:00+09:00',
        interval: {alpha: 0.2, score: e},
        baselines: [
          {id: '무판', interval: r2(e + 8 + 4 * normal(r))},
          {id: '단순 전이식', interval: r2(e + 6 + 4 * normal(r))},
          {id: 'ATLAS 11', interval: r2(e + 7 + 4 * normal(r))},
        ],
      });
    }
  }
  return {schema: 'atlas4h-retro-1', alpha: 0.2, rows};
}

const B1 = '4h-20261002-08-a1b2c3d4';
const B2 = '4h-20261002-12-b2c3d4e5';
const B3 = '4h-20261002-16-c3d4e5f6';
const B4 = 'r4h-20260901-08-d4e5f6a7';
const board = (s, id) => s.boards.find(b => b.id === id);
const variable = (b, id) => b.inputs.variables.find(v => v.id === id);

const BASE = await loadState(GOOD);
function goodState() {
  const s = structuredClone(BASE);
  s.scores = [...s.scores, ...makeScores()];
  s.retro = makeRetro();
  return s;
}

/** T11 깨끗한 목록: 새 폴더만 바꾸고, 옛 장부에는 줄을 덧붙이기만 함 */
const CLEAN = [
  {commit: 'c2717ee', subject: 'atlas4h 1: save the command', status: 'A', path: 'atlas4h/command/original.txt', deletedLines: 0},
  {commit: '70ff430', subject: 'atlas4h 5: board format', status: 'A', path: 'atlas4h/spec/board.md', deletedLines: 0},
  {commit: '70ff430', subject: 'atlas4h 5: board format', status: 'M', path: 'reports/atlas11/ledger/2026-10.jsonl', deletedLines: 0},
];
const OPTS = {engine: stubEngine, changes: CLEAN, judgmentCommitAt: '2026-10-01T18:21:00+09:00'};

// ───────────────────────── 좋은 기록은 통과 ─────────────────────────

test('좋은 기록: 읽을 때 깨진 줄이 없다', () => {
  assert.deepEqual(BASE.errors, []);
  assert.equal(BASE.boards.length, 4);
  assert.equal(BASE.seals.length, 4);
});

for (const id of IDS) {
  test(`${id} 좋은 기록은 통과`, () => {
    const r = CHECKS[id](goodState(), OPTS);
    assert.equal(r.id, id);
    assert.equal(r.pass, true, `${id}: ${r.reason}`);
    assert.equal(typeof r.reason, 'string');
    assert.ok(r.reason.length > 0);
    assert.equal(typeof r.counts, 'object');
  });
}

test('runAll 은 서른 개를 돌려 좋은 기록에서 모두 통과', () => {
  const rs = runAll(goodState(), OPTS);
  assert.deepEqual(rs.map(r => r.id), IDS);
  assert.equal(IDS.length, 30);
  assert.deepEqual(rs.filter(r => !r.pass).map(r => `${r.id} ${r.reason}`), []);
});

// ───────────────────────── 잴 것이 없으면 통과가 아니다 ─────────────────────────

test('기록이 하나도 없으면 서른 개 모두 「안 통과」 (멈추지 않고 까닭을 적음)', async () => {
  const empty = await loadState(path.join(os.tmpdir(), `atlas4h-none-${process.pid}`));
  assert.deepEqual(empty.boards, []);
  assert.equal(empty.judgment, null);
  assert.equal(empty.view, null);
  const rs = runAll(empty, {});
  for (const r of rs) {
    assert.equal(r.pass, false, `${r.id} 이 빈 기록에서 통과함`);
    assert.match(r.reason, /없음|없다/, `${r.id}: ${r.reason}`);
  }
  assert.match(CHECKS.T1(empty).reason, /판 없음/);
  assert.match(CHECKS.T4(empty).reason, /엔진 없음/);
  assert.match(CHECKS.T13(empty).reason, /채점 없음/);
  assert.match(CHECKS.K3(empty).reason, /엔진 없음/);
});

test('엔진이 있어도 판이 없으면 T4 는 「판 없음」', async () => {
  const empty = await loadState(path.join(os.tmpdir(), `atlas4h-none-${process.pid}`));
  assert.match(CHECKS.T4(empty, {engine: stubEngine}).reason, /판 없음/);
});

test('loadState: 깨진 줄은 멈추지 않고 적어 두며, T1 이 「못 읽은 줄」로 잡는다', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-broken-'));
  fs.cpSync(GOOD, dir, {recursive: true});
  fs.appendFileSync(path.join(dir, 'atlas4h/ledger/boards/2026-10-02.jsonl'), '{"id": "부서진 줄"\n');
  const s = await loadState(dir);
  assert.equal(s.errors.length, 1);
  assert.equal(s.errors[0].kind, 'boards');
  const r = CHECKS.T1(s);
  assert.equal(r.pass, false);
  assert.match(r.reason, /못 읽은 줄 1/);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('정렬 직렬화: 키 순서가 달라도 같은 글자 · 좋은 기록의 봉인 지문과 같음', () => {
  assert.equal(canonicalJson({b: 1, a: [2, {d: 1, c: '가'}]}), '{"a":[2,{"c":"가","d":1}],"b":1}');
  for (const b of BASE.boards) {
    const seal = BASE.seals.find(s => s.boardId === b.id);
    assert.equal(seal.sha256, boardSha256(b));
  }
});

test('T10 금지 말: 보통 낱말(사라지다·팔라듐·불확실)은 걸리지 않는다', () => {
  const s = goodState();
  board(s, B1).text.push('걱정이 사라지다 · 사라져 · 사라진 · 사라짐 · 팔라듐 값 · 불확실한 때');
  const r = CHECKS.T10(s);
  assert.equal(r.pass, true, r.reason);
  for (const word of ['사라', '팔라', '추천', '목표가', '목표 가', '확실', '보장', '무조건']) {
    assert.ok(FORBIDDEN.some(f => f.re.test(`지금 ${word} 합니다`)), word);
  }
});

test('T11: 옛 장부에 줄을 덧붙이기만 한 것은 통과', () => {
  const r = checkOldEngineUntouched(CLEAN);
  assert.equal(r.pass, true, r.reason);
  assert.equal(r.counts.commits, 2);
});

test('T11: 빈 목록·목록 없음은 「안 통과」', () => {
  assert.match(checkOldEngineUntouched([]).reason, /바뀐 파일 기록 없음/);
  assert.match(checkOldEngineUntouched(null).reason, /깃 기록 없음/);
});

test('T11: 깃에서 센 목록은 꼴이 맞다 (깃이 없으면 null)', () => {
  const changes = collectAtlas4hChanges(REPO);
  if (changes === null) return;
  assert.ok(Array.isArray(changes));
  for (const c of changes) {
    assert.match(c.commit, /^[0-9a-f]{40}$/);
    assert.ok(c.subject.startsWith('atlas4h'));
    assert.match(c.status, /^[A-Z]/);
    assert.equal(typeof c.path, 'string');
  }
});

test('극한 시험 자료 K1~K7: 걸음과 약속이 있고 약속마다 쉬운 설명이 있다', () => {
  for (const id of ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7']) {
    const fx = JSON.parse(fs.readFileSync(path.join(EXTREMES_DIR, `${id}.json`), 'utf8'));
    assert.equal(fx.id, id);
    assert.ok(fx.steps.length >= 1, id);
    assert.ok(fx.expect.length >= 2, id);
    for (const ex of fx.expect) assert.ok(ex.say && ex.type, `${id} ${JSON.stringify(ex)}`);
  }
});

// ───────────────────────── 심어 둔 흠은 맞는 까닭으로 잡힌다 ─────────────────────────

const PLANTED = [
  // T1 봉인 뒤 수정 0
  {id: 'T1', name: '봉인 뒤 판 값을 고침', mutate: s => { board(s, B1).kospi.center += 1; }, reason: /지문 다름 1/},
  {id: 'T1', name: '봉인 기록 하나가 빠짐', mutate: s => { s.seals = s.seals.filter(x => x.boardId !== B2); }, reason: /봉인 없음 1/},
  {id: 'T1', name: '같은 판을 두 번 적음', mutate: s => { s.boards.push(structuredClone(board(s, B1))); }, reason: /판 겹침 1/},
  {id: 'T1', name: '판은 지우고 봉인만 남음', mutate: s => { s.boards = s.boards.filter(b => b.id !== B3); }, reason: /판 없는 봉인 1/},
  // T2 봉인 시각 뒤 자료 0
  {id: 'T2', name: '봉인 14분 뒤에 받은 출처', mutate: s => { variable(board(s, B1), 'sox').sources[0].fetchedAt = '2026-10-02T08:45:00+09:00'; }, reason: /봉인 뒤 자료 1/},
  {id: 'T2', name: '재현 판에 자료 마감 뒤 값', mutate: s => { variable(board(s, B4), 'sox').observedAt = '2026-09-01T09:00:00+09:00'; }, reason: /봉인 뒤 자료 1/},
  {id: 'T2', name: '상수를 봉인 뒤에 잼', mutate: s => { board(s, B2).inputs.constants.measuredAt = '2026-10-02T13:00:00+09:00'; }, reason: /constants\.measuredAt/},
  // T3 코드 판·자료 판·씨앗
  {id: 'T3', name: '씨앗이 빠짐', mutate: s => { delete board(s, B2).seed; }, reason: /씨앗 1/},
  {id: 'T3', name: '코드 판이 가지 이름', mutate: s => { board(s, B1).code.commit = 'main'; }, reason: /코드 판 1/},
  {id: 'T3', name: '자료 판 지문이 짧음', mutate: s => { board(s, B1).dataVersion.sha256 = 'abc'; }, reason: /자료 판 1/},
  // T4 같은 입력이면 같은 출력
  {id: 'T4', name: '판 값이 엔진 재실행과 다름', mutate: s => { board(s, B1).kospi.center += 0.01; }, reason: /봉인과 다름 1/},
  {id: 'T4', name: '엔진이 무작위를 씀', opts: {engine: BAD.jitter}, reason: /봉인과 다름 3/},
  {id: 'T4', name: '엔진이 멈춤', opts: {engine: BAD.throws}, reason: /멈춤 3/},
  // T5 세 시나리오 확률 합 100%
  {id: 'T5', name: '확률 합이 105%', mutate: s => { board(s, B1).kospi.scenarios[0].prob = 0.3; }, reason: /확률 합 1\.05/},
  {id: 'T5', name: '시나리오 이름이 다름', mutate: s => { board(s, B1).kospi.scenarios[2].name = '아주 아래'; }, reason: /위·가운데·아래 셋이 아님/},
  {id: 'T5', name: '시나리오가 둘', mutate: s => { board(s, B2).kospi.scenarios.pop(); }, reason: /셋이 아님/},
  // T6 MinT
  {id: 'T6', name: '맞춘 뒤 어긋남 5', mutate: s => { board(s, B1).reconciliation.maxGap = 5; }, reason: /어긋남 5/},
  {id: 'T6', name: '「나머지」 마디가 없음', mutate: s => { const r = board(s, B2).reconciliation; r.nodes = r.nodes.filter(n => n !== '나머지'); }, reason: /나머지/},
  {id: 'T6', name: '맞추는 법이 OLS', mutate: s => { board(s, B1).reconciliation.method = 'OLS'; }, reason: /MinT 가 아님/},
  // T7 변수마다 시각·출처 둘
  {id: 'T7', name: '출처 하나인데 「ok」', mutate: s => { variable(board(s, B1), 'sox').status = 'ok'; }, reason: /「ok」인데 출처 1개/},
  {id: 'T7', name: '「없음」을 0 으로 채움', mutate: s => { variable(board(s, B1), 'vkospi').value = 0; }, reason: /「없음」인데 값이 0/},
  {id: 'T7', name: '출처 하나인데 표시가 엉뚱함', mutate: s => { variable(board(s, B2), 'kospi').status = '보통'; }, reason: /표시가 「보통」/},
  {id: 'T7', name: '「ok」인데 시각이 없음', mutate: s => { delete variable(board(s, B1), 'kospi').observedAt; }, reason: /시각 없음/},
  // T8 두 길 일치, 아니면 「확인 중」
  {id: 'T8', name: '어긋난 숫자를 화면에 냄', mutate: s => { board(s, B2).screen.value = board(s, B2).twoPath[0].pathA; }, reason: /어긋난 숫자가 화면에 나옴/},
  {id: 'T8', name: '두 길이 다른데 「같음」', mutate: s => { board(s, B1).twoPath[0].pathB += 2; }, reason: /「같음」/},
  {id: 'T8', name: '어긋났는데 「확인 중」이 없음', mutate: s => { board(s, B2).screen.value = '잠시 뒤'; }, reason: /「확인 중」 없음/},
  {id: 'T8', name: '화면 파일에 어긋난 숫자가 글로 나옴', mutate: s => { s.view.now.screen.chance = `가운데 ${board(s, B2).twoPath[0].pathB.toLocaleString('en-US')}`; }, reason: /어긋난 숫자가 화면에 나옴/},
  // T9 고리 40분 안
  {id: 'T9', name: '45분 걸렸는데 「ok」', mutate: s => { s.loops[0].endedAt = '2026-10-02T08:45:00+09:00'; }, reason: /「시간 초과」 표시 없음/},
  {id: 'T9', name: '시간 초과인데 판을 새로 봉인', mutate: s => { board(s, B3).status = '봉인'; }, reason: /앞 판 유지」 아님/},
  // T10 금지 말 0
  {id: 'T10', name: '판 글에 「사라」', mutate: s => { board(s, B1).text.push('지금 사라'); }, reason: /「사라」/},
  {id: 'T10', name: '화면 파일에 「목표가」', mutate: s => { s.view.now.screen.chance = '목표가 2700'; }, reason: /「목표가」/},
  {id: 'T10', name: '시나리오 전제에 「확실」', mutate: s => { board(s, B1).kospi.scenarios[0].premise = '오름이 확실함'; }, reason: /「확실」/},
  {id: 'T10', name: '까닭 글에 「추천」', mutate: s => { board(s, B2).text.push('이 종목 추천'); }, reason: /「추천」/},
  // T11 옛 엔진·채점·기록 변경 0
  {id: 'T11', name: '옛 엔진 코드를 고침', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'lib/atlas11/engine.mjs', deletedLines: 1}]}, reason: /lib\/atlas11\/engine\.mjs/},
  {id: 'T11', name: '옛 설정을 고침', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'config/atlas11/model.json', deletedLines: 0}]}, reason: /config\/atlas11/},
  {id: 'T11', name: '옛 장부의 줄을 고침', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'reports/atlas11/ledger/2026-09.jsonl', deletedLines: 2}]}, reason: /줄 2개 지우거나 고침/},
  {id: 'T11', name: '옛 장부 파일을 지움', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'D', path: 'reports/atlas11/ledger/2026-08.jsonl', deletedLines: 30}]}, reason: /2026-08\.jsonl \(D\)/},
  {id: 'T11', name: '옛 화면을 덮음', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'A', path: 'site/index.html', deletedLines: 0}]}, reason: /site\/index\.html/},
  {id: 'T11', name: '옛 화면 자료를 덮음', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'public/data/atlas11/latest.json', deletedLines: 0}]}, reason: /public\/data\/atlas11/},
  {id: 'T11', name: '옛 수집 스크립트를 고침', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'scripts/atlas11/collect_context.mjs', deletedLines: 3}]}, reason: /scripts\/atlas11/},
  // T12 재현에서 폭이 기준 셋을 이김
  {id: 'T12', name: '「ATLAS 11」 점수가 없는 날', mutate: s => { const b = s.retro.rows[7].baselines.find(x => x.id === 'ATLAS 11'); b.interval = null; b.note = '없음'; }, reason: /기준 「ATLAS 11」 점수 없음 — 2026-09-03/},
  {id: 'T12', name: '「단순 전이식」이 더 좁음', mutate: s => { for (const r of s.retro.rows) r.baselines.find(x => x.id === '단순 전이식').interval = r2(r.interval.score - 1); }, reason: /못 이김: 「단순 전이식」보다 폭 점수가 낮지 않음/},
  {id: 'T12', name: '「무판」과 차이가 우연 수준 (평균 0.1 · 번갈아 ±5)', mutate: s => {
    s.retro.rows.forEach((row, i) => { row.baselines.find(x => x.id === '무판').interval = r2(row.interval.score + 0.1 + (i % 2 ? 5 : -5)); });
  }, reason: /못 이김: 「무판」 DM p 0\.[1-9]/},
  {id: 'T12', name: '구간이 80% 가 아님', mutate: s => { s.retro.rows[0].interval.alpha = 0.1; }, reason: /α 가 0\.2 가 아닌 줄 1개/},
  {id: 'T12', name: '재현 결과가 없음', mutate: s => { s.retro = null; }, reason: /재현 결과 없음/},
  // T13 80% 덮음 70~90%(30판↑)·위기 따로
  {id: 'T13', name: '모두 덮음 (범위가 너무 넓음)', mutate: s => { for (const x of s.scores) if (x.interval) x.interval.covered = true; s.scores = s.scores.filter(x => !BASE.boards.some(b => b.id === x.boardId)); }, reason: /100\.0% — 70~90% 밖/},
  {id: 'T13', name: '채점 20판뿐', mutate: s => { s.scores = makeScores(20); }, reason: /20판 — 30판이 안 됨/},
  {id: 'T13', name: '위기 판이 없음', mutate: s => { for (const x of s.scores) x.crisis = false; }, reason: /위기 판 없음/},
  {id: 'T13', name: '채점 기록의 덮음이 봉인 범위와 다름', mutate: s => { const x = s.scores.find(y => y.boardId === B1); x.interval.covered = !x.interval.covered; }, reason: /봉인 범위와 다름 1개/},
  // T14 화면 숫자 = 봉인 값
  {id: 'T14', name: '화면 가운데 값이 1 다름', mutate: s => { s.view.history[0].kospi.center += 1; }, reason: /kospi\.center/},
  {id: 'T14', name: '없는 판을 가리킴', mutate: s => { s.view.history[0].boardId = '4h-20261002-04-ffffffff'; }, reason: /그런 판 없음/},
  {id: 'T14', name: '봉인에 없는 숫자를 화면에 냄', mutate: s => { s.view.history[0].kospi.widthPct = 3.1; }, reason: /widthPct: 화면 3\.1 · 봉인 없음/},
  // T15 극한 K1~K7
  {id: 'T15', name: '종목 범위를 ±30% 로 안 자르는 엔진', opts: {engine: BAD.noClip}, reason: /K4/},
  {id: 'T15', name: '멈추는 엔진', opts: {engine: BAD.throws}, reason: /K1.*외 5/},
  // T16 무판을 못 이긴 가운데 후보의 무게 0
  {id: 'T16', name: '못 이긴 후보에 무게 0.3', mutate: s => { board(s, B1).engines.find(e => e.id === 'center-transfer').weight = 0.3; }, reason: /center-transfer: 무판을 못 이겼는데 무게 0\.3/},
  {id: 'T16', name: '이겼다는데 DM p 0.2', mutate: s => {
    Object.assign(s.weights.candidates[0], {beatsNoChange: true, dm: {p: 0.2}});
    board(s, B2).engines.find(e => e.id === 'center-transfer').weight = 0.5;
  }, reason: /무판을 못 이겼는데 무게 0\.5/},
  {id: 'T16', name: '근거에 없는 가운데 후보', mutate: s => { board(s, B1).engines.push({id: 'center-new', role: '가운데', weight: 0.1, inputs: ['kospi'], sawPreviousBoard: false}); }, reason: /근거에 없는 후보/},
  // T17 검색 결과에 봉인 뒤 정보 0
  {id: 'T17', name: '봉인 뒤 정보가 섞임', mutate: s => { board(s, B1).events[0].leakCheck.postSealHits = 2; }, reason: /봉인 뒤 정보 2건/},
  {id: 'T17', name: '누수 검사를 안 함', mutate: s => { board(s, B2).events[0].leakCheck.checked = 0; }, reason: /누수 검사 안 함/},
  // T18 LLM 판 재현은 학습 마감 뒤만
  {id: 'T18', name: '학습 마감 전 날짜를 재현', mutate: s => { board(s, B4).target.date = '2026-06-15'; }, reason: /겨눈 날 2026-06-15 ≤ 학습 마감 2026-06-30/},
  // T19 판정 기준이 첫 채점 전에 봉인
  {id: 'T19', name: '판정 기준 커밋이 첫 채점 뒤', opts: {judgmentCommitAt: '2026-10-02T16:00:00+09:00'}, reason: /커밋이 첫 채점보다 늦음/},
  {id: 'T19', name: '판정 기준 봉인이 첫 채점 뒤', mutate: s => { s.judgment.sealedAt = '2026-10-03T00:00:00+09:00'; }, reason: /봉인이 첫 채점보다 늦음/},
  {id: 'T19', name: '커밋 시각을 모름', opts: {judgmentCommitAt: null}, reason: /커밋 시각을 모름/},
  // T20 시도가 장부에 다 있고 SPA 를 거침
  {id: 'T20', name: '장부에 없는 시도를 인용', mutate: s => { s.weights.selections[0].trialIds.push('trial-9999'); }, reason: /장부에 없는 시도 trial-9999/},
  {id: 'T20', name: 'SPA 를 안 거침', mutate: s => { delete s.weights.selections[0].spa; }, reason: /SPA p 없음/},
  // T21 엔진들이 앞 판 값을 안 봄
  {id: 'T21', name: '앞 판을 본 엔진', mutate: s => { board(s, B2).engines[2].sawPreviousBoard = true; }, reason: /앞 판을 봤거나 기록 없음 1/},
  {id: 'T21', name: '앞 판을 봤는지 기록이 없음', mutate: s => { delete board(s, B1).engines[0].sawPreviousBoard; }, reason: /기록 없음 1/},
  // T22 답마다 쓴 구조 번호
  {id: 'T22', name: 'F 칸이 비었음', mutate: s => { const b = board(s, B1); b.structures = b.structures.filter(x => x[0] !== 'F'); }, reason: /빈 칸 F/},
  {id: 'T22', name: '없는 구조 번호', mutate: s => { board(s, B2).structures.push('G7'); }, reason: /없는 번호 G7/},
  // T23 감시 S1~S8 모두 0
  {id: 'T23', name: '층 쌓기 하나 잡힘', mutate: s => { s.watch[1].S.S3 = 1; }, reason: /S3=1/},
  {id: 'T23', name: '감시 기록이 없는 고리', mutate: s => { s.watch = s.watch.filter(w => w.loopId !== 'loop-20261002-16'); }, reason: /loop-20261002-16: 감시 기록 없음/},
  // K1~K7 극한
  {id: 'K1', name: '미국 쉰 날 값을 0 으로', opts: {engine: BAD.holidayZero}, reason: /0 으로 안 바꿈/},
  {id: 'K1', name: '한국 쉰 날 미국 등락을 안 쌓음', opts: {engine: BAD.noCarry}, reason: /곱해 쌓은 값/},
  {id: 'K2', name: '「없음」을 0 으로 채움', opts: {engine: BAD.zeroFill}, reason: /「없음」인데 값이 0/},
  {id: 'K2', name: '모두 끊겼는데 새로 봉인', opts: {engine: BAD.noReseal}, reason: /코스피 가운데 값 없음/},
  {id: 'K3', name: '서킷브레이커를 안 적음', opts: {engine: BAD.noFlags}, reason: /서킷브레이커·사이드카를 판에 적는다/},
  {id: 'K3', name: '범위에 NaN', opts: {engine: BAD.nan}, reason: /NaN/},
  {id: 'K4', name: '±30% 로 안 자름', opts: {engine: BAD.noClip}, reason: /±30% 안/},
  {id: 'K4', name: '거래정지 종목을 0 으로', opts: {engine: BAD.haltZero}, reason: /000660 가운데 값이 0/},
  {id: 'K5', name: '장중 발표에 방아쇠가 없음', opts: {engine: BAD.noTrigger}, reason: /방아쇠 판 없음/},
  {id: 'K5', name: '방아쇠가 45분 늦음', opts: {engine: BAD.lateTrigger}, reason: /발표 뒤 65\.0분/},
  {id: 'K6', name: '문턱을 넘었는데 방아쇠가 없음', opts: {engine: BAD.noTrigger}, reason: /방아쇠 판 없음/},
  {id: 'K6', name: '「크게 바뀜」을 안 적음', opts: {engine: BAD.noBigMark}, reason: /「크게 바뀜」/},
  {id: 'K7', name: '국면 확률을 안 적음', opts: {engine: BAD.noRegime}, reason: /국면 확률 없음/},
  {id: 'K7', name: '사나워도 범위가 그대로', opts: {engine: BAD.flatWidth}, reason: /넓다/},
  ...['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7'].map(id => ({id, name: '엔진이 멈춤', opts: {engine: BAD.throws}, reason: /엔진이 멈춤 — .*일부러 멈춤/})),
];

for (const p of PLANTED) {
  test(`${p.id} 심은 흠을 잡음: ${p.name}`, () => {
    const s = goodState();
    p.mutate?.(s);
    const r = CHECKS[p.id](s, {...OPTS, ...(p.opts ?? {})});
    assert.equal(r.pass, false, `${p.id} 가 흠을 못 잡음 (${r.reason})`);
    assert.match(r.reason, p.reason);
  });
}

test(`심은 흠 ${PLANTED.length}개 — 서른 개 시험마다 하나 이상`, () => {
  for (const id of IDS) assert.ok(PLANTED.some(p => p.id === id), `${id} 에 심은 흠이 없음`);
});

test('극한 시험은 걸음마다 엔진에 입력 복사본을 준다 (자료 파일이 바뀌지 않음)', () => {
  const mutating = (inputs, seed) => {
    inputs.variables.length = 0;
    return stubEngine({variables: []}, seed);
  };
  runExtreme('K4', {}, {engine: mutating});
  assert.equal(runExtreme('K4', {}, {engine: stubEngine}).pass, true);
});
