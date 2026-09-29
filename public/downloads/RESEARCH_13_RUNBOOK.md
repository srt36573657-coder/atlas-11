# ATLAS 13종목 조사 실행

Node.js 24에서 소스 ZIP을 푼 폴더를 기준으로 실행합니다.

```sh
npm run research13:plan
node scripts/ATLAS_Research_13.mjs record reports/research-13-state.json reports/research-13/result-CODE.json CURRENT_REVISION
npm run research13:check
node scripts/ATLAS_Research_13.mjs finalize reports/research-13-state.json public/data/atlas.json reports/validation.json /mnt/data/ATLAS_Netlify.zip
```

`reports/research-13-state.json`이 이어서 사용하는 상태입니다. 다시 init하지 않습니다. plan의 미확보 코드와 지난 시도·다음 경로를 읽고 조사팀을 나눕니다. 검색과 원문 확인은 실행 호스트의 도구·에이전트가 수행합니다. 이 스크립트 자체에는 웹 검색·에이전트 호출 기능이 없습니다.

record는 현재 revision을 조건으로 한 건씩 기록합니다. 다른 작업과 충돌하면 최신 상태를 읽어 병합합니다. 확인 안 된 날짜를 VERIFIED로 기록하지 않습니다. 출처 본문·기업·연도·정정·한국 거래일을 조사자와 별도 검토자가 대조하고, 검토 패킷 해시를 남깁니다. 해시는 기록 변경을 탐지하며 출처 진실성을 자동 인증하지 않습니다.

BLOCKED / NOT_PUBLISHED / REJECTED는 미완료입니다. 재확인 간격은 2·4·8·16·24시간으로 늘어나며 실제 재개는 실행 호스트의 다음 작업 때입니다. 다음 확인 시각이 있다는 것만으로 백그라운드 검색이 계속 실행 중인 것은 아닙니다. 기존 ATLAS 갱신 작업이 저장된 상태를 읽고 이어서 수행합니다.

check는 13종목의 증거·52개 고유 코드·고정 기간·실제 뉴스 입력·거래일·원본 보존을 검사합니다. 이미 지난 일정은 현재 입력이 일치하고 이전 전망에서 정상 수용됐던 기록이 남아 있어야 유효합니다. 뉴스 철회·수정은 이전 검증으로 숨길 수 없습니다.

finalize는 여기에 기능 검사와 실제 배포 ZIP/내부 소스 ZIP CRC·입력 일치까지 요구합니다. 13종목 중 하나라도 미확보이면 종료 코드 2와 taskComplete=false를 반환합니다. 조사 중간 결과 ZIP을 보존할 수는 있지만 최종 완료본으로 부르지 않습니다. 2026-10-30 이후 기간을 늘리지 않습니다.

제품 전시·판매 행사·종속기업의 사업 일정과 모회사 직접 IR을 구분합니다. 새로운 일정에 과거 비교 표본이 없으면 가격 효과는 ABSTAIN, trustProbability는 null입니다. 일정 확보 수·기능 검사 수는 예측 적중 확률이 아닙니다.
