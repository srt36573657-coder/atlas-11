#!/usr/bin/env python3
"""Independent recount of wrong 1-day forecasts.
Reads ONLY:
  A) public/data/atlas11/view/scores.json
  B) reports/atlas11/ledger/analysis/*.jsonl
"""
import json, glob, re, os, sys
from datetime import datetime
from collections import Counter, defaultdict

ROOT = '/home/claude/atlas/ATLAS'
A_PATH = os.path.join(ROOT, 'public/data/atlas11/view/scores.json')
B_GLOB = os.path.join(ROOT, 'reports/atlas11/ledger/analysis/*.jsonl')

def parse_at(s):
    s = s.replace('Z', '+00:00')
    return datetime.fromisoformat(s)

def sign(x):
    if x is None:
        return None
    return 1 if x > 0 else (-1 if x < 0 else 0)

# ---------- A ----------
A = json.load(open(A_PATH, encoding='utf-8'))
a_rows = []  # evaluated rows
for day in A['byDate']:
    d = day['date']
    for row in day['rows']:
        h = row['horizons']['1']
        if h.get('status') != 'evaluated':
            continue
        a_rows.append({'date': d, 'code': row['code'], 'name': row['name'], 'h': h})
dates = [day['date'] for day in A['byDate']]

# sanity: A targetDate / code consistency
for r in a_rows:
    if r['h'].get('targetDate') != r['date']:
        print('WARN A targetDate mismatch', r['date'], r['code'], r['h'].get('targetDate'))
    if r['h'].get('code') not in (None, r['code']):
        print('WARN A code mismatch', r['date'], r['code'], r['h'].get('code'))

# ---------- B ----------
recs = []
for p in sorted(glob.glob(B_GLOB)):
    with open(p, encoding='utf-8') as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            r['_src'] = (os.path.basename(p), i)
            recs.append(r)
superseded = {r['supersedes'] for r in recs if r.get('supersedes')}
cells = [r for r in recs
         if isinstance(r.get('body'), dict)
         and r['body'].get('kind') == 'cell'
         and r['body'].get('horizon') == 1
         and r['id'] not in superseded]
dropped_cells = [r for r in recs if isinstance(r.get('body'), dict) and r['body'].get('kind') == 'cell'
                 and r['body'].get('horizon') == 1 and r['id'] in superseded]

latest = {}
ties = []
for r in cells:
    b = r['body']
    k = (b['forecastId'], b['code'], b['targetDate'])
    t = parse_at(r['at'])
    if k not in latest or t > latest[k][0]:
        latest[k] = (t, r)
    elif t == latest[k][0]:
        ties.append(k)
# a tie only matters if it is at the latest time
real_ties = [k for k in set(ties) if sum(1 for r in cells if (r['body']['forecastId'], r['body']['code'], r['body']['targetDate']) == k and parse_at(r['at']) == latest[k][0]) > 1]

# ---------- join ----------
joined = []
unmatched = []
for r in a_rows:
    k = (r['h']['forecastId'], r['code'], r['date'])
    if k in latest:
        joined.append((r, latest[k][1]))
    else:
        unmatched.append(k)

# ---------- per-cell facts ----------
V_RE = re.compile(r'고유 몫 평균\s*([+\-−]?)\s*(\d+(?:\.\d+)?)\s*%')

def gap_of(p):
    vals = sorted([p['up'], p['flat'], p['down']], reverse=True)
    return vals[0] - vals[1]

def has_event(b):
    for hy in b.get('hypotheses') or []:
        if hy.get('category') == '기업 사건' and '기업 일정' in (hy.get('evidence') or ''):
            return True
    return False

def flow_check(b):
    dec = b.get('decomposition') or {}
    rl = dec.get('realizedLog'); mp = dec.get('marketPartLog'); ms = dec.get('marketShare')
    s_rl = sign(rl)
    a = (ms is not None and ms >= 0.5 and s_rl not in (None, 0) and sign(mp) == s_rl)
    bb = False
    for hy in b.get('hypotheses') or []:
        if hy.get('category') == '업종 변화' and hy.get('strength') in ('중', '강'):
            for m in V_RE.finditer(hy.get('evidence') or ''):
                sg, num = m.group(1), float(m.group(2))
                v = -num if sg in ('-', '−') else num
                if s_rl not in (None, 0) and sign(v) == s_rl:
                    bb = True
    return a, bb

cellinfo = []
dc_mismatch = []
for ar, br in joined:
    h = ar['h']; b = br['body']
    wrong = (h['directionCorrect'] is False)
    if b.get('directionCorrect') is not None and b.get('directionCorrect') != h['directionCorrect']:
        dc_mismatch.append((ar['date'], ar['code']))
    g = gap_of(h['probabilities'])
    fa, fb = flow_check(b)
    mc0 = (b.get('modelContribution') or [''])[0]
    cellinfo.append(dict(date=ar['date'], code=ar['code'], name=ar['name'], wrong=wrong,
                         dc=h['directionCorrect'], pred=h['predictedDirection'], obs=h['observedDirection'],
                         p=h['probabilities'], ret=h['actualReturn'], gap=g, flowA=fa, flowB=fb,
                         event=has_event(b), mc0=mc0, src=br['_src'], at=br['at']))

# global R3 condition
W = [c for c in cellinfo if c['wrong']]
R = [c for c in cellinfo if not c['wrong']]
share_w = sum(c['event'] for c in W) / len(W) if W else 0.0
share_r = sum(c['event'] for c in R) / len(R) if R else 0.0
r3_global = share_w > share_r

for c in cellinfo:
    if c['gap'] < 0.05:
        c['bin'] = 'close'
    elif c['flowA'] or c['flowB']:
        c['bin'] = 'flow'
    elif c['event'] and r3_global:
        c['bin'] = 'missed'
    else:
        c['bin'] = 'unknown'

# ---------- report ----------
out = []
P = out.append
P(f'files used: {A_PATH} ; {sorted(glob.glob(B_GLOB))}')
P(f'B records {len(recs)}; superseded ids {sorted(superseded)}; cell h1 kept {len(cells)} (dropped by supersede {len(dropped_cells)}); unique keys {len(latest)}; latest-at ties {len(real_ties)}')
P(f'A evaluated rows {len(a_rows)}; joined {len(joined)}; unmatched {len(unmatched)} {unmatched[:5]}; directionCorrect A/B mismatch {len(dc_mismatch)}')
P(f'kept ledger record sources: {Counter((c["src"][0], c["at"]) for c in cellinfo)}')
P('')
P('1. evaluated / wrong per day')
for d in dates:
    cs = [c for c in cellinfo if c['date'] == d]
    P(f'  {d}: evaluated {len(cs)}, wrong {sum(c["wrong"] for c in cs)}, right {sum(not c["wrong"] for c in cs)}')
P(f'  total: evaluated {len(cellinfo)}, wrong {len(W)}, right {len(R)}')
P('')
P(f'R3 global: wrong-with-event {sum(c["event"] for c in W)}/{len(W)} = {share_w:.4f} ; right-with-event {sum(c["event"] for c in R)}/{len(R)} = {share_r:.4f} ; condition {r3_global}')
P('2. bins (WRONG cells) per day: close / flow / missed / unknown')
for d in dates + ['total']:
    cs = [c for c in W if d == 'total' or c['date'] == d]
    cnt = Counter(c['bin'] for c in cs)
    P(f'  {d}: close {cnt["close"]} / flow {cnt["flow"]} / missed {cnt["missed"]} / unknown {cnt["unknown"]}  (n={len(cs)})')
P('   same bins over ALL evaluated cells:')
for d in dates + ['total']:
    cs = [c for c in cellinfo if d == 'total' or c['date'] == d]
    cnt = Counter(c['bin'] for c in cs)
    P(f'  {d}: close {cnt["close"]} / flow {cnt["flow"]} / missed {cnt["missed"]} / unknown {cnt["unknown"]}  (n={len(cs)})')
fl = [c for c in W if c['bin'] == 'flow']
P(f'   wrong flow via (a) only {sum(c["flowA"] and not c["flowB"] for c in fl)}, (b) only {sum(c["flowB"] and not c["flowA"] for c in fl)}, both {sum(c["flowA"] and c["flowB"] for c in fl)}')
P('')
P('3. gap split')
for d in dates + ['total']:
    cs = [c for c in cellinfo if d == 'total' or c['date'] == d]
    lo = [c for c in cs if c['gap'] < 0.05]; hi = [c for c in cs if c['gap'] >= 0.05]
    P(f'  {d}: gap<0.05 {len(lo)} (right {sum(not c["wrong"] for c in lo)}) ; gap>=0.05 {len(hi)} (right {sum(not c["wrong"] for c in hi)})')
P('')
P('4. directions (both days)')
P(f'  predicted: {Counter(c["pred"] for c in cellinfo)}')
P(f'  observed: {Counter(c["obs"] for c in cellinfo)}')
P(f'  wrong by predicted: {Counter(c["pred"] for c in W)}')
P('')
Z = [c for c in cellinfo if '기대 누적 0.00%' in c['mc0']]
P('5. zero-signal (literal "기대 누적 0.00%")')
P(f'  n {len(Z)}; predicted down {sum(c["pred"]=="down" for c in Z)}; predicted {Counter(c["pred"] for c in Z)}; right {sum(not c["wrong"] for c in Z)}; wrong {len(Z)-sum(not c["wrong"] for c in Z)}')
if Z:
    diffs = [(c['p']['down'] - c['p']['up']) * 100 for c in Z]
    P(f'  mean(p_down - p_up) = {sum(diffs)/len(diffs):.4f} pp ; min {min(diffs):.4f} max {max(diffs):.4f}')
    P(f'  per day: {Counter(c["date"] for c in Z)}')
Zp = [c for c in cellinfo if re.search(r'기대 누적 [+\-−]0\.00%', c['mc0'])]
P(f'  signed-zero variants (+0.00%/-0.00%) in joined set, NOT counted above: {len(Zp)}; right {sum(not c["wrong"] for c in Zp)}; pred {Counter(c["pred"] for c in Zp)}')
P('')
P('6. wrong cells in flow / unknown bins')
for b in ('flow', 'unknown'):
    P(f'  [{b}]')
    for c in sorted([c for c in W if c['bin'] == b], key=lambda c: (c['date'], c['code'])):
        extra = ('a' if c['flowA'] else '') + ('b' if c['flowB'] else '')
        P(f'    {c["date"]} {c["name"]} ({c["code"]}) {c["pred"]}->{c["obs"]} {c["ret"]*100:+.2f}%  gap {c["gap"]:.4f} {"via "+extra if extra else ""}')
print('\n'.join(out))

# dump per-cell table for audit
with open(os.path.join(os.path.dirname(__file__), 'cells.tsv'), 'w', encoding='utf-8') as fh:
    fh.write('date\tcode\tname\tpred\tobs\tdc\tup\tflat\tdown\tgap\tflowA\tflowB\tevent\tbin\tret\tmc0\n')
    for c in cellinfo:
        fh.write('\t'.join(str(x) for x in [c['date'], c['code'], c['name'], c['pred'], c['obs'], c['dc'], c['p']['up'], c['p']['flat'], c['p']['down'], round(c['gap'], 6), c['flowA'], c['flowB'], c['event'], c['bin'], c['ret'], c['mc0']]) + '\n')
