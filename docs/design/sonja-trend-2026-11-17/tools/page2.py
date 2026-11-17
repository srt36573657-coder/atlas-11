# 끝 보고 한 장 — python3 page2.py <라운드 번호>  → $S/tr/new-trend.html
import json, re, html, sys, io, base64, os, glob
from PIL import Image
S = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/tr/'
R = int(sys.argv[1]) if len(sys.argv) > 1 else 1
E = html.escape
EN = [('WCAG', '웹 접근성 지침'), ('KRDS', '정부 디자인 체계'), ('iOS', '아이폰 체계'), ('Assistive Access', '애플 쉬운 화면'), ('AA', '두째 등급'), ('k/g07', '꾀 7'),
      ('px', '픽셀'), ('pt', '포인트'), ('ms', '밀리초'), ('dp', '점')]
def ko(t):
    for a, b in EN: t = re.sub(r'(?<![A-Za-z])' + re.escape(a) + r'(?![A-Za-z])', b, t)
    return t
def study(L):
    t = open(S + f'study-{L}.md', encoding='utf-8').read()
    top = re.split(r'\n## *샘플 방향', t)[0]
    top = re.split(r'\n## *핵심 열[^\n]*\n', top)[-1]
    tops = [re.sub(r'\s*\[(확인|기억)[^\]]*\][^\n]*$', '', re.sub(r'^\s*(\d+\.|[①-⑩])\s*', '', l)).strip() for l in top.split('\n') if re.match(r'^\s*(\d+\.|[①-⑩])', l)]
    body = t.split('100가지', 1)[1]; body = re.split(r'\n## *본질과', body)[0]
    G = []; 
    for line in body.split('\n'):
        m = re.match(r'^#{2,4}\s*(.+)', line)
        if m: G.append([re.sub(r'\s*\(\d+\s*~\s*\d+\)', '', m.group(1)).strip(), []]); continue
        m = re.match(r'^(\d{1,3})\.\s+(.*)', line)
        if not m: continue
        parts = re.split(r'\s+—\s+', m.group(2)); mark = ''
        if len(parts) > 1 and re.match(r'^\[(확인|기억|이번|어림)', parts[-1].strip()): mark = '확인' if parts.pop().strip().startswith('[확인') else '기억'
        if not G: G.append(['', []])
        G[-1][1].append((int(m.group(1)), ko(' — '.join(parts)), mark))
    return [ko(x) for x in tops[:10]], G

_study_raw = study
def study(L):
    tops0, G0 = _study_raw(L)
    marks = {n: m for _, it in G0 for n, _, m in it}
    f = S + f'study-{L}-easy.md'
    if not os.path.exists(f): return tops0, G0
    t = open(f, encoding='utf-8').read()
    top = t.split('## 100가지')[0]
    tops = [re.sub(r'^\s*\d+\.\s*', '', l).strip() for l in top.split('\n') if re.match(r'^\s*\d+\.', l)]
    G = []
    for line in t.split('## 100가지', 1)[1].split('\n'):
        m = re.match(r'^#{3,4}\s*(.+)', line)
        if m: G.append([m.group(1).strip(), []]); continue
        m = re.match(r'^(\d{1,3})\.\s+(.*)', line)
        if not m: continue
        if not G: G.append(['', []])
        n = int(m.group(1)); G[-1][1].append((n, m.group(2).strip(), marks.get(n, '')))
    return tops[:10], G
def jpg(p, w=540):
    im = Image.open(p).convert('RGB'); im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=80, optimize=True, progressive=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
META = json.load(open(S + 'final.json', encoding='utf-8'))   # 샘플 이름 · 한 줄 · 바뀐 것 · 쪽 차례 · 검사 결과(내가 모아 씀)
PAGES = {'home': '오늘', 'list': '꾀 목록', 'kkoe': '꾀 한 쪽', 'company': '회사 한 쪽', 'stop': '멈춤', 'settle': '정산'}
sam = ''
for s in META['samples']:
    d = S + 'samples/' + s['id'] + '/shots/'
    figs = ''.join('<figure class="ph"><img src="%s" alt="%s 첫 화면" loading="lazy" width="540" height="1169"><figcaption>%s</figcaption></figure>' % (jpg(d + p + '-1.png'), E(PAGES[p]), E(PAGES[p])) for p in s['pages'] if os.path.exists(d + p + '-1.png'))
    sc = ''.join('<li><span class="jn">%s</span><b class="js">%d</b></li>' % (E(j['name']), j['score']) for j in s['judges'])
    sam += '''<section class="card" id="s-%s"><div class="shead"><span class="sno">샘플 %s</span><h3>%s</h3></div>
<p class="glance">%s</p><ul class="scores" aria-label="검사 셋 점수">%s<li class="min"><span class="jn">가장 낮은 점수</span><b class="js">%d</b></li></ul>
<div class="strip">%s</div><ul class="pts">%s</ul><p class="jq">%s</p></section>''' % (s['id'], E(s['label']), E(s['name']), E(s['glance']), sc, min(j['score'] for j in s['judges']), figs,
        ''.join('<li>%s</li>' % E(p) for p in s['points']), E(s['quote']))
stu = ''
for L, title in (('A', '공부 1 · 눈에 보이는 요즘 유행'), ('B', '공부 2 · 더 효율적인 구조'), ('C', '공부 3 · 잘 만든 금융 · 공부 앱')):
    tops, G = study(L)
    n = sum(len(g[1]) for g in G)
    inner = ''.join('<details class="sg"><summary>%s<span>%d가지</span></summary><ol start="%d">%s</ol></details>' % (E(g), len(it), it[0][0], ''.join('<li>%s%s</li>' % (E(x), '<i class="mk">확인함</i>' if m == '확인' else '') for _, x, m in it)) for g, it in G if it)
    stu += '''<details class="grp"><summary>%s<span>%d가지</span></summary><div class="gin"><h4>가장 효과 큰 열</h4><ol class="tops">%s</ol>%s</div></details>''' % (E(title), n, ''.join('<li>%s</li>' % E(t) for t in tops), inner)
rounds = ''.join('<li>%s</li>' % E(x) for x in META['rounds'])
page = '''<title>손자병법 새 판 셋</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root { --bg: #F5F2EC; --card: #FFFFFF; --ink: #1B1916; --sub: #4F4840; --line: #E4DED4; --acc: #1F3E66; --accsoft: #E6ECF4; --mk: #5B6E3A;
  --fd: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #141311; --card: #1E1C19; --ink: #F3EFE8; --sub: #BDB4A8; --line: #34302A; --acc: #9DB8E0; --accsoft: #23303F; --mk: #A9C07E; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #141311; --card: #1E1C19; --ink: #F3EFE8; --sub: #BDB4A8; --line: #34302A; --acc: #9DB8E0; --accsoft: #23303F; --mk: #A9C07E; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--fd); font-size: 19px; line-height: 1.6; word-break: keep-all; }
.wrap { max-width: 1180px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 22px; }
h1 { margin: 0; font-size: 2rem; line-height: 1.25; font-weight: 900; text-wrap: balance; }
h2 { margin: 18px 0 0; font-size: 1.5rem; font-weight: 900; }
.lead { margin: 0; font-size: 1.12rem; color: var(--sub); font-weight: 600; }
.sum { margin: 0; padding: 18px 20px; border-radius: 20px; background: var(--accsoft); font-weight: 800; font-size: 1.15rem; }
.flow { margin: 0; padding: 0 0 0 1.2em; display: grid; gap: 4px; font-weight: 600; }
.card { background: var(--card); border-radius: 24px; padding: 22px 18px; display: grid; gap: 12px; min-width: 0; }
.shead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; }
.sno { font-weight: 900; color: var(--acc); font-size: 1rem; }
.shead h3 { margin: 0; font-size: 1.45rem; font-weight: 900; }
.glance { margin: 0; font-size: 1.08rem; font-weight: 700; }
.scores { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.scores li { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--accsoft); min-height: 44px; }
.scores li.min { background: var(--acc); color: var(--card); }
.jn { font-size: 1rem; font-weight: 700; }
.js { font-size: 1.25rem; font-weight: 900; }
.strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(210px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
.ph { margin: 0; scroll-snap-align: start; display: grid; gap: 6px; }
.ph img { width: 100%%; height: auto; border-radius: 22px; border: 1px solid var(--line); display: block; }
.ph figcaption { font-size: 1rem; color: var(--sub); font-weight: 700; text-align: center; }
.pts { margin: 0; padding-left: 1.1em; display: grid; gap: 4px; }
.jq { margin: 0; color: var(--sub); font-size: 1.02rem; }
.grp, .sg { background: var(--card); border-radius: 18px; padding: 4px 18px; }
.sg { padding: 0 0 0 4px; background: transparent; }
.grp > summary, .sg > summary { cursor: pointer; min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 900; font-size: 1.12rem; }
.sg > summary { font-size: 1.02rem; font-weight: 800; }
summary span { color: var(--sub); font-size: .95rem; font-weight: 700; }
.gin { display: grid; gap: 8px; padding-bottom: 14px; }
.gin h4 { margin: 4px 0 0; font-size: 1.05rem; }
.tops, .sg ol { margin: 0; padding-left: 2em; display: grid; gap: 4px; }
.mk { margin-left: 8px; font-style: normal; font-size: .9rem; font-weight: 800; color: var(--mk); white-space: nowrap; }
.foot { margin: 0; color: var(--sub); font-size: 1rem; }
:focus-visible { outline: 3px solid var(--acc); outline-offset: 2px; }
</style>
<main class="wrap">
  <h1>손자병법 새 판 셋 — 요즘 유행으로 올리기</h1>
  <p class="lead">%s</p>
  <p class="sum">%s</p>
  <ol class="flow">%s</ol>
  <h2>샘플 셋</h2>
  %s
  <h2>요즘 유행 공부 300가지</h2>
  %s
  <p class="foot">%s</p>
</main>
''' % (E(META['lead']), E(META['summary']), rounds, sam, stu, E(META['foot']))
open(S + 'new-trend.html', 'w', encoding='utf-8').write(page)
print('ok', len(page) // 1024, 'KB')
