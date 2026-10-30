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
# ★ 2026-10-29 밤 무대 판(사장님 16:57 「이 거 색 그리고 느씸 180가지 분석해서 둘리에 백경색 글씨색으로 적용시켜」 · 무대 사진 — docs/design/neon-2026-10-29/)
#   기본은 밤 무대(PAL='neon') — 바탕 짙은 남보라 #0C081D · 글 #F2EFF9 · 강조 분홍 빛 줄 #F06FCB · 위 · 아래 막대 #070514 · 오름 #FF5A65 · 내림 #5B96FF(숫자만)
#   흰 판 색은 밝기를 뒤집어(청록 판처럼) 밤 색 안으로 · 핑크 판 손 규칙(EXTRA_PINK)과 첫 화면 home-new.css 는 핑크 → 밤 색 표(PN_*)로 옮겨 한 단 위(.clock 하나 더 · 첫 화면은 .home 까지)에서 덮음
#   칸마다 바탕 · 글이 함께 있으면 글 대비 4.5 아래일 때 밝은 글 · 짙은 글 가운데 대비가 큰 쪽으로(fix_contrast) · 옛 핑크 판으로 되돌리기: --pink
# ★ 2026-10-28 최고급 핑크 판(사장님 12:00 「안돼 배경을 최고급 핑크로 해」 · 13:16 「속도빨리해서 얼른 만들엉」) — 이제 기본은 핑크(PAL='pink')
#   핑크 판은 밝은 판이라 밝기를 뒤집지 않음(흰 바탕 → 밝은 카드 · 검은 글 → 짙은 자주) · 청록 판 손 규칙(EXTRA)의 자리 · 크기는 그대로 두고
#   색만 한 단 위(html.white.clock.clock.clock.clock)의 EXTRA_PINK 가 덮음 · 첫 화면 핑크 칸(home-new.css)은 그보다 뒤에 읽혀 같은 무게에서 이김
#   옛 청록 판으로 되돌리기: python3 scripts/atlas11/next/clock_theme.py --teal
#   home-new.css(이미 핑크) · p-why.css(「왜 사?」 그림 판 — 제 색 이름을 가짐 · EXTRA_PINK 가 짙은 자리만 바꿈)는 셈 밖 · 선택자에 clock 이 든 규칙도 셈 밖(이미 판 위 규칙)
import os, re, sys, glob, colorsys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SRC = sorted(f for f in glob.glob(os.path.join(ROOT, 'site/next/*.css')) if not f.endswith(('/clock.css', '/home-new.css', '/home-talk.css', '/p-why.css', '/p-sage.css')))  # p-sage.css(서른아홉 스승 · 2026-10-29 19:14)는 판 색 이름(var(--card) …)만 쓰고 제 걸음 빛 넷을 가짐 — 셈 밖
PAL = 'teal' if '--teal' in sys.argv[1:] else 'pink' if '--pink' in sys.argv[1:] else 'neon'  # 기본 = 밤 무대 판(2026-10-29 16:57) · 옛 핑크 --pink · 옛 청록 --teal
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
GOLD = '#D6D5D4'  # 금빛 글(뜻 있는 곳 · 「?」) — 고르신 100가지 안 · 오름(하늘청록) · 내림(#AAC1C5) · 보통 글(#F2F3F3)과 다른 색
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

def map_teal(rgb, role):
    f = fam(rgb)
    if f == 'gray': return gray_map(lum(rgb), role)
    if f == 'green': return CYAN
    if f == 'blue': return SUB if role in ('text', 'border', 'stroke') else '#428189'
    if f == 'purple': return GOLD if role == 'text' else SUB  # 흰 판 금빛(보라) 글 = 청록 판 금빛(은빛 회색) — 오름 하늘청록 · 내림 밝은 회청과 다른 색(check_surge 색 가름)
    if f == 'yellow': return GOLD if role == 'text' else '#3C4E51'
    return INK2 if role == 'text' else '#4F666A'  # 빨강 쪽(드묾)

# ── 최고급 핑크 판 색(첫 화면 home-new.css 와 같은 색) — 밝기를 뒤집지 않음 ──
P_CARD, P_TINT, P_CARD3, P_LINE = '#FFF7F9', '#FBE8EE', '#F4D9E1', '#EBC0CE'
P_HAIR = '#9E5A78'  # 단추 · 칸 테 — 바탕 #F7D4DE 위 3.7 · 카드 위 4.8(check_white 테 대비 3)
P_INK, P_INK2, P_SUB, P_MUTE = '#2A1420', '#4A2333', '#5E3446', '#6B3F52'  # 글 — 바탕 위 16 · 11 · 7.5 · 6.3
P_ACC, P_WINE, P_UP, P_DN, P_BROWN = '#A31F70', '#3D1028', '#B4123A', '#1A55B0', '#8C4A12'  # 내림 파랑은 핑크 바탕 위 5.2(첫 화면 #1F5FBF 는 카드 위라 5.8 · 바탕 위는 4.47 — check_white 1차 #/shorts · #/w/005930)
def gray_pink(L, role):
    if role == 'shadow': return None
    if role == 'border':
        if L < .45: return P_HAIR
        if L < .7: return '#C98AA3'
        return '#E9BCCB'
    if role == 'text':
        if L >= .93: return '#FFFFFF'
        if L >= .6: return P_CARD  # 밝은 글(짙은 칸 위)
        if L >= .12: return P_MUTE
        if L >= .05: return P_SUB
        if L >= .015: return P_INK2
        return P_INK
    if L >= .93: return P_CARD  # 바탕 · 칠 · 선
    if L >= .8: return P_TINT
    if L >= .6: return P_CARD3
    if L >= .4: return '#E7A9C0'
    if L >= .22: return '#B9748F'
    if L >= .12: return '#8A4A66'
    if L >= .05: return P_SUB
    if L >= .015: return P_WINE
    return P_INK

def map_pink(rgb, role):
    f = fam(rgb); L = lum(rgb)
    if f == 'gray': return gray_pink(L, role)
    if role == 'shadow': return None
    if f == 'blue':
        if role == 'bg': return P_DN if L < .3 else '#DCE6F7'
        return P_DN if L < .5 or role == 'text' else '#C9D6EE'
    if f == 'red':
        if role == 'bg': return P_UP if L < .35 else '#F9DCE5'
        return P_UP
    if f == 'yellow':
        if role == 'text': return P_INK if L < .2 else P_BROWN
        if role == 'bg': return '#FCEBD5' if L >= .45 else P_BROWN
        return P_ACC  # 금빛 테 · 선 → 짙은 장미
    # 초록(흰 판 오름 · 자라남) · 보라(흰 판 금빛 · 뜻 표시) → 짙은 장미(빨강 쪽이 아니라 숫자 아닌 글에도 씀 · check_white ④)
    if role == 'bg': return P_ACC if L < .3 else '#F2B8C9'
    return P_ACC

# ── 밤 무대 판 색(사장님 2026-10-29 16:57 · 사진에서 잰 색 docs/design/neon-2026-10-29/palette.json — 글 대비 38쌍 모두 기준 넘음) ──
N_BG, N_BAR, N_CARD, N_CARD2, N_CARD3, N_PLUM = '#0C081D', '#070514', '#1C1136', '#241540', '#2E1A4A', '#412649'
N_LINE, N_HAIR = '#3A2756', '#A58BC2'  # 옅은 나눔 줄 · 단추 · 칸 테(바탕 · 칸 위 대비 3 넘게)
N_INK, N_INK2, N_SUB, N_MUTE = '#F2EFF9', '#E4DDF0', '#CFC4E0', '#B6A8CB'
N_ACC, N_NEON, N_SMOKE, N_CYAN, N_UP, N_DN = '#F06FCB', '#C767B1', '#8B477B', '#94BFDB', '#FF5A65', '#5B96FF'
N_WASH, N_UPW, N_DNW = '#2A1440', '#3A1630', '#1E2C5A'  # 옅은 강조 면 · 옅은 오름 면 · 옅은 내림 면
N_ACC_BG = '#C42F98'  # 큰 단추 · 번호 동그라미 바탕(흰 글 대비 5.0 · 바탕 위 4.1) — 밝은 강조 #F06FCB 는 글 · 선에만(흰 글이 2.7 이라)
def gray_neon(L, role):  # 흰 판 회색 — 밝기를 뒤집음(흰 바탕 → 짙은 칸 · 검은 글 → 밝은 글 · 검은 단추 → 밝은 알약)
    if role == 'shadow': return None if L < .5 else N_BAR
    if role == 'border':
        if L < .2: return N_HAIR
        if L < .5: return '#8E78AE'
        if L < .8: return '#5E4A7E'
        return N_LINE
    if role == 'text':
        if L >= .93: return N_BG
        if L >= .6: return N_CARD3
        if L >= .3: return '#9A88B8'
        if L >= .12: return N_MUTE
        if L >= .05: return N_SUB
        if L >= .015: return N_INK2
        return N_INK
    if L >= .93: return N_CARD
    if L >= .8: return N_CARD2
    if L >= .6: return N_CARD3
    if L >= .4: return N_PLUM
    if L >= .22: return '#7F587D'
    if L >= .12: return '#9A88B8'
    if L >= .05: return N_SUB
    if L >= .015: return N_INK2
    return N_INK

def map_neon(rgb, role):
    f = fam(rgb); L = lum(rgb)
    if f == 'gray': return gray_neon(L, role)
    if role == 'shadow': return None
    if f == 'blue':
        if role == 'bg': return N_DN if L < .3 else N_DNW
        return N_DN
    if f == 'red':
        if role == 'bg': return N_UP if L < .35 else N_UPW
        return N_UP
    if role == 'bg': return N_ACC_BG if L < .3 else N_WASH  # 초록(흰 판 오름 · 자라남) · 보라(흰 판 금빛 · 뜻) · 노랑(금빛) → 분홍 빛 줄 강조
    return N_ACC

# 핑크 판 색 → 밤 색(손 규칙 EXTRA_PINK · 첫 화면 home-new.css) — 표에 없으면 극 없는 셈(neon_free): 바탕은 늘 짙게 · 글은 늘 밝게
PN_BG = {'#F7D4DE': N_BG, '#FFF7F9': N_CARD, '#FBE8EE': N_CARD2, '#F4D9E1': N_CARD3, '#EBC0CE': N_LINE, '#F0CBD6': N_CARD3, '#FFFFFF': N_CARD2, '#FEFEFE': N_CARD2,
         '#E7A9C0': '#7A3A79', '#F2B8C9': N_SMOKE, '#F7CAD8': '#67325F', '#D99AB2': '#9F4D87', '#ECDDE3': N_CARD3, '#D98DAB': '#7F587D', '#D9C6CE': N_LINE,
         '#EDB4C7': '#7A3A79', '#F2BFCF': '#67325F', '#F6CBD8': '#4F2A5C', '#F9D7E1': '#3A2556', '#FBE3EA': N_CARD3, '#FCEAF0': N_CARD2, '#F1C4D2': N_CARD3,
         '#3D1028': N_BAR, '#2A0B1C': N_BAR, '#1A0B13': N_BAR, '#5A1A3C': N_CARD2, '#A31F70': N_ACC_BG, '#C2457F': '#B23A8E', '#8A1B5E': '#8E2C78', '#7A1238': N_ACC_BG,
         '#B2456F': '#9F4D87', '#9C3A62': '#8B477B', '#873055': '#7A3A79', '#722748': '#67325F', '#5E1F3C': '#4F2A5C',
         '#FAD9E1': '#4A1830', '#D3E1F6': '#1E2C5A', '#DCE6F7': '#1E2C5A', '#C9D6EE': '#1E2C5A', '#F9DCE5': '#3A1630', '#FBF2F5': '#160E2B', '#FCEBD5': N_WASH,
         '#E3B6C5': N_LINE, '#C98AA3': '#5E4A7E', '#B9748F': '#7F587D', '#F0D3DD': N_CARD3, '#FBE9EC': N_CARD2, '#FBE6EB': N_CARD2, '#F2D5DE': N_CARD2,
         '#B4123A': N_UP, '#1A55B0': N_DN, '#1F5FBF': N_DN, '#2A1420': N_INK, '#4A2333': N_INK2, '#5E3446': N_SUB, '#6B3F52': N_MUTE, '#9E5A78': N_HAIR, '#8C4A12': N_ACC}
PN_TEXT = {'#2A1420': N_INK, '#1A0B13': '#FFFFFF', '#4A2333': N_INK2, '#5E3446': N_SUB, '#6B3F52': N_MUTE, '#3D1028': N_INK, '#A31F70': N_ACC, '#7A1238': N_ACC,
           '#8C4A12': N_ACC, '#FFFFFF': '#FFFFFF', '#FFF7F9': N_INK, '#F7D4DE': N_INK2, '#F2D5DE': N_INK2, '#F2B8C9': N_ACC, '#B4123A': N_UP, '#1A55B0': N_DN, '#1F5FBF': N_DN,
           '#9E5A78': N_MUTE, '#B9748F': N_MUTE}
PN_LINE = {'#9E5A78': N_HAIR, '#3D1028': N_HAIR, '#1A0B13': N_BAR, '#FFFFFF': N_HAIR, '#A31F70': N_ACC, '#EBC0CE': N_LINE, '#F0CBD6': N_LINE, '#E9BCCB': N_LINE,
           '#E3B6C5': N_LINE, '#C98AA3': '#8E78AE', '#B9748F': '#8E78AE', '#F7D4DE': N_BG, '#2A1420': N_INK, '#B4123A': N_UP, '#1A55B0': N_DN, '#1F5FBF': N_DN}

def neon_free(rgb, role):  # 극 없는 셈(맥락을 모르는 핑크 · 청록 때 색) — 바탕 · 칠은 늘 짙게 · 글은 늘 밝게 · 테는 라벤더
    f = fam(rgb); L = lum(rgb)
    if role == 'shadow': return None
    if f == 'blue': return N_DN if role != 'bg' else (N_DN if L < .3 else N_DNW)
    if f == 'red': return N_UP if role != 'bg' else (N_UP if L < .35 else N_UPW)
    if f in ('green', 'purple', 'yellow'):
        if role == 'bg': return N_ACC_BG if L < .3 else N_WASH
        return N_ACC
    if role == 'text':
        if L >= .6 or L < .015: return N_INK
        if L < .05: return N_INK2
        if L < .2: return N_SUB
        return N_MUTE
    if role in ('border', 'stroke'): return N_HAIR if (L < .5) else N_LINE
    if L >= .93: return N_CARD
    if L >= .8: return N_CARD2
    if L >= .6: return N_CARD3
    if L >= .3: return N_PLUM
    if L >= .05: return N_CARD3
    return N_CARD

def map_pn(rgb, role):
    h = '#%02X%02X%02X' % tuple(rgb)
    if role == 'text' and h in PN_TEXT: return PN_TEXT[h]
    if role in ('border', 'stroke') and h in PN_LINE: return PN_LINE[h]
    if role == 'bg' and h in PN_BG: return PN_BG[h]
    if role == 'shadow': return None
    return neon_free(rgb, role)

def map_one(rgb, role):
    return {'pink': map_pink, 'teal': map_teal, 'neon': map_neon}[PAL](rgb, role)

def first_color(v):
    m = COLRE.search(v or '')
    if not m: return None
    try:
        rgb, a = parse_color(m.group(0))
    except Exception: return None
    return rgb if a >= .6 else None

def cratio(a, b):
    x, y = lum(a), lum(b); return (max(x, y) + .05) / (min(x, y) + .05)

def fix_contrast(decls):
    """[(이름, 값)] — 같은 칸에 바탕과 글이 함께 있고 글 대비가 4.5 아래면 밝은 글 · 짙은 글 가운데 대비가 큰 쪽으로(밤 판에서만)"""
    bg = next((first_color(v) for k, v in decls if k.lower() in ('background', 'background-color') and first_color(v)), None)
    if bg is None: return decls
    out = []
    for k, v in decls:
        if k.lower() == 'color':
            fg = first_color(v)
            if fg is not None and cratio(fg, bg) < 4.5 and 'var(' not in v:
                best = max((N_INK, N_BG, '#FFFFFF'), key=lambda c: cratio(hexrgb(c), bg))
                v = best + (' !important' if v.lower().endswith('!important') else '')
        out.append((k, v))
    return out

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
        if SKIP_SEL.match(sel) or sel.startswith(':root') or 'clock' in sel: continue  # clock 이 든 규칙(첫 화면 핑크 칸 등)은 이미 판 위 규칙
        # 무게(특정성): 흰 판 규칙 · html.○○ 규칙의 복제본은 원래보다 (0,1,0) · 맨 규칙의 복제본은 (0,0,1) 만 무겁게
        #   → 복제본이 제 원래를 이기면서도, 원래 이기던 흰 판 규칙(복제가 없는 var() 규칙 포함)을 맨 규칙 복제본이 넘지 않음
        if sel.startswith('html') and not WHITE_RE.match(sel):  # html.en … 같은 것
            if sel[4:5].isalnum() or sel[4:5] == '-': continue
            new = 'html.clock' + sel[4:]; pref = True
        elif WHITE_RE.match(sel):
            new = WHITE_RE.sub('html.white.clock', sel, 1); pref = True
        else:
            new = 'html:where(.white.clock) ' + sel; pref = False
        lines = []; got = []
        for k, v in ds:
            role = role_of(k)
            if role is None: continue
            if not pref and (sel, k.lower()) in covered: continue
            imp = v.lower().endswith('!important')
            nv, ch = map_value(v, role)
            if ch: got.append((k, nv))
        if PAL == 'neon' and got: got = fix_contrast(got)
        lines = [f'{k}: {nv}' for k, nv in got]
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
  --gold: #D6D5D4; --gold-wash: #203235; --gold-line: #1FB8CD;
  --up: #1FB8CD; --down: #AAC1C5; --up-ink: #1FB8CD; --down-ink: #AAC1C5; --up-bg: #1FB8CD; --down-bg: #428189;
  --up-fill: rgba(31, 184, 205, .2); --down-fill: rgba(170, 193, 197, .18); --up-fade: rgba(31, 184, 205, .07); --down-fade: rgba(170, 193, 197, .06);
  --lacquer: #152D30; --lacquer-ink: #F2F3F3; --lacquer-sub: #E2E5E6; --lacquer-gold: #D6D5D4;
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
html.white.clock.clock.clock .tabs { background: #1C2627; border-top: 2px solid rgba(242, 243, 243, .3); }
html.white.clock.clock.clock .tabs a { color: #F2F3F3; }
html.white.clock.clock.clock .tabs a[aria-current="page"], html.white.clock.clock.clock .tabs a.on { color: #1FB8CD; }
/* 아래 단추 줄 — 돌 시계 판 아래 줄처럼 그림을 둥근 네모(검은 테 · 어긋난 그림자 · 청록 단) 안에 · 지금 쪽은 하늘청록 */
html.white.clock.clock.clock .tabs a { gap: 3px; color: #F2F3F3; }
html.white.clock.clock.clock .tabs a .ic { width: 34px; height: 34px; padding: 5px; box-sizing: border-box; border-radius: 10px; border: 2px solid #171615; background: var(--tbg, #3E737A); color: #F2F3F3; box-shadow: 2px 2px 0 #171615; }
html.white.clock.clock.clock .tabs a.plus .ic { width: 38px; height: 38px; padding: 6px; color: #F2F3F3; }
html.white.clock.clock.clock .tabs a:nth-child(1) { --tbg: #4E99A3; }
html.white.clock.clock.clock .tabs a:nth-child(2) { --tbg: #428189; }
html.white.clock.clock.clock .tabs a:nth-child(3) { --tbg: #3E737A; }
html.white.clock.clock.clock .tabs a:nth-child(4) { --tbg: #356369; }
html.white.clock.clock.clock .tabs a:nth-child(5) { --tbg: #2D565B; }
html.white.clock.clock.clock .tabs a[aria-current="page"] { color: #FFFFFF; font-weight: 800; }
html.white.clock.clock.clock .tabs a[aria-current="page"] .ic { --tbg: #1FB8CD; color: #152D30; }
html.white.clock.clock.clock .top .logo { font-weight: 900; letter-spacing: 0; }
/* 회사 쪽 「이 회사로 왜 사?」 — 돌 시계 판 ④ 큰 하늘청록 단추(검은 테 · 어긋난 그림자 두 겹 · 큰 글) — 한 화면에 빛나는 곳 하나 */
html.white.clock.clock.clock a.why-go.cw { border-radius: 16px; background: #1FB8CD; color: #152D30; outline: 3px solid #171615; outline-offset: -3px; box-shadow: 4px 4px 0 #171615, 8px 8px 0 #FFFFFF; } /* 크기 · 자리는 그대로(테 = outline · 그림자는 자리 안 먹음 — 아래 단추 자리가 바뀌면 next_check 선 끌기가 위 막대를 누름) */
html.white.clock.clock.clock a.why-go.cw b { color: #152D30; font-weight: 900; }
html.white.clock.clock.clock a.why-go.cw i { color: #152D30; font-weight: 900; }
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
/* 아래 단추 넷 영어 이름(one month later · Past record)은 칸보다 길어 — 낱말 사이 두 줄로(넘침 0) */
html.white.clock.clock.clock.en .tabs a { white-space: normal; text-align: center; line-height: 1.1; overflow-wrap: anywhere; }
/* 돌이 단추 안(#/dori) — 큰 줄 · 어두운 청록 · 밝은 테 · 어긋난 그림자 */
html.white.clock.clock.clock .dm-it { border: 2px solid #8CA3A7; background: #284E53; color: #F2F3F3; box-shadow: 4px 4px 0 #171615; }
/* 싹 자리 전부(#/t/sprout · 돌 시계 판 ②) — 맨 앞 셋 큰 판(첫째 하늘청록 · 둘째 밝은 회청 · 셋째 청록) · 그 밖 업종 알약(어두운 청록 · 밝은 테) */
html.white.clock.clock.clock .th-tile { border: 3px solid #171615; background: #4B939D; color: #152D30; box-shadow: 4px 4px 0 #171615; }
html.white.clock.clock.clock .th-tile0 { background: #1FB8CD; box-shadow: 4px 4px 0 #171615, 8px 8px 0 #FFFFFF; }
html.white.clock.clock.clock .th-tile1 { background: #AAC1C5; }
html.white.clock.clock.clock .th-tile2 { background: #8CA3A7; }
html.white.clock.clock.clock .th-tn { color: #152D30; }
html.white.clock.clock.clock .th-tbadge { border: 2px solid #171615; background: #FFFFFF; color: #152D30; }
html.white.clock.clock.clock .th-chip { border: 2px solid #8CA3A7; background: #284E53; color: #F2F3F3; }
html.white.clock.clock.clock .th-chipmore { border-style: dashed; background: transparent; color: #E2E5E6; }
/* 꽃 될 회사(#/t/picks · 돌 시계 판 ③) — 묶음 줄마다 고르신 색 · 검은 테 · 어긋난 그림자 · 맨 위(가장 큰 묶음)는 하늘청록 · 어두운 줄은 흰 글 */
html.white.clock.clock.clock .th-pki { border: 3px solid #171615; border-radius: 14px; background: var(--pkbg); color: var(--pkink); box-shadow: 4px 4px 0 #171615; }
html.white.clock.clock.clock .th-pki0 { --pkbg: #1FB8CD; --pkink: #152D30; }
html.white.clock.clock.clock .th-pki1 { --pkbg: #AAC1C5; --pkink: #152D30; }
html.white.clock.clock.clock .th-pki2 { --pkbg: #8CA3A7; --pkink: #152D30; }
html.white.clock.clock.clock .th-pki3 { --pkbg: #3E737A; --pkink: #FFFFFF; }
html.white.clock.clock.clock .th-pki4 { --pkbg: #356369; --pkink: #FFFFFF; }
html.white.clock.clock.clock .th-pki5 { --pkbg: #2D565B; --pkink: #FFFFFF; }
html.white.clock.clock.clock .th-pkn, html.white.clock.clock.clock .th-pkk, html.white.clock.clock.clock .th-pkgo { color: var(--pkink); }
html.white.clock.clock.clock .th-pkcp { border: 2px solid #171615; background: #FFFFFF; color: #152D30; }
html.white.clock.clock.clock .th-pkmore { border-style: dashed; border-color: var(--pkink); background: transparent; color: var(--pkink); }
html.white.clock.clock.clock .th-pkday { color: #E2E5E6; }
html.white.clock.clock.clock .th-pkrec1 { border-left-color: #8CA3A7; color: #F2F3F3; }
/* 그림 단추 넷 — 둥근 네모 · 검은 테 · 어긋난 그림자 · 망점(가상 칸이라 광택 검사 밖) · 「꽃 될 회사」 흰 숫자 딱지 */
html.white.clock.clock.clock .s-apps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin: 18px 0 44px; }
html.white.clock.clock.clock .s-app { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; min-height: 48px; color: #F2F3F3; text-decoration: none; }
html.white.clock.clock.clock .s-apb { position: relative; display: block; width: 66px; height: 66px; border-radius: 16px; border: 2.5px solid #171615; background: var(--abg); box-shadow: 4px 4px 0 #171615; overflow: hidden; }
html.white.clock.clock.clock .s-app-bloom { --abg: #E2E5E6; }
html.white.clock.clock.clock .s-app-search { --abg: #4B939D; }
html.white.clock.clock.clock .s-app-cal { --abg: #8CA3A7; }
html.white.clock.clock.clock .s-app-help { --abg: #428189; }
html.white.clock.clock.clock .s-apb::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(23, 22, 21, .16) 28%, transparent 33%); background-size: 6px 6px; }
html.white.clock.clock.clock .s-apb svg { position: relative; display: block; width: 100%; height: 100%; }
html.white.clock.clock.clock .s-apl { font-size: 17px; font-weight: 800; line-height: 1.2; text-align: center; white-space: nowrap; color: #F2F3F3; text-shadow: 0 1px 3px #171615; }
html.white.clock.clock.clock .s-badge { position: absolute; z-index: 1; top: -8px; left: 50%; margin-left: 18px; width: max-content; min-width: 30px; height: 30px; padding: 0 6px; box-sizing: border-box; white-space: nowrap; border-radius: 15px; background: #FFFFFF; color: #152D30; border: 2px solid #171615; font-size: 17px; font-weight: 900; line-height: 26px; text-align: center; }
html.white.clock.clock.clock .s-app:active .s-apb { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #171615; }
/* 영어 이름은 넷 다 칸보다 길어 한 줄이면 서로 겹침(Find a company · Sprout calendar) — 낱말 사이에서 두 줄로 */
html.white.clock.clock.clock.en .s-apl { white-space: normal; word-break: keep-all; overflow-wrap: normal; line-height: 1.1; }
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
/* 쪽 제목 — 흰 큰 글 + 청록 어긋난 그림자(돌 시계 판 ② 「싹 37곳」 제목 꼴) */
html.white.clock.clock.clock .th-hd .th-h1, html.white.clock.clock.clock h1.st-h { color: #FFFFFF; font-weight: 900; text-shadow: 3px 3px 0 #3E737A; }
/* 다른 쪽 제목 옆 작은 돌 시계(stone-clock.js miniClock — 옛 돌 그림 자리 96 × 77 → 104 × 83) */
html.white.clock.clock.clock .th-hd .th-mclk { flex: none; width: 104px; height: 83px; margin-left: 8px; }
@media (max-width: 359px) { html.white.clock.clock.clock .th-hd .th-mclk { width: 84px; height: 67px; } }
html.white.clock.clock.clock .st-h .th-mclk.st-art { flex: none; width: 104px; height: 83px; }
@media (max-width: 359px) { html.white.clock.clock.clock .st-h .th-mclk.st-art { width: 84px; height: 67px; } }
/* 영어 — 「industries」가 한 낱말 그대로 숫자 아래 한 줄(가운데서 끊기지 않게) */
html.white.clock.clock.clock.en .th-zones .th-zn { flex-direction: column; align-items: flex-start; row-gap: 0; }
html.white.clock.clock.clock.en .th-zones .th-zu { display: block; white-space: nowrap; overflow-wrap: normal; word-break: normal; font-size: 17px; line-height: 1.1; }
html.white.clock.clock.clock.en .th-zones .th-zw { font-size: 19px; }
@media (max-width: 359px) { html.white.clock.clock.clock.en .th-zones .th-zc { grid-template-columns: 42px minmax(0, 1fr); } html.white.clock.clock.clock.en .th-zones .th-zi, html.white.clock.clock.clock.en .th-zones .th-zic { width: 42px; height: 42px; } }
/* 여는 동안 돌 시계(index.html .s-boot)도 고리 가운데 시계 자리와 같게 — 다 그려져도 시계가 제자리(2026-10-26 이 방에서 잼: 390 · 375 = 242px · 320 = 227px) */
html.white.clock.clock.clock .s-boot { margin-top: 178px; }
@media (max-width: 359px) { html.white.clock.clock.clock .s-boot { margin-top: 163px; } }
/* 낮은 화면 — 그림 단추 넷(꽃 될 회사 · 회사 찾기 · 싹 달력 · 고객센터)까지 첫 화면 한 번에
 *   사장님 2026-10-27(서울) 00:17 「밑에 꽃될 회사 회사찾기 싹달력 고객센터 이화면이 첫 화면에 한번에 보일 수 있는 글씨 크기로 줄여주고」
 *   높이 820 아래(아이폰 사파리 · 카톡 안 창 640 ~ 760) — 네 칸 두 줄 납작하게(그림 72 → 48 · 숫자 44 → 34 · 이름 22 → 19 · 글은 17 아래로 안 내림)
 *   그림 단추 66 → 56 · 틈 18 → 10 · 돌 시계는 남은 높이만큼(가장 작은 화면 높이 100svh 에서 다른 칸 높이 합 --ckk 를 뺌 · 104 ~ 218)
 *   여는 동안 돌 시계(.s-boot)도 같은 크기 · 같은 자리(다 그려져도 제자리) — 390 × 844 는 그대로(높이 820 위) */
@media (max-height: 820px) {
  html.white.clock.clock.clock { --ckk: 520px; --ckmax: 218px; --ckh: clamp(104px, calc(100vh - var(--ckk)), var(--ckmax)); }
  html.white.clock.clock.clock .th-zones { row-gap: 8px; margin-bottom: 0; } /* 아래 여백 16 은 그림 단추 위 틈 10 과 겹쳐 16 이 됨 — 0 으로 */
  html.white.clock.clock.clock .th-zones .th-zc { min-height: 0; padding: 3px 8px 3px 2px; grid-template-columns: 48px minmax(0, 1fr); }
  html.white.clock.clock.clock .th-zones .th-zi, html.white.clock.clock.clock .th-zones .th-zic { width: 48px; height: 48px; }
  html.white.clock.clock.clock .th-zones .th-zw { padding-top: 0; font-size: 19px; line-height: 1.1; }
  html.white.clock.clock.clock .th-zones .th-zn { font-size: 34px; line-height: 1; text-shadow: 2px 2px 0 var(--zoff); }
  html.white.clock.clock.clock .th-zones .th-zu { font-size: 17px; }
  html.white.clock.clock.clock .th-zones .s-art, html.white.clock.clock.clock .s-boot { width: calc(var(--ckh) * 272 / 218); height: var(--ckh); }
  html.white.clock.clock.clock .s-boot { margin-top: 153px; } /* 제목 30 + 돌이 물음 48 + 첫 줄 67 + 틈 8 */
  html.white.clock.clock.clock .th-ar-t { top: 15px; } html.white.clock.clock.clock .th-ar-b { bottom: 15px; }
  html.white.clock.clock.clock .s-apps { margin: 10px 0 44px; }
  html.white.clock.clock.clock .s-app { gap: 4px; }
  html.white.clock.clock.clock .s-apb { width: 56px; height: 56px; border-radius: 14px; }
  html.white.clock.clock.clock .s-badge { margin-left: 12px; }
}
@media (max-height: 820px) and (max-width: 359px) { html.white.clock.clock.clock { --ckk: 542px; --ckmax: 160px; } } /* 좁은 폭은 그림 단추 이름이 두 줄(+21) */
@media (max-height: 820px) and (max-width: 349px) { html.white.clock.clock.clock { --ckmax: 128px; } }
@media (max-height: 820px) { html.white.clock.clock.clock.en { --ckk: 575px; } } /* 영어는 칸마다 「industries」 한 줄(+19 × 2) · 그림 단추 이름 두 줄(+17) */
@media (max-height: 820px) and (max-width: 359px) { html.white.clock.clock.clock.en { --ckk: 580px; } }
@supports (height: 1svh) { @media (max-height: 820px) { html.white.clock.clock.clock { --ckh: clamp(104px, calc(100svh - var(--ckk) - env(safe-area-inset-bottom, 0px)), var(--ckmax)); } } }
/* 밝게 바뀐 단추(옛 검은 단추) 위 작은 강조 글은 짙게 — 하늘청록은 밝은 바탕 위 대비가 모자람 */
html.white.clock.clock.clock .th-next small, html.white.clock.clock.clock .th-nx small { color: #152D30; }
/* 편지 띠(보유종목 아래 「돌이 주식 격언」) — 짙은 띠라 밝은 테(단추 테 대비 3 · check_white ⑤) */
html.white.clock.clock.clock a.hello.m4-letter { outline: 2px solid #8CA3A7; outline-offset: -2px; } /* 테(border)는 글 시작을 2px 밀어 왼쪽 줄이 늘어남(check_hold ⑭) — 자리를 안 먹는 outline 으로 */
/* 그림 속 검은 · 흰 칠(svg 칠 속성) — 돌 시계 바늘은 그대로 */
html.white.clock.clock.clock :is([fill="#000"], [fill="#000000"], [fill="black"], [fill="#111"], [fill="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { fill: #F2F3F3; }
html.white.clock.clock.clock :is([stroke="#000"], [stroke="#000000"], [stroke="black"], [stroke="#111"], [stroke="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { stroke: #F2F3F3; }
html.white.clock.clock.clock :is([fill="#fff"], [fill="#FFF"], [fill="#ffffff"], [fill="#FFFFFF"], [fill="white"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { fill: #1C2627; }
html.white.clock.clock.clock :is([fill="#007A35"], [fill="#007a35"]) { fill: #1FB8CD; }
html.white.clock.clock.clock :is([stroke="#007A35"], [stroke="#007a35"]) { stroke: #1FB8CD; }
html.white.clock.clock.clock :is([stroke="#1E4FC2"], [stroke="#1e4fc2"]) { stroke: #AAC1C5; }
html.white.clock.clock.clock :is([fill="#1E4FC2"], [fill="#1e4fc2"]) { fill: #AAC1C5; }
"""

EXTRA_PINK = r'''
/* ── 최고급 핑크 판(사장님 2026-10-28 12:00 「안돼 배경을 최고급 핑크로 해」 · 13:16 「속도빨리해서 얼른 만들엉」 · clock_theme.py EXTRA_PINK) ──
   모든 쪽 = 첫 화면(home-new.css)과 같은 색 · 바로 위 청록 손 규칙(EXTRA)의 자리 · 크기는 그대로 두고 색만 한 단 위(.clock 하나 더)에서 덮음
   바탕 장미 빛 핑크 #F7D4DE · 카드 #FFF7F9 · 글 짙은 자주 #2A1420 · 강조 짙은 장미 #A31F70 · 위 · 아래 막대 포도주 빛 #3D1028 · 오름 #B4123A(숫자만) · 내림 #1A55B0 */
html.white.clock.clock.clock.clock {
  color-scheme: light;
  --bg: #F7D4DE; --night: #F7D4DE; --band: #F7D4DE; --violet: #2A1420;
  --card: #FFF7F9; --card2: #FBE8EE; --card3: #F4D9E1;
  --hair: #9E5A78; --hair2: #9E5A78; --line: #EBC0CE; --hair-soft: #F0CBD6; --seam: #EBC0CE; --press: #F4D9E1; --lift: #FFF7F9;
  --ink: #2A1420; --ink-hi: #1A0B13; --sub: #5E3446; --mute: #6B3F52; --flat: #6B3F52;
  --violet-ink: #2A1420; --violet-wash: #FBE8EE; --violet-line: #9E5A78; --violet-glow: #FBE8EE;
  --gold: #A31F70; --gold-wash: #FBE8EE; --gold-line: #A31F70;
  --up: #B4123A; --down: #1A55B0; --up-ink: #B4123A; --down-ink: #1A55B0; --up-bg: #B4123A; --down-bg: #1A55B0;
  --up-fill: rgba(180, 18, 58, .16); --down-fill: rgba(26, 85, 176, .14); --up-fade: rgba(180, 18, 58, .06); --down-fade: rgba(26, 85, 176, .05);
  --lacquer: #3D1028; --lacquer-ink: #FFFFFF; --lacquer-sub: #F7D4DE; --lacquer-gold: #F2B8C9;
  --moon: #2A1420; --moonrow: #FBE8EE;
  --m4-band: #FFF7F9; --m4-line: #9E5A78; --m4-soft: #9E5A78; --m4-neu: #4A2333; --m4-line2: #F0CBD6;
  background: #F7D4DE;
}
html.white.clock.clock.clock.clock body { background: #F7D4DE; color: #2A1420; }
html.white.clock.clock.clock.clock body::after { background: radial-gradient(ellipse 120vw 70vh at 50% 0%, #FCEAF0 0%, #F7D4DE 58%, #F1C4D2 100%); } /* 위에서 비치는 은은한 빛(바탕 한 장 · 검사 칸 밖) */
/* 위 막대 — 포도주 빛 · 흰 이름 · 밝은 알약 단추 */
html.white.clock.clock.clock.clock .top { background: rgba(61, 16, 40, .97); border-bottom: 1px solid rgba(255, 255, 255, .2); }
html.white.clock.clock.clock.clock .top .logo { color: #FFFFFF; text-shadow: none; }
html.white.clock.clock.clock.clock .top .tbtn, html.white.clock.clock.clock.clock .top .ibtn { background: #FFF7F9; color: #3D1028; border: 2px solid #FFFFFF; box-shadow: none; }
html.white.clock.clock.clock.clock .top .ibtn svg, html.white.clock.clock.clock.clock .top .tbtn svg { color: #3D1028; }
html.white.clock.clock.clock.clock .top #giftBtn { background: #F2B8C9; }
html.white.clock.clock.clock.clock .top #jhBtn { border: 1px solid #FFFFFF; background: #FFF7F9; color: #3D1028; }
/* 아래 단추 줄 — 포도주 빛 띠 · 장미 빛 그림 칸 · 지금 쪽은 밝은 핑크 칸 */
html.white.clock.clock.clock.clock .tabs { background: #3D1028; border-top: 2px solid rgba(255, 255, 255, .22); }
html.white.clock.clock.clock.clock .tabs a, html.white.clock.clock.clock.clock .tabs a[aria-current="page"], html.white.clock.clock.clock.clock .tabs a.on { color: #FFFFFF; }
html.white.clock.clock.clock.clock .tabs a .ic { border-color: #1A0B13; background: var(--tbg, #873055); color: #FFFFFF; box-shadow: none; }
html.white.clock.clock.clock.clock .tabs a:nth-child(1) { --tbg: #B2456F; } html.white.clock.clock.clock.clock .tabs a:nth-child(2) { --tbg: #9C3A62; } html.white.clock.clock.clock.clock .tabs a:nth-child(3) { --tbg: #873055; }
html.white.clock.clock.clock.clock .tabs a:nth-child(4) { --tbg: #722748; } html.white.clock.clock.clock.clock .tabs a:nth-child(5) { --tbg: #5E1F3C; }
html.white.clock.clock.clock.clock .tabs a[aria-current="page"] .ic { --tbg: #F7D4DE; color: #3D1028; }
html.white.clock.clock.clock.clock footer.foot a { color: #4A2333; }
/* 회사 쪽 「이 회사로 왜 사?」 큰 단추 — 짙은 장미 · 흰 글 */
html.white.clock.clock.clock.clock a.why-go.cw { background: #A31F70; color: #FFFFFF; outline-color: #3D1028; box-shadow: none; }
html.white.clock.clock.clock.clock a.why-go.cw b, html.white.clock.clock.clock.clock a.why-go.cw i { color: #FFFFFF; }
/* 옛 첫 화면 네 칸(테마 시계 — 새 첫 화면에는 없음) */
html.white.clock.clock.clock.clock .th-zc { border-color: #3D1028; box-shadow: none; }
html.white.clock.clock.clock.clock .th-zc.th-zcS { --zdot: #D98DAB; --zoff: #FFF7F9; background: #E7A9C0; border-color: #3D1028; color: #2A1420; box-shadow: none; }
html.white.clock.clock.clock.clock .th-zc.th-zcB { --zdot: #E7A9C0; --zoff: #FFF7F9; background: #F2B8C9; color: #2A1420; }
html.white.clock.clock.clock.clock .th-zc.th-zcQ { --zdot: #F0CBD6; --zoff: #F7D4DE; background: #FFF7F9; color: #2A1420; border-color: #9E5A78; }
html.white.clock.clock.clock.clock .th-zc.th-zcW { --zdot: #D9C6CE; --zoff: #FFFFFF; background: #ECDDE3; color: #2A1420; border-color: #9E5A78; }
html.white.clock.clock.clock.clock .th-zc:active { background: #F4D9E1; }
html.white.clock.clock.clock.clock .th-ar { background: #FFFFFF; border-color: #3D1028; box-shadow: none; }
/* 돌이 단추 안 */
html.white.clock.clock.clock.clock .dm-it { border-color: #9E5A78; background: #FFF7F9; color: #2A1420; box-shadow: none; }
/* 싹 자리 전부(#/t/sprout) — 맨 앞 셋 큰 판(짙은 장미 → 옅은 장미) · 업종 알약(밝은 카드) · 글은 모두 짙은 자주 */
html.white.clock.clock.clock.clock .th-tile { border-color: #3D1028; background: #FBE8EE; color: #2A1420; box-shadow: none; }
html.white.clock.clock.clock.clock .th-tile0 { background: #E7A9C0; box-shadow: none; }
html.white.clock.clock.clock.clock .th-tile1 { background: #F2B8C9; }
html.white.clock.clock.clock.clock .th-tile2 { background: #F7CAD8; }
html.white.clock.clock.clock.clock .th-tn { color: #2A1420; }
html.white.clock.clock.clock.clock .th-tbadge { border-color: #3D1028; background: #FFFFFF; color: #2A1420; }
html.white.clock.clock.clock.clock .th-chip { border-color: #9E5A78; background: #FFF7F9; color: #2A1420; }
html.white.clock.clock.clock.clock .th-chipmore { border-color: #9E5A78; background: transparent; color: #5E3446; }
/* 꽃 될 회사(#/t/picks) — 묶음 줄마다 짙은 장미에서 옅은 장미로 · 글은 짙은 자주 */
html.white.clock.clock.clock.clock .th-pki { border-color: #3D1028; box-shadow: none; }
html.white.clock.clock.clock.clock .th-pki0 { --pkbg: #E7A9C0; --pkink: #2A1420; } html.white.clock.clock.clock.clock .th-pki1 { --pkbg: #EDB4C7; --pkink: #2A1420; } html.white.clock.clock.clock.clock .th-pki2 { --pkbg: #F2BFCF; --pkink: #2A1420; }
html.white.clock.clock.clock.clock .th-pki3 { --pkbg: #F6CBD8; --pkink: #2A1420; } html.white.clock.clock.clock.clock .th-pki4 { --pkbg: #F9D7E1; --pkink: #2A1420; } html.white.clock.clock.clock.clock .th-pki5 { --pkbg: #FBE3EA; --pkink: #2A1420; }
html.white.clock.clock.clock.clock .th-pkcp { border-color: #3D1028; background: #FFFFFF; color: #2A1420; }
html.white.clock.clock.clock.clock .th-pkday { color: #5E3446; }
html.white.clock.clock.clock.clock .th-pkrec1 { border-left-color: #9E5A78; color: #2A1420; }
/* 옛 첫 화면 그림 단추 넷 */
html.white.clock.clock.clock.clock .s-app, html.white.clock.clock.clock.clock .s-apl { color: #2A1420; text-shadow: none; }
html.white.clock.clock.clock.clock .s-apb { border-color: #3D1028; box-shadow: none; }
html.white.clock.clock.clock.clock .s-app-bloom { --abg: #F2B8C9; } html.white.clock.clock.clock.clock .s-app-search { --abg: #E7A9C0; } html.white.clock.clock.clock.clock .s-app-cal { --abg: #F7CAD8; } html.white.clock.clock.clock.clock .s-app-help { --abg: #D99AB2; }
html.white.clock.clock.clock.clock .s-apb::before { background-image: radial-gradient(rgba(61, 16, 40, .12) 28%, transparent 33%); }
html.white.clock.clock.clock.clock .s-badge { background: #FFFFFF; color: #2A1420; border-color: #3D1028; }
/* 쪽 제목 — 짙은 자주 큰 글(그림자 없음) */
html.white.clock.clock.clock.clock .th-hd .th-h1, html.white.clock.clock.clock.clock h1.st-h { color: #2A1420; text-shadow: none; }
html.white.clock.clock.clock.clock .th-next small, html.white.clock.clock.clock.clock .th-nx small { color: inherit; }
html.white.clock.clock.clock.clock a.hello.m4-letter { outline-color: #9E5A78; }
/* 그림 속 칠(svg 칠 속성) — 검정 = 짙은 자주 · 흰색 = 카드 빛 · 초록(옛 오름 · 자라남) = 짙은 장미 · 파랑 = 내림 파랑 */
html.white.clock.clock.clock.clock :is([fill="#000"], [fill="#000000"], [fill="black"], [fill="#111"], [fill="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { fill: #2A1420; }
html.white.clock.clock.clock.clock :is([stroke="#000"], [stroke="#000000"], [stroke="black"], [stroke="#111"], [stroke="#111111"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { stroke: #2A1420; }
html.white.clock.clock.clock.clock :is([fill="#fff"], [fill="#FFF"], [fill="#ffffff"], [fill="#FFFFFF"], [fill="white"]):not(.s-hands *):not(.s-art *):not(.s-boot *):not(.th-zi *):not(.s-apb *):not(.th-pkf *):not(.th-tf *) { fill: #FFF7F9; }
html.white.clock.clock.clock.clock :is([fill="#007A35"], [fill="#007a35"]) { fill: #A31F70; }
html.white.clock.clock.clock.clock :is([stroke="#007A35"], [stroke="#007a35"]) { stroke: #A31F70; }
html.white.clock.clock.clock.clock :is([stroke="#1E4FC2"], [stroke="#1e4fc2"]) { stroke: #1A55B0; }
html.white.clock.clock.clock.clock :is([fill="#1E4FC2"], [fill="#1e4fc2"]) { fill: #1A55B0; }
/* 「왜 사?」(p-why.css 그림 판 — 크림 카드 · 분홍 단추는 그대로) — 짙은 청록 자리 = 포도주 빛 · 민트 강조 = 옅은 장미 · 진행 = 짙은 장미 */
html.white.clock.clock.clock.clock .wy { --wm-dark: #3D1028; --wm-mint: #F2B8C9; --wm-tab: #5A1A3C; --wm-prog: #A31F70; --wm-teal: #A31F70; }
html.white.clock.clock.clock.clock .wy[data-step="start"] { background: #3D1028 radial-gradient(120% 60% at 50% 40%, rgba(242, 184, 201, .18), rgba(242, 184, 201, 0) 70%); }
html.white.clock.clock.clock.clock .wy-sub { color: #F2D5DE; }
html.white.clock.clock.clock.clock .wy-hl .wl-ic { color: #3D1028; }
html.white.clock.clock.clock.clock .wy-rhead { background: #3D1028 linear-gradient(180deg, #2A0B1C, #5A1A3C); }
html.white.clock.clock.clock.clock .wy-tend .wy-ck { border-left-color: #A31F70; }
html.white.clock.clock.clock.clock .wy-tf { background: #A31F70; } html.white.clock.clock.clock.clock .wy-tf.t1, html.white.clock.clock.clock.clock .wy-tf.t2 { background: #C2457F; } html.white.clock.clock.clock.clock .wy-tf.t3 { background: #8A1B5E; }
html.white.clock.clock.clock.clock .wy-tn, html.white.clock.clock.clock.clock .wy-pg .wy-step { color: #4A2333; }
html.pg-why.white.clock.clock.clock.clock .wy.page:is([data-step="q"], [data-step="det"]) { border-top-color: #3D1028;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath d='M0 0H28A28 28 0 0 0 0 28Z' fill='%233D1028'/%3E%3C/svg%3E") left top / 28px 28px no-repeat padding-box,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath d='M28 0H0A28 28 0 0 1 28 28Z' fill='%233D1028'/%3E%3C/svg%3E") right top / 28px 28px no-repeat padding-box, var(--wm-cream); }
html.pg-why.white.clock.clock.clock.clock #view .cp-card .cp-go { background: #5A1A3C; }
'''

# ── 밤 무대 판 손 규칙(EXTRA_NEON) · 첫 화면 밤 칸(HOME_NEON) ──
NEON_TOKENS = (f"color-scheme: dark; --bg: {N_BG}; --night: {N_BG}; --band: {N_BG}; --violet: {N_INK}; "
  f"--card: {N_CARD}; --card2: {N_CARD2}; --card3: {N_CARD3}; "
  f"--hair: {N_HAIR}; --hair2: {N_HAIR}; --line: {N_LINE}; --hair-soft: {N_LINE}; --seam: {N_LINE}; --press: {N_CARD3}; --lift: {N_CARD}; "
  f"--ink: {N_INK}; --ink-hi: #FFFFFF; --sub: {N_SUB}; --mute: {N_MUTE}; --flat: {N_MUTE}; "
  f"--violet-ink: {N_INK}; --violet-wash: {N_CARD2}; --violet-line: {N_HAIR}; --violet-glow: {N_CARD2}; "
  f"--gold: {N_ACC}; --gold-wash: {N_WASH}; --gold-line: {N_ACC}; "
  f"--up: {N_UP}; --down: {N_DN}; --up-ink: {N_UP}; --down-ink: {N_DN}; --up-bg: {N_UP}; --down-bg: {N_DN}; "
  "--up-fill: rgba(255, 90, 101, .22); --down-fill: rgba(91, 150, 255, .22); --up-fade: rgba(255, 90, 101, .07); --down-fade: rgba(91, 150, 255, .07); "
  f"--lacquer: {N_BAR}; --lacquer-ink: #FFFFFF; --lacquer-sub: {N_SUB}; --lacquer-gold: {N_ACC}; "
  f"--moon: {N_INK}; --moonrow: {N_CARD2}; --m4-band: {N_CARD}; --m4-line: {N_HAIR}; --m4-soft: {N_HAIR}; --m4-neu: {N_MUTE}; --m4-line2: {N_LINE}; "
  f"--pk-bg: {N_BG}; --pk-card: {N_CARD}; --pk-tint: {N_CARD2}; --pk-line: {N_LINE}; --pk-ink: {N_INK}; --pk-sub: {N_SUB}; --pk-acc: {N_ACC}; --pk-wine: {N_BAR}; "
  f"background: {N_BG};")
NEON_GLOW = (f"radial-gradient(ellipse 80vw 42vh at 50% -6%, rgba(148, 191, 219, .14) 0%, rgba(148, 191, 219, 0) 72%), "
             f"radial-gradient(ellipse 130vw 52vh at 50% 108%, rgba(199, 103, 177, .22) 0%, rgba(199, 103, 177, 0) 74%), {N_BG}")
N4 = 'html.white.clock.clock.clock.clock'
NEON_HEAD = f"""
/* ── 밤 무대 판(사장님 2026-10-29 16:57 「이 거 색 그리고 느씸 180가지 분석해서 둘리에 백경색 글씨색으로 적용시켜」 · clock_theme.py EXTRA_NEON) ──
   보내신 무대 사진을 잰 색(docs/design/neon-2026-10-29 — 180가지 · palette.json) · 바로 위 핑크 손 규칙의 자리 그대로 · 색만 핑크 → 밤 색 표(PN_*)로 옮김
   바탕 {N_BG}(천장 · 왼쪽 빛벽 남보라) · 칸 {N_CARD} · 글 {N_INK} · 강조 {N_ACC}(분홍 빛 줄) · 위 · 아래 막대 {N_BAR} · 오름 {N_UP} · 내림 {N_DN}(숫자만) · 테 {N_HAIR} */
{N4} {{ {NEON_TOKENS} }}
{N4} body {{ background: {N_BG}; color: {N_INK}; }}
{N4} body::after {{ background: {NEON_GLOW}; }} /* 무대 빛 — 위 하늘빛 조명 · 아래 분홍 연기(바탕 한 장 · 글 칸 밖 · 아주 옅게) */
"""
NEON_TAIL = f"""
/* 밤 무대 판 마무리 — 위 · 아래 막대 끝줄은 분홍 빛 줄(사진 바닥 줄) · 누를 때 둘레는 하늘색 조명 */
{N4} .top {{ background: rgba(7, 5, 20, .97); border-bottom: 1px solid rgba(240, 111, 203, .55); }}
{N4} .top .logo {{ color: #FFFFFF; }}
{N4} .top .tbtn, {N4} .top .ibtn {{ background: {N_CARD2}; color: {N_INK}; border: 2px solid {N_HAIR}; }}
{N4} .top .ibtn svg, {N4} .top .tbtn svg {{ color: {N_INK}; }}
{N4} .top #giftBtn {{ background: {N_SMOKE}; color: #FFFFFF; }}
{N4} .top #jhBtn {{ border: 1px solid {N_HAIR}; background: {N_CARD2}; color: {N_INK}; }}
{N4} .tabs {{ background: {N_BAR}; border-top: 2px solid rgba(240, 111, 203, .6); }}
{N4} .tabs a .ic {{ border-color: {N_BAR}; color: #FFFFFF; }}
{N4} .tabs a[aria-current="page"] .ic {{ --tbg: {N_ACC}; color: {N_BG}; }}
{N4} :focus-visible {{ outline-color: {N_CYAN}; }}
{N4} a.why-go.cw {{ background: {N_ACC_BG}; color: #FFFFFF; outline-color: {N_ACC_BG}; }}
{N4} a.why-go.cw b, {N4} a.why-go.cw i {{ color: #FFFFFF; }}
"""
SKIP_NEON = re.compile(r'^html\.white\.clock\.clock\.clock\.clock(?:\s+body(?:::after)?)?$')

def neon_var_role(k):
    p = k.lower()
    if re.search(r'(ink|fg|text|txt|col|fore|sub|mute|link|acc|gold|moon$)', p): return 'text'  # --nh-go(단추 바탕)는 바탕 쪽
    if re.search(r'(line|hair|bd|border|rule|seam)', p): return 'border'
    return 'bg'

def neon_decls(ds, skip_vars=False):
    got = []
    for k, v in ds:
        if k.startswith('--'):
            if skip_vars: continue
            role = neon_var_role(k)
        else:
            role = role_of(k)
        if role is None: continue
        def rep(m):
            t = m.group(0)
            try: rgb, a = parse_color(t)
            except Exception: return t
            if a == 0: return t
            nc = map_pn(rgb, 'stroke' if role == 'stroke' else role)
            return t if nc is None else fmt(nc, a)
        nv = COLRE.sub(rep, v)
        if nv != v: got.append((k, nv))
    return fix_contrast(got) if got else got

def neon_pink_rules():
    """EXTRA_PINK(핑크 손 규칙)을 밤 색으로 — 토큰 칸 · 몸 바탕 · 몸 뒤 빛은 NEON_HEAD 가 맡음"""
    out = []
    nodes, _ = parse(strip_comments(EXTRA_PINK))
    rs = []; walk(nodes, [], rs)
    for wrap, pre, body in rs:
        sels = [x for x in split_top(pre, ',') if not SKIP_NEON.match(x)]
        if not sels: continue
        ds = neon_decls(decls_of(body))
        if ds: out.append((wrap, ', '.join(sels) + ' { ' + '; '.join(f'{k}: {v}' for k, v in ds) + '; }'))
    return out

HOME_PINK, HOME_NEON_SEL = 'html.white.clock.clock.clock.home', 'html.white.clock.clock.clock.clock.home'
def neon_home_rules():
    """첫 화면(home-new.css — 청록 때 맨 칸 html.home · 핑크 칸 html.white.clock.clock.clock.home)을 한 단 위 밤 칸으로 — 핑크 칸이 덮은 맨 칸 값은 건너뜀(지금 보이는 값만)"""
    nodes, _ = parse(strip_comments(open(os.path.join(ROOT, 'site/next/home-new.css'), encoding='utf-8').read()))
    rs = []; walk(nodes, [], rs)
    covered = set()
    for wrap, pre, body in rs:
        for sel in split_top(pre, ','):
            if sel.startswith(HOME_PINK):
                for k, _ in decls_of(body): covered.add((wrap, sel[len(HOME_PINK):], k.lower()))
    out = [((), f"{HOME_NEON_SEL} {{ {NEON_TOKENS} }}"), ((), f"{HOME_NEON_SEL} body {{ background: {N_BG}; color: {N_INK}; }}"),
           ((), f"{HOME_NEON_SEL} body::after {{ background: {NEON_GLOW}; }}")]
    for wrap, pre, body in rs:
        ds0 = decls_of(body)
        for sel in split_top(pre, ','):
            if sel.startswith(HOME_PINK): rest, pink = sel[len(HOME_PINK):], True
            elif re.match(r'^html\.home(?![\w-])', sel): rest, pink = sel[len('html.home'):], False
            else: continue
            if rest.strip() in ('', 'body', 'body::after'): continue  # 토큰 · 몸 바탕 · 몸 뒤 빛은 위 세 줄이 맡음
            ds = [(k, v) for k, v in ds0 if pink or (wrap, rest, k.lower()) not in covered]
            ds = neon_decls(ds)
            if ds: out.append((wrap, f"{HOME_NEON_SEL}{rest} {{ " + '; '.join(f'{k}: {v}' for k, v in ds) + '; }'))
    return out

def emit(rules):
    by = {}
    for w, r in rules: by.setdefault(w, []).append(r)
    return '\n'.join(block(w, ls) for w, ls in by.items()) + '\n'

def block(wrap, lines):
    s = '\n'.join(lines)
    for w in reversed(wrap):
        s = f'{w} {{\n{s}\n}}'
    return s

head = ((('/* 최고급 핑크 판 — scripts/atlas11/next/clock_theme.py 가 지은 파일(손으로 고치지 않음 · 옛 청록 판은 --teal)\n'
          ' * 사장님 2026-10-28 12:00 「안돼 배경을 최고급 핑크로 해」 · 13:16 「속도빨리해서 얼른 만들엉」 — 첫 화면(home-new.css)과 같은 색을 모든 쪽에\n') if PAL == 'pink' else
         '/* 돌 시계 청록 판 — scripts/atlas11/next/clock_theme.py 가 지은 파일(손으로 고치지 않음)\n')
        + ' * 사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 · 08:23 「더 빠른 방식 찾아서 9시까지 모든 싸이트 되게 해」\n'
        + f' * 읽은 파일 {len(SRC)}개 · 바꾼 규칙 {nrule}개 · 바꾼 칸 {ndecl}개 */\n')
body = '\n'.join(block(w, ls) for w, ls in out_blocks.items())
if PAL == 'neon':
    head = ('/* 밤 무대 판 — scripts/atlas11/next/clock_theme.py 가 지은 파일(손으로 고치지 않음 · 옛 핑크 판 --pink · 옛 청록 판 --teal)\n'
            ' * 사장님 2026-10-29 16:57 「이 거 색 그리고 느씸 180가지 분석해서 둘리에 백경색 글씨색으로 적용시켜」 — 무대 사진 색(docs/design/neon-2026-10-29)을 모든 쪽 바탕 · 글씨에\n'
            + f' * 읽은 파일 {len(SRC)}개 · 바꾼 규칙 {nrule}개 · 바꾼 칸 {ndecl}개 */\n')
    zone = (f"/* 업종 점 그림 네 자리 색 — 짙은 칸 위 색약 검사(dataviz validate_palette --mode dark --surface #241540 --pairs all) 실패 0 · 경고 0 · 싹 청록 · 꽃 장미 · 시듦 호박 · 잠잠 보라 · 칸 바탕은 그 색 20% */\n"
            f"{HOME_NEON_SEL} #view {{ --nh-S: #0097B3; --nh-B: #C6367D; --nh-W: #C0851F; --nh-Q: #7260BD; --nh-zS: #1D2F57; --nh-zB: #441C4C; --nh-zW: #432B39; --nh-zQ: #342459; }}\n")
    tail = NEON_HEAD + emit(neon_pink_rules()) + NEON_TAIL + '/* 첫 화면 밤 칸(home-new.css 를 한 단 위 html.white.clock.clock.clock.clock.home 에서 덮음) */\n' + emit(neon_home_rules()) + zone
    open(OUT, 'w', encoding='utf-8').write(head + body + '\n' + TOKENS + EXTRA + tail)
else:
    open(OUT, 'w', encoding='utf-8').write(head + body + '\n' + TOKENS + EXTRA + (EXTRA_PINK if PAL == 'pink' else ''))
print('palette', PAL, 'files', len(SRC), 'rules', nrule, 'decls', ndecl, 'bytes', len(head + body + EXTRA))

# 말하는 불빛 칸(site/next/home-talk.css · 칸을 처음 열 때 받는 파일 — 사장님 2026-10-30 15:15(+08) 「응」 · docs/design/why11-2026-10-30/order-1615.txt)
#   표시 줄 위 = 핑크 판 규칙(손으로 씀) · 표시 줄 밑 = 그 규칙을 밤 무대 색으로 옮긴 것(여기서 지음 · 첫 화면 home-new.css 와 같은 셈 map_pn · 같은 선택자 머리)
TALK, TALK_MARK = os.path.join(ROOT, 'site/next/home-talk.css'), '/* ── 밤 무대 판(아래는 scripts/atlas11/next/clock_theme.py 가 지음 · 손으로 고치지 않음) ── */'
def neon_talk_rules(text):
    nodes, _ = parse(strip_comments(text))
    rs = []; walk(nodes, [], rs)
    out = []
    for wrap, pre, body in rs:
        sels = [HOME_NEON_SEL + sel[len('html.home'):] for sel in split_top(pre, ',') if re.match(r'^html\.home(?![\w-])', sel)]
        if not sels: continue
        ds = neon_decls(decls_of(body))
        if ds: out.append((wrap, ', '.join(sels) + ' { ' + '; '.join(f'{k}: {v}' for k, v in ds) + '; }'))
    return out
if PAL == 'neon' and os.path.exists(TALK):
    t = open(TALK, encoding='utf-8').read()
    if TALK_MARK not in t: raise SystemExit('home-talk.css 에 밤 무대 표시 줄이 없음')
    top = t.split(TALK_MARK)[0].rstrip() + '\n\n'
    rules = neon_talk_rules(top)
    open(TALK, 'w', encoding='utf-8').write(top + TALK_MARK + '\n' + emit(rules))
    print('home-talk.css 밤 규칙', len(rules))
