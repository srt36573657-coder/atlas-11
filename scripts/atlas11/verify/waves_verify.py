#!/usr/bin/env python3
"""ATLAS 11 · 「돈의 파장 1~5차」 따로 세기(파이썬 · 표준 라이브러리만) — lib/atlas11/rotation.mjs 코드를 쓰지 않고 판 원자료에서 처음부터 다시 센다
  사장님 2026-10-08 06:46 「그리고 돈에 흐름이 1차 파장만 있다 5차 파장까지 도입하라」
  다시 세는 것(다섯 나라 — 한국 · 미국 · 중국 · 일본 · 베트남):
    ① 원자료 — 종가 · 시가총액: public/data/input.json(한국) · public/data/atlas11/<시장>/input.json(바깥 판) / 업종: 그 판 view/board.json
       시가총액(억 · 그 나라 돈) = 한국 quality.marketCapEok · 바깥 판 quality.capUsd(미국) 또는 quality.cap = 천 단위 → ÷ 100,000
       거래일 = input.json calendar.sessions 가운데 판 날짜(board.asOf)까지 · 기준 날 = universe.selectedAt 날짜 이전 마지막 거래일
    ② 업종 지수 — 그날 「셀 수 있는 회사」(그날 종가와 앞 거래일 종가가 모두 있음)의 값 합 ÷ 같은 회사들의 앞 거래일 값 합을 이어 곱함
       (회사 값 = 시가총액 × 종가 ÷ 기준 날 종가 · 종가가 빠진 날은 앞 종가를 들고 감 · 셀 회사가 없는 날은 앞 값 그대로)
       — JS 는 「오르내림을 무게(시가총액 × 앞 종가 ÷ 기준 날 종가)로 평균」 · 같은 값을 다른 식으로 셈
    ③ 업종 시가총액 = 업종 시가총액 합(기준 날) × 지수 ÷ 기준 날 지수 · 전체 = 업종 합(math.fsum)
       옮겨 간 돈(억) = 끝 날 전체 × (끝 날 업종 비중 − 시작 날 업종 비중) — JS 는 「업종 변화 − 전체와 같은 비율이었다면의 변화」(같은 값)
    ④ 파장 — 마지막 종가 날부터 거꾸로 10거래일씩(12마디까지 · 10거래일이 안 되는 맨 앞 자투리는 안 씀)
       · 마디마다 가장 많이 들어간 업종(억으로 반올림 · 0 보다 큼 · 같으면 판 차례 앞) · 들어간 업종이 없는 마디는 건너뜀(앞뒤를 잇지 않음)
       · 맞닿은 마디의 업종이 같으면 한 파장으로 묶고 묶은 기간 전체로 다시 셈(들어간 돈 · 가장 많이 빠진 업종과 빠진 돈)
       · 가장 새 다섯을 오래된 것부터 1차 · 2차 … · 맨 앞 마디까지 이어진 파장은 「넘게」(atLeast)
  맞대기: rotationOf(scripts/atlas11/story/build.mjs)가 낸 waves — 차례 · 날짜 · 거래일 수 · 업종 id · 넘게는 똑같아야 · 금액은 ±1억 안
          · 마지막 파장 업종 = JS 「들어가는 업종」(pair.to)
  쓰는 법(저장소 맨 위에서):
    (1) node 한 줄로 JS 결과를 임시 파일에 —
        node --input-type=module -e 'import {rotationOf, ROT_PLACES} from "./scripts/atlas11/story/build.mjs"; const o = {}; for (const [p] of ROT_PLACES) o[p] = await rotationOf(process.cwd(), p); console.log(JSON.stringify(o))' > /tmp/waves_js.json
    (2) python3 -I scripts/atlas11/verify/waves_verify.py --js /tmp/waves_js.json [--root .] [--windows]
        (--js 를 빼면 위 한 줄을 스스로 돌림 · --windows 는 마디마다 1위 · 2위 · 차이를 찍음)
  결과: 다섯 나라 모두 MATCH 면 끝값 0 · DIFF 가 하나라도 있으면 끝값 1 · 앞날 말 없음(지난 종가만 셈)
"""
import argparse, json, math, re, subprocess, sys
from pathlib import Path

PLACES = [('kr', '한국', 'public/data/input.json', 'public/data/atlas11/view/board.json'),
          ('us', '미국', 'public/data/atlas11/us/input.json', 'public/data/atlas11/us/view/board.json'),
          ('cn', '중국', 'public/data/atlas11/cn/input.json', 'public/data/atlas11/cn/view/board.json'),
          ('jp', '일본', 'public/data/atlas11/jp/input.json', 'public/data/atlas11/jp/view/board.json'),
          ('vn', '베트남', 'public/data/atlas11/vn/input.json', 'public/data/atlas11/vn/view/board.json')]
SIZE, CUTS, KEEP = 10, 12, 5  # 마디 길이(거래일) · 마디 수 · 남기는 파장 수
ISO = re.compile(r'[0-9]{4}-[0-9]{2}-[0-9]{2}')
JS_ONE_LINER = ('import {rotationOf, ROT_PLACES} from "./scripts/atlas11/story/build.mjs"; const o = {}; '
                'for (const [p] of ROT_PLACES) o[p] = await rotationOf(process.cwd(), p); console.log(JSON.stringify(o))')


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def iso(s):
    return isinstance(s, str) and ISO.fullmatch(s) is not None


def half_up(x):
    """억으로 반올림 — .5 는 위로(JS Math.round 와 같은 규칙 · 파이썬 round 는 짝수 쪽이라 쓰지 않음)"""
    f = math.floor(x)
    return int(f) + (1 if x - f >= 0.5 else 0)


def cap_eok(place, q):
    q = q if isinstance(q, dict) else {}
    if place == 'kr':
        v = q.get('marketCapEok')
        return v if num(v) else None
    v = q.get('capUsd')
    if v is None:
        v = q.get('cap')
    return v / 100000 if num(v) else None  # 천 단위 그 나라 돈 → 억


def closes_of(asset, as_of):
    m = {}
    for p in asset.get('prices') or []:
        if not isinstance(p, dict):
            continue
        d, c = p.get('date'), p.get('close')
        if iso(d) and d <= as_of and num(c) and c > 0 and p.get('finalClose') is not False:
            m[d] = c
    return m


def industry_index(days, members):
    """② 업종 지수 — members: [(cap, closes, ref)] · 첫날 1"""
    idx, level, prev = [], 1.0, [None] * len(members)
    for k, d in enumerate(days):
        now_v, prev_v = [], []
        for j, (cap, closes, ref) in enumerate(members):
            c = closes.get(d)
            if c is None:
                continue
            if prev[j] is not None:
                now_v.append(cap * c / ref)
                prev_v.append(cap * prev[j] / ref)
            prev[j] = c
        den = math.fsum(prev_v)
        if k > 0 and den > 0:
            level *= math.fsum(now_v) / den
        idx.append(level)
    return idx


def market_of(root, place, in_file, board_file):
    inp = json.loads((root / in_file).read_text(encoding='utf-8'))
    board = json.loads((root / board_file).read_text(encoding='utf-8'))
    as_of = board['asOf']
    days = [d for d in (inp.get('calendar') or {}).get('sessions') or [] if iso(d) and d <= as_of]
    if any(a >= b for a, b in zip(days, days[1:])):
        raise SystemExit(f'{place}: 거래일 차례가 오름차순이 아님 — 다시 세기를 멈춤')
    cap_day = str((inp.get('universe') or {}).get('selectedAt') or as_of)[:10]
    ref_day = ([d for d in days if d <= cap_day] or days)[-1]
    k_ref = days.index(ref_day)
    assets = {a.get('code'): a for a in inp.get('assets') or []}
    G = []
    for g in board.get('groups') or []:
        members = []
        for code in g.get('codes') or []:
            a = assets.get(code)
            if a is None:
                continue
            closes, cap = closes_of(a, as_of), cap_eok(place, a.get('quality'))
            ref = closes.get(ref_day)
            if ref is None:
                before = [d for d in closes if d <= ref_day]
                ref = closes[max(before)] if before else None
            if num(cap) and cap > 0 and num(ref):
                members.append((cap, closes, ref))
        if not members:
            continue
        idx = industry_index(days, members)
        cap_ref = math.fsum(m[0] for m in members)
        G.append({'id': g['id'], 'label': g['label'], 'level': [cap_ref * x / idx[k_ref] for x in idx]})
    M = [math.fsum(g['level'][k] for g in G) for k in range(len(days))]
    return {'asOf': as_of, 'days': days, 'G': G, 'M': M}


def moved(mk, g, a, b):
    """③ 옮겨 간 돈(억) = 끝 날 전체 × (끝 날 비중 − 시작 날 비중)"""
    M = mk['M']
    return M[b] * (g['level'][b] / M[b] - g['level'][a] / M[a])


def ranked(mk, a, b):
    """a → b 업종마다 (반올림 억, 판 차례, 셈 그대로 억, 업종) — 들어간 돈이 큰 순(같으면 판 차례 앞)"""
    rows = [(half_up(v), i, v, g) for i, g in enumerate(mk['G']) for v in [moved(mk, g, a, b)]]
    return sorted(rows, key=lambda r: (-r[0], r[1]))


def waves_of(mk):
    days, T = mk['days'], len(mk['days']) - 1
    cuts = [(T - SIZE * (j + 1), T - SIZE * j) for j in range(CUTS - 1, -1, -1) if T - SIZE * (j + 1) >= 0]
    runs, detail = [], []
    for a, b in cuts:
        r = ranked(mk, a, b)
        up = r[0] if r and r[0][0] > 0 else None
        detail.append((a, b, r))
        if up is None:
            continue
        if runs and runs[-1]['g'] is up[3] and runs[-1]['b'] == a:
            runs[-1]['b'] = b
        else:
            runs.append({'g': up[3], 'a': a, 'b': b})
    out = []
    for n, w in enumerate(runs[-KEEP:], 1):
        g, a, b = w['g'], w['a'], w['b']
        downs = [r for r in ranked(mk, a, b) if r[0] < 0]
        down = min(downs, key=lambda r: (r[0], r[1])) if downs else None
        out.append({'n': n, 'to': {'id': g['id'], 'label': g['label']}, 'from': {'id': down[3]['id'], 'label': down[3]['label']} if down else None,
                    'start': days[a], 'end': days[b], 'days': b - a, 'amount': half_up(moved(mk, g, a, b)),
                    'fromAmount': down[0] if down else None, 'atLeast': a == cuts[0][0]})
    return out, cuts, detail


def compare(py, js):
    bad, jw = [], (js or {}).get('waves') if isinstance(js, dict) else None
    if not isinstance(jw, list):
        return ['JS 결과에 waves 없음' + (f" ({js.get('reason')})" if isinstance(js, dict) and js.get('reason') else '')]
    if len(jw) != len(py):
        bad.append(f'파장 수 — 파이썬 {len(py)} · JS {len(jw)}')
    for p, j in zip(py, jw):
        for key in ('n', 'start', 'end', 'days', 'atLeast'):
            if p[key] != j.get(key):
                bad.append(f"{p['n']}차 {key} — 파이썬 {p[key]} · JS {j.get(key)}")
        for key in ('to', 'from'):
            pk, jk = p[key] or {}, j.get(key) or {}
            if pk.get('id') != jk.get('id'):
                bad.append(f"{p['n']}차 {key} — 파이썬 {pk.get('label')}({pk.get('id')}) · JS {jk.get('label')}({jk.get('id')})")
        for key in ('amount', 'fromAmount'):
            if not (num(j.get(key)) and p[key] is not None and abs(p[key] - j[key]) <= 1):
                bad.append(f"{p['n']}차 {key} — 파이썬 {p[key]} · JS {j.get(key)}")
    if py and py[-1]['to']['id'] != ((js.get('pair') or {}).get('to') or {}).get('id'):
        bad.append(f"마지막 파장 {py[-1]['to']['label']} ≠ JS 들어가는 업종 {((js.get('pair') or {}).get('to') or {}).get('label')}")
    return bad


def eok(x):
    return ('+' if x > 0 else '−' if x < 0 else '') + f'{abs(x):,}억'


def main():
    ap = argparse.ArgumentParser(description='돈의 파장 1~5차 따로 세기 — rotationOf 결과와 맞댐')
    ap.add_argument('--root', default='.', help='저장소 맨 위(기본 .)')
    ap.add_argument('--js', help='node 한 줄로 쏟은 rotationOf 결과(JSON) — 빼면 스스로 돌림')
    ap.add_argument('--windows', action='store_true', help='마디마다 1위 · 2위 · 차이를 찍음')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if args.js:
        js_all = json.loads(Path(args.js).read_text(encoding='utf-8'))
    else:
        js_all = json.loads(subprocess.run(['node', '--input-type=module', '-e', JS_ONE_LINER], cwd=root, check=True, capture_output=True, text=True).stdout)
    all_ok = True
    for place, name, in_file, board_file in PLACES:
        mk = market_of(root, place, in_file, board_file)
        py, cuts, detail = waves_of(mk)
        js = js_all.get(place)
        bad = compare(py, js)
        all_ok = all_ok and not bad
        jw = {w.get('n'): w for w in (js or {}).get('waves') or []} if isinstance(js, dict) else {}
        days = mk['days']
        print(f"== {place} {name} · 종가 {mk['asOf']} · 업종 {len(mk['G'])} · 마디 {len(cuts)}({days[cuts[0][0]]} ~ {days[cuts[-1][1]]}) · 파장 {len(py)} · JS 들어가는 업종 {((js or {}).get('pair') or {}).get('to', {}).get('label')}")
        for w in py:
            j = jw.get(w['n'], {})
            print(f"  {w['n']}차  {w['from']['label'] if w['from'] else '없음'} → {w['to']['label']}  {w['start']} ~ {w['end']} · {w['days']}거래일{' · 넘게' if w['atLeast'] else ''}"
                  f"  들어감 {eok(w['amount'])}(JS {eok(j['amount']) if num(j.get('amount')) else '없음'}) · 빠짐 {eok(w['fromAmount']) if w['fromAmount'] is not None else '없음'}(JS {eok(j['fromAmount']) if num(j.get('fromAmount')) else '없음'})")
        kept = days.index(py[0]['start']) if py else len(days)
        gaps = [(r[0][2] - r[1][2], days[a]) for a, _, r in detail if a >= kept and len(r) > 1 and r[0][0] > 0]
        if gaps:
            g, d = min(gaps)
            print(f"  다섯 파장 안 마디의 1위와 2위 차이(가장 작은 것) {g:,.1f}억({d}~) — 이보다 작은 셈 차이로는 1위가 바뀌지 않음")
        if args.windows:
            for a, b, r in detail:
                print(f"    마디 {days[a]} ~ {days[b]}  1위 {r[0][3]['label']} {eok(r[0][0])} · 2위 {r[1][3]['label']} {eok(r[1][0])}" if len(r) > 1 else f"    마디 {days[a]} ~ {days[b]}  업종 하나")
        print('  MATCH' if not bad else '  DIFF — ' + ' / '.join(bad[:8]) + (f' / … 그 밖 {len(bad) - 8}개' if len(bad) > 8 else ''))
    print('모두 MATCH (5/5)' if all_ok else '다른 것이 있음 — DIFF')
    sys.exit(0 if all_ok else 1)


if __name__ == '__main__':
    main()
