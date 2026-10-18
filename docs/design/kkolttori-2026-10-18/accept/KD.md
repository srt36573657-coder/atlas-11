# KD 진화 칸 · 합계 칸 — 받아들이는 기준(먼저 씀 · 2026-10-18 18:20 싱가포르)

명령문 `order-1639.txt` [9] · [10] · 일 나누기 `split.md` 「KD」 · 잣대 `docs/꼴똘이_본질.md`.
맡은 파일: `lib/atlas11/jinhwa.mjs` · `functions/atlas11/jinhwa.mjs` · `lib/atlas11/tally.mjs` · `functions/atlas11/tally.mjs` · `config/atlas11/jinhwa-metrics.v1.json` · `site/next/p-jinhwa.js` · `p-jinhwa.css` · `site/next/tally.js` · `app.js` 길 한 줄(+ 연 수 신호 한 줄) · `p-hold.js` shortcuts() 한 줄 · `p-why.js` 신호 세 곳 · `site/privacy.html` 합계 칸 · `tests/atlas11/jinhwa.test.mjs` · `tally.test.mjs` · `scripts/atlas11/next/check_jinhwa.mjs` · `scripts/atlas11/invite_dev.mjs`(두 길 · 리드 말씀)

| 항목 | 다 했다는 증거(잴 수 있는 것) | 어떻게 재나 | 결과 |
|---|---|---|---|
| [9] 1 열쇠 기기에서만 | 열쇠 없음 · 틀린 열쇠 · 서버가 「아님」 · 서버 못 닿음 · 깊은 주소(#/jinhwa/x) → 진화 칸이 한 번이라도 그려진 수 0 · 보유종목 「진화 칸」 줄 0(offDeviceOpens = 0) · 맞는 열쇠 → 열림 · 줄 1 | check_jinhwa `off` · `key` | |
| [9] 2 맨 위 두 줄 | 본질 줄 글자 = jinhwa.json essence · 「진화 n번째」 n = jinhwa.json n · 360×640 첫 화면 안 | check_jinhwa `key` | |
| [9] 3 기다리는 진화 셋 | 카드 수 = waiting 수 · 카드마다 이름 · 전 · 후 그림 · 섬기는 본질 · 세 사람 한마디 셋 · 예측 · pick 카드에만 「세 사람이 고른 것」 · 비면 「기다리는 진화 0」 · 자료 못 받으면 「?」 | check_jinhwa `key`(시험 자료 · 빈 자료 · 못 받음) | |
| [9] 4 확인 단추 | 카드마다 단추 1 · 누름 → 서버 상태 confirmed · 글 「확인함 · 다음 업데이트 ○시에 들어가요」(○ = 회차 30분 전 규칙으로 셈) · 누르기 전 서버 상태 없음 | check_jinhwa `key` · jinhwa.test | |
| [9] 5 거두기 | 다시 누름 → withdrawn · 들어간 것(applied)은 거둠 409 | check_jinhwa · jinhwa.test | |
| [9] 6 진화한 것 | 날짜 차례 · 무엇이 바뀌었나 · 전후 그림 · 10거래일 채점 글 · 「되돌리기」 → revert · 다시 → kept | check_jinhwa · jinhwa.test | |
| [9] 7 고친 고장 | 줄 수 = fixed 수 · 비면 「고친 고장 0」 | check_jinhwa | |
| [9] 8 함수 · 열쇠 · 읽기 주소 | POST 열쇠 없음 403 · 모르는 번호 404 · status 칸 = {id, state, at} 셋뿐 · 깃허브 열쇠 글자 0 | jinhwa.test · grep | |
| [9] 9 새 대안 알림 | 내 몫 아님(진화 회차 예약 작업의 휴대폰 알림 — 리드 · KE) | 보고 | |
| [9] 10 한 화면 · 17 · 44 | 360×640 에서 본질 줄 · n · 첫 카드 이름 · 그림 · 확인 단추가 아래 단추 줄 위 · 17px 아래 글 0 · 44px 안 되는 누름 자리 0 · 가로 넘침 0 | check_jinhwa `key` · quick.mjs | |
| [10] 1 잣대 셋 | 설정 파일에 셋(멈춤 · 약속 · 사실) · 서버 칸 넷(stop · stop_rest · promise · promise_yes) · 진화 칸에 셋 | tally.test · check_jinhwa | |
| [10] 2 참고만 | visit · share · signup 은 열쇠 있을 때만 보임 · 설정 reference · 진화 칸 접힌 「참고 · 잣대가 아니에요」 | tally.test · check_jinhwa | |
| [10] 3 이름 · 기기 번호 · 쿠키 없이 | 저장소 열쇠 = 날짜 · 값 = 숫자만(시험이 저장소 전부를 훑음) · 받는 몸 = {k} 하나 · 쿠키 · 주소 안 읽음 · 막기(몸 크기 · 다른 사이트 · 하루 끝 수 · 초당 수) | tally.test | |
| [10] 4 처리방침 | privacy.html 에 합계 칸(한국어 · 영어 줄) | grep · quick `/privacy.html` | |
| [10] 5 표본이 작으면 모음 | 설정 minSample · 30번 안이면 비율 글 0 · 「판단하지 않고 모아요」 | check_jinhwa | |
| [10] 6 10거래일 뒤 채점 | 설정 scoreAfterTradingDays 10 · 화면에 score 글 | check_jinhwa | |
| 신호 세 곳 | 끝냄 1번 = stop 또는 stop_rest 한 번 · 「쉬어 가자」 = stop_rest · 한 달 답 「했어」 = promise_yes · 「안 했어」 = promise · 쪽 열 때 visit 1 · 자동 브라우저는 0 · 몸 = {k} 만 | check_jinhwa `beacon` | |
| 보고 7 | 진화 칸이 사장님 기기 밖에서 열린 수 0 | check_jinhwa offDeviceOpens | |
