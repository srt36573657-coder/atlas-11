# 고도리 · 하나로 묶은 명령문 — 일 나누기 한 장(2026-10-17 21:10 싱가포르 · 규칙 76 ②)

사장님 원문 = `docs/design/godori-2026-10-17/order-2110.txt`(글자 그대로 · 먼저 읽을 것). 끝 약속 = **2026-10-18 02:00(싱가포르)**.
앞 안내 `brief.md`(고도리 칸 결정표 gdr-v1)는 그대로 살아 있음.

## 모두 지킬 것
- 작업 칸 `/home/claude/atlas-video`(git worktree) — git 상태를 바꾸는 명령(commit · checkout · stash · reset · push · merge) 금지 · `/home/claude/atlas-11` 로 cd 금지 · 넓게 뒤지는 명령(`find /`) 금지
- 손대지 말 것(예전 화면 · 규칙 75): `site/atlas/**` · `site/app/**` · `site/us/**` · `site/new/**` · `site/index.html` · `scripts/atlas11/t365/**` · `.github/workflows/atlas11-daily.yml` · `atlas11-evening.yml`
- 이름은 `site/next/brand.js` 한 곳(NAME · josa) — 화면 글 · 새 파일 이름에 옛 이름(아틀란스 · ATLAS · 보드리) 금지 · 저장소 · 폴더 이름은 그대로
- 보안 규칙(CSP: script-src 'self' · style-src 'self'): innerHTML 금지 · 글 속 style 금지 · 다른 주소 스크립트 금지(카카오 공식 도구도 막힘 — 깨야 하면 먼저 주 일꾼에게 보고)
- 개인 기록은 이 기기에만(localStorage · try/catch · 막혀도 화면은 돎) · 기존 저장 열쇠(`atlas:new:*` · `atlas:godori-why` · `atlas:godori-money` · `atlas:font` …)는 이름 그대로
- 쓰지 않을 말: 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사세요 · 사라 · 파세요 · 팔아라 → 「나라면 이렇게 하겠어」 · 격언(사장님 글)만 data-proper 로 글자 그대로
- 축하 폭죽 · 연속 접속 보상 금지 · 입체(캔버스 · 원근 · 3D · 그림자 필터) 금지 · 작은 네모 20개 이상 줄지은 판 금지(규칙 51)
- 360×640 · 390×844 옆 넘침 0 · 누르는 자리 44px 이상 · 본문 17px 이상 · 쉬운 말 · 친구 말투
- 영어는 일꾼 H 만(`scripts/atlas11/next/i18n/en-src.json` → `node scripts/atlas11/next/i18n_build.mjs` · en.json 손으로 금지) — 다른 일꾼은 새 한국어 글 목록을 보고에 적음
- 이 기계(CPU 2 · 일꾼 여럿)에서 run_all 전체 · 큰 검사 금지 — 제 검사만 짧게(--limit) · 브라우저는 짧게 · 꼭 닫기
- 맡을 파일 밖은 고치지 않음 — 필요한 고리는 보고에 정확히(파일 · 줄 · 바꿀 글)

## 맡을 파일(겹침 0)
| 일꾼 | 할 일(원문 번호) | 맡을 파일 |
|---|---|---|
| 주(나) | [1] 3 · 4 · 5 · 10 · [7] 9 · 합치기 · 올리기 | `docs/고도리_지도.md` · `CLAUDE.md` · `docs/고도리_규칙원문.md` · `docs/ATLAS_원칙.md`(규칙 78) · `scripts/atlas11/next/check_changed.mjs` · `reports/atlas11/speed/` · 기록 탭 |
| A 겉 틀 | [2] 전부 · [3] 2 · 8 · [4] 고리 · [6] 1 고리 | `site/next/app.js` · `site/next/index.html` · `site/next/app.css` |
| B 매매일지 | [3] 1 · 3 ~ 7 · 9 · [6] 1 열쇠 | `site/next/p-why.js` · `site/next/p-why.css` · `scripts/atlas11/next/check_why.mjs` |
| C 보내기 | [4] 전부 | `site/next/p-share.js` · `site/next/p-share.css` · `site/next/words.js`(새) · `site/hello-send.js` · `site/letter.js` · `lib/atlas11/letter.mjs`(거르는 말 한 곳으로만) · `scripts/atlas11/next/check_share.mjs`(새) |
| D 보유종목 · 고도리 칸 안전 | [5] 1 ~ 3 · 5 ~ 10 · [6] 2 ~ 4 | `site/next/p-hold.js` · `site/next/p-hold.css`(새) · `site/next/p-gdr.js` · `site/next/p-gdr.css` · `scripts/atlas11/next/check_hold.mjs`(새) · `scripts/atlas11/next/check_gdr.mjs` |
| E 셈 | [5] 4 · [6] 2 자료 | `scripts/atlas11/next/gdr/pick.mjs` · `site/next/data/gdr.json` · `site/next/data/gates.json`(새) |
| F 따로 세기 | [5] 4 확인 | `scripts/atlas11/next/gdr/verify.py` · `reports/atlas11/godori/verify-latest.json` (pick.mjs 를 열어 보지 않음) |
| G 검사 믿음 | [1] 8 · 9 · 실패 셋 | 쪽 검사 `scripts/atlas11/next/check_{cal,chx,co,cond,grow,misc,past,range,rivals,surge,today}.mjs` · `next_check.mjs` · `next_en_check.mjs` · `run_all.mjs` · `scripts/atlas11/probe/live_view.mjs` · `.github/workflows/atlas11-next-full.yml` |
| H 영어 | [7] 7 · 끝에 | `scripts/atlas11/next/i18n/en-src.json` · `site/next/i18n/en.json` · `en-names.json` |

## 주고받는 꼴(이름 · 길 · 자료)
- 아래 단추(A): 오늘 장(#/) · 시황(#/shorts) · **매매일지(가운데 큰 단추 · #/why)** · 관심(#/sub) · 보유종목(#/me) — 화면 제목도 같게 · 탭 이름에 숫자 금지 · `data-tab` 값은 그대로(home · shorts · letter→why? A 가 정함 — 검사 G 에게 알림)
- 관심(A): 구독한 업종 · 갈래 + 「나중에 볼 것」 회사를 한 화면에 · 단추 글 「관심 담기」 / 「관심 담음」 · 저장 열쇠는 그대로(`atlas:new:sub` · 나중에 볼 것 열쇠)
- 시황(A): 쇼츠 화면을 「왜 움직였나」만 — 급등 목록 장 · 급등 칸 고리 빼기
- 보유종목(#/me · A 가 붙임): 맨 위 `p-hold` render(D) → 사장님 편지(열면 고도리 그대로) → 바로 가기(편지 여는 밤 남김 · 「왜 사? 열한 질문」 줄 뺌)
- 회사 화면 #/w/<번호>(A): 「이 회사로 왜 사?」 단추 → `#/why/<번호>`
- `NX.findMatch(q)`(A · 찾기와 같은 잣대) → `[{c: 번호, n: 이름, k: 종류}]` · `NX.shareBox(o)`(A · `p-share` 의 `open(o)` 를 부름) — o = `{kind: 'share'|'ask', title, url, code?, price?, day?}` · 앱의 모든 보내기 단추는 이것만 부름(옛 share() 대신)
- 매매일지(B · `p-why.js`): 처음 = 종목 고르기(`NX.findMatch`) → 질문 열한 개(3번 「클 일이 있다」면 그 날짜) → 두 줄(① 1년 뒤 반토막 났다면 왜? ② 만약 ~이면 ~한다 · 팔 선 기본 = 산 값 × 0.9 · 절반 × 1.2) → 결과 → 기록(종목 · 날짜 · 그날 값 · 두 줄 · 점수) · 기록 목록은 매매일지 화면 아래 · 지우는 단추 없음 · 1분 안 · 내보냄 `whyCard` · `render(arg)`(arg = 번호면 그 종목으로 시작) · `records()` · `doneOnce()`(질문을 끝낸 기록이 하나라도 있나)
- 기록 한 줄(B · 열쇠 `atlas:godori-why` 그대로 · 옛 기록도 읽힘): `{at, asOf, code?, name?, price?, day?, answers, score, reds, verdict, groups, bigDay?, why?, promise?: {sell, half, text}, picks}`
- 보내기(C · `p-share.js` `open(o)`): 「친구에게 무슨 말을 할래?」 글상자 + 빠른 말 셋(이거 어때? / 같이 공부하자 / 나는 이렇게 봤어) · `words.js` 로 거름(걸리면 고치게) · 수익률 글 금지 · 휴대폰 공유 창에 글 + 주소 · 없으면 글 + 주소 복사 · 주소 = `#/s/<번호>/<날>/<값>`(+ 글) → 친구가 열면(`p-share` render · A 가 #/s 길을 붙임) 보낸 날 값 · 오늘 값 → 왜 사? 질문부터 → 답한 뒤 보낸 사람 글 · 「같이 따져 줘」(kind 'ask') = 「반토막 난다면 왜일까?」 · 카카오 카드는 꺼 둔 채 준비만(켜는 법은 `docs/design/godori-2026-10-17/kakao.md`)
- 보유종목(D · `p-hold.js` render · 열쇠 `atlas:godori-hold`): 종목 · 산 값 · 수량 · 산 날 · 판 것은 「지난 보유」(판 날 · 판 값) · 첫 질문 「오늘 처음 봤다면 살 거야?」 답한 뒤에만 수익률 · 보일 것 차례 ① 산 이유가 살아 있나(매매일지 기록과 맞댐: 「돈을 잘 번다」→ 문1 오늘 · 「클 일이 있다」→ 적은 날 지났나 · 「그냥」→ 🟡) ② 다섯 문 오늘 색(gates.json) ③ 「망할 이유」(매매일지 ① 줄)가 나타났나 — 스스로 고르게 ④ 팔 약속까지 남은 거리 ⑤ 한 종목 · 한 업종 몫 · 색 🟢 🟡 🔴 · 🔴 때 넘긴 날 = 「참은 날」 · 펀드 · 우선주 등은 까닭(#/x 와 같게) · 「네가 정한 팔 선까지 3% 남았어」처럼 내 약속과 대조만
- 고도리 칸(D · `p-gdr.js`): 질문을 끝낸 사람(`doneOnce()`)에게만 열림 · 곳마다 「틀린다면 이유」 한 줄(gdr.json `wrong`) · 성적은 같은 때 코스피와 견줌 · 나빠도 숨기지 않음
- 셈(E): `pick.mjs` 가 회사 주식 모두의 다섯 문 결과 `site/next/data/gates.json`(`{schema: 'godori-gates-1', asOf, rules, co: {번호: [x, g1, g2, g3, g4, g5] …}}` · x = 먼저 뺀 까닭 0/1/2 · gN = 0/1/null) + gdr.json 곳마다 `wrong`(가장 아슬아슬한 문으로 쓴 한 줄) · F 가 따로 세어 틀림 0 일 때만
- 검사(G): 실패 셋(en · range · rivals)의 까닭을 고침 · 모든 쪽 검사의 첫 자료 받기에 다시 받기 · 옛 쪽 여는 때 비율을 재어 절반 넘으면 기준값 맞대기로 · 탭 이름 · 새 길(#/why/<번호> · #/s/…)은 A 가 끝낸 뒤 반영

## 결정표 덧붙임 — 「틀린다면 이유」 wrong-v1(E 가 만들고 F 가 따로 셈 · 고른 곳마다 한 줄 · 위에서부터 처음 맞는 하나)
gdr.json 곳마다 `g` 값으로(반올림 전 값 · 경계는 정확히):
1. r60 ≥ 30 → 「석 달 {r60:.0f}% 올라 숨이 찰 수 있어.」
2. low250x ≥ 1.7 → 「1년 바닥보다 {low250x:.1f}배라 더 오르기 버거울 수 있어.」
3. indX < 1.3 → 「업종 돈이 조금만 빠져도 이 문을 못 지나.」
4. opGrow 가 없음(앞 해 적자) 또는 < 0.2 → 「이익이 다시 줄면 고른 까닭이 사라져.」
5. 그 밖 → 「시장 전체가 내리면 같이 내릴 수 있어.」
(.0f · .1f = 파이썬 format 과 같은 반올림 · 화면은 이 글을 그대로 씀)

## gates.json 꼴(E · 회사 주식 모두 · 먼저 뺀 곳 포함)
`{"schema": "godori-gates-1", "version": "gdr-v1", "asOf": "YYYY-MM-DD", "keys": ["x", "g1", "g2", "g3", "g4", "g5"], "co": {"005930": [0, 1, 0, 1, 1, 0], …}}`
- x = 먼저 뺀 까닭: 0 = 안 뺌 · 1 = 거래 적음 · 2 = 거래 정지(추정) — 뺀 곳은 g1 ~ g5 = null
- gN = 1 지남 · 0 못 지남 · null 셀 수 없음 — 셈은 gdr-v1 그대로(g1 ~ g5 수 = gdr.json counts 와 같아야 함)
