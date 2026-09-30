#!/usr/bin/env python3
"""ATLAS 11 · 틀린 1거래일 전망을 네 통으로 나누기 (2026-10-01 사장님 요청 「틀린 종목에 이유를 나열해봐」)

규칙은 결과를 보기 전에 정했다(아래 RULES). 숫자는 기록 장부·발행본에서만 가져온다.
  입력: public/data/atlas11/view/scores.json (장부로 만든 채점 · 대표 발행본 = 그날의 첫 발행본)
        reports/atlas11/ledger/analysis/*.jsonl (원인 분석 칸 · 같은 발행본·종목·거리의 가장 늦은 판 a3)
  출력: reports/atlas11/misses/misses-1d.json (칸마다 사실·가설·통 · 대조 시험 · 통별 수)
"""
import json, glob, collections, math, re, sys, os
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RULES = [
    'R0 대상: 1거래일 전망 · 날마다 대표 발행본(첫 발행본) · 방향 틀림(실제 보합 포함). 방향 판정·보합 경계(±0.10%)는 채점 규칙 그대로.',
    'R1 반반이던 예측: 1위와 2위 방향 확률 차이가 5%p 미만(발행 규칙 closeCallGap 0.05 — 발행 전에 정해진 값 · 화면의 「비슷함」 표시와 같은 기준).',
    'R2 시장·업종 흐름(R1 아닐 때): (a) 시장 몫이 실제 움직임의 50% 이상이고 시장 몫의 부호가 실제 움직임과 같음, 또는 (b) 장부의 「업종 변화」 가설(강도 중 이상)이 있고 그 묶음 평균 고유 몫의 부호가 실제 움직임과 같음 — 여러 종목을 한꺼번에 민 흐름이 우리 예측과 반대로 감.',
    'R3 놓친 것(R1·R2 아닐 때): 전망을 내기 전에 알 수 있던 근거(미리 잡힌 기업 일정)가 있는 가설이 있고, 대조 시험을 통과함 — 같은 이틀의 1거래일 칸에서 그 근거가 있는 비율이 틀린 칸이 맞힌 칸보다 큼.',
    'R4 까닭 모름: 나머지. 전망 뒤에 나온 기사·공시·수급은 「같은 때 있었던 일(원인 증명 아님)」로만 적는다.',
    '한 칸은 한 통에만 넣는다(R1 → R2 → R3 → R4 순서). 같은 흐름이 여러 종목을 함께 틀리게 했으면 흐름 하나로 묶어 따로 센다.',
]
REP_SELECTION = 'first_published_vintage_per_session'
SIGN = lambda v: (v > 0) - (v < 0)


def load_cells():
    recs = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'reports/atlas11/ledger/analysis/*.jsonl'))):
        for line in open(f, encoding='utf-8'):
            if line.strip():
                recs.append(json.loads(line))
    sup = {x['supersedes'] for x in recs if x.get('supersedes')}
    latest = {}
    for x in recs:
        b = x['body']
        if x['id'] in sup or b.get('kind') != 'cell' or b.get('horizon') != 1:
            continue
        key = (b['forecastId'], b['code'], b['targetDate'])
        if key not in latest or x['at'] > latest[key]['at']:
            latest[key] = x
    return latest


def group_mean(h):
    m = re.search(r'고유 몫 평균 ([+\-−]?\d+(?:\.\d+)?)%', h.get('evidence', ''))
    return float(m.group(1).replace('−', '-')) if m else None


def main():
    scores = json.load(open(os.path.join(ROOT, 'public/data/atlas11/view/scores.json'), encoding='utf-8'))
    assert scores.get('selection') == REP_SELECTION, scores.get('selection')
    cells = load_cells()
    out_cells = []
    for day in scores['byDate']:
        for r in day['rows']:
            h = r['horizons'].get('1') or {}
            if h.get('status') != 'evaluated':
                continue
            c = cells.get((h['forecastId'], r['code'], day['date']))
            assert c, ('분석 칸 없음', r['code'], day['date'])
            b = c['body']
            assert b['directionCorrect'] == h['directionCorrect'], ('채점과 분석이 다름', r['code'], day['date'])
            p = h['probabilities']
            ranked = sorted(p.items(), key=lambda kv: -kv[1])
            gap = ranked[0][1] - ranked[1][1]
            dec = b.get('decomposition') or {}
            real, mkt, res = dec.get('realizedLog'), dec.get('marketPartLog'), dec.get('residualPartLog')
            hyps = b.get('hypotheses') or []
            sched = [x for x in hyps if x['category'] == '기업 사건' and '기업 일정' in x.get('evidence', '')]
            sector = [x for x in hyps if x['category'] == '업종 변화' and x.get('strength') in ('중', '강')]
            ev = b.get('evidence') or {}
            out_cells.append({
                'date': day['date'], 'code': r['code'], 'name': r['name'], 'forecastId': h['forecastId'], 'issuedAt': h['issuedAt'],
                'wrong': h['directionCorrect'] is False, 'predicted': h['predictedDirection'], 'observed': h['observedDirection'],
                'probabilities': p, 'selectedProb': p[h['predictedDirection']], 'gap': gap, 'closeCall': gap < 0.05,
                'actualReturn': h['actualReturn'], 'predictedReturn': h['predictedReturn'],
                'marketPartPct': None if mkt is None else mkt * 100,  # 장부 facts 의 「시장 통로 몫」과 같은 값(로그 수익률 × 100)
                'residualPartPct': None if res is None else res * 100, 'realizedLogPct': None if real is None else real * 100,
                'marketShare': dec.get('marketShare'), 'beta': dec.get('beta'), 'basketPct': None if dec.get('basketCumLog') is None else dec['basketCumLog'] * 100,
                'marketAligned': (mkt is not None and real is not None and SIGN(mkt) == SIGN(real) and SIGN(real) != 0),
                'sectorAligned': any(group_mean(x) is not None and SIGN(group_mean(x)) == SIGN(real or 0) and SIGN(real or 0) != 0 for x in sector),
                'hasSchedule': bool(sched), 'schedule': [x['evidence'] for x in sched],
                'hypotheses': [{'category': x['category'], 'strength': x.get('strength'), 'evidence': x.get('evidence'), 'counter': x.get('counterEvidence')} for x in hyps],
                'afterIssue': {'news': (ev.get('news') or {}).get('count'), 'disclosures': [d.get('title') for d in (ev.get('disclosures') or {}).get('items', [])],
                               'flows': {k: (ev.get('flows') or {}).get(k) for k in ('dates', 'foreignNet', 'institutionNet', 'unit')} if ev.get('flows') else None,
                               'window': ev.get('window')},
                'flags': b.get('flags'), 'facts': b.get('facts'), 'analysisId': c['id'], 'analysisVersion': b.get('analysisVersion'),
            })
    wrong = [c for c in out_cells if c['wrong']]
    right = [c for c in out_cells if not c['wrong']]
    # 대조 시험: 근거 종류마다 틀린 칸 비율 vs 맞힌 칸 비율
    kinds = {'미리 잡힌 기업 일정': lambda c: c['hasSchedule']}
    for cat in sorted({h['category'] for c in out_cells for h in c['hypotheses']}):
        kinds[f'가설 「{cat}」'] = (lambda cat: (lambda c: any(h['category'] == cat for h in c['hypotheses'])))(cat)
    contrast = {k: {'wrongWith': sum(1 for c in wrong if f(c)), 'wrong': len(wrong), 'rightWith': sum(1 for c in right if f(c)), 'right': len(right)} for k, f in kinds.items()}
    for v in contrast.values():
        v['wrongRate'] = v['wrongWith'] / v['wrong'] if v['wrong'] else None
        v['rightRate'] = v['rightWith'] / v['right'] if v['right'] else None
        v['passes'] = v['wrongRate'] is not None and v['rightRate'] is not None and v['wrongRate'] > v['rightRate']
    schedule_passes = contrast['미리 잡힌 기업 일정']['passes']
    for c in wrong:
        if c['closeCall']:
            c['bin'] = 'close'; c['binWhy'] = f"1·2위 확률 차 {c['gap'] * 100:.1f}%p (<5%p)"
        elif (c['marketShare'] is not None and c['marketShare'] >= 0.5 and c['marketAligned']) or c['sectorAligned']:
            c['bin'] = 'flow'
            why = []
            if c['marketShare'] is not None and c['marketShare'] >= 0.5 and c['marketAligned']:
                why.append(f"시장 몫 {c['marketShare'] * 100:.0f}%")
            if c['sectorAligned']:
                why.append('같은 묶음이 같은 쪽으로 움직임')
            c['binWhy'] = ' · '.join(why)
        elif c['hasSchedule'] and schedule_passes:
            c['bin'] = 'missed'; c['binWhy'] = '전망 전에 알 수 있던 기업 일정 · 대조 시험 통과'
        else:
            c['bin'] = 'unknown'; c['binWhy'] = '가격·일정·기사·수급·공시 기록으로 가를 수 없음' + (' (기업 일정은 있었으나 대조 시험 불통과)' if c['hasSchedule'] else '')
    bins = collections.Counter((c['date'], c['bin']) for c in wrong)
    # 한꺼번에 민 흐름: 날마다 「예측과 반대로 간 시장」 묶음
    flows = {}
    for d in sorted({c['date'] for c in out_cells}):
        dc = [c for c in out_cells if c['date'] == d]
        basket = dc[0]['basketPct']
        w_up = [c for c in dc if c['wrong'] and c['predicted'] == 'up' and c['observed'] != 'up']
        w_down = [c for c in dc if c['wrong'] and c['predicted'] == 'down' and c['observed'] != 'down']
        flows[d] = {'basketPct': basket, 'wrongPredictedUp': len(w_up), 'wrongPredictedDown': len(w_down),
                    'predictedUp': sum(1 for c in dc if c['predicted'] == 'up'), 'predictedDown': sum(1 for c in dc if c['predicted'] == 'down'),
                    'observedUp': sum(1 for c in dc if c['observed'] == 'up'), 'observedDown': sum(1 for c in dc if c['observed'] == 'down'), 'observedFlat': sum(1 for c in dc if c['observed'] == 'flat')}
    result = {'schema': 'atlas11-misses-1d-1', 'at': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'rules': RULES, 'selection': REP_SELECTION,
              'sources': ['public/data/atlas11/view/scores.json', 'reports/atlas11/ledger/analysis/*.jsonl (kind cell · horizon 1 · 같은 발행본·종목의 가장 늦은 판)'],
              'counts': {'cells': len(out_cells), 'wrong': len(wrong), 'right': len(right), 'byDate': {d: {'wrong': sum(1 for c in wrong if c['date'] == d), 'right': sum(1 for c in right if c['date'] == d)} for d in sorted({c['date'] for c in out_cells})}},
              'bins': {f'{d}|{b}': n for (d, b), n in sorted(bins.items())}, 'binTotals': dict(collections.Counter(c['bin'] for c in wrong)),
              'contrast': contrast, 'flows': flows, 'cells': out_cells}
    os.makedirs(os.path.join(ROOT, 'reports/atlas11/misses'), exist_ok=True)
    json.dump(result, open(os.path.join(ROOT, 'reports/atlas11/misses/misses-1d.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: result[k] for k in ('counts', 'bins', 'binTotals', 'flows')}, ensure_ascii=False))
    for k, v in contrast.items():
        print(k, f"틀린 칸 {v['wrongWith']}/{v['wrong']} ({(v['wrongRate'] or 0) * 100:.0f}%) · 맞힌 칸 {v['rightWith']}/{v['right']} ({(v['rightRate'] or 0) * 100:.0f}%) · {'통과' if v['passes'] else '불통과'}")


if __name__ == '__main__':
    main()
