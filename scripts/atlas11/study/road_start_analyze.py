#!/usr/bin/env python3
"""ATLAS 11 공부 · 「대세 상승 초입의 출목표」 — road_start.mjs 가 낸 날마다 모양표를 센다(공부 기록 · 사이트는 바꾸지 않음)
사장님 2026-10-06 01:17 「어떤 출목표가 나와야 대세 상승을 하는 초입에 출목표인지」 · 01:24 「제안대로해」
  출발일 = 그 날 종가에서 그 뒤 120거래일 안에 종가가 50% 넘게 오른 적이 있는 날(대세 상승을 그 날 탔다면)
  보통 날 = 출발일이 아닌 날
  모양마다:
    ① 출발일 가운데 그 모양 비율 · 보통 날 가운데 그 모양 비율 · 차이(사이트 태양과 같은 잣대: 50% 넘게 · 10%p 넘게)
    ② 그 모양이 나온 날 가운데 출발일 비율(= 그 모양 뒤 6달 안에 50% 넘게 오른 비율) · 보통 비율과 견준 배수
    ③ 같은 날 다른 회사들과 견준 배수(그날 시장 전체가 좋았는지를 걷어 냄)
    ④ 그 모양 뒤 크게 떨어진 비율(6달 안 −33%) — 「크게 오름」이 아니라 「크게 움직임」의 표시인지 가린다
    ⑤ 두 시기(2023-05~2024-12 · 2025-01~2026-04)에서 따로 · 회사를 다시 뽑는 셈(부트스트랩 500번)으로 흔들림 폭(90%)
  쓰는 법: python3 scripts/atlas11/study/road_start_analyze.py <모양표.csv.gz> <결과.json>
"""
import json, sys
import numpy as np
import pandas as pd

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(src.replace('.csv.gz', '') + '.meta.json', encoding='utf-8'))
SH = [s['id'] for s in meta['shapes']]
df = pd.read_csv(src, dtype={'code': str, 'date': str})
df['p2'] = df['date'] >= '20250101'
N = len(df)
base_up, base_dn = df['up50'].mean(), df['down33'].mean()
# 같은 날 다른 회사들의 비율(그날 시장의 몫)
day_up = df.groupby('date')['up50'].transform('mean')
day_dn = df.groupby('date')['down33'].transform('mean')
df['day_up'], df['day_dn'] = day_up, day_dn
pos = df['up50'] == 1

def stats(d, s):
    m = d[s] == 1
    n = int(m.sum())
    if n == 0:
        return {'n': 0}
    p_up, p_dn = d.loc[m, 'up50'].mean(), d.loc[m, 'down33'].mean()
    e_up, e_dn = d.loc[m, 'day_up'].mean(), d.loc[m, 'day_dn'].mean()
    return {'n': n, 'share': n / len(d), 'p_up': p_up, 'p_dn': p_dn, 'lift_up': p_up / d['up50'].mean(), 'lift_dn': p_dn / d['down33'].mean(),
            'adj_up': p_up / e_up if e_up > 0 else None, 'adj_dn': p_dn / e_dn if e_dn > 0 else None}

res = {'src': src, 'set': meta['set'], 'stocks': int(df['code'].nunique()), 'windows': N, 'dates': [df['date'].min(), df['date'].max()],
       'base_up': base_up, 'base_dn': base_dn, 'pos_n': int(pos.sum()),
       'periods': {k: {'windows': int(len(g)), 'base_up': g['up50'].mean(), 'base_dn': g['down33'].mean(), 'dates': [g['date'].min(), g['date'].max()]} for k, g in df.groupby('p2')},
       'shapes': []}
# 가장 이른 초입(출발일이 이어지는 덩어리의 첫날) — 회사마다 i 가 이어지는지 본다
df = df.sort_values(['code', 'i'])
prev_same = (df['code'] == df['code'].shift(1)) & (df['i'] == df['i'].shift(1) + 1)
first = (df['up50'] == 1) & ~(prev_same & (df['up50'].shift(1) == 1))
df['first'] = first
res['first_n'] = int(first.sum())

rng = np.random.default_rng(20261006)
codes = df['code'].unique()
by_code = {c: g for c, g in df.groupby('code')}
B = 500
boots = []
for b in range(B):
    pick = rng.choice(codes, size=len(codes), replace=True)
    boots.append(pick)

for s in SH:
    st = stats(df, s)
    st['id'] = s
    st['name'] = next(x['name'] for x in meta['shapes'] if x['id'] == s)
    st['text'] = next(x['text'] for x in meta['shapes'] if x['id'] == s)
    st['site'] = next(x['site'] for x in meta['shapes'] if x['id'] == s)
    st['in_pos'] = df.loc[pos, s].mean()          # 출발일 가운데 그 모양
    st['in_neg'] = df.loc[~pos, s].mean()         # 보통 날 가운데 그 모양
    st['in_first'] = df.loc[df['first'], s].mean()  # 가장 이른 초입 가운데
    st['gap'] = st['in_pos'] - st['in_neg']
    st['periods'] = {('p2' if k else 'p1'): stats(g, s) for k, g in df.groupby('p2')}
    res['shapes'].append(st)

# 회사를 다시 뽑아 흔들림 폭 — 같은 날 견준 배수(adj_up · adj_dn)
codes_arr = df['code'].values
idx_by_code = {c: np.flatnonzero(codes_arr == c) for c in codes}
up = df['up50'].values.astype(float); dn = df['down33'].values.astype(float); dup = df['day_up'].values; ddn = df['day_dn'].values
M = {s: df[s].values.astype(bool) for s in SH}
acc = {s: {'adj_up': [], 'adj_dn': []} for s in SH}
for pick in boots:
    ix = np.concatenate([idx_by_code[c] for c in pick])
    for s in SH:
        m = M[s][ix]
        if m.sum() == 0:
            continue
        acc[s]['adj_up'].append(up[ix][m].mean() / dup[ix][m].mean())
        acc[s]['adj_dn'].append(dn[ix][m].mean() / ddn[ix][m].mean())
for st in res['shapes']:
    for k in ('adj_up', 'adj_dn'):
        v = np.array(acc[st['id']][k])
        st[k + '_ci90'] = [float(np.quantile(v, 0.05)), float(np.quantile(v, 0.95))] if len(v) else None

# 사이트 태양과 같은 잣대로 「초입 공통 모양」(출발일의 50% 넘게 · 보통 날보다 10%p 넘게 · 셋이 안 되면 차이 큰 순 셋까지)
srt = sorted(res['shapes'], key=lambda x: -x['gap'])
common = [x['id'] for x in srt if x['in_pos'] > 0.5 and x['gap'] > 0.10]
rule = 'site'
if len(common) < 3:
    common = [x['id'] for x in srt[:3]]
    rule = 'top3_by_gap'
allm = np.ones(len(df), dtype=bool)
for s in common:
    allm &= df[s].values.astype(bool)
df['combo'] = allm.astype(int)
cst = stats(df, 'combo')
cst['periods'] = {('p2' if k else 'p1'): stats(g, 'combo') for k, g in df.groupby('p2')}
res['common'] = {'ids': common, 'rule': rule, **cst, 'in_pos': df.loc[pos, 'combo'].mean(), 'in_neg': df.loc[~pos, 'combo'].mean()}

def clean(o):
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [clean(v) for v in o]
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.bool_,)):
        return bool(o)
    return o
json.dump(clean(res), open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# 화면 확인용 짧은 표
print(f"{res['set']}: 회사 {res['stocks']} · 날 {N} · 기간 {res['dates']} · 출발일 비율 {base_up:.3f} · 크게 떨어짐 비율 {base_dn:.3f} · 첫날 {res['first_n']}")
for k, v in res['periods'].items():
    print('  시기', 'p2' if k else 'p1', v['dates'], f"날 {v['windows']} 출발일 {v['base_up']:.3f} 떨어짐 {v['base_dn']:.3f}")
print('모양 | 출발일중 | 보통날중 | 차이 | 첫날중 | 그모양뒤오름 | 배수 | 같은날배수(90%) | 그모양뒤떨어짐 | 같은날떨어짐배수(90%) | p1배수 p2배수')
for x in srt:
    p = x['periods']
    print(f"{x['name']:<10} | {x['in_pos']:.2f} | {x['in_neg']:.2f} | {x['gap']:+.2f} | {x['in_first']:.2f} | {x.get('p_up', float('nan')):.3f} | {x.get('lift_up', float('nan')):.2f} | {x['adj_up']:.2f} ({x['adj_up_ci90'][0]:.2f}~{x['adj_up_ci90'][1]:.2f}) | {x.get('p_dn', float('nan')):.3f} | {x['adj_dn']:.2f} ({x['adj_dn_ci90'][0]:.2f}~{x['adj_dn_ci90'][1]:.2f}) | {p.get('p1', {}).get('adj_up', float('nan')):.2f} {p.get('p2', {}).get('adj_up', float('nan')):.2f}")
c = res['common']
print('초입 공통 모양', c['ids'], c['rule'], f"n {c['n']} 출발일중 {c['in_pos']:.2f} 보통날중 {c['in_neg']:.2f} 오름 {c.get('p_up', float('nan')):.3f} 배수 {c.get('lift_up', float('nan')):.2f} 같은날 {c.get('adj_up', float('nan')):.2f} 떨어짐 {c.get('p_dn', float('nan')):.3f} 같은날떨어짐 {c.get('adj_dn', float('nan')):.2f}")
