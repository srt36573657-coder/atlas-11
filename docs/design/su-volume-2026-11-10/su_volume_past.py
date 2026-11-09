#!/usr/bin/env python3
"""수르 — 기록만 둔 넷(당일치기 · 작은 회사 · 따라사기 · 새내기)을 하루 거래량으로 잴 수 있나(주문 0033)
  사장님 2026-11-10 00:33 「그래」 — 물음 「하루 동안 사고판 양 자료로 남은 4가지도 잴 수 있는지 알아볼까요?」의 답
  재료 = su_culture_past.py 와 같음 — 저장소 안 자료만 · 앞날 값 없음
    365곳 = public/data/atlas11/view/board.json · 날마다 [날, 시가, 고가, 저가, 종가, 거래량] = reports/atlas11/universe/2026-10-10/bundle.json.gz
    날마다 셈(ST · CT · PV) = su_culture_past.py --cache 로 저장한 것(같은 365곳 차례 · 같은 날 · 2026-11-10 00:38 다시 셈 — 1912 숫자와 같음을 확인)
  흔적 다섯(문턱은 미리 정함 · 지난 1년에 맞춰 고르지 않음):
    dtr    당일치기   — 닷새 평균 회전율(거래량 ÷ 상장 주식 수)이 그날 365곳 가운데 위 열에 하나
    dtrR   당일치기+  — dtr 이고 닷새 동안 장중 출렁임(고가 − 저가) 합이 하루 오르내림 합보다 큰 쪽 위 30(장 안에서 오갔다 제자리) — 고가 · 저가가 있어야 함
    small  작은 회사  — 몸집이 365곳 가운데 아래 열에 하나이고 스무 날 평균 회전율이 365곳 가운데값을 넘음(작은데 사고팔기가 잦음 = 개인 몫이 큰 곳)
    follow 따라사기   — 닷새 안에 거래량이 그 앞 60거래일 가운데값의 5배를 넘은 날이 있고 그날 그 회사만(업종 평균보다 3 넘게) 오름
    newb   새내기     — 닷새 안에 하루 5 넘게 뛴 날이 거래량 3배 넘는 날과 겹침 — 나이 · 처음 온 때는 계좌 자료에만 있어 회사마다는 못 잼(가까운 모습만)
  견줌: ① 날마다 켜진 회사 수 · 이미 쓰는 일곱과 겹침 ② 그 뒤 한 달(20거래일) 시장보다 — 켜진 회사 평균 − 365곳 평균(날마다 셈 → 날 평균)
        ③ 될 듯 셋 맞음 — 지금 셈(culture7-v1)에 흔적을 「빼기」 또는 「앞에 세우기」로 더했을 때 · 앞 반년 · 뒤 반년(지금 일곱 · 불장 · 돈 목록은 그대로 두어 맞음 잣대가 같게)
  쓰는 법: python3 docs/design/su-volume-2026-11-10/su_volume_past.py --repo . --cache <cpast.pkl> [--out reports/atlas11/su-next/past-volume.json]
"""
import json, gzip, argparse, collections, os, sys, pickle
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--repo', default='.'); ap.add_argument('--cache', required=True)
ap.add_argument('--out', default='reports/atlas11/su-next/past-volume.json')
ap.add_argument('--from-day', default='2025-10-01'); ap.add_argument('--mid', default='2026-04-01')
A = ap.parse_args()
R = os.path.abspath(A.repo)
sys.path.insert(0, os.path.join(R, 'scripts/atlas11/next'))
import su21_culture as CU

b = json.load(open(R + '/public/data/atlas11/view/board.json', encoding='utf-8'))
BUN = 'reports/atlas11/universe/2026-10-10/bundle.json.gz'
d = json.load(gzip.open(R + '/' + BUN))
S = d['stocks']
codes = [c['code'] for c in b['companies'] if c['code'] in S and (S[c['code']].get('fchart') or {}).get('rows')]   # su_culture_past.py 와 같은 차례
ind_of = {c['code']: c['group']['label'] for c in b['companies']}
allc = [c for c, v in S.items() if (v.get('fchart') or {}).get('rows') and (v.get('list') or {}).get('listValue')]
ref = max(allc, key=lambda c: len(S[c]['fchart']['rows']))
DAYS = [r[0] for r in S[ref]['fchart']['rows']]
DI = {x: i for i, x in enumerate(DAYS)}
ND = len(DAYS)
def matk(cs, k):
    """k = 1 시가 · 2 고가 · 3 저가 · 4 종가 · 5 거래량 — 0 이나 빈 값은 비움(거래 멈춘 날)"""
    M = np.full((len(cs), ND), np.nan)
    for i, c in enumerate(cs):
        for r in S[c]['fchart']['rows']:
            j = DI.get(r[0])
            if j is not None and len(r) > k and r[k] and r[k] > 0: M[i, j] = r[k]
    return M
P, H, L, V = matk(codes, 4), matk(codes, 2), matk(codes, 3), matk(codes, 5)
N = len(codes)
IND = sorted(set(ind_of[c] for c in codes))
IX = np.array([IND.index(ind_of[c]) for c in codes]); NI = len(IND)
LV = np.array([S[c]['list']['listValue'] for c in codes], float)       # 시가총액(억 원 · 모음 날)
lastP = np.array([row[~np.isnan(row)][-1] for row in P])
SH = LV * 1e8 / lastP                                                    # 상장 주식 수(어림 — 모음 날 시가총액 ÷ 그날 종가)
TO = V / SH[:, None]                                                     # 하루 회전율
T0 = next(i for i, x in enumerate(DAYS) if x >= A.from_day.replace('-', ''))
MID = next(i for i, x in enumerate(DAYS) if x >= A.mid.replace('-', ''))
T1 = ND - 1 - 20

ST, CT, PV = pickle.load(open(A.cache, 'rb'))
assert set(ST) == set(range(T0, ND)) and len(ST[T0]['ok']) == N, '셈 저장 파일이 이 차례와 다름'

def vtraits(t):
    s = ST[t]; ok = s['ok']
    with np.errstate(all='ignore'):
        TO5 = np.nanmean(TO[:, t - 4:t + 1], 1); TO20 = np.nanmean(TO[:, t - 19:t + 1], 1)
        v5 = ok & np.isfinite(TO5)
        dtr = v5 & (TO5 >= np.nanpercentile(TO5[v5], 90))
        prev = P[:, t - 5:t]
        rng = (H[:, t - 4:t + 1] - L[:, t - 4:t + 1]) / prev
        mv = np.abs(P[:, t - 4:t + 1] / prev - 1)
        churn = np.nansum(rng, 1) / np.maximum(np.nansum(mv, 1), 1e-4)
        vc = v5 & np.isfinite(churn) & np.isfinite(rng).all(1)
        dtrR = dtr & vc & (churn >= np.nanpercentile(churn[vc], 70))
        cap = s['cap']; vcap = ok & np.isfinite(cap) & np.isfinite(TO20)
        small = vcap & (cap <= np.nanpercentile(cap[vcap], 10)) & (TO20 > np.nanmedian(TO20[vcap]))
        base = np.nanmedian(V[:, t - 64:t - 4], 1)
        r = P[:, t - 4:t + 1] / prev - 1
        rI = np.array([np.nanmean(r[IX == i], 0) for i in range(NI)])
        idio = (r - rI[IX]) >= 0.03
        vv = V[:, t - 4:t + 1]
        follow = ok & np.isfinite(base) & ((vv >= 5 * base[:, None]) & idio).any(1)
        newb = ok & np.isfinite(base) & ((vv >= 3 * base[:, None]) & (r >= 0.05)).any(1)
    return {'dtr': dtr, 'dtrR': dtrR, 'small': small, 'follow': follow, 'newb': newb}
VT = {t: vtraits(t) for t in range(T0, ND)}
NEW = ['dtr', 'dtrR', 'small', 'follow', 'newb']
OLD7 = ['herd', 'near', 'rev', 'casc', 'big', 'lot', 'attn']
NAME = {'dtr': '당일치기(회전율)', 'dtrR': '당일치기(회전율 + 장중 왕복)', 'small': '작은 회사', 'follow': '따라사기', 'newb': '새내기(가까운 모습)', **CU.NAME}

# ① 날마다 켜진 수 · 겹침 ② 그 뒤 한 달 시장보다
def half(t): return 'first' if t < MID else 'second'
cnt = {k: [] for k in NEW + OLD7}
ovl = {k: collections.Counter() for k in NEW}
nxt = {k: {h: {'diff': [], 'beat': [], 'off': []} for h in ('all', 'first', 'second')} for k in NEW + OLD7}
beat_all = {h: [] for h in ('all', 'first', 'second')}   # 바탕 — 365곳 가운데 시장(365곳 평균)보다 앞선 몫(값이 한쪽으로 길게 뻗으면 절반이 안 됨)
for t in range(T0, ND):
    C = {**CT[t], **VT[t]}; ok = ST[t]['ok']
    for k in NEW + OLD7: cnt[k].append(int((C[k] & ok).sum()))
    for k in NEW:
        on = C[k] & ok
        if on.any():
            ovl[k]['n'] += int(on.sum())
            for o in OLD7 + [x for x in NEW if x != k]: ovl[k][o] += int((on & C[o]).sum())
    if t > T1: continue
    with np.errstate(all='ignore'):
        F = P[:, t + 20] / P[:, t] - 1
    va = ok & np.isfinite(F)
    m = F[va].mean()
    for h in ('all', half(t)): beat_all[h].append(float((F[va] > m).mean()))
    for k in NEW + OLD7:
        on = C[k] & va
        if not on.any(): continue
        for h in ('all', half(t)):
            nxt[k][h]['diff'].append(float(F[on].mean() - m)); nxt[k][h]['beat'].append(float((F[on] > m).mean()))
            nxt[k][h]['off'].append(float(F[va & ~on].mean() - m))
def summ(z):
    return {'days': len(z['diff']), 'diff100': round(100 * float(np.mean(z['diff'])), 2) if z['diff'] else None,
            'off100': round(100 * float(np.mean(z['off'])), 2) if z['off'] else None,
            'beat100': round(100 * float(np.mean(z['beat'])), 1) if z['beat'] else None,
            'upDays100': round(100 * float(np.mean(np.array(z['diff']) > 0)), 1) if z['diff'] else None}
NEXT = {k: {h: summ(v) for h, v in nxt[k].items()} for k in NEW + OLD7}
COUNT = {k: {'mean': round(float(np.mean(cnt[k])), 1), 'min': int(np.min(cnt[k])), 'max': int(np.max(cnt[k]))} for k in NEW + OLD7}
OVL = {k: {o: round(100 * v / ovl[k]['n'], 1) for o, v in ovl[k].items() if o != 'n'} | {'n': ovl[k]['n']} for k in NEW if ovl[k]['n']}
for k in NEW + ['lot', 'attn']:
    print(NAME[k], '날마다', COUNT[k], '· 한 달 뒤 시장보다(100원에)', {h: (NEXT[k][h]['diff100'], NEXT[k][h]['beat100'], NEXT[k][h]['upDays100']) for h in ('all', 'first', 'second')}); sys.stdout.flush()

# ③ 될 듯 셋 — su_culture_past.py pick 과 같음 + 거래량 흔적(빼기 · 앞에 세우기 · 돈이 몰릴 듯은 대장 고를 때)
def per(order, k=7, per_ind=2):
    out, c = [], collections.Counter()
    for j in order:
        if c[IX[j]] >= per_ind: continue
        c[IX[j]] += 1; out.append(int(j))
        if len(out) == k: break
    return out
def hot_inds(s): return [i for i in np.argsort(-np.nan_to_num(s['i20'], nan=-9)) if s['i20'][i] > 0][:11]
def sprout(s):
    x20 = s['r20'] - s['m20']; x5 = s['r5'] - s['m5']
    return s['ok'] & (x20 < 0.05) & (x5 >= 0)
CFG0 = {'POS': CU.POS, 'NEG': CU.NEG, 'MKT': sorted(CU.MKT_ORDER), 'BIG': sorted(CU.BIGFIRST), 'COV': 'fhs', 'INDV': 'fhs', 'NEGM': [], 'POSM': []}
def pick(t, cfg):
    s = ST[t]; ok = s['ok']; C = {**CT[t], **VT[t]}
    VC = PV[t][cfg['COV']]; VI = PV[t][cfg['INDV']]
    Vv = {'co20': VC['co20'], 'co5': VC['co5'], 'x5': VC['x5'], 'ind20': VI['ind20'], 'ind5': VI['ind5']}
    hi = set(hot_inds(s))
    def cnt_(k, j): return sum(bool(C[x][j]) for x in cfg['POS'][k])
    def bad(k, j): return any(bool(C[x][j]) for x in cfg['NEG'][k])
    def filt(k, js):
        g = [j for j in js if not bad(k, j)]
        return g if len(g) >= 7 else g + [j for j in js if bad(k, j)]
    def key(k, j, pk, val):
        if k in cfg['MKT']: return (-cnt_(k, j), -val[j] if np.isfinite(val[j]) else 9, j)
        return (-cnt_(k, j), Vv[pk][j], -val[j] if np.isfinite(val[j]) else 9, j)
    HOT = per(sorted(filt('hot', [j for j in range(N) if ok[j] and IX[j] in hi and s['r20'][j] > 0]), key=lambda j: key('hot', j, 'co20', s['l20'])))
    x20i = s['i20'] - s['m20']
    def lead(i, g, skip=()):
        m = [j for j in range(N) if IX[j] == i and ok[j] and np.isfinite(s[g][j]) and j not in skip]
        nxt_ = g == 'g5'
        if nxt_ and cfg['NEGM']:
            mg = [j for j in m if not any(bool(C[x][j]) for x in cfg['NEGM'])]
            m = mg or m
        if ('money' if g == 'g20' else 'moneyNext') in cfg['BIG']:
            mb = [j for j in m if C['big'][j] and s[g][j] > 0]
            m = mb or m
        if nxt_ and cfg['POSM']:
            mp = [j for j in m if any(bool(C[x][j]) for x in cfg['POSM']) and s[g][j] > 0]
            m = mp or m
        if not m: return None
        j = max(m, key=lambda j: s[g][j])
        return int(j) if s[g][j] > 0 else None
    MON, used = [], []
    for i in sorted([i for i in range(NI) if np.isfinite(x20i[i]) and x20i[i] > 0], key=lambda i: (Vv['ind20'][i], -s['il20'][i], i)):
        j = lead(i, 'g20')
        if j is not None: MON.append(j); used.append(i)
        if len(MON) == 7: break
    sp = sprout(s)
    ilv = np.array([s['il20'][IX[j]] if np.isfinite(s['il20'][IX[j]]) else -9 for j in range(N)])
    pind = np.array([Vv['ind20'][IX[j]] for j in range(N)])
    BLM = sorted(filt('bloom', [j for j in range(N) if sp[j] and s['cap'][j] >= s['thr']]), key=lambda j: (-cnt_('bloom', j), pind[j], -ilv[j], j))[:7]
    hN = per(sorted(filt('hotNext', [j for j in range(N) if ok[j] and j not in HOT and s['r5'][j] > 0 and (IX[j] in hi or (np.isfinite(s['i5'][IX[j]]) and s['i5'][IX[j]] > 0))]),
                    key=lambda j: key('hotNext', j, 'co5', s['l5'])))
    mN = []
    for i in sorted([i for i in range(NI) if i not in used], key=lambda i: (Vv['ind5'][i], -(s['il5'][i] if np.isfinite(s['il5'][i]) else -9), i)):
        j = lead(i, 'g5', skip=set(MON) | set(mN))
        if j is not None: mN.append(j)
        if len(mN) == 7: break
    bN = per(sorted(filt('bloomNext', [j for j in range(N) if sp[j] and j not in BLM]), key=lambda j: key('bloomNext', j, 'x5', s['x5'])))
    return {'hot': HOT, 'money': MON, 'bloom': BLM, 'hotNext': hN, 'moneyNext': mN, 'bloomNext': bN}

PB = {t: pick(t, CFG0) for t in range(T0, ND)}
assert all(PB[t]['hot'] == pick(t, CFG0)['hot'] for t in (T0, MID, T1)), '같은 셈이 같은 목록을 내야 함'
FLOWER = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) >= 0.15))[0].tolist()) for t in ST}
HOTD = {t: set(PB[t]['hot']) for t in PB}; MOND = {t: set(PB[t]['money']) for t in PB}
OUT = {'hotNext': lambda j, t: any(j in HOTD[t + k] for k in range(1, 21)), 'moneyNext': lambda j, t: any(j in MOND[t + k] for k in range(1, 21)),
       'bloomNext': lambda j, t: any(j in FLOWER[t + k] for k in range(1, 21))}
G3 = ('hotNext', 'moneyNext', 'bloomNext')
def score(PX):
    res = {}
    for g in G3:
        acc = {h: [0, 0] for h in ('all', 'first', 'second')}
        for t in range(T0, T1 + 1):
            pk = PX[t][g]; hits = sum(OUT[g](j, t) for j in pk)
            for h in ('all', half(t)): acc[h][0] += len(pk); acc[h][1] += hits
        res[g] = {h: {'picks': v[0], 'hits': v[1], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None} for h, v in acc.items()}
    return res
BASE = score(PB)
print('지금 셈', json.dumps({g: {h: BASE[g][h]['per100'] for h in BASE[g]} for g in G3}, ensure_ascii=False)); sys.stdout.flush()
WILT = {t: set(np.where(ST[t]['ok'] & ((ST[t]['r20'] - ST[t]['m20']) <= -0.15))[0].tolist()) for t in ST}   # 꽃의 거울 — 한 달 안에 시장보다 15 넘게 뒤처짐
def wilt(j, t): return any(j in WILT[t + k] for k in range(1, 21))
INPICK = {}
for k in NEW + ['lot', 'attn']:
    INPICK[k] = {}
    for g in G3:
        acc = {x + h: [0, 0] for x in ('on', 'off') for h in ('', '1', '2')}
        for t in range(T0, T1 + 1):
            C = {**CT[t], **VT[t]}; hh = '1' if t < MID else '2'
            for j in PB[t][g]:
                x = 'on' if C[k][j] else 'off'; o = OUT[g](j, t)
                for key_ in (x, x + hh): acc[key_][0] += 1; acc[key_][1] += o
        INPICK[k][g] = {x: {'picks': v[0], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None} for x, v in acc.items()}
        if g == 'bloomNext':   # 꽃이 될 듯은 거울(시든 꽃)도 — 크게 움직이는 칸이라 위로도 아래로도 잘 넘는지
            dw = {x + h: [0, 0] for x in ('on', 'off') for h in ('', '1', '2')}
            for t in range(T0, T1 + 1):
                C = {**CT[t], **VT[t]}; hh = '1' if t < MID else '2'
                for j in PB[t][g]:
                    x = 'on' if C[k][j] else 'off'; o = wilt(j, t)
                    for key_ in (x, x + hh): dw[key_][0] += 1; dw[key_][1] += o
            INPICK[k]['bloomNextDown'] = {x: {'picks': v[0], 'per100': round(100 * v[1] / v[0], 1) if v[0] else None} for x, v in dw.items()}
    print('지금 셈 안 —', NAME[k], json.dumps({g: [(INPICK[k][g][x]['per100'], INPICK[k][g][x]['picks']) for x in ('on', 'off', 'on1', 'off1', 'on2', 'off2')] for g in list(G3) + ['bloomNextDown']}, ensure_ascii=False)); sys.stdout.flush()
# 앞으로 한 달만(뒤 창 겹침 없이) — 고른 날 값에서 20거래일 뒤 값까지 시장보다 얼마나(꽃 잣대는 지난 스무 날 창이라 고르기 직전 오름이 창에 남아 덤을 받음)
FWD = {}
for k in NEW + ['lot', 'attn']:
    FWD[k] = {}
    for g in G3:
        acc = {x + h: [] for x in ('on', 'off') for h in ('', '1', '2')}
        for t in range(T0, T1 + 1):
            C = {**CT[t], **VT[t]}; hh = '1' if t < MID else '2'
            with np.errstate(all='ignore'):
                F = P[:, t + 20] / P[:, t] - 1
            va = ST[t]['ok'] & np.isfinite(F); m = F[va].mean()
            for j in PB[t][g]:
                if not np.isfinite(F[j]): continue
                x = 'on' if C[k][j] else 'off'
                for key_ in (x, x + hh): acc[key_].append(F[j] - m)
        FWD[k][g] = {x: {'picks': len(v), 'ex100': round(100 * float(np.mean(v)), 2) if v else None, 'beat100': round(100 * float(np.mean(np.array(v) > 0)), 1) if v else None} for x, v in acc.items()}
    print('앞 한 달만 —', NAME[k], json.dumps({g: [(FWD[k][g][x]['ex100'], FWD[k][g][x]['beat100']) for x in ('on', 'off', 'on1', 'off1', 'on2', 'off2')] for g in G3}, ensure_ascii=False)); sys.stdout.flush()
# 꽃 잣대 견줌 — 지금 잣대(그 뒤 한 달 안에 「지난 스무 날 시장보다 15 넘게」인 날이 있음 · 고르기 앞 오름이 창에 남음) 대 고른 날부터만(고른 날 값에서 한 달 안에 시장보다 15 넘게 앞선 날이 있음)
_EX = {}
def ex_from(t):
    if t not in _EX:
        ok = ST[t]['ok']; rows = []
        for k in range(1, 21):
            with np.errstate(all='ignore'):
                F = P[:, t + k] / P[:, t] - 1
            va = ok & np.isfinite(F); rows.append(np.where(va, F - F[va].mean(), np.nan))
        _EX[t] = np.array(rows)
    return _EX[t]
def fwd_flower(j, t):
    x = ex_from(t)[:, j]
    return bool(np.nanmax(x) >= 0.15) if np.isfinite(x).any() else False
YARD = {}
for name, sel in (('picks', lambda t: PB[t]['bloomNext']), ('sprouts', lambda t: np.where(sprout(ST[t]))[0].tolist() if (t - T0) % 5 == 0 else [])):
    acc = {h: [0, 0, 0] for h in ('all', 'first', 'second')}
    for t in range(T0, T1 + 1):
        for j in sel(t):
            a_, b_ = OUT['bloomNext'](j, t), fwd_flower(j, t)
            for h in ('all', half(t)): acc[h][0] += 1; acc[h][1] += a_; acc[h][2] += b_
    YARD[name] = {h: {'n': v[0], 'now100': round(100 * v[1] / v[0], 1), 'fromPick100': round(100 * v[2] / v[0], 1)} for h, v in acc.items()}
    print('꽃 잣대 —', name, YARD[name]); sys.stdout.flush()
# 스무 날 덩이를 바꿔 뽑아 다시 셈(2,000번) — 꽃이 될 듯 안에서 켜진 칸 − 꺼진 칸 맞음 차이가 덩이를 바꿔도 남는지(같은 회사가 며칠씩 이어 뽑히는 것을 덩이로 묶음)
BOOT = {}
rngb = np.random.default_rng(20261110)
blocks = sorted(set((t - T0) // 20 for t in range(T0, T1 + 1)))
for k in NEW + ['lot', 'attn']:
    per_b = {bb: np.zeros(8) for bb in blocks}   # 켜짐 꽃 · 켜짐 수 · 꺼짐 꽃 · 꺼짐 수 · 켜짐 시듦 · (켜짐 수) · 꺼짐 시듦 · (꺼짐 수)
    for t in range(T0, T1 + 1):
        C = {**CT[t], **VT[t]}; bb = (t - T0) // 20
        for j in PB[t]['bloomNext']:
            on = bool(C[k][j]); up = OUT['bloomNext'](j, t); dn = wilt(j, t)
            if on: per_b[bb][[0, 1, 4, 5]] += [up, 1, dn, 1]
            else: per_b[bb][[2, 3, 6, 7]] += [up, 1, dn, 1]
    M = np.array([per_b[bb] for bb in blocks])
    du, dd = [], []
    for _ in range(2000):
        z = M[rngb.integers(0, len(blocks), size=len(blocks))].sum(0)
        if z[1] and z[3]: du.append(z[0] / z[1] - z[2] / z[3]); dd.append(z[4] / z[5] - z[6] / z[7])
    du, dd = np.array(du), np.array(dd)
    BOOT[k] = {'n': int(len(du)), 'upMoreN': int((du > 0).sum()), 'downLessN': int((dd < 0).sum()), 'upDiffMore100': round(100 * float((du > 0).mean()), 1), 'upDiff90': [round(100 * float(np.percentile(du, 5)), 1), round(100 * float(np.percentile(du, 95)), 1)],
               'downDiffLess100': round(100 * float((dd < 0).mean()), 1), 'downDiff90': [round(100 * float(np.percentile(dd, 5)), 1), round(100 * float(np.percentile(dd, 95)), 1)], 'blocks': len(blocks)}
    print('덩이 다시 셈 —', NAME[k], BOOT[k]); sys.stdout.flush()
def with_(base, add, keys):
    return {k: list(dict.fromkeys(base.get(k, []) + (add if k in keys else []))) for k in set(base) | set(keys)}
TRY = {}
for k in NEW:
    TRY[k + ':빼기'] = {**CFG0, 'NEG': with_(CFG0['NEG'], [k], ('hotNext', 'bloomNext')), 'NEGM': [k]}
    TRY[k + ':세우기'] = {**CFG0, 'POS': with_(CFG0['POS'], [k], ('hotNext', 'bloomNext')), 'POSM': [k]}
RES = {}
for name, cfg in TRY.items():
    PX = {t: pick(t, cfg) for t in range(T0, T1 + 1)}
    assert all(PX[t]['hot'] == PB[t]['hot'] and PX[t]['money'] == PB[t]['money'] for t in (T0, MID, T1)), '지금 일곱 · 불장 · 돈은 그대로여야 함'
    sc = score(PX)
    chg = {g: round(100 * float(np.mean([len(set(PX[t][g]) - set(PB[t][g])) / max(1, len(PB[t][g])) for t in range(T0, T1 + 1)])), 1) for g in G3}
    RES[name] = {g: {h: sc[g][h]['per100'] for h in sc[g]} for g in G3} | {'changed100': chg}
    d_ = {g: {h: round(sc[g][h]['per100'] - BASE[g][h]['per100'], 1) for h in ('all', 'first', 'second')} for g in G3}
    RES[name]['delta'] = d_
    print(name, json.dumps(d_, ensure_ascii=False), '· 바뀐 칸(100칸에)', chg); sys.stdout.flush()

def verdict(dl):
    a, f, s_ = dl['all'], dl['first'], dl['second']
    if f > 0 and s_ > 0 and a >= 1: return '두 반년 모두 늘어남'
    if f < 0 and s_ < 0 and a <= -1: return '두 반년 모두 줄어듦'
    return '섞임'
for name in RES: RES[name]['verdict'] = {g: verdict(RES[name]['delta'][g]) for g in G3}

fmt = lambda x: x[:4] + '-' + x[4:6] + '-' + x[6:]
out = {'schema': 'su-volume-past-1', 'order': '0033', 'rule': CU.RULE_ID, 'from': fmt(DAYS[T0]), 'mid': fmt(DAYS[MID]), 'to': fmt(DAYS[T1]), 'lastData': fmt(DAYS[-1]),
       'days': T1 - T0 + 1, 'within': 20, 'universe': '지금 우량주 365곳(지난 1년도 같은 365곳 · 살아남은 곳만 보는 치우침이 있음)',
       'src': BUN + ' · public/data/atlas11/view/board.json · 날마다 셈 = su_culture_past.py --cache',
       'traits': {k: NAME[k] for k in NEW},
       'how': {'dtr': '닷새 평균 회전율(거래량 ÷ 상장 주식 수)이 그날 365곳 가운데 위 열에 하나',
               'dtrR': 'dtr 이고 닷새 장중 출렁임(고가 − 저가) 합 ÷ 하루 오르내림 합이 위 30',
               'small': '몸집 아래 열에 하나 · 스무 날 평균 회전율이 가운데값 넘음',
               'follow': '닷새 안에 거래량이 그 앞 60거래일 가운데값의 5배 넘은 날 · 그날 업종 평균보다 3 넘게 오름',
               'newb': '닷새 안에 하루 5 넘게 오른 날이 거래량 3배 넘는 날과 겹침(나이 · 처음 온 때는 못 봄)'},
       'thresholds': '미리 정한 값 — 지난 1년에 맞춰 고르지 않음', 'shares': '상장 주식 수 = 모음 날 시가총액 ÷ 그날 종가(어림 · 그 사이 주식 수 바뀜은 못 봄)',
       'count': COUNT, 'overlap': OVL, 'next': NEXT, 'beatAll100': {h: round(100 * float(np.mean(v)), 1) for h, v in beat_all.items()}, 'inPick': INPICK, 'boot': BOOT, 'fwd': FWD, 'yard': YARD,
       'yardHow': '꽃이 될 듯 맞음 잣대 둘 — now100 = 지금 잣대(그 뒤 한 달 안에 지난 스무 날 시장보다 15 넘게인 날이 있음 · 고르기 앞 오름이 창에 남아 덤) · fromPick100 = 고른 날 값에서 한 달 안에 시장보다 15 넘게 앞선 날이 있음 · picks = 지금 셈이 고른 일곱 · sprouts = 닷새마다 아무 싹 모두',
       'fwdHow': '지금 셈이 고른 될 듯 칸 — 고른 날 값에서 20거래일 뒤 값까지 시장(365곳 평균)보다 얼마나(100원에) · beat100 = 시장보다 앞선 칸 몫 · 꽃 잣대(지난 스무 날 창)와 달리 고르기 앞 오름이 섞이지 않음',
       'bootHow': '꽃이 될 듯 안 — 스무 날 덩이를 바꿔 뽑아 2,000번 다시 셈 · upDiffMore100 = 켜진 칸이 꽃이 더 많이 된 번수(100번에) · downDiffLess100 = 켜진 칸이 덜 시든 번수 · 90 = 가운데 90 사이(100칸에)',
       'inPickHow': '지금 셈이 고른 될 듯 칸을 흔적이 켜진 칸(on) · 꺼진 칸(off)으로 나눠 각각 100칸에 몇 칸 맞았나(목록은 바꾸지 않음 · 1 = 앞 반년 · 2 = 뒤 반년)',
       'nextHow': '날마다 흔적이 켜진 회사의 20거래일 뒤 값 변화 평균 − 365곳 평균(100원에 몇 원) → 날 평균 · beat100 = 켜진 회사 가운데 시장보다 앞선 몫 · upDays100 = 켜진 회사 평균이 시장보다 앞선 날의 몫',
       'base': {g: {h: BASE[g][h]['per100'] for h in BASE[g]} for g in G3}, 'try': RES,
       'tryHow': '지금 셈(culture7-v1)에 흔적을 더함 — 빼기 = 불장이 될 듯 · 꽃이 될 듯에서 빼고(일곱이 안 되면 뒤에 붙임) 돈이 몰릴 듯은 대장 고를 때 뺌 · 세우기 = 같은 곳에서 흔적이 있는 회사를 앞에 · 지금 일곱 · 불장 · 돈 목록은 그대로(맞음 잣대가 같게)',
       'what': {'hotNext': '한 달(20거래일) 안에 불장 일곱에 듦', 'moneyNext': '한 달 안에 돈이 몰리는 일곱에 듦', 'bloomNext': '한 달 안에 시장보다 15 넘게 앞섬(꽃)'},
       'live': {'volume': '매일 받는 일봉(atlas11-site.yml → closes_fetch.mjs)에 거래량이 이미 들어옴 — 사이트 만들기(site_build.py)에서 종가만 남김', 'highLow': '매일 받기에는 고가 · 저가가 없음(지난 1년 모음에는 있음)'}}
OUTF = A.out if os.path.isabs(A.out) else os.path.join(R, A.out)
os.makedirs(os.path.dirname(OUTF), exist_ok=True)
json.dump(out, open(OUTF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', out['from'], '~', out['to'], out['days'], OUTF)
