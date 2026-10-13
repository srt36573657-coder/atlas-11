#!/usr/bin/env python3
"""린치 조건(ly-v1) — 피터 린치가 말한 조건 가운데 모음 자료로 셀 수 있는 것만(ml-v1 의 한 갈래 · ml.py 가 부름)
사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」 → 06:03 「가」(린치 조건 18곳을 사이트에) → 06:05 「가」(멍거 26곳과 함께 41곳)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
자료     모음(universe.json bundle)의 네이버 연간 표 — 확정 결산 마지막 3해의 EPS(한 주가 번 돈) · 주당배당금 · 모음 날(universe.json asOf) 종가 · 모음의 PER
         (이어 받은 일봉 · 회차 날 값은 안 씀 → 같은 모음이면 회차마다 같은 곳 · 새 결산이 담긴 모음이 들어오면 그날 값으로 다시 셈)
셈 규칙  보통주만(ml.py) · 3해 결산이 없거나 첫 해 · 끝 해 EPS · 모음 날 종가가 비면 「모름」(0 으로 채우지 않음)
① 빠르기  첫 해 → 끝 해 EPS 의 해마다 커진 비율 g = (끝 ÷ 첫)^(1/2) − 1 이 20% 이상 25% 이하(첫 해 · 끝 해 EPS 가 0 이하면 성장률을 못 셈 = loss)
          AAII 2021(Hageman) 「Lynch prefers to invest in companies with earnings expanding at moderately fast rates (20% to 25%)」
② 값      (g + 배당 수익률) ÷ PER ≥ 2 — 배당 수익률 = 끝 해 주당배당금 ÷ 모음 날 종가 · PER = 모음 값(0 이하 · 빔 = 「모름」)
          린치 「One Up on Wall Street」(1989) — 「Less than a 1 is poor, and 1.5 is okay, but what you're really looking for is a 2 or better」
          (AAII 2021 은 같은 뜻을 PER ÷ (성장률 + 배당) ≤ 0.5 로 적음)
숫자로 못 세는 린치 조건  빚(정한 숫자 없이 업종과 견줌) · 「성장하지 않는 업종 안」 — 사람이 볼 몫(화면에 밝힘)
한계     린치는 긴 성장률을 봤는데 자료는 2년(3해 결산의 처음과 끝) · 값은 모음 날 하루 값
같은 원문이면 언제나 같은 곳 · 따로 세기 = ml_verify.mjs(노드로 처음부터)
"""
import json

VERSION = 'ly-v1'
NAME = '린치 조건'
GLO, GHI, SCORE = 20.0, 25.0, 2.0
WHY_IN = '한 주 이익이 해마다 20 ~ 25% 컸고 · 크는 빠르기에 견줘 값이 쌈'
STOP = {'q': 1, 'loss': 2, 'g': 3, 'peg': 4}
STOP_NAME = {'q': '자료 보기', 'loss': '이익 성장률 세기', 'g': '① 한 주 이익이 해마다 20 ~ 25% 크기', 'peg': '② 크는 빠르기에 견줘 값이 싸기'}


def num(s):
    if s is None:
        return None
    t = str(s).replace(',', '').strip()
    if t in ('', '-', 'N/A'):
        return None
    try:
        return float(t)
    except ValueError:
        return None


def iso8(d):
    return '%s-%s-%s' % (d[:4], d[4:6], d[6:])


def inputs(bundle, asof):
    """모음 → {번호: {'keys': 실적 해 3(오래된 → 새), 'eps': [3], 'dps': [3], 'px': 모음 날(≤ asof 마지막) 종가, 'pxDay'}}"""
    a8 = asof.replace('-', '')
    out = {}
    for c, s in (bundle.get('stocks') or {}).items():
        f = (s or {}).get('finance') or {}
        keys, eps, dps = [], [], []
        if f.get('text'):
            try:
                t = json.loads(f['text'])['financeInfo']
                keys = [x['key'] for x in t['trTitleList'] if x.get('isConsensus') == 'N'][-3:]
                rows = {r['title']: (r.get('columns') or {}) for r in t['rowList']}
                eps = [num(((rows.get('EPS') or {}).get(k) or {}).get('value')) for k in keys]
                dps = [num(((rows.get('주당배당금') or {}).get(k) or {}).get('value')) for k in keys]
            except (ValueError, KeyError, TypeError):
                keys, eps, dps = [], [], []
        cl = [r for r in (((s or {}).get('fchart') or {}).get('rows') or []) if r[0] <= a8 and r[4] and r[4] > 0]
        out[c] = {'keys': keys, 'eps': eps, 'dps': dps, 'px': cl[-1][4] if cl else None, 'pxDay': iso8(cl[-1][0]) if cl else None}
    return out


def judge(r, x):
    """한 회사(후보 표 줄 · 모음 PER) + 모음 값 → (s, 까닭, 값) — s: in · q(모름) · loss(성장률 못 셈) · g(①) · peg(②)"""
    if not x or len(x['keys']) < 3:
        return 'q', '? 3년 성적표가 다 있지 않음', None
    k0, k2 = x['keys'][0], x['keys'][2]
    e0, e2, d2, px = x['eps'][0], x['eps'][2], x['dps'][2], x['px']
    if e0 is None or e2 is None or px is None:
        return 'q', '? 한 주가 번 돈 또는 값이 비어 있음', None
    per = r.get('per')
    v = {'years': [k0[:4], k2[:4]], 'eps': [e0, e2], 'dps': d2, 'px': px, 'pxDay': x['pxDay'], 'per': per}
    if not e0 > 0 or not e2 > 0:
        return 'loss', '%s년 또는 %s년에 한 주 이익이 없어 성장률을 못 셈' % (k0[:4], k2[:4]), v
    g = ((e2 / e0) ** 0.5 - 1) * 100
    v['g'] = g
    if not (GLO <= g <= GHI):
        return 'g', '한 주 이익이 해마다 %.1f%% 큼 — 20 ~ 25%% 밖' % g, v
    if per is None or not per > 0:
        return 'q', '? 1년 이익의 몇 배 값이 비어 있음', v
    y = (d2 or 0) / px * 100
    sc = (g + y) / per
    v['yld'], v['score'] = y, sc
    if sc < SCORE:
        return 'peg', '(성장 %.1f + 배당 %.1f) ÷ 이익의 %.1f배 = %.2f — 2 밑' % (g, y, per, sc), v
    return 'in', WHY_IN, v


def conds(asof_word):
    return [
        {'k': 'g', 't': '한 주 이익이 해마다 20 ~ 25% 큼', 'd': '3년 성적표의 처음 해 → 끝 해 한 주가 번 돈으로 해마다 몇 % 컸는지 셈 · 20% 이상 25% 이하',
         'q': '이익이 해마다 20 ~ 25%로 알맞게 빨리 크는 회사를 좋아한다', 'who': '피터 린치 — AAII 2021 정리'},
        {'k': 'peg', 't': '크는 빠르기에 견줘 값이 쌈', 'd': '(해마다 큰 %% + 배당 %%) ÷ 1년 이익의 몇 배 값 — 2 넘음 · 값은 %s 값' % asof_word,
         'q': '1 밑이면 나쁘고 1.5 는 괜찮고, 정말 찾는 것은 2 넘는 것', 'who': '피터 린치 「월가의 영웅」(1989)'},
    ]
