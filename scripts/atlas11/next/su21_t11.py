"""큐피트 — 한국 투자자 특징 열하나로 고른 열한 묶음(주문 1113-2033)
  사장님 2026-11-13 20:33(서울) 「지금 총 다섯 까지잖아 일 이 삼 등 부터 돈꽃 저기 그리고 불 장 그 다음에 조용히 다섯 가지잖아 이걸 11 가지로 만든다면 어떻게 만들지
    이전 11 개를 해가지고 저기 만들어 봐 그 그런 다음에 정상까지 다 연결 시켜 봐」 · 20:35 「어 맞아」(이해 보고 아홉 줄 — docs/design/t11-2026-11-13/order-2033.txt)
  열하나 = 전에 도우미 열하나가 찾은 한국 투자자 특징(docs/design/su-culture-2026-11-09/traits11.md · site/su/data/ant11.json 차례 그대로)
  묶음마다 그날 그 특징이 가장 센 회사 일곱 곳 — 우량주 365곳(board.json) 가운데 · 값이 늦은 회사는 뺌 · 같은 점수면 번호 차례
    종가로 재는 일곱(su21_culture.traits 의 값을 그대로 씀): 테마 몰림 · 한방 쫓기 · 빚투 쏠림 · 본전 버팀 · 국민주 · 눈길 사기 · 내릴 때 삼
    거래량으로 재는 넷(올리기 작업만 네이버 일봉 [날, 종가, 거래량]을 받음 — su21_vol.mjs · docs/design/su-volume-2026-11-10/volume4.md 정의):
      당일치기 · 작은 회사 · 따라사기 · 새내기(나이 · 처음 온 때는 계좌 자료에만 있어 가장 가까운 모습 — 크게 뛴 날이 거래량이 크게 는 날과 겹침)
    거래량 자료가 없거나 그날 판 날 값이 아니면 그 넷은 빈 목록(까닭을 적음) — 지어낸 값 없음
  앞날을 맞히지 않음 — 지금 모습을 셀 뿐 · 사고팔기를 권하지 않음"""
import math
import numpy as np

RULE_ID = 't11-v1'
K = 7
KINDS = ['dtr', 'herd', 'lot', 'casc', 'hold', 'big', 'attn', 'small', 'follow', 'dip', 'newb']   # ant11.json 차례(1 ~ 11)
NAME = {'dtr': '당일치기', 'herd': '테마 몰림', 'lot': '한방 쫓기', 'casc': '빚투 쏠림', 'hold': '본전 버팀', 'big': '국민주', 'attn': '눈길 사기',
        'small': '작은 회사', 'follow': '따라사기', 'dip': '내릴 때 삼', 'newb': '새내기'}
SAY = {'dtr': '닷새 동안 사고판 양이 주식 수에 견줘 가장 많은 곳이에요.',
       'herd': '같은 업종 회사가 함께 시장보다 앞선 곳이에요.',
       'lot': '닷새 안에 하루 가장 크게 뛴 곳이에요.',
       'casc': '열흘 안에 크게 내린 날이 잇달아 가장 많은 곳이에요.',
       'hold': '업종은 버티는데 한 달 동안 시장보다 가장 많이 뒤진 곳이에요.',
       'big': '365곳 가운데 몸집이 가장 큰 곳이에요.',
       'attn': '닷새 안에 평소보다 크게 움직인 날이 가장 많은 곳이에요.',
       'small': '몸집은 작은데 사고판 양이 많은 곳이에요.',
       'follow': '사고판 양이 갑자기 크게 늘고 그 회사만 오른 곳이에요.',
       'dip': '닷새 동안 같은 업종보다 혼자 가장 많이 내린 곳이에요.',
       'newb': '크게 뛴 날과 사고판 양이 크게 는 날이 겹친 곳이에요.'}
BY = {'dtr': 'vol', 'small': 'vol', 'follow': 'vol', 'newb': 'vol'}   # 거래량이 있어야 잼
FOLLOW_X, NEWB_X, NEWB_UP, FOLLOW_EX = 5.0, 3.0, math.log(1.05), 0.03
VOL_MIN = 0.9   # 그날 거래량을 받은 회사가 365곳 가운데 이만큼 넘을 때만 넷을 셈(덜 받은 날 일부 회사만으로 고르지 않음 — 한 번 적으면 고치지 않으므로)


def _rank(codes, score, ok, k=K):
    """점수가 큰 차례로 k 곳(점수가 없거나 ok 가 거짓이면 뺌) · 같은 점수면 번호 차례"""
    g = [(score[j], codes[j]) for j in range(len(codes)) if ok[j] and score[j] is not None and np.isfinite(score[j])]
    g.sort(key=lambda t: (-t[0], t[1]))
    return [c for _, c in g[:k]]


def vol_mats(codes, rows, dates, t):
    """[날, 종가, 거래량] 줄 → 날 차례(dates · 판 날 t 까지) 거래량 · 종가 행렬(없으면 nan) · 그날 값이 있는 회사 수"""
    D = {d.replace('-', ''): i for i, d in enumerate(dates[:t + 1])}
    V = np.full((len(codes), t + 1), np.nan); C = np.full((len(codes), t + 1), np.nan)
    for j, c in enumerate(codes):
        for r in rows.get(c) or []:
            i = D.get(str(r[0]))
            if i is None or len(r) < 3: continue
            if isinstance(r[1], (int, float)) and r[1] > 0: C[j, i] = r[1]
            if isinstance(r[2], (int, float)) and r[2] >= 0: V[j, i] = r[2]
    return V, C, int(np.isfinite(V[:, t]).sum())


def lists11(codes, IX, P, t, cap, val, on, late=(), vol=None, dates=None):
    """codes(365 · 차례) · IX(업종 번호) · P(종가 행렬 회사 × 날) · t(판 날 번호) · cap(몸집 · 억 원) · val · on(su21_culture.traits 결과)
       · vol({번호: [[YYYYMMDD, 종가, 거래량], …]} 또는 None) → {lists: {k: [번호 일곱]}, why: {k: 까닭}, volDay, volN}"""
    if not on or P is None:
        return {'lists': {k: [] for k in KINDS}, 'why': {k: '지난 값이 모자라 못 셈' for k in KINDS}, 'volDay': None, 'volN': 0}
    N = len(codes)
    ok = np.array([c not in late and np.isfinite(P[j, t]) for j, c in enumerate(codes)])
    L, why = {}, {}
    x20, br20, br5, mx5, casc, nbig = (np.asarray(val[k], float) for k in ('x20', 'br20', 'br5', 'mx5', 'casc', 'nbig'))
    with np.errstate(invalid='ignore', divide='ignore'):
        LR = np.log(P[:, 1:t + 1] / P[:, :t])
    LR[~np.isfinite(LR)] = np.nan
    l5 = np.nansum(LR[:, -5:], axis=1)
    # ② 테마 몰림 — 테마 몰림(같은 업종 열에 일곱 넘게 시장보다 앞섬 · 업종도 앞섬)인 곳 먼저 · 업종이 함께 앞선 몫(20 · 5거래일 큰 쪽) · 그 회사 한 달 시장보다
    herd_on = np.asarray(on['herd'], bool)
    L['herd'] = _rank(codes, [(1e3 if herd_on[j] else 0) + np.nanmax([br20[j], br5[j]]) * 10 + np.nan_to_num(x20[j]) for j in range(N)], ok)
    L['lot'] = _rank(codes, list(mx5), ok)                                              # ③ 한방 쫓기 — 닷새 안 하루 가장 크게 뜀
    L['casc'] = _rank(codes, [casc[j] * 10 - np.nan_to_num(x20[j]) for j in range(N)], ok)  # ④ 빚투 쏠림 — 크게 내린 날 잇달음 · 한 달 많이 빠진 쪽
    il20 = val.get('il20')
    ind_ok = np.ones(N, bool) if il20 is None else np.nan_to_num(np.asarray(il20, float), nan=-1) >= -0.02
    L['hold'] = _rank(codes, list(-x20), ok & ind_ok)                                  # ⑤ 본전 버팀 — 업종은 버팀(−2 위) · 한 달 시장보다 가장 많이 뒤짐
    L['big'] = _rank(codes, list(np.nan_to_num(np.asarray(cap, float), nan=-1)), ok)    # ⑥ 국민주 — 몸집 큰 차례
    L['attn'] = _rank(codes, [nbig[j] * 10 + np.nan_to_num(mx5[j]) for j in range(N)], ok)  # ⑦ 눈길 사기 — 크게 움직인 날 수 · 하루 큰 뜀
    med5 = np.array([np.nanmedian(l5[IX == IX[j]]) for j in range(N)])
    L['dip'] = _rank(codes, list(-(l5 - med5)), ok)                                    # ⑩ 내릴 때 삼 — 혼자 빠짐(같은 업종 가운데값보다)
    # 거래량 넷
    volDay, volN = None, 0
    if vol and dates is not None:
        V, C, volN = vol_mats(codes, vol, dates, t)
        volDay = dates[t] if volN else None
    if volN < VOL_MIN * N:
        msg = '거래량 자료가 없어 못 셈(올리기 작업만 받음)' if not volN else '그날 거래량을 받은 회사가 모자라 못 셈(%d곳 가운데 %d곳)' % (N, volN)
        for k in BY: L[k], why[k] = [], msg
        return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN}
    vok = ok & np.isfinite(V[:, t])
    with np.errstate(invalid='ignore', divide='ignore'):
        sh = np.asarray(cap, float) * 1e8 / P[:, t]                                    # 주식 수 어림 = 몸집 ÷ 그날 종가
        to = V / sh[:, None]                                                           # 회전율(그날 사고판 양 ÷ 주식 수)
        to5 = np.nanmean(to[:, -5:], axis=1); to20 = np.nanmean(to[:, -20:], axis=1)
        base = np.array([np.nanmedian(V[j, max(0, t - 64):t - 4]) if np.isfinite(V[j, max(0, t - 64):t - 4]).sum() >= 20 else np.nan for j in range(N)])
        vx = V[:, -5:] / base[:, None]                                                 # 닷새 거래량 ÷ 그 앞 60거래일 가운데값
        r5 = LR[:, -5:]
        ind5 = np.array([np.nanmean(r5[IX == IX[j]], axis=0) for j in range(N)])         # 그날 업종 평균 오르내림
    L['dtr'] = _rank(codes, list(to5), vok)                                             # ① 당일치기 — 닷새 평균 회전율
    capr = np.argsort(np.argsort(np.nan_to_num(np.asarray(cap, float), nan=np.inf)))   # 몸집 작은 차례(0 = 가장 작음)
    small_ok = vok & (capr < max(1, round(N / 10))) & (to20 > np.nanmedian(to20))
    L['small'] = _rank(codes, list(to20), small_ok)                                     # ⑧ 작은 회사 — 몸집 아래 열에 하나 · 회전율 가운데값 넘음
    fsc = np.where((vx >= FOLLOW_X) & ((r5 - ind5) > FOLLOW_EX), vx, 0)
    L['follow'] = _rank(codes, [np.nanmax(fsc[j]) * 1e3 + np.nan_to_num(np.nanmax(np.where(r5[j] - ind5[j] > 0, vx[j], 0))) for j in range(N)], vok)  # ⑨ 따라사기
    nsc = np.where((vx >= NEWB_X) & (r5 >= NEWB_UP), r5, 0)
    L['newb'] = _rank(codes, [np.nanmax(nsc[j]) * 1e3 + np.nan_to_num(np.nanmax(r5[j] * np.minimum(np.nan_to_num(vx[j]), 10))) for j in range(N)], vok)  # ⑪ 새내기(가까운 모습)
    return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN}


if __name__ == '__main__':   # 스스로 시험 — python3 su21_t11.py --selftest
    import sys
    if '--selftest' in sys.argv:
        rng = np.random.default_rng(1)
        N, T = 40, 300
        P = np.exp(np.cumsum(rng.normal(0, 0.02, (N, T)), axis=1)) * 1000
        codes = ['%06d' % (j + 1) for j in range(N)]; IX = np.array([j % 4 for j in range(N)]); cap = np.arange(N, 0, -1) * 100.0
        import su21_culture as CU
        l5 = np.log(P[:, -1] / P[:, -6]); l20 = np.log(P[:, -1] / P[:, -21])
        il5 = np.array([l5[IX == i].mean() for i in range(4)]) - l5.mean(); il20 = np.array([l20[IX == i].mean() for i in range(4)]) - l20.mean()
        on, val = CU.traits(P, IX, 4, cap, T - 1, l5, l20, il5, il20)
        val = {**val, 'il20': il20[IX]}
        dates = ['2026-%02d-%02d' % (1 + i // 28, 1 + i % 28) for i in range(T)]
        r = lists11(codes, IX, P, T - 1, cap, val, on, late={'000001'})
        assert all(len(r['lists'][k]) == 7 for k in KINDS if k not in BY), r
        assert all(r['lists'][k] == [] for k in BY) and r['volN'] == 0
        assert '000001' not in sum(r['lists'].values(), []), '값이 늦은 회사는 뺌'
        assert r['lists']['big'] == ['000002', '000003', '000004', '000005', '000006', '000007', '000008'], '국민주 = 몸집 큰 차례(늦은 회사 뺌)'
        vol = {c: [[dates[i].replace('-', ''), float(P[j, i]), float(1e5 * (1 + (i == T - 2 and j == 5) * 9))] for i in range(T - 80, T)] for j, c in enumerate(codes)}
        r2 = lists11(codes, IX, P, T - 1, cap, val, on, vol=vol, dates=dates)
        assert r2['volN'] == N and r2['volDay'] == dates[-1] and all(len(r2['lists'][k]) == 7 for k in KINDS if k != 'small'), r2
        assert r2['lists']['dtr'][0] == '000040', '회전율 = 같은 거래량이면 몸집 작은 쪽이 큼'
        half = {c: v for i, (c, v) in enumerate(vol.items()) if i % 2}
        r3 = lists11(codes, IX, P, T - 1, cap, val, on, vol=half, dates=dates)
        assert r3['volN'] == N // 2 and all(r3['lists'][k] == [] for k in BY) and '모자라' in r3['why']['dtr'] and len(r3['lists']['herd']) == 7, '거래량을 덜 받은 날은 넷을 사지 않음'
        r0 = lists11(codes, IX, None, 0, cap, {}, {})
        assert all(r0['lists'][k] == [] for k in KINDS) and r0['why']['big'] == '지난 값이 모자라 못 셈'
        print('ok', {k: len(v) for k, v in r2['lists'].items()})
