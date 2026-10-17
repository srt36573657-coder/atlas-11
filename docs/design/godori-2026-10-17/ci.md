# 무거운 화면 검사 — 깃허브 여러 대 · 올리기 전 검사 (2026-10-17 · 규칙 76)

새 화면 모든 쪽 검사(`atlas11-next-full`)를 깃허브 실행기 16대로 나눠 돌린다.
혼자 38분 걸리던 영어 검사(`en`)는 여섯 대(`en1` ~ `en6`)로 나눠 돌고 마지막에 하나로 합친다.
`local=true` 면 올리기 전에 그 가지를 실행기 안에서 묶어 띄우고 같은 검사를 돌린다(사이트에는 아무것도 안 올림 · 16대 한꺼번에).
지금 사이트 검사(live)는 aaa7377.com 을 세게 두드리지 않게 한 번에 6대 · 한 실행만(`max-parallel` · `concurrency`).

## 돌리는 법

| 무엇 | 명령 |
|---|---|
| 올리기 전 검사(가지) | `git push origin <가지>` 뒤 `gh workflow run atlas11-next-full.yml -R srt36573657-coder/atlas-11 --ref <가지> -f local=true` |
| 지금 사이트 검사 | `gh workflow run atlas11-next-full.yml -R srt36573657-coder/atlas-11` (aaa7377.com 을 읽기만) |
| 몇 쪽만 | `-f pages=en,co,next` (쉼표 · 비우면 모두) |
| 영어를 더 잘게 | `-f en_shards=8` (1 ~ 12 · 기본 6) |
| 저장소 자료로(local) | `-f data=stored` (기본 live = 지금 사이트 자료) |
| 지켜보기 | `gh run list -R srt36573657-coder/atlas-11 --workflow atlas11-next-full.yml --limit 3` → `gh run watch <번호> -R srt36573657-coder/atlas-11` |

## 얼마나 걸리나 (깃허브 실측 · 2026-10-17)

| 판 | 실행 번호 | 전체 | 가장 긴 일 |
|---|---|---|---|
| 전 — 영어 한 대 · 지금 사이트 · 13대 한꺼번에 | 39018585300 | 40분 44초 | 영어 38분 8초 |
| 뒤 — 올리기 전(local · 지금 사이트 자료 · 16대) | 39033252686 | 8분 52초 · 실패 0 | 지나온 길 6분 41초 · 영어 몫 6분 32초(여섯 대 368 ~ 392초) |
| 뒤 — 지금 사이트(live · 16대 한꺼번에 — 그 뒤 6대로 줄임) | 39032323090 | 11분 47초 | 지나온 길 10분 29초 · 영어 몫 9분 47초(넷 439 ~ 587초 · 둘은 처음 받기에서 멈춤) |
| 뒤 — 지금 사이트(live · 한 번에 6대) | 실측 없음 | 어림 22 ~ 24분 | 위 두 live 실측의 일마다 초 + 준비 60초를 긴 차례로 6대에 넣어 셈 |

local 한 번의 차례: 계획 33초(지금 사이트 자료 2,573개 받기 23초) → 실행기마다 준비 약 65초(저장소 25 · 브라우저 25 · 묶고 띄우기 15) → 검사 → 모으기 9초.
live 는 사이트가 느리면 쪽 검사가 길어진다 — 11:44 실행(39029826908)은 main 의 다른 live 검사와 겹쳐 co 926초(전에는 366초) · rivals · cond 가 시간 넘음 · 12:23 실행(39032323090)은 16대가 한꺼번에 두드려 en3 · en4 가 「자료를 못 받음」으로 1초 만에 멈추고 12:27 올림이 사이에 끼었다.
그래서 live 는 한 번에 한 실행(`concurrency`) · 한 번에 6대(`max-parallel`) · 긴 일부터 · 영어 검사는 처음 받기를 다섯 번까지 다시 받는다.

## 결과가 놓이는 곳

깃허브 실행 기록(아티팩트)은 이 기계에서 못 받는다 → 결과는 main 에 커밋된다: `git fetch origin main` 뒤 `git show origin/main:<길>`.

- 올리기 전: `reports/atlas11/probe/next-preview/` — 한 번에 한 판만(앞 판은 지움) · 커밋 글 `atlas11 probe next-preview <가지> <커밋> [skip ci]`
- 지금 사이트: `reports/atlas11/probe/next-full/` — 쪽마다 마지막 결과 · 커밋 글 `atlas11 probe next-full [skip ci]`
- `summary.json` — `ok` · `mode`(local · live) · `ref` · `sha` · `run` · `wallSeconds`(계획부터 모으기까지) · `data`(local — 쓴 자료 · 고른 날 · 받은 초 · 못 받았으면 까닭) · `pages[] = {name, code, seconds}`
  - `en` 은 한 줄: 몫이 모두 0 일 때만 0 · `seconds` = 가장 긴 몫 · `shards` · `codes` · `shardSeconds`
  - 끝 코드 99 = 결과 없음(작업이 끝나지 못함) · 98 = 시험 서버가 안 뜸(묶기 실패) · `build` = 묶고 띄운 초(local)
- 쪽마다 `<쪽>.json`(검사 결과) · `<쪽>.exit.json` · `<쪽>.tail.txt`(끝 4천 자) · `en.json` = 여섯 몫을 합친 것(`shards[]` 에 몫마다 줄 · `problems`)

## 일 나누기

- 실행기 16대 = `next` · `en1` ~ `en6` · `cal` · `chx` · `co` · `grow` · `past` · `range` · `rivals` · `today` · `small`(`cond` · `gdr` · `misc` · `surge` · `why` 를 차례로 — 각 1분 안팎). 깃허브는 한 번에 20개 작업까지라 쪽마다 따로(20대)면 다른 작업과 겹칠 때 줄을 섰다.
- 차례 = live 에서 오래 걸리는 것부터(`co` · `rivals` · `past` · `grow` · `en1` ~ `en6` · `range` · `next` · `small` · `chx` · `cal` · `today`) — 6대씩 돌 때 긴 일이 늦게 시작하지 않게.
- 새 `check_<이름>.mjs` 는 저절로 제 실행기를 받고 맨 앞에 선다(짧으면 워크플로 plan 의 `SMALL` 에, 길이를 알면 `ORDER` 에 이름을 더함).

## 영어 검사를 어떻게 나누나 (겹침 0 · 빠짐 0)

- 일감 = 길 하나씩(지금 13,397) + 묶음 둘 — `@tail`(누르기 → 바꿔치기 → 오늘 한 줄 문장 · 같은 창 · 이 차례) · `@newwin`(자료를 못 받는 새 창)
- 몫마다 같은 목록을 세우고 같은 정수 셈으로 가른다 → 일감 하나는 꼭 한 몫. 묶음은 끝 몫에, 길은 남은 무게에 비례해 섞어 나눔(`UNIT_W` · 실측 — 길 하나 0.17초 · `@tail` 12초 · `@newwin` 2초).
- 모으기(`--merge`)가 맞대 본다: 몫 1 ~ n 이 한 번씩 · 같은 목록(`units.hash` · `total`) · 몫 일감 수 합 = 전체. 하나라도 어긋나면 `en` 실패(`problems`).
- 손으로 확인(브라우저 없음): `node scripts/atlas11/next/next_en_check.mjs --base <곳> --modules --dev 0 --all --list-only [--shard k/6]`
- 고도리(규칙 77): `#/why` 답 단추를 모두 눌러 결과까지 · `#/gdr` · `#/gdr/1` 내 돈을 바꾸고 칸을 엶 · 「나」 칸(`#/me`)에 왜 사? 기록 둘(오늘 · 40일 전)을 심고 봄 · 새 창 하나는 `/next/data/gdr.json` 도 못 받게 함. 고치는 동안 빨리: `--modules --only me,mod --mods why,gdr --no-edge`(6초).

## local 묶기

1. plan 이 지금 사이트 자료(`/atlas/data/*` — 지금 2,573개)를 한 번만 받는다(한 번에 8개 · 약 30초). 목록 · sha256 은 지금 사이트의 `dist-manifest.json` — 파일마다 그 판의 sha256 과 맞아야 받으므로 받은 것은 한 판이다(받는 사이 올림이 끼면 바뀐 파일이 걸려 새 목록으로 처음부터 · 세 판까지) → 모든 검사가 같은 판을 쓴다. 한 번에 24개씩 받았을 때는 8분 넘게 걸리고 못 받았다.
2. 실행기마다: `npm ci --omit=dev` → `GITHUB_ACTIONS=false ATLAS_INSPECT_N=20000 node scripts/atlas11/package.mjs --no-full --out ../out`(가지의 화면 코드로 `dist/` · 종가를 새로 받지 않음 · 네 눈 점검은 짧게) → `dist/atlas/data` 를 1의 자료로 바꿈
3. `node scripts/atlas11/invite_dev.mjs --dir dist --port 8826 --owner-key <실행기마다 새 시험 열쇠>` → 검사는 `--base http://127.0.0.1:8826`

왜 지금 사이트 자료인가: 올리기(`atlas11-site`)는 종가를 받아 자료를 새로 셈해 올린다. 저장소의 `site/atlas/data` 는 손으로 커밋할 때만 바뀌어 며칠 묵는다(10월 17일에 10월 13일 것).
묵은 자료로 돌았더니 지나온 길(`past`)에서 없는 실패 28건이 났다(20거래일 그림의 눈금 글이 하나뿐인 회사 — 옛 쪽 · 새 쪽은 같았음). 지금 사이트 자료로 돌면 올린 뒤와 같은 자료다.
자료를 못 받으면 저장소 자료로 돌고 `summary.json` 의 `data` · 쪽마다 `data` 에 적는다.

## 알아 둘 것

- 2026-10-17 올리기 전 검사에서 `gdr` 한 건이 걸림: 「자료 날짜 · gdr 2026-10-13 · 사이트 2026-10-16」 — `site/next/data/gdr.json` 은 10월 13일 모음으로 골랐고 사이트 자료는 10월 16일. 올린 뒤 지금 사이트에서도 같게 걸린다(`check_gdr.mjs` 66줄).
- `check_past.mjs` 의 「옛 쪽이 덜 그려짐」(눈금 글 2개 미만)은 20거래일 내내 값이 거의 그대로인 회사(거래 멈춤 등)가 생기면 지금 사이트에서도 걸릴 수 있다 — 옛 쪽 · 새 쪽이 같아도 걸림.
- 깃허브는 한 번에 20개 작업까지 — 다른 작업과 겹치면 줄을 서서 그만큼 늦다.
- 지금 사이트 검사(live)는 한 번에 하나(`atlas11-next-full-live`) · 올리기 전 검사(local)는 가지마다 하나 — 기다리는 실행이 있을 때 또 누르면 기다리던 것은 깃허브가 지운다(뒤에 누른 것만 돎).
