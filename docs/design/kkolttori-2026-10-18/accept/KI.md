# KI 합치기 고침 — 잣대 먼저(cards.md 「KI」 18:10 + 리드 말 셋 + 리드 말 하나(합계 신호))

맡은 것: `scripts/atlas11/next/next_check.mjs`(판정 넷) · `scripts/atlas11/next/check_co.mjs`(꼬리표 기대 한 줄) · `check_hold.mjs` · `check_why.mjs`(감싼 줄 셈 · 끝 검사에서 나옴) · `tests/atlas11/kakao.test.mjs` ② · `tests/atlas11/next-modules.test.mjs` ⑥ 목록 한 칸 · `site/next/app.css` 위 막대 · `site/next/essence.js` FOUR_ALT 다섯 줄 · 그리는 쪽 p-time · p-up · p-surge · p-info(한 줄씩) · 영어 사전(add.mjs) · `site/next/app.js` wTags · `site/letter.js` · `letter.css` 도장 칸 · 새 `site/invite.js` + `site/invite.html` 한 줄 · `site/next/p-share.js` · `site/next/kakao.js` 합계 신호
손대지 않음: KA · KD · KE · KF 파일 · `site/app/**` · `site/atlas/**` · t365 자료 · 함수 파일 · `invite.test.mjs`(11번은 KD 가 이미 고침 — 자동 저장 deab512a5)

| 항목 | 다 됐다는 증거(잴 수 있게) | 어떻게 잼 | 결과 |
|---|---|---|---|
| 1 ① 업종 칸 수 | 칸 셈 = `.grid > a` + `.grid > [data-kkrow] > a`(줄 · 단추 구조 그대로) · 실패 0 | next_check --limit 2 | 통과 — 업종 채널 77곳 · 실패 0(55초 · 모든 판정 0) |
| 1 ② 친구 소개 줄 | VIDEO.ready false 「친구에게 소개하기골똘이 소개 · 보내기」 · true 「…골똘이의 고민 1분 영상 · 보내기」 · 영어 틀 남음 0 | next_check · quick '#/me' --en | 통과 — 「나」 칸 편지 1 · 실패 0 · quick 영어 3폭 0 |
| 2 함수 목록 시험 | kakao.test ② 꺼짐 = invite · jinhwa · letter · tally · 켬 = + kakao | node --test 두 파일 | 통과 — 32 / 32(invite.test 11번은 KD 가 먼저 고침) |
| 3 위 막대 44px | 원인 · 영어 320 · 360 · 390 + 한국어 단추 셋 44×44 · 로고 한 줄 · 넘침 0 | 브라우저 재기 · quick '#/' '#/me' (--en) 3폭 | 통과 — 원인: 영어 320 에서 로고 「Golttori」 125.9px 가 두 줄(「Golttor / i」 63px)로 꺾이고 단추 43.4 · 같은 자리에 Godori · Bodri 를 넣으면 44 → `.top .ibtn` 줄지 않음 · 로고 한 줄 · 영어 로고 자간 .02em → 단추 44 ×3 · 로고 117.7px 한 줄 · quick 영어 · 한국어 걸림 0 |
| 4 「하루 4번」 표 밖 넷 | fourADay false: p-time 0거래일 줄 · p-up 제목 + 밑 줄 · p-surge 규칙 글 · p-info 다시 고르기에 「하루 4번」 0 · true 면 옛 글 · 옛 쪽 맞대기 같은 표 | 바꿔치기 탐침 · check_misc · check_surge · check_cal | 통과 — false 4곳 참인 말 · true 4곳 옛 글 · FOUR_ALT 5 → 10줄 · check_misc --only up,time,info 0(줄 2,336) · check_surge --limit 1 0 · check_cal --limit 1 --wide 1 ok · 남김 1: 봉인과 함께 잠근 규칙 원문(time.json) |
| 5 영어 사전 bad | i18n_build bad 0 | i18n_build --check · 엔진 탐침 | 통과 — bad 2 → 0 · 반값 note 두 줄 자리표 차례 꼴({d}{d}{n}{n}{d}{n}) · 엔진으로 두 줄 다 영어 |
| 6 ④ wTags | 부르는 줄에 `opened(` · 끝내기 전 칸 꼬리표 0 · 끝낸 뒤 그대로 · 본질 문 ④ 지나감 | essence_check · 가짜 칸 탐침 · quick #/w/100030 두 판 | 통과 — ④ 지나감 · 가짜 칸(100030 = 1번): 기록 없음 0개 · 끝낸 기록 1개 「골똘이 칸 1번」 · quick 두 판 걸림 0 · next_check(끝낸 기기 회사 쪽 꼬리표 판정 더함) · check_co(기록 없는 칸 = 꼬리표 0) 실패 0 |
| 7 ③ 도장 모으기 | 도장 칸 · css 5줄 지움 · 다른 보상 0 · 본질 문 ③ letter.js 0 · 시험 0 | essence_check · node --test letter · 회원 화면 탐침 | 통과 — letter 10 / 10 · 회원 화면 칸 셋(쓰기 · 초대장 · 열쇠) · 도장 0 · 영어 · 시험에만 있던 것은 없었음 |
| 8 ③ 초대장 쪽 | invite.html → /invite.js · 옛 이름 · 「매수」 0 · 본질 문 ③ 0 · 오류 0 | essence_check · 옛 · 새 탐침 · quick | 통과 — 새 쪽 옛 이름 0 · 「매수」 0 · 오류 0(옛 쪽은 lens.json 404) · 작은 글 7 · 4 · 3(옛 7 · 4 · 4) · 누르는 자리 2(옛 2) · 이름 brand.js · 본질 한 줄 · 영어 8줄 · next-modules ⑥ 에 invite.js 더함 6 / 6 |
| 9 합계 신호 | 보내기 마침(카톡 · 공유 창 · 담기)만 share · 가입 마침만 signup · 몸 {k} | 브라우저 탐침 · 노드 탐침 · kakao-client · check_share | 통과 — share: 담기 1 · 공유 창 1 · 닫음 0 · signup: 다섯 길 중 새 가입 1 · kakao-client 22 / 22 · check_share --only kk 0 |
| 10 본질 문 | essence_check 끝 코드 0 · ③ 0 | essence_check(인자 없음) | 통과 — 전 끝 코드 1(③ 3줄 · ④ 1) → 끝 코드 0 |
| 끝 검사 | check_changed(고친 파일 18개 · 짝 13) 실패 0 | check_changed --limit 2(583초) | 13 중 10 통과 · 걸림 3 → 둘은 KB2 감싼 줄 탓이라 같은 꼴로 고침 · 하나는 리드 몫(아래) |
| 덧 ① check_hold | 보유종목 카드 차례 · 소식 「처음 네 줄」 — KB2 가 이름 줄(div.hd-kr) · 소식 줄(data-kkrow)을 카톡 단추와 감싸 61건 걸림 → 감싼 줄 안을 셈 | check_hold 다시 | 통과 — 61 → 0 |
| 덧 ② check_why | 「기록에 누르는 것」 13건 = 기록 줄 카톡 단추(data-kk · 명령문 [6] 1) → 지우는 단추가 아니라 셈 밖 | check_why 다시 | 통과 — 13 → 0 |
| 덧 ③ en(리드 몫) | next_en_check 27건 = 사전에 없는 틀 15 · 한글 남음 10(모두 en-src.json 에 있음 — 서버 en.json 을 아직 안 다시 만듦 · quick --en 은 en-src 로 0) + 칸 안 넘친 글 2(#/sub 관심 회사 줄 · 영어 320 · 360) | i18n_build 뒤 다시 · 아래 넘침 | 리드가 en.json 을 다시 만들면 25건은 사라짐 · 넘침 2건은 KB2 줄(아래) |

영어: 15줄(새 13 · 고침 2) — 초대장 8 · 「하루 4번」 참인 말 5 · 반값 note 2(--force)
못 한 것 5: ⓪ #/sub 관심 회사 줄(KB2 · app.js vSub)에 카톡 단추가 더해져 영어 320 에서 글 칸이 54px(한국어 69px) — 「Steel · one month −69.7%」 숫자 60px 가 넘침(en 검사 2건) · 고치는 길(줄 꺾기 · 작은 선 숨기기 · 관심 단추 줄이기)은 모양 결정이라 손대지 않음 ① 초대장 쪽 옛 모양(/app/invite.css · 규칙 75)의 15 ~ 16px 글 · 44px 안 되는 자리 2(건너뛰기 고리 · 「기본 문구로」)는 그대로(옛 쪽과 같음) ② 봉인 규칙 원문 「회차마다(하루 4번)」은 봉인 기록이라 그대로 ③ 초대장 쪽은 예전처럼 영어 엔진을 안 부름(영어 줄은 사전에만) ④ KA 시험(essence-gate)의 깨끗한 판이 아직 `app/invite.js` 를 복사함 — `invite.js` 로 바꾸면 ③ 이 진짜 초대장 글을 봄(KA 파일 · 리드께)
