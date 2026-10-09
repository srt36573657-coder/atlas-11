# ATLAS 1단계 — 2,000만 경로 엔진 · 회차 기록 · 소거 1판 · 따로 다시 세는 검사 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사장님 승인(2026-10-10 05:14 마카오 · 06:14 KST — 「1예측한다 2a안 3 너가 알아서 해 4번은 지켜 4너에제안대로 해 5 너에제안대로해 6은 너가 가장 현명하게 해라 7너가 해결해」)에 따라, 화면을 바꾸기 전에 셈과 기록부터 세운다: 회차마다 두 판(한국 365 + 미국 365) 합계 2,000만 경로의 몬테카를로(위험 · 범위), 회사마다 통과 · 보류 · 제외 판정(소거 1판), 그리고 다른 언어로 따로 다시 세는 검사.

**Architecture:** 엔진은 파이썬(넘파이) 한 파일 `scripts/atlas11/mc/fhs_crn.py` — 설계 보고 ⑤의 「모형 2판」(같은 날짜 다시 뽑기 + 흔들림 거르기 · 기울기 0)을 그대로 옮긴다(작업 방 실측 원본 `bench2.py`). 결과는 판마다 `public/data/atlas11/mc/<판>/<회차 ID>.json`(고치지 않음) + 가리키는 `latest.json`, 회차 기록은 `reports/atlas11/rounds/<회차 ID>.json`. 판 읽기(`scripts/atlas11/lens/build.mjs`)가 같은 기준일 · 같은 입력 지문일 때만 그 결과를 `lens.mc` 로 붙이고, 소거 1판(`lib/atlas11/elim.mjs`)이 `lens.elim` 을 만든다. 따로 세기: 몬테카를로는 자바스크립트(`scripts/atlas11/verify/mc_verify.mjs` · 다른 언어 · 다른 난수 · 같은 명세 = L1), 소거는 파이썬(`scripts/atlas11/verify/elim_verify.py` · 원자료에서 다시 판정 = L1).

**Tech Stack:** Python 3.12 + numpy 2.x (엔진 · 소거 검사) · Node 22 ESM(판 읽기 · 소거 · 몬테카를로 검사) · `node --test`(tests/atlas11).

## Global Constraints

- 저장소 `/home/claude/atlas-11` · 화면 코드(`site/`)는 1단계에서 고치지 않는다(2단계 몫).
- `.github/workflows/atlas11-daily.yml` · `atlas11-evening.yml` 은 고치지 않는다(규칙 7).
- `tests/atlas11/palette.test.mjs` 의 기준 숫자는 고치지 않는다.
- 기록은 덮어쓰지 않는다(규칙 8): 결과 · 회차 기록은 새 파일만, 가리키는 `latest.json` 만 바꿔 씀.
- 한 경로 = 한 회사가 기준일 실제 마감 가격에서 60거래일 끝까지 가는 완전한 시나리오 하나. 날짜 수 · 변수 수를 곱해 세지 않는다. 같은 씨앗으로 다시 돌린 것(재현)은 새 경로로 세지 않는다.
- 회차 합계 20,000,000 = 기본 20,000 × 회사 수 + 추가(미리 정한 식). 두 판(한국 · 미국)을 합친 수.
- 모형 `fhs-crn-2`: L=500 · 거르기 λ=0.94 · 바닥 0.000025 · α=0.06 · β=0.93(반감기 약 69거래일) · 충격 자름 ±8 · 흔들림 위 끝 = 4 × max(평소, 지금) · 한국 하루 가격 제한 ±30% · 미국 제한 없음 · 기울기 0(지난 평균을 뺌) · H=60.
- 난수: numpy `PCG64DXSM` + `SeedSequence(int(sha256(runId)[:16], 16))` → 판마다 `spawn` 해 겹치지 않는 흐름.
- 폐기 = 값이 무한/숫자 아님인 경로만. 하락 경로는 하나도 지우지 않는다. 아주 큰 움직임(60일 뒤 +1000% 넘음 또는 하루 로그 움직임 1 넘음)은 지우지 않고 센다.
- 위험 기준(사장님 「6은 너가 가장 현명하게」): 가장 나쁜 5% 경로 평균(cvar5) < −0.50 이면 「위험 표시」 — 모형이 별도 구간 시험을 통과하기 전에는 표시만(판정을 보류로 바꾸지 않음) · `calibrated: false`.
- 새 사용자용 글에 쓰지 않는 낱말: 추천 · 목표가 · 사라 · 팔라 · 확실 · 보장 · 무조건 · 확률.
- 커밋은 총괄이 리뷰 뒤에 한다(구현 에이전트는 커밋하지 않음).

---

## File Structure

| 파일 | 책임 |
|---|---|
| Create `scripts/atlas11/mc/fhs_crn.py` | 엔진 · 배분 · 결과 · 회차 기록 쓰기 |
| Create `tests/atlas11/mc.test.mjs` | 엔진을 작은 수로 돌려 모양 · 경로 셈 · 재현 · 성질 검사 |
| Create `lib/atlas11/elim.mjs` | 소거 1판(통과 · 보류 · 제외 · 다시 보는 조건) — 순수 함수 |
| Create `tests/atlas11/elim.test.mjs` | 소거 1판 시험 |
| Modify `scripts/atlas11/lens/build.mjs` | `lens.mc`(같은 기준일 · 같은 입력 지문일 때만) · `lens.elim` 붙이기 |
| Create `scripts/atlas11/verify/mc_verify.mjs` | 몬테카를로 따로 세기(JS 다시 뽑기 L1 + 성질 검사) |
| Create `scripts/atlas11/verify/elim_verify.py` | 소거 따로 세기(원자료에서 다시 판정 L1) |
| Create `scripts/atlas11/round.mjs` | 한 회차 돌리기(엔진 → 판 읽기 → 두 검사 → 회차 기록 요약) |
| Modify `docs/ATLAS_원칙.md` · `CLAUDE.md` · `config/atlas11/no-prediction.json` · `reports/atlas11/full-check/trans-waiver.json` | 규칙 49 · 승인 기록 · 번역 면제 기한(사장님 「7너가 해결해」) |

## 공통 자료 모양(모든 Task 가 이 이름을 씀)

### 회차 ID

`runIdOf({date, slot, krSha, usSha})` = `${date.replace(/-/g,'')}-${slot}-${sha256(krSha + usSha + slot + date).slice(0, 8)}` · slot ∈ `'08' | '12' | '16' | '21' | 'hand'` · date = 서울 날짜(YYYY-MM-DD).

### 판 결과 `public/data/atlas11/mc/<place>/<runId>.json` (schema `atlas11-mc-2`)

```json
{
  "schema": "atlas11-mc-2", "runId": "20261010-hand-1a2b3c4d", "place": "kr", "asOf": "2026-10-08",
  "made": "2026-10-10T06:30:00+09:00",
  "model": {"id": "fhs-crn-2", "H": 60, "L": 500, "lambdaFilter": 0.94, "floor": 0.000025, "alpha": 0.06, "beta": 0.93, "zclip": 8, "vcap": 4, "limit": 0.3, "drift": 0, "demean": true},
  "rng": {"bitGenerator": "PCG64DXSM", "seedHex": "…16자리…", "stream": "board-kr"},
  "input": {"file": "public/data/input.json", "sha256": "…", "stocks": 365, "days": 500, "from": "2024-09-12", "to": "2026-10-08"},
  "alloc": {"base": 20000, "extra": 5400000, "threshold": -0.5, "cap": 200000, "rule": "추가 몫 ∝ se.cvar5 ÷ (|cvar5 − (−0.5)| + se.cvar5) · 한 곳 20만 개까지 · 남는 몫은 못 채운 곳에 고르게"},
  "paths": {"target": 10000000, "done": 10000000, "nonfinite": 0, "extreme": 402, "clampedLimit": 731179, "clampedVol": 13033},
  "rows": [{"code": "181710", "n": 27397, "nBase": 20000, "nExtra": 7397, "nonfinite": 0, "extreme": 4, "clamped": 4067,
            "mean": 0.104, "median": -0.033, "ploss": 0.533, "q05": -0.507, "q10": -0.416, "q90": 0.725, "cvar5": -0.606,
            "se": {"mean": 0.0021, "ploss": 0.003, "q05": 0.0025, "cvar5": 0.0029}, "volNow": 0.76, "vol2y": 0.61}]
}
```
값은 비율(0.104 = +10.4%) · 소수 여섯째 자리. `paths.target` 은 그 판 몫(두 판 합 = 20,000,000).

### 가리키는 파일 `public/data/atlas11/mc/<place>/latest.json`

```json
{"schema": "atlas11-mc-latest-1", "runId": "…", "file": "public/data/atlas11/mc/kr/<runId>.json", "asOf": "2026-10-08", "inputSha256": "…", "made": "…"}
```

### 회차 기록 `reports/atlas11/rounds/<runId>.json` (schema `atlas11-round-1`)

```json
{"schema": "atlas11-round-1", "runId": "…", "slot": "hand", "date": "2026-10-10", "startedAt": "…", "endedAt": "…",
 "boards": {"kr": {"asOf": "…", "file": "…", "paths": {…}}, "us": {…}},
 "paths": {"target": 20000000, "done": 20000000, "nonfinite": 0, "reproRuns": 0},
 "time": {"loadSec": 0.9, "simSec": 11.0, "peakRssMb": 231, "cpu": 2},
 "verify": null, "published": false}
```
`verify` 칸은 Task 4 의 검사 요약이 채운다: `{"checks": {"made": n, "ran": n, "pass": n, "fail": n, "error": n, "notRun": n}, "file": "reports/atlas11/rounds/<runId>.verify.json"}`.

### 소거 1판 `lens.elim` (schema `atlas11-elim-1`)

```json
{"schema": "atlas11-elim-1", "rules": "elim-rules-1", "at": "…", "place": "kr", "asOf": "…", "calibrated": false,
 "counts": {"pass": 0, "hold": 0, "out": 0},
 "rows": [{"code": "…", "name": "…", "state": "pass|hold|out", "first": "close|…|null", "flags": ["tail"],
           "checks": [{"id": "close", "stage": 1, "label": "마감 가격", "data": "…", "value": "…", "verdict": "pass|hold|out|na", "recheck": "…"}]}]}
```

검사 id(차례 고정): stage 1 — `close` 마감 가격 · `stale` 오래된 가격 · `ca` 기업행사 · `history` 분석 입력 · `liquidity` 거래 가능성(지금 자료 없음 → `na`) · `profit` 흑자 · `risk` 위험 공시 / stage 2 — `paths` 경로 수 · `converge` 수렴 · `tail` 하락 위험(표시만).
판정 모으기: `out` 하나라도 → out · 아니면 `hold` 하나라도 → hold · 아니면 pass. `na` · `tail`(calibrated=false)은 판정에 넣지 않음.

---

### Task 1: 엔진 `scripts/atlas11/mc/fhs_crn.py`

**Files:** Create `scripts/atlas11/mc/fhs_crn.py` · Create `tests/atlas11/mc.test.mjs`

**Interfaces:**
- Produces: CLI `python3 scripts/atlas11/mc/fhs_crn.py --run-id <id> --slot <slot> [--total 20000000] [--base 20000] [--h 60] [--places kr,us] [--out-root .] [--codes kr:181710,us:BWLP]` → 판마다 결과 파일 + latest.json + 회차 기록. stdout 마지막 줄 = 회차 기록 JSON.
- `--codes` 는 재현 검사용(그 회사만 다시 셈 · 파일을 쓰지 않고 stdout 으로 rows 만).

- [ ] **Step 1: 시험 먼저** — `tests/atlas11/mc.test.mjs`(node:test). 작은 수(`--total 73000 --base 100`)로 임시 폴더(`--out-root` 는 저장소 사본이 아니라 결과 쓰는 뿌리 · 입력은 저장소에서 읽음)에 돌린다.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root = process.cwd();
const run = (args) => spawnSync('python3', ['scripts/atlas11/mc/fhs_crn.py', ...args], {cwd: root, encoding: 'utf8', maxBuffer: 1e8});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-'));
const r1 = run(['--run-id', 'test-hand-00000000', '--slot', 'hand', '--total', '73000', '--base', '100', '--out-root', tmp]);
test('엔진이 끝까지 돌고 회차 기록을 낸다', () => {
  assert.equal(r1.status, 0, r1.stderr);
  const rec = JSON.parse(r1.stdout.trim().split('\n').at(-1));
  assert.equal(rec.schema, 'atlas11-round-1');
  assert.equal(rec.paths.target, 73000);
  assert.equal(rec.paths.done + rec.paths.nonfinite, 73000);
});
test('판 결과 — 경로 셈 · 분위수 차례 · 기울기 0 표시', () => {
  for (const place of ['kr', 'us']) {
    const ptr = JSON.parse(fs.readFileSync(path.join(tmp, `public/data/atlas11/mc/${place}/latest.json`), 'utf8'));
    const res = JSON.parse(fs.readFileSync(path.join(tmp, ptr.file), 'utf8'));
    assert.equal(res.schema, 'atlas11-mc-2'); assert.equal(res.model.drift, 0); assert.equal(res.model.demean, true);
    assert.equal(res.rows.reduce((s, x) => s + x.n + x.nonfinite, 0), res.paths.target);
    for (const x of res.rows) {
      assert.equal(x.n + x.nonfinite, x.nBase + x.nExtra);
      assert.ok(x.q05 <= x.q10 && x.q10 <= x.median && x.median <= x.q90, x.code);
      assert.ok(x.cvar5 <= x.q05 + 1e-12, x.code);
      assert.ok(x.ploss >= 0 && x.ploss <= 1);
    }
    assert.equal(res.model.limit, place === 'kr' ? 0.3 : null);
  }
});
test('같은 회차 ID 면 결과가 똑같다(재현 — 새 경로로 세지 않음)', () => {
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-'));
  const r2 = run(['--run-id', 'test-hand-00000000', '--slot', 'hand', '--total', '73000', '--base', '100', '--out-root', tmp2]);
  assert.equal(r2.status, 0, r2.stderr);
  for (const place of ['kr', 'us']) {
    const a = JSON.parse(fs.readFileSync(path.join(tmp, `public/data/atlas11/mc/${place}/test-hand-00000000.json`), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(tmp2, `public/data/atlas11/mc/${place}/test-hand-00000000.json`), 'utf8'));
    assert.deepEqual(a.rows, b.rows);
  }
});
```

- [ ] **Step 2: 시험이 실패하는지 본다** — Run: `node --test tests/atlas11/mc.test.mjs` · Expected: FAIL(파일 없음).

- [ ] **Step 3: 엔진 쓰기** — 작업 방 실측 원본 `bench2.py`(MODEL=bounded 갈래)를 그대로 옮기고 아래를 더한다.
  1. 판마다 따로: `ss = SeedSequence(int(sha256(runId)[:16],16)); kids = ss.spawn(2)` → kids[0]=kr · kids[1]=us · 판 안에서 `kid.spawn(2)` = [채움(빈 날 잔차), 날짜].
  2. 배분 두 걸음: 기본 `base` 개(모든 회사) → 기본 결과로 `b_i = se.cvar5_i / (|cvar5_i + 0.5| + se.cvar5_i)` → 추가 합계 `extra = total − base × n`(두 판 합 기준 · 판마다 회사 수 비례로 나눔) 를 `b_i` 비례로 · 한 곳 `cap = min(200000, 10 × base)` · 넘친 몫은 못 채운 곳에 고르게(정수 · 합이 정확히 맞게). 추가 경로는 같은 날짜 흐름의 다음 번호(`D[:, base: base + extra_i]`) — 같은 번호는 모든 회사가 같은 날짜.
  3. 회사마다: 기본 + 추가 경로를 합쳐 통계(평균 · 가운데 · 손실 비율 · q05 · q10 · q90 · cvar5 · 표준오차(평균 · 손실 비율 = √(p(1−p)/n) · q05 · cvar5 = 10묶음 묶음 평균법)) · nonfinite · extreme · clamped(가격 제한 또는 흔들림 위 끝에 한 번이라도 닿음).
  4. 쓰기: `<out-root>/public/data/atlas11/mc/<place>/<runId>.json`(이미 있으면 `FileExistsError` — 덮어쓰지 않음) · `latest.json`(바꿔 씀) · `<out-root>/reports/atlas11/rounds/<runId>.json`(이미 있으면 멈춤). 입력 지문 = 입력 파일 바이트의 sha256.
  5. `--codes` 모드: 지정 회사만 같은 셈(같은 D · 같은 배분이 필요하므로 배분은 `--alloc-from <판 결과 파일>` 의 nBase · nExtra 를 씀) → stdout `{"repro": rows}` · 파일 안 씀.

- [ ] **Step 4: 시험 통과 확인** — Run: `node --test tests/atlas11/mc.test.mjs` · Expected: PASS 3.

- [ ] **Step 5: 실제 크기 한 번** — Run: `python3 scripts/atlas11/mc/fhs_crn.py --run-id <오늘 hand ID> --slot hand` · Expected: 두 판 합 done = 20,000,000 · nonfinite 0 · simSec 약 11~20초 · peakRss 약 300MB 안쪽.

### Task 2: 소거 1판 `lib/atlas11/elim.mjs`

**Files:** Create `lib/atlas11/elim.mjs` · Create `tests/atlas11/elim.test.mjs`

**Interfaces:**
- Consumes: 판 읽기 종목 `lens.stocks[]`(`code · name · status('ok'|'late'|'stale'|…) · date · fund{op, net, fy} · lag`), 후보 `lens.cand`(`flags[code]` 6글자 = 그날 종가 · 흑자 · 위험 공시 없음 · 1년 추세 셈 · 그물 안 · 초입, `checks` 는 7곳만), 일정 `agenda.byCode[code].disclosures[]`(한국), 몬테카를로 `lens.mc.rows`(없으면 null).
- Produces: `export const ELIM_RULES` · `export function elimOf({place, asOf, at, stocks, cand, agendaByCode, mc, calibrated = false, rules = ELIM_RULES})` → 위 `atlas11-elim-1` 모양.

- [ ] **Step 1: 시험 먼저** — 판정 하나씩:
  - 그날 종가 있음(status 'ok' · date === asOf) → close pass / status 'late' → close **hold**(recheck 「다음 회차에 확정 가격이 오면」) / status 'stale' → stale **hold**(「거래 재개 뒤 5거래일」).
  - 한국: 최근 20거래일 안 하루 ±30% 넘는 변화 표시(stocks[].jumps 또는 status 'ca') → ca **hold**.
  - flags[3]==='0'(1년 추세 셀 수 없음) → history **hold**.
  - liquidity → 늘 `na`(「20거래일 거래대금 자료 없음 — 수집 먼저」) · 판정에 넣지 않음.
  - 흑자: op>0 && net>0 → pass / 둘 다 숫자인데 아님 → **out** / 하나라도 없음 → **hold**(미국 8곳 포함 — 옛 「탈락」을 「보류」로).
  - 위험 공시: 한국 — 30일 안 · 장 마감 전 `EXCLUDE_RE`(cand.mjs 그대로 import) 맞는 공시 → **out**(recheck 「해제 공시 확인」) · 없으면 pass / 미국 — 공시 원문 자료 없음 → **hold**(「SEC 공시(8-K) 자료를 모으면 다시 봄」).
  - paths: mc 없음 → **hold**(「다음 회차 몬테카를로」) · n ≥ 20000 && nonfinite === 0 → pass.
  - converge: se.ploss ≤ 0.005 && se.cvar5 ≤ 0.005 → pass · 아니면 **hold**(「추가 배분 뒤」).
  - tail: cvar5 < −0.5 → flags 에 'tail' · calibrated=false 이면 판정 그대로(verdict 'na' · value 에 값 · recheck 「모형이 별도 구간 시험을 통과하면 이 기준으로 보류」) · calibrated=true 이면 **hold**.
  - 모으기: out > hold > pass · `first` = 차례상 처음 pass 아닌 검사 id.
- [ ] **Step 2: 실패 확인** — `node --test tests/atlas11/elim.test.mjs` → FAIL.
- [ ] **Step 3: 구현** — 순수 함수 · 글은 쉬운 한국어 · 금지 낱말 없음. `counts` 는 rows 에서 셈.
- [ ] **Step 4: 통과 확인** — PASS.

### Task 3: 판 읽기에 붙이기 `scripts/atlas11/lens/build.mjs`

**Files:** Modify `scripts/atlas11/lens/build.mjs` (lensFrom 끝 · `checkLens` 앞) · Test: `tests/atlas11/lens.test.mjs` 에 한 칸 더함(있는 시험은 고치지 않음)

**Interfaces:**
- Consumes: Task 1 `latest.json` · 판 결과 · Task 2 `elimOf`.
- Produces: `lens.mc = {runId, made, model, alloc, paths, asOf, rows: [{code, n, nonfinite, extreme, mean, median, ploss, q05, q10, q90, cvar5, se, volNow}]}` 또는 `{none: true, why}`(기준일이 다름 · 입력 지문이 다름 · 파일 없음) · `lens.elim`.

- [ ] Step 1: 시험 — 임시 뿌리에 가짜 latest(기준일 다름)를 두면 `lens.mc.none === true` · `why` 에 「기준일」.
- [ ] Step 2: 구현 — `latest.json` 을 읽고 `asOf === lens.asOf` 이고 `inputSha256 === sha256(입력 파일)` 일 때만 붙임. 소거는 `elimOf({place, asOf: lens.asOf, at: made, stocks: lens.stocks, cand: lens.cand, agendaByCode: agenda?.byCode ?? null, mc: lens.mc.none ? null : lens.mc, calibrated: false})`.
- [ ] Step 3: `npm run atlas11:test` 전부 통과(있는 시험 하나도 깨지지 않음).

### Task 4: 따로 다시 세는 검사 둘

**Files:** Create `scripts/atlas11/verify/mc_verify.mjs` · Create `scripts/atlas11/verify/elim_verify.py`

**4a mc_verify.mjs (L1 — 다른 언어 · 다른 난수 · 같은 명세)**
- 입력: `--run <reports/atlas11/rounds/<runId>.json>`.
- 성질 검사(모든 회사 · 판마다): 경로 합 = target · n + nonfinite = nBase + nExtra · q05 ≤ q10 ≤ median ≤ q90 · cvar5 ≤ q05 · 0 ≤ ploss ≤ 1 · 값이 모두 유한 · model.drift === 0 · 한국 limit 0.3 · 미국 null.
- 다시 뽑기(표본): 판마다 후보 7곳 + 씨앗(회차 ID)으로 고른 13곳 = 20곳 · 회사마다 40,000경로 · 모형을 JS 로 처음부터(입력 종가 → 로그수익 → 거르기 → 잔차 → 평균 빼기 → ±8 자름 → 흔들림 셈 → 한국 ±30%) · 난수 = mulberry32(회차 ID FNV 씨앗 + 회사 차례) · 비교: ploss · q05 · cvar5 차이 ≤ 4 × √(se_prod² + se_js²) · 평균 차이 ≤ 5 × √(…).
- 쓰기: `reports/atlas11/rounds/<runId>.verify.json` 의 `mc` 칸 — 검사마다 `{id, step: '⑧', level: 'L1'|'L2', target, version, input: {file, sha256}, expect, result: 'pass'|'fail'|'error', value, at}` · 요약 `{made, ran, pass, fail, error, notRun}`.

**4b elim_verify.py (L1 — 원자료에서 다시 판정)**
- 입력: `--lens <lens.json> --place kr|us` · 원자료(`public/data/input.json` 또는 미국 입력 · 판 `agenda.json`).
- 다시 판정: close/stale(마지막 종가 날짜와 기준일 · 거래일 달력) · ca(한국 · 최근 20거래일 하루 ±30%) · history(272거래일) · profit(입력 결산 op · net) · risk(한국 · 정규식을 다시 적음 — 명세 사본 · 30일 · 마감 전) — 회사마다 검사마다 lens.elim 과 맞대 다른 곳 목록.
- 쓰기: 같은 verify 파일의 `elim` 칸(같은 모양).

### Task 5: 기록과 회차 돌리기

**Files:** Modify `docs/ATLAS_원칙.md`(규칙 49 덧붙임) · `CLAUDE.md`(한 줄) · `config/atlas11/no-prediction.json`(`lifted` 칸 더함 — 옛 `order` 그대로) · `reports/atlas11/full-check/trans-waiver.json`(`until` 2026-11-30 · `said` 에 05:14 말씀 더함 · `extended` 기록) · Create `scripts/atlas11/round.mjs`

- `round.mjs --slot hand|08|12|16|21 [--total 20000000]`: 회차 ID 만들기 → 엔진 → 두 판 판 읽기(`lensFrom`)를 임시로 써 둠 → mc_verify · elim_verify → 회차 기록의 `verify` 채움(새 파일 `<runId>.json` 은 엔진이 썼으므로, 검사 요약은 `<runId>.verify.json` 에 · 회차 기록은 고치지 않고 `reports/atlas11/rounds/latest.json` 에 요약 한 줄).
- 규칙 49 글: 사장님 말씀 원문 일곱 줄 + 정한 것(08 · 12 · 16 · 21시 · 차례는 새 가격 회차만 · 위험 기준 표시만 · 7개의 왜 71개/판 · 사장님 몫 해결) + 1단계 파일 이름.

## Self-Review

- 설계 보고 ⑤(단위 · 배분 · 모형 · 입력 · 출력 · 수렴 · 재현) → Task 1 · ⑥(통과 · 보류 · 제외 · 다시 보는 조건) → Task 2 · ⑦의 회차 ID · 기록 → Task 1 · 5 · ⑧ 11단계의 ⑥⑦⑧ 따로 세기 → Task 4.
- 화면 · 자동 3D · 하루 4번 예약 · 100만 건 · 7개의 왜 = 2~4단계(이 계획 밖).
