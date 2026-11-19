import base64, json
W = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36'
img = lambda f: 'data:image/jpeg;base64,' + base64.b64encode(open(f'{W}/jpg/{f}.jpg', 'rb').read()).decode()
cap = {'a': '첫 화면', 'b': '조금 내리면', 'c': '꾀 쪽', 'd': '꾀 모음'}
def dots(k):
    return '<span class="dots" aria-label="참모 서른여섯 가운데 %d명이 골랐어요">' % k + ''.join('<i class="on"></i>' if i < k else '<i></i>' for i in range(36)) + '</span>'
def strip(tag):
    return '<div class="strip">' + ''.join(f'<figure><img src="{img(tag + "-" + k)}" alt="샘플 {tag[1]} {cap[k]}" loading="lazy" width="540" height="1169"><figcaption>{cap[k]}</figcaption></figure>' for k in 'abcd') + '</div>'
S = [
 ('s1', '첫째', '문지기 수채화', 22, '물빛은 둘레에, 글은 흰 종이 판에 늘 또렷하게.',
  ['붙어 다니는 줄은 아래 탭 하나뿐이에요. 글씨를 키워도 화면을 덜 가려요.', '맨 위는 그림 띠, 그 밑 흰 판에 「지금은 내리는 시장」을 크게 써요.', '꾀는 줄 하나가 곧 단추예요. 먹 테로 둘렀어요.', '첫 쪽이 열다섯 화면에서 다섯 화면 안으로 줄어요.']),
 ('s2', '둘째', '흰 종이 남기기', 21, '칸을 그리지 않고 종이를 남겨요. 누를 곳만 먹 테.',
  ['첫 쪽이 한 폭 그림 다섯 켜예요. 먼 산은 오늘 시장, 정자는 꾀, 연잎은 회사, 징검돌은 멈춤, 물가는 기록이에요.', '흰 상자와 그림자를 걷었어요. 글 밑은 칠하지 않아요.', '아래 탭 이름은 오늘 · 꾀 · 멈춤 · 기록이에요.', '첫 쪽이 열다섯 화면에서 네 화면 안으로 줄어요.']),
 ('s3', '셋째', '산 하나 말 하나', 19, '열면 바로, 산 하나로 오늘 장을 알아요.',
  ['첫 화면에는 오늘 산 하나와 큰 말 하나만 있어요.', '다섯 산 가운데 오늘 산만 진하게 칠해요. 글을 못 읽어도 꼴로 알아요.', '그 밑에 덜 잃은 꾀 그림 하나, 꾀 차례는 한 줄씩이에요.', '첫 쪽이 열다섯 화면에서 세 화면 안으로 줄어요.']),
]
cards = ''
for tag, nth, name, votes, one, pts in S:
    cards += f'''<section class="card" id="{tag}">
  <header class="ch"><p class="nth">{nth} 샘플</p><h2>{name}</h2><p class="one">{one}</p>
  <p class="vote">참모 표 {votes} {dots(votes)}</p></header>
  {strip(tag)}
  <ul class="pts">{''.join('<li>' + p + '</li>' for p in pts)}</ul>
</section>
'''
m = json.load(open(W + '/measure.json'))
rows = [('첫 쪽 길이', '#/', 'screens', '화면'), ('꾀 모음 길이', '#/k', 'screens', '화면'), ('첫 화면 누를 곳', '#/', 'taps1', '곳'), ('첫 쪽 글', '#/', 'chars', '자')]
def fmt(v, u):
    if u == '화면': return f'{v:g} {u}'
    return f'{v:,} {u}'
tbl = '<table><thead><tr><th>잰 것</th><th>지금</th><th>첫째</th><th>둘째</th><th>셋째</th></tr></thead><tbody>'
for lab, h, k, u in rows:
    tbl += f'<tr><th>{lab}</th>' + ''.join(f'<td>{fmt(m[t][h][k], u)}</td>' for t in ('now', 's1', 's2', 's3')) + '</tr>'
cov = lambda t: m[t]['#/']['cover']
tbl += '<tr><th>늘 가리는 띠 · 화면 열 칸 가운데</th>' + ''.join(f'<td>{round(cov(t) / 844 * 10, 1):g} 칸</td>' for t in ('now', 's1', 's2', 's3')) + '</tr></tbody></table>'
html = f'''<title>손자병법 수채화 샘플</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=Noto+Sans+KR:wght@400;700;900&display=swap">
<style>
/* 한 폭 두루마리처럼 위에서 아래로 — 지금 사이트 · 샘플 셋 · 셋 모두 같은 것 · 토론 셈 */
:root {{
  --paper: #F3F8F6; --sheet: #FCFEFD; --ink: #1B2428; --slate: #3E5A63; --jade: #A6D0CD; --mist: #DCEBE8; --ochre: #B48A55;
  --f-head: "Gowun Batang", "Noto Serif KR", serif; --f-body: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --paper: #12191B; --sheet: #1A2427; --ink: #E8F1EF; --slate: #A9C4C6; --jade: #4F7F7C; --mist: #24343A; --ochre: #D2A86C; color-scheme: dark; }} }}
:root[data-theme="dark"] {{ --paper: #12191B; --sheet: #1A2427; --ink: #E8F1EF; --slate: #A9C4C6; --jade: #4F7F7C; --mist: #24343A; --ochre: #D2A86C; color-scheme: dark; }}
body {{ background: var(--paper); color: var(--ink); font-family: var(--f-body); font-size: 1.125rem; line-height: 1.65; }}
.wrap {{ max-width: 760px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 30px; }}
h1, h2 {{ font-family: var(--f-head); text-wrap: balance; margin: 0; }}
h1 {{ font-size: 2.25rem; line-height: 1.25; }}
.lead {{ margin: 8px 0 0; font-size: 1.1875rem; }}
.ask {{ margin: 10px 0 0; padding: 12px 16px; border-left: 4px solid var(--jade); background: var(--sheet); border-radius: 0 14px 14px 0; font-weight: 700; }}
.now {{ display: grid; gap: 10px; }}
.now .pair {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 420px; }}
.now img, .strip img {{ display: block; width: 100%; height: auto; border-radius: 16px; box-shadow: 0 0 0 1.5px var(--mist); }}
.k {{ margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--slate); }}
.card {{ background: var(--sheet); border-radius: 26px; padding: 22px 18px 20px; box-shadow: 0 0 0 1.5px var(--mist), 0 14px 34px -18px rgba(62, 90, 99, .5); display: grid; gap: 14px; min-width: 0; }}
.ch {{ display: grid; gap: 4px; }}
.nth {{ margin: 0; font-weight: 900; color: var(--slate); }}
.card h2 {{ font-size: 1.875rem; }}
.one {{ margin: 0; font-size: 1.1875rem; font-weight: 700; }}
.vote {{ margin: 4px 0 0; font-size: 1.0625rem; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }}
.dots {{ display: inline-grid; grid-template-columns: repeat(18, 9px); gap: 3px; }}
.dots i {{ width: 9px; height: 9px; border-radius: 50%; background: var(--mist); }}
.dots i.on {{ background: var(--ochre); }}
.strip {{ display: grid; grid-auto-flow: column; grid-auto-columns: minmax(46%, 1fr); gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; }}
.strip figure {{ margin: 0; scroll-snap-align: start; }}
.strip figcaption {{ margin-top: 6px; font-size: 1.0625rem; font-weight: 700; text-align: center; }}
@media (min-width: 700px) {{ .strip {{ grid-auto-columns: minmax(0, 1fr); }} }}
.pts {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; }}
.same, .red, .tally {{ background: var(--sheet); border-radius: 22px; padding: 20px 18px; box-shadow: 0 0 0 1.5px var(--mist); display: grid; gap: 10px; min-width: 0; }}
.same h2, .red h2, .tally h2 {{ font-size: 1.5rem; }}
.tbl {{ overflow-x: auto; }}
table {{ border-collapse: collapse; width: 100%; min-width: 460px; font-variant-numeric: tabular-nums; font-size: 1.0625rem; }}
th, td {{ padding: 8px 8px; text-align: left; border-bottom: 1.5px solid var(--mist); }}
thead th {{ color: var(--slate); }}
.foot {{ font-size: 1.0625rem; color: var(--slate); display: grid; gap: 6px; }}
.foot p {{ margin: 0; }}
</style>
<div class="wrap">
<header>
  <p class="k">손자병법 전체를 수채화로 · 더 쉬운 길로</p>
  <h1>손자병법 수채화 샘플 셋</h1>
  <p class="lead">참모 서른여섯이 공부하고 두 번 토론해서 고른 셋이에요. 진짜 사이트는 아직 그대로예요.</p>
  <p class="ask">마음에 드는 번호를 말씀해 주세요. 둘을 섞어도 돼요.</p>
</header>
<section class="now"><p class="k">지금 사이트 · 첫 쪽 열다섯 화면 · 꾀 모음 서른다섯 화면</p>
  <div class="pair"><img src="{img('now-home-1')}" alt="지금 첫 화면" loading="lazy" width="540" height="1169"><img src="{img('now-kkoe-list')}" alt="지금 꾀 모음" loading="lazy" width="540" height="1169"></div>
</section>
{cards}
<section class="same"><h2>셋 모두 같은 것</h2>
  <ul class="pts">
    <li>빨강을 뺐어요. 그림 속 등불도 금빛으로 바꿨어요.</li>
    <li>떠 있던 「듣기 · 다음」 막대를 없앴어요. 듣기는 맨 위, 다음은 쪽 끝 큰 단추예요.</li>
    <li>아래 탭은 넷이에요. 매매일지는 멈춤 안으로 들어가요.</li>
    <li>천사 · 선물 · 찾기는 맨 아래 끝 줄로 옮겼어요.</li>
    <li>「그림 뜻」 딱지와 깨진 글을 버렸어요.</li>
    <li>꾀 모음은 한 줄에 꾀 하나예요.</li>
  </ul>
  <p class="k">폭 390 휴대폰 화면으로 재어 봤어요</p>
  <div class="tbl">{tbl}</div>
</section>
<section class="red"><h2>반대 참모가 찾은 것</h2>
  <ul class="pts">
    <li>지금 사이트 한 폭 그림 맨 아래 정산 선이 늘 오르게 그려져 있었어요. 진짜 값이 아니라 오른다는 자랑처럼 읽혀요.</li>
    <li>샘플에서는 평평한 물결로 바꿨어요. 지금 사이트도 곧 고칠게요.</li>
  </ul>
</section>
<section class="tally"><h2>토론 셈</h2>
  <ul class="pts">
    <li>한 참모가 셋을 고르고 둘에 반대했어요. 자기 판은 고르지 않았어요.</li>
    <li>첫째 스물두 표, 둘째 스물한 표, 셋째 열아홉 표예요. 넷째는 다섯 표였어요.</li>
    <li>첫째와 둘째를 합치자는 표가 여덟으로 가장 많았어요.</li>
    <li>앞 열아홉 명은 두 판을 못 보고 골랐어요. 제 정리 실수예요. 모든 판을 본 열일곱 명만 세어도 같은 셋이에요.</li>
  </ul>
</section>
<footer class="foot">
  <p>샘플은 시험 자료로 찍어서 날짜와 숫자는 옛것이에요.</p>
  <p>지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.</p>
</footer>
</div>
'''
open(W + '/page/sonja-watercolor-samples.html', 'w', encoding='utf-8').write(html)
print(len(html) // 1024, 'KB')
