"""수르 42칸 — 365곳을 몬테카를로로 먼저 보고 소거 한 번으로 묶음마다 일곱(주문 1422)
  사장님 2026-11-09 14:22 「돈 · 꽃 · 불장 찾는 조건을 처음에 365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고
    42개를 찾은 것 중에서 다시 몬테카를로 다시 계산하여 이번 계산할 때는 1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기 하도록 하라」
  ① 몬테카를로 — 묶음마다 그 셈의 값(회사 또는 업종 · 창 · 시장보다)을 지난 250거래일 하루 값으로 10만 번 섞어 그린 길과 견줌 → 지금 값 이상이 나온 몫(드묾 p)
     365곳 모두(올릴 때 --mc365) · 지난 판 다시 세기는 소거를 지난 곳만(같은 씨앗이라 값이 같음)
  ② 소거 한 번 — 묶음마다 기본 조건 하나(su21.py 의 pool · 예: 불장 = 불장 업종 안 20거래일 오른 회사)
  ③ 남은 곳을 드문 차례(p 작은 차례 · 같으면 값 큰 차례 · 번호)로 일곱 — 업종마다 둘(돈 둘 = 업종마다 대장 하나)
  앞날을 맞히지 않음 — 지금 모습이 지난 값으로 보아 얼마나 드문지 셀 뿐
"""
import numpy as np
from su21_strict import mc_p, seed_of, HIST, MC_PATHS, MC_P

RULE_ID = 'mc365-v1'
# 묶음마다 셈 — 무엇(co 회사 · ind 업종 회사 하루 값 고른 평균) · 창(거래일) · 시장보다(365곳 고른 평균을 뺌)
STAT = {'hot': ('co', 20, False), 'hotNext': ('co', 5, False),
        'bloom': ('ind', 20, True), 'bloomNext': ('co', 5, True),
        'money': ('ind', 20, True), 'moneyNext': ('ind', 5, True)}
SAY = {'hot': '20거래일 동안 오른 만큼', 'hotNext': '닷새 동안 오른 만큼',
       'bloom': '업종이 20거래일 동안 시장보다 앞선 만큼', 'bloomNext': '닷새 동안 시장보다 앞선 만큼',
       'money': '업종이 20거래일 동안 시장보다 앞선 만큼', 'moneyNext': '업종이 닷새 동안 시장보다 앞선 만큼'}

def subj(ctx, c, k):
    return ctx.ind_of(c) if STAT[k][0] == 'ind' else c

def hist(ctx, c, k):
    """바탕 — 지금 창 앞 HIST 날의 하루 로그 오르내림(업종이면 그 업종 회사 고른 평균 · 시장보다면 365곳 고른 평균을 뺌)"""
    scope, w, rel = STAT[k]
    a, b = ctx.T - w - HIST + 1, ctx.T - w + 1
    if a < 1: a = 1
    if b <= a: return None
    if scope == 'ind':
        mem = [x for x in ctx.inds.get(ctx.ind_of(c), []) if x in ctx.R]
        if len(mem) < 3: return None
        r = np.nanmean(np.array([ctx.R[x][a:b] for x in mem]), axis=0)
    else:
        rr = ctx.R.get(c)
        if rr is None: return None
        r = rr[a:b]
    x = r - (ctx.Rm[a:b] if rel else 0)
    return x[np.isfinite(x)]

def actual(ctx, c, k):
    """지금 값 — 판의 21 마지막 값으로 센 창 로그 오르내림(업종이면 그 업종 회사 고른 평균 · 시장보다면 365곳 고른 평균을 뺌)"""
    scope, w, rel = STAT[k]
    if w not in ctx.ret: return None
    if scope == 'ind':
        rs = [ctx.ret[w][x] for x in ctx.inds.get(ctx.ind_of(c), []) if x in ctx.ret[w]]
        if len(rs) < 3: return None
        v = sum(rs) / len(rs)
    else:
        v = ctx.ret[w].get(c)
        if v is None: return None
    return v - ctx.mret[w] if rel else v

_MC = {}
def mc(ctx, c, k):
    """한 칸의 몬테카를로 — {p(드묾) · stat(지금 값 × 100) · n(바탕 날 수)} · 같은 셈(업종 · 창 · 시장보다)은 한 번만 셈"""
    scope, w, rel = STAT[k]
    key = (ctx.day, subj(ctx, c, k), scope, w, rel)
    if key in _MC: return _MC[key]
    h, a = hist(ctx, c, k), actual(ctx, c, k)
    if h is None or a is None or len(h) < 60:
        r = {'p': None, 'stat': None, 'n': 0 if h is None else int(len(h))}
    else:
        r = {'p': round(mc_p(h, w, a, seed_of(key[1], ctx.day, scope, w, rel, 'mc365')), 6), 'stat': round(a * 100, 2), 'n': int(len(h))}
    _MC[key] = r
    return r

def order(ctx, pool, k):
    """소거를 지난 곳(pool)을 드문 차례로 — p 작은 차례 · 같으면 지금 값 큰 차례 · 번호(셈이 안 되는 곳은 맨 뒤)"""
    def key(c):
        m = mc(ctx, c, k)
        return (m['p'] is None, m['p'] if m['p'] is not None else 2, -(m['stat'] if m['stat'] is not None else -1e9), c)
    return sorted(dict.fromkeys(pool), key=key)

def scan(ctx):
    """① 몬테카를로를 365곳 모두에(올릴 때) — 묶음 셈마다 센 곳 수와 스무 번에 한 번 아래로 드문 곳 수"""
    out = {'scanned': 0, 'paths': MC_PATHS, 'rare': {}}
    for k in STAT:
        n = m = 0
        for c in sorted(ctx.B):
            r = mc(ctx, c, k)
            if r['p'] is None: continue
            m += 1; n += r['p'] <= MC_P
        out['rare'][k] = n; out['scanned'] = max(out['scanned'], m)
    return out
