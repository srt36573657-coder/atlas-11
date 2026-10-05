# ATLAS 돌발 사건 수치 검토 — 독립 비교안

사건 등록, 전제 재검토, 수치 변경, 나중의 실제 평가를 서로 분리한다. 등록됐다는 이유만으로 가격을 움직이지 않는다. 아래 수치 함수는 입력 자료의 자격과 산술을 검사하는 순수 함수이며 외부 원문을 직접 수집·인증하지 않는다.

`estimateBreakingImpact({event, code, baseline, now})`

기존 전망과 원래 엔진을 수정하지 않는다. 별도 발행·같은 사건의 중복 적용·정정 및 철회·사후 쌍 비교는 사건 기록 모듈에서 관리한다.

## 1. 사용 가능한 과거 반응

표본은 같은 종목·같은 사건 단계만 허용한다. 같은 경제 사건을 여러 기사·ID로 나눠 표본 수를 늘리지 않는다. 서로 다른 경제 사건이라도 같은 날짜 또는 반응 가격 구간이 겹치면 양쪽 모두 제외한다. 같은 그룹의 값이 상충해도 그 그룹은 제외한다. 미래에 관측된 중복·상충 자료는 먼저 제외하여 과거 자격을 바꾸지 않게 한다.

각 표본은 다음을 갖춰야 한다.

- 사건 ID·독립 경제 사건 그룹·종목 코드·단계 ID.
- 시간대가 명시된 사건 발생·인지 시각. 현재 사건보다 과거에 끝난 반응 구간.
- 출처 URL, 읽은 원문 기록의 digest, 원문 검토 시각.
- 기업행위 조정 확인이 있는 사건 직전·직후 종가와 관측 시각.
- **사건 전에 알려진** 기대 로그수익률 및 출처·기대 시각.
- 다른 중요 사건과의 중첩 검토 결과.
- 운영 거래일 달력으로 확인한 정확히 다음 거래일 반응.

체크박스 하나 또는 `deltaLog` 숫자 하나만 입력해서는 통과하지 못한다. 표본의 보관 잔차를 아래 식으로 다시 계산하여 일치하는지 검사한다.

`r_j = log(P_after,j) − log(P_before,j) − expectedLogReturn_j`

가격·잔차가 비어 있거나 출처/시간/조정/기대 근거가 부족하면 해당 표본은 사용할 수 없다. 큰 하락이라는 이유만으로 유효한 손실 표본을 버리지 않는다.

## 2. 현재 사건과 기준 전망의 중복 방지

현재 사건은 `confirmed` 또는 새로 검토한 `corrected` 상태이고, 출처 종류·원문 확인 기록을 갖춰야 한다. 이는 사용자가 입력한 연구 검토 상태이지 외부 기관의 자동 인증이 아니다. 철회·미확인·단순 보도 상태는 수치 적용을 유보한다.

현재 사건 ID에 연결한 원문 검토 기록과 정확한 기준 전망 ID에 연결한 포함 여부 검토가 필요하다. 정정 전 사건 ID에 대한 수치 승인 자료를 새 사건에 그대로 재사용하지 않는다.

기준 전망에 같은 사건·단계가 이미 사용됐거나 기준 실제 종가가 발표 이후 가격이라면 다시 더하지 않는다. 다른 단계는 별개일 수 있지만 단계 사이의 중복 영향 검토가 명시적으로 필요하다. 단계가 불명확하면 유보한다. 기존 진화 잔차 보정이 포함된 선에도 그대로 중복 합산하지 않는다.

## 3. 축소 계산식

최소 5개의 자격 있는 독립 사건 그룹을 확보한 경우에만 다음 연구값을 낸다.

`deltaLog = sum(r_j) / (n + 5)`

이는 단순 평균을 0 쪽으로 축소하는 사전 고정 연구 규칙이다. 5건이나 분모의 5는 통계적으로 충분함이나 미래 정확도를 입증한 수치가 아니다. 표본 수 부족·중복·시각·원문·기준 전망 포함 여부 검토에 실패하면 `eligible=false`, `deltaLog=null`, `status=HELD`를 반환한다. 미산정을 0 효과로 부르지 않는다.

통과해도 `status=EXPERIMENTAL_ELIGIBLE`, `trustProbability=null`, `causal=false`이다. 실제 원인, 확정 방향, 성공 확률을 추정했다고 표현하지 않는다.

## 4. 별도 미래 선에 적용하는 계약

사건 모듈은 발행 이후의 다음 적용 가능 거래일부터 한 번만 아래 이동을 적용한다.

`P_research(t) = P_baseline(t) × exp(deltaLog)`

매일 `exp(deltaLog × h)`를 더하는 추세 보정이 아니다. 같은 사건이 매일 반복 충격을 주는 것처럼 계산하지 않는다. 기존 범위를 같은 배율로 옮겨도 이는 미보정 연구 범위이며 적중 확률이 아니다. 과거 발행본과 실제 종가를 바꾸지 않는다.

## 5. 고급 검토 JSON 입력 계약

다음은 **형식 설명용 미완성 틀**이다. 실제 뉴스나 학습 표본이 아니다. null·안내 문구를 실제로 확보한 근거 없이 임의 숫자로 채우면 안 된다. 각 표본의 실제 자료를 검토한 뒤 독립 사건 5개 이상을 제공해야 한다.

```json
{
  "reviewedEventId": "현재 선택한 사건 기록 ID",
  "code": "해당 종목 코드",
  "phaseId": "현재 사건과 같은 단계 ID",
  "method": "own_stock_phase_residual",
  "horizonSessions": 1,
  "adjustmentVerified": true,
  "expectationVerified": true,
  "evidenceReviewedAt": "시간대가 있는 실제 검토 시각",
  "eventSource": {
    "url": "현재 사건과 동일한 HTTPS 원문 주소",
    "bodyRead": true,
    "digest": "실제 보관 원문 기록의 식별값",
    "reviewedAt": "현재 사건 발견 후 실제 검토 시각"
  },
  "baselineReview": {
    "baselineId": "선택한 기존 전망 ID",
    "reviewedAt": "사건과 기존 전망을 함께 검토한 시각",
    "eventAlreadyIncluded": false,
    "residualOverlap": false,
    "otherPhaseOverlap": false
  },
  "samples": [
    {
      "id": "과거 반응 기록 ID",
      "groupId": "독립 경제 사건 ID",
      "code": "같은 종목 코드",
      "phaseId": "같은 단계 ID",
      "eventAt": "과거 사건 발생 시각",
      "knownAt": "그 사건 자료를 알게 된 시각",
      "horizonSessions": 1,
      "adjustmentVerified": true,
      "expectationVerified": true,
      "overlapChecked": true,
      "overlappingEventIds": [],
      "source": {
        "url": "과거 사건 HTTPS 원문 주소",
        "bodyRead": true,
        "digest": "실제 보관 원문 식별값",
        "reviewedAt": "원문 및 반응 관측 후 검토 시각"
      },
      "prices": {
        "beforeClose": null,
        "afterClose": null,
        "beforeAt": "사건 직전 거래일 종가 시각",
        "afterAt": "다음 거래일 종가 시각",
        "observedAt": "이 가격을 실제 확보한 시각",
        "adjustmentVerified": true
      },
      "expectedLogReturn": null,
      "expectationKnownAt": "사건 발생 전에 기대가 알려진 시각",
      "expectationSourceUrl": "사전 기대 근거의 HTTPS 주소",
      "residualLogReturn": null
    }
  ]
}
```

여러 종목에 같은 숫자를 복사하지 않는다. 입력 코드와 대상 종목이 다르면 유보한다. 달력은 사용자의 수치 JSON에서 신뢰하지 않고 운영 입력의 `calendar.sessions`를 기준 전망에 주입하여 가격 구간을 검사한다.

## 6. 검사의 의미와 남은 한계

합성 자료로 검사한 것은 미래 유입·중복·다른 종목 혼입·임의 잔차·중복 합산 방지와 계산 구현이다. 실제 돌발뉴스 수집·원문 진위·시장 적중률을 검증한 것이 아니다. `inputVerification=user_reviewed_not_independently_verified`를 유지한다. 사용자가 가져온 URL과 digest가 있다는 것만으로 원문 내용이 사실이라고 인증하지 않는다.

날짜·원문·가격 조정·사전 기대 자료가 없으면 수치 변경 0건이 정상 결과일 수 있다. 사후 오차가 발생해도 뉴스 때문이라고 자동 단정하지 않고 원인 가설과 가격 비교를 따로 기록한다. 기간은 2026-09-17~2026-10-30이며 종료일 뒤 새 영향 계산은 유보한다.
