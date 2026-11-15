# 샘플 3 「장작 뺀 판」 — data.json 을 읽어 sample-3.html 을 찍어 낸다(지어낸 숫자 0)
# 쓰는 법: python3 build-3.py
# 고침 1차(검사단 열 명 · FIX-3 · FIXRULE · 숫자 · 손가락 검사) 반영판
import json, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open('/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1720/samples/data.json', encoding='utf-8'))
OUT = os.path.join(HERE, 'sample-3c.html')   # 샘플 3c 「책장 펼침」

E = lambda s: html.escape(str(s), quote=True)
NUMK = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열']
NUMKA = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']   # 「세 곳」처럼 꾸밀 때

S = D['sun']
TODAY = next(l for l in S['lands'] if l['today'])

# 다섯 땅 뜻 — 공통 규칙(SAMPLE_COMMON) 「누르면 보이는 곳에 쓸 때」 글 그대로
LAND_MEAN = {
    'rise': '한 달 전보다 오른 회사가 열에 여섯을 넘고, 365곳을 줄 세운 딱 가운데 회사도 올랐을 때예요.',
    'narrow': '평균은 올랐는데 오른 회사는 절반이 안 될 때예요. 몇 곳만 크게 오른 거예요.',
    'calm': '다른 네 땅에 들지 않는 때예요.',
    'shake': '요즘 하루 오르내림이 평소보다 한 배 반 넘게 클 때예요.',
    'fall': '한 달 전보다 오른 회사가 열에 넷이 안 되고, 365곳을 줄 세운 딱 가운데 회사도 내렸을 때예요.',
}
# 오늘 딱 가운데 회사 — 공통 규칙에 적힌 진짜 값(원자료 su21.json sun.m.mid = -0.0425 → 100원이 95.8원)
MID_V = '95.8'
MID_SAY = '오늘 딱 가운데 회사는 한 달에 100원이 %s원이에요.' % MID_V

# 될 듯 묶음 — 무엇을 셌나(그렇게 = 이것) · 꽃은 원문 「시장보다 15 넘게 앞섬」 그대로(숫자 · 손가락 검사 1)
NEXT_COUNTED = {   # (앞 줄, 뒷 줄) — 줄이 바뀌는 자리만 정하고 글은 한 문장 그대로
    'hotNext': ('고른 뒤 한 달 안에', '진짜 불장 일곱에 든 번을 셌어요.'),
    'bloomNext': ('고른 뒤 한 달 안에 시장보다', '100원에 15원 넘게 앞선 번을 셌어요.'),
    'moneyNext': ('고른 뒤 한 달 안에', '진짜 돈이 몰리는 일곱에 든 번을 셌어요.'),
}
# 묶음 설명 — 자료 그대로 · 꽃이 될 묶음만 「싹」(앞으로 자랄 것으로 읽힘)을 뺌
WHAT_FIX = {'bloom': lambda s: s.replace('싹 ', '곳 ').replace(' 싹', ' 곳')}
# 꾀 뜻 줄 — 자료 그대로 · 「살아난」만 「올라온」으로(다시 오를 것으로 읽힘)
SAY_FIX = {'g14': lambda s: s.replace('살아난', '올라온')}

GNAME = {g['key']: g['name'] for g in D['groups'] + D['next']}
GNAME['quiet'] = '조용한 힘'

# 긴 회사 이름은 칸이 좁을 때 뜻이 갈리는 자리에서만 줄을 바꾼다(한 글자만 다음 줄로 떨어지지 않게)
WBR = {
    'HD한국조선해양': 'HD한국|조선해양', '현대지에프홀딩스': '현대지에프|홀딩스', '케이아이엔엑스': '케이아이|엔엑스',
    '한미사이언스': '한미|사이언스', '지엔씨에너지': '지엔씨|에너지', '현대글로비스': '현대|글로비스',
    'HD건설기계': 'HD|건설기계', '현대엘리베이터': '현대|엘리베이터', 'LG유플러스': 'LG|유플러스',
    '하이트진로': '하이트|진로', '한화솔루션': '한화|솔루션', '씨에스윈드': '씨에스|윈드',
}
def nm(name):
    s = WBR.get(name)
    return '<wbr>'.join(E(p) for p in s.split('|')) if s else E(name)

def seg(*parts):
    """줄이 바뀔 때 정한 자리에서만 갈리게 — 글은 그대로 이어 읽힘"""
    return ' '.join('<span class="nw">%s</span>' % p for p in parts)

# ───────── 그림(먹색 선 · 인라인 SVG) ─────────
# 표(그대로): 불을 뺀 솥 하나 + 솥 밑에서 빼 옆에 쌓아 둔 장작 셋 · 불꽃 없음
MARK = '''<svg class="mark" viewBox="0 0 50 34" aria-hidden="true" focusable="false">
<g fill="none" stroke="#570E08" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 13 Q17 4.2 26 13" stroke-width="2.4"/>
<path d="M15.2 7.1 H18.8" stroke-width="2.6"/>
<path d="M2.5 13 H31.5" stroke-width="2.6"/>
<path d="M6.5 13 C6.5 22.6 10 26.4 17 26.4 C24 26.4 27.5 22.6 27.5 13" stroke-width="2.4"/>
<path d="M3 32.2 H48" stroke-width="1.9"/>
<circle cx="38.6" cy="27.6" r="3.3" stroke-width="1.9"/>
<circle cx="45.4" cy="27.6" r="3.3" stroke-width="1.9"/>
<circle cx="42" cy="21.6" r="3.3" stroke-width="1.9"/>
</g>
<g fill="#570E08"><circle cx="38.6" cy="27.6" r="0.95"/><circle cx="45.4" cy="27.6" r="0.95"/><circle cx="42" cy="21.6" r="0.95"/></g>
</svg>'''

# 오늘 땅 큰 그림 — 내리는 땅: 왼쪽 위에서 오른쪽 아래로 내려가는 언덕 선 하나(먹색)
HILL = '''<svg class="hill" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
<g fill="none" stroke="#570E08" stroke-linecap="round" stroke-linejoin="round">
<path d="M4 14 C28 12 43 20 59 42 S93 80 116 82" stroke-width="3.6"/>
<path d="M4 87 H116" stroke-width="2.2"/>
</g></svg>'''

GLYPH = {  # 다섯 땅 작은 그림(색은 글자색을 따름)
    'rise': '<path d="M3 21 C15 20 25 11 37 4"/>',
    'narrow': '<path d="M3 4 L37 10"/><path d="M3 21 L37 15"/>',
    'calm': '<path d="M3 13 H37"/>',
    'shake': '<path d="M3 13 L8 5 L14 21 L20 4 L26 21 L32 6 L37 13"/>',
    'fall': '<path d="M3 4 C15 5 25 14 37 21"/>',
}
def glyph(k):
    return ('<svg class="gl" viewBox="0 0 40 25" aria-hidden="true" focusable="false">'
            '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
            + GLYPH[k] + '</g></svg>')

CHEV = ('<svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
        '<path d="M5 9 L12 16 L19 9" fill="none" stroke="#570E08" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')


# 표지 선 글자 — 우리 손으로 새로 짠 한글 「손 자 / 병 법」 두 줄 두 칸 · 한 굵기 선 · 세로 큰 줄 하나가 글자를 꿰어 격자가 된다
ART = '''<svg class="art" viewBox="0 0 390 470" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<g fill="none" stroke="#570E08" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<g transform="translate(28,52)"><path d="M14 56 L60 8 L106 56"/><path d="M60 66 V88"/><path d="M6 88 H114"/><path d="M24 104 V144 H100"/></g>
<g transform="translate(172,52)"><path d="M4 22 H64"/><path d="M34 22 L4 140"/><path d="M22 70 L64 140"/><path d="M100 70 H120"/></g>
<g transform="translate(28,262)"><path d="M6 6 V60 H62 V6"/><path d="M6 33 H62"/><path d="M100 0 V78"/><path d="M78 24 H100"/><path d="M78 50 H100"/></g>
<g transform="translate(172,262)"><path d="M6 6 V60 H62 V6"/><path d="M6 33 H62"/><path d="M76 38 H100"/><path d="M10 92 V146 H78 V92"/><path d="M10 119 H78"/></g>
<path d="M272 0 V470"/>
<path d="M0 140 H34"/>
<path d="M0 295 H34"/>
</g>
<circle cx="84" cy="378" r="27" fill="none" stroke="#BA593C" stroke-width="7"/>
<path d="M232 444 H390" fill="none" stroke="#BA593C" stroke-width="7" stroke-linecap="round"/>
</svg>'''

# 표지 아래 끝 — 옅은 살구 물결이 표지를 가른다
WAVE = '''<svg class="wave" viewBox="0 0 390 56" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<path d="M0 22 C70 2 140 4 210 20 S330 42 390 12 V56 H0 Z" fill="#E4C0A8"/>
<path d="M0 36 C70 16 140 18 210 34 S330 56 390 26 V56 H0 Z" fill="#FFFCF7"/>
</svg>'''

def ph(no):
    '''쪽 머리 — 작은 장 번호와 가는 선'''
    return '<p class="ph"><span class="pno">%s</span><i aria-hidden="true"></i></p>' % no

# 꺾은선 — 모든 칸 같은 눈금(FIXRULE): 가장 크게 움직인 회사가 칸 높이에 맞고 나머지는 같은 비율
def _rng(c):
    r = [v / c[0] for v in c]
    return max(r) - min(r)
_ALL_C = [it['c'] for g in D['groups'] for it in g['items'] if it.get('c')] + [q['c'] for q in D['quiet'] if q.get('c')]
SPARK_R = max(_rng(c) for c in _ALL_C)

def spark(c, cls='spark'):
    """장이 열린 스물한 날 마감 값 — 먹색 선 · 끝 점이 오늘 · 칸마다 가운데 맞춤"""
    w, h, px, py = 100.0, 30.0, 4.0, 3.0
    r = [v / c[0] for v in c]
    mid = (max(r) + min(r)) / 2.0
    n = len(r)
    pts = [(px + (w - 2 * px) * i / (n - 1), h / 2.0 - (v - mid) / SPARK_R * (h - 2 * py)) for i, v in enumerate(r)]
    poly = ' '.join('%.2f,%.2f' % p for p in pts)
    lx, ly = pts[-1]
    return ('<svg class="%s" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
            '<polyline points="%s" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
            '<path d="M%.2f %.2f l0 0" stroke="currentColor" stroke-width="8" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
            '</svg>') % (cls, poly, lx, ly)

# ───────── 조각 ─────────
def kind_of(it):
    ch = it.get('ch20')
    return 'down' if (ch is not None and ch < 0) else ('flat' if ch == 0 else 'up')

BAND = {'down': '<span class="band">한 달 내림</span>',
        'up': '<span class="band"><span>오름</span></span>',
        'flat': '<span class="band"><span>그대로</span></span>'}

def days_html(d):
    return '<span class="d"><span class="d1">이 묶음에 든 지</span> <b class="d2">%d일</b></span>' % int(d)

def cell(it, nxt=False):
    """책장 한 쪽 모양 가로 칸 — 왼쪽 회사 이름(명조 굵게) · 오른쪽 값 숫자 · 위 오른쪽 접힌 쪽 · 바닥 띠"""
    k = kind_of(it)
    v = ('<span class="v">%s<span class="v1">100원이</span><b class="v2">%s원</b></span>' % (
        '<span class="v0">지난 한 달</span>' if nxt else '', E(it['v100'])))
    sp = spark(it['c']) if (not nxt and it.get('c')) else ''
    left = '<b class="nm">%s</b>' % nm(it['name'])
    if it.get('days'):
        left += days_html(it['days'])
    left += sp
    return ''.join(['<li class="cell %s%s">' % (k, ' next' if nxt else ''),
                    BAND[k],  # 글 차례로는 맨 앞 · 눈으로는 칸 맨 아래 띠
                    '<div class="crow"><div class="cl">%s</div>%s</div>' % (left, v),
                    '</li>'])

def group_sum(items):
    """일곱 칸이라 빈 여덟째 자리에 그 묶음의 띠 셈(진짜 칸 수)"""
    dn = sum(1 for it in items if kind_of(it) == 'down')
    up = sum(1 for it in items if kind_of(it) == 'up')
    fl = len(items) - dn - up
    rows = ['<span class="s-h">%s 칸 가운데</span>' % NUMK[len(items)] if len(items) <= 10 else '<span class="s-h">%d칸 가운데</span>' % len(items),
            '<span class="s-r"><i class="sw-d" aria-hidden="true"></i>한 달 내림 <b>%d칸</b></span>' % dn,
            '<span class="s-r"><i class="sw-u" aria-hidden="true"></i>오름 <b>%d칸</b></span>' % up]
    if fl:
        rows.append('<span class="s-r"><i class="sw-u" aria-hidden="true"></i>그대로 <b>%d칸</b></span>' % fl)
    return '<li class="sum">%s</li>' % ''.join(rows)

def cells_html(items, nxt=False):
    out = ''.join(cell(it, nxt) for it in items)
    if len(items) % 2:
        out += group_sum(items)
    return '<ul class="cells">%s</ul>' % out

def dots(t):
    t = int(t)
    return ('<span class="dots" aria-hidden="true">' + '<i class="l"></i>' * t + '<i></i>' * (10 - t) + '</span>')

def chips(names):
    return '<ul class="chips">' + ''.join('<li>%s</li>' % E(x) for x in names) + '</ul>'

ACT = ('<span class="act"><span class="when-shut">고른 회사 보기</span><span class="when-open">접기</span>' + CHEV + '</span>')

def say_of(e):
    s = e['say']
    f = SAY_FIX.get(e['k'])
    return f(s) if f else s

def trick_row(e):
    return ''.join([
        '<li><details class="tk"><summary>',
        '<span class="rk">%d위</span>' % e['rank'],
        '<span class="tn">%s</span>' % E(e['easy']),
        '<span class="say">%s</span>' % E(say_of(e)),
        dots(e['tenths']),
        '<span class="tl">%s</span>' % E(e['line']),
        '<span class="cnt">%d번 가운데 %d번</span>' % (e['n'], e['lose']),
        ACT,
        '</summary><div class="tb">',
        '<p class="pk-h">오늘 고른 회사</p>', chips(e.get('picks', [])),
        '</div></details></li>'])

def notyet_row(e):
    return ''.join([
        '<li><details class="tk ny"><summary>',
        '<span class="tn">%s</span>' % E(e['easy']),
        '<span class="say">%s</span>' % E(say_of(e)),
        '<span class="nytag">%s</span>' % E(e['line']),
        ACT,
        '</summary><div class="tb">',
        '<p class="pk-h">오늘 고른 회사</p>', chips(e.get('picks', [])),
        '</div></details></li>'])

# ───────── 쪽 ─────────
n_found = sum(len(g['items']) for g in D['groups'])
n_next = sum(len(g['items']) for g in D['next'])
top7 = D['rank'][:7]
rest_rank = D['rank'][7:]
fall_days = TODAY['days500']

# 21곳 — 겹친 이름 셈(진짜 자료)
found_names = [it['name'] for g in D['groups'] for it in g['items']]
n_unique = len(set(found_names))
n_dup = len(D['overlap'])
found_down = sum(1 for g in D['groups'] for it in g['items'] if kind_of(it) == 'down')
found_up = sum(1 for g in D['groups'] for it in g['items'] if kind_of(it) == 'up')
found_flat = n_found - found_down - found_up

# 될 듯 21 — 묶음끼리 겹친 이름
_seen = {}
for g in D['next']:
    for it in g['items']:
        _seen.setdefault(it['name'], []).append(g['key'])
next_dups = [nme for nme, ks in _seen.items() if len(ks) > 1]
def eun(word):
    """은/는 — 끝 글자에 받침이 있으면 「은」"""
    ch = word[-1]
    if '가' <= ch <= '힣':
        return '은' if (ord(ch) - 0xAC00) % 28 else '는'
    return '은'
if next_dups:
    next_dup_say = '%s 두 묶음에 들어 두 번 셌어요.' % (
        (E(next_dups[0]) + eun(next_dups[0])) if len(next_dups) == 1 else (' · '.join(E(x) for x in next_dups) + eun(next_dups[-1]) + ' 저마다'))
    next_count_say = seg('세 묶음 합쳐 %d자리예요.' % n_next, next_dup_say)
else:
    next_count_say = '세 묶음 합쳐 %d자리예요.' % n_next

# 요즘 장 모습 — 오늘이 왜 내리는 땅인지 진짜 숫자
m = S['market']
ratio = m['up'] / float(m['n'])
if ratio < 0.4:
    tenth = '열에 넷이 안 돼요.'
elif ratio > 0.6:
    tenth = '열에 여섯을 넘어요.'
else:
    tenth = '열에 넷에서 여섯 사이예요.'
why1 = '%d곳 가운데 한 달 전보다 오른 곳은 %d곳이에요. %s' % (m['n'], m['up'], tenth)
why2 = '줄 세운 딱 가운데 회사는 100원이 %s원이 됐어요.' % MID_V
do_text = S['do'] if S['do'].startswith('내 돈') else '내 돈을 ' + S['do']

land_cells = []
for l in S['lands']:
    a, b = l['name'].split(' ', 1)
    land_cells.append('<li class="%s"%s>%s<span>%s</span><span>%s</span></li>' % (
        'now' if l['today'] else '', ' aria-current="true"' if l['today'] else '', glyph(l['key']), E(a), E(b)))

land_mean = []
for l in S['lands']:
    extra = ('<dd class="mid">%s</dd>' % E(MID_SAY)) if l['today'] else ''
    land_mean.append('<div class="ld%s"><dt>%s<span>%s</span>%s</dt><dd>%s</dd><dd class="n500">지난 %d날 가운데 %d날</dd>%s</div>' % (
        ' now' if l['today'] else '', glyph(l['key']), E(l['name']),
        '<span class="nowtag">오늘</span>' if l['today'] else '',
        E(LAND_MEAN[l['key']]), S['histDays'], l['days500'], extra))

# 병법 한 줄 — 자료 그대로 · 쉼표 뒤에서만 줄이 바뀌게
_q = S['quote']
if ', ' in _q:
    _a, _b = _q.split(', ', 1)
    quote_html = seg('「' + E(_a) + ',', E(_b) + '」')
else:
    quote_html = '「' + E(_q) + '」'

groups_html = []
for g in D['groups']:
    what = WHAT_FIX[g['key']](g['what']) if g['key'] in WHAT_FIX else g['what']
    groups_html.append('<div class="grp"><h3>%s</h3><p class="what">%s</p>%s</div>' % (
        E(g['name']), E(what), cells_html(g['items'])))

next_html = []
for g in D['next']:
    p, b = g['per100'], g['base100']
    next_html.append(
        '<div class="grp"><h3>%s</h3>'
        '<p class="per bal">%s</p>'
        '<p class="per">지난 1년 100번 가운데 <b>%d번</b>은 그렇게 됐고, <b>%d번</b>은 아니었어요.</p>'
        '<p class="per">전체 회사는 100번에 <b>%d번</b>이에요.</p>'
        '%s</div>' % (E(g['name']), seg(*[E(x) for x in NEXT_COUNTED[g['key']]]), p, 100 - p, b, cells_html(g['items'], nxt=True)))

nn = D['nextNote'].split(' · ', 1)
next_note_html = (''.join('<span class="ln">%s.</span>' % E(x.rstrip('.')) for x in nn)) if len(nn) == 2 else E(D['nextNote'])

overlap_html = ''.join('<li><b>%s</b><span>%s</span></li>' % (E(o['name']), ' · '.join(E(GNAME.get(k, k)) for k in o['in']))
                       for o in D['overlap'])
quiet_html = ''.join(
    '<li><div class="qt"><b>%s</b><span class="qi">%s</span>%s</div>%s</li>' % (
        nm(q['name']), E(q.get('ind') or ''), days_html(q['days']), spark(q['c'], 'spark qsp') if q.get('c') else '')
    for q in D['quiet'])

CSS = r'''
:root{--bg:#EDD6C4;--page:#FFFCF7;--ink:#570E08;--ink2:#3A0A05;--acc:#BA593C;--wave:#E4C0A8;--navy:#1F2A44;--edge:#C9A28C;--flap:#F1DECF;--rise:#E4C0A8;
--serif:"Noto Serif CJK KR","Noto Serif KR",serif;--sans:"Noto Sans CJK KR","Noto Sans KR",sans-serif}
*{box-sizing:border-box}
html{font-size:16px;background:var(--bg);-webkit-text-size-adjust:100%;text-size-adjust:100%}
html.big{font-size:20px}
body{margin:0;background:var(--bg);color:var(--ink2);font-family:var(--serif);font-size:1.3125rem;line-height:1.6;word-break:keep-all;overflow-wrap:anywhere;-webkit-font-smoothing:antialiased}
h1,h2,h3,p,ol,ul,dl,dd,dt{margin:0;padding:0}
p,dd{text-wrap:pretty}
.bal{text-wrap:balance}
ol,ul{list-style:none}
b{font-weight:700}
.nw{display:inline-block}
.nob{white-space:nowrap}
.ln{display:block}
button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
summary{list-style:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
summary::-webkit-details-marker{display:none}
:focus-visible{outline:3px solid var(--navy);outline-offset:2px}
.when-open{display:none}
details[open] > summary .when-open{display:inline}
details[open] > summary .when-shut{display:none}
.chev{width:28px;height:28px;flex:none;display:block}
details[open] > summary .chev{transform:rotate(180deg)}

/* 머리 — 표지 위 작은 띠 */
.top{padding:8px 16px 6px;background:var(--bg)}
.brandrow{display:flex;align-items:center;justify-content:space-between;gap:8px}
.brand{display:flex;align-items:center;gap:8px;min-width:0}
.mark{width:40px;height:28px;flex:none;display:block}
h1{font-family:var(--serif);font-size:1.3125rem;font-weight:700;color:var(--ink);letter-spacing:.14em;line-height:1.2;white-space:nowrap}
.tools{display:flex;gap:6px;margin-left:auto}
.tools button{width:54px;min-height:50px;padding:2px 3px;border:1.5px solid var(--ink);border-radius:8px;background:var(--page);color:var(--ink2);font-family:var(--sans);font-size:1.125rem;font-weight:500;line-height:1.2;text-align:center}
.tools button[aria-pressed="true"]{background:var(--ink);color:var(--page)}
html.big .tools button{width:auto;min-width:56px;padding:4px 8px}

/* 표지 — 첫 화면 한 장 */
.cover{position:relative;display:flex;flex-direction:column;min-height:calc(100svh - 130px);background:var(--bg)}
.art{display:block;width:100%;height:auto;max-height:calc(100svh - 340px);flex:1 1 auto}
.side{position:absolute;top:22px;right:10px;writing-mode:vertical-rl;font-family:var(--serif);font-size:1.1875rem;font-weight:600;color:var(--ink2);line-height:1.55;letter-spacing:.12em}
.side .sd{display:block}
.cover-foot{margin-top:auto}
.wave{display:block;width:100%;height:56px}
.cf-in{background:var(--page);padding:2px 20px 18px}
.c-today{font-size:1.5rem;font-weight:500;color:var(--ink2);line-height:1.35}
.c-today b{font-size:2.125rem;font-weight:700;color:var(--ink);letter-spacing:.02em}
.c-down{display:flex;align-items:center;gap:6px;margin-top:8px;font-family:var(--sans);font-size:1.125rem;font-weight:500;color:var(--ink2)}
.c-down .chev{width:24px;height:24px}

/* 책장 — 장마다 한 쪽 · 위 오른쪽 접힌 모서리 */
main{padding:0 0 18px}
.sec{position:relative;background:var(--page);margin-top:14px;padding:16px 16px 24px;border-top:1.5px solid var(--edge);border-bottom:1.5px solid var(--edge)}
.sec::after{content:"";position:absolute;top:-1.5px;right:0;width:30px;height:30px;background:linear-gradient(to bottom left,var(--bg) 0 calc(50% - 1px),var(--ink) calc(50% - 1px) calc(50% + 1px),var(--flap) calc(50% + 1px) 100%)}
.cover + main .sec:first-child{margin-top:0;border-top:0}
.cover + main .sec:first-child::after{display:none}
.ph{display:flex;align-items:center;gap:10px;margin:0 34px 10px 0;font-size:1.125rem;font-weight:600;color:var(--ink);letter-spacing:.18em;line-height:1.3}
.ph i{flex:1 1 auto;height:1.5px;background:var(--ink);display:block}
h2{font-size:1.5625rem;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:10px}
@keyframes rise{from{transform:translateY(10px)}to{transform:none}}
.sec.rise{animation:rise .4s ease-out 1}
@media (prefers-reduced-motion: reduce){.sec.rise{animation:none}}

/* 요즘 장 모습 */
.land h2{margin-bottom:0}
.lsub{font-size:1.1875rem;font-weight:500;line-height:1.5;margin-bottom:6px}
.today{display:flex;align-items:center;gap:12px}
.hill{width:92px;height:70px;flex:none;display:block}
.today-say{line-height:1.2}
.today-say .t1{display:block;font-size:1.3125rem}
.today-say .t2{display:block;font-size:1.3125rem;margin-top:2px}
.today-say .tname{font-size:2.375rem;font-weight:700;color:var(--ink);margin-right:1px}
html.big .today-say .tname{font-size:2rem}
.quote{margin-top:12px;padding-left:12px;border-left:4px solid var(--acc);font-size:1.3125rem;font-weight:500;line-height:1.5}
.do{margin-top:10px;font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.4}
.lands{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:12px}
.lands li{display:flex;flex-direction:column;align-items:center;border-radius:8px;padding:6px 0 5px;font-family:var(--sans);font-size:1.09375rem;font-weight:500;letter-spacing:-.03em;line-height:1.25;text-align:center;min-width:0;color:var(--ink2)}
.lands li span{white-space:nowrap;overflow-wrap:normal}
.lands .gl{width:34px;height:20px;margin-bottom:3px;display:block}
.lands li.now{background:var(--navy);color:#FFFFFF;font-weight:700}
html.big .lands{grid-template-columns:repeat(3,1fr);row-gap:8px}
.why{margin-top:12px;font-size:1.3125rem;font-weight:500;line-height:1.5}
.why + .why{margin-top:4px}
.landmean{margin-top:14px;border:1.5px solid var(--ink);border-radius:10px;background:var(--page)}
.landmean > summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:52px;padding:5px 12px 5px 14px;font-size:1.25rem;font-weight:700;color:var(--ink)}
.ldl{display:grid;gap:10px;padding:2px 12px 14px}
.ld{border-top:1.5px solid var(--edge);padding:10px 2px 2px}
.ld dt{display:flex;align-items:center;gap:8px;font-size:1.25rem;font-weight:700;color:var(--ink);line-height:1.35}
.ld dt .gl{width:34px;height:21px;flex:none}
.nowtag{background:var(--navy);color:#FFFFFF;font-family:var(--sans);font-size:1.125rem;font-weight:700;border-radius:6px;padding:0 8px;line-height:1.55}
.ld dd{font-size:1.1875rem;line-height:1.55;margin-top:4px}
.ld.now{border-top:3px solid var(--navy)}

/* 쪽지 */
.notecard{border:1.5px solid var(--edge);border-radius:4px;padding:14px 14px 16px;background:var(--page)}
.tag{display:inline-block;font-family:var(--sans);font-size:1.125rem;font-weight:700;color:var(--ink);border:1.5px solid var(--ink);border-radius:6px;padding:0 9px;line-height:1.55}
.q{margin-top:10px;font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.45}
.ans{display:flex;gap:10px;margin-top:14px}
.ans button{flex:1 1 0;min-height:58px;border:1.5px solid var(--ink);border-radius:10px;background:var(--page);color:var(--ink);font-size:1.25rem;font-weight:700;line-height:1.2;padding:4px 6px}
.ans button[aria-pressed="true"]{background:var(--ink);color:var(--page)}
.after{margin-top:10px;font-size:1.1875rem;font-weight:500}

/* 오늘 찾은 21곳 */
.found-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px}
.found-h .lead{font-size:1.4375rem;font-weight:700}
.huge{font-family:var(--sans);font-size:3rem;font-weight:700;line-height:1.05;color:var(--ink)}
.fsub{font-size:1.1875rem;font-weight:500;line-height:1.5}
.legend{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.cell.mini{padding-top:10px}
.cell.mini .lt{font-size:1.125rem;font-weight:500;line-height:1.35;padding-right:16px}
.cell.mini .lc{font-family:var(--sans);font-size:1.75rem;font-weight:700;color:var(--ink);line-height:1.2;margin:2px 0 4px}
.howto{font-size:1.1875rem;font-weight:500;line-height:1.5;margin-top:10px}
.grp{margin-top:26px}
.grp h3{font-size:1.4375rem;font-weight:700;color:var(--ink);line-height:1.3}
.what{font-size:1.1875rem;font-weight:500;line-height:1.5;margin-top:2px}
.cells{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px}

/* 회사 칸 — 책장 한 쪽 · 판별은 바닥 띠(내림 = 남먹색 굵은 띠 + 흰 글씨 · 오름 = 옅은 살구 가는 띠) */
.cell{position:relative;display:flex;flex-direction:column;border:1.5px solid var(--edge);border-radius:3px 0 3px 3px;padding:11px 14px 0;min-width:0;background:var(--page)}
.cell::after{content:"";position:absolute;top:-1.5px;right:-1.5px;width:22px;height:22px;background:linear-gradient(to bottom left,var(--page) 0 calc(50% - 1px),var(--ink) calc(50% - 1px) calc(50% + 1px),var(--flap) calc(50% + 1px) 100%)}
.cell.next{border-style:dashed}
.cell .band{order:9;margin:10px -14px 0}
.cell.down .band{background:var(--navy);color:#FFFFFF;font-family:var(--sans);font-weight:700;min-height:40px;display:flex;align-items:center;justify-content:center;font-size:1.1875rem;line-height:1.2;padding:3px 6px;border-radius:0 0 2px 2px}
.cell.up .band,.cell.flat .band{display:flex;flex-direction:column;align-items:center;font-family:var(--sans);font-size:1.125rem;font-weight:500;line-height:1.2;color:var(--ink2)}
.cell.up .band::after,.cell.flat .band::after{content:"";display:block;align-self:stretch;height:4px;background:var(--rise);margin-top:5px}
.crow{display:grid;grid-template-columns:1fr auto;column-gap:10px;align-items:end;padding-right:6px}
.cl{min-width:0;display:flex;flex-direction:column}
.nm{font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.25}
.v{display:flex;flex-direction:column;align-items:flex-end;text-align:right;line-height:1.2;min-width:0}
.v0,.v1{font-family:var(--sans);font-size:1.125rem;font-weight:500}
.v2{font-family:var(--sans);font-size:2.5rem;font-weight:700;color:var(--ink);letter-spacing:-.01em;line-height:1.05;white-space:nowrap}
.spark{display:block;width:120px;height:30px;color:var(--ink);overflow:visible;margin:6px 0 2px}
.cell .d{display:block;margin-top:3px;line-height:1.3;font-family:var(--sans)}
.d1{font-size:1.125rem;font-weight:500}
.d2{font-size:1.1875rem}
html.big .crow{grid-template-columns:1fr}
html.big .v{align-items:flex-start;text-align:left;margin-top:4px}
html.big .spark{width:100%;height:44px}
/* 일곱 칸 묶음 끝 — 띠 셈 */
.cells .sum{display:flex;flex-wrap:wrap;column-gap:18px;row-gap:4px;padding:4px 2px;font-family:var(--sans);font-size:1.125rem;font-weight:500;line-height:1.35}
.sum .s-h{flex-basis:100%}
.sum .s-r{display:flex;align-items:center;gap:8px}
.sw-d{flex:none;display:block;width:22px;height:14px;background:var(--navy);border-radius:2px}
.sw-u{flex:none;display:block;width:22px;height:4px;background:var(--rise)}

/* 서랍 */
.drawer > summary{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:10px;row-gap:2px;padding:14px 12px 14px 16px;min-height:64px;border:1.5px solid var(--ink);border-radius:10px;background:var(--page)}
.drawer > summary > span{grid-column:1}
.drawer > summary > .chev{grid-column:2;grid-row:1 / span 6}
.s1{font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.35}
.s2,.s3{font-size:1.1875rem;line-height:1.45;font-weight:500}
.s3{font-weight:700;color:var(--ink)}
.mtag{display:inline-block;border:1.5px dashed var(--ink);border-radius:6px;padding:0 8px;margin-right:6px;font-weight:700;line-height:1.5}
.drawer-body{padding:2px 0 0}
.note2{margin-top:16px;font-size:1.25rem;font-weight:700;color:var(--ink);line-height:1.5}
.note3{margin-top:6px;font-size:1.1875rem;font-weight:500;line-height:1.5}
.per{margin-top:4px;font-size:1.1875rem;font-weight:500;line-height:1.5}
.grp h3 + .per{margin-top:2px}
.sub-h{font-size:1.4375rem;font-weight:700;color:var(--ink);line-height:1.35;margin-top:26px}
.sub-p{font-size:1.1875rem;font-weight:500;line-height:1.5;margin-top:3px}
.shut{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:54px;margin-top:22px;border:1.5px solid var(--ink);border-radius:10px;background:var(--page);color:var(--ink);font-size:1.25rem;font-weight:700}
.shut .chev{transform:rotate(180deg);width:24px;height:24px}

/* 꾀 차례 */
.rank .sub{font-size:1.1875rem;font-weight:500;line-height:1.5}
.rank .sub + .sub{margin-top:2px}
.rank h2{margin-bottom:4px}
.rest{margin-top:14px;border-left:4px solid var(--acc);padding:4px 4px 4px 14px}
.rest .rn{display:block;font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.35}
.rest .rl{display:block;font-size:1.1875rem;font-weight:500;line-height:1.45}
.rest .tl{display:block;font-size:1.1875rem;font-weight:500;line-height:1.4}
.dots{display:flex;gap:5px;margin:7px 0 5px;flex-wrap:wrap}
.dots i{width:17px;height:17px;border-radius:50%;border:2px solid var(--ink);flex:none;display:block}
.dots i.l{background:var(--navy);border-color:var(--navy)}
.tricks{display:grid;gap:10px;margin-top:14px}
.tk{border:1.5px solid var(--ink);border-radius:10px;background:var(--page)}
.tk > summary{display:grid;grid-template-columns:auto 1fr;column-gap:10px;padding:12px 12px 8px}
.tk .rk{grid-column:1;grid-row:1 / span 5;align-self:start;font-family:var(--sans);font-size:1.125rem;font-weight:700;color:var(--ink);border:1.5px solid var(--ink);border-radius:6px;min-width:46px;text-align:center;line-height:1.6;padding:0 4px}
.tk .tn{grid-column:2;grid-row:1;font-size:1.3125rem;font-weight:700;color:var(--ink);line-height:1.35}
.tk .say{grid-column:2;grid-row:2;font-size:1.1875rem;font-weight:500;line-height:1.5;margin-top:3px;text-wrap:pretty}
.tk .dots{grid-column:2;grid-row:3}
.tk .tl{grid-column:2;grid-row:4;font-size:1.125rem;font-weight:500;line-height:1.4}
.tk .cnt{grid-column:2;grid-row:5;font-family:var(--sans);font-size:1.125rem;font-weight:500;line-height:1.4}
.tk .act{grid-column:1 / -1;grid-row:6;justify-self:end;display:flex;align-items:center;gap:4px;min-height:36px;margin-top:4px;font-size:1.125rem;font-weight:700;color:var(--ink)}
.tk .act .chev{width:26px;height:26px}
.tk.ny > summary{grid-template-columns:1fr}
.tk.ny .tn,.tk.ny .say{grid-column:1}
.tk.ny .nytag{grid-column:1;grid-row:3;justify-self:start;margin-top:6px;font-size:1.125rem;font-weight:700;border:1.5px dashed var(--ink);border-radius:6px;padding:0 9px;line-height:1.55}
.tk.ny .act{grid-column:1;grid-row:4}
.tb{border-top:1.5px solid var(--edge);padding:10px 14px 14px}
.pk-h{font-size:1.125rem;font-weight:700;color:var(--ink)}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:7px}
.chips li{border:1.5px solid var(--ink);border-radius:999px;padding:1px 12px;font-size:1.125rem;line-height:1.55}
.ovl{display:grid;gap:8px;margin-top:10px}
.ovl li{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:12px;border:1.5px solid var(--edge);border-radius:3px;padding:9px 12px}
.ovl b{font-size:1.25rem;color:var(--ink)}
.ovl span{font-size:1.125rem;font-weight:500}
.quiet{display:grid;gap:8px;margin-top:10px}
.quiet li{display:flex;align-items:center;gap:12px;border:1.5px solid var(--edge);border-radius:3px;padding:9px 12px}
.quiet .qt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.35}
.quiet .qt b{font-size:1.25rem;color:var(--ink)}
.quiet .qi{font-size:1.125rem;font-weight:500}
.quiet .d{display:block;margin-top:2px}
.quiet .d1,.quiet .d2{display:inline;font-size:1.125rem}
.spark.qsp{flex:none;width:104px;height:36px;margin:0}
html.big .quiet li{flex-wrap:wrap}
html.big .spark.qsp{width:100%}

/* 끝 줄 */
.end{text-align:center}
.end .ph{text-align:left}
.enough{font-size:1.4375rem;font-weight:700;color:var(--ink);line-height:1.4}
.stop{margin-top:16px;text-align:left}
.stop > summary{display:flex;align-items:center;justify-content:center;gap:10px;min-height:64px;border:2px solid var(--ink);border-radius:10px;padding:8px 14px;font-size:1.375rem;font-weight:700;color:var(--ink);line-height:1.3;text-align:center;background:var(--page)}
.stop[open] > summary{border-radius:10px 10px 0 0}
.qs{border:2px solid var(--ink);border-top:0;border-radius:0 0 10px 10px;padding:14px 16px 16px;display:grid;gap:12px}
.qs li{display:flex;gap:12px;align-items:flex-start;font-size:1.25rem;font-weight:500;line-height:1.5}
.qs .qn{flex:none;width:30px;height:30px;border-radius:50%;background:var(--ink);color:var(--page);font-family:var(--sans);font-size:1.125rem;font-weight:700;line-height:30px;text-align:center}
.disc{margin-top:20px;font-size:1.25rem;font-weight:700;color:var(--ink);line-height:1.5}
.asof{margin-top:6px;font-size:1.1875rem;font-weight:500;line-height:1.5}

/* 아래 탭 — 맨 아래 고정 · 지금 탭은 밤색 칸 */
.tabs{position:sticky;bottom:0;z-index:5;display:flex;gap:4px;background:var(--bg);border-top:1.5px solid var(--ink);padding:6px 8px calc(6px + env(safe-area-inset-bottom))}
.tabs button{flex:1 1 auto;min-height:52px;min-width:44px;border:0;border-radius:8px;background:transparent;color:var(--ink2);font-family:var(--sans);font-size:19px;font-weight:500;line-height:1.15;padding:2px 5px;white-space:nowrap}
.tabs button[aria-current="page"]{background:var(--ink);color:var(--page);font-weight:700}
html.big .tabs button{font-size:21px;white-space:normal;overflow-wrap:normal;padding:2px 3px}
'''

JS = r'''
(function(){
  var KEY='sonja3c-big';
  try{ if(localStorage.getItem(KEY)==='1'){ document.documentElement.classList.add('big'); } }catch(e){}
  document.addEventListener('DOMContentLoaded', function(){
    var root=document.documentElement, b=document.getElementById('bigBtn');
    function sync(){ b.setAttribute('aria-pressed', root.classList.contains('big') ? 'true' : 'false'); }
    sync();
    b.addEventListener('click', function(){
      var on=root.classList.toggle('big');
      try{ localStorage.setItem(KEY, on ? '1' : '0'); }catch(e){}
      sync();
    });
    var picks=document.querySelectorAll('.ans button');
    Array.prototype.forEach.call(picks, function(p){
      p.addEventListener('click', function(){
        Array.prototype.forEach.call(picks, function(q){ q.setAttribute('aria-pressed', q===p ? 'true' : 'false'); });
        var a=document.getElementById('noteAfter'); if(a){ a.hidden=false; }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.shut'), function(s){
      s.addEventListener('click', function(){
        var d=s.closest('details'); if(!d){ return; }
        d.open=false;
        var h=d.querySelector('summary'); if(h && h.scrollIntoView){ h.scrollIntoView({block:'start'}); }
      });
    });
    var t=document.getElementById('tabToday');
    if(t){ t.addEventListener('click', function(){ window.scrollTo(0,0); }); }
    /* 책장 — 장이 화면에 처음 들어올 때 한 번만 살짝 올라온다(내용은 처음부터 보임) */
    var still=false;
    try{ still=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
    if(!still && 'IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(en){
          if(en.isIntersecting){ en.target.classList.add('rise'); io.unobserve(en.target); }
        });
      }, {rootMargin:'0px 0px -12% 0px'});
      Array.prototype.forEach.call(document.querySelectorAll('main .sec'), function(s){
        var r=s.getBoundingClientRect();
        if(r.top < window.innerHeight){ return; }   /* 처음부터 보이는 장은 그대로 */
        io.observe(s);
      });
    }
  });
})();
'''

PAGE = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>손자병법 · 오늘</title>
<style>{css}</style>
<script>{js}</script>
</head>
<body>
<header class="top" id="top">
  <div class="brandrow">
    <div class="brand">{mark}<h1>{brand}</h1></div>
    <div class="tools">
      <button type="button" id="bigBtn" aria-pressed="false">글씨 크게</button>
      <button type="button">천사</button>
      <button type="button">선물</button>
    </div>
  </div>
</header>
<section class="cover" aria-label="표지">
  {art}
  <p class="side"><span class="sd">불장 · 꽃이 될 ·</span><span class="sd">돈이 몰리는 곳을 찾아요</span></p>
  <div class="cover-foot">
    {wave}
    <div class="cf-in">
      <p class="c-today">오늘은 <b>{today}</b>이에요</p>
      <p class="c-down"><span>아래로 내려 보세요</span>{chev}</p>
    </div>
  </div>
</section>
<main>
  <section class="sec land" aria-labelledby="h-land">
    {ph1}
    <h2 id="h-land">요즘 장 모습</h2>
    <p class="lsub">땅은 요즘 장의 모습을 부르는 이름이에요.</p>
    <div class="today">{hill}<p class="today-say"><span class="t1">오늘은</span><span class="t2"><b class="tname">{today}</b>이에요.</span></p></div>
    <p class="quote">{quote}</p>
    <p class="do">{do}</p>
    <ol class="lands" aria-label="다섯 땅 가운데 오늘">{land_cells}</ol>
    <p class="why bal">{why1}</p>
    <p class="why bal">{why2}</p>
    <details class="landmean"><summary><span>다섯 땅이 무슨 뜻인가요?</span>{chev}</summary>
      <dl class="ldl">{land_mean}</dl>
    </details>
  </section>

  <section class="sec note" aria-label="쪽지">
    {ph2}
    <div class="notecard">
      <span class="tag">예시</span>
      <p class="q">{note_q}</p>
      <div class="ans">
        <button type="button" aria-pressed="false">했어요</button>
        <button type="button" aria-pressed="false">못 했어요</button>
      </div>
      <p class="after" id="noteAfter" hidden>보기로 넣은 쪽지예요. 눌러도 어디에도 적히지 않아요.</p>
    </div>
  </section>

  <section class="sec found" aria-labelledby="h-found">
    {ph3}
    <h2 id="h-found" class="found-h"><span class="lead">오늘 찾은</span><b class="huge">{n_found}곳</b></h2>
    <p class="fsub">{group_names}</p>
    <p class="fsub bal">{dup_say}</p>
    <div class="legend">
      <div class="cell down mini"><span class="band">한 달 내림</span><span class="lt">한 달 동안 값이 내린 칸</span><b class="lc">{found_down}칸</b></div>
      <div class="cell up mini"><span class="band"><span>오름</span></span><span class="lt">한 달 동안 값이 오른 칸</span><b class="lc">{found_up}칸</b></div>
    </div>
    <p class="howto bal">칸마다 한 달 동안 100원이 얼마가 됐는지 적었어요.</p>
    {groups}
  </section>

  <section class="sec next" aria-label="곧 그렇게 될 듯한 곳">
    {ph4}
    <details class="drawer">
      <summary>
        <span class="s1">곧 그렇게 될 듯한 곳 {n_next}</span>
        <span class="s2">앞날을 맞히는 말이 아니에요.</span>
        <span class="s3"><span class="when-shut">눌러서 보기</span><span class="when-open">눌러서 닫기</span></span>
        {chev}
      </summary>
      <div class="drawer-body">
        <p class="note2">{next_note}</p>
        <p class="note3">{next_count}</p>
        <p class="note3 bal">칸 맨 아래 줄은 지난 한 달에 값이 올랐는지 내렸는지 보여 줘요.</p>
        {next_groups}
        <button type="button" class="shut">닫기{chev}</button>
      </div>
    </details>
  </section>

  <section class="sec rank" aria-labelledby="h-rank">
    {ph5}
    <h2 id="h-rank">이런 땅에서 덜 잃은 꾀</h2>
    <p class="sub">꾀는 회사를 고르는 방법이에요.</p>
    <p class="sub"><span class="nw">지난 {hist}날 가운데</span> <span class="nw">{today}이었던 {fall_days}날로 셌어요</span></p>
    <div class="rest">
      <b class="rn">{rest_easy}</b>
      <span class="rl">{rest_line}</span>
      <span class="dots" aria-hidden="true">{rest_dots}</span>
      <span class="tl">열 번에 한 번도 안 잃어요</span>
    </div>
    <ol class="tricks">{top7}</ol>
  </section>

  <section class="sec more" aria-label="더 보기">
    {ph6}
    <details class="drawer">
      <summary>
        <span class="s1">더 보기</span>
        <span class="s2">나머지 꾀 {n_rest}개</span>
        <span class="s2">여러 묶음에 든 곳 {n_dup_k}</span>
        <span class="s2">조용한 힘 {n_quiet_k}</span>
        <span class="s2"><span class="mtag">아직 못 셈</span>꾀 {n_notyet_k}도 여기 있어요</span>
        {chev}
      </summary>
      <div class="drawer-body">
        <h3 class="sub-h">나머지 꾀 {n_rest}개</h3>
        <ol class="tricks">{rest_rows}</ol>
        <h3 class="sub-h">여러 묶음에 든 곳</h3>
        <ul class="ovl">{overlap}</ul>
        <h3 class="sub-h">조용한 힘 {n_quiet_k}</h3>
        <p class="sub-p">한 달 동안 값은 잔잔한데 외국인과 <span class="nob">연금 · 보험 같은 큰손이</span> 사 모은 곳이에요.</p>
        <ul class="quiet">{quiet}</ul>
        <h3 class="sub-h">아직 못 센 꾀 {n_notyet_k}</h3>
        <p class="sub-p bal">얼마나 많이 사고팔렸는지로 고르는 꾀예요. 예전 기록이 없어 아직 몇 위인지 못 셌어요.</p>
        <ul class="tricks">{notyet}</ul>
        <button type="button" class="shut">닫기{chev}</button>
      </div>
    </details>
  </section>

  <section class="sec end" aria-label="끝">
    {ph7}
    <p class="enough">오늘 볼 것은 여기까지예요</p>
    <details class="stop">
      <summary><span>사기 전에 한 번 멈춰요</span>{chev}</summary>
      <ol class="qs">
        <li><span class="qn">1</span><span>왜 사는지 한 줄로 적을 수 있나요?</span></li>
        <li><span class="qn">2</span><span>얼마를 잃으면 멈출지 정했나요?</span></li>
        <li><span class="qn">3</span><span>남이 알려 준 회사인가요?</span></li>
      </ol>
    </details>
    <p class="disc"><span class="ln">지난 기록만 보여 줘요.</span><span class="ln">사고팔기를 권하지 않아요.</span></p>
    <p class="asof">{asof}</p>
  </section>
</main>
<nav class="tabs" aria-label="아래 탭">
  <button type="button" id="tabToday" aria-current="page">오늘</button>
  <button type="button">업종</button>
  <button type="button">왜 사?</button>
  <button type="button">지난날</button>
  <button type="button">달력</button>
  <button type="button">셈 장부</button>
</nav>
</body>
</html>
'''

out = PAGE.format(
    css=CSS, js=JS, mark=MARK, art=ART, wave=WAVE,
    ph1=ph('제1편'), ph2=ph('제2편'), ph3=ph('제3편'), ph4=ph('제4편'), ph5=ph('제5편'), ph6=ph('제6편'), ph7=ph('맺음'), brand=E(D['brand']), hill=HILL, chev=CHEV,
    today=E(S['name']), do=E(do_text), land_cells=''.join(land_cells), quote=quote_html,
    why1=E(why1), why2=E(why2), land_mean=''.join(land_mean),
    note_q=seg('한 달 전 내 약속 공책에', '적은 대로 했나요?'),
    n_found=n_found,
    group_names=E(' · '.join(g['name'] for g in D['groups']) + ' 곳 %s씩' % NUMK[len(D['groups'][0]['items'])]),
    dup_say=E('%s 곳은 두 묶음에 함께 들어 이름으로는 %d곳이에요.' % (NUMKA[n_dup], n_unique)) if n_dup else '',
    found_down=found_down, found_up=found_up,
    groups=''.join(groups_html),
    n_next=n_next, next_note=next_note_html, next_count=next_count_say, next_groups=''.join(next_html),
    hist=S['histDays'], fall_days=fall_days,
    rest_easy=E(D['rest']['easy']), rest_dots='<i></i>' * 10, rest_line=E(D['rest']['line']),
    top7=''.join(trick_row(e) for e in top7),
    n_rest=len(rest_rank), n_dup_k=NUMK[n_dup], n_notyet_k=NUMK[len(D['notYet'])], n_quiet_k=NUMK[len(D['quiet'])],
    rest_rows=''.join(trick_row(e) for e in rest_rank),
    overlap=overlap_html, quiet=quiet_html,
    notyet=''.join(notyet_row(e) for e in D['notYet']),
    asof=E(D['asOfSay']),
)
open(OUT, 'w', encoding='utf-8').write(out)
print('wrote', OUT, len(out), 'chars')
print('spark range', round(SPARK_R, 3), '| 21곳: 내림', found_down, '오름', found_up, '그대로', found_flat, '| 이름', n_unique, '| 될 듯 겹침', next_dups)
