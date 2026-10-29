#!/usr/bin/env python3
# 세 사람의 눈으로 본 둘이 — 사장님 2026-10-29 10:41 「어」(물음 「이 세 사람 방식으로 둘이를 다시 볼까요?」) · 덩샤오핑 · 리콴유 · 퍼스
import html, json, sys
E = html.escape
OUT, TRUST = sys.argv[1], int(sys.argv[2])
# 잰 숫자 — 진화 방 읽기 reports/atlas11/jinhwa/20261027-2332.json(진짜 사이트 /api/tally/sum · 10월 14일 ~ 27일)
DAYS = ['10.14', '10.15', '10.16', '10.17', '10.18', '10.19', '10.20', '10.21', '10.22', '10.23', '10.24', '10.25', '10.26', '10.27']
STOP = [0, 0, 0, 0, 0, 16, 3, 6, 1, 0, 0, 0, 0, 1]
REST = [0, 0, 0, 0, 0, 4, 2, 4, 0, 0, 0, 0, 0, 1]
assert sum(STOP) == 27 and sum(REST) == 11

def bars():
    W, H, L, B, T = 340, 190, 8, 34, 26
    bw = (W - L * 2) / len(DAYS); mx = max(STOP)
    out = [f'<svg class="chart" viewBox="0 0 {W} {H}" role="img" aria-label="날마다 질문 열한 개를 끝낸 수와 쉬어 간 수 · 모두 27번 · 쉬어 간 수 11번">']
    for i, (s, r) in enumerate(zip(STOP, REST)):
        x = L + i * bw + bw * 0.15; w = bw * 0.7; hs = (s / mx) * (H - T - B); hr = (r / mx) * (H - T - B)
        if s: out.append(f'<rect class="b-stop" x="{x:.1f}" y="{H - B - hs:.1f}" width="{w:.1f}" height="{hs:.1f}" rx="2"/>')
        if r: out.append(f'<rect class="b-rest" x="{x:.1f}" y="{H - B - hr:.1f}" width="{w:.1f}" height="{hr:.1f}" rx="2"/>')
        if s: out.append(f'<text class="v" x="{x + w / 2:.1f}" y="{H - B - hs - 5:.1f}" text-anchor="middle">{s}</text>')
        if i in (0, 5, 13): anc = 'start' if i == 0 else 'end' if i == 13 else 'middle'; out.append(f'<text class="d" x="{(x if i == 0 else x + w if i == 13 else x + w / 2):.1f}" y="{H - 10}" text-anchor="{anc}">{DAYS[i]}</text>')
    out.append(f'<line class="axis" x1="{L}" y1="{H - B}" x2="{W - L}" y2="{H - B}"/></svg>')
    return ''.join(out)

def pair_bars():
    rows = [('고를 때 쓴 기간', 30, 23), ('고를 때 안 쓴 기간', 32, 25), ('최근 두 달', 23, 25)]
    W, rowH = 340, 92; H = rowH * len(rows) + 4; x0 = 0; sc = (W - 52) / 34
    out = [f'<svg class="chart" viewBox="0 0 {W} {H}" role="img" aria-label="100번 고르면 시장보다 5% 넘게 더 오른 횟수 · 고를 때 쓴 기간 30 대 23 · 안 쓴 기간 32 대 25 · 최근 두 달 23 대 25">']
    for i, (t, a, b) in enumerate(rows):
        y = 2 + i * rowH
        out.append(f'<text class="rl" x="0" y="{y + 22}">{E(t)}</text>')
        out.append(f'<rect class="b-me" x="{x0}" y="{y + 32}" width="{a * sc:.1f}" height="22" rx="3"/><text class="v" x="{x0 + a * sc + 8:.1f}" y="{y + 50}">{a}</text>')
        out.append(f'<rect class="b-all" x="{x0}" y="{y + 60}" width="{b * sc:.1f}" height="22" rx="3"/><text class="v" x="{x0 + b * sc + 8:.1f}" y="{y + 78}">{b}</text>')
    out.append('</svg>')
    return ''.join(out)

P = [
 {'who': '덩샤오핑', 'ask': '쥐를 잡는가?', 'color': 'c1',
  'fact': [('27번', '14일 동안 질문 열한 개를 끝낸 수'), ('16번', '그 가운데 10월 19일 하루'), ('11건', '10월 28일 하루에 고친 주문 수')],
  'see': ['둘이의 쥐는 사기 전에 멈춘 사람이에요.', '끝낸 사람 열 명 중 네 명은 쉬어 가기를 골랐어요.', '쓰는 사람이 늘었는지는 재기 전에 또 바꿨어요.'],
  'do': '첫 화면은 두 주 그대로 두고 친구 열 명에게만 보내 재요.'},
 {'who': '리콴유', 'ask': '이게 되는가?', 'color': 'c2',
  'fact': [('0곳', '진짜 사이트 138쪽 가운데 걸린 곳'), ('2.2초', '느린 휴대폰 첫 화면 그려짐'), ('0번', '한 달 뒤 답한 수')],
  'see': ['돌아가는 것은 숫자로 확인했어요.', '진 숫자도 숨기지 않고 보여요.', '한 달 뒤 답은 11월 중순에야 처음 나와요.'],
  'do': '잣대 넷만 매주 카톡 보고에 붙이고 방문 수는 쓰지 않아요.'},
 {'who': '퍼스', 'ask': '틀릴 수 있는가?', 'color': 'c3',
  'fact': [('365개', '고르는 조건 후보 수'), ('32 대 25', '고를 때 안 쓴 기간'), ('23 대 25', '최근 두 달')],
  'see': ['고를 때 안 쓴 기간에도 앞섰어요.', '그런데 최근 두 달은 졌어요.', '틀릴 수 있다는 신호예요.'],
  'do': '10월 27일 뒤 새 날만 따로 채점하고 합격선을 미리 적어요.'},
]
TOP3 = [('첫 화면 두 주 그대로', '덩샤오핑과 리콴유', '바꾸기 전에 먼저 재요.'),
        ('잣대 넷 매주 보고', '리콴유', '끝냄, 쉬어 감, 한 달 답, 정한 대로예요.'),
        ('새 날만 따로 채점', '퍼스', '합격선을 미리 적고 바꾸지 않아요.')]
NOT_DONE = ['10월 28일 뒤 쓰는 수는 아직 못 읽었어요.', '쓰는 분들께 직접 묻지는 못했어요.', '세 사람 판단은 알려진 말과 일로 짐작했어요.']

def card(p):
    facts = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span></li>' for a, b in p['fact'])
    see = ''.join(f'<li>{E(x)}</li>' for x in p['see'])
    return (f'<article class="card {p["color"]}"><header><h3>{E(p["who"])}</h3><p class="ask">{E(p["ask"])}</p></header>'
            f'<ul class="facts">{facts}</ul><ol class="see">{see}</ol><p class="do"><b>바꿀 것 하나</b><span>{E(p["do"])}</span></p></article>')

page = f'''<title>세 사람이 본 둘이</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root {{ --bg:#F7EEF1; --card:#FFFBFC; --ink:#2A1420; --sub:#5E3446; --line:#EBC0CE; --c1:#A8231B; --c2:#1D4A86; --c3:#2E6B4F; --me:#A31F70; --all:#9C8A92; --rest:#E39BB9; color-scheme: light }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#1A1116; --card:#25181F; --ink:#F6E9EF; --sub:#D9BFCB; --line:#4A2E3B; --c1:#FF8A7E; --c2:#8DB6F5; --c3:#7FD1A8; --me:#F07AB9; --all:#B9A9B0; --rest:#9C4E72; color-scheme: dark }} }}
:root[data-theme="dark"] {{ --bg:#1A1116; --card:#25181F; --ink:#F6E9EF; --sub:#D9BFCB; --line:#4A2E3B; --c1:#FF8A7E; --c2:#8DB6F5; --c3:#7FD1A8; --me:#F07AB9; --all:#B9A9B0; --rest:#9C4E72; color-scheme: dark }}
* {{ box-sizing: border-box }}
body {{ background: var(--bg); color: var(--ink); font-family: -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 21px; line-height: 1.55; word-break: keep-all; overflow-wrap: anywhere; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px 40px }}
.wrap {{ max-width: 680px; margin: 0 auto; display: grid; gap: 18px }}
h1 {{ font-size: 31px; line-height: 1.25; margin: 6px 0 0; text-wrap: balance }}
h2 {{ font-size: 25px; margin: 14px 0 0; text-wrap: balance }}
.sum {{ margin: 0; padding: 14px 16px 14px 42px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; display: grid; gap: 6px }}
.sum li.ask {{ font-weight: 800; color: var(--me) }}
.panel {{ background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 14px 14px 10px; display: grid; gap: 8px }}
.panel b.t {{ font-size: 23px }}
.chart {{ width: 100%; height: auto; display: block }}
.chart text {{ font-size: 21px; fill: var(--ink) }} .chart text.d {{ fill: var(--sub) }} .chart text.rl {{ font-size: 21px; font-weight: 700 }}
.chart .b-stop, .chart .b-me {{ fill: var(--me) }} .chart .b-rest {{ fill: var(--rest) }} .chart .b-all {{ fill: var(--all) }} .chart .axis {{ stroke: var(--line); stroke-width: 2 }}
.legend {{ display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0; padding: 0; list-style: none; color: var(--sub) }}
.legend li {{ display: flex; align-items: center; gap: 8px }} .legend i {{ width: 16px; height: 16px; border-radius: 4px; display: inline-block }}
.cards {{ display: grid; gap: 14px }}
.card {{ background: var(--card); border: 1px solid var(--line); border-top: 6px solid var(--line); border-radius: 18px; padding: 14px 16px 16px; display: grid; gap: 10px }}
.card.c1 {{ border-top-color: var(--c1) }} .card.c2 {{ border-top-color: var(--c2) }} .card.c3 {{ border-top-color: var(--c3) }}
.card header {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px }}
.card h3 {{ margin: 0; font-size: 27px }}
.card .ask {{ margin: 0; font-weight: 800 }}
.card.c1 .ask {{ color: var(--c1) }} .card.c2 .ask {{ color: var(--c2) }} .card.c3 .ask {{ color: var(--c3) }}
.facts {{ margin: 0; padding: 0; list-style: none; display: grid; gap: 6px }}
.facts li {{ display: grid; grid-template-columns: 116px minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 8px 12px; border-radius: 12px; background: var(--bg); min-width: 0 }}
.facts b {{ font-size: 25px; line-height: 1.15; white-space: nowrap }} .facts span {{ color: var(--sub); line-height: 1.35 }}
.see {{ margin: 0; padding-left: 26px; display: grid; gap: 4px }}
.do {{ margin: 0; display: grid; gap: 2px; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line) }}
.card.c1 .do {{ border-color: var(--c1) }} .card.c2 .do {{ border-color: var(--c2) }} .card.c3 .do {{ border-color: var(--c3) }}
.top {{ margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; counter-reset: k }}
.top li {{ display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; align-items: start; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px }}
.top li::before {{ counter-increment: k; content: counter(k); width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--me); color: #FFFFFF; font-weight: 900 }}
.top b {{ display: block; font-size: 23px }} .top small {{ display: block; font-size: 21px; color: var(--sub) }}
.miss {{ background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px }} .miss ol {{ margin: 6px 0 0; padding-left: 26px }}
.src summary {{ font-size: 21px; font-weight: 700; color: var(--ink); min-height: 44px; display: flex; align-items: center; cursor: pointer }}
.src {{ font-size: 17px; color: var(--sub); background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px }} .src ul {{ margin: 6px 0 0; padding-left: 20px }}
footer {{ font-weight: 700; color: var(--sub); text-align: center }}

</style>
<div class="wrap">
<h1>덩샤오핑, 리콴유, 퍼스가 본 둘이</h1>
<ol class="sum">
<li>사이트는 잘 돌아가지만 쓰는 사람은 아직 적어요.</li>
<li>바꾸는 날은 많고 잰 날은 적었어요.</li>
<li>셋이 함께 고른 첫 세 가지를 맨 아래에 적었어요.</li>
<li class="ask">이 셋부터 할까요?</li>
</ol>
<h2>쥐를 잡는가</h2>
<div class="panel"><b class="t">날마다 질문 열한 개를 끝낸 수</b>{bars()}
<ul class="legend"><li><i style="background:var(--me)"></i>끝냄</li><li><i style="background:var(--rest)"></i>그중 쉬어 가기</li></ul></div>
<h2>세 사람의 눈</h2>
<div class="cards">{"".join(card(p) for p in P)}</div>
<div class="panel"><b class="t">100번 고르면 몇 번 더 올랐나</b>{pair_bars()}
<ul class="legend"><li><i style="background:var(--me)"></i>고른 회사</li><li><i style="background:var(--all)"></i>모든 회사</li></ul></div>
<h2>셋이 함께 고른 첫 세 가지</h2>
<ol class="top">{"".join(f'<li><div><b>{E(a)}</b><small>{E(b)}</small><span>{E(c)}</span></div></li>' for a, b, c in TOP3)}</ol>
<div class="miss"><b>못 한 것</b><ol>{"".join(f"<li>{E(x)}</li>" for x in NOT_DONE)}</ol></div>
<details class="src"><summary>출처</summary><p>쓰는 수 reports/atlas11/jinhwa/20261027-2332.json · 고른 회사 기록 site/next/data/theme-bloom.json record train test · 최근 두 달과 진짜 사이트 수 https://github.com/srt36573657-coder/atlas-11/actions/runs/40796890971 · 모든 쪽 검사 https://github.com/srt36573657-coder/atlas-11/actions/runs/40796894409 · 첫 화면 빠르기 https://github.com/srt36573657-coder/atlas-11/actions/runs/40740291056 · 바꾼 수 reports/atlas11/orders/ledger.json</p></details>
<footer>틀림 장부 {TRUST}건 · 못 한 것 {len(NOT_DONE)}가지</footer>
</div>
'''
open(OUT, 'w', encoding='utf-8').write(page)
print(OUT, len(page))
