#!/usr/bin/env python3
"""힘 붙은 365곳 고르기(h365-v1) — 새 ATLAS 의 바탕 365곳(옛 대세 365곳 d365-v2 는 daese.py · 회차 기록 · 봉인 1호로 남김)
사장님 2026-10-13 13:04 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 구굴팀 애플팀 클로드팀 cai팀 중에 cia팀이 중심이 되서
나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」 → 네 팀 기획(CIA팀 중심 · 구글 · 애플 · 클로드팀 따로 → CIA팀이 모음 · 2026-10-13 13:3x 서울)
  → 사장님 2026-10-13 15:10 「응」 — 여쭌 것 둘: ① 「힘이 붙는 종목」 = 화면 「힘 붙음」과 같은 셈(지난 20거래일 뒤 10일이 앞 10일보다 3%p 넘게 더 오름) · 먼저 다 넣고 모자라면 그다음 차례로 늘 365곳 ② 이름 「힘 붙은 365곳」 + 바로 밑 「그중 힘 붙음 n곳 · 나머지 m곳은 그다음 차례로 채움」(기준 글은 그 전에 커밋한 그대로 · 이 줄만 더함)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
자료      d365-v2 와 같음 — 후보 표 = dump.mjs 가 모음 reports/atlas11/universe/2026-10-10/bundle.json.gz 를 푼 것(회사 목록 · 결산 · 업종 = 10월 10일 모음)
          주가 · 거래량 = 모음 네이버 일봉 + 회차마다 이어 받은 일봉(closes_fetch.mjs · daese.merge 규칙 그대로) · 시가총액 · 거래대금 · 기록 수 = daese.refresh 그대로
          + 앞 회차 기록(roll.mjs 가 --prev 로 넘기는 마지막 성공 회차의 365곳) — 3절 완충에만 씀
고르는 날  d365-v2 와 같음(후보 표 절반 넘게 종가가 있는 마지막 날 · 낮 회차면 그날 장중 값 — 아직 바뀜)
기본 문    d365-v2 와 같은 일곱 · 같은 글: rules.blue(시가총액 1,000억 원 · 하루 거래대금 3억 원(60거래일 평균) · 부채비율 200% · 주가 기록 260거래일 · 흑자)
          + 보통주 + 고르는 날 종가 있음 · 업종 3곳 미만 빼기 · 업종 순서 · 층은 없음
창        거래소 달력(daese.cal_sessions · 달력이 끝난 뒤는 후보 절반 넘게 종가가 있는 날)으로 20거래일 = K−20 … K(21점) · 가운데 날 K−10
          = site_build.py 화면 창 · trend() 의 가운데 날과 같은 날 · 쓰는 날마다 후보 절반 넘게 종가가 있어야 함(아니면 멈춤)
힘        h1 = P(K−10) ÷ P(K−20) − 1(앞 10거래일) · h2 = P(K) ÷ P(K−10) − 1(뒤 10거래일) · d = h2 − h1
          「힘 붙음」 = d > 0.03 — site_build.py trend() 의 TR_TURN(3%p)과 같은 값 · 같은 말은 같은 셈
?         셈 못 함(365곳에 넣지 않음 · 0 으로 채우지 않음): ① 21점 가운데 종가가 빈 날(gap) ② 이웃한 날 사이 변화가 ±30.5% 넘음(break · 값 제한 ±30% 밖 =
          쪼개기 · 합치기 · 증자 등 끊긴 값) ③ 끝난 날 K−20 … K−1 가운데 거래량이 0 인 날(vol0 · 거래정지 흔적 · 낮 회차의 K날 거래량은 보지 않음 · 거래량을 모르는 날은 0 으로 보지 않음)
차례      속 셈만(화면 · 사이트 자료에 싣지 않음): d 큰 순 → 같으면 시가총액 큰 순 → 종목 번호 작은 순
채우기    ① 「힘 붙음」 회사 F 를 차례대로 넣음(F 가 365곳 이상이면 앞 365곳 — 모두 「힘 붙음」 · gain)
          ② 모자라면 앞 회차 365곳 가운데 F 가 아니고 오늘 차례 450번째 안인 곳을 차례대로(남김 · keep)
          ③ 그래도 모자라면 나머지를 차례대로(채움 · fill) · 셀 수 있는 곳이 365곳보다 적으면 그 수만
완충      앞 회차 기록의 판이 h365-v1 일 때만 ②를 씀(판이 바뀌는 첫 회차 · 앞 기록 없음 = 완충 없음) · 450 은 근거 없이 정한 값(셈을 보고 바꾸지 않음)
같은 원문이면 언제나 같은 365곳: 원문 = 모음 + 이어 받은 일봉 + 앞 회차 기록 · 따로 세기 = h365_verify.mjs(노드로 처음부터 · 같은 앞 회차 기록 파일)
밖 까닭    기본 문 = d365-v2 와 같은 글 · ? = 「? 셈 못 함 — …」 · 자리 = 「문턱 3%p 못 넘음 · 자리가 참」 또는 「힘 붙음이지만 365곳이 이미 참」(30자 안 · 순위 없음)
한계      10거래일 값은 흔들림이 큼 · 가운데 날 하루 튐이 두 번 셈됨 · 뒤 10거래일에 덜 내린 곳도 「힘 붙음」 · 고른 창과 화면 창이 같아 줄마다 「힘 붙음」이 많음 ·
          지난 3년 기록에서 「힘 붙음」 다음 20거래일 가운데값 −0.74%(표시 없는 곳 0.00% · 클로드팀) — 고르는 힘이 있다는 근거 없음 · 기록일 뿐

쓰는 법(저장소 맨 위에서):
  node scripts/atlas11/t365/dump.mjs reports/atlas11/universe/2026-10-10/bundle.json.gz <임시>/now.json 2026-10-08
  python3 scripts/atlas11/t365/h365.py <임시>/now.json <결과 폴더> [--closes <이어 받은 일봉 폴더>] [--prev <앞 회차 기록 json>]
만드는 것: proposal.json(365곳 · 회사마다 h1 · h2 · d · 든 까닭 · 밖 회사마다 까닭 · 고르는 날 · 이어 받은 일봉 셈 · 앞 회차 지문) · list.csv(365곳)
site_build.py 는 select() 를 같은 원문으로 다시 불러 proposal.json 과 한 곳도 다르지 않은지 먼저 본다(앞 회차 기록 = 환경 변수 ATLAS_H365_PREV).
"""
import gzip, hashlib, json, os, statistics as st, sys
from datetime import datetime, timezone
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from rules import blue  # noqa: E402
import daese  # noqa: E402  자료 · 고르는 날 · 기본 문 숫자는 d365-v2 와 하나로

VERSION = 'h365-v1'
BUNDLE = daese.BUNDLE
CAP, ATV, DEBT, NDAYS = daese.CAP, daese.ATV, daese.DEBT, daese.NDAYS
WIN, MID, TURN, LIMIT, BUF, PICK = 20, 10, 0.03, 0.305, 450, 365
QWHY = {'gap': '? 셈 못 함 — 종가 빈 날', 'break': '? 끊긴 값(쪼개기 등)', 'vol0': '? 거래량 0인 날(거래정지 흔적)'}
CUT_LOW, CUT_FULL = '문턱 3%p 못 넘음 · 자리가 참', '힘 붙음이지만 365곳이 이미 참'
iso8 = daese.iso8
kd = daese.kd


def series(merged, codes):
    """회사마다 날(YYYY-MM-DD) → 종가(0 보다 큰 값만) · 날 → 거래량(모르는 날은 None 그대로)"""
    px, vol = {}, {}
    for c in codes:
        rr = merged['stocks'][c]['fchart']['rows']
        px[c] = {iso8(r[0]): r[4] for r in rr if r[4] and r[4] > 0}
        vol[c] = {iso8(r[0]): (r[5] if len(r) > 5 else None) for r in rr if r[4] and r[4] > 0}
    return px, vol


def measure(pxc, volc, days):
    """창 21점(K−20 … K) → ({h1, h2, d, r20}, None) 또는 (None, 까닭)"""
    v = [pxc.get(d) for d in days]
    if any(x is None for x in v):
        return None, 'gap'
    for i in range(1, len(v)):
        if abs(v[i] / v[i - 1] - 1) > LIMIT:
            return None, 'break'
    if any(volc.get(d) == 0 for d in days[:-1]):
        return None, 'vol0'
    h1, h2 = v[MID] / v[0] - 1, v[-1] / v[MID] - 1
    return {'h1': h1, 'h2': h2, 'd': h2 - h1, 'r20': v[-1] / v[0] - 1}, None


def prev_of(prev):
    """앞 회차 기록(dict · {version, at, members}) → 완충에 쓸지 · 지문"""
    if not prev:
        return {'used': False, 'version': None, 'at': None, 'n': 0, 'digest': None}, None
    mem = list(prev.get('members') or [])
    dg = hashlib.sha256(','.join(mem).encode()).hexdigest()[:16] if mem else None
    use = prev.get('version') == VERSION and bool(mem)
    return {'used': use, 'version': prev.get('version'), 'at': prev.get('at'), 'n': len(mem), 'digest': dg}, (set(mem) if use else None)


def select(rows, merged, cal, asof, prev=None):
    """후보 표 rows(고르는 날에 맞춘 것 · daese.prepare) · 모음 꼴 일봉 · 거래소 달력 · 고르는 날 · 앞 회차 기록 → 고른 결과 — 같은 원문이면 언제나 같은 값"""
    byc = {r['code']: r for r in rows}
    px, vol = series(merged, list(byc))
    DAYS = [d for d in cal if d <= asof]
    if not DAYS or DAYS[-1] != asof:
        raise ValueError('기준 %s 이 거래소 달력의 거래일이 아님' % asof)
    K = len(DAYS) - 1
    if K < WIN:
        raise ValueError('거래일이 %d일뿐(%d일 필요)' % (K + 1, WIN + 1))
    win = DAYS[K - WIN:K + 1]
    for d in win:
        n = sum(1 for c in byc if d in px[c])
        if not n > len(byc) / 2:
            raise ValueError('%s 에 종가 있는 회사가 %d곳뿐(후보 %d곳의 절반 이하)' % (d, n, len(byc)))
    status, gate_fails, ok = {}, {}, []
    for r in rows:
        f = blue(r, CAP, ATV, DEBT, NDAYS)
        if not f and r.get('notCommon'):
            f = '보통주 아님(우선주 · 스팩 · 리츠 등)'
        if not f and not px[r['code']].get(asof):
            f = '고르는 날(%s) 종가 없음 — 거래정지 등' % kd(asof)
        if f:
            status[r['code']] = {'s': 'gate', 'why': f}
            gate_fails[f] = gate_fails.get(f, 0) + 1
        else:
            ok.append(r['code'])
    M, qn = {}, {'gap': 0, 'break': 0, 'vol0': 0}
    for c in ok:
        m, w = measure(px[c], vol[c], win)
        if m:
            M[c] = m
        else:
            qn[w] += 1
            status[c] = {'s': 'q', 'why': QWHY[w]}
    order = sorted(M, key=lambda c: (-M[c]['d'], -(byc[c]['capEok'] or 0), c))
    F = [c for c in order if M[c]['d'] > TURN]
    pinfo, P = prev_of(prev)
    room = min(PICK, len(order))
    gain = F[:room]
    keep = []
    if len(gain) < room and P:
        fs = set(F)
        keep = [c for c in order[:BUF] if c in P and c not in fs][:room - len(gain)]
    taken = set(gain) | set(keep)
    fill = [c for c in order if c not in taken][:room - len(gain) - len(keep)]
    kind = {**{c: 'gain' for c in gain}, **{c: 'keep' for c in keep}, **{c: 'fill' for c in fill}}
    pick_codes = gain + keep + fill
    picked = []
    for c in pick_codes:
        m = M[c]
        status[c] = {'s': 'in'}
        picked.append({'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'],
                       'h1': m['h1'], 'h2': m['h2'], 'd': m['d'], 'r20': m['r20'], 'kind': kind[c]})
    for c in order:
        if c not in kind:
            status[c] = {'s': 'cut', 'why': CUT_FULL if M[c]['d'] > TURN else CUT_LOW}
    if len(picked) != room or len(status) != len(rows) or len(set(pick_codes)) != len(pick_codes):
        raise ValueError('셈이 안 맞음 %d %d' % (len(picked), len(status)))
    gp = [p for p in picked if p['kind'] == 'gain']
    out_m = [M[c] for c in order if c not in kind]
    med = lambda xs: st.median(xs) if xs else None
    return {
        'version': VERSION, 'asOf': asof,
        'window': {'from': win[0], 'mid': win[MID], 'to': asof, 'days': WIN},
        'counts': {'universe': len(rows), 'gate': len(ok), 'gateFails': sorted(gate_fails.items(), key=lambda kv: (-kv[1], kv[0])),
                   'measured': len(M), 'q': sum(qn.values()), 'qWhy': qn, 'gainAll': len(F),
                   'gain': len(gain), 'keep': len(keep), 'fill': len(fill), 'picked': len(picked),
                   'gainDown': sum(1 for p in gp if p['h2'] < 0), 'pickedDown': sum(1 for p in picked if p['h2'] < 0),
                   'medD': med([M[c]['d'] for c in M]), 'medR20In': med([p['r20'] for p in picked]), 'medR20Out': med([m['r20'] for m in out_m]), 'out': len(out_m)},
        'prev': pinfo, 'picked': picked, 'status': status,
    }


def rules_text(res, slots):
    w = res['window']
    return {
        'version': VERSION,
        'label': '힘 붙은 365곳 — 회차마다 그날까지 지난 20거래일, 뒤 10거래일이 앞 10거래일보다 더 오른 회사부터',
        'said': ['사장님 2026-10-13 13:04(서울) 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 구굴팀 애플팀 클로드팀 cai팀 중에 cia팀이 중심이 되서 나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」',
                 '사장님 2026-10-13 15:10 「응」 — 여쭌 것 둘: ① 「힘이 붙는 종목」 = 화면 「힘 붙음」과 같은 셈(지난 20거래일 뒤 10일이 앞 10일보다 3%p 넘게 더 오름) · 먼저 다 넣고 모자라면 그다음 차례로 늘 365곳 ② 이름 「힘 붙은 365곳」 + 바로 밑 「그중 힘 붙음 n곳 · 나머지 m곳은 그다음 차례로 채움」'],
        'data': '회사 목록 · 결산 · 업종 = 모음 %s(10월 10일) · 주가 · 거래량 = 그 모음 일봉 + 회차마다 이어 받은 네이버 일봉(%s 값까지)' % (BUNDLE, res['asOf']),
        'gate': ['보통주(우선주 · 스팩 · 리츠 · ETF · ETN 빼고)', '시가총액 1,000억 원 이상(고르는 날 종가로 맞춤)', '주가 기록 260거래일(1년) 이상',
                 '하루 거래대금 3억 원 이상(최근 60거래일 평균)', '마지막 결산 흑자 — 영업이익 · 순이익 모두(금융은 순이익만)',
                 '부채비율 200% 이하 — 금융(예금 · 보험금) · 조선 · 방산(미리 받은 돈)은 빚이 크게 잡히는 구조라 빼고 봄',
                 '고르는 날 종가가 있음 — 거래정지 등은 뺌'],
        'window': '지난 20거래일(%s → %s) · 가운데 날 %s · 화면 20거래일 창과 같은 날' % (kd(w['from']), kd(w['to']), kd(w['mid'])),
        'rule': '힘 = 뒤 10거래일 오름 − 앞 10거래일 오름 · 3%p 넘으면 「힘 붙음」(화면 줄 아래 「힘 붙음」과 같은 셈)',
        'fill': ['「힘 붙음」 회사를 먼저 다 넣음(365곳 넘으면 힘이 큰 차례로 365곳)',
                 '모자라면 앞 회차 365곳 가운데 오늘 450번째 안인 곳을 남김',
                 '그래도 모자라면 그다음 차례로 채움 — 늘 365곳'],
        'q': '셈 못 함(「?」) — 20거래일 안에 종가가 빈 날 · 하루 ±30.5% 넘는 끊긴 값(쪼개기 등) · 거래량 0인 날(거래정지 흔적)이 있으면 넣지 않음',
        'bias': '뒤 10거래일에 더 오른 회사를 골랐기 때문에, 고른 기간(지난 20거래일)의 선은 끝이 들려 보이기 쉽습니다. 앞으로도 그렇다는 뜻이 아닙니다.',
        'past': '지난 3년 기록에서 「힘 붙음」 다음 20거래일 가운데값은 −0.7%로, 표시가 없던 회사(0.0%)보다 낫지 않았습니다.',
        'next': '하루 %d번(%s 서울) 그날까지 값으로 다시 고름 — 장이 없는 날은 「새 값 없음」으로 기록만' % (len(slots), ' · '.join(slots)),
    }


def why_of(p):
    s = lambda x: ('%+.1f%%' % (x * 100)).replace('-', '−')
    head = {'gain': '힘 붙음', 'keep': '앞 회차에 들었고 오늘 450번째 안이라 남김', 'fill': '그다음 차례라 빈자리에 듦'}[p['kind']]
    return '%s · 앞 10거래일 %s → 뒤 10거래일 %s · 뒤가 %s%%p 더' % (head, s(p['h1']), s(p['h2']), ('%+.1f' % (p['d'] * 100)).replace('-', '−'))


def load_prev(path):
    if not path:
        return None
    j = json.load(open(path, encoding='utf-8'))
    return {'version': j.get('version'), 'at': j.get('at'), 'members': j.get('members') or []}


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
    res = select(rows, merged, cal, day, load_prev(opt.get('--prev')))
    byc = {r['code']: r for r in rows}
    picked = [{**p, 'why': why_of(p)} for p in res['picked']]
    outside = [{'code': c, 'name': byc[c]['name'], 'market': byc[c]['market'], 'sector': byc[c]['sector'], 'capEok': byc[c]['capEok'], **res['status'][c]}
               for c in sorted(res['status'], key=lambda c: (-(byc[c]['capEok'] or 0), c)) if res['status'][c]['s'] != 'in']
    doc = {'schema': 'atlas11-h365-proposal-1', 'made': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'from': {'cands': 'dump.mjs %s %s' % (BUNDLE, N['asOf']), 'collectedAt': N['collectedAt'], 'closes': stats, 'prev': res['prev']},
           'asOf': day, 'rules': rules_text(res, act.get('slots') or []), 'window': res['window'], 'counts': res['counts'],
           'picked': picked, 'outside': outside}
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'proposal.json'), 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')
    csv = ['종목코드,회사,시장,네이버 업종,시가총액(억 원),든 까닭,앞 10거래일(%),뒤 10거래일(%),뒤 − 앞(%p),20거래일(%)']
    for p in picked:
        csv.append(','.join([p['code'], p['name'], p['market'], p['sector'] or '', str(p['capEok']), {'gain': '힘 붙음', 'keep': '남김', 'fill': '채움'}[p['kind']],
                             '%.2f' % (p['h1'] * 100), '%.2f' % (p['h2'] * 100), '%.2f' % (p['d'] * 100), '%.2f' % (p['r20'] * 100)]))
    with open(os.path.join(out_dir, 'list.csv'), 'w', encoding='utf-8') as f:
        f.write('﻿' + '\n'.join(csv) + '\n')
    c = res['counts']
    print(json.dumps({k: c[k] for k in ('universe', 'gate', 'measured', 'q', 'qWhy', 'gainAll', 'gain', 'keep', 'fill', 'picked', 'gainDown')} | {'asOf': day, 'prev': res['prev']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
