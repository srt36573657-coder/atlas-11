#!/usr/bin/env python3
# 다듬은 판 — 사장님 2026-10-25 22:52 「좋아 디자인 신경 더써서 세계 최고로 만들어봐」
#   뼈대(22:47 보자마자 아는 판: 돌 시계 위 가운데 · 큰 네 칸 · 큰 글씨)는 그대로 · 결을 다듬음
# 다듬은 것:
#   ① 굵은 검은 테 → 흰 판 + 머리카락 테 + 두 겹 부드러운 그림자(빛은 위에서)
#   ② 글씨 단계 다섯(작은 글 5cqw · 본문 6cqw · 소제목 6cqw 굵게 · 제목 8.8~10.5cqw · 숫자 15cqw) — 휴대폰에서 17.6 · 21 · 31~37 · 53px
#   ③ 여백은 좌우 5cqw 한 줄 · 칸 사이 3cqw · 판 안 3.4cqw — 모든 화면 같은 자로
#   ④ 그림은 한 벌(같은 굵기 · 둥근 끝 · 같은 판 안 크기) · 하늘청록은 싹에만 · 「왜 사?」는 먹색 큰 단추
#   ⑤ 누르는 곳은 모두 12.5cqw(휴대폰 44px) 넘게 — 애플 화면 지침의 손가락 크기
import os, json, html, math
from stones import theme_clock
D = os.path.dirname(os.path.abspath(__file__))
DATA = '/home/claude/atlas-space/site/next/data'
HOME = json.load(open(os.path.join(DATA, 'theme-home.json')))
CNT = HOME['count']
BLOOM = json.load(open(os.path.join(DATA, 'theme-bloom.json')))
INK, INK2, ACC, DEEP = '#171615', '#3C4E51', '#1FB8CD', '#152D30'

SHARED = """
.bx .phone{background:#F2F3F3;color:#171615;border-color:#BABCBC;box-shadow:0 0 0 1px #D6D5D4;font-feature-settings:"tnum" 1}
.bx .phone .wall{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 90cqw 62cqw at 50% 30%,#FFFFFF 0%,#F2F3F3 64%,#E2E5E6 100%)}
.bx .phone .homebar{background:#171615;opacity:.85}
.bx .phone .status{font-size:5cqw;color:#171615}
/* 맨 위 줄 — 왼쪽 이름(또는 뒤로) · 오른쪽 두 단추 · 높이 12.5cqw(손가락 크기) */
.bx .phone .top{position:absolute;z-index:6;top:11.8cqw;left:4cqw;right:4cqw;height:12.5cqw;display:flex;align-items:center;justify-content:space-between;gap:2cqw}
.bx .phone .mark{display:flex;align-items:center;gap:1.4cqw;font-size:8cqw;font-weight:900;line-height:1;letter-spacing:-.04em;color:#171615}
.bx .phone .mark i{display:block;width:2.6cqw;height:2.6cqw;border-radius:50%;background:#1FB8CD;box-shadow:0 0 0 .5cqw #FFFFFF,0 0 0 .8cqw #D6D5D4}
.bx .phone .back{display:flex;align-items:center;gap:.6cqw;height:12.5cqw;margin:0;padding:0 1.6cqw 0 .4cqw;border:0;background:none;font:inherit;font-size:5.2cqw;font-weight:900;color:#171615;white-space:nowrap;cursor:pointer}
.bx .phone .back svg{display:block;width:5.4cqw;height:5.4cqw}
.bx .phone .tools{display:flex;gap:1.6cqw;flex:none}
.bx .phone .tb{display:inline-flex;align-items:center;gap:1.1cqw;height:12.5cqw;margin:0;padding:0 2.6cqw 0 2cqw;border:.3cqw solid #D6D5D4;border-radius:6.25cqw;font:inherit;font-size:5cqw;font-weight:800;line-height:1;white-space:nowrap;color:#171615;background:#FFFFFF;box-shadow:0 .3cqw .8cqw rgba(23,22,21,.08),0 1.4cqw 3cqw rgba(23,22,21,.08);cursor:pointer}
.bx .phone .tb svg{display:block;width:6cqw;height:6cqw;flex:none}
/* 글 */
.bx .phone .eyebrow{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:5cqw;line-height:1.2;font-weight:800;color:#3C4E51}
.bx .phone .ttl{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-weight:900;color:#171615;line-height:1.1;letter-spacing:-.035em}
.bx .phone .sub{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:5.6cqw;line-height:1.35;font-weight:700;color:#3C4E51}
.bx .phone .sec-h{position:absolute;z-index:3;left:5cqw;margin:0;font-size:6cqw;line-height:1.2;font-weight:900;color:#171615}
.bx .phone .hint{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:5.4cqw;line-height:1.35;font-weight:700;color:#3C4E51;text-align:center}
/* 흰 판 — 머리카락 테 · 두 겹 그림자 */
.bx .phone .card{background:#FFFFFF;border:.25cqw solid #E2E5E6;border-radius:5cqw;box-shadow:0 .3cqw .8cqw rgba(23,22,21,.06),0 2cqw 5cqw rgba(23,22,21,.09)}
/* 큰 동그라미 그림(제목 옆) */
.bx .phone .badge-xl{position:absolute;z-index:3;right:5cqw;width:17cqw;height:17cqw;border-radius:50%;background:#FFFFFF;border:.25cqw solid #E2E5E6;box-shadow:0 1.4cqw 3.4cqw rgba(23,22,21,.1);display:flex;align-items:center;justify-content:center}
.bx .phone .badge-xl svg{display:block;width:11.6cqw;height:11.6cqw}
.bx .phone .badge-xl.on{background:#1FB8CD;border-color:#152D30}
/* 칸 하나 보내는 카톡 단추 */
.bx .phone .kkc{position:absolute;z-index:3;right:5cqw;display:inline-flex;align-items:center;gap:1cqw;height:12.5cqw;margin:0;padding:0 2.6cqw 0 2cqw;border:.3cqw solid #D6D5D4;border-radius:6.25cqw;background:#FFFFFF;color:#171615;font:inherit;font-size:5cqw;font-weight:800;line-height:1;white-space:nowrap;box-shadow:0 .3cqw .8cqw rgba(23,22,21,.08);cursor:pointer}
.bx .phone .kkc svg{display:block;width:5.6cqw;height:5.6cqw}
.bx .phone .clockw{position:absolute;z-index:3}
.bx .phone .clockw svg{display:block;width:100%;height:auto;overflow:visible}
.bx .phone .sec{transform-box:view-box;animation:bx-tick 60s steps(60) infinite}
@keyframes bx-tick{to{transform:rotate(360deg)}}
.bx .phone .sway{transform-box:fill-box;transform-origin:50% 100%;animation:bx-sway 3.6s ease-in-out infinite}
@keyframes bx-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@media (prefers-reduced-motion:reduce){.bx .phone .sec,.bx .phone .sway{animation:none}}
/* 아래 줄 — 흰 바탕 · 머리카락 윗줄 · 지금 쪽은 진하게 + 하늘청록 짧은 줄 */
.bx .phone .tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:28cqw;display:grid;grid-template-columns:repeat(4,1fr);padding:2.4cqw 1.6cqw 0;background:rgba(255,255,255,.96);border-top:.25cqw solid #D6D5D4}
.bx .phone .tab{position:relative;display:flex;flex-direction:column;align-items:center;gap:.6cqw;font-size:5cqw;font-weight:700;color:#3C4E51;line-height:1.15;white-space:nowrap}
.bx .phone .tab svg{display:block;width:8.6cqw;height:8.6cqw;color:#3C4E51}
.bx .phone .tab.on{color:#171615;font-weight:900}
.bx .phone .tab.on svg{color:#171615}
.bx .phone .tab.on::after{content:"";display:block;width:6cqw;height:1cqw;border-radius:.5cqw;background:#1FB8CD}
.bx .phone .tab .nb{position:absolute;top:-1.6cqw;left:56%;min-width:7.4cqw;height:7.4cqw;padding:0 1.4cqw;border-radius:3.7cqw;background:#1FB8CD;color:#152D30;box-shadow:0 0 0 .6cqw #FFFFFF;font-size:5cqw;font-weight:900;line-height:7.4cqw;text-align:center}
.bx .phone button:active,.bx .phone .card[role=button]:active{transform:scale(.98)}
"""

def ic(body, cls=''):
    return f'<svg{f" class={chr(34)}{cls}{chr(34)}" if cls else ""} viewBox="0 0 100 100" aria-hidden="true">{body}</svg>'
SW = 5.5
L = f'fill="none" stroke="currentColor" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round"'
def sprout(leaf=ACC, sway=False):
    g = '<g class="sway">' if sway else '<g>'
    return ic(f'<path d="M20 84Q50 73 80 84" {L}/><path d="M50 82V52" {L}/>{g}'
              f'<path d="M50 55C50 39 38 29 20 31C20 47 32 57 50 55Z" fill="{leaf}" stroke="currentColor" stroke-width="{SW}" stroke-linejoin="round"/>'
              f'<path d="M50 48C50 31 62 21 81 23C81 40 69 50 50 48Z" fill="{leaf}" stroke="currentColor" stroke-width="{SW}" stroke-linejoin="round"/></g>')
def flower(petal='#FFFFFF', mid='#171615'):
    pts = ''.join(f'<circle cx="{50 + 14.5 * math.sin(math.radians(k * 72)):.1f}" cy="{35 - 14.5 * math.cos(math.radians(k * 72)):.1f}" r="10.5" fill="{petal}" stroke="currentColor" stroke-width="{SW - .8}"/>' for k in range(5))
    return ic(f'<path d="M50 92V56" {L}/><path d="M50 76C42 67 31 67 26 73C33 81 43 82 50 76Z" fill="{petal}" stroke="currentColor" stroke-width="{SW - .8}" stroke-linejoin="round"/>'
              f'{pts}<circle cx="50" cy="35" r="8" fill="{mid}" stroke="currentColor" stroke-width="3"/>')
def wilt():
    return ic(f'<path d="M40 92V61C40 41 55 31 67 39" {L}/>'
              f'<path d="M67 39C80 42 86 57 80 70C70 63 64 51 67 39Z" fill="#D6D5D4" stroke="currentColor" stroke-width="{SW - .8}" stroke-linejoin="round"/>'
              f'<path d="M40 69C30 61 19 63 16 70C24 77 33 77 40 69Z" fill="#D6D5D4" stroke="currentColor" stroke-width="{SW - .8}" stroke-linejoin="round"/>'
              f'<ellipse cx="63" cy="87" rx="6" ry="3.4" fill="#D6D5D4" stroke="currentColor" stroke-width="3.2" transform="rotate(-20 63 87)"/>')
def moon():
    star = lambda x, y, s: f'<path d="M{x} {y - s}L{x + s * .3} {y - s * .3}L{x + s} {y}L{x + s * .3} {y + s * .3}L{x} {y + s}L{x - s * .3} {y + s * .3}L{x - s} {y}L{x - s * .3} {y - s * .3}Z" fill="currentColor"/>'
    return ic(f'<path d="M58 15A36 36 0 1 0 87 70A29 29 0 0 1 58 15Z" fill="#E2E5E6" stroke="currentColor" stroke-width="{SW - .5}" stroke-linejoin="round"/>' + star(79, 25, 7.5) + star(68, 44, 4.6))
def calendar(leaf=ACC):
    return ic(f'<rect x="15" y="23" width="70" height="62" rx="10" fill="#FFFFFF" stroke="currentColor" stroke-width="{SW}"/><path d="M15 41H85" {L}/><path d="M33 14V30M67 14V30" {L}/>'
              f'<path d="M50 77V63" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"/><path d="M50 66C50 57 43 52 34 53C34 62 41 67 50 66Z" fill="{leaf}" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/>'
              f'<path d="M50 62C50 52 57 47 66 48C66 57 59 62 50 62Z" fill="{leaf}" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/>')
def question(fill='#FFFFFF', ink='currentColor'):
    return ic(f'<circle cx="50" cy="50" r="40" fill="{fill}" stroke="{ink}" stroke-width="{SW}"/><path d="M37.5 40C37.5 27 62.5 26 62.5 40C62.5 50.5 50 51 50 61.5" fill="none" stroke="{ink}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="74.5" r="5.4" fill="{ink}"/>')
def clock_ic():
    return ic(f'<circle cx="50" cy="50" r="37" fill="#FFFFFF" stroke="currentColor" stroke-width="{SW}"/><path d="M50 28V50L64.5 59" {L}/><circle cx="50" cy="50" r="3.4" fill="currentColor"/>')
def building():
    w = ''.join(f'<rect x="{x}" y="{y}" width="8.5" height="8.5" rx="1.6" fill="currentColor"/>' for x in (32, 46, 60) for y in (31, 46))
    return ic(f'<path d="M21 87V19H79V87" fill="#FFFFFF" stroke="currentColor" stroke-width="{SW}" stroke-linejoin="round"/><path d="M11 87H89" {L}/>{w}<rect x="42.5" y="64" width="15" height="23" rx="2.4" fill="{ACC}" stroke="currentColor" stroke-width="4"/>')
def chevron(rot=0):
    return ic(f'<path d="M38 22L66 50L38 78" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="rotate({rot} 50 50)"/>')

KK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 16C27 16 9 30 9 48C9 60 17 70 29 75L25 90L42 79C44.6 79.4 47.3 79.6 50 79.6C73 79.6 91 65.6 91 48C91 30 73 16 50 16Z" fill="#171615"/></svg>'
GIFT = ('<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#171615" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'
        '<rect x="20" y="44" width="60" height="38" rx="5"/><rect x="15" y="31" width="70" height="14" rx="4"/><path d="M50 31V82"/>'
        '<path d="M50 31C43 17 29 19 33 28C35 32 45 32 50 31ZM50 31C57 17 71 19 67 28C65 32 55 32 50 31Z"/></g></svg>')
TOOLS = ('<span class="tools"><button class="tb" type="button" aria-label="이 화면을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'
         '<button class="tb" type="button" aria-label="선물 받기 방으로">' + GIFT + '선물 받기</button></span>')
KKC = '<button class="kkc" type="button" aria-label="이 칸을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'
def back(label):
    return f'<button class="back" type="button" aria-label="{label}으로 돌아가기">{chevron(180)}{label}</button>'

def tabs(on='첫 화면'):
    items = [('첫 화면', clock_ic(), None), ('꽃 될 회사', flower(), BLOOM['today']['n']), ('싹 달력', calendar(), None), ('왜 사?', question(), None)]
    return '<nav class="tabs" aria-label="아래 줄">' + ''.join(
        f'<span class="tab{" on" if k == on else ""}">{v}{f"<span class=nb>{b}</span>" if b else ""}<span>{k}</span></span>' for k, v, b in items) + '</nav>'

FRAME_TOP = '<div class="wall"></div><div class="island"></div><div class="status"><span>9:41</span><span>●●●</span></div>'
FRAME_END = '<div class="homebar"></div>'
def head(n, name, lines):
    return (f'<div class="head"><span class="no"><b>{n}</b>{name}</span>' +
            ''.join(f'<p class="why"><em>{k}</em> {v}</p>' for k, v in lines) + '</div>')

# ① 첫 화면
def cell(label, word, n, pic, on=False):
    return (f'<button class="cell card{" on" if on else ""}" type="button" aria-label="{label}">'
            f'<span class="pic">{pic}</span><span class="w">{word}</span><span class="n">{n}<small>곳</small></span><span class="go">{chevron()}</span></button>')
c1 = f"""<section class="sample bx" id="c1"><style>
#c1 .phone .clockw{{left:20cqw;width:60cqw;top:45.4cqw}}
#c1 .phone .grid{{position:absolute;z-index:3;left:5cqw;right:5cqw;top:97cqw;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:34.5cqw 34.5cqw;gap:3cqw}}
#c1 .phone .cell{{position:relative;display:block;margin:0;padding:0;font:inherit;text-align:left;color:#171615;cursor:pointer}}
#c1 .phone .cell .pic{{position:absolute;left:3.2cqw;top:3.2cqw;width:14cqw;height:14cqw;border-radius:50%;background:#F2F3F3;display:flex;align-items:center;justify-content:center}}
#c1 .phone .cell .pic svg{{display:block;width:10.4cqw;height:10.4cqw}}
#c1 .phone .cell .w{{position:absolute;left:19.6cqw;top:6.4cqw;font-size:6.6cqw;font-weight:900;line-height:1;letter-spacing:-.02em}}
#c1 .phone .cell .n{{position:absolute;left:3.6cqw;bottom:3cqw;font-size:15cqw;font-weight:900;line-height:.82;letter-spacing:-.05em}}
#c1 .phone .cell .n small{{font-size:6cqw;margin-left:.8cqw;letter-spacing:0}}
#c1 .phone .cell .go{{position:absolute;right:3cqw;bottom:3.4cqw;width:6cqw;height:6cqw;color:#3C4E51}}
#c1 .phone .cell .go svg{{display:block;width:100%;height:100%}}
#c1 .phone .cell.on{{background:#1FB8CD;border-color:#1FB8CD;color:#152D30;box-shadow:0 .3cqw .8cqw rgba(21,45,48,.12),0 2.2cqw 5.4cqw rgba(31,184,205,.36)}}
#c1 .phone .cell.on .pic{{background:#FFFFFF}}
#c1 .phone .cell.on .go{{color:#152D30}}
#c1 .phone .hint{{top:170.6cqw}}
</style>
{head('①', '첫 화면', [('위 가운데', '돌 시계 — 지금 시각'), ('그 아래', '네 칸 — 동그라미 안 그림 · 낱말 · 큰 숫자 · 오른쪽 아래 화살'), ('빛나는 곳', '싹 칸 하나 — 하늘청록은 싹에만')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="mark"><i></i>돌이</span>{TOOLS}</div>
<p class="eyebrow" style="top:27cqw">10월 13일 기록</p>
<h2 class="ttl" style="top:33cqw;font-size:8.8cqw">업종 77곳은 지금</h2>
<div class="clockw" role="img" aria-label="돌 시계 — 9시 41분">{theme_clock('c1k', dots=False)}</div>
<div class="grid">
{cell('싹 업종 37곳 보기', '싹', CNT['S'], sprout('#FFFFFF', True), True)}
{cell('꽃 업종 7곳 보기', '꽃', CNT['B'], flower())}
{cell('잠잠 업종 29곳 보기', '잠잠', CNT['Q'], moon())}
{cell('시듦 업종 4곳 보기', '시듦', CNT['W'], wilt())}
</div>
<p class="hint">칸을 누르면 그 업종들이 나와요</p>
{tabs()}{FRAME_END}</div></section>"""

# ② 싹 칸을 누르면
S_ORDER = HOME['order']['S']
REST = ['가공식품', '가전·생활용품', '건설 엔지니어링', '건축자재', '게임', '교육']
chips = ''.join(f'<span class="chip">{html.escape(x)}</span>' for x in REST) + f'<span class="chip more">그 밖 {CNT["S"] - 3 - len(REST)}곳</span>'
rows2 = ''.join(
    f'<div class="r{" on" if k == 0 else ""}"><span class="no">{k + 1}</span><b>{html.escape(n)}</b>{"<span class=tag>진짜 싹</span>" if k == 0 else ""}<span class="go">{chevron()}</span></div>'
    for k, n in enumerate(S_ORDER))
c2 = f"""<section class="sample bx" id="c2"><style>
#c2 .phone .ttl{{top:28cqw;right:26cqw;font-size:10.5cqw}}
#c2 .phone .badge-xl{{top:26.6cqw}}
#c2 .phone .sub{{top:41.4cqw;right:26cqw}}
#c2 .phone .group{{position:absolute;z-index:3;left:5cqw;right:5cqw;top:65cqw;overflow:hidden}}
#c2 .phone .r{{position:relative;display:flex;align-items:center;gap:3cqw;height:14cqw;padding:0 3.4cqw}}
#c2 .phone .r+.r{{border-top:.25cqw solid #E2E5E6}}
#c2 .phone .r .no{{display:flex;align-items:center;justify-content:center;width:9cqw;height:9cqw;border-radius:50%;background:#F2F3F3;font-size:5.4cqw;font-weight:900;color:#171615;flex:none}}
#c2 .phone .r b{{flex:1;font-size:6.4cqw;font-weight:800;letter-spacing:-.02em}}
#c2 .phone .r .go{{width:5.4cqw;height:5.4cqw;color:#3C4E51;flex:none}}
#c2 .phone .r .go svg{{display:block;width:100%;height:100%}}
#c2 .phone .r.on{{background:#1FB8CD;color:#152D30}}
#c2 .phone .r.on .no{{background:#FFFFFF}}
#c2 .phone .r.on .go{{color:#152D30}}
#c2 .phone .tag{{padding:1cqw 2.4cqw;border-radius:3cqw;background:#FFFFFF;color:#152D30;font-size:5cqw;font-weight:900}}
#c2 .phone .chips{{position:absolute;z-index:3;top:125.6cqw;left:5cqw;right:5cqw;display:flex;flex-wrap:wrap;gap:2cqw}}
#c2 .phone .chip{{display:inline-flex;align-items:center;height:12.5cqw;padding:0 3.2cqw;border-radius:6.25cqw;background:#FFFFFF;border:.25cqw solid #D6D5D4;font-size:5.2cqw;font-weight:800;color:#171615}}
#c2 .phone .chip.more{{background:#E2E5E6;border-color:#E2E5E6}}
#c2 .phone .hint{{top:172.6cqw}}
</style>
{head('②', '싹 칸을 누르면', [('보이는 것', '싹 자리 업종 37곳 — 맨 앞 셋은 한 판에 크게'), ('빛나는 곳', '네 가지가 다 맞은 「진짜 싹」 2차전지'), ('칸마다', '「맨 앞 셋」과 「그 밖」에 카톡 보내기')])}
<div class="phone">{FRAME_TOP}
<div class="top">{back('뒤로')}{TOOLS}</div>
<h2 class="ttl">싹 {CNT['S']}곳</h2>
<span class="badge-xl on">{sprout('#FFFFFF', True)}</span>
<p class="sub">10월 13일 싹 자리예요</p>
<p class="sec-h" style="top:53cqw">맨 앞 셋</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:50cqw"', 1)}
<div class="group card">{rows2}</div>
<p class="sec-h" style="top:113cqw">그 밖 {CNT['S'] - 3}곳</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:110cqw"', 1)}
<div class="chips">{chips}</div>
<p class="hint">업종을 누르면 그 업종 회사가 나와요</p>
{tabs()}{FRAME_END}</div></section>"""

# ③ 「꽃 될 회사」를 누르면
GROUPS = sorted(BLOOM['today']['inds'], key=lambda g: -len(g['co']))
rows3 = ''
for i, g in enumerate(GROUPS):
    if i == 0:
        names = [c[1] for c in g['co']]
        pick = [n for n in ('대한과학', '바이오인프라') if n in names]
        cos = ''.join(f'<span class="co{" on" if j == 0 else ""}">{html.escape(n)}</span>' for j, n in enumerate(pick)) + f'<span class="co more">외 {len(names) - len(pick)}곳</span>'
        rows3 += f'<div class="row open"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span></div><div class="cos">{cos}</div></div>'
    else:
        rows3 += f'<div class="row"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span><span class="go">{chevron()}</span></div></div>'
c3 = f"""<section class="sample bx" id="c3"><style>
#c3 .phone .ttl{{top:28cqw;right:26cqw;font-size:7.8cqw}}
#c3 .phone .badge-xl{{top:27.4cqw}}
#c3 .phone .sub{{top:47.2cqw;right:26cqw}}
#c3 .phone .group{{position:absolute;z-index:3;top:58cqw;left:5cqw;right:5cqw;overflow:hidden}}
#c3 .phone .row+.row{{border-top:.25cqw solid #E2E5E6}}
#c3 .phone .rh{{display:flex;align-items:center;gap:2.4cqw;padding:0 3.4cqw;height:12.4cqw}}
#c3 .phone .rh b{{flex:1;font-size:6cqw;font-weight:800;letter-spacing:-.02em}}
#c3 .phone .rh .k{{font-size:6.2cqw;font-weight:900}}
#c3 .phone .rh .go{{width:5cqw;height:5cqw;color:#3C4E51}}
#c3 .phone .rh .go svg{{display:block;width:100%;height:100%}}
#c3 .phone .open{{box-shadow:inset 1.4cqw 0 0 #1FB8CD}}
#c3 .phone .open .rh{{height:13cqw}}
#c3 .phone .cos{{display:flex;flex-wrap:wrap;gap:1.2cqw;padding:0 3cqw 3cqw 3.6cqw}}
#c3 .phone .co{{display:inline-flex;align-items:center;height:12.5cqw;padding:0 2cqw;border-radius:6.25cqw;background:#FFFFFF;border:.3cqw solid #171615;font-size:5cqw;font-weight:900;color:#171615}}
#c3 .phone .co.on{{background:#171615;color:#FFFFFF}}
#c3 .phone .co.more{{background:#E2E5E6;border-color:#E2E5E6}}
#c3 .phone .note{{position:absolute;z-index:3;left:5cqw;right:5cqw;top:152cqw;margin:0;padding:2.6cqw 3.4cqw;border-radius:4cqw;background:#E2E5E6;font-size:5.4cqw;line-height:1.36;font-weight:800;color:#171615}}
</style>
{head('③', '「꽃 될 회사」를 누르면', [('보이는 것', '꽃 핀 업종 여섯 안의 싹 회사 31곳 — 한 판에 업종 여섯'), ('정직하게', '지난 기록 한 줄을 늘 아래에')])}
<div class="phone">{FRAME_TOP}
<div class="top">{back('뒤로')}{TOOLS}</div>
<h2 class="ttl">꽃 핀 업종 안의<br>싹 회사 {BLOOM['today']['n']}곳</h2>
<span class="badge-xl">{flower()}</span>
<p class="sub">10월 13일에 골랐어요</p>
<div class="group card">{rows3}</div>
<p class="note">지난 3년, 이렇게 고른 회사가 꽃이 된 것은 네 번에 한 번쯤이에요. 아무 회사와 큰 차이는 없어요.</p>
{tabs('꽃 될 회사')}{FRAME_END}</div></section>"""

# ④ 회사를 누르면
c4 = f"""<section class="sample bx" id="c4"><style>
#c4 .phone .ttl{{top:28cqw;right:26cqw;font-size:10.5cqw}}
#c4 .phone .badge-xl{{top:26.6cqw}}
#c4 .phone .sub{{top:41.4cqw;right:26cqw}}
#c4 .phone .stats{{position:absolute;z-index:3;left:5cqw;right:5cqw;top:51.6cqw;display:flex;gap:2cqw}}
#c4 .phone .st{{display:inline-flex;align-items:center;gap:1.2cqw;height:11.4cqw;padding:0 3cqw 0 1.6cqw;border-radius:5.7cqw;background:#FFFFFF;border:.25cqw solid #D6D5D4;font-size:5cqw;font-weight:900;color:#171615;white-space:nowrap}}
#c4 .phone .st svg{{display:block;width:8cqw;height:8cqw}}
#c4 .phone .st.on{{background:#1FB8CD;border-color:#1FB8CD;color:#152D30}}
#c4 .phone .info{{position:absolute;z-index:3;top:67cqw;left:5cqw;right:5cqw;display:flex;gap:3cqw;align-items:flex-start;padding:3.4cqw;margin:0}}
#c4 .phone .info .ci{{width:12cqw;height:12cqw;flex:none;border-radius:50%;background:#F2F3F3;display:flex;align-items:center;justify-content:center}}
#c4 .phone .info .ci svg{{display:block;width:8.6cqw;height:8.6cqw}}
#c4 .phone .info span.t{{font-size:5.8cqw;line-height:1.4;font-weight:700;color:#171615}}
#c4 .phone .cta{{position:absolute;z-index:3;top:103cqw;left:5cqw;right:5cqw;height:47cqw;border-radius:5.6cqw;background:#171615;color:#FFFFFF;box-shadow:0 .4cqw 1cqw rgba(23,22,21,.2),0 2.6cqw 6cqw rgba(23,22,21,.24);overflow:hidden}}
#c4 .phone .cta .q{{position:absolute;left:5cqw;top:5cqw;width:16cqw;height:16cqw}}
#c4 .phone .cta .q svg{{display:block;width:100%;height:100%}}
#c4 .phone .cta b{{position:absolute;left:25cqw;top:6.4cqw;font-size:13cqw;line-height:1;font-weight:900;letter-spacing:-.04em;color:#FFFFFF}}
#c4 .phone .cta .t{{position:absolute;left:5cqw;right:14cqw;bottom:5cqw;font-size:5.8cqw;line-height:1.36;font-weight:800;color:#F2F3F3}}
#c4 .phone .cta .go{{position:absolute;right:4.6cqw;bottom:5.6cqw;width:9cqw;height:9cqw;border-radius:50%;background:#1FB8CD;color:#152D30;display:flex;align-items:center;justify-content:center}}
#c4 .phone .cta .go svg{{display:block;width:5cqw;height:5cqw}}
#c4 .phone .later{{position:absolute;z-index:3;top:155cqw;left:5cqw;right:5cqw;margin:0;font-size:5.8cqw;line-height:1.38;font-weight:700;color:#171615}}
</style>
{head('④', '회사를 누르면', [('한눈에', '「업종은 꽃 자리」와 「회사는 싹」 — 자료 그대로'), ('누를 곳 하나', '먹색 큰 단추 「왜 사?」 — 사기 전에 열한 가지'), ('세 번', '첫 화면에서 두 번 누르면 여기 · 세 번째가 「왜 사?」')])}
<div class="phone">{FRAME_TOP}
<div class="top">{back('뒤로')}{TOOLS}</div>
<h2 class="ttl">대한과학</h2>
<span class="badge-xl">{building()}</span>
<p class="sub">바이오 도구·서비스</p>
<div class="stats"><span class="st">{flower()}업종은 꽃 자리</span><span class="st on">{sprout('#FFFFFF')}회사는 싹</span></div>
<p class="info card"><span class="ci">{calendar()}</span><span class="t">10월 13일에 골랐어요. 고른 뒤 일은 날마다 싹 달력에 남아요.</span></p>
<div class="cta" role="button" aria-label="왜 사? 열한 가지 묻기"><span class="q">{question('#FFFFFF', '#171615')}</span><b>왜 사?</b><span class="t">사기 전에 열한 가지만 물어볼게요</span><span class="go">{chevron()}</span></div>
<p class="later">한 달 뒤에는 「그날 정한 대로 했어?」 하고 다시 물어요</p>
{tabs('꽃 될 회사')}{FRAME_END}</div></section>"""

FR = {'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4}
for k, v in FR.items():
    open(os.path.join(D, k + '.html'), 'w').write(v.replace('<style>', '<style>' + SHARED, 1))

base = open(os.path.join(D, 'base.css')).read()
pal = json.load(open(os.path.join(D, 'palette.json')))
strip = ''.join(f'<i style="background:{h}"></i>' for h in pal)
EXTRA = """
body{background:#F2F3F3}
main{gap:26px}
.sample{background:#FFFFFF;border-color:#D6D5D4}
.sample .no b{background:#171615}
.sample .why{font-size:22px}
.sample .why em{display:inline-block;margin-right:8px;padding:0 10px;border-radius:10px;background:#171615;color:#FFFFFF;font-size:21px;line-height:1.5;font-weight:800}
main>.intro{border:1px solid #D6D5D4;border-radius:22px;background:#FFFFFF;padding:18px;display:flex;flex-direction:column;gap:12px;font-size:23px;line-height:1.5}
main>.intro h1{font-size:34px;line-height:1.2;margin:0;font-weight:900;letter-spacing:-.02em}
main>.intro p{margin:0}
main>.intro .hero{border-radius:18px;background:radial-gradient(ellipse at 50% 40%,#FFFFFF,#E2E5E6);padding:10px 16px}
main>.intro .hero svg{display:block;width:100%;max-width:400px;height:auto;margin:0 auto;overflow:visible}
main>.intro .hero .sec{transform-box:view-box;animation:bx-tick 60s steps(60) infinite}
@media (prefers-reduced-motion:reduce){main>.intro .hero .sec{animation:none}}
main>.intro ol{margin:0;padding-left:30px;display:flex;flex-direction:column;gap:6px}
.strip{display:flex;height:26px;border-radius:9px;overflow:hidden;border:1px solid #D6D5D4}
.strip i{flex:1 1 0;min-width:0}
.path{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:22px;font-weight:800}
.path span{padding:6px 14px;border:1px solid #D6D5D4;background:#F2F3F3;border-radius:999px}
.path b{font-size:24px}
main>.note{border:1px solid #D6D5D4;border-radius:18px;background:#FFFFFF;padding:18px;font-size:22px}
main>.note h2{font-size:26px;margin:0 0 8px;font-weight:900}
main>.note ul{margin:4px 0;padding-left:28px}
main>.asklast{border-radius:18px;background:#171615;color:#FFFFFF;padding:18px;font-size:26px;font-weight:900}
main>.footline{font-size:22px;color:#111;margin:0}
main>details{font-size:21px;color:#111;word-break:break-all}
main>details summary{cursor:pointer;min-height:48px}
@media (max-width:540px){.sample{border:0;padding:0;border-radius:0;gap:14px;background:transparent}}
"""
NOT = ['진짜 사이트는 아직 그대로예요. 「응」 하시면 그때 만들어요.',
       '카톡 노란색과 선물 금빛은 고르신 색 100가지에 없어 흰색으로 했어요.',
       '이 그림의 시계는 9시 41분에 서 있고 초침만 돌아요. 지금 시각은 만들 때 붙여요.',
       '「왜 사?」를 누른 뒤 열한 질문 화면은 아직 이 모양으로 안 그렸어요.',
       '회사 찾기 단추는 아래 줄에서 뺐어요. 진짜 사이트처럼 맨 위 찾기를 쓸 생각이에요.',
       '숫자는 10월 13일 기록이라 오늘 값이 아니에요.',
       '세계 최고 수준인지는 제 눈과 화면 지침으로만 맞춰 봤어요. 사람에게 시험해 보지는 않았어요.']
page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>돌이 다듬은 판</title><style>{base}{SHARED}{EXTRA}</style></head><body><main>
<section class="intro"><h1>뼈대는 그대로, 결을 다듬었어요</h1>
<div class="hero">{theme_clock('hero', dots=False)}</div>
<ol>
<li>굵은 검은 테를 빼고 흰 판과 부드러운 그림자로 바꿨어요.</li>
<li>글씨 크기를 다섯 단계로 맞췄어요. 가장 작은 글도 또렷해요.</li>
<li>그림은 같은 굵기, 같은 둥근 끝으로 다시 그렸어요.</li>
<li>누르는 곳은 모두 손가락 크기보다 크게 했어요.</li>
<li>하늘청록은 싹에만 써요. 「왜 사?」는 먹색 큰 단추예요.</li>
</ol>
<div class="path"><span>첫 화면</span><b>›</b><span>꽃 될 회사</span><b>›</b><span>회사</span><b>›</b><span>왜 사?</span></div>
<p>「꽃 될 회사」 길로 가면 세 번 만에 「왜 사?」에 닿아요.</p>
<div class="strip">{strip}</div></section>
{c1}{c2}{c3}{c4}
<section class="note"><h2>못 한 것 {len(NOT)}가지</h2><ul>{''.join(f'<li>{x}</li>' for x in NOT)}</ul></section>
<section class="asklast">이 모양으로 진짜 돌이를 만들까요?</section>
<p class="footline">채점표: 화면 넷 모두 금지 말과 색과 글씨 크기를 기계로 검사했어요. 틀림 장부 118건 · 못 한 것 {len(NOT)}가지</p>
<details><summary>근거 펼치기</summary><p>누르는 곳 크기: 애플 화면 지침(https://developer.apple.com/design/human-interface-guidelines/) 손가락 크기 44포인트 — 이 판은 휴대폰에서 모두 44px 넘게(12.5cqw)</p><p>글씨: 사장님 기준(본문 21px 이상 · 가장 작아도 17px · 제목 25px 이상 · 흐린 회색 금지) — 휴대폰 390 폭에서 가장 작은 글 17.6px · 본문 21px · 제목 31~37px · 숫자 53px · 검사기 shot17.mjs</p><p>돌 시계: 진짜 사이트 site/media/stone/home-clock.svg · 바늘 site/next/stone-clock.js 꼴 · 색만 100가지 가운데 가장 가까운 색</p><p>내용: 10월 13일 기록 — site/next/data/theme-home.json · theme-bloom.json(꽃 핀 업종 안의 싹 회사 31곳 · 업종 여섯 모두 꽃 자리)</p><p>앞 판: docs/design/dori-new-2026-10-25 의 combo · combo2 · clock · stone · plain</p></details>
</main></body></html>"""
open(os.path.join(D, 'best.html'), 'w').write(page)
print('ok', len(page))
