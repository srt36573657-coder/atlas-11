# ATLAS 밤하늘 옷 ① — 공주님 1분 영상 색 세기(사장님 2026-10-10 12:53 마카오 「1분영상 분석후 그 중심색으로 아틀란스를 다시 색을 변경한다」)
#   쓰는 법: ffmpeg -i site/media/atlas-hello.mp4 -vf "fps=2,scale=180:320:flags=area" <폴더>/fr/f%03d.png
#            python3 scripts/atlas11/design/night_violet/video_colors.py <폴더>   → <폴더>/colors.json
#   0.5초마다 120장 · 180×320 · OKLab 무리 나누기(k-means · 씨앗 고정) · 몫 = 넓이 × 시간 · 색 있는 곳 = OKLCH 채도 0.04 이상
import numpy as np, json, sys, glob
from PIL import Image
from sklearn.cluster import KMeans
SP = sys.argv[1]
files = sorted(glob.glob(SP + '/fr/f*.png'))
def srgb2lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lin2srgb(c): return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]])
M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099], [0.0259040371, 0.7827717662, -0.8086757660]])
def rgb2oklab(rgb):  # rgb 0..1 (N,3)
  l = srgb2lin(rgb) @ M1.T; return np.cbrt(l) @ M2.T
def oklab2rgb(lab):
  l_ = lab @ np.linalg.inv(M2).T; l = l_ ** 3; return np.clip(lin2srgb(l @ np.linalg.inv(M1).T), 0, 1)
hexof = lambda rgb: '#%02X%02X%02X' % tuple(int(round(v * 255)) for v in rgb)
frames = [np.asarray(Image.open(f).convert('RGB'), dtype=np.float64).reshape(-1, 3) / 255 for f in files]
allpx = np.concatenate(frames); lab = rgb2oklab(allpx)
N = len(lab); rng = np.random.default_rng(20261010); idx = rng.choice(N, 400000, replace=False)
km = KMeans(n_clusters=8, n_init=6, random_state=7).fit(lab[idx])
lab_all = km.predict(lab); share = np.bincount(lab_all, minlength=8) / N
C = np.hypot(lab[:, 1], lab[:, 2])
cent = []
for k in np.argsort(-share):
  m = lab_all == k; L, a, b = lab[m].mean(0); c = float(np.hypot(a, b)); h = float(np.degrees(np.arctan2(b, a)) % 360)
  cent.append({'k': int(k), 'share': round(float(share[k]) * 100, 1), 'hex': hexof(oklab2rgb(np.array([[L, a, b]]))[0]), 'L': round(float(L), 3), 'C': round(c, 3), 'h': round(h, 1)})
# 색이 있는 픽셀만(회색 · 검정 · 흰색 뺌 — 채도 C ≥ 0.04)
chrom = C >= 0.04; labc = lab[chrom]; idc = rng.choice(len(labc), min(400000, len(labc)), replace=False)
kc = KMeans(n_clusters=6, n_init=6, random_state=7).fit(labc[idc]); pc = kc.predict(labc); sc = np.bincount(pc, minlength=6) / len(labc)
chroms = []
for k in np.argsort(-sc):
  m = pc == k; L, a, b = labc[m].mean(0); c = float(np.hypot(a, b)); h = float(np.degrees(np.arctan2(b, a)) % 360)
  chroms.append({'k': int(k), 'share_of_colored': round(float(sc[k]) * 100, 1), 'share_of_all': round(float(sc[k]) * chrom.mean() * 100, 1), 'hex': hexof(oklab2rgb(np.array([[L, a, b]]))[0]), 'L': round(float(L), 3), 'C': round(c, 3), 'h': round(h, 1)})
# 색상(h) 둘레 막대(넓이 × 시간 · 10도 칸) · 둘레 평균(채도 무게)
hh = np.degrees(np.arctan2(labc[:, 2], labc[:, 1])) % 360; hist = np.histogram(hh, bins=36, range=(0, 360))[0] / len(labc)
w = np.hypot(labc[:, 1], labc[:, 2]); ang = np.radians(hh); cm = np.degrees(np.arctan2((w * np.sin(ang)).sum(), (w * np.cos(ang)).sum())) % 360
# 초마다 가장 많은 무리(전체 8 무리) — 1분 색 띠
per = []
for s in range(60):
  fr = np.concatenate(frames[2 * s:2 * s + 2]); p = km.predict(rgb2oklab(fr)); k = int(np.bincount(p, minlength=8).argmax()); per.append(cent[[c['k'] for c in cent].index(k)]['hex'])
out = {'frames': len(files), 'pixels': int(N), 'colored_share': round(float(chrom.mean()) * 100, 1), 'all8': cent, 'colored6': chroms, 'hue_hist10': [round(float(x) * 100, 2) for x in hist], 'hue_mean_weighted': round(float(cm), 1), 'per_second': per}
json.dump(out, open(SP + '/colors.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: out[k] for k in ['frames', 'pixels', 'colored_share', 'hue_mean_weighted']}))
for c in cent: print('ALL', c)
for c in chroms: print('COL', c)
print('HIST', ' '.join(f'{i*10}:{v}' for i, v in enumerate(out['hue_hist10']) if v >= 1))
print('PER', ' '.join(per[:60]))
