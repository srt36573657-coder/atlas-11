# 넘겨주기 쪽지 (다음 고리가 이것만 보고 시작한다)

- 고친 때: 2026-10-01 22:11 KST(3단계 고리 코드 합친 뒤) · 쓴 이: 본 세션(기획안 1·2단계 만들기)
- 명령문: `atlas4h/command/original.txt` (sha256 `ffe9b40d…0b58c`) · 칸 파일 14개 · 필요한 칸만 다시 읽는다
- 기획안: `atlas4h/plan/build-plan.md` (일곱 단계 · 사장님 손 순서)

## 지금 상태 한눈에
1. 1단계(시험 고치기·자료 모으기)와 2단계(엔진 0판·재현) 코드는 main 에 있다. 통과 표시는 여전히 0/30(표시는 평가 일꾼 몫).
2. 08시 재현(`retro/result.json`, 잠긴 T12 가 읽는 곳): 무판보다 「실력」 5.88% · ATLAS 11(후향)과는 원 단위 0.12% 「아직 모름」(DM p 0.450·0.466), 출발값 % 곁 확인으로는 −0.58% 「앞 판으로」(ATLAS 11 이 조금 나음) · 단순 전이식·코스피는 지난 자료가 없어 「없음」 → **T12 안 통과 → 화면에 내지 않는다(명령 8).**
3. 16시 재현은 `retro/result-16.json` (무판 견줌만 · 16시엔 기준 둘이 없음 — conflicts.md 16).
4. 시도 장부 `seal/trials.jsonl`: trial-0001·0002 는 「늦게 적음」이라 고르는 데 쓰지 않는다. 다음 시도부터는 시도 줄을 먼저 커밋하고 돌린다.
5. 시험: `node --test 'atlas4h/tests/*.test.mjs'` 230 · collect 20 · engine 24 · score 8 · baselines 13(+1 건너뜀) · loop 10. `harness/start.sh` 가 모두 돌린다.
6. 3단계 고리 코드(`atlas4h/loop/` · `.github/workflows/atlas4h-loop.yml`)는 들어왔지만 **꺼 둔 상태**다(예약 줄 없음 · 단추로만). 예약 줄은 감시를 거친 뒤 사장님께 드린다(`loop/cron-lines.md`).

## 다음 고리가 할 한 가지
- **지난 자료가 들어왔는지 본다** (`atlas4h/data/history/*.json` · `atlas4h/ledger/collect/*.jsonl`). 들어왔으면:
  1. `perVariable.<id>.from` 이 2023-09-24 무렵인지, `errors` 가 비었는지 본다.
  2. `node atlas4h/retro/run.mjs --slot 08` (→ `retro/result.json`·`summary.md`) — 단순 전이식·코스피가 채워진다.
  3. `seal/trials.jsonl` 에 trial-0002 마지막 결과 줄을 덧붙이고 커밋한다.
- 안 들어왔으면: 3단계 고리 코드를 다른 에이전트로 감시하고, 무거운 바퀴의 지난 자료 새로 받기를 정한다. 예약 줄은 그 뒤에 사장님께 드린다.

## 막힌 것 (`progress.json` blocked)
- 「지난 자료 받기」 단추(사장님) · 변경 요청서 atlas4h-02(사장님 승인) · 두 번째 출처 열쇠 · 네이버 약관 · 선물·VKOSPI 출처 · 4시간 예약 줄(사장님 계정) · KRX 상업 조항 · 6단계 화면 자리(T11) · 10/30 뒤 ATLAS 11 기준

## 지킬 것 (짧게)
- 시험은 고치지 않는다(잠금 H4 — 승인된 변경 요청 + 「atlas4h LOCK:」 커밋만) · 통과 표시는 평가 일꾼만(H3) · 장부·봉인 폴더는 덧붙이기만 · 옛 엔진 변경 0(T11)
- 운영 단추(atlas11-site·atlas11-daily·atlas4h-collect)는 누르지 않는다 — 사장님이 누른다
- 엔진을 바꾸는 시도는 결과 전에 `seal/trials.jsonl` 에 먼저 적는다 · 채점에 쓸 자료로 엔진을 맞추지 않는다(S8)
- 부딪힌 곳은 `harness/conflicts.md` 에 등급과 셋(정직 > 맞음 > 쉬움 > 빠름)으로 정해 적는다
- `start.sh`·`run_spec.mjs` 는 돌릴 때마다 `harness/spec-latest.json` 을 새로 쓴다. 그 고리의 일과 함께 커밋하거나 되돌려 깨끗한 상태로 끝낸다.
