# KB2 카톡 줄 — 받아들이는 기준(먼저 씀 · 2026-10-18 17:15 싱가포르 · 17:35 이어받아 고침)

명령문 [6] 1 · 6 · 8 · 일 나누기 split.md · cards.md 「KB2 카톡 줄」 · 단추는 KB1 `site/next/share-btn.js` 의 `shareButtons(o, {kakao: true})` 하나만 부름.
검사 이름은 cards.md 대로 `scripts/atlas11/next/check_kakao.mjs`(split.md 의 check_kakao_rows 는 옛 이름 — 모든 쪽 검사는 `check_<영문>.mjs` 만 주움).

| 항목 | 다 했다는 증거(잴 수 있는 것) | 어떻게 재나 | 결과 |
|---|---|---|---|
| [6] 1 줄마다 단추 하나 | 길마다 「종목 줄(data-kkrow) 수 = 카톡 단추 수」 · 줄마다 단추 1 · 줄 밖 종목 고리(뺀 꼴 목록 밖) 0 | `check_kakao.mjs` 끝 코드 0 | |
| [6] 1 오른쪽 끝 · 44px | 단추 44 × 44px 이상 · 단추 오른쪽 끝이 줄 오른쪽 끝에서 24px 안 · 단추 오른쪽에 다른 칸 0 · 320 · 360 · 390 가로 넘침 0 | check_kakao(세 폭) | |
| [6] 1 모양 지킴 | 바꾼 길에서 quick 걸림(넘침 · 17px · 44px · 화면 오류) 0 | `quick.mjs --w 320,360,390` | |
| [6] 2 한 곳 | 내 파일의 카톡 단추는 모두 shareButtons 결과(button.kk-btn[data-kk]) · 제 단추 만드는 곳 0 | grep(kk-btn 글 · 새 button 0) | |
| [6] 6 안 엉킴 | 단추가 고리(a) 안 0 · 단추 누름 → 글상자(.ps-dlg) 열림 · 주소(#) 그대로 · 줄 고리 누름 → 그 종목 길로 감 | check_kakao(길마다 한 번씩 누름) | |
| [6] 8 급등 줄 | 급등 칩 · 급등 다섯 칸 · 달력 · 소식(뽑힘 · 옮김 · 빠짐) 줄의 단추 data-kind = surge · 그 밖 share | check_kakao 가 곳마다 kind 를 맞댐 | |
| 곳 수 표 | 아래 표(파일 · 함수 · 무슨 줄 · 몇 개) + 뺀 것과 까닭 | 아래 표 · check_kakao places | |

## 곳 수 표(끝에 채움)

| 파일 · 함수 | 곳(data-kkrow) | 무슨 줄 | kind | 보통 쪽 줄 수 |
|---|---|---|---|---|

## 뺀 것과 까닭(끝에 채움)
