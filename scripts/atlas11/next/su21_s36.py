"""큐피트 — 손자병법 서른여섯 꾀(삼십육계)로 고른 서른여섯 묶음(주문 1113-2224)
  사장님 2026-11-13 22:24(서울) 「11 가지로 하지 말고 36가지 유형으로 … 손자병법의 유형을 가지고 … 365 가지의 종목을 가지고 36가지의 유형을 만드는데
    손자병법을 적용해서 만들어 봐 그래가지고 그걸 정산하고 연결해봐 36 가지가 다 7가지 정산까지 다 나누게 해 봐」 · 22:26 「그래」 · 22:27 「정산표에는 수익율이 높은 순으로」
  서른여섯 = 옛 병법에 전하는 삼십육계(손자병법 13편과 따로 · 뒤에 엮은 책) — 여섯 갈래(이길 때 · 맞설 때 · 칠 때 · 어지러울 때 · 함께 싸울 때 · 질 때) × 여섯
  꾀마다 그 꾀를 닮은 주식 모습 하나(지난 값으로 잴 수 있는 것만) · 그날 우량주 365곳(board.json) 가운데 가장 닮은 일곱 곳 · 값이 늦은 회사는 뺌 · 같은 점수면 번호 차례
    종가로 재는 서른하나 + 그날 사고판 양으로 재는 다섯(올리기 작업만 네이버 일봉 거래량을 받음 — su21_vol.mjs)
    거래량을 받은 회사가 열에 아홉이 안 되면 그 다섯은 빈 목록(까닭을 적음) — 지어낸 값 없음 · 한 번 적으면 고치지 않으므로 일부 회사만으로 고르지 않음
  앞날을 맞히지 않음 — 지금 모습을 셀 뿐 · 사고팔기를 권하지 않음"""
import hashlib
import numpy as np

RULE_ID = 's36-v3'   # 주문 1116-2134 — 셋을 지난 곳 가운데 꾀 점수(수학 식 + 정서 식 · MIX) 차례 · 옛 s36-v2(주문 1116-1539) = 같은 세 거름 · 꾀를 닮은 값 하나의 차례 · 옛 s36-v1 = 모자라면 덜 닮은 곳으로 채움
K = 7
KINDS = ['g%02d' % i for i in range(1, 37)]
# 꾀 이름(사자성어) · 쉬운 이름(화면 표) · 꾀 뜻 · 고르는 법 · 갈래
SET = ['이길 때 쓰는 꾀', '맞설 때 쓰는 꾀', '칠 때 쓰는 꾀', '어지러울 때 쓰는 꾀', '함께 싸울 때 쓰는 꾀', '질 때 쓰는 꾀']
DEF = [
    ('만천과해', '몰래 바다 건너기', '하늘을 속이고 바다를 건너요.', '하루하루는 잔잔한데 한 달 동안 꾸준히 오른 곳이에요.'),
    ('위위구조', '딴 데 쳐서 구하기', '다른 곳을 쳐서 내 편을 구해요.', '닷새 동안 업종이 내릴 때 혼자 오른 곳이에요.'),
    ('차도살인', '남의 칼 빌리기', '남의 칼을 빌려 싸워요.', '업종이 한 달 오르는 동안, 그 흐름을 가깝게 따라 오른 곳이에요.'),
    ('이일대로', '쉬다가 치기', '쉬면서 지친 적을 기다려요.', '오래 조용하다가 지난 닷새 힘을 낸 곳이에요.'),
    ('진화타겁', '불난 틈 타기', '불이 난 틈을 타요.', '한 달 안에 시장이 가장 크게 내린 날들에 오히려 오른 곳이에요.'),
    ('성동격서', '동쪽 소리 서쪽 치기', '동쪽에서 소리 내고 서쪽을 쳐요.', '어제는 내리고 오늘은 크게 오른 곳이에요.'),
    ('무중생유', '없는 데서 만들기', '없는 데서 있는 것을 만들어요.', '두 달 동안 좁게 움직이다가 오늘 그 위로 올라선 곳이에요.'),
    ('암도진창', '몰래 다른 길 가기', '보이는 길을 고치는 척 몰래 다른 길로 가요.', '값은 거의 그대로인데 사고판 양이 크게 늘어난 곳이에요.'),
    ('격안관화', '강 건너 불 보기', '강 건너에서 불을 구경해요.', '석 달 동안 시장이 흔들려도 덜 따라 움직인 곳이에요.'),
    ('소리장도', '웃음 속 칼', '웃음 속에 칼을 숨겨요.', '한 달로는 올랐는데 지난 닷새는 내린 곳이에요.'),
    ('이대도강', '대신 쓰러지기', '복숭아나무 대신 오얏나무가 쓰러져요.', '닷새 동안 업종은 버티는데 혼자 크게 내린 곳이에요.'),
    ('순수견양', '손에 걸린 양 끌기', '손에 걸린 양을 끌고 가요.', '스무 날 가운데 오른 날이 더 많은 곳이에요.'),
    ('타초경사', '풀 쳐서 뱀 놀래기', '풀을 쳐서 뱀을 놀라게 해요.', '오늘 사고판 양이 평소보다 크게 늘어난 곳이에요.'),
    ('차시환혼', '다시 살아나기', '남의 몸을 빌려 다시 살아나요.', '한 해 높은 값에서 크게 빠졌다가 한 달 사이 크게 살아난 곳이에요.'),
    ('조호리산', '범을 산에서 끌어내기', '범을 산에서 꾀어내요.', '반년 평균 값보다 멀리 위로 나온 곳이에요.'),
    ('욕금고종', '잡으려고 놓아주기', '잡으려면 먼저 놓아줘요.', '반년으로는 올랐는데 한 달은 쉬어 간 곳이에요.'),
    ('포전인옥', '벽돌 던져 옥 얻기', '벽돌을 던져 옥을 얻어요.', '그 앞 닷새 조금 오르고 지난 닷새 더 크게 오른 곳이에요.'),
    ('금적금왕', '우두머리 잡기', '도적을 잡으려면 우두머리를 잡아요.', '업종마다 몸집 1등인 곳 가운데 업종이 한 달 많이 오른 곳이에요.'),
    ('부저추신', '솥 밑 장작 빼기', '솥 밑에서 장작을 빼요.', '석 달 동안 많이 올랐는데 요즘 사고판 양이 크게 줄어든 곳이에요.'),
    ('혼수모어', '흐린 물 고기 잡기', '물을 흐려 고기를 잡아요.', '지난 닷새 오르내림이 거칠었던 곳이에요.'),
    ('금선탈각', '허물 벗기', '매미가 허물을 벗고 떠나요.', '오늘 한 해 가장 높은 값을 넘어선 곳이에요.'),
    ('관문착적', '문 닫고 도둑 잡기', '문을 닫고 도둑을 잡아요.', '스무 날 동안 오르내린 폭이 좁은 곳이에요.'),
    ('원교근공', '먼 데 사귀고 가까운 데 치기', '먼 나라와 사귀고 가까운 나라를 쳐요.', '석 달 동안 같은 업종보다 시장 전체와 더 닮게 움직인 곳이에요.'),
    ('가도벌괵', '길 빌려 치기', '길을 빌려 다른 나라를 쳐요.', '한 달 내리던 업종이 닷새 사이 돌아섰을 때 함께 크게 오른 곳이에요.'),
    ('투량환주', '기둥 바꾸기', '대들보를 훔치고 기둥을 바꿔요.', '요즘 한 달 오르내림이 반년 평소보다 크게 바뀐 곳이에요.'),
    ('지상매괴', '빗대어 꾸짖기', '뽕나무를 가리키며 다른 나무를 꾸짖어요.', '한 달 동안 업종은 크게 내렸는데 혼자 버틴 곳이에요.'),
    ('가치부전', '어리석은 척하기', '어리석은 척하되 흔들리지 않아요.', '한 해 높은 값보다 많이 낮은데 요즘 잔잔한 곳이에요.'),
    ('상옥추제', '지붕 올리고 사다리 치우기', '지붕에 올려 놓고 사다리를 치워요.', '한 달 크게 오르고 꼭대기에서 거의 안 내려온 곳이에요.'),
    ('수상개화', '나무에 꽃 달기', '나무에 꽃을 달아 크게 보여요.', '사고판 양은 평소보다 적은데 지난 닷새 크게 오른 곳이에요.'),
    ('반객위주', '손님이 주인 되기', '손님이 주인 자리를 차지해요.', '석 달 동안 업종 몸집 1등보다 많이 더 오른 곳이에요.'),
    ('미인계', '미인 꾀', '아름다움으로 눈길을 끌어요.', '오늘 하루 크게 오른 곳이에요. 하루 만에 꺾이는 일도 많아요.'),
    ('공성계', '빈 성 꾀', '빈 성을 열어 두고 태연해요.', '한 달 사고판 양이 적은데 값은 버틴 곳이에요.'),
    ('반간계', '적 첩자 쓰기', '적의 첩자를 거꾸로 써요.', '석 달 동안 같은 업종과 거꾸로 움직인 곳이에요.'),
    ('고육계', '제 몸 다치기', '제 몸을 다쳐 적을 속여요.', '오늘 하루 크게 내린 곳이에요. 내린 곳을 일부러 고른 기록이라 더 내릴 수도 있어요.'),
    ('연환계', '고리 잇기', '꾀를 고리처럼 이어요.', '오른 날이 오늘까지 길게 이어진 곳이에요.'),
    ('주위상', '달아나기', '어려우면 달아나는 것이 가장 좋아요.', '한 달 동안 많이 내린 곳이에요. 내린 곳을 일부러 고른 기록이라 더 내릴 수도 있어요.'),
]
HAN = {k: d[0] for k, d in zip(KINDS, DEF)}
NAME = {k: d[1] for k, d in zip(KINDS, DEF)}
MEAN = {k: d[2] for k, d in zip(KINDS, DEF)}
SAY = {k: d[3] for k, d in zip(KINDS, DEF)}
SETOF = {k: SET[i // 6] for i, k in enumerate(KINDS)}
BY = {k: 'vol' for k in ('g08', 'g13', 'g19', 'g29', 'g32')}   # 그날 사고판 양이 있어야 잼
VOL_MIN = 0.9    # 그날 거래량을 받은 회사가 365곳 가운데 이만큼 넘을 때만 다섯을 셈
NEED_T = 260     # 지난 값이 이만큼(한 해 남짓) 있어야 셈

# ── 새 판(주문 1116-1539 · 사장님 2026-11-16(마카오) 14:39 「너만 믿고 할 순 없잖아 그래서 몬테카를로 … 10번 돌리고 [소거]로 10번 돌리고 그리고 또 다른 방식으로 일곱 가지를 필터링 한다음에 …
#    36개 7개 종목을 다시 [뽑아] … 말과 … 니가 찾아 낸 종목이 말이 같아야 될 거 아니야 지금은 틀린단 말이야」 · 15:01 「이작업도 같이해」 — docs/design/sonja-pick-2026-11-16/order-1539.txt)
#   옛 판은 꾀 모습에 맞는 곳에 점수를 더해 먼저 놓되, 맞는 곳이 일곱이 안 되면 덜 닮은 곳으로 채웠다 → 꾀 뜻과 다른 회사가 섞임
#   새 판 — 꾀마다 셋을 모두 지난 곳만 · 꾀를 가장 닮은 차례로 일곱까지 · 모자라면 모자란 대로(채우지 않음)
#     ① 흉내 내 보기 열 번(몬테카를로) — 그 회사 지난 값으로 우연 길 이백 개씩 씨앗을 바꿔 열 번(모두 이천 개)을 그려 꾀 모습이 우연보다 뚜렷한지 봄
#        드묾(rare) = 창 앞 지난 250거래일 하루 값을 뽑아 그린 이천 길 가운데 지금 값 이상이 열에 하나 이하 · 굳음(sure) = 창 안 날을 다시 뽑아 그린 이천 길의 열에 아홉 넘게 같은 모습
#        (한 번 이백 길은 우연이 커서 번마다 따로 재면 가장자리 회사가 오락가락함 — 열 번을 모아 잼 · 씨앗 = 판 날 · 꾀 · 번)
#     ② 소거 열 가지 — 믿을 만한 값인가(아래 CUT · 하나라도 걸리면 뺌)
#     ③ 거름 일곱 가지 — 꾀 뜻을 일곱 쪽(한 달 · 닷새 · 오늘 · 값 자리 · 흔들림 · 업종과 시장 · 사고판 양)에서 맞대 봄 · 그 꾀 뜻에 든 쪽은 모두 맞아야 남음
#   앞날을 맞히지 않음 — 지금 모습이 꾀 뜻과 같은지 셀 뿐 · 사고팔기를 권하지 않음
MC_RUNS = 10          # 흉내 내 보기 열 번(씨앗 열 개)
MC_PATHS = 200        # 한 번에 우연 길 이백 개
MC_P = 0.1            # 드묾 — 지금 값 이상인 우연 길이 열에 하나 이하
MC_SURE = 0.9         # 굳음 — 다시 뽑아 그린 길의 열에 아홉 넘게 같은 모습
MC_HIST = 250         # 드묾의 바탕 — 창 앞 지난 250거래일
MC_MIN_HIST = 120     # 바탕이 이만큼 안 되면 뚜렷하다고 하지 않음
VOL_HIST = 60         # 사고판 양의 바탕 — 창 앞 60거래일
CAP_MIN = 2000.0      # 회사 크기 2천억 원(억 원)
PX_MIN = 1000.0       # 한 주 값 천 원
JUMP = float(np.log(1.35))    # 나눔 흔적 — 하루 100원이 135원 넘게 · 74원 아래
LIMIT = float(np.log(1.29))   # 한도 — 하루 100원이 129원 넘게 · 77원 아래(오르내림 한도 30 가까이)
NONE_MEAN = '꾀 뜻에 맞는 곳이 없어 고르지 않음'   # 셋을 모두 지난 곳이 없는 날(채우지 않음)
CUT = [('late', '값이 늦지 않음'), ('today', '그날 값이 있음'), ('m21', '한 달 값이 모두 있음'), ('y240', '지난 1년 값이 넉넉함'),
       ('split', '나눔 흔적 없음'), ('halt', '멈춘 날 없음'), ('cap', '회사 크기 2천억 원 넘음'), ('px', '한 주 값 천 원 넘음'),
       ('wild', '흔들림이 지나치지 않음'), ('limit', '한도까지 움직인 날 없음')]
ANGLES = [('m1', '한 달 모습'), ('m5', '닷새 모습'), ('d1', '오늘 모습'), ('lv', '값 자리'), ('vo', '흔들림'), ('rel', '업종과 시장'), ('qty', '사고판 양')]

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
    """종가로 재는 값들(회사마다) · 흉내 내 보기에 쓰는 하루 값 줄(LR 회사 · mk 시장 · loo 같은 업종 다른 회사 평균 · iall 업종 평균)"""
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
        F['maxday20'] = np.nanmax(LR[:, -20:], axis=1)                     # 한 달 안 가장 크게 오른 하루
    F['up20'] = (LR[:, -20:] > 0).sum(axis=1).astype(float)
    st = np.zeros(N)
    for j in range(N):
        n = 0
        for x in LR[j, ::-1]:
            if np.isfinite(x) and x > 0: n += 1
            else: break
        st[j] = n
    F['streak'] = st
    with np.errstate(invalid='ignore'):
        mk = np.nanmean(LR, axis=0)                                        # 시장 = 365곳 고른 평균(하루)
    mk = np.nan_to_num(mk)
    F['mk'] = mk
    # 같은 업종 다른 회사들의 하루 평균(자기 빼고) · 업종 평균(자기 넣고)
    S = np.zeros_like(Z); C = np.zeros_like(Z)
    fin = np.isfinite(LR).astype(float)
    for i in np.unique(IX):
        m = IX == i
        S[m] = Z[m].sum(axis=0); C[m] = fin[m].sum(axis=0)
    with np.errstate(invalid='ignore', divide='ignore'):
        loo = np.where(C - fin > 0, (S - Z) / (C - fin), np.nan)
        F['iall'] = np.where(C > 0, S / C, np.nan)
    F['LR'] = LR; F['loo'] = loo
    w = slice(-60, None)
    F['cmk'] = _corr(Z[:, w], np.broadcast_to(mk[w], Z[:, w].shape))
    li = np.nan_to_num(loo[:, w]); has = np.isfinite(loo[:, w]).sum(axis=1) >= 40
    F['cind'] = np.where(has, _corr(Z[:, w], li), np.nan)
    m60 = mk[w] - mk[w].mean()
    with np.errstate(invalid='ignore', divide='ignore'):
        F['beta'] = (Z[:, w] - Z[:, w].mean(axis=1, keepdims=True)) @ m60 / (m60 @ m60)
    worst = np.argsort(mk[-20:])[:5]                                       # 한 달 안 시장이 가장 크게 내린 닷새
    F['onworst'] = np.nanmean(LR[:, -20:][:, worst], axis=1)
    F['mkworst'] = np.full(N, float(np.mean(mk[-20:][worst])))
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


def cuts(codes, P, t, cap, late, F):
    """② 소거 열 가지 — {열쇠: 참(지남) 배열}"""
    with np.errstate(invalid='ignore', divide='ignore'):
        last = P[:, t]
        y = P[:, max(0, t - 249):t + 1]
        LRy = np.log(y[:, 1:] / y[:, :-1])
        h = P[:, max(0, t - 63):t + 1]
        same = np.isfinite(h[:, 1:]) & (h[:, 1:] == h[:, :-1])            # 그 앞날과 같은 값
        run4 = same[:, 2:] & same[:, 1:-1] & same[:, :-2]                  # 나흘 잇달아 같은 값
        v20 = F['vol20']; fv = v20[np.isfinite(v20)]
        q99 = float(np.percentile(fv, 99)) if len(fv) else np.inf
        lr20 = F['LR'][:, -20:]
    return {
        'late': np.array([c not in late for c in codes]),
        'today': np.isfinite(last),
        'm21': np.isfinite(P[:, t - 20:t + 1]).all(axis=1),
        'y240': np.isfinite(y).sum(axis=1) >= 240,
        'split': ~(np.nan_to_num(np.abs(LRy), nan=0.0) > JUMP).any(axis=1),
        'halt': ~run4.any(axis=1),
        'cap': np.nan_to_num(np.asarray(cap, float), nan=-1.0) > CAP_MIN,
        'px': np.nan_to_num(last, nan=0.0) > PX_MIN,
        'wild': np.nan_to_num(v20, nan=np.inf) < q99,
        'limit': ~(np.nan_to_num(np.abs(lr20), nan=0.0) >= LIMIT).any(axis=1),
    }


def _med(x):
    x = np.asarray(x, float); f = x[np.isfinite(x)]
    return float(np.median(f)) if len(f) else np.nan


def means(F, P, t):
    """③ 거름 일곱 가지 — 꾀마다 그 뜻에 든 쪽(ANGLES)의 조건 → {꾀: {쪽: 참 배열}}(값이 없으면 거짓)"""
    r1, r1p, r5, r5p, r20, r60, r120 = (F[x] for x in ('r1', 'r1p', 'r5', 'r5p', 'r20', 'r60', 'r120'))
    i5, i20, i20p = F['ind_r5'], F['ind_r20'], F['ind_r20p']
    pt = P[:, t]
    lo = F['leadOf']
    with np.errstate(invalid='ignore', divide='ignore'):
        dd = np.log(pt / F['hi250'])
        vr = np.abs(np.log(F['vol20'] / F['vol120']))
        r60l = np.where(lo >= 0, r60[np.maximum(lo, 0)], np.nan)
        M = {
            'g01': {'m1': (r20 > 0) & (r20 - F['maxday20'] > 0), 'vo': F['vol20'] <= _med(F['vol20'])},   # 한 달 오름(가장 크게 오른 하루를 빼도) · 하루하루 잔잔
            'g02': {'m5': r5 > 0, 'rel': i5 < 0},
            'g03': {'m1': r20 > 0, 'rel': (i20 > 0) & (F['cind'] > 0)},
            'g04': {'m5': r5 > 0, 'vo': F['volq'] <= _med(F['volq'])},
            'g05': {'rel': (F['onworst'] > 0) & (F['mkworst'] < 0)},
            'g06': {'d1': (r1p < 0) & (r1 > 0)},
            'g07': {'d1': r1 > 0, 'lv': pt > F['hi60'], 'vo': F['rng60'] <= _med(F['rng60'])},
            'g09': {'rel': np.abs(F['beta']) < 0.5},
            'g10': {'m1': r20 > 0, 'm5': r5 < 0},
            'g11': {'m5': r5 < 0, 'rel': i5 >= 0},
            'g12': {'m1': F['up20'] >= 11},
            'g14': {'lv': (F['hi250'] / F['lo20'] >= 1 / 0.7) & (pt >= 1.05 * F['lo20'])},
            'g15': {'lv': pt > F['ma120']},
            'g16': {'lv': r120 > 0, 'm1': r20 < 0},
            'g17': {'m5': (r5p > 0) & (r5 > r5p)},
            'g18': {'rel': F['lead'] & (F['indall20'] > 0)},
            'g20': {'vo': F['abs5'] > _med(F['abs5'])},
            'g21': {'lv': pt > F['hi250']},
            'g22': {'vo': F['rng20'] < _med(F['rng20'])},
            'g23': {'rel': F['cmk'] > F['cind']},
            'g24': {'m5': r5 > 0, 'rel': (i20p < 0) & (i5 > 0)},
            'g25': {'vo': vr > np.log(1.25)},
            'g26': {'m1': r20 >= 0, 'rel': i20 < 0},
            'g27': {'lv': dd <= np.log(0.7), 'vo': F['vol20'] <= _med(F['vol20'])},
            'g28': {'m1': r20 > 0, 'lv': pt >= 0.97 * F['hi20']},
            'g30': {'rel': ~F['lead'] & (lo >= 0) & (r60 > r60l)},
            'g31': {'d1': r1 > 0},
            'g33': {'rel': F['cind'] < 0},
            'g34': {'d1': r1 < 0},
            'g35': {'d1': (r1 > 0) & (F['streak'] >= 2)},
            'g36': {'m1': r20 < 0},
        }
    return {k: {a: np.asarray(v, bool) for a, v in d.items()} for k, d in M.items()}


# ── 꾀 점수(s36-v3 · 주문 1116-2134 · 사장님 2026-11-16(마카오) 20:34 「이 방정식을 36걔 병법에 올려라 각 방에 맞게 그리고 앚 쉽게 설명 하라 이헎개 해서 찾아낸 종목이라고 하라」
#    앞 주문 1116-2044(19:44 · 20:04 「… 정서적 계산과 수학적계산 방정식을 … 주식이 여러 기법들 … 그 공식을 … 여섯 까지 나열」) — docs/design/sonja-eq6-2026-11-16/brief.md · order-2134.txt)
#   여섯 식 — 수학 셋(오름 · 흔들림 · 견줌) · 정서 셋(쏠림 · 들뜸 · 기억) · 꾀마다 그 뜻에 맞는 식을 수학 하나 이상 + 정서 하나 이상 고름(MIX)
#   식마다 365곳 안 차례(0 = 가장 작음 · 1 = 가장 큼 · 같은 값은 평균 차례)로 바꾸고, 「큰 곳」 식은 차례 그대로 · 「작은 곳」 식은 1 − 차례 · 같은 무게로 더한 평균 = 꾀 점수(0~1)
#   고르는 길은 그대로(빼기 열 가지 → 꾀 뜻 → 흉내 내 보기 → 일곱까지 · 채우지 않음) — 셋을 지난 곳 가운데 꾀 점수가 높은 차례(옛 「닮은 차례」 대신)
#   쏠림(사고판 양)은 그날 사고판 양이 있어야 셈 — 사고판 양으로 고르는 다섯 꾀(BY)에만 · 나머지 서른하나의 정서 식은 값으로 세는 들뜸 · 기억
#   바탕 연구(대부분 미국 주식 — 한국에서 같은지 모름 · brief.md): 오름 Jegadeesh · Titman 1993 · 흔들림 Ang 등 2006 · 견줌 Moskowitz · Grinblatt 1999 · 쏠림 Barber · Odean 2008 · 들뜸 Bali 등 2011 · 기억 George · Hwang 2004
MIX_RULE = 'mix-v1'
FAM = ('수학', '정서')
SIX = ('오름', '흔들림', '견줌', '쏠림', '들뜸', '기억')
EQ = {   # 식 하나 — 갈래 · 여섯 식 가운데 · 이름 · 큰 곳 글 · 작은 곳 글(꾀 쪽 「이렇게 찾아요」 칸이 그대로 씀 · 쉬운 말 · 「%」 · 영어 0)
    'r1': ('수학', '오름', '하루 오름', '오늘 많이 오른 곳', '오늘 많이 내린 곳'),
    'r1p': ('수학', '오름', '어제 오름', '어제 많이 오른 곳', '어제 많이 내린 곳'),
    'r5': ('수학', '오름', '닷새 오름', '닷새 동안 많이 오른 곳', '닷새 동안 많이 내린 곳'),
    'r20': ('수학', '오름', '한 달 오름', '한 달 동안 많이 오른 곳', '한 달 동안 많이 내린 곳'),
    'r60': ('수학', '오름', '석 달 오름', '석 달 동안 많이 오른 곳', '석 달 동안 많이 내린 곳'),
    'r120': ('수학', '오름', '반년 오름', '반년 동안 많이 오른 곳', '반년 동안 많이 내린 곳'),
    'reb': ('수학', '오름', '바닥에서 오름', '한 달 가장 낮은 값에서 많이 오른 곳', '한 달 가장 낮은 값에 가까운 곳'),
    'ma': ('수학', '오름', '반년 평균 위', '반년 평균 값보다 많이 위인 곳', '반년 평균 값보다 많이 아래인 곳'),
    'up': ('수학', '오름', '오른 날 수', '스무 날 가운데 오른 날이 많은 곳', '스무 날 가운데 오른 날이 적은 곳'),
    'run': ('수학', '오름', '잇단 오름', '오른 날이 길게 이어진 곳', '오른 날이 짧게 이어진 곳'),
    'ind': ('수학', '오름', '업종 오름', '같은 일 하는 회사들이 한 달 많이 오른 곳', '같은 일 하는 회사들이 한 달 많이 내린 곳'),
    'v5': ('수학', '흔들림', '닷새 흔들림', '닷새 동안 많이 흔들린 곳', '닷새 동안 잔잔한 곳'),
    'v20': ('수학', '흔들림', '한 달 흔들림', '한 달 동안 많이 흔들린 곳', '한 달 동안 잔잔한 곳'),
    'vq': ('수학', '흔들림', '앞 석 달 흔들림', '지난 닷새 앞 석 달 동안 많이 흔들린 곳', '지난 닷새 앞 석 달 동안 잔잔했던 곳'),
    'w60': ('수학', '흔들림', '두 달 폭', '두 달 동안 오르내린 폭이 넓은 곳', '두 달 동안 오르내린 폭이 좁은 곳'),
    'w20': ('수학', '흔들림', '한 달 폭', '한 달 동안 오르내린 폭이 넓은 곳', '한 달 동안 오르내린 폭이 좁은 곳'),
    'vc': ('수학', '흔들림', '흔들림 바뀜', '한 달 흔들림이 반년 평소와 많이 달라진 곳', '한 달 흔들림이 반년 평소와 비슷한 곳'),
    'x5': ('수학', '견줌', '업종보다 닷새', '닷새 동안 같은 일 하는 회사들보다 더 오른 곳', '닷새 동안 같은 일 하는 회사들보다 더 내린 곳'),
    'x20': ('수학', '견줌', '업종보다 한 달', '한 달 동안 같은 일 하는 회사들보다 더 오른 곳', '한 달 동안 같은 일 하는 회사들보다 더 내린 곳'),
    'xl': ('수학', '견줌', '1등보다 석 달', '석 달 동안 업종 몸집 1등보다 더 오른 곳', '석 달 동안 업종 몸집 1등보다 덜 오른 곳'),
    'xw': ('수학', '견줌', '시장 내린 날', '시장이 크게 내린 날에 잘 버틴 곳', '시장이 크게 내린 날에 더 내린 곳'),
    'ci': ('수학', '견줌', '업종 닮음', '같은 일 하는 회사들과 같이 움직인 곳', '같은 일 하는 회사들과 거꾸로 움직인 곳'),
    'cm': ('수학', '견줌', '시장 닮음', '시장 전체와 같이 움직인 곳', '시장 전체와 덜 같이 움직인 곳'),
    'q1': ('정서', '쏠림', '오늘 쏠림', '오늘 사고판 양이 평소보다 많은 곳', '오늘 사고판 양이 평소보다 적은 곳'),
    'q5': ('정서', '쏠림', '닷새 쏠림', '닷새 동안 사고판 양이 평소보다 많은 곳', '닷새 동안 사고판 양이 평소보다 적은 곳'),
    'q20': ('정서', '쏠림', '한 달 쏠림', '한 달 동안 사고판 양이 많은 곳', '한 달 동안 사고판 양이 적은 곳'),
    'jump': ('정서', '들뜸', '들뜸', '한 달 안에 크게 뛴 하루가 있는 곳', '한 달 안에 크게 뛴 하루가 없는 곳'),
    'mem': ('정서', '기억', '기억', '1년 가장 높은 값에 가까운 곳', '1년 가장 높은 값에서 먼 곳'),
}
VOLQ = ('q1', 'q5', 'q20')   # 사고판 양이 있어야 세는 식(쏠림)
MIX = {   # 꾀마다 (식, 1 = 큰 곳 · -1 = 작은 곳) — 꾀 뜻(SAY)에 맞게 · 수학 하나 이상 + 정서 하나 이상
    'g01': (('r20', 1), ('v20', -1), ('jump', -1)), 'g02': (('x5', 1), ('r5', 1), ('jump', -1)), 'g03': (('ci', 1), ('ind', 1), ('mem', 1)),
    'g04': (('r5', 1), ('vq', -1), ('jump', 1)), 'g05': (('xw', 1), ('mem', 1)), 'g06': (('r1', 1), ('r1p', -1), ('jump', 1)),
    'g07': (('w60', -1), ('r1', 1), ('mem', 1)), 'g08': (('v20', -1), ('q5', 1)), 'g09': (('cm', -1), ('jump', -1)),
    'g10': (('r20', 1), ('r5', -1), ('mem', 1)), 'g11': (('x5', -1), ('mem', -1)), 'g12': (('up', 1), ('jump', -1)),
    'g13': (('q1', 1), ('v5', 1)), 'g14': (('reb', 1), ('mem', -1)), 'g15': (('ma', 1), ('mem', 1)),
    'g16': (('r120', 1), ('r20', -1), ('jump', -1)), 'g17': (('r5', 1), ('jump', 1)), 'g18': (('ind', 1), ('mem', 1)),
    'g19': (('r60', 1), ('q5', -1)), 'g20': (('v5', 1), ('jump', 1)), 'g21': (('mem', 1), ('r1', 1)),
    'g22': (('w20', -1), ('jump', -1)), 'g23': (('cm', 1), ('ci', -1), ('jump', -1)), 'g24': (('r5', 1), ('ci', 1), ('mem', -1)),
    'g25': (('vc', 1), ('jump', 1)), 'g26': (('x20', 1), ('mem', 1)), 'g27': (('v20', -1), ('mem', -1), ('jump', -1)),
    'g28': (('r20', 1), ('mem', 1)), 'g29': (('r5', 1), ('q5', -1)), 'g30': (('xl', 1), ('mem', 1)),
    'g31': (('r1', 1), ('jump', 1)), 'g32': (('v20', -1), ('q20', -1)), 'g33': (('ci', -1), ('jump', -1)),
    'g34': (('r1', -1), ('mem', -1)), 'g35': (('run', 1), ('jump', -1)), 'g36': (('r20', -1), ('mem', -1)),
}
assert sorted(MIX) == KINDS


def _pct(x):
    """365곳 안 차례 0~1(작은 값 0 · 큰 값 1 · 같은 값은 평균 차례 · 값이 없으면 nan)"""
    x = np.asarray(x, float); out = np.full(len(x), np.nan); f = np.where(np.isfinite(x))[0]
    if not len(f): return out
    if len(f) == 1: out[f] = 0.5; return out
    o = f[np.argsort(x[f], kind='mergesort')]; v = x[o]; i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and v[j + 1] == v[i]: j += 1
        out[o[i:j + 1]] = (i + j) / 2 / (len(o) - 1); i = j + 1
    return out


def terms(F, P, t):
    """여섯 식의 값(회사마다 · 값으로 세는 것 — 쏠림 셋은 lists36 의 사고판 양 칸에서 더함)"""
    r60 = F['r60']; pt = P[:, t]; lo = F['leadOf']
    with np.errstate(invalid='ignore', divide='ignore'):
        r60l = np.where(lo >= 0, r60[np.maximum(lo, 0)], np.nan)
        return {'r1': F['r1'], 'r1p': F['r1p'], 'r5': F['r5'], 'r20': F['r20'], 'r60': r60, 'r120': F['r120'],
                'reb': np.log(pt / F['lo20']), 'ma': np.log(pt / F['ma120']), 'up': F['up20'], 'run': F['streak'] + np.nan_to_num(F['r5']) / 10, 'ind': F['indall20'],
                'v5': F['abs5'], 'v20': F['vol20'], 'vq': F['volq'], 'w60': F['rng60'], 'w20': F['rng20'], 'vc': np.abs(np.log(F['vol20'] / F['vol120'])),
                'x5': F['r5'] - F['ind_r5'], 'x20': F['r20'] - F['ind_r20'], 'xl': r60 - r60l, 'xw': F['onworst'], 'ci': F['cind'], 'cm': F['cmk'],
                'jump': F['maxday20'], 'mem': np.log(pt / F['hi250'])}


def mixscore(k, T, Q=None):
    """꾀 k 의 꾀 점수(회사마다 0~1 · 식 하나라도 값이 없으면 nan) · Q = 식마다 차례(나눠 씀)"""
    Q = {} if Q is None else Q
    acc = None
    for e, d in MIX[k]:
        if e not in Q: Q[e] = _pct(T[e])
        s = Q[e] if d > 0 else 1.0 - Q[e]
        acc = s.copy() if acc is None else acc + s
    return acc / len(MIX[k])


def mixrow(k, j, T, Q):
    """고른 회사 하나의 꾀 점수 · 식마다 차례 · 값(자료 mix.val — 검사가 꺾은선 값으로 다시 셈)"""
    q = [float(Q[e][j]) for e, _ in MIX[k]]
    s = sum(x if d > 0 else 1.0 - x for x, (_, d) in zip(q, MIX[k])) / len(MIX[k])
    return [round(s, 4), [round(x, 4) for x in q], [round(float(T[e][j]), 6) for e, _ in MIX[k]]]


# ① 흉내 내 보기 — 꾀마다 (방법, 창, 쓰는 줄, 셈) · 줄: R 회사 · M 시장 · I 같은 업종 다른 회사 평균 · A 업종 평균 · L 업종 몸집 1등 · V 사고판 양(평소의 몇 배) · med 365곳 가운데 흔들림
def _sum(x): return x.sum(-1)
def _std(x): return x.std(-1)
def _corr3(a, b):
    a = a - a.mean(-1, keepdims=True); b = b - b.mean(-1, keepdims=True)
    den = np.sqrt((a * a).sum(-1) * (b * b).sum(-1))
    return np.where(den > 0, (a * b).sum(-1) / np.where(den > 0, den, 1.0), 0.0)
def _beta3(a, m):
    a = a - a.mean(-1, keepdims=True); m = m - m.mean(-1, keepdims=True)
    v = (m * m).sum(-1)
    return np.where(v > 0, (a * m).sum(-1) / np.where(v > 0, v, 1.0), 0.0)
def _brk(x):    # 마지막 날 값이 창 안 그 앞 가장 높은 값(처음 값 넣고)보다 위로 나온 만큼
    c = np.cumsum(x, -1); return c[..., -1] - np.maximum(np.max(c[..., :-1], -1), 0.0)
def _reb(x):    # 창 안 가장 낮은 값에서 살아난 만큼
    c = np.cumsum(x, -1); return c[..., -1] - np.minimum(np.min(c, -1), 0.0)
def _rng(x):    # 창 안 높낮이 폭(좁을수록 큼)
    c = np.cumsum(x, -1); return -(np.maximum(c.max(-1), 0.0) - np.minimum(c.min(-1), 0.0))
def _ma(x):     # 마지막 날 값이 창 평균 값보다 위인 만큼
    c = np.cumsum(x, -1); return c[..., -1] - np.log(np.mean(np.exp(c), -1))
def _streak(x): # 끝에서부터 잇달아 오른 날
    return np.cumprod(x[..., ::-1] > 0, -1).sum(-1).astype(float)
def _worst(x, m):  # 창 안 시장이 가장 크게 내린 닷새에 회사가 움직인 평균
    idx = np.argsort(m, -1)[..., :5]
    idx = np.broadcast_to(idx, x.shape[:-1] + (5,))
    return np.take_along_axis(x, idx, -1).mean(-1)
MCS = {
    'g01': ('rare', 20, 'R', lambda S: _sum(S['R']) / (_std(S['R']) * np.sqrt(20) + 1e-9)),
    'g02': ('rare', 5, 'RI', lambda S: _sum(S['R'] - S['I'])),
    'g03': ('sure', 60, 'RI', lambda S: _corr3(S['R'], S['I']) > 0),
    'g04': ('rare', 5, 'R', lambda S: _sum(S['R'])),
    'g05': ('rare', 20, 'RM', lambda S: _worst(S['R'], S['M'])),
    'g06': ('rare', 2, 'R', lambda S: S['R'][..., -1] - S['R'][..., -2]),
    'g07': ('rare', 60, 'R', lambda S: _brk(S['R'])),
    'g08': ('rare', 5, 'V', lambda S: S['V'].mean(-1)),
    'g09': ('sure', 60, 'RM', lambda S: np.abs(_beta3(S['R'], S['M'])) < 0.5),
    'g10': ('rare', 20, 'R', lambda S: np.minimum(_sum(S['R']), -_sum(S['R'][..., -5:]))),
    'g11': ('rare', 5, 'RI', lambda S: _sum(S['I'] - S['R'])),
    'g12': ('rare', 20, 'R', lambda S: (S['R'] > 0).sum(-1).astype(float)),
    'g13': ('rare', 1, 'V', lambda S: S['V'][..., -1]),
    'g14': ('rare', 20, 'R', lambda S: _reb(S['R'])),
    'g15': ('rare', 120, 'R', lambda S: _ma(S['R'])),
    'g16': ('rare', 120, 'R', lambda S: np.minimum(_sum(S['R']), -_sum(S['R'][..., -20:]))),
    'g17': ('rare', 10, 'R', lambda S: _sum(S['R'][..., -5:]) - _sum(S['R'][..., :5])),
    'g18': ('rare', 20, 'A', lambda S: _sum(S['A'])),
    'g19': ('rare', 5, 'V', lambda S: -S['V'].mean(-1)),
    'g20': ('rare', 5, 'R', lambda S: np.abs(S['R']).mean(-1)),
    'g21': ('rare', 250, 'R', lambda S: _brk(S['R'])),
    'g22': ('rare', 20, 'R', lambda S: _rng(S['R'])),
    'g23': ('sure', 60, 'RMI', lambda S: _corr3(S['R'], S['M']) > _corr3(S['R'], S['I'])),
    'g24': ('rare', 5, 'R', lambda S: _sum(S['R'])),
    'g25': ('rare', 120, 'R', lambda S: np.abs(np.log((_std(S['R'][..., -20:]) + 1e-9) / (_std(S['R']) + 1e-9)))),
    'g26': ('rare', 20, 'RI', lambda S: _sum(S['R'] - S['I'])),
    'g27': ('sure', 20, 'R', lambda S: _std(S['R']) <= S['med']),
    'g28': ('rare', 20, 'R', lambda S: _sum(S['R'])),
    'g29': ('rare', 5, 'R', lambda S: _sum(S['R'])),
    'g30': ('rare', 60, 'RL', lambda S: _sum(S['R'] - S['L'])),
    'g31': ('rare', 1, 'R', lambda S: S['R'][..., -1]),
    'g32': ('rare', 20, 'V', lambda S: -S['V'].mean(-1)),
    'g33': ('sure', 60, 'RI', lambda S: _corr3(S['R'], S['I']) < 0),
    'g34': ('rare', 1, 'R', lambda S: -S['R'][..., -1]),
    'g35': ('rare', 10, 'R', lambda S: _streak(S['R'])),
    'g36': ('rare', 20, 'R', lambda S: -_sum(S['R'])),
}
assert sorted(MCS) == KINDS


def _seed(*xs):
    return int(hashlib.sha256('|'.join(map(str, xs)).encode()).hexdigest()[:16], 16)


class _MC:
    """흉내 내 보기 열 번 — 판 날 하나 · 회사들 묶음마다(뽑는 날 자리는 꾀 · 씨앗마다 한 번만 뽑아 모든 회사가 같은 자리를 씀 → 묶음을 어떻게 나눠도 같은 답)"""
    def __init__(self, F, t, day, V=None, base=None):
        self.t, self.day = t, day
        self.ser = {'R': np.nan_to_num(F['LR']), 'M': np.nan_to_num(F['mk'])[None, :], 'I': np.nan_to_num(F['loo']), 'A': np.nan_to_num(F['iall'])}
        self.ser['L'] = self.ser['R'][np.maximum(F['leadOf'], 0)]
        if V is not None and base is not None:
            with np.errstate(invalid='ignore', divide='ignore'):
                self.ser['V'] = np.nan_to_num(V / base[:, None], nan=1.0, posinf=1.0, neginf=1.0)
        self.med = _med(F['vol20'])
        self.idx = {}

    def _ix(self, k, run, hi, w):
        key = (k, run, hi, w)
        if key not in self.idx:
            self.idx[key] = np.random.default_rng(_seed(self.day, k, run, 's36-mc')).integers(0, hi, size=(MC_PATHS, w))
        return self.idx[key]

    def ok(self, k, js):
        """js(회사 자리) 마다 열 번 모두 뚜렷하면 참"""
        mode, w, use, fn = MCS[k]
        js = np.asarray(js, int)
        out = np.ones(len(js), bool)
        if not len(js): return out
        if 'V' in use and 'V' not in self.ser: return ~out
        vol = use == 'V'
        end = self.t + 1 if vol else self.t           # 줄 끝(날 차례) — 사고판 양은 판 날까지 · 하루 값은 판 날로 끝나는 오르내림까지
        a = end - w                                    # 창 [a, end)
        hist = min(VOL_HIST if vol else MC_HIST, a)    # 바탕 [a - hist, a)
        if mode == 'rare' and hist < (20 if vol else MC_MIN_HIST): return ~out
        step = max(1, 2_000_000 // (MC_PATHS * w))
        for s0 in range(0, len(js), step):
            jj = js[s0:s0 + step]
            win = {n: self.ser[n][(jj if self.ser[n].shape[0] > 1 else [0]), a:end] for n in use}
            obs = fn({**{n: v[:, None, :] for n, v in win.items()}, 'med': self.med})
            tot = MC_RUNS * MC_PATHS
            cnt = np.zeros(len(jj))                    # 드묾: 지금 값 이상인 우연 길 수 · 굳음: 같은 모습인 길 수(열 번을 모아 셈)
            live = np.ones(len(jj), bool)
            for run in range(MC_RUNS):
                if mode == 'rare':
                    ix = self._ix(k, run, hist, w)
                    S = {n: self.ser[n][(jj if self.ser[n].shape[0] > 1 else [0]), a - hist:a][:, ix] for n in use}
                    cnt += (fn({**S, 'med': self.med}) >= obs - 1e-12).sum(axis=1)
                    live &= (cnt + 1) / (tot + 1) <= MC_P                       # 남은 번이 모두 넘지 않아도 이미 열에 하나를 넘으면 뺌
                else:
                    ix = self._ix(k, run, w, w)
                    S = {n: v[:, ix] for n, v in win.items()}
                    cnt += fn({**S, 'med': self.med}).sum(axis=1)
                    live &= (cnt + (MC_RUNS - run - 1) * MC_PATHS) / tot >= MC_SURE   # 남은 번이 모두 같아도 열에 아홉이 안 되면 뺌
                if not live.any(): break
            good = live & (((cnt + 1) / (tot + 1) <= MC_P) if mode == 'rare' else (cnt / tot >= MC_SURE))
            out[s0:s0 + step] = good
        return out


def _pick(k, cand, score, codes, mc, mask=None):
    """셋을 지난 곳 가운데 꾀를 닮은 차례로 K 곳(흉내 내 보기는 닮은 차례로 묶음마다 — 일곱이 차면 멈춤) · mask = 흉내 내 보기를 미리 센 값(판 날)"""
    s = np.asarray(score, float)
    order = sorted([j for j in cand if np.isfinite(s[j])], key=lambda j: (-s[j], codes[j]))
    out = []
    for a in range(0, len(order), 16):
        chunk = order[a:a + 16]
        ok = mask[chunk] if mask is not None else mc.ok(k, chunk)
        out += [codes[j] for j, o in zip(chunk, ok) if o]
        if len(out) >= K: break
    return out[:K]


def lists36(codes, IX, P, t, cap, vol=None, dates=None, late=(), vmat=None, full=False):
    """codes(365 · 차례) · IX(업종 번호) · P(종가 행렬 회사 × 날) · t(판 날 번호) · cap(몸집 · 억 원)
       · vol({번호: [[YYYYMMDD, 종가, 거래량], …]} 또는 None) · full = 판 날(흉내 내 보기를 365곳 모두 세어 걸러진 수를 남김)
       → {lists: {k: [번호 일곱까지]}, why: {k: 까닭}, volDay, volN, funnel(full 일 때 꾀마다 수)}"""
    if P is None or t < NEED_T:
        return {'lists': {k: [] for k in KINDS}, 'why': {k: '지난 값이 모자라 못 셈' for k in KINDS}, 'volDay': None, 'volN': 0, 'funnel': None, 'mix': {}}
    N = len(codes)
    F = feats(codes, IX, P, t, cap)
    C = cuts(codes, P, t, cap, late, F)
    cutAll = np.logical_and.reduce([C[x] for x, _ in CUT])
    dataOk = C['today'] & C['m21'] & C['y240']
    Mn, T, Q = means(F, P, t), terms(F, P, t), {}
    Sc = {k: mixscore(k, T, Q) for k in KINDS if k not in BY}   # 꾀 점수(주문 1116-2134)
    at = {c: j for j, c in enumerate(codes)}
    day = dates[t] if dates is not None and t < len(dates) else 't%d' % t
    L, why, fun, MV = {}, {}, {}, {}

    def one(k, mc, mk):
        cand = np.where(cutAll & mk)[0]
        if full:
            mcm = np.zeros(N, bool); dj = np.where(dataOk)[0]; mcm[dj] = mc.ok(k, dj)
            L[k] = _pick(k, cand, Sc[k], codes, mc, mask=mcm)
            fun[k] = {'n': int(N), 'mc': int(mcm.sum()), 'cut': int(cutAll.sum()), 'mean': int(mk.sum()), 'all': int((mcm & cutAll & mk).sum()), 'k': len(L[k])}
        else:
            L[k] = _pick(k, cand, Sc[k], codes, mc)
        if not L[k]: why[k] = NONE_MEAN
        MV[k] = {c: mixrow(k, at[c], T, Q) for c in L[k]}   # 고른 곳마다 꾀 점수 · 식마다 차례 · 값

    mc = _MC(F, t, day)
    for k in KINDS:
        if k in BY: continue
        one(k, mc, np.logical_and.reduce(list(Mn[k].values())))
    # 거래량 다섯
    volDay, volN = None, 0
    V = None
    if vmat is not None and dates is not None:   # 지난 날을 여러 번 셀 때(su21_sun.py) — 미리 만든 거래량 행렬(날 차례 · 판 날 t 뒤는 쓰지 않음)
        V = vmat[:, :t + 1]; volN = int(np.isfinite(V[:, t]).sum()) if t < vmat.shape[1] else 0   # 판 날까지만 자름
        volDay = dates[t] if volN else None
    elif vol and dates is not None:
        V, volN = vol_mats(codes, vol, dates, t)
        volDay = dates[t] if volN else None
    if volN < VOL_MIN * N:
        msg = '거래량 자료가 없어 못 셈(올리기 작업만 받음)' if not volN else '그날 거래량을 받은 회사가 모자라 못 셈(%d곳 가운데 %d곳)' % (N, volN)
        for k in BY: L[k], why[k] = [], msg
        return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN, 'funnel': fun if full else None, 'mix': MV}
    vok = np.isfinite(V[:, t])
    with np.errstate(invalid='ignore', divide='ignore'):
        base = np.array([np.nanmedian(V[j, max(0, t - 64):t - 4]) if np.isfinite(V[j, max(0, t - 64):t - 4]).sum() >= 20 else np.nan for j in range(N)])
        v5 = np.nanmean(V[:, -5:], axis=1) / base                                      # 닷새 평균 ÷ 그 앞 60거래일 가운데 값
        v1 = V[:, t] / base
        sh = np.asarray(cap, float) * 1e8 / P[:, t]                                    # 주식 수 어림 = 몸집 ÷ 그날 종가
        to20 = np.nanmean(V[:, -20:], axis=1) / sh
        r5, r20, r60 = F['r5'], F['r20'], F['r60']
        VM = {'g08': {'m1': np.abs(r20) < 0.05, 'qty': v5 > 1}, 'g13': {'qty': v1 > 1.5}, 'g19': {'lv': r60 > 0.1, 'qty': v5 < 1},
              'g29': {'m5': r5 > 0, 'qty': v5 < 1}, 'g32': {'m1': r20 >= 0, 'qty': to20 <= _med(to20)}}
        T.update({'q1': np.log(v1), 'q5': np.log(v5), 'q20': np.log(to20)})   # 쏠림 셋(사고판 양 · 평소의 몇 배 · 한 달 사고판 몫)
    Sc.update({k: mixscore(k, T, Q) for k in BY})
    Mn.update({k: {a: np.asarray(v, bool) & vok for a, v in d.items()} for k, d in VM.items()})
    mcv = _MC(F, t, day, V=V, base=base)
    for k in sorted(BY): one(k, mcv, np.logical_and.reduce(list(Mn[k].values())))
    return {'lists': {k: L[k] for k in KINDS}, 'why': why, 'volDay': volDay, 'volN': volN, 'funnel': fun if full else None, 'mix': MV}


# 겹친 곳(주문 1114-0802 · 사장님 2026-11-14 08:02 「36 갠가 40 개인가 42 개인가의 종류가 있잖아 그중에서 36개 정도 겹치는 그 종목을 별도로 또 … 또 폴더 또 만들어 그래도 똑같이 만들어」 · 08:06 「맞아」
#   — docs/design/s36-2026-11-13/order-0802.txt)
#   첫 화면 묶음 마흔셋(지금 셋 · 될 듯 셋 · 조용한 힘 · 꾀 서른여섯 — 묶음마다 앞 일곱) 가운데 세 묶음 이상에 든 회사 · 많이 든 차례 · 같으면 첫 화면에서 먼저 나온 차례
OV_RULE = 'ovl-v1'
OV_NEED = 3
OV_ORDER = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext', 'quiet'] + KINDS   # 첫 화면 차례(지금 셋 → 될 듯 셋 → 조용한 힘 → 꾀 1 ~ 36)


def overlap(groups, need=OV_NEED, order=None, k=K):
    """groups = {묶음: [번호…]} → [(번호, 든 묶음 수, [든 묶음…])] · 묶음마다 앞 k 곳만 · 한 묶음에 두 번 나와도 한 번"""
    order = order or OV_ORDER
    first, ins, pos = {}, {}, 0
    for g in order:
        for c in (groups.get(g) or [])[:k]:
            first.setdefault(c, pos); pos += 1
            v = ins.setdefault(c, [])
            if g not in v: v.append(g)
    out = [(c, len(v), v) for c, v in ins.items() if len(v) >= need]
    out.sort(key=lambda x: (-x[1], first[x[0]]))
    return out


if __name__ == '__main__':   # 스스로 시험 — python3 su21_s36.py --selftest · --defs(이름 · 뜻 JSON)
    import sys, json, time
    if '--defs' in sys.argv:
        print(json.dumps({'rule': RULE_ID, 'kinds': KINDS, 'han': HAN, 'name': NAME, 'mean': MEAN, 'say': SAY, 'set': SETOF, 'by': BY,
                          'mixRule': MIX_RULE, 'eq': {e: list(v) for e, v in EQ.items()}, 'mix': {k: [list(x) for x in v] for k, v in MIX.items()}}, ensure_ascii=False))
    if '--selftest' in sys.argv:
        assert len(KINDS) == 36 == len(DEF) and len(set(HAN.values())) == 36 and len(set(NAME.values())) == 36 and len(set(SAY.values())) == 36
        assert all('%' not in s and not any('A' <= ch <= 'z' for ch in s) for d in DEF for s in d), '「%」 · 영어 0'
        assert len(CUT) == 10 and len({c[0] for c in CUT}) == 10 and len(ANGLES) == 7, '소거 열 가지 · 거름 일곱 가지'
        # 여섯 식(주문 1116-2134) — 꾀마다 수학 하나 이상 + 정서 하나 이상 · 식은 여섯 가운데 · 쏠림은 사고판 양 꾀(BY)에만 · BY 는 쏠림을 꼭 씀 · 꾀마다 섞은 것이 서로 다름 · 글 「%」 · 영어 0 · 「가장」이 차례를 뜻하지 않음
        assert set(e[1] for e in EQ.values()) == set(SIX) and all(e[0] in FAM for e in EQ.values()) and set(VOLQ) == {k for k, e in EQ.items() if e[1] == '쏠림'}
        for k, mx in MIX.items():
            fam = [EQ[e][0] for e, _ in mx]
            assert '수학' in fam and '정서' in fam and all(d in (1, -1) for _, d in mx) and len({e for e, _ in mx}) == len(mx), (k, mx)
            assert (k in BY) == any(e in VOLQ for e, _ in mx), (k, '쏠림은 사고판 양 꾀에만')
        assert len({tuple(m) for m in MIX.values()}) == 36, '꾀마다 섞은 식이 다름'
        assert all('%' not in x and not any('A' <= ch <= 'z' for ch in x) for e in EQ.values() for x in e), '식 글 「%」 · 영어 0'
        assert not any('가장' in SAY[k] and '가장 높은 값' not in SAY[k] and '가장 크게 내린 날' not in SAY[k] for k in KINDS), '고르는 법에 차례를 뜻하는 「가장」 없음(차례 = 꾀 점수)'
        assert list(_pct([3, 1, 2, np.nan, 2])[:3]) == [1.0, 0.0, 0.5] and np.isnan(_pct([1, np.nan])[1]) and _pct([7])[0] == 0.5
        rng = np.random.default_rng(1)
        N, T = 60, 520
        sd = 0.012 + 0.0003 * np.arange(N)                                    # 회사마다 흔들림이 다름(가장 흔들리는 곳 = 59)
        LRm = rng.normal(0, 1, (N, T - 1)) * sd[:, None]
        LRm[3, -20:] = 0.006 + rng.normal(0, 0.002, 20)                         # 3 = 한 달 꾸준히 · 잔잔하게 오름(몰래 바다 건너기)
        LRm[5, -1] = 0.07                                                       # 5 = 오늘 크게 오름(미인 꾀)
        LRm[6, -1] = -0.07                                                      # 6 = 오늘 크게 내림(제 몸 다치기)
        P = np.exp(np.concatenate([np.zeros((N, 1)), np.cumsum(LRm, axis=1)], axis=1)) * 5000
        codes = ['%06d' % (j + 1) for j in range(N)]; IX = np.array([j % 10 for j in range(N)]); cap = np.arange(N, 0, -1) * 100.0
        dates = ['2026-%02d-%02d' % (1 + i // 28, 1 + i % 28) for i in range(T)]
        t0 = time.time()
        r = lists36(codes, IX, P, T - 1, cap, dates=dates, late={'000001'}, full=True)
        took = time.time() - t0
        Lk = r['lists']
        assert '000004' == Lk['g01'][0], ('몰래 바다 건너기 = 꾸준히 잔잔하게 오른 곳이 맨 앞', Lk['g01'])
        assert '000006' in Lk['g31'] and '000007' in Lk['g34'], ('오늘 크게 오른 곳 · 내린 곳', Lk['g31'], Lk['g34'])
        assert '000001' not in sum(Lk.values(), []), '값이 늦은 회사는 뺌'
        assert all(Lk[k] == [] for k in BY) and r['volN'] == 0 and '없어' in r['why']['g13']
        # 고른 곳은 모두 소거 열 가지 · 거름 일곱 가지 · 흉내 내 보기 열 번을 지남 · 닮은 차례 · 일곱까지 · 모자라면 모자란 대로(채우지 않음)
        F = feats(codes, IX, P, T - 1, cap); C = cuts(codes, P, T - 1, cap, {'000001'}, F); Mn = means(F, P, T - 1)
        Tm, Qm = terms(F, P, T - 1), {}; Sc = {k: mixscore(k, Tm, Qm) for k in KINDS if k not in BY}   # 꾀 점수(주문 1116-2134)
        cutAll = np.logical_and.reduce([C[x] for x, _ in CUT]); mc = _MC(F, T - 1, dates[T - 1])
        at = {c: j for j, c in enumerate(codes)}
        for k in KINDS:
            if k in BY: continue
            js = [at[c] for c in Lk[k]]
            assert len(js) <= K and all(cutAll[j] for j in js), (k, '소거')
            assert all(all(v[j] for v in Mn[k].values()) for j in js), (k, '거름 — 꾀 뜻')
            assert all(mc.ok(k, [j])[0] for j in js), (k, '흉내 내 보기(하나씩 세어도 같음)')
            s = [Sc[k][j] for j in js]; assert s == sorted(s, reverse=True), (k, '꾀 점수 차례')
            for c, j in zip(Lk[k], js):   # 자료 mix.val = 꾀 점수 · 식마다 차례 · 값(검사가 다시 셈)
                sv, qv, vv = r['mix'][k][c]
                assert abs(sv - Sc[k][j]) < 1e-4 and abs(sv - sum(x if d > 0 else 1 - x for x, (_, d) in zip(qv, MIX[k])) / len(MIX[k])) < 2e-4, (k, c, sv)
                assert all(abs(v - Tm[e][j]) < 1e-5 for v, (e, _) in zip(vv, MIX[k])), (k, c, '식 값')
            f = r['funnel'][k]
            assert f['n'] == N and f['k'] == len(js) and f['all'] <= min(f['mc'], f['cut'], f['mean']) and f['k'] == min(K, f['all']), (k, f)
            if not js: assert r['why'][k] == NONE_MEAN, (k, r['why'].get(k))
        # 묶음을 어떻게 나눠도 같은 답 · 다시 세어도 같은 답(씨앗 = 판 날 · 꾀 · 번)
        js = list(range(N)); a1 = mc.ok('g01', js); a2 = np.concatenate([mc.ok('g01', js[:7]), mc.ok('g01', js[7:])]); assert (a1 == a2).all()
        r2 = lists36(codes, IX, P, T - 1, cap, dates=dates, late={'000001'})
        assert r2['lists'] == Lk and r2['funnel'] is None, '판 날을 다시 세어도(지난 날 다시 세기 길) 같은 일곱'
        # 내리는 장 — 오른 꾀는 비우고(채우지 않음) 내린 꾀는 고름
        D = LRm.copy(); D[:, -20:] = -0.01 + rng.normal(0, 0.008, (N, 20))
        P2 = np.exp(np.concatenate([np.zeros((N, 1)), np.cumsum(D, axis=1)], axis=1)) * 5000
        q = lists36(codes, IX, P2, T - 1, cap, dates=dates)
        assert q['lists']['g01'] == [] and q['why']['g01'] == NONE_MEAN and len(q['lists']['g36']) >= 1, (q['lists']['g01'], q['lists']['g36'])
        # 거래량 다섯 — 오늘 사고판 양이 평소의 열 배(풀 쳐서 뱀 놀래기)
        vol = {c: [[dates[i].replace('-', ''), float(P[j, i]), float(1e5 * (1 + 0.1 * np.sin(i + j)) * (10 if (i == T - 1 and j == 8) else 1))] for i in range(T - 120, T)] for j, c in enumerate(codes)}
        r3 = lists36(codes, IX, P, T - 1, cap, vol=vol, dates=dates, full=True)
        assert r3['volN'] == N and r3['volDay'] == dates[-1] and r3['lists']['g13'][:1] == ['000009'], r3['lists']['g13']
        half = {c: v for i, (c, v) in enumerate(vol.items()) if i % 2}
        r4 = lists36(codes, IX, P, T - 1, cap, vol=half, dates=dates)
        assert all(r4['lists'][k] == [] for k in BY) and '모자라' in r4['why']['g08'], '거래량을 덜 받은 날은 다섯을 고르지 않음'
        r0 = lists36(codes, IX, None, 0, cap)
        assert all(r0['lists'][k] == [] for k in KINDS) and r0['why']['g01'] == '지난 값이 모자라 못 셈'
        # 겹친 곳(주문 1114-0802) — 세 묶음 이상 · 많이 든 차례 · 같으면 첫 화면에서 먼저 · 한 묶음 두 번은 한 번 · 앞 일곱만
        G = {'hot': ['A', 'B', 'C'], 'bloom': ['B', 'D'], 'money': ['A', 'B', 'A'], 'quiet': ['D', 'E'], 'g01': ['E', 'D', 'C'], 'g02': ['C', 'E'], 'g36': ['X'] * 8 + ['A'], 'g03': list('1234567') + ['B']}
        ov = overlap(G)
        assert ov == [('B', 3, ['hot', 'bloom', 'money']), ('C', 3, ['hot', 'g01', 'g02']), ('D', 3, ['bloom', 'quiet', 'g01']), ('E', 3, ['quiet', 'g01', 'g02'])], ov
        assert [c for c, n, _ in overlap(G, need=2)] == ['B', 'C', 'D', 'E', 'A'] and overlap({}) == [] and len(OV_ORDER) == 43 == len(set(OV_ORDER))
        assert set(r3['mix']['g13']) == set(r3['lists']['g13']) and all(len(v[1]) == len(MIX['g13']) for v in r3['mix']['g13'].values())
        print('ok', sum(len(v) for v in Lk.values()), 'of', 7 * 31, '· vol', sum(len(r3['lists'][k]) for k in BY), '· full %.1fs' % took, '· ovl', len(ov))
