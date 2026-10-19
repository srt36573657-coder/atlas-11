#!/bin/bash
# 전체 검사는 scripts/atlas11/next/full_run.mjs 로만 — 새로 만든 것 하나에 11번까지(셈을 남김)
# 사장님 2026-10-19(싱가포르) 22:33 「전체 검사 11번만해 영구 세팅해」 · 22:49 「뭘 새롭게 만들고 나서 전체검사를 하잖아 그때 11번만」(원칙 87)
# Bash 명령에 깃허브 전체 검사(atlas11-next-full)를 바로 부르는 「workflow run」이 있고 full_run.mjs 가 아니면 막음(끝 코드 2)
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys
try:
    print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))
except Exception:
    print("")' 2>/dev/null)
if printf '%s' "$cmd" | grep -q 'atlas11-next-full' && printf '%s' "$cmd" | grep -qE 'workflow[[:space:]]+run' && ! printf '%s' "$cmd" | grep -q 'full_run.mjs'; then
  echo '전체 검사는 node scripts/atlas11/next/full_run.mjs --work <일 이름> --ref <가지> [--local] 로만 부른다 — 새로 만든 것 하나에 11번까지(사장님 2026-10-19 22:49 · 원칙 87). 지금 셈: --dry' >&2
  exit 2
fi
exit 0
