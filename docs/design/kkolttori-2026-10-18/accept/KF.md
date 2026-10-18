# KF 영상 「골똘이의 고민」 — 받아들이는 기준(먼저 씀 · 2026-10-18 17:05 싱가포르 · 이름 골똘이로 고쳐 이어 씀 17:30 · 결과 채움)

맡은 파일: `scripts/atlas11/makbi/video.mjs` · `draw.mjs` · `sound.py` · 만든 것 `site/media/makbi-intro.mp4` · `.webm` · `makbi-poster.jpg` · 장면 사진 `reports/atlas11/video/kkolttori-2026-10-18/scene-01.png` ~ `scene-10.png` · 때 표 `reports/atlas11/video/kkolttori-2026-10-18/cues.json`
이름은 `site/next/brand.js`(NAME · VIDEO.title) — 영상 · 소리 파일에 이름 글자를 박지 않음(옛 이름 목록도 brand.js was).

| 항목 | 다 했다는 증거(잴 수 있는 것) | 어떻게 재나 | 결과 |
|---|---|---|---|
| [4] 1 새로 짬 · 60초 | mp4 · webm 길이 60.0초(±0.05) · 옛 장면 열셋 글 0 · 햄릿 독백 흉내 고민극 | 굽기 끝에 ffprobe — 다르면 굽기가 멈춤(video.mjs) | RESULT1 |
| [4] 2 막 넷 · 장면 열 | 장면 표 = 명령문 [4] 2 를 그대로 읽은 것(① 0~6 … ⑩ 57~60) · 장면마다 따옴 줄 수 1·1·2·1·1·1·2·3·2·1 · 글은 명령문 글자 그대로(줄바꿈 = 빈칸 · 옛 이름 → brand.js 이름) · 막 넷 = ①② · ③④⑤ · ⑥⑦ · ⑧⑨⑩(막 바뀔 때 막이 반쯤 닫힘) | video.mjs 가 `order-1639.txt` [4] 2 를 읽어 장면 열 · 0~60 잇달음 · 따옴 줄 수를 맞대 봄 — 다르면 멈춤 | RESULT2 |
| [4] 3 몸짓 웃음 | 발끝 들썩(② ③) · 미끄러짐 + 꼬리 매달림(④ ⑤) · 흐트러진 깃털(③ 바람 · ⑦ 돌아온 새 떼) 장면 사진에 보임 · 사람 얼굴 · 해골 · 남의 캐릭터 · 로고 그림 0 | 장면 사진 눈으로 · draw.mjs 에 얼굴 그림 없음 | RESULT3 |
| [4] 4 글 · 움직임 · 소리 같은 때 | 독백 글자 하나 = 앵무새 마디 하나(때 표 cues.json 한 벌을 화면 — 글상자 글자 불 · 부리 · 깃펜 획 — 과 소리가 같이 씀) · 마디 수 = 독백 한글 글자 수 | 굽기가 cues.json 을 쓰고 sound.py 가 그것만 읽음 · 줄마다 글자 수와 마디 수를 맞댐 | RESULT4 |
| [4] 5 목소리 없음 | 소리 = 앵무새 마디 · 효과음 · 배경 음악만(계산으로 만듦 · 녹음 · 기계 목소리 0) | sound.py 에 읽어 주기 · 녹음 파일 없음 | RESULT5 |
| [4] 6 한 장면 한 줄 · 크게 | 글상자 글씨 48px 이상(720 폭 · 폰 390 폭에서 26px 이상) · 글상자 · 그림 글이 화면 밖으로 넘친 것 0 · 한때 글상자 하나(⑦ 은 독백 → 반값 줄 차례로 · ⑧ 은 세 줄을 하나씩) | 굽기 문(fitCheck)이 세 장마다 글상자 글씨 · 넘침 · 화면 밖을 재어 걸리면 멈춤 · 장면 사진 | RESULT6 |
| [4] 7 파일에서 읽음 | 이름 · 제목 = brand.js NAME · VIDEO.title · 질문 열한 개 = p-why.js QS · n · 36 = site/next/data/half36.json(n · of) · 친구 수 = next/app.js HELLO_PROMO · 「친구야, 왜 사?」 = p-why.js 에 있는지 맞댐 · 주소 = hello.html og:url | 굽기가 「사실」 한 줄을 찍음 · half36.json 이 없거나 깨지면 멈춤(지어내지 않음) | RESULT7 |
| [4] 8 쓰지 않을 말 | 그린 글 모두에 words.js screenHits 0 · ruinHits 0 · gainHits 0 · 옛 이름(brand.js was 한 · 영 + 홍표 · 막비) 0 · 옛 상품권 글 0 · 장면 줄 · 질문 · 이름 · 주소가 모두 그린 글에 있음 | 굽기 문(video.mjs judge) — 걸리면 멈춤 | RESULT8 |
| [4] 9 표지 | makbi-poster.jpg 에 「골똘이의 고민 1분」(VIDEO.title) | 표지 그린 글에 VIDEO.title 이 없으면 멈춤 · 눈으로 봄 | RESULT9 |
| [4] 10 장면 사진 열 장 | scene-01.png ~ scene-10.png(720×1280 · 다 구운 mp4 에서 뽑음) | 파일 열 개 · 한 장씩 눈으로 봄(잘림 · 겹침 · 못 읽음 0) | RESULT10 |
| [3] 3 앵무새 이름 | ⑩ 말주머니 「골똘이!」 세 번 · 소리도 세 번(이름 글자 수만큼 마디) | 그린 글 맞대기 · cues.json | RESULT11 |
| 본질 | 앞날 맞히기 · 사고팔기 권함 · 폭죽 · 연속 보상 · 수익 자랑 0 · ⑧ 본질 세 줄 글자 그대로 · ⑦ 흐트러진 새 = n마리(자료 수와 같음 · 부풀리지 않음) | 굽기 문 · 장면 사진 | RESULT12 |
| brand.js VIDEO.ready | 고치지 않음(리드가 둘째 올리기에서 켬) | git diff 0 | RESULT13 |
