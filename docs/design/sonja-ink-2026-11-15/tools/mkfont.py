# 붓 글꼴(동해 독도 · OFL) — 쓰는 글자만 한 파일로(woff2) · 첫 쪽 큰 그림(손자병법 붓 글씨 · 화제 · 먼 산 · 한 획) SVG
# 쓰는 법: python3 -I mkfont.py <저장소 뿌리>
import sys, glob, io, os
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.merge import Merger
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
ROOT = sys.argv[1]
D = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1632/dl'
TMP = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1706/ftmp'
os.makedirs(TMP, exist_ok=True)
# 붓 글꼴로 쓰는 글(고정 글만 — 자료에서 오는 글은 쓰지 않음)
WORDS = ['손자병법', '내리는 땅', '흔들리는 땅', '오르는 땅', '좁은 길', '잔잔한 땅', '덜 잃은 꾀 차례', '서른여섯 꾀', '겹친 곳',
         '불장', '꽃이 될', '돈이 몰리는', '조용한데 힘이 모이는 7', '오늘의 1 · 2 · 3등', '불장이 될 듯', '꽃이 될 듯', '돈이 몰릴 듯', '지금', '될 듯',
         '형세 보고', '지금은', '이에요', '오늘', '땅 지도', '업종', '회사', '자세히', '왜 사', '내 매매일지', '친구에게', '칸 하나 읽는 법', '0123456789', '형세', '꾀', '이름', '셋', '읽기', '불', '꽃', '돈', '고요', '오늘 이름이 오른 회사']
need = sorted({ord(c) for w in WORDS for c in w if not c.isspace()})
pkg = glob.glob(f'{D}/fontsource-east-sea-dokdo-*/package/files')[0]
left = set(need); parts = []
for f in sorted(glob.glob(f'{pkg}/east-sea-dokdo-*-400-normal.woff2')):
    if not left: break
    t = TTFont(f); cm = t.getBestCmap() or {}
    have = sorted(u for u in left if u in cm)
    if not have: continue
    opt = subset.Options(); opt.layout_features = []; opt.notdef_outline = True; opt.name_IDs = ['*']; opt.hinting = False
    s = subset.Subsetter(opt); s.populate(unicodes=have); s.subset(t)
    t.flavor = None
    p = f'{TMP}/part{len(parts)}.ttf'; t.save(p); parts.append(p)
    left -= set(have)
if left: print('못 찾은 글자', ''.join(chr(u) for u in sorted(left)))
m = Merger().merge(parts)
m.flavor = 'woff2'
out = os.path.join(ROOT, 'site/fonts/brush'); os.makedirs(out, exist_ok=True)
m.save(os.path.join(out, 'east-sea-dokdo-sub.woff2'))
m.flavor = None; m.save(f'{TMP}/merged.ttf')
print('글자', len(need), '조각', len(parts), '크기', os.path.getsize(os.path.join(out, 'east-sea-dokdo-sub.woff2')))

# ── 큰 그림 SVG — 붓 글씨는 글꼴을 받지 않고 선(path)으로 그림(첫 칠함이 글꼴을 기다리지 않게) ──
B = TTFont(f'{TMP}/merged.ttf'); bgs = B.getGlyphSet(); bcm = B.getBestCmap(); bu = B['head'].unitsPerEm
_TTC = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
_kr = [i for i in range(5) if 'KR' in (TTFont(_TTC, fontNumber=i)['name'].getDebugName(1) or '')][0]
SER = TTFont(_TTC, fontNumber=_kr)
sgs = SER.getGlyphSet(); scm = SER.getBestCmap(); su_ = SER['head'].unitsPerEm
def glyph_path(gs, cm, upm, ch, x, y, size):
    """ch 를 (x, y)=글자 칸 왼쪽 위 · size px 로 — SVG 좌표(위가 0)"""
    g = gs[cm[ord(ch)]]
    pen = SVGPathPen(gs)
    k = size / upm
    # 글꼴 좌표(아래가 0 · 위로 +) → SVG: x' = x + k*gx · y' = y + size*0.88 - k*gy
    tp = TransformPen(pen, (k, 0, 0, -k, x, y + size * 0.88))
    g.draw(tp)
    return pen.getCommands(), g.width * k
W, H = 390, 470
paths = []
# 왼쪽 큰 붓 글씨(세로) — 글자마다 높이 104
size = 112; x0 = 6; y = 4
for ch in '손자병법':
    d, adv = glyph_path(bgs, bcm, bu, ch, x0, y, size)
    paths.append(f'<path d="{d}"/>')
    y += size * 0.93
title = ''.join(paths)
# 오른쪽 위 화제(세로 두 줄 · 오른쪽 줄 먼저) — 「불장 · 꽃이 될 ·」 「돈이 몰리는 곳을 찾아요」
def vline(text, x, y, size, gap):
    out = []
    for ch in text:
        if ch == ' ':
            y += size * 0.45; continue
        if ch == '·':
            out.append(f'<circle cx="{x + size / 2:.1f}" cy="{y + size * 0.5:.1f}" r="{size * 0.09:.1f}"/>'); y += size * 0.8; continue
        d, adv = glyph_path(sgs, scm, su_, ch, x, y, size)
        out.append(f'<path d="{d}"/>'); y += size + gap
    return ''.join(out)
side = vline('불장 · 꽃이 될 ·', 340, 40, 21, 6) + vline('돈이 몰리는 곳을 찾아요', 306, 40, 21, 6)
STROKE_D = 'M10 34 C26 22 44 26 58 40 C92 74 140 150 214 236 C132 160 84 96 48 64 C36 54 22 54 12 58 C4 52 4 40 10 34 Z'
art = f'''<g transform="translate(150 212) scale(1.06)">
<path d="M0 250 C8 196 40 92 78 80 C100 74 114 58 142 66 C170 72 204 128 220 250 Z" fill="url(#ink-w1)"/>
<path d="M30 250 C52 206 92 160 124 168 C156 176 198 214 220 250 Z" fill="url(#ink-w2)"/>
<path d="{STROKE_D}" fill="#3B1A14"/>
<g clip-path="url(#ink-stk)" fill="none" stroke="#F1E3D3" stroke-linecap="round">
<path d="M40 46 C80 80 130 150 200 224" stroke-width="1.8" stroke-dasharray="26 7 44 5 70 9 40 6"/>
<path d="M34 52 C76 86 122 150 186 214" stroke-width="1.2" stroke-dasharray="12 6 36 5 60 12"/>
<path d="M44 42 C86 74 136 146 206 230" stroke-width="1" stroke-dasharray="50 8 30 6 90 4"/>
</g>
<g fill="#3B1A14"><circle cx="15" cy="27" r="2.3"/><circle cx="168" cy="207" r="2.6"/><circle cx="178" cy="218" r="1.7"/><circle cx="158" cy="214" r="1.4"/></g>
</g>'''
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs><linearGradient id="ink-w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1A14" stop-opacity=".17"/><stop offset="1" stop-color="#3B1A14" stop-opacity="0"/></linearGradient>
<linearGradient id="ink-w2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1A14" stop-opacity=".10"/><stop offset="1" stop-color="#3B1A14" stop-opacity="0"/></linearGradient>
<clipPath id="ink-stk"><path d="{STROKE_D}"/></clipPath></defs>
{art}
<g fill="#3B1A14">{title}</g>
<g fill="#3B1A14">{side}</g>
</svg>
'''
# 좌표 소수 한 자리로(파일을 가볍게)
import re
svg = re.sub(r'(\d+\.\d)\d+', r'\1', svg)
_h, _r = svg.split('<g fill="#3B1A14"><path', 1)
svg = _h + re.sub(r'(-?\d+)\.\d', lambda m: str(round(float(m.group(0)))), '<g fill="#3B1A14"><path' + _r)  # 글자 선은 정수로(1px 안 · 파일을 가볍게)
open(os.path.join(ROOT, 'site/su/su-sonja-hero.svg'), 'w', encoding='utf-8').write(svg)
print('그림', len(svg.encode()))
