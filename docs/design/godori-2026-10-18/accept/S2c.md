# S2c 받아들일 잣대(칩 · 카드 · 첫 화면 요약 파일) — 2026-10-18 00:52 싱가포르 · 결과 채움 S2x(11:10 싱가포르)

`[명령] | 됐다고 아는 것(잴 수 있게) | 어떻게 재나 | 결과`

| 명령 | 잣대 | 검사 | 결과 |
|---|---|---|---|
| [6] 5 | 급등 칩(#/f/surge) 글에 「1등」 0번 · 급등 칩 안 보내기 단추 0개 · 첫 화면(#/) 급등 카드 0장(첫 화면 그리기는 S2 몫 — 끝에 잼) | next_check 칩 칸 `chips` · quick | 통과 — 「1등」 0 · 보내기 0 · 첫 화면 급등 카드 3 → 0 · 대장주 칩 「회사 크기 1등」도 「업종에서 가장 큰 회사」로 바꿈 |
| [6] 6 | 급등 칩 큰 카드 숫자 옆 + 목록 머리에 「N곳 중 n곳이 지난 1년 안에 반값 아래로 떨어진 적 있어요」 · N = 실제 목록 수 · n = 요약 파일 `chips.surge.half` = 회사 파일 종가 마지막 250거래일 안 최대 낙폭 50% 이상 수(따로 셈과 같음) · 칩이 회사 파일을 0개 받음 | next_check 칩 칸(글 n = 요약 값 · /atlas/data/co/ 요청 0) · home_summary.mjs `--verify`(두 번째 셈) | 통과 — 「36곳 중 31곳이 …」(N 36 = 큰 카드 1 + 줄 35 · n 31 = half · 값 모자람 1곳은 「? 1곳은 1년 값이 모자라 못 셌어요」) · 따로 셈 다름 0 · 회사 파일 요청 0 |
| [6] 7 | 칩 줄 · 선반 오른쪽 끝 흐림(mask) 있음 · 칩에 「달력」(#/cal) · 「조건 찾기」(#/cond) | next_check 칩 칸(계산된 mask-image ≠ none · 고리 둘) | 통과 — mask linear-gradient · 끝까지 밀면 걷음(app.js fadeEnd) · 칩 10개 중 달력 #/cal · 조건 찾기 #/cond |
| [7] 5 | 칩 쪽마다 큰 카드 1장 + 한 줄 목록(이름 · % · 작은 선) 10줄까지 + 「나머지 n곳 보기」(누르면 펼침) · 대장주 28 → 3 화면 이하 · 급등 12 → 3 화면 이하(360×640 · 높이 ÷ 640) | next_check 칩 칸 · 앞뒤 재기 | 통과 — 칩 7쪽 모두 큰 카드 1 · 보이는 줄 ≤ 10 · 줄 높이 73px 한 가지(긴 이름은 한 줄 …) · 360×640 전 → 뒤: 대장주 22,701 → 1,465px(35.5 → 2.3화면) · 급등 10,128 → 1,605(15.8 → 2.5) · 업종 21,478 → 1,414 · 고른 곳 15,759 → 1,387 · 큰 업종 3,236 → 1,262 · 오르는 업종 2,432 → 1,142 · 미국 1,719 → 923 |
| [9] 7 | `site/next/data/home-summary.json` 8KB 아래 · 첫 화면이 mkt.json · cond.json 을 받지 않음(요약이 새것일 때) · 대장주 · 고른 곳 칩을 열 때만 mkt/cond 받음 · 요약 없음 · 옛것(src.home ≠ home.json kst)이면 옛 길(빈 첫 화면 없음) · 올릴 때 package.mjs 가 build_data.mjs 를 부름 | next_check 칩 칸(요청 목록 · 요약 지우고 열기 · 옛 요약 흉내) · `node scripts/atlas11/next/build_data.mjs --site site` | 통과(한 줄 남음) — 요약 2,621바이트 · 첫 화면 받는 자료 home.json 7KB + 요약 + gdr.json · 「더 보기」를 열어도 0개 더 받음(요약으로 그림 · 옛것이면 core 하나) · 요약 404 흉내 → 띠 + 세 줄 그대로 · `build_data.mjs` 있음(1.3초) — **package.mjs 한 줄은 main 몫으로 넘김** |

## 요약 파일 꼴(S2 가 씀) — `/next/data/home-summary.json`
머리 주석 `scripts/atlas11/next/build/home_summary.mjs` 와 같음. 값이 없으면 그 칸 null. (S2x 11:00 더함: `rise.list` 넷 · `time` · `groups.*.cwChg` — 「더 보기」가 core 를 안 받게)

```
{ schema: 'godori-home-summary-1', made: ISO(UTC),
  src: {home: home.json kst, mkt: mkt.asOf, core: core.made, surge: surge.kst, cond: cond.asOf},   // 새것 맞대기: 화면은 src.home 과 /atlas/data/home.json 의 kst 를 견줌 — 다르면 옛 길
  asOf: 'YYYY-MM-DD',                       // 마지막 종가 날(mkt.asOf)
  band: {live, kst, stale,                  // [6] 1 한 줄 띠 — stale = 지수를 못 받아 앞 값을 쓴 때(home.stale.idx) 또는 null
         KOSPI: {name, date, day, close}, KOSDAQ: {name, date, day, close}},   // day = 하루 %(소수 둘째) · 못 받으면 null
  alert: [{name, v, why: 'big'|'usual'}],   // 큰 날 「!」 = home.alerts 의 kind 'idx' 그대로(idxAlerts 와 같은 뜻)
  day: {date, n, up, dn, fl, eq, cw,        // 모든 회사 마지막 날 하루 — eq = 평균 % · cw = 큰 회사 기준 %(회사 크기 무게)
        big: {n, up, dn, fl, eq}, small: {n, up, dn, fl, eq}},   // big = 회사 크기 위 100곳 · small = 나머지
  rise: {from, to, n, top: {name, chg, v}, list: [그 꼴 넷까지]},  // 1주 오른 업종(core.rise)
  groups: {n, base, top: {id, name, short, chg, cwChg, n, v}, low: {…}},     // 큰 업종 한 달(core.groups · 평균)
  time: {id, open},                                                // 봉인 줄(3년 뒤 엶 날)
  pick: {date, n, up, dn},                                         // 고른 곳 하루(home.s365)
  us: {date, top: {name, chg}},
  lines: ['…', '…', '…'],                   // 오늘 시장 세 줄 요약 글(한국어 · 영어 틀 등록됨)
  chips: {rise: {n}, surge: {n, asOf, half, known, days: 250, flags: {번호: 0|1}, miss: [...]},
          lead: {n}, pick: {n}, group: {n}, ind: {n}, us: {n}} }
```
