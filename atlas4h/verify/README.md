# 독립 흠 심기 (감시 S8)

시험(T1~T23)을 만든 일꾼이 아닌 **다른 일꾼**이 흠을 심어 봤습니다.
흠은 사양 글(10-spec · 11-extremes · 02-watch · 13-command · spec/board.md · seal/judgment.json)만 보고 만들었습니다.
시험 코드 본문(checks.mjs 40줄 아래)과 기존 시험 파일은 읽지 않았습니다.

- 돌리기: `node atlas4h/verify/independent-defects.mjs` → `independent-defects.json` 을 새로 씁니다.
- 바탕: `atlas4h/spec/fixtures/good` (좋은 기록). 흠 하나 = 깊은 복사본에 고친 곳 하나.
- 잡음 = 시험이 「안 통과」. 놓침 = 「통과」.
- T11 은 순수 함수 `checkOldEngineUntouched` 에 바뀐 파일 목록을 직접 넣었습니다(경로는 a9187c6 에 실제 있던 파일).
- T12·T13·T19 는 좋은 기록에 재료가 없어, 제가 만든 좋은 재료(재현 20줄 · 채점 30+위기 2 · 커밋 시각)가 먼저 통과하는 것을 확인하고 흠을 심었습니다.
- T4·T15·K1~K7 은 엔진이 있어야 해서 이번에는 뺐습니다.
- `contested: true`(다툼) = 사양 글이 그 흠까지 덮는지 읽는 사람마다 갈릴 수 있는 것. `summary.strict` 는 이것을 뺀 셈입니다.
- `probes` = 흠이 아닌 정상 글·정상 재료로 시험이 헛잡는지 본 것(셈에 안 넣음).
