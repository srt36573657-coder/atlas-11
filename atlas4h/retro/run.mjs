#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 0판 · 재현(지난 기록으로 다시 돌리기) — 16시 판(종가 → 다음 종가)
 *
 *   node atlas4h/retro/run.mjs [--end 2026-09-30] [--days 120] [--input FILE] [--out DIR]
 *
 * 출발일마다 그날 종가까지의 자료만으로 판을 짓고(누수 없음 · HAR 맞춤은 1거래일 엠바고),
 * 다음 거래일 종가로 채점한다. 판정 규칙은 봉인된 judgment.json·judgment-2.json 그대로:
 *   같은 시각(16시) 판끼리만 · 실력 = 1 − (내 평균 ÷ 기준 평균) · DM 한쪽 p < 0.05 를 lag 0 과 5 둘 다
 *   · 같은 시각 판 30개 미만이면 「아직 모름」 · 실력 ≤ 0 이면 「앞 판으로」
 * 쓰는 것: atlas4h/retro/result.json (atlas4h-retro-1 · 사양 T12 가 읽음) · atlas4h/retro/summary.md
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dmTest, kupiecLR, mean} from '../spec/stats.mjs';
import {CHECKS} from '../spec/checks.mjs';
import {buildInputs, buildBoard, nextSession, isoKst} from '../engine/board.mjs';
import {gitState} from '../engine/run.mjs';
import {scoreBoard, loadAtlas11, WHY_TRANSFER} from '../score/score.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const RETRO_CELLS = 'reports/atlas11/overhaul/part1-retro-A-cells.json';
const SLOT = '16';

const r4 = x => (Number.isFinite(x) ? Math.round(x * 1e4) / 1e4 : null);
const r6 = x => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);
const sig = x => (Number.isFinite(x) ? Number(x.toPrecision(4)) : null); // p 값은 유효숫자 넷 (아주 작은 p 를 0 으로 뭉개지 않게)

/** ATLAS 11 후향 판에 1거래일 80% 범위가 있는가 — 칸 이름을 풀어 본다 */
export function atlas11RetroBand(root = ROOT) {
  let cells;
  try {
    cells = JSON.parse(fs.readFileSync(path.join(root, RETRO_CELLS), 'utf8'));
  } catch {
    return {has: false, why: `${RETRO_CELLS} 를 못 읽음`};
  }
  const cols = cells.columns ?? [];
  const band = cols.filter(c => /^(p10|p90|lo|hi|lower|upper)_?1$/.test(c));
  const first = cells.origins?.[0]?.date ?? null;
  const last = cells.origins?.at(-1)?.date ?? null;
  if (band.length >= 2) return {has: true, columns: cols, first, last};
  return {
    has: false, columns: cols, first, last,
    why: `ATLAS 11 후향 판(${RETRO_CELLS}, schema ${cells.schema})의 칸은 ${cols.join('·')} — 1거래일 p50(p50_1)은 있으나 80% 범위(p10·p90)가 없음 · 출발일도 ${first}~${last} 뿐`,
  };
}

/** 이 결과를 낸 코드 파일의 sha256 (커밋 전 실행이어도 내용으로 맞대어 볼 수 있게) */
function codeFiles() {
  const files = ['atlas4h/engine/har.mjs', 'atlas4h/engine/dist.mjs', 'atlas4h/engine/board.mjs', 'atlas4h/engine/run.mjs', 'atlas4h/score/score.mjs', 'atlas4h/retro/run.mjs'];
  return Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex')]));
}

/** 같은 시각 판(하루 하나)별 평균 벌점 */
function perBoard(rows, pick) {
  const by = new Map();
  for (const r of rows) {
    if (!by.has(r.boardId)) by.set(r.boardId, {target: r.target, xs: []});
    by.get(r.boardId).xs.push(pick(r));
  }
  return [...by.values()].sort((a, b) => a.target.localeCompare(b.target)).map(x => mean(x.xs));
}

function verdictOf(skill, pLag0, pLag5, boards) {
  if (boards < 30) return '아직 모름';
  if (!(skill > 0)) return '앞 판으로';
  if (pLag0 !== null && pLag5 !== null && pLag0 < 0.05 && pLag5 < 0.05) return '실력';
  return '아직 모름';
}

/** 한 기준과 견주기 — 같은 판 묶음 · 평균의 비율 · DM lag 0·5 (판 단위 평균 벌점) */
export function compare(rows, baseId, scale = 'raw') {
  const pick = (r, who) => {
    const s = who === 'engine' ? r.interval.score : r.baselines.find(b => b.id === baseId)?.interval;
    return scale === 'pct' ? (s / r.anchor) * 100 : s;
  };
  const usable = rows.filter(r => Number.isFinite(pick(r, 'base')));
  if (!usable.length) return {id: baseId, none: true};
  const e = usable.map(r => pick(r, 'engine'));
  const b = usable.map(r => pick(r, 'base'));
  const meanE = mean(e);
  const meanB = mean(b);
  const skill = 1 - meanE / meanB;
  const dayE = perBoard(usable, r => pick(r, 'engine'));
  const dayB = perBoard(usable, r => pick(r, 'base'));
  const dm0 = dmTest(dayB, dayE, {lag: 0});
  const dm5 = dmTest(dayB, dayE, {lag: 5});
  return {
    id: baseId, scale, rows: usable.length, boards: dayE.length,
    meanEngine: r6(meanE), meanBaseline: r6(meanB), skill: r6(skill),
    dm: {lag0: {stat: r4(dm0.stat), p: sig(dm0.p)}, lag5: {stat: r4(dm5.stat), p: sig(dm5.p)}},
    verdict: verdictOf(skill, dm0.p, dm5.p, dayE.length),
  };
}

export function run({end = '2026-09-30', days = 120, inputFile = path.join(ROOT, 'public/data/input.json'), outDir = HERE, now = isoKst(Date.now()), write = true} = {}) {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const sessions = input.calendar.sessions;
  const origins = sessions.filter(s => s <= end).slice(-days);
  const pubs = loadAtlas11(path.join(ROOT, 'public/data/atlas11/forecast.json'));
  const retroBand = atlas11RetroBand();
  const git = gitState();
  const rows = [];
  const boards = [];
  for (const origin of origins) {
    const at = `${origin}T${SLOT}:00:00+09:00`; // 재현 판의 봉인 시각(흉내) — 그날 종가(15:30) 뒤 16시 판
    const target = nextSession(sessions, origin);
    const inputs = buildInputs(input, {asof: origin, at});
    const seed = Number(origin.replaceAll('-', '')) * 100 + Number(SLOT);
    const board = buildBoard({inputs, seed, slot: SLOT, kind: '무거운', createdAt: at, sealedAt: at, target,
      commit: git.commit, dirty: git.dirty, files: ['public/data/input.json'], retro: true, slotDate: origin});
    const {lines} = scoreBoard(board, input, {pubs, scoredAt: now});
    boards.push({id: board.id, origin, target, stocks: board.stocks.filter(s => s.center !== null).length, scored: lines.length});
    for (const l of lines) {
      const a11 = l.baselines.find(b => b.id === 'ATLAS 11');
      if (a11.note === '없음' && !retroBand.has) a11.why = `후향 v1 판에 80% 범위 없음 · 실시간 발행본: ${a11.why}`;
      rows.push({
        boardId: l.boardId, code: l.code, origin, target: l.target, scoredAt: l.scoredAt, anchor: l.anchor,
        actual: {value: l.actual.value, asOf: l.actual.asOf},
        crps: l.crps, interval: l.interval, brier: {o: l.brier.o, score: l.brier.score},
        baselines: l.baselines.map(b => (b.note === '없음'
          ? {id: b.id, interval: null, note: '없음'}
          : {id: b.id, crps: b.crps ?? null, interval: b.interval, covered: b.covered, brier: b.brier ?? null, ...(b.forecastId ? {forecastId: b.forecastId} : {})})),
      });
    }
  }
  // 요약 셈
  const n = rows.length;
  const hit = rows.filter(r => r.interval.covered).length;
  const kup = kupiecLR(n - hit, n, 0.2);
  const ncRows = rows.filter(r => Number.isFinite(r.baselines[0].interval));
  const ncHit = ncRows.filter(r => r.baselines[0].covered).length;
  const ncKup = kupiecLR(ncRows.length - ncHit, ncRows.length, 0.2);
  const a11Rows = rows.filter(r => Number.isFinite(r.baselines[2].interval));
  const summary = {
    slot: SLOT,
    origins: {first: origins[0], last: origins.at(-1), count: origins.length},
    rows: n,
    boards: boards.length,
    coverage80: {engine: {covered: hit, of: n, share: r6(hit / n), kupiecP: sig(kup.p)}, 무판: {covered: ncHit, of: ncRows.length, share: r6(ncHit / ncRows.length), kupiecP: sig(ncKup.p)}},
    crps: {engine: r6(mean(rows.map(r => r.crps))), 무판: r6(mean(ncRows.map(r => r.baselines[0].crps)))},
    brier: {engine: r6(mean(rows.map(r => r.brier.score))), 무판: r6(mean(ncRows.map(r => r.baselines[0].brier)))},
    vs: {
      무판: {raw: compare(rows, '무판', 'raw'), pct: compare(rows, '무판', 'pct')},
      '단순 전이식': {none: true, why: WHY_TRANSFER},
      'ATLAS 11': a11Rows.length ? {raw: compare(rows, 'ATLAS 11', 'raw'), pct: compare(rows, 'ATLAS 11', 'pct'), rows: a11Rows.length}
        : {none: true, why: retroBand.has ? '봉인 전 발행본 없음' : retroBand.why,
          live: `실시간 발행본은 forecast.json 의 둘뿐 — ${pubs.map(p => `${p.actualAsOf} 종가 기준·${isoKst(Date.parse(p.issuedAt)).slice(5, 16).replace('T', ' ')} KST 발행·1거래일 목표 ${nextSession(sessions, p.actualAsOf)}`).join(' / ')} — 재현 판(출발일 16:00 봉인)보다 늦게 나왔거나 목표일이 재현 밖 · 장부 reports/atlas11/ledger/forecast 에는 분위수가 없음`},
    },
    crisis: '없음 — 위기 구간(코스피 하루 변화 상위 10%)은 코스피 자료가 없어 못 잼',
  };
  const result = {
    schema: 'atlas4h-retro-1',
    createdAt: now,
    engine: 'atlas4h-engine-0 (가운데 = 무판 · 폭 = HAR 밑값 3층 · 걸러낸 지난 기록 · 좌우 따로)',
    code: {...git, filesNote: '코드 판은 실행 때의 HEAD — 아래 파일 지문이 이 결과를 낸 코드 그대로', files: codeFiles()},
    data: {file: 'public/data/input.json', note: 'NAVER 한 출처 · 기업행위 조정 미확인 (input.json priceSource·priceBasisReview)'},
    judgment: ['atlas4h/seal/judgment.json', 'atlas4h/seal/judgment-2.json'],
    leakage: '출발일 종가까지의 자료만 · HAR 맞춤 줄은 1거래일 엠바고 · 1일 앞 목표라 겹치는 관측(정화 대상) 없음',
    slot12: '12시 판은 재현하지 않음 (judgment-2 · 이 재현은 16시 판만)',
    summary,
    boards,
    rows,
  };
  // 잠긴 사양 T12 가 이 결과를 어떻게 읽는가 (읽기만)
  const t12 = CHECKS.T12({retro: result});
  result.summary.t12 = {pass: t12.pass, reason: t12.reason, counts: t12.counts};
  if (write) {
    fs.writeFileSync(path.join(outDir, 'result.json'), `${JSON.stringify(result)}\n`);
    fs.writeFileSync(path.join(outDir, 'summary.md'), summaryMd(result));
  }
  return result;
}

const pct = x => `${(x * 100).toFixed(1)}%`;
const num = (x, d = 1) => (Number.isFinite(x) ? x.toLocaleString('en-US', {maximumFractionDigits: d, minimumFractionDigits: d}) : '없음');
const pv = x => (Number.isFinite(x) ? (x < 0.001 ? x.toExponential(1) : x.toFixed(3)) : '없음');

export function summaryMd(result) {
  const s = result.summary;
  const raw = s.vs.무판.raw;
  const pc = s.vs.무판.pct;
  const a11 = s.vs['ATLAS 11'];
  const lines = [];
  lines.push('# ATLAS 4시간 엔진 0판 · 재현 결과 (16시 판)');
  lines.push('');
  lines.push(`- 만든 때: ${result.createdAt} · 코드 ${result.code.commit ?? '없음'} · 자료 \`public/data/input.json\` (NAVER 한 출처)`);
  lines.push(`- 출발일 ${s.origins.first} ~ ${s.origins.last} · 거래일 ${s.origins.count}개 · 52종목 · 채점 ${s.rows}줄 · 판 ${s.boards}개`);
  lines.push('- 엔진: 가운데 = 마지막 종가 그대로(무판) · 폭 = HAR(어제·5일·22일 흔들림) · 지난 잔차로 분포(좌우 따로)');
  lines.push('- 판정 규칙: 봉인된 `atlas4h/seal/judgment.json`·`judgment-2.json` 그대로 (실력 = 1 − 평균의 비율 · DM 한쪽 p < 0.05 를 lag 0·5 둘 다)');
  lines.push('');
  lines.push('## 1. 결론');
  lines.push('');
  lines.push(`1. **T12는 아직 못 넘습니다.** 기준 셋 가운데 「단순 전이식」·「ATLAS 11」 점수가 「없음」이라 견줄 수 없습니다. 잠긴 시험 T12 의 말: 「${s.t12.reason}」`);
  lines.push(`2. 무판과 견준 80% 범위 점수: 엔진 평균 ${num(raw.meanEngine)} · 무판 평균 ${num(raw.meanBaseline)} (원 단위) → 실력 ${num(raw.skill * 100, 1)}% · 판정 「${raw.verdict}」.`);
  lines.push(`3. 80% 범위가 실제로 덮은 몫: 엔진 ${pct(s.coverage80.engine.share)} (${s.coverage80.engine.covered}/${s.coverage80.engine.of}) · Kupiec p ${pv(s.coverage80.engine.kupiecP)} · 무판 ${pct(s.coverage80.무판.share)} · Kupiec p ${pv(s.coverage80.무판.kupiecP)}.`);
  lines.push(`4. 덮음 ${pct(s.coverage80.engine.share)} 는 판정 기준의 통과 폭(70~90%) 안이지만 80%보다 ${s.coverage80.engine.share < 0.8 ? '낮습니다 — 범위가 좁은 쪽입니다' : '높습니다 — 범위가 넓은 쪽입니다'}. Kupiec 는 ${s.rows.toLocaleString('en-US')}줄을 서로 따로 본 값이라, 같은 날 종목끼리 함께 움직이는 만큼 p 가 지나치게 작게 나옵니다.`);
  lines.push('');
  lines.push('## 2. 기준마다');
  lines.push('');
  lines.push('| 기준 | 엔진 평균 구간 점수 | 기준 평균 | 실력(1 − 비율) | DM p (lag 0) | DM p (lag 5) | 판정 |');
  lines.push('|---|---|---|---|---|---|---|');
  lines.push(`| 무판 (원 단위) | ${num(raw.meanEngine)} | ${num(raw.meanBaseline)} | ${num(raw.skill * 100, 2)}% | ${pv(raw.dm.lag0.p)} | ${pv(raw.dm.lag5.p)} | ${raw.verdict} |`);
  lines.push(`| 무판 (출발값의 %, 곁 확인) | ${num(pc.meanEngine, 3)} | ${num(pc.meanBaseline, 3)} | ${num(pc.skill * 100, 2)}% | ${pv(pc.dm.lag0.p)} | ${pv(pc.dm.lag5.p)} | ${pc.verdict} |`);
  lines.push(`| 단순 전이식 | 없음 | 없음 | 없음 | 없음 | 없음 | 잴 수 없음 |`);
  if (a11.none) lines.push(`| ATLAS 11 | 없음 | 없음 | 없음 | 없음 | 없음 | 잴 수 없음 |`);
  else lines.push(`| ATLAS 11 (원 단위) | ${num(a11.raw.meanEngine)} | ${num(a11.raw.meanBaseline)} | ${num(a11.raw.skill * 100, 2)}% | ${pv(a11.raw.dm.lag0.p)} | ${pv(a11.raw.dm.lag5.p)} | ${a11.raw.verdict} |`);
  lines.push('');
  lines.push('- DM 은 「같은 시각 판」 하나(하루 하나, 52종목 평균 벌점)를 한 점으로 셌습니다. 판 수 ' + raw.boards + '개.');
  lines.push(`- 잠긴 T12 는 줄(종목) 단위로 겹침 lag ${s.t12.counts.lag} 을 써서 따로 셉니다 — 위 표와 셈법이 다릅니다.`);
  lines.push(`- 분포 점수 CRPS 평균: 엔진 ${num(s.crps.engine)} · 무판 ${num(s.crps.무판)} (원) · 방향 브라이어 평균: 엔진 ${pv(s.brier.engine)} · 무판 ${pv(s.brier.무판)}.`);
  lines.push('');
  lines.push('## 3. 「없음」인 것');
  lines.push('');
  lines.push(`- 단순 전이식: ${s.vs['단순 전이식'].why}.`);
  if (a11.none) lines.push(`- ATLAS 11: ${a11.why}. ${a11.live}.`);
  lines.push(`- 위기 구간 덮음: ${s.crisis}.`);
  lines.push('- 코스피 판: 코스피 지난 자료가 없어 「없음」 (판의 kospi = null · 변수 kospi 「없음」).');
  lines.push('');
  lines.push('## 4. 누수 막기');
  lines.push('');
  lines.push(`- ${result.leakage}.`);
  lines.push('- 재현 판의 봉인 시각은 출발일 16:00 KST 로 흉내 냈습니다(그날 15:30 종가 뒤). ATLAS 11 발행본은 이 시각 전에 나온 것만 기준으로 씁니다.');
  lines.push('');
  lines.push('## 5. 일반인 눈높이 설명');
  lines.push('');
  lines.push(`지난 ${s.origins.count}거래일 동안 매일 「내일 종가는 오늘 값 근처, 이만큼 흔들린다」는 판을 다시 만들어 채점했습니다. 흔들림 크기를 최근 하루·한 주·한 달로 나눠 재는 방식(HAR)이 「지난 1년 흔들림을 그대로 쓰는 방식(무판)」보다 범위 점수가 ${raw.skill > 0 ? '낮았습니다(좋음)' : '낮지 않았습니다'}. 다만 시험 T12는 기준 셋을 모두 이겨야 하는데, 반도체지수 자료와 ATLAS 11의 범위 기록이 없어 둘과는 견줄 수 없었습니다. 그래서 아직 화면에는 내지 않습니다.`);
  lines.push('');
  return lines.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--end') o.end = argv[++i];
    else if (argv[i] === '--days') o.days = Number(argv[++i]);
    else if (argv[i] === '--input') o.inputFile = argv[++i];
    else if (argv[i] === '--out') o.outDir = argv[++i];
    else if (argv[i] === '--dry') o.write = false;
    else {
      console.error(`모르는 칸: ${argv[i]}`);
      process.exit(1);
    }
  }
  const r = run(o);
  const s = r.summary;
  console.log(JSON.stringify({rows: s.rows, boards: s.boards, coverage80: s.coverage80, crps: s.crps, brier: s.brier, vs: s.vs, t12: s.t12}, null, 1));
}
