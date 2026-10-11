#!/usr/bin/env python3
"""새 ATLAS 사이트 자료(aaa7377.com) — 지금 쓰는 365곳(universe.json · d365-v1 대세 365곳) · 큰 갈래 · 업종 · 지난 20거래일 지수를 화면이 읽는 JSON 으로.
사장님 2026-10-11 06:13 「aaa7377.com에 올려 … 잡스 방식이 중심이 되고 구글팀 클로드팀 cai팀 그리고 찰리 망거팀 삼성팀 들이 도와서
일반인들이 바로 알수 있고 쉽게 사용가능하며 별도에 설명이 없어도 감탄이 니오게 새로운 아틀란스를 만들어 봐라 이 토대로 말이다」
사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 지금은 7월 6일이 기준이잖아 이기준을 현재에서 지난 20일로 변경한다 항상 그렇게 하라」
  → 창 = 거래소 달력에서 마지막 종가 날(asOf)까지 거래일 21개(기준일 = asOf 의 20거래일 전 · 그날 = 100 · 변화 20번).
    날짜를 박아 두지 않음 — 자료의 마지막 날이 바뀌면 기준일도 같이 움직임(옛 3개월 창 7월 6일 = 100 은 t365 industry-index.json 기록으로 남김).
사장님 2026-10-11 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」
  → 365곳 = daese.py(d365-v1 · 10월 8일 종가까지 30거래일) · 옛 t365-v1(10월 2일 · 1년 20% · 2027 흐름)은 기록으로 남김

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08   ← 고를 때 · 지금 값(10월 8일 종가)
  python3 scripts/atlas11/t365/site_build.py <임시>/now.json site/atlas/data
만드는 것:
  core.json  — 날짜 21개(기준일 + 20거래일) · 365곳 전체 · 갈래 · 업종(한 회사 한 표 지수 v · 큰 회사는 크게 지수 cw) · 고른 깔때기 · 규칙 · 업종 대세 순서 표(첫 화면이 먼저 읽음)
  comp.json  — 회사 365곳 요약(선 빼고 · 첫 그림 뒤에 받음) · 회사마다 고른 까닭(층 · 네이버 업종 · 두 팀 잣대 · 30거래일)
  lines.json — 회사마다 20거래일 선(기준일 = 100 · 값 × 100 정수 · 값 없는 날 null)
  names.json — 후보 1,378곳 이름 · 365곳 안/밖 · 밖이면 어느 문에서 왜(찾기 칸이 읽음)
셈(숫자는 모두 여기서 한 번만 · 화면은 보여 주기만 · 종가는 모음 bundle.json.gz 네이버 일봉 그대로):
  회사 선 = 그날 종가 ÷ 기준일 종가 × 100(기준일 종가가 없으면 선 없음)
  한 회사 한 표 = 날마다 회사들 하루 변화의 같은 무게 평균(±50% 넘는 값 뺌)을 이어 곱함 · 기준일 = 100
  큰 회사는 크게 = 기준일에 시가총액만큼 사 두었다면(사고 그대로 둠) — 기준일 몸값 = 고른 날(10월 8일) 몸값 × 기준일 종가 ÷ 고른 날 종가
                   날마다 Σ(기준일 몸값 × 선 값) ÷ Σ 기준일 몸값 · 그날 값이 없으면 앞 값
  20거래일 가장 깊이 빠짐 = 선의 꼭대기에서 가장 많이 내려간 비율
  1주 값 · 1년 = 거래소 달력 asOf 까지 253거래일(1년 = asOf 종가 ÷ 252거래일 전 종가 · 1년 가장 깊이 빠짐은 값이 200일 이상일 때) — dump.mjs 값과 맞대어 다르면 멈춤
고르기 다시 셈: daese.select() 로 다시 골라 proposal.json 의 365곳 · 차례와 한 곳도 다르지 않은지 먼저 본다(다르면 멈춤).
"""
import gzip, json, os, sys, math, collections, statistics as st
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import isfin  # noqa: E402
import daese  # noqa: E402

if len(sys.argv) != 3:
    sys.exit('site_build: 쓰는 법 python3 scripts/atlas11/t365/site_build.py <now.json(dump.mjs · 10월 10일 모음)> <자료 폴더> — 옛 고를 때 표(sel.json)는 이제 받지 않음')
NOW, OUT = sys.argv[1], sys.argv[2]
ACT = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
UNI = os.path.join(ROOT, ACT['dir'])
BYI = json.load(open(os.path.join(UNI, 'by-industry.json'), encoding='utf-8'))
PRO = json.load(open(os.path.join(UNI, 'proposal.json'), encoding='utf-8'))
N = json.load(open(NOW, encoding='utf-8'))
PICK = 365


def die(m):
    sys.exit('site_build: ' + m)


def kd(d):
    """2026-10-08 → 10월 8일"""
    y, m, dd = d.split('-')
    return '%d월 %d일' % (int(m), int(dd))


def d2(x):
    """소수 둘째 자리 — 10진수로(0.005 는 위로) · 화면은 이 값을 한 번 더 반올림해 한 자리로 보임"""
    return None if x is None else float(Decimal(repr(x)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


# ── ① 고르기 다시 셈(daese.select 그대로) — 후보 1,378곳 모두 안/밖과 까닭 ──
if PRO['rules']['version'] != ACT['version'] or N['asOf'] != ACT['asOf']:
    die('universe.json(%s · %s) 과 proposal.json(%s) · 후보 표(%s)가 다름' % (ACT['version'], ACT['asOf'], PRO['rules']['version'], N['asOf']))
rows = N['rows']
bnd = json.load(gzip.open(os.path.join(ROOT, ACT['bundle']), 'rt', encoding='utf-8'))
CAL = json.load(open(os.path.join(ROOT, 'public/data/input.json'), encoding='utf-8'))['calendar']['sessions']
RES = daese.select(rows, bnd, CAL, N['asOf'])
if [p['code'] for p in RES['picked']] != [p['code'] for p in PRO['picked']]:
    die('다시 고른 365곳이 proposal.json 과 다름 — 후보 표(첫 인자)가 %s 을 %s 기준으로 푼 것인지 보세요' % (ACT['bundle'], ACT['asOf']))
status = RES['status']
SELPICK = {p['code']: p for p in RES['picked']}
SECT = {x['name']: x for x in RES['sectors']}
RC = RES['counts']
FUNNEL = {'universe': RC['universe'], 'gate': RC['gate'], 'ranked': RC['rankedCompanies'], 'picked': RC['picked'],
          'sectors': RC['ranked'], 'top': RC['top'], 'tiers': [RC['tier1'], RC['tier2'], RC['tier3']], 'gateFails': RC['gateFails'],
          'steps': [{'k': 'universe', 'n': RC['universe'], 't': '코스피 · 코스닥 시가총액 목록(%s 모음)' % kd(N['collectedAt'][:10])},
                    {'k': 'gate', 'n': RC['gate'], 't': '기본 문 여섯 — 흑자 · 빚 · 몸값 · 거래 · 기록 1년 · 보통주'},
                    {'k': 'ranked', 'n': RC['rankedCompanies'], 't': '대세 순서를 매긴 업종 %d개 — 네이버 업종에 기본 문 지난 회사가 3곳 이상' % RC['ranked']},
                    {'k': 'picked', 'n': RC['picked'], 't': '대세 순서 — 두 팀 모두 고른 업종(1층) → 한 팀(2층) → 대세에 가까운 순(3층)'}],
          'stop': {'gate': 1, 'sector': 2, 'cut': 3}, 'stopName': {'gate': '기본 문', 'sector': '업종 대세 순서', 'cut': '365곳 채우기'}}

# ── ② 20거래일 창 · 지수 · 회사 선 — 모음 종가에서 바로(사장님 09:37 「현재에서 지난 20일 거래 · 항상」) ──
#   by-industry.json(organize.mjs)의 묶음(갈래 → 업종 → 회사)을 씀
NOWROW = {r['code']: r for r in rows}
SELROW = NOWROW  # 대세 365곳은 지금 값(10월 8일)으로 고름 — 고를 때 표 = 지금 표
members = {}
ind_of = {}
for g in BYI['groups']:
    for i in g['industries']:
        for m in i['companies']:
            members[m['code']] = m
            ind_of[m['code']] = (g['id'], i['name'])
if len(members) != PICK or set(members) != set(SELPICK):
    die('업종 정리 파일의 회사 %d곳이 365곳과 다름' % len(members))
iso8 = lambda d: '%s-%s-%s' % (d[:4], d[4:6], d[6:])
crow = {c: {iso8(r[0]): r[4] for r in bnd['stocks'][c]['fchart']['rows'] if r[4] and r[4] > 0} for c in members}
BASEROW = {c: dict(crow[c]) for c in members}
BLAST = max(d for c in members for d in crow[c])  # 모음의 마지막 날(10월 8일)
# 이어 받은 종가(사장님 09:37 「항상」) — 환경 변수 ATLAS_T365_CLOSES = closes_fetch.mjs 가 남긴 폴더(올리기 package.mjs 가 넘김)
#   파일 이름(받은 때) 차례로 · 모음 마지막 날 뒤의 날만 이어 붙임 · 같은 날은 나중 파일이 이김(저녁 8시 전 값 → 다음 날 다시 받은 값)
#   그 파일의 모음 안 날 값이 모음과 0.5% 넘게 다르면(쪼개기 · 증자로 지난 값을 고쳐 적음 등) 그 회사는 그 파일에서 받지 않음 → 그 회사 새 날은 「?」
CLOSES = os.environ.get('ATLAS_T365_CLOSES')
OVER = {'files': 0, 'added': 0, 'mismatch': [], 'lastFile': None}
if CLOSES and os.path.isdir(CLOSES):
    for fn in sorted(f for f in os.listdir(CLOSES) if f.endswith('.json.gz')):
        snap = json.load(gzip.open(os.path.join(CLOSES, fn), 'rt', encoding='utf-8'))
        if snap.get('schema') != 'atlas-t365-closes-1':
            continue
        OVER['files'] += 1
        for c, rs in (snap.get('rows') or {}).items():
            if c not in crow:
                continue
            if any(iso8(d) <= BLAST and iso8(d) in BASEROW[c] and abs(v / BASEROW[c][iso8(d)] - 1) > 0.005 for d, v in rs):
                OVER['mismatch'].append([fn, c])
                continue
            for d, v in rs:
                if iso8(d) > BLAST and v and v > 0:
                    if iso8(d) not in crow[c]:
                        OVER['added'] += 1
                    crow[c][iso8(d)] = v
                    OVER['lastFile'] = {'file': fn, 'startedAt': snap.get('startedAt')}
dcnt = collections.Counter(d for c in members for d in crow[c])
DAYS = sorted(d for d, n in dcnt.items() if n > len(members) / 2)  # 365곳 가운데 절반 넘게 종가가 있는 날
asof = DAYS[-1]  # 마지막 종가 날 = 「현재」
Y = [d for d in CAL if d <= asof]
if not Y or Y[-1] != asof:
    die('마지막 종가 날 %s 이 거래소 달력의 거래일이 아님' % asof)
WN = 20  # 지난 20거래일
dates = Y[-(WN + 1):]  # 기준일(20거래일 전) + 20거래일
if any(d not in DAYS for d in dates):
    die('20거래일 창 안에 365곳 절반 넘게 종가가 없는 날이 있음: %s' % [d for d in dates if d not in DAYS])
NDAY = len(dates)
base = dates[0]
PICK_ASOF = N['asOf']  # 10월 8일 — 고를 때 쓴 마지막 종가(대세 365곳)
kPick = dates.index(PICK_ASOF) if PICK_ASOF in dates else None  # 고른 날이 창 밖으로 나가면 금빛 세로선 없음
px = lambda c, d: crow[c].get(d)
mv = {}
for c in members:
    b0 = px(c, base)
    mv[c] = [(px(c, d) / b0 * 100 if (b0 and px(c, d)) else None) for d in dates]
mchg = {c: (mv[c][-1] / 100 - 1 if mv[c][-1] is not None else None) for c in members}


def eq_index(codes):
    """한 회사 한 표 — 날마다 하루 변화(±50% 넘는 값 뺌)의 같은 무게 평균을 이어 곱함 · 기준일 = 100"""
    out, lvl = [100.0], 100.0
    for k in range(1, NDAY):
        rs = []
        for c in codes:
            a, b = px(c, dates[k - 1]), px(c, dates[k])
            if a and b and abs(b / a - 1) < 0.5:
                rs.append(b / a - 1)
        if rs:
            lvl *= 1 + sum(rs) / len(rs)
        out.append(round(lvl, 2))
    return out


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


cap_sel = {c: SELROW[c]['capEok'] for c in members}  # 고를 때(10월 8일) 몸값 · 억 원
capb = {}
for c in members:
    a, b = px(c, PICK_ASOF), px(c, base)
    if not a:
        die('%s 고른 날(%s) 종가 없음' % (c, PICK_ASOF))
    capb[c] = cap_sel[c] * b / a if b else None  # 기준일 몸값(주식 수가 그대로라고 봄) · 기준일 종가가 없으면 빼고 셈


def capw(codes):
    codes = [c for c in codes if capb[c] is not None]
    lines = [filled(mv[c]) for c in codes]
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
        ch = mchg[c]
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
    return sum(1 for c in codes if (filled(mv[c])[k] or 100) < 100)


TR_DIR, TR_STRONG, TR_TURN = 0.03, 0.10, 0.03  # 방향 3% · 강하게 10%(곧음 0.6 이상) · 힘 3%p


def trend(v):
    """기간 안 방향 · 세기 · 힘 — 사장님 2026-10-11 11:04 「업종이 기간내에 오르고 있는지 내리고 있는지 그 강도가 어떤지등을 표현 해야해」 · 11:10 「이 화면에서 나와야 해」
    곧은 선 = ln(지수)을 날(0 … n−1)에 맞춘 기울기 → 기간 변화 fit = e^(기울기 × (n−1)) − 1 · 곧음 r2 = 그 선에 붙어 가는 정도(0 ~ 1)
    방향 d: fit > 3% 이고 처음→끝도 오름 = up · fit < −3% 이고 처음→끝도 내림 = down · 그 밖 flat(옆걸음)
    세기 s: 오름 · 내림 가운데 |fit| ≥ 10% 이고 r2 ≥ 0.6 = strong(「강하게」)
    힘 t(오르는 힘): 뒤 반(가운데 날 → 끝) 변화 − 앞 반(처음 → 가운데 날) 변화 > 3%p = gain(「힘 붙음」) · < −3%p = fade(「힘 빠짐」)"""
    n = len(v)
    xs = list(range(n))
    ys = [math.log(x) for x in v]
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
    ss = sum((y - my) ** 2 for y in ys)
    res = sum((y - (my + b * (x - mx))) ** 2 for x, y in zip(xs, ys))
    r2 = 1 - res / ss if ss > 0 else 0.0
    fit, chg, mid = math.exp(b * (n - 1)) - 1, v[-1] / v[0] - 1, (n - 1) // 2
    h1, h2 = v[mid] / v[0] - 1, v[-1] / v[mid] - 1
    d = 'up' if fit > TR_DIR and chg > 0 else 'down' if fit < -TR_DIR and chg < 0 else 'flat'
    s = 'strong' if d != 'flat' and abs(fit) >= TR_STRONG and r2 >= 0.6 else None
    t = 'gain' if h2 - h1 > TR_TURN else 'fade' if h1 - h2 > TR_TURN else None
    return {'d': d, 's': s, 't': t, 'fit': d2(fit * 100), 'r2': round(r2, 2), 'h1': d2(h1 * 100), 'h2': d2(h2 * 100)}


def node(name, codes, v):
    cw = capw(codes)
    up, dn, fl = breadth(codes)
    k = low_day(v)
    return {'name': name, 'n': len(codes), 'v': v, 'cw': cw, 'chg': d2(v[-1] - 100), 'cwChg': d2(cw[-1] - 100),
            'mdd': d2(mdd(v) * 100), 'up': up, 'down': dn, 'flat': fl, 'low': {'k': k, 'v': v[k], 'below': below_at(codes, k)},
            'tr': trend(v), 'trc': trend(cw)}


# 갈래 · 업종 차례 = 20거래일 많이 오른 순(사장님 2026-10-11 00:00 「올름차순으로 배열을 해」 → 많이 오른 순)
all_codes = list(members)
core_all = node('365곳 전체', all_codes, eq_index(all_codes))
gv = {g['id']: eq_index([m['code'] for i in g['industries'] for m in i['companies']]) for g in BYI['groups']}
iv = {i['name']: eq_index([m['code'] for m in i['companies']]) for g in BYI['groups'] for i in g['industries']}
if len(iv) != sum(len(g['industries']) for g in BYI['groups']):
    die('업종 이름이 겹침')
SHORT = {'semi': '반도체', 'bio': '바이오', 'heavy': '조선·방산', 'it': 'IT·통신', 'power': '전력·에너지', 'kcon': 'K-소비재',
         'mat': '소재·건설', 'elec': '전자부품', 'fin': '금융', 'hold': '지주·유통'}
SAY = {g['id']: g['say'] for g in BYI['groups']}
groups, industries = [], []
for g in sorted(BYI['groups'], key=lambda g: -gv[g['id']][-1]):
    gc = [m['code'] for i in g['industries'] for m in i['companies']]
    gn = node(g['name'], gc, gv[g['id']])
    inds = sorted(g['industries'], key=lambda i: -iv[i['name']][-1])
    gn.update({'id': g['id'], 'short': SHORT[g['id']], 'say': SAY[g['id']], 'inds': [i['name'] for i in inds]})
    groups.append(gn)
    for i in inds:
        ic = [m['code'] for m in sorted(i['companies'], key=lambda m: -(mchg[m['code']] if mchg[m['code']] is not None else -9))]
        inn = node(i['name'], ic, iv[i['name']])
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
PSCALE, PERX = {}, {}
companies = {}
lines = {}
for c, m in members.items():
    sel, now = SELROW[c], NOWROW.get(c)
    u = SELPICK[c]
    gid, iname = ind_of[c]
    v = mv[c]
    fv = filled(v)
    jump = any(fv[k] and fv[k - 1] and (fv[k] / fv[k - 1] > 1.305 or fv[k] / fv[k - 1] < 0.695) for k in range(1, NDAY))  # 한국 하루 가격 제한 ±30% 밖 = 주식 수가 바뀐 흔적(쪼개기 · 합치기 · 증자)
    key = 'net' if isfin(sel) else 'op'
    pxd = (now or {}).get('px') or {}
    per = (now or {}).get('per')
    # 1주 값 · 1년 — 그 회사 종가 줄(asOf 까지)에서 바로 셈 · dump.mjs 와 같은 뜻(252줄 전 · 마지막 252줄 꼭대기에서 · 줄 60개 이상)
    cr = sorted(d for d in crow[c] if d <= asof)
    lastd = cr[-1] if cr else None
    close = px(c, lastd) if lastd else None
    r1y = close / px(c, cr[-253]) - 1 if len(cr) > 252 else None
    mdd1y = None
    if len(cr) >= 60:
        pk, mm = 0, 0.0
        for d in cr[-252:]:
            pk = max(pk, px(c, d))
            mm = min(mm, px(c, d) / pk - 1)
        mdd1y = mm
    sc = close / px(c, N['asOf']) if (close and px(c, N['asOf']) and asof != N['asOf']) else 1.0  # 몸값 · 순이익 몇 배를 마지막 종가에 맞춤
    if per is not None and sc != 1.0:
        per = round(per * sc, 2)
    PSCALE[c] = sc
    if N['asOf'] == asof:  # 같은 날이면 dump.mjs 값과 한 치도 다르지 않아야 함
        for nm, a, b in (('1주 값', pxd.get('close'), close), ('값 날짜', pxd.get('last'), lastd), ('1년', pxd.get('r1y'), r1y), ('1년 가장 깊이 빠짐', pxd.get('mdd1y'), mdd1y)):
            if (a is None) != (b is None) or (a is not None and (a != b if isinstance(a, str) else abs(a - b) > 1e-12)):
                die('%s %s 이 dump.mjs 와 다름: %r ≠ %r' % (c, nm, a, b))
    PERX[c] = per
    rec = fin_pair(now, key) or fin_pair(sel, key)
    x = SECT[u['sector']]  # 고른 까닭 — 그 회사 네이버 업종의 두 팀 잣대(10월 8일까지 30거래일)
    companies[c] = {
        'name': sel['name'], 'market': sel['market'], 'g': gid, 'i': iname,
        'cap': ((now or sel).get('capEok') if PSCALE[c] == 1.0 or (now or sel).get('capEok') is None else round((now or sel).get('capEok') * PSCALE[c])), 'price': close, 'priceDate': lastd,
        'chg': d2(v[-1] - 100) if v[-1] is not None else None, 'mdd': d2(mdd(v) * 100),
        'r1y': d2(r1y * 100) if r1y is not None else None,
        'mdd1y': d2(mdd1y * 100) if mdd1y is not None else None,
        'per': per, 'jump': jump, 'products': (now or sel).get('products') or None, 'sector': sel.get('sector'),
        'fin': {'key': key, **rec} if rec else None,
        'pick': {'tier': u['tier'], 'sector': u['sector'], 'srank': x['rank'], 'google': x['google'], 'cia': x['cia'], 'strong': x['strong'], 'hits': x['hits'],
                 'schg': d2(x['chg'] * 100), 'sfit': d2(x['fit'] * 100), 'sr2': d2(x['r2']), 'z': d2(x['z']),
                 'sbr': d2(x['br'] * 100), 'smon': d2(x['mon'] * 100), 'searn': d2(x['earn'] * 100),
                 'sn': x['n'], 'inN': x['inN'], 'part': u['part'], 'prank': u['prank'], 'pn': u['pn'],
                 'r30': d2(u['r30'] * 100) if u['r30'] is not None else None},
    }
    lines[c] = [None if x is None else int(round(x * 100)) for x in v]

pers = [p for p in PERX.values() if p is not None and p > 0]
per_med = d2(st.median(pers)) if pers else None
ndd50 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -50)
ndd30 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -30)
n1y = sum(1 for c in companies.values() if c['mdd1y'] is not None)
tier_chg = {t: [x['chg'] for x in companies.values() if x['pick']['tier'] == t and x['chg'] is not None] for t in (1, 2, 3)}
big2 = sorted(companies, key=lambda c: -(companies[c]['cap'] or 0))[:2]

core = {
    'schema': 'atlas-new-core-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'asOf': asof, 'base': base, 'days': NDAY - 1, 'pickAsOf': PICK_ASOF, 'kPick': kPick, 'sincePick': DAYS.index(asof) - DAYS.index(PICK_ASOF),
    # 마지막 날 값을 그날 저녁 8시(서울) 전에 받았으면 아직 바뀔 수 있음(시간외 · 넥스트레이드) — 다음 받기에서 고쳐짐
    'provisional': bool(OVER['lastFile'] and asof > BLAST and (lambda t: t[:10] == asof and t[11:13] < '20')((datetime.fromisoformat(OVER['lastFile']['startedAt'].replace('Z', '+00:00')).astimezone(timezone(timedelta(hours=9)))).isoformat())),
    'roll': {'files': OVER['files'], 'added': OVER['added'], 'mismatch': len(OVER['mismatch'])},
    'sources': {'price': ('네이버 증권 일봉 · %s 모음(%s 종가까지)' % (kd(N['collectedAt'][:10]), kd(asof))) if not OVER['added'] else
                          ('네이버 증권 일봉 · %s 모음 + 날마다 이어 받음(%s 종가까지)' % (kd(N['collectedAt'][:10]), kd(asof))),
                'pick': '네이버 증권 시가총액 · 결산 · 업종 · 일봉 · %s 모음(%s 종가까지 30거래일)' % (kd(N['collectedAt'][:10]), kd(PICK_ASOF))},
    'dates': dates, 'all': core_all, 'groups': groups, 'industries': industries,
    'facts': {'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat'], 'dd50': ndd50, 'dd30': ndd30, 'n1y': n1y,
              'perMedian': per_med, 'perN': len(pers),
              'tiers': [{'t': t, 'n': sum(1 for x in companies.values() if x['pick']['tier'] == t), 'med': d2(st.median(tier_chg[t])) if tier_chg[t] else None} for t in (1, 2, 3)],
              'big': [{'code': c, 'name': companies[c]['name'], 'chg': companies[c]['chg']} for c in big2],
              'jumpN': sum(1 for c in companies.values() if c['jump'])},
    'funnel': FUNNEL,
    'rules': {'version': PRO['rules']['version'], 'gate': PRO['rules']['gate'], 'window': PRO['rules']['window'], 'google': PRO['rules']['google'], 'cia': PRO['rules']['cia'],
              'tiers': PRO['rules']['tiers'], 'bias': PRO['rules']['bias'], 'next': PRO['rules']['next'],
              'pickWin': {k: RES['window'][k] for k in ('from', 'to', 'days')},
              'sectors': [{'name': x['name'], 'rank': x['rank'], 'tier': x['tier'], 'google': x['google'], 'cia': x['cia'], 'n': x['n'], 'in': x['inN'], 'chg': d2(x['chg'] * 100)} for x in RES['sectors']],
              'unranked': {'sectors': len(RES['unranked']), 'companies': RC['unrankedCompanies']}},
}

# ── ④ 찾기 이름표(후보 표 모두) ──
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
NAMES = {'schema': 'atlas-new-names-1', 'asOf': PICK_ASOF, 'collected': kd(N['collectedAt'][:10]), 'n': len(names), 'funnel': {k: FUNNEL[k] for k in ('universe', 'gate', 'ranked', 'picked')}, 'rows': names}

os.makedirs(OUT, exist_ok=True)
def dump(name, obj):
    p = os.path.join(OUT, name)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    return os.path.getsize(p)
# ── ⑤ 4단 「지나온 길」(사장님 2026-10-11 08:10 「지금 3단 클릭으로 되어있어 5단 클릭으로 해」) — 회사마다 3년 남짓 종가 · 해마다 번 돈 ──
#   days.json = 거래일(365곳 가운데 절반 넘게 종가가 있는 날 — pick36.py 와 같은 날) · 365곳 같은 무게 지수(날마다 평균 · 하루 ±50% 넘는 값 뺌 · 이어 곱함 · 첫날 = 100)
#   co/<번호>.json = 그 회사 종가(days 색인 k0 부터 · 없는 날 null) · 하루 ±30.5% 넘게 바뀐 날(한국 가격 제한 밖 — 주식 수 바뀜일 수 있음) · 해마다 기록(예상 E 뺌)
#   (모음 · 종가 표 crow · 거래일 DAYS 는 ② 에서 읽은 것을 그대로 씀)
lvl, allv = 100.0, [100.0]
for k in range(1, len(DAYS)):
    rs = [crow[c][DAYS[k]] / crow[c][DAYS[k - 1]] - 1 for c in members if DAYS[k] in crow[c] and DAYS[k - 1] in crow[c]]
    rs = [r for r in rs if abs(r) < 0.5]
    if rs:
        lvl *= 1 + sum(rs) / len(rs)
    allv.append(round(lvl, 2))
os.makedirs(os.path.join(OUT, 'co'), exist_ok=True)
for fn in os.listdir(os.path.join(OUT, 'co')):  # 365곳이 바뀌면(11:43 대세 365곳) 빠진 회사의 옛 파일은 지움 — 만든 자료일 뿐 기록이 아님
    if fn.endswith('.json') and fn[:-5] not in members:
        os.remove(os.path.join(OUT, 'co', fn))
nco = 0
for c in members:
    ks = [k for k, d in enumerate(DAYS) if d in crow[c]]
    k0 = ks[0]
    cl = [crow[c].get(d) for d in DAYS[k0:]]
    jumps = []
    prev = None
    for k in range(k0, len(DAYS)):
        v = crow[c].get(DAYS[k])
        if v and prev and abs(v / prev - 1) > 0.305:
            jumps.append([DAYS[k], d2((v / prev - 1) * 100)])
        if v:
            prev = v
    now = NOWROW.get(c) or SELROW[c]
    f = now.get('fin') or {}
    yrs = [p for p in (f.get('periods') or []) if not p.endswith('E')]
    fin = {'years': yrs, **{key: [((f.get(key) or {}).get(y)) for y in yrs] for key in ('rev', 'op', 'net', 'roe', 'debt')}}
    with open(os.path.join(OUT, 'co', c + '.json'), 'w', encoding='utf-8') as fh:
        sc = PSCALE[c]
        cper = now.get('per') if sc == 1.0 or now.get('per') is None else round(now.get('per') * sc, 2)
        cpbr = now.get('pbr') if sc == 1.0 or now.get('pbr') is None else round(now.get('pbr') * sc, 2)
        json.dump({'schema': 'atlas-new-co-1', 'code': c, 'k0': k0, 'close': cl, 'jumps': jumps, 'fin': fin, 'per': cper, 'pbr': cpbr, 'key': 'net' if isfin(SELROW[c]) else 'op'}, fh, ensure_ascii=False, separators=(',', ':'))
        fh.write('\n')
    nco += 1
with open(os.path.join(OUT, 'days.json'), 'w', encoding='utf-8') as fh:
    json.dump({'schema': 'atlas-new-days-1', 'asOf': asof, 'dates': DAYS, 'all': allv}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write('\n')

sz = {'core.json': dump('core.json', core), 'comp.json': dump('comp.json', {'schema': 'atlas-new-comp-1', 'asOf': asof, 'companies': companies}), 'lines.json': dump('lines.json', {'schema': 'atlas-new-lines-1', 'asOf': asof, 'base': base, 'lines': lines}), 'names.json': dump('names.json', NAMES)}
print(json.dumps({'days': len(DAYS), 'co': nco, 'bytes': sz, 'groups': len(groups), 'industries': len(industries), 'companies': len(companies), 'names': len(names),
                  'all': {'chg': core_all['chg'], 'cwChg': core_all['cwChg'], 'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat']},
                  'dd50': ndd50, 'dd30': ndd30, 'perMedian': per_med, 'jump': sum(1 for c in companies.values() if c['jump']),
                  'asOf': asof, 'base': base, 'roll': core['roll'], 'provisional': core['provisional'], 'mismatch': OVER['mismatch'][:10]}, ensure_ascii=False))
