# ATLAS 11 「내일 하루만」 · 일꾼끼리 지킬 약속 (2026-10-02 00:2x KST)

사장님 명령(2026-10-02 00:08 KST) 원문은 `config/atlas11/horizon.json` 의 `order.text` 에 그대로 있다. 스위치는 그 파일의 `futureDays`(지금 1). 20 으로 되돌리면 옛 동작이 다시 켜져야 한다(코드를 지우지 않는다).

## 1. 발행본 꼴 (futureDays = 1 일 때)
- `horizon: 1` · `futureDates: [기준일 다음 거래일]` · `assets[].rows = [출발행, 내일 행]` (행의 칸은 지금과 같다)
- 내일 행의 숫자(p05~p95·mean·방향 확률 등)는 **20거래일 계산의 첫날 숫자와 한 자리도 같다** — 모의 경로 난수를 경로마다 20개씩 쓰던 순서를 그대로 지킨다(내일 한 걸음만 계산하고 나머지 19개 난수는 건너뜀).
- `assets[].scenario: null` (여러 날 경로라 꺼 둠) · `assets[].errors: {"1": null}`
- `summary.futurePointsPerStock: 1` · `summary.closeCallStocksDay20: null`
- `policy`: `{...옛 정책, id: 'atlas11-tomorrow-A-1', horizon: 1}` · `modelVersion` 은 그대로 `atlas11-A-1`(같은 모형)
- 맨 위에 `tomorrowOnly: {futureDays: 1, since: '2026-10-02', config: 'config/atlas11/horizon.json', configSHA256}`
- CSV: 2행(출발 + 내일) · manifest `rowsPerFile: 2`, `futurePoints: 1`
- `validateForecast11` 는 **옛 20거래일 발행본도 그대로 통과**해야 한다(지난 기록을 읽을 때).

## 2. 채점·진화 (매일 실행)
- 새 채점 기록은 horizon 1 만. 옛 발행본의 2~20거래일 목표는 더 채점하지 않는다(꺼 둠). 이미 있는 채점 기록은 그대로.
- 진화 후보의 지난날 20거래일 시험(백테스트)은 끈다(돌리지 않음). 그 사실을 실행 기록에 남긴다.

## 3. 화면 묶음(public/data/atlas11/view)·화면·그래프
- 화면과 그래프에는 「내일」(= manifest.futureDates[0]) 하나의 전망만 나온다. 지난 실제 값·지난 1거래일 채점은 그대로 보여도 된다.
- 옛 20거래일 발행본이 아직 최신이어도(배포가 다음 발행 전일 때) 화면 묶음은 그 발행본의 **첫날만** 쓴다.
- 꺼 둔 것(20일 길·5일/20일 숫자·1만원 경주·대표 시나리오·5/10/20일 채점 표·9/17 고정판 대조·진화 20일 시험 표·여러 날 CSV 링크)은 화면에 나오지 않는다. 대신 한 줄로 「꺼 둠(2026-10-02 사장님 명령)」을 보인다.
