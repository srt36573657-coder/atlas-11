#!/usr/bin/env python3
"""내리는 시장 오름 날수(주문 1124-0354 · 1124-0432 — 사장님 2026-11-24(서울) 03:54 「이런 하락 장에서 … 상승하는 꾀들이 대체 몇일이나 지속 되는지 분석 …
   에이전트 수학적 통계학으로 … 몬테카를로 방식과 소거법을 도입 … 총 36가지의 도표를」 · 04:32 「어 그래」(물음 「이 분석 창을 사이트 장부 옆에 넣어 볼까요?」의 답))

   셈(지난 기록만 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · 원문 docs/design/fall36-2026-11-24)
   ① 내리는 시장인 날 = su21_sun.land(market(P, t)) == 'fall' · 그날 뒤 스무 장날 값이 있어야 셈
   ② 그날 꾀마다 고른 일곱 회사(su21_s36.lists36)를 같은 돈으로 샀다고 침 → 다음 장날 평균이 올랐으면, 그날부터 산 값 위에 머문 장날 수(스무 장날 내내 = 21)
   ③ 견줄 잣대 = 같은 날 판에서 아무렇게나 고른 일곱(스무 장날 값이 다 있는 회사) 가운데 다음 장날 오른 것 — 날마다 POOL 개
   ④ 몬테카를로: 꾀가 오른 날마다 그날 아무렇게나 일곱으로 바꾼 평균 날수를 SIMS 번 → 꾀 평균이 그 위 95 몫 넘으면 「길다」 · 아래 5 몫 밑이면 「짧다」
   ⑤ 소거: 고른 것 0(거래량 꾀) 빼기 → 오른 날 MIN_ROSE 번 미만 빼기 → ④ → 이어진 장날 덩어리 첫날만 다시 ④(이웃 날 겹침 덜기) — 둘 다 같은 쪽일 때만 「뚜렷」
   쓰는 법: python3 su21_fall.py --live <dist> --repo <저장소> --out <su21-fall.json>
"""
import json, sys, os, argparse, time
import numpy as np

HMAX = 20; SIMS = 20000; POOL = 1000; MIN_ROSE = 30; SEED = 20261124
RULE = 'fall36-v1'
BINS = [(1, 1), (2, 4), (5, 9), (10, 19), (HMAX + 1, HMAX + 1)]   # 하루 · 2~4일 · 5~9일 · 10~19일 · 스무 장날 내내
CLS = ('long', 'like', 'short', 'few', 'none')


def run_len(path):
    """path = 산 날 뒤 1..HMAX 장날 값 / 산 값 - 1(일곱 평균) → 첫날 올랐을 때 산 값 위에 머문 장날 수(HMAX 내내면 HMAX+1)"""
    n = 0
    for v in path:
        if np.isfinite(v) and v > 0: n += 1
        else: break
    return HMAX + 1 if n >= HMAX else n


def binc(r):
    r = np.asarray(r)
    return [int(((r >= a) & (r <= b)).sum()) for a, b in BINS]


def mc(rng, pool, days, runs, sims=SIMS):
    """그날 아무렇게나 일곱으로 바꾼 평균 날수 sims 번 — 꾀 평균이 이긴 몫(같으면 반) · 가운데 90 몫 폭"""
    keep = [i for i, d in enumerate(days) if d in pool]
    if not keep: return None
    P = np.stack([pool[days[i]] for i in keep]); rk = np.asarray(runs, float)[keep]
    pick = rng.integers(0, P.shape[1], (sims, len(keep)))
    sim = P[np.arange(len(keep))[None, :], pick].mean(axis=1)
    m = float(rk.mean())
    return {'n': len(keep), 'mean': m, 'lo': float(np.percentile(sim, 5)), 'hi': float(np.percentile(sim, 95)),
            'beat': float((m > sim).mean() + 0.5 * (m == sim).mean())}


def first_of_episodes(ts):
    """이어진 장날 덩어리마다 첫날(ts = 장날 차례 번호)"""
    out, prev = [], None
    for i, t in enumerate(ts):
        if prev is None or t - prev > 1: out.append(i)
        prev = t
    return out


def classify(rose, beat, beat_ep):
    if rose == 0: return 'none', False
    if rose < MIN_ROSE: return 'few', False
    cls = 'long' if beat >= 0.95 else 'short' if beat <= 0.05 else 'like'
    sure = (cls == 'long' and beat_ep is not None and beat_ep >= 0.95) or (cls == 'short' and beat_ep is not None and beat_ep <= 0.05)
    return cls, bool(sure)


def summarize(kinds, dates, fall, runs, rundays, pool, picked, sims=SIMS, seed=SEED):
    """꾀마다 줄 · 소거 단계 · 아무렇게나 — 화면 자료(su21-fall.json) 한 벌"""
    rng = np.random.default_rng(seed); TI = {d: i for i, d in enumerate(dates)}
    rows = []
    for k in kinds:
        r = np.asarray(runs[k]); ds = rundays[k]
        row = {'k': k, 'rose': int(len(r)), 'picked': int(picked[k]), 'b': binc(r) if len(r) else [0] * len(BINS)}
        if len(r):
            a = mc(rng, pool, ds, list(r), sims)
            fe = first_of_episodes([TI[d] for d in ds])
            e = mc(rng, pool, [ds[i] for i in fe], [int(r[i]) for i in fe], sims)
            cls, sure = classify(len(r), a['beat'] if a else 0.5, e['beat'] if e else None)
            row.update(median=float(np.median(r)), mean=round(float(r.mean()), 1), p5=int(round(10 * float((r >= 5).mean()))), p21=int(round(10 * float((r == HMAX + 1).mean()))),
                       lo=round(a['lo'], 1) if a else None, hi=round(a['hi'], 1) if a else None, beat=round(a['beat'], 4) if a else None,
                       ep=len(fe), beatEp=round(e['beat'], 4) if e else None)
        else:
            cls, sure = 'none', False
            row.update(median=None, mean=None, p5=None, p21=None, lo=None, hi=None, beat=None, ep=0, beatEp=None)
        row['cls'] = cls; row['sure'] = sure
        rows.append(row)
    order = {c: i for i, c in enumerate(CLS)}
    rows.sort(key=lambda x: (order[x['cls']], -(x['mean'] or 0), x['k']))
    allp = np.concatenate([pool[d] for d in fall if d in pool]) if fall else np.array([])
    n = lambda c: sum(1 for x in rows if x['cls'] == c)
    counted = n('long') + n('like') + n('short')
    rand = {'median': float(np.median(allp)) if len(allp) else None, 'mean': round(float(allp.mean()), 1) if len(allp) else None,
            'p5': int(round(10 * float((allp >= 5).mean()))) if len(allp) else None, 'p21': int(round(10 * float((allp == HMAX + 1).mean()))) if len(allp) else None,
            'share': [round(10 * c / len(allp), 1) for c in binc(allp)] if len(allp) else None}
    steps = {'kinds': len(rows), 'none': n('none'), 'afterNone': len(rows) - n('none'), 'few': n('few'), 'counted': counted,
             'long': n('long'), 'like': n('like'), 'short': n('short'),
             'sureLong': sum(1 for x in rows if x['cls'] == 'long' and x['sure']), 'sureShort': sum(1 for x in rows if x['cls'] == 'short' and x['sure']),
             'chance': round(0.05 * counted, 1)}
    return {'rule': RULE, 'hmax': HMAX, 'sims': sims, 'pool': POOL, 'minRose': MIN_ROSE, 'bins': [[a, b] for a, b in BINS],
            'fallDays': len(fall), 'fallFrom': fall[0] if fall else None, 'fallTo': fall[-1] if fall else None,
            'rand': rand, 'steps': steps, 'rows': rows}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--live', required=True); ap.add_argument('--repo', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--sims', type=int, default=SIMS)
    A = ap.parse_args()
    sys.path.insert(0, os.path.join(A.repo, 'scripts/atlas11/next'))
    import su21_s36 as S36, su21_sun as SUN
    J = lambda p: json.load(open(p, encoding='utf-8'))
    st = time.time()
    b = J(os.path.join(A.repo, 'public/data/atlas11/view/board.json')); B = {c['code']: c for c in b['companies']}
    DATES = J(os.path.join(A.live, 'atlas/data/days.json'))['dates']
    cond = J(os.path.join(A.live, 'atlas/data/cond.json')); cap = {c: cond['co']['cap'][k] for k, c in enumerate(cond['co']['c'])}
    CODES = sorted(B); IXN = sorted(set(B[c]['group']['label'] for c in CODES)); IXI = {nm: i for i, nm in enumerate(IXN)}
    IXc = np.array([IXI[B[c]['group']['label']] for c in CODES]); capv = np.array([cap.get(c) or np.nan for c in CODES], float)
    PM = np.full((len(CODES), len(DATES)), np.nan)
    for j, c in enumerate(CODES):
        try: co = J(os.path.join(A.live, 'atlas/data/co', c + '.json'))
        except Exception: continue
        cl, k0 = co.get('close'), co.get('k0')
        if not isinstance(cl, list) or not isinstance(k0, int): continue
        for i, x in enumerate(cl):
            t = i + k0
            if 0 <= t < len(DATES) and isinstance(x, (int, float)) and x > 0: PM[j, t] = x
    T = len(DATES) - 1; t0 = S36.NEED_T; rng = np.random.default_rng(SEED - 1)
    fall, pool = [], {}
    runs = {k: [] for k in S36.KINDS}; rundays = {k: [] for k in S36.KINDS}; picked = {k: 0 for k in S36.KINDS}
    idx = {c: j for j, c in enumerate(CODES)}
    for t in range(t0, T - HMAX + 1):
        if SUN.land(SUN.market(PM, t)) != 'fall': continue
        d = DATES[t]; fall.append(d)
        with np.errstate(invalid='ignore', divide='ignore'):
            F = PM[:, t + 1:t + HMAX + 1] / PM[:, t:t + 1] - 1
        R = S36.lists36(CODES, IXc, PM, t, capv, dates=DATES)
        for k, Lk in R['lists'].items():
            if not Lk: continue
            picked[k] += 1
            jj = [idx[c] for c in Lk if c in idx]
            if not jj: continue
            with np.errstate(invalid='ignore'):
                path = np.nanmean(F[jj], axis=0)
            if np.isfinite(path[0]) and path[0] > 0:
                runs[k].append(run_len(path)); rundays[k].append(d)
        ok = np.where(np.isfinite(F).all(axis=1))[0]
        if len(ok) >= 30:
            sel = ok[np.argpartition(rng.random((3000, len(ok))), 7, axis=1)[:, :7]]
            P7 = F[sel].mean(axis=1)
            pos = P7[P7[:, 0] > 0] > 0
            if len(pos):
                fb = np.where(pos.all(axis=1), HMAX, np.argmin(pos, axis=1))
                rl = np.where(fb >= HMAX, HMAX + 1, fb)
                pool[d] = rl[rng.integers(0, len(rl), POOL)]
    out = summarize(S36.KINDS, DATES, fall, runs, rundays, pool, picked, A.sims)
    out['asOf'] = DATES[T]; out['from'] = DATES[t0] if t0 < len(DATES) else None
    out['took'] = round(time.time() - st, 1)
    os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
    json.dump(out, open(A.out, 'w', encoding='utf-8'), ensure_ascii=False, allow_nan=False, separators=(',', ':'))
    s = out['steps']
    print('내리는 시장 %d날(%s ~ %s) · 꾀 %d → 자료 없음 %d → 적음 %d → 견줌 %d(길다 %d · 비슷 %d · 짧다 %d) · 뚜렷 길다 %d · 짧다 %d · %.1f초'
          % (out['fallDays'], out['fallFrom'], out['fallTo'], s['kinds'], s['none'], s['few'], s['counted'], s['long'], s['like'], s['short'], s['sureLong'], s['sureShort'], out['took']))


if __name__ == '__main__':
    main()
