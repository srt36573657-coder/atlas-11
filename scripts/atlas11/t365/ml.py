#!/usr/bin/env python3
"""멍거 · 린치 조건 고르기(ml-v1) — 새 ATLAS 의 바탕 회사 = 멍거 조건(munger.py mg-v1)을 넘은 곳 + 린치 조건(lynch.py ly-v1)을 넘은 곳(겹치면 한 번)
사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」 → 그레이엄 · 린치를 찾아 셈(카드)
  → 06:03 「가」 = 「(가) 린치 조건 18곳을 사이트에 넣을까요?」 → 06:05 「가」 = 「(가) 멍거 26곳과 린치 18곳을 함께 보여요 · 겹치는 3곳은 한 번만 · 모두 41곳」
  (그레이엄은 10년 이익 · 20년 배당 · 유동비율을 우리 자료로 못 세어 넣지 않음 — 사장님이 고르지 않음)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
멍거 갈래  munger.judge 그대로(mg-v1 · 3해 모두 돈 벎 · 빚 ≤ 자기 돈 · ROE 3해 모두 18% 이상 · 주가 안 씀)
린치 갈래  lynch.judge 그대로(ly-v1 · 한 주 이익 해마다 20 ~ 25% · (성장 + 배당) ÷ PER ≥ 2 · 모음 날 값)
바탕       두 갈래 가운데 하나라도 넘은 곳 · 회사마다 넘은 갈래 꼬리표(mg · ly) · 수는 셈한 그대로(365곳 채우지 않음)
차례       속 셈만(화면 · 사이트 자료에 순위를 싣지 않음 · 규칙 55): 멍거 갈래 차례(munger.select) → 린치만 넘은 곳(값 점수 큰 순 → 번호)
같은 원문이면 언제나 같은 곳(이어 받은 일봉 · 회차 날 값 · 앞 회차 기록은 안 씀) · 따로 세기 = ml_verify.mjs(노드로 처음부터)

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08
  python3 scripts/atlas11/t365/ml.py <임시>/now.json <결과 폴더> [--closes <이어 받은 일봉 폴더>]
만드는 것: proposal.json(고른 곳 · 꼬리표 · 갈래마다 값 · 밖 회사마다 갈래별 까닭) · list.csv
site_build.py 는 select() 를 같은 원문으로 다시 불러 proposal.json 과 한 곳도 다르지 않은지 먼저 본다.
"""
import gzip, hashlib, json, os, sys
from datetime import datetime, timezone
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import daese  # noqa: E402
import munger  # noqa: E402
import lynch  # noqa: E402

VERSION = 'ml-v1'
BUNDLE = munger.BUNDLE  # universe.json bundle(시험은 ATLAS_BUNDLE 로 옛 모음 고정)
NAME = '멍거 · 린치 조건'
GROUPS = (('mg', munger.NAME), ('ly', lynch.NAME))
kd = daese.kd


def select(rows, asof, lyin, prev=None):
    """후보 표 rows(daese.prepare) · 고르는 날(기록용) · 린치 모음 값(lynch.inputs) → 고른 결과"""
    mg = munger.select(rows, asof)
    mgv = {p['code']: p for p in mg['picked']}
    status, lyv, cnt = {}, {}, {'q': 0, 'loss': 0, 'g': 0, 'peg': 0}
    for r in rows:
        c = r['code']
        ms = mg['status'][c]
        if r.get('notCommon'):
            ls, lw, v = 'q', '보통주가 아님(우선주 · 스팩 · 리츠 등)', None
        else:
            ls, lw, v = lynch.judge(r, lyin.get(c))
        if ls != 'in':
            cnt[ls] += 1
        elif v:
            lyv[c] = v
        tags = [k for k, s in (('mg', ms['s']), ('ly', ls)) if s == 'in']
        status[c] = {'s': 'in' if tags else ('q' if ms['s'] == 'q' and ls == 'q' else 'out'), 'tags': tags,
                     'mg': {'s': ms['s'], 'why': ms['why']}, 'ly': {'s': ls, 'why': lw}}
    byc = {r['code']: r for r in rows}
    order = [p['code'] for p in mg['picked']] + sorted((c for c in lyv if c not in mgv), key=lambda c: (-lyv[c]['score'], c))
    picked = []
    for c in order:
        r, m, l = byc[c], mgv.get(c), lyv.get(c)
        picked.append({'code': c, 'name': r['name'], 'market': r['market'], 'sector': r['sector'], 'capEok': r.get('capEok'), 'per': r.get('per'),
                       'tags': status[c]['tags'],
                       'mg': {k: m[k] for k in ('years', 'net', 'op', 'roe', 'debt', 'fin', 'minRoe', 'maxDebt')} if m else None,
                       'ly': {k: l[k] for k in ('years', 'eps', 'g', 'dps', 'px', 'pxDay', 'yld', 'per', 'score')} if l else None})
    universe = len(rows)
    lq = cnt['q']
    lknown = universe - lq
    l0 = lknown - cnt['loss']
    l1 = l0 - cnt['g']
    lpick = l1 - cnt['peg']
    if lpick != len(lyv) or len(status) != universe:
        raise ValueError('린치 셈이 안 맞음 %d %d' % (lpick, len(lyv)))
    both = sum(1 for c in lyv if c in mgv)
    mem = list((prev or {}).get('members') or [])
    pinfo = {'used': False, 'version': (prev or {}).get('version'), 'at': (prev or {}).get('at'), 'n': len(mem),
             'digest': hashlib.sha256(','.join(mem).encode()).hexdigest()[:16] if mem else None}
    mc = mg['counts']
    return {
        'version': VERSION, 'asOf': asof,
        'counts': {'universe': universe, 'picked': len(picked), 'both': both, 'q': sum(1 for s in status.values() if s['s'] == 'q'),
                   'mg': dict(mc), 'ly': {'universe': universe, 'q': lq, 'known': lknown, 'loss': cnt['loss'], 'l0': l0, 'g': cnt['g'], 'l1': l1, 'peg': cnt['peg'], 'picked': lpick},
                   'fin': sum(1 for p in picked if p['mg'] and p['mg']['fin']), 'per30': sum(1 for p in picked if 'mg' in p['tags'] and p['per'] is not None and p['per'] > 30)},
        'prev': pinfo, 'picked': picked, 'status': status,
        'munger': mg,
    }


def rules_text(res, slots, asof_word):
    c = res['counts']
    m = munger.rules_text(res['munger'], slots)
    nm, nl, nb = c['mg']['picked'], c['ly']['picked'], c['both']
    return {
        'version': VERSION,
        'label': '%s %d곳 — 찰리 멍거 · 피터 린치가 말한 조건으로 고름(멍거 %d곳 · 린치 %d곳 · 둘 다 %d곳)' % (NAME, c['picked'], nm, nl, nb),
        'line': '멍거 조건 %d곳 · 린치 조건 %d곳 · 둘 다 %d곳' % (nm, nl, nb),
        'said': m['said'] + ['사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」',
                             '사장님 06:03 「가」 — 린치 조건 18곳을 사이트에 · 06:05 「가」 — 멍거 26곳과 함께(겹치는 곳은 한 번)'],
        'data': '회사 목록 · 결산 = 모음 %s · 확정 결산 마지막 3해(예상치는 안 씀) · 린치의 값 = %s 값' % (BUNDLE, asof_word),
        'groups': [
            {'k': 'mg', 'name': munger.NAME, 'n': nm, 'conds': m['conds'], 'price': m['price'], 'notCounted': m['notCounted'], 'limits': m['limits'],
             'who': '찰리 멍거 — 버크셔 해서웨이 부회장'},
            {'k': 'ly', 'name': lynch.NAME, 'n': nl, 'conds': lynch.conds(asof_word),
             'price': '값으로 고릅니다 — 크는 빠르기에 견줘 값이 싼지를 %s 값으로 셌습니다(린치 「값이 성장률보다 낮을 것」).' % asof_word,
             'notCounted': '숫자로 못 센 린치 조건 — 빚(정한 숫자 없이 업종과 견줌) · 「성장하지 않는 업종 안」은 사람이 볼 몫입니다.',
             'limits': '린치는 긴 성장률을 봤는데 이 자료는 3년 성적표의 처음과 끝, 2년뿐입니다. 값은 %s 하루 값입니다.' % asof_word,
             'who': '피터 린치 — 마젤란 펀드를 1977 ~ 1990년 맡아 해마다 평균 29.2% 키움'},
        ],
        'conds': m['conds'] + lynch.conds(asof_word),
        'price': '멍거 조건은 값으로 빼지 않고, 린치 조건은 크는 빠르기에 견줘 값이 싼 곳만 넣습니다.',
        'wait': '업데이트마다 바꾸지 않습니다 — 새 1년 성적표가 담긴 자료가 들어와야 두 조건을 다시 셉니다(린치의 값도 그날 값으로).',
        'notCounted': m['notCounted'] + ' 숫자로 못 센 린치 조건 — 빚 · 「성장하지 않는 업종 안」.',
        'limits': m['limits'] + ' 린치 성장률은 2년만 셌습니다.',
        'notMunger': '멍거 · 린치가 고른 목록이 아닙니다 — 두 사람이 말한 조건으로 우리가 센 것입니다.',
        'q': m['q'],
        'next': m['next'],
    }


def why_of(p):
    w = []
    if 'mg' in p['tags']:
        w.append('멍거 — ' + munger.WHY_IN)
    if 'ly' in p['tags']:
        w.append('린치 — ' + lynch.WHY_IN)
    return ' / '.join(w)


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
    lyin = lynch.inputs(bundle, N['asOf'])
    res = select(rows, day, lyin, munger.load_prev(opt.get('--prev')))
    byc = {r['code']: r for r in rows}
    picked = [{**p, 'why': why_of(p)} for p in res['picked']]
    outside = [{'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'], 's': res['status'][c]['s'],
                'mg': res['status'][c]['mg'], 'ly': res['status'][c]['ly']}
               for c in sorted(res['status'], key=lambda c: (-(byc[c]['capEok'] or 0), c)) if res['status'][c]['s'] != 'in']
    doc = {'schema': 'atlas11-ml-proposal-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'from': {'cands': 'dump.mjs %s %s' % (BUNDLE, N['asOf']), 'collectedAt': N['collectedAt'], 'closes': stats, 'prev': res['prev'], 'lynchPriceDay': N['asOf']},
           'asOf': day, 'rules': rules_text(res, act.get('slots') or [], kd(N['asOf'])), 'counts': res['counts'],
           'picked': picked, 'outside': outside}
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'proposal.json'), 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')
    csv = ['종목코드,회사,시장,네이버 업종,시가총액(억 원),든 조건,멍거 ROE 3해(%),멍거 부채비율 3해(%),린치 EPS 해마다(%),린치 (성장 + 배당) ÷ PER']
    for p in picked:
        m, l = p['mg'], p['ly']
        csv.append(','.join([p['code'], '"%s"' % p['name'], p['market'], '"%s"' % (p['sector'] or ''), str(p['capEok']), ' '.join(p['tags']),
                             ' '.join('%.2f' % x for x in m['roe']) if m else '', ' '.join('%.2f' % x for x in m['debt']) if m else '',
                             '%.2f' % l['g'] if l else '', '%.3f' % l['score'] if l else '']))
    with open(os.path.join(out_dir, 'list.csv'), 'w', encoding='utf-8') as f:
        f.write('﻿' + '\n'.join(csv) + '\n')
    c = res['counts']
    print(json.dumps({'picked': c['picked'], 'mg': c['mg']['picked'], 'ly': c['ly']['picked'], 'both': c['both'], 'q': c['q'], 'asOf': day}, ensure_ascii=False))


if __name__ == '__main__':
    main()
