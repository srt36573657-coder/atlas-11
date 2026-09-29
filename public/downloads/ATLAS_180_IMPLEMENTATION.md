# ATLAS 9.0 · 180항목 적용 장부

기획을 모두 검증 완료했다고 표시하지 않습니다. 기능 구현, 기존 기능 보존, 부분 적용, 실제 사용자·물리 기기 확인을 구분합니다.

|번호|항목|상태|근거·제한|
|---|---|---|---|
|1|첫 화면의 목적 하나|외부 확인 필요|사용자 과업 관찰 미실행. 실제 사용자 완료 여부는 아직 확인하지 않았다.|
|2|대형 소개 문구 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|3|상위 메뉴 네 개 유지|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|4|기능 추가의 입장 기준|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|5|장식의 삭제 기준|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|6|진입 경로 통합|부분 적용·범위 명시|주 상세 화면은 StockCard를 공유한다. 뉴스 계산 상세 패널은 별도 자료 읽기 용도로 유지.|
|7|기본 설정 결정|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|8|연구용 상태 고정|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|9|작업 위치 보존|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|10|용어 사전 하나|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|11|종목명 겹침 해소|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|12|상단 빈 띠 축소|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|13|모드 선택 빈 막대 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|14|필터 빈 행 축소|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|15|불필요한 작업면 머리말 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|16|하단 공백 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|17|화면 밖 재생 조작 복귀|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|18|중첩 스크롤 정리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|19|혼합 색상 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|20|브라우저 영역과 앱 구분|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|21|실제 뷰포트 기준|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|22|전체 프레임 높이|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|23|전역 헤더 48px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|24|문맥 도구 행 44px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|25|외곽 여백 12px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|26|패널 간격 12px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|27|공간 예산 계산|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|28|낮은 화면 대안|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|29|정보 없는 영역 진단|부분 적용·범위 명시|레이아웃 경계 자동 측정은 추가했다. 임의 빈 영역 전체를 탐지하는 일반 알고리즘은 미구현.|
|30|확대 우선 규칙|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|31|어두운 남색 바탕|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|32|패널 단계 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|33|밝은 본문 색|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|34|청록 강조 한 가지|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|35|상승 하락 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|36|예측 실제 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|37|경고색의 제한|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|38|장식 경계와 조작 경계 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|39|상태 토큰 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|40|밝은 화면 확장 대비|부분 적용·범위 명시|의미별 색 토큰은 중앙화했다. 밝은 테마 선택 기능은 제공하지 않는다.|
|41|공식 서체와 추정 구분|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|42|한글 서체 하나|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|43|숫자 폭 고정|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|44|가격 24~28px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|45|본문 14~16px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|46|보조 정보 12~13px|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|47|제목 위계 제한|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|48|줄 높이 구분|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|49|굵기 세 단계|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|50|글꼴 배포 확인|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|51|중복 종목 선택 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|52|검색의 보조화|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|53|현재 위치 표시|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|54|자료 상태 열기|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|55|설정 한 곳|부분 적용·범위 명시|자료 상태·버전·연구용 표시를 통합했다. 네트워크 실제 재수집은 이번 변경 범위가 아니다.|
|56|뒤로 이동 복구|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|57|진화 화면의 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|58|전체 보기의 보조화|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|59|도움말의 문맥화|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|60|메뉴 순서 고정|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|61|목록 너비 제한|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|62|행 높이 축소|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|63|이름 우선|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|64|업종 한 줄|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|65|미니 그래프 절제|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|66|종점 값 기준 명시|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|67|선택 표시 통합|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|68|관심 표시 최소화|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|69|목록 스크롤 보존|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|70|키보드 탐색|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|71|차트부터 보이기|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|72|전체 기간 유지|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|73|이름과 가격 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|74|단위 고정|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|75|눈금 수 제한|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|76|실제값 우선 가시성|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|77|범위는 선택 표시|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|78|끝점 레이블 충돌 처리|부분 적용·범위 명시|기존 종점·축 위치 계산을 보존하고 지정 뷰포트를 검사했다. 모든 극단값에 대한 새 라벨 충돌 알고리즘은 추가하지 않았다.|
|79|극단값도 보존|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|80|여백과 축 여지 구분|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|81|재생 조작 한 줄|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|82|주요 날짜 점프 정리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|83|뉴스 없을 때 안내|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|84|44일 날짜 띠|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|85|날짜 선택기 통합|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|86|하루 1초 기본|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|87|종목별 타이머 하나|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|88|중요 뉴스 개별 정지|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|89|탭 이동 정지|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|90|수동 선택 즉시 반영|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|91|이유 한 문장 먼저|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|92|사실과 모형 구분|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|93|해당 기업만 설명|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|94|영향 우선 정렬|부분 적용·범위 명시|확인된 기존 영향 기준을 보존. 새 영향 추정이나 순위 조작은 하지 않았다.|
|95|미산정 순서 대안|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|96|출처 접근 한 번|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|97|시각과 시간대|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|98|긴 설명만 스크롤|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|99|중요 뉴스 전면 표시|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|100|내용 없는 카드 제거|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|101|같은 날짜 비교|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|102|차이의 부호 고정|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|103|차이율의 분모 표시|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|104|출발일 채점 제외|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|105|미래 실제값 비움|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|106|휴장일 신규값 금지|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|107|상충값 유보|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|108|작성 전 날짜 안내|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|109|고정 가격 정밀도|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|110|비교와 인과 분리|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|111|방향과 폭 분리|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|112|분모 함께 표시|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|113|종목 리스트 연결|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|114|유보 목록 제공|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|115|날짜별 장부|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|116|자료 도착 시각|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|117|가격 유지 기준 비교|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|118|범위 점수 표시|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|119|표본 의존성 안내|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|120|보고서 내려받기|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|121|너비 기준 전환|부분 적용·범위 명시|1024px 미만 단일열·종목 선택 창·설명 패널 구현.|
|122|목록은 서랍으로|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|123|선택명 상시 노출|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|124|설명은 하단 시트|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|125|바닥 조작 안전영역|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|126|화면 회전 보존|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|127|터치 표적 확보|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|128|작은 화면 단일 스크롤|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|129|가상 키보드 대응|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|130|작은 화면 실제 검사|부분 적용·범위 명시|360/390/430 CSS px Chromium 화면 검사. 물리 휴대폰 미검수.|
|131|키보드 초점 보임|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|132|텍스트 대비 검사|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|133|큰 글자 대비 검사|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|134|색 이외 의미|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|135|움직임 줄이기|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|136|초점 가림 방지|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|137|설명 접근 순서|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|138|상태 알림 절제|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|139|툴팁 대안|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|140|확대 재배치|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|141|표시 자료 먼저|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|142|상세 자료 지연 읽기|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|143|계산과 그리기 분리|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|144|컴포넌트 경계 정리|부분 적용·범위 명시|표시 조작과 엔진 분리는 유지. 전체 렌더 프로파일링 전용 보고는 미실행.|
|145|실제 기기 속도 측정|외부 확인 필요|브라우저 환경은 측정했으나 일반 노트북·물리 휴대폰 속도 측정은 미실행.|
|146|중복 요청 억제|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|147|느린 연결 안내|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|148|실패 후 재시도|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|149|저장 상태 정확성|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|150|재생 중 갱신 보류|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|151|기존 CSS 목록 작성|부분 적용·범위 명시|기존 CSS의 상충 높이/행 규칙을 조사했고 새 computed style을 실측했다. 8.9 실제 재현 브라우저 캡처는 없고 사용자 사진을 원래 결함 증거로 사용.|
|152|덮어쓰기 누적 중단|부분 적용·범위 명시|이전 테마 15개 직접 import 제거, 현재 workspace.css 소유권 단일화. 다른 보고서의 구조 기본값은 support 계층에서 유지.|
|153|이전 테마 보관|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|154|레이아웃 책임 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|155|토큰 중앙화|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|156|축소 가능한 Grid|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|157|변형 콘텐츠 정상 흐름|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|158|숫자 엔진 경계 보존|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|159|표시와 원본 구분|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|160|구현 단위 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|161|사진 사례 재현|부분 적용·범위 명시|올릭스 10/15 중요 뉴스 정지 상태를 실제 브라우저에서 검수. 수정 전 증거는 사용자가 제공한 사진.|
|162|실제 브라우저 필수|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|163|노트북 두 크기|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|164|긴 이름 시나리오|부분 적용·범위 명시|긴 이름과 현재 저장 가격을 검사. 모든 가능한 7자리 가격 조합 전수 검사는 아님.|
|165|운영 상태 조합|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|166|키보드 전체 여정|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|167|원본 해시 대조|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|168|사용자 5명 관찰|외부 확인 필요|5명 사용자 관찰은 미실행.|
|169|혼란 지점 기록|외부 확인 필요|개발 환경 오류·사용자 제공 사진은 기록했으나 새로운 사용자 관찰은 미실행.|
|170|출시 중단 기준|부분 적용·범위 명시|확인한 출시 차단 결함은 수정. 물리 기기/사용자 조사는 미실행 상태로 명시.|
|171|180항목 장부|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|172|치명 결함 우선|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|173|순서 있는 적용|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|174|원문과 해석 분리|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|175|검사 수 과장 금지|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|176|배포 ZIP 하나 안내|구현·적용|src/workspace.css / src/atlas.tsx / reports/design-90/browser.json|
|177|압축과 시작 확인|부분 적용·범위 명시|ZIP CRC·루트 파일·데이터 복원 검사는 포장 후 최종 결과로 기록.|
|178|실배포 별도 확인|부분 적용·범위 명시|ZIP 제작 범위. 실제 Netlify 사이트 배포는 실행하지 않음.|
|179|복구 가능 릴리스|기존 기능 보존|기존 수치·근거 로직과 저장 전망 보존. reports/tests.tap / reports/design-90/before.json|
|180|완료 보고의 기준|부분 적용·범위 명시|화면 캡처·기능 검사·보존 검사 및 남은 외부 검수를 공개.|