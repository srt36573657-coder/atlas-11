# ATLAS 밤하늘 옷 ③ — 입히기: style.css 토큰(밝은 · 어두운) + 그 밖 청자 계열(OKLCH 색상 120~200도) 색을 영상 중심색 계열로(밝기 그대로)
#   가(초대장 사진) · 나(소개 영상) 파일은 건드리지 않음(사장님 2026-10-10 10:00 「가 나 는 지우지마」) · 2026-10-10 한 번 돌린 기록
#   쓰는 법: python3 scripts/atlas11/design/night_violet/recolor.py <폴더(palette.json 있는 곳)> <저장소> [--dry]
import sys, re, json, glob, collections
SP, ROOT, DRY = sys.argv[1], sys.argv[2], len(sys.argv) > 3 and sys.argv[3] == '--dry'
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from okc import *
P = json.load(open(SP + '/palette.json')); NL, ND = P['light'], P['dark']
css_p = ROOT + '/site/app/style.css'; css = open(css_p, encoding='utf8').read()
la = css.index(':root {'); lb = css.index('}', la)
dm = css.index('@media (prefers-color-scheme: dark)'); da = css.index(':root {', dm); db = css.index('}', da)
tok = lambda block: dict(re.findall(r'--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})', block))
OL, OD = tok(css[la:lb]), tok(css[da:db])
def gen(hx):  # 청자 계열(색상 120~200 · 채도 0.004 이상) → 영상 중심색 계열(밝기 그대로 · 색상 285~293 · 채도 1.25배)
    L, C, h = hex2oklch(hx)
    if C < 0.004 or not (120 <= h <= 200): return None
    if L < 0.35: return oklch2hex(L, min(0.06, max(C * 2.5, 0.03)), 278 + (h - 170) * 0.3)  # 짙은 판 = 영상 밤하늘(색상 276 · 채도 0.06)
    return oklch2hex(L, min(C * 1.25, 0.14), 289 + (h - 168) * 0.3)
cmap, why = {}, {}
for k, v in OL.items():
    if k in NL and NL[k].upper() != v.upper(): cmap.setdefault(v.upper(), NL[k].upper()); why.setdefault(v.upper(), 'light --' + k)
for k, v in OD.items():
    if k in ND and ND[k].upper() != v.upper(): cmap.setdefault(v.upper(), ND[k].upper()); why.setdefault(v.upper(), 'dark --' + k)
def mapped(hx):
    hx = hx.upper(); h6 = '#' + ''.join(c * 2 for c in hx[1:]) if len(hx) == 4 else hx
    if h6 in cmap: return cmap[h6]
    g = gen(h6)
    if g: why.setdefault(h6, 'gen'); cmap[h6] = g.upper()
    return cmap.get(h6)
log = collections.Counter()
def sub_hex(text, fname):
    def rh(m):
        n = mapped(m.group(0))
        if n and n != m.group(0).upper(): log[(fname, m.group(0).upper(), n)] += 1; return n
        return m.group(0)
    def rr(m):
        r, g, b = (int(x) for x in m.group(2, 3, 4)); hx = '#%02X%02X%02X' % (r, g, b); n = mapped(hx)
        if not n or n == hx: return m.group(0)
        nr, ng, nb = (int(n[i:i + 2], 16) for i in (1, 3, 5)); log[(fname, f'rgb({r},{g},{b})', n)] += 1
        return f'{m.group(1)}({nr}, {ng}, {nb}{m.group(5) or ""})'
    text = re.sub(r'#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![0-9A-Fa-f])', rh, text)
    return re.sub(r'(rgba?)\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)', rr, text)
# 1) 토큰 칸: 이름으로 바꿈(같은 옛 값이 두 이름이어도 이름마다 새 값)
def set_block(block, new):
    def r(m):
        k = m.group(1)
        if k in new and new[k].upper() != m.group(2).upper(): log[('style.css:token', f'--{k} {m.group(2).upper()}', new[k])] += 1; return f'--{k}: {new[k]}'
        return m.group(0)
    return re.sub(r'--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})', r, block)
lblock, dblock = set_block(css[la:lb], NL), set_block(css[da:db], ND)
# 토큰 칸 안 rgba(바탕 그림자 · 머리카락 선)도 같은 짝으로
lblock, dblock = sub_hex(lblock, 'style.css:light'), sub_hex(dblock, 'style.css:dark')
css2 = sub_hex(css[:la], 'style.css') + lblock + sub_hex(css[lb:da], 'style.css') + dblock + sub_hex(css[db:], 'style.css')
SKIP = {'hello.css', 'hello.js', 'hello-page.js', 'hello-share.js', 'invite.css', 'invite.js', 'invite-photo.js'}  # 가 · 나
out = {css_p: css2}
for f in sorted(glob.glob(ROOT + '/site/app/*.css') + glob.glob(ROOT + '/site/app/*.js')):
    if f == css_p or f.split('/')[-1] in SKIP: continue
    t = open(f, encoding='utf8').read(); t2 = sub_hex(t, f.split('/')[-1])
    if t2 != t: out[f] = t2
for (fn, a, b), n in sorted(log.items()): print(f'{fn:18s} {a:26s} → {b} ×{n}  ({why.get(a.split()[-1] if a.startswith("--") else a, "token")})')
print('files', [k.split('/')[-1] for k in out])
if not DRY:
    for f, t in out.items(): open(f, 'w', encoding='utf8').write(t)
    json.dump({k: v for k, v in cmap.items()}, open(SP + '/cmap.json', 'w'), indent=1)
