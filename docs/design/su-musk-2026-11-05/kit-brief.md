# 무하 공용 부품(kit) — 일꾼 둘이 서로 모르게 하나씩(주문 1023 · 심사 2회 뒤 3회 판)

## 왜
심사 둘째 판(judge-r2.md)에서 서른여섯 판정 가운데 「예」는 하나. 열두 쪽마다 따로 그린 얼굴 · 머리카락 · 띠가 같은 약점을 되풀이했다.
1. 머리카락이 한 굵기의 관 · 뿔 · 더듬이(옆으로 뻗음) 2. 윤곽선이 어디나 한 굵기 3. 이름표가 사다리꼴 · V자 · 화살 끝 4. 얼굴이 졸리고 뚱하고 시무룩함 · 손가락이 소시지 5. 막대가 민 알약 · 눈금이 회색 점선
→ 이 다섯을 **한 번 아주 잘** 그리는 공용 부품을 만든다. 다음 판에서 열두 쪽 일꾼이 모두 이것을 쓴다.

## 만들 파일(이것만 — 다른 파일은 고치지 않는다)
- `site/su/su-mucha-kit-<a 또는 b>.js` · `site/su/su-mucha-kit-<a 또는 b>.css`(이름은 맡은 글자)
- 시험 그림 · 스크립트는 scratchpad 안 너의 폴더에만.

## 지켜야 할 것(사이트 규칙 · 검사가 막음)
- ES 모듈 · `document.createElementNS('http://www.w3.org/2000/svg', …)` 와 `setAttribute` 로만 그림. innerHTML · outerHTML · insertAdjacentHTML · `style` 속성 · `.style` 금지.
- 색은 CSS 클래스로(`.mk-…`). 얼굴 살 · 머리 · 옷 · 두루마리 바탕은 **고정 색**(어두운 판에서도 크림 · 상아 · 파스텔 그대로 — 1회 심사 지적). 어두운 판에서 바뀌어야 할 것만 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }` 와 `:root[data-theme="dark"] …` 둘 다에.
- 같은 입력 → 같은 그림(Math.random 금지 · `seed` 로 정한 가짜 난수).
- 가볍게: 메달 하나 요소 220개 안 · 얼굴 하나 60개 안 · 파일 둘 합쳐 40KB 안(첫 화면이 느린 휴대폰에서 2.5초 안에 떠야 함).
- 글자는 넣지 않는다(이름 · 값은 각 쪽 일꾼이 넣음). 부품은 그림만.

## 내보낼 것(이름 · 인자 그대로 — 다음 판 일꾼이 이 꼴로 부름)
```js
export const CSS = '/su/su-mucha-kit-<a|b>.css';
export function svg(tag, attrs = {}, ...kids)                 // 요소 하나(attrs 값이 null/undefined 면 안 씀 · kids 는 배열도 받음)
export function taper(pts, {w0 = 4, w1 = 0.5, cls = 'mk-ink'} = {})   // pts=[[x,y],…] 를 지나는 부드러운 곡선(Catmull-Rom) 을 굵기 w0 → w1 로 가늘어지는 **채운 모양** 하나(<path>) · 시작은 둥글게, 끝은 뾰족하게
export function strands(pts, {n = 7, spread = 9, w0 = 2.6, w1 = 0.25, curl = 0.6, seed = 1, cls = 'mk-hair0'} = {})  // 머리 한 타래 — pts 를 따라 가는 올 n 가닥(뿌리에서 모였다 흩어짐 · 가닥마다 조금씩 다른 굽이 · 끝은 curl 만큼 말리며 사라짐) · <g>
export function face({cx, cy, h = 40, dir = 1, view = 'profile', tilt = 0, cls = ''} = {})  // 얼굴(h = 이마~턱 높이 px · dir 1 = 오른쪽을 봄 · -1 = 왼쪽 · view 'profile'(옆얼굴) | 'three'(반측면 3/4) · tilt 도) · <g>
export function hair({cx, cy, h = 40, dir = 1, tone = 0, flow = 'down', len = 2.4, seed = 1} = {})  // 얼굴 둘레 머리(정수리 덩어리 + 어깨 · 등으로 **아래로** 흐르는 타래 셋 넘게 · len = 얼굴 높이의 몇 배 길이 · tone 0~7 머리색) · face 보다 먼저(뒤에) 깐다 · <g>
export function medallion({cx, cy, r, v = 0, dir = 1, ring = 'mosaic'} = {})  // 둥근 메달 하나 — 후광 원판(테 · ring 'mosaic'|'petal'|'stars') + 반측면이나 옆얼굴 + 아래로 흘러 **테 밖으로 넘치는** 머리 + 꽃 · 보석 머리장식 + 목까지 덮는 옷깃 · v 0~7 은 서로 다른 여인(머리색 · 장식 · 방향 · 얼굴 각도가 다름) · <g data-mucha="halo">
export function scroll({x, y, w, h, ends = 'both', tone = 'cream'} = {})  // 양끝이 말린 둥근 두루마리 띠(이름표 · 깃발) — 몸통 + 말린 끝(속이 보이는 둥근 말림) + 가는 금 겹테 · tone 'cream'|'rose'|'sage'|'gold' · 글 자리 = 반환한 <g> 의 `dataset.ix` `iy` `iw` `ih`(안쪽 상자 · 끝 말림을 뺀 자리)
export function stemBar({x, y, len, dir = 'up', w = 14, tip = 'bud', tone = 'gold', seed = 1} = {})  // 막대 한 개를 꽃대로 — (x,y) 가 밑동 · 몸통 길이는 **len 그대로**(값 = 길이 · 둥근 끝 포함) · dir 'up'|'right'|'left'|'down' · 가는 금 겹테 · 끝 장식(tip 'bud'|'leaf'|'none')은 몸통 밖에 늘 같은 크기로(막대끼리 길이 비가 바뀌지 않게) · tone 'gold'|'rose'|'sage'|'red'|'blue'
export function vine(pts, {w0 = 5, w1 = 1, leaves = 6, buds = 3, seed = 1} = {})  // 굵기가 변하는 덩굴 한 줄기 + 크기 · 간격이 들쭉날쭉한 잎과 봉오리 · <g data-mucha="vine">
export function beads(x0, y0, x1, y1, {gap = 9, r = 1.5} = {})  // 금빛 점줄(눈금 · 기준선 대신) · <g>
export function rays(cx, cy, r0, r1, {n = 40} = {})            // 아주 옅은 후광 빛살(빈 면을 채움 · 글 · 값을 가리지 않을 만큼 옅게) · <g>
export function sleeve({x, y, ang = 0, len = 40, w = 16, hand = 'rest', dir = 1, tone = 'ivory'} = {})  // 손목까지 덮는 긴 소매 팔 + 가늘고 긴 손(hand 'rest' 내려놓음 | 'hold' 쥠 | 'touch' 뺨 · 머리에 댐) — 손가락은 가늘고 긴 곡선 넷(덩어리 · 소시지 금지) · <g>
```

## 그림 솜씨 잣대(무하 원전 — docs/design/su-musk-2026-11-05/mucha-guide.md 를 먼저 읽기)
- **얼굴**: 갸름한 달걀꼴 · 작고 둥근 턱 · 긴 목(아래로 살짝 굵어짐). 눈은 **내리깐 아몬드 꼴** — 윗눈꺼풀 선이 굵고(속눈썹 몇 올) 아래는 가늘게, 눈동자는 반쯤 보임 · 잠든 눈 · 조는 눈 · 흘기는 눈 아님. 눈썹은 가늘고 길게 휜 선. 코는 그늘 쪽 한 줄. 입은 작고 도톰하게(위 입술 큐피드 활 · 입꼬리 살짝 올림 · 일자 입 금지). 볼에 옅은 분홍. 바깥 윤곽은 그늘 쪽 굵게 · 빛 쪽 가늘게(taper).
- **머리카락**: 뿌리 굵게 → 끝 머리카락처럼 가늘게 사라지는 **가는 올 다발**. 다발은 모였다 흩어지며 S 로 흐르고 끝은 소용돌이로 말림. 정수리 덩어리에도 결(가는 선). 옆으로 뻗는 뿔 · 더듬이 · 관 금지 · 어깨 · 등 · 후광 둘레로 **아래로** 흐름 · 몇 가닥은 메달 테 밖으로 넘침.
- **선**: 인물 바깥선은 모두 taper(굵게 들어가 가늘게 빠짐). 선 색은 짙은 세피아(검정 아님).
- **두루마리**: 몸통은 살짝 휘고(곧은 사다리꼴 아님) 양끝이 안으로 말린 원통 말림(말린 속이 한 톤 어둡게) · 금 겹테 · 모서리 각 없음.
- **꽃대 막대**: 위가 둥근 기둥 · 가는 금 겹테 · 안쪽에 가는 금 결 한 줄 · 끝에 작은 봉오리나 잎 · 알약 · 네모 금지.
- **색**: 살 #F7E6D6 언저리 · 볼 #F0B9A8 · 선 #5B3A29 · 금 #C9A24A / #E3C77A · 머리색 여덟(적갈 · 꿀 · 밤 · 장밋빛 금 · 짙은 갈색 · 딸기 금 · 잿빛 금 · 구리) · 파스텔(복숭아 · 쑥 · 크림 · 장미).

## 일하는 차례(40분 안)
1. mucha-guide.md · judge-r2.md 읽기(10분 안).
2. 부품을 쓰고, 「견본 한 장」을 찍는다: 개발 서버 http://127.0.0.1:8840/su/ 를 Playwright 로 열고 `page.evaluate` 로 `await import('/su/su-mucha-kit-<a|b>.js?v=' + Date.now())` · CSS 는 `<link>` 로 붙인 뒤 body 를 견본 SVG 하나로 바꿔 찍는다(viewBox 0 0 390 620 · 2배 그림). 견본에 넣을 것: 메달 v0~v7 여덟(r 46 언저리) · 큰 얼굴 둘(h 90 · 옆얼굴 · 반측면, 머리 hair 포함) · 두루마리 넷(tone 넷) · 꽃대 막대 다섯(길이 40 · 80 · 120 · 160 · 200 · 끝 장식 포함) · 덩굴 하나 · 점줄 · 빛살 · 소매 손 셋(rest · hold · touch). 밝은 판 · 어두운 판 둘 다.
3. 견본을 **4배로 크게 잘라** 얼굴 · 머리 · 손을 직접 보고, 위 잣대와 judge-r2.md 공통 약점 다섯에 하나라도 걸리면 고친다(적어도 세 번 고쳐 찍기). 엄한 무하 심사위원 눈으로.
4. 끝나면 scratchpad 안 너의 폴더에 `sampler-light.png` · `sampler-dark.png` · `READY`(빈 파일)를 둔다.

## 보고(한국어 · 다섯 줄 안)
만든 파일 · 견본 그림 경로 · 요소 수(메달 하나 · 얼굴 하나) · 파일 크기 · 스스로 본 남은 약점.
