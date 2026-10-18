# KI 합치기 고침 — 잣대 먼저(cards.md 「KI」 18:10 + 리드 말 18:4x 셋)

맡은 것: `scripts/atlas11/next/next_check.mjs`(두 판정만) · `tests/atlas11/invite.test.mjs` 11번 · `tests/atlas11/kakao.test.mjs` ② 기대 목록 · `site/next/app.css` 위 막대 칸 · 「하루 4번」 표 밖 글 넷(`essence.js` 표 · 그리는 쪽 p-time · p-up · p-surge · p-info) · 영어 사전 bad 2 · `app.js` wTags · `site/letter.js` 도장 칸 · 새 `site/invite.js`
손대지 않음: KA · KD · KE · KF 파일 · `site/app/**` · `site/atlas/**` · t365 자료 · 함수 파일

| 항목 | 다 됐다는 증거(잴 수 있게) | 어떻게 잼 | 결과 |
|---|---|---|---|
| 1 ① 업종 칸 수 | next_check 업종 칸 셈 = 감싼 줄(`[data-kkrow]`) 안 칸 + 안 감싼 칸 · 줄 · 단추 구조 그대로 · 업종 칸 수 실패 0 | next_check `--limit` 작게(업종 셋 이상 돎) | |
| 1 ② 친구 소개 줄 | VIDEO.ready false → 「친구에게 소개하기<이름> 소개 · 보내기」 · true → 「친구에게 소개하기<이름>의 고민 1분 영상 · 보내기」 · 지금 실패 0 · 영어 틀 남음 0 | next_check 같은 판 · quick '#/me' --en | |
| 2 함수 목록 시험 | invite.test 11번 · kakao.test ② 기대 = invite · jinhwa · letter · tally(+ 켜면 kakao) · 두 파일 실패 0 | node --test 두 파일 | |
| 3 위 막대 44px | 원인 셈(이름 길이 탓인지 옛 이름 글자로 바꿔 잼) · 영어 320 · 360 · 390 와 한국어 위 막대 단추 셋 44×44 · 넘침 0 | quick '#/' '#/me' --en --w 320,360,390 + 한국어 | |
| 4 「하루 4번」 표 밖 넷 | fourADay false 일 때 p-time 0거래일 줄 · p-up 제목(+ 밑 줄) · p-surge 「어떻게 골랐나요?」 규칙 글 · p-info 다시 고르기 줄에 「하루 4번」 0 · true 면 그대로 · 옛 쪽 맞대기는 같은 표(fourDeep) | 노드 셈(표) · quick 네 쪽 · check_misc --only up,time,info · check_surge --limit 1 | |
| 5 영어 사전 bad | i18n_build bad 0(반값 note 두 줄 엔진 꼴 {n}) | i18n_build | |
| 6 ④ wTags | wTags 부르는 줄에 `opened(` · 질문 안 끝낸 기기 = 회사 쪽 칸 번호 꼬리표 0 · 끝낸 기기 = 그대로 · 본질 문 ④ 지나감 | essence_check · quick #/w/100030 두 판(기록 없음 · 끝낸 기록) | |
| 7 ③ 도장 모으기 | letter.js 도장 칸 · 그 칸만의 css · 영어 · 시험 지움 · 다른 보상 더함 0 · 본질 문 ③ letter.js 0 · letter 시험 실패 0 | essence_check · node --test letter.test | |
| 8 ③ 초대장 쪽 | site/invite.html → /invite.js(새 · /app/invite.js 는 그대로) · 옛 이름 · 「매수 검토」 0 · 이름은 brand.js · 본질 문 ③ 0 · 초대장 시험 실패 0 · 영어 틀 남음 0 | essence_check · quick /invite.html(+ --en) · node --test invite.test | |
| 9 끝 검사 | check_changed(고친 파일 범위) 한 번 실패 0 | check_changed.mjs | |
