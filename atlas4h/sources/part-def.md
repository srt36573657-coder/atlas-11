# 원문 확인 — D·E·F·짜임 (atlas4h 첫 실행 3)

읽은 때: 2026-10-01 17:14–17:31 KST · 기계용 기록: `part-def.json` (schema `atlas4h-sources-1`)

1. 원문 19개를 찾아 17개를 직접 읽었다(그중 3개는 첫머리·초록·공식 요약만). 못 읽은 2개는 '보류'다.
2. 결정: 쓴다 9 · 조건부 8 · 보류 2 · 안 쓴다 0.
3. 원문이 받쳐 주지 않는 명령문 줄 28개를 아래에 적었다(명령문은 고치지 않았다).

규칙: 원문을 직접 읽은 것만 썼다(04-learning 8줄). 숫자·쪽·인용은 읽은 것만 적고, 못 본 것은 '못 읽음'·'못 찾음'으로 적었다.

## 한눈에 보는 표

| 항목 | 원문 | 직접 읽음 | 명령문 문장이 맞나 | 결정 | 까닭 |
|---|---|---|---|---|---|
| D · 호이어 | Psychology of Intelligence Analysis — Richards J. Heuer, Jr. · 1999 · CIA Center for the Study of Intelligence (미국 중앙정보국 공식 출판물) | 아니오 — 공식 PDF가 1~3장까지만 읽힘 | D1·D2 확인 못 함 | **보류** | 해당 장(4·8장)을 직접 못 읽었다 — 읽은 것만 쓴다는 규칙(04-learning 8줄). |
| D · ICD 203 | Intelligence Community Directive 203: Analytic Standards — Office of the Director of National Intelligence · 2015 · 미국 국가정보장실 공식 지침 (2015-01-02 서명, 2022-01-21 기술 개정 — 읽기 도구가 읽어 준 값) | 예 | D4 맞음 · D1 맞음 · C4 맞음 · 엔진 53줄 일부(숫자 함께는 명령문이 더함) | **쓴다** | 미국 정보기관 공식 지침 원문에 D4가 거의 그대로 있다. |
| D · 만델 | Accuracy of forecasts in strategic intelligence — David R. Mandel 외 · 2014 · PNAS 111(30) (읽은 사본에는 1–6쪽으로 찍힘) | 예 (출판본 PDF 사본) | 움츠림·보정 맞음(사람 분석가) · LLM 문장은 일부 | **조건부** | '보정하면 낫다'는 원문에 있으나 대상이 LLM이 아니라 사람이다. |
| D · 카르베츠키(2018) | Boosting intelligence analysts' judgment accuracy: What works, what fails? — Mandel 외 · 2018 · Judgment and Decision Making 13(6), 607–621 | 예 (출판사 PDF) | 합 100%·합치기 맞음 · 가운데 값 일부(원문은 평균) · D3 일부(절반 규칙 없음) · D2 일부 | **쓴다** | 전문가 심사 학술지 원문에서 '합 100% + 합치기'가 오차를 61% 줄였다. |
| E · 클라인 | Performing a Project Premortem — Gary Klein · 2007 · Harvard Business Review (September 2007) | 예 — 첫머리만 (유료벽) | E1 맞음 · 자리 돌리기는 없음 | **조건부** | 공식 누리집 첫머리에 방법이 그대로 있다. 그러나 본문은 못 읽었고, HBR은 전문가 심사 학술지가 아니다. |
| E · SSCI | Report of the Select Committee on Intelligence on the U.S. Intelligence Community's Prewar Intelligence Assessments on Iraq (S. Rept. 108-301) — U.S. Senate Select Committee on Intelligence · 2004 · 미국 상원 정보위원회 보고서 (2004-07-09) | 아니오 — 공식본이 글자 없는 스캔 | E3 확인 못 함 | **보류** | 원문을 못 읽었다. |
| E · 화이트(2000) | A Reality Check for Data Snooping — Halbert White · 2000 · Econometrica 68(5), 1097–1126 | 예 (인쇄본 사본) | E6 맞음 · S8 맞음 · SPA는 다른 논문 | **쓴다** | 전문가 심사 학술지 원문에 E6의 뜻이 그대로 있다. |
| F · 노섹(2018) | The preregistration revolution — Brian A. Nosek 외 · 2018 · PNAS 115(11), 2600–2606 | 예 — 초록만 (본문 막힘) | F1 앞부분(결과 전에 적기) 맞음 · '고치지 않는다' 확인 못 함 | **조건부** | 출판사가 등록한 공식 초록만 읽었고 본문은 막혔다. |
| F · 그나이팅(2007) | Strictly Proper Scoring Rules, Prediction, and Estimation — Tilmann Gneiting 외 · 2007 · Journal of the American Statistical Association 102(477), 359–378 | 예 | F2 맞음 · 세 점수 맞음 · 실력 식은 원문이 경고 | **쓴다** | 전문가 심사 학술지 원문이 세 점수와 '바른 점수'의 뜻을 그대로 준다. |
| F · 그나이팅(2007) | Probabilistic forecasts, calibration and sharpness — Tilmann Gneiting 외 · 2007 · Journal of the Royal Statistical Society Series B 69(2), 243–268 | 예 | 80% 덮음 목표 맞음 · T13 숫자는 명령문이 정함 | **쓴다** | '보정 안에서 날카롭게' — F2와 범위 목표가 원문과 같은 말이다. |
| F · 베이조스 | 2015 Letter to Shareholders — Jeffrey P. Bezos · 2015 · Amazon 공식 주주 편지(투자자 누리집) — 편지에 찍힌 날짜는 못 봄 | 예 | F5 맞음 | **쓴다** | 회사 공식 편지 원문에 F5가 그대로 있다. |
| F · 아지리스 | Double Loop Learning in Organizations — Chris Argyris · 1977 · Harvard Business Review (September 1977) | 예 — 공식 요약만 (유료벽) | F6 일부(원문은 방침·목표까지 묻는다) | **조건부** | 본문은 유료벽이라 공식 요약만 읽었다. HBR은 전문가 심사 학술지가 아니다. |
| 짜임 · 긴 자료는 위, 명령은 맨 아래(앤트로픽 공식 안내) | Prompting best practices — Long context prompting — Anthropic · 없음(쪽에 날짜 없음) · Claude Platform Docs (앤트로픽 공식 문서) | 예 | 맞음 (긴 자료일 때, '최대' 30%) | **조건부** | 공식 문서에 그대로 있으나 '긴 자료일 때'라는 조건이 붙어 있다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) | Effective harnesses for long-running agents — Justin Young · 2025 · Anthropic Engineering (2025-11-26) | 예 | 대부분 맞음 · '평가 일꾼만 표시' 틀림(이 글은 짓는 일꾼이 표시) · 장부 칸·쪽지만은 명령문이 더함 | **쓴다** | 앤트로픽 공식 글에 하네스 줄 대부분이 그대로 있다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) | Harness design for long-running application development — Prithvi Rajasekaran · 2026 · Anthropic Engineering (2026-03-24) | 예 | 계약 맞음 · 판정 분리 맞음 · 감시자 따로·통과 뒤 커밋은 명령문이 더함 | **쓴다** | 앤트로픽 공식 글에 계약·평가 일꾼 분리가 그대로 있다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) | Effective context engineering for AI agents — Prithvi Rajasekaran 외 · 2025 · Anthropic Engineering (2025-09-29) | 예 | 요약만 올리기 맞음 · 바깥 쪽지 맞음 | **쓴다** | 앤트로픽 공식 글에 '짧은 요약만 올린다'와 '바깥 쪽지'가 그대로 있다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) — 참고 | Building a C compiler with a team of parallel Claudes — Nicholas Carlini · 2026 · Anthropic Engineering (2026-02-05) | 예 | 시험·짧은 출력·진행 파일 맞음 (참고) | **조건부** | 공식 글이고 하네스 줄을 받치지만, 셋 가운데 하나인지 확인할 길이 없다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) — 참고 | Scaling Managed Agents: Decoupling the brain from the hands — Lance Martin 외 · 2026 · Anthropic Engineering (2026-04-08) | 예 | 하네스는 낡을 수 있다고 경고 (참고) | **조건부** | 공식 글이지만 명령문의 '글 셋'에 드는지 모르고, 경고로만 쓴다. |
| 짜임 · 하네스: 앤트로픽 공식 글 셋(2025~26) — 참고 | How we built our multi-agent research system — Jeremy Hadfield 외 · 2025 · Anthropic Engineering (2025-06-13) | 예 | 줄여 올리기·바깥 기억 맞음 (참고) | **조건부** | 공식 글이고 하네스 7·24줄을 받치지만, 셋 가운데 하나인지 확인할 길이 없다. |

조건부·쓴다의 조건은 `part-def.json` 의 `condition` 칸에 있다. 신뢰도는 원문 종류의 점수다(HBR 두 편만 8 — 경영 잡지, 전문가 심사 아님 [판단]).

## 원문이 받쳐 주지 않는 명령문 줄

'명령문이 더한 것' = 원문에는 없고 명령문이 새로 정한 말. 틀렸다는 뜻이 아니라, 원문을 근거로 댈 수 없다는 뜻이다.

1. `01-structures36.txt:26` 「D3 베이즈: 우도비로 곱하되 독립부터, 의심되면 절반」
   - 「의심되면 절반」은 읽은 원문 어디에도 없다. Mandel·Karvetski·Dhami(2018)는 독립을 '단순화 가정'이라고 밝히고 썼을 뿐이다 → 명령문이 더한 것.
2. `01-structures36.txt:28` 「D5 격리 합치기: 따로 계산, 가운데 값, 합 100%」
   - 「가운데 값」 — 원문(Mandel·Karvetski·Dhami 2018)은 산술 평균과 정합성 가중 평균을 시험했다. 가운데 값(중앙값)은 시험하지 않았다.
3. `08-engine.txt:18` 「합치기는 가운데 값. 반반 쪽 움츠림은 보정해 편다.」
   - 「가운데 값」은 위와 같다. 움츠림과 보정은 사람 분석가 자료(Mandel·Barnes 2014)다 — LLM 이야기는 원문 밖.
4. `05-learned.txt:7` 「6 LLM 확률은 반반 쪽으로 움츠린다. 보정해 편다.」
   - Mandel·Barnes(2014)는 사람 분석가를 잰 논문이다. LLM에 대한 말은 이번 원문이 받치지 않는다.
5. `08-engine.txt:35` 「D5대로 합치고, 갈리면 폭을 넓힌다.」
   - 「갈리면 폭을 넓힌다」는 원문에 없다 → 명령문이 더한 것.
6. `08-engine.txt:53` 「가능성은 말과 숫자를 함께, 확신도는 따로(D4).」
   - ICD 203은 정해진 가능성 말(7칸)을 쓰라고 한다. 「숫자를 함께」는 명령문이 더한 것(표의 범위와 맞으면 해롭지 않다).
7. `01-structures36.txt:29` 「D6 좌우 따로: 나쁜 쪽이 대개 더 세다」
   - D칸 원문 넷(호이어·ICD 203·만델·카르베츠키) 가운데 이 말을 하는 곳이 없다(다른 원문이 받칠 수는 있다).
8. `01-structures36.txt:32` 「E2 핵심 가정: 무너지면 결론이 바뀌는 전제부터 친다」 · `01-structures36.txt:34` 「E4 반론은 의례 아님: 자리를 돌리고 전부 남긴다」 · `01-structures36.txt:35` 「E5 닻 막기: 앞 값·뉴스를 보기 전에 먼저 계산한다」
   - E칸 원문 셋(클라인·SSCI·화이트) 가운데 읽은 곳에 없다. E2와 비슷한 말('몇몇 중요한 증거의 해석이 바뀌면 결론이 얼마나 흔들리나')은 Mandel·Karvetski·Dhami(2018)가 옮긴 ACH 단계(f)에 있다.
9. `03-harness.txt:5` 「평가 일꾼: 통과 표시는 이 일꾼만 바꾼다.」
   - 2025년 글은 짓는 일꾼(코딩 에이전트)이 passes를 바꾸게 한다(틀림). 2026년 글은 평가 쪽이 통과·실패를 정한다(일부). 「이 일꾼만」은 명령문이 더한 것.
10. `03-harness.txt:6` 「감시자: <감시>를 돈다. 짓는 일꾼과 다른 에이전트.」
   - 짓는 이와 판정하는 이를 가르라는 것까지가 원문(2026년 글). 평가 일꾼과 따로 '감시자'를 하나 더 두는 것은 명령문이 더한 것.
11. `03-harness.txt:9` 「진행 장부: 한 일·다음 일·막힌 일」
   - 진행 파일은 원문에 있다. 「다음 일·막힌 일」 칸은 명령문이 더한 것.
12. `03-harness.txt:12` 「넘겨주기 쪽지: 다음 고리가 이것만 보고 시작하게」
   - 원문은 진행 파일·깃 기록·기능 목록을 함께 읽고 시작한다. 「이것만 보고」는 명령문이 더한 것(같은 칸 15줄 「쪽지·장부·통과 목록·깃 기록을 먼저 읽는다」와도 살짝 부딪힌다).
13. `03-harness.txt:19` 「5 평가 일꾼이 통과를 정하면 커밋한다」
   - 「통과 뒤에만 커밋」은 원문에 없다(2025년 글은 바꿀 때마다 커밋, 2026년 글은 'git을 썼다'만).
14. `09-scoring-evolution.txt:6` 「실력 = 1 − 내 오차 ÷ 기준 오차」
   - Gneiting·Raftery(2007) 2.3절이 이 꼴의 실력 점수는 대개 '바르지 않은 점수(improper)'라고 경고한다 → 화면 설명에는 쓰되, 판정과 고치기는 CRPS·구간·브라이어 원점수로.
15. `09-scoring-evolution.txt:12` 「시도는 다 적고, SPA 검정으로 우연을 거른다.」 · `10-spec.txt:24` 「T20 시도가 장부에 다 있고 SPA를 거침 (목록)」
   - White(2000)는 Reality Check(RC)다. SPA는 이번에 읽지 않은 다른 논문이다(엔진 쪽 몫).
16. `10-spec.txt:16` 「T13 80% 덮음 70~90%(30판↑)·위기 따로」
   - 보정을 재라는 뜻은 원문(Gneiting·Balabdaoui·Raftery 2007)에 있다. 70~90%와 30판은 원문에 없는 명령문의 값.
17. `01-structures36.txt:38` 「F1 봉인: 결과 보기 전에 적고, 고치지 않는다」 · `13-command.txt:16` 「봉인한 판은 고치지 않는다. 봉인 뒤 자료는 안 쓴다.」
   - 「고치지 않는다」 — Nosek(2018) 본문을 못 읽어 확인 못 함. 초록은 '결과를 보기 전에 정한다'까지다. 사장님의 넘지 않는 선으로 두면 되고, 이 논문을 근거로 대지 않는다.
18. `01-structures36.txt:43` 「F6 이중 고리: 답과 답을 낸 방법을 함께 고친다」 · `13-command.txt:33` 「둘째 바퀴(16시): 답을 낸 방법을 다시 판다.」
   - Argyris의 이중 고리는 '밑에 깔린 방침과 목표'까지 묻는 것이다. 「답을 낸 방법」은 그 일부만 담는다.
19. `08-engine.txt:39` 「반론은 E1·E2·E4로, 자리는 고리마다 바꾼다.」
   - 「자리는 고리마다 바꾼다」는 Klein 글 첫머리(읽은 범위)에 없다.
20. `01-structures36.txt:24` 「D1 가설 여럿: 첫 그럴듯한 것에서 멈추지 않는다」 · `01-structures36.txt:25` 「D2 진단성: 모든 가설에 맞는 증거는 0점」 · `01-structures36.txt:33` 「E3 층 쌓기 금지: 짐작 위에 판단을 세우지 않는다」
   - 원문(호이어 4·8장, 상원 정보위 보고서)을 못 읽어 확인 못 함. D2의 「0점」은 2차 자료가 옮긴 호이어 말('little diagnostic value' = 진단 가치가 '적다')과 다를 수 있다.
21. `12-sources.txt:20` 「하네스: 앤트로픽 공식 글 셋(2025~26)」
   - 어느 셋인지 적혀 있지 않다 → 짐작으로 골랐다(아래 '하네스 글 셋').

## 원문이 경고한 것 (지금 줄과 부딪힐 수 있는 곳)

1. `02-watch.txt:7` 「S6 넘치는 확신: 확인 없이 80% 넘긴 곳 = 0」
   - Mandel·Barnes(2014)의 분석가들은 '지나친 확신'이 아니라 '모자란 확신'이 문제였다. S6을 세게 걸면 움츠림을 키울 수 있다 [판단] — '확인된' 80% 넘는 값은 막지 않는다.
2. `13-command.txt:10` 「기본: <사양>·<감시>·<하네스>. 올리기만 한다.」
   - Anthropic 2026-04-08 글: "Harnesses encode assumptions that go stale as models improve." 하네스 규칙도 쓴 횟수·도운 횟수를 재어 두면, 낡았을 때 알 수 있다(지우지는 않는다).
3. `08-engine.txt:16` 「에이전트 5~10이 각자 찾고 각자 확률을 낸다.」
   - Mandel·Karvetski·Dhami(2018): 1명→2명, 2명→3명은 뚜렷이 나아졌고 그 뒤로는 뚜렷한 나아짐이 없었다. 5~10과 부딪히지는 않는다(참고).
4. `01-structures36.txt:24` 「D1 가설 여럿: 첫 그럴듯한 것에서 멈추지 않는다」 · `01-structures36.txt:25` 「D2 진단성: 모든 가설에 맞는 증거는 0점」
   - Mandel·Karvetski·Dhami(2018): ACH(가설표)를 쓴 무리가 정확도를 높이지 못했고 조금 나빠졌다. D1·D2만으로 정확해진다고 보지 말고, D5(합 100%·합치기)와 시장 점수로 확인한다.

## 하네스 글 셋 — 무엇으로 골랐나 [짐작]

명령문(12-sources 20줄)은 글 이름을 적지 않았다. 하네스 줄과 가장 잘 맞는 셋을 골랐다.

1. Effective harnesses for long-running agents (2025-11-26) — 바탕 일꾼·한 가지씩·통과 목록('failing'에서 시작)·진행 파일·깃·init.sh·시험 안 고치기.
2. Harness design for long-running application development (2026-03-24) — 평가 일꾼 분리·'다 됐다' 계약·넘겨주기.
3. Effective context engineering for AI agents (2025-09-29) — 아래 일꾼은 짧은 요약만, 바깥 쪽지.

참고로 더 읽은 것: Building a C compiler with a team of parallel Claudes (2026-02-05) · Scaling Managed Agents (2026-04-08) · How we built our multi-agent research system (2025-06-13).

## 못 읽은 곳과 까닭

1. 호이어(1999) 4장·8장 — CIA 공식 PDF(214쪽)는 열렸지만 읽기 도구가 1~3장까지만 보여 줬다. 인터넷 보관소는 막혀 있었다.
2. 상원 정보위(2004) 보고서 — 상원·govinfo PDF 모두 글자 없는 스캔, govinfo 글자판은 '[TEXT NOT AVAILABLE]'. 뉴스 사본은 10점이 아니라 안 썼다.
3. Nosek(2018) 본문 — pnas.org(403)·PMC·PubMed(로봇 검사)가 막혔다. 출판사가 등록한 초록만 읽었다. Europe PMC 검색 한 번은 읽기 도구 횟수 제한(429)에 걸렸다.
4. Klein(2007)·Argyris(1977) 본문 — HBR 유료벽. 공식 누리집 첫머리·공식 요약만 읽었다.
5. 이 작업 상자의 명령줄(curl)은 바깥 누리집이 정책으로 막혀(403) 있어, 읽기 도구(WebFetch)로만 읽었다.

## 판단에 쓴 구조 번호

C5(출처 맞대기) — 모든 항목 · C6(겹침 빼기) — 그나이팅 두 편은 저자가 겹쳐 한 자루로 셈 · C4(딱지) — [짐작]·[판단]·[모름] 표시 · E2(핵심 가정) — '사람 결과를 LLM에 옮겨도 되나' · E3(층 쌓기 금지) — 2차 자료 위에 판단을 세우지 않음 · F4(표본 정직) — 못 읽으면 '보류' · A2(판정 가능하게) — 인용마다 쪽·절을 붙임.

## 일반인 눈높이 설명

- 명령문에 '이 책·이 논문에 이렇게 써 있다'고 적힌 곳이 있습니다. 그 책과 논문을 직접 찾아 읽고, 정말 그렇게 써 있는지 맞춰 보았습니다.
- 대부분은 맞았습니다. 예를 들어 '확률과 확신도를 한 문장에 섞지 말라'는 미국 정보기관 지침에 거의 그대로 있습니다.
- 몇 군데는 원문에 없는 말을 명령문이 더했습니다. 예를 들어 '의심되면 절반', '가운데 값'은 원문에서 찾지 못했습니다. 원문은 가운데 값이 아니라 평균을 썼습니다.
- 한 군데는 원문이 조심하라고 했습니다. '실력 = 1 − 내 오차 ÷ 기준 오차'는 보여 주기에는 좋지만, 그 숫자만 올리려 들면 속마음과 다른 예측을 내는 쪽이 점수를 더 받을 수 있다고 합니다. 그래서 판정은 원래 점수로 합니다.
- 두 권(호이어 책의 해당 장, 상원 보고서)은 끝내 읽지 못해 '보류'로 두었습니다. 읽지 못한 것은 쓰지 않습니다.
