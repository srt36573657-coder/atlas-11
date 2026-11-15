#!/usr/bin/env python3
# 샘플 2 「대쪽 100원 자」 2판 — data.json 하나만 읽어 sample-2.html 을 찍어 낸다(지어낸 숫자 0)
#   2판: 검사단 열한 명 지적(FIX-2.md) · 고침 규칙(FIXRULE.md) · 숫자 검사(s2-L04) 반영
#   쓰는 법: python3 build-2.py
import json, html, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'data.json'), encoding='utf-8'))
OUT = os.path.join(HERE, 'sample-2.html')


def E(s):
    return html.escape(str(s), quote=True)


def gwa(word):
    """받침이 있으면 「과」, 없으면 「와」"""
    ch = word[-1]
    if '가' <= ch <= '힣':
        return '과' if (ord(ch) - 0xAC00) % 28 else '와'
    return '와'


COUNT = {1: '한', 2: '두', 3: '세', 4: '네', 5: '다섯', 6: '여섯', 7: '일곱', 8: '여덟', 9: '아홉', 10: '열'}
TENS = {1: '하나', 2: '둘', 3: '셋', 4: '넷', 5: '다섯', 6: '여섯', 7: '일곱', 8: '여덟', 9: '아홉', 10: '열'}

SUN = D['sun']
TODAY = next(l for l in SUN['lands'] if l['today'])
MKT = SUN['market']
MEDIAN = '95.8'   # 365곳을 줄 세운 딱 가운데 회사의 한 달 — 공통 규칙 · 고침 규칙에 적힌 진짜 값

# 다섯 땅 뜻 — 한 문장에 한 가지(검사단 L03)
LAND_SAY = {
    'rise': '한 달 전보다 오른 회사가 열에 여섯이 넘어요. 365곳을 줄 세운 딱 가운데 회사도 올랐어요.',
    'narrow': '평균은 올랐는데 오른 회사는 절반이 안 돼요. 몇 곳만 크게 오른 거예요.',
    'calm': '다른 네 땅에 들지 않는 때예요.',
    'shake': '요즘 하루 오르내림이 평소보다 절반 넘게 더 커요.',
    'fall': '한 달 전보다 오른 회사가 열에 넷이 안 돼요. 365곳을 줄 세운 딱 가운데 회사도 내렸어요.',
}

# 「될 듯」 묶음마다 무엇이 됐는지 바로 쓴다(고침 규칙) — 된 번 · 안 된 번을 같은 크기로
NEXT_DID = {   # (무엇을 셌나, 된 번 이름, 안 된 번 이름)
    'hotNext': ('한 달 안에 <span class="nw">진짜 불장 일곱에</span> 들었는지', '들었어요', '못 들었어요'),
    'bloomNext': ('한 달 안에 <span class="nw">시장보다</span> <span class="nw">100원에 15원 넘게</span> 더 올랐는지', '더 올랐어요', '아니었어요'),
    'moneyNext': ('한 달 안에 <span class="nw">진짜 돈이 몰리는 일곱에</span> 들었는지', '들었어요', '못 들었어요'),
}
IN_NAME = {'hot': '불장', 'bloom': '꽃이 될 곳', 'money': '돈이 몰리는 곳'}

# ───────────────────────── 100원 막대 ─────────────────────────
SPAN = 60.0   # 가운데 세로줄에서 양 끝까지 각 60원 · 작은 눈금 한 칸 10원
MINW = 14     # px — 아주 작게 오르내린 곳도 막대 쪽(왼 · 오)과 찬 · 빈이 보이는 가장 짧은 막대


def ruler(v, size='md'):
    """값은 늘 칸 오른쪽 끝 고정 자리(막대와 겹치지 않음) · 막대는 그 왼쪽 자 안에서만"""
    v = float(v)
    dv = v - 100.0
    w = min(abs(dv), SPAN) / SPAN * 50.0
    side = 'dn' if dv < 0 else 'up' if dv > 0 else 'eq'
    label = f'{v:.1f}원'
    bar = f'<i class="bar {side}" style="width:max({MINW}px,{w:.2f}%)"></i>' if side != 'eq' else ''
    return (f'<div class="ruler {size}" role="img" aria-label="지난 한 달 동안 100원이 {E(label)}">'
            f'<span class="zl">100원</span><span class="ml">지난 한 달</span>'
            f'<span class="track"><i class="band"></i>{bar}<i class="mid"></i></span>'
            f'<b class="val {side}">{E(label)}</b></div>')


def legend_ruler():
    return ('<div class="ruler lg" role="img" aria-label="왼쪽 꽉 찬 파란 막대는 줄었어요, 오른쪽 속이 빈 막대는 늘었어요">'
            '<span class="zl">100원</span><span class="track"><i class="band"></i>'
            '<span class="bar dn" style="width:38%">줄었어요</span><span class="bar up" style="width:38%">늘었어요</span>'
            '<i class="mid"></i></span></div>')


# 꺾은선 — 모든 칸 같은 눈금(가장 크게 움직인 회사가 칸 높이에 맞고 나머지는 같은 비율)
SP_W, SP_H, SP_PAD = 84, 36, 4
SP_R = max((max(it['c']) - min(it['c'])) / it['c'][0] for g in D['groups'] for it in g['items'])


def spark(c):
    c0 = c[0]
    r = [x / c0 for x in c]
    lo, hi = min(r), max(r)
    mid = (lo + hi) / 2
    k = (SP_H - 2 * SP_PAD) / SP_R
    pts = [(SP_PAD + i * (SP_W - 2 * SP_PAD) / (len(r) - 1), SP_H / 2 - (x - mid) * k) for i, x in enumerate(r)]
    y0 = SP_H / 2 - (1.0 - mid) * k
    poly = ' '.join(f'{a:.1f},{b:.1f}' for a, b in pts)
    lx, ly = pts[-1]
    return (f'<svg class="spark" viewBox="0 0 {SP_W} {SP_H}" width="{SP_W}" height="{SP_H}" aria-hidden="true">'
            f'<line x1="{SP_PAD}" y1="{y0:.1f}" x2="{SP_W - SP_PAD}" y2="{y0:.1f}" stroke="#8A7F63" stroke-width="1.5" stroke-dasharray="2 3"/>'
            f'<polyline points="{poly}" fill="none" stroke="#1E1E1E" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>'
            f'<circle cx="{lx:.1f}" cy="{ly:.1f}" r="2.8" fill="#1E1E1E"/></svg>')


TAG_DN = '<span class="tag-dn">한 달 내림</span>'

GROUP_NAMES = Counter(it['name'] for g in D['groups'] for it in g['items'])
GROUP_TWICE = {n for n, k in GROUP_NAMES.items() if k > 1}


def card(it):
    dn = bool(it.get('down'))
    ov = f'<p class="cov">{COUNT[GROUP_NAMES[it["name"]]]} 묶음에 함께 들었어요</p>' if it['name'] in GROUP_TWICE else ''
    return (f'<li class="card{" dn" if dn else ""}">'
            f'<div class="crow1"><b class="cname">{E(it["name"])}</b>{TAG_DN if dn else ""}</div>'
            f'<div class="crow2"><div class="cmeta"><p class="cdays">이 묶음에 든 지 {int(it["days"])}일</p>{ov}</div>{spark(it["c"])}</div>'
            f'{ruler(it["v100"])}</li>')


def nrow(name, v, dn):
    return (f'<li class="nrow{" dn" if dn else ""}"><div class="crow1"><b class="cname">{E(name)}</b>{TAG_DN if dn else ""}</div>'
            f'{ruler(v, "sm")}</li>')


# ───────────────────────── 꾀 줄 ─────────────────────────
def dots(n_on, total=10):
    return ('<span class="dots" aria-hidden="true">' +
            ''.join(f'<i class="dot{" on" if i < n_on else ""}"></i>' for i in range(total)) + '</span>')


# 펼침 표시 — 닫혀 있으면 아래 세모, 열면 「닫기」 글(위 세모는 오름 표시로 읽힐 수 있어 쓰지 않음)
TRI = ('<span class="opn"><svg class="tri" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-8 10z" fill="#1E1E1E"/></svg>'
       '<span class="cls">닫기</span></span>')


def krow(e, ranked=True):
    picks = ''.join(f'<li>{E(p)}</li>' for p in e.get('picks', []))
    if ranked:
        head = (f'<span class="rk">{int(e["rank"])}</span><span class="kb"><span class="kname">{E(e["easy"])}</span>'
                f'<b class="ksay">{E(e["say"])}</b>{dots(int(e["tenths"]))}<b class="kline">{E(e["line"])}</b>'
                f'<span class="kexact">{int(e["n"])}번 가운데 {int(e["lose"])}번</span></span>')
        cls = 'krow'
    else:
        head = (f'<span class="kb"><span class="kname">{E(e["easy"])}</span><b class="ksay">{E(e["say"])}</b>'
                f'<span class="kno">{E(e["line"])}</span></span>')
        cls = 'krow notyet'
    return (f'<details class="{cls}"><summary>{head}{TRI}</summary><div class="kopen">'
            f'<p class="kph">이 꾀에 오늘 걸린 회사</p><ul class="picks">{picks}</ul>'
            f'<p class="kwarn">지난 기록이에요. 사라는 뜻이 아니에요.</p></div></details>')


# ───────────────────────── 조각 모으기 ─────────────────────────
MARK = ('<svg class="mark" viewBox="0 0 40 36" width="40" height="36" aria-hidden="true">'
        + ''.join(f'<rect x="{1 + i * 8}" y="2" width="6" height="32" rx="1.6" fill="{"#2F5D8A" if i == 4 else "#FAF7F0"}" '
                  f'stroke="{"#2F5D8A" if i == 4 else "#1E1E1E"}" stroke-width="1.5"/>' for i in range(5))
        + '<line x1="0" y1="10" x2="40" y2="10" stroke="#1E1E1E" stroke-width="1.6"/>'
          '<line x1="0" y1="26" x2="40" y2="26" stroke="#1E1E1E" stroke-width="1.6"/></svg>')

slips = ''.join(
    f'<div class="scol{" today" if l["today"] else ""}"><p class="stag">{"오늘" if l["today"] else ""}</p>'
    f'<div class="slip"><span class="vn">{E(l["name"])}</span></div><p class="d500">{int(l["days500"])}날</p></div>'
    for l in SUN['lands'])
sum500 = sum(int(l['days500']) for l in SUN['lands'])
cap2 = f'<span class="nw">다섯을 더하면</span> <span class="nw">지난 {int(SUN["histDays"])}날이에요.</span>' if sum500 == int(SUN['histDays']) else ''

NOW_CLS = ' class="now"'
def sentences(t):
    """한 문장씩 한 줄에서 시작하게 — 「. 」로 나눔"""
    parts = [x for x in t.split('. ') if x]
    keep = ['딱 가운데 회사', '오른 회사가', '절반이 안 돼요']
    out = ''
    for x in parts:
        h = E(x if x.endswith('.') else x + '.')
        for k in keep:
            h = h.replace(k, f'<span class="nw">{k}</span>')
        out += f'<span>{h}</span>'
    return out


land_meaning = ''.join(
    f'<li{NOW_CLS if l["today"] else ""}><b>{E(l["name"])}{" · 오늘" if l["today"] else ""}</b>{sentences(LAND_SAY[l["key"]])}</li>'
    for l in SUN['lands'])

# 왜 오늘이 내리는 땅인가 — 진짜 숫자
up_t = MKT['up'] * 10 / MKT['n']          # 131 ÷ 365 × 10 = 3.6 → 「열에 넷이 안 돼요」
up_c = -(-MKT['up'] * 10 // MKT['n'])     # 올림
if MKT['up'] * 10 % MKT['n'] and 1 <= up_c <= 10:
    w_ = TENS[up_c]
    up_say = f'열에 {w_}{"이" if (ord(w_[-1]) - 0xAC00) % 28 else "가"} 안 돼요.'
else:
    up_say = ''
why_html = (f'<p><span class="nw">{MKT["n"]}곳 가운데</span> <span class="nw">한 달 전보다 오른 곳은</span> '
            f'<span class="nw"><b>{MKT["up"]}곳</b>이에요.</span> <span class="nw">{up_say}</span></p>'
            f'<p><span class="nw">줄 세운 딱 가운데 회사는</span> <span class="nw">100원이 <b>{MEDIAN}원</b>이 됐어요.</span></p>')

rank = D['rank']
top7 = ''.join(krow(e) for e in rank[:7])
rest_rank = ''.join(krow(e) for e in rank[7:])
not_yet = ''.join(krow(e, ranked=False) for e in D['notYet'])

total_found = sum(len(g['items']) for g in D['groups'])
uniq_found = len(GROUP_NAMES)
found_parts = [f'<span class="nw">{E(g["name"])} {len(g["items"])}곳{"," if i < len(D["groups"]) - 1 else "이에요."}</span>'
               for i, g in enumerate(D['groups'])]
twice_n = total_found - uniq_found
found_dup = (f'<p class="sub"><span class="nw">{COUNT[twice_n]} 곳은 두 묶음에 함께 들어</span> '
             f'<span class="nw">이름으로는 {uniq_found}곳이에요.</span></p>') if twice_n > 0 else ''
groups_html = ''
for g in D['groups']:
    groups_html += (f'<div class="grp"><div class="gh"><h3>{E(g["name"])}</h3><p class="what">{E(g["what"])}</p></div>'
                    f'<ol class="cards">{"".join(card(it) for it in g["items"])}</ol></div>')

total_next = sum(len(g['items']) for g in D['next'])
NEXT_NAMES = Counter(it['name'] for g in D['next'] for it in g['items'])
next_twice = [n for g in D['next'] for it in g['items'] for n in [it['name']] if NEXT_NAMES[n] > 1]
next_twice = list(dict.fromkeys(next_twice))
next_parts = [f'<span class="nw">{E(g["name"])} {len(g["items"])}곳{"," if i < len(D["next"]) - 1 else "이에요."}</span>'
              for i, g in enumerate(D['next'])]
if next_twice:
    who = ''.join(n + gwa(n) + ' ' for n in next_twice[:-1]) + next_twice[-1]
    next_dup = (f'<p class="sub"><span class="nw">{COUNT[len(D["next"])]} 묶음 합쳐 {total_next}자리예요.</span> '
                f'<span class="nw">{E(who)}{"은" if (ord(next_twice[-1][-1]) - 0xAC00) % 28 else "는"} 두 묶음에 들어</span> '
                f'<span class="nw">두 번 셌어요.</span></p>')
else:
    next_dup = f'<p class="sub">{COUNT[len(D["next"])]} 묶음 합쳐 {total_next}곳이에요.</p>'
next_html = ''
for g in D['next']:
    what, did, didnt = NEXT_DID[g['key']]
    p, b = int(g['per100']), int(g['base100'])
    rows = ''.join(nrow(it['name'], it['v100'], bool(it.get('down'))) for it in g['items'])
    next_html += (f'<div class="grp"><div class="gh"><h3>{E(g["name"])}</h3>'
                  f'<p class="p100">지난 1년 동안 {what} 셌어요.</p>'
                  f'<div class="tally"><p><span>{E(did)}</span><b>100번 가운데 {p}번</b></p>'
                  f'<p><span>{E(didnt)}</span><b>100번 가운데 {100 - p}번</b></p></div>'
                  f'<p class="b100">전체 회사는 100번에 <b>{b}번</b>이었어요.</p></div>'
                  f'<ol class="nrows">{rows}</ol></div>')

ov_html = ''
for o in D['overlap']:
    names = [IN_NAME[k] for k in o['in'] if k in IN_NAME]
    if len(names) >= 2:
        say = ''.join(n + gwa(n) + ' ' for n in names[:-1]) + names[-1] + (' 둘 다에' if len(names) == 2 else ' 모두에') + ' 들었어요'
    else:
        say = names[0] + '에 들었어요'
    ov_html += f'<li><b>{E(o["name"])}</b><span>{E(say)}</span></li>'

quiet_html = ''
for it in D['quiet']:
    c = it['c']
    v = round(c[-1] / c[0] * 100, 1)   # 다른 칸의 「100원이 ○원」과 같은 셈(스물한 날 마감 값의 끝 ÷ 처음)
    quiet_html += nrow(it['name'], v, v < 100)

q = SUN['quote']
qa, qb = (q.split(', ', 1) + [''])[:2]
quote_html = f'<b>{E(qa)},</b> {E(qb)}' if qb else E(q)

CSS = r'''
:root{--paper:#FAF7F0;--ink:#1E1E1E;--ind:#2F5D8A;--grain:#E7DFCC;--soft:#F0EADB;--card:#FFFDF8;--line:#BFB18F;--tick:#8A7F63;--white:#FFFFFF;color-scheme:light}
*{box-sizing:border-box}
html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--paper)}
html.big{font-size:19px}
body{margin:0;background:var(--paper);color:var(--ink);font-family:"Noto Sans CJK KR","Noto Sans KR",sans-serif;font-size:1.3125rem;line-height:1.5;font-weight:400;word-break:keep-all;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
h1,h2,h3,p,ol,ul{margin:0;padding:0}
ol,ul{list-style:none}
b,h1,h2,h3{font-weight:700}
button{font:inherit;color:inherit;cursor:pointer}
summary{cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.nw{white-space:nowrap}
.sub,.slip-cap,.note .q,.gh .what,.gh .p100,.nnote p,.legend p,.ksay,.qs li>span:last-child,.meaning li span,.why p,.quote,.intro,.honest{text-wrap:balance}

/* 머리 */
.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:12px 16px 0}
.brand{display:flex;align-items:center;gap:8px}
.brand .mark{flex:none}
.brand h1{font-size:30px;line-height:1.15;letter-spacing:.06em;white-space:nowrap}
.tools{display:flex;gap:4px;margin-left:auto}
.tools button{min-width:44px;min-height:44px;padding:0 5px;border:2px solid var(--ink);border-radius:9px;background:var(--card);font-size:1.0625rem;line-height:1.2;white-space:nowrap}
.tools .bigb[aria-pressed="true"]{background:var(--ink);color:var(--paper)}
.intro{padding:6px 16px 0;font-size:19px}
.honest{padding:1px 16px 8px;font-size:1.1875rem;font-weight:700}
.rule{margin:0 16px;border-top:2px solid var(--ink)}

/* 칸 머리 */
section{padding:22px 16px 4px}
.sun{padding-top:16px}
.sec-h{display:flex;align-items:center;gap:9px;font-size:1.5rem;line-height:1.3}
.sec-h::before{content:"";flex:none;width:11px;height:26px;border:2px solid var(--ink);border-radius:3px}
.sec-h .asof{margin-left:auto;font-size:1.1875rem;font-weight:400;white-space:nowrap}
.sub{font-size:1.1875rem;margin-top:6px}

/* 요즘 장 모습 */
.land-now{font-size:28px;font-weight:700;line-height:1.3;margin-top:4px}
.do{font-size:1.5rem;font-weight:700;line-height:1.35;margin-top:4px}
.slips{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));column-gap:10px;margin-top:6px;padding:0 4px}
.slips::before,.slips::after{content:"";position:absolute;left:0;right:0;height:5px;border-top:1.5px solid var(--line);border-bottom:1.5px solid var(--line);pointer-events:none}
.slips::before{top:calc(2.125rem + 1.25rem)}
.slips::after{top:calc(2.125rem + 8.75rem - 1.25rem - 5px)}
.scol{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center}
.stag{height:2.125rem;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:3px;font-size:1.1875rem;font-weight:700;line-height:1.35}
.scol.today .stag::after{content:"";display:block;flex:none;width:26px;height:3px;margin-top:3px;background:var(--ink);border-radius:2px}
.slip{width:100%;max-width:58px;height:8.75rem;border:2px solid var(--ink);border-radius:9px;background-color:var(--paper);background-image:repeating-linear-gradient(90deg,transparent 0 10px,#EFE8D6 10px 12px);display:flex;align-items:center;justify-content:center}
.scol.today .slip{background:var(--ind);border-color:var(--ind);color:var(--white)}
.vn{writing-mode:vertical-rl;font-size:1.375rem;font-weight:700;letter-spacing:.06em;line-height:1}
.d500{margin-top:5px;font-size:1.1875rem;font-weight:700;white-space:nowrap;text-align:center}
.slip-cap{margin-top:4px;font-size:1.1875rem}
@media (max-width:350px){.slips{column-gap:5px;padding:0}html.big .d500{font-size:1.0625rem}}
.why{margin-top:6px;padding-top:4px;border-top:1.5px solid var(--grain)}
.why p{font-size:1.1875rem;line-height:1.5}
.why p+p{margin-top:2px}
.pill{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:52px;margin-top:12px;padding:6px 10px 6px 14px;border:2px solid var(--ink);border-radius:10px;background:var(--card);font-size:1.1875rem;font-weight:700}
.opn{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:28px}
.tri{flex:none;width:28px;height:28px}
.cls{display:none;padding:0 6px;border:1.5px solid var(--ink);border-radius:6px;font-size:17px;font-weight:700;line-height:1.5;white-space:nowrap}
details[open]>summary .tri{display:none}
details[open]>summary .cls{display:inline-block}
.meaning{margin-top:8px;padding:2px 14px;border:1.5px solid var(--line);border-radius:10px;background:var(--card)}
.meaning li{display:flex;flex-direction:column;padding:10px 0;border-top:1.5px solid var(--grain);font-size:1.1875rem}
.meaning li:first-child{border-top:0}
.meaning li b{font-size:1.25rem}
.qlabel{margin-top:18px;font-size:17px}
.quote{margin-top:2px;padding:2px 0 2px 14px;border-left:4px solid var(--ink);font-size:1.3125rem;line-height:1.55}
.guide{margin-top:14px;font-size:1.1875rem;font-weight:700}

/* 100원 막대 */
.ruler{position:relative;height:62px;margin-top:6px}
.ruler .zl{position:absolute;top:0;left:calc((100% - 86px) / 2);transform:translateX(-50%);font-size:17px;font-weight:700;line-height:20px;white-space:nowrap}
.ruler .ml{position:absolute;top:0;right:0;font-size:17px;line-height:20px;white-space:nowrap}
.ruler .track{position:absolute;left:0;right:86px;top:24px;height:36px}
.ruler .band{position:absolute;left:0;right:0;top:0;bottom:0;border-radius:4px;background-color:var(--grain);background-image:repeating-linear-gradient(90deg,var(--tick) 0 2px,transparent 2px 8.3333%);background-size:100% 8px;background-repeat:no-repeat}
.ruler .bar{position:absolute;top:3px;bottom:3px}
.ruler .bar.dn{right:50%;background:var(--ind);border-radius:4px 0 0 4px}
.ruler .bar.up{left:50%;background:var(--white);border:2.5px solid var(--ink);border-radius:0 4px 4px 0}
.ruler .mid{position:absolute;left:50%;top:-3px;bottom:-3px;width:3px;margin-left:-1.5px;background:var(--ink);border-radius:2px}
.ruler .val{position:absolute;right:0;top:24px;height:36px;display:flex;align-items:center;font-size:20px;font-weight:700;line-height:1;white-space:nowrap}
.ruler.sm{height:56px;margin-top:2px}
.ruler.sm .track{top:23px;height:30px}
.ruler.sm .mid{top:-2px;bottom:-2px}
.ruler.sm .val{top:23px;height:30px}
.ruler.lg{height:72px;margin-top:2px}
.ruler.lg .zl{left:50%}
.ruler.lg .track{right:0;top:24px;height:46px}
.ruler.lg .band{background-size:100% 9px}
.ruler.lg .bar{top:4px;bottom:4px;display:flex;align-items:center;font-size:20px;font-weight:700;line-height:1;white-space:nowrap}
.ruler.lg .bar.dn{color:var(--white);justify-content:flex-start;padding-left:10px}
.ruler.lg .bar.up{justify-content:flex-end;padding-right:10px}
.legend{margin-top:10px;padding:8px 14px 12px;border:1.5px solid var(--line);border-radius:12px;background:var(--card)}
.legend h3{font-size:1.3125rem}
.legend p{font-size:1.1875rem;margin-top:4px}
.legend .lk{display:flex;align-items:center;gap:10px;margin-top:6px}
.sw{flex:none;display:inline-block;width:26px;height:18px;border-radius:3px}
.sw.dn{background:var(--ind)}
.sw.up{border:2.5px solid var(--ink);background:var(--white)}
.sw.mid{width:4px;height:22px;background:var(--ink);border-radius:2px}
.key{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;margin-top:10px;font-size:1.1875rem}
.key span{display:inline-flex;align-items:center;gap:6px}

/* 쪽지 */
.note{position:relative;margin:24px 16px 0;padding:12px 14px 14px;border:1.5px solid var(--line);border-radius:6px 22px 6px 6px;background:var(--soft)}
.exrow{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}
.ex{display:inline-block;padding:1px 10px;border:1.5px solid var(--ink);border-radius:6px;background:var(--paper);font-size:1.1875rem;font-weight:700}
.exs{font-size:17px}
.note .q{margin-top:8px;font-size:1.375rem;font-weight:700;line-height:1.45}
.note .btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.note button{min-height:56px;border:2px solid var(--ink);border-radius:10px;background:var(--card);font-size:1.3125rem;font-weight:700}
.note button[aria-pressed="true"]{background:var(--ink);color:var(--paper)}

/* 덜 잃은 꾀 */
.hint{margin-top:8px;font-size:1.1875rem}
.hint .dot{vertical-align:-3px;margin-right:8px}
.rest-h{margin-top:16px;font-size:1.1875rem;font-weight:700}
.rest{margin-top:6px;padding:10px 12px 12px;border:1.5px solid var(--line);border-left:12px solid var(--ink);border-radius:10px;background:var(--card)}
.rest .nm{display:block;font-size:1.375rem}
.rest .ln{display:block;font-size:1.1875rem}
.krow{margin-top:10px;border:2px solid var(--ink);border-radius:10px;background:var(--card)}
.krow>summary{display:grid;grid-template-columns:2.4rem 1fr auto;align-items:start;column-gap:8px;min-height:56px;padding:10px 10px 12px 6px}
.krow.notyet>summary{grid-template-columns:1fr auto;padding-left:14px}
.rk{font-size:28px;font-weight:700;text-align:center;line-height:1.1;padding-top:22px}
.kb{display:flex;flex-direction:column;min-width:0}
.kname{font-size:17px;line-height:1.45}
.ksay{font-size:1.3125rem;line-height:1.4;margin-top:1px}
.dots{display:flex;gap:5px;margin:8px 0 6px}
.dot{display:inline-block;flex:none;width:19px;height:19px;border-radius:50%;border:2px solid var(--ink);background:var(--paper)}
.dot.on{background:var(--ind);border-color:var(--ind)}
.kline{font-size:1.3125rem;line-height:1.35}
.kexact{font-size:1.1875rem;line-height:1.45}
.kno{align-self:flex-start;margin-top:8px;padding:0 10px;border:1.5px solid var(--ink);border-radius:6px;font-size:1.1875rem;font-weight:700}
.krow .opn{margin-top:22px}
.krow.notyet .opn{margin-top:6px}
.kopen{padding:4px 14px 14px;border-top:2px solid var(--grain)}
.kph{margin-top:8px;font-size:1.1875rem;font-weight:700}
.picks{display:flex;flex-wrap:wrap;gap:2px 20px;margin-top:4px}
.picks li{font-size:1.1875rem;line-height:1.5}
.kwarn{margin-top:8px;font-size:1.125rem}
.restk>summary{justify-content:center;gap:12px}
.ny-h{margin-top:22px;font-size:1.3125rem}

/* 오늘 찾은 21곳 */
.found-h{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 12px;margin-top:2px}
.found-h .lbl{font-size:1.5rem}
.found-h .num{font-size:44px;line-height:1.1}
.grp{margin-top:20px}
.gh{padding:10px 14px;border:1.5px solid var(--line);border-radius:10px;background:var(--soft)}
.gh h3{font-size:1.5rem;line-height:1.3}
.gh .what{font-size:1.1875rem}
.gh .p100{margin-top:4px;font-size:1.1875rem;line-height:1.45}
.gh .b100{margin-top:6px;font-size:1.1875rem}
.tally{margin-top:6px;border-top:1.5px solid var(--line);border-bottom:1.5px solid var(--line)}
.tally p{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0 12px;padding:4px 0;font-size:1.25rem}
.tally p+p{border-top:1px solid var(--line)}
.tally b{white-space:nowrap}
.card{position:relative;margin-top:8px;padding:10px 12px 10px;border:1.5px solid var(--line);border-radius:10px;background:var(--card)}
.card.dn{box-shadow:inset 6px 0 0 var(--ind)}
.crow1{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cname{font-size:1.375rem;line-height:1.35;min-width:0}
.tag-dn{flex:none;display:inline-block;padding:2px 10px;border-radius:6px;background:var(--ind);color:var(--white);font-size:1.1875rem;font-weight:700;line-height:1.4;white-space:nowrap}
.crow2{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2px}
.cmeta{min-width:0}
.cdays{font-size:1.1875rem}
.cov{font-size:17px;font-weight:700}
.spark{flex:none}
.nrows{margin-top:8px;padding:0 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);overflow:hidden}
.nrow{position:relative;padding:10px 0 8px;border-top:1.5px solid var(--grain)}
.nrow:first-child{border-top:0}
.nrow.dn::before{content:"";position:absolute;left:-12px;top:0;bottom:0;width:6px;background:var(--ind)}
.nrow .cname{font-size:1.3125rem}
.nrow .crow1{margin-bottom:3px}
.sec-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.totop{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:72px;min-height:44px;padding:0 10px;border:2px solid var(--ink);border-radius:9px;background:var(--card);color:var(--ink);text-decoration:none;font-size:1.125rem;font-weight:700;white-space:nowrap}
.nnote{margin-top:10px;padding:10px 14px;border:2px solid var(--ink);border-radius:10px}
.nnote p{font-size:1.1875rem;font-weight:700}
.nnote p+p{margin-top:4px}

/* 더 보기 */
.more{margin:26px 16px 0}
.pl{display:flex;flex-direction:column}
.pls{font-size:1.125rem;font-weight:400}
.more-in{margin-top:10px}
.more-in h3{margin-top:14px;font-size:1.3125rem}
.ov{margin-top:6px;padding:2px 14px;border:1.5px solid var(--line);border-radius:10px;background:var(--card)}
.ov li{display:flex;flex-direction:column;padding:9px 0;border-top:1.5px solid var(--grain)}
.ov li:first-child{border-top:0}
.ov li b{font-size:1.3125rem}
.ov li span{font-size:1.1875rem}
.qdesc>span{display:block}

/* 끝 */
.end{padding:28px 16px 18px}
.stop>summary{display:flex;align-items:center;justify-content:center;gap:10px;min-height:64px;padding:8px 14px;border:3px solid var(--ink);border-radius:14px;background:var(--card);font-size:1.375rem;font-weight:700;text-align:center}
.qs{margin-top:10px;padding:4px 14px;border:1.5px solid var(--line);border-radius:12px;background:var(--card)}
.qs li{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-top:1.5px solid var(--grain);font-size:1.25rem;font-weight:700}
.qs li:first-child{border-top:0}
.qn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:2px solid var(--ink);border-radius:50%;font-size:17px;line-height:1}
.disc{margin-top:22px}
.disc p{font-size:1.1875rem;font-weight:700}
.asof2{margin-top:6px;font-size:1.1875rem}
.bye{margin-top:18px;padding-top:14px;border-top:2px solid var(--grain);font-size:1.3125rem;font-weight:700;text-align:center}

/* 아래 탭 */
.tabs{position:sticky;bottom:0;z-index:5;display:grid;grid-template-columns:1fr 1fr 1.05fr 1fr 1fr 1.25fr;background:var(--paper);border-top:2px solid var(--ink)}
.tabs a{display:flex;align-items:center;justify-content:center;min-height:58px;padding:2px;color:var(--ink);text-decoration:none;font-size:1.125rem;font-weight:700;line-height:1.2;text-align:center}
.tabs a[aria-current="page"]{background:var(--ink);color:var(--paper)}
'''

JS = r'''
(function(){
  var root=document.documentElement, big=document.getElementById('bigBtn');
  function setBig(on){root.classList.toggle('big',on);big.setAttribute('aria-pressed',on?'true':'false');}
  try{ if(localStorage.getItem('szbb-big')==='1') setBig(true); }catch(e){}
  big.addEventListener('click',function(){
    var on=!root.classList.contains('big'); setBig(on);
    try{ localStorage.setItem('szbb-big',on?'1':'0'); }catch(e){}
  });
  var nb=document.querySelectorAll('.note .btns button');
  nb.forEach(function(b){ b.addEventListener('click',function(){
    nb.forEach(function(x){ x.setAttribute('aria-pressed', x===b ? 'true' : 'false'); });
  }); });
})();
'''

page = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{E(D['brand'])} · 오늘</title>
<style>{CSS}</style>
</head>
<body>
<header class="top" id="top">
  <div class="brand">{MARK}<h1>{E(D['brand'])}</h1></div>
  <div class="tools">
    <button type="button" class="bigb" id="bigBtn" aria-pressed="false">글씨 크게</button>
    <button type="button">천사</button>
    <button type="button">선물</button>
  </div>
</header>
<p class="intro">불장 · 꽃이 될 · 돈이 몰리는 곳을 찾아요</p>
<p class="honest">사고팔라는 말이 아니라 지난 기록이에요.</p>
<div class="rule" aria-hidden="true"></div>

<main>
<section class="sun" aria-label="요즘 장 모습">
  <h2 class="sec-h">요즘 장 모습<span class="asof">{E(D['asOfSay'])}</span></h2>
  <p class="land-now">지금은 {E(SUN['name'])}이에요</p>
  <p class="do">{E(SUN['do'])}</p>
  <div class="slips" role="img" aria-label="다섯 땅 가운데 오늘은 {E(SUN['name'])}">{slips}</div>
  <p class="slip-cap"><span class="nw">칸 밑 숫자는</span> <span class="nw">그 땅이었던 날 수예요.</span> {cap2}</p>
  <div class="why">{why_html}</div>
  <div class="legend">
    <h3>100원 막대 읽는 법</h3>
    {legend_ruler()}
    <p class="lk"><i class="sw dn"></i><span>왼쪽 꽉 찬 파란 막대는 줄었어요.</span></p>
    <p class="lk"><i class="sw up"></i><span>오른쪽 속이 빈 막대는 늘었어요.</span></p>
    <p><span class="nw">가운데 세로줄은</span> <span class="nw">한 달 전 100원이에요.</span></p>
    <p>작은 눈금 한 칸은 10원이에요.</p>
  </div>
  <details class="lands">
    <summary class="pill">다섯 땅 뜻 보기{TRI}</summary>
    <ul class="meaning">{land_meaning}</ul>
  </details>
  <p class="qlabel">손자병법에서</p>
  <p class="quote">{quote_html}</p>
  <p class="guide">아래로 내려 이런 땅에서 덜 잃은 꾀를 봐요.</p>
</section>

<aside class="note" aria-label="쪽지">
  <p class="exrow"><span class="ex">예시</span><span class="exs">눌러도 저장되지 않아요</span></p>
  <p class="q">한 달 전 내 약속 공책에 적은 대로 했나요?</p>
  <div class="btns"><button type="button" aria-pressed="false">못 했어요</button><button type="button" aria-pressed="false">했어요</button></div>
</aside>

<section class="rank" aria-label="덜 잃은 꾀">
  <h2 class="sec-h">이런 땅에서 지금까지 덜 잃은 꾀</h2>
  <p class="sub"><span class="nw">꾀는 회사를 고르는 방법이에요.</span> <span class="nw">그 방법대로 골랐다면</span> <span class="nw">얼마나 잃었는지 봐요.</span></p>
  <p class="sub"><span class="nw">지난 {int(SUN['histDays'])}날 가운데</span> <span class="nw">{E(TODAY['name'])}이었던 {int(TODAY['days500'])}날의</span> <span class="nw">기록만 모아서 셌어요.</span></p>
  <p class="hint"><i class="dot on" aria-hidden="true"></i>파란 점이 잃은 번이에요.</p>
  <p class="hint">▼ 표를 누르면 회사 일곱이 나와요.</p>
  <p class="rest-h">싸우지 않으면 지지 않아요</p>
  <div class="rest"><b class="nm">{E(D['rest']['easy'])}</b>{dots(0)}<span class="ln">{E(D['rest']['line'])}</span></div>
  {top7}
  <details class="restk">
    <summary class="pill">나머지 꾀 {len(rank) - 7}개 보기{TRI}</summary>
    <div class="inner">{rest_rank}</div>
  </details>
  <h3 class="ny-h">아직 못 센 꾀 {len(D['notYet'])}개</h3>
  <p class="sub">기록이 모자라 순위 없이 둬요.</p>
  {not_yet}
</section>

<section class="found" aria-label="오늘 찾은 곳">
  <h2 class="found-h"><span class="lbl">오늘 찾은</span><span class="num">{total_found}곳</span></h2>
  <p class="sub">{' '.join(found_parts)}</p>
  {found_dup}
  <p class="key"><span><i class="sw dn"></i>줄었어요</span><span><i class="sw up"></i>늘었어요</span><span><i class="sw mid"></i>가운데 세로줄은 한 달 전 100원</span></p>
  {groups_html}
</section>

<section class="next" aria-label="곧 그렇게 될 듯한 곳">
  <div class="sec-row"><h2 class="sec-h">곧 그렇게 될 듯한 곳</h2><a class="totop" href="#top">맨 위로</a></div>
  <p class="sub">{' '.join(next_parts)}</p>
  {next_dup}
  <div class="nnote"><p><span class="nw">예언이 아니에요.</span> <span class="nw">앞으로 어떻게 될지는 몰라요.</span></p><p><span class="nw">지난 1년 같은 모습이었던 곳이</span> <span class="nw">된 번과 안 된 번을</span> <span class="nw">둘 다 적어요.</span></p></div>
  {next_html}
</section>

<details class="more">
  <summary class="pill"><span class="pl"><b>더 보기</b><span class="pls">여러 묶음에 든 회사 · 값이 잠잠한 회사</span></span>{TRI}</summary>
  <div class="more-in">
    <h3>여러 묶음에 든 곳</h3>
    <ul class="ov">{ov_html}</ul>
    <h3>값이 잠잠한 일곱</h3>
    <p class="sub qdesc">{sentences('한 달 동안 값이 잠잠했어요. 닷새 동안 외국인과 연금 · 보험 같은 큰손이 판 것보다 더 샀어요. 앞날은 몰라요.')}</p>
    <ol class="nrows">{quiet_html}</ol>
  </div>
</details>

<section class="end" aria-label="끝">
  <details class="stop">
    <summary><span>사기 전에 한 번 멈춰요</span>{TRI}</summary>
    <ol class="qs">
      <li><span class="qn">1</span><span>왜 사는지 한 줄로 적을 수 있나요?</span></li>
      <li><span class="qn">2</span><span>얼마를 잃으면 멈출지 정했나요?</span></li>
      <li><span class="qn">3</span><span>남이 알려 준 회사인가요?</span></li>
    </ol>
  </details>
  <div class="disc"><p>지난 기록만 보여 줘요.</p><p>사고팔기를 권하지 않아요.</p></div>
  <p class="asof2">{E(D['asOfSay'])}</p>
  <p class="bye">오늘은 여기까지예요</p>
</section>
</main>
<script>{JS}</script>

<nav class="tabs" aria-label="아래 탭">
  <a href="#top" aria-current="page">오늘</a>
  <a href="#top">업종</a>
  <a href="#top">왜 사?</a>
  <a href="#top">기록</a>
  <a href="#top">달력</a>
  <a href="#top">셈 장부</a>
</nav>
</body>
</html>
'''

open(OUT, 'w', encoding='utf-8').write(page)
print('찍음:', OUT, len(page.encode('utf-8')), '바이트')
