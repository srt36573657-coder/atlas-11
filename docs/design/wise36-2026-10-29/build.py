#!/usr/bin/env python3
# 현명한 서른여섯 명 — 사장님 2026-10-29 01:17 「동양 18명 서양 18명 선정 먼저 … 철학 태도 방식 하나하나 나열」
# 쓰는 법: python3 build.py <wise36.json> <나갈 html> <틀림 장부 건수>
import json, sys, html
d = json.load(open(sys.argv[1], encoding='utf-8'))
out, trust = sys.argv[2], int(sys.argv[3])
E = html.escape
NOT_DONE = [
    '일본과 아랍 사람은 이번에 넣지 않았어요.',
    '동양 쪽에는 여성 인물을 넣지 못했어요.',
    '일화는 여섯 개만 바깥 자료로 다시 확인했어요.',
]
SRC = [
    ('세종 공법 1430년 172,806명 찬반', 'https://www.infogoodman.com/2026/08/sejong-tax-reform-lee-junseok.html'),
    ('이황과 기대승 26년 차이 8년 120여 통', 'https://v.daum.net/v/GCYw1uhDjO'),
    ('다윈 자서전 황금률', 'https://stafforini.com/quotes/darwin-1958-autobiography-charles-darwin-q-1163790d/'),
    ('다빈치 노트 1150번 지혜는 경험의 딸', 'https://www.fromoldbooks.org/R.bak/section-19/item-1150.html'),
    ('아인슈타인 1929년 상상력 말 출처 조사', 'https://quoteinvestigator.com/2013/01/01/einstein-imagination/'),
    ('프랭클린 1772년 장단점 편지', 'https://www.themarginalian.org/2018/11/14/benjamin-franklin-joseph-priestley-pros-cons/'),
    ('묵자 세 잣대 스탠퍼드 철학 사전', 'https://plato.stanford.edu/entries/mohism/'),
    ('정약용 강진 18년 유배', 'https://www.kyeongin.com/article/1682385'),
]
people = d['east'] + d['west']
side_of = {p['n']: ('e' if p in d['east'] else 'w') for p in people}

def chip(p):
    s = side_of[p['n']]
    return (f'<button type="button" class="chip {s}" data-go="p{p["n"]}" aria-label="{p["n"]}번 {E(p["name"])} 칸으로 가기">'
            f'<i aria-hidden="true">{p["n"]}</i>{E(p["short"])}</button>')

rows = []
for era in d['eras']:
    inn = lambda p: era['from'] <= p['ago'] <= era['to']
    es = [p for p in d['east'] if inn(p)]
    ws = [p for p in d['west'] if inn(p)]
    if not es and not ws:
        continue
    lanes = (f'<div class="lane e">{"".join(chip(p) for p in es)}</div>' if es else '') + (f'<div class="lane w">{"".join(chip(p) for p in ws)}</div>' if ws else '')
    num, _, rest = era["label"].partition(' ')
    rows.append(f'<div class="era"><p class="elab">{E(num)}<br>{E(rest)}</p><div class="lanes">{lanes}</div></div>')

def card(p):
    s = side_of[p['n']]
    return (f'<article class="card {s}" id="p{p["n"]}">'
            f'<header><span class="no" aria-hidden="true">{p["n"]}</span><div class="nm"><h3>{E(p["name"])}</h3>'
            f'<p class="when">{E(p["when"])}<span class="key">{E(p["key"])}</span></p></div></header>'
            f'<dl><div class="row r1"><dt>철학</dt><dd>{E(p["phil"])}</dd></div>'
            f'<div class="row r2"><dt>태도</dt><dd>{E(p["att"])}</dd></div>'
            f'<div class="row r3"><dt>방식</dt><dd>{E(p["way"])}</dd></div></dl></article>')

sum_lines = [
    '동양 열여덟 명과 서양 열여덟 명을 골랐어요.',
    '사람마다 철학과 태도와 방식을 한 줄씩 적었어요.',
    '아래 그림에서 이름을 누르면 그 사람 칸으로 가요.',
    '이 서른여섯 명으로 정할까요?',
]
page = f'''<title>현명한 서른여섯 명</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root {{ --bg:#F6F1E7; --card:#FFFDF8; --ink:#1F1A17; --sub:#574A40; --line:#E2D6C3; --east:#A8231B; --west:#1D4A86; --r1:#2E6B4F; --r2:#8A5A12; --r3:#3B5BA5; --flash:#FBE3B0; --badge-ink:#FFFFFF; --etint:#F8E6E2; --wtint:#E3EAF5; color-scheme: light }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#171310; --card:#221C18; --ink:#F3ECE4; --sub:#CDBFB1; --line:#3B322B; --east:#FF8A7E; --west:#8DB6F5; --r1:#7FD1A8; --r2:#F0BE6E; --r3:#A9BEFF; --flash:#4A3A16; --badge-ink:#171310; --etint:#3A2421; --wtint:#1F2A3B; color-scheme: dark }} }}
:root[data-theme="dark"] {{ --bg:#171310; --card:#221C18; --ink:#F3ECE4; --sub:#CDBFB1; --line:#3B322B; --east:#FF8A7E; --west:#8DB6F5; --r1:#7FD1A8; --r2:#F0BE6E; --r3:#A9BEFF; --flash:#4A3A16; --badge-ink:#171310; --etint:#3A2421; --wtint:#1F2A3B; color-scheme: dark }}
* {{ box-sizing: border-box }}
html {{ scroll-behavior: smooth }}
body {{ background: var(--bg); color: var(--ink); font-family: -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 21px; line-height: 1.55; word-break: keep-all; overflow-wrap: anywhere; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px 96px }}
.wrap {{ max-width: 680px; margin: 0 auto; display: grid; gap: 20px }}
h1 {{ font-size: 32px; line-height: 1.25; margin: 6px 0 0; text-wrap: balance }}
h2 {{ font-size: 26px; line-height: 1.3; margin: 18px 0 0; text-wrap: balance; display: flex; align-items: center; gap: 10px }}
h2 .dot {{ width: 14px; height: 14px; border-radius: 3px; display: inline-block }}
h2.e .dot {{ background: var(--east) }} h2.w .dot {{ background: var(--west); border-radius: 50% }}
.sum {{ margin: 0; padding: 14px 16px 14px 42px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; display: grid; gap: 6px }}
.sum li.ask {{ font-weight: 800; color: var(--east) }}
.box {{ background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; display: grid; gap: 6px }}
.box b {{ font-size: 23px }}
.box ol {{ margin: 0; padding-left: 26px; display: grid; gap: 4px }}
.box .note {{ color: var(--sub) }}
/* 때로 본 그림 — 가운데 줄기에 때, 왼쪽 동양 · 오른쪽 서양 */
.ladder {{ background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 12px 8px 16px; display: grid; gap: 4px }}
.lhead {{ display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 0 4px 8px }}
.lhead span {{ font-weight: 800; padding: 2px 12px; border-radius: 999px; border: 2px solid var(--line) }}
.lhead .e {{ color: var(--east); border-color: var(--east) }} .lhead .w {{ color: var(--west); border-color: var(--west) }}
.hint {{ color: var(--sub); margin: 0 4px 4px }}
.era {{ display: grid; grid-template-columns: 100px minmax(0,1fr); gap: 10px; padding: 8px 0; border-top: 1px solid var(--line) }}
.elab {{ margin: 0; color: var(--sub); font-weight: 700; line-height: 1.3; padding-top: 8px; position: relative; padding-left: 12px; word-break: keep-all; overflow-wrap: normal }}
.elab::before {{ content: ""; position: absolute; left: 1px; top: 16px; width: 8px; height: 8px; border-radius: 50%; background: var(--sub) }}
.lanes {{ display: grid; gap: 6px; min-width: 0 }}
.lane {{ display: flex; flex-wrap: wrap; gap: 6px; padding: 5px; border-radius: 12px; min-width: 0 }}
.lane.e {{ background: var(--etint) }} .lane.w {{ background: var(--wtint) }}
.chip {{ font: inherit; font-size: 21px; line-height: 1.2; min-height: 44px; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px 5px 5px; border-radius: 999px; background: var(--card); color: var(--ink); border: 2px solid var(--line); cursor: pointer; max-width: 100%; white-space: nowrap }}
.chip i {{ font-style: normal; font-size: 21px; font-weight: 800; min-width: 30px; height: 30px; display: inline-grid; place-items: center; border-radius: 7px; color: var(--badge-ink) }}
.chip.e {{ border-color: var(--east) }} .chip.e i {{ background: var(--east) }}
.chip.w {{ border-color: var(--west) }} .chip.w i {{ background: var(--west); border-radius: 50% }}
.chip:focus-visible {{ outline: 3px solid var(--ink); outline-offset: 2px }}
/* 사람 칸 */
.cards {{ display: grid; gap: 14px }}
.card {{ background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px 16px; display: grid; gap: 10px; scroll-margin-top: 12px; border-top: 6px solid var(--line) }}
.card.e {{ border-top-color: var(--east) }} .card.w {{ border-top-color: var(--west) }}
.card.flash {{ animation: flash 1.6s ease-out }}
@keyframes flash {{ 0% {{ background: var(--flash) }} 100% {{ background: var(--card) }} }}
@media (prefers-reduced-motion: reduce) {{ html {{ scroll-behavior: auto }} .card.flash {{ animation: none; outline: 3px solid var(--flash) }} }}
.card header {{ display: grid; grid-template-columns: auto minmax(0,1fr); gap: 12px; align-items: start }}
.no {{ width: 44px; height: 44px; display: grid; place-items: center; font-weight: 800; font-size: 21px; color: var(--badge-ink) }}
.card.e .no {{ background: var(--east); border-radius: 8px }}
.card.w .no {{ background: var(--west); border-radius: 50% }}
.nm h3 {{ margin: 0; font-size: 26px; line-height: 1.25 }}
.nm .when {{ margin: 2px 0 0; color: var(--sub); display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center }}
.key {{ font-weight: 700; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); color: var(--ink); white-space: nowrap }}
dl {{ margin: 0; display: grid; gap: 8px }}
.row {{ display: grid; grid-template-columns: 64px minmax(0,1fr); gap: 10px; align-items: baseline }}
dt {{ font-weight: 800; display: flex; align-items: center; gap: 6px }}
dt::before {{ content: ""; width: 10px; height: 10px; border-radius: 2px; flex: none }}
.r1 dt::before {{ background: var(--r1) }} .r2 dt::before {{ background: var(--r2) }} .r3 dt::before {{ background: var(--r3) }}
dd {{ margin: 0; min-width: 0 }}
.src {{ font-size: 17px; color: var(--sub); background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px }}
.src ul {{ margin: 6px 0 0; padding-left: 20px; display: grid; gap: 4px }}
.src a {{ color: var(--west) }}
footer {{ font-weight: 700; color: var(--sub); text-align: center }}
.top[hidden] {{ display: none }}
.top {{ position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); font: inherit; font-size: 21px; font-weight: 800; min-height: 48px; padding: 8px 18px; border-radius: 999px; border: 2px solid var(--ink); background: var(--card); color: var(--ink); cursor: pointer }}
</style>
<div class="wrap">
<h1>현명한 서른여섯 명</h1>
<ol class="sum">{"".join(f'<li{" class=\"ask\"" if i == len(sum_lines) - 1 else ""}>{E(x)}</li>' for i, x in enumerate(sum_lines))}</ol>
<div class="box"><b>고른 잣대 셋</b><ol>{"".join(f"<li>{E(x)}</li>" for x in d["pick"])}</ol><p class="note" style="margin:0">노자와 손자는 산 때가 분명하지 않아요.</p></div>
<h2 id="map">때로 본 그림</h2>
<div class="ladder" role="group" aria-label="서른여섯 명이 산 때">
<div class="lhead"><span class="e">네모는 동양</span><span class="w">동그라미는 서양</span></div>
<p class="hint">이름을 누르면 그 사람 칸으로 가요.</p>
{"".join(rows)}
</div>
<h2 class="e"><span class="dot" aria-hidden="true"></span>동양 열여덟 명</h2>
<div class="cards">{"".join(card(p) for p in d["east"])}</div>
<h2 class="w"><span class="dot" aria-hidden="true"></span>서양 열여덟 명</h2>
<div class="cards">{"".join(card(p) for p in d["west"])}</div>
<div class="box"><b>못 한 것</b><ol>{"".join(f"<li>{E(x)}</li>" for x in NOT_DONE)}</ol></div>
<div class="src">출처: 다시 확인한 일화 여섯과 잣대 둘<ul>{"".join(f'<li><a href="{E(u)}" target="_blank" rel="noopener">{E(t)}</a></li>' for t, u in SRC)}</ul></div>
<footer>틀림 장부 {trust}건 · 못 한 것 {len(NOT_DONE)}가지</footer>
</div>
<button type="button" class="top" id="top" hidden>그림으로</button>
<script>
document.querySelectorAll('.chip').forEach(function (b) {{
  b.addEventListener('click', function () {{
    var c = document.getElementById(b.getAttribute('data-go'));
    if (!c) return;
    c.scrollIntoView({{ block: 'start' }});
    c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
  }});
}});
var topBtn = document.getElementById('top'), lad = document.querySelector('.ladder');
function syncTop() {{ var r = lad.getBoundingClientRect(); topBtn.hidden = r.bottom > 0; }}
window.addEventListener('scroll', syncTop, {{ passive: true }}); syncTop();
topBtn.addEventListener('click', function () {{
  var m = document.getElementById('map'); if (m) m.scrollIntoView({{ block: 'start' }});
}});
</script>
'''
open(out, 'w', encoding='utf-8').write(page)
print(out, len(page), 'not_done', len(NOT_DONE))
