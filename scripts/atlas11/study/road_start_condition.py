#!/usr/bin/env python3
"""ATLAS 11 공부 · 「대세 상승 초입의 출목표」 둘째 셈 — 흔들림이 같은 것끼리 견주기
  첫 셈(road_start_analyze.py)에서 초입에 많은 모양이 모두 「크게 떨어짐」도 함께 늘렸다 → 그 모양이 알려 주는 것이 「오를 쪽」인지 「크게 움직임」인지 가른다
  흔들림 = 20거래일 동그라미 수 × 한 칸 크기(%) ≈ 그 사이 날마다 움직인 폭의 합 · 다섯 층(낮음 ~ 높음)으로 나눔(층마다 날 수가 같게)
  ① 층마다: 출발일 비율 · 크게 떨어짐 비율
  ② 같은 층끼리 견준 모양마다의 배수(층마다 「그 모양 뒤 비율 ÷ 그 층 보통 비율」을 날 수로 가중 평균)
  ③ 이미 오른 정도(지난 20거래일 변화) 다섯 층 × 흔들림 다섯 층 — 같은 흔들림에서 「이미 오른 출목표」가 더 크게 오르는가
  쓰는 법: python3 scripts/atlas11/study/road_start_condition.py <모양표.csv.gz> <결과.json>
"""
import json, sys
import numpy as np
import pandas as pd

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(src.replace('.csv.gz', '') + '.meta.json', encoding='utf-8'))
SH = [s['id'] for s in meta['shapes']]
NAME = {s['id']: s['name'] for s in meta['shapes']}
df = pd.read_csv(src, dtype={'code': str, 'date': str})
df['mv'] = (df['up'] + df['down']) * df['unit'] * 100  # 20거래일 움직임 합(%)
df['vq'] = pd.qcut(df['mv'].rank(method='first'), 5, labels=False)
df['rq'] = pd.qcut(df['ret20'].rank(method='first'), 5, labels=False)
res = {'set': meta['set'], 'windows': int(len(df))}
lv = []
for q, g in df.groupby('vq'):
    lv.append({'q': int(q), 'mv_lo': float(g['mv'].min()), 'mv_hi': float(g['mv'].max()), 'mv_med': float(g['mv'].median()), 'n': int(len(g)), 'p_up': float(g['up50'].mean()), 'p_dn': float(g['down33'].mean())})
res['vol_levels'] = lv
base_q = df.groupby('vq')[['up50', 'down33']].mean()
rows = []
for s in SH:
    m = df[s] == 1
    if m.sum() == 0:
        continue
    g = df[m]
    cnt = g.groupby('vq').size()
    pu = g.groupby('vq')['up50'].mean(); pd_ = g.groupby('vq')['down33'].mean()
    w = cnt / cnt.sum()
    lu = float((w * (pu / base_q['up50'].reindex(pu.index))).sum())
    ld = float((w * (pd_ / base_q['down33'].reindex(pd_.index))).sum())
    rows.append({'id': s, 'name': NAME[s], 'n': int(m.sum()), 'vol_mix': {int(k): float(v) for k, v in w.items()}, 'within_up': lu, 'within_dn': ld})
res['within'] = rows
grid = []
for (vq, rq), g in df.groupby(['vq', 'rq']):
    grid.append({'vq': int(vq), 'rq': int(rq), 'n': int(len(g)), 'p_up': float(g['up50'].mean()), 'p_dn': float(g['down33'].mean()), 'ret_med': float(g['ret20'].median())})
res['vol_x_ret'] = grid
res['ret_levels'] = [{'rq': int(q), 'lo': float(g['ret20'].min()), 'hi': float(g['ret20'].max()), 'p_up': float(g['up50'].mean()), 'p_dn': float(g['down33'].mean())} for q, g in df.groupby('rq')]
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f"{res['set']} 날 {res['windows']}")
print('흔들림 층 | 20일 움직임 합(%) | 출발일 비율 | 크게 떨어짐 비율')
for x in lv:
    print(f"  {x['q']} | {x['mv_lo']:.0f}~{x['mv_hi']:.0f} (가운데 {x['mv_med']:.0f}) | {x['p_up']:.3f} | {x['p_dn']:.3f}")
print('모양 | 같은 흔들림끼리 오름 배수 | 떨어짐 배수 | 흔들림 층 섞임(0낮음~4높음)')
for r in sorted(rows, key=lambda r: -r['within_up']):
    mix = ' '.join(f"{r['vol_mix'].get(k, 0):.2f}" for k in range(5))
    print(f"  {r['name']:<10} | {r['within_up']:.2f} | {r['within_dn']:.2f} | {mix}")
print('이미 오른 정도 층(0 가장 내림 ~ 4 가장 오름) × 흔들림 층 — 출발일 비율 / 크게 떨어짐 비율')
for vq in range(5):
    cells = [x for x in grid if x['vq'] == vq]
    print(f"  흔들림 {vq}: " + ' | '.join(f"r{x['rq']} {x['p_up']:.2f}/{x['p_dn']:.2f}" for x in sorted(cells, key=lambda x: x['rq'])))
print('이미 오른 정도 층만:', ' | '.join(f"r{x['rq']}({x['lo']:+.2f}~{x['hi']:+.2f}) {x['p_up']:.3f}/{x['p_dn']:.3f}" for x in res['ret_levels']))
