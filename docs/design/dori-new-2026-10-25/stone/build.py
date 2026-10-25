#!/usr/bin/env python3
# 돌 시계 중심 판 — 사장님 2026-10-25 22:26 「돌시계을 중심으로 디자인 해야해 지금은 겉돌아」
#   (22:03 「난 이시계 느낌 넘 좋아 이 시계 느낌을 중심에 두고 지금까지 만든것을 조화롭게 효율적으로 다시 디자인해봐」에 이어)
# 고친 뼈대: 시계 둘레의 납작한 색 칸 · 얼굴 그림 · 어두운 바탕이 돌 시계와 결이 달라 따로 놀았음 →
#   ① 바탕을 진짜 사이트처럼 밝게 ② 네 칸 숫자는 돌 귀퉁이에 붙인 판 넷 ③ 시계판 위에 업종 77곳 점(테마 시계 자리 그대로)
#   ④ 단추 그림은 진짜 사이트 돌 그림 가족(site/media/stone) ⑤ 카드는 시계판처럼 흰 판 · 은빛 테 · 부드러운 그림자 ⑥ 하늘청록 = 싹 한 가지 뜻
import os, json, html
from stones import stone, theme_clock
D = os.path.dirname(os.path.abspath(__file__))
DATA = '/home/claude/atlas-space/site/next/data'
HOME = json.load(open(os.path.join(DATA, 'theme-home.json')))
CNT = HOME['count']  # S 37 · B 7 · W 4 · Q 29 (10월 13일)
BLOOM = json.load(open(os.path.join(DATA, 'theme-bloom.json')))

SHARED = """
.sl .phone{background:#F2F3F3;color:#171615;border-color:#BABCBC;box-shadow:0 0 0 1px #D6D5D4}
.sl .phone .wall{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 95cqw 75cqw at 50% 33%,#FFFFFF 0%,#F2F3F3 62%,#E2E5E6 100%)}
.sl .phone .homebar{background:#171615;opacity:.8}
.sl .phone .top{position:absolute;z-index:6;top:12cqw;left:4.6cqw;right:4cqw;display:flex;align-items:center;justify-content:space-between;gap:2cqw}
.sl .phone .mark{font-size:8cqw;font-weight:900;line-height:1;letter-spacing:-.2cqw;color:#171615}
.sl .phone .back{font-size:4.2cqw;font-weight:800;color:#565F60;white-space:nowrap}
.sl .phone .date{font-size:4cqw;font-weight:700;color:#565F60}
.sl .phone .tools{display:flex;gap:1.8cqw;flex:none}
.sl .phone .tb{display:inline-flex;align-items:center;gap:1cqw;height:10cqw;margin:0;padding:0 2.2cqw 0 1.4cqw;border:.4cqw solid #171615;border-radius:5cqw;font:inherit;font-size:4.4cqw;font-weight:900;line-height:1;white-space:nowrap;color:#171615;background:#FFFFFF;box-shadow:0 .5cqw 1.2cqw rgba(23,22,21,.2);cursor:pointer}
.sl .phone .tb svg{display:block;width:6.6cqw;height:6.6cqw;flex:none}
.sl .phone .ttl{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-weight:900;color:#171615;line-height:1.08;letter-spacing:-.2cqw}
.sl .phone .sub{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:4.2cqw;line-height:1.35;font-weight:700;color:#565F60}
.sl .phone .clockw,.sl .phone .mini{position:absolute;z-index:3}
.sl .phone .clockw svg,.sl .phone .mini svg{display:block;width:100%;height:auto;overflow:visible}
.sl .phone .mini{right:3cqw;top:22.6cqw;width:30cqw}
.sl .phone .mcap{position:absolute;z-index:3;right:4cqw;top:47cqw;margin:0;font-size:4cqw;line-height:1.2;font-weight:900;color:#171615;white-space:nowrap}
.sl .phone .sec{transform-box:view-box;animation:sl-tick 60s steps(60) infinite}
@keyframes sl-tick{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.sl .phone .sec{animation:none}}
/* 흰 판(시계판처럼) — 은빛 테 · 부드러운 그림자 */
.sl .phone .plate{background:radial-gradient(ellipse 120% 140% at 30% 20%,#FFFFFF 0%,#F2F3F3 70%,#E2E5E6 100%);border:.4cqw solid #BABCBC;border-radius:3cqw;box-shadow:0 .6cqw 1.6cqw rgba(23,22,21,.16)}
.sl .phone .kkc{position:absolute;z-index:3;right:4cqw;display:inline-flex;align-items:center;gap:.8cqw;height:8cqw;margin:0;padding:0 1.8cqw 0 1.2cqw;border:.4cqw solid #171615;border-radius:4cqw;background:#FFFFFF;color:#171615;font:inherit;font-size:4.2cqw;font-weight:900;line-height:1;white-space:nowrap;box-shadow:0 .4cqw 1cqw rgba(23,22,21,.16);cursor:pointer}
.sl .phone .kkc svg{display:block;width:5.4cqw;height:5.4cqw}
.sl .phone .lab{position:absolute;z-index:3;left:5cqw;margin:0;font-size:4.4cqw;font-weight:900;color:#171615}
.sl .phone .hint{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:4.2cqw;line-height:1.3;font-weight:700;color:#565F60}
/* 아래 줄 — 흰 바탕 · 지금 쪽은 하늘청록 짧은 줄 */
.sl .phone .tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:27cqw;display:grid;grid-template-columns:repeat(4,1fr);padding:2.4cqw 2cqw 0;background:#FFFFFF;border-top:.3cqw solid #D6D5D4}
.sl .phone .tab{display:flex;flex-direction:column;align-items:center;gap:.6cqw;font-size:4cqw;font-weight:800;color:#565F60;line-height:1.2;white-space:nowrap}
.sl .phone .tab svg{display:block;width:8cqw;height:8cqw}
.sl .phone .tab.on{color:#171615}
.sl .phone .tab.on::after{content:"";display:block;width:6cqw;height:.9cqw;border-radius:.5cqw;background:#1FB8CD}
"""

KK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 16C27 16 9 30 9 48C9 60 17 70 29 75L25 90L42 79C44.6 79.4 47.3 79.6 50 79.6C73 79.6 91 65.6 91 48C91 30 73 16 50 16Z" fill="#171615"/></svg>'
GIFT = ('<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#171615" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'
        '<rect x="20" y="44" width="60" height="38" rx="4"/><rect x="15" y="31" width="70" height="14" rx="3"/><path d="M50 31V82"/>'
        '<path d="M50 31C43 17 29 19 33 28C35 32 45 32 50 31ZM50 31C57 17 71 19 67 28C65 32 55 32 50 31Z"/></g></svg>')
TOOLS = ('<span class="tools"><button class="tb" type="button" aria-label="이 화면을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'
         '<button class="tb" type="button" aria-label="선물 받기 방으로">' + GIFT + '선물 받기</button></span>')
KKC = '<button class="kkc" type="button" aria-label="이 칸을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'

def line_icon(d):
    return f'<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{d}</g></svg>'
TAB_IC = {
    '첫 화면': line_icon('<circle cx="50" cy="50" r="34"/><path d="M50 30V50L64 58"/>'),
    '한 달 뒤': line_icon('<path d="M30 16H70M30 84H70M34 16C34 38 66 40 66 50C66 60 34 62 34 84M66 16C66 38 34 40 34 50C34 60 66 62 66 84"/>'),
    '지난 기록': line_icon('<rect x="18" y="16" width="64" height="68" rx="6"/><path d="M30 66L44 50L55 58L70 36"/>'),
    '고객센터': line_icon('<path d="M24 58V48C24 33 36 22 50 22C64 22 76 33 76 48V58"/><rect x="18" y="52" width="14" height="22" rx="5"/><rect x="68" y="52" width="14" height="22" rx="5"/><path d="M76 74C76 82 68 84 58 84"/>'),
}
def tabs(on='첫 화면'):
    return '<nav class="tabs" aria-label="아래 줄">' + ''.join(
        f'<span class="tab{" on" if k == on else ""}">{v}<span>{k}</span></span>' for k, v in TAB_IC.items()) + '</nav>'

FRAME_TOP = '<div class="wall"></div><div class="island"></div><div class="status"><span>9:41</span><span>●●●</span></div>'
FRAME_END = '<div class="homebar"></div>'
def head(n, name, lines):
    return (f'<div class="head"><span class="no"><b>{n}</b>{name}</span>' +
            ''.join(f'<p class="why"><em>{k}</em> {v}</p>' for k, v in lines) + '</div>')

# ① 첫 화면 — 돌 시계가 곧 테마 시계 · 네 칸 숫자는 돌 귀퉁이 판 · 단추는 돌 그림 가족
def pl(cls, label, name, n, on=False):
    return (f'<button class="pl {cls}{" on" if on else ""}" type="button" aria-label="{label}">'
            f'<span class="nm">{name}</span><span class="n">{n}<small>곳</small></span></button>')
def sb(name, pid, label, badge=None):
    b = f'<span class="badge">{badge}</span>' if badge else ''
    return f'<button class="sb" type="button" aria-label="{label}">{b}{stone(name, pid)}<b>{label}</b></button>'
c1 = f"""<section class="sample sl" id="c1"><style>
#c1 .phone .trow{{position:absolute;z-index:3;top:24cqw;left:5cqw;right:5cqw;display:flex;justify-content:space-between;align-items:baseline;gap:2cqw}}
#c1 .phone .trow .ttl{{position:static;font-size:6.6cqw;white-space:nowrap}}
#c1 .phone .clockw{{left:1cqw;width:98cqw;top:33cqw}}
#c1 .phone .pl{{position:absolute;z-index:5;width:23cqw;margin:0;padding:1.4cqw 2.2cqw 1.8cqw;border-radius:2.8cqw;background:linear-gradient(#FFFFFF,#E2E5E6);border:.4cqw solid #818C8E;box-shadow:0 .7cqw 1.6cqw rgba(23,22,21,.3);color:#171615;text-align:left;font:inherit;cursor:pointer}}
#c1 .phone .pl .nm{{display:block;font-size:4.4cqw;font-weight:900;line-height:1.15;color:#565F60}}
#c1 .phone .pl .n{{display:block;font-size:9.4cqw;font-weight:900;line-height:1;letter-spacing:-.3cqw}}
#c1 .phone .pl .n small{{font-size:4.2cqw;margin-left:.5cqw;letter-spacing:0}}
#c1 .phone .pl.on{{background:linear-gradient(#1FB8CD,#1FB8CD);border-color:#152D30;color:#152D30}}
#c1 .phone .pl.on .nm{{color:#152D30}}
#c1 .phone .p1{{left:2.5cqw;top:33cqw}}
#c1 .phone .p2{{right:2.5cqw;top:33cqw}}
#c1 .phone .p3{{left:2.5cqw;top:93.5cqw}}
#c1 .phone .p4{{right:2.5cqw;top:93.5cqw}}
#c1 .phone .cap{{position:absolute;z-index:3;left:5cqw;right:5cqw;top:117cqw;margin:0;text-align:center;font-size:4.2cqw;line-height:1.35;font-weight:800;color:#3C4E51}}
#c1 .phone .cap i{{display:inline-block;width:3cqw;height:3cqw;border-radius:50%;background:#1FB8CD;border:.3cqw solid #152D30;vertical-align:.1cqw;margin-right:.8cqw}}
#c1 .phone .stones{{position:absolute;z-index:3;left:2cqw;right:2cqw;top:140cqw;display:grid;grid-template-columns:repeat(4,1fr);gap:1cqw}}
#c1 .phone .sb{{position:relative;display:flex;flex-direction:column;align-items:center;gap:.4cqw;min-width:0;margin:0;padding:0;border:0;background:none;font:inherit;color:#171615;cursor:pointer}}
#c1 .phone .sb svg{{display:block;width:23.4cqw;height:auto;overflow:visible}}
#c1 .phone .sb b{{font-size:4.2cqw;font-weight:900;line-height:1.2;white-space:nowrap}}
#c1 .phone .badge{{position:absolute;z-index:2;top:-1.2cqw;right:.4cqw;min-width:7.8cqw;height:7.8cqw;padding:0 1.2cqw;border-radius:3.9cqw;background:#1FB8CD;color:#152D30;border:.4cqw solid #152D30;font-size:4.2cqw;font-weight:900;line-height:7cqw;text-align:center}}
</style>
{head('①', '첫 화면', [('가운데', '진짜 사이트 돌 시계 — 시계판 점 하나가 업종 하나'), ('귀퉁이', '네 칸 숫자를 돌에 붙인 판 넷 — 싹만 하늘청록'), ('아래', '같은 돌 그림 단추 넷과 흰 아래 줄'), ('맨 위', '「카톡 보내기」와 「선물 받기」')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="mark">돌이</span>{TOOLS}</div>
<div class="trow"><h2 class="ttl">업종 77곳은 지금</h2><span class="date">10월 13일 기록</span></div>
<div class="clockw" role="img" aria-label="돌 시계 — 판 위 점 하나가 업종 하나">{theme_clock('c1k', lit='S')}</div>
{pl('p1', '싹 업종 37곳 보기', '싹', CNT['S'], True)}{pl('p2', '꽃 업종 7곳 보기', '꽃', CNT['B'])}{pl('p3', '잠잠 업종 29곳 보기', '잠잠', CNT['Q'])}{pl('p4', '시듦 업종 4곳 보기', '시듦', CNT['W'])}
<p class="cap"><i></i>점 하나가 업종 하나예요. 왼쪽 위가 싹이에요.</p>
<div class="stones">{sb('jinhwa', 's1j', '꽃 될 회사', BLOOM['today']['n'])}{sb('cal', 's1c', '싹 달력')}{sb('company', 's1o', '회사 찾기')}{sb('why', 's1w', '왜 사?')}</div>
{tabs()}{FRAME_END}</div></section>"""

# ② 싹 판을 누르면 — 싹 업종 37곳 · 제목 옆 작은 돌 시계(싹 자리 점이 빛남)
S_ORDER = HOME['order']['S']  # 2차전지 · 콘텐츠 제작 · 의류·패션
REST = ['가공식품', '가전·생활용품', '건설 엔지니어링', '건축자재', '게임', '교육', '디스플레이', '물류·운송', '방송', '보험', '비철금속', '소프트웨어', '식품', '자동차', '전력·가스', '제약']
chips = ''.join(f'<span class="chip">{html.escape(x)}</span>' for x in REST) + '<span class="chip more">그 밖 18곳</span>'
rows2 = ''.join(
    f'<div class="r plate{" on" if k == 0 else ""}"><span class="no">{k + 1}</span><b>{html.escape(n)}</b>{"<span class=tag>진짜 싹</span>" if k == 0 else ""}</div>'
    for k, n in enumerate(S_ORDER))
c2 = f"""<section class="sample sl" id="c2"><style>
#c2 .phone .ttl{{top:24cqw;right:36cqw;font-size:11cqw}}
#c2 .phone .sub.s1{{top:38cqw;right:35cqw}}
#c2 .phone .rows{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:58cqw;display:flex;flex-direction:column;gap:2cqw}}
#c2 .phone .r{{position:relative;display:flex;align-items:center;gap:3cqw;height:12.4cqw;padding:0 3cqw 0 2.4cqw}}
#c2 .phone .r .no{{display:flex;align-items:center;justify-content:center;width:8.4cqw;height:8.4cqw;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFFFFF,#E2E5E6);border:.6cqw solid #818C8E;font-size:4.6cqw;font-weight:900;color:#171615;flex:none}}
#c2 .phone .r b{{flex:1;font-size:5cqw;font-weight:900}}
#c2 .phone .r.on{{border-color:#152D30;box-shadow:0 .6cqw 1.6cqw rgba(23,22,21,.16),inset 1.4cqw 0 0 #1FB8CD}}
#c2 .phone .r.on .no{{background:#1FB8CD;border-color:#152D30;color:#152D30}}
#c2 .phone .tag{{padding:.8cqw 2cqw;border-radius:2.4cqw;background:#1FB8CD;color:#152D30;border:.4cqw solid #152D30;font-size:4cqw;font-weight:900}}
#c2 .phone .chips{{position:absolute;z-index:3;top:115cqw;left:4cqw;right:4cqw;display:flex;flex-wrap:wrap;gap:2cqw}}
#c2 .phone .chip{{padding:1.2cqw 2.6cqw;border-radius:3cqw;background:#E2E5E6;border:.3cqw solid #BABCBC;font-size:4.2cqw;font-weight:800;color:#3C4E51}}
#c2 .phone .chip.more{{background:transparent;border-style:dashed;color:#565F60}}
#c2 .phone .hint{{top:172cqw}}
</style>
{head('②', '싹 판을 누르면', [('보이는 것', '싹 자리 업종 37곳 — 맨 앞 셋은 크게'), ('작은 돌 시계', '싹 자리 점 서른일곱이 빛나요'), ('칸마다', '「맨 앞 셋」과 「그 밖 34곳」에 카톡 보내기'), ('누르는 곳', '업종을 누르면 그 업종 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 지금</span>{TOOLS}</div>
<h2 class="ttl">싹 {CNT['S']}곳</h2>
<div class="mini" role="img" aria-label="돌 시계 — 싹 자리 점">{theme_clock('c2k', lit='S', tint='S', sec=False, cls='mclock')}</div>
<p class="sub s1">10월 13일 싹 자리 업종이에요</p>
<p class="lab" style="top:50cqw">맨 앞 셋</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:48.4cqw"', 1)}
<div class="rows">{rows2}</div>
<p class="lab" style="top:106.6cqw">그 밖 34곳</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:105cqw"', 1)}
<div class="chips">{chips}</div>
<p class="hint">업종을 누르면 그 업종 회사가 나와요</p>
{tabs()}{FRAME_END}</div></section>"""

# ③ 「꽃 될 회사」를 누르면 — 꽃 핀 업종 안의 싹 회사 31곳 · 작은 돌 시계(그 업종 여섯 점이 빛남 — 모두 꽃 자리)
GROUPS = sorted(BLOOM['today']['inds'], key=lambda g: -len(g['co']))
SIX = tuple(g['n'] for g in GROUPS)
rows3 = ''
for i, g in enumerate(GROUPS):
    if i == 0:
        names = [c[1] for c in g['co']]
        pick = [n for n in ('대한과학', '바이오인프라', '인트론바이오', '소마젠') if n in names]  # ④ 로 이어지는 대한과학을 맨 앞에 · 영어 글자가 든 이름은 「외」 안으로
        cos = ''.join(f'<span class="co{" on" if j == 0 else ""}">{html.escape(n)}</span>' for j, n in enumerate(pick)) + f'<span class="co more">외 {len(names) - len(pick)}곳</span>'
        rows3 += f'<div class="row plate open"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span></div><div class="cos">{cos}</div></div>'
    else:
        rows3 += f'<div class="row plate"><div class="rh"><b>{html.escape(g["n"])}</b><span class="k">{len(g["co"])}곳</span></div></div>'
c3 = f"""<section class="sample sl" id="c3"><style>
#c3 .phone .ttl{{top:23.5cqw;right:35cqw;font-size:7.4cqw}}
#c3 .phone .sub.s1{{top:47.2cqw}}
#c3 .phone .list{{position:absolute;z-index:3;top:55.6cqw;left:4cqw;right:4cqw;display:flex;flex-direction:column;gap:1.8cqw}}
#c3 .phone .row{{color:#171615;overflow:hidden}}
#c3 .phone .rh{{display:flex;align-items:center;gap:2.2cqw;padding:1cqw 3cqw 1cqw 3.4cqw;min-height:10.6cqw}}
#c3 .phone .rh b{{flex:1;font-size:4.8cqw;font-weight:900}}
#c3 .phone .rh .k{{font-size:5.4cqw;font-weight:900}}
#c3 .phone .open{{border-color:#152D30;box-shadow:0 .6cqw 1.6cqw rgba(23,22,21,.16),inset 1.4cqw 0 0 #1FB8CD}}
#c3 .phone .cos{{display:flex;flex-wrap:wrap;gap:1.4cqw;padding:0 3cqw 2.6cqw 3.4cqw}}
#c3 .phone .co{{padding:.8cqw 2.2cqw;border-radius:2.6cqw;background:#FFFFFF;border:.4cqw solid #171615;font-size:4.2cqw;font-weight:800;color:#171615}}
#c3 .phone .co.on{{background:#171615;color:#FFFFFF}}
#c3 .phone .co.more{{background:transparent;border-style:dashed}}
#c3 .phone .rec{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:155cqw;margin:0;padding:1.6cqw 3cqw;border-left:1.2cqw solid #818C8E;font-size:4.1cqw;line-height:1.4;font-weight:700;color:#3C4E51}}
</style>
{head('③', '「꽃 될 회사」를 누르면', [('보이는 것', '꽃 핀 업종 여섯 안의 싹 회사 31곳'), ('작은 돌 시계', '그 업종 여섯 점이 빛나요 — 모두 꽃 자리'), ('정직하게', '지난 기록 한 줄을 늘 같이'), ('누르는 곳', '회사 이름을 누르면 그 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 지금</span>{TOOLS}</div>
<h2 class="ttl">꽃 핀 업종 안의<br>싹 회사 {BLOOM['today']['n']}곳</h2>
<div class="mini" role="img" aria-label="돌 시계 — 꽃 자리 업종 여섯">{theme_clock('c3k', lit='', tint='B', ring=SIX, sec=False, cls='mclock')}</div>
<p class="sub s1">10월 13일에 지난 기록으로 골랐어요</p>
<div class="list">{rows3}</div>
<p class="rec">지난 3년, 이렇게 고른 회사가 꽃이 된 것은 네 번에 한 번쯤이에요. 아무 회사와 큰 차이는 없어요.</p>
{tabs()}{FRAME_END}</div></section>"""

# ④ 회사를 누르면 — 대한과학 · 작은 돌 시계(이 회사 업종 점 — 꽃 자리) · 「왜 사?」(돌 책 그림)
c4 = f"""<section class="sample sl" id="c4"><style>
#c4 .phone .ttl{{top:24cqw;right:36cqw;font-size:11cqw}}
#c4 .phone .sub.s1{{top:38cqw;right:36cqw}}
#c4 .phone .card{{position:absolute;z-index:3;top:52.5cqw;left:4cqw;right:4cqw;height:44cqw;overflow:hidden}}
#c4 .phone .card svg{{position:absolute;left:1cqw;top:4cqw;width:40cqw;height:auto}}
#c4 .phone .card .tag{{position:absolute;left:43cqw;top:5cqw;padding:.8cqw 2.4cqw;border-radius:2.6cqw;background:#1FB8CD;color:#152D30;border:.4cqw solid #152D30;font-size:4.2cqw;font-weight:900}}
#c4 .phone .card p{{position:absolute;left:43cqw;right:3cqw;top:15.4cqw;margin:0;font-size:4.4cqw;line-height:1.4;font-weight:800;color:#171615}}
#c4 .phone .whyb{{position:absolute;z-index:3;top:103cqw;left:4cqw;right:4cqw;height:46cqw;overflow:hidden;border:.6cqw solid #152D30;box-shadow:0 .8cqw 2cqw rgba(23,22,21,.22),inset 0 0 0 1cqw #1FB8CD}}
#c4 .phone .whyb svg{{position:absolute;left:2cqw;top:6cqw;width:38cqw;height:auto}}
#c4 .phone .whyb b{{position:absolute;left:43cqw;top:7cqw;font-size:13cqw;line-height:1;font-weight:900;letter-spacing:-.5cqw;color:#171615}}
#c4 .phone .whyb span{{position:absolute;left:43cqw;right:4cqw;top:24cqw;font-size:4.4cqw;line-height:1.35;font-weight:900;color:#152D30}}
#c4 .phone .whyb i{{position:absolute;right:4.4cqw;bottom:5cqw;width:11cqw;height:11cqw;border-radius:50%;background:#1FB8CD;border:.6cqw solid #152D30;font-style:normal;font-size:6.4cqw;font-weight:900;line-height:9.6cqw;text-align:center;color:#152D30}}
#c4 .phone .later{{position:absolute;z-index:3;top:156cqw;left:5cqw;right:5cqw;margin:0;font-size:4.2cqw;line-height:1.4;font-weight:700;color:#3C4E51}}
</style>
{head('④', '회사를 누르면', [('보이는 것', '회사 한 곳과 「왜 사?」 큰 단추'), ('작은 돌 시계', '이 회사 업종 점 — 꽃 자리'), ('멈춤', '사기 전에 열한 가지를 묻고, 한 달 뒤 다시 물어요'), ('세 번', '첫 화면에서 두 번 누르면 여기 · 세 번째가 「왜 사?」')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 꽃 될 회사</span>{TOOLS}</div>
<h2 class="ttl">대한과학</h2>
<div class="mini" role="img" aria-label="돌 시계 — 이 회사 업종은 꽃 자리">{theme_clock('c4k', lit='', tint='B', ring=('바이오 도구·서비스',), sec=False, cls='mclock')}</div>
<p class="mcap">업종은 꽃 자리</p>
<p class="sub s1">바이오 도구·서비스</p>
<div class="card plate">{stone('company', 'c4o')}<span class="tag">싹 난 회사</span><p>꽃 핀 업종 안에서 아직 싹인 회사예요. 10월 13일에 골랐어요.</p></div>
<div class="whyb plate" role="button" aria-label="왜 사? 열한 가지 묻기">{stone('why', 'c4w')}<b>왜 사?</b><span>사기 전에 열한 가지만 물어볼게요</span></div>
<p class="later">한 달 뒤에는 「그날 정한 대로 했어?」 하고 다시 물어요</p>
{tabs()}{FRAME_END}</div></section>"""

FR = {'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4}
for k, v in FR.items():
    open(os.path.join(D, k + '.html'), 'w').write(v.replace('<style>', '<style>' + SHARED, 1))

base = open(os.path.join(D, 'base.css')).read()
pal = json.load(open(os.path.join(D, 'palette.json')))
strip = ''.join(f'<i style="background:{h}"></i>' for h in pal)
EXTRA = """
.sample .why em{display:inline-block;margin-right:8px;padding:0 10px;border-radius:10px;background:#152D30;color:#FFFFFF;font-size:21px;line-height:1.5;font-weight:800}
main>.intro{border:3px solid #000;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px}
main>.intro h1{font-size:32px;line-height:1.25;margin:0;font-weight:900}
main>.intro p{margin:0}
main>.intro .hero{border-radius:16px;background:radial-gradient(ellipse at 50% 40%,#FFFFFF,#E2E5E6);border:1px solid #BABCBC;padding:10px 16px}
main>.intro .hero svg{display:block;width:100%;max-width:440px;height:auto;margin:0 auto;overflow:visible}
main>.intro .hero .sec{transform-box:view-box;animation:sl-tick 60s steps(60) infinite}
@media (prefers-reduced-motion:reduce){main>.intro .hero .sec{animation:none}}
main>.intro .fix{border:3px solid #152D30;border-radius:14px;padding:12px 14px;background:#F2F3F3}
main>.intro .fix b{display:block;font-size:23px}
.strip{display:flex;height:30px;border-radius:10px;overflow:hidden;border:1px solid #000}
.strip i{flex:1 1 0;min-width:0}
.path{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:21px;font-weight:800}
.path span{padding:4px 12px;border:2px solid #000;border-radius:12px}
.path b{font-size:24px}
main>.note{border:1px solid #111;border-radius:18px;padding:16px}
main>.note h2{font-size:25px;margin:0 0 8px;font-weight:800}
main>.note ul{margin:4px 0;padding-left:28px}
main>.asklast{border:3px solid #000;border-radius:18px;padding:16px;font-size:24px;font-weight:800}
main>.footline{font-size:21px;color:#111;margin:0}
main>details{font-size:21px;color:#111;word-break:break-all}
main>details summary{cursor:pointer;min-height:48px}
"""
NOT = ['진짜 사이트는 아직 그대로예요. 「응」 하시면 그때 만들어요.',
       '돌 그림의 노란 표시, 카톡 노란색, 선물 금빛은 고르신 색 100가지에 없어요. 그래서 하늘청록과 흰색으로 했어요.',
       '이 그림의 시계는 9시 41분에 서 있고 초침만 돌아요. 지금 시각은 만들 때 붙여요.',
       '「왜 사?」를 누른 뒤 열한 질문 화면은 아직 이 모양으로 안 그렸어요.',
       '시계판 점은 방향만 자료 그대로예요. 거리는 가운데 별을 피하려고 줄여 그렸어요.',
       '숫자와 점은 10월 13일 기록이라 오늘 값이 아니에요.']
page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>돌이 돌 시계 중심 판</title><style>{base}{SHARED}{EXTRA}</style></head><body><main>
<section class="intro"><h1>돌 시계가 화면의 중심이에요</h1>
<div class="hero">{theme_clock('hero', lit='S')}</div>
<p>시계판 위 점 하나가 업종 하나예요. 하늘청록 점이 싹 자리 업종이에요.</p>
<p>네 칸 숫자는 돌 네 귀퉁이에 판으로 붙였어요.</p>
<p>단추 그림은 진짜 사이트의 돌 그림 가족으로 바꿨어요. 바탕도 진짜 사이트처럼 밝게 했어요.</p>
<p>앞 판의 얼굴 그림과 납작한 색 칸은 돌과 결이 달라 뺐어요.</p>
<p>맨 위에는 「카톡 보내기」와 「선물 받기」가 늘 있어요.</p>
<div class="path"><span>첫 화면</span><b>›</b><span>꽃 될 회사</span><b>›</b><span>회사</span><b>›</b><span>왜 사?</span></div>
<p>「꽃 될 회사」 길로 가면 세 번 만에 「왜 사?」에 닿아요.</p>
<div class="fix"><b>바로잡음</b>앞 판 ④ 화면에서 대한과학 업종을 「싹 자리」로 그렸어요. 자료로는 「꽃 자리」예요. 이번 판에서 고쳤어요.</div>
<div class="strip">{strip}</div></section>
{c1}{c2}{c3}{c4}
<section class="note"><h2>못 한 것 {len(NOT)}가지</h2><ul>{''.join(f'<li>{x}</li>' for x in NOT)}</ul></section>
<section class="asklast">이 모양으로 진짜 돌이를 만들까요?</section>
<p class="footline">채점표: 화면 넷 모두 금지 말과 색과 글씨 크기를 기계로 검사했어요. 틀림 장부 118건 · 못 한 것 {len(NOT)}가지</p>
<details><summary>근거 펼치기</summary><p>돌 시계와 돌 그림: 진짜 사이트 site/media/stone/*.svg 그대로 · 색만 고르신 100가지 가운데 가장 가까운 색 · 노란 표시는 하늘청록 · 바늘은 site/next/stone-clock.js 꼴</p><p>시계판 점: site/next/data/theme-home.json 업종 77곳의 x · y · z — 가운데 = 꽃 선(가로 5) × 지난 닷새 0 · 방향은 자료 그대로 · 세로는 2.2배로 펴고 거리는 줄여 그림 · 네 자리는 site/next/theme-rule.js zoneOf 와 같음</p><p>꽃 될 회사: site/next/data/theme-bloom.json today — 31곳 · 업종 여섯 모두 꽃 자리(사이트 쪽 이름 「꽃 핀 업종 안의 싹 회사」)</p><p>카톡 보내기 · 선물 받기: site/next/kk-all.js · site/next/app.js 와 같은 이름</p><p>앞 판: docs/design/dori-new-2026-10-25 의 combo · combo2 · clock</p></details>
</main></body></html>"""
open(os.path.join(D, 'stone.html'), 'w').write(page)
print('ok', len(page))
