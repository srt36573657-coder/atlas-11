# 자료 칸 (atlas4h/data) — 첫 실행 4번

- `contract.md` — 자료 약속 36줄 (숫자마다 시각·출처 둘, 옛값, 확인 중, 없음, 극한 K1·K2·K4·K6)
- `variables.json` — 변수 15개 · 상수 6개 · 빈자리 10개 (시험 코드가 읽는 꼴 `atlas4h-variables-1`)

## 변수 한눈 표

상태: **쓸 수 있음** = 두 출처 모두 깃허브 러너에서 받아지고 해석기가 있음 · **확인 필요** = 한쪽이 열쇠·주소·약관 확인 전 · **없음** = 지금 받을 길이 없음.
※ = 네이버 약관 확인이 남음(사장님 몫 · `variables.json` gaps `terms-naver`).

| 변수 | 첫째 출처 | 둘째 출처 | 시각 (한국) | 상태 |
|---|---|---|---|---|
| 코스피 지수 | 네이버 지수 일별 | KRX Open API (열쇠) | 장중 09:00~15:30 · 둘째는 다음 날 08:00 | 확인 필요※ |
| 미국 반도체지수 | 네이버 해외지수 | — 없음 | 미국 마감 05:00 (11/2부터 06:00) 뒤 | 확인 필요※ |
| S&P500 | 네이버 해외지수 | FRED SP500 | 05:00 뒤 · FRED는 다음 날 늦게 | 쓸 수 있음※ |
| 코스피200 선물 | KRX Open API (열쇠) | KIS 증권 API (계좌·열쇠) | 주간 08:45~15:45 · 야간 18:00~06:00 | 없음 |
| 미국 지수 선물 | KIS 증권 API (계좌·열쇠) | — 없음 | 거의 하루 내내 (06:00~07:00 쉼) | 없음 |
| VIX | 네이버 해외지수 (15분 늦음) | FRED VIXCLS | 05:15 뒤 · FRED는 1~2일 늦음 | 쓸 수 있음※ |
| 원달러 | 네이버 환율 (하나은행 고시) | 한국은행 ECOS (열쇠) | 고시 때마다 · 둘째는 하루 한 번 | 확인 필요※ |
| VKOSPI | KRX Open API (열쇠) | — 없음 | 다음 날 08:00 (장중 값 없음) | 없음 |
| 유가 WTI | 네이버 에너지 (근월물) | FRED DCOILWTICO (현물) | 미국 마감 뒤 · FRED는 일주일 가까이 늦음 | 쓸 수 있음※ |
| 유가 브렌트 | FRED DCOILBRENTEU | — 없음 | 일주일 가까이 늦을 것으로 봄 | 확인 필요 |
| 미국 발표 일정 | BLS · 연준 공식 일정 | FRED 발표 달력 (열쇠) | 대개 21:30 (11/2부터 22:30) | 확인 필요 |
| 한국 발표 일정 | 한국은행 (쪽 주소 확인 전) | — 없음 | 기관마다 다름 | 확인 필요 |
| 실적·공시 (52종목) | 네이버 종목 공시 | OpenDART (열쇠) | 공시 뜬 뒤 곧 | 확인 필요※ |
| 종목 값 (52종목) | 네이버 분봉 (15:30 봉 = 종가) | KRX Open API (열쇠) | 장중 · 종가 15:30 · 둘째 다음 날 08:00 | 확인 필요※ |
| 거래대금 (52종목) | 네이버 실시간 | KRX Open API (열쇠) | 70초마다 · 둘째 다음 날 08:00 | 확인 필요※ |

세어 보면: 변수 15 · 출처 둘 10 · 출처 하나 5 · 지금 「쓸 수 있음」 3 (S&P500 · VIX · WTI — 셋 다 둘째가 늦게 나와 4시간 고리에서는 대개 「한 출처」).

## 옛 엔진 해석기가 읽는 주소 (읽기만 · 고치지 않음)

| 해석기 | 읽는 주소 |
|---|---|
| `lib/atlas11/context.mjs:parseIndexPrices` | `https://m.stock.naver.com/api/index/{KOSPI\|KOSDAQ}/price?pageSize=10&page=1` |
| `lib/atlas11/context.mjs:parseFlows` | `https://m.stock.naver.com/api/stock/{code}/trend?pageSize=10&page=1` |
| `lib/atlas11/context.mjs:parseNews` | `https://m.stock.naver.com/api/news/stock/{code}?pageSize=20&page=1` |
| `lib/atlas11/context.mjs:parseDisclosures` | `https://m.stock.naver.com/api/stock/{code}/disclosure?pageSize=20&page=1` |
| `lib/atlas11/context.mjs:parseFredCSV` | `https://fred.stlouisfed.org/graph/fredgraph.csv?id={DEXKOUS\|SP500\|NASDAQCOM\|VIXCLS\|DFII10\|BAA10Y\|DFF\|DGS2\|DCOILWTICO\|WALCL}&cosd={시작일}` (머리글 `User-Agent: curl/8.5.0`) |
| `lib/atlas11/context.mjs:parseNaverSeries` | `https://api.stock.naver.com/index/{.SOX\|.VIX}/price?page=1&pageSize=10` · `https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?page=1&pageSize=10` · `https://api.stock.naver.com/marketindex/bond/{KR3YT=RR\|KR10YT=RR}/prices?page=1&pageSize=10` · `https://api.stock.naver.com/marketindex/energy/CLcv1/prices?page=1&pageSize=10` (.VIX·CLcv1 은 FRED 가 실패할 때만) |
| `scripts/atlas11/collect_krx_close.mjs:closingAuctionBar` | `https://api.stock.naver.com/chart/domestic/item/{code}/minute?startDateTime={YYYYMMDD}1525&endDateTime={YYYYMMDD}1545` (15:30:00 봉만) |
| `scripts/atlas11/collect_naver.mjs:parseFchartXml` | `https://fchart.stock.naver.com/sise.nhn?symbol={code\|KOSPI}&timeframe=day&count={n}&requestType=0` |
| `scripts/atlas11/collect_naver.mjs:parseNaverDayJson` | `https://api.stock.naver.com/chart/domestic/item/{code}/day?startDateTime={YYYYMMDD}0000&endDateTime={YYYYMMDD}0000` |

`.github/workflows/atlas11-daily.yml` 은 평일 16:00 KST 에 `collect_context.mjs` 를 돌린 뒤 `run_daily.mjs --collector scripts/atlas11/collect_krx_close.mjs` 를 돌린다(`collect_naver.mjs` 는 이 흐름에서 안 씀). 하루 한 번이라 4시간 모으기는 새 예약이 따로 필요하다.

## 확인한 곳 (`checkedFrom`)

- `code` = 옛 엔진 코드·실제 수집 기록(`reports/atlas11/context/2026-09-30/`)·러너 탐침 기록(`reports/atlas11/probe/`)에서 확인.
- `session` = 2026-10-01 이 작업 중 웹으로 그 기관 쪽을 직접 열어 확인 (러너에서 한 것이 아님).
- `none` = 아직 아무도 확인 안 함.
- 이 작업 환경의 셸은 시장 사이트에 못 나가서, 러너에서 되는지(`reachableFrom`)는 옛 탐침 기록으로만 적었다.

## 쉽게 말하면

- 숫자 열다섯 가지를 4시간마다 두 곳에서 받아 서로 맞춰 보기로 했습니다.
- 지금 바로 두 곳 다 받아지는 것은 셋(S&P500 · VIX · WTI)이고, 나머지는 열쇠·주소·약관 확인이 남았습니다.
- 받을 곳이 없는 숫자는 지어내지 않고 「없음」으로 둡니다.
