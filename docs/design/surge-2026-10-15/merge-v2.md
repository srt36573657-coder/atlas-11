# 급등 탭 결정표 v2 (토론 뒤 · sv-v1 최종) — 셈 surge.py 와 따로 세기 surge_verify.mjs 가 함께 따르는 한 장

v1 에서 바뀐 것(반대 → 바꾼 것):
- A·B·C #1 차례 무리 → 「차례 줄 E = 자료 문과 얇음 문을 지난 곳」 · 지금 목록의 얇은 곳은 얇음 문 없이 그 줄에 끼워 남기 차례를 셈
- C #2 「언제나 들어옴 18번째」 → 뺌(774일 목록 지문이 같음) · 대신 D #1 맞바꿈(5%p) + 다시 들어옴 가산(5%p)
- C #1 남기 54번째 → 72번째(아침에 든 곳이 저녁에 빠짐 31% → 16%)
- B #2 장 중 하루 몰림 → 두 번 넘어야 듦(같은 날 다음 업데이트) · A #3 · E #1 확정 맞대기 줄 + 20일 쌓이면 멈춤 조건(모두 두 번)
- A #5 오래 멈췄던 곳 → 자료 문 「idle」
- A #2 꼬리표 규칙 → 우연 기대 3배(그대로 적음)
- D #2 조심 오래 켜기 → 지난 5거래일 가운데 하루라도 · E #3 이름 → 「거래소 투자경고 오름 기준에 닿은 곳 · 지수 조건은 안 셈 · 실제 지정은 ?」
- D #4 같은 날 같은 업데이트 이름으로 두 번 → 두 번째는 앞 판 그대로(roll.mjs)
- F #1 경고 상자(그 뒤 20거래일 기록) → 뺌(지운 「지난 기록 시험」 · 규칙 49 밖) · 지난 기록 흉내(simulate) 셈 자체를 뺌 · 하루 바뀌는 수 흉내도 뺌(D #3 · C #4 — 실제 업데이트 기록으로만)
- F #2 첫 화면에 그림 → 때 한 줄 · 판단 한 문단 · 정직 한 문장 · ? 한 줄 뒤 바로 그림
- F #3 · E #4 금빛 → 줄 금빛은 「? 장 중」만 · 「고른 곳」 금빛 없음 · 1등 빛 없음 · 장 중은 회색 한 줄
- F #4 나간 까닭 둘로 → 「크게 오른 날이 5일 밖으로 나가 +10% 밑」 / 「값이 내려 +10% 밑」
- F #5 · B #5 걸러 낸 이름 → 접은 칸에 이름 + 사실 까닭만(가나다 · % · 차례 없음) · 기다리는 곳 · 방금 빠진 곳 · 36번째 밖 차례는 공개 파일에 없음(기록 파일의 state 에만)
- B #3 거래 확인 · 하루 몰림 문 → 문으로 쓰지 않고 수로만(「! 거래가 평소 2배도 안 붙음 n곳」 · 「! 하루에 몰려 오름 n곳」) — 까닭: 「사 볼 곳」 고르기로 바뀌지 않게 · 자리 36
- E #2 새는 길 → site_check: 소개 쪽 · 첫 화면 1장에 「급등」 0 · 급등 탭(접은 글 포함)에 「CIA · 정보기관」 0
- E #5 목록의 제 기록 상자 → 넣지 않음(F #1 과 같은 까닭) — 사장님께 여쭐 것으로 남김
- B #4 입력 일봉 통째 남기기 → 크기 때문에 못 함(기록에는 결정마다 값 · 입력 지문) — 못 한 것

## 0. 입력(둘 다 같은 원문)
- 회사 = 그 업데이트 후보 표의 회사 주식(보통주) 모두: proposal.json 의 picked + outside 가운데 `nc`(보통주 아님)이 아닌 줄의 번호 — 번호 문자열 차례로 정렬(allc). 파이썬은 dump.mjs 의 now.json rows(notCommon 아닌 것) — 같은 집합.
- 일봉 = 모음(universe.json bundle) fchart rows `[YYYYMMDD, 시, 고, 저, 종가, 거래량]` 가운데 종가 > 0 + 이어 받은 일봉(ATLAS_T365_CLOSES 폴더 · daese.merge 규칙: 모음 마지막 날 BLAST(후보 모두 가운데 가장 늦은 날) 뒤 날만 · 같은 날은 나중 파일 · 그 파일의 모음 안 날 값이 0.5% 넘게 다르면 그 회사는 그 파일에서 안 받음 · 이어 받은 줄의 거래량 = 셋째 칸(없으면 없음))
- 거래일 달력 = daese.cal_sessions ∪ (후보 절반 넘게 종가가 있는 날 가운데 달력 끝 뒤 날) · 마지막 날 day = 후보(종가 줄이 하나라도 있는 곳) 절반 넘게 종가가 있는 마지막 날(daese.pick_day). D = 달력 가운데 day 이하 · k = 마지막 칸.
- C[t][j] = 종가(없으면 없음) · V[t][j] = 거래량(없으면 없음 — 0 은 0). 달력에 없는 날 줄은 버림.
- 받기 고장: 마지막 날 종가가 있는 회사 < 0.90 × 회사 수 → 셈 멈춤(끝 코드 ≠ 0).
- 장 중(prov): 이어 받은 마지막 파일(lastFile = 이어 붙인 값이 나온 마지막 파일 이름 차례)의 startedAt 을 서울 때로 바꾼 날 = day 이고 시 < 20 이며 day > 모음 마지막 날(blast) → 참 · got = (lastFile 이 있고 day > blast 면 장 중이든 아니든) 그 서울 때 「YYYY-MM-DD HH:MM」 · 아니면 null — 따로 세기 일꾼 보고로 고침.

## 1. 한 날(창 끝 k)의 셈 — n = 5 · 창 6칸 = t ∈ [k−5, k]
- r[j] = C[k][j] / C[k−5][j] (나눗셈 한 번 · 실수) — 이하 「비」.
- 「?」 자료 문(앞 까닭이 먼저: new → gap → novol → jump → idle):
  1. new: k−6 칸까지(처음부터) 종가 있는 날 수 < 20 (k−6 < 0 이면 0)
  2. gap: 6칸 가운데 종가 없는 날
  3. novol: 6칸 가운데 거래량 없음 또는 0 인 날
  4. jump: t = k−4 … k 가운데 |C[t] − C[t−1]| × 100 > C[t−1] × 35 (곱셈 비교)
  5. idle: 칸 max(0, k−66) … k−6 (= 창 앞 61칸) 가운데 거래량 === 0 인 날 수 > 13 (없는 거래량은 세지 않음)
  clean = 까닭 없음.
- 평소 하루 거래대금 liq: 칸 max(0, k−25) … k−6 (= 창 앞 20칸)에서 종가와 거래량이 모두 있는 날의 (종가 × 거래량) 가운데값(짝수면 가운데 둘 (a + b) / 2) · clean 만 셈(아니면 없음) · 값 있는 날이 없으면 없음.
- liquid = clean 이고 liq ≥ 1e8.
- 차례 줄 E = liquid 인 곳을 열쇠 차례로: 열쇠 = (−r, −liq, 번호 차례 j) 오름 → r 큰 → liq 큰 → 번호 작은. rank[j] = E 안 차례(1부터).
- rank_of(j)(남기용): j 가 E 안이면 rank[j] · 아니면 1 + (E 가운데 열쇠가 j 의 열쇠보다 앞선 곳 수) — j 의 열쇠에서 liq 가 없으면 −liq 자리를 0 으로.
- dom[j](오늘 하루 몰림) = r > 1 이고 a⁵ > r⁴ (a = C[k]/C[k−1] · 곱셈 a*a*a*a*a > r*r*r*r · 왼쪽부터) — 값이 없으면 거짓.

## 2. 넣고 빼기 choose(prev, pen, hold, strict)
- cap = 36 · 들기 문 1.15 · 남기 문 1.10 · 들기 차례 36 · 남기 차례 72 · 맞바꿈 0.05 · 가산 0.05
- adj(j) = r[j] − (j ∈ pen ? 0.05 : 0.0) · enter(j) = adj(j) ≥ 1.15
- ok_now(j) = hold 없음(장 중 아님) 또는 (dom[j] 도 strict 도 아님) 또는 j ∈ hold
- can(j) = enter(j) 그리고 ok_now(j)
- wait = E 차례로 j ∉ prev · rank[j] ≤ 36 · enter(j) · ¬ok_now(j)
- prev 없음(처음 · 규칙 바뀜): seat = E 차례로 can(j) 이고 rank[j] ≤ 36 인 곳 앞 36 · out 없음 · wait 그대로.
- prev 있음:
  1. stay = prev 차례로 clean[j] · r[j] ≥ 1.10 · rank_of(j) ≤ 72 인 곳 → seat = stay 를 열쇠 차례로
  2. 채움: E 차례로 seat 가 36 이 될 때까지 — j ∉ seat · j ∉ prev · can(j) · rank[j] ≤ 36 이면 넣음(새로 = newset)
  3. 맞바꿈 되풀이: best = E 차례로 첫 j(j ∉ seat · j ∉ prev · rank[j] ≤ 36 · can(j)) · olds = seat 가운데 newset 밖 · best 나 olds 가 없으면 끝 · w = olds 가운데 열쇠가 가장 뒤인 곳 · (adj(best) − r[w]) > 0.05 이면 w 를 빼고(까닭 seat) best 를 넣고(newset) 다시 · 아니면 끝
  4. seat 를 열쇠 차례로 정렬
  5. prev 가운데 seat · out 밖인 곳의 까닭: clean 아님 → q · r < 1.10 → floor · rank_of > 72 → rank · 그 밖 → seat
- 앞 판의 회사가 이번 회사 목록에 없으면 prev 에서 빠짐(까닭은 4절 「값이 없어요」).

## 3. 상태(공개 자료에 싣지 않음 · 기록 파일 state)
- state = {asOf: day, recentOut: [{c, day}], pending: [번호…], confirms: [{day, n, miss}]}
- pen = 앞 state.recentOut 가운데 day ∈ {D[k], D[k−1]} 이고 이번 회사 목록에 있는 곳(규칙이 바뀌면 비움)
- hold = 장 중이면 (앞 state.asOf = day ? 앞 state.pending 집합(이번 회사 목록 안) : 빈 집합) · 장 중 아니면 없음
- 새 recentOut = 앞 recentOut(pen 으로 쓴 것 = day 가 {D[k], D[k−1]} 인 것만 남김) 가운데 이번 out 이 아닌 것 + 이번 out 마다 {c, day} — (day, c) 차례 · 규칙이 바뀐 판이면 이번 out 은 넣지 않음
- 새 pending = wait 의 번호(번호 차례)
- 확정 맞대기(confirm): 앞 판이 있고 · 규칙이 같고 · 앞 판 provisional 이고 · 앞 판 asOf ≠ day 이고 · 앞 판 asOf 가 D 안이면 → kp = 그 날 칸 · 그 날 셈(1절 그대로 · 그 날까지 값) · ent = 앞 판 members 가운데 sinceAsOf = 앞 판 asOf 이고 이번 회사 목록 안 · miss = ent 가운데 ¬(liquid · r ≥ 1.15 · rank ≤ 36) → confirm = {day: 앞 판 asOf, n, miss, names: miss 의 이름(앞 판 차례)} · 아니면 null
- confirms = 앞 confirms + (confirm 있으면 {day, n, miss}) 의 마지막 20 · strict = confirms 가 20개 · Σn > 0 · Σmiss × 4 > Σn

## 4. 화면 자료 surge.json(공개 · schema atlas-new-surge-1 · version sv-v1)
- kind = 규칙 바뀜 'rule' · prev 없음 'first' · 그 밖 'pick' · n · cap 36 · asOf · provisional · got · window = D[k−5 … k] · at · kst(서울 「YYYY-MM-DD HH:MM」) · slot
- members(seat 차례) 마다:
  - c · n(mkt.json 이름) · i(업종) · g(그 업종의 큰 갈래 id) · mk(시장 KOSPI/KOSDAQ — 후보 표 줄 market)
  - r5 = d2((C[k]/C[k−5] − 1) × 100)
  - v = [d2(C[t]/C[k−5] × 100) for t = k−5 … k−1] + [d2(100 + r5)]
  - d1 = d2((C[k]/C[k−1] − 1) × 100) · liq = d2(liq / 1e8)
  - warn = 거래소 투자경고 오름 기준: 끝난 날 L = (prov ? k−1 : k) · t = L−4 … L 가운데 하루라도 [t ≥ 15 · C[t] 있음 · C[t−14 … t] 모두 있음 · C[t] ≥ 그 15칸 가장 큰 값 · (C[t−5] 있고 C[t] × 10 ≥ C[t−5] × 16) 또는 (C[t−15] 있고 C[t] ≥ C[t−15] × 2)]
  - warnLive = ¬warn 이고 prov 이고 같은 셈을 L = k 로 하면 참
  - one = r > 1 이고 t = k−4 … k 가운데 (C[t]/C[t−1])³ ≥ r × r (세제곱은 y*y*y)
  - reb = 칸 max(0, k−65) … k−5 의 종가 가운데 가장 큰 값 pmax 가 있고 pmax × 7 ≥ C[k−5] × 10
  - half = 칸 max(0, k−256) … k−5 의 있는 종가(차례대로)에서 그때까지 가장 큰 값 ≥ 그 값 × 2 인 날이 있음
  - quiet = liq 있고 Σ_{t=k−4…k} C[t] × V[t](0.0 부터 차례로 더함) < 10 × liq
  - why(경쟁 가설 · 분석 눈): rr[j] = r[j] − 1(clean 만) · mkt_med = rr 모두의 가운데값 · p15 = (clean 가운데 r ≥ 1.15 수) / (clean 수) · peers = 같은 업종(mkt.json i)의 clean 곳(자기 뺌) — 4곳 밑이면 같은 큰 갈래(core.industries 의 g)의 clean 곳(자기 뺌) · hot = peers 가운데 r ≥ 1.15 수 · x = r[j] − 1 → mkt_med × 2 ≥ x 면 'mkt' · 아니고 peers ≥ 4곳이면서 (가운데(rr[peers]) × 2 ≥ x 또는 (hot ≥ 2 이고 hot ≥ 3 × peers 수 × p15)) 면 'ind' · 아니면 'co'
  - tag = 앞 판에 있으면 'stay' 아니면 'new' · since · sinceKst · sinceAsOf · rounds 는 앞 판에서 이어 받음(새로면 이번 at · kst · day · 1 · 이어 받으면 rounds + 1)
  - prov = provisional 이고 sinceAsOf = day
- stats = {lo, hi, med = d2(가운데(r5 들))} · 없으면 null
- funnel = {all, clean, q, qn{new, gap, novol, jump, idle}, liquid, picked}
- hot = 모든 회사 가운데 r 이 있고 r ≥ 1.15 인 곳 → cut = {q: hot 가운데 clean 아님, thin: clean 인데 liquid 아님, seat: liquid 인데 seat 밖, over: hot 수, wait: wait 수}
- cutList = hot 가운데 clean 아니거나 liquid 아닌 곳 {c, n, why} — (이름, 번호) 차례 · why = clean 아님 → '? ' + 까닭 글 · 얇음 → '평소 하루 거래가 1억 원이 안 돼요' (% · 차례 없음)
- market = {n: clean 수, med: d2(mkt_med × 100), up: rr > 0 수, down: rr < 0 수, avg6: [d2(가운데(C[t]/C[k−5] × 100 over clean)) for t = k−5 … k]}
- bins = 1%p 칸: b = min(max(floor(x × 100), −20), 79) for x in rr → [[칸, 수]] 수 > 0 인 것만 칸 차례
- why = {mkt, ind, co} 수 · facts = {warn, warnLive, one, reb, half, quiet} 수
- sameInd = members 가 3곳 이상인 업종 [[이름, 수]] (−수, 이름) 차례
- in = (first 면 빈 것) members 가운데 tag new 마다 {c, n, r5, why: '5일 동안 ' + pctw(r5) + ' 올라 들어왔어요'}
- out = 앞 판 members 차례로 이번 seat 에 없는 곳 {c, n(이번 mkt 이름 · 없으면 앞 판 이름), r5(clean 이면 d2((r−1)×100) 아니면 null), why}:
  규칙 바뀜 → '고르는 규칙이 바뀌어 새로 골랐어요' · 회사 목록에 없음 → '? 이번 자료에 이 회사 값이 없어요' · q → '? 값을 셀 수 없어 뺐어요 — ' + 까닭 글 ·
  floor → (앞 판 asOf ≠ day 이고 C[k] ≥ C[k−1]) ? '크게 오른 날이 5일 밖으로 나가 +10% 밑이 됐어요' : '값이 내려 +10% 밑이 됐어요' · rank → '더 크게 오른 곳이 많아 밀렸어요' · seat → '더 크게 오른 곳에 자리를 내줬어요'
- confirm(3절) · strict · digest = sha256('sv-v1|' + day + '|' + (prov ? 1 : 0) + '|' + members.map(c:r5 를 소수 둘째 자리 글로).join(',') + '|' + in 번호.join(',') + '|' + out 번호.join(','))[:16]
- d2(x) = 가장 짧은 10진 글(파이썬 repr · 노드 String)에서 소수 둘째 자리로 · 0.005 는 0 에서 먼 쪽(파이썬 Decimal ROUND_HALF_UP)
- pctw(x) = |x| ≥ 100 → 정수(floor(|x| + 0.5 + 1e−7)) · 아니면 소수 한 자리(floor(|x|×10 + 0.5 + 1e−7)/10) · 부호 + / − / 없음 · 끝에 「%」(따로 세기 일꾼 보고로 고침)
- 까닭 글: new '새로 상장해 평소 값을 잴 수 없음' · gap '6거래일 가운데 값이 빈 날이 있음(거래정지 · 받기 실패 등)' · novol '거래가 없었던 날이 있음(거래정지일 수 있음)' · jump '하루 35% 넘게 바뀐 날이 있음(값 고침 · 자료 틀림일 수 있음)' · idle '석 달 안에 거래가 오래 멈췄던 곳(다시 열리며 값이 크게 다시 매겨질 수 있음)'

## 5. 때(roll.mjs)
- 하루 4번 업데이트(slot 있음) 때만 고름 · 앞 고르기 기록이 없으면(처음) 손 올리기 때도 처음 고름
- 같은 서울 날 · 같은 slot 으로 이미 올라간 고르기가 있으면 고르지 않고 그대로(D #4)
- 고른 판은 네 눈 점검까지 지나 사이트 자료가 바뀐 때만 기록(reports/atlas11/t365/surge/<UTC>.json · 새 파일만 · {schema atlas-t365-surge-rec-1, at, kst, slot, kind, payload, state, input: 이어 받은 일봉 파일 sha256})
- 급등 셈 · 따로 세기만 멈추면 앞 판 그대로 + 까닭 · 앞 판도 없으면 surge.json 없음(탭은 「?」)

## 덧붙임(따로 세기 일꾼 보고로 고침 · 2026-10-15 17:1x 서울)
- 규칙이 바뀐 판(kind 'rule')은 새 출발 — tag · since · sinceKst · sinceAsOf · rounds · in · 속 상태(recentOut · pending · confirms)는 'first' 와 같음(모두 새로 · in 없음 · 앞 상태 안 씀) · out 은 앞 판 회사 모두 「고르는 규칙이 바뀌어 새로 골랐어요」.
- recentOut 이어 받기 = 앞 recentOut 가운데 day ∈ {D[k], D[k−1]} 이고 이번 회사 목록에 있는 것(이번 out 은 빼고 새로 더함).
