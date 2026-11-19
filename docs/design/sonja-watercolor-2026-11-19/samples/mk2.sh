#!/bin/bash
# 샘플 N 판 — dist3 굳은 링크 베끼기 → 수채화 색 바꾸기(theme.py) + 공통 · 샘플 꾸밈 → 짜임 바꾸기 글 넣기 → 시험 서버 8830+N
set -e
S=/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad; W=$S/wc36; N=$1; D=$W/dist-s$N
rm -rf $D; cp -al $S/dist3 $D
cat $W/common.css $W/s$N.css > $W/x$N.css
python3 $W/theme.py $D $W/x$N.css
python3 $W/scrollfix.py $D/su/su-sonja-scroll.svg
cat $W/sample-base.js $W/common.js $W/s$N.js > $W/sample$N.js
rm -f $D/su/sample.js; cp $W/sample$N.js $D/su/sample.js
python3 - $D/su/index.html <<'PY'
import sys, os
p = sys.argv[1]; t = open(p, encoding='utf-8').read()
if 'su/sample.js' not in t: t = t.replace('</body>', '<script src="/su/sample.js" defer></script>\n</body>', 1)
os.remove(p); open(p, 'w', encoding='utf-8').write(t)
PY
P=$((8830+N)); (curl -fs -o /dev/null http://127.0.0.1:$P/su/ || (cd /home/claude/atlas-11 && nohup node scripts/atlas11/invite_dev.mjs --dir $D --port $P --owner-key testkey > $W/dev$P.log 2>&1 &))
for i in $(seq 1 30); do curl -fs -o /dev/null http://127.0.0.1:$P/su/ && break; sleep 0.5; done
echo "sample $N on $P"
