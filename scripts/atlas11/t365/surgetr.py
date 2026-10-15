#!/usr/bin/env python3
"""새 ATLAS 「달력」 탭 — 뽑힌 종목을 끝까지 따라가기(tr-v1) · 발견(날짜별 선택) + 끈질긴 추적(종목 하나 = 파일 하나 · 60거래일)
사장님 2026-10-15(싱가포르) 19:28 「달력 턉을 만들어서 그곳에서 10에서 40프로에 종목들을 한눈에 보고 관리하고 판단할수 있는 지혜로운 구조에 달력이 필요해
어떻게 하면 될지 애이전트들은 깊음 토론 한뒤 달력 탭을 만들어라」 · 19:36 「가 로 해라」(아래 탭 다섯째) · 20:00 「어떤 종목이 어떻게 됐는지 알수 있어야 해」 ·
20:04 「달력에 종목이름 등락률 나와야 해」 · 20:10 「백지 상태에서 더시 기획해」 · 20:51 「발견만 하는게 아니라 추적하는 시스탬 까지 … cia처런 끈질기게」 ·
20:57 「너 구글이면 어떻게 만들겠어 … 전셰계 똑똑한 집단 100군데 모아 그리고 만들어내」 · 21:24 「가 로 해」(지난 한 달도 되짚어 추적 파일을 엶) — 규칙 70
  → 세계 100곳 조사(R01 ~ R10) · 추적 일꾼 다섯(경보 · 사건 파일 · 레드 셀 · 보고 · 화면) 따로 → 결정표 v1 → 반대만 받는 토론 한 판 → 결정표 v2 → (가) → v3
    (docs/design/surge-2026-10-15/cal-merge-v3.md — 이 파일의 셈은 그 1 ~ 9절 그대로 · 따로 세기 surgetr_verify.mjs 는 이 파일을 열지 않고 결정표만 보고 씀)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
명단      날마다 네 칸(sb-v1 · 10%대 · 20%대 · 30%대 · 40% 넘게 · 칸마다 36곳) 명단 M(t) — 기록 날 = 그날 올라간 고르기 기록들을 합침 ·
          씨앗 날(사장님 (가) · 2026-09-15 ~ 2026-10-14 가운데 기록이 없는 날) = 그날 종가로 surge.py 네 칸 셈을 다시 함(「되짚음」)
파일      c 가 M(t) 에 있고 앞 명단(명단 있는 앞날 · 첫 씨앗 날은 그 앞 거래일 종가 셈)에 없고 열린 파일이 없으면 엶 — d0 · 뽑힌 칸 b0 · r5 · 기록 때
          · 60거래일 지나면 닫음(공개에서 내림 · 다시 들면 새 파일)
값        기준 = d0 종가 · % = (그날 값 ÷ 기준 − 1) × 100 · 소수 첫째(0.05 는 0 에서 먼 쪽) · 지금 % = 마지막 날 값(장 중이면 장 중 값)
제 칸     끝난 날마다 그 회사 제 5일 오름으로 '?'(셀 수 없음) · 'x'(10% 밑 · 거래 적음) · '1' ~ '4' — 36자리 다툼은 안 봄(밀린 것은 탈락 아님)
사건      이동(칸 바뀜) · 탈락(칸 → x) · 다시 선택(x → 칸) · 조심(투자경고 오름 기준 · 25일 안 처음) — 끝난 날만
금빛      반 토막(뽑힌 뒤 꼭대기 종가의 반 밑) · 거래 멈춤(그날 거래량 0) — 끝난 종가로 · 마지막 끝난 날에 새로 생긴 것만 첫 화면 줄 · 하루 35% 넘게 바뀐 날이 끼면 「!」 대신 「?」
답        「10곳 중 n곳이 뽑힌 날보다 올라 있어요」 + 같은 날들 모든 회사 「10곳 중 m곳이 올랐어요」(같은 단위 · 판정 말 없음)
뺀 것     지난 기록 시험(n번 중 m번) · 앞날 말 · 사라 · 팔라 · 「만」(규칙 49 · 55)

쓰는 법(저장소 맨 위에서 · site_build.py 가 같은 자료 폴더에 mkt.json 을 만든 뒤):
  python3 scripts/atlas11/t365/surgetr.py <now.json(dump.mjs)> <자료 폴더> --records <{"records": [...]} | -> [--at <ISO 때>] [--slot <10:00 …| ''>] [--no-seed]
  --records - = reports/atlas11/t365/surge/ 의 올라간 고르기(sb-v1) 모두 · 환경 변수 ATLAS_T365_CLOSES = 이어 받은 일봉 폴더(surge.py 와 같음)
만드는 것: <자료 폴더>/surgetr.json(첫 화면) · surgetr-case.json(종목 파일 · 누를 때) · 마지막 줄 = 요약 json
"""
import json, math, os, sys
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import surge  # noqa: E402

VERSION = 'tr-v1'
SCHEMA = 'atlas-new-surgetr-1'
SEED = {'from': '2026-09-15', 'to': '2026-10-14'}  # 사장님 21:24 (가) 「지난 한 달도 되짚어 추적 파일을 열어요」 — 첫 기록(10월 15일) 앞 한 달
OPEN_DAYS = 60
WARN_DAYS = 25
LET = {'b10': '1', 'b20': '2', 'b30': '3', 'b40': '4'}
MAX_MAIN, MAX_CASE = 150000, 400000
SURGE_DIR = os.path.join(ROOT, 'reports', 'atlas11', 't365', 'surge')
KST = timezone(timedelta(hours=9))


def die(m):
    sys.exit('surgetr: ' + m)


def rq(x, q):
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return None
    v = float(Decimal(repr(float(x))).quantize(Decimal(q), rounding=ROUND_HALF_UP))
    return 0.0 if v == 0 else v


def r1(x):
    return rq(x, '0.1')


def r2(x):
    return rq(x, '0.01')


def band_of(r):
    for b, lo, hi in surge.BANDS:
        if r >= lo and (hi is None or r < hi):
            return b
    return None


def close_members(day, allc):
    """씨앗 날 명단 — surge.py 네 칸 lists 와 같은 셈(차례 E 를 훑어 칸마다 앞 36곳)"""
    lists = {b: [] for b, _, _ in surge.BANDS}
    for j in day.E:
        j = int(j)
        bb = band_of(float(day.ratio[j]))
        if bb is not None and len(lists[bb]) < surge.CFG['cap']:
            lists[bb].append(j)
    out = {}
    for b, _, _ in surge.BANDS:
        for j in lists[b]:
            c = allc[j]
            if c not in out:
                out[c] = {'b': b, 'r5': r2((float(day.ratio[j]) - 1) * 100), 'kst': None, 're': True, 'n': None}
    return out


def record_members(recs):
    """기록 날 명단 — 그날 기록들을 이름 차례로 · 칸 b10 → b40 차례로 · 처음 나온 것"""
    out = {}
    for r in recs:
        bands = r.get('bands') or {}
        for b, _, _ in surge.BANDS:
            for m in (bands.get(b) or {}).get('members') or []:
                c = m.get('c')
                if c and c not in out:
                    out[c] = {'b': b, 'r5': m.get('r5'), 'kst': r.get('kst'), 're': False, 'n': m.get('n')}
    return out


def read_records(path):
    if path and path != '-':
        doc = json.load(open(path, encoding='utf-8'))
        return list(doc.get('records') or [])
    out = []
    if os.path.isdir(SURGE_DIR):
        for f in sorted(os.listdir(SURGE_DIR)):
            if not (len(f) == 21 and f.endswith('Z.json')):
                continue
            try:
                o = json.load(open(os.path.join(SURGE_DIR, f), encoding='utf-8'))
            except Exception:
                continue
            P = o.get('payload') or {}
            if P.get('schema') == 'atlas-new-surge-1' and (P.get('bands') or {}).get('version') == 'sb-v1':
                out.append({'asOf': P.get('asOf'), 'provisional': P.get('provisional'), 'kst': P.get('kst'), 'slot': P.get('slot'), 'bands': P['bands']})
    return out


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        die('쓰는 법: surgetr.py <now.json> <자료 폴더> --records <파일|-> [--at ISO] [--slot 10:00] [--no-seed]')
    now_path, out = a[0], a[1]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a and a.index(k) + 1 < len(a) else d
    at = opt('--at') or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    slot = opt('--slot') or None
    seed = None if '--no-seed' in a else SEED
    records = [r for r in read_records(opt('--records', '-')) if ((r.get('bands') or {}).get('version') in (None, 'sb-v1'))]
    allc, D, C, V, day, over, rowmap = surge.load(now_path, os.environ.get('ATLAS_T365_CLOSES'))
    prov, _got = surge.provisional_of(over, day)
    nD, nC = C.shape
    cnt = np.cumsum(~np.isnan(C), axis=0)
    jof = {c: j for j, c in enumerate(allc)}
    idx = {d: k for k, d in enumerate(D)}
    L = nD - 1
    Ld = L - 1 if prov else L
    mkt = json.load(open(os.path.join(out, 'mkt.json'), encoding='utf-8'))
    MK = mkt.get('companies') or {}
    # ── 명단 있는 날 ──
    rec_days = {}
    for r in records:
        if r.get('asOf') in idx:
            rec_days.setdefault(r['asOf'], []).append(r)
    seed_days = [d for d in D if seed and seed['from'] <= d <= seed['to'] and d not in rec_days]
    mdays = sorted(set(seed_days) | set(rec_days))
    days_cache = {}

    def dayk(k):
        if k not in days_cache:
            days_cache[k] = surge.Day(C, V, cnt, k)
        return days_cache[k]
    rec_name = {}
    M = {}
    for d in mdays:
        if d in rec_days:
            M[d] = record_members(rec_days[d])
            for c, m in M[d].items():
                if m.get('n'):
                    rec_name.setdefault(c, m['n'])
        else:
            M[d] = close_members(dayk(idx[d]), allc)
    prevM = {}
    if seed_days and mdays and mdays[0] == seed_days[0] and idx[seed_days[0]] >= 1:
        prevM = close_members(dayk(idx[seed_days[0]] - 1), allc)  # 첫 씨앗 날의 앞 거래일 — 「앞 명단」으로만(그날 파일은 열지 않음)
    files = {}
    for d in mdays:
        for c in sorted(M[d]):
            m = M[d][c]
            f = files.get(c)
            is_open = f is not None and idx[d] - idx[f['d0']] <= OPEN_DAYS
            if c not in prevM and not is_open:
                files[c] = {'c': c, 'd0': d, 'b0': m['b'], 'r5': m['r5'], 'kst': m['kst'], 're': m['re']}
        prevM = M[d]
    pub = [f for f in files.values() if Ld - idx[f['d0']] <= OPEN_DAYS] if Ld >= 0 else []
    name_of = lambda c: (MK.get(c) or {}).get('n') or rec_name.get(c) or c

    def qstate(k, j):
        dy = dayk(k)
        if j is None or not bool(dy.clean[j]):
            return '?'
        if not bool(dy.liquid[j]):
            return 'x'
        bb = band_of(float(dy.ratio[j]))
        return LET[bb] if bb else 'x'
    nanv = lambda x: x is None or (isinstance(x, float) and math.isnan(x))
    cases_main, cases_case = [], {}
    alerts_half, alerts_halt = [], []
    mkcache = {}
    for f in pub:
        c, d0 = f['c'], f['d0']
        j = jof.get(c)
        k0 = idx[d0]
        B = float(C[k0, j]) if j is not None else float('nan')
        p = []
        for k in range(k0, L + 1):
            if j is None or math.isnan(B) or math.isnan(C[k, j]):
                p.append(None)
            else:
                p.append(r1((float(C[k, j]) / B - 1) * 100))
        if p and p[0] is not None:
            p[0] = 0.0
        q = ''.join(qstate(k, j) for k in range(k0, Ld + 1)) if k0 <= Ld else ''
        ev = []
        if q:
            if q[0] == 'x':
                ev.append([d0, 'out', None])
        warn_done = False
        for i in range(1, len(q)):
            k = k0 + i
            if q[i] != '?':
                pv = next((q[t] for t in range(i - 1, -1, -1) if q[t] != '?'), None)
                if pv is not None:
                    if pv != 'x' and q[i] != 'x' and pv != q[i]:
                        ev.append([D[k], 'mv', q[i]])
                    elif pv != 'x' and q[i] == 'x':
                        ev.append([D[k], 'out', None])
                    elif pv == 'x' and q[i] != 'x':
                        ev.append([D[k], 're', q[i]])
            if not warn_done and i <= WARN_DAYS and j is not None and k - 15 >= 0:
                ct = C[k, j]
                seg = C[k - 14:k + 1, j]
                if not math.isnan(ct) and not np.isnan(seg).any() and ct >= seg.max():
                    c5, c15 = C[k - 5, j], C[k - 15, j]
                    if (not math.isnan(c5) and ct * 10 >= c5 * 16) or (not math.isnan(c15) and ct >= c15 * 2):
                        ev.append([D[k], 'warn', None])
                        warn_done = True
        z = [i for i, k in enumerate(range(k0, L + 1)) if j is not None and not math.isnan(V[k, j]) and V[k, j] == 0]
        # 상태 · 금빛(끝난 종가로만)
        h = fl = x = 0
        new_half = new_halt = False
        if j is not None and k0 < Ld:
            top = -math.inf
            half_any_before = False
            halfs = []
            for k in range(k0, Ld + 1):
                ck = C[k, j]
                if not math.isnan(ck):
                    top = max(top, float(ck))
                hv = (not math.isnan(ck)) and float(ck) * 2 <= top
                halfs.append(hv)
            half_now = halfs[-1]
            half_any_before = any(halfs[1:-1])  # d0+1 … Ld−1
            jumpy = False
            for k in range(k0 + 1, Ld + 1):
                a_, b_ = C[k - 1, j], C[k, j]
                if not math.isnan(a_) and not math.isnan(b_) and abs(float(b_) - float(a_)) * 100 > float(a_) * 35:
                    jumpy = True
                    break
            halt_now = (not math.isnan(C[Ld, j])) and (not math.isnan(V[Ld, j])) and V[Ld, j] == 0
            halt_prev = (not math.isnan(C[Ld - 1, j])) and (not math.isnan(V[Ld - 1, j])) and V[Ld - 1, j] == 0
            fl = (2 if jumpy else 1) if half_now else 0
            h = 1 if halt_now else 0
            x = 1 if q and q[-1] == 'x' else 0
            new_half = half_now and not half_any_before
            new_halt = halt_now and (Ld == k0 + 1 or not halt_prev)
        v = None if k0 == L else p[-1]
        st = 'n' if k0 == L else ('q' if v is None else 'u' if v > 0 else 'd' if v < 0 else 'z')
        if st == 'n':
            h = fl = x = 0
            new_half = new_halt = False
        mk = None
        if k0 != L:
            if k0 not in mkcache:
                a0, a1 = C[k0], C[L]
                ok = ~np.isnan(a0) & ~np.isnan(a1)
                ch = sorted(((a1[ok] / a0[ok] - 1) * 100).tolist())
                med = None
                if ch:
                    n_ = len(ch)
                    med = r1(ch[n_ // 2] if n_ % 2 else (ch[n_ // 2 - 1] + ch[n_ // 2]) / 2)
                mkcache[k0] = med
            mk = mkcache[k0]
        row = [c, name_of(c), d0, LET[f['b0']], f['r5'], v, st, h, fl, x, 1 if f['re'] else 0, f['kst']]
        cases_main.append(row)
        cases_case[c] = {'p': p, 'q': q, 'z': z, 'ev': ev, 'mk': mk}
        if new_halt:
            alerts_halt.append(row)
        elif new_half:
            alerts_half.append(row)
    cases_main.sort(key=lambda r: (r[0], ))
    cases_main.sort(key=lambda r: -(r[4] if r[4] is not None else -1e18))
    cases_main.sort(key=lambda r: r[3], reverse=True)
    cases_main.sort(key=lambda r: r[2], reverse=True)
    # 답 한 줄 · 같은 날들 모든 회사
    N = sum(1 for r in cases_main if r[6] != 'n')
    A = sum(1 for r in cases_main if r[6] == 'u')
    Bd = sum(1 for r in cases_main if r[6] == 'd')
    K = sum(1 for r in cases_main if r[6] == 'n')
    n10 = (20 * A + N) // (2 * N) if N else None
    U = T = 0
    upcache = {}
    for r in cases_main:
        if r[6] == 'n':
            continue
        k0 = idx[r[2]]
        if k0 not in upcache:
            a0, a1 = C[k0], C[L]
            ok = ~np.isnan(a0) & ~np.isnan(a1)
            upcache[k0] = (int((a1[ok] > a0[ok]).sum()), int(ok.sum()))
        u_, s_ = upcache[k0]
        U += u_
        T += s_
    m10 = (20 * U + T) // (2 * T) if T else None

    def alert(kind, rows):
        if not rows:
            return None
        srt = sorted(rows, key=lambda r: ((r[5] if r[5] is not None else 1e18), r[0]))
        t = srt[0]
        o = {'kind': kind, 'n': len(rows), 'top': {'c': t[0], 'n': t[1], 'v': t[5]}}
        if kind == 'half':
            o['f'] = t[8]
        o['cs'] = [r[0] for r in srt]  # 그 줄 종목 모두(v 작은 → 번호) — 화면 「새로 생긴 일」 접은 칸
        return o
    alerts = [x_ for x_ in (alert('halt', alerts_halt), alert('half', alerts_half)) if x_]
    # 날짜별 묶음
    start = (seed_days[0] if seed_days else (mdays[0] if mdays else D[L]))
    dates = D[idx[start]:L + 1]
    order = {r[0]: i for i, r in enumerate(cases_main)}
    days = []
    sset = set(seed_days)
    for d in reversed(dates):
        sel = [r[0] for r in cases_main if r[2] == d]
        mv, outs, res = [], [], []
        for c in sorted(cases_case):
            for e in cases_case[c]['ev']:
                if e[0] != d:
                    continue
                if e[1] == 'mv':
                    mv.append([c, e[2]])
                elif e[1] == 'out':
                    outs.append(c)
                elif e[1] == 're':
                    res.append([c, e[2]])
        days.append({'d': d, 'seed': d in sset, 'sel': sel, 'mv': mv, 'out': outs, 're': res})
    kst = datetime.fromisoformat(at.replace('Z', '+00:00')).astimezone(KST).strftime('%Y-%m-%d %H:%M')
    first = min(rec_days) if rec_days else None
    MAIN = {'schema': SCHEMA, 'version': VERSION, 'asOf': D[L], 'last': D[Ld] if Ld >= 0 else None, 'provisional': bool(prov), 'kst': kst, 'slot': slot,
            'seed': {'from': seed['from'], 'to': seed['to']} if seed and any(seed['from'] <= d <= seed['to'] for d in D) else None, 'first': first, 'dates': list(dates),
            'N': N, 'a': A, 'b': Bd, 'k': K, 'n10': n10, 'm10': m10, 'U': U, 'T': T, 'alerts': alerts, 'days': days, 'cases': cases_main}
    CASE = {'asOf': D[L], 'cases': {r[0]: cases_case[r[0]] for r in cases_main}}
    sm = json.dumps(MAIN, ensure_ascii=False, separators=(',', ':'))
    sc = json.dumps(CASE, ensure_ascii=False, separators=(',', ':'))
    if len(sm.encode('utf-8')) > MAX_MAIN or len(sc.encode('utf-8')) > MAX_CASE:
        die('공개 파일이 너무 큼(첫 화면 %d · 종목 파일 %d 바이트 — 문 %d · %d)' % (len(sm.encode('utf-8')), len(sc.encode('utf-8')), MAX_MAIN, MAX_CASE))
    with open(os.path.join(out, 'surgetr.json'), 'w', encoding='utf-8') as fo:
        fo.write(sm + '\n')
    with open(os.path.join(out, 'surgetr-case.json'), 'w', encoding='utf-8') as fo:
        fo.write(sc + '\n')
    print(json.dumps({'asOf': D[L], 'last': MAIN['last'], 'provisional': bool(prov), 'seedDays': len(seed_days), 'recDays': len(rec_days), 'files': len(files), 'public': len(cases_main),
                      'N': N, 'a': A, 'b': Bd, 'k': K, 'n10': n10, 'm10': m10, 'alerts': [[x_['kind'], x_['n']] for x_ in alerts], 'bytes': [len(sm.encode('utf-8')), len(sc.encode('utf-8'))]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
