# 돌 시계 — 진짜 사이트 돌 시계(site/media/stone/home-clock.svg + stone-clock.js 바늘)를 그대로 따라 그리고
# 색만 고르신 100가지 가운데 가장 가까운 색으로 바꿈 · 노란 바늘 끝 = 맑은 하늘청록(#1FB8CD · 한 화면 한 곳 빛)
import re, json, os
D = os.path.dirname(os.path.abspath(__file__))
ORIG = open(os.path.join(D, 'orig.svg')).read()
PAL = [h.upper() for h in json.load(open(os.path.join(D, 'palette.json')))]
def _rgb(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
def near(h): a = _rgb(h); return min(PAL, key=lambda p: sum((x - y) ** 2 for x, y in zip(a, _rgb(p))))
# 바늘 축 — 그림 안 판의 비틀림(matrix .9564 .0003 -.0324 .9856 6.68 1.14)을 거친 (75, 60)
PX, PY = .9564 * 75 - .0324 * 60 + 6.68, .0003 * 75 + .9856 * 60 + 1.14
HAND_D, HAND_L = '#565F60', '#292928'
ACC = '#1FB8CD'

def stone_clock(pid, hh=9, mm=41, ss=0, sec=True, cls='clock', extra=''):
    s = ORIG.replace('st-home-', pid + '-')
    s = re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: near(m.group(0).upper()), s)
    s = re.sub(r'<svg [^>]*>', f'<svg class="{cls}" viewBox="0 0 150 120" aria-hidden="true" focusable="false">', s, count=1)
    h_ang = (hh % 12) * 30 + mm * .5
    m_ang = mm * 6 + ss * .1
    s_ang = ss * 6
    k = .975  # 바늘 길이 — 판 비틀림 크기만큼 살짝 줄임
    def hand(tip, half):
        y = PY - (PY - tip) * k
        return (f'<path d="M{PX:.2f} {PY + 3 * k:.2f}L{PX - half:.2f} {PY + .4:.2f}L{PX:.2f} {y:.2f}Z" fill="{HAND_D}"/>'
                f'<path d="M{PX:.2f} {PY + 3 * k:.2f}L{PX + half:.2f} {PY + .4:.2f}L{PX:.2f} {y:.2f}Z" fill="{HAND_L}"/>')
    tip_y1, tip_y2 = PY - (PY - 32.8) * k, PY - (PY - 28.9) * k
    hands = (f'<g transform="rotate({h_ang:.2f} {PX:.2f} {PY:.2f})">{hand(42, 1.9)}</g>'
             f'<g transform="rotate({m_ang:.2f} {PX:.2f} {PY:.2f})">{hand(28.4, 1.3)}'
             f'<path d="M{PX:.2f} {tip_y1:.2f}V{tip_y2:.2f}" stroke="{ACC}" stroke-width="1.6" stroke-linecap="round"/></g>')
    if sec:
        hands += (f'<g transform="rotate({s_ang:.2f} {PX:.2f} {PY:.2f})"><g class="sec" style="transform-origin:{PX:.2f}px {PY:.2f}px">'
                  f'<path d="M{PX:.2f} {PY + 6:.2f}V{PY - (PY - 27.2) * k:.2f}" stroke="{ACC}" stroke-width=".8" stroke-linecap="round"/>'
                  f'<circle cx="{PX:.2f}" cy="{PY - (PY - 27.2) * k + 1.2:.2f}" r=".9" fill="{ACC}"/></g></g>')
    hands += f'<circle cx="{PX:.2f}" cy="{PY:.2f}" r="2.5" fill="{HAND_D}" stroke="{HAND_L}" stroke-width=".45"/><circle cx="{PX:.2f}" cy="{PY:.2f}" r=".9" fill="{HAND_L}"/>'
    return s.replace('</svg>', extra + hands + '</svg>')

if __name__ == '__main__':
    open(os.path.join(D, 'try.svg'), 'w').write(stone_clock('t1'))
    print(sorted(set(re.findall(r'#[0-9A-F]{6}', stone_clock('t1')))))
