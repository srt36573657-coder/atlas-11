# 주문 2011 — 수르 모든 쪽을 첫 페이지(잡스 판) 기준으로 · 그림 부품 일꾼 공용 글

사장님 2026-11-08 20:11(서울) 원문: 「어 그렇게 하고 제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」
(앞 말씀: 15:32 「6번으로 해서 잡스 에 빙식으로 해서 만들어봐」 · 17:08 「구슬으로 첫페이지 해서 다 변경해야 하잖아」)

## 할 일(일꾼 한 명 = 옛 그림 부품 하나)
옛 무하 그림 부품(`site/su/su-*-art.js` · 짝 꾸밈 `.css`)을 **첫 페이지 잡스 판과 같은 말투의 새 부품**으로 다시 그린다.
- 새 파일 둘만 만든다: `site/su/su-<이름>-jobs.js` · `site/su/su-<이름>-jobs.css` (이름은 맡은 일에 적힘)
- **다른 파일은 고치지 않는다** — su.js · su-21.js · su-why.js · su-roads.js · index.html · 검사(check_su.mjs) · 시험(tests) · 옛 부품 · su-apple.* 모두 그대로(합치기는 일을 맡긴 쪽이 한다). 저장소 git 명령(commit · push · checkout · stash)도 쓰지 않는다.
- 옛 부품과 **같은 꼴(약속)**: `export const CSS = '/su/su-<이름>-jobs.css'` · `export async function load(get, arg)` · `export function picture(d, opt)` → `<svg>` 하나(못 그리면 null). 부르는 쪽(su-21.js · su.js · su-why.js · su-roads.js)이 옛 부품에 넘기는 `arg` · `opt` 를 그대로 받는다(부르는 줄을 읽어 확인).
- 같은 자료(옛 부품의 load 가 받는 파일)만 쓴다 · **지어낸 숫자 0** · 숫자는 자료 그대로(단위 붙임) · 빈 값은 「확인 필요」.

## 기준 = 첫 페이지 잡스 판(반드시 먼저 읽고 본다)
- 코드: `site/su/su-apple.js` · `site/su/su-apple.css`(색 · 글꼴 · 움직임 값을 그대로 가져다 씀)
- 사진: `/home/claude/turn/su-1532-screen.png`(첫 화면) · `/home/claude/turn/su-white-1708.html` 안 사진 · 시험대로 직접 찍어 보기(아래)
- 말투(잡스 「제품 소개 쪽」): 흰 바탕 #FFFFFF · 글 #1D1D1F · 흐린 글 #6E6E73(또는 #636366) · 가는 선 #E5E5EA / #D2D2D7 · **눈에 띄는 색은 호박색 하나**(점 · 선 #D97706 · 빛나는 구슬은 su-apple.css 의 sa-b*/sa-hl* 그러데이션) · 될 듯 · 아직 같은 뜻은 맑은 유리 구슬(회색 sa-g* 그러데이션 · 속 불씨)
- 한 화면에 생각 하나: 맨 위 짧은 부제 한두 줄(20px 회색 · 가운데) → 물건 하나(구슬 · 큰 숫자) → 아래로 줄 · 칸(가는 선으로 나눔)
- 글꼴: `'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif` · 숫자는 굵게(700~800) · 글자 사이 살짝 좁게
- **빼는 것**: 사람 그림 · 무하 아치 · 덩굴 · 꽃 · 금 테 · 별 · 종이 결 · 그림자 덩어리 · 흐림 필터(feGaussianBlur 등) · 아무 수(Math.random) · 상표 이름
- 움직임: 들어올 때 한 번(1.2초 안 · su-apple 의 sa-up · sa-grow · sa-fade 같은 꼴) + 천천히 숨 쉬는 빛 하나(무한 · 투명도만) · 모두 `@media (prefers-reduced-motion: no-preference)` 안(줄이기면 끝 모습)

## 꼭 지킬 것(검사가 잼 — `scripts/atlas11/next/check_su.mjs`)
1. `<svg>` 에 `data-clean="jobs"` · `class="su-svg ..."` · `role="img"` · `aria-label`(무엇을 보여 주는지 한 줄) · `viewBox="0 0 390 H"`(넓이 390 고정 · 높이는 필요한 만큼)
2. **그림이 첫 화면의 70% 넘게**: 390 × 844 화면에서 머리 줄 아래 ~ 다음 단추 위를 그림이 채워야 함 → 그림 높이(390 넓이 기준) **640 넘게** · 맨 위 빈자리 작게
3. 그림 안 글(`svg text`) **셋 넘게** · 글 크기 **17px 넘게**(셈한 글꼴 크기 — 18 · 20 · 21 · 큰 숫자 40 ~ 60) · 글은 한국어(숫자 · 회사 이름 영문 그대로는 됨)
4. 움직임 하나 넘게 돌고 있음(`getAnimations()` 1 넘게 — 무한 숨쉬기 하나 두면 됨)
5. 누르는 곳(`a[href]`)은 옛 부품과 **같은 주소 · 같은 data-속성 · 같은 aria-label 꼴**(검사가 이름 · 차례 · 주소를 맞대 봄 — check_su.mjs 에서 그 쪽 주소(#/m · #/c · #/q · #/j · #/f · #/g · #/r 등)와 data-g 이름으로 찾아 모두 읽기) · 누름 칸은 390 기준 **59 × 59 넘게**(320 폭에서도 48 넘게)
6. 글 속 꾸밈 0: `innerHTML` · `outerHTML` · `insertAdjacentHTML` · `.style` · `Math.random` 쓰지 않음 · 그리기는 `import {s} from '/su/su-fig.js'`(createElementNS · setAttribute)만 · 색 · 움직임은 짝 .css 에만
7. 쓰지 않을 말(화면): 추천 · 매수 · 매도 · 예측 · 확률 · 유망 · 기회 · 신호 · 저평가 · 1위 · TOP · 사라 · 팔아라 · 대박 · 폭죽 · 랭킹 · 원금 보장 · 목표가 · 「지금 바로」 · 새 문장에 % 기호 넣지 않음(값 숫자의 %는 자료 그대로 됨) · 영어 문장 0
8. 꾸밈(.css)의 선택자는 모두 그 부품 svg 안으로(`.su-<이름>-jobs ...` 꼴) — 다른 쪽에 걸리지 않게

## 시험대(내 컴퓨터 시험 서버 http://127.0.0.1:8840 — 이미 떠 있음)
- 보기: `cd /home/claude/atlas-11 && node /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/jobs-shot.cjs <부품 이름> <찍을 파일.png> [arg 또는 -] [opt JSON 또는 -] [light|dark]`
  → 그 부품만 쪽과 같은 꼴로 그려 찍고, 한 줄 결과(오류 · 높이 · clean · 글 수 · 17px 아래 글 · 움직임 수 · 누름 주소)를 찍음 · 찍은 그림은 Read 로 눈으로 본다(겹친 글 · 잘린 글 · 넘침이 없게)
  - 예: `node .../jobs-shot.cjs su-land-art /tmp/.../old-land.png -`(옛 부품) · `node .../jobs-shot.cjs su-land-jobs /tmp/.../new-land.png -`(새 부품)
- 시험: `cd /home/claude/atlas-11 && node --test tests/atlas11/su.test.mjs`(고치지 않음 — 지나는지만 봄)
- 찍은 그림 · 메모는 `/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/jobs-<이름>/` 에

## 끝에 돌려줄 것(짧게)
- 만든 파일 둘 · 부르는 쪽이 넘기는 arg · opt 마다 시험대 결과 한 줄(오류 0 · clean jobs · 높이 · 글 수 · 17px 아래 0 · 움직임 수)
- 옛 부품과 같게 둔 누름 주소 · data-속성 목록 · 검사(check_su.mjs)에서 이 쪽을 재는 줄 번호와 지킨 방법
- 찍은 그림 파일 경로(옛 · 새) · 남은 걱정(있으면 없다고 하지 말고 그대로)
