#!/usr/bin/env python3
"""수르 문화 셈(주문 1912)의 지난 1년 — 될 듯 셋이 한 달 안에 그렇게 된 몫 · 1422 셈 · 예전 셈 · 아무 회사와 견줌 · 앞 반년 · 뒤 반년
  사장님 2026-11-09 19:12 「… 42개에 종목을 찾아내는데 문화에 중심으로 세팅한 다음 42개를 다시 찾아내고 그중에 이전에 했던 몬테카를로 방식 소급법(소거법)을 더 진화시켜서 작업 해봐」
  재료 = su_mc_past.py 와 같음(저장소 안 자료만 · 앞날 값 없음): 365곳 = 지금 판 · 날마다 값 = reports/atlas11/universe/2026-10-10/bundle.json.gz
  날마다: 묶음마다 소거 한 번(su21.py 와 같은 기본 조건) → 문화 흔적으로 뺌(빚투 쏠림 · 본전 버티기) → 문화 흔적이 많은 차례 → 몬테카를로 드문 차례(요즘 흔들림에 맞춘 길)
          · 불장이 될 듯 · 꽃이 될 듯은 365곳 모두의 길과 견줌(크게 움직인 차례) · 돈 둘은 업종마다 국민주(몸집 위 열에 하나)를 먼저
  맞음 = 한 달(20거래일) 안에 불장 일곱 · 돈이 몰리는 일곱(문화 셈 목록)에 듦 · 꽃 = 시장보다 15 넘게 앞섬 — 1422 목록 잣대로도 따로 셈
  우연 길 정직도(calib) = 지난 1년 아무 회사 · 아무 날을 1,500번씩 뽑아 「스무 번에 한 번」 드묾이 몇 번 나오나(옛 길 · 새 길)
  쓰는 법: python3 scripts/atlas11/next/su_culture_past.py [--repo .] [--out reports/atlas11/su-next/past-culture.json]
"""
import json, gzip, argparse, collections, os, sys, hashlib
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import su21_culture as CU

ap = argparse.ArgumentParser()
ap.add_argument('--repo', default='.'); ap.add_argument('--out', default='reports/atlas11/su-next/past-culture.json')
ap.add_argument('--from-day', default='2025-10-01'); ap.add_argument('--mid', default='2026-04-01')
ap.add_argument('--paths', type=int, default=20000); ap.add_argument('--calib', type=int, default=1500)
ap.add_argument('--cache', default=None)    # 탐색용 — 날마다 셈(ST · PV · CT)을 저장해 다시 씀
ap.add_argument('--explore', default=None)  # 탐색용 — 짜임 여러 개(JSON)를 견줘 찍기만 함(저장 안 함)
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
T0 = next(i for i, x in enumerate(DAYS) if x >= A.from_day.replace('-', ''))
MID = next(i for i, x in enumerate(DAYS) if x >= A.mid.replace('-', ''))
T1 = ND - 1 - 20
with np.errstate(divide='ignore', invalid='ignore'):
    LR = np.log(P[:, 1:] / P[:, :-1])
LR = np.concatenate([np.full((N, 1), np.nan), LR], axis=1)
LR[~np.isfinite(LR)] = np.nan
with np.errstate(invalid='ignore'):
    MR = np.nanmean(LR, axis=0)
    ILR = np.array([np.nanmean(LR[IX == i], axis=0) for i in range(NI)])
HIST = 250
def seed(*xs): return int(hashlib.sha256('|'.join(map(str, xs)).encode()).hexdigest()[:16], 16)

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

# 우연 길 — 스무 날마다(묶음 첫날 앞 250날) 회사 · 업종마다 창 합의 정렬된 길 · 옛 길(하루 값을 그대로 섞음 · 1422) · 새 길(요즘 흔들림에 맞춤 · 1912)
NULL = {}
def null_block(b0):
    if b0 in NULL: return NULL[b0]
    a = max(1, b0 - HIST)
    out = {m: {'co20': [None] * N, 'co5': [None] * N, 'x5': [None] * N, 'ind20': [None] * NI, 'ind5': [None] * NI} for m in ('iid', 'fhs')}
    def iid(x, n, sd):
        x = x[np.isfinite(x)]
        if len(x) < 60: return None
        rng = np.random.default_rng(sd)
        return np.sort(x[rng.integers(0, len(x), size=(A.paths, n))].sum(axis=1))
    def fhs(x, n, sd):
        s = CU.fhs_paths(x, n, A.paths, sd)
        return None if s is None else np.sort(s.sum(axis=1))
    for m, f in (('iid', iid), ('fhs', fhs)):
        for j in range(N):
            h = LR[j, a:b0]
            out[m]['co20'][j] = f(h, 20, seed(b0, j, 'co20', m)); out[m]['co5'][j] = f(h, 5, seed(b0, j, 'co5', m))
            out[m]['x5'][j] = f(h - MR[a:b0], 5, seed(b0, j, 'x5', m))
        for i in range(NI):
            h = ILR[i, a:b0] - MR[a:b0]
            out[m]['ind20'][i] = f(h, 20, seed(b0, i, 'ind20', m)); out[m]['ind5'][i] = f(h, 5, seed(b0, i, 'ind5', m))
    NULL.clear(); NULL[b0] = out
    return out
def blk(t): return T0 + ((t - T0) // 20) * 20
def pvv(arr, a):
    o = np.full(len(a), 2.0)
    for j in range(len(a)):
        p = CU.p_of(arr[j], a[j])
        if p is not None: o[j] = p
    return o

import pickle
if A.cache and os.path.exists(A.cache):
    ST, CT, PV = pickle.load(open(A.cache, 'rb'))
else:
    ST, CT, PV = {}, {}, {}
    for t in range(T0, ND):
        s = ST[t] = stats(t); nul = null_block(blk(t))
        PV[t] = {m: {'co20': pvv(nul[m]['co20'], s['l20']), 'co5': pvv(nul[m]['co5'], s['l5']), 'x5': pvv(nul[m]['x5'], s['x5']),
                     'ind20': pvv(nul[m]['ind20'], s['il20']), 'ind5': pvv(nul[m]['ind5'], s['il5'])} for m in ('iid', 'fhs')}
        CT[t] = CU.traits(P, IX, NI, s['cap'], t, s['l5'], s['l20'], s['il5'], s['il20'])[0]
        if (t - T0) % 40 == 0: print('날', t - T0, '/', ND - T0, DAYS[t]); sys.stdout.flush()
    if A.cache: pickle.dump((ST, CT, PV), open(A.cache, 'wb'))
CFG0 = {'POS': CU.POS, 'NEG': CU.NEG, 'MKT': sorted(CU.MKT_ORDER), 'BIG': sorted(CU.BIGFIRST), 'COV': 'fhs', 'INDV': 'fhs'}

def pick(t, culture, cfg=None):
    cfg = cfg or CFG0
    s = ST[t]; ok = s['ok']; C = CT[t]
    VC = PV[t][cfg['COV'] if culture else 'iid']; VI = PV[t][cfg['INDV'] if culture else 'iid']
    V = {'co20': VC['co20'], 'co5': VC['co5'], 'x5': VC['x5'], 'ind20': VI['ind20'], 'ind5': VI['ind5']}
    hi = set(hot_inds(s))
    def cnt(k, j): return sum(bool(C[x][j]) for x in cfg['POS'][k]) if culture else 0
    def bad(k, j): return culture and any(bool(C[x][j]) for x in cfg['NEG'][k])
    def filt(k, js):
        g = [j for j in js if not bad(k, j)]
        return g if len(g) >= 7 else g + [j for j in js if bad(k, j)]
    def key(k, j, pk, val):
        if culture and k in cfg['MKT']: return (-cnt(k, j), -val[j] if np.isfinite(val[j]) else 9, j)
        return (-cnt(k, j), V[pk][j], -val[j] if np.isfinite(val[j]) else 9, j)
    HOT = per(sorted(filt('hot', [j for j in range(N) if ok[j] and IX[j] in hi and s['r20'][j] > 0]), key=lambda j: key('hot', j, 'co20', s['l20'])))
    x20i = s['i20'] - s['m20']
    def lead(i, g, skip=()):
        m = [j for j in range(N) if IX[j] == i and ok[j] and np.isfinite(s[g][j]) and j not in skip]
        if culture and ('money' if g == 'g20' else 'moneyNext') in cfg['BIG']:
            mb = [j for j in m if C['big'][j] and s[g][j] > 0]
            m = mb or m
        if not m: return None
        j = max(m, key=lambda j: s[g][j])
        return int(j) if s[g][j] > 0 else None
    MON, used = [], []
    for i in sorted([i for i in range(NI) if np.isfinite(x20i[i]) and x20i[i] > 0], key=lambda i: (V['ind20'][i], -s['il20'][i], i)):
        j = lead(i, 'g20')
        if j is not None: MON.append(j); used.append(i)
        if len(MON) == 7: break
    sp = sprout(s)
    ilv = np.array([s['il20'][IX[j]] if np.isfinite(s['il20'][IX[j]]) else -9 for j in range(N)])
    pind = np.array([V['ind20'][IX[j]] for j in range(N)])
    BLM = sorted(filt('bloom', [j for j in range(N) if sp[j] and s['cap'][j] >= s['thr']]), key=lambda j: (-cnt('bloom', j), pind[j], -ilv[j], j))[:7]
    hN = per(sorted(filt('hotNext', [j for j in range(N) if ok[j] and j not in HOT and s['r5'][j] > 0 and (IX[j] in hi or (np.isfinite(s['i5'][IX[j]]) and s['i5'][IX[j]] > 0))]),
                    key=lambda j: key('hotNext', j, 'co5', s['l5'])))
    mN = []
    for i in sorted([i for i in range(NI) if i not in used], key=lambda i: (V['ind5'][i], -(s['il5'][i] if np.isfinite(s['il5'][i]) else -9), i)):
        j = lead(i, 'g5', skip=set(MON) | set(mN))
        if j is not None: mN.append(j)
        if len(mN) == 7: break
    bN = per(sorted(filt('bloomNext', [j for j in range(N) if sp[j] and j not in BLM]), key=lambda j: key('bloomNext', j, 'x5', s['x5'])))
    return {'hot': HOT, 'money': MON, 'bloom': BLM, 'hotNext': hN, 'moneyNext': mN, 'bloomNext': bN}

# 예전 셈(su_mc_past.py OLDP 와 같은 차례) — 견줌
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

NOWK = {'hotNext': 'hot', 'moneyNext': 'money', 'bloomNext': 'bloom'}
PK = {t: pick(t, False) for t in range(T0, ND)}
if A.explore:
    FLOWER0 = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) >= 0.15))[0].tolist()) for t in ST}
    for name, ov in json.load(open(A.explore)).items():
        cfg = {**CFG0, **ov, 'POS': {**CFG0['POS'], **ov.get('POS', {})}, 'NEG': {**CFG0['NEG'], **ov.get('NEG', {})}}
        PX = {t: pick(t, True, cfg) for t in range(T0, ND)}
        HOTD = {t: set(PX[t]['hot']) for t in PX}; MOND = {t: set(PX[t]['money']) for t in PX}
        OUT = {'hotNext': lambda j, t: any(j in HOTD[t + k] for k in range(1, 21)), 'moneyNext': lambda j, t: any(j in MOND[t + k] for k in range(1, 21)),
               'bloomNext': lambda j, t: any(j in FLOWER0[t + k] for k in range(1, 21))}
        row = {}
        for g in ('hotNext', 'moneyNext', 'bloomNext'):
            for h, (a, b2) in (('앞', (T0, MID - 1)), ('뒤', (MID, T1))):
                n = hh = no = ho = 0
                for t in range(a, b2 + 1):
                    pk = PX[t][g]; n += len(pk); hh += sum(OUT[g](j, t) for j in pk)
                    now = set(PX[t][NOWK[g]]) | (FLOWER0[t] if g == 'bloomNext' else set())
                    op = OLDP(ST[t], g, now)[:7]; no += len(op); ho += sum(OUT[g](j, t) for j in op)
                row[g + h] = (round(100 * hh / n, 1), round(100 * ho / no, 1))
        print(name, json.dumps(row, ensure_ascii=False)); sys.stdout.flush()
    sys.exit(0)
PC = {t: pick(t, True) for t in range(T0, ND)}
FLOWER = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) >= 0.15))[0].tolist()) for t in ST}
NOWK = {'hotNext': 'hot', 'moneyNext': 'money', 'bloomNext': 'bloom'}
def score(TG):
    HOTD = {t: set(TG[t]['hot']) for t in TG}; MOND = {t: set(TG[t]['money']) for t in TG}
    OUT = {'hotNext': lambda j, t: any(j in HOTD[t + k] for k in range(1, 21)),
           'moneyNext': lambda j, t: any(j in MOND[t + k] for k in range(1, 21)),
           'bloomNext': lambda j, t: any(j in FLOWER[t + k] for k in range(1, 21))}
    res = {}
    for g in ('hotNext', 'moneyNext', 'bloomNext'):
        acc = {h: {'culture': [0, 0, 0], 'mc1422': [0, 0, 0], 'old': [0, 0, 0], 'base': [0, 0, 0]} for h in ('all', 'first', 'second')}
        for t in range(T0, T1 + 1):
            s = ST[t]; hs = ('all', 'first' if t < MID else 'second')
            now = set(TG[t][NOWK[g]]) | (FLOWER[t] if g == 'bloomNext' else set())
            el = [j for j in range(N) if s['ok'][j] and j not in now]
            for key, pk in (('culture', PC[t][g]), ('mc1422', PK[t][g]), ('old', OLDP(s, g, now)[:7]), ('base', el)):
                hits = sum(OUT[g](j, t) for j in pk)
                for h in hs:
                    acc[h][key][0] += len(pk); acc[h][key][1] += hits; acc[h][key][2] += 1 if pk else 0
        res[g] = {h: {k: {'picks': v[0], 'hits': v[1], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None, 'days': v[2]} for k, v in a.items()} for h, a in acc.items()}
        print(g, json.dumps({h: {k: v['per100'] for k, v in a.items()} for h, a in res[g].items()}, ensure_ascii=False)); sys.stdout.flush()
    return res
res = score(PC)
res1422 = score(PK)

# 우연 길 정직도 — 아무 회사 · 아무 날 · 「스무 번에 한 번」 드묾(위쪽)이 몇 번 나오나
rng = np.random.default_rng(seed('calib-1912'))
calib = {}
for rel in (False, True):
    for w in (20, 5):
        n = a = f = 0
        for _ in range(A.calib):
            t = int(rng.integers(T0, ND)); j = int(rng.integers(0, N))
            h = LR[j, t - w - HIST + 1:t - w + 1] - (MR[t - w - HIST + 1:t - w + 1] if rel else 0)
            x = LR[j, t - w + 1:t + 1] - (MR[t - w + 1:t + 1] if rel else 0)
            if np.isfinite(h).sum() < 200 or not np.isfinite(x).all(): continue
            act = float(x.sum()); sd = int(rng.integers(1 << 30))
            hh = h[np.isfinite(h)]; r2 = np.random.default_rng(sd)
            pi = (int((hh[r2.integers(0, len(hh), size=(A.paths, w))].sum(1) >= act).sum()) + 1) / (A.paths + 1)
            pf = CU.fhs_p(h, w, act, A.paths, sd)
            n += 1; a += pi <= 0.05; f += (pf is not None and pf <= 0.05)
        calib[('rel' if rel else 'raw') + str(w)] = {'n': n, 'old': round(100 * a / n, 1), 'new': round(100 * f / n, 1)}
        print('정직도', rel, w, calib[('rel' if rel else 'raw') + str(w)]); sys.stdout.flush()

fmt = lambda x: x[:4] + '-' + x[4:6] + '-' + x[6:]
out = {'schema': 'su-culture-past-1', 'order': '1912', 'rule': CU.RULE_ID, 'from': fmt(DAYS[T0]), 'mid': fmt(DAYS[MID]), 'to': fmt(DAYS[T1]), 'lastData': fmt(DAYS[-1]),
       'days': T1 - T0 + 1, 'within': 20,
       'how': {'culture': '소거 한 번 → 문화 흔적으로 뺌(빚투 쏠림 · 본전 버티기) → 문화 흔적 많은 차례 → 요즘 흔들림에 맞춘 몬테카를로 차례(불장이 될 듯 · 꽃이 될 듯은 365곳 모두의 길) · 돈 둘은 국민주 먼저',
               'mc1422': '주문 1422 셈(소거 한 번 → 하루 값을 그대로 섞은 몬테카를로 드문 차례)', 'old': '예전 셈(오른 만큼 · 앞선 만큼 차례)', 'base': '그날 소거 전 아무 회사'},
       'mc': {'paths': A.paths, 'hist': HIST, 'every': 20, 'lam': CU.LAM, 'how': '스무 날마다 그 회사 · 업종 지난 250날 하루 값을 그날 흔들림으로 나눈 뒤 지금 흔들림으로 키워 2만 번 섞은 길과 견줌'},
       'universe': '지금 우량주 365곳(지난 1년도 같은 365곳으로 셈 · 살아남은 곳만 보는 치우침이 있음)', 'src': BUN + ' · public/data/atlas11/view/board.json',
       'what': {'hotNext': '한 달(20거래일) 안에 불장 일곱에 듦', 'moneyNext': '한 달 안에 돈이 몰리는 일곱에 듦', 'bloomNext': '한 달 안에 시장보다 15 넘게 앞섬(꽃)'},
       'res': {g: v['all'] for g, v in res.items()}, 'halves': {g: {'first': v['first'], 'second': v['second']} for g, v in res.items()},
       'res1422': {g: v['all'] for g, v in res1422.items()}, 'calib': calib, 'calibHow': '지난 1년 아무 회사 · 아무 날을 뽑아 그 창 값을 그 앞 250날 길과 견줌 · 스무 번에 한 번(5) 아래 드묾이 100번에 몇 번 나왔나 — 5에 가까울수록 정직'}
OUTF = os.path.join(R, A.out)
os.makedirs(os.path.dirname(OUTF), exist_ok=True)
json.dump(out, open(OUTF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', out['from'], '~', out['to'], out['days'])
