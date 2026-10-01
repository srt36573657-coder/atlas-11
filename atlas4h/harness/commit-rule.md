# 깃 기록 규칙 (하네스 파일 다섯 중 셋째)

바꿀 때마다 무엇·왜를 적어 커밋합니다. 대화 기억이 아니라 이 기록이 다음 고리의 기억입니다.

1. 첫 줄: `atlas4h <단계>: <무엇을 했나 한 줄>` (단계 = 첫 실행 번호 또는 고리 이름)
2. 본문에 `무엇:` 한 줄과 `왜:` 한 줄을 꼭 넣습니다(검사 H5).
3. 통과 표시(`harness/passlist.json` 의 status)를 바꾸는 커밋은 평가 일꾼만 하고, 첫 줄이 `atlas4h EVAL:` 로 시작합니다(검사 H3).
4. 시험 잠금(`harness/tests.lock.json`)을 바꾸는 커밋은 첫 잠금 뒤로는 `atlas4h LOCK:` 로 시작하고, 사장님이 승인한 변경 요청서 이름을 적습니다(검사 H4). 시험은 고치지 않는 것이 원칙입니다.
5. 기록 장부(`atlas4h/ledger/`·`seal/trials.jsonl`)는 덧붙이기만 합니다. 고치거나 지우지 않습니다.
6. 이미 올린(push) 기록은 고쳐 쓰지 않습니다.
7. 커밋 끝에 함께 쓴 이 두 줄을 붙입니다.
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
   `Claude-Session: <세션 주소>`

atlas4h 기록만 보기: `git log --format='%h %ad %s' --date=format:'%m-%d %H:%M' -- atlas4h`
