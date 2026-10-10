#!/usr/bin/env python3
"""월요일 36곳(pick36-v1 · 「가」 시장 방향 넷) — 몬테카를로 1억 번 × 4방향 → 소거법도 같은 방식(1억 번 × 4방향) → 36곳
사장님 2026-10-11 00:15 「이걸 토대로 말이야 1차 매수해서 돈 벌수 있는 가능성 36개를 찾아내 별도에 탭을 만들어서 그 방벙은 몬테카를로 방법으로해
총 1억번 돌려 그렇게 1억번씩을 4방향으로 돌려서 값을 찾아낸 이후 그다음 소거법도 같은 방식으로 대입해서 찾아내 돌아오는 월요일에 매수 할 36개에
종목을 각 한주씩만 매수 하는 조건이야」 → 「4방향」 뜻을 여쭸으나 답이 없어 계획 카드(00:30)에 적은 「가. 시장이 갈 방향 넷」으로 셈.
06:13 「이걸 … 새로운 아틀란스 … 이 토대로」 다음에 새 ATLAS 의 탭 하나로 붙임.

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름 pick36-v2) ━━
자료  reports/atlas11/universe/2026-10-10/bundle.json.gz 일봉(10월 8일 종가까지) · 회사 = t365-v1 365곳(2026-10-10-t365/by-industry.json)
하루 수익  로그(오늘 종가 ÷ 앞 거래일 종가) · 한국 하루 가격 제한(±30%) 밖이면(|단순 수익| > 30.5%) 주식 수 바뀜으로 보고 그날 그 회사 값 없음
거래일  365곳 가운데 절반 넘게 종가가 있는 날
시장  365곳 하루 단순 수익의 같은 무게 평균(그날 값 있는 회사만)
방향(날마다 · 그날로 끝나는 20거래일 시장으로 가름 · 기준일까지 자료로만)
  ① 크게 출렁이는 장  20거래일 시장 하루 수익 표준편차가 역사 창 안 모든 날 가운데 위 25%
  ② 오르는 장        ①이 아니고 20거래일 시장 누적 수익 +3% 초과
  ③ 내리는 장        ①이 아니고 −3% 미만
  ④ 옆으로 가는 장    나머지
역사 창  기준일까지 마지막 500거래일(모자라면 있는 만큼 · 250거래일 밑이면 셈 안 함)
경로  한 경로 = 그 방향 날들에서 20일을 돌려 뽑기(같은 20일을 365곳 모두에 — 함께 움직임을 지킴) · 회사 20거래일 로그 수익 = 뽑힌 20일 합
      그 방향 날 가운데 그 회사 값이 없는 날은 그 회사 값 있는 같은 방향 날 하나로 바꿔 넣음(씨앗 고정) · 값 있는 날이 20일 밑이면 「? 셈 못 함」 → 고르지 않음
1억 번  방향마다 「회사 × 경로」 1억(경로 273,973개 × 365곳 = 1억 0,000,145) · 찾기 4방향 4억 + 소거 4방향(다른 씨앗) 4억 = 8억
찾기 값  번 길 몫 = 20거래일 뒤 단순 수익 > +0.3%(사고팔 때 드는 돈 어림) 인 경로 몫 · 4방향 같은 무게 평균(어느 방향이 올지는 모른다고 봄)
소거  크게 잃는 길 몫 = 20거래일 뒤 단순 수익 < −15% 인 경로 몫(소거 씨앗으로 다시 돌린 값) · 4방향 가운데 가장 나쁜 값이 큰 순으로 3분의 1(122곳) 지움
36곳  남은 곳에서 번 길 몫 평균 큰 순 · 한 업종 5곳까지 · 같으면 시가총액 큰 순 · 한 곳에 1주씩
난수  numpy PCG64 · 씨앗 = sha256('pick36-v1|기준일|방향|찾기 또는 소거') 앞 16자리(16진)
지난 기록 시험  2024-07-01 뒤 첫 거래일부터 20거래일마다 기준일 t(t + 20거래일 ≤ 마지막 날) — t 까지 자료로만 같은 셈
      (경로만 방향마다 「회사 × 경로」 1,000만 · 기록에 적음) → t 종가에 같은 무게로 36곳 → t+20 종가(그날 값 없으면 그 전 마지막 값)
      견줌 = 같은 날 그때 값 있는 365곳 같은 무게 평균(아무거나 36곳의 기대값) · 맞음 = 36곳 > 365곳 평균
      문턱(「지난 기록에서 통함」이라고 쓸 조건) = 맞음 60% 이상 · 한쪽 이항 검정 p < 0.05 · 앞 절반 · 뒤 절반 모두 55% 이상 — 못 넘으면 「통한다고 할 수 없음」
한계  365곳은 10월 2일까지 자료로 고른 것(이미 많이 오른 회사가 많음) — 시험은 그 안에서 「아무거나 36곳」과 견줌으로만 읽음 · 앞날 값이 아님(모형 가정 아래 셈)

쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/pick36.py [--quick]   (--quick = 경로 1/100 · 시험 빼고 · 고칠 때만)
만드는 것: site/atlas/data/pick36.json(화면) · reports/atlas11/verify/pick36-<기준일>-<만든 때>.json(기록 · 새 파일만)
"""
import gzip, hashlib, json, math, os, sys, time
from datetime import datetime, timezone
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
VERSION = 'pick36-v1'
QUICK = '--quick' in sys.argv
H, LIMIT, WIN, WMIN, VOLQ, UPTH, DNTH = 20, 0.305, 500, 250, 0.75, 0.03, -0.03
PROFIT, BIGLOSS, CUT, N_PICK, PER_IND = 0.003, -0.15, 1 / 3, 36, 5
PAIRS = 100_000_000 // (100 if QUICK else 1)
PAIRS_BT = 10_000_000
DIRS = [('up', '오르는 장'), ('down', '내리는 장'), ('flat', '옆으로 가는 장'), ('wild', '크게 출렁이는 장')]
CHUNK = 6000

t0 = time.time()
def say(m):
    print(f'[{time.time() - t0:7.1f}s] {m}', file=sys.stderr, flush=True)

byi = json.load(open(os.path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365/by-industry.json'), encoding='utf-8'))
pro = json.load(open(os.path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365/proposal.json'), encoding='utf-8'))
cap_sel = {p['code']: p['capEok'] for p in pro['picked']}
companies = [(c['code'], c['name'], g['id'], i['name']) for g in byi['groups'] for i in g['industries'] for c in i['companies']]
codes = [c[0] for c in companies]
NC = len(codes)
bundle = json.load(gzip.open(os.path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'), 'rt', encoding='utf-8'))
rows = {c: {r[0]: r[4] for r in bundle['stocks'][c]['fchart']['rows'] if r[4] and r[4] > 0} for c in codes}
cnt = {}
for c in codes:
    for d in rows[c]:
        cnt[d] = cnt.get(d, 0) + 1
DATES = sorted(d for d, n in cnt.items() if n > NC / 2)
ND = len(DATES)
P = np.full((ND, NC), np.nan)
for j, c in enumerate(codes):
    for k, d in enumerate(DATES):
        v = rows[c].get(d)
        if v:
            P[k, j] = v
with np.errstate(invalid='ignore', divide='ignore'):
    simple = P[1:] / P[:-1] - 1
simple[np.abs(simple) > LIMIT] = np.nan
R = np.vstack([np.full((1, NC), np.nan), np.log1p(simple)])   # R[k] = k-1 → k 로그 수익
M = np.concatenate([[np.nan], np.nanmean(simple, axis=1)])     # 시장 하루 수익(같은 무게)
iso = lambda d: f'{d[:4]}-{d[4:6]}-{d[6:]}'
say(f'회사 {NC}곳 · 거래일 {ND}일({iso(DATES[0])} ~ {iso(DATES[-1])})')


def seed_of(asof, d, part):
    return int(hashlib.sha256(f'{VERSION}|{asof}|{d}|{part}'.encode()).hexdigest()[:16], 16)


def regimes(T):
    """기준일 T(색인)까지 자료로만 — 역사 창 날마다 방향 · 쓰는 문턱"""
    lo = max(H, T - WIN + 1)
    days = np.arange(lo, T + 1)
    if len(days) < WMIN:
        return None
    lm = np.log1p(M)
    cum = np.array([np.nansum(lm[k - H + 1:k + 1]) for k in days])
    sd = np.array([np.nanstd(M[k - H + 1:k + 1], ddof=1) for k in days])
    vth = float(np.quantile(sd, VOLQ))
    lab = np.where(sd > vth, 'wild', np.where(cum > math.log1p(UPTH), 'up', np.where(cum < math.log1p(DNTH), 'down', 'flat')))
    return {'days': days, 'lab': lab, 'volTh': vth, 'n': {d: int((lab == d).sum()) for d, _ in DIRS}}


def pool_matrix(pool, cols, rng):
    """그 방향 날들 × 회사 · 값 없는 칸은 그 회사 값 있는 같은 방향 날 하나로(씨앗 고정) · 값 있는 날 20일 밑이면 그 회사 셈 못 함"""
    X = R[np.ix_(pool, cols)].astype(np.float64)
    ok = np.ones(len(cols), bool)
    for j in range(len(cols)):
        col = X[:, j]
        bad = np.isnan(col)
        good = np.flatnonzero(~bad)
        if len(good) < H:
            ok[j] = False
            col[:] = 0.0
            continue
        if bad.any():
            col[bad] = col[rng.choice(good, size=int(bad.sum()))]
    return X.astype(np.float32), ok


def mc(T, asof, cols, pairs, part):
    """방향마다 경로 = pairs ÷ 회사 수(올림) · 회사마다 (번 길 수, 크게 잃는 길 수, 경로 수)"""
    rg = regimes(T)
    if rg is None:
        return None
    out = {}
    npath = -(-pairs // len(cols))
    for d, _ in DIRS:
        pool = rg['days'][rg['lab'] == d]
        rng = np.random.Generator(np.random.PCG64(seed_of(asof, d, part)))
        if len(pool) < H:
            out[d] = None
            continue
        X, ok = pool_matrix(pool, cols, rng)
        win = np.zeros(len(cols), np.int64)
        big = np.zeros(len(cols), np.int64)
        left = npath
        while left > 0:
            n = min(CHUNK, left)
            idx = rng.integers(0, len(pool), size=(n, H))
            s = X[idx].sum(axis=1, dtype=np.float32)          # (n, 회사) 20거래일 로그 수익
            win += (s > math.log1p(PROFIT)).sum(axis=0)
            big += (s < math.log1p(BIGLOSS)).sum(axis=0)
            left -= n
        out[d] = {'win': win, 'big': big, 'paths': npath, 'ok': ok, 'pool': int(len(pool))}
    return {'dirs': out, 'rg': rg, 'npath': npath}


def choose(T, asof, cols, pairs):
    """찾기(씨앗 A) → 소거(씨앗 B) → 36곳 · 회사마다 값"""
    f = mc(T, asof, cols, pairs, '찾기')
    e = mc(T, asof, cols, pairs, '소거')
    if f is None or e is None or any(f['dirs'][d] is None or e['dirs'][d] is None for d, _ in DIRS):
        return None
    pw = np.stack([f['dirs'][d]['win'] / f['dirs'][d]['paths'] for d, _ in DIRS])    # (4, 회사)
    pb = np.stack([e['dirs'][d]['big'] / e['dirs'][d]['paths'] for d, _ in DIRS])
    ok = np.all(np.stack([f['dirs'][d]['ok'] & e['dirs'][d]['ok'] for d, _ in DIRS]), axis=0)
    avg = pw.mean(axis=0)
    worst = pb.max(axis=0)
    elig = np.flatnonzero(ok)
    ncut = int(math.floor(len(elig) * CUT + 1e-9))
    order_cut = sorted(elig, key=lambda j: (-worst[j], -cap_sel[codes[cols[j]]]))   # 가장 나쁜 방향의 크게 잃는 길 몫 큰 순
    cut = set(order_cut[:ncut])
    alive = [j for j in elig if j not in cut]
    alive.sort(key=lambda j: (-avg[j], -cap_sel[codes[cols[j]]]))
    picks, per = [], {}
    for j in alive:
        ind = companies[cols[j]][3]
        if per.get(ind, 0) >= PER_IND:
            continue
        per[ind] = per.get(ind, 0) + 1
        picks.append(j)
        if len(picks) == N_PICK:
            break
    return {'pw': pw, 'pb': pb, 'avg': avg, 'worst': worst, 'ok': ok, 'cut': cut, 'alive': alive, 'picks': picks, 'ncut': ncut,
            'rg': f['rg'], 'npath': f['npath'], 'pools': {d: f['dirs'][d]['pool'] for d, _ in DIRS}}


# ── ① 지금(10월 8일 기준) ──
T = ND - 1
ASOF = iso(DATES[T])
cols_all = list(range(NC))
say(f'지금 셈 — 기준일 {ASOF} · 방향마다 회사 × 경로 {PAIRS:,}')
now = choose(T, ASOF, cols_all, PAIRS)
if now is None:
    sys.exit('pick36: 지금 셈을 못 함(역사 창 · 방향 날 모자람)')
rg = now['rg']
say('방향 날 수 ' + json.dumps(rg['n'], ensure_ascii=False) + f" · 출렁 문턱 {rg['volTh']:.5f}")
price = {codes[j]: (float(P[T, j]) if not np.isnan(P[T, j]) else None) for j in range(NC)}

# ── ② 지난 기록 시험 ──
bt = []
if not QUICK:
    k0 = next(k for k, d in enumerate(DATES) if d >= '20240701')
    k = k0
    while k + H <= T:
        cols = [j for j in range(NC) if not np.isnan(P[k, j])]
        res = choose(k, iso(DATES[k]), cols, PAIRS_BT)
        if res is not None:
            def ret(j):
                a = P[k, j]
                seg = P[k + 1:k + H + 1, j]
                z = seg[~np.isnan(seg)]
                return float(z[-1] / a - 1) if len(z) else 0.0
            pk = [cols[j] for j in res['picks']]
            rp = float(np.mean([ret(j) for j in pk]))
            ru = float(np.mean([ret(j) for j in cols]))
            bt.append({'t': iso(DATES[k]), 'to': iso(DATES[k + H]), 'n': len(cols), 'picks': len(pk), 'pick': round(rp * 100, 2), 'all': round(ru * 100, 2), 'win': rp > ru})
            say(f"시험 {iso(DATES[k])} → {iso(DATES[k + H])} · 36곳 {rp * 100:+.2f}% · 365곳 {ru * 100:+.2f}% · {'맞음' if rp > ru else '틀림'}")
        k += H


def binom_p(k, n):
    """한쪽 이항 검정 P(X ≥ k | n, 0.5)"""
    return sum(math.comb(n, i) for i in range(k, n + 1)) / 2 ** n


btsum = None
if bt:
    n = len(bt)
    w = sum(b['win'] for b in bt)
    h1, h2 = bt[:n // 2], bt[n // 2:]
    r1_ = sum(b['win'] for b in h1) / len(h1) if h1 else None
    r2_ = sum(b['win'] for b in h2) / len(h2) if h2 else None
    p = binom_p(w, n)
    passes = (w / n >= 0.60) and (p < 0.05) and (r1_ is not None and r1_ >= 0.55) and (r2_ is not None and r2_ >= 0.55)
    ex = [b['pick'] - b['all'] for b in bt]
    btsum = {'n': n, 'wins': w, 'rate': round(w / n, 4), 'p': round(p, 4), 'firstHalf': round(r1_, 4), 'secondHalf': round(r2_, 4),
             'meanPick': round(float(np.mean([b['pick'] for b in bt])), 2), 'meanAll': round(float(np.mean([b['all'] for b in bt])), 2),
             'meanExcess': round(float(np.mean(ex)), 2), 'passes': passes, 'rows': bt}
    say(f'시험 {n}번 · 맞음 {w}번({w / n:.1%}) · p {p:.4f} · 앞 {r1_:.0%} 뒤 {r2_:.0%} · 문턱 {"넘음" if passes else "못 넘음"}')

# ── ③ 기록 ──
names = {c[0]: c[1] for c in companies}
inds = {c[0]: c[3] for c in companies}
grps = {c[0]: c[2] for c in companies}
picks = [codes[j] for j in now['picks']]
per_co = {}
for j in range(NC):
    c = codes[j]
    per_co[c] = {'ok': bool(now['ok'][j]), 'avg': round(float(now['avg'][j]) * 100, 2), 'win': [round(float(x) * 100, 2) for x in now['pw'][:, j]],
                 'big': [round(float(x) * 100, 2) for x in now['pb'][:, j]], 'worst': round(float(now['worst'][j]) * 100, 2),
                 'cut': j in now['cut'], 'rank': (picks.index(c) + 1) if c in picks else None}
total = sum(price[c] for c in picks if price[c])
made = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
spec = {'version': VERSION, 'dir': '가 · 시장 방향 넷', 'horizon': H, 'profit': PROFIT, 'bigLoss': BIGLOSS, 'cut': '3분의 1', 'perIndustry': PER_IND,
        'window': WIN, 'volQ': VOLQ, 'upTh': UPTH, 'downTh': DNTH, 'pairs': PAIRS, 'pairsBacktest': PAIRS_BT,
        'paths': now['npath'], 'totalPairs': now['npath'] * NC * len(DIRS) * 2, 'quick': QUICK}
out = {'schema': 'atlas-new-pick36-1', 'made': made, 'asOf': ASOF, 'spec': spec,
       'dirs': [{'id': d, 'name': nm, 'days': rg['n'][d], 'pool': now['pools'][d]} for d, nm in DIRS],
       'volTh': rg['volTh'], 'window': {'from': iso(DATES[int(rg['days'][0])]), 'to': ASOF, 'days': int(len(rg['days']))},
       'eligible': int(now['ok'].sum()), 'cutN': now['ncut'], 'alive': len(now['alive']),
       'picks': [{'rank': k + 1, 'code': c, 'name': names[c], 'g': grps[c], 'i': inds[c], 'price': price[c], **{x: per_co[c][x] for x in ('avg', 'win', 'big', 'worst')}} for k, c in enumerate(picks)],
       'total': total, 'companies': per_co, 'backtest': btsum}
os.makedirs(os.path.join(ROOT, 'site/atlas/data'), exist_ok=True)
with open(os.path.join(ROOT, 'site/atlas/data/pick36.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    f.write('\n')
rec = os.path.join(ROOT, 'reports/atlas11/verify', f"pick36-{ASOF}-{made.replace(':', '').replace('-', '')}.json")
if not QUICK:
    with open(rec, 'x', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
say(f"36곳: {', '.join(names[c] for c in picks[:10])} … · 1주씩 합계 {total:,.0f}원 · 기록 {os.path.relpath(rec, ROOT) if not QUICK else '(빠른 셈 — 기록 안 씀)'}")
print(json.dumps({'asOf': ASOF, 'paths': now['npath'], 'totalPairs': spec['totalPairs'], 'eligible': out['eligible'], 'cut': out['cutN'], 'picks': len(picks), 'total': total, 'backtest': {k: v for k, v in (btsum or {}).items() if k != 'rows'}}, ensure_ascii=False))
