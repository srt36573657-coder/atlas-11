/**
 * 사양 T1~T23 · 극한 K1~K7 시험 코드가 제대로 재는지 본다 (첫 실행 5번)
 *   node --test atlas4h/tests/
 *
 * - 좋은 기록(atlas4h/spec/fixtures/good)은 서른 개 모두 통과한다.
 * - 한 곳만 망가뜨린 복사본(심어 둔 흠)은 맞는 까닭으로 「안 통과」 한다.
 * - 엔진 시험(T4·T15·K1~K7)은 규칙을 지키는 작은 엔진으로는 통과, 규칙을 어기거나 멈추는 엔진으로는 안 통과.
 * - 30판이 넘는 채점(T13)과 재현 결과(T12)는 씨앗을 고정해 이 파일 안에서 만든다 (큰 파일을 두지 않음).
 * - 변경 요청 atlas4h-01(ECO-01)로 엄해진 열두 곳은 아래 ECO01 에 이 일꾼이 새로 심은 흠으로 잰다(eco: 1~12 = 요청서 번호).
 *   독립 시험 일꾼의 흠 111개(verify/independent-defects.json)를 그대로 옮기지 않았다 — 같은 자료로 고치고 채점하지 않으려고(감시 S8).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  loadState, CHECKS, IDS, runAll, runExtreme, checkOldEngineUntouched, collectAtlas4hChanges,
  boardSha256, canonicalJson, FORBIDDEN, EXTREMES_DIR, sourceOrg, loadContract,
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

/** T13 용 (ECO-01): 평소 판 normal 줄 중 covN 줄 덮음 + 위기 판 crisis 줄 중 covC 줄 덮음 — 봉인 판이 없는 채점 */
function scoreRows(normal, covN, crisis, covC) {
  return Array.from({length: normal + crisis}, (_, i) => {
    const isCrisis = i >= normal;
    const k = isCrisis ? i - normal : i;
    const day = String(5 + Math.floor(i / 3)).padStart(2, '0');
    return {
      boardId: `s-202610${day}-${['08', '12', '16'][i % 3]}-${String(i).padStart(4, '0')}`,
      target: `2026-10-${day}`,
      scoredAt: `2026-10-${day}T15:41:00+09:00`,
      actual: {value: 2650, asOf: `2026-10-${day}T15:30:00+09:00`, source: '시험용'},
      interval: {alpha: 0.2, score: 40, covered: isCrisis ? k < covC : k < covN},
      crisis: isCrisis,
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

/** T11 깨끗한 목록: 새 폴더만 바꾸고, atlas4h 장부에는 줄을 덧붙이기만 함
 *  (ECO-01 앞에는 옛 장부 reports/atlas11/ledger/ 에 덧붙이기를 깨끗하다고 봤다 — 이제는 옛 기록 전체를 지킨다) */
const CLEAN = [
  {commit: 'c2717ee', subject: 'atlas4h 1: save the command', status: 'A', path: 'atlas4h/command/original.txt', deletedLines: 0},
  {commit: '70ff430', subject: 'atlas4h 5: board format', status: 'A', path: 'atlas4h/spec/board.md', deletedLines: 0},
  {commit: '70ff430', subject: 'atlas4h 5: board format', status: 'M', path: 'atlas4h/ledger/boards/2026-10-02.jsonl', deletedLines: 0, appendOnly: true},
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

test('T10 금지 말: 보통 낱말(사라지다·사라졌다·사라질·팔라듐·불확실)은 걸리지 않는다', () => {
  const s = goodState();
  board(s, B1).text.push('걱정이 사라지다 · 사라져 · 사라졌다 · 사라질 · 사라진 · 사라짐 · 팔라듐 값 · 불확실한 때');
  const r = CHECKS.T10(s);
  assert.equal(r.pass, true, r.reason);
  for (const word of ['사라', '팔라', '추천', '목표가', '목표 가', '확실', '보장', '무조건']) {
    assert.ok(FORBIDDEN.some(f => f.re.test(`지금 ${word} 합니다`)), word);
  }
});

test('T10 헛잡음 고침 (ECO-01 11번): 「사라졌다」·「불확실」은 안 잡고 「사라」만 쓴 글은 잡는다', () => {
  for (const ok of ['어제 걱정이 사라졌다는 뜻은 아닙니다.', '밤사이 불확실성이 커져 폭을 넓혔습니다.', '불확실']) {
    const s = goodState();
    board(s, B1).text.push(ok);
    const r = CHECKS.T10(s);
    assert.equal(r.pass, true, `「${ok}」를 잘못 잡음: ${r.reason}`);
  }
  for (const bad of ['사라', '지금 사라!', '이 종목 사라. 내일 오름']) {
    const s = goodState();
    board(s, B1).text.push(bad);
    const r = CHECKS.T10(s);
    assert.equal(r.pass, false, `「${bad}」를 못 잡음`);
    assert.match(r.reason, /「사라」/);
  }
});

test('T11: atlas4h 장부에 줄을 덧붙이기만 한 것은 통과', () => {
  const r = checkOldEngineUntouched(CLEAN);
  assert.equal(r.pass, true, r.reason);
  assert.equal(r.counts.commits, 2);
});

test('T11 (ECO-01 6번): 옛 장부 reports/atlas11/ledger/ 에 줄 덧붙이기도 이제 잡는다 (옛 기록 전체를 지킴)', () => {
  const r = checkOldEngineUntouched([...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'reports/atlas11/ledger/2026-10.jsonl', deletedLines: 0, appendOnly: true}]);
  assert.equal(r.pass, false);
  assert.match(r.reason, /reports\/atlas11\/ledger\/2026-10\.jsonl \(M\)/);
});

test('T11 (ECO-01 6번): 깃에서 센 목록 — atlas4h 장부 끝에 덧붙이기만 받고, 줄을 중간에 끼우면 잡는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-git-'));
  const git = (...args) => execFileSync('git', ['-C', dir, '-c', 'user.name=시험', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
  try {
    try {
      git('init', '-q');
    } catch {
      return; // 깃이 없는 곳에서는 건너뜀
    }
    const rel = 'atlas4h/ledger/boards/2026-10-02.jsonl';
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, '{"id":1}\n{"id":2}\n');
    git('add', '-A');
    git('commit', '-q', '-m', 'base');
    const base = git('rev-parse', 'HEAD').trim();
    fs.appendFileSync(file, '{"id":3}\n');
    git('commit', '-q', '-am', 'atlas4h 9: append one line');
    const appended = collectAtlas4hChanges(dir, base);
    assert.deepEqual(appended.map(c => [c.status, c.path, c.deletedLines, c.appendOnly]), [['M', rel, 0, true]]);
    assert.equal(checkOldEngineUntouched(appended).pass, true);
    const mid = git('rev-parse', 'HEAD').trim();
    fs.writeFileSync(file, '{"id":1}\n{"id":1.5}\n{"id":2}\n{"id":3}\n');
    git('commit', '-q', '-am', 'atlas4h 9: insert a line in the middle');
    const inserted = collectAtlas4hChanges(dir, mid);
    assert.deepEqual(inserted.map(c => [c.status, c.deletedLines, c.appendOnly]), [['M', 0, false]]);
    const r = checkOldEngineUntouched(inserted);
    assert.equal(r.pass, false);
    assert.match(r.reason, /끝이 아닌 곳에 끼움/);
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
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
    if ('appendOnly' in c) assert.ok(c.appendOnly === true || c.appendOnly === false || c.appendOnly === null, c.path);
  }
});

test('출처 회사(sourceOrg): 같은 회사의 다른 주소는 하나로 센다 (자료 약속 2번 · T7 ①)', () => {
  assert.equal(sourceOrg('https://m.stock.naver.com/api/index/KOSPI/price?pageSize=10&page=1'), 'naver.com');
  assert.equal(sourceOrg('https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=10'), 'naver.com');
  assert.equal(sourceOrg('https://data-dbg.krx.co.kr/svc/apis/idx/kospi_dd_trd?basDd={YYYYMMDD}'), 'krx.co.kr');
  assert.equal(sourceOrg('https://ecos.bok.or.kr/api/StatisticSearch/{KEY}/json/kr/1/10/731Y001/D/{YYYYMMDD}/{YYYYMMDD}/0000001'), 'bok.or.kr');
  assert.equal(sourceOrg('https://openapi.koreainvestment.com:9443'), 'koreainvestment.com');
  assert.equal(sourceOrg('https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500'), 'stlouisfed.org');
  assert.equal(sourceOrg('주소가 아닌 글'), null);
});

test('자료 약속의 출처 둘은 모두 서로 다른 회사 — T7 ① 이 자료 약속과 부딪히지 않는다', () => {
  const contract = loadContract();
  assert.ok(contract, '자료 약속(atlas4h/data/variables.json)을 못 읽음');
  let pairs = 0;
  for (const v of contract.variables) {
    const s = v.sources ?? [];
    if (s.length < 2) continue;
    pairs++;
    assert.ok(sourceOrg(s[0].url) && sourceOrg(s[1].url), v.id);
    assert.notEqual(sourceOrg(s[0].url), sourceOrg(s[1].url), v.id);
  }
  assert.ok(pairs >= 5, `출처 둘인 변수 ${pairs}개`);
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

/** 「ok」 코스피를 봉인 가까이 관측한 값으로 바꾸고 「옛값」 표시를 뗀다 (T7 ⑤ 용) */
function freshKospi(s, id, obs, srcObs = [obs, obs]) {
  const v = variable(board(s, id), 'kospi');
  v.observedAt = obs;
  v.sources.forEach((x, i) => { x.observedAt = srcObs[i]; });
  v.marks = ['장 닫힘'];
  return v;
}

// ── ECO-01 (변경 요청 atlas4h-01): 엄해진 열두 곳마다 이 일꾼이 새로 심은 흠 — eco = 요청서 「고칠 곳」 번호 ──
// 앞 시험 코드(ECO-01 전)는 이 흠들을 「통과」로 놓친다(T10·T12 는 고친 뒤에도 그대로 잡는지·멈추지 않는지 본다).
const ECO01 = [
  // 1 · T2: 출발값 시각(kospi.anchor.asOf)도 봉인 시각 이하 — 판 입력의 시각 칸은 깊이와 상관없이 모두 잰다
  {eco: 1, id: 'T2', name: '재현 판 출발값이 자료 마감(08:30) 뒤 09:00 값 — 봉인(10/1)보다는 앞', mutate: s => { board(s, B4).kospi.anchor.asOf = '2026-09-01T09:00:00+09:00'; }, reason: /r4h-20260901-08-d4e5f6a7 kospi\.anchor\.asOf/},
  {eco: 1, id: 'T2', name: '출발값 시각이 비어 있음', mutate: s => { delete board(s, B1).kospi.anchor.asOf; }, reason: /kospi\.anchor\.asOf 시각 없음/},
  {eco: 1, id: 'T2', name: '시간 초과 판(16시)의 출발값이 봉인 4분 뒤 값', mutate: s => { board(s, B3).kospi.anchor.asOf = '2026-10-02T16:45:00+09:00'; }, reason: /4h-20261002-16-c3d4e5f6 kospi\.anchor\.asOf/},
  {eco: 1, id: 'T2', name: '변수의 앞 값(previous) 시각이 봉인 뒤', mutate: s => { variable(board(s, B1), 'kospi').previous = {value: 2650.1, observedAt: '2026-10-02T09:00:00+09:00'}; }, reason: /kospi\.previous\.observedAt/},
  {eco: 1, id: 'T2', name: '봉인 뒤에 나온 발표 결과를 입력에 씀', mutate: s => { board(s, B2).inputs.events = [{name: '미국 고용지표', at: '2026-10-02T21:30:00+09:00', result: 0.2}]; }, reason: /events\[0\]\.at/},
  // 2 · T3: 자료 파일 목록이 비면 · 커밋 안 된 코드(dirty)면 안 통과
  {eco: 2, id: 'T3', name: '자료 파일 목록 칸이 통째로 없음', mutate: s => { delete board(s, B2).dataVersion.files; }, reason: /자료 파일 1/},
  {eco: 2, id: 'T3', name: '자료 파일 이름이 빈 글자', mutate: s => { board(s, B4).dataVersion.files = ['']; }, reason: /자료 파일 1/},
  {eco: 2, id: 'T3', name: '코드가 깨끗한지(dirty) 안 적음', mutate: s => { delete board(s, B3).code.dirty; }, reason: /커밋 안 된 코드 1/},
  {eco: 2, id: 'T3', name: 'dirty 를 글자 "false" 로 적음', mutate: s => { board(s, B1).code.dirty = 'false'; }, reason: /커밋 안 된 코드 1/},
  {eco: 2, id: 'T3', name: '재현 판을 커밋 안 된 코드로 셈', mutate: s => { board(s, B4).code.dirty = true; }, reason: /커밋 안 된 코드 1 — r4h-20260901-08-d4e5f6a7/},
  // 3 · T6: 판에 있는 예측(코스피·종목)이 모두 맞추기 마디에
  {eco: 3, id: 'T6', name: '12시 판 마디에서 005930 이 빠짐', mutate: s => { board(s, B2).reconciliation.nodes = ['kospi', '000660', '나머지']; }, reason: /4h-20261002-12-b2c3d4e5: 맞추기 마디에 없는 예측 005930/},
  {eco: 3, id: 'T6', name: '판에 종목을 더했는데 마디에는 안 더함', mutate: s => { board(s, B1).stocks.push({code: '035420', center: 201500, quantiles: {p10: 198000, p50: 201500, p90: 205000}, status: []}); }, reason: /맞추기 마디에 없는 예측 035420/},
  {eco: 3, id: 'T6', name: '재현 판 마디에 코스피가 없음', mutate: s => { board(s, B4).reconciliation.nodes = ['005930', '000660', '나머지']; }, reason: /r4h-20260901-08-d4e5f6a7: 맞추기 마디에 없는 예측 kospi/},
  {eco: 3, id: 'T6', name: '종목 번호가 빈 글자', mutate: s => { board(s, B3).stocks[1].code = ''; }, reason: /번호 없는 종목/},
  // 4 · T7: 「ok」 이려면 ① 출처 이름·주소(회사)가 다름 ② fetchedAt ③ 값 ④ 자료 약속 허용 폭 ⑤ 봉인 4시간 안 관측
  {eco: 4, id: 'T7', name: '① 두 출처가 같은 회사(네이버)의 다른 주소', mutate: s => { Object.assign(variable(board(s, B1), 'kospi').sources[1], {name: '네이버 증권 지수 분봉', url: 'https://api.stock.naver.com/chart/domestic/index/KOSPI/minute'}); }, reason: /4h-20261002-08-a1b2c3d4 kospi: 두 출처가 같은 회사 \(naver\.com\)/},
  {eco: 4, id: 'T7', name: '① 두 출처 이름이 같음 (앞뒤 빈칸만 다름 · 주소는 다름)', mutate: s => { const v = variable(board(s, B4), 'stock-price:000660'); v.sources[1].name = ` ${v.sources[0].name} `; }, reason: /stock-price:000660: 두 출처 이름이 같음/},
  {eco: 4, id: 'T7', name: '① 둘째 출처 주소가 없음', mutate: s => { delete variable(board(s, B1), 'stock-price:005930').sources[1].url; }, reason: /stock-price:005930: 출처 주소 없음/},
  {eco: 4, id: 'T7', name: '② 받은 시각이 읽을 수 없는 글', mutate: s => { variable(board(s, B4), 'kospi').fetchedAt = '어제 아침'; }, reason: /r4h-20260901-08-d4e5f6a7 kospi: 받은 시각\(fetchedAt\) 없음/},
  {eco: 4, id: 'T7', name: '③ 종목 값 칸이 통째로 없음', mutate: s => { delete variable(board(s, B1), 'stock-price:005930').value; }, reason: /stock-price:005930: 「ok」인데 값이 없음/},
  {eco: 4, id: 'T7', name: '④ 종목 두 출처가 100원 다름 (약속: 같아야 함)', mutate: s => { variable(board(s, B1), 'stock-price:000660').sources[1].value = 182100; }, reason: /두 출처 값이 다름 \(182000 · 182100/},
  {eco: 4, id: 'T7', name: '④ 재현 판 코스피 두 출처가 0.1% 다름 (허용 0.05%)', mutate: s => { variable(board(s, B4), 'kospi').sources[1].value = 2514.8; }, reason: /두 출처 차이 0\.100% — 허용 0\.050% 넘음/},
  {eco: 4, id: 'T7', name: '④ 자료 약속에 없는 변수를 「ok」로', mutate: s => {
    const at = '2026-10-02T06:00:00+09:00';
    board(s, B1).inputs.variables.push({id: 'gold', market: 'US', value: 2400, observedAt: at, fetchedAt: '2026-10-02T08:00:50+09:00', status: 'ok',
      sources: [{name: '가 회사 금값', url: 'https://gold.example.com/a', value: 2400, observedAt: at}, {name: '나 기관 금값', url: 'https://data.example.org/b', value: 2400, observedAt: at}]});
  }, reason: /gold: 자료 약속에 없는 변수/},
  {eco: 4, id: 'T7', name: '⑤ 봉인 4시간 1분 전 관측인데 「옛값」 없음', mutate: s => { freshKospi(s, B1, '2026-10-02T04:30:40+09:00'); }, reason: /kospi: 봉인 4\.0시간 전 관측인데 「옛값」 없음/},
  {eco: 4, id: 'T7', name: '⑤ 출처 하나만 6시간 전 관측 (값 시각은 1시간 전)', mutate: s => { freshKospi(s, B1, '2026-10-02T07:31:40+09:00', ['2026-10-02T07:31:40+09:00', '2026-10-02T02:31:40+09:00']); }, reason: /봉인 6\.0시간 전 관측인데 「옛값」 없음/},
  // 5 · T8: 「봉인」 판에 두 길 계산이 하나도 없으면 안 통과 (숫자 없는 줄은 계산이 아님)
  {eco: 5, id: 'T8', name: '재현 판(봉인)에 두 길 칸이 통째로 없음', mutate: s => { delete board(s, B4).twoPath; }, reason: /r4h-20260901-08-d4e5f6a7: 봉인 판인데 두 길 계산 없음/},
  {eco: 5, id: 'T8', name: '두 길 줄은 있는데 숫자가 없음 (어긋남 표시·화면 「확인 중」만)', mutate: s => { board(s, B2).twoPath = [{what: '코스피 가운데 값', tolerance: 0.5, agree: false}]; }, reason: /두 길 숫자 없음/},
  {eco: 5, id: 'T8', name: '08시 봉인 판의 두 길을 비움', mutate: s => { board(s, B1).twoPath = []; }, reason: /4h-20261002-08-a1b2c3d4: 봉인 판인데 두 길 계산 없음/},
  // 6 · T11: 옛 기록 전체(reports/atlas11/)를 지킴 · atlas4h 장부·봉인 폴더는 덧붙이기만
  {eco: 6, id: 'T11', name: '옛 일별 기록 폴더에 새 파일을 더함', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'A', path: 'reports/atlas11/daily/2026-10-02.json', deletedLines: 0}]}, reason: /reports\/atlas11\/daily\/2026-10-02\.json \(A\)/},
  {eco: 6, id: 'T11', name: '옛 기록을 atlas4h 로 옮김 (이름 바꾸기 — 옛 주소가 지키는 곳)', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'R100', path: 'atlas4h/notes/verify.json', oldPath: 'reports/atlas11/verify/summary.json', deletedLines: 0}]}, reason: /reports\/atlas11\/verify\/summary\.json \(R\)/},
  {eco: 6, id: 'T11', name: '옛 기록 파일을 지움', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'D', path: 'reports/atlas11/latest.json', deletedLines: 12}]}, reason: /reports\/atlas11\/latest\.json \(D\)/},
  {eco: 6, id: 'T11', name: 'atlas4h 채점 장부 한 줄을 고침', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'M', path: 'atlas4h/ledger/scores/2026-10-02.jsonl', deletedLines: 1, appendOnly: false}]}, reason: /atlas4h\/ledger\/scores\/2026-10-02\.jsonl \(줄 1개 지우거나 고침\)/},
  {eco: 6, id: 'T11', name: 'atlas4h 판 장부 중간에 줄을 끼움 (지운 줄 0)', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'M', path: 'atlas4h/ledger/boards/2026-10-02.jsonl', deletedLines: 0, appendOnly: false}]}, reason: /끝이 아닌 곳에 끼움/},
  {eco: 6, id: 'T11', name: '시도 장부를 지움', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'D', path: 'atlas4h/seal/trials.jsonl', deletedLines: 3}]}, reason: /atlas4h\/seal\/trials\.jsonl \(D\)/},
  {eco: 6, id: 'T11', name: '봉인한 무게 근거를 고쳐 씀', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'M', path: 'atlas4h/seal/weights.json', deletedLines: 3, appendOnly: false}]}, reason: /atlas4h\/seal\/weights\.json \(줄 3개 지우거나 고침\)/},
  {eco: 6, id: 'T11', name: '장부 파일 이름을 바꿈', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'R095', path: 'atlas4h/ledger/loops/2026-10-02-old.jsonl', oldPath: 'atlas4h/ledger/loops/2026-10-02.jsonl', deletedLines: 0}]}, reason: /atlas4h\/ledger\/loops\/2026-10-02-old\.jsonl \(R\)/},
  {eco: 6, id: 'T11', name: '장부 파일을 글자가 아닌 것으로 바꿈 (지운 줄을 못 셈)', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'M', path: 'atlas4h/ledger/watch/2026-10-02.jsonl', deletedLines: null}]}, reason: /줄 \?개 지우거나 고침/},
  {eco: 6, id: 'T11', name: '덧붙이기인지 깃이 못 알아냄 (appendOnly null)', opts: {changes: [...CLEAN, {commit: 'x2', subject: 'atlas4h 9', status: 'M', path: 'atlas4h/ledger/boards/2026-10-03.jsonl', deletedLines: 0, appendOnly: null}]}, reason: /덧붙이기인지 모름/},
  // 7 · T13: 평소 판과 위기 판을 따로 센다 — 평소 판 30판 이상일 때만, 평소 판으로 70~90%
  {eco: 7, id: 'T13', name: '위기 판 11개를 더해 40판을 채움 — 평소 판은 29판 (합치면 80%)', mutate: s => { s.scores = scoreRows(29, 23, 11, 9); }, reason: /평소 판 29판 — 30판이 안 됨/},
  {eco: 7, id: 'T13', name: '평소 93.3% (너무 넓음)를 위기 빗나감이 가려 합치면 80%', mutate: s => { s.scores = scoreRows(30, 28, 10, 4); }, reason: /평소 판 80% 범위 덮음 93\.3% — 70~90% 밖 \(30판\)/},
  {eco: 7, id: 'T13', name: '평소 63.3% (너무 좁음)를 위기 덮음이 가려 합치면 72.5%', mutate: s => { s.scores = scoreRows(30, 19, 10, 10); }, reason: /평소 판 80% 범위 덮음 63\.3% — 70~90% 밖/},
  // 8 · T20: 고른 시도는 SPA 를 거친 목록 안 · 시도 줄마다 sealedAt · SPA p < 0.05
  {eco: 8, id: 'T20', name: '고른 시도(chose)를 안 적음', mutate: s => { delete s.weights.selections[0].chose; }, reason: /고른 시도\(chose\)를 안 적음/},
  {eco: 8, id: 'T20', name: '고른 시도 둘 중 하나가 SPA 목록 밖', mutate: s => { s.weights.selections[0].chose = ['trial-0002', 'trial-0003']; }, reason: /trial-0003 가 SPA 를 거친 목록 밖/},
  {eco: 8, id: 'T20', name: '인용 안 한 시도 줄에도 봉인 시각이 없음', mutate: s => { delete s.trials[2].sealedAt; }, reason: /trial-0003: 시도 결과 봉인 시각\(sealedAt\) 없음/},
  {eco: 8, id: 'T20', name: '시도 봉인 시각이 읽을 수 없는 글', mutate: s => { s.trials[0].sealedAt = '곧'; }, reason: /trial-0001: 시도 결과 봉인 시각\(sealedAt\) 없음/},
  {eco: 8, id: 'T20', name: 'SPA p 가 딱 0.05 (못 넘음)', mutate: s => { s.weights.selections[0].spa.p = 0.05; }, reason: /SPA p 0\.05 ≥ 0\.05 인데 고름/},
  // 9 · T21: 엔진 입력에서 앞 판 id·앞 판 값을 직접 찾는다 (스스로 적은 sawPreviousBoard 만 믿지 않음)
  {eco: 9, id: 'T21', name: '12시 판 엔진 입력에 08시 판 가운데 값(숫자)', mutate: s => { board(s, B2).engines[0].inputs.push(2649.86); }, reason: /4h-20261002-12-b2c3d4e5 center-nochange: 입력에 앞 판 값 2649\.86/},
  {eco: 9, id: 'T21', name: '16시 판 엔진 입력에 12시 판 가운데 값(글자)', mutate: s => { board(s, B3).engines[2].inputs.push('2663.15'); }, reason: /width-har: 입력에 앞 판 값 2663\.15/},
  {eco: 9, id: 'T21', name: '판 입력 변수의 출처가 판 장부 파일', mutate: s => {
    board(s, B3).inputs.variables.push({id: 'center-prev', market: 'KR', value: 2663.15, observedAt: '2026-10-02T12:12:30+09:00', fetchedAt: '2026-10-02T16:00:30+09:00', status: '한 출처',
      sources: [{name: 'atlas4h 판 장부', url: 'atlas4h/ledger/boards/2026-10-02.jsonl', value: 2663.15, observedAt: '2026-10-02T12:12:30+09:00'}]});
  }, reason: /4h-20261002-16-c3d4e5f6 inputs: 앞 판을 가리킴/},
  {eco: 9, id: 'T21', name: '엔진 입력 이름이 prevBoard', mutate: s => { board(s, B1).engines[1].inputs.push('prevBoard.center'); }, reason: /center-transfer: 입력에 앞 판을 가리킴 「prevBoard\.center」/},
  {eco: 9, id: 'T21', name: '앞 판 id 를 칸 이름에 숨김', mutate: s => { board(s, B2).engines[3].inputs = ['kospi', {'4h-20261002-08-a1b2c3d4': 'center'}]; }, reason: /width-harx: 입력에 앞 판 id 4h-20261002-08-a1b2c3d4/},
  {eco: 9, id: 'T21', name: '판 번호 꼴이 다른 앞 판 id 를 엔진 입력에 씀', mutate: s => { board(s, B1).id = 'morning-board-1002'; board(s, B2).engines[1].inputs.push('center@morning-board-1002'); }, reason: /center-transfer: 입력에 앞 판 id morning-board-1002/},
  // 10 · T23: 감시한 이(by)가 짓는 일꾼(바탕·고리·평가)이면 안 통과
  {eco: 10, id: 'T23', name: '감시한 이가 평가 일꾼의 에이전트 이름', mutate: s => { s.watch[2].by = 'atlas4h-eval'; }, reason: /loop-20261002-16: 감시한 이가 짓는 일꾼 「atlas4h-eval」/},
  {eco: 10, id: 'T23', name: '감시한 이가 「바탕일꾼」(띄어쓰기 없음)', mutate: s => { s.watch[0].by = '바탕일꾼'; }, reason: /짓는 일꾼 「바탕일꾼」/},
  {eco: 10, id: 'T23', name: '감시한 이(by)를 안 적음', mutate: s => { delete s.watch[1].by; }, reason: /loop-20261002-12: 감시한 이\(by\) 없음/},
  {eco: 10, id: 'T23', name: '고리를 지은 이와 감시한 이가 같은 에이전트', mutate: s => { s.loops[0].by = '에이전트 7f3a'; s.watch[0].by = '에이전트 7f3a'; }, reason: /고리를 지은 이와 같음 「에이전트 7f3a」/},
  {eco: 10, id: 'T23', name: '감시자 겸 고리 일꾼', mutate: s => { s.watch[1].by = '감시자 겸 고리 일꾼'; }, reason: /짓는 일꾼 「감시자 겸 고리 일꾼」/},
  // 11 · T10: 「사라졌다」 헛잡음을 고친 뒤에도 「사라」만 쓴 글은 잡는다
  {eco: 11, id: 'T10', name: '사건 이름에 「사라!」', mutate: s => { board(s, B2).events[0].name = '지금 사라!'; }, reason: /「사라」 4h-20261002-12-b2c3d4e5 events\[0\]\.name/},
  {eco: 11, id: 'T10', name: '화면 파일 글이 「사라」로 끝남', mutate: s => { s.view.now.screen.chance = '보통 · 위 25% · 이번엔 사라'; }, reason: /「사라」 화면/},
  // 12 · T12: 줄마다 차이가 똑같으면 멈추지 않고 「DM 셈 불가(차이 분산 0)」로 안 통과
  {eco: 12, id: 'T12', name: '줄마다 차이가 똑같음 (엔진 40 · 기준 46·47·48)', mutate: s => { for (const r of s.retro.rows) { r.interval.score = 40; r.baselines.forEach((b, k) => { b.interval = 46 + k; }); } }, reason: /못 이김: 「무판」 DM 셈 불가\(차이 분산 0\)/},
  {eco: 12, id: 'T12', name: '「ATLAS 11」 과만 차이가 늘 7', mutate: s => { for (const r of s.retro.rows) { r.interval.score = Math.round(r.interval.score); r.baselines.find(x => x.id === 'ATLAS 11').interval = r.interval.score + 7; } }, reason: /「ATLAS 11」 DM 셈 불가\(차이 분산 0\)/},
];

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
  {id: 'T11', name: '옛 장부의 줄을 고침', opts: {changes: [...CLEAN, {commit: 'x1', subject: 'atlas4h 9', status: 'M', path: 'reports/atlas11/ledger/2026-09.jsonl', deletedLines: 2}]}, reason: /reports\/atlas11\/ledger\/2026-09\.jsonl \(M\)/},
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
  {id: 'T13', name: '채점 20판뿐 (평소 17 · 위기 3)', mutate: s => { s.scores = makeScores(20); }, reason: /평소 판 17판 — 30판이 안 됨/},
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
  ...ECO01,
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

test(`ECO-01 고칠 곳 열둘마다 이 일꾼이 새로 심은 흠이 하나 이상 (모두 ${ECO01.length}개)`, () => {
  for (let n = 1; n <= 12; n++) assert.ok(ECO01.some(p => p.eco === n), `ECO-01 ${n}번에 심은 흠이 없음`);
});

test('T12 멈춤 고침 (ECO-01 12번): 줄마다 차이가 똑같아도 멈추지 않고 「DM 셈 불가(차이 분산 0)」로 안 통과', () => {
  const s = goodState();
  for (const row of s.retro.rows) {
    row.interval.score = 40;
    row.baselines.forEach((b, k) => { b.interval = 46 + k; });
  }
  let r;
  assert.doesNotThrow(() => { r = CHECKS.T12(s); });
  assert.equal(r.pass, false);
  assert.match(r.reason, /DM 셈 불가\(차이 분산 0\)/);
  for (const id of ['무판', '단순 전이식', 'ATLAS 11']) assert.equal(r.counts.baselines[id].p, null, id);
  const viaAll = runAll(s, OPTS).find(x => x.id === 'T12');
  assert.equal(viaAll.pass, false);
  assert.doesNotMatch(viaAll.reason, /시험이 멈춤/);
});

test('T7 (ECO-01 4번): 표시로 이미 밝힌 것은 잡지 않는다 — 「확인 중」이 붙은 큰 차이 · 딱 4시간 전 관측', () => {
  const s1 = goodState();
  const v = variable(board(s1, B1), 'kospi');
  v.sources[1].value = 2700;
  v.marks = [...v.marks, '확인 중'];
  const r1 = CHECKS.T7(s1);
  assert.equal(r1.pass, true, r1.reason);
  const s2 = goodState();
  freshKospi(s2, B1, '2026-10-02T04:31:40+09:00');
  const r2 = CHECKS.T7(s2);
  assert.equal(r2.pass, true, r2.reason);
  const s3 = goodState();
  freshKospi(s3, B1, '2026-10-02T04:31:39+09:00');
  assert.match(CHECKS.T7(s3).reason, /「옛값」 없음/);
});

test('T21 (ECO-01 9번): 변수의 앞 값(previous)·종목 번호 같은 보통 입력은 앞 판으로 잡지 않는다', () => {
  const s = goodState();
  board(s, B2).engines[0].inputs.push('kospi.previous', 'stock-price:005930');
  variable(board(s, B2), 'kospi').previous = {value: 2650.1, observedAt: '2026-10-01T15:30:00+09:00'};
  const r = CHECKS.T21(s);
  assert.equal(r.pass, true, r.reason);
});

test('T13 (ECO-01 7번): 평소 30판 80% · 위기 판은 따로 — 통과 (만든 채점 줄이 제대로인지)', () => {
  const s = goodState();
  s.scores = scoreRows(30, 24, 5, 1);
  const r = CHECKS.T13(s);
  assert.equal(r.pass, true, r.reason);
  assert.equal(r.counts.normal, 30);
  assert.equal(r.counts.crisis.scored, 5);
});

test('극한 시험은 걸음마다 엔진에 입력 복사본을 준다 (자료 파일이 바뀌지 않음)', () => {
  const mutating = (inputs, seed) => {
    inputs.variables.length = 0;
    return stubEngine({variables: []}, seed);
  };
  runExtreme('K4', {}, {engine: mutating});
  assert.equal(runExtreme('K4', {}, {engine: stubEngine}).pass, true);
});
