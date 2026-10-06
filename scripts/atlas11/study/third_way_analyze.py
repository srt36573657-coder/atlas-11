#!/usr/bin/env python3
"""ATLAS 11 공부 · 「출목표 말고 제3의 방식」 분석표 + 구조 찾기(공부 기록 · 사이트는 바꾸지 않음)
사장님 2026-10-06 12:16 「그러면 출목표 말고 말이야 제3에 방식에 분석표를 만들어 내가 원하는 것을 찾는 구조를 찾아내봐」
  재료: third_way_features.py 가 만든 날마다 표시(그 날까지의 자료만)
  ① 분석표: 표시마다 「그 뒤 6달 안 +50%」 비율 · 같은 날 · 같은 출렁임(그 날 20일 출렁임 다섯 층) 회사와 견준 배수
     · 크게 떨어짐(−33%) 배수 · 두 시기(2023-11~2024-12 / 2025-01~2026-04) · 1,270곳 · 초입 포착률 · 회사 다시 뽑기 흔들림 폭
  ② 때 표: 날짜마다 365곳 가운데 크게 오른 비율 — 달마다 · 시장 하락 폭마다 · 시장 넓이마다
  ③ 구조 찾기(결과를 보기 전에 정한 규칙):
     회사 표시 17개의 하나 · 둘 · 셋 겹침(833개)을 한 시기에서 고르고 다른 시기에 그대로 대어 봄(두 방향)
     고르는 잣대 = 그 시기에서 날 300개 · 회사 20곳 이상 · 같은 출렁임 견준 크게 떨어짐 배수 1.0 이하 · 크게 오름 배수가 큰 순 다섯
     점수표 = 회사 표시 17개 + 출렁임 층으로 로지스틱 회귀를 한 시기에서 맞추고, 다른 시기에서 날마다 점수 위 10% 회사의 결과를 봄
  쓰는 법: python3 scripts/atlas11/study/third_way_analyze.py <features.pkl> <결과.json>
"""
import itertools, json, sys
import numpy as np
import pandas as pd

SRC, OUT = sys.argv[1], sys.argv[2]
SPLIT = '20250101'
NAMES = {
    'F01': ('자리', '6달 신고가 근처', '그 날 종가가 지난 120거래일 가장 높은 값의 98% 이상'),
    'F02': ('자리', '1년 신고가 근처', '지난 250거래일 가장 높은 값의 98% 이상(2024-04 이후만)'),
    'F03': ('자리', '6달 바닥 근처', '지난 120거래일 가장 낮은 값의 105% 이하'),
    'F04': ('자리', '크게 떨어진 뒤', '지난 120거래일 가장 높은 값보다 35% 넘게 아래'),
    'F05': ('자리', '6달 추세 위 20%', '120거래일 오름폭이 그 날 위 20%'),
    'F06': ('자리', '6달 추세 아래 20%', '120거래일 오름폭이 그 날 아래 20%'),
    'F07': ('자리', '바닥에서 돌아섬', '60거래일 바닥보다 20% 넘게 올랐고 6달 꼭대기보다는 15% 넘게 아래'),
    'F08': ('추세', '이동평균 정배열', '종가 > 20일선 > 60일선 > 120일선'),
    'F09': ('추세', '120일선을 막 넘음', '오늘 120일선 위 · 앞 20일 가운데 15일 넘게 아래'),
    'F10': ('추세', '출렁임이 줄어듦', '20일 출렁임이 120일 출렁임의 60% 이하'),
    'F11': ('거래량', '거래량 급증', '5일 평균 거래량이 그 앞 115일 평균의 3배 이상'),
    'F12': ('거래량', '거래량 늘며 오름', '20일 평균 거래량이 120일 평균의 1.5배 이상이고 20일 동안 +10% 넘게'),
    'F13': ('거래량', '거래가 말라붙음', '20일 평균 거래량이 120일 평균의 절반 이하'),
    'F14': ('거래량', '신고가 + 거래량', '6달 신고가 근처이면서 20일 평균 거래량이 1.5배 이상'),
    'F15': ('업종', '업종 6달 추세 위 20%', '업종(회사 다섯) 120거래일 오름폭이 73업종 가운데 위 20%'),
    'F16': ('업종', '업종 1달 추세 위 20%', '업종 20거래일 오름폭이 위 20%'),
    'F17': ('업종', '앞선 업종 안 뒤처진 회사', '업종 6달 추세 위 20%인데 그 회사는 업종 안 가운데 아래'),
    'F18': ('업종', '업종 동반 신고가', '업종 다섯 곳 가운데 셋 이상이 6달 신고가 근처'),
    'F19': ('시장', '시장 큰 하락 뒤', '365곳 지수가 120거래일 꼭대기보다 15% 넘게 아래'),
    'F20': ('시장', '시장 넓이 바닥', '365곳 가운데 80% 넘게 60일선 아래'),
    'F21': ('시장', '시장 반등 시작', '시장이 12% 넘게 빠진 뒤 20거래일 동안 +8% 넘게'),
    'F22': ('실적', '영업이익 30% 넘게 늚', '지난해 영업이익이 그 앞해보다 30% 넘게(흑자일 때) · 4월 1일부터 씀'),
    'F23': ('실적', '흑자 전환', '그 앞해 적자(0 이하) → 지난해 흑자'),
    'N15': ('업종(네이버)', '네이버 업종 6달 추세 위 20%', '네이버 업종(다섯 곳 넘는 업종) 120거래일 오름폭이 위 20% · 1,270곳'),
    'N17': ('업종(네이버)', '네이버 앞선 업종 안 뒤처진 회사', '네이버 업종 6달 추세 위 20%인데 그 회사는 업종 안 가운데 아래'),
}
COMPANY = ['F01', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18']
MARKET = ['F19', 'F20', 'F21']

raw = pd.read_pickle(SRC)
raw = raw[raw['date'] >= '20231101'].copy()  # 2013~2014 기록이 섞인 한 종목(101970)의 옛 줄 203개를 뺌
rng = np.random.default_rng(20261006)

def prepare(U):
    d = U.copy().reset_index(drop=True)
    rk = d.groupby('date')['r120'].rank(pct=True)
    d['F05'] = np.where(rk.isna(), np.nan, (rk >= 0.8).astype(float)); d['F06'] = np.where(rk.isna(), np.nan, (rk <= 0.2).astype(float))
    d['vq'] = d.groupby('date')['sd20'].transform(lambda s: np.floor(s.rank(method='first', pct=True).clip(upper=0.999999) * 5))
    for y in ('up50', 'dn33', 'up30_3m'):
        g = d.groupby('date')[y]; s_, n_ = g.transform('sum'), g.transform('count')
        d['day_' + y] = (s_ - d[y]) / (n_ - 1)  # 나를 뺀 같은 날 비율
        g = d.groupby(['date', 'vq'])[y]; s_, n_ = g.transform('sum'), g.transform('count')
        d['cell_' + y] = (s_ - d[y]) / (n_ - 1)  # 나를 뺀 같은 날 · 같은 출렁임 층 비율
    d['p2'] = d['date'] >= SPLIT
    # 초입(크게 오르기 바로 전 날) = 회사마다 「크게 오름」 날이 이어진 덩어리에서 그 뒤 가장 크게 오른 날
    d = d.sort_values(['code', 't']).reset_index(drop=True)
    newblk = (d['code'] != d['code'].shift()) | (d['t'] != d['t'].shift() + 1) | (d['up50'] != d['up50'].shift())
    d['blk'] = newblk.cumsum()
    best = d[d['up50'] == 1].groupby('blk')['f120'].idxmax()
    d['anchor'] = False; d.loc[best.values, 'anchor'] = True
    return d

def ratio_ci(d, on, y, B=300):
    """회사를 다시 뽑아 같은 출렁임 배수의 흔들림 폭(90%)"""
    sub = d.loc[on, ['code', y, 'cell_' + y]]
    g = sub.groupby('code').agg(a=(y, 'sum'), e=('cell_' + y, 'sum'))
    if len(g) < 5: return None
    a, e = g['a'].values, g['e'].values; n = len(g)
    W = rng.multinomial(n, np.ones(n) / n, size=B)
    r = (W @ a) / (W @ e)
    return [float(np.quantile(r, 0.05)), float(np.quantile(r, 0.95))]

def stats(d, on, valid, ci=True):
    on = on & valid
    n = int(on.sum())
    if n == 0: return {'n': 0}
    out = {'n': n, 'share': n / int(valid.sum()), 'companies': int(d.loc[on, 'code'].nunique()), 'dates': int(d.loc[on, 'date'].nunique()),
           'p_up': float(d.loc[on, 'up50'].mean()), 'base_up': float(d.loc[valid, 'up50'].mean()),
           'p_dn': float(d.loc[on, 'dn33'].mean()), 'base_dn': float(d.loc[valid, 'dn33'].mean()),
           'adj_day_up': float(d.loc[on, 'up50'].mean() / d.loc[on, 'day_up50'].mean()),
           'adj_up': float(d.loc[on, 'up50'].sum() / d.loc[on, 'cell_up50'].sum()), 'adj_dn': float(d.loc[on, 'dn33'].sum() / d.loc[on, 'cell_dn33'].sum()),
           'exp_up': float(d.loc[on, 'cell_up50'].mean()),
           'adj_up_3m': float(d.loc[on, 'up30_3m'].sum() / d.loc[on, 'cell_up30_3m'].sum())}
    for k, m in (('p1', ~d['p2']), ('p2', d['p2'])):
        o = on & m
        out[k] = {'n': int(o.sum()), 'companies': int(d.loc[o, 'code'].nunique())}
        if o.sum() >= 100:
            out[k].update({'p_up': float(d.loc[o, 'up50'].mean()), 'exp_up': float(d.loc[o, 'cell_up50'].mean()),
                           'adj_up': float(d.loc[o, 'up50'].sum() / d.loc[o, 'cell_up50'].sum()), 'adj_dn': float(d.loc[o, 'dn33'].sum() / d.loc[o, 'cell_dn33'].sum())})
    anc = d['anchor'] & valid
    out['recall'] = float((on & anc).sum() / anc.sum()) if anc.sum() else None
    out['anchors'] = int(anc.sum())
    if ci:
        out['adj_up_ci90'] = ratio_ci(d, on, 'up50'); out['adj_dn_ci90'] = ratio_ci(d, on, 'dn33')
    return out

res = {'made': pd.Timestamp.now(tz='Asia/Seoul').isoformat(), 'split': SPLIT, 'names': NAMES}
U365 = prepare(raw[raw['board']])
UALL = prepare(raw)
res['universe'] = {k: {'rows': int(len(d)), 'companies': int(d['code'].nunique()), 'dates': [d['date'].min(), d['date'].max()], 'n_dates': int(d['date'].nunique()),
                       'base_up': float(d['up50'].mean()), 'base_dn': float(d['dn33'].mean()), 'anchors': int(d['anchor'].sum()),
                       'p1': {'rows': int((~d['p2']).sum()), 'base_up': float(d.loc[~d['p2'], 'up50'].mean()), 'base_dn': float(d.loc[~d['p2'], 'dn33'].mean())},
                       'p2': {'rows': int(d['p2'].sum()), 'base_up': float(d.loc[d['p2'], 'up50'].mean()), 'base_dn': float(d.loc[d['p2'], 'dn33'].mean())}}
                   for k, d in (('365', U365), ('all', UALL))}

# ① 분석표
table = []
for f in NAMES:
    row = {'id': f, 'group': NAMES[f][0], 'name': NAMES[f][1], 'text': NAMES[f][2]}
    v = U365[f].notna()
    row['s365'] = stats(U365, U365[f] == 1, v)
    if f not in ('F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21'):  # N15 · N17 은 1,270곳에서도 셈
        va = UALL[f].notna(); row['sall'] = stats(UALL, UALL[f] == 1, va, ci=False)
    if f in MARKET:  # 시장 표시는 그 날 모든 회사에 같음 → 같은 날 견준 배수는 1 이 됨. 날 수와 덩어리 수를 따로 셈
        ds = sorted(U365.loc[U365[f] == 1, 'date'].unique()); dd = sorted(U365['date'].unique()); pos = {x: i for i, x in enumerate(dd)}
        ep = 0; prev = None
        for x in ds:
            if prev is None or pos[x] != pos[prev] + 1: ep += 1
            prev = x
        row['episodes'] = ep; row['days'] = ds
    table.append(row)
res['table'] = table

# ② 때 표
d = U365
month = d.assign(m=d['date'].str[:6]).groupby('m').agg(n=('up50', 'size'), up=('up50', 'mean'), dn=('dn33', 'mean')).reset_index()
res['when_month'] = month.to_dict('records')
dates = d.groupby('date').agg(up=('up50', 'mean'), dn=('dn33', 'mean'), m_dd=('m_dd', 'first'), br=('breadth_below60', 'first')).reset_index()
bins_dd = [(-1, 0.90, '시장이 꼭대기보다 10% 넘게 아래'), (0.90, 0.95, '5~10% 아래'), (0.95, 2, '5% 안쪽')]
res['when_dd'] = [{'label': lab, 'dates': int(((dates['m_dd'] > lo) & (dates['m_dd'] <= hi)).sum()), 'up': float(dates.loc[(dates['m_dd'] > lo) & (dates['m_dd'] <= hi), 'up'].mean()),
                   'dn': float(dates.loc[(dates['m_dd'] > lo) & (dates['m_dd'] <= hi), 'dn'].mean())} for lo, hi, lab in bins_dd]
bins_br = [(0.6, 1.01, '365곳 가운데 60% 넘게 60일선 아래'), (0.4, 0.6, '40~60%'), (-0.01, 0.4, '40% 안쪽')]
res['when_breadth'] = [{'label': lab, 'dates': int(((dates['br'] > lo) & (dates['br'] <= hi)).sum()), 'up': float(dates.loc[(dates['br'] > lo) & (dates['br'] <= hi), 'up'].mean()),
                        'dn': float(dates.loc[(dates['br'] > lo) & (dates['br'] <= hi), 'dn'].mean())} for lo, hi, lab in bins_br]
res['when_spread'] = {'min': float(dates['up'].min()), 'q10': float(dates['up'].quantile(0.1)), 'median': float(dates['up'].median()), 'q90': float(dates['up'].quantile(0.9)), 'max': float(dates['up'].max()),
                      'min_date': dates.loc[dates['up'].idxmin(), 'date'], 'max_date': dates.loc[dates['up'].idxmax(), 'date']}

# ③ 구조 찾기 — 365곳 · 회사 표시 17개의 하나 · 둘 · 셋
X = {f: (U365[f] == 1).values for f in COMPANY}
up = U365['up50'].values.astype(float); dn = U365['dn33'].values.astype(float)
eu = U365['cell_up50'].values; ed = U365['cell_dn33'].values
p2 = U365['p2'].values; codes = U365['code'].values
combos = [c for k in (1, 2, 3) for c in itertools.combinations(COMPANY, k)]
def cstat(mask):
    out = {}
    for k, m in (('p1', mask & ~p2), ('p2', mask & p2)):
        n = int(m.sum())
        out[k] = {'n': n, 'companies': int(len(np.unique(codes[m]))) if n else 0,
                  'p_up': float(up[m].mean()) if n else None, 'exp_up': float(eu[m].mean()) if n else None,
                  'adj_up': float(up[m].sum() / eu[m].sum()) if n and eu[m].sum() > 0 else None,
                  'adj_dn': float(dn[m].sum() / ed[m].sum()) if n and ed[m].sum() > 0 else None}
    return out
allc = []; seen = set(); dup = 0
for c in combos:
    m = np.ones(len(up), dtype=bool)
    for f in c: m &= X[f]
    key = hash(np.packbits(m).tobytes())  # 같은 날들을 고르는 조합은 하나만(예: F17 은 F15 안에 있어 「F15+F17」은 「F17」과 같음) — 짧은 쪽을 남김
    if key in seen: dup += 1; continue
    seen.add(key)
    allc.append({'ids': list(c), **cstat(m)})
def ok(s): return s['n'] >= 300 and s['companies'] >= 20 and s['adj_dn'] is not None and s['adj_dn'] <= 1.0 and s['adj_up'] is not None
search = {}
for tr, te in (('p1', 'p2'), ('p2', 'p1')):
    cand = [c for c in allc if ok(c[tr])]
    cand.sort(key=lambda c: -c[tr]['adj_up'])
    top = cand[:5]
    # 앞 시기에서 쓸 만한 조합 전체에서, 앞 시기 배수와 뒤 시기 배수가 함께 가는지(순위 상관)
    both = [c for c in cand if c[te]['n'] >= 300 and c[te]['adj_up'] is not None]
    rho = float(pd.Series([c[tr]['adj_up'] for c in both]).rank().corr(pd.Series([c[te]['adj_up'] for c in both]).rank())) if len(both) > 10 else None
    te_all = sorted([c[te]['adj_up'] for c in both])
    search[tr + '_to_' + te] = {'candidates': len(cand), 'top': [{'ids': c['ids'], 'train': c[tr], 'test': c[te],
                                 'test_rank_pct': float(np.mean(np.array(te_all) <= c[te]['adj_up'])) if c[te]['adj_up'] is not None and te_all else None} for c in top],
                                'rank_corr': rho, 'pairs_in_both': len(both)}
res['search'] = search
res['combos_tried'] = len(combos); res['combos_distinct'] = len(allc); res['combos_duplicate'] = dup

# 세 겹(시장 → 업종 → 회사) — 미리 정한 짝: 시장 표시 하나 + 업종 표시(F15 또는 F18) + 회사 표시(F01 · F09 · F14 가운데 하나)
layers = []
for mk in MARKET + [None]:
    for ind in ('F15', 'F18', None):
        for co in ('F01', 'F09', 'F14', None):
            if mk is None and ind is None and co is None: continue
            m = np.ones(len(up), dtype=bool)
            for f in (mk, ind, co):
                if f: m &= (U365[f] == 1).values
            n = int(m.sum())
            layers.append({'market': mk, 'industry': ind, 'company': co, 'n': n, 'dates': int(U365.loc[m, 'date'].nunique()) if n else 0,
                           'p_up': float(up[m].mean()) if n else None, 'base_up': float(up.mean()), 'p_dn': float(dn[m].mean()) if n else None,
                           'p1_n': int((m & ~p2).sum()), 'p2_n': int((m & p2).sum()),
                           'p1_p_up': float(up[m & ~p2].mean()) if (m & ~p2).sum() else None, 'p2_p_up': float(up[m & p2].mean()) if (m & p2).sum() else None,
                           'adj_up': float(up[m].sum() / eu[m].sum()) if n else None})
res['layers'] = layers

# 업종 → 회사 두 겹(분석표 1차를 본 뒤 고른 구조라 「뒤에 고름」으로 적음) — 365곳(판 업종)과 1,270곳(네이버 업종)
def two_layer(d, ind, extra):
    m = (d[ind] == 1).values.copy()
    for f in extra: m = m & (d[f] == 1).values
    out = {}
    for k, mm in (('all', np.ones(len(d), dtype=bool)), ('p1', ~d['p2'].values), ('p2', d['p2'].values)):
        o = m & mm; n = int(o.sum())
        out[k] = {'n': n, 'companies': int(d.loc[o, 'code'].nunique()) if n else 0, 'p_up': float(d.loc[o, 'up50'].mean()) if n else None,
                  'exp_up': float(d.loc[o, 'cell_up50'].mean()) if n else None, 'day_up': float(d.loc[o, 'day_up50'].mean()) if n else None,
                  'adj_up': float(d.loc[o, 'up50'].sum() / d.loc[o, 'cell_up50'].sum()) if n else None,
                  'p_dn': float(d.loc[o, 'dn33'].mean()) if n else None, 'adj_dn': float(d.loc[o, 'dn33'].sum() / d.loc[o, 'cell_dn33'].sum()) if n else None}
    out['ci90'] = ratio_ci(d, pd.Series(m), 'up50')
    anc = d['anchor'].values
    out['recall'] = float((m & anc).sum() / anc.sum())  # 초입(가장 싸게 살 수 있었던 날) 가운데 이 구조가 켜져 있던 비율
    return out
# 달마다 — 겹치는 날이 많아(같은 회사의 이웃한 날은 결과를 나눠 가짐) 달 단위로도 「보통보다 높은 달이 몇 달인가」를 셈
def monthly(d, sel):
    x = d.loc[sel, ['date', 'up50', 'cell_up50']].assign(m=lambda z: z['date'].str[:6]).groupby('m').agg(n=('up50', 'size'), a=('up50', 'sum'), e=('cell_up50', 'sum'))
    x = x[x['n'] >= 100]
    return {'months': int(len(x)), 'above': int((x['a'] > x['e']).sum()), 'by_month': {k: float(v) for k, v in (x['a'] / x['e']).items()}}
res['monthly'] = {
    '365': {f: monthly(U365, (U365[f] == 1).values) for f in ('F01', 'F05', 'F08', 'F11', 'F13', 'F15', 'F17')} | {'F15+F05': monthly(U365, ((U365['F15'] == 1) & (U365['F05'] == 1)).values)},
    'all': {f: monthly(UALL, (UALL[f] == 1).values) for f in ('F01', 'F05', 'F11', 'N15')} | {'N15+F05': monthly(UALL, ((UALL['N15'] == 1) & (UALL['F05'] == 1)).values)},
}
res['two_layer'] = {
    '365': {'업종만': two_layer(U365, 'F15', []), '업종 + 회사도 추세 위': two_layer(U365, 'F15', ['F05']), '업종 + 회사는 뒤처짐': two_layer(U365, 'F17', []),
            '네이버 업종만': two_layer(U365, 'N15', []), '네이버 업종 + 회사는 뒤처짐': two_layer(U365, 'N17', [])},
    'all': {'네이버 업종만': two_layer(UALL, 'N15', []), '네이버 업종 + 회사도 추세 위': two_layer(UALL, 'N15', ['F05']), '네이버 업종 + 회사는 뒤처짐': two_layer(UALL, 'N17', [])},
}

# 점수표 — 로지스틱 회귀(회사 표시 17개 + 출렁임 층 다섯), 한 시기에서 맞추고 다른 시기에서 날마다 위 10%
from sklearn.linear_model import LogisticRegression
Xm = np.column_stack([X[f].astype(float) for f in COMPANY] + [(U365['vq'].values == q).astype(float) for q in range(1, 5)])
score = {}
for tr, te in (('p1', 'p2'), ('p2', 'p1')):
    mtr = ~p2 if tr == 'p1' else p2; mte = p2 if te == 'p2' else ~p2
    lr = LogisticRegression(max_iter=2000, C=1.0).fit(Xm[mtr], up[mtr])
    s = lr.predict_proba(Xm[mte])[:, 1]
    t_df = pd.DataFrame({'date': U365.loc[mte, 'date'].values, 's': s, 'up': up[mte], 'dn': dn[mte], 'eu': eu[mte], 'ed': ed[mte], 'day': U365.loc[mte, 'day_up50'].values})
    t_df['rk'] = t_df.groupby('date')['s'].rank(pct=True)
    top = t_df[t_df['rk'] > 0.9]; bot = t_df[t_df['rk'] <= 0.1]
    score[tr + '_to_' + te] = {'coef': {f: float(c) for f, c in zip(COMPANY + ['vq1', 'vq2', 'vq3', 'vq4'], lr.coef_[0])},
                               'top10': {'n': int(len(top)), 'p_up': float(top['up'].mean()), 'day_up': float(top['day'].mean()), 'adj_day': float(top['up'].mean() / top['day'].mean()),
                                         'adj_up': float(top['up'].sum() / top['eu'].sum()), 'adj_dn': float(top['dn'].sum() / top['ed'].sum()), 'p_dn': float(top['dn'].mean())},
                               'bottom10': {'n': int(len(bot)), 'p_up': float(bot['up'].mean()), 'adj_day': float(bot['up'].mean() / bot['day'].mean())},
                               'base_up': float(t_df['up'].mean())}
res['scorecard'] = score

def clean(o):
    if isinstance(o, dict): return {k: clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [clean(v) for v in o]
    if isinstance(o, (np.floating,)): return float(o)
    if isinstance(o, (np.integer,)): return int(o)
    if isinstance(o, (np.bool_,)): return bool(o)
    if isinstance(o, float) and (np.isnan(o) or np.isinf(o)): return None
    return o
json.dump(clean(res), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# 화면 확인용
u = res['universe']['365']
print(f"365곳 {u['rows']}날 · 크게 오름 {u['base_up']:.3f}(앞 {u['p1']['base_up']:.3f} · 뒤 {u['p2']['base_up']:.3f}) · 크게 떨어짐 {u['base_dn']:.3f} · 초입 {u['anchors']}")
print('표시 | 날 | 오름 | 같은날배수 | 같은출렁임배수(90%) | 떨어짐배수(90%) | 앞 | 뒤 | 1270곳 | 초입포착')
for r in table:
    s = r['s365']
    if not s.get('n'): print(r['id'], r['name'], '없음'); continue
    sa = r.get('sall', {})
    ci = s.get('adj_up_ci90') or [None, None]; cd = s.get('adj_dn_ci90') or [None, None]
    fmt = lambda x: '-' if x is None else f'{x:.2f}'
    print(f"{r['id']} {r['name']:<14} | {s['n']:6d} | {s['p_up']:.3f} | {s['adj_day_up']:.2f} | {s['adj_up']:.2f} ({fmt(ci[0])}~{fmt(ci[1])}) | {s['adj_dn']:.2f} ({fmt(cd[0])}~{fmt(cd[1])}) | {fmt(s['p1'].get('adj_up'))} | {fmt(s['p2'].get('adj_up'))} | {fmt(sa.get('adj_up'))} | {fmt(s['recall'])}"
          + (f" · 날 {len(r['days'])} 덩어리 {r['episodes']}" if 'episodes' in r else ''))
for k, v in search.items():
    print('구조 찾기', k, '후보', v['candidates'], '순위상관', None if v['rank_corr'] is None else round(v['rank_corr'], 3))
    for c in v['top']:
        print('   ', '+'.join(NAMES[i][1] for i in c['ids']), '| 고른 시기', round(c['train']['adj_up'], 2), c['train']['n'], '| 시험 시기', None if c['test']['adj_up'] is None else round(c['test']['adj_up'], 2), c['test']['n'], '| 시험 순위', None if c['test_rank_pct'] is None else round(c['test_rank_pct'], 2))
for uk, dd_ in res['two_layer'].items():
    for nm, v in dd_.items():
        print('두 겹', uk, nm, '| 전체', {k: (round(x, 3) if isinstance(x, float) else x) for k, x in v['all'].items() if k in ('n', 'p_up', 'exp_up', 'adj_up', 'adj_dn')}, '| 앞', None if v['p1']['adj_up'] is None else round(v['p1']['adj_up'], 2), '| 뒤', None if v['p2']['adj_up'] is None else round(v['p2']['adj_up'], 2), '| 흔들림', v['ci90'])
for uk, dd_ in res['monthly'].items():
    print('달마다', uk, {k: f"{v['above']}/{v['months']}" for k, v in dd_.items()})
for k, v in score.items():
    print('점수표', k, '위 10%:', {kk: round(vv, 3) if isinstance(vv, float) else vv for kk, vv in v['top10'].items()}, '아래 10%:', {kk: round(vv, 3) if isinstance(vv, float) else vv for kk, vv in v['bottom10'].items()})
print('때', res['when_spread'])
for x in res['when_dd'] + res['when_breadth']: print('  ', x)
