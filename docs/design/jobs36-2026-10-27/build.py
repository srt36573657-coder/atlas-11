import json, base64, html
R = json.load(open('pick.json')); BL = {p['no']: p for p in json.load(open('blocks2.json'))}
KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스무', '스물한', '스물두', '스물세', '스물네', '스물다섯', '스물여섯', '스물일곱', '스물여덟', '스물아홉', '서른', '서른한', '서른두', '서른세', '서른네', '서른다섯', '서른여섯']
NUM = {1: '한', 2: '두', 3: '세', 4: '네', 5: '다섯', 6: '여섯', 7: '일곱'}
def what(r):
    if r['same']: return ['지금 차례가 이미 가장 좋아요']
    bf, nf = set(r['parts']['first']), set(r['nowParts']['first']); out = []
    LB = {'answer': '결론이', 'picture': '그림이', 'main': '큰 칸이', 'search': '찾기 칸이', 'next': '다음 단추가', 'action': '누를 단추가', 'list': '목록이'}
    for k in ('answer', 'picture', 'main', 'search', 'next', 'action', 'list'):
        if k in bf and k not in nf and len(out) < 2: out.append(LB[k] + ' 첫 화면에 들어와요')
    DN = {'nav': '쪽 고르는 단추 줄은 아래로 내렸어요', 'text': '설명 글은 아래로 내렸어요', 'tail': '날짜와 카톡 줄은 맨 아래로 내렸어요', 'fold': '접힌 칸은 맨 아래로 내렸어요'}
    for k in ('nav', 'text'):
        if k == 'text' and r['foldI']: continue  # 접은 글과 같은 말
        if k in nf and k not in bf and len(out) < 2 and DN[k] not in out: out.append(DN[k])
    if r['foldI'] and len(out) < 2: out.append(f'덜 중요한 글 {NUM.get(len(r["foldI"]), str(len(r["foldI"])))} 개를 접었어요')
    others = r['seq'] + r['foldI']; mv = [t for t in r['tail'] if any(o > t for o in others)]
    TN = []
    for t in mv:
        c = BL[r['no']]['blocks'][t]['cls']
        n = '날짜 줄' if 'asof' in c else '카톡 줄' if 'kk-' in c else '안내 줄' if 'safe' in c else '접힌 칸' if r['kinds'][t] == 'fold' else '작은 줄'
        if n not in TN: TN.append(n)
    if TN and len(out) < 2:
        out = [x for x in out if x != DN['tail']]
        out.append('과 '.join(TN[:2]) + '은 맨 아래로 내렸어요' if not TN[:2][-1].endswith('칸') else '과 '.join(TN[:2]) + '은 맨 아래로 내렸어요')
    if not out: out.append('중요한 칸을 위로 올렸어요')
    return out[:2]
img = lambda f: 'data:image/jpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
BIG = sum(1 for r in R if not r['same'] and (r['foldI'] or (set(r['parts']['first']) - set(r['nowParts']['first'])) & {'answer', 'picture', 'main', 'next', 'action'} or ('nav' in r['nowParts']['first'] and 'nav' not in r['parts']['first'])))
D = [{'no': r['no'], 'name': r['name'], 'now': img(f"small/now-{r['no']:02d}.jpg"), 'job': img(f"small/job-{r['no']:02d}.jpg"),
      'what': what(r), 'a': round(r['now']), 'b': round(r['best']), 'same': r['same'], 'n': r['distinct']} for r in R]
ch = sum(1 for d in D if not d['same']); tot = sum(r['distinct'] for r in R); short = sum(1 for r in R if r['distinct'] < 180)
KN = {29: '스물아홉', 7: '일곱', 21: '스물한', 15: '열다섯', 36: '서른여섯'}
MISS = ['칸이 적은 스물한 쪽은 판이 백팔십 개보다 적었어요.', '이 기계에 띄운 돌이로 찍어 자료가 조금 달라요.', '점수 잣대는 제가 세운 것이에요.', '아이폰에서 직접 본 것은 아직이에요.']
page = f'''<title>잡스 판 서른여섯 장</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root {{ --bg: #F4F1EA; --card: #FFFFFF; --ink: #1D2A2C; --sub: #4B5A5C; --line: #D9D3C7; --acc: #0E7C86; --acc-ink: #FFFFFF; --warm: #E2572B; --chip: #E7F2F2; color-scheme: light }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #0F1E21; --card: #16292D; --ink: #EEF3F2; --sub: #B5C4C3; --line: #2B4246; --acc: #3CC6CF; --acc-ink: #0F1E21; --warm: #FF8A5C; --chip: #1F3A3E; color-scheme: dark }} }}
:root[data-theme="dark"] {{ --bg: #0F1E21; --card: #16292D; --ink: #EEF3F2; --sub: #B5C4C3; --line: #2B4246; --acc: #3CC6CF; --acc-ink: #0F1E21; --warm: #FF8A5C; --chip: #1F3A3E; color-scheme: dark }}
* {{ box-sizing: border-box }}
body {{ background: var(--bg); color: var(--ink); font-family: -apple-system, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif; font-size: 21px; line-height: 1.5; word-break: keep-all; overflow-wrap: anywhere; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px 40px }}
.wrap {{ max-width: 520px; margin: 0 auto; display: grid; gap: 18px }}
h1 {{ font-size: 30px; line-height: 1.25; margin: 4px 0 0; text-wrap: balance }}
.sum {{ margin: 0; padding: 14px 16px; list-style: none; background: var(--card); border: 1px solid var(--line); border-radius: 16px; display: grid; gap: 6px }}
.sum li {{ font-size: 21px }} .sum li b {{ color: var(--warm) }} .sum li.end {{ font-weight: 800 }}
.view {{ background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 14px; display: grid; gap: 12px }}
.bar {{ display: grid; grid-template-columns: 56px 1fr 56px; align-items: center; gap: 8px }}
.bar button {{ height: 56px; border-radius: 14px; border: 0; background: var(--chip); color: var(--ink); font-size: 30px; font-weight: 800 }}
.ttl {{ text-align: center; min-width: 0 }} .ttl b {{ display: block; font-size: 25px; line-height: 1.2 }} .ttl span {{ font-size: 18px; color: var(--sub) }}
.seg {{ display: grid; grid-template-columns: 1fr 1fr; background: var(--chip); border-radius: 14px; padding: 4px; gap: 4px }}
.seg button {{ height: 50px; border: 0; border-radius: 11px; background: transparent; color: var(--ink); font-size: 21px; font-weight: 700 }}
.seg button[aria-pressed="true"] {{ background: var(--acc); color: var(--acc-ink) }}
.phone {{ margin: 0 auto; width: min(100%, 360px); border-radius: 28px; overflow: hidden; border: 6px solid var(--ink); position: relative; aspect-ratio: 390 / 844; max-width: 100%; background: #0b2a2e }}
.phone img {{ display: block; width: 100%; height: 100%; object-fit: cover; object-position: top }}
.tag {{ position: absolute; left: 10px; top: 10px; background: var(--warm); color: #fff; font-size: 17px; font-weight: 800; padding: 4px 10px; border-radius: 999px }}
.what {{ margin: 0; display: grid; gap: 4px }} .what p {{ margin: 0; font-size: 21px; font-weight: 700 }} .what p::before {{ content: "▲ "; color: var(--warm) }}
.score {{ margin: 0; font-size: 19px; color: var(--sub) }}
.hint {{ margin: 0; font-size: 17px; color: var(--sub); text-align: center }}
h2 {{ font-size: 25px; margin: 8px 0 0 }}
.grid {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px }}
.grid button {{ border: 2px solid var(--line); background: var(--card); border-radius: 14px; padding: 6px; color: var(--ink); text-align: left; display: grid; gap: 4px; min-width: 0 }}
.grid button.on {{ border-color: var(--acc) }}
.grid img {{ width: 100%; aspect-ratio: 390 / 600; object-fit: cover; object-position: top; border-radius: 8px; max-width: 100% }}
.grid span {{ font-size: 17px; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere }}
.grid i {{ font-style: normal; font-size: 17px; color: var(--warm) }} .grid i.keep {{ color: var(--sub) }}
details {{ background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px }}
summary {{ font-size: 21px; font-weight: 800; cursor: pointer }}
details p, details li {{ font-size: 17px; color: var(--sub) }} details a {{ color: var(--acc) }}
.miss {{ background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px }}
.miss b {{ font-size: 21px }} .miss li {{ font-size: 19px }}
footer {{ font-size: 19px; font-weight: 700; color: var(--sub); text-align: center }}
</style>
<div class="wrap">
<h1>잡스라면 돌이를 이렇게 놓을까?</h1>
<ol class="sum">
<li>서른여섯 쪽을 쪽마다 <b>백팔십 번</b>까지 놓아 봤어요.</li>
<li><b>{KO[ch]} 쪽</b>은 차례를 바꿨어요.</li>
<li>그 가운데 <b>{KO[BIG]} 쪽</b>은 첫 화면이 눈에 띄게 달라져요.</li>
<li><b>{KO[36 - ch]} 쪽</b>은 지금 차례가 이미 가장 좋았어요.</li>
<li class="end">아래 사진을 넘기며 지금과 견줘 보실까요?</li>
</ol>
<section class="view" aria-label="한 장씩 보기">
<div class="bar"><button id="prev" aria-label="앞 장">‹</button><div class="ttl"><b id="nm"></b><span id="no"></span></div><button id="next" aria-label="다음 장">›</button></div>
<div class="seg"><button id="bNow" aria-pressed="false">지금</button><button id="bJob" aria-pressed="true">잡스 판</button></div>
<figure class="phone" id="ph"><img id="shot" alt="돌이 화면"><span class="tag" id="tag">잡스 판</span></figure>
<p class="hint">사진을 누르면 지금과 바뀌어요.</p>
<div class="what" id="what"></div>
<p class="score" id="sc"></p>
</section>
<h2>서른여섯 장 한눈에</h2>
<div class="grid" id="grid"></div>
<div class="miss"><b>못 한 것</b><ol>{''.join(f'<li>{html.escape(m)}</li>' for m in MISS)}</ol></div>
<details><summary>어떻게 골랐나요?</summary>
<ol><li>잡스 잣대 셋으로 골랐어요. 가장 중요한 것 하나를 맨 위에 둬요.</li><li>그림은 글보다 먼저 둬요.</li><li>다음 단추는 첫 화면에 들게 해요.</li>
<li>덜 중요한 글은 「더 보기」에 접어요.</li><li>점수는 차례 60, 첫 화면 30, 익숙함 10으로 셌어요.</li>
<li>모두 {tot:,}판을 놓아 봤어요. 칸이 적은 {KN[short]} 쪽은 서로 다른 판이 적었어요. 그 쪽은 나올 수 있는 판을 모두 봤어요.</li>
<li>이 기계에 띄운 돌이로 찍었어요. 진짜 사이트에는 안 올렸어요.</li></ol>
<p>출처: <a href="https://also.kottke.org/15/10/focus-means-saying-no">잡스 1997년 발표, 초점은 아니라고 말하는 것</a></p>
</details>
<footer>틀림 장부 133건 · 못 한 것 {len(MISS)}가지</footer>
</div>
<script>
const D = {json.dumps(D, ensure_ascii=False)};
let i = 0, v = 'job';
const $ = id => document.getElementById(id);
function show() {{
  const d = D[i]; $('shot').src = d[v]; $('nm').textContent = d.name; $('no').textContent = d.no + ' / 36';
  $('tag').textContent = v === 'job' ? '잡스 판' : '지금'; $('tag').style.background = v === 'job' ? 'var(--warm)' : '#5b6b6d';
  $('bNow').setAttribute('aria-pressed', v === 'now'); $('bJob').setAttribute('aria-pressed', v === 'job');
  $('what').replaceChildren(...d.what.map(t => {{ const p = document.createElement('p'); p.textContent = t; return p; }}));
  $('sc').textContent = d.same ? '점수 ' + d.a + ' 그대로' : '점수 ' + d.a + ' → ' + d.b;
  document.querySelectorAll('#grid button').forEach((b, k) => b.classList.toggle('on', k === i));
}}
const go = k => {{ i = (k + D.length) % D.length; show(); }};
$('prev').onclick = () => go(i - 1); $('next').onclick = () => go(i + 1);
$('bNow').onclick = () => {{ v = 'now'; show(); }}; $('bJob').onclick = () => {{ v = 'job'; show(); }};
$('ph').onclick = () => {{ v = v === 'job' ? 'now' : 'job'; show(); }};
let sx = null; $('ph').addEventListener('touchstart', e => {{ sx = e.touches[0].clientX; }}, {{passive: true}});
$('ph').addEventListener('touchend', e => {{ if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) {{ go(i + (dx < 0 ? 1 : -1)); }} sx = null; }});
D.forEach((d, k) => {{ const b = document.createElement('button'); const im = document.createElement('img'); im.src = d.job; im.alt = d.name; im.loading = 'lazy';
  const s = document.createElement('span'); s.textContent = d.no + ' ' + d.name; const t = document.createElement('i'); t.textContent = d.same ? '그대로' : '바뀜'; if (d.same) t.className = 'keep';
  b.append(im, s, t); b.onclick = () => {{ go(k); $('ph').scrollIntoView({{behavior: 'smooth', block: 'center'}}); }}; $('grid').append(b); }});
show();
</script>'''
open('j36.html', 'w').write(page)
print(len(page), ch, tot, short)
