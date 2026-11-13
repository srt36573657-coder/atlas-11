#!/usr/bin/env python3
"""수르 21곳 — 한국 상장 회사 모두 → 우량주 365곳 → 불장 7 · 꽃이 될 7 · 돈이 몰리는 7(주문 2044 · 사장님 2026-11-04 15:44(+04) 「수르 전면 개편 명령서」)
  [1. 수르가 하는 일은 셋뿐이다] 1. 한국 상장 종목 전체를 세어 적어라 2. 그 가운데 우량주 365곳을 먼저 골라라 3. 우량주 기준은 이전 기록 것을 먼저 써라
  4. 365곳 안에서 불장 종목 7곳 5. 꽃이 될 종목 7곳 6. 돈이 몰리는 종목 7곳 7. 두 곳에 걸린 종목은 겹쳤다고 표시해라
  우량주 365 = 지금 사이트가 내는 판(n365-v1 · /data/atlas11/view/board.json · 2026-10-05 사장님 「지금 180개를 365개로 한다」 · lib/atlas11/universe.mjs —
    두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래(금융은 빚 셈 빼고) · 업종마다 5곳 · 73업종)
  불장 = 그 판의 「불장 업종」(지난 20거래일 365곳 업종 평균이 오른 업종 · 큰 순 11까지) 안 회사 가운데 20거래일 오른 만큼 큰 순 · 업종마다 둘까지 · 값이 늦은 회사 뺌
  꽃이 될 = 365곳 가운데 「싹」(theme-co z=S — 한 달 앞선 만큼 5 아래 · 닷새 동안 시장에 뒤지지 않음)이고 회사 크기가 위 20 안(cond.cap) · 업종 앞선 만큼 큰 순 → 회사 앞선 만큼 큰 순
    (꽃 조건 전부 — 업종이 한 달 동안 시장보다 15 넘게 — 를 다 채운 회사가 0곳이면 「가장 가까운 7곳」이라고 적음)
  돈이 몰리는 = 한 달 동안 시장보다 더 오른 업종(theme.json x>0) 큰 순 → 업종마다 365곳 가운데 20거래일 동안 회사 크기가 원으로 가장 많이 는 회사 하나 · 하루 35 넘는 움직임 뺌
  쓰는 법: python3 scripts/atlas11/next/su21.py --live <사이트 받은 곳(atlas/data · next/data)> --repo <저장소> --out site/su/data/su21.json
  숫자는 모두 받은 자료 그대로 — 지어낸 숫자 없음 · 빈 칸은 None(화면 「확인 필요」)"""
import json, sys, collections, datetime, argparse

ap = argparse.ArgumentParser()
ap.add_argument('--live', required=True); ap.add_argument('--repo', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--mc365', action='store_true') # 몬테카를로를 365곳 모두에(올릴 때 · 주문 0854 · 1422) — 셈 값은 같고 「365곳 모두 셌다」 수만 더함
ap.add_argument('--top3', action='store_true') # 42칸 1등 · 2등 · 3등 — 몬테카를로 1억 번 · 소거 1억 번(올릴 때 · 주문 1422 · 지난 판 다시 세기는 빼고)
ap.add_argument('--vol', default=None) # 주문 1113-2033 — 네이버 일봉 [날, 종가, 거래량](su21_vol.mjs · 올리기 작업만) → 특징 열하나 가운데 거래량 넷
A = ap.parse_args()
J = lambda p: json.load(open(p, encoding='utf-8'))
b = J(A.repo + '/public/data/atlas11/view/board.json')
mkt = J(A.live + '/atlas/data/mkt.json'); MK = mkt['companies']
tco = J(A.live + '/next/data/theme-co.json')['co']
th = J(A.live + '/next/data/theme.json')
cond = J(A.live + '/atlas/data/cond.json')
cap = {c: cond['co']['cap'][k] for k, c in enumerate(cond['co']['c'])}
lands = J(A.repo + '/scripts/atlas11/t365/groups.json')['groups']
IND = {i['n']: i for i in th['inds']}
B = {c['code']: c for c in b['companies']}
late = {x['code'] for x in b['late']}
nm = lambda c: (MK.get(c) or {}).get('n') or B[c]['name']
r1 = lambda v: None if v is None else round(v, 1)
r2 = lambda v: None if v is None else round(v, 2)
SRC_P = '네이버 증권 그날 마지막 값 · 큐피트가 셈'

_CO = {}
def co_of(c):
    # 회사 자료(atlas/data/co/<번호>.json) — 한 번만 읽음
    if c not in _CO:
        try: _CO[c] = J(A.live + '/atlas/data/co/' + c + '.json')
        except Exception: _CO[c] = None
    return _CO[c]
try: DATES = J(A.live + '/atlas/data/days.json')['dates']
except Exception: DATES = []
_OPEN = {}
def opens(c):
    # 수르 회사 쪽이 열리는 회사만 고름 — 회사 자료(atlas/data/co/<번호>.json)에 c 칸(이름 · 시장)이 있어야 그 쪽을 그림
    # (2026-11-05 진짜 사이트 검사 — 올릴 때 다시 센 꽃 칸의 F&F 383220 은 c 칸이 없어 「찾지 못했어요」 · 주문 0054 [2] 4 「누르면 왜 여기 있나 먼저」)
    if c not in _OPEN:
        co = co_of(c)
        _OPEN[c] = isinstance(co.get('c'), dict) if isinstance(co, dict) else False
    return _OPEN[c]

def per2(lst, k=7, per=2):
    out, cnt = [], collections.Counter()
    for c in lst:
        g = B[c]['group']['label']
        if cnt[g] >= per: continue
        cnt[g] += 1; out.append(c)
        if len(out) == k: break
    return out

# ① 불장
hot = {i['id']: i for i in b['hot']['items']}
f1 = sorted([c for c, v in B.items() if v['group']['id'] in hot and c not in late and v.get('change20') is not None and v['change20'] > 0 and opens(c)], key=lambda c: (-B[c]['change20'], c))
HOT = per2(f1)
# ② 꽃이 될
caps = sorted(v for v in cond['co']['cap'] if v and v > 0); n = len(caps)
thr = caps[next(r for r in range(n) if (r + 1) / n >= 0.8)]
spr = [c for c in B if c in tco and tco[c][2] == 'S' and (cap.get(c) or 0) >= thr and opens(c)]
full = [c for c in spr if (IND.get(MK.get(c, {}).get('i'), {}).get('x') or -1e9) >= 15]
ix = lambda c: IND.get(MK.get(c, {}).get('i'), {}).get('x')
spr.sort(key=lambda c: (-(ix(c) if ix(c) is not None else -1e9), -tco[c][0], c))
BLOOM = (full + [c for c in spr if c not in full])[:7]
# ③ 돈이 몰리는
def gain(c):
    l = (MK.get(c) or {}).get('l') or []
    if len(l) != 21 or not cap.get(c) or any(x is None or x <= 0 for x in l): return None
    if any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): return None
    if all(x == l[0] for x in l): return None
    return cap[c] * (1 - l[0] / l[-1])
MONEY, mrow = [], {}
for i in sorted([i for i in th['inds'] if i.get('x') is not None and i['x'] > 0], key=lambda i: -i['x']):
    g = sorted([(gain(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain(c) is not None and opens(c)], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0:
        MONEY.append(g[0][1]); mrow[g[0][1]] = (i, round(g[0][0]))
    if len(MONEY) == 7: break

# ④ 될 듯 셋(주문 1103 · 사장님 2026-11-08 11:03 「불장이 될듯 한 종목 7개 · 돈이 몰릴듯 한 종목 7개 · 싹에서 꽃이 될듯 한 7개 추가하자」 · 11:08 「응」)
#   지난 1년(su_next_past.py · reports/atlas11/su-next/past.json)에 날마다 똑같이 대어 한 달 안에 그렇게 된 일이 가장 많은 셈 + 일곱이 안 되면 다음 셈으로 채움
#   불장이 될 듯(H5) = 불장 업종 안 20거래일 차례 8 ~ 14째(일곱 바로 아래) → 모자라면 닷새 막 오르기 시작한 곳(업종도 닷새 오름 · 닷새 큰 순)
#   돈이 몰릴 듯(M4) = 돈이 몰리는 일곱 바로 아래 업종(8 ~ 14째)마다 회사 크기가 가장 많이 는 곳 → 모자라면 일곱 밖 업종마다 닷새 동안 가장 많이 는 곳
#   꽃이 될 듯(B5) = 싹(한 달 시장보다 앞선 만큼 5 아래 · 닷새 뒤지지 않음) 가운데 닷새 시장보다 2 넘게 앞서고 20거래일 오른 곳 → 모자라면 크기 위 20 안 싹을 닷새 차례로
CL = {}
for c, v in B.items():
    l = v.get('c')
    if isinstance(l, list) and len(l) == 21 and all(isinstance(x, (int, float)) and x > 0 for x in l) and not any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): CL[c] = l
R20 = {c: l[-1] / l[0] - 1 for c, l in CL.items()}; R5 = {c: l[-1] / l[-6] - 1 for c, l in CL.items()}
avg = lambda xs: sum(xs) / len(xs) if xs else None
M20, M5 = avg(list(R20.values())), avg(list(R5.values()))
INDS = collections.defaultdict(list)
for c in CL: INDS[B[c]['group']['label']].append(c)
I5 = {i: avg([R5[c] for c in cs]) for i, cs in INDS.items()}
ok_n = lambda c: c in CL and c not in late and opens(c)
def per2k(lst, k=7, per=2):
    out, cnt = [], collections.Counter()
    for c in lst:
        if c in out: continue
        g = B[c]['group']['label']
        if cnt[g] >= per: continue
        cnt[g] += 1; out.append(c)
        if len(out) == k: break
    return out
hot14 = per2(f1, k=14)
h_main = [c for c in hot14 if c not in HOT and c in CL]
h_fill = sorted([c for c in CL if ok_n(c) and c not in HOT and R5[c] > 0 and R20[c] > 0 and (I5.get(B[c]['group']['label']) or 0) > 0], key=lambda c: (-R5[c], c))
HOTN = per2k(h_main + h_fill)
hrow = {c: ('rank', hot14.index(c) + 1) if c in h_main else ('five', None) for c in HOTN}
def gain5(c):
    l = (MK.get(c) or {}).get('l') or []
    if len(l) != 21 or not cap.get(c) or any(x is None or x <= 0 for x in l): return None
    if any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): return None
    return cap[c] * (1 - l[-6] / l[-1])
MONEYN, mnrow, seen, rank_inds = [], {}, 0, set()
for i in sorted([i for i in th['inds'] if i.get('x') is not None and i['x'] > 0], key=lambda i: -i['x']):
    g = sorted([(gain(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain(c) is not None and opens(c)], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0:
        seen += 1
        if seen > 7 and g[0][1] not in MONEY: MONEYN.append(g[0][1]); mnrow[g[0][1]] = ('rank', i, round(g[0][0]), seen); rank_inds.add(i['n'])
    if len(MONEYN) == 7 or seen >= 14: break
top7 = {mrow[c][0]['n'] for c in MONEY}
fill = []
for i in th['inds']:
    if i['n'] in top7 or i['n'] in rank_inds: continue
    g = sorted([(gain5(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain5(c) is not None and opens(c) and c not in MONEY and c not in MONEYN], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0: fill.append((g[0][0], g[0][1], i))
for gn, c, i in sorted(fill, key=lambda t: (-t[0], t[1])):
    if len(MONEYN) == 7: break
    MONEYN.append(c); mnrow[c] = ('five', i, round(gn), None)
X20 = {c: R20[c] - M20 for c in CL}; X5 = {c: R5[c] - M5 for c in CL}
sprN = [c for c in CL if ok_n(c) and X20[c] < 0.05 and X5[c] >= 0 and c not in BLOOM]
b_main = sorted([c for c in sprN if X5[c] >= 0.02 and R20[c] > 0], key=lambda c: (-X5[c], c))
b_fill = sorted([c for c in sprN if (cap.get(c) or 0) >= thr], key=lambda c: (-X5[c], c))
BLOOMN = per2k(b_main + b_fill)
try: PAST = J(A.repo + '/reports/atlas11/su-next/past.json')
except Exception: PAST = None
try: PASTC = J(A.repo + '/reports/atlas11/su-next/past-culture.json') # 문화 셈의 지난 1년(주문 1912 · su_culture_past.py) — 규칙이 같을 때만
except Exception: PASTC = None
try: PASTM = J(A.repo + '/reports/atlas11/su-next/past-mc.json') # 몬테카를로 차례 셈의 지난 1년(주문 1422 · su_mc_past.py) — 규칙이 같을 때만
except Exception: PASTM = None
try: PASTS = J(A.repo + '/reports/atlas11/su-next/past-strict.json') # 엄격 셈의 지난 1년(주문 0854 · su_strict_past.py) — 규칙이 같을 때만
except Exception: PASTS = None

# ⑤ 엄격 셈(주문 0854 · 사장님 2026-11-09 08:54 「몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로」 · 09:02 「어」 — 일곱이 안 되면 통과한 곳만)
#   ① 몬테카를로 — 365곳마다(--mc365 · 올릴 때) 지난 250거래일 하루 값을 10만 번 섞어 지금 모습이 우연으로는 잘 안 나오는 곳(스무 번에 한 번 아래)을 먼저 찾음
#   ② 그 가운데 묶음 셈(위 옛 셈 그대로 · 일곱)에 든 곳 → ③ 소거 기준 31가지 · 하나라도 걸리면 뺌 → 남은 곳만(차례 그대로 · 채우지 않음)
#   지난 1년에 대어 보니(su_strict_past.py) 옛 일곱을 이렇게 거르면 될 듯 셋 모두 한 달 안에 그렇게 된 몫이 옛 셈보다 많았음 — 더 깊은 차례로 채우면 오히려 줄어 채우지 않음
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
import su21_strict as ST
import numpy as _np
def co_close(c):
    co = co_of(c)
    if not isinstance(co, dict) or not DATES: return None
    cl, k0 = co.get('close'), co.get('k0')
    if not isinstance(cl, list) or not isinstance(k0, int): return None
    a = _np.full(len(DATES), _np.nan)
    for j, x in enumerate(cl):
        t = j + k0
        if 0 <= t < len(DATES) and isinstance(x, (int, float)) and x > 0: a[t] = x
    return a
def fin_of(c):
    co = co_of(c)
    if not isinstance(co, dict): return None
    f = dict(co.get('fin') or {}); f['_pbr'] = co.get('pbr')
    return f
CTX = ST.Ctx(B, b['asOf'], DATES, co_close, opens, cap, CL, lambda c: B[c]['group']['label'])
# ⑥ 주문 1422(사장님 2026-11-09 14:22 「돈 · 꽃 · 불장 찾는 조건을 처음에 365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고
#    42개를 찾은 것 중에서 다시 몬테카를로 다시 계산하여 이번 계산할 때는 1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기」)
#   ① 몬테카를로(su21_mc · 365곳 · 묶음마다 그 셈의 값이 지난 250거래일로 보아 얼마나 드문가) → ② 소거 한 번(묶음마다 기본 조건 = 아래 POOL)
#   → ③ 드문 차례로 일곱(업종마다 둘 · 돈 둘 = 업종마다 대장 하나) = 42칸 · ④ 42칸끼리 1억 번(su21_top3) → 1등 · 2등 · 3등
#   위 ① ~ ④(옛 셈)는 소거 조건과 까닭 값(hot · mrow · hrow · mnrow · R20 · X5 …)만 씀 — 차례는 몬테카를로
import su21_mc as MC
INDN = lambda c: B[c]['group']['label']
def rep_of(i):
    mem = [c for c in CL if INDN(c) == i['n']] or [c for c in B if INDN(c) == i['n']]
    return mem[0] if mem else None
def ind_order(inds, k):
    def key(i):
        c = rep_of(i); m = MC.mc(CTX, c, k) if c else {'p': None, 'stat': None}
        return (m['p'] is None, m['p'] if m['p'] is not None else 2, -(m['stat'] if m['stat'] is not None else -1e9), i['n'])
    return sorted(inds, key=key)
POOL, ORD = {}, {} # ORD = 묶음마다 소거를 지난 곳(돈 둘은 업종)의 차례(1부터) — 「왜?」 쪽 「차례 ○째」
def ordset(k, seq, key=lambda x: x): ORD[k] = {key(x): j + 1 for j, x in enumerate(seq)}
# ⑦ 주문 1912(사장님 2026-11-09 19:12 「한국에 주식하는 사람들에 특징 11가지를 에이전트 11개를 돌려서 찾아낸 다음 7가지에 정의를 내린 다음
#    42개에 종목을 찾아내는데 문화에 중심으로 세팅한 다음 42개를 다시 찾아내고 그중에 이전에 했던 몬테카를로 방식 소급법(소거법)을 더 진화시켜서 작업 해봐」)
#   한국 투자자 문화 일곱(su21_culture · 근거 docs/design/su-culture-2026-11-09/traits11.md) — 365곳마다 종가로 흔적을 잼
#   ① 소거 한 번(묶음마다 기본 조건 · 옛 그대로) → ② 문화로 뺌(빚투 쏠림 · 본전 버티기 — 일곱이 안 되면 뒤에 붙임) → ③ 문화 흔적이 많은 차례(테마 몰림 · 고점 앞 팔기)
#   → ④ 몬테카를로 차례(요즘 흔들림에 맞춘 길 · 불장이 될 듯 · 꽃이 될 듯은 365곳 모두의 길 = 크게 움직인 차례) · 돈 둘은 업종마다 국민주(몸집 위 열에 하나)를 대장으로 먼저
import su21_culture as CUL
CODES = sorted(B)
IXN = sorted(set(INDN(c) for c in CODES)); IXI = {n: i for i, n in enumerate(IXN)}
IXc = _np.array([IXI[INDN(c)] for c in CODES]); NIc = len(IXN)
CJ = {c: j for j, c in enumerate(CODES)}
_nan = float('nan')
l5v = _np.array([CTX.ret[5].get(c, _nan) for c in CODES]); l20v = _np.array([CTX.ret[20].get(c, _nan) for c in CODES])
with _np.errstate(invalid='ignore'):
    il5v = _np.array([_np.nanmean(l5v[IXc == i]) if _np.isfinite(l5v[IXc == i]).sum() >= 3 else _np.nan for i in range(NIc)]) - _np.nanmean(l5v)
    il20v = _np.array([_np.nanmean(l20v[IXc == i]) if _np.isfinite(l20v[IXc == i]).sum() >= 3 else _np.nan for i in range(NIc)]) - _np.nanmean(l20v)
capv = _np.array([cap.get(c) or _np.nan for c in CODES], float)
PM = _np.array([(lambda a: a if a is not None else _np.full(len(DATES), _np.nan))(co_close(c)) for c in CODES]) if DATES else None
CON, CVAL = CUL.traits(PM, IXc, NIc, capv, CTX.T, l5v, l20v, il5v, il20v) if PM is not None and CTX.T >= 271 else ({}, {})
def con(c, k):
    j = CJ.get(c)
    return bool(CON[k][j]) if CON and j is not None else False
def ccount(k, c): return sum(con(c, x) for x in CUL.POS[k])
def cbad(k, c): return any(con(c, x) for x in CUL.NEG[k])
def cfilt(k, lst):
    lst = list(dict.fromkeys(lst)); g = [c for c in lst if not cbad(k, c)]
    return g if len(g) >= 7 else g + [c for c in lst if cbad(k, c)]
def mkey(k, c):
    m = MC.mc(CTX, c, k)
    return (-ccount(k, c), m['p'] is None, m['p'] if m['p'] is not None else 2, -(m['stat'] if m['stat'] is not None else -1e9))
def lead(i, gfn, skip=()):
    g = sorted([(gfn(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gfn(c) is not None and opens(c) and c not in skip and c not in late], key=lambda t: (-t[0], t[1])) # 값이 늦은 회사는 뺌(그날 값 · 소거 한 번)
    gb = [x for x in g if x[0] > 0 and con(x[1], 'big')] # 국민주 쏠림 — 업종 안 몸집 위 열에 하나가 늘었으면 그 회사를 대장으로 먼저
    return gb[0] if gb else (g[0] if g and g[0][0] > 0 else None)
# 불장 = 불장 업종 안 · 20거래일 오른 회사(값 늦지 않음 · 회사 쪽 열림) → 문화로 뺌 → 신고가 · 테마 몰림이 많은 차례 → 20거래일 오른 만큼이 드문 차례
POOL['hot'] = list(f1)
_o = sorted(cfilt('hot', POOL['hot']), key=lambda c: (*mkey('hot', c), c)); ordset('hot', _o); HOT = per2(_o)
# 꽃이 될 = 싹(한 달 시장보다 앞선 만큼 5 아래 · 닷새 뒤지지 않음) · 회사 크기 위 20 → 문화로 뺌(빚투) → 테마 몰림 · 고점 앞 팔기가 많은 차례 → 그 업종이 20거래일 동안 시장보다 앞선 만큼이 드문 차례
POOL['bloom'] = [c for c in spr if c not in late] # 값이 늦은 회사는 뺌(그날 값)
_o = sorted(cfilt('bloom', POOL['bloom']), key=lambda c: (*mkey('bloom', c), -tco[c][0], c)); ordset('bloom', _o); BLOOM = _o[:7]
# 돈이 몰리는 = 한 달 동안 시장보다 더 오른 업종(x > 0) → 업종이 20거래일 동안 시장보다 앞선 만큼이 드문 차례 → 업종마다 국민주가 늘었으면 그 회사 · 아니면 20거래일 동안 회사 크기가 가장 많이 는 곳
MONEY, mrow = [], {}
POOL['money'] = [i for i in th['inds'] if i.get('x') is not None and i['x'] > 0]
_o = ind_order(POOL['money'], 'money'); ordset('money', _o, key=lambda i: i['n'])
for i in _o:
    g = lead(i, gain)
    if g: MONEY.append(g[1]); mrow[g[1]] = (i, round(g[0]))
    if len(MONEY) == 7: break
# 불장이 될 듯 = 불장 일곱 밖 · 닷새 오른 회사(불장 업종이거나 업종도 닷새 오름) → 문화로 뺌 → 고점 앞 팔기 · 테마 몰림(닷새) 먼저 → 365곳 모두의 길과 견줘 닷새 오른 만큼이 드문 차례
POOL['hotNext'] = [c for c in CL if ok_n(c) and c not in HOT and R5[c] > 0 and (B[c]['group']['id'] in hot or (I5.get(INDN(c)) or 0) > 0)]
_o = sorted(cfilt('hotNext', POOL['hotNext']), key=lambda c: (-ccount('hotNext', c), -CTX.ret[5].get(c, -9), c)); ordset('hotNext', _o); HOTN = per2k(_o)
hrow = {c: ('rank', hot14.index(c) + 1 if c in hot14 else None) if B[c]['group']['id'] in hot else ('five', None) for c in HOTN} # rank = 불장 업종 안(차례는 옛 오른 차례 · 참고) · five = 업종도 닷새 오름
# 돈이 몰릴 듯 = 돈 일곱 밖 업종 → 업종이 닷새 동안 시장보다 앞선 만큼이 드문 차례 → 업종마다 국민주가 늘었으면 그 회사 · 아니면 닷새 동안 회사 크기가 가장 많이 는 곳
top7 = {mrow[c][0]['n'] for c in MONEY}
MONEYN, mnrow = [], {}
POOL['moneyNext'] = [i for i in th['inds'] if i['n'] not in top7]
_o = ind_order(POOL['moneyNext'], 'moneyNext'); ordset('moneyNext', _o, key=lambda i: i['n'])
for i in _o:
    g = lead(i, gain5, skip=set(MONEY) | set(MONEYN))
    if g: MONEYN.append(g[1]); mnrow[g[1]] = ('five', i, round(g[0]), None)
    if len(MONEYN) == 7: break
# 꽃이 될 듯 = 싹(한 달 시장보다 앞선 만큼 5 아래 · 닷새 뒤지지 않음 · 꽃 일곱 밖) → 문화로 뺌 → 365곳 모두의 길과 견줘 닷새 동안 시장보다 앞선 만큼이 드문 차례
POOL['bloomNext'] = [c for c in CL if ok_n(c) and X20[c] < 0.05 and X5[c] >= 0 and c not in BLOOM]
_o = sorted(cfilt('bloomNext', POOL['bloomNext']), key=lambda c: (-ccount('bloomNext', c), -(CTX.ret[5].get(c, -9) - CTX.mret[5]), c)); ordset('bloomNext', _o); BLOOMN = per2k(_o)
# 365곳 모두의 길(불장이 될 듯 = 닷새 · 꽃이 될 듯 = 닷새 시장보다) — 그 칸 값이 얼마나 드문가(화면 풀이 · 차례와 같은 쪽)
PMK = {}
if PM is not None and CTX.T > 260:
    with _np.errstate(divide='ignore', invalid='ignore'):
        _lr = _np.log(PM[:, CTX.T - 5 - ST.HIST:CTX.T - 4] / PM[:, CTX.T - 6 - ST.HIST:CTX.T - 5])
    _lr[~_np.isfinite(_lr)] = _np.nan
    with _np.errstate(invalid='ignore'): _mr = _np.nanmean(_lr, axis=0)
    for k, rel in (('hotNext', False), ('bloomNext', True)):
        nl = CUL.mkt_null(_lr, _mr, 5, rel, ST.MC_PATHS, ST.seed_of(b['asOf'], k, 'mkt-null'))
        for c in (HOTN if k == 'hotNext' else BLOOMN):
            a = CTX.ret[5].get(c)
            if a is not None: PMK[(k, c)] = CUL.p_of(nl, a - (CTX.mret[5] if rel else 0))
def cu_of(c):
    j = CJ.get(c)
    if not CON or j is None: return None
    v = CVAL
    f1_ = lambda x: None if x is None or not _np.isfinite(x) else round(float(x), 1)
    return {'on': [k for k in ('herd', 'near', 'hi52', 'rev', 'casc', 'big', 'lot', 'attn') if con(c, k)],
            'v': {'dd': f1_(v['dd'][j] * 100), 'br20': f1_(v['br20'][j] * 100), 'br5': f1_(v['br5'][j] * 100), 'x20': f1_(v['x20'][j] * 100), 'casc': int(v['casc'][j]),
                  'rank': int(v['rank'][j]), 'mx5': f1_((_np.exp(v['mx5'][j]) - 1) * 100) if _np.isfinite(v['mx5'][j]) else None, 'nbig': int(v['nbig'][j])}}
MC365 = MC.scan(CTX) if A.mc365 else None
# ⑧ 주문 1111-1334(사장님 2026-11-11 13:34 「조용한데 에너지가 모이는 주식창을 하나더 만들어라 그래서 총 28개로 만들고 몬태카를로 소거법으로을 찾아내라 그러면서 이것을 ㅊ 적하는 별도에 달력을 만들어라 잡스라면」)
#   넷째 창 「조용한데 힘이 모이는」 일곱(su21_quiet) — 소거 일곱(값 · 다른 세 창 밖 · 한 달 잠잠 · 튀는 날 없음 · 몸집 · 외국인과 기관이 들어옴 · 1년 기록)
#   → 몬테카를로 10만 번(지난 1년 흔들림으로 보아 지금 한 달 폭이 얼마나 드물게 좁은가) → 소거 한 번 더(다섯 번에 한 번보다 흔하면 뺌) → 드문 차례 · 업종마다 둘 · 첫 셋 = 1 · 2 · 3등
#   지금 28곳 = 불장 7 · 꽃이 될 7 · 돈이 몰리는 7 · 조용한데 힘이 모이는 7 · 1 · 2 · 3등(42칸 1억 번 셈)과 그 장부는 그대로
import su21_quiet as QU
try: Q = QU.find(CTX, B, CL, late, opens, cap, set(HOT) | set(BLOOM) | set(MONEY), INDN, b['asOf'])
except Exception as e: # 넷째 창 셈이 넘어져도 세 창 · 판은 그대로(빈 넷째 창 — 화면은 「받지 못했어요」 · 검사 ㉒ 가 실패로 알림)
    print('넷째 창 셈 실패 —', repr(e)[:200]); Q = {'list': [], 'why': {}, 'steps': [('우량주', len(B))], 'mc': {}, 'pool': 0, 'capcut': 0}
QUIET = Q['list']
lists = {'hot': HOT, 'bloom': BLOOM, 'money': MONEY, 'hotNext': HOTN, 'moneyNext': MONEYN, 'bloomNext': BLOOMN, 'quiet': QUIET}
# ④ 1등 · 2등 · 3등(올릴 때 --top3) — 새 잣대(주문 1111-1857 · 사장님 2026-11-11 18:57 「… 선정 기준을 상승할것 같은 종목 으로 해야 해! 에이전트 100개 만들어서 알고리즘 만들어 재대로 상황 공부하고 대입해」)
#   옛 셈(42칸끼리 1억 판 · su21_top3 — 한 달 오른 만큼이 우연보다 센 칸)은 지난 값에 대어 보니 고른 뒤 시장보다 덜 오른 때가 많아 바꿈
#   새 셈(su21_up3) = 우량주 365곳 모두에서 긴 오름세 · 꾸준함 · 업종 따라잡기 · 닷새 눌림 넷을 고르게 섞은 차례 첫 셋 — 42칸 밖일 수 있음(칸에 들면 그 칸에도 등수 표)
import su21_up3 as UP3
CELLS = [(k, c) for k in ('hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext') for c in lists[k]]
try: T3 = UP3.top3(CTX, list(B), cap, nm) if A.top3 else None
except Exception as e:
    print('새 잣대 셈 실패 —', repr(e)[:200]); T3 = None
PLACE = {(k, c): r['place'] for r in (T3 or {}).get('rank', []) for k, c in CELLS if c == r['code']}
NOW3 = ('hot', 'bloom', 'money')
inl = collections.defaultdict(list)
for k, L in lists.items():
    if k == 'quiet': continue # 넷째 창(주문 1111-1334)은 겹침 · 서로 다른 수 · 칸 'in'(「왜?」 쪽 「두 목록」)에 넣지 않음 — 지금 셋 밖에서만 고르고(소거 q2) 될 듯 셋과 겹쳐도 따로 셈
    for c in L: inl[c].append(k)
land_of = {}
for G in lands:
    for i in G['industries']: land_of[i] = G

HEAVY = ('c', 'cFrom', 'cd', 'flows', 'news', 'pos52', 'close', 'cu') # cu(문화 흔적 · 주문 1912)는 su21-cu.json 에 따로(첫 화면이 가볍게)
slim = lambda co: {k: v for k, v in co.items() if k not in HEAVY}
QKEEP = ('code', 'name', 'ind', 'kind', 'in', 'close', 'date', 'c', 'cFrom', 'cd', 'why', 'r3q') # 넷째 창 칸(주문 1111-1334) — 그림(값 · 21 값) · #/s(까닭 why · 등수 r3q)가 쓰는 것만 · 수급은 why 에(f · i · 날)
QWHY = ('place', 'r20', 'span20', 'day5', 'p', 'rare', 'f', 'i', 'days') # 까닭 가운데 화면 · 검사 ㉒ 가 쓰는 것만(첫 화면 자료를 가볍게 — 느린 4G)
qslim = lambda co: {k: ({x: co[k][x] for x in QWHY if x in co[k]} if k == 'why' and isinstance(co[k], dict) else co[k]) for k in QKEEP if k in co}
# 21 마지막 값의 날짜(주문 0806 · 사장님 2026-11-09 08:06 「어 그렇게 해」 — 회사 쪽 한 달 꺾은선도 첫 페이지와 같은 값 · 처음 날 · 끝 날도 같게)
#   같은 판에서 나온 회사 파일(view/stocks/<번호>.json closes60 · 같은 boardId)의 마지막 21줄 — 값 21개가 판 c 와 모두 같고 첫 날 = cFrom · 끝 날 = date 일 때만 · 아니면 None
def cdOf(c):
    v = B[c]; cs = v.get('c')
    try: st = J(A.repo + '/public/data/atlas11/view/stocks/' + c + '.json')
    except Exception: return None
    rows = (st.get('closes60') or [])[-21:] if st.get('boardId') == b.get('boardId') else []
    if not isinstance(cs, list) or len(cs) != 21 or len(rows) != 21: return None
    ds = [r.get('date') for r in rows]
    if ds[0] != v.get('cFrom') or ds[-1] != v.get('date') or any(round(r.get('close') or 0, 2) != x for r, x in zip(rows, cs)): return None
    return ds
def item(c, k):
    v = B[c]; ind = v['group']['label']; L = land_of.get(ind)
    mcv = ({**Q['mc'][c], 'ord': QUIET.index(c) + 1, 'pool': Q['pool'], 'pm': None} if k == 'quiet' else # 주문 1111-1334 — 넷째 창은 「한 달 폭이 얼마나 드물게 좁은가」 셈(su21_quiet)
           {**MC.mc(CTX, c, k), 'ord': ORD.get(k, {}).get((MK.get(c) or {}).get('i') if k in ('money', 'moneyNext') else c), 'pool': len(POOL.get(k, [])),
            'pm': None if PMK.get((k, c)) is None else round(PMK[(k, c)], 6)})
    co = {'code': c, 'name': nm(c), 'ind': ind, 'land': L['name'] if L else None, 'landId': L['id'] if L else None, 'kind': v.get('kind'), 'in': ['quiet'] if k == 'quiet' else inl.get(c, []),
          'mc': mcv, 'r3': PLACE.get((k, c)), # 주문 1422 — 이 칸의 몬테카를로(드묾 p · 지금 값 · 바탕 날 수) · 1억 판 1등 · 2등 · 3등(아니면 None) · 주문 1912 pm = 365곳 모두의 길과 견준 드묾
          'cu': cu_of(c), # 주문 1912 — 이 칸에 보인 한국 투자자 문화 흔적(on) · 잰 값(v)
          'ch20': r1(v['change20'] * 100) if v.get('change20') is not None else None, 'close': v.get('close'), 'date': v.get('date'),
          'c': v.get('c'), 'cFrom': v.get('cFrom'), 'cd': cdOf(c), 'flows': (v.get('brief') or {}).get('flows'), 'news': {k2: (v.get('brief') or {}).get(k2) for k2 in ('newsCount', 'newsNamed')},
          'pos52': (v.get('info') or {}).get('pos52'), 'cap': cap.get(c), 'x': tco.get(c, [None, None])[0], 'y': tco.get(c, [None, None])[1], 'z': tco.get(c, [None, None, None])[2]}
    if k == 'hot':
        h = hot[v['group']['id']]
        co['why'] = {'ind20': r1(h['change20'] * 100), 'from': h['from'], 'to': h['to'], 'up': h['up'], 'measured': h['measured']}
    elif k == 'bloom':
        co['why'] = {'indX': ix(c), 'full': c in full, 'line': 15, 'capTop20': thr}
    elif k == 'money':
        i, gn = mrow[c]
        co['why'] = {'indX': i['x'], 'gain': gn, 'lead': i.get('lead')}
    elif k == 'hotNext':
        how, rk = hrow[c]
        co['why'] = {'how': how, 'rank': rk, 'r20': r1(R20[c] * 100), 'r5': r1(R5[c] * 100), 'ind5': r1((I5.get(ind) or 0) * 100), 'hot7': r1(B[HOT[-1]]['change20'] * 100) if HOT else None}
    elif k == 'moneyNext':
        how, i, gn, rk = mnrow[c]
        co['why'] = {'how': how, 'rank': rk, 'indX': i.get('x'), 'gain': gn}
    elif k == 'quiet':
        co['why'] = Q['why'][c]; co['r3q'] = Q['why'][c]['place'] # 넷째 창 1 · 2 · 3등(차례 첫 셋 · 따로 된 달력 su21_book --rank quiet)
    else:
        co['why'] = {'how': 'main' if c in b_main else 'cap', 'x20': r1(X20[c] * 100), 'x5': r1(X5[c] * 100), 'r20': r1(R20[c] * 100), 'capTop20': thr}
    return co

out = {
    'schema': 'su21-2', 'made': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'asOf': {'board': b['asOf'], 'data': th['asOf'], 'mkt': mkt.get('asOf'), 'cond': cond.get('asOf')},
    'src': {'price': SRC_P, 'board': '/data/atlas11/view/board.json', 'theme': '/next/data/theme.json · theme-co.json', 'cap': '/atlas/data/cond.json', 'mkt': '/atlas/data/mkt.json'},
    'counts': {'listed': mkt.get('n'), 'listedWhat': '코스피 · 코스닥 보통주', 'b365': len(B), 'kinds': dict(collections.Counter(v.get('kind') for v in B.values())),
               'markets': None, 'hotInds': len(hot), 'hotPool': len(f1), 'bloomPool': len(spr), 'bloomFull': len(full), 'late': len(late),
               'hotNextRank': len([c for c in HOTN if hrow[c][0] == 'rank']), 'moneyNextRank': len([c for c in MONEYN if mnrow[c][0] == 'rank']), 'bloomNextMain': len([c for c in BLOOMN if c in b_main]), 'sproutN': len(POOL['bloomNext']),
               'pools': {k: len(v) for k, v in POOL.items()}},
    'rules': {'b365': '두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래(금융은 빚 셈 빼고) · 업종마다 5곳 · 73업종 · 2026년 10월 5일에 정한 판(n365-v1)',
              'mc': '365곳마다 지난 250거래일 하루 값을 그날 흔들림으로 나눈 뒤 지금 흔들림으로 다시 키워 10만 번 섞은 길과 지금 값을 견줘, 지금 모습이 얼마나 드문지 셈(드문 차례 · 요즘 흔들림에 맞춘 길)',
              'culture': '한국 투자자 특징 열하나 가운데 종가로 잴 수 있는 일곱 — 테마 몰림 · 고점 앞 팔기(세움) · 본전 버티기 · 빚투 쏠림(뺌) · 국민주 쏠림(돈 대장 먼저) · 한방 쫓기 · 눈길 따라 사기(1 · 2 · 3등에서 덜 침)',
              'hot': '소거 한 번: 불장 업종(지난 20거래일 365곳 업종 평균이 오른 업종) 안 · 20거래일 오른 회사 → 빚투 쏠림 · 본전 버티기는 뺌 → 신고가 · 테마 몰림이 많은 차례 → 20거래일 오른 만큼이 드문 차례 · 업종마다 둘',
              'bloom': '소거 한 번: 싹(시장보다 앞선 만큼 아직 5 아래 · 닷새 동안 뒤지지 않음)이고 회사 크기가 위 20 안 → 빚투 쏠림은 뺌 → 테마 몰림 · 고점 앞 팔기가 많은 차례 → 그 업종이 20거래일 동안 시장보다 앞선 만큼이 드문 차례',
              'money': '소거 한 번: 한 달 동안 시장보다 더 오른 업종 → 업종이 20거래일 동안 시장보다 앞선 만큼이 드문 차례 · 업종마다 국민주(몸집 위 열에 하나)가 늘었으면 그 회사, 아니면 20거래일 동안 회사 크기가 원으로 가장 많이 는 회사 하나',
              'hotNext': '소거 한 번: 불장 일곱 밖 · 닷새 동안 오른 회사(불장 업종이거나 그 업종도 닷새 오름) → 빚투 쏠림 · 본전 버티기는 뺌 → 고점 앞 팔기 · 테마 몰림이 많은 차례 → 365곳 모두의 길과 견줘 닷새 오른 만큼이 드문 차례 · 업종마다 둘',
              'moneyNext': '소거 한 번: 돈이 몰리는 일곱 밖 업종 → 업종이 닷새 동안 시장보다 앞선 만큼이 드문 차례 · 업종마다 국민주가 늘었으면 그 회사, 아니면 닷새 동안 회사 크기가 가장 많이 는 회사 하나',
              'bloomNext': '소거 한 번: 싹(한 달 시장보다 앞선 만큼 5 아래 · 닷새 뒤지지 않음 · 꽃 일곱 밖) → 365곳 모두의 길과 견줘 닷새 동안 시장보다 앞선 만큼이 드문 차례 · 업종마다 둘',
              'top3': '새 잣대(주문 1111-1857) — 우량주 365곳 모두에서 잣대 넷(긴 오름세 · 덜 흔들림, 1년 오른 날 몫, 업종 따라잡기, 닷새 눌림)을 날마다 회사끼리 표준 점수로 고르게 더한 차례 첫 셋 · 그날 마지막 값이 있고 지난 60거래일 값이 빠짐없는 곳 · 몸집 아래 열에 둘은 뺌'},
    'past': ({'from': PASTC['from'], 'to': PASTC['to'], 'mid': PASTC.get('mid'), 'days': PASTC['days'], 'within': PASTC['within'], 'universe': PASTC['universe'], 'src': 'reports/atlas11/su-next/past-culture.json',
              'mcRank': True, 'cultureRank': True, 'what': PASTC['what'], 'mc': PASTC.get('mc'), 'calib': PASTC.get('calib'),
              'bloomFrom': PASTC.get('flower'), # 주문 0103 — 꽃이 될 듯 맞음을 고른 날 값부터 셈('pick') · 화면 글 「고른 날부터」
              **{g: {'n': v['culture']['picks'], 'hit': v['culture']['hits'], 'per100': round(v['culture']['per100']), 'base100': round(v['base']['per100']), 'old100': round(v['old']['per100']),
                     'mc100': round(v['mc1422']['per100']), 'oldN': v['old']['picks'], 'days': v['culture']['days'],
                     'h1': round(PASTC['halves'][g]['first']['culture']['per100']), 'h2': round(PASTC['halves'][g]['second']['culture']['per100']),
                     'h1m': round(PASTC['halves'][g]['first']['mc1422']['per100']), 'h2m': round(PASTC['halves'][g]['second']['mc1422']['per100'])}
                 for g, v in PASTC['res'].items()}}
             if PASTC and PASTC.get('rule') == CUL.RULE_ID else
             {'from': PASTM['from'], 'to': PASTM['to'], 'days': PASTM['days'], 'within': PASTM['within'], 'universe': PASTM['universe'], 'src': 'reports/atlas11/su-next/past-mc.json', 'mcRank': True,
              'what': PASTM['what'], 'mc': PASTM.get('mc'),
              **{g: {'n': v['mc']['picks'], 'hit': v['mc']['hits'], 'per100': round(v['mc']['per100']), 'base100': round(v['base']['per100']), 'old100': round(v['old']['per100']), 'oldN': v['old']['picks'], 'days': v['mc']['days']}
                 for g, v in PASTM['res'].items()}}
             if PASTM and PASTM.get('rule') == MC.RULE_ID else
             {'from': PASTS['from'], 'to': PASTS['to'], 'days': PASTS['days'], 'within': PASTS['within'], 'universe': PASTS['universe'], 'src': 'reports/atlas11/su-next/past-strict.json', 'strict': True,
              'what': PASTS['what'], 'crit': PASTS.get('crit'), 'mc': PASTS.get('mc'),
              **{g: {'n': v['strict']['picks'], 'hit': v['strict']['hits'], 'per100': round(v['strict']['per100']), 'base100': round(v['base']['per100']), 'old100': round(v['old']['per100']), 'oldN': v['old']['picks'], 'days': v['strict']['days']}
                 for g, v in PASTS['res'].items()}}
             if PASTS and PASTS.get('rule') == ST.RULE_ID else
             {'from': PAST['from'], 'to': PAST['to'], 'days': PAST['days'], 'within': PAST['within'], 'universe': PAST['universe'], 'src': 'reports/atlas11/su-next/past.json',
              'what': PAST['what'], **{g: {'n': v['picks'], 'hit': v['hits'], 'per100': round(v['per100']), 'base100': round(v['base100'])} for g, v in PAST['final'].items()}} if PAST else None),
    'lists': {k: [{x: y for x, y in item(c, k).items() if x != 'cu'} for c in L] if k in NOW3 else [qslim(item(c, k)) for c in L] if k == 'quiet' else [slim(item(c, k)) for c in L] for k, L in lists.items()}, # 될 듯 셋은 가볍게(첫 화면 느린 휴대폰) — 21 마지막 값 · 수급 · 뉴스는 su21-next.json · 넷째 창(조용한데 힘이 모이는)은 그림 · #/s 가 쓰는 것만(까닭 why 에 외국인 · 기관)
    'overlap': [{'code': c, 'name': nm(c), 'in': [k for k in ks if k in NOW3]} for c, ks in inl.items() if len([k for k in ks if k in NOW3]) > 1],
    'distinct': len([c for c, ks in inl.items() if any(k in NOW3 for k in ks)]),
    'overlapNext': [{'code': c, 'name': nm(c), 'in': [k for k in ks if k not in NOW3]} for c, ks in inl.items() if len([k for k in ks if k not in NOW3]) > 1],
    'distinctNext': len([c for c, ks in inl.items() if any(k not in NOW3 for k in ks)]),
    'lands': [{'id': G['id'], 'name': G['name'], 'say': G.get('say'),
               'inds': [{'name': g['label'], 'ch20': r1(g['change20'] * 100) if g.get('change20') is not None else None, 'hot': bool(g.get('hot')),
                         'cos': [{'code': c, 'name': nm(c), 'kind': B[c].get('kind'), 'ch20': r1(B[c]['change20'] * 100) if B[c].get('change20') is not None else None, 'in': [k for k in inl.get(c, []) if k in NOW3]}
                                 for c in g['codes'] if c in B]}
                        for g in b['groups'] if g['label'] in G['industries']]}
              for G in lands],
}
out['lands'] = [L for L in out['lands'] if L['inds']]
# 몬테카를로 → 소거 한 번 → 1억 판(주문 1422) — 첫 페이지 · 「왜?」 쪽이 읽는 요약(칸마다 값은 lists 의 mc · r3)
out['listRule'] = CUL.RULE_ID # 고르는 규칙 이름(주문 1912 문화 셈) — 며칠째 기록(su21_days · su21_replay)이 같은 규칙으로 센 날만 이어 셈
out['mc'] = {'rule': MC.RULE_ID, 'paths': ST.MC_PATHS, 'p': ST.MC_P, 'hist': ST.HIST, 'scan': MC365, 'say': MC.SAY, 'method': MC.METHOD, 'lam': CUL.LAM, 'mkt': sorted(CUL.MKT_ORDER),
             'pools': {k: len(v) for k, v in POOL.items()}}
out['culture'] = {'rule': CUL.RULE_ID, 'eleven': 11, 'pos': CUL.POS, 'neg': CUL.NEG} # 자세한 것(일곱 정의 · 칸마다 흔적 · 정직도)은 su21-cu.json(「왜?」 쪽만 받음)
CUOUT = {'schema': 'su21-cu-1', 'asOf': out['asOf'], 'rule': CUL.RULE_ID,
         'culture': {'eleven': 11, 'src': 'docs/design/su-culture-2026-11-09/traits11.md',
                     'traits': [{'k': k, 'name': CUL.NAME[k], 'say': CUL.SAY[k], 'use': CUL.USE[k], 'n365': int(_np.sum(CON[k])) if CON else None} for k in CUL.TRAITS],
                     'calib': (PASTC or {}).get('calib') if PASTC and PASTC.get('rule') == CUL.RULE_ID else None},
         'cu': {k + ':' + c: cu_of(c) for k, L in lists.items() if k != 'quiet' for c in L}} # 넷째 창은 「왜?」 쪽이 없어 문화 흔적을 싣지 않음
out['quiet'] = {'rule': QU.RULE_ID, 'paths': QU.PATHS, 'hist': QU.HIST, 'win': QU.WIN, 'pmax': QU.PMAX, 'move': QU.MOVE, 'span': QU.SPAN, 'capCut': Q['capcut'], 'pool': Q['pool'],
                'crit': [{'id': i, 'name': n, 'say': s} for i, n, s in QU.QCRIT], 'steps': [{'name': n, 'n': k} for n, k in Q['steps']],
                'rank': [{'place': j + 1, 'k': 'quiet', 'code': c, 'name': nm(c)} for j, c in enumerate(QUIET[:3])], # 따로 된 달력(su21_book --rank quiet)이 읽음
                'say': '값은 잠잠한데 외국인과 기관이 들어온 곳 — 지난 1년 흔들림으로 보아 이만큼 조용하기가 드문 차례'}
out['counts']['pools']['quiet'] = Q['pool']
out['rules']['quiet'] = '소거 일곱: 값이 있음 · 다른 세 창 밖 · 한 달 오르내림 위아래 5 안 · 하루 오르내림 위아래 5 안 · 몸집 아래 열에 둘 밖 · 닷새 동안 외국인과 기관을 더하면 들어옴 · 1년 기록 → 몬테카를로 10만 번(지난 250거래일 하루 값을 20개씩 뽑은 길의 한 달 폭과 견줌) → 다섯 번에 한 번보다 흔한 조용함은 뺌 → 드문 차례 · 업종마다 둘'
out['top3'] = None if T3 is None else {'v': T3['v'], 'n': T3['n'], 'pool': T3['pool'], 'how': T3['how'], 'past': T3['past'], # 주문 1111-1857 — 새 잣대(우량주 365곳 · 넷 고른 섞기)
             'rank': [{**r, 'name': nm(r['code']), 'close': B[r['code']].get('close'), 'date': B[r['code']].get('date'), # 값 = 판(42칸과 같은 판 값 · 달력이 그 판 날 마지막 값으로 삼)
                       'c': B[r['code']].get('c'), 'cFrom': B[r['code']].get('cFrom'), # 주문 1112-0044(사장님 2026-11-12 00:44 「여기 1.2.3에 그래프 그리고 다양한 정보 직관적으로 보이게 하고 클릭 하면 그정보가 이어지게 해」) — 한 달 꺾은선 = 판 21 마지막 값(42칸과 같은 값)
                       'ch20': r1(B[r['code']]['change20'] * 100) if B[r['code']].get('change20') is not None else None, # 한 달(20거래일) 오른 만큼 — 42칸 불장 값과 같은 셈
                       'in': [k for k, c in CELLS if c == r['code']]} for r in T3['rank']]} # in = 이 회사가 든 칸(없으면 42칸 밖)
lands_out = out.pop('lands') # 땅 지도는 따로(첫 화면이 가볍게 — 느린 휴대폰) · su21-map.json
json.dump(out, open(A.out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump(CUOUT, open(A.out.replace('su21.json', 'su21-cu.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':')) # 주문 1912 — 문화 일곱 · 칸마다 흔적(「왜?」 쪽만)
json.dump({'schema': 'su21-map-1', 'asOf': out['asOf'], 'lands': lands_out}, open(A.out.replace('su21.json', 'su21-map.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# ⑧ 주문 1113-2033(사장님 2026-11-13 20:33 「이걸 11 가지로 만든다면 … 이전 11 개를 해가지고 … 정상까지 다 연결」 · 20:35 「어 맞아」)
#   한국 투자자 특징 열하나로 고른 열한 묶음(일곱 곳씩 · su21_t11.py) — 정산 장부(su21_settle.mjs)가 그날 판 날일 때 적고 10주씩 산 셈 · 화면은 정산 쪽 표 하나
import su21_t11 as T11
try:
    VOL = json.load(open(A.vol, encoding='utf-8')) if A.vol else None
except Exception: VOL = None
_vday = DATES[CTX.T] if DATES and 0 <= CTX.T < len(DATES) else None
T11R = T11.lists11(CODES, IXc, PM, CTX.T, capv, {**CVAL, 'il20': il20v[IXc]}, CON, late=late, vol=(VOL or {}).get('rows'), dates=DATES) if PM is not None and CON else T11.lists11(CODES, IXc, None, 0, capv, {}, {}, late=late)
json.dump({'schema': 'su21-t11-1', 'asOf': {'board': b['asOf'], 'data': _vday}, 'rule': T11.RULE_ID, 'k': T11.K, 'kinds': T11.KINDS, 'name': T11.NAME, 'say': T11.SAY, 'by': T11.BY,
           'lists': {k: [{'code': c, 'name': nm(c)} for c in L] for k, L in T11R['lists'].items()}, 'why': T11R['why'], 'vol': {'day': T11R['volDay'], 'n': T11R['volN'], 'last': (VOL or {}).get('last'), 'ok': (VOL or {}).get('ok')},
           'src': 'docs/design/su-culture-2026-11-09/traits11.md · docs/design/su-volume-2026-11-10/volume4.md'},
          open(A.out.replace('su21.json', 'su21-t11.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'schema': 'su21-next-1', 'asOf': out['asOf'], 'lists': {k: [item(c, k) for c in lists[k]] for k in ('hotNext', 'moneyNext', 'bloomNext')}}, open(A.out.replace('su21.json', 'su21-next.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':')) # 될 듯 회사의 출목표 쪽(#/c/<번호>/more)만 받음
print('ok', {k: [nm(c) for c in L] for k, L in lists.items()}, 'quiet', [(n, k) for n, k in Q['steps']], 'distinct', len(inl), 'overlap', [o['name'] for o in out['overlap']], 'lands', len(lands_out),
      'top3', [(r['place'], nm(r['code']), r['score']) for r in (T3 or {}).get('rank', [])], 'pool', (T3 or {}).get('pool'))
