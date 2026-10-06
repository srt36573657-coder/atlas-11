#!/usr/bin/env python3
"""ATLAS 11 공부 · 「출목표 말고 제3의 방식」 — 날마다 표시 스물셋과 그 뒤 결과(공부 기록 · 사이트는 바꾸지 않음)
사장님 2026-10-06 12:16 「그러면 출목표 말고 말이야 제3에 방식에 분석표를 만들어 내가 원하는 것을 찾는 구조를 찾아내봐」
  찾는 것 = 대세 상승 초입(그 날 종가에서 120거래일 = 6달 안에 +50%) — 01:24 「제안대로해」의 잣대 그대로
  표시는 모두 그 날까지의 자료만 쓴다(앞날 값 없음) · 출목표 그림은 쓰지 않는다
  갈래 여섯(결과를 보기 전에 정함 · 12:30):
    자리   F01 6달 신고가 근처 · F02 1년 신고가 근처 · F03 6달 바닥 근처 · F04 크게 떨어진 뒤 · F05 6달 추세 위 20% · F06 6달 추세 아래 20% · F07 바닥에서 돌아섬
    추세   F08 이동평균 정배열 · F09 120일선을 막 넘음 · F10 출렁임이 줄어듦
    거래량 F11 거래량 급증 · F12 거래량 늘며 오름 · F13 거래가 말라붙음 · F14 신고가 + 거래량
    업종   F15 업종 6달 추세 위 20% · F16 업종 1달 추세 위 20% · F17 앞선 업종 안 뒤처진 회사 · F18 업종 동반 신고가(다섯 중 셋 이상)
    시장   F19 시장 큰 하락 뒤 · F20 시장 넓이 바닥 · F21 시장 반등 시작
    실적   F22 영업이익 30% 넘게 늚 · F23 흑자 전환(연간 · 4월 1일부터 쓴 것으로 봄 → 2025-04 이후만)
    (덧붙임 12:58 — 분석표 1차를 본 뒤) N15 · N17 = F15 · F17 과 같은 셈을 네이버 업종 나눔(다섯 곳 넘는 업종)으로 1,270곳 모두에 — 다른 업종 나눔 · 다른 회사 묶음으로 다시 보려고
  날 거르기: 앞 140일 · 뒤 120일 안에 하루 ±31% 넘는 자료 끊김(액면 분할 같은)이 있으면 뺀다(첫 판과 같은 뜻)
  원천: reports/atlas11/universe/2026-10-05-0940/bundle.json.gz(네이버 일봉 · 연간 재무) · 업종 = public/data/atlas11/view/board.json groups(73 × 5)
  쓰는 법: python3 scripts/atlas11/study/third_way_features.py <출력.pkl>
"""
import gzip, json, sys
import numpy as np
import pandas as pd
from numpy.lib.stride_tricks import sliding_window_view as swv

OUT = sys.argv[1]
L, AHEAD, AH3, JUMP = 140, 120, 60, 0.31
B = json.loads(gzip.open('reports/atlas11/universe/2026-10-05-0940/bundle.json.gz').read())
board = json.load(open('public/data/atlas11/view/board.json', encoding='utf-8'))
grp_of = {code: g['id'] for g in board['groups'] for code in g['codes']}
inb = set(grp_of)

def num(s):
    try:
        s = str(s).replace(',', '').strip()
        return float(s) if s not in ('', '-', 'None') else np.nan
    except Exception:
        return np.nan

def op_income(stock):
    """연간 영업이익 {'2023': x, '2024': y, '2025': z} — 컨센서스(예상치)는 쓰지 않음"""
    try:
        f = json.loads(stock['finance']['text'])['financeInfo']
    except Exception:
        return {}
    keys = {t['key']: t.get('isConsensus') == 'Y' for t in f.get('trTitleList', [])}
    out = {}
    for row in f.get('rowList', []):
        if row.get('title') == '영업이익':
            for k, cell in (row.get('columns') or {}).items():
                # 12월 결산만(3월 · 6월 결산은 발표 때가 달라 4월 1일 잣대가 앞날을 미리 보게 됨)
                if not keys.get(k, True) and str(k).endswith('12'):
                    out[k[:4]] = num(cell.get('value'))
    return out

rows = []
series = {}
for code, s in B['stocks'].items():
    r = (s.get('fchart') or {}).get('rows')
    if not isinstance(r, list) or len(r) < L + 1 + AHEAD:
        continue
    d = np.array([str(x[0]) for x in r]); c = np.array([float(x[4]) for x in r]); v = np.array([float(x[5]) for x in r])
    if not (c > 0).all():
        continue
    series[code] = (d, c, v)

# 시장 지수(365곳 똑같은 무게) · 업종 지수(73 × 5) — 하루 ±31% 넘는 등락은 그 회사만 그날 뺀다(road_start_groups.mjs 와 같은 뜻)
all_dates = sorted({x for code in series for x in series[code][0]})
di = {x: i for i, x in enumerate(all_dates)}
ND = len(all_dates)
def ret_matrix(codes):
    M = np.full((len(codes), ND), np.nan)
    for k, code in enumerate(codes):
        if code not in series: continue
        d, c, _ = series[code]
        rr = c[1:] / c[:-1] - 1
        rr[np.abs(rr) > JUMP] = np.nan
        M[k, [di[x] for x in d[1:]]] = rr
    return M
def index_from(M, min_members):
    cnt = np.sum(~np.isnan(M), axis=0); mean = np.nanmean(np.where(np.isnan(M), np.nan, M), axis=0) if M.shape[0] else np.full(ND, np.nan)
    mean = np.where(cnt >= min_members, mean, np.nan)
    idx = np.full(ND, np.nan); v = 100.0; started = False
    for i in range(ND):
        if np.isnan(mean[i]):
            if started: v = idx[i - 1] if not np.isnan(idx[i - 1]) else v
            continue
        if not started: started = True
        v = v * (1 + mean[i]); idx[i] = v
    return idx
import warnings; warnings.filterwarnings('ignore', category=RuntimeWarning)
board_codes = [c['code'] for c in board['companies']]
def ncode_of(code):
    try: return json.loads(B['stocks'][code]['integration']['text']).get('industryCode')
    except Exception: return None
NCODE = {code: ncode_of(code) for code in series}
NG = {}
for code, ic in NCODE.items():
    if ic: NG.setdefault(ic, []).append(code)
NG = {ic: cs for ic, cs in NG.items() if len(cs) >= 5}  # 다섯 곳 넘는 네이버 업종만
NIDX = {ic: index_from(ret_matrix(cs), 3) for ic, cs in NG.items()}
MKT = index_from(ret_matrix(board_codes), 200)
GIDX = {g['id']: index_from(ret_matrix(g['codes']), 3) for g in board['groups']}
def roll_max_back(x, w):  # x[t-w+1..t] 의 최대(앞이 모자라면 nan)
    out = np.full(len(x), np.nan)
    if len(x) >= w: out[w - 1:] = np.nanmax(swv(x, w), axis=1)
    return out
def roll_min_back(x, w):
    out = np.full(len(x), np.nan)
    if len(x) >= w: out[w - 1:] = np.nanmin(swv(x, w), axis=1)
    return out
def shift(x, k):
    out = np.full(len(x), np.nan); out[k:] = x[:-k]; return out
m_hi120 = roll_max_back(MKT, 120); m_dd = MKT / m_hi120
m_r20 = MKT / shift(MKT, 20) - 1
m_dd20 = shift(m_dd, 20)
F19_day = m_dd <= 0.85
F21_day = (m_r20 >= 0.08) & (m_dd20 <= 0.88)
g_r120 = {g: GIDX[g] / shift(GIDX[g], 120) - 1 for g in GIDX}
g_r20 = {g: GIDX[g] / shift(GIDX[g], 20) - 1 for g in GIDX}
G = list(GIDX)
R120 = np.vstack([g_r120[g] for g in G]); R20 = np.vstack([g_r20[g] for g in G])
def pct_rank_cols(A):  # 열(날)마다 순위 비율(0~1), nan 은 nan
    out = np.full(A.shape, np.nan)
    for j in range(A.shape[1]):
        col = A[:, j]; ok = ~np.isnan(col)
        if ok.sum() >= 10:
            rk = pd.Series(col[ok]).rank(pct=True).values; out[ok, j] = rk
    return out
G_RK120 = pct_rank_cols(R120); G_RK20 = pct_rank_cols(R20)
gpos = {g: i for i, g in enumerate(G)}
NGL = list(NIDX); npos = {ic: i for i, ic in enumerate(NGL)}
N_RK120 = pct_rank_cols(np.vstack([NIDX[ic] / shift(NIDX[ic], 120) - 1 for ic in NGL]))

# 회사마다 날짜별 표시
per_code = {}
for code, (d, c, v) in series.items():
    n = len(c)
    ret = np.r_[np.nan, c[1:] / c[:-1] - 1]
    jump = np.r_[0, (np.abs(c[1:] / c[:-1] - 1) > JUMP).astype(int)]
    cum = np.cumsum(jump)
    hi120 = roll_max_back(c, 120); lo120 = roll_min_back(c, 120); lo60 = roll_min_back(c, 60); hi250 = roll_max_back(c, 250)
    ma20 = pd.Series(c).rolling(20).mean().values; ma60 = pd.Series(c).rolling(60).mean().values; ma120 = pd.Series(c).rolling(120).mean().values
    sd20 = pd.Series(ret).rolling(20).std().values; sd120 = pd.Series(ret).rolling(120).std().values
    v20 = pd.Series(v).rolling(20).mean().values; v120 = pd.Series(v).rolling(120).mean().values; v5 = pd.Series(v).rolling(5).mean().values
    v115 = shift(pd.Series(v).rolling(115).mean().values, 5)
    below = (c < ma120).astype(float); below[np.isnan(ma120)] = np.nan
    below20 = shift(pd.Series(below).rolling(20).sum().values, 1)
    r20 = c / shift(c, 20) - 1; r120 = c / shift(c, 120) - 1
    fut = swv(c[1:], AHEAD) if n - 1 >= AHEAD else None
    fut3 = swv(c[1:], AH3)
    ops = op_income(B['stocks'][code])
    gid = grp_of.get(code)
    per_code[code] = dict(d=d, c=c, ma60=ma60)
    for t in range(L, n - AHEAD):
        if cum[t + AHEAD] - cum[t - L] > 0:
            continue
        f120 = fut[t].max() / c[t]; g120 = fut[t].min() / c[t]
        f60 = fut3[t].max() / c[t]; g60 = fut3[t].min() / c[t]
        date = d[t]; j = di[date]
        # 1년 신고가는 앞 250일이 있고 그 안에 끊김이 없을 때만
        f02 = np.nan
        if t >= 250 and cum[t] - cum[t - 250] == 0:
            f02 = float(c[t] >= 0.98 * hi250[t])
        # 실적: 2025-04-01 ~ 2026-03-31 은 2024년 대 2023년 · 2026-04-01 부터는 2025년 대 2024년
        f22 = f23 = np.nan
        if date >= '20250401':
            cur, prev = ('2024', '2023') if date < '20260401' else ('2025', '2024')
            a, b_ = ops.get(cur, np.nan), ops.get(prev, np.nan)
            if not (np.isnan(a) or np.isnan(b_)):
                f22 = float(b_ > 0 and a / b_ >= 1.3)
                f23 = float(b_ <= 0 < a)
        row = dict(code=code, date=date, t=t, board=code in inb, group=gid, m_dd=m_dd[j], m_r20=m_r20[j],
                   sd20=sd20[t], r20=r20[t], r120=r120[t], near_hi=float(c[t] >= 0.98 * hi120[t]),
                   F01=float(c[t] >= 0.98 * hi120[t]), F02=f02, F03=float(c[t] <= 1.05 * lo120[t]), F04=float(c[t] / hi120[t] <= 0.65),
                   F07=float(c[t] / lo60[t] >= 1.2 and c[t] / hi120[t] <= 0.85),
                   F08=float(c[t] > ma20[t] > ma60[t] > ma120[t]), F09=float(c[t] > ma120[t] and below20[t] >= 15),
                   F10=float(sd20[t] <= 0.6 * sd120[t]),
                   F11=float(v115[t] > 0 and v5[t] >= 3 * v115[t]), F12=float(v120[t] > 0 and v20[t] >= 1.5 * v120[t] and r20[t] >= 0.10),
                   F13=float(v120[t] > 0 and v20[t] <= 0.5 * v120[t]), F14=float(c[t] >= 0.98 * hi120[t] and v120[t] > 0 and v20[t] >= 1.5 * v120[t]),
                   F19=float(F19_day[j]) if not np.isnan(m_dd[j]) else np.nan, F21=float(F21_day[j]) if not (np.isnan(m_r20[j]) or np.isnan(m_dd20[j])) else np.nan,
                   F22=f22, F23=f23,
                   g_rk120=G_RK120[gpos[gid], j] if gid else np.nan, g_rk20=G_RK20[gpos[gid], j] if gid else np.nan,
                   ncode=NCODE.get(code) if NCODE.get(code) in npos else None, n_rk120=N_RK120[npos[NCODE[code]], j] if NCODE.get(code) in npos else np.nan,
                   f120=f120, g120=g120, f60=f60, g60=g60)
        rows.append(row)

df = pd.DataFrame(rows)
# 시장 넓이: 그 날 365곳 가운데 60일선 아래 비율(80% 넘으면 바닥)
below60 = {}
for code in board_codes:
    if code not in per_code: continue
    x = per_code[code]
    for dd_, cc, mm in zip(x['d'], x['c'], x['ma60']):
        if np.isnan(mm): continue
        a = below60.setdefault(dd_, [0, 0]); a[0] += cc < mm; a[1] += 1
br = {k: v_[0] / v_[1] for k, v_ in below60.items() if v_[1] >= 200}
df['breadth_below60'] = df['date'].map(br)
df['F20'] = np.where(df['breadth_below60'].isna(), np.nan, (df['breadth_below60'] >= 0.8).astype(float))
# 업종 표시(365곳만)
df['F15'] = np.where(df['g_rk120'].isna(), np.nan, (df['g_rk120'] >= 0.8).astype(float))
df['F16'] = np.where(df['g_rk20'].isna(), np.nan, (df['g_rk20'] >= 0.8).astype(float))
med = df[df['board']].groupby(['group', 'date'])['r120'].transform('median')
df.loc[df['board'], 'g_med_r120'] = med
df['F17'] = np.where(df['F15'].isna(), np.nan, ((df['F15'] == 1) & (df['r120'] < df['g_med_r120'])).astype(float))
hi_cnt = df[df['board']].groupby(['group', 'date'])['near_hi'].transform('sum')
df.loc[df['board'], 'g_hi_cnt'] = hi_cnt
df['F18'] = np.where(df['board'], (df['g_hi_cnt'] >= 3).astype(float), np.nan)
# 네이버 업종(1,270곳 모두): N15 = 업종 6달 추세 위 20% · N17 = 그 업종 안 가운데 아래(1,270곳 안에서 센 가운데값)
df['N15'] = np.where(df['n_rk120'].isna(), np.nan, (df['n_rk120'] >= 0.8).astype(float))
nmed = df.groupby(['ncode', 'date'])['r120'].transform('median')
df['N17'] = np.where(df['N15'].isna(), np.nan, ((df['N15'] == 1) & (df['r120'] < nmed)).astype(float))
df['up50'] = (df['f120'] >= 1.5).astype(np.int8); df['dn33'] = (df['g120'] <= 1 / 1.5).astype(np.int8)
df['up30_3m'] = (df['f60'] >= 1.3).astype(np.int8); df['dn23_3m'] = (df['g60'] <= 1 / 1.3).astype(np.int8)
df.to_pickle(OUT)
print(json.dumps({'stocks': int(df['code'].nunique()), 'rows': int(len(df)), 'board_rows': int(df['board'].sum()), 'dates': [df['date'].min(), df['date'].max()],
                  'base_up_365': float(df.loc[df['board'], 'up50'].mean()), 'base_up_all': float(df['up50'].mean())}, ensure_ascii=False))
