"""큐피트 1 · 2 · 3등 새 잣대 실험실(주문 1111-1857)
  사장님 2026-11-11 18:57 「자 지금 1.2.3등 선정 기준에 문제가 있는듯해 이렇개 선택한 종목이 지금 다 하락이잖아
    선정 기준을 상승할것 같은 종목 으로 해야 해! 에이전트 100개 만들어서 알고리즘 만들어 재대로 상황 공부하고 대입해」
  무엇: 우량주 365곳의 지난 일봉(모음 2023-04-28 ~ 2026-10-14 시고저종 · 거래량 + 판 60일 종가로 2026-11-11 까지)으로
        「그날 장 마감까지 아는 값만으로 매긴 점수」가 그 뒤 h 거래일 동안 실제로 더 오른 회사를 골랐는지 잰다.
  지킴: ① 점수는 t 날 마감까지의 값만(앞날 값을 쓰면 실패) ② 고른 날 마감값에 산 셈(달력과 같음) · 하루 건너 산 셈도 따로 잼
        ③ 설계 기간(2023-11 ~ 2025-06)만 보고 고르고, 남겨 둔 기간(2025-07 ~ 2026-11)은 마지막에 한 번만 봄(여러 번 보면 그것도 맞춘 셈)
        ④ 시장 = 365곳 고른 평균 · 남보다 더 오른 몫(초과) · 오른 때 몫 · 순위 상관(IC)을 함께 봄
  앞날을 맞히지 않음 — 지난 값에서 이런 꼴이 뒤에 어땠는지를 셀 뿐
  쓰기:
    python3 up3_lab.py build                        # 자료 묶기 → <LAB>/data.npz
    python3 up3_lab.py eval <규칙.py> [--json out]   # 설계 기간 성적(규칙 파일은 def score(F): → (날 × 회사) 점수)
    python3 up3_lab.py hold <규칙.py> ...           # 남겨 둔 기간(마지막 한 번 — 고르는 사람만)
"""
import json, gzip, os, sys, math, importlib.util, argparse
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
LAB = os.environ.get('UP3_LAB', os.path.join(ROOT, 'reports', 'atlas11', 'up3'))
BUNDLE = os.path.join(ROOT, 'reports', 'atlas11', 'universe', '2026-10-14', 'bundle.json.gz')
BOARD = os.path.join(ROOT, 'public', 'data', 'atlas11', 'view', 'board.json')
STOCKS = os.path.join(ROOT, 'public', 'data', 'atlas11', 'view', 'stocks')
DESIGN = ('2023-11-01', '2025-06-30')
HOLD = ('2025-07-01', '2026-11-11')
HS = (1, 5, 10, 20)
KS = (3, 10, 30)

def iso(d8): return d8[:4] + '-' + d8[4:6] + '-' + d8[6:8]

# ───────── 자료 묶기 ─────────
def build():
    b = json.load(open(BOARD, encoding='utf-8'))
    comp = b['companies']; codes = [c['code'] for c in comp]
    ind = [((c.get('group') or {}).get('label') if isinstance(c.get('group'), dict) else None) or c.get('sector') or '?' for c in comp]
    names = [c['name'] for c in comp]
    bd = json.load(gzip.open(BUNDLE))['stocks']
    rows = {}
    for c in codes:
        rs = (((bd.get(c) or {}).get('fchart') or {}).get('rows') or [])
        rows[c] = {iso(r[0]): r for r in rs if r[4] and r[4] > 0}
    ext, bad = {}, []
    for c in codes:
        p = os.path.join(STOCKS, c + '.json')
        try: st = json.load(open(p, encoding='utf-8'))
        except Exception: st = {}
        c60 = st.get('closes60') or []
        m = {x['date']: x['close'] for x in c60 if isinstance(x, dict) and x.get('close')}
        bl = sorted(rows[c])[-2:]                                    # 모음 마지막 두 날은 장 중에 받은 값일 수 있음 — 견주기에서 뺌
        ov = [d for d in m if d in rows[c] and d not in bl]
        if ov and abs(float(np.median([m[d] / rows[c][d][4] for d in ov])) - 1) > 0.02: bad.append(c); m = {}   # 지난 값을 통째로 고쳐 적은 곳(쪼개기 · 증자) — 뒤 이음 안 함
        ext[c] = {d: v for d, v in m.items() if d not in rows[c] or d in bl}   # 겹치는 날은 모음(끝난 값)이 이김 — 모음 마지막 두 날만 판 값으로
    last_b = max(d for c in codes for d in rows[c])
    dates = sorted(set(d for c in codes for d in rows[c]) | set(d for c in codes for d in ext[c] if d > last_b))
    D, N = len(dates), len(codes); di = {d: i for i, d in enumerate(dates)}
    C = np.full((D, N), np.nan, np.float64); O = C.copy(); H = C.copy(); L = C.copy(); V = C.copy()
    for j, c in enumerate(codes):
        for d, r in rows[c].items():
            t = di[d]; O[t, j], H[t, j], L[t, j], C[t, j], V[t, j] = [x if x else np.nan for x in r[1:6]]
        for d, v in ext[c].items():
            if d > last_b: C[di[d], j] = v
            elif d in rows[c] and abs(v / rows[c][d][4] - 1) > 1e-9:   # 판 60일 마감(끝난 값)이 이김 — 장 중 값이던 시고저 · 거래량은 비움
                t = di[d]; C[t, j] = v; O[t, j] = H[t, j] = L[t, j] = V[t, j] = np.nan
    os.makedirs(LAB, exist_ok=True)
    np.savez_compressed(os.path.join(LAB, 'data.npz'), C=C, O=O, H=H, L=L, V=V, dates=np.array(dates), codes=np.array(codes), names=np.array(names), ind=np.array(ind), bundle_last=last_b, ext_bad=np.array(bad))
    print(json.dumps({'days': D, 'codes': N, 'from': dates[0], 'to': dates[-1], 'bundle_last': last_b, 'ext_bad': len(bad)}, ensure_ascii=False))

# ───────── 기능(F) — 모두 t 날 마감까지만 씀 ─────────
class Feat:
    """F.C/O/H/L/V (날 × 회사) · F.dates · F.codes · F.ind(업종 이름) · F.lr(하루 로그 값) · 함수들은 모두 그날까지의 창(앞날 0)"""
    def __init__(self, z):
        self.C, self.O, self.H, self.L, self.V = z['C'], z['O'], z['H'], z['L'], z['V']
        self.dates = [str(x) for x in z['dates']]; self.codes = [str(x) for x in z['codes']]; self.names = [str(x) for x in z['names']]
        self.ind = np.array([str(x) for x in z['ind']]); self.D, self.N = self.C.shape
        with np.errstate(divide='ignore', invalid='ignore'):
            self.lr = np.vstack([np.full((1, self.N), np.nan), np.log(self.C[1:] / self.C[:-1])])
        self.mkt = np.nanmean(self.lr, axis=1)                      # 시장 = 365곳 고른 평균 하루 로그 값
        self._c = {}
    # 굴리는 창(끝 = t) — 값이 빠진 날이 있으면 그 창은 NaN
    def roll(self, X, w, fn):
        base = next((n for n in ('lr', 'C', 'O', 'H', 'L', 'V') if X is getattr(self, n)), None)   # 잡아 둘 것은 처음 배열만(임시 배열은 id 가 다시 쓰임)
        key = (base, w, fn)
        if base and key in self._c: return self._c[key]
        out = np.full(X.shape, np.nan)
        if w <= X.shape[0]:
            from numpy.lib.stride_tricks import sliding_window_view as swv
            win = swv(X, w, axis=0)                                  # (D-w+1, N, w)
            with np.errstate(all='ignore'):
                out[w - 1:] = {'sum': np.sum, 'mean': np.mean, 'std': np.std, 'max': np.max, 'min': np.min}[fn](win, axis=-1)
        if base: self._c[key] = out
        return out
    def ret(self, k):        "k 거래일 로그 값(t-k 마감 → t 마감)"; return self.roll(self.lr, k, 'sum')
    def mret(self, k):       "시장 k 거래일 로그 값(날마다 같은 값을 회사 수만큼)"; m = np.convolve(np.nan_to_num(self.mkt), np.ones(k), 'full')[:self.D]; m[:k] = np.nan; return np.repeat(m[:, None], self.N, 1)
    def rel(self, k):        "k 거래일 시장보다 더 오른 몫(로그)"; return self.ret(k) - self.mret(k)
    def vol(self, k):        "k 거래일 하루 값 흔들림(표준편차)"; return self.roll(self.lr, k, 'std')
    def maxday(self, k):     "k 거래일 가운데 가장 크게 오른 하루"; return self.roll(self.lr, k, 'max')
    def minday(self, k):     "k 거래일 가운데 가장 크게 내린 하루"; return self.roll(self.lr, k, 'min')
    def hi(self, k):         "지금 값 ÷ k 거래일 가장 높은 마감 − 1(0 이면 신고가)"; return self.C / self.roll(self.C, k, 'max') - 1
    def lo(self, k):         "지금 값 ÷ k 거래일 가장 낮은 마감 − 1"; return self.C / self.roll(self.C, k, 'min') - 1
    def ma(self, k):         "지금 값 ÷ k 거래일 평균 − 1"; return self.C / self.roll(self.C, k, 'mean') - 1
    def vratio(self, a, b):  "최근 a 거래일 평균 거래량 ÷ b 거래일 평균 거래량"; return self.roll(self.V, a, 'mean') / self.roll(self.V, b, 'mean')
    def turnover(self, k):   "k 거래일 평균 거래대금(원 · 로그)"; return np.log(self.roll(self.C * self.V, k, 'mean'))
    def updays(self, k):     "k 거래일 가운데 오른 날 몫"; return self.roll((self.lr > 0).astype(float) + np.where(np.isnan(self.lr), np.nan, 0), k, 'mean')
    def clv(self, k):        "k 거래일 평균 마감 자리((마감 − 저가) ÷ (고가 − 저가) · 1 이면 고가 마감)"; x = (self.C - self.L) / (self.H - self.L); x[~np.isfinite(x)] = np.nan; return self.roll(x, k, 'mean')
    def gap(self):           "오늘 시가 ÷ 어제 마감 − 1"; g = np.full(self.C.shape, np.nan); g[1:] = self.O[1:] / self.C[:-1] - 1; return g
    def beta(self, k):       "k 거래일 시장에 대한 민감도"; m = np.repeat(self.mkt[:, None], self.N, 1); mm = self.roll(m, k, 'mean'); xm = self.roll(self.lr * m, k, 'mean'); x = self.roll(self.lr, k, 'mean'); vm = self.roll(m * m, k, 'mean') - mm * mm; return (xm - x * mm) / vm
    def indmean(self, X):
        "업종 고른 평균(날마다 · 같은 업종 회사에게 같은 값)"
        out = np.full(X.shape, np.nan)
        for g in np.unique(self.ind):
            m = self.ind == g
            if m.sum() >= 2:
                with np.errstate(all='ignore'): out[:, m] = np.nanmean(X[:, m], axis=1, keepdims=True)
        return out
    def zcs(self, X):        "날마다 회사끼리 표준 점수(평균 0 · 흔들림 1)"; mu = np.nanmean(X, 1, keepdims=True); sd = np.nanstd(X, 1, keepdims=True); return (X - mu) / np.where(sd > 0, sd, np.nan)
    def rank(self, X):
        "날마다 회사끼리 순위 0 ~ 1(클수록 큼)"
        out = np.full(X.shape, np.nan)
        for t in range(X.shape[0]):
            x = X[t]; ok = np.isfinite(x); n = ok.sum()
            if n >= 2: r = np.empty(n); r[np.argsort(x[ok], kind='mergesort')] = np.arange(n); out[t, ok] = r / (n - 1)
        return out

def load():
    z = np.load(os.path.join(LAB, 'data.npz'), allow_pickle=False)
    return Feat(z)

def eligible(F):
    """고를 수 있는 회사 — 그날 마감값 있음 · 지난 60거래일 값이 다 있음 · 거래대금이 365곳 아래 열에 둘 밖(뒤 이음 날은 마지막으로 아는 거래대금)"""
    ok = np.isfinite(F.C) & np.isfinite(F.roll(F.lr, 60, 'sum'))
    tv = F.turnover(20)
    tv = np.array([np.where(np.isfinite(tv[t]), tv[t], np.nan) for t in range(F.D)])
    # 뒤 이음 날(거래량 없음)은 마지막 거래대금으로 채움
    last = np.full(F.N, np.nan)
    for t in range(F.D):
        f = np.isfinite(tv[t]); last[f] = tv[t, f]; tv[t, ~f] = last[~f]
    q = np.nanpercentile(np.where(np.isfinite(tv), tv, np.nan), 20, axis=1, keepdims=True)
    return ok & (tv >= q)

def fwd(F, h, skip=0):
    """t 마감(또는 skip 거래일 뒤 마감)에 사서 h 거래일 뒤 마감까지 값 몫"""
    out = np.full(F.C.shape, np.nan)
    a, b = skip, skip + h
    if b < F.D: out[:F.D - b] = F.C[b:] / F.C[a:F.D - b + a] - 1
    return out

def spearman_row(s, f):
    ok = np.isfinite(s) & np.isfinite(f)
    if ok.sum() < 20: return np.nan
    a = s[ok].argsort().argsort().astype(float); b = f[ok].argsort().argsort().astype(float)
    a -= a.mean(); b -= b.mean(); d = math.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d > 0 else np.nan

def evaluate(F, S, period, skip=0, elig=None):
    """점수 S(날 × 회사) → 기간 성적 — h 마다 1 · 2 · 3등(3) · 10 · 30곳 평균 값 몫 · 시장보다 더 오른 몫 · 오른 때 몫 · 시장 이긴 때 몫 · 순위 상관"""
    elig = eligible(F) if elig is None else elig
    t0 = next(i for i, d in enumerate(F.dates) if d >= period[0]); t1 = max(i for i, d in enumerate(F.dates) if d <= period[1])
    res = {'period': period, 'skip': skip, 'h': {}}
    for h in HS:
        fw = fwd(F, h, skip)
        days = [t for t in range(t0, t1 + 1) if np.isfinite(fw[t]).sum() > 100]
        per = {k: [] for k in KS}; per_x = {k: [] for k in KS}; hit = {k: [] for k in KS}; win = {k: [] for k in KS}; ics = []; mk = []
        for t in days:
            s = np.where(elig[t] & np.isfinite(fw[t]), S[t], np.nan)
            okn = np.isfinite(s).sum()
            if okn < 30: continue
            m = np.nanmean(np.where(elig[t], fw[t], np.nan)); mk.append(m)
            order = np.argsort(-np.nan_to_num(s, nan=-np.inf))
            for k in KS:
                pick = order[:k]; r = fw[t, pick]
                per[k].append(float(np.mean(r))); per_x[k].append(float(np.mean(r) - m)); hit[k].append(float(np.mean(r > 0))); win[k].append(float(np.mean(r > m)))
            ics.append(spearman_row(s, fw[t]))
        n = len(mk)
        if not n: res['h'][h] = None; continue
        step = max(1, h)                                             # 겹치지 않게 h 날마다 뽑아 흔들림(t 값)을 잼
        def tstat(xs):
            xs = np.array(xs)[::step]; xs = xs[np.isfinite(xs)]
            return float(xs.mean() / (xs.std(ddof=1) / math.sqrt(len(xs)))) if len(xs) > 3 and xs.std(ddof=1) > 0 else None
        icsa = np.array(ics, float)
        res['h'][h] = {'days': n, 'mkt': float(np.mean(mk)),
            'top': {k: {'ret': float(np.mean(per[k])), 'ex': float(np.mean(per_x[k])), 'ex_t': tstat(per_x[k]), 'hit': float(np.mean(hit[k])), 'win': float(np.mean(win[k]))} for k in KS},
            'ic': float(np.nanmean(icsa)), 'ic_t': tstat(icsa),
            'quarters': [float(np.mean(q)) if len(q) else None for q in np.array_split(np.array(per_x[10]), 4)]}
    return res

def load_rule(path):
    spec = importlib.util.spec_from_file_location('rule', path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m

def check_causal(F, fn):
    """앞날 쓰기 검사 — 마지막 40날 값을 지운 자료로 셈한 점수가, 지우기 전 점수와 그 앞날까지 같아야 함"""
    S = fn(F)
    G = Feat({'C': F.C.copy(), 'O': F.O.copy(), 'H': F.H.copy(), 'L': F.L.copy(), 'V': F.V.copy(), 'dates': np.array(F.dates), 'codes': np.array(F.codes), 'names': np.array(F.names), 'ind': F.ind})
    cut = F.D - 40
    for X in (G.C, G.O, G.H, G.L, G.V): X[cut:] = np.nan
    G.__init__({'C': G.C, 'O': G.O, 'H': G.H, 'L': G.L, 'V': G.V, 'dates': np.array(F.dates), 'codes': np.array(F.codes), 'names': np.array(F.names), 'ind': F.ind})
    S2 = fn(G)
    a, b = S[:cut], S2[:cut]
    same = np.allclose(np.nan_to_num(a, nan=1e9), np.nan_to_num(b, nan=1e9), rtol=1e-6, atol=1e-9)
    return S, bool(same)

def short(r):
    out = {}
    for h, v in r['h'].items():
        if not v: continue
        out[h] = {'시장': round(v['mkt'] * 100, 2), '1·2·3등': round(v['top'][3]['ret'] * 100, 2), '3곳 초과': round(v['top'][3]['ex'] * 100, 2), '3곳 오른 때': round(v['top'][3]['hit'] * 100, 1),
                  '10곳 초과': round(v['top'][10]['ex'] * 100, 2), '10곳 t': None if v['top'][10]['ex_t'] is None else round(v['top'][10]['ex_t'], 2), '30곳 초과': round(v['top'][30]['ex'] * 100, 2),
                  'IC': round(v['ic'], 4), 'IC t': None if v['ic_t'] is None else round(v['ic_t'], 2), '분기 10곳 초과': [None if q is None else round(q * 100, 2) for q in v['quarters']]}
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('cmd'); ap.add_argument('rule', nargs='?'); ap.add_argument('--json'); ap.add_argument('--skip', type=int, default=0)
    a = ap.parse_args()
    if a.cmd == 'build': return build()
    F = load(); m = load_rule(a.rule)
    S, causal = check_causal(F, m.score)
    if not causal: print(json.dumps({'error': '앞날 값을 씀 — 마지막 40날을 지우면 점수가 바뀜(규칙을 고칠 것)'}, ensure_ascii=False)); sys.exit(2)
    per = DESIGN if a.cmd == 'eval' else HOLD
    if a.cmd == 'hold' and os.environ.get('UP3_HOLD') != '1': print('남겨 둔 기간은 고르는 사람만 봄'); sys.exit(3)
    r = evaluate(F, S, per, skip=a.skip)
    out = {'rule': os.path.basename(a.rule), 'name': getattr(m, 'NAME', ''), 'period': per, 'skip': a.skip, 'causal': causal, 'short': short(r), 'full': r}
    if a.json: json.dump(out, open(a.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({'rule': out['rule'], 'name': out['name'], 'period': per, 'short': out['short']}, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()
