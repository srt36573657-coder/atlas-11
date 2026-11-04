# Brief — one full draft of the new 수르 (aaa7377.com): Mucha-like beauty · easy words · expert information · 11 designers in parallel

S = /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1238

You are one of 11 designers. Each builds ONE complete draft of the WHOLE site (8 screens). Afterwards one strength line is taken from each draft and the final site is written again from an empty file. Finish within 12 minutes. Every rule below is a hard rule.

## The owner's order (today 13:33, word for word — this is the spec)
[목적] 1. 수르(aaa7377.com)를 전면 개편해라 2. 첫 장부터 끝 장까지 전부 새로 짜라 3. 잡스가 직접 만든다는 기준으로 정해라
[화면 짜임] 1. 모든 화면을 움직이는 도식으로 만들어라 2. 그림이 화면 대부분을 차지하게 해라 3. 맨 위에는 가장 큰 값 하나를 둬라 4. 그 아래 중간 값, 그 아래 자세한 값 5. 맨 아래에 출처와 조사 날짜를 적어라
[아름다움] 1. 알폰스 무하의 그림처럼 아름답게 해라 2. 부드러운 곡선 테두리와 꽃 장식을 써라 3. 색은 은은한 금빛·연두·살구빛으로 맞춰라 4. 화면 한 장 한 장을 포스터처럼 완성해라 5. 장식이 값과 글을 가리지 않게 해라 (예뻐도 안 읽히면 쓸 수 없다) 6. 아름다움과 읽기 쉬움을 함께 지켜라
[흐름] 1. 첫 화면부터 끝까지 클릭 7번으로 해라 2. 클릭마다 다음 화면이 이어지게 해라 3. 글과 그림은 기승전결 순서로 짜라 4. 탭은 유튜브 앱처럼 짜라 5. 탭 순서도 기승전결로 놓아라
[안쪽 엔진] 1. 엔진은 육하원칙 칸으로 짜라 2. 값마다 누가·언제·어디서를 채워라 3. 무엇을·어떻게·왜도 채워라 4. 빈 칸은 화면에 「확인 필요」로 띄워라
[쉬운 말과 전문가 정보] 1. 주식 모르는 여고생 눈높이로 써라 2. 그 학생이 혼자 읽고 알게 해라 3. 주식 낱말은 쉬운 말로 바꿔라 4. 못 바꾸면 옆에 한 줄 풀이를 붙여라 5. 정보는 전문가 수준으로 넣어라 6. 숫자는 공식 자료와 원문에서만 가져와라 7. 숫자마다 「그래서 무슨 뜻」을 붙여라 8. 쉽게 하려고 정보를 빼지 마라 9. 전문가용 자세한 값은 눌러야 열리게 해라
[보고] 2. 가장 아름다운 화면 3장을 먼저 보여라 7. 무하의 그림처럼 아름답고 그림이 움직인다 8. 없으면 없다고 보고해라

Your lens: 「{n}. {이름}」 — {묻는 것}. Push this lens as far as it goes; every rule below still applies.

## Head start (allowed for drafts only)
The structure work was done one round ago. You MAY start from the earlier draft with your number, {S}/easy/e{NN}/index.html (read its report in {S}/easy/reports.md, section 「## {n}.」), copy it into your folder and spend your time on BEAUTY through your lens — or start fresh if your lens needs a new skeleton. Keep everything that draft already did right (easy words, glosses, 「그래서」 lines, expert drawer, six cells, 7 clicks, tabs).

## Read first (fast — skim)
- The current final build's 8 first screens (structure reference): {S}/final2/easy-b.png · {S}/final2/easy-c.png
- Essence: /home/claude/atlas-11/docs/수르_본질.md. Read only — never edit anything under /home/claude/atlas-11.

## Data — {S}/data2.json (embed what you need; only numbers that are in it; never invent a number)
Same meanings as before: 꽃 = a company that rose 5% more than the market over the following month. rate / base = out of 100, how many became a flower (picks / any company on the same days). n, hits, baseN, baseHits = counts. ex / exBase = average one-month move above the market (each capped ±50). fall / fallBase = out of 100, how many moved 5 or more BELOW the market. days, pickDays, months, up, down, scored. plain · plainN · old · oldN: meaning NOT confirmed → expert drawer only, with 「뜻 확인 필요」. Sources: prices from 네이버 증권 daily closes; records counted by 수르 from those prices — say exactly this.

## Build — ONE standalone file
- {S}/art/a{NN}/index.html only. Inline CSS, inline SVG, inline JS. No CDN, no web fonts, no images from the web, no copied artwork — draw your own Art Nouveau ornaments (flowing whiplash curves, stylised flowers, leaves, halos, arches) in inline SVG. System font stack.
- Routes: `#/` first screen · `#/c/<code>` company · `#/i/<industry, URI-encoded>` industry · plus the other routes of your 7-click path.

### Beauty rules (new this round)
B1. Mucha-like: soft curved frames (arched tops, round halos behind the main value or figure, rounded double borders), flower and leaf ornaments, flowing lines. Original drawings only.
B2. Colours: soft gold, 연두 (light yellow-green), 살구 (apricot), on an ivory paper background, with a deep ink for text. Measure contrast: body text ≥ 4.5:1 against its background; big values ≥ 3:1. Figures use the same palette; picks vs any company stay at the same visual weight and stay distinguishable without colour alone (label or pattern).
B3. Every screen is a finished poster: a framed composition from top (big value) to bottom (source and date).
B4. Ornaments never cover values or text: decorative layers are `aria-hidden`, `pointer-events: none`, placed in margins, corners, behind empty space or around frames. Check with bounding boxes that no ornament rectangle overlaps any text element's rectangle more than 0 px² on the 390×844 first screen of all 8 screens.
B5. Ornaments move: they draw in once inside the same four beats (≤ 2 s total), and prefers-reduced-motion shows the final state.
B6. Beauty never wins over reading: every text ≥ 17px (body ≥ 19px), every tap target ≥ 48px, designed at 360 wide, no sideways scrolling.

### All earlier rules still apply
1. Every screen is a moving diagram; diagrams cover MOST of the first 390×844 screen (aim 60%+). Ornaments do not count as diagrams.
2. Top to bottom: ONE biggest value → middle values → detailed values → at the very bottom 출처 and 조사 날짜.
3. Exactly 7 clicks from the first screen to the end with one big 「다음」 button (8 screens).
4. 기승전결 for words and pictures (frame → values grow → 「그런데」 the honest base / the misses → 「그래서」 the big value marked; ≤ 2 s, plays once).
5. YouTube-like bottom tabs, 4, in 기승전결 order, active = filled icon + bold label.
6. 5W1H engine: every value has six cells {누가, 언제, 어디서, 무엇을, 어떻게, 왜}; empty → 「확인 필요」 visible.
7. Easy words for a high-school girl who knows nothing about stocks; replace stock words; if a word cannot be replaced, a one-line plain gloss right next to it (no hover-only).
8. Expert information: nothing removed; the expert detail lives in a drawer that opens only on tap (「전문가용 자세히」).
9. Every number gets 「그래서 무슨 뜻」 — one plain sentence under it.
10. Keep exactly: top bar with 수르; on every page 「지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.」; every rate with its base at the same visual weight; worse months visible; data.bloomMeaning exactly; Korean only on screen (company names are fine). Never on screen: 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 · countdowns · 「지금 바로」. No new sentence with a percent sign (data values are fine).

## Check
1. `node /home/claude/atlas-11/scripts/atlas11/jinhwa/sample.mjs --shoot {S}/art/a{NN} --data {S}/data2.json` — fix until ok is true.
2. `node {S}/strip.cjs {S}/art/a{NN} "#/" <the next 7 routes of your path, in order>` → strip.png + figShareFirstScreen numbers. Look at strip.png once with the Read tool and fix what is broken or ugly.

## Final message — Korean, exactly this form, nothing else
```
## {n}. {이름}
- 장점 한 줄: <one line, ≤ 60 characters: what · where · why it is beautiful or helps>
- 아름다움: <frames · ornaments · palette with hex codes · how they move>
- 가리지 않음: <the overlap check result (0 px² or not) · lowest text contrast measured>
- 가장 아름다운 쪽: <route> — <one line why>
- 일곱 번: <screen 1 → … → screen 8, short names + routes>
- 탭: <four names in order>
- 그림: <total moving diagrams> 개 · 그림 넓이: <figShareFirstScreen numbers for the 8 screens>
- 남은 어려운 낱말: <number> 개 — <the words>
- 잰 값: <the --shoot numbers, one line>
- 샘플: {S}/art/a{NN}
```
Write only inside {S}/art/a{NN}. If you could not build it: 「- 샘플: 못 만듦 — <까닭>」 and 「- 장점 한 줄: 없음」.
