# ATLAS를 Netlify에 올리기

**매일 자동으로 바뀌게 하려면 화면과 자동 갱신 함수를 함께 배포해야 합니다.**

## Windows

1. `ATLAS_Netlify.zip`을 모두 압축 해제합니다.
2. Node.js 24.15 이상이 없다면 https://nodejs.org/ 에서 설치합니다.
3. 압축을 푼 폴더의 **DEPLOY_NETLIFY.cmd**를 두 번 누릅니다.
4. 열리는 Netlify 로그인 화면에서 본인 계정으로 로그인합니다.
5. 안내에 따라 기존 프로젝트를 선택하거나 새 프로젝트를 만듭니다.
6. 배포 완료 화면의 사이트 주소를 엽니다.

Mac/Linux는 압축을 푼 폴더에서 `node DEPLOY_NETLIFY.mjs`를 실행합니다.

이 실행기는 소스 복원 → 설치 → Netlify 로그인 → 공개 운영 배포를 진행합니다. 기존 프로젝트를 선택하면 그 프로젝트에 새 버전을 배포합니다. 비밀 키는 로컬 `.atlas-deploy/<소스 식별값>/.atlas/admin-key.txt`에 저장됩니다. 배포 완료 때 정확한 위치를 표시합니다. 앱의 ‘갱신·설정’에서 수동 수집할 때 이 키를 사용합니다. 키 파일은 공개 배포에 포함되지 않습니다.

## 정상 연결 확인

- 사이트 위쪽에 **운영 서버 연결**이 표시됩니다.
- Netlify 프로젝트의 Functions에 `atlas`, `daily`, `refresh-background`가 있습니다.
- `daily`에 **Scheduled** 표시가 있습니다.
- 사이트의 ‘갱신·설정’에 관리자 키를 넣고 ‘지금 가격·뉴스 갱신’을 누르면 ‘자료·운영 기록’에 수집 결과가 기록됩니다.
- 예약 수집은 한국시간 매일 16시부터 실행됩니다. 첫 예약 실행의 성공 여부는 실제 실행 후에만 확인할 수 있습니다.

배포 전 **CHECK_ATLAS.cmd**를 실행하면 지원 Node 버전, 소스 파일 존재, ZIP 전체 CRC를 점검합니다. 이 점검은 로그인하거나 배포하지 않습니다. Mac/Linux는 `node DEPLOY_NETLIFY.mjs --check`입니다.

로그인이나 배포가 실패하면 **ATLAS_RUN_LOG.jsonl**에서 실패 단계와 종료 코드를 확인하세요. 자세한 명령 오류는 실행 창에 표시됩니다. 설치·네트워크·로그인 문제를 해결한 뒤 같은 DEPLOY_NETLIFY 실행기를 다시 실행할 수 있습니다. 같은 소스의 복원이 완료된 폴더는 재사용하므로 갱신한 데이터와 관리자 키를 덮어쓰지 않습니다. 다른 소스 버전은 별도 폴더에 복원하며 기존 폴더는 그대로 남습니다. 소스 버전을 바꿀 때 기존 운영 자료를 자동으로 합치지는 않습니다.

실행 기록에 관리자 키와 명령 인수를 저장하지 않습니다. Windows 실행 파일도 실패 종료 코드를 유지합니다. ZIP을 만들었다는 사실만으로 계정 연결·예약 실행이 완료된 것은 아닙니다.

## 정적 업로드와 차이

Netlify Drop에 현재 폴더를 올리면 준비된 52개 그래프, 뉴스 근거, 기기 내 재계산을 사용할 수 있습니다. 이 경우 서버 함수가 없으면 ‘이 기기 저장’이 표시되며 매일 새 데이터가 수집되지 않습니다. 자동 갱신에는 위 실행기를 사용하세요.

## Git으로 배포할 경우

`downloads/ATLAS_Program_Source.zip`을 풀어 저장소에 올리고 Netlify와 연결합니다. Build command는 `npm run build`, Publish directory는 `publish`, Functions directory는 `netlify/functions`입니다. Functions 범위에 임의의 긴 관리자 키를 `ATLAS_ADMIN_TOKEN`으로 등록한 뒤 재배포합니다. 비밀 키를 소스나 `netlify.toml`에 쓰지 않습니다.

## 기업별 예정 뉴스 추가

공식 일정·공시를 직접 확인한 구조화 JSON은 앱의 ‘예정 뉴스·근거 → 뉴스 근거 JSON 추가’로 넣을 수 있습니다. 서버 자동 수집에는 HTTPS JSON 주소를 `ATLAS_NEWS_FEED_URL` 환경변수로 추가합니다. 파일 규칙은 `NEWS_INPUT.md`를 따릅니다. 피드를 설정하지 않으면 현재 기본 수집 대상은 BLS·연준·한국은행입니다.

공식 배포 설명:
- https://cli.netlify.com/commands/deploy/
- https://docs.netlify.com/build/functions/scheduled-functions/
- https://docs.netlify.com/build/functions/get-started/

# 8.0 계정 기능 추가 안내

Google 로그인과 여러 기기 관심종목 저장은 위 함수 배포 후 `ATLAS_GOOGLE_CLIENT_ID`와 `ATLAS_SESSION_SECRET`을 설정해야 켜집니다. 자세한 내용은 같은 폴더의 `ACCOUNT_SETUP.md`를 보세요. Functions 목록에는 `account`도 있어야 합니다. 관리자 수집 키를 회원 로그인에 사용하지 않습니다. 설정값이 없으면 로그인 연결 필요 상태를 표시합니다.

