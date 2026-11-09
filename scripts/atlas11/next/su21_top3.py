"""수르 42칸 1등 · 2등 · 3등 — 몬테카를로 1억 번 · 소거 1억 번(주문 1422)
  사장님 2026-11-09 14:22 「… 42개를 찾은 것 중에서 다시 몬테카를로 다시 계산하여 이번 계산할 때는 1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기 하도록 하라」
  칸마다 「우연 길」 바탕 — 그 칸 셈(su21_mc STAT)의 지난 250거래일 하루 값을 창 길이만큼 뽑아 더한 값 10만 개(씨앗 = 칸 · 판 날)
  1억 판 — 판마다 칸마다 우연 길 하나를 뽑아 (지금 값 − 우연 값) ÷ 그 칸 우연 흔들림(표준편차) = 「우연보다 몇 배 앞섰나」
           → 가장 약한 칸부터 하나씩 떨어뜨림(소거) → 끝까지 남은 칸 = 그 판 1등 · 마지막에 떨어진 둘 = 2등 · 3등
  1억 판에서 끝까지 남은(1등) 횟수가 가장 많은 칸 = 1등 · 다음 = 2등 · 그다음 = 3등(같으면 2등 횟수 · 3등 횟수 · 칸 차례)
  앞날을 맞히지 않음 — 지금 모습이 우연보다 얼마나 센지를 칸끼리 견줄 뿐
"""
import numpy as np
from su21_strict import seed_of
from su21_mc import hist, actual, STAT

TOTAL = 100_000_000
NULL = 100_000
CHUNK = 500_000

def top3(ctx, cells, total=TOTAL):
    """cells = [(묶음, 번호)] 42칸 → {total · cells(칸마다 1 · 2 · 3등 횟수) · rank(1 · 2 · 3등 칸 차례)}"""
    K = len(cells)
    tab = np.zeros((K, NULL), np.float32); act = np.zeros(K, np.float32); sd = np.ones(K, np.float32); ok = np.zeros(K, bool)
    for j, (k, c) in enumerate(cells):
        h, a, w = hist(ctx, c, k), actual(ctx, c, k), STAT[k][1]
        if h is None or a is None or len(h) < 60: continue
        rng = np.random.default_rng(seed_of(c, k, ctx.day, 'top3-null'))
        s = h[rng.integers(0, len(h), size=(NULL, w))].sum(axis=1)
        sdv = float(s.std())
        if not np.isfinite(sdv) or sdv <= 0: continue
        tab[j] = s.astype(np.float32); act[j] = a; sd[j] = sdv; ok[j] = True
    first = np.zeros(K, np.int64); second = np.zeros(K, np.int64); third = np.zeros(K, np.int64)
    if ok.sum() >= 3:
        rng = np.random.default_rng(seed_of(ctx.day, 'top3', ','.join(k + ':' + c for k, c in cells)))
        rows = np.arange(K)[None, :]
        done = 0
        while done < total:
            n = min(CHUNK, total - done)
            idx = rng.integers(0, NULL, size=(n, K), dtype=np.int32)
            z = (act[None, :] - tab[rows, idx]) / sd[None, :]
            z[:, ~ok] = -np.inf
            t3 = np.argpartition(-z, 3, axis=1)[:, :3]
            z3 = np.take_along_axis(z, t3, axis=1)
            t3 = np.take_along_axis(t3, np.argsort(-z3, axis=1), axis=1)
            first += np.bincount(t3[:, 0], minlength=K); second += np.bincount(t3[:, 1], minlength=K); third += np.bincount(t3[:, 2], minlength=K)
            done += n
    rank = sorted([j for j in range(K) if ok[j]], key=lambda j: (-first[j], -second[j], -third[j], j))[:3]
    zmean = [round(float((act[j] - tab[j].mean()) / sd[j]), 2) if ok[j] else None for j in range(K)]
    return {'total': int(total), 'null': NULL, 'k': K, 'ok': int(ok.sum()),
            'cells': [{'k': k, 'code': c, 'first': int(first[j]), 'second': int(second[j]), 'third': int(third[j]), 'z': zmean[j]} for j, (k, c) in enumerate(cells)],
            'rank': [{'k': cells[j][0], 'code': cells[j][1], 'place': i + 1, 'first': int(first[j])} for i, j in enumerate(rank)]}
