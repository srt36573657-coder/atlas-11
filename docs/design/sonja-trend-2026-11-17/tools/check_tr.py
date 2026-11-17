# 샘플 검사기(이번 판) — python3 check_tr.py <샘플 폴더>  → 쪽마다 문제 · 그림(shots/) · 한 장(sheet.png) · 마지막 줄 「문제 0」이면 통과
import sys, re, json, os, asyncio, colorsys
from playwright.async_api import async_playwright
from PIL import Image
D = sys.argv[1].rstrip('/')
A = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/tr/assets/data.json'
data = json.load(open(A, encoding='utf-8'))
latin_ok = set()
for k in data['kkoe']:
    for c in k['companies']: latin_ok |= set(re.findall(r'[A-Za-z&]+', c['name']))
latin_ok |= set(re.findall(r'[A-Za-z&]+', open('/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/dist3/su/data/su21-settle.json', encoding='utf-8').read()))
BAN = ['추천', '사세요', '매수', '매도', '대박', '급등', '수익 순위', '오를 것', '오를것', '오를 거', '기회', '확실', '필승', '안심', '목표가', '지금 사', '놓치']
PAGES = ['home', 'kkoe', 'company', 'stop', 'settle', 'journal', 'list']
JS = r"""() => {
 const out = {sw: document.documentElement.scrollWidth, small: [], taps: [], ext: [], red: [], styleAttr: document.querySelectorAll('[style]').length, styleTag: document.querySelectorAll('style').length, broken: [], bg: getComputedStyle(document.body).backgroundColor};
 const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const seen = new Set();
 while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el || el.closest('svg')) continue;
   const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]') || el.closest('[aria-hidden="true"]')) continue;
   const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue;
   const fs = parseFloat(cs.fontSize); if (fs < 17 && !seen.has(t)) { seen.add(t); out.small.push(fs + 'px:' + t.slice(0, 24)); } }
 document.querySelectorAll('button,summary,a,[role=button],input,select,label[for]').forEach(b => { const r = b.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return; if (getComputedStyle(b).visibility === 'hidden') return;
   if (r.height < 47.5 || r.width < 47.5) out.taps.push(Math.round(r.width) + 'x' + Math.round(r.height) + ':' + (b.innerText || b.getAttribute('aria-label') || b.tagName).trim().slice(0, 18)); });
 document.querySelectorAll('[src],[href],link,script[src]').forEach(e => { const u = e.getAttribute('src') || e.getAttribute('href') || ''; if (/^(https?:)?\/\//.test(u)) out.ext.push(u); });
 document.querySelectorAll('img').forEach(i => { if (!i.complete || i.naturalWidth === 0) out.broken.push(i.getAttribute('src')); });
 const toRgb = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); if (p.length > 3 && p[3] === 0) return null; return p.slice(0, 3); };
 document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e); for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'fill', 'stroke']) { const v = cs[prop]; const c = v && toRgb(v); if (!c) continue;
   const [r, g, b] = c.map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (d < 0.18) continue;
   const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
   if ((h >= 345 || h <= 12) && s > 0.5 && l > 0.25 && l < 0.7) out.red.push(prop + ' ' + v + ' ' + e.tagName.toLowerCase() + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className)); } });
 out.text = document.body.innerText; return out; }"""
async def main():
    os.makedirs(D + '/shots', exist_ok=True)
    pages = [p for p in PAGES if os.path.exists(f'{D}/{p}.html')]
    allp = []; firsts = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for name in pages:
            probs = []
            c2 = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='ko-KR')
            pg = await c2.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(f'file://{D}/{name}.html'); await pg.wait_for_timeout(1600)
            await pg.screenshot(path=f'{D}/shots/{name}-1.png'); firsts.append(f'{D}/shots/{name}-1.png')
            await pg.evaluate("()=>document.querySelectorAll('details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(250)
            r = await pg.evaluate(JS)
            await c2.close()
            c1 = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True, locale='ko-KR')
            p1 = await c1.new_page(); await p1.goto(f'file://{D}/{name}.html'); await p1.wait_for_timeout(1200)
            h = await p1.evaluate('document.documentElement.scrollHeight')
            await p1.screenshot(path=f'{D}/shots/{name}-full.png', full_page=True); await c1.close()
            if r['sw'] > 391: probs.append('가로 넘침 %dpx' % r['sw'])
            probs += ['글씨 작음 ' + s for s in r['small'][:8]]
            probs += ['누르는 곳 작음 ' + t for t in r['taps'][:8]]
            probs += ['밖 자원 ' + u for u in r['ext']]
            probs += ['그림 안 열림 ' + str(u) for u in r['broken']]
            probs += ['빨강 ' + x for x in r['red'][:5]]
            if r['styleAttr']: probs.append('style 속성 %d개(쓰지 말 것)' % r['styleAttr'])
            if r['styleTag']: probs.append('<style> 태그 %d개(style.css 로)' % r['styleTag'])
            if r['bg'] in ('rgba(0, 0, 0, 0)', 'transparent'): probs.append('바탕색 없음')
            t = r['text']
            if re.search(r'[一-鿿]', t): probs.append('한자 ' + ''.join(sorted(set(re.findall(r'[一-鿿]', t))))[:20])
            if '%' in t: probs.append('「%」 있음')
            eng = sorted(set(w for w in re.findall(r'[A-Za-z][A-Za-z&]*', t) if w not in latin_ok))
            if eng: probs.append('영어 ' + ' '.join(eng[:12]))
            for w in BAN:
                if w in t: probs.append('금지 말 「%s」' % w)
            if '앞날을 맞히지 않' not in t: probs.append('안전 문장 없음(앞날을 맞히지 않고 사고팔기를 권하지 않아요)')
            if name == 'home' and '10월 13일' not in t: probs.append('자료 날(10월 13일) 없음')
            probs += ['화면 오류 ' + e[:80] for e in errs[:3]]
            print(f'[{name}] 길이 {h / 844:.1f}화면 · 문제 {len(probs)}')
            for p in probs: print('  -', p)
            allp += probs
        await b.close()
    ims = [Image.open(f) for f in firsts]
    if ims:
        W = 390 * 2 // 2; Hh = 844 * 2 // 2
        sheet = Image.new('RGB', (len(ims) * (W + 24) + 24, Hh + 48), (236, 233, 228))
        for i, im in enumerate(ims): sheet.paste(im.resize((W, Hh), Image.LANCZOS), (24 + i * (W + 24), 24))
        sheet.save(D + '/sheet.png')
    print('쪽 %d · 문제 %d' % (len(pages), len(allp)) + (' · 문제 0' if not allp else ''))
asyncio.run(main())
