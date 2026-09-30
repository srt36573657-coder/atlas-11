# ATLAS 11 · 완료 증거 검사 — 2026-09-30T08:25:58.995Z

커밋 dd3dc4c · 통과 9 · 대기 2 · 미연결 0

## 1. 52종목 처리 성공·실패 수 · 36요인 확보·실제 사용·미확보 — 통과
```json
{
 "stocks": 52,
 "confirmedCloses": 52,
 "lastRunConfirmedToday": "52/52 (2026-09-30T08:22:04Z)",
 "factorDay": "2026-09-30",
 "factorStatus": {
  "관측 기록(일부 성분) · 예측 미사용": 9,
  "관측 기록 · 예측 미사용": 4,
  "미확보": 20,
  "수치 입력": 2,
  "분산 모형": 1
 },
 "usedInForecast": [
  "F11",
  "F35",
  "F36"
 ],
 "observedNotUsed": [
  "F02",
  "F03",
  "F04",
  "F05",
  "F06",
  "F07",
  "F09",
  "F10",
  "F14",
  "F16",
  "F19",
  "F30",
  "F33"
 ],
 "missing": [
  "F01",
  "F08",
  "F12",
  "F13",
  "F15",
  "F17",
  "F18",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "F25",
  "F26",
  "F27",
  "F28",
  "F29",
  "F31",
  "F32",
  "F34"
 ]
}
```
필요한 조치: 미확보 20개(기업 실적·수주·재고·공매도·연기금 세부 등)는 열쇠가 필요한 공식 자료(OpenDART·KRX·한국은행 ECOS) 또는 유료 자료가 있어야 함

## 2. 52종목 출발점 차이 0원 · 다음 실제 거래일 20개 · 휴장일 오류 0 — 통과
```json
{
 "forecastId": "2026-09-30-atlas11-d63a7866e135fbc2",
 "actualAsOf": "2026-09-30",
 "anchorGapZero": "52/52",
 "futureDates": "2026-10-01 ~ 2026-10-30 (20개)",
 "skippedHolidays": [
  "2026-10-05",
  "2026-10-09"
 ],
 "holidayErrors": 0
}
```

## 3. 과거 전망 보존 · 미래 정보 차단 · 아직 오지 않은 목표일 미채점 — 통과
```json
{
 "publicationFiles": 6,
 "publicationFilesModifiedOrDeletedInGit": [],
 "scoredCells": 468,
 "cellsIssuedAfterTargetCloseOrBeyondActual": 0,
 "latestActual": "2026-09-30"
}
```

## 4. 정답·오답 양쪽 기록 · 날짜·종류별 검색·내려받기 — 통과
```json
{
 "liveCellsByClass": {
  "방향·크기 모두 맞음": 134,
  "방향·크기 모두 틀림": 42,
  "방향 맞고 크기 틀림": 109,
  "크기 허용·방향 틀림": 79
 },
 "ledgerTotals": {
  "collection": 270,
  "forecast": 4,
  "score": 1044,
  "analysis": 967,
  "factor": 108,
  "experiment": 11,
  "model": 0,
  "operation": 15
 },
 "ledgerDates": [
  "2026-09-29",
  "2026-09-30"
 ],
 "csvFiles": 13,
 "filters": [
  "codes",
  "groups",
  "factors",
  "classes",
  "causes",
  "modelVersions",
  "statuses",
  "families"
 ]
}
```

## 5. 후보와 운영 모델의 실제 차이 · 비교 숫자 4개 · 채택·보류 이유 — 통과
```json
{
 "operating": {
  "meanErrorPct": 9.310358180102945,
  "rankHits": 86,
  "origins": 120
 },
 "candidates": [
  {
   "id": "cand-006aefb23808",
   "label": "변동성 GARCH 고정",
   "meanErrorPct": 9.317454069624528,
   "rankHits": 85
  },
  {
   "id": "cand-52f5c4516030",
   "label": "특징 자체 20일·자체 60일·ATLAS52 상승·하락 폭·ATLAS52 5일 평균만",
   "meanErrorPct": 9.459201382268434,
   "rankHits": 110
  },
  {
   "id": "cand-563996496016",
   "label": "묶음 확산 고정 입력 group5",
   "meanErrorPct": 9.337641129413933,
   "rankHits": 115
  },
  {
   "id": "cand-61932e5bacf4",
   "label": "특징 자체 5일·자체 20일·자체 60일·ATLAS52 상승·하락 폭·ATLAS52 5일 평균만",
   "meanErrorPct": 9.4408716833582,
   "rankHits": 119
  },
  {
   "id": "cand-93d57983854e",
   "label": "시장 상태 고정 입력 breadth20",
   "meanErrorPct": 9.371487785169803,
   "rankHits": 84
  },
  {
   "id": "cand-94bdc0454e5e",
   "label": "벌점 [3,30]",
   "meanErrorPct": 9.260860780998023,
   "rankHits": 89
  },
  {
   "id": "cand-99b1f5f4a26c",
   "label": "특징 자체 1일·자체 2일·자체 5일·자체 20일·자체 60일만",
   "meanErrorPct": 9.291173601139265,
   "rankHits": 81
  },
  {
   "id": "cand-cada92bb6a02",
   "label": "벌점 [0.3,3]",
   "meanErrorPct": 9.360548110314964,
   "rankHits": 76
  },
  {
   "id": "cand-d935b67d4ce5",
   "label": "변동성 상수 고정",
   "meanErrorPct": 9.360384963260204,
   "rankHits": 83
  },
  {
   "id": "cand-e8a6bf641e5a",
   "label": "벌점 [10,100]",
   "meanErrorPct": 9.234629112538919,
   "rankHits": 82
  },
  {
   "id": "cand-f5472cad05be",
   "label": "시장 상태 고정 입력 basket20",
   "meanErrorPct": 9.308482523140183,
   "rankHits": 95
  }
 ],
 "registryEvents": {
  "candidate_created": 11,
  "backtested": 11,
  "gate_decision": 11,
  "rejected": 11,
  "no_change": 15
 },
 "operatingModel": "atlas11-A-1",
 "lastDecision": {
  "id": "evt-a1efc51a94439158",
  "at": "2026-09-30T08:22:04Z",
  "type": "no_change",
  "reason": "오늘 검증한 후보 없음",
  "configSHA256": "0fdb0105174880ae9f7eda06c4f70410507085553e51aba5ae437ceb95ddd340"
 }
}
```

## 6. 중복 실행·부분 수집·재시작·모델 복귀가 작동한 증거 — 통과
```json
{
 "tests": "73/73 통과",
 "duplicateTests": [
  "매일 실행기 8단계: 잠금 · 거래일 아님 · 마감 전 · 수집기 없음(부분) · 52 확정이면 발행(재사용) · 기록 8종 · 여섯 문장 · 같은 실행 두 번 = 기록 중복 0",
  "진화 단계: 캐시된 후보 검증 11개를 평가해 사건 장부·실험 기록을 남기고, 어느 것도 관문을 다 넘지 못해 운영 A 유지 · 두 번 실행해도 사건 중복 없음",
  "등록부: 사건 장부 재생으로 상태 · 채택은 operating 을 바꾸고 이전 버전을 남긴다 · 복귀는 직전 검증 버전으로 · 사건 중복 없음"
 ],
 "resumeTests": [
  "중단 뒤 이어서 실행: 발행 단계에서 죽어도 다음 실행이 같은 결과로 마무리하고 기록은 두 번 쌓이지 않는다 · 예약 종료 뒤에는 발행 없이 채점만"
 ],
 "partialTests": [
  "collect: 두 번째 받기에서 종가/거래량이 다르면 그 종목의 오늘 행만 빠지고 TODAY_NOT_FINAL · delayed=true · 나머지는 검증기 통과",
  "collect: 잘못된 행(종가 0 · OHLC 어긋남)은 넘기지 않고 경고 · 오늘 행이 잘못되면 TODAY_NOT_FINAL · 정지 봉은 통과 · 남은 행은 검증기 통과",
  "매일 실행기 8단계: 잠금 · 거래일 아님 · 마감 전 · 수집기 없음(부분) · 52 확정이면 발행(재사용) · 기록 8종 · 여섯 문장 · 같은 실행 두 번 = 기록 중복 0"
 ],
 "rollbackTests": [
  "채택 판정: 실제 검증 결과(운영 A vs 11 후보) — 네 숫자·관문·블록 불확실성 · 벌점[3,30]은 네 숫자 통과 뒤 방향 관문에서 기각 · 실전 관찰·복귀 규칙",
  "등록부: 사건 장부 재생으로 상태 · 채택은 operating 을 바꾸고 이전 버전을 남긴다 · 복귀는 직전 검증 버전으로 · 사건 중복 없음"
 ],
 "realRunsWithDuplicatesSkipped": [
  {
   "at": "2026-09-29T10:18:08Z",
   "newRecords": 64,
   "duplicates": 104
  },
  {
   "at": "2026-09-29T10:29:50Z",
   "newRecords": 60,
   "duplicates": 108
  },
  {
   "at": "2026-09-29T11:42:28Z",
   "newRecords": 0,
   "duplicates": 208
  },
  {
   "at": "2026-09-29T11:45:56Z",
   "newRecords": 0,
   "duplicates": 208
  },
  {
   "at": "2026-09-30T08:22:04Z",
   "newRecords": 260,
   "duplicates": 208
  }
 ],
 "note": "모델 복귀는 실제로 일어난 적 없음(채택된 후보가 없어 복귀할 대상도 없음) — 검사 입력으로만 확인"
}
```

## 7. 서버 스케줄러 연결 상태와 실제 예약 실행 기록 — 대기
```json
{
 "workflow": ".github/workflows/atlas11-daily.yml",
 "crons": [
  "0 7 * * 1-5",
  "7 7 * * 1-5",
  "37 7 * * 1-5"
 ],
 "meaning": "16:00 KST · 16:07 KST · 16:37 KST (평일 · 첫째가 기본 · 나머지는 예비)",
 "scheduledRuns": [],
 "manualGithubRuns": 1,
 "earlierGithubRunsWithoutRuntimeField": 10
}
```
필요한 조치: 첫 예약 실행(평일 16:00 KST) 뒤 다시 검사

## 8. PC·모바일 주요 화면 캡처와 그래프 좌표 검증 — 통과
```json
{
 "browser": {
  "passed": 112,
  "failed": 0,
  "at": "2026-09-29T22:44:38.459Z"
 },
 "coordinateChecks": [
  "ok pc 카드마다 1년 범위 띠·묶음 이름(9묶음)",
  "ok pc 실제선·오늘선·띠·경계선·출발점",
  "ok pc 세 겹 띠(5~95·10~90·25~75%)와 첫 숫자 강조",
  "ok pc 종목 정보(1년 범위 띠 · 18칸 · 동조 상위 5)",
  "ok pc 스푸마토 그래프: 아이보리 바탕·판·띠 경계선 6·실제선 그림자·후광·띠 그라데이션·좌표 변환 없음·모델 칩",
  "ok mobile 카드마다 1년 범위 띠·묶음 이름(9묶음)",
  "ok mobile 실제선·오늘선·띠·경계선·출발점",
  "ok mobile 세 겹 띠(5~95·10~90·25~75%)와 첫 숫자 강조"
 ],
 "note": "헤드리스 크롬(PC 1280×800 · 모바일 390×844 · 어두운 화면) · 실제 휴대폰 기기 검사 아님"
}
```

## 9. 실행 가능한 소스 · 의존성 고정 · 설정 예시 · 운영 설명서 · 배포용 결과물 — 대기
```json
{
 "files": {
  "package.json": true,
  "package-lock.json": true,
  "deploy/atlas11.env.example": true,
  "docs/ATLAS11_README.md": true,
  ".github/workflows/atlas11-daily.yml": true,
  ".github/workflows/atlas11-site.yml": true,
  ".github/workflows/atlas11-context.yml": true,
  "scripts/atlas11/deploy_netlify.mjs": true
 },
 "siteDeploy": null,
 "dropZip": "매일 실행이 GitHub 산출물(atlas11-drop-<번호>)로 올림"
}
```
필요한 조치: 넷리파이 열쇠(NETLIFY_AUTH_TOKEN)를 저장소 비밀에 넣으면 매일 화면이 자동으로 올라감(없으면 Drop ZIP 을 손으로 올려야 함)

## 10. 시장·수급·뉴스·공시·거시 관측 수집(기록 · 예측 미사용) — 통과
```json
{
 "day": "2026-09-30",
 "fetchedAt": "2026-09-30T08:21:48Z",
 "sources": "172/172",
 "errors": 0,
 "factorsObserved": [
  "F02",
  "F03",
  "F04",
  "F05",
  "F06",
  "F07",
  "F09",
  "F10",
  "F14",
  "F16",
  "F19",
  "F30",
  "F33"
 ],
 "index": {
  "KOSPI": {
   "date": "2026-09-30",
   "close": 6838.04,
   "changePct": -0.48,
   "status": "same_day"
  },
  "KOSDAQ": {
   "date": "2026-09-30",
   "close": 855.91,
   "changePct": 0.72,
   "status": "same_day"
  }
 },
 "news": {
  "stocks": 52,
  "raw": 1040,
  "distinct": 1023,
  "republished": 17,
  "sameArticle": 0,
  "stocksWithTodayNews": 47,
  "todayDistinct": 571
 },
 "flows": {
  "stocks": 52,
  "withToday": 0
 },
 "usedInForecast": false
}
```
필요한 조치: 정규장 시가·고가·저가·거래량은 여전히 비어 있음 — 한국거래소 Open API 이용 신청·승인 열쇠가 있어야 대체거래소 거래가 섞이지 않은 값을 받을 수 있음

## 11. 검사용 가짜 입력과 실제 시장 자료 분리 · 비밀 열쇠 없음 — 통과
```json
{
 "fixtures": [
  "collector",
  "context",
  "input-2026-09-28.json",
  "naver-minute"
 ],
 "realInput": "public/data/input.json (검사는 tests/atlas11/fixtures/input-2026-09-28.json 사본만 씀)",
 "secretPatternHits": 0
}
```
