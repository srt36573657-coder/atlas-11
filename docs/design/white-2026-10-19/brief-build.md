# 짓기 일꾼 잣대 — 흰 첫 화면(사장님 2026-10-19 02:03 「구글과 잡스 판」 · 원문 order-0203.txt · 고른 시안 w3-b)

먼저 읽기: `docs/골똘이_본질.md` · `docs/design/white-2026-10-19/order-0203.txt` · 고른 시안 `docs/design/white-2026-10-19/mock/w3-b.html` · `.png` · `.why.md` · 5초 답 `pick/one.md` · 검사 `scripts/atlas11/next/check_white.mjs`(머리말이 잣대)
가지 = `wip-white`(이 작업 폴더 /home/claude/atlas-video · 지금 그 가지). 커밋 · 밀기는 하지 않음(리드가 함). **한 파일은 한 일꾼만** — 아래 내 파일 밖은 읽기만.

## 올리기 둘
- ① 색과 첫 화면: 흰 판은 **첫 화면(#/ · `#/f/…` 없이 `''` 길)에서만** — `html.white` 꼴(app.js 가 첫 화면일 때만 붙이고 다른 길에서는 뗌)
- ② 다른 쪽(나중 · 이번에는 하지 않음): 모든 길에 `html.white`

## 일꾼과 파일
- **색(A)**: `site/next/app.css` 만 — 맨 끝에 「흰 판(html.white)」 묶음. 토큰: `--bg #FFFFFF` · `--ink #16181D` · `--gold #8A6516` · `--up #D0202E` · `--down #1E5BD8` · 흐린 글 4.5 이상(예 `--sub #4A505A` · `--mute #5A606B`) · 테두리 · 단추 바탕은 둘레와 3 이상(예 `--hair #8E949E`) · `color-scheme: light` · 위 막대 · 아래 단추 · 카톡 단추 · `.ibtn` · `#jhBtn` 을 흰 판에서 48 × 48 이상 · 그림자 · 그러데이션 · 입체 0(흰 판 안 모든 것) · 글씨 17px 아래 없음. 대비는 `node scripts/atlas11/next/check_white.mjs` 와 직접 셈으로 확인.
- **첫 화면(B)**: `site/next/app.js`(첫 화면 함수만: vHomeAll · homeBand · essenceBox · godoriHome 부르는 곳 · homeRest · 첫 화면의 칩 줄 · route 안 `html.white` 토글 · `meta[name=theme-color]`) · 새 파일 `site/next/home.css`(index.html 에 고리 하나) · `site/next/index.html` · `site/next/p-why.js`(보이는 판정 글만 · 한 달 된 기록 셈을 내보내는 함수 하나 — 기록 속 판정 값 · V_CODE · VTONE · 신호(tally) 셈은 그대로)
- **검사(C)**: `scripts/atlas11/next/check_white.mjs` · `check_changed.mjs`(바뀐 파일 → check_white 짝) · 모든 쪽 검사 · 올리기 직전 문(본질 문 곁)에 check_white 붙이기 · `docs/골똘이_화면잣대.md`(새 한 장) · `docs/ATLAS_원칙.md`(바꾼 앞 규칙 74 먹빛 · 홈 칩 / 79 [6] 첫 화면 세 덩이 / 판정 글) · 업데이트 기록 한 줄(`reports/atlas11/changelog/updates/` 새 파일) · `tests/atlas11/white.test.mjs`
- **영어(D, B 뒤)**: `scripts/atlas11/next/i18n/en-src.json` → `node scripts/atlas11/next/i18n_build.mjs` · 영어 검사 실패 0

## 첫 화면(w3-b 차례 · 위에서 아래)
1. 본질 카드 `[data-w="ess"]` = 지금 `essenceBox()`(section.ess · `[data-ess="1|2|3"]` 글 그대로 · 처음 온 기기 펼침 · 다시 온 기기 첫 줄만) + 큰 「n번 멈춤 · n번 약속」(이 기기 기록: 멈춤 = 끝낸 매매일지 수 · 약속 = 「그날 정한 대로 했어?」에 「했어」 수 · 기억 못 하는 기계면 「?」 · 지어 채우지 않음)
2. 한 달 된 기록(장 스무 번 지남 · p-why 의 셈 그대로)이 있으면 카드 밑 금빛 한 줄 「그날 정한 대로 했어?」 → 그 기록으로(#/why)
3. 작은 앵무새(`/media/makbi-icon.svg`) + 골똘이 말 `[data-say]` 「오늘은 쉬어 갈까?」(물음으로 끝)
4. 찾기 칸 `[data-w="find"]` = 「친구야, 왜 사?」 글 칸 하나(자리 글 「친구야, 왜 사? 회사 이름」) — 치면 회사 줄이 뜨고(누르면 `#/why/<번호>` → 열한 질문 1번) · 뜬 회사 줄에 `data-path="q1"` · 회사 목록 자료는 칸을 누르거나 칠 때 받음(첫 그림을 늦추지 않게) · 지금 p-why 의 찾기 셈(첫 글자 ㅅㅅㅈㅈ · 번호)을 옮겨 씀
5. 오늘 장 `[data-w="today"]` = 지금 `homeBand()` 한 줄(날짜 · 코스피 · 코스닥 · 큰 날 금빛 「!」 · 오래되면 맨 앞 「?」 · `[data-num]`) → #/today
6. 골똘이 칸 `[data-w="gdr"]` = 바로 가기 넷 한 줄: 골똘이 칸(#/gdr) · 달력(#/cal) · 조건 찾기(#/cond) · 대장주(#/f/lead) — 각 48 × 48 이상
7. 「전부 보기」 `[data-w="all"]` = `<details>` 의 `<summary>` · 펴면 한 줄에 하나씩(네모 칸 0): 오르는 업종(#/f/rise) · 급등(#/surge) · 큰 업종 · 업종 · 미국 · 고른 곳 · 오늘의 이야기(#/talk) + 지금 homeRest 내용 · 오르는 것은 여기서만(첫 화면에 안 보임)
8. 시황 사실 `[data-w="news"]` = 오른 곳 n(.up) 줄 · 내린 곳 n(.dn) 줄(모든 회사 마지막 날 · 요약 파일) · 사실마다 `[data-fact]` + `<button>왜 그럴까?</button>` → 누르면 그 밑에 물음 셋(「누가 팔았을까?」 「다른 날에도 그랬을까?」 「내 이유와 상관있을까?」) · 답 · 앞날 없음
9. 안전 한 줄은 그대로(「골똘이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.」 — 글자 수 잣대 안에서)
- 뺄 것: 첫 화면 칩 줄(→ 전부 보기 안으로) · 이야기 입구 띠(→ 전부 보기 안으로) · 「친구야, 왜 사?」 큰 카드(whyCard) · 고도리 칸 큰 칸(gdrSection) — 첫 화면에서는 찾기 칸 · 바로 가기로 대신 · 그 쪽(#/why · #/gdr)은 그대로
- 글자 수: 다시 온 기기 130자 이하 · 처음 온 기기 261자 이하(#view 보이는 글 · 띄어쓰기 빼고)
- 빠르기: 느린 4G 에서 가장 큰 그림 2.5초 안 — 첫 화면이 받는 것은 home.json · 요약 파일만(회사 목록 · 질문 모듈은 칠 때) · 글꼴이 그림을 막지 않게
- 「?」는 골똘이 말 끝과 숫자 줄 맨 앞 모름 · 오래됨 표시뿐 · 앞날 · 순위 · 추천 말 없음 · 숫자 · 날짜 · 본질 세 줄 · 사장님 글(질문 · 답 · 격언)은 그대로
- 판정 글(p-why 결과에 보이는 말)은 물음으로 끝나게 보이는 글만 바꿈 — 보기 「좋아, 정해 둔 대로만」 → 「좋아, 정해 둔 대로만 할까?」 · 「오늘은 쉬어 가자」 → 「오늘은 쉬어 갈까?」 — 기록에 적는 값 · 색 · 셈 · stop_rest 신호는 그대로

## 확인(내 몫만 · 실패 0)
시험 서버: `node scripts/atlas11/invite_dev.mjs --dir site --port <빈 포트> --owner-key testowner-key-1234567890`(배경) → `node scripts/atlas11/next/check_white.mjs --base http://127.0.0.1:<포트>` · 바뀐 쪽 검사 `node scripts/atlas11/next/check_changed.mjs --files <내 파일들>` · 본질 문 `node scripts/atlas11/next/essence_check.mjs`
