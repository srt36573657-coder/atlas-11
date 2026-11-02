#!/usr/bin/env python3
"""꽃 될 회사 고르는 법 다시 세우기 — docs/design/bloom-evolve-2026-11-02/spec.md v1 그대로(셈 전에 적은 약속)

사장님 2026-11-02 01:08(+04) 「그라고 진화를 과감 해 / 어떤 기준이냐면 너 클로드가 할수 있는 최대 진화를 해」 ·
03:15(+04) 「응」(물음 「첫 큰 진화로 지난 기록을 모조리 뒤져 「꽃 될 회사」 고르는 법을 다시 세울까요?」).

쓰는 법:
  python3 scripts/atlas11/research/bloom_evolve.py --list [후보 json]       낱 조건 156 · 짝 수만(결과 셈 없음 — 셈 전에 적음)
  python3 scripts/atlas11/research/bloom_evolve.py [자료 폴더] [결과 json]  셈(달마다 걸어가며 고르기 · 맞대기 · 운 걸러내기 · 넣는 잣대)
  python3 scripts/atlas11/research/bloom_evolve.py --atoms-fixture [자료 폴더] [맞대기 json]  낱 조건 156 셈까지만 · 수와 지문(site/next/bloom-atoms.js 시험용)
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다.
앞 판 바탕 셈(자료 · 시장 지수 · 싹 · 꽃 · 낱 조건 134 · F 이름 공간)은 scripts/atlas11/research/sprout365.py 의 앞부분을 그대로 돌려 씀(같은 숫자).
"""
import json
import os
import sys
import time
import warnings

import numpy as np

warnings.filterwarnings('ignore')
np.seterr(all='ignore')
T_START = time.time()
HERE = os.path.dirname(os.path.abspath(__file__))
LIST = '--list' in sys.argv[1:]
FIXTURE = '--atoms-fixture' in sys.argv[1:]
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
SEED = 20261102
REPS_CI, REPS_RC, BLOCK = 2000, 500, 20
SPLIT_B = '2025-04-04'
ELIG = {'n': 300, 'cover': 0.40, 'perDay': 20, 'fallPlus': 2.0}
Z95 = 1.645


def log(*a):
    print(f'[{time.time() - T_START:7.1f}s]', *a, flush=True)


# ── 앞 판 바탕 셈 그대로(sprout365.py 의 「앞 · 뒤 기록」 앞까지) ──
SRC = open(os.path.join(HERE, 'sprout365.py'), encoding='utf8').read()
CUT = SRC.index('# ── 앞 · 뒤 기록 ──')
NS0 = {'__name__': 'sprout365_base', '__file__': os.path.join(HERE, 'sprout365.py')}
_argv = sys.argv
sys.argv = ['sprout365.py'] + (['--list', os.devnull] if LIST else [ARGS[0] if ARGS else 'site/atlas/data'])
try:
    exec(compile(SRC[:CUT], 'sprout365.py', 'exec'), NS0)
except SystemExit:
    pass
finally:
    sys.argv = _argv
A_OLD = NS0['A']
assert len(A_OLD) == 134

# ── 새 낱 조건 22(spec 「새 갈래」) — 셈은 G(이름 공간)를 받아 (N, C) 참거짓 ──
A_NEW = []


def at(i, fam, label, f):
    A_NEW.append({'id': i, 'fam': fam, 'label': label, 'f': f})


at('fin1', 'fin', '매출이 앞 해보다 늘었어요', lambda G: G.REV_OK & (G.REV > G.REVP) & (G.REVP > 0))
at('fin2', 'fin', '매출이 앞 해보다 10% 넘게 늘었어요', lambda G: G.REV_OK & (G.REVP > 0) & (G.REV > 1.10 * G.REVP))
at('fin3', 'fin', '매출이 앞 해보다 20% 넘게 늘었어요', lambda G: G.REV_OK & (G.REVP > 0) & (G.REV > 1.20 * G.REVP))
at('fin4', 'fin', '매출이 앞 해보다 줄었어요', lambda G: G.REV_OK & (G.REV > 0) & (G.REV < G.REVP))
at('fin5', 'fin', '영업이익이 남았어요', lambda G: G.CUR_OK & (G.OP > 0))
at('fin6', 'fin', '영업이익이 모자랐어요', lambda G: G.CUR_OK & (G.OP < 0))
at('fin7', 'fin', '영업이익이 앞 해보다 늘었어요', lambda G: G.REV_OK & (G.OP > G.OPP))
at('fin8', 'fin', '영업이익률이 10% 이상이에요', lambda G: G.CUR_OK & (G.REV > 0) & (G.OP >= 0.1 * G.REV))
at('fin9', 'fin', '순이익이 남았어요', lambda G: G.CUR_OK & (G.NET > 0))
at('fin10', 'fin', '영업이익이 모자람에서 남으로 바뀌었어요', lambda G: G.REV_OK & (G.OPP <= 0) & (G.OP > 0))
at('fin11', 'fin', '자기 돈으로 번 몫(ROE)이 10% 이상이에요', lambda G: G.CUR_OK & (G.ROE >= 10))
at('fin12', 'fin', '빚이 자기 돈보다 적어요', lambda G: G.CUR_OK & (G.DEBT >= 0) & (G.DEBT < 100))
at('trd1', 'trd', '값이 반년 평균 위예요', lambda G: G.P >= G.MA120)
at('trd2', 'trd', '석 달 평균이 한 달 전보다 높아요', lambda G: G.MA60 > G.MA60L)
at('trd3', 'trd', '값이 석 달 가장 높은 값의 90% 이상이에요', lambda G: G.H60 >= 0.90)
at('trd4', 'trd', '한 달 동안 하루 5% 넘게 내린 날이 없어요', lambda G: G.MINR > -0.05)
at('trd5', 'trd', '한 달 흔들림이 2% 아래예요', lambda G: G.VOL20 < 0.02)
at('rk1', 'rk', '같은 업종 안에서 한 달 성적이 위 절반이에요', lambda G: G.RK_UP)
at('rk2', 'rk', '같은 업종 안에서 한 달 성적이 아래 절반이에요', lambda G: G.RK_DN)
at('rk3', 'rk', '업종이 한 달 성적 위 다섯 안에 들어요', lambda G: G.IRANK <= 5)
at('rk4', 'rk', '업종이 한 달 성적 위 열 안에 들어요', lambda G: G.IRANK <= 10)
at('rk5', 'rk', '업종이 한 달 성적 아래 절반이에요', lambda G: G.IRANK_DN)
assert len(A_NEW) == 22
ATOMS = [{'id': a['id'], 'fam': a['fam'], 'label': a['label'], 'f': a['f'], 'old': True} for a in A_OLD] + [dict(a, old=False) for a in A_NEW]
K = len(ATOMS)
assert K == 156
PAIRS = [(i, j) for i in range(K) for j in range(i + 1, K) if ATOMS[i]['fam'] != ATOMS[j]['fam']]
CAND_IDS = [a['id'] for a in ATOMS] + [ATOMS[i]['id'] + '&' + ATOMS[j]['id'] for i, j in PAIRS]
NCAND = len(CAND_IDS)

if LIST:
    out = ARGS[0] if ARGS else None
    fams = {}
    for a in ATOMS:
        fams[a['fam']] = fams.get(a['fam'], 0) + 1
    txt = json.dumps({'schema': 'dori-bloom-evolve-candidates-1', 'spec': 'docs/design/bloom-evolve-2026-11-02/spec.md v1',
                      'atoms': [{k: a[k] for k in ('id', 'fam', 'label')} for a in ATOMS], 'families': fams,
                      'pairs': len(PAIRS), 'candidates': NCAND,
                      'pairRule': '낱 조건 둘 · 갈래(fam)가 다름 · 차례 = atoms 차례(i < j) · 이름 a&b'}, ensure_ascii=False, indent=1)
    if out:
        open(out, 'w', encoding='utf8').write(txt + '\n')
    print(K, 'atoms ·', len(PAIRS), 'pairs ·', NCAND, 'candidates')
    sys.exit(0)

OUT = ARGS[1] if len(ARGS) > 1 else None
ROOT = NS0['ROOT']
D, N, C, codes = NS0['D'], NS0['N'], NS0['C'], NS0['codes']
P, R, F = NS0['P'], NS0['R'], NS0['F']
COUNT, SPROUT, FLOWER, FALL, EXC, BASEM = (NS0[k] for k in ('COUNT', 'SPROUT', 'FLOWER', 'FALL', 'EXC', 'BASEM'))
T0 = NS0['T0']
TL = N - 21
roll, roll_mean, roll_std, lag = NS0['roll'], NS0['roll_mean'], NS0['roll_std'], NS0['lag']
ind_of, inds, X = NS0['ind_of'], NS0['inds'], NS0['X']
mkt = NS0['mkt']
log('바탕 셈', N, '날 ·', C, '회사 ·', len(inds), '업종')


class NSx:
    pass


G = NSx()
G.P = P
G.MA120 = roll_mean(P, 120)
G.MA60 = F.MA60
G.MA60L = lag(F.MA60, 20)
G.H60 = P / roll(P, 60, np.max)
G.MINR = roll(R, 20, np.min)
G.VOL20 = roll_std(R, 20)
# 실적(그날 알 수 있던 가장 늦은 결산 해) — 결산 달 끝 + 90일이 지난 첫 거래일부터
import datetime as _dt
dnum = np.array([_dt.date.fromisoformat(d).toordinal() for d in D])
FY_IDX = np.full((N, C), -1, np.int32)
FIN = {k: np.full((C, 4), np.nan) for k in ('rev', 'op', 'net', 'roe', 'debt')}
for j, c in enumerate(codes):
    d = json.load(open(f'{ROOT}/co/{c}.json', encoding='utf8'))
    fin = d.get('fin') or {}
    ys = fin.get('years') or []
    for k in FIN:
        arr = fin.get(k) or []
        for q in range(min(len(ys), 4)):
            v = arr[q] if q < len(arr) else None
            FIN[k][j, q] = float(v) if isinstance(v, (int, float)) else np.nan
    for q, y in enumerate(ys[:4]):
        try:
            yy, mm = int(y[:4]), int(y[5:7])
        except (ValueError, TypeError):
            continue
        end = (_dt.date(yy + (mm == 12), mm % 12 + 1, 1) - _dt.timedelta(days=1)).toordinal()
        t1 = int(np.searchsorted(dnum, end + 90))  # 끝 + 90일이 지난 첫 거래일(그날 포함)
        if t1 < N:
            FY_IDX[t1:, j] = q  # 뒤 결산 해가 앞을 덮음(years 는 오름 차례)
cidx = np.arange(C)[None, :]
qi = FY_IDX
has = qi >= 0
qp = qi - 1
hasp = qp >= 0
take = lambda k, q: np.where(q >= 0, FIN[k][cidx, np.maximum(q, 0)], np.nan)
G.REV, G.OP, G.NET, G.ROE, G.DEBT = (take(k, qi) for k in ('rev', 'op', 'net', 'roe', 'debt'))
G.REVP, G.OPP = take('rev', qp), take('op', qp)
G.CUR_OK = has
G.REV_OK = has & hasp
# 같은 업종 안 차례(rk1 · rk2) · 업종끼리 차례(rk3 ~ rk5)
G.RK_UP = np.zeros((N, C), bool)
G.RK_DN = np.zeros((N, C), bool)
IXd = {}
for g in inds:
    cols = np.where(ind_of == g)[0]
    xs = np.where(COUNT[:, cols], X[:, cols], np.nan)
    med = np.nanmedian(xs, axis=1)[:, None]
    okm = ~np.isnan(med)
    G.RK_UP[:, cols] = okm & COUNT[:, cols] & (X[:, cols] >= med)
    G.RK_DN[:, cols] = okm & COUNT[:, cols] & (X[:, cols] < med)
    IXd[g] = F.IX[:, cols[0]]
gnames = sorted(IXd)
IXm = np.stack([IXd[g] for g in gnames], axis=1)  # (N, 업종)
IRANK_g = np.full(IXm.shape, 10 ** 6, np.int32)
IHALF_g = np.zeros(IXm.shape, bool)
for t in range(N):
    v = IXm[t]
    okv = ~np.isnan(v)
    if not okv.any():
        continue
    order = sorted([k for k in range(len(gnames)) if okv[k]], key=lambda k: (-v[k], gnames[k]))
    for r, k in enumerate(order, 1):
        IRANK_g[t, k] = r
    nv = len(order)
    for r, k in enumerate(order, 1):
        IHALF_g[t, k] = r > nv / 2
G.IRANK = np.full((N, C), 10 ** 6, np.int32)
G.IRANK_DN = np.zeros((N, C), bool)
gpos = {g: k for k, g in enumerate(gnames)}
for g in inds:
    cols = np.where(ind_of == g)[0]
    G.IRANK[:, cols] = IRANK_g[:, gpos[g]][:, None]
    G.IRANK_DN[:, cols] = IHALF_g[:, gpos[g]][:, None]
log('새 낱 조건 바탕')

# ── 낱 조건 156 (N, C) → 싹 바탕(U = SPROUT & BASEM) 위 벡터 ──
U = SPROUT & BASEM
tU, cU = np.nonzero(U)
nU = len(tU)
FLU, FAU, EXU = FLOWER[U], FALL[U], EXC[U].astype(np.float64)
ATOM_FULL = []  # 오늘 · 회사 지난 기록 셈에 씀(N, C) 참거짓 — SPROUT & COUNT 위
ATOM_U = np.zeros((K, nU), bool)
for k, a in enumerate(ATOMS):
    m = np.asarray(np.broadcast_to(a['f'](F if a['old'] else G), (N, C)), bool)
    ATOM_FULL.append(m)
    ATOM_U[k] = m[U]
log('낱 조건', K, '· 싹 바탕', nU)

if FIXTURE:  # 낱 조건 156 맞대기 자료(site/next/bloom-atoms.js 시험) — 여기서 멈춤 · 다른 셈은 안 함
    _HR = 'sum over cells t>=T0 of ((t+1)*2654435761 + int(code,36)) mod 2^32, then mod 2^32'
    _cv = np.array([int(c, 36) for c in codes], dtype=np.int64)
    _cell = ((np.arange(N, dtype=np.int64)[:, None] + 1) * 2654435761 + _cv[None, :]) % (1 << 32)

    def _ch(m):
        mm = np.asarray(m, bool)[T0:]
        return {'count': int(mm.sum()), 'hash': int(_cell[T0:][mm].sum()) % (1 << 32)}

    fx = {'schema': 'dori-bloom-atoms-fixture-1', 'asOf': D[-1], 'N': N, 'C': C, 'T0': T0, 'hashRule': _HR,
          'base': {k: _ch(NS0[k]) for k in ('COUNT', 'SPROUT', 'BASEM', 'FLOWER')},
          'atoms': [dict({'id': a['id']}, **_ch(SPROUT & ATOM_FULL[k])) for k, a in enumerate(ATOMS)]}
    if OUT:
        os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
        open(OUT, 'w', encoding='utf8').write(json.dumps(fx, ensure_ascii=False, indent=1) + '\n')
    log('맞대기 자료', len(fx['atoms']), '낱 조건 ·', OUT)
    sys.exit(0)


def perday(mvec):
    tt = tU[mvec]
    n = np.bincount(tt, minlength=N).astype(np.float32)
    h = np.bincount(tU[mvec & FLU], minlength=N).astype(np.float32)
    f = np.bincount(tU[mvec & FAU], minlength=N).astype(np.float32)
    e = np.bincount(tt, weights=EXU[mvec], minlength=N).astype(np.float32)
    return n, h, f, e


NC = np.zeros((NCAND, N), np.float32)
HC = np.zeros((NCAND, N), np.float32)
FC = np.zeros((NCAND, N), np.float32)
EC = np.zeros((NCAND, N), np.float32)
for k in range(K):
    NC[k], HC[k], FC[k], EC[k] = perday(ATOM_U[k])
for q, (i, j) in enumerate(PAIRS, K):
    NC[q], HC[q], FC[q], EC[q] = perday(ATOM_U[i] & ATOM_U[j])
    if q % 2000 == 0:
        log('짝', q - K, '/', len(PAIRS))
log('후보', NCAND, '날마다 셈 끝')
bm = BASEM
nb_d = bm.sum(axis=1).astype(np.float64)
hb_d = (bm & FLOWER).sum(axis=1).astype(np.float64)
fb_d = (bm & FALL).sum(axis=1).astype(np.float64)
eb_d = np.where(bm, EXC, 0.0).sum(axis=1)
ns_d, hs_d, fs_d, es_d = (v.astype(np.float64) for v in perday(np.ones(nU, bool)))  # 그냥 싹

# 누적(날 차례) — 걸음마다 배우는 날 합을 빼기로
cum = lambda a: np.concatenate([np.zeros(a.shape[:-1] + (1,), np.float64), np.cumsum(a, axis=-1, dtype=np.float64)], axis=-1)
CN, CH, CF = cum(NC), cum(HC), cum(FC)
CPD = cum((NC > 0).astype(np.float32))
Cnb, Chb, Cfb = cum(nb_d), cum(hb_d), cum(fb_d)
IDN = {cid: q for q, cid in enumerate(CAND_IDS)}
log('누적 끝')


def window_stats(e):
    """배우는 날 T0 ~ e(포함) · 모든 후보 — n · 꽃 · 떨어짐 · 고른 날 · 점수 LB · d · se"""
    a, b = T0, e + 1
    n = CN[:, b] - CN[:, a]
    h = CH[:, b] - CH[:, a]
    f = CF[:, b] - CF[:, a]
    pdays = CPD[:, b] - CPD[:, a]
    nbT, hbT, fbT = Cnb[b] - Cnb[a], Chb[b] - Chb[a], Cfb[b] - Cfb[a]
    p = np.where(n > 0, h / np.maximum(n, 1), 0.0)
    qv = hbT / max(nbT, 1)
    edges = list(range(a, b, BLOCK)) + [b]
    se2 = np.zeros(NCAND)
    for s0, s1 in zip(edges[:-1], edges[1:]):
        nB, hB = CN[:, s1] - CN[:, s0], CH[:, s1] - CH[:, s0]
        nbB, hbB = Cnb[s1] - Cnb[s0], Chb[s1] - Chb[s0]
        eB = (hB - p * nB) / np.maximum(n, 1) - (hbB - qv * nbB) / max(nbT, 1)
        se2 += eB * eB
    d = (p - qv) * 100
    se = np.sqrt(se2) * 100
    lb = d - Z95 * se
    L = b - a
    fall, fallb = np.where(n > 0, f / np.maximum(n, 1) * 100, 0.0), fbT / max(nbT, 1) * 100
    elig = (n >= ELIG['n']) & (pdays >= ELIG['cover'] * L) & (n <= ELIG['perDay'] * np.maximum(pdays, 1)) & (fall <= fallb + ELIG['fallPlus'])
    return {'n': n, 'h': h, 'p': p * 100, 'q': qv * 100, 'd': d, 'se': se, 'lb': lb, 'pdays': pdays, 'L': L, 'fall': fall, 'fallb': fallb, 'elig': elig}


def choose(ws):
    """들 수 있는 후보 가운데 LB 가장 큰 것 · 같으면 n 큰 것 · 그다음 이름 차례가 빠른 것"""
    idx = np.nonzero(ws['elig'])[0]
    if not len(idx):
        return None
    top = idx[ws['lb'][idx] == ws['lb'][idx].max()]
    top = top[ws['n'][top] == ws['n'][top].max()]
    return int(min(top, key=lambda q: CAND_IDS[q]))


# ── 걸어가며 고르기 ──
months = []
for t in range(len(D)):
    if t == 0 or D[t][:7] != D[t - 1][:7]:
        months.append(t)
steps, oos_days = [], []
OOS_N, OOS_H, OOS_F, OOS_E = (np.zeros(N, np.float64) for _ in range(4))
SEL_AT = np.full(N, -1, np.int64)
for k, s in enumerate(months):
    e = s - 20
    if e - T0 + 1 < 250 or s > TL:
        continue
    end = (months[k + 1] - 1 if k + 1 < len(months) else N - 1)
    end = min(end, TL)
    ws = window_stats(e)
    q = choose(ws)
    rec = {'month': D[s][:7], 's': D[s], 'trainDays': int(e - T0 + 1), 'elig': int(ws['elig'].sum())}
    if q is not None:
        rec.update({'id': CAND_IDS[q], 'lb': round(float(ws['lb'][q]), 3), 'd': round(float(ws['d'][q]), 3), 'n': int(ws['n'][q])})
        sl = slice(s, end + 1)
        OOS_N[sl], OOS_H[sl], OOS_F[sl], OOS_E[sl] = NC[q, sl], HC[q, sl], FC[q, sl], EC[q, sl]
        SEL_AT[sl] = q
    for t in range(s, end + 1):
        oos_days.append(t)
    steps.append(rec)
    log('걸음', rec['month'], rec.get('id'), rec.get('lb'))
oos_days = np.array(oos_days)
tB = next(t for t in range(N) if D[t] >= SPLIT_B)
daysB = oos_days[oos_days >= tB]


def summ(ds, n, h, f, e):
    nT, hT = float(n[ds].sum()), float(h[ds].sum())
    nbT, hbT = float(nb_d[ds].sum()), float(hb_d[ds].sum())
    return {'n': int(nT), 'hits': int(hT), 'rate': round(hT / max(nT, 1) * 100, 2), 'base': round(hbT / max(nbT, 1) * 100, 2), 'baseN': int(nbT), 'baseHits': int(hbT),
            'ex': round(float(e[ds].sum()) / max(nT, 1) * 100, 2), 'exBase': round(float(eb_d[ds].sum()) / max(nbT, 1) * 100, 2),
            'fall': round(float(f[ds].sum()) / max(nT, 1) * 100, 2), 'fallBase': round(float(fb_d[ds].sum()) / max(nbT, 1) * 100, 2),
            'pickDays': int(np.sum(n[ds] > 0)), 'days': int(len(ds)), 'pickDayShare': round(float(np.mean(n[ds] > 0)) * 100, 2) if len(ds) else 0.0,
            'perPickDay': round(nT / max(int(np.sum(n[ds] > 0)), 1), 2), 'from': D[int(ds[0])] if len(ds) else None, 'to': D[int(ds[-1])] if len(ds) else None}


qCur, qC3 = IDN.get('iz1&hi1', IDN.get('hi1&iz1')), IDN['iz1']  # 지금 조건(업종 꽃 자리 + 반년 가장 높은 값 가까이) — 짝 이름은 낱 조건 차례(hi 갈래가 iz 앞)
ser = {'method': (OOS_N, OOS_H, OOS_F, OOS_E), 'current': (NC[qCur], HC[qCur], FC[qCur], EC[qCur]), 'c3': (NC[qC3], HC[qC3], FC[qC3], EC[qC3]),
       'sprout': (ns_d, hs_d, fs_d, es_d)}
cmpA = {k: summ(oos_days, *v) for k, v in ser.items()}
cmpB = {k: summ(daysB, *v) for k, v in ser.items()}
monthsRec = []  # 달마다 안 본 기록(고른 조건 · 고른 수 · 꽃 · 고른 날 몫) — 쪽 그림 · 따로 센 일꾼 맞대기
for rec in steps:
    ds = np.array([t for t in oos_days if D[t][:7] == rec['month']])
    if len(ds):
        mm = summ(ds, OOS_N, OOS_H, OOS_F, OOS_E)
        monthsRec.append({'month': rec['month'], 'id': rec.get('id'), 'n': mm['n'], 'hits': mm['hits'], 'base': mm['base'], 'pickDays': mm['pickDays'], 'days': mm['days']})
years = {}
for yv in sorted({D[t][:4] for t in oos_days}):
    ds = np.array([t for t in oos_days if D[t][:4] == yv])
    years[yv] = {k: summ(ds, *v) for k, v in ser.items() if k in ('method', 'current')}
log('맞대기 끝')


# ── 흔들림 폭(기간 B · 20날 덩어리 다시 뽑기) ──
def boot_idx(L, reps, rng):
    nblk = int(np.ceil(L / BLOCK))
    starts = rng.integers(0, max(L - BLOCK + 1, 1), size=(reps, nblk))
    return (starts[:, :, None] + np.arange(BLOCK)[None, None, :]).reshape(reps, -1)[:, :L]


rng = np.random.default_rng(SEED)
ib = boot_idx(len(daysB), REPS_CI, rng)
def rate_b(n, h):
    nn, hh = n[daysB][ib].sum(1), h[daysB][ib].sum(1)
    return hh / np.maximum(nn, 1) * 100
rM, rCur, rB = rate_b(OOS_N, OOS_H), rate_b(NC[qCur].astype(np.float64), HC[qCur].astype(np.float64)), rate_b(nb_d, hb_d)
ci = lambda v: [round(float(np.percentile(v, 2.5)), 2), round(float(np.percentile(v, 97.5)), 2)]
CI = {'methodMinusBase': ci(rM - rB), 'methodMinusCurrent': ci(rM - rCur), 'currentMinusBase': ci(rCur - rB)}
log('흔들림 폭', CI)

# ── 마지막 고르기 · 운 걸러내기 ──
wsF = window_stats(TL)
qF = choose(wsF)
E = np.nonzero(wsF['elig'])[0]
final = None
rc = None
if qF is not None:
    final = {'id': CAND_IDS[qF], 'n': int(wsF['n'][qF]), 'rate': round(float(wsF['p'][qF]), 2), 'base': round(float(wsF['q']), 2),
             'd': round(float(wsF['d'][qF]), 3), 'se': round(float(wsF['se'][qF]), 3), 'lb': round(float(wsF['lb'][qF]), 3),
             'pickDayShare': round(float(wsF['pdays'][qF] / wsF['L'] * 100), 2), 'fall': round(float(wsF['fall'][qF]), 2), 'fallBase': round(float(wsF['fallb']), 2)}
    parts = final['id'].split('&')
    final['parts'] = [{'id': p, 'label': next(a['label'] for a in ATOMS if a['id'] == p), 'fam': next(a['fam'] for a in ATOMS if a['id'] == p)} for p in parts]
    a, b = T0, TL + 1
    L = b - a
    rng2 = np.random.default_rng(SEED + 1)
    ibr = boot_idx(L, REPS_RC, rng2)
    W = np.zeros((REPS_RC, L), np.float32)
    for r in range(REPS_RC):
        np.add.at(W[r], ibr[r], 1.0)
    nE, hE = NC[E][:, a:b], HC[E][:, a:b]
    nS = W @ nE.T  # (REPS, |E|)
    hS = W @ hE.T
    nbS = W @ nb_d[a:b].astype(np.float32)
    hbS = W @ hb_d[a:b].astype(np.float32)
    dS = (hS / np.maximum(nS, 1) - (hbS / np.maximum(nbS, 1))[:, None]) * 100
    tS = (dS - wsF['d'][E][None, :]) / np.maximum(wsF['se'][E][None, :], 1e-9)
    V = tS.max(axis=1)
    tF = float(wsF['d'][qF] / max(wsF['se'][qF], 1e-9))
    rc = {'eligible': int(len(E)), 'reps': REPS_RC, 't': round(tF, 3), 'p': round(float(np.mean(V >= tF)), 4), 'vMedian': round(float(np.median(V)), 3), 'v95': round(float(np.percentile(V, 95)), 3)}
log('마지막', final and final['id'], '운 걸러내기', rc)

# ── 넣는 잣대 ──
mB, cB, mA = cmpB['method'], cmpB['current'], cmpA['method']
rules = {
    '1_B_beats_current_and_base_lo': bool(mB['rate'] > cB['rate'] and CI['methodMinusBase'][0] > 0),
    '2_A_pickDayShare_ge_60': bool(mA['pickDayShare'] >= 60),
    '3_A_fall_le_base': bool(mA['fall'] <= mA['fallBase']),
    '4_rc_p_lt_005': bool(rc is not None and rc['p'] < 0.05),
}

# ── 오늘(T = 마지막 날) 고른 회사 · 회사마다 지난 기록(마지막 후보로) ──
T = N - 1
today = []
if final:
    ks = [next(k for k, a in enumerate(ATOMS) if a['id'] == p['id']) for p in final['parts']]
    mT = SPROUT[T] & COUNT[T]
    for k in ks:
        mT = mT & ATOM_FULL[k][T]
    full = SPROUT & COUNT
    for k in ks:
        full = full & ATOM_FULL[k]
    for j in np.nonzero(mT)[0]:
        past = full[T0:TL + 1, j] & BASEM[T0:TL + 1, j]
        hit = past & FLOWER[T0:TL + 1, j]
        today.append({'c': codes[j], 'n': mkt[codes[j]].get('n'), 'i': ind_of[j], 'pastDays': int(past.sum()), 'pastHits': int(hit.sum())})

res = {'schema': 'dori-bloom-evolve-research-1', 'spec': 'docs/design/bloom-evolve-2026-11-02/spec.md v1', 'root': ROOT, 'seed': SEED,
       'days': N, 'from': D[0], 'to': D[-1], 'tl': D[TL], 'companies': C, 'industries': len(inds), 'universe': nU,
       'atoms': K, 'pairs': len(PAIRS), 'candidates': NCAND, 'elig': ELIG, 'block': BLOCK, 'repsCI': REPS_CI, 'repsRC': REPS_RC,
       'steps': steps, 'months': monthsRec, 'periodA': cmpA, 'periodB': cmpB, 'years': years, 'ci': CI, 'final': final, 'rc': rc, 'rules': rules,
       'today': {'date': D[T], 'n': len(today), 'rows': today}, 'seconds': round(time.time() - T_START, 1)}
if OUT:
    os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
    open(OUT, 'w', encoding='utf8').write(json.dumps(res, ensure_ascii=False, indent=1) + '\n')
print(json.dumps({k: res[k] for k in ('candidates', 'final', 'rc', 'rules')}, ensure_ascii=False))
print('A', json.dumps(cmpA, ensure_ascii=False))
print('B', json.dumps(cmpB, ensure_ascii=False))
