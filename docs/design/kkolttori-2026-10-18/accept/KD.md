# KD 진화 칸 · 합계 칸 — 받아들이는 기준(앞 일꾼이 먼저 씀 · 17:18 멈춤 · 이어서 끝내고 결과를 채움 2026-10-18 17:58 싱가포르)

명령문 `order-1639.txt` [9] · [10] · 일 나누기 `split.md` 「KD」 · 잣대 `docs/골똘이_본질.md`.
맡은 파일: `lib/atlas11/jinhwa.mjs` · `functions/atlas11/jinhwa.mjs` · `lib/atlas11/tally.mjs` · `functions/atlas11/tally.mjs` · `config/atlas11/jinhwa-metrics.v1.json` · `site/next/p-jinhwa.js` · `p-jinhwa.css` · `site/next/tally.js` · `app.js` 길 한 줄(+ 연 수 신호) · `p-hold.js` shortcuts() 한 줄 · `p-why.js` 신호 두 줄(끝냄 · 쉬어 가자 = 한 줄 · 한 달 답 = 한 줄) · `site/privacy.html` 합계 칸 · `tests/atlas11/jinhwa.test.mjs` · `tally.test.mjs` · `scripts/atlas11/next/check_jinhwa.mjs` · `scripts/atlas11/invite_dev.mjs`(두 길 · 리드 말씀) · 남의 시험 한 곳 고침: `tests/atlas11/invite.test.mjs`(올리는 함수 목록에 jinhwa · tally — 안 고치면 깨짐)

재는 곳: 시험 = `node --test tests/atlas11/jinhwa.test.mjs tests/atlas11/tally.test.mjs`(23개 · 1.1초) · 검사 = `node scripts/atlas11/next/check_jinhwa.mjs --base http://127.0.0.1:8836 --all`(새로 띄운 시험 서버 · 124개 · 38.8초) · quick.mjs(#/jinhwa · #/me · #/why · /privacy.html × 320 · 360 · 390)

| 항목 | 다 했다는 증거(잴 수 있는 것) | 어떻게 재나 | 결과 |
|---|---|---|---|
| [9] 1 열쇠 기기에서만 | 열쇠 없음 · 틀린 열쇠 · 서버가 「아님」 · 서버 못 닿음 · 깊은 주소(#/jinhwa/x) → 진화 칸이 한 번이라도 그려진 수 0 · 보유종목 「진화 칸」 줄 0(offDeviceOpens = 0) · 맞는 열쇠 → 열림 · 줄 1 | check_jinhwa `off` · `key` | 통과 — 문 밖 12길(열쇠 없음 · 깊은 주소 · 짧은 열쇠 · 틀린 열쇠 · 403 · 404 · 못 닿음 · 보유종목 셋 · 앱 안 두 길) **offDeviceOpens 0** · 열쇠 없는 기기는 모듈 받음 0 · 서버 물음 0 · 주소 기록에 #/jinhwa 0 · 맞는 짝(열쇠 기기에서는 같은 셈이 그림 · 제목 · 줄을 셈) · 열쇠 기기 줄 1 |
| [9] 2 맨 위 두 줄 | 본질 줄 글자 = jinhwa.json essence · 「진화 n번째」 n = jinhwa.json n · 360×640 첫 화면 안 | check_jinhwa `key` | 통과 — 본질 줄 = 본질 파일 첫 줄(lang ko) · 「진화 3번째」 · 아래 막대 572px 위(본질 줄 156 · n 182) |
| [9] 3 기다리는 진화 셋 | 카드 수 = waiting 수 · 카드마다 이름 · 전 · 후 그림 · 섬기는 본질 · 세 사람 한마디 셋 · 예측 · pick 카드에만 「세 사람이 고른 것」 · 비면 「기다리는 진화 0」 · 자료 못 받으면 「?」 | check_jinhwa `key`(시험 자료 · 빈 자료 · 못 받음) | 통과 — 카드 3 = 3 · 그림 둘씩(못 받으면 「? 그림 없음」) · 세 사람 셋 · 표시 1번만 · 큰 것 + 위험 두 줄 · 빈 자료 「기다리는 진화 0」 · 못 받음 「?」. 「예측」은 화면에서 **「어림」**(words.js SCREEN 이 「예측」을 막음 — KE 와 같은 말) |
| [9] 4 확인 단추 | 카드마다 단추 1 · 누름 → 서버 상태 confirmed · 글 「확인함 · 다음 업데이트 ○시에 들어가요」(○ = 회차 30분 전 규칙으로 셈) · 누르기 전 서버 상태 없음 | check_jinhwa `key` · jinhwa.test | 통과 — ○ = 진화 회차 차례 흉내(회차마다 하나 · 되돌리기 먼저 · 이른 것부터 = KE planRound) · 둘째 확인은 다음 업데이트 · 시험 6갈래(주말 · 회차 뒤 누름 · 회차가 못 넣음 등) |
| [9] 5 거두기 | 다시 누름 → withdrawn · 들어간 것(applied)은 거둠 409 | check_jinhwa · jinhwa.test | 통과 — withdrawn · 다시 확인 가능 · 들어간 뒤 409 applied |
| [9] 6 진화한 것 | 날짜 차례 · 무엇이 바뀌었나 · 전후 그림 · 10거래일 채점 글 · 「되돌리기」 → revert · 다시 → kept | check_jinhwa · jinhwa.test | 통과 — 새 날짜부터 · 채점 전(score.at null)은 회차 글 · 「10거래일 뒤 · 맞았어요」 · 되돌린 것(reverted {at})은 단추 없이 「되돌렸어요 · 날짜」 · revert → kept |
| [9] 7 고친 고장 | 줄 수 = fixed 수 · 비면 「고친 고장 0」 | check_jinhwa | 통과 — 2 = 2 · 빈 자료 「고친 고장 0」 |
| [9] 8 함수 · 열쇠 · 읽기 주소 | POST 열쇠 없음 403 · 모르는 번호 404 · status 칸 = {id, state, at} 셋뿐 · 깃허브 열쇠 글자 0 | jinhwa.test · grep | 통과 — 403 · 404 · 409 · status 칸 셋 · KE normalizeStatus 가 그대로 읽음 · 깃허브 · 시험 열쇠 글자 0 · 올리는 함수 묶음에서 혼자 돎(invite.test) |
| [9] 9 새 대안 알림 | 내 몫 아님(진화 회차 예약 작업의 휴대폰 알림 — 리드 · KE) | 보고 | 해당 없음(KE · 리드) |
| [9] 10 한 화면 · 17 · 44 | 360×640 에서 본질 줄 · n · 첫 카드 이름 · 그림 · 확인 단추가 아래 단추 줄 위 · 17px 아래 글 0 · 44px 안 되는 누름 자리 0 · 가로 넘침 0 | check_jinhwa `key` · quick.mjs | 통과 — 확인 단추 542 < 572 · 320 · 360 · 390 · 영어 모두 넘침 · 17px · 44px 0 |
| [10] 1 잣대 셋 | 설정 파일에 셋(멈춤 · 약속 · 사실) · 서버 칸 넷(stop · stop_rest · promise · promise_yes) · 진화 칸에 셋 | tally.test · check_jinhwa | 통과 |
| [10] 2 참고만 | visit · share · signup 은 열쇠 있을 때만 보임 · 설정 reference · 진화 칸 접힌 「참고 · 잣대가 아니에요」 | tally.test · check_jinhwa | 통과 — 열쇠 없는 sum 에 ref 0 · 접힌 칸 |
| [10] 3 이름 · 기기 번호 · 쿠키 없이 | 저장소 열쇠 = 날짜 · 값 = 숫자만(시험이 저장소 전부를 훑음) · 받는 몸 = {k} 하나 · 쿠키 · 주소 안 읽음 · 막기(몸 크기 · 다른 사이트 · 하루 끝 수 · 초당 수) | tally.test | 통과 — 쿠키 · 인터넷 주소 · 브라우저 · 화면 주소를 보내도 저장소에 0 · 막기 넷 |
| [10] 4 처리방침 | privacy.html 에 합계 칸(한국어 · 영어 줄) | grep · quick `/privacy.html` | 통과 — 1장 합계 칸 · 2장 쓰는 곳 · 3장 두는 기간 · 영어 한 줄 · 세 폭 통과 |
| [10] 5 표본이 작으면 모음 | 설정 minSample · 30번 안이면 비율 글 0 · 「판단하지 않고 모아요」 | check_jinhwa | 통과 — 12번 「모으는 중」 · 40번 그대로 · 채점 셈 judge(표본 30 · 소음 \|z\| < 1.96)를 tally.mjs 한 곳에 |
| [10] 6 10거래일 뒤 채점 | 설정 scoreAfterTradingDays 10 · 화면에 score 글 | check_jinhwa | 통과 — 설정에 maxTradingDays 60(KE 와 같은 값 · [가정]) · sum 은 200일까지(앞 · 뒤 60거래일) · 날 칸 이름 day(KE normalizeTally 가 읽음 — 시험) |
| 신호 세 곳 | 끝냄 1번 = stop 또는 stop_rest 한 번 · 「쉬어 가자」 = stop_rest · 한 달 답 「했어」 = promise_yes · 「안 했어」 = promise · 쪽 열 때 visit 1 · 자동 브라우저는 0 · 몸 = {k} 만 | check_jinhwa `beacon` | 통과 — visit 1(화면 옮겨도 그대로) · stop_rest 1 · stop 1 · promise_yes · promise · 자동 브라우저 0 · 쿠키 · 넘겨준 주소 0 |
| 보고 7 | 진화 칸이 사장님 기기 밖에서 열린 수 0 | check_jinhwa offDeviceOpens | **0** |

남은 것(내 몫 밖 · 보고에 적음): 8826 시험 서버는 옛 invite_dev 코드로 떠 있음 — 다시 띄워야 열쇠 길을 봄(그 전엔 check_jinhwa 끝 코드 2 「못 봄」) · check_changed 가 lib/atlas11/(jinhwa|tally).mjs 에 두 시험을 안 붙임 · KE scoreApplied 가 설정 judge.noise 를 안 씀(tally.mjs judge 를 부르면 됨) · 영어 「{e} 소개」(app.js m4letter — 이름 바꾼 뒤 생긴 틀 · 내 글 아님).
