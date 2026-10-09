#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ATLAS 11 · 소거 1판 따로 다시 세기(L1 · 원자료에서 다시 판정) — 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 4b
  판 읽기 lens.elim(atlas11-elim-1 · lib/atlas11/elim.mjs)의 1단계 검사를 판 읽기 값 없이 원자료로 파이썬에서 다시 판정해
  회사마다 · 검사마다 맞댄다(다른 언어 · 같은 글 명세 = L1). elim.mjs · lens.mjs · cand.mjs 의 코드 · 정규식은 가져오지 않고 글 명세로 다시 적음.
  원자료
    한국: public/data/input.json(종가 · 결산 quality.op/net · calendar.sessions) + public/data/rolling-calendar.json(sessions)
          · public/data/atlas11/view/agenda.json(byCode[종목].disclosures — 제목 · 낸 시각)
          · 곁 검사(판정은 안 바꿈): 판이 쓴 관측 묶음(manifest.market.record)의 공시 원문 — 일정표에 빠진 위험 공시 · 목록이 꽉 차 30일을 다 못 본 회사
    미국: public/data/atlas11/us/input.json(종가 · 결산 quality.metrics.op/net · calendar.sessions) — 회사 공시 원문 없음
  규칙(elim_verify-1) — 거래일 = 두 달력을 합친 날(미국은 입력 달력) · 늦음 = 마지막 종가 뒤부터 기준일까지 거래일 수
    close   기준일 종가 있음 → pass · 1~2거래일 늦음 → hold · 3거래일 이상 늦음 · 종가 없음 → na(오래된 가격 칸이 판정)
    stale   3거래일 이상 늦음(2거래일 넘음) · 종가 없음 → hold · 아니면 pass
    ca      한국만 — 마지막 20거래일 안 종가마다 바로 앞 종가 대비 |b ÷ a − 1| > 30% → hold · 아니면 pass
            (분수로 정확히 셈 — 딱 30% 는 제한폭 안 · 사이에 빈 거래일이 있어도 바로 앞 종가와 견줌)
    history 기준일까지 거래일 종가 272개 이상 → pass · 아니면 hold
    profit  영업이익 · 순이익 둘 다 숫자 → 둘 다 0 보다 크면 pass · 아니면 out / 하나라도 없음 → hold
    risk    한국 — 공시 자료 없음 → hold · 기준일 30일 전(서울 날짜)부터 기준일 15:30(서울 · 포함)까지 낸 공시 제목에 위험 낱말
            (RISK_WORDS · 이 회사와 다른 이름의 우선주 「(…우)」 공시는 뺌) → out · 없으면 pass / 미국 — 공시 원문 없음 → hold
  맞대기: 같은 판정 → pass · 다름(판 읽기 줄 · 칸이 없어도) → fail · 판 읽기에 소거 칸이 없음 → notRun · 다시 판정이 깨짐 → error
  쓰는 법(저장소 맨 위): python3 -I scripts/atlas11/verify/elim_verify.py --lens <lens.json> --place kr|us [--run-id <회차 ID>] [--out <파일>] [--root <저장소>]
    기본 --out = reports/atlas11/rounds/<회차 ID>.verify.json · 파일이 있으면 `elim` 칸만 바꿈(그 안에서도 이 판 몫만 — 한국 · 미국을 차례로 돌림)
    끝값 0 = 모두 맞음 · 1 = 다름 · 오류 · 못 돎 · 문제 있음 · 2 = 쓰는 법 · 파일 오류(아무것도 쓰지 않음)
"""
import argparse, hashlib, json, math, os, re, sys, tempfile
from bisect import bisect_left, bisect_right
from datetime import datetime, timedelta, timezone
from fractions import Fraction
from pathlib import Path

VERSION = 'elim_verify-1'
STEP, LEVEL = '⑦', 'L1'
KST = timezone(timedelta(hours=9))
STALE_SESSIONS = 2          # 2거래일 넘게 늦으면 오래된 가격
CA_DAYS = 20                # 기업행사 — 기준일까지 마지막 20거래일
CA_LIMIT = Fraction(3, 10)  # 한국 하루 가격 제한폭 ±30% — 넘으면 가격 기준이 바뀐 날
HISTORY_DAYS = 272          # 분석 입력 — 1년(252거래일) + 20거래일 전 1년 추세(20)
RISK_DAYS = 30              # 위험 공시 — 기준일 30일 전(달력 날)부터
CLOSE_AT = (15, 30)         # 한국 장 마감(서울) — 이 시각까지 낸 공시만(포함)
MAX_MISMATCH = 50
ORDER = ('close', 'stale', 'ca', 'history', 'profit', 'risk')
CHECKS = {'kr': ORDER, 'us': tuple(c for c in ORDER if c != 'ca')}
PLACES = ('kr', 'us')
NOT_COMPARED = {
    'liquidity': '맞대지 않음 — 늘 na(거래대금 자료 없음)',
    'paths': '맞대지 않음 — 2단계(몬테카를로 따로 세기 mc_verify 몫)',
    'converge': '맞대지 않음 — 2단계(몬테카를로 따로 세기 mc_verify 몫)',
    'tail': '맞대지 않음 — 2단계 · 표시만',
}
NOT_COMPARED_US = {'ca': '맞대지 않음 — 한국만(미국은 하루 가격 제한폭 없음)'}
RULES = {
    'close': '기준일 종가 있음 → pass · 1~2거래일 늦음 → hold · 3거래일 이상 늦음 · 종가 없음 → na(오래된 가격 칸이 판정)',
    'stale': '3거래일 이상 늦음 · 종가 없음 → hold · 아니면 pass',
    'ca': '한국만 · 마지막 20거래일 안 하루 변화(바로 앞 종가 대비)가 30% 넘음(분수로 정확히 · 딱 30%는 안 넘음) → hold · 아니면 pass',
    'history': f'기준일까지 거래일 종가 {HISTORY_DAYS}개 이상 → pass · 아니면 hold',
    'profit': '영업이익 · 순이익 둘 다 숫자: 둘 다 > 0 → pass · 아니면 out / 하나라도 없음 → hold',
    'risk': f'한국 — 공시 자료 없음 → hold · 기준일 {RISK_DAYS}일 전 ~ 기준일 15:30(서울 · 포함) 위험 낱말 공시(다른 이름 우선주 뺌) → out · 없으면 pass / 미국 → hold',
}
# 위험 공시 낱말 — cand.mjs EXCLUDE_RE 를 가져오지 않고 글 목록(매매거래정지 · 관리종목 · 상장폐지 · 불성실공시 · 감사의견 · 회생 · 횡령 · 배임 ·
#   투자위험 · 투자경고종목 지정(지정예고는 아님) · 공급계약 해지)에서 다시 적음 · 낱말 사이 빈칸은 있어도 없어도 같은 낱말
RISK_WORDS = (
    r'매매\s*거래\s*정지', r'관리\s*종목', r'상장\s*폐지', r'불성실\s*공시', r'감사\s*의견', r'회생', r'횡령', r'배임', r'투자\s*위험',
    r'투자\s*경고\s*종목\s*지정(?!\s*예고)',  # 「지정」 · 「지정해제」는 맞음 · 「지정예고」 · 「지정 예고」는 아님
    r'공급\s*계약\s*해지',
)
RISK_RE = re.compile('|'.join(RISK_WORDS))
PREF_TAIL = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')  # 「…우B」 · 「…2우B」 끝 글자
RAW = {
    'kr': {'input': 'public/data/input.json', 'calendar': 'public/data/rolling-calendar.json', 'agenda': 'public/data/atlas11/view/agenda.json',
           'manifest': 'public/data/atlas11/view/manifest.json', 'snapLatest': 'reports/atlas11/context/latest.json'},
    'us': {'input': 'public/data/atlas11/us/input.json', 'calendar': None, 'agenda': None, 'manifest': None, 'snapLatest': None},
}
SNAP_RE = re.compile(r'reports/atlas11/context/[\w./-]+\.json')
RUN_ID_RE = re.compile(r'[A-Za-z0-9._-]+')


class Usage(Exception):
    """쓰는 법 · 파일 오류 — 아무것도 쓰지 않고 끝값 2"""


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def fmt(x):
    """값 글 — 정수면 정수 그대로(1,234,000 원이 1.23e+06 으로 바뀌지 않게)"""
    return str(int(x)) if float(x).is_integer() else repr(x)


def read_raw(root, rel):
    """원자료 한 파일 → (값, {file, sha256}) · 못 읽거나 JSON 이 아니면 값 None · info.error"""
    if not rel:
        return None, None
    try:
        b = (root / rel).read_bytes()
    except OSError as e:
        return None, {'file': rel, 'sha256': None, 'error': f'못 읽음({e.__class__.__name__})'}
    info = {'file': rel, 'sha256': hashlib.sha256(b).hexdigest()}
    try:
        return json.loads(b), info
    except ValueError as e:
        return None, {**info, 'error': f'JSON 아님({e})'}


def closes_of(asset):
    """종가 지도(날짜 → 종가) — 날짜 글 · 0 보다 큰 유한한 수만"""
    m = {}
    for p in (asset or {}).get('prices') or []:
        if isinstance(p, dict) and isinstance(p.get('date'), str) and num(p.get('close')) and p['close'] > 0:
            m[p['date']] = p['close']
    return m


def judge_prices(pm, S, as_of, place):
    """close · stale · ca · history → {검사: (판정, 까닭)} · S = 기준일까지 거래일(차례대로)"""
    out = {}
    dts = sorted(d for d in pm if d <= as_of)
    last = dts[-1] if dts else None
    if last is None:
        out['close'] = ('na', f'{as_of}까지 종가 없음 — 오래된 가격 칸이 판정')
        out['stale'] = ('hold', f'{as_of}까지 종가 없음')
    elif last == as_of:
        out['close'] = ('pass', f'기준일 {as_of} 종가 있음')
        out['stale'] = ('pass', f'기준일 {as_of} 종가 있음')
    else:
        lag = len(S) - bisect_right(S, last)  # 마지막 종가 뒤 ~ 기준일 거래일 수
        if lag <= STALE_SESSIONS:
            out['close'] = ('hold', f'마지막 종가 {last} · 기준일보다 {lag}거래일 늦음(1~2거래일)')
            out['stale'] = ('pass', f'마지막 종가 {last} · {lag}거래일 늦음(2거래일 안)')
        else:
            out['close'] = ('na', f'마지막 종가 {last} · {lag}거래일 늦음 — 오래된 가격 칸이 판정')
            out['stale'] = ('hold', f'마지막 종가 {last} · {lag}거래일 늦음(2거래일 넘음)')
    if place == 'kr':
        jumps, edge = [], []
        for d in S[-CA_DAYS:]:
            i = bisect_left(dts, d)
            if d not in pm or i == 0:
                continue
            pd = dts[i - 1]
            a, b = pm[pd], pm[d]
            move, lim = abs(Fraction(b) - Fraction(a)), CA_LIMIT * Fraction(a)
            gap = bisect_left(S, d) - bisect_right(S, pd)  # 두 종가 사이 빈 거래일
            note = f'{d} 하루 {(b / a - 1) * 100:+.1f}%({pd} {fmt(a)} → {fmt(b)}{f" · 사이 빈 거래일 {gap}" if gap > 0 else ""})'
            if move > lim:
                jumps.append(note)
            elif move == lim:
                edge.append(note)
        if jumps:
            out['ca'] = ('hold', f'{jumps[0]} — 30% 넘음' + (f' 외 {len(jumps) - 1}번' if len(jumps) > 1 else ''))
        else:
            out['ca'] = ('pass', f'마지막 {CA_DAYS}거래일 30% 넘는 하루 없음' + (f' · {edge[0]} 는 딱 30%(제한폭 안 · 넘지 않음)' if edge else ''))
    # 분석 입력 — 1년 추세 두 개(오늘 · 20거래일 전)의 기준 날 다섯 곳 종가가 다 있어야(오늘 · 20 · 40 · 252 · 272거래일 전)
    #   2026-10-10 계획 검토 4번: 종가 개수가 아니라 기준 날(후보 셈 trendOf 와 같은 뜻 · 코드는 따로 적음)
    k = len(S) - 1 if S and S[-1] == as_of else None
    need = [0, 20, 40, 252, HISTORY_DAYS]
    if k is None:
        out['history'] = ('hold', f'기준일 {as_of} 이 거래일 달력에 없음')
    elif as_of not in pm:
        out['history'] = ('hold', '그날 종가가 없어 1년 추세를 셀 수 없음')
    else:
        miss = [b for b in need if k - b < 0 or S[k - b] not in pm]
        out['history'] = ('hold', f'기준 날 종가 없음: {", ".join(f"{b}거래일 전" for b in miss)}') if miss else ('pass', '기준 날 다섯 곳(오늘 · 20 · 40 · 252 · 272거래일 전) 종가 있음')
    return out


def judge_profit(asset):
    """흑자 — 결산 quality(미국은 quality.metrics 가 앞섬)의 영업이익 · 순이익"""
    q = (asset or {}).get('quality')
    if not isinstance(q, dict):
        return ('hold', '결산 자료 없음')
    f = dict(q)
    if isinstance(q.get('metrics'), dict):
        f.update(q['metrics'])
    op, net, fy = f.get('op'), f.get('net'), f.get('fiscalYear')
    if not (num(op) and num(net)):
        return ('hold', f'결산 모자람(영업이익 {op!r} · 순이익 {net!r})')
    if op > 0 and net > 0:
        return ('pass', f'{fy} 결산 영업이익 {fmt(op)} · 순이익 {fmt(net)} — 둘 다 흑자')
    return ('out', f'{fy} 결산 영업이익 {fmt(op)} · 순이익 {fmt(net)} — 적자 있음')


def when(s):
    """낸 시각(시간대 있음) — 시간대가 없으면 서울로 봄 · 날짜만이면 그날 0시 · 못 읽으면 None"""
    if not isinstance(s, str) or not s.strip():
        return None
    try:
        t = datetime.fromisoformat(s.strip())
    except ValueError:
        return None
    return t if t.tzinfo else t.replace(tzinfo=KST)


def pref_name(title, own):
    """제목 끝 괄호 속 우선주 이름(「…(삼성전기우)」) — 이 회사 이름과 다르면 그 이름 · 아니면 None"""
    t = str(title).rstrip()
    i = t.rfind('(')
    if not t.endswith(')') or i < 0:
        return None
    inner = t[i + 1:-1]
    if not inner or ')' in inner:
        return None
    if not (inner.endswith('우') or (len(inner) >= 2 and inner[-2] == '우' and inner[-1] in PREF_TAIL)):
        return None
    return inner if inner != own else None


def window_of(as_of):
    """위험 공시 창 — (시작 서울 날짜 · 끝 시각)"""
    d = datetime.strptime(as_of, '%Y-%m-%d')
    return (d - timedelta(days=RISK_DAYS)).date(), d.replace(hour=CLOSE_AT[0], minute=CLOSE_AT[1], tzinfo=KST)


def risk_hits(items, name, start, cutoff):
    """창 안 위험 낱말 공시 → (맞은 것 [(시각, 제목)] 시각 차례, 시각을 모르는 것 [제목])"""
    hits, unknown = [], []
    for d in items or []:
        if not isinstance(d, dict):
            continue
        title = str(d.get('title') or '')
        if not RISK_RE.search(title) or pref_name(title, name):
            continue
        t = when(d.get('publishedAt'))
        if t is None:
            unknown.append(title)
        elif t.astimezone(KST).date() >= start and t <= cutoff:
            hits.append((t, title))
    return sorted(hits, key=lambda x: x[0]), unknown


def judge_risk(place, entry, name, start, cutoff, agenda_err):
    if place != 'kr':
        return ('hold', '미국 판 — 회사 공시 원문 자료 없음')
    if agenda_err:
        return ('hold', f'공시 자료 파일을 못 읽음({agenda_err})')
    if not isinstance(entry, dict):
        return ('hold', '일정표에 이 회사 공시 칸 없음')
    if '공시' in (entry.get('missing') or []):
        return ('hold', '공시 자료를 못 모음(일정표 missing)')
    hits, unknown = risk_hits(entry.get('disclosures'), name, start, cutoff)
    if hits:
        t, title = hits[-1]
        return ('out', f'{t.astimezone(KST):%Y-%m-%d %H:%M} 「{title}」' + (f' 외 {len(hits) - 1}건' if len(hits) > 1 else ''))
    if unknown:
        return ('hold', f'낸 시각을 모르는 위험 낱말 공시 {len(unknown)}건 — 「{unknown[0]}」')
    return ('pass', f'{start} ~ {cutoff:%Y-%m-%d %H:%M} 위험 공시 없음')


def source_check(root, place, start, cutoff, agenda_by, names, risk_v):
    """곁 검사(판정은 안 바꿈) — 관측 묶음 공시 원문과 일정표를 맞댐: 일정표에 빠진 위험 공시 · 목록이 꽉 차 30일을 다 못 본 회사
       → (보고 칸, 문제 줄 — 빠진 위험 공시로 판정이 바뀌는 것만)"""
    P = RAW[place]
    man, _ = read_raw(root, P['manifest'])
    rec = ((man or {}).get('market') or {}).get('record')
    if not (isinstance(rec, str) and SNAP_RE.fullmatch(rec)):
        lat, _ = read_raw(root, P['snapLatest'])
        rec = (lat or {}).get('file')
    if not (isinstance(rec, str) and SNAP_RE.fullmatch(rec)):
        return {'error': '관측 묶음 위치를 못 찾음'}, []
    snap, info = read_raw(root, rec)
    if not isinstance(snap, dict):
        return {**(info or {}), 'error': (info or {}).get('error', '모양이 다름')}, []
    lists = [d for d in snap.get('disclosures') or [] if isinstance(d, dict) and str(d.get('code')) in names]
    cap = max((len(d.get('items') or []) for d in lists), default=0)
    missing, short = [], []
    for d in lists:
        code = str(d.get('code'))
        items = [i for i in d.get('items') or [] if isinstance(i, dict)]
        raw, _ = risk_hits(items, names[code], start, cutoff)
        seen, _ = risk_hits(((agenda_by or {}).get(code) or {}).get('disclosures'), names[code], start, cutoff)
        for t, title in raw:  # 같은 시각 · 또는 같은 날 줄인 제목(일정표는 회사 이름 앞머리를 떼고 같은 날 같은 제목을 한 줄로 묶음)
            if not any(t == u or (t.astimezone(KST).date() == u.astimezone(KST).date() and s in title) for u, s in seen):
                missing.append({'code': code, 'name': names[code], 'publishedAt': t.isoformat(), 'title': title, 'changes': risk_v.get(code) == 'pass'})
        ts = [t for t in (when(i.get('publishedAt')) for i in items) if t is not None]
        if cap and len(items) >= cap and ts and min(ts).astimezone(KST).date() > start:
            short.append({'code': code, 'name': names[code], 'items': len(items), 'earliest': min(ts).astimezone(KST).isoformat(timespec='seconds')})
    problems = [f'일정표에 빠진 위험 공시로 판정이 바뀜 — {x["code"]} {x["publishedAt"]} 「{x["title"]}」(관측 묶음 원문에는 있음)' for x in missing if x['changes']]
    return {**info, 'day': snap.get('day'), 'cap': cap, 'missingInAgenda': missing, 'shortWindow': short,
            'note': '판정은 일정표(agenda.json)로만 함 — 이 칸은 관측 묶음 원문과의 차이를 보이기만(판정이 바뀌는 것만 문제로 셈) · shortWindow = 공시 목록이 꽉 차(cap) 창 시작까지 못 닿은 회사'}, problems


def lens_rows(lens, problems):
    """판 읽기 소거 줄 → {종목: {검사 id: 칸}} · 소거 칸이 없으면 None"""
    e = lens.get('elim')
    if not isinstance(e, dict) or not isinstance(e.get('rows'), list):
        problems.append('lens.elim 없음 — 맞댈 판정이 없음(모두 notRun)')
        return None
    rows = {}
    for r in e['rows']:
        if not isinstance(r, dict) or r.get('code') is None:
            continue
        code = str(r['code'])
        if code in rows:
            problems.append(f'lens.elim 에 같은 종목 줄이 둘 — {code}(앞 줄로 맞댐)')
            continue
        cs = {}
        for c in r.get('checks') or []:
            if isinstance(c, dict) and c.get('id') is not None:
                cs.setdefault(str(c['id']), c)
        rows[code] = cs
    return rows


def tally(vals):
    o = {'pass': 0, 'hold': 0, 'out': 0, 'na': 0}
    for v in vals:
        k = v if v in o else ('missing' if v is None else 'other')
        o[k] = o.get(k, 0) + 1
    return o


def verify_place(root, lens, lens_info, place, run_id, at):
    """한 판 → (판 묶음, 검사 줄)"""
    problems = []
    as_of = lens['asOf']
    P = RAW[place]
    inp, inp_info = read_raw(root, P['input'])
    cal, cal_info = read_raw(root, P['calendar'])
    agenda, ag_info = read_raw(root, P['agenda'])
    inp_err = None if isinstance(inp, dict) else (inp_info or {}).get('error') or '입력 모양이 다름'
    if inp_err:
        problems.append(f'{P["input"]} {inp_err} — 모든 검사를 다시 판정하지 못함')
        inp = {}
    if cal_info and cal_info.get('error'):
        problems.append(f'{P["calendar"]} {cal_info["error"]} — 입력 달력만 씀')
    ag_err = None
    if place == 'kr':
        ag_err = (ag_info or {}).get('error') or (None if isinstance(agenda, dict) and isinstance(agenda.get('byCode'), dict) else '일정표 모양이 다름')
        if ag_err:
            problems.append(f'{P["agenda"]} {ag_err} — 위험 공시를 모두 보류로 봄')
    agenda_by = agenda['byCode'] if place == 'kr' and not ag_err else None
    assets = {}
    for a in inp.get('assets') or []:
        if isinstance(a, dict) and a.get('code') is not None:
            assets.setdefault(str(a['code']), a)
    ses = set()
    for src in ((inp.get('calendar') or {}).get('sessions'), (cal or {}).get('sessions') if isinstance(cal, dict) else None):
        ses.update(d for d in src or [] if isinstance(d, str))
    sessions = sorted(ses)
    if not inp_err and as_of not in ses:
        problems.append(f'기준일 {as_of} 이 거래일 달력에 없음')
    S = sessions[:bisect_right(sessions, as_of)]
    start, cutoff = window_of(as_of)

    rows = lens_rows(lens, problems)
    e = lens['elim'] if isinstance(lens.get('elim'), dict) else {}
    if e:
        if e.get('schema') != 'atlas11-elim-1':
            problems.append(f'lens.elim.schema 가 {e.get("schema")!r}(atlas11-elim-1 아님)')
        if e.get('asOf') not in (None, as_of):
            problems.append(f'lens.elim.asOf {e.get("asOf")} ≠ lens.asOf {as_of} — lens.asOf 로 다시 판정')
        if e.get('place') not in (None, place):
            problems.append(f'lens.elim.place {e.get("place")} ≠ {place}')
    # 맞댈 종목 = 판 읽기 종목 ∪ 소거 줄(판이 고른 회사) — 판정 재료는 원자료에서만
    universe = list(dict.fromkeys([str(s['code']) for s in lens.get('stocks') or [] if isinstance(s, dict) and s.get('code') is not None] + list(rows or {}))) or list(assets)
    names = {c: (assets.get(c) or {}).get('name') for c in universe}
    no_raw = [c for c in universe if c not in assets]
    if no_raw and not inp_err:
        problems.append(f'원자료(입력)에 없는 종목 {len(no_raw)}곳 — 자료 없음으로 판정({", ".join(no_raw[:5])})')

    inputs_for = {c: inp_info for c in CHECKS[place]}
    if place == 'kr':
        inputs_for['risk'] = ag_info
    checks, mism, risk_v = [], [], {}
    mine = {c: [] for c in CHECKS[place]}
    theirs = {c: [] for c in CHECKS[place]}
    for code in universe:
        a = assets.get(code)
        try:
            if inp_err:
                raise RuntimeError(f'{P["input"]} {inp_err}')
            v = judge_prices(closes_of(a), S, as_of, place)
            v['profit'] = judge_profit(a)
            v['risk'] = judge_risk(place, (agenda_by or {}).get(code), names.get(code), start, cutoff, ag_err)
        except Exception as x:  # 다시 판정이 깨짐 → 그 회사 칸 모두 error
            v = {k: (None, f'다시 판정 오류: {x.__class__.__name__}: {x}') for k in CHECKS[place]}
        risk_v[code] = v['risk'][0]
        for chk in CHECKS[place]:
            exp, why = v[chk]
            lc = rows.get(code, {}).get(chk) if rows is not None else None
            val = lc.get('verdict') if isinstance(lc, dict) else None
            res = 'error' if exp is None else 'notRun' if rows is None else 'pass' if val == exp else 'fail'
            mine[chk].append(exp)
            if rows is not None:
                theirs[chk].append(val)
            ii = inputs_for[chk] or {}
            checks.append({'id': f'{code}:{chk}', 'step': STEP, 'level': LEVEL, 'target': code, 'version': VERSION,
                           'input': {'file': ii.get('file'), 'sha256': ii.get('sha256')}, 'expect': exp, 'result': res, 'value': val, 'at': at, 'place': place})
            if res in ('fail', 'error'):
                m = {'id': f'{code}:{chk}', 'place': place, 'target': code, 'name': names.get(code), 'check': chk, 'expect': exp, 'value': val, 'result': res, 'why': why}
                if rows is not None:
                    m['lens'] = ('판 읽기 소거 줄 없음' if code not in rows else '판 읽기 줄에 이 검사 칸 없음' if lc is None
                                 else str(lc.get('value') if lc.get('value') is not None else lc.get('data') or '')[:160])
                mism.append(m)
    summary = {'made': len(checks), 'ran': sum(c['result'] in ('pass', 'fail') for c in checks), 'pass': sum(c['result'] == 'pass' for c in checks),
               'fail': sum(c['result'] == 'fail' for c in checks), 'error': sum(c['result'] == 'error' for c in checks), 'notRun': sum(c['result'] == 'notRun' for c in checks)}
    src = None
    if place == 'kr' and not ag_err and not inp_err:
        src, more = source_check(root, place, start, cutoff, agenda_by, names, risk_v)
        problems += more
    raw_only = [c for c in assets if c not in names]
    block = {'place': place, 'asOf': as_of, 'runId': run_id, 'at': at,
             'lens': {**lens_info, 'schema': e.get('schema'), 'rules': e.get('rules'), 'asOf': e.get('asOf'), 'at': e.get('at'), 'calibrated': e.get('calibrated'), 'counts': e.get('counts')},
             'inputs': [x for x in (inp_info, cal_info, ag_info) if x],
             'window': {'risk': {'from': str(start), 'to': cutoff.isoformat(timespec='minutes')}, 'ca': S[-CA_DAYS:][:1] + S[-1:], 'sessions': len(S)},
             'rules': {k: RULES[k] for k in CHECKS[place]}, 'compared': list(CHECKS[place]), 'notCompared': {**NOT_COMPARED, **(NOT_COMPARED_US if place == 'us' else {})},
             'universe': {'stocks': len(universe), 'noRaw': no_raw[:20], 'rawOnly': raw_only[:20], 'nRawOnly': len(raw_only)},
             'tally': {k: tally(vs) for k, vs in mine.items()}, 'lensTally': {k: tally(vs) for k, vs in theirs.items()} if rows is not None else None,
             'summary': summary, 'nMismatches': len(mism), 'mismatches': mism[:MAX_MISMATCH], 'sources': src, 'problems': problems}
    return block, checks


def merge_elim(old, block, checks, at, run_id):
    """verify 파일의 elim 칸 — 이 판 몫만 바꿈(다른 판 몫은 그대로) · 요약 · 다른 곳 목록은 판을 합쳐 다시 셈"""
    o = old if isinstance(old, dict) and old.get('version') == VERSION and isinstance(old.get('places'), dict) else {}
    places = {p: b for p, b in o.get('places', {}).items() if p != block['place'] and isinstance(b, dict)}
    places[block['place']] = block
    order = sorted(places, key=lambda p: (PLACES.index(p) if p in PLACES else len(PLACES), p))
    keep = [c for c in o.get('checks') or [] if isinstance(c, dict) and c.get('place') in places and c.get('place') != block['place']]
    allc = sorted(keep + checks, key=lambda c: order.index(c['place']))  # 판 차례(한국 → 미국) · 판 안 차례는 그대로
    summary = {k: sum(int((places[p].get('summary') or {}).get(k, 0)) for p in order) for k in ('made', 'ran', 'pass', 'fail', 'error', 'notRun')}
    return {'version': VERSION, 'step': STEP, 'level': LEVEL, 'at': at, 'runId': run_id, 'summary': summary,
            'nMismatches': sum(int(places[p].get('nMismatches') or 0) for p in order),
            'mismatches': [m for p in order for m in places[p].get('mismatches') or []][:MAX_MISMATCH],
            'places': {p: places[p] for p in order}, 'checks': allc}


def write_json(path, data):
    """같은 폴더 임시 파일에 쓴 뒤 바꿔 끼움(반쯤 쓴 파일이 남지 않게)"""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix='.elim-', suffix='.tmp', dir=str(path.parent))
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def rel_or_abs(p, root):
    try:
        return str(p.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(p.resolve())


def main(argv):
    ap = argparse.ArgumentParser(description='ATLAS 11 소거 1판 따로 다시 세기(L1 · 원자료에서)')
    ap.add_argument('--lens', required=True, help='판 읽기 lens.json(lens.elim 이 든 것)')
    ap.add_argument('--place', required=True, choices=PLACES)
    ap.add_argument('--run-id', default=None, help='회차 ID — 없으면 lens.mc.runId')
    ap.add_argument('--out', default=None, help='verify 파일 — 기본 reports/atlas11/rounds/<회차 ID>.verify.json')
    ap.add_argument('--root', default=str(Path(__file__).resolve().parents[3]), help='저장소 뿌리(원자료를 읽는 곳)')
    a = ap.parse_args(argv)
    root, lens_path = Path(a.root), Path(a.lens)
    try:
        lb = lens_path.read_bytes()
        lens = json.loads(lb)
    except (OSError, ValueError) as x:
        raise Usage(f'판 읽기 파일을 못 읽음: {lens_path} ({x.__class__.__name__})')
    if not isinstance(lens, dict) or not isinstance(lens.get('asOf'), str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', lens['asOf']):
        raise Usage('판 읽기에 기준일(asOf)이 없음')
    if lens.get('place') not in (None, a.place):
        raise Usage(f'판 읽기 판({lens.get("place")})과 --place {a.place} 가 다름')
    mc = lens.get('mc') if isinstance(lens.get('mc'), dict) else {}
    run_id = a.run_id or (None if mc.get('none') else mc.get('runId'))
    if run_id is not None and not (isinstance(run_id, str) and RUN_ID_RE.fullmatch(run_id)):
        raise Usage(f'회차 ID 모양이 다름: {run_id!r}')
    if a.out:
        out = Path(a.out)
    elif run_id:
        out = root / 'reports/atlas11/rounds' / f'{run_id}.verify.json'
    else:
        raise Usage('--run-id 나 --out 이 필요(lens.mc.runId 도 없음)')
    old = {}
    if out.exists():
        try:
            old = json.loads(out.read_text(encoding='utf-8'))
        except (OSError, ValueError) as x:
            raise Usage(f'verify 파일이 깨져 있음(덮어쓰지 않음): {out} ({x.__class__.__name__})')
        if not isinstance(old, dict):
            raise Usage(f'verify 파일 모양이 다름(덮어쓰지 않음): {out}')
        if run_id and old.get('runId') not in (None, run_id):
            raise Usage(f'verify 파일 회차 ID({old.get("runId")})와 {run_id} 가 다름')
        if isinstance(old.get('elim'), dict) and a.place in (old['elim'].get('places') or {}):
            raise Usage(f'이 판({a.place}) 검사 기록이 이미 있음 — 기록은 고치지 않음(규칙 8 · 새 회차로 다시 셈)')
        run_id = run_id or old.get('runId')
    at = datetime.now(KST).isoformat(timespec='seconds')
    block, checks = verify_place(root, lens, {'file': rel_or_abs(lens_path, root), 'sha256': hashlib.sha256(lb).hexdigest()}, a.place, run_id, at)
    data = {'runId': run_id, **{k: v for k, v in old.items() if k != 'runId'}} if old.get('runId') is None else dict(old)
    data['elim'] = merge_elim(old.get('elim'), block, checks, at, run_id)
    write_json(out, data)
    s = block['summary']
    print(json.dumps({'place': a.place, 'asOf': block['asOf'], 'runId': run_id, 'out': rel_or_abs(out, root), 'summary': s,
                      'tally': block['tally'], 'nMismatches': block['nMismatches'], 'problems': block['problems']}, ensure_ascii=False))
    return 0 if (s['fail'] == 0 and s['error'] == 0 and s['notRun'] == 0 and not block['problems']) else 1


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except Usage as x:
        print(f'elim_verify: {x}', file=sys.stderr)
        sys.exit(2)
