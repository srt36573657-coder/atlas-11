# 쇼 판 — 무하의 세 여인이 요즘 옷(샤넬 느낌)을 입고 무대 쇼처럼 · 지금 21과 될 듯 21을 한눈에(주문 1249 · order-1249.txt)

사장님 원문(2026-11-08 12:49 서울): 「지금 시대에 맞게 알폰스 무하에 그림을 현대 옷 샤넬 로 입히고 쇼를 하듯 이동영상 처럼 꾸미고 잡스라면 어떻게 너가 만든 지금과될듯을 한눈에 보이개 할것인지를 에이전트가 11개 토론하고 작업해서 샘픔을 만든다음 샘플들에 장정을 한곳에 모아 1개를 만들어라 2시간이내에 다 만들고 알겠지」

## 영상(사장님이 보낸 것 · 무대 느낌만 빌림)
세로 휴대폰 영상 · 아이돌 무대 쇼츠. 보라 · 자홍 무대 조명 · 뒤에 흰 점 빛 벽(LED 점 격자) · 위에서 내리꽂는 조명 줄기 · 반짝이는 바닥 반사 · 가운데 한 사람(센터)과 양옆 춤꾼 · 검정 치마 · 흰 깃 · 검정 스타킹 같은 흑백 옷 · 굵은 노랑 자막(검정 테두리).
장면 모음 사진: /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1249/v/sheet.png (낱장 f01 ~ f14.png). **영상 속 사람의 얼굴 · 몸 · 이름 · 방송 로고는 그리지 않는다.**

## 만드는 것 — 첫 화면 큰 그림 하나(SVG · viewBox 폭 390 · 높이 자유)
1. **무하 화풍의 세 여인**(불장 · 꽃이 될 · 돈이 몰리는 — 지금 그림 site/su/su-women-e.js 의 세 여인)에게 **요즘 파리 고급 옷**: 트위드 부클레 재킷 · 스커트(가장자리 땋은 테) · 진주 여러 줄 · 검정 리본 · 동백꽃 한 송이 · 투톤 구두 · 검정 원피스 · 평범한 마름모 누빔 가방 · 흑백에 금 한 점. 무하의 아치 · 후광 · 소용돌이 머리채 · 덩굴 테는 남긴다.
2. **무대 쇼**: 조명 줄기 · 빛 점 벽 · 바닥 반사 · 이름표가 차례로 켜지는 등장 · 여인이 걷거나 몸을 흔드는 움직임.
3. **지금 21(셋 × 일곱)과 될 듯 21(셋 × 일곱)이 한눈에** — 잡스라면 어떻게 나눌까(한 무대 · 두 줄 · 하나의 큰 생각 · 덜어냄).
- **상표**: 「샤넬」 「CHANEL」 글자 · 두 C 겹친 무늬 · 향수병 같은 특정 상품 모양은 넣지 않는다. 옷의 흐름(트위드 · 진주 · 흑백)만.
- 실제 사람(가수 · 모델)을 닮게 그리지 않는다. 옷은 단정하게(무릎 근처 길이 · 몸에 맞는 재킷).

## 그림 잣대(심사 여덟 번에서 배운 것 · judge-r7.md · judge-r8.md)
- 큰 여인이 그림을 채울수록 점수가 높다(메달 속 작은 흉상은 낮다). 둥근 어깨 · 부피 있는 몸(마른 패션 삽화 체형 금지) · S 자 자세.
- 윤곽선은 굵게 시작해 끝에서 가늘게(taper) · 속선은 1 아래 · 손은 가늘고 긴 손가락(뭉툭한 덩어리 금지) · 머리채는 가는 가닥 대여섯 다발(밧줄 · 관 · 전선 금지).
- 값 칸이 글자 상자 · 앱 카드처럼 보이면 낮다 — 이름표는 그림의 일부(리본 · 진주 · 조명 칸 · 꽃)로.

## 파일 · 꼴(지키지 않으면 합치지 못함)
- 너의 폴더 …/scratchpad/s1238/site-live/show/<id>/ 에 **art.js · art.css 만** 쓴다. 저장소(/home/claude/atlas-11) 파일 · 다른 폴더는 읽기만. git 금지.
- art.js 꼴(지금 그림과 같음): `export const CSS = '/show/<id>/art.css';` · `export async function load(get) { try { return (await get('/su/data/su21.json')) ?? null; } catch { return null; } }` · `export function picture(d, opt = {})` → svg 요소(`class` 에 `su-svg su-art4`, `role: 'img'`, `aria-label`).
- 그리기: `import {s} from '/su/su-fig.js'` 의 s(tag, attrs, ...kids)만(createElementNS · setAttribute). **innerHTML · style 속성 · element.style 금지.** 모양은 SVG 속성, 색 · 움직임은 art.css 의 클래스.
- 공용 부품 `/su/su-mucha-kit.js`(face · hair · strands · taper · sleeve · rays · vine · beads · ribbon · plaque · scroll …)를 써도 된다 — 부품 파일은 고치지 않는다. 부품 색 클래스는 /su/su-mucha-kit.css(이미 실림).
- **이름표**: 회사마다 `s('a', {href: '#/c/' + c.code, 'data-k': 목록, 'data-name': c.name, 'aria-label': …}, …)`. 목록 = 지금 `hot` · `bloom` · `money`, 될 듯 `hotNext` · `bloomNext` · `moneyNext` — d.lists 의 차례 그대로 일곱씩. 지금 셋에서 두 목록에 함께 든 곳(d.overlap 의 name)은 이름 앞 ✦ · aria-label 에 「두 목록에 함께」. 될 듯에는 ✦ 를 붙이지 않는다.
- 값 글(이름 옆 작은 값): site/su/su-women-e.js 의 valText(c, k) · valText(c, k, true) 와 같은 셈을 너의 파일에 옮겨 쓴다.
- 글: 한국어만(회사 이름 속 영문은 괜찮음) · 쓰지 않을 말 0(추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 · 지금 바로) · 새 문장에 % 금지(값 글만).
- 크기: 글자 크기 21 넘게 권장(17 아래는 사이트 검사가 막음) · 이름표 누름 자리 320 폭에서 48 × 48 px 넘게(viewBox 60 × 60 넘게) · 글 겹침 0 · 글이 그림 밖으로 나가지 않음.
- 무거움: svg 안 요소 1,100 아래 · 흐림 필터(feGaussianBlur 등)는 되도록 쓰지 않음(느린 휴대폰 첫 그림 2.5초 안) · 큰 그림 · 이름표는 처음부터 보이게(투명 0 에서 시작 금지 — 0.35 넘게에서 시작).
- 움직임: art.css 의 `@media (prefers-reduced-motion: no-preference)` 안에서만 · transform · opacity 만 · 등장은 2.4초 안에 한 번 · 조명 · 빛 점 같은 느린 반복은 괜찮음 · reduce 면 끝 모습 그대로.
- 무하 요소에 data-mucha 이름(halo · hair · arch · vine · whiplash · lettering · panel · mosaic · outline · stars · pastel 등) **다섯 가지 넘게**.
- 「한눈에」 — 390 폭에서 그림 높이가 한 화면(844)에 가까울수록 좋다. 넘더라도 1.4 화면 안.

## 재기 · 사진
- 보기: http://127.0.0.1:8840/show/view.html?x=<id> (개발 서버가 이미 떠 있음 — 새로 띄우지 않는다)
- 재기: `cd /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1238/site-live/show && node tool.mjs <id>` → ok · fails · warn · 사진(<id>/shot-a.png 0.7초 · shot-b.png 4.5초 · screen.png 첫 화면 390 × 844). **fails 0 이 될 때까지.**
- 사진은 Read 로 직접 본다(2배). 필요하면 잘라 크게 본다(얼굴 · 손 · 옷 · 글).

## 토론(…/show/debate.md — 덧붙이기만 · 남의 줄은 고치지 않음 · `cat >> debate.md <<'X'` 로)
1. 시작 8분 안: `## <id> 생각` 세 줄(무엇을 · 잡스라면 왜 · 쇼는 어떻게).
2. 15분쯤: debate.md 를 읽고 다른 샘플 둘에 `## <id> → <상대 id>` 한 줄씩(빌릴 것 하나 · 걱정 하나). 네 생각을 바꾼다면 `## <id> 고침` 한 줄.
3. 끝: `## <id> 끝` 세 줄 — 남이 빌려 갈 만한 장점 셋 · 약점 하나.

## 끝 — 13:40(서울)까지
- fails 0 인 art.js · art.css · 사진 셋 · check.json.
- 보고(한국어 다섯 줄): 잡스 생각 한 줄 · 쇼 한 줄 · 옷 한 줄 · 숫자(요소 수 · 그림 높이 · 화면 수) · 장점 셋.
