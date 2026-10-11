#!/usr/bin/env python3
"""대세 365곳(d365-v1) 고르기 — 새 ATLAS 의 바탕 365곳을 바꿈(옛 t365-v1 은 reports/atlas11/universe/2026-10-10-t365 기록으로 남김)
사장님 2026-10-11 10:49 「365종목에 기준을 변경한다 현재 기준으로 앞으로 30일 이전 30일 거래일동안 대세였던 종목과 대세될 기능성이 높은 종목으로 변경한다」
  → 11:32 「대세 기준에은 구글팀이라면 cia팀이라면 ?」
  → 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」

━━ 돌리기 전에 정한 것(11:32 두 팀 셈 · 11:43 승인 그대로 · 결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름 d365-v2) ━━
자료      후보 표 = dump.mjs 가 모음 reports/atlas11/universe/2026-10-10/bundle.json.gz 를 푼 것(asOf 2026-10-08) · 종가 · 거래량 = 같은 모음 네이버 일봉
기본 문    rules.blue(시가총액 1,000억 원 · 하루 거래대금 3억 원(60거래일 평균) · 부채비율 200% · 주가 기록 260거래일 · 흑자) + 보통주
업종      네이버 업종(띄어쓰기 뺌) · 기본 문 지난 회사가 3곳 이상인 업종만 순서를 매김
거래일    거래소 달력(public/data/input.json)에서 asOf 까지 · 쓰는 날마다 후보 표 절반 넘게 종가가 있어야 함(아니면 멈춤)
창        30거래일(asOf 30거래일 전 → asOf) · 흔들림 60거래일 · 돈 = 마지막 10거래일 대 그 앞 60거래일
업종 지수  한 회사 한 표 — 창 처음 · 끝에 종가가 있는 회사만(3곳 밑이면 순서 없음) · 날마다 하루 변화(±50% 넘는 값 뺌)의 같은 무게 평균을 이어 곱함
구글팀    S2 = 30거래일 변화 ÷ (60거래일 지수 하루 변화 표준편차 × √30) · 순서 매긴 업종 가운데 위 20%(반올림)
CIA팀     값 강함(곧은 선 30거래일 +10% 넘음 · 곧음 0.6 이상 · 처음→끝 오름) 그리고 셋 가운데 둘 이상:
          ① 오른 회사 60% 이상(30거래일) ② 거래대금 몫 +10% 이상(업종 거래대금 ÷ 순서 매긴 업종 모두 — 마지막 10거래일 몫 ÷ 그 앞 60거래일 몫 − 1)
          ③ 이익이 늘어난 회사 60% 이상(rules.growth · 업종 안 기본 문 지난 회사 모두로 셈)
층        1층 = 두 팀 모두 고른 업종(「대세였던 곳」) · 2층 = 한 팀만 고른 업종 · 3층 = 나머지 순서 매긴 업종
채우기    층 → 층 안 S2 큰 순으로 업종째 · 업종을 다 넣으면 365곳을 넘을 때 그 업종은 회사 30거래일 변화 큰 순(값 없음은 맨 뒤 · 같으면 시가총액 큰 순 · 종목 번호)으로 남은 자리만
같은 원문이면 언제나 같은 365곳 · 따로 세기 = daese_verify.mjs(노드로 처음부터 다시 셈)
한계      이미 오른 업종에서 고르므로 고른 기간의 선은 좋아 보이기 쉬움 — 앞으로도 그렇다는 뜻이 아님 · 30거래일마다 다시 고르기는 아직 안 함

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08
  python3 scripts/atlas11/t365/daese.py <임시>/now.json reports/atlas11/universe/2026-10-11-d365
만드는 것: proposal.json(365곳 · 업종 표 · 밖 회사마다 까닭) · list.csv(365곳)
site_build.py 는 select() 를 불러 다시 골라 proposal.json 과 한 곳도 다르지 않은지 먼저 본다.
"""
import collections, gzip, json, math, os, statistics as st, sys
from datetime import datetime, timezone
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import blue, growth, nz  # noqa: E402

VERSION = 'd365-v1'
BUNDLE = 'reports/atlas11/universe/2026-10-10/bundle.json.gz'
CAP, ATV, DEBT, NDAYS = 1000, 3, 200, 260
W, WSD, MREC, MPREV = 30, 60, 10, 60
MIN_SECTOR, TOP, OUTLIER, PICK = 3, 0.2, 0.5, 365
CIA_FIT, CIA_R2, CIA_BR, CIA_MON, CIA_EARN = 0.10, 0.6, 0.6, 0.10, 0.6

iso8 = lambda d: '%s-%s-%s' % (d[:4], d[4:6], d[6:])


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
        'label': '대세 365곳 — 지난 30거래일 대세였던 업종부터(두 팀 모두 → 한 팀 → 대세에 가까운 순)',
        'said': ['사장님 2026-10-11 10:49(서울) 「365종목에 기준을 변경한다 현재 기준으로 앞으로 30일 이전 30일 거래일동안 대세였던 종목과 대세될 기능성이 높은 종목으로 변경한다」',
                 '사장님 2026-10-11 11:32 「대세 기준에은 구글팀이라면 cia팀이라면 ?」',
                 '사장님 2026-10-11 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」'],
        'data': '코스피 · 코스닥 시가총액 목록 · 결산 · 업종 · 일봉 모음(%s) · 주가는 %s 종가까지' % (BUNDLE, res['asOf']),
        'gate': ['보통주(우선주 · 스팩 · 리츠 · ETF · ETN 빼고)', '시가총액 1,000억 원 이상', '주가 기록 260거래일(1년) 이상',
                 '하루 거래대금 3억 원 이상(최근 60거래일 평균)', '마지막 결산 흑자 — 영업이익 · 순이익 모두(금융은 순이익만)',
                 '부채비율 200% 이하 — 금융(예금 · 보험금) · 조선 · 방산(미리 받은 돈)은 빚이 크게 잡히는 구조라 빼고 봄'],
        'window': '지난 30거래일(%s → %s) · 업종 = 네이버 업종(기본 문 지난 회사 3곳 이상)' % (kd(w['from']), kd(w['to'])),
        'google': '구글팀 잣대 — 업종 30거래일 변화를 흔들림(지난 60거래일 하루 변화의 표준편차 × √30)으로 나눈 값이 큰 순 · 순서 매긴 업종 가운데 위 20%',
        'cia': 'CIA팀 잣대 — 업종이 30거래일 동안 곧게(곧음 0.6 이상) 10% 넘게 오르고, ① 업종 안 오른 회사 60% 이상 ② 마지막 10거래일 거래대금 몫이 그 앞 60거래일보다 10% 넘게 늚 ③ 이익이 늘어난 회사 60% 이상 — 셋 가운데 둘 이상',
        'tiers': ['1층 · 두 팀 모두 고른 업종(「대세였던 곳」) — 업종 안 기본 문 지난 회사 모두',
                  '2층 · 한 팀만 고른 업종 — 모두',
                  '3층 · 나머지 업종을 구글팀 잣대 큰 순으로 업종째 채움 — 다 넣으면 365곳을 넘는 마지막 업종은 그 안에서 30거래일 많이 오른 회사부터'],
        'bias': '이미 오른 업종에서 골랐기 때문에, 고른 기간(지난 30거래일)과 겹치는 선은 좋아 보이기 쉽습니다. 앞으로도 그렇다는 뜻이 아닙니다.',
        'next': '30거래일마다 다시 고르기는 아직 하지 않음 — 그 사이엔 같은 365곳 · 선은 날마다',
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
    cands, out_dir = sys.argv[1], sys.argv[2]
    N = json.load(open(cands, encoding='utf-8'))
    bundle = json.load(gzip.open(os.path.join(ROOT, BUNDLE), 'rt', encoding='utf-8'))
    cal = json.load(open(os.path.join(ROOT, 'public/data/input.json'), encoding='utf-8'))['calendar']['sessions']
    res = select(N['rows'], bundle, cal, N['asOf'])
    F = {x['name']: x for x in res['sectors']}
    byc = {r['code']: r for r in N['rows']}
    picked = [{'rank': k + 1, **p, 'why': why_of(p, F)} for k, p in enumerate(res['picked'])]
    outside = [{'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'], **res['status'][c]}
               for c in sorted(res['status'], key=lambda c: -(byc[c]['capEok'] or 0)) if res['status'][c]['s'] != 'in']
    doc = {'schema': 'atlas11-d365-proposal-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'from': {'cands': 'dump.mjs %s %s' % (BUNDLE, N['asOf']), 'collectedAt': N['collectedAt']},
           'rules': rules_text(res), 'window': res['window'], 'counts': res['counts'], 'sectors': res['sectors'], 'unranked': res['unranked'],
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
