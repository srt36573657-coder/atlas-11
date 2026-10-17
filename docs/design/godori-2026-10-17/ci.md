# 무거운 화면 검사 — 깃허브 여러 대 · 올리기 전 검사 (2026-10-17 · 규칙 76)

새 화면 모든 쪽 검사(`atlas11-next-full`)를 깃허브 실행기 18대가 함께 돌린다.
혼자 38분 걸리던 영어 검사(`en`)는 여섯 대(`en1` ~ `en6`)로 나눠 돌고 마지막에 하나로 합친다.
`local=true` 면 올리기 전에 그 가지를 실행기 안에서 묶어 띄우고 같은 검사를 돌린다(사이트에는 아무것도 안 올림).

## 돌리는 법

| 무엇 | 명령 |
|---|---|
| 올리기 전 검사(가지) | `git push origin <가지>` 뒤 `gh workflow run atlas11-next-full.yml -R srt36573657-coder/atlas-11 --ref <가지> -f local=true` |
| 지금 사이트 검사 | `gh workflow run atlas11-next-full.yml -R srt36573657-coder/atlas-11` (aaa7377.com 을 읽기만) |
| 몇 쪽만 | `-f pages=en,co,next` (쉼표 · 비우면 모두) |
| 영어를 더 잘게 | `-f en_shards=8` (1 ~ 12 · 기본 6) |
| 지켜보기 | `gh run list -R srt36573657-coder/atlas-11 --workflow atlas11-next-full.yml --limit 3` → `gh run watch <번호> -R srt36573657-coder/atlas-11` |

## 얼마나 걸리나 (깃허브 실측)

<!-- 아래 숫자는 실측으로 채움 -->

## 결과가 놓이는 곳

깃허브 실행 기록(아티팩트)은 이 기계에서 못 받는다 → 결과는 main 에 커밋된다: `git fetch origin main` 뒤 `git show origin/main:<길>`.

- 올리기 전: `reports/atlas11/probe/next-preview/` — 한 번에 한 판만(앞 판은 지움) · 커밋 글 `atlas11 probe next-preview <가지> <커밋> [skip ci]`
- 지금 사이트: `reports/atlas11/probe/next-full/` — 쪽마다 마지막 결과 · 커밋 글 `atlas11 probe next-full [skip ci]`
- `summary.json` — `ok` · `mode`(local · live) · `ref` · `sha` · `run` · `wallSeconds`(계획부터 모으기까지) · `pages[] = {name, code, seconds}`
  - `en` 은 한 줄: 몫이 모두 0 일 때만 0 · `seconds` = 가장 긴 몫 · `shards` · `codes` · `shardSeconds`
  - 끝 코드 99 = 결과 없음(작업이 끝나지 못함) · 98 = 시험 서버가 안 뜸(묶기 실패) · `build` = 묶고 띄운 초(local)
- 쪽마다 `<쪽>.json`(검사 결과) · `<쪽>.exit.json` · `<쪽>.tail.txt`(끝 4천 자) · `en.json` = 여섯 몫을 합친 것(`shards[]` 에 몫마다 줄 · `problems`)

## 영어 검사를 어떻게 나누나 (겹침 0 · 빠짐 0)

- 일감 = 길 하나씩(지금 약 13,400) + 묶음 둘 — `@tail`(누르기 → 바꿔치기 → 오늘 한 줄 문장 · 같은 창 · 이 차례) · `@newwin`(자료를 못 받는 새 창)
- 몫마다 같은 목록을 세우고 같은 정수 셈으로 가른다 → 일감 하나는 꼭 한 몫. 묶음은 끝 몫에, 길은 남은 무게에 비례해 섞어 나눔(`UNIT_W`).
- 모으기(`--merge`)가 맞대 본다: 몫 1 ~ n 이 한 번씩 · 같은 목록(`units.hash` · `total`) · 몫 일감 수 합 = 전체. 하나라도 어긋나면 `en` 실패(`problems`).
- 손으로 확인(브라우저 없음): `node scripts/atlas11/next/next_en_check.mjs --base <곳> --modules --dev 0 --all --list-only [--shard k/6]`

## local 묶기

1. plan 이 지금 사이트 자료(`/atlas/data/*` — 지금 2,573개)를 한 번만 받는다. 목록 · sha256 은 지금 사이트의 `dist-manifest.json` 으로 맞대고, 받는 사이 올림이 끼면 처음부터 한 번 더 받는다 → 모든 검사가 같은 판을 쓴다.
2. 검사마다: `npm ci --omit=dev` → `GITHUB_ACTIONS=false ATLAS_INSPECT_N=20000 node scripts/atlas11/package.mjs --no-full --out ../out`(가지의 화면 코드로 `dist/` · 종가를 새로 받지 않음 · 네 눈 점검은 짧게) → `dist/atlas/data` 를 1의 자료로 바꿈
3. `node scripts/atlas11/invite_dev.mjs --dir dist --port 8826 --owner-key <실행기마다 새 시험 열쇠>` → 검사는 `--base http://127.0.0.1:8826`

왜 지금 사이트 자료인가: 올리기(`atlas11-site`)는 종가를 받아 자료를 새로 셈해 올린다. 저장소의 `site/atlas/data` 는 손으로 커밋할 때만 바뀌어 며칠 묵는다(10월 17일에 10월 13일 것).
묵은 자료로 돌았더니 지나온 길(`past`)에서 없는 실패 28건이 났다(20거래일 그림의 눈금 글이 하나뿐인 회사 — 옛 쪽 · 새 쪽은 같았음). 지금 사이트 자료로 돌면 올린 뒤와 같은 자료다.
`-f data=stored` 면 저장소 자료로 돈다. 자료를 못 받으면 저장소 자료로 돌고 `summary.json` 의 `data` · 쪽마다 `data` 에 적는다.

## 알아 둘 것

- 깃허브는 한 번에 20개 작업까지 — 이 작업은 18개라 다른 작업과 겹치면 줄을 서서 그만큼 늦다.
- 이제 가장 긴 쪽은 `range` — 같은 방식(`--shard`)을 넣으면 더 줄어든다.
