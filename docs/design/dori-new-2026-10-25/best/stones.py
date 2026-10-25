# 돌 그림 가족 — 진짜 사이트 site/media/stone/*.svg 를 그대로 쓰고 색만 고르신 100가지 가운데 가장 가까운 색으로
#   노란 작은 표시(#F9D21C)는 하늘청록(#1FB8CD) 한 점으로 · 그림 안 이름(id)은 그림마다 앞머리를 붙여 겹치지 않게
# 테마 시계판 — 돌 시계 판 위에 업종 77곳 점(site/next/data/theme-home.json inds 의 x · y)을 찍음
#   가운데 = 꽃 선(가로 5) × 지난 닷새 0 — 오른쪽 = 꽃 선 넘음 · 위 = 지난 닷새 시장보다 더 오름(사이트 theme-rule.js zoneOf 와 같은 네 자리)
#   방향은 자료 그대로 · 거리는 가운데 별을 피하려고 줄여 그림(가까울수록 가운데 쪽)
import re, json, os, math
D = os.path.dirname(os.path.abspath(__file__))
SRC = '/home/claude/atlas-space/site/media/stone'
DATA = '/home/claude/atlas-space/site/next/data'
PAL = [h.upper() for h in json.load(open(os.path.join(D, 'palette.json')))]
def _rgb(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
def near(h): a = _rgb(h); return min(PAL, key=lambda p: sum((x - y) ** 2 for x, y in zip(a, _rgb(p))))
ACC = '#1FB8CD'
def recolor(s):
    return re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: ACC if m.group(0).upper() == '#F9D21C' else near(m.group(0).upper()), s)

def stone(name, pid, cls='stone'):
    s = open(os.path.join(SRC, name + '.svg')).read()
    for i in sorted(set(re.findall(r'id="([^"]+)"', s)), key=len, reverse=True):
        s = s.replace(f'id="{i}"', f'id="{pid}-{i}"').replace(f'url(#{i})', f'url(#{pid}-{i})')
    s = recolor(s)
    return re.sub(r'<svg [^>]*>', f'<svg class="{cls}" viewBox="0 0 150 120" aria-hidden="true" focusable="false">', s, count=1)

# 시계판 축 — 그림 안 판의 비틀림(matrix .9564 .0003 -.0324 .9856 6.68 1.14)을 거친 (75, 60)
PX, PY = .9564 * 75 - .0324 * 60 + 6.68, .0003 * 75 + .9856 * 60 + 1.14
HAND_D, HAND_L = '#565F60', '#292928'
INDS = json.load(open(os.path.join(DATA, 'theme-home.json')))['inds']
BLOOM_X = json.load(open(os.path.join(DATA, 'theme-bloom.json')))['rule']['bloomX']

YS = 2.2  # 세로(닷새)는 가로(한 달)보다 폭이 작아 2.2배로 펴서 그림 — 네 자리는 그대로
def pos(x, y, z=None):
    dx, dy = x - BLOOM_X, y * YS
    if z in ('Q', 'W') and dy > -.6:  # 0 으로 반올림돼 선 위에 앉은 잠잠 · 시듦(예: 호텔·레저 y 0 · z Q)은 선 바로 아래로
        dy = -.6
    r = math.hypot(dx, dy)
    if r == 0:
        return PX, PY - 8.6
    rr = 8.6 + 18.2 * (r / (r + 5))
    return PX + rr * dx / r, PY - rr * dy / r

QUAD = {  # 판 위 네 자리(시계 방향 차례 · 반지름 R)
    'S': lambda R: f'M{PX:.2f} {PY:.2f}L{PX - R:.2f} {PY:.2f}A{R} {R} 0 0 1 {PX:.2f} {PY - R:.2f}Z',
    'B': lambda R: f'M{PX:.2f} {PY:.2f}L{PX:.2f} {PY - R:.2f}A{R} {R} 0 0 1 {PX + R:.2f} {PY:.2f}Z',
    'W': lambda R: f'M{PX:.2f} {PY:.2f}L{PX + R:.2f} {PY:.2f}A{R} {R} 0 0 1 {PX:.2f} {PY + R:.2f}Z',
    'Q': lambda R: f'M{PX:.2f} {PY:.2f}L{PX:.2f} {PY + R:.2f}A{R} {R} 0 0 1 {PX - R:.2f} {PY:.2f}Z',
}

def theme_clock(pid, lit='S', tint=None, ring=(), hh=9, mm=41, sec=True, cls='clock', dots=True):
    """lit = 하늘청록으로 칠할 자리 · tint = 옅게 물들일 자리 · ring = 테를 둘러 크게 보일 업종 이름들"""
    s = stone('home-clock', pid, cls)
    over = ''
    if tint:
        over += f'<path d="{QUAD[tint](28.6)}" fill="rgba(31,184,205,.2)"/>'
    if dots:
        rest, hot = '', ''
        for i in INDS:
            x, y = pos(i['x'], i['y'], i['z'])
            if i['n'] in ring:
                continue
            if i['z'] == lit:
                hot += f'<circle cx="{x:.2f}" cy="{y:.2f}" r="1.15" fill="{ACC}" stroke="#152D30" stroke-width=".4"/>'
            else:
                rest += f'<circle cx="{x:.2f}" cy="{y:.2f}" r=".95" fill="#606868"/>'
        over += rest + hot
        for i in INDS:
            if i['n'] in ring:
                x, y = pos(i['x'], i['y'], i['z'])
                over += f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.6" fill="{ACC}" stroke="#171615" stroke-width="1"/>'
    k = .975
    def hand(tip, half):
        y = PY - (PY - tip) * k
        return (f'<path d="M{PX:.2f} {PY + 3 * k:.2f}L{PX - half:.2f} {PY + .4:.2f}L{PX:.2f} {y:.2f}Z" fill="{HAND_D}"/>'
                f'<path d="M{PX:.2f} {PY + 3 * k:.2f}L{PX + half:.2f} {PY + .4:.2f}L{PX:.2f} {y:.2f}Z" fill="{HAND_L}"/>')
    t1, t2 = PY - (PY - 32.8) * k, PY - (PY - 28.9) * k
    hands = (f'<g transform="rotate({(hh % 12) * 30 + mm * .5:.2f} {PX:.2f} {PY:.2f})">{hand(42, 1.9)}</g>'
             f'<g transform="rotate({mm * 6:.2f} {PX:.2f} {PY:.2f})">{hand(28.4, 1.3)}'
             f'<path d="M{PX:.2f} {t1:.2f}V{t2:.2f}" stroke="{ACC}" stroke-width="1.6" stroke-linecap="round"/></g>')
    if sec:
        hands += (f'<g class="sec" style="transform-origin:{PX:.2f}px {PY:.2f}px">'
                  f'<path d="M{PX:.2f} {PY + 6:.2f}V{PY - (PY - 27.2) * k:.2f}" stroke="{ACC}" stroke-width=".8" stroke-linecap="round"/></g>')
    hands += f'<circle cx="{PX:.2f}" cy="{PY:.2f}" r="2.5" fill="{HAND_D}" stroke="{HAND_L}" stroke-width=".45"/><circle cx="{PX:.2f}" cy="{PY:.2f}" r=".9" fill="{HAND_L}"/>'
    return s.replace('</svg>', over + hands + '</svg>')

if __name__ == '__main__':
    from collections import Counter
    c = Counter()
    for i in INDS:
        x, y = pos(i['x'], i['y'], i['z'])
        c[(i['z'], 'L' if x < PX else 'R', 'T' if y <= PY else 'B')] += 1
    print(c)
