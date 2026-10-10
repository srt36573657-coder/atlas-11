#!/usr/bin/env python3
"""새 ATLAS 사이트 자료(aaa7377.com/atlas/) — 365곳(t365-v1) · 큰 갈래 10 · 업종 63 · 3개월 지수를 화면이 읽는 JSON 세 벌로.
사장님 2026-10-11 06:13 「aaa7377.com에 올려 … 잡스 방식이 중심이 되고 구글팀 클로드팀 cai팀 그리고 찰리 망거팀 삼성팀 들이 도와서
일반인들이 바로 알수 있고 쉽게 사용가능하며 별도에 설명이 없어도 감탄이 니오게 새로운 아틀란스를 만들어 봐라 이 토대로 말이다」

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-05-0940/bundle.json.gz <임시>/sel.json 2026-10-02   ← 고를 때 표(그대로 고르기를 다시 셈)
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz      <임시>/now.json 2026-10-08   ← 지금 값(10월 8일 종가)
  python3 scripts/atlas11/t365/site_build.py <임시>/sel.json <임시>/now.json site/atlas/data
만드는 것:
  core.json  — 날짜 64개 · 365곳 전체 · 갈래 10 · 업종 63(한 회사 한 표 지수 v · 큰 회사는 크게 지수 cw) · 고른 깔때기 · 규칙(첫 화면이 먼저 읽음)
  comp.json  — 회사 365곳 요약(선 빼고 · 첫 그림 뒤에 받음)
  lines.json — 회사마다 3개월 선(7월 6일 = 100 · 값 × 100 정수 · 값 없는 날 null)
  names.json — 1,375곳 이름 · 365곳 안/밖 · 밖이면 어느 문에서 왜(찾기 칸이 읽음)
셈(숫자는 모두 여기서 한 번만 · 화면은 보여 주기만):
  한 회사 한 표 = industry-index.json(scripts/atlas11/t365/index.mjs · 날마다 같은 무게 평균을 이어 곱함) 그대로
  큰 회사는 크게 = 7월 6일에 시가총액만큼 사 두었다면(사고 그대로 둠) — 7월 6일 몸값 = 10월 2일 몸값 × 100 ÷ 그 회사 선의 10월 2일 값
                   날마다 Σ(7월 6일 몸값 × 선 값) ÷ Σ 7월 6일 몸값 · 그날 값이 없으면 앞 값
  3개월 가장 깊이 빠짐 = 선의 꼭대기에서 가장 많이 내려간 비율 · 1년 값은 dump.mjs(px.r1y · px.mdd1y · 10월 8일까지 252거래일)
고르기 다시 셈: select.py 와 같은 문 · 같은 차례로 다시 골라 proposal.json 의 365곳과 한 곳도 다르지 않은지 먼저 본다(다르면 멈춤).
"""
import json, os, sys, math, collections, statistics as st
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import blue, growth, nz, isfin, SECTOR2THEME, THEMES27  # noqa: E402

SEL, NOW, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
T365 = os.path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365')
IDX = json.load(open(os.path.join(T365, 'industry-index.json'), encoding='utf-8'))
BYI = json.load(open(os.path.join(T365, 'by-industry.json'), encoding='utf-8'))
PRO = json.load(open(os.path.join(T365, 'proposal.json'), encoding='utf-8'))
S = json.load(open(SEL, encoding='utf-8'))
N = json.load(open(NOW, encoding='utf-8'))
CAP, ATV, DEBT, DAYS, R1Y, PICK = 1000, 3, 200, 260, 0.20, 365  # select.py 와 같은 문


def die(m):
    sys.exit('site_build: ' + m)


def kd(d):
    """2026-10-08 → 10월 8일"""
    y, m, dd = d.split('-')
    return '%d월 %d일' % (int(m), int(dd))


def d2(x):
    """소수 둘째 자리 — 10진수로(0.005 는 위로) · 화면은 이 값을 한 번 더 반올림해 한 자리로 보임"""
    return None if x is None else float(Decimal(repr(x)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


# ── ① 고르기 다시 셈(select.py 그대로) — 1,375곳 모두 안/밖과 까닭 ──
rows = S['rows']
status = {}
pool = []
for r in rows:
    f = blue(r, CAP, ATV, DEBT, DAYS)
    if f:
        status[r['code']] = {'s': 'gate', 'why': f}
    else:
        pool.append(r)
union = []
for r in pool:
    gok, gsrc, ga, gb = growth(r)
    r1y = r['px']['r1y']
    t26 = r1y is not None and r1y >= R1Y and gok
    th = SECTOR2THEME.get(nz(r['sector']))
    t27 = th is not None and gok
    if t26 or t27:
        union.append({'r': r, 't26': t26, 't27': t27, 'th': th, 'gok': gok, 'gsrc': gsrc, 'ga': ga, 'gb': gb})
    else:
        bits = []
        if not gok:
            bits.append('이익이 늘지 않음' + ('(증권사 짐작 기준)' if gsrc == 'e' else '(지난 두 해 기록)' if gsrc == 'a' else '(이익 자료 없음)'))
        else:
            bits.append('1년 주가 %s(20%%에 못 미침)' % (('%+.0f%%' % (r1y * 100)).replace('-', '−') if r1y is not None else '? 셈 못 함'))
            bits.append('2027 흐름 업종 아님')
        status[r['code']] = {'s': 'trend', 'why': ' · '.join(bits)}
both = sorted([u for u in union if u['t26'] and u['t27']], key=lambda u: -u['r']['capEok'])
one = sorted([u for u in union if not (u['t26'] and u['t27'])], key=lambda u: -u['r']['capEok'])
order = both + one
picked = order[:PICK]
for k, u in enumerate(order):
    if k < PICK:
        status[u['r']['code']] = {'s': 'in'}
    else:
        status[u['r']['code']] = {'s': 'cut', 'why': '흐름 문까지 지난 %d곳 가운데 시가총액 순서 %d번째 — 365곳 밖' % (len(order), k + 1)}
if [u['r']['code'] for u in picked] != [x['code'] for x in PRO['picked']]:
    die('다시 고른 365곳이 proposal.json 과 다름 — 고를 때 표(첫 인자)가 2026-10-05-0940 모음 · 10월 2일 기준인지 보세요')
SELPICK = {u['r']['code']: u for u in picked}
FUNNEL = {'universe': len(rows), 'gate': len(pool), 'union': len(union), 'picked': len(picked),
          'both': len(both), 'only26': sum(1 for u in union if u['t26'] and not u['t27']), 'only27': sum(1 for u in union if u['t27'] and not u['t26']),
          'gateFails': collections.Counter(v['why'] for v in status.values() if v['s'] == 'gate').most_common()}

# ── ② 지수 · 회사 선(industry-index.json) ──
dates = [p['d'] for p in IDX['all']['series']]
NDAY = len(dates)
base, asof = dates[0], dates[-1]
PICK_ASOF = S['asOf']  # 10월 2일 — 고를 때 쓴 마지막 종가
if PICK_ASOF not in dates:
    die('고른 기준일 %s 이 3개월 날짜 안에 없음' % PICK_ASOF)
kPick = dates.index(PICK_ASOF)
NOWROW = {r['code']: r for r in N['rows']}
SELROW = {r['code']: r for r in rows}
members = {}
ind_of = {}
for g in IDX['groups']:
    for i in g['industries']:
        for m in i['members']:
            members[m['code']] = m
            ind_of[m['code']] = (g['id'], i['name'])
if len(members) != PICK or set(members) != set(SELPICK):
    die('지수 파일의 회사 %d곳이 365곳과 다름' % len(members))


def filled(v):
    out, last = [], None
    for x in v:
        if x is not None:
            last = x
        out.append(last)
    return out


def mdd(v):
    peak, m = -1, 0.0
    for x in v:
        if x is None:
            continue
        peak = max(peak, x)
        m = min(m, x / peak - 1)
    return m


cap_sel = {c: SELROW[c]['capEok'] for c in members}  # 고를 때(10월 2일) 몸값 · 억 원
capb = {}
for c, m in members.items():
    vk = filled(m['v'])[kPick]
    if not vk:
        die('%s 10월 2일 값 없음' % c)
    capb[c] = cap_sel[c] * 100.0 / vk  # 7월 6일 몸값(주식 수가 그대로라고 봄)


def capw(codes):
    lines = [filled(members[c]['v']) for c in codes]
    w = [capb[c] for c in codes]
    out = []
    for k in range(NDAY):
        num = den = 0.0
        for L, ww in zip(lines, w):
            if L[k] is None:
                continue
            num += ww * L[k]
            den += ww
        out.append(round(num / den, 2) if den else None)
    return out


def breadth(codes):
    up = dn = fl = 0
    for c in codes:
        ch = members[c]['chg']
        if ch is None:
            continue
        x = d2(ch * 100)
        if x > 0:
            up += 1
        elif x < 0:
            dn += 1
        else:
            fl += 1
    return up, dn, fl


def seriesv(x):
    return [p['v'] for p in x['series']]


def low_day(v):
    k = min(range(NDAY), key=lambda j: v[j])
    return k


def below_at(codes, k):
    return sum(1 for c in codes if (filled(members[c]['v'])[k] or 100) < 100)


def node(name, codes, v):
    cw = capw(codes)
    up, dn, fl = breadth(codes)
    k = low_day(v)
    return {'name': name, 'n': len(codes), 'v': v, 'cw': cw, 'chg': d2(v[-1] - 100), 'cwChg': d2(cw[-1] - 100),
            'mdd': d2(mdd(v) * 100), 'up': up, 'down': dn, 'flat': fl, 'low': {'k': k, 'v': v[k], 'below': below_at(codes, k)}}


# 갈래 · 업종 차례 = 3개월 많이 오른 순(사장님 2026-10-11 00:00 「올름차순으로 배열을 해」 → 많이 오른 순)
all_codes = list(members)
core_all = node('365곳 전체', all_codes, seriesv(IDX['all']))
SHORT = {'semi': '반도체', 'bio': '바이오', 'heavy': '조선·방산', 'it': 'IT·통신', 'power': '전력·에너지', 'kcon': 'K-소비재',
         'mat': '소재·건설', 'elec': '전자부품', 'fin': '금융', 'hold': '지주·유통'}
SAY = {g['id']: g['say'] for g in BYI['groups']}
groups, industries = [], []
for g in sorted(IDX['groups'], key=lambda g: -(g['series'][-1]['v'])):
    gc = [m['code'] for i in g['industries'] for m in i['members']]
    gn = node(g['name'], gc, seriesv(g))
    inds = sorted(g['industries'], key=lambda i: -(i['series'][-1]['v']))
    gn.update({'id': g['id'], 'short': SHORT[g['id']], 'say': SAY[g['id']], 'inds': [i['name'] for i in inds]})
    groups.append(gn)
    for i in inds:
        ic = [m['code'] for m in sorted(i['members'], key=lambda m: -(m['chg'] if m['chg'] is not None else -9))]
        inn = node(i['name'], ic, seriesv(i))
        inn.update({'g': g['id'], 'members': ic})
        industries.append(inn)
for gr in groups:
    if SHORT[gr['id']] is None:
        die('짧은 이름 없음 ' + gr['id'])

# ── ③ 회사 365곳 ──
def fin_pair(row, key):
    """지난 두 해 기록(예상 E 빼고) — (앞 해 이름, 값, 뒤 해 이름, 값)"""
    f = (row or {}).get('fin') or {}
    d = f.get(key) or {}
    act = [p for p in (f.get('periods') or []) if not p.endswith('E') and d.get(p) is not None]
    if len(act) >= 2:
        return {'a': act[-2], 'av': d[act[-2]], 'b': act[-1], 'bv': d[act[-1]]}
    if len(act) == 1:
        return {'a': None, 'av': None, 'b': act[-1], 'bv': d[act[-1]]}
    return None


pers = []
companies = {}
lines = {}
for c, m in members.items():
    sel, now = SELROW[c], NOWROW.get(c)
    u = SELPICK[c]
    gid, iname = ind_of[c]
    v = m['v']
    fv = filled(v)
    jump = any(fv[k] and fv[k - 1] and (fv[k] / fv[k - 1] > 1.305 or fv[k] / fv[k - 1] < 0.695) for k in range(1, NDAY))  # 한국 하루 가격 제한 ±30% 밖 = 주식 수가 바뀐 흔적(쪼개기 · 합치기 · 증자)
    key = 'net' if isfin(sel) else 'op'
    px = (now or {}).get('px') or {}
    per = (now or {}).get('per')
    if per is not None and per > 0:
        pers.append(per)
    rec = fin_pair(now, key) or fin_pair(sel, key)
    est_label = None
    if u['gsrc'] == 'e':
        f = sel.get('fin') or {}
        ests = [p for p in (f.get('periods') or []) if p.endswith('E')]
        est_label = ests[0] if ests else None
    companies[c] = {
        'name': sel['name'], 'market': sel['market'], 'g': gid, 'i': iname,
        'cap': (now or sel).get('capEok'), 'price': px.get('close'), 'priceDate': px.get('last'),
        'chg3': d2(v[-1] - 100) if v[-1] is not None else None, 'mdd3': d2(mdd(v) * 100),
        'r1y': d2(px['r1y'] * 100) if px.get('r1y') is not None else None,
        'mdd1y': d2(px['mdd1y'] * 100) if px.get('mdd1y') is not None else None,
        'per': per, 'jump': jump, 'products': (now or sel).get('products') or None, 'sector': sel.get('sector'),
        'fin': {'key': key, **rec} if rec else None,
        'pick': {'t26': u['t26'], 't27': u['t27'], 'theme': u['th'], 'r1y': d2(sel['px']['r1y'] * 100), 'gsrc': u['gsrc'],
                 'ga': u['ga'], 'gb': u['gb'], 'gkey': key, 'estLabel': est_label,
                 'recUp': (rec['bv'] > rec['av']) if rec and rec.get('av') is not None else None},
    }
    lines[c] = [None if x is None else int(round(x * 100)) for x in v]

per_med = d2(st.median(pers)) if pers else None
ndd50 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -50)
ndd30 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -30)
n1y = sum(1 for c in companies.values() if c['mdd1y'] is not None)
t26c = [companies[c]['chg3'] for c in companies if companies[c]['pick']['t26']]
t27o = [companies[c]['chg3'] for c in companies if not companies[c]['pick']['t26']]
big2 = sorted(companies, key=lambda c: -(companies[c]['cap'] or 0))[:2]

core = {
    'schema': 'atlas-new-core-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'asOf': asof, 'base': base, 'days': NDAY - 1, 'pickAsOf': PICK_ASOF, 'kPick': kPick,
    'sources': {'price': '네이버 증권 일봉 · %s 모음(%s 종가까지)' % (kd(N['collectedAt'][:10]), kd(asof)),
                'pick': '네이버 증권 시가총액 · 결산 · 증권사 짐작 · %s 모음(%s 종가까지)' % (kd(S['collectedAt'][:10]), kd(PICK_ASOF)),
                'budget': '2027년 정부 예산안(2026년 9월 1일 국무회의 · 정책브리핑) · 2026년 9월 수출입 동향(산업통상부 10월 1일)'},
    'dates': dates, 'all': core_all, 'groups': groups, 'industries': industries,
    'facts': {'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat'], 'dd50': ndd50, 'dd30': ndd30, 'n1y': n1y,
              'perMedian': per_med, 'perN': len(pers), 't26n': len(t26c), 't26med': d2(st.median(t26c)), 't27n': len(t27o), 't27med': d2(st.median(t27o)),
              'big': [{'code': c, 'name': companies[c]['name'], 'chg3': companies[c]['chg3']} for c in big2]},
    'funnel': FUNNEL,
    'rules': {'gate': PRO['rules']['gate'], 't26': PRO['rules']['trend26'], 't27': PRO['rules']['trend27'],
              'themes': {t: ev for t, (_, ev) in THEMES27.items()}},
}

# ── ④ 찾기 이름표 1,375곳 ──
names = []
for r in sorted(rows, key=lambda r: -(r['capEok'] or 0)):
    s = status[r['code']]
    item = {'c': r['code'], 'n': r['name'], 's': s['s']}
    if s['s'] == 'in':
        item['g'], item['i'] = ind_of[r['code']]
    else:
        item['w'] = s['why']
        item['m'] = r['market']
    names.append(item)
NAMES = {'schema': 'atlas-new-names-1', 'asOf': PICK_ASOF, 'n': len(names), 'funnel': {k: FUNNEL[k] for k in ('universe', 'gate', 'union', 'picked')}, 'rows': names}

os.makedirs(OUT, exist_ok=True)
def dump(name, obj):
    p = os.path.join(OUT, name)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    return os.path.getsize(p)
sz = {'core.json': dump('core.json', core), 'comp.json': dump('comp.json', {'schema': 'atlas-new-comp-1', 'asOf': asof, 'companies': companies}), 'lines.json': dump('lines.json', {'schema': 'atlas-new-lines-1', 'asOf': asof, 'base': base, 'lines': lines}), 'names.json': dump('names.json', NAMES)}
print(json.dumps({'bytes': sz, 'groups': len(groups), 'industries': len(industries), 'companies': len(companies), 'names': len(names),
                  'all': {'chg': core_all['chg'], 'cwChg': core_all['cwChg'], 'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat']},
                  'dd50': ndd50, 'dd30': ndd30, 'perMedian': per_med, 'jump': sum(1 for c in companies.values() if c['jump'])}, ensure_ascii=False))
