#!/usr/bin/env python3
"""수르 「될 듯」 셋의 지난 1년 기록 — 주문 1103(사장님 2026-11-08 11:03 「불장이 될듯 한 종목 7개 · 돈이 몰릴듯 한 종목 7개 · 싹에서 꽃이 될듯 한 7개 추가하자」 · 11:08 「응」)
  이해 보고 6: 「될 듯한 곳」 = 지난 기록에서 그렇게 되기 바로 앞에 자주 보이던 모습이 지금 보이는 회사 · 지난 1년 동안 그런 회사가 실제로 그렇게 된 횟수도 함께 적음
  재료 = 저장소 안 자료만(새로 받지 않음 · 앞날 값 없음):
    우량주 365곳과 업종 = public/data/atlas11/view/board.json(지금 판 · 지난 1년도 지금 365곳으로 셈 — 살아남은 곳만 보는 치우침이 있음을 글에 적음)
    날마다 마지막 값 = reports/atlas11/universe/2026-10-10/bundle.json.gz(네이버 일봉 840줄 · 줄 = [날, 시가, 고가, 저가, 종가, 거래량]) · 회사 크기 = list.listValue(억 원 · 모음 날 값) × 그날 값 / 마지막 값
  지금 셋(su21.py 와 같은 셈 · 시장 = 365곳 고른 평균):
    불장 = 20거래일 업종 평균이 오른 업종 큰 순 11 안 · 회사 20거래일 오른 만큼 큰 순 · 업종마다 둘 · 7
    돈이 몰리는 = 20거래일 시장보다 더 오른 업종 큰 순 · 업종마다 회사 크기가 원으로 가장 많이 는 회사 하나 · 7
    꽃 = 회사가 20거래일 동안 시장보다 15 넘게 앞섬(꽃 선 15) · 싹 = 시장보다 앞선 만큼 5 아래 · 닷새 동안 시장에 뒤지지 않음
  될 듯 셋은 여러 셈(갈래)을 지난 1년 날마다 똑같이 대어 보고, 한 달(20거래일) 안에 그렇게 된 횟수가 가장 많은 셈 하나를 고름(고른 셈은 su21.py 가 오늘 자료에 그대로 씀)
  쓰는 법: python3 scripts/atlas11/next/su_next_past.py [--repo .] [--out reports/atlas11/su-next/past.json]
"""
import json, gzip, argparse, collections
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--repo', default='.'); ap.add_argument('--out', default='reports/atlas11/su-next/past.json')
ap.add_argument('--from-day', default='2025-10-01')
A = ap.parse_args()
R = A.repo.rstrip('/')
b = json.load(open(R + '/public/data/atlas11/view/board.json', encoding='utf-8'))
BUN = 'reports/atlas11/universe/2026-10-10/bundle.json.gz'
d = json.load(gzip.open(R + '/' + BUN))
S = d['stocks']
codes = [c['code'] for c in b['companies'] if c['code'] in S and (S[c['code']].get('fchart') or {}).get('rows')]
ind_of = {c['code']: c['group']['label'] for c in b['companies']}
# 모든 상장(모음) 회사 크기 — 꽃이 될 「회사 크기 위 20」 문턱을 날마다 셈
allc = [c for c, v in S.items() if (v.get('fchart') or {}).get('rows') and (v.get('list') or {}).get('listValue')]
dates = sorted({r[0] for c in allc for r in S[c]['fchart']['rows']})
# 거래일 = 삼성전자 날(가장 긴 줄) 기준
ref = max(allc, key=lambda c: len(S[c]['fchart']['rows']))
DAYS = [r[0] for r in S[ref]['fchart']['rows']]
DI = {x: i for i, x in enumerate(DAYS)}
ND = len(DAYS)

def mat(cs):
    P = np.full((len(cs), ND), np.nan)
    for k, c in enumerate(cs):
        for r in S[c]['fchart']['rows']:
            j = DI.get(r[0])
            if j is not None and r[4] and r[4] > 0: P[k, j] = r[4]
    return P

P = mat(codes)
PA = mat(allc)
LV = np.array([S[c]['list']['listValue'] for c in allc], float)
lastA = np.array([row[~np.isnan(row)][-1] if (~np.isnan(row)).any() else np.nan for row in PA])
CAPA = LV[:, None] * PA / lastA[:, None]                 # 억 원 · 그날 값
k365 = {c: allc.index(c) for c in codes}
CAP = CAPA[[k365[c] for c in codes]]
N = len(codes)
IND = sorted(set(ind_of[c] for c in codes))
IX = np.array([IND.index(ind_of[c]) for c in codes])
day0 = A.from_day.replace('-', '')
T0 = next(i for i, x in enumerate(DAYS) if x >= day0)
T1 = ND - 1 - 20                                           # 한 달 뒤 값이 있는 마지막 날

def stats(t):
    """그날 t 의 셈 — r20 · r5 · 업종 평균 · 시장 · 튀는 회사(하루 ±35 넘게) 빼기"""
    w = P[:, t - 20:t + 1]
    ok = ~np.isnan(w).any(1)
    jump = np.zeros(N, bool)
    jump[ok] = (np.abs(w[ok, 1:] / w[ok, :-1] - 1) >= 0.35).any(1)
    ok &= ~jump
    r20 = np.where(ok, P[:, t] / P[:, t - 20] - 1, np.nan)
    r5 = np.where(ok, P[:, t] / P[:, t - 5] - 1, np.nan)
    m20, m5 = np.nanmean(r20), np.nanmean(r5)
    i20 = np.array([np.nanmean(r20[IX == i]) if (ok & (IX == i)).any() else np.nan for i in range(len(IND))])
    i5 = np.array([np.nanmean(r5[IX == i]) if (ok & (IX == i)).any() else np.nan for i in range(len(IND))])
    cap = CAP[:, t]
    g20 = np.where(ok, cap * (1 - P[:, t - 20] / P[:, t]), np.nan)
    g5 = np.where(ok, cap * (1 - P[:, t - 5] / P[:, t]), np.nan)
    capall = CAPA[:, t]; v = np.sort(capall[~np.isnan(capall)]); thr = v[int(np.ceil(0.8 * len(v))) - 1] if len(v) else np.inf
    return dict(ok=ok, r20=r20, r5=r5, m20=m20, m5=m5, i20=i20, i5=i5, g20=g20, g5=g5, cap=cap, thr=thr)

def per(order, k=7, per_ind=2):
    out, cnt = [], collections.Counter()
    for j in order:
        if cnt[IX[j]] >= per_ind: continue
        cnt[IX[j]] += 1; out.append(int(j))
        if len(out) == k: break
    return out

def HOT(s):
    hi = [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11]
    cand = [j for j in range(N) if s['ok'][j] and IX[j] in hi and s['r20'][j] > 0]
    return per(sorted(cand, key=lambda j: -s['r20'][j]))

def MONEY(s, rank=(0, 7), gkey='g20'):
    x = s['i20'] - s['m20']
    inds = [i for i in np.argsort(-np.nan_to_num(x, nan=-9)) if x[i] > 0]
    out = []
    for i in inds[rank[0]:]:
        m = [j for j in range(N) if IX[j] == i and s['ok'][j] and not np.isnan(s[gkey][j])]
        if not m: continue
        j = max(m, key=lambda j: s[gkey][j])
        if s[gkey][j] > 0: out.append(int(j))
        if len(out) == rank[1] - rank[0]: break
    return out

def sprout(s):
    x20 = s['r20'] - s['m20']; x5 = s['r5'] - s['m5']
    return s['ok'] & (x20 < 0.05) & (x5 >= 0)

def BLOOM(s):
    sp = sprout(s) & (s['cap'] >= s['thr'])
    ix = s['i20'] - s['m20']
    cand = [j for j in range(N) if sp[j]]
    return sorted(cand, key=lambda j: (-(ix[IX[j]] if not np.isnan(ix[IX[j]]) else -9), -(s['r20'][j] - s['m20'])))[:7]

# 될 듯 갈래 — 오늘 셈(s)만 씀 · 지금 목록에 든 곳은 뺌
def H1(s, now):  # 닷새 막 오르기 시작 — 업종도 닷새 오름 · 회사 닷새 큰 순 · 업종마다 둘
    c = [j for j in range(N) if s['ok'][j] and j not in now and s['r5'][j] > 0 and s['r20'][j] > 0 and s['i5'][IX[j]] > 0]
    return per(sorted(c, key=lambda j: -s['r5'][j]))
def H2(s, now):  # 불장 업종 바로 아래(12 ~ 20째) 업종의 회사 — 20거래일 큰 순
    order = [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9))]
    band = set(order[11:20])
    c = [j for j in range(N) if s['ok'][j] and j not in now and IX[j] in band and s['r20'][j] > 0]
    return per(sorted(c, key=lambda j: -s['r20'][j]))
def H3(s, now):  # 불장 업종 안에서 아직 일곱에 못 든 회사 — 닷새 큰 순
    hi = set([i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11])
    c = [j for j in range(N) if s['ok'][j] and j not in now and IX[j] in hi and s['r5'][j] > 0]
    return per(sorted(c, key=lambda j: -s['r5'][j]))
def H4(s, now):  # 20거래일 차례 8 ~ 14째(일곱 문턱 바로 아래)
    hi = [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11]
    c = [j for j in range(N) if s['ok'][j] and IX[j] in hi and s['r20'][j] > 0]
    full = per(sorted(c, key=lambda j: -s['r20'][j]), k=14)
    return [j for j in full if j not in now][:7]
def M1(s, now):  # 한 달은 시장보다 못했지만 닷새는 앞선 업종 — 업종마다 닷새 동안 회사 크기가 가장 많이 는 곳
    x20 = s['i20'] - s['m20']; x5 = s['i5'] - s['m5']
    inds = [i for i in np.argsort(-np.nan_to_num(x5, nan=-9)) if x5[i] > 0 and x20[i] <= 0]
    out = []
    for i in inds:
        m = [j for j in range(N) if IX[j] == i and s['ok'][j] and j not in now]
        if not m: continue
        j = max(m, key=lambda j: s['g5'][j])
        if s['g5'][j] > 0: out.append(j)
        if len(out) == 7: break
    return out
def M2(s, now):  # 돈이 몰리는 일곱 바로 아래(8 ~ 14째) 업종
    return [j for j in MONEY(s, rank=(7, 14)) if j not in now][:7]
def M3(s, now):  # 일곱 밖 업종마다 닷새 동안 회사 크기가 가장 많이 는 곳 — 는 만큼 큰 순
    x20 = s['i20'] - s['m20']
    top = set([i for i in np.argsort(-np.nan_to_num(x20, nan=-9)) if x20[i] > 0][:7])
    best = []
    for i in range(len(IND)):
        if i in top: continue
        m = [j for j in range(N) if IX[j] == i and s['ok'][j] and j not in now]
        if not m: continue
        j = max(m, key=lambda j: s['g5'][j])
        if s['g5'][j] > 0: best.append(j)
    return sorted(best, key=lambda j: -s['g5'][j])[:7]
def B1(s, now):  # 싹 가운데 닷새 동안 시장보다 가장 앞선 곳(크기 위 20)
    sp = sprout(s) & (s['cap'] >= s['thr'])
    x5 = s['r5'] - s['m5']
    c = [j for j in range(N) if sp[j] and j not in now]
    return per(sorted(c, key=lambda j: -x5[j]))
def B2(s, now):  # 업종이 꽃 선에 다가선(시장보다 5 ~ 15 앞선) 싹
    sp = sprout(s); ix = s['i20'] - s['m20']; x5 = s['r5'] - s['m5']
    c = [j for j in range(N) if sp[j] and j not in now and 0.05 <= ix[IX[j]] < 0.15]
    return per(sorted(c, key=lambda j: (-ix[IX[j]], -x5[j])))
def B3(s, now):  # 싹 가운데 닷새 시장보다 2 넘게 앞서고 20거래일은 0 넘게 오른 곳 — 닷새 큰 순
    sp = sprout(s); x5 = s['r5'] - s['m5']
    c = [j for j in range(N) if sp[j] and j not in now and x5[j] >= 0.02 and s['r20'][j] > 0]
    return per(sorted(c, key=lambda j: -x5[j]))
def B4(s, now):  # 싹 가운데 업종이 시장보다 가장 앞선 곳(크기 상관없이)
    sp = sprout(s); ix = s['i20'] - s['m20']; x5 = s['r5'] - s['m5']
    c = [j for j in range(N) if sp[j] and j not in now]
    return per(sorted(c, key=lambda j: (-(ix[IX[j]] if not np.isnan(ix[IX[j]]) else -9), -x5[j])))

def fill(a, b):  # 앞 셈이 일곱이 안 되면 뒤 셈 차례로 채움(겹침 빼고)
    def f(s, now):
        x = a(s, now)
        return (x + [j for j in b(s, now) if j not in x])[:7]
    return f
H5, M4, B5 = fill(H4, H1), fill(M2, M3), fill(B3, B1)
VAR = {'hotNext': {'H1': H1, 'H2': H2, 'H3': H3, 'H4': H4, 'H5': H5}, 'moneyNext': {'M1': M1, 'M2': M2, 'M3': M3, 'M4': M4}, 'bloomNext': {'B1': B1, 'B2': B2, 'B3': B3, 'B4': B4, 'B5': B5}}
FINAL = {'hotNext': 'H5', 'moneyNext': 'M4', 'bloomNext': 'B5'}  # 날마다 일곱을 채우는 셈(가장 많이 맞은 셈 + 모자라면 다음 셈으로 채움)

# 날마다 셈을 한 번만 해 둠(T0 - 0 ~ T1 + 20)
ST = {t: stats(t) for t in range(T0, ND)}
HOTD = {t: set(HOT(ST[t])) for t in ST}
MOND = {t: set(MONEY(ST[t])) for t in ST}
BLOOMD = {t: set(BLOOM(ST[t])) for t in ST}
FLOWER = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) >= 0.15))[0].tolist()) for t in ST}
OUT = {'hotNext': lambda j, t: any(j in HOTD[t + k] for k in range(1, 21)),
       'moneyNext': lambda j, t: any(j in MOND[t + k] for k in range(1, 21)),
       'bloomNext': lambda j, t: any(j in FLOWER[t + k] for k in range(1, 21))}
NOW = {'hotNext': HOTD, 'moneyNext': MOND, 'bloomNext': BLOOMD}

res = {}
for g, vs in VAR.items():
    res[g] = {}
    base_n = base_h = 0
    for t in range(T0, T1 + 1):
        s = ST[t]; now = NOW[g][t]
        if g == 'bloomNext': now = now | FLOWER[t]          # 이미 꽃인 곳은 「될 듯」이 아님
        el = [j for j in range(N) if s['ok'][j] and j not in now]
        base_n += len(el); base_h += sum(OUT[g](j, t) for j in el)
    for name, f in vs.items():
        n = h = days = 0
        for t in range(T0, T1 + 1):
            s = ST[t]; now = NOW[g][t]
            if g == 'bloomNext': now = now | FLOWER[t]
            pk = f(s, now)
            if pk: days += 1
            n += len(pk); h += sum(OUT[g](j, t) for j in pk)
        res[g][name] = {'picks': n, 'hits': h, 'per100': round(100 * h / n, 1) if n else None, 'days': days}
    res[g]['_base'] = {'picks': base_n, 'hits': base_h, 'per100': round(100 * base_h / base_n, 1) if base_n else None}
    print(g, json.dumps(res[g], ensure_ascii=False))

best = {g: max((k for k in res[g] if not k.startswith('_') and res[g][k]['picks'] >= 500), key=lambda k: res[g][k]['per100']) for g in res}
final = {g: dict(res[g][FINAL[g]], rule=FINAL[g], base100=res[g]['_base']['per100']) for g in res}
fmt = lambda x: x[:4] + '-' + x[4:6] + '-' + x[6:]
out = {'schema': 'su-next-past-1', 'order': '1103', 'from': fmt(DAYS[T0]), 'to': fmt(DAYS[T1]), 'lastData': fmt(DAYS[-1]), 'days': T1 - T0 + 1,
       'within': 20, 'universe': '지금 우량주 365곳(지난 1년도 같은 365곳으로 셈 · 살아남은 곳만 보는 치우침이 있음)', 'src': BUN + ' · public/data/atlas11/view/board.json',
       'what': {'hotNext': '한 달(20거래일) 안에 불장 일곱에 듦', 'moneyNext': '한 달 안에 돈이 몰리는 일곱에 듦', 'bloomNext': '한 달 안에 시장보다 15 넘게 앞섬(꽃)'},
       'best': best, 'final': final, 'res': res}
import os
os.makedirs(os.path.dirname(R + '/' + A.out), exist_ok=True)
json.dump(out, open(R + '/' + A.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('best', best, 'days', out['days'], out['from'], '~', out['to'])
