# Google 로그인과 관심종목 저장

ATLAS 8에는 실제 Google 신원 검증과 계정별 서버 저장 코드가 포함되어 있습니다. 로그인 연결 설정값이 없으면 저장 완료를 표시하지 않습니다. 기존 예측·뉴스 운영 저장소 이름은 유지했습니다.

1. 본인 Google Cloud 프로젝트에서 웹 애플리케이션 OAuth 클라이언트를 만들고 실제 배포 사이트 주소를 승인된 JavaScript 원본으로 등록합니다.
2. Netlify 환경변수 `ATLAS_GOOGLE_CLIENT_ID`에 클라이언트 ID를 설정합니다. 공개 식별값이며 Google 클라이언트 비밀키를 브라우저에 넣지 않습니다.
3. 서버 전용 `ATLAS_SESSION_SECRET`에 32자 이상의 충분히 긴 무작위 비밀값을 설정합니다. ZIP이나 공개 JSON에 넣지 않습니다. 예: 로컬 Node에서 `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`로 생성한 값을 비밀 환경변수에 입력합니다.
4. 함수가 포함된 배포를 완료합니다. 정적 파일만 올리면 계정 서버와 자동 수집은 작동하지 않습니다.
5. 화면의 Google 로그인으로 계정을 선택하고 관심 버튼을 누릅니다. 다른 기기에서 같은 계정으로 로그인해 같은 목록이 나타나는지 확인합니다.

Google 공식 라이브러리로 ID 토큰의 서명·발급자·대상·만료를 검증하고 로그인 nonce를 대조합니다. 서버 세션은 HttpOnly 쿠키로 보관하며, 관심종목은 이메일이 아닌 Google 고유 사용자 식별자 기준으로 분리합니다. 수정 버전이 충돌하면 최신 자료를 다시 읽어 같은 종목에 대한 요청만 재시도합니다. 관리자 수집 키와 일반 사용자 로그인을 구분합니다.

서버에서 사용하는 저장소는 Netlify 배포에서는 Blobs, 로컬 Node 서버에서는 기존 runtime 경로 아래 accounts입니다. 기존 예측 저장소 이름은 바꾸지 않습니다. 서버 계정 설정은 실제 운영자의 계정에서 완료해야 합니다. 이 안내는 해당 계정 연결이 이미 완료되었다는 의미가 아닙니다.

공식 문서: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
