# 돌이 36장 견본 — 테마 시계 7판 기준 · 장마다 「다음」 하나로 물 흐르듯 이어짐
import json, re, os, html
R = '/home/claude/atlas-video/'
P = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/'
OUT = R + 'docs/design/theme-2026-10-19/flow36/'
os.makedirs(OUT, exist_ok=True)
RR = json.load(open(P + 'rrg.json'))
ST = {r['n']: r for r in json.load(open(P + 'stages.json'))}
CORE = json.load(open(R + 'site/atlas/data/core.json'))
MKT = CORE['mkt']; ASOF = str(CORE.get('asOf', ''))[:10]
QS = [('왜 사?', ['친구 말', '뉴스', '내가 따져 봄']), ('공부했어?', ['했다', '조금', '안 했다']), ('뭐가 좋아?', ['돈을 잘 번다', '클 일이 있다', '그냥 오를 것 같다']),
      ('얼마 넣어?', ['내 돈 열에 하나 이하', '반쯤', '거의 다']), ('흐름은?', ['조용히 조금씩 오름', '떨어지는 중', '다들 떠들며 급등']), ('얼마나 올랐어?', ['아직', '조금', '벌써 두 배']),
      ('떨어지면?', ['팔 곳 정함', '생각만', '안 정함']), ('오르면?', ['정함', '모름', '끝까지 간다']), ('언제 쓸 돈?', ['1년 넘게', '몇 달 안', '곧']), ('마음은?', ['차분', '놓칠까 급함', '본전 생각']), ('나눠 넣어?', ['세 곳 이상', '두 곳', '한 곳'])]

src = open(R + 'docs/design/theme-2026-10-19/mock/s1-home.html', encoding='utf-8').read()
HEAD = src[:src.index('<div class="top">')]
HEAD = HEAD.replace('</style>', '''.pg{display:flex;justify-content:space-between;align-items:center;font-size:17px;color:#BDBDBD;margin:8px 0 0}.pg b{color:#fff;font-weight:600}
.flow{display:flex;gap:4px;margin:8px 0 0}.flow i{flex:1;height:4px;border-radius:2px;background:#2A2A2A}.flow i.on{background:#FF6A3D}.flow i.pd{background:#6E6E6E}
.next{display:flex;justify-content:space-between;align-items:center;min-height:64px;border-radius:32px;background:#fff;color:#080808;font-size:21px;font-weight:800;padding:0 24px;margin:24px 0 8px;text-decoration:none}
.next small{display:block;font-size:17px;font-weight:600;color:#5E5E5E}.ex2{display:inline-block;font-size:17px;border:1px solid #6E6E6E;border-radius:8px;padding:0 8px;color:#BDBDBD;margin-left:8px}
.lst{display:flex;align-items:center;gap:16px;min-height:64px;border-bottom:1px solid #2A2A2A;font-size:21px}.lst .nm{flex:1;font-size:21px}.lst b{font-weight:700}.up{color:#FF6A3D}.dn{color:#6C86FF}
.qbox{border:1px solid #3A3A3A;border-radius:20px;padding:16px;margin:8px 0 16px}.qbox .qq{font-size:30px;font-weight:800;margin:0 0 16px}
.opt{display:flex;align-items:center;min-height:56px;border:1px solid #3A3A3A;border-radius:16px;padding:0 16px;margin:0 0 8px;font-size:21px}.opt.on{border-color:#FF6A3D;color:#FF6A3D;font-weight:700}
.tl{display:flex;gap:8px;margin:8px 0 16px}.tl div{flex:1;border-radius:12px;padding:8px;text-align:center;border:1px solid #3A3A3A}.tl b{display:block;font-size:30px}
.sw{display:flex;justify-content:space-between;align-items:center;min-height:64px;border-bottom:1px solid #2A2A2A;font-size:21px}.sw i{width:52px;height:30px;border-radius:15px;background:#FF6A3D;position:relative}.sw i:after{content:"";position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#080808}.sw i.off{background:#3A3A3A}.sw i.off:after{left:3px;right:auto;background:#BDBDBD}
.kk{display:flex;align-items:center;justify-content:center;min-height:56px;border-radius:12px;background:#FEE500;color:#191919;font-size:21px;font-weight:700;margin:16px 0}
.cpn{border:2px dashed #F9D21C;border-radius:20px;padding:16px;text-align:center;margin:16px 0}.cpn b{font-size:30px;color:#F9D21C;letter-spacing:.06em}
.big2{font-size:48px;font-weight:800;line-height:1.1;margin:8px 0}.cap{font-size:17px;color:#BDBDBD}
.chap{font-size:17px;color:#FF6A3D;font-weight:700;letter-spacing:.04em}</style>''', 1)
TABS = ['테마', '시황', '매매일지', '관심', '보유종목']

q = lambda r, m: ('꽃' if r >= 100 and m >= 100 else '시듦' if r >= 100 else '잠잠' if m < 100 else '싹')
def checks(n):
    s = ST[n]
    return [('시장보다 힘이 붙어요', True), ('오른 회사가 늘어요', s['now'] >= s['tot'] / 2 and s['now'] >= s['before']), ('큰 회사도 움직여요', (s['big'] or 0) >= 1), ('값이 진짜로 올라요', s['chg'] > 0)]
sc = lambda n: sum(ok for _, ok in checks(n))
def days(o):
    d = 0
    for p in reversed(o['tail']):
        if q(*p) == q(*o['tail'][-1]): d += 1
        else: break
    return d
dist = lambda o: 100 - o['tail'][-1][0]
QD = {k: [o for o in RR if q(*o['tail'][-1]) == k] for k in ['싹', '꽃', '시듦', '잠잠']}
SP = sorted(QD['싹'], key=lambda o: (-sc(o['n']), dist(o)))
TOP = [o['n'] for o in SP[:3]]
T1 = SP[0]['n']; S1 = ST[T1]; O1 = SP[0]
CO = max(S1['mem'], key=lambda x: x['d10'])

def clock(hi=None, W=326, H=300, span=4.0, nums=True):
    cl = lambda v: max(100 - span, min(100 + span, v)); X = lambda v: W / 2 + (cl(v) - 100) / span * (W / 2 - 14); Y = lambda v: H / 2 - (cl(v) - 100) / span * (H / 2 - 14)
    g = f'<rect x="0" y="0" width="{W/2}" height="{H/2}" fill="#FF6A3D" opacity=".10"/><line x1="{W/2}" y1="0" x2="{W/2}" y2="{H/2}" stroke="#FF6A3D" stroke-width="2" stroke-dasharray="4 4"/><line x1="0" y1="{H/2}" x2="{W}" y2="{H/2}" stroke="#3A3A3A"/><line x1="{W/2}" y1="{H/2}" x2="{W/2}" y2="{H}" stroke="#3A3A3A"/>'
    lab = f'<text x="10" y="24" fill="#FF6A3D" font-size="19" font-weight="700">싹</text><text x="{W-10}" y="24" text-anchor="end" fill="#fff" font-size="19" font-weight="700">꽃</text><text x="{W/2+6}" y="{H/2-8}" fill="#FF6A3D" font-size="17">꽃 선</text><text x="{W-10}" y="{H-10}" text-anchor="end" fill="#BDBDBD" font-size="19" font-weight="700">시듦</text><text x="10" y="{H-10}" fill="#BDBDBD" font-size="19" font-weight="700">잠잠</text>'
    defs = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6E6E6E"/></marker></defs>'
    arr = f'<path d="M {W/2-50} 40 Q {W/2} 14 {W/2+50} 40" fill="none" stroke="#6E6E6E" stroke-width="2" marker-end="url(#ah)"/><path d="M {W-40} {H/2-50} Q {W-14} {H/2} {W-40} {H/2+50}" fill="none" stroke="#6E6E6E" stroke-width="2" marker-end="url(#ah)"/><path d="M {W/2+50} {H-40} Q {W/2} {H-14} {W/2-50} {H-40}" fill="none" stroke="#6E6E6E" stroke-width="2" marker-end="url(#ah)"/><path d="M 40 {H/2+50} Q 14 {H/2} 40 {H/2-50}" fill="none" stroke="#6E6E6E" stroke-width="2" marker-end="url(#ah)"/>'
    tails = dots = top = ''
    marks = [hi] if hi else (TOP if nums else [])
    for o in RR:
        r, m = o['tail'][-1]; isq = q(r, m) == '싹'; mk = o['n'] in marks
        if mk: tails += '<polyline points="' + ' '.join(f'{X(a):.1f},{Y(b):.1f}' for a, b in o['tail']) + '" fill="none" stroke="#FF6A3D" stroke-width="2.5" opacity=".85"/>'
        on = mk or (isq and not hi)
        dots += f'<circle cx="{X(r):.1f}" cy="{Y(m):.1f}" r="{6 if on else 3.5}" fill="{"#FF6A3D" if on else "#5E5E5E"}" stroke="#080808" stroke-width="1.5"/>'
    if hi:
        o = next(o for o in RR if o['n'] == hi); r, m = o['tail'][-1]
        top = f'<text x="{X(r)-12:.1f}" y="{Y(m)-14:.1f}" text-anchor="end" fill="#fff" font-size="17">{hi}</text>'
    elif nums:
        for i, n in enumerate(TOP, 1):
            o = next(o for o in RR if o['n'] == n); r, m = o['tail'][-1]; x = X(r) - 16 * (i % 2 * 2 - 1) - 8; y = Y(m) - 18
            top += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="#FF6A3D" stroke="#080808" stroke-width="2"/><text x="{x:.1f}" y="{y+6:.1f}" text-anchor="middle" fill="#080808" font-size="17" font-weight="700">{i}</text>'
    return f'<svg viewBox="0 0 {W} {H}" width="100%" aria-hidden="true">{defs}{g}{arr}{tails}{dots}{top}{lab}</svg>'

def line(v, w=358, h=110, split=True):
    lo, hi = min(v), max(v); k = len(v); pts = [(i * w / (k - 1), h - 6 - (x - lo) / (hi - lo or 1) * (h - 12)) for i, x in enumerate(v)]; md = k // 2 if split else 0
    a = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts[:md + 1]); b = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts[md:])
    mid = f'<line x1="{pts[md][0]:.1f}" y1="0" x2="{pts[md][0]:.1f}" y2="{h}" stroke="#3A3A3A" stroke-dasharray="3 4"/><polyline points="{a}" fill="none" stroke="#6E6E6E" stroke-width="2.5"/>' if split else ''
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" aria-hidden="true">{mid}<polyline points="{b}" fill="none" stroke="#FF6A3D" stroke-width="3"/><circle cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="5" fill="#FF6A3D"/></svg>'
dotsH = lambda n: '<span class="dots">' + ''.join(f'<i class="{"f" if k < sc(n) else ""}"></i>' for k in range(4)) + '</span>'
def row7(i, o, alln=False):
    d = days(o); tag = '오늘 새로' if d == 1 else f'{d}일째'; close = max(0, min(1, 1 - dist(o) / 2.5))
    nb = f'<span class="nb">{i}</span>' if i <= 3 else (f'<span class="nb" style="background:#3A3A3A;color:#fff">{i}</span>' if alln else '<span class="nb o"></span>')
    return f'<a class="row7">{nb}<span class="mid"><span class="nm">{o["n"]}</span><span class="meta"><em class="tg{" new" if d == 1 else ""}">{tag}</em>꽃까지<span class="bar"><i style="width:{round(close*100)}%"></i></span></span></span>{dotsH(o["n"])}<span class="go">›</span></a>'
pct = lambda x: f'{x:+.1f}%'
ud = lambda x: 'up' if x >= 0 else 'dn'
say = lambda t: f'<p class="say"><i>돌이</i>{t}</p>'
def hd(t, art): return f'<div class="hd"><h1>{t}</h1><img src="../../../../site/media/stone/{art}.svg" alt=""></div>'
EX = '<span class="ex2">예시</span>'

CH = ['처음', '테마 시계', '업종 한 곳', '회사 한 곳', '왜 사? 열한 질문', '내 것', '돌이와 나']
pages = []  # (마당 번호, 탭, 제목, 본문)
def add(ch, tab, title, body): pages.append((ch, tab, title, body))

# ── 마당 1 · 테마 시계 (1~6)
add(1, 0, '돌이 인사', hd('돌이', 'home') + say('테마가 될 듯한 곳을 찾아 줘요.') + '''<p class="ans">세 번만 누르면 돼요</p>
<div class="step"><span class="no">1</span><div><b>시계를 봐요</b><p class="t">업종이 지금 몇 시 자리인지</p></div></div>
<div class="step"><span class="no">2</span><div><b>싹 하나를 눌러요</b><p class="t">점 넷으로 진짜 싹인지</p></div></div>
<div class="step"><span class="no">3</span><div><b>회사를 눌러요</b><p class="t">먼저 움직였는지, 뒤따랐는지</p></div></div>''')
three = f'<div class="three"><div><b>0곳</b><span>진짜 싹</span></div><div><b>{sum(1 for o in SP if days(o)==1)}곳</b><span>오늘 새로</span></div><div><b>{len(SP)}곳</b><span>싹 자리</span></div></div>'
add(1, 0, '테마 시계', hd('테마 시계', 'home') + say('지금 몇 시 자리일까?') + f'<div class="map">{clock()}<p>업종은 시계 방향으로 돌아요. 지금 <b style="color:#FF6A3D">싹</b> 자리에 {len(SP)}곳이 있어요.</p></div><p class="ans">지금은 <em>진짜 싹</em>이 없어요</p>{three}<p class="sub">꽃 선에 가장 가까운 곳은 <b style="color:#fff">{T1}</b>예요. 넘을까?</p>' + ''.join(row7(i, o) for i, o in enumerate(SP[:3], 1)))
add(1, 0, '시계 읽는 법', hd('시계 읽는 법', 'today') + say('네 자리만 알면 돼요.') + f'''<div class="map">{clock(nums=False)}</div>
<div class="step"><span class="no">1</span><div><b style="color:#BDBDBD">잠잠</b><p class="t">시장보다 약하고 힘도 빠져요.</p></div></div>
<div class="step"><span class="no">2</span><div><b style="color:#FF6A3D">싹</b><p class="t">아직 약하지만 힘이 붙기 시작해요.</p></div></div>
<div class="step"><span class="no">3</span><div><b>꽃</b><p class="t">시장보다 강하고 힘도 붙어요.</p></div></div>
<div class="step"><span class="no">4</span><div><b style="color:#BDBDBD">시듦</b><p class="t">강하지만 힘이 빠지기 시작해요.</p></div></div>''')
add(1, 0, '싹 자리 전부', hd(f'싹 자리 {len(SP)}곳', 'surge') + say('꽃 선에 가까운 순서예요.') + ''.join(row7(i, o, True) for i, o in enumerate(SP, 1)))
FL = sorted(QD['꽃'], key=lambda o: -ST[o['n']]['chg'])
add(1, 0, '꽃 자리', hd(f'꽃 자리 {len(FL)}곳', 'cond') + say('이미 테마가 된 곳이에요.') + '<p class="sub">돌이는 꽃보다 싹을 먼저 봐요. 꽃은 이미 오른 곳이라 늦을 수 있어요.</p>' + ''.join(f'<div class="lst"><span class="nm">{o["n"]}</span><b class="{ud(ST[o["n"]]["chg"])}">{pct(ST[o["n"]]["chg"])}</b><span class="cap">한 달</span></div>' for o in FL[:8]))
WI = sorted(QD['시듦'], key=lambda o: o['tail'][-1][1])
add(1, 0, '시듦 자리', hd(f'시듦 자리 {len(WI)}곳', 'sub') + say('꽃이 지고 있는 곳이에요.') + '<p class="sub">힘이 빠지는 중이에요. 다시 잠잠으로 갈까?</p>' + ''.join(f'<div class="lst"><span class="nm">{o["n"]}</span><b class="{ud(ST[o["n"]]["chg"])}">{pct(ST[o["n"]]["chg"])}</b><span class="cap">한 달</span></div>' for o in WI[:8]) + f'<p class="cap" style="margin-top:16px">잠잠 자리는 {len(QD["잠잠"])}곳이에요.</p>')

# ── 마당 2 · 업종 한 곳 (7~12)
cks = ''.join(f'<div class="ck4"><b class="{"y" if ok else "n"}">{"✓" if ok else "✗"}</b><span>{t}</span></div>' for t, ok in checks(T1))
add(2, 0, T1, hd(T1, 'today') + say('오늘 싹 자리에 새로 들어왔어요.' if days(O1) == 1 else f'싹 자리 {days(O1)}일째예요.') + f'<p class="ans">점 넷 가운데 <em>{sc(T1)}개</em></p>{dotsH(T1)}<div style="height:16px"></div>{cks}<p class="sub" style="margin-top:16px">한 달 {pct(S1["chg"])}예요. 힘은 붙었지만 값은 아직이에요. 꽃 선을 넘을까?</p>')
add(2, 0, '지나온 길', hd('지나온 길', 'cal') + say('닷새 동안 어디서 왔을까?') + f'<div class="map">{clock(hi=T1)}<p>잠잠에서 싹으로 올라왔어요. 꽃 선까지 거의 다 왔어요.</p></div>' + ''.join(f'<div class="lst"><span class="nm">{["닷새 전","나흘 전","사흘 전","그저께","어제","오늘"][k]}</span><b>{q(*p)}</b></div>' for k, p in enumerate(O1['tail'])))
mx = max(S1['sp'][1:]) or 1
bars = ''.join(f'<i class="{"" if k >= len(S1["sp"]) - 6 else "o"}" style="height:{max(4, round(v / mx * 60))}px"></i>' for k, v in enumerate(S1['sp'][1:], 1))
add(2, 0, '번지는 중일까', hd('번지는 중일까', 'surge') + say('오른 회사가 늘고 있을까?') + f'<p class="ans">{S1["tot"]}곳 가운데 <em>{S1["now"]}곳</em></p><p class="sub">열흘 전보다 오른 회사 수예요. 가장 많을 때는 {S1["peak"]}곳이었어요.</p><div class="bars" style="height:96px">{bars}</div><p class="cap">날마다 오른 회사 수 · 주황은 최근 닷새</p><div class="unk"><b>아직 덜 번졌어요 ✗</b><p class="t">절반을 넘어야 번진다고 봐요.</p></div>')
add(2, 0, '큰 회사도 움직였을까', hd('큰 회사도 움직였을까', 'company') + say('큰 회사가 같이 가야 힘이 세요.') + f'<p class="ans">큰 회사 쪽 <span class="{ud(S1["big"])}">{pct(S1["big"])}</span></p><p class="sub">큰 회사일수록 크게 센 값이에요. 작은 회사만 오르면 금방 식기도 해요.</p><div class="tl"><div><span class="cap">모두 같게 센 값</span><b class="{ud(S1["chg"])}">{pct(S1["chg"])}</b></div><div><span class="cap">큰 회사 크게</span><b class="{ud(S1["big"])}">{pct(S1["big"])}</b></div></div><div class="unk"><b>큰 회사는 아직이에요 ✗</b><p class="t">작은 회사들이 먼저 움직이고 있어요.</p></div>')
mem = sorted(S1['mem'], key=lambda x: -x['d10'])
add(2, 0, '함께 움직인 회사', hd('함께 움직인 회사', 'company') + say('누가 앞장섰을까?') + ''.join(f'<div class="row"><span>{m["n"]}</span><b class="{ud(m["d10"])}">{pct(m["d10"])}</b>{line(m["v"], 96, 36)}</div>' for m in mem[:7]) + f'<p class="cap" style="margin-top:8px">열흘 동안 · {S1["tot"]}곳 가운데 많이 오른 순서</p>')
o1 = O1['tail'][-1]
NB = sorted([o for o in RR if o['n'] != T1], key=lambda o: (o['tail'][-1][0] - o1[0]) ** 2 + (o['tail'][-1][1] - o1[1]) ** 2)[:5]
add(2, 0, '이웃 업종', hd('이웃 업종', 'cond') + say('시계에서 가까이 있는 곳이에요.') + '<p class="sub">함께 움직이면 테마가 커질 수 있어요. 같이 볼까?</p>' + ''.join(f'<div class="lst"><span class="nm">{o["n"]}</span><b>{q(*o["tail"][-1])}</b><b class="{ud(ST[o["n"]]["chg"])}">{pct(ST[o["n"]]["chg"])}</b><span class="cap">한 달</span></div>' for o in NB))

# ── 마당 3 · 회사 한 곳 (13~18)
v = CO['v']; e = (v[5] / v[0] - 1) * 100; l = (v[-1] / v[5] - 1) * 100
add(3, 0, CO['n'], f'<p class="cap">{T1}</p>' + hd(CO['n'], 'company') + say('먼저 움직였을까, 뒤따랐을까?') + line(v) + f'<p class="ans">열흘 동안 <em>{pct(CO["d10"])}</em></p><p class="sub">{T1} {S1["tot"]}곳 가운데 가장 많이 올랐어요. 혼자만 오른 걸까?</p>')
add(3, 0, '먼저일까 뒤따름일까', hd('먼저일까 뒤따름일까', 'cal') + say('앞 닷새와 뒤 닷새를 견줘요.') + line(v) + f'<div class="tl"><div><span class="cap">앞 닷새</span><b class="{ud(e)}">{pct(e)}</b></div><div><span class="cap">뒤 닷새</span><b class="{ud(l)}">{pct(l)}</b></div></div><p class="ans">{"먼저" if e > l else "뒤따라"} 움직였어요</p><p class="sub">업종이 싹 자리에 든 뒤에 크게 올랐어요.</p>')
add(3, 0, '왜 그럴까?', hd('왜 그럴까?', 'why') + say('기록으로 찾은 것만 말해요.') + f'''<div class="step"><span class="no">1</span><div><b>최근 닷새에 몰렸어요</b><p class="t">열흘 오름 가운데 대부분이 뒤 닷새예요.</p></div></div>
<div class="step"><span class="no">2</span><div><b>업종 안에서 혼자 앞서요</b><p class="t">다음 회사와 차이가 커요.</p></div></div>
<div class="step"><span class="no">3</span><div><b>업종은 아직 내리는 중</b><p class="t">업종 한 달 {pct(S1["chg"])}예요.</p></div></div>
<div class="unk"><b>뉴스는 아직 확인 전이에요</b><p class="t">왜 올랐는지는 뉴스로 꼭 확인해요.</p></div>''')
rank = ''.join(f'<div class="lst"><span class="nm" style="{"color:#FF6A3D;font-weight:700" if m["n"]==CO["n"] else ""}">{k}. {m["n"]}</span><b class="{ud(m["d10"])}">{pct(m["d10"])}</b></div>' for k, m in enumerate(mem[:6], 1))
add(3, 0, '업종 안 자리', hd('업종 안 자리', 'surge') + say(f'{S1["tot"]}곳 가운데 몇 등일까?') + f'<p class="ans">열흘 동안 <em>1등</em></p>' + rank)
add(3, 0, '아직 모르는 것', hd('아직 모르는 것', 'sub') + say('모르는 것도 꼭 말해요.') + '''<div class="unk"><b>왜 올랐는지</b><p class="t">뉴스를 아직 확인하지 않았어요.</p></div>
<div class="unk"><b>계속 오를지</b><p class="t">많이 오른 곳은 크게 내리기도 해요.</p></div>
<div class="unk"><b>업종이 꽃이 될지</b><p class="t">싹 자리에서 다시 잠잠으로 가는 일도 많아요.</p></div>''')
add(3, 3, '관심 담기', hd('관심에 담았어요', 'me') + say('업종이 꽃 선을 넘으면 알려 드릴까요?') + f'<p class="ans"><em>{CO["n"]}</em> 담음 ✓</p><div class="sw"><span>{T1} 꽃 선 넘으면 알림</span><i></i></div><div class="sw"><span>{CO["n"]} 크게 움직이면 알림</span><i class="off"></i></div><p class="cap" style="margin-top:16px">사기 전에는 열한 질문을 먼저 해요.</p>')

# ── 마당 4 · 왜 사? 열한 질문 (19~24)
add(4, 2, '사기 전에', hd('사기 전에', 'why-q1') + say('열한 질문, 1분이면 돼요.') + f'<p class="ans"><em>{CO["n"]}</em>를 사려고 해요</p><p class="sub">답이 초록이면 좋고, 빨강이면 한 번 더 생각해요. 끝까지 답하면 커피 점수 1점이에요.</p><div class="tl"><div><b style="color:#3DDC97">초록</b><span class="cap">좋아요</span></div><div><b style="color:#F9D21C">노랑</b><span class="cap">조심</span></div><div><b style="color:#FF6A3D">빨강</b><span class="cap">멈춤</span></div></div>')
def qpage(i, pick):
    qq, opts = QS[i]
    return hd(f'{i+1} / 11', 'why-q1') + f'<div class="flow">' + ''.join(f'<i class="{"pd" if k < i else "on" if k == i else ""}"></i>' for k in range(11)) + f'</div><div class="qbox"><p class="qq">{qq}</p>' + ''.join(f'<div class="opt{" on" if k == pick else ""}">{t}</div>' for k, t in enumerate(opts)) + '</div>'
add(4, 2, '질문 1 · 왜 사?', qpage(0, 2) + say('좋아! 내 이유가 있으면 흔들릴 때 버틸 수 있어.'))
add(4, 2, '질문 5 · 흐름은?', qpage(4, 2) + say('다들 떠들 때는 이미 늦었을 수 있어.'))
add(4, 2, '질문 11 · 나눠 넣어?', qpage(10, 0) + say('좋아, 하나가 넘어져도 괜찮아.'))
add(4, 2, '답 모아 보기', hd('답 모아 보기', 'why-result') + say('빨강 하나를 먼저 봐요.') + '<div class="tl"><div><b style="color:#3DDC97">8</b><span class="cap">초록</span></div><div><b style="color:#F9D21C">2</b><span class="cap">노랑</span></div><div><b style="color:#FF6A3D">1</b><span class="cap">빨강</span></div></div><div class="unk"><b style="color:#FF6A3D">흐름은? · 다들 떠들며 급등</b><p class="t">소문에 팔고 조용할 때 사라.</p></div><p class="cap">' + EX + ' 답은 예로 고른 것이에요.</p>')
add(4, 2, '기록 남김', hd('기록 남겼어요', 'jinhwa') + say('한 달 뒤에 이 기록과 견줘 볼게요.') + '<p class="ans">커피 점수 <em>1 / 10</em></p><div class="flow">' + ''.join(f'<i class="{"on" if k < 1 else ""}"></i>' for k in range(10)) + '</div><p class="sub" style="margin-top:16px">하루 1점, 10점이면 커피 쿠폰 한 장이에요.</p>' + EX)

# ── 마당 5 · 내 것 (25~30)
add(5, 3, '관심', hd('관심', 'me') + say('담아 둔 곳이 지금 몇 시일까?') + f'<div class="lst"><span class="nm">{T1}</span><b style="color:#FF6A3D">싹</b>{dotsH(T1)}</div><div class="lst"><span class="nm">{CO["n"]}</span><b class="{ud(CO["d10"])}">{pct(CO["d10"])}</b><span class="cap">열흘</span></div>' + ''.join(f'<div class="lst"><span class="nm">{o["n"]}</span><b>{q(*o["tail"][-1])}</b></div>' for o in FL[:2]) + EX)
add(5, 3, '알림', hd('알림', 'cal') + say('자리가 바뀌면 카톡으로 알려요.') + f'<div class="sw"><span>관심 업종이 싹에 들어오면</span><i></i></div><div class="sw"><span>관심 업종이 꽃 선을 넘으면</span><i></i></div><div class="sw"><span>관심 업종이 시듦으로 가면</span><i></i></div><div class="sw"><span>날마다 아침 한 줄</span><i class="off"></i></div><p class="cap" style="margin-top:16px">카톡 가입을 해야 받아요.</p>' + EX)
add(5, 2, '매매일지', hd('매매일지', 'why') + say('산 이유를 지금과 견줘요.') + f'<div class="card"><div class="r1"><span class="nm">{CO["n"]}</span><span class="gd">오늘 적음</span></div><p class="t">이유 · 내가 따져 봄</p><p class="t">팔 곳 · 정함</p><p class="t">빨강 1개 · 흐름은?</p></div><p class="sub">한 달 뒤 「그때 이유가 아직 맞나?」를 물어요.</p>' + EX)
add(5, 4, '보유종목', hd('보유종목', 'company') + say('가진 회사의 업종이 몇 시일까?') + f'<div class="lst"><span class="nm">{CO["n"]}</span><b>{T1}</b><b style="color:#FF6A3D">싹</b></div>' + ''.join(f'<div class="lst"><span class="nm">{ST[o["n"]]["mem"][0]["n"]}</span><b>{o["n"]}</b><b>{q(*o["tail"][-1])}</b></div>' for o in (FL[:1] + WI[:1]) if ST[o['n']]['mem']) + '<p class="cap" style="margin-top:16px">시듦 자리 회사는 먼저 다시 봐요.</p>' + EX)
add(5, 4, '가짜 돈 연습', hd('가짜 돈 연습', 'jinhwa') + say('10억으로 30억 만들기예요.') + '<p class="cap">지금 합계</p><p class="big2">10억 원</p><div class="flow" style="margin:16px 0">' + ''.join(f'<i class="{"on" if k < 1 else ""}"></i>' for k in range(3)) + '</div><p class="sub">30억이 되면 스타벅스 상품권 10만 원 10장이에요. 한 사람에 한 번이에요.</p>')
px = ''
add(5, 4, '가짜 돈으로 사기', hd('가짜 돈으로 사기', 'company') + say('진짜 돈은 하나도 안 들어요.') + f'<p class="ans">{CO["n"]}</p><div class="opt">몇 주 살까?</div><div class="tl"><div><b style="font-size:24px">100주</b></div><div><b style="font-size:24px">500주</b></div><div><b style="font-size:24px">1000주</b></div></div><div class="btn w">가짜 돈으로 사기</div><p class="cap">값은 사이트가 받은 마지막 값이에요.</p>' + EX)

# ── 마당 6 · 돌이와 나 (31~36)
add(6, 1, '시황', hd('시황', 'today') + say('오늘 시장 전체는?') + f'<p class="ans">한 달 <em class="{ud(MKT["chg"])}">{pct(MKT["chg"])}</em></p><p class="sub">모든 회사 {MKT["n"]:,}곳을 같게 센 값이에요.</p><div class="tl"><div><span class="cap">오른 곳</span><b class="up">{MKT["up"]:,}</b></div><div><span class="cap">내린 곳</span><b class="dn">{MKT["down"]:,}</b></div></div><div class="tl"><div><span class="cap">큰 회사 크게 센 값</span><b class="{ud(MKT["cwChg"])}">{pct(MKT["cwChg"])}</b></div></div><p class="cap">큰 회사가 많이 내린 달이에요. 그래서 덜 내린 업종이 싹 자리로 보여요.</p>')
add(6, 0, '진화', hd('진화', 'jinhwa') + say('돌이가 스스로 고친 것이에요.') + '<div class="step"><span class="no">1</span><div><b>「진짜로 오름」 점을 더했어요</b><p class="t">덜 내린 곳을 싹으로 잘못 보지 않게요.</p></div></div><div class="step"><span class="no">2</span><div><b>꽃 선까지 거리를 더했어요</b><p class="t">가까운 곳을 맨 위에 둬요.</p></div></div><div class="step"><span class="no">3</span><div><b>며칠째를 더했어요</b><p class="t">오늘 새로 든 곳을 따로 보여요.</p></div></div>')
add(6, 3, '카톡 가입', hd('카톡 가입', 'me') + say('관심과 기록을 어느 폰에서나 봐요.') + '<div class="kk">카카오로 시작하기</div><div class="step"><span class="no">1</span><div><b>받는 것</b><p class="t">회원 표 하나만 받아요.</p></div></div><div class="step"><span class="no">2</span><div><b>안 받는 것</b><p class="t">이름, 전화번호는 받지 않아요.</p></div></div><div class="step"><span class="no">3</span><div><b>언제든 탈퇴</b><p class="t">누르면 기록이 다 지워져요.</p></div></div><p class="cap">지금은 꺼져 있어요. 켜면 이렇게 보여요.</p>')
add(6, 3, '커피 쿠폰', hd('커피 쿠폰', 'why-result') + say('열 번 답하면 한 장이에요.') + '<div class="cpn"><span class="cap">쿠폰 번호</span><br><b>ABCD-EFGH-JKMN</b></div><p class="sub">이 번호를 카톡으로 보내 주시면 사장님이 직접 보내 드려요. 한 달에 한 장이에요.</p>' + EX)
add(6, 0, '글씨와 말', hd('글씨와 말', 'sub') + say('보기 편하게 바꿔요.') + '<div class="sw"><span>글씨 크게</span><i></i></div><div class="sw"><span>영어로 보기</span><i class="off"></i></div><div class="sw"><span>밝은 화면</span><i class="off"></i></div><p class="cap" style="margin-top:16px">위 오른쪽 「가」와 「EN」 단추와 같아요.</p>')
add(6, 0, '오늘 정리', hd('오늘 정리', 'home') + say('내일 시계가 또 돌아요.') + f'<div class="step"><span class="no">1</span><div><b>진짜 싹 0곳</b><p class="t">시장이 내린 달이에요.</p></div></div><div class="step"><span class="no">2</span><div><b>꽃 선 가장 가까운 곳</b><p class="t">{T1}</p></div></div><div class="step"><span class="no">3</span><div><b>그 안에서 앞선 회사</b><p class="t">{CO["n"]} 열흘 {pct(CO["d10"])}</p></div></div>')

assert len(pages) == 36, len(pages)
names = []
for i, (ch, tab, title, body) in enumerate(pages, 1):
    nxt = pages[i % 36]
    prev = pages[i - 2][2] if i > 1 else None
    ntitle = '처음으로 · 테마 시계' if i == 36 else nxt[2]
    top = '<div class="top"><span class="pill">진화</span><span class="ttl">돌이</span><span class="grp"><span>EN</span><span>가</span><span>⌕</span></span></div><div class="v">'
    pg = f'<div class="pg"><span>{"‹ " + prev if prev else ""}</span><span><span class="chap">{CH[ch]}</span> <b>{i}</b> / 36</span></div>'
    nx = f'<a class="next" href="p{(i % 36) + 1:02d}.html"><span><small>다음</small>{html.escape(ntitle)}</span><span>›</span></a>'
    safe = '<p class="safe">돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.</p>'
    tabs = '<nav class="tabs">' + ''.join(f'<span class="{"on" if k == tab else ""}">{t}</span>' for k, t in enumerate(TABS)) + '</nav>'
    page = HEAD + top + pg + body + nx + safe + '<div style="height:72px"></div></div>' + tabs + '</body></html>'
    fn = f'p{i:02d}.html'; open(OUT + fn, 'w', encoding='utf-8').write(page); names.append((fn, ch, title))
json.dump(names, open(OUT + 'pages.json', 'w'), ensure_ascii=False, indent=0)
print('ok', len(names), T1, CO['n'], ASOF)
