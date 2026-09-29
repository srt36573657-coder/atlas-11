ATLAS — 예정 뉴스 기반 주가 예측 4.0.0

재생: 기본 하루 3초 → 중요한 뉴스 정지 → 설명 확인 후 계속
실제는 실선, 예측은 점선입니다.
검증 성능은 단순 기준과 비슷하며 높은 정확도를 입증하지 못했습니다.

52종목 / 2026-09-17~10-30 / 뉴스 반응·몬테카를로·소거법

매일 자동 갱신까지 배포하려면:
1. 이 ZIP을 모두 압축 해제합니다.
2. Node.js 24.15 이상을 설치합니다: https://nodejs.org/
3. Windows는 DEPLOY_NETLIFY.cmd를 실행합니다.
   Mac/Linux는 node DEPLOY_NETLIFY.mjs를 실행합니다.
4. Netlify 로그인과 프로젝트 선택을 마치면 화면과 예약 함수를 함께 배포합니다.

정적 Netlify Drop 업로드만으로는 매일 서버 수집이 실행되지 않습니다.

현재 확인된 미래 사건은 공통 경제 발표 6건입니다.
기업 고유 미래 사건은 미확보이며, 종목당 18건 기준은 12건씩 부족합니다.
미래 기사 내용이나 주가를 확정 사실로 만들지 않습니다.

배포 전 점검: CHECK_ATLAS.cmd
실패 기록: ATLAS_RUN_LOG.jsonl (실행 후 생성)
실패 후 같은 실행기를 다시 실행해도 기존 작업 자료는 보존합니다.

안내: downloads/DEPLOY.md
전체 설명: downloads/README.md
계산법: downloads/ATLAS_Method.md
검증 결과: downloads/VALIDATION.md
전체 소스: downloads/ATLAS_Program_Source.zip
