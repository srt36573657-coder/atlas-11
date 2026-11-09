"""수르 42칸 1등 · 2등 · 3등 — 몬테카를로 1억 번 · 소거 1억 번(주문 1422) → 한 단계 키움(주문 1912)
  사장님 2026-11-09 14:22 「… 42개를 찾은 것 중에서 다시 몬테카를로 다시 계산하여 이번 계산할 때는 1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기 하도록 하라」
  사장님 2026-11-09 19:12 「… 그중에 이전에 했던 몬테카를로 방식 소급법(소거법)을 더 진화시켜서 작업 해봐」
  v2(주문 1912)에서 바꾼 셋:
    ① 우연 길 = 요즘 흔들림에 맞춘 길 — 그 칸 지난 250거래일 하루 값을 그날 흔들림으로 나눈 뒤 지금 흔들림으로 다시 키워 뽑음(su21_culture.fhs_paths)
       지난 1년 견줘 보니 「스무 번에 한 번」 드묾이 옛 길은 6 ~ 10번, 새 길은 4 ~ 7번 나옴(su_culture_past.py calib)
    ② 잣대 셋 — 오른 만큼 · 가장 크게 뛴 하루를 뺀 만큼(한방 쫓기를 덜 침) · 눈길 몰린 날(평소 흔들림 2배 넘게 움직인 날)이 적은 만큼(눈길 따라 사기를 덜 침)
       — 한국 연구: 하루 크게 뛴 주식 · 눈길 몰린 주식은 그 뒤 한 달 되돌아가는 쪽이 많았음(자본시장연구원 22-02 · Nartea 외 2014 · 공옥례 · 박대근 2013)
    ③ 판마다 잣대 셋의 무게를 열두 가지(오른 만큼에 무게를 더 둔 디리클레 2 · 1 · 1 · 그날 씨앗) 가운데 하나로 뽑음 — 한 가지 무게에만 센 칸이 아니라 어느 무게에서도 센 칸이 남음
  1억 판 — 판마다 칸마다 우연 길 하나를 뽑아 잣대마다 (지금 값 − 우연 값) ÷ 우연 흔들림 → 그 판 무게로 섞음 → 가장 약한 칸부터 떨어뜨림(소거)
           → 끝까지 남은 칸 = 그 판 1등 · 마지막에 떨어진 둘 = 2등 · 3등 / 1억 판에서 1등 횟수가 가장 많은 칸 = 1등(같으면 2등 · 3등 횟수 · 칸 차례)
  앞날을 맞히지 않음 — 지금 모습이 우연보다 얼마나 센지를 칸끼리 견줄 뿐
"""
import numpy as np
from su21_strict import seed_of
from su21_mc import hist, STAT
import su21_culture as CUL

TOTAL = 100_000_000
NULL = 100_000
CHUNK = 250_000
VERSION = 'top3-v2'
ALPHA = (2.0, 1.0, 1.0)
G = 12

def window(ctx, c, k):
    """그 칸 창의 하루 로그 값(회사 · 업종 고른 평균 · 시장보다면 365곳 고른 평균을 뺌) — CTX.R 에서"""
    scope, w, rel = STAT[k]
    a, b = ctx.T - w + 1, ctx.T + 1
    if a < 1: return None
    if scope == 'ind':
        mem = [x for x in ctx.inds.get(ctx.ind_of(c), []) if x in ctx.R]
        if len(mem) < 3: return None
        with np.errstate(invalid='ignore'):
            r = np.nanmean(np.array([ctx.R[x][a:b] for x in mem]), axis=0)
    else:
        rr = ctx.R.get(c)
        if rr is None: return None
        r = rr[a:b]
    x = r - (ctx.Rm[a:b] if rel else 0)
    return x if np.isfinite(x).all() else None

def measures(x, now):
    """잣대 셋 — 오른 만큼(합) · 가장 크게 뛴 하루를 뺀 만큼 · 눈길 몰린 날 수(지금 흔들림 2배 넘게 움직인 날)"""
    s = x.sum(axis=-1)
    return s, s - x.max(axis=-1), (np.abs(x) > 2 * now).sum(axis=-1)

def top3(ctx, cells, total=TOTAL):
    """cells = [(묶음, 번호)] 42칸 → {total · cells(칸마다 1 · 2 · 3등 횟수) · rank(1 · 2 · 3등 칸 차례)}"""
    K = len(cells)
    Z = np.zeros((K, NULL, 3), np.float32); ok = np.zeros(K, bool); zmean = [None] * K
    for j, (k, c) in enumerate(cells):
        h, x = hist(ctx, c, k), window(ctx, c, k)
        if h is None or x is None or len(h) < 60: continue
        w = STAT[k][1]
        paths = CUL.fhs_paths(h, w, NULL, seed_of(c, k, ctx.day, 'top3-v2-null'))
        if paths is None: continue
        now = CUL.ewvol(h)[1]
        a0, b0, c0 = measures(paths, now)
        a1, b1, c1 = measures(x[None, :], now)
        sd = [float(np.std(v)) for v in (a0, b0, c0)]
        if not (np.isfinite(sd[0]) and sd[0] > 0 and np.isfinite(sd[1]) and sd[1] > 0): continue
        Z[j, :, 0] = (a1[0] - a0) / sd[0]
        Z[j, :, 1] = (b1[0] - b0) / sd[1]
        Z[j, :, 2] = (c0 - c1[0]) / sd[2] if sd[2] > 0 else 0.0
        ok[j] = True
        zmean[j] = round(float(Z[j].mean(axis=0) @ np.array([0.5, 0.25, 0.25])), 2)
    first = np.zeros(K, np.int64); second = np.zeros(K, np.int64); third = np.zeros(K, np.int64)
    WG = np.random.default_rng(seed_of(ctx.day, 'top3-v2-weights')).dirichlet(ALPHA, size=G).astype(np.float32)   # 무게 열두 가지
    if ok.sum() >= 3:
        rng = np.random.default_rng(seed_of(ctx.day, 'top3-v2', ','.join(k + ':' + c for k, c in cells)))
        ZG = np.einsum('knm,gm->gkn', Z, WG)                        # (무게, 칸, 길) — 무게마다 섞은 값을 미리
        del Z
        cols = np.arange(K)[None, :]
        done = 0
        while done < total:
            n = min(CHUNK, total - done)
            idx = rng.integers(0, NULL, size=(n, K), dtype=np.int32)
            gi = rng.integers(0, G, size=n)
            z = ZG[gi[:, None], cols, idx]
            z[:, ~ok] = -np.inf
            t3 = np.argpartition(-z, 3, axis=1)[:, :3]
            z3 = np.take_along_axis(z, t3, axis=1)
            t3 = np.take_along_axis(t3, np.argsort(-z3, axis=1), axis=1)
            first += np.bincount(t3[:, 0], minlength=K); second += np.bincount(t3[:, 1], minlength=K); third += np.bincount(t3[:, 2], minlength=K)
            done += n
    rank, seen = [], set()   # 같은 회사가 두 묶음에 들면 횟수가 많은 칸 하나만 등수(1 · 2 · 3등은 서로 다른 회사)
    for j in sorted([j for j in range(K) if ok[j]], key=lambda j: (-first[j], -second[j], -third[j], j)):
        if cells[j][1] in seen: continue
        seen.add(cells[j][1]); rank.append(j)
        if len(rank) == 3: break
    return {'total': int(total), 'null': NULL, 'k': K, 'ok': int(ok.sum()), 'v': VERSION, 'g': list(ALPHA), 'gn': G,
            'how': ['오른 만큼', '가장 크게 뛴 하루를 뺀 만큼', '눈길 몰린 날이 적은 만큼'],
            'cells': [{'k': k, 'code': c, 'first': int(first[j]), 'second': int(second[j]), 'third': int(third[j]), 'z': zmean[j]} for j, (k, c) in enumerate(cells)],
            'rank': [{'k': cells[j][0], 'code': cells[j][1], 'place': i + 1, 'first': int(first[j])} for i, j in enumerate(rank)]}
