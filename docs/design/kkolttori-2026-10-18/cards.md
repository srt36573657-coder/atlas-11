# 일꾼 카드 — 골똘이 명령문(16:39) · 다시 띄움 17:27(싱가포르)

이름 = **골똘이**(영어 Golttori · `site/next/brand.js` NAME · NAME_EN · VIDEO) — 사장님 17:15 · 17:17 · 17:18 「골똘이!」(플랫폼 이름도). 명령문 원문 `order-1639.txt` 의 「꼴똘이」는 모두 골똘이로 읽는다. 본질 파일 = `docs/골똘이_본질.md`.
앞 일꾼이 17:18 에 멈춤 — 하던 일은 이미 작업 폴더에 있다(커밋 c83de2f87 = main f8cfcb1ed 위의 만드는 중). 먼저 `git diff f8cfcb1ed -- <내 파일>` 과 `accept/<ID>.md` 로 어디까지 했는지 보고 이어서 한다. 처음부터 다시 쓰지 않는다.
모두 공통: `worker-rules.md` 먼저 · 커밋 · 밀어 넣기 · 올리기 금지 · 내 파일만 · 화면 글은 쉬운 말 · 이름은 brand.js 에서 읽음 · 비밀 값 금지.

## KA 본질 문 — 명령문 [2] 4 ~ 6 · [11] 6
- `scripts/atlas11/next/essence_check.mjs` — `--dist <dir>`(올리기 직전 · 정적 · 자료 셈) · `--files a,b` / `--diff base..head`(진화 가지 지킴 `protectedTouched`) · 일곱 가지: ① 본질 파일(`docs/골똘이_본질.md`) · 명령문 파일 해시 = 잠금 마지막 줄 · 줄마다 at · words ② 첫 화면 본질 세 줄과 그 숫자 = 자료(`site/next/essence.js` 의 `essenceLines` · `essenceData` — KC · 회사 수와 받은 때를 따로 다시 세어 맞댐 · app.js 가 essenceBox 를 그리는지) ③ 망치는 길 낱말 0(`site/next/words.js` 에 `RUIN` 을 더함 — 망치는 길마다 낱말 · 오늘 사이트에 걸리는 것은 모두 보고 · 몰래 약하게 하지 않음) ④ 골똘이 칸(#/gdr)은 열한 질문을 끝낸 뒤에만 ⑤ 친구가 연 쪽(#/s/…)은 질문부터 ⑥ 보내는 글에 수익률 0(p-share.js · share-btn.js 의 실제 글 만드는 함수에 오른 종목 넣어 봄) ⑦ 오래된 날짜에 「?」. 끝 코드 0 통과 · 1 막힘(번호와 까닭) · 2 못 봄(올리기에서는 막힘).
- 지킬 파일(진화 가지가 건드리면 막힘): `docs/골똘이_본질.md`(옛 꼴똘이 · 꼴동이 경로도 목록에) · `config/atlas11/essence.lock.json` · `docs/design/kkolttori-2026-10-18/order-1639.txt` · `config/atlas11/jinhwa-metrics.v1.json` · `site/next/words.js` · `scripts/atlas11/next/essence_check.mjs` · `tests/atlas11/essence-gate.test.mjs` · `scripts/atlas11/jinhwa/**` · `lib/atlas11/jinhwa.mjs` · `lib/atlas11/tally.mjs` · `functions/atlas11/jinhwa.mjs` · `functions/atlas11/tally.mjs` · `.github/workflows/atlas11-daily.yml` · `atlas11-evening.yml`.
- `scripts/atlas11/deploy_netlify.mjs` 의 art_gate 바로 뒤에서 올리는 폴더로 돌림 · 걸리면 올리지 않고 「본질 문이 막음 — 지금 사이트 그대로」 · 다른 움직임은 그대로.
- `scripts/atlas11/next/check_essence.mjs` — 모든 쪽 검사용 껍데기(브라우저로 ② ④ ⑤ ⑦) · 꼴: `--base <url> --pw <dir> --all [--shard k/n] --out <json>` · 끝 코드 0/1.
- `tests/atlas11/essence-gate.test.mjs` — 깨끗한 판 통과 + 일부러 틀린 판 일곱(①~⑦ 하나씩) 막힘 + protectedTouched · 60초 안 · 임시 폴더 지움.
- 보고 25줄 안: 렌더 · 정적 나눔, 막힌 틀린 판 일곱(이름 · 끝 코드), 깨끗한 판 초, 더한 낱말과 오늘 걸린 것, 부르는 법, 못 한 것.

## KB1 카톡 속 — [6] 2 ~ 5 · 7 · 9 · [7] 전부
- `site/next/share-btn.js` 의 `shareButtons(o, {kakao: true})`(있음 · 노란 말풍선 44px · 줄 오른쪽 끝 · 누르면 보내기 글상자 · 이름 · 오늘 값 저절로 · 사람이 칠 것 0) · 앱 css 「카톡 단추」 묶음.
- 글상자: 빠른 말 셋은 누르는 즉시 보냄(카톡 단추 1 + 빠른 말 1 = 누름 두 번에 카톡 친구 고르기) · 내 말은 글칸 + 「보내기」 · 거르는 말 · 수익률 막기 그대로 · 보낸 뒤 보던 자리 그대로 · 폭죽 없음.
- 급등([6] 8): kind 'surge' 면 받는 카드 · 글에 한 줄 — **「1년 전 날아오른 36곳 중 n곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요」**(n · 36 = `/next/data/half36.json` 의 n · of · 파일이 없거나 깨지면 줄을 뺌 · 지어내지 않음). 까닭: 급등 칩의 옛 줄 「36곳 중 31곳이 지난 1년 안에 …」(지금 36곳의 지난 1년)과 숫자가 달라 헷갈리지 않게 — 리드가 정함(사장님 17:25 「현명하게 해」).
- 친구가 연 쪽(#/s/…): 「나도 보내기」는 그 쪽 질문에 다 답한 뒤에만.
- 스위치 둘([7] 1 · 2): 공유 · 가입을 나눔(`site/next/kakao.js` · `config/atlas11/kakao.json` · 옛 "on" 은 가입 스위치로 이어 읽음 · `lib/atlas11/kakao.mjs` 도 맞춤) · 공유는 자바스크립트 열쇠 · 도구 주소 · 무결성 값이 다 있을 때만 켜짐 · 비밀 값 금지.
- 카카오 카드([7] 3 ~ 5): 종목 이름 · 보낸 사람 말 · 보낸 날 값 · 단추 「열어 보기」(가입 켜지면 「카카오로 시작하기」 · 「그냥 보기」) · 열쇠 없거나 도구 실패 → 휴대폰 공유 창 → 글과 주소 복사.
- 보안 규칙([7] 6): `scripts/atlas11/site_headers.mjs` 는 공유 열쇠가 들어온 뒤에만 카카오 도구 주소 하나를 더함 — 오늘은 바이트까지 그대로(두 상태 모두 시험).
- 네 곳 시험([7] 7): 카톡 안 화면 · 아이폰 · 안드로이드 · 컴퓨터를 가짜 카카오(`tests/atlas11/fake-kakao/`) + 브라우저 흉내로 · 진짜 폰 · 진짜 카카오는 「?」.
- 사장님 몫([7] 8): `docs/design/godori-2026-10-18/kakao-signup.md` 맨 위 「카톡 공유 켜기」 다섯 줄(카카오 개발자 앱 이름 골똘이 · 자바스크립트 열쇠 · 사이트 주소 aaa7377.com 등록 · 열쇠 넣는 곳 · 실제 폰으로 한 번 보내 보기).
- `check_share.mjs` · `tests/atlas11/kakao-client.test.mjs` 를 새 움직임에 맞춤 · 끝에 한 번.

## KB2 카톡 줄 — [6] 1 · 6 · 8
- 종목이 나오는 모든 줄 · 카드(app.js 와 p-*.js — 사장님이 센 15곳)의 오른쪽 끝에 `shareButtons({code, name, price, day, kind}, {kakao: true})` 하나(null 이면 안 붙임). 줄 고리와 단추는 형제(단추가 a 안에 들지 않음) — 줄 = 회사, 단추 = 보내기. 급등 줄은 kind 'surge'. 쪽 모양 그대로 · 17px · 44px · 8/16/24 · 320/360/390 넘침 0.
- 남의 함수는 손대지 않음: app.js vHome 맨 위 essenceBox(KC) · app.js #/jinhwa 길(KD) · p-hold.js shortcuts() · p-why.js 합계 신호(KD) · p-share.js · kakao.js(KB1). 고치기 바로 전에 다시 읽음.
- `scripts/atlas11/next/check_kakao.mjs`(이름 꼭 이것 — 모든 쪽 검사가 `check_<영문>.mjs` 만 줍는다) · 꼴 `--base <url> --pw <dir> --all [--shard k/n] --out <json>` · 쪽마다 종목 줄 수 = 카톡 단추 수 · 단추 하나 눌러 글상자가 열리고 쪽이 안 바뀜 · 줄 눌러 회사로 감 · 다르면 끝 코드 1.
- `accept/KB2.md` 의 표(파일 · 함수 · 무슨 줄 · 몇 개 · 뺀 것과 까닭)를 끝까지 채움.

## KC 첫 화면 본질 세 줄 — [5] 전부
- `site/next/essence.js`: `ESSENCE`(세 줄 틀 — 사장님 글 그대로) · `essenceData({mkt, summary})` → {n, at}(n = 코스피 · 코스닥 회사 수를 자료에서 셈 — 어떻게 셌는지 머리에 적음 · at = 네이버에서 마지막으로 받은 때 · 모르면 「?」) · `essenceLines(d)` → 세 줄. DOM 없이(KA 가 불러 씀).
- app.js 새 함수 `essenceBox()` + vHome 맨 위(이야기 입구 위) 한 줄 · app.css 새 묶음 · 처음 온 사람은 펼침 · 다시 온 사람은 한 줄로 접음(localStorage `atlas:essence-seen` · try/catch · 저장 못 해도 됨) · 칸 밑 「골똘이의 고민 1분 보기 ›」(VIDEO.title)은 VIDEO.ready 일 때만 · 규칙 79 「세 덩이」와 따로 셈([5] 8 — page_rules · measure 가 이 칸을 세지 않게 · 까닭 주석).
- 「하루 4번」([5] 4): `scripts/atlas11/next/build_data.mjs` 가 `reports/atlas11/t365/updates/*.json` 으로 지난 7일 서울 날짜별 업데이트 수를 셈 → `home-summary.json` {fetchedAt, updates7, fourADay} · fourADay 가 참일 때만 「하루 4번」 글(app.js 약속 칸 · p-today 397 · p-info 58 · p-surge 196 · 439 · p-cal 206) · 아니면 「업데이트 때마다」 같은 참인 글. 오늘은 10월 17일 9번이라 거짓이어야 함.
- 소개 쪽 `site/hello.html`(세 줄 + 설명 · 미리보기 설명) · `site/next/index.html`(설명 · 미리보기 설명) — 정적이라 숫자 없는 말로(또는 묶을 때 채움) · 영상 칸은 VIDEO.ready 전 숨김 그대로(영상 약속 글 빼기).
- 영어는 add.mjs · quick.mjs('#/' 320/360/390 · '/hello.html' · --en) · 끝에 check_changed 한 번.

## KD 진화 칸 · 합계 칸 — [9] · [10]
- 서버(편지 여는 밤과 같은 넷리파이 함수 · 저장소): `lib/atlas11/jinhwa.mjs` + `functions/atlas11/jinhwa.mjs` — POST confirm · withdraw · revert {id}(사장님 열쇠 x-atlas-owner · ownerKeyOk · id 는 올린 `/next/data/jinhwa.json` 안 것만 · withdraw 는 들어가기 전만) · GET `/api/jinhwa/status`(열쇠 없이 번호 · 상태 · 때만) · GET `/api/jinhwa/me`(열쇠 맞나) · 깃허브 열쇠 없음.
- `lib/atlas11/tally.mjs` + `functions/atlas11/tally.mjs` — POST `/api/tally` {k}: stop · stop_rest · promise · promise_yes · (참고) visit · share · signup · 서울 날짜 합계만 · 이름 · 기기 번호 · 쿠키 · IP 저장 없음 · 막무가내 막기 · GET `/api/tally/sum?days=N` 열쇠 없이 잣대 넷만 · 참고 셋은 사장님 열쇠로만. `config/atlas11/jinhwa-metrics.v1.json`(잣대 셋 [10] 1 · 2 · 표본 작으면 모으기만 · 10거래일 뒤 채점).
- 화면 신호: `site/next/tally.js` 의 `tally(k)`(보내고 잊음 · 화면을 막지 않음) · p-why.js 세 자리(끝냄 · 「오늘은 쉬어 가자」 · 한 달 답과 「했어」) · 방문은 쪽 열 때 한 번 · 보내기는 KB1 이 부를 수 있게.
- `#/jinhwa`(`site/next/p-jinhwa.js` · `.css` · app.js 길 한 줄): 사장님 열쇠 기기(localStorage `atlas11:invite:owner` + 서버 /api/jinhwa/me 확인)에서만 · 아니면 흔적 없이 #/ · 보유종목 바로 가기 「진화 칸」 줄(p-hold.js shortcuts() 만)도 그 기기에서만 · 내용 [9] 2 ~ 7(본질 첫 줄 · 진화 n번째 · 기다리는 진화 셋 카드(1번 「세 사람이 고른 것」) · 「확인」 → 「확인함 · 다음 업데이트 ○시에 들어가요」 · 들어가기 전 다시 누르면 거둠 · 진화한 것 · 10거래일 뒤 예측 · 되돌리기 · 고친 고장 · 잣대 셋) · 빈 칸은 「기다리는 진화 0」처럼 정직하게 · 360×640 위쪽 한 화면 · 17px · 44px.
- `site/privacy.html` 합계 칸 한 단락 · 시험 `tests/atlas11/jinhwa.test.mjs` · `tally.test.mjs` · `scripts/atlas11/next/check_jinhwa.mjs`(꼴 `--base --pw --all --out` · 열쇠 없이 열린 수 0 = offDeviceOpens · 열쇠는 환경 `ATLAS_DEV_OWNER_KEY`(없고 127.0.0.1 이면 `testowner-key-1234567890`) · 진짜 사이트에서는 열쇠 길 「?」) · `scripts/atlas11/invite_dev.mjs` 가 두 API 를 메모리 저장소로.

## KE 진화 회차 — [8] · [9] 8 · 9 · [10] 6
- `docs/design/kkolttori-2026-10-18/jinhwa-round.md` = 예약 작업 「골똘이 진화 회차」 지시문 원본(한국어 · 혼자 읽고 끝까지) — 맨 앞 「먼저 docs/골똘이_본질.md를 읽는다」(gh api 로) → 열쇠 없는 `https://aaa7377.com/api/jinhwa/status` → (가) 확인된 대안이 있으면: 다른 올리기 · 실행이 돌면 기다림 · 그 가지 하나만 · essence_check `--diff` 지킴 통과 · 바뀐 파일 다섯 안 · 바뀐 쪽 검사와 모든 쪽 미리 검사(`atlas11-next-full.yml -f local=true` · `wip_preview.mjs`) 실패 0 → main 에 합쳐 밀어 넣음(:59 업데이트가 싣게) · 「들어감」 + 때 · 한 번에 하나 · 되돌리기 요청도 같은 길 (나) 기다리는 대안이 없으면: 카너먼 · 멍거 · 포퍼 셋을 따로 띄운 일꾼으로 토론(서로 초안을 한 번 봄) → 서로 다른 작은 대안 셋(1번 = 셋이 함께 고른 것) · 세 눈(카너먼: 더 빨리 사게 하나? 멍거: 망치는 길 · 잣대 비틀기? 포퍼: 예측과 되돌릴 조건 · 작은가?) · 대안마다 제 가지 `jinhwa/<날시>-<n>` · 다섯 파일 안 · 한 번에 되돌림 · 미리 검사 0 · 카드: 섬기는 본질 줄 · 전후 그림 · 세 사람 한마디 · 예측과 재는 법(잣대 셋만) · 되돌릴 조건 · 사전 부검 한 줄 · 「큰 것」 꼬리표 + 위험 두 줄(본질 · 돈 · 법 · 개인정보 · 카카오 · 보안 규칙 · 예약 작업 · 새 기능) (다) 기다리는 대안이 있으면 새로 안 만들고 새 자료로 다시 시험 · 고장 고침은 진화가 아님(바로 고치고 「고친 고장」) · 기계는 본질 · 망치는 길 · 잣대 · 명령문을 못 고침 · 기록은 회차마다 새 파일 `reports/atlas11/jinhwa/<ts>.json` · `site/next/data/jinhwa.json`(+ `jinhwa/<id>-before.png` · `-after.png`)을 main 에 · 새 대안이면 휴대폰 알림 한 줄 · 10거래일 뒤 `https://aaa7377.com/api/tally/sum` 으로 채점 · 사장님께 아주 쉬운 말 세 줄.
- `scripts/atlas11/jinhwa/`(gh.mjs · lib.mjs · shots.mjs 있음 + `round.mjs status|apply|revert|record|shots|score|--selftest`) · jinhwa.json 꼴은 split.md 그대로 · `site/next/data/jinhwa.json` 빈 판(정직하게) · `reports/atlas11/jinhwa/` 첫 기록(폴더 쓰는 법).
- 예약 작업은 만들지 않음(리드가) · 진짜 회차는 돌리지 않음(첫 올리기 뒤 리드가 시험).

## KF 영상 「골똘이의 고민」 — [4] · [3] 3
- 지금 video.mjs · draw.mjs · sound.py 를 이어 고침(앞 일꾼이 바꾼 곳 확인) · 60초(±0.05 아니면 멈춤) · 720×1280 · 30fps · 막 넷 장면 열(명령문 [4] 2 의 때와 줄 그대로 · 이름은 골똘이) · 웃음은 몸짓(발끝 들썩 · 미끄러짐 · 꼬리 매달림 · 흐트러진 깃털) · 사람 얼굴 · 해골 · 남의 캐릭터 · 카카오 로고 없음(노란 대화 카드만) · 글상자 · 움직임 · 소리를 같은 순간에 · 독백 줄이 보이는 동안 그 줄 길이만큼 앵무새 마디 소리 · 사람 · 기계 목소리 없음(마디 소리 · 효과음 · 배경 음악) · 한 장면 한 줄 크게.
- 숫자 · 이름 · 질문은 파일에서: 이름 brand.js(NAME · VIDEO.title) · 질문 열하나 p-why.js · ⑦의 n = `site/next/data/half36.json` 의 n(지금 18 · of 36 — 파일이 없으면 마지막 판은 멈춤) · ⑧ 세 줄 · ⑨ 「친구 3명마다 스타벅스 1만원」은 명령문 글 그대로.
- 영상 글에 words.js screenHits + RUIN · video.mjs 스스로 막는 옛 이름 목록(brand.js was — 꼴똘이 · 고도리 · 보드리 · 아틀란스 …) · 표지 makbi-poster.jpg 「골똘이의 고민 1분」 · VIDEO.ready 는 건드리지 않음(리드가 둘째 올리기에서) · 다 구운 뒤 장면 사진 열 장 `reports/atlas11/video/kkolttori-2026-10-18/scene-01.png` … `scene-10.png` 을 직접 열어 보고 고침 · CPU 둘을 나눠 쓰니 미리 보기는 작게, 마지막은 한두 번.

## KG2 반값 셈 따로 세기
- `docs/design/kkolttori-2026-10-18/half36.md`(결정표)만 읽고 `scripts/atlas11/next/verify/half36_verify.py` 를 따로 씀 — `scripts/atlas11/next/half36.mjs` 와 그 결과 파일 속 셈 방식은 보지 않음. 꼴: `python3 scripts/atlas11/next/verify/half36_verify.py --site <dir> --json <file>` · 끝 코드 0 맞음 / 1 다름 / 2 못 셈(결정표 §11).
- `node scripts/atlas11/next/half36.mjs --site site` 를 검사기와 함께 돌려(검사기가 0 이어야 파일을 씀) 지금 `site/next/data/half36.json` 의 `check` 를 채움. 다르면 어느 칸이 왜 다른지 보고(고치지 말고).

## KI 합치기 고침(18:10 · 다른 일꾼 보고에서 나온 것)
- `scripts/atlas11/next/next_check.mjs`: ① 「업종 칸 수」 — KB2 가 줄을 카톡 단추와 함께 감싸(app.js kkWrap · `data-kkrow`) 채널 칸 수가 0 으로 셈 → 셈 고르개가 감싼 줄 안의 칸을 세게(줄 · 단추 구조는 그대로) ② 「친구 소개 줄」 — 새 영상 전(brand.js VIDEO.ready false)에는 편지 띠 글이 「골똘이 소개 · 보내기」 — ready 에 따라 둘 다 받아들이게.
- `tests/atlas11/invite.test.mjs` 11번 · `tests/atlas11/kakao.test.mjs` ② — 함수 목록에 KD 의 jinhwa · tally 가 더해짐 → 기대 목록에 더함(함수 파일은 손대지 않음).
- 영어 320폭 위 막대 단추 셋이 43×44 — 이름이 Golttori(8자)로 길어진 탓인지 확인 → `site/next/app.css` 위 막대 칸만 최소 44px(다른 칸 손대지 않음 · quick '#/' '#/me' --en --w 320,360,390).
- 「하루 4번」 표 밖 글 넷: p-time 0거래일 줄 · p-up 제목 · surge.json 규칙 글 · core.json rules.next — 화면에 나오는 것만, `site/next/essence.js` 의 fourText(fourADay false → 참인 말)로 그리는 쪽에서 바꿈(t365 자료 · site/atlas 는 손대지 않음) · 옛 쪽과 맞대는 검사가 있으면 같은 표로 바꿔 맞댐(KC 가 check_misc · check_surge · check_cal 에 한 꼴 참고).
- 영어 사전 `i18n_build.mjs` 의 bad 2(KG 반값 note 두 줄 — 자리표 {n1}{n2} 꼴) → 엔진 꼴({n} 차례)로 add.mjs --force 고침 · bad 0 확인.
- 다른 일꾼(KA 본질 문 · KD 진화 칸 · KE 진화 회차 · KF 영상)이 아직 일함 — 그 파일은 손대지 않음. 끝에 check_changed 를 고친 파일 범위로 한 번.
