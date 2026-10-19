#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Independent recount of theme-engine v1.1 (decision table sections 1-6).

Reads only <site>/atlas/data (days.json, mkt.json, cond.json, co/<code>.json).
Never writes into the repo.

    python3 recount.py          -> writes recount_v11.json
    python3 recount.py --exact3 -> writes recount_v11_exact3.json (sensitivity run only: dot 3's mean>=0.01 is
                                   decided with exact Fractions instead of IEEE doubles; everything else identical)

v1.1 changes versus v1 (all taken from the table):
  * "셀 회사"(day t) = member with close(t) and close(t-10) both present AND no day s in t-9..t with |r(c,s)| >= 0.35.
  * dot 2 : count of 셀 회사 with close(t)*100 > close(t-10)*102, times 2 >= number of 셀 회사 (0 cells -> false).
  * dot 3 : mean of close(t)/close(t-10)-1 over the 셀 회사 among rk 1,2,3  >= 0.01 (none -> false).
  * section 5: d10 exists only for 셀 회사 at T; top8 and the big-three d10 use only those (spike -> null).
  * spread series, record (section 6) use the same 셀 filter on every day.

v1.2 additions (2026-10-19 · same table, section 5 + section 1; written from the table only):
  * per industry  : m10 = I(T)/I(T-10)-1 · A5 = I(T-5)/I(T-10)-1 · B5 = I(T)/I(T-5)-1   (x100, NOT rounded)
                    m10 has no line of its own in v1.2 — it is the ratio of dot ④ (I(t)/I(t-10)), as the caller defined it.
  * ordering      : companies with d10 (= 셀 회사 at T), d10 descending on the exact rational value, ties by code
                    (string order) -> rank 1.. ; gap = own d10 - next-lower d10 (exact, x100), last one -> null.
  * top8x / bigx  : c · n(mkt name) · d10 · a5 · b5 (x100, NOT rounded) · rank · gap · l ; bigx also rk.
                    a5/b5 need close(T-5) — the carry rule is written for the line only, so a missing close(T-5) -> null.
                    l = for s in T-10..T: close(s)/close(T-10)*1000 rounded half-up (반올림) on the exact value;
                    missing close(s) carries the previous day's close; close(T-10) missing -> no line (null).
                    big company outside the ordering (튄 회사 · 값 빔) -> every numeric field null, the line included.
  * new values are written unrounded so compare_theme.py can accept only 2-decimal rounding differences.
  Usage: python3 -I verify_theme.py --data <site>/atlas/data --out <dir>  -> <dir>/recount_v11.json (name kept for callers)
"""
import json
import math
import os
import sys
from fractions import Fraction

# 저장소 판(2026-10-19 · 따로 센 일꾼이 결정표만 보고 짠 것 그대로 · 길만 인자로): --data <site>/atlas/data · --out <폴더>
def _arg(k, d):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv and sys.argv.index(k) + 1 < len(sys.argv) else d
DATA = _arg('--data', os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../site/atlas/data'))
OUTDIR = _arg('--out', os.environ.get('TMPDIR', '/tmp'))

# ---- constants written in the table -------------------------------------------------
MIN_MEMBERS = 5          # "회사가 5곳보다 적은 업종은 셈 밖"
SPLIT_CUT = 0.35         # 1. |r| >= 0.35 -> that company-day is dropped / 튄 날
FLOWER_X = 5.0           # 2. 꽃 선 x = 5
DOT1_Y = 2.0             # 3.① y(t) >= 2
DOT3_AVG = 0.01          # 3.③ mean >= 0.01
REC_FIRST = 40           # 6. t = 40 ..
REC_LAG = 20             #    .. T-20
HIT_EX = 0.05            # 6. ex(t+20, 20) >= 0.05


def jload(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def r2(v):
    """round to 2 decimals, never emit -0.0"""
    return round(v, 2) + 0.0


def pct1_half_up(hits, n):
    """100*hits/n to one decimal, rounded half-up on the exact rational value."""
    if n == 0:
        return None
    tenths = (Fraction(1000 * hits, n) + Fraction(1, 2)).__floor__()
    return tenths / 10.0


def zone_of(x, y):
    # 2. 자리
    if x >= FLOWER_X:
        return '꽃' if y >= 0 else '시듦'
    return '싹' if y >= 0 else '잠잠'


def load_universe():
    days = jload(os.path.join(DATA, 'days.json'))
    D = days['dates']
    N = len(D)
    mkt = jload(os.path.join(DATA, 'mkt.json'))['companies']
    cond = jload(os.path.join(DATA, 'cond.json'))['co']
    rk_of = dict(zip(cond['c'], cond['rk']))

    codes = []          # companies = mkt companies that have a co file (mkt order)
    px = {}             # code -> list[N] of int price or None
    for code in mkt:
        p = os.path.join(DATA, 'co', code + '.json')
        if not os.path.exists(p):
            continue
        c = jload(p)
        k0 = c.get('k0') or 0
        arr = [None] * N
        for j, v in enumerate(c['close']):
            d = j + k0                       # close[j] = price of D[j + k0]
            if 0 <= d < N and v:            # 0 / None / '' = missing
                arr[d] = v
        px[code] = arr
        codes.append(code)
    return D, N, mkt, rk_of, codes, px


def compute(exact3=False):
    D, N, mkt, rk_of, codes, px = load_universe()
    T = N - 1

    # ---- 1. daily change r(c,t); also prefix count of 튄 날 (|r| >= 0.35) ----------------
    R = {}
    SPK = {}            # SPK[c][t] = number of spike days among days 1..t
    for c in codes:
        a = px[c]
        r = [None] * N
        cs = [0] * N
        run = 0
        for t in range(1, N):
            p0 = a[t - 1]
            p1 = a[t]
            if p0 is not None and p1 is not None:
                v = p1 / p0 - 1
                if abs(v) >= SPLIT_CUT:
                    run += 1
                else:
                    r[t] = v
            cs[t] = run
        R[c] = r
        SPK[c] = cs

    def build_index(members):
        I = [100.0] * N                                   # I(0) = 100
        for t in range(1, N):
            s = 0.0
            k = 0
            for c in members:
                v = R[c][t]
                if v is not None:
                    s += v
                    k += 1
            m = (s / k) if k else 0.0                     # none -> 0
            I[t] = I[t - 1] * (1 + m)
        return I

    M = build_index(codes)                                # 시장 지수: 모든 회사

    def ex(I, t, k):
        return (I[t] / I[t - k]) / (M[t] / M[t - k]) - 1

    # ---- industries (>= 5 members) -----------------------------------------------------
    members = {}
    for c in codes:
        name = mkt[c].get('i')
        if not name:
            continue
        members.setdefault(name, []).append(c)
    inds = {nm: ms for nm, ms in members.items() if len(ms) >= MIN_MEMBERS}

    h_cut = (REC_FIRST + T - REC_LAG) // 2               # 6. 앞/뒤 절반 경계 (정수 몫)

    out_inds = {}
    ctx = {}
    acc_all = [0, 0]
    acc_sprout = [0, 0]
    acc_real = [0, 0]
    acc_dots = {k: [0, 0] for k in range(5)}
    acc_half = {'all': [[0, 0], [0, 0]], 'real': [[0, 0], [0, 0]]}
    # v1.2 diagnostics: how often the table's edge clauses actually fire (counted per published row)
    diag = {'ranked': 0, 'adjacent_exact_ties': 0, 'order_double_vs_exact': 0, 'big_outside_order': 0,
            'missing_close_T5': 0, 'line_carried_days': 0, 'line_exact_half': 0}

    for name, mem in inds.items():
        I = build_index(mem)

        x = [None] * N
        y = [None] * N
        for t in range(5, N):
            y[t] = ex(I, t, 5) * 100
        for t in range(20, N):
            x[t] = ex(I, t, 20) * 100

        # 셀 회사 per day: chg10[c][t] is the ten-day change for 셀 회사, None otherwise
        cnt = [0] * N          # ② 오른 회사 수 (셀 회사 가운데)
        tot = [0] * N          # 셀 회사 수
        chg10 = {c: [None] * N for c in mem}
        for c in mem:
            a = px[c]
            cs = SPK[c]
            ch = chg10[c]
            for t in range(10, N):
                p0 = a[t - 10]
                p1 = a[t]
                if p0 is None or p1 is None:
                    continue
                if cs[t] - cs[t - 10] != 0:      # a 튄 날 inside t-9..t
                    continue
                ch[t] = p1 / p0 - 1
                tot[t] += 1
                if p1 * 100 > p0 * 102:          # 정수 곱
                    cnt[t] += 1

        # ③ 큰 회사 = rk 1,2,3
        big = sorted((c for c in mem if rk_of.get(c) in (1, 2, 3)), key=lambda c: (rk_of[c], c))

        def dot3(t):
            pairs = []
            for c in big:
                if chg10[c][t] is None:          # not a 셀 회사 that day
                    continue
                pairs.append((px[c][t - 10], px[c][t]))
            if not pairs:
                return False
            if exact3:
                mean = sum(Fraction(p1 - p0, p0) for p0, p1 in pairs) / len(pairs)
                return mean >= Fraction(1, 100)
            s = 0.0
            for p0, p1 in pairs:
                s += p1 / p0 - 1
            return (s / len(pairs)) >= DOT3_AVG

        def dots(t):
            d1 = y[t] >= DOT1_Y
            d2 = tot[t] > 0 and cnt[t] * 2 >= tot[t]
            d3 = dot3(t)
            d4 = (I[t] / I[t - 10]) > 1
            return [bool(d1), bool(d2), bool(d3), bool(d4)]

        # ---- today ----
        zT = zone_of(x[T], y[T])
        run = 1
        s = T - 1
        while s >= 20 and zone_of(x[s], y[s]) == zT:
            run += 1
            s -= 1
        dT = dots(T)
        score = sum(dT)

        series = [cnt[s] for s in range(T - 10, T + 1)]

        bigch = [chg10[c][T] for c in big if chg10[c][T] is not None]
        big_avg = r2(100 * (sum(bigch) / len(bigch))) if bigch else None
        big_d10 = [(r2(chg10[c][T] * 100) if chg10[c][T] is not None else None) for c in big]

        cand = [(chg10[c][T], c) for c in mem if chg10[c][T] is not None]
        cand.sort(key=lambda z: (-z[0], z[1]))           # 반올림 전 값, 같으면 번호 차례
        top8 = [[c, r2(v * 100)] for v, c in cand[:8]]

        # ---- v1.2 · 5. 회사 칸 + 업종 앞 · 뒤 닷새 (exact rationals, x100, unrounded) ----
        m10 = (I[T] / I[T - 10] - 1) * 100
        A5 = (I[T - 5] / I[T - 10] - 1) * 100
        B5 = (I[T] / I[T - 5] - 1) * 100

        def fr(c, s):
            return Fraction(px[c][s])

        # 업종 안 자리: d10 이 있는 회사(= 셀 회사 at T) · d10 큰 차례 · 같으면 번호 차례 · 반올림 전 값
        order = sorted((c for c in mem if chg10[c][T] is not None),
                       key=lambda c: (-(fr(c, T) / fr(c, T - 10)), c))
        if [c for c in order[:8]] != [c for _, c in cand[:8]]:
            diag['order_double_vs_exact'] += 1          # sanity: the double order above must agree
        pos = {c: j for j, c in enumerate(order)}
        exd10 = {c: fr(c, T) / fr(c, T - 10) - 1 for c in order}
        for j in range(len(order) - 1):
            if exd10[order[j]] == exd10[order[j + 1]]:
                diag['adjacent_exact_ties'] += 1

        def line(c):
            a = px[c]
            base = a[T - 10]
            if base is None:
                return None                              # 열흘 전 종가가 없으면 선 없음
            out = []
            last = base
            for s in range(T - 10, T + 1):
                v = a[s]
                if v is None:
                    v = last                             # 종가가 빈 날은 바로 앞 날 값
                    diag['line_carried_days'] += 1
                last = v
                f = Fraction(v) * 1000 / Fraction(base)
                if f.denominator == 2:
                    diag['line_exact_half'] += 1
                out.append(math.floor(f + Fraction(1, 2)))   # 반올림 = half-up on the exact value
            return out

        def co_row(c):
            row = {'c': c, 'n': mkt[c].get('n')}
            if c not in pos:                             # 튄 회사 · 값 빔 -> 숫자 칸 모두 없음
                diag['big_outside_order'] += 1
                row.update({'d10': None, 'a5': None, 'b5': None, 'rank': None, 'gap': None, 'l': None})
                return row
            j = pos[c]
            row['d10'] = float(exd10[c] * 100)
            if px[c][T - 5] is None:
                diag['missing_close_T5'] += 1
                row['a5'] = row['b5'] = None
            else:
                row['a5'] = float((fr(c, T - 5) / fr(c, T - 10) - 1) * 100)
                row['b5'] = float((fr(c, T) / fr(c, T - 5) - 1) * 100)
            row['rank'] = j + 1
            row['gap'] = float((exd10[c] - exd10[order[j + 1]]) * 100) if j + 1 < len(order) else None
            row['l'] = line(c)
            return row

        top8x = [co_row(c) for c in order[:8]]
        bigx = []
        for c in big:
            row = co_row(c)
            row['rk'] = rk_of[c]
            bigx.append(row)
        diag['ranked'] += len(order)

        out_inds[name] = {
            'n': len(mem),
            'zone': zT,
            'x': r2(x[T]),
            'y': r2(y[T]),
            'days': run,
            'tail': [[r2(x[s]), r2(y[s])] for s in range(T - 5, T + 1)],
            'dots': dT,
            'score': score,
            'spread': {'series': series, 'now': cnt[T], 'before': cnt[T - 5],
                       'peak': max(series), 'tot': tot[T]},
            'big': {'codes': list(big), 'avg': big_avg},
            'bigD10': big_d10,
            'top8': top8,
            # v1.2 (unrounded x100 values; compare_theme.py allows only 2-decimal rounding differences)
            'm10': m10, 'A5': A5, 'B5': B5,
            'ranked': len(order),
            'top8x': top8x,
            'bigx': bigx,
        }
        ctx[name] = {'I': I, 'x': x, 'y': y, 'cnt': cnt, 'tot': tot, 'big': big,
                     'y_exact': y[T], 'score': score, 'zone': zT, 'mem': mem, 'chg10': chg10}

        # ---- 6. 성적표 ----
        for t in range(REC_FIRST, T - REC_LAG + 1):
            z = zone_of(x[t], y[t])
            sc = sum(dots(t))
            hit = ex(I, t + REC_LAG, 20) >= HIT_EX
            h = 1 if hit else 0
            half_i = 0 if t < h_cut else 1
            acc_all[0] += 1
            acc_all[1] += h
            acc_half['all'][half_i][0] += 1
            acc_half['all'][half_i][1] += h
            if z == '싹':
                acc_sprout[0] += 1
                acc_sprout[1] += h
                acc_dots[sc][0] += 1
                acc_dots[sc][1] += h
                if sc == 4:
                    acc_real[0] += 1
                    acc_real[1] += h
                    acc_half['real'][half_i][0] += 1
                    acc_half['real'][half_i][1] += h

    # ---- 4. 싹 자리 순서 ----
    sprout = [nm for nm, o in out_inds.items() if o['zone'] == '싹']
    sprout.sort(key=lambda nm: (-out_inds[nm]['score'], -ctx[nm]['y_exact'], nm))

    def grp(a):
        return {'n': a[0], 'p': pct1_half_up(a[1], a[0])}

    record = {
        'all': grp(acc_all),
        'sprout': grp(acc_sprout),
        'real': grp(acc_real),
        'byDots': {str(k): grp(acc_dots[k]) for k in range(5)},
        'halves': {
            'all': [pct1_half_up(acc_half['all'][0][1], acc_half['all'][0][0]),
                    pct1_half_up(acc_half['all'][1][1], acc_half['all'][1][0])],
            'real': [pct1_half_up(acc_half['real'][0][1], acc_half['real'][0][0]),
                     pct1_half_up(acc_half['real'][1][1], acc_half['real'][1][0])],
        },
    }
    result = {'T': D[T], 'table': 'v1.2', 'industries': out_inds, 'sproutOrder': sprout, 'record': record,
              'diag': diag}
    extra = {
        'N': N, 'T': T, 'h_cut': h_cut,
        'n_companies': len(codes), 'n_industries': len(inds),
        'excluded_industries': {nm: len(ms) for nm, ms in members.items() if len(ms) < MIN_MEMBERS},
        'raw_counts': {'all': acc_all, 'sprout': acc_sprout, 'real': acc_real,
                       'byDots': acc_dots, 'half': acc_half},
        'M': M, 'ctx': ctx, 'px': px, 'rk_of': rk_of, 'D': D, 'SPK': SPK, 'mkt': mkt,
    }
    return result, extra


def main():
    exact3 = '--exact3' in sys.argv
    result, extra = compute(exact3)
    os.makedirs(OUTDIR, exist_ok=True)
    path = os.path.join(OUTDIR, 'recount_v11_exact3.json' if exact3 else 'recount_v11.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    zc = {}
    for o in result['industries'].values():
        zc[o['zone']] = zc.get(o['zone'], 0) + 1
    print('mode      :', 'dot3 EXACT fractions' if exact3 else 'literal doubles for dot3')
    print('wrote     :', path)
    print('T         :', result['T'], '(index %d of N=%d)' % (extra['T'], extra['N']))
    print('companies :', extra['n_companies'], ' industries used:', extra['n_industries'],
          ' excluded(<5):', extra['excluded_industries'])
    print('zones     :', zc)
    print('record    :', json.dumps(result['record'], ensure_ascii=False))
    print('v1.2 diag :', json.dumps(result['diag'], ensure_ascii=False))


if __name__ == '__main__':
    main()
