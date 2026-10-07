# ATLAS 11 — Claude 가 지킬 것(사장님 2026-10-08 01:31 「너 대충하고 있어 너 시스템으로 그짓 못하게 해」)

- 규칙 문서는 `docs/ATLAS_원칙.md` 하나 — 특히 규칙 33(모든 화면 그림 한 장 · 다섯 나라)과 34(빠짐없이 도는 검사 · 올리기 문).
- 화면 코드(`site/app` 의 .js · .css · 말 사전 · `site/index.html`)를 고쳤으면 **반드시** 다섯 나라 모든 화면을 도는 검사를 돌리고 결과를 함께 커밋한다:
  `node scripts/atlas11/package.mjs --no-full --out ../out` → 시험 서버(dist) → `node scripts/atlas11/full_check.mjs --base http://127.0.0.1:8823 --pw <playwright 폴더>` → 실패 0 인 `reports/atlas11/full-check/latest.json` 커밋.
  안 하면 `scripts/atlas11/art_gate.mjs`(올리기 직전 · `deploy_netlify.mjs`)가 사이트 올리기를 막는다 — 손으로 올리기 · 자동 올리기 모두.
- 밀어 넣기 전 문도 켠다: `git config core.hooksPath scripts/atlas11/hooks`.
- 걸린 것을 「괜찮다」며 넘기지 않는다 — 원인을 고치고 다시 돌린다.
- 예약이 걸린 작업 파일(`atlas11-daily.yml` · `atlas11-evening.yml`)은 고치지 않는다(규칙 7).
