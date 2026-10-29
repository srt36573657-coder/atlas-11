#!/usr/bin/env python3
# 밤 무대 판 색(사장님 2026-10-29 16:57) — 사진에서 잰 색(measure.json)으로 둘이 바탕 · 글씨 색을 정하고 글 대비를 잰다 → palette.json
import json, sys, os
D = os.path.dirname(os.path.abspath(__file__)); M = json.load(open(os.path.join(D, 'measure.json'), encoding='utf-8'))
def lin(c): c /= 255; return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
def L(h): h = h.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4)); return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b)
def cr(a, b): x, y = L(a), L(b); return round((max(x, y) + .05) / (min(x, y) + .05), 2)
pal = {p['hex']: p for p in M['palette']}
T = {  # 이름 · 값 · 어디서 왔나(잰 값)
  'bg': ('#0C081D', '사진 대표 색 둘째(12.5%) — 천장 · 왼쪽 빛벽의 짙은 남보라'),
  'bar': ('#070514', '사진 가장 짙은 색(10.2%) — 위 · 아래 막대'),
  'card': ('#1C1136', '사진 대표 색(6.6%) — 칸 바탕'),
  'card2': ('#241540', '가운데 위 조명 둘레 — 둘째 칸 바탕'),
  'card3': ('#2E1A4A', '칸 바탕 셋째 — #241540 과 자두 빛 #412649 사이'),
  'plum': ('#412649', '사진 대표 색 넷째(9.3%) — 자두 빛 면'),
  'line': ('#3A2756', '옅은 나눔 줄'),
  'hair': ('#A58BC2', '단추 · 칸 테 — 라벤더(바탕 · 칸 위 대비 3 넘게)'),
  'ink': ('#F2EFF9', '사진 가장 밝은 곳 #E8F3FA 를 보라 쪽으로 — 본문 글'),
  'ink2': ('#E4DDF0', '둘째 글'),
  'sub': ('#CFC4E0', '보조 글'),
  'mute': ('#B6A8CB', '작은 글 · 그대로 색'),
  'acc': ('#F06FCB', '분홍 빛 줄 #C767B1 을 밝게 — 강조 글 · 큰 단추'),
  'neon': ('#C767B1', '분홍 빛 줄 가운데 값 — 선 · 테'),
  'smoke': ('#8B477B', '분홍 연기 — 밝은 강조 칸 바탕'),
  'cyan': ('#94BFDB', '가운데 하늘색 조명 — 지금 쪽 표시'),
  'up': ('#FF5A65', '오름 빨강(숫자만) — 짙은 바탕 위 옛 먹빛 판 값'),
  'down': ('#5B96FF', '내림 파랑(숫자만) — 짙은 바탕 위 옛 먹빛 판 값'),
}
V = {k: v[0] for k, v in T.items()}
need = []
def chk(fg, bgs, lo, what):
    for b in bgs:
        c = cr(V[fg], V[b]); need.append({'fg': fg, 'bg': b, 'ratio': c, 'need': lo, 'ok': c >= lo, 'what': what})
chk('ink', ['bg', 'card', 'card2', 'card3', 'plum', 'bar'], 4.5, '본문 글')
chk('ink2', ['bg', 'card', 'card2', 'card3'], 4.5, '둘째 글')
chk('sub', ['bg', 'card', 'card2', 'card3'], 4.5, '보조 글')
chk('mute', ['bg', 'card', 'card2', 'card3'], 4.5, '작은 글')
chk('acc', ['bg', 'card', 'card2', 'card3', 'bar'], 4.5, '강조 글')
chk('up', ['bg', 'card', 'card2'], 4.5, '오름 숫자')
chk('down', ['bg', 'card', 'card2'], 4.5, '내림 숫자')
chk('hair', ['bg', 'card', 'card2', 'card3'], 3, '단추 · 칸 테')
chk('bg', ['acc'], 4.5, '큰 단추 위 짙은 글')
chk('ink', ['smoke'], 4.5, '연기 칸 위 글')
chk('acc', ['bg'], 3, '큰 단추 바탕 대 둘레')
chk('cyan', ['bar', 'bg'], 4.5, '지금 쪽 표시 글')
out = {'made': '2026-10-29', 'order': '사장님 2026-10-29 16:57 「이 거 색 그리고 느씸 180가지 분석해서 둘리에 백경색 글씨색으로 적용시켜」', 'tokens': {k: {'hex': v[0], 'why': v[1]} for k, v in T.items()}, 'contrast': need, 'all_ok': all(n['ok'] for n in need)}
json.dump(out, open(os.path.join(D, 'palette.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
bad = [n for n in need if not n['ok']]
print('all_ok', out['all_ok'], 'pairs', len(need), 'bad', bad)
print('min', min(need, key=lambda n: n['ratio'] - n['need']))
