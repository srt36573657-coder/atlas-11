#!/usr/bin/env python3
"""회사 성장 이야기 뼈대(구글팀 몫 — 숫자만) — 365곳마다 지금 살림과 같은 업종 안 크기를 센다.
사장님 2026-10-11 16:51 「그 3년 5년 10년 후 그렇게 하고 또 이걸 추가해줘. 그 회사들이 경쟁 회사가 어떻게 되고 있는데 뭐 1년 후 독점 회사면
독보적으로 끌 것이다. 아니 경쟁이 많아가지고 좀 그럴 것이다. 뭐 이런 식의 상식적인 얘기로 미래 추론을 해라 … 주가를 … 하라는 얘기가 아니라
회사의 성장을 얘기 하란 얘기야 … Google 팀 Apple 팀 클로드 팀 … 정말 현실적으로 … 너무 보수적으로도 하지 말고 너무 긍정적으로 … 담백하게」
16:56 「3번」(365곳 모두 깊게) · 16:57 「이건 봉인하지마」(이 이야기는 봉인하지 않음 — 새 소식이 나오면 새 파일로 고쳐 씀)

셈(여기서 한 번만 · 화면과 이야기 쓰는 팀은 이 숫자를 읽기만):
  살림 = 네이버 증권 연간 결산(모음 날 값) — 매출 · 영업이익 · 순이익(억 원) · 부채비율 · ROE · 다음 해 증권사 평균치(E · 있으면)
  같은 업종 = ATLAS 업종 이름(ind_all.mjs — 후보 1,378곳 모두 · 365곳과 같은 셈 group365Of)이 같은 회사들 · 크기 = 마지막 결산 해 매출(금융처럼 매출이 없으면 순이익)
    차례 = 업종 안 매출 큰 순 · 몫 = 이 회사 매출 ÷ 업종 매출 합(우리나라 상장 후보 안에서만 — 나라 밖 경쟁 회사는 세지 않음)
    비슷한 크기 = 매출이 이 회사의 0.5배 ~ 2배인 다른 회사 수 · 1등과 2등 차이 = 1등 매출 ÷ 2등 매출
  네이버 같은 업종 회사 = 모음의 네이버 「동일업종 비교」 이름(그쪽이 고른 이웃 · 우리 셈과 다를 수 있음)
쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/grow.py <now.json(dump.mjs)> <자료 폴더 = site/atlas/data> <나갈 파일>
"""
import gzip, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))


def die(m):
    sys.exit('grow: ' + m)


def last_actual(fin):
    """마지막 실제 결산 해(E 아님) 열쇠 — 예: '2025.12'"""
    ps = [p for p in fin.get('periods', []) if not p.endswith('E')]
    return ps[-1] if ps else None


def series(fin, key):
    return [fin.get(key, {}).get(p) for p in fin.get('periods', [])]


def size_of(row):
    """업종 안 크기 — 마지막 결산 해 매출(없으면 순이익 · 그것도 없으면 None)"""
    fin = row.get('fin') or {}
    y = last_actual(fin)
    if not y:
        return None, None
    rev = (fin.get('rev') or {}).get(y)
    if rev:
        return rev, 'rev'
    net = (fin.get('net') or {}).get(y)
    return (net, 'net') if net else (None, None)


def naver_peers(bundle, code):
    s = (bundle.get('stocks') or {}).get(code) or {}
    t = (s.get('integration') or {}).get('text')
    if not t:
        return []
    try:
        j = json.loads(t)
    except ValueError:
        return []
    out = []
    for p in j.get('industryCompareInfo') or []:
        if p.get('itemCode') != code and p.get('stockName'):
            out.append({'c': p.get('itemCode'), 'n': p.get('stockName')})
    return out[:6]


def build(now, names, comp, bundle, ind_of):
    rows = {r['code']: r for r in now['rows']}
    nm = {r['c']: r['n'] for r in names['rows']}
    for code, c in comp['companies'].items():  # 365곳 업종은 화면과 같아야 함(같은 셈 · 다르면 멈춤)
        if ind_of.get(code) != c['i']:
            die('업종이 다름 %s %s: 화면 %s · 다시 셈 %s' % (code, c['name'], c['i'], ind_of.get(code)))
    by_ind = {}
    for code, i in ind_of.items():
        r = rows.get(code)
        if not r:
            continue
        v, kind = size_of(r)
        if v is None or v <= 0:
            continue
        by_ind.setdefault(i, []).append((code, v, kind))
    out = {}
    for code, c in comp['companies'].items():
        r = rows.get(code)
        if not r:
            die('후보 표에 없는 회사 ' + code)
        fin = r.get('fin') or {}
        periods = fin.get('periods', [])
        me, kind = size_of(r)
        peers = sorted(by_ind.get(c['i'], []), key=lambda x: -x[1])
        tot = sum(v for _, v, k in peers if k == kind) if kind else 0
        rank = next((k + 1 for k, (cc, _, _) in enumerate(peers) if cc == code), None)
        near = sum(1 for cc, v, k in peers if cc != code and k == kind and me and 0.5 * me <= v <= 2 * me)
        top = [{'c': cc, 'n': nm.get(cc, cc), 'v': v} for cc, v, k in peers[:5] if k == kind]
        gap12 = round(peers[0][1] / peers[1][1], 2) if len(peers) >= 2 and peers[1][1] > 0 else None
        out[code] = {
            'n': c['name'], 'i': c['i'], 'g': c['g'], 'products': c.get('products'),
            'cap': c.get('cap'), 'per': c.get('per'),
            'fin': {'periods': periods, 'rev': series(fin, 'rev'), 'op': series(fin, 'op'), 'net': series(fin, 'net'),
                    'debt': series(fin, 'debt'), 'roe': series(fin, 'roe')},
            'ind': {'name': c['i'], 'n': len(peers), 'rank': rank, 'size': kind, 'me': me,  # me = 이 회사 크기(5단 막대 「이 회사」 줄 · 2026-10-12)
                    'share': round(me / tot * 100, 1) if me and tot else None, 'near': near, 'gap12': gap12, 'top': top},
            'naver': naver_peers(bundle, code),
        }
    return out


# ── 화면 몫(site_build.py ⑤ 가 부름) — 이야기 기록(grow_merge.py) + 위 숫자 → co/<번호>.json 의 grow · grow.json 요약 ──
HS = ('1', '3', '5', '10')
GRADES = ('아주 높다', '높다', '반반', '낮다', '아주 낮다')


def grade(lo, hi):
    """「그때 2025년보다 커져 있을까요?」 말 등급 — 범위(lo~hi · 배수)에서 1 위쪽이 차지하는 몫(로그 눈금 · 범위 안을 고르게 본다고 가정)
    0.9 이상 아주 높다 · 0.65 이상 높다 · 0.35 이상 반반 · 0.1 이상 낮다 · 그 밑 아주 낮다 · 범위가 없으면 None"""
    if lo is None or hi is None:
        return None
    if lo >= 1:
        f = 1.0
    elif hi <= 1:
        f = 0.0
    else:
        import math
        f = math.log(hi) / (math.log(hi) - math.log(lo))
    return GRADES[0] if f >= 0.9 else GRADES[1] if f >= 0.65 else GRADES[2] if f >= 0.35 else GRADES[3] if f >= 0.1 else GRADES[4]


def latest_stories(d):
    """reports/atlas11/t365/grow/stories-*.json — 회사마다 가장 새 파일의 이야기(파일 이름 = UTC 때 · 차례대로 덮음)"""
    out = {}
    if not os.path.isdir(d):
        return out
    for fn in sorted(f for f in os.listdir(d) if f.startswith('stories-') and f.endswith('.json')):
        rec = json.load(open(os.path.join(d, fn), encoding='utf-8'))
        for code, st_ in rec['companies'].items():
            out[code] = dict(st_, file='reports/atlas11/t365/grow/' + fn, made=rec['made'])
    return out


def site_entry(b, st_):
    """회사 하나의 화면 자료 — 숫자(b · build() 한 줄) + 이야기(st_ · 없으면 None)"""
    f = b['fin']
    yrs = [p[:4] + ('E' if p.endswith('E') else '') for p in f['periods']]
    act = [k for k, p in enumerate(f['periods']) if not p.endswith('E')]
    by = act[-1] if act else None
    base = f['rev'][by] if by is not None else None
    e = {'years': yrs, 'rev': f['rev'], 'baseYear': yrs[by] if by is not None else None, 'baseRev': base,
         'ind': {k: b['ind'][k] for k in ('name', 'n', 'rank', 'share', 'near', 'gap12', 'size', 'me')}, 'top': [[t['n'], t['v'], t['c']] for t in b['ind']['top']],
         'story': None}
    if st_:
        j, r = st_['judge'], st_['research']
        hs = {}
        for h in HS:
            x = (j.get('h') or {}).get(h) or {}
            hs[h] = {'lo': x.get('lo'), 'mid': x.get('mid'), 'hi': x.get('hi'), 't': x.get('t'), 'g': grade(x.get('lo'), x.get('hi'))}
        keep = set(j.get('keep') or [])
        rivals = [rv for rv in (r.get('rivals') or []) if rv.get('name') in keep] or (r.get('rivals') or [])[:3]
        e['story'] = {'shape': j.get('shape'), 'h': hs, 'brk': j.get('brk'), 'teams': j.get('teams'), 'rivals': rivals,
                      'sells': r.get('sells'), 'why': r.get('why_pick'), 'market': r.get('market'), 'events': r.get('events'),
                      'facts': r.get('facts') or [], 'unknown': r.get('unknown'), 'webFacts': st_.get('webFacts', 0), 'file': st_['file'], 'made': st_['made'][:10]}
    return e


if __name__ == '__main__':
    if len(sys.argv) != 4:
        die('쓰는 법 python3 scripts/atlas11/t365/grow.py <now.json> <site/atlas/data> <나갈 파일>')
    NOW, DATA, OUT = sys.argv[1:]
    now = json.load(open(NOW, encoding='utf-8'))
    names = json.load(open(os.path.join(DATA, 'names.json'), encoding='utf-8'))
    comp = json.load(open(os.path.join(DATA, 'comp.json'), encoding='utf-8'))
    if comp['asOf'] != now['asOf']:
        die('comp.json(%s) 과 후보 표(%s) 날이 다름' % (comp['asOf'], now['asOf']))
    act = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
    bundle = json.load(gzip.open(os.path.join(ROOT, act['bundle']), 'rt', encoding='utf-8'))
    ind_of = json.loads(subprocess.run(['node', os.path.join(HERE, 'ind_all.mjs'), NOW], check=True, capture_output=True, text=True).stdout)
    res = {'schema': 'atlas-new-grow-base-1', 'asOf': now['asOf'], 'collected': now['collectedAt'], 'n': 0, 'companies': build(now, names, comp, bundle, ind_of)}
    res['n'] = len(res['companies'])
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('grow: %d곳 → %s' % (res['n'], OUT))
