#!/usr/bin/env python3
"""
쓰는 법: python3 scripts/atlas11/verify/pick7_backtest.py [결과 파일 — 기본 reports/atlas11/verify/pick7-backtest-latest.json]

「맞히는 판」 시험 — 7일(5거래일) 뒤, 후보 7곳 가운데 「가장 오를 한 곳」을 고르는 셈이 지난 기록에서 동전보다 나았나?
사장님 2026-10-10 20:47 「7일 예측까지해 가장 확율 높은거 딱 하나만!」 → 22:36 「알아서해」

미리 정한 것(돌리기 전에 적음 · 결과를 보고 바꾸지 않음):
  자료   public/data/input.json(한국 365곳 종가 · 2023-06-14 ~ 2026-10-08) · 업종 = 판 board.json companies[].group.id
  후보   5판 규칙을 값만으로 다시 셈(1년 추세 = 252거래일 전 → 20거래일 전 · 상위 20% 그물 · 20거래일 전 그물 밖이던 초입 ·
         1년 추세 큰 순 · 한 업종 3곳까지 · 7곳). 흑자 · 위험 공시는 지난 날 자료가 없어 빼고 셈(한계).
  때     셀 수 있는 첫 날부터 5거래일마다(겹치지 않게) — t 종가 → t+5 종가
  고르는 셈 넷(가장 확률 높은 하나를 고르는 방법 후보):
         S1 1위(1년 추세 가장 큼 · 사이트 순위 그대로)
         S2 가장 덜 흔들린 곳(60거래일 하루 수익률 표준편차 가장 작음 · 셈 틀의 「가운데 값이 가장 높은 곳」과 같은 쪽)
         S3 최근 5거래일 가장 많이 내린 곳(되돌림)
         S4 최근 20거래일 가장 많이 오른 곳(짧은 추세)
  맞음   ① 고른 곳이 7곳의 가운데 값보다 더 오름(7곳 안에서 앞섬) ② 고른 곳이 올랐음(+)
  비교   ① 동전(50%) ② 7곳에서 아무거나 하나(같은 때의 7곳 오른 몫 평균)
  사이트에 올릴 문턱: ①이 넷 중 하나라도 60% 이상 · 한쪽 이항 검정 p < 0.0125(0.05 ÷ 4) · 앞 절반 · 뒤 절반 모두 55% 이상
  자료 오류: 5거래일 수익률 절댓값 50% 넘는 값은 뺌(주식 나눔 등 · 수정주가 확인 안 됨) — 뺀 수를 적음
"""
import json, math, os, sys, statistics as st
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')) if '__file__' in globals() else '/home/claude/atlas-11'
inp = json.load(open(f'{R}/public/data/input.json', encoding='utf-8'))
board = json.load(open(f'{R}/public/data/atlas11/view/board.json', encoding='utf-8'))
END = board['asOf']
G = {c['code']: (c.get('group') or {}).get('id') for c in board['companies']}  # 업종 = 판 묶음(판 읽기 lens stocks[].g 와 같은 id)
P = {}
for a in inp['assets']:
    P[a['code']] = {p['date']: p['close'] for p in a['prices'] if isinstance(p.get('close'), (int, float)) and p['close'] > 0}
ses = sorted(d for d in inp['calendar']['sessions'] if d <= END)
codes = sorted(P)
LOOK, SKIP, GAP, NETP, WANT, PER = 252, 20, 20, 20, 7, 3

def px(c, k):
    return P[c].get(ses[k]) if 0 <= k < len(ses) else None

def trend(c, k):
    if k < LOOK: return None
    c0, a, b = px(c, k), px(c, k - LOOK), px(c, k - SKIP)
    return (b / a - 1) if (c0 and a and b) else None

def quant(xs, p):
    a = sorted(x for x in xs if x is not None)
    if not a: return None
    pos = p / 100 * (len(a) - 1); lo = math.floor(pos); hi = min(len(a) - 1, lo + 1)
    return a[lo] + (a[hi] - a[lo]) * (pos - lo)

def ret(c, k0, k1):
    a, b = px(c, k0), px(c, k1)
    return (b / a - 1) if (a and b) else None

def vol(c, k, n=60):
    rs = [ret(c, i - 1, i) for i in range(k - n + 1, k + 1)]
    rs = [math.log1p(r) for r in rs if r is not None and abs(r) < 0.5]
    return st.pstdev(rs) if len(rs) >= n * 0.8 else None

def binom_p(k, n):  # 한쪽: P(X >= k) · X ~ B(n, 0.5)
    return sum(math.comb(n, i) for i in range(k, n + 1)) / 2 ** n

k_first = LOOK + GAP
rows, dropped = [], 0
for k in range(k_first, len(ses) - 5, 5):
    m = {c: trend(c, k) for c in codes}; mp = {c: trend(c, k - GAP) for c in codes}
    q, qp = quant(m.values(), 100 - NETP), quant(mp.values(), 100 - NETP)
    if q is None or qp is None: continue
    fresh = sorted([c for c in codes if m[c] is not None and m[c] >= q and not (mp[c] is not None and mp[c] >= qp)], key=lambda c: (-m[c], c))
    per, picks = {}, []
    for c in fresh:
        if len(picks) >= WANT: break
        g = G.get(c); n = per.get(g, 0)
        if n >= PER: continue
        per[g] = n + 1; picks.append(c)
    fw = {c: ret(c, k, k + 5) for c in picks}
    bad = [c for c in picks if fw[c] is None or abs(fw[c]) > 0.5]
    dropped += len(bad)
    ok = [c for c in picks if c not in bad]
    if len(ok) < 5: continue
    med = st.median(fw[c] for c in ok)
    sig = {
        'S1': max(ok, key=lambda c: (m[c], c)),
        'S2': min((c for c in ok if vol(c, k) is not None), key=lambda c: vol(c, k), default=None),
        'S3': min((c for c in ok if ret(c, k - 5, k) is not None), key=lambda c: ret(c, k - 5, k), default=None),
        'S4': max((c for c in ok if ret(c, k - 20, k) is not None), key=lambda c: ret(c, k - 20, k), default=None),
    }
    rows.append({'t': ses[k], 'n': len(ok), 'upShare': sum(fw[c] > 0 for c in ok) / len(ok), 'beatShare': sum(fw[c] > med for c in ok) / len(ok), 'med': med,
                 **{s: ({'beat': fw[c] > med, 'up': fw[c] > 0, 'r': fw[c]} if c else None) for s, c in sig.items()}})

N = len(rows); half = N // 2
out = {'windows': N, 'from': rows[0]['t'] if rows else None, 'to': rows[-1]['t'] if rows else None, 'dropped': dropped,
       'randomUp': round(sum(r['upShare'] for r in rows) / N, 4) if N else None, 'randomBeat': round(sum(r['beatShare'] for r in rows) / N, 4) if N else None, 'signals': {}}
NAMES = {'S1': '1위(1년 추세 가장 큼)', 'S2': '가장 덜 흔들린 곳(셈 틀의 가운데 값 가장 높은 쪽)', 'S3': '최근 5거래일 가장 많이 내린 곳', 'S4': '최근 20거래일 가장 많이 오른 곳'}
for s in ['S1', 'S2', 'S3', 'S4']:
    xs = [r[s] for r in rows if r[s]]
    n = len(xs); beat = sum(x['beat'] for x in xs); up = sum(x['up'] for x in xs)
    a, b = [r[s] for r in rows[:half] if r[s]], [r[s] for r in rows[half:] if r[s]]
    pa = sum(x['beat'] for x in a) / len(a) if a else None; pb = sum(x['beat'] for x in b) / len(b) if b else None
    upEx = sum((r[s]['up'] - r['upShare']) for r in rows if r[s]) / n if n else None
    p = binom_p(beat, n) if n else None
    passes = bool(n and beat / n >= 0.60 and p < 0.0125 and pa >= 0.55 and pb >= 0.55)
    out['signals'][s] = {'name': NAMES[s], 'n': n, 'beat': beat, 'beatRate': round(beat / n, 4), 'p': round(p, 4), 'firstHalf': round(pa, 4), 'secondHalf': round(pb, 4),
                         'up': up, 'upRate': round(up / n, 4), 'upVsRandomPp': round(upEx * 100, 2), 'meanRetPct': round(st.mean(x['r'] for x in xs) * 100, 3), 'passes': passes}
out['anyPasses'] = any(v['passes'] for v in out['signals'].values())
out['made'] = __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(timespec='seconds'); out['asOf'] = END
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else f'{R}/reports/atlas11/verify/pick7-backtest-latest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
