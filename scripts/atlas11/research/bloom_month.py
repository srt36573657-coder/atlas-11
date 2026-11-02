#!/usr/bin/env python3
"""꽃 될 회사 — 달마다 스스로 다시 고르기 · 연구 셈 ①(docs/design/self-evolve-2026-11-02/spec.md v2 · v1 위에 더함)

사장님 2026-11-02 08:13(+04) 「응 그리고 스스로 하건 점수화해소 교차 검증 하게 해」(주문 1313) —
앞 물음 「다음 큰 진화로, 이 고르는 법을 달마다 새 기록으로 스스로 다시 시험하게 할까요?」의 답.

쓰는 법:
  python3 scripts/atlas11/research/bloom_month.py <자료 폴더> <결과 json> [--stored site/next/data/bloom-months.json]
결정 = 자료에 첫 거래일 s 가 있는 모든 달(배우는 날 250 이상부터) · v1 고르기 그대로(들 수 있음 · LB · 같으면 n · 이름 차례)
봉인 = 2026-11 부터는 --stored 에 적힌 결정을 그대로 씀(새로 센 것은 fresh 로만 적음) · 2026-10 까지는 늘 새로 셈
달 기록 = 그 달 결정으로 T0 ≤ t ≤ TL 날에 고른 회사(싹 & 셀 수 있음 & 결과 있음 & 조건) n · 꽃 h · 같은 날 아무 회사 nb · hb · 날 수 · 고른 날
바탕 셈(자료 · 후보 11,874 · 날마다 고른 수 · 들 수 있음 · LB)은 scripts/atlas11/research/bloom_evolve.py 의 「걸어가며 고르기」 앞까지를 그대로 돌려 씀(같은 숫자).
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다.
"""
import json
import os
import sys
import time

T_START = time.time()
HERE = os.path.dirname(os.path.abspath(__file__))
ARGV = sys.argv[1:]
STORED = ARGV[ARGV.index('--stored') + 1] if '--stored' in ARGV else None
ARGS = [a for i, a in enumerate(ARGV) if not a.startswith('--') and not (i > 0 and ARGV[i - 1] == '--stored')]
ROOT = ARGS[0] if ARGS else 'site/atlas/data'
OUT = ARGS[1] if len(ARGS) > 1 else None
SEAL_FROM = '2026-11'  # 이 달부터는 처음 낸 결정을 봉인(spec v2 §2)
MIN_TRAIN = 250


def log(*a):
    print(f'[{time.time() - T_START:7.1f}s]', *a, flush=True)


# ── 바탕 셈 그대로(bloom_evolve.py 「걸어가며 고르기」 앞까지 — 후보 11,874 · NC · HC · 들 수 있음 · LB) ──
SRC = open(os.path.join(HERE, 'bloom_evolve.py'), encoding='utf8').read()
CUT = SRC.index('# ── 걸어가며 고르기 ──')
NS = {'__name__': 'bloom_evolve_base', '__file__': os.path.join(HERE, 'bloom_evolve.py')}
_argv = sys.argv
sys.argv = ['bloom_evolve.py', ROOT]
try:
    exec(compile(SRC[:CUT], 'bloom_evolve.py', 'exec'), NS)
finally:
    sys.argv = _argv
D, N, T0, TL = NS['D'], NS['N'], NS['T0'], NS['TL']
NC, HC = NS['NC'], NS['HC']
CAND_IDS, IDN = NS['CAND_IDS'], NS['IDN']
window_stats, choose = NS['window_stats'], NS['choose']
nb_d, hb_d = NS['nb_d'], NS['hb_d']
log('바탕 셈 끝', N, '날 · 후보', len(CAND_IDS))

stored = {}
if STORED and os.path.exists(STORED):
    for m in json.load(open(STORED, encoding='utf8')).get('months') or []:
        if isinstance(m, dict) and isinstance(m.get('month'), str):
            stored[m['month']] = m

firsts = [t for t in range(N) if t == 0 or D[t][:7] != D[t - 1][:7]]
months, tot = [], {'n': 0, 'h': 0, 'nb': 0, 'hb': 0}
for k, s in enumerate(firsts):
    e = s - 20
    if e - T0 + 1 < MIN_TRAIN:
        continue
    month = D[s][:7]
    ws = window_stats(e)
    q = choose(ws)
    fresh = CAND_IDS[q] if q is not None else None
    sealed = month >= SEAL_FROM
    st = stored.get(month)
    if sealed and st is not None and st.get('sealed'):
        use = st.get('id')
        qq = IDN.get(use) if use else None
        if use and qq is None:
            raise SystemExit(f'봉인된 결정 {month} {use} 가 후보에 없음')
        lb, d, nT = st.get('lb'), st.get('d'), st.get('nTrain')
    else:
        use, qq = fresh, q
        lb = round(float(ws['lb'][q]), 3) if q is not None else None
        d = round(float(ws['d'][q]), 3) if q is not None else None
        nT = int(ws['n'][q]) if q is not None else None
    end = firsts[k + 1] - 1 if k + 1 < len(firsts) else N - 1
    days = [t for t in range(s, end + 1) if T0 <= t <= TL]
    n = h = pd_ = 0
    for t in days:
        if qq is not None:
            nt = int(NC[qq, t])
            n += nt
            h += int(HC[qq, t])
            pd_ += 1 if nt > 0 else 0
    nb = int(sum(nb_d[t] for t in days))
    hb = int(sum(hb_d[t] for t in days))
    complete = k + 1 < len(firsts) and end <= TL
    rec = {'month': month, 's': D[s], 'id': use, 'fresh': fresh, 'sealed': sealed, 'trainDays': int(e - T0 + 1), 'elig': int(ws['elig'].sum()),
           'lb': lb, 'd': d, 'nTrain': nT,
           'record': {'n': n, 'h': h, 'nb': nb, 'hb': hb, 'days': len(days), 'pickDays': pd_, 'complete': bool(complete)}}
    months.append(rec)
    for key, v in (('n', n), ('h', h), ('nb', nb), ('hb', hb)):
        tot[key] += v
    log('달', month, use, '(새로 셈', fresh, ')' if use != fresh else '', 'n', n, 'h', h)

# ── 오늘(마지막 날 T) 고른 회사 · 회사마다 지난 기록(달마다 결정으로 고른 날 · 그중 꽃) — 사이트 엔진과 맞대기 ──
#   날 t 의 조건 = t 가 든 달의 결정 · 결정이 없는 달(자료 끝 달이 아직 결정 전)은 가장 최근 결정을 이어 씀(spec v2 §6)
import numpy as np  # noqa: E402

ATOM_FULL, ATOMS = NS['ATOM_FULL'], NS['ATOMS']
SPROUT, BASEM, FLOWER, codes = NS['SPROUT'], NS['BASEM'], NS['FLOWER'], NS['codes']
AIDX = {a['id']: k for k, a in enumerate(ATOMS)}


def mask_of(cid):
    parts = cid.split('&')
    m = ATOM_FULL[AIDX[parts[0]]].copy()
    for p in parts[1:]:
        m &= ATOM_FULL[AIDX[p]]
    return m


plan = {m['month']: m['id'] for m in months}
PICK = np.zeros(SPROUT.shape, bool)
masks, carry, first = {}, None, months[0]['month'] if months else None
for t in range(N):
    mo = D[t][:7]
    if first is None or mo < first:
        continue
    cid = plan[mo] if mo in plan else carry
    if mo in plan:
        carry = plan[mo]
    if not cid:
        continue
    if cid not in masks:
        masks[cid] = mask_of(cid)
    PICK[t] = SPROUT[t] & masks[cid][t]
T = N - 1
todayRows = sorted(codes[j] for j in np.nonzero(PICK[T])[0])
past = {}
for c in todayRows:
    j = codes.index(c)
    sl = slice(T0, TL + 1)
    past[c] = [int(np.sum(PICK[sl, j] & BASEM[sl, j])), int(np.sum(PICK[sl, j] & BASEM[sl, j] & FLOWER[sl, j]))]
todayMonth = D[T][:7]
today = {'date': D[T], 'month': todayMonth, 'id': plan.get(todayMonth, carry), 'carry': todayMonth not in plan, 'rows': todayRows, 'past': past}
log('오늘', D[T], today['id'], '고른 회사', len(todayRows))

res = {'schema': 'dori-bloom-month-1', 'spec': 'docs/design/self-evolve-2026-11-02/spec.md v2', 'root': ROOT, 'asOf': D[-1], 'tl': D[TL], 'days': N,
       'sealFrom': SEAL_FROM, 'stored': STORED, 'months': months, 'totals': tot, 'today': today, 'seconds': round(time.time() - T_START, 1)}
txt = json.dumps(res, ensure_ascii=False, indent=1)
if OUT:
    open(OUT, 'w', encoding='utf8').write(txt + '\n')
log('끝 · 달', len(months), '· 모두 n', tot['n'], 'h', tot['h'])
