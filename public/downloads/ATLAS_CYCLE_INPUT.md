# ATLAS 지수·업종 주기 원자료 연결

52종목과 2026-09-17~10-30 전망 기간을 유지합니다. 연구 자료는 2016-09-17~2026-09-16과 그 이전 준비 구간입니다. 공식 장기 지수·기업행위 조정 가격·당시 업종 대응·당시 기준 전망이 없으면 값을 만들어 채우지 않습니다.

## 파일 입력

‘계산 방식’ → ‘주기 원자료 JSON 추가’. 브라우저 파일은 6MB 이하로 나누어 입력합니다. 더 큰 입력은 원본 소스의 CLI에서 처리합니다.

~~~json
{"schema":"atlas-cycle-input-1","series":[],"mappings":[],"trainingRows":[]}
~~~

빈 배열은 형식 예시이며 실제 자료가 아닙니다. 입력 뒤 52종목을 다시 분석하되 기존 뉴스 전망을 덮어쓰지 않습니다. 재생 중에는 표시 전환을 기존 규칙대로 미룹니다.

공통 증거 필드: sourceUrl(공식 HTTPS 원문), observedAt(시간대 포함 ISO). 당시 자료임을 주장할 때는 vintageVerified=true, archiveUrl, availableAt도 필요합니다. 이는 입력자의 확인 기록이며 프로그램이 원문을 독립 인증했다는 뜻이 아닙니다. 소급 다운로드 관측 시각을 과거로 바꾸지 마십시오.

| 객체 | 필수 내용 |
|---|---|
| calendar | sessions: 공식 거래일 YYYY-MM-DD 배열, 공통 증거 필드. 임의 평일 달력 불가 |
| series | id, name, kind(market/sector/stock), market(KOSPI/KOSDAQ/KRX), currency=KRW, basis=PR, methodId, launchDate, 증거 필드, rows |
| series.rows | date, close(양의 유한 가격), 증거 필드. 종목마다 거래일 연속성 검사 |
| stock series | stockCode(기존 52개 코드 중 하나), adjustmentsVerified. 공식 조정 가격과 기존 전망 출발가 대조 |
| mappings | id, code, marketIndexId, sectorIndexId, mappingType(exact/broad_proxy), effectiveFrom, effectiveTo(null 또는 날짜), 당시 대응을 입증하는 공식 증거 |
| replacements | entity, key, expectedHash, reason. 기존 값 변경 시 현재 객체의 SHA256 및 변경 사유 필요 |

시리즈 종류·산식·가격 기준·상장/출시일·종목을 같은 ID 안에서 바꿀 수 없습니다. 새 정의는 새 ID와 적용 기간으로 입력합니다. 출시 전 역산 지수는 표시용 소급 자료이며 당시 정보 검증용으로 쓰지 않습니다. 같은 날짜에 충돌하는 업종 연결은 유보합니다. 누락 거래일을 건너뛰어 수익률을 이어 붙이지 않습니다.

공식 URL 허용 도메인은 KRX입니다. 기업 자료가 필요하더라도 회사 홈페이지 링크만으로 공식 지수 시계열을 승인하지 않습니다. 배당 포함 총수익 지수와 가격지수를 혼합하지 않습니다.

## 보관 전망에서 학습 행 도출

~~~sh
node scripts/research_cycles.mjs --import official-cycle-input.json
node scripts/research_cycles.mjs --archives archived-baselines.json
node scripts/audit_cycles.mjs
~~~

archives 파일은 records 배열이며 각 원소는 version, input, provenance를 가집니다. provenance에는 pointInTimeVerified=true와 archiveUrl이 필요합니다. version은 실제 당시 입력으로 생성·보관된 atlas-news-7.0.0 전망이고 informationCutoff가 그 출발일 이하여야 합니다. numericSummary.rows의 expectedLogPrice와 저장된 p50를 각각 사용합니다. 평균 로그 가격과 중앙값을 혼동하지 않습니다.

현재 보관 전망은 9/17 이후여서 9/16 이전 계수 학습용이 아닙니다. 오늘의 뉴스를 넣어 과거 전망을 만든 뒤 당시 원본이라고 표시할 수 없습니다. 누락된 과거 기준 전망은 별도 자료 확보·재현 연구 과제입니다.

외부 학습 행을 직접 입력하는 경우 code, date, targetDate, horizon(공식 거래일 간격), features(4개), originPrice, actualPrice, baseExpectedLogReturn, baselineMedianPrice, baselineOrigin, baselineId, baselineModelVersion, baselineDataHash, baselineLogMeaning=expected_log_return, baselineInformationCutoff, featureAsOf, mappingKey, pointInTimeVerified, adjustmentsVerified, calendarVerified, sourceUrls와 증거 필드, targetPublishedAt이 필요합니다. 당시 원문·발표 시각과 지수/산식 대응이 맞아야 적격입니다. 상세 검사는 lib/cycle-data.mjs와 lib/cycle-model.mjs에 있습니다.

## 인증된 공식 API 수집

KRX Open API 서비스 신청·인증키 및 공식 거래일, 승인받은 서비스의 실제 엔드포인트 설정이 필요합니다. 프로그램에 임의 엔드포인트를 넣어 성공한 것으로 처리하지 않습니다.

서버 환경변수 KRX_API_KEY는 비밀 값입니다. 공개 JSON, Git, 다운로드 ZIP에 넣지 마십시오. ATLAS_CYCLE_CONFIG_JSON은 서버 갱신용 서비스 설정입니다. 로컬 CLI는 --config 파일을 받습니다.

~~~json
{"services":[]}
~~~

각 서비스는 endpoint(승인된 KRX HTTPS /svc/apis/idx/ 하위 경로), start, series를 가집니다. series에는 위 시리즈 메타데이터와 responseName(공식 응답 IDX_NM과 정확히 일치)을 넣습니다. BAS_DD 날짜·CLSPRC_IDX 종가를 검증합니다. 여러 지수는 같은 서비스·같은 날짜 응답을 재사용합니다.

~~~sh
npm run collect:cycles -- --config approved-krx-services.json --max-requests 12
~~~

기본 12회·최대 250회 요청 예산, 누락 날짜부터 이어받기, 요청 제한시간 10초·최대 2회 시도, 401/403/429 회로 차단을 사용합니다. 키·설정·달력 미확보 또는 부분 실패는 종료 코드 2와 실패 기록을 남깁니다. 접속 제한을 우회하지 않습니다. 환경이 허용하는 정상 프록시 설정만 사용합니다.

Netlify 서버 함수 환경에 키와 서비스 설정을 넣으면 기존 갱신과 연결됩니다. 정적 화면만 배포한 경우 JSON 입력·로컬 분석은 가능하지만 비밀 키를 사용하는 자동 수집은 서버 실행 환경이 필요합니다.

## 공식 참고 자료

- [KRX Open API 서비스 목록](https://openapi.krx.co.kr/contents/OPP/INFO/service/OPPINFO004.cmd)
- [KRX Open API 이용 절차](https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO003.jsp)
- [KRX 지수 구성종목·기업행위 안내](https://www.krx.co.kr/contents/GLB/05/0508/0508040100/GLB0508040100.jsp)

2026-09-26 원문 확인. 목록에 장기 자료 제공 안내가 있어도 모든 지수·52종목의 10년 당시 원본 확보가 완료됐다는 뜻은 아닙니다.
