# ATLAS 4시간 예측 엔진 (atlas4h)

사장님 명령문(2026-10-01 17:06 KST 첨부, sha256 `ffe9b40d…0b58c`)으로 세우는 새 엔진입니다.
옛 엔진(ATLAS 11: `lib/atlas11`·`scripts/atlas11`·`config/atlas11`·기록 장부)은 고치지도 덮지도 않습니다. 이 엔진의 파일은 모두 이 폴더 안에 둡니다.

| 칸 | 무엇 | 명령문 번호 |
|---|---|---|
| `command/` | 명령문 원문 그대로 + 칸마다 나눈 파일 + `index.json`(칸별 sha256) | 첫 실행 1 |
| `harness/` | 진행 장부·통과 목록·깃 기록 규칙·넘겨주기 쪽지·시작 스크립트 | 첫 실행 2 |
| `workers/` | 일꾼 넷(바탕·고리·평가·감시)의 역할 — 정의 파일은 `.claude/agents/atlas4h-*.md` | 첫 실행 2 |
| `sources/` | 원문을 읽고 쓸지 정한 기록 | 첫 실행 3 |
| `data/` | 자료 약속과 변수 출처 목록 | 첫 실행 4 |
| `spec/`·`tests/` | 판 형식과 사양 T1~T23·극한 K1~K7 시험 코드 | 첫 실행 5 |
| `seal/` | 첫 채점 전에 봉인한 판정 기준과 시도 장부 | 첫 실행 6 |
| `scripts/` | 검사 도구(`check_command.mjs` 등) | — |

일할 때는 필요한 칸 파일만 다시 읽습니다(명령문 자료 2~3줄). 다음 고리는 `harness/handoff.md` 와 `harness/progress.json` 부터 읽습니다.
