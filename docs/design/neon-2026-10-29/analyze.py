#!/usr/bin/env python3
# 사장님 2026-10-29(서울) 16:57 「이 거 색 그리고 느씸 180가지 분석해서 둘리에 백경색 글씨색으로 적용시켜」 — 보내신 무대 사진(오토바이 · 분홍 빛 줄 · 연기)을 잰다
# 쓰는 법: python3 docs/design/neon-2026-10-29/analyze.py <사진> <나갈 폴더>  → measure.json (잰 값 모두) — 180가지 글은 items.py 가 이 값으로 씀
import sys, json, colorsys
import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(np.float64)
H0, W0 = A.shape[:2]
xs = np.where(A.max(axis=(0, 2)) > 40)[0]; x0, x1 = int(xs[0]), int(xs[-1]) + 1   # 양옆 검은 띠 뺌
C = A[:, x0:x1]; H, W = C.shape[:2]

def lin(c): c = c / 255.0; return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lum(rgb): r, g, b = lin(np.asarray(rgb, float)); return float(0.2126 * r + 0.7152 * g + 0.0722 * b)
def contrast(a, b): la, lb = lum(a), lum(b); hi, lo = max(la, lb), min(la, lb); return (hi + 0.05) / (lo + 0.05)
def to_lab(px):
    r, g, b = [lin(px[..., i]) for i in range(3)]
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047; Y = 0.2126 * r + 0.7152 * g + 0.0722 * b; Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: np.where(t > 216 / 24389, np.cbrt(t), (24389 / 27 * t + 16) / 116)
    fx, fy, fz = f(X), f(Y), f(Z)
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], axis=-1)
def hexc(rgb): return '#%02X%02X%02X' % tuple(int(round(v)) for v in rgb)
def hsv(rgb): return colorsys.rgb_to_hsv(*(np.asarray(rgb) / 255.0))

# ── 1. 대표 색 — 작게 줄여 k-평균(15) · 처음 값은 밝기 차례로 고르게(늘 같은 답) ──
small = np.asarray(Image.fromarray(C.astype(np.uint8)).resize((400, round(400 * H / W)), Image.BILINEAR)).astype(np.float64)
P = small.reshape(-1, 3); LAB = to_lab(P)
order = np.argsort(LAB[:, 0]); K = 15
cent = LAB[order[np.linspace(0, len(order) - 1, K).astype(int)]].copy()
for _ in range(60):
    d = ((LAB[:, None, :] - cent[None, :, :]) ** 2).sum(-1); lab_ = d.argmin(1)
    new = np.array([LAB[lab_ == k].mean(0) if (lab_ == k).any() else cent[k] for k in range(K)])
    if np.allclose(new, cent, atol=1e-3): break
    cent = new
pal = []
for k in range(K):
    m = lab_ == k
    if not m.any(): continue
    rgb = np.median(P[m], axis=0); h, s, v = hsv(rgb)
    pal.append({'hex': hexc(rgb), 'share': round(float(m.mean()) * 100, 1), 'L': round(float(LAB[m, 0].mean()), 1), 'C': round(float(np.hypot(LAB[m, 1], LAB[m, 2]).mean()), 1), 'hue': round(h * 360), 'sat': round(s * 100), 'val': round(v * 100)})
pal.sort(key=lambda p: -p['share'])

# ── 2. 자리별 색(내용 칸 안 비율 자리 — 사진을 보고 정함) ──
REG = {
  '천장': (0.00, 0.00, 1.00, 0.17), '왼쪽 빛벽': (0.00, 0.20, 0.32, 0.62), '가운데 빛벽': (0.33, 0.20, 0.48, 0.55),
  '오른쪽 빛벽': (0.56, 0.22, 0.79, 0.60), '오른쪽 끝 어둠': (0.82, 0.22, 1.00, 0.60), '왼쪽 연기': (0.05, 0.62, 0.30, 0.76),
  '오른쪽 연기': (0.62, 0.60, 0.95, 0.74), '바닥 빛': (0.28, 0.80, 0.60, 0.98), '바닥 그림자': (0.45, 0.83, 0.75, 0.93),
  '받침대': (0.33, 0.74, 0.55, 0.79), '오토바이': (0.33, 0.40, 0.52, 0.72), '타는 사람': (0.50, 0.36, 0.59, 0.55),
  '왼쪽 아래 구석': (0.00, 0.80, 0.20, 1.00), '오른쪽 아래 구석': (0.88, 0.80, 1.00, 1.00), '가운데 위 조명 둘레': (0.32, 0.05, 0.42, 0.20),
}
def crop(fr): a, b, c, d = fr; return C[int(b * H):int(d * H), int(a * W):int(c * W)].reshape(-1, 3)
regions = {}
for name, fr in REG.items():
    px = crop(fr); med = np.median(px, axis=0); lab = to_lab(px)
    h, s, v = hsv(med)
    regions[name] = {'hex': hexc(med), 'L': round(float(lab[:, 0].mean()), 1), 'Lsd': round(float(lab[:, 0].std()), 1), 'C': round(float(np.hypot(lab[:, 1], lab[:, 2]).mean()), 1), 'hue': round(h * 360), 'sat': round(s * 100)}

# ── 3. 밝기 · 채도 · 색상 나눔 ──
LABf = to_lab(C.reshape(-1, 3)); Lf = LABf[:, 0]; Cf = np.hypot(LABf[:, 1], LABf[:, 2])
HSV = np.array(colorsys.rgb_to_hsv(*(C.reshape(-1, 3) / 255.0).T)).T if False else None
rgbf = C.reshape(-1, 3) / 255.0
mx, mn = rgbf.max(1), rgbf.min(1); val = mx; sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-9), 0)
hue = np.zeros(len(rgbf)); d = mx - mn; nz = d > 1e-9
r, g, b = rgbf[:, 0], rgbf[:, 1], rgbf[:, 2]
hr = (mx == r) & nz; hg = (mx == g) & nz & ~hr; hb = nz & ~hr & ~hg
hue[hr] = ((g - b)[hr] / d[hr]) % 6; hue[hg] = (b - r)[hg] / d[hg] + 2; hue[hb] = (r - g)[hb] / d[hb] + 4; hue *= 60
light = {'meanL': round(float(Lf.mean()), 1), 'medL': round(float(np.median(Lf)), 1), 'p10': round(float(np.percentile(Lf, 10)), 1), 'p90': round(float(np.percentile(Lf, 90)), 1),
         'dark20': round(float((Lf < 20).mean()) * 100, 1), 'dark35': round(float((Lf < 35).mean()) * 100, 1), 'bright70': round(float((Lf > 70).mean()) * 100, 1), 'bright85': round(float((Lf > 85).mean()) * 100, 1),
         'top': round(float(LABf.reshape(H, W, 3)[:H // 3, :, 0].mean()), 1), 'mid': round(float(LABf.reshape(H, W, 3)[H // 3:2 * H // 3, :, 0].mean()), 1), 'bot': round(float(LABf.reshape(H, W, 3)[2 * H // 3:, :, 0].mean()), 1),
         'left': round(float(LABf.reshape(H, W, 3)[:, :W // 2, 0].mean()), 1), 'right': round(float(LABf.reshape(H, W, 3)[:, W // 2:, 0].mean()), 1)}
chroma = {'meanC': round(float(Cf.mean()), 1), 'gray': round(float((Cf < 10).mean()) * 100, 1), 'vivid': round(float((Cf > 40).mean()) * 100, 1), 'neon': round(float(((Cf > 55) & (Lf > 45)).mean()) * 100, 2), 'maxC': round(float(np.percentile(Cf, 99.9)), 1)}
col = (sat > 0.25) & (val > 0.15); wgt = (sat * val)[col]
bins = np.histogram(hue[col], bins=12, range=(0, 360), weights=wgt)[0]; bins = bins / bins.sum() * 100
hue_bins = [{'from': i * 30, 'to': i * 30 + 30, 'pct': round(float(x), 1)} for i, x in enumerate(bins)]
mag = ((hue >= 285) & (hue < 345) & col).mean() * 100; cyan = ((hue >= 175) & (hue < 215) & col).mean() * 100; red = (((hue >= 345) | (hue < 15)) & col).mean() * 100; blue = ((hue >= 215) & (hue < 260) & col).mean() * 100
warm_cool = {'magenta': round(float(mag), 2), 'cyan': round(float(cyan), 2), 'red': round(float(red), 2), 'blue': round(float(blue), 2), 'colored': round(float(col.mean()) * 100, 1)}

# ── 4. 빛 — 가장 밝은 점 · 분홍 빛 줄(진한 자홍 · 밝음) · 하늘색 조명 ──
Lg = Lf.reshape(H, W); Cg = Cf.reshape(H, W); hg2 = hue.reshape(H, W); sg = sat.reshape(H, W); vg = val.reshape(H, W)
neon_px = (hg2 >= 290) & (hg2 < 345) & (sg > 0.45) & (vg > 0.75)
cyan_px = (hg2 >= 170) & (hg2 < 215) & (sg > 0.25) & (vg > 0.8)
def med_hex(mask): return hexc(np.median(C[mask], axis=0)) if mask.any() else None
ys, xs_ = np.where(neon_px)
lights = {'neon_hex': med_hex(neon_px), 'neon_pct': round(float(neon_px.mean()) * 100, 2), 'cyan_hex': med_hex(cyan_px), 'cyan_pct': round(float(cyan_px.mean()) * 100, 3),
          'brightest_hex': med_hex(Lg > np.percentile(Lg, 99.5)), 'darkest_hex': med_hex(Lg < np.percentile(Lg, 5)),
          'neon_top_pct': round(float(neon_px[:H // 3].mean()) * 100, 2), 'neon_bot_pct': round(float(neon_px[2 * H // 3:].mean()) * 100, 2),
          'smoke_hex': med_hex((hg2 >= 290) & (hg2 < 340) & (sg > 0.25) & (sg <= 0.6) & (vg > 0.35) & (vg <= 0.85) & (np.arange(H)[:, None] > H * 0.55))}

# ── 5. 무대 선 기울기(분홍 빛 줄 — 아래쪽 줄 점들로 곧은 선 맞춤) ──
def fit(mask):
    yy, xx = np.where(mask)
    if len(xx) < 50: return None
    k, c0 = np.polyfit(xx, yy, 1); return round(float(np.degrees(np.arctan(-k))), 1)
lowL = neon_px.copy(); lowL[:int(H * 0.62)] = False
left_line = lowL.copy(); left_line[:, int(W * 0.45):] = False
right_line = lowL.copy(); right_line[:, :int(W * 0.62)] = False
lines = {'left_deg': fit(left_line), 'right_deg': fit(right_line)}

# ── 6. 천장 조명 점 — 위 22% 안 아주 밝은 점 덩이(넓이 40 칸 넘게)를 세고 색으로 가름 ──
from scipy import ndimage
top = int(H * 0.22); bright = (vg[:top] > 0.82) & (Lg[:top] > 70)
lab_, n_ = ndimage.label(bright)
spots = []
for i in range(1, n_ + 1):
    m = lab_ == i; area = int(m.sum())
    if area < 40: continue
    ring = ndimage.binary_dilation(m, iterations=6) & ~m   # 빛 둘레(번진 빛) 색으로 가름 — 가운데는 하얗게 탐
    rgb = np.median(C[:top][ring], axis=0); h_, s_, v_ = hsv(rgb)
    kind = '하늘' if 170 <= h_ * 360 < 230 and s_ > 0.12 else ('분홍' if (h_ * 360 >= 280 or h_ * 360 < 20) and s_ > 0.15 else '흰')
    yy, xx = np.where(m)
    spots.append({'x': round(float(xx.mean()) / W, 3), 'y': round(float(yy.mean()) / H, 3), 'area': area, 'glow': hexc(rgb), 'kind': kind})
spots.sort(key=lambda d: d['x'])
lights['spots'] = spots
lights['spot_count'] = {k: sum(1 for d in spots if d['kind'] == k) for k in ('분홍', '하늘', '흰')}
meas = {'source': {'size': [W0, H0], 'content_x': [x0, x1], 'content': [W, H]}, 'palette': pal, 'regions': regions, 'light': light, 'chroma': chroma, 'hue_bins': hue_bins, 'groups': warm_cool, 'lights': lights, 'lines': lines}
json.dump(meas, open(f'{OUT}/measure.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({'palette': pal[:6], 'lights': lights, 'light': light, 'chroma': chroma, 'groups': warm_cool, 'lines': lines}, ensure_ascii=False)[:3000])
