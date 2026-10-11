#!/usr/bin/env python3
"""회사 성장 이야기 — 치우침(너무 좋게 · 너무 나쁘게 봤나)을 숫자로 · 다시 셀 수 있게 남긴 셈(2026-10-12).
사장님 2026-10-11 17:56 「예약」 4차 ③ 「365곳 판정의 치우침(너무 좋게 · 너무 나쁘게)을 숫자로 봅니다」 —
  첫 기록 reports/atlas11/t365/grow/bias-20261011T1212Z.json 은 그 차례에 따로 돌린 셈이라 셈 파일이 저장소에 없었음(2026-10-12 CIA팀이 찾음).
  이 파일이 같은 정의로 다시 셈(첫 기록과 숫자가 모두 같음을 확인한 뒤 남김) · 화면(6단 「다르게 보면」)은 site_build.py 가 이 셈을 지금 365곳으로 부름.

정의(첫 기록과 같음):
  m10 = 회사마다 10년 가운데(mid · 2025년 = 1)의 10 · 25 · 50 · 75 · 90 분위(값이 있는 곳만) · cagr10 = 가운데의 해마다 커짐(%)
  over3 = 10년 가운데 3배 이상 · under1 = 1배 밑 · m1 = 1년 가운데의 가운데값
  vs_consensus = 1년 가운데 × 2025년 매출 ÷ 올해(2026E) 증권사 평균치 매출 — 셋 다 있는 곳 · 가운데값 · 1 밑 수
  reversion = 지난 2년(마지막 결산 해의 2년 앞 → 마지막) 매출 해마다 커짐과 10년 가운데의 해마다 커짐 — 곧은 선 기울기 ·
              지난 2년 해마다 30% 이상 큰 곳의 지난 · 앞 가운데값(%)
  shape_m10 · group_m10 = 판의 모양 · 큰 갈래마다 10년 가운데의 가운데값 · g10 = 10년 말 등급 수(null = 범위 없음)
쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/grow_bias.py [자료 폴더 = site/atlas/data] [나갈 파일]
  나갈 파일을 안 주면 reports/atlas11/t365/grow/bias-<UTC>.json(이미 있으면 멈춤 — 기록은 덮지 않음)
"""
import json, os, statistics, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SHAPES = ('몇 곳이 나눔', '혼자 앞섬', '새로 생기는 판', '다투는 곳이 많음')
FAST = 0.30  # 지난 2년 해마다 30% 이상 = 「빨리 큰 곳」


def q(vals, p):
    """분위(곧은 끼움 — numpy percentile 기본과 같음)"""
    s = sorted(vals)
    if not s:
        return None
    k = (len(s) - 1) * p / 100
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def r(x, n):
    return None if x is None else round(x + 0.0, n)


def rows_of(data):
    comp = json.load(open(os.path.join(data, 'comp.json'), encoding='utf-8'))['companies']
    out = []
    for c in sorted(comp):
        g = json.load(open(os.path.join(data, 'co', c + '.json'), encoding='utf-8'))['grow']
        out.append((c, comp[c], g))
    return out


def bias(rows):
    S = [(c, x, g, g['story']) for c, x, g in rows if g and g.get('story')]
    m10 = [s['h']['10']['mid'] for _, _, _, s in S if s['h']['10']['mid'] is not None]
    m1 = [s['h']['1']['mid'] for _, _, _, s in S if s['h']['1']['mid'] is not None]
    rat = []
    for _, _, g, s in S:
        est = [g['rev'][k] for k, y in enumerate(g['years']) if y.endswith('E')]
        if s['h']['1']['mid'] is None or not est or not est[0] or not g.get('baseRev'):
            continue
        rat.append(s['h']['1']['mid'] * g['baseRev'] / est[0])
    pts = []
    for _, _, g, s in S:
        if s['h']['10']['mid'] is None:
            continue
        act = [g['rev'][k] for k, y in enumerate(g['years']) if not y.endswith('E')]
        if len(act) < 3 or not act[-3] or not act[-1] or act[-3] <= 0 or act[-1] <= 0:
            continue
        pts.append(((act[-1] / act[-3]) ** 0.5 - 1, s['h']['10']['mid'] ** 0.1 - 1))
    slope = None
    if len(pts) > 1:
        mx = sum(p for p, _ in pts) / len(pts)
        my = sum(f for _, f in pts) / len(pts)
        vx = sum((p - mx) ** 2 for p, _ in pts)
        slope = sum((p - mx) * (f - my) for p, f in pts) / vx if vx else None
    fast = [(p, f) for p, f in pts if p >= FAST]
    med = lambda v: statistics.median(v) if v else None  # noqa: E731
    p50 = q(m10, 50)
    return {
        'n': len(rows),
        'm10': {**{'p%d' % p: r(q(m10, p), 2) for p in (10, 25, 50, 75, 90)}, 'n': len(m10)},
        'cagr10_median_pct': r((p50 ** 0.1 - 1) * 100, 1) if p50 else None,
        'over3': sum(1 for v in m10 if v >= 3), 'under1': sum(1 for v in m10 if v < 1),
        'm1': {'p50': r(med(m1), 2)},
        'shape_m10': {k: {'n': len(v), 'p50': r(med(v), 2)} for k in SHAPES for v in [[s['h']['10']['mid'] for _, _, _, s in S if s['shape'] == k and s['h']['10']['mid'] is not None]]},
        'vs_consensus': {'n': len(rat), 'p50_ratio_2027mid_over_2026E': r(med(rat), 3), 'below_2026E': sum(1 for v in rat if v < 1)},
        'reversion': {'n': len(pts), 'slope_future_on_past': r(slope, 3), 'past_fast_n': len(fast),
                      'past_fast_median_past_pct': r(med([p for p, _ in fast]) * 100, 1) if fast else None,
                      'past_fast_median_future_pct': r(med([f for _, f in fast]) * 100, 1) if fast else None},
        'group_m10': {gid: {'n': len(v), 'p50': r(med(v), 2)} for gid in sorted({x['g'] for _, x, _, _ in S}) for v in [[s['h']['10']['mid'] for _, x, _, s in S if x['g'] == gid and s['h']['10']['mid'] is not None]]},
        'g10': {k: sum(1 for _, _, _, s in S if (s['h']['10'].get('g') or 'null') == k) for k in ('아주 높다', '높다', '반반', '낮다', '아주 낮다', 'null')},
    }


def screen(b):
    """화면(6단 「다르게 보면」)에 쓰는 셋 — site_build.py ⑤-1 · site_verify ⑬ 이 같은 정의로 다시 셈"""
    return {'m10': b['m10']['p50'], 'n10': b['m10']['n'], 'cons': b['vs_consensus']['p50_ratio_2027mid_over_2026E'], 'consN': b['vs_consensus']['n']}


if __name__ == '__main__':
    data = os.path.join(ROOT, sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'site', 'atlas', 'data')
    now = datetime.now(timezone.utc)
    dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow', 'bias-%s.json' % now.strftime('%Y%m%dT%H%MZ'))
    if os.path.exists(dst):
        sys.exit('grow_bias: 이미 있는 기록 파일 — 덮지 않음: ' + dst)
    rec = {'schema': 'atlas-new-grow-bias-1', 'made': now.isoformat(timespec='seconds'),
           'why': '사장님 2026-10-11 17:56 「예약」 4차 ③ — 365곳 판정의 치우침(너무 좋게 · 너무 나쁘게)을 숫자로 · 2026-10-12 셈 파일(scripts/atlas11/t365/grow_bias.py)로 다시 셈',
           'from': os.path.relpath(data, ROOT) + ' co/*.json grow(가장 새 이야기)', **bias(rows_of(data))}
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('grow_bias: 10년 가운데 %s배(%d곳) · 증권사 견줌 %s배(%d곳) → %s' % (rec['m10']['p50'], rec['m10']['n'], rec['vs_consensus']['p50_ratio_2027mid_over_2026E'], rec['vs_consensus']['n'], os.path.relpath(dst, ROOT)))
