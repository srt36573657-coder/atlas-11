# 카카오 공식 카드 — 꺼 둔 채 준비만(명령문 [4] 9)

사장님 원문(2026-10-17 21:10 싱가포르 · `order-2110.txt` [4] 9): 「카카오 공식 카드는 꺼 둔 채 준비만 하라. 카카오 앱 열쇠와 보안 규칙 허락이 있어야 켠다.」

## 지금
- 꺼짐. `site/next/p-share.js` 의 `KAKAO = {on: false, key: '', sdk: '', integrity: ''}` — 바깥 스크립트를 하나도 받지 않는다(`kakaoLoad()` 는 `on` 이 false 면 바로 끝).
- 보내기는 그대로: 글상자(「친구에게 무슨 말을 할래?」) → 휴대폰 공유 창(카카오톡이 그 안에 있음) → 공유 창이 없으면 글 + 주소 복사 → 복사도 막히면 글을 보여 줌.

## 켜려면 — 세 가지가 모두 있어야 함
1. **카카오 앱 열쇠(사장님 계정)** — developers.kakao.com 에서 앱을 만들고 [앱] > [플랫폼 키] > JavaScript 키를 받는다. 그 키에 사이트 주소(`https://aaa7377.com`, 시험 서버를 쓰면 그 주소도)를 등록한다. 이 키는 화면 코드에 그대로 들어가는 공개 키다(등록한 주소에서만 돎).
2. **보안 규칙 허락(사장님 승인 먼저 — 명령문 [7] 2 「보안 규칙을 깨지 마라. 깨야 하면 먼저 보고하라」)**
   - `scripts/atlas11/site_headers.mjs` 의 `HEADER_TOP` 보안 머리말: `script-src 'self'` → `script-src 'self' https://t1.kakaocdn.net`
   - `site/hello.html` 의 `<meta http-equiv="Content-Security-Policy">` 같은 자리 — 머리말과 meta 가 **둘 다** 허락해야 열린다(하나라도 막으면 막힘).
   - 보안 머리말 값을 보는 검사(`scripts/atlas11/t365/inspect4.mjs` CIA 눈 등)의 기대 값도 같이 바꾼다.
   - **[따져 보지 않은 생각]** 카카오 도구가 보내기 창을 열 때 `sharer.kakao.com` 으로 폼을 보내면 `form-action` 에, 서버를 부르면 `connect-src` 에 카카오 주소가 더 필요할 수 있다. 켜기 전에 시험 서버에서 브라우저 콘솔의 보안 규칙 위반 줄을 보고 꼭 필요한 주소만 더한다.
3. **코드 한 줄** — `p-share.js` 의 `KAKAO` 를 채운다.
   ```js
   const KAKAO = Object.freeze({on: true, key: '<JavaScript 키>', sdk: 'https://t1.kakaocdn.net/kakao_js_sdk/<판>/kakao.min.js', integrity: '<그 판의 SRI 값>'});
   ```
   - 판 · SRI 값은 카카오 다운로드 쪽에서 그대로 옮긴다(2026-10-17 에 본 마지막 판 = 2.8.3 · 2026-09-03 공개 · SRI 값은 그 쪽 「Copy SRI hash」). `integrity` 가 비면 받지 않는다 — 그 회사 파일이 바뀌어도 우리 사이트 안에서 다른 코드가 돌지 않게 판을 묶는다.

## 켠 뒤 도는 길
- 글상자를 열 때 `kakaoLoad()` 가 도구를 미리 받아 `Kakao.init(key)` — 보내기를 누를 때 기다림 없이 바로 부르기 위해서(휴대폰은 누른 순간 안에서만 창을 열어 줌).
- 「보내기」 → 거르는 말 · 수익 숫자 막기(그대로) → `kakaoSend()` = `Kakao.Share.sendDefault({objectType: 'text', text, link: {mobileWebUrl: url, webUrl: url}, buttonTitle: '열어 보기'})` → 안 되면 지금처럼 휴대폰 공유 창 → 복사.
- 그림이 든 카드를 원하면 `objectType: 'feed'`(제목 · 설명 · `https://aaa7377.com/og-makbi.jpg` 그림 · 고리)로 바꿀 수 있다 — 글은 같은 거르기를 지난 것만.
- 주소는 지금과 같다(회사 주식 `#/s/<번호>/<보낸 날>/<그날 값>/<s|a>/<말>`) — 친구는 질문부터 본다.

## 켤 때 함께 할 검사
- `scripts/atlas11/next/check_share.mjs` 에 가짜 카카오(`globalThis.Kakao` 흉내 — `isInitialized` · `Share.sendDefault` 가 받은 글과 주소를 적어 둠) 길을 더해, 글 + 주소가 함께 가는지 · 거르는 말이 먼저 막는지 · 실패하면 공유 창으로 넘어가는지 본다.
- `node scripts/atlas11/next/check_share.mjs --mutate …`(검사 자체 시험)도 다시 돌린다.

## 근거
- 카카오 자바스크립트 도구 시작하기(스크립트 꼴 · `Kakao.init` · 키 자리): https://developers.kakao.com/docs/en/javascript/getting-started
- 카카오 자바스크립트 도구 받기(마지막 판 · 공개 날 · SRI): https://developers.kakao.com/docs/latest/en/javascript/download
