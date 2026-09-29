# ATLAS 11 매일 자동 실행 — 설치 안내 (프로그래머가 아니어도 되는 설명)

## 0. 먼저 알아 둘 것

**지금 이 저장소 안의 파일만으로는 아무것도 저절로 돌지 않습니다.**
아래 세 가지 방법 중 **하나를 골라 설치해야** 그때부터 매 거래일 오후 4시(한국 시간)에 자동으로 돕니다.

하루에 한 번 도는 일은 이것입니다.
1. 네이버에서 52개 종목의 그날 일봉(시가·고가·저가·종가·거래량)을 받습니다. 오후 3시 30분 정규장 마감 뒤에 **두 번 받아서 종가와 거래량이 같을 때만** "확정"으로 칩니다.
2. 확정된 값을 검사해서 `public/data/input.json` 에 넣고, 이전 예측을 채점합니다.
3. 52개가 전부 확정됐을 때만 새 예측을 발행하고 화면 묶음을 만듭니다. 하나라도 안 됐으면 이전 발행본을 그대로 두고 "부분 실패"로 기록합니다.
4. 52개가 안 됐으면 **10분마다 다시 시도**하고, 오후 6시가 지나면 그날은 포기합니다(기록에 `given_up_for_day` 로 남습니다).

주말과 공휴일(`public/data/rolling-calendar.json` 의 휴일 목록)에는 돌지 않거나 "거래일 아님"으로 바로 끝납니다.

## 1. 세 가지 방법 중 하나 고르기

| 방법 | 서버가 필요한가 | 어울리는 경우 |
|---|---|---|
| **A. GitHub Actions** | 아니요 (GitHub 가 대신 돌림) | 저장소가 GitHub 에 있고 서버를 관리하고 싶지 않을 때 |
| **B. 서버 systemd** | 예 (리눅스 서버) | 이미 서버가 있을 때 · 가장 단순 |
| **C. Docker** | 예 (Docker 가 깔린 서버나 PC) | 서버에 Node 를 직접 깔고 싶지 않을 때 |

**둘 이상을 동시에 켜지 마십시오.** 같은 날 두 번 돌면 뒤에 도는 쪽이 "이미 실행 중"으로 막히거나 기록이 둘로 갈립니다.

---

### A. GitHub Actions (서버 없이)

1. 이 저장소를 GitHub 에 올립니다. 파일 `.github/workflows/atlas11-daily.yml` 이 **기본 가지(main)** 에 있어야 합니다.
2. GitHub 저장소 화면 → **Settings → Actions → General** 에서
   - "Allow all actions" 가 켜져 있는지,
   - 아래쪽 **Workflow permissions** 가 **Read and write permissions** 인지 확인합니다. (기록을 저장소에 되돌려 커밋하려면 쓰기 권한이 필요합니다.)
3. 끝입니다. 평일 오후 4시(한국 시간)마다 저절로 돕니다. 지금 당장 한 번 돌려 보려면 **Actions 탭 → atlas11-daily → Run workflow** 를 누릅니다.

기록은 어디에 남나: 매번 돌고 나서 `reports/`, `public/data/`, `public/downloads/` 아래 바뀐 파일을 **`atlas11-bot` 이름으로 커밋·푸시**합니다. 저장소의 커밋 기록을 보면 날짜별로 남습니다. 또 Actions 실행 화면의 **Artifacts** 에 그날 `ATLAS11_Drop_….zip` (Netlify Drop 에 올리면 화면이 열리는 묶음)이 30일 동안 남습니다.

Netlify 자동 배포까지 하려면(선택):
1. Netlify 화면 → **User settings → Applications → Personal access tokens → New access token** 으로 토큰을 만듭니다.
2. Netlify 사이트 화면 → **Site configuration → General → Site details** 의 **Site ID** 를 복사합니다.
3. GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret** 에서 두 개를 넣습니다.
   - 이름 `NETLIFY_AUTH_TOKEN` · 값 = 1번 토큰
   - 이름 `NETLIFY_SITE_ID` · 값 = 2번 Site ID
4. 비밀이 있으면 마지막 단계에서 `dist/` 를 Netlify 에 올립니다. **비밀이 없으면 그 단계는 조용히 건너뛰고** 나머지는 그대로 돕니다.

실행 기록 보는 법: **Actions 탭 → atlas11-daily** 에서 날짜별 실행을 누르면 "Daily run" 단계에 `attempt=1 exit=0 status=complete confirmedTodayStocks=52` 같은 줄이 있습니다. `confirmedTodayStocks` 가 52 면 그날 발행이 됐다는 뜻이고, 52 보다 작으면 10분씩 최대 6번 더 시도한 흔적이 같이 보입니다.

주의: GitHub 예약 실행은 정해진 시각보다 **몇 분에서 수십 분 늦게** 시작할 수 있습니다. 오후 3시 30분 마감 뒤이기만 하면 결과는 같습니다.

---

### B. 리눅스 서버 + systemd

준비물: Node 22 이상이 `/usr/bin/node` 에 있고, 저장소를 `/opt/atlas11` 에 두었다고 가정합니다. (다른 곳이면 서비스 파일 안의 경로를 바꿉니다.)

```bash
sudo useradd -r -d /opt/atlas11 atlas11 2>/dev/null || true     # 전용 계정(이미 있으면 그냥 넘어감)
sudo chown -R atlas11:atlas11 /opt/atlas11
cd /opt/atlas11 && sudo -u atlas11 npm ci --omit=dev
sudo cp deploy/atlas11.env.example /etc/atlas11.env             # 값은 비워 두어도 됨
sudo cp deploy/systemd/atlas11-scheduler.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now atlas11-scheduler
```

이제 데몬(늘 떠 있는 프로그램)이 다음 거래일 오후 4시까지 자다가 깨어나 돕니다.

- 상태 보기: `systemctl status atlas11-scheduler`
- 로그 보기: `tail -f /var/log/atlas11/scheduler.log`
- 다음 실행 시각·마지막 결과: `cat /opt/atlas11/reports/atlas11/operations/scheduler-heartbeat.json` (60초마다 갱신 · `nextRunAt` 이 다음 실행, `lastRun` 이 마지막 결과)
- 날짜별 실행 한 줄씩: `tail /opt/atlas11/reports/atlas11/operations/scheduler-runs.jsonl`
- 멈추기: `sudo systemctl stop atlas11-scheduler` (실행 중인 하루치가 있으면 끝나기를 기다렸다가 멈춥니다)

데몬 대신 **타이머**(정해진 시각에만 깨우는 방식)를 쓰고 싶으면 위의 `atlas11-scheduler.service` 대신 이렇게 합니다. 둘 중 하나만 켭니다.
```bash
sudo cp deploy/systemd/atlas11-daily.service deploy/systemd/atlas11-daily.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now atlas11-daily.timer
systemctl list-timers atlas11-daily.timer     # 다음 실행 시각 확인
```
systemd 가 없는 서버면 `deploy/crontab.example` 을 `crontab -e` 로 붙여 넣습니다.

기록은 어디에 남나: 전부 `/opt/atlas11` 안입니다 — `reports/atlas11/operations/` (실행마다 JSON 한 개 + `latest.json`), `public/data/input.json` (확정 종가), `public/data/atlas11/` (발행본·화면 묶음), `reports/rolling/scores/` (채점). 서버를 백업할 때 `/opt/atlas11/reports` 와 `/opt/atlas11/public/data` 만 챙기면 됩니다.

---

### C. Docker

준비물: Docker 와 docker compose 가 깔린 컴퓨터. 저장소 폴더 안에서:

```bash
cp deploy/atlas11.env.example deploy/atlas11.env          # 값은 비워 두어도 됨
docker compose -f deploy/docker-compose.yml up -d --build
```

- 로그 보기: `docker compose -f deploy/docker-compose.yml logs -f`
- 다음 실행·마지막 결과: `cat reports/atlas11/operations/scheduler-heartbeat.json`
- 멈추기: `docker compose -f deploy/docker-compose.yml down`

기록은 어디에 남나: `docker-compose.yml` 이 저장소의 `reports/`, `public/data/`, `public/downloads/` 폴더를 컨테이너 안에 그대로 붙이므로 **컨테이너를 지워도 기록은 이 폴더에 남습니다.** "permission denied" 가 나오면 `sudo chown -R 1000:1000 reports public/data public/downloads` 를 한 번 해 줍니다.

---

## 2. 잘 돌고 있는지 확인하는 세 가지

1. `reports/atlas11/operations/latest.json` — 마지막 하루치 결과. `"status": "complete"` 와 `"confirmedTodayStocks": 52` 면 정상. `"partial"` 이면 `collection.errors` 에 어느 종목이 왜 안 됐는지 적혀 있습니다.
2. `reports/atlas11/operations/scheduler-runs.jsonl` — 시도마다 한 줄(시각·몇 번째 시도·결과). `given_up_for_day` 가 보이면 그날은 52개를 못 채운 것입니다.
3. 화면(`dist/` 또는 Netlify)의 「자료 상태」 칸 날짜가 오늘인지.

## 3. 자주 묻는 것

- **오후 4시가 지났는데 안 돌았어요.** 데몬(B·C)은 켜져 있으면 오후 4시~6시 사이에 뒤늦게 켜져도 그날 기록이 없으면 바로 따라잡습니다. GitHub(A)는 Actions 탭에서 Run workflow 를 누르면 됩니다.
- **하루에 한 번 지금 바로 돌리고 싶어요.** 서버에서 `node scripts/atlas11/scheduler.mjs --once` (재시도 없이 한 번) 또는 `node scripts/atlas11/scheduler.mjs --today` (10분 간격 재시도 포함).
- **다음 실행이 언제인지만 보고 싶어요.** `node scripts/atlas11/scheduler.mjs --dry-run` — 다음 다섯 번의 시각만 찍고 끝납니다.
- **네트워크 없이 시험해 보고 싶어요.** `ATLAS_COLLECTOR_FIXTURE=tests/atlas11/fixtures/collector` 를 붙이면 합성 자료(실제 시세 아님)로 형식만 돌려 봅니다. 진짜 기록에 섞이지 않도록 시험은 복사본 폴더에서 하십시오.

## 4. 이 안내를 만든 환경에서 확인하지 못한 것 (솔직한 기록)

- 이 파일들을 만든 작업 환경은 시세 서버(`fchart.stock.naver.com`, `api.stock.naver.com`)에 접속이 막혀 있었습니다. 그래서 **실제 네이버 응답을 한 번도 받아 보지 못했고**, 수집기는 응답 형식을 흉내 낸 합성 자료와 주입한 가짜 fetch 로만 검사했습니다. 처음 설치한 날에는 `reports/atlas11/operations/latest.json` 의 `collection` 칸을 꼭 열어 보십시오. 형식이 다르면 `collection.errors` 에 `PARSE_FAILED` 가 나옵니다.
- systemd·Docker·GitHub Actions 파일은 문법 검사와 흉내 실행(가짜 하루치 명령)으로만 확인했습니다. 실제 서버·GitHub 에서 켜 본 것은 아닙니다.
