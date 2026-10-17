# 고도리 · 72개와 카톡 두 번 가입 — 일 나누기 한 장(2026-10-18 00:20 싱가포르 · 규칙 76 ② · 명령문 [1] 2)

명령문 원문 `docs/design/godori-2026-10-18/order-0015.txt` · 끝 약속: ① 화면 04:30 · ② 셈과 카톡 08:00(싱가포르)

## 모두 지킬 것
1. 아래 단추 다섯(오늘 장 · 시황 · 매매일지 · 관심 · 보유종목)은 다시 바꾸지 않는다. 이미 된 일곱은 다시 만들지 않는다([0]).
2. 이름은 `site/next/brand.js` · 쓰지 않을 말은 `site/next/words.js` 한 곳 · 「사라」 「팔아라」 대신 「나라면」.
3. 보안 규칙(CSP) — innerHTML · 글 속 style · 다른 주소 스크립트 금지. 카카오 주소는 열쇠가 들어온 뒤에만(이번엔 열쇠 없음 → 0).
4. 예전 화면(`site/atlas` · `site/app` · `site/us` · `site/new` · `site/index.html` · `scripts/atlas11/t365`) 손대지 않음(규칙 75). 예약 작업 파일(daily · evening) 고치지 않음(규칙 7).
5. 영어 = `scripts/atlas11/next/i18n/en-src.json` 고치고 `node scripts/atlas11/next/i18n_build.mjs` · en.json 손으로 금지. 새 한국어 글은 보고에 틀(예: 「{d} 종가로 …」)로 적어 넘긴다.
6. 축하 폭죽 · 연속 접속 보상 금지 · 누르는 자리 44px 이상 · 글 17px 이상([10] 5).
7. 가입 안 한 사람 기록은 이 기기에만 · 가입한 사람만 서버에도([12] 3). 이 기기 기록은 지우는 단추 없음.
8. 이 기계는 CPU 둘 — 제 짝 검사만 작게(`--limit` 등) · `run_all` 금지 · 모두는 마지막에 깃허브 한 번(통합 담당).
9. 시험 서버: http://127.0.0.1:8826/next/?dev=1 (작업 파일을 그대로 보여 줌) · Playwright `createRequire('/opt/node-tools/')('playwright')` · `executablePath: '/opt/pw-browsers/chromium'`.
10. 같은 파일을 둘이 고칠 때(`app.js` · `app.css` · `next_check.mjs` · `next_en_check.mjs`)는 자기 함수 · 자기 묶음만, 고치기 직전에 다시 읽고, 줄 바꿈 · 모양 정리는 하지 않는다.
11. 커밋 · 푸시 · 올리기 금지(통합 담당만). 보고는 40줄 안: 한 것 · 짝 검사 결과 · 새 한국어 틀 · 남이 해야 할 것 · 못 한 것.

## 맡을 파일(겹침 0 — 위 10번의 공유 파일은 함수 · 묶음 단위)
| 일꾼 | 명령 | 파일 |
|---|---|---|
| M 재기 | [1] 4 · [11] 1 · 4 | 새 `scripts/atlas11/next/measure.mjs` · `reports/atlas11/measure/` · 고치기 전 사본(scratchpad/before · 73babd473) |
| W1 매매일지 | [5] 1 ~ 9 · [9] 8(점수 점 글) | `site/next/p-why.js` · `p-why.css` · `scripts/atlas11/next/check_why.mjs` |
| W2 첫 화면 | [6] 1 ~ 9 · [7] 5(칩 목록) · [9] 7 | `app.js` vHome · 칩 · need/getJson · `app.css` 첫 화면 · 칩 묶음 · `p-today.js/.css` · 새 `scripts/atlas11/next/home_summary.mjs` · `scripts/atlas11/package.mjs`(요약 파일 한 줄) · `check_today.mjs` · `next_check.mjs` 첫 화면 칸 |
| W3 회사 · 채널 · 범위 | [7] 1 ~ 4 · 6 · [10] 4 | `app.js` vWatch · vChannel · `p-co.js/.css` · `p-chx.js/.css` · `p-range.js/.css` · `check_co` · `check_chx` · `check_range` |
| W4 관심 · 보유종목 · 편지 쪽 | [7] 7 ~ 10(편지 쪽) · [4] 4 · 5 · 9(단추 자리) | `app.js` vSub · vMe · `p-hold.js/.css` · `check_hold.mjs` · `site/letter.html/.css/.js` · `tests/atlas11/letter.test.mjs` |
| W5 고도리 칸 · 법 · 소개 쪽 · 거르는 말 | [9] 1 ~ 6 · [6] 10 · [5] 7(칸 닫기) · [10] 3 · [7] 10(소개 쪽) · [8] 9(카드 한 줄 — W7 자료 꼴) | `p-gdr.js/.css` · `check_gdr.mjs` · `site/next/words.js` · `lib/atlas11/letter.mjs`(words 부르는 곳만) · `site/hello.html` · `hello-promo.css` · `hello-send.js` |
| W6 낱말 · 숫자 · 자리 | [10] 1 · 2 · 5 ~ 10 | 새 `site/next/glossary.js` · 남이 안 맡은 쪽 css(`p-cal` · `p-cond` · `p-surge` · `p-past` · `p-grow` · `p-rivals` · `p-talk` · `p-up` · `p-time` · `p-info` · `p-x` · `en.css`) · 마지막에 W1 ~ W5 css 정리(그들 끝난 뒤) |
| W7 고도리 칸 셈 gdr-v2 | [8] 1 ~ 8 · 10 | 새 `scripts/atlas11/next/gdr/pick2.mjs` · `backtest.mjs` · `kind.mjs` · `quarter.mjs` · 새 `.github/workflows/godori-pick.yml` · `site/next/data/gdr.json`(v2 꼴) · 결정표 `docs/design/godori-2026-10-18/gdr-v2.md` · `pick.mjs`(gdr-v1)는 그대로 둠 |
| W8 따로 세기 | [8] 10 · 규칙 76 ③ | 새 `scripts/atlas11/next/gdr/verify2.py` · `reports/atlas11/godori/verify2-latest.json` (pick2.mjs 를 열어 보지 않음 · 결정표만) |
| W9 카톡 | [2] · [3] · [4] 1 ~ 3 · 6 ~ 9 · [5] 10 · [11] 2 · 3 | 새 `functions/atlas11/kakao.mjs` · `lib/atlas11/kakao.mjs` · `config/atlas11/kakao.json` · `site/next/kakao.js` · `site/privacy.html` · `tests/atlas11/kakao.test.mjs` · `docs/design/godori-2026-10-18/kakao-signup.md` · `site/next/p-share.js/.css` · `check_share.mjs` · `scripts/atlas11/deploy_netlify.mjs`(함수 목록만) · `scripts/atlas11/site_headers.mjs`(열쇠 있을 때만 · 이번엔 그대로) |
| 통합(나) | [1] 1 · 2 · 5 · 6 · 7 · 8 · [12] 9 · 보고 | `CLAUDE.md` · `docs/고도리_규칙원문.md` · `docs/ATLAS_원칙.md` 규칙 79 · `docs/고도리_지도.md` · `site/next/index.html` 꼬리 고리 · `app.js` 시작 한 줄(kakao.js) · 영어 모음 · 기록 탭 · speed |

## 주고받는 꼴
- W1 → W5: `p-why.js` 가 내보냄 `doneOnce()`(그대로) · 새 `todayResult()` → `{at, verdict: 'go'|'wait'|'rest', ready: n, of: 22}` 또는 null(오늘 끝낸 기록 없음) · `rest` 면 고도리 칸을 닫음([5] 7) · 「오늘 점수 · 다시 하기」 한 줄([6] 10).
- W1 → W9: 매매일지를 끝낸 순간 `globalThis.NX?.kakao?.offer?.('journal')` 한 번 부름([2] 7 — W9 가 없으면 아무 일도 안 함).
- W9 → 모두: `NX.kakao` = `{on: bool, member(): bool, start(from), offer(where), withdraw(), exportFile()}` · 꺼져 있으면(`config/atlas11/kakao.json` 열쇠 없음) `on=false` 이고 아무것도 안 보임. 서버 맞추기는 kakao.js 가 저장 열쇠 넷(`atlas:godori-why` · `atlas:new:sub` · `atlas:new:later` · `atlas:godori-hold`)을 스스로 읽고 씀 — 다른 일꾼 파일에 고리 없음.
- W4: 보유종목 바로 가기 = 편지 여는 밤 · 기록 파일로 받기(`NX.kakao?.exportFile` 없으면 W4 가 직접 JSON 받기) · 탈퇴(가입한 사람만 보임).
- W7 → W5: `gdr.json` v2 꼴(`version: 'gdr-v2'`)은 W7 이 결정표에 먼저 적고 W5 에게 넘김 · 화면은 v1 · v2 둘 다 읽게.
- 낱말([10] 1): 갈래 → 큰 업종 · 몸값 → 회사 크기 · 한 회사 한 표 → 평균 · 큰 회사는 크게 → 큰 회사 기준 · 20거래일 → 한 달 · 다섯 문 → 조건 다섯 · 쉬는 돈 → 현금으로 둠 — W6 의 `glossary.js` 한 곳. 다른 일꾼은 새 글에 옛 낱말을 쓰지 않는다.
