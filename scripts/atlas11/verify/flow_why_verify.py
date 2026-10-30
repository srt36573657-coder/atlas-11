#!/usr/bin/env python3
"""둘이 · 「돈 흐름 칸 · 까닭 열한 가지」 따로 세기(파이썬 · 표준 라이브러리만)
  flow_why.mjs 코드는 보지 않고 결정표 글과 원자료만 보고 처음부터 다시 센다 — 그래서 JS 셈에 잘못이 있으면 여기서 어긋난다
  결정표: docs/design/why11-2026-10-30/decision.md 의 0 · 1 · 2 · 2-1 · 2-2 · 2-3 · 4
          지수 셈: docs/design/theme-2026-10-19/theme-engine.md 의 「들어오는 자료」 · 「1. 지수」
  읽는 것(읽기만):
    <site>/atlas/data/days.json(dates) · mkt.json(companies[번호] = {n 이름, i 업종}) · co/<번호>.json(close · k0)
    <site>/next/data/theme-home.json(asOf · inds[] = {n, x})
    <view>/board.json(asOf · companies[]) · <view>/stocks/<번호>.json(context.flows · context.news · closes60)
    <view>/agenda.json(byCode[번호].disclosures — 없으면 좋은 소식은 「모름」)
    <site>/next/data/fx-rate.json(schema dori-fx-rate-1 · fx · rate = [날짜, 값] 줄 — 없거나 꼴이 다르면 8 은 「모름」)
    <us>/input.json(assets[] = {industry, prices[] = {date, close}}) · <us>/market/INX.json(rows[] = {date, close} · S&P 500)
      — 없거나 못 읽으면 짝이 있는 업종도 9 는 「모름」
    맞대는 파일: <site>/next/data/flow-why.json
  다시 세는 것:
    ① 몰린 곳 셋 = theme-home 에서 x > 0 인 업종을 x 큰 차례로 셋(같으면 파일 차례) · 이름 · 차례 · x 가 같아야
    ② 날짜 = 날짜 줄 마지막 날 T · from = T − 20 번째 날 · theme-home 날짜도 T
    ③ 같은 무게 지수 = 회사 하루 변화(두 날 종가가 다 있을 때만 · 0.35 넘게 튀면 그날 그 회사 뺌)의 평균을 날마다 이어 곱함
       시장 m · 업종 i(% 두 자리) · 다시 센 x 와 막대 x 차이 0.011 안 · 업종 회사 5곳 이상(어긋나면 파일이 없어야 맞음 — 결정표 2 · 7 · 2026-10-30 글 바로잡음)
    ④ 대표 수 · 돈 셋(외국인 · 기관 · 개인 — 대표마다 마지막 다섯 날 · 주식 수 × 그날 종가 · 억 원 반올림 · 날 수 · 처음 날 · 끝 날 · 적는 대표)
    ⑤ 좋은 소식 공시 · 대장 회사 · 같이 오른 수 · 정부 정책 기사 · 나라 사이 기사 · 불빛 열하나(items 의 s 도) · 머리 글
    ⑥ 8 환율과 금리(결정표 2-2) — 쪽마다(달러 값 fx · 금리 rate) 지난 1년(창 앞 240 거래일) 「업종이 그날 시장보다 앞선 %」와
       그 쪽 하루 움직임의 기울기 β · t · 쓴 날 n, 이번 달 처음 · 끝(da · db · a · b) · 움직임 move, 가름(clear · moved · aligned)
       → calc.fx · calc.rate(모름이면 null) · 불빛 8
       9 다른 나라(결정표 2-3) — 짝 표(결정표 표를 아래 PAIRS 에 따로 옮겨 적음)의 미국 업종 회사 같은 무게 지수 ÷ S&P 500(b ~ e)
       → calc.us = {ind, b, e, n, i, m, x}(짝 없음 null) · 불빛 9
  반올림 = JS Math.round 와 같음(.5 는 위로 · 파이썬 round 는 짝수 쪽이라 쓰지 않음)
  % 두 자리는 다시 센 값(셈 그대로)을 두 자리로 반올림한 값이어야 맞음 — 꼭 .5 에 걸린 값만 위 · 아래 둘 다 받음
  8 · 9 의 move · beta · t · i · m · x 도 같은 잣대(바르게 반올림한 값이면 맞음 · 반 칸 + 1e-9 안)
  8 · 9 의 가름(clear · moved · aligned · 불빛)은 결정표대로 반올림한 값으로 다시 가름 — 파일 값이 바르게 반올림한 값이면
       그 값으로 가름(꼭 가운데에 걸린 값에서 JS 와 갈리지 않게) · 아니면 다시 센 값으로
  쓰는 법(저장소 맨 위에서):
    python3 -I scripts/atlas11/verify/flow_why_verify.py [--site site] [--view public/data/atlas11/view] [--us public/data/atlas11/us]
      [--file <site>/next/data/flow-why.json] [--quiet]
  결과: 모두 맞으면 끝값 0 과 한 줄(--quiet 면 아무것도 안 찍음)
        · 다른 칸이 있으면 칸마다 「다시 센 값 · 파일 값」을 찍고 끝값 1 · 입력 파일이 없거나 못 읽으면 끝값 2
        · 앞날 말 없음(지난 기록만 셈)
"""
import argparse, json, math, os, re, sys
from bisect import bisect_right
from datetime import date
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
# 8 환율과 금리(결정표 2-2)
FX_SCHEMA = 'dori-fx-rate-1'
YEAR, YEAR_MIN = 240, 120  # 지난 1년 = 창 앞 240 거래일(L) · 쓴 날이 120 보다 적으면 그 쪽은 모름
FX_OLD = 7                 # 처음 · 끝 값의 날이 D[F] · D[T] 보다 7날(달력) 넘게 앞이면 그 쪽은 모름
FX_PLACES = {'fx': 2, 'rate': 3}  # move 자리 — 달러 값 % 두 자리 · 금리 %p 세 자리(움직임 잣대 1.00 · 0.100 = 둘 다 100칸)
FX_KEYS = ('da', 'db', 'a', 'b', 'move', 'n', 'beta', 't', 'clear', 'moved', 'aligned')
# 9 다른 나라(결정표 2-3)
US_OLD, US_MIN = 5, 3      # b · e 가 D[F] · D[T] 보다 5날(달력) 넘게 앞이면 · b · e 종가가 다 있는 회사가 3곳보다 적으면 모름
# 짝 표 — 결정표 2-3 표(한국 업종 → 미국 업종 · input.json industry)를 표 차례 그대로 따로 옮겨 적음
# 「 · 」(앞뒤 띄어쓰기)는 이름 나눔 · 붙어 쓴 「·」(검사·측정 · 항공·우주 …)와 쉼표(의료 장비, 물품 및 유통 …)는 이름 안 글자
PAIRS = [
    ('반도체', '반도체'),
    ('반도체 장비 · 반도체 검사·측정', '반도체 장비 및 테스트'),
    ('전자부품 · 전자장비 · 휴대폰 부품', '전자 장비 및 부품'),
    ('통신장비', '통신 및 네트워킹'),
    ('통신', '통합 통신 서비스 · 무선 통신 서비스'),
    ('소프트웨어', '소프트웨어'),
    ('IT서비스 · IT 시스템 통합', 'IT 서비스 및 컨설팅'),
    ('인터넷 플랫폼', '온라인 서비스'),
    ('제약', '제약'),
    ('바이오 의약품 · 신약 개발', '생명 공학 및 의학 연구'),
    ('의료기기', '첨단 의료 장비 및 기술 · 의료 장비, 물품 및 유통'),
    ('의료용품', '의료 장비, 물품 및 유통'),
    ('병원·헬스 서비스', '의료 시설 및 서비스'),
    ('은행·카드', '은행 · 소비자 대출'),
    ('증권', '투자 은행 및 중개 서비스'),
    ('보험', '손해보험 · 생명 및 건강 보험 · 복합보험 및 중개인'),
    ('자동차', '자동차 및 트럭 제조'),
    ('방산 · 항공·우주', '항공우주 및 방위'),
    ('항공', '항공사'),
    ('물류·운송', '지상 화물 및 물류'),
    ('로봇·건설기계', '중장비 및 차량'),
    ('일반 기계 · 기계 부품', '산업용 기계 및 장비'),
    ('전기 부품 · 전선·전기장비 · 전력기기', '전기 부품 및 장비'),
    ('에너지 장비', '재생 가능 에너지 장비 및 서비스'),
    ('전력·가스', '전력 유틸리티 · 천연가스 유틸리티 · 복합 유틸리티'),
    ('정유·가스', '오일, 가스 정제 및 마케팅'),
    ('화학 · 석유화학', '상품 화학'),
    ('철강', '철 및 강철'),
    ('시멘트', '건설 자재'),
    ('건축자재', '건설 자재 및 비품'),
    ('건설', '건설 및 엔지니어링 · 주택 건설'),
    ('건설 엔지니어링', '건설 및 엔지니어링'),
    ('부동산', '부동산 서비스'),
    ('유통', '백화점 · 할인점 · 식품 소매 및 유통'),
    ('호텔·레저', '호텔, 모텔 및 크루즈 라인 · 여가 및 오락시설 · 카지노 및 도박'),
    ('화장품', '개인 생활 필수 용품'),
    ('음료', '무알콜 음료'),
    ('방송', '방송'),
    ('콘텐츠 제작 · 연예 기획사', '엔터테인먼트 제작'),
    ('복합기업', '소비재 대기업'),
]
US_OF = {k: us.split(' · ') for kr, us in PAIRS for k in kr.split(' · ')}  # 표에 없는 업종 = 짝 없음(calc.us null · 불빛 9 모름)


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


# ---------- 8 환율과 금리(결정표 2-2) ----------

def day_no(s):
    """'YYYY-MM-DD' → 달력 날 번호 · 꼴이 다르면 None"""
    if not (isinstance(s, str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', s)):
        return None
    try:
        return date.fromisoformat(s).toordinal()
    except ValueError:
        return None


def fx_rate_of(path):
    """fx-rate.json → ({'fx' · 'rate': (날짜 줄, 값 줄, 날짜 → 값)}, None) · 없거나 꼴이 다르면 (None, 까닭) = 두 쪽 모두 모름
       꼴 = schema 'dori-fx-rate-1' · fx · rate 가 [날짜(YYYY-MM-DD), 값(수 · 달러 값은 > 0)] 줄 · 날짜 차례 · 같은 날은 한 줄
       — 줄 하나라도 꼴이 다르면 파일 꼴이 다른 것으로 봄(결정표 2-2 「꼴이 다르면 두 쪽 모두 모름」)"""
    try:
        j = load(path, need=False)
    except InputError as e:
        return None, f'{e} — 환율과 금리는 모름'
    if j is None:
        return None, 'fx-rate.json 없음(환율과 금리는 모름)'
    if not isinstance(j, dict) or j.get('schema') != FX_SCHEMA:
        return None, f'fx-rate.json 꼴이 다름(schema 가 {FX_SCHEMA} 아님 · 환율과 금리는 모름)'
    out = {}
    for side in FX_PLACES:
        arr, ds, vs = j.get(side), [], []
        if not isinstance(arr, list):
            return None, f'fx-rate.json 꼴이 다름({side} 줄 없음 · 환율과 금리는 모름)'
        for row in arr:
            if not (isinstance(row, list) and len(row) == 2 and day_no(row[0]) is not None and num(row[1])
                    and (side == 'rate' or row[1] > 0) and (not ds or row[0] > ds[-1])):
                return None, f'fx-rate.json 꼴이 다름({side} 줄 {json.dumps(row, ensure_ascii=False)} · 환율과 금리는 모름)'
            ds.append(row[0])
            vs.append(row[1])
        out[side] = (ds, vs, dict(zip(ds, vs)))
    return out, None


def fx_side(side, ser, D, I, M, F, T):
    """8 한 쪽(달러 값 fx · 금리 rate)의 셈 그대로 값(반올림 전) · 모름이면 None
       지난 1년 t = F − 239 … F 가운데 D[t − 1] · D[t] 가 둘 다 그 쪽 자료 날짜에 그대로 있는 날만:
         e = ((I[t] ÷ I[t − 1]) ÷ (M[t] ÷ M[t − 1]) − 1) × 100(업종이 그날 시장보다 앞선 %)
         x = 달러 값 (fx[D[t]] ÷ fx[D[t − 1]] − 1) × 100(%) · 금리 rate[D[t]] − rate[D[t − 1]](%p)
       최소 제곱 β · t = β ÷ √(s² ÷ Sxx) — n < 120 · Sxx = 0 · s² = 0 이면 모름
       이번 달 처음 · 끝 = 그 쪽 자료에서 날짜 ≤ D[F] · ≤ D[T] 인 마지막 날(da · db) 값(a · b) — 없거나 7날(달력) 넘게 앞이면 모름
       move = 달러 값 (b ÷ a − 1) × 100(%) · 금리 b − a(%p)"""
    ds, vs, by = ser
    xs, es = [], []
    for t in range(max(1, F - YEAR + 1), F + 1):  # 날짜 줄이 짧으면 t ≥ 1 만(지금 자료는 F − 239 ≥ 1)
        p, q = by.get(D[t - 1]), by.get(D[t])
        if p is None or q is None:
            continue
        es.append(((I[t] / I[t - 1]) / (M[t] / M[t - 1]) - 1) * 100)
        xs.append((q / p - 1) * 100 if side == 'fx' else q - p)
    n = len(xs)
    if n < YEAR_MIN:
        return None
    xm, em = math.fsum(xs) / n, math.fsum(es) / n
    sxx = math.fsum((x - xm) ** 2 for x in xs)
    if sxx == 0:
        return None
    beta = math.fsum((x - xm) * (y - em) for x, y in zip(xs, es)) / sxx
    s2 = math.fsum((y - em - beta * (x - xm)) ** 2 for x, y in zip(xs, es)) / (n - 2)
    if s2 == 0:
        return None
    ka, kb = bisect_right(ds, D[F]) - 1, bisect_right(ds, D[T]) - 1  # ka ≤ kb
    if ka < 0 or day_no(D[F]) - day_no(ds[ka]) > FX_OLD or day_no(D[T]) - day_no(ds[kb]) > FX_OLD:
        return None
    a, b = vs[ka], vs[kb]
    return {'da': ds[ka], 'db': ds[kb], 'a': a, 'b': b, 'move': (b / a - 1) * 100 if side == 'fx' else b - a,
            'n': n, 'beta': beta, 't': beta / math.sqrt(s2 / sxx)}


def fx_file(side, r, g=None):
    """8 한 쪽의 파일 꼴(calc.fx · calc.rate) — 모름 None · 아니면 {da, db, a, b, move, n, beta(네 자리), t(두 자리), clear, moved, aligned}
       가름은 반올림한 값으로(결정표 2-2 4.): clear = |t| ≥ 2 · moved = |move| ≥ 1.00(달러 값 %) · 0.100(금리 %p)
       · aligned = clear 이고 moved 이고 β 와 move 의 부호가 같음
       g(파일 칸)의 move · beta · t 가 바르게 반올림한 값이면 가름은 그 값으로(꼭 가운데에서 갈리지 않게) · 적는 수는 늘 다시 센 값의 반올림"""
    if r is None:
        return None
    g = g if isinstance(g, dict) else {}
    km = 10 ** FX_PLACES[side]
    um, ub, ut = r['move'] * km, r['beta'] * 10000, r['t'] * 100
    mu, bu, tu = snap(um, km, g.get('move')), snap(ub, 10000, g.get('beta')), snap(ut, 100, g.get('t'))
    clear, moved = abs(tu) >= 200, abs(mu) >= 100
    return {'da': r['da'], 'db': r['db'], 'a': r['a'], 'b': r['b'], 'move': js_round(um) / km, 'n': r['n'],
            'beta': js_round(ub) / 10000, 't': js_round(ut) / 100,
            'clear': clear, 'moved': moved, 'aligned': clear and moved and sgn(bu) == sgn(mu)}


def light_fx(fx, rate):
    """불빛 8 — 두 쪽 가운데 하나라도 맞음 = 켜짐 · 두 쪽 다 셈이 되고 둘 다 맞음이 아님 = 꺼짐 · 그 밖 = 모름"""
    if any(s is not None and s['aligned'] for s in (fx, rate)):
        return 'on'
    return 'off' if fx is not None and rate is not None else 'q'


# ---------- 9 다른 나라(결정표 2-3) ----------

def us_of(us_dir):
    """미국 자료 → ((미국 날 줄, 날짜 → S&P 500 종가, 미국 업종 → [회사마다 날짜 → 종가]), 까닭 줄)
       미국 날 = INX rows 가운데 날짜(YYYY-MM-DD)와 종가(> 0)가 있는 줄의 날짜(차례) · 회사마다 날짜 → 종가(> 0)
       파일이 없거나 못 읽거나 꼴이 다르면 그 쪽은 빈 것 → 짝이 있는 업종도 9 는 모름(멈추지 않음)"""
    notes = []

    def rows_of(p, key, what):
        try:
            j = load(p, need=False)
        except InputError as e:
            notes.append(f'{e} — 다른 나라는 모름')
            return []
        arr = j.get(key) if isinstance(j, dict) else None
        if j is None:
            notes.append(f'{what} 없음(다른 나라는 모름)')
        elif not isinstance(arr, list):
            notes.append(f'{what} 꼴이 다름({key} 없음 · 다른 나라는 모름)')
        return arr if isinstance(arr, list) else []

    inx = {}
    for row in rows_of(us_dir / 'market' / 'INX.json', 'rows', 'us/market/INX.json'):
        if isinstance(row, dict) and day_no(row.get('date')) is not None and pos(row.get('close')):
            inx.setdefault(row['date'], row['close'])
    by_ind = {}
    for asset in rows_of(us_dir / 'input.json', 'assets', 'us/input.json'):
        if not (isinstance(asset, dict) and isinstance(asset.get('industry'), str)):
            continue
        cl = {}
        for p in asset.get('prices') if isinstance(asset.get('prices'), list) else []:
            if isinstance(p, dict) and isinstance(p.get('date'), str) and pos(p.get('close')):
                cl.setdefault(p['date'], p['close'])
        by_ind.setdefault(asset['industry'], []).append(cl)
    return (sorted(inx), inx, by_ind), notes


def us_side(name, us, D, F, T):
    """9 — 짝 없음 None · 아니면 {ind, b, e, n, i, m, x}(i · m · x = 셈 그대로 비율 · 모름이면 None)
       b · e = 날짜 ≤ D[F] · ≤ D[T] 인 마지막 미국 날(못 찾으면 None) — 없거나 5날(달력) 넘게 앞이면 모름
       회사 = industry 가 짝 미국 업종 가운데 하나인 회사 모두 · n = b · e 종가가 다 있는 회사 수(날을 못 찾으면 0) · n < 3 이면 모름
       지수 = b ~ e 미국 날 이웃한 두 날마다 두 날 종가가 다 있는 회사의 r = 뒤 ÷ 앞 − 1(|r| ≥ 0.35 면 그날 그 회사 뺌) 평균(없으면 0)을
       이어 곱함 → 1 + i · m = INX(e) ÷ INX(b) − 1 · x = (1 + i) ÷ (1 + m) − 1"""
    inds = US_OF.get(name)
    if inds is None:
        return None
    days, inx, by_ind = us
    kb, ke = bisect_right(days, D[F]) - 1, bisect_right(days, D[T]) - 1
    b, e = (days[kb] if kb >= 0 else None), (days[ke] if ke >= 0 else None)
    comps = [cl for u in inds for cl in by_ind.get(u, [])]
    n = sum(1 for cl in comps if b in cl and e in cl)  # 날을 못 찾으면(None) 0
    out = {'ind': list(inds), 'b': b, 'e': e, 'n': n, 'i': None, 'm': None, 'x': None}
    if (b is None or e is None or day_no(D[F]) - day_no(b) > US_OLD or day_no(D[T]) - day_no(e) > US_OLD
            or n < US_MIN):
        return out
    idx, S = 1.0, days[kb:ke + 1]
    for d0, d1 in zip(S, S[1:]):
        rs = [r for r in (cl[d1] / cl[d0] - 1 for cl in comps if d0 in cl and d1 in cl) if abs(r) < JUMP]
        idx *= 1 + (math.fsum(rs) / len(rs) if rs else 0.0)
    i, m = idx - 1, inx[e] / inx[b] - 1
    out.update(i=i, m=m, x=(1 + i) / (1 + m) - 1)
    return out


def us_file(r):
    """9 의 파일 꼴(calc.us) — 짝 없음 None · 아니면 {ind, b, e, n, i, m, x}(i · m · x = % 두 자리 · 모름이면 None)"""
    if r is None:
        return None
    return {'ind': r['ind'], 'b': r['b'], 'e': r['e'], 'n': r['n'],
            **{f: None if r[f] is None else pct2(r[f]) for f in ('i', 'm', 'x')}}


def light_us(r, g=None):
    """불빛 9 — x(% 두 자리) > 0 = 켜짐 · 아니면 꺼짐 · 짝 없음 · 모름 = 모름
       g(파일 calc.us)의 x 가 바르게 반올림한 값이면 그 값으로 가름(꼭 가운데에서 갈리지 않게)"""
    if r is None or r['x'] is None:
        return 'q'
    return 'on' if snap(r['x'] * 10000, 100, g.get('x') if isinstance(g, dict) else None) > 0 else 'off'


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


def near(u, got, k):
    """파일 값 got 이 1/k 칸 꼴이고 셈 그대로 값(u = 값 × k)에서 반 칸(+ 1e-9) 안 — 바르게 반올림한 값(꼭 가운데면 둘 다)"""
    if not num(got):
        return False
    g = got * k
    return abs(g - round(g)) < 1e-6 and abs(g - u) <= 0.5 + 1e-9


def snap(u, k, got):
    """가름에 쓰는 반올림 값(1/k 칸 정수) — 파일 값이 바르게 반올림한 값이면 그 값 · 아니면 다시 센 값(u)의 JS 반올림"""
    return round(got * k) if near(u, got, k) else js_round(u)


def sgn(v):
    return (v > 0) - (v < 0)


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

    def rnd(self, field, u, k, got):
        """반올림 칸(8 · 9) — u = 셈 그대로 값 × k · 파일 값이 1/k 칸으로 바르게 반올림한 값이면 맞음"""
        self.check(field, js_round(u) / k, got, near(u, got, k))


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
    if day_no(as_of) is None or day_no(frm) is None:  # 8 · 9 는 달력 날 차이를 셈
        raise InputError(f'날짜 줄(dates) 꼴이 다름(YYYY-MM-DD 아님 · {frm} · {as_of}) — {data / "days.json"}')

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
    notes = [] if agenda is not None else ['agenda.json 없음(좋은 소식은 모름)']
    fxr, why = fx_rate_of(site / 'next' / 'data' / 'fx-rate.json')  # 8 — 없거나 꼴이 다르면 None(두 쪽 모두 모름)
    notes += [why] if why else []
    us, why = us_of(Path(a.us))                                      # 9 — 없으면 빈 것(짝 있는 업종도 모름)
    notes += why
    dump = [] if a.dump else None

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
        exp.append({'n': name, 'x': row['x'], 'i_raw': i_raw, 'members': members, 'I': I})  # I = 8 에도 씀
    if dropped:  # 결정표 2 · 7 — 확인이 어긋나면 파일을 만들지 않음(flow_why.mjs 는 던지고 build_data.mjs 가 파일을 지움 · 화면은 「왜? 아직 못 셌어요.」)
        cmp.check('x 확인 · 회사 수(어긋나면 파일이 없어야)', '파일 없음', dropped, False)
    f_inds = got.get('inds') if isinstance(got.get('inds'), list) else []
    cmp.eq('inds[].n', [e['n'] for e in exp], [r.get('n') if isinstance(r, dict) else r for r in f_inds])

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

        # ⑥ 8 환율과 금리 — 쪽마다 calc.fx · calc.rate(모름 null)
        fx_raw = {s: fx_side(s, fxr[s], dates, e['I'], M, F, T) if fxr else None for s in FX_PLACES}
        fxw = {}
        for s, r in fx_raw.items():
            g = calc.get(s)
            want = fxw[s] = fx_file(s, r, g)
            if want is None or not isinstance(g, dict):
                cmp.eq(f'{tag} · calc.{s}', want, g)
                continue
            cmp.eq(f'{tag} · calc.{s} 칸 이름', sorted(FX_KEYS), sorted(g))
            for f in ('da', 'db', 'a', 'b', 'n', 'clear', 'moved', 'aligned'):
                cmp.eq(f'{tag} · calc.{s}.{f}', want[f], g.get(f))
            km = 10 ** FX_PLACES[s]
            cmp.rnd(f'{tag} · calc.{s}.move', r['move'] * km, km, g.get('move'))
            cmp.rnd(f'{tag} · calc.{s}.beta', r['beta'] * 10000, 10000, g.get('beta'))
            cmp.rnd(f'{tag} · calc.{s}.t', r['t'] * 100, 100, g.get('t'))

        # ⑥ 9 다른 나라 — calc.us(짝 없음 null · 모름이면 i · m · x null)
        us_raw = us_side(name, us, dates, F, T)
        gu, want = calc.get('us'), us_file(us_raw)
        if want is None or not isinstance(gu, dict):
            cmp.eq(f'{tag} · calc.us', want, gu)
        else:
            cmp.eq(f'{tag} · calc.us 칸 이름', sorted(want), sorted(gu))
            for f in ('ind', 'b', 'e', 'n'):
                cmp.eq(f'{tag} · calc.us.{f}', want[f], gu.get(f))
            for f in ('i', 'm', 'x'):
                if us_raw[f] is None:
                    cmp.eq(f'{tag} · calc.us.{f}', None, gu.get(f))
                else:
                    cmp.rnd(f'{tag} · calc.us.{f}', us_raw[f] * 10000, 100, gu.get(f))

        lights = [light_money(money['1']), light_money(money['2']), light_money(money['3']),
                  'q' if good is None else ('on' if good else 'off'),
                  'q' if best is None else ('on' if best[1] > 0 else 'off'),
                  'q' if breadth['tot'] == 0 else ('on' if breadth['up'] * 2 >= breadth['tot'] else 'off'),
                  'on' if e['i_raw'] > m_raw else 'off', light_fx(fxw['fx'], fxw['rate']), light_us(us_raw, gu),
                  light_hit(pol), light_hit(abr)]
        cmp.eq(f'{tag} · lights', lights, fr.get('lights'))
        if dump is not None:  # 숨은 --dump — 파일 값을 보지 않은 다시 센 값만(반올림 · 가름 모두 다시 센 값으로)
            own = {s: fx_file(s, r) for s, r in fx_raw.items()}
            dump.append({'n': name,
                         'lights': lights[:7] + [light_fx(own['fx'], own['rate']), light_us(us_raw)] + lights[9:],
                         'calc': {**own, 'us': us_file(us_raw)},
                         'raw': {**{s: None if r is None else {f: r[f] for f in ('move', 'beta', 't')}
                                    for s, r in fx_raw.items()},
                                 'us': None if us_raw is None else {f: us_raw[f] for f in ('i', 'm', 'x')}}})
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
    return cmp, as_of, len(exp), notes, None if dump is None else {'asOf': as_of, 'from': frm, 'inds': dump}


def main():
    ap = argparse.ArgumentParser(description='돈 흐름 칸 · 까닭 열한 가지 따로 세기 — flow-why.json 과 맞댐')
    ap.add_argument('--site', default='site', help='사이트 폴더(기본 site)')
    ap.add_argument('--view', default='public/data/atlas11/view', help='판 자료 폴더(기본 public/data/atlas11/view)')
    ap.add_argument('--us', default='public/data/atlas11/us', help='미국 자료 폴더(기본 public/data/atlas11/us · input.json · market/INX.json)')
    ap.add_argument('--file', help='맞댈 파일(기본 <site>/next/data/flow-why.json)')
    ap.add_argument('--quiet', action='store_true', help='모두 맞으면 아무것도 안 찍음')
    # 숨은 칸 — 파일에 있는 업종마다 다시 센 calc.fx · calc.rate · calc.us · 불빛(과 반올림 전 값)을 JSON 으로 stdout 에(맞대기 글은 stderr 로)
    ap.add_argument('--dump', action='store_true', help=argparse.SUPPRESS)
    a = ap.parse_args()
    try:
        cmp, as_of, k, notes, dump = run(a)
    except InputError as e:
        print(f'flow_why_verify: 입력 문제 — {e}', file=sys.stderr)
        sys.exit(2)
    show = lambda v: json.dumps(v, ensure_ascii=False)
    out = sys.stderr if a.dump else sys.stdout
    if dump is not None:
        print(json.dumps(dump, ensure_ascii=False, indent=1))
    note = ''.join(f' · {x}' for x in notes)
    if cmp.bad:
        for field, exp, got in cmp.bad:
            print(f'틀림 · {field} · 다시 센 값 {show(exp)} · 파일 값 {show(got)}', file=out)
        print(f'flow_why_verify: 틀림 {len(cmp.bad)}곳 · {as_of} · 업종 {k} · 셈 칸 {cmp.n}{note}', file=out)
        sys.exit(1)
    if not a.quiet:
        print(f'flow_why_verify: 맞음 · {as_of} · 업종 {k} · 셈 칸 {cmp.n}{note}', file=out)
    sys.exit(0)


if __name__ == '__main__':
    main()
