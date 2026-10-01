#!/usr/bin/env node
/**
 * ATLAS 11 기준값 · 후향(지난 날짜로 다시 만든 판) — v1 방법(모형 A) 1거래일 전망 분위수와 방향 확률
 *
 *   node atlas4h/baselines/atlas11-v1-retro.mjs [--out atlas4h/baselines/atlas11-v1-retro.json] [--last 2026-09-30]
 *
 * 무엇: 출발일(한국거래소 거래일 종가) 2026-04-06 … 2026-09-30 마다, ATLAS 11 v1(모형 A · 경로 512 · 난수 20260917 ·
 *   출발일 20개 블록의 첫날에 다시 맞추고 블록 안에서는 계수 고정 · 학습은 출발일까지)으로 다음 거래일 종가 분포를 다시 만든다.
 * 방법: 원 실행기 scripts/atlas11/overhaul/lane-b/retro.mjs 의 runRetro 와 같은 순서로 ATLAS 11 코드를 「읽기만 하며」 부른다.
 *   1단계(같은 방법인가) 입력 input.json@30dcfb2 로 돌려 저장된 칸 reports/atlas11/overhaul/part1-retro-A-cells.json 과 견준다.
 *   2단계(늘이기) 블록 7(2026-08-28~)·블록 8(2026-09-29~)을 같은 규칙으로 잇고, 지금 입력(public/data/input.json)으로 돌린다.
 *   분위수: v1 모의 계산 simulateJointFactor36 과 같은 수식·같은 난수 순서인 발행용 모의 계산 simulateAtlas11 이
 *     같은 512 경로에서 낸 p05·p10·p25·p50·p75·p90·p95. 두 함수의 p10·p50·p90·방향 횟수(1~20일)가 한 칸이라도 다르면 쓰지 않는다.
 *   20일 모의 계산은 끝까지 돌린다(경로마다 난수 20개를 v1 과 같은 순서로 쓰기 위해). 2~20일째 날짜는 입력의 거래소 달력에서
 *     이름표로만 가져오며 실제 값은 쓰지 않는다. 내보내는 것은 1일째뿐.
 * 쓰는 곳: --out 파일 하나. ATLAS 11 코드·설정·자료는 바꾸지 않는다(모두 읽기만).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pricePanel, examplesFor} from '../../lib/factor36.mjs';
import {simulateJointFactor36} from '../../lib/factor36-simulation.mjs';
import {truncateObservedPanel} from '../../lib/rolling-backtest.mjs';
import {fitSpecModel, specDesign, normalizeSpec, carryAt} from '../../lib/atlas11/evolve/models.mjs';
import {protocolOf} from '../../lib/atlas11/evolve/backtest.mjs';
import {simulateAtlas11, SIMULATION_POLICY} from '../../lib/atlas11/simulate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..');

export const PLAN = Object.freeze({
  firstBlockOrigin: '2026-03-05', // 원 블록 1의 첫 출발일 (part1-retro-A-cells.json origins[0])
  outFirst: '2026-04-06',
  outLast: '2026-09-30',
  stored: 'reports/atlas11/overhaul/part1-retro-A-cells.json',
  oldInput: Object.freeze({commit: '30dcfb2', path: 'public/data/input.json', sha256: '4b0d7b61d8d36256f481a0db2872b3f145ced764d1afb86da9c48c4c5e554a8e'}),
  input: 'public/data/input.json',
  config: 'config/atlas11/evolution.v1.json',
});
export const QUANTILES = Object.freeze([['p05', 0.05], ['p10', 0.1], ['p25', 0.25], ['p50', 0.5], ['p75', 0.75], ['p90', 0.9], ['p95', 0.95]]);
const SCRIPTS = [
  ['atlas4h/baselines/atlas11-v1-retro.mjs', '이 실행기'],
  ['lib/factor36.mjs', '불러 씀(읽기만) · 자료판·특징·적합·분위수 식'],
  ['lib/factor36-simulation.mjs', '불러 씀(읽기만) · v1 모의 계산 simulateJointFactor36'],
  ['lib/rolling-backtest.mjs', '불러 씀(읽기만) · truncateObservedPanel'],
  ['lib/atlas11/evolve/models.mjs', '불러 씀(읽기만) · fitSpecModel·specDesign·carryAt'],
  ['lib/atlas11/evolve/backtest.mjs', '불러 씀(읽기만) · protocolOf'],
  ['lib/atlas11/network.mjs', '불러 씀(읽기만) · models.mjs 가 부름'],
  ['lib/atlas11/simulate.mjs', '불러 씀(읽기만) · 발행용 모의 계산 simulateAtlas11(p05…p95)'],
  ['config/atlas11/evolution.v1.json', '설정(읽기만) · operating.spec(A)·validation(경로·난수·블록)'],
  ['scripts/atlas11/overhaul/lane-b/retro.mjs', '원 방법(대조용 · 실행 안 함) · runRetro'],
  ['scripts/atlas11/overhaul/lane-b/run-retro.mjs', '원 방법(대조용 · 실행 안 함) · 저장된 칸을 만든 실행기'],
];

const finite = x => typeof x === 'number' && Number.isFinite(x);
export const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const git = args => execFileSync('git', args, {cwd: ROOT, maxBuffer: 512 << 20});
export function kstIso(ms = Date.now()) { return new Date(ms + 9 * 3600e3).toISOString().slice(0, 19) + '+09:00'; }

/** 출발일 계획: firstBlockOrigin 부터 출발일 20개씩 블록. 목표일 이름표는 입력의 거래소 달력(calendar.sessions)에서 */
export function planOrigins(panel, sessions, {first = PLAN.firstBlockOrigin, last = PLAN.outLast, blockDays, horizon}) {
  const s0 = panel.dates.indexOf(first);
  if (s0 < 0) throw Error('PLAN_FIRST_ORIGIN_MISSING ' + first);
  if (sessions.some((d, j) => j && d <= sessions[j - 1])) throw Error('PLAN_CALENDAR_ORDER');
  const out = [];
  for (let j = s0; j < panel.dates.length && panel.dates[j] <= last; j++) {
    const k = j - s0, date = panel.dates[j];
    const targets = sessions.filter(d => d > date).slice(0, horizon);
    if (targets.length !== horizon) throw Error('PLAN_CALENDAR_SHORT ' + date);
    const inPanel = panel.dates.slice(j + 1, j + 1 + horizon);
    if (inPanel.some((d, h) => d !== targets[h])) throw Error('PLAN_CALENDAR_MISMATCH ' + date);
    out.push({k, date, panelIndex: j, block: Math.floor(k / blockDays) + 1, blockStart: k % blockDays === 0, targets, targetsInPanel: inPanel.length, prevDate: panel.dates[j - 1]});
  }
  return out;
}

/**
 * runRetro(scripts/atlas11/overhaul/lane-b/retro.mjs) 와 같은 줄 순서:
 *   블록 첫날 적합(fitSpecModel · 학습 행 r.date <= 블록 첫날) → 미래 학습 검사 → 관측 자료를 출발일에서 자름 → carry(A 는 없음) → 모의 계산.
 * 다른 점: ① 목표일 실제값을 요구하지 않는다(늦은 출발일) ② 같은 입력으로 simulateAtlas11 도 돌려 p05…p95 를 얻고 두 함수가 같은 경로인지 본다.
 */
export function runBaseline(input, {spec, protocol, origins, simulateFrom = null, onProgress = () => {}}) {
  const s = normalizeSpec(spec), P = protocol.paths, H = protocol.horizon;
  const panel = pricePanel(input);
  const assets = input.assets, base = assets.map((a, i) => examplesFor(panel, i));
  const designs = assets.map((a, i) => specDesign(s, panel, i, assets, base[i]));
  const prices = assets.map(a => new Map(a.prices.map(r => [r.date, r.quality === 'conflict' ? null : r.close])));
  const blocks = [], days = [], samePath = {origins: 0, cells: 0, mismatches: []};
  let models = null, blockInfo = null;
  const cnt = p => [Math.round(p.up * P), Math.round(p.flat * P), Math.round(p.down * P)];
  const t0 = Date.now(), todo = origins.filter(o => !simulateFrom || o.date >= simulateFrom).length;
  for (let n = 0; n < origins.length; n++) {
    const o = origins[n];
    if (o.blockStart) {
      const blockLast = origins.filter(x => x.block === o.block).at(-1).date;
      if (simulateFrom && blockLast < simulateFrom) { models = null; blockInfo = null; continue; }
      models = designs.map(d => fitSpecModel(d.rows.filter(r => r.date <= o.date), s, {featureFactors: d.featureFactors}));
      const bad = models.map((m, i) => m.status !== 'research_estimate' ? assets[i].code : null).filter(Boolean);
      if (bad.length) throw Error('EVOLVE_INSUFFICIENT_HISTORY block ' + o.block + ' ' + bad.join(','));
      const zero = models.map(m => m.selected?.lambda === 'zero');
      if (models.some((m, i) => zero[i] !== (m.regression.intercept === 0 && m.regression.beta.every(b => b === 0)))) throw Error('ZERO_FLAG_MISMATCH');
      blockInfo = {block: o.block, originFirst: o.date, originLast: blockLast, maximumTrainingDate: models.map(m => m.trainedThrough).sort().at(-1), selectedKinds: models.reduce((acc, m) => { acc[m.selected.id] = (acc[m.selected.id] ?? 0) + 1; return acc; }, {}), zeroWeightStocks: zero.filter(Boolean).length, zero, fingerprint: sha256(JSON.stringify(models.map(m => [m.trainedThrough, m.selected.id, m.regression, m.volatility, m.shockDates.at(-1), m.shocks.length])))};
      blocks.push(blockInfo);
    }
    if (simulateFrom && o.date < simulateFrom) continue;
    if (!models) throw Error('PLAN_NO_MODELS ' + o.date);
    if (models.some(m => m.trainedThrough > o.date || m.shockDates.some(d => d > o.date))) throw Error('AB_FUTURE_TRAINING ' + o.date);
    const observed = truncateObservedPanel(panel, o.panelIndex);
    if (observed.dates.at(-1) !== o.date) throw Error('OBSERVED_END ' + o.date);
    const external = designs.map((d, i) => ({selected: d.selected.map(x => ({...x, current: {...x.current, value: carryAt(x.kind, panel, i, assets, o.panelIndex), date: o.date}}))}));
    if (external.some(e => e.selected.some(x => !finite(x.current.value)))) throw Error('EVOLVE_CARRY_MISSING ' + o.date);
    const opt = {paths: P, seed: protocol.seed, external};
    const v1 = simulateJointFactor36(models, observed, assets, o.targets, opt);
    const pub = simulateAtlas11(models, observed, assets, o.targets, opt);
    const maxTrain = models.map(m => m.trainedThrough).sort().at(-1), maxShock = models.map(m => m.shockDates.at(-1)).sort().at(-1);
    const maxData = [observed.dates.at(-1), maxTrain, maxShock, o.date].sort().at(-1);
    const leak = {origin: o.date, maxTrainingEnd: maxTrain, maxDataDate: maxData, noFuture: maxTrain <= o.date && maxShock <= o.date && maxData <= o.date && o.targets[0] > o.date, maxShockDate: maxShock, observedPanelEnd: observed.dates.at(-1), fitAt: blockInfo.originFirst, block: o.block, target: o.targets[0]};
    const cells = [];
    for (let i = 0; i < assets.length; i++) {
      const code = assets[i].code, anchor = prices[i].get(o.date), anchorSim = assets[i].prices.find(p => p.date === o.date)?.close;
      if (!finite(anchor) || anchor <= 0 || anchorSim !== anchor) throw Error('AB_MISSING_ANCHOR ' + code + ' ' + o.date);
      // 같은 512 경로인가: 두 모의 계산의 p10·p50·p90·방향 횟수를 1~20일 모두 견준다
      for (let h = 0; h < H; h++) {
        const a = v1.rows[i][h], b = pub.rows[i][h];
        const same = a.p10 === b.p10 && a.p50 === b.p50 && a.p90 === b.p90 && ['up', 'flat', 'down'].every(c => a.wave.daily.probabilities[c] === b.wave.daily.probabilities[c] && a.wave.horizon.probabilities[c] === b.wave.horizon.probabilities[c]);
        if (!same && samePath.mismatches.length < 20) samePath.mismatches.push({origin: o.date, code, h: h + 1});
        if (!same) samePath.bad = (samePath.bad ?? 0) + 1;
      }
      samePath.cells++;
      const r1 = v1.rows[i][0], q1 = pub.rows[i][0], r20 = v1.rows[i][H - 1];
      const prob = r1.wave.daily.probabilities;
      cells.push({
        row: {origin: o.date, target: o.targets[0], code, anchor, ...Object.fromEntries(QUANTILES.map(([k]) => [k, q1[k]])), up: prob.up, flat: prob.flat, down: prob.down, block: o.block},
        // 저장된 칸(columns)과 같은 꼴 — 1단계 대조용
        stored: [o.k, i, ...cnt(prob), r1.wave.daily.selected, r1.p50, prices[i].get(o.targets[0]) ?? null, ...cnt(r20.wave.horizon.probabilities), r20.wave.horizon.selected, r20.p50, prices[i].get(o.targets[H - 1]) ?? null, anchor, prices[i].get(o.prevDate), blockInfo.zero[i] ? 1 : 0],
        actual1: prices[i].get(o.targets[0]) ?? null,
      });
    }
    samePath.origins++;
    days.push({origin: o.date, k: o.k, block: o.block, target1: o.targets[0], target20: o.targets[H - 1], prevDate: o.prevDate, leak, cells});
    onProgress(days.length, todo, o.date, Date.now() - t0);
  }
  samePath.bad = samePath.bad ?? 0;
  return {blocks, days, samePath, panelEnd: panel.dates.at(-1)};
}

const STORED_COLS = ['k', 'i', 'up1', 'flat1', 'down1', 'sel1', 'p50_1', 'actual1', 'up20', 'flat20', 'down20', 'sel20', 'p50_20', 'actual20', 'anchor', 'prevClose', 'zero'];

/** 1단계: 저장된 칸과 한 자리도 같은가 (네 칸은 최대 절대 차이 · 나머지 칸·출발일·블록·누수 기록은 다른 개수) */
export function compareStored(run, stored) {
  if (JSON.stringify(stored.columns) !== JSON.stringify(STORED_COLS)) throw Error('STORED_COLUMNS ' + stored.columns.join(','));
  const byKey = new Map(stored.cells.map(c => [`${c[0]}|${c[1]}`, c]));
  const maxAbsDiff = {p50_1: 0, up1: 0, flat1: 0, down1: 0}, other = {};
  let origins = 0, cells = 0, missing = 0, extraMismatch = 0;
  const firstDiffs = [];
  for (const d of run.days) {
    if (d.k >= stored.origins.length) continue;
    const so = stored.origins[d.k];
    origins++;
    for (const [key, mine] of [['date', d.origin], ['block', d.block], ['target1', d.target1], ['target20', d.target20], ['prevDate', d.prevDate]]) if (so[key] !== mine) { extraMismatch++; if (firstDiffs.length < 10) firstDiffs.push({origin: d.origin, field: 'origins.' + key, mine, stored: so[key]}); }
    for (const c of d.cells) {
      const s = byKey.get(`${c.stored[0]}|${c.stored[1]}`);
      if (!s) { missing++; continue; }
      cells++;
      STORED_COLS.forEach((col, j) => {
        const a = c.stored[j], b = s[j];
        if (col in maxAbsDiff) { const diff = finite(a) && finite(b) ? Math.abs(a - b) : Infinity; if (diff > maxAbsDiff[col]) maxAbsDiff[col] = diff; if (diff !== 0 && firstDiffs.length < 10) firstDiffs.push({origin: d.origin, i: c.stored[1], field: col, mine: a, stored: b}); }
        else if (a !== b) { other[col] = (other[col] ?? 0) + 1; if (firstDiffs.length < 10) firstDiffs.push({origin: d.origin, i: c.stored[1], field: col, mine: a, stored: b}); }
      });
    }
  }
  // 블록(첫날·최대 학습일·고른 모형 개수·무게 0 종목 수)과 누수 기록
  const blockDiffs = [];
  for (const b of run.blocks) {
    const sb = stored.blocks.find(x => x.block === b.block);
    if (!sb) continue;
    for (const key of ['originFirst', 'maximumTrainingDate', 'zeroWeightStocks']) if (sb[key] !== b[key]) blockDiffs.push({block: b.block, key, mine: b[key], stored: sb[key]});
    const ka = JSON.stringify(Object.entries(b.selectedKinds).sort()), kb = JSON.stringify(Object.entries(sb.selectedKinds).sort());
    if (ka !== kb) blockDiffs.push({block: b.block, key: 'selectedKinds'});
  }
  const leakDiffs = [];
  for (const d of run.days) {
    const sl = stored.leak.find(x => x.origin === d.origin);
    if (!sl) continue;
    if (sl.maxTrainingEnd !== d.leak.maxTrainingEnd || sl.maxShockDate !== d.leak.maxShockDate || sl.noFuture !== d.leak.noFuture) leakDiffs.push(d.origin);
  }
  const allZero = Object.values(maxAbsDiff).every(x => x === 0);
  const identical = allZero && missing === 0 && extraMismatch === 0 && Object.keys(other).length === 0 && blockDiffs.length === 0 && leakDiffs.length === 0 && cells === origins * 52;
  return {origins, cells, identical, maxAbsDiff, otherColumnsDiffer: other, missingCells: missing, originFieldDiffs: extraMismatch, blockDiffs, leakDiffs: leakDiffs.length, firstDiffs, columnsCompared: STORED_COLS.slice(2)};
}

/** 지금 입력(HEAD) 결과와 30dcfb2 입력 결과가 같은 출발일에서 다른가 */
export function compareRuns(head, old) {
  const byOrigin = new Map(old.days.map(d => [d.origin, d]));
  const keys = ['anchor', ...QUANTILES.map(([k]) => k), 'up', 'flat', 'down'];
  let origins = 0, cellsDiffer = 0, maxRel = 0;
  const differ = [];
  for (const d of head.days) {
    const o = byOrigin.get(d.origin);
    if (!o) continue;
    origins++;
    let n = 0;
    d.cells.forEach((c, i) => {
      const oc = o.cells[i];
      if (oc.row.code !== c.row.code) throw Error('CODE_ORDER');
      const diff = keys.some(k => oc.row[k] !== c.row[k]);
      if (diff) { n++; for (const k of QUANTILES.map(([q]) => q)) maxRel = Math.max(maxRel, Math.abs(c.row[k] - oc.row[k]) / oc.row.anchor); }
    });
    if (n) { differ.push({origin: d.origin, cells: n}); cellsDiffer += n; }
  }
  const sameBlocks = head.blocks.filter(b => old.blocks.some(x => x.block === b.block)).map(b => ({block: b.block, sameFit: old.blocks.find(x => x.block === b.block).fingerprint === b.fingerprint}));
  return {origins, differ: differ.length, cellsDiffer, differingOrigins: differ, maxAbsDiffShareOfAnchor: maxRel, blocks: sameBlocks};
}

/** 두 입력의 종가 차이(출발일 last 이하 날짜) */
export function priceDiffs(a, b, last) {
  const out = [];
  a.assets.forEach((x, i) => {
    const y = b.assets[i];
    if (x.code !== y.code) throw Error('ASSET_ORDER');
    const mx = new Map(x.prices.map(p => [p.date, p.quality === 'conflict' ? null : p.close])), my = new Map(y.prices.map(p => [p.date, p.quality === 'conflict' ? null : p.close]));
    for (const d of new Set([...mx.keys(), ...my.keys()])) if (d <= last && mx.get(d) !== my.get(d)) out.push({code: x.code, date: d, old: mx.get(d) ?? null, head: my.get(d) ?? null});
  });
  return out.sort((p, q) => p.date.localeCompare(q.date) || p.code.localeCompare(q.code));
}

function serialize(doc) {
  const {leak, rows, ...head} = doc;
  const top = JSON.stringify(head, null, 1).replace(/\n}$/, '');
  const arr = (name, xs) => xs.length ? `"${name}": [\n${xs.map(x => '  ' + JSON.stringify(x)).join(',\n')}\n ]` : `"${name}": []`;
  return `${top},\n ${arr('leak', leak)},\n ${arr('rows', rows)}\n}\n`;
}

function describe(days) {
  let w = 0, n = 0, inside = 0, scored = 0;
  for (const d of days) for (const c of d.cells) {
    w += (c.row.p90 - c.row.p10) / c.row.anchor; n++;
    if (finite(c.actual1)) { scored++; if (c.actual1 >= c.row.p10 && c.actual1 <= c.row.p90) inside++; }
  }
  return {rows: n, meanWidthP10P90PctOfAnchor: n ? w / n * 100 : null, targetsWithActual: scored, insideP10P90: inside, insideShare: scored ? inside / scored : null};
}

async function main() {
  const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
  const outRel = arg('--out') ?? 'atlas4h/baselines/atlas11-v1-retro.json';
  const outLast = arg('--last') ?? PLAN.outLast;
  const log = x => console.error(JSON.stringify(x));
  const doc = {schema: 'atlas4h-atlas11-retro-1', label: '후향', status: '없음', reason: null, createdAt: null, method: null, input: null, reproduction: null, headVsOld: null, leak: [], rows: []};
  const write = () => { doc.createdAt = kstIso(); const p = path.resolve(ROOT, outRel); fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, serialize(doc)); return p; };
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, PLAN.config), 'utf8'));
    const protocol = protocolOf(config), spec = config.operating.spec;
    const stored = JSON.parse(fs.readFileSync(path.join(ROOT, PLAN.stored), 'utf8'));
    const protocolSame = JSON.stringify(protocol) === JSON.stringify(stored.protocol);
    const headShort = git(['rev-parse', '--short=7', 'HEAD']).toString().trim();
    const headBytes = fs.readFileSync(path.join(ROOT, PLAN.input)), headSha = sha256(headBytes);
    const committedSha = sha256(git(['show', `HEAD:${PLAN.input}`]));
    const lastChanged = git(['log', '-1', '--format=%h', '--', PLAN.input]).toString().trim();
    const oldBytes = git(['show', `${PLAN.oldInput.commit}:${PLAN.oldInput.path}`]), oldSha = sha256(oldBytes);
    doc.method = {model: 'A', paths: protocol.paths, seed: protocol.seed, horizon: protocol.horizon, blockDays: protocol.blockDays,
      blocks: `출발일 20개씩 한 블록 · 블록 1 첫날 ${PLAN.firstBlockOrigin}(원 후향 판과 같음) · 블록 첫날에 다시 맞춤(학습 행 ≤ 그날 · v1 정책상 ${protocol.trainingBefore} 전 행만) · 블록 안 계수 고정 · 원 블록 1~6 에 블록 7·8 을 같은 규칙으로 이어 붙임`,
      protocol, protocolSameAsStored: protocolSame,
      quantiles: 'simulateAtlas11(발행용 · lib/atlas11/simulate.mjs)이 같은 512 경로에서 낸 1일째 종가 분위수 quantile(정렬값, p) — 선형 보간',
      direction: `1일째 경로별 로그수익 r 로 expm1(r) > ${SIMULATION_POLICY.delta} 이면 상승, < −${SIMULATION_POLICY.delta} 이면 하락, 그 밖은 보합 · 확률 = 횟수 ÷ ${protocol.paths} (저장된 칸 up1·flat1·down1 과 같은 정의)`,
      crps: '없음 — 판정 기준이 분위수 19개를 요구하나 ATLAS 11 발행본 꼴은 7개',
      targetLabels: '2~20일째 목표 날짜는 입력 calendar.sessions(거래소 달력)에서 이름표로만 씀 · 실제 값은 쓰지 않음',
      scripts: SCRIPTS.map(([p, role]) => ({path: p, sha256: sha256(fs.readFileSync(path.join(ROOT, p))), role}))};
    doc.input = {path: PLAN.input, commit: headShort, sha256: headSha, committedSha256: committedSha, workingTreeSameAsCommit: committedSha === headSha, lastChangedIn: lastChanged};
    if (!protocolSame) throw Error('PROTOCOL_DIFFERS_FROM_STORED — 설정 config/atlas11/evolution.v1.json 의 validation 이 저장된 칸의 protocol 과 다름');
    if (oldSha !== PLAN.oldInput.sha256 || stored.input?.sha256 !== oldSha) throw Error('OLD_INPUT_SHA ' + oldSha);
    // 저장된 칸은 --strict·--copy 칸이 생기기 전 실행기로 만들어져 그 두 칸이 없다(없으면 기본값 false)
    if (stored.model !== 'A' || stored.center !== 'mean' || (stored.strictTrainingBeforeOrigin ?? false) !== false || (stored.simulationCopy ?? false) !== false) throw Error('STORED_NOT_PLAIN_A');

    const headInput = JSON.parse(headBytes), oldInput = JSON.parse(oldBytes);
    const planFor = (input, last) => planOrigins(pricePanel(input), input.calendar.sessions, {first: PLAN.firstBlockOrigin, last, blockDays: protocol.blockDays, horizon: protocol.horizon});

    // 1단계 — 30dcfb2 입력: 저장된 120 출발일(블록 1~6) + 그 입력이 허락하는 블록 7(…2026-09-28)
    const oldPlan = planFor(oldInput, outLast);
    log({step: 'old-input', origins: oldPlan.length, first: oldPlan[0].date, last: oldPlan.at(-1).date, at: kstIso()});
    const old = runBaseline(oldInput, {spec, protocol, origins: oldPlan, onProgress: (k, n, d, ms) => { if (k % 20 === 0 || k === n) log({run: '30dcfb2', done: k, of: n, origin: d, sec: Math.round(ms / 1000)}); }});
    const rep = compareStored(old, stored);
    doc.reproduction = {against: PLAN.stored, input: PLAN.oldInput.commit, origins: rep.origins, identical: rep.identical, maxAbsDiff: rep.maxAbsDiff,
      overlapWithOutput: old.days.filter(d => d.k < stored.origins.length && d.origin >= PLAN.outFirst).length,
      cells: rep.cells, columnsCompared: rep.columnsCompared, otherColumnsDiffer: rep.otherColumnsDiffer, missingCells: rep.missingCells, originFieldDiffs: rep.originFieldDiffs, blockDiffs: rep.blockDiffs, leakDiffs: rep.leakDiffs, firstDiffs: rep.firstDiffs,
      samePathsV1VsPublication: {origins: old.samePath.origins, cells: old.samePath.cells, mismatchedHorizonCells: old.samePath.bad, first: old.samePath.mismatches}};
    log({step: 'reproduction', identical: rep.identical, maxAbsDiff: rep.maxAbsDiff, other: rep.otherColumnsDiffer, at: kstIso()});

    // 2단계 — 지금 입력(HEAD): 출발일 outFirst…outLast (블록 2 첫날 2026-04-02 부터 맞춤)
    const headPlan = planFor(headInput, outLast);
    log({step: 'head-input', origins: headPlan.filter(o => o.date >= PLAN.outFirst).length, first: PLAN.outFirst, last: headPlan.at(-1).date, at: kstIso()});
    const head = runBaseline(headInput, {spec, protocol, origins: headPlan, simulateFrom: PLAN.outFirst, onProgress: (k, n, d, ms) => { if (k % 20 === 0 || k === n) log({run: 'HEAD', done: k, of: n, origin: d, sec: Math.round(ms / 1000)}); }});

    const cmp = compareRuns(head, old);
    const lastShared = [...head.days].reverse().find(d => old.days.some(x => x.origin === d.origin))?.origin;
    const pd = priceDiffs(oldInput, headInput, lastShared ?? '0000-00-00');
    const pdDates = [...new Set(pd.map(x => x.date))], pdCodes = [...new Set(pd.map(x => x.code))];
    const firstAffected = pdDates[0] ?? null;
    const diffOrigins = cmp.differingOrigins.map(x => x.origin);
    const explained = diffOrigins.every(o => firstAffected && o >= firstAffected) && head.days.filter(d => old.days.some(x => x.origin === d.origin) && firstAffected && d.origin >= firstAffected).every(d => diffOrigins.includes(d.origin));
    doc.headVsOld = {origins: cmp.origins, differ: cmp.differ,
      why: cmp.differ === 0 ? `같은 출발일 ${cmp.origins}개 모두 한 자리도 같다 · 두 입력의 종가 차이 ${pd.length}개는 출발일 ${lastShared} 뒤이거나 없다`
        : `두 입력(30dcfb2 · ${headShort})의 종가 차이는 ${pd.length}개(${pdCodes.length}종목 · ${pdDates.join('·')})뿐이다 — reports/atlas11/overhaul/data-correction-01.md 의 정정(다른 제공처 값 → 한국거래소 15:30 종가 단일가). `
          + `출발일이 ${firstAffected} 이후인 판 ${cmp.differ}개(${diffOrigins[0]}~${diffOrigins.at(-1)} · 칸 ${cmp.cellsDiffer}개)만 관측 자료에 고친 종가가 들어가 달라진다 · `
          + `블록 계수는 ${cmp.blocks.every(b => b.sameFit) ? '두 입력에서 모두 같다(블록 7 적합일 2026-08-28 이 정정 날짜보다 앞)' : '일부 다르다'} · 그 앞 출발일 ${cmp.origins - cmp.differ}개는 한 자리도 같다 · 출력 rows 는 지금 입력(HEAD) 값`
          + (explained ? '' : ' · ※ 차이 난 출발일이 정정 날짜로 다 설명되지 않음'),
      cellsDiffer: cmp.cellsDiffer, differingOrigins: cmp.differingOrigins, maxAbsDiffShareOfAnchor: cmp.maxAbsDiffShareOfAnchor, blocks: cmp.blocks, priceDiffs: pd, explainedByPriceDiffs: explained};

    doc.method.blockStarts = head.blocks.map(b => ({block: b.block, fitAt: b.originFirst, originLast: b.originLast, maximumTrainingDate: b.maximumTrainingDate, selectedKinds: b.selectedKinds, zeroWeightStocks: b.zeroWeightStocks}));
    doc.method.samePathsV1VsPublication = {origins: head.samePath.origins, cells: head.samePath.cells, mismatchedHorizonCells: head.samePath.bad, first: head.samePath.mismatches};
    doc.leak = head.days.map(d => d.leak);

    const problems = [];
    if (!rep.identical) problems.push(`저장된 칸과 같지 않음(최대 차이 ${JSON.stringify(rep.maxAbsDiff)} · 다른 칸 ${JSON.stringify(rep.otherColumnsDiffer)} · 블록 차이 ${rep.blockDiffs.length} · 누수 기록 차이 ${rep.leakDiffs})`);
    if (old.samePath.bad || head.samePath.bad) problems.push(`v1 모의 계산과 발행용 모의 계산의 경로가 다름(30dcfb2 ${old.samePath.bad}칸 · HEAD ${head.samePath.bad}칸)`);
    if (doc.leak.some(l => !l.noFuture)) problems.push('출발일 뒤 자료를 쓴 판이 있음');
    const outDays = head.days.filter(d => d.origin >= PLAN.outFirst && d.origin <= outLast);
    if (outLast === PLAN.outLast && outDays.length !== 120) problems.push(`출발일 수가 120 이 아님(${outDays.length})`);
    if (problems.length) { doc.status = '없음'; doc.reason = problems.join(' · '); doc.rows = []; }
    else { doc.status = '있음'; doc.reason = null; doc.rows = outDays.flatMap(d => d.cells.map(c => c.row)); }
    const p = write();
    const desc = describe(outDays);
    console.log(JSON.stringify({out: path.relative(ROOT, p), status: doc.status, reason: doc.reason, rows: doc.rows.length, reproduction: {identical: rep.identical, origins: rep.origins, maxAbsDiff: rep.maxAbsDiff}, headVsOld: {origins: cmp.origins, differ: cmp.differ, cellsDiffer: cmp.cellsDiffer}, describe: desc, leakAllNoFuture: doc.leak.every(l => l.noFuture), maxTrainingEndMax: doc.leak.map(l => l.maxTrainingEnd).sort().at(-1)}));
  } catch (e) {
    doc.status = '없음';
    doc.reason = `실행 중 멈춤: ${e.message}`;
    doc.rows = [];
    write();
    console.error(e);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
