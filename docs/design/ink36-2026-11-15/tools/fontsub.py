# 붓글씨 글꼴을 쓰는 글자만 잘라 HTML 안에 넣는 @font-face 를 만든다
# 쓰는 법: python3 -I fontsub.py <글꼴키> <굵기> <CSS 글꼴 이름> <글자들 또는 @파일경로>
#  글꼴키: nanum-brush-script(나눔 붓) · east-sea-dokdo(동해 독도 · 거친 붓) · yeon-sung(연성 · 붓)
#          song-myung(송명 · 옛 명조) · nanum-myeongjo(나눔 명조 · 400/700/800) · hahmlet(함렛 · 100~900)
#  예: python3 -I fontsub.py nanum-brush-script 400 BrushKR "손자병법 오늘은" > brush.css
import sys, glob, os, io, base64
from fontTools.ttLib import TTFont
from fontTools import subset
D = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1632/dl'
key, wt, fam, txt = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
if txt.startswith('@'):
    txt = open(txt[1:], encoding='utf-8').read()
need = sorted({ord(c) for c in txt if not c.isspace()})
pkg = glob.glob(f'{D}/fontsource-{key}-*/package/files')[0]
files = sorted(glob.glob(f'{pkg}/{key}-*-{wt}-normal.woff2'))
left = set(need); out = []
for f in files:
    if not left: break
    t = TTFont(f); cm = t.getBestCmap() or {}
    have = sorted(u for u in left if u in cm)
    if not have: continue
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']
    s = subset.Subsetter(opt); s.populate(unicodes=have); s.subset(t)
    b = io.BytesIO(); t.flavor = 'woff2'; t.save(b)
    rng = ','.join('U+%04X' % u for u in have)
    out.append("@font-face{font-family:'%s';font-weight:%s;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (fam, wt, base64.b64encode(b.getvalue()).decode(), rng))
    left -= set(have)
sys.stdout.write('\n'.join(out) + '\n')
sys.stderr.write(f'글자 {len(need)} · 못 찾은 글자 {len(left)} {"".join(chr(u) for u in sorted(left))[:40]} · 크기 {sum(len(x) for x in out)//1024}KB\n')
