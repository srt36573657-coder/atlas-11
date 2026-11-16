import json, re, html, sys
S = sys.argv[1]
IM = json.load(open(S + '/imgs.json'))
AN = open(S + '/analysis100.md', encoding='utf-8').read()
DB = json.load(open(S + '/debate.json', encoding='utf-8'))
E = html.escape
groups = []
for blk in re.split(r'\n## ', AN)[1:]:
    title, *lines = blk.strip().split('\n')
    items = [re.sub(r'^\d+\.\s*', '', l) for l in lines if re.match(r'^\d+\.', l)]
    nums = [int(re.match(r'^(\d+)\.', l).group(1)) for l in lines if re.match(r'^\d+\.', l)]
    groups.append((title, list(zip(nums, items))))
SM = DB['samples']
votes = {str(i): sum(1 for a in DB['advisers'] if str(a['pick']) == str(i)) for i in (1, 2, 3)}
def phone(src, cap):
    return '<figure class="ph"><img src="%s" alt="%s" loading="lazy" width="540" height="1169"><figcaption>%s</figcaption></figure>' % (src, E(cap), E(cap))
CAPS = ['첫 쪽 맨 위', '첫 쪽 둘째 카드', '꾀 쪽 맨 위', '꾀 영화 14초(반전 막)']
sam_html = ''
for i, s in enumerate(SM, 1):
    v = votes[str(i)]
    dots = ''.join('<i class="dot on"></i>' if j < v else '<i class="dot"></i>' for j in range(11))
    sam_html += '''
<section class="card sample%s" id="sample-%d">
  <div class="shead"><span class="sno">샘플 %d</span><h3>%s</h3>%s</div>
  <p class="glance">%s</p>
  <div class="votes" aria-label="참모 11명 가운데 %d명이 골랐어요">%s<b>%d / 11</b></div>
  <div class="strip">%s</div>
  <ul class="pts">%s</ul>
</section>''' % (' rec' if s.get('rec') else '', i, i, E(s['name']), '<span class="recb">참모 추천</span>' if s.get('rec') else '', E(s['glance']), v, dots, v,
       ''.join(phone(IM['s%d%s' % (i, k)], CAPS[j]) for j, k in enumerate('abcd')), ''.join('<li>%s</li>' % E(p) for p in s['points']))
adv_html = ''.join('''
<li class="adv"><div class="ahead"><b>%s</b><span class="pick">샘플 %s</span></div><p class="why">%s</p><p class="idea">%s</p></li>''' % (E(a['name']), E(str(a['pick'])), E(a['why']), E(a['idea'])) for a in DB['advisers'])
an_html = ''.join('<details class="grp"%s><summary>%s<span>%d가지</span></summary><ol start="%d">%s</ol></details>' % (' open' if gi == len(groups) - 1 else '', E(t), len(it), it[0][0], ''.join('<li>%s</li>' % E(x) for _, x in it)) for gi, (t, it) in enumerate(groups))
page = '''<title>손자병법 새 얼굴</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* 짜임: 위에서 아래로 — 결론 한 줄 → 샘플 셋(휴대폰 네 화면씩 옆으로 밀기) → 참모 11명 → 100가지(눌러 펼침) */
:root { --bg: #F4F2EE; --card: #FFFFFF; --ink: #1D1B22; --sub: #5E5A6B; --line: #E4E0EA; --acc: #4B3BB8; --accsoft: #ECE9FB; --dot: #D8D4E2; --rec: #1F2A44;
  --fd: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; --fs: 'Noto Serif KR', 'AppleMyungjo', serif; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #141318; --card: #1F1D25; --ink: #F2F0F7; --sub: #ABA6BC; --line: #2E2B36; --acc: #A99BFF; --accsoft: #2A2640; --dot: #3A3746; --rec: #C9D4F2; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #141318; --card: #1F1D25; --ink: #F2F0F7; --sub: #ABA6BC; --line: #2E2B36; --acc: #A99BFF; --accsoft: #2A2640; --dot: #3A3746; --rec: #C9D4F2; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--fd); font-size: 19px; line-height: 1.6; word-break: keep-all; }
.wrap { max-width: 1180px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 22px; }
h1 { margin: 0; font-size: 2rem; line-height: 1.25; font-weight: 900; text-wrap: balance; }
h2 { margin: 18px 0 0; font-size: 1.5rem; font-weight: 900; }
.lead { margin: 0; font-size: 1.15rem; color: var(--sub); font-weight: 600; }
.sum { margin: 0; padding: 18px 20px; border-radius: 20px; background: var(--accsoft); font-weight: 800; font-size: 1.15rem; }
.card { background: var(--card); border-radius: 24px; padding: 22px 18px; display: grid; gap: 12px; min-width: 0; }
.card.rec { outline: 3px solid var(--rec); }
.shead { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.sno { font-weight: 900; color: var(--acc); font-size: 1rem; letter-spacing: .02em; }
.shead h3 { margin: 0; font-size: 1.45rem; font-weight: 900; }
.recb { padding: 4px 12px; border-radius: 999px; background: var(--rec); color: var(--card); font-size: .9rem; font-weight: 900; }
.glance { margin: 0; font-size: 1.1rem; font-weight: 700; }
.votes { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.dot { width: 14px; height: 14px; border-radius: 50%%; background: var(--dot); display: inline-block; }
.dot.on { background: var(--acc); }
.votes b { margin-left: 8px; font-size: 1rem; }
.strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
.ph { margin: 0; scroll-snap-align: start; display: grid; gap: 6px; }
.ph img { width: 100%%; height: auto; border-radius: 22px; border: 1px solid var(--line); display: block; }
.ph figcaption { font-size: .95rem; color: var(--sub); font-weight: 700; text-align: center; }
.pts { margin: 0; padding-left: 1.1em; display: grid; gap: 4px; }
.advs { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.adv { background: var(--card); border-radius: 20px; padding: 16px 18px; display: grid; gap: 6px; min-width: 0; }
.ahead { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
.pick { flex: none; padding: 2px 10px; border-radius: 999px; background: var(--accsoft); color: var(--acc); font-weight: 900; font-size: .95rem; }
.why, .idea { margin: 0; font-size: 1.02rem; }
.idea { color: var(--sub); }
.grp { background: var(--card); border-radius: 18px; padding: 4px 18px; }
.grp summary { cursor: pointer; min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 900; font-size: 1.15rem; }
.grp summary span { color: var(--sub); font-size: .95rem; font-weight: 700; }
.grp ol { margin: 0 0 14px; padding-left: 2.2em; display: grid; gap: 4px; }
.foot { margin: 0; color: var(--sub); font-size: 1rem; }
:focus-visible { outline: 3px solid var(--acc); outline-offset: 2px; }
</style>
<main class="wrap">
  <h1>손자병법 새 얼굴 — 키움 짜임과 어울리기</h1>
  <p class="lead">%s</p>
  <p class="sum">%s</p>
  <h2>샘플 셋</h2>
  %s
  <h2>참모 11명 토론</h2>
  <ul class="advs">%s</ul>
  <h2>키움 화면 100가지</h2>
  %s
  <p class="foot">세 샘플 모두 「등락률 상위」 같은 수익 줄 세우기 · 「매수」 단추 · 채팅 · 혜택 탭은 넣지 않았어요. 회사 상표 그림 대신 첫 글자 동그라미를 썼어요. 사진은 이 컴퓨터 시험 사이트에서 찍은 실제 화면이에요(자료 날 10월 13일).</p>
</main>
''' % (E(DB['lead']), E(DB['summary']), sam_html, adv_html, an_html)
open(S + '/new-face.html', 'w', encoding='utf-8').write(page)
print('ok', len(page) // 1024, 'KB')
