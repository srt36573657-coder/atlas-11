// 감시 S8 독립 시험 — 시험을 만든 일꾼이 아닌 다른 일꾼이 사양 글만 보고 흠을 심는다.
// Defects are designed from atlas4h/command/10-spec.txt, 11-extremes.txt, 02-watch.txt,
// 13-command.txt, atlas4h/spec/board.md and atlas4h/seal/judgment.json only.
// Run: node atlas4h/verify/independent-defects.mjs  (writes independent-defects.json next to this file)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../spec/checks.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'atlas4h/spec/fixtures/good';
const clone = (x) => structuredClone(x);

// ISO time shift that keeps the +09:00 form
function shift(iso, sec) {
  const t = new Date(new Date(iso).getTime() + sec * 1000 + 9 * 3600 * 1000);
  return t.toISOString().replace('Z', '').replace(/\.\d+$/, '') + '+09:00';
}
const boardSha = (b) => (C.boardSha256 ? C.boardSha256(b) : C.sha256(C.canonicalJson(b)));

function run(id, state, opts = {}) {
  try {
    const r = C.CHECKS[id](state, opts);
    return { pass: !!r.pass, reason: r.reason };
  } catch (e) {
    return { pass: false, reason: 'ERROR ' + e.message, error: true };
  }
}

// ---- extra good inputs for checks that the good fixture cannot feed (T11, T12, T13, T19) ----
const goodChanges = [
  { commit: 'eb0d399', subject: 'atlas4h 5', status: 'A', path: 'atlas4h/spec/checks.mjs', deletedLines: 0 },
  { commit: 'eb0d399', subject: 'atlas4h 5', status: 'A', path: 'atlas4h/tests/spec-checks.test.mjs', deletedLines: 0 },
  { commit: '1e4c2bf', subject: 'atlas4h 6', status: 'A', path: 'atlas4h/seal/judgment.json', deletedLines: 0 },
];
function goodRetro() {
  const rows = [];
  for (let i = 0; i < 20; i++) {
    rows.push({ boardId: `r4h-202609${String(i + 1).padStart(2, '0')}-08-aaaa${String(i).padStart(4, '0')}`, target: `2026-09-${String(i + 1).padStart(2, '0')}`,
      interval: { alpha: 0.2, score: 40 + ((i * 7) % 5) },
      baselines: [{ id: '무판', interval: 46 + ((i * 3) % 4) }, { id: '단순 전이식', interval: 45 + ((i * 5) % 6) }, { id: 'ATLAS 11', interval: 47 + ((i * 11) % 3) }] });
  }
  return { schema: 'atlas4h-retro-1', rows };
}
function goodScores30(base) {
  const proto = base.scores[0];
  const rows = [];
  for (let i = 0; i < 30; i++) {
    const r = clone(proto);
    r.boardId = `4h-202610${String(2 + Math.floor(i / 3)).padStart(2, '0')}-${['08', '12', '16'][i % 3]}-cov${String(i).padStart(5, '0')}`;
    r.interval.covered = i < 24; // 24/30 = 80%
    r.crisis = false;
    rows.push(r);
  }
  for (let i = 0; i < 2; i++) { // crisis days, measured separately
    const r = clone(proto);
    r.boardId = `4h-20261020-${['08', '12'][i]}-crisis0${i}`;
    r.interval.covered = i === 0;
    r.crisis = true;
    rows.push(r);
  }
  return rows;
}
const T19_OK = '2026-10-01T18:20:00+09:00';

// ---- defects ----
// each: {check, what, mutate(state) -> opts?}
const D = [];
const CONTESTED = new Set([
  'code.dirty = true (커밋 안 된 코드로 셈)',
  '봉인 판의 twoPath 를 비움 [] (두 길을 안 셈)',
  'SPA p = 0.31 (못 넘었는데 고름)',
  '감시자가 짓는 이와 같음 by: "고리 일꾼"',
  '상수 측정 시각 constants.measuredAt 이 봉인 뒤 10분',
  '네 번째 시나리오(확률 0) 덧붙임 — 합 1',
]);
const add = (check, what, mutate) => D.push({ check, what, mutate });

// T1 봉인 뒤 수정 0
add('T1', '08시 판 가운데 값 2649.86 → 2649.87 (판 id·봉인 기록 그대로)', (s) => { s.boards[1].kospi.center = 2649.87; });
add('T1', '12시 판 설명 글 끝에 빈칸 한 칸 덧붙임', (s) => { s.boards[2].text[0] += ' '; });
add('T1', '08시 판을 고친 줄을 같은 id 로 하나 더 덧붙임(원래 줄은 그대로 둠)', (s) => { const b = clone(s.boards[1]); b.kospi.center = 2660; s.boards.push(b); });
add('T1', '08시 판을 고친 뒤 새 지문으로 봉인 기록을 하나 더 덧붙임(다시 봉인)', (s) => { s.boards[1].kospi.center = 2660; s.seals.push({ ...s.seals[1], sealedAt: '2026-10-02T09:10:00+09:00', sha256: boardSha(s.boards[1]) }); });
add('T1', '12시 판의 봉인 기록 줄을 지움(봉인 지문 없는 판)', (s) => { s.seals.splice(2, 1); });
add('T1', '08시 판 시나리오 확률을 0.25/0.5/0.25 → 0.3/0.45/0.25 로 고침(합은 그대로 1)', (s) => { const sc = s.boards[1].kospi.scenarios; sc[0].prob = 0.3; sc[1].prob = 0.45; });

// T2 봉인 시각 뒤 자료 사용 0
add('T2', '변수 observedAt = 봉인 시각 + 1초', (s) => { const b = s.boards[1]; b.inputs.variables[1].observedAt = shift(b.sealedAt, 1); });
add('T2', '출처(sources[]) 하나의 fetchedAt 만 봉인 뒤 1분', (s) => { const b = s.boards[1]; b.inputs.variables[0].sources[1].fetchedAt = shift(b.sealedAt, 60); });
add('T2', 'UTC 표기 "2026-10-02T00:00:00Z"(= 09:00 KST, 08:31:40 봉인 뒤)로 observedAt 적음', (s) => { const v = s.boards[1].inputs.variables[0]; v.observedAt = '2026-10-02T00:00:00Z'; v.sources.forEach((x) => { x.observedAt = '2026-10-02T00:00:00Z'; }); });
add('T2', '재현 판: 자료 마감(9/1 08:30) 뒤인 9/1 09:00 관측값 사용 — 봉인(10/1)보다는 앞', (s) => { const v = s.boards[0].inputs.variables[0]; v.observedAt = '2026-09-01T09:00:00+09:00'; v.sources.forEach((x) => { x.observedAt = '2026-09-01T09:00:00+09:00'; }); });
add('T2', '코스피 출발값 anchor.asOf 가 봉인 뒤 5분', (s) => { const b = s.boards[1]; b.kospi.anchor.asOf = shift(b.sealedAt, 300); });
add('T2', '상수 측정 시각 constants.measuredAt 이 봉인 뒤 10분', (s) => { const b = s.boards[1]; b.inputs.constants.measuredAt = shift(b.sealedAt, 600); });

// T3 봉인에 코드 판·자료 판·씨앗
add('T3', '08시 판에서 seed 칸을 지움', (s) => { delete s.boards[1].seed; });
add('T3', 'seed = null', (s) => { s.boards[1].seed = null; });
add('T3', 'code.commit = "" (빈 글자)', (s) => { s.boards[2].code.commit = ''; });
add('T3', 'dataVersion.sha256 칸을 지움(files 는 남김)', (s) => { delete s.boards[2].dataVersion.sha256; });
add('T3', 'dataVersion.files = [] (자료 파일 목록 비움)', (s) => { s.boards[1].dataVersion.files = []; });
add('T3', 'code.dirty = true (커밋 안 된 코드로 셈)', (s) => { s.boards[1].code.dirty = true; });

// T5 세 시나리오 확률 합 100%
add('T5', '확률 0.333·0.333·0.333 (합 0.999)', (s) => { s.boards[1].kospi.scenarios.forEach((x) => { x.prob = 0.333; }); });
add('T5', '시나리오 둘(위 0.5·아래 0.5) — 합은 1', (s) => { const sc = s.boards[1].kospi.scenarios; sc[0].prob = 0.5; sc[2].prob = 0.5; sc.splice(1, 1); });
add('T5', '확률을 백분율로 적음 25·50·25 (합 100)', (s) => { const sc = s.boards[1].kospi.scenarios; sc[0].prob = 25; sc[1].prob = 50; sc[2].prob = 25; });
add('T5', '음수 확률 0.6·0.6·-0.2 (합 1)', (s) => { const sc = s.boards[1].kospi.scenarios; sc[0].prob = 0.6; sc[1].prob = 0.6; sc[2].prob = -0.2; });
add('T5', '이름이 「위」「가운데」「옆」 (아래 없음) — 합 1', (s) => { s.boards[1].kospi.scenarios[2].name = '옆'; });
add('T5', '네 번째 시나리오(확률 0) 덧붙임 — 합 1', (s) => { const sc = s.boards[1].kospi.scenarios; sc.push({ ...clone(sc[1]), name: '급락', prob: 0 }); });

// T6 MinT
add('T6', 'reconciliation.method = "OLS"', (s) => { s.boards[1].reconciliation.method = 'OLS'; });
add('T6', 'maxGap = 0.4 (맞춘 뒤에도 어긋남 남음)', (s) => { s.boards[1].reconciliation.maxGap = 0.4; });
add('T6', '마디에서 「나머지」 빠짐', (s) => { s.boards[2].reconciliation.nodes = ['kospi', '005930', '000660']; });
add('T6', 'reconciliation 칸 통째로 없음', (s) => { delete s.boards[2].reconciliation; });
add('T6', '마디에 종목 000660 이 빠짐(판에는 000660 예측이 있음)', (s) => { s.boards[1].reconciliation.nodes = ['kospi', '005930', '나머지']; });

// T7 변수마다 시각·출처 둘
add('T7', 'status "ok" 인데 출처 하나', (s) => { s.boards[1].inputs.variables[0].sources.splice(1, 1); });
add('T7', 'status "ok" · 출처 둘이 같은 이름·같은 주소(중복)', (s) => { const v = s.boards[1].inputs.variables[0]; v.sources[1] = clone(v.sources[0]); });
add('T7', 'status "ok" 인데 fetchedAt 없음', (s) => { delete s.boards[1].inputs.variables[0].fetchedAt; });
add('T7', '값 없음인데 value 0 으로 채움(status 「없음」)', (s) => { const v = s.boards[1].inputs.variables.find((x) => x.status === '없음'); v.value = 0; });
add('T7', 'value null 인데 status "ok"', (s) => { s.boards[1].inputs.variables[0].value = null; });
add('T7', '두 출처 값이 2% 어긋나는데 status "ok"(확인 중 아님)', (s) => { const v = s.boards[1].inputs.variables[0]; v.sources[1].value = Math.round(v.sources[0].value * 1.02 * 100) / 100; });
add('T7', '봉인 5시간 전 관측값인데 status "ok"·표시 없음(옛값이어야)', (s) => { const b = s.boards[2]; const v = b.inputs.variables[0]; const t = shift(b.sealedAt, -5 * 3600); v.observedAt = t; v.marks = []; v.sources.forEach((x) => { x.observedAt = t; }); });

// T8 두 길
add('T8', 'pathA 2652.0 · pathB 2655.0 · 허용 0.5 인데 agree: true 로 적음', (s) => { const p = s.boards[1].twoPath[0]; p.pathB = p.pathA + 3; p.agree = true; });
add('T8', 'agree: false 인데 화면 값이 숫자(2663.15)', (s) => { s.boards[2].screen.value = 2663.15; });
add('T8', 'agree: false 인데 pathA·pathB 가 같음(거짓 어긋남 — 숫자를 숨김)', (s) => { const p = s.boards[1].twoPath[0]; p.agree = false; s.boards[1].screen.value = '확인 중'; });
add('T8', '봉인 판의 twoPath 를 비움 [] (두 길을 안 셈)', (s) => { s.boards[1].twoPath = []; });

// T9 고리 40분 안
add('T9', '41분 걸린 고리를 status "ok" 로 적음', (s) => { const l = s.loops[0]; l.endedAt = shift(l.startedAt, 41 * 60); l.minutes = 41; });
add('T9', 'minutes 39.5 로 적었지만 시작~끝은 41분', (s) => { const l = s.loops[0]; l.endedAt = shift(l.startedAt, 41 * 60); l.minutes = 39.5; });
add('T9', '40분 30초(40.5) · status "ok"', (s) => { const l = s.loops[1]; l.endedAt = shift(l.startedAt, 40 * 60 + 30); l.minutes = 40.5; });
add('T9', '시간 초과 고리인데 그 판은 새로 「봉인」(앞 판 유지 아님)', (s) => { s.boards[3].status = '봉인'; });
add('T9', '끝 시각 없는 고리(endedAt·minutes 없음) · status "ok"', (s) => { delete s.loops[1].endedAt; delete s.loops[1].minutes; });

// T10 금지 말 0
add('T10', '설명 글 긴 문장 속 「확실」: "외국인 순매수가 이어지면 2700 돌파가 확실해 보입니다."', (s) => { s.boards[1].text.push('외국인 순매수가 이어지면 2700 돌파가 확실해 보입니다.'); });
add('T10', '화면 가능성 줄 끝에 「무조건」', (s) => { s.boards[1].screen.chance += ' · 무조건 가운데'; });
add('T10', '시나리오 전제(premise) 속 「목표가」', (s) => { s.boards[1].kospi.scenarios[0].premise = '증권사 목표가 상향이 이어지는 흐름'; });
add('T10', '사건 이름 속 「추천」', (s) => { s.boards[2].events[0].name = '증권사 추천 종목 발표'; });
add('T10', '꼬리 위험 글에 「보장」 활용형 "반등이 보장됩니다"', (s) => { s.boards[1].kospi.tail = [{ what: '하락 뒤 반등이 보장됩니다', kospiPct: -2.0, watch: 'WTI' }]; });
add('T10', '화면 파일(view.json) 가능성 줄에 「추천」', (s) => { s.view.now.screen.chance = '보통 · 위 25% · 가운데 50% · 아래 25% · 매수 추천'; });
add('T10', '시나리오 틀렸다는 표시(invalidator)에 「팔라」', (s) => { s.boards[1].kospi.scenarios[2].invalidator = '외국인이 팔라는 신호를 내면'; });

// T11 옛 엔진·채점·기록 변경 0 — pure function with my own path lists
const T11 = [
  // paths are real files that existed at the base commit a9187c6 (git ls-tree)
  ['옛 엔진 파일 lib/atlas11/analysis.mjs 수정(M, 지운 줄 3)', [...goodChanges, { commit: 'zz00001', subject: 'atlas4h 7', status: 'M', path: 'lib/atlas11/analysis.mjs', deletedLines: 3 }]],
  ['옛 일별 기록 public/data/atlas11/daily/2026-09-29.json 삭제(D)', [...goodChanges, { commit: 'zz00002', subject: 'atlas4h 7', status: 'D', path: 'public/data/atlas11/daily/2026-09-29.json', deletedLines: 40 }]],
  ['옛 보고 파일 reports/atlas11/ab/ab-db46556a729dde8b/protocol.json 이름 바꿈(R100)', [...goodChanges, { commit: 'zz00003', subject: 'atlas4h 7', status: 'R100', path: 'reports/atlas11/ab/ab-db46556a729dde8b/protocol.json', deletedLines: 0 }]],
  ['옛 스크립트 scripts/atlas11/ab_backtest.mjs 수정(M, 지운 줄 0 — 덮어쓰기 없이 덧붙임만)', [...goodChanges, { commit: 'zz00006', subject: 'atlas4h 7', status: 'M', path: 'scripts/atlas11/ab_backtest.mjs', deletedLines: 0 }]],
  ['옛 보고 파일 reports/atlas11/overhaul/progress.json 수정(M, 지운 줄 4)', [...goodChanges, { commit: 'zz00007', subject: 'atlas4h 7', status: 'M', path: 'reports/atlas11/overhaul/progress.json', deletedLines: 4 }]],
  ['atlas4h 장부 줄을 고침(M, 지운 줄 1) — 기록은 덧붙이기만', [...goodChanges, { commit: 'zz00004', subject: 'atlas4h 7', status: 'M', path: 'atlas4h/ledger/boards/2026-10-02.jsonl', deletedLines: 1 }]],
  ['봉인한 판정 기준 atlas4h/seal/judgment.json 수정(M, 지운 줄 2)', [...goodChanges, { commit: 'zz00005', subject: 'atlas4h 7', status: 'M', path: 'atlas4h/seal/judgment.json', deletedLines: 2 }]],
];

// T12 재현에서 폭이 기준 셋 모두를 이김 (good retro is my own: 40~42 vs 45~49)
add('T12', '한 기준(무판)에 평균 0.1 차로 짐(줄마다 다른 차이)', (s) => { s.retro.rows.forEach((r, i) => { r.baselines[0].interval = r.interval.score - 0.1 + (i % 2 ? 0.05 : -0.05); }); });
add('T12', '기준 둘만 적음(ATLAS 11 줄 없음)', (s) => { s.retro.rows.forEach((r) => { r.baselines = r.baselines.slice(0, 2); }); });
add('T12', 'alpha 0.1(90% 폭)로 셈 — 80% 폭이 아님', (s) => { s.retro.rows.forEach((r) => { r.interval.alpha = 0.1; }); });
add('T12', '재현 줄이 하나도 없음 rows: []', (s) => { s.retro.rows = []; });
add('T12', '폭 점수가 기준 셋보다 모두 큼(나쁨)', (s) => { s.retro.rows.forEach((r) => { r.interval.score = 60; }); });

// T13 80% 덮음 70~90%(30판↑)·위기 따로 (good: 30 rows, 24 covered)
add('T13', '평소 30판 중 20판만 덮음(66.7%)', (s) => { s.scores.forEach((r, i) => { if (!r.crisis) r.interval.covered = i < 20; }); });
add('T13', '평소 30판 중 28판 덮음(93.3% — 폭이 너무 넓음)', (s) => { s.scores.forEach((r, i) => { if (!r.crisis) r.interval.covered = i < 28; }); });
add('T13', '평소 30줄이지만 15판을 두 번씩 채점(서로 다른 판 15개)', (s) => { for (let i = 15; i < 30; i++) s.scores[i].boardId = s.scores[i - 15].boardId; });
add('T13', '평소 30줄 중 1줄을 위기로 돌림 — 평소 판은 29판', (s) => { s.scores[29].crisis = true; });
add('T13', '평소 30판 덮음 66.7%(20/30) + 위기 10판 모두 덮음 → 합치면 75%로 가려짐', (s) => { s.scores = s.scores.filter((r) => !r.crisis); s.scores.forEach((r, i) => { r.interval.covered = i < 20; }); for (let i = 0; i < 10; i++) { const r = clone(s.scores[0]); r.boardId = `4h-202610${20 + Math.floor(i / 3)}-${['08', '12', '16'][i % 3]}-crisis${i}`; r.crisis = true; r.interval.covered = true; s.scores.push(r); } });
add('T13', '위기 날 2줄을 평소로 섞음(crisis: false) — 위기를 따로 안 잼', (s) => { s.scores.forEach((r) => { r.crisis = false; }); });
add('T13', '덮음 칸 covered 를 모든 줄에서 지움', (s) => { s.scores.forEach((r) => { delete r.interval.covered; }); });

// T14 화면 숫자 = 봉인 값
add('T14', 'view.json 08시 판 가운데 값 2649.86 → 2649.87', (s) => { s.view.history[0].kospi.center = 2649.87; s.view.history[0].screen.value = 2649.87; });
add('T14', 'view.json 08시 판 p90 2692.8 → 2693.8', (s) => { s.view.history[0].kospi.quantiles.p90 = 2693.8; });
add('T14', 'view.json 지금 판(12시 · 「확인 중」)을 숫자 2663.15 로 냄', (s) => { s.view.now.screen.value = 2663.15; });
add('T14', '봉인 판 안의 screen.value(2652.0)가 같은 판 kospi.center(2649.86)와 다름', (s) => { s.boards[1].screen.value = 2652.0; });
add('T14', 'view.json 에 봉인 기록 없는 판 id 의 숫자를 덧붙임', (s) => { s.view.history.push({ boardId: '4h-20261002-04-ffffffff', kospi: { center: 2640.0, quantiles: { p10: 2600.0, p90: 2680.0 } }, screen: { value: 2640.0, boardTime: '04시 판' } }); });

// T16 무판을 못 이긴 가운데 후보의 무게 0
add('T16', 'center-transfer(무판 못 이김) 무게 0 → 0.3', (s) => { s.boards[1].engines.find((e) => e.id === 'center-transfer').weight = 0.3; });
add('T16', 'center-transfer 무게 0.0001 (아주 작은 0 아님)', (s) => { s.boards[2].engines.find((e) => e.id === 'center-transfer').weight = 0.0001; });
add('T16', 'weights.json 에 beatsNoChange: true 로 적었지만 DM p = 0.41, 판 무게 0.3', (s) => { s.weights.candidates[0].beatsNoChange = true; s.boards[1].engines.find((e) => e.id === 'center-transfer').weight = 0.3; });
add('T16', 'weights.json 근거 목록에 없는 가운데 후보(center-momentum)가 무게 0.2', (s) => { s.boards[1].engines.push({ id: 'center-momentum', role: '가운데', weight: 0.2, inputs: ['kospi'], sawPreviousBoard: false }); });

// T17 검색 결과에 봉인 뒤 정보 0
add('T17', 'leakCheck.postSealHits = 1', (s) => { s.boards[1].events[0].leakCheck.postSealHits = 1; });
add('T17', 'leakCheck 칸 없음', (s) => { delete s.boards[2].events[0].leakCheck; });
add('T17', 'leakCheck.checked = 0 (하나도 안 봤는데 0건)', (s) => { s.boards[1].events[0].leakCheck.checked = 0; });

// T18 LLM 판 재현은 학습 마감 뒤만
add('T18', '재현 판 목표일 2026-06-15 (학습 마감 06-30 앞)', (s) => { s.boards[0].target.date = '2026-06-15'; });
add('T18', '재현 판 목표일 = 학습 마감일 2026-06-30 (뒤가 아님)', (s) => { s.boards[0].target.date = '2026-06-30'; });
add('T18', '재현 판 llm.trainingCutoff 없음 (used: true)', (s) => { delete s.boards[0].llm.trainingCutoff; });
add('T18', 'retro 표시를 지운 재현 판: 자료 마감 6/1·봉인 10/1·목표 6/1 (학습 마감 앞)', (s) => { const b = s.boards[0]; delete b.retro; b.target.date = '2026-06-01'; b.dataCutoff = '2026-06-01T08:30:00+09:00'; });

// T19 판정 기준이 첫 채점 전에 봉인됨 (good opts: commit 18:20, before first score)
add('T19', '판정 기준 봉인 = 첫 채점 + 1분 (커밋도 같은 때)', (s) => { const t = shift(s.scores[0].scoredAt, 60); s.judgment.sealedAt = t; return { judgmentCommitAt: t }; });
add('T19', '판정 기준 sealedAt 은 앞이지만 파일 커밋이 첫 채점 뒤(날짜를 앞으로 적음)', (s) => ({ judgmentCommitAt: shift(s.scores[0].scoredAt, 3600) }));
add('T19', '판정 기준 봉인(18:18:39) 전에 채점한 줄(18:00)이 하나 있음', (s) => { const r = clone(s.scores[0]); r.boardId = 'r4h-20260901-08-d4e5f6a7'; r.target = '2026-09-01'; r.scoredAt = '2026-10-01T18:00:00+09:00'; s.scores.unshift(r); });
add('T19', '판정 기준에 sealedAt 칸 없음', (s) => { delete s.judgment.sealedAt; });

// T20 시도가 장부에 다 있고 SPA를 거침
add('T20', '고른 기록 trialIds 에 장부에 없는 trial-0004', (s) => { s.weights.selections[0].trialIds.push('trial-0004'); });
add('T20', '고른 기록에 spa 칸 없음', (s) => { delete s.weights.selections[0].spa; });
add('T20', '고른 시도(chose) trial-0003 이 trialIds 목록 밖', (s) => { s.weights.selections[0].chose = 'trial-0003'; });
add('T20', '시도 장부 trial-0002 의 sealedAt 없음(결과 봉인 안 됨)', (s) => { delete s.trials[1].sealedAt; });
add('T20', 'SPA p = 0.31 (못 넘었는데 고름)', (s) => { s.weights.selections[0].spa.p = 0.31; });

// T21 엔진들이 앞 판 값을 안 봄
add('T21', 'width-harx sawPreviousBoard: true', (s) => { s.boards[2].engines[3].sawPreviousBoard = true; });
add('T21', 'sawPreviousBoard 칸 없음', (s) => { delete s.boards[1].engines[2].sawPreviousBoard; });
add('T21', 'sawPreviousBoard: "false" (글자)', (s) => { s.boards[1].engines[0].sawPreviousBoard = 'false'; });
add('T21', '엔진 입력에 앞 판 id(board:4h-20261002-08-…)가 있는데 sawPreviousBoard false', (s) => { s.boards[2].engines[0].inputs.push('board:4h-20261002-08-a1b2c3d4'); });

// T22 답마다 쓴 구조 번호
add('T22', '구조 번호에서 F 칸이 빠짐(A~E 만)', (s) => { s.boards[1].structures = s.boards[1].structures.filter((x) => !x.startsWith('F')); });
add('T22', 'structures = []', (s) => { s.boards[2].structures = []; });
add('T22', 'F1·F2 를 없는 칸 G1 로 바꿈', (s) => { s.boards[1].structures = s.boards[1].structures.filter((x) => !x.startsWith('F')).concat(['G1']); });
add('T22', '번호 없는 칸 이름 "F" 만 적음', (s) => { s.boards[1].structures = s.boards[1].structures.filter((x) => !x.startsWith('F')).concat(['F']); });
add('T22', 'structures 칸 통째로 없음', (s) => { delete s.boards[3].structures; });

// T23 감시 S1~S8 모두 0
add('T23', '감시 기록에 S7 칸이 없음', (s) => { delete s.watch[1].S.S7; });
add('T23', 'S4 = 1', (s) => { s.watch[0].S.S4 = 1; });
add('T23', 'S8 = null (안 잼)', (s) => { s.watch[2].S.S8 = null; });
add('T23', '16시 고리의 감시 기록 줄이 없음', (s) => { s.watch.pop(); });
add('T23', '감시자가 짓는 이와 같음 by: "고리 일꾼"', (s) => { s.watch[0].by = '고리 일꾼'; });
add('T23', 'S3 = "0" (글자) · S5 = 0.5', (s) => { s.watch[1].S.S5 = 0.5; });

// ---- run ----
const base = await C.loadState(BASE);
const goodState = {};
for (const id of C.IDS) goodState[id] = run(id, base, {}).pass;
// good variants for checks the fixture cannot feed
const extraGood = {};
const baseFor = (check) => {
  const s = clone(base);
  let opts = {};
  if (check === 'T12') s.retro = goodRetro();
  if (check === 'T13') s.scores = goodScores30(base);
  if (check === 'T19') opts = { judgmentCommitAt: T19_OK };
  return { s, opts };
};
for (const id of ['T12', 'T13', 'T19']) { const { s, opts } = baseFor(id); extraGood[id] = run(id, s, opts); }
{
  const r = C.checkOldEngineUntouched(goodChanges);
  extraGood.T11 = typeof r === 'object' ? { pass: !!r.pass, reason: r.reason } : { pass: !!r, reason: String(r) };
  extraGood.T11_viaCHECKS = run('T11', base, { changes: goodChanges });
}

const defects = [];
for (const d of D) {
  const { s, opts } = baseFor(d.check);
  const o2 = d.mutate(s) || {};
  const r = run(d.check, s, { ...opts, ...o2 });
  defects.push({ check: d.check, what: d.what, caught: !r.pass, reason: r.reason, ...(CONTESTED.has(d.what) ? { contested: true } : {}) });
}
for (const [what, changes] of T11) {
  let r = C.checkOldEngineUntouched(changes);
  r = typeof r === 'object' ? { pass: !!r.pass, reason: r.reason } : { pass: !!r, reason: String(r) };
  const viaChecks = run('T11', base, { changes });
  defects.push({ check: 'T11', what, caught: !r.pass, reason: r.reason, viaCHECKS: { caught: !viaChecks.pass, reason: viaChecks.reason }, ...(what.startsWith('atlas4h 장부') || what.startsWith('봉인한 판정 기준') ? { contested: true } : {}) });
}
// legit-text probes for T10 (not defects): a careful reader would expect these to pass
const probes = [];
for (const [what, txt] of [['정상 낱말 「불확실성」', '밤사이 불확실성이 커져 폭을 넓혔습니다.'], ['정상 낱말 「사라졌다」', '어제 걱정이 사라졌다는 뜻은 아닙니다.']]) {
  const s = clone(base); s.boards[1].text.push(txt);
  const r = run('T10', s, {});
  probes.push({ check: 'T10', what, falseAlarm: !r.pass, reason: r.reason });
}

{
  const s = clone(base); s.retro = goodRetro();
  s.retro.rows.forEach((r) => { r.interval.score = 40; r.baselines.forEach((b, k) => { b.interval = 46 + k; }); });
  const r = run('T12', s, {});
  probes.push({ check: 'T12', what: '좋은 재현 — 줄마다 차이가 똑같음(40 대 46·47·48)', falseAlarm: !r.pass, crashed: !!r.error, reason: r.reason });
}
const order = (c) => Number(c.slice(1));
defects.sort((a, b) => order(a.check) - order(b.check));
const caught = defects.filter((x) => x.caught).length;
const missed = defects.filter((x) => !x.caught);
const now = new Date(Date.now() + 9 * 3600 * 1000).toISOString().replace('Z', '').replace(/\.\d+$/, '') + '+09:00';
const out = {
  schema: 'atlas4h-verify-1', at: now, by: '독립 시험 일꾼', base: BASE,
  goodState,
  extraGood,
  defects,
  probes,
  summary: { planted: defects.length, caught, missed: missed.length, missedList: missed.map((x) => `${x.check}: ${x.what}${x.contested ? ' [다툼]' : ''}`),
    strict: (() => { const st = defects.filter((x) => !x.contested); return { planted: st.length, caught: st.filter((x) => x.caught).length, missed: st.filter((x) => !x.caught).length }; })(),
    contestedNote: 'contested(다툼) = 사양 글이 그 흠까지 덮는지 읽는 사람마다 갈릴 수 있는 것' },
};
fs.writeFileSync(path.join(HERE, 'independent-defects.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.summary, null, 1));
console.log('extraGood', JSON.stringify(extraGood));
console.log('probes', JSON.stringify(probes));
