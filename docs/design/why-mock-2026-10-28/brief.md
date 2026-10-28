# 「왜 사?」 그림 그대로 판 — 일 나누기 · 잣대(2026-10-28)

원문: `order-0946.txt`(그림 360가지 분석 · 5배 빠르게) · `order-1011.txt`(「어 그렇게 해」 — 규칙과 부딪히는 일곱 가지도 그림대로).
그림: `mock-7.jpg`(일곱 장). 분석: 360가지(같음 128 · 비슷 86 · 다름 110 · 규칙 36) — 다름 · 규칙 모두 그림대로 고친다.
범위: 「왜 사?」 칸(`section.wy` — #/why · #/why/<번호> · 보내기 쪽에 붙인 칸)만. 다른 쪽 규칙은 그대로.

## 그대로 두는 것
- 사장님 질문 · 답 · 격언(QS — `docs/design/godori-2026-10-17/brief.md`) · 점수 · 묶음 · 판정 셈(judge) · 쉬어 가는 답(4번 「거의 다·빌린 돈」 · 9번 「곧」)
- 기록 꼴(`atlas:godori-why` · 열쇠 그대로 · `why` · `promise` 는 null) · todayResult() · doneOnce() · records() · meRecords() · monthDue()
- 한 달 뒤(「그날 정한 대로 했어?」 · 값 셋) · 「한 달 전 약속」 칸 · 기록 목록 · 지우는 단추 없음 · 카톡 권유 한 번(offerOnce) · 합계 신호(stop · stop_rest · promise · promise_yes)
- 3번 「클 일이 있다」 → 같은 장에 날짜 칸(오늘이나 뒤 날짜만) · 둘이 그림(그림의 복숭아 캐릭터 대신 사이트 얼굴 둘이)
- 누르는 크기 48 · 글 17px 넘게 · 글 대비 4.5 · 옆 넘침 0 · p-why.css 글씨 = var(--fs-n) · 간격 = 0 · var(--sp-n)

## 바뀌는 것(일곱 갈래 · 그림대로)
1. 그림자 · 옅게 바뀌는 빛 — `section.wy` 안에서 허락(분홍 단추 위아래 옅은 빛 · 카드 옅은 그림자 · 시작 화면 · 결과 머리 은은한 빛).
2. 쓰지 않을 말 — 「매수」만 `section.wy` 안에서 허락(그림 글 그대로). 다른 쓰지 않을 말(추천 · 매도 · 기회 …)은 그대로 막음.
3. 「다음으로」 단추 — 답을 누르면 고르기만(분홍 겹동그라미) · 「다음으로 ›」를 눌러야 다음 질문 · 마지막(11번)은 「‹ 이전」 + 「결과 보기 ›」.
4. 앞 답 한마디 칸 없음 — 한마디는 읽어 주는 칸(.wy-live)과 상세 분석(심리 분석 · 매매 습관)에 · 격언은 질문 장 노란 칸 맨 아래 한 줄.
5. 판단은 「~예요」 단정 — 결과 「당신은 / ○○ 투자자예요」 · 상세 분석 글 · 기록 목록 판정 글도 원래 판정 글(물음표 없음).
6. 종목 찾기 칸 · 고른 종목 줄 · 마지막 두 줄(반토막 · 팔 약속) · 결과의 회사 이름 · 두 줄 요약 · 준비 점수 · 빨간 수 · 쉬어 가는 까닭 줄 · 준비 큰 막대 없음.
   #/why/<번호>(회사 쪽 · 보내기 쪽에서 옴)는 번호를 조용히 기억해 기록에 남김(이름 · 그날 값 · 날짜 — 한 달 뒤 값 셈). 화면에는 안 보임.
7. 누르는 칸 테두리 — 그림처럼 옅은 테(대비 3 잣대는 `section.wy` 안에서 뺌).

## 화면 꼴(검사가 맞댈 꼴)
`section.wy[aria-label="친구야, 왜 사?"][data-step]` — data-step = `start` · `q` · `res` · `det`(옛 `pick` · `lines` 없음). 매매일지 쪽은 `.page`.

### ① 시작(start) — 그림 1
```
div.wy-head.wy-hero
  a.wy-up[href="#/"][aria-label="첫 화면으로"]            (매매일지 쪽만)
  h2.wy-h       「나의 투자 성향,」<br><em>지금은</em>「 어떤 상태일까?」
  p.wy-sub      「투자 심리와 실제 매매 습관을 함께 분석해」<br>「나에게 맞는 투자 가이드를 드려요.」
  div.wy-scene[aria-hidden]   (svg.wy-scbg · img.wy-scch /media/makbi-hello.svg · svg.wy-scfg 책상)
  ul.wy-hl > li × 3   「11개의 질문으로 간단하게」 · 「투자 심리 + 실제 매매 습관 분석」 · 「나에게 맞는 행동 가이드 제공」
button.wy-go    「시작하기 ›」 → 1번 질문
p.wy-time       「약 2분 소요 · 기록은 이 기기에만 남아요」
p.wy-live[aria-live=polite]
```

### ② 질문(q) — 그림 2 · 3 · i = 0 ~ 10
```
div.wy-head.wy-pg
  button.wy-up[aria-label = i==0 ? "처음으로" : "앞 질문"]   ← 그림
  span.wy-prog[aria-hidden] > i  (style width = round((i+1)/11*100)%)
  p.wy-step.num  「n / 11」
h3.wy-q         LOOK[i].lead(큰 질문 · 그림 말투)
p.wy-hint       LOOK[i].hint(있을 때만 · 회색 안내 한 줄)
div.wy-opts[role=group][aria-label = QS[i].q(사장님 질문 글 그대로)]
  button.wy-opt[aria-pressed] × 3(사장님 차례)   .on = 고른 답
    span.wy-oi > svg            답 그림
    span.wy-ob > span.wy-ot(사장님 답 글 그대로) + small.wy-os(괄호 풀이 · 예 「(서로 다른 업종에 분산 투자)」)
    span.wy-radio[aria-hidden]  빈 동그라미 · 고르면 분홍 겹동그라미(초록 · 노랑 · 빨강 점 없음)
(3번 「클 일이 있다」를 고르면) label.wy-dl > span「그 일이 언제야?」 + input.wy-date[type=date][min=오늘]
div.wy-whyq
  p.wy-whyk > svg(전구) + b「왜 이런 질문을 하나요?」(11번은 「이런 점을 확인해요」)
  p.wy-whyt     LOOK[i].why
  p.wy-say      span.wy-sayk「격언 」 + q[data-proper] QS[i].say
p.wy-err[role=alert]   (있을 때만) 「답을 하나 골라 줘.」 · 「그 일이 언제인지 날짜를 적어 줘.」 · 「오늘이나 그 뒤 날짜를 적어 줘.」
div.wy-nav
  i < 10 : button.wy-next「다음으로 ›」
  i = 10 : button.wy-back「‹ 이전」 + button.wy-next「결과 보기 ›」
p.wy-live   답을 누르면 「둘이: <그 답의 한마디>」
```
- 답 누름 = 고르기만(넘어가지 않음 · aria-pressed=true · .on) · 「다음으로 ›」 = 다음 질문(답 없으면 막고 알림) · 「결과 보기 ›」 = 결과.
- 뒤로(← · 「‹ 이전」) = 앞 질문(1번에서 ← = 시작 화면) · 고른 답은 남음.
- 질문 장 · 상세 분석 장에서는 매매일지 쪽 아래 칸(한 달 전 약속 · 기록 · 쿠폰 · 발판 · 안전 문장 · 카톡 줄)을 숨김. 시작 · 결과 장에서는 보임.

### ③ 결과(res) — 그림 4 + 그림 7(더 보기)
```
div.wy-res
  div.wy-rhead                          짙은 청록 머리
    button.wy-share「공유하기」          (navigator.share · 없으면 글 복사)
    p.wy-verdict[data-v=go|wait|rest]
      span.wy-vk「당신은」
      b > span.wy-vt(유형 이름 · 민트) + span.wy-ve「예요」     ← 화면에서 가장 큰 글
    p.wy-type   「“…”」 한 줄(단정)
    div.wy-scene.res[aria-hidden]
  div.wy-sheet                          크림 판(위 모서리 둥긂)
    div.wy-tend  p.wy-ck「투자 성향 요약」 + div.wy-trow × 4(span.wy-tn · span.wy-tt2 > i.wy-tf · b.num 0 ~ 100)
                 신중함 · 감정적 매매 · 위험 선호도 · 장기 투자 성향(tendOf — 아래 셈)
    div.wy-mind  span.wy-mi(채운 얼굴) + p.wy-ck「현재 심리 상태」 + p.wy-mv(안정 · 초조 · 불안) + p.wy-mt
    button.wy-detb「내 분석 자세히 보기 ›」 → 상세 분석(det)
    div.wy-hi    img(/media/makbi-icon.svg) + p「오늘도 좋은 투자 하세요!」
    div.wy-moodc 「감정 상태 체크」 · 「지금 내 투자 심리는 어떤가요?」 · button.wy-mood[data-m=calm|soso|worry|rush] × 4(안정 · 보통 · 불안 · 초조) · p.wy-said
    button.wy-row[data-go=log]   「투자 일지」 · 「오늘의 매매를 기록해보세요.」   → 아래 기록 목록으로(없으면 #/why/later)
    a.wy-row[href="#/why/later"] 「나의 성장 리포트」 · 「한 달 후 다시 점검해보세요.」
    p.wy-note    기록 알림(「오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.」 · 못 남기면 「이 기기는 기록을 남길 수 없어요. …」)
    div.wy-nav > button.wy-again「다시 하기」(→ 시작) [+ a.wy-link「매매일지 보기 ›」(보내기 쪽 칸만)]
```
유형(판정 → 유형 · 한 줄):
- go(「좋아, 정해 둔 대로만」) → 「신중한 준비형 투자자」 · 「“내 이유로 따져 보고, 정해 둔 대로 움직이는 편이에요.”」
- wait(「반만 준비됐어」) → 「반쯤 준비된 투자자」 · 「“이유는 있지만, 가끔 마음이 앞설 때가 있어요.”」
- rest(「오늘은 쉬어 가자」) → 「오늘은 쉬어 갈 투자자」 · 쉬어 가는 답을 골랐으면 「“빌린 돈이나 곧 쓸 돈이라면, 오늘은 쉬어 가는 게 좋아요.”」 · 아니면 「“준비가 덜 된 곳이 많아요. 오늘은 하루 쉬어 가요.”」

성향 넷(tendOf · 0 ~ 100 · 반올림): 답 점수 g = 2 · y = 1 · r = 0(뒤집음 = 2 − 점수) · 질문 자리(0부터)
- 신중함 = 평균([1, 2, 6, 7]) · 감정적 매매 = 평균([0, 4, 9] 뒤집음) · 위험 선호도 = 평균([3, 5, 10] 뒤집음) · 장기 투자 성향 = 평균([8, 2]) — 평균 = 합 ÷ (2 × 수) × 100

### ④ 상세 분석(det) — 그림 5 · 6
```
div.wy-head.wy-dtop  button.wy-up[aria-label="결과로"] + h3.wy-dtitle(「상세 분석 결과」 · 맞춤 가이드 탭이면 「맞춤 가이드」)
div.wy-tabs[role=tablist] > button.wy-tab[role=tab][data-k=all|mind|habit|guide][aria-selected]  「종합 분석」 · 「심리 분석」 · 「매매 습관」 · 「맞춤 가이드」(한 줄)
div.wy-dbody[role=tabpanel]
  all   : div.wy-dcard(뇌 · h4「1. 나의 투자 심리」 · p.wy-dp · div.wy-pcs = 강점(초록 답) · 주의할 점(빨간 답)) + div.wy-dcard(막대 · h4「2. 나의 매매 습관」 · p.wy-dp)
  mind  : ul.wy-dl2 > li.wy-dr × (7 · 8 · 10번) — 색 점(.wy-dot.wy-g|y|r + .wy-sr 좋음 · 주의 · 위험) · 「n. 질문 답」 · 한마디
  habit : ul.wy-dl2 > li.wy-dr × 나머지 여덟
  guide : h4「지금 나에게 필요한 3가지」 · ol.wy-gl > li × 3(번호 · 제목 · 풀이 · 흐린 그림) · button.wy-copy「나만의 투자 체크리스트 받기」(글 복사)
```

## 쪽(app) 꼴
- 매매일지 쪽(#/why…)이 `.page` 칸을 가질 때 h1「매매일지」는 눈에 안 보이게(읽기 프로그램용으로 남김).
- 한 달 뒤 쪽(#/why/later)은 그대로.
