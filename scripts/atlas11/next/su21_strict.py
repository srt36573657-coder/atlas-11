"""수르 여섯 묶음 — 몬테카를로로 먼저 찾고 소거 기준 31가지로 거름(주문 0854)
  사장님 2026-11-09 08:54 「돈이 꽃이 그리고 불장이 됐거나 될 듯한 종목 선정을 할 때 몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로 찾아내도록 할」
  · 08:55 이해 보고 「365곳마다 지난 값을 10만 번 섞어 보고, 지금 모습이 우연으로는 잘 안 나오는 곳만 후보로 남겨요 · 거르는 기준 31가지를 하나씩 대어, 하나라도 걸리면 빼요」
  · 09:02 「어」(물음 「엄격하게 걸러 한 묶음에 7곳이 안 되면, 통과한 곳만 보여 주고 남는 자리는 비워 두는 뜻인가요?」)
  ① 몬테카를로 — 365곳마다(scan365 · 올릴 때) 지난 250거래일(지금 창 앞) 하루 오르내림을 10만 번 뽑아 섞은 길을 그림
     지금 창(불장 · 돈 = 20거래일 · 그 밖 = 닷새 · 꽃 둘은 시장보다 앞선 만큼)의 값보다 크거나 같은 길이 스무 번에 한 번(0.05) 아래일 때만 후보로 남음(우연으로는 잘 안 나오는 모습)
     씨앗 = 회사 · 판 날 · 묶음 · 창(같은 자료면 같은 값 — 지난 판 다시 세기와 오늘이 같음)
  ② 소거 31 — 아래 CRIT 차례로 하나씩(31번) · 하나라도 걸리면 뺌 · 자료가 없으면 걸림(엄격)
  ③ 후보 = 몬테카를로를 지난 곳 가운데 묶음 셈(su21.py 지금 셈 일곱)에 든 곳 → 소거 31 → 남은 곳만(차례 그대로 · 채우지 않음 — 일곱이 안 되면 남는 자리는 비움 · 09:02 「어」)
     지난 1년(su_strict_past.py): 옛 일곱을 이렇게 거르면 될 듯 셋 모두 한 달 안에 그렇게 된 몫이 옛 셈보다 많았음 · 더 깊은 차례로 채우면 오히려 줄었음(그래서 채우지 않음)
  앞날을 맞히지 않음 — 지금 모습이 지난 값으로 보아 드문지를 셀 뿐(새 앞날 값 0)
"""
import math, hashlib, json, warnings
import numpy as np
warnings.filterwarnings('ignore', category=RuntimeWarning) # 값 없는 날(앞쪽) 평균 — 빈 칸은 NaN 으로 둠

RULE_ID = 'strict31-v1'
MC_PATHS = 100_000
MC_P = 0.05
HIST = 250
WIN = {'hot': 20, 'money': 20, 'bloom': 5, 'hotNext': 5, 'moneyNext': 5, 'bloomNext': 5}  # 기준(나 · 다)이 보는 창
MCWIN = {'hot': 20, 'money': 20, 'bloom': 20, 'hotNext': 5, 'moneyNext': 5, 'bloomNext': 5}  # 몬테카를로 창
REL = {'bloom', 'bloomNext'}  # 시장보다 앞선 만큼으로 셈
IND_MC = {'bloom'}  # 꽃이 될(싹) = 업종이 꽃 — 몬테카를로는 그 업종이 20거래일 동안 시장보다 앞선 만큼(업종 회사 하루 값 고른 평균 − 시장)
PER = {'money': 1, 'moneyNext': 1}  # 업종마다 몇 곳(나머지 둘)
FIN_INDS = ('은행', '증권', '보험', '캐피탈', '카드')
RUMOR = ('테마', '관련주', '수혜', '대선', '정치인', '상한가', '작전')

# 소거 기준 31가지 — id · 묶음(가 자료 · 나 우연 · 다 업종과 시장 · 라 돈과 사람 · 마 회사) · 이름 · 잣대 · 까닭
CRIT = [
    ('a1', '가', '값 21개', '지난 21거래일 마지막 값이 모두 있어요', '빠진 값이 있으면 셈이 틀어져요'),
    ('a2', '가', '그날 값', '마지막 값이 오늘 판 날의 값이에요', '늦은 값으로는 지금 모습을 말할 수 없어요'),
    ('a3', '가', '나눔 흔적 없음', '하루에 35 넘게 뛰거나 떨어진 날이 없어요', '주식 나눔 · 합침이 섞이면 오른 것처럼 보여요'),
    ('a4', '가', '지난 기록 충분', '몬테카를로에 쓸 지난 하루 값이 200개 넘어요', '지난 값이 적으면 섞어 볼 바탕이 모자라요'),
    ('a5', '가', '회사 쪽이 열림', '회사 자료(이름 · 시장)가 있어요', '누르면 회사를 보여 줄 수 있어야 해요'),
    ('a6', '가', '멈춘 날 없음', '같은 값이 사흘 넘게 이어지지 않아요', '거래가 멈췄던 흔적이에요'),
    ('a7', '가', '올라온 지 1년', '지난 52주 값이 240날 넘게 있어요', '새로 올라온 회사는 값이 크게 흔들려요'),
    ('b1', '나', '다시 세도 드묾', '씨앗을 바꿔 10만 번 다시 섞어도 스무 번에 한 번 아래예요', '한 번만 드물게 나온 것이 아님을 봐요'),
    ('b2', '나', '하루에 몰리지 않음', '창 안 가장 크게 오른 하루를 빼도 창 동안 오른 채예요', '하루 소식에 튄 값은 모습이 아니에요'),
    ('b3', '나', '오른 날이 많음', '창 안 오른 날이 절반 넘어요', '며칠에 몰리지 않고 꾸준해야 해요'),
    ('b4', '나', '끝이 꺾이지 않음', '마지막 닷새(닷새 창은 마지막 날) 3 넘게 내리지 않았어요', '막 꺾인 곳은 지금 모습과 달라요'),
    ('b5', '나', '높은 곳에서 밀리지 않음', '창 안 가장 높은 값보다 15 넘게 낮지 않아요', '많이 밀린 곳은 지금 모습이 흐려요'),
    ('b6', '나', '흔들림이 지나치지 않음', '하루 오르내림 흔들림이 365곳 위 열에 하나 안에 들지 않아요', '너무 흔들리는 곳은 우연이 커요'),
    ('c1', '다', '업종도 같은 쪽', '그 업종 평균도 창 동안 올랐어요', '혼자만 움직인 곳은 빼요'),
    ('c2', '다', '업종 여럿이 함께', '그 업종 회사의 열에 넷 넘게가 창 동안 올랐어요', '한두 곳만 오른 업종은 흐름이 아니에요'),
    ('c3', '다', '시장보다 앞섬', '창 동안 365곳 평균보다 더 올랐어요', '시장이 다 오를 때 따라 오른 것만은 아니어야 해요'),
    ('c4', '다', '앞선 만큼이 큼', '시장보다 3(닷새 창은 1) 넘게 앞섰어요', '조금 앞선 것은 흔들림 안이에요'),
    ('c5', '다', '업종 안 앞쪽', '그 업종 안 오른 차례가 위 절반이에요', '업종 안에서도 앞서야 해요'),
    ('d1', '라', '외국인 · 기관이 사들임', '닷새 동안 외국인과 기관을 합쳐 사들인 쪽이 많아요', '큰돈이 함께 들어왔는지 봐요'),
    ('d2', '라', '개인 혼자가 아님', '닷새 동안 개인만 사들이고 외국인 · 기관이 모두 판 모습이 아니에요', '개인 혼자 미는 값은 빨리 꺼져요'),
    ('d3', '라', '외국인 몫 줄지 않음', '외국인이 가진 몫이 닷새 동안 0.5 넘게 줄지 않았어요', '큰돈이 빠져나가는 곳은 빼요'),
    ('d4', '라', '기관이 팔지 않음', '닷새 동안 기관이 판 쪽이 많지 않아요', '기관이 내놓는 곳은 빼요'),
    ('d5', '라', '소문 말 없음', '마지막 뉴스 제목에 테마 · 관련주 · 수혜 · 대선 · 상한가 같은 말이 없어요', '소문으로 몰린 곳은 빼요'),
    ('d6', '라', '회사 크기 2천억 원 넘음', '회사 크기(시가총액)가 2천억 원 넘어요', '작은 회사는 적은 돈으로도 크게 움직여요'),
    ('d7', '라', '이름이 나온 뉴스', '닷새 안 회사 이름이 나온 뉴스가 하나 넘게 있어요', '까닭 없이 움직인 곳은 빼요'),
    ('e1', '마', '영업이익', '지난해 영업이익이 0보다 커요', '본업으로 벌어야 해요'),
    ('e2', '마', '순이익', '지난해 순이익이 0보다 커요', '남는 돈이 있어야 해요'),
    ('e3', '마', '자기자본이익', '지난해 자기자본이익(100원에)이 3원 넘어요', '가진 돈으로 버는 힘이에요'),
    ('e4', '마', '빚', '빚이 자기자본의 두 배 아래예요(은행 · 증권 · 보험은 셈 빼고)', '빚이 많으면 흔들릴 때 버티기 어려워요'),
    ('e5', '마', '매출 줄지 않음', '지난해 매출이 그 앞 해의 열에 아홉 넘어요', '팔리는 것이 줄면 오름이 오래가지 않아요'),
    ('e6', '마', '값이 지나치지 않음', '주가가 장부 값의 열 배 아래예요', '값이 너무 앞서 간 곳은 빼요'),
]
assert len(CRIT) == 31 and len({c[0] for c in CRIT}) == 31

def seed_of(*xs):
    return int(hashlib.sha256('|'.join(map(str, xs)).encode()).hexdigest()[:16], 16)

def mc_p(hist, n, actual, seed):
    """지난 하루 값(hist · 로그 오르내림)을 n개씩 10만 번 뽑아 더한 길 가운데 지금 값(actual) 이상인 몫 — (센 수 + 1) ÷ (길 + 1)"""
    rng = np.random.default_rng(seed)
    idx = rng.integers(0, len(hist), size=(MC_PATHS, n))
    s = hist[idx].sum(axis=1)
    return (int((s >= actual - 1e-12).sum()) + 1) / (MC_PATHS + 1)

class Ctx:
    """오늘 판 자료 — su21.py 가 넘김(B · 판 날 · 업종 · 회사 자료 읽기 · 몸값 · 365곳 21 값)"""
    def __init__(self, B, day, dates, co_close, opens, cap, CL, ind_of):
        self.B, self.day, self.dates, self.co_close, self.opens, self.cap, self.CL, self.ind_of = B, day, dates, co_close, opens, cap, CL, ind_of
        T = max((i for i, d in enumerate(dates) if d <= day), default=-1)
        self.T = T
        # 365곳 하루 로그 오르내림(지난 HIST + 20 날) · 시장 = 고른 평균
        self.R = {}
        lo = max(1, T - HIST - 25)
        for c in B:
            a = co_close(c)
            if a is None or T < 1: continue
            r = np.full(T + 1, np.nan)
            seg = a[lo - 1:T + 1]
            with np.errstate(divide='ignore', invalid='ignore'):
                rr = np.log(seg[1:] / seg[:-1])
            rr[~np.isfinite(rr)] = np.nan
            r[lo:T + 1] = rr
            self.R[c] = r
        M = np.array([self.R[c] for c in self.R]) if self.R else np.zeros((0, T + 1))
        with np.errstate(invalid='ignore'):
            self.Rm = np.nanmean(M, axis=0) if len(M) else np.zeros(T + 1)
        # 창별 값(판 21 값에서) — 365곳
        self.ret = {w: {c: math.log(l[-1] / l[-1 - w]) for c, l in CL.items()} for w in (20, 5)}
        self.mret = {w: (sum(self.ret[w].values()) / len(self.ret[w]) if self.ret[w] else 0.0) for w in (20, 5)}
        self.vol = {c: float(np.std([math.log(q / p) for p, q in zip(l, l[1:])])) for c, l in CL.items()}
        vs = sorted(self.vol.values())
        self.vol90 = vs[int(len(vs) * 0.9)] if vs else 0
        self.inds = {}
        for c in CL: self.inds.setdefault(ind_of(c), []).append(c)

    def n52(self, c):
        a = self.co_close(c)
        if a is None or self.T < 0: return None
        return int(np.isfinite(a[max(0, self.T - 251):self.T + 1]).sum())

    def hist(self, c, k):
        """몬테카를로 바탕 — 지금 창 앞 HIST 날의 하루 로그 오르내림(꽃 둘 = 시장보다 앞선 만큼 · 꽃이 될 = 그 업종 고른 평균이 시장보다 앞선 만큼)"""
        w = MCWIN[k]
        a, b = self.T - w - HIST + 1, self.T - w + 1
        if a < 1: a = 1
        if k in IND_MC:
            mem = [x for x in self.inds.get(self.ind_of(c), []) if x in self.R]
            if len(mem) < 3: return None
            with np.errstate(invalid='ignore'):
                r = np.nanmean(np.array([self.R[x][a:b] for x in mem]), axis=0)
        else:
            rr = self.R.get(c)
            if rr is None: return None
            r = rr[a:b]
        x = r - (self.Rm[a:b] if k in REL else 0)
        return x[np.isfinite(x)]

def actual_of(ctx, c, k):
    w = MCWIN[k]
    if k in IND_MC:
        rs = [ctx.ret[w][x] for x in ctx.inds.get(ctx.ind_of(c), []) if x in ctx.ret[w]]
        if len(rs) < 3: return None
        return sum(rs) / len(rs) - ctx.mret[w]
    v = ctx.ret[w].get(c)
    if v is None: return None
    return v - ctx.mret[w] if k in REL else v

def mc_of(ctx, c, k):
    h, a = ctx.hist(c, k), actual_of(ctx, c, k)
    if h is None or a is None or len(h) < 60: return {'p': None, 'p2': None, 'n': 0 if h is None else int(len(h)), 'stat': None}
    w = MCWIN[k]
    p = mc_p(h, w, a, seed_of(c, ctx.day, k, w, 1))
    p2 = mc_p(h, w, a, seed_of(c, ctx.day, k, w, 2))
    return {'p': round(p, 6), 'p2': round(p2, 6), 'n': int(len(h)), 'stat': round(a * 100, 2)}

def checks(ctx, c, k, mc, fin):
    """소거 기준 31가지 — [(id, 통과, 값 글)] · 자료가 없으면 걸림"""
    B, w = ctx.B, WIN[k]
    v = B[c]; l = v.get('c') if isinstance(v.get('c'), list) else None
    out = {}
    ok21 = bool(l) and len(l) == 21 and all(isinstance(x, (int, float)) and x > 0 for x in l)
    out['a1'] = (ok21, '21개' if ok21 else '모자람')
    out['a2'] = (v.get('date') == ctx.day, v.get('date') or '없음')
    jump = ok21 and any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:]))
    out['a3'] = (ok21 and not jump, '없음' if ok21 and not jump else '있음')
    out['a4'] = (mc['n'] >= 200, str(mc['n']) + '개')
    out['a5'] = (bool(ctx.opens(c)), '있음' if ctx.opens(c) else '없음')
    run = 1; mx = 1
    if ok21:
        for p, q in zip(l, l[1:]):
            run = run + 1 if q == p else 1; mx = max(mx, run)
    out['a6'] = (ok21 and mx < 3, str(mx) + '날 이어짐' if mx >= 2 else '없음')
    d52 = (v.get('info') or {}).get('days52')
    if not isinstance(d52, (int, float)): d52 = ctx.n52(c) # 판에 없으면 회사 자료 하루 값으로 셈(지난 252날 가운데 값이 있는 날)
    out['a7'] = (isinstance(d52, (int, float)) and d52 >= 240, (str(d52) + '날') if d52 is not None else '모름')
    out['b1'] = (mc['p2'] is not None and mc['p2'] <= MC_P, ('다시 센 ' + fmt_p(mc['p2'])) if mc['p2'] is not None else '못 셈')
    if ok21:
        lr = [math.log(q / p) for p, q in zip(l[-w - 1:], l[-w:])]
        tot = sum(lr); mxd = max(lr)
        up = sum(1 for x in lr if x > 0)
        last5 = l[-1] / l[-6] - 1 if w == 20 else l[-1] / l[-2] - 1
        hi = max(l[-w - 1:])
        out['b2'] = (tot - mxd > 0, f'가장 큰 하루 {pct1(math.exp(mxd) - 1)} · 빼면 {pct1(math.exp(tot - mxd) - 1)}')
        out['b3'] = (up * 2 > w, f'{w}날 가운데 {up}날')
        out['b4'] = (last5 >= -0.03, ('마지막 닷새 ' if w == 20 else '마지막 날 ') + pct1(last5))
        out['b5'] = (l[-1] >= 0.85 * hi, f'가장 높은 값의 {round(l[-1] / hi * 100)}')
        vol = ctx.vol.get(c)
        out['b6'] = (vol is not None and vol < ctx.vol90, f'365곳 가운데 {rank_of(ctx.vol, c)}째')
    else:
        for x in ('b2', 'b3', 'b4', 'b5', 'b6'): out[x] = (False, '값 모자람')
    ind = ctx.ind_of(c); mem = ctx.inds.get(ind, [])
    rs = [ctx.ret[w][x] for x in mem if x in ctx.ret[w]]
    me = ctx.ret[w].get(c)
    out['c1'] = (bool(rs) and sum(rs) / len(rs) > 0, ('업종 평균 ' + pct1(math.exp(sum(rs) / len(rs)) - 1)) if rs else '모름')
    out['c2'] = (bool(rs) and sum(1 for x in rs if x > 0) * 10 >= len(rs) * 4, f'{len(rs)}곳 가운데 {sum(1 for x in rs if x > 0)}곳' if rs else '모름')
    ex = None if me is None else me - ctx.mret[w]
    out['c3'] = (ex is not None and ex > 0, ('시장보다 ' + pp1(ex)) if ex is not None else '모름')
    out['c4'] = (ex is not None and ex > (0.03 if w == 20 else 0.01), ('시장보다 ' + pp1(ex)) if ex is not None else '모름')
    if me is not None and rs:
        rk = 1 + sum(1 for x in rs if x > me)
        out['c5'] = (rk * 2 <= len(rs) + 1, f'{len(rs)}곳 가운데 {rk}째')
    else: out['c5'] = (False, '모름')
    fl = ((v.get('brief') or {}).get('flows')) or {}
    fo, ins, iv = fl.get('foreign'), fl.get('institution'), fl.get('individual')
    has = all(isinstance(x, (int, float)) for x in (fo, ins, iv))
    out['d1'] = (has and fo + ins > 0, ('외국인 · 기관 합 ' + won_k(fo + ins)) if has else '자료 없음')
    out['d2'] = (has and not (iv > 0 and fo <= 0 and ins <= 0), '개인 혼자' if has and iv > 0 and fo <= 0 and ins <= 0 else ('아님' if has else '자료 없음'))
    hp = fl.get('holdPct') or {}
    dh = (hp.get('last') - hp.get('first')) if isinstance(hp.get('last'), (int, float)) and isinstance(hp.get('first'), (int, float)) else None
    out['d3'] = (dh is not None and dh >= -0.5, (f'{dh:+.2f}').replace('-', '−') if dh is not None else '자료 없음')
    out['d4'] = (has and ins >= 0, ('기관 ' + won_k(ins)) if has else '자료 없음')
    title = (((v.get('brief') or {}).get('news')) or {}).get('title') or ''
    hit = [x for x in RUMOR if x in title]
    out['d5'] = (not hit, ('「' + hit[0] + '」') if hit else '없음')
    cp = ctx.cap.get(c)
    out['d6'] = (isinstance(cp, (int, float)) and cp >= 2000, (f'{round(cp):,}억 원') if isinstance(cp, (int, float)) else '모름')
    nn = (v.get('brief') or {}).get('newsNamed')
    out['d7'] = (isinstance(nn, int) and nn >= 1, (str(nn) + '건') if isinstance(nn, int) else '모름')
    f = fin or {}
    last = lambda key: (f.get(key) or [None])[-1] if isinstance(f.get(key), list) and f.get(key) else None
    prev = lambda key: f.get(key)[-2] if isinstance(f.get(key), list) and len(f.get(key)) >= 2 else None
    op, net, roe, debt, rev, rv0 = last('op'), last('net'), last('roe'), last('debt'), last('rev'), prev('rev')
    isfin = any(x in (ind or '') for x in FIN_INDS)
    num = lambda x: isinstance(x, (int, float))
    out['e1'] = (num(op) and op > 0, (f'{op:,}억 원' if num(op) else '모름'))
    out['e2'] = (num(net) and net > 0, (f'{net:,}억 원' if num(net) else '모름'))
    out['e3'] = (num(roe) and roe > 3, (f'{roe}' if num(roe) else '모름'))
    out['e4'] = (isfin or (num(debt) and debt < 200), '셈 빼고(금융)' if isfin else (f'{debt}' if num(debt) else '모름'))
    out['e5'] = (num(rev) and num(rv0) and rv0 > 0 and rev >= 0.9 * rv0, (f'{rv0:,} → {rev:,}억 원' if num(rev) and num(rv0) else '모름'))
    pbr = (fin or {}).get('_pbr')
    out['e6'] = (num(pbr) and 0 < pbr < 10, (f'{pbr}배' if num(pbr) else '모름'))
    return [(cid, bool(out[cid][0]), out[cid][1]) for cid, *_ in CRIT]

def fmt_p(p):
    return '10만 번에 ' + f'{round(p * MC_PATHS):,}' + '번'

def pct1(x):
    v = round(x * 100, 1)
    return ('+' if v > 0 else '−' if v < 0 else '') + f'{abs(v):.1f}'

def pp1(x):
    v = round(x * 100, 1)
    return ('+' if v > 0 else '−' if v < 0 else '') + f'{abs(v):.1f}'

def won_k(x):
    return ('+' if x > 0 else '−' if x < 0 else '') + f'{abs(int(x)):,}주'

def rank_of(d, c):
    return 1 + sum(1 for x in d.values() if x > d[c])

def select(ctx, pools, fin_of):
    """묶음마다 지금 셈의 일곱(pools[k] · 차례 그대로) → 몬테카를로(스무 번에 한 번 아래) → 소거 31(하나라도 걸리면 뺌) → 남은 곳만(채우지 않음)"""
    res, picks = {}, {}
    for k in ('hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'):
        pool = list(dict.fromkeys(pools.get(k, [])))
        info, mc_ok = {}, []
        for c in pool:
            m = mc_of(ctx, c, k)
            info[c] = {'mc': m}
            if m['p'] is not None and m['p'] <= MC_P: mc_ok.append(c)
        cks = {c: checks(ctx, c, k, info[c]['mc'], fin_of(c)) for c in mc_ok}
        steps, alive = [], list(mc_ok)
        for j in range(len(CRIT)):
            alive = [c for c in alive if cks[c][j][1]]
            steps.append(len(alive))
        picks[k] = alive
        for c in mc_ok: info[c]['ok'] = [x[1] for x in cks[c]]; info[c]['v'] = [x[2] for x in cks[c]]
        res[k] = {'pool': len(pool), 'mc': len(mc_ok), 'steps': steps, 'final': len(alive), 'win': MCWIN[k], 'cwin': WIN[k], 'rel': k in REL, 'ind': k in IND_MC, 'info': info}
    return picks, res

def scan365(ctx):
    """① 몬테카를로를 365곳 모두에 — 창 셋(20거래일 · 닷새 · 닷새 시장보다)마다 지금 모습이 스무 번에 한 번 아래로 드문 회사 수(올릴 때만 · 지난 판 다시 세기는 일곱만 셈 — 고르는 결과는 같음)"""
    out = {'scanned': 0}
    for name, k in (('r20', 'hot'), ('r5', 'hotNext'), ('x5', 'bloomNext'), ('i20', 'bloom')):
        n = 0; m = 0
        for c in sorted(ctx.B):
            r = mc_of(ctx, c, k)
            if r['p'] is None: continue
            m += 1; n += r['p'] <= MC_P
        out[name] = n; out['scanned'] = max(out['scanned'], m)
    return out
