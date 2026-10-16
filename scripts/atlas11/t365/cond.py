#!/usr/bin/env python3
"""새 ATLAS 조건 찾기 자료(cond.json · cd-v1) — 사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」(업데이트 탭 자리)
  모든 회사(mkt.json 회사 주식 모두)마다 「조건 하나 = 회사 하나의 성질」을 미리 셈 — 화면은 「그리고」로 거르고 · 세고 · 줄 세우기만(회사 파일 2,557개를 다 읽지 않게)
  재료 = 같은 자료 폴더의 사이트 자료만(site_build.py 가 만든 것 · 새로 받지 않음 · 앞날 값 없음):
    core.json(업종 77 · 1주 오른 업종 rise.list · 업종 방향 tr) · mkt.json(회사 · 업종 · 고른 곳 p) · comp.json(고른 곳 몸값) · co/<번호>.json(몸값 c.cap · 종가 close · 튐 jumps · 성적표 fin · key) · days.json(날짜)
  셈(결정표 docs/design/cond-2026-10-16/decision-v2.md — 바꾸면 새 판 이름):
    업종: w1 = 한 회사 한 표 지수 v 의 5거래일 % · wc1 = 큰 회사는 크게 cw 의 5거래일 % · rise = 첫 화면 「요즘 오르는 업종」 목록에 듦 · rc = 큰 회사가 오른 업종(wc1 로 같은 자 · 결정표 v2) · up/dn = 20거래일 방향(tr.d)
    회사: cap 몸값(억 원) · rk 업종 안 몸값 차례(큰 순 · 같으면 번호 작은 곳 · 업종에 몸값 모르는 곳이 있으면 그 업종 모두 null)
          r5 = 5거래일 % · x5 = 마지막 종가 × 100 ≥ 5거래일 전 종가 × 110(정수 견줌) · q5 = ? 까닭(0 없음 · 1 그 5거래일 안 하루 ±30.5% 넘게 바뀐 날 · 2 종가 없음)
          d15 = 지난 20거래일 하루 +15% 넘게 오른 날(종가 × 100 ≥ 앞날 × 115) · m30 = 20거래일 +30% 넘게(종가 × 10 ≥ 20거래일 전 × 13) — ? 는 q20(0 · 1 튐 · 2 종가 빔)
          f3 = 확정 결산 3해 순이익 모두 0 보다 큼(금융 밖은 영업이익도) · 빈 값이면 null · ls = 마지막 해 순이익 0 밑 · p = 고른 곳 · l5 = 5거래일 선(5거래일 전 = 1000)
  쓰는 법: python3 scripts/atlas11/t365/cond.py <자료 폴더>   (따로 세기 scripts/atlas11/t365/cond_verify.mjs)
"""
import json, os, sys

VERSION = 'cd-v1'
D = sys.argv[1]
J = lambda f: json.load(open(os.path.join(D, f), encoding='utf-8'))
core, mkt, comp, days = J('core.json'), J('mkt.json'), J('comp.json')['companies'], J('days.json')
DATES = days['dates']
asof = mkt['asOf']
if core['asOf'] != asof or DATES[-1] != asof:
    sys.exit('자료 날이 서로 다름 core %s · mkt %s · days %s' % (core['asOf'], asof, DATES[-1]))
N = len(DATES)


def num(x):
    return x if isinstance(x, (int, float)) and not isinstance(x, bool) and x == x else None


def r2(x):  # 화면과 같은 「반은 위로」 소수 둘째 — 파이썬 round(은행가 반올림)를 쓰지 않음
    s = 1 if x >= 0 else -1
    return s * int(abs(x) * 100 + 0.5 + 1e-9) / 100


IND = [i['name'] for i in core['industries']]
IX = {n: k for k, n in enumerate(IND)}
RISE = [x['name'] for x in core['rise']['list']]
ind = []
for i in core['industries']:
    v, cw = i['v'], i.get('cw')  # cw 가 없으면 「큰 회사가 오른 업종」은 모름(한 회사 한 표 선으로 바꿔 채우지 않음)
    w1 = r2((v[-1] / v[-6] - 1) * 100) if v[-1] is not None and v[-6] else None
    wc1 = r2((cw[-1] / cw[-6] - 1) * 100) if cw and len(cw) >= 6 and cw[-1] is not None and cw[-6] else None
    d = (i.get('tr') or {}).get('d')
    ind.append({'n': i['name'], 'w1': w1, 'wc1': wc1, 'rise': 1 if i['name'] in RISE else 0, 'up': 1 if d == 'up' else 0, 'dn': 1 if d == 'down' else 0, 'k': i['n']})
# 큰 회사가 오른 업종(결정표 v2 #4 — 반대 토론: 「오르는 업종 대장주인데 왜 다 파래」 · 거래소 업종 지수처럼 몸값 무게) = 「요즘 오르는 업종」과 같은 자(5거래일 · +0.05% 이상 · 많이 오른 순 · 같으면 이름 차례 · 11개까지)를 큰 회사는 크게 선(cw)에 씀
#   rc = 1 듦 · 0 안 듦 · None 모름(cw 값이 빔)
RC_DAYS, RC_MAX, RC_MIN = 5, 11, 0.05
_rc = sorted([(x['n'], x['wc1']) for x in ind if x['wc1'] is not None and x['wc1'] >= RC_MIN], key=lambda t: (-t[1], t[0]))[:RC_MAX]
_rcn = {n for n, _ in _rc}
for x in ind:
    x['rc'] = None if x['wc1'] is None else (1 if x['n'] in _rcn else 0)

codes = sorted(mkt['companies'])
col = {k: [] for k in ('c', 'i', 'cap', 'rk', 'r5', 'x5', 'q5', 'd15', 'm30', 'q20', 'f3', 'ls', 'p', 'l5')}
CO = {}
for c in codes:
    co = json.load(open(os.path.join(D, 'co', c + '.json'), encoding='utf-8'))
    CO[c] = co
for c in codes:
    m, co = mkt['companies'][c], CO[c]
    cc = comp.get(c) or co.get('c') or {}
    cap = num(cc.get('cap'))
    cl = co.get('close') or []
    k0 = co.get('k0') or 0
    full = [None] * k0 + list(cl)  # days.json 날짜와 같은 자리
    full = (full + [None] * N)[:N]
    jumps = {d for d, _ in (co.get('jumps') or [])}
    a, b = full[-1], full[-6]
    if a is None or b is None:
        r5, x5, q5, l5 = None, None, 2, None
    elif any(d in jumps for d in DATES[-5:]):
        r5, x5, q5, l5 = r2((a / b - 1) * 100), None, 1, None
    else:
        r5, x5, q5 = r2((a / b - 1) * 100), 1 if a * 100 >= b * 110 else 0, 0
        l5 = [None if x is None else int(x * 1000 / b + 0.5) for x in full[-6:]]
    w20 = full[-21:]
    if any(x is None for x in w20):
        d15, m30, q20 = None, None, 2
    elif any(d in jumps for d in DATES[-20:]):
        d15, m30, q20 = None, None, 1
    else:
        d15 = 1 if any(w20[t] * 100 >= w20[t - 1] * 115 for t in range(1, 21)) else 0
        m30 = 1 if w20[-1] * 10 >= w20[0] * 13 else 0
        q20 = 0
    fin = co.get('fin') or {}
    net, op = fin.get('net') or [], fin.get('op') or []
    isfin = co.get('key') == 'net'
    if len(net) == 3 and all(num(x) is not None for x in net) and (isfin or (len(op) == 3 and all(num(x) is not None for x in op))):
        f3 = 1 if all(x > 0 for x in net) and (isfin or all(x > 0 for x in op)) else 0
    else:
        f3 = None
    ls = None if not net or num(net[-1]) is None else (1 if net[-1] < 0 else 0)
    for k, v in (('c', c), ('i', IX[m['i']]), ('cap', None if cap is None else int(round(cap))), ('rk', None), ('r5', r5), ('x5', x5), ('q5', q5), ('d15', d15), ('m30', m30), ('q20', q20), ('f3', f3), ('ls', ls), ('p', 1 if m.get('p') else 0), ('l5', l5)):
        col[k].append(v)
# 업종 안 몸값 차례 — 큰 순 · 같으면 번호 작은 곳 · 그 업종에 몸값 모르는 곳이 하나라도 있으면 그 업종 모두 null(대장을 못 정함)
by = {}
for j, c in enumerate(codes):
    by.setdefault(col['i'][j], []).append(j)
for i, js in by.items():
    if any(col['cap'][j] is None for j in js):
        continue
    for r, j in enumerate(sorted(js, key=lambda j: (-col['cap'][j], codes[j])), 1):
        col['rk'][j] = r
out = {'schema': 'atlas-new-cond-1', 'version': VERSION, 'asOf': asof, 'd5': DATES[-6], 'd20': DATES[-21], 'provisional': bool(core.get('provisional')), 'n': len(codes), 'ind': ind, 'co': col}
with open(os.path.join(D, 'cond.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
print(json.dumps({'n': len(codes), 'bytes': os.path.getsize(os.path.join(D, 'cond.json')), 'rise': sum(x['rise'] for x in ind), 'rc': sum(1 for x in ind if x['rc'] == 1), 'up': sum(x['up'] for x in ind),
                  'x5': sum(1 for x in col['x5'] if x == 1), 'q5': sum(1 for x in col['q5'] if x), 'f3': sum(1 for x in col['f3'] if x == 1), 'f3q': sum(1 for x in col['f3'] if x is None), 'noRank': sum(1 for x in col['rk'] if x is None)}, ensure_ascii=False))
