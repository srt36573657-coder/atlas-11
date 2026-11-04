# Brief — one full draft of the new 수르 (aaa7377.com): easy words, expert information · 11 designers in parallel

S = /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1238

You are one of 11 designers. Each builds ONE complete draft of the WHOLE site, first page to last page. Afterwards one strength line is taken from each draft and the final site is written again from an empty file. Finish within 15 minutes. Speed matters, but every rule below is a hard rule.

## The owner's order (today 13:07, word for word — this is the spec)
[목적] 1. 수르(aaa7377.com)를 전면 개편해라 2. 첫 장부터 끝 장까지 전부 새로 짜라 3. 잡스가 직접 만든다는 기준으로 정해라
[먼저 읽을 것] 1. 지금 수르 화면과 기록을 다 읽어라 2. 이전 수르 명령서를 찾아 기준으로 써라 3. 읽은 파일 이름을 목록으로 적어라 4. 기록은 버리지 말고 하나로 합쳐라
[화면 짜임] 1. 모든 화면을 움직이는 도식으로 만들어라 2. 그림이 화면 대부분을 차지하게 해라 3. 맨 위에는 가장 큰 값 하나를 둬라 4. 그 아래 중간 값, 그 아래 자세한 값 5. 맨 아래에 출처와 조사 날짜를 적어라
[흐름] 1. 첫 화면부터 끝까지 클릭 7번으로 해라 2. 클릭마다 다음 화면이 이어지게 해라 3. 글과 그림은 기승전결 순서로 짜라 4. 탭은 유튜브 앱처럼 짜라 5. 탭 순서도 기승전결로 놓아라
[안쪽 엔진] 1. 엔진은 육하원칙 칸으로 짜라 2. 값마다 누가·언제·어디서를 채워라 3. 무엇을·어떻게·왜도 채워라 4. 빈 칸은 화면에 「확인 필요」로 띄워라
[쉬운 말과 전문가 정보] 1. 주식 모르는 여고생 눈높이로 써라 2. 그 학생이 혼자 읽고 알게 해라 3. 주식 낱말은 쉬운 말로 바꿔라 4. 못 바꾸면 옆에 한 줄 풀이를 붙여라 5. 정보는 전문가 수준으로 넣어라 6. 숫자는 공식 자료와 원문에서만 가져와라 7. 숫자마다 「그래서 무슨 뜻」을 붙여라 8. 쉽게 하려고 정보를 빼지 마라 (빼면 전문가가 쓸 수 없다) 9. 전문가용 자세한 값은 눌러야 열리게 해라
[시안 11개 → 1개] 1. 시안 11개를 동시에 나눠 만들어라 2. 나눠 만들어 속도를 5배로 올려라 3. 시안마다 장점을 한 줄씩 적어라 4. 장점을 모아 1개를 새로 만들어라 5. 빈 파일에서 시작해라
[보고] 3. 어려운 낱말이 몇 개 남았는지 세어라 5. 말은 여고생이 알고, 정보는 전문가 급이다 6. 모든 화면은 움직이는 그림이 주인이다 7. 없으면 없다고 보고해라

Your lens: 「{n}. {이름}」 — {묻는 것}. Push this lens as far as it goes; every rule below still applies.

## Read first (fast — skim)
- The site that is live right now (you are replacing it): /home/claude/atlas-11/site/su/su.js · su-six.js (육하원칙 엔진) · su-fig.js (그림) · su-why.js (「왜 사?」 · 매매일지) · su.css. Its 8 screens: {S}/easy/now-1to4.png · {S}/easy/now-5to8.png. Its strengths table: /home/claude/atlas-11/docs/design/su-full-2026-11-04/learn11-full.md · order-1616.txt.
- Words already used on the old site for plain Korean: /home/claude/atlas-11/site/next/glossary.js (낱말표) · /home/claude/atlas-11/site/next/words.js (쓰지 않을 말).
- Essence: /home/claude/atlas-11/docs/수르_본질.md. Read only — never edit anything under /home/claude/atlas-11.

## Data — {S}/data2.json (embed what you need; only numbers that are in it; never invent a number)
Same data as the live site (as of `asOf`): home · companies · industries · summary · essence · why11 · bloomMeaning · safe · records · journal_test.
What the record numbers mean (from the site's own counting code — use these words, do not guess others):
- 꽃 = a company that rose 5% more than the market (코스피 or 코스닥) over the following month. rate = out of 100 picks, how many became a flower. base = the same count for ANY company that could be counted on the same days (the honest comparison).
- n = how many picks were counted · hits = how many became flowers · baseN · baseHits = the same for any company.
- ex = on average, how much more (or less) than the market the picks moved in one month (percent points; each pick capped at ±50) · exBase = the same for any company.
- fall = out of 100 picks, how many moved 5% or more BELOW the market in one month · fallBase = the same for any company.
- days = trading days in the period · pickDays = days that had at least one pick · months / up / down / scored = months counted, better than any company, worse.
- plain · plainN · old · oldN in record_all/years: the meaning is NOT confirmed — show them only in the expert drawer with 「뜻 확인 필요」. Do not invent a meaning.
- why.names = the three reasons a pick did not become a flower (counts in why.all.why). cal.days[].bn · bh = how many companies could be counted that day and how many of them became flowers.
- Sources: prices from 네이버 증권(Naver Finance) daily closes; the record numbers are counted by 수르 from those prices. Say exactly this; do not name other sources.

## Build — ONE standalone file
- {S}/easy/e{NN}/index.html only. Inline CSS and JS. No CDN, no web fonts, no images from the web. System font stack. Light theme is enough.
- Routes you must have: `#/` first screen · `#/c/<code>` company · `#/i/<industry, URI-encoded>` industry. Add all other routes you need (records, 「왜 사?」, journal …).

### Hard rules (all of the owner's order, plus)
1. Every screen is a moving diagram; diagrams cover MOST of the first 390×844 screen (aim 55%+). At least two per page.
2. Top to bottom: ONE biggest value → middle values → detailed values → at the very bottom 출처 and 조사 날짜.
3. Exactly 7 clicks from the first screen to the end with one big 「다음」 button (8 screens).
4. 기승전결 for words and pictures (four beats: frame → values grow → 「그런데」 the honest base / the misses → 「그래서」 the big value marked; ≤2 s total, plays once, prefers-reduced-motion → final state).
5. YouTube-like bottom tabs, 4, in 기승전결 order, active = filled icon + bold label.
6. 5W1H engine: every value has six cells {누가, 언제, 어디서, 무엇을, 어떻게, 왜}; empty → 「확인 필요」 visible on screen.
7. EASY WORDS: every sentence a high-school girl who knows nothing about stocks understands alone. Replace stock words with plain words (e.g. 시가총액 → 회사 크기, 수익률 → 오른 만큼, 지수 → 시장 전체 값). If a word cannot be replaced (코스피, 코스닥, 업종 …), put a one-line plain explanation right next to it (a small 「?」 button or an inline gloss that opens in place — no hover-only).
8. EXPERT INFORMATION: nothing is removed. Every number in the data that a professional would want (n, hits, rate, base, baseN, baseHits, ex, exBase, fall, fallBase, days, pickDays, months, per-month records, per-day records, reasons) is on the site — the expert detail lives in a drawer that opens only on tap (「전문가용 자세히」).
9. EVERY NUMBER gets 「그래서 무슨 뜻」: one plain sentence right under or beside it saying what it means for the reader (e.g. 33 vs 24 → 「조건에 맞은 회사가 아무 회사보다 꽃이 된 적이 조금 더 많았다는 뜻이에요. 그래도 셋 중 둘은 꽃이 못 됐어요.」).
10. Count the hard words left on your screens yourself (stock jargon a high-school girl would not know, used without a gloss) and report the number.

### Keep exactly
- Top bar with 수르; on every page 「지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.」
- Every rate with its base at the same visual weight (33.1 vs 24.38 · 16 vs 26). Worse months visible. data.bloomMeaning exactly.
- Korean only on screen (company names are fine).
- Never on screen: 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 · countdowns · 「지금 바로」 · bragging about gains. No new sentence with a percent sign (data values are fine).
- Every text ≥ 17px (body ≥ 19px), every tap target ≥ 48px, designed at 360 wide, no sideways scrolling.

## Check
1. `node /home/claude/atlas-11/scripts/atlas11/jinhwa/sample.mjs --shoot {S}/easy/e{NN} --data {S}/data2.json` — fix until ok is true.
2. `node {S}/strip.cjs {S}/easy/e{NN} "#/" <the next 7 routes of your 7-click path, in order>` → strip.png + figShareFirstScreen numbers. Look at strip.png once with the Read tool and fix what is broken.

## Final message — Korean, exactly this form, nothing else
```
## {n}. {이름}
- 장점 한 줄: <one line, ≤ 60 characters: what · where · why it helps>
- 일곱 번: <screen 1 → … → screen 8, short names + routes>
- 탭: <four names in order>
- 그림: <total moving diagrams> 개 — <short list>
- 그림 넓이: <figShareFirstScreen numbers for the 8 screens>
- 쉬운 말: <how words are made easy · how glosses open · example of 3 replaced words>
- 전문가 정보: <what is in the expert drawer · how it opens>
- 그래서 무슨 뜻: <how each number gets its meaning line · one example>
- 남은 어려운 낱말: <number> 개 — <the words>
- 여섯 칸: <how shown · which cells are 「확인 필요」>
- 잰 값: <the --shoot numbers, one line>
- 샘플: {S}/easy/e{NN}
```
Write only inside {S}/easy/e{NN}. If you could not build it: 「- 샘플: 못 만듦 — <까닭>」 and 「- 장점 한 줄: 없음」.
