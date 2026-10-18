# KB1 카톡 속 — 잣대 먼저(order-1639 [6] 2 ~ 5 · 7 · 8 · 9 · [7] 1 ~ 8)

맡은 파일: `site/next/share-btn.js`(새) · `site/next/p-share.js` · `p-share.css` · `site/next/kakao.js` · `config/atlas11/kakao.json` · `scripts/atlas11/site_headers.mjs` · `scripts/atlas11/next/check_share.mjs` · `tests/atlas11/kakao-client.test.mjs` · `docs/design/godori-2026-10-18/kakao-signup.md` 맨 위 · `site/next/app.css` 「카톡 단추」 묶음(단추 모양 한 곳 · 앱 모든 쪽에 붙어 있어서)

| 항목 | 다 됐다는 증거(잴 수 있게) | 어떻게 잼 | 결과 |
|---|---|---|---|
| [6] 2 | `shareButtons` 정의가 저장소에 한 곳(share-btn.js) · p-share.js 는 다시 내보냄 · `shareButtons(o, {kakao: true})` = `button.kk-btn` 하나 44 × 44 · 노란 말풍선 svg · 글 속 style 0 | 시험 ⑲(소스 셈) · check_share `kk`(크기 · 색 잼) | |
| [6] 3 | 카톡 단추 1번 → 글상자 열림 · 종목 이름 · 오늘 값이 글상자에 보이고 보낼 글에 저절로 들어감(칠 글자 0) · 줄 고리(`<a>`) 안에 둔 단추를 눌러도 주소(hash) 그대로 | check_share `kk` | |
| [6] 4 | 빠른 말 누름 = 바로 보냄 · 열쇠 있음(가짜 도구) → 카톡 친구 고르기(`Kakao.Share.sendDefault`) 1번 · 카톡 단추부터 누름 수 = 2 | check_share `kk` · `env` | |
| [6] 5 | 내 말 + 「보내기」 · 거르는 말 · 수익 숫자는 그대로 막힘(공유 창 0) | check_share ③ 그대로 | |
| [6] 7 | 보낸 뒤 쪽 위치(scrollY) · 주소 그대로 · 폭죽 · 캔버스 · 축하 글 0 | check_share `kk` | |
| [6] 8 | 급등(`kind: 'surge'`) — `/next/data/half36.json` 이 있으면 카드 · 보낼 글에 「36곳 중 n곳이 1년 안에 반값 아래로 떨어진 적 있어요」(n = 파일 값) · 파일이 없거나 깨지면 그 줄 0 | check_share `kk`(파일 바꿔치기: 있음 · 없음 · 깨짐) | |
| [6] 9 | 친구가 연 쪽 「나도 보내기」 — 질문을 다 답하기 전 0개 · 다 답한 뒤 1개 · 누르면 글상자 | check_share `land` | |
| [7] 1 | 스위치 둘 — 공유(`SHARE`) · 가입(`SWITCH` = config `on` = 편지 쪽 `KAKAO_ON`) 따로 · config 에 `share` 칸 | 시험 ⑯ | |
| [7] 2 | 공유 스위치 = 자바스크립트 열쇠 · 도구 주소 · 무결성 셋이 다 찼을 때만 켜짐 · 오늘은 꺼짐 · 꺼지면 카카오 요청 · 도구 0 | 시험 ⑯ ⑲ · check_share `off` | |
| [7] 3 | 열쇠 있음(가짜 도구) → feed 카드 한 장 · 종목 이름 · 보낸 말 · 보낸 날 값 · 단추 「열어 보기」 하나 · 수익 숫자 0 | 시험 ⑱ · check_share `kk` | |
| [7] 4 | 열쇠 없음 · 도구가 던짐 → 휴대폰 공유 창 → 그것도 없으면 글 + 주소 복사 | check_share ④ ⑤ · `kk` | |
| [7] 5 | 가입이 켜지면 카드 단추 「카카오로 시작하기」 · 「그냥 보기」 | 시험 ⑱ · check_share `card` | |
| [7] 6 | 열쇠 없음 = 보안 머리말이 오늘과 바이트 같음 · 열쇠 있음 = script-src 에 카카오 도구 주소 하나만(다른 줄 바뀜 0) | 시험 ⑳(두 상태) | |
| [7] 7 | 네 곳 흉내(카톡 안 · 아이폰 · 안드로이드 · 컴퓨터) — 곳마다 누름 수 · 간 길(kakao · share · copy) 적음 · 실제 폰 · 실제 카카오는 「?」 | check_share `env` | |
| [7] 8 | `kakao-signup.md` 맨 위 「카톡 공유 켜기」 다섯 줄 | 파일 맨 위 5줄 | |
