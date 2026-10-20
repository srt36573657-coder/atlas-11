"""우주 돌이 시험판 자료 — 저장소의 지난 기록(10월 13일 판)에서 화면이 쓰는 것만 추림. 읽기만 함."""
import json, sys, os
R = sys.argv[1]  # 저장소 뿌리
OUT = sys.argv[2]
J = lambda p: json.load(open(os.path.join(R, p), encoding='utf-8'))
th = J('site/next/data/theme.json'); tm = J('site/next/data/theme-more.json'); days = J('site/atlas/data/days.json')
names = J('site/atlas/data/names.json') if os.path.exists(os.path.join(R, 'site/atlas/data/names.json')) else {}
dates = days['dates']; N = len(dates); W = 250; S0 = N - W
inds = {}
for i in th['inds']:
    inds[i['n']] = {k: i.get(k) for k in ('z', 'x', 'y', 'd', 't', 'tz', 'dots', 'sc', 'up', 'tot', 'bigAvg', 'm10', 'gn')}
more = {}
codes = set()
for n, e in tm['inds'].items():
    big = [[x['c'], x['n'], x.get('d10'), x.get('l')] for x in e.get('big', [])]
    top = [[x['c'], x['n'], x.get('d10'), x.get('l')] for x in e.get('top', [])]
    more[n] = {'big': big, 'top': top, 'ranked': e.get('ranked')}
    for x in big + top: codes.add(x[0])
co = {}
for c in sorted(codes):
    x = J(f'site/atlas/data/co/{c}.json')
    k0 = x.get('k0') or 0; cl = x['close']
    full = [None] * N
    for j, v in enumerate(cl):
        if 0 <= k0 + j < N: full[k0 + j] = v
    win = full[S0:]
    first = next((j for j, v in enumerate(win) if v), None)
    if first is None: continue
    seg = win[first:]
    # 하루 변화(튄 날 35% 넘게는 뺌 — 나눔 · 합침 · 자료 잘못)
    up1 = dn1 = 0.0; big5 = 0; jumps = 0; d_up = d_dn = None
    for j in range(1, len(seg)):
        p, q = seg[j - 1], seg[j]
        if not p or not q: continue
        r = q / p - 1
        if abs(r) >= 0.35: jumps += 1; continue
        if r > up1: up1 = r; d_up = dates[S0 + first + j]
        if r < dn1: dn1 = r; d_dn = dates[S0 + first + j]
        if abs(r) >= 0.05: big5 += 1
    # 가장 깊이 빠짐(튄 날이 있으면 셈하지 않음)
    peak = None; mdd = 0.0
    if not jumps:
        for v in seg:
            if not v: continue
            peak = v if peak is None or v > peak else peak
            mdd = min(mdd, v / peak - 1)
    hi = max(v for v in seg if v); lo = min(v for v in seg if v)
    hi_d = dates[S0 + first + seg.index(hi)]; lo_d = dates[S0 + first + seg.index(lo)]
    step = 2
    idx = list(range(0, len(seg), step))
    if idx[-1] != len(seg) - 1: idx.append(len(seg) - 1)
    raw = []
    last = None
    for j in idx:
        v = seg[j] or last
        raw.append(v); last = v
    span = (hi - lo) or 1
    line = [round((v - lo) / span * 999) for v in raw]  # 0 ~ 999 (가장 낮을 때 0 · 높을 때 999)
    cc = x.get('c') or {}
    fin = x.get('fin') or {}
    g = x.get('grow') or {}
    gi = g.get('ind') or {}
    co[c] = {
        'n': cc.get('name') or names.get(c) or next((m[1] for e in more.values() for m in e['big'] + e['top'] if m[0] == c), c),
        'i': cc.get('i'), 'prod': cc.get('products'), 'mk': cc.get('market'), 'cap': cc.get('cap'),
        'price': cc.get('price'), 'pd': cc.get('priceDate'),
        'from': dates[S0 + first], 'to': dates[N - 1], 'full': first == 0,
        'line': line, 'f0': seg[0], 'f1': seg[-1], 'hi': [hi, hi_d], 'lo': [lo, lo_d],
        'chg': round((seg[-1] / seg[0] - 1) * 100, 1),
        'mdd': None if jumps else round(mdd * 100, 1),
        'up1': [round(up1 * 100, 1), d_up], 'dn1': [round(dn1 * 100, 1), d_dn], 'big5': big5, 'days': len(seg) - 1, 'jumps': jumps,
        'fin': {'y': fin.get('years'), 'rev': fin.get('rev'), 'op': fin.get('op'), 'net': fin.get('net')} if fin.get('years') else None,
        'rank': gi.get('rank'), 'of': gi.get('n'), 'me': gi.get('me'), 'riv': g.get('top'), 'by': g.get('baseYear'),
    }
R0 = th['record']
data = {'asOf': th['asOf'], 'made': th['made'], 'recFrom': th['recFrom'], 'recTo': th['recTo'], 'count': th['count'], 'order': th['order'],
        'rec': {'all': R0['all']['p'], 'real': R0['real']['p'], 'nReal': R0['real']['n'], 'more': R0.get('more')},
        'groups': th['groups'], 'inds': inds, 'more': more, 'co': co}
s = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
open(OUT, 'w', encoding='utf-8').write(s)
print('inds', len(inds), 'co', len(co), 'bytes', len(s.encode('utf-8')))
