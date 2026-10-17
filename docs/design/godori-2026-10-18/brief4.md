# 일 나누기 v4 — 빠르게 · 정확하게(2026-10-18 00:40 싱가포르 · 사장님 00:31 「지금보다 50배 빠르개 하면저 정확하개 하는 방법 찾아내서 작업해」 · 00:35 「더 효율적인 방식 찾아서 더 빠르개 더 정확하개 하게 기획해서 해」)

명령문 원문 `order-0015.txt` · 앞 판 `brief3.md` 는 이 장으로 바뀜 · 끝 약속: ① 화면 03:00 · ② 셈과 카톡 04:30(싱가포르)

## 빠른 길 넷(이번에 바꾼 방법)
1. **잘게 · 한꺼번에** — 일꾼 스물둘, 한 사람 2 ~ 8가지 · 맡을 파일 겹침 0(공유 파일은 함수 단위).
2. **고칠 때 검사 2초** — `scripts/atlas11/next/quick.mjs`(브라우저 하나를 켜 둔 채 바뀐 쪽만 · 일꾼 Q). 바뀐 쪽 짝 검사(`check_changed.mjs` · 99초)는 끝에 한 번.
3. **무거운 검사는 깃허브 여러 대** — 이 기계(CPU 2)는 고치기만 · 모든 쪽 검사는 통합 때 `atlas11-next-full.yml -f local=true` 한 번(16대 · 9분).
4. **사이사이 겹쳐 돌리기** — 화면 묶음은 셈을 기다리지 않음 · 통합이 중간에 두 번(01:30 · 02:00) 작업 사본을 깃허브에 올려 모든 쪽 미리 검사 — 일꾼끼리 부딪힌 것을 일찍 찾음.
5. **영어는 쓴 일꾼이 바로** — 새 한국어 글을 넣는 일꾼이 그 자리에서 `node scripts/atlas11/next/i18n/add.mjs "<한국어 틀>" "<영어>"`(잠금 걸고 en-src.json 에 한 줄 · en.json 은 통합이 한 번에 만듦) · 넘겨주기 기다림 0.
6. **맞았는지 재는 검사를 먼저** — 맡은 명령 번호마다 「무엇을 재면 됐다고 아나」를 먼저 정해 `docs/design/godori-2026-10-18/accept/<일꾼>.md` 에 한 줄씩(번호 · 잣대 · 검사 이름 · 결과) → 끝 보고 72줄 표가 여기서 나옴 · 다시 고치는 일이 줄어듦.

## 모두 지킬 것
brief3 의 「모두 지킬 것」 1 ~ 11 그대로 + 위 빠른 길 넷. 정확은 끝에서 지킨다: 모든 쪽 검사 실패 0 · 셈은 따로 세기 틀림 0 · 올린 뒤 실제 사이트 검사.

## 맡을 파일
| 일꾼 | 명령 | 파일 |
|---|---|---|
| Q 빠른 검사 | 빠른 길 2 | 새 `scripts/atlas11/next/quick.mjs` |
| M 재기 | [1] 4 · [11] 1 | 새 `scripts/atlas11/next/measure.mjs` · `reports/atlas11/measure/` |
| S1 매매일지 | [5] 1 ~ 9 · [9] 8 | `p-why.js/.css` · `check_why.mjs` · 새 `scripts/atlas11/next/build/median20.mjs` |
| S2 첫 화면 · 칩 | [6] 1 ~ 9 · [7] 5 · [9] 7(화면 쪽) | `app.js` vHome · 카드 · 칩 · need · `app.css` 첫 화면 · 칩 · `p-today.js/.css` · `check_today.mjs` · next_check 첫 화면 칸 |
| S2b 요약 파일 | [9] 7(만드는 쪽) | 새 `scripts/atlas11/next/build_data.mjs` · `build/home_summary.mjs` · `scripts/atlas11/package.mjs` 한 줄 |
| S3 회사 | [7] 1 ~ 4 | `app.js` vWatch · `p-co.js/.css` · `check_co.mjs` · next_check 회사 칸 |
| S4 채널 · 범위 | [7] 6 · [10] 4 · [8] 10(범위 화면) | `app.js` vChannel · `p-chx.*` · `p-range.*` · `check_chx` · `check_range` |
| S5 관심 · 보유종목 | [7] 7 · 8 · 9 · [4] 4 · 5 · 9(단추 자리) | `app.js` vSub · vMe · `p-hold.*` · `check_hold.mjs` · next_check 관심 · 보유종목 칸 |
| S7 편지 · 소개 쪽 · 거르는 말 | [7] 10 · [9] 5 · 6 · [10] 5(13px) · [4] 3(고리) | `site/letter.html/.css/.js` · `site/hello.html` · `hello-promo.css` · `hello-send.js` · `site/next/words.js` · `lib/atlas11/letter.mjs`(words 부르는 곳) · `tests/atlas11/letter.test.mjs` · 새 `tests/atlas11/words.test.mjs` |
| S9 고도리 칸 | [9] 1 · 4 · [6] 10 · [5] 7 · [10] 3 · [8] 1(화면) · [8] 9 | `p-gdr.js/.css` · `check_gdr.mjs` |
| S11 낱말표 | [10] 1 · 2 | 새 `site/next/glossary.js` · `app.js` 그리는 곳 한 줄 · 영어 낱말은 표로 E 에게 |
| S12 글씨 · 간격 | [10] 5 ~ 10 | `app.css` :root 토큰 · vShorts(시황) · 남이 안 맡은 쪽 css(`p-cal` · `p-cond` · `p-surge` · `p-past` · `p-grow` · `p-rivals` · `p-talk` · `p-up` · `p-time` · `p-info` · `p-x` · `en.css`) · 끝에 모두 맞추기 |
| K1 카톡 서버 | [3] · [4] 2 · 6 ~ 8 · [11] 2 · 4 · [12] 2 | 새 `lib/atlas11/kakao.mjs` · `functions/atlas11/kakao.mjs` · `config/atlas11/kakao.json` · `tests/atlas11/kakao.test.mjs` · `deploy_netlify.mjs`(함수 목록) · `site_headers.mjs`(열쇠 있을 때만) |
| K2 카톡 화면 | [2] · [3] 7 · [4] 1 · 3 · 9 · [5] 10 · [11] 3 | 새 `site/next/kakao.js` · `p-share.js/.css` · `check_share.mjs` · 새 `site/privacy.html` · `docs/design/godori-2026-10-18/kakao-signup.md` |
| G1 고도리 칸 셈 | [8] 4 ~ 8 · 결정표 | 새 `scripts/atlas11/next/gdr/pick2.mjs` · `docs/design/godori-2026-10-18/gdr-v2.md` · `site/next/data/gdr.json`(v2) · `gates.json` |
| G2 지난 성적 | [8] 3 | 새 `scripts/atlas11/next/gdr/backtest.mjs` · `site/next/data/gdr-back.json` |
| G3 목록 받기 · 업데이트 | [8] 1 · 2 · 7(분기 자료) | 새 `scripts/atlas11/next/gdr/kind.mjs` · `quarter.mjs` · `.github/workflows/godori-pick.yml` |
| G4 따로 세기 | [8] 10 | 새 `scripts/atlas11/next/gdr/verify2.py`(G1 · G2 코드를 열지 않음) |
| 통합(나) | [1] · [12] 9 · 보고 | CLAUDE.md · 원칙 79 · 지도 · index.html 꼬리 고리 · app.js 시작 한 줄(kakao.js) · `i18n/add.mjs` · i18n_build · 기록 탭 · speed · 깃허브 검사(중간 두 번 + 마지막) · 올리기 |

## 주고받는 꼴(brief3 그대로 + 카톡 길)
- S1 → S9: `p-why.js` 의 `todayResult()` → `{at, code, verdict: 'go'|'wait'|'rest', ready, of: 22}` 또는 null · `doneOnce()` 그대로.
- S1 → K2: 매매일지를 끝낸 순간 `NX.kakao?.offer?.('journal')` 한 번.
- K2 → 모두: `NX.kakao = {on, member(), start(fromPath), offer(where), withdraw(), exportFile()}` · 꺼져 있으면 on=false · exportFile 은 늘 됨(이 기기 기록 넷을 파일 하나로).
- K1 ↔ K2 서버 길(함수 `/api/kakao/*` · 꺼져 있으면 모두 404):
  `GET /api/kakao/start?to=<#/s/… 길>&ref=<보낸 사람 표>` → 상태 표(state) 쿠키 · 302 카카오 동의 화면 · 「카드 단추 누른 수」 하루 셈 +1
  `GET /api/kakao/callback?code&state` → 표 맞대기(다르면 403) · 서버에서 증표 바꿈 · 회원 번호만 · 로그인 쿠키(HttpOnly · Secure · SameSite=Lax) · 「가입 마친 수」 하루 셈 +1 · 새 회원이고 ref 가 있으면 소개 수 +1 · 302 `to`
  `GET /api/kakao/me` → `{on, member, ref, friends, code?}`(이름 · 사진 없음 · code = 3명 찼을 때 확인 번호)
  `GET|PUT /api/kakao/data` → 회원 기록 넷(합치기 · 지우지 않음) · `POST /api/kakao/withdraw` → 서버 사본 지움 · 카카오 연결 끊기 · 쿠키 지움
  `GET /api/kakao/verify?code=` → 사장님 열쇠 기기만(편지 여는 밤과 같은 열쇠 잣대) · `{ok, used}`
- G1 → G2 · G4: 결정표 `gdr-v2.md`(첫 줄 `상태: 완성` 이 붙으면 다 쓴 것) · pick2.mjs 가 내보냄 `selectOn(data, dayIndex)` → G2 가 날마다 부름.
- 낱말: 갈래 → 큰 업종 · 몸값 → 회사 크기 · 한 회사 한 표 → 평균 · 큰 회사는 크게 → 큰 회사 기준 · 20거래일 → 한 달 · 다섯 문 → 조건 다섯 · 쉬는 돈 → 현금으로 둠(S11 glossary.js 한 곳 · 새 글에는 처음부터 새 낱말).
