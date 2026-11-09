#!/usr/bin/env python3
"""수르 엄격 셈(주문 0854)의 지난 1년 — 옛 셈과 견줌
  사장님 2026-11-09 08:54 「… 몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로 찾아내도록 할」 · 09:02 「어」
  이해 보고 5: 「지난 기록에도 같은 규칙으로 대어, 예전보다 정말 더 잘 골라지는지 숫자로 견줘요」
  재료 = su_next_past.py 와 같음(저장소 안 자료만 · 앞날 값 없음): 365곳 = 지금 판 · 날마다 값 = reports/atlas11/universe/2026-10-10/bundle.json.gz · 회사 재무 = 사이트 회사 자료(atlas/data/co · 지금 값)
  될 듯 셋: 날마다 옛 셈의 후보 차례(H4 → H1 · M2 → M3 · B3 → B1 — su21.py 의 POOL 과 같은 차례) → 몬테카를로(그 회사 지난 250날 하루 값 2만 번 섞음 · 스무 날마다 다시 셈 · 위 5 = 스무 번에 한 번)
     → 소거 기준 가운데 지난 자료로 셀 수 있는 것(가 · 나 · 다 · 라6 · 마 — 24가지 · 수급 · 뉴스 여섯 가지는 지난 자료가 없어 셈 빼고) → 업종마다 둘(돈 = 하나) · 일곱까지
  맞음 = 옛 셈과 같은 잣대(한 달 안에 불장 일곱 · 돈이 몰리는 일곱에 듦 · 시장보다 15 넘게 앞섬) · 100번에 몇 번
  쓰는 법: python3 scripts/atlas11/next/su_strict_past.py --live <사이트 자료(atlas/data/co)> [--repo .] [--out reports/atlas11/su-next/past-strict.json]
"""
import json, gzip, argparse, collections, math, os, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--repo', default='.'); ap.add_argument('--live', required=True); ap.add_argument('--out', default='reports/atlas11/su-next/past-strict.json')
ap.add_argument('--from-day', default='2025-10-01'); ap.add_argument('--paths', type=int, default=20000)
ap.add_argument('--win', default='hotNext:5,moneyNext:5,bloomNext:5') # 묶음마다 창(su21_strict.py WIN 과 같게)
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
day0 = A.from_day.replace('-', '')
T0 = next(i for i, x in enumerate(DAYS) if x >= day0)
T1 = ND - 1 - 20
with np.errstate(divide='ignore', invalid='ignore'):
    LR = np.log(P[:, 1:] / P[:, :-1])                      # 하루 로그 오르내림(열 t = t-1 → t)
LR = np.concatenate([np.full((N, 1), np.nan), LR], axis=1)
LR[~np.isfinite(LR)] = np.nan
with np.errstate(invalid='ignore'):
    MR = np.nanmean(LR, axis=0)                              # 시장 = 365곳 고른 평균

# 옛 셈(su_next_past.py 와 같은 셈) — 지금 셋 · 될 듯 후보 차례
def stats(t):
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
    return per(sorted([j for j in range(N) if s['ok'][j] and IX[j] in hi and s['r20'][j] > 0], key=lambda j: -s['r20'][j]))
def MONEY(s, rank=(0, 7), gkey='g20', allc_=False):
    x = s['i20'] - s['m20']
    inds = [i for i in np.argsort(-np.nan_to_num(x, nan=-9)) if x[i] > 0]
    out = []
    for i in inds[rank[0]:]:
        m = [j for j in range(N) if IX[j] == i and s['ok'][j] and not np.isnan(s[gkey][j])]
        if not m: continue
        if allc_: out += [j for j in sorted(m, key=lambda j: -s[gkey][j]) if s[gkey][j] > 0]
        else:
            j = max(m, key=lambda j: s[gkey][j])
            if s[gkey][j] > 0: out.append(int(j))
        if not allc_ and len(out) == rank[1] - rank[0]: break
    return out
def sprout(s):
    x20 = s['r20'] - s['m20']; x5 = s['r5'] - s['m5']
    return s['ok'] & (x20 < 0.05) & (x5 >= 0)
def BLOOM(s):
    sp = sprout(s) & (s['cap'] >= s['thr']); ix = s['i20'] - s['m20']
    return sorted([j for j in range(N) if sp[j]], key=lambda j: (-(ix[IX[j]] if not np.isnan(ix[IX[j]]) else -9), -(s['r20'][j] - s['m20'])))[:7]
def H1(s, now):
    return sorted([j for j in range(N) if s['ok'][j] and j not in now and s['r5'][j] > 0 and s['r20'][j] > 0 and s['i5'][IX[j]] > 0], key=lambda j: -s['r5'][j])
def H4(s, now):
    hi = [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11]
    full = per(sorted([j for j in range(N) if s['ok'][j] and IX[j] in hi and s['r20'][j] > 0], key=lambda j: -s['r20'][j]), k=14)
    return [j for j in full if j not in now]
def M2(s, now):
    return [j for j in MONEY(s, rank=(7, 14)) if j not in now]
def M3(s, now):
    x20 = s['i20'] - s['m20']
    top = set([i for i in np.argsort(-np.nan_to_num(x20, nan=-9)) if x20[i] > 0][:7])
    best = []
    for i in range(len(IND)):
        if i in top: continue
        m = [j for j in range(N) if IX[j] == i and s['ok'][j] and j not in now]
        if not m: continue
        j = max(m, key=lambda j: s['g5'][j])
        if s['g5'][j] > 0: best.append(j)
    return sorted(best, key=lambda j: -s['g5'][j])
def B1(s, now):
    sp = sprout(s) & (s['cap'] >= s['thr']); x5 = s['r5'] - s['m5']
    return sorted([j for j in range(N) if sp[j] and j not in now], key=lambda j: -x5[j])
def B3(s, now):
    sp = sprout(s); x5 = s['r5'] - s['m5']
    return sorted([j for j in range(N) if sp[j] and j not in now and x5[j] >= 0.02 and s['r20'][j] > 0], key=lambda j: -x5[j])
def uniq(xs):
    seen, out = set(), []
    for x in xs:
        if x not in seen: seen.add(x); out.append(x)
    return out
POOL = {'hotNext': lambda s, now: uniq(H4(s, now) + H1(s, now)), 'moneyNext': lambda s, now: uniq(M2(s, now) + M3(s, now)), 'bloomNext': lambda s, now: uniq(B3(s, now) + B1(s, now))}
OLD = {'hotNext': lambda s, now: per(POOL['hotNext'](s, now)), 'moneyNext': lambda s, now: (M2(s, now) + [j for j in M3(s, now) if j not in M2(s, now)])[:7], 'bloomNext': lambda s, now: per(POOL['bloomNext'](s, now))}

# 몬테카를로 — 스무 날마다(묶음 첫날 앞 250날) 회사마다 닷새 합의 위 5 문턱(두 씨앗)
HIST = 250
WIN = {k: int(v) for k, v in (x.split(':') for x in A.win.split(','))}
def q95(x, seed, n):
    rng = np.random.default_rng(seed)
    return float(np.quantile(x[rng.integers(0, len(x), size=(A.paths, n))].sum(axis=1), 0.95))
TH = {}
for b0 in range(T0, T1 + 1, 20):
    for j in range(N):
        h = LR[j, max(1, b0 - HIST):b0]
        for rel in (False, True):
            x = h - MR[max(1, b0 - HIST):b0] if rel else h
            x = x[np.isfinite(x)]
            for n in sorted(set(WIN.values())):
                TH[(b0, j, rel, n)] = (q95(x, 1000003 * b0 + 7 * j + rel + 13 * n, n), q95(x, 2000003 * b0 + 11 * j + rel + 17 * n, n), len(x)) if len(x) >= 200 else (None, None, len(x))
def blk(t): return T0 + ((t - T0) // 20) * 20

# 회사 재무(지금 값 — 지난 해마다 바뀌는 값이라 한 해 안에서는 거의 그대로)
FIN = {}
for c in codes:
    try: co = json.load(open(A.live + '/atlas/data/co/' + c + '.json', encoding='utf-8'))
    except Exception: co = None
    FIN[c] = (co.get('fin') or {}, co.get('pbr'), isinstance(co.get('c'), dict)) if isinstance(co, dict) else ({}, None, False)
FIN_INDS = ('은행', '증권', '보험', '캐피탈', '카드')

_C = {}
def cache(t, s):
    if t not in _C:
        with np.errstate(divide='ignore', invalid='ignore'):
            vol = np.nanstd(np.log(P[:, t - 19:t + 1] / P[:, t - 20:t]), axis=1)
        okv = vol[s['ok'] & np.isfinite(vol)]
        mem = {i: [k for k in range(N) if IX[k] == i and s['ok'][k]] for i in range(len(IND))}
        _C[t] = {'vol': vol, 'vol90': float(np.quantile(okv, 0.9)) if len(okv) else 0.0, 'm5': float(np.nanmean(LR[:, t - 4:t + 1].sum(axis=1))), 'mem': mem}
    return _C[t]

def strict_ok(j, t, s, g):
    """그날 t 에 회사 j 가 엄격 셈(지난 자료로 셀 수 있는 것)을 지나는가"""
    rel = g == 'bloomNext'; W5 = WIN[g]
    th = TH[(blk(t), j, rel, W5)]
    if th[0] is None: return False                                          # 가4 · 몬테카를로 바탕 모자람
    K = cache(t, s)
    a = (math.log(P[j, t] / P[j, t - W5]) - ((K['m5'] if W5 == 5 else float(np.nanmean(LR[:, t - W5 + 1:t + 1].sum(axis=1)))) if rel else 0))
    if not (a >= th[0] and a >= th[1]): return False                        # 몬테카를로 · 나1 다시 셈
    w = P[j, t - 20:t + 1]
    if np.isnan(w).any() or (np.abs(w[1:] / w[:-1] - 1) >= 0.35).any(): return False   # 가1 · 가3
    run, mx = 1, 1
    for p_, q_ in zip(w[:-1], w[1:]):
        run = run + 1 if q_ == p_ else 1; mx = max(mx, run)
    if mx >= 3: return False                                                 # 가6
    fin, pbr, opens = FIN[codes[j]]
    if not opens: return False                                               # 가5
    if np.isfinite(P[j, max(0, t - 251):t + 1]).sum() < 240: return False   # 가7
    lr = np.log(w[-W5:] / w[-W5 - 1:-1])
    if not (lr.sum() - lr.max() > 0): return False                           # 나2
    if not ((lr > 0).sum() * 2 > W5): return False                           # 나3
    if not ((w[-1] / w[-6] - 1 if W5 == 20 else w[-1] / w[-2] - 1) >= -0.03): return False   # 나4(20날 창 = 마지막 닷새 · 닷새 창 = 마지막 날)
    if not (w[-1] >= 0.85 * np.nanmax(w[-W5 - 1:])): return False            # 나5
    if not (K['vol'][j] < K['vol90']): return False                          # 나6
    r5 = s['r20'] if W5 == 20 else s['r5']; mem = K['mem'][IX[j]]
    rs = [r5[k] for k in mem]
    if not (np.mean(rs) > 0): return False                                   # 다1
    if not (sum(1 for x in rs if x > 0) * 10 >= len(rs) * 4): return False  # 다2
    ex = r5[j] - (s['m20'] if W5 == 20 else s['m5'])
    if not (ex > 0 and ex > (0.03 if W5 == 20 else 0.01)): return False      # 다3 · 다4
    if not ((1 + sum(1 for x in rs if x > r5[j])) * 2 <= len(rs) + 1): return False   # 다5
    if not (CAP[j, t] >= 2000): return False                                 # 라6
    last = lambda k: (fin.get(k) or [None])[-1] if isinstance(fin.get(k), list) and fin.get(k) else None
    op, net, roe, debt, rev = last('op'), last('net'), last('roe'), last('debt'), last('rev')
    rv0 = fin.get('rev')[-2] if isinstance(fin.get('rev'), list) and len(fin.get('rev')) >= 2 else None
    num = lambda x: isinstance(x, (int, float))
    isfin = any(x in ind_of[codes[j]] for x in FIN_INDS)
    if not (num(op) and op > 0 and num(net) and net > 0 and num(roe) and roe > 3): return False      # 마1 · 마2 · 마3
    if not (isfin or (num(debt) and debt < 200)): return False             # 마4
    if not (num(rev) and num(rv0) and rv0 > 0 and rev >= 0.9 * rv0): return False                   # 마5
    if not (num(pbr) and 0 < pbr < 10): return False                         # 마6
    return True

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
for g in ('hotNext', 'moneyNext', 'bloomNext'):
    per_ind = 1 if g == 'moneyNext' else 2
    acc = {'old': [0, 0, 0], 'strict': [0, 0, 0], 'base': [0, 0, 0], 'fail': [0, 0, 0], 'fill': [0, 0, 0]}
    for t in range(T0, T1 + 1):
        s = ST[t]; now = NOW[g][t] | (FLOWER[t] if g == 'bloomNext' else set())
        old = OLD[g](s, now)[:7]
        st = [j for j in old if strict_ok(j, t, s, g)]                       # 엄격 셈 = 옛 일곱을 거름(채우지 않음 · su21.py 와 같음)
        fl = per([j for j in POOL[g](s, now) if strict_ok(j, t, s, g)], k=7, per_ind=per_ind)   # 견줌 — 더 깊은 차례로 채웠다면
        el = [j for j in range(N) if s['ok'][j] and j not in now]
        for key, pk in (('old', old), ('strict', st), ('base', el), ('fail', [j for j in old if j not in st]), ('fill', fl)):
            acc[key][0] += len(pk); acc[key][1] += sum(OUT[g](j, t) for j in pk); acc[key][2] += 1 if pk else 0
    res[g] = {k: {'picks': v[0], 'hits': v[1], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None, 'days': v[2]} for k, v in acc.items()}
    print(g, json.dumps(res[g], ensure_ascii=False)); sys.stdout.flush()
fmt = lambda x: x[:4] + '-' + x[4:6] + '-' + x[6:]
out = {'schema': 'su-strict-past-1', 'win': WIN, 'how': {'strict': '옛 일곱 가운데 몬테카를로와 기준(지난 자료로 셀 수 있는 24가지)을 모두 지난 곳만', 'fail': '옛 일곱 가운데 걸린 곳', 'fill': '견줌 — 걸린 자리를 더 깊은 차례로 채웠다면'}, 'order': '0854', 'rule': 'strict31-v1', 'from': fmt(DAYS[T0]), 'to': fmt(DAYS[T1]), 'lastData': fmt(DAYS[-1]), 'days': T1 - T0 + 1, 'within': 20,
       'mc': {'paths': A.paths, 'hist': HIST, 'p': 0.05, 'every': 20, 'how': '스무 날마다 그 회사 지난 250날 하루 값을 2만 번 섞어 닷새 합의 위 5 문턱(씨앗 둘)을 셈'},
       'crit': {'used': 24, 'skipped': ['d1', 'd2', 'd3', 'd4', 'd5', 'd7'], 'why': '수급 · 뉴스는 지난 날 자료가 없어 셈 빼고 · 회사 재무는 지금 값'},
       'universe': '지금 우량주 365곳(지난 1년도 같은 365곳으로 셈 · 살아남은 곳만 보는 치우침이 있음)', 'src': BUN + ' · public/data/atlas11/view/board.json · atlas/data/co(재무)',
       'what': {'hotNext': '한 달(20거래일) 안에 불장 일곱에 듦', 'moneyNext': '한 달 안에 돈이 몰리는 일곱에 듦', 'bloomNext': '한 달 안에 시장보다 15 넘게 앞섬(꽃)'}, 'res': res}
OUTF = os.path.join(R, A.out)
os.makedirs(os.path.dirname(OUTF), exist_ok=True)
json.dump(out, open(OUTF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', out['from'], '~', out['to'], out['days'])
