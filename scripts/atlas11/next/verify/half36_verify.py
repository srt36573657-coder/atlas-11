#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""반값 셈 따로 세기(h36-a) — 일꾼 KG2 · 2026-10-18.

결정표 docs/design/kkolttori-2026-10-18/half36.md 만 보고 처음부터 셈한다.
half36.mjs 와 그 결과 파일의 셈 방식은 보지 않았다.

부르는 법(결정표 §11):
  python3 -I scripts/atlas11/next/verify/half36_verify.py --site <site> --json <후보 파일>
끝 코드:
  0 = 틀림 0
  1 = 틀림 있음(틀린 칸과 두 값을 찍음)
  2 = 셈을 못 함(파일을 못 읽음 · 결정표 §3 멈춤 · 후보 파일을 못 읽음)
읽기만 한다: <site>/atlas/data/days.json · mkt.json · co/<번호>.json · surge.json.
아무 파일도 쓰지 않는다. 맞대지 않는 칸: made · note · check(§11).
"""
import argparse
import heapq
import json
import math
import os
import sys
import time

WINDOW = 250        # §4 「1년」 = 250거래일
TOP = 36            # §5 고른 곳 수
MIN_DAYS = 256      # §3 N < 256 이면 멈춤
SCHEMA = 'kkolttori-half36-1'
RULE = 'h36-a'
ALT_RULE = 'h36-b'
ALT_MIN_CNT = 60    # §9 cnt < 60 이면 모름
TOL_RISE5 = 0.01    # §10 · §11
TOL_MEAN = 0.05     # §8 · §11
EPS = 1e-9          # 허용 폭 끝에서 소수 표현 흔들림만 덮음

TOP_KEYS = ('schema', 'rule', 'n', 'of', 'unknown', 'day', 'from', 'until',
            'asOf', 'window', 'eligible', 'universe')
ITEM_KEYS = ('code', 'name', 'close', 'min', 'minDay', 'half', 'halfDay',
             'why', 'jumpDay')
ALT_KEYS = ('rule', 'n', 'of', 'unknown', 'asOf', 'kst')
SPREAD_KEYS = ('days', 'from', 'to', 'min', 'median', 'max', 'lower',
               'higher', 'unknownDays')
ALL_KEYS = set(TOP_KEYS) | {'made', 'list', 'alt', 'spread', 'note', 'check'}


class CannotCompute(Exception):
    """셈을 못 함(끝 코드 2) — 파일을 못 읽음 · 결정표 §3 멈춤."""


def _reject_constant(name):
    # NaN · Infinity 는 JSON 이 아니다 — JS JSON.parse 처럼 「못 읽음」
    raise ValueError('JSON 이 아닌 수: ' + name)


def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f, parse_constant=_reject_constant)


def usable(x):
    """§2 「쓸 수 있는 값」이면 float(배정밀도), 아니면 None(빈 값). 반올림 · 고침 없음."""
    if isinstance(x, bool) or not isinstance(x, (int, float)):
        return None
    try:
        f = float(x)
    except OverflowError:
        return None
    if not math.isfinite(f) or not f > 0:
        return None
    return f


def jump(p, x):
    """§2 하루에 크게 바뀜: |x − p| × 100 > p × 35(나눗셈이 아니라 곱셈 꼴)."""
    return abs(x - p) * 100.0 > p * 35.0


def below(x, b):
    """§2 반값 아래: 2 × x < b(꼭 절반은 아래가 아님)."""
    return 2.0 * x < b


def js_round(x):
    """JS Math.round — 가장 가까운 정수 · 똑같이 가까우면 +∞ 쪽."""
    f = math.floor(x)
    return f + 1 if x - f >= 0.5 else f


def load_co(data, code, n_days):
    """§2 v(c, t) 한 줄. 돌려줌 (값 줄 · k0) 또는 (None, 까닭)."""
    path = os.path.join(data, 'co', code + '.json')
    if not os.path.isfile(path):
        return None, 'co 파일이 없음'
    try:
        d = read_json(path)
    except Exception as e:  # 못 읽음 — 까닭 이름만 찍음
        return None, 'co 파일을 못 읽음(%s)' % type(e).__name__
    if not isinstance(d, dict):
        return None, 'co 파일이 JSON 개체가 아님'
    k0 = d.get('k0')
    if isinstance(k0, bool) or not isinstance(k0, (int, float)):
        return None, 'k0 가 0 이상 정수가 아님(%r)' % (k0,)
    if isinstance(k0, float):
        if not (math.isfinite(k0) and k0.is_integer()):
            return None, 'k0 가 0 이상 정수가 아님(%r)' % (k0,)
        k0 = int(k0)
    if k0 < 0:
        return None, 'k0 가 0 이상 정수가 아님(%r)' % (k0,)
    close = d.get('close')
    if not isinstance(close, list):
        return None, 'close 가 배열이 아님'
    if k0 + len(close) != n_days:
        return None, 'k0 + close 길이 %d ≠ N %d' % (k0 + len(close), n_days)
    return [None] * k0 + [usable(x) for x in close], k0


def follow(v, i, end):
    """§6 그 뒤 1년 — 돌려줌 (half, why, 날 번호).

    half: True 예 · False 아니오 · None 모름 / why: 'jump' · 'gap' · None.
    """
    b = v[i]
    prev = b
    gap = False
    for t in range(i + 1, end + 1):
        x = v[t]
        if x is None:          # 1. 빈 값
            gap = True
            continue
        if jump(prev, x):      # 2. 크게 바뀜 → 모름(3 보다 먼저)
            return None, 'jump', t
        if below(x, b):        # 3. 반값 아래 → 예
            return True, None, t
        prev = x               # 4.
    if gap:
        return None, 'gap', None
    return False, None, None


def compute(site):
    data = os.path.join(site, 'atlas', 'data')

    # §1 · §3 days.json
    try:
        days = read_json(os.path.join(data, 'days.json'))
    except Exception as e:
        raise CannotCompute('days.json 을 못 읽음(%s)' % type(e).__name__)
    dates = days.get('dates') if isinstance(days, dict) else None
    if not isinstance(dates, list) or not all(isinstance(x, str) for x in dates):
        raise CannotCompute('days.json dates 가 글 배열이 아님')
    for t in range(1, len(dates)):
        if not dates[t - 1] < dates[t]:
            raise CannotCompute('날이 엄격한 오름차순이 아님: %s 다음 %s'
                                % (dates[t - 1], dates[t]))
    N = len(dates)
    if N < MIN_DAYS:
        raise CannotCompute('날 수 N = %d < %d' % (N, MIN_DAYS))
    L = dates[N - 1]

    # §1 · §3 mkt.json
    try:
        mkt = read_json(os.path.join(data, 'mkt.json'))
    except Exception as e:
        raise CannotCompute('mkt.json 을 못 읽음(%s)' % type(e).__name__)
    comps = mkt.get('companies') if isinstance(mkt, dict) else None
    if not isinstance(comps, dict) or not comps:
        raise CannotCompute('mkt.json companies 가 비었음(또는 개체가 아님)')
    if mkt.get('asOf') != L:
        raise CannotCompute('mkt.asOf %r ≠ 마지막 날 %s' % (mkt.get('asOf'), L))
    codes = list(comps.keys())

    # §3 모든 번호의 co 파일
    series = {}
    k0s = {}
    for code in codes:
        v, k0 = load_co(data, code, N)
        if v is None:
            raise CannotCompute('%s: %s' % (code, k0))
        series[code] = v
        k0s[code] = k0

    # §5 「들 수 있음」 미리 셈: run[t] = t 에서 끝나는, jump 없는 붙은 짝(두 값 모두 쓸 수 있음)의 이어진 수.
    # 날 i 에 들 수 있음 ⇔ run[i] ≥ 5(짝 i−5→i−4 … i−1→i 다섯이 모두 좋음 ⇒ 값 여섯 모두 쓸 수 있음).
    runs = {}
    for code in codes:
        v = series[code]
        r = [0] * N
        for t in range(1, N):
            p = v[t - 1]
            x = v[t]
            if p is not None and x is not None and not jump(p, x):
                r[t] = r[t - 1] + 1
        runs[code] = r

    def pick(i):
        """§5 날 i 의 차례 앞 36곳 — 돌려줌 ([(−q, code)] 또는 None, 들 수 있는 곳 수)."""
        cand = []
        for code in codes:
            if runs[code][i] >= 5:
                v = series[code]
                cand.append((-(v[i] / v[i - 5]), code))   # q 큰 것 먼저 · 같으면 번호 글자 차례
        if len(cand) < TOP:
            return None, len(cand)
        return heapq.nsmallest(TOP, cand), len(cand)

    # §4 그날
    i0 = N - 1 - WINDOW
    top0, eligible = pick(i0)
    if top0 is None:
        raise CannotCompute('그날 %s 들 수 있는 곳 %d < %d' % (dates[i0], eligible, TOP))
    end0 = min(i0 + WINDOW, N - 1)

    # §6 · §7 · §10 list
    lst = []
    n_yes = 0
    n_unk = 0
    for _negq, code in top0:
        v = series[code]
        q = v[i0] / v[i0 - 5]
        half, why, t_hit = follow(v, i0, end0)
        mn = None
        mn_t = None
        for t in range(i0 + 1, end0 + 1):     # 표시용 — 그만 본 뒤의 날도 모두
            x = v[t]
            if x is not None and (mn is None or x < mn):
                mn = x
                mn_t = t
        ent = comps.get(code)
        nm = ent.get('n') if isinstance(ent, dict) else None
        lst.append({
            'code': code,
            'name': nm if isinstance(nm, str) else code,
            'rise5': js_round((q - 1) * 100 * 100) / 100,   # x = (q − 1) × 100 → Math.round(x × 100) ÷ 100
            'close': v[i0],
            'min': mn,
            'minDay': dates[mn_t] if mn_t is not None else None,
            'half': half,
            'halfDay': dates[t_hit] if half is True else None,
            'why': why,
            'jumpDay': dates[t_hit] if why == 'jump' else None,
        })
        if half is True:
            n_yes += 1
        elif half is None:
            n_unk += 1

    # §8 spread — 날 i = 5 … N − 251 모두(그날 포함)
    ns = []
    unks = []
    used = []
    for i in range(5, N - WINDOW):
        top_i, _e = pick(i)
        if top_i is None:
            continue                      # 모자라면 그 날 건너뜀
        end_i = i + WINDOW
        ni = 0
        ui = 0
        for _negq, code in top_i:
            half, _why, _t = follow(series[code], i, end_i)
            if half is True:
                ni += 1
            elif half is None:
                ui += 1
        ns.append(ni)
        unks.append(ui)
        used.append(i)
    if used:
        if used[-1] != i0 or ns[-1] != n_yes or unks[-1] != n_unk:
            raise CannotCompute('스스로 맞대기 실패: spread 의 그날 값이 §7 과 다름')
        s = sorted(ns)
        k = len(s)
        median = s[k // 2] if k % 2 == 1 else (s[k // 2 - 1] + s[k // 2]) / 2
        spread = {
            'days': k,
            'from': dates[used[0]],
            'to': dates[used[-1]],
            'min': s[0],
            'median': median,
            'max': s[-1],
            'mean': js_round(sum(ns) / k * 10) / 10,
            'lower': sum(1 for x in ns if x < n_yes),
            'higher': sum(1 for x in ns if x > n_yes),
            'unknownDays': sum(1 for x in unks if x > 0),
        }
    else:
        spread = None

    alt = compute_alt(data, N, series, k0s)

    return {
        'schema': SCHEMA,
        'rule': RULE,
        'n': n_yes,
        'of': len(lst),
        'unknown': n_unk,
        'day': dates[i0],
        'from': dates[i0 - 5],
        'until': dates[end0],
        'asOf': L,
        'window': WINDOW,
        'eligible': eligible,
        'universe': len(codes),
        'list': lst,
        'alt': alt,
        'spread': spread,
    }


def compute_alt(data, N, series, k0s):
    """§9 alt (나) — 지금 급등 칸 곳들. surge.json 문제면 None."""
    try:
        s = read_json(os.path.join(data, 'surge.json'))
    except Exception:
        return None
    if not isinstance(s, dict):
        return None
    members = s.get('members')
    if not isinstance(members, list):
        return None
    codes = [m.get('c') for m in members
             if isinstance(m, dict) and isinstance(m.get('c'), str)]
    yes = 0
    unk = 0
    start = max(0, N - WINDOW)
    for code in codes:
        if code in series:
            v, k0 = series[code], k0s[code]
        else:
            v, k0 = load_co(data, code, N)
            if v is None:
                unk += 1                  # co 파일 문제 → 모름
                continue
        peak = None
        prev = None
        cnt = 0
        gap = False
        cut = False
        hit = False
        for t in range(start, N):
            if t < k0:                    # 1. 상장 전 — 빈 칸으로 치지 않음
                continue
            x = v[t]
            if x is None:                 # 2.
                gap = True
                continue
            if prev is not None and jump(prev, x):   # 3.
                cut = True
                peak = None
            if peak is not None and below(x, peak):  # 4.
                hit = True
                break
            peak = x if peak is None else max(peak, x)   # 5.
            prev = x
            cnt += 1
        if hit:
            yes += 1
        elif cut or gap or cnt < ALT_MIN_CNT:
            unk += 1
    return {
        'rule': ALT_RULE,
        'n': yes,
        'of': len(codes),
        'unknown': unk,
        'asOf': s.get('asOf'),
        'kst': s.get('kst'),
    }


# ---- 맞대기(§11) ----

MISSING = object()


def same(a, b):
    """JSON 값 그대로 같은가 — 참 · 거짓은 수와 다르다(파이썬의 True == 1 을 막음)."""
    if a is MISSING or b is MISSING:
        return False
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a == b
    if isinstance(a, str) and isinstance(b, str):
        return a == b
    return False


def near(a, b, tol):
    if a is MISSING or isinstance(a, bool) or not isinstance(a, (int, float)):
        return False
    if b is None or isinstance(b, bool) or not isinstance(b, (int, float)):
        return False
    return abs(a - b) <= tol + EPS


def show(x):
    if x is MISSING:
        return '(칸 없음)'
    if isinstance(x, float) and x.is_integer() and abs(x) < 2 ** 53:
        x = int(x)                       # 3040.0 → 3040(JSON 처럼 찍음)
    return json.dumps(x, ensure_ascii=False)


def compare(cand, mine):
    diffs = []
    notes = []

    def diff(field, c, m):
        diffs.append('%s — 후보 %s · 따로 셈 %s' % (field, show(c), show(m)))

    if not isinstance(cand, dict):
        diff('(후보 전체)', cand, '{…}')
        return diffs, notes
    for k in TOP_KEYS:
        if not same(cand.get(k, MISSING), mine[k]):
            diff(k, cand.get(k, MISSING), mine[k])

    cl = cand.get('list', MISSING)
    ml = mine['list']
    if not isinstance(cl, list):
        diff('list', cl, '[%d곳]' % len(ml))
    else:
        if len(cl) != len(ml):
            diff('list 길이', len(cl), len(ml))
        for j in range(min(len(cl), len(ml))):
            ci = cl[j]
            mi = ml[j]
            if not isinstance(ci, dict):
                diff('list[%d]' % j, ci, mi['code'])
                continue
            for k in ITEM_KEYS:
                if not same(ci.get(k, MISSING), mi[k]):
                    diff('list[%d].%s(%s)' % (j, k, mi['code']), ci.get(k, MISSING), mi[k])
            if not near(ci.get('rise5', MISSING), mi['rise5'], TOL_RISE5):
                diff('list[%d].rise5(%s) ±%s' % (j, mi['code'], TOL_RISE5),
                     ci.get('rise5', MISSING), mi['rise5'])
            extra = sorted(set(ci) - set(ITEM_KEYS) - {'rise5'})
            if extra and j == 0:
                notes.append('참고: list 곳마다 표에 없는 칸 %s(맞대지 않음)' % ', '.join(extra))

    ca = cand.get('alt', MISSING)
    ma = mine['alt']
    if ma is None or ca is None or not isinstance(ca, dict):
        if not (ma is None and ca is None):
            diff('alt(null 인지)', ca if not isinstance(ca, dict) else '{…}',
                 None if ma is None else '{…}')
    else:
        for k in ALT_KEYS:
            if not same(ca.get(k, MISSING), ma[k]):
                diff('alt.%s' % k, ca.get(k, MISSING), ma[k])

    cs = cand.get('spread', MISSING)
    ms = mine['spread']
    if ms is None or cs is None or not isinstance(cs, dict):
        if not (ms is None and cs is None):
            diff('spread(null 인지)', cs if not isinstance(cs, dict) else '{…}',
                 None if ms is None else '{…}')
    else:
        for k in SPREAD_KEYS:
            if not same(cs.get(k, MISSING), ms[k]):
                diff('spread.%s' % k, cs.get(k, MISSING), ms[k])
        if not near(cs.get('mean', MISSING), ms['mean'], TOL_MEAN):
            diff('spread.mean ±%s' % TOL_MEAN, cs.get('mean', MISSING), ms['mean'])

    extra = sorted(set(cand) - ALL_KEYS)
    if extra:
        notes.append('참고: 표에 없는 칸 %s(맞대지 않음)' % ', '.join(extra))
    return diffs, notes


def main(argv=None):
    ap = argparse.ArgumentParser(
        prog='half36_verify.py',
        description='반값 셈(h36-a) 따로 세기 — 결정표 half36.md §11')
    ap.add_argument('--site', default='site', help='사이트 폴더(없으면 site)')
    ap.add_argument('--json', required=True, help='맞댈 후보 파일')
    args = ap.parse_args(argv)
    t_start = time.time()

    try:
        cand = read_json(args.json)
    except Exception as e:
        print('half36_verify: 셈을 못 함 — 후보 파일을 못 읽음 %s(%s)'
              % (args.json, type(e).__name__), file=sys.stderr)
        return 2
    try:
        mine = compute(args.site)
    except CannotCompute as e:
        print('half36_verify: 셈을 못 함 — %s' % e, file=sys.stderr)
        return 2

    diffs, notes = compare(cand, mine)
    secs = time.time() - t_start
    for line in notes:
        print(line)
    sp = mine['spread']
    alt = mine['alt']
    summary = ('n %d / %d · 모름 %d · 그날 %s(%s ~ %s) · 들 수 있음 %d / %d · '
               % (mine['n'], mine['of'], mine['unknown'], mine['day'], mine['from'],
                  mine['until'], mine['eligible'], mine['universe']))
    summary += ('펼침 %s · ' % ('없음' if sp is None else
                              '%d날 %s ~ %s · 가장 적음 %d · 가운데 %s · 가장 많음 %d · 평균 %s'
                              % (sp['days'], sp['from'], sp['to'], sp['min'],
                                 sp['median'], sp['max'], sp['mean'])))
    summary += ('alt %s · ' % ('없음' if alt is None else
                             '%d / %d · 모름 %d' % (alt['n'], alt['of'], alt['unknown'])))
    summary += '%.1f초' % secs
    if diffs:
        print('half36_verify: 틀림 %d칸' % len(diffs))
        for line in diffs[:80]:
            print('  ' + line)
        if len(diffs) > 80:
            print('  … 외 %d칸' % (len(diffs) - 80))
        print('따로 셈: ' + summary)
        return 1
    print('half36_verify: 맞음 · 틀림 0 · ' + summary)
    return 0


if __name__ == '__main__':
    sys.exit(main())
