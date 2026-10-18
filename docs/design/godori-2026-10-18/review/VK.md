# VK — 카톡 가입 서버 따로 검증(2026-10-18 11:00 ~ 11:40 싱가포르)

만든 일꾼(K1c · K1d)이 아닌 일꾼이 잼. 잣대 = order-0015 [2] · [3] · [4] · [11] 2-4 · [12] 2-3 · brief4 「주고받는 꼴」.
본 파일: `lib/atlas11/kakao.mjs` · `lib/atlas11/kakao-store.mjs` · `functions/atlas11/kakao.mjs` · `config/atlas11/kakao.json` · `git diff` 의 `deploy_netlify.mjs` · `invite_dev.mjs` · `site_headers.mjs` · 더해 `functions/atlas11/letter.mjs` · `lib/atlas11/letter.mjs`(12:02 KST 에 [4] 8 로 바뀜).

## 돌린 것

| 무엇 | 결과 |
|---|---|
| `node --test tests/atlas11/kakao.test.mjs tests/atlas11/kakao-store.test.mjs` | 11:59 KST 28/28 → **12:03 KST 27/28** — `kakao.test.mjs:129` 빨강(아래 F1) |
| 내 시험 `node --test tests/atlas11/verify-kakao/vk.test.mjs` | 18개: 통과 12 · 찾은 것 6(todo) · 실패 0 |
| 내 끝까지 `node tests/atlas11/verify-kakao/e2e-dev.mjs --port 8838 --off-port 8858` | 시험 서버(가짜 카카오) 우리 쪽 누름 **2** · 그 사이 우리 화면 **0** · 다시 온 사람(prompt=none) 누름 0 · 거부 `kakao=none` · 표 위조 403 · 내 돈 400 · 탈퇴 `{ok, removed, unlinked: true}` 뒤 두 기기 모두 회원 아님 · 꺼진 서버 모든 길 404 |

## 확인된 것(막을 것 없음)
- 꺼짐: on≠true · 열쇠 하나 없음/짧음 → 모든 길(constructor · __proto__ · START 같은 이름 포함) × 여섯 방법 404 · 쿠키 0 · 저장소 0 · 카카오 0(VK1 · 2,000여 요청).
- 보안 머리말: `HEADER_TOP` · `kakaoHeaderTop()` 이 HEAD 판과 바이트로 같음 · `package.mjs` 의 머리말 줄 바뀜 0 · `invite.json` 공유 열쇠 빈칸(VK3).
- 돌아갈 쪽: 나쁜 값 60개(//host · /\host · %2e%2e · javascript: · CRLF · 전각 · @ · 깊은 ..) + 무작위 20,000개 + 카카오 다녀온 40번 모두 우리 집 길(`/` · `/next/…` · `/이름.html`)만(VK4).
- 표: 다름 · 없음 · 10분 지남 · 앞날 · 꼴 틀림 · 2KB 넘음 · state 두 번 → 403 · 증표 바꿈 0 · 403 쪽은 스크립트 · 입력칸 없음 · CSP `default-src 'none'`(VK5).
- 쿠키: 모든 Set-Cookie 가 `__Host-` · Path=/ · HttpOnly · Secure · SameSite=Lax · Domain 없음 · 몸 · 기록에 로그인 증표 · 비밀 · 회원 번호 0 · CORS 머리글 0 · me 열쇠 여섯(VK7).
- 받는 것: 동의 화면 요청에 scope 없음 · 번호는 access_token_info 로만 · 저장소엔 HMAC 회원 표 + 쿠키로만 열리는 AES-GCM 자물쇠(K1c 시험과 같음).
- 회원 기록: 열쇠 넷만 · 내 돈은 키 · 값 · `-` 꼴 · off 어디서나 400 · content-length 거짓 413 · 항목 1001 → 413 · same-site/cross-site/null origin 403 · `__proto__` 400 · 가입 안 함 401(VK8).
- 탈퇴(카톡 저장소): 회원 표 · 소개 표 · 번호가 든 열쇠 · 값 0 · 친구 by · 소개해 준 사람 고리 지움 · 두 기기 로그인 0 · 연결 끊기 1번(KakaoAK · user_id)(VK9).
- 연결 끊기 알림: KakaoAK 대표 어드민 열쇠 머리글만 · 소문자 · 두 칸 · Bearer · 다른 열쇠 · 주소 넣기 401 · 틀리면 저장소 손댐 0(VK13).
- /counts · /verify: 사장님 열쇠 머리글만 · 틀리면 저장소를 만지기 전에 403 · 답에 사람 표 0(VK14).
- 소개 수: 새 회원만 · 한 계정이 다섯 번 나갔다 와도 1 · 조용한 시작의 ref 버림 · 서로 다른 셋이 함께 있어야 번호(VK15).
- 막무가내: 시작 300번 · 가짜 돌아옴 100번 → 가입 마친 수 0 · 회원 0 · 증표 바꿈 0(VK16). 조용한 시작은 회원을 만들지 않음(VK18).

## 찾은 것

| # | 등급 | 자리 | 무엇 | 고칠 것 |
|---|---|---|---|---|
| F1 | 막음(시험 빨강) | `functions/atlas11/letter.mjs:11-14` · `scripts/atlas11/deploy_netlify.mjs:94` | 편지 함수의 `import('../../lib/atlas11/kakao.mjs')` · `kakao-store.mjs` 를 올리기 준비가 따라가서 스위치가 꺼져도 카톡 셈 두 파일이 편지 함수 안에 실려 올라감 → `kakao.test.mjs:129` 실패(VK2) | `stageFunctions` 에서 카톡 스위치가 꺼지면 `lib/atlas11/kakao.mjs` · `kakao-store.mjs` 를 따라가지 말고 그 자리에 막대 파일(`export const kakaoMemberOf = async () => null; export const KAKAO_STORE = 'atlas11-kakao-v1';`)을 씀 → 편지는 오늘 길 그대로 · `:129` 다시 초록 |
| F2 | 막음(켜기 전) | `lib/atlas11/letter.mjs:128` · `lib/atlas11/kakao.mjs:228` · `:255` | [4] 8 로 편지 회원 기록에 붙인 `kakao: <회원 표>` 를 탈퇴 · 연결 끊기 알림이 떼지 않음(`detachKakao` 를 부르는 곳 0) — 「탈퇴하면 바로 지워요」(privacy.html:100)와 어긋남(VK10) | `functions/atlas11/kakao.mjs` 가 `onGone: mh => detachKakao(getStore({name: LETTER_STORE, consistency: 'strong'}), mh)` 를 넘기고 `withdraw` · `unlinked` 가 회원 지운 뒤 `await c.onGone?.(mh)` |
| F3 | 고칠 것 | `lib/atlas11/kakao.mjs:228-232` · `site/next/kakao.js:247` | 서버 사본을 먼저 지우고 연결 끊기를 부름 · 끊기가 안 돼도 200 `{ok: true, unlinked: false}` → 화면은 「됐다」. 카카오 연결이 남아 진짜 카카오는 다음 일반 시작에서 동의 화면 없이 code 를 줌 → 남의 쪽이 띄운 `/api/kakao/start?ref=<남>` 으로 누름 0 다시 가입 · 소개 수 +1(VK11 · VK12) | 연결 끊기를 먼저(카카오 `-101 NotRegisteredUser` 는 끊긴 것으로) · 안 되면 502 `{error: 'unlink'}` 이고 아무것도 안 지움(로그인 그대로 → 다시 누름) · 된 뒤에만 `withdrawMember` + `dropSessions` |
| F4 | 참고 | `lib/atlas11/kakao.mjs:164` · `:177-178` | 표 쿠키는 서명 없는 JSON · 한 번만은 브라우저가 쿠키를 지우는 것뿐 — 같은 쿠키 + 표를 10분 안에 다시 내면 새 code 로 통과(VK6). 쿠키를 가진 사람만 할 수 있어 해는 작음 | 표 쿠키에 HMAC(해시 비밀값) · 돌아올 때 `st/<sha(s)>` 를 onlyIfNew 로 써서 두 번째는 403 |
| F5 | 참고 | `functions/atlas11/kakao.mjs:13` · `functions/atlas11/letter.mjs:13` | 함수가 `config: {on: true}` 를 박음 — 실행 때 스위치 파일을 안 봄(문은 올리기 준비 + 환경 값 넷뿐) | 올리기 준비가 스위치 값을 함수 옆 작은 파일로 써 넣거나, 지금처럼 두되 이 두 문을 지도에 적음 |
| F6 | 참고 | `lib/atlas11/kakao.mjs:156-157` | 「시작 누른 수」는 남의 사이트 `<img>` · 봇이 올릴 수 있음(가입 마친 수는 못 올림 — VK16)(VK17) | `sec-fetch-mode` 가 있으면 `navigate` 이고 `sec-fetch-dest` 가 있으면 `document` 일 때만 셈 |
| F7 | 참고 | `lib/atlas11/kakao.mjs:48-57` | 돌아갈 쪽이 `#/s/…` 만이 아니라 우리 사이트 모든 쪽(/ · /next/… · /이름.html) — 열린 리디렉트는 아님 | 바꿀 필요 없음(좁히려면 `#/` 로 시작하는 것만) |
| F8 | 참고 | `lib/atlas11/kakao-store.mjs:171` | 한 계정이 탈퇴 → 다시 가입을 되풀이하면 「가입 마친 수」가 매번 +1(VK15: 다섯 번 → +5) · 소개 수 · 번호는 안 늚 | 숫자 뜻에 「다시 가입 포함」을 적음 |
| F9 | 참고 | `site/privacy.html:100` · `kakao-store.mjs:332` | 처리방침 「탈퇴하면 바로 지워요」 — 이미 준 확인 번호 장부(cv/) · 날마다 두 수는 일부러 남김 | 처리방침에 한 줄(K2p) |
| F10 | 참고 | `lib/atlas11/kakao.mjs:123` · `:130` · `:137` | 돌아옴 한 번에 카카오 셋을 차례로 8 + 8 + 3초까지 기다림 — 넷리파이 함수 시간 한도를 넘으면 `kakao=none` 대신 넷리파이 오류 | 합 8초 안(예: 4 · 3 · 1초) |
| F11 | 참고 | `lib/atlas11/kakao.mjs:256-257` · `:107` | 연결 끊기 알림은 지우다 깨져도 200(카카오는 다시 안 보냄 → 남음) · 끝난 로그인 기록(s/)은 그 쿠키가 다시 올 때만 지움 | 깨지면 기록 한 줄 + 사장님 몫에 「알림 실패 확인」 · s/ 는 탈퇴 · 알림 때 이미 지움(그대로 둬도 됨) |

## 가짜로 못 잰 것
- 카카오 동의 화면 안 누름 수 · 진짜 카카오가 「이미 동의한 사람」에게 화면을 건너뛰는지는 가짜로 못 잼(가짜는 늘 화면을 보임) — VK12 는 그 동작을 흉내 내서 잼. 실제 폰으로 셀 것([11] 3).
- 연결 해제 웹훅 머리글 꼴(`KakaoAK <대표 어드민 키>`)은 카카오 문서대로 짰음 — 켤 때 카카오 「웹훅 시험」 한 번.

## 다시 봄 12:3x(싱가포르) — K1c 고침(11:28) 뒤 따로 다시 잼

돌린 것(12:29 ~ 12:31 · 디스크가 다시 찬 뒤 처음부터 다시):
- `node --test tests/atlas11/kakao.test.mjs tests/atlas11/kakao-store.test.mjs tests/atlas11/verify-kakao/vk.test.mjs` → **56/56 통과 · 실패 0 · todo 0**(만든 일꾼 36 · 여섯 길 ①~⑥ 포함 · 내 것 20).
- `node tests/atlas11/verify-kakao/e2e-dev.mjs --port 8838 --off-port 8858`(시험 서버 · 가짜 카카오 · onGone 꽂힘) → 우리 쪽 누름 **2** · 그 사이 우리 화면 **0** · 다시 온 사람 0 · 거부 `kakao=none` · 표 위조 403 · 내 돈 400 · 시작 누름 3 / 가입 마침 2 · 탈퇴 `{ok, removed, unlinked: true}` · 두 기기 모두 회원 아님 · 꺼진 서버 404.
- 한 번 돌린 셈(파일 안 남김): 카카오 기다림 · 연결 끊김 알림(F10 · F11 칸).

### 내 시험을 고친 곳 — 시험이 틀렸던 것만(제품 코드는 안 건드림)
| 시험 | 앞 판이 틀린 까닭 | 고친 것 |
|---|---|---|
| VK10 | 떼는 고리(onGone)는 넷리파이 함수 파일 `functions/atlas11/kakao.mjs:15-16` 이 `handleKakao` 에 넘김. 내 판은 `handleKakao` 를 바로 불러 그 고리가 빠진 채로 잼 → 제품이 아니라 판이 틀림 | 판에 함수 파일과 같은 꼴 `onGone: mh => detachKakao(편지 저장소, mh)` · 알림 길도 더 잼 · 함수 파일이 정말 넘기는지는 새 VK19 가 진짜 파일 둘로 따로 잼 |
| VK12 | 앞 판은 「끊기가 실패해도 서버 사본은 지워짐」(옛 셈)을 가정하고 그 자리에서 `isMember == false` 를 확인. 고친 셈은 끊기가 실패하면 아무것도 안 지움(F3 의 뜻 그대로) → 가정이 틀림 | 가정을 「회원 · 카카오 연결이 함께 남음」으로 바꿈. 잴 것(남의 쪽이 띄운 시작으로 조용히 새 가입 · 소개 수 올리기 0)은 그대로 · 다시 누르면 끝 · 끊긴 뒤 남의 시작은 동의 화면부터를 더 잼 |
| VK5 | 서버가 표 쿠키에 서명을 붙이게 됨(F4). 앞 판은 서명 없이 지어 모든 갈래가 「서명 없음」 하나에 걸림 — 통과는 했어도 10분 지남 · 앞날 · 꼴 갈래를 실제로 안 잼 | 서버와 같은 꼴로 서명해 갈래마다 제 까닭에 걸리게 · 대조군(다 맞으면 302) · 서명 없음 · 다른 열쇠 · 서명 뒤 바꿈 칸을 더함 |
| e2e-dev | node 의 fetch 는 `sec-fetch-mode: cors` 를 늘 붙이고 바꿀 수 없음(잰 값: 덮어써도 cors). 브라우저의 꼭대기 이동은 `navigate`. F6 뒤 서버가 그 요청을 사람 누름으로 안 세서 시작 누름이 0 으로 나옴 → 판이 틀림 | 누름은 `node:http` 로 브라우저가 보내는 머리글 그대로(navigate · document) · 시작 누름 3 / 가입 마침 2 를 잣대로 더함 |
| VK2 · VK6 · VK11 · VK17 | 고쳐져 todo 를 뗌(이제 문) | VK2 는 올라갈 폴더 전부를 훑어 진짜 카톡 셈 글자 0 · 막대 둘이 내보내는 것 = 회원 아님 · 켜면 막대 0 을 더함 · VK11 은 -101 · 지우다 깨짐 → 500 → 다시 누름을 더함 · VK17 은 iframe · 미리보기 · 머리글 없는 앱 안 브라우저를 더함 |

### F1 ~ F11 닫힘 · 열림
| # | 판정 | 근거 한 줄 |
|---|---|---|
| F1 | **닫힘** | `scripts/atlas11/deploy_netlify.mjs:84-85 · :95` 막대 — VK2: 꺼짐 = 함수 invite · letter · files 의 kakao 0 · 올라갈 폴더 전부에 `handleKakao · finishSignup · withdrawMember · kakaoUnlink` 글자 0 · 막대 둘은 `kakaoMemberOf → null` · 켜면 진짜 셋(kakao · kakao-store · letter) · 막대 0 · `kakao.test.mjs:129` 다시 초록 |
| F2 | **닫힘** | `functions/atlas11/kakao.mjs:15-16` onGone → `lib/atlas11/kakao.mjs:242-246` forget — VK19(진짜 함수 파일 둘 + Blobs 로컬 + 가짜 카카오): 편지 들어오기 `kakao: true` → 탈퇴 뒤 편지 기록에 회원 표 0 · 편지 회원은 그대로 · 알림 길도 0 · 카톡 저장소에도 0 · 시험 서버(`invite_dev.mjs:36`)도 꽂힘 |
| F3 | **닫힘** | `lib/atlas11/kakao.mjs:250-260` 끊기 먼저 — VK11: 503 → 502 `{error:'unlink'}` · 쿠키 · 회원 · 기록 · 카카오 연결 모두 남음 → 다시 누르면 `{ok, removed, unlinked}` · -101 = 끊긴 것 · 지우다 깨짐 → 500 → 다시 누름 → 회원 표 0 / VK12: 끊기 실패 뒤 남의 시작 = 로그인일 뿐 새 가입 0 · 소개 수 0 · 끊긴 뒤엔 동의 화면부터 |
| F4 | **닫힘** | `lib/atlas11/kakao.mjs:170 · 180-189 · 195-196` 서명 + `st/` 한 번만 — VK6: 같은 쿠키 · 표를 다시 내면 403 / VK5: 서명 없음 · 다른 열쇠 · 서명 뒤 바꿈 403 · 대조군 302 |
| F5 | **열림(참고 · 그대로 둠)** | `functions/atlas11/kakao.mjs:15` · `functions/atlas11/letter.mjs:13` 여전히 `config: {on: true}` — 문은 올리기 준비(이제 함수 + 막대) + 환경 값 넷. 올리는 길은 `deploy_netlify.mjs` 하나뿐이라 지금은 해 없음 |
| F6 | **닫힘** | `lib/atlas11/kakao.mjs:162 · 173-178` humanTap — VK17: 그림 · 스크립트 · fetch · iframe · 미리보기 0 · 꼭대기 이동 1 · Sec-Fetch 없는 앱 안 브라우저 1 / VK16: 막무가내 300 → 가입 마침 0 |
| F7 | **열림(참고 · 바꿀 필요 없음)** | `cleanTo` 그대로(`:52-61`) — VK4 다시: 나쁜 값 60 · 무작위 20,000 · 다녀온 40 모두 우리 집 길 · 열린 리디렉트 0 |
| F8 | **열림(참고)** | 셈은 그대로(탈퇴하면 아무것도 안 남겨 「전에 회원」을 모름 — K1c accept 에 까닭) — VK15: 다섯 번 다시 가입 → 가입 마침 +5 · 소개 수 1 · 번호 0. 사장님이 보시는 숫자 설명(`privacy.html:54` · 사장님 몫 문서)에는 「다시 가입도 셈」이 아직 없음 |
| F9 | **닫힘** | `site/privacy.html:103 · 105 · 106` — 편지 기록에 둔 회원 표(탈퇴하면 지움) · 날마다 숫자(계속 둠) · 확인 번호 기록(누구 것인지 안 남겨 탈퇴해도 남음)을 적음 |
| F10 | **닫힘** | `lib/atlas11/kakao.mjs:33` 4 + 3 + 1 = 8초 · 연결 끊기 6초 — 한 번 돌린 셈: 증표에서 멈춤 → 4.0초에 `kakao=none` · 번호 · 무효에서 멈춤 → 3.0초 · 셋 다 한도의 0.9배로 늦음 → 7.2초에 `kakao=ok` |
| F11 | **닫힘** | `lib/atlas11/kakao.mjs:282-286` — 한 번 돌린 셈: 알림 때 지우다 깨짐 → 500 `{"error":"delete"}` · 다시 오면 200 · 회원 아님 / VK13: 틀린 열쇠 열 가지 401 · 저장소 손댐 0 |

### 새로 본 것(고친 셈에서)
- F12(참고 · 새): `lib/atlas11/kakao.mjs:195` 표 기억 `st/<SHA-256>` 은 돌아옴 한 번마다 하나씩 쌓이고 지우는 곳이 없음. 시작 → 돌아옴 두 요청이면 누구나 하나를 더 쌓을 수 있음(VK20: 50쌍 → 50개). 사람 표 · 시각 없이 서울 날짜만이라 개인정보는 아님. 고칠 것: 열쇠를 `st/<서울 날짜>/<SHA-256>` 로 바꿔 /counts 때 이틀 지난 날짜 묶음을 지움.
- 막을 것: **없음**(2차 올리기 16:00 기준). 꺼진 지금 사이트에 바뀌는 것 0 — 보안 머리말 바이트 같음(VK3) · 카톡 함수 안 올라감 · 카톡 셈 글자 0(VK2).
