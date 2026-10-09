#!/usr/bin/env python3
"""ATLAS 11 · 매수 검토 후보 3판 「1만 번 다시 뽑기(몬테카를로) · 소거법」 따로 세기(파이썬 · 표준 라이브러리만)
  사장님 2026-10-09 10:14 「7개에 종목을 선정할때 모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템을 구축하여 다시 7개에 종목을 찾아내라」
  lib/atlas11/cand.mjs 의 다시 뽑기 코드를 쓰지 않고 다시 센다:
    ① 업종 날마다 값 — 판 원자료(public/data/input.json 종가 · 시가총액 / 한국 판 board.json 업종 / reports/atlas11/context/latest.json 이 가리키는 관측 묶음 순매매)에서
       업종 지수를 「값 합 ÷ 앞 값 합」으로(JS 는 무게 평균 — 같은 값을 다른 식으로) · 그날 옮겨 간 돈 = 끝 날 전체 × (그날 비중 − 앞날 비중)
       · 그날 로그 오르내림 · 그날 외국인+기관 × 그날 종가 → JS rotation daily 와 맞댐(±0.0001억 · ±1e-9)
    ② 종목 날마다 값 — 판이 쓴 관측 묶음(manifest.market.record)의 마지막 열 날 × 그날 종가(억) — 빠진 날이 있으면 다시 뽑기에 넣지 않음
    ③ 씨앗(FNV-1a · 「규칙 이름|판 날짜」) · 고른 수(mulberry32 · 32비트 정수 셈) · 한 번마다 열 날을 다시 뽑아 같은 규칙으로 7곳(업종 3곳 · 같은 업종 3곳)
       → 회사마다 7곳에 든 횟수 · 업종마다 3곳에 든 횟수 — JS 날마다 값으로 센 것은 똑같아야(0번 차이) · 파이썬 날마다 값으로 센 것도 견줌
    ④ 소거법 — 기준(①② 다섯 조건 · 판 읽기 flags)을 넘은 곳을 진입 조건 → 횟수 → 세기 → 금액 → 종목 기호 차례로 세우고 같은 업종 3곳 · 7곳 → JS 7곳 · 뺀 곳과 맞댐
    ⑥ 흔들림 검사 — 씨앗만 바꿔 네 번 더 같은 소거법 → 7곳 · 차례가 같은지 판정이 JS 와 같아야
    ⑤ 열 날을 그대로 한 번씩 뽑으면 2판(몬테카를로 없음) 7곳과 같아야
  고정 사실(종가 있음 · 흑자 · 위험 공시 없음 · 진입 조건 · 시가총액)은 판 읽기(JS)의 값을 그대로 씀 — 여기서 다시 세는 것은 다시 뽑기와 소거법
  쓰는 법(저장소 맨 위에서): python3 -I scripts/atlas11/verify/cand_mc_verify.py [--root .] [--js 쏟은.json] [--out 결과.json]
    (--js 를 빼면 node 한 줄로 판 읽기 · 돈 흐름 날마다 값을 스스로 쏟음)
  결과: 모두 MATCH 면 끝값 0 · DIFF 가 하나라도 있으면 끝값 1 · 앞날 말 없음(지난 열 날만 다시 뽑음 — 앞날 오를 확률이 아님)
"""
import argparse, json, math, re, subprocess, sys
from pathlib import Path

ISO = re.compile(r'[0-9]{4}-[0-9]{2}-[0-9]{2}')
M32 = 0xFFFFFFFF
JS_ONE_LINER = ('import {lensFrom} from "./scripts/atlas11/lens/build.mjs"; import {rotationOf} from "./scripts/atlas11/story/build.mjs"; '
                'const root = process.cwd(); const l = await lensFrom(root, "kr"); const r = await rotationOf(root, "kr", {daily: true}); '
                'const man = JSON.parse((await import("node:fs")).readFileSync(root + "/public/data/atlas11/view/manifest.json", "utf8")); '
                'console.log(JSON.stringify({asOf: l.asOf, cand: l.cand, stocks: l.stocks.map(s => ({code: s.code, g: s.g, cap: s.fund?.cap ?? null, fl: s.fl ?? null})), '
                'rdaily: r.daily ?? null, rasOf: r.asOf ?? null, record: man.market?.record ?? null}))')


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def iso(s):
    return isinstance(s, str) and ISO.fullmatch(s) is not None


def half_up(x):
    """JS Math.round 와 같은 반올림(.5 는 위로) — 파이썬 round 는 짝수 쪽이라 쓰지 않음"""
    f = math.floor(x)
    return int(f) + (1 if x - f >= 0.5 else 0)


def fnv1a(text):
    h = 0x811C9DC5
    for b in text.encode('ascii'):
        h = ((h ^ b) * 0x01000193) & M32
    return h


def mulberry32(seed):
    a = seed & M32

    def nxt():
        nonlocal a
        a = (a + 0x6D2B79F5) & M32
        t = ((a ^ (a >> 15)) * (1 | a)) & M32
        t = ((t + (((t ^ (t >> 7)) * (61 | t)) & M32)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / 4294967296
    return nxt


def closes_of(asset, as_of):
    """돈 흐름(rotation)과 같은 종가 — 판 날짜까지 · 0 보다 큼 · 확정 아님(finalClose false)은 뺌"""
    m = {}
    for p in asset.get('prices') or []:
        if not isinstance(p, dict):
            continue
        d, c = p.get('date'), p.get('close')
        if iso(d) and d <= as_of and num(c) and c > 0 and p.get('finalClose') is not False:
            m[d] = c
    return m


def price_map(asset):
    """판 읽기(lens)와 같은 종가 — 날짜가 있고 0 보다 큼"""
    m = {}
    for p in asset.get('prices') or []:
        if isinstance(p, dict) and p.get('date') and num(p.get('close')) and p['close'] > 0:
            m[p['date']] = p['close']
    return m


def industry_index(days, members):
    """업종 지수 — 그날 셀 수 있는 회사 값 합 ÷ 같은 회사들 앞 값 합을 이어 곱함(첫날 1)"""
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


def sector_daily(root, board, flows, window=10):
    """① 업종 날마다 값(파이썬 셈) — {dates, sectors: [{id, label, c, lr, fi}]}"""
    inp = json.loads((root / 'public/data/input.json').read_text(encoding='utf-8'))
    as_of = board['asOf']
    days = [d for d in (inp.get('calendar') or {}).get('sessions') or [] if iso(d) and d <= as_of]
    cap_day = str((inp.get('universe') or {}).get('selectedAt') or as_of)[:10]
    ref_day = ([d for d in days if d <= cap_day] or days)[-1]
    k_ref, T = days.index(ref_day), len(days) - 1
    t0 = T - window
    assets = {a.get('code'): a for a in inp.get('assets') or []}
    G = []
    for g in board.get('groups') or []:
        members, codes = [], []
        for code in g.get('codes') or []:
            a = assets.get(code)
            if a is None:
                continue
            closes, cap = closes_of(a, as_of), (a.get('quality') or {}).get('marketCapEok')
            ref = closes.get(ref_day)
            if ref is None:
                before = [d for d in closes if d <= ref_day]
                ref = closes[max(before)] if before else None
            if num(cap) and cap > 0 and num(ref):
                members.append((cap, closes, ref))
                codes.append(code)
        if not members:
            continue
        idx = industry_index(days, members)
        cap_ref = math.fsum(m[0] for m in members)
        G.append({'id': g['id'], 'label': g['label'], 'idx': idx, 'level': [cap_ref * x / idx[k_ref] for x in idx], 'codes': codes,
                  'closes': {c: m[1] for c, m in zip(codes, members)}})
    M = [math.fsum(g['level'][k] for g in G) for k in range(len(days))]
    wd = days[t0 + 1:T + 1]
    group_of = {c: g['id'] for g in G for c in g['codes']}
    fi = {g['id']: {} for g in G}
    for f in flows:
        gid = group_of.get(f.get('code'))
        if gid is None:
            continue
        closes = next(g for g in G if g['id'] == gid)['closes'][f['code']]
        for r in f.get('rows') or []:
            d, c = r.get('date'), closes.get(r.get('date'))
            if not iso(d) or d > as_of or c is None:
                continue
            if not all(num(r.get(k)) for k in ('foreignNet', 'institutionNet', 'individualNet')):
                continue
            fi[gid][d] = fi[gid].get(d, 0) + (r['foreignNet'] + r['institutionNet']) * c
    out = []
    for g in G:
        lv, ix = g['level'], g['idx']
        c = [M[T] * (lv[k] / M[k] - lv[k - 1] / M[k - 1]) for k in range(t0 + 1, T + 1)]
        lr = [math.log(ix[k] / ix[k - 1]) for k in range(t0 + 1, T + 1)]
        out.append({'id': g['id'], 'label': g['label'], 'c': c, 'lr': lr, 'fi': [fi[g['id']].get(d, 0) / 1e8 for d in wd]})
    return {'dates': wd, 'sectors': out}


def stock_daily(root, record, as_of):
    """② 종목 날마다 값 — 판이 쓴 관측 묶음의 마지막 열 날 × 그날 종가(억) · 빠진 날이 있으면 None"""
    snap = json.loads((root / record).read_text(encoding='utf-8'))
    inp = json.loads((root / 'public/data/input.json').read_text(encoding='utf-8'))
    pm = {str(a.get('code')): price_map(a) for a in inp.get('assets') or []}
    flows = snap.get('flows') or []
    dates = sorted({r.get('date') for f in flows for r in (f.get('rows') or []) if r.get('date') and r.get('date') <= as_of})
    last10 = dates[-10:]
    out = {}
    for f in flows:
        rows = {r.get('date'): r for r in f.get('rows') or []}
        vals = []
        for d in last10:
            r, c = rows.get(d), pm.get(f['code'], {}).get(d)
            if r is None or not num(r.get('foreignNet')) or not num(r.get('institutionNet')) or not num(c):
                vals = None
                break
            vals.append((r['foreignNet'] + r['institutionNet']) * c / 1e8)
        out[f['code']] = vals
    return last10, out


def one_draw(D, by_sec, ix, want=7, per_sector=3, sectors=3):
    """③ 한 번 뽑기 — JS mcDraw 와 같은 규칙(더하는 차례도 같게)"""
    S, n = D['sectors'], len(ix)
    amt, lr, fi, up = [0.0] * len(S), [0.0] * len(S), [0.0] * len(S), []
    for j, g in enumerate(S):
        a = l = f = 0.0
        for i in range(n):
            k = ix[i]
            a += g['c'][k]
            l += g['lr'][k]
            f += g['fi'][k]
        amt[j], lr[j], fi[j] = a, l, f
        if a > 0:
            up.append(j)
    up.sort(key=lambda j: (-amt[j], j))
    secs, cs = [], []
    for j in up[:sectors]:
        if not (fi[j] > 0 and lr[j] > 0):
            continue
        secs.append(S[j]['id'])
        for p in by_sec.get(S[j]['id'], []):
            fe = 0.0
            for i in range(n):
                fe += p['fi'][ix[i]]
            if fe > 0:
                cs.append((p, fe, fe / p['cap'] * 100))
    cs.sort(key=lambda x: (-x[0]['met'], -x[2], -x[1], x[0]['code']))
    per, picked = {}, []
    for p, _, _ in cs:
        if len(picked) >= want:
            break
        k = per.get(p['g'], 0)
        if k >= per_sector:
            continue
        per[p['g']] = k + 1
        picked.append(p['code'])
    return secs, picked


def monte_carlo(D, base, seed, draws):
    rnd, n = mulberry32(seed), len(D['dates'])
    by_sec = {}
    for p in base:
        by_sec.setdefault(p['g'], []).append(p)
    picked, top = {}, {}
    for _ in range(draws):
        ix = [math.floor(rnd() * n) for _ in range(n)]
        secs, ps = one_draw(D, by_sec, ix)
        for s in secs:
            top[s] = top.get(s, 0) + 1
        for c in ps:
            picked[c] = picked.get(c, 0) + 1
    return picked, top, by_sec


def diff_maps(a, b, label):
    bad = []
    for k in sorted(set(a) | set(b)):
        if a.get(k, 0) != b.get(k, 0):
            bad.append(f'{label} {k} — 파이썬 {a.get(k, 0)} · JS {b.get(k, 0)}')
    return bad


def main():
    ap = argparse.ArgumentParser(description='매수 검토 후보 3판 — 1만 번 다시 뽑기 · 소거법 따로 세기')
    ap.add_argument('--root', default='.', help='저장소 맨 위(기본 .)')
    ap.add_argument('--js', help='node 한 줄로 쏟은 판 읽기 · 날마다 값(JSON) — 빼면 스스로 돌림')
    ap.add_argument('--out', help='결과를 JSON 으로 남길 곳')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if args.js:
        js = json.loads(Path(args.js).read_text(encoding='utf-8'))
    else:
        run = subprocess.run(['node', '--input-type=module', '-e', JS_ONE_LINER], cwd=root, capture_output=True, text=True, check=True)
        js = json.loads(run.stdout)
    C, as_of = js['cand'], js['asOf']
    if not C.get('ready'):
        print('DIFF  후보를 고르지 않은 판 —', C.get('why'))
        return 1
    mc = C['mc']
    board = json.loads((root / 'public/data/atlas11/view/board.json').read_text(encoding='utf-8'))
    latest = json.loads((root / 'reports/atlas11/context/latest.json').read_text(encoding='utf-8'))
    rot_flows = json.loads((root / latest['file']).read_text(encoding='utf-8')).get('flows') or []
    report, bad_all = {'asOf': as_of, 'rules': C['rules']}, []

    # ① 업종 날마다 값
    Dpy, Djs = sector_daily(root, board, rot_flows), js['rdaily']
    worst = {'c': 0.0, 'lr': 0.0, 'fi': 0.0}
    bad = [] if Dpy['dates'] == Djs['dates'] else [f"날짜 — 파이썬 {Dpy['dates']} · JS {Djs['dates']}"]
    jmap = {g['id']: g for g in Djs['sectors']}
    if [g['id'] for g in Dpy['sectors']] != [g['id'] for g in Djs['sectors']]:
        bad.append('업종 차례가 다름')
    for g in Dpy['sectors']:
        h = jmap.get(g['id'])
        if h is None:
            bad.append(f"업종 {g['label']} 이 JS 에 없음")
            continue
        for key in worst:
            worst[key] = max(worst[key], max(abs(x - y) for x, y in zip(g[key], h[key])))
    if worst['c'] > 1e-4 or worst['lr'] > 1e-9 or worst['fi'] > 1e-6:
        bad.append(f'날마다 값 차이가 큼 — {worst}')
    print(('MATCH' if not bad else 'DIFF ') + f"  ① 업종 날마다 값 {len(Dpy['sectors'])}곳 × {len(Dpy['dates'])}날 — 가장 큰 차이 옮겨 간 돈 {worst['c']:.2e}억 · 로그 오르내림 {worst['lr']:.2e} · 외국인+기관 {worst['fi']:.2e}억")
    report['sectorDaily'] = {'ok': not bad, 'worst': worst, 'n': len(Dpy['sectors'])}
    bad_all += bad

    # ② 종목 날마다 값 · 다시 뽑기에 든 회사
    last10, sd = stock_daily(root, js['record'], as_of)
    bad = [] if last10 == Djs['dates'] else [f'종목 날짜 {last10} ≠ 업종 날짜 {Djs["dates"]}']
    group_of = {c: g['id'] for g in board.get('groups') or [] for c in g.get('codes') or []}
    st = {s['code']: s for s in js['stocks']}
    base = []
    for code, met in mc['entrants']:
        vals, cap = sd.get(code), (st.get(code) or {}).get('cap')
        if vals is None or not num(cap) or code not in group_of:
            bad.append(f'{code} — 다시 뽑기 회사인데 날마다 값 · 시가총액 · 업종이 없음')
            continue
        base.append({'code': code, 'g': group_of[code], 'cap': cap, 'met': met, 'fi': vals})
    print(('MATCH' if not bad else 'DIFF ') + f'  ② 종목 날마다 값 · 다시 뽑기에 든 회사 {len(base)}곳(JS {mc["base"]}곳)')
    bad_all += bad + ([] if len(base) == mc['base'] else [f'다시 뽑기 회사 수 — 파이썬 {len(base)} · JS {mc["base"]}'])

    # ③ 씨앗 · 1만 번 — (가) JS 날마다 값으로 · (나) 파이썬 날마다 값으로
    seed = fnv1a(f"{C['rules']}|{as_of}")
    bad = [] if seed == mc['seed'] else [f'씨앗 — 파이썬 {seed} · JS {mc["seed"]}']
    pk_js, tp_js, by_sec = monte_carlo(Djs, base, seed, mc['draws'])
    bad += diff_maps(pk_js, mc['counts'], '회사 횟수') + diff_maps(tp_js, mc['top'], '업종 횟수')
    print(('MATCH' if not bad else 'DIFF ') + f"  ③-가 씨앗 {seed} · {mc['draws']:,}번 — 회사 {len(pk_js)}곳 · 업종 {len(tp_js)}곳 횟수가 JS 와 {'똑같음' if not bad else '다름'}")
    bad_all += bad
    pk_py, tp_py, _ = monte_carlo(Dpy, base, seed, mc['draws'])
    d2 = diff_maps(pk_py, mc['counts'], '회사 횟수(파이썬 날마다 값)') + diff_maps(tp_py, mc['top'], '업종 횟수(파이썬 날마다 값)')
    print(('MATCH' if not d2 else 'DIFF ') + f"  ③-나 파이썬이 센 날마다 값으로 다시 1만 번 — {'똑같음' if not d2 else f'{len(d2)}곳 다름'}")
    bad_all += d2
    report['counts'] = {'draws': mc['draws'], 'seed': seed, 'stocks': pk_js, 'sectors': tp_js}

    # ④ 소거법 · ⑤ 그대로 뽑기 = 2판
    flags, draws = C['flags'], mc['draws']
    def fie(s):
        fl = s.get('fl') or {}
        return (fl['f10e'] + fl['i10e']) / 1e8 if num(fl.get('f10e')) and num(fl.get('i10e')) else None
    elig = []
    for s in js['stocks']:
        f = flags.get(s['code'])
        if not f or f[:5] != '11111':
            continue
        fe, cap = fie(s), s.get('cap')
        pw = (fe / cap) * 100 if num(fe) and num(cap) and cap > 0 else None
        elig.append({'code': s['code'], 'g': s['g'], 'met': 1 if f[5] == '1' else 0, 'n': pk_js.get(s['code'], 0), 'pw': pw, 'fe': fe})
    def walk(xs, key):
        per, picked, held, over = {}, [], [], []
        for x in sorted(xs, key=key):
            k = per.get(x['g'], 0)
            if k >= 3:
                held.append(x['code'])
                continue
            if len(picked) >= 7:
                over.append(x['code'])
                continue
            per[x['g']] = k + 1
            picked.append(x['code'])
        return picked, held, over
    neg = lambda v: -v if v is not None else 1e9
    key3 = lambda x: (-x['met'], -x['n'], neg(x['pw']), neg(x['fe']), x['code'])
    key2 = lambda x: (-x['met'], neg(x['pw']), neg(x['fe']), x['code'])
    p3, h3, o3 = walk(elig, key3)
    js_items, js_held, js_wait = [x['code'] for x in C['items']], [x['code'] for x in C.get('held') or []], [x['code'] for x in C.get('waiting') or []]
    bad = []
    if p3 != js_items:
        bad.append(f'7곳 — 파이썬 {p3} · JS {js_items}')
    if h3 != js_held or o3 != js_wait:
        bad.append(f'뺀 곳 — 파이썬 한도 {h3} · 7곳 밖 {o3} / JS {js_held} · {js_wait}')
    for x in C['items']:
        if x['mc']['n'] != pk_js.get(x['code'], 0):
            bad.append(f"{x['name']} 횟수 — 파이썬 {pk_js.get(x['code'], 0)} · JS {x['mc']['n']}")
    print(('MATCH' if not bad else 'DIFF ') + f'  ④ 소거법 — 기준을 넘은 {len(elig)}곳 → 7곳 {len(p3)} · 같은 업종 한도 {len(h3)} · 7곳 밖 {len(o3)} · 차례 = 진입 조건 → 횟수 → 세기 → 금액 → 기호')
    bad_all += bad
    p2, _, _ = walk(elig, key2)
    secs_as_is, as_is = one_draw(Djs, by_sec, list(range(len(Djs['dates']))))
    bad = [] if as_is == p2 == mc['asIs']['rules2'] else [f'그대로 뽑기 {as_is} · 파이썬 2판 {p2} · JS 2판 {mc["asIs"]["rules2"]}']
    print(('MATCH' if not bad else 'DIFF ') + '  ⑤ 열 날을 그대로 한 번씩 뽑으면 2판 7곳과 같음')
    bad_all += bad
    # ⑥ 흔들림 검사 — 씨앗 「규칙|날짜|1」~「|4」로 네 번 더 · 7곳 · 차례가 JS 와 같은 판정인지
    alts = []
    for k in range(1, (mc.get('seeds') or {}).get('n', 4) + 1):
        pk, _, _ = monte_carlo(Djs, base, fnv1a(f"{C['rules']}|{as_of}|{k}"), draws)
        alts.append(walk([{**e, 'n': pk.get(e['code'], 0)} for e in elig], key3)[0])
    same_set = all(sorted(a) == sorted(p3) for a in alts)
    same_order = all(a == p3 for a in alts)
    moved = [c for i, c in enumerate(p3) if any(a[i] != c if i < len(a) else True for a in alts)]
    S = mc.get('seeds') or {}
    bad = [] if (same_set, same_order, moved) == (S.get('sameSet'), S.get('sameOrder'), [m['code'] for m in S.get('moved') or []]) else [f'흔들림 검사 — 파이썬 {same_set} · {same_order} · {moved} / JS {S}']
    print(('MATCH' if not bad else 'DIFF ') + f"  ⑥ 흔들림 검사(씨앗 {len(alts)}개 더) — 7곳 {'같음' if same_set else '다름'} · 차례 {'같음' if same_order else '바뀐 곳 ' + ', '.join(moved)}")
    bad_all += bad
    names = {x['code']: x['name'] for x in C['items']}
    print('       7곳:', ' · '.join(f"{i + 1} {names.get(c, c)} {pk_js.get(c, 0):,}번" for i, c in enumerate(p3)))
    report.update({'picked': p3, 'held': h3, 'over': o3, 'asIs': as_is, 'problems': bad_all, 'ok': not bad_all})
    if args.out:
        Path(args.out).write_text(json.dumps(report, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('결과:', '모두 MATCH' if not bad_all else f'DIFF {len(bad_all)}건')
    for b in bad_all[:20]:
        print('  -', b)
    return 0 if not bad_all else 1


if __name__ == '__main__':
    sys.exit(main())
