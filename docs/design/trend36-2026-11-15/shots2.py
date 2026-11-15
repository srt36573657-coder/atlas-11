# 샘플 그림 찍기 — 첫 화면 · 판별 칸 · 전체 · 셋 나란히
import asyncio, os, base64, sys
ONLY = sys.argv[1:] or ['a', 'b', 'c']
from playwright.async_api import async_playwright
S = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/s1508/samples'
INFO = {
    'a': ('샘플 3-1', '죽간 한 장', '36명 가운데 22명이 골랐어요', '빈 면 위 세로줄 칸이에요'),
    'b': ('샘플 3-2', '굵은 먹글 판', '36명 가운데 17명이 골랐어요', '글씨 굵기로만 차례를 세웠어요'),
    'c': ('샘플 3-3', '도시락 칸', '도시락 판 둘을 28명이 골랐어요', '큰 칸 하나에 오늘 땅이에요'),
}

def b64(p):
    return 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for n in ONLY:
            f = f'{S}/sample-3{n}.html'
            if not os.path.exists(f):
                print('없음', f); continue
            pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
            await pg.goto('file://' + f)
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'{S}/sample-3{n}-first.png')
            await pg.evaluate('()=>window.scrollTo(0,0)')
            if True:
                loc = pg.locator('text=/^\\s*꽃이 될\\s*$/ >> visible=true').first
                off = 24
            try:
                box = await loc.bounding_box(timeout=3000)
            except Exception:
                box = None
            if not box:
                loc = pg.locator('text=한진칼 >> visible=true').first
                box = await loc.bounding_box(); off = 190
            if box:
                y = max(0, box['y'] - off)
                await pg.screenshot(path=f'{S}/sample-3{n}-judge.png', full_page=True,
                                    clip={'x': 0, 'y': y, 'width': 390, 'height': 760})
            await pg.close()
            pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
            await pg.goto('file://' + f)
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'{S}/sample-3{n}-full.png', full_page=True)
            await pg.close()
        # 셋 나란히(첫 화면) · 샘플마다 두 장(첫 화면 + 판별 칸)
        css = ("body{margin:0;background:#E9E4D8;font-family:'Noto Sans CJK KR',sans-serif;color:#1C1B19}"
               ".row{display:flex;gap:28px;padding:28px 28px 32px}.col{width:390px}"
               ".t{font-size:30px;font-weight:900;margin:0 0 4px}.v{font-size:21px;font-weight:700;margin:0 0 4px}"
               ".h{font-size:20px;margin:0 0 14px}.ph{width:390px;border-radius:26px;border:3px solid #1C1B19;overflow:hidden;background:#fff}"
               ".ph img{display:block;width:390px}.cap{font-size:20px;font-weight:700;margin:12px 0 0}")
        cols = ''
        for n in ONLY:
            fp = f'{S}/sample-3{n}-first.png'
            if not os.path.exists(fp): continue
            a, nm, vote, how = INFO[n]
            cols += (f"<div class='col'><p class='t'>{a} · {nm}</p><p class='v'>{vote}</p><p class='h'>{how}</p>"
                     f"<div class='ph'><img src='{b64(fp)}'></div></div>")
        pg = await b.new_page(viewport={'width': 1290, 'height': 800}, device_scale_factor=2)
        await pg.set_content(f"<html><head><meta charset='utf-8'><style>{css}</style></head><body><div class='row'>{cols}</div></body></html>")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{S}/three-trend-first.png', full_page=True)
        await pg.close()
        for n in ONLY:
            fp, jp = f'{S}/sample-3{n}-first.png', f'{S}/sample-3{n}-judge.png'
            if not (os.path.exists(fp) and os.path.exists(jp)): continue
            a, nm, vote, how = INFO[n]
            html = (f"<div class='row'><div class='col'><p class='t'>{a} · {nm}</p><p class='v'>첫 화면</p><p class='h'>{vote}</p>"
                    f"<div class='ph'><img src='{b64(fp)}'></div></div>"
                    f"<div class='col'><p class='t'>&nbsp;</p><p class='v'>한눈에 가르는 칸</p><p class='h'>{how}</p>"
                    f"<div class='ph'><img src='{b64(jp)}'></div></div></div>")
            pg = await b.new_page(viewport={'width': 864, 'height': 800}, device_scale_factor=2)
            await pg.set_content(f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>{html}</body></html>")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'{S}/sample-3{n}-pair.png', full_page=True)
            await pg.close()
        await b.close()
    print('끝')

asyncio.run(main())
