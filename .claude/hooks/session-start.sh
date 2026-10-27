#!/bin/bash
# 골똘이 본질 먼저 읽기 — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [2] 9
#   「SessionStart 훅으로 어느 Claude 방이든 열자마자 본질을 읽게 하라. 안 되면 CLAUDE.md 첫 줄로 대신한다.」
#   방이 열리면 이 글이 그대로 방의 첫 맥락이 된다(읽기만 · 아무것도 바꾸지 않음 · 늘 끝 코드 0)
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
F="$ROOT/docs/둘이_본질.md"
if [ -f "$F" ]; then
  echo "【먼저 읽음 — docs/둘이_본질.md · 사장님 말씀으로만 고침 · 모든 일의 잣대】"
  cat "$F"
  echo
  echo "【이 저장소 일은 CLAUDE.md → docs/고도리_지도.md 차례로 · 망치는 길에 닿는 일은 하지 않는다】"
else
  echo "docs/둘이_본질.md 를 찾지 못함 — CLAUDE.md 첫 줄의 본질을 따른다"
fi
exit 0
