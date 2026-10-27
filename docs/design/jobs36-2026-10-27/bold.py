# 대범한 잡스 판 — 쪽마다 주인공 하나 크게 · 그림 하나 · 누를 단추 하나 · 나머지는 「자세히」 · 백팔십 판 놓아 점수로 하나
# 사장님 2026-10-27 14:33 「조금 조금 소심하게 만하지 말고 대범하게 하라고 … 각각 1개당 180번 … 36개 … 목업형태로 먼저」
import json, re, random, itertools
B = json.load(open('blocks3.json'))
RULES = [('nav', r'th-pg|th-chnav|sbar'), ('next', r'th-next|th-foot|ppast-nx'), ('tail', r'st-abs|th-safe|^p\.safe|kk-box|kk-pgrow|ppast-foot|th-asof|ppast-src'),
         ('fold', r'^details|hd-fold'), ('title', r'^h1|th-hd|jh-head'), ('head', r'^h2\.sec|^h2\.th-h2'), ('search', r'^div\.find'),
         ('answer', r'th-chend|th-pkhome|th-ans|ppast-now|ppast-won|th-pkrec1|th-rec|ppast-fin|gf-vow|c-lead'),
         ('main', r'th-days|th-pkis|^section\.hd|^section\.wy$|^section\.wy\.|gm-box|gm-sum|th-two|hp-note|th-wl|ptoday|^nav\.dm'),
         ('picture', r'^svg|th-map|th-zones|ppast-chart|jh-rail|^img|th-rbs|th-dots|th-bars|th-line|^ol\.wc|^section\.wc'),
         ('action', r'th-ck|th-keep|th-hi|^a\.more|th-more|th-gorow|s-apps|th-why|th-found|jh-what|gf-now|dm-it|hp-door|gf-pn'),
         ('say', r'th-say|w-say|^p\.ws|hp-voice|jh-ess|gf-lead'),
         ('list', r'th-list|th-rows|th-als|^div\.lst|hits|th-grp|ptoday-sec|^section\.sh|chan|th-ch|s-story|gm-sec|gf-steps|th-steps|wy-me|cp-card|chaps|ppast-key|ppast-trio|th-box|gm-prize'),
         ('text', r'th-sub|th-cap|p\.note|p\.empty|gf-fine|ppast-lv|th-pkday|^p\.')]
HERO_W = {'answer': 1.0, 'search': 1.0, 'main': 0.95, 'picture': 0.85, 'list': 0.75, 'say': 0.5, 'action': 0.6, 'other': 0.5}
VAL = {'answer': 9.5, 'main': 9.1, 'search': 9.5, 'picture': 8.9, 'action': 7.5, 'next': 7.5, 'list': 6.6, 'say': 5.9, 'text': 3.6, 'head': 3.5, 'other': 5.0}
def kind(b):
    key = b['tag'] + '.' + b['cls']
    for k, rx in RULES:
        if re.search(rx, key): return k
    if b['pic']: return 'picture'
    if b['isA'] or (b['links'] == 1 and b['h'] < 70): return 'action'
    return 'other'
FOLD_Y = 760  # 390×844 에서 아래 단추 줄을 뺀 첫 화면 끝
res = []
for p in B:
    bl = p['blocks']; ks = [kind(b) for b in bl]; n = len(bl)
    pre = [i for i in range(min(3, n)) if ks[i] in ('nav', 'title') or (ks[i] == 'say' and i > 0 and ks[i - 1] == 'title')]
    bottom = [i for i in range(n) if ks[i] == 'tail' and re.search(r'safe|kk-pgrow|st-abs', bl[i]['cls'] + bl[i]['tag'])]
    body = [i for i in range(n) if i not in pre and i not in bottom]
    force_hero = force_sec = None
    if p['hs'] == '#/jinhwa': force_hero = next((i for i in body if 'jh-ess' in bl[i]['cls']), None)
    if p['hs'] == '#/me': force_sec = next((i for i in body if 'hd-fold' in bl[i]['cls']), None)
    if p['hs'] == '#/sub': force_sec = next((i for i in body if bl[i]['cls'].startswith('note')), None)
    huge = [i for i in body if bl[i]['h'] > 900 and ks[i] in ('main', 'list', 'picture', 'other')]  # 아주 긴 본문(달력 · 오늘 장 · 장 이야기)은 접지 않고 단추 밑에 그대로
    cand_hero = sorted([i for i in body if ks[i] in HERO_W and i not in huge], key=lambda i: (-(HERO_W[ks[i]] + (0.2 if re.search(r'th-map|th-zones', bl[i]['cls']) else 0)), i))[:3] or [None]
    first_imp = next((i for i in body if ks[i] in ('main', 'answer', 'list', 'picture', 'search')), None)
    if first_imp is not None and first_imp in huge: cand_hero = [None]  # 가장 앞 중요한 칸이 아주 길면 주인공을 따로 뽑지 않고 그 칸을 맨 앞에
    if p['hs'] == '#/t/picks': cand_hero = [next(i for i in body if 'th-pkis' in bl[i]['cls'])]  # 꽃 될 회사 = 회사 목록이 주인공
    if p['hs'] == '#/t/how': cand_hero = [next(i for i in body if 'th-map' in bl[i]['cls'])]  # 시계 읽는 법 = 시계 그림이 주인공
    if p['hs'] == '#/': cand_hero = [next(i for i in body if 'th-zones' in bl[i]['cls'])]  # 첫 화면 = 돌 시계가 주인공(00:17 한 화면 판 그대로)
    if force_hero is not None: cand_hero = [force_hero]
    cand_vis = [i for i in body if ks[i] == 'picture' and i not in huge][:2] + [i for i in body if ks[i] == 'list' and bl[i]['pic'] and bl[i]['h'] < 520 and i not in huge][:1]  # 그림 칸 · 그림 든 목록(맨 앞 셋 같은 카드)
    cand_act = ([i for i in body if ks[i] == 'next'] + [i for i in body if ks[i] == 'action'])[:3] or [None]
    rnd = random.Random(p['no'] * 104729); seen = set(); cands = []
    ZOOMS = (1.0, 1.05, 1.1, 1.12, 1.15, 1.18, 1.2) if p['hs'] == '#/' else (1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8)  # 첫 화면은 네 단추 한 화면(00:17) — 시계는 거의 그대로
    combos = list(itertools.product(cand_hero, cand_vis + [None], cand_act, (0, 1, 2), ZOOMS, (0, 1, 2), (0, 1, 2)))
    rnd.shuffle(combos)
    for c in combos:
        h, v, a, ns, z, card, hide = c
        if v is not None and v == h: continue
        if hide == 2 and any('jh-ess' in bl[i]['cls'] for i in pre): continue  # 진화 본질 줄은 접지 않음
        key = c
        if key in seen: continue
        seen.add(key); cands.append(c)
        if len(cands) == 180: break
    def score(c):
        h, v, a, ns, z, card, hide = c
        used = {x for x in (h, v, a, force_sec) if x is not None}
        sec = ([force_sec] if force_sec is not None and force_sec != h else []) + [i for i in huge if i not in used]
        rest = sorted([i for i in body if i not in used and i not in huge and ks[i] not in ('tail', 'fold', 'nav')], key=lambda i: (-VAL.get(ks[i], 5), i))
        sec += rest[:ns]
        y = p['rootTop'] + sum(bl[i]['h'] for i in pre if not (hide == 2 and ks[i] == 'say'))
        zz = 1.0 if (h is not None and ks[h] == 'picture') else z  # 그림 주인공은 이미 꽉 찬 폭 — 키우지 않음
        if h is not None and ks[h] in ('main', 'list') and bl[h]['h'] > 300: zz = 1.0  # 긴 목록 주인공은 키우지 않음
        hh = (bl[h]['h'] * zz if h is not None else 0) + (34 if card == 1 else 0); vh = (bl[v]['h'] if v is not None else 0); ah = (bl[a]['h'] * 1.15 if a is not None else 0); sh = sum(bl[i]['h'] for i in sec)
        first_end = y + hh + 16 + vh + 16 + ah + 16 + sh
        hero_in = h is not None and y + hh <= FOLD_Y; vis_in = v is not None and y + hh + vh <= FOLD_Y + 60; act_in = a is not None and y + hh + vh + ah + 32 <= FOLD_Y
        focus = (HERO_W.get(ks[h], 0.3) * (1 - 0.15 * cand_hero.index(h))) if h is not None else 0.3  # 앞 차례 주인공 후보일수록 더 중요
        visual = 1.0 if vis_in else (0.8 if h is not None and ks[h] == 'picture' and hero_in else 0)
        action = 1.0 if act_in else (0.4 if a is not None else 0)
        simple = max(0, 1 - 0.22 * len([i for i in sec if i not in huge]))
        fe = first_end - sum(bl[i]['h'] for i in huge if i in sec)
        fit = 1.0 if fe <= FOLD_Y + 40 else max(0, 1 - (fe - FOLD_Y - 40) / 700)
        big = (1.0 if (h is not None and ks[h] == 'picture' and hero_in) else min(1, max(0, (z - 1.0) / 0.6)) * (1.0 if hero_in else 0)) - (0.5 if zz > 1.6 and hh > 260 else 0)
        shown = {x for x in (h, v) if x is not None} | set(sec)
        content = next((i for i in body if ks[i] in ('list', 'main') and i not in huge and i != h), None)
        lost = (12 if (first_imp is not None and first_imp not in shown and first_imp not in huge) else 0) + (8 if (content is not None and content not in shown) else 0)  # 본문 목록도 첫 화면 가까이  # 쪽의 본문(첫 중요한 칸)이 첫 화면에서 사라지면 깎음
        must = -50 if (p['hs'] == '#/' and not act_in) else 0  # 첫 화면 네 단추는 한 화면(00:17)
        tot = -lost + must + 30 * focus * (1 if hero_in else 0.5) + 20 * visual + 15 * action + 15 * simple + 12 * fit + 6 * big + (1 if card else 0) + (1 if hide else 0) + (0.5 if a is not None and ks[a] == 'next' else 0)
        return round(tot, 2), sec
    sc = [(score(c), c) for c in cands]
    (best, sec), c = max(sc, key=lambda t: t[0][0])
    h, v, a, ns, z, card, hide = c
    if h is not None and (ks[h] == 'picture' or (ks[h] in ('main', 'list') and bl[h]['h'] > 300)): z = 1.0
    if h is None and first_imp is not None and first_imp in huge and first_imp not in sec: sec = [first_imp] + sec
    res.append({'no': p['no'], 'hs': p['hs'], 'name': p['name'], 'tried': len(cands), 'best': best, 'worst': min(s[0][0] for s in sc),
                'pre': pre, 'hero': h, 'visual': v, 'action': a, 'sec': sec, 'zoom': z, 'card': card, 'hide': hide, 'bottom': bottom,
                'heroKind': ks[h] if h is not None else None, 'huge': huge, 'stick': force_sec, 'heroText': bl[h]['text'][:40] if h is not None else '', 'visText': (bl[v]['cls'] if v is not None else ''),
                'actText': bl[a]['text'][:30] if a is not None else '', 'nBlocks': n, 'folded': len([i for i in body if i not in {x for x in (h, v, a) if x is not None} and i not in sec])})
json.dump(res, open('bold.json', 'w'), ensure_ascii=False, indent=1)
for r in res: print(r['no'], r['name'], '판', r['tried'], '점수', r['best'], '주인공', r['heroKind'], '|', r['heroText'][:22], '| 그림', r['visText'][:14], '| 단추', r['actText'][:14], '| 크기', r['zoom'], '| 접음', r['folded'])
