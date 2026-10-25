#!/usr/bin/env python3
# 2번(네 칸 판화)을 가운데 + 7번(아이폰 첫 화면) 단추를 합친 판 — 화면 넷(첫 화면 · 싹 업종 · 꽃 될 회사 · 회사 한 곳)
# 사장님 2026-10-25 21:22 「그러면 2번을 중심으로 7번하고 조화롭게 효율적으로 다시 만들어봐」
# 둘째 판 — 21:51 「그래 좋은디 카톡하고 선물하기가 안보여 그럿 까지 추가해서 다시 만들어봐」
#   진짜 사이트에 이미 있는 것과 같게: 모든 쪽 맨 위 「카톡 보내기」 + 「선물 받기」(site/next/kk-all.js pageRow · app.js 위 막대 선물 단추)
#   · 칸이 여럿인 쪽은 칸마다 「카톡 보내기」 하나 더(kk-all.js ② 칸) · 색은 고르신 100가지 안에서(카톡 노랑 · 선물 금빛은 그 안에 없음)
import os, json, html
D = os.path.dirname(os.path.abspath(__file__))

SHARED = """
.cb .phone{background:#152D30}
.cb .phone .wall{position:absolute;inset:0;z-index:0;background:radial-gradient(rgba(170,193,197,.09) .3cqw,transparent .42cqw) 0 0/2.2cqw 2.2cqw,radial-gradient(ellipse 110cqw 90cqw at 50% 78%,#27666E 0%,#1D5962 22%,#1A4850 42%,#17363B 62%,#152D30 80%,#171615 100%)}
.cb .phone .top{position:absolute;z-index:4;top:12cqw;left:4.6cqw;right:4cqw;display:flex;align-items:center;justify-content:space-between;gap:2cqw}
.cb .phone .mark{font-size:8.4cqw;font-weight:900;line-height:1;letter-spacing:-.2cqw;color:#FFFFFF;text-shadow:.8cqw .8cqw 0 #4E99A3}
.cb .phone .date{font-size:4cqw;font-weight:700;color:#AAC1C5}
.cb .phone .back{font-size:4.2cqw;font-weight:800;color:#AAC1C5;white-space:nowrap}
/* 맨 위 두 단추 — 카톡 보내기(흰색 · 제일 밝게) · 선물 받기(밝은 회청) */
.cb .phone .tools{display:flex;gap:1.8cqw;flex:none}
.cb .phone .tb{display:inline-flex;align-items:center;gap:1cqw;height:10cqw;margin:0;padding:0 2cqw 0 1.2cqw;border:.5cqw solid #171615;border-radius:5cqw;font:inherit;font-size:4.4cqw;font-weight:900;line-height:1;white-space:nowrap;color:#171615;box-shadow:.8cqw .8cqw 0 #171615;cursor:pointer}
.cb .phone .tb svg{display:block;width:7cqw;height:7cqw;flex:none}
.cb .phone .tb.kk{background:#FFFFFF}
.cb .phone .tb.gift{background:#AAC1C5}
.cb .phone .ttl{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-weight:900;color:#FFFFFF;line-height:1.08;letter-spacing:-.2cqw}
.cb .phone .sub{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:4.2cqw;line-height:1.35;font-weight:700;color:#AAC1C5}
/* 2번 네 칸 */
.cb .phone .four{position:absolute;z-index:3;left:4cqw;right:4cqw;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2.6cqw}
.cb .phone .p{position:relative;display:block;margin:0;padding:0;border:.6cqw solid #171615;border-radius:3.2cqw;font:inherit;text-align:left;background:var(--bg);color:var(--ink);box-shadow:1cqw 1cqw 0 #171615;isolation:isolate;overflow:hidden}
.cb .phone .p::before{content:"";position:absolute;inset:0;z-index:-1;background-image:radial-gradient(circle,var(--dot) 0 34%,transparent 39%);background-size:2.4cqw 2.4cqw;opacity:.55}
.cb .phone .p .nm{position:absolute;left:3cqw;top:2.4cqw;font-size:7cqw;line-height:1;font-weight:900;letter-spacing:-.15cqw}
.cb .phone .p .art{position:absolute;right:1.4cqw;top:1.6cqw;width:24cqw;height:24cqw;overflow:visible}
.cb .phone .p .n{position:absolute;left:2.6cqw;bottom:2.4cqw;font-size:19cqw;line-height:.8;font-weight:900;letter-spacing:-1cqw;text-shadow:1cqw 1cqw 0 var(--off)}
.cb .phone .p .n small{font-size:5.4cqw;letter-spacing:0;margin-left:.6cqw;text-shadow:.5cqw .5cqw 0 var(--off)}
.cb .phone .p.on{box-shadow:1cqw 1cqw 0 #171615,2.2cqw 2.2cqw 0 #FFFFFF;z-index:1}
.cb .phone .sway{transform-box:view-box;transform-origin:51.5% 24%;animation:cb-sway 3.2s ease-in-out infinite}
@keyframes cb-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@media (prefers-reduced-motion:reduce){.cb .phone .sway{animation:none}}
/* 7번 그림 단추 */
.cb .phone .apps{position:absolute;z-index:3;left:4cqw;right:4cqw;display:grid;grid-template-columns:repeat(4,1fr)}
.cb .phone .app{display:flex;flex-direction:column;align-items:center;min-width:0;position:relative}
.cb .phone .ic{position:relative;display:block;width:16.6cqw;height:16.6cqw;border-radius:4.2cqw;border:.6cqw solid #171615;background:var(--bg);box-shadow:.9cqw .9cqw 0 #171615;overflow:hidden}
.cb .phone .ic svg{display:block;width:100%;height:100%}
.cb .phone .ic.ht{background-image:radial-gradient(rgba(23,22,21,.16) 28%,transparent 33%);background-size:1.6cqw 1.6cqw}
.cb .phone .lb{margin-top:1.6cqw;font-size:4cqw;font-weight:800;line-height:1.2;color:#F2F3F3;white-space:nowrap;text-shadow:0 .3cqw .8cqw #171615}
.cb .phone .badge{position:absolute;top:-1.6cqw;right:1.2cqw;min-width:7.6cqw;height:7.6cqw;padding:0 1.2cqw;border-radius:3.8cqw;background:#FFFFFF;color:#152D30;border:.5cqw solid #171615;font-size:4.2cqw;font-weight:900;line-height:6.6cqw;text-align:center;z-index:2}
.cb .phone .dock{position:absolute;z-index:2;left:0;right:0;bottom:0;height:33cqw;background:rgba(170,193,197,.16);border-top:.5cqw solid rgba(242,243,243,.3)}
.cb .phone .dock .apps{top:4.2cqw}
.cb .phone .g{fill:none;stroke:#171615;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.cb .phone .gf{fill:#171615;stroke:none}
.cb .phone .hint{position:absolute;z-index:3;left:5cqw;right:5cqw;margin:0;font-size:4.4cqw;line-height:1.3;font-weight:800;color:#E2E5E6}
"""

# 싹 난 조약돌 얼굴 넷(2번에서 가져옴)
PEB = 'M10 63C10 45 26 35 49 35C73 35 90 46 90 64C90 81 73 90 50 90C27 90 10 81 10 63Z'
LEAF = 'M51 25C45 13 33 10 26 15C31 24 41 29 51 25ZM52 23C57 10 69 6 77 10C72 21 62 26 52 23Z'
def face_sprout(body='#F2F3F3', leaf='#284E53', sway=True):
    g = f'<g class="sway">' if sway else '<g>'
    return (f'<path d="{PEB}" fill="{body}" transform="translate(-4 3)"/>{g}<path d="{LEAF}" fill="{leaf}" transform="translate(3 -2.5)"/>'
            f'<path d="{LEAF}" fill="none" stroke="#171615" stroke-width="3.4" stroke-linejoin="round"/></g>'
            f'<g fill="none" stroke="#171615" stroke-linecap="round" stroke-linejoin="round"><path d="{PEB}" stroke-width="4.4"/><path d="M50 36C50 31 50.5 27 51.5 23" stroke-width="4"/><path d="M44 72Q50 77 56 72" stroke-width="3.4"/></g>'
            f'<g fill="#171615"><ellipse cx="38" cy="61" rx="3.6" ry="4.8"/><ellipse cx="61" cy="61" rx="3.6" ry="4.8"/></g>')
FACE_BLOOM = (f'<path d="{PEB}" fill="#4E99A3" transform="translate(3.5 3)"/>'
    '<path d="M50 31C44 25 37 25 33 28C37 33 44 34 50 31ZM50 29C56 23 63 23 67 26C63 31 56 32 50 29Z" fill="#315D62" transform="translate(-2 2)"/>'
    '<g fill="#FFFFFF" transform="translate(-2.5 2)"><circle cx="50" cy="6" r="5.2"/><circle cx="56.7" cy="10.8" r="5.2"/><circle cx="54.1" cy="18.7" r="5.2"/><circle cx="45.9" cy="18.7" r="5.2"/><circle cx="43.3" cy="10.8" r="5.2"/></g>'
    f'<g fill="none" stroke="#171615" stroke-linecap="round" stroke-linejoin="round"><path d="{PEB}" stroke-width="4.4"/><path d="M50 36V20" stroke-width="3.6"/>'
    '<path d="M50 31C44 25 37 25 33 28C37 33 44 34 50 31ZM50 29C56 23 63 23 67 26C63 31 56 32 50 29Z" stroke-width="3"/>'
    '<g stroke-width="2.8"><circle cx="50" cy="6" r="5.2"/><circle cx="56.7" cy="10.8" r="5.2"/><circle cx="54.1" cy="18.7" r="5.2"/><circle cx="45.9" cy="18.7" r="5.2"/><circle cx="43.3" cy="10.8" r="5.2"/></g>'
    '<path d="M33 63Q38 56.5 43 63M56 63Q61 56.5 66 63" stroke-width="3.4"/><path d="M42 70Q50 79 58 70" stroke-width="3.4"/></g><circle cx="50" cy="13" r="3.6" fill="#171615"/>')
# 시든 얼굴 — 처진 잎을 크게(2번의 아쉬운 점: 작아서 안 보임)
FACE_WILT = (f'<path d="{PEB}" fill="#D6D5D4" transform="translate(-3.5 3)"/>'
    '<path d="M50 36C50 26 56 19 64 19C70 19 74 24 75 31C69 33 63 31 60 26C58 31 56 35 54 37Z" fill="#3C4E51" transform="translate(2.5 2.5)"/>'
    f'<g fill="none" stroke="#171615" stroke-linecap="round" stroke-linejoin="round"><path d="{PEB}" stroke-width="4.4"/>'
    '<path d="M50 36C50 26 56 19 64 19C70 19 74 24 75 31C69 33 63 31 60 26C58 31 56 35 54 37Z" stroke-width="3.4"/>'
    '<path d="M33 60L43 63M56 63L66 60" stroke-width="3.6"/><path d="M44 75Q50 69 56 75" stroke-width="3.4"/></g>')
FACE_SLEEP = (f'<path d="{PEB}" fill="#AAC1C5" transform="translate(3 3)"/>'
    '<g fill="#E2E5E6" transform="translate(-1.5 1.5)"><circle cx="74" cy="27" r="3"/><circle cx="82" cy="17" r="4"/><circle cx="91" cy="6" r="5"/></g>'
    f'<g fill="none" stroke="#171615" stroke-linecap="round" stroke-linejoin="round"><path d="{PEB}" stroke-width="4.4"/>'
    '<path d="M33 60Q38 65.5 43 60M56 60Q61 65.5 66 60" stroke-width="3.4"/><path d="M47 72Q50 74.5 53 72" stroke-width="3.2"/>'
    '<g stroke-width="2.6"><circle cx="74" cy="27" r="3"/><circle cx="82" cy="17" r="4"/><circle cx="91" cy="6" r="5"/></g></g>')

def svg(inner, cls='art'):
    return f'<svg class="{cls}" viewBox="0 0 100 100" aria-hidden="true">{inner}</svg>'

# 그림 단추 글자 그림(독창 · 단순)
GL = {
 'bloom': svg(face_sprout('#FFFFFF', '#315D62', False).replace('M44 72Q50 77 56 72', 'M42 70Q50 79 58 70'), ''),
 'search': '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="44" cy="44" r="20" fill="#F2F3F3" transform="translate(3 3)"/><circle class="g" cx="44" cy="44" r="20" style="stroke-width:6"/><path class="g" d="M59 59L76 76" style="stroke-width:8"/></svg>',
 'cal': '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="28" width="56" height="50" rx="6" fill="#F2F3F3" transform="translate(3 3)"/><rect class="g" x="22" y="28" width="56" height="50" rx="6" style="stroke-width:5"/><path class="g" d="M22 42H78M36 22V32M64 22V32" style="stroke-width:5"/><rect class="gf" x="31" y="50" width="9" height="9" rx="2"/><rect x="45.5" y="50" width="9" height="9" rx="2" fill="#1FB8CD" stroke="#171615" stroke-width="2"/><rect class="gf" x="60" y="50" width="9" height="9" rx="2"/><rect class="gf" x="31" y="63" width="9" height="9" rx="2"/></svg>',
 'gift': '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="24" y="42" width="52" height="36" rx="4" fill="#F2F3F3" transform="translate(3 3)"/><rect class="g" x="24" y="42" width="52" height="36" rx="4" style="stroke-width:5"/><rect class="g" x="20" y="32" width="60" height="12" rx="3" style="stroke-width:5"/><path class="g" d="M50 32V78" style="stroke-width:5"/><path class="g" d="M50 32C44 20 32 22 36 30C38 33 46 33 50 32ZM50 32C56 20 68 22 64 30C62 33 54 33 50 32Z" style="stroke-width:4"/></svg>',
 'why': '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="48" r="28" fill="#F2F3F3" transform="translate(3 3)"/><circle class="g" cx="50" cy="48" r="28" style="stroke-width:5"/><path class="g" d="M40 40C40 31 60 30 60 41C60 49 50 49 50 57" style="stroke-width:6.5"/><circle class="gf" cx="50" cy="67" r="4"/></svg>',
 'month': '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M32 22H68M32 78H68M36 22C36 40 64 42 64 50C64 58 36 60 36 78M64 22C64 40 36 42 36 50C36 58 64 60 64 78" fill="none" stroke="#F2F3F3" stroke-width="7" transform="translate(3 3)"/><path class="g" d="M32 22H68M32 78H68M36 22C36 40 64 42 64 50C64 58 36 60 36 78M64 22C64 40 36 42 36 50C36 58 64 60 64 78" style="stroke-width:5"/><path class="gf" d="M40 72Q50 62 60 72Z"/></svg>',
 'record': '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="24" y="22" width="52" height="58" rx="5" fill="#F2F3F3" transform="translate(3 3)"/><rect class="g" x="24" y="22" width="52" height="58" rx="5" style="stroke-width:5"/><path class="g" d="M33 64L44 52L53 58L67 38" style="stroke-width:5"/><circle class="gf" cx="67" cy="38" r="4"/><path class="g" d="M33 32H55" style="stroke-width:4"/></svg>',
 'dori': svg(face_sprout('#F2F3F3', '#284E53', False), ''),
 'help': '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 56V48C26 34 37 24 50 24C63 24 74 34 74 48V56" fill="none" stroke="#F2F3F3" stroke-width="7" transform="translate(3 3)"/><path class="g" d="M26 56V48C26 34 37 24 50 24C63 24 74 34 74 48V56" style="stroke-width:5.5"/><rect x="18" y="50" width="16" height="24" rx="6" fill="#F2F3F3" stroke="#171615" stroke-width="5"/><rect x="66" y="50" width="16" height="24" rx="6" fill="#F2F3F3" stroke="#171615" stroke-width="5"/><path class="g" d="M74 74C74 82 66 84 57 84" style="stroke-width:4.5"/><rect class="gf" x="45" y="80" width="13" height="8" rx="4"/></svg>',
}
# 카톡 말풍선(글 없이 모양만 · 색은 100가지 안)
KK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 16C27 16 9 30 9 48C9 60 17 70 29 75L25 90L42 79C44.6 79.4 47.3 79.6 50 79.6C73 79.6 91 65.6 91 48C91 30 73 16 50 16Z" fill="#171615"/></svg>'
# 맨 위 두 단추 — 모든 화면 같은 자리(진짜 사이트의 「카톡 보내기」 · 「선물 받기」와 같은 이름)
TOOLS = ('<span class="tools"><button class="tb kk" type="button" aria-label="이 화면을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'
         '<button class="tb gift" type="button" aria-label="선물 받기 방으로">' + GL['gift'] + '선물 받기</button></span>')
# 칸 하나를 보내는 작은 카톡 단추(칸이 여럿인 화면)
KKC = '<button class="kkc" type="button" aria-label="이 칸을 카톡 친구에게 보내기">' + KK + '카톡 보내기</button>'

def app(label, glyph, bg, badge=None, ht=True):
    b = f'<span class="badge">{badge}</span>' if badge else ''
    return f'<div class="app">{b}<span class="ic{" ht" if ht else ""}" style="--bg:{bg}">{GL[glyph]}</span><span class="lb">{label}</span></div>'

DOCK = ('<div class="dock"><div class="apps">' + app('왜 사?', 'why', '#4E99A3') + app('한 달 뒤', 'month', '#3E737A') +
        app('지난 기록', 'record', '#356369') + app('돌이', 'dori', '#AAC1C5') + '</div></div>')
FRAME_TOP = '<div class="wall"></div><div class="island"></div><div class="status"><span>9:41</span><span>●●●</span></div>'
FRAME_END = '<div class="homebar"></div>'

def head(n, name, lines):
    return (f'<div class="head"><span class="no"><b>{n}</b>{name}</span>' +
            ''.join(f'<p class="why"><em>{k}</em> {v}</p>' for k, v in lines) + '</div>')

# ① 첫 화면
