# OKLab · OKLCH · WCAG 대비 — 색 바꾸기에 쓰는 셈(따로 셈 · 외부 꾸러미 없음)
import math
def _lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def _gam(c): return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
def hex2rgb(h):
    h = h.lstrip('#'); h = ''.join(x * 2 for x in h) if len(h) == 3 else h
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def rgb2hex(rgb): return '#%02X%02X%02X' % tuple(max(0, min(255, round(v * 255))) for v in rgb)
def rgb2oklab(rgb):
    r, g, b = (_lin(v) for v in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b; m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b; s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)
def oklab2rgb_raw(L, a, b):
    l = L + 0.3963377774 * a + 0.2158037573 * b; m = L - 0.1055613458 * a - 0.0638541728 * b; s = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l ** 3, m ** 3, s ** 3
    return (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
def inside(rgb): return all(-1e-6 <= v <= 1 + 1e-6 for v in rgb)
def oklch2hex(L, C, h):
    """색 범위 밖이면 채도만 줄여 안으로(밝기 · 색상 그대로)"""
    lo, hi = 0.0, C
    for _ in range(40):
        a, b = hi * math.cos(math.radians(h)), hi * math.sin(math.radians(h)); rl = oklab2rgb_raw(L, a, b)
        if inside(rl): break
        hi = (lo + hi) / 2 if not inside(oklab2rgb_raw(L, (lo + hi) / 2 * math.cos(math.radians(h)), (lo + hi) / 2 * math.sin(math.radians(h)))) else hi * 0.97
    a, b = hi * math.cos(math.radians(h)), hi * math.sin(math.radians(h))
    return rgb2hex(tuple(_gam(max(0, min(1, v))) for v in oklab2rgb_raw(L, a, b)))
def hex2oklch(hx):
    L, a, b = rgb2oklab(hex2rgb(hx)); return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360
def lum(hx):
    r, g, b = (_lin(v) for v in hex2rgb(hx)); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def contrast(x, y):
    a, b = lum(x), lum(y); return (max(a, b) + 0.05) / (min(a, b) + 0.05)
