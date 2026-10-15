#!/usr/bin/env python3
"""새 ATLAS 「급등」 탭 — 지난 5거래일 크게 오른 회사 36곳(sv-v1) · 하루 4번 업데이트 때 넣고(선택) 빼기(탈락)
사장님 2026-10-15 14:27(싱가포르) 「탭을 하나 더 만들어라 / 어떤 탭이냐면 최근 5일에 급등한 종목을 36개 모아높는곳이다
기준은 cia라면 어떻게 할것인지 에이전트 총 사용해서 하고 하루에 4번 업데이트할때미다 그때 선택도 하고 탈락도 시켜라」 (규칙 69)
  → 일꾼 여섯(분석 · 방첩 · 수집 실험 · 경보 · 레드 셀 · 브리핑 — 공개된 CIA 방법: ICD 203 · 경쟁 가설 분석 · 핵심 가정 점검 · 기만 탐지 · 지표와 경보 · 레드 셀 · PDB)이
    서로 모르게 따로 짠 안 → 사회자 결정표 → 반대만 받는 토론 한 판 → 이 판(docs/design/new-atlas-2026-10-11.md 「급등 탭」)
  예전 「매수 검토 36곳」(규칙 55 · 사기 전 목록)과 다른 것 — 지난 5거래일 값의 기록일 뿐 · 사고팔 곳을 고른 목록이 아님

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름 · 한 장 정리 = 결정표 v2 · docs/design/new-atlas-2026-10-11.md 「급등 탭」) ━━
재는 법   r = 마지막 값(업데이트 때 · 장 중이면 그때 값) ÷ 5거래일 전 종가(거래소 달력 6칸 · 종가만) — 비교는 이 비(실수 나눗셈 한 번 · 노드와 같은 셈)로만
「?」     셀 수 없는 곳은 넣지도 남기지도 않고 까닭마다 수만 셈 — 차례로 ① 새로 상장(5거래일 전 날 앞에 거래일 20일이 안 됨) ② 6칸 가운데 값이 빈 날
          (거래정지 · 받기 실패 · 지난 값을 고쳐 적어 새 날을 안 받음) ③ 6칸 가운데 거래량 0 인 날 ④ 하루 ±35% 넘게 바뀐 날
          (거래소 하루 제한 30% · 30 ~ 35% 는 저녁 장 값이 섞인 진짜 상한가가 많음 — 방첩 · 수집 · 분석 일꾼이 셈)
          ⑤ 창 앞 61거래일 가운데 거래량 0 인 날이 13일 넘음(오래 멈췄다 풀린 곳 — 다시 열리며 값이 크게 다시 매겨짐 · 분석 일꾼 반대 5)
얇음      평소 하루 거래대금 = 5거래일 전 날 앞 20거래일의 (종가 × 거래량) 가운데값 — 1억 원 밑이면 새로 넣지 않음(적은 돈으로 값이 움직이는 곳 · 띄우기에 싼 곳)
차례 줄   자료 문과 얇음 문을 지난 곳을 r 큰 차례 → 평소 거래대금 큰 차례 → 번호 차례 · 지금 목록의 얇은 곳은 얇음 문 없이 그 줄에 끼워 남기 차례를 셈(속 셈 · 화면에 차례 번호 없음)
들어오기  r ≥ 1.15(+15%) · 차례 36번째 안 · 빈자리가 있을 때(차례대로)
맞바꿈    밖의 들 수 있는 곳(36번째 안) 가운데 첫 곳이 안의 가장 약한 곳(이번에 든 곳 빼고)보다 5%p 넘게 크면 맞바꿈 · 되풀이(경보 일꾼 반대 1)
다시 듦   빠진 날과 다음 거래일에는 문턱 · 맞바꿈에 5%p 를 더 넘어야 함(오락가락 막기)
남기      셀 수 있고 · r ≥ 1.10(+10%) · 차례 72번째 안(36 × 2 — 수집 일꾼 반대 1: 54 면 아침에 든 곳 31% 가 저녁에 빠짐 · 72 면 16%)
장 중     오늘 하루가 5일 오름의 80% 넘게인 곳은 같은 날 다음 업데이트에서 한 번 더 넘어야 듦(방첩 일꾼 반대 2) · 날이 바뀐 첫 업데이트에서 앞 날 장 중에 든 곳을
          그날 끝난 값으로 다시 봄(확정 맞대기) · 마지막 20번 맞대기에서 4분의 1 넘게 못 들었으면 모든 곳이 두 번 넘어야 듦(멈춤 조건 · 분석 · 레드 셀)
36곳      자리 수일 뿐 — 모자라면 채우지 않음(문턱을 낮추지 않음) · 처음(앞 판 없음) · 판이 바뀐 때 = 들어오기 조건 그대로 차례대로
때        하루 4번 업데이트(10:00 · 12:00 · 14:00 · 18:00 서울) 때만 넣고 뺌 · 앞 판 = 실제로 올라간 마지막 고르기(roll.mjs) · 그 밖 올림은 그 판 그대로
          받은 회사가 모든 회사의 90% 밑이면 이번에는 고르지 않음(받기 고장 — roll.mjs 가 앞 판 그대로 + 「?」)
조심      거래소 투자경고 오름 기준(5일 60% · 15일 100% + 그날 종가가 15거래일 가운데 가장 높음 · 지수 조건은 안 셈)에 끝난 날 종가로 지난 5거래일 가운데
          하루라도 닿은 곳(경보 일꾼 반대 2 · 레드 셀 반대 3) — 수와 접은 이름 · 실제 지정 여부는 모름(「?」)
사실 수   하루에 몰려 오름(5일 오름의 2/3 넘게가 하루 — (하루 비)³ ≥ (5일 비)²) · 되오름(5거래일 전 종가가 그 앞 60거래일 꼭대기보다 30% 넘게 낮음)
          · 반값(5거래일 전 날까지 1년 안에 꼭대기의 반값 밑 종가가 있었음) · 거래가 덜 붙음(5거래일 거래대금 평균이 평소의 2배 밑 — 방첩 일꾼 반대 3 · 문 대신 수)
          · 왜 올랐나 가르기(경쟁 가설 — 시장과 함께: 모든 회사 가운데 r−1 × 2 ≥ 오름 / 업종과 함께: 같은 업종(자기 뺌 · 4곳 밑이면 큰 갈래) 가운데 × 2 ≥ 오름 ·
            또는 같은 업종 +15% 넘은 곳이 2곳 이상이고 그날 몫으로 기대한 수의 3배 이상 / 나머지 = 이 회사 쪽 · 까닭은 「?」)
뺀 것     지난 기록 흉내(그 뒤 20거래일 · 하루 바뀌는 수)는 셈하지 않음 — 지운 「지난 기록 시험」(규칙 55) · 앞날 말(규칙 49) 밖 (브리핑 일꾼 반대 1)
따로 세기  surge_verify.mjs(노드 · 원문에서 처음부터 · 같은 앞 판 · 같은 상태) 틀림 0 일 때만 올림 · 기록은 새 파일만

쓰는 법(저장소 맨 위에서 · site_build.py 가 같은 자료 폴더에 mkt.json · core.json 을 만든 뒤):
  python3 scripts/atlas11/t365/surge.py <now.json(dump.mjs)> <자료 폴더> [--prev <{at, kst, slot, payload, state} | null>] [--at <ISO 때>] [--slot <10:00 …| ''>] [--state-out <파일>]
  환경 변수 ATLAS_T365_CLOSES = 이어 받은 일봉 폴더(closes_fetch.mjs) — 없으면 모음 일봉만
만드는 것: <자료 폴더>/surge.json (화면 자료 · 들고 난 자취 hist 는 roll.mjs 가 붙임) · --state-out 속 상태(방금 빠진 곳 · 기다림 · 확정 맞대기 — 공개 자료에 없음) · 마지막 줄 = 요약 json
"""
import gzip, hashlib, json, math, os, sys, statistics as st
from datetime import datetime, timezone, timedelta
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import daese  # noqa: E402

VERSION = 'sv-v1'
NAME = '급등'
CFG = {'cap': 36, 'days': 5, 'hist': 20, 'jump': 35, 'liq': 1e8, 'enter': 1.15, 'stay': 1.10, 'enterRank': 36, 'keepRank': 72,
       'cover': 0.90, 'warn5': (16, 10), 'warn15': (2, 1), 'hi': 15, 'reb': (7, 10), 'rebDays': 60, 'halfDays': 252, 'peerMin': 5, 'chance': 3,
       'binLo': -20, 'binHi': 80, 'idleDays': 61, 'idleMax': 13, 'margin': 0.05, 'pen': 0.05, 'confirmN': 20}
Q_ORDER = ['new', 'gap', 'novol', 'jump', 'idle']
Q_WHY = {'new': '새로 상장해 평소 값을 잴 수 없음', 'gap': '6거래일 가운데 값이 빈 날이 있음(거래정지 · 받기 실패 등)',
         'novol': '거래가 없었던 날이 있음(거래정지일 수 있음)', 'jump': '하루 35% 넘게 바뀐 날이 있음(값 고침 · 자료 틀림일 수 있음)',
         'idle': '석 달 안에 거래가 오래 멈췄던 곳(다시 열리며 값이 크게 다시 매겨질 수 있음)'}
iso8, kd = daese.iso8, daese.kd
KST = timezone(timedelta(hours=9))


def die(m):
    sys.exit('surge: ' + m)


def r2(x):
    """소수 둘째 자리(가장 짧은 글 10진수에서 0.005 는 0 에서 먼 쪽 — 노드 따로 세기 d2 와 같은 뜻)"""
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return None
    from decimal import Decimal, ROUND_HALF_UP
    return float(Decimal(repr(float(x))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def load(now_path, closes_dir):
    """후보 표 · 모음 + 이어 받은 일봉 → (회사 주식 번호(번호 차례), 거래일 목록, 종가 C · 거래량 V(날 × 회사 · 없는 값 NaN), 마지막 날, 이어 받은 셈, 후보 표 줄)"""
    N = json.load(open(now_path, encoding='utf-8'))
    ACT = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
    if N['asOf'] != ACT['asOf']:
        die('후보 표 날(%s)이 universe.json asOf(%s)와 다름' % (N['asOf'], ACT['asOf']))
    bnd = json.load(gzip.open(os.path.join(ROOT, ACT['bundle']), 'rt', encoding='utf-8'))
    rows, merged, cal, day, over = daese.prepare(N['rows'], bnd, closes_dir, ROOT, N['asOf'])
    allc = sorted(r['code'] for r in N['rows'] if not r.get('notCommon'))
    D = [d for d in cal if d <= day]
    if not D or D[-1] != day:
        die('마지막 날 %s 이 거래일 목록 끝이 아님' % day)
    di = {d: k for k, d in enumerate(D)}
    C = np.full((len(D), len(allc)), np.nan)
    V = np.full((len(D), len(allc)), np.nan)
    for j, c in enumerate(allc):
        for r in merged['stocks'][c]['fchart']['rows']:
            if not r[4] or r[4] <= 0:
                continue
            k = di.get(iso8(r[0]))
            if k is None:
                continue
            C[k, j] = r[4]
            V[k, j] = r[5] if r[5] is not None else np.nan
    return allc, D, C, V, day, over, {r['code']: r for r in N['rows']}


def provisional_of(over, day):
    """마지막 날 값을 그날 저녁 8시(서울) 전에 받았으면 아직 바뀔 수 있음 — site_build.py core.provisional 과 같은 셈 · (아직 바뀜, 받은 때 KST)"""
    lf = over.get('lastFile')
    if not lf or not (day > (over.get('blast') or '')):
        return False, None
    t = datetime.fromisoformat(lf['startedAt'].replace('Z', '+00:00')).astimezone(KST)
    return (t.date().isoformat() == day and t.hour < 20), t.strftime('%Y-%m-%d %H:%M')


class Day:
    """창 끝 k(6칸 k−5 … k) 한 날의 셈 — 넘파이로 회사 모두를 한 번에"""

    def __init__(self, C, V, cnt, k):
        n = CFG['days']
        self.k = k
        W, VW = C[k - n:k + 1], V[k - n:k + 1]
        nC = C.shape[1]
        before = cnt[k - n - 1] if k - n - 1 >= 0 else np.zeros(nC, dtype=np.int64)
        new = before < CFG['hist']
        gap = np.isnan(W).any(axis=0)
        with np.errstate(invalid='ignore'):
            novol = ((VW == 0) | np.isnan(VW)).any(axis=0)
            d = np.abs(W[1:] - W[:-1]) * 100 > W[:-1] * CFG['jump']
        jump = np.nan_to_num(d, nan=0).astype(bool).any(axis=0)
        lo2 = max(0, k - n - CFG['idleDays'])
        idle = (V[lo2:k - n] == 0).sum(axis=0) > CFG['idleMax']  # 5거래일 전 날 앞 61거래일 가운데 거래량 0 인 날이 13일 넘음(분석 눈 — 멈췄다 풀린 곳)
        q = np.zeros(nC, dtype=np.int64)  # 0 = 셀 수 있음 · 1 new · 2 gap · 3 novol · 4 jump · 5 idle(앞 까닭이 먼저)
        for code, m in ((5, idle), (4, jump), (3, novol), (2, gap), (1, new)):
            q[m] = code
        self.q = q
        with np.errstate(invalid='ignore', divide='ignore'):
            self.ratio = W[-1] / W[0]
            a1 = W[-1] / W[-2]
            b1 = self.ratio
            self.dom = np.nan_to_num((b1 > 1) & (a1 * a1 * a1 * a1 * a1 > b1 * b1 * b1 * b1), nan=0).astype(bool)  # 오늘 하루가 5일 오름의 80% 넘게(ln 오늘 > 0.8 ln 5일 ⇔ 오늘⁵ > 5일⁴ · 곱셈만)
        lo = max(0, k - n - CFG['hist'])
        TV = C[lo:k - n] * V[lo:k - n]
        self.liq = np.full(nC, np.nan)
        ok = q == 0
        if ok.any():
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter('ignore', RuntimeWarning)
                self.liq[ok] = np.nanmedian(TV[:, ok], axis=0)  # 값 있는 날의 가운데(짝수면 가운데 둘의 평균) — 노드와 같은 뜻
        self.clean = ok
        self.liquid = ok & (np.nan_to_num(self.liq, nan=-1) >= CFG['liq'])
        idx = np.nonzero(self.liquid)[0]
        self.E = idx[np.lexsort((idx, -self.liq[idx], -self.ratio[idx]))]  # 차례: r 큰 → 평소 거래대금 큰 → 번호
        self.rank = {int(j): r + 1 for r, j in enumerate(self.E)}

    def key(self, j):
        return (-float(self.ratio[j]), -float(self.liq[j]) if not math.isnan(self.liq[j]) else 0.0, j)

    def rank_of(self, j):
        """셀 수 있는 곳의 차례 — 얇은 곳(남기만 봄)은 얇지 않은 곳 가운데 자기보다 앞선 수 + 1"""
        if j in self.rank:
            return self.rank[j]
        kj = self.key(j)
        return 1 + sum(1 for e in self.E if self.key(int(e)) < kj)


def choose(day, prev, pen=frozenset(), hold=None, strict=False):
    """넣고 빼기(결정표 v2 2절) — prev = 앞 판 회사 칸 번호 목록(None = 처음 · 규칙 바뀜) · pen = 다시 들어옴 가산 칸(빠진 날 · 다음 거래일 — 문턱 · 맞바꿈에 +5%p) ·
    hold = 장 중 업데이트면 같은 날 앞 업데이트의 기다림 칸 집합(오늘 하루 몰림은 두 번 넘어야 듦 — 방첩 눈) · None = 장 중 아님 ·
    strict = 확정 맞대기 멈춤 조건(모든 곳이 두 번 넘어야 듦)
    → (고른 칸(열쇠 차례), {빠진 칸: 까닭 코드}, 이번 기다림 칸(차례 줄 차례))"""
    cap = CFG['cap']
    E = [int(j) for j in day.E]
    adj = lambda j: float(day.ratio[j]) - (CFG['pen'] if j in pen else 0.0)
    enter = lambda j: adj(j) >= CFG['enter']
    ok_now = lambda j: hold is None or (not day.dom[j] and not strict) or j in hold
    Ps = set(prev or [])
    wait = [j for j in E if j not in Ps and day.rank[j] <= CFG['enterRank'] and enter(j) and not ok_now(j)]
    can = lambda j: enter(j) and ok_now(j)
    if prev is None:
        return [j for j in E if can(j) and day.rank[j] <= CFG['enterRank']][:cap], {}, wait
    P = list(prev)
    seat = sorted([j for j in P if day.clean[j] and day.ratio[j] >= CFG['stay'] and day.rank_of(j) <= CFG['keepRank']], key=day.key)
    have = set(seat)
    newset = set()
    out = {}
    for j in E:  # 빈자리 — 차례 줄 차례로
        if len(seat) >= cap:
            break
        if j in have or j in Ps:
            continue
        if can(j) and day.rank[j] <= CFG['enterRank']:
            seat.append(j)
            have.add(j)
            newset.add(j)
    while True:  # 맞바꿈 — 밖의 들 수 있는 첫 곳이 안의 가장 약한 곳(이번에 든 곳 빼고)보다 5%p 넘게 크면 바꿈(경보 눈)
        best = next((j for j in E if j not in have and j not in Ps and day.rank[j] <= CFG['enterRank'] and can(j)), None)
        olds = [j for j in seat if j not in newset]
        if best is None or not olds:
            break
        w = max(olds, key=day.key)
        if adj(best) - float(day.ratio[w]) > CFG['margin']:
            seat.remove(w)
            have.discard(w)
            out[w] = 'seat'
            seat.append(best)
            have.add(best)
            newset.add(best)
        else:
            break
    seat.sort(key=day.key)
    for j in P:
        if j in have or j in out:
            continue
        if not day.clean[j]:
            out[j] = 'q'
        elif day.ratio[j] < CFG['stay']:
            out[j] = 'floor'
        elif day.rank_of(j) > CFG['keepRank']:
            out[j] = 'rank'
        else:
            out[j] = 'seat'
    return seat, out, wait


def warn_of(C, k, j, completed_last):
    """거래소가 과열을 살피는 공개 크기(지수 조건 뺌) — t 의 종가가 15거래일 가운데 가장 높고, 5거래일 전 종가의 1.6배 이상 또는 15거래일 전 종가의 2배 이상"""
    hit = False
    for t in range(completed_last - CFG['days'] + 1, completed_last + 1):
        if t - 15 < 0:
            continue
        ct = C[t, j]
        seg = C[t - CFG['hi'] + 1:t + 1, j]
        if math.isnan(ct) or np.isnan(seg).any() or ct < seg.max():
            continue
        c5, c15 = C[t - 5, j], C[t - 15, j]
        if (not math.isnan(c5) and ct * CFG['warn5'][1] >= c5 * CFG['warn5'][0]) or (not math.isnan(c15) and ct * CFG['warn15'][1] >= c15 * CFG['warn15'][0]):
            hit = True
            break
    return hit


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        die('쓰는 법: surge.py <now.json> <자료 폴더> [--prev 파일] [--at ISO] [--slot 10:00] [--state-out 파일]')
    now_path, out = a[0], a[1]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a and a.index(k) + 1 < len(a) else d
    prev_doc = None
    if opt('--prev'):
        try:
            prev_doc = json.load(open(opt('--prev'), encoding='utf-8'))
        except FileNotFoundError:
            prev_doc = None
    at = opt('--at') or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    slot = opt('--slot') or None
    allc, D, C, V, day, over, rowmap = load(now_path, os.environ.get('ATLAS_T365_CLOSES'))
    prov, got = provisional_of(over, day)
    nD, nC = C.shape
    cnt = np.cumsum(~np.isnan(C), axis=0)
    jof = {c: j for j, c in enumerate(allc)}
    k = nD - 1
    have_last = int((~np.isnan(C[k])).sum())
    if have_last < CFG['cover'] * nC:
        die('받은 회사가 %d곳 — 모든 회사 %d곳의 %d%% 밑(받기 고장 · 이번에는 고르지 않음)' % (have_last, nC, round(CFG['cover'] * 100)))
    today = Day(C, V, cnt, k)
    prevP = (prev_doc or {}).get('payload') if prev_doc else None
    pst = ((prev_doc or {}).get('state') or {}) if prev_doc else {}
    rule = bool(prevP and prevP.get('version') != VERSION)
    if rule:
        pst = {}
    prev = [jof[m['c']] for m in prevP['members'] if m['c'] in jof] if prevP and not rule else None
    near = {D[k], D[k - 1]}
    recent = [x for x in (pst.get('recentOut') or []) if x.get('day') in near and x.get('c') in jof]
    pen = frozenset(jof[x['c']] for x in recent)
    hold = (set(jof[c] for c in (pst.get('pending') or []) if c in jof) if pst.get('asOf') == day else set()) if prov else None
    # 확정 맞대기(분석 눈 · 레드 셀) — 앞 판이 장 중 값이고 날이 넘어갔으면, 그날 장 중에 든 곳을 그날 끝난 값으로 다시 봄(들어오기 문 + 36번째 안)
    confirm = None
    if prevP and not rule and prevP.get('provisional') and prevP.get('asOf') != day and prevP.get('asOf') in D:
        dy = Day(C, V, cnt, D.index(prevP['asOf']))
        ent = [m for m in prevP['members'] if m.get('sinceAsOf') == prevP['asOf'] and m['c'] in jof]
        miss = [m for m in ent if not (dy.liquid[jof[m['c']]] and dy.ratio[jof[m['c']]] >= CFG['enter'] and dy.rank.get(jof[m['c']], 10 ** 9) <= CFG['enterRank'])]
        confirm = {'day': prevP['asOf'], 'n': len(ent), 'miss': len(miss), 'names': [m['n'] for m in miss]}
    confirms = (list(pst.get('confirms') or []) + ([{'day': confirm['day'], 'n': confirm['n'], 'miss': confirm['miss']}] if confirm else []))[-CFG['confirmN']:]
    sn, sm = sum(x['n'] for x in confirms), sum(x['miss'] for x in confirms)
    strict = len(confirms) >= CFG['confirmN'] and sn > 0 and sm * 4 > sn
    seat, outc, wait = choose(today, prev, pen, hold, strict)
    mkt = json.load(open(os.path.join(out, 'mkt.json'), encoding='utf-8'))
    core = json.load(open(os.path.join(out, 'core.json'), encoding='utf-8'))
    if mkt.get('asOf') != day or core.get('asOf') != day:
        die('mkt.json · core.json 날(%s · %s)이 이번 마지막 날 %s 과 다름' % (mkt.get('asOf'), core.get('asOf'), day))
    MK = mkt['companies']
    g_of = {i['name']: i['g'] for i in core['industries']}
    kst = datetime.fromisoformat(at.replace('Z', '+00:00')).astimezone(KST).strftime('%Y-%m-%d %H:%M')
    since = {m['c']: m for m in (prevP or {}).get('members', [])} if not rule else {}
    # 왜 올랐나 가르기(경쟁 가설 · 분석 눈) — 그날 셀 수 있는 곳의 r−1 · 업종마다(자기 뺌 · 4곳 밑이면 큰 갈래)
    clean_idx = np.nonzero(today.clean)[0].tolist()
    rr = {j: float(today.ratio[j]) - 1 for j in clean_idx}
    allr = sorted(rr.values())
    mkt_med = st.median(allr) if allr else None
    p15 = sum(1 for j in clean_idx if today.ratio[j] >= CFG['enter']) / len(clean_idx) if clean_idx else 0
    ind_of = {j: MK[allc[j]]['i'] for j in range(nC) if allc[j] in MK}
    by_ind, by_g = {}, {}
    for j in clean_idx:
        by_ind.setdefault(ind_of.get(j), []).append(j)
        by_g.setdefault(g_of.get(ind_of.get(j)), []).append(j)
    completed = k - 1 if prov else k
    members = []
    why_n = {'mkt': 0, 'ind': 0, 'co': 0}
    facts = {'warn': 0, 'warnLive': 0, 'one': 0, 'reb': 0, 'half': 0, 'quiet': 0}
    for j in seat:
        c = allc[j]
        W = C[k - CFG['days']:k + 1, j]
        c0, c5 = float(W[0]), float(W[-1])
        x = c5 / c0
        r5 = r2((x - 1) * 100)
        v = [r2(float(y) / c0 * 100) for y in W[:-1]] + [r2(100 + r5)]
        one = any(cube(float(W[t]) / float(W[t - 1])) >= x * x for t in range(1, len(W))) if x > 1 else False  # 곱셈만(거듭제곱 함수는 언어마다 끝자리가 다를 수 있음)
        pre = C[max(0, k - CFG['days'] - CFG['rebDays']):k - CFG['days'] + 1, j]
        pmax = np.nanmax(pre) if (~np.isnan(pre)).any() else np.nan
        reb = bool(pmax * CFG['reb'][0] >= c0 * CFG['reb'][1]) if not math.isnan(pmax) else False
        yr = C[max(0, k - CFG['days'] - CFG['halfDays'] + 1):k - CFG['days'] + 1, j]
        yr = yr[~np.isnan(yr)]
        half = bool((np.maximum.accumulate(yr) >= yr * 2).any()) if yr.size else False
        tv5 = 0.0
        for t in range(1, len(W)):
            tv5 = tv5 + float(W[t]) * float(V[k - CFG['days'] + t, j])
        quiet = bool(tv5 < 10 * float(today.liq[j])) if not math.isnan(today.liq[j]) else False  # 5거래일 거래대금 평균이 평소의 2배 밑(합 < 평소 × 10)
        warn = warn_of(C, k, j, completed)
        live = (not warn) and prov and warn_of(C, k, j, k)
        r = x - 1
        peers = [jj for jj in by_ind.get(ind_of.get(j), []) if jj != j]
        if len(peers) < CFG['peerMin'] - 1:
            peers = [jj for jj in by_g.get(g_of.get(ind_of.get(j)), []) if jj != j]
        hot = sum(1 for jj in peers if today.ratio[jj] >= CFG['enter'])
        if mkt_med is not None and mkt_med * 2 >= r:
            why = 'mkt'
        elif len(peers) >= CFG['peerMin'] - 1 and (st.median([rr[jj] for jj in peers]) * 2 >= r or (hot >= 2 and hot >= CFG['chance'] * len(peers) * p15)):
            why = 'ind'
        else:
            why = 'co'
        why_n[why] += 1
        for key_, val in (('warn', warn), ('warnLive', live), ('one', one), ('reb', reb), ('half', half), ('quiet', quiet)):
            facts[key_] += 1 if val else 0
        old = since.get(c)
        s_asof = old['sinceAsOf'] if old else day
        members.append({'c': c, 'n': MK[c]['n'], 'i': MK[c]['i'], 'g': g_of.get(MK[c]['i']), 'mk': rowmap[c].get('market'), 'r5': r5, 'v': v,
                        'd1': r2((float(W[-1]) / float(W[-2]) - 1) * 100), 'liq': r2(float(today.liq[j]) / 1e8) if not math.isnan(today.liq[j]) else None,
                        'warn': bool(warn), 'warnLive': bool(live), 'one': bool(one), 'reb': reb, 'half': half, 'quiet': quiet, 'why': why,
                        'tag': 'stay' if old else 'new', 'since': old['since'] if old else at, 'sinceKst': old['sinceKst'] if old else kst, 'sinceAsOf': s_asof,
                        'rounds': (old.get('rounds', 1) + 1) if old else 1, 'prov': bool(prov and s_asof == day)})
    S = set(seat)
    first = prev is None
    ins = [] if first else [{'c': m['c'], 'n': m['n'], 'r5': m['r5'], 'why': '5일 동안 %s 올라 들어왔어요' % pctw(m['r5'])} for m in members if m['tag'] == 'new']
    moved = bool(prevP) and prevP.get('asOf') != day
    outs = []
    if prevP:
        for m in prevP['members']:
            c = m['c']
            j = jof.get(c)
            if j is not None and j in S:
                continue
            if rule:
                why = '고르는 규칙이 바뀌어 새로 골랐어요'
            elif j is None:
                why = '? 이번 자료에 이 회사 값이 없어요'
            elif outc.get(j) == 'q':
                why = '? 값을 셀 수 없어 뺐어요 — ' + Q_WHY[Q_ORDER[int(today.q[j]) - 1]]
            elif outc.get(j) == 'floor':
                why = '크게 오른 날이 5일 밖으로 나가 +10% 밑이 됐어요' if moved and C[k, j] >= C[k - 1, j] else '값이 내려 +10% 밑이 됐어요'
            elif outc.get(j) == 'rank':
                why = '더 크게 오른 곳이 많아 밀렸어요'
            else:
                why = '더 크게 오른 곳에 자리를 내줬어요'
            r5o = r2((float(today.ratio[j]) - 1) * 100) if j is not None and today.clean[j] else None
            outs.append({'c': c, 'n': MK.get(c, {}).get('n') or m['n'], 'r5': r5o, 'why': why})
    qn = {Q_ORDER[i]: int((today.q == i + 1).sum()) for i in range(len(Q_ORDER))}
    hotj = [j for j in range(nC) if not math.isnan(today.ratio[j]) and today.ratio[j] >= CFG['enter']]
    cut_list = sorted([{'c': allc[j], 'n': MK[allc[j]]['n'], 'why': ('? ' + Q_WHY[Q_ORDER[int(today.q[j]) - 1]]) if today.q[j] else '평소 하루 거래가 1억 원이 안 돼요'}
                       for j in hotj if today.q[j] != 0 or not today.liquid[j]], key=lambda x: (x['n'], x['c']))
    cut = {'q': sum(1 for j in hotj if today.q[j] != 0), 'thin': sum(1 for j in hotj if today.q[j] == 0 and not today.liquid[j]),
           'seat': sum(1 for j in hotj if today.liquid[j] and j not in S), 'over': len(hotj), 'wait': len(wait)}
    ninds = {}
    for m in members:
        ninds[m['i']] = ninds.get(m['i'], 0) + 1
    bins = [0] * (CFG['binHi'] - CFG['binLo'])
    for x in allr:
        b = min(max(math.floor(x * 100), CFG['binLo']), CFG['binHi'] - 1)
        bins[b - CFG['binLo']] += 1
    avg6 = None
    if clean_idx:
        Wc = C[k - CFG['days']:k + 1][:, clean_idx]
        avg6 = [r2(float(np.median(Wc[t] / Wc[0] * 100))) for t in range(CFG['days'] + 1)]
    r5s = sorted(m['r5'] for m in members)
    kind = 'rule' if rule else 'first' if first else 'pick'
    slots = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8')).get('slots') or []
    rules = {'enter': 15, 'stay': 10, 'liq': 1, 'jump': CFG['jump'], 'hist': CFG['hist'], 'enterRank': CFG['enterRank'], 'keepRank': CFG['keepRank'],
             'margin': 5, 'pen': 5, 'idleDays': CFG['idleDays'], 'idleMax': CFG['idleMax'], 'slots': slots,
             'lines': ['5일 오름 = 마지막 값 ÷ 5일 전 종가예요. 5일은 장이 열린 날로 세요.',
                       '값이 빈 날 · 거래가 없던 날 · 하루 35% 넘게 바뀐 날이 있거나, 새로 상장했거나, 석 달 안에 오래 멈췄던 곳은 「?」로 빼요.',
                       '평소 하루 거래가 1억 원이 안 되는 곳은 새로 넣지 않아요. 적은 돈으로 값이 움직이는 곳이라서요.',
                       '+15%% 넘게 오르고 차례가 %d번째 안이면 빈자리에 들어와요.' % CFG['enterRank'],
                       '밖의 곳이 안의 가장 약한 곳보다 5%포인트 넘게 더 오르면 자리를 바꿔요. 방금 빠진 곳은 다음 장날까지 5%포인트 더 올라야 다시 들어와요.',
                       '+10%% 위에 있고 차례가 %d번째 안이면 자리를 지켜요. 들어오는 문과 나가는 문을 달리 둬 오락가락을 줄여요.' % CFG['keepRank'],
                       '장 중에 오늘 하루로만 크게 오른 곳은 다음 업데이트에서 한 번 더 넘어야 들어와요.',
                       '하루 4번 업데이트(%s · 서울) 때만 넣고 빼요. 다른 때 올리면 그때 고른 그대로예요.' % ' · '.join(slots),
                       '자리는 %d곳이에요. 채우려고 문턱을 낮추지 않아요. 다른 셈으로 한 번 더 세어 같을 때만 올려요.' % CFG['cap'],
                       '센 것일 뿐 다음 날을 말하지 않아요.']}
    P = {'schema': 'atlas-new-surge-1', 'version': VERSION, 'kind': kind, 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'at': at, 'kst': kst, 'slot': slot,
         'asOf': day, 'provisional': prov, 'got': got, 'window': D[k - CFG['days']:k + 1], 'cap': CFG['cap'], 'n': len(members), 'rules': rules,
         'stats': {'lo': r5s[0], 'hi': r5s[-1], 'med': r2(st.median(r5s))} if r5s else None,
         'funnel': {'all': nC, 'clean': len(clean_idx), 'q': nC - len(clean_idx), 'qn': qn, 'liquid': int(today.liquid.sum()), 'picked': len(members)},
         'cut': cut, 'cutList': cut_list,
         'market': {'n': len(allr), 'med': r2(mkt_med * 100) if mkt_med is not None else None, 'up': sum(1 for x in allr if x > 0), 'down': sum(1 for x in allr if x < 0), 'avg6': avg6},
         'bins': [[CFG['binLo'] + i, b] for i, b in enumerate(bins) if b], 'why': why_n, 'facts': facts,
         'sameInd': sorted([[i, n] for i, n in ninds.items() if n >= 3], key=lambda x: (-x[1], x[0])),
         'members': members, 'in': ins, 'out': outs, 'confirm': confirm, 'strict': strict,
         'prev': {'at': prev_doc.get('at'), 'kst': prev_doc.get('kst'), 'slot': prev_doc.get('slot'), 'asOf': prevP.get('asOf'), 'n': prevP.get('n'), 'version': prevP.get('version')} if prevP else None}
    canon = '|'.join([VERSION, day, '1' if prov else '0', ','.join('%s:%.2f' % (m['c'], m['r5']) for m in members), ','.join(x['c'] for x in ins), ','.join(x['c'] for x in outs)])
    P['digest'] = hashlib.sha256(canon.encode('utf-8')).hexdigest()[:16]
    with open(os.path.join(out, 'surge.json'), 'w', encoding='utf-8') as f:
        json.dump(P, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    # 속 상태(공개 자료에 싣지 않음 — 기다림 · 방금 빠진 곳은 「곧 들어올 곳」 표가 되지 않게 · 방첩 눈) — roll.mjs 가 고르기 기록에만 남김
    outset = {o['c'] for o in outs}
    state = {'asOf': day,
             'recentOut': sorted([{'c': x['c'], 'day': x['day']} for x in recent if x['c'] not in outset] + ([{'c': o['c'], 'day': day} for o in outs] if not rule else []), key=lambda x: (x['day'], x['c'])),
             'pending': sorted(allc[j] for j in wait), 'confirms': confirms}
    if opt('--state-out'):
        with open(opt('--state-out'), 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False)
    print(json.dumps({'kind': kind, 'asOf': day, 'provisional': prov, 'n': len(members), 'in': len(ins), 'out': len(outs), 'clean': len(clean_idx), 'liquid': P['funnel']['liquid'],
                      'over': cut['over'], 'wait': len(wait), 'strict': strict, 'confirm': confirm and {k_: confirm[k_] for k_ in ('day', 'n', 'miss')}, 'digest': P['digest']}, ensure_ascii=False))


def cube(y):
    return y * y * y


def pctw(x):
    a = abs(x)
    s = ('%d' % math.floor(a + 0.5 + 1e-7)) if a >= 100 else ('%.1f' % (math.floor(a * 10 + 0.5 + 1e-7) / 10))
    return ('+' if x > 0 else '−' if x < 0 else '') + s + '%'


if __name__ == '__main__':
    main()
