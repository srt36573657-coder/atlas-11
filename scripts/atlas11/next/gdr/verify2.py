#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고도리 칸 셈 gdr-v2 · 따로 세기 (일꾼 G4x · 2026-10-18 · 명령문 order-0015.txt [8] 10)

무엇  site/next/data/gdr.json · gates.json · (있으면) --private 파일을 결정표
      docs/design/godori-2026-10-18/gdr-v2.md(첫 줄 「상태: 완성」)만 보고 날 자료에서 처음부터 다시 세어
      칸마다 맞대 본다. 만든 쪽 코드(pick2.mjs · v2/** · backtest.mjs)는 열지 않는다(따로 세기의 뜻).
      표가 두 뜻으로 읽히는 곳은 G1c 에게 물어 받은 답을 READINGS 에 적었다.
자료  (읽기만) 모음 bundle.json.gz(일봉 [날, 시, 고, 저, 종, 거래량] · finance · integration · list)
      · <site>/mkt.json(회사 · 업종 i · asOf) · <site>/core.json(groups → 큰 업종)
      · --quarters 분기 파일(없으면 「?」) · --lists 목록 파일(없으면 「?」)
쓰는 법
  python3 -I scripts/atlas11/next/gdr/verify2.py                 # 처음 길 · gdr.json · gates.json 맞댐
  python3 -I scripts/atlas11/next/gdr/verify2.py --back          # + gdr-back.json 표본 날 다시 셈(지난 성적)
  python3 -I scripts/atlas11/next/gdr/verify2.py --stress        # + pick2.mjs 를 검은 상자로(node --permission · 임시 폴더만 씀) 일부러 만든 자료
       날 아홉(4/1 · 3/31 · 6/2 · 7/15 · 9/9 · 오늘 · --prev) × 가짜 분기(늘어남 · 같음 · 빈 값 · 끊김 · 예상 줄 · 같은 key · 다른 이름)
       × 목록(다 받음 · 다른 이름 · 하나 못 받음 · DART 꺼짐) + 가짜 모음 하나(큰 업종마다 업종 셋 · 고른 곳 28 · 업종 뺌 · 큰 업종 뺌
       · 비중 3 · 2.5 · 2 · 함께 내린 날 · 경계 값 열: 거래 몰림 · 거래 적음 · 석 달 +5% · +40% · 석 달 빠짐 20% · 오늘 빠짐 15%
       · 5일 +9.99% · +10% · 하루 +15% · 1년 바닥 2배 · 쌍둥이 차례) + 작은 도구 손셈 25
  옵션: --bundle FILE · --site DIR(또는 mkt.json) · --quarters FILE · --lists FILE · --gdr FILE · --gates FILE
        · --private FILE · --prev FILE · --asof YYYY-MM-DD · --out FILE · --back-file FILE · --back-days N · --quiet
        · --stress-dir DIR · --stress-only 이름,이름(빠른 확인) · --no-synth
        · 빈 옵션은 환경 GDR_BUNDLE · GDR_SITE · GDR_PRIVATE · GDR_ASOF 로 채움
  날 k: --asof 가 있으면 그 날 · 없으면 표 §2(사이트 날과 모음 마지막 날 중 앞선 날 이하 마지막 날)
        · 단 gdr.json asOf 가 사이트 날보다 늦은 달력 날이면(장 끝난 뒤 실행 · --asof 로 부름) 그 날(G3x 부탁 · readings)
결과  reports/atlas11/godori/verify2-latest.json(schema godori-verify2-1) — 틀림마다 where · mine · theirs · table · follows
끝 코드  0 틀림 0 · 1 틀림 또는 불변식 어긋남 · 2 gdr.json · gates.json 없음 · 못 읽음 · 3 자료 못 찾음 · 못 읽음
          · 4 이 기계에서 다시 셀 입력이 없음(gdr.json 이 쓴 분기 · 목록 파일이나 장 끝난 뒤 임시 모음이 없음 — 틀림 아님)
분기 · 목록: --quarters · --lists 를 주면 그대로('' = 없음) · 안 주면 gdr.json src 를 따름(null = 없음 → 「?」)
표준 라이브러리만.
"""
import argparse
import bisect
import functools
import gzip
import hashlib
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
SITE_DEFAULT = os.path.join(ROOT, 'site', 'atlas', 'data')
UNIVERSE_JSON = os.path.join(ROOT, 'scripts', 'atlas11', 't365', 'universe.json')
TABLE = os.path.join(ROOT, 'docs', 'design', 'godori-2026-10-18', 'gdr-v2.md')
GDR_DEFAULT = os.path.join(ROOT, 'site', 'next', 'data', 'gdr.json')
GATES_DEFAULT = os.path.join(ROOT, 'site', 'next', 'data', 'gates.json')
BACK_DEFAULT = os.path.join(ROOT, 'site', 'next', 'data', 'gdr-back.json')
QUARTERS_DEFAULT = os.path.join(ROOT, 'reports', 'atlas11', 'godori', 'quarter-latest.json')
LISTS_DEFAULT = os.path.join(ROOT, 'reports', 'atlas11', 'godori', 'kind-latest.json')
OUT_DEFAULT = os.path.join(ROOT, 'reports', 'atlas11', 'godori', 'verify2-latest.json')
PICK2 = os.path.join(ROOT, 'scripts', 'atlas11', 'next', 'gdr', 'pick2.mjs')
KOSPI_FILES = [os.path.join(ROOT, 'reports', 'atlas11', 'probe', 'index-long', 'kospi.json'),
               os.path.join(ROOT, 'public', 'data', 'atlas11', 'market', 'KOSPI.json')]

# ── 결정표 gdr-v2 숫자(표 그대로) ───────────────────────────────────────────────
SCHEMA_GDR, SCHEMA_GATES, SCHEMA_PRIV = 'godori-gdr-2', 'godori-gates-2', 'godori-gdr-2-private'
VERSION = 'gdr-v2'
NEED, PER_IND, PER_IND2, CORR2, BIG_CAP, MAX_PICKS = 5, 1, 2, 0.5, 9, 36
WEIGHTS = (Fraction(3), Fraction(5, 2), Fraction(2))           # §6 3 자리 1~12 · 13~24 · 25~36
GATE_KEYS = ['x', 'g1', 'g2', 'g3', 'g4', 'g5', 'l']
F = Fraction
# §5 문턱 표: key → (문, 값, 한 칸, 빡빡한 쪽 방향(+1 = 값 + 칸 · −1 = 값 − 칸), 단위, 화면 글)
RULES = [
    ('thin', 'x', F(10 ** 9), F(10 ** 8), +1, '원', '하루 10억 원은 오가야 사고팔 때 값이 크게 안 흔들려요.'),
    ('opGrow', 'g1', F(0), F(5), +1, '%', '0% 넘게 = 한 분기 앞보다 줄지 않고 늘었는지만 봐요.'),
    ('salesGrow', 'g1', F(0), F(5), +1, '%', '이익만 늘고 매출이 줄면 아껴서 남긴 것이라 오래 못 가요.'),
    ('quietX', 'g2', F(2), F(1, 5), -1, '배', '2배를 넘으면 이미 사람들이 몰린 뒤라고 봐요.'),
    ('hot5', 'g2', F(10), F(1), -1, '%', '닷새에 10% 넘게 오르면 들뜬 때라 쉬어요.'),
    ('r20', 'g2', F(25), F(5, 2), -1, '%',
     '2023년 말부터 2025년까지 모든 회사의 한 달 오름 중 위 10%가 이 값쯤이에요. 그보다 더 오른 곳은 이미 많이 오른 곳이에요.'),
    ('r60lo', 'g3', F(5), F(1, 2), +1, '%', '석 달에 5%는 올라야 오르는 흐름이 있다고 봐요.'),
    ('r60hi', 'g3', F(40), F(4), -1, '%', '석 달에 40% 넘게 오르면 천천히 오른 게 아니에요.'),
    ('jump', 'g3', F(15), F(3, 2), -1, '%', '하루에 15% 넘게 뛴 날이 있으면 소식 하나로 튄 것일 수 있어요.'),
    ('mdd60', 'g3', F(20), F(2), -1, '%',
     '2023년 말부터 2025년까지 모든 회사의 석 달 가장 깊은 빠짐 가운데값이 이 값쯤이에요. 보통 회사보다 덜 빠진 곳만 봐요.'),
    ('dd0', 'g3', F(15), F(3, 2), -1, '%', '꼭대기에서 15% 넘게 내려와 있으면 오르는 흐름이 꺾였다고 봐요.'),
    ('low2x', 'g4', F(2), F(1, 5), -1, '배', '1년 바닥의 2배가 넘으면 이미 크게 오른 뒤예요.'),
    ('indX', 'g5', F(11, 10), F(11, 100), +1, '배', '업종에 오가는 돈이 10%는 늘어야 돈이 들어온다고 봐요.'),
    ('indMed', 'g5', F(0), F(1), +1, '%', '업종 회사 절반 넘게 올라야 업종이 오르는 중이라고 봐요.'),
]
RULE_KEYS = [r[0] for r in RULES]
TH0 = {r[0]: r[2] for r in RULES}
LOSS_YEARS = 3
MC_IN = '지난 1년과 석 달의 하루 오름을 섞어 뽑아 한 달 뒤를 2,000번씩 셈 · 오른 흐름을 넣은 셈과 뺀 셈 · 넷 중 가장 적은 ~ 가장 많은 번'
MC_RUNS = ((250, 0), (250, 1), (60, 0), (60, 1))              # G1c 답 1: 흐름 넣음 = 0 · 뺌 = 1
WRONG = {
    1: '석 달 {}% 올라 숨이 찰 수 있어.',
    2: '1년 바닥보다 {}배라 더 오르기 버거울 수 있어.',
    3: '업종 거래가 조금만 줄어도 이 문을 못 지나.',
    4: '이익이 다시 줄면 고른 까닭이 사라져.',
    5: '시장 전체가 내리면 같이 내릴 수 있어.',
}
FORBIDDEN_PUBLIC = ('sell', 'half', 'base', 'amt', 'amount', 'money', 'saying', '금액')
FORBIDDEN_TEXT = ('담겠어', '팔겠어')
EPS_TOL = 1e-9
TABLE_LINES = {
    'k': '§2 k = 사이트 날 · 모음 마지막 날 중 앞선 날 이하 마지막 달력 날 · --asof',
    'cal': '§1 달력 = 회사 주식 절반 넘게 일봉 줄이 있는 날',
    'x1': '§3 X1 s20 < 20 × 10억 · 20날 중 빠짐 → x 1 · outThinQ',
    'x2': '§3 X2 k 종가 없음 · k−4 ~ k 거래량 0 · 빈 날',
    'l': '§3 L 목록 · §10',
    'g1': '§4 G1 4분기 합 · grew · 적자 해 없음',
    'g2': '§4 G2 거래 몰림 · 5일 · 한 달 오름 위 끝',
    'g3': '§4 G3 석 달 오름 · 하루 뜀 · 석 달 빠짐 · 오늘 빠짐',
    'g4': '§4 G4 1년 바닥 2배',
    'g5': '§4 G5 업종 거래 · 업종 가운데값',
    'pass': '§4 지남 = x 0 · l 1 · 다섯 문 1',
    'sens': '§5 흔들기 표 · 「?」는 지난 것으로 셈',
    'near': '§5 가까스로 넘음 · 한 칸 빡빡하게',
    'pick': '§6 차례 · 고르기 · 비중',
    'fall3': '§6 세 곳이 함께 내린 날',
    'sell': '§7 팔 선 · 닿은 수',
    'card': '§8 카드 한 줄',
    'mc': '§9 몬테카를로',
    'score': '§9 채점',
    'why': '§11 counts.why',
    'files': '§12 파일 꼴',
    'back': '§2 지난 성적 꼴 · gdr-back.json rules(값 · 바구니 · 모든 회사)',
}
READINGS = [
    '날 k: --asof 가 있으면 그 날 · 없으면 §2 규칙 · gdr.json asOf 가 사이트 날보다 늦은 달력 날이면 그 날(G3x: 장 끝난 뒤 실행은 pick2 --asof 로 부르고 mkt.json 은 그대로)',
    '달력: 회사(mkt.json 번호 모두)마다 그 날짜 일봉 줄이 있으면 1 로 셈(값이 비어도) · 달력 밖 날짜 줄은 버림 · 모음 마지막 날 = 회사 줄 날짜 중 가장 늦은 날',
    '적자 해 없음: 쓸 수 있는 해가 3해 미만이면 적자가 있어도 null(G1c 답 2)',
    '4분기 합: 쓸 수 있는 분기 마지막 다섯을 먼저 잡고 이어짐 · op · sales 있음 요구(G1c 답 3) · 결산 달 분기 = 해마다 결산 마지막 열(key 가장 큰 N 열)의 달 · 없으면 12 → M + 4',
    'EPS · BPS: 요약 값이 수이고 기준 달 + 3 달째 1일 ≤ 그날이면 요약 · 아니면 쓸 수 있는 마지막 해마다 열의 값(「-」면 null · 앞 해로 안 감 · G1c 답 4)',
    'score 모음 lo · hi = counted 줄만 합 · 그중 null 이 있거나 counted 0 이면 null(G1c 답 5 · 표 §9 12:2x 고침)',
    '--private ratio · sigma = floor(값 × 10⁴ · 10⁵ + 0.5) ÷ 10⁴ · 10⁵(표 §12 12:2x 고침) · 팔 선 · 닿은 수는 반올림 전 값',
    'why: lists(목록 「?」 x0 회사 있음) · years(2 × loss3 < x0 수) · quarters(사이트 파일 · x0 회사 모두 4분기 합 못 셈 · x0 > 0) → 하나도 없으면 passAll > 0 → cut · 0 → none(G1c 답 6)',
    'loss3 = x 0 인 회사 중 적자 해 없음 작은 조건이 null 이 아닌 곳(0 또는 1)',
    '상관: 분산 0 이면 셀 수 없음 = 뺌(표에 없는 곳)',
    'picks[].name = mkt.json companies[번호].n',
    '몬테카를로 하루 로그 오름 = ln(c_d ÷ c_{d−1}) · 합은 앞에서부터 차례로 더함(compensated sum 안 씀)',
    '부동소수 경계 1e−9 안(상관 0.5 · s 0 · 닿음 · 호가)은 두 답 모두 맞음(표 §13)',
]


def table_rules_check(path):
    """결정표 §5 줄을 읽어 이 파일의 문턱 상수(값 · 한 칸 · 화면 글)와 맞대 봄 — 표가 바뀌면 틀림으로 알림."""
    out = {'rows': 0, 'diffs': []}
    try:
        lines = open(path, encoding='utf-8').read().split('\n')
    except OSError as e:
        out['diffs'].append({'where': 'table §5', 'theirs': str(e)})
        return out
    sec = False
    rows = []
    for ln in lines:
        if ln.startswith('## 5.'):
            sec = True
            continue
        if sec and ln.startswith('### '):
            break
        if sec and ln.startswith('| ') and not ln.startswith('| key') and not ln.startswith('|---'):
            cells = [c.strip() for c in ln.strip().strip('|').split('|')]
            rows.append(cells)
    out['rows'] = len(rows)

    def num(txt):
        t = txt.replace('±', '').replace('%p', '').replace('%', '').replace('억 원', '').replace('억', '')
        t = t.replace('배', '').replace('해', '').strip()
        try:
            return F(Decimal(t))
        except (InvalidOperation, ValueError):
            return None
    mine = {r[0]: r for r in RULES}
    keys = [c[0] for c in rows if c[0] != 'lossYears']
    if keys != RULE_KEYS:
        out['diffs'].append({'where': 'table §5 key 차례', 'mine': RULE_KEYS, 'theirs': keys})
    for c in rows:
        if len(c) < 6:
            out['diffs'].append({'where': 'table §5 줄 꼴', 'theirs': c})
            continue
        key = c[0]
        if key == 'lossYears':
            if num(c[2]) != LOSS_YEARS:
                out['diffs'].append({'where': 'table §5 lossYears', 'mine': LOSS_YEARS, 'theirs': c[2]})
            continue
        r = mine.get(key)
        if r is None:
            continue
        scale = F(10 ** 8) if key == 'thin' else F(1)
        v, step = num(c[2]), num(c[5])
        if v is None or v * scale != r[2]:
            out['diffs'].append({'where': 'table §5 %s 값' % key, 'mine': float(r[2] / scale), 'theirs': c[2]})
        if step is None or step * scale != r[3]:
            out['diffs'].append({'where': 'table §5 %s 한 칸' % key, 'mine': float(r[3] / scale), 'theirs': c[5]})
        if c[3] != r[6]:
            out['diffs'].append({'where': 'table §5 %s 화면 글' % key, 'mine': r[6], 'theirs': c[3]})
        gate = {'X1': 'x'}.get(c[1], c[1].lower())
        if gate != r[1]:
            out['diffs'].append({'where': 'table §5 %s 문' % key, 'mine': r[1], 'theirs': c[1]})
    return out


# ── 작은 도구 ────────────────────────────────────────────────────────────────
class DataError(Exception):
    pass


class Unavailable(Exception):
    """이 기계에서 다시 셀 입력이 없음(끝 코드 4 — 틀림이 아니라 셀 수 없음)."""


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def read_json(p):
    if p.endswith('.gz'):
        with gzip.open(p, 'rt', encoding='utf-8') as f:
            return json.load(f)
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def read_json_safe(p):
    if not p or not os.path.exists(p):
        return None, 'missing'
    try:
        return read_json(p), None
    except Exception as e:  # noqa: BLE001
        return None, 'unreadable: %s' % (e,)


def iso(d8):
    d8 = str(d8)
    return '%s-%s-%s' % (d8[:4], d8[4:6], d8[6:8])


def add_months_first(y, m, n):
    m2 = m + n
    y2 = y + (m2 - 1) // 12
    m2 = (m2 - 1) % 12 + 1
    return '%04d-%02d-01' % (y2, m2)


def parse_num(v):
    """§1 값 = 쉼표 · 원 · 배 · % 를 지운 수 · 「-」 · 빈칸 · 글 = 빈 값 · 「-999,999」도 수."""
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, int):
        return F(v)
    if isinstance(v, float):
        return F(v) if math.isfinite(v) else None
    s = str(v).replace(',', '').replace('원', '').replace('배', '').replace('%', '').strip()
    if not s:
        return None
    try:
        d = Decimal(s)
    except (InvalidOperation, ValueError):
        return None
    if not d.is_finite():
        return None
    return F(d)


def P(t):
    """§4 P(t) = round(t × 1000) 정수."""
    return int(round(F(t) * 1000))


def tri_and(vals):
    if any(v == 0 for v in vals):
        return 0
    if any(v is None for v in vals):
        return None
    return 1


def round1(fr):
    """정확한 분수 → 소수 한 자리(딱 반이면 짝수 쪽) → float."""
    return float(round(F(fr), 1))


def fmt1(fr, plus=False):
    r = round(F(fr), 1)
    s = format(Decimal(r.numerator) / Decimal(r.denominator), '.1f')
    if plus and r >= 0:
        s = '+' + s
    return s


def num_eq(a, b, tol=0.0):
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    try:
        fa, fb = float(a), float(b)
    except (TypeError, ValueError):
        return a == b
    if tol == 0.0:
        return fa == fb
    return abs(fa - fb) <= tol * max(1.0, abs(fa), abs(fb))


# ── 자료 담기 ─────────────────────────────────────────────────────────────────
class Data:
    pass


def norm_code(c):
    if isinstance(c, (int, float)) and not isinstance(c, bool):
        return '%06d' % int(c)
    if isinstance(c, dict):
        c = c.get('code') or c.get('번호') or c.get('stockCode')
    if c is None:
        return None
    s = str(c).strip()
    if s.isdigit() and len(s) < 6:
        s = s.zfill(6)
    return s


LIST_NAMES = {
    'managed': ('managed', '관리'),
    'warning': ('warning', '투자경고'),
    'danger': ('danger', '투자위험', 'risk'),
    'halted': ('halted', '거래정지', 'halt'),
}
DART_NAMES = {'cb': ('cb', '전환사채'), 'rights': ('rights', '유상증자')}


def parse_lists(obj):
    """§1 목록 꼴 → {이름: set 또는 None}(여섯) · 파일 없음 → None."""
    if obj is None:
        return None
    out = {}
    lists = obj.get('lists') if isinstance(obj, dict) else None
    lists = lists if isinstance(lists, dict) else {}
    for name, alts in LIST_NAMES.items():
        val = None
        found = False
        for a in alts:
            if a in lists:
                val, found = lists[a], True
                break
        out[name] = (set(c for c in (norm_code(x) for x in val) if c) if isinstance(val, list) else None) if found else None
    dart = obj.get('dart') if isinstance(obj, dict) else None
    dart = dart if isinstance(dart, dict) else {}
    ok = dart.get('ok')
    for name, alts in DART_NAMES.items():
        val = None
        for a in alts:
            if a in dart:
                val = dart[a]
                break
        if ok is False:
            val = None
        out[name] = set(c for c in (norm_code(x) for x in val) if c) if isinstance(val, list) else None
    return out


def parse_quarters(obj):
    """§1 분기 꼴 → {번호: [(key, sales, op, net)] key 차례} · 파일 없음 → None."""
    if obj is None:
        return None
    co = obj.get('co') if isinstance(obj, dict) else None
    if not isinstance(co, dict):
        return {}
    out = {}
    for code, arr in co.items():
        if isinstance(arr, dict):
            arr = arr.get('q')
        if not isinstance(arr, list):
            continue
        seen = {}
        for q in arr:
            if not isinstance(q, dict):
                continue
            if q.get('isConsensus') == 'Y':
                continue
            key = ''.join(ch for ch in str(q.get('key', '')) if ch.isdigit())[:6]
            if len(key) != 6 or key in seen:
                continue
            sales = q['sales'] if 'sales' in q else (q['rev'] if 'rev' in q else q.get('매출액'))
            op = q['op'] if 'op' in q else q.get('영업이익')
            net = q['net'] if 'net' in q else q.get('당기순이익')
            seen[key] = (key, parse_num(sales), parse_num(op), parse_num(net))
        out[norm_code(code)] = [seen[k] for k in sorted(seen)]
    return out


def parse_finance(stock):
    """§1 해마다 결산 → [(key, usable, {sales, op, net, eps, bps})] key 차례."""
    try:
        fin = json.loads(stock['finance']['text'])
        fi = fin['financeInfo']
    except Exception:  # noqa: BLE001
        return []
    keys = []
    for t in fi.get('trTitleList') or []:
        if isinstance(t, dict) and t.get('isConsensus') == 'N' and t.get('key'):
            keys.append(str(t['key']))
    rows = {}
    for r in fi.get('rowList') or []:
        if isinstance(r, dict) and r.get('title') not in rows:
            rows[r.get('title')] = r.get('columns') or {}
    names = {'sales': '매출액', 'op': '영업이익', 'net': '당기순이익', 'eps': 'EPS', 'bps': 'BPS'}
    out = []
    for key in sorted(set(keys)):
        vals = {}
        for k, title in names.items():
            col = (rows.get(title) or {}).get(key)
            vals[k] = parse_num(col.get('value') if isinstance(col, dict) else None)
        y, m = int(key[:4]), int(key[4:6])
        out.append((key, add_months_first(y, m, 4), vals))
    return out


def parse_summary(stock):
    eps = bps = None
    try:
        it = json.loads(stock['integration']['text'])
        for x in it.get('totalInfos') or []:
            if not isinstance(x, dict):
                continue
            code = x.get('code')
            if code in ('eps', 'bps'):
                v = parse_num(x.get('value'))
                desc = str(x.get('valueDesc') or '')
                usable = None
                parts = desc.replace(' ', '').split('.')
                if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                    usable = add_months_first(int(parts[0]), int(parts[1]), 3)
                if code == 'eps':
                    eps = (v, usable)
                else:
                    bps = (v, usable)
    except Exception:  # noqa: BLE001
        pass
    return eps, bps


def build(bundle, mkt, core, quarters, lists):
    d = Data()
    stocks = bundle.get('stocks') or {}
    comp = mkt.get('companies') or {}
    codes = sorted(comp.keys())
    d.codes = codes
    d.ix = {c: i for i, c in enumerate(codes)}
    d.n = len(codes)
    d.listed = len(stocks)
    d.mkt_asof = mkt.get('asOf')
    d.names = [comp[c].get('n') for c in codes]
    d.ind = [comp[c].get('i') or None for c in codes]
    big_of = {}
    for g in core.get('groups') or []:
        for name in g.get('inds') or []:
            big_of.setdefault(name, g.get('name'))
    d.big_of = big_of
    d.big = [big_of.get(x) if x else None for x in d.ind]
    rows_of = []
    cnt = Counter()
    last = None
    for c in codes:
        rows = ((stocks.get(c) or {}).get('fchart') or {}).get('rows') or []
        rows_of.append(rows)
        seen = set()
        for r in rows:
            ds = str(r[0])
            if ds in seen:
                continue
            seen.add(ds)
            cnt[ds] += 1
            if last is None or ds > last:
                last = ds
    d.cal = sorted(ds for ds, n in cnt.items() if 2 * n > d.n)
    d.cal_iso = [iso(x) for x in d.cal]
    d.kof = {x: k for k, x in enumerate(d.cal)}
    d.bundle_last = iso(last) if last else None
    K = len(d.cal)
    d.K = K
    d.C, d.V, d.T, d.MC, d.MT, d.ST, d.last_close = [], [], [], [], [], [], []
    for i, c in enumerate(codes):
        C = [None] * K
        V = [None] * K
        T = [None] * K
        lc = None
        lcd = None
        for r in rows_of[i]:
            ds = str(r[0])
            close = r[4] if len(r) > 4 else None
            vol = r[5] if len(r) > 5 else None
            okc = isinstance(close, (int, float)) and not isinstance(close, bool) and close > 0
            okv = isinstance(vol, (int, float)) and not isinstance(vol, bool) and vol >= 0
            if okc and (lcd is None or ds > lcd):
                lc, lcd = close, ds
            k = d.kof.get(ds)
            if k is None:
                continue
            if okc:
                C[k] = close
            if okv:
                V[k] = vol
            if okc and okv:
                T[k] = close * vol
        mc = [0] * (K + 1)
        mt = [0] * (K + 1)
        st = [0] * (K + 1)
        a = b = s = 0
        for k in range(K):
            if C[k] is None:
                a += 1
            if T[k] is None:
                b += 1
            else:
                s += T[k]
            mc[k + 1] = a
            mt[k + 1] = b
            st[k + 1] = s
        d.C.append(C)
        d.V.append(V)
        d.T.append(T)
        d.MC.append(mc)
        d.MT.append(mt)
        d.ST.append(st)
        d.last_close.append(lc)
    # 업종
    d.members = defaultdict(list)
    for i, x in enumerate(d.ind):
        if x:
            d.members[x].append(i)
    d.IST = {}
    for name, mem in d.members.items():
        acc = [0] * (K + 1)
        for i in mem:
            st = d.ST[i]
            for j in range(K + 1):
                acc[j] += st[j]
        d.IST[name] = acc
    # 결산
    d.annual = [parse_finance(stocks.get(c) or {}) for c in codes]
    d.fy_month = [int(a[-1][0][4:6]) if a else 12 for a in d.annual]
    d.summary = [parse_summary(stocks.get(c) or {}) for c in codes]
    d.cap = []
    for c in codes:
        lv = ((stocks.get(c) or {}).get('list') or {}).get('listValue')
        d.cap.append(parse_num(lv))
    attach(d, quarters, lists)
    return d


def attach(d, quarters, lists):
    """분기 · 목록(날마다 바뀌는 입력)을 붙임 — 모음 배열은 그대로."""
    d.quarters_present = quarters is not None
    d.quarters = []
    for i, c in enumerate(d.codes):
        if quarters is None:
            d.quarters.append(None)
            continue
        qs = []
        for (key, sales, op, net) in quarters.get(c, []):
            y, m = int(key[:4]), int(key[4:6])
            usable = add_months_first(y, m, 4 if m == d.fy_month[i] else 3)
            qs.append((key, usable, sales, op, net))
        d.quarters.append(qs)
    d.lists = lists
    d.lists_complete = lists is not None and all(v is not None for v in lists.values())
    return d


# ── 날 하나의 셈 ───────────────────────────────────────────────────────────────
def next_q(key):
    y, m = int(key[:4]), int(key[4:6])
    m += 3
    if m > 12:
        y, m = y + 1, m - 12
    return '%04d%02d' % (y, m)


def q4_from_quarters(qs, day):
    if not qs:
        return None
    usable = [q for q in qs if q[1] <= day]
    if len(usable) < 5:
        return None
    last5 = usable[-5:]
    for a, b in zip(last5, last5[1:]):
        if next_q(a[0]) != b[0]:
            return None
    if any(q[2] is None or q[3] is None for q in last5):
        return None
    now_op = sum(q[3] for q in last5[1:])
    prev_op = sum(q[3] for q in last5[:4])
    now_s = sum(q[2] for q in last5[1:])
    prev_s = sum(q[2] for q in last5[:4])
    return (now_op, prev_op, now_s, prev_s)


def q4_from_annual(ann, day):
    usable = [a for a in ann if a[1] <= day]
    if len(usable) < 2:
        return None
    a, b = usable[-2][2], usable[-1][2]
    if None in (a['op'], a['sales'], b['op'], b['sales']):
        return None
    return (b['op'], a['op'], b['sales'], a['sales'])


def loss_sub(ann, day):
    usable = [a for a in ann if a[1] <= day]
    if len(usable) < LOSS_YEARS:
        return None
    last = usable[-LOSS_YEARS:]
    if any((a[2]['op'] is not None and a[2]['op'] < 0) or (a[2]['net'] is not None and a[2]['net'] < 0) for a in last):
        return 0
    if all(a[2]['op'] is not None and a[2]['net'] is not None for a in last):
        return 1
    return None


def grew(now, prev, g):
    if g == 0:
        return 1 if now > prev else 0
    return 1 if 100000 * (now - prev) > P(g) * abs(prev) else 0


class Day:
    """날 k 하나 — 문턱에 기대지 않는 값(facts)을 회사마다 한 번 셈."""

    def __init__(self, d, k, mode):
        self.d, self.k, self.mode = d, k, mode
        self.day = d.cal_iso[k]
        self.fx = [None] * d.n
        self.ind = {}
        for i in range(d.n):
            self.fx[i] = self.facts(i)
        for name in d.members:
            self.ind[name] = self.ind_facts(name)

    def facts(self, i):
        d, k = self.d, self.k
        C, MT, ST, MC, V = d.C[i], d.MT[i], d.ST[i], d.MC[i], d.V[i]
        f = {}
        c0 = C[k]
        f['c0'] = c0
        lo = k - 19
        if lo < 0 or MT[k + 1] - MT[lo] > 0:
            f['miss20'], f['s20'] = True, None
        else:
            f['miss20'], f['s20'] = False, ST[k + 1] - ST[lo]
        x2 = c0 is None
        if not x2:
            for j in range(k - 4, k + 1):
                if j < 0 or V[j] is None or V[j] == 0:
                    x2 = True
                    break
        f['x2'] = x2
        hit = False
        if d.lists is not None and self.mode == 'site':
            code = d.codes[i]
            hit = any(s is not None and code in s for s in d.lists.values())
        f['lhit'] = hit
        # G2
        a, b = k - 139, k - 19
        f['s120'] = (ST[b] - ST[a]) if a >= 0 and MT[b] - MT[a] == 0 else None
        f['c5'] = C[k - 5] if k - 5 >= 0 else None
        f['c20'] = C[k - 20] if k - 20 >= 0 else None
        f['c60'] = C[k - 60] if k - 60 >= 0 else None
        # G3
        all60 = k - 60 >= 0 and MC[k + 1] - MC[k - 60] == 0
        f['all60'] = all60
        if all60 and c0 is not None:
            jn, jd = C[k - 59], C[k - 60]
            for j in range(k - 58, k + 1):
                if C[j] * jd > jn * C[j - 1]:
                    jn, jd = C[j], C[j - 1]
            f['jump'] = (jn, jd)
            mx = C[k - 60]
            mn, md = 1, 1
            for j in range(k - 60, k + 1):
                if C[j] > mx:
                    mx = C[j]
                if C[j] * md < mn * mx:
                    mn, md = C[j], mx
            f['mdd'] = (mn, md)
            f['mx60'] = mx
        # G4
        all250 = k - 249 >= 0 and MC[k + 1] - MC[k - 249] == 0
        f['all250'] = all250
        f['min250'] = min(C[k - 249:k + 1]) if all250 else None
        f['max250'] = max(C[k - 249:k + 1]) if all250 else None
        # G1
        q4 = None
        src = None
        if d.quarters[i] is not None:
            q4 = q4_from_quarters(d.quarters[i], self.day)
            src = 'q' if q4 is not None else None
        if q4 is None and self.mode == 'back':
            q4 = q4_from_annual(d.annual[i], self.day)
            src = 'annual' if q4 is not None else None
        f['q4'], f['q4src'] = q4, src
        f['loss'] = loss_sub(d.annual[i], self.day)
        f['ind'] = d.ind[i]
        return f

    def ind_facts(self, name):
        d, k = self.d, self.k
        if k - 79 < 0:
            return None
        acc = d.IST[name]
        S20 = acc[k + 1] - acc[k - 19]
        S60 = acc[k - 19] - acc[k - 79]
        pairs = []
        for i in d.members[name]:
            a, b = d.C[i][k], d.C[i][k - 20]
            if a is not None and b is not None:
                pairs.append((F(a, b), a, b))
        pairs.sort(key=lambda t: t[0])
        n = len(pairs)
        if n == 0:
            med = None
        elif n % 2 == 1:
            med = ('odd', pairs[n // 2][1], pairs[n // 2][2])
        else:
            p1, p2 = pairs[n // 2 - 1], pairs[n // 2]
            med = ('even', p1[1], p1[2], p2[1], p2[2])
        return {'S20': S20, 'S60': S60, 'med': med, 'n': n}

    # 문턱을 받아 문을 셈
    def x_of(self, i, th):
        f = self.fx[i]
        if f['miss20'] or f['s20'] < 20 * th['thin']:
            return 1
        if f['x2']:
            return 2
        if f['lhit']:
            return 3
        return 0

    def l_of(self, i, x):
        if x == 3:
            return 0
        if x in (1, 2):
            return None
        if self.mode == 'back':
            return 1
        return 1 if self.d.lists_complete else None

    def gates(self, i, th):
        f = self.fx[i]
        c0 = f['c0']
        # G1
        q = f['q4']
        if q is None:
            a1 = b1 = c1 = None
        else:
            now_op, prev_op, now_s, prev_s = q
            a1 = 1 if now_op > 0 else 0
            b1 = grew(now_op, prev_op, th['opGrow'])
            c1 = grew(now_s, prev_s, th['salesGrow'])
        g1 = tri_and([a1, b1, c1, f['loss']])
        # G2
        s20, s120 = f['s20'], f['s120']
        quiet = None if (s20 is None or s120 is None) else (1 if 6000 * s20 <= P(th['quietX']) * s120 else 0)
        c5, c20, c60 = f['c5'], f['c20'], f['c60']
        hot = None if (c0 is None or c5 is None) else (1 if 100000 * c0 < (100000 + P(th['hot5'])) * c5 else 0)
        r20 = None if (c0 is None or c20 is None) else (1 if 100000 * c0 <= (100000 + P(th['r20'])) * c20 else 0)
        g2 = tri_and([quiet, hot, r20])
        # G3
        if c0 is None or c60 is None:
            r60 = None
        else:
            r60 = 1 if (100000 * c0 >= (100000 + P(th['r60lo'])) * c60 and
                        100000 * c0 <= (100000 + P(th['r60hi'])) * c60) else 0
        if f['all60'] and c0 is not None:
            jn, jd = f['jump']
            jump = 1 if 100000 * jn < (100000 + P(th['jump'])) * jd else 0
            mn, md = f['mdd']
            mdd = 1 if 100000 * mn >= (100000 - P(th['mdd60'])) * md else 0
            dd0 = 1 if 100000 * c0 >= (100000 - P(th['dd0'])) * f['mx60'] else 0
        else:
            jump = mdd = dd0 = None
        g3 = tri_and([r60, jump, mdd, dd0])
        # G4
        if f['all250'] and c0 is not None:
            g4 = 1 if 1000 * c0 < P(th['low2x']) * f['min250'] else 0
        else:
            g4 = None
        # G5
        name = f['ind']
        it = self.ind.get(name) if name else None
        if it is None:
            g5 = None
        else:
            S20, S60 = it['S20'], it['S60']
            trade = (1 if 3000 * S20 >= P(th['indX']) * S60 else 0) if S60 > 0 else None
            med = it['med']
            pm = P(th['indMed'])
            if med is None:
                mcond = None
            elif med[0] == 'odd':
                mcond = 1 if 100000 * med[1] > (100000 + pm) * med[2] else 0
            else:
                _, a1_, b1_, a2_, b2_ = med
                mcond = 1 if 100000 * (a1_ * b2_ + a2_ * b1_) > 2 * (100000 + pm) * b1_ * b2_ else 0
            g5 = tri_and([trade, mcond])
        return [g1, g2, g3, g4, g5]

    def row(self, i, th):
        x = self.x_of(i, th)
        l = self.l_of(i, x)
        g = self.gates(i, th) if x == 0 else [None] * 5
        return x, g, l

    @staticmethod
    def passes(x, g, l):
        return x == 0 and l == 1 and sum(1 for v in g if v == 1) >= NEED

    @staticmethod
    def no_fail(x, g, l):
        return x == 0 and l != 0 and all(v != 0 for v in g)


# ── 고르기 ────────────────────────────────────────────────────────────────────
def corr(d, ia, ib, k):
    xs, ys = [], []
    A, B = d.C[ia], d.C[ib]
    for j in range(k - 59, k + 1):
        if j - 1 < 0:
            continue
        a1, a0, b1, b0 = A[j], A[j - 1], B[j], B[j - 1]
        if a1 is None or a0 is None or b1 is None or b0 is None:
            continue
        xs.append(a1 / a0 - 1)
        ys.append(b1 / b0 - 1)
    n = len(xs)
    if n < 50:
        return None, n
    sx = 0.0
    sy = 0.0
    for v in xs:
        sx += v
    for v in ys:
        sy += v
    mx, my = sx / n, sy / n
    cxy = vx = vy = 0.0
    for a, b in zip(xs, ys):
        cxy += (a - mx) * (b - my)
        vx += (a - mx) ** 2
        vy += (b - my) ** 2
    if vx <= 0 or vy <= 0:
        return None, n
    return cxy / math.sqrt(vx * vy), n


def weight_of(slot):
    return WEIGHTS[0] if slot <= 12 else (WEIGHTS[1] if slot <= 24 else WEIGHTS[2])


def select(day, rows, th):
    d, k = day.d, day.k
    cands = [i for i in range(d.n) if Day.passes(*rows[i])]

    def cmp(ia, ib):
        fa, fb = day.fx[ia], day.fx[ib]
        pa = fa['q4'][1] > 0
        pb = fb['q4'][1] > 0
        if pa != pb:
            return -1 if pa else 1
        an, ap = fa['q4'][0], fa['q4'][1]
        bn, bp = fb['q4'][0], fb['q4'][1]
        l, r = an * bp, bn * ap
        if l != r:
            return -1 if l > r else 1
        l, r = fa['c0'] * fb['c60'], fb['c0'] * fa['c60']
        if l != r:
            return -1 if l < r else 1
        return -1 if d.codes[ia] < d.codes[ib] else (1 if d.codes[ia] > d.codes[ib] else 0)

    order = sorted(cands, key=functools.cmp_to_key(cmp))
    picks, cut_ind, cut_big, edges = [], 0, 0, []
    per_ind = defaultdict(list)
    big_sum = defaultdict(F)
    for i in order:
        if len(picks) >= MAX_PICKS:
            break
        name = d.ind[i]
        have = per_ind[name]
        if len(have) >= PER_IND2:
            cut_ind += 1
            continue
        if len(have) == 1:
            rho, n = corr(d, have[0], i, k)
            if rho is not None and abs(rho - CORR2) <= EPS_TOL:
                edges.append({'what': 'corr', 'a': d.codes[have[0]], 'b': d.codes[i], 'rho': rho})
            if rho is None or not rho < CORR2:
                cut_ind += 1
                continue
        w = weight_of(len(picks) + 1)
        big = d.big[i] or name
        if big_sum[big] + w > BIG_CAP:
            cut_big += 1
            continue
        picks.append((i, w))
        per_ind[name].append(i)
        big_sum[big] += w
    return order, picks, cut_ind, cut_big, edges


# ── 몬테카를로 ─────────────────────────────────────────────────────────────────
def fnv1a(s):
    h = 0x811C9DC5
    for b in s.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def mulberry32(a):
    state = [a & 0xFFFFFFFF]

    def nxt():
        a_ = (state[0] + 0x6D2B79F5) & 0xFFFFFFFF
        state[0] = a_
        t = ((a_ ^ (a_ >> 15)) * (a_ | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0
    return nxt


def log_returns(C, k, W):
    r = []
    for j in range(k - W + 1, k + 1):
        if j - 1 < 0:
            continue
        a, b = C[j], C[j - 1]
        if a is None or b is None:
            continue
        r.append(math.log(a / b))
    return r


def monte(d, i, k):
    code, day = d.codes[i], d.cal_iso[k]
    counts, edges = [], []
    for W, flag in MC_RUNS:
        r = log_returns(d.C[i], k, W)
        n = len(r)
        if n < (8 * W) // 10:
            return None
        if flag == 1:
            tot = 0.0
            for v in r:
                tot += v
            m = tot / n
            r = [v - m for v in r]
        rng = mulberry32(fnv1a('%s|%s|%d|%d' % (code, day, W, flag)))
        up = 0
        edge = 0
        for _ in range(2000):
            s = 0.0
            for _ in range(20):
                s += r[int(rng() * n)]
            if s > 0:
                up += 1
            if abs(s) <= EPS_TOL:
                edge += 1
        counts.append(up)
        edges.append(edge)
    lo = (10 * min(counts)) // 2000
    hi = -((-10 * max(counts)) // 2000)
    return {'lo': lo, 'hi': hi, 'counts': counts, 'edges': edges}


# ── 팔 선 ────────────────────────────────────────────────────────────────────
def tick_unit(x):
    for lim, t in ((2000, 1), (5000, 5), (20000, 10), (50000, 50), (200000, 100), (500000, 500)):
        if x < lim:
            return t
    return 1000


def tick_floor(x):
    t = tick_unit(x)
    return int(math.floor(x / t + 1e-9)) * t


def sell_line(d, i, k):
    C = d.C[i]
    r = []
    for j in range(k - 249, k + 1):
        if j - 1 < 0:
            continue
        a, b = C[j], C[j - 1]
        if a is not None and b is not None:
            r.append(math.log(a / b))
    if len(r) < 200:
        return None
    n = len(r)
    tot = 0.0
    for v in r:
        tot += v
    m = tot / n
    ss = 0.0
    for v in r:
        ss += (v - m) ** 2
    sigma = math.sqrt(ss / (n - 1))
    ratio = math.exp(-1.5 * sigma * math.sqrt(20))
    c0 = C[k]
    x = c0 * ratio
    line = tick_floor(x)
    edge = False
    t = tick_unit(x)
    if abs(x / t - round(x / t)) < 1e-7:
        edge = True
    for lim in (2000, 5000, 20000, 50000, 200000, 500000):
        if abs(x - lim) < 1e-6 * lim:
            edge = True
    T = N = 0
    tedge = 0
    for s in range(k - 250, k - 19):
        if s < 0 or C[s] is None:
            continue
        seg = C[s + 1:s + 21]
        if len(seg) < 20 or any(v is None for v in seg):
            continue
        N += 1
        bar = C[s] * ratio
        if any(v <= bar for v in seg):
            T += 1
        if any(abs(v - bar) <= EPS_TOL * max(1.0, bar) for v in seg):
            tedge += 1
    nn = (20 * T + N) // (2 * N) if N else None
    # 표 §12: ratio · sigma 는 보이기만 하는 값 — 반올림(× 10⁴ · 10⁵, 딱 반이면 큰 쪽 = floor(x + 0.5)) · 팔 선 · 닿음은 반올림 전
    r4 = math.floor(ratio * 1e4 + 0.5) / 1e4
    s5 = math.floor(sigma * 1e5 + 0.5) / 1e5
    redge = abs((ratio * 1e4) % 1 - 0.5) < 1e-6 or abs((sigma * 1e5) % 1 - 0.5) < 1e-6
    return {'line': line, 'ratio': r4, 'sigma': s5, 'ratioRaw': ratio, 'sigmaRaw': sigma, 'basis': '종가',
            'touch': {'n': nn, 'of': 10, 'T': T, 'N': N}, 'edge': edge, 'touchEdge': tedge, 'roundEdge': redge, 'x': x}


# ── 사이트 파일 다시 셈 ────────────────────────────────────────────────────────
def compute_site(d, k, prev=None):
    day = Day(d, k, 'site')
    th = dict(TH0)
    rows = [day.row(i, th) for i in range(d.n)]
    order, picks, cut_ind, cut_big, edges = select(day, rows, th)
    x0 = [i for i in range(d.n) if rows[i][0] == 0]
    counts = {
        'listed': d.listed, 'companies': d.n,
        'outThin': sum(1 for r in rows if r[0] == 1),
        'outThinQ': sum(1 for i in range(d.n) if rows[i][0] == 1 and day.fx[i]['miss20']),
        'outHalt': sum(1 for r in rows if r[0] == 2),
        'outList': sum(1 for r in rows if r[0] == 3),
        'listQ': sum(1 for i in x0 if rows[i][2] is None),
        'afterOut': len(x0),
    }
    for j in range(5):
        counts['g%d' % (j + 1)] = sum(1 for i in x0 if rows[i][1][j] == 1)
    counts['passAll'] = sum(1 for r in rows if Day.passes(*r))
    counts['cutInd'] = cut_ind
    counts['cutBig'] = cut_big
    counts['picked'] = len(picks)
    wsum = sum((w for _, w in picks), F(0))
    counts['cash'] = float(round(100 - wsum, 1))
    counts['loss3'] = sum(1 for i in x0 if day.fx[i]['loss'] is not None)
    loss3_years = sum(1 for i in x0 if len([a for a in d.annual[i] if a[1] <= day.day]) >= LOSS_YEARS)
    why = None
    if not picks:
        rs = []
        if counts['listQ'] > 0:
            rs.append('lists')
        if 2 * counts['loss3'] < len(x0):
            rs.append('years')
        if x0 and all(day.fx[i]['q4'] is None for i in x0):
            rs.append('quarters')
        if not rs:
            rs.append('cut' if counts['passAll'] > 0 else 'none')
        why = ','.join(rs)
    counts['why'] = why
    # 흔들기
    sens = {}
    base_nofail = sum(1 for r in rows if Day.no_fail(*r))
    for key, gate, v, step, tdir, unit, _ in RULES:
        tight = F(round(v + tdir * step, 6))
        loose = F(round(v - tdir * step, 6))
        out = []
        for tv in (tight, v, loose):
            if tv == v:
                out.append((tv, base_nofail))
                continue
            th2 = dict(th)
            th2[key] = tv
            if key == 'thin':
                n = 0
                for i in range(d.n):
                    if Day.no_fail(*day.row(i, th2)):
                        n += 1
            else:
                n = 0
                for i in x0:
                    x, g, l = rows[i][0], day.gates(i, th2), rows[i][2]
                    if Day.no_fail(x, g, l):
                        n += 1
            out.append((tv, n))
        sens[key] = out
    # 고른 곳마다
    pick_rows = []
    fall_days = []
    for no, (i, w) in enumerate(picks, 1):
        f = day.fx[i]
        near = []
        for key, gate, v, step, tdir, unit, _ in RULES:
            th2 = dict(th)
            th2[key] = F(round(v + tdir * step, 6))
            if not Day.passes(*day.row(i, th2)):
                near.append(key)
        it = day.ind[d.ind[i]]
        S20, S60 = it['S20'], it['S60']
        now_op, prev_op = f['q4'][0], f['q4'][1]
        c0, c60 = f['c0'], f['c60']
        r60 = F(100) * (c0 - c60) / c60
        trade = F(3 * S20, S60)
        reason = (now_op, prev_op, r60, trade)
        # wrong-v2
        if 100 * c0 >= 130 * c60:
            wno, wtxt = 1, WRONG[1].format(format(round(r60), 'd'))
        elif 10 * c0 >= 17 * f['min250']:
            wno, wtxt = 2, WRONG[2].format(fmt1(F(c0, f['min250'])))
        elif 30 * S20 < 13 * S60:
            wno, wtxt = 3, WRONG[3]
        elif prev_op <= 0 or 10 * now_op < 12 * prev_op:
            wno, wtxt = 4, WRONG[4]
        else:
            wno, wtxt = 5, WRONG[5]
        # 카드
        card = card_of(d, i, k, f, it)
        mc = monte(d, i, k)
        sl = sell_line(d, i, k)
        pick_rows.append({'no': no, 'code': d.codes[i], 'name': d.names[i], 'ind': d.ind[i], 'big': d.big[i],
                          'w': float(w), 'price': c0, 'reason': reason, 'wrongNo': wno, 'wrong': wtxt, 'near': near,
                          'card': card, 'mc': mc, 'sell': sl, 'i': i})
    if len(picks) >= 3:
        n3 = 0
        for j in range(max(1, k - 249), k + 1):
            m = 0
            for (i, _) in picks:
                a, b = d.C[i][j], d.C[i][j - 1]
                if a is not None and b is not None and 100 * a <= 97 * b:
                    m += 1
            if m >= 3:
                n3 += 1
                fall_days.append(d.cal_iso[j])
        fall3 = {'n': n3, 'days': k - max(1, k - 249) + 1, 'of': len(picks), 'dates': fall_days}
    else:
        fall3 = {'n': None, 'days': k - max(1, k - 249) + 1, 'of': len(picks), 'dates': []}
    inds, bigs = defaultdict(F), defaultdict(F)
    for (i, w) in picks:
        inds[d.ind[i]] += w
        bigs[d.big[i] or d.ind[i]] += w
    score = score_of(d, k, prev)
    gates_rows = {d.codes[i]: [rows[i][0]] + rows[i][1] + [rows[i][2]] for i in range(d.n)}
    return {
        'k': k, 'day': day.day, 'rows': rows, 'gates': gates_rows, 'counts': counts, 'loss3Years': loss3_years,
        'sens': sens, 'picks': pick_rows, 'fall3': fall3, 'inds': {a: float(b) for a, b in inds.items()},
        'bigs': {a: float(b) for a, b in bigs.items()}, 'score': score, 'edges': edges,
        'status': {'lists': 'ok' if d.lists_complete else ('partial' if d.lists is not None else 'missing'),
                   'quarters': 'ok' if d.quarters_present else 'missing'},
        'order': [d.codes[i] for i in order],
    }


def card_of(d, i, k, f, it):
    c0 = f['c0']
    day = d.cal_iso[k]
    ann = [a for a in d.annual[i] if a[1] <= day]

    def pick_val(summ, key):
        if summ is not None and summ[0] is not None and summ[1] is not None and summ[1] <= day:
            return summ[0]
        if ann:
            return ann[-1][2][key]
        return None
    eps = pick_val(d.summary[i][0], 'eps')
    bps = pick_val(d.summary[i][1], 'bps')
    per = round1(F(c0) / eps) if (eps is not None and eps > 0) else None
    pbr = round1(F(c0) / bps) if (bps is not None and bps > 0) else None
    lc = d.last_close[i]
    cap = int(round(d.cap[i] * c0 / F(lc))) if (d.cap[i] is not None and lc) else None
    hi = round1(F(100) * (c0 - f['max250']) / f['max250']) if f['max250'] else None
    trade = round1(F(3 * it['S20'], it['S60'])) if it and it['S60'] > 0 else None
    return {'per': per, 'pbr': pbr, 'cap': cap, 'hi': hi, 'trade': trade}


def select_back(d, k):
    """§2 지난 성적 꼴(목록 건너뜀 · 분기 없으면 해마다 결산)로 고름."""
    day = Day(d, k, 'back')
    th = dict(TH0)
    rows = [day.row(i, th) for i in range(d.n)]
    order, picks, cut_ind, cut_big, edges = select(day, rows, th)
    x0 = [i for i in range(d.n) if rows[i][0] == 0]
    pass_all = sum(1 for r in rows if Day.passes(*r))
    loss3 = sum(1 for i in x0 if day.fx[i]['loss'] is not None)
    why = None
    if not picks:
        rs = []
        if 2 * loss3 < len(x0):
            rs.append('years')
        if not rs:
            rs.append('cut' if pass_all > 0 else 'none')
        why = ','.join(rs)
    wsum = sum((w for _, w in picks), F(0))
    return {'day': day, 'rows': rows, 'picks': picks, 'cash': float(round(100 - wsum, 1)), 'why': why,
            'passAll': pass_all, 'cutInd': cut_ind, 'cutBig': cut_big, 'loss3': loss3, 'x0': len(x0), 'edges': edges}


def score_of(d, k, prev):
    if prev is not None:
        pk = d.kof.get(str(prev.get('asOf', '')).replace('-', ''))
        if pk is not None and pk + 20 <= k:
            rows = []
            for p in prev.get('picks') or []:
                i = d.ix.get(p.get('code'))
                frm = p.get('price')
                to = d.C[i][pk + 20] if i is not None else None
                mc = p.get('mc') or {}
                up = None if (frm is None or to is None) else (1 if to > frm else 0)
                rows.append({'code': p.get('code'), 'name': p.get('name'), 'lo': mc.get('lo'), 'hi': mc.get('hi'),
                             'from': frm, 'to': to, 'up': up})
            return summarize_score('kept', d.cal_iso[pk], d.cal_iso[pk + 20], rows)
    if k - 20 < 250:
        return None
    kb = k - 20
    sb = select_back(d, kb)
    rows = []
    for (i, w) in sb['picks']:
        mc = monte(d, i, kb)
        frm, to = d.C[i][kb], d.C[i][k]
        up = None if (frm is None or to is None) else (1 if to > frm else 0)
        rows.append({'code': d.codes[i], 'name': d.names[i], 'lo': mc['lo'] if mc else None,
                     'hi': mc['hi'] if mc else None, 'from': frm, 'to': to, 'up': up,
                     'mcCounts': mc['counts'] if mc else None, 'mcEdges': mc['edges'] if mc else None})
    return summarize_score('recomputed', d.cal_iso[kb], d.cal_iso[k], rows)


def summarize_score(src, frm, to, rows):
    counted = [r for r in rows if r['up'] is not None]
    # 표 §9: 합은 counted 줄만 · 그중 lo(hi)가 null 인 줄이 있거나 counted = 0 이면 null
    lo = None if (not counted or any(r['lo'] is None for r in counted)) else sum(r['lo'] for r in counted)
    hi = None if (not counted or any(r['hi'] is None for r in counted)) else sum(r['hi'] for r in counted)
    return {'src': src, 'from': frm, 'to': to, 'n': len(rows), 'counted': len(counted),
            'up': sum(r['up'] for r in counted), 'lo': lo, 'hi': hi, 'rows': rows}


# ── 맞대기 ────────────────────────────────────────────────────────────────────
def same(a, b, tol=0.0):
    if isinstance(a, dict) and isinstance(b, dict):
        return set(a) == set(b) and all(same(a[x], b[x], tol) for x in a)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(same(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, str) or isinstance(b, str):
        return a == b
    return num_eq(a, b, tol)


class Cmp:
    def __init__(self):
        self.n = 0
        self.diffs = []

    def eq(self, where, mine, theirs, table, ok=None, tol=0.0, follows='mine (표)', note=None):
        self.n += 1
        good = same(mine, theirs, tol) if ok is None else ok
        if not good:
            dd = {'where': where, 'mine': mine, 'theirs': theirs, 'table': TABLE_LINES.get(table, table), 'follows': follows}
            if note:
                dd['note'] = note
            self.diffs.append(dd)
        return good


def jsonable(o):
    if isinstance(o, F):
        return float(o)
    if isinstance(o, dict):
        return {str(k): jsonable(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [jsonable(v) for v in o]
    if isinstance(o, set):
        return sorted(o)
    return o


def fmt_int_variants(fr):
    """reason 의 억 숫자 꼴 — 표가 정하지 않음: 정수면 '1234' · '1,234' 둘 다 · 소수면 정확한 소수 글."""
    fr = F(fr)
    if fr.denominator == 1:
        n = int(fr)
        return {str(n), format(n, ',')}
    s = format(Decimal(fr.numerator) / Decimal(fr.denominator), 'f')
    return {s, str(round(float(fr), 1)), format(round(fr), ',')}


def reason_ok(mine, theirs):
    now_op, prev_op, r60, trade = mine
    if not isinstance(theirs, str):
        return False
    for a in fmt_int_variants(prev_op):
        for b in fmt_int_variants(now_op):
            t = '영업이익 %s억 → %s억 · 석 달 %s%% · 업종 거래 %s배' % (a, b, fmt1(r60, plus=True), fmt1(trade))
            if t == theirs:
                return True
    return False


def walk_keys(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield path + '/' + str(k), k, v
            yield from walk_keys(v, path + '/' + str(k))
    elif isinstance(o, list):
        for j, v in enumerate(o):
            yield from walk_keys(v, path + '/%d' % j)


def compare_site(cmp, d, mine, gdr, gates, priv, args, k_src):
    day = mine['day']
    g = gdr
    cmp.eq('gdr.schema', SCHEMA_GDR, g.get('schema'), 'files')
    cmp.eq('gdr.version', VERSION, g.get('version'), 'files')
    cmp.eq('gdr.asOf', day, g.get('asOf'), 'k')
    dates = g.get('dates') or {}
    cmp.eq('gdr.dates.site', d.mkt_asof, dates.get('site'), 'k')
    cmp.eq('gdr.dates.calc', day, dates.get('calc'), 'k')
    cmp.eq('gdr.dates.bundle', d.bundle_last, dates.get('bundle'), 'k')
    st = g.get('status') or {}
    my_l, my_q = mine['status']['lists'], mine['status']['quarters']
    tl, tq = st.get('lists'), st.get('quarters')
    if my_l == 'missing':
        okl = tl == 'missing'
    elif my_l == 'ok':
        okl = tl not in (None, 'missing', 'partial', 'none', 'skipped')
    else:
        okl = tl not in (None, 'ok', 'skipped')
    cmp.eq('gdr.status.lists', my_l, tl, 'l', ok=okl, note='표가 정한 말은 missing · skipped 뿐 — 다 받음 · 일부 못 받음은 뜻만 맞댐')
    cmp.eq('gdr.status.quarters', my_q, tq, 'g1',
           ok=(tq == 'missing') if my_q == 'missing' else tq not in (None, 'missing', 'skipped', 'annual'))
    src = g.get('src') or {}
    cmp.eq('gdr.src.lists (목록 파일을 썼나)', d.lists is not None, src.get('lists') is not None, 'l')
    cmp.eq('gdr.src.quarters (분기 파일을 썼나)', d.quarters_present, src.get('quarters') is not None, 'g1')
    lim = g.get('limits') or {}
    cmp.eq('gdr.limits', {'need': NEED, 'perInd': PER_IND, 'perInd2': PER_IND2, 'corr2': CORR2, 'bigCap': BIG_CAP,
                          'max': MAX_PICKS, 'w': [3, 2.5, 2]}, lim, 'pick')
    # counts
    c = g.get('counts') or {}
    for key, val in mine['counts'].items():
        cmp.eq('gdr.counts.%s' % key, val, c.get(key), 'why' if key in ('why', 'loss3') else 'pass')
    extra = sorted(set(c) - set(mine['counts']))
    if extra:
        cmp.eq('gdr.counts 남는 칸', [], extra, 'files')
    # rules
    rules = g.get('rules') or []
    cmp.eq('gdr.rules.keys', RULE_KEYS, [r.get('key') for r in rules], 'sens')
    byk = {r.get('key'): r for r in rules}
    for key, gate, v, step, tdir, unit, why in RULES:
        r = byk.get(key)
        if r is None:
            continue
        cmp.eq('gdr.rules.%s.gate' % key, gate, r.get('gate'), 'sens')
        cmp.eq('gdr.rules.%s.unit' % key, unit, r.get('unit'), 'sens')
        cmp.eq('gdr.rules.%s.v' % key, float(v), r.get('v'), 'sens')
        cmp.eq('gdr.rules.%s.why' % key, why, r.get('why'), 'sens', note='표 §5 「왜 이 값인가(화면 글)」 칸 그대로')
        sens = r.get('sens') or []
        my = [{'v': float(a), 'n': b} for a, b in mine['sens'][key]]
        cmp.eq('gdr.rules.%s.sens' % key, my, sens, 'sens')
    cmp.eq('gdr.sensNote 있음', True, bool(g.get('sensNote')), 'sens')
    # picks
    tp = g.get('picks') or []
    cmp.eq('gdr.picks.codes', [p['code'] for p in mine['picks']], [p.get('code') for p in tp], 'pick')
    for p, q in zip(mine['picks'], tp):
        w = 'gdr.picks[%s]' % p['code']
        for key in ('no', 'code', 'name', 'ind', 'big', 'w', 'price', 'near'):
            cmp.eq('%s.%s' % (w, key), p[key], q.get(key), 'near' if key == 'near' else 'pick')
        cmp.eq(w + '.reason', '영업이익 %s억 → %s억 · 석 달 %s%% · 업종 거래 %s배' % (
            sorted(fmt_int_variants(p['reason'][1]))[0], sorted(fmt_int_variants(p['reason'][0]))[0],
            fmt1(p['reason'][2], True), fmt1(p['reason'][3])), q.get('reason'), 'files',
            ok=reason_ok(p['reason'], q.get('reason')))
        cmp.eq(w + '.wrong', p['wrong'], q.get('wrong'), 'files')
        cmp.eq(w + '.card', p['card'], q.get('card'), 'card')
        qm = q.get('mc')
        if p['mc'] is None:
            cmp.eq(w + '.mc', None, qm, 'mc')
        else:
            qm = qm or {}
            cmp.eq(w + '.mc.lo', p['mc']['lo'], qm.get('lo'), 'mc', ok=mc_ok(p['mc'], qm.get('lo'), 'lo'))
            cmp.eq(w + '.mc.hi', p['mc']['hi'], qm.get('hi'), 'mc', ok=mc_ok(p['mc'], qm.get('hi'), 'hi'))
            cmp.eq(w + '.mc.of', 10, qm.get('of'), 'mc')
            cmp.eq(w + '.mc.h', 20, qm.get('h'), 'mc')
            cmp.eq(w + '.mc.in', MC_IN, qm.get('in'), 'mc')
        for bad in ('sell', 'half', 'base', 'amt'):
            cmp.eq('%s.%s 없음' % (w, bad), False, bad in q, 'files')
    cmp.eq('gdr.inds', mine['inds'], g.get('inds'), 'pick')
    cmp.eq('gdr.bigs', mine['bigs'], g.get('bigs'), 'pick')
    f3 = g.get('fall3') or {}
    cmp.eq('gdr.fall3.n', mine['fall3']['n'], f3.get('n'), 'fall3')
    cmp.eq('gdr.fall3.days', mine['fall3']['days'], f3.get('days'), 'fall3')
    cmp.eq('gdr.fall3.of', mine['fall3']['of'], f3.get('of'), 'fall3')
    # score
    ms, ts = mine['score'], g.get('score')
    if ms is None or ts is None:
        cmp.eq('gdr.score', ms, ts, 'score')
    else:
        for key in ('src', 'from', 'to', 'n', 'counted', 'up', 'lo', 'hi'):
            cmp.eq('gdr.score.%s' % key, ms[key], ts.get(key), 'score')
        trs = ts.get('rows') or []
        cmp.eq('gdr.score.rows.codes', [r['code'] for r in ms['rows']], [r.get('code') for r in trs], 'score')
        for r, q in zip(ms['rows'], trs):
            for key in ('code', 'name', 'from', 'to', 'up'):
                cmp.eq('gdr.score.rows[%s].%s' % (r['code'], key), r[key], q.get(key), 'score')
            for key in ('lo', 'hi'):
                mc = {'lo': r['lo'], 'hi': r['hi'], 'counts': r.get('mcCounts'), 'edges': r.get('mcEdges')}
                cmp.eq('gdr.score.rows[%s].%s' % (r['code'], key), r[key], q.get(key), 'mc',
                       ok=mc_ok(mc, q.get(key), key) if r.get('mcCounts') else None)
    # 공개 파일 금지 칸 · 글
    bad = [p for p, key, v in walk_keys(g) if key in FORBIDDEN_PUBLIC]
    cmp.eq('gdr 금지 칸', [], bad, 'files')
    txt = json.dumps(g, ensure_ascii=False)
    cmp.eq('gdr 금지 글', [], [w for w in FORBIDDEN_TEXT if w in txt], 'files')
    # gates.json
    if gates is not None:
        cmp.eq('gates.schema', SCHEMA_GATES, gates.get('schema'), 'files')
        cmp.eq('gates.version', VERSION, gates.get('version'), 'files')
        cmp.eq('gates.asOf', day, gates.get('asOf'), 'k')
        cmp.eq('gates.keys', GATE_KEYS, gates.get('keys'), 'files')
        cmp.eq('gates.need', NEED, gates.get('need'), 'files')
        co = gates.get('co') or {}
        cmp.eq('gates.co 번호', len(d.codes), len(co), 'files', ok=set(co) == set(d.codes),
               note='빠진 번호 %d · 남는 번호 %d' % (len(set(d.codes) - set(co)), len(set(co) - set(d.codes))))
        bad_rows = 0
        firsts = []
        for code in d.codes:
            my = mine['gates'][code]
            th = co.get(code)
            cmp.n += 1
            if not (isinstance(th, list) and len(th) == 7 and all(a == b and type(a) is type(b) or (a == b and
                    not isinstance(a, bool) and not isinstance(b, bool) and a is not None and b is not None)
                    for a, b in zip(my, th))):
                bad_rows += 1
                if len(firsts) < 30:
                    firsts.append({'code': code, 'mine': my, 'theirs': th})
        if bad_rows:
            cmp.diffs.append({'where': 'gates.co 줄', 'mine': '%d줄 다름' % bad_rows, 'theirs': firsts,
                              'table': TABLE_LINES['files'], 'follows': 'mine (표)'})
        # 저쪽 파일끼리 맞음(문마다 1 의 수 = counts)
        rows = [v for v in co.values() if isinstance(v, list) and len(v) == 7]
        for j in range(1, 6):
            cmp.eq('gates 1 의 수 g%d = gdr.counts' % j, sum(1 for v in rows if v[j] == 1), c.get('g%d' % j), 'files')
    # private
    if priv is not None:
        cmp.eq('private.schema', SCHEMA_PRIV, priv.get('schema'), 'files')
        cmp.eq('private.version', VERSION, priv.get('version'), 'files')
        cmp.eq('private.asOf', day, priv.get('asOf'), 'k')
        pp = priv.get('picks') or []
        cmp.eq('private.picks.codes', [p['code'] for p in mine['picks']], [p.get('code') for p in pp], 'sell')
        for p, q in zip(mine['picks'], pp):
            w = 'private.picks[%s]' % p['code']
            cmp.eq(w + '.price', p['price'], q.get('price'), 'sell')
            cmp.eq(w + '.w', p['w'], q.get('w'), 'sell')
            ms_, qs_ = p['sell'], q.get('sell')
            if ms_ is None or qs_ is None:
                cmp.eq(w + '.sell', None if ms_ is None else 'line %s' % ms_['line'], qs_, 'sell')
            else:
                cmp.eq(w + '.sell.line', ms_['line'], qs_.get('line'), 'sell', ok=(ms_['line'] == qs_.get('line') or ms_['edge']))
                cmp.eq(w + '.sell.ratio', ms_['ratio'], qs_.get('ratio'), 'sell',
                       ok=num_eq(ms_['ratio'], qs_.get('ratio')) or (ms_['roundEdge'] and num_eq(ms_['ratio'], qs_.get('ratio'), 2e-4)))
                cmp.eq(w + '.sell.sigma', ms_['sigma'], qs_.get('sigma'), 'sell',
                       ok=num_eq(ms_['sigma'], qs_.get('sigma')) or (ms_['roundEdge'] and num_eq(ms_['sigma'], qs_.get('sigma'), 2e-5)))
                cmp.eq(w + '.sell.basis', '종가', qs_.get('basis'), 'sell', ok=qs_.get('basis') in ('종가', 'close'))
                tt = qs_.get('touch') or {}
                for key in ('n', 'of', 'T', 'N'):
                    cmp.eq('%s.sell.touch.%s' % (w, key), ms_['touch'][key], tt.get(key), 'sell',
                           ok=(ms_['touch'][key] == tt.get(key)) or (key in ('n', 'T') and ms_['touchEdge'] > 0))
            if p['mc'] is not None:
                cmp.eq(w + '.mcCounts', p['mc']['counts'], q.get('mcCounts'), 'mc',
                       ok=isinstance(q.get('mcCounts'), list) and len(q['mcCounts']) == 4 and
                       all(abs(a - b) <= e for a, b, e in zip(p['mc']['counts'], q['mcCounts'], p['mc']['edges'])))
        txt = json.dumps(priv, ensure_ascii=False)
        cmp.eq('private 금지 글', [], [w for w in FORBIDDEN_TEXT if w in txt], 'files')


def mc_ok(mc, theirs, which):
    if theirs is None:
        return mc[which] is None
    if mc.get('counts') is None:
        return mc[which] == theirs
    if mc[which] == theirs:
        return True
    lo_c = [a - e for a, e in zip(mc['counts'], mc['edges'])]
    hi_c = [a + e for a, e in zip(mc['counts'], mc['edges'])]
    if which == 'lo':
        return (10 * min(lo_c)) // 2000 <= theirs <= (10 * min(hi_c)) // 2000
    return -((-10 * max(lo_c)) // 2000) <= theirs <= -((-10 * max(hi_c)) // 2000)


def invariants(g, gates, d, label):
    out = {}
    picks = g.get('picks') or []
    c = g.get('counts') or {}
    wsum = sum(F(str(p.get('w', 0))) for p in picks)
    out['sumW_plus_cash_eq_100'] = {'ok': c.get('cash') is not None and wsum + F(str(c.get('cash'))) == 100,
                                    'detail': {'sumW': float(wsum), 'cash': c.get('cash')}}
    big = defaultdict(F)
    ind = Counter()
    for p in picks:
        big[p.get('big') or p.get('ind')] += F(str(p.get('w', 0)))
        ind[p.get('ind')] += 1
    out['big_sum_le_9'] = {'ok': all(v <= BIG_CAP for v in big.values()), 'detail': {a: float(b) for a, b in big.items()}}
    out['per_industry_le_2'] = {'ok': all(v <= PER_IND2 for v in ind.values()), 'detail': dict(ind)}
    out['picks_le_36'] = {'ok': len(picks) <= MAX_PICKS, 'detail': len(picks)}
    out['picked_eq_len'] = {'ok': c.get('picked') == len(picks)}
    out['no_duplicate_codes'] = {'ok': len(set(p.get('code') for p in picks)) == len(picks)}
    if gates is not None:
        co = gates.get('co') or {}
        out['gates_companies'] = {'ok': len(co) == c.get('companies'), 'detail': [len(co), c.get('companies')]}
        out['picks_pass_all_in_gates'] = {'ok': all(co.get(p.get('code')) == [0, 1, 1, 1, 1, 1, 1] for p in picks)}
        out['x_nonzero_g_null'] = {'ok': all(all(v is None for v in r[1:6]) for r in co.values()
                                             if isinstance(r, list) and len(r) == 7 and r[0] != 0)}
        out['l_rule'] = {'ok': all((r[6] == 0) if r[0] == 3 else ((r[6] is None) if r[0] in (1, 2) else r[6] in (1, None))
                                   for r in co.values() if isinstance(r, list) and len(r) == 7)}
        out['counts_add_up'] = {'ok': c.get('outThin', 0) + c.get('outHalt', 0) + c.get('outList', 0) + c.get('afterOut', 0)
                                == c.get('companies'), 'detail': [c.get('outThin'), c.get('outHalt'), c.get('outList'),
                                                                  c.get('afterOut'), c.get('companies')]}
    out['passAll_ge_picked'] = {'ok': (c.get('passAll') or 0) >= (c.get('picked') or 0)}
    out['why_null_iff_picks'] = {'ok': (c.get('why') is None) == bool(picks)}
    return out


# ── 지난 성적 표본(gdr-back.json) ───────────────────────────────────────────────
def end_close(d, e, valid):
    """끝 = e 날 줄 종가 · 줄 없으면 앞 마지막 줄(gdr-back.json rules.value)."""
    dates, closes = valid
    j = bisect.bisect_right(dates, d.cal[e]) - 1
    return closes[j] if j >= 0 else None


def load_kospi():
    out = {}
    try:
        for dte, v in read_json(KOSPI_FILES[0]):
            out[dte] = v
    except Exception:  # noqa: BLE001
        pass
    try:
        for r in read_json(KOSPI_FILES[1]).get('rows') or []:
            out.setdefault(r['date'], r['close'])
    except Exception:  # noqa: BLE001
        pass
    return out


def check_back(cmp, d, bundle, back, ndays, log):
    res = {'days': [], 'compared': 0, 'diffs': 0}
    if back is None:
        res['skipped'] = 'gdr-back.json 없음'
        return res
    win = back.get('window') or {}
    k0, k1 = win.get('k0', 250), win.get('k1', d.K - 21)
    rows_by_k = {r[0]: r for r in back.get('picks') or []}
    m1 = {r[0]: r for r in back.get('m1') or []}
    m3 = {r[0]: r for r in back.get('m3') or []}
    cols = back.get('columns') or []
    sample = set(k0 + round(j * (k1 - k0) / (ndays - 1)) for j in range(ndays))
    picked_days = sorted(kk for kk, r in rows_by_k.items() if r[4])
    sample |= set(picked_days[::2])
    sample = sorted(kk for kk in sample if kk in rows_by_k)
    raw = {}
    for c in d.codes:
        rr = [(str(r[0]), r[4]) for r in (((bundle['stocks'].get(c) or {}).get('fchart') or {}).get('rows') or [])
              if len(r) > 4 and isinstance(r[4], (int, float)) and not isinstance(r[4], bool) and r[4] > 0]
        rr.sort()
        raw[c] = ([a for a, _ in rr], [b for _, b in rr])
    kospi = load_kospi()
    before = len(cmp.diffs)
    n0 = cmp.n
    for kk in sample:
        sb = select_back(d, kk)
        tr = rows_by_k[kk]
        mine_p = [[d.codes[i], float(w)] for i, w in sb['picks']]
        cmp.eq('back[%d].date' % kk, d.cal_iso[kk], tr[1], 'back')
        cmp.eq('back[%d].why' % kk, sb['why'], tr[2], 'back')
        cmp.eq('back[%d].cash' % kk, sb['cash'], tr[3], 'back')
        cmp.eq('back[%d].picks' % kk, mine_p, tr[4], 'back')
        day = {'k': kk, 'date': d.cal_iso[kk], 'picks': len(mine_p), 'why': sb['why']}
        for name, h, tab in (('m1', 20, m1), ('m3', 60, m3)):
            if kk not in tab or kk + h >= d.K:
                continue
            e = kk + h
            rets = {}
            for i in range(d.n):
                V = d.V[i][kk]
                C0 = d.C[i][kk]
                if C0 is None or V is None or V <= 0:
                    continue
                ec = end_close(d, e, raw[d.codes[i]])
                if ec is None:
                    continue
                rets[i] = ec / C0 - 1
            allv = sorted(rets.values())
            all_mean = sum(allv) / len(allv) if allv else None
            nn = len(allv)
            all_med = (allv[nn // 2] if nn % 2 else (allv[nn // 2 - 1] + allv[nn // 2]) / 2) if nn else None
            pr = [rets.get(i) for i, _ in sb['picks']]
            if not sb['picks']:
                basket, rule = 0.0, 0.0
            elif any(v is None for v in pr):
                basket = rule = None
            else:
                basket = sum(pr) / len(pr)
                rule = sum(float(w) * v for (i, w), v in zip(sb['picks'], pr)) / 100
            ko = None
            a, b = kospi.get(d.cal_iso[kk]), kospi.get(d.cal_iso[e])
            if a and b:
                ko = b / a - 1
            tr2 = dict(zip(cols, tab[kk]))
            for key, val in (('basket', basket), ('rule', rule), ('allMean', all_mean), ('allMedian', all_med),
                             ('kospi', ko), ('n', len(sb['picks']))):
                theirs = tr2.get(key)
                ok = (val is None and theirs is None) or (val is not None and theirs is not None and
                                                         abs(val - theirs) <= 5.0000001e-7)
                cmp.eq('back.%s[%d].%s' % (name, kk, key), None if val is None else round(val, 6), theirs, 'back', ok=ok)
        res['days'].append(day)
    # 모음 줄(summary)을 날마다 줄에서 다시 셈(gdr-back.json rules.compare: 이긴 날 = 고도리 칸 오름이 더 큼)
    for name in ('m1', 'm3'):
        sm = (back.get('summary') or {}).get(name)
        if not isinstance(sm, dict):
            continue
        rows = [dict(zip(cols, r)) for r in back.get(name) or []
                if 0 <= r[0] < d.K and sm.get('from', '') <= d.cal_iso[r[0]] <= sm.get('to', '')]

        def win(a, b):
            return sum(1 for r in rows if r.get(a) is not None and r.get(b) is not None and r[a] > r[b])
        tally = {'days': len(rows), 'cash': sum(1 for r in rows if r.get('n') == 0), 'winAll': win('basket', 'allMean'),
                 'winKospi': win('basket', 'kospi'), 'winAllMedian': win('basket', 'allMedian')}
        for key, val in tally.items():
            cmp.eq('back.summary.%s.%s' % (name, key), val, sm.get(key), 'back')
        if rows:
            w = min((r for r in rows if r.get('basket') is not None), key=lambda r: (r['basket'], r['k']))
            cmp.eq('back.summary.%s.worst' % name, {'k': w['k'], 'r': w['basket']},
                   {'k': (sm.get('worst') or {}).get('k'), 'r': (sm.get('worst') or {}).get('r')}, 'back')
    res['compared'] = cmp.n - n0
    res['diffs'] = len(cmp.diffs) - before
    res['sample'] = sample
    log('지난 성적 표본 %d날 · 맞댄 칸 %d · 틀림 %d' % (len(sample), res['compared'], res['diffs']))
    return res


# ── 실행 ──────────────────────────────────────────────────────────────────────
def parse_args(argv=None):
    ap = argparse.ArgumentParser(description='고도리 칸 셈 gdr-v2 따로 세기')
    for name in ('--bundle', '--site', '--quarters', '--lists', '--gdr', '--gates', '--private', '--prev', '--asof',
                 '--out', '--back-file', '--stress-dir'):
        ap.add_argument(name, default=None)
    ap.add_argument('--back', action='store_true')
    ap.add_argument('--back-days', type=int, default=20)
    ap.add_argument('--stress', action='store_true')
    ap.add_argument('--stress-only', default=None, help='쉼표로 일부러 만든 자료 가지 이름만(빠른 확인 · 문 못 지남)')
    ap.add_argument('--no-synth', action='store_true')
    ap.add_argument('--quiet', action='store_true')
    return ap.parse_args(argv)


def env_or(v, name):
    if v:
        return v
    e = os.environ.get(name)
    return e if e else None


def resolve_inputs(args, gdr=None):
    bundle = env_or(args.bundle, 'GDR_BUNDLE')
    if not bundle:
        try:
            bundle = os.path.join(ROOT, read_json(UNIVERSE_JSON)['bundle'])
        except Exception as e:  # noqa: BLE001
            raise DataError('universe.json bundle 못 읽음: %s' % e)
    site = env_or(args.site, 'GDR_SITE') or SITE_DEFAULT
    if os.path.isdir(site):
        mkt_p, core_p = os.path.join(site, 'mkt.json'), os.path.join(site, 'core.json')
    else:
        mkt_p, core_p = site, os.path.join(os.path.dirname(site), 'core.json')
    out = {'bundle': bundle, 'mkt': mkt_p, 'core': core_p}
    src = (gdr or {}).get('src') if isinstance(gdr, dict) else None
    src = src if isinstance(src, dict) else {}
    for key, flag, default in (('quarters', args.quarters, QUARTERS_DEFAULT), ('lists', args.lists, LISTS_DEFAULT)):
        if flag is not None:                       # 옵션이 있으면 그대로('' = 없음)
            out[key], out[key + 'From'] = (flag or None), 'flag'
            continue
        sp = src.get(key)                          # 옵션이 없으면 gdr.json 이 쓴 입력을 따름(없음이면 없음)
        if not sp:
            out[key], out[key + 'From'] = None, 'gdr.src null'
            continue
        cand = sp if os.path.isabs(sp) else os.path.join(ROOT, sp)
        if os.path.exists(cand):
            out[key], out[key + 'From'] = cand, 'gdr.src'
        elif os.path.exists(default):
            out[key], out[key + 'From'] = default, 'default(gdr.src 파일이 이 기계에 없음)'
        else:
            raise Unavailable('gdr.json 이 쓴 %s 파일(%s)이 이 기계에 없음' % (key, sp))
    return out


def pick_k(d, args, gdr):
    lim = min(d.mkt_asof or '9999-99-99', d.bundle_last or '9999-99-99')
    k_rule = max((k for k, x in enumerate(d.cal_iso) if x <= lim), default=None)
    asof = env_or(args.asof, 'GDR_ASOF')
    if asof:
        ks = [k for k, x in enumerate(d.cal_iso) if x <= asof]
        if not ks:
            raise DataError('--asof %s 보다 이른 달력 날이 없음' % asof)
        return ks[-1], ('--asof' if d.cal_iso[ks[-1]] == asof else '--asof(달력 날 아님 → 그 앞 날)')
    ga = (gdr or {}).get('asOf')
    if isinstance(ga, str) and d.mkt_asof and ga > d.mkt_asof:
        if ga in d.cal_iso:
            return d.cal_iso.index(ga), 'gdr.json asOf(사이트 날보다 늦은 달력 날 · 장 끝난 뒤 실행)'
        raise Unavailable('gdr.json asOf %s 는 사이트 날 %s 뒤인데 이 모음 달력에 없음(장 끝난 뒤 실행의 임시 모음이 이 기계에 없음)'
                          % (ga, d.mkt_asof))
    return k_rule, '§2 규칙'


def main(argv=None):
    args = parse_args(argv)
    t0 = time.time()
    log = (lambda *a: None) if args.quiet else (lambda *a: print(*a, file=sys.stderr, flush=True))
    out_p = args.out or OUT_DEFAULT
    report = {'schema': 'godori-verify2-1', 'at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
              'version': VERSION, 'by': 'G4x verify2.py (결정표만 · 만든 쪽 코드 안 엶)', 'readings': READINGS}
    secs = {}

    def finish(code):
        report['exit'] = code
        report['secs'] = {k: round(v, 1) for k, v in secs.items()}
        report['secs']['total'] = round(time.time() - t0, 1)
        os.makedirs(os.path.dirname(out_p), exist_ok=True)
        with open(out_p, 'w', encoding='utf-8') as f:
            json.dump(jsonable(report), f, ensure_ascii=False, indent=1)
            f.write('\n')
        log('결과 %s · 끝 코드 %d · %.1f초' % (os.path.relpath(out_p, ROOT), code, time.time() - t0))
        return code

    # 결정표
    try:
        with open(TABLE, encoding='utf-8') as f:
            first = f.readline().strip()
        report['table'] = {'path': os.path.relpath(TABLE, ROOT), 'sha256': sha256_file(TABLE), 'status': first}
        if first != '상태: 완성':
            report['error'] = '결정표 첫 줄이 「상태: 완성」이 아님'
            return finish(3)
        report['table']['rulesCheck'] = table_rules_check(TABLE)
    except OSError as e:
        report['error'] = '결정표 못 읽음: %s' % e
        return finish(3)
    # 저쪽 파일(입력 길을 gdr.json src 에서 따르기 위해 먼저 읽음)
    gdr_p = args.gdr or GDR_DEFAULT
    gates_p = args.gates or GATES_DEFAULT
    gdr, gerr = read_json_safe(gdr_p)
    gates, terr = read_json_safe(gates_p)
    # 자료
    try:
        ins = resolve_inputs(args, gdr)
    except Unavailable as e:
        report['error'] = str(e)
        return finish(4)
    except DataError as e:
        report['error'] = str(e)
        return finish(3)
    try:
        t = time.time()
        bundle = read_json(ins['bundle'])
        mkt = read_json(ins['mkt'])
        core = read_json(ins['core'])
        secs['readBundle'] = time.time() - t
    except (OSError, ValueError, DataError) as e:
        report['error'] = '자료 못 읽음: %s' % e
        return finish(3)
    qobj, qerr = read_json_safe(ins['quarters']) if ins['quarters'] else (None, 'missing')
    lobj, lerr = read_json_safe(ins['lists']) if ins['lists'] else (None, 'missing')
    if qerr and qerr != 'missing' or lerr and lerr != 'missing':
        report['error'] = '분기 · 목록 파일 못 읽음: %s %s' % (qerr, lerr)
        return finish(3)
    t = time.time()
    d = build(bundle, mkt, core, parse_quarters(qobj), parse_lists(lobj))
    secs['build'] = time.time() - t
    report['inputs'] = {
        'bundle': {'path': os.path.relpath(ins['bundle'], ROOT), 'sha256': sha256_file(ins['bundle']), 'last': d.bundle_last},
        'mkt': {'path': os.path.relpath(ins['mkt'], ROOT), 'asOf': d.mkt_asof, 'sha256': sha256_file(ins['mkt'])},
        'core': {'path': os.path.relpath(ins['core'], ROOT), 'sha256': sha256_file(ins['core'])},
        'quarters': {'path': os.path.relpath(ins['quarters'], ROOT) if ins['quarters'] else None, 'from': ins['quartersFrom'],
                     'present': qobj is not None},
        'lists': {'path': os.path.relpath(ins['lists'], ROOT) if ins['lists'] else None, 'from': ins['listsFrom'],
                  'present': lobj is not None, 'complete': d.lists_complete},
        'calendar': {'n': d.K, 'first': d.cal_iso[0] if d.K else None, 'last': d.cal_iso[-1] if d.K else None,
                     'k250': d.cal_iso[250] if d.K > 250 else None},
    }
    # 저쪽 파일
    priv_p = env_or(args.private, 'GDR_PRIVATE')
    priv, perr = (read_json_safe(priv_p) if priv_p else (None, 'not given'))
    report['inputs']['gdr'] = {'path': os.path.relpath(gdr_p, ROOT), 'error': gerr,
                               'sha256': sha256_file(gdr_p) if not gerr else None}
    report['inputs']['gates'] = {'path': os.path.relpath(gates_p, ROOT), 'error': terr,
                                 'sha256': sha256_file(gates_p) if not terr else None}
    report['inputs']['private'] = {'path': priv_p, 'error': perr if priv_p else None,
                                   'sha256': sha256_file(priv_p) if priv_p and not perr else None}
    prev = None
    if args.prev:
        prev, prerr = read_json_safe(args.prev)
        report['inputs']['prev'] = {'path': args.prev, 'error': prerr}
    try:
        k, ksrc = pick_k(d, args, gdr)
    except Unavailable as e:
        report['error'] = str(e)
        return finish(4)
    except DataError as e:
        report['error'] = str(e)
        return finish(3)
    report['k'] = {'k': k, 'day': d.cal_iso[k], 'src': ksrc}
    log('달력 %d날 · k %d(%s · %s) · 회사 %d' % (d.K, k, d.cal_iso[k], ksrc, d.n))
    t = time.time()
    mine = compute_site(d, k, prev)
    secs['recount'] = time.time() - t
    report['mine'] = {'counts': mine['counts'], 'loss3Years': mine['loss3Years'], 'status': mine['status'],
                      'sens': {key: [[float(a), b] for a, b in v] for key, v in mine['sens'].items()},
                      'picks': [{kk: vv for kk, vv in p.items() if kk not in ('i',)} for p in mine['picks']],
                      'fall3': mine['fall3'], 'inds': mine['inds'], 'bigs': mine['bigs'], 'score': mine['score'],
                      'order': mine['order'][:60], 'edges': mine['edges']}
    cmp = Cmp()
    if gerr or terr:
        report['error'] = 'gdr.json · gates.json 없음 · 못 읽음: %s %s' % (gerr, terr)
        report['compared'] = 0
        report['diffs'] = []
        return finish(2)
    for dd in report['table']['rulesCheck']['diffs']:
        cmp.eq(dd['where'] + ' (verify2 상수 ≠ 결정표 · verify2 를 표에 맞춰 고칠 것)', dd.get('mine'), dd.get('theirs'),
               'sens', ok=False, follows='table')
    compare_site(cmp, d, mine, gdr, gates, priv if priv_p and not perr else None, args, ksrc)
    if priv_p and perr:
        cmp.eq('private 파일', 'readable', perr, 'files')
    report['invariants'] = invariants(gdr, gates, d, 'theirs')
    report['counts_theirs'] = gdr.get('counts')
    if args.back:
        t = time.time()
        back, berr = read_json_safe(args.back_file or BACK_DEFAULT)
        report['back'] = check_back(cmp, d, bundle, back, max(2, args.back_days), log)
        if berr:
            report['back']['error'] = berr
        secs['back'] = time.time() - t
    if args.stress:
        t = time.time()
        report['stress'] = run_stress(d, bundle, ins, args, log)
        secs['stress'] = time.time() - t
    inv_bad = [k_ for k_, v in report['invariants'].items() if not v['ok']]
    stress_bad = bool(report.get('stress')) and not report['stress'].get('ok', False)
    report['compared'] = cmp.n
    report['diffN'] = len(cmp.diffs)
    report['diffs'] = cmp.diffs
    report['invariantsBad'] = inv_bad
    report['ok'] = not cmp.diffs and not inv_bad and not stress_bad
    log('맞댄 칸 %d · 틀림 %d · 불변식 어긋남 %d%s' % (cmp.n, len(cmp.diffs), len(inv_bad),
                                               (' · 일부러 만든 자료 %s' % ('통과' if not stress_bad else '틀림'))
                                               if args.stress else ''))
    for dd in cmp.diffs[:40]:
        log('  틀림 %s · 내 값 %s · 저쪽 %s' % (dd['where'], json.dumps(jsonable(dd['mine']), ensure_ascii=False)[:160],
                                          json.dumps(jsonable(dd['theirs']), ensure_ascii=False)[:160]))
    return finish(0 if report['ok'] else 1)


# ── 일부러 만든 자료(--stress) — pick2.mjs 를 검은 상자로만(코드는 안 엶) ───────────────────
Q_KEYS = ['202406', '202409', '202412', '202503', '202506', '202509', '202512', '202603', '202606']


def synth_quarters(d, variant):
    """회사마다 번호로 정해지는 가짜 분기 9개 — 늘어남 · 줄어듦 · 같음 · 빈 값 · 끊김 · 예상 줄 · 같은 key · 다른 이름 · 글 수."""
    co = {}
    for c in d.codes:
        h = fnv1a('q|%s|%s' % (c, variant))
        if h % 17 == 0:
            continue                                   # 분기 자료 없는 회사
        sel = (h >> 4) % 10
        n = len(Q_KEYS)
        inc = 1 + (h >> 9) % 15
        sinc = 5 + (h >> 7) % 40
        base_o = 10 + (h >> 12) % 300
        if (h >> 22) % 9 == 0:
            base_o = -base_o
        base_s = 200 + (h >> 14) % 5000
        ops = [base_o + j * inc for j in range(n)]
        sales = [base_s + j * sinc for j in range(n)]
        if sel == 6:
            sales = [base_s - j * 3 for j in range(n)]
        elif sel == 7:
            ops[-1] = ops[-5]                          # 마지막 분기 = 1년 전 같은 분기(늘지 않음)
        elif sel == 8:
            ops = [base_o - j * 2 for j in range(n)]
        elif sel == 9:
            ops[-2] = None                             # 빈 값
        keys = list(Q_KEYS)
        if (h >> 26) % 11 == 0:
            idx = keys.index('202509')
            del keys[idx], ops[idx], sales[idx]        # 석 달 끊김
        fmt = (h >> 3) % 3
        rows = []
        for key, o, sa in zip(keys, ops, sales):
            net = None if o is None else (o * 4) // 5
            if fmt == 0:
                rows.append({'key': key, 'sales': sa, 'op': o, 'net': net})
            elif fmt == 1:
                rows.append({'key': key, 'rev': format(sa, ','), 'op': '-' if o is None else format(o, ','),
                             'net': '-' if net is None else format(net, ',')})
            else:
                rows.append({'key': key, '매출액': format(sa, ','), '영업이익': '-' if o is None else format(o, ','),
                             '당기순이익': '-' if net is None else format(net, ',')})
        rows.append({'key': '202609', 'sales': 1, 'op': 10 ** 6, 'net': 1, 'isConsensus': 'Y'})
        if (h >> 15) % 13 == 0:
            rows.append({'key': keys[-1], 'sales': 1, 'op': -10 ** 6, 'net': -1})   # 같은 key 는 처음 것
        co[c] = {'q': rows} if (h >> 5) % 2 else rows
    return {'schema': 'stress-quarters', 'co': co}


def synth_lists(codes, kind):
    """목록에 그날 후보 일부(둘째 · 넷째 · 여섯째)만 넣음 — 나머지는 고를 수 있게 남김."""
    pick = lambda *ix: [codes[j] for j in ix if j < len(codes)]  # noqa: E731
    if kind == 'full':
        return {'lists': {'managed': pick(1), 'warning': pick(5), 'danger': [], 'halted': []},
                'dart': {'ok': True, 'cb': pick(3), 'rights': []}}
    if kind == 'alt':
        return {'lists': {'관리': [], '투자경고': pick(1), 'risk': [], 'halt': pick(5)},
                'dart': {'ok': True, '전환사채': [], '유상증자': pick(3)}}
    if kind == 'partial':
        return {'lists': {'managed': pick(1), 'warning': [], 'danger': [], 'halted': None},
                'dart': {'ok': True, 'cb': [], 'rights': []}}
    if kind == 'dartoff':
        return {'lists': {'managed': [], 'warning': [], 'danger': [], 'halted': []},
                'dart': {'ok': False, 'cb': pick(3), 'rights': []}}
    return None


def candidates_at(d, k, qobj):
    """목록 문이 실제로 일하게 — 그날 내 셈으로 목록 말고 다 지나는 곳(없으면 x 0 인 곳) 번호."""
    attach(d, parse_quarters(qobj) if qobj is not None else None, parse_lists(synth_lists([], 'full')))
    day = Day(d, k, 'site')
    th = dict(TH0)
    rows = [day.row(i, th) for i in range(d.n)]
    order, picks, _, _, _ = select(day, rows, th)
    if order:
        return [d.codes[i] for i in order]
    return [d.codes[i] for i in range(d.n) if rows[i][0] == 0]


def _gauss(rng):
    u1 = max(rng(), 1e-12)
    u2 = rng()
    return math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)


def _steps(k, spec):
    """spec = [(마지막 날 자리(k−n) 까지, 값), …] → 날 자리 → 값 함수(앞에서 처음 맞는 칸)."""
    def f(kk):
        for upto, v in spec:
            if kk <= k - upto:
                return v
        return spec[-1][1]
    return f


SPECIALS = [
    # 이름, 값 칸(k−n 까지 값), 거래대금(앞 · 마지막 20날) — 정확한 나눗셈이 되게 고름
    ('quiet', [(41, 8000), (31, 9000), (0, 10000)], (1440000000, 2880000000)),     # 6000·s20 = 2000·s120 딱 → 지남 · quietX 가까스로
    ('thin', [(41, 8000), (31, 9000), (0, 10000)], (900000000, 1000000000)),       # s20 = 20 × 10억 딱 → 지남 · thin 가까스로
    ('r60lo', [(31, 10000), (0, 10500)], (2100000000, 2100000000)),                 # 석 달 +5% 딱 → 지남 · r60lo 가까스로
    ('r60hi', [(51, 10000), (41, 11200), (31, 12500), (0, 14000)], (2800000000, 2800000000)),  # +40% 딱
    ('mdd60', [(51, 10000), (46, 11000), (41, 12000), (36, 9600), (31, 11000), (0, 12500)], (2640000000, 2640000000)),
    ('dd0', [(51, 9600), (41, 10800), (21, 12000), (11, 11000), (0, 10200)], (2423520000, 2423520000)),
    ('hot5', [(31, 9500), (1, 10000), (0, 10999)], (3000000000, 3000000000)),       # 5일 +9.99% → 지남 · hot5 가까스로
    ('hot5x', [(31, 9500), (1, 10000), (0, 11000)], (3000000000, 3000000000)),      # 5일 +10% 딱 → 못 지남
    ('jumpx', [(61, 9000), (11, 10000), (0, 11500)], (3000000000, 3000000000)),     # 하루 +15% 딱 → 못 지남
    ('low2x', [(201, 5000), (171, 5600), (141, 6250), (111, 7000), (81, 7800), (51, 8700), (26, 9600), (0, 10000)],
     (3000000000, 3000000000)),                                                     # 1년 바닥 2배 딱 → 못 지남
]


def synth_bundle(bundle, d):
    """진짜 모음에서 큰 업종마다 업종 셋을 골라 마지막 300날 값을 바꾼 모음 — 고른 곳이 많이 생기게(업종 · 큰 업종 위 끝 · 상관 · 비중 3 · 2.5 · 2 · 세 곳이 함께 내린 날 · 경계 값)."""
    K = d.K
    k = K - 1
    start = k - 299
    rng = mulberry32(fnv1a('g4x-synth-1'))
    bigs = sorted(set(v for v in d.big_of.values() if v))
    chosen = []
    for big in bigs:
        inds = sorted([x for x in d.members if d.big_of.get(x) == big and 6 <= len(d.members[x]) <= 30],
                      key=lambda x: (len(d.members[x]), x))
        chosen += inds[:3]
    stocks = dict(bundle['stocks'])
    quarters, cands, specials_at = {}, [], {}
    prices = [1500, 3200, 8000, 15000, 42000, 120000, 380000, 650000]
    crash = set([k - 230, k - 180, k - 130, k - 90, k - 40])
    sp_iter = 0
    twin = {}
    for j, name in enumerate(chosen):
        mem = sorted(d.members[name], key=lambda i: d.codes[i])
        corr_hi = (j % 3 == 0)
        fac = [_gauss(rng) for _ in range(300)]
        for m_idx, i in enumerate(mem):
            code = d.codes[i]
            is_c = m_idx < 3
            h = fnv1a('s|' + code)
            sp = None
            if is_c and m_idx == 0 and not corr_hi and sp_iter < len(SPECIALS):
                sp = SPECIALS[sp_iter]
                sp_iter += 1
            if sp is not None:
                f = _steps(k, sp[1])
                closes = [f(start + t) for t in range(300)]
                tv_lo, tv_hi = sp[2]
                vols = []
                for t, c in enumerate(closes):
                    tv = tv_hi if start + t >= k - 19 else tv_lo
                    vols.append(tv // c if tv % c == 0 else max(1, int(round(tv / c))))
                specials_at[code] = sp[0]
            else:
                P0 = prices[h % len(prices)]
                a, b = (0.009, 0.0025) if corr_hi else (0.0, 0.009)
                cum = 0.0
                closes = []
                for t in range(300):
                    kk = start + t
                    mu = 0.0025 if kk > k - 60 else 0.0008
                    r = mu + a * fac[t] + b * _gauss(rng)
                    if kk in crash:
                        r -= 0.045
                    if kk - 1 in crash:
                        r += 0.045
                    cum += r
                    closes.append(max(1, int(round(P0 * math.exp(cum)))))
                tv_hi, tv_lo = (4e9, 3e9) if is_c else (2e8, 1.5e8)
                vols = [max(1, int(round((tv_hi if start + t >= k - 19 else tv_lo) / c))) for t, c in enumerate(closes)]
            if is_c and m_idx == 1 and j in (1, 3) and 'A' not in twin:
                twin['A'] = (code, closes)
            st = dict(stocks.get(code) or {})
            fc = dict(st.get('fchart') or {})
            keep = [r for r in (fc.get('rows') or []) if str(r[0]) < d.cal[start]]
            fc['rows'] = keep + [[d.cal[start + t], c, c, c, c, v] for t, (c, v) in enumerate(zip(closes, vols))]
            st['fchart'] = fc
            stocks[code] = st
            if is_c:
                cands.append(code)
    # 쌍둥이(값 2배 · 다른 큰 업종의 둘째 회사) — 차례가 같으면 번호 차례
    if 'A' in twin:
        codeA, closesA = twin['A']
        for j, name in enumerate(chosen):
            if j in (5, 7):
                mem = sorted(d.members[name], key=lambda i: d.codes[i])
                codeB = d.codes[mem[1]]
                st = dict(stocks[codeB])
                fc = dict(st['fchart'])
                rows = [r for r in fc['rows'] if str(r[0]) < d.cal[start]]
                fc['rows'] = rows + [[d.cal[start + t], 2 * c, 2 * c, 2 * c, 2 * c, max(1, int(round(4e9 / (2 * c))))]
                                     for t, c in enumerate(closesA)]
                st['fchart'] = fc
                stocks[codeB] = st
                twin['B'] = codeB
                break
    # 분기 · 해마다 결산(고를 곳만)
    for n_, code in enumerate(cands):
        h = fnv1a('qq|' + code)
        g = 1.0 + (1 + h % 9) / 100.0
        base = 50 + (h >> 8) % 400
        ops = [int(round(base * g ** t)) for t in range(9)]
        sales = [int(round(10 * base * (1.0 + (h >> 4) % 7 / 100.0) ** t)) for t in range(9)]
        if n_ % 17 == 3:
            ops[-5:] = [-30, -20, -10, 5, 50]          # 앞 4분기 합 < 0
        elif n_ % 17 == 7:
            ops[-5:] = [-10, 0, 5, 5, 20]              # 앞 4분기 합 = 0
        elif n_ % 17 == 11:
            ops[-1] = ops[-5] + 1                      # 아주 조금 늘어남
        elif n_ % 17 == 13:
            ops[-1] = ops[-5]                          # 같음 → 못 지남
        if twin.get('B') == code or twin.get('A', (None,))[0] == code:
            mult = 2 if twin.get('B') == code else 1
            ops = [mult * (100 + 7 * t) for t in range(9)]
            sales = [mult * (1000 + 40 * t) for t in range(9)]
        quarters[code] = [{'key': key, 'sales': sa, 'op': o, 'net': (o * 4) // 5} for key, sa, o in zip(Q_KEYS, sales, ops)]
        loss = (n_ % 23 == 5)
        blank = (n_ % 23 == 9)
        cols = ['202312', '202412', '202512', '202612']
        vals = {'매출액': [4 * sales[1], 4 * sales[4], 4 * sales[7], 10 ** 7],
                '영업이익': [4 * ops[1] if ops[1] > 0 else 10, 4 * abs(ops[4]) + 1, 4 * abs(ops[7]) + 1, -10 ** 6],
                '당기순이익': [3 * abs(ops[1]) + 1, (-5 if loss else 3 * abs(ops[4]) + 1), 3 * abs(ops[7]) + 1, -10 ** 6],
                'EPS': [100 + h % 900, 120 + h % 900, 150 + h % 900, 99999],
                'BPS': [5000 + h % 9000, 5200 + h % 9000, 5500 + h % 9000, 99999]}
        rows = []
        for title, vv in vals.items():
            colmap = {}
            for key, v in zip(cols, vv):
                colmap[key] = {'value': format(v, ','), 'cx': None}
            if blank and title == '당기순이익':
                colmap['202312'] = {'value': '-', 'cx': None}
            rows.append({'title': title, 'columns': colmap})
        fin = {'itemCode': code, 'financePeriodType': 'annual', 'financeInfo': {
            'itemCode': code,
            'trTitleList': [{'isConsensus': 'N', 'title': '2023.12.', 'key': '202312'},
                            {'isConsensus': 'N', 'title': '2024.12.', 'key': '202412'},
                            {'isConsensus': 'N', 'title': '2025.12.', 'key': '202512'},
                            {'isConsensus': 'Y', 'title': '2026.12.', 'key': '202612'}],
            'rowList': rows}}
        st = dict(stocks[code])
        fi = dict(st.get('finance') or {})
        fi['text'] = json.dumps(fin, ensure_ascii=False)
        st['finance'] = fi
        stocks[code] = st
    sb = dict(bundle)
    sb['stocks'] = stocks
    lobj = {'lists': {'managed': cands[4:5], 'warning': [], 'danger': [], 'halted': []},
            'dart': {'ok': True, 'cb': cands[9:10], 'rights': []}}
    meta = {'industries': chosen, 'candidates': len(cands), 'specials': specials_at, 'twin': [twin.get('A', (None,))[0], twin.get('B')],
            'crashDays': sorted(d.cal_iso[x] for x in crash)}
    return sb, {'co': quarters}, lobj, meta


def run_synth_case(d, bundle, tmp, args, perm, log):
    t = time.time()
    name = 'S_synth_bundle'
    sb, qobj, lobj, meta = synth_bundle(bundle, d)
    cdir = os.path.join(tmp, '_in_' + name)
    os.makedirs(cdir, exist_ok=True)
    bpath = os.path.join(cdir, 'bundle.json.gz')
    with gzip.open(bpath, 'wt', encoding='utf-8', compresslevel=1) as f:
        json.dump(sb, f, ensure_ascii=False)
    qpath = os.path.join(cdir, 'quarters.json')
    lpath = os.path.join(cdir, 'lists.json')
    with open(qpath, 'w', encoding='utf-8') as f:
        json.dump(qobj, f, ensure_ascii=False)
    with open(lpath, 'w', encoding='utf-8') as f:
        json.dump(lobj, f, ensure_ascii=False)
    outd = os.path.join(tmp, name)
    os.makedirs(outd, exist_ok=True)
    cmd = ['node']
    if perm:
        cmd += [perm, '--allow-fs-read=*', '--allow-fs-write=' + outd]
    cmd += [PICK2, '--bundle', bpath, '--quarters', qpath, '--lists', lpath, '--out', os.path.join(outd, 'gdr.json'),
            '--gates', os.path.join(outd, 'gates.json'), '--private', os.path.join(outd, 'priv.json')]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=900, cwd=ROOT)
    case = {'case': name, 'exit': r.returncode, 'meta': meta}
    gdr, e1 = read_json_safe(os.path.join(outd, 'gdr.json'))
    gates, e2 = read_json_safe(os.path.join(outd, 'gates.json'))
    priv, e3 = read_json_safe(os.path.join(outd, 'priv.json'))
    if r.returncode != 0 or e1 or e2:
        case.update({'ok': False, 'stderr': (r.stderr or '')[-1200:], 'stdout': (r.stdout or '')[-600:], 'errors': [e1, e2, e3]})
        log('  일부러 %s: pick2 끝 코드 %s · %s' % (name, r.returncode, (r.stderr or r.stdout or '')[-300:]))
        return case
    d2 = build(sb, {'asOf': d.mkt_asof, 'companies': {c: {'n': d.names[i], 'i': d.ind[i]} for i, c in enumerate(d.codes)}},
               {'groups': [{'name': b, 'inds': [x for x, y in d.big_of.items() if y == b]} for b in sorted(set(d.big_of.values()))]},
               parse_quarters(qobj), parse_lists(lobj))
    k = pick_k(d2, argparse.Namespace(asof=None), None)[0]
    mine = compute_site(d2, k, None)
    cmp = Cmp()
    compare_site(cmp, d2, mine, gdr, gates, priv, args, 'stress')
    inv = invariants(gdr, gates, d2, 'theirs')
    bad_inv = [k_ for k_, v in inv.items() if not v['ok']]
    near = Counter(x for p in mine['picks'] for x in p['near'])
    ws = Counter(p['w'] for p in mine['picks'])
    case.update({'ok': not cmp.diffs and not bad_inv, 'compared': cmp.n, 'diffN': len(cmp.diffs), 'diffs': cmp.diffs[:40],
                 'invariantsBad': bad_inv, 'k': k, 'day': d2.cal_iso[k], 'picked': mine['counts']['picked'],
                 'passAll': mine['counts']['passAll'], 'cutInd': mine['counts']['cutInd'], 'cutBig': mine['counts']['cutBig'],
                 'outList': mine['counts']['outList'], 'why': mine['counts']['why'], 'fall3': mine['fall3']['n'],
                 'nearKeys': dict(near), 'weights': {str(a): b for a, b in ws.items()}, 'edges': mine['edges'],
                 'secs': round(time.time() - t, 1)})
    log('  일부러 %s(%s): 고른 곳 %d(다 지남 %d · 업종 뺌 %d · 큰 업종 뺌 %d · 목록 %d) · 맞댄 칸 %d · 틀림 %d' % (
        name, d2.cal_iso[k], case['picked'], case['passAll'], case['cutInd'], case['cutBig'], case['outList'], cmp.n, len(cmp.diffs)))
    return case


def node_perm_flag():
    for fl in ('--permission', '--experimental-permission'):
        try:
            r = subprocess.run(['node', fl, '-e', '0'], capture_output=True, timeout=30)
            if r.returncode == 0:
                return fl
        except (OSError, subprocess.SubprocessError):
            return None
    return None


def run_pick2(tmp, case, qpath, lpath, asof, prev, perm):
    outd = os.path.join(tmp, case)
    os.makedirs(outd, exist_ok=True)
    cmd = ['node']
    if perm:
        cmd += [perm, '--allow-fs-read=*', '--allow-fs-write=' + outd]
    cmd += [PICK2, '--out', os.path.join(outd, 'gdr.json'), '--gates', os.path.join(outd, 'gates.json'),
            '--private', os.path.join(outd, 'priv.json')]
    if qpath:
        cmd += ['--quarters', qpath]
    if lpath:
        cmd += ['--lists', lpath]
    if asof:
        cmd += ['--asof', asof]
    if prev:
        cmd += ['--prev', prev]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600, cwd=ROOT)
    return r.returncode, (r.stdout or '')[-600:], (r.stderr or '')[-1200:], outd


def run_stress(d, bundle, ins, args, log):
    tmp = args.stress_dir or tempfile.mkdtemp(prefix='gdr-v2-stress-')
    os.makedirs(tmp, exist_ok=True)
    perm = node_perm_flag()
    res = {'dir': tmp, 'node': perm, 'cases': [], 'ok': True}
    base_k = pick_k(d, argparse.Namespace(asof=None), None)[0]
    cases = [
        ('A_today_full', 'a', 'full', None, None),
        ('B_0401_alt', 'a', 'alt', '2026-04-01', None),
        ('C_0331_full', 'a', 'full', '2026-03-31', None),
        ('D_0909_full_b', 'b', 'full', '2026-09-09', None),
        ('E_today_partial', 'a', 'partial', None, None),
        ('F_today_dartoff', 'a', 'dartoff', None, None),
        ('G_0715_noq', None, 'full', '2026-07-15', None),
        ('H_today_prev', 'b', 'full', None, 'D_0909_full_b'),
        ('I_0602_full_b', 'b', 'full', '2026-06-02', None),
    ]
    allok = True
    only = set((args.stress_only or '').split(',')) - {''}
    if only:
        cases = [c for c in cases if c[0] in only]
    for name, qv, lk, asof, prevcase in cases:
        t = time.time()
        qobj = synth_quarters(d, qv) if qv else None
        k_case = pick_k(d, argparse.Namespace(asof=asof), None)[0] if asof else base_k
        cand = candidates_at(d, k_case, qobj)
        lobj = synth_lists(cand, lk)
        case_cand = len(cand)
        qpath = lpath = None
        cdir = os.path.join(tmp, '_in_' + name)
        os.makedirs(cdir, exist_ok=True)
        if qobj is not None:
            qpath = os.path.join(cdir, 'quarters.json')
            with open(qpath, 'w', encoding='utf-8') as f:
                json.dump(qobj, f, ensure_ascii=False)
        if lobj is not None:
            lpath = os.path.join(cdir, 'lists.json')
            with open(lpath, 'w', encoding='utf-8') as f:
                json.dump(lobj, f, ensure_ascii=False)
        prevpath = os.path.join(tmp, prevcase, 'gdr.json') if prevcase else None
        code, so, se, outd = run_pick2(tmp, name, qpath, lpath, asof, prevpath, perm)
        case = {'case': name, 'asof': asof, 'quarters': qv, 'lists': lk, 'prev': prevcase, 'exit': code,
                'listedCandidates': case_cand}
        gdr, e1 = read_json_safe(os.path.join(outd, 'gdr.json'))
        gates, e2 = read_json_safe(os.path.join(outd, 'gates.json'))
        priv, e3 = read_json_safe(os.path.join(outd, 'priv.json'))
        if code != 0 or e1 or e2:
            case.update({'ok': False, 'stderr': se, 'stdout': so, 'errors': [e1, e2, e3]})
            res['cases'].append(case)
            allok = False
            log('  일부러 %s: pick2 끝 코드 %s · %s' % (name, code, (se or so)[-300:]))
            continue
        attach(d, parse_quarters(qobj), parse_lists(lobj))
        k = pick_k(d, argparse.Namespace(asof=asof), None)[0] if asof else base_k
        prev = read_json(prevpath) if prevpath and os.path.exists(prevpath) else None
        mine = compute_site(d, k, prev)
        cmp = Cmp()
        compare_site(cmp, d, mine, gdr, gates, priv, args, 'stress')
        inv = invariants(gdr, gates, d, 'theirs')
        bad_inv = [k_ for k_, v in inv.items() if not v['ok']]
        case.update({'ok': not cmp.diffs and not bad_inv, 'compared': cmp.n, 'diffN': len(cmp.diffs),
                     'diffs': cmp.diffs[:40], 'invariantsBad': bad_inv, 'k': k, 'day': d.cal_iso[k],
                     'picked': mine['counts']['picked'], 'passAll': mine['counts']['passAll'],
                     'cutInd': mine['counts']['cutInd'], 'cutBig': mine['counts']['cutBig'],
                     'why': mine['counts']['why'], 'outList': mine['counts']['outList'],
                     'near': sum(len(p['near']) for p in mine['picks']),
                     'scoreSrc': (mine['score'] or {}).get('src'), 'secs': round(time.time() - t, 1)})
        allok = allok and case['ok']
        res['cases'].append(case)
        log('  일부러 %s(%s): 고른 곳 %d · 맞댄 칸 %d · 틀림 %d' % (name, d.cal_iso[k], case['picked'], cmp.n, len(cmp.diffs)))
    if not getattr(args, 'no_synth', False) and (not only or 'S_synth_bundle' in only):
        sc = run_synth_case(d, bundle, tmp, args, perm, log)
        res['cases'].append(sc)
        allok = allok and sc.get('ok', False)
    # 내 셈 안 손셈 시험(작은 도구)
    unit = []
    unit.append(('fnv1a("a")', fnv1a('a'), 0xE40C292C))
    unit.append(('tick_floor(1999.9999)', tick_floor(1999.9999), 1999))
    unit.append(('tick_floor(4999.0000000001)', tick_floor(4999.0000000001), 4995))
    unit.append(('tick_floor(19999)', tick_floor(19999), 19990))
    unit.append(('tick_floor(500000)', tick_floor(500000), 500000))
    unit.append(('tick_floor(499999.99)', tick_floor(499999.99), 499500))
    unit.append(('grew(10, -5, 5)', grew(F(10), F(-5), F(5)), 1))
    unit.append(('grew(-4, -5, 5)', grew(F(-4), F(-5), F(5)), 1))
    unit.append(('grew(105, 100, 5)', grew(F(105), F(100), F(5)), 0))
    unit.append(('grew(100, 100, 0)', grew(F(100), F(100), F(0)), 0))
    unit.append(('grew(96, 100, -5)', grew(F(96), F(100), F(-5)), 1))
    unit.append(('grew(95, 100, -5)', grew(F(95), F(100), F(-5)), 0))
    unit.append(('P(1.21)', P(F(121, 100)), 1210))
    unit.append(('P(0.99)', P(F(99, 100)), 990))
    unit.append(('round1(0.25)', round1(F(1, 4)), 0.2))
    unit.append(('round1(0.35)', round1(F(7, 20)), 0.4))
    unit.append(('fmt1(0.05,+)', fmt1(F(1, 20), True), '+0.0'))
    unit.append(('fmt1(0.15)', fmt1(F(3, 20)), '0.2'))
    unit.append(('summarize_score 빈 counted', summarize_score('recomputed', 'a', 'b', [])['lo'], None))
    unit.append(('tri_and([1,None,0])', tri_and([1, None, 0]), 0))
    unit.append(('tri_and([1,None])', tri_and([1, None]), None))
    unit.append(('next_q(202512)', next_q('202512'), '202603'))
    unit.append(('add_months_first(2025,12,4)', add_months_first(2025, 12, 4), '2026-04-01'))
    unit.append(('add_months_first(2025,9,4)', add_months_first(2025, 9, 4), '2026-01-01'))
    unit.append(('add_months_first(2026,6,3)', add_months_first(2026, 6, 3), '2026-09-01'))
    ub = [{'what': a, 'mine': b, 'want': c} for a, b, c in unit if b != c]
    res['unit'] = {'n': len(unit), 'bad': ub}
    res['ok'] = allok and not ub
    res['n'] = len(cases)
    return res


if __name__ == '__main__':
    sys.exit(main())
