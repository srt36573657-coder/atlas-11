"""큐피트 넷째 창 — 조용한데 힘이 모이는 곳 일곱(주문 1111-1334)
  사장님 2026-11-11 13:34 「조용한데 에너지가 모이는 주식창을 하나더 만들어라 그래서 총 28개로 만들고 몬태카를로 소거법으로을 찾아내라
    그러면서 이것을 ㅊ 적하는 별도에 달력을 만들어라 잡스라면」 · 13:35 이해 보고 「값은 잠잠한데, 거래가 조금씩 늘어 힘이 쌓이는 회사」
  ① 소거법 — 우량주 365곳에 기준 일곱을 대고, 하나라도 걸리면 뺌(QCRIT)
  ② 몬테카를로 — 남은 곳마다 지난 250거래일 하루 값을 20개씩 10만 번 뽑아 그린 길의 「한 달 위아래 폭」과 지금 폭을 견줌
     → 지금 폭 이하가 나온 몫(p) = 이 회사 지난 1년 흔들림으로 보아 이만큼 조용하기가 얼마나 드문가(작을수록 드묾)
  ③ 소거 한 번 더 — p 가 PMAX 넘으면 뺌(다섯 번에 한 번보다 흔한 조용함) · 일곱이 안 되면 다음 차례로 채우고 「채움」 표시
  ④ 차례 — p 작은 차례 → 같으면 닷새 동안 외국인 · 기관이 더 많이 들어온 차례 → 번호 · 업종마다 둘까지 → 일곱 · 첫 셋 = 1 · 2 · 3등
  앞날을 맞히지 않음 — 지금 모습이 지난 값으로 보아 얼마나 드문지와, 누가 사고팔았는지 기록을 셀 뿐"""
import math
import numpy as np

RULE_ID = 'quiet7-v1'
PATHS = 100_000      # 몬테카를로 길 수(42칸 셈과 같음)
HIST = 250           # 바탕 = 지금 창 앞 250거래일
WIN = 20             # 창 = 한 달(20거래일 · 21 마지막 값)
PMAX = 0.2           # 소거 한 번 더 — 다섯 번에 한 번보다 흔한 조용함은 뺌
MOVE = 0.05          # 하루 오르내림 위아래 5 안
SPAN = 0.10          # 한 달 폭(가장 낮은 값을 100원으로 칠 때 가장 높은 값까지) 10원 아래 — 화면 「한 달 폭: 100원에 ○원」과 같은 잣대
CAPCUT = 0.2         # 몸집 아래 열에 둘은 뺌(거래가 드문 곳)
MINH = 200           # 바탕 하루 값이 200날 넘게
QCRIT = [  # (번호, 이름, 쉬운 말) — 화면 「이렇게 걸렀어요」
    ('q1', '값이 있음', '한 달 마지막 값이 모두 있고, 하루에 크게 끊긴 날이 없어요'),
    ('q2', '다른 세 창 밖', '불장 · 꽃이 될 · 돈이 몰리는 21곳에는 들지 않았어요'),
    ('q3', '한 달이 잠잠', '한 달 폭이 100원에 10원 아래예요'),
    ('q4', '튀는 날 없음', '한 달 동안 하루 오르내림이 모두 위아래 5 안이에요'),
    ('q5', '몸집이 작지 않음', '회사 크기가 365곳 가운데 아래 열에 둘 밖이에요'),
    ('q6', '힘이 모임', '닷새 동안 외국인과 기관을 더하면 들어온 쪽이에요'),
    ('q7', '지난 1년 기록', '지난 1년 하루 값이 200날 넘게 있어요'),
]

def seed_of(*xs):
    import hashlib
    return int(hashlib.sha256('|'.join(map(str, xs)).encode()).hexdigest()[:16], 16)

def span_of(l):
    """21 마지막 값의 한 달 위아래 폭(로그) — log(가장 높은 값 ÷ 가장 낮은 값)"""
    return math.log(max(l) / min(l))

def quiet_p(h, w, actual, paths, seed):
    """지난 하루 값 h 를 w 개씩 paths 번 뽑아 그린 길(0 에서 시작)의 위아래 폭이 지금 폭(actual) 이하인 몫 — (센 수 + 1) ÷ (길 + 1)"""
    rng = np.random.default_rng(seed)
    steps = h[rng.integers(0, len(h), size=(paths, w))]
    cum = np.cumsum(steps, axis=1)
    hi = np.maximum(cum.max(axis=1), 0.0); lo = np.minimum(cum.min(axis=1), 0.0)
    return (int(((hi - lo) <= actual + 1e-12).sum()) + 1) / (paths + 1)

def flows_of(b):
    f = (b.get('brief') or {}).get('flows') if isinstance(b, dict) else None
    if not isinstance(f, dict): return None
    fo, ins = f.get('foreign'), f.get('institution')
    if not isinstance(fo, (int, float)) or not isinstance(ins, (int, float)): return None
    hp = f.get('holdPct') if isinstance(f.get('holdPct'), dict) else {}
    return {'f': fo, 'i': ins, 'p': f.get('individual') if isinstance(f.get('individual'), (int, float)) else None, 'from': f.get('from'), 'to': f.get('to'), 'days': f.get('days'),
            'hold': [hp.get('first'), hp.get('last')] if isinstance(hp.get('first'), (int, float)) and isinstance(hp.get('last'), (int, float)) else None}

def find(ctx, B, CL, late, opens, cap, now21, ind_of, day):
    """넷째 창 일곱 — {'list': [번호 …](차례), 'why': {번호: 까닭}, 'steps': [(이름, 남은 수) …], 'mc': {번호: {p, stat, n}}, 'pool': 소거 일곱을 지난 수}"""
    caps = sorted(v for v in (cap.get(c) for c in B) if v)
    capcut = caps[int(len(caps) * CAPCUT)] if caps else 0
    steps, left = [('우량주', len(B))], sorted(B)
    def keep(name, ok):
        nonlocal left
        left = [c for c in left if ok(c)]; steps.append((name, len(left)))
    keep('값이 있음', lambda c: c in CL and c not in late and opens(c))
    keep('다른 세 창 밖', lambda c: c not in now21)
    keep('한 달이 잠잠', lambda c: round((max(CL[c]) / min(CL[c]) - 1) * 100, 1) < SPAN * 100) # 화면에 보이는 값(소수 한 자리)으로 — 「100원에 10원」이 「10원 아래」에 들지 않게
    keep('튀는 날 없음', lambda c: all(abs(q / p - 1) < MOVE for p, q in zip(CL[c], CL[c][1:])))
    keep('몸집이 작지 않음', lambda c: (cap.get(c) or 0) >= capcut)
    FL = {c: flows_of(B[c]) for c in left}
    keep('힘이 모임', lambda c: FL.get(c) is not None and FL[c]['f'] + FL[c]['i'] > 0)
    H = {}
    for c in left:
        r = ctx.R.get(c)
        if r is None: continue
        a, b = max(1, ctx.T - WIN - HIST + 1), ctx.T - WIN + 1
        x = r[a:b]; x = x[np.isfinite(x)]
        if len(x) >= MINH: H[c] = x
    keep('지난 1년 기록', lambda c: c in H)
    pool = list(left)
    MC = {}
    for c in pool:
        a = span_of(CL[c])
        MC[c] = {'p': round(quiet_p(H[c], WIN, a, PATHS, seed_of(c, day, 'quiet7')), 6), 'stat': round(a * 100, 2), 'n': int(len(H[c]))}
    gain = lambda c: FL[c]['f'] + FL[c]['i']
    order = sorted(pool, key=lambda c: (MC[c]['p'], -gain(c), c))
    rare = [c for c in order if MC[c]['p'] <= PMAX]
    steps.append(('몬테카를로 드문 조용함', len(rare)))
    out, cnt, fill = [], {}, set()
    for c in rare + [c for c in order if c not in rare]:
        g = ind_of(c)
        if cnt.get(g, 0) >= 2: continue
        cnt[g] = cnt.get(g, 0) + 1; out.append(c)
        if c not in rare: fill.add(c)
        if len(out) == 7: break
    steps.append(('업종마다 둘까지 · 일곱', len(out)))
    why = {}
    for j, c in enumerate(out):
        l = CL[c]
        why[c] = {'place': j + 1 if j < 3 else None, 'r20': round((l[-1] / l[0] - 1) * 100, 1), 'span20': round((max(l) / min(l) - 1) * 100, 1),
                  'day5': round(max(abs(q / p - 1) for p, q in zip(l, l[1:])) * 100, 1), 'p': MC[c]['p'], 'pn': MC[c]['n'], 'rare': c not in fill,
                  'f': FL[c]['f'], 'i': FL[c]['i'], 'ind': FL[c]['p'], 'from': FL[c]['from'], 'to': FL[c]['to'], 'days': FL[c]['days'], 'hold': FL[c]['hold']}
    return {'list': out, 'why': why, 'steps': steps, 'mc': {c: MC[c] for c in out}, 'pool': len(pool), 'capcut': capcut}
