#!/usr/bin/env python3
# 돌 시계 판 — 사장님 2026-10-25 22:03 「난 이시계 느낌 넘 좋아 이 시계 느낌을 중심에 두고
#   지금까지 만든것을 조화롭게 효율적으로 다시 디자인해봐」(진짜 사이트 첫 화면 돌 시계 사진)
# 지금까지 만든 것: 21:22 합친 판(2번 네 칸 + 7번 그림 단추 · 아래 단추 줄) · 21:51 둘째 판(카톡 보내기 · 선물 받기)
# 이번 판: 돌 시계를 첫 화면 한가운데 주인공으로 · 네 칸은 시계 둘레에 「테마 시계」 자리 그대로
#   (site/next/theme-rule.js zoneOf — 왼쪽 위 싹 · 오른쪽 위 꽃 · 오른쪽 아래 시듦 · 왼쪽 아래 잠잠 = 시계 방향으로 돎)
#   · 다른 화면은 제목 옆 작은 돌 시계가 「지금 시계 어디쯤」을 보여 줌
import os, json, html
from parts import (SHARED, face_sprout, FACE_BLOOM, FACE_WILT, FACE_SLEEP, svg, GL, TOOLS, KKC, app, DOCK,
                   FRAME_TOP, FRAME_END, head)
from clock import stone_clock, PX, PY
D = os.path.dirname(os.path.abspath(__file__))

CLOCK_CSS = """
/* 돌 시계 — 큰 것(첫 화면) · 작은 것(다른 화면 제목 옆) */
.cb .phone .clockw{position:absolute;z-index:3}
.cb .phone .clockw svg,.cb .phone .mini svg{display:block;width:100%;height:auto;overflow:visible}
.cb .phone .sec{transform-box:view-box;animation:cb-tick 60s steps(60) infinite}
@keyframes cb-tick{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.cb .phone .sec{animation:none}}
.cb .phone .mini{position:absolute;z-index:3;right:3.4cqw;top:22cqw;width:26cqw}
.cb .phone .mcap{position:absolute;z-index:3;right:4cqw;top:43.4cqw;margin:0;font-size:4cqw;line-height:1.2;font-weight:900;color:#F2F3F3;white-space:nowrap}
"""
SH = SHARED + CLOCK_CSS

# 작은 돌 시계 위에 얹는 표시 — 판 위 「싹 자리」(9시에서 12시) · 싹에서 꽃으로 가는 화살 · 이 회사 업종 점
def sector(a=.55, r=29):
    return f'<path d="M{PX:.2f} {PY:.2f}L{PX - r:.2f} {PY:.2f}A{r} {r} 0 0 1 {PX:.2f} {PY - r:.2f}Z" fill="rgba(31,184,205,{a})"/>'
def sprout_to_bloom(r=22):
    k = .7071
    sx, sy, ex, ey = PX - r * k, PY - r * k, PX + r * k, PY - r * k
    tip = (ex + 5.4 * k, ey + 5.4 * k)
    c = (ex - 1.2 * k, ey - 1.2 * k)
    b1, b2 = (c[0] + 4.8 * k, c[1] - 4.8 * k), (c[0] - 4.8 * k, c[1] + 4.8 * k)
    arc = f'M{sx:.2f} {sy:.2f}A{r} {r} 0 0 1 {ex:.2f} {ey:.2f}'
    return (f'<path d="{arc}" fill="none" stroke="#171615" stroke-width="6.4" stroke-linecap="round"/>'
            f'<path d="{arc}" fill="none" stroke="#1FB8CD" stroke-width="3.6" stroke-linecap="round"/>'
            f'<path d="M{tip[0]:.2f} {tip[1]:.2f}L{b1[0]:.2f} {b1[1]:.2f}L{b2[0]:.2f} {b2[1]:.2f}Z" fill="#1FB8CD" stroke="#171615" stroke-width="1.3" stroke-linejoin="round"/>')
def here_dot(r=17):
    k = .7071
    return sector(.3) + f'<circle cx="{PX - r * k:.2f}" cy="{PY - r * k:.2f}" r="4.6" fill="#1FB8CD" stroke="#171615" stroke-width="1.5"/>'

# 시계 방향 화살(둘레 네 곳)
def arw(rot):
    return (f'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 50H72M54 31L73 50L54 69" fill="none" stroke="#171615" '
            f'stroke-width="11" stroke-linecap="round" stroke-linejoin="round" transform="rotate({rot} 50 50)"/></svg>')

# ① 첫 화면 — 돌 시계가 한가운데 · 네 칸이 둘레(시계 방향)
def st(cls, label, name, n, face, bg, ink, off, dot, on=False):
    return (f'<button class="st {cls}{" on" if on else ""}" type="button" aria-label="{label}" style="--bg:{bg};--ink:{ink};--off:{off};--dot:{dot}">'
            f'{svg(face)}<span class="nm">{name}</span><span class="n">{n}<small>곳</small></span></button>')
c1 = f"""<section class="sample cb" id="c1"><style>
#c1 .phone .trow{{position:absolute;z-index:3;top:24cqw;left:5cqw;right:5cqw;display:flex;justify-content:space-between;align-items:baseline;gap:2cqw}}
#c1 .phone .trow .ttl{{position:static;font-size:6.6cqw;white-space:nowrap}}
#c1 .phone .st{{position:absolute;z-index:3;width:42cqw;height:24cqw;margin:0;padding:0;border:.6cqw solid #171615;border-radius:3.2cqw;font:inherit;text-align:left;background:var(--bg);color:var(--ink);box-shadow:1cqw 1cqw 0 #171615;isolation:isolate;overflow:hidden;cursor:pointer}}
#c1 .phone .st::before{{content:"";position:absolute;inset:0;z-index:-1;background-image:radial-gradient(circle,var(--dot) 0 34%,transparent 39%);background-size:2.4cqw 2.4cqw;opacity:.55}}
#c1 .phone .st .art{{position:absolute;left:1cqw;top:2cqw;width:19cqw;height:19cqw;overflow:visible}}
#c1 .phone .st .nm{{position:absolute;left:21cqw;top:2.6cqw;font-size:5.6cqw;line-height:1;font-weight:900;letter-spacing:-.1cqw}}
#c1 .phone .st .n{{position:absolute;left:20.4cqw;bottom:2.2cqw;font-size:11cqw;line-height:.8;font-weight:900;letter-spacing:-.5cqw;text-shadow:.7cqw .7cqw 0 var(--off)}}
#c1 .phone .st .n small{{font-size:4.4cqw;letter-spacing:0;margin-left:.4cqw;text-shadow:none}}
#c1 .phone .st.on{{box-shadow:1cqw 1cqw 0 #171615,2cqw 2cqw 0 #FFFFFF;z-index:4}}
#c1 .phone .s1{{left:4cqw;top:34cqw}}
#c1 .phone .s2{{right:4cqw;top:34cqw}}
#c1 .phone .s3{{left:4cqw;top:122cqw}}
#c1 .phone .s4{{right:4cqw;top:122cqw}}
#c1 .phone .ar{{position:absolute;z-index:5;width:7.4cqw;height:7.4cqw;border-radius:50%;background:#FFFFFF;border:.5cqw solid #171615;box-shadow:.5cqw .5cqw 0 #171615}}
#c1 .phone .ar svg{{display:block;width:100%;height:100%}}
#c1 .phone .ar.t{{left:46.3cqw;top:42.3cqw}}
#c1 .phone .ar.b{{left:46.3cqw;top:130.3cqw}}
#c1 .phone .ar.r{{right:3.4cqw;top:85.6cqw}}
#c1 .phone .ar.l{{left:3.4cqw;top:85.6cqw}}
#c1 .phone .clockw{{left:13cqw;width:74cqw;top:59.4cqw}}
#c1 .phone .glow{{position:absolute;z-index:2;left:0;right:0;top:46cqw;height:84cqw;background:radial-gradient(closest-side,rgba(170,193,197,.2),rgba(170,193,197,.07) 60%,rgba(170,193,197,0))}}
#c1 .phone .apps.mid{{top:151.4cqw}}
</style>
{head('①', '첫 화면', [('가운데', '진짜 사이트의 돌 시계 — 색만 고르신 100가지로'), ('둘레', '네 칸을 계절 차례로 — 싹 › 꽃 › 시듦 › 잠잠'), ('맨 위', '「카톡 보내기」와 「선물 받기」 — 모든 화면 같은 자리'), ('빛나는 곳', '싹 칸과 초침')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="mark">돌이</span>{TOOLS}</div>
<div class="trow"><h2 class="ttl">업종 77곳은 지금</h2><span class="date">10월 13일 기록</span></div>
{st('s1', '싹 업종 37곳 보기', '싹', 37, face_sprout(), '#1FB8CD', '#152D30', '#FFFFFF', '#F2F3F3', True)}
{st('s2', '꽃 업종 7곳 보기', '꽃', 7, FACE_BLOOM, '#AAC1C5', '#171615', '#F2F3F3', '#8CA3A7')}
{st('s3', '잠잠 업종 29곳 보기', '잠잠', 29, FACE_SLEEP, '#284E53', '#E2E5E6', '#152D30', '#356369')}
{st('s4', '시듦 업종 4곳 보기', '시듦', 4, FACE_WILT, '#797F7F', '#F2F3F3', '#3C4E51', '#697779')}
<span class="ar t">{arw(0)}</span><span class="ar r">{arw(90)}</span><span class="ar b">{arw(180)}</span><span class="ar l">{arw(270)}</span>
<div class="glow"></div><div class="clockw" role="img" aria-label="돌 시계 — 9시 41분">{stone_clock('c1k')}</div>
<div class="apps mid">{app('꽃 될 회사', 'bloom', '#E2E5E6', '31')}{app('회사 찾기', 'search', '#4B939D')}{app('싹 달력', 'cal', '#8CA3A7')}{app('고객센터', 'help', '#428189')}</div>
{DOCK}{FRAME_END}</div></section>"""

# ② 싹 칸을 누르면 — 싹 업종 37곳 + 제목 옆 작은 돌 시계(싹 자리가 빛남)
REST = ['가공식품', '가전·생활용품', '건설 엔지니어링', '건축자재', '게임', '교육', '디스플레이', '물류·운송', '방송', '보험', '비철금속', '소프트웨어', '식품', '자동차', '전력·가스', '제약']
chips = ''.join(f'<span class="chip">{html.escape(x)}</span>' for x in REST) + '<span class="chip more">그 밖 18곳</span>'
c2 = f"""<section class="sample cb" id="c2"><style>
#c2 .phone .ttl{{top:24cqw;right:32cqw;font-size:11cqw;text-shadow:1cqw 1cqw 0 #3E737A}}
#c2 .phone .sub.s1{{top:38cqw;right:32cqw}}
#c2 .phone .lab{{position:absolute;z-index:3;left:5cqw;margin:0;font-size:4.4cqw;font-weight:900;color:#F2F3F3}}
#c2 .phone .kkc{{position:absolute;z-index:3;right:4cqw;display:inline-flex;align-items:center;gap:.8cqw;height:8cqw;margin:0;padding:0 1.8cqw 0 1.2cqw;border:.4cqw solid #171615;border-radius:4cqw;background:#FFFFFF;color:#171615;font:inherit;font-size:4.2cqw;font-weight:900;line-height:1;white-space:nowrap;box-shadow:.6cqw .6cqw 0 #171615;cursor:pointer}}
#c2 .phone .kkc svg{{display:block;width:5.4cqw;height:5.4cqw}}
#c2 .phone .three{{position:absolute;z-index:3;top:56cqw;left:4cqw;right:4cqw;display:grid;grid-template-columns:repeat(3,1fr);gap:2.6cqw}}
#c2 .phone .t{{position:relative;height:44cqw;border:.6cqw solid #171615;border-radius:3.2cqw;background:var(--bg);color:var(--ink);box-shadow:1cqw 1cqw 0 #171615;overflow:hidden}}
#c2 .phone .t svg{{position:absolute;left:3cqw;top:2cqw;width:22cqw;height:22cqw}}
#c2 .phone .t b{{position:absolute;left:2.4cqw;right:1.6cqw;bottom:2.4cqw;font-size:4.6cqw;line-height:1.15;font-weight:900}}
#c2 .phone .t.on{{box-shadow:1cqw 1cqw 0 #171615,2cqw 2cqw 0 #FFFFFF}}
#c2 .phone .real{{position:absolute;right:1.6cqw;top:1.6cqw;padding:.6cqw 1.6cqw;border-radius:2.4cqw;background:#FFFFFF;color:#152D30;border:.4cqw solid #171615;font-size:4cqw;font-weight:900}}
#c2 .phone .chips{{position:absolute;z-index:3;top:115cqw;left:4cqw;right:4cqw;display:flex;flex-wrap:wrap;gap:2cqw}}
#c2 .phone .chip{{padding:1.2cqw 2.6cqw;border-radius:3cqw;background:rgba(170,193,197,.16);border:.4cqw solid rgba(242,243,243,.25);font-size:4.2cqw;font-weight:800;color:#F2F3F3}}
#c2 .phone .chip.more{{background:transparent;border-style:dashed;color:#AAC1C5}}
#c2 .phone .hint{{top:176cqw}}
</style>
{head('②', '싹 칸을 누르면', [('보이는 것', '싹 자리 업종 37곳 — 맨 앞 셋은 크게'), ('작은 돌 시계', '시계의 싹 자리가 빛나요'), ('칸마다', '「맨 앞 셋」과 「그 밖 34곳」에 카톡 보내기'), ('누르는 곳', '업종을 누르면 그 업종 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 지금</span>{TOOLS}</div>
<h2 class="ttl">싹 37곳</h2>
<div class="mini" role="img" aria-label="테마 시계의 싹 자리">{stone_clock('c2k', sec=False, cls='mclock', extra=sector())}</div>
<p class="sub s1">10월 13일 싹 자리 업종이에요</p>
<p class="lab" style="top:47.6cqw">맨 앞 셋</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:46cqw"', 1)}
<div class="three">
 <div class="t on" style="--bg:#1FB8CD;--ink:#152D30">{svg(face_sprout('#F2F3F3', '#284E53', True), '')}<span class="real">진짜 싹</span><b>2차전지</b></div>
 <div class="t" style="--bg:#AAC1C5;--ink:#171615">{svg(face_sprout('#F2F3F3', '#315D62', False), '')}<b>콘텐츠 제작</b></div>
 <div class="t" style="--bg:#4B939D;--ink:#171615">{svg(face_sprout('#E2E5E6', '#284E53', False), '')}<b>의류·패션</b></div>
</div>
<p class="lab" style="top:106.6cqw">그 밖 34곳</p>{KKC.replace('class="kkc"', 'class="kkc" style="top:105cqw"', 1)}
<div class="chips">{chips}</div>
<p class="hint">업종을 누르면 그 업종 회사가 나와요</p>
{DOCK}{FRAME_END}</div></section>"""

# ③ 「꽃 될 회사」를 누르면 — 31곳 + 작은 돌 시계(싹에서 꽃으로 가는 화살)
GROUPS = [('바이오 도구·서비스', 10, '#1FB8CD'), ('정밀화학', 7, '#AAC1C5'), ('전자부품', 6, '#8CA3A7'), ('디스플레이 장비', 5, '#4B939D'), ('2차전지 장비', 2, '#428189'), ('반도체 장비', 1, '#3E737A')]
BIO = ['대한과학', '바이오인프라', '인트론바이오', '소마젠']
rows = ''
for i, (nm, k, bg) in enumerate(GROUPS):
    if i == 0:
        cos = ''.join(f'<span class="co{" on" if j == 0 else ""}">{c}</span>' for j, c in enumerate(BIO)) + '<span class="co more">외 6곳</span>'
        rows += f'<div class="row open" style="--bg:{bg}"><div class="rh"><span class="mini2">{svg(face_sprout("#F2F3F3", "#284E53", False), "")}</span><b>{nm}</b><span class="k">{k}곳</span></div><div class="cos">{cos}</div></div>'
    else:
        rows += f'<div class="row" style="--bg:{bg}"><div class="rh"><span class="mini2">{svg(face_sprout("#F2F3F3", "#315D62", False), "")}</span><b>{nm}</b><span class="k">{k}곳</span></div></div>'
c3 = f"""<section class="sample cb" id="c3"><style>
#c3 .phone .ttl{{top:23.5cqw;right:32cqw;font-size:8.4cqw;text-shadow:.9cqw .9cqw 0 #3E737A}}
#c3 .phone .sub.s1{{top:43cqw}}
#c3 .phone .list{{position:absolute;z-index:3;top:51.5cqw;left:4cqw;right:4cqw;display:flex;flex-direction:column;gap:1.8cqw}}
#c3 .phone .row{{border:.6cqw solid #171615;border-radius:3.2cqw;background:var(--bg);box-shadow:.9cqw .9cqw 0 #171615;color:#171615;overflow:hidden}}
#c3 .phone .rh{{display:flex;align-items:center;gap:2.2cqw;padding:1cqw 3cqw 1cqw 1.6cqw;min-height:11cqw}}
#c3 .phone .mini2 svg{{display:block;width:9cqw;height:9cqw}}
#c3 .phone .rh b{{flex:1;font-size:4.8cqw;font-weight:900}}
#c3 .phone .rh .k{{font-size:5.6cqw;font-weight:900}}
#c3 .phone .open{{box-shadow:.9cqw .9cqw 0 #171615,1.9cqw 1.9cqw 0 #FFFFFF}}
#c3 .phone .open .rh b,#c3 .phone .open .rh .k{{color:#152D30}}
#c3 .phone .cos{{display:flex;flex-wrap:wrap;gap:1.4cqw;padding:0 3cqw 2.6cqw}}
#c3 .phone .co{{padding:.8cqw 2.2cqw;border-radius:2.6cqw;background:#FFFFFF;border:.4cqw solid #171615;font-size:4.2cqw;font-weight:800;color:#152D30}}
#c3 .phone .co.on{{background:#152D30;color:#FFFFFF}}
#c3 .phone .co.more{{background:transparent;border-style:dashed}}
#c3 .phone .rec{{position:absolute;z-index:3;left:4cqw;right:4cqw;top:159.5cqw;margin:0;padding:2cqw 3cqw;border-left:1.2cqw solid #AAC1C5;font-size:4.1cqw;line-height:1.4;font-weight:700;color:#E2E5E6}}
</style>
{head('③', '「꽃 될 회사」를 누르면', [('보이는 것', '오늘 고른 31곳을 업종 여섯으로 — 가장 큰 묶음은 펼쳐서'), ('작은 돌 시계', '싹에서 꽃으로 가는 화살'), ('정직하게', '지난 기록 한 줄을 늘 같이'), ('누르는 곳', '회사 이름을 누르면 그 회사로')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 지금</span>{TOOLS}</div>
<h2 class="ttl">꽃이 될 듯한<br>회사 31곳</h2>
<div class="mini" role="img" aria-label="테마 시계 — 싹에서 꽃으로">{stone_clock('c3k', sec=False, cls='mclock', extra=sprout_to_bloom())}</div>
<p class="sub s1">10월 13일에 지난 기록으로 골랐어요</p>
<div class="list">{rows}</div>
<p class="rec">지난 3년, 이렇게 고른 회사가 꽃이 된 것은 네 번에 한 번쯤이에요. 아무 회사와 큰 차이는 없어요.</p>
{DOCK}{FRAME_END}</div></section>"""

# ④ 회사를 누르면 — 대한과학 + 작은 돌 시계(이 회사 업종이 지금 싹 자리) + 「왜 사?」
c4 = f"""<section class="sample cb" id="c4"><style>
#c4 .phone .ttl{{top:24cqw;right:32cqw;font-size:11cqw;text-shadow:1cqw 1cqw 0 #3E737A}}
#c4 .phone .sub.s1{{top:38cqw;right:32cqw}}
#c4 .phone .card{{position:absolute;z-index:3;top:51cqw;left:4cqw;right:4cqw;height:46cqw;border:.6cqw solid #171615;border-radius:3.4cqw;background:#AAC1C5;box-shadow:1cqw 1cqw 0 #171615;color:#171615;overflow:hidden}}
#c4 .phone .card svg{{position:absolute;left:3cqw;top:5cqw;width:34cqw;height:34cqw}}
#c4 .phone .card .st{{position:absolute;left:41cqw;top:5cqw;padding:.8cqw 2.4cqw;border-radius:2.6cqw;background:#152D30;color:#FFFFFF;font-size:4.2cqw;font-weight:900}}
#c4 .phone .card p{{position:absolute;left:41cqw;right:3cqw;top:15.6cqw;margin:0;font-size:4.4cqw;line-height:1.35;font-weight:800}}
#c4 .phone .whyb{{position:absolute;z-index:3;top:104.5cqw;left:4cqw;right:4cqw;height:46cqw;border:.6cqw solid #171615;border-radius:3.4cqw;background:#1FB8CD;box-shadow:1cqw 1cqw 0 #171615,2.2cqw 2.2cqw 0 #FFFFFF;color:#152D30;overflow:hidden}}
#c4 .phone .whyb b{{position:absolute;left:4cqw;top:3cqw;font-size:16cqw;line-height:1;font-weight:900;letter-spacing:-.6cqw;color:#FFFFFF;-webkit-text-stroke:.5cqw #152D30;text-shadow:1.2cqw 1.2cqw 0 #152D30}}
#c4 .phone .whyb span{{position:absolute;left:4cqw;right:4cqw;bottom:4cqw;font-size:4.6cqw;line-height:1.3;font-weight:900}}
#c4 .phone .whyb i{{position:absolute;right:4cqw;top:5cqw;width:13cqw;height:13cqw;border-radius:50%;background:#FFFFFF;border:.6cqw solid #152D30;font-style:normal;font-size:7cqw;font-weight:900;line-height:11.6cqw;text-align:center;color:#152D30}}
#c4 .phone .later{{position:absolute;z-index:3;top:157.5cqw;left:5cqw;right:5cqw;margin:0;font-size:4.2cqw;line-height:1.4;font-weight:700;color:#AAC1C5}}
</style>
{head('④', '회사를 누르면', [('보이는 것', '회사 한 곳과 4번 「왜 사?」 큰 단추'), ('작은 돌 시계', '이 회사 업종은 지금 싹 자리'), ('멈춤', '사기 전에 열한 가지를 묻고, 한 달 뒤 다시 물어요'), ('세 번', '첫 화면에서 두 번 누르면 여기 · 세 번째가 「왜 사?」')])}
<div class="phone">{FRAME_TOP}
<div class="top"><span class="back">‹ 꽃 될 회사</span>{TOOLS}</div>
<h2 class="ttl">대한과학</h2>
<div class="mini" role="img" aria-label="테마 시계 — 이 회사 업종은 지금 싹 자리">{stone_clock('c4k', sec=False, cls='mclock', extra=here_dot())}</div>
<p class="mcap">지금 싹 자리</p>
<p class="sub s1">바이오 도구·서비스</p>
<div class="card">{svg(face_sprout('#F2F3F3', '#284E53', True), '')}<span class="st">싹 난 회사</span><p>10월 13일에 골랐어요. 고른 뒤 일은 날마다 싹 달력에 남아요.</p></div>
<div class="whyb"><b>왜 사?</b><i>›</i><span>사기 전에 열한 가지만 물어볼게요</span></div>
<p class="later">한 달 뒤에는 「그날 정한 대로 했어?」 하고 다시 물어요</p>
{DOCK}{FRAME_END}</div></section>"""

FR = {'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4}
for k, v in FR.items():
    open(os.path.join(D, k + '.html'), 'w').write(v.replace('<style>', '<style>' + SH, 1))

base = open(os.path.join(D, 'base.css')).read()
pal = json.load(open(os.path.join(D, 'palette.json')))
strip = ''.join(f'<i style="background:{h}"></i>' for h in pal)
EXTRA = """
.sample .why em{display:inline-block;margin-right:8px;padding:0 10px;border-radius:10px;background:#152D30;color:#FFFFFF;font-size:21px;line-height:1.5;font-weight:800}
main>.intro{border:3px solid #000;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px}
main>.intro h1{font-size:32px;line-height:1.25;margin:0;font-weight:900}
main>.intro p{margin:0}
main>.intro .hero{border-radius:16px;background:#152D30;padding:10px 16px}
main>.intro .hero svg{display:block;width:100%;max-width:420px;height:auto;margin:0 auto;overflow:visible}
main>.intro .hero .sec{transform-box:view-box;animation:cb-tick 60s steps(60) infinite}
@media (prefers-reduced-motion:reduce){main>.intro .hero .sec{animation:none}}
.strip{display:flex;height:30px;border-radius:10px;overflow:hidden;border:1px solid #000}
.strip i{flex:1 1 0;min-width:0}
.path{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:21px;font-weight:800}
.path span{padding:4px 12px;border:2px solid #000;border-radius:12px}
.path span.on{background:#1FB8CD}
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
       '노란 바늘 끝, 카톡 노란색, 선물 금빛은 고르신 색 100가지에 없어요. 그래서 하늘청록, 흰색, 밝은 회청색으로 했어요.',
       '이 그림의 시계는 9시 41분에 서 있고 초침만 돌아요. 지금 시각을 가리키는 것은 진짜 사이트 돌 시계처럼 만들 때 붙여요.',
       '「왜 사?」를 누른 뒤 열한 질문 화면은 4번 샘플 그대로 쓸 생각이에요.',
       '숫자는 10월 13일 기록이라 오늘 값이 아니에요.']
page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>돌이 돌 시계 판</title><style>{base}{SH}{EXTRA}</style></head><body><main>
<section class="intro"><h1>돌 시계를 한가운데에 두었어요</h1>
<div class="hero">{stone_clock('hero')}</div>
<p>사장님이 고르신 돌 시계가 첫 화면의 주인공이에요.</p>
<p>네 칸은 시계 둘레에 계절 차례로 놓았어요. 싹은 봄, 꽃은 여름, 시듦은 가을, 잠잠은 겨울이에요.</p>
<div class="path"><span class="on">싹 봄</span><b>›</b><span>꽃 여름</span><b>›</b><span>시듦 가을</span><b>›</b><span>잠잠 겨울</span></div>
<p>맨 위에는 「카톡 보내기」와 「선물 받기」가 모든 화면에 있어요.</p>
<p>다른 화면에는 작은 돌 시계가 지금 어디쯤인지 알려 줘요.</p>
<div class="path"><span>첫 화면</span><b>›</b><span>꽃 될 회사</span><b>›</b><span>회사</span><b>›</b><span>왜 사?</span></div>
<p>「꽃 될 회사」 길로 가면 세 번 만에 「왜 사?」에 닿아요.</p>
<div class="strip">{strip}</div></section>
{c1}{c2}{c3}{c4}
<section class="note"><h2>못 한 것 {len(NOT)}가지</h2><ul>{''.join(f'<li>{x}</li>' for x in NOT)}</ul></section>
<section class="asklast">이 모양으로 진짜 돌이를 만들까요?</section>
<p class="footline">채점표: 화면 넷 모두 금지 말과 색과 글씨 크기를 기계로 검사했어요. 틀림 장부 117건 · 못 한 것 {len(NOT)}가지</p>
<details><summary>근거 펼치기</summary><p>돌 시계: 진짜 사이트 site/media/stone/home-clock.svg 그림과 site/next/stone-clock.js 바늘을 그대로 따라 그리고 색만 고르신 100가지 가운데 가장 가까운 색으로 바꿈</p><p>네 자리: site/next/theme-rule.js zoneOf — 오른쪽 위 꽃 · 오른쪽 아래 시듦 · 왼쪽 위 싹 · 왼쪽 아래 잠잠 · 계절 이름은 site/next/theme-home.js SEASON(싹 봄 · 꽃 여름 · 시듦 가을 · 잠잠 겨울) — 계절 차례로 놓으면 시계 방향</p><p>카톡 보내기 · 선물 받기: site/next/kk-all.js · site/next/app.js 와 같은 이름과 자리</p><p>내용: 10월 13일 기록 — site/next/data/theme-home.json · theme-bloom.json</p><p>앞 판: docs/design/dori-new-2026-10-25 의 combo(2번 + 7번) · combo2(카톡 · 선물)</p></details>
</main></body></html>"""
open(os.path.join(D, 'clock.html'), 'w').write(page)
print('ok', len(page))
