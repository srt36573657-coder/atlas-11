# 3단계 · 4시간 고리 (`atlas4h/loop/`)

명령문 `<고리 — 4시간마다 한 바퀴>` 그대로의 순서로 한 바퀴를 돈다:
모으기 → 검사 → 가운데·폭 엔진 → 사건 확률(「없음」 · 5단계) → 섞기·범위 → 시나리오 → 합치기·반론(「없음」 · 5단계) → 봉인·적용 → 기록.

| 파일 | 하는 일 |
|---|---|
| `run.mjs` | 고리 한 바퀴. `node atlas4h/loop/run.mjs [--slot auto\|00…20] [--root DIR] [--now ISO] [--fixtures DIR] [--stop true\|false]` |
| `watch.mjs` | 감시 한 줄(고리마다). `by` = 「감시 스크립트」. 기계로 잴 수 있는 것만 숫자, 판단 줄은 「잴 수 없음 — 다른 에이전트 몫」 |
| `cron-lines.md` | 사장님이 GitHub 화면에서 예약 시각을 넣는 법(봇은 `schedule:` 을 넣지 않는다) |
| `test/` | 가짜 저장소(값은 모두 [예시])로만 도는 시험 열 개 — `bash atlas4h/harness/start.sh` 가 돌린다 |
| `.github/workflows/atlas4h-loop.yml` | 단추(workflow_dispatch)만: 모으기(`collect.mjs --mode now`) → `run.mjs` → `watch.mjs` → `atlas4h/ledger`·`atlas4h/raw` 만 커밋 |

## 정한 규칙 (코드 주석과 같음)

- 판 시각: `auto` = 지금(한국)보다 늦지 않은 가장 늦은 판 시각. 늦음 = 지금 − 판 시각. **판 시각부터 40분**이 넘으면(시작 때·검사 뒤·엔진 뒤·봉인 전 네 번 잼) 새로 셈하지 않고 「시간 초과 → 앞 판 유지」 판(앞 판 값 그대로 · `keepOf`)을 봉인하고 고리 한 줄은 남긴다. 앞 판이 없으면 판 없이 고리 한 줄만.
- 무거운 = 08·16시, 가벼운 = 나머지(기록만 다름 — 둘 다 아래 「변수 그대로」 규칙을 그대로 쓴다. 명령문에 예외가 없다).
- 「변수 그대로」: 마지막으로 새로 셈하거나 다시 봉인한 판(「시간 초과」 판 빼고)과 ① 목표일이 같고 ② 변수 id 목록이 같고 ③ 변수마다 값·상태·관측 시각이 모두 같으면 → 계산 없이 그 판의 값·상수·두 길을 그대로 「변수 그대로 → 앞 판 다시 봉인」(`resealOf`)으로 봉인한다. 변수는 이번에 다시 받은 것(받은 시각·「옛값」 표시만 새것)이라 `engine(inputs)` 가 같은 값을 낸다(T4).
- 출발일·목표일 = 「봉인 뒤 첫 종가」(board.md): 출발일 = 판 시각 전에 15:30 종가가 난 마지막 거래일, 목표일 = 판 시각 뒤 첫 거래일 종가. [판단] 12시 판은 그날 종가가 목표다(`clock.mjs slotPlan` 의 [미결] 「다음 날」 대신) — 장중 값은 수집기가 「확인 중」으로 두므로 출발값은 앞 거래일 종가.
- 출발값의 일관성: 종목 지난 종가는 `public/data/input.json`(ATLAS 11 파일 · 읽기만), 그 뒤 거래일 종가는 고리 장(`atlas4h/ledger/inputs/*.json`)에서 이어 붙인다 — 바로 앞 거래일 줄이 있을 때만. 같은 날 값이 input.json 과 장(또는 장끼리)에서 다르면 그 종목은 「확인 중」 → 판에서 「없음」. 장 값은 「ok」·「한 출처」, 그리고 [판단] 「장 닫힘」만 붙은 「옛값」(4시간 지난 15:30 종가)만 쓴다. 「확인 중」·「없음」·「끊김」은 안 쓴다. 판은 재현(`retro/run.mjs`)과 같은 `buildInputs`·`buildBoard` 로 짓는다(시험 「16시 판 = 재현 방법의 판」).
- input.json 줄 중 받은 시각(`observedAt`)이 봉인 뒤인 줄과 그 뒤 줄은 쓰지 않는다(흉내·되돌려 돌리기 때만 생김 · T2).
- 멈춤 단추: `atlas4h/harness/stop.json` `{"stop": true, …}` 또는 workflow 입력 `stop` → 그림자 운전. 6단계(화면)가 아직 없어 **모든 바퀴가 그림자**다(`mode: "그림자"`). 화면 파일은 어느 경우에도 건드리지 않는다.

## 장부 (모두 덧붙이기만 · `atlas4h/ledger/<종류>/<한국 날짜>.jsonl`)

`boards`·`seals`·`scores`·`loops`·`watch` 꼴은 `atlas4h/spec/board.md`. 고리가 더한 것:

- **`baselines/` (새 종류 · T 시험은 읽지 않음)** — 판마다 봉인 때 한 줄: `{schema: "atlas4h-baselines-1", boardId, slot, sealedAt, target, anchorDate, units: {종목 코드|kospi: {anchor, 무판, 단순 전이식, ATLAS 11}}}`.
  - 무판 = 출발값 + 봉인 때 아는 지난 250거래일 하루 변화율의 19개 분위수(+ 오름·보합·내림 몫).
  - 단순 전이식 = 08시 판만(judgment · conflicts 16 · judgment-2). 반도체지수 지난 자료(`atlas4h/data/history/sox.json`)가 없으면 「없음」 + 까닭. 그 밖 시각은 「없음」 + 까닭.
  - ATLAS 11 = `public/data/atlas11/forecast.json` 의 지금 발행본과 그 안의 `previous` 중 **봉인 시각 전에 나온** 마지막 발행본의 같은 목표일 1거래일 전망 p10·p50·p90(judgment 「1거래일 전망」). 없으면 「없음」 + 까닭. 16시 판은 「없음」(17시 뒤 발행). 코스피는 ATLAS 11 없음(judgment units.kospi).
  - 채점은 이 줄의 값으로 한다(채점 때 자료를 다시 읽어 기준을 새로 세지 않음 — conflicts 22).
- `scores/` — 목표 종가가 「목표일 15:30 뒤에 받은 고리 장」에 쓸 수 있는 상태로 나온 판·대상만, 대상마다 한 줄(`boardId`·`code`). 같은 `boardId|code` 는 다시 쓰지 않는다. `scoredAt` = 실제 채점 시각, `actual {value, asOf, source, status, snapshot}`, 위기 날은 judgment 대로(코스피 지난 자료가 없으면 `crisis: null` + `crisisWhy`). 파일 날짜 = 채점한 날.
- `loops/` — board.md 꼴 + `slotAt`·`kind`(무거운/가벼운)·`mode`(그림자)·`stop`·`lateMinutes`(시작 − 판 시각)·`minutes`(끝 − 판 시각, 40분 규칙의 잣대)·단계별 한 줄(`steps`)·`structures`·`by: "고리 스크립트"`. `startedAt`·`endedAt` 은 실제 시각(T9 는 이 둘의 차를 잰다).
- `watch/` — S1·S2·S4·S7 은 숫자, S3·S5·S6·S8·S9·S10 은 「잴 수 없음 — 다른 에이전트 몫」. 곁 확인: 봉인 지문 · 금지 말 · 장부에서 지워진 줄 수(깃 HEAD 와 견줌). **그래서 T23 은 다른 에이전트 감시가 판단 줄을 채우기 전에는 통과하지 않는다** — 일부러 0 으로 채우지 않았다.

## 아직 없는 것 (숫자가 없으면 「없음」)

- 사건 확률·합치기·반론·MinT·두 출처 이상 변수는 5단계. 코스피·반도체지수 지난 자료(`atlas4h/data/history/`)는 `atlas4h-collect` history 단추를 눌러야 생긴다 — 그 전에는 코스피 판·전이식·위기 날이 「없음」.
- [미결] ATLAS 11 발행이 10/30 에 끝나면 input.json 의 종목 종가도 더 늘지 않을 수 있다. 그 뒤 출발값은 고리 장에서만 이어 붙는다(바로 앞 거래일 줄이 있어야 함). HAR 는 지난 524개 등락을 쓰므로 자료 끊김이 생기면 그 종목은 「없음」이 된다.
- 고리 한 바퀴가 받은 장은 `atlas4h/ledger/inputs/` 에 쌓인다(수집기). 지난 자료 새로 받기(history)는 고리에 넣지 않았다 — 무거운 바퀴에서 3년 치를 다시 받으면 40분 규칙을 넘길 수 있어서다.
