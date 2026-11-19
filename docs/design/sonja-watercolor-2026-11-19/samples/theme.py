# 수채화 바탕 판(샘플 셋 공통) — 한지 · 먹 밤색 → 옥빛 종이 · 쪽빛 먹 · 물빛(빨강 없음) · 샘플 판 dist 의 파일만 새로 씀(원본 dist3 그대로)
import re, sys, os, urllib.parse
S = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad'
D = sys.argv[1]
MAP = {
 '#F8F4EB': '#F3F8F6', '#FFFDF8': '#FCFEFD', '#1E1914': '#20323A', '#15120E': '#1B3A44', '#5B4F43': '#4A6168', '#3A332B': '#2E444C',
 '#ADA394': '#9DB5B8', '#4A2C22': '#2F4A55', '#E9E2D5': '#DCEBE7', '#8C8173': '#7D969B', '#6B4A3E': '#4E6C76', '#D9C9AE': '#C5DCD8',
 '#FBF6EC': '#F4FAF8', '#F1EBDF': '#E6F1EE', '#F3E3BC': '#F2E6D9', '#F1E3D3': '#E8F1EE', '#E0D6C4': '#D3E3DF', '#F1EADD': '#E8F2EF',
 '#8A7A66': '#7A9298', '#4E463D': '#3C545B', '#FCFAF5': '#F8FCFB', '#E6DFD2': '#DAE8E4', '#CFC6B8': '#BFD3D2', '#4A433A': '#364E55',
 '#F3EDE2': '#EAF3F0', '#8A5A44': '#5F8580', '#6A6156': '#566C70', '#7A4C38': '#4D6F78', '#E4D0B6': '#D4E5E0', '#F7ECDF': '#EDF5F2',
 '#8A8174': '#7A9196', '#3B1A14': '#2F4A55', '#EBD9C4': '#D9EAE5', '#D9BFA3': '#C7DCD7', '#B8A08E': '#9DB8BA', '#A87A44': '#B48A55',
 '#FBF6EE': '#F2F8F6', '#EDE3D2': '#DDEBE7', '#D4C3B4': '#C3D6D4', '#D8C7B8': '#C7DAD7', '#FFFEFA': '#FBFEFD', '#D6BA8F': '#CFDCCB', '#7A6553': '#5C7277', '#8A6747': '#5E7A7E',
}
RGBA = [((21, 18, 14), (27, 58, 68)), ((248, 244, 235), (243, 248, 246)), ((241, 227, 211), (232, 241, 238)), ((120, 100, 70), (80, 110, 115)), ((30, 25, 20), (32, 50, 58))]
def remap(t):
    t = re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: MAP.get(m.group(0).upper(), m.group(0)), t)
    t = re.sub(r'%23([0-9A-Fa-f]{6})\b', lambda m: '%23' + MAP.get('#' + m.group(1).upper(), '#' + m.group(1)).lstrip('#'), t)
    for (a, b) in RGBA:
        t = re.sub(r'rgba?\(\s*%d\s*,\s*%d\s*,\s*%d' % a, lambda m, b=b: m.group(0).split('(')[0] + '(%d, %d, %d' % b, t)
    return t
def put(path, text):
    if os.path.exists(path): os.remove(path)   # 굳은 링크 끊고 새로 씀(원본 그대로)
    open(path, 'w', encoding='utf-8').write(text)
src = lambda f: open(os.path.join(S, 'dist3', f), encoding='utf-8').read()
css = remap(src('su/su-sonja.css'))
ink = src('su/su-sonja-ink.js')
ink = ink.replace("export const INK = '#3B1A14', NAVY = '#1F2A44', PAPER = '#F1E3D3', ACC = '#8A5A44', SOFT = '#B8A08E';",
                  "export const INK = '#2F4A55', NAVY = '#2E4A62', PAPER = '#EEF5F2', ACC = '#B48A55', SOFT = '#9DB8BA';")
ink = remap(ink)
hero = remap(src('su/su-sonja-hero.svg'))
html = src('su/index.html')
old = src('su/su-sonja-hero.svg')
enc = lambda x: x.replace('"', "'").replace('\n', '').replace('%', '%25').replace('#', '%23').replace('<', '%3C').replace('>', '%3E')
if enc(old) in html: html = html.replace(enc(old), enc(hero))
html = remap(html)
extra = open(sys.argv[2], encoding='utf-8').read() if len(sys.argv) > 2 else ''
put(os.path.join(D, 'su/su-sonja.css'), css + '\n' + extra)
put(os.path.join(D, 'su/su-sonja-ink.js'), ink)
put(os.path.join(D, 'su/su-sonja-hero.svg'), hero)
put(os.path.join(D, 'su/index.html'), html)
print('theme ok', D, len(css), 'hero in html', enc(hero) in html)
