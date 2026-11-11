"""큐피트 1 · 2 · 3등 새 잣대(주문 1111-1857)
  사장님 2026-11-11 18:57 「자 지금 1.2.3등 선정 기준에 문제가 있는듯해 이렇개 선택한 종목이 지금 다 하락이잖아
    선정 기준을 상승할것 같은 종목 으로 해야 해! 에이전트 100개 만들어서 알고리즘 만들어 재대로 상황 공부하고 대입해」
  공부: 일꾼 100(공부 10 · 잣대 90 — 잣대마다 변형 셋까지)이 우량주 365곳 지난 일봉으로 「그날 마감까지 아는 값만으로 매긴 점수」가
        높은 곳이 그 뒤 시장(365곳 고른 평균)보다 더 올랐는지 잼(실험실 up3_lab.py · docs/design/up3-2026-11-11/).
        옛 잣대(한 달 오른 만큼이 우연보다 센 곳)와 닮은 잣대는 설계 기간에 1 · 2 · 3등이 스무 날 뒤 시장보다 2.6 덜 올랐음.
  새 잣대 = 넷 고른 섞기(실험실 rules/c2.py 와 같은 셈) — 날마다 365곳끼리 표준 점수로 더함
    ① 긴 오름세 · 덜 흔들림 = (250거래일 오름 − 마지막 20거래일 오름)의 표준 점수 − 0.5 × 120거래일 흔들림의 표준 점수
    ② 꾸준함 = 250거래일 가운데 오른 날 몫
    ③ 업종 따라잡기 = 업종 20거래일 고른 평균이 오른 업종에서 업종 평균보다 덜 오른 만큼(업종이 내렸으면 0)
    ④ 닷새 눌림 = 닷새 동안 시장보다 덜 오른 만큼
    ① ② 는 250거래일 값이 빠짐없어야 함 · ③ ④ 는 없으면 0
  고를 수 있는 곳 = 그날 마지막 값이 있고 지난 60거래일 값이 빠짐없는 곳 · 몸집(시가총액) 아래 열에 둘은 뺌
    (실험실은 거래대금 아래 열에 둘을 뺐음 — 사이트는 거래대금을 날마다 받지 않아 몸집으로 대신)
  지난 기록(남겨 둔 기간을 보기 전에 정하고 한 번만 봄) = PAST — 앞날을 맞히지 않음
"""
import warnings
import numpy as np
import up3_lab as LAB

VERSION = 'up3-v1'
WIN = 300          # 날 창(250 + 60 + 덤) — 굴리는 창이 모두 250 안쪽이라 마지막 날 값은 긴 자료로 센 값과 같음
CAPQ = 20          # 몸집 아래 열에 둘(%) 뺌
HOW = ['긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림']
# 지난 기록 — 1 · 2 · 3등 열흘 뒤(그날 마지막 값에 산 셈) · 시장보다 더 오른 몫(%p) · 오른 때(%) · 같은 날들 옛 잣대 닮은 것(b01)
#   설계 기간은 2023-11 부터지만 1년 값(250거래일)이 쌓인 2024-05-09 부터 셈(276날) · 크게 내린 때 = 남겨 둔 기간 넷째 분기(10곳 묶음 · 스무 날 뒤)
PAST = {'design': {'from': '2024-05-09', 'to': '2025-06-30', 'days': 276, 'ex10': 1.49, 'up10': 53.3, 'ex20': 1.96, 'up20': 54.7, 'old_ex10': -0.62, 'old_up10': 46.0},
        'hold': {'from': '2025-07-01', 'to': '2026-11-11', 'days': 324, 'ex10': -0.64, 'up10': 48.1, 'ex20': -1.65, 'up20': 47.2, 'old_ex10': 2.46, 'old_up10': 50.3},
        'crash': {'ex20': -3.0, 'old_ex20': -4.73}, 'agents': 100, 'ideas': 90}


def parts(F):
    """잣대 넷(날 × 회사) — 모두 날마다 회사끼리 표준 점수"""
    L1 = F.zcs(F.ret(250) - F.ret(20)) - 0.5 * F.zcs(F.vol(120))
    L2 = F.updays(250)
    r = F.ret(20)
    im = F.indmean(r)
    with np.errstate(invalid='ignore'):
        S1 = F.zcs((im - r) * (im > 0))
    S2 = F.zcs(-F.rel(5))
    return F.zcs(L1), F.zcs(L2), np.nan_to_num(S1), np.nan_to_num(S2)


def score(F):
    a, b, c, d = parts(F)
    return a + b + c + d


def pick(C, dates, codes, names, inds, capv):
    """C(날 × 회사 마지막 값 · 끝 = 판 날) → {pool · rank(셋)} — 끝 날 점수로 고름"""
    with np.errstate(all='ignore'), warnings.catch_warnings():
        warnings.simplefilter('ignore')
        return _pick(C, dates, codes, names, inds, capv)


def _pick(C, dates, codes, names, inds, capv):
    nan = np.full(C.shape, np.nan)
    F = LAB.Feat({'C': C, 'O': nan, 'H': nan, 'L': nan, 'V': nan, 'dates': np.array(dates), 'codes': np.array(codes), 'names': np.array(names), 'ind': np.array(inds)})
    a, b, c, d = parts(F)
    s = (a + b + c + d)[-1]
    ok = np.isfinite(F.C[-1]) & np.isfinite(F.roll(F.lr, 60, 'sum')[-1]) & np.isfinite(s)
    capv = np.asarray(capv, float)
    have = ok & np.isfinite(capv) & (capv > 0)
    if have.sum() >= 10:
        ok &= np.isfinite(capv) & (capv >= np.percentile(capv[have], CAPQ))
    s = np.where(ok, s, np.nan)
    order = sorted((j for j in range(len(codes)) if np.isfinite(s[j])), key=lambda j: (-s[j], codes[j]))[:3]
    r1 = lambda v: None if not np.isfinite(v) else round(float(v), 2)
    rank = [{'k': 'up3', 'code': codes[j], 'place': i + 1, 'score': r1(s[j]), 'parts': [r1(x[-1, j]) for x in (a, b, c, d)],
             'close': float(C[-1, j]), 'date': dates[-1], 'ind': inds[j]} for i, j in enumerate(order)]
    return {'pool': int(np.isfinite(s).sum()), 'rank': rank}


def top3(ctx, codes, cap, name_of):
    """오늘 판(CTX) → 새 잣대 1 · 2 · 3등 — su21.py 가 out['top3'] 에 넣음"""
    T = ctx.T
    if T < 260: return None
    t0 = max(0, T - WIN + 1)
    codes = sorted(codes)
    C = np.full((T + 1 - t0, len(codes)), np.nan)
    for j, c in enumerate(codes):
        a = ctx.co_close(c)
        if a is not None: C[:, j] = a[t0:T + 1]
    r = pick(C, list(ctx.dates[t0:T + 1]), codes, [name_of(c) for c in codes], [ctx.ind_of(c) for c in codes], [cap.get(c) if cap.get(c) is not None else np.nan for c in codes])
    if len(r['rank']) < 3: return None
    return {'v': VERSION, 'n': len(codes), 'pool': r['pool'], 'how': HOW, 'past': PAST, 'rank': r['rank']}
