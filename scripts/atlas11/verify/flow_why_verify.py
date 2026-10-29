#!/usr/bin/env python3
"""둘이 · 「돈 흐름 칸 · 까닭 열한 가지」 따로 세기(파이썬 · 표준 라이브러리만)
  flow_why.mjs 코드는 보지 않고 결정표 글과 원자료만 보고 처음부터 다시 센다 — 그래서 JS 셈에 잘못이 있으면 여기서 어긋난다
  결정표: docs/design/why11-2026-10-30/decision.md 의 0 · 1 · 2 · 2-1 · 4
          지수 셈: docs/design/theme-2026-10-19/theme-engine.md 의 「들어오는 자료」 · 「1. 지수」
  읽는 것(읽기만):
    <site>/atlas/data/days.json(dates) · mkt.json(companies[번호] = {n 이름, i 업종}) · co/<번호>.json(close · k0)
    <site>/next/data/theme-home.json(asOf · inds[] = {n, x})
    <view>/board.json(asOf · companies[]) · <view>/stocks/<번호>.json(context.flows · context.news · closes60)
    <view>/agenda.json(byCode[번호].disclosures — 없으면 좋은 소식은 「모름」)
    맞대는 파일: <site>/next/data/flow-why.json
  다시 세는 것:
    ① 몰린 곳 셋 = theme-home 에서 x > 0 인 업종을 x 큰 차례로 셋(같으면 파일 차례) · 이름 · 차례 · x 가 같아야
    ② 날짜 = 날짜 줄 마지막 날 T · from = T − 20 번째 날 · theme-home 날짜도 T
    ③ 같은 무게 지수 = 회사 하루 변화(두 날 종가가 다 있을 때만 · 0.35 넘게 튀면 그날 그 회사 뺌)의 평균을 날마다 이어 곱함
       시장 m · 업종 i(% 두 자리) · 다시 센 x 와 막대 x 차이 0.011 안 · 업종 회사 5곳 이상(어긋나면 파일이 없어야 맞음 — 결정표 2 · 7 · 2026-10-30 글 바로잡음)
    ④ 대표 수 · 돈 셋(외국인 · 기관 · 개인 — 대표마다 마지막 다섯 날 · 주식 수 × 그날 종가 · 억 원 반올림 · 날 수 · 처음 날 · 끝 날 · 적는 대표)
    ⑤ 좋은 소식 공시 · 대장 회사 · 같이 오른 수 · 정부 정책 기사 · 나라 사이 기사 · 불빛 열하나(items 의 s 도) · 머리 글
  반올림 = JS Math.round 와 같음(.5 는 위로 · 파이썬 round 는 짝수 쪽이라 쓰지 않음)
  % 두 자리는 다시 센 값(셈 그대로)을 두 자리로 반올림한 값이어야 맞음 — 꼭 .5 에 걸린 값만 위 · 아래 둘 다 받음
  쓰는 법(저장소 맨 위에서):
    python3 -I scripts/atlas11/verify/flow_why_verify.py [--site site] [--view public/data/atlas11/view] [--file <site>/next/data/flow-why.json] [--quiet]
  결과: 모두 맞으면 끝값 0 과 한 줄(--quiet 면 아무것도 안 찍음)
        · 다른 칸이 있으면 칸마다 「다시 센 값 · 파일 값」을 찍고 끝값 1 · 입력 파일이 없거나 못 읽으면 끝값 2
        · 앞날 말 없음(지난 기록만 셈)
"""
import argparse, json, math, os, re, sys
from pathlib import Path

WIN = 20     # 창(한 달) = 20 거래일 — 테마와 같음
JUMP = 0.35  # 하루 변화 |r| 가 이 값 이상이면 그날 그 회사는 뺌(나눔 · 합침 같은 일)
MONEY = {'1': 'foreignNet', '2': 'institutionNet', '3': 'individualNet'}
# 4 좋은 소식 — 앞 차례에서 처음 맞은 종류 하나 · 말 사이 띄어쓰기는 있어도 없어도 맞음
KINDS = [('공급계약', re.compile(r'공급계약\s*체결')),
         ('배당', re.compile(r'배당\s*결정')),
         ('자사주 사기', re.compile(r'자기주식\s*취득')),
         ('주식 소각', re.compile(r'주식\s*소각\s*결정')),
         ('무상증자', re.compile(r'무상증자\s*결정')),
         ('가치 높이기 계획', re.compile(r'기업가치\s*제고\s*계획'))]
DROP = ('해지', '정정', '철회', '취소')
# 10 · 11 정한 말 — 적는 말은 이 차례에서 처음 맞은 말
POL = ['정부', '국회', '법안', '예산', '규제', '보조금', '세법', '장관', '총리', '국토부', '산업부', '기재부', '금융위',
       '공정위', '대통령실', '특별법', '시행령']
ABR = ['관세', '공습', '미사일', '휴전', '제재', '무역', '협정', '트럼프', '시진핑', '푸틴', '중동', '이란', '이스라엘',
       '우크라이나', '러시아', '북한', '미중']
EDGE = ('이란', '중동')  # 앞뒤 글자가 한글(가 ~ 힣)이 아닐 때만 맞음


class InputError(Exception):
    pass


def load(path, need=True):
    try:
        return json.loads(Path(path).read_text(encoding='utf-8'))
    except FileNotFoundError:
        if need:
            raise InputError(f'파일 없음 — {path}')
        return None
    except (OSError, ValueError) as e:
        raise InputError(f'못 읽음 — {path} ({e})')


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def pos(x):
    return num(x) and x > 0


def js_round(x):
    """JS Math.round — 가장 가까운 정수 · 꼭 가운데면 위(+ 쪽)로"""
    f = math.floor(x)
    return f + 1 if x - f >= 0.5 else f


def pct2(raw):
    """셈 그대로의 비율(0.1234) → % 두 자리(12.34)"""
    return js_round(raw * 10000) / 100


# ---------- ③ 같은 무게 지수(theme-engine 「1. 지수」) ----------

def closes_of(co, n, path):
    """co 파일 → 날짜 줄 길이 n 의 종가 줄 · close[j] = 날짜 D[j + k0] 의 종가 · 0 · 빈 값 = 없음(None)"""
    k0, cl = (co.get('k0'), co.get('close')) if isinstance(co, dict) else (None, None)
    if not (isinstance(k0, int) and not isinstance(k0, bool)) or not isinstance(cl, list):
        raise InputError(f'co 파일 꼴이 다름(k0 · close) — {path}')
    out = [None] * n
    for j, v in enumerate(cl):
        t = j + k0
        if 0 <= t < n and pos(v):
            out[t] = v
    return out


def daily_of(cl, T):
    """하루 변화 r[t](t = 1 … T) — 두 날 종가가 다 있을 때만 · |r| ≥ 0.35 면 그날은 빼고(None) 튄 날로 적음"""
    r, jumps = [None] * (T + 1), set()
    for t in range(1, T + 1):
        a, b = cl[t - 1], cl[t]
        if a is None or b is None:
            continue
        v = b / a - 1
        if abs(v) >= JUMP:
            jumps.add(t)
        else:
            r[t] = v
    return r, jumps


def index_of(rs, T):
    """I(0) = 100 · I(t) = I(t − 1) × (1 + 그날 r 이 있는 회사들의 r 평균) · 하나도 없으면 평균 0"""
    I = [100.0]
    for t in range(1, T + 1):
        vals = [r[t] for r in rs if r[t] is not None]
        I.append(I[-1] * (1 + (math.fsum(vals) / len(vals) if vals else 0.0)))
    return I


# ---------- 5 · 6 대장 회사 · 같이 오른 수 ----------

def lead_breadth(members, F, T):
    """업종 회사 가운데 T · T − 20 종가가 다 있고 창 안(F < t ≤ T)에 튄 날이 없는 회사의 한 달 변화"""
    rows = []
    for code, cl, jumps in members:
        a, b = cl[F], cl[T]
        if a is None or b is None or any(F < t <= T for t in jumps):
            continue
        rows.append((code, b / a - 1))
    if not rows:
        return None, {'up': 0, 'tot': 0}
    best = min(rows, key=lambda r: (-r[1], r[0]))  # 가장 큰 변화 · 같으면 번호 작은 곳
    return best, {'up': sum(1 for _, v in rows if v > 0), 'tot': len(rows)}


# ---------- 1 · 2 · 3 돈 ----------

def money_of(reps, field, frm, as_of):
    """대표마다 창 안 · 값이 숫자인 날 가운데 날짜 차례로 마지막 다섯 날 · 주식 수 × 그날 종가(closes60 · 없으면 보드 종가 · 둘 다 없으면 그날 뺌)"""
    used, cand, total = set(), [], 0
    for rep in reps:  # 번호 작은 차례
        flows = rep['flows']
        if not isinstance(flows, list):
            continue
        rows = [(f['date'], f[field]) for f in flows
                if isinstance(f, dict) and isinstance(f.get('date'), str) and frm < f['date'] <= as_of and num(f.get(field))]
        if not rows:
            continue
        rows.sort(key=lambda r: r[0])
        won = 0
        for d, v in rows[-5:]:
            px = rep['c60'].get(d, rep['close'])
            if px is None:
                continue
            won += v * px
            used.add(d)
        cand.append((rep['name'], won))  # 종가가 없어 원 합 0 이어도 후보
        total += won
    if not used:
        return None
    eok = js_round(total / 1e8)
    top = (max if eok > 0 else min)(cand, key=lambda r: r[1])  # 같으면 앞 차례(max · min 은 처음 것을 돌려줌)
    return {'eok': eok, 'days': len(used), 'from': min(used), 'to': max(used), 'top': top[0], 'topEok': js_round(top[1] / 1e8)}


# ---------- 4 좋은 소식 ----------

def good_of(reps, agenda, frm, as_of):
    by = agenda.get('byCode') if isinstance(agenda, dict) else None
    if not reps or not isinstance(by, dict):
        return None
    any_list, newest = False, {}
    for rep in reps:
        ent = by.get(rep['code'])
        arr = ent.get('disclosures') if isinstance(ent, dict) else None
        if not isinstance(arr, list):
            continue
        any_list = True
        for dsc in arr:  # 파일 차례
            if not isinstance(dsc, dict):
                continue
            pa, title = dsc.get('publishedAt'), dsc.get('title')
            if not (isinstance(pa, str) and isinstance(title, str)):
                continue
            day = pa[:10]
            if not (frm < day <= as_of) or any(w in title for w in DROP):
                continue
            kind = next((k for k, rx in KINDS if rx.search(title)), None)
            if kind is None:
                continue
            key = (rep['code'], kind)  # 같은 회사 같은 종류는 가장 새 것 한 건
            if key not in newest or day > newest[key][0]:
                newest[key] = (day, rep['name'], kind)
    if not any_list:
        return None
    rows = sorted(newest.values(), key=lambda r: (r[1], r[2]))  # 이름 · 종류(문자 차례)
    rows.sort(key=lambda r: r[0], reverse=True)                # 날짜 새것 먼저(같은 날은 위 차례 그대로)
    return [f'{n}|{k}|{d}' for d, n, k in rows]


# ---------- 10 · 11 기사 ----------

def has_word(title, w):
    if w not in EDGE:
        return w in title
    i = title.find(w)
    while i >= 0:
        before = title[i - 1] if i > 0 else ''
        after = title[i + len(w)] if i + len(w) < len(title) else ''
        if not ('가' <= before <= '힣') and not ('가' <= after <= '힣'):
            return True
        i = title.find(w, i + 1)
    return False


def news_of(reps, words, frm, as_of):
    """맞은 기사 가운데 publishedAt 글자 차례로 가장 늦은 것(같으면 앞 대표 · 앞 기사) · 기사 줄이 하나도 없으면 None"""
    any_list, best = False, None
    for rep in reps:
        arr = rep['news']
        if not isinstance(arr, list):
            continue
        any_list = True
        for art in arr:
            if not isinstance(art, dict):
                continue
            pa, title = art.get('publishedAt'), art.get('title')
            if not (isinstance(pa, str) and isinstance(title, str)) or not (frm < pa[:10] <= as_of):
                continue
            w = next((x for x in words if has_word(title, x)), None)
            if w is not None and (best is None or pa > best[0]):
                best = (pa, rep['name'], pa[:10], w)
    if not any_list:
        return None
    return '' if best is None else f'{best[1]}|{best[2]}|{best[3]}'


# ---------- 맞대기 ----------

def same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if num(a) and num(b):
        return a == b
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return type(a) is type(b) and a == b


def pct_ok(raw, got):
    """파일 값이 % 두 자리 꼴이고, 셈 그대로 값에서 0.005 안(= 바르게 반올림한 값 · 꼭 가운데면 둘 다)"""
    if not num(got):
        return False
    g = got * 100
    return abs(g - round(g)) < 1e-6 and abs(g - raw * 10000) <= 0.5 + 1e-6


class Cmp:
    def __init__(self):
        self.bad, self.n = [], 0

    def check(self, field, exp, got, ok):
        self.n += 1
        if not ok:
            self.bad.append((field, exp, got))

    def eq(self, field, exp, got):
        self.check(field, exp, got, same(exp, got))

    def pct(self, field, raw, got):
        self.check(field, None if raw is None else pct2(raw), got, got is None if raw is None else pct_ok(raw, got))


def light_money(mo):
    return 'q' if mo is None else ('on' if mo['eok'] >= 1 else 'off')


def light_hit(v):
    return 'q' if v is None else ('off' if v == '' else 'on')


def head_word(p):
    """p = |m| × 100(%) — 1% 이상이면 반올림한 정수 · 아니면 한 자리"""
    return str(js_round(p)) if p >= 1 else f'{js_round(p * 10) / 10:.1f}'  # 결정표 4 「1% 이상이면 반올림한 정수」(2026-10-30 글 바로잡음 — 처음 글 「넘으면」)


def run(a):
    site, view = Path(a.site), Path(a.view)
    fpath = Path(a.file) if a.file else site / 'next' / 'data' / 'flow-why.json'
    data = site / 'atlas' / 'data'

    days = load(data / 'days.json')
    dates = days.get('dates') if isinstance(days, dict) else None
    if not isinstance(dates, list) or len(dates) <= WIN or not all(isinstance(d, str) for d in dates):
        raise InputError(f'날짜 줄(dates)이 없거나 {WIN + 1}날보다 짧음 — {data / "days.json"}')
    n = len(dates)
    T, F = n - 1, n - 1 - WIN
    as_of, frm = dates[T], dates[F]

    mkt = load(data / 'mkt.json')
    comps = mkt.get('companies') if isinstance(mkt, dict) else None
    if not isinstance(comps, dict):
        raise InputError(f'mkt.json 에 companies 없음 — {data / "mkt.json"}')
    try:
        have = {f[:-5] for f in os.listdir(data / 'co') if f.endswith('.json')}
    except OSError as e:
        raise InputError(f'co 폴더를 못 읽음 — {data / "co"} ({e})')

    # 회사 = mkt.json 회사 가운데 co 파일이 있는 곳 · 업종 = 그 회사의 i
    cos = {}
    for code in sorted(c for c in comps if c in have):
        p = data / 'co' / f'{code}.json'
        cl = closes_of(load(p), n, p)
        r, jumps = daily_of(cl, T)
        ent = comps[code] if isinstance(comps[code], dict) else {}
        cos[code] = {'ind': ent.get('i'), 'cl': cl, 'r': r, 'jumps': jumps}
    if not cos:
        raise InputError('셀 회사가 없음(mkt.json 과 co 파일이 겹치지 않음)')
    M = index_of([c['r'] for c in cos.values()], T)
    m_raw = M[T] / M[F] - 1

    th_path = site / 'next' / 'data' / 'theme-home.json'
    th = load(th_path)
    th_inds = th.get('inds') if isinstance(th, dict) else None
    if not isinstance(th_inds, list):
        raise InputError(f'theme-home.json 에 inds 없음 — {th_path}')

    board = load(view / 'board.json')
    bcomps = board.get('companies') if isinstance(board, dict) else None
    if not isinstance(bcomps, list):
        raise InputError(f'board.json 에 companies 없음 — {view / "board.json"}')
    agenda = load(view / 'agenda.json', need=False)

    got = load(fpath)
    cmp = Cmp()
    if not isinstance(got, dict):
        cmp.check('파일 꼴', '{…}', type(got).__name__, False)
        got = {}

    # ② 날짜
    cmp.eq('asOf', as_of, got.get('asOf'))
    cmp.eq('from', frm, got.get('from'))
    cmp.eq('theme-home.asOf(입력)', as_of, th.get('asOf'))
    if 'boardAsOf' in got:
        cmp.eq('boardAsOf', board.get('asOf'), got.get('boardAsOf'))
    market = got.get('market') if isinstance(got.get('market'), dict) else {}
    cmp.pct('market.m', m_raw, market.get('m'))

    # ① 몰린 곳 셋 — x 큰 차례(같으면 파일 차례)로 셋 · ③ 확인이 어긋난 업종은 칸이 없어야
    top3 = sorted((r for r in th_inds if isinstance(r, dict) and num(r.get('x')) and r['x'] > 0), key=lambda r: -r['x'])[:3]
    exp, dropped = [], []
    for row in top3:
        name = row.get('n')
        members = sorted(c for c, v in cos.items() if v['ind'] == name)
        I = index_of([cos[c]['r'] for c in members], T)
        i_raw = I[T] / I[F] - 1
        x_re = ((I[T] / I[F]) / (M[T] / M[F]) - 1) * 100
        if abs(x_re - row['x']) > 0.011 or len(members) < 5:
            dropped.append(f'{name}(다시 센 x {x_re:.4f} · 막대 x {row["x"]} · 회사 {len(members)}곳)')
            continue
        exp.append({'n': name, 'x': row['x'], 'i_raw': i_raw, 'members': members})
    if dropped:  # 결정표 2 · 7 — 확인이 어긋나면 파일을 만들지 않음(flow_why.mjs 는 던지고 build_data.mjs 가 파일을 지움 · 화면은 「왜? 아직 못 셌어요.」)
        cmp.check('x 확인 · 회사 수(어긋나면 파일이 없어야)', '파일 없음', dropped, False)
    f_inds = got.get('inds') if isinstance(got.get('inds'), list) else []
    cmp.eq('inds[].n', [e['n'] for e in exp], [r.get('n') if isinstance(r, dict) else r for r in f_inds])

    notes = [] if agenda is not None else ['agenda.json 없음(좋은 소식은 모름)']
    for k, e in enumerate(exp):
        name = e['n']
        fr = next((r for r in f_inds if isinstance(r, dict) and r.get('n') == name), None)
        if fr is None:
            continue  # 이름 줄에서 이미 틀림으로 적힘
        tag = f'inds[{k}] {name}'
        cmp.eq(f'{tag} · x(theme-home 과 같아야)', e['x'], fr.get('x'))
        cmp.pct(f'{tag} · i', e['i_raw'], fr.get('i'))

        reps = []
        for c in sorted((c for c in bcomps if isinstance(c, dict) and isinstance(c.get('group'), dict)
                         and c['group'].get('industry') == name and isinstance(c.get('code'), str)), key=lambda c: c['code']):
            st = load(view / 'stocks' / f'{c["code"]}.json', need=False)
            if st is None:
                notes.append(f'stocks/{c["code"]}.json 없음({name} 대표 · 자료 없음으로 셈)')
            st = st if isinstance(st, dict) else {}
            ctx = st.get('context') if isinstance(st.get('context'), dict) else {}
            c60 = {}
            for row in st.get('closes60') if isinstance(st.get('closes60'), list) else []:
                if isinstance(row, dict) and isinstance(row.get('date'), str) and pos(row.get('close')):
                    c60.setdefault(row['date'], row['close'])
            reps.append({'code': c['code'], 'name': c.get('name'), 'close': c['close'] if pos(c.get('close')) else None,
                         'flows': ctx.get('flows'), 'news': ctx.get('news'), 'c60': c60})
        cmp.eq(f'{tag} · reps', len(reps), fr.get('reps'))

        calc = fr.get('calc') if isinstance(fr.get('calc'), dict) else {}
        fmoney = calc.get('money') if isinstance(calc.get('money'), dict) else {}
        money = {}
        for key, field in MONEY.items():
            mo = money[key] = money_of(reps, field, frm, as_of)
            gm = fmoney.get(key)
            if mo is None or not isinstance(gm, dict):
                cmp.eq(f'{tag} · calc.money.{key}', mo, gm)
                continue
            for f in ('eok', 'days', 'from', 'to', 'top', 'topEok'):
                cmp.eq(f'{tag} · calc.money.{key}.{f}', mo[f], gm.get(f))

        good = good_of(reps, agenda, frm, as_of)
        cmp.eq(f'{tag} · calc.good', good, calc.get('good'))

        best, breadth = lead_breadth([(c, cos[c]['cl'], cos[c]['jumps']) for c in e['members']], F, T)
        flead = calc.get('lead')
        if best is None or not isinstance(flead, dict):
            cmp.eq(f'{tag} · calc.lead', None if best is None else {'c': best[0], 'chg': pct2(best[1])}, flead)
        else:
            cmp.eq(f'{tag} · calc.lead.c', best[0], flead.get('c'))
            cmp.pct(f'{tag} · calc.lead.chg', best[1], flead.get('chg'))
        cmp.eq(f'{tag} · calc.breadth', breadth, calc.get('breadth'))

        pol = news_of(reps, POL, frm, as_of)
        abr = news_of(reps, ABR, frm, as_of)
        cmp.eq(f'{tag} · calc.pol', pol, calc.get('pol'))
        cmp.eq(f'{tag} · calc.abr', abr, calc.get('abr'))

        lights = [light_money(money['1']), light_money(money['2']), light_money(money['3']),
                  'q' if good is None else ('on' if good else 'off'),
                  'q' if best is None else ('on' if best[1] > 0 else 'off'),
                  'q' if breadth['tot'] == 0 else ('on' if breadth['up'] * 2 >= breadth['tot'] else 'off'),
                  'on' if e['i_raw'] > m_raw else 'off', 'q', 'q', light_hit(pol), light_hit(abr)]
        cmp.eq(f'{tag} · lights', lights, fr.get('lights'))
        for it in fr.get('items') if isinstance(fr.get('items'), list) else []:
            kk = it.get('k') if isinstance(it, dict) else None
            if isinstance(kk, int) and not isinstance(kk, bool) and 1 <= kk <= 11:
                cmp.eq(f'{tag} · items[k={kk}].s(불빛과 같아야)', lights[kk - 1], it.get('s'))

    # 4 머리 글 — 몰린 곳 가운데 한 곳이라도 내렸으면(i < 0 · 시장 m < 0)
    head = got.get('head')
    if m_raw < 0 and any(e['i_raw'] < 0 for e in exp):
        want = [f'시장이 {head_word(abs(m_raw) * 100)}% 내릴 때', f'시장이 {head_word(abs(pct2(m_raw)))}% 내릴 때']
        ko = head.get('ko') if isinstance(head, dict) else None
        first = ko[0] if isinstance(ko, list) and ko else None
        cmp.check('head.ko[0]', want[0], first, first in want)
    else:
        cmp.eq('head', None, head)
    return cmp, as_of, len(exp), notes


def main():
    ap = argparse.ArgumentParser(description='돈 흐름 칸 · 까닭 열한 가지 따로 세기 — flow-why.json 과 맞댐')
    ap.add_argument('--site', default='site', help='사이트 폴더(기본 site)')
    ap.add_argument('--view', default='public/data/atlas11/view', help='판 자료 폴더(기본 public/data/atlas11/view)')
    ap.add_argument('--file', help='맞댈 파일(기본 <site>/next/data/flow-why.json)')
    ap.add_argument('--quiet', action='store_true', help='모두 맞으면 아무것도 안 찍음')
    a = ap.parse_args()
    try:
        cmp, as_of, k, notes = run(a)
    except InputError as e:
        print(f'flow_why_verify: 입력 문제 — {e}', file=sys.stderr)
        sys.exit(2)
    show = lambda v: json.dumps(v, ensure_ascii=False)
    note = ''.join(f' · {x}' for x in notes)
    if cmp.bad:
        for field, exp, got in cmp.bad:
            print(f'틀림 · {field} · 다시 센 값 {show(exp)} · 파일 값 {show(got)}')
        print(f'flow_why_verify: 틀림 {len(cmp.bad)}곳 · {as_of} · 업종 {k} · 셈 칸 {cmp.n}{note}')
        sys.exit(1)
    if not a.quiet:
        print(f'flow_why_verify: 맞음 · {as_of} · 업종 {k} · 셈 칸 {cmp.n}{note}')
    sys.exit(0)


if __name__ == '__main__':
    main()
