#!/usr/bin/env python3
"""ATLAS 11 · 「지난 6개월 앞서 달린 곳」 따로 세기(파이썬) — lib/atlas11/lead6.mjs 코드를 쓰지 않고 공부 코드(scripts/atlas11/study/third_way_20y.py)의 셈 방법으로 처음부터 다시 센다
  사장님 2026-10-06 14:55 「해」 — 지도 탭 접힌 상자 「지난 6개월 앞서 달린 곳」
  다시 세는 것: 회사마다 120거래일 변화 · 업종마다 같은 무게 하루 오르내림 지수의 120거래일 변화 · 위 20% 표시(업종 · 회사) · 두 겹 · 지수 자리(250거래일)
  쓰는 법: python3 scripts/atlas11/lead6_check.py <input.json> <view 폴더(board.json 이 있는 곳)> <지수 쌓아 둔 파일> [kr|us]
  결과: 다른 것이 하나라도 있으면 「다른 것이 있음」과 함께 끝값 1
"""
import json, sys
import numpy as np
import pandas as pd

INP, VIEW, MARKET = sys.argv[1:4]
PLACE = sys.argv[4] if len(sys.argv) > 4 else 'kr'
DAYS, TOP, YEAR = 120, 0.2, 250
JUMP = 0.31 if PLACE == 'kr' else 0.50
inp = json.load(open(INP, encoding='utf-8')); board = json.load(open(f'{VIEW}/board.json', encoding='utf-8'))
asof = board['asOf']
grp_of = {code: g['id'] for g in board['groups'] for code in g['codes']}

# 회사마다 확정 종가 줄(판 날짜까지 · finalClose 가 false 인 줄은 뺌)
series = {}
for a in inp['assets']:
    rows = [p for p in a.get('prices', []) if isinstance(p.get('close'), (int, float)) and p['close'] > 0 and p.get('finalClose') is not False and str(p.get('date', '')) <= asof]
    rows.sort(key=lambda p: p['date'])
    series[a['code']] = (np.array([p['date'] for p in rows]), np.array([p['close'] for p in rows], dtype=float))
all_dates = np.unique(np.concatenate([d for d, _ in series.values()]))
pos = {d: i for i, d in enumerate(all_dates)}; ND = len(all_dates)

def company_change(c):
    if len(c) < DAYS + 1: return np.nan
    w = c[-(DAYS + 1):]; r = w[1:] / w[:-1] - 1
    return np.nan if (np.abs(r) > JUMP).any() else w[-1] / w[0] - 1

def group_index(codes):  # 공부 코드(third_way_20y.py group_index)와 같은 방법 — 그 날 3곳 넘게일 때만 · 한도 넘는 날은 뺌
    S, C = np.zeros(ND), np.zeros(ND)
    for code in codes:
        d, c = series[code]; r = c[1:] / c[:-1] - 1; ok = np.abs(r) <= JUMP
        p = np.array([pos[x] for x in d[1:]])[ok]; S[p] += r[ok]; C[p] += 1
    idx = np.full(ND, np.nan); v = 100.0
    for i in range(ND):
        if C[i] >= 3: v *= 1 + S[i] / C[i]; idx[i] = v
    return idx

cm = pd.Series({code: company_change(c) for code, (_, c) in series.items()})
gm = pd.Series({g['id']: (lambda I: I[-1] / I[-1 - DAYS] - 1)(group_index(g['codes'])) for g in board['groups']})
crk = cm.dropna().rank(pct=True); grk = gm.dropna().rank(pct=True) if gm.notna().sum() >= 10 else pd.Series(dtype=float)
c_lead = {k: bool(crk.get(k, 0) >= 1 - TOP) for k in cm.index}; g_lead = {k: bool(grk.get(k, 0) >= 1 - TOP) for k in gm.index}

out, ok = [], True
def same(name, a, b, tol=1e-6):
    global ok
    s = (a == b) if not isinstance(a, float) else (abs(a - b) <= tol * max(1, abs(b)))
    ok &= bool(s); out.append(f"{name}: 파이썬 {a} · 판 {b} → {'같음' if s else '다름!'}")
bc = {c['code']: c for c in board['companies']}; bg = {g['id']: g for g in board['groups']}
diff_c = [k for k in cm.index if not ((np.isnan(cm[k]) and bc[k]['change120'] is None) or (bc[k]['change120'] is not None and abs(cm[k] - bc[k]['change120']) <= 1e-6))]
diff_g = [k for k in gm.index if not ((np.isnan(gm[k]) and bg[k]['change120'] is None) or (bg[k]['change120'] is not None and abs(gm[k] - bg[k]['change120']) <= 1e-6))]
same('회사 120거래일 변화가 다른 곳 수', len(diff_c), 0); same('업종 120거래일 변화가 다른 곳 수', len(diff_g), 0)
same('위 20% 회사 수', sum(c_lead.values()), board['lead6']['lead']['companies']); same('위 20% 업종 수', sum(g_lead.values()), board['lead6']['lead']['groups'])
same('위 20% 회사 표시가 다른 곳 수', sum(1 for k in c_lead if c_lead[k] != bc[k]['lead6']), 0); same('위 20% 업종 표시가 다른 곳 수', sum(1 for k in g_lead if g_lead[k] != bg[k]['lead6']), 0)
both = sum(1 for k in c_lead if c_lead[k] and g_lead.get(grp_of[k]))
same('두 겹 회사 수', both, board['lead6']['lead']['both'])
# 지수 자리
mk = json.load(open(MARKET, encoding='utf-8')); rows = sorted([r for r in mk['rows'] if r['date'] <= asof], key=lambda r: r['date'])
w = rows[-YEAR:]; hi = max(w, key=lambda r: (r['close'], -int(r['date'].replace('-', ''))))  # 같은 값이면 앞 날
gap = w[-1]['close'] / hi['close'] - 1; ix = board['lead6']['index'] or {}
same('지수 마지막 날', w[-1]['date'], ix.get('date')); same('지수 가장 높던 날', hi['date'], ix.get('highDate')); same('지수 자리', float(gap), float(ix.get('gap', np.nan)))
print('\n'.join(out)); print('모두 같음' if ok else '다른 것이 있음')
sys.exit(0 if ok else 1)
