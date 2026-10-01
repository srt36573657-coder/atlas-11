#!/usr/bin/env bash
# 시작 스크립트 (하네스 파일 다섯 중 다섯째): 환경을 켜고 기본 시험을 돌린다.
# 고리 일꾼은 일을 시작하기 전에 이것부터 돌린다. 기본 시험이 깨져 있으면 그것부터 고친다(고리 일꾼 걸음 2).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
echo "== 환경"; node --version; git log --oneline -1; TZ=Asia/Seoul date '+%Y-%m-%d %H:%M KST'
echo "== 명령문 잠금"; node atlas4h/scripts/check_command.mjs || exit 1
echo "== 하네스 검사"; node atlas4h/scripts/check_harness.mjs || exit 1
echo "== 기본 시험"; node --test --test-reporter=dot 'atlas4h/tests/*.test.mjs' || exit 1
echo "== 자료 모으기 시험"; node --test --test-reporter=dot 'atlas4h/collect/test/*.test.mjs' || exit 1
echo "== 엔진·채점 시험"; node --test --test-reporter=dot 'atlas4h/engine/test/*.test.mjs' 'atlas4h/score/test/*.test.mjs' || exit 1
echo "== 기준값 시험"; node --test --test-reporter=dot 'atlas4h/baselines/test/*.test.mjs' || exit 1
echo "== 고리 시험"; node --test --test-reporter=dot 'atlas4h/loop/test/*.test.mjs' || exit 1
echo "== 사양 현황(보고만 · 통과 표시는 평가 일꾼만 바꾼다)"; node atlas4h/scripts/run_spec.mjs | tail -n 1
echo "== 넘겨주기 쪽지"; sed -n '1,40p' atlas4h/harness/handoff.md
