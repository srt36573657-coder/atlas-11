# 미확인 7종목 뉴스 재확인

확인 시각: 2026-09-26T19:31:03.743Z

기간 내 새 확정 일정 0건. 전체 완료가 아닌 조사 기록입니다.

| 종목 | 확인 결과 | 다음 확인 조건 |
|---|---|---|
| SK (034730) | 제319회 회사채 접수번호는 검색되지만 DART 원문이 웹 조회와 직접 HTTP에서 열리지 않아 수요예측·발행일 및 최종 정정 여부를 확정하지 못함. | DART 20260922000501 원문·정정본 또는 SK/대표주관사의 공식 증권신고서 첨부 확보. |
| POSCO홀딩스 (005490) | 회사 새 홈페이지의 IR 경로를 재확인했으나 IR 상세 조회 오류로 3분기 발표의 정확한 날짜를 확정하지 못함. | IR 상세 페이지 변경 및 KIND의 기업설명회 개최 공시 확인. |
| 고려아연 (010130) | 회사채 일정 관련 보도는 있으나 공식 IR·공시 페이지에서 본문 날짜와 정정 여부를 확보하지 못함. 종전 상충 날짜를 그대로 확정하지 않음. | 고려아연·KB증권·하나증권 또는 DART의 최종 증권신고서에서 수요예측·납입일 확인. |
| 메리츠금융지주 (138040) | 공식 IR 목록은 동적으로 구성되며 이번 조회에서 기간 내 행사 본문을 확보하지 못함. 보조 목록 요청의 빈 응답만으로 미발표를 확정하지 않음. | 공식 IR행사 목록의 완전한 본문 또는 KIND 개최 공시 확보. |
| 포스코인터내셔널 (047050) | 공식 9/16 미국 셰일가스 인수 설명자료 확보. 9/14 계약 및 11월 중순 거래종결 목표로, 9/17~10/30의 정확한 새 예정일을 채우는 근거가 아님. 전시회 참가 확정 원문도 미확보. | 기간 내 IR·인수 일정 정정 또는 All-Energy 출전자 명단의 회사 참가 근거 확인. |
| 삼성카드 (029780) | 공식 IR 달력의 2026년 항목은 7/27 상반기와 4/24 1분기 발표. 10/28은 2025년 항목이므로 올해로 바꾸지 않음. 최신 채권 잔액·조기상환 상태도 미확인. | 2026년 3분기 발표 일정 게시 또는 최신 채권 발행·잔액 공식 자료 확인. |
| 제일기획 (030000) | 공식 IR Upcoming에 예정 이벤트가 없다고 표시됨. Past의 최신 행사는 8/27로 대상 기간 밖. 추정 실적일을 확정일로 채우지 않음. | IR Upcoming 또는 KIND 실적발표·기업설명회 공시가 갱신되면 확인. |

## 확인한 원문 경로

### SK

- [search_excerpt_only](https://englishdart.fss.or.kr/dsbh001/main.do?rcpNo=20260922000501): 9/22 SK 제319회 증권신고서 검색 결과. 날짜 본문 미확보.
- [http_502](https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260922000501): 직접 요청 502. 검색 발췌를 원문 검증으로 계산하지 않음.
- [body_read](https://www.sk-inc.com/kr/ir/irArchive.aspx): IR 자료실에서 확인한 최근 분기 자료는 8/14 상반기 자료. 회사채 확정 일정 근거는 확보하지 못함.

### POSCO홀딩스

- [body_read](https://www.posco-inc.com/hs91a1-front/app/index.html): 공식 홈페이지에서 IR 개요·자료실 경로 확인. 첫 화면 자체에는 확정 발표일 없음.
- [http_502](https://www.posco-inc.com/ir/ir-material): 공식 IR 상세 자료 응답 오류.

### 고려아연

- [page_body_only](https://investors.koreazinc.co.kr/ko/investors/ir-events/ir-calendar/): 페이지 탐색 영역은 열리지만 일정 데이터의 날짜는 본문에서 확인되지 않음.
- [page_body_only](https://investors.koreazinc.co.kr/ko/investors/announcements/disclosure/): 공시 페이지 HTTP 200. 동적으로 채워지는 공시 목록은 확보되지 않아 무공시라고 판정하지 않음.
- [search_excerpt_only](https://m.sateconomy.co.kr/news/view/1065608866791104): 9/26 기사 검색 발췌에 10/1 수요예측이 있으나 원문 미확보이며 발행사 공시가 아님.

### 메리츠금융지주

- [page_body_only](https://www.meritzgroup.com/web/ko/ir/ir1.do): 실적발표·IR행사 메뉴 확인, 일정 행은 조회 본문에 없음.
- [empty_dynamic_response](https://www.meritzgroup.com/web/ir1_2_search.do): HTTP 200, result 빈 배열. 필터/동적 렌더링 영향을 배제할 수 없음.

### 포스코인터내셔널

- [body_read](https://www.poscointl.com/irActivity): 최근 IR 목록에 9/16 셰일가스 사업설명회와 9/9 컨퍼런스가 표시됨.
- [body_read](https://www.poscointl.com/upload/file/202609/202609166e0c1e9b5e1f49daaaa570068773b9b9NBuG2KQ.pdf): 공식 설명자료 6쪽: 거래규모 5억5천만 달러, 9/14 본계약, 11월 중순 종결 목표. 확정 일자 및 기간 요건 미충족.

### 삼성카드

- [body_read](https://biz.samsungcard.com/company/IR/investor-relatioin/calender/UHPPCI0143M0.jsp): IR 달력 상단 연도와 일자를 대조. 2026년 3분기 확정일 미표시.

### 제일기획

- [body_read](https://na.cheil.com/kr/ir/): Upcoming: 예정 이벤트 없음. Past: 2026-08-27 시티증권 컨퍼런스가 첫 항목.

