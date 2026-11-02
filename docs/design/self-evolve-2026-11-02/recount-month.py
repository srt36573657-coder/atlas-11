#!/usr/bin/env python3
"""꽃 될 회사 — 달마다 스스로 다시 고르기 · 따로 센 일꾼의 달 셈(셈 약속 v2)

docs/design/self-evolve-2026-11-02/spec.md(v2)와 자료만 보고 셈한다.
v1 의 뜻(자료 · 낱 조건 156 · 짝 11,718 · 들 수 있음 · 점수 LB · 고르기)은 따로 센 일꾼의 v1 셈
docs/design/bloom-evolve-2026-11-02/recount-independent.py 를 깃발 없이(= 그 파일의 기본 읽기) 통째로 불러 쓴다.
연구 셈(scripts/atlas11/research/bloom_evolve.py · bloom_month.py)과 사이트 엔진(site/next/*.js)은 열지 않았다.

쓰는 법:
  python3 docs/design/self-evolve-2026-11-02/recount-month.py <자료 폴더> <결과 json> [--stored <bloom-months.json>]
    --stored  적힌 결정 파일. 2026-11 부터의 달이 sealed: true 로 적혀 있으면 그 id 로 기록을 셈(새로 센 것은 fresh).
              2026-10 까지의 달은 적힌 것이 있어도 쓰지 않고 늘 새로 센다(지난 기록으로 돌려 본 달 · 봉인 아님).

v2 가 v1 에 더하는 것:
  1. 결정 — 배우는 날(T0 ≤ t ≤ s − 20 · 날 차례)이 250 이상인 첫 달부터 s 가 자료에 있는 마지막 달까지
     (v1 은 TL 이 든 달까지). 고르기는 v1 select() 그대로 · 들 수 있는 것이 없으면 id = null.
  2. 봉인 — 위 --stored.
  3. 달 기록 — 그 달 결정 r 로, t ∈ M · T0 ≤ t ≤ TL(= N − 21) 인 날마다
     n = #(SPROUT & BASEM & r) · h = 그중 FLOWER · nb = #BASEM · hb = 그중 FLOWER · days · pickDays(n_t > 0 인 날).
     complete = 그 달 거래일이 모두 ≤ TL 이고 다음 달 첫 거래일이 자료에 있음. id = null 이면 n = h = pickDays = 0.
  4. 모은 수 — 모든 달의 n · h · nb · hb 합(달 기록이 결과가 난 날만 세므로 = 결과가 난 모든 날의 합).
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다. 사고팔기를 권하지 않는다.
"""
import argparse
import contextlib
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
V1 = os.path.normpath(os.path.join(HERE, '..', 'bloom-evolve-2026-11-02', 'recount-independent.py'))
CANDS = os.path.normpath(os.path.join(HERE, '..', 'bloom-evolve-2026-11-02', 'candidates.json'))
SEAL_FROM = '2026-11'      # 이 달부터 봉인(spec v2 §2)
MIN_TRAIN = 250            # 첫 결정 달 = 배우는 날 250 이상(spec v1 · v2 §1)
SCHEMA = 'bloom-month-recount-1'


def say(*a):
    print(*a, file=sys.stderr, flush=True)


def load_stored(path):
    """{"months":[{"month":"YYYY-MM","id":"a&b"|null,"sealed":bool,…}]} → {month: {'id', 'sealed'}}"""
    if not os.path.exists(path):
        raise SystemExit(f'--stored 파일이 없음: {path}')
    d = json.load(open(path, encoding='utf8'))
    rows = d.get('months') if isinstance(d, dict) else None
    if not isinstance(rows, list):
        raise SystemExit(f'--stored {path}: "months" 목록이 없음')
    out = {}
    for r in rows:
        if not isinstance(r, dict) or not isinstance(r.get('month'), str):
            raise SystemExit(f'--stored {path}: 달 줄 모양이 다름 {r!r}')
        if r['month'] in out:
            raise SystemExit(f'--stored {path}: 같은 달이 두 번 {r["month"]}')
        out[r['month']] = {'id': r.get('id'), 'sealed': r.get('sealed') is True}
    return out


def run_v1(root):
    """v1 따로 센 일꾼을 깃발 없이(기본 읽기) · 결과 파일 없이 돌리고 그 이름 공간을 돌려줌"""
    src = open(V1, encoding='utf8').read()
    g = {'__name__': 'recount_independent_v1', '__file__': V1}
    argv = sys.argv
    sys.argv = [V1, root]
    try:
        with contextlib.redirect_stdout(sys.stderr):
            exec(compile(src, V1, 'exec'), g)
    finally:
        sys.argv = argv
    if g['FLAGS']:
        raise SystemExit(f'v1 깃발이 켜짐 {sorted(g["FLAGS"])} — 기본 읽기여야 함')
    return g


def check_atom_order(g):
    """짝 이름(a&b)이 candidates.json 낱 조건 차례를 따르는지"""
    if not os.path.exists(CANDS):
        say('candidates.json 없음 — 낱 조건 차례 맞대기 건너뜀', CANDS)
        return
    c = json.load(open(CANDS, encoding='utf8'))
    mine = [(s['id'], s['fam']) for s in g['SING']]
    theirs = [(a['id'], a['fam']) for a in c['atoms']]
    if mine != theirs or len(g['IDS']) != c['candidates']:
        raise SystemExit('낱 조건 차례 · 후보 수가 candidates.json 과 다름')


def resolve(sid, index):
    """적힌 id → 후보 번호(짝 차례가 뒤집혀 적혔으면 바로잡음) · null → None"""
    if sid is None:
        return None
    if sid in index:
        return index[sid]
    parts = str(sid).split('&')
    if len(parts) == 2 and f'{parts[1]}&{parts[0]}' in index:
        return index[f'{parts[1]}&{parts[0]}']
    raise SystemExit(f'봉인된 id {sid!r} 가 후보 안에 없음')


def calendar_months(D):
    """[달, 첫 거래일 s, 마지막 거래일] — 자료에 있는 날로만"""
    out = []
    for t, day in enumerate(D):
        mk = day[:7]
        if not out or out[-1][0] != mk:
            out.append([mk, t, t])
        else:
            out[-1][2] = t
    return out


def month_rows(g, stored=None, seal_from=SEAL_FROM):
    D, T0, TL = g['D'], g['T0'], g['TL']
    IDS, nD, hD, nbD, hbD, select = g['IDS'], g['nD'], g['hD'], g['nbD'], g['hbD'], g['select']
    index = {cid: k for k, cid in enumerate(IDS)}
    cal = calendar_months(D)
    rows = []
    started = False
    for k, (mk, s, last) in enumerate(cal):
        train = s - 20 - T0 + 1                       # 배우는 날 T0 .. s − 20
        if not started:
            if train < MIN_TRAIN:
                continue
            started = True
        ci, _info = select(s - 20 - T0)
        fresh = IDS[ci] if ci is not None else None
        use, sealed = ci, False
        if stored is not None and mk >= seal_from and mk in stored and stored[mk]['sealed']:
            use, sealed = resolve(stored[mk]['id'], index), True
        elif stored is not None and mk in stored and stored[mk]['sealed']:
            say('봉인 무시(2026-10 까지는 늘 새로 셈):', mk, stored[mk]['id'], '→ 새로 센 것', fresh)
        a, e = max(s, T0), min(last, TL)               # 기록 = t ∈ M · T0 ≤ t ≤ TL
        days = max(0, e - a + 1)
        n = h = nb = hb = pick = 0
        if days:
            ds = slice(a - T0, e - T0 + 1)
            nb, hb = int(nbD[ds].sum()), int(hbD[ds].sum())
            if use is not None:
                col = nD[ds, use]
                n, h, pick = int(col.sum()), int(hD[ds, use].sum()), int((col > 0).sum())
        complete = bool(last <= TL and k + 1 < len(cal))
        rows.append({'month': mk, 's': D[s], 'id': IDS[use] if use is not None else None, 'fresh': fresh,
                     'sealed': sealed, 'trainDays': int(train),
                     'record': {'n': n, 'h': h, 'nb': nb, 'hb': hb, 'days': int(days), 'pickDays': pick,
                                'complete': complete}})
    return rows


def self_check(g, rows, tot):
    """같은 실행 안 v1 걸음(steps · periodA)과 맞댐 — 겹치는 달의 결정 · 기록이 같아야 함"""
    v1 = {r['month']: r for r in g['steps']}
    same = 0
    for m in rows:
        r = v1.get(m['month'])
        if r is None:
            continue
        if m['fresh'] != r['chosen_id']:
            raise SystemExit(f'v1 걸음과 결정이 다름 {m["month"]} {m["fresh"]} ≠ {r["chosen_id"]}')
        if not m['sealed']:
            want = (r.get('oos_n', 0), r.get('oos_hits', 0), r['eval_days'])
            got = (m['record']['n'], m['record']['h'], m['record']['days'])
            if want != got:
                raise SystemExit(f'v1 걸음과 기록이 다름 {m["month"]} {got} ≠ {want}')
        same += 1
    pa = g['res']['periodA']
    extra = [m for m in rows if m['month'] not in v1]
    extra_n = sum(m['record']['n'] for m in extra)
    extra_h = sum(m['record']['h'] for m in extra)
    if not any(m['sealed'] for m in rows if m['month'] in v1):
        if (tot['n'] - extra_n, tot['h'] - extra_h) != (pa['n'], pa['hits']):
            raise SystemExit(f'v1 periodA 와 합이 다름 {tot} vs {pa}')
    return {'v1_months_matched': same, 'v1_periodA': [pa['n'], pa['hits']], 'extra_months': [m['month'] for m in extra],
            'extra_n_h': [extra_n, extra_h]}


def main():
    ap = argparse.ArgumentParser(description='꽃 될 회사 — 달마다 다시 고르기 따로 센 일꾼(spec v2)')
    ap.add_argument('root', help='자료 폴더(예: site/atlas/data)')
    ap.add_argument('out', help='결과 json')
    ap.add_argument('--stored', help='적힌 결정 파일(bloom-months.json) — 2026-11 부터 sealed: true 만 씀')
    args = ap.parse_args()
    t_start = time.time()
    stored = load_stored(args.stored) if args.stored else None
    g = run_v1(args.root)
    check_atom_order(g)
    rows = month_rows(g, stored)
    tot = {k: sum(m['record'][k] for m in rows) for k in ('n', 'h', 'nb', 'hb')}
    chk = self_check(g, rows, tot)
    D, TL = g['D'], g['TL']
    res = {'schema': SCHEMA, 'asOf': D[-1], 'tl': D[TL], 'months': rows, 'totals': tot}
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, 'w', encoding='utf8') as fh:
        fh.write(json.dumps(res, ensure_ascii=False, indent=1) + '\n')

    def score(r):
        return None if r['n'] == 0 else round(100 * (r['h'] / r['n'] - r['hb'] / r['nb']), 2)

    summary = {'runtime_s': round(time.time() - t_start, 1), 'asOf': res['asOf'], 'tl': res['tl'], 'months': len(rows),
               'first': rows[0]['month'] if rows else None, 'last4': [
                   {'month': m['month'], 'id': m['id'], 'fresh': m['fresh'], 'sealed': m['sealed'], 'trainDays': m['trainDays'],
                    **m['record'], 'score': score(m['record'])} for m in rows[-4:]],
               'totals': tot, 'totalScore': score(tot), 'selfCheck': chk, 'out': args.out}
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    main()
