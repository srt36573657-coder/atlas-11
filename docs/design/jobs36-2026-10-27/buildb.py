import json, base64, html
R = json.load(open('bold.json'))
KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯']
HL = {'answer': '결론 한 줄', 'main': '큰 칸', 'list': '목록', 'picture': '그림', 'search': '찾기 칸', 'say': '돌이 말', 'action': '단추'}
def act_name(t):
    t = (t or '').replace('다음', '').replace('›', '').strip().lstrip('·').strip()
    return t.split('  ')[0][:12].strip()
def what(r):
    out = []
    if r['hs'] == '#/': return ['돌 시계와 네 단추는 그대로 둬요', f'아래 {KO[min(r["folded"], 16)]} 칸은 「자세히 보기」에 접었어요']
    if r['heroKind']: out.append(f'주인공은 {HL.get(r["heroKind"], "칸")}이에요. 크게 맨 앞에 세웠어요' if HL.get(r['heroKind'], '칸')[-1] in '록칸림말줄' else f'주인공은 {HL.get(r["heroKind"], "칸")}예요. 크게 맨 앞에 세웠어요')
    else: out.append('가장 긴 본문을 맨 앞에 그대로 뒀어요')
    a = act_name(r['actText'])
    if a and len(a) <= 9: out.append(f'누를 단추는 「{a}」 하나예요')
    elif a: out.append('누를 단추는 하나만 크게 뒀어요')
    if r['folded']: out.append(f'나머지 {KO[min(r["folded"], 16)]} 칸은 「자세히 보기」에 접었어요')
    return out[:3]
img = lambda f: 'data:image/jpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
D = [{'no': r['no'], 'name': r['name'], 'now': img(f"small/cur-{r['no']:02d}.jpg"), 'job': img(f"small/bold-{r['no']:02d}.jpg"), 'what': what(r), 'b': round(r['best']), 'w': round(r['worst']), 'same': False} for r in R]
tot = sum(r['tried'] for r in R)
MISS = ['목업만 만들었어요. 진짜 사이트는 아직 그대로예요.', '이 기계에 띄운 돌이로 찍어 자료가 조금 달라요.', '점수 잣대는 제가 세운 것이에요.', '아이폰에서 직접 본 것은 아직이에요.']
base = open('build.py').read()
css = base.split("page = f'''")[1].split('<style>')[1].split('</style>')[0].replace('{{', '{').replace('}}', '}')
page = f'''<title>대범한 잡스 판</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{css}</style>
<div class="wrap">
<h1>잡스라면 이렇게 크게 바꿀까?</h1>
<ol class="sum">
<li>서른여섯 쪽을 쪽마다 <b>백팔십 판</b>씩 놓아 봤어요.</li>
<li>쪽마다 가장 중요한 것 <b>하나</b>를 크게 맨 앞에 세웠어요.</li>
<li>그림 하나와 누를 단추 하나만 첫 화면에 남겼어요.</li>
<li>나머지는 「자세히 보기」에 접었어요.</li>
<li class="end">이 판으로 진짜 돌이를 고칠까요?</li>
</ol>
<section class="view" aria-label="한 장씩 보기">
<div class="bar"><button id="prev" aria-label="앞 장">‹</button><div class="ttl"><b id="nm"></b><span id="no"></span></div><button id="next" aria-label="다음 장">›</button></div>
<div class="seg"><button id="bNow" aria-pressed="false">지금</button><button id="bJob" aria-pressed="true">대범한 판</button></div>
<figure class="phone" id="ph"><img id="shot" alt="돌이 화면"><span class="tag" id="tag">대범한 판</span></figure>
<p class="hint">사진을 누르면 지금과 바뀌어요.</p>
<div class="what" id="what"></div>
<p class="score" id="sc"></p>
</section>
<h2>서른여섯 장 한눈에</h2>
<div class="grid" id="grid"></div>
<div class="miss"><b>못 한 것</b><ol>{''.join(f'<li>{html.escape(m)}</li>' for m in MISS)}</ol></div>
<details><summary>어떻게 골랐나요?</summary>
<ol><li>쪽마다 주인공, 그림, 단추, 남길 칸 수, 크기, 테두리, 쪽 번호 줄을 바꿔 가며 백팔십 판을 놓았어요.</li>
<li>모두 {tot:,}판이에요. 점수가 가장 높은 판 하나를 골랐어요.</li>
<li>점수는 주인공이 첫 화면에 크게 서는지, 그림과 단추가 보이는지, 칸이 적은지, 본문이 사라지지 않는지로 셌어요.</li>
<li>첫 화면은 네 단추 한 화면 말씀대로 돌 시계를 그대로 뒀어요.</li>
<li>진화 쪽 본질 줄과 안내 줄은 접지 않았어요.</li></ol>
<p>출처: <a href="https://also.kottke.org/15/10/focus-means-saying-no">잡스 1997년 발표, 초점은 아니라고 말하는 것</a></p>
</details>
<footer>틀림 장부 135건 · 못 한 것 {len(MISS)}가지</footer>
</div>
<script>
const D = {json.dumps(D, ensure_ascii=False)};
let i = 0, v = 'job';
const $ = id => document.getElementById(id);
function show() {{
  const d = D[i]; $('shot').src = d[v]; $('nm').textContent = d.name; $('no').textContent = d.no + ' / 36';
  $('tag').textContent = v === 'job' ? '대범한 판' : '지금'; $('tag').style.background = v === 'job' ? 'var(--warm)' : '#5b6b6d';
  $('bNow').setAttribute('aria-pressed', v === 'now'); $('bJob').setAttribute('aria-pressed', v === 'job');
  $('what').replaceChildren(...d.what.map(t => {{ const p = document.createElement('p'); p.textContent = t; return p; }}));
  $('sc').textContent = '백팔십 판 가운데 점수 ' + d.w + '부터 ' + d.b + '까지';
  document.querySelectorAll('#grid button').forEach((b, k) => b.classList.toggle('on', k === i));
}}
const go = k => {{ i = (k + D.length) % D.length; show(); }};
$('prev').onclick = () => go(i - 1); $('next').onclick = () => go(i + 1);
$('bNow').onclick = () => {{ v = 'now'; show(); }}; $('bJob').onclick = () => {{ v = 'job'; show(); }};
$('ph').onclick = () => {{ v = v === 'job' ? 'now' : 'job'; show(); }};
let sx = null; $('ph').addEventListener('touchstart', e => {{ sx = e.touches[0].clientX; }}, {{passive: true}});
$('ph').addEventListener('touchend', e => {{ if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); sx = null; }});
D.forEach((d, k) => {{ const b = document.createElement('button'); const im = document.createElement('img'); im.src = d.job; im.alt = d.name; im.loading = 'lazy';
  const s = document.createElement('span'); s.textContent = d.no + ' ' + d.name; b.append(im, s);
  b.onclick = () => {{ go(k); $('ph').scrollIntoView({{behavior: 'smooth', block: 'center'}}); }}; $('grid').append(b); }});
show();
</script>'''
open('j36b.html', 'w').write(page); print(len(page), tot)
