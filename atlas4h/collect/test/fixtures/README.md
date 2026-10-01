# 자료 모으기 시험 재료

- 실제 응답(고치지 않은 원문 복사): `index-KOSPI.json` · `naver-SOX.json` · `naver-VIX.json` · `naver-CLcv1.json` · `naver-FX_USDKRW.json` · `disclosures-005930.json` · `fred-DEXKOUS.csv` ← `tests/atlas11/fixtures/context/` · `naver-INX.json` ← `reports/atlas11/probe/context2/world-inx-price.json` · `naver-minute-005930.json` · `naver-polling-005930.json` ← `reports/atlas11/probe/deep/`
- 만든 것(규칙 시험용 · 실제 값 아님): `synthetic-fred-*.csv` — FRED 원문이 저장소에 없어(VIXCLS 탐침은 시간 초과로 빈 파일) 꼴만 FRED 와 같게 만들었다. 같은 날 같은 값 → ok, 허용 폭 밖 → 확인 중, 늦게 나옴 → 한 출처가 나오도록 값을 골랐다.
- `empty.json` — 둘째 쪽(page=2)이 비었다는 뜻. 넘기기를 멈추게 한다.
- 시험 시각은 `2026-09-29T22:30:00Z`(한국 9/30 07:30). `urls.json` 은 그 시각에 수집기가 부르는 주소 → 파일.
