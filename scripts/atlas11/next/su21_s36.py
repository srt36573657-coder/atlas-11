"""큐피트 — 손자병법 서른여섯 꾀(삼십육계)로 고른 서른여섯 묶음(주문 1113-2224)
  사장님 2026-11-13 22:24(서울) 「11 가지로 하지 말고 36가지 유형으로 … 손자병법의 유형을 가지고 … 365 가지의 종목을 가지고 36가지의 유형을 만드는데
    손자병법을 적용해서 만들어 봐 그래가지고 그걸 정산하고 연결해봐 36 가지가 다 7가지 정산까지 다 나누게 해 봐」 · 22:26 「그래」 · 22:27 「정산표에는 수익율이 높은 순으로」
  서른여섯 = 손자병법과 함께 내려오는 삼십육계(三十六計) — 여섯 갈래(이길 때 · 맞설 때 · 칠 때 · 어지러울 때 · 함께 싸울 때 · 질 때) × 여섯
  꾀마다 그 꾀를 닮은 주식 모습 하나(지난 값으로 잴 수 있는 것만) · 그날 우량주 365곳(board.json) 가운데 가장 닮은 일곱 곳 · 값이 늦은 회사는 뺌 · 같은 점수면 번호 차례
    종가로 재는 서른하나 + 그날 사고판 양으로 재는 다섯(올리기 작업만 네이버 일봉 거래량을 받음 — su21_vol.mjs)
    거래량을 받은 회사가 열에 아홉이 안 되면 그 다섯은 빈 목록(까닭을 적음) — 지어낸 값 없음 · 한 번 적으면 고치지 않으므로 일부 회사만으로 고르지 않음
  앞날을 맞히지 않음 — 지금 모습을 셀 뿐 · 사고팔기를 권하지 않음"""
import numpy as np

RULE_ID = 's36-v1'
K = 7
KINDS = ['g%02d' % i for i in range(1, 37)]
# 꾀 이름(사자성어) · 쉬운 이름(화면 표) · 꾀 뜻 · 고르는 법 · 갈래
SET = ['이길 때 쓰는 꾀', '맞설 때 쓰는 꾀', '칠 때 쓰는 꾀', '어지러울 때 쓰는 꾀', '함께 싸울 때 쓰는 꾀', '질 때 쓰는 꾀']
DEF = [
    ('만천과해', '몰래 바다 건너기', '하늘을 속이고 바다를 건너요.', '하루하루는 잔잔한데 한 달 동안 가장 꾸준히 오른 곳이에요.'),
    ('위위구조', '딴 데 쳐서 구하기', '다른 곳을 쳐서 내 편을 구해요.', '닷새 동안 업종이 내릴 때 혼자 오른 곳이에요.'),
    ('차도살인', '남의 칼 빌리기', '남의 칼을 빌려 싸워요.', '업종이 한 달 오를 때 업종과 가장 닮게 따라 오른 곳이에요.'),
    ('이일대로', '쉬다가 치기', '쉬면서 지친 적을 기다려요.', '오래 조용하다가 지난 닷새 가장 크게 힘을 낸 곳이에요.'),
    ('진화타겁', '불난 틈 타기', '불이 난 틈을 타요.', '한 달 안에 시장이 가장 크게 내린 날들에 오히려 오른 곳이에요.'),
    ('성동격서', '동쪽 소리 서쪽 치기', '동쪽에서 소리 내고 서쪽을 쳐요.', '어제는 내리고 오늘은 크게 오른 곳이에요.'),
    ('무중생유', '없는 데서 만들기', '없는 데서 있는 것을 만들어요.', '두 달 동안 좁게 움직이다가 오늘 그 위로 올라선 곳이에요.'),
    ('암도진창', '몰래 다른 길 가기', '보이는 길을 고치는 척 몰래 다른 길로 가요.', '값은 거의 그대로인데 사고판 양이 가장 크게 늘어난 곳이에요.'),
    ('격안관화', '강 건너 불 보기', '강 건너에서 불을 구경해요.', '석 달 동안 시장이 흔들려도 가장 덜 따라 움직인 곳이에요.'),
    ('소리장도', '웃음 속 칼', '웃음 속에 칼을 숨겨요.', '한 달로는 올랐는데 지난 닷새는 내린 곳이에요.'),
    ('이대도강', '대신 쓰러지기', '복숭아나무 대신 오얏나무가 쓰러져요.', '닷새 동안 업종은 버티는데 혼자 크게 내린 곳이에요.'),
    ('순수견양', '손에 걸린 양 끌기', '손에 걸린 양을 끌고 가요.', '스무 날 가운데 오른 날이 가장 많은 곳이에요.'),
    ('타초경사', '풀 쳐서 뱀 놀래기', '풀을 쳐서 뱀을 놀라게 해요.', '오늘 사고판 양이 평소보다 가장 크게 늘어난 곳이에요.'),
    ('차시환혼', '다시 살아나기', '남의 몸을 빌려 다시 살아나요.', '한 해 높은 값에서 크게 빠졌다가 한 달 사이 가장 크게 살아난 곳이에요.'),
    ('조호리산', '범을 산에서 끌어내기', '범을 산에서 꾀어내요.', '반년 평균 값보다 가장 멀리 위로 나온 곳이에요.'),
    ('욕금고종', '잡으려고 놓아주기', '잡으려면 먼저 놓아줘요.', '반년으로는 올랐는데 한 달은 쉬어 간 곳이에요.'),
    ('포전인옥', '벽돌 던져 옥 얻기', '벽돌을 던져 옥을 얻어요.', '그 앞 닷새 조금 오르고 지난 닷새 더 크게 오른 곳이에요.'),
    ('금적금왕', '우두머리 잡기', '도적을 잡으려면 우두머리를 잡아요.', '업종마다 몸집 1등인 곳 가운데 업종이 한 달 가장 많이 오른 곳이에요.'),
    ('부저추신', '솥 밑 장작 빼기', '솥 밑에서 장작을 빼요.', '석 달 동안 많이 올랐는데 요즘 사고판 양이 가장 크게 줄어든 곳이에요.'),
    ('혼수모어', '흐린 물 고기 잡기', '물을 흐려 고기를 잡아요.', '지난 닷새 오르내림이 가장 거칠었던 곳이에요.'),
    ('금선탈각', '허물 벗기', '매미가 허물을 벗고 떠나요.', '오늘 한 해 가장 높은 값을 가장 크게 넘어선 곳이에요.'),
    ('관문착적', '문 닫고 도둑 잡기', '문을 닫고 도둑을 잡아요.', '스무 날 동안 오르내린 폭이 가장 좁은 곳이에요.'),
    ('원교근공', '먼 데 사귀고 가까운 데 치기', '먼 나라와 사귀고 가까운 나라를 쳐요.', '석 달 동안 같은 업종보다 시장 전체와 더 닮게 움직인 곳이에요.'),
    ('가도벌괵', '길 빌려 치기', '길을 빌려 다른 나라를 쳐요.', '한 달 내리던 업종이 닷새 사이 돌아섰을 때 함께 크게 오른 곳이에요.'),
    ('투량환주', '기둥 바꾸기', '대들보를 훔치고 기둥을 바꿔요.', '요즘 한 달 오르내림이 반년 평소보다 가장 크게 바뀐 곳이에요.'),
    ('지상매괴', '빗대어 꾸짖기', '뽕나무를 가리키며 다른 나무를 꾸짖어요.', '한 달 동안 업종은 크게 내렸는데 혼자 버틴 곳이에요.'),
    ('가치부전', '어리석은 척하기', '어리석은 척하되 흔들리지 않아요.', '한 해 높은 값보다 많이 낮은데 요즘 가장 잔잔한 곳이에요.'),
    ('상옥추제', '지붕 올리고 사다리 치우기', '지붕에 올려 놓고 사다리를 치워요.', '한 달 크게 오르고 꼭대기에서 거의 안 내려온 곳이에요.'),
    ('수상개화', '나무에 꽃 달기', '나무에 꽃을 달아 크게 보여요.', '사고판 양은 평소보다 적은데 지난 닷새 크게 오른 곳이에요.'),
    ('반객위주', '손님이 주인 되기', '손님이 주인 자리를 차지해요.', '석 달 동안 업종 몸집 1등보다 가장 많이 더 오른 곳이에요.'),
    ('미인계', '미인 꾀', '아름다움으로 눈길을 끌어요.', '오늘 하루 가장 크게 오른 곳이에요.'),
    ('공성계', '빈 성 꾀', '빈 성을 열어 두고 태연해요.', '한 달 사고판 양이 가장 적은데 값은 버틴 곳이에요.'),
    ('반간계', '적 첩자 쓰기', '적의 첩자를 거꾸로 써요.', '석 달 동안 같은 업종과 가장 거꾸로 움직인 곳이에요.'),
    ('고육계', '제 몸 다치기', '제 몸을 다쳐 적을 속여요.', '오늘 하루 가장 크게 내린 곳이에요.'),
    ('연환계', '고리 잇기', '꾀를 고리처럼 이어요.', '오른 날이 오늘까지 가장 길게 이어진 곳이에요.'),
    ('주위상', '달아나기', '어려우면 달아나는 것이 가장 좋아요.', '한 달 동안 가장 많이 내린 곳이에요.'),
]
HAN = {k: d[0] for k, d in zip(KINDS, DEF)}
NAME = {k: d[1] for k, d in zip(KINDS, DEF)}
MEAN = {k: d[2] for k, d in zip(KINDS, DEF)}
SAY = {k: d[3] for k, d in zip(KINDS, DEF)}
SETOF = {k: SET[i // 6] for i, k in enumerate(KINDS)}
BY = {k: 'vol' for k in ('g08', 'g13', 'g19', 'g29', 'g32')}   # 그날 사고판 양이 있어야 잼
VOL_MIN = 0.9    # 그날 거래량을 받은 회사가 365곳 가운데 이만큼 넘을 때만 다섯을 셈
NEED_T = 260     # 지난 값이 이만큼(한 해 남짓) 있어야 셈
BON = 10.0       # 꾀의 모습에 맞는 곳을 먼저(점수에 더함) — 맞는 곳이 일곱이 안 되면 가장 가까운 곳으로 채움


def _rank(codes, score, ok, k=K):
    """점수가 큰 차례로 k 곳(점수가 없거나 ok 가 거짓이면 뺌) · 같은 점수면 번호 차례"""
    s = np.asarray(score, float)
    g = [(s[j], codes[j]) for j in range(len(codes)) if ok[j] and np.isfinite(s[j])]
    g.sort(key=lambda x: (-x[0], x[1]))
    return [c for _, c in g[:k]]


def vol_mats(codes, rows, dates, t):
    """[날, 종가, 거래량] 줄 → 날 차례(dates · 판 날 t 까지) 거래량 행렬(없으면 nan) · 그날 값이 있는 회사 수"""
    D = {d.replace('-', ''): i for i, d in enumerate(dates[:t + 1])}
    V = np.full((len(codes), t + 1), np.nan)
    for j, c in enumerate(codes):
        for r in rows.get(c) or []:
            i = D.get(str(r[0]))
            if i is None or len(r) < 3: continue
            if isinstance(r[2], (int, float)) and r[2] >= 0: V[j, i] = r[2]
    return V, int(np.isfinite(V[:, t]).sum())


def _corr(a, b):
    """줄마다 상관(a, b = 회사 × 날 · 빈 값은 0)"""
    a = a - a.mean(axis=1, keepdims=True); b = b - b.mean(axis=1, keepdims=True)
    den = np.sqrt((a * a).sum(axis=1) * (b * b).sum(axis=1))
    with np.errstate(invalid='ignore', divide='ignore'):
        return np.where(den > 0, (a * b).sum(axis=1) / den, np.nan)


def _others_med(x, IX):
    """같은 업종 다른 회사들의 가운데 값(자기 빼고 · 혼자인 업종은 nan)"""
    out = np.full(len(x), np.nan)
    for j in range(len(x)):
        m = (IX == IX[j]); m[j] = False
        v = x[m]; v = v[np.isfinite(v)]
        if len(v): out[j] = float(np.median(v))
    return out


def feats(codes, IX, P, t, cap):
    """종가로 재는 값들(회사마다)"""
    N = len(codes)
    with np.errstate(invalid='ignore', divide='ignore'):
        LR = np.log(P[:, 1:t + 1] / P[:, :t])            # LR[:, i] = i → i+1 날 · 마지막 = 판 날
    LR[~np.isfinite(LR)] = np.nan
    Z = np.nan_to_num(LR)
    pt = P[:, t]
    with np.errstate(invalid='ignore', divide='ignore'):
        R = lambda w: np.log(pt / P[:, t - w])
        F = {'r1': LR[:, -1], 'r1p': LR[:, -2], 'r5': R(5), 'r20': R(20), 'r60': R(60), 'r120': R(120),
             'r5p': np.log(P[:, t - 5] / P[:, t - 10]), 'r20p': np.log(P[:, t - 5] / P[:, t - 25])}
        F['vol20'] = np.nanstd(LR[:, -20:], axis=1); F['vol120'] = np.nanstd(LR[:, -120:], axis=1)
        F['volq'] = np.nanstd(LR[:, -65:-5], axis=1)                       # 지난 닷새 앞 60거래일 흔들림
        F['abs5'] = np.nanmean(np.abs(LR[:, -5:]), axis=1)
        F['hi250'] = np.nanmax(P[:, t - 250:t], axis=1)                    # 오늘 빼고 한 해 가장 높은 값
        F['hi60'] = np.nanmax(P[:, t - 60:t], axis=1); lo60 = np.nanmin(P[:, t - 60:t], axis=1)
        F['rng60'] = (F['hi60'] - lo60) / np.nanmean(P[:, t - 60:t], axis=1)
        w20 = P[:, t - 19:t + 1]
        F['hi20'] = np.nanmax(w20, axis=1); F['lo20'] = np.nanmin(w20, axis=1)
        F['rng20'] = (F['hi20'] - F['lo20']) / np.nanmean(w20, axis=1)
        F['ma120'] = np.nanmean(P[:, t - 119:t + 1], axis=1)
    F['up20'] = (LR[:, -20:] > 0).sum(axis=1).astype(float)
    st = np.zeros(N)
    for j in range(N):
        n = 0
        for x in LR[j, ::-1]:
            if np.isfinite(x) and x > 0: n += 1
            else: break
        st[j] = n
    F['streak'] = st
    mk = np.nanmean(LR, axis=0)                                            # 시장 = 365곳 고른 평균(하루)
    mk = np.nan_to_num(mk)
    F['mk'] = mk
    # 같은 업종 다른 회사들의 하루 평균(자기 빼고)
    S = np.zeros_like(Z); C = np.zeros_like(Z)
    fin = np.isfinite(LR).astype(float)
    for i in np.unique(IX):
        m = IX == i
        S[m] = Z[m].sum(axis=0); C[m] = fin[m].sum(axis=0)
    with np.errstate(invalid='ignore', divide='ignore'):
        loo = np.where(C - fin > 0, (S - Z) / (C - fin), np.nan)
    w = slice(-60, None)
    F['cmk'] = _corr(Z[:, w], np.broadcast_to(mk[w], Z[:, w].shape))
    li = np.nan_to_num(loo[:, w]); has = np.isfinite(loo[:, w]).sum(axis=1) >= 40
    F['cind'] = np.where(has, _corr(Z[:, w], li), np.nan)
    m60 = mk[w] - mk[w].mean()
    with np.errstate(invalid='ignore', divide='ignore'):
        F['beta'] = (Z[:, w] - Z[:, w].mean(axis=1, keepdims=True)) @ m60 / (m60 @ m60)
    worst = np.argsort(mk[-20:])[:5]                                       # 한 달 안 시장이 가장 크게 내린 닷새
    F['onworst'] = np.nanmean(LR[:, -20:][:, worst], axis=1)
    for k in ('r5', 'r20', 'r20p'): F['ind_' + k] = _others_med(F[k], IX)
    # 업종 몸집 1등 · 업종 한 달(모두) 가운데 값
    lead = np.full(N, False); leadOf = np.full(N, -1)
    capf = np.nan_to_num(np.asarray(cap, float), nan=-1)
    for i in np.unique(IX):
        idx = [j for j in np.where(IX == i)[0]]
        L = sorted(idx, key=lambda j: (-capf[j], codes[j]))[0]
        lead[L] = True; leadOf[np.array(idx)] = L
    F['lead'] = lead; F['leadOf'] = leadOf
    F['indall20'] = np.array([np.nanmedian(F['r20'][IX == IX[j]]) for j in range(N)])
    return F


def lists36(codes, IX, P, t, cap, vol=None, dates=None, late=()):
    """codes(365 · 차례) · IX(업종 번호) · P(종가 행렬 회사 × 날) · t(판 날 번호) · cap(몸집 · 억 원)
       · vol({번호: [[YYYYMMDD, 종가, 거래량], …]} 또는 None) → {lists: {k: [번호 일곱]}, why: {k: 까닭}, volDay, volN}"""
    if P is None or t < NEED_T:
        return {'lists': {k: [] for k in KINDS}, 'why': {k: '지난 값이 모자라 못 셈' for k in KINDS}, 'volDay': None, 'volN': 0}
    N = len(codes)
    ok = np.array([c not in late and np.isfinite(P[j, t]) and np.isfinite(P[j, t - 20]) for j, c in enumerate(codes)])
    F = feats(codes, IX, P, t, cap)
    nz = lambda x: np.nan_to_num(np.asarray(x, float), nan=-1e9)
    B = lambda cond: np.where(np.asarray(cond, bool), BON, 0.0)
    L, why = {}, {}
    with np.errstate(invalid='ignore', divide='ignore'):
        r1, r1p, r5, r20, r60, r120, r5p = (F[k] for k in ('r1', 'r1p', 'r5', 'r20', 'r60', 'r120', 'r5p'))
        i5, i20, i20p = F['ind_r5'], F['ind_r20'], F['ind_r20p']
        dd = np.log(P[:, t] / F['hi250'])
        L['g01'] = _rank(codes, B(r20 > 0) + r20 / (F['vol20'] * np.sqrt(20)), ok)                       # 만천과해
        L['g02'] = _rank(codes, B((i5 < 0) & (r5 > 0)) + (r5 - i5), ok)                                   # 위위구조
        L['g03'] = _rank(codes, B((i20 > 0) & (r20 > 0)) + i20 * np.clip(F['cind'], 0, None), ok)         # 차도살인
        L['g04'] = _rank(codes, B(r5 > 0) + r5 / (F['volq'] * np.sqrt(5)), ok)                            # 이일대로
        L['g05'] = _rank(codes, F['onworst'], ok)                                                         # 진화타겁
        L['g06'] = _rank(codes, B((r1p < 0) & (r1 > 0)) + (r1 - r1p), ok)                                 # 성동격서
        L['g07'] = _rank(codes, np.log(P[:, t] / F['hi60']) / np.maximum(F['rng60'], 0.02), ok)          # 무중생유
        L['g09'] = _rank(codes, -np.abs(F['beta']), ok)                                                   # 격안관화
        L['g10'] = _rank(codes, B((r20 > 0) & (r5 < 0)) + np.minimum(r20, -r5), ok)                       # 소리장도
        L['g11'] = _rank(codes, B((i5 >= 0) & (r5 < 0)) + (i5 - r5), ok)                                  # 이대도강
        L['g12'] = _rank(codes, F['up20'] - F['vol20'], ok)                                               # 순수견양
        lo20 = F['lo20']
        L['g14'] = _rank(codes, B(np.log(F['hi250'] / lo20) > np.log(1 / 0.7)) + np.log(P[:, t] / lo20), ok)   # 차시환혼
        L['g15'] = _rank(codes, np.log(P[:, t] / F['ma120']), ok)                                         # 조호리산
        L['g16'] = _rank(codes, B((r120 > 0) & (r20 < 0)) + np.minimum(r120, -r20), ok)                   # 욕금고종
        L['g17'] = _rank(codes, B((r5p > 0) & (r5 > r5p)) + (r5 - r5p), ok)                               # 포전인옥
        L['g18'] = _rank(codes, np.where(F['lead'], F['indall20'], np.nan), ok)                           # 금적금왕
        L['g20'] = _rank(codes, F['abs5'], ok)                                                            # 혼수모어
        L['g21'] = _rank(codes, np.log(P[:, t] / F['hi250']), ok)                                         # 금선탈각
        L['g22'] = _rank(codes, -F['rng20'], ok)                                                          # 관문착적
        L['g23'] = _rank(codes, F['cmk'] - F['cind'], ok)                                                 # 원교근공
        L['g24'] = _rank(codes, B((i20p < 0) & (i5 > 0) & (r5 > 0)) + r5, ok)                             # 가도벌괵
        L['g25'] = _rank(codes, np.log(F['vol20'] / F['vol120']), ok)                                     # 투량환주
        L['g26'] = _rank(codes, B((i20 < 0) & (r20 >= 0)) - i20, ok)                                      # 지상매괴
        L['g27'] = _rank(codes, B(dd < np.log(0.7)) - F['vol20'] * 100, ok)                               # 가치부전
        L['g28'] = _rank(codes, B(P[:, t] >= 0.97 * F['hi20']) + r20, ok)                                 # 상옥추제
        lo = F['leadOf']
        L['g30'] = _rank(codes, np.where(~F['lead'] & (lo >= 0), r60 - r60[np.maximum(lo, 0)], np.nan), ok)   # 반객위주
        L['g31'] = _rank(codes, r1, ok)                                                                   # 미인계
        L['g33'] = _rank(codes, -F['cind'], ok)                                                           # 반간계
        L['g34'] = _rank(codes, -r1, ok)                                                                  # 고육계
        L['g35'] = _rank(codes, F['streak'] + np.nan_to_num(r5) / 10, ok)                                 # 연환계
        L['g36'] = _rank(codes, -r20, ok)                                                                 # 주위상
    # 거래량 다섯
    volDay, volN = None, 0
    if vol and dates is not None:
        V, volN = vol_mats(codes, vol, dates, t)
        volDay = dates[t] if volN else None
    if volN < VOL_MIN * N:
        msg = '거래량 자료가 없어 못 셈(올리기 작업만 받음)' if not volN else '그날 거래량을 받은 회사가 모자라 못 셈(%d곳 가운데 %d곳)' % (N, volN)
        for k in BY: L[k], why[k] = [], msg
        return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN}
    vok = ok & np.isfinite(V[:, t])
    with np.errstate(invalid='ignore', divide='ignore'):
        base = np.array([np.nanmedian(V[j, max(0, t - 64):t - 4]) if np.isfinite(V[j, max(0, t - 64):t - 4]).sum() >= 20 else np.nan for j in range(N)])
        v5 = np.nanmean(V[:, -5:], axis=1) / base                                      # 닷새 평균 ÷ 그 앞 60거래일 가운데 값
        v1 = V[:, t] / base
        sh = np.asarray(cap, float) * 1e8 / P[:, t]                                    # 주식 수 어림 = 몸집 ÷ 그날 종가
        to20 = np.nanmean(V[:, -20:], axis=1) / sh
        r5, r20, r60 = F['r5'], F['r20'], F['r60']
        L['g08'] = _rank(codes, B(np.abs(r20) < 0.05) + np.log(v5), vok)              # 암도진창
        L['g13'] = _rank(codes, np.log(v1), vok)                                       # 타초경사
        L['g19'] = _rank(codes, B(r60 > 0.1) - np.log(v5), vok)                        # 부저추신
        L['g29'] = _rank(codes, B(v5 < 1) + r5, vok)                                   # 수상개화
        L['g32'] = _rank(codes, B(r20 >= 0) - np.log(to20), vok)                       # 공성계
    return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN}


if __name__ == '__main__':   # 스스로 시험 — python3 su21_s36.py --selftest · --defs(이름 · 뜻 JSON)
    import sys, json
    if '--defs' in sys.argv:
        print(json.dumps({'rule': RULE_ID, 'kinds': KINDS, 'han': HAN, 'name': NAME, 'mean': MEAN, 'say': SAY, 'set': SETOF, 'by': BY}, ensure_ascii=False))
    if '--selftest' in sys.argv:
        assert len(KINDS) == 36 == len(DEF) and len(set(HAN.values())) == 36 and len(set(NAME.values())) == 36 and len(set(SAY.values())) == 36
        assert all('%' not in s and not any('A' <= ch <= 'z' for ch in s) for d in DEF for s in d), '「%」 · 영어 0'
        rng = np.random.default_rng(1)
        N, T = 60, 300
        P = np.exp(np.cumsum(rng.normal(0, 0.02, (N, T)), axis=1)) * 1000
        codes = ['%06d' % (j + 1) for j in range(N)]; IX = np.array([j % 10 for j in range(N)]); cap = np.arange(N, 0, -1) * 100.0
        dates = ['2026-%02d-%02d' % (1 + i // 28, 1 + i % 28) for i in range(T)]
        r = lists36(codes, IX, P, T - 1, cap, late={'000001'})
        assert all(len(r['lists'][k]) == 7 for k in KINDS if k not in BY), {k: len(v) for k, v in r['lists'].items()}
        assert all(r['lists'][k] == [] for k in BY) and r['volN'] == 0 and '없어' in r['why']['g13']
        assert '000001' not in sum(r['lists'].values(), []), '값이 늦은 회사는 뺌'
        lr = np.log(P[:, -1] / P[:, -2]); top = [codes[j] for j in sorted([j for j in range(1, N)], key=lambda j: (-lr[j], codes[j]))[:7]]
        assert r['lists']['g31'] == top, '미인계 = 오늘 하루 가장 크게 오른 곳'
        assert r['lists']['g34'] == [codes[j] for j in sorted(range(1, N), key=lambda j: (lr[j], codes[j]))[:7]], '고육계 = 오늘 하루 가장 크게 내린 곳'
        assert all(x in [codes[j] for j in range(1, 10)] for x in r['lists']['g18']), '금적금왕 = 업종 몸집 1등만(업종 열 · 몸집 큰 차례 = 번호 차례 · 늦은 000001 뺌)'
        vol = {c: [[dates[i].replace('-', ''), float(P[j, i]), float(1e5 * (1 + (i == T - 1 and j == 5) * 9))] for i in range(T - 80, T)] for j, c in enumerate(codes)}
        r2 = lists36(codes, IX, P, T - 1, cap, vol=vol, dates=dates)
        assert r2['volN'] == N and r2['volDay'] == dates[-1] and all(len(r2['lists'][k]) == 7 for k in KINDS), {k: len(v) for k, v in r2['lists'].items()}
        assert r2['lists']['g13'][0] == '000006', '타초경사 = 오늘 사고판 양이 평소보다 가장 크게 는 곳'
        half = {c: v for i, (c, v) in enumerate(vol.items()) if i % 2}
        r3 = lists36(codes, IX, P, T - 1, cap, vol=half, dates=dates)
        assert all(r3['lists'][k] == [] for k in BY) and '모자라' in r3['why']['g08'] and len(r3['lists']['g01']) == 7, '거래량을 덜 받은 날은 다섯을 사지 않음'
        r0 = lists36(codes, IX, None, 0, cap)
        assert all(r0['lists'][k] == [] for k in KINDS) and r0['why']['g01'] == '지난 값이 모자라 못 셈'
        print('ok', sum(len(v) for v in r2['lists'].values()))
