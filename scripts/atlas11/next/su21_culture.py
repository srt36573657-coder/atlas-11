"""수르 42칸 — 한국 투자자 문화 일곱으로 고르기(주문 1912)
  사장님 2026-11-09 19:12 「한국에 주식하는 사람들에 특징 11가지를 에이전트 11개를 돌려서 찾아낸 다음 7가지에 정의를 내린 다음
    42개에 종목을 찾아내는데 문화에 중심으로 세팅한 다음 42개를 다시 찾아내고 그중에 이전에 했던 몬테카를로 방식 소급법(소거법)을 더 진화시켜서 작업 해봐」
  특징 열하나(도우미 열하나가 따로 찾음 · 근거 = docs/design/su-culture-2026-11-09/traits11.md) 가운데 종가만으로 잴 수 있는 일곱을 정의함:
    ① 테마 몰림   — 같은 업종 회사 열에 일곱 넘게가 시장보다 앞서고 업종도 앞섬(20거래일 · 닷새)          → 불장 · 꽃이 될 · 불장이 될 듯을 세움
    ② 고점 앞 팔기 — 지난 250거래일 가장 높은 종가의 90 넘는 곳(98 넘으면 신고가) · 개인은 고점 가까이에서 먼저 팖 → 불장 · 불장이 될 듯 · 꽃이 될을 세움
    ③ 본전 버티기 — 20거래일 동안 시장보다 10 넘게 뒤졌는데 업종은 그만큼 안 빠짐(개인이 버티며 더 사는 칸)      → 불장 · 불장이 될 듯에서 뺌
    ④ 빚투 쏠림   — 지난 10거래일 안에 사흘 잇달아 하루 3 넘게 내림(빚으로 산 몫이 강제로 팔린 흔적)              → 불장 · 꽃이 될 · 불장이 될 듯에서 뺌
    (주문 0243 · 2026-11-10 — 꽃이 될 듯에서는 ③ ④ 를 빼지 않음: 꽃이 될 듯 맞음을 고른 날부터 세니(주문 0103) 빼지 않는 쪽이 지난 1년 네 철 모두 많았음 · 30.8 → 32.0)
    ⑤ 국민주 쏠림 — 365곳 가운데 몸집 위 37곳(열에 하나)                                                       → 돈이 몰리는 · 돈이 몰릴 듯 대장을 먼저
    ⑥ 한방 쫓기   — 닷새 안에 하루 5 넘게 · 평소 흔들림 2.5배 넘게 뛴 날                                        → 1 · 2 · 3등 셈에서 덜 침
    ⑦ 눈길 따라 사기 — 닷새 안에 평소 흔들림 2배 넘게 움직인 날이 이틀 넘게                                       → 1 · 2 · 3등 셈에서 덜 침
  몬테카를로도 키움: 지난 값을 그날 흔들림으로 나눠 고르게 한 뒤 지금 흔들림으로 다시 키운 우연 길(요즘 흔들림에 맞춘 길 · 람다 0.94)
    — 지난 1년 아무 회사 · 아무 날 1,500번씩 견줘 보니 「스무 번에 한 번」 드묾이 옛 길은 7 ~ 10번, 새 길은 5 ~ 6번 나옴(su_culture_past.py · calib)
  불장이 될 듯 · 꽃이 될 듯의 차례는 365곳 모두의 요즘 흔들림 길과 견줌(크게 움직인 차례) — 지난 1년 앞 반년 · 뒤 반년 모두 맞음이 늘어서 고름
  앞날을 맞히지 않음 — 지금 모습과 지난 기록을 셀 뿐 · 사고팔기를 권하지 않음
"""
import itertools
import numpy as np

RULE_ID = 'culture7-v1'
LAM = 0.94          # 흔들림 맞춤 길의 람다(요즘 값에 무게)
HIST = 250
NEAR, HI52 = 0.90, 0.98
TRAITS = ['herd', 'near', 'rev', 'casc', 'big', 'lot', 'attn']
NAME = {'herd': '테마 몰림', 'near': '고점 앞 팔기', 'rev': '본전 버티기', 'casc': '빚투 쏠림', 'big': '국민주 쏠림', 'lot': '한방 쫓기', 'attn': '눈길 따라 사기'}
SAY = {'herd': '같은 업종 회사 열에 일곱 넘게가 시장보다 앞서고 업종도 앞섰어요.',
       'near': '지난 1년 가장 높은 값 가까이 왔어요. 개인은 이 자리에서 먼저 팔곤 해요.',
       'rev': '한 달 동안 시장보다 많이 뒤졌어요. 개인이 본전을 기다리며 버티는 자리예요.',
       'casc': '열흘 안에 사흘 잇달아 크게 내렸어요. 빚으로 산 몫이 팔린 흔적이에요.',
       'big': '365곳 가운데 몸집이 큰 열에 하나예요. 사람 수가 몰리는 회사예요.',
       'lot': '닷새 안에 하루 크게 뛴 날이 있어요. 복권처럼 한 번에 뛴 모습이에요.',
       'attn': '닷새 안에 평소보다 크게 움직인 날이 이틀 넘어요. 눈길이 몰린 모습이에요.'}
USE = {'herd': '세움', 'near': '세움', 'rev': '뺌', 'casc': '뺌', 'big': '대장 먼저', 'lot': '1 · 2 · 3등에서 덜 침', 'attn': '1 · 2 · 3등에서 덜 침'}
# 묶음마다 세우는 흔적(pos · 많을수록 앞) · 빼는 흔적(neg · 걸리면 뺌 · 일곱이 안 되면 뒤에 붙임)
POS = {'hot': ['hi52', 'herd20'], 'bloom': ['herd5', 'near'], 'hotNext': ['near', 'herd5'], 'bloomNext': [], 'money': [], 'moneyNext': []}
NEG = {'hot': ['casc', 'rev'], 'bloom': ['casc'], 'hotNext': ['casc', 'rev'], 'bloomNext': [], 'money': [], 'moneyNext': []}   # 꽃이 될 듯은 빼지 않음(주문 0243 — 고른 날부터 세면 빚투 · 본전 싹이 꽃이 더 많이 됨)
BIGFIRST = {'money', 'moneyNext'}
MKT_ORDER = {'hotNext', 'bloomNext'}   # 365곳 모두의 길과 견줌(크게 움직인 차례)

def ewvol(x, lam=LAM):
    """하루 값 x(로그 · 빈 값 있음)의 그날 흔들림(그 앞 값들로 셈)과 마지막 뒤 흔들림"""
    v = np.empty(len(x)); f = x[np.isfinite(x)]
    s2 = float(np.var(f[:20])) if len(f) >= 5 else 1e-4
    if not np.isfinite(s2) or s2 <= 0: s2 = 1e-4
    for i, r in enumerate(x):
        v[i] = np.sqrt(s2)
        if np.isfinite(r): s2 = lam * s2 + (1 - lam) * r * r
    return v, float(np.sqrt(s2))

def fhs_paths(h, w, paths, seed):
    """요즘 흔들림에 맞춘 우연 길 — 지난 하루 값 h 를 그날 흔들림으로 나눈 뒤 w 개씩 뽑아 지금 흔들림으로 키움 → (paths × w) 하루 값"""
    v, now = ewvol(h)
    z = h / v; z = z[np.isfinite(z)]
    if len(z) < 60: return None
    rng = np.random.default_rng(seed)
    return z[rng.integers(0, len(z), size=(paths, w))] * now

def fhs_p(h, w, actual, paths, seed):
    """지금 값(창 합) 이상이 나온 몫 — (센 수 + 1) ÷ (길 + 1)"""
    s = fhs_paths(h, w, paths, seed)
    if s is None: return None
    s = s.sum(axis=1)
    return (int((s >= actual - 1e-12).sum()) + 1) / (paths + 1)

def traits(P, IX, NI, cap, t, l5, l20, il5, il20):
    """종가 행렬 P(회사 × 날) · 업종 번호 IX · 몸집 cap · 날 t · 회사 닷새 · 20거래일 로그 오르내림(l5 · l20) · 업종 시장보다(il5 · il20 — 업종 번호마다)
    → 흔적마다 켜짐(회사마다 참 · 거짓)과 값(화면 풀이용)"""
    N = P.shape[0]
    with np.errstate(divide='ignore', invalid='ignore'):
        LR = np.log(P[:, max(1, t - 269):t + 1] / P[:, max(0, t - 270):t])
    LR[~np.isfinite(LR)] = np.nan
    W = LR.shape[1]
    with np.errstate(invalid='ignore'):
        MR = np.nanmean(LR, axis=0)
        sd = np.nanstd(LR[:, :max(1, W - 20)], axis=1)
        w5 = LR[:, -5:]
        mx5 = np.nanmax(w5, axis=1)
        nbig = (np.abs(w5 - MR[None, -5:]) > 2 * sd[:, None]).sum(axis=1)
        hi = np.nanmax(P[:, max(0, t - 249):t + 1], axis=1)
        dd = P[:, t] / hi
    x5 = l5 - np.nanmean(l5); x20 = l20 - np.nanmean(l20)
    nI = np.bincount(IX, minlength=NI)
    with np.errstate(invalid='ignore'):
        br5 = np.array([np.nanmean((x5[IX == i] > 0).astype(float)) if (IX == i).any() else np.nan for i in range(NI)])
        br20 = np.array([np.nanmean((x20[IX == i] > 0).astype(float)) if (IX == i).any() else np.nan for i in range(NI)])
    rk = np.argsort(np.argsort(-np.nan_to_num(cap, nan=-1)))
    dn = (LR[:, -10:] <= np.log(0.97)).astype(int)
    casc = np.array([max((sum(1 for _ in g) for k, g in itertools.groupby(r) if k == 1), default=0) for r in dn])
    il20j, il5j = il20[IX], il5[IX]
    on = {
        'herd20': (br20[IX] >= 0.7) & (il20j > 0) & (nI[IX] >= 3), 'herd5': (br5[IX] >= 0.7) & (il5j > 0) & (nI[IX] >= 3),
        'near': dd >= NEAR, 'hi52': dd >= HI52,
        'rev': (x20 <= -0.10) & (il20j >= -0.02), 'casc': casc >= 3, 'big': rk < max(1, round(N / 10)),
        'lot': mx5 >= np.maximum(np.log(1.05), 2.5 * sd), 'attn': nbig >= 2}
    on['herd'] = on['herd20'] | on['herd5']
    for k in on: on[k] = np.where(np.isfinite(P[:, t]), on[k], False)
    val = {'br20': br20[IX], 'br5': br5[IX], 'dd': dd, 'x20': x20, 'casc': casc, 'rank': rk + 1, 'mx5': mx5, 'nbig': nbig}
    return on, val

def mkt_null(LRwin, MRwin, w, rel, paths, seed):
    """365곳 모두의 요즘 흔들림 길 — 회사마다 지난 값을 그날 흔들림으로 나눈 몫을 모아, 회사마다 지금 흔들림으로 키운 w 날 합을 고루 뽑음(정렬된 길)"""
    rng = np.random.default_rng(seed)
    pools, nows = [], []
    for r in LRwin:
        x = r - (MRwin if rel else 0)
        if np.isfinite(x).sum() < 60: continue
        v, now = ewvol(x); z = x / v; z = z[np.isfinite(z)]
        pools.append(z); nows.append(now)
    if not pools: return None
    k = rng.integers(0, len(pools), size=paths)
    out = np.empty(paths)
    for j in range(len(pools)):
        m = k == j
        if m.any(): out[m] = pools[j][rng.integers(0, len(pools[j]), size=(int(m.sum()), w))].sum(axis=1) * nows[j]
    return np.sort(out)

def p_of(sorted_null, a):
    if sorted_null is None or a is None or not np.isfinite(a): return None
    n = len(sorted_null)
    return (n - int(np.searchsorted(sorted_null, a - 1e-12, side='left')) + 1) / (n + 1)
