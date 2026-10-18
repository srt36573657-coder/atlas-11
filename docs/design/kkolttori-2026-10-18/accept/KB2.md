# KB2 카톡 줄 — 받아들이는 기준(먼저 씀 · 2026-10-18 17:15 싱가포르 · 17:35 이어받아 고침 · 18:10 결과 채움)

명령문 [6] 1 · 6 · 8 · 일 나누기 split.md · cards.md 「KB2 카톡 줄」 · 단추는 KB1 `site/next/share-btn.js` 의 `shareButtons(o, {kakao: true})` 하나만 부름.
검사 이름은 cards.md 대로 `scripts/atlas11/next/check_kakao.mjs`(split.md 의 check_kakao_rows 는 옛 이름 — 모든 쪽 검사는 `check_<영문>.mjs` 만 주움).
결과 숫자 = `node scripts/atlas11/next/check_kakao.mjs`(기본 범위 · 길 31 · 폭 360 · 320 · 390 · 19초 · 10월 13일 자료) 한 번.

| 항목 | 다 했다는 증거(잴 수 있는 것) | 어떻게 재나 | 결과 |
|---|---|---|---|
| [6] 1 줄마다 단추 하나 | 길마다 「종목 줄(data-kkrow) 수 = 카톡 단추 수」 · 줄마다 단추 1 · 줄 밖 종목 고리(뺀 꼴 목록 밖) 0 | `check_kakao.mjs` ①②③ | 통과 — 길 31 · 줄 2,604 = 단추 2,604 · 줄 밖 종목 고리 0(종목 고리 2,733 = 줄 안 2,603 + 뺀 꼴 130) |
| [6] 1 오른쪽 끝 · 44px | 단추 44 × 44px 이상 · 단추 오른쪽 끝이 줄 오른쪽 끝에서 24px 안 · 단추 오른쪽에 다른 칸 0 · 320 · 360 · 390 가로 넘침 0 | check_kakao ⑤(세 폭 · 접은 칸 펼침) | 통과 — 걸림 0 |
| [6] 1 모양 지킴 | 바꾼 길에서 quick 걸림(넘침 · 17px · 44px · 화면 오류) 0 | `quick.mjs --w 320,360,390`(17길 · 시험 기억 넣음) | 통과 — KB2 걸림 0(따로 1: `#/cal/<번호>` 를 숨긴 종목으로 열면 quick 이 「숨김 풀기」+「회사 보기」 글을 붙여 읽어 「기회」로 잡음 — 내 줄과 무관) |
| [6] 2 한 곳 | 내 파일의 카톡 단추는 모두 shareButtons 결과 · 제 단추 만드는 곳 0 | grep(kk-btn · 노랑 글 — share-btn.js 밖 0) | 통과 — 부르는 곳 16(app.js 2 · p-cal 2 · p-chx 1 · p-cond 1 · p-gdr 1 · p-hold 2 · p-rivals 1 · p-surge 3 · p-talk 1 · p-today 1 · p-why 1) · 제 단추 0 |
| [6] 6 안 엉킴 | 단추가 고리(a) 안 0 · 단추 누름 → 글상자(.ps-dlg) 열림 · 주소(#) 그대로 · 닫으면 자리 그대로 · 줄 고리 누름 → 그 종목 길로 감 | check_kakao ⑥(길마다 한 번씩 누름) | 통과 — 누름 39(단추 20 · 줄 고리 19) · 쪽 바뀜 0 · 고리로 안 간 것 0. **걸림 2**: `#/f/pick` · `#/today` 첫 줄(코렌텍 = 고른 곳)은 글상자에 이름 · 오늘 값이 안 들어감 — 고른 곳 56곳은 `co/<번호>.json` 에 값(c)이 없고 `comp.json` 에만 있는데 KB1 `p-share.js` coInfo 가 co 파일만 봄(KB1 · 리드에 알림) |
| [6] 8 급등 줄 | 급등 칩 · 급등 다섯 칸 · 달력 · 소식(뽑힘 · 옮김 · 빠짐) 줄의 단추 data-kind = surge · 그 밖 share | check_kakao ④ | 통과 — kind 다름 0(surge 2,366 · share 238) |
| 곳 수 표 | 아래 표(파일 · 함수 · 무슨 줄 · 몇 개) + 뺀 것과 까닭 | 아래 표 · check_kakao counts.places | 채움 — 곳 26(오늘 자료에 보인 곳 21) |

## 곳 수 표(오늘 자료 · 기본 범위 한 번 · 「—」 = 오늘 자료에 그 줄이 없음)

| 파일 · 함수 | 곳(data-kkrow) | 무슨 줄 | kind | 오늘 줄 수 |
|---|---|---|---|---|
| app.js chipList 큰 카드(coCard · surgeCard · leadCard) | chip.card | 칩 맨 앞 큰 카드 | 급등 칩 surge · 대장주 · 고른 곳 share | 3 |
| app.js crowLi(칩 한 줄 목록 · r.kk) | chip.row | 칩 한 줄 목록(이름 · % · 선) | 급등 칩 surge · 그 밖 share | 166(급등 35 · 대장주 76 · 고른 곳 55) |
| app.js vWatch 「다음 볼 것 · 같은 업종」 | watch.next | 회사 화면 같은 업종 회사 줄 | share | 6(더 보기마다 6) |
| app.js vChannel showCo | ch.grid | 업종 · 큰 업종 채널 회사 칸 | share | 32(채널 둘 · 20씩) |
| app.js vSub 관심 회사 | sub.co | 관심 회사 줄(관심 담음 단추 오른쪽) | share | 2(담은 수) |
| app.js vMe 본 기록 | me.hist | 본 기록 칸(옆으로 밂) | share | 7(12까지) |
| app.js vFind 회사 | find.co | 찾기 회사 줄 | share | 16(40까지) |
| p-cal.js trRowEl | cal.row | 달력 뽑힌 줄 | surge | 410 |
| p-cal.js trDay | cal.ev | 이동 · 탈락 · 다시 선택 줄 | surge | 1,280 |
| p-cal.js vCal 알림 | cal.alert | 새로 생긴 반 토막 · 거래 멈춤 | surge | — |
| p-cal.js vCal 숨긴 곳(이번에 더함 · kkIn) | cal.gone | 숨긴 곳 줄(되돌리기 오른쪽) | surge | 1(시험 기억) |
| p-chx.js rowEl(2단 업종) | chx.row | 업종 화면 회사 줄 | share | 12 |
| p-cond.js row | cond.row | 조건 찾기 결과 줄 | share | 7 |
| p-cond.js 「?」 줄 | cond.q | 값을 몰라 넣지 않은 곳 | share | — |
| p-gdr.js card | gdr.card | 골똘이 칸 카드 이름 줄 | share | —(오늘 고른 곳 0) |
| p-hold.js cardOf | hold.card | 보유 카드 이름 줄(회사 주식만) | share | 1 |
| p-hold.js news | hold.news | 관심 칸 소식 줄 | 뽑힘 · 옮김 · 빠짐 surge · 많이 움직임 share | 524 |
| p-rivals.js peerBars | rivals.peer | 5단 다른 회사 막대 줄 | share | 4 |
| p-surge.js board | surge.board | 급등 경주판 줄 | surge | 97(다섯 칸) |
| p-surge.js svRow | surge.row | 까닭 줄 | surge | 20 |
| p-surge.js svTrRow | surge.track | 며칠 뒤 줄 | surge | —(오늘 자료는 따라간 날 0 · 시험 자료로 32줄 · 320px 확인) |
| p-surge.js 숨긴 곳(이번에 더함 · kkIn) | surge.gone | 숨긴 곳 줄 | surge | —(시험 자료로 1줄 확인) |
| p-talk.js 큰 카드 | talk.card | 이야기 맨 위 회사 카드 | share | 1 |
| p-talk.js kkFact | talk.fact | 회사로 가는 이야깃거리 | share | 3 |
| p-today.js picks row | today.mv | 오늘 시장 고른 곳 줄 | share | 11 |
| p-why.js recBox | why.rec | 매매일지 기록 줄(회사 주식 · 고리 없이 이름 글) | share | 1(기록 수) |

## 뺀 것과 까닭(검사가 수를 셈 — counts.skipped · 오늘 130)

| 뺀 것 | 까닭 | 오늘 |
|---|---|---|
| 7단 길 고리(.chaps · 길 표시 · 4 ~ 7단 탭 · 다음 단 · p-co 「다음 4단」) | 그 회사 쪽끼리 오가는 길 — 줄 · 카드 아님 | 29 |
| 급등 달력 그날 들고 난 이름 목록(p-surge svNames) | 이름을 잇는 글 — 줄 · 카드 아님(같은 회사 줄은 경주판 · 까닭 줄에 단추) | 97 |
| 고른 곳 이름 알약(p-chx .pchx-chip) | 이름 알약 — 줄 · 카드 아님 | 3 |
| 종목 파일 쪽 「회사 보기 ›」(p-cal) | 쪽 자체가 그 종목 — 길 단추 | 1 |
| 글 속 이름(p-chx 선 못 그린 회사) · 친구 쪽 「이 회사 자세히 보기」(그 쪽은 KB1 「나도 보내기」) · 회사 하나뿐인 업종 줄 | 문장 안 이름 · 남의 쪽 · 업종 줄 | 0 |
| 회사 쪽 머리(3단 이름 · 오늘 값 · 4 ~ 7단 제목) · 종목 파일 머리 | 줄 · 카드가 아니라 쪽 자체가 그 종목 — 3단에는 「보내기」(같은 글상자)가 이미 있음 · **넣으라 하시면 다섯 자리** | 고리 없음 |
| 지수 카드(#/w/KOSPI · KOSDAQ) · 시황 카드 | 종목 아님(지수 · 업종 · 미국) | 고리 셈 밖 |
| 회사 주식 밖(찾기 펀드 · 우선주 줄 · #/x/ 밖 칸 · 보유 카드 펀드) | 받는 쪽에 회사 화면 · 값이 없어 보낼 카드가 깨짐 | 고리 셈 밖 |
| 질문 흐름 속 종목 띠 · 종목 고르기 단추(p-why) | 열한 질문을 마치는 게 먼저(본질 — 사기 전에 한 번 멈춤) · 끝낸 기록 줄에 단추 | 고리 없음 |
| 골똘이 칸 칸 단추(p-gdr .gdr-cell) | 누르면 아래 카드가 열리는 고르기 단추 — 그 카드에 단추 | 고리 없음 |
| p-co · p-past · p-grow · p-range · p-time · p-x | 종목 줄 · 카드가 없음(한 회사 쪽 · 봉인 셈 · 밖 칸) | 0 |
