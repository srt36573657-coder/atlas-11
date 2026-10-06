#!/usr/bin/env python3
"""ATLAS 11 공부 · 20년 기록으로 다시 — 「때」 · 「업종 흐름 + 회사 흐름」 · 나머지 방식(한국 · 미국 · 공부 기록 · 사이트는 바꾸지 않음)
사장님 2026-10-06 13:01 「20년 기록을 봐봐 그리고 미국 도 보고」
  자료: <--data>/<kr|us>.json.gz (collect_20y.mjs · 깃허브 자동 작업으로 받음 · 날짜 · 종가 · 거래량 · 기본은 둘째 판 20y/r2)
  잣대는 3년 반 판(third_way_features.py · third_way_analyze.py)과 같게:
    크게 오름 = 그 날 종가에서 120거래일 안 +50% · 크게 떨어짐 = −33% · 날 거르기 = 앞 140 · 뒤 120일 안에 하루 등락이 한도(한국 31% · 미국 50%)를 넘는 자료 끊김이 있으면 뺌
    배수 = 같은 날 · 같은 출렁임 층(그 날 20일 출렁임 다섯 층 · 나를 뺀) 다른 회사 비율과 견줌
  ① 때(지수만으로 · 살아남은 회사 치우침 없음): 지수가 1년 꼭대기보다 몇 % 아래였나(다섯 칸) → 그 뒤 6달 · 1년 지수 · 큰 하락(−20% 넘게) 덩어리마다
     + 회사 쪽 보조: 그 날 고른 회사 가운데 6달 안 크게 오른 비율 · 크게 오른 회사가 가장 많던 날 열에 하나가 어느 칸에 있었나
  ② 구조: 업종 6달 추세 위 20% · 회사 6달 추세 위 20% · 두 겹 — 해마다 · 다섯 해 묶음마다 배수 · 보통보다 높은 해 · 달
  ③ 나머지 방식(F01~F18, 시장 표시는 지수로): 20년 분석표(--lean 이면 뺌)
  ④ 겹치는 때 맞대기: 3년 반 판과 같은 날들(2023-11-16 ~ 2026-04-07)만 떼어 다시 센 값(앞 판 1.237 · 1.186 과 견줌)
  쓰는 법: python3 scripts/atlas11/study/third_way_20y.py <kr|us> <결과.json> [--universe board|all] [--groups board|naver] [--data 폴더] [--index 지수] [--lean]
"""
import gzip, json, sys
import numpy as np
import pandas as pd
from numpy.lib.stride_tricks import sliding_window_view as swv
import warnings; warnings.filterwarnings('ignore', category=RuntimeWarning)

def arg(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
MK, OUT = sys.argv[1], sys.argv[2]
UNIV, GROUPS, DATA, LEAN = arg('--universe', 'board'), arg('--groups', 'board'), arg('--data', 'reports/atlas11/study/20y/r2'), '--lean' in sys.argv
L, AHEAD, AH3, YEAR = 140, 120, 60, 250
JUMP = 0.31 if MK == 'kr' else 0.50
START = 20050101
OVERLAP = (20231116, 20260407)  # 3년 반 판(third-way/result.json · 365곳)이 센 날들
D = json.loads(gzip.open(f'{DATA}/{MK}.json.gz').read())
rng = np.random.default_rng(20261006)

def unpack(p):
    if not p: return None
    t0 = np.datetime64(f"{p['d0'][:4]}-{p['d0'][4:6]}-{p['d0'][6:]}")
    off = np.r_[0, np.cumsum(np.array(p['dd'], dtype=np.int64))]
    d = np.char.replace(np.datetime_as_string(t0 + off.astype('timedelta64[D]'), unit='D'), '-', '').astype(int)
    c = np.array(p['c'], dtype=float); v = np.array([np.nan if x is None else x for x in p['v']], dtype=float)
    return d, c, v
def first_day(k):
    p = D['indices'].get(k); return int(p['d0']) if p else 99999999
if MK == 'kr': IDX_KEY = 'KOSPI'
else: IDX_KEY = '.INX' if first_day('.INX') <= 20040301 else min(['.INX', '.IXIC'], key=first_day)
IDX_KEY = arg('--index', IDX_KEY)

board = set(D['board'])
if GROUPS == 'board':
    groups = [(g['id'], g['codes']) for g in D['groups']]
else:  # 네이버 업종 코드(받은 회사 모두 · 다섯 곳 넘는 업종만)
    by = {}
    for code, p in D['stocks'].items():
        ic = p.get('industryCode')
        if ic is not None and (UNIV == 'all' or code in board): by.setdefault(str(ic), []).append(code)
    groups = [(k, v) for k, v in sorted(by.items()) if len(v) >= 5]
grp_of = {code: gid for gid, codes in groups for code in codes}

series = {}
for code, p in D['stocks'].items():
    if UNIV == 'board' and code not in board: continue
    u = unpack(p)
    if u is None or len(u[0]) < L + 1 + AHEAD or not (u[1] > 0).all(): continue
    series[code] = u
idx_d, idx_c, _ = unpack(D['indices'][IDX_KEY])
all_dates = np.unique(np.concatenate([idx_d] + [s[0] for s in series.values()])); ND = len(all_dates)
pos_of = {code: np.searchsorted(all_dates, s[0]) for code, s in series.items()}

def shift(x, k):
    out = np.full(len(x), np.nan); out[k:] = x[:-k]; return out
def roll_max(x, w):
    out = np.full(len(x), np.nan)
    if len(x) >= w: out[w - 1:] = np.nanmax(swv(x, w), axis=1)
    return out
def roll_min(x, w):
    out = np.full(len(x), np.nan)
    if len(x) >= w: out[w - 1:] = np.nanmin(swv(x, w), axis=1)
    return out

# 지수(시장) — 고른 지수를 모든 날에 맞춤(지수에 없는 날은 앞 값)
IDX = np.full(ND, np.nan); IDX[np.searchsorted(all_dates, idx_d)] = idx_c
IDX = pd.Series(IDX).ffill().values
m_dd250 = IDX / roll_max(IDX, YEAR) - 1; m_dd120 = IDX / roll_max(IDX, 120); m_r20 = IDX / shift(IDX, 20) - 1

# 업종 지수(똑같은 무게 · 그 날 셋 이상일 때 · 하루 한도 넘는 날은 뺌)
def group_index(codes):
    S = np.zeros(ND); C = np.zeros(ND)
    for code in codes:
        if code not in series: continue
        d, c, _ = series[code]; r = c[1:] / c[:-1] - 1; ok = np.abs(r) <= JUMP
        p = pos_of[code][1:][ok]; S[p] += r[ok]; C[p] += 1
    valid = C >= 3; g = np.where(valid, S / np.where(C > 0, C, 1), 0.0)
    out = 100.0 * np.cumprod(1 + g); out[~valid] = np.nan
    return out
G = [gid for gid, _ in groups]; gpos = {g: i for i, g in enumerate(G)}
GI = np.vstack([group_index(codes) for _, codes in groups])
def pct_rank_cols(A, min_n=10):
    out = np.full(A.shape, np.nan)
    for j in range(A.shape[1]):
        col = A[:, j]; ok = ~np.isnan(col)
        if ok.sum() >= min_n: out[ok, j] = pd.Series(col[ok]).rank(pct=True).values
    return out
G_RK120 = pct_rank_cols(GI / np.apply_along_axis(lambda x: shift(x, 120), 1, GI) - 1)
G_RK20 = pct_rank_cols(GI / np.apply_along_axis(lambda x: shift(x, 20), 1, GI) - 1)

parts = []
for code, (d, c, v) in series.items():
    n = len(c); j = pos_of[code]
    ret = np.r_[np.nan, c[1:] / c[:-1] - 1]
    cum = np.cumsum(np.r_[0, (np.abs(c[1:] / c[:-1] - 1) > JUMP).astype(int)])
    T = np.arange(L, n - AHEAD)
    T = T[(cum[T + AHEAD] - cum[T - L] == 0) & (d[T] >= START)]
    if not len(T): continue
    fut = swv(c[1:], AHEAD); fmax, fmin = fut.max(1), fut.min(1); f3 = swv(c[1:], AH3).max(1)
    sd20 = pd.Series(ret).rolling(20).std().values; r120 = c / shift(c, 120) - 1
    gid = grp_of.get(code); gp = gpos.get(gid); jt = j[T]
    col = {'code': code, 'date': d[T], 'group': gid if gid is not None else '', 'sd20': sd20[T], 'r120': r120[T],
           'g_rk120': G_RK120[gp, jt] if gp is not None else np.nan, 'm_dd250': m_dd250[jt],
           'f120': fmax[T] / c[T], 'g120': fmin[T] / c[T], 'f60': f3[T] / c[T]}
    if not LEAN:
        hi120, lo120, lo60, hi250 = roll_max(c, 120), roll_min(c, 120), roll_min(c, 60), roll_max(c, YEAR)
        S_ = pd.Series(c); ma20, ma60, ma120 = S_.rolling(20).mean().values, S_.rolling(60).mean().values, S_.rolling(120).mean().values
        sd120 = pd.Series(ret).rolling(120).std().values
        V = pd.Series(v); v20, v120, v5 = V.rolling(20).mean().values, V.rolling(120).mean().values, V.rolling(5).mean().values
        v115 = shift(V.rolling(115).mean().values, 5)
        below = (c < ma120).astype(float); below[np.isnan(ma120)] = np.nan
        below20 = shift(pd.Series(below).rolling(20).sum().values, 1)
        r20 = c / shift(c, 20) - 1
        f02 = np.full(n, np.nan); T2 = T[T >= YEAR]; T2 = T2[cum[T2] - cum[T2 - YEAR] == 0]; f02[T2] = (c[T2] >= 0.98 * hi250[T2]).astype(float)
        vol_ok = ~(np.isnan(v120) | (v120 <= 0))
        def vf(cond):
            x = cond.astype(float); x[~vol_ok] = np.nan; return x
        b = lambda cond: cond.astype(float)
        col.update({'F01': b(c >= 0.98 * hi120)[T], 'F02': f02[T], 'F03': b(c <= 1.05 * lo120)[T], 'F04': b(c / hi120 <= 0.65)[T],
                    'F07': b((c / lo60 >= 1.2) & (c / hi120 <= 0.85))[T], 'F08': b((c > ma20) & (ma20 > ma60) & (ma60 > ma120))[T],
                    'F09': b((c > ma120) & (below20 >= 15))[T], 'F10': b(sd20 <= 0.6 * sd120)[T],
                    'F11': vf((v115 > 0) & (v5 >= 3 * v115))[T], 'F12': vf((v20 >= 1.5 * v120) & (r20 >= 0.10))[T],
                    'F13': vf(v20 <= 0.5 * v120)[T], 'F14': vf((c >= 0.98 * hi120) & (v20 >= 1.5 * v120))[T],
                    'g_rk20': G_RK20[gp, jt] if gp is not None else np.nan, 'm_r20': m_r20[jt]})
    parts.append(pd.DataFrame(col))
df = pd.concat(parts, ignore_index=True); del parts
df['code'] = df['code'].astype('category'); df['date'] = df['date'].astype(np.int32)
df['up50'] = (df['f120'] >= 1.5).astype(np.int8); df['dn33'] = (df['g120'] <= 1 / 1.5).astype(np.int8); df['up30_3m'] = (df['f60'] >= 1.3).astype(np.int8)
df['year'] = (df['date'] // 10000).astype(np.int16); df['ym'] = (df['date'] // 100).astype(np.int32)
rk = df.groupby('date')['r120'].rank(pct=True)
df['F05'] = np.where(rk.isna(), np.nan, (rk >= 0.8).astype(float)); df['F06'] = np.where(rk.isna(), np.nan, (rk <= 0.2).astype(float))
df['F15'] = np.where(df['g_rk120'].isna(), np.nan, (df['g_rk120'] >= 0.8).astype(float))
gmed = df.groupby(['group', 'date'])['r120'].transform('median')
df['F17'] = np.where(df['F15'].isna(), np.nan, ((df['F15'] == 1) & (df['r120'] < gmed)).astype(float))
if not LEAN:
    df['F16'] = np.where(df['g_rk20'].isna(), np.nan, (df['g_rk20'] >= 0.8).astype(float))
    hi_cnt = df.groupby(['group', 'date'])['F01'].transform('sum')
    df['F18'] = np.where(df['group'] == '', np.nan, (hi_cnt >= 3).astype(float))
df['vq'] = np.floor(df.groupby('date')['sd20'].rank(method='first', pct=True).clip(upper=0.999999) * 5)
for y in ('up50', 'dn33', 'up30_3m'):
    g = df.groupby(['date', 'vq'])[y]; s_, n_ = g.transform('sum'), g.transform('count'); df['cell_' + y] = ((s_ - df[y]) / (n_ - 1)).where(n_ > 1)  # 칸에 나 혼자면 견줄 것이 없음
BLOCKS = [('2005~2008', 2005, 2008), ('2009~2013', 2009, 2013), ('2014~2018', 2014, 2018), ('2019~2022', 2019, 2022), ('2023~2026', 2023, 2026)]
df['blk'] = ''
for lab, a, b_ in BLOCKS: df.loc[(df['year'] >= a) & (df['year'] <= b_), 'blk'] = lab

NAMES = {'F01': '6달 신고가 근처', 'F02': '1년 신고가 근처', 'F03': '6달 바닥 근처', 'F04': '크게 떨어진 뒤', 'F05': '6달 추세 위 20%', 'F06': '6달 추세 아래 20%',
         'F07': '바닥에서 돌아섬', 'F08': '이동평균 정배열', 'F09': '120일선을 막 넘음', 'F10': '출렁임이 줄어듦', 'F11': '거래량 급증', 'F12': '거래량 늘며 오름',
         'F13': '거래가 말라붙음', 'F14': '신고가 + 거래량', 'F15': '업종 6달 추세 위 20%', 'F16': '업종 1달 추세 위 20%', 'F17': '앞선 업종 안 뒤처진 회사', 'F18': '업종 동반 신고가'}

def adj(mask, y='up50'):
    m = mask & df['cell_' + y].notna().values
    a, e = df.loc[m, y].sum(), df.loc[m, 'cell_' + y].sum()
    return (float(a / e) if e > 0 else None), int(m.sum())
def ci(mask, y='up50', B=300):
    sub = df.loc[mask & df['cell_' + y].notna().values, ['code', y, 'cell_' + y]].groupby('code', observed=True).agg(a=(y, 'sum'), e=('cell_' + y, 'sum'))
    if len(sub) < 5: return None
    W = rng.multinomial(len(sub), np.ones(len(sub)) / len(sub), size=B); r = (W @ sub['a'].values) / (W @ sub['e'].values)
    return [float(np.quantile(r, 0.05)), float(np.quantile(r, 0.95))]
def feature_stats(mask):
    out = {}
    a, n = adj(mask); d_, _ = adj(mask, 'dn33'); a3, _ = adj(mask, 'up30_3m')
    out.update({'n': n, 'companies': int(df.loc[mask, 'code'].nunique()), 'p_up': float(df.loc[mask, 'up50'].mean()) if n else None,
                'exp_up': float(df.loc[mask, 'cell_up50'].mean()) if n else None, 'adj_up': a, 'adj_dn': d_, 'adj_up_3m': a3, 'ci90': ci(mask)})
    out['blocks'] = {}
    for lab, _, _ in BLOCKS:
        m = mask & (df['blk'] == lab).values
        aa, nn = adj(m); out['blocks'][lab] = {'n': nn, 'companies': int(df.loc[m, 'code'].nunique()), 'adj_up': aa if nn >= 200 else None, 'adj_dn': adj(m, 'dn33')[0] if nn >= 200 else None}
    sel = df.loc[mask & df['cell_up50'].notna().values, ['year', 'ym', 'up50', 'cell_up50']]
    yy = sel.groupby('year').agg(n=('up50', 'size'), a=('up50', 'sum'), e=('cell_up50', 'sum')); yy = yy[yy['n'] >= 200]
    out['years'] = {'count': int(len(yy)), 'above': int((yy['a'] > yy['e']).sum()), 'by_year': {str(k): float(v) for k, v in (yy['a'] / yy['e']).items()}}
    mm = sel.groupby('ym').agg(n=('up50', 'size'), a=('up50', 'sum'), e=('cell_up50', 'sum')); mm = mm[mm['n'] >= 100]
    out['months'] = {'count': int(len(mm)), 'above': int((mm['a'] > mm['e']).sum())}
    return out

res = {'market': MK, 'universe': UNIV, 'groups_by': GROUPS, 'n_groups': len(groups), 'lean': LEAN, 'data': DATA, 'made': pd.Timestamp.now(tz='Asia/Seoul').isoformat(), 'jump': JUMP, 'index': IDX_KEY,
       'index_first': {k: v['d0'] for k, v in D['indices'].items() if v}, 'rows': int(len(df)), 'companies': int(df['code'].nunique()),
       'dates': [str(df['date'].min()), str(df['date'].max())], 'n_dates': int(df['date'].nunique()),
       'base_up': float(df['up50'].mean()), 'base_dn': float(df['dn33'].mean()),
       'companies_by_block': {lab: int(df.loc[df['blk'] == lab, 'code'].nunique()) for lab, _, _ in BLOCKS},
       'base_by_block': {lab: float(df.loc[df['blk'] == lab, 'up50'].mean()) for lab, _, _ in BLOCKS},
       'stocks_first': {'before2005': int(sum(1 for s in series.values() if s[0][0] < 20050101)), 'all': len(series)}}
F = lambda f: (df[f] == 1).values
TWO = F('F15') & F('F05')
# ② 구조
res['structure'] = {'업종만': feature_stats(F('F15')), '회사만': feature_stats(F('F05')), '업종 + 회사': feature_stats(TWO), '업종 + 회사는 뒤처짐': feature_stats(F('F17'))}
for k, v in res['structure'].items():  # 덮는 비율: 크게 오른 날 가운데 이 표시가 붙어 있던 몫
    m = {'업종만': F('F15'), '회사만': F('F05'), '업종 + 회사': TWO, '업종 + 회사는 뒤처짐': F('F17')}[k]
    v['recall'] = float(df.loc[m, 'up50'].sum() / max(1, df['up50'].sum()))
# ②-2 때 × 구조 — 그 날 지수 자리(1년 꼭대기보다 몇 % 아래)마다 두 겹 · 회사만 · 업종만 · 6달 추세 아래 20% · 크게 떨어진 뒤의 배수(14:1x 결과를 보고 더함 · 해마다 두 겹이 1배 아래로 내려간 해가 2008 · 2009 · 2011 이라서)
DDB = [(-0.05, 9, '1년 꼭대기 근처(5% 안쪽)'), (-0.10, -0.05, '5~10% 아래'), (-0.20, -0.10, '10~20% 아래'), (-0.30, -0.20, '20~30% 아래'), (-9, -0.30, '30% 넘게 아래')]
res['structure_by_dd'] = []
for lo, hi, lab in DDB:
    mb = ((df['m_dd250'] > lo) & (df['m_dd250'] <= hi)).values
    item = {'label': lab, 'rows': int(mb.sum()), 'base_up': float(df.loc[mb, 'up50'].mean()) if mb.any() else None}
    for nm, m in (('업종 + 회사', TWO), ('회사만', F('F05')), ('업종만', F('F15')), ('6달 추세 아래 20%', F('F06')), ('크게 떨어진 뒤', F('F04') if 'F04' in df else None)):
        if m is None: continue
        a, n = adj(mb & m); item[nm] = {'adj_up': a if n >= 200 else None, 'n': n, 'companies': int(df.loc[mb & m, 'code'].nunique())}
    res['structure_by_dd'].append(item)
# ④ 겹치는 때 맞대기
ov = ((df['date'] >= OVERLAP[0]) & (df['date'] <= OVERLAP[1])).values
res['overlap'] = {'dates': [str(OVERLAP[0]), str(OVERLAP[1])], 'rows': int(ov.sum()), 'companies': int(df.loc[ov, 'code'].nunique()), 'base_up': float(df.loc[ov, 'up50'].mean()),
                  '업종만': adj(ov & F('F15'))[0], '회사만': adj(ov & F('F05'))[0], '업종 + 회사': adj(ov & TWO)[0], 'n_two': adj(ov & TWO)[1]}
# ③ 분석표
if not LEAN:
    res['table'] = {f: {'name': NAMES[f], **feature_stats(F(f))} for f in NAMES if f in df and df[f].notna().any()}

# ① 때 — 지수만으로(살아남은 회사 치우침 없음)
day = df.groupby('date').agg(up=('up50', 'mean'), dn=('dn33', 'mean'), n=('up50', 'size')).reset_index()
DAY_MIN = 50  # 그 날 고른 회사가 50곳 넘을 때만 「그 날 크게 오른 회사 비율」을 씀(첫해 몇 곳뿐인 날은 뺌)
day = day[day['n'] >= DAY_MIN].reset_index(drop=True)
dayu = dict(zip(day['date'].astype(int), day['up']))
BINS = [(-0.05, 9, '1년 꼭대기 근처(5% 안쪽)'), (-0.10, -0.05, '5~10% 아래'), (-0.20, -0.10, '10~20% 아래'), (-0.30, -0.20, '20~30% 아래'), (-9, -0.30, '30% 넘게 아래')]
def bucket_of(x):
    for k, (lo, hi, _) in enumerate(BINS):
        if lo < x <= hi: return k
    return None
def index_when(key):
    u = unpack(D['indices'].get(key))
    if u is None: return None
    d, c, _ = u; n = len(c)
    dd = c / roll_max(c, YEAR) - 1
    fend, fmax, fend250 = np.full(n, np.nan), np.full(n, np.nan), np.full(n, np.nan)
    if n > AHEAD: fmax[:n - AHEAD] = swv(c[1:], AHEAD).max(1) / c[:n - AHEAD] - 1; fend[:n - AHEAD] = c[AHEAD:] / c[:n - AHEAD] - 1
    if n > YEAR: fend250[:n - YEAR] = c[YEAR:] / c[:n - YEAR] - 1
    ok = ~np.isnan(dd) & ~np.isnan(fend) & (d >= START)
    out = {'first': str(d[0]), 'last': str(d[-1]), 'days': int(ok.sum()), 'buckets': []}
    bk = np.array([bucket_of(x) if not np.isnan(x) else -1 for x in dd])
    for k, (lo, hi, lab) in enumerate(BINS):
        m = ok & (bk == k); f2 = m & ~np.isnan(fend250)
        su = [dayu[x] for x in d[m] if x in dayu]
        out['buckets'].append({'label': lab, 'days': int(m.sum()), 'idx_end_mean': float(fend[m].mean()) if m.any() else None,
                               'idx_end_median': float(np.median(fend[m])) if m.any() else None, 'idx_end_neg': float((fend[m] < 0).mean()) if m.any() else None,
                               'idx_max20': float((fmax[m] >= 0.20).mean()) if m.any() else None, 'idx_end250_mean': float(fend250[f2].mean()) if f2.any() else None,
                               'idx_end250_neg': float((fend250[f2] < 0).mean()) if f2.any() else None,
                               'stocks_up50': float(np.mean(su)) if su else None, 'stocks_days': len(su)})
    m4 = ok & (bk == len(BINS) - 1)  # 30% 넘게 아래였던 날이 몇 달에 몰렸나(글에 「거의 언제」를 계산해 넣으려고)
    out['deep_months'] = {str(k): int(v) for k, v in pd.Series(d[m4] // 100).value_counts().sort_index().items()}
    out['all'] = {'idx_end_mean': float(fend[ok].mean()), 'idx_end_neg': float((fend[ok] < 0).mean()), 'idx_max20': float((fmax[ok] >= 0.20).mean()),
                  'idx_end250_mean': float(np.nanmean(fend250[ok])), 'stocks_up50': float(np.mean([dayu[x] for x in d[ok] if x in dayu])) if any(x in dayu for x in d[ok]) else None}
    # 큰 하락 덩어리 — 1년 꼭대기보다 20% 넘게 아래인 날들(20거래일 안 끊김은 이어 봄)
    inside = [k for k in range(n) if not np.isnan(dd[k]) and dd[k] <= -0.20 and d[k] >= START - 10000]
    eps = []
    if inside:
        cur = [inside[0]]
        for k in inside[1:]:
            if k - cur[-1] <= 20: cur.append(k)
            else: eps.append(cur); cur = [k]
        eps.append(cur)
    nv = lambda a, k: None if np.isnan(a[k]) else float(a[k])
    out['episodes'] = [{'start': str(d[e[0]]), 'trough': str(d[min(e, key=lambda k: dd[k])]), 'end': str(d[e[-1]]), 'depth': float(min(dd[k] for k in e)),
                        'days_to_trough': int(min(e, key=lambda k: dd[k]) - e[0]),
                        'idx_end_from_start': nv(fend, e[0]), 'idx_max_from_start': nv(fmax, e[0]), 'idx_end250_from_start': nv(fend250, e[0]),
                        'idx_end_from_trough': nv(fend, min(e, key=lambda k: dd[k])), 'idx_end250_from_trough': nv(fend250, min(e, key=lambda k: dd[k])),
                        'stocks_up50_start': dayu.get(int(d[e[0]])), 'stocks_up50_trough': dayu.get(int(d[min(e, key=lambda k: dd[k])]))} for e in eps]
    # 달마다(그림용) — 그 달 마지막 종가
    s = pd.Series(c, index=d // 100); mo = s.groupby(level=0).last()
    out['monthly'] = [[int(k), round(float(x), 2)] for k, x in mo.items() if k >= 200401]
    return out
res['when_index'] = {k: index_when(k) for k in D['indices'] if D['indices'][k]}
# 크게 오른 회사가 가장 많던 날(위 10%)은 고른 지수의 어느 칸에 있었나
day['dd'] = [m_dd250[np.searchsorted(all_dates, x)] for x in day['date']]
day['bk'] = [bucket_of(x) if not np.isnan(x) else -1 for x in day['dd']]
dv = day[day['bk'] >= 0]
q90 = dv['up'].quantile(0.9); top = dv[dv['up'] >= q90]
res['when_top'] = {'q90': float(q90), 'top_days': int(len(top)), 'all_days': int(len(dv)), 'day_min_companies': DAY_MIN,
                   'share_top': [float((top['bk'] == k).mean()) for k in range(len(BINS))], 'share_all': [float((dv['bk'] == k).mean()) for k in range(len(BINS))],
                   'labels': [b[2] for b in BINS]}
res['when_spread'] = {'min': float(day['up'].min()), 'max': float(day['up'].max()), 'median': float(day['up'].median()),
                      'min_date': str(int(day.loc[day['up'].idxmin(), 'date'])), 'max_date': str(int(day.loc[day['up'].idxmax(), 'date'])), 'days': int(len(day))}
res['when_year'] = {str(k): float(v) for k, v in df.groupby('year')['up50'].mean().items()}
mon = day.assign(ym=day['date'] // 100).groupby('ym')['up'].mean()
res['stocks_monthly'] = [[int(k), round(float(v), 4)] for k, v in mon.items()]

def clean(o):
    if isinstance(o, dict): return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [clean(v) for v in o]
    if isinstance(o, np.floating): return None if np.isnan(o) else float(o)
    if isinstance(o, np.integer): return int(o)
    if isinstance(o, float) and np.isnan(o): return None
    return o
json.dump(clean(res), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
r3 = lambda x: None if x is None else round(x, 3)
print(f"{MK} {UNIV}/{GROUPS}(업종 {len(groups)}) 지수 {IDX_KEY}: 회사 {res['companies']} · 줄 {res['rows']:,} · {res['dates']} · 크게 오름 {res['base_up']:.3f} · 2005 전부터 있던 회사 {res['stocks_first']}")
print('다섯 해마다 회사 수', res['companies_by_block'], '크게 오름', {k: round(v, 3) for k, v in res['base_by_block'].items() if v == v})
for k, v in res['structure'].items():
    print('구조', k, 'n', v['n'], '배수', r3(v['adj_up']), v['ci90'] and [round(x, 3) for x in v['ci90']], '떨어짐', r3(v['adj_dn']), '덮음', round(v['recall'], 3),
          '| 묶음', {b: r3(x['adj_up']) for b, x in v['blocks'].items()}, '| 해', f"{v['years']['above']}/{v['years']['count']}", '| 달', f"{v['months']['above']}/{v['months']['count']}")
print('겹치는 때', {k: (r3(v) if isinstance(v, float) else v) for k, v in res['overlap'].items()})
for x in res['structure_by_dd']: print('때 × 구조', x['label'], x['rows'], r3(x['base_up']), {k: (r3(v['adj_up']), v['n']) for k, v in x.items() if isinstance(v, dict)})
for f, v in res.get('table', {}).items():
    print(f, v['name'], 'n', v['n'], '배수', r3(v['adj_up']), v['ci90'] and [round(x, 2) for x in v['ci90']], '떨어짐', r3(v['adj_dn']), '| 해', f"{v['years']['above']}/{v['years']['count']}")
for k, w in res['when_index'].items():
    print('때', k, w['first'], '~', w['last'], '전체', {a: r3(b) for a, b in w['all'].items()})
    for x in w['buckets']: print('   ', x['label'], x['days'], '6달 뒤', r3(x['idx_end_mean']), '내림', r3(x['idx_end_neg']), '20%+', r3(x['idx_max20']), '1년 뒤', r3(x['idx_end250_mean']), '회사', r3(x['stocks_up50']))
    for e in w['episodes']: print('    하락', e['start'], e['trough'], round(e['depth'], 3), e['days_to_trough'], '시작 6달', r3(e['idx_end_from_start']), '1년', r3(e['idx_end250_from_start']), '바닥 6달', r3(e['idx_end_from_trough']), '회사', r3(e['stocks_up50_start']), r3(e['stocks_up50_trough']))
print('위 10% 날', res['when_top'])
print('퍼짐', res['when_spread'])
