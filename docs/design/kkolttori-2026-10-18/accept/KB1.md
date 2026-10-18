# KB1 카톡 속 — 잣대 먼저(order-1639 [6] 2 ~ 5 · 7 · 8 · 9 · [7] 1 ~ 8)

맡은 파일: `site/next/share-btn.js`(새) · `site/next/p-share.js` · `p-share.css` · `site/next/kakao.js` · `config/atlas11/kakao.json` · `lib/atlas11/kakao.mjs` · `scripts/atlas11/site_headers.mjs` · `scripts/atlas11/next/check_share.mjs` · `tests/atlas11/kakao-client.test.mjs` · `docs/design/godori-2026-10-18/kakao-signup.md` 맨 위 · `site/next/app.css` 「카톡 단추」 묶음(단추 모양 한 곳 · 앱 모든 쪽에 붙어 있어서)

잰 것(2026-10-18 18:5x 싱가포르 · 시험 서버 127.0.0.1:8826): `check_share.mjs --w 360`(모든 묶음) 69초 실패 0 · 고른 곳 고친 뒤 `--only kk,static --w 360` 실패 0 · `tests/atlas11/kakao-client.test.mjs` 22/22 · 검사 자체 시험 5가지(kk-nav · quick-wait · again-early · half-made · pick-noval) 모두 잡음 · KA 본질 문 ⑥ 통과

| 항목 | 다 됐다는 증거(잴 수 있게) | 어떻게 잼 | 결과 |
|---|---|---|---|
| [6] 2 | `shareButtons` 정의가 저장소에 한 곳(share-btn.js) · p-share.js 는 다시 내보냄 · `shareButtons(o, {kakao: true})` = `button.kk-btn` 하나 44 × 44 · 노란 말풍선 svg · 글 속 style 0 | 시험 ⑲(소스 셈) · check_share `kk`(크기 · 색 잼) | 통과 — 정의 1곳 · 44 × 44 · fill rgb(254, 229, 0) · 이름표 「<이름> 카톡으로 보내기」 · style 0 |
| [6] 3 | 카톡 단추 1번 → 글상자 열림 · 종목 이름 · 오늘 값이 글상자에 보이고 보낼 글에 저절로 들어감(칠 글자 0) · 줄 고리(`<a>`) 안에 둔 단추를 눌러도 주소(hash) 그대로 | check_share `kk` | 통과 — 글칸 0자 · 보낸 글 첫 줄 = 「이름 · 그날 값」(co · fb · nd · off · env 모두) · 고리 안 단추 눌러도 주소 그대로 · 고른 곳(회사 파일에 c 없음 · comp.json 만) 100120 뷰웍스도 이름 · 29,800원이 저절로(코디네이터 · KB2 알림) |
| [6] 4 | 빠른 말 누름 = 바로 보냄 · 열쇠 있음(가짜 도구) → 카톡 친구 고르기(`Kakao.Share.sendDefault`) 1번 · 카톡 단추부터 누름 수 = 2 | check_share `kk` · `env` | 통과 — 누름 2 에 카톡 친구 고르기(가짜 도구) · 네 곳 모두 2 |
| [6] 5 | 내 말 + 「보내기」 · 거르는 말 · 수익 숫자는 그대로 막힘(공유 창 0) | check_share ③ 그대로 | 통과 — 막은 말 5 · 걸렸을 때 공유 창 · 카드 0 |
| [6] 7 | 보낸 뒤 쪽 위치(scrollY) · 주소 그대로 · 폭죽 · 캔버스 · 축하 글 0 | check_share `kk` | 통과 — 보던 자리 y 2808 → 2808 · 주소 그대로 · 폭죽 0 |
| [6] 8 | 급등(`kind: 'surge'`) — `/next/data/half36.json` 이 있으면 카드 · 보낼 글에 「1년 전 날아오른 36곳 중 n곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요」(n = 파일 값 · 리드가 정한 글) · 파일이 없거나 깨지면(또는 못 센 곳이 있으면) 그 줄 0 | check_share `kk`(파일 바꿔치기: 있음 · 없음 · 깨짐) | 통과 — 있음 = 「… 36곳 중 18곳이 …」(파일 n 18 · of 36) · 없음 · 깨짐 = 0줄 |
| [6] 9 | 친구가 연 쪽 「나도 보내기」 — 질문을 다 답하기 전 0개 · 다 답한 뒤 1개 · 누르면 글상자 | check_share `land` | 통과 — 다섯 경우 모두 전 0 · 뒤 1 · 누르면 글상자(주소 그대로) |
| [7] 1 | 스위치 둘 — 공유(`SHARE`) · 가입(`SWITCH` = config `on` = 편지 쪽 `KAKAO_ON`) 따로 · config 에 `share` 칸 · 서버 lib 도 맞춤 | 시험 ⑯ | 통과 — config `share`(원본 invite.json 세 칸) · lib `signupOn` · `shareOn` · `SHARE_FIELDS` · 화면 · 머리말 · 서버가 같은 상태 |
| [7] 2 | 공유 스위치 = 자바스크립트 열쇠 · 도구 판 · 무결성 셋이 다 찼을 때만 켜짐 · 오늘은 꺼짐 · 꺼지면 카카오 요청 · 도구 0 | 시험 ⑯ ⑲ ㉑ · check_share `off` | 통과 — 오늘 SHARE false(invite.json 열쇠 · 무결성 빔) · 꺼짐 길 카카오 요청 0 · 도구 0 |
| [7] 3 | 열쇠 있음(가짜 도구) → feed 카드 한 장 · 종목 이름 · 보낸 말 · 보낸 날 값 · 단추 「열어 보기」 하나 · 수익 숫자 0 | 시험 ⑱ · check_share `kk` | 통과 — 보낸 카드 4장 맞댐 |
| [7] 4 | 열쇠 없음 · 도구가 던짐 → 휴대폰 공유 창 → 그것도 없으면 글 + 주소 복사 | check_share ④ ⑤ · `card` ③ · `env` | 통과 — 도구 없음 · 던짐 = 공유 창 · 열쇠 없음 = 아이폰 · 안드로이드 공유 창 / 카톡 안 · 컴퓨터 복사 |
| [7] 5 | 가입이 켜지면 카드 단추 「카카오로 시작하기」 · 「그냥 보기」 · 꺼지면 「열어 보기」 하나 | 시험 ⑱ · check_share `card` · `kk` | 통과 |
| [7] 6 | 열쇠 없음 = 보안 머리말이 오늘과 바이트 같음 · 열쇠 있음 = script-src 에 카카오 도구 주소 하나만(다른 줄 바뀜 0) | 시험 ⑳(두 상태 · package.mjs addInvite 셈과 맞댐) | 통과 — 오늘 SHARE_TOP = HEADER_TOP 바이트 같음 · 열쇠 있음 = 한 줄 · 주소 하나 · package.mjs 와 같은 값 · 두 번 안 더함. HEADER_TOP 자체는 늘 그대로 둠(옛 쪽 네 눈 점검이 「script-src 'self';」를 찾아서 — 더하면 열쇠 넣는 날 옛 쪽 회차가 막힘) |
| [7] 7 | 네 곳 흉내(카톡 안 · 아이폰 · 안드로이드 · 컴퓨터) — 곳마다 누름 수 · 간 길(kakao · share · copy) 적음 · 실제 폰 · 실제 카카오는 「?」 | check_share `env` | 흉내 8/8 통과 — 열쇠 있음 네 곳 = kakao(누름 2) · 열쇠 없음 = 카톡 안 copy · 아이폰 share · 안드로이드 share · 컴퓨터 copy(누름 2) · 진짜 카톡 안 「?」 · 진짜 아이폰 「?」 · 진짜 안드로이드 「?」 · 진짜 컴퓨터 「?」 |
| [7] 8 | `kakao-signup.md` 맨 위 「카톡 공유 켜기」 다섯 줄 | 파일 맨 위 5줄 | 통과 — ① 앱 이름 골똘이 ② 자바스크립트 열쇠 ③ aaa7377.com 등록 ④ 열쇠 넣는 곳 ⑤ 실제 폰으로 한 번 |
