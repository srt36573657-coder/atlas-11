#!/usr/bin/env python3
"""대세 365곳 고르기 — 새 ATLAS 의 바탕 365곳(옛 t365-v1 은 reports/atlas11/universe/2026-10-10-t365 기록으로 남김)
사장님 2026-10-11 10:49 「365종목에 기준을 변경한다 현재 기준으로 앞으로 30일 이전 30일 거래일동안 대세였던 종목과 대세될 기능성이 높은 종목으로 변경한다」
  → 11:32 「대세 기준에은 구글팀이라면 cia팀이라면 ?」
  → 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」(d365-v1 · 10월 8일 한 번)
  → 12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」(d365-v2 · 회차마다 다시)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
d365-v1(2026-10-11 11:43) 그대로에 v2(12:41)는 둘만 더함: ① 회차마다 그날까지 값으로 다시 고름 ② 고르는 날 종가가 없는 회사(거래정지 등)는 기본 문에서 뺌
자료      후보 표 = dump.mjs 가 모음 reports/atlas11/universe/2026-10-10/bundle.json.gz 를 푼 것(회사 목록 · 결산 · 업종 = 10월 10일 모음 그대로)
          주가 · 거래량 = 같은 모음 네이버 일봉 + 회차마다 이어 받은 일봉(closes_fetch.mjs · 모음 마지막 날 뒤 날만 이어 붙임 · 모음 안 날 값이 0.5% 넘게 다르면 그 회사는 그 파일에서 받지 않음)
          시가총액 = 모음 날 몸값 × 고르는 날 종가 ÷ 모음 날 종가(주식 수가 그대로라고 봄) · 하루 거래대금 · 주가 기록 수 = 고르는 날까지 일봉으로 다시 셈
고르는 날  후보 표 절반 넘게 종가가 있는 마지막 날(낮 회차면 그날 장중 값 — 아직 바뀜)
기본 문    rules.blue(시가총액 1,000억 원 · 하루 거래대금 3억 원(60거래일 평균) · 부채비율 200% · 주가 기록 260거래일 · 흑자) + 보통주 + 고르는 날 종가 있음(v2)
업종      네이버 업종(띄어쓰기 뺌) · 기본 문 지난 회사가 3곳 이상인 업종만 순서를 매김
거래일    거래소 달력(public/data/input.json + public/data/rolling-calendar.json) · 달력이 끝난 뒤는 후보 표 절반 넘게 종가가 있는 날 · 쓰는 날마다 절반 넘게 종가가 있어야 함(아니면 멈춤)
창        30거래일(고르는 날 30거래일 전 → 고르는 날) · 흔들림 60거래일 · 돈 = 마지막 10거래일 대 그 앞 60거래일
업종 지수  한 회사 한 표 — 창 처음 · 끝에 종가가 있는 회사만(3곳 밑이면 순서 없음) · 날마다 하루 변화(±50% 넘는 값 뺌)의 같은 무게 평균을 이어 곱함
구글팀    S2 = 30거래일 변화 ÷ (60거래일 지수 하루 변화 표준편차 × √30) · 순서 매긴 업종 가운데 위 20%(반올림)
CIA팀     값 강함(곧은 선 30거래일 +10% 넘음 · 곧음 0.6 이상 · 처음→끝 오름) 그리고 셋 가운데 둘 이상:
          ① 오른 회사 60% 이상(30거래일) ② 거래대금 몫 +10% 이상(업종 거래대금 ÷ 순서 매긴 업종 모두 — 마지막 10거래일 몫 ÷ 그 앞 60거래일 몫 − 1)
          ③ 이익이 늘어난 회사 60% 이상(rules.growth · 업종 안 기본 문 지난 회사 모두로 셈)
층        1층 = 두 팀 모두 고른 업종(「대세였던 곳」) · 2층 = 한 팀만 고른 업종 · 3층 = 나머지 순서 매긴 업종
채우기    층 → 층 안 S2 큰 순으로 업종째 · 업종을 다 넣으면 365곳을 넘을 때 그 업종은 회사 30거래일 변화 큰 순(값 없음은 맨 뒤 · 같으면 시가총액 큰 순 · 종목 번호)으로 남은 자리만
같은 원문이면 언제나 같은 365곳 · 따로 세기 = daese_verify.mjs(노드로 처음부터 다시 셈 · 같은 이어 받은 일봉)
한계      이미 오른 업종에서 고르므로 고른 기간의 선은 좋아 보이기 쉬움 — 앞으로도 그렇다는 뜻이 아님 · 결산 · 업종 · 회사 목록은 새 모음을 받을 때까지 10월 10일 값

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08
  python3 scripts/atlas11/t365/daese.py <임시>/now.json <결과 폴더> [--closes <이어 받은 일봉 폴더>]
만드는 것: proposal.json(365곳 · 업종 표 · 밖 회사마다 까닭 · 고르는 날 · 이어 받은 일봉 셈) · list.csv(365곳)
site_build.py · range_mc.py 는 select() · merge() 를 불러 같은 값으로 다시 고르고 proposal.json 과 한 곳도 다르지 않은지 먼저 본다.
"""
import collections, gzip, json, math, os, statistics as st, sys
from datetime import datetime, timezone
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import blue, growth, nz  # noqa: E402

VERSION = 'd365-v2'
BUNDLE = 'reports/atlas11/universe/2026-10-10/bundle.json.gz'
CAP, ATV, DEBT, NDAYS = 1000, 3, 200, 260
W, WSD, MREC, MPREV = 30, 60, 10, 60
MIN_SECTOR, TOP, OUTLIER, PICK = 3, 0.2, 0.5, 365
CIA_FIT, CIA_R2, CIA_BR, CIA_MON, CIA_EARN = 0.10, 0.6, 0.6, 0.10, 0.6

iso8 = lambda d: '%s-%s-%s' % (d[:4], d[4:6], d[6:])
kd = lambda d: '%d월 %d일' % (int(d[5:7]), int(d[8:10]))
CLOSES_SCHEMAS = ('atlas-t365-closes-1', 'atlas-t365-closes-2')  # 1 = [날, 종가] · 2 = [날, 종가, 거래량]


def cal_sessions(root=ROOT):
    """거래소 달력 = public/data/input.json + public/data/rolling-calendar.json(공휴일 · 휴장 원칙으로 11월까지 늘린 판)의 합"""
    s = set(json.load(open(os.path.join(root, 'public/data/input.json'), encoding='utf-8'))['calendar']['sessions'])
    p = os.path.join(root, 'public/data/rolling-calendar.json')
    if os.path.exists(p):
        s |= set(json.load(open(p, encoding='utf-8')).get('sessions') or [])
    return sorted(s)


def read_closes(dirpath):
    """이어 받은 일봉 파일(closes_fetch.mjs) — 파일 이름(받은 때) 차례 · [(파일 이름, startedAt, {번호: [[YYYYMMDD, 종가, 거래량?], …]})]"""
    out = []
    if dirpath and os.path.isdir(dirpath):
        for fn in sorted(f for f in os.listdir(dirpath) if f.endswith('.json.gz')):
            snap = json.load(gzip.open(os.path.join(dirpath, fn), 'rt', encoding='utf-8'))
            if snap.get('schema') in CLOSES_SCHEMAS:
                out.append((fn, snap.get('startedAt'), snap.get('rows') or {}))
    return out


def merge(bundle, codes, snaps, tol=0.005):
    """모음 일봉 + 이어 받은 일봉 → 모음 꼴 {'stocks': {번호: {'fchart': {'rows': [[YYYYMMDD, 시, 고, 저, 종가, 거래량], …]}}}}, 셈
    모음의 마지막 날(후보 모두 가운데 가장 늦은 날) 뒤 날만 이어 붙임 · 같은 날은 나중 파일이 이김 ·
    그 파일의 모음 안 날 값이 0.5% 넘게 다르면(쪼개기 · 증자로 지난 값을 고쳐 적음) 그 회사는 그 파일에서 받지 않음 → 그 회사 새 날은 없음"""
    base = {c: [r for r in (((bundle['stocks'].get(c) or {}).get('fchart') or {}).get('rows') or []) if r[4] and r[4] > 0] for c in codes}
    blast = max((r[0] for rs in base.values() for r in rs), default='')
    bmap = {c: {r[0]: r[4] for r in rs} for c, rs in base.items()}
    add = {c: {} for c in codes}
    st_ = {'files': 0, 'added': 0, 'mismatch': [], 'lastFile': None, 'blast': iso8(blast) if blast else None}
    for fn, started, rows in snaps:
        st_['files'] += 1
        for c, rs in rows.items():
            if c not in bmap:
                continue
            if any(x[0] <= blast and x[0] in bmap[c] and x[1] and abs(x[1] / bmap[c][x[0]] - 1) > tol for x in rs):
                st_['mismatch'].append([fn, c])
                continue
            for x in rs:
                if x[0] > blast and x[1] and x[1] > 0:
                    if x[0] not in add[c]:
                        st_['added'] += 1
                    add[c][x[0]] = (x[1], x[2] if len(x) > 2 else None)
                    st_['lastFile'] = {'file': fn, 'startedAt': started}
    stocks = {c: {'fchart': {'rows': base[c] + [[d, None, None, None, v, vol] for d, (v, vol) in sorted(add[c].items())]}} for c in codes}
    return {'stocks': stocks}, st_


def pick_day(merged, codes, cal):
    """고르는 날 = 후보 절반 넘게 종가가 있는 마지막 날 · 달력이 끝난 뒤 날도 그 조건이면 거래일로 셈 → (고르는 날, 늘린 달력)
    후보 = 종가 줄이 하나라도 있는 곳만(2026-10-14 — 목록 모두 모음은 펀드 · 우선주 등 종가를 받지 않는 1,750줄이 섞여
    「절반」이 보통주의 84%가 되던 것 · 이어 받은 종가가 조금만 빠져도 고르는 날이 멈춰 회차가 실패할 수 있었음)"""
    codes = [c for c in codes if merged['stocks'][c]['fchart']['rows']]
    cnt = collections.Counter(iso8(r[0]) for c in codes for r in merged['stocks'][c]['fchart']['rows'])
    days = sorted(d for d, n in cnt.items() if n > len(codes) / 2)
    ext = sorted(set(cal) | {d for d in days if d > cal[-1]}) if cal else days
    good = [d for d in days if d in set(ext)]
    if not good:
        raise ValueError('후보 절반 넘게 종가가 있는 날이 없음')
    return good[-1], ext


def refresh(rows, merged, day, cap_day):
    """고르는 날에 맞춘 후보 표 — 주가 기록 수 · 하루 거래대금(마지막 60거래일 평균) · 시가총액(모음 날 몸값 × 고르는 날 종가 ÷ 모음 날 종가)"""
    d8, c8 = day.replace('-', ''), cap_day.replace('-', '')
    out = []
    for r in rows:
        rr = [x for x in merged['stocks'][r['code']]['fchart']['rows'] if x[0] <= d8 and x[4] and x[4] > 0]
        tv = [x[4] * (x[5] or 0) for x in rr[-60:]]
        close = {x[0]: x[4] for x in rr}
        px = dict(r.get('px') or {})
        px.update({'n': len(rr), 'atvEok': (sum(tv) / len(tv) / 1e8) if tv else None, 'last': iso8(rr[-1][0]) if rr else None, 'close': rr[-1][4] if rr else None})
        r2 = {**r, 'px': px}
        if d8 != c8 and r.get('capEok') and close.get(d8) and close.get(c8):
            r2['capEok'] = math.floor(r['capEok'] * close[d8] / close[c8] + 0.5)  # 반올림은 .5 를 위로(노드 Math.round 와 같게)
        out.append(r2)
    return out


def prepare(rows, bundle, closes_dir=None, root=ROOT, cap_day=None):
    """회차 한 번의 고르기 재료 — (고르는 날에 맞춘 후보 표, 모음 꼴 일봉, 늘린 달력, 고르는 날, 이어 받은 셈)"""
    codes = [r['code'] for r in rows]
    merged, stats = merge(bundle, codes, read_closes(closes_dir))
    day, cal = pick_day(merged, codes, cal_sessions(root))
    return refresh(rows, merged, day, cap_day or day), merged, cal, day, stats


def prices(bundle, codes):
    """회사마다 날 → 종가 · 날 → 거래대금(종가 × 거래량) — 종가 0 은 없는 값"""
    px, tv = {}, {}
    for c in codes:
        rr = ((bundle['stocks'].get(c) or {}).get('fchart') or {}).get('rows') or []
        px[c] = {iso8(r[0]): r[4] for r in rr if r[4] and r[4] > 0}
        tv[c] = {iso8(r[0]): r[4] * (r[5] or 0) for r in rr if r[4] and r[4] > 0}
    return px, tv


def fit(v):
    """ln(지수)를 날(0 … n−1)에 곧은 선으로 — (기간 변화 e^(기울기 × (n−1)) − 1, 곧음 R²)"""
    n = len(v)
    xs = range(n)
    ys = [math.log(x) for x in v]
    mx, my = (n - 1) / 2, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
    ss = sum((y - my) ** 2 for y in ys)
    res = sum((y - (my + b * (x - mx))) ** 2 for x, y in zip(xs, ys))
    return math.exp(b * (n - 1)) - 1, (1 - res / ss) if ss > 0 else 0.0


def select(rows, bundle, cal, asof):
    """후보 표 rows(dump.mjs) · 모음 bundle · 거래소 달력 cal · 기준 asof → 고른 결과(dict) — 같은 원문이면 언제나 같은 값"""
    byc = {r['code']: r for r in rows}
    px, tv = prices(bundle, list(byc))
    DAYS = [d for d in cal if d <= asof]
    if not DAYS or DAYS[-1] != asof:
        raise ValueError('기준 %s 이 거래소 달력의 거래일이 아님' % asof)
    K = len(DAYS) - 1
    need = MREC + MPREV  # 가장 긴 창 = 돈 70거래일(흔들림 61 · 30거래일 31 보다 김)
    if K < need:
        raise ValueError('거래일이 %d일뿐(%d일 필요)' % (K + 1, need + 1))
    for d in DAYS[K - need + 1:]:
        n = sum(1 for c in byc if d in px[c])
        if not n > len(byc) / 2:
            raise ValueError('%s 에 종가 있는 회사가 %d곳뿐(후보 %d곳의 절반 이하)' % (d, n, len(byc)))
    status, gate_fails, ok = {}, collections.Counter(), []
    for r in rows:
        f = blue(r, CAP, ATV, DEBT, NDAYS)
        if not f and r.get('notCommon'):
            f = '보통주 아님(우선주 · 스팩 · 리츠 등)'
        if not f and not px[r['code']].get(asof):  # v2 — 고르는 날 종가가 없으면(거래정지 등) 뺌
            f = '고르는 날(%s) 종가 없음 — 거래정지 등' % kd(asof)
        if f:
            status[r['code']] = {'s': 'gate', 'why': f}
            gate_fails[f] += 1
        else:
            ok.append(r['code'])
    members = collections.defaultdict(list)
    for c in ok:
        members[nz(byc[c]['sector'])].append(c)
    unranked = []
    sect = {}
    for s, cs in sorted(members.items()):
        if not s:
            unranked.append({'name': '', 'n': len(cs), 'why': '네이버 업종이 비어 있음'})
        elif len(cs) < MIN_SECTOR:
            unranked.append({'name': s, 'n': len(cs), 'why': '기본 문 지난 회사가 %d곳뿐(3곳 미만)' % len(cs)})
        else:
            sect[s] = sorted(cs)

    def index(codes, k0, k1):
        lv, out = 100.0, [100.0]
        for k in range(k0 + 1, k1 + 1):
            rs = [px[c][DAYS[k]] / px[c][DAYS[k - 1]] - 1 for c in codes if px[c].get(DAYS[k]) and px[c].get(DAYS[k - 1])]
            rs = [x for x in rs if abs(x) < OUTLIER]
            if rs:
                lv *= 1 + sum(rs) / len(rs)
            out.append(lv)
        return out

    def tvsum(codes, k0, k1):
        return sum(tv[c].get(DAYS[j], 0) for c in codes for j in range(k0, k1 + 1))

    allc = [c for cs in sect.values() for c in cs]
    tot_rec = tvsum(allc, K - MREC + 1, K) or 1
    tot_prev = tvsum(allc, K - MREC - MPREV + 1, K - MREC) or 1
    F = {}
    for s, cs in sect.items():
        cs2 = [c for c in cs if px[c].get(DAYS[K - W]) and px[c].get(DAYS[K])]
        if len(cs2) < MIN_SECTOR:
            unranked.append({'name': s, 'n': len(cs), 'why': '30거래일 처음 · 끝 종가가 다 있는 회사가 %d곳뿐(3곳 미만)' % len(cs2)})
            continue
        v = index(cs2, K - W, K)
        f, r2 = fit(v)
        chg = v[-1] / v[0] - 1
        vv = index(cs2, K - WSD, K)
        sd = st.pstdev([vv[i] / vv[i - 1] - 1 for i in range(1, len(vv))]) or 1e-9
        br = sum(1 for c in cs2 if px[c][DAYS[K]] > px[c][DAYS[K - W]]) / len(cs2)
        mon = (tvsum(cs2, K - MREC + 1, K) / tot_rec) / ((tvsum(cs2, K - MREC - MPREV + 1, K - MREC) / tot_prev) or 1e-9) - 1
        earn = sum(1 for c in cs if growth(byc[c])[0]) / len(cs)
        strong = f > CIA_FIT and r2 >= CIA_R2 and chg > 0
        hits = [br >= CIA_BR, mon >= CIA_MON, earn >= CIA_EARN]
        F[s] = {'name': s, 'n': len(cs), 'm': len(cs2), 'chg': chg, 'fit': f, 'r2': r2, 'sd': sd, 'z': chg / (sd * math.sqrt(W)),
                'br': br, 'mon': mon, 'earn': earn, 'strong': strong, 'hits': hits, 'cia': strong and sum(hits) >= 2}
    ranked = sorted(F, key=lambda s: (-F[s]['z'], s))
    ntop = max(1, round(len(ranked) * TOP))
    for k, s in enumerate(ranked):
        F[s]['rank'] = k + 1
        F[s]['google'] = k < ntop
        F[s]['tier'] = 1 if F[s]['google'] and F[s]['cia'] else 2 if F[s]['google'] or F[s]['cia'] else 3

    def r30(c):
        a, b = px[c].get(DAYS[K - W]), px[c].get(DAYS[K])
        return b / a - 1 if a and b else None

    ckey = lambda c: (r30(c) is None, -(r30(c) or 0), -(byc[c]['capEok'] or 0), c)
    picked = []
    for s in sorted(ranked, key=lambda s: (F[s]['tier'], F[s]['rank'])):
        x = F[s]
        cs = sorted(sect[s], key=ckey)
        room = PICK - len(picked)
        take = cs if len(cs) <= room else cs[:max(0, room)]
        x['inN'], x['part'] = len(take), 0 < len(take) < len(cs)
        for k, c in enumerate(cs):
            if k < len(take):
                status[c] = {'s': 'in'}
                picked.append({'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': s, 'capEok': byc[c]['capEok'],
                               'r30': r30(c), 'tier': x['tier'], 'srank': x['rank'], 'prank': k + 1, 'pn': len(cs), 'part': x['part']})
            elif room <= 0:
                status[c] = {'s': 'cut', 'why': '대세 순서 %d번째 업종(%s · %d층) — 앞 업종들로 365곳이 이미 참' % (x['rank'], s, x['tier'])}
            else:
                status[c] = {'s': 'cut', 'why': '%s 업종(%d층) 안 30거래일 오른 순 %d번째 — 이 업종은 %d곳까지만 들어감' % (s, x['tier'], k + 1, len(take))}
    for u in unranked:
        for c in members[u['name']]:
            status[c] = {'s': 'sector', 'why': ('네이버 업종 「%s」 — ' % u['name'] if u['name'] else '') + u['why'] + ' · 대세 순서를 매기지 않음'}
    if len(picked) != min(PICK, len(allc)) or len(status) != len(rows):
        raise ValueError('셈이 안 맞음 %d %d' % (len(picked), len(status)))
    tiers = collections.Counter(p['tier'] for p in picked)
    part = [F[s] for s in ranked if F[s]['part']]
    return {
        'version': VERSION, 'asOf': asof,
        'window': {'from': DAYS[K - W], 'to': asof, 'days': W, 'sdFrom': DAYS[K - WSD], 'monRecentFrom': DAYS[K - MREC + 1], 'monPrevFrom': DAYS[K - MREC - MPREV + 1], 'monPrevTo': DAYS[K - MREC]},
        'counts': {'universe': len(rows), 'gate': len(ok), 'gateFails': gate_fails.most_common(), 'sectors': len(sect), 'ranked': len(ranked),
                   'rankedCompanies': sum(F[s]['n'] for s in ranked), 'unrankedCompanies': sum(u['n'] for u in unranked), 'top': ntop,
                   'google': sum(1 for s in ranked if F[s]['google']), 'cia': sum(1 for s in ranked if F[s]['cia']),
                   'both': sum(1 for s in ranked if F[s]['tier'] == 1), 'one': sum(1 for s in ranked if F[s]['tier'] == 2),
                   'tier1': tiers[1], 'tier2': tiers[2], 'tier3': tiers[3], 'picked': len(picked),
                   'part': [{'name': x['name'], 'tier': x['tier'], 'rank': x['rank'], 'in': x['inN'], 'of': x['n']} for x in part]},
        'sectors': [F[s] for s in ranked], 'unranked': unranked, 'picked': picked, 'status': status,
    }


def rules_text(res):
    w = res['window']
    kd = lambda d: '%d월 %d일' % (int(d[5:7]), int(d[8:10]))
    return {
        'version': VERSION,
        'label': '대세 365곳 — 회차마다 그날까지 30거래일 대세였던 업종부터(두 팀 모두 → 한 팀 → 대세에 가까운 순)',
        'said': ['사장님 2026-10-11 10:49(서울) 「365종목에 기준을 변경한다 현재 기준으로 앞으로 30일 이전 30일 거래일동안 대세였던 종목과 대세될 기능성이 높은 종목으로 변경한다」',
                 '사장님 2026-10-11 11:32 「대세 기준에은 구글팀이라면 cia팀이라면 ?」',
                 '사장님 2026-10-11 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」',
                 '사장님 2026-10-11 12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」'],
        'data': '회사 목록 · 결산 · 업종 = 모음 %s(10월 10일) · 주가 · 거래량 = 그 모음 일봉 + 회차마다 이어 받은 네이버 일봉(%s 값까지)' % (BUNDLE, res['asOf']),
        'gate': ['보통주(우선주 · 스팩 · 리츠 · ETF · ETN 빼고)', '시가총액 1,000억 원 이상(고르는 날 종가로 맞춤)', '주가 기록 260거래일(1년) 이상',
                 '하루 거래대금 3억 원 이상(최근 60거래일 평균)', '마지막 결산 흑자 — 영업이익 · 순이익 모두(금융은 순이익만)',
                 '부채비율 200% 이하 — 금융(예금 · 보험금) · 조선 · 방산(미리 받은 돈)은 빚이 크게 잡히는 구조라 빼고 봄',
                 '고르는 날 종가가 있음 — 거래정지 등은 뺌'],
        'window': '지난 30거래일(%s → %s) · 업종 = 네이버 업종(기본 문 지난 회사 3곳 이상)' % (kd(w['from']), kd(w['to'])),
        'google': '구글팀 잣대 — 업종 30거래일 변화를 흔들림(지난 60거래일 하루 변화의 표준편차 × √30)으로 나눈 값이 큰 순 · 순서 매긴 업종 가운데 위 20%',
        'cia': 'CIA팀 잣대 — 업종이 30거래일 동안 곧게(곧음 0.6 이상) 10% 넘게 오르고, ① 업종 안 오른 회사 60% 이상 ② 마지막 10거래일 거래대금 몫이 그 앞 60거래일보다 10% 넘게 늚 ③ 이익이 늘어난 회사 60% 이상 — 셋 가운데 둘 이상',
        'tiers': ['1층 · 두 팀 모두 고른 업종(「대세였던 곳」) — 업종 안 기본 문 지난 회사 모두',
                  '2층 · 한 팀만 고른 업종 — 모두',
                  '3층 · 나머지 업종을 구글팀 잣대 큰 순으로 업종째 채움 — 다 넣으면 365곳을 넘는 마지막 업종은 그 안에서 30거래일 많이 오른 회사부터'],
        'bias': '이미 오른 업종에서 골랐기 때문에, 고른 기간(지난 30거래일)과 겹치는 선은 좋아 보이기 쉽습니다. 앞으로도 그렇다는 뜻이 아닙니다.',
        'next': '하루 4번(08:10 · 12:10 · 16:10 · 21:10 서울) 그날까지 값으로 다시 고름 — 장이 없는 날은 「새 값 없음」으로 기록만',
    }


def why_of(p, F):
    x = F[p['sector']]
    t = {1: '1층 · 두 팀 모두', 2: '2층 · 한 팀(%s)' % ('구글팀' if x['google'] else 'CIA팀'), 3: '3층 · 대세에 가까운 순'}[p['tier']]
    r = '?' if p['r30'] is None else ('%+.0f%%' % (p['r30'] * 100)).replace('-', '−')
    s = '%s: %s(대세 순서 %d번째 · 업종 30거래일 %s) · 이 회사 30거래일 %s' % (t, p['sector'], x['rank'], ('%+.0f%%' % (x['chg'] * 100)).replace('-', '−'), r)
    if p['part']:
        s += ' · 업종 안 오른 순 %d번째(%d곳 가운데 %d곳만)' % (p['prank'], p['pn'], x['inN'])
    return s


def main():
    args = [a for a in sys.argv[1:]]
    closes = None
    if '--closes' in args:
        k = args.index('--closes')
        closes = args[k + 1]
        del args[k:k + 2]
    cands, out_dir = args[0], args[1]
    N = json.load(open(cands, encoding='utf-8'))
    bundle = json.load(gzip.open(os.path.join(ROOT, BUNDLE), 'rt', encoding='utf-8'))
    rows, merged, cal, day, stats = prepare(N['rows'], bundle, closes, ROOT, N['asOf'])
    res = select(rows, merged, cal, day)
    F = {x['name']: x for x in res['sectors']}
    byc = {r['code']: r for r in rows}
    picked = [{'rank': k + 1, **p, 'why': why_of(p, F)} for k, p in enumerate(res['picked'])]
    outside = [{'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'], **res['status'][c]}
               for c in sorted(res['status'], key=lambda c: -(byc[c]['capEok'] or 0)) if res['status'][c]['s'] != 'in']
    doc = {'schema': 'atlas11-d365-proposal-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'from': {'cands': 'dump.mjs %s %s' % (BUNDLE, N['asOf']), 'collectedAt': N['collectedAt'], 'closes': stats},
           'asOf': day, 'rules': rules_text(res), 'window': res['window'], 'counts': res['counts'], 'sectors': res['sectors'], 'unranked': res['unranked'],
           'picked': picked, 'outside': outside}
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'proposal.json'), 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')
    csv = ['차례,층,네이버 업종,대세 순서,종목코드,회사,시장,시가총액(억 원),30거래일(%),까닭']
    for p in picked:
        csv.append(','.join([str(p['rank']), str(p['tier']), p['sector'], str(p['srank']), p['code'], p['name'], p['market'], str(p['capEok']),
                             '' if p['r30'] is None else '%.1f' % (p['r30'] * 100), '"%s"' % p['why'].replace('"', '""')]))
    with open(os.path.join(out_dir, 'list.csv'), 'w', encoding='utf-8') as f:
        f.write('﻿' + '\n'.join(csv) + '\n')
    c = res['counts']
    print(json.dumps({k: c[k] for k in ('universe', 'gate', 'ranked', 'rankedCompanies', 'unrankedCompanies', 'top', 'google', 'cia', 'both', 'one', 'tier1', 'tier2', 'tier3', 'picked', 'part')}, ensure_ascii=False))
    for x in res['sectors']:
        print('%2d %-14s %2d곳 z %+.2f fit %+.1f%% r2 %.2f br %.0f%% mon %+.0f%% earn %.0f%% %s%s %d층 넣음 %d%s' % (
            x['rank'], x['name'][:14], x['n'], x['z'], x['fit'] * 100, x['r2'], x['br'] * 100, x['mon'] * 100, x['earn'] * 100,
            'G' if x['google'] else '-', 'C' if x['cia'] else '-', x['tier'], x['inN'], ' (일부)' if x['part'] else ''))


if __name__ == '__main__':
    main()
