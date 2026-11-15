# 샘플 검사기 — python3 check_sample.py samples/sample-1.html  → 문제 0 이면 통과
import sys, re, json, asyncio
from playwright.async_api import async_playwright
path=sys.argv[1]
D=json.load(open('/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1720/samples/data.json'))
names=set()
for g in D['groups']+D['next']:
    for i in g['items']: names.add(i['name'])
for i in D.get('quiet',[]): names.add(i['name'])
for e in D['rank']+D['notYet']:
    for nm in e.get('picks',[]): names.add(nm)
BAN=['오를 것','오를것','될 것','기회','추천','사세요','안심','안전','수익','대박','필승','백전백승','확실']
NEED=['손자병법','쉬어 가기','아직 못 셈','21곳','예언','예시','글씨 크게','천사','선물','11월 6일','열 번에']
JS=r"""
() => {
 const out={sw:document.documentElement.scrollWidth, small:[], taps:[], ext:[], bg:getComputedStyle(document.body).backgroundColor};
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let n; const seen=new Set();
 while((n=w.nextNode())){
   const t=n.textContent.trim(); if(!t) continue;
   const el=n.parentElement; if(!el) continue;
   if(el.closest('svg')) continue;
   const cs=getComputedStyle(el);
   if(cs.display==='none'||cs.visibility==='hidden') continue;
   const fs=parseFloat(cs.fontSize);
   if(fs<17 && !seen.has(t)){seen.add(t); out.small.push(fs+'px:'+t.slice(0,30));}
 }
 document.querySelectorAll('button,summary,a,[role=button],input,select').forEach(b=>{
   const r=b.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
   if(r.height<44||r.width<44) out.taps.push(Math.round(r.width)+'x'+Math.round(r.height)+':'+(b.innerText||b.value||b.tagName).trim().slice(0,20));
 });
 document.querySelectorAll('[src],[href],link,script[src]').forEach(e=>{
   const u=e.getAttribute('src')||e.getAttribute('href')||''; if(/^https?:/.test(u)) out.ext.push(u);
 });
 out.text=document.body.innerText;
 out.alltext=document.body.textContent;
 return out;
}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.goto('file://'+path)
        await pg.wait_for_timeout(400)
        # 접힌 것 모두 열어 보고 다시 셈
        await pg.evaluate("()=>document.querySelectorAll('details').forEach(d=>d.open=true)")
        await pg.wait_for_timeout(200)
        r=await pg.evaluate(JS)
        await pg.screenshot(path=path.replace('.html','-check.png'),full_page=True)
        await b.close()
    probs=[]
    if r['sw']>391: probs.append('가로 넘침 %dpx'%r['sw'])
    for s in r['small']: probs.append('글씨 작음 '+s)
    for t in r['taps']: probs.append('누르는 곳 작음 '+t)
    for u in r['ext']: probs.append('밖 자원 '+u)
    if r['bg'] in ('rgba(0, 0, 0, 0)','transparent'): probs.append('바탕색 없음')
    txt=r['text']
    if re.search(r'[一-鿿]',txt): probs.append('한자 있음 '+''.join(set(re.findall(r'[一-鿿]',txt)))[:20])
    if '%' in txt: probs.append('퍼센트 기호 있음')
    t2=txt
    for nm in sorted(names,key=len,reverse=True): t2=t2.replace(nm,' ')
    eng=set(re.findall(r'[A-Za-z]{3,}',t2))
    if eng: probs.append('영어 '+' '.join(sorted(eng))[:80])
    for w in BAN:
        if w in txt: probs.append('쓰면 안 되는 말 '+w)
    for w in NEED:
        if w not in txt: probs.append('빠진 것 '+w)
    print('문제 %d'%len(probs))
    for x in probs[:60]: print(' -',x)
    print('그림:',path.replace('.html','-check.png'))
asyncio.run(main())
