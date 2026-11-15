#!/usr/bin/env python3
# 샘플 1 「실선과 점선」 — data.json 하나만 읽어 sample-1.html 을 찍어 낸다(지어낸 숫자 0)
# 고침 2판: 검사단 열한 명 지적(FIX-1.md) + 숫자 검사(s1-L04) + 덧붙임 둘 반영
import json, os, html, collections

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'data.json'), encoding='utf-8'))
OUT = os.path.join(HERE, 'sample-1.html')
E = html.escape

BG, INK, ACC = '#F5F2EA', '#1C2226', '#2E6B5E'
NUMW = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']
GNAME = {g['key']: g['name'] for g in D['groups'] + D['next']}

# 딱 가운데 회사 한 달 값 — SAMPLE_COMMON 이 준 진짜 값(저장소 su21.json sun.m.mid −0.0425 → 100원이 95.75 → 95.8)
MID100 = '95.8'


def nw(*parts):
    """줄이 이 조각들 사이에서만 바뀌게(조각 안에서는 안 바뀜)"""
    return ' '.join(f'<span class="nw">{p}</span>' for p in parts)


# ---------- 작은 그림 ----------
CHEV = ('<span class="chev-c" aria-hidden="true"><svg class="chev" viewBox="0 0 24 24">'
        '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.8" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg></span>')
TRI = '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M0 0h12L6 10z" fill="currentColor"/></svg>'
DOWN = f'<span class="down">{TRI}한 달 내림</span>'
DOWN_LINE = f'<span class="down line">{TRI}한 달 내림</span>'     # 될 듯 칸 안: 가벼운 실선 딱지
MARK = ('<svg class="mark" viewBox="0 0 30 30" aria-hidden="true">'
        f'<circle cx="5" cy="15" r="3.4" fill="{ACC}"/>'
        f'<path d="M8 13.4C14 12 17 6.2 27.5 5" fill="none" stroke="{ACC}" stroke-width="2.2" stroke-linecap="round"/>'
        f'<path d="M8 16.6C14 18 17 23.8 27.5 25" fill="none" stroke="{ACC}" stroke-width="2.2" stroke-dasharray="3.4 2.8"/>'
        '</svg>')
PAUSE = (f'<svg class="pause" viewBox="0 0 24 24" aria-hidden="true">'
         f'<rect x="5.5" y="4.5" width="4.6" height="15" rx="1.4" fill="{INK}"/>'
         f'<rect x="13.9" y="4.5" width="4.6" height="15" rx="1.4" fill="{INK}"/></svg>')
DOWNARROW = ('<svg class="jump-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15M6 13l6 6 6-6" fill="none" '
             'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def f1(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def shape(key, cx, cy, S, col):
    """땅마다 모양(S = 대략 폭) — 오르는 땅 위 세모 · 좁은 길 세로 막대 · 잔잔한 땅 가로 한 줄 · 흔들리는 땅 지그재그 · 내리는 땅 아래 세모"""
    P = lambda pts: ' '.join(f1(x) + ',' + f1(y) for x, y in pts)
    if key == 'rise':
        return f'<polygon points="{P([(cx-S/2, cy+0.42*S), (cx+S/2, cy+0.42*S), (cx, cy-0.45*S)])}" fill="{col}"/>'
    if key == 'fall':
        return f'<polygon points="{P([(cx-S/2, cy-0.42*S), (cx+S/2, cy-0.42*S), (cx, cy+0.45*S)])}" fill="{col}"/>'
    if key == 'narrow':
        return (f'<rect x="{f1(cx-0.18*S)}" y="{f1(cy-0.6*S)}" width="{f1(0.36*S)}" height="{f1(1.2*S)}" '
                f'rx="{f1(0.08*S)}" fill="{col}"/>')
    if key == 'calm':
        return (f'<rect x="{f1(cx-0.52*S)}" y="{f1(cy-0.17*S)}" width="{f1(1.04*S)}" height="{f1(0.34*S)}" '
                f'rx="{f1(0.08*S)}" fill="{col}"/>')
    if key == 'shake':
        pts = [(cx - 0.52 * S + i * 0.26 * S, cy + (0.34 * S if i % 2 == 0 else -0.34 * S)) for i in range(5)]
        return (f'<polyline points="{P(pts)}" fill="none" stroke="{col}" stroke-width="{f1(max(2.2, 0.16*S))}" '
                'stroke-linejoin="round" stroke-linecap="round"/>')
    return ''


def cell_icon(key, w=36, h=40, S=22):
    """다섯 땅 풀이 칸 — 띠의 지난 날 네모와 같은 꼴(글 색 실선 테두리 + 글 색 모양 · 채움 없음)"""
    return (f'<svg class="cell" viewBox="0 0 {w} {h}" aria-hidden="true">'
            f'<rect x="1" y="1" width="{w-2}" height="{h-2}" rx="4" fill="none" stroke="{INK}" stroke-width="2"/>'
            + shape(key, w / 2, h / 2, S, INK) + '</svg>')


def today_icon(key, size=48):
    """오늘 땅 큰 그림 — 띠의 오늘 네모와 같은 꼴 같은 색(강조색 채움 + 4px 테두리)"""
    return (f'<svg class="today-ic" viewBox="0 0 {size} {size}" aria-hidden="true">'
            f'<rect x="2" y="2" width="{size-4}" height="{size-4}" rx="6" fill="{ACC}" stroke="{INK}" stroke-width="4"/>'
            + shape(key, size / 2, size / 2, size * 0.5, BG) + '</svg>')


def band_svg(path):
    """스무 날 띠 — 열 칸씩 두 줄 · 윗줄 왼쪽이 스무 날 전 · 아랫줄 오른쪽 끝(오늘)만 강조색 채움"""
    W, M, G, RG, CH = 358, 3, 4, 6, 36
    cw = (W - 2 * M - 9 * G) / 10
    H = M + CH + RG + CH + M
    parts = []
    for i, k in enumerate(path):
        row, col = divmod(i, 10)
        x = M + col * (cw + G)
        y = M + row * (CH + RG)
        if i < len(path) - 1:
            parts.append(f'<rect x="{f1(x+1)}" y="{f1(y+1)}" width="{f1(cw-2)}" height="{CH-2}" rx="4" '
                         f'fill="none" stroke="{INK}" stroke-width="2"/>')
            parts.append(shape(k, x + cw / 2, y + CH / 2, 19, INK))
        else:   # 오늘 — 조금 크게(가장자리 3px 밖으로)
            parts.append(f'<rect x="{f1(x-1)}" y="{f1(y-1)}" width="{f1(cw+2)}" height="{CH+2}" rx="5" '
                         f'fill="{ACC}" stroke="{INK}" stroke-width="4"/>')
            parts.append(shape(k, x + cw / 2, y + CH / 2, 19, BG))
    names = {l['key']: l['name'] for l in D['sun']['lands']}
    label = '지난 스무 날의 땅, 윗줄 왼쪽이 스무 날 전, 아랫줄 끝이 오늘: ' + ', '.join(names[k] for k in path)
    return (f'<svg viewBox="0 0 {W} {f1(H)}" role="img" aria-label="{E(label)}">' + ''.join(parts) + '</svg>')


# 꺾은선 — 모든 칸 같은 눈금(가장 크게 오르내린 끝값들이 칸 높이에 꼭 맞고, 시작선 높이는 칸마다 같음)
ALLR = [v / it['c'][0] for g in D['groups'] for it in g['items'] for v in it['c']]
GLO, GHI = min(ALLR), max(ALLR)


def spark(c, w=120, h=56, pad=7.5):
    r = [v / c[0] for v in c]
    X = lambda i: pad + i * (w - 2 * pad) / (len(r) - 1)
    Y = lambda v: pad + (GHI - v) / (GHI - GLO) * (h - 2 * pad)
    pts = ' '.join(f'{X(i):.1f},{Y(v):.1f}' for i, v in enumerate(r))
    b = Y(1.0)
    return (f'<svg class="spark" viewBox="0 0 {w} {h}" aria-hidden="true">'
            f'<line x1="2" x2="{w-2}" y1="{b:.1f}" y2="{b:.1f}" stroke="{INK}" stroke-opacity=".55" stroke-width="1.25"/>'
            f'<polyline points="{pts}" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'
            f'<circle cx="{X(len(r)-1):.1f}" cy="{Y(r[-1]):.1f}" r="5" fill="{INK}" stroke="{BG}" stroke-width="2"/>'
            '</svg>')


def dots(t):
    return ''.join('<i class="dot on"></i>' if i < t else '<i class="dot"></i>' for i in range(10))


# ---------- 칸 ----------
def card(it):
    tag = DOWN if it['down'] else ''
    return ('<li class="card">'
            f'<div class="c-top">{tag}<b class="c-name">{E(it["name"])}</b></div>'
            f'<p class="c-val"><span>100원이</span> <b class="num">{E(it["v100"])}원</b></p>'
            f'<p class="c-days">이 묶음에 든 지 {it["days"]}일</p>'
            f'{spark(it["c"])}</li>')


def nrow(it):
    tag = DOWN_LINE if it['down'] else ''
    return ('<li class="nrow">'
            f'<div class="n-top"><b class="n-name">{E(it["name"])}</b>{tag}</div>'
            f'<p class="n-val"><span>지난 한 달 100원이</span> <b class="num nv">{E(it["v100"])}원</b></p></li>')


def krow(e):
    picks = ''.join(f'<li>{E(p)}</li>' for p in e['picks'])
    return ('<li class="kk"><details><summary class="kk-sum">'
            f'<span class="kk-no num">{e["rank"]}</span>'
            f'<span class="kk-main"><b class="kk-name">{E(e["easy"])}</b>'
            f'<span class="dots" aria-hidden="true">{dots(e["tenths"])}</span>'
            f'<span class="kk-line">{E(e["line"])}</span>'
            f'<span class="kk-cnt num">{e["n"]}번 가운데 {e["lose"]}번</span></span>{CHEV}</summary>'
            '<div class="kk-body">'
            f'<p class="kk-say">{E(e["say"])}</p>'
            '<p class="kk-ph">오늘 이 꾀에 걸린 회사</p>'
            f'<ul class="chips">{picks}</ul>'
            '<p class="kk-no-buy">사라는 뜻이 아니에요.</p></div></details></li>')


def nyrow(e):
    return ('<li class="ny"><details><summary class="ny-sum">'
            f'<b class="ny-name">{E(e["easy"])}</b><span class="yet ny-tag">{E(e["line"])}</span>{CHEV}</summary>'
            f'<p class="ny-say">{E(e["say"])}</p></details></li>')


# ---------- 요즘 장 모습 ----------
S = D['sun']
today = S['land']
lands = S['lands']
lmap = {l['key']: l for l in lands}
cnt20 = {l['key']: S['path20'].count(l['key']) for l in lands}
N365, UP = S['market']['n'], S['market']['up']
assert UP * 10 < N365 * 4          # 「열에 넷이 안 돼요」가 참인지 자료로 확인
MEAN = {   # 36명이 고른 다섯 땅 뜻(SAMPLE_COMMON) — 숫자 365 는 market.n
    'rise': f'한 달 전보다 오른 회사가 열에 여섯을 넘고, {N365}곳을 줄 세운 딱 가운데 회사도 올랐을 때예요.',
    'narrow': '평균은 올랐는데 오른 회사는 절반이 안 될 때예요. 몇 곳만 크게 오른 거예요.',
    'calm': '다른 네 땅에 들지 않는 때예요.',
    'shake': '요즘 하루 오르내림이 평소보다 한 배 반 넘게 클 때예요.',
    'fall': f'한 달 전보다 오른 회사가 열에 넷이 안 되고, {N365}곳을 줄 세운 딱 가운데 회사도 내렸을 때예요.',
}
# 풀이 차례: 오늘 땅 먼저 → 많은 날 차례 → 0날은 맨 아래
order = [lmap[today]] + sorted([l for l in lands if l['key'] != today], key=lambda l: -cnt20[l['key']])
mean_li = ''
for l in order:
    k = l['key']
    extra = (f'<p class="mid">오늘은 딱 가운데 회사가 한 달에 100원이 {MID100}원이에요.</p>' if k == today else '')
    tag = '<span class="tday-tag">오늘</span>' if k == today else ''
    mean_li += (f'<li>{cell_icon(k)}<div><p class="ml-h"><b>{E(l["name"])}</b> <b class="num">{cnt20[k]}날</b>{tag}</p>'
                f'<p>{E(MEAN[k])}</p>{extra}</div></li>')

sun_html = f'''
<section class="sec sun" aria-labelledby="h-sun">
  <div class="status">{today_icon(today)}<div><h2 class="lbl" id="h-sun">요즘 장 모습</h2><p class="state">지금은 {E(S["name"])}이에요</p></div></div>
  <p class="why">땅은 요즘 장의 날씨예요.</p>
  <p class="why bal">{N365}곳 가운데 한 달 전보다 오른 곳은 {UP}곳이에요. 열에 넷이 안 돼요.</p>
  <ul class="key"><li><i class="kbox" aria-hidden="true"></i>실선 칸은 이미 일어난 일</li><li><i class="kbox dash" aria-hidden="true"></i>점선 칸은 아직 안 일어난 일</li></ul>
  <div class="band-wrap">
    <p class="band-top">스무 날 전부터, 하루가 네모 하나예요</p>
    <div class="band">{band_svg(S["path20"])}</div>
    <div class="band-foot">
      <details class="meaning"><summary><span>다섯 땅 뜻과 며칠씩 보기</span>{CHEV}</summary>
        <div class="mean"><p class="mean-h">장이 열린 스무 날 가운데</p><ul>{mean_li}</ul></div></details>
      <span class="tday">오늘</span>
    </div>
  </div>
  <p class="quote bal">“{E(S["quote"])}”</p>
  <p class="do">{E(S["do"])}</p>
</section>'''

# ---------- 쪽지 ----------
note_html = '''
<section class="sec note" aria-label="쪽지">
  <span class="tag-ex">예시</span>
  <p class="note-who bal">이 칸은 쓰는 분만 보세요. 처음이면 그냥 아래로 내려가세요.</p>
  <p class="note-q bal">한 달 전 내 약속 공책에 적은 대로 했나요?</p>
  <div class="note-btns"><button type="button" class="pick" aria-pressed="false">했어요</button><button type="button" class="pick" aria-pressed="false">못 했어요</button></div>
</section>'''

# ---------- 오늘 찾은 21곳 ----------
total = sum(len(g['items']) for g in D['groups'])
distinct_now = len({it['name'] for g in D['groups'] for it in g['items']})
ov = D['overlap']
ov_line = ''
if ov:
    both = all(len(o['in']) == 2 for o in ov)
    assert total - distinct_now == len(ov)
    ov_line = ('<p class="sub bal">' + nw(", ".join(E(o["name"]) for o in ov), f'{NUMW[len(ov)]} 곳은',
               f'{"두 묶음에" if both else "여러 묶음에"} 함께 들어', f'이름으로는 {distinct_now}곳이에요.') + '</p>')
WHAT_NOW = {'bloom': '아직 덜 오른 회사 가운데 규모가 큰 회사'}     # 「싹 · 몸집」을 쉬운 말로(su21.py: 회사 크기 위 20 안)
groups_html = ''
for g in D['groups']:
    groups_html += (f'<div class="grp"><h3 class="h3"><i class="kbox" aria-hidden="true"></i>{E(g["name"])}</h3>'
                    f'<p class="what bal">{E(WHAT_NOW.get(g["key"], g["what"]))}</p>'
                    f'<ul class="cards">{"".join(card(it) for it in g["items"])}</ul></div>')
now_html = f'''
<section class="sec now" aria-labelledby="h-now">
  <h2 class="now-h" id="h-now"><span class="now-lbl">오늘 찾은</span> <span class="now-num num">{total}곳</span></h2>
  <p class="lead"><span class="nw">불장 · 꽃이 될 · 돈이 몰리는 곳</span><br><span class="nw">일곱 곳씩이에요</span></p>
  <p class="sub">{nw("「100원이 몇 원」은", "한 달 전 100원이", "지금 몇 원이 됐는지", "보여 줘요.")}</p>
  {ov_line}
  {groups_html}
</section>'''

# ---------- 곧 그렇게 될 듯한 곳 ----------
WHAT_NEXT = {   # data 의 what 을 쉬운 말로(숫자 15 는 data 그대로 · 시장보다 15 넘게 = 100원에 15원 넘게)
    'hotNext': '지난 1년, 한 달 안에 ' + nw(f'{GNAME["hot"]} 일곱 곳에') + ' 든 번이에요.',
    'bloomNext': '지난 1년, 한 달 안에 ' + nw('전체 회사보다') + ' ' + nw('100원에 15원 넘게') + ' 더 오른 번이에요.',
    'moneyNext': '지난 1년, 한 달 안에 ' + nw(f'{GNAME["money"]} 일곱 곳에') + ' 든 번이에요.',
}
assert '15 넘게' in [g for g in D['next'] if g['key'] == 'bloomNext'][0]['what']
note = D['nextNote']
if note.startswith('예언이 아니에요 · '):        # 머리와 같은 말이 두 번 나오지 않게
    note = note[len('예언이 아니에요 · '):]
nslots = [it['name'] for g in D['next'] for it in g['items']]
ncount = collections.Counter(nslots)
dups = [n for n in ncount if ncount[n] > 1]
dup_line = ''
if dups:
    dup_line = (f'<p class="sub bal">세 묶음 합쳐 {len(nslots)}자리예요. '
                f'{", ".join(E(n) for n in dups)}{"은" if len(dups) == 1 else "들은"} 두 묶음에 들어 두 번 셌어요.</p>')
next_html_g = ''
for g in D['next']:
    p, b = g['per100'], g['base100']
    next_html_g += f'''
  <div class="ngrp">
    <div class="ng-head"><h3 class="h3"><i class="kbox dash" aria-hidden="true"></i>{E(g["name"])}</h3><span class="yet">아직 안 됨</span></div>
    <p class="what bal">{WHAT_NEXT[g["key"]]}</p>
    <p class="odds bal">이 모습이던 곳은 100번 가운데 <b class="num">{p}번</b> 그렇게 됐고, <b class="num">{100 - p}번</b>은 아니었어요.</p>
    <p class="odds">전체 회사는 100번에 <b class="num">{b}번</b>이었어요.</p>
    <p class="no-buy">사라는 뜻이 아니에요.</p>
    <ul class="nlist">{"".join(nrow(it) for it in g["items"])}</ul>
  </div>'''
next_html = f'''
<section class="sec next" aria-labelledby="h-next">
  <h2 class="h2" id="h-next">곧 그렇게 될 듯한 곳</h2>
  <p class="warn bal">될 듯은 예언이 아니에요. 앞으로 어떻게 될지는 몰라요.</p>
  <p class="sub bal">{E(note)}.</p>
  {dup_line}
  {next_html_g}
</section>'''

# ---------- 덜 잃은 꾀 ----------
fall_days = lmap[today]['days500']
rank = D['rank']
rest = D['rest']
assert rest['line'] == '안 사면 100원은 100원 · 잃은 번 0'
rest_li = ('<li class="kk kk-rest"><div class="kk-sum">'
           f'<span class="kk-no">{PAUSE}</span>'
           f'<span class="kk-main"><span class="rest-h"><b class="kk-name">{E(rest["easy"])}</b><span class="best">으뜸</span></span>'
           f'<span class="dots" aria-hidden="true">{dots(0)}</span>'
           '<span class="kk-line">안 사면 100원은 100원이에요.</span><span class="kk-line">잃은 번 0</span>'
           f'<a class="jump" href="#stop">{DOWNARROW}사기 전 세 물음 보러 가기</a></span></div></li>')
top7 = ''.join(krow(e) for e in rank[:7])
more = ''.join(krow(e) for e in rank[7:])
ny = D['notYet']
kk_html = f'''
<section class="sec kkoe" aria-labelledby="h-kk">
  <h2 class="h2" id="h-kk">지금 같은 때, 덜 잃은 꾀</h2>
  <p class="sub">꾀는 회사를 고르는 방법이에요.</p>
  <p class="sub">{nw(f"지난 {S['histDays']}날 가운데", E(lmap[today]["name"]) + "은", f"{fall_days}날이었어요.")}</p>
  <p class="sub">{nw(f"그 {fall_days}날 가운데", "잃은 번이 적은", "차례로 놓았어요.")}</p>
  <p class="dkey"><span><i class="dot on" aria-hidden="true"></i>잃은 번</span><span><i class="dot" aria-hidden="true"></i>안 잃은 번</span></p>
  <ul class="kk-box">
    {rest_li}
    {top7}
    <li class="kk-more"><details><summary class="more-sum"><span>나머지 꾀 {len(rank) - 7}개 보기</span>{CHEV}</summary><ul class="kk-sub">{more}</ul></details></li>
  </ul>
  <div class="ny-box">
    <h3 class="h3"><i class="kbox dash" aria-hidden="true"></i>아직 못 센 꾀 {NUMW[len(ny)]}</h3>
    <p class="what">아직 세지 못해 순위가 없어요.</p>
    <ul class="ny-list">{"".join(nyrow(e) for e in ny)}</ul>
  </div>
</section>'''

# ---------- 멈춤 · 끝 ----------
stop_html = f'''
<section class="sec stop" id="stop">
  <details class="stop-d"><summary class="stop-sum"><span>사기 전에 한 번 멈춰요</span>{CHEV}</summary>
    <ol class="stop-q"><li>왜 사는지 한 줄로 적을 수 있나요?</li><li>얼마를 잃으면 멈출지 정했나요?</li><li>남이 알려 준 회사인가요?</li></ol>
  </details>
  <p class="stop-note bal">남이 알려 준 회사를 잘 모르면 오늘은 쉬어 가요.</p>
</section>
<footer class="foot">
  <p>지난 기록만 보여 줘요.</p>
  <p>사고팔기를 권하지 않아요.</p>
  <p>{E(D["asOfSay"])}</p>
</footer>'''

ICON = {
    '오늘': '<circle cx="12" cy="12" r="4.4"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/>',
    '지도': '<path d="M3 6.2l6-2.2 6 2.2 6-2.2v13.6l-6 2.2-6-2.2-6 2.2z"/><path d="M9 4v13.6M15 6.2v13.6"/>',
    '왜 사?': '<circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.4a2.8 2.8 0 1 1 4 2.5c-.9.4-1.3 1-1.3 1.9v.4"/><circle cx="12" cy="17.2" r=".6"/>',
    '지난날': '<circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/>',
    '달력': '<rect x="3.6" y="5" width="16.8" height="15.4" rx="2"/><path d="M3.6 10h16.8M8 3v4M16 3v4"/>',
    '셈 장부': '<path d="M5 4.2h10.6A3.4 3.4 0 0 1 19 7.6v12.2H8.4A3.4 3.4 0 0 1 5 16.4z"/><path d="M9 9.4h6M9 13.2h6"/>',
}
tabs = ''
for i, name in enumerate(['오늘', '지도', '왜 사?', '지난날', '달력', '셈 장부']):
    on = i == 0
    cls = 'tab on' if on else 'tab'
    cur = ' aria-current="page"' if on else ''
    tabs += (f'<a href="#top" class="{cls}"{cur}>'
             f'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.1" '
             f'stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg><span>{E(name)}</span></a>')

CSS = '''
*{box-sizing:border-box}
:root{--bg:#F5F2EA;--ink:#1C2226;--acc:#2E6B5E;--hair:rgba(28,34,38,.4);--tint:rgba(28,34,38,.07);
--sans:"Noto Sans CJK KR","Noto Sans KR",sans-serif;--serif:"Noto Serif CJK KR","Noto Serif KR",serif;color-scheme:light}
html{font-size:16px;background:var(--bg);-webkit-text-size-adjust:100%;text-size-adjust:100%}
html.big{font-size:20px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:1.3125rem;line-height:1.5;
word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased}
p,h1,h2,h3,ul,ol{margin:0;padding:0}
ul,ol{list-style:none}
i{font-style:normal}
b{font-weight:700}
.num{font-variant-numeric:tabular-nums}
.nw{white-space:nowrap}
.bal{text-wrap:balance}
button{font:inherit;color:inherit;cursor:pointer}
summary{list-style:none;cursor:pointer}
summary::-webkit-details-marker{display:none}
:focus-visible{outline:3px solid var(--acc);outline-offset:3px;border-radius:8px}
.chev-c{display:inline-flex;align-items:center;justify-content:center;flex:none;width:2rem;height:2rem;border:2px solid var(--ink);
border-radius:50%;color:var(--acc);background:var(--bg)}
.chev{width:1.2rem;height:1.2rem}
details[open]>summary .chev{transform:rotate(180deg)}
@media (prefers-reduced-motion:no-preference){.chev{transition:transform .15s ease}}
.wrap{max-width:560px;margin:0 auto;padding:0 16px 40px}

/* 머리 */
.top{padding-top:8px}
.tools{display:flex;justify-content:flex-end;gap:16px}
.tool{min-height:48px;min-width:52px;padding:0 12px;border:2px solid var(--ink);border-radius:12px;background:transparent;
font-size:19px;font-weight:600;line-height:1.1;color:var(--ink)}
.tool:active{background:var(--tint)}
.tool[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--bg)}
.brand{display:flex;align-items:center;gap:10px;margin-top:6px}
.mark{width:30px;height:30px;flex:none}
.name{font-family:var(--serif);font-weight:900;font-size:2rem;letter-spacing:.08em;line-height:1.2}
.intro{margin-top:4px;font-size:1.25rem;font-weight:500;line-height:1.45;text-wrap:balance}

/* 칸 공통 */
.sec{margin-top:44px}
.h2{font-family:var(--serif);font-weight:700;font-size:1.625rem;line-height:1.3}
.h3{font-family:var(--serif);font-weight:700;font-size:1.5rem;line-height:1.3;display:flex;align-items:center;gap:10px}
.sub{margin-top:6px;font-size:1.1875rem}
.what{margin-top:4px;font-size:1.1875rem}
.kbox{display:inline-block;width:34px;height:22px;border:2px solid var(--ink);border-radius:5px;flex:none}
.kbox.dash{border-style:dashed}
.down{display:inline-flex;align-items:center;gap:6px;background:var(--ink);color:var(--bg);font-size:1.25rem;font-weight:700;
line-height:1.15;padding:4px 10px 4px 9px;border:2px solid var(--ink);border-radius:4px;white-space:nowrap}
.down svg{width:14px;height:12px;flex:none}
.down.line{background:transparent;color:var(--ink)}
.yet{display:inline-flex;align-items:center;font-size:1.125rem;font-weight:700;line-height:1.2;padding:4px 10px;
border:2px dashed var(--ink);border-radius:3px;white-space:nowrap}

/* 요즘 장 모습 */
.sun{margin-top:22px}
.status{display:flex;align-items:center;gap:10px}
.today-ic{width:48px;height:48px;flex:none}
.lbl{font-size:1.1875rem;font-weight:500;line-height:1.3}
.state{font-size:1.75rem;font-weight:800;line-height:1.3}
.why{margin-top:4px;font-size:1.1875rem}
.status+.why{margin-top:8px}
.key{display:grid;gap:4px;margin-top:10px;font-size:1.1875rem}
.key li{display:flex;align-items:center;gap:10px}
.band-wrap{margin-top:12px}
.band-top{font-size:1.125rem;font-weight:700}
.band{margin-top:4px}
.band svg{display:block;width:100%;height:auto}
.band-foot{position:relative;margin-top:6px}
.meaning>summary{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;margin-right:56px;
padding:4px 6px 4px 14px;border:2px solid var(--ink);border-radius:12px;font-size:1.1875rem;font-weight:700;color:var(--acc)}
.tday{position:absolute;right:0;top:0;height:48px;min-width:38px;display:flex;align-items:center;justify-content:center;
color:var(--acc);font-size:1.1875rem;font-weight:800;white-space:nowrap}
.mean{padding:12px 0 4px}
.mean-h{font-size:1.1875rem;font-weight:700}
.mean ul{margin-top:6px}
.mean li{display:grid;grid-template-columns:36px minmax(0,1fr);gap:12px;padding:10px 0;border-top:1px solid var(--hair)}
.cell{width:36px;height:40px}
.ml-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font-size:1.25rem}
.tday-tag{font-size:1.125rem;font-weight:800;color:var(--acc);border:2px solid var(--acc);border-radius:3px;padding:0 8px;line-height:1.4}
.mean li p:not(.ml-h){font-size:1.1875rem;margin-top:2px;text-wrap:balance}
.mean .mid{font-weight:700}
.quote{margin-top:12px;font-family:var(--serif);font-size:1.3125rem;font-weight:500;line-height:1.55}
.do{margin-top:8px;font-size:1.4375rem;font-weight:800;line-height:1.35}

/* 쪽지 */
.note{margin-top:20px;border:2px solid var(--ink);border-radius:14px;padding:14px 16px 16px}
.tag-ex{display:inline-block;font-size:1.125rem;font-weight:700;line-height:1.3;padding:1px 10px;border:2px solid var(--ink);border-radius:3px}
.note-who{margin-top:8px;font-size:1.1875rem}
.note-q{margin-top:8px;font-size:1.3125rem;font-weight:700}
.note-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.pick{min-height:54px;border:2px solid var(--acc);border-radius:12px;background:transparent;color:var(--acc);font-size:1.3125rem;font-weight:700}
.pick[aria-pressed="true"]{background:var(--acc);color:var(--bg)}

/* 오늘 찾은 21곳 */
.now-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.now-lbl{font-family:var(--serif);font-weight:700;font-size:1.625rem}
.now-num{font-weight:900;font-size:2.75rem;line-height:1.1}
.lead{margin-top:6px;font-size:1.3125rem;font-weight:500}
.grp{margin-top:28px}
.cards{display:grid;gap:8px;margin-top:10px}
.card{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"top top" "val spark" "days spark";
column-gap:12px;row-gap:0;align-items:center;border:2px solid var(--ink);border-radius:12px;padding:9px 14px 9px}
.c-top{grid-area:top;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-bottom:2px}
.c-name{font-size:1.4375rem;line-height:1.25}
.c-val{grid-area:val;font-size:1.3125rem;font-weight:500;line-height:1.25;align-self:end}
.c-val .num{font-size:1.5rem;font-weight:800}
.c-days{grid-area:days;font-size:1.1875rem;font-weight:500;line-height:1.3;align-self:start}
.spark{grid-area:spark;width:120px;height:56px}
html.big .spark{width:96px;height:auto}

/* 곧 그렇게 될 듯한 곳 */
.warn{margin-top:8px;font-size:1.3125rem;font-weight:800}
.ngrp{margin-top:20px;border:2px dashed var(--ink);border-radius:14px;padding:14px 14px 4px}
.ng-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 10px}
.ngrp .what{margin-top:8px}
.odds{margin-top:6px;font-size:1.1875rem;font-weight:500}
.odds b{font-weight:800}
.no-buy{margin-top:6px;font-size:1.1875rem;font-weight:700}
.nlist{margin-top:10px}
.nrow{padding:8px 0 9px;border-top:1px solid var(--hair)}
.n-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 10px;min-height:36px}
.n-name{font-size:1.3125rem;line-height:1.3}
.n-val{margin-top:2px;font-size:1.25rem;font-weight:500;line-height:1.3}
.nv{display:inline-block;min-width:3.7em;text-align:right;font-size:1.5rem;font-weight:800}

/* 덜 잃은 꾀 */
.dkey{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px;font-size:1.125rem}
.dkey span{display:inline-flex;align-items:center;gap:8px}
.dkey .dot{width:20px}
.kk-box{margin-top:14px;border:2px solid var(--ink);border-radius:14px}
.kk-box>li+li,.kk-sub>li{border-top:1px solid var(--hair)}
.kk-sum{display:grid;grid-template-columns:2rem minmax(0,1fr) 2rem;column-gap:8px;align-items:start;padding:14px 10px;min-height:48px}
.kk-no{display:flex;justify-content:center;font-size:1.625rem;font-weight:800;line-height:1.2}
.pause{width:1.6rem;height:1.6rem;margin-top:.15rem}
.kk-main{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.kk-name{font-size:1.3125rem;line-height:1.3}
.dots{display:grid;grid-template-columns:repeat(10,minmax(0,1.25rem));gap:6px;width:100%}
.dot{display:block;width:100%;aspect-ratio:1/1;border-radius:50%;border:2.5px solid var(--ink)}
.dot.on{background:var(--ink)}
.kk-line{font-size:1.1875rem;line-height:1.35}
.kk-cnt{font-size:1.125rem;line-height:1.3}
.kk-body{padding:0 12px 16px calc(2rem + 18px)}
.kk-say{font-size:1.1875rem;text-wrap:balance}
.kk-ph{margin-top:10px;font-size:1.125rem;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:6px 8px;margin-top:6px}
.chips li{font-size:1.1875rem;line-height:1.35;padding:3px 10px;background:var(--tint);border-radius:6px}
.kk-no-buy{margin-top:10px;font-size:1.1875rem;font-weight:700}
.kk-rest{padding:10px}
.kk-rest .kk-sum{border:3px solid var(--ink);border-radius:10px;padding:12px 10px}
.kk-rest .kk-main{grid-column:2/4}
.rest-h{display:flex;align-items:center;gap:10px}
.best{font-size:1.125rem;font-weight:800;line-height:1.3;padding:1px 9px;border:2px solid var(--ink);border-radius:3px}
.jump{display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:2px;color:var(--acc);font-size:1.1875rem;font-weight:700;
text-decoration:underline;text-underline-offset:4px}
.jump-i{width:1.2rem;height:1.2rem;flex:none}
.kk-more{padding:10px}
.more-sum{display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px;border:2px solid var(--ink);border-radius:12px;
color:var(--acc);font-weight:700;font-size:1.25rem}
.kk-sub{margin:10px -10px -10px}
.kk-sub>li:first-child{border-top:1px solid var(--hair)}
.ny-box{margin-top:18px;border:2px dashed var(--ink);border-radius:14px;padding:14px 14px 4px}
.ny-list{margin-top:8px}
.ny{border-top:1px solid var(--hair)}
.ny-sum{display:flex;align-items:center;gap:8px 10px;min-height:64px;padding:8px 0}
.ny-name{font-size:1.3125rem;line-height:1.3;min-width:0}
.ny-tag{margin-left:auto}
.ny-say{padding:0 0 14px;font-size:1.1875rem;text-wrap:balance}

/* 멈춤 · 끝 */
.stop-sum{display:flex;align-items:center;justify-content:center;gap:12px;min-height:64px;padding:8px 16px;border-radius:14px;
background:var(--acc);color:var(--bg);font-size:1.4375rem;font-weight:700}
.stop-sum .chev-c{border-color:var(--bg);background:transparent;color:var(--bg)}
.stop-q{display:grid;gap:12px;margin-top:14px;counter-reset:q}
.stop-q li{counter-increment:q;display:grid;grid-template-columns:2.25rem minmax(0,1fr);gap:10px;align-items:start;font-size:1.3125rem;font-weight:500}
.stop-q li::before{content:counter(q);display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;
border:2px solid var(--ink);border-radius:50%;font-size:1.125rem;font-weight:700}
.stop-note{margin-top:14px;font-size:1.3125rem;font-weight:700}
.foot{margin-top:44px;padding-top:16px;border-top:1px solid var(--hair);font-size:1.1875rem}
.foot p+p{margin-top:2px}

/* 아래 탭 — body 맨 끝 · sticky */
.tabs{position:sticky;bottom:0;z-index:10;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));
background:var(--bg);border-top:2px solid var(--ink);padding-bottom:env(safe-area-inset-bottom)}
.tab{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:68px;
padding:6px 0;color:var(--ink);text-decoration:none;font-size:19px;font-weight:600;line-height:1.15;text-align:center;
white-space:nowrap;letter-spacing:0}
.tab svg{width:28px;height:28px}
.tab.on{color:var(--acc);font-weight:800}
.tab.on::before{content:"";position:absolute;top:-2px;left:8px;right:8px;height:5px;background:var(--acc);border-radius:0 0 3px 3px}
'''

JS = '''
try{if(localStorage.getItem('sonja-big')==='1')document.documentElement.classList.add('big')}catch(e){}
document.addEventListener('DOMContentLoaded',function(){
  var root=document.documentElement,big=document.getElementById('bigBtn');
  big.setAttribute('aria-pressed',root.classList.contains('big')?'true':'false');
  big.addEventListener('click',function(){
    var on=!root.classList.contains('big');
    root.classList.toggle('big',on);big.setAttribute('aria-pressed',on?'true':'false');
    try{localStorage.setItem('sonja-big',on?'1':'0')}catch(e){}
  });
  var picks=document.querySelectorAll('.pick');
  Array.prototype.forEach.call(picks,function(b){b.addEventListener('click',function(){
    Array.prototype.forEach.call(picks,function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
  })});
  Array.prototype.forEach.call(document.querySelectorAll('.tab:not(.on)'),function(a){
    a.addEventListener('click',function(e){e.preventDefault()});
  });
});
'''

intro = nw('잃지 않는 길부터 보고,', '불장,', '꽃이 될 곳,', '돈이 몰리는 곳도', '함께 봐요')
page = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>손자병법 오늘</title>
<style>{CSS}</style>
<script>{JS}</script>
</head>
<body>
<div class="wrap">
<header class="top" id="top">
  <div class="tools"><button type="button" class="tool" id="bigBtn" aria-pressed="false">글씨 크게</button><button type="button" class="tool">천사</button><button type="button" class="tool">선물</button></div>
  <div class="brand">{MARK}<h1 class="name">{E(D["brand"])}</h1></div>
  <p class="intro">{intro}</p>
</header>
<main>
{sun_html}
{note_html}
{now_html}
{next_html}
{kk_html}
{stop_html}
</main>
</div>
<nav class="tabs" aria-label="아래 탭">{tabs}</nav>
</body>
</html>
'''
KEEP = ['한 달', '몇 원', '두 묶음', '세 묶음', '세 곳', '스무 날', '다섯 땅'] + [l['name'] for l in lands if ' ' in l['name']]
body_start = page.index('<body>')
head, bodyhtml = page[:body_start], page[body_start:]
for k in KEEP:
    bodyhtml = bodyhtml.replace(k, k.replace(' ', '&nbsp;'))
page = head + bodyhtml
open(OUT, 'w', encoding='utf-8').write(page)
print('찍음', OUT, len(page), '바이트')
print('스무 날 셈', cnt20, '· 꺾은선 눈금', round(GLO, 3), '~', round(GHI, 3), '· 이름으로', distinct_now, '곳 · 될 듯 겹침', dups)
