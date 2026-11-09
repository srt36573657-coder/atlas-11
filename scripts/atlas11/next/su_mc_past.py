#!/usr/bin/env python3
"""수르 몬테카를로 차례 셈(주문 1422)의 지난 1년 — 될 듯 셋이 한 달 안에 그렇게 된 몫 · 예전 셈 · 아무 회사와 견줌
  사장님 2026-11-09 14:22 「돈 · 꽃 · 불장 찾는 조건을 처음에 365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고 …」
  재료 = su_strict_past.py 와 같음(저장소 안 자료만 · 앞날 값 없음): 365곳 = 지금 판 · 날마다 값 = reports/atlas11/universe/2026-10-10/bundle.json.gz
  날마다: 묶음마다 소거 한 번(su21.py POOL 과 같은 기본 조건) → 몬테카를로 드묾 p(스무 날마다 그 회사 · 업종 지난 250날 하루 값을 2만 번 섞어 그린 길과 견줌) 작은 차례 → 일곱
  맞음 = 한 달(20거래일) 안에 불장 일곱 · 돈이 몰리는 일곱(둘 다 같은 몬테카를로 차례 셈)에 듦 · 꽃 = 시장보다 15 넘게 앞섬
  쓰는 법: python3 scripts/atlas11/next/su_mc_past.py [--repo .] [--out reports/atlas11/su-next/past-mc.json] [--paths 20000]
"""
import json, gzip, argparse, collections, os, sys, hashlib
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--repo', default='.'); ap.add_argument('--out', default='reports/atlas11/su-next/past-mc.json')
ap.add_argument('--from-day', default='2025-10-01'); ap.add_argument('--paths', type=int, default=20000)
A = ap.parse_args()
R = A.repo.rstrip('/')
b = json.load(open(R + '/public/data/atlas11/view/board.json', encoding='utf-8'))
BUN = 'reports/atlas11/universe/2026-10-10/bundle.json.gz'
d = json.load(gzip.open(R + '/' + BUN))
S = d['stocks']
codes = [c['code'] for c in b['companies'] if c['code'] in S and (S[c['code']].get('fchart') or {}).get('rows')]
ind_of = {c['code']: c['group']['label'] for c in b['companies']}
allc = [c for c, v in S.items() if (v.get('fchart') or {}).get('rows') and (v.get('list') or {}).get('listValue')]
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
P = mat(codes); PA = mat(allc)
LV = np.array([S[c]['list']['listValue'] for c in allc], float)
lastA = np.array([row[~np.isnan(row)][-1] if (~np.isnan(row)).any() else np.nan for row in PA])
CAPA = LV[:, None] * PA / lastA[:, None]
k365 = {c: allc.index(c) for c in codes}
CAP = CAPA[[k365[c] for c in codes]]
N = len(codes)
IND = sorted(set(ind_of[c] for c in codes))
IX = np.array([IND.index(ind_of[c]) for c in codes])
NI = len(IND)
day0 = A.from_day.replace('-', '')
T0 = next(i for i, x in enumerate(DAYS) if x >= day0)
T1 = ND - 1 - 20
with np.errstate(divide='ignore', invalid='ignore'):
    LR = np.log(P[:, 1:] / P[:, :-1])
LR = np.concatenate([np.full((N, 1), np.nan), LR], axis=1)
LR[~np.isfinite(LR)] = np.nan
with np.errstate(invalid='ignore'):
    MR = np.nanmean(LR, axis=0)                                            # 시장 = 365곳 하루 고른 평균
    ILR = np.array([np.nanmean(LR[IX == i], axis=0) for i in range(NI)])   # 업종 = 그 업종 회사 하루 고른 평균
HIST = 250

def seed(*xs): return int(hashlib.sha256('|'.join(map(str, xs)).encode()).hexdigest()[:16], 16)

# 옛 셈(su_strict_past.py 와 같음) — 견줌용 · 소거 조건의 바탕
def stats(t):
    w = P[:, t - 20:t + 1]
    ok = ~np.isnan(w).any(1)
    jump = np.zeros(N, bool)
    jump[ok] = (np.abs(w[ok, 1:] / w[ok, :-1] - 1) >= 0.35).any(1)
    ok &= ~jump
    r20 = np.where(ok, P[:, t] / P[:, t - 20] - 1, np.nan)
    r5 = np.where(ok, P[:, t] / P[:, t - 5] - 1, np.nan)
    m20, m5 = np.nanmean(r20), np.nanmean(r5)
    i20 = np.array([np.nanmean(r20[IX == i]) if (ok & (IX == i)).any() else np.nan for i in range(NI)])
    i5 = np.array([np.nanmean(r5[IX == i]) if (ok & (IX == i)).any() else np.nan for i in range(NI)])
    cap = CAP[:, t]
    g20 = np.where(ok, cap * (1 - P[:, t - 20] / P[:, t]), np.nan)
    g5 = np.where(ok, cap * (1 - P[:, t - 5] / P[:, t]), np.nan)
    capall = CAPA[:, t]; v = np.sort(capall[~np.isnan(capall)]); thr = v[int(np.ceil(0.8 * len(v))) - 1] if len(v) else np.inf
    # 몬테카를로 지금 값(로그) — 회사 20 · 5 · 회사 5 시장보다 · 업종 20 · 5 시장보다
    with np.errstate(divide='ignore', invalid='ignore'):
        l20 = np.where(ok, np.log(P[:, t] / P[:, t - 20]), np.nan); l5 = np.where(ok, np.log(P[:, t] / P[:, t - 5]), np.nan)
    ml20, ml5 = np.nanmean(l20), np.nanmean(l5)
    il20 = np.array([np.nanmean(l20[IX == i]) if (ok & (IX == i)).sum() >= 3 else np.nan for i in range(NI)]) - ml20
    il5 = np.array([np.nanmean(l5[IX == i]) if (ok & (IX == i)).sum() >= 3 else np.nan for i in range(NI)]) - ml5
    return dict(ok=ok, r20=r20, r5=r5, m20=m20, m5=m5, i20=i20, i5=i5, g20=g20, g5=g5, cap=cap, thr=thr, l20=l20, l5=l5, x5=l5 - ml5, il20=il20, il5=il5)
def per(order, k=7, per_ind=2):
    out, cnt = [], collections.Counter()
    for j in order:
        if cnt[IX[j]] >= per_ind: continue
        cnt[IX[j]] += 1; out.append(int(j))
        if len(out) == k: break
    return out
def hot_inds(s): return [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11]
def sprout(s):
    x20 = s['r20'] - s['m20']; x5 = s['r5'] - s['m5']
    return s['ok'] & (x20 < 0.05) & (x5 >= 0)

# 몬테카를로 바탕 — 스무 날마다(묶음 첫날 앞 250날) 회사 · 업종마다 창 합의 정렬된 길(2만 개)
NULL = {}
def null_block(b0):
    if b0 in NULL: return NULL[b0]
    a = max(1, b0 - HIST)
    out = {'co20': [None] * N, 'co5': [None] * N, 'x5': [None] * N, 'ind20': [None] * NI, 'ind5': [None] * NI}
    def srt(x, n, sd):
        x = x[np.isfinite(x)]
        if len(x) < 60: return None
        rng = np.random.default_rng(sd)
        return np.sort(x[rng.integers(0, len(x), size=(A.paths, n))].sum(axis=1))
    for j in range(N):
        h = LR[j, a:b0]
        out['co20'][j] = srt(h, 20, seed(b0, j, 'co20')); out['co5'][j] = srt(h, 5, seed(b0, j, 'co5'))
        out['x5'][j] = srt(h - MR[a:b0], 5, seed(b0, j, 'x5'))
    for i in range(NI):
        h = ILR[i, a:b0] - MR[a:b0]
        out['ind20'][i] = srt(h, 20, seed(b0, i, 'ind20')); out['ind5'][i] = srt(h, 5, seed(b0, i, 'ind5'))
    NULL.clear(); NULL[b0] = out                                          # 한 묶음만 들고 있음(날 차례대로 셈)
    return out
def blk(t): return T0 + ((t - T0) // 20) * 20
def pv(arr, a):
    if arr is None or not np.isfinite(a): return None
    return (len(arr) - np.searchsorted(arr, a - 1e-12, side='left') + 1) / (len(arr) + 1)
def order_co(js, key, nul, s):
    def k(j):
        p = pv(nul[j], s[key][j])
        return (p is None, p if p is not None else 2, -(s[key][j] if np.isfinite(s[key][j]) else -9), j)
    return sorted(js, key=k)
def order_ind(iis, key, nul, s):
    def k(i):
        p = pv(nul[i], s[key][i])
        return (p is None, p if p is not None else 2, -(s[key][i] if np.isfinite(s[key][i]) else -9), i)
    return sorted(iis, key=k)

def pick(t):
    s = ST[t]; nul = null_block(blk(t)); ok = s['ok']
    hi = set(hot_inds(s))
    HOT = per(order_co([j for j in range(N) if ok[j] and IX[j] in hi and s['r20'][j] > 0], 'l20', nul['co20'], s))
    x20i = s['i20'] - s['m20']
    MON, used = [], []
    for i in order_ind([i for i in range(NI) if np.isfinite(x20i[i]) and x20i[i] > 0], 'il20', nul['ind20'], s):
        m = [j for j in range(N) if IX[j] == i and ok[j] and np.isfinite(s['g20'][j])]
        if not m: continue
        j = max(m, key=lambda j: s['g20'][j])
        if s['g20'][j] > 0: MON.append(int(j)); used.append(i)
        if len(MON) == 7: break
    sp = sprout(s)
    BLM = sorted([j for j in range(N) if sp[j] and s['cap'][j] >= s['thr']], key=lambda j: ((lambda p: (p is None, p if p is not None else 2))(pv(nul['ind20'][IX[j]], s['il20'][IX[j]])), -(s['il20'][IX[j]] if np.isfinite(s['il20'][IX[j]]) else -9), j))[:7]
    hN = per(order_co([j for j in range(N) if ok[j] and j not in HOT and s['r5'][j] > 0 and (IX[j] in hi or (np.isfinite(s['i5'][IX[j]]) and s['i5'][IX[j]] > 0))], 'l5', nul['co5'], s))
    mN = []
    for i in order_ind([i for i in range(NI) if i not in used], 'il5', nul['ind5'], s):
        m = [j for j in range(N) if IX[j] == i and ok[j] and np.isfinite(s['g5'][j]) and j not in MON and j not in mN]
        if not m: continue
        j = max(m, key=lambda j: s['g5'][j])
        if s['g5'][j] > 0: mN.append(int(j))
        if len(mN) == 7: break
    bN = per(order_co([j for j in range(N) if sp[j] and j not in BLM], 'x5', nul['x5'], s))
    return {'hot': HOT, 'money': MON, 'bloom': BLM, 'hotNext': hN, 'moneyNext': mN, 'bloomNext': bN}

# 예전 셈(su_strict_past.py OLD 와 같은 차례) — 견줌
def OLDP(s, g, now):
    ok = s['ok']; hi = set(hot_inds(s))
    if g == 'hotNext':
        full = per(sorted([j for j in range(N) if ok[j] and IX[j] in hi and s['r20'][j] > 0], key=lambda j: -s['r20'][j]), k=14)
        h4 = [j for j in full if j not in now]
        h1 = sorted([j for j in range(N) if ok[j] and j not in now and s['r5'][j] > 0 and s['r20'][j] > 0 and s['i5'][IX[j]] > 0], key=lambda j: -s['r5'][j])
        return per(list(dict.fromkeys(h4 + h1)))
    if g == 'moneyNext':
        x = s['i20'] - s['m20']; inds = [i for i in np.argsort(-np.nan_to_num(x, nan=-9)) if x[i] > 0]
        m2 = []
        for i in inds[7:]:
            m = [j for j in range(N) if IX[j] == i and ok[j] and np.isfinite(s['g20'][j])]
            if not m: continue
            j = max(m, key=lambda j: s['g20'][j])
            if s['g20'][j] > 0 and j not in now: m2.append(int(j))
            if len(m2) == 7: break
        top = set(inds[:7]); m3 = []
        for i in range(NI):
            if i in top: continue
            m = [j for j in range(N) if IX[j] == i and ok[j] and j not in now and np.isfinite(s['g5'][j])]
            if not m: continue
            j = max(m, key=lambda j: s['g5'][j])
            if s['g5'][j] > 0: m3.append(j)
        m3 = sorted(m3, key=lambda j: -s['g5'][j])
        return (m2 + [j for j in m3 if j not in m2])[:7]
    sp = sprout(s); x5 = s['r5'] - s['m5']
    b3 = sorted([j for j in range(N) if sp[j] and j not in now and x5[j] >= 0.02 and s['r20'][j] > 0], key=lambda j: -x5[j])
    b1 = sorted([j for j in range(N) if sp[j] and s['cap'][j] >= s['thr'] and j not in now], key=lambda j: -x5[j])
    return per(list(dict.fromkeys(b3 + b1)))

ST = {t: stats(t) for t in range(T0, ND)}
PK = {}
for t in range(T0, ND):
    PK[t] = pick(t)
    if (t - T0) % 40 == 0: print('날', t - T0, '/', ND - T0, DAYS[t]); sys.stdout.flush()
HOTD = {t: set(PK[t]['hot']) for t in PK}
MOND = {t: set(PK[t]['money']) for t in PK}
FLOWER = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) >= 0.15))[0].tolist()) for t in ST}
OUT = {'hotNext': lambda j, t: any(j in HOTD[t + k] for k in range(1, 21)),
       'moneyNext': lambda j, t: any(j in MOND[t + k] for k in range(1, 21)),
       'bloomNext': lambda j, t: any(j in FLOWER[t + k] for k in range(1, 21))}
res = {}
for g in ('hotNext', 'moneyNext', 'bloomNext'):
    acc = {'mc': [0, 0, 0], 'old': [0, 0, 0], 'base': [0, 0, 0]}
    for t in range(T0, T1 + 1):
        s = ST[t]
        now = set(PK[t][{'hotNext': 'hot', 'moneyNext': 'money', 'bloomNext': 'bloom'}[g]]) | (FLOWER[t] if g == 'bloomNext' else set())
        mc = PK[t][g]; old = OLDP(s, g, now)[:7]; el = [j for j in range(N) if s['ok'][j] and j not in now]
        for key, pk in (('mc', mc), ('old', old), ('base', el)):
            acc[key][0] += len(pk); acc[key][1] += sum(OUT[g](j, t) for j in pk); acc[key][2] += 1 if pk else 0
    res[g] = {k: {'picks': v[0], 'hits': v[1], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None, 'days': v[2]} for k, v in acc.items()}
    print(g, json.dumps(res[g], ensure_ascii=False)); sys.stdout.flush()
fmt = lambda x: x[:4] + '-' + x[4:6] + '-' + x[6:]
out = {'schema': 'su-mc-past-1', 'order': '1422', 'rule': 'mc365-v1', 'from': fmt(DAYS[T0]), 'to': fmt(DAYS[T1]), 'lastData': fmt(DAYS[-1]), 'days': T1 - T0 + 1, 'within': 20,
       'how': {'mc': '묶음마다 소거 한 번(su21.py 와 같은 기본 조건) → 몬테카를로 드문 차례 일곱', 'old': '예전 셈(차례 = 오른 만큼 · 앞선 만큼)', 'base': '그날 소거 전 아무 회사'},
       'mc': {'paths': A.paths, 'hist': HIST, 'every': 20, 'how': '스무 날마다 그 회사 · 업종 지난 250날 하루 값을 2만 번 섞어 그린 길과 견줘 드묾(p)을 셈'},
       'universe': '지금 우량주 365곳(지난 1년도 같은 365곳으로 셈 · 살아남은 곳만 보는 치우침이 있음)', 'src': BUN + ' · public/data/atlas11/view/board.json',
       'what': {'hotNext': '한 달(20거래일) 안에 불장 일곱에 듦', 'moneyNext': '한 달 안에 돈이 몰리는 일곱에 듦', 'bloomNext': '한 달 안에 시장보다 15 넘게 앞섬(꽃)'}, 'res': res}
OUTF = os.path.join(R, A.out)
os.makedirs(os.path.dirname(OUTF), exist_ok=True)
json.dump(out, open(OUTF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', out['from'], '~', out['to'], out['days'])
