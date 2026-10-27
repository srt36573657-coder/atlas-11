# 잡스 판 — 쪽마다 칸 차례를 백팔십 번 놓아 보고 「직관 · 중요」 점수로 하나를 고름
# 잣대(잡스 셋): ① 가장 중요한 것 하나를 맨 앞에(초점) ② 그림이 글보다 먼저(직관) ③ 다음 할 일 하나를 첫 화면에(누를 곳 하나)
#               + 덜 중요한 글은 접어 첫 화면을 비움(단순) + 지금 차례를 이유 없이 흔들지 않음(익숙함)
import json, random, re, itertools, sys
B = json.load(open('blocks2.json'))
FOLD_Y = 700  # 첫 화면 끝(아래 단추 줄과 위 줄을 뺀 높이 · 390×844)
RULES = [  # (꼴, 틀)
    ('nav', r'th-pg|th-chnav|sbar'), ('next', r'th-next|th-foot|ppast-nx'), ('tail2', r'st-abs'), ('title', r'^h1|th-hd|jh-head'), ('tail', r'th-safe|^p\.safe|kk-box|kk-pgrow|ppast-foot|th-asof|ppast-src'),
    ('fold', r'^details|hd-fold'), ('head', r'^h2\.sec|^h2\.th-h2'),
    ('search', r'^div\.find'), ('answer', r'th-chend|th-pkhome|th-ans|ppast-now|ppast-won|th-pkrec1|th-rec|ppast-fin|gf-vow|c-lead'),
    ('main', r'th-days|th-pkis|^section\.hd|^section\.wy$|^section\.wy\.|gm-box|gm-sum|th-two|hp-note|th-wl'),
    ('picture', r'^svg|th-map|th-zones|ppast-chart|ppast-seg|th-days|jh-rail|^img|th-rbs|th-dots|th-bars|th-line'),
    ('action', r'th-ck|th-keep|th-hi|^a\.more|th-more|th-pkhome|th-gorow|s-apps|th-why|th-found|jh-what|gf-now|ppast-nx|dm-it|hp-door|hp-doors|gf-pn'),
    ('say', r'th-say|w-say|^p\.ws|hp-voice|jh-ess|gf-lead'),
    ('list', r'th-list|th-rows|th-pkis|th-als|^div\.lst|hits|th-grp|ptoday-sec|^section\.sh|chan|th-ch|s-story|gm-sec|gf-steps|th-steps|wy-me|cp-card|chaps|ppast-key|ppast-trio|th-box|gm-prize'),
    ('text', r'th-sub|th-cap|p\.note|p\.empty|gf-fine|ppast-lv|th-pkday|^p\.'),
]
VAL = {'answer': (10, 9), 'main': (10, 8), 'search': (10, 9), 'picture': (8, 10), 'action': (7, 8), 'list': (7, 6), 'say': (5, 7), 'text': (4, 3), 'head': (3, 4), 'other': (5, 5), 'next': (7, 8), 'tail2': (1, 1), 'nav': (3, 5), 'title': (9, 9), 'tail': (3, 2), 'fold': (3, 3)}
NAME = {'next': '다음 단추', 'tail2': '떠 있는 그림', 'nav': '앞 쪽 줄', 'title': '제목', 'tail': '끝 줄', 'fold': '접힌 칸', 'head': '작은 제목', 'search': '찾기 칸', 'answer': '결론 한 줄', 'main': '큰 칸',
        'picture': '그림', 'action': '누를 곳', 'say': '돌이 말', 'list': '목록', 'text': '설명 글', 'other': '칸'}
def kind(b):
    key = b['tag'] + '.' + b['cls']
    for k, rx in RULES:
        if re.search(rx, key): return k
    if b['pic']: return 'picture'
    if b['isA'] or b['links'] == 1 and b['h'] < 70: return 'action'
    return 'other'
v = lambda k: 0.55 * VAL[k][0] + 0.45 * VAL[k][1]
def units(bl):  # 작은 제목은 뒤따르는 설명 글과 그 다음 칸까지 한 덩이(제목만 떨어져 남지 않게)
    U, i = [], 0
    while i < len(bl):
        if bl[i]['kind'] == 'head' and i + 1 < len(bl):
            j = i + 1
            while j < len(bl) - 1 and bl[j]['kind'] == 'text': j += 1
            if bl[j]['kind'] in ('head', 'next'): j -= 1  # 다음 작은 제목 · 다음 단추는 삼키지 않음
            U.append(list(range(i, j + 1))); i = j + 1
        else: U.append([i]); i += 1
    return U
def ukind(u, bl): return bl[u[-1]]['kind']
def score(order, folded, bl, rootTop, U, useq=None):
    # useq = 실제로 놓인 칸 덩이 차례(끝 줄 포함) — 없으면 고른 차례 + 끝 줄은 맨 끝
    seq = useq if useq is not None else [U[x] for x in order] + [[t] for t in TAIL]
    vals = [v(ukind(u, bl)) for u in seq if tuple(u) not in folded]
    s1 = sum(x / (1 + 0.3 * k) for k, x in enumerate(vals)); best = sum(x / (1 + 0.3 * k) for k, x in enumerate(sorted(vals, reverse=True)))
    S1 = s1 / best if best else 1
    y, first = rootTop + sum(bl[i]['h'] for i in PRE), []
    for u in seq:
        if tuple(u) in folded: continue
        if y < FOLD_Y: first.append(ukind(u, bl))
        y += sum(bl[i]['h'] for i in u) + 12
    have = {k: any(k2 == k for k2 in first) for k in ('answer', 'main', 'search', 'picture', 'action', 'next')}
    can = {k: any(ukind(u, bl) == k for u in seq) for k in have}
    s2 = 0; w = 0
    for k, wt in (('answer', 3), ('main', 3), ('search', 3), ('picture', 2), ('action', 2), ('next', 1)):
        if can[k]: w += wt; s2 += wt * have[k]
    S2 = (s2 / w if w else 1) - (0.08 * max(0, len(first) - 6)) - 0.05 * sum(1 for k in first if k in ('tail', 'fold'))
    inv = sum(1 for a, b2 in itertools.combinations(order, 2) if a > b2); mx = len(order) * (len(order) - 1) / 2 or 1
    S3 = 1 - inv / mx - sum(0.032 * v(ukind(list(t), bl)) for t in folded)
    tot = 60 * S1 + 30 * max(0, S2) + 10 * max(0, S3)
    return round(tot, 2), {'중요 직관 차례': round(S1, 3), '첫 화면': round(max(0, S2), 3), '익숙함': round(max(0, S3), 3), 'first': first}
def legal(order, U, bl):  # 같은 이름 칸끼리는 지금 차례 그대로 · 다음 단추는 맨 끝
    last = {}
    for x in order:
        k = bl[U[x][-1]]['cls'].split('.')[0] or bl[U[x][-1]]['tag']
        if k in last and last[k] > x: return False
        last[k] = x
    nx = [j for j, x in enumerate(order) if ukind(U[x], bl) == 'next']
    return all(j == len(order) - 1 for j in nx) if len(nx) == 1 else True
res = []
for p in B:
    bl = p['blocks']
    for b in bl: b['kind'] = kind(b)
    global PRE
    PRE = [i for i, b in enumerate(bl) if b['kind'] in ('nav', 'title') and i <= 2]
    if PRE and PRE[-1] + 1 < len(bl) and bl[PRE[-1]]['kind'] == 'title' and bl[PRE[-1] + 1]['kind'] == 'say': PRE.append(PRE[-1] + 1)
    rest = [i for i in range(len(bl)) if i not in PRE]
    tail = [i for i in rest if bl[i]['kind'] in ('tail', 'fold', 'tail2')]
    mid = [i for i in rest if i not in tail]
    U = units([bl[i] for i in mid]); U = [[mid[j] for j in u] for u in U]
    global TAIL
    TAIL = tail
    NOWSEQ = sorted([u for u in U] + [[t] for t in tail], key=lambda u: u[0])
    textU = [tuple(u) for u in U if ukind(u, bl) in ('text', 'say') or (ukind(u, bl) in ('list', 'other') and sum(bl[i]['h'] for i in u) < 160)]
    rnd = random.Random(p['no'] * 7919)
    sub = p.get('sub'); subn = len(sub['kids']) if sub else 0
    seen, cands = set(), []
    cur = (tuple(range(len(U))), frozenset(), tuple(range(subn)))
    def add(c):
        if c in seen: return
        seen.add(c); cands.append(c)
    add(cur)
    def greedy():
        o = sorted(range(len(U)), key=lambda x: (ukind(U[x], bl) == 'next', -v(ukind(U[x], bl)), x))
        fixed, out = list(o), []
        # 같은 이름 칸 차례 맞춤 — 같은 이름끼리는 지금 차례로 다시 채움
        byk = {}
        for x in range(len(U)): byk.setdefault(bl[U[x][-1]]['cls'].split('.')[0] or bl[U[x][-1]]['tag'], []).append(x)
        it = {k: iter(xs) for k, xs in byk.items()}
        return [next(it[bl[U[x][-1]]['cls'].split('.')[0] or bl[U[x][-1]]['tag']]) for x in fixed]
    g = greedy()
    if legal(g, U, bl):
        add((tuple(g), frozenset(), tuple(range(subn))))
        add((tuple(g), frozenset(t for t in textU if ukind(list(t), bl) == 'text'), tuple(range(subn))))
    tries = 0
    while len(cands) < 180 and tries < 40000:
        tries += 1
        o = list(range(len(U))); rnd.shuffle(o)
        if not legal(o, U, bl): continue
        f = frozenset(t for t in textU if rnd.random() < 0.3)
        so = list(range(subn)); rnd.shuffle(so)
        add((tuple(o), f, tuple(so) if subn else ()))
    if len(cands) < 180:  # 칸이 적어 다른 판이 모자람 — 같은 꼴 차례 제한을 풀고 더 놓아 봄
        for o in itertools.permutations(range(len(U))):
            nxj = [j for j, x in enumerate(o) if ukind(U[x], bl) == 'next']
            if len(nxj) == 1 and nxj[0] != len(o) - 1: continue  # 다음 단추는 풀어도 맨 끝
            for r in range(len(textU) + 1):
                for f in itertools.combinations(textU, r):
                    for so in (itertools.permutations(range(subn)) if subn else [()]):
                        add((tuple(o), frozenset(f), tuple(so)))
                        if len(cands) >= 180: break
                    if len(cands) >= 180: break
                if len(cands) >= 180: break
            if len(cands) >= 180: break
    scored = []
    for n, (o, f, so) in enumerate(cands[:180], 1):
        tot, sub_s = score(list(o), f, bl, p['rootTop'], U)
        # 안 칸(돌이 메뉴 · 연습 칸 · 고객센터 문) — 중요한 것 먼저
        if subn:
            kv = [p['sub']['kids'][i] for i in so]
            pr = {'한 달 뒤': 9, '보유종목': 8, '관심': 7, '오늘 장': 6, '시황': 5, '돌이 인사': 4, '고객센터': 3}
            sv = [next((pr[k] for k in pr if k in (x['text'] or '')), 5) for x in kv]
            ss = sum(x / (1 + 0.3 * k) for k, x in enumerate(sv)) / max(1e-9, sum(x / (1 + 0.3 * k) for k, x in enumerate(sorted(sv, reverse=True))))
            inv = sum(1 for a, b2 in itertools.combinations(so, 2) if a > b2); mx = subn * (subn - 1) / 2 or 1
            tot = round(0.8 * tot + 20 * (0.7 * ss + 0.3 * (1 - inv / mx)), 2)
        scored.append({'n': n, 'order': list(o), 'fold': sorted([list(t) for t in f]), 'sub': list(so), 'score': tot, 'parts': sub_s})
    rank = sorted(scored, key=lambda r: (-r['score'], r['n']))
    best, now = rank[0], scored[0]
    nowTot, nowParts = score(list(range(len(U))), frozenset(), bl, p['rootTop'], U, useq=NOWSEQ)
    if subn and now['sub'] == list(range(subn)): nowTot = round(0.8 * nowTot + (now['score'] - 0.8 * now['score'] + 0.8 * now['score'] - 0.8 * now['score']) , 2) if False else nowTot
    now = dict(now, score=nowTot, parts=nowParts) if not subn else now
    tailEnd = all(t > m for t in tail for m in mid)
    if best['n'] == 1 and not tailEnd and best['score'] <= now['score']: pass
    seq = PRE + [i for x in best['order'] for i in U[x] if tuple(U[x]) not in set(map(tuple, best['fold']))]
    foldI = [i for x in best['order'] for i in U[x] if tuple(U[x]) in set(map(tuple, best['fold']))]
    res.append({'no': p['no'], 'hs': p['hs'], 'name': p['name'], 'n': len(scored), 'distinct': len(set((tuple(s['order']), tuple(map(tuple, s['fold'])), tuple(s['sub'])) for s in scored)),
                'kinds': [b['kind'] for b in bl], 'labels': [NAME[b['kind']] for b in bl], 'texts': [b['text'][:40] for b in bl],
                'now': now['score'], 'best': best['score'], 'bestN': best['n'], 'parts': best['parts'], 'nowParts': now['parts'],
                'seq': seq, 'foldI': foldI, 'tail': tail, 'sub': best['sub'], 'top3': [(r['n'], r['score']) for r in rank[:3]], 'worst': rank[-1]['score'], 'tailEnd': tailEnd, 'same': best['n'] == 1 and tailEnd and best['sub'] == list(range(subn))})
json.dump(res, open('pick.json', 'w'), ensure_ascii=False, indent=1)
for r in res: print(r['no'], r['name'], '판', r['n'], '다름', r['distinct'], '지금', r['now'], '→ 고름', r['best'], '#', r['bestN'], '첫화면', r['parts']['first'], '접음', len(r['foldI']))
