# KC 첫 화면 본질 세 줄 — 잣대 먼저(order-1639 [5] 1 ~ 8)

맡은 파일: `site/next/essence.js`(새) · `site/next/app.js` 새 함수 `essenceBox()` + vHomeAll 한 줄 + 약속 칸 한 줄 · `site/next/app.css` 「본질 세 줄」 묶음 · `scripts/atlas11/next/build_data.mjs`(받은 때 · 지난 7일 업데이트 수) · `site/hello.html` · `site/next/index.html` · 「하루 4번」 글 줄(p-today 397 · p-info 58 · p-surge 196 · 439 · p-cal 206) · `scripts/atlas11/next/next_check.mjs` 첫 화면 차례 · 날짜 셈(이 칸만 따로 — [5] 8)
17:27 이어받은 뒤 더한 것: `essence.js` FOUR_ALT · fourText · fourDeep(「하루 4번」 글 바꿈 표 한 곳) · 네 쪽(p-today · p-info · p-surge · p-cal)이 요약(sum)을 받아 어느 길로 열어도 같은 글 · 옛 쪽 맞대기 검사 셋(check_misc · check_surge · check_cal)이 옛 글을 같은 표로 바꿔 맞댐 · next_check 본질 칸 검사 · verify/vh.mjs · measure.mjs 가 이 칸을 따로 셈 · 영어 17줄

| 항목 | 다 됐다는 증거(잴 수 있게) | 어떻게 잼 | 결과 |
|---|---|---|---|
| [5] 1 | 첫 화면 `#view` 안 차례 = 칩 → 본질 칸(`section.ess`) → 이야기 입구 · 처음 온 기기 = 펼침(세 줄 보임) · 다시 온 기기 = 접힘(보이는 글 한 줄 · 누르면 세 줄) · 저장소가 막힌 기기 = 펼침 · 오류 0 | 브라우저 셋(새 기기 · 같은 기기 다시 · 저장소 막음) | 통과 — 390×844 · 360×640 · 320×568: 새 기기 펼침(칸 205 · 233 · 260px · 질문 칸 위 끝 478 · 505 · 533 < 화면 높이) · 다시 열면 접힘 48px · 누르면 세 줄 · 저장소 막음 = 두 번 다 펼침 · 오류 0 · next_check 새 검사(새 칸 펼침 · 본 기기 접힘) 걸림 0 |
| [5] 2 | 세 줄 글 = `essence.js` `ESSENCE` 틀(사장님 글자 그대로) · 화면 글 = `essenceLines(essenceData(…))` | 소스 맞대기 · 화면 글 맞대기 | 통과 — 화면 세 줄 = essenceLines 셈 글자 그대로(next_check · 본질 문 ② 지나감) |
| [5] 3 | n = `/atlas/data/mkt.json` 회사 수(손으로 박은 수 0) · 받은 때 = 자료를 만든 업데이트 기록의 받은 때(모르면 「?」 · 3일 넘으면 앞에 「?」) | 노드 셈 = 화면 글 · 자료 바꿔치기(회사 수 · 받은 때) | 통과 — n 2,557 = mkt.json 회사 칸 2,557(= mkt.n) = 요약 coN · 받은 때: 이 기계 자료는 「?」(home.json made 10-14 05:00:58Z 와 같은 받은 기록 없음) · 바꿔치기 3시간 전 → 「10월 18일 15시」 · 100시간 전 → 「? 10월 14일 14시」 금빛 · 없음 → 「?」 금빛 |
| [5] 4 | `home-summary.json` 에 `updates7`(서울 날마다 수) · `fourADay` · 오늘 기록으로 false · 「하루 4번」 글 6곳은 fourADay 가 true 일 때만 | 기록 다시 셈 · 소스 셈(6곳) | 통과 — 받은 수(정해진 업데이트): 10/11(일) 8(4) · 10/12 23(5) · 10/13 25(4) · 10/14 24(4) · 10/15 21(4) · 10/16 20(3) · 10/17(토) 15(1) → fourADay false · 6곳 모두 참인 말(「업데이트 때마다 새로 받아요」 · 「정해진 업데이트 때 …」) · 따로 다시 센 수 같음 |
| [5] 5 | 「(이름)의 고민 1분 보기 ›」(VIDEO.title) = `VIDEO.ready` 가 true 일 때만(오늘 0개) · 이름 · 제목은 brand.js 에서 | 화면 셈 · ready 바꿔치기 | 통과 — ready false 0개 · brand.js 바꿔치기 ready true → 「골똘이의 고민 1분 보기 ›」 44px · /hello.html#hp-vid · 영어 「Watch Golttori's Dilemma · 1 min ›」 |
| [5] 6 | 소개 쪽 맨 위 세 줄 + 설명 · 미리보기 설명 · 첫 화면(`/next/index.html`) 설명 · 미리보기 설명 = 세 줄(숫자 없는 꼴) · 소개 쪽 글에 영상 약속 0(ready false 동안) | 파일 셈 | 통과 — hello.html 세 줄 · description · og:description · next/index.html description · og:description = ESSENCE_PLAIN · 영상 칸은 ready 전 숨김(hello-send.js) |
| [5] 7 | 새 한국어 글마다 영어 한 줄(add.mjs) · 영어 화면에 남은 틀 0 | quick.mjs --en | 통과 — 17줄 더함 · quick --en(#/ · /hello.html · #/info · #/today · #/surge · #/surge/10 · #/cal) 걸림 0 · 세 꼴(받은 때 있음 · 오래됨 · 모름) 영어 남은 틀 0 |
| [5] 8 | 이야기 입구 밑 세 덩이(띠 · 질문 칸 · 이름 칸(section.gdr)) 그대로 · 본질 칸은 next_check 차례 · 날짜 셈에서 따로 셈(주석 [5] 8) | next_check 첫 화면 칸 | 통과 — next_check 차례에 section.ess · 날짜 셈에서 뺌(칸 안 날짜 1개까지 따로) · verify/vh.mjs 날짜 · 같은 숫자 셈에서 뺌 · measure.mjs 첫 화면 숫자에서 빼고 essNums 로 따로 |
| 빠른 검사 | `#/` 320 · 360 · 390 · `/hello.html` · 영어 — 걸림 0 | quick.mjs | 통과 — 펼침 · 접힘(seed) 둘 다 0 · 영어 360 0(영어 320 위 막대 단추 셋 43×44 — #/me 도 같음 · 이 칸 탓 아님) |
| 바뀐 쪽 검사 | check_changed(내 파일) 실패 0 | check_changed.mjs 한 번 | 짝 검사를 가장 작은 범위로: check_misc --only info 0 · check_surge --limit 1 0 · check_cal --limit 1 --wide 1 0 · check_today --variants 0 0 · next-modules 6/6 · 본질 문 ② 지나감 · next_check --limit 2 = 78건 모두 남의 것(업종 칸 수 77 — 채널 칸 카톡 줄 · 친구 소개 줄 1 — 영상 숨김) · check_changed 전체(14개)는 안 돎(이 기계 2코어에서 30분 넘음) |

## 오늘 그려지는 세 줄(이 작업 폴더 자료 · 2026-10-18 17:4x 싱가포르)

1. 주식을 사기 전에 「왜 사?」 열한 질문으로 내 이유부터 확인해요.
2. 앞날을 맞히지 않아요. 코스피와 코스닥 회사 2,557곳의 지난 기록만 보여 줘요. — 2,557 = `site/atlas/data/mkt.json` companies 칸 수(mkt.n 2,557 · 10월 13일 자료) → `build_data.mjs` essenceFacts → `site/next/data/home-summary.json` coN
3. 사고팔기를 권하지 않아요. 숫자는 네이버 증권에서 받아요. 마지막으로 받은 때: ?. — 「?」 = `site/atlas/data/home.json` made(2026-10-14T05:00:58.000Z)와 같은 받은 기록이 `reports/atlas11/t365/updates/` 에 없음 → fetchedAt null. 올릴 때(깃허브 실행기)는 회차가 기록 `<받은 때>.json` 을 쓰고 home.json made 가 같은 때라 「10월 18일 ○시」가 됨.

「하루 4번」 셈(받은 기록 = served rolled · 네이버 일봉 받음 · 실패 아님 · 서울 날짜 · 오늘 뺀 7일): 위 [5] 4 칸. 명령문 [0] 의 「10월 17일 9번」과 다름 — 같은 기록으로 15번(손 올림 14 · 18:00 정해진 업데이트 1). 어느 셈이든 4번이 아님.
표 밖으로 둔 「하루 4번」(옛 쪽과 글자 맞대기 · 자료 글): p-time 「회차마다(하루 4번)」(0거래일일 때만) · p-up 제목 「업데이트 기록 — 하루 4번」 · surge.json 「하루 4번 업데이트(10:00 · …) 때만 넣고 빼요」 · core.json rules.next — 정해진 때를 말하는 글.
