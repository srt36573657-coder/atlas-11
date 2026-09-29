# ATLAS 11 독립 검증 보고 (independent-check)

- 검증 시각: 2026-09-28T13:57Z (22:57 KST)
- 검증자: 제작에 관여하지 않은 별도 세션. 모든 결과는 아래 적은 명령을 직접 실행해 얻었다.
- 범위: 인계서 `ATLAS_Claude_Handoff.md` 12절·16절과 의뢰받은 15개 항목. 읽기 전용 검사만 했다(build_forecast·run_daily·package 실행 안 함). 15번 항목의 정적 서버는 검사 뒤 정지했다.
- 대상 발행본: `2026-09-28-atlas11-27e1f65cfc167be9` (issuedAt 2026-09-28T13:29:56.398Z, actualAsOf 2026-09-28)

## 0. 결과 한눈에

| 번호 | 항목 | 판정 | 핵심 증거 |
|---|---|---|---|
| 1 | 52종목 코드·이름이 인계서 16절과 동일 | PASS | 52/52 코드 동일 집합·중복 0·순서까지 동일, 이름 불일치 0, 업종 불일치 0 |
| 2 | anchor=input 종가, rows[0]=anchor, rows 21, actual60 60, scenario 21 | PASS | 52/52 전 항목 |
| 3 | futureDates 20개 · 달력 세션 · 주말/휴일 없음 · 9/28 뒤 첫 20세션 | PASS | 20개 모두 일치, 10-05·10-09 없음 |
| 4 | 분위수 순서 · 확률합 1 · 최댓값 선택 · deletedForLoss 0 | PASS | 1,040행 위반 0, 합 편차 최대 1.1e-16, 선택 위반 0 |
| 5 | 옛 엔진(rolling-forecast.json)과 p10/p50/p90 동일 | PASS | 3,276/3,276 동일, 최대 차이 0 |
| 6 | 미래 누수 없음 | PASS | actual60>asOf 0, cutoff==issuedAt, prior=false, 뉴스 375건 used=false·numeric=false |
| 7 | 불변성(versions·byte 동일·CSV sha256·22줄·실제출발) | PASS | 2 버전 파일명=ID, byte 동일, sha256sum 52 OK, 52×22줄 |
| 8 | 화면 묶음 forecastId·p50·race 일치 | PASS(주석) | 57개 파일 ID 일치, p50 최대 편차 0.005, race 52선·10000·20점. 단 scores.json엔 forecastId 필드 자체가 없음(livePublications 안에 있음) |
| 9 | 설명문 52개 서로 다름 | PASS | 첫 미래일 52/52 고유(20개 미래일 전부 고유) |
| 10 | scoredDates 0 · firstScorableDate 9/29 · 9/23 참조본 excluded | PASS | 그대로 확인 |
| 11 | A/B 숫자 · 결정 · 120 origins · 124,800행 | PASS | A 9.310358 / B 9.385398 / 86 / 100 / selected A / adoptedB false; paired.csv에서 재계산 일치 |
| 12 | dist/ 구조·비밀키·크기·manifest ID | PASS | index.html 최상위, 비밀키 값 0건, atlas.json 없음, 8,935,538B(8.5MB), ID 일치 |
| 13 | tests.tap 16/0 · browser failed 0 · pc/mobile 검사 | PASS | pass 16 fail 0; 브라우저 53/0 (pc 26·mobile 27), CSV·52선·중요일정 정지 모두 포함 |
| 14 | atlas.json.original 해시 | PASS | 1af446f7…5833ca 정확히 일치 |
| 15 | dist 정적 서빙 200 | PASS | index.html 200(1,154B), manifest.json 200(8,286B) → 서버 정지 확인 |

15개 항목 모두 통과. 다만 8번의 scores.json 문제와 아래 「발견 사항」의 문서·산출물 불일치 8건은 따로 읽어야 한다.

---

## 1. 52종목 코드·이름 (PASS)

- 인계서 16절 표를 정규식으로 파싱: 52행, 고유 코드 52.
- `forecast.json.universe`: 길이 52, 고유 52. 인계서에 없는 코드 0, 인계서에 있는데 빠진 코드 0. **순서까지 동일**(005930 … 030000).
- `assets[].name`·`sector` 52개 모두 인계서와 문자열 일치(불일치 0).
- `universeHash` = `sha256(codes.join(','))` = `a2a1aa9f…7574f` 재현 일치.

## 2. 출발점·행 길이 (PASS, 52/52)

`public/data/input.json` 과 대조(`input.actualAsOf` = 2026-09-28, 52종목 모두 마지막 가격일 2026-09-28, 9/28 이후 가격 행 0).

| 검사 | 결과 |
|---|---|
| anchor.close == input 9/28 close, anchor.date == 9/28 | 52 |
| rows[0].date == 9/28, p05~p95 == anchor.close, anchor=true | 52 |
| rows.length == 21 | 52 |
| rows 날짜 == [9/28, futureDates…] | 52 |
| actual60.length == 60, 마지막 == 9/28 anchor | 52 |
| actual60 == input 가격의 마지막 60세션(날짜·종가) | 52 |
| actual60 날짜 == historyDates(7/1~9/28) | 52 |
| scenario.prices.length == 21, [0] == anchor | 52 |
| scenario.prices[20] == anchor·exp(Σ dailyLogReturns) (1e-6) | 52 |

## 3. 미래 날짜·달력 (PASS)

- futureDates 20개: 9/29, 9/30, 10/1, 10/2, 10/6, 10/7, 10/8, 10/12, 10/13, 10/14, 10/15, 10/16, 10/19, 10/20, 10/21, 10/22, 10/23, 10/26, 10/27, 10/28.
- 모두 > 2026-09-28, 모두 `rolling-calendar.json.sessions`(844개, 2023-06-14~2026-11-30)에 존재, 주말 0, 휴일(10-05·10-09) 0, 강증가, **9/28 뒤 첫 20세션과 정확히 동일**.
- 달력 자체: 주말 포함 0, 선언된 휴일 포함 0, 중복 0, 정렬됨, 9/28 포함.
- `calendarVersion.sessionsSHA256` = `sha256(JSON.stringify(sessions ≤ 2026-10-28))`(821개) = `12d0971d…2147b8` 재현 일치.
- 참고: 2026-06-03(수)이 세션에 없고 holidays 표에도 없다(지방선거일). 52종목 모두 6/3 가격 행이 없어 자료와는 모순 없음.

## 4. 분위수·확률·선택 (PASS)

- 미래행 1,040개(52×20): p05≤p10≤p25≤p50≤p75≤p90≤p95 위반 0, 비유한값/0 이하 0.
- direction.daily·cumulative 확률합: 편차 최대 1.11e-16(1e-9 이내), 위반 0. 확률 6,240개 전부 1/20000 배수(20,000경로와 정합).
- `selected` == 최댓값 항목 위반 0. 동률 규칙(flat→up→down) 위반 0. exactTie 4건(그중 D+1 삼성전자 up 0.4823 = down 0.4823 → up 선택, 규칙대로).
- `return` == p50/anchor−1 편차 0. mean이 [p05,p95] 밖 0.
- `audit.deletedForLoss` = 0, `invalidPaths` = 0, `lossPathsRetained` 52개(최소 6,053 ~ 최대 12,907).
- summary.closeCallStocksDay1 32 = 실제 D+1 daily closeCall 32; closeCallStocksDay20 32 = D+20 cumulative closeCall 32(D+20 daily는 33).

## 5. 옛 엔진 수치 보존 (PASS)

`public/data/rolling-forecast.json` (id `2026-09-28-rolling20-13cd892134e517b4`, issuedAt 09:39:48Z) 대비:
- p10/p50/p90 × 21행 × 52종목 = **3,276개 값 3,276개 동일, 최대 절대 차이 0**.
- 덤: mean 1,092/1,092 동일, 방향확률(daily·horizon) 1,040/1,040 동일, anchor 52 동일, 날짜 불일치 0.

## 6. 미래 누수 (PASS)

- actual60에 asOf 이후 날짜 0/52. `informationCutoff` == `issuedAt` == 2026-09-28T13:29:56.398Z.
- `provenance.priorForecastUsedAsNumericInput` === false, `backdatedIssuance` false, `anchorSource` observed_close_only.
- 뉴스 375건 전부 `used=false`, `numericImpactAllowed=false`, `impact=null`. summary.newsNumericEvents 0.
- `targetCompletedBeforeIssue` true 0, previous 52개 모두 null(직전 거래일 실시간 발행 없음).
- 모델 trainedThrough 2026-09-16, calibrationFrozenBefore 2026-09-17, stateUpdatedThrough 2026-09-28(52개 동일).
- anchor.observedAt 52개 모두 2026-09-28T09:38:36Z(18:38 KST, 마감 뒤), finalClose 52 true, priceBasis KRX_REGULAR.

## 7. 불변성 (PASS)

- `reports/atlas11/versions/`: `2026-09-28-atlas11-27e1f65cfc167be9.json`(forecastId 일치), `2026-09-28-atlas11-90616c6bc916e8d6.json`(일치).
- `public/data/atlas11/forecast.json` 과 versions 파일 **byte 동일**(2,866,364B, sha256 `a116be17…3513`), `latest.json.publicationSHA256` 과도 일치.
- CSV manifest(`atlas11-csv-manifest-1`, rowsPerFile 21, anchorRowIncluded true): `sha256sum -c` 로 **52개 OK**(두 발행본 폴더 모두 52/52). 디스크의 CSV 중 manifest에 없는 파일 0.
- `wc -l`: 52파일 × 22줄 = 1,144줄. 첫 자료행 = `2026-09-28,실제출발,<anchor>,<anchor>,<anchor>` 52/52. 2~21행 날짜·예측값(p50)·상단(p90)·하단(p10)이 forecast.json과 0.5원 이내 52/52. 파일명 `ATLAS_<코드>_20260928.csv` 52/52. (UTF-8 BOM·CRLF)
- `assets[].csvUrl` 52개 모두 최신 발행본 폴더를 가리킴.
- 추가 재현: `implementationSHA256`(소스 7개 파일 결합 해시) = `f6dde232…149` **현재 소스에서 재계산 일치** → 발행본이 지금 디스크의 코드와 같은 코드로 만들어짐. `inputHash`·`semanticSHA256`·`forecastId` 도 입력 파일과 순수 함수만으로 재계산해 **정확히 일치**(`27e1f65cfc167be9…`).

## 8. 화면 묶음 일치 (PASS, 주석 하나)

- `view/manifest.json.forecastId` == forecast.json. cards/race/evolution/status 4개 파일 ID 일치. stocks/*.json 52개 파일 ID 일치(파일명 == code).
- manifest.files 57개(sha256·bytes) 전부 실제 파일과 일치.
- card.day20.p50 vs stocks rows[20].p50 vs forecast rows[20].p50: 52/52 0.01 이내(최대 0.0050 — 상세·카드는 소수 둘째 자리 반올림). day1·day5 p50 52/52, close==anchor 52/52, 확률·선택 52/52.
- race.json: stocks 52, actual 21점(startDate 2026-08-27 → 9/28), actual[0].value==10000 52/52, forecast 20점 52/52, forecast.value == 10000·p50/startClose 편차 0, actual 마지막 == anchor 수준 52/52. levelRank(41일)·futureReturnRank(20일) 정렬 규칙 재계산 일치, futureReturnRank[D+20] == 카드 순서.
- **주석**: `scores.json` 에는 최상위 `forecastId` 필드가 없다(schema `atlas11-scoreboard-1`). 최신 ID는 `livePublications[2].forecastId` 로만 들어 있고, manifest가 scores.json의 sha256을 들고 있어 묶음 정합은 유지된다. 의뢰 문구 그대로의 "scores.json.forecastId" 검사는 필드 부재로 성립하지 않는다.

## 9. 설명문 고유성 (PASS)

- stocks/*.json `explain` 키 80개(과거 60 + 미래 20). 첫 미래일 2026-09-29 `text` 52개 모두 서로 다름(중복 0). 20개 미래일 전부 52개 고유.
- 참고: 숫자·부호를 지우면 문장 틀은 9종이다(같은 템플릿에 종목별 숫자·일정을 채움). 인계서의 「기업마다 같은 문장 복사 금지」는 숫자 기준으로는 지켜졌고, 문장 틀은 공유한다.

## 10. 성적판 (PASS)

- scores.json: `scoredDates` 0, `firstScorableDate` 2026-09-29, `byDate` [], `excluded[0].forecastId` = `2026-09-23-rolling20-c2697de31ff6788c`(사유: 보관 종가 참조본). `sourceScoreId` == `public/data/rolling-scores.json.scoreId`(ac28def8…).

## 11. A/B (PASS)

- `reports/atlas11/ab/latest.json`: A meanErrorPct 9.310358180102945, B 9.385397528271163, rankHits A 86 / B 100, numericalGate false, decision.selected 'A', adoptedB false, origins 120, stockTargetRows 124,800.
- `ab-db46556a729dde8b/result.json`: origins 120, blocks 6, stockTargetRows 124,800, rankMaximum 600, 시작 13:03:11Z → 종료 13:14:16Z(run.log 664,824ms ≈ 11.1분).
- 독립 재계산: `days[]`(120일) 평균 → A 9.310358180102945 / B 9.385397528271163, rankA 합 86 / rankB 합 100. `paired.csv`(헤더+124,800행, 52코드×120기준일×20목표일)에서 재계산 → A 9.31035818008 / B 9.38539752752(CSV 6자리 반올림 차이만). errorA = |A−actual|/actual×100 공식 5,000행 표본 불일치 0.
- 이전 세션 실행(10:47Z)과 숫자가 15자리까지 같다 — 같은 시드(20260917)·같은 입력의 결정적 재실행으로 설명된다.

## 12. dist/ (PASS)

- `dist/index.html` 최상위 존재(1,154B). 폴더: app(8파일), data/atlas11(forecast.json·archive·view 58), docs, downloads(atlas11 2폴더 + rolling 2폴더), _headers, netlify.toml, README.txt, dist-manifest.json.
- 비밀키: `dist/app/*.js`·`index.html` 에서 FRED_API_KEY/NAVER_CLIENT_SECRET/KRX_API_KEY/'sk-'/'BEGIN PRIVATE KEY'/AKIA **0건**. dist 전체에서 걸린 2파일(evolution.json, docs/ATLAS11_README.md)은 "FRED_API_KEY 미설정" 같은 **변수 이름 언급**뿐, 값 없음. 저장소 전체(node_modules 제외)에서도 `KEY=값` 꼴 0건.
- `dist/data/atlas.json` 없음(91MB 원본 제외됨). 총 크기 8,935,538B(du -sb, 8.5MB) < 40MB. 파일 288개.
- `dist/data/atlas11/view/manifest.json.forecastId` == 최신 발행본. dist/data + dist/downloads 272개 파일이 public/ 원본과 byte 동일. `dist-manifest.json` 해시 287개 전부 일치(자기 자신만 제외).
- dist/app 8개 파일·index.html 은 `site/` 원본과 byte 동일.

## 13. 테스트·브라우저 (PASS)

- `reports/atlas11/tests.tap`: `1..16`, `# pass 16`, `# fail 0`, skipped 0, 37.7초. (예: 4 발행본 52코드·첫점 0, 6 미래 누수 차단, 8 불변 저장·CSV 21행, 13 운영 A 수치 동일, 15 재현성)
- `reports/atlas11/browser/latest.json`: at 2026-09-28T13:43:09Z, chromium headless, pc 1280×800·mobile 390×844(터치 에뮬레이션, 실기기 아님), **passed 53 / failed 0** (pc 26, mobile 27). 포함 검사: "pc/mobile CSV 다운로드 21행"(rows 22, ATLAS_329180_20260928.csv), "pc/mobile 1만원 비교 52선"(raceLines 52), "pc/mobile 중요 일정에서 정지·확인 대기"(9월 30일 중요 일정 1건) + "확인 뒤 계속 재생", 콘솔 오류 0, 실패 요청 0.
- 브라우저가 내려받은 CSV 2개(pc·mobile)의 sha256 = 서빙 원본 CSV 와 동일(ac7c2666…9a2).
- 스크린샷 `pc-02-detail.png` 확인: HD현대중공업 442,000 / 내일 443,445 / 5일 451,878 / 20일 474,904 · 발행본 27e1f65… — cards.json 값과 일치.

## 14. 보관 해시 (PASS)

- `public/data/atlas.json`(88,659,159자) 을 한 번 읽어 `sha256(JSON.stringify(original))` = **`1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca`** — 인계서 15절·`archive-fixed-20260917.json.expectedSHA256` 과 정확히 일치. original.id 2026-09-17-b001c94a, createdAt 2026-09-24T16:29:56Z, isRetrospectiveReconstruction true, paths 10,000.
- archive 파일의 `hashMatches` true, `originalJSONStringifySHA256` 동일. archive 52종목 rows(1,456행) 가 original.assets rows 와 p10/p50/p90 편차 0.

## 15. 정적 서빙 (PASS)

- `python3 -m http.server 8822 --directory dist` 기동 → `curl http://localhost:8822/index.html` **HTTP 200**(1,154B, text/html, sha256 dist 파일과 동일) · `/data/atlas11/view/manifest.json` **HTTP 200**(8,286B, forecastId 27e1f65…). 덤으로 app/*.js·forecast.json·cards·race·stocks/005930.json·CSV·favicon 모두 200.
- `pkill` 뒤 재접속 → connection refused(정지 확인).

---

## 발견 사항 — 문서와 산출물 사이의 불일치·의심 값

심각도 순. 15개 항목 판정에는 영향이 없지만 문서를 믿고 쓰면 오해할 수 있는 것들이다.

### F1. `docs/ATLAS11_REPORT.md` 가 없다
- 루트 `README.md` 3행: "최종 보고는 `docs/ATLAS11_REPORT.md`". `find` 결과 프로젝트 어디에도 없음(`docs/` 에는 ATLAS11_README.md 뿐). `package.mjs` 도 "있으면 복사" 라 dist/docs 에도 없다. 인계서 13절 최종 보고 양식(13항목)에 해당하는 문서가 산출물에 없다.

### F2. 배포 ZIP 두 개(Drop/Full)가 이 환경에 없다
- README §1·§2: "`npm run atlas11:package` → dist/ + Drop ZIP + 전체 ZIP · CRC 검사". `package.mjs` 는 `../out/ATLAS11_Drop_<id>.zip`·`ATLAS11_Full_<id>.zip` 을 만들도록 돼 있으나 `/home/claude/atlas/out` 폴더가 없고 파일시스템 전체에서 `ATLAS11_*.zip` 0건. ZIP 생성·CRC 로그도 없다. dist/ 만 존재한다(인계서 11절 "두 패키지 제공"·13절 13항 미충족 상태로 보인다).

### F3. `status.json.operation.forecastId` 가 옛 발행본을 가리킨다
- `status.json.forecastId` = 27e1f65…(최신) 인데 `status.json.operation.forecastId` = `2026-09-28-atlas11-90616c6bc916e8d6`(같은 날 앞 발행본). 마지막 매일 실행 기록(`reports/atlas11/operations/latest.json`, 13:28:40Z, exitCode 2, 수집기 미주입)이 최신 발행(13:29:56Z)보다 **먼저** 돌았기 때문. 즉 최신 발행본에 대한 run_daily 실행 기록은 없고, 화면「자료 상태 → 운영」은 옛 ID를 보여 준다.

### F4. "F35·F11 을 52종목에 숫자로 쓴다" 는 과장 — 32종목은 계수가 전부 0
- `status.json.factors`: F35 used 52 / F11 used 52 / missing 0. 그러나 `assets[].model.regression`: **32/52 종목이 intercept 0·beta 7개 전부 0**(selected `zero-garch11` 29 + `zero-constant` 3). 이 32종목의 조건부 평균은 0이며 실제로 움직이는 요인은 F36(분산)뿐이다. 20종목만 ridge 계수가 0이 아니다(`ridge1-garch11` 13, `ridge10-garch11` 4, `ridge10-constant` 3).
- README §6 "숫자로 쓰는 것은 F35·F11·F36 셋" 도 같은 과장. 날짜별 설명문은 "0.000%p(-)" 로 정직하게 보이므로 상세 화면은 문제없고, 자료 상태 화면·README 표현이 문제다.

### F5. "단일 제공자 이력" 표현 vs 실제 3개 출처 혼합
- input.json 가격 행 41,479개: NAVER(sourceUrl 없음) 40,441 · stock.mk.co.kr 974(9/7~9/28, 52종목) · alphasquare.co.kr 64. 날짜별로는 한 출처지만 시계열은 세 제공자 혼합이다. `anchor.quality` "single_source", status "MK·NAVER 시세 이력(단일 제공자)", README "단일 제공자 이력" 은 부정확한 표현. 또한 52개 앵커의 observedAt 이 전부 같은 시각(18:38:36 KST)으로, 수집기 실행이 아니라 한 번의 수동 일괄 대조(`priceBasisReview`)다(README 는 "수동 대조" 라고 적고 있어 그 자체는 모순 아님).

### F6. `scores.json` 에 forecastId 필드가 없음 (8번 주석)
- 위 8절. 성적판이 여러 발행본을 아우르는 설계라 의도적일 수 있으나, "모든 화면 같은 발행본" 검사가 이 파일만 다른 방식(livePublications·manifest sha256)으로 이뤄진다.

### F7. CSV 열 구성이 인계서와 다름 (문서화된 차이)
- 인계서 11절: "날짜·예측값·상단·하단". 실제: `날짜,구분,예측값,상단,하단` 5열(구분 = 실제출발/전망). manifest 가 columns·anchorRowIncluded 로 명시해 두었으므로 혼동 위험은 낮다.

### F8. 브라우저 검사 기록의 빈틈
- `browser/latest.json` 은 :8811 에 어느 폴더를 서빙했는지 기록하지 않는다(dist 인지 site+public 인지). 스크린샷의 발행본 ID(27e1f65…)로 최신 발행본을 본 것은 확인된다.
- 같은 폴더의 이전 실행 9회 중 3회는 report.json 없이 중단, 2회는 failed 1(47/1, 51/1)이었고 마지막 실행(13:42:51Z)만 53/0 이다. 최종 판정은 유효하지만 재시도 이력은 latest.json 에 요약돼 있지 않다.

### 의심 값(오류는 아니지만 알아야 할 것)

- **S1. D+1 방향이 52종목 중 44개 「하락」** (D+20 누적은 36 하락). 32개 무추세(zero) 종목은 표준화 때 과거 평균을 뺀 잔차를 쓰고 절편은 0 이라, 시뮬레이션 중앙값이 출발가 아래로 간다(예: 대한광통신 010170 p50 −0.79%, 하락 57.5% vs 상승 41.0%, 그러나 과거 504일 실제 하락일 비율 51.4%·평균 +0.575%/일). 옛 엔진도 동일하게 44개(수치 보존의 결과)이므로 재구축 결함은 아니지만, 카드의 "내일 ▼ 하락 57%" 는 내일 정보가 아니라 분포 비대칭의 표현이다. D+1 근소 차이(closeCall) 표시가 32/52 에 붙어 있다.
- **S2. 60일 보류 진단에서 운영 A 가 단순 기준을 못 이김**(`evolution.json.holdoutAverage`): 가격오차 0.031078 vs 기준 0.030955, 방향 적중 0.5083 vs 0.5106. CRPS(0.022666 vs 0.023129)·담김(0.729 vs 0.660)만 낫다. README 는 정확도를 주장하지 않으므로 모순은 아니나, 진화 화면에서 눈에 띄게 보여야 할 숫자다.
- **S3.** 달력 holidays 표는 6건(7/17 제헌절, 8/17, 9/24, 9/25, 10/5, 10/9)만 담고 있고 6/3(지방선거) 같은 앞선 휴장은 sessions 에서만 빠져 있다. 가격 행과 대조해 모순은 없었다(휴일에 가격 0건, 2026년 세션 180개 = 삼성전자 가격 180행).
- **S4.** A/B 는 `pointInTimeVerified: false`(DFII10 historyEnd 9/24, DEXKOUS 9/18, 7일 지연은 가정), `dataQualityGate.passed: false` — 수치 조건과 별개로 자료 품질 관문도 실패했다고 result.json 에 적혀 있다. B 기각 결론은 두 관문 모두에서 같다.

## 실행한 주요 명령(재현용)

- 구조·대조: `node -e` 로 forecast.json / input.json / rolling-calendar.json / rolling-forecast.json / view/*.json / stocks/*.json 파싱 후 위 표의 조건을 직접 셈.
- 해시: `sha256sum public/data/atlas11/forecast.json reports/atlas11/versions/*.json`, CSV manifest → `sha256sum -c`(52 OK), `wc -l *.csv`(1,144), dist-manifest 287개 sha 재계산, `implementationSHA256`·`inputHash`·`semanticSHA256`·`universeHash`·`sessionsSHA256` 재계산.
- A/B: result.json `days[]` 재평균, `paired.csv` 124,800행 재평균(awk NR=124,801).
- 91MB: `node --max-old-space-size=6144` 로 atlas.json 1회 읽고 `JSON.stringify(original)` sha256(0.9초).
- 비밀키: `grep -rIl -E "FRED_API_KEY|NAVER_CLIENT_SECRET|KRX_API_KEY|sk-[A-Za-z0-9]|BEGIN PRIVATE KEY|AKIA[0-9A-Z]{12,}" dist/` → 이름 언급 2파일, 값 0.
- 서빙: `python3 -m http.server 8822 --directory dist` → `curl -w "%{http_code}"` 200/200 → `pkill -f "http.server 8822"` → 재접속 거부 확인.
