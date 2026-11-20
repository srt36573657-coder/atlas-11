"""손자병법 첫 쪽 「오늘 한 장」 뒤 대나무 숲(먹 그림) — site/su/su-bamboo.svg 를 만든다(주문 1120-1422)
사장님 2026-11-20(마카오) 14:22 「여기 첫화면에 멋진 대나무밭 그림 그려서 기품있게 예술적으로 기백있게 만들어봐 공부하고 예술적으로 작업해 기 있게」
보내 주신 그림(남의 작품)은 베끼지 않음 — 쪽빛 먹 · 마른 붓 줄기 · 바람 잎의 느낌만 배워 새로 그림
배운 것
  1. 이정 「풍죽도」 — 바람에 활처럼 휘면서도 꺾이지 않는 줄기 · 줄기와 잎의 균형 · 마디는 양끝이 두툼한 호형선 · 가까운 대는 짙은 먹, 먼 대는 옅은 먹(세계일보 2021-12-15)
  2. 커지우쓰(원) 「문동을 본뜬 묵죽」 — 밑동도 끝도 보이지 않게 잘라 잎과 가지가 떠 있는 듯 · 먹의 짙고 옅음과 밀어 올리는 붓질이 잎에 기운을 줌(메트로폴리탄 미술관)
그림 규칙: 빨강 0 · 글자 0(한자 0) · 줄기는 아래에서 위로 화면 밖까지(밑동 · 끝 안 보임) · 바람은 오른쪽에서 — 잎은 왼쪽으로 쏠림 · 천천히 흔들림(움직임 줄이기 설정이면 멈춤)
쓰임: python3 scripts/atlas11/next/su_bamboo.py  (같은 씨앗이면 늘 같은 그림)
"""
import math, random, sys, os, json

W, H = 300, 460
R = random.Random(1120142)
INK = {'dark': '#27236E', 'mid': '#4339A8', 'light': '#8C86DB', 'pale': '#BDB9EE'}
PAPER = '#FCFEFD'
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.') if abs(v - round(v)) > 1e-9 else str(int(round(v)))


def stalk_x(st, t):
    """줄기 가운데 줄 — t 0(아래 · 화면 밖) → 1(위 · 화면 밖) · 바람에 왼쪽으로 활처럼 휨"""
    return st['x0'] + (st['x1'] - st['x0']) * t + st['bow'] * math.sin(math.pi * t)


def y_of(t):
    return (H + 14) - (H + 28) * t


def t_of(y):
    return ((H + 14) - y) / (H + 28)


def seg_path(st, ya, yb):
    """마디 사이 한 칸 = 붓 한 번 — 아래(붓 누름)가 조금 넓고 위(붓 뗌)로 살짝 좁음 · 가장자리는 붓결처럼 조금씩 떨림"""
    n = 10
    left, right = [], []
    for i in range(n + 1):
        y = ya + (yb - ya) * i / n
        u = i / n
        w = st['w'] * (1.04 - 0.1 * u + 0.05 * math.sin(math.pi * u)) / 2
        x = stalk_x(st, t_of(y))
        jl, jr = R.uniform(-0.035, 0.035) * st['w'], R.uniform(-0.035, 0.035) * st['w']
        left.append((x - w + jl, y)); right.append((x + w + jr, y))
    pts = left + right[::-1]
    return 'M' + ' L'.join(f(x) + ' ' + f(y) for x, y in pts) + 'Z'


def press(st, ya, yb, ink):
    """붓 누름 — 칸 아래 끝을 조금 더 짙게(먹이 고임)"""
    y1, y2 = ya, ya - (ya - yb) * 0.16
    x1, x2 = stalk_x(st, t_of(y1)), stalk_x(st, t_of(y2))
    w = st['w'] * 0.53
    return '<path d="M%s %sL%s %sL%s %sL%s %sZ" fill="%s" opacity=".55"/>' % (f(x1 - w), f(y1), f(x1 + w), f(y1), f(x2 + w * 0.9), f(y2), f(x2 - w * 0.9), f(y2), INK['dark'])


def streaks(st, ya, yb):
    """마른 붓(비백) — 칸 안에 흰 결 두세 줄"""
    out = []
    for _ in range(R.choice([3, 4, 4, 5]) if st['w'] > 9 else R.choice([1, 2])):
        off = R.uniform(-0.34, 0.34) * st['w']
        a, b = R.uniform(0.04, 0.3), R.uniform(0.55, 0.96)
        y1, y2 = ya + (yb - ya) * a, ya + (yb - ya) * b
        x1, x2 = stalk_x(st, t_of(y1)) + off, stalk_x(st, t_of(y2)) + off + R.uniform(-0.6, 0.6)
        sw = R.uniform(0.6, 1.5) * (st['w'] / 12)
        out.append('<path d="M%s %sL%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round" opacity="%s"/>' % (f(x1), f(y1), f(x2), f(y2), PAPER, f(sw), f(R.uniform(0.32, 0.6))))
    return ''.join(out)


def node(st, y, ink):
    """마디 — 양끝이 두툼한 호형선(이정) · 초승달 한 덩이(가운데는 가늘고 양끝은 두툼)"""
    x = stalk_x(st, t_of(y)); w = st['w'] * 0.66; dip = st['w'] * 0.3; th = max(1.2, st['w'] * 0.2)
    d = 'M%s %sQ%s %s %s %sL%s %sQ%s %s %s %sZ' % (f(x - w), f(y - th * 0.6), f(x), f(y + dip), f(x + w), f(y - th * 0.6),
        f(x + w * 0.86), f(y + th * 0.5), f(x), f(y + dip + th * 0.35), f(x - w * 0.86), f(y + th * 0.5))
    return '<path d="%s" fill="%s"/>' % (d, INK['dark'] if st['ink'] in ('dark', 'mid') else ink)


def leaf(px, py, ang, L, wd, ink, op):
    """잎 하나 = 붓 한 번 — 밑은 눌러 시작 · 3분의 1쯤 가장 넓고 · 끝은 붓을 튕겨 날카롭게(바람 쪽으로 살짝 휨)"""
    ca, sa = math.cos(ang), math.sin(ang)
    nx, ny = -sa, ca
    bend = R.uniform(-0.12, 0.12) * L
    P = lambda a, b: (px + ca * a + nx * b, py + sa * a + ny * b)
    c1, c2, tip, c3, c4 = P(0.12 * L, 0.42 * wd), P(0.42 * L, 0.62 * wd + bend * 0.35), P(L, bend), P(0.5 * L, -0.42 * wd + bend * 0.5), P(0.1 * L, -0.34 * wd)
    d = 'M%s %sC%s %s %s %s %s %sC%s %s %s %s %s %sZ' % (f(px), f(py), f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(tip[0]), f(tip[1]), f(c3[0]), f(c3[1]), f(c4[0]), f(c4[1]), f(px), f(py))
    core = ''
    if wd >= 5.5:
        L2, w2 = L * 0.56, wd * 0.5
        k1, k2, k3, k4, k5 = P(0.12 * L2, 0.4 * w2), P(0.45 * L2, 0.6 * w2 + bend * 0.2), P(L2, bend * 0.3), P(0.5 * L2, -0.4 * w2 + bend * 0.25), P(0.1 * L2, -0.3 * w2)
        dk = INK['dark'] if ink != INK['dark'] else INK['dark']
        core = '<path d="M%s %sC%s %s %s %s %s %sC%s %s %s %s %s %sZ" fill="%s" opacity="%s"/>' % (f(px), f(py), f(k1[0]), f(k1[1]), f(k2[0]), f(k2[1]), f(k3[0]), f(k3[1]), f(k4[0]), f(k4[1]), f(k5[0]), f(k5[1]), f(px), f(py), dk, f(min(1, op * 0.55)))
    return '<path d="%s" fill="%s" opacity="%s"/>' % (d, ink, f(op * 0.86)) + core


PAT = {'gae': [-22, 0, 17], 'ga4': [-30, -11, 7, 23], 'bun': [-13, 14], 'one': [0]}  # 개(个) · 개(介) · 분(分) · 하나


def cluster(px, py, base_deg, L, wd, ink, op, pat, cid, delay):
    angs = PAT[pat]
    parts = []
    for i, d in enumerate(angs):
        a = math.radians(base_deg + d + R.uniform(-5, 5))
        k = 1.0 if d == 0 else R.uniform(0.78, 0.95)
        ik = ink if R.random() < 0.62 or ink in (INK['pale'], INK['light']) else (INK['mid'] if ink == INK['dark'] else INK['dark'])
        parts.append(leaf(px, py, a, L * k, wd * (0.85 + 0.25 * R.random()), ik, op * R.uniform(0.82, 1.0)))
    return '<g>%s</g>' % ''.join(parts)


def branch(px, py, dx, dy, ink, sw):
    """가지 — 마디에서 위 · 왼쪽으로 · 끝에 잔가지"""
    mx, my = px + dx * 0.5 + R.uniform(-3, 3), py + dy * 0.6
    ex, ey = px + dx, py + dy
    tw = '<path d="M%s %sQ%s %s %s %s" stroke="%s" stroke-width="%s" fill="none" stroke-linecap="round"/>' % (f(px), f(py), f(mx), f(my), f(ex), f(ey), ink, f(sw))
    return tw, (ex, ey)


def draw_stalk(st, layer_op, leaves_plan, cls_delay):
    ink = INK[st['ink']]
    ys, y = [], H + 14
    while y > -20:
        step = R.uniform(*st['seg'])
        ys.append((y, y - step)); y -= step + st['gap']
    body = []
    for ya, yb in ys:
        body.append('<path d="%s" fill="url(#bk%s)"/>' % (seg_path(st, ya, yb), st['ink']))
        if st['w'] > 9: body.append(press(st, ya, yb, ink))
        body.append(streaks(st, ya, yb))
    nodes = ''.join(node(st, yb - st['gap'] / 2, ink) for ya, yb in ys[:-1])
    br = []
    for (frac, dx, dy, base_deg, L, wd, pat) in leaves_plan:
        yy = y_of(frac); xx = stalk_x(st, frac)
        tw, (ex, ey) = branch(xx, yy, dx, dy, ink, max(1.0, st['w'] * 0.16))
        br.append(tw)
        br.append(cluster(ex, ey, base_deg, L, wd, ink, 0.96, pat, len(br), R.uniform(0, 7)))
        if R.random() < 0.6:  # 마디에 바로 붙은 잎 한 무더기
            br.append(cluster(xx - st['w'] * 0.3, yy - 2, base_deg + R.uniform(-10, 12), L * 0.82, wd * 0.9, ink, 0.9, R.choice(['bun', 'gae']), len(br), R.uniform(0, 7)))
    ox, oy = stalk_x(st, 0.0), H + 14
    return '<g opacity="%s">%s%s%s</g>' % (f(layer_op), ''.join(body), nodes, ''.join(br))


# 먼 대(옅은 먹) — 뒤 · 가는 줄기 · 숲(밭)의 깊이(왼쪽 것은 글 뒤라 아주 옅게)
FAR = [
    {'x0': 66, 'x1': 52, 'bow': -5, 'w': 4.2, 'ink': 'pale', 'seg': (56, 76), 'gap': 1.8},
    {'x0': 118, 'x1': 98, 'bow': -6, 'w': 4.8, 'ink': 'pale', 'seg': (58, 80), 'gap': 2.0},
    {'x0': 170, 'x1': 146, 'bow': -7, 'w': 5.4, 'ink': 'pale', 'seg': (60, 82), 'gap': 2.0},
    {'x0': 214, 'x1': 196, 'bow': -10, 'w': 6.4, 'ink': 'light', 'seg': (62, 84), 'gap': 2.2},
    {'x0': 298, 'x1': 300, 'bow': -8, 'w': 7.6, 'ink': 'light', 'seg': (66, 90), 'gap': 2.4},
]
# 가운데 대(중간 먹)
MIDS = [
    {'x0': 236, 'x1': 228, 'bow': -12, 'w': 8.6, 'ink': 'mid', 'seg': (64, 88), 'gap': 2.6},
]
# 가까운 대(짙은 먹) — 앞 · 굵은 줄기 · 바람에 활처럼 휨
NEAR = [
    {'x0': 268, 'x1': 206, 'bow': -32, 'w': 19.0, 'ink': 'dark', 'seg': (72, 98), 'gap': 3.6},
    {'x0': 290, 'x1': 272, 'bow': -14, 'w': 10.5, 'ink': 'mid', 'seg': (66, 88), 'gap': 2.8},
]
# 잎 계획 — (줄기 높이 0~1, 가지 dx, dy, 잎 방향(도 · 180 = 왼쪽), 잎 길이, 잎 너비, 무늬) · 짙은 잎은 오른쪽 반에만(왼쪽은 글 자리)
PLAN_FAR = [
    [(0.86, -14, -8, 178, 24, 4.4, 'bun')],
    [(0.80, -16, -10, 176, 28, 5.0, 'gae')],
    [(0.74, -18, -12, 174, 32, 5.6, 'gae'), (0.90, -14, -8, 182, 26, 4.8, 'bun')],
    [(0.70, -22, -14, 174, 36, 6.6, 'gae'), (0.88, -18, -10, 182, 32, 6.0, 'bun')],
    [(0.62, -26, -16, 170, 40, 7.0, 'ga4'), (0.84, -20, -12, 180, 36, 6.4, 'gae')],
]
PLAN_MID = [
    [(0.60, -22, -14, 172, 44, 8.6, 'gae'), (0.82, -20, -12, 180, 40, 8.0, 'ga4')],
]
PLAN_NEAR = [
    [(0.50, -26, -14, 162, 64, 13.0, 'ga4'), (0.64, -30, -18, 170, 74, 14.0, 'gae'), (0.78, -26, -16, 178, 68, 13.0, 'ga4'), (0.92, -20, -12, 190, 58, 11.5, 'gae')],
    [(0.56, -22, -14, 168, 50, 10.5, 'gae'), (0.72, -24, -16, 176, 54, 11.0, 'ga4'), (0.88, -18, -12, 186, 46, 9.5, 'bun')],
]

parts = []
for st, plan in zip(FAR, PLAN_FAR):
    parts.append(draw_stalk(st, 0.42 if st['x0'] < 190 else 0.58, plan, 0))
for st, plan in zip(MIDS, PLAN_MID):
    parts.append(draw_stalk(st, 0.78, plan, 0))
for st, plan in zip(NEAR, PLAN_NEAR):
    parts.append(draw_stalk(st, 0.95, plan, 0))

# 바람에 날리는 먼 잎(옅게) — 위쪽 하늘에 숲 지붕처럼 · 글 자리(왼쪽 아래)는 비움(여백)
drift = []
for _ in range(9):
    x, y = R.uniform(40, 260), R.uniform(4, 70)
    drift.append(cluster(x, y, R.uniform(168, 192), R.uniform(20, 32), 4.6, INK['pale'], 0.55, R.choice(['bun', 'gae', 'one']), 0, 0))

GSTOP = {k: [(0, INK['dark'] if k in ('dark', 'mid') else INK[k], 1), (0.2, INK[k], 0.92), (0.5, INK[k], 0.62), (0.8, INK[k], 0.9), (1, INK['dark'] if k in ('dark', 'mid') else INK[k], 1)] for k in INK}
GRAD = '<defs>' + ''.join('<linearGradient id="bk%s" x1="0" y1="0" x2="1" y2="0">%s</linearGradient>' % (k, ''.join('<stop offset="%s" stop-color="%s" stop-opacity="%s"/>' % (f(o), c, f(a)) for o, c, a in v)) for k, v in GSTOP.items()) + '</defs>'
svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H) +
       '<!-- 손자병법 대나무 숲(주문 1120-1422) · scripts/atlas11/next/su_bamboo.py 가 만듦 · 손으로 고치지 않음 -->' +
       GRAD + '<g>' + ''.join(drift) + '</g>' + ''.join(parts) + '</svg>\n')
import xml.etree.ElementTree as ET


def prims(svg_text):
    """svg 글 → 칠 목록 [모양, d, 빛, 굵기, 짙기] — 무리(g)의 짙기를 곱해 내림"""
    root = ET.fromstring(svg_text); ns = '{http://www.w3.org/2000/svg}'; out = []
    def walk(el, op):
        o = op * float(el.get('opacity', '1'))
        tag = el.tag.replace(ns, '')
        if tag == 'path':
            if el.get('stroke') and el.get('fill') in (None, 'none'): out.append(['s', el.get('d'), el.get('stroke'), float(el.get('stroke-width', '1')), round(o, 2)])
            else: out.append(['f', el.get('d'), el.get('fill', '#000000'), 0, round(o, 2)])
        for c in el: walk(c, o)
    walk(root, 1.0)
    return out


DEFS = [[k, [[o, c, a] for o, c, a in v]] for k, v in GSTOP.items()]


P = prims(svg)
COL = sorted({x[2] for x in P})
js = ('/* 손자병법 첫 쪽 「오늘 한 장」 뒤 대나무 숲(주문 1120-1422 · 사장님 2026-11-20(마카오) 14:22 「여기 첫화면에 멋진 대나무밭 그림 그려서 기품있게 예술적으로 기백있게 …」)\n'
      '   scripts/atlas11/next/su_bamboo.py 가 만듦 · 손으로 고치지 않음 · 쪽빛 먹 · 마른 붓 줄기 · 바람 잎 · 빨강 0 · 글자 0\n'
      '   글 속 그림(svg 길)으로 그림 — 받아 오는 그림이 아니라 가장 큰 칠함(LCP)에 들지 않음 · 필터 없음(느린 휴대폰도 가벼움) */\n'
      "import {s} from '/su/su-fig.js';\n"
      'export const BAM_COL = ' + json.dumps(COL) + ';\n'
      '/** 줄기 그러데이션 — [먹 이름, [[자리, 빛, 짙기]…]] · 가장자리 짙고 가운데 옅음 */\n'
      'export const BAM_GRAD = ' + json.dumps(DEFS) + ';\n'
      '/** [모양 f 칠 · s 선, d, 빛 차례, 선 굵기, 짙기] */\n'
      'export const BAM = ' + json.dumps([[x[0], x[1], COL.index(x[2]), x[3], x[4]] for x in P], ensure_ascii=False, separators=(',', ':')) + ';\n'
      '/** 대나무 숲 그림(svg) — 누를 수 없음 · 읽지 않음 */\n'
      'export function bambooArt() {\n'
      "  const g = s('svg', {class: 'sj-bam', viewBox: '0 0 %d %d', 'aria-hidden': 'true', focusable: 'false'}), defs = s('defs', {});\n" % (W, H) +
      "  for (const [k, st] of BAM_GRAD) { const lg = s('linearGradient', {id: 'bk' + k, x1: 0, y1: 0, x2: 1, y2: 0}); for (const [o, c, a] of st) lg.append(s('stop', {offset: o, 'stop-color': c, 'stop-opacity': a})); defs.append(lg); }\n"
      "  g.append(defs);\n" +
      "  for (const [k, d, c, w, o] of BAM) g.append(k === 'f' ? s('path', {d, fill: BAM_COL[c], opacity: o}) : s('path', {d, fill: 'none', stroke: BAM_COL[c], 'stroke-width': w, 'stroke-linecap': 'round', opacity: o}));\n"
      '  return g;\n'
      '}\n')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../site/su/su-bamboo.js')
open(out, 'w', encoding='utf-8').write(js)
print(out, len(js.encode('utf-8')), 'bytes', len(P), 'paths')
