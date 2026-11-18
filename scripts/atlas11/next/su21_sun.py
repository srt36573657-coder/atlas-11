"""손자병법 형세(주문 1114-0922 · 사장님 2026-11-14 08:22 「요즘 주식시장을 병법으로 빚대서 첫페이지에 상황보고를 하고 / 이런 상황일 때 /
   살아남을수 있는 전술들을 / 자동으로 배열을 위에서 아래로 해 / 손실을 보지 않게 최우선에 두며 그다음이 수익이다」 — docs/design/sun-2026-11-14/order-0922.txt)

   ① 땅 읽기 — 판 날의 우량주 365곳 종가로 요즘 장을 다섯 땅 가운데 하나로 읽는다(무너지는 땅 · 흔들리는 땅 · 기세가 오른 땅 · 좁은 길 · 잔잔한 땅).
   ② 꾀 줄 세우기 — 지난 날마다 서른여섯 꾀(삼십육계 · su21_s36.lists36)가 고른 일곱 곳을 닷새 뒤 값으로 센다.
      오늘과 같은 땅이었던 날만 모아 「덜 잃은 차례」로 세운다 — 잃은 번이 적은 꾀 → 잃을 때 덜 잃은 꾀 → 평균이 나은 꾀.
   앞날을 맞히지 않는다 · 사고팔기를 권하지 않는다 · 지난 기록을 센 것만(docs/손자병법_본질.md).
"""
import numpy as np
import su21_s36 as S36

RULE_ID = 'sun-v1'
WIN3_RULE = 'win3-v1'   # 지금 땅의 꾀 셋(주문 1117-1859)
WIN3_GAP, WIN3_TAIL = 0.02, 0.002   # 잃은 몫이 아무렇게나 일곱보다 0.02(열 번에 0.2번) 넘게 적고 · 가장 나빴던 열에 한 주가 0.002(100원에 0.2원) 넘게 얕음
H = 5          # 고른 날 뒤 닷새(한 주) 값으로 셈
WIN = 500      # 지난 이만큼 거래일까지 봄(2년 남짓 · 꾀마다 날마다 다시 고름)
MIN_N = 20     # 같은 땅 날이 이만큼 안 되면 모든 날로 셈(적은 날로 줄 세우지 않음)
PATH = 20      # 첫 화면 띠 — 지난 스무 거래일의 땅

# 땅 다섯 — 이름 · 손자병법 편 · 그 편 말씀(한글 풀이) · 이 땅에서 먼저 볼 것(읽는 법 한 줄 · 사고팔기 권하기가 아님)
LANDS = {
    'fall':   {'name': '내리는 시장', 'pian': '군형편', 'quote': '먼저 지지 않게 해 두고, 이길 수 있는 때를 기다린다.', 'do': '지금은 버는 것보다 잃지 않는 것이 먼저예요.'},
    'shake':  {'name': '흔들리는 시장', 'pian': '군쟁편', 'quote': '움직이지 않을 때는 산처럼 버틴다.', 'do': '지금은 서두르지 않는 것이 먼저예요.'},
    'rise':   {'name': '오르는 시장', 'pian': '병세편', 'quote': '잘 싸우는 사람은 이길 길을 기세에서 찾는다.', 'do': '오를 때도 잃지 않는 것이 먼저예요.'},
    'narrow': {'name': '쏠린 시장', 'pian': '허실편', 'quote': '물이 높은 곳을 피해 낮은 곳으로 흐르듯, 단단한 곳을 피하고 빈 곳을 친다.', 'do': '몇몇 회사만 크게 오르고 있어요.'},
    'calm':   {'name': '잔잔한 시장', 'pian': '군형편', 'quote': '이김은 알아볼 수 있어도, 억지로 만들 수는 없다.', 'do': '억지로 이기려 하지 말고 지켜볼 때예요.'},
}
ORDER = ['fall', 'shake', 'rise', 'narrow', 'calm']   # 읽는 차례(앞에 맞는 땅이 먼저)
B_LO, B_HI = 0.4, 0.6     # 한 달 전보다 오른 회사 몫 — 이보다 적으면(가운데 회사도 내림) 내리는 땅 · 많으면(가운데 회사도 오름) 오르는 땅
SHAKE = 1.5               # 스무 날 오르내림이 120날 오르내림의 이만큼 넘으면 흔들리는 땅
RULE = {   # 다섯 땅을 가르는 법(쉬운 말 · 첫 쪽 「다섯 땅은 이렇게 나눠요」)
    'fall': '한 달 전보다 오른 회사가 열 곳에 네 곳도 안 되고, 한가운데 회사도 내린 때예요.',
    'shake': '요즘 스무 날 동안 하루 오르내린 폭이 지난 넉 달 평소의 1.5배를 넘는 때예요.',
    'rise': '오른 회사가 열 곳에 여섯 곳을 넘고, 한가운데 회사도 오른 때예요.',
    'narrow': '평균은 올랐지만 오른 회사가 절반이 안 되는 때예요. 몇몇 회사만 크게 오른 거예요.',
    'calm': '위의 네 가지에 들지 않는 조용한 때예요.',
}
RANK_Q = {'pian': '군형편', 'quote': '잘 싸우는 사람은 지지 않을 자리에 먼저 선다.'}   # 꾀 차례 머리 말씀(덜 잃은 차례의 까닭)


def market(P, t):
    """판 날 t 의 장 모습 — n(값이 있는 회사) · up(한 달 전보다 오른 회사) · mid(가운데 회사의 한 달) · mean(평균 한 달) · shake(흔들림)"""
    if P is None or t < 120: return None
    with np.errstate(invalid='ignore', divide='ignore'):
        r20 = P[:, t] / P[:, t - 20] - 1
        ok = np.isfinite(r20)
        if ok.sum() < 30: return None
        d = np.nanmean(P[:, t - 119:t + 1] / P[:, t - 120:t] - 1, axis=0)   # 365곳 똑같이 담은 하루 오르내림(120날)
    d = d[np.isfinite(d)]
    s120 = float(np.std(d)) if len(d) >= 60 else float('nan')
    s20 = float(np.std(d[-20:])) if len(d) >= 20 else float('nan')
    return {'n': int(ok.sum()), 'up': int((r20[ok] > 0).sum()), 'mid': float(np.median(r20[ok])), 'mean': float(np.mean(r20[ok])),
            'shake': s20 / s120 if s120 > 0 else float('nan')}


def land(m):
    """장 모습 → 땅 열쇠(ORDER 차례로 처음 맞는 땅)"""
    if not m: return None
    b = m['up'] / m['n']
    if b < B_LO and m['mid'] < 0: return 'fall'
    if np.isfinite(m['shake']) and m['shake'] >= SHAKE: return 'shake'
    if b > B_HI and m['mid'] > 0: return 'rise'
    if m['mean'] > 0 and b <= 0.5: return 'narrow'
    return 'calm'


def _stat(R):
    R = np.asarray(R, float)
    if not len(R): return {'n': 0}
    L = R[R < 0]
    return {'n': int(len(R)), 'lose': int(len(L)), 'avgLoss': round(float(L.mean()), 4) if len(L) else 0.0,
            'worst': round(float(R.min()), 4), 'avg': round(float(R.mean()), 4)}


def _key(k, s):
    """덜 잃은 차례 — 셀 날이 없으면 맨 뒤 · 잃은 몫이 적은 꾀 → 잃을 때 덜 잃은 꾀 → 가장 크게 잃은 주가 덜한 꾀 → 평균이 나은 꾀 → 꾀 차례"""
    if not s.get('n'): return (1, 0, 0, 0, 0, k)
    return (0, round(s['lose'] / s['n'], 3), -s['avgLoss'], -s['worst'], -s['avg'], k)


def sun(codes, IX, P, T, cap, dates, vrows=None, win=WIN, h=H, t_conf=None):
    """codes · IX · P(회사 × 날 종가) · T(판 날 번호) · cap(몸집) · dates · vrows(거래량 줄 · 없으면 거래량 다섯 꾀는 셀 수 없음)
       t_conf(주문 1118-1239 · 지금 시장) — 마지막으로 굳은 날 번호. T 가 장중 값(굳지 않은 값) 날이면 땅만 그 값으로 가리고,
       지난 기록 셈(닷새 뒤 값)은 굳은 날까지만 쓴다(굳지 않은 값을 지난 기록에 섞지 않음)
       → 첫 화면 형세 자료(su21.json 의 sun) · 셀 수 없으면 None"""
    if P is None or T < S36.NEED_T + h + MIN_N: return None
    m = market(P, T)
    key = land(m)
    if not key: return None
    vmat = None
    if vrows:
        vmat, _ = S36.vol_mats(codes, vrows, dates, len(dates) - 1)
    tcf = T if t_conf is None else min(T, t_conf)
    t0 = max(S36.NEED_T, tcf - h - win + 1)
    days = list(range(t0, tcf - h + 1))          # 닷새 뒤 값이 굳은 날 안에 있는 날만(앞날 값 · 굳지 않은 값을 쓰지 않음)
    landOf, ret = {}, {k: {} for k in S36.KINDS}
    idx = {c: j for j, c in enumerate(codes)}
    cR, cP0, cS = {}, {}, {}   # 크게 덜 잃는 일곱(주문 1117-1731) — 날마다 같은 법으로 다시 골라 닷새 뒤 평균 · 그날 아무렇게나 일곱이 잃을 몫 · 아무렇게나 일곱 예순 판
    rngc = np.random.default_rng(1117)
    for t in days:
        landOf[t] = land(market(P, t))
        R = S36.lists36(codes, IX, P, t, cap, dates=dates, vmat=vmat)
        with np.errstate(invalid='ignore', divide='ignore'):
            for k, L in R['lists'].items():
                if not L: continue
                j = np.array([idx[c] for c in L])
                r = P[j, t + h] / P[j, t] - 1
                r = r[np.isfinite(r)]
                if len(r): ret[k][t] = float(r.mean())
            cm = S36.calm7(codes, IX, P, t, R['lists'])
            rr = P[:, t + h] / P[:, t] - 1
        ok = np.isfinite(rr)
        if ok.sum() >= 7:   # 그날 아무렇게나 고른 일곱(400판) — 잃을 몫 · 예순 판(꾀 셋 · 크게 덜 잃는 일곱이 함께 씀)
            rv = rr[ok]; m7 = rv[np.argpartition(rngc.random((400, len(rv))), 7, axis=1)[:, :7]].mean(1)
            cP0[t], cS[t] = float((m7 < 0).mean()), m7[:60]
            if cm:
                x = rr[[idx[c] for c, _, _ in cm]]; x = x[np.isfinite(x)]
                if len(x): cR[t] = float(x.mean())
    same = [t for t in days if landOf.get(t) == key]
    useAll = len(same) < MIN_N
    use = set(days if useAll else same)
    stats = {k: _stat([v for t, v in ret[k].items() if t in use]) for k in S36.KINDS}
    rank = sorted(S36.KINDS, key=lambda k: _key(k, stats[k]))
    # 지금 땅의 꾀 셋(주문 1117-1859 · 사장님 2026-11-17(마카오) 18:59 「지금 주식상황에 전략적으로 승리 할수 있는 병법 3가지를 선정해서 첫 페이지애 잘보이게 하라」
    #   — docs/design/sonja-win3-2026-11-17/order-1859.txt) — 덜 잃은 차례(본질 8)를 위에서부터 보며, 같은 날들에서
    #   ① 잃은 번이 그날 아무렇게나 고른 일곱이 잃을 번보다 적고 ② 가장 나빴던 열에 한 주(꼬리)가 아무렇게나 일곱의 꼬리보다 얕은 꾀 · 센 날이 MIN_N 넘게 · 셋까지(모자라면 채우지 않음)
    #   앞날을 맞히지 않음 — 지난 같은 땅 기록을 셀 뿐 · 사고팔기를 권하지 않음
    for k in S36.KINDS:
        tk = [t for t in sorted(ret[k]) if t in use and t in cP0]
        if not tk or not stats[k].get('n'): continue
        a = np.array([ret[k][t] for t in tk]); n = len(a); k10 = max(1, n // 10); S7 = np.array([cS[t] for t in tk])
        stats[k]['exp'] = round(float(sum(cP0[t] for t in tk)), 2)
        stats[k]['tail'] = round(float(np.sort(a)[:k10].mean()), 4)
        stats[k]['tail7'] = round(float(np.sort(S7[np.arange(n)[None, :], rngc.integers(0, S7.shape[1], size=(300, n))], axis=1)[:, :k10].mean()), 4)
    winOk = lambda st: st.get('n', 0) >= MIN_N and 'exp' in st and (st['exp'] - st['lose']) / st['n'] >= WIN3_GAP and st['tail'] - st['tail7'] >= WIN3_TAIL   # 화면 숫자로도 차이가 보이게(열 번에 0.2번 · 100원에 0.2원 넘게)
    win3 = {'rule': WIN3_RULE, 'minN': MIN_N, 'gap': WIN3_GAP, 'tailGap': WIN3_TAIL, 'cand': sum(1 for k in rank if winOk(stats[k])), 'ks': [k for k in rank if winOk(stats[k])][:3]}
    cnt = {L: sum(1 for t in days if landOf.get(t) == L) for L in ORDER}
    path = [land(market(P, t)) for t in range(max(120, T - PATH + 1), T + 1)]
    D = LANDS[key]
    calm = None
    tc = sorted(cR)
    if len(tc) >= MIN_N:   # 모든 날(확인한 법 그대로 — 땅으로 나누지 않음)
        a = np.array([cR[t] for t in tc]); p0 = np.array([cP0[t] for t in tc]); S7 = np.array([cS[t] for t in tc]); n = len(a); k10 = max(1, n // 10)
        tails = np.sort(S7[np.arange(n)[None, :], rngc.integers(0, S7.shape[1], size=(300, n))], axis=1)[:, :k10].mean(1)
        tail = float(np.sort(a)[:k10].mean())
        calm = {'rule': S36.CALM_RULE, 'h': h, 'n': n, 'lose': int((a < 0).sum()), 'exp': round(float(p0.sum()), 2), 'tail': round(tail, 4), 'tail7': round(float(tails.mean()), 4),
                'beat': round(float((tails < tail).mean()), 3), 'avg': round(float(a.mean()), 4),   # beat = 아무렇게나 일곱 300판 가운데 가장 나쁜 열에 한 주가 이보다 깊었던 몫
                'from': dates[tc[0]] if dates and tc[0] < len(dates) else None, 'to': dates[tc[-1]] if dates and tc[-1] < len(dates) else None}
    return {'rule': RULE_ID, 'calm': calm, 'win3': win3, 'h': h, 'win': win, 'minN': MIN_N, 'day': dates[T] if dates and T < len(dates) else None,
            'conf': dates[tcf] if dates and tcf < len(dates) else None, 'prov': tcf < T,   # 지금 시장(주문 1118-1239) — 땅은 장중 값 · 지난 기록은 굳은 날까지
            'land': key, 'name': D['name'], 'pian': D['pian'], 'quote': D['quote'], 'do': D['do'], 'rankQ': RANK_Q,
            'm': {'n': m['n'], 'up': m['up'], 'mid': round(m['mid'], 4), 'mean': round(m['mean'], 4), 'shake': round(m['shake'], 2) if np.isfinite(m['shake']) else None},
            'hist': {'days': len(days), 'same': len(same), 'all': useAll, 'from': dates[days[0]] if days else None, 'to': dates[days[-1]] if days else None, 'cnt': cnt},
            'path': path, 'lands': {L: {'name': LANDS[L]['name'], 'pian': LANDS[L]['pian'], 'quote': LANDS[L]['quote'], 'rule': RULE[L], 'n': cnt[L]} for L in ORDER},
            'rank': [dict(k=k, **stats[k]) for k in rank]}


if __name__ == '__main__':
    import sys
    if '--selftest' in sys.argv:
        rng = np.random.default_rng(7)
        N, Tn = 60, 420
        P = 100 * np.exp(np.cumsum(rng.normal(0.0003, 0.015, (N, Tn)), axis=1))
        codes = ['%06d' % i for i in range(N)]
        IX = np.arange(N) % 6
        cap = np.full(N, 5000.0)
        dates = ['d%03d' % i for i in range(Tn)]
        S = sun(codes, IX, P, Tn - 1, cap, dates, win=120)
        assert S and S['land'] in LANDS and len(S['rank']) == 36 and S['hist']['days'] == 120 - 0 or S['hist']['days'] > 0
        assert all(r['n'] == 0 for r in S['rank'] if r['k'] in S36.BY)            # 거래량이 없으면 거래량 다섯은 셀 수 없음 → 맨 뒤
        zero = [r['k'] for r in S['rank'] if not r['n']]                        # 셀 날이 없는 꾀(거래량 다섯 · 세 거름을 지난 날이 없던 꾀 — 주문 1116-1539 채우지 않음) → 맨 뒤 · 꾀 차례
        assert set(S36.BY) <= set(zero) and [r['k'] for r in S['rank'][-len(zero):]] == sorted(zero)
        ks = [_key(r['k'], r) for r in S['rank']]; assert ks == sorted(ks)
        P2 = P.copy(); P2[:, -25:] = P2[:, -26:-25] * np.linspace(1, 0.8, 25)    # 모두 내림 → 무너지는 땅
        assert land(market(P2, Tn - 1)) == 'fall'
        w = S['win3']   # 지금 땅의 꾀 셋(주문 1117-1859) — 덜 잃은 차례 안에서 · 두 조건 · 셋까지 · 차례 그대로
        assert w['rule'] == WIN3_RULE and len(w['ks']) <= 3 and len(w['ks']) <= w['cand'] and [r['k'] for r in S['rank'] if r['k'] in w['ks']] == w['ks'], w
        okw = lambda r: r.get('n', 0) >= MIN_N and 'exp' in r and (r['exp'] - r['lose']) / r['n'] >= WIN3_GAP and r['tail'] - r['tail7'] >= WIN3_TAIL
        assert all(okw(next(r for r in S['rank'] if r['k'] == k)) for k in w['ks']), w
        first = [r['k'] for r in S['rank'] if okw(r)][:3]; assert first == w['ks'], (first, w)
        c = S['calm']   # 크게 덜 잃는 일곱(주문 1117-1731) — 꾸민 자료에서는 없을 수도 있음 · 있으면 뜻이 맞아야 함
        assert c is None or (c['rule'] == S36.CALM_RULE and c['n'] >= MIN_N and 0 <= c['lose'] <= c['n'] and 0 <= c['exp'] <= c['n'] and c['tail'] <= c['avg'] and 0 <= c['beat'] <= 1 and c['from'] <= c['to']), c
        # 지금 시장(주문 1118-1239) — 장중 값 한 날을 붙여도 지난 기록 셈은 굳은 날까지 그대로 · 땅이 같으면 차례 · 꾀 셋도 같음
        Pn = np.hstack([P, P[:, -1:] * 1.0005]); Sn = sun(codes, IX, Pn, Tn, cap, dates + ['d%03d' % Tn], win=120, t_conf=Tn - 1)
        assert Sn and Sn['prov'] is True and Sn['day'] == 'd%03d' % Tn and Sn['conf'] == dates[-1] and S['prov'] is False and S['conf'] == S['day'], (Sn and (Sn['prov'], Sn['day'], Sn['conf']))
        assert {k: Sn['hist'][k] for k in ('days', 'from', 'to')} == {k: S['hist'][k] for k in ('days', 'from', 'to')}, (Sn['hist'], S['hist'])
        assert Sn['land'] != S['land'] or ([r['k'] for r in Sn['rank']] == [r['k'] for r in S['rank']] and Sn['win3']['ks'] == S['win3']['ks']), (Sn['land'], S['land'])
        assert len(Sn['path']) == len(S['path']) and Sn['path'][:-1] == S['path'][1:], (Sn['path'], S['path'])
        print('ok', S['land'], S['hist']['days'], S['hist']['same'], S['rank'][0]['k'], 'calm', c and (c['n'], c['lose'], c['tail'], c['tail7']), 'win3', w['ks'], w['cand'])
