# Brief — one full draft of the new 수르 (aaa7377.com), 11 designers in parallel

S = /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1238

You are one of 11 designers. Each builds ONE complete draft of the WHOLE site, first page to last page. Afterwards one strength line is taken from each draft and the final site is written again from an empty file. Work fast: finish within 15 minutes. Speed matters more than polish, but every rule below is a hard rule.

## The owner's order (today 11:16, word for word — this is the spec)
[목적] 1. 수르(aaa7377.com)를 전면 개편해라 2. 첫 장부터 끝 장까지 전부 새로 짜라 3. 잡스가 직접 만든다는 기준으로 정해라
[먼저 읽을 것] 1. 지금 수르 화면과 기록을 다 읽어라 2. 이전 수르 명령서를 찾아 기준으로 써라 3. 읽은 파일 이름을 목록으로 적어라 4. 기록은 버리지 말고 하나로 합쳐라
[화면 짜임] 1. 모든 화면을 움직이는 도식으로 만들어라 2. 그림이 화면 대부분을 차지하게 해라 3. 맨 위에는 가장 큰 값 하나를 둬라 4. 그 아래 중간 값, 그 아래 자세한 값 5. 맨 아래에 출처와 조사 날짜를 적어라
[흐름] 1. 첫 화면부터 끝까지 클릭 7번으로 해라 2. 클릭마다 다음 화면이 이어지게 해라 3. 글과 그림은 기승전결 순서로 짜라 4. 탭은 유튜브 앱처럼 짜라 5. 탭 순서도 기승전결로 놓아라
[안쪽 엔진] 1. 엔진은 육하원칙 칸으로 짜라 2. 값마다 누가·언제·어디서를 채워라 3. 무엇을·어떻게·왜도 채워라 4. 빈 칸은 화면에 「확인 필요」로 띄워라
[시안 11개 → 1개] 1. 시안 11개를 동시에 나눠 만들어라 2. 나눠 만들어 속도를 5배로 올려라 3. 시안마다 장점을 한 줄씩 적어라 4. 장점을 모아 1개를 새로 만들어라 5. 빈 파일에서 시작해라
[보고] 4. 모든 화면은 움직이는 그림이 주인이다 5. 없으면 없다고 보고해라

Your lens: 「{n}. {이름}」 — {묻는 것}. Push this lens as far as it goes; every rule below still applies.

## Read first (fast — skim, do not read everything)
- Today's site (the 7-step new 수르 you are replacing): /home/claude/atlas-11/site/su/su.js · su.css · su-data.js. Screens: {S}/final/ (p0–p5 = steps, q1 · q-res = 「왜 사?」, j1 · j2 = 내 매매일지).
- Essence (the yardstick): /home/claude/atlas-11/docs/수르_본질.md. Previous orders: /home/claude/atlas-11/docs/design/su-new-2026-11-04/order-1238.txt · learn11.md · order-1506.txt · order-1519.txt · /home/claude/atlas-11/docs/design/su-two-2026-11-03/order-2049.txt.
- Read only. Never edit anything under /home/claude/atlas-11.

## Data — {S}/data2.json (embed what you need; only numbers that are in it; never invent a number)
- home · companies · industries · summary · essence · why11 · bloomMeaning · safe: today's flowers and money companies, chosen by the site's own logic (as of `asOf`).
- records = ALL past records of the flower list: honest (2025-01-02 → 2026-10-02 · n 1,580 picks · 523 hits · 33.1 vs 24.38 for any company · 22 scored months · 13 better · 8 worse) · record_all · years · months (each month: its 3 conditions `say` and `rec` n · h · rate · base · score) · cal (last 60 days: n · hit · miss · wait · why) · why (why picks did not become a flower: counts per reason + names) · near (closest companies: 132 cases · 21 hits → 16 vs 26).
- journal_test = 3 TEST records of 「내 매매일지」 (the person's own 「왜 사?」 answers, kept only on their phone). Show them only as an example and say so on screen.
- 기록은 버리지 말고 하나로 합쳐라: every record above must be reachable in your draft, all in ONE records place joined to the flow — nothing dropped.

## Build — ONE standalone file
- {S}/full/d{NN}/index.html only. Inline CSS and JS. No CDN, no web fonts, no images from the web. System font stack. Light theme is enough.
- Routes you must have (the measuring tool opens them): `#/` first screen · `#/c/<code>` company · `#/i/<industry, URI-encoded>` industry. Add all other routes you need.

### Hard rules
1. Every screen is a moving diagram. The diagram is the main thing: at 390×844 the diagrams cover MOST of the first screen (aim for 55% or more of the area) and most of the page. At least two diagrams per page, each one explains a number on that page.
2. Order on every page, top to bottom: ONE biggest value (largest type on the page) → middle values (2–3) → detailed values → at the very bottom 출처 (네이버 증권 etc.) and 조사 날짜 (the data date and when it was taken).
3. Exactly 7 clicks from the first screen to the end. One big 「다음」 button per page continues to the next screen (screen 1 → click 1 → screen 2 … click 7 → the last screen). You decide what the last screen is. Mark the step quietly (e.g. 3 / 8). Tabs and other links may exist, but the 7-click path must work with the big button alone.
4. 기승전결 for words and pictures: each diagram animates in four beats — 기 frame → 승 values grow → 전 the turn (the honest base: any company 24.38, near 26, the 8 worse months, the miss reasons) → 결 the big value marked. Each beat 0.3–0.6 s, ≤2 s total, plays once, ease-out, only transform / opacity / stroke-dashoffset, no loop, blink or shake. prefers-reduced-motion: reduce → final state at once. Words: what you look at → the number → 「그런데」 the honest counter-fact → 「그래서」 a calm next step.
5. Tabs like the YouTube app: fixed bottom bar, icon above a short Korean label, active tab = filled icon + bold label (not color alone), each tab ≥ 48px, tab order 기 → 승 → 전 → 결 (you name the four tabs, 1–3 syllables).
6. 5W1H engine: in your JS every value on screen comes from ONE engine function that returns six cells {누가, 언제, 어디서, 무엇을, 어떻게, 왜} for that value. Show the six cells on screen for the values (your lens decides how — a small six-cell picture, a row, a tap-to-open card). An empty cell is shown as 「확인 필요」 — never hidden, never invented. 왜 is always a past fact from the data.
7. Steve Jobs standard: one idea per screen; remove everything that does not help find the company that may become a flower or help the person pause before buying.

### Keep exactly
- Top bar with the name 수르; on every page 「지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.」
- Every rate is shown with its base at the same visual weight (33.1 vs 24.38 · 16 vs 26). Worse months are visible. data.bloomMeaning exactly.
- Korean only, short easy sentences a child understands, no English on screen (company names are fine).
- Never on screen: 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 · countdowns · 「지금 바로」 · bragging about gains. No new sentence with a percent sign (data values are fine).
- Every text ≥ 17px (body ≥ 19px), every tap target ≥ 48px, designed at 360 wide, no sideways scrolling.

## Check
1. `node /home/claude/atlas-11/scripts/atlas11/jinhwa/sample.mjs --shoot {S}/full/d{NN} --data {S}/data2.json` — fix until ok is true.
2. `node {S}/strip.cjs {S}/full/d{NN} "#/" <the next 7 routes of your 7-click path, in order>` → {S}/full/d{NN}/strip.png (8 first screens side by side). Look at it once with the Read tool and fix what is broken.

## Final message — Korean, exactly this form, nothing else (no report file)
```
## {n}. {이름}
- 장점 한 줄: <one line, ≤ 60 characters: what · where · why it helps>
- 일곱 번: <screen 1 → … → screen 8, short names + routes>
- 탭: <four names in order + routes>
- 그림: <total number of moving diagrams> 개 — <page: diagram names, short>
- 그림 넓이: <figShareFirstScreen numbers that strip.cjs prints for your 8 screens (svg · canvas · figure · [data-fig] area on the first 390×844 screen)>
- 여섯 칸: <how the six cells are shown · which cells came out 「확인 필요」>
- 기록 하나로: <how the records are joined, one line>
- 잰 값: <the --shoot numbers, one line>
- 샘플: {S}/full/d{NN}
```
Write only inside {S}/full/d{NN}. If you could not build it: 「- 샘플: 못 만듦 — <까닭>」 and 「- 장점 한 줄: 없음」.
