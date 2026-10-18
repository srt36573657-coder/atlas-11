# 일 나누기 한 장 — 꼴똘이 · 진화가 본질인 명령문(사장님 2026-10-18 16:39 싱가포르)

원문 `order-1639.txt` · 본질 `docs/꼴똘이_본질.md` · 잠금 `config/atlas11/essence.lock.json` · 일꾼 규칙 `worker-rules.md`(먼저 읽음)
약속한 끝: ① 영상 빼고 모두 올리기 = 23:30 · ② 영상 올리기 = 다음 날 01:30 · 끝 보고 02:00(싱가포르) — 사장님께 16:5x 에 알림
차례(명령문 [11] 2): [3] 이름(끝남 · 커밋 32bf5bba5) → [2] 본질 문 → [5] 첫 화면 → [6][7] 카톡 → [9] 진화 칸 → [8] 진화 회차 → [4] 영상. 합치는 차례가 이것이고, 만드는 것은 함께 시작한다(영상은 둘째 올리기라 처음부터 따로 만듦).
반값 숫자 n(명령문 [4] 2 ⑦ · [6] 8): 사장님께 (가)/(나) 여쭘 → 17:01 「가장 논리적인 것을 선탹해」 → (가)(문장 뜻이 「날아오른 뒤 1년」) = 「1년 전 이맘때 5거래일 오름 상위 36곳이 그 뒤 1년 안에 그날 값의 반 아래로 간 적이 있는 수」.

| 일꾼 | 명령문 | 맡은 파일(남은 손대지 않음) | 남에게 주는 것 |
|---|---|---|---|
| 리드(나) | [3] · [2] 7 ~ 10 · [11] 9 · 합치기 · 검사 · 올리기 · 예약 작업 | brand.js · 예약 작업 넷(지시문 · 이름 · 실패 알림) · 새 예약 「꼴똘이 진화 회차」 · `.claude/settings.json` SessionStart · CLAUDE.md · `docs/ATLAS_원칙.md` 규칙 80 · `docs/고도리_지도.md` · speed · 바뀐 것 기록 | — |
| KA 본질 문 | [2] 4 ~ 6 · [11] 6 | 새 `scripts/atlas11/next/essence_check.mjs` · 새 `tests/atlas11/essence-gate.test.mjs`(틀린 판 일곱) · `site/next/words.js`(망치는 길 낱말 `RUIN` 더하기) · `scripts/atlas11/deploy_netlify.mjs`(art_gate 바로 뒤 한 줄) | `protectedTouched(files)` · `checkDist(dir)` · `checkEssenceFile()` |
| KB1 카톡 속 | [6] 2 ~ 5 · 7 · 9 · [7] 전부 | 새 `site/next/share-btn.js`(shareButtons 를 여기로 · p-share.js 는 다시 내보냄) · `site/next/p-share.js` · `p-share.css` · `site/next/kakao.js` · `config/atlas11/kakao.json` · `lib/atlas11/kakao.mjs`(스위치 둘) · `scripts/atlas11/site_headers.mjs`(열쇠 뒤에만 카카오 주소) · `check_share.mjs` · `tests/atlas11/kakao-client.test.mjs` · `docs/design/godori-2026-10-18/kakao-signup.md` 맨 위 다섯 줄 | `shareButtons(o, {kakao: true})` = 노란 말풍선 44px 단추 하나(줄 오른쪽 끝) · o = {code, name, price, day, kind: 'share'|'surge', half: {n, of}} |
| KB2 카톡 줄 | [6] 1 · 6 · 8 | 종목 줄 · 카드가 있는 15곳의 줄 그리는 함수만: `app.js`(vHome · vSub · vFind · vChannel · vShorts 의 줄) · `p-cal` `p-chx` `p-co` `p-cond` `p-gdr` `p-grow` `p-hold`(줄) `p-past` `p-range` `p-rivals` `p-surge` `p-talk` `p-time` `p-today` `p-why`(줄) `p-x` — 줄 꼴 css 는 각 p-*.css · 새 `scripts/atlas11/next/check_kakao_rows.mjs`(종목 고리 수 = 카톡 단추 수) | 곳 수 표 |
| KC 첫 화면 세 줄 | [5] 전부 | 새 `site/next/essence.js` · `app.js` 새 함수 `essenceBox()` + vHome 맨 위 한 줄 · `app.css` 새 묶음 · `site/hello.html`(세 줄 · 설명 글) · `site/next/index.html`(설명 · 미리보기 설명) · `scripts/atlas11/next/build_data.mjs`(받은 때 · 지난 7일 업데이트 수 → home-summary.json) · 「하루 4번」 글이 있는 줄(p-today 397 · p-info 58 · p-surge 196 · 439 · p-cal 206 · app.js 약속 칸) | `essenceLines(d)` · home-summary.json `{fetchedAt, updates7, fourADay}` |
| KD 진화 칸 · 합계 칸 | [9] · [10] | 새 `site/next/p-jinhwa.js` · `p-jinhwa.css` · 새 `lib/atlas11/jinhwa.mjs` · `functions/atlas11/jinhwa.mjs` · 새 `lib/atlas11/tally.mjs` · `functions/atlas11/tally.mjs` · `app.js` 길 한 줄(`#/jinhwa`) · `p-hold.js` shortcuts() 한 줄(사장님 열쇠 기기만) · `p-why.js` 합계 신호 세 곳(끝냄 · 쉬어 가자 · 한 달 답) · `site/privacy.html` 합계 칸 · 새 `config/atlas11/jinhwa-metrics.v1.json` · 시험 `tests/atlas11/jinhwa.test.mjs` `tally.test.mjs` · 새 `check_jinhwa.mjs` | `/api/jinhwa/status`(열쇠 없이 번호 · 상태만) · `/api/tally` |
| KE 진화 회차 | [8] | 새 `scripts/atlas11/jinhwa/`(round.mjs · alt.mjs · shots.mjs …) · 새 `docs/design/kkolttori-2026-10-18/jinhwa-round.md`(예약 작업 지시문 원본) · 기록 `reports/atlas11/jinhwa/`(새 파일만) · `site/next/data/jinhwa.json` 꼴(아래) | 예약 지시문 · 시험 회차 한 번 |
| KF 영상 | [4] | `scripts/atlas11/makbi/video.mjs` · `draw.mjs` · `sound.py` · 만든 것 `site/media/makbi-intro.mp4` · `.webm` · `makbi-poster.jpg` · 장면 사진 `reports/atlas11/video/kkolttori-2026-10-18/` | 60초 · 열 장면 · 사진 열 장 |
| KG 반값 셈 | [4] 2 ⑦ · [6] 8 | 새 결정표 `docs/design/kkolttori-2026-10-18/half36.md` · 새 `scripts/atlas11/next/half36.mjs` → `site/next/data/half36.json` · 따로 세기는 다른 일꾼 KG2 가 결정표만 보고 `scripts/atlas11/next/verify/half36_verify.py` · 틀림 0 일 때만 씀 | `half36.json {n, of: 36, day, until, rule}` |

`site/next/data/jinhwa.json`(KE 가 씀 · KD 가 그림): `{schema: 'kkolttori-jinhwa-1', made, essence: 본질 첫 줄, n: 진화한 수, next: 다음 업데이트 때(서울), waiting: [{id, title, pick, serves, before, after, voices: {kahneman, munger, popper}, predict: {text, measure, days: 10}, revert, premortem, big, risks: [], branch, files: [], checks: {changed, preview}}], applied: [{id, title, at, before, after, predict, score: {at, ok, text}}], fixed: [{at, what}], facts: {mismatch, at}}` · 그림은 `site/next/data/jinhwa/<id>-before.png` · `-after.png`.
확인 상태는 넷리파이 함수 저장소(편지 여는 밤과 같은 길): POST confirm · withdraw · revert(사장님 열쇠 x-atlas-owner) · GET status(열쇠 없이 번호 · 상태만). 깃허브 열쇠는 쓰지 않는다.

합치기: 일꾼은 커밋하지 않는다. 리드가 [11] 2 차례로 묶어 커밋 → 바뀐 쪽 검사 → 깃허브 모든 쪽 검사 실패 0 → 올리기. 걸린 초는 `reports/atlas11/speed/2026-10-18.jsonl`.
