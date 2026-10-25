import re, json, html, os
D=os.path.dirname(os.path.abspath(__file__))
base=open(os.path.join(D,'base.css')).read()
pal=json.load(open(os.path.join(D,'palette.json')))
frags=[]; idx=[]
for n in range(1,12):
    f=os.path.join(D,'s%02d.html'%n)
    if not os.path.exists(f): idx.append((n,'만들지 못함',False)); continue
    t=open(f).read()
    m=re.search(r'<span class="no"><b>\d+</b>([^<]+)</span>',t)
    name=(m.group(1).strip() if m else '샘플 %d'%n)
    idx.append((n,name,True)); frags.append(t)
strip=''.join('<i style="background:%s"></i>'%h for h in pal)
index=''.join('<a href="#s%02d"><b>%d</b>%s</a>'%(n,n,html.escape(nm)) for n,nm,ok in idx if ok)
missing=[n for n,nm,ok in idx if not ok]
EXTRA="""
.intro{border:3px solid #000;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px}
.intro h1{font-size:32px;line-height:1.25;margin:0;font-weight:900}
.intro p{margin:0}
.strip{display:flex;height:36px;border-radius:10px;overflow:hidden;border:1px solid #000}
.strip i{flex:1 1 0;min-width:0}
.index{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.index a{display:flex;align-items:center;gap:8px;min-height:52px;padding:6px 10px;border:2px solid #000;border-radius:14px;color:#000;text-decoration:none;font-size:21px;font-weight:800}
.index a b{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:50%;background:#152D30;color:#FFFFFF;font-size:20px}
.sample .why em{display:inline-block;margin-right:8px;padding:0 10px;border-radius:10px;background:#152D30;color:#FFFFFF;font-size:21px;line-height:1.5;font-weight:800}
main>.note{border:1px solid #111;border-radius:18px;padding:16px}
main>.note h2{font-size:25px;margin:0 0 8px;font-weight:800}
main>.note ul{margin:4px 0;padding-left:28px}
main>.asklast{border:3px solid #000;border-radius:18px;padding:16px;font-size:24px;font-weight:800}
main>.footline{font-size:21px;color:#111;margin:0}
main>details{font-size:21px;color:#111;word-break:break-all}
main>details summary{cursor:pointer;min-height:48px}
"""
def page(notdone, ledger):
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>돌이 새 첫 화면</title><style>{base}{EXTRA}</style></head><body><main>
<section class="intro"><h1>돌이 새 첫 화면 샘플 열한 가지</h1>
<p>앤디 워홀이 만들었다 치고, 잡스라면 어떻게 했을지 따져 만들었어요.</p>
<p>색은 사장님이 고른 청록 색 100가지만 썼어요.</p>
<div class="strip">{strip}</div>
<p>샘플 속 숫자는 10월 13일 기록이에요.</p>
<p>번호를 누르면 그 샘플로 가요.</p>
<nav class="index">{index}</nav></section>
{''.join(frags)}
<section class="note"><h2>못 한 것 {len(notdone)}가지</h2><ul>{''.join('<li>%s</li>'%html.escape(x) for x in notdone)}</ul></section>
<section class="asklast">몇 번 샘플로 진짜 돌이를 만들까요?</section>
<p class="footline">채점표: 열한 개 모두 금지 말과 색과 글씨 크기를 기계로 검사했어요. 틀림 장부 {ledger}건 · 못 한 것 {len(notdone)}가지</p>
<details><summary>근거 펼치기</summary><p>색: 사장님이 보내신 사진 아래쪽 실제 색 100가지 — docs/design/palette-2026-10-25/perplexity-bottom-100.json</p><p>내용: 10월 13일 기록 — site/next/data/theme-home.json · theme-bloom.json</p><p>본질: docs/돌이_본질.md · 금지 말 검사: site/next/words.js screenHits · ruinHits · gainHits</p><p>앤디 워홀은 기법만 빌렸어요. 특정 작품 · 이름 · 서명은 넣지 않았어요.</p></details>
</main></body></html>"""
if __name__=='__main__':
    import sys
    notdone=json.loads(sys.argv[1]) if len(sys.argv)>1 else []
    ledger=sys.argv[2] if len(sys.argv)>2 else '116'
    open(os.path.join(D,'samples.html'),'w').write(page(notdone,ledger))
    print('ok', len(frags), 'missing', missing)
