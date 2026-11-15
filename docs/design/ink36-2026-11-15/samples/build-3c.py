# 샘플 3c 「묶음 책」(SPEC-c · 판 P30) — 실로 묶은 옛 책 한 권 · data.json 을 읽어 sample-3c.html 을 찍어 낸다(지어낸 숫자 0)
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

# ───────── 그림(먹빛 선 · 인라인 SVG) · 판 「묶음 책」 ─────────
import subprocess
FS = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1632/tools/fontsub.py'
def font(key, wt, fam, txt):
    r = subprocess.run(['python3', '-I', FS, key, str(wt), fam, txt], capture_output=True, text=True)
    return r.stdout

# 표(그대로): 불을 뺀 솥 하나 + 솥 밑에서 빼 옆에 쌓아 둔 장작 셋 · 불꽃 없음
MARK = '''<svg class="mark" viewBox="0 0 50 34" aria-hidden="true" focusable="false">
<g fill="none" stroke="#3B2218" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 13 Q17 4.2 26 13" stroke-width="2.4"/>
<path d="M15.2 7.1 H18.8" stroke-width="2.6"/>
<path d="M2.5 13 H31.5" stroke-width="2.6"/>
<path d="M6.5 13 C6.5 22.6 10 26.4 17 26.4 C24 26.4 27.5 22.6 27.5 13" stroke-width="2.4"/>
<path d="M3 32.2 H48" stroke-width="1.9"/>
<circle cx="38.6" cy="27.6" r="3.3" stroke-width="1.9"/>
<circle cx="45.4" cy="27.6" r="3.3" stroke-width="1.9"/>
<circle cx="42" cy="21.6" r="3.3" stroke-width="1.9"/>
</g></svg>'''

# 오늘 땅 그림 — 내리는 땅: 붓으로 한 번에 그은 내리막 획(굵게 시작해 끝이 가늘어짐)
HILL = '''<svg class="hill" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
<path d="M4 10 C10 6 18 7 26 11 C44 20 56 40 70 56 C84 71 98 80 116 83 C100 82 86 76 72 64 C58 52 46 32 30 20 C22 14 12 13 4 16 Z" fill="#3B2218"/>
<path d="M6 87 H114" stroke="#9A6B45" stroke-width="2" stroke-linecap="round"/>
</svg>'''

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
        '<path d="M5 9 L12 16 L19 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')

# 표지 붓 획 — 우리 손으로 새로 그린 한 획(굵게 눌러 시작 · 끝이 가늘게 빠짐 · 마른 붓 틈 두 줄)
STROKE = '''<svg class="stroke" viewBox="0 0 60 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<defs><mask id="dry"><rect width="60" height="520" fill="#fff"/>
<path d="M27 120 C29 220 30 300 31 420" stroke="#000" stroke-width="2.2" fill="none" opacity=".9"/>
<path d="M36 60 C36 160 35 260 33 360" stroke="#000" stroke-width="1.6" fill="none" opacity=".8"/></mask></defs>
<path mask="url(#dry)" d="M14 14 C24 4 46 6 48 22 C48 120 42 260 36 400 C34 450 32 488 30 512 C28 470 24 380 20 260 C18 160 16 80 14 14 Z" fill="#3B2218"/>
</svg>'''

# 표지 아랫단 — 겹친 종이 두께(가는 선 여럿)
THICK = '<div class="thick" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'
# 왼쪽 가장자리 — 다섯 구멍 실 묶음(밤색 실)
BIND = '<div class="bind" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'
# 판심 고기 꼬리 표(검은 어미)
FISH = '<svg class="fish" viewBox="0 0 22 14" aria-hidden="true" focusable="false"><path d="M1 1 H21 V13 L11 7.5 L1 13 Z" fill="#3B2218"/></svg>'

def ph(no, name):
    '''장 머리 — 옛 책 판심처럼: 겹 테두리 안에 고기 꼬리 표 · 작은 장 번호 · 장 이름'''
    return ('<p class="ph"><span class="pbox">%s<span class="pno">%s</span><span class="pnm">%s</span></span>'
            '<i aria-hidden="true"></i></p>') % (FISH, no, name)


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

# ───────── 조각 · 책 목차처럼 한 줄에 한 곳 ─────────
def kind_of(it):
    ch = it.get('ch20')
    return 'down' if (ch is not None and ch < 0) else ('flat' if ch == 0 else 'up')

BAND = {'down': '<span class="band">한 달 내림</span>',
        'up': '<span class="band">오름</span>',
        'flat': '<span class="band">그대로</span>'}

def days_html(d):
    return '<span class="d"><span class="d1">이 묶음에 든 지</span> <b class="d2">%d일</b></span>' % int(d)

LEAD = '<i class="ldr" aria-hidden="true"></i>'

def cell(it, nxt=False):
    """목차 한 줄 — 이름 ··· 100원이 ○원 / 이 묶음에 든 지 ○일 ··· 판별(내림이면 줄 전체가 짙은 먹빛 띠)"""
    k = kind_of(it)
    v = '<span class="v"><span class="v1">%s100원이</span><b class="v2">%s원</b></span>' % (
        '지난 한 달 ' if nxt else '', E(it['v100']))
    left2 = days_html(it['days']) if it.get('days') else '<span class="d"><span class="d1">지난 한 달</span></span>'
    return ''.join(['<li class="row %s%s">' % (k, ' next' if nxt else ''),
                    '<div class="r1"><b class="nm">%s</b>%s%s</div>' % (nm(it['name']), LEAD, v),
                    '<div class="r2">%s%s%s</div>' % (left2, LEAD, BAND[k]),
                    '</li>'])

def group_sum(items):
    """묶음 끝 셈(진짜 줄 수)"""
    dn = sum(1 for it in items if kind_of(it) == 'down')
    up = sum(1 for it in items if kind_of(it) == 'up')
    fl = len(items) - dn - up
    rows = ['<span class="s-h">%s곳 가운데</span>' % (NUMK[len(items)] + ' ' if len(items) <= 10 else '%d' % len(items)),
            '<span class="s-r"><i class="sw-d" aria-hidden="true"></i>한 달 내림 <b>%d곳</b></span>' % dn,
            '<span class="s-r"><i class="sw-u" aria-hidden="true"></i>오름 <b>%d곳</b></span>' % up]
    if fl:
        rows.append('<span class="s-r"><i class="sw-u" aria-hidden="true"></i>그대로 <b>%d곳</b></span>' % fl)
    return '<li class="sum">%s</li>' % ''.join(rows)

def cells_html(items, nxt=False):
    return '<ol class="toc">%s%s</ol>' % (''.join(cell(it, nxt) for it in items), group_sum(items))



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

MY_TXT = ' '.join([
    '불장 · 꽃이 될 · 돈이 몰리는 곳을 찾아요', '오늘은 이에요', S['name'], '요즘 장 모습 오늘 찾은 곳',
    '이런 땅에서 덜 잃은 꾀', '오늘 볼 것은 여기까지예요', '곧 그렇게 될 듯한 곳 더 보기', '나머지 꾀 개 여러 묶음에 든 곳 조용한 힘 아직 못 센 꾀',
    '첫째 둘째 셋째 넷째 다섯째 여섯째 장 맺음 오늘 쪽지 찾은 곳 서랍 쉬어 가기 끝 줄 0123456789',
    ' '.join(g['name'] for g in D['groups'] + D['next']), D['rest']['easy'], '하나둘셋넷다섯여섯일곱여덟아홉열',
])
FONTS = font('nanum-brush-script', 400, 'BrushKR', D['brand']) + font('nanum-myeongjo', 800, 'MyeongKR', MY_TXT)

DIAMOND = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E"
           "%3Cpath d='M14 1 L27 14 L14 27 L1 14 Z M14 8 L20 14 L14 20 L8 14 Z' fill='none' stroke='%233B2218' stroke-opacity='.09' stroke-width='1'/%3E%3C/svg%3E")

CSS = FONTS + r'''
:root{--bg:#EFE1CC;--page:#F5EBDB;--ink:#3B2218;--acc:#9A6B45;--down:#2A1A14;--rule:#C8AD8B;--pale:#F9F2E7;--cover:#E9D7BC;
--my:"MyeongKR","Nanum Myeongjo","Noto Serif CJK KR",serif;--brush:"BrushKR","MyeongKR",serif;--sans:"Noto Sans CJK KR","Noto Sans KR",sans-serif}
*{box-sizing:border-box}
html{font-size:16px;background:var(--bg);-webkit-text-size-adjust:100%;text-size-adjust:100%}
html.big{font-size:20px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:1.3125rem;font-weight:500;line-height:1.6;word-break:keep-all;overflow-wrap:anywhere;-webkit-font-smoothing:antialiased;overflow-x:hidden}
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
:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.when-open{display:none}
details[open] > summary .when-open{display:inline}
details[open] > summary .when-shut{display:none}
.chev{width:28px;height:28px;flex:none;display:block}
details[open] > summary .chev{transform:rotate(180deg)}

/* 머리 — 표지 위 */
.top{padding:10px 14px 6px 56px;background:var(--cover)}
.brandrow{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mark{width:42px;height:29px;flex:none;display:block}
.tools{display:flex;gap:6px;margin-left:auto}
.tools button{width:58px;min-height:52px;padding:2px 3px;border:1.5px solid var(--ink);border-radius:2px;background:var(--pale);color:var(--ink);font-size:1.125rem;font-weight:700;line-height:1.2;text-align:center}
.tools button[aria-pressed="true"]{background:var(--down);color:#FFF8EE}
html.big .tools button{width:auto;min-width:58px;padding:4px 8px}

/* 표지 — 실로 묶은 옛 책 · 눌러 찍은 마름모 결 */
.cover{position:relative;min-height:calc(100svh - 136px);padding:8px 14px 0 56px;background:var(--cover) url("''' + DIAMOND + r'''") 0 0/28px 28px;display:grid;grid-template-columns:1fr auto;grid-template-rows:1fr auto auto;overflow:hidden;transform-origin:top center}
.bind{position:absolute;left:0;top:-70px;bottom:0;width:46px;border-right:1.5px solid var(--rule);background:var(--cover)}
.bind::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:3px;background:var(--acc)}
.bind i{position:absolute;left:16px;width:15px;height:15px;border-radius:50%;background:var(--cover);border:3.5px solid var(--acc)}
.bind i::before{content:"";position:absolute;right:100%;top:50%;margin-top:-1.5px;width:17px;height:3px;background:var(--acc)}
.bind i:nth-child(1){top:12%}.bind i:nth-child(2){top:31%}.bind i:nth-child(3){top:50%}.bind i:nth-child(4){top:69%}.bind i:nth-child(5){top:88%}
.cv-art{grid-column:1;grid-row:1;position:relative;display:flex;justify-content:center;align-items:flex-start;padding-top:6px}
.slip{position:relative;background:var(--pale);border:1.5px solid var(--ink);outline:1px solid var(--ink);outline-offset:-6px;padding:18px 10px 22px;box-shadow:3px 4px 0 rgba(59,34,24,.12)}
h1.title{writing-mode:vertical-rl;text-orientation:upright;font-family:var(--brush);font-weight:400;font-size:7.25rem;line-height:1;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;-webkit-text-stroke:1.6px var(--ink);paint-order:stroke fill}
html.big h1.title{font-size:5.9rem}
.stroke{position:absolute;left:calc(50% + 66px);top:20px;width:30px;height:calc(100% - 30px);max-height:470px}
.side{grid-column:2;grid-row:1;align-self:start;writing-mode:vertical-rl;font-family:var(--my);font-size:1.3125rem;font-weight:800;color:var(--ink);line-height:1.7;letter-spacing:.14em;background:var(--cover);padding:8px 4px;margin-top:10px}
.side .sd{display:block}
.c-foot{grid-column:1 / -1;grid-row:2;background:var(--cover);padding:14px 4px 10px;margin:0 -4px}
.c-today{font-family:var(--my);font-size:1.5rem;font-weight:800;line-height:1.3}
.c-today b{font-size:2.25rem;font-weight:800;letter-spacing:.02em;border-bottom:4px solid var(--down)}
.c-down{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:1.1875rem;font-weight:700}
.c-down .chev{width:24px;height:24px}
.thick{grid-column:1 / -1;grid-row:3;margin:0 -14px 0 -10px;padding-top:2px}
.thick i{display:block;height:1.5px;background:var(--acc);margin-top:3px}
.thick i:nth-child(2){margin-left:3px;opacity:.85}.thick i:nth-child(3){margin-left:6px;opacity:.7}.thick i:nth-child(4){margin-left:9px;opacity:.55}.thick i:nth-child(5){margin-left:12px;opacity:.4;margin-bottom:4px}
@keyframes roll{0%{transform:perspective(900px) rotateX(0)}45%{transform:perspective(900px) rotateX(-9deg) translateY(-10px)}100%{transform:none}}
html.mo .cover{animation:roll .6s ease-out 1}

/* 장 — 한 장씩 넘어오는 종이 · 왼쪽 실 점이 이어짐 */
main{padding:0 0 18px}
.sec{position:relative;background:var(--page);padding:20px 14px 30px 58px;border-bottom:1.5px solid var(--rule);box-shadow:0 3px 0 var(--bg),0 4.5px 0 var(--rule),0 7.5px 0 var(--bg),0 9px 0 var(--rule);margin-bottom:14px}
.sec::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:3px;background:var(--acc);transform-origin:top}
.sec::after{content:"";position:absolute;left:0;top:0;bottom:0;width:46px;border-right:1.5px solid var(--rule);background:radial-gradient(circle at 23.5px 48px,var(--page) 0 5px,var(--acc) 5.5px 9px,transparent 9.5px) 0 0/46px 168px repeat-y;pointer-events:none}
.sec.tie::before{animation:tie .9s ease-out 1}
@keyframes tie{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@media (prefers-reduced-motion: reduce){.sec.tie::before,html.mo .cover{animation:none}}
.ph{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.pbox{display:inline-flex;align-items:center;gap:8px;border:3px double var(--ink);padding:1px 10px 1px 8px;font-family:var(--my);font-size:1.125rem;font-weight:800;line-height:1.5;letter-spacing:.08em;white-space:nowrap}
.fish{width:20px;height:13px;display:block;flex:none}
.pnm{border-left:1px solid var(--ink);padding-left:8px}
.ph i{flex:1 1 auto;height:1px;background:var(--ink);display:block}
h2{font-family:var(--my);font-size:1.75rem;font-weight:800;line-height:1.3;margin-bottom:10px}
h3{font-family:var(--my);font-weight:800}

/* 요즘 장 모습 */
.lsub{font-size:1.1875rem;line-height:1.5;margin-bottom:8px}
.today{display:flex;align-items:center;gap:12px}
.hill{width:96px;height:72px;flex:none;display:block}
.today-say{line-height:1.25;font-family:var(--my);font-weight:800}
.today-say .t1{display:block;font-size:1.3125rem}
.today-say .t2{display:block;font-size:1.3125rem;margin-top:2px}
.today-say .tname{font-size:2.375rem;font-weight:800}
html.big .today-say .tname{font-size:2rem}
.quote{margin-top:16px;padding:6px 0 6px 14px;border-left:4px solid var(--down);font-family:var(--my);font-size:1.375rem;font-weight:800;line-height:1.55}
.do{margin-top:12px;font-size:1.375rem;font-weight:700;line-height:1.45}
.lands{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;margin-top:16px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:4px 0}
.lands li{display:flex;flex-direction:column;align-items:center;padding:6px 0 5px;font-size:1.09375rem;font-weight:500;letter-spacing:-.03em;line-height:1.25;text-align:center;min-width:0}
.lands li span{white-space:nowrap;overflow-wrap:normal}
.lands .gl{width:34px;height:20px;margin-bottom:3px;display:block}
.lands li.now{background:var(--down);color:#FFF8EE;font-weight:700}
html.big .lands{grid-template-columns:repeat(3,1fr);row-gap:8px}
.why{margin-top:14px;font-size:1.3125rem;line-height:1.55}
.why + .why{margin-top:4px}
.landmean{margin-top:16px;border-top:1.5px solid var(--ink);border-bottom:1.5px solid var(--ink)}
.landmean > summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:54px;padding:5px 2px;font-size:1.25rem;font-weight:700}
.ldl{display:grid;gap:10px;padding:2px 0 14px}
.ld{border-top:1px solid var(--rule);padding:10px 2px 2px}
.ld dt{display:flex;align-items:center;gap:8px;font-size:1.25rem;font-weight:700;line-height:1.35}
.ld dt .gl{width:34px;height:21px;flex:none}
.nowtag{background:var(--down);color:#FFF8EE;font-size:1.125rem;font-weight:700;padding:0 8px;line-height:1.55}
.ld dd{font-size:1.1875rem;line-height:1.55;margin-top:4px}

/* 쪽지 */
.notecard{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:14px 0 16px}
.tag{display:inline-block;font-size:1.125rem;font-weight:700;border:1.5px solid var(--ink);padding:0 9px;line-height:1.55}
.q{margin-top:10px;font-size:1.375rem;font-weight:700;line-height:1.45}
.ans{display:flex;gap:10px;margin-top:14px}
.ans button{flex:1 1 0;min-height:58px;border:1.5px solid var(--ink);border-radius:2px;background:var(--pale);color:var(--ink);font-size:1.25rem;font-weight:700;line-height:1.2;padding:4px 6px}
.ans button[aria-pressed="true"]{background:var(--down);color:#FFF8EE}
.after{margin-top:10px;font-size:1.1875rem}

/* 오늘 찾은 21곳 — 책 속 목차 */
.found-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.found-h .lead{font-size:1.5rem}
.huge{font-family:var(--sans);font-size:3rem;font-weight:700;line-height:1.05}
.fsub{font-size:1.1875rem;line-height:1.5}
.legend{display:grid;gap:8px;margin-top:16px}
.lg{display:flex;align-items:center;gap:10px;font-size:1.1875rem;line-height:1.35}
.lg .band{flex:none;min-width:118px;text-align:center;padding:5px 8px}
.lg.down .band{background:var(--down);color:#FFF8EE;font-weight:700}
.lg.up .band{background:var(--pale);border-bottom:1px solid var(--ink);font-weight:500}
.lg b{margin-left:auto;font-size:1.5rem;white-space:nowrap}
.howto{font-size:1.1875rem;line-height:1.5;margin-top:12px}
.grp{margin-top:34px}
.grp h3{font-size:1.5rem;line-height:1.3;display:flex;align-items:center;gap:10px}
.grp h3::after{content:"";flex:1 1 auto;height:1px;background:var(--ink)}
.what{font-size:1.1875rem;line-height:1.5;margin-top:4px}
.toc{margin-top:10px;border-top:1.5px solid var(--ink)}
.row{padding:13px 10px 13px;border-bottom:1px solid var(--rule);line-height:1.3}
.r1,.r2{display:flex;align-items:baseline;gap:0;min-width:0}
.r1{flex-wrap:wrap}
.r2{margin-top:6px}
.ldr{flex:1 1 16px;min-width:16px;align-self:center;height:0;border-bottom:3px dotted currentColor;opacity:.5;margin:0 8px}
.r1{align-items:flex-end}.r1 .ldr{align-self:flex-end;margin-bottom:8px}.r1 .nm{padding-bottom:1px}
.nm{font-size:1.375rem;font-weight:700;min-width:0}
.v{display:flex;flex-direction:column;align-items:flex-end;white-space:nowrap;margin-left:auto;line-height:1.15}
.v1{font-size:1.125rem;font-weight:500}
.v2{font-size:1.875rem;font-weight:700;letter-spacing:-.01em;line-height:1}
.d{font-size:1.125rem;white-space:nowrap}
.d2{font-size:1.1875rem}
.band{font-size:1.1875rem;white-space:nowrap;line-height:1.3}
.row.down{background:var(--down);color:#FFF8EE;border-bottom-color:var(--down);margin-bottom:2px}
.row.down .band{font-weight:700;border:1.5px solid #FFF8EE;padding:1px 8px}
.row.up,.row.flat{background:var(--pale)}
.row.up .band,.row.flat .band{font-weight:500;border-bottom:1px solid var(--ink);padding:0 4px}
.row.next{border-bottom-style:dashed}
html.big .r1 .ldr{display:none}
html.big .v{margin-left:auto}
.toc .sum{display:flex;flex-wrap:wrap;column-gap:18px;row-gap:4px;padding:10px 2px 2px;font-size:1.125rem;line-height:1.35}
.sum .s-h{flex-basis:100%}
.sum .s-r{display:flex;align-items:center;gap:8px}
.sw-d{flex:none;display:block;width:22px;height:14px;background:var(--down)}
.sw-u{flex:none;display:block;width:22px;height:14px;background:var(--pale);border-bottom:1.5px solid var(--ink)}

/* 서랍 */
.drawer > summary{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:10px;row-gap:2px;padding:14px 4px;min-height:64px;border-top:3px double var(--ink);border-bottom:3px double var(--ink)}
.drawer > summary > span{grid-column:1}
.drawer > summary > .chev{grid-column:2;grid-row:1 / span 6}
.s1{font-family:var(--my);font-size:1.5rem;font-weight:800;line-height:1.35}
.s2,.s3{font-size:1.1875rem;line-height:1.45}
.s3{font-weight:700}
.mtag{display:inline-block;border:1.5px dashed var(--ink);padding:0 8px;margin-right:6px;font-weight:700;line-height:1.5}
.drawer-body{padding:2px 0 0}
.note2{margin-top:16px;font-size:1.25rem;font-weight:700;line-height:1.5}
.note3{margin-top:6px;font-size:1.1875rem;line-height:1.5}
.per{margin-top:4px;font-size:1.1875rem;line-height:1.5}
.sub-h{font-size:1.5rem;line-height:1.35;margin-top:30px}
.sub-p{font-size:1.1875rem;line-height:1.5;margin-top:3px}
.shut{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:54px;margin-top:22px;border:1.5px solid var(--ink);border-radius:2px;background:var(--pale);color:var(--ink);font-size:1.25rem;font-weight:700}
.shut .chev{transform:rotate(180deg);width:24px;height:24px}

/* 쉬어 가기와 꾀 차례 */
.rank .sub{font-size:1.1875rem;line-height:1.5}
.rank .sub + .sub{margin-top:2px}
.rest{margin-top:18px;border-left:4px solid var(--down);padding:4px 4px 4px 14px}
.rest .rn{display:block;font-family:var(--my);font-size:1.75rem;font-weight:800;line-height:1.3}
.rest .rl{display:block;font-size:1.1875rem;line-height:1.45}
.rest .tl{display:block;font-size:1.1875rem;line-height:1.4}
.dots{display:flex;gap:5px;margin:7px 0 5px;flex-wrap:wrap}
.dots i{width:17px;height:17px;border-radius:50%;border:2px solid var(--ink);flex:none;display:block}
.dots i.l{background:var(--down);border-color:var(--down)}
.tricks{display:grid;margin-top:16px;border-top:1.5px solid var(--ink)}
.tk{border-bottom:1px solid var(--rule)}
.tk > summary{display:grid;grid-template-columns:auto 1fr;column-gap:12px;padding:14px 2px 8px}
.tk .rk{grid-column:1;grid-row:1 / span 5;align-self:start;font-family:var(--my);font-size:1.25rem;font-weight:800;min-width:46px;text-align:center;line-height:1.5;border-bottom:3px double var(--ink)}
.tk .tn{grid-column:2;grid-row:1;font-size:1.3125rem;font-weight:700;line-height:1.35}
.tk .say{grid-column:2;grid-row:2;font-size:1.1875rem;line-height:1.5;margin-top:3px;text-wrap:pretty}
.tk .dots{grid-column:2;grid-row:3}
.tk .tl{grid-column:2;grid-row:4;font-size:1.125rem;line-height:1.4}
.tk .cnt{grid-column:2;grid-row:5;font-size:1.125rem;line-height:1.4}
.tk .act{grid-column:1 / -1;grid-row:6;justify-self:end;display:flex;align-items:center;gap:4px;min-height:36px;margin-top:4px;font-size:1.125rem;font-weight:700}
.tk .act .chev{width:26px;height:26px}
.tk.ny > summary{grid-template-columns:1fr}
.tk.ny .tn,.tk.ny .say{grid-column:1}
.tk.ny .nytag{grid-column:1;grid-row:3;justify-self:start;margin-top:6px;font-size:1.125rem;font-weight:700;border:1.5px dashed var(--ink);padding:0 9px;line-height:1.55}
.tk.ny .act{grid-column:1;grid-row:4}
.tb{border-top:1px solid var(--rule);padding:10px 2px 14px}
.pk-h{font-size:1.125rem;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:7px}
.chips li{border-bottom:1.5px solid var(--ink);padding:1px 6px;font-size:1.125rem;line-height:1.55}
.ovl{margin-top:10px;border-top:1px solid var(--ink)}
.ovl li{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:12px;border-bottom:1px solid var(--rule);padding:10px 2px}
.ovl b{font-size:1.25rem}
.ovl span{font-size:1.125rem}
.quiet{margin-top:10px;border-top:1px solid var(--ink)}
.quiet li{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--rule);padding:10px 2px}
.quiet .qt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.35}
.quiet .qt b{font-size:1.25rem}
.quiet .qi{font-size:1.125rem}
.quiet .d{display:block;margin-top:2px;white-space:normal}
.quiet .d1,.quiet .d2{display:inline;font-size:1.125rem}
.spark{display:block;color:var(--ink);overflow:visible}
.spark.qsp{flex:none;width:96px;height:36px;margin:0}
html.big .quiet li{flex-wrap:wrap}
html.big .spark.qsp{width:100%}

/* 끝 줄 */
.end{text-align:center}
.enough{font-family:var(--my);font-size:1.5rem;font-weight:800;line-height:1.4}
.stop{margin-top:18px;text-align:left}
.stop > summary{display:flex;align-items:center;justify-content:center;gap:10px;min-height:64px;border:2px solid var(--ink);border-radius:2px;padding:8px 14px;font-size:1.375rem;font-weight:700;line-height:1.3;text-align:center;background:var(--pale)}
.qs{border:2px solid var(--ink);border-top:0;padding:14px 16px 16px;display:grid;gap:12px;background:var(--pale)}
.qs li{display:flex;gap:12px;align-items:flex-start;font-size:1.25rem;line-height:1.5}
.qs .qn{flex:none;width:30px;height:30px;border-radius:50%;background:var(--down);color:#FFF8EE;font-size:1.125rem;font-weight:700;line-height:30px;text-align:center}
.disc{margin-top:22px;font-size:1.25rem;font-weight:700;line-height:1.5}
.asof{margin-top:6px;font-size:1.1875rem;line-height:1.5}

/* 아래 탭 */
.tabs{position:sticky;bottom:0;z-index:5;display:flex;gap:4px;background:var(--cover);border-top:3px double var(--ink);padding:6px 8px calc(6px + env(safe-area-inset-bottom))}
.tabs button{flex:1 1 auto;min-height:52px;min-width:44px;border:0;border-radius:2px;background:transparent;color:var(--ink);font-size:19px;font-weight:500;line-height:1.15;padding:2px 5px;white-space:nowrap}
.tabs button[aria-current="page"]{background:var(--down);color:#FFF8EE;font-weight:700}
html.big .tabs button{font-size:21px;white-space:normal;overflow-wrap:normal;padding:2px 3px}
'''

JS = r'''
(function(){
  var KEY='sonja3c-big', root=document.documentElement, still=false;
  try{ if(localStorage.getItem(KEY)==='1'){ root.classList.add('big'); } }catch(e){}
  try{ still=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(!still){ root.classList.add('mo'); }
  document.addEventListener('DOMContentLoaded', function(){
    var b=document.getElementById('bigBtn');
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
    /* 장 사이 실 — 장이 화면에 처음 들어올 때 한 번만 이어진다(실이 없을 때도 내용은 그대로 보임) */
    if(!still && 'IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('tie'); io.unobserve(en.target); } });
      }, {rootMargin:'0px 0px -10% 0px'});
      Array.prototype.forEach.call(document.querySelectorAll('main .sec'), function(s){
        if(s.getBoundingClientRect().top < window.innerHeight){ return; }
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
    {mark}
    <div class="tools">
      <button type="button" id="bigBtn" aria-pressed="false">글씨 크게</button>
      <button type="button">천사</button>
      <button type="button">선물</button>
    </div>
  </div>
</header>
<section class="cover" aria-label="표지">
  {bind}
  <div class="cv-art"><div class="slip"><h1 class="title">{brand}</h1></div>{stroke}</div>
  <p class="side"><span class="sd">불장 · 꽃이 될 ·</span><span class="sd">돈이 몰리는 곳을 찾아요</span></p>
  <div class="c-foot">
    <p class="c-today">오늘은 <b>{today}</b>이에요</p>
    <p class="c-down"><span>아래로 내려 보세요</span>{chev}</p>
  </div>
  {thick}
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
      <p class="lg down"><span class="band">한 달 내림</span><span>한 달 동안 값이 내린 곳</span><b>{found_down}곳</b></p>
      <p class="lg up"><span class="band">오름</span><span>한 달 동안 값이 오른 곳</span><b>{found_up}곳</b></p>
    </div>
    <p class="howto bal">줄마다 한 달 동안 100원이 얼마가 됐는지 적었어요.</p>
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
        <p class="note3 bal">줄 끝 이름표는 지난 한 달에 값이 올랐는지 내렸는지 보여 줘요.</p>
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
    css=CSS, js=JS, mark=MARK, bind=BIND, stroke=STROKE, thick=THICK,
    ph1=ph('첫째 장', '오늘'), ph2=ph('둘째 장', '쪽지'), ph3=ph('셋째 장', '찾은 곳'), ph4=ph('넷째 장', '서랍'),
    ph5=ph('다섯째 장', '쉬어 가기'), ph6=ph('여섯째 장', '더 보기'), ph7=ph('맺음', '끝 줄'),
    brand=E(D['brand']), hill=HILL, chev=CHEV,
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
