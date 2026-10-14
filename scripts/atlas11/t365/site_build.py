#!/usr/bin/env python3
"""새 ATLAS 사이트 자료(aaa7377.com) — 지금 쓰는 365곳(universe.json · d365-v1 대세 365곳) · 큰 갈래 · 업종 · 지난 20거래일 지수를 화면이 읽는 JSON 으로.
사장님 2026-10-11 06:13 「aaa7377.com에 올려 … 잡스 방식이 중심이 되고 구글팀 클로드팀 cai팀 그리고 찰리 망거팀 삼성팀 들이 도와서
일반인들이 바로 알수 있고 쉽게 사용가능하며 별도에 설명이 없어도 감탄이 니오게 새로운 아틀란스를 만들어 봐라 이 토대로 말이다」
사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 지금은 7월 6일이 기준이잖아 이기준을 현재에서 지난 20일로 변경한다 항상 그렇게 하라」
  → 창 = 거래소 달력에서 마지막 종가 날(asOf)까지 거래일 21개(기준일 = asOf 의 20거래일 전 · 그날 = 100 · 변화 20번).
    날짜를 박아 두지 않음 — 자료의 마지막 날이 바뀌면 기준일도 같이 움직임(옛 3개월 창 7월 6일 = 100 은 t365 industry-index.json 기록으로 남김).
사장님 2026-10-11 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」
  → 365곳 = daese.py(d365-v1 · 10월 8일 종가까지 30거래일) · 옛 t365-v1(10월 2일 · 1년 20% · 2027 흐름)은 기록으로 남김
사장님 2026-10-13 13:04 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 … cia팀이 중심이 되서 나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」
  → 365곳 = h365.py(h365-v1 힘 붙은 365곳 · 회차마다 그날까지 지난 20거래일 · 앞 회차 기록 = 환경 변수 ATLAS_H365_PREV) · 옛 d365-v2 는 기록 · 봉인 1호로 남김
사장님 2026-10-13 23:14(서울) 「기준 다시 만들어봐 찰리 멍거라면」 · 23:34 「철저하게 찰리 망거 조건만 해」 · 2026-10-14 00:03 「가 로 하자」
  → 바탕 = ml.py(ml-v1 멍거 · 린치 조건 — 멍거 갈래 munger.py · 린치 갈래 lynch.py · 둘 가운데 하나라도 넘은 곳 · 곳 수는 셈한 그대로 · 365곳 채우지 않음 · 2026-10-14 06:05 「가」)
    · 옛 h365-v1 · d365-v2 는 회차 기록 · 봉인 1호로 남김 · 아래 글의 「365곳」은 이제 「고른 곳(N곳)」

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08   ← 고를 때 · 지금 값(10월 8일 종가)
  python3 scripts/atlas11/t365/site_build.py <임시>/now.json site/atlas/data
만드는 것:
  core.json  — 날짜 21개(기준일 + 20거래일) · 365곳 전체 · 갈래 · 업종(한 회사 한 표 지수 v · 큰 회사는 크게 지수 cw) · 고른 깔때기 · 규칙(첫 화면이 먼저 읽음)
  comp.json  — 회사 365곳 요약(선 빼고 · 첫 그림 뒤에 받음) · 회사마다 든 까닭(힘 붙음 · 남김 · 채움 · 앞 10거래일 · 뒤 10거래일 · 네이버 업종 · 차례는 싣지 않음)
  lines.json — 회사마다 20거래일 선(기준일 = 100 · 값 × 100 정수 · 값 없는 날 null)
  names.json — 후보 모두(모음 회사 모두 · 2026-10-14 08:41 「가」부터 전 종목) 이름 · 365곳 안/밖 · 밖이면 어느 문에서 왜(찾기 칸이 읽음)
셈(숫자는 모두 여기서 한 번만 · 화면은 보여 주기만 · 종가는 모음 bundle.json.gz 네이버 일봉 그대로):
  회사 선 = 그날 종가 ÷ 기준일 종가 × 100(기준일 종가가 없으면 선 없음)
  한 회사 한 표 = 날마다 회사들 하루 변화의 같은 무게 평균(±50% 넘는 값 뺌)을 이어 곱함 · 기준일 = 100
  큰 회사는 크게 = 기준일에 시가총액만큼 사 두었다면(사고 그대로 둠) — 기준일 몸값 = 고른 날(10월 8일) 몸값 × 기준일 종가 ÷ 고른 날 종가
                   날마다 Σ(기준일 몸값 × 선 값) ÷ Σ 기준일 몸값 · 그날 값이 없으면 앞 값
  20거래일 가장 깊이 빠짐 = 선의 꼭대기에서 가장 많이 내려간 비율
  1주 값 · 1년 = 거래소 달력 asOf 까지 253거래일(1년 = asOf 종가 ÷ 252거래일 전 종가 · 1년 가장 깊이 빠짐은 값이 200일 이상일 때) — dump.mjs 값과 맞대어 다르면 멈춤
고르기 다시 셈: ml.select() 로 다시 골라 proposal.json 의 고른 곳 · 차례와 한 곳도 다르지 않은지 먼저 본다(다르면 멈춤).
"""
import gzip, json, os, sys, math, collections, statistics as st
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import isfin  # noqa: E402
import daese  # noqa: E402
import munger  # noqa: E402  멍거 갈래(mg-v1 · 2026-10-14 00:03 「가 로 하자」)
import lynch  # noqa: E402  린치 갈래(ly-v1 · 2026-10-14 06:03 「가」)
import ml  # noqa: E402  멍거 · 린치 조건(ml-v1 · 2026-10-14 06:05 「가」 — 두 갈래 가운데 하나라도 넘은 곳)

if len(sys.argv) != 3:
    sys.exit('site_build: 쓰는 법 python3 scripts/atlas11/t365/site_build.py <now.json(dump.mjs · 10월 10일 모음)> <자료 폴더> — 옛 고를 때 표(sel.json)는 이제 받지 않음')
NOW, OUT = sys.argv[1], sys.argv[2]
ACT = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
UNI = os.environ.get('ATLAS_D365_DIR') or os.path.join(ROOT, ACT['dir'])  # 회차마다 새로 고른 폴더(roll.mjs)를 넘기면 그것
BYI = json.load(open(os.path.join(UNI, 'by-industry.json'), encoding='utf-8'))
PRO = json.load(open(os.path.join(UNI, 'proposal.json'), encoding='utf-8'))
N = json.load(open(NOW, encoding='utf-8'))
PICK = None  # 고른 곳 수 — 멍거 · 린치 조건은 셈한 그대로(아래 RES 에서)


def die(m):
    sys.exit('site_build: ' + m)


def kd(d):
    """2026-10-08 → 10월 8일"""
    y, m, dd = d.split('-')
    return '%d월 %d일' % (int(m), int(dd))


def d2(x):
    """소수 둘째 자리 — 10진수로(0.005 는 위로) · 화면은 이 값을 한 번 더 반올림해 한 자리로 보임"""
    return None if x is None else float(Decimal(repr(x)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


# ── ① 고르기 다시 셈(daese.prepare · munger.select 그대로) — 후보 모두 안/밖과 까닭 ──
#   사장님 12:41 「기준은 항상 오늘날짜로 … 하루에 4번」 — 이어 받은 일봉(환경 변수 ATLAS_T365_CLOSES)까지 합쳐 고르는 날 = 그날(값 · 그림의 날)
#   2026-10-14 00:03 「가 로 하자」 — 고르기는 모음 결산만(주가 · 앞 회차 기록을 안 씀 · 새 결산이 담긴 모음이 들어와야 바뀜)
if PRO['rules']['version'] != ACT['version'] or N['asOf'] != ACT['asOf']:
    die('universe.json(%s · %s) 과 proposal.json(%s) · 후보 표(%s)가 다름' % (ACT['version'], ACT['asOf'], PRO['rules']['version'], N['asOf']))
bnd = json.load(gzip.open(os.path.join(ROOT, ACT['bundle']), 'rt', encoding='utf-8'))
CLOSES = os.environ.get('ATLAS_T365_CLOSES')
rows, MERGED, CAL, SELDAY, OVER = daese.prepare(N['rows'], bnd, CLOSES, ROOT, N['asOf'])
if PRO.get('asOf', N['asOf']) != SELDAY:
    die('proposal.json 의 고르는 날(%s)과 다시 셈한 고르는 날(%s)이 다름 — 같은 이어 받은 일봉인지 보세요' % (PRO.get('asOf'), SELDAY))
LYIN = lynch.inputs(bnd, N['asOf'])  # 린치의 값 = 모음 날 값(이어 받은 일봉은 안 씀 · 같은 모음이면 회차마다 같은 곳)
RES = ml.select(rows, SELDAY, LYIN)
if [p['code'] for p in RES['picked']] != [p['code'] for p in PRO['picked']]:
    die('다시 고른 곳이 proposal.json 과 다름 — 후보 표(첫 인자)가 %s 을 %s 기준으로 푼 것인지 보세요' % (ACT['bundle'], ACT['asOf']))
status = RES['status']
SELPICK = {p['code']: p for p in RES['picked']}
RC = RES['counts']
PICK = RC['picked']
if PICK < 1:
    die('멍거 · 린치 조건을 넘은 곳이 없음')
MC, LC = RC['mg'], RC['ly']
U0 = {'k': 'universe', 'n': RC['universe'], 't': ('코스피 · 코스닥 목록 모두 — 펀드 · 우선주까지(%s 모음)' if N.get('every') else '코스피 · 코스닥 회사 목록(%s 모음)') % kd(N['collectedAt'][:10])}
FUNNEL = {'universe': RC['universe'], 'companies': MC['common'], 'picked': RC['picked'], 'both': RC['both'], 'q': RC['q'],  # companies = 보통주(회사 주식) 수 — 모음 every 면 universe 에 펀드 · 우선주 등이 더 들어 있음
          'groups': [
              {'k': 'mg', 'name': munger.NAME, 'n': MC['picked'], 'q': MC['q'], 'stop': dict(munger.STOP), 'stopName': dict(munger.STOP_NAME),
               'steps': [U0, {'k': 'known', 'n': MC['known'], 't': '3년 성적표가 다 있는 곳' + (' · 「?」 %d곳 뺌' % MC['q'] if MC['q'] else '')},
                         {'k': 's1', 'n': MC['s1'], 't': '① 3년 모두 돈을 벌었음'},
                         {'k': 's2', 'n': MC['s2'], 't': '② 빚이 자기 돈보다 적음'},
                         {'k': 'picked', 'n': MC['picked'], 't': '③ 자기 돈 100원으로 해마다 18원 넘게 벎'}]},
              {'k': 'ly', 'name': lynch.NAME, 'n': LC['picked'], 'q': LC['q'], 'stop': dict(lynch.STOP), 'stopName': dict(lynch.STOP_NAME),
               'steps': [U0, {'k': 'known', 'n': LC['known'], 't': '3년 성적표 · 값이 있는 곳' + (' · 「?」 %d곳 뺌' % LC['q'] if LC['q'] else '')},
                         {'k': 'l0', 'n': LC['l0'], 't': '처음 해와 끝 해에 한 주 이익이 있는 곳'},
                         {'k': 'l1', 'n': LC['l1'], 't': '① 한 주 이익이 해마다 20 ~ 25% 큼'},
                         {'k': 'picked', 'n': LC['picked'], 't': '② 크는 빠르기에 견줘 값이 쌈'}]}]}

# ── ② 20거래일 창 · 지수 · 회사 선 — 모음 종가 + 이어 받은 종가(사장님 09:37 「현재에서 지난 20일 거래 · 항상」 · 12:41 「기준은 항상 오늘날짜」) ──
#   by-industry.json(organize.mjs)의 묶음(갈래 → 업종 → 회사)을 씀 · 창의 끝 = 고르는 날
NOWROW = {r['code']: r for r in N['rows']}   # 모음 날 값(결산 · 몸값 배율)
SELROW = {r['code']: r for r in rows}        # 고르는 날에 맞춘 값(몸값 · 거래대금)
members = {}
ind_of = {}
for g in BYI['groups']:
    for i in g['industries']:
        for m in i['companies']:
            members[m['code']] = m
            ind_of[m['code']] = (g['id'], i['name'])
if len(members) != PICK or set(members) != set(SELPICK):
    die('업종 정리 파일의 회사 %d곳이 고른 %d곳과 다름' % (len(members), PICK))
iso8 = lambda d: '%s-%s-%s' % (d[:4], d[4:6], d[6:])
crow = {c: {iso8(r[0]): r[4] for r in MERGED['stocks'][c]['fchart']['rows'] if r[4] and r[4] > 0 and iso8(r[0]) <= SELDAY} for c in members}
BLAST = OVER['blast']  # 모음의 마지막 날(10월 8일)
dcnt = collections.Counter(d for c in members for d in crow[c])
DAYS = sorted(d for d, n in dcnt.items() if n > len(members) / 2)  # 365곳 가운데 절반 넘게 종가가 있는 날
asof = DAYS[-1]  # 마지막 종가 날 = 「현재」 = 고르는 날
if asof != SELDAY:
    die('365곳 마지막 종가 날 %s 이 고르는 날 %s 과 다름' % (asof, SELDAY))
Y = [d for d in CAL if d <= asof]
if not Y or Y[-1] != asof:
    die('마지막 종가 날 %s 이 거래소 달력의 거래일이 아님' % asof)
WN = 20  # 지난 20거래일
dates = Y[-(WN + 1):]  # 기준일(20거래일 전) + 20거래일
if any(d not in DAYS for d in dates):
    die('20거래일 창 안에 365곳 절반 넘게 종가가 없는 날이 있음: %s' % [d for d in dates if d not in DAYS])
NDAY = len(dates)
base = dates[0]
PICK_ASOF = SELDAY  # 고르는 날 = 마지막 종가 날(사장님 12:41 「기준은 항상 오늘날짜」)
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
    # 고른 날 몸값의 바탕 종가 — 그날 종가가 있으면 그날(daese.refresh 가 그날 값으로 맞춤) · 없으면 모음 날 종가(refresh 가 몸값을 안 바꿈)
    #   멍거 조건(mg-v1)은 결산만으로 고르므로 거래가 멈춘 회사도 남음(2026-10-14 · 회차 시험 「거래정지처럼」) — 둘 다 없으면 큰 회사는 크게 셈에서만 뺌
    a = px(c, PICK_ASOF)
    if not a and PICK_ASOF != N['asOf']:
        a = px(c, N['asOf'])
    b = px(c, base)
    capb[c] = cap_sel[c] * b / a if (a and b and cap_sel[c]) else None  # 기준일 몸값(주식 수가 그대로라고 봄) · 기준일 종가가 없으면 빼고 셈


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
core_all = node('고른 곳 전체', all_codes, eq_index(all_codes))
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
    companies[c] = {
        'name': sel['name'], 'market': sel['market'], 'g': gid, 'i': iname,
        'cap': ((now or sel).get('capEok') if PSCALE[c] == 1.0 or (now or sel).get('capEok') is None else round((now or sel).get('capEok') * PSCALE[c])), 'price': close, 'priceDate': lastd,
        'chg': d2(v[-1] - 100) if v[-1] is not None else None, 'mdd': d2(mdd(v) * 100),
        'r1y': d2(r1y * 100) if r1y is not None else None,
        'mdd1y': d2(mdd1y * 100) if mdd1y is not None else None,
        'per': per, 'jump': jump, 'products': (now or sel).get('products') or None, 'sector': sel.get('sector'),
        'fin': {'key': key, **rec} if rec else None,
        # 든 까닭(ml-v1) — 꼬리표(mg · ly) · 멍거 갈래 3해 값 · 린치 갈래 처음 · 끝 해 EPS · 해마다 큰 % · 배당 % · 값 점수(모음 날 값) · 차례는 싣지 않음(규칙 55)
        'pick': {'sector': u['sector'], 'tags': list(u['tags']),
                 'mg': {'years': list(u['mg']['years']), 'net': list(u['mg']['net']), 'op': list(u['mg']['op']) if u['mg']['op'] else None,
                        'roe': [d2(x) for x in u['mg']['roe']], 'debt': [d2(x) for x in u['mg']['debt']]} if u['mg'] else None,
                 'ly': {'years': list(u['ly']['years']), 'eps': list(u['ly']['eps']), 'g': d2(u['ly']['g']), 'dps': u['ly']['dps'], 'px': u['ly']['px'], 'pxDay': u['ly']['pxDay'],
                        'yld': d2(u['ly']['yld']), 'per': u['ly']['per'], 'score': d2(u['ly']['score'])} if u['ly'] else None},
    }
    lines[c] = [None if x is None else int(round(x * 100)) for x in v]

pers = [p for p in PERX.values() if p is not None and p > 0]
per_med = d2(st.median(pers)) if pers else None
ndd50 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -50)
ndd30 = sum(1 for c in companies.values() if c['mdd1y'] is not None and c['mdd1y'] <= -30)
n1y = sum(1 for c in companies.values() if c['mdd1y'] is not None)
big2 = sorted(companies, key=lambda c: -(companies[c]['cap'] or 0))[:2]

RTXT = ml.rules_text(RES, ACT.get('slots') or [], kd(N['asOf']))  # 회차 시각은 universe.json slots 에서(틀림 장부 21번 — 옛 시각 글이 남던 것)
core = {
    'schema': 'atlas-new-core-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'asOf': asof, 'base': base, 'days': NDAY - 1, 'pickAsOf': PICK_ASOF, 'kPick': kPick, 'sincePick': DAYS.index(asof) - DAYS.index(PICK_ASOF),
    # 마지막 날 값을 그날 저녁 8시(서울) 전에 받았으면 아직 바뀔 수 있음(시간외 · 넥스트레이드) — 다음 받기에서 고쳐짐
    'provisional': bool(OVER['lastFile'] and asof > BLAST and (lambda t: t[:10] == asof and t[11:13] < '20')((datetime.fromisoformat(OVER['lastFile']['startedAt'].replace('Z', '+00:00')).astimezone(timezone(timedelta(hours=9)))).isoformat())),
    'roll': {'files': OVER['files'], 'added': OVER['added'], 'mismatch': len(OVER['mismatch'])},
    'sources': {'price': ('네이버 증권 일봉 · %s 모음(%s 종가까지)' % (kd(N['collectedAt'][:10]), kd(asof))) if not OVER['added'] else
                          ('네이버 증권 일봉 · %s 모음 + 날마다 이어 받음(%s 종가까지)' % (kd(N['collectedAt'][:10]), kd(asof))),
                'pick': '네이버 증권 결산 · 업종(%s 모음) · 확정 결산 3해(예상치는 안 씀)' % kd(N['collectedAt'][:10])},
    'dates': dates, 'all': core_all, 'groups': groups, 'industries': industries,
    'facts': {'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat'], 'dd50': ndd50, 'dd30': ndd30, 'n1y': n1y,
              'perMedian': per_med, 'perN': len(pers),
              # 멍거 갈래 — 값이 1년 이익의 30배 넘는 곳 수(빼지 않고 보여 주기만) · 금융 수(멍거 갈래 안)
              'mg': {'per30': RC['per30'], 'fin': RC['fin']},
              'big': [{'code': c, 'name': companies[c]['name'], 'chg': companies[c]['chg']} for c in big2],
              'jumpN': sum(1 for c in companies.values() if c['jump'])},
    'funnel': FUNNEL,
    'rules': {**{k: RTXT[k] for k in ('version', 'label', 'line', 'data', 'groups', 'conds', 'price', 'wait', 'notCounted', 'limits', 'notMunger', 'q', 'next')},
              'name': ml.NAME, 'debtLine': munger.DEBT, 'roeLine': munger.ROE, 'growLine': [lynch.GLO, lynch.GHI], 'scoreLine': lynch.SCORE, 'lyDay': N['asOf'], 'slots': list(ACT.get('slots') or [])},
}

# ── ④ 찾기 이름표(후보 표 모두) ──
names = []
for r in sorted(rows, key=lambda r: -(r['capEok'] or 0)):
    s = status[r['code']]
    item = {'c': r['code'], 'n': r['name'], 's': s['s']}
    if s['s'] == 'in':
        item['g'], item['i'] = ind_of[r['code']]
    else:  # 밖 — 갈래마다 멈춘 자리(sm · sl)와 까닭(멍거 — … / 린치 — …) · 회사 주식이 아닌 것(모음 every — 펀드 · 증권 · 우선주 · 스팩 · 리츠)은 종류 한 줄 + 종류 k
        if r.get('kindName'):
            item['w'], item['k'] = '%s — 회사 주식이 아니라 두 조건을 셀 수 없음' % r['kindName'], r['kind']
        else:
            item['w'] = '멍거 — %s / 린치 — %s' % (s['mg']['why'], s['ly']['why'])
        item['sm'], item['sl'] = s['mg']['s'], s['ly']['s']
        item['m'] = r['market']
    names.append(item)
NAMES = {'schema': 'atlas-new-names-1', 'asOf': PICK_ASOF, 'collected': kd(N['collectedAt'][:10]), 'n': len(names), 'funnel': {k: FUNNEL[k] for k in ('universe', 'picked', 'both', 'q')}, 'rows': names}

os.makedirs(OUT, exist_ok=True)
def dump(name, obj):
    p = os.path.join(OUT, name)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    return os.path.getsize(p)
# ── ⑤ 4단 「지나온 길」(사장님 2026-10-11 08:10 「지금 3단 클릭으로 되어있어 5단 클릭으로 해」) — 회사마다 3년 남짓 종가 · 해마다 번 돈 ──
#   days.json = 거래일(365곳 가운데 절반 넘게 종가가 있는 날 — range_mc.py 와 같은 날) · 365곳 같은 무게 지수(날마다 평균 · 하루 ±50% 넘는 값 뺌 · 이어 곱함 · 첫날 = 100)
#   co/<번호>.json = 그 회사 종가(days 색인 k0 부터 · 없는 날 null) · 하루 ±30.5% 넘게 바뀐 날(한국 가격 제한 밖 — 주식 수 바뀜일 수 있음) · 해마다 기록(예상 E 뺌)
#   (모음 · 종가 표 crow · 거래일 DAYS 는 ② 에서 읽은 것을 그대로 씀)
lvl, allv = 100.0, [100.0]
for k in range(1, len(DAYS)):
    rs = [crow[c][DAYS[k]] / crow[c][DAYS[k - 1]] - 1 for c in members if DAYS[k] in crow[c] and DAYS[k - 1] in crow[c]]
    rs = [r for r in rs if abs(r) < 0.5]
    if rs:
        lvl *= 1 + sum(rs) / len(rs)
    allv.append(round(lvl, 2))
# ⑤-1 회사 성장 이야기(사장님 2026-10-11 16:51 「… 경쟁 회사가 어떻게 되고 있는데 … 독점 회사면 독보적으로 … 경쟁이 많아가지고 좀 그럴 것이다 … 상식적인 얘기로 미래 추론을 해라 …
#   주가를 … 하라는 얘기가 아니라 회사의 성장을 얘기 하란 얘기야 … 담백하게」 · 16:56 「3번」 365곳 모두 · 16:57 「이건 봉인하지마」)
#   숫자(구글팀) = grow.py build() — 결산 · 2026E · 우리나라 상장 같은 업종 안 크기 · 이야기(애플팀 · 클로드팀) = reports/atlas11/t365/grow/stories-*.json 가장 새 것
#   co/<번호>.json 의 grow 와 grow.json(요약) — 이야기가 아직 없는 회사는 숫자만(화면 「? 조사 중」) · 봉인하지 않음(새 소식이 나오면 새 파일)
import subprocess  # noqa: E402
import grow  # noqa: E402
IND_ALL = json.loads(subprocess.run(['node', os.path.join(HERE, 'ind_all.mjs'), NOW], check=True, capture_output=True, text=True).stdout)
GB = grow.build(N, NAMES, {'companies': companies}, bnd, IND_ALL)
STORIES = grow.latest_stories(os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow'))
GROWCO = {c: grow.site_entry(GB[c], STORIES.get(c)) for c in members}
gsum = {c: {'s': e['story']['shape'], 'g': {h: e['story']['h'][h]['g'] for h in grow.HS}, 'm': {h: e['story']['h'][h]['mid'] for h in grow.HS}} for c, e in GROWCO.items() if e['story']}
core['grow'] = {'written': len(gsum), 'of': len(GROWCO), 'files': sorted({e['story']['file'] for e in GROWCO.values() if e['story']}),
                'g10': {gr: sum(1 for x in gsum.values() if x['g']['10'] == gr) for gr in grow.GRADES}, 'g10none': sum(1 for x in gsum.values() if x['g']['10'] is None),
                'shapes': {k: sum(1 for x in gsum.values() if x['s'] == k) for k in ('혼자 앞섬', '몇 곳이 나눔', '다투는 곳이 많음', '새로 생기는 판')}}
GCHK = sorted(f for f in os.listdir(os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow')) if f.startswith('check-') and f.endswith('.json')) if os.path.isdir(os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow')) else []
if GCHK:  # 따로 다시 확인(17:56 「예약」 4차) — 가장 새 기록의 수 + 회사마다 판정(7단 · 2026-10-12 CIA팀: 기사로 확인한 경쟁 회사가 화면에 「기사로 못 봄」으로 남던 것)
    _gc = json.load(open(os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow', GCHK[-1]), encoding='utf-8'))
    core['grow']['check'] = {'file': 'reports/atlas11/t365/grow/' + GCHK[-1], 'made': _gc['made'][:10],
                             'facts': {k: _gc['facts'][k] for k in ('n', '맞음', '일부만 맞음', '틀림', '못 엶')}, 'rivals': {k: _gc['rivals'][k] for k in ('n', '기사로 확인', '다른 일을 함', '확인 못 함')}}
    _rv = {(x['code'], x['rival']): x for x in _gc['rivals']['items']}
    _fv = {(x['code'], x['url'], x['text']): x['verdict'] for x in _gc['facts']['items']}
    for c, e in GROWCO.items():
        if not e['story']:
            continue
        e['story']['rivals'] = [dict(rv, chk={'v': _rv[(c, rv['name'])]['verdict'], 'url': _rv[(c, rv['name'])].get('url') or None}) if (c, rv.get('name')) in _rv and not rv.get('url') else rv for rv in e['story']['rivals']]
        e['story']['facts'] = [dict(f, chk=_fv[(c, f.get('url'), f.get('text'))]) if (c, f.get('url'), f.get('text')) in _fv else f for f in e['story']['facts']]
# 치우침(6단 「다르게 보면」 · CIA팀 「바깥에서 보기」) — grow_bias.py 와 같은 셈을 지금 365곳으로(site_verify ⑬ 이 노드로 다시 셈)
import grow_bias  # noqa: E402
core['grow']['bias'] = grow_bias.screen(grow_bias.bias([(c, companies[c], GROWCO[c]) for c in sorted(members)]))
core['grow']['factN'] = sum(len(e['story']['facts']) for e in GROWCO.values() if e['story'])  # 따로 다시 확인 「표본」의 모집단(CIA팀 2026-10-12)
_fut = [d for d in daese.cal_sessions(ROOT) if d > asof]
core['mcEnd'] = _fut[19] if len(_fut) >= 20 else None  # 7단 한 달 범위를 처음 맞대 볼 날 = 고른 날에서 20거래일 뒤(거래소 달력 · CIA팀 2026-10-12)
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
        json.dump({'schema': 'atlas-new-co-1', 'code': c, 'k0': k0, 'close': cl, 'jumps': jumps, 'fin': fin, 'per': cper, 'pbr': cpbr, 'key': 'net' if isfin(SELROW[c]) else 'op', 'grow': GROWCO[c]}, fh, ensure_ascii=False, separators=(',', ':'))
        fh.write('\n')
    nco += 1
with open(os.path.join(OUT, 'days.json'), 'w', encoding='utf-8') as fh:
    json.dump({'schema': 'atlas-new-days-1', 'asOf': asof, 'dates': DAYS, 'all': allv}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write('\n')

# ── ⑥ 시간(사장님 2026-10-11 14:37 · 14:39 「현재에 집중하며 과거도 존중하며 3년후 5년후 10년후에 이야기를 담에내는 … 과감하게 하라」) ──
#   봉인(capsule.py · reports/atlas11/t365/capsule/capsule-<번호>.json — 잠근 날 · 규칙 · 회사 · 종가 · 봉인 번호)을 읽어
#   ⓐ 지나온 길 = 봉인 날 3년 전(그날 또는 그 뒤 첫 거래일) → 봉인 날: 봉인한 365곳 · 후보 모두를 그때 같은 돈으로 나눠 샀다면(그대로 둠 · 그날 값이 없으면 그 앞 값)
#   ⓑ 봉인 뒤 지금까지 = 봉인 날 종가(잠근 값) → 마지막 종가 날: 365곳 · 후보 모두(같은 셈 · 회차마다 다시)
#      — 봉인 1호에 함께 잠근 골라 낸 목록(옛 36곳)은 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」로 셈 · 화면 자료에서 뺌(봉인 파일 · 번호는 그대로)
#   ⓒ 다시 여는 날 = 봉인에 적힌 3 · 5 · 10년 뒤(남은 날은 화면이 오늘 날짜로 셈) — 앞날 값은 만들지 않음(규칙 49)
from capsule import digest_of, plus_years  # noqa: E402
from datetime import date as _date  # noqa: E402
CAP_DIR = os.path.join(ROOT, 'reports', 'atlas11', 't365', 'capsule')
MROW = {}


def mrow(c):
    """후보 회사의 종가 표(모음 + 이어 받은 일봉) — 마지막 종가 날까지"""
    if c not in MROW:
        st_ = (MERGED['stocks'].get(c) or {}).get('fchart') or {}
        MROW[c] = {iso8(r[0]): r[4] for r in (st_.get('rows') or []) if r[4] and r[4] > 0 and iso8(r[0]) <= asof}
    return MROW[c]


def hold(codes, days, base_px):
    """같은 돈을 나눠 사서 그대로 둔 값의 평균(첫날 = 100) · 그날 값이 없으면 그 앞 값 · 기준 값이 없는 회사는 뺌"""
    have = [c for c in codes if base_px.get(c)]
    last, out = {}, []
    for d in days:
        s = 0.0
        for c in have:
            v = mrow(c).get(d)
            if v:
                last[c] = v
            s += last.get(c, base_px[c]) / base_px[c]
        out.append(round(s / len(have) * 100, 2) if have else None)
    return out, have


TIME = None
caps = sorted((f for f in os.listdir(CAP_DIR) if f.startswith('capsule-') and f.endswith('.json')), key=lambda f: int(f[8:-5])) if os.path.isdir(CAP_DIR) else []
tcaps = []
for fn in caps:
    cap = json.load(open(os.path.join(CAP_DIR, fn), encoding='utf-8'))
    if digest_of(cap) != cap['digest']:
        die('봉인 %s 의 내용이 봉인 번호와 다름 — 봉인은 고치지 않습니다(바꾸려면 새 번호)' % fn)
    seal = cap['seal']
    if seal > asof or seal not in DAYS:
        continue  # 봉인 날이 이 자료 밖(시험 자료 등)이면 건너뜀
    mem = [m[0] for m in cap['members']]
    pool = [p[0] for p in cap['pool'] if p[1]]
    # ⓐ 지나온 길 — 봉인 날 3년 전부터
    p_from = next(d for d in DAYS if d >= plus_years(_date.fromisoformat(seal), -3).isoformat())
    W = [d for d in DAYS if p_from <= d <= seal]
    pb = {c: mrow(c).get(p_from) for c in set(mem) | set(pool)}
    pv365, ph365 = hold(mem, W, pb)
    pvpool, phpool = hold(pool, W, pb)
    rat = [mrow(c)[seal] / pb[c] for c in ph365 if mrow(c).get(seal)]
    half = 0
    for c in ph365:
        pk, mm = 0, 0.0
        for d in W:
            v = mrow(c).get(d)
            if v:
                pk = max(pk, v)
                mm = min(mm, v / pk - 1)
        half += mm <= -0.5
    past = {'from': p_from, 'to': seal, 'dates': W, 'v365': pv365, 'vpool': pvpool, 'n365': len(ph365), 'skip365': len(mem) - len(ph365),
            'nPool': len(phpool), 'mult365': round(pv365[-1] / 100, 4), 'multPool': round(pvpool[-1] / 100, 4),
            'med365': round(st.median(rat), 4) if rat else None, 'half': half}
    # ⓑ 봉인 뒤 지금까지 — 잠근 종가에서
    TD = [d for d in DAYS if seal <= d <= asof]
    sp = {m[0]: m[2] for m in cap['members']}
    sp.update({p[0]: p[1] for p in cap['pool'] if p[1]})
    sv365, sh365 = hold(mem, TD, sp)
    svpool, shpool = hold(pool, TD, sp)
    stale = lambda codes: sum(1 for c in codes if not mrow(c).get(TD[-1]))
    since = {'dates': TD, 'days': len(TD) - 1, 'v365': sv365, 'vpool': svpool,
             'chg365': d2(sv365[-1] - 100) if len(TD) > 1 else None,
             'chgPool': d2(svpool[-1] - 100) if len(TD) > 1 else None,
             'have365': len(sh365), 'havePool': len(shpool), 'stale365': stale(sh365), 'stalePool': stale(shpool)}
    rules_shown = [r for r in cap['rules'] if '36곳' not in r]  # 골라 낸 목록 줄은 화면에서 뺌(봉인 파일은 그대로)
    hidden = len(cap['rules']) - len(rules_shown)
    tcaps.append({'id': cap['id'], 'seal': seal, 'digest': cap['digest'], 'sealedAt': cap['sealedAt'], 'file': 'reports/atlas11/t365/capsule/' + fn,
                  'version': cap['version'], 'opens': cap['opens'], 'rules': rules_shown, 'members': [[m[0], m[2]] for m in cap['members']],
                  'rulesNote': ('봉인 규칙 %d줄 가운데 골라 낸 목록에 대한 %d줄은 사장님 2026-10-13 말씀으로 화면에서 뺐습니다 — 봉인 파일 · 봉인 번호는 그대로' % (len(cap['rules']), hidden)) if hidden else None,
                  'nPool': len(cap['pool']), 'poolNoClose': len(cap['pool']) - len(pool), 'past': past, 'since': since})
if tcaps:
    TIME = {'schema': 'atlas-new-time-1', 'asOf': asof, 'capsules': tcaps}
    k0 = tcaps[0]
    core['time'] = {'id': k0['id'], 'seal': k0['seal'], 'digest': k0['digest'][:12], 'opens': k0['opens'],
                    'past': {k: k0['past'][k] for k in ('from', 'mult365', 'multPool', 'n365', 'nPool', 'half')},
                    'since': {k: k0['since'][k] for k in ('days', 'chg365', 'chgPool')}}

sz = {'core.json': dump('core.json', core), 'comp.json': dump('comp.json', {'schema': 'atlas-new-comp-1', 'asOf': asof, 'companies': companies}), 'lines.json': dump('lines.json', {'schema': 'atlas-new-lines-1', 'asOf': asof, 'base': base, 'lines': lines}), 'names.json': dump('names.json', NAMES)}
if TIME:
    sz['time.json'] = dump('time.json', TIME)
sz['grow.json'] = dump('grow.json', {'schema': 'atlas-new-grow-1', 'asOf': asof, 'written': len(gsum), 'of': len(GROWCO), 'companies': gsum})
print(json.dumps({'days': len(DAYS), 'co': nco, 'bytes': sz, 'groups': len(groups), 'industries': len(industries), 'companies': len(companies), 'names': len(names),
                  'all': {'chg': core_all['chg'], 'cwChg': core_all['cwChg'], 'up': core_all['up'], 'down': core_all['down'], 'flat': core_all['flat']},
                  'dd50': ndd50, 'dd30': ndd30, 'perMedian': per_med, 'jump': sum(1 for c in companies.values() if c['jump']),
                  'asOf': asof, 'base': base, 'roll': core['roll'], 'provisional': core['provisional'], 'mismatch': OVER['mismatch'][:10]}, ensure_ascii=False))
