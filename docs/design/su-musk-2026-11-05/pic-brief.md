# 그림 부품 한 장 — 일꾼 열하나에게(주문 1023 「머스크 판 4」)

## 사장님 말씀(원문)
- 「너무 글이 많다. 지면 신문 구조를 유지하면서 움직이는 그림이 70%가 되게끔 UI/UX를 대수정하라 … 알폰스 무하에 대해 더 공부한 후 그의 화풍이 짙게 묻어 나오게 하라」
- 「정말 아름답게, 정말 아름답게 수르가 되어야 한다. 알폰스 무하의 그림에서 여인의 곡선, 그 풍만함을 수르에 녹여야 한다. 정말 아름답게」
- 명령서 원문: docs/design/su-musk-2026-11-05/order-1023.txt · 무하 공부: docs/design/su-musk-2026-11-05/mucha-guide.md(먼저 읽기)

## 새 쪽 짜임(내가 짓는 틀 — 너는 그림 부품만)
위에서 아래로: 머리 줄(수르 · 걸음 · 찾기) → 큰 값 한 줄 → **너의 그림(화면의 70% 넘게)** → 설명 두 줄 → 출처 → 접힌 「자세히」 서랍 → 아래 다음 단추 · 탭
- 휴대폰 390×844 에서 그림은 폭 390 · 높이 620 안팎(viewBox 0 0 390 620, 화면에 폭 100%로 그림 → 높이 620px · 화면의 73%)
- 이름과 숫자는 그림 안 이름표(<text>)로 — 그림 밖에 글을 두지 않는다
- 값 그래프(줄 · 막대 · 점판)의 모양은 바꾸지 않는다(같은 값 → 같은 높이 · 같은 차례) — 무하 틀과 장식은 그 둘레에
- 장식이 값 · 이름표를 가리면 그 장식을 뺀다

## 무하 요소(그림마다 다섯 넘게 · 요소마다 data-mucha 이름표)
halo(후광 원) · arch(아치 틀) · outline(굵기가 변하는 윤곽선 — 선 대신 채운 모양) · whiplash(흐르는 소용돌이 곡선) · vine(꽃과 덩굴 띠) · mosaic(모자이크 테두리) · pastel(파스텔 색면과 금빛) · lettering(그림에 녹인 글씨) · panel(세로 장식 판) · stars(별과 달)
- 그 요소의 맨 바깥 <g> 에 data-mucha="halo" 처럼 달기 — 검사가 이름 수를 셈(다섯 넘게)

## 지켜야 할 것(검사가 막는 것)
1. 파일은 너에게 정해 준 새 파일만 만든다 — 다른 파일은 고치지 않는다
2. 모듈은 ES 모듈 · document.createElementNS 와 setAttribute 로만 그림 — innerHTML · outerHTML · insertAdjacentHTML · style 속성 · .style 금지(사이트 보안 규칙 style-src 'self')
3. 꾸밈은 너의 CSS 파일(site/su/<이름>.css)에 클래스로 — 색은 su-art.css 의 변수(--bg --card --ink --mute --gold --gold2 --leaf --apri --apri2 --halo --no --ok --base) · 어두운 판에서도 보이게
4. 움직임은 CSS 클래스(transform · opacity 만) · prefers-reduced-motion: reduce 면 멈춤 · 한 번에 둘 이상이 함께 크게 움직이지 않게(천천히, 무하처럼 흐르게)
5. 그림 안 글씨는 CSS 로 17px 넘게(이름표 18 ~ 22px) · 글씨 둘레에 바탕색 테(paint-order: stroke)로 또렷하게
6. 누르는 이름표(<a href="#/c/<번호>">)는 누르는 자리 48 × 48 넘게(투명한 rect 를 함께)
7. 화면 글은 쉬운 한국어 · 영어 낱말 · 「추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박」 금지 · 새 문장에 「%」 금지(그림 안 값 이름표의 단위는 됨)
8. 여인은 무하처럼 곡선과 풍만함 — 그러나 여고생도 보는 화면: 흐르는 긴 옷 · 맨살 드러냄 없음

## 부품 꼴(열하나 모두 같게 — 내가 쪽에 끼울 수 있게)
```js
// site/su/<너의 이름>.js — ES 모듈 · 다른 파일을 고치지 않음 · '/su/su-fig.js' 의 h · s(요소 만들기)는 불러 써도 됨
export async function load(get, arg) {}   // get(url) = 사이트가 쓰는 받기(같은 주소는 한 번만 받음 · 못 받으면 null) · arg = 회사 번호 등(없으면 null)
export function picture(d, opt = {}) {}  // load 가 준 것으로 <svg viewBox="0 0 390 620"> 하나를 만들어 돌려줌(class 에 'su-svg su-art4' 와 너의 이름)
export const CSS = '/su/<너의 이름>.css'; // 너의 꾸밈 파일 주소
```
- 자료가 없거나 모자라면 picture 는 빈 그림 대신 「확인 필요」 이름표가 든 그림을 돌려줌(멈추지 않음)
- 시험 쪽에서 부르는 법: `const M = await import('/su/<이름>.js'); const get = u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null); const svg = M.picture(await M.load(get, arg));`

## 낼 것
1. 모듈 파일과 CSS 파일(정해 준 이름)
2. 시험 쪽: /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1238/art4/<너의 이름>/ 안에 index.html(모듈을 불러 진짜 자료로 그림) · shot.png(390×844 · deviceScaleFactor 2 · 어두운 판 shot-dark.png)
   - 진짜 자료는 시험 서버 http://127.0.0.1:8840 에 있음(/su/data/su21.json · /su/data/su21-map.json · /next/data/… · /atlas/data/…) — 이 서버는 저장소 site/ 를 그대로 보여 줌(네 새 모듈도 /su/<이름>.js 로 보임)
   - 시험 쪽은 같은 서버에서 열어야 모듈을 부를 수 있음: 시험 쪽 파일을 site 아래에 두지 말고, playwright 로 http://127.0.0.1:8840/su/ 를 연 뒤 page.evaluate 로 import('/su/<이름>.js') 해서 그 쪽 위에 그려 찍기
3. 스스로 잰 숫자: 그림 넓이(390×844 화면에 큰 값 줄 아래 놓았을 때 몇 %) · 무하 요소 이름 수 · 가장 작은 글씨 px · 48px 아래 누르는 곳 수 · 화면 밖으로 넘친 것 수
4. 다섯 줄 안쪽 보고(쉬운 한국어)
- 시간: 30분 안 · 다른 일꾼의 파일은 열지 않는다(서로 모르게)
