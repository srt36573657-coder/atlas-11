#!/usr/bin/env python3
"""ATLAS 11 · 몬테카를로 엔진 「fhs-crn-2」 — 회차마다 두 판(한국 · 미국) 합계 2,000만 경로 · 회사마다 60거래일 뒤 범위와 위험
  사장님 2026-10-10 05:14(마카오 · 06:14 KST) 승인 「1예측한다 2a안 3 너가 알아서 해 4번은 지켜 …」
  계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 1 — 작업 방 실측 원본 bench2.py 의 MODEL=bounded 갈래 그대로 옮김
  모형:
    한 경로 = 한 회사가 기준일 실제 마감 가격에서 H(60)거래일 끝까지 가는 완전한 시나리오 하나 · 하루 로그수익 r = √s2 × z · 기울기 0
    z = 그 회사 지난 500거래일 표준화 잔차(거르기 EWMA λ=0.94 · 바닥 0.000025 · 빈 날은 같은 회사 잔차로 채움 · 평균 뺌 · ±8 자름)
        같은 경로 번호 = 판 안 모든 회사가 같은 지난 날짜(시장 · 업종이 함께 움직이는 것을 지킴)
    s2 ← w + 0.06 r² + 0.93 s2 · w = 0.01 × 그 회사 500거래일 분산 · 위 끝 = 4² × max(평소, 지금) — 닿은 경로는 셈(지우지 않음)
    한국만 하루 가격 제한 ±30%(로그 log 0.7 ~ log 1.3) · 미국은 제한 없음
  배분(두 걸음):
    ① 모든 회사 기본 base 개
    ② 추가 합계 = total − base × (한국 + 미국 회사 수) → 판마다 회사 수 비례(정수 · 합 정확히)
       → 판 안에서 ①의 결과로 b = se.cvar5 ÷ (|cvar5 + 0.5| + se.cvar5) 비례 · 한 곳 추가 min(20만, 10 × base) 개까지
       · 넘친 몫은 못 채운 곳에 고르게(정수 · 합 정확히)
       · 추가 경로 = 같은 날짜 줄의 다음 번호(D[:, base: base + 추가]) · 회사 통계는 기본 + 추가를 함께 셈
  난수: PCG64DXSM · SeedSequence(int(sha256(회차 ID)[:16], 16)).spawn(2) = [한국, 미국](--places 와 상관없이 늘 둘)
        → 판 안 spawn(2) = [채움(빈 날 잔차), 날짜]
  쓰는 법(저장소 맨 위에서):
    python3 scripts/atlas11/mc/fhs_crn.py --slot hand [--run-id ID] [--total 20000000] [--base 20000] [--h 60] [--places kr,us] [--out-root .]
    python3 scripts/atlas11/mc/fhs_crn.py --codes kr:181710,us:BWLP --alloc-from <판 결과>[,<판 결과>] [--run-id ID]
      ↑ 재현 — 그 회사만 같은 셈(배분은 판 결과의 nBase · nExtra) · 파일 안 씀 · stdout {"repro": rows, …}
  쓰는 곳(<out-root> 아래 · 입력은 늘 저장소에서 읽음):
    public/data/atlas11/mc/<판>/<회차 ID>.json(새 파일만 · 있으면 멈춤 · 규칙 8) · public/data/atlas11/mc/<판>/latest.json(바꿔 씀)
    reports/atlas11/rounds/<회차 ID>.json(새 파일만)
  stdout 마지막 줄 = 회차 기록 JSON · 진행 글은 stderr
"""
import argparse, hashlib, json, math, os, re, resource, sys, time, warnings
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]  # 저장소 맨 위 — 입력은 늘 여기서 읽음
INPUTS = {'kr': 'public/data/input.json', 'us': 'public/data/atlas11/us/input.json'}
PLACES = ('kr', 'us')  # 차례 고정 = 난수 spawn 차례
SLOTS = ('08', '12', '16', '21', 'hand')
KST = timezone(timedelta(hours=9))  # 서울 시각(일광 절약 없음)
# 모형 fhs-crn-2(계획 Global Constraints)
MODEL_ID, L, LAM, FLOOR, ALPHA, BETA, ZCLIP, VCAP = 'fhs-crn-2', 500, 0.94, 0.000025, 0.06, 0.93, 8, 4
LIMIT = {'kr': 0.3, 'us': None}  # 하루 가격 제한(단순 수익 ±30%) — 미국은 없음
NB = 10  # 묶음 수(q05 · cvar5 표준오차 — 묶음 평균법)
THRESH = -0.5  # 위험 기준(cvar5) — 추가 배분의 기준점
SE_TARGET = 0.0045  # 수렴 바닥 — 소거 1판 수렴 기준 0.005(0.5%p)보다 10% 안쪽까지 추가 경로를 먼저 줌
CAP_MAX, CAP_X = 200_000, 10  # 한 곳 추가 위 끝 = min(20만, 10 × base)
MIN_CLOSES = 60  # 종가가 60개 넘는 회사만
EXT_RET, EXT_LOG = 10.0, 1.0  # 아주 큰 움직임(지우지 않고 셈) — 60일 뒤 +1000% 넘음 · 하루 로그 움직임 1 넘음
RUN_ID_RE = re.compile(r'^[0-9A-Za-z][0-9A-Za-z._-]{0,79}$')  # 파일 이름이 되므로 / 같은 글자 없음


def die(msg):
    sys.exit(f'fhs_crn: {msg}')


def say(msg):
    print(f'fhs_crn: {msg}', file=sys.stderr, flush=True)


def now_kst():
    return datetime.now(KST).isoformat(timespec='seconds')


def r6(x):
    """비율 · 소수 여섯째 자리(-0 은 0) · 유한하지 않으면 null"""
    return None if x is None or not math.isfinite(x) else round(float(x), 6) + 0.0


def run_id_of(date, slot, kr_sha, us_sha):
    """회차 ID — 계획 「공통 자료 모양」 runIdOf 그대로"""
    h = hashlib.sha256((kr_sha + us_sha + slot + date).encode('utf-8')).hexdigest()[:8]
    return f"{date.replace('-', '')}-{slot}-{h}"


def seed_hex_of(run_id):
    return hashlib.sha256(run_id.encode('utf-8')).hexdigest()[:16]


def board_kids(run_id):
    """판마다 난수 흐름 — 늘 [한국, 미국] 둘을 나눔(한 판만 돌려도 흐름이 같게)"""
    return dict(zip(PLACES, np.random.SeedSequence(int(seed_hex_of(run_id), 16)).spawn(len(PLACES))))


def is_close(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x) and x > 0


def load_board(place):
    """입력 → 회사(코드 차례) · 날짜(모든 회사 종가 날짜 합) · 종가 행렬(없는 날 NaN) · 입력 지문(파일 바이트 sha256)"""
    rel = INPUTS[place]
    raw = (ROOT / rel).read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    text = raw.decode('utf-8-sig')
    del raw  # 바이트를 먼저 놓아 읽는 동안 메모리 꼭대기를 낮춤
    inp = json.loads(text)
    del text
    px = {}
    for a in inp.get('assets', []):
        s = {q['date']: q['close'] for q in a.get('prices', []) if isinstance(q.get('date'), str) and is_close(q.get('close'))}
        if len(s) > MIN_CLOSES:
            px[str(a['code'])] = s
    del inp
    dates = sorted({d for v in px.values() for d in v})
    codes = sorted(px)
    di = {d: k for k, d in enumerate(dates)}
    C = np.full((len(codes), len(dates)), np.nan, np.float64)
    for i, c in enumerate(codes):
        for d, v in px[c].items():
            C[i, di[d]] = v
    return {'place': place, 'file': rel, 'sha': sha, 'codes': codes, 'dates': dates, 'C': C}


def prep_board(bd, ss_fill):
    """종가 → 로그수익(마지막 L 일) → 거르기 → 표준화 잔차 Z(float32) · 지금 흔들림 cur · 평소 분산 v2y · 자료 사실"""
    C = bd['C']
    with np.errstate(invalid='ignore', divide='ignore'):
        R = np.log(C[:, 1:] / C[:, :-1])
    R = R[:, -L:] if R.shape[1] > L else R
    n, T = R.shape
    with warnings.catch_warnings():  # 값이 다 빈 줄의 nanvar 경고는 아래에서 바닥값으로 바꿈
        warnings.simplefilter('ignore', RuntimeWarning)
        s2 = np.nanvar(R[:, :20], axis=1)
        v2y = np.nanvar(R, axis=1)
    s2[~np.isfinite(s2) | (s2 <= 0)] = 1e-4
    S2 = np.empty_like(R)
    for t in range(T):  # 그날 앞까지의 흔들림으로 그날을 나눔
        S2[:, t] = np.maximum(s2, FLOOR)
        r = R[:, t]
        ok = np.isfinite(r)
        s2 = np.where(ok, LAM * s2 + (1 - LAM) * np.where(ok, r, 0) ** 2, s2)
    with np.errstate(invalid='ignore'):
        Z = R / np.sqrt(S2)
    cur = np.sqrt(np.maximum(s2, FLOOR))
    v2y = np.maximum(np.where(np.isfinite(v2y), v2y, FLOOR), FLOOR)
    fill = np.random.Generator(np.random.PCG64DXSM(ss_fill))
    filled = 0
    for i in range(n):  # 빈 날 = 같은 회사의 다른 날 잔차(회사 차례대로 같은 흐름)
        bad = ~np.isfinite(Z[i])
        if bad.any():
            good = np.flatnonzero(~bad)
            k = int(bad.sum())
            filled += k
            Z[i, bad] = Z[i, fill.choice(good, k)] if len(good) else 0.0
    zbig = int((np.abs(Z) > ZCLIP).sum())
    Z = Z - Z.mean(axis=1, keepdims=True)  # 기울기 0(지난 평균을 뺌)
    Z = np.clip(Z, -ZCLIP, ZCLIP).astype(np.float32)
    with np.errstate(invalid='ignore'):
        big = np.isfinite(R) & (np.abs(np.expm1(R)) > 0.30)  # 사실: 하루 ±30% 넘는 날(상장 첫날 · 분할 · 병합 · 거래 재개 같은 일)
    data = {'filledDays': filled, 'zOverClip': zbig, 'daysOver30pct': int(big.sum()), 'stocksWithSuchDay': int(big.any(axis=1).sum())}
    return Z, cur, v2y, T, data


def dates_matrix(ss_dates, T, H, P):
    """같은 날짜 줄 H × P — 경로 j 의 H 날 = 같은 흐름의 j×H … j×H+H−1 번째 뽑기 → 앞 번호는 P 와 상관없이 같음(기본 · 추가 · 재현이 같은 줄)"""
    g = np.random.Generator(np.random.PCG64DXSM(ss_dates))
    return np.ascontiguousarray(g.integers(0, T, size=(P, H), dtype=np.int32).T)


def params_of(cur_i, v2y_i):
    """한 회사 셈 값(float32) — 처음 s2 = 지금 흔들림² · w = 0.01 × 평소 분산 · 위 끝 = 4² × max(평소, 지금)"""
    return np.float32(cur_i ** 2), np.float32((1 - ALPHA - BETA) * v2y_i), np.float32(VCAP * VCAP * max(v2y_i, cur_i ** 2))


def simulate(zi, cols, s2_0, w, cap, lim):
    """한 회사 · 경로 m 개(cols = H × m 날짜 번호) → tot(H일 로그 합 · float32) · flag(1 가격 제한 · 2 흔들림 위 끝 · 4 하루 로그 움직임 1 넘음)
       경로끼리 섞는 셈이 없어 경로를 나눠 돌려도 값이 같음"""
    H, m = cols.shape
    s2 = np.full(m, s2_0, np.float32)
    tot = np.zeros(m, np.float32)
    hitr = np.zeros(m, bool); hitv = np.zeros(m, bool); big = np.zeros(m, bool)
    r = np.empty(m, np.float32); u = np.empty(m, np.float32); b = np.empty(m, bool)
    lo, hi = (math.log(1 - lim), math.log(1 + lim)) if lim else (None, None)
    track_big = lo is None or lo < -EXT_LOG or hi > EXT_LOG  # 한국은 제한 때문에 하루 로그 움직임이 1 을 못 넘음
    for t in range(H):
        np.take(zi, cols[t], out=r, mode='clip')  # z(날짜 번호는 늘 0 … T−1)
        np.sqrt(s2, out=u)
        r *= u  # r = √s2 × z
        if lo is not None:
            np.clip(r, lo, hi, out=u)
            np.not_equal(u, r, out=b)
            hitr |= b
            r, u = u, r
        np.multiply(r, ALPHA, out=u)
        u *= r
        u += w  # w + α r²
        s2 *= BETA
        u += s2  # + β s2
        np.greater(u, cap, out=b)
        hitv |= b
        np.minimum(u, cap, out=s2)
        if track_big:
            np.abs(r, out=u)
            np.greater(u, EXT_LOG, out=b)
            big |= b
        tot += r
    flag = hitr.view(np.uint8) | (hitv.view(np.uint8) << 1) | (big.view(np.uint8) << 2)
    return tot, flag


def stats_of(tot, flag):
    """경로 결과 → 통계(단순 수익 비율) · 표준오차(평균 sd/√n · 손실 비율 √(p(1−p)/n) · q05 · cvar5 = 경로 번호 차례 10묶음 평균법)"""
    with np.errstate(over='ignore', invalid='ignore'):
        ret = np.expm1(tot.astype(np.float64))
    fin = np.isfinite(ret)
    rk = ret[fin]
    n = int(rk.size)
    st = {'n': n, 'nonfinite': int(ret.size - n), 'extreme': int(((rk > EXT_RET) | ((flag[fin] & 4) != 0)).sum()),
          'clamped': int(((flag & 3) != 0).sum()), 'hitLimit': int(((flag & 1) != 0).sum()), 'hitVol': int(((flag & 2) != 0).sum())}
    if n == 0:
        st.update(dict.fromkeys(('mean', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5', 'seMean', 'sePloss', 'seQ05', 'seCvar5')))
        return st
    q05, q10, q50, q90 = (float(x) for x in np.quantile(rk, [0.05, 0.10, 0.50, 0.90]))
    pl = float((rk < 0).mean())
    st.update(mean=float(rk.mean()), median=q50, ploss=pl, q05=q05, q10=q10, q90=q90, cvar5=float(rk[rk <= q05].mean()),
              seMean=float(rk.std(ddof=1) / math.sqrt(n)) if n > 1 else None, sePloss=math.sqrt(pl * (1 - pl) / n), seQ05=None, seCvar5=None)
    if n >= NB:
        bq, bc = [], []
        for bb in np.array_split(rk, NB):
            q = np.quantile(bb, 0.05)
            bq.append(q)
            bc.append(bb[bb <= q].mean())
        st.update(seQ05=float(np.std(bq, ddof=1) / math.sqrt(NB)), seCvar5=float(np.std(bc, ddof=1) / math.sqrt(NB)))
    return st


def weight_of(st):
    """추가 몫 무게 b = se.cvar5 ÷ (|cvar5 − (−0.5)| + se.cvar5) — 기준 가까이 · 아직 흔들리는 곳에 더"""
    cv, se = st['cvar5'], st['seCvar5']
    if cv is None or se is None or not se > 0:
        return 0.0
    return se / (abs(cv - THRESH) + se)


def split_int(total, weights):
    """정수 몫 나누기(무게 정수 비례 · 합 = total · 나머지는 큰 나머지 차례 · 같으면 앞 차례)"""
    W = sum(weights)
    if total <= 0 or W <= 0:
        return [0] * len(weights)
    q = [total * w // W for w in weights]
    rem = [total * w % W for w in weights]
    for k in sorted(range(len(weights)), key=lambda k: (-rem[k], k))[:total - sum(q)]:
        q[k] += 1
    return q


def alloc_extra(wts, E, cap):
    """판 안 추가 몫 — 무게 비례 · 한 곳 cap 까지(cap = 수 하나 또는 회사마다) · 넘친 몫은 못 채운 곳에 고르게 · 정수(내림 뒤 남는 몫은 소수점 큰 곳부터 · 같으면 앞 차례) · 합 = E"""
    n = len(wts)
    out = np.zeros(n, np.int64)
    if E <= 0 or n == 0:
        return out
    capv = np.broadcast_to(np.asarray(cap, np.float64), (n,)).copy()
    capv = np.where(capv > 0, capv, 0.0)
    if E > capv.sum():
        raise ValueError(f'추가 {E} 개가 한 곳 위 끝 합 {int(capv.sum())} 을 넘음')
    w = np.asarray(wts, np.float64)
    w = np.where(np.isfinite(w) & (w > 0) & (capv > 0), w, 0.0)
    room = capv > 0
    a = E * w / w.sum() if w.sum() > 0 else np.where(room, E / int(room.sum()), 0.0)
    full = ~room
    while True:
        over = ~full & (a > capv)
        if not over.any():
            break
        spill = float((a[over] - capv[over]).sum())
        a[over] = capv[over]
        full |= over
        if full.all():
            break
        a[~full] += spill / int((~full).sum())
    out[:] = np.minimum(np.floor(a), capv).astype(np.int64)
    left = E - int(out.sum())
    order = sorted(range(n), key=lambda k: (-(a[k] - math.floor(a[k])), k))
    while left > 0:
        moved = False
        for k in order:
            if left == 0:
                break
            if out[k] < capv[k]:
                out[k] += 1
                left -= 1
                moved = True
        if not moved:
            raise ValueError('추가 몫을 다 나누지 못함')
    return out


def git_head():
    """지금 저장소 커밋(없으면 None) — 실행 버전 기록용"""
    try:
        root = Path(__file__).resolve().parents[3]
        head = (root / '.git/HEAD').read_text().strip()
        if head.startswith('ref: '):
            ref = root / '.git' / head[5:]
            if ref.exists():
                return ref.read_text().strip()
            packed = root / '.git/packed-refs'
            for line in packed.read_text().splitlines() if packed.exists() else []:
                if line.endswith(' ' + head[5:]):
                    return line.split()[0]
            return None
        return head
    except OSError:
        return None


def need_of(st, base, cap):
    """수렴 바닥(2026-10-10 계획 검토 뒤 첫 실제 회차 전에 정함) — 손실 비율 · 나쁜 5% 평균 오차가 SE_TARGET 넘으면
    오차가 1/√n 로 준다고 보고 SE_TARGET 까지 필요한 추가 경로 수(한 곳 cap 까지)"""
    s = max(v for v in (st.get('sePloss'), st.get('seCvar5'), 0.0) if v is not None and math.isfinite(v))
    if s <= SE_TARGET:
        return 0
    return int(min(cap, math.ceil(base * ((s / SE_TARGET) ** 2 - 1))))


def row_of(code, nbase, nextra, st, cur_i, v2y_i):
    return {'code': code, 'n': st['n'], 'nBase': nbase, 'nExtra': nextra, 'nonfinite': st['nonfinite'], 'extreme': st['extreme'], 'clamped': st['clamped'],
            'mean': r6(st['mean']), 'median': r6(st['median']), 'ploss': r6(st['ploss']), 'q05': r6(st['q05']), 'q10': r6(st['q10']), 'q90': r6(st['q90']),
            'cvar5': r6(st['cvar5']), 'se': {'mean': r6(st['seMean']), 'ploss': r6(st['sePloss']), 'q05': r6(st['seQ05']), 'cvar5': r6(st['seCvar5'])},
            'volNow': r6(cur_i * math.sqrt(252)), 'vol2y': r6(math.sqrt(v2y_i * 252))}


def run_board(place, bd, kid, H, base, extra_b, cap):
    """한 판 — 기본 base 개(모든 회사) → 추가 몫 배분 → 추가 경로 → 회사마다 기본 + 추가 통계 · 회사 하나씩(모든 경로를 한꺼번에 들지 않음)"""
    t0 = time.time()
    ss_fill, ss_dates = kid.spawn(2)
    Z, cur, v2y, T, data = prep_board(bd, ss_fill)
    codes = bd['codes']
    n, lim = len(codes), LIMIT[place]
    par = [params_of(cur[i], v2y[i]) for i in range(n)]
    D = dates_matrix(ss_dates, T, H, base)
    tot_b = np.empty((n, base), np.float32)
    fl_b = np.empty((n, base), np.uint8)
    wts = np.zeros(n)
    need = np.zeros(n, np.int64)
    for i in range(n):  # ① 기본 — 결과(로그 합 · 표시)만 남겨 둠(회사마다 base 개)
        tot_b[i], fl_b[i] = simulate(Z[i], D, *par[i], lim)
        st0 = stats_of(tot_b[i], fl_b[i])
        wts[i] = weight_of(st0)
        need[i] = need_of(st0, base, cap)
    t1 = time.time()
    # 추가 몫 두 걸음 — ㉮ 수렴 바닥(오차가 큰 곳부터 필요한 만큼 · 모자라면 필요한 수 비례) → ㉯ 나머지는 위험 기준선 가까운 곳(무게 b)
    floor_ = alloc_extra(need.astype(np.float64), min(extra_b, int(need.sum())), need) if need.sum() > 0 and extra_b > 0 else np.zeros(n, np.int64)
    rest = extra_b - int(floor_.sum())
    ext = floor_ + (alloc_extra(wts, rest, cap - floor_) if rest > 0 else np.zeros(n, np.int64))
    assert int(ext.sum()) == extra_b and int(ext.max(initial=0)) <= cap
    top = int(ext.max()) if n else 0
    if top > 0:  # 같은 흐름에서 base + 가장 큰 추가 만큼 다시 뽑음 — 앞 base 번호는 ①과 같아야 함
        D2 = dates_matrix(ss_dates, T, H, base + top)
        if not np.array_equal(D2[:, :base], D):
            raise RuntimeError('날짜 줄 앞 번호가 ①과 다름')
        D = D2
    rows = []
    tally = {'done': 0, 'nonfinite': 0, 'extreme': 0, 'clampedLimit': 0, 'clampedVol': 0}
    for i in range(n):  # ② 추가 — 같은 날짜 줄의 다음 번호 · 기본과 이어 붙여 통계
        e = int(ext[i])
        if e:
            te, fe = simulate(Z[i], D[:, base:base + e], *par[i], lim)
            tt, ff = np.concatenate([tot_b[i], te]), np.concatenate([fl_b[i], fe])
        else:
            tt, ff = tot_b[i], fl_b[i]
        st = stats_of(tt, ff)
        rows.append(row_of(codes[i], base, e, st, float(cur[i]), float(v2y[i])))
        tally['done'] += st['n']; tally['nonfinite'] += st['nonfinite']; tally['extreme'] += st['extreme']
        tally['clampedLimit'] += st['hitLimit']; tally['clampedVol'] += st['hitVol']
    del tot_b, fl_b, D
    say(f'{place} · 회사 {n} · 날 {T} · 기본 {n * base:,}({t1 - t0:.1f}초) · 추가 {int(ext.sum()):,}({time.time() - t1:.1f}초) · 추가 위 끝 닿은 곳 {int((ext >= cap).sum()) if extra_b else 0}')
    return {'rows': rows, 'tally': tally, 'T': T, 'data': data, 'extra': int(ext.sum()),
            'floor': {'stocks': int((need > 0).sum()), 'paths': int(floor_.sum()), 'target': SE_TARGET}}


def write_new(path, text):
    """새 파일만 — 이미 있으면 FileExistsError(덮어쓰지 않음 · 규칙 8) · 다 쓴 뒤 한 번에 나타남"""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f'.{path.name}.{os.getpid()}.tmp')
    with open(tmp, 'x', encoding='utf-8') as f:
        f.write(text)
    try:
        try:
            os.link(tmp, path)  # 있으면 FileExistsError
        except FileExistsError:
            raise
        except OSError:  # 하드 링크가 안 되는 곳 — 새로 만들기(x)로
            with open(path, 'x', encoding='utf-8') as f:
                f.write(text)
    finally:
        tmp.unlink()


def write_replace(path, text):
    """가리키는 파일 — 바꿔 씀(다른 이름에 쓴 뒤 바꿔치기)"""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f'.{path.name}.{os.getpid()}.tmp')
    tmp.write_text(text, encoding='utf-8')
    os.replace(tmp, path)


def board_text(res):
    """판 결과 글 — 머리는 한 칸 들여쓰기 · rows 는 한 회사 한 줄"""
    head = json.dumps({k: v for k, v in res.items() if k != 'rows'}, ensure_ascii=False, indent=1)
    rows = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in res['rows'])
    return head[:-2] + ',\n "rows": [\n' + rows + '\n ]\n}\n'


def board_rel(place, run_id):
    return f'public/data/atlas11/mc/{place}/{run_id}.json'


def round_rel(run_id):
    return f'reports/atlas11/rounds/{run_id}.json'


def check_free(out, run_id, places):
    if not RUN_ID_RE.match(run_id):
        die(f'회차 ID 모양이 아님: {run_id!r}')
    for rel in [board_rel(p, run_id) for p in places] + [round_rel(run_id)]:
        if (out / rel).exists():
            die(f'이미 있음 — 덮어쓰지 않음(규칙 8): {out / rel}')


def parse_places(text):
    got = [p.strip() for p in str(text).split(',') if p.strip()]
    if not got or any(p not in PLACES for p in got):
        die(f'--places 는 kr · us 가운데: {text!r}')
    return [p for p in PLACES if p in got]


def run(a):
    started, t0 = now_kst(), time.time()
    today = datetime.now(KST).strftime('%Y-%m-%d')
    if a.slot is None:
        die('--slot 이 필요함(08 · 12 · 16 · 21 · hand)')
    if a.base < 1 or a.h < 1 or a.total < 1:
        die('--total · --base · --h 는 1 이상')
    places, out = parse_places(a.places), Path(a.out_root)
    if a.run_id:
        check_free(out, a.run_id, places)  # 무거운 셈 전에 먼저 멈춤
    boards = {p: load_board(p) for p in PLACES}  # 회사 수 · 입력 지문은 늘 두 판(배분 · 회차 ID 가 --places 와 상관없게)
    t_load = time.time() - t0
    run_id = a.run_id or run_id_of(today, a.slot, boards['kr']['sha'], boards['us']['sha'])
    if not a.run_id:
        check_free(out, run_id, places)
    m = re.match(r'^(\d{4})(\d{2})(\d{2})-', run_id)
    date = today
    if m:
        try:
            date = datetime(int(m[1]), int(m[2]), int(m[3])).strftime('%Y-%m-%d')
        except ValueError:
            pass
    count = {p: len(boards[p]['codes']) for p in PLACES}
    N = sum(count.values())
    extra_all = a.total - a.base * N
    if extra_all < 0:
        die(f'--total {a.total:,} 이 기본 {a.base:,} × 회사 {N} 보다 작음')
    cap = min(CAP_MAX, CAP_X * a.base)
    share = dict(zip(PLACES, split_int(extra_all, [count[p] for p in PLACES])))
    for p in places:
        if share[p] > count[p] * cap:
            die(f'{p} 추가 {share[p]:,} 개가 한 곳 위 끝 {cap:,} × {count[p]} 곳을 넘음 — --base 를 키우거나 --total 을 줄이세요')
    kids, seed_hex = board_kids(run_id), seed_hex_of(run_id)
    t1 = time.time()
    done = {p: run_board(p, boards[p], kids[p], a.h, a.base, share[p], cap) for p in places}
    t_sim = time.time() - t1
    made = now_kst()
    results = {}
    for p in places:
        bd, d = boards[p], done[p]
        T = d['T']
        results[p] = {
            'schema': 'atlas11-mc-2', 'runId': run_id, 'place': p, 'asOf': bd['dates'][-1] if bd['dates'] else None, 'made': made,
            'model': {'id': MODEL_ID, 'H': a.h, 'L': L, 'lambdaFilter': LAM, 'floor': FLOOR, 'alpha': ALPHA, 'beta': BETA, 'zclip': ZCLIP, 'vcap': VCAP,
                      'limit': LIMIT[p], 'drift': 0, 'demean': True},
            'rng': {'bitGenerator': 'PCG64DXSM', 'seedHex': seed_hex, 'stream': f'board-{p}', 'spawn': f'SeedSequence(int(seedHex, 16)).spawn(2)[{PLACES.index(p)}].spawn(2) = [채움, 날짜]'},
            'input': {'file': bd['file'], 'sha256': bd['sha'], 'stocks': count[p], 'days': T,
                      'from': bd['dates'][-T] if T else None, 'to': bd['dates'][-1] if bd['dates'] else None},
            'data': d['data'],
            'alloc': {'base': a.base, 'extra': extra_all, 'extraBoard': d['extra'], 'threshold': THRESH, 'cap': cap, 'floor': d['floor'],
                      'rule': f'㉮ 수렴 바닥: 기본 몫 오차(손실 비율 · 나쁜 5% 평균)가 {SE_TARGET} 넘는 곳에 그 오차까지 필요한 수(오차 ∝ 1/√n) · '
                              f'㉯ 나머지: 추가 몫 ∝ se.cvar5 ÷ (|cvar5 − (−0.5)| + se.cvar5)(기본 몫 결과) · 한 곳 추가 {cap:,}개까지 · 남는 몫은 못 채운 곳에 고르게 · '
                              f'추가 합계 {extra_all:,} = {a.total:,} − {a.base:,} × {N}(두 판) → 판마다 회사 수 비례'},
            'paths': {'target': a.base * count[p] + share[p], **d['tally']},
            'rows': d['rows'],
        }
        assert results[p]['paths']['done'] + results[p]['paths']['nonfinite'] == results[p]['paths']['target']
    for p in places:
        write_new(out / board_rel(p, run_id), board_text(results[p]))
    rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
    tg = {p: results[p]['paths'] for p in places}
    rec = {'schema': 'atlas11-round-1', 'runId': run_id, 'slot': a.slot, 'date': date, 'startedAt': started, 'endedAt': now_kst(),
           'boards': {p: {'asOf': results[p]['asOf'], 'file': board_rel(p, run_id), 'paths': tg[p]} for p in places},
           'paths': {'target': sum(x['target'] for x in tg.values()), 'done': sum(x['done'] for x in tg.values()),
                     'nonfinite': sum(x['nonfinite'] for x in tg.values()), 'reproRuns': 0},
           'time': {'loadSec': round(t_load, 1), 'simSec': round(t_sim, 1), 'peakRssMb': round(rss), 'cpu': os.cpu_count()},
           'engine': {'file': 'scripts/atlas11/mc/fhs_crn.py', 'sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'model': MODEL_ID, 'total': a.total, 'base': a.base, 'H': a.h, 'places': places,
                      'python': sys.version.split()[0], 'numpy': np.__version__, 'commit': git_head()},  # 실행 버전(지시서 7 · 15) — 넘파이 난수 흐름은 판이 바뀌면 달라질 수 있어 함께 남김
           'verify': {'files': [f'reports/atlas11/rounds/{run_id}.verify-mc.json'] + [f'reports/atlas11/rounds/{run_id}.verify-elim-{p}.json' for p in places],
                      'note': '검사 결과는 검사마다 따로 새 파일(이 기록은 고치지 않음)'}, 'published': False}
    write_new(out / round_rel(run_id), json.dumps(rec, ensure_ascii=False, indent=1) + '\n')
    for p in places:  # 회차 기록까지 쓴 뒤에 가리키는 파일을 옮김
        ptr = {'schema': 'atlas11-mc-latest-1', 'runId': run_id, 'file': board_rel(p, run_id), 'asOf': results[p]['asOf'],
               'inputSha256': results[p]['input']['sha256'], 'made': made}
        write_replace(out / f'public/data/atlas11/mc/{p}/latest.json', json.dumps(ptr, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(rec, ensure_ascii=False), flush=True)


def repro(a):
    """재현 — 지정 회사만 같은 셈(같은 회차 ID · 같은 날짜 줄 · 판 결과의 nBase · nExtra) · 파일을 쓰지 않음"""
    if not a.alloc_from:
        die('--codes 에는 --alloc-from <판 결과 파일>[,<판 결과 파일>] 이 필요함')
    want = []
    for item in str(a.codes).split(','):
        p, _, c = item.strip().partition(':')
        if p not in PLACES or not c:
            die(f'--codes 모양은 kr:코드,us:코드 — {item!r}')
        if (p, c) not in want:
            want.append((p, c))
    allocs = {}
    for f in str(a.alloc_from).split(','):
        try:
            res = json.loads(Path(f.strip()).read_text(encoding='utf-8'))
        except (OSError, ValueError) as e:
            die(f'판 결과 파일을 못 읽음: {f} — {e}')
        p = res.get('place') if isinstance(res, dict) else None
        if res.get('schema') != 'atlas11-mc-2' or p not in PLACES or p in allocs:
            die(f'판 결과 파일이 아니거나 같은 판이 둘: {f}')
        if res['model'].get('id') != MODEL_ID or res['model'].get('limit') != LIMIT[p]:
            die(f'모형이 다름: {f}')
        allocs[p] = res
    ids = {r['runId'] for r in allocs.values()}
    if not a.run_id and len(ids) != 1:
        die('판 결과들의 회차 ID 가 서로 다름 — --run-id 를 주세요')
    run_id = a.run_id or ids.pop()
    if not RUN_ID_RE.match(run_id):
        die(f'회차 ID 모양이 아님: {run_id!r}')
    kids = board_kids(run_id)
    got, same, input_same = {}, {}, {}
    for p in PLACES:
        mine = [c for q, c in want if q == p]
        if not mine:
            continue
        res = allocs.get(p) or die(f'{p} 판 결과 파일이 --alloc-from 에 없음')
        bd = load_board(p)
        input_same[p] = bd['sha'] == res['input']['sha256']
        H, base = int(res['model']['H']), int(res['alloc']['base'])
        ss_fill, ss_dates = kids[p].spawn(2)
        Z, cur, v2y, T, _ = prep_board(bd, ss_fill)  # 채움 흐름은 회사 차례대로 쓰이므로 판 전체를 같은 차례로 다시 셈
        pub = {r['code']: r for r in res['rows']}
        need = []
        for c in mine:
            if c not in pub or c not in bd['codes']:
                die(f'{p}:{c} 가 판 결과나 입력에 없음')
            if pub[c]['nBase'] != base:
                die(f'{p}:{c} nBase 가 alloc.base 와 다름')
            need.append((c, bd['codes'].index(c), int(pub[c]['nBase']), int(pub[c]['nExtra'])))
        D = dates_matrix(ss_dates, T, H, max(nb + ne for _, _, nb, ne in need))
        for c, i, nb, ne in need:
            par = params_of(cur[i], v2y[i])
            tt, ff = simulate(Z[i], D[:, :nb], *par, LIMIT[p])
            if ne:
                te, fe = simulate(Z[i], D[:, nb:nb + ne], *par, LIMIT[p])
                tt, ff = np.concatenate([tt, te]), np.concatenate([ff, fe])
            row = row_of(c, nb, ne, stats_of(tt, ff), float(cur[i]), float(v2y[i]))
            got[(p, c)] = row
            same[f'{p}:{c}'] = json.loads(json.dumps(row)) == pub[c]
    print(json.dumps({'repro': [got[k] for k in want], 'runId': run_id, 'same': same, 'inputSame': input_same}, ensure_ascii=False), flush=True)


def main(argv=None):
    global SE_TARGET
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    ap = argparse.ArgumentParser(description='ATLAS 11 몬테카를로 엔진 fhs-crn-2(두 판 합 2,000만 경로)', allow_abbrev=False)
    ap.add_argument('--run-id', help='회차 ID(없으면 서울 날짜 · slot · 두 입력 지문으로 만듦)')
    ap.add_argument('--slot', choices=SLOTS, help='회차 때(08 · 12 · 16 · 21 · hand)')
    ap.add_argument('--total', type=int, default=20_000_000, help='두 판 합 경로 수')
    ap.add_argument('--base', type=int, default=20_000, help='회사마다 기본 경로 수')
    ap.add_argument('--h', type=int, default=60, help='앞으로 갈 거래일 수')
    ap.add_argument('--places', default='kr,us', help='돌릴 판(kr,us)')
    ap.add_argument('--out-root', default='.', help='결과를 쓰는 뿌리(입력은 늘 저장소에서 읽음)')
    ap.add_argument('--codes', help='재현: kr:코드,us:코드 — 그 회사만 다시 셈(파일 안 씀)')
    ap.add_argument('--alloc-from', help='재현: 판 결과 파일(쉼표로 여럿) — nBase · nExtra · 회차 ID')
    ap.add_argument('--se-target', type=float, default=SE_TARGET, help='수렴 바닥 오차(기본 0.0045 · 시험에서 1 이면 바닥을 끔)')
    a = ap.parse_args(argv)
    SE_TARGET = a.se_target
    if a.codes:
        repro(a)
    else:
        run(a)


if __name__ == '__main__':
    main()
