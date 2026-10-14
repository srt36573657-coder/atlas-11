#!/usr/bin/env python3
"""멍거 조건 고르기(mg-v1) — 새 ATLAS 의 바탕 회사 목록(옛 「힘 붙은 365곳」 h365-v1 · 「대세 365곳」 d365-v2 는 회차 기록 · 봉인 1호로 남김)
사장님 2026-10-13 23:14(서울) 「기준이 좆같네 기준 다시 만들어봐 찰리 멍거라면」 → 23:34 「철저하게 찰리 망거 조건만 해」
  → 2026-10-14 00:03 「가 로 하자」 — 여쭌 것: 「빚을 어디까지 봐줄까요? (가) 빚이 자기 돈보다 적으면 통과 → 26곳 · (나) 자기 돈의 절반보다 적으면 통과 → 13곳」
  (멍거 쪽은 「빚을 거의 또는 전혀 안 쓴다」고만 하고 숫자를 주지 않아 사장님이 고르심)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
자료     모음(universe.json bundle)의 회사 목록 · 결산만 — 확정 결산 마지막 3해(예상 E 는 안 씀 · 앞날 값 금지)
         주가 · 몸값 · 거래대금 · 하루 값은 고르는 데 안 씀 → 같은 모음이면 회차마다 같은 곳
         (멍거 「큰돈은 사고파는 데가 아니라 기다리는 데 있다」 — 새 결산이 담긴 모음이 들어와야 바뀜)
셈 규칙  보통주만(우선주 · 스팩 · 리츠 등 빼고 — 같은 회사를 두 번 세지 않음 · 조건이 아님)
         결산 3해 · 3해 ROE · (금융 밖) 3해 영업이익 · 3해 부채비율이 하나라도 비면 「모름」(넣지 않음 · 0 으로 채우지 않음)
① 꾸준히 번 힘   3해 모두 순이익 > 0 · 금융 밖은 영업이익도 > 0
                 버크셔(멍거가 부회장) 「사고 싶은 회사」 조건 — "Demonstrated consistent earning power (future projections are of no
                 interest to us, nor are "turnaround" situations)" (2004년 연례 보고서 · 미국 증권거래위원회 공시)
② 빚을 거의 안 씀  3해 모두 부채비율 ≤ 100%(빚이 자기 돈보다 적음) · 예외 없음(은행 · 보험 · 증권 · 조선 · 방산도 똑같이)
                 버크셔 조건 — "Businesses earning good returns on equity while employing little or no debt" · 멍거 「liquor, ladies and leverage」
                 선(100%)은 멍거가 준 숫자가 아님 — 사장님이 고르심(2026-10-14 00:03 「가」)
③ 자기 돈으로 18%  3해 모두 ROE ≥ 18%(자기 돈 100원으로 해마다 18원 넘게 벎)
                 멍거 6% · 18% 예 — 18%를 버는 사업은 비싸 보이는 값을 줘도 길게 보면 괜찮다(기사가 전한 말 · 원문 강연은 못 읽음)
값       빼지 않음(③의 멍거 말) — 화면에 1년 이익의 몇 배 값만 보여 줌
차례     속 셈만(화면 · 사이트 자료에 순위를 싣지 않음 · 규칙 55): 3해 가운데 가장 낮은 ROE 큰 순 → 종목 번호(몸값은 회차마다 바뀌어 안 씀)
숫자로 못 세는 멍거 조건  단순한 사업(「기술이 많으면 우리는 이해 못 한다」) · 경영진 — 사람이 볼 몫(화면에 밝힘)
한계     멍거는 20 ~ 30년을 봤는데 자료는 3해 · 빚은 빌린 돈만 따로 못 세서 모든 부채(부채비율)로 셈
같은 원문이면 언제나 같은 곳 · 따로 세기 = munger_verify.mjs(노드로 처음부터)

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08
  python3 scripts/atlas11/t365/munger.py <임시>/now.json <결과 폴더> [--closes <이어 받은 일봉 폴더>]
만드는 것: proposal.json(고른 곳 · 회사마다 3해 순이익 · 영업이익 · ROE · 부채비율 · 밖 회사마다 까닭) · list.csv
site_build.py 는 select() 를 같은 원문으로 다시 불러 proposal.json 과 한 곳도 다르지 않은지 먼저 본다.
"""
import gzip, hashlib, json, os, sys
from datetime import datetime, timezone
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import isfin  # noqa: E402
import daese  # noqa: E402  자료 · 고르는 날은 다른 판과 하나로(고르는 날은 기록에만 · 고르는 데 안 씀)

VERSION = 'mg-v1'
# 모음 = universe.json bundle(2026-10-14 「전 종목」부터 새 모음 · 옛 daese.BUNDLE 은 10월 10일 모음 그대로) · 시험은 ATLAS_BUNDLE 로 옛 모음을 고정
BUNDLE = os.environ.get('ATLAS_BUNDLE') or json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8')).get('bundle') or daese.BUNDLE
DEBT, ROE = 100.0, 18.0
NAME = '멍거 조건'
WHY_IN = '3년 모두 돈을 벌었고 · 빚이 자기 돈보다 적고 · 자기 돈 100원으로 해마다 18원 넘게 벎'
STOP = {'q': 1, 'loss': 2, 'debt': 3, 'roe': 4}
STOP_NAME = {'q': '자료 보기', 'loss': '① 3년 모두 돈 벌기', 'debt': '② 빚이 자기 돈보다 적기', 'roe': '③ 해마다 18원 넘게 벌기'}
kd = daese.kd


def years(r):
    """확정 결산 마지막 3해(예상 E 빼고)"""
    per = [p for p in ((r.get('fin') or {}).get('periods') or []) if not str(p).endswith('E')]
    return per[-3:]


def fv(r, k, p):
    return ((r.get('fin') or {}).get(k) or {}).get(p)


def yr(p):
    return str(p)[:4]


def judge(r):
    """한 회사 → (s, 까닭, 값) — s: in · q(모름) · loss(①) · debt(②) · roe(③)"""
    ps = years(r)
    fin = isfin(r)
    if len(ps) < 3:
        return 'q', '? 3년 결산 자료가 다 있지 않음', None
    net = [fv(r, 'net', p) for p in ps]
    op = [fv(r, 'op', p) for p in ps]
    roe = [fv(r, 'roe', p) for p in ps]
    debt = [fv(r, 'debt', p) for p in ps]
    if any(x is None for x in net + roe + debt) or (not fin and any(x is None for x in op)):
        return 'q', '? 3년 결산 자료 가운데 빈 값이 있음', None
    val = {'years': ps, 'net': net, 'op': op if not fin else None, 'roe': roe, 'debt': debt, 'fin': fin}
    for p, n, o in zip(ps, net, op):
        if not n > 0:
            return 'loss', '%s년에 돈을 잃었음' % yr(p), val
        if not fin and not o > 0:
            return 'loss', '%s년 본업에서 돈을 잃었음' % yr(p), val
    k = max(range(3), key=lambda i: debt[i])
    if debt[k] > DEBT:
        return 'debt', '%s년 빚이 자기 돈의 %.1f배' % (yr(ps[k]), debt[k] / 100), val
    k = min(range(3), key=lambda i: roe[i])
    if roe[k] < ROE:
        return 'roe', ('%s년 자기 돈 100원으로 %.1f원 벎' % (yr(ps[k]), roe[k])) if roe[k] > 0 else '%s년 자기 돈으로 돈을 못 벎' % yr(ps[k]), val
    return 'in', WHY_IN, val


def select(rows, asof, prev=None):
    """후보 표 rows(daese.prepare 로 고르는 날에 맞춘 것 · 결산은 모음 그대로) · 고르는 날(기록용) · 앞 회차 기록(기록용 · 고르는 데 안 씀) → 고른 결과"""
    status, val, cnt = {}, {}, {'q': 0, 'loss': 0, 'debt': 0, 'roe': 0, 'common': 0}
    for r in rows:
        c = r['code']
        if r.get('notCommon'):  # 목록 모두(모음 every)의 종류 이름이 있으면 그 이름으로(2026-10-14 11:02 「이거 다 올려」 · 고르기는 그대로)
            status[c] = {'s': 'q', 'why': ('%s — 회사 주식이 아니라 셀 수 없음' % r['kindName']) if r.get('kindName') else '보통주가 아님(우선주 · 스팩 · 리츠 등)'}
            cnt['q'] += 1
            continue
        cnt['common'] += 1
        s, why, v = judge(r)
        status[c] = {'s': s, 'why': why}
        if v:
            val[c] = v
        if s != 'in':
            cnt[s] += 1
    byc = {r['code']: r for r in rows}
    ins = [c for c in status if status[c]['s'] == 'in']
    ins.sort(key=lambda c: (-min(val[c]['roe']), c))
    picked = []
    for c in ins:
        r, v = byc[c], val[c]
        picked.append({'code': c, 'name': r['name'], 'market': r['market'], 'sector': r['sector'], 'capEok': r.get('capEok'),
                       'years': v['years'], 'net': v['net'], 'op': v['op'], 'roe': v['roe'], 'debt': v['debt'], 'fin': v['fin'],
                       'minRoe': min(v['roe']), 'maxDebt': max(v['debt']), 'per': r.get('per')})
    universe = len(rows)
    known = universe - cnt['q']
    s1 = known - cnt['loss']
    s2 = s1 - cnt['debt']
    if s2 - cnt['roe'] != len(picked) or len(status) != universe:
        raise ValueError('셈이 안 맞음 %d %d' % (s2 - cnt['roe'], len(picked)))
    mem = list((prev or {}).get('members') or [])
    pinfo = {'used': False, 'version': (prev or {}).get('version'), 'at': (prev or {}).get('at'), 'n': len(mem),
             'digest': hashlib.sha256(','.join(mem).encode()).hexdigest()[:16] if mem else None}
    return {
        'version': VERSION, 'asOf': asof,
        'counts': {'universe': universe, 'common': cnt['common'], 'q': cnt['q'], 'known': known, 'loss': cnt['loss'], 's1': s1,
                   'debt': cnt['debt'], 's2': s2, 'roe': cnt['roe'], 'picked': len(picked),
                   'fin': sum(1 for p in picked if p['fin']), 'per30': sum(1 for p in picked if p['per'] is not None and p['per'] > 30)},
        'prev': pinfo, 'picked': picked, 'status': status,
    }


def rules_text(res, slots):
    n = res['counts']['picked']
    return {
        'version': VERSION,
        'label': '%s %d곳 — 찰리 멍거가 말한 조건으로만 고름' % (NAME, n),
        'said': ['사장님 2026-10-13 23:14(서울) 「기준이 좆같네 기준 다시 만들어봐 찰리 멍거라면」',
                 '사장님 2026-10-13 23:34 「철저하게 찰리 망거 조건만 해」',
                 '사장님 2026-10-14 00:03 「가 로 하자」 — 빚이 자기 돈보다 적으면 통과(26곳) · (나) 절반보다 적으면 통과(13곳) 가운데 (가)'],
        'data': '회사 목록 · 결산 = 모음 %s · 확정 결산 마지막 3해(예상치는 안 씀) · 주가는 고르는 데 안 씀' % BUNDLE,
        'conds': [
            {'k': 'loss', 't': '3년 모두 돈을 벌었음', 'd': '3해 모두 순이익이 남음 · 금융 밖은 본업 이익도 남음',
             'q': '꾸준히 번 힘이 기록으로 보일 것 — 앞날 예상은 관심 없고, 다시 일어서는 회사도 아님', 'who': '버크셔(멍거가 부회장) 「사고 싶은 회사」 조건'},
            {'k': 'debt', 't': '빚이 자기 돈보다 적음', 'd': '3해 모두 빚이 자기 돈보다 적음 · 은행 · 보험 · 조선도 예외 없음',
             'q': '빚을 거의 또는 전혀 안 쓰면서 자기 돈으로 잘 버는 회사', 'who': '버크셔 조건 · 멍거 「똑똑한 사람이 망하는 세 길: 술 · 여자 · 빚」'},
            {'k': 'roe', 't': '자기 돈 100원으로 해마다 18원 넘게 벎', 'd': '3해 모두 18원 넘게 · 18은 멍거가 든 숫자',
             'q': '자기 돈으로 18%를 버는 사업은 비싸 보이는 값을 줘도 길게 보면 괜찮다', 'who': '멍거 — 6% 사업 · 18% 사업 예를 줄여 옮김(기사가 전한 말)'},
        ],
        'price': '값으로는 빼지 않습니다 — 멍거가 18%를 버는 사업은 비싸 보이는 값도 길게 보면 괜찮다고 했습니다. 1년 이익의 몇 배 값인지는 회사마다 보여 드립니다.',
        'wait': '업데이트마다 바꾸지 않습니다 — 새 1년 성적표가 담긴 자료가 들어와야 바뀝니다(멍거 「큰돈은 사고파는 데가 아니라 기다리는 데 있다」).',
        'notCounted': '숫자로 못 세는 멍거 조건 둘 — 「단순한 사업(기술이 많으면 우리는 이해 못 한다)」 · 「경영진이 이미 있을 것」은 사람이 볼 몫입니다.',
        'limits': '멍거는 20 ~ 30년을 봤는데 이 자료는 3년뿐입니다. 빚은 빌린 돈만 따로 못 세서 모든 부채로 셌습니다.',
        'notMunger': '멍거가 고른 목록이 아닙니다 — 멍거가 말한 조건으로 우리가 센 것입니다.',
        'q': '? 모름 — 3년 성적표 가운데 빈 값이 있으면 넣지 않음(0 으로 채우지 않음)',
        'next': '하루 %d번(%s 서울) 값과 그림만 새로 · 고른 곳은 새 1년 성적표가 들어와야 바뀜' % (len(slots), ' · '.join(slots)),
    }


def why_of(p):
    return WHY_IN


def load_prev(path):
    if not path:
        return None
    j = json.load(open(path, encoding='utf-8'))
    return {'version': j.get('version'), 'at': j.get('at'), 'members': j.get('members') or []}


def main():
    args = list(sys.argv[1:])
    opt = {}
    for k in ('--closes', '--prev'):
        if k in args:
            i = args.index(k)
            opt[k] = args[i + 1]
            del args[i:i + 2]
    cands, out_dir = args[0], args[1]
    N = json.load(open(cands, encoding='utf-8'))
    act = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
    bundle = json.load(gzip.open(os.path.join(ROOT, BUNDLE), 'rt', encoding='utf-8'))
    rows, merged, cal, day, stats = daese.prepare(N['rows'], bundle, opt.get('--closes'), ROOT, N['asOf'])
    res = select(rows, day, load_prev(opt.get('--prev')))
    byc = {r['code']: r for r in rows}
    picked = [{**p, 'why': why_of(p)} for p in res['picked']]
    outside = [{'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'], **res['status'][c]}
               for c in sorted(res['status'], key=lambda c: (-(byc[c]['capEok'] or 0), c)) if res['status'][c]['s'] != 'in']
    doc = {'schema': 'atlas11-munger-proposal-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'from': {'cands': 'dump.mjs %s %s' % (BUNDLE, N['asOf']), 'collectedAt': N['collectedAt'], 'closes': stats, 'prev': res['prev']},
           'asOf': day, 'rules': rules_text(res, act.get('slots') or []), 'counts': res['counts'],
           'picked': picked, 'outside': outside}
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'proposal.json'), 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')
    csv = ['종목코드,회사,시장,네이버 업종,시가총액(억 원),결산 3해,ROE 3해(%),부채비율 3해(%),가장 낮은 ROE(%),PER']
    for p in picked:
        csv.append(','.join([p['code'], '"%s"' % p['name'], p['market'], '"%s"' % (p['sector'] or ''), str(p['capEok']), ' '.join(p['years']),
                             ' '.join('%.2f' % x for x in p['roe']), ' '.join('%.2f' % x for x in p['debt']), '%.2f' % p['minRoe'], str(p['per'])]))
    with open(os.path.join(out_dir, 'list.csv'), 'w', encoding='utf-8') as f:
        f.write('﻿' + '\n'.join(csv) + '\n')
    print(json.dumps(res['counts'] | {'asOf': day, 'prev': res['prev']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
