#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ATLAS 11 · 매수 검토 후보 5판(기르기판) 따로 세기 — 사장님 2026-10-09 15:21 「만들어 줘」
  판 읽기(lens.json · lib/atlas11/cand.mjs)가 낸 1년 추세 · 그물 기준선 · 그물 · 초입 · 7곳 차례를
  입력 종가(public/data/input.json)와 거래일 달력(input.calendar · public/data/rolling-calendar.json)으로 파이썬(넘파이)에서 따로 셈해 맞댄다.
  · 1년 추세 = 20거래일 전 종가 ÷ 252거래일 전 종가 − 1 · 그날 종가가 있어야 · 소수 넷째 자리(자바스크립트 Math.round 와 같게 floor(x·10⁴ + 0.5)/10⁴)
  · 그물 = 셀 수 있는 곳 가운데 상위 20%(numpy.quantile 기본 = 직선 보간) · 초입 = 오늘 그물 안 · 20거래일 전 그물 밖
  · 기준(그날 종가 · 흑자 · 위험 공시 없음)은 공시 원문이 필요해 판 읽기 조건(flags 앞 셋)을 그대로 씀 — 가격 셈만 따로
  python3 -I scripts/atlas11/verify/cand_grow_verify.py [--lens dist/data/atlas11/view/lens.json] [--out 파일]
  · 판 읽기(lens.json)는 package.mjs 가 dist 에 만든다(public 에는 없음) — 기본값 = dist
"""
import json, math, sys, os
import numpy as np

root = os.getcwd()
args = sys.argv[1:]
lens_path = args[args.index('--lens') + 1] if '--lens' in args else os.path.join(root, 'dist/data/atlas11/view/lens.json')
out_path = args[args.index('--out') + 1] if '--out' in args else None
inp = json.load(open(os.path.join(root, 'public/data/input.json'), encoding='utf-8'))
cal = {}
try:
    cal = json.load(open(os.path.join(root, 'public/data/rolling-calendar.json'), encoding='utf-8'))
except Exception:
    pass
L = json.load(open(lens_path, encoding='utf-8'))
C = L.get('cand') or {}
ses = sorted(set([d for d in (inp.get('calendar') or {}).get('sessions', []) if isinstance(d, str)] + [d for d in cal.get('sessions', []) if isinstance(d, str)]))
asof = L.get('asOf')
k0 = ses.index(asof) if asof in ses else -1
px = {}
for a in inp.get('assets', []):
    m = {}
    for p in a.get('prices') or []:
        c = p.get('close')
        if isinstance(c, (int, float)) and c > 0 and p.get('date'):
            m[p['date']] = c
    px[str(a['code'])] = m
codes = [s['code'] for s in L.get('stocks', [])]

def r4(v):
    return math.floor(v * 1e4 + 0.5) / 1e4

def trend(code, k):
    if k < 252 or k >= len(ses):
        return None
    m = px.get(code, {})
    c0, a, b = m.get(ses[k]), m.get(ses[k - 252]), m.get(ses[k - 20])
    if c0 is None or a is None or b is None or a <= 0:
        return None
    return r4(b / a - 1)

res = {'asOf': asof, 'rules': C.get('rules'), 'checks': {}}
ok_all = True
def chk(name, ok, detail=None):
    global ok_all
    res['checks'][name] = {'match': bool(ok), **({'detail': detail} if detail is not None and not ok else {})}
    ok_all = ok_all and bool(ok)

if not C.get('ready') or C.get('rules') != 'cand-rules-5' or k0 < 272:
    chk('ready', False, {'ready': C.get('ready'), 'rules': C.get('rules'), 'k0': k0})
else:
    m = {c: trend(c, k0) for c in codes}
    mp = {c: trend(c, k0 - 20) for c in codes}
    G = C.get('grow') or {}
    lm = G.get('m') or {}
    bad = [c for c in codes if (lm.get(c) or [None, None])[0] != m[c] or (lm.get(c) or [None, None])[1] != mp[c]]
    chk('trend_values', not bad, bad[:5])
    vals = np.array([v for v in m.values() if v is not None]); valsp = np.array([v for v in mp.values() if v is not None])
    q = float(np.quantile(vals, 0.8)); qp = float(np.quantile(valsp, 0.8))
    chk('threshold', abs(q * 100 - (G.get('q') or 0)) < 1e-4, {'py': q * 100, 'lens': G.get('q')})
    net = {c for c in codes if m[c] is not None and m[c] >= q}
    prev = {c for c in codes if mp[c] is not None and mp[c] >= qp}
    flags = C.get('flags') or {}
    elig = {c for c in codes if str(flags.get(c, ''))[:3] == '111'}
    pool = C.get('pool') or {}
    chk('pool', pool.get('valid') == len(vals) and pool.get('net') == len(net) and pool.get('netElig') == len(net & elig) and pool.get('newc') == len((net - prev) & elig),
        {'py': [len(vals), len(net), len(net & elig), len((net - prev) & elig)], 'lens': [pool.get('valid'), pool.get('net'), pool.get('netElig'), pool.get('newc')]})
    order = sorted(net & elig, key=lambda c: (-m[c], c))
    chk('net_codes', order == G.get('netCodes'), {'py': order[:5], 'lens': (G.get('netCodes') or [])[:5]})
    gof = {s['code']: s.get('g') for s in L.get('stocks', [])}
    fresh = sorted((net - prev) & elig, key=lambda c: (-m[c], c))
    per, pick = {}, []
    for c in fresh:
        if len(pick) >= 7:
            break
        k = per.get(gof.get(c), 0)
        if k >= 3:
            continue
        per[gof.get(c)] = k + 1
        pick.append(c)
    items = [x['code'] for x in C.get('items', [])]
    planted = (G.get('planted') or {}).get('at')
    if planted == asof:
        chk('seven', items == pick, {'py': pick, 'lens': items})
    else:
        res['checks']['seven'] = {'match': None, 'note': f'담는 날 {planted} 기록 그대로 — 그날 값으로는 따로 세지 않음'}
    res.update({'q': round(q * 100, 4), 'net': len(net), 'netElig': len(net & elig), 'newc': len(fresh), 'seven': pick, 'planted': planted})
res['match'] = ok_all
txt = json.dumps(res, ensure_ascii=False, indent=1)
if out_path:
    open(out_path, 'w', encoding='utf-8').write(txt + '\n')
print(txt)
sys.exit(0 if ok_all else 1)
