# 수집기 재생용 fixture — 합성(SYNTHETIC) 형식 예시 · 실제 시세 아님

이 폴더의 모든 파일은 **형식만 실제 응답을 흉내 낸 합성 자료**입니다.
값은 종목코드를 씨앗으로 한 의사난수 걸음(pseudo-random walk)으로 만들었고, 어떤 날짜의 실제 주가·거래량과도 관계가 없습니다.
검증·발행 자료(`public/data/`)에 절대 넣지 마십시오.

| 파일 | 흉내 낸 원천 | 형식 |
|---|---|---|
| `<종목코드>.xml` (52개) · `KOSPI.xml` | `https://fchart.stock.naver.com/sise.nhn?symbol=<code>&timeframe=day&count=30&requestType=0` | `<chartdata symbol timeframe="day"> <item data="YYYYMMDD\|시가\|고가\|저가\|종가\|거래량" /> …` |
| `005930.json` · `000720.json` · `373220.json` | `https://api.stock.naver.com/chart/domestic/item/<code>/day?startDateTime=…&endDateTime=…` | `[{"localDate":"YYYYMMDD","openPrice":"…","highPrice":"…","lowPrice":"…","closePrice":"…","accumulatedTradingVolume":"…"}, …]` (값은 문자열) |

- 날짜는 `public/data/rolling-calendar.json` 의 거래일 중 **2026-08-14 ~ 2026-09-29 (30 거래일)** 입니다. 테스트는 시계를 2026-09-29 로 고정해 씁니다.
- XML 맨 위 주석과 JSON 의 `synthetic` 필드가 합성 자료임을 표시합니다. 수집기는 이 표시를 무시하고 형식만 읽습니다.
- 실제 응답 형식(EUC-KR 인코딩, `name` 속성의 한글 종목명, 문자열 숫자 등)은 이 사무실 환경에서 직접 받아 확인하지 못했습니다. 형식이 다르면 `scripts/atlas11/collect_naver.mjs` 의 `parseFchartXml` / `parseNaverDayJson` 과 이 fixture 를 함께 고치십시오.

재생 방법: `node scripts/atlas11/collect_naver.mjs --now 2026-09-29T07:05:00Z --fixture tests/atlas11/fixtures/collector --finality-delay-ms 0`
(또는 환경변수 `ATLAS_COLLECTOR_FIXTURE=<이 폴더>`) — 네트워크에 닿지 않고 이 파일들을 응답으로 씁니다.

실제 `public/data/input.json` 을 상대로 재생하면 **exit 2 와 `REVIEWED_ROW_MISMATCH` 오류가 나오는 것이 정상**입니다 — 저장된 검토 종가(`priceBasis: KRX_REGULAR`, 8월 말~9월 28일)와 합성 값이 다르기 때문이며, 수집기는 그런 날짜 행을 넘기지 않고 오늘(2026-09-29) 행만 확정합니다. 진짜 시세와 대조하는 것이 아니므로 이 오류로 무엇을 고치지 마십시오.
