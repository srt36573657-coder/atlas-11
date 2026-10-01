# 판(봉인) 형식 · atlas4h-board-1

4시간마다 엔진이 내는 「판」 하나의 꼴입니다. 시험 코드(T1~T23·K1~K7)는 이 꼴만 보고 잽니다.
모든 기록은 덧붙이기만 합니다(JSON 한 줄 = 기록 하나). 고치지도 지우지도 않습니다.

## 기록 파일 (모두 `atlas4h/ledger/` 아래 · 날짜는 KST)

| 파일 | 한 줄 = | 쓰는 시험 |
|---|---|---|
| `boards/YYYY-MM-DD.jsonl` | 봉인한 판 하나 | T1~T8·T10·T14·T16·T17·T18·T21·T22 |
| `seals/YYYY-MM-DD.jsonl` | 봉인 기록 `{boardId, sealedAt, sha256, commit}` — `sha256` = 판을 「정렬 직렬화」한 글자의 sha256 | T1·T2·T19 |
| `scores/YYYY-MM-DD.jsonl` | 판 하나의 채점(봉인 뒤 첫 종가) | T12·T13·T19 |
| `loops/YYYY-MM-DD.jsonl` | 고리 한 바퀴의 시작·끝·상태 | T9 |
| `watch/YYYY-MM-DD.jsonl` | 고리 한 바퀴의 감시 S1~S10 | T23 |
| `atlas4h/seal/trials.jsonl` | 시도 하나(봉인 뒤 결과까지) | T20 |

「정렬 직렬화」 = 객체의 키를 가나다·알파벳 순으로 정렬해 `JSON.stringify` 한 글자(빈칸 없음). 숫자는 그대로.

## 판 하나 (boards)

```json
{
  "schema": "atlas4h-board-1",
  "id": "4h-20261002-08-1a2b3c4d",
  "slot": "08",
  "kind": "무거운",
  "trigger": null,
  "createdAt": "2026-10-02T08:00:05+09:00",
  "sealedAt": "2026-10-02T08:31:40+09:00",
  "dataCutoff": "2026-10-02T08:31:40+09:00",
  "target": {"date": "2026-10-02", "what": "봉인 뒤 첫 종가"},
  "status": "봉인",
  "code": {"commit": "abc1234", "dirty": false},
  "dataVersion": {"sha256": "…", "files": ["atlas4h/ledger/inputs/2026-10-02T08.json"]},
  "seed": 20261002,
  "inputs": {
    "variables": [
      {"id": "sox", "value": 5321.4, "observedAt": "2026-10-02T05:00:00+09:00", "fetchedAt": "2026-10-02T08:00:21+09:00", "status": "ok",
       "sources": [{"name": "네이버 .SOX", "url": "…", "value": 5321.4, "observedAt": "…", "rawSha256": "…"},
                   {"name": "…", "url": "…", "value": 5321.1, "observedAt": "…", "rawSha256": "…"}]}
    ],
    "constants": {"version": "c-20261001-16", "sha256": "…", "measuredAt": "2026-10-01T16:40:00+09:00"}
  },
  "engines": [
    {"id": "center-nochange", "role": "가운데", "weight": 1, "inputs": ["kospi", "sox"], "sawPreviousBoard": false},
    {"id": "width-har", "role": "폭", "weight": 0.6, "inputs": ["kospi"], "sawPreviousBoard": false}
  ],
  "kospi": {
    "anchor": {"value": 2650.1, "asOf": "2026-10-01T15:30:00+09:00"},
    "center": 2652.0,
    "quantiles": {"p10": 2611.0, "p25": 2633.0, "p50": 2652.0, "p75": 2670.0, "p90": 2690.0},
    "direction": {"up": 0.41, "flat": 0.18, "down": 0.41},
    "scenarios": [
      {"name": "위", "premise": "…", "kospi": {"low": 2670.0, "high": 2720.0}, "prob": 0.25, "invalidator": "…"},
      {"name": "가운데", "premise": "…", "kospi": {"low": 2633.0, "high": 2670.0}, "prob": 0.5, "invalidator": "…"},
      {"name": "아래", "premise": "…", "kospi": {"low": 2580.0, "high": 2633.0}, "prob": 0.25, "invalidator": "…"}
    ],
    "tail": [{"what": "유가 하루 5% 급등", "kospiPct": -7.1, "watch": "WTI"}]
  },
  "stocks": [{"code": "005930", "center": 61200, "quantiles": {"p10": 60100, "p50": 61200, "p90": 62300}}],
  "reconciliation": {"method": "MinT", "nodes": ["kospi", "005930", "…", "나머지"], "maxGap": 0.0},
  "twoPath": [{"what": "코스피 가운데 값", "pathA": 2652.0, "pathB": 2652.0, "tolerance": 0.5, "agree": true}],
  "events": [{"name": "미국 고용지표", "at": "2026-10-02T21:30:00+09:00", "pGood": 0.4, "pBad": 0.35,
              "impact": {"good": 0.6, "bad": -2.1}, "agents": 6, "leakCheck": {"checked": 42, "postSealHits": 0}}],
  "llm": {"used": true, "model": "claude-…", "trainingCutoff": "2026-06-30"},
  "structures": ["A1", "B1", "B2", "C3", "D5", "E1", "F1"],
  "screen": {"value": 2652.0, "boardTime": "08시 판", "chance": "보통 · 위 25% · 가운데 50% · 아래 25%", "why": {"variable": "sox", "sharePp": 0.8}},
  "text": ["반도체지수가 밤새 0.8% 올라 가운데 값을 0.3% 올렸습니다."]
}
```

### 칸마다 지킬 것

- `status`: 「봉인」 · 「시간 초과 → 앞 판 유지」 · 「변수 그대로 → 앞 판 다시 봉인」 중 하나.
- `inputs.variables[]`: 값마다 `observedAt`·`fetchedAt`·출처 둘(`sources` 2개). 출처가 하나면 `status` 「한 출처」, 4시간이 넘었으면 「옛값」, 두 출처가 어긋나면 「확인 중」(계산에 안 씀), 값이 없으면 「없음」(`value: null`). 0으로 채우지 않는다.
- `observedAt`·`fetchedAt`(출처 것 포함)은 모두 `sealedAt` 이하. 봉인 뒤 자료는 없다(T2).
- `kospi.scenarios`: 「위」「가운데」「아래」 정확히 셋, `prob` 합 = 1(T5). 각자 `invalidator`(틀렸다는 표시) 하나.
- `reconciliation`: 코스피는 52종목의 합이 아니므로 「나머지」 마디를 둔다. `maxGap` = 맞춘 뒤 위·아래 마디의 어긋남 최댓값(T6).
- `twoPath`: 같은 숫자를 두 길로 센 것. 어긋나면 `agree: false` 이고 그 숫자는 화면에 「확인 중」(T8).
- `engines[]`: `sawPreviousBoard`는 모두 `false`(T21). 「가운데」 후보 중 무판을 못 이긴 것은 `weight: 0`(T16 · 근거는 `atlas4h/seal/weights.json`).
- `events[].leakCheck.postSealHits` = 0(T17).
- `llm.trainingCutoff`: 재현(지난 기록으로 돌린 판)에서는 `target.date` 가 이 날보다 뒤여야 한다(T18).
- `structures`: A~F 여섯 칸에서 하나 이상씩(감시 S1·S2 · T22).
- `text`·`screen.chance` 등 사람이 읽는 글에는 금지 말(사라·팔라·추천·목표가·확실·보장·무조건)이 없다(T10).

## 채점 한 줄 (scores)

```json
{"boardId": "4h-20261002-08-1a2b3c4d", "target": "2026-10-02", "scoredAt": "2026-10-02T15:41:00+09:00",
 "actual": {"value": 2661.3, "asOf": "2026-10-02T15:30:00+09:00", "source": "…"},
 "crps": 9.1, "interval": {"alpha": 0.2, "score": 41.0, "covered": true}, "brier": {"event": "up", "p": 0.41, "o": 1, "score": 0.3481},
 "baselines": [{"id": "무판", "crps": 10.2, "interval": 44.0, "brier": 0.36}, {"id": "단순 전이식", "crps": 9.8}, {"id": "ATLAS 11", "crps": null, "note": "없음"}],
 "crisis": false}
```

## 고리 한 줄 (loops) · 감시 한 줄 (watch)

```json
{"loopId": "loop-20261002-08", "slot": "08", "startedAt": "…", "endedAt": "…", "minutes": 31.6, "status": "ok", "boardId": "4h-20261002-08-1a2b3c4d"}
{"loopId": "loop-20261002-08", "at": "…", "by": "감시자", "S": {"S1": 0, "S2": 0, "S3": 0, "S4": 0, "S5": 0, "S6": 0, "S7": 0, "S8": 0}, "S9": {"caught": 0, "improved": null}, "S10": {"kept": 13, "of": 13}}
```
