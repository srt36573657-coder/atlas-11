#!/usr/bin/env python3
# 보자마자 아는 판 — 사장님 2026-10-25 22:39 「그런데 느낌은 좋은데 모량이 넘 추상적이야 직관적으로 해야 하고 글씨도 넘 보이질 않아」
#   (22:26 「돌시계을 중심으로 디자인 해야해 지금은 겉돌아」로 만든 밝은 돌 판의 느낌은 둠)
# 고친 뼈대: 뜻을 짐작해야 하던 모양(시계판 점 · 돌 귀퉁이 판 · 기둥 · 책 · 꽃 돌)을 빼고 →
#   싹 · 꽃 · 시든 잎 · 달 · 달력 · 물음표 · 건물처럼 보자마자 아는 그림 + 큰 낱말 + 큰 숫자
#   글씨는 사장님 기준(기억 preferences 「본문 21px 이상 · 최소 17px · 제목 25px 이상 · 흐린 회색 금지」) — 390 폭에서
#   가장 작은 글 4.6cqw(18px) · 본문 5.4cqw(21px) · 제목 7cqw(27px) 넘게 · 글 색은 먹(#171615)과 짙은 청록 회색(#3C4E51)만
import os, json, html
from stones import theme_clock
D = os.path.dirname(os.path.abspath(__file__))
DATA = '/home/claude/atlas-space/site/next/data'
HOME = json.load(open(os.path.join(DATA, 'theme-home.json')))
CNT = HOME['count']
BLOOM = json.load(open(os.path.join(DATA, 'theme-bloom.json')))
INK, INK2, ACC, DEEP = '#171615', '#3C4E51', '#1FB8CD', '#152D30'

SHARED = """
.pl2 .phone{background:#F2F3F3;color:#171615;border-color:#BABCBC;box-shadow:0 0 0 1px #D6D5D4}
.pl2 .phone .wall{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 95cqw 75cqw at 50% 28%,#FFFFFF 0%,#F2F3F3 62%,#E2E5E6 100%)}
.pl2 .phone .homebar{background:#171615;opacity:.8}
.pl2 .phone .status{font-size:5cqw}
.pl2 .phone .top{position:absolute;z-index:6;top:12cqw;left:4.6cqw;right:4cqw;display:flex;align-items:center;justify-content:space-between;gap:2cqw}
.pl2 .phone .mark{font-size:7.6cqw;font-weight:900;line-height:1;letter-spacing:-.2cqw;color:#171615}
.pl2 .phone .back{font-size:5.2cqw;font-weight:900;color:#171615;white-space:nowrap}
.pl2 .phone .tools{display:flex;gap:1.4cqw;flex:none}
.pl2 .phone .tb{display:inline-flex;align-items:center;gap:1cqw;height:10.8cqw;margin:0;padding:0 1.6cqw 0 1cqw;border:.45cqw solid #171615;border-radius:5.4cqw;font:inherit;font-size:5cqw;font-weight:900;line-height:1;white-space:nowrap;color:#171615;background:#FFFFFF;box-shadow:0 .5cqw 1.2cqw rgba(23,22,21,.2);cursor:pointer}
.pl2 .phone .tb svg{display:block;width:6cqw;height:6cqw;flex:none}
.pl2 .phone .ttl{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-weight:900;color:#171615;line-height:1.1;letter-spacing:-.2cqw}
.pl2 .phone .sub{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:6cqw;line-height:1.35;font-weight:800;color:#3C4E51}
.pl2 .phone .big-ic{position:absolute;z-index:3;right:4cqw;width:19cqw;height:19cqw}
.pl2 .phone .big-ic svg{display:block;width:100%;height:100%}
/* 흰 판 — 시계판처럼 흰 바탕 · 은빛 테 · 부드러운 그림자 */
.pl2 .phone .plate{background:linear-gradient(#FFFFFF,#F2F3F3);border:.5cqw solid #818C8E;border-radius:3.2cqw;box-shadow:0 .7cqw 1.8cqw rgba(23,22,21,.18)}
.pl2 .phone .kkc{position:absolute;z-index:3;right:4cqw;display:inline-flex;align-items:center;gap:.8cqw;height:9.6cqw;margin:0;padding:0 2cqw 0 1.4cqw;border:.45cqw solid #171615;border-radius:4.8cqw;background:#FFFFFF;color:#171615;font:inherit;font-size:5cqw;font-weight:900;line-height:1;white-space:nowrap;box-shadow:0 .4cqw 1cqw rgba(23,22,21,.16);cursor:pointer}
.pl2 .phone .kkc svg{display:block;width:5.6cqw;height:5.6cqw}
.pl2 .phone .lab{position:absolute;z-index:3;left:5cqw;margin:0;font-size:6cqw;font-weight:900;color:#171615}
.pl2 .phone .hint{position:absolute;z-index:3;left:3cqw;right:3cqw;margin:0;font-size:5.8cqw;line-height:1.35;font-weight:800;color:#3C4E51;text-align:center}
.pl2 .phone .clockw{position:absolute;z-index:3}
.pl2 .phone .clockw svg{display:block;width:100%;height:auto;overflow:visible}
.pl2 .phone .sec{transform-box:view-box;animation:pl2-tick 60s steps(60) infinite}
@keyframes pl2-tick{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.pl2 .phone .sec{animation:none}}
/* 아래 줄 — 흰 바탕 · 큰 그림 · 지금 쪽은 하늘청록 짧은 줄 */
.pl2 .phone .tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:28cqw;display:grid;grid-template-columns:repeat(4,1fr);padding:2.2cqw 1cqw 0;background:#FFFFFF;border-top:.4cqw solid #D6D5D4}
.pl2 .phone .tab{position:relative;display:flex;flex-direction:column;align-items:center;gap:.4cqw;font-size:5cqw;font-weight:900;color:#171615;line-height:1.15;white-space:nowrap}
.pl2 .phone .tab svg{display:block;width:9.6cqw;height:9.6cqw}
.pl2 .phone .tab.on::after{content:"";display:block;width:7cqw;height:1cqw;border-radius:.5cqw;background:#1FB8CD}
.pl2 .phone .tab .badge{position:absolute;top:-1.4cqw;left:56%;min-width:7.6cqw;height:7.6cqw;padding:0 1.2cqw;border-radius:3.8cqw;background:#1FB8CD;color:#152D30;border:.4cqw solid #152D30;font-size:5cqw;font-weight:900;line-height:6.8cqw;text-align:center}
"""

def ic(body):
    return f'<svg viewBox="0 0 100 100" aria-hidden="true">{body}</svg>'
LINE = 'fill="none" stroke="#171615" stroke-linecap="round" stroke-linejoin="round"'
def sprout(leaf=ACC):
    return ic(f'<path d="M18 84Q50 72 82 84" {LINE} stroke-width="6"/><path d="M50 81V50" {LINE} stroke-width="6"/>'
              f'<path d="M50 54C50 37 37 27 18 29C18 46 31 56 50 54Z" fill="{leaf}" stroke="#171615" stroke-width="5" stroke-linejoin="round"/>'
              f'<path d="M50 47C50 29 63 19 83 21C83 39 70 49 50 47Z" fill="{leaf}" stroke="#171615" stroke-width="5" stroke-linejoin="round"/>')
def flower(petal='#FFFFFF', mid='#171615'):
    import math
    pts = ''.join(f'<circle cx="{50 + 15 * math.sin(math.radians(k * 72)):.1f}" cy="{34 - 15 * math.cos(math.radians(k * 72)):.1f}" r="11" fill="{petal}" stroke="#171615" stroke-width="4.5"/>' for k in range(5))
    return ic(f'<path d="M50 93V56" {LINE} stroke-width="6"/><path d="M50 76C41 66 29 67 24 73C32 82 43 82 50 76Z" fill="{petal}" stroke="#171615" stroke-width="4.5" stroke-linejoin="round"/>'
              f'{pts}<circle cx="50" cy="34" r="8.5" fill="{mid}" stroke="#171615" stroke-width="3"/>')
def wilt():
    return ic(f'<path d="M38 93V60C38 40 54 30 66 38" {LINE} stroke-width="6"/>'
              '<path d="M66 38C80 41 86 57 80 71C69 64 63 51 66 38Z" fill="#D6D5D4" stroke="#171615" stroke-width="5" stroke-linejoin="round"/>'
              '<path d="M38 68C28 60 17 62 14 69C22 76 31 76 38 68Z" fill="#D6D5D4" stroke="#171615" stroke-width="5" stroke-linejoin="round"/>'
              '<ellipse cx="62" cy="87" rx="6" ry="3.4" fill="#D6D5D4" stroke="#171615" stroke-width="3.4" transform="rotate(-20 62 87)"/>')
def moon():
    star = lambda x, y, s: f'<path d="M{x} {y - s}L{x + s * .3} {y - s * .3}L{x + s} {y}L{x + s * .3} {y + s * .3}L{x} {y + s}L{x - s * .3} {y + s * .3}L{x - s} {y}L{x - s * .3} {y - s * .3}Z" fill="#171615"/>'
    return ic('<path d="M58 14A37 37 0 1 0 88 70A30 30 0 0 1 58 14Z" fill="#E2E5E6" stroke="#171615" stroke-width="5" stroke-linejoin="round"/>'
              + star(80, 24, 8) + star(68, 44, 5))
def calendar():
    return ic(f'<rect x="14" y="22" width="72" height="64" rx="9" fill="#FFFFFF" stroke="#171615" stroke-width="6"/><path d="M14 40H86" {LINE} stroke-width="6"/>'
              f'<path d="M33 13V29M67 13V29" {LINE} stroke-width="7"/>'
              f'<path d="M50 78V62" {LINE} stroke-width="4.5"/><path d="M50 65C50 56 43 51 34 52C34 61 41 66 50 65Z" fill="{ACC}" stroke="#171615" stroke-width="3.6" stroke-linejoin="round"/>'
              f'<path d="M50 61C50 51 57 46 66 47C66 56 59 61 50 61Z" fill="{ACC}" stroke="#171615" stroke-width="3.6" stroke-linejoin="round"/>')
def question(fill='#FFFFFF'):
    return ic(f'<circle cx="50" cy="50" r="40" fill="{fill}" stroke="#171615" stroke-width="6"/><path d="M37 40C37 26 63 25 63 40C63 51 50 51 50 62" {LINE} stroke-width="9"/><circle cx="50" cy="75" r="5.6" fill="#171615"/>')
def clock_ic():
    return ic(f'<circle cx="50" cy="50" r="38" fill="#FFFFFF" stroke="#171615" stroke-width="6"/><path d="M50 26V50L66 60" {LINE} stroke-width="6"/>')
def building():
    w = ''.join(f'<rect x="{x}" y="{y}" width="9" height="9" rx="1.5" fill="#171615"/>' for x in (31, 46, 61) for y in (30, 46))
    return ic(f'<path d="M20 88V18H80V88" fill="#FFFFFF" stroke="#171615" stroke-width="6" stroke-linejoin="round"/><path d="M10 88H90" {LINE} stroke-width="6"/>{w}<rect x="42" y="64" width="16" height="24" rx="2" fill="{ACC}" stroke="#171615" stroke-width="4"/>')

KK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 16C27 16 9 30 9 48C9 60 17 70 29 75L25 90L42 79C44.6 79.4 47.3 79.6 50 79.6C73 79.6 91 65.6 91 48C91 30 73 16 50 16Z" fill="#171615"/></svg>'
GIFT = ('<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#171615" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'
        '<rect x="20" y="44" width="60" height="38" rx="4"/><rect x="15" y="31" width="70" height="14" rx="3"/><path d="M50 31V82"/>'
        '<path d="M50 31C43 17 29 19 33 28C35 32 45 32 50 31ZM50 31C57 17 71 19 67 28C65 32 55 32 50 31Z"/></g></svg>')
TOOLS = ('<span class="tools"><button class="tb" type="button" aria-label="이 화면을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'
         '<button class="tb" type="button" aria-label="선물 받기 방으로">' + GIFT + '선물 받기</button></span>')
KKC = '<button class="kkc" type="button" aria-label="이 칸을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'

def tabs(on='첫 화면'):
    items = [('첫 화면', clock_ic(), None), ('꽃 될 회사', flower(), BLOOM['today']['n']), ('싹 달력', calendar(), None), ('왜 사?', question(), None)]
    return '<nav class="tabs" aria-label="아래 줄">' + ''.join(
        f'<span class="tab{" on" if k == on else ""}">{v}{f"<span class=badge>{b}</span>" if b else ""}<span>{k}</span></span>' for k, v, b in items) + '</nav>'

FRAME_TOP = '<div class="wall"></div><div class="island"></div><div class="status"><span>9:41</span><span>●●●</span></div>'
FRAME_END = '<div class="homebar"></div>'
def head(n, name, lines):
    return (f'<div class="head"><span class="no"><b>{n}</b>{name}</span>' +
            ''.join(f'<p class="why"><em>{k}</em> {v}</p>' for k, v in lines) + '</div>')

# ① 첫 화면 — 돌 시계(지금 시각) · 그 아래 큰 네 칸(그림 + 낱말 + 큰 숫자)
def cell(cls, label, word, n, pic, on=False):
    return (f'<button class="cell plate {cls}{" on" if on else ""}" type="button" aria-label="{label}">'
            f'<span class="pic">{pic}</span><span class="w">{word}</span><span class="n">{n}<small>곳</small></span><span class="go">›</span></button>')
c1 = f"""<section class="sample pl2" id="c1"><style>
#c1 .phone .trow{{position:absolute;z-index:3;top:24.6cqw;left:5cqw;right:5cqw;display:flex;justify-content:space-between;align-items:baseline;gap:2cqw}}
#c1 .phone .trow .ttl{{position:static;font-size:7.2cqw;white-space:nowrap}}
#c1 .phone .trow .date{{font-size:5cqw;font-weight:900;color:#3C4E51;white-space:nowrap}}
#c1 .phone .clockw{{left:17cqw;width:66cqw;top:34cqw}}
#c1 .phone .grid{{position:absolute;z-index:3;left:3.4cqw;right:3.4cqw;top:89cqw;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:37cqw 37cqw;gap:2.4cqw}}
#c1 .phone .cell{{position:relative;display:block;margin:0;padding:0;font:inherit;text-align:left;color:#171615;cursor:pointer}}
#c1 .phone .cell .pic{{position:absolute;left:2.4cqw;top:2.4cqw;width:16cqw;height:16cqw}}
#c1 .phone .cell .pic svg{{display:block;width:100%;height:100%}}
#c1 .phone .cell .w{{position:absolute;left:20cqw;top:4.4cqw;font-size:7.8cqw;font-weight:900;line-height:1}}
#c1 .phone .cell .n{{position:absolute;left:3cqw;bottom:2.8cqw;font-size:13.6cqw;font-weight:900;line-height:.86;letter-spacing:-.5cqw}}
#c1 .phone .cell .n small{{font-size:6cqw;margin-left:.6cqw;letter-spacing:0}}
#c1 .phone .cell .go{{position:absolute;right:2.6cqw;bottom:2.4cqw;font-size:8cqw;font-weight:900;line-height:1;color:#3C4E51}}
#c1 .phone .cell.on{{background:#1FB8CD;border-color:#152D30;color:#152D30}}
#c1 .phone .cell.on .go{{color:#152D30}}
#c1 .phone .hint{{top:168.4cqw}}
</style>
{head('①', '첫 화면', [('가운데', '돌 시계 — 지금 시각'), ('그 아래', '네 칸 — 싹 그림 · 꽃 그림 · 달 · 시든 잎과 큰 숫자'), ('빛나는 곳', '싹 칸 하나'), ('아래 줄', '첫 화면 · 꽃 될 회사 · 싹 달력 · 왜 사?')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="mark">돌이</span>{TOOLS}</div>
<div class="trow"><h2 class="ttl">업종 77곳은 지금</h2><span class="date">10월 13일</span></div>
<div class="clockw" role="img" aria-label="돌 시계 — 9시 41분">{theme_clock('c1k', dots=False)}</div>
<div class="grid">
{cell('s', '싹 업종 37곳 보기', '싹', CNT['S'], sprout('#FFFFFF'), True)}
{cell('b', '꽃 업종 7곳 보기', '꽃', CNT['B'], flower())}
{cell('q', '잠잠 업종 29곳 보기', '잠잠', CNT['Q'], moon())}
{cell('w', '시듦 업종 4곳 보기', '시듦', CNT['W'], wilt())}
</div>
<p class="hint">칸을 누르면 그 업종들이 나와요</p>
{tabs()}{FRAME_END}</div></section>"""

# ② 싹 칸을 누르면 — 싹 업종 37곳
S_ORDER = HOME['order']['S']
REST = ['가공식품', '가전·생활용품', '건설 엔지니어링', '건축자재', '게임', '교육']
chips = ''.join(f'<span class="chip">{html.escape(x)}</span>' for x in REST) + f'<span class="chip more">그 밖 {CNT["S"] - 3 - len(REST)}곳</span>'
rows2 = ''.join(
    f'<div class="r plate{" on" if k == 0 else ""}"><span class="no">{k + 1}</span><b>{html.escape(n)}</b>{"<span class=tag>진짜 싹</span>" if k == 0 else ""}</div>'
    for k, n in enumerate(S_ORDER))
c2 = f"""<section class="sample pl2" id="c2"><style>
#c2 .phone .ttl{{top:24cqw;right:30cqw;font-size:11cqw}}
#c2 .phone .big-ic{{top:23.6cqw}}
#c2 .phone .sub.s1{{top:38cqw;right:27cqw}}
#c2 .phone .rows{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:59.6cqw;display:flex;flex-direction:column;gap:2.2cqw}}
#c2 .phone .r{{position:relative;display:flex;align-items:center;gap:3cqw;height:15cqw;padding:0 3cqw 0 2.4cqw}}
#c2 .phone .r .no{{display:flex;align-items:center;justify-content:center;width:11cqw;height:11cqw;border-radius:50%;background:#FFFFFF;border:.6cqw solid #171615;font-size:6cqw;font-weight:900;color:#171615;flex:none}}
#c2 .phone .r b{{flex:1;font-size:6.6cqw;font-weight:900}}
#c2 .phone .r.on{{border-color:#152D30;box-shadow:0 .7cqw 1.8cqw rgba(23,22,21,.18),inset 1.6cqw 0 0 #1FB8CD}}
#c2 .phone .r.on .no{{background:#1FB8CD;border-color:#152D30;color:#152D30}}
#c2 .phone .tag{{padding:1cqw 2.2cqw;border-radius:2.6cqw;background:#1FB8CD;color:#152D30;border:.45cqw solid #152D30;font-size:5cqw;font-weight:900}}
#c2 .phone .chips{{position:absolute;z-index:3;top:124cqw;left:4cqw;right:4cqw;display:flex;flex-wrap:wrap;gap:2cqw}}
#c2 .phone .chip{{padding:1.2cqw 2.6cqw;border-radius:3cqw;background:#E2E5E6;border:.4cqw solid #818C8E;font-size:5.2cqw;font-weight:900;color:#171615}}
#c2 .phone .chip.more{{background:#FFFFFF;border-style:dashed}}
#c2 .phone .hint{{top:168cqw}}
</style>
{head('②', '싹 칸을 누르면', [('보이는 것', '싹 자리 업종 37곳 — 맨 앞 셋은 크게'), ('빛나는 곳', '네 가지가 다 맞은 「진짜 싹」 2차전지'), ('칸마다', '「맨 앞 셋」과 「그 밖」에 카톡 보내기'), ('누르는 곳', '업종을 누르면 그 업종 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 뒤로</span>{TOOLS}</div>
<h2 class="ttl">싹 {CNT['S']}곳</h2>
<span class="big-ic">{sprout()}</span>
<p class="sub s1">10월 13일 싹 자리예요</p>
<p class="lab" style="top:50cqw">맨 앞 셋</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:48.6cqw"', 1)}
<div class="rows">{rows2}</div>
<p class="lab" style="top:114.4cqw">그 밖 {CNT['S'] - 3}곳</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:113cqw"', 1)}
<div class="chips">{chips}</div>
<p class="hint">업종을 누르면 그 업종 회사가 나와요</p>
{tabs()}{FRAME_END}</div></section>"""

# ③ 「꽃 될 회사」를 누르면 — 꽃 핀 업종 안의 싹 회사 31곳
GROUPS = sorted(BLOOM['today']['inds'], key=lambda g: -len(g['co']))
rows3 = ''
for i, g in enumerate(GROUPS):
    if i == 0:
        names = [c[1] for c in g['co']]
        pick = [n for n in ('대한과학', '바이오인프라', '인트론바이오', '소마젠') if n in names]
        cos = ''.join(f'<span class="co{" on" if j == 0 else ""}">{html.escape(n)}</span>' for j, n in enumerate(pick)) + f'<span class="co more">외 {len(names) - len(pick)}곳</span>'
        rows3 += f'<div class="row plate open"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span></div><div class="cos">{cos}</div></div>'
    else:
        rows3 += f'<div class="row plate"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span></div></div>'
c3 = f"""<section class="sample pl2" id="c3"><style>
#c3 .phone .ttl{{top:24cqw;right:26cqw;font-size:7.4cqw}}
#c3 .phone .big-ic{{top:23.6cqw}}
#c3 .phone .sub.s1{{top:41.8cqw;right:26cqw}}
#c3 .phone .list{{position:absolute;z-index:3;top:51cqw;left:4cqw;right:4cqw;display:flex;flex-direction:column;gap:1.6cqw}}
#c3 .phone .row{{color:#171615;overflow:hidden}}
#c3 .phone .rh{{display:flex;align-items:center;gap:2.2cqw;padding:.4cqw 3cqw .4cqw 3.6cqw;min-height:11.6cqw}}
#c3 .phone .rh b{{flex:1;font-size:6cqw;font-weight:900}}
#c3 .phone .rh .k{{font-size:6.4cqw;font-weight:900}}
#c3 .phone .open{{border-color:#152D30;box-shadow:0 .7cqw 1.8cqw rgba(23,22,21,.18),inset 1.6cqw 0 0 #1FB8CD}}
#c3 .phone .cos{{display:flex;flex-wrap:wrap;gap:1.4cqw;padding:0 3cqw 2.4cqw 3.6cqw}}
#c3 .phone .co{{padding:.8cqw 2.2cqw;border-radius:2.6cqw;background:#FFFFFF;border:.45cqw solid #171615;font-size:5cqw;font-weight:900;color:#171615}}
#c3 .phone .co.on{{background:#171615;color:#FFFFFF}}
#c3 .phone .co.more{{border-style:dashed}}
#c3 .phone .rec{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:156.4cqw;margin:0;padding:1cqw 2.6cqw;border-left:1.4cqw solid #171615;font-size:5.6cqw;line-height:1.34;font-weight:800;color:#171615}}
</style>
{head('③', '「꽃 될 회사」를 누르면', [('보이는 것', '꽃 핀 업종 여섯 안의 싹 회사 31곳'), ('정직하게', '지난 기록 한 줄을 늘 같이'), ('누르는 곳', '회사 이름을 누르면 그 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 뒤로</span>{TOOLS}</div>
<h2 class="ttl">꽃 핀 업종 안의<br>싹 회사 {BLOOM['today']['n']}곳</h2>
<span class="big-ic">{flower(ACC)}</span>
<p class="sub s1">10월 13일에 골랐어요</p>
<div class="list">{rows3}</div>
<p class="rec">지난 3년, 이렇게 고른 회사가 꽃이 된 것은 네 번에 한 번쯤이에요. 아무 회사와 큰 차이는 없어요.</p>
{tabs('꽃 될 회사')}{FRAME_END}</div></section>"""

# ④ 회사를 누르면 — 대한과학 · 「업종은 꽃 자리 · 회사는 싹」 · 「왜 사?」
c4 = f"""<section class="sample pl2" id="c4"><style>
#c4 .phone .ttl{{top:24cqw;right:28cqw;font-size:11cqw}}
#c4 .phone .big-ic{{top:23.6cqw}}
#c4 .phone .sub.s1{{top:38cqw;right:26cqw}}
#c4 .phone .chips4{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:48.6cqw;display:flex;gap:2cqw}}
#c4 .phone .st{{display:inline-flex;align-items:center;gap:1cqw;height:11.6cqw;padding:0 2.4cqw 0 1.4cqw;border-radius:5.8cqw;border:.5cqw solid #171615;background:#FFFFFF;font-size:5cqw;font-weight:900;color:#171615;white-space:nowrap}}
#c4 .phone .st svg{{display:block;width:8cqw;height:8cqw}}
#c4 .phone .st.on{{background:#1FB8CD;border-color:#152D30;color:#152D30}}
#c4 .phone .card{{position:absolute;z-index:3;top:64.4cqw;left:4cqw;right:4cqw;padding:2.6cqw 3.4cqw;margin:0;font-size:6cqw;line-height:1.42;font-weight:800;color:#171615}}
#c4 .phone .whyb{{position:absolute;z-index:3;top:99cqw;left:4cqw;right:4cqw;height:52cqw;overflow:hidden;border:.7cqw solid #152D30;box-shadow:0 .8cqw 2cqw rgba(23,22,21,.22),inset 0 0 0 1.2cqw #1FB8CD}}
#c4 .phone .whyb .q{{position:absolute;left:5cqw;top:5.4cqw;width:22cqw;height:22cqw}}
#c4 .phone .whyb .q svg{{display:block;width:100%;height:100%}}
#c4 .phone .whyb b{{position:absolute;left:32cqw;top:8cqw;font-size:15cqw;line-height:1;font-weight:900;letter-spacing:-.5cqw;color:#171615}}
#c4 .phone .whyb span.t{{position:absolute;left:6cqw;right:5cqw;bottom:4.2cqw;font-size:6cqw;line-height:1.35;font-weight:900;color:#152D30}}
#c4 .phone .later{{position:absolute;z-index:3;top:157cqw;left:5cqw;right:5cqw;margin:0;font-size:6cqw;line-height:1.38;font-weight:800;color:#171615}}
</style>
{head('④', '회사를 누르면', [('보이는 것', '회사 한 곳과 「왜 사?」 큰 단추'), ('한눈에', '「업종은 꽃 자리」와 「회사는 싹」 두 줄'), ('멈춤', '사기 전에 열한 가지를 묻고, 한 달 뒤 다시 물어요'), ('세 번', '첫 화면에서 두 번 누르면 여기 · 세 번째가 「왜 사?」')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 뒤로</span>{TOOLS}</div>
<h2 class="ttl">대한과학</h2>
<span class="big-ic">{building()}</span>
<p class="sub s1">바이오 도구·서비스</p>
<div class="chips4"><span class="st">{flower()}업종은 꽃 자리</span><span class="st on">{sprout('#FFFFFF')}회사는 싹</span></div>
<p class="card plate">10월 13일에 골랐어요. 고른 뒤 일은 날마다 싹 달력에 그대로 남아요.</p>
<div class="whyb plate" role="button" aria-label="왜 사? 열한 가지 묻기"><span class="q">{question(ACC)}</span><b>왜 사?</b><span class="t">사기 전에 열한 가지만 물어볼게요</span></div>
<p class="later">한 달 뒤에는 「그날 정한 대로 했어?」 하고 다시 물어요</p>
{tabs('꽃 될 회사')}{FRAME_END}</div></section>"""

FR = {'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4}
for k, v in FR.items():
    open(os.path.join(D, k + '.html'), 'w').write(v.replace('<style>', '<style>' + SHARED, 1))

base = open(os.path.join(D, 'base.css')).read()
pal = json.load(open(os.path.join(D, 'palette.json')))
strip = ''.join(f'<i style="background:{h}"></i>' for h in pal)
EXTRA = """
.sample .why{font-size:22px}
.sample .why em{display:inline-block;margin-right:8px;padding:0 10px;border-radius:10px;background:#152D30;color:#FFFFFF;font-size:22px;line-height:1.5;font-weight:800}
main>.intro{border:3px solid #000;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;font-size:23px}
main>.intro h1{font-size:32px;line-height:1.25;margin:0;font-weight:900}
main>.intro p{margin:0}
main>.intro .hero{border-radius:16px;background:radial-gradient(ellipse at 50% 40%,#FFFFFF,#E2E5E6);border:1px solid #BABCBC;padding:10px 16px}
main>.intro .hero svg{display:block;width:100%;max-width:420px;height:auto;margin:0 auto;overflow:visible}
main>.intro .hero .sec{transform-box:view-box;animation:pl2-tick 60s steps(60) infinite}
@media (prefers-reduced-motion:reduce){main>.intro .hero .sec{animation:none}}
main>.intro .pics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font-weight:900}
main>.intro .pics svg{display:block;width:64px;height:64px;margin:0 auto}
main>.intro .fix{border:3px solid #152D30;border-radius:14px;padding:12px 14px;background:#F2F3F3}
main>.intro .fix b{display:block;font-size:24px}
.strip{display:flex;height:30px;border-radius:10px;overflow:hidden;border:1px solid #000}
.strip i{flex:1 1 0;min-width:0}
.path{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:22px;font-weight:800}
.path span{padding:4px 12px;border:2px solid #000;border-radius:12px}
.path b{font-size:24px}
main>.note{border:1px solid #111;border-radius:18px;padding:16px;font-size:22px}
main>.note h2{font-size:26px;margin:0 0 8px;font-weight:800}
main>.note ul{margin:4px 0;padding-left:28px}
main>.asklast{border:3px solid #000;border-radius:18px;padding:16px;font-size:26px;font-weight:900}
main>.footline{font-size:22px;color:#111;margin:0}
main>details{font-size:21px;color:#111;word-break:break-all}
main>details summary{cursor:pointer;min-height:48px}
@media (max-width:540px){.sample{border:0;padding:0;border-radius:0;gap:14px}}
"""
NOT = ['진짜 사이트는 아직 그대로예요. 「응」 하시면 그때 만들어요.',
       '카톡 노란색과 선물 금빛은 고르신 색 100가지에 없어 흰색으로 했어요.',
       '이 그림의 시계는 9시 41분에 서 있고 초침만 돌아요. 지금 시각은 만들 때 붙여요.',
       '「왜 사?」를 누른 뒤 열한 질문 화면은 아직 이 모양으로 안 그렸어요.',
       '회사 찾기 단추는 아래 줄에서 뺐어요. 진짜 사이트처럼 맨 위 찾기를 쓸 생각이에요.',
       '숫자는 10월 13일 기록이라 오늘 값이 아니에요.']
pics = ''.join(f'<div>{p}<span>{w}</span></div>' for p, w in [(sprout(), '싹'), (flower(), '꽃'), (wilt(), '시듦'), (moon(), '잠잠')])
page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>돌이 보자마자 아는 판</title><style>{base}{SHARED}{EXTRA}</style></head><body><main>
<section class="intro"><h1>보자마자 알게 다시 그렸어요</h1>
<div class="hero">{theme_clock('hero', dots=False)}</div>
<p>돌 시계와 밝은 바탕은 그대로예요.</p>
<p>시계판 점, 돌 귀퉁이 판, 기둥과 책 그림은 뺐어요.</p>
<p>네 칸에는 바로 아는 그림과 큰 숫자를 넣었어요.</p>
<div class="pics">{pics}</div>
<p>글씨는 앞 판보다 크고 진하게 했어요. 흐린 회색 글은 없앴어요.</p>
<p>아래 줄도 시계, 꽃, 달력, 물음표처럼 바로 아는 그림이에요.</p>
<div class="path"><span>첫 화면</span><b>›</b><span>꽃 될 회사</span><b>›</b><span>회사</span><b>›</b><span>왜 사?</span></div>
<p>「꽃 될 회사」 길로 가면 세 번 만에 「왜 사?」에 닿아요.</p>
<div class="fix"><b>바로잡음</b>앞앞 판 ④ 화면에서 대한과학 업종을 「싹 자리」로 그렸어요. 자료로는 「꽃 자리」예요. 이 판에서도 「업종은 꽃 자리」로 그렸어요.</div>
<div class="strip">{strip}</div></section>
{c1}{c2}{c3}{c4}
<section class="note"><h2>못 한 것 {len(NOT)}가지</h2><ul>{''.join(f'<li>{x}</li>' for x in NOT)}</ul></section>
<section class="asklast">이 모양으로 진짜 돌이를 만들까요?</section>
<p class="footline">채점표: 화면 넷 모두 금지 말과 색과 글씨 크기를 기계로 검사했어요. 틀림 장부 118건 · 못 한 것 {len(NOT)}가지</p>
<details><summary>근거 펼치기</summary><p>돌 시계: 진짜 사이트 site/media/stone/home-clock.svg 그대로 · 색만 고르신 100가지 가운데 가장 가까운 색 · 바늘은 site/next/stone-clock.js 꼴</p><p>글씨 크기: 사장님 기준(본문 21px 이상 · 가장 작아도 17px · 제목 25px 이상 · 흐린 회색 금지) — 이 판은 390 폭에서 가장 작은 글 18px · 본문 21px · 제목 27px 넘게 · 검사기 shot17.mjs 가 17px 아래를 막음</p><p>내용: 10월 13일 기록 — site/next/data/theme-home.json(싹 37 · 꽃 7 · 시듦 4 · 잠잠 29 · 싹 맨 앞 셋) · theme-bloom.json(꽃 핀 업종 안의 싹 회사 31곳 · 업종 여섯 모두 꽃 자리)</p><p>카톡 보내기 · 선물 받기: site/next/kk-all.js · site/next/app.js 와 같은 이름</p><p>앞 판: docs/design/dori-new-2026-10-25 의 combo · combo2 · clock · stone</p></details>
</main></body></html>"""
open(os.path.join(D, 'plain.html'), 'w').write(page)
print('ok', len(page))
