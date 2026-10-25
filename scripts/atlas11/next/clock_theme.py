#!/usr/bin/env python3
# 돌 시계 청록 판 짓기 — 사장님 2026-10-26(서울) 08:16 「디자인 이렇게 하라고 어 다 다시해」(어젯밤 22:03 돌 시계 판 그림)
#   · 08:20 「속도 10배 빠르게 해 방식 찾아서」 · 08:23 「더 빠른 방식 찾아서 9시까지 모든 싸이트 되게 해」
# 쪽마다 손으로 고치지 않고, 이 셈이 site/next/*.css 를 읽어 흰 판에서 쓰던 색을 청록 판 색으로 한 번에 바꾼 규칙을 짓는다.
#   - 흰 판(html.white)은 그대로 켜 둠(자리 · 크기 규칙이 거기 있음) — 그 위에 html.clock 을 얹어 색만 바꿈
#   - 흰 판 규칙(html.white …)은 html.white.clock.clock … 으로, 덮이지 않은 맨 규칙은 html.white.clock … 으로 복제(색 칸만)
#     → 원래 이기던 규칙이 복제본에서도 이김(앞에 붙는 무게가 같은 차이로 붙음)
#   - 색 바꾸기 = 밝기를 뒤집어 청록 100가지 안으로(흰 바탕 → 짙은 청록 · 검은 글 → 흰빛) · 초록(오름 · 싹) → 하늘청록 · 파랑(내림) → 밝은 회청 · 보라(강조) → 흰색
#   - 카톡 노랑 칸은 그대로(사람들이 아는 카톡 색 · 그 칸 글도 그대로)
# 짓기: python3 scripts/atlas11/next/clock_theme.py → site/next/clock.css(손으로 고치지 않음 — 이 파일과 EXTRA 를 고쳐 다시 짓는다)
import os, re, glob, colorsys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SRC = sorted(f for f in glob.glob(os.path.join(ROOT, 'site/next/*.css')) if not f.endswith('/clock.css'))
OUT = os.path.join(ROOT, 'site/next/clock.css')

# ── css 읽기(주석 · 따옴표 · 괄호 · 겹친 @media 를 앎) ──
def strip_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)

def skip_str(s, i):
    q = s[i]; i += 1
    while i < len(s) and s[i] != q:
        if s[i] == '\\': i += 1
        i += 1
    return i + 1

def match_brace(s, i):  # s[i] == '{' → 짝 '}' 자리
    d = 0; n = len(s)
    while i < n:
        c = s[i]
        if c in '"\'': i = skip_str(s, i); continue
        if c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return i
        i += 1
    return n - 1

def parse(s, i=0):
    nodes, start, n = [], i, len(s)
    while i < n:
        c = s[i]
        if c in '"\'': i = skip_str(s, i); continue
        if c == '{':
            pre = s[start:i].strip(); j = match_brace(s, i)
            if pre.startswith('@'):
                name = pre.split()[0].lower()
                if name in ('@media', '@supports', '@layer', '@container'):
                    kids, _ = parse(s[i + 1:j]); nodes.append(('at', pre, kids))
            else:
                nodes.append(('rule', pre, s[i + 1:j]))
            i = j + 1; start = i; continue
        if c == ';': start = i + 1
        i += 1
    return nodes, i

def split_top(s, sep):
    out, cur, d, i = [], [], 0, 0
    while i < len(s):
        c = s[i]
        if c in '"\'':
            j = skip_str(s, i); cur.append(s[i:j]); i = j; continue
        if c in '([': d += 1
        elif c in ')]': d -= 1
        if c == sep and d == 0: out.append(''.join(cur)); cur = []
        else: cur.append(c)
        i += 1
    out.append(''.join(cur))
    return [x.strip() for x in out if x.strip()]

# ── 색 ──
HEX = r'#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])'
RGB = r'rgba?\(\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*(?:[,/]\s*[\d.]+%?\s*)?\)'
NAMED = {'white': (255, 255, 255), 'black': (0, 0, 0)}
COLRE = re.compile(f'({HEX}|{RGB}|\\b(?:white|black)\\b)', re.I)

def parse_color(t):
    t = t.strip(); tl = t.lower()
    if tl in NAMED: return NAMED[tl], 1.0
    if tl.startswith('#'):
        h = tl[1:]
        if len(h) in (3, 4): h = ''.join(ch * 2 for ch in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (r, g, b), a
    nums = re.findall(r'[\d.]+%?', tl)
    def comp(x): return float(x[:-1]) * 2.55 if x.endswith('%') else float(x)
    r, g, b = (comp(x) for x in nums[:3])
    a = 1.0
    if len(nums) > 3: a = float(nums[3][:-1]) / 100 if nums[3].endswith('%') else float(nums[3])
    return (round(r), round(g), round(b)), a

def lum(rgb):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = rgb
    return .2126 * ch(r) + .7152 * ch(g) + .0722 * ch(b)

def hexrgb(h):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

def fam(rgb):
    r, g, b = (v / 255 for v in rgb)
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    if ss < .32 or ll < .06 or ll > .97: return 'gray'
    deg = hh * 360
    if 75 <= deg < 175: return 'green'
    if 175 <= deg < 252: return 'blue'
    if 252 <= deg < 335: return 'purple'
    if 38 <= deg < 75: return 'yellow'
    return 'red'

# 청록 판 색(고르신 100가지 안 · docs/design/palette-2026-10-25/perplexity-bottom-100.json)
INK, INK2, SUB = '#F2F3F3', '#E2E5E6', '#AAC1C5'
CYAN = '#1FB8CD'
def gray_map(L, role):
    if role == 'shadow':
        return None if L < .5 else '#171615'
    if role == 'border':
        if L < .2: return '#8CA3A7'
        if L < .5: return '#6A8184'
        if L < .8: return '#3E737A'
        return '#2D393A'
    # 글 · 바탕 · 칠 — 밝기를 뒤집음
    if L >= .93: return '#1C2627'
    if L >= .8: return '#253233'
    if L >= .6: return '#2D393A'
    if L >= .4: return '#3C4E51'
    if L >= .22: return '#6A8184'
    if L >= .12: return '#8CA3A7'
    if L >= .05: return '#C8CDCE'
    if L >= .015: return INK2
    return INK

def map_one(rgb, role):
    f = fam(rgb)
    if f == 'gray': return gray_map(lum(rgb), role)
    if f == 'green': return CYAN
    if f == 'blue': return SUB if role in ('text', 'border', 'stroke') else '#428189'
    if f == 'purple': return '#FFFFFF' if role == 'text' else SUB
    if f == 'yellow': return INK if role == 'text' else '#3C4E51'
    return INK2 if role == 'text' else '#4F666A'  # 빨강 쪽(드묾)

def fmt(hexc, a):
    if a >= .999: return hexc
    r, g, b = hexrgb(hexc)
    return f'rgba({r}, {g}, {b}, {round(a, 3)})'

def map_value(val, role):
    changed = [False]
    def rep(m):
        t = m.group(0)
        try: rgb, a = parse_color(t)
        except Exception: return t
        if a == 0: return t
        nc = map_one(rgb, role)
        if nc is None: return t
        out = fmt(nc, a)
        if out.lower() != t.lower(): changed[0] = True
        return out
    nv = COLRE.sub(rep, val)
    return nv, changed[0]

TEXT = {'color', '-webkit-text-fill-color', 'caret-color', 'text-decoration-color', 'text-emphasis-color', '-webkit-text-stroke', '-webkit-text-stroke-color', 'accent-color'}
BG = {'background', 'background-color', 'background-image'}
FILL = {'fill', 'stop-color', 'flood-color'}
STROKE = {'stroke', 'outline', 'outline-color'}
BORDER = {'border', 'border-color', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-top-color', 'border-right-color',
          'border-bottom-color', 'border-left-color', 'border-block', 'border-inline', 'border-block-start', 'border-block-end',
          'border-inline-start', 'border-inline-end', 'border-block-color', 'border-inline-color', 'column-rule', 'column-rule-color',
          'text-decoration'}
SHADOW = {'box-shadow', 'text-shadow', 'filter'}
def role_of(prop):
    p = prop.lower()
    if p in TEXT: return 'text'
    if p in BG: return 'bg'
    if p in FILL: return 'bg'
    if p in STROKE: return 'stroke'
    if p in BORDER: return 'border'
    if p in SHADOW: return 'shadow'
    if p.startswith('--'):
        if re.search(r'(ink|fg|text|txt|col|fore)', p): return 'text'
        if re.search(r'(line|hair|bd|border|rule|seam)', p): return 'border'
        if re.search(r'(shadow|glow)', p): return 'shadow'
        return 'bg'
    return None

def decls_of(body):
    out = []
    for d in split_top(body, ';'):
        if ':' not in d: continue
        k, v = d.split(':', 1)
        out.append((k.strip(), v.strip()))
    return out

KAKAO_YELLOW = re.compile(r'#(?:FEE500|FAE100|FFE812|FEE600|F9E000)\b', re.I)

# ── 1. 흰 판 규칙 모으기(맨 규칙 중 흰 판이 같은 것을 덮은 칸은 건너뜀) ──
def walk(nodes, wrap, out):
    for kind, pre, body in nodes:
        if kind == 'at':
            walk(body, wrap + [pre], out)
        elif kind == 'rule':
            out.append((tuple(wrap), pre, body))

rules = []
for f in SRC:
    nodes, _ = parse(strip_comments(open(f, encoding='utf-8').read()))
    walk(nodes, [], rules)

WHITE_RE = re.compile(r'^html\.white(?![\w-])')
covered = set()  # (wrap, 맨 선택자, 칸) — 흰 판이 덮은 것
for wrap, pre, body in rules:
    for sel in split_top(pre, ','):
        if WHITE_RE.match(sel):
            rest = WHITE_RE.sub('', sel, 1).strip()
            for k, _ in decls_of(body):
                covered.add((rest, k.lower()))

SKIP_SEL = re.compile(r'^(?:html\.white|:root|html|html\.white\.home|html\.m4)$')
out_blocks = {}  # wrap → 줄들
nrule = ndecl = 0
for wrap, pre, body in rules:
    sels = split_top(pre, ',')
    ds = decls_of(body)
    if any(KAKAO_YELLOW.search(v) for _, v in ds): continue  # 카톡 노랑 칸은 통째로 그대로
    for sel in sels:
        if SKIP_SEL.match(sel) or sel.startswith(':root') or 'html.clock' in sel: continue
        # 무게(특정성): 흰 판 규칙 · html.○○ 규칙의 복제본은 원래보다 (0,1,0) · 맨 규칙의 복제본은 (0,0,1) 만 무겁게
        #   → 복제본이 제 원래를 이기면서도, 원래 이기던 흰 판 규칙(복제가 없는 var() 규칙 포함)을 맨 규칙 복제본이 넘지 않음
        if sel.startswith('html') and not WHITE_RE.match(sel):  # html.en … 같은 것
            if sel[4:5].isalnum() or sel[4:5] == '-': continue
            new = 'html.clock' + sel[4:]; pref = True
        elif WHITE_RE.match(sel):
            new = WHITE_RE.sub('html.white.clock', sel, 1); pref = True
        else:
            new = 'html:where(.white.clock) ' + sel; pref = False
        lines = []
        for k, v in ds:
            role = role_of(k)
            if role is None: continue
            if not pref and (sel, k.lower()) in covered: continue
            imp = v.lower().endswith('!important')
            nv, ch = map_value(v, role)
            if ch: lines.append(f'{k}: {nv}')
        if lines:
            out_blocks.setdefault(wrap, []).append(f'{new} {{ ' + '; '.join(lines) + '; }')
            nrule += 1; ndecl += len(lines)

# ── 1-2. 흰 판 토큰(html.white 블록의 --이름)도 같은 셈으로 — 손으로 쓴 판(EXTRA)이 뒤에서 덮음 ──
tok = []
for wrap, pre, body in rules:
    if wrap or pre.strip() != 'html.white': continue
    for k, v in decls_of(body):
        if not k.startswith('--'): continue
        nv, ch = map_value(v, role_of(k) or 'bg')
        if ch: tok.append(f'{k}: {nv}')
TOKENS = 'html.white.clock.clock.clock { ' + '; '.join(tok) + '; }\n' if tok else ''

# ── 2. 손으로 쓴 판(토큰 · 망점 벽 · 위 막대 · 아래 단추 줄 · 첫 화면 네 칸) ──
EXTRA = r"""
/* ── 손으로 쓴 판(clock_theme.py EXTRA) ── */
html.white.clock.clock.clock {
  color-scheme: dark;
  --bg: #152D30; --night: #152D30; --band: #152D30; --violet: #F2F3F3;
  --card: #1C2627; --card2: #203235; --card3: #2D393A;
  --hair: #8CA3A7; --hair2: #8CA3A7; --line: #2D393A; --hair-soft: #253233; --seam: #2D393A; --press: #2D393A; --lift: #1C2627;
  --ink: #F2F3F3; --ink-hi: #FFFFFF; --sub: #E2E5E6; --mute: #C8CDCE; --flat: #C8CDCE;
  --violet-ink: #F2F3F3; --violet-wash: #1C2627; --violet-line: #8CA3A7; --violet-glow: #203235;
  --gold: #1FB8CD; --gold-wash: #203235; --gold-line: #1FB8CD;
  --up: #1FB8CD; --down: #AAC1C5; --up-ink: #1FB8CD; --down-ink: #AAC1C5; --up-bg: #1FB8CD; --down-bg: #428189;
  --up-fill: rgba(31, 184, 205, .2); --down-fill: rgba(170, 193, 197, .18); --up-fade: rgba(31, 184, 205, .07); --down-fade: rgba(170, 193, 197, .06);
  --lacquer: #152D30; --lacquer-ink: #F2F3F3; --lacquer-sub: #E2E5E6; --lacquer-gold: #1FB8CD;
  --moon: #F2F3F3; --moonrow: #203235;
  --m4-band: #1C2627; --m4-line: #6A8184; --m4-soft: #6A8184;
  background: #152D30;
}
html.white.clock.clock.clock body { background: #152D30; color: #F2F3F3; isolation: isolate; } /* 몸이 쌓임 판이 되어야 망점 벽(body::after · z -1)이 몸 바탕 위 · 글 아래에 그려짐 */
/* 망점 벽 — 어젯밤 돌 시계 판(docs/design/dori-new-2026-10-25/clock/parts.py .wall) 그대로 · 화면에 붙어 있음 */
html.white.clock.clock.clock body::after { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(rgba(170, 193, 197, .09) 1.2px, transparent 1.65px) 0 0 / 8.6px 8.6px,
    radial-gradient(ellipse 110vw 90vh at 50% 62%, #27666E 0%, #1D5962 22%, #1A4850 42%, #17363B 62%, #152D30 80%, #171615 100%); }
/* 위 막대 — 짙은 청록 · 「돌이」 흰 큰 글 + 청록 그림자 · 단추는 흰 알약(검은 테 · 어긋난 그림자) */
html.white.clock.clock.clock .top { background: rgba(21, 45, 48, .94); border-bottom: 1px solid rgba(242, 243, 243, .18); }
html.white.clock.clock.clock .top .logo { color: #FFFFFF; font-weight: 900; text-shadow: 3px 3px 0 #4E99A3; }
html.white.clock.clock.clock .top .logo img { display: none; }
html.white.clock.clock.clock .top .tbtn, html.white.clock.clock.clock .top .ibtn { background: #F2F3F3; color: #171615; border: 2px solid #171615; box-shadow: 3px 3px 0 #171615; }
html.white.clock.clock.clock .top .ibtn svg, html.white.clock.clock.clock .top .tbtn svg { color: #171615; stroke: currentColor; }
html.white.clock.clock.clock .top #giftBtn { background: #AAC1C5; }
/* 아래 단추 줄 — 밝은 회청 반투명 띠 · 흰 글 */
html.white.clock.clock.clock .tabs { background: rgba(28, 38, 39, .96); border-top: 2px solid rgba(242, 243, 243, .3); }
html.white.clock.clock.clock .tabs a { color: #F2F3F3; }
html.white.clock.clock.clock .tabs a[aria-current="page"], html.white.clock.clock.clock .tabs a.on { color: #1FB8CD; }
/* 첫 화면 네 칸 — 그림처럼 싹 하늘청록 · 꽃 밝은 회청 · 잠잠 짙은 청록 · 시듦 회색 · 검은 테 · 어긋난 그림자 · 망점 */
html.white.clock.clock.clock .th-zc { border: 3px solid #171615; box-shadow: 5px 5px 0 #171615; isolation: isolate; overflow: hidden; }
html.white.clock.clock.clock .th-zc::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: radial-gradient(circle, var(--zdot) 0 34%, transparent 39%); background-size: 9px 9px; opacity: .55; }
html.white.clock.clock.clock .th-zc.th-zcS { --zdot: #F2F3F3; background: #1FB8CD; border-color: #171615; color: #152D30; box-shadow: 5px 5px 0 #171615, 9px 9px 0 #FFFFFF; }
html.white.clock.clock.clock .th-zc.th-zcB { --zdot: #8CA3A7; background: #AAC1C5; color: #171615; }
html.white.clock.clock.clock .th-zc.th-zcQ { --zdot: #356369; background: #284E53; color: #E2E5E6; border-color: #AAC1C5; } /* 짙은 칸은 밝은 테(짙은 바탕 위 테 대비 3 넘게 — check_white ②) */
html.white.clock.clock.clock .th-zc.th-zcW { --zdot: #757A7B; background: #606868; color: #F2F3F3; border-color: #AAC1C5; } /* 그림은 #797F7F — 작은 「곳」 글 대비 4.5 넘게(check_white ②) 한 단 짙게 */
html.white.clock.clock.clock .th-zc:active { background: #2D393A; }
/* ── 첫 화면 고리(사장님 2026-10-26 08:16 「디자인 이렇게 하라고」 · 어젯밤 돌 시계 판 ①) — 위 싹 · 꽃 / 돌 시계 / 아래 잠잠 · 시듦 · 시계 방향 화살 넷 ── */
html.white.clock.clock.clock .th-zones { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "S B" "K K" "Q W"; column-gap: 16px; row-gap: 10px; }
html.white.clock.clock.clock .th-zones .th-zcS { grid-area: S; }
html.white.clock.clock.clock .th-zones .th-zcB { grid-area: B; }
html.white.clock.clock.clock .th-zones .th-zcQ { grid-area: Q; }
html.white.clock.clock.clock .th-zones .th-zcW { grid-area: W; }
html.white.clock.clock.clock .th-zones .s-clk { grid-area: K; display: flex; justify-content: center; margin: 0; }
html.white.clock.clock.clock .th-zones .th-zc { min-height: 96px; padding: 6px 10px 6px 4px; grid-template-columns: 72px minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 4px; row-gap: 0; align-items: end; border-radius: 14px; }
html.white.clock.clock.clock .th-zones .th-zi { grid-column: 1; grid-row: 1 / span 2; align-self: center; width: 72px; height: 72px; background: none; border: 0; border-radius: 0; }
html.white.clock.clock.clock .th-zones .th-zic { width: 72px; height: 72px; overflow: visible; }
html.white.clock.clock.clock .th-zones .th-zw { grid-column: 2; grid-row: 1; align-self: start; padding-top: 4px; font-size: 22px; font-weight: 900; letter-spacing: -.02em; }
html.white.clock.clock.clock .th-zones .th-zn { grid-column: 2; grid-row: 2; padding: 0; font-size: 44px; font-weight: 900; letter-spacing: -.05em; text-shadow: 3px 3px 0 var(--zoff); }
html.white.clock.clock.clock .th-zones .th-zu { font-size: 18px; text-shadow: none; }
html.white.clock.clock.clock .th-zones .th-zgo { display: none; }
html.white.clock.clock.clock .th-zc.th-zcS { --zoff: #FFFFFF; }
html.white.clock.clock.clock .th-zc.th-zcB { --zoff: #F2F3F3; }
html.white.clock.clock.clock .th-zc.th-zcQ { --zoff: #152D30; }
html.white.clock.clock.clock .th-zc.th-zcW { --zoff: #3C4E51; }
html.white.clock.clock.clock .th-sway { transform-box: view-box; transform-origin: 51.5% 24%; }
@media (prefers-reduced-motion: no-preference) { html.white.clock.clock.clock .th-sway { animation: ck-sway 3.2s ease-in-out infinite; } }
@keyframes ck-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
html.white.clock.clock.clock .th-ar { position: absolute; z-index: 2; width: 32px; height: 32px; border-radius: 50%; background: #FFFFFF; border: 2px solid #171615; box-shadow: 2px 2px 0 #171615; pointer-events: none; }
html.white.clock.clock.clock .th-ar svg { display: block; width: 100%; height: 100%; }
html.white.clock.clock.clock .th-ar-t { left: 50%; top: 32px; margin-left: -16px; }
html.white.clock.clock.clock .th-ar-b { left: 50%; bottom: 32px; margin-left: -16px; }
html.white.clock.clock.clock .th-ar-r { right: 2px; top: 50%; margin-top: -16px; }
html.white.clock.clock.clock .th-ar-l { left: 2px; top: 50%; margin-top: -16px; }
/* 그림 단추 넷 — 둥근 네모 · 검은 테 · 어긋난 그림자 · 망점(가상 칸이라 광택 검사 밖) · 「꽃 될 회사」 흰 숫자 딱지 */
html.white.clock.clock.clock .s-apps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin: 18px 0 44px; }
html.white.clock.clock.clock .s-app { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; min-height: 48px; color: #F2F3F3; text-decoration: none; }
html.white.clock.clock.clock .s-apb { position: relative; display: block; width: 66px; height: 66px; border-radius: 16px; border: 2.5px solid #171615; background: var(--abg); box-shadow: 4px 4px 0 #171615; overflow: hidden; }
html.white.clock.clock.clock .s-apb::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(23, 22, 21, .16) 28%, transparent 33%); background-size: 6px 6px; }
html.white.clock.clock.clock .s-apb svg { position: relative; display: block; width: 100%; height: 100%; }
html.white.clock.clock.clock .s-apl { font-size: 17px; font-weight: 800; line-height: 1.2; text-align: center; white-space: nowrap; color: #F2F3F3; text-shadow: 0 1px 3px #171615; }
html.white.clock.clock.clock .s-badge { position: absolute; z-index: 1; top: -8px; left: 50%; margin-left: 18px; width: max-content; min-width: 30px; height: 30px; padding: 0 6px; box-sizing: border-box; white-space: nowrap; border-radius: 15px; background: #FFFFFF; color: #152D30; border: 2px solid #171615; font-size: 17px; font-weight: 900; line-height: 26px; text-align: center; }
html.white.clock.clock.clock .s-app:active .s-apb { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #171615; }
@media (max-width: 359px) {
  html.white.clock.clock.clock .th-zones { column-gap: 12px; }
  html.white.clock.clock.clock .th-zones .th-zc { min-height: 84px; grid-template-columns: 52px minmax(0, 1fr); padding: 4px 8px 4px 2px; }
  html.white.clock.clock.clock .th-zones .th-zi, html.white.clock.clock.clock .th-zones .th-zic { width: 52px; height: 52px; }
  html.white.clock.clock.clock .th-zones .th-zw { font-size: 19px; }
  html.white.clock.clock.clock .th-zones .th-zn { font-size: 36px; }
  html.white.clock.clock.clock .th-zones .th-zu { font-size: 17px; }
  html.white.clock.clock.clock .th-ar { width: 28px; height: 28px; }
  html.white.clock.clock.clock .th-ar-t { top: 28px; margin-left: -14px; } html.white.clock.clock.clock .th-ar-b { bottom: 28px; margin-left: -14px; }
  html.white.clock.clock.clock .th-ar-r, html.white.clock.clock.clock .th-ar-l { margin-top: -14px; }
  html.white.clock.clock.clock .s-apb { width: 56px; height: 56px; border-radius: 14px; }
  html.white.clock.clock.clock .s-apl { white-space: normal; font-size: 17px; }
  html.white.clock.clock.clock .s-badge { margin-left: 12px; }
}
/* 영어 — 「industries」가 한 낱말 그대로 숫자 아래 한 줄(가운데서 끊기지 않게) */
html.white.clock.clock.clock.en .th-zones .th-zn { flex-direction: column; align-items: flex-start; row-gap: 0; }
html.white.clock.clock.clock.en .th-zones .th-zu { display: block; white-space: nowrap; overflow-wrap: normal; word-break: normal; font-size: 17px; line-height: 1.1; }
html.white.clock.clock.clock.en .th-zones .th-zw { font-size: 19px; }
@media (max-width: 359px) { html.white.clock.clock.clock.en .th-zones .th-zc { grid-template-columns: 42px minmax(0, 1fr); } html.white.clock.clock.clock.en .th-zones .th-zi, html.white.clock.clock.clock.en .th-zones .th-zic { width: 42px; height: 42px; } }
/* 여는 동안 돌 시계(index.html .s-boot)도 고리 가운데 시계 자리와 같게 — 다 그려져도 시계가 제자리(2026-10-26 이 방에서 잼: 390 · 375 = 242px · 320 = 227px) */
html.white.clock.clock.clock .s-boot { margin-top: 178px; }
@media (max-width: 359px) { html.white.clock.clock.clock .s-boot { margin-top: 163px; } }
/* 밝게 바뀐 단추(옛 검은 단추) 위 작은 강조 글은 짙게 — 하늘청록은 밝은 바탕 위 대비가 모자람 */
html.white.clock.clock.clock .th-next small, html.white.clock.clock.clock .th-nx small { color: #152D30; }
/* 편지 띠(보유종목 아래 「돌이 주식 격언」) — 짙은 띠라 밝은 테(단추 테 대비 3 · check_white ⑤) */
html.white.clock.clock.clock a.hello.m4-letter { border: 2px solid #8CA3A7; }
/* 그림 속 검은 · 흰 칠(svg 칠 속성) — 돌 시계 바늘은 그대로 */
html.white.clock.clock.clock :is([fill="#000"], [fill="#000000"], [fill="black"], [fill="#111"], [fill="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *) { fill: #F2F3F3; }
html.white.clock.clock.clock :is([stroke="#000"], [stroke="#000000"], [stroke="black"], [stroke="#111"], [stroke="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *) { stroke: #F2F3F3; }
html.white.clock.clock.clock :is([fill="#fff"], [fill="#FFF"], [fill="#ffffff"], [fill="#FFFFFF"], [fill="white"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *) { fill: #1C2627; }
html.white.clock.clock.clock :is([fill="#007A35"], [fill="#007a35"]) { fill: #1FB8CD; }
html.white.clock.clock.clock :is([stroke="#007A35"], [stroke="#007a35"]) { stroke: #1FB8CD; }
html.white.clock.clock.clock :is([stroke="#1E4FC2"], [stroke="#1e4fc2"]) { stroke: #AAC1C5; }
html.white.clock.clock.clock :is([fill="#1E4FC2"], [fill="#1e4fc2"]) { fill: #AAC1C5; }
"""

def block(wrap, lines):
    s = '\n'.join(lines)
    for w in reversed(wrap):
        s = f'{w} {{\n{s}\n}}'
    return s

head = ('/* 돌 시계 청록 판 — scripts/atlas11/next/clock_theme.py 가 지은 파일(손으로 고치지 않음)\n'
        ' * 사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 · 08:23 「더 빠른 방식 찾아서 9시까지 모든 싸이트 되게 해」\n'
        f' * 읽은 파일 {len(SRC)}개 · 바꾼 규칙 {nrule}개 · 바꾼 칸 {ndecl}개 */\n')
body = '\n'.join(block(w, ls) for w, ls in out_blocks.items())
open(OUT, 'w', encoding='utf-8').write(head + body + '\n' + TOKENS + EXTRA)
print('files', len(SRC), 'rules', nrule, 'decls', ndecl, 'bytes', len(head + body + EXTRA))
