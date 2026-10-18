먼저 docs/골똘이_본질.md를 읽는다 — gh api repos/srt36573657-coder/atlas-11/contents/docs/골똘이_본질.md -H "Accept: application/vnd.github.raw" . 골똘이는 주식을 사기 전에 한 번 멈추게 하는 곳이다. 지난 기록만 보여 주고, 앞날을 맞히지 않고, 사고팔기를 권하지 않는다. 이 일도 그 본질 안에서만 한다(사장님 2026-10-18 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [8] · 17:18 「골똘이!」 — 이름 = 골똘이).

골똘이 사이트(aaa7377.com)의 「진화 회차」를 돌리는 예약 작업이다. 매시 업데이트(서울 정각 · 하루 24번 · 주말 · 공휴일도)의 30분 전(매시 :29)에 깨어난다(사장님 2026-10-18 20:59 「한시간 마다 업데이트를 하라」 · 21:00 「진화도 24번 한다」 · 옛 판 하루 4번 평일). 사장님(신대근 · 코딩과 영어를 모르심)이 2026-10-18 16:39(싱가포르) 「이 명령문의 본질은 진화다. 업데이트할 때마다 꼴똘이의 본질 안에서 한 가지씩 나아진다. 사장님의 「확인」이 있어야만.」이라고 하셔서 만든 것이다. 세 사람은 대니얼 카너먼, 찰리 멍거, 칼 포퍼다. 되묻지 말고 혼자 끝까지 한다.
(이 파일 = 예약 작업 지시문 원본 · docs/design/kkolttori-2026-10-18/jinhwa-round.md · 고칠 때는 이 파일과 예약 작업을 함께 고친다)

저장소 · 때 · 도구
- 저장소 srt36573657-coder/atlas-11 · 시각은 한국 시각: TZ=Asia/Seoul date '+%Y-%m-%d %H:%M'
- 회차 도구: node scripts/atlas11/jinhwa/round.mjs <명령> — 결과는 표준 출력에 JSON 한 줄(ok · why …) · 끝 코드 0 했음 · 1 막음 · 2 차례가 아님 · 3 바쁨(다음 회차)
- 확인 상태는 열쇠 없는 읽기 주소 https://aaa7377.com/api/jinhwa/status 로 번호 · 상태만 읽는다(round.mjs 가 읽음). 사장님 열쇠 · 깃허브 열쇠를 사이트나 파일에 두지 않는다([9] 8).
  이 방의 바깥 길이 aaa7377.com 을 막으면(2026-10-18 막힘 확인) round.mjs 가 깃허브 작업 atlas11-jinhwa-read.yml 을 불러 깃허브 실행기에서 같은 두 주소를 열쇠 없이 읽어 온다(1분쯤). 둘 다 못 읽으면 「확인 상태를 못 읽음」 — 아무것도 넣지 않는다.
- 진화 칸 = 사장님 열쇠 기기에서만 열리는 쪽 #/jinhwa · 자료 site/next/data/jinhwa.json(이 회차가 씀) · 그림 site/next/data/jinhwa/<번호>-before.png · -after.png
- 잣대 셋(config/atlas11/jinhwa-metrics.v1.json): ① 멈춤(매매일지를 끝낸 수 · 그중 「쉬어 가자」) ② 약속(한 달 뒤 「정한 대로 했어?」에 답한 수 · 그중 「했어」) ③ 사실(화면 숫자가 자료와 다른 곳 0). 방문 수 · 가입 수 · 보내기 수는 잣대가 아니다.

할 일(차례대로 · 막히면 그 자리에서 7 「끝」으로 가고 보고)
0. 작업 폴더
   cd ~ && if [ -d atlas-11-jinhwa/.git ]; then git -C atlas-11-jinhwa fetch -q --no-tags origin main && git -C atlas-11-jinhwa checkout -q -B main origin/main; else gh repo clone srt36573657-coder/atlas-11 atlas-11-jinhwa -- --filter=blob:none --no-tags --single-branch --branch main; fi
   cd ~/atlas-11-jinhwa && git config core.hooksPath scripts/atlas11/hooks && ( [ -d node_modules ] || npm ci --no-audit --no-fund --loglevel=error )
   node scripts/atlas11/jinhwa/round.mjs --selftest — 실패가 하나라도 있으면 아무것도 넣지 않고 7 로(보고 첫 줄 「실패」).
1. 시작: node scripts/atlas11/jinhwa/round.mjs begin
   본질 파일 해시 · 첫 줄을 읽고(읽었다는 증거로 기록에 남음) 잠금과 맞댄다 · 회차 잠금(한 번에 한 회차) · 열쇠 없는 상태 읽기 · 할 일(plan)을 셈.
   끝 코드 3 = 다른 회차가 돎 → 아무것도 하지 않고 「바쁨」 한 줄로 끝. 1 = 본질 잠금이 맞지 않는 등 → 넣지 않고 7 로.
2. 확인된 대안 넣기 · 되돌리기 — plan.change 가 있을 때만 · 한 번에 하나([8] 2)
   plan.change.kind 가 apply 면: node scripts/atlas11/jinhwa/round.mjs apply --id <plan.change.id>
   revert 면: node scripts/atlas11/jinhwa/round.mjs revert --id <plan.change.id>
   round.mjs 가 하는 것: 넣기 직전 · 밀기 직전 상태를 다시 봄(그새 거두셨으면 안 넣음) · 대안 가지가 만든 그대로인지(지문) · 바뀐 파일 다섯 안 · 지킴 파일 0 · 본질 문(essence_check --diff 지킴 파일 · 일곱 가지 정적 검사에서 지금 main 보다 새로 걸리는 곳 0) · 바뀐 쪽 검사 0 · 모든 쪽 미리 검사 0(atlas11-next-full.yml -f local=true — 같은 코드로 이미 통과한 결과가 있으면 그것) · 다른 올리기(atlas11-site · daily · evening)가 돌면 끝날 때까지 기다림 · main 에 앞으로만 밂(강제 없음).
   끝 코드 3 = 올리기가 아직 돎 · 검사 결과를 못 기다림 → 다음 회차가 다시 한다. 1 = 넣지 않음(까닭을 보고). 확인 없이 넣는 길은 없다.
   넣거나 되돌린 회차에는 새 대안을 만들지 않는다. 곧바로 5 · 6 으로 — 업데이트 4분 전(:56)까지 기록이 main 에 들어가야 진화 칸의 「들어감」이 같은 업데이트에 실린다.
3. plan.next 에 따라 하나만
   finish = 지난 회차가 못 본 미리 검사 결과: node scripts/atlas11/jinhwa/round.mjs finish --wait 3
   retest = 기다리는 대안이 있음 → 새로 만들지 않고 새 자료로 다시 시험([8] 3): node scripts/atlas11/jinhwa/round.mjs retest → 미리 검사가 새로 돌았으면 finish --wait 20
   make = 기다리는 대안이 없음 → 4 의 세 사람 토론
   none = 넣은 회차 — 건너뜀
   고장 고침(깨진 길 · 날짜 「?」 · 오타 — [8] 9)을 찾았고 2 에서 아무것도 넣지 않았을 때만: round.mjs fix-start → 받은 dir 에서 고치고 git commit → round.mjs fix --kind <깨진 길 | 날짜 「?」 | 오타> --what "<무엇을 고쳤나 한 줄>". 고장 고침은 진화가 아니라 확인 없이 바로 들어가지만, 3파일 · 20줄 · 줄마다 몇 글자만 · css 와 새 파일 0 일 때만 지나간다. 화면 모양이나 글 뜻이 바뀌면 고장 고침이 아니다 — 대안으로 만든다.
4. 세 사람 토론으로 대안 셋(plan.next = make 일 때만 · [8] 3 ~ 8)
   4-1 재료를 읽는다: 본질 파일 · 진화 칸 자료(site/next/data/jinhwa.json) · 최근 기록 셋(reports/atlas11/jinhwa/) · 지금 사이트 모든 쪽 검사(reports/atlas11/probe/next-full/summary.json) · 첫 화면과 「왜 사?」 쪽 코드(site/next/app.js · p-why.js).
   4-2 세 사람을 따로 띄운 일꾼(Task · Agent 도구)으로 — 카너먼 · 멍거 · 포퍼가 저마다 작은 고칠 거리 초안을 쓴다 → 서로의 초안을 한 번 본 뒤 고쳐 쓴다 → 함께 서로 다른 셋을 고른다. 1번은 세 사람이 함께 고른 것(셋 모두 받아들이고 둘 이상이 맨 먼저 꼽음). 도구가 없으면 한 일꾼이 세 사람을 차례로 따로 맡고 debate.json 의 mode 를 "single" 로 적는다.
   4-3 세 눈을 모두 지나야 대안이다([8] 6): 카너먼 눈 — 더 빨리 사게 하나?(아니어야 함) · 멍거 눈 — 망치는 길에 닿나, 잣대를 비트나?(아니어야 함) · 포퍼 눈 — 어림과 되돌릴 조건이 있나, 작은가?(있어야 · 작아야 함)
   4-3a 「왜?」 36번(사장님 2026-10-18 「진화를 할때 왜를 36번 해야 한다」 · 「가로 해」 · 「넣어」): 대안마다 「왜 이걸 고치나?」를 이어서 36번 묻고, 답 36줄(1번 ~ 36번)을 모두 적는다. 앞 답이 다음 물음이 된다. 36번째 답이 본질(주식을 사기 전에 한 번 멈추게 하는 곳)에 닿지 않으면 그 대안은 올리지 않는다. 카드(debate.json)에는 36줄 칸이 없으므로(도구가 정한 칸) 36줄은 새 파일 reports/atlas11/jinhwa/<회차>-why36.md 에 대안별로 적어 record 때 함께 main 에 올리고(새 파일만 · 지우지 않음), 카드 premortem 에는 36번째 답(마지막 이유) 한 줄만 쓴다. 사장님께 36줄이 어디 있는지 알린다.
   4-4 대안은 작아야 한다([8] 7): 바뀌는 파일 다섯 개 안 · 한 번에 되돌릴 수 있게 · 파일을 지우지 않음. 기계는 본질 파일 · 망치는 길 목록(site/next/words.js) · 잣대 · 명령문 · 진화 회차 도구 · 진화 칸 · 합계 칸 · 검사 · 예약 작업 · 옛 화면 · 이름(brand.js)을 못 고친다([8] 10 · round.mjs 가 막음). 합계 칸 신호(tally)를 더하거나 빼는 줄도 막힌다(잣대를 비틀 수 있음).
       새 한국어 화면 글을 넣으면 커밋하기 전에 반드시 같은 가지에서 node scripts/atlas11/next/i18n/add.mjs "<한국어 틀>" "<영어>" → node scripts/atlas11/next/i18n_build.mjs 를 돌려 en-src.json · site/next/i18n/en.json 도 함께 커밋한다(두 파일도 다섯에 듦 · 영어가 없으면 alt 가 미리 검사 전에 막고 「영어 사전에 없는 화면 글」과 넣을 틀을 알려 준다 — 그 틀 그대로 넣고 다시 alt · 2026-10-18 20:20 첫 회차 대안 셋이 이것으로 모두 떨어짐).
       대안마다: node scripts/atlas11/jinhwa/round.mjs alt-start --n <1|2|3> → 받은 dir 에서 고치고 git -C <dir> commit -am "<이름>" → node scripts/atlas11/jinhwa/round.mjs alt --n <n> --route '#/<보일 쪽>' [--seed <localStorage 열쇠>=<값>] [--steps '<누르기 차례 JSON>']
       바뀐 곳 표시(사장님 2026-10-19 「어디를 고쳤는지 글은 있는데 표기가 없어서 한참 찾아야 해」): alt 는 전후 두 쪽을 끝까지 찍어 다른 곳을 찾고, 그 곳이 화면 위쪽에 오게 내려 찍고, 카드에 금빛 네모와 「바뀐 곳」 크게 보기를 단다. 전후 그림이 같으면 떨어진다 — 결과 화면처럼 눌러야 나오는 곳을 고쳤으면 --steps 로 누르기 차례를 준다. 꼴 = [{"fill":"<css>","text":"<글>"} · {"click":"<css>","nth":0} · {"press":"<css>","key":"Enter"} · {"wait":600}] 20개까지. 매매일지 결과 화면 예: [{"fill":".wy-find","text":"삼성전자"},{"wait":600},{"click":".wy-hit"}, {"click":".wy-opt"} 열한 번, {"click":".wy-quick button"},{"click":".wy-nav .wy-next"}] (마지막 둘을 빼면 팔 약속 쓰는 쪽).
       alt 가 보는 것: 다섯 · 지킴 · 잣대 신호 · 본질 문(지킴 파일 · 일곱 가지에 새로 걸림 0) · 「큰 것」 까닭 · 더한 화면 글의 쓰지 않을 말(words.js screenHits · 망치는 길 ruinHits · 수익 자랑 · 옛 이름 · 퍼센트) · 다른 대안과 같은 고침 · 바뀐 쪽 검사 0 · 전과 후 그림(360 × 640 · 같은 자료 · 두 그림이 같으면 떨어짐 · 바뀐 곳 네모) · 모든 쪽 미리 검사 시작. 막히면 까닭대로 한 번 고쳐 다시. 그래도 막히면 그 번호는 뺀다(셋이 안 되면 지나간 것만 · 1번이 없으면 올리지 않음).
   4-5 카드 글을 debate.json 으로 쓴다(꼴 아래) → node scripts/atlas11/jinhwa/round.mjs cards --debate debate.json
       카드마다([8] 5): 이름 한 줄 · 섬기는 본질 줄(본질 파일 글자 그대로 — 번호 줄이나 ①②③ 마디 · 「…다.」 문장 하나) · 세 사람 한마디 · 어림 글과 잴 규칙(잣대 셋 가운데 하나만) · 되돌릴 조건 · 사전 부검 한 줄(1년 뒤 이 고침이 실패했다면 왜?) · 「큰 것」이면 위험 두 줄.
       본질 · 돈 · 법 · 개인정보 · 카카오 · 보안 규칙 · 예약 작업 · 새 기능에 닿으면 「큰 것」 꼬리표와 위험 두 줄([8] 8 — 기계가 찾은 까닭이 있으면 big 이 저절로 참).
       글에 쓰지 않는 말: 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 퍼센트(%) · 옛 이름 · 망치는 길 낱말(대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 …). 「예측」 대신 「어림」. cards 가 걸린 말을 알려 주면 그 말만 바꿔 다시.
   4-6 미리 검사 결과: node scripts/atlas11/jinhwa/round.mjs finish --wait 25 — 한 회차에 만든 대안이 모두 끝나야 함께 오른다. 못 기다린 것은 다음 회차가 이어서 본다(그림은 기록 단계가 main 에 먼저 둠).
       만든 대안은 기록이 main 에 들어간 뒤의 업데이트에 실려 진화 칸에 보인다(업데이트 4분 전을 넘기면 그다음 업데이트).
5. 채점: node scripts/atlas11/jinhwa/round.mjs score — 들어간 진화의 어림을 10거래일 뒤 잣대로 매긴다(열쇠 없는 https://aaa7377.com/api/tally/sum · 표본이 30 안 되면 판단하지 않고 모음 · 같은 길이로 늘려 60거래일까지 · 앞뒤 차이가 소음 안이면 「판단 못 함」 · [10] 5 · 6).
6. 기록: node scripts/atlas11/jinhwa/round.mjs record — 진화 칸 자료 · 그림 · 기록 reports/atlas11/jinhwa/<회차>.json(회차마다 새 파일 · 지우지 않음)을 main 에 앞으로만 밂 → 다음 업데이트가 사이트에 싣는다. 결과의 owner = 사장님께 세 줄 · notice = 알림 한 줄.
   notice 가 비어 있지 않으면(새 대안이 진화 칸에 오름) PushNotification 도구로 그 한 줄을 사장님 휴대폰에 보낸다([9] 9 · 카카오톡 알림은 카카오 열쇠가 생긴 뒤에 바꾼다).
7. 끝: node scripts/atlas11/jinhwa/round.mjs end — 막혔어도 언제나(회차 잠금을 풂 · 일 폴더를 지움). 실패면 PushNotification 도구로 「골똘이 진화 회차 실패 — <까닭 한 줄>」.

debate.json 꼴(round.mjs cards 가 맞대 봄)
{"mode": "subagents", "top": {"kahneman": 2, "munger": 2, "popper": 1},
 "people": {"kahneman": "<초안 요약 한 문단>", "munger": "…", "popper": "…"},
 "alts": [{"n": 1, "title": "<40자 안>", "serves": "<본질 줄 그대로>",
   "voices": {"kahneman": "<한마디>", "munger": "<한마디>", "popper": "<한마디>"},
   "eyes": {"kahneman": {"faster": false, "why": "…"}, "munger": {"ruin": false, "bend": false, "why": "…"}, "popper": {"predict": true, "revert": true, "small": true, "why": "…"}},
   "accept": {"kahneman": true, "munger": true, "popper": true},
   "predict": {"text": "<어림 한 줄>", "rule": {"measure": "stop", "num": "stop_rest", "den": "stop", "dir": "up"}},
   "revert": "<되돌릴 조건>", "premortem": "<1년 뒤 실패했다면 왜?>", "big": false, "risks": []}]}
 잴 규칙(rule)은 이 가운데 하나: 멈춤 {measure stop · num stop | num stop_rest den stop} · 약속 {measure promise · num promise | num promise_yes den promise} · dir up 또는 down · 사실 {measure fact · num mismatch · dir zero 또는 down}

지킬 것
- 확인 없이 들어간 진화는 0 이어야 한다. 넣는 것은 round.mjs apply 하나뿐이고, 그것은 열쇠 없는 상태가 「확인」이고 회차 때 전에 왔고 기다리는 목록에 있고 지문이 같을 때만 넣는다. 다른 길(손으로 합치기 · 강제 밀기)로 넣지 않는다.
- 저장소에서 쓰는 곳: 대안 가지 jinhwa/<회차>-<n> · 시험 가지 jinhwa-try/ · jinhwa-fix/ · 잠금 가지 jinhwa-lock · main 에는 round.mjs 가 넣은 커밋(넣기 · 되돌리기 · 고친 고장 · 기록)만. 예약 작업 파일(atlas11-daily.yml · atlas11-evening.yml)은 고치지 않는다.
- 본질 파일 · 망치는 길 목록 · 잣대 · 명령문을 고치지 않는다([8] 10). 기록은 회차마다 새 파일로 남기고 지우지 않는다.
- NETLIFY_AUTH_TOKEN 같은 비밀 값을 찾거나 적지 않는다. 사장님 열쇠를 쓰지 않는다(상태 · 합계는 열쇠 없이 읽음).
- 주가를 맞히는 말, 사고팔기를 권하는 말, 수익률, 순위, 폭죽, 연속 접속 보상을 대안에 넣지 않는다. 방문 수를 잣대로 삼지 않는다. 동의 없이 모으지 않는다.
- 막힌 것 · 못 기다린 것을 통과로 적지 않는다. 없으면 없다고 적는다.

보고 — 사장님께 아주 쉬운 말 · 세 줄(record 결과 owner 세 줄 그대로) · 실패일 때만 넷째 줄
1. 이번 회차에 한 일 한 줄(넣음 · 되돌림 · 새 대안 n개 · 다시 시험 · 바꾼 것 없음)
2. 진화 칸에서 확인을 기다리는 대안 수 — 넣지 못했으면 그 까닭
3. 「확인 없이 들어간 것은 0개예요. 못 한 것은 n가지예요.」
4. (실패일 때만) 막힌 단계와 까닭 한 줄
이 네 줄 밖의 글(과정 · 명령 · 파일 이름 · 시각 나열 · 인사 · 다음 할 일)은 쓰지 않는다.
