#!/usr/bin/env python3
"""ATLAS 11 · 매수 검토 후보 4판 「365곳 전체 · 돈 유입 비율 · 20만 번 다시 뽑아 소거」 따로 세기(파이썬 · 표준 라이브러리 + numpy)
  사장님 2026-10-09 10:14 「모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템」 · 11:35 「전종목 365개를 대상으로 해서 돈에 유입이 강력한 7개 …
  비율계산을 해야 한다 그러면 포모지수가 나올거야 1등부터 365등까지 … 몬테카를로 방법 20만번 소거법 20만돌」 · 11:57 「현명하게 해봐」
  lib/atlas11/cand.mjs 의 다시 뽑기 코드를 쓰지 않고 다시 센다:
    ① 1~365등 · 포모지수 — 판 읽기 종목 값(외국인+기관 10거래일 추정 ÷ 시가총액 × 100)으로 줄 세움 · 포모지수 = 그 비율의 자리(0~100) → JS rank 와 맞댐
    ② 회사 날마다 값 — 판이 쓴 관측 묶음(manifest.market.record)의 마지막 열 날 × 그날 종가(억) — 빠진 날이 있으면 다시 뽑기에 넣지 않음
    ③ 씨앗(FNV-1a · 「규칙 이름|판 날짜」) · 고른 수(mulberry32 · 32비트 정수 셈) · 20만 번 — 한 번마다 열 날을 다시 뽑아 소거법(진입 조건 먼저 · 비율 큰 순 ·
       금액 · 종목 기호 · 같은 업종 3곳 · 7곳) → 회사마다 7곳에 든 횟수 — JS 와 똑같아야(0번 차이) · numpy 로 묶어 셈(더하는 차례는 JS 와 같게)
    ④ 소거법(마지막) — 기준(판 읽기 flags 앞 넷 + 비율)을 넘은 곳을 진입 조건 → 횟수 → 비율 → 금액 → 기호로 세우고 같은 업종 3곳 · 7곳 → JS 7곳 · 뺀 곳과 맞댐
    ⑤ 흔들림 검사(씨앗 |1 · |2) · 열 날 그대로 한 번씩 뽑으면 다시 뽑기 전 차례와 같은지
  고정 사실(종가 있음 · 흑자 · 위험 공시 없음 · 진입 조건 · 시가총액)은 판 읽기(JS)의 값을 그대로 씀 — 여기서 다시 세는 것은 줄 세우기 · 다시 뽑기 · 소거법
  쓰는 법(저장소 맨 위에서): python3 -I scripts/atlas11/verify/cand_mc_verify.py [--root .] [--js 쏟은.json] [--out 결과.json]
  결과: 모두 MATCH 면 끝값 0 · DIFF 가 하나라도 있으면 끝값 1 · 앞날 말 없음(지난 열 날만 다시 뽑음 — 앞날 오를 확률이 아님)
"""
import argparse, json, math, re, subprocess, sys
from pathlib import Path
import numpy as np

ISO = re.compile(r'[0-9]{4}-[0-9]{2}-[0-9]{2}')
M32 = 0xFFFFFFFF
JS_ONE_LINER = ('import {lensFrom} from "./scripts/atlas11/lens/build.mjs"; import fs from "node:fs"; '
                'const root = process.cwd(); const l = await lensFrom(root, "kr"); '
                'const man = JSON.parse(fs.readFileSync(root + "/public/data/atlas11/view/manifest.json", "utf8")); '
                'console.log(JSON.stringify({asOf: l.asOf, cand: l.cand, stocks: l.stocks.map(s => ({code: s.code, name: s.name, g: s.g, cap: s.fund?.cap ?? null, fl: s.fl ?? null})), '
                'record: man.market?.record ?? null}))')


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def half_up(x):
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


def stock_daily(root, record, as_of):
    """② 회사 날마다 값 — 마지막 열 날 × 그날 종가(억) · 빠진 날이 있으면 None"""
    snap = json.loads((root / record).read_text(encoding='utf-8'))
    inp = json.loads((root / 'public/data/input.json').read_text(encoding='utf-8'))
    pm = {}
    for a in inp.get('assets') or []:
        m = {}
        for p in a.get('prices') or []:
            if isinstance(p, dict) and p.get('date') and num(p.get('close')) and p['close'] > 0:
                m[p['date']] = p['close']
        pm[str(a.get('code'))] = m
    flows = snap.get('flows') or []
    dates = sorted({r.get('date') for f in flows for r in (f.get('rows') or []) if r.get('date') and r.get('date') <= as_of})[-10:]
    out = {}
    for f in flows:
        rows = {r.get('date'): r for r in f.get('rows') or []}
        vals = []
        for d in dates:
            r, c = rows.get(d), pm.get(f['code'], {}).get(d)
            if r is None or not num(r.get('foreignNet')) or not num(r.get('institutionNet')) or not num(c):
                vals = None
                break
            vals.append((r['foreignNet'] + r['institutionNet']) * c / 1e8)
        out[f['code']] = vals
    return dates, out


def draws_ix(seed, draws, days):
    rnd = mulberry32(seed)
    ix = np.empty((draws, days), dtype=np.int64)
    for b in range(draws):
        for i in range(days):
            ix[b, i] = math.floor(rnd() * days)
    return ix


def monte_carlo(base, seed, draws, want=7, per_sector=3, chunk=20000):
    """③ 20만 번 — 한 번마다 소거법(진입 조건 먼저 · 비율 · 금액 · 기호 · 같은 업종 3곳 · 7곳)"""
    m, days = len(base), len(base[0]['fi'])
    D = np.array([b['fi'] for b in base], dtype=np.float64)          # (회사, 열 날)
    cap = np.array([b['cap'] for b in base], dtype=np.float64)
    met = np.array([b['met'] for b in base], dtype=np.int64)
    code_rank = np.argsort(np.argsort(np.array([b['code'] for b in base])))  # 종목 기호 차례
    grp = [b['g'] for b in base]
    IX = draws_ix(seed, draws, days)
    counts = np.zeros(m, dtype=np.int64)
    for s0 in range(0, draws, chunk):
        ix = IX[s0:s0 + chunk]
        acc = np.zeros((m, ix.shape[0]), dtype=np.float64)
        for i in range(days):                                         # 더하는 차례 = JS (0 + d[ix0] + d[ix1] + …)
            acc += D[:, ix[:, i]]
        pw = acc / cap[:, None] * 100
        for b in range(ix.shape[0]):
            fe, p = acc[:, b], pw[:, b]
            order = np.lexsort((code_rank, -fe, -p, -met))
            per, n = {}, 0
            for j in order:
                if n >= want:
                    break
                if not fe[j] > 0:
                    continue
                k = per.get(grp[j], 0)
                if k >= per_sector:
                    continue
                per[grp[j]] = k + 1
                n += 1
                counts[j] += 1
    return {base[j]['code']: int(counts[j]) for j in range(m) if counts[j] > 0}


def one_draw_identity(base, want=7, per_sector=3):
    rows = []
    for b in base:
        fe = 0.0
        for v in b['fi']:
            fe += v
        if fe > 0:
            rows.append((b, fe, fe / b['cap'] * 100))
    rows.sort(key=lambda r: (-r[0]['met'], -r[2], -r[1], r[0]['code']))
    per, out = {}, []
    for b, _, _ in rows:
        if len(out) >= want:
            break
        k = per.get(b['g'], 0)
        if k >= per_sector:
            continue
        per[b['g']] = k + 1
        out.append(b['code'])
    return out


def main():
    ap = argparse.ArgumentParser(description='매수 검토 후보 4판 — 20만 번 다시 뽑기 · 소거법 따로 세기')
    ap.add_argument('--root', default='.')
    ap.add_argument('--js', help='node 한 줄로 쏟은 판 읽기(JSON) — 빼면 스스로 돌림')
    ap.add_argument('--out', help='결과를 JSON 으로 남길 곳')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if args.js:
        js = json.loads(Path(args.js).read_text(encoding='utf-8'))
    else:
        js = json.loads(subprocess.run(['node', '--input-type=module', '-e', JS_ONE_LINER], cwd=root, capture_output=True, text=True, check=True).stdout)
    C, as_of = js['cand'], js['asOf']
    if not C.get('ready'):
        print('DIFF  후보를 고르지 않은 판 —', C.get('why'))
        return 1
    mc, flags, bad_all = C['mc'], C['flags'], []
    board = json.loads((root / 'public/data/atlas11/view/board.json').read_text(encoding='utf-8'))
    group_of = {c: g['id'] for g in board.get('groups') or [] for c in g.get('codes') or []}
    st = {s['code']: s for s in js['stocks']}

    # ① 1~365등 · 포모지수
    def ratio(s):
        fl, cap = s.get('fl') or {}, s.get('cap')
        if not (num(fl.get('f10e')) and num(fl.get('i10e')) and num(cap) and cap > 0):
            return None, None
        fe = (fl['f10e'] + fl['i10e']) / 1e8
        return fe, (fe / cap) * 100
    rows = []
    for s in js['stocks']:
        fe, p = ratio(s)
        rows.append({'code': s['code'], 'fe': fe, 'p': p})
    has = [r for r in rows if r['p'] is not None]
    no = [r for r in rows if r['p'] is None]
    has.sort(key=lambda r: (-r['p'], -r['fe'], r['code']))
    no.sort(key=lambda r: r['code'])
    ps = [r['p'] for r in has]
    def idx(v):
        n = len(ps)
        lo = sum(1 for x in ps if x < v)
        eq = sum(1 for x in ps if x == v)
        return 100 if n == 1 else half_up(100 * (lo + 0.5 * (eq - 1)) / (n - 1))
    py_rank = [(r['code'], i + 1, idx(r['p'])) for i, r in enumerate(has)] + [(r['code'], None, None) for r in no]
    js_rank = [(x['c'], x['r'], x['x']) for x in C['rank']]
    bad = [] if py_rank == js_rank else [f'1~365등 · 포모지수 다름 — 첫 다름 {next((a, b) for a, b in zip(py_rank, js_rank) if a != b)}']
    print(('MATCH' if not bad else 'DIFF ') + f'  ① 1~{len(js_rank)}등 · 포모지수 — 비율을 셀 수 있는 곳 {len(has)} · 모자란 곳 {len(no)}(맨 뒤)')
    bad_all += bad

    # ② 회사 날마다 값 · 다시 뽑기에 든 회사
    dates, sd = stock_daily(root, js['record'], as_of)
    bad = [] if dates == mc['days'] else [f'날짜 {dates} ≠ JS {mc["days"]}']
    base = []
    for code, met in mc['entrants']:
        vals, cap = sd.get(code), (st.get(code) or {}).get('cap')
        if vals is None or not num(cap) or code not in group_of:
            bad.append(f'{code} — 다시 뽑기 회사인데 날마다 값 · 시가총액 · 업종이 없음')
            continue
        base.append({'code': code, 'g': group_of[code], 'cap': cap, 'met': met, 'fi': vals})
    print(('MATCH' if not bad and len(base) == mc['base'] else 'DIFF ') + f'  ② 회사 날마다 값 · 다시 뽑기에 든 회사 {len(base)}곳(JS {mc["base"]}곳)')
    bad_all += bad + ([] if len(base) == mc['base'] else ['다시 뽑기 회사 수 다름'])

    # ③ 씨앗 · 20만 번
    seed = fnv1a(f"{C['rules']}|{as_of}")
    counts = monte_carlo(base, seed, mc['draws'])
    bad = ([] if seed == mc['seed'] else [f'씨앗 — 파이썬 {seed} · JS {mc["seed"]}'])
    for k in sorted(set(counts) | set(mc['counts'])):
        if counts.get(k, 0) != mc['counts'].get(k, 0):
            bad.append(f'횟수 {k} — 파이썬 {counts.get(k, 0)} · JS {mc["counts"].get(k, 0)}')
    print(('MATCH' if not bad else 'DIFF ') + f"  ③ 씨앗 {seed} · {mc['draws']:,}번 — 회사 {len(counts)}곳 횟수가 JS 와 {'똑같음' if not bad else f'{len(bad)}곳 다름'}")
    bad_all += bad

    # ④ 소거법 · ⑤ 흔들림 · 그대로 뽑기
    elig = []
    for s in js['stocks']:
        f = flags.get(s['code'])
        fe, p = ratio(s)
        if not f or f[:4] != '1111' or p is None:
            continue
        elig.append({'code': s['code'], 'g': s.get('g'), 'met': 1 if f[4] == '1' else 0, 'p': p, 'fe': fe})
    def walk(cnt):
        per, picked, held, over = {}, [], [], []
        for x in sorted(elig, key=lambda x: (-x['met'], -cnt.get(x['code'], 0), -x['p'], -x['fe'], x['code'])):
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
    p4, h4, o4 = walk(counts)
    js_items, js_held = [x['code'] for x in C['items']], [x['code'] for x in C.get('held') or []]
    bad = [] if (p4 == js_items and h4 == js_held) else [f'7곳 — 파이썬 {p4} · 한도 {h4} / JS {js_items} · {js_held}']
    print(('MATCH' if not bad else 'DIFF ') + f'  ④ 소거법 — 기준을 넘은 {len(elig)}곳 → 7곳 · 같은 업종 한도 {len(h4)} · 7곳 밖 {len(o4)}')
    bad_all += bad
    alts = [walk(monte_carlo(base, fnv1a(f"{C['rules']}|{as_of}|{k}"), mc['draws']))[0] for k in range(1, mc['seeds']['n'] + 1)]
    same_set = all(sorted(a) == sorted(p4) for a in alts)
    same_order = all(a == p4 for a in alts)
    moved = [c for i, c in enumerate(p4) if any(i >= len(a) or a[i] != c for a in alts)]
    S = mc['seeds']
    bad = [] if (same_set, same_order, moved) == (S['sameSet'], S['sameOrder'], [m['code'] for m in S['moved']]) else [f'흔들림 — 파이썬 {same_set} {same_order} {moved} / JS {S}']
    print(('MATCH' if not bad else 'DIFF ') + f"  ⑤ 흔들림 검사(씨앗 {len(alts)}개 더) — 7곳 {'같음' if same_set else '다름'} · 차례 {'같음' if same_order else '바뀐 곳 ' + ', '.join(moved)}")
    bad_all += bad
    ident = one_draw_identity(base)
    per, plain = {}, []
    for x in sorted(elig, key=lambda x: (-x['met'], -x['p'], -x['fe'], x['code'])):
        if len(plain) >= 7:
            break
        k = per.get(x['g'], 0)
        if k >= 3:
            continue
        per[x['g']] = k + 1
        plain.append(x['code'])
    bad = [] if ident == plain == mc['asIs']['plain'] else [f'그대로 뽑기 {ident} · 파이썬 차례 {plain} · JS {mc["asIs"]["plain"]}']
    print(('MATCH' if not bad else 'DIFF ') + '  ⑤ 열 날을 그대로 한 번씩 뽑으면 다시 뽑기 전 차례와 같음')
    bad_all += bad
    names = {x['code']: x['name'] for x in C['items']}
    print('       7곳:', ' · '.join(f"{i + 1} {names.get(c, c)} {counts.get(c, 0):,}번" for i, c in enumerate(p4)))
    report = {'asOf': as_of, 'rules': C['rules'], 'draws': mc['draws'], 'seed': seed, 'picked': p4, 'held': h4, 'counts': counts, 'seeds': {'sameSet': same_set, 'sameOrder': same_order, 'moved': moved},
              'rankTop10': py_rank[:10], 'problems': bad_all, 'ok': not bad_all}
    if args.out:
        Path(args.out).write_text(json.dumps(report, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('결과:', '모두 MATCH' if not bad_all else f'DIFF {len(bad_all)}건')
    for b in bad_all[:20]:
        print('  -', b)
    return 0 if not bad_all else 1


if __name__ == '__main__':
    sys.exit(main())
