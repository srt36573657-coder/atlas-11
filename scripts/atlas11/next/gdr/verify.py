#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고도리 고르는 셈 gdr-v1 · 따로 세기 (일꾼 C · 2026-10-17 · 일꾼 F 가 gates.json · wrong-v1 을 더함 2026-10-17 밤)

무엇  site/next/data/gdr.json · site/next/data/gates.json(만든 쪽 scripts/atlas11/next/gdr/pick.mjs)을
      결정표만 보고 처음부터 다시 세어 칸마다 맞대 본다. 만든 쪽 셈 파일은 열어 보지 않는다(따로 세기의 뜻).
기준  docs/design/godori-2026-10-17/brief.md 「고르는 셈 결정표 gdr-v1」
      · brief2.md 「결정표 덧붙임 — 틀린다면 이유 wrong-v1」 · 「gates.json 꼴」.
      표가 말하지 않은 곳만 docs/design/godori-2026-10-17/gdr-data.md §2 · §3 · §4 의 읽기를 따름
      (날 세기 · 값이 없을 때 · 뺄 때 차례 · 앞 해 ≤ 0 차례 · 숫자 꼴) — 아래 READINGS 에 한 줄씩.
자료  (읽기만) site/atlas/data/mkt.json(asOf · 회사 · 업종 i) · site/atlas/data/co/<번호>.json(fin.op)
      · 모음 bundle.json.gz = scripts/atlas11/t365/universe.json 의 bundle(일봉 [날, 시, 고, 저, 종, 거래량]).
      종가 · 거래량 · 거래일 달력은 모음 일봉에서 읽음(만든 쪽은 co 파일 종가 · days.json 달력 — 서로 다른 곳에서 읽어 맞대 봄).
맞대는 것
  gdr.json   맨 위 칸 · counts 모든 칸 · 고른 곳 차례 · 곳마다 no · w · price · sell · half · saying · ind · name · reason · g
             · wrong(wrong-v1 글 그대로 — gates.json 이 있거나 곳마다 wrong 이 하나라도 있으면 모든 곳에 있어야 함)
  gates.json (있을 때) schema · version · asOf · keys · (rules 가 있으면 그 값) · 회사 주식 모두(빠짐 · 남는 번호 0)
             · 회사마다 [x, g1 … g5] 를 처음 자료부터 다시 셈 · x = 0 인 곳으로 센 수 = gdr.json counts · 고른 곳 = [0, 1, 1, 1, 1, 1]
쓰는 법
  python3 scripts/atlas11/next/gdr/verify.py             # gdr.json 이 없으면 30초마다 · 60분까지 기다림
  python3 scripts/atlas11/next/gdr/verify.py --no-wait   # 없으면 바로 끝(코드 2)
  python3 scripts/atlas11/next/gdr/verify.py --wait-new  # gates.json + 곳마다 wrong 이 다 나오고 한 번(--poll) 안 바뀔 때까지 기다림
                                                         #   · 끝내 안 나오면 코드 2(--require-new: 기다리지 않고 없으면 틀림)
  python3 scripts/atlas11/next/gdr/verify.py --stress    # + 일부러 만든 자료 둘로 만든 쪽 셈을 그대로 돌려 맞대 봄
       A  업종 3곳 · 36곳 한도 · 비중 3/2.5/2 · 차례 같음 · 문 경계 딱 맞음 · 빈 날 · 2^53 넘는 합 · 먼저 뺌(x 1 · 2)
       B  wrong-v1 다섯 줄 · 경계(r60 30 · low250x 1.7 · indX 1.3 · opGrow 0.2) · 앞선 줄 차례 · 반올림(39.99 → 40 · 1.96 → 2.0)
          · 먼저 뺀 까닭 경계(5날째 · 6날째 거래 0 · 19날째 · 20날째 빈 날) · 셀 수 없음(null) · 이미 떨어짐(null 또는 0)
  옵션: --gdr FILE · --gates FILE · --out FILE · --bundle FILE · --data DIR · --wait-min 60 · --poll 30 · --quiet
        · --stress-dir DIR(남겨 둠 · DIR/A · DIR/B)
        · --gate-missing null|zero — x = 0 인데 문에 쓰는 값이 빠진 칸: null(처음 · brief2 「null 셀 수 없음」 · 이미 못 지남이
          정해진 칸은 null 또는 0 · 한 문 안에서 한 가지) · zero(「없으면 탈락」을 0 으로 읽음 · null 은 뺀 곳에만)
  --stress 는 pick.mjs 를 열어 보지 않고 임시 폴더에 복사해 node --permission(그 폴더만 읽고 씀)으로 돌림 — 저장소 파일은 안 건드림.
  (만든 쪽이 다른 코드 파일을 부르면 node 가 알려 준 그 파일만 저장소에서 같은 자리로 옮겨 다시 돌림 — 자료 파일은 옮기지 않음)
결과  reports/atlas11/godori/verify-latest.json (schema godori-verify-2) — 틀림마다 where · mine · theirs · table(표 줄) · follows(표를 따르는 쪽)
끝 코드  0 ok(틀림 0 · 불변식 모두 참 · --stress 면 그것도) · 1 틀림 또는 불변식 어긋남 · 2 gdr.json 없음 · 못 읽음(--wait-new 면 새 파일 안 나옴) · 3 자료 못 찾음
표준 라이브러리만.
"""
import argparse
import gzip
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_EVEN, ROUND_HALF_UP, localcontext
from fractions import Fraction
from statistics import median

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
DATA = os.path.join(ROOT, 'site', 'atlas', 'data')
UNIVERSE_JSON = os.path.join(ROOT, 'scripts', 'atlas11', 't365', 'universe.json')
UNIVERSE_DIR = os.path.join(ROOT, 'reports', 'atlas11', 'universe')
GDR_DEFAULT = os.path.join(ROOT, 'site', 'next', 'data', 'gdr.json')
GATES_DEFAULT = os.path.join(ROOT, 'site', 'next', 'data', 'gates.json')
OUT_DEFAULT = os.path.join(ROOT, 'reports', 'atlas11', 'godori', 'verify-latest.json')

# ── 결정표 gdr-v1 숫자(brief.md 「고르는 셈 결정표 gdr-v1」 그대로) ─────────────────────────
SCHEMA = 'godori-gdr-1'
VERSION = 'gdr-v1'
BASE = 10_000_000             # 6. 금액 = 1,000만 원 × 비중 ÷ 100(원 아래 버림)
THIN = 1_000_000_000          # X1 최근 20거래일 하루 평균 거래대금 < 10억 원
QUIET_X = 2                   # G2 (a) ≤ 앞 120거래일 하루 평균 × 2
HOT5 = 10                     # G2 (b) 최근 5거래일 오름 < +10%
R60_LO, R60_HI = 5, 40        # G3 (a) 60거래일 전 종가 대비 +5% 이상 +40% 이하
JUMP = 15                     # G3 (b) 그 60거래일 하루 오름 가장 큰 날 < +15%
KEEP = Fraction(85, 100)      # G3 (c) 지금 종가 ≥ 그 60거래일 가장 높은 종가 × 0.85
LOW2X = 2                     # G4 지금 종가 ÷ 지난 250거래일 가장 낮은 종가 < 2.0
IND_X = Fraction(11, 10)      # G5 업종 거래대금 비 ≥ 1.1
SELL = Fraction(9, 10)        # 팔 선 = 지금 종가 × 0.9(원 아래 버림)
HALF = Fraction(12, 10)       # 절반 팔 선 = 지금 종가 × 1.2(원 아래 버림)
PER_IND = 3                   # 4. 한 업종 3곳까지
MAX_PICKS = 36                # 4. 36곳까지
RULES = {"thin": 1000000000, "quietX": 2, "hot5": 10, "r60": [5, 40], "jump": 15, "keep": 0.85,
         "low2x": 2, "indX": 1.1, "sell": 0.9, "half": 1.2}
SAYINGS = [  # 사장님 명령 원문 「질문 열한 개 · 답 · 격언」 순서 1 ~ 11(글자 그대로)
    "남의 말로 산 주식은 남의 말에 판다",
    "모르는 주식은 사지 마라",
    "느낌은 이유가 아니다",
    "빚으로 산 주식은 잠을 뺏는다",
    "소문에 팔고 조용할 때 사라",
    "무릎에 사서 어깨에 팔아라",
    "사기 전에 팔 곳부터 정해라",
    "손해는 짧게 이익은 길게",
    "급한 돈은 주식에 넣지 마라",
    "급한 마음이 가장 비싼 값을 치른다",
    "달걀을 한 바구니에 담지 마라",
]
TABLE_COUNT_KEYS = ["listed", "companies", "outThin", "outHalt", "managed", "afterOut",
                    "g1", "g2", "g3", "g4", "g5", "passAll", "picked", "cash"]
DOC_COUNT_EXTRA = ["outThinQ"]  # gdr-data §4 「결정표 꼴 밖에 더한 칸」

# ── brief2.md 「gates.json 꼴」 · 「결정표 덧붙임 — 틀린다면 이유 wrong-v1」 ─────────────────────
GATES_SCHEMA = 'godori-gates-1'
GATE_KEYS = ['x', 'g1', 'g2', 'g3', 'g4', 'g5']
GATE_NAMES = ('G1', 'G2', 'G3', 'G4', 'G5')
XCODE = {'X1': 1, 'X1?': 1, 'X2': 2}   # x = 먼저 뺀 까닭: 0 = 안 뺌 · 1 = 거래 적음(「?」 포함) · 2 = 거래 정지(추정)
W_R60 = 30                    # wrong-v1 1. r60 ≥ 30
W_LOW = Fraction(17, 10)      # 2. low250x ≥ 1.7
W_IND = Fraction(13, 10)      # 3. indX < 1.3
W_GROW = Fraction(1, 5)       # 4. opGrow 없음(앞 해 적자) 또는 < 0.2
WRONG = {
    1: '석 달 {}% 올라 숨이 찰 수 있어.',
    2: '1년 바닥보다 {}배라 더 오르기 버거울 수 있어.',
    3: '업종 돈이 조금만 빠져도 이 문을 못 지나.',
    4: '이익이 다시 줄면 고른 까닭이 사라져.',
    5: '시장 전체가 내리면 같이 내릴 수 있어.',
}
TIE_TOL = Fraction(1, 10 ** 12)  # 글의 숫자가 「딱 반」에서 이만큼 안이면 두 이웃을 다 받음(소수 셈 길에 따라 갈림)

# 표 줄(틀림이 나오면 어느 줄을 따르는지 적을 때 씀 · brief.md · brief2.md 글자 그대로 줄임 없이 옮김)
TABLE = {
    'src': "자료: … 사이트 자료와 같은 날짜의 모음을 씀 — 사이트 자료 날짜 = site/atlas/data/mkt.json 의 asOf",
    'listed': "0. … counts.listed = 모음 목록 모두 · counts.companies = 회사 주식",
    'X1': "X1 거래 적음: 최근 20거래일 하루 평균 거래대금 < 10억 원(정한 숫자). 거래대금이 없으면 종가 × 거래량. 값이 없으면 뺌(「?」 수 따로)",
    'X2': "X2 거래 정지(추정): 최근 5거래일 가운데 거래량 0 인 날이 있거나, 마지막 종가 날짜 < 자료 날짜 → 뺌",
    'X3': "X3 관리 종목 · 투자 경고: 모음에 표시 필드가 있으면 그 표시로 뺌 · 없으면 counts.managed = null",
    'G1': "G1 이익 늘었나: 마지막 확정 해 영업이익 > 0 그리고 > 그 앞 해 영업이익(fin.op 마지막 둘 · 하나라도 없으면 탈락)",
    'G2': "G2 아직 조용한가: (a) 최근 20거래일 하루 평균 거래대금 ≤ 그 앞 120거래일(21 ~ 140거래일 전) 하루 평균 × 2 그리고 (b) 최근 5거래일 오름 < +10%",
    'G3': "G3 석 달 천천히 올랐나: (a) 60거래일 전 종가 대비 +5% 이상 +40% 이하 (b) 그 60거래일 하루 오름 가장 큰 날 < +15% (c) 지금 종가 ≥ 그 60거래일 가장 높은 종가 × 0.85",
    'G4': "G4 두 배 넘게 안 올랐나: 지금 종가 ÷ 지난 250거래일 가장 낮은 종가 < 2.0",
    'G5': "G5 돈 들어오는 업종인가: 업종 = mkt.json 의 i(77업종). 업종 하루 평균 거래대금 비(최근 20거래일 ÷ 그 앞 60거래일) ≥ 1.1 그리고 업종 회사들 20거래일 오름의 가운데 값 > 0 (업종 셈은 X1 · X2 로 빼기 전 그 업종 회사 모두로)",
    'rank': "3. 차례: 영업이익 늘어난 비율(마지막 해 ÷ 앞 해 − 1) 큰 차례 · 같으면 60거래일 오름 작은 차례 · 같으면 번호 작은 차례",
    'pick': "4. 고르기: 다섯 문 통과 → 차례대로 담되 한 업종 3곳까지 → 36곳까지 · 모자라면 모자란 대로(채우지 않음)",
    'w': "5. 비중: 1 ~ 12번 3 · 13 ~ 24번 2.5 · 25 ~ 36번 2 · 쉬는 돈 = 100 − 담은 비중 합(36곳이면 10) · 한 업종 합 ≤ 9 확인",
    'amt': "6. 금액 = 1,000만 원 × 비중 ÷ 100(원 아래 버림)",
    'sell': "6. 팔 선 = 지금 종가 × 0.9(원 아래 버림) · 절반 팔 선 = 지금 종가 × 1.2",
    'reason': "6. 이유 한 줄 = 「영업이익 {앞 해}억 → {마지막 해}억 · 석 달 {r60:+.1f}% · 업종 돈 {비:.1f}배」",
    'saying': "6. 격언 = 열한 격언을 번호 차례로 돌려 씀: 격언[(번호 − 1) % 11]",
    'counts': "7. counts = {listed, companies, outThin, outHalt, managed(null 이면 ?), afterOut, g1, g2, g3, g4, g5, passAll, picked, cash} — g1 ~ g5 는 먼저 뺀 뒤 남은 회사에서 문마다 따로 통과한 수 · passAll = 다섯 문 모두",
    'shape': "gdr.json 꼴: {schema: godori-gdr-1, version: gdr-v1, asOf, made, src, base: 10000000, rules: {...}, counts, sayings, picks: [{no, code, name, ind, w, price, sell, half, reason, saying, g: {opPrev, opLast, opGrow, r60, maxJump, keep, low250x, indX, ind20, tv20}}], inds}",
    'gates': "gates.json 꼴(brief2): {schema: godori-gates-1, version: gdr-v1, asOf: YYYY-MM-DD, keys: [x, g1, g2, g3, g4, g5], co: {번호: [x, g1 … g5]}} · 회사 주식 모두 · 먼저 뺀 곳 포함",
    'gx': "x = 먼저 뺀 까닭: 0 = 안 뺌 · 1 = 거래 적음 · 2 = 거래 정지(추정) — 뺀 곳은 g1 ~ g5 = null",
    'gN': "gN = 1 지남 · 0 못 지남 · null 셀 수 없음 — 셈은 gdr-v1 그대로(g1 ~ g5 수 = gdr.json counts 와 같아야 함)",
    'wrong': "wrong-v1(곳마다 g 값 · 반올림 전 값 · 경계는 정확히 · 위에서부터 처음 맞는 하나): 1. r60 ≥ 30 → 「석 달 {r60:.0f}% 올라 숨이 찰 수 있어.」 2. low250x ≥ 1.7 → 「1년 바닥보다 {low250x:.1f}배라 더 오르기 버거울 수 있어.」 3. indX < 1.3 → 「업종 돈이 조금만 빠져도 이 문을 못 지나.」 4. opGrow 가 없음(앞 해 적자) 또는 < 0.2 → 「이익이 다시 줄면 고른 까닭이 사라져.」 5. 그 밖 → 「시장 전체가 내리면 같이 내릴 수 있어.」(.0f · .1f = 파이썬 format 과 같은 반올림)",
}
FOLLOWS = {
    'verify': '이 셈(verify.py) — 결정표대로 처음 자료부터 다시 셈',
    'neither': '어느 쪽도 아님 — 만든 쪽 파일끼리 서로 다르거나 표가 정한 칸 · 꼴이 빠짐',
}

# 표가 말하지 않은 곳 — gdr-data.md 에 적힌 읽기(일꾼 B · 주 일꾼이 C 에게 넘긴 말과 같음) + gates · wrong 읽기(일꾼 F). 바꾸면 이 줄도 같이.
READINGS = [
    "날: t = 거래일 달력에서 자료 날짜 D 의 자리 · 「n거래일 전」 = T[t − n] · 「최근 N거래일」 = T[t − N + 1 .. t] (gdr-data §2)",
    "G2 그 앞 120거래일 = T[t − 139 .. t − 20] · G5 그 앞 60거래일 = T[t − 79 .. t − 20] (gdr-data §2)",
    "n거래일 오름 = 종가[t] ÷ 종가[t − n] − 1 · G3 그 60거래일 = T[t − 59 .. t] 의 하루 오름 60개 · 가장 높은 종가는 그 60날 안 (gdr-data §2)",
    "거래대금(날) = 그날 일봉 줄의 종가 × 거래량 · 줄이 없으면 「없음」 (gdr-data §1 · §3)",
    "X1 최근 20날에 「없음」이 하나라도 있으면 「?」 → outThin 에 넣고 outThinQ 에도 셈 (gdr-data §3)",
    "X2 최근 5날에 거래량 0 이거나 줄이 없는 날 · 또는 D 종가 없음 → 뺌 (gdr-data §3)",
    "뺄 때 차례 X1 → X2 → X3 · 한 회사는 처음 걸린 하나에만 셈 (gdr-data §3)",
    "G1 ~ G5 는 쓰는 값이 하나라도 없으면 그 문 탈락(창 안 종가 · 앞 120날 거래대금 · 업종 없음) (gdr-data §3)",
    "G5 업종 하루 거래대금 = 그날 업종 회사들 거래대금 합(줄 없는 회사는 0) · 앞 60날 합 0 이면 탈락 · ind20 = 종가[t] · 종가[t − 20] 이 다 있는 회사들의 가운데 값(짝수면 가운데 둘 평균) (gdr-data §3)",
    "앞 해 영업이익 ≤ 0 이면 opGrow = null · 차례는 비율 있는 곳 모두 뒤(그 안에서 r60 작은 → 번호) (gdr-data §4 · 표에 없는 곳)",
    "g 숫자 꼴: 퍼센트(r60 · maxJump · ind20 · r5) 소수 둘째 · 비(opGrow · keep · low250x · indX · quiet) 소수 넷째 · tv20 원 정수 · 이유 줄 소수 한 자리는 반올림 전 값으로 (gdr-data §4)",
    "gates.json x: X1(「?」 포함) → 1 · X2 → 2 · 안 뺌 → 0 · 뺀 곳 g1 ~ g5 = null · 관리 종목(X3)은 표시 칸이 없어 거르지 않음(managed = null) (brief2 · gdr-data §3)",
    "gates.json gN(x = 0): 문에 쓰는 값이 다 있으면 1 · 0 · 하나라도 없으면 null(셀 수 없음 — gdr-data §3 「값이 없을 때」: G1 fin.op 마지막 둘 · G2 앞 120날 거래대금 · c[t] · c[t − 5] · G3 c[t − 60 .. t] · G4 c[t − 249 .. t] · G5 업종 없음 · 업종 앞 60날 합 0 · 업종 20거래일 오름 셀 회사 없음). 값이 빠졌는데 있는 값만으로 이미 못 지남이 정해진 곳(G1 마지막 해 ≤ 0 · G2 5일 오름 ≥ +10% · G3 있는 값으로 (a) · (b) · (c) 가운데 하나가 이미 어긋남 · G4 지금 종가 ≥ 있는 값 가운데 가장 낮은 종가 × 2 · G5 업종 비 < 1.1 또는 가운데 값 ≤ 0)은 표가 null · 0 을 정하지 않아 둘 다 받음 — 한 문 안에서는 한 가지 읽기로만(섞이면 틀림) · 값이 빠진 곳이 1 이면 틀림(「없으면 탈락」) (brief2 「null 셀 수 없음」 · gdr-data §3)",
    "wrong-v1 숫자: r60(%) · low250x 는 반올림 전 정확한 값 · 경계는 정확한 곱셈(100·c0 ≥ 130·c60 · 10·c0 ≥ 17·바닥 · 30·s20 < 13·s60 · 5·끝 해 < 6·앞 해) · 글의 숫자는 정확한 값을 딱 반이면 짝수 쪽(파이썬 format) — 정확한 값이 딱 반(1e-12 안)이면 소수 셈 길에 따라 갈려 두 이웃을 다 받고 diag.wrongNearTie 에 적음 (brief2)",
]

PCT_KEYS = ('r60', 'maxJump', 'ind20', 'r5')
RATIO_KEYS = ('opGrow', 'keep', 'low250x', 'indX', 'quiet')
INT_KEYS = ('opPrev', 'opLast')
G_KEYS_TABLE = ('opPrev', 'opLast', 'opGrow', 'r60', 'maxJump', 'keep', 'low250x', 'indX', 'ind20', 'tv20')
G_KEYS_EXTRA = ('r5', 'quiet')


# ── 작은 도구 ────────────────────────────────────────────────────────────────
class DataError(Exception):
    """자료가 맞지 않음(끝 코드 3)."""


def load_json(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def read_json_safe(p):
    """(내용, 잘못) — 파일이 없으면 (None, None) · 못 읽으면 (None, 까닭)."""
    if not os.path.exists(p):
        return None, None
    try:
        return load_json(p), None
    except Exception as e:  # noqa: BLE001 — 쓰는 중일 수 있음
        return None, f'{type(e).__name__}: {e}'


def sha256(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def rel(p):
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def num(x):
    """정수 · 소수 값을 정확한 수로(int 또는 Fraction). 못 쓰면 None."""
    if isinstance(x, bool) or x is None:
        return None
    if isinstance(x, int):
        return x
    if isinstance(x, float):
        if not math.isfinite(x):
            return None
        return int(x) if x.is_integer() else Fraction(x)
    return None


def to_dec(x):
    with localcontext() as ctx:
        ctx.prec = 80
        return Decimal(x.numerator) / Decimal(x.denominator)


def round_cands(x, k):
    """정확한 값 x(Fraction)를 소수 k 자리로 반올림한 값 후보(짝수 쪽 · 위쪽 · 소수 곱 꼴) + 반올림 안 한 값."""
    x = Fraction(x)
    out = set()
    with localcontext() as ctx:
        ctx.prec = 80
        d = to_dec(x)
        q = Decimal(1).scaleb(-k)
        out.add(float(d.quantize(q, rounding=ROUND_HALF_EVEN)))
        out.add(float(d.quantize(q, rounding=ROUND_HALF_UP)))
    f = float(x)
    out.add(round(f, k))
    out.add(math.floor(f * 10 ** k + 0.5) / 10 ** k)
    out.add(f)
    return out


def close_rel(a, b, tol=1e-6):
    a, b = float(a), float(b)
    if a == b:
        return True
    return abs(a - b) <= tol * max(abs(a), abs(b))


def fmt1(x, plus):
    """이유 줄 소수 한 자리 꼴 후보: 정확한 값의 짝수 쪽 반올림 · 소수(float) format."""
    spec = '+.1f' if plus else '.1f'
    with localcontext() as ctx:
        ctx.prec = 80
        a = format(to_dec(Fraction(x)).quantize(Decimal('0.1'), rounding=ROUND_HALF_EVEN), spec)
    b = format(float(x), spec)
    return [a] if a == b else [a, b]


def fmt_ok(x, k):
    """wrong-v1 글의 숫자: 정확한 값 x 를 소수 k 자리로(파이썬 format 과 같은 반올림 — 딱 반이면 짝수 쪽).
    → (내 글, 받는 글 목록, 딱 반 근처인가). 받는 글 = 정확한 값 짝수 쪽 · format(float(x)) · 딱 반(1e-12 안)이면 두 이웃."""
    x = Fraction(x)
    spec = f'.{k}f'
    with localcontext() as ctx:
        ctx.prec = 80
        mine = format(to_dec(x).quantize(Decimal(1).scaleb(-k), rounding=ROUND_HALF_EVEN), spec)
    ok = [mine]
    alt = format(float(x), spec)
    if alt not in ok:
        ok.append(alt)
    s = x * 10 ** k
    fl = math.floor(s)
    tie = abs((s - fl) - Fraction(1, 2)) <= TIE_TOL * max(1, abs(s))
    if tie:
        for n in (fl, fl + 1):
            t = format(Decimal(n).scaleb(-k), spec)
            if t not in ok:
                ok.append(t)
    return mine, ok, tie


def ff(x, k=None):
    """보고용 수(정확한 값 → float · k 자리 짝수 쪽 반올림)."""
    if x is None:
        return None
    if isinstance(x, int):
        return x
    if k is None:
        return float(x)
    with localcontext() as ctx:
        ctx.prec = 80
        v = float(to_dec(Fraction(x)).quantize(Decimal(1).scaleb(-k), rounding=ROUND_HALF_EVEN))
    return int(v) if k == 0 else v


def same_bundle(mine_path, theirs):
    """gdr.json src(그쪽 저장소 뿌리에서 본 길 · 또는 모음 폴더 이름)가 내가 쓴 모음과 같은 파일인가."""
    a = os.path.normpath(os.path.abspath(mine_path))
    t = os.path.normpath(theirs)
    if os.path.isabs(t):
        return t == a
    if a == os.path.normpath(os.path.join(ROOT, t)) or a.endswith(os.sep + t):
        return True
    return not t.endswith('.gz') and os.path.basename(os.path.dirname(a)) == os.path.basename(t)


def weight(no):
    # 5. 비중: 1 ~ 12번 3 · 13 ~ 24번 2.5 · 25 ~ 36번 2
    if no <= 12:
        return 3
    if no <= 24:
        return 2.5
    return 2


def tri(full, ok, dec_fail):
    """문 하나의 gates.json 값(두 읽기): 쓰는 값이 다 있으면 1 · 0 → (v, v)
    · 하나라도 없으면 R1 null · R2 = 있는 값만으로 이미 못 지남이 정해졌으면 0, 아니면 null."""
    if full:
        v = 1 if ok else 0
        return (v, v)
    return (None, 0 if dec_fail else None)


def tri_eq(a, b):
    """gates.json 칸 값 맞대기(0 · 1 은 정수만 · true/false 는 꼴 틀림)."""
    if a is None or b is None:
        return a is None and b is None
    return type(b) is int and b == a


def wrong_line(r60, low, indX, og):
    """wrong-v1 → (번호, 내 글, 받는 글 목록, 까닭, 딱 반 근처). 값은 반올림 전 정확한 값(Fraction)."""
    if r60 is not None and r60 >= W_R60:
        m, ok, tie = fmt_ok(r60, 0)
        return 1, WRONG[1].format(m), [WRONG[1].format(t) for t in ok], f'r60 = {ff(r60, 10)} ≥ 30', tie
    if low is not None and low >= W_LOW:
        m, ok, tie = fmt_ok(low, 1)
        return 2, WRONG[2].format(m), [WRONG[2].format(t) for t in ok], f'low250x = {ff(low, 10)} ≥ 1.7', tie
    if indX is not None and indX < W_IND:
        return 3, WRONG[3], [WRONG[3]], f'indX = {ff(indX, 10)} < 1.3', False
    if og is None or og < W_GROW:
        return 4, WRONG[4], [WRONG[4]], ('opGrow 없음(앞 해 ≤ 0)' if og is None else f'opGrow = {ff(og, 10)} < 0.2'), False
    return 5, WRONG[5], [WRONG[5]], '1 ~ 4 모두 아님', False


# ── 자료 찾기 ────────────────────────────────────────────────────────────────
def bundle_last_date(B, codes):
    last = None
    for c in codes:
        s = (B.get('stocks') or {}).get(c) or {}
        rows = ((s.get('fchart') or {}).get('rows')) or []
        if rows:
            d = str(rows[-1][0])
            last = d if last is None or d > last else last
    return last


def find_bundle(D8, codes, forced=None, log=print):
    """결정표: 사이트 자료와 같은 날짜의 모음. 1) --bundle 2) universe.json bundle 3) reports/atlas11/universe/*/ 에서 마지막 날 = D."""
    tried = []
    cands = []
    if forced:
        cands.append(os.path.abspath(forced))
    else:
        try:
            u = load_json(UNIVERSE_JSON)
            if u.get('bundle'):
                cands.append(os.path.join(ROOT, u['bundle']))
        except Exception as e:  # noqa: BLE001
            tried.append(f'universe.json 못 읽음: {e}')
        if os.path.isdir(UNIVERSE_DIR):
            for name in sorted(os.listdir(UNIVERSE_DIR), reverse=True):
                p = os.path.join(UNIVERSE_DIR, name, 'bundle.json.gz')
                if os.path.isfile(p) and p not in cands:
                    cands.append(p)
    for p in cands:
        if not os.path.isfile(p):
            tried.append(f'{rel(p)}: 없음')
            continue
        # derive.json 의 cut 이 D 와 다르면 열지 않고 넘김(빠르게)
        dj = os.path.join(os.path.dirname(p), 'derive.json')
        if not forced and os.path.isfile(dj):
            try:
                cut = str(load_json(dj).get('cut') or '')
                if cut and cut != D8:
                    tried.append(f'{rel(p)}: derive cut {cut} ≠ {D8}')
                    continue
            except Exception:  # noqa: BLE001
                pass
        log(f'· 모음 여는 중: {rel(p)}')
        with gzip.open(p, 'rt', encoding='utf-8') as f:
            B = json.load(f)
        last = bundle_last_date(B, codes)
        if forced or last == D8:
            return p, B, last, tried
        tried.append(f'{rel(p)}: 마지막 날 {last} ≠ {D8}')
        del B
    return None, None, None, tried


# ── 다시 세기(결정표 gdr-v1) ──────────────────────────────────────────────────
def recompute(mkt, B, D8, co_dir):
    comp = mkt['companies']
    codes = sorted(comp)
    stocks = B.get('stocks') or {}
    diag = {}

    # 0. 목록 모두 = 모음 목록(lists.pages)의 itemCode 겹침 없이 · 없으면 stocks 수
    list_codes = set()
    for pg in ((B.get('lists') or {}).get('pages') or []):
        try:
            for s in json.loads(pg.get('text') or '{}').get('stocks') or []:
                if s.get('itemCode'):
                    list_codes.add(s['itemCode'])
        except Exception:  # noqa: BLE001
            pass
    listed = len(list_codes) if list_codes else len(stocks)
    diag['listedFromLists'] = len(list_codes)
    diag['listedFromStocks'] = len(stocks)

    # 회사마다 일봉(D 까지) · 날 → (종가, 거래량)
    ser = {}
    dates_all = set()
    dropped_after = 0
    not_in_bundle = []
    for c in codes:
        s = stocks.get(c)
        m = {}
        if s is None:
            not_in_bundle.append(c)
        else:
            for r in ((s.get('fchart') or {}).get('rows')) or []:
                if not isinstance(r, (list, tuple)) or len(r) < 6:
                    continue
                d = str(r[0])
                if d > D8:
                    dropped_after += 1
                    continue
                cl, vo = num(r[4]), num(r[5])
                m[d] = (cl if cl is not None and cl > 0 else None, vo if vo is not None and vo >= 0 else None)
                dates_all.add(d)
        ser[c] = m
    diag['notInBundle'] = not_in_bundle
    diag['rowsAfterAsOfDropped'] = dropped_after

    # 거래일 달력 T = 모음 회사 일봉 날짜 모두(D 까지)
    T = sorted(dates_all)
    if not T or T[-1] != D8:
        raise DataError(f'모음 일봉 마지막 날 {T[-1] if T else None} ≠ 자료 날짜 {D8}')
    t = len(T) - 1
    LB = 250  # 가장 먼 창: G4 T[t − 249 .. t]
    back = [T[t - n] if t - n >= 0 else None for n in range(LB)]
    diag['calendarLen'] = len(T)
    diag['calendarLast250'] = [back[LB - 1], back[0]]

    # 회사마다 뒤에서 센 값 cb[n] = T[t − n] 날 종가 · vb · tb(거래대금)
    CB, VB, TB = {}, {}, {}
    for c in codes:
        m = ser[c]
        cb, vb, tb = [], [], []
        for n in range(LB):
            d = back[n]
            row = m.get(d) if d else None
            if row is None:
                cb.append(None); vb.append(None); tb.append(None)
            else:
                cl, vo = row
                cb.append(cl); vb.append(vo)
                tb.append(cl * vo if cl is not None and vo is not None else None)
        CB[c], VB[c], TB[c] = cb, vb, tb

    # fin.op(co 파일)
    OP = {}
    for c in codes:
        op = None
        try:
            co = load_json(os.path.join(co_dir, c + '.json'))
            op = (co.get('fin') or {}).get('op')
        except FileNotFoundError:
            op = None
        OP[c] = op if isinstance(op, list) else None

    # 1. 먼저 뺌 X1 → X2 → X3
    out_thin = out_thin_q = out_halt = 0
    S20 = {}
    after = []
    excl = {}
    XI = {}   # 틀림 줄에 붙일 먼저 뺌 숫자
    for c in codes:
        tb, vb, cb = TB[c], VB[c], CB[c]
        w20 = tb[0:20]
        miss20 = sum(1 for x in w20 if x is None)
        XI[c] = {'miss20': miss20, 'tv20avg': Fraction(sum(w20), 20) if not miss20 else None,
                 'vol0in5': sum(1 for v in vb[0:5] if v == 0), 'noRowIn5': sum(1 for v in vb[0:5] if v is None),
                 'closeD': cb[0]}
        if miss20:
            out_thin += 1; out_thin_q += 1; excl[c] = 'X1?'
            continue
        s20 = sum(w20)
        if s20 < 20 * THIN:              # 하루 평균 < 10억 원
            out_thin += 1; excl[c] = 'X1'
            continue
        if cb[0] is None or any(v is None or v == 0 for v in vb[0:5]):
            out_halt += 1; excl[c] = 'X2'
            continue
        # X3: 표시 칸 없음 → 거르지 않음(managed = null)
        S20[c] = s20
        after.append(c)

    # 2. G5 업종(빼기 전 그 업종 회사 모두)
    by_ind = {}
    for c in codes:
        i = comp[c].get('i')
        if i:
            by_ind.setdefault(i, []).append(c)
    IND = {}
    for i, mem in by_ind.items():
        s20 = sum(x for c in mem for x in TB[c][0:20] if x is not None)
        s60 = sum(x for c in mem for x in TB[c][20:80] if x is not None)
        r20s = []
        for c in mem:
            a, b = CB[c][0], CB[c][20]
            if a is not None and b is not None:
                r20s.append((Fraction(a) / Fraction(b) - 1) * 100)
        indX = Fraction(s20 * 60, s60 * 20) if s60 > 0 else None   # (s20/20) ÷ (s60/60)
        ok_x = indX is not None and indX >= IND_X
        ind20 = median(r20s) if r20s else None
        ok_m = ind20 is not None and ind20 > 0
        IND[i] = {'pass': bool(ok_x and ok_m), 'indX': indX, 'ind20': ind20, 'n': len(mem), 'nr20': len(r20s),
                  's20': s20, 's60': s60}

    # 다섯 문(먼저 뺀 뒤 남은 회사) — 문마다 지남(bool · gdr.json counts) + gates.json 값 두 읽기(tri)
    G = {}
    for c in after:
        cb, tb = CB[c], TB[c]
        op = OP[c] or []
        res = {}
        TR = {}
        # G1 — fin.op 마지막 둘
        a = num(op[-2]) if len(op) >= 2 else None
        b = num(op[-1]) if len(op) >= 1 else None
        full = a is not None and b is not None
        TR['G1'] = tri(full, full and b > 0 and b > a, (not full) and b is not None and b <= 0)
        res['opPrev'], res['opLast'] = (a, b) if len(op) >= 2 else (None, None)
        res['opTail'] = [num(v) for v in op[-3:]]
        # G2 — (a) 최근 20날 평균 ≤ 앞 120날 평균 × 2 (b) 5일 오름 < +10%
        w120 = tb[20:140]
        miss120 = sum(1 for x in w120 if x is None)
        g2a = quiet = None
        if not miss120:
            s120 = sum(w120)
            g2a = 120 * S20[c] <= QUIET_X * 20 * s120     # S20/20 ≤ 2 × S120/120(정수 곱셈)
            quiet = Fraction(S20[c] * 120, s120 * 20) if s120 > 0 else None
        g2b = r5 = None
        if cb[0] is not None and cb[5] is not None:
            g2b = 100 * cb[0] < (100 + HOT5) * cb[5]    # 5거래일 오름 < +10%
            r5 = (Fraction(cb[0]) / Fraction(cb[5]) - 1) * 100
        full = g2a is not None and g2b is not None
        TR['G2'] = tri(full, full and g2a and g2b, (not full) and g2b is False)
        res['quiet'], res['r5'], res['miss120'] = quiet, r5, miss120
        # G3 — 그 60거래일
        w61 = cb[0:61]
        miss61 = sum(1 for x in w61 if x is None)
        r60 = mj = keep = None
        c0, c60 = cb[0], cb[60]
        if not miss61:
            g3a = 100 * c0 >= (100 + R60_LO) * c60 and 100 * c0 <= (100 + R60_HI) * c60
            g3b = all(100 * cb[n] < (100 + JUMP) * cb[n + 1] for n in range(60))
            mx = max(cb[0:60])
            g3c = Fraction(c0) >= KEEP * mx
            TR['G3'] = tri(True, g3a and g3b and g3c, False)
            r60 = (Fraction(c0) / Fraction(c60) - 1) * 100
            mj = max((Fraction(cb[n]) / Fraction(cb[n + 1]) - 1) * 100 for n in range(60))
            keep = Fraction(c0) / Fraction(mx)
        else:
            dec = False
            if c0 is not None and c60 is not None and not (
                    100 * c0 >= (100 + R60_LO) * c60 and 100 * c0 <= (100 + R60_HI) * c60):
                dec = True
            if any(cb[n] is not None and cb[n + 1] is not None and 100 * cb[n] >= (100 + JUMP) * cb[n + 1] for n in range(60)):
                dec = True
            kn = [x for x in cb[0:60] if x is not None]
            if c0 is not None and kn and Fraction(c0) < KEEP * max(kn):
                dec = True
            TR['G3'] = tri(False, False, dec)
        res['r60'], res['maxJump'], res['keep'], res['miss61'] = r60, mj, keep, miss61
        # G4 — 지난 250거래일 가장 낮은 종가
        w250 = cb[0:250]
        miss250 = sum(1 for x in w250 if x is None)
        low250x = None
        if not miss250:
            low = min(w250)
            TR['G4'] = tri(True, cb[0] < LOW2X * low, False)
            low250x = Fraction(cb[0]) / Fraction(low)
        else:
            kn = [x for x in w250 if x is not None]
            TR['G4'] = tri(False, False, cb[0] is not None and bool(kn) and cb[0] >= LOW2X * min(kn))
        res['low250x'], res['miss250'] = low250x, miss250
        # G5 — 업종(빼기 전 회사 모두로 센 값)
        ind = comp[c].get('i')
        iv = IND.get(ind) if ind else None
        full = iv is not None and iv['indX'] is not None and iv['ind20'] is not None
        dec = iv is not None and ((iv['indX'] is not None and iv['indX'] < IND_X)
                                  or (iv['ind20'] is not None and iv['ind20'] <= 0))
        TR['G5'] = tri(full, full and iv['pass'], (not full) and dec)
        res['indX'] = iv['indX'] if iv else None
        res['ind20'] = iv['ind20'] if iv else None
        res['tv20'] = Fraction(S20[c], 20)
        res['ind'] = ind
        res['price'] = cb[0]
        for k in GATE_NAMES:
            res[k] = TR[k][0] == 1
        res['T'] = TR
        res['all'] = all(res[k] for k in GATE_NAMES)
        G[c] = res

    counts = {
        'listed': listed, 'companies': len(codes),
        'outThin': out_thin, 'outThinQ': out_thin_q, 'outHalt': out_halt, 'managed': None,
        'afterOut': len(after),
        'g1': sum(1 for c in after if G[c]['G1']), 'g2': sum(1 for c in after if G[c]['G2']),
        'g3': sum(1 for c in after if G[c]['G3']), 'g4': sum(1 for c in after if G[c]['G4']),
        'g5': sum(1 for c in after if G[c]['G5']),
        'passAll': sum(1 for c in after if G[c]['all']),
    }

    # gates.json(brief2): 회사 주식 모두 [x, g1 … g5] · gN 은 (R1, R2) 두 읽기
    GT = {}
    for c in codes:
        if c in excl:
            GT[c] = [XCODE[excl[c]]] + [(None, None)] * 5
        else:
            GT[c] = [0] + [G[c]['T'][k] for k in GATE_NAMES]
    diag['gateNullR1'] = {k: sum(1 for c in after if G[c]['T'][k][0] is None) for k in GATE_NAMES}
    diag['gateNullOrZero'] = {k: sorted(c for c in after if G[c]['T'][k][0] != G[c]['T'][k][1]) for k in GATE_NAMES}

    # 3. 차례 · 4. 고르기
    def grow(c):
        a, b = G[c]['opPrev'], G[c]['opLast']
        return Fraction(b, 1) / Fraction(a, 1) - 1 if (a is not None and a > 0) else None

    passed = [c for c in after if G[c]['all']]

    def key(c):
        g = grow(c)
        return (1, 0, G[c]['r60'], c) if g is None else (0, -g, G[c]['r60'], c)

    ranked = sorted(passed, key=key)
    # 표 글자 그대로(앞 해 < 0 도 비율을 셈 · 앞 해 = 0 은 셀 수 없음) 차례 — 읽기 차이가 결과를 바꾸는지만 봄
    def key_lit(c):
        a, b = G[c]['opPrev'], G[c]['opLast']
        if a == 0:
            return (1, 0, G[c]['r60'], c)
        return (0, -(Fraction(b) / Fraction(a) - 1), G[c]['r60'], c)
    ranked_lit = sorted(passed, key=key_lit)

    def take(order):
        picks, per = [], {}
        for c in order:
            if len(picks) >= MAX_PICKS:
                break
            i = G[c]['ind']
            if per.get(i, 0) >= PER_IND:
                continue
            per[i] = per.get(i, 0) + 1
            picks.append(c)
        return picks

    pick_codes = take(ranked)
    pick_codes_lit = take(ranked_lit)

    picks = []
    inds = {}
    for k, c in enumerate(pick_codes):
        no = k + 1
        r = G[c]
        w = weight(no)
        price = r['price']
        og = grow(c)
        g = {
            'opPrev': r['opPrev'], 'opLast': r['opLast'], 'opGrow': og,
            'r60': r['r60'], 'maxJump': r['maxJump'], 'keep': r['keep'], 'low250x': r['low250x'],
            'indX': r['indX'], 'ind20': r['ind20'], 'tv20': r['tv20'], 'r5': r['r5'], 'quiet': r['quiet'],
        }
        reasons = [f"영업이익 {r['opPrev']}억 → {r['opLast']}억 · 석 달 {x}% · 업종 돈 {y}배"
                   for x in fmt1(r['r60'], True) for y in fmt1(r['indX'], False)]
        wno, wtxt, wok, wwhy, wtie = wrong_line(r['r60'], r['low250x'], r['indX'], og)
        picks.append({
            'no': no, 'code': c, 'name': comp[c].get('n'), 'ind': r['ind'], 'w': w,
            'price': price,
            'sell': math.floor(Fraction(price) * SELL), 'half': math.floor(Fraction(price) * HALF),
            'amt': math.floor(Fraction(BASE) * Fraction(str(w)) / 100),
            'reason': reasons[0], 'reasonOk': reasons, 'saying': (no - 1) % 11, 'g': g,
            'wrong': wtxt, 'wrongOk': wok, 'wrongNo': wno, 'wrongWhy': wwhy, 'wrongNearTie': wtie,
        })
        inds[r['ind']] = inds.get(r['ind'], 0) + w
    sw = sum(Fraction(str(p['w'])) for p in picks)
    cash = 100 - sw
    counts['picked'] = len(picks)
    counts['cash'] = int(cash) if cash.denominator == 1 else float(cash)

    diag['opGrowReadingChangesPicks'] = pick_codes != pick_codes_lit
    diag['opGrowLiteralPicks'] = pick_codes_lit if pick_codes != pick_codes_lit else None
    diag['passAllOpPrevLE0'] = [c for c in passed if G[c]['opPrev'] is not None and G[c]['opPrev'] <= 0]
    diag['excl'] = excl
    return {
        'D8': D8, 'T': T, 'counts': counts, 'after': after, 'G': G, 'IND': IND, 'ranked': ranked,
        'picks': picks, 'inds': inds, 'excl': excl, 'diag': diag, 'GT': GT, 'XI': XI,
    }


# ── 맞대 보기 ────────────────────────────────────────────────────────────────
class Report:
    def __init__(self):
        self.mm = []

    def add(self, where, mine, theirs, table, note=None, follows='verify', evidence=None):
        keys = table if isinstance(table, (list, tuple)) else [table]
        e = {'where': where, 'mine': mine, 'theirs': theirs,
             'table': ' / '.join(TABLE.get(k, k) for k in keys), 'follows': FOLLOWS[follows]}
        if note:
            e['note'] = note
        if evidence is not None:
            e['evidence'] = evidence
        self.mm.append(e)


def jsonable(x):
    if isinstance(x, Fraction):
        return float(x)
    if isinstance(x, dict):
        return {k: jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [jsonable(v) for v in x]
    return x


def int_eq(mine, theirs):
    if mine is None or theirs is None:
        return mine is None and theirs is None
    if isinstance(theirs, bool) or not isinstance(theirs, (int, float)):
        return False
    return float(theirs).is_integer() and int(theirs) == int(mine)


def g_eq(key, mine, theirs):
    """g 칸: 정수 칸은 그대로 · 소수 칸은 gdr-data §4 자리로 반올림한 값(또는 반올림 안 한 값)과 1e-6 상대 차 안."""
    if mine is None or theirs is None:
        return mine is None and theirs is None
    if isinstance(theirs, bool) or not isinstance(theirs, (int, float)):
        return False
    if key in INT_KEYS:
        return int_eq(mine, theirs)
    if key == 'tv20' and float(theirs).is_integer():
        # 원 정수(gdr-data §4) → 정수끼리는 그대로: 내 값을 정수로 반올림한 값(짝수 쪽 · 위쪽) 가운데 하나와 같아야 함
        with localcontext() as ctx:
            ctx.prec = 80
            d = to_dec(Fraction(mine))
            ints = {int(d.quantize(Decimal(1), rounding=ROUND_HALF_EVEN)), int(d.quantize(Decimal(1), rounding=ROUND_HALF_UP))}
        return int(theirs) in ints
    k = 2 if key in PCT_KEYS else 4 if key in RATIO_KEYS else 0 if key == 'tv20' else None
    cands = round_cands(mine, k) if k is not None else {float(mine)}
    return any(close_rel(cand, theirs) for cand in cands)


def evidence(mine, c, key):
    """틀림 한 줄에 붙일 내 셈 숫자(그 칸에 쓰는 값)."""
    G = mine['G'].get(c)
    if key == 'x':
        E = dict(mine['XI'].get(c) or {})
        E['excl'] = mine['excl'].get(c)
    elif G is None:
        E = {'excl': mine['excl'].get(c)}
    elif key == 'g1':
        E = {'opTail': G['opTail'], 'opPrev': G['opPrev'], 'opLast': G['opLast']}
    elif key == 'g2':
        E = {'quiet': G['quiet'], 'r5': G['r5'], 'missIn120': G['miss120']}
    elif key == 'g3':
        E = {'r60': G['r60'], 'maxJump': G['maxJump'], 'keep': G['keep'], 'missIn61': G['miss61']}
    elif key == 'g4':
        E = {'low250x': G['low250x'], 'missIn250': G['miss250']}
    else:
        iv = mine['IND'].get(G['ind']) or {}
        E = {'ind': G['ind'], 'indX': iv.get('indX'), 'ind20': iv.get('ind20'), 'members': iv.get('n'), 'withR20': iv.get('nr20')}
    return {k: (ff(v, 6) if isinstance(v, Fraction) else v) for k, v in E.items()}


def compare(R, mine, theirs, D, bundle_path, need_wrong=False):
    # 맨 위
    if theirs.get('schema') != SCHEMA:
        R.add('schema', SCHEMA, theirs.get('schema'), 'shape')
    if theirs.get('version') != VERSION:
        R.add('version', VERSION, theirs.get('version'), 'shape')
    if theirs.get('asOf') != D:
        R.add('asOf', D, theirs.get('asOf'), 'src')
    if theirs.get('base') != BASE:
        R.add('base', BASE, theirs.get('base'), 'amt')
    src = theirs.get('src')
    if not src or not same_bundle(bundle_path, str(src)):
        R.add('src', rel(bundle_path), src, 'src')
    tr = theirs.get('rules') or {}
    for k, v in RULES.items():
        if k not in tr or jsonable(tr.get(k)) != v:
            R.add(f'rules.{k}', v, tr.get(k), 'shape')
    if theirs.get('sayings') != SAYINGS:
        R.add('sayings', SAYINGS, theirs.get('sayings'), 'saying')
    dts = theirs.get('dates')
    if isinstance(dts, dict):
        for k in ('site', 'bundle', 'calc'):
            if k in dts and dts[k] != D:
                R.add(f'dates.{k}', D, dts[k], 'src')

    # counts — 표 칸 · gdr-data 에 적은 더한 칸은 모두 값 그대로 · 그 밖에 더 있는 칸은 셀 수 없어 unchecked 로만 적음
    mc, tc = mine['counts'], theirs.get('counts') or {}
    unchecked = []
    for k in sorted(set(mc) | set(tc), key=lambda k: (TABLE_COUNT_KEYS.index(k) if k in TABLE_COUNT_KEYS else 99, k)):
        if k not in mc:
            unchecked.append(k)
            continue
        a, b = mc.get(k, '(없음)'), tc.get(k, '(없음)')
        same = (a is None and b is None) or (
            not isinstance(a, str) and not isinstance(b, str) and a is not None and b is not None
            and not isinstance(b, bool) and float(a) == float(b))
        if not same:
            R.add(f'counts.{k}', a, b, 'counts' if k in TABLE_COUNT_KEYS else 'X1')

    # 고른 곳 차례
    mp, tp = mine['picks'], theirs.get('picks') or []
    mcodes = [p['code'] for p in mp]
    tcodes = [p.get('code') for p in tp]
    if mcodes != tcodes:
        R.add('picks.codes', mcodes, tcodes, 'pick')
    tby = {p.get('code'): p for p in tp}
    for p in mp:
        q = tby.get(p['code'])
        if q is None:
            continue
        w = f"picks[{p['code']}]"
        for k in ('no', 'price', 'sell', 'half', 'saying'):
            if not int_eq(p[k], q.get(k)):
                R.add(f'{w}.{k}', p[k], q.get(k), {'no': 'pick', 'price': 'sell', 'sell': 'sell', 'half': 'sell', 'saying': 'saying'}[k])
        if not (isinstance(q.get('w'), (int, float)) and not isinstance(q.get('w'), bool) and float(q['w']) == float(p['w'])):
            R.add(f'{w}.w', p['w'], q.get('w'), 'w')
        for k in ('ind', 'name'):
            if q.get(k) != p[k]:
                R.add(f'{w}.{k}', p[k], q.get(k), 'G5' if k == 'ind' else 'shape')
        for ak in ('amt', 'amount', 'won'):
            if ak in q and not int_eq(p['amt'], q[ak]):
                R.add(f'{w}.{ak}', p['amt'], q[ak], 'amt')
        if q.get('reason') not in p['reasonOk']:
            R.add(f'{w}.reason', p['reason'], q.get('reason'), 'reason')
        if need_wrong or 'wrong' in q:
            tw = q.get('wrong', '(없음)')
            if tw not in p['wrongOk']:
                R.add(f'{w}.wrong', p['wrong'], tw, 'wrong',
                      note=f"wrong-v1 {p['wrongNo']}번 줄 · {p['wrongWhy']}"
                           + (f" · 받는 글 {p['wrongOk']}" if len(p['wrongOk']) > 1 else ''),
                      follows='verify' if 'wrong' in q else 'neither')
        tg = q.get('g') or {}
        for k in G_KEYS_TABLE + G_KEYS_EXTRA:
            if k not in tg:
                if k in G_KEYS_TABLE:
                    R.add(f'{w}.g.{k}', jsonable(p['g'][k]), '(없음)', 'shape')
                continue
            if not g_eq(k, p['g'][k], tg[k]):
                R.add(f'{w}.g.{k}', jsonable(p['g'][k]), tg[k], 'shape',
                      note='비교 = gdr-data §4 자리로 반올림한 값(또는 반올림 안 한 값)과 1e-6 상대 차')
    # inds
    ti = theirs.get('inds')
    if ti is not None:
        mi = mine['inds']
        if set(mi) != set(ti) or any(float(mi[k]) != float(ti[k]) for k in mi if k in ti):
            R.add('inds', mi, ti, 'w')
    return {'uncheckedCountKeys': unchecked}


def valid_row(row):
    """gates.json 한 줄 꼴: [x 0|1|2, g1 … g5 = 0|1|null] · x ≠ 0 이면 g 모두 null."""
    if not isinstance(row, list) or len(row) != 6:
        return False
    x = row[0]
    if type(x) is not int or x not in (0, 1, 2):
        return False
    if any(not (v is None or (type(v) is int and v in (0, 1))) for v in row[1:]):
        return False
    return x == 0 or all(v is None for v in row[1:])


GATE_MISSING_MODES = ('null', 'zero')


def expect_gt(mine, mode):
    """맞댈 gates 값. null(처음 · 표 글 「null 셀 수 없음」): 값이 빠지면 null · 이미 떨어짐이 정해진 곳은 null 또는 0
    · zero(--gate-missing zero · 「없으면 탈락」을 0 으로 읽음): x = 0 인 곳은 늘 0 · 1(값이 빠지면 0) · null 은 뺀 곳에만."""
    if mode == 'null':
        return mine['GT']
    out = {}
    for c, row in mine['GT'].items():
        if row[0] != 0:
            out[c] = row
        else:
            out[c] = [0] + [((0, 0) if v1 is None else (v1, v1)) for v1, _v2 in row[1:]]
    return out


def compare_gates(R, mine, gates, theirs, D, cap=300, mode='null'):
    """gates.json(brief2 「gates.json 꼴」) 맞대 보기 → 요약."""
    S = {'present': True, 'missingMode': mode}
    if not isinstance(gates, dict):
        R.add('gates', '{schema, version, asOf, keys, co}', type(gates).__name__, 'gates')
        return S
    for k, want in (('schema', GATES_SCHEMA), ('version', VERSION), ('asOf', D), ('keys', GATE_KEYS)):
        if gates.get(k) != want:
            R.add(f'gates.{k}', want, gates.get(k), 'gates' if k != 'asOf' else ['gates', 'src'])
    if theirs is not None and gates.get('asOf') != theirs.get('asOf'):
        R.add('gates.asOf ↔ gdr.json asOf', theirs.get('asOf'), gates.get('asOf'), 'gates', follows='neither',
              note='만든 쪽 두 파일의 날짜가 다름')
    rules = gates.get('rules')
    if rules is not None:
        if not isinstance(rules, dict):
            R.add('gates.rules', RULES, rules, 'shape')
        else:
            for k, v in RULES.items():
                if k not in rules or jsonable(rules.get(k)) != v:
                    R.add(f'gates.rules.{k}', v, rules.get(k), 'shape')
    co = gates.get('co')
    if not isinstance(co, dict):
        R.add('gates.co', '{번호: [x, g1 … g5]}', type(co).__name__, 'gates')
        return S
    GT = expect_gt(mine, mode)
    missing = sorted(set(GT) - set(co))
    extra = sorted(set(co) - set(GT))
    if missing:
        R.add('gates.co 빠진 회사', len(GT), {'n': len(missing), 'codes': missing[:40]}, 'gates',
              note='회사 주식 모두(mkt.json companies)가 있어야 함')
    if extra:
        R.add('gates.co 회사 주식 아닌 번호', 0, {'n': len(extra), 'codes': extra[:40]}, 'gates')
    shape_bad, bad = [], []
    reading = {k: {'null': [], 'zero': []} for k in GATE_KEYS[1:]}
    for c in sorted(set(GT) & set(co)):
        row = co[c]
        if not valid_row(row):
            shape_bad.append(c)
            continue
        m = GT[c]
        if row[0] != m[0]:
            bad.append((c, 'x', m[0], row[0]))
            continue
        for j in range(1, 6):
            v1, v2 = m[j]
            b = row[j]
            if tri_eq(v1, b):
                if v1 != v2:
                    reading[GATE_KEYS[j]]['null'].append(c)
            elif tri_eq(v2, b):
                reading[GATE_KEYS[j]]['zero'].append(c)
            else:
                bad.append((c, GATE_KEYS[j], (v1, v2), b))
    if shape_bad:
        R.add('gates.co 꼴', '[x 0|1|2, g1 … g5 = 0|1|null] · x ≠ 0 이면 g 모두 null',
              {'n': len(shape_bad), 'codes': shape_bad[:40], 'first': co[shape_bad[0]]}, ['gates', 'gx', 'gN'])
    for c, k, mv, tv in bad[:cap]:
        if k == 'x':
            R.add(f'gates.co[{c}].x', mv, tv, ['gx', 'X1', 'X2'], evidence=evidence(mine, c, 'x'))
        else:
            v1, v2 = mv
            mine_v = v1 if v1 == v2 else {'null(값이 빠짐)': v1, '0(있는 값으로 이미 못 지남)': v2}
            if v1 != v2:
                note = '표가 null · 0 을 정하지 않은 곳 — 둘 다 받는데 그 밖의 값'
            elif v1 is None and tv == 0:
                note = ('쓰는 값이 빠져 셀 수 없음(null) 인데 0 — 표 「gN = … null 셀 수 없음」 · 만든 쪽은 「없으면 탈락」을 0 으로 읽음'
                        '(그 읽기는 --gate-missing zero 로 따로 맞대 봄)')
            else:
                note = None
            R.add(f'gates.co[{c}].{k}', mine_v, tv, [k.upper(), 'gN'], evidence=evidence(mine, c, k), note=note)
    if len(bad) > cap:
        R.add('gates.co 틀림 더 있음', f'처음 {cap}줄만 적음', {'n': len(bad)}, 'gN')
    for k, d in reading.items():
        if d['null'] and d['zero']:
            R.add(f'gates 읽기 섞임 {k}', '한 문 안에서는 null 또는 0 한 가지',
                  {'null': len(d['null']), 'zero': len(d['zero']), 'nullCodes': d['null'][:10], 'zeroCodes': d['zero'][:10]},
                  'gN', follows='neither', note='값이 빠졌는데 있는 값으로 이미 못 지남이 정해진 곳에서 null 과 0 이 섞임')
    # 수: gates.json 에서 센 수 = gdr.json counts(brief2) — 그리고 내 셈과도
    gc = {'companies': len(co), 'outThin': 0, 'outHalt': 0, 'afterOut': 0,
          'g1': 0, 'g2': 0, 'g3': 0, 'g4': 0, 'g5': 0, 'passAll': 0}
    for row in co.values():
        if not valid_row(row):
            continue
        if row[0] == 1:
            gc['outThin'] += 1
        elif row[0] == 2:
            gc['outHalt'] += 1
        else:
            gc['afterOut'] += 1
            for j in range(1, 6):
                gc[f'g{j}'] += row[j] == 1
            gc['passAll'] += all(row[j] == 1 for j in range(1, 6))
    tc = (theirs or {}).get('counts') or {}
    if theirs is not None:
        for k, v in gc.items():
            if tc.get(k) != v:
                R.add(f'gates.json 으로 센 {k} ↔ gdr.json counts.{k}', tc.get(k), v, ['gN', 'counts'], follows='neither',
                      note='gates.json 에서 센 수가 gdr.json counts 와 다름(brief2: 같아야 함)')
    mc = mine['counts']
    # 고른 곳 = 다섯 문 다 지남
    for q in (theirs or {}).get('picks') or []:
        row = co.get(q.get('code'))
        if row != [0, 1, 1, 1, 1, 1]:
            R.add(f"gates.co[{q.get('code')}] 고른 곳", [0, 1, 1, 1, 1, 1], row, ['pick', 'gN'], follows='neither',
                  note='gdr.json 에서 고른 곳인데 gates.json 은 다섯 문 다 지남이 아님')
    # 칸 수(x = 0 인 줄 · 문마다 1 · 0 · null) — 만든 쪽 · 내 셈(값이 빠지면 null 로 · 이미 떨어짐은 0 으로 읽었을 때 둘)
    def cells(rows, pick):
        out = {k: {'1': 0, '0': 0, 'null': 0} for k in GATE_KEYS[1:]}
        for row in rows:
            for j in range(1, 6):
                v = pick(row[j])
                out[GATE_KEYS[j]]['null' if v is None else str(v)] += 1
        return out
    S['cells'] = {
        'theirs': cells([r for r in co.values() if valid_row(r) and r[0] == 0], lambda v: v),
        'mineNullWhenMissing': cells([r for r in mine['GT'].values() if r[0] == 0], lambda v: v[0]),
        'mineZeroWhenAlreadyFailed': cells([r for r in mine['GT'].values() if r[0] == 0], lambda v: v[1]),
    }
    S.update({
        'n': len(co), 'counts': gc,
        'countsEqGdr': theirs is not None and all(tc.get(k) == v for k, v in gc.items()),
        'countsEqMine': all(mc.get(k) == v for k, v in gc.items()),
        'missingN': len(missing), 'extraN': len(extra), 'shapeBadN': len(shape_bad), 'mismatchN': len(bad),
        'nullOrZeroReading': {k: {'null': len(d['null']), 'zero': len(d['zero'])} for k, d in reading.items()},
        'nullOrZeroCodes': {k: {'null': d['null'][:20], 'zero': d['zero'][:20]} for k, d in reading.items() if d['null'] or d['zero']},
        'xCounts': {str(x): sum(1 for r in co.values() if isinstance(r, list) and r and r[0] == x) for x in (0, 1, 2)},
    })
    return S


def invariants(mine, theirs):
    """만든 쪽 gdr.json 이 지켜야 할 것(내 다시 세기와 함께)."""
    inv = {}
    tp = theirs.get('picks') or []
    tc = theirs.get('counts') or {}
    G = mine['G']

    def put(name, ok, detail=None):
        inv[name] = {'ok': bool(ok)}
        if detail is not None:
            inv[name]['detail'] = detail

    ws = [q.get('w') for q in tp]
    try:
        sw = sum(Fraction(str(w)) for w in ws)
        cash = Fraction(str(tc.get('cash')))
        put('sumW_plus_cash_eq_100', sw + cash == 100, {'sumW': float(sw), 'cash': float(cash)})
    except Exception as e:  # noqa: BLE001
        put('sumW_plus_cash_eq_100', False, f'셀 수 없음: {e}')
    per_w, per_n = {}, {}
    for q in tp:
        i = q.get('ind')
        per_w[i] = per_w.get(i, 0) + (q.get('w') or 0)
        per_n[i] = per_n.get(i, 0) + 1
    put('industry_sum_le_9', all(v <= 9 for v in per_w.values()), per_w)
    ti = theirs.get('inds')
    if ti is not None:
        put('inds_eq_sum_of_picks', {k: float(v) for k, v in ti.items()} == {k: float(v) for k, v in per_w.items()})
    put('per_industry_le_3', all(v <= PER_IND for v in per_n.values()), per_n)
    put('picks_le_36', len(tp) <= MAX_PICKS, len(tp))
    codes = [q.get('code') for q in tp]
    put('no_duplicate_codes', len(codes) == len(set(codes)))
    put('picked_eq_len', tc.get('picked') == len(tp), {'picked': tc.get('picked'), 'len': len(tp)})
    # 제 꼴 맞음(자기 값끼리): 번호 · 비중 · 팔 선 · 절반 · 격언
    bad = []
    for k, q in enumerate(tp):
        no = k + 1
        pr = q.get('price')
        if q.get('no') != no:
            bad.append(f"{q.get('code')} no {q.get('no')} ≠ {no}")
        if q.get('w') != weight(no):
            bad.append(f"{q.get('code')} w {q.get('w')} ≠ {weight(no)}")
        if isinstance(pr, int):
            if q.get('sell') != (pr * 9) // 10:
                bad.append(f"{q.get('code')} sell {q.get('sell')} ≠ {(pr * 9) // 10}")
            if q.get('half') != (pr * 12) // 10:
                bad.append(f"{q.get('code')} half {q.get('half')} ≠ {(pr * 12) // 10}")
        else:
            bad.append(f"{q.get('code')} price 정수 아님")
        if q.get('saying') != (no - 1) % 11:
            bad.append(f"{q.get('code')} saying {q.get('saying')} ≠ {(no - 1) % 11}")
    put('self_consistent_no_w_sell_half_saying', not bad, bad or None)
    # 다섯 문 모두 통과(내 셈으로)
    fails = []
    for q in tp:
        c = q.get('code')
        if c in G:
            f = [k for k in GATE_NAMES if not G[c][k]]
            if f:
                fails.append({'code': c, 'fail': f})
        else:
            fails.append({'code': c, 'fail': ['먼저 뺌 ' + mine['excl'].get(c, '모음 회사 아님')]})
    put('picks_pass_all_gates_in_my_recount', not fails, fails or None)
    # 다섯 문을 다 넘었는데 빠진 곳은 업종 3곳 · 36곳 한도로만 설명돼야 함(내 차례로 걸음)
    tset = set(codes)
    per, total, skipped = {}, 0, []
    for c in mine['ranked']:
        i = G[c]['ind']
        if c in tset:
            per[i] = per.get(i, 0) + 1
            total += 1
        elif not (per.get(i, 0) >= PER_IND or total >= MAX_PICKS):
            skipped.append(c)
    put('no_unexplained_skip', not skipped, skipped or None)
    # 셈 수 이음(만든 쪽이 적은 식 companies = outThin + outHalt + (managed ?? 0) + afterOut)
    try:
        lhs = tc['companies']
        rhs = tc['outThin'] + tc['outHalt'] + (tc.get('managed') or 0) + tc['afterOut']
        put('counts_add_up', lhs == rhs, {'companies': lhs, 'sum': rhs})
    except Exception as e:  # noqa: BLE001
        put('counts_add_up', False, f'셀 수 없음: {e}')
    try:
        put('passAll_ge_picked', tc['passAll'] >= tc['picked'], {'passAll': tc['passAll'], 'picked': tc['picked']})
    except Exception as e:  # noqa: BLE001
        put('passAll_ge_picked', False, f'셀 수 없음: {e}')
    return inv


def my_invariants(mine):
    """내 셈도 같은 불변식을 지키는지(스스로 점검) + gates 두 읽기가 counts 와 이어지는지."""
    fake = {'picks': [{k: v for k, v in p.items() if k in ('no', 'code', 'ind', 'w', 'price', 'sell', 'half', 'saying')}
                      for p in mine['picks']],
            'counts': mine['counts'], 'inds': mine['inds']}
    inv = invariants(mine, fake)
    GT, mc = mine['GT'], mine['counts']
    for rd in (0, 1):
        got = {'afterOut': sum(1 for v in GT.values() if v[0] == 0),
               'outThin': sum(1 for v in GT.values() if v[0] == 1),
               'outHalt': sum(1 for v in GT.values() if v[0] == 2)}
        for j in range(1, 6):
            got[f'g{j}'] = sum(1 for v in GT.values() if v[0] == 0 and v[j][rd] == 1)
        got['passAll'] = sum(1 for v in GT.values() if v[0] == 0 and all(v[j][rd] == 1 for j in range(1, 6)))
        ok = all(mc[k] == v for k, v in got.items())
        inv[f'gates_reading{rd + 1}_counts_eq_mine'] = {'ok': ok, **({} if ok else {'detail': got})}
    return inv


# ── 일부러 만든 자료로 돌려 보기(--stress) ────────────────────────────────────────
# 지금 자료로는 다섯 문을 다 넘는 곳이 적어 업종 3곳 · 36곳 한도 · 비중 2.5 / 2 · 차례 같음 · 경계 · wrong-v1 줄 대부분이
# 안 걸림 → 그 길을 일부러 만듦. 회사마다 설계 뜻(EXP)도 적어 내 셈부터 맞는지 봄(세 갈래 맞대기: 설계 뜻 · 내 셈 · 만든 쪽 셈).
# EXP = {excl, fail(먼저 뺀 뒤 못 지난 문), tri(문 → (R1, R2) · 적지 않으면 지남 (1, 1) · 못 지남 (0, 0)), pick, wrong(번호, 글)}
S_NDAY = 300


def stress_dates(dates_src):
    try:
        T = load_json(dates_src)['dates'][-S_NDAY:]
    except Exception:  # noqa: BLE001 — 날 이름만 빌림 · 없으면 평일로
        T = []
    if len(T) != S_NDAY:
        from datetime import date, timedelta
        d, T = date(2026, 10, 13), []
        while len(T) < S_NDAY:
            if d.weekday() < 5:
                T.append(d.isoformat())
            d -= timedelta(days=1)
        T.reverse()
    return T


def stress_a(T):
    """A: 업종 3곳 · 36곳 한도 · 비중 3/2.5/2 · 차례 같음 · 문 경계 딱 맞음 · 빈 날 · 2^53 넘는 합 · 먼저 뺌."""
    assert len(T) == S_NDAY
    cos, exp = [], {}
    no = [900000]

    def nc():
        no[0] += 1
        return str(no[0])

    def add(code, ind, close, vol, op, name, e=None):
        assert len(close) == S_NDAY and len(vol) == S_NDAY and all(x['code'] != code for x in cos)
        cos.append({'code': code, 'name': name, 'ind': ind, 'close': close, 'vol': vol, 'op': op})
        exp[code] = e or {'excl': None, 'fail': []}

    def lin(p0, p1, start=60):
        return [p0 if n >= start else round(p0 + (p1 - p0) * (start - n) / start) for n in range(S_NDAY)]

    def vols(vp, vr, zero=()):
        return [0 if n in zero else (vr if n < 20 else vp) for n in range(S_NDAY)]

    seed = [12345]

    def rnd():
        seed[0] = (seed[0] * 1103515245 + 12345) % (2 ** 31)
        return seed[0] / 2 ** 31

    V = vols(150000, 195000)
    # ① 업종 열 곳 × 넷 = 비율 있는 통과 40곳(업종 3곳 한도 → 30곳) · 비율 같음(0.5)은 r60 작은 쪽이 앞
    for k in range(1, 11):
        for j in range(4):
            g = 0.06 + 0.30 * rnd()
            a = 100 + int(400 * rnd())
            b = a + 1 + int(a * 2 * rnd())
            if k == 1 and j == 0:
                a, b, g = 100, 150, 0.10
            if k == 1 and j == 1:
                a, b, g = 60, 90, 0.20
            p1 = round(10000 * (1 + g))
            while (p1 - 10000) % 10 == 5 or (p1 - 10000) % 100 == 50:   # 글 숫자가 딱 반(.x5 · .50)이 안 되게(소수 셈 길과 무관하게 맞대려고)
                p1 += 1
            c = nc()
            add(c, f'업종{k:02d}', lin(10000, p1), V, [a - 5, a, b], f'가{c[-3:]}')
    # 비율 · r60 이 같음 → 번호 글자 차례(800019 < 80001A)
    add('80001A', '업종02', lin(10000, 11500), V, [10, 100, 300], '나1A')
    add('800019', '업종02', lin(10000, 11500), V, [10, 100, 300], '나19')
    # ② 앞 해 ≤ 0(비율 없음) 업종 셋 × 넷 · r60 차례 → 36곳 한도가 이 안에서 걸림
    for ind, gs in (('영업N1', (0.06, 0.07, 0.08, 0.09)), ('영업N2', (0.10, 0.11, 0.12, 0.13)), ('영업N3', (0.14, 0.15, 0.16, 0.17))):
        for j, g in enumerate(gs):
            c = nc()
            add(c, ind, lin(10000, round(10000 * (1 + g))), V, [5, -50 + 50 * (j % 2), 30 + j], f'다{c[-3:]}')
    # ③ 경계(낮은 비율 1000 → 1001 · 꽉 찬 업종에 넣어 한도로 빠짐)
    LOW = [900, 1000, 1001]

    def bnd(name, ind, close, vol, op=LOW, excl=None, fail=(), tri_=None):
        c = nc()
        e = {'excl': excl, 'fail': sorted(fail)}
        if tri_:
            e['tri'] = tri_
        add(c, ind, close, vol, op, name, e)
        return c

    def r5path(p5, p0):
        return [9000 if n >= 60 else round(9000 + (p5 - 9000) * (60 - n) / 55) if n >= 5 else round(p5 + (p0 - p5) * (5 - n) / 5)
                for n in range(S_NDAY)]

    def jump(p_after, p_end):
        return [10000 if n >= 30 else (p_end if n == 0 else p_after) for n in range(S_NDAY)]

    def keep(p_end):
        return [15000 if n >= 60 else round(15000 + 5000 * (60 - n) / 50) if n >= 10 else round(p_end + (20000 - p_end) * n / 10)
                for n in range(S_NDAY)]

    def low(lo):
        return [lo if n >= 200 else round(lo + (8000 - lo) * (200 - n) / 140) if n >= 60 else round(8000 + 2000 * (60 - n) / 60)
                for n in range(S_NDAY)]

    flat = [10000] * S_NDAY
    bnd('G3a +5% 딱', '업종03', lin(10000, 10500), V)
    bnd('G3a +40% 딱', '업종03', lin(10000, 14000), V)
    bnd('G3a +40.01%', '업종04', lin(10000, 14001), V, fail=['G3'])
    bnd('G3a +4.99%', '업종04', lin(10000, 10499), V, fail=['G3'])
    bnd('G2b +10% 딱', '업종05', r5path(10000, 11000), V, fail=['G2'])
    bnd('G2b +9.99%', '업종05', r5path(10000, 10999), V)
    bnd('G3b +15% 딱', '업종06', jump(11500, 11600), V, fail=['G3'])
    bnd('G3b +14.99%', '업종06', jump(11499, 11600), V)
    bnd('G3c 0.85 딱', '업종07', keep(17000), V)
    bnd('G3c 0.84995', '업종07', keep(16999), V, fail=['G3'])
    bnd('G4 2.0 딱', '업종08', low(5000), V, fail=['G4'])
    bnd('G4 1.9996', '업종08', low(5001), V)
    bnd('G2a 2배 딱', '업종09', flat, vols(100000, 200000), fail=['G3'])
    bnd('G2a 2.00001배', '업종09', flat, vols(100000, 200001), fail=['G2', 'G3'])
    bnd('X1 10억 딱', '업종10', flat, vols(100000, 100000), fail=['G3'])
    bnd('G1 op 하나', '업종10', lin(10000, 11000), V, op=[50], fail=['G1'], tri_={'G1': (None, None)})
    bnd('G1 op null', '업종10', lin(10000, 11000), V, op=[10, None, 50], fail=['G1'], tri_={'G1': (None, None)})
    bnd('G1 같음', '업종05', lin(10000, 11000), V, op=[90, 100, 100], fail=['G1'])
    bnd('G1 끝 0', '업종06', lin(10000, 11000), V, op=[1, -10, 0], fail=['G1'])
    bnd('G1 0 → 20', '업종07', lin(10000, 11000), V, op=[1, 0, 20])
    # ④ 먼저 뺌
    X = '제외'
    v15 = vols(100000, 100000)
    v15[4] = 99999
    bnd('X1 9억9999만9500', X, flat, v15, excl='X1')
    bnd('X1 · X2 둘 다', X, flat, vols(10000, 10000, zero=(2,)), excl='X1')
    bnd('X2 거래량 0', X, flat, vols(300000, 300000, zero=(3,)), excl='X2')
    c = nc()
    add(c, X, [10000 if n < 15 else None for n in range(S_NDAY)], [100000 if n < 15 else None for n in range(S_NDAY)], LOW,
        'X1? 15날', {'excl': 'X1?', 'fail': []})
    cl, vv = lin(10000, 11000), list(V)
    cl[7] = vv[7] = None
    c = nc()
    add(c, X, cl, vv, LOW, 'X1? 빈 날', {'excl': 'X1?', 'fail': []})
    cl, vv = lin(10000, 11000), list(V)
    cl[50] = vv[50] = None
    c = nc()
    add(c, '업종09', cl, vv, LOW, '앞 창 빈 날', {'excl': None, 'fail': ['G2', 'G3', 'G4'],
                                                 'tri': {'G2': (None, None), 'G3': (None, None), 'G4': (None, None)}})
    c = nc()
    add(c, X, [None if n < 3 else 10000 for n in range(S_NDAY)], [None if n < 3 else 300000 for n in range(S_NDAY)], LOW,
        '끝 3날 없음', {'excl': 'X1?', 'fail': []})
    # ⑤ 업종 G5 경계: 가운데 값 0 딱(+10% · −10%) → 탈락 · 비 1.1 딱 → 통과 · 1.09999 → 탈락
    z1 = [10000 if n >= 60 else round(10000 + 2000 * (60 - n) / 40) if n >= 20 else round(12000 + 1200 * (20 - n) / 20) for n in range(S_NDAY)]
    z2 = [10000 if n >= 60 else round(10000 + 3000 * (60 - n) / 40) if n >= 20 else round(13000 - 1300 * (20 - n) / 20) for n in range(S_NDAY)]
    bnd('G5 가운데 0 · +10%', '가운데0', z1, vols(150000, 225000), op=[1, 100, 200], fail=['G5'])
    bnd('G5 가운데 0 · −10%', '가운데0', z2, vols(150000, 225000), op=[1, 100, 200], fail=['G5'])
    for ind, vr in (('비11', 110000), ('비109', 109999)):
        bnd(f'{ind} A', ind, flat, vols(100000, vr), op=[1, 100, 200], fail=['G3'] if vr == 110000 else ['G3', 'G5'])
        for s in 'BC':
            bnd(f'{ind} {s}', ind, lin(10000, 11000), [0] * S_NDAY, op=[1, 100, 200], excl='X1')
    # ⑥ 2^53 넘는 합 · G2(a) 2배 딱
    p, v = 1999999, 59999999
    bnd('큰 수 2배 딱', '큰돈', [p] * S_NDAY, vols(v, 2 * v), op=[1, 100, 200], fail=['G3', 'G5'])
    bnd('큰 수 2배 + 1주', '큰돈', [p] * S_NDAY, [2 * v + 1 if n == 0 else (2 * v if n < 20 else v) for n in range(S_NDAY)],
        op=[1, 100, 200], fail=['G2', 'G3', 'G5'])
    return {'cos': cos, 'exp': exp, 'etf': 3}


def stress_b(T):
    """B: wrong-v1 다섯 줄 · 경계 · 앞선 줄 차례(모두 고름 · 36곳 안 · 업종마다 한 곳)
    + 먼저 뺀 까닭 경계(x 1 · 2) · 셀 수 없음(null) · 값이 빠졌는데 이미 못 지남(null 또는 0)."""
    S = len(T)
    cos, exp = [], {}
    no = [920000]

    def nc():
        no[0] += 1
        return str(no[0])

    def add(code, ind, close, vol, op, name, e):
        assert len(close) == S and len(vol) == S and code not in exp
        cos.append({'code': code, 'name': name, 'ind': ind, 'close': close, 'vol': vol, 'op': op})
        exp[code] = e

    def path(P60, P0, L=None):
        """n ≤ 20 지금 값 P0(최근 20날 고름 → 업종 돈 비를 정확히 맞춤) · 21 ~ 59 곧게 · 60 ~ P60 · 150 ~ 199 바닥 L."""
        out = []
        for n in range(S):
            v = P0 if n <= 20 else (P60 + (P0 - P60) * (60 - n) // 40 if n < 60 else P60)
            if L is not None and 150 <= n < 200:
                v = L
            out.append(v)
        return out

    def vols_ratio(cl, ratio, minus=0):
        """업종 돈 비 indX = ratio 가 정확히 되게(도우미는 거래 0): 최근 20날 V · 그 앞 V2 → (V − minus, V2)."""
        P0 = cl[0]
        assert all(cl[n] == P0 for n in range(20))
        s = sum(cl[20:80])
        r = Fraction(ratio)
        a, b = r.numerator * s, 60 * P0 * r.denominator    # V : V2 = a : b ⇔ 60·P0·V ÷ (V2·s) = r
        g = math.gcd(a, b)
        a, b = a // g, b // g
        m = -(-1_200_000_000 // (P0 * a))                    # P0·V ≥ 12억(뺌 문 넉넉히)
        V, V2 = a * m - minus, b * m
        return [V if n < 20 else V2 for n in range(S)]

    def helper(ind):
        """도우미: 거래 0(→ x 1) · 20거래일 오름 +10%(업종 가운데 값 > 0) · 업종 돈엔 0."""
        c = nc()
        add(c, ind, [10000 if n >= 20 else 10000 + 1000 * (20 - n) // 20 for n in range(S)], [0] * S, [1, 100, 200],
            f'도우미 {ind}', {'excl': 'X1', 'fail': []})

    # ① wrong-v1 — (이름, P60, P0, 바닥, 업종 돈 비, 덜기, fin.op, 기대 줄, 기대 글)
    W = [
        ('w1 r60 30 딱', 10000, 13000, None, Fraction(3, 2), 0, [1, 100, 200], 1, '석 달 30% 올라 숨이 찰 수 있어.'),
        ('w1 r60 39.99 → 40', 10000, 13999, None, Fraction(3, 2), 0, [1, 100, 200], 1, '석 달 40% 올라 숨이 찰 수 있어.'),
        ('w1 r60 30.6 · 2 · 3 · 4 도 맞음', 10000, 13060, 7000, Fraction(6, 5), 0, [1, -50, 30], 1, '석 달 31% 올라 숨이 찰 수 있어.'),
        ('w5 r60 29.99', 10000, 12999, None, Fraction(3, 2), 0, [1, 100, 200], 5, WRONG[5]),
        ('w2 low 1.7 딱', 15000, 17000, 10000, Fraction(3, 2), 0, [1, 100, 200], 2, '1년 바닥보다 1.7배라 더 오르기 버거울 수 있어.'),
        ('w5 low 1.6999', 15000, 16999, 10000, Fraction(3, 2), 0, [1, 100, 200], 5, WRONG[5]),
        ('w2 low 1.96 → 2.0', 16000, 19600, 10000, Fraction(3, 2), 0, [1, 100, 200], 2, '1년 바닥보다 2.0배라 더 오르기 버거울 수 있어.'),
        ('w2 low 1.79 · 3 · 4 도 맞음', 14000, 17900, 10000, Fraction(6, 5), 0, [1, -10, 20], 2, '1년 바닥보다 1.8배라 더 오르기 버거울 수 있어.'),
        ('w5 indX 1.3 딱', 10000, 11000, None, Fraction(13, 10), 0, [1, 100, 200], 5, WRONG[5]),
        ('w3 indX 1.3 바로 아래', 10000, 11000, None, Fraction(13, 10), 1, [1, 100, 200], 3, WRONG[3]),
        ('w3 indX 1.1 딱', 10000, 11100, None, Fraction(11, 10), 0, [1, 100, 200], 3, WRONG[3]),
        ('w3 indX 1.2 · 4 도 맞음', 10000, 11300, None, Fraction(6, 5), 0, [1, -20, 10], 3, WRONG[3]),
        ('w5 opGrow 0.2 딱', 10000, 11200, None, Fraction(3, 2), 0, [1, 100, 120], 5, WRONG[5]),
        ('w4 opGrow 0.199', 10000, 11400, None, Fraction(3, 2), 0, [1, 1000, 1199], 4, WRONG[4]),
        ('w4 opGrow 없음 0 → 20', 10000, 10800, None, Fraction(3, 2), 0, [1, 0, 20], 4, WRONG[4]),
        ('w4 opGrow 없음 적자', 10000, 10900, None, Fraction(3, 2), 0, [1, -30, 5], 4, WRONG[4]),
        ('w5 깨끗', 10000, 11500, None, Fraction(3, 2), 0, [1, 100, 300], 5, WRONG[5]),
    ]
    for k, (name, P60, P0, L, ratio, minus, op, wno, wtxt) in enumerate(W):
        ind = f'W{k + 1:02d}'
        cl = path(P60, P0, L)
        c = nc()
        add(c, ind, cl, vols_ratio(cl, ratio, minus), op, name,
            {'excl': None, 'fail': [], 'pick': True, 'wrong': (wno, wtxt)})
        helper(ind)
    # ② 먼저 뺀 까닭(x) 경계
    flat = [10000] * S
    v = [300000] * S
    v[4] = 0
    add(nc(), 'XB', flat, v, [1, 100, 200], 'X2 5날째 거래 0', {'excl': 'X2', 'fail': []})
    v = [300000] * S
    v[5] = 0
    add(nc(), 'XB', flat, v, [1, 100, 200], 'X2 6날째 거래 0 → 안 뺌', {'excl': None, 'fail': ['G3', 'G5']})
    cl, v = list(flat), [300000] * S
    cl[19] = v[19] = None
    add(nc(), 'XC', cl, v, [1, 100, 200], 'X1? 19날째 빈 날', {'excl': 'X1?', 'fail': []})
    cl, v = list(flat), [200000 if n < 20 else 100000 for n in range(S)]
    cl[20] = v[20] = None
    add(nc(), 'XD', cl, v, [1, 100, 200], 'X1? 20날째 빈 날 → 안 뺌 · G3 이미 떨어짐(r60 0)',
        {'excl': None, 'fail': ['G2', 'G3', 'G4'], 'tri': {'G2': (None, None), 'G3': (None, 0), 'G4': (None, None)}})
    helper('XD')
    # ③ 셀 수 없음(null) · 이미 떨어짐(null 또는 0)
    cl = path(10000, 11000)
    add(nc(), None, cl, vols_ratio(cl, Fraction(3, 2)), [1, 100, 200], 'G5 업종 없음',
        {'excl': None, 'fail': ['G5'], 'tri': {'G5': (None, None)}})
    add(nc(), 'XN', [10000 if n < 20 else None for n in range(S)], [200000 if n < 20 else None for n in range(S)], [1, 100, 200],
        '새 상장 20날 · 업종 혼자', {'excl': None, 'fail': ['G2', 'G3', 'G4', 'G5'],
                                    'tri': {k: (None, None) for k in ('G2', 'G3', 'G4', 'G5')}})
    cl = [10000 if n >= 5 else 10000 + 1200 * (5 - n) // 5 for n in range(S)]
    v = [150000 if n < 20 else 100000 for n in range(S)]
    cl[100] = v[100] = None
    add(nc(), 'XE', cl, v, [1, 100, 200], 'G2 앞 창 빈 날 · 5일 +12%(이미 떨어짐)',
        {'excl': None, 'fail': ['G2', 'G4'], 'tri': {'G2': (None, 0), 'G4': (None, None)}})
    helper('XE')

    def e8(n):
        if n >= 200:
            return None
        if n >= 100:
            return 5000
        if n >= 60:
            return 9000 - 4000 * (n - 60) // 40
        return 10500 - 1500 * n // 60
    add(nc(), 'XF', [e8(n) for n in range(S)], [None if n >= 200 else (110000 if n < 20 else 100000) for n in range(S)], [1, 100, 200],
        'G4 짧은 이력 · 바닥 두 배(이미 떨어짐)', {'excl': None, 'fail': ['G4'], 'tri': {'G4': (None, 0)}})
    helper('XF')
    cl = path(10000, 11000)
    add(nc(), 'XH', cl, vols_ratio(cl, Fraction(3, 2)), [-5], 'G1 한 해뿐 · 적자(이미 떨어짐)',
        {'excl': None, 'fail': ['G1'], 'tri': {'G1': (None, 0)}})
    helper('XH')
    cl = path(10000, 11000)
    cl[20] = None
    add(nc(), 'XG', cl, [None if n == 20 else 100000 for n in range(S)], [1, 100, 200],
        'G5 업종 비 1.08 · 가운데 값 없음(이미 떨어짐)',
        {'excl': None, 'fail': ['G2', 'G3', 'G4', 'G5'],
         'tri': {'G2': (None, None), 'G3': (None, None), 'G4': (None, None), 'G5': (None, 0)}})
    return {'cos': cos, 'exp': exp, 'etf': 2}


def stress_write(root, T, cos, n_etf):
    """root 아래에 site/atlas/data(mkt · days · co) · reports/atlas11/universe/stress/bundle.json.gz · universe.json 을 만듦(만든 쪽이 읽는 꼴 · gdr-data §1)."""
    S = len(T)
    D = T[-1]
    dataD = os.path.join(root, 'site', 'atlas', 'data')
    os.makedirs(os.path.join(dataD, 'co'), exist_ok=True)
    os.makedirs(os.path.join(root, 'site', 'next', 'data'), exist_ok=True)
    with open(os.path.join(dataD, 'days.json'), 'w', encoding='utf-8') as f:
        json.dump({'schema': 'atlas-new-days-1', 'asOf': D, 'dates': T}, f, ensure_ascii=False)
    companies, stocks = {}, {}
    for c in cos:
        cl = c['close']
        r20 = round((cl[0] / cl[20] - 1) * 100, 2) if cl[0] is not None and cl[20] is not None else None
        ent = {'n': c['name'], 'c': r20, 'l': [10000] * 21}
        if c['ind'] is not None:
            ent['i'] = c['ind']
        companies[c['code']] = ent
        rows = [[T[S - 1 - n].replace('-', ''), cl[n], cl[n], cl[n], cl[n], c['vol'][n]]
                for n in range(S - 1, -1, -1) if cl[n] is not None]
        stocks[c['code']] = {'list': {'code': c['code'], 'name': c['name'], 'market': 'KOSDAQ', 'endType': 'stock'},
                             'fchart': {'rows': rows, 'cut': D.replace('-', '')}}
        k0 = next(k for k in range(S) if cl[S - 1 - k] is not None)
        co = {'schema': 'atlas-new-co-1', 'code': c['code'], 'k0': k0, 'close': [cl[S - 1 - k] for k in range(k0, S)],
              'jumps': [], 'key': 'op',
              'fin': {'years': [f'{2026 - len(c["op"]) + i}.12' for i in range(len(c['op']))], 'op': c['op']},
              'c': {'name': c['name'], 'i': c['ind'], 'price': cl[0], 'priceDate': D if cl[0] is not None else None}}
        with open(os.path.join(dataD, 'co', c['code'] + '.json'), 'w', encoding='utf-8') as f:
            json.dump(co, f, ensure_ascii=False)
    with open(os.path.join(dataD, 'mkt.json'), 'w', encoding='utf-8') as f:
        json.dump({'schema': 'atlas-new-mkt-1', 'asOf': D, 'base': T[-21], 'n': len(companies), 'pk': 0, 'companies': companies},
                  f, ensure_ascii=False)
    etf = [{'itemCode': f'ETF{i:03d}'} for i in range(n_etf)]
    for e in etf:
        stocks[e['itemCode']] = {'list': {'code': e['itemCode'], 'name': 'ETF', 'market': 'KOSPI', 'endType': 'etf'}, 'fchart': {'rows': []}}
    lists = {'pages': [{'market': 'KOSDAQ', 'text': json.dumps({'stocks': [{'itemCode': c['code']} for c in cos] + etf})}],
             'total': {'KOSDAQ': len(cos) + len(etf)}}
    bdir = os.path.join(root, 'reports', 'atlas11', 'universe', 'stress')
    os.makedirs(bdir, exist_ok=True)
    with gzip.open(os.path.join(bdir, 'bundle.json.gz'), 'wt', encoding='utf-8') as f:
        json.dump({'schema': 'atlas11-universe-bundle-1', 'lists': lists, 'stocks': stocks}, f, ensure_ascii=False)
    os.makedirs(os.path.join(root, 'scripts', 'atlas11', 't365'), exist_ok=True)
    with open(os.path.join(root, 'scripts', 'atlas11', 't365', 'universe.json'), 'w', encoding='utf-8') as f:
        json.dump({'bundle': 'reports/atlas11/universe/stress/bundle.json.gz', 'asOf': D}, f)


def design_check(mine, exp, names):
    """설계 뜻 ↔ 내 셈(먼저 뺌 · 못 지난 문 · 문마다 두 읽기 · 고름 · wrong)."""
    bad = []
    pick_by = {p['code']: p for p in mine['picks']}
    for c, e in exp.items():
        prob = []
        got_ex = mine['excl'].get(c)
        if got_ex != e['excl']:
            prob.append(f"먼저 뺌 {got_ex} ≠ {e['excl']}")
        got_fail = sorted(k for k in GATE_NAMES if c in mine['G'] and not mine['G'][c][k])
        want_fail = [] if e['excl'] else sorted(e['fail'])
        if got_fail != want_fail:
            prob.append(f'못 지난 문 {got_fail} ≠ {want_fail}')
        if e['excl'] is None and c in mine['G']:
            TR = mine['G'][c]['T']
            for k in GATE_NAMES:
                want = (e.get('tri') or {}).get(k) or ((0, 0) if k in e['fail'] else (1, 1))
                if tuple(TR[k]) != tuple(want):
                    prob.append(f'{k} gates 값 {TR[k]} ≠ {want}')
        elif e['excl'] is not None and mine['GT'].get(c, [None])[0] != XCODE.get(e['excl']):
            prob.append(f"gates x {mine['GT'].get(c, [None])[0]} ≠ {XCODE.get(e['excl'])}")
        if e.get('pick'):
            p = pick_by.get(c)
            if p is None:
                prob.append('안 고름')
            elif e.get('wrong') and (p['wrongNo'], p['wrong']) != tuple(e['wrong']):
                prob.append(f"wrong {(p['wrongNo'], p['wrong'])} ≠ {tuple(e['wrong'])}")
        if prob:
            bad.append({'code': c, 'name': names.get(c), 'prob': prob})
    return bad


def run_pick(node, root, dst, data, bundle):
    """만든 쪽 셈을 그 폴더 안에서만 돌림. node 가 「Cannot find module '<root 안 길>'」이라 하면
    그 코드 파일(.mjs · .js · .cjs)만 저장소 같은 자리에서 옮기고 다시 돌림(열어 보지 않음 · 자료 파일은 안 옮김)."""
    env = {k: v for k, v in os.environ.items() if k not in ('GDR_BUNDLE', 'ATLAS_T365_CLOSES')}
    copied = []
    p = None
    for _ in range(8):
        for flag in ('--permission', '--experimental-permission'):
            p = subprocess.run([node, flag, f'--allow-fs-read={root}', f'--allow-fs-write={root}', dst,
                                '--data', data, '--bundle', bundle], cwd=root, capture_output=True, text=True,
                               timeout=900, env=env)
            if p.returncode != 9:  # 9 = 모르는 선택(옛 node)
                break
        if p.returncode == 0:
            break
        moved = False
        for m in set(re.findall(r"Cannot find module '([^']+)'", (p.stderr or '') + (p.stdout or ''))):
            pth = m[7:] if m.startswith('file://') else m
            if not os.path.isabs(pth) or not pth.startswith(root + os.sep) or os.path.exists(pth):
                continue
            relp = os.path.relpath(pth, root)
            src = os.path.join(ROOT, relp)
            if relp.endswith(('.mjs', '.js', '.cjs')) and os.path.isfile(src):
                os.makedirs(os.path.dirname(pth), exist_ok=True)
                shutil.copyfile(src, pth)
                copied.append(relp)
                moved = True
        if not moved:
            break
    return p, copied


def find_gates(root, gdr_out):
    p = os.path.join(os.path.dirname(gdr_out), 'gates.json')
    if os.path.isfile(p):
        return p
    for dp, _dn, fn in os.walk(root):
        if 'gates.json' in fn:
            return os.path.join(dp, 'gates.json')
    return None


def run_scenario(name, about, gen, T, keep_dir, log, want_new, mode='null'):
    node = shutil.which('node')
    pick = os.path.join(HERE, 'pick.mjs')
    if not node:
        return {'ran': False, 'ok': False, 'about': about, 'why': 'node 없음'}
    if not os.path.isfile(pick):
        return {'ran': False, 'ok': False, 'about': about, 'why': 'pick.mjs 없음'}
    root = os.path.abspath(os.path.join(keep_dir, name)) if keep_dir else tempfile.mkdtemp(prefix=f'gdr-stress-{name}-')
    if keep_dir:
        if os.path.exists(root) and os.listdir(root):
            if not os.path.isfile(os.path.join(root, '.gdr-stress')):  # 이 셈이 만든 폴더만 지움
                return {'ran': False, 'ok': False, 'about': about,
                        'why': f'--stress-dir 가 비어 있지 않고 이 셈이 만든 폴더가 아님: {root}'}
            shutil.rmtree(root)
        os.makedirs(root, exist_ok=True)
    with open(os.path.join(root, '.gdr-stress'), 'w', encoding='utf-8') as f:
        f.write('verify.py --stress 가 만든 폴더(지워도 됨)\n')
    try:
        made = gen(T)
        cos, exp = made['cos'], made['exp']
        stress_write(root, T, cos, made['etf'])
        names = {c['code']: c['name'] for c in cos}
        dst = os.path.join(root, 'scripts', 'atlas11', 'next', 'gdr', 'pick.mjs')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(pick, dst)  # 열어 보지 않고 그대로 옮김 · 아래에서 그 폴더 밖은 못 읽고 못 쓰게 돌림
        data = os.path.join(root, 'site', 'atlas', 'data')
        bundle = os.path.join(root, 'reports', 'atlas11', 'universe', 'stress', 'bundle.json.gz')
        p, copied = run_pick(node, root, dst, data, bundle)
        out = os.path.join(root, 'site', 'next', 'data', 'gdr.json')
        if p.returncode != 0 or not os.path.isfile(out):
            return {'ran': True, 'ok': False, 'about': about, 'copied': copied,
                    'why': f'만든 쪽 셈이 안 돎(코드 {p.returncode}): {(p.stderr or p.stdout)[-600:]}'}
        theirs = load_json(out)
        gp = find_gates(root, out)
        gates = load_json(gp) if gp else None
        mkt = load_json(os.path.join(data, 'mkt.json'))
        with gzip.open(bundle, 'rt', encoding='utf-8') as f:
            B = json.load(f)
        mine = recompute(mkt, B, mkt['asOf'].replace('-', ''), os.path.join(data, 'co'))
        bad_design = design_check(mine, exp, names)
        R = Report()
        need = want_new or gates is not None or any('wrong' in q for q in theirs.get('picks') or [])
        cinfo = compare(R, mine, theirs, mkt['asOf'], bundle, need_wrong=need)
        gsum = {'present': False}
        if gates is not None:
            gsum = compare_gates(R, mine, gates, theirs, mkt['asOf'], mode=mode)
            gsum['path'] = os.path.relpath(gp, root)
        elif need:
            R.add('gates.json', '있어야 함', '(없음)', 'gates', follows='neither',
                  note='만든 쪽 셈이 일부러 만든 자료에서 gates.json 을 안 냄')
        inv = invariants(mine, theirs)
        mine_inv = my_invariants(mine)
        tc = [q.get('code') for q in theirs.get('picks') or []]
        extra = [c for c in tc if c not in {p['code'] for p in mine['picks']}]
        why = {c: {'name': names.get(c), 'ind': mine['G'][c]['ind'] if c in mine['G'] else None,
                   'myFail': [k for k in GATE_NAMES if c in mine['G'] and not mine['G'][c][k]],
                   'design': exp.get(c)} for c in extra}
        branches = {}
        for pk in mine['picks']:
            branches[pk['wrongNo']] = branches.get(pk['wrongNo'], 0) + 1
        ok = (not R.mm and all(v['ok'] for v in inv.values()) and all(v['ok'] for v in mine_inv.values())
              and not bad_design)
        res = {'ran': True, 'ok': ok, 'about': about, 'companies': len(exp),
               'counts_mine': mine['counts'], 'counts_theirs': theirs.get('counts'),
               'designCheck': {'ok': not bad_design, 'bad': bad_design},
               'mismatches': R.mm, 'invariants': {k: v for k, v in inv.items() if not v['ok']},
               'invariantsMine': {k: v for k, v in mine_inv.items() if not v['ok']},
               'theirExtraPicks': why, 'gates': gsum, 'wrongBranchesMine': dict(sorted(branches.items())),
               'wrongTheirs': {q.get('code'): q.get('wrong') for q in theirs.get('picks') or []},
               'wrongNearTie': [pk['code'] for pk in mine['picks'] if pk['wrongNearTie']],
               'uncheckedCountKeys': cinfo['uncheckedCountKeys'], 'copied': copied,
               'dir': root if keep_dir else None}
        log(f"· 일부러 만든 자료 {name} {len(exp)}곳: {'✓ 맞음' if ok else '✗ 틀림 ' + str(len(R.mm))}"
            f" · 설계 뜻과 내 셈 {'맞음' if not bad_design else '틀림 ' + str(len(bad_design))}"
            f" · gates.json {'있음' if gates is not None else '없음'} · wrong 줄 {res['wrongBranchesMine']}")
        return res
    except Exception as e:  # noqa: BLE001 — 시간 넘김 · 자료 틀림 등은 실패로 적고 계속
        return {'ran': True, 'ok': False, 'about': about, 'why': f'{type(e).__name__}: {e}'}
    finally:
        if not keep_dir:
            shutil.rmtree(root, ignore_errors=True)


SCENARIOS = (
    ('A', '업종 3곳 · 36곳 한도 · 비중 3/2.5/2 · 차례 같음 · 문 경계 · 빈 날 · 2^53 넘는 합 · 먼저 뺌', stress_a),
    ('B', 'wrong-v1 다섯 줄 · 경계 · 앞선 줄 + 먼저 뺀 까닭 경계 · 셀 수 없음 · 이미 떨어짐(null 또는 0)', stress_b),
)


def run_stress(dates_src, keep_dir=None, log=print, want_new=False, mode='null'):
    T = stress_dates(dates_src)
    sc = {}
    for name, about, gen in SCENARIOS:
        sc[name] = run_scenario(name, about, gen, T, keep_dir, log, want_new, mode)
    return {'ran': all(v.get('ran') for v in sc.values()), 'ok': all(v.get('ok') for v in sc.values()), 'scenarios': sc}


# ── 기다림 ───────────────────────────────────────────────────────────────────
def wait_for(path, deadline, poll_s, log):
    last_err = None
    said = False
    while True:
        obj, err = read_json_safe(path)
        if obj is not None:
            return obj, None
        last_err = err or last_err
        if time.time() >= deadline:
            return None, last_err or '없음'
        if not said:
            log(f'· {rel(path)} 기다리는 중(남은 {int((deadline - time.time()) // 60)}분 · {int(poll_s)}초마다)')
            said = True
        time.sleep(poll_s)


def wait_new(gdr_path, gates_path, deadline, poll_s, log):
    """일꾼 E 의 새 파일: gates.json 이 있고 · gdr.json 곳마다 wrong · 두 날짜 같음 · 한 번(poll) 쉬는 동안 두 파일이 안 바뀜."""
    prev = None
    said = False
    why = None
    while True:
        cur = None
        try:
            sig = tuple((os.path.getmtime(p), os.path.getsize(p)) for p in (gdr_path, gates_path))
            g, ge = read_json_safe(gdr_path)
            t, te = read_json_safe(gates_path)
            if g is None or t is None:
                why = f'못 읽음: {ge or te}'
            elif not all(isinstance(q, dict) and 'wrong' in q for q in g.get('picks') or []):
                why = 'gdr.json 곳마다 wrong 이 아직 없음'
            elif t.get('asOf') != g.get('asOf'):
                why = 'gates.json · gdr.json 날짜가 다름'
            else:
                cur = (sig, g, t)
        except FileNotFoundError as e:
            why = f'없음: {rel(e.filename) if e.filename else e}'
        if cur is not None:
            if prev is not None and prev == cur[0]:
                return cur[1], cur[2], None
            why = '한 번 더 보고 안 바뀌면 씀'
            prev = cur[0]
        else:
            prev = None
        if time.time() >= deadline:
            if cur is not None:   # 다 나왔는데 안 바뀌는지 볼 시간이 없음 → 그대로 씀
                return cur[1], cur[2], None
            return None, None, why
        if not said:
            log(f'· 일꾼 E 의 새 파일 기다리는 중({why} · 남은 {int((deadline - time.time()) // 60)}분 · {int(poll_s)}초마다)')
            said = True
        time.sleep(poll_s)


def main():
    ap = argparse.ArgumentParser(description='고도리 gdr-v1 따로 세기(gdr.json · gates.json · wrong-v1)')
    ap.add_argument('--gdr', default=GDR_DEFAULT)
    ap.add_argument('--gates', default=GATES_DEFAULT)
    ap.add_argument('--out', default=OUT_DEFAULT)
    ap.add_argument('--bundle', default=None)
    ap.add_argument('--data', default=DATA)
    ap.add_argument('--wait-min', type=float, default=60)
    ap.add_argument('--poll', type=float, default=30)
    ap.add_argument('--no-wait', action='store_true')
    ap.add_argument('--wait-new', action='store_true',
                    help='gates.json + 곳마다 wrong 이 다 나오고 한 번(--poll) 안 바뀔 때까지 기다림(끝내 없으면 코드 2)')
    ap.add_argument('--require-new', action='store_true', help='gates.json · 곳마다 wrong 이 없으면 틀림(기다리지 않음)')
    ap.add_argument('--gate-missing', choices=GATE_MISSING_MODES, default='null',
                    help='x = 0 인데 문에 쓰는 값이 빠진 곳의 gates 값: null(처음 · 표 「null 셀 수 없음」) · zero(「없으면 탈락」을 0 으로 읽음)')
    ap.add_argument('--quiet', action='store_true')
    ap.add_argument('--stress', action='store_true', help='일부러 만든 자료 A · B 로 만든 쪽 셈을 그대로 돌려 맞대 봄')
    ap.add_argument('--stress-dir', default=None, help='--stress 자료 · 결과를 이 폴더(A · B)에 남김(지우고 새로 만듦)')
    a = ap.parse_args()
    log = (lambda *x: None) if a.quiet else (lambda *x: print(*x, flush=True))
    t0 = time.time()
    deadline = t0 + (0 if a.no_wait else a.wait_min * 60)

    mkt_path = os.path.join(a.data, 'mkt.json')
    co_dir = os.path.join(a.data, 'co')
    try:
        mkt = load_json(mkt_path)
    except Exception as e:  # noqa: BLE001
        print(f'자료 못 읽음 {mkt_path}: {e}', file=sys.stderr)
        return 3
    D = mkt.get('asOf')
    if not D or not re.match(r'^\d{4}-\d{2}-\d{2}$', D):
        print(f'mkt.json asOf 이상: {D}', file=sys.stderr)
        return 3
    D8 = D.replace('-', '')
    codes = sorted(mkt.get('companies') or {})
    bpath, B, blast, tried = find_bundle(D8, codes, a.bundle, log)
    if B is None:
        print('사이트 자료와 같은 날짜의 모음을 못 찾음:\n  ' + '\n  '.join(tried), file=sys.stderr)
        return 3
    log(f'· 자료 날짜 {D} · 모음 {rel(bpath)}(마지막 날 {blast}) · 회사 {len(codes)}')
    try:
        mine = recompute(mkt, B, D8, co_dir)
    except DataError as e:
        print(f'자료가 맞지 않음: {e}', file=sys.stderr)
        return 3
    del B
    # 달력 맞대 보기(days.json 은 만든 쪽이 쓰는 달력 — 내 달력은 모음 날짜에서)
    cal_note = None
    try:
        days = load_json(os.path.join(a.data, 'days.json'))
        dd = [d.replace('-', '') for d in days.get('dates') or []]
        cal_note = {'daysJsonLast250EqMine': dd[-250:] == mine['T'][-250:], 'daysJsonAsOf': days.get('asOf')}
    except Exception as e:  # noqa: BLE001
        cal_note = {'error': str(e)}
    log('· 내 셈 ' + json.dumps(mine['counts'], ensure_ascii=False))
    log('· 내 고른 곳 ' + ' '.join(f"{p['code']}(wrong {p['wrongNo']})" for p in mine['picks']))

    gates = gates_err = None
    new_not_ready = None
    if a.wait_new:
        theirs, gates, new_not_ready = wait_new(a.gdr, a.gates, deadline, a.poll, log)
        err = new_not_ready
        if theirs is None:   # 끝내 다 안 나옴 → 있는 것만이라도 맞대 봄
            theirs, err2 = read_json_safe(a.gdr)
            gates, gates_err = read_json_safe(a.gates)
            err = err or err2
    else:
        theirs, err = wait_for(a.gdr, deadline, a.poll, log)
        gates, gates_err = read_json_safe(a.gates)
    require_new = a.require_new or a.wait_new
    picks_have_wrong = any(isinstance(q, dict) and 'wrong' in q for q in (theirs or {}).get('picks') or [])
    new_mode = require_new or gates is not None or gates_err is not None or picks_have_wrong

    R = Report()
    inv = {}
    cinfo = {'uncheckedCountKeys': []}
    if theirs is not None:
        cinfo = compare(R, mine, theirs, D, bpath, need_wrong=new_mode)
        inv = invariants(mine, theirs)
    gsum = {'present': False}
    if gates is not None:
        gsum = compare_gates(R, mine, gates, theirs, D, mode=a.gate_missing)
    elif gates_err is not None:
        R.add('gates.json', '읽을 수 있는 파일', f'못 읽음: {gates_err}', 'gates', follows='neither')
    elif new_mode:
        R.add('gates.json', '있어야 함', '(없음)', 'gates', follows='neither',
              note='gdr.json 에 wrong 이 있거나 --require-new · --wait-new 인데 gates.json 이 없음')
    gsum['path'] = rel(a.gates)
    gsum['checked'] = gates is not None
    gsum['missingMode'] = a.gate_missing
    mine_inv = my_invariants(mine)
    stress = (run_stress(os.path.join(a.data, 'days.json'), a.stress_dir, log, want_new=new_mode, mode=a.gate_missing)
              if (a.stress or a.stress_dir) else None)

    ok = theirs is not None and not R.mm and all(v['ok'] for v in inv.values()) and all(v['ok'] for v in mine_inv.values())
    ok = ok and (stress is None or stress.get('ok')) and not (a.wait_new and new_not_ready)
    now = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    G = mine['G']
    tby = {q.get('code'): q for q in (theirs or {}).get('picks') or [] if isinstance(q, dict)}
    pick_path = os.path.join(HERE, 'pick.mjs')
    rep = {
        'schema': 'godori-verify-2',
        'at': now,
        'asOf': D,
        'version': VERSION,
        'ok': ok,
        'mismatches': R.mm,
        'invariants': inv,
        'invariantsMine': mine_inv,
        'counts_mine': mine['counts'],
        'counts_theirs': (theirs or {}).get('counts'),
        'uncheckedCountKeys': cinfo['uncheckedCountKeys'],
        'picks_mine': [{
            'no': p['no'], 'code': p['code'], 'name': p['name'], 'ind': p['ind'], 'w': p['w'], 'amt': p['amt'],
            'price': p['price'], 'sell': p['sell'], 'half': p['half'], 'saying': p['saying'], 'reason': p['reason'],
            'wrong': p['wrong'], 'wrongNo': p['wrongNo'],
            'g': {k: (ff(v, 2) if k in PCT_KEYS else ff(v, 4) if k in RATIO_KEYS else ff(v, 0) if k == 'tv20' else ff(v))
                  for k, v in p['g'].items()},
        } for p in mine['picks']],
        'picks_theirs': [q.get('code') for q in (theirs or {}).get('picks') or []],
        'wrong': [{'no': p['no'], 'code': p['code'], 'line': p['wrongNo'], 'why': p['wrongWhy'], 'mine': p['wrong'],
                   'accepted': p['wrongOk'], 'theirs': (tby.get(p['code']) or {}).get('wrong'),
                   'ok': (tby.get(p['code']) or {}).get('wrong') in p['wrongOk'], 'nearTie': p['wrongNearTie']}
                  for p in mine['picks']],
        'gates': gsum,
        'passAll_mine': [{'code': c, 'name': mkt['companies'][c].get('n'), 'ind': G[c]['ind'],
                          'opPrev': G[c]['opPrev'], 'opLast': G[c]['opLast'], 'r60': ff(G[c]['r60'], 2)}
                         for c in mine['ranked']],
        'inputs': {
            'mkt': {'path': rel(mkt_path), 'asOf': D, 'sha256': sha256(mkt_path)},
            'bundle': {'path': rel(bpath), 'lastDate': blast, 'sha256': sha256(bpath), 'tried': tried},
            'co': rel(co_dir),
            'gdr': {'path': rel(a.gdr), 'made': (theirs or {}).get('made'),
                    'sha256': sha256(a.gdr) if theirs is not None else None, 'error': err},
            'gates': {'path': rel(a.gates), 'sha256': sha256(a.gates) if gates is not None else None, 'error': gates_err,
                      'waitNew': a.wait_new, 'notReady': new_not_ready},
            'pickSha256': sha256(pick_path) if os.path.isfile(pick_path) else None,
        },
        'calendar': {'source': '모음 회사 일봉 날짜 모두(D 까지)', 'len': len(mine['T']),
                     'last250': mine['diag']['calendarLast250'], **(cal_note or {})},
        'readings': READINGS,
        'diag': {
            'listedFromLists': mine['diag']['listedFromLists'],
            'listedFromStocks': mine['diag']['listedFromStocks'],
            'notInBundle': mine['diag']['notInBundle'],
            'rowsAfterAsOfDropped': mine['diag']['rowsAfterAsOfDropped'],
            'passAllWithOpPrevLE0': mine['diag']['passAllOpPrevLE0'],
            'opGrowReadingChangesPicks': mine['diag']['opGrowReadingChangesPicks'],
            'opGrowLiteralPicks': mine['diag']['opGrowLiteralPicks'],
            'outThinQ_codes': sorted(c for c, v in mine['excl'].items() if v == 'X1?'),
            'outHalt_codes': sorted(c for c, v in mine['excl'].items() if v == 'X2'),
            'industriesPassG5': sorted(i for i, v in mine['IND'].items() if v['pass']),
            'gateNullAfterOut': mine['diag']['gateNullR1'],
            'gateNullOrZero': {k: {'n': len(v), 'codes': v[:30]} for k, v in mine['diag']['gateNullOrZero'].items()},
            'wrongNearTie': [p['code'] for p in mine['picks'] if p['wrongNearTie']],
        },
        'compareMode': {
            'counts': '표 칸 · gdr-data 에 적은 칸 모두 값 그대로(정수) · 그 밖에 더 있는 칸은 uncheckedCountKeys 에만',
            'picks': '고른 곳 번호 차례 그대로 · 칸마다(no · w · price · sell · half · ind · saying · name · reason · wrong)',
            'g': 'opPrev · opLast 정수 그대로 · tv20 은 정수면 내 값을 정수로 반올림한 값과 그대로 · 나머지는 gdr-data §4 자리(퍼센트 둘째 · 비 넷째)로 반올림한 내 값(짝수 쪽 · 위쪽 · 소수 곱 꼴) 또는 반올림 안 한 내 값과 1e-6 상대 차 안',
            'reason': '표 꼴 그대로 · 소수 한 자리는 정확한 값 짝수 쪽 반올림 또는 소수(float) format',
            'wrong': 'wrong-v1 글 그대로 · 줄 고르기는 정확한 값(경계 정확히) · 숫자는 정확한 값 짝수 쪽(= 파이썬 format) 또는 format(float(정확한 값)) · 딱 반(1e-12 안)이면 두 이웃',
            'gates': 'schema · version · asOf · keys · rules(있으면) 그대로 · 회사 주식 모두 · 줄마다 [x, g1 … g5] 를 정수 · null 그대로 · 값이 빠진 칸은 --gate-missing(처음 null · 이미 못 지남이 정해진 칸은 null 또는 0 · 한 문 안에서 한 가지) · gates.json 으로 센 수 = gdr.json counts · 고른 곳 = [0,1,1,1,1,1]',
        },
        'stress': stress,
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump(jsonable(rep), f, ensure_ascii=False, indent=1)
        f.write('\n')

    if theirs is None:
        log(f'✗ gdr.json 없음 · 못 읽음: {err} → {rel(a.out)}')
        return 2
    if a.wait_new and new_not_ready:
        log(f'✗ 일꾼 E 의 새 파일이 다 안 나옴: {new_not_ready} → {rel(a.out)}')
        return 2
    bad_inv = [k for k, v in inv.items() if not v['ok']] + ['내 셈 ' + k for k, v in mine_inv.items() if not v['ok']]
    gtxt = (f" · gates.json {gsum.get('n')}곳({a.gate_missing}) 틀림 {gsum.get('mismatchN')} · 이미 떨어짐 읽기(null/0) "
            + json.dumps(gsum.get('nullOrZeroReading'), ensure_ascii=False)) if gates is not None else ' · gates.json 없음(건너뜀)'
    log(f"{'✓ ok' if ok else '✗ 틀림'} · 틀림 {len(R.mm)} · 불변식 어긋남 {len(bad_inv)}{gtxt} → {rel(a.out)}")
    for e in R.mm[:40]:
        log(f"  - {e['where']}: 내 셈 {json.dumps(jsonable(e['mine']), ensure_ascii=False)[:200]} · 만든 쪽 {json.dumps(jsonable(e['theirs']), ensure_ascii=False)[:200]}")
    for k in bad_inv:
        log(f'  - 불변식 {k}')
    if stress and not stress.get('ok'):
        for nm, sc in (stress.get('scenarios') or {}).items():
            if sc.get('ok'):
                continue
            log(f"  - 일부러 만든 자료 {nm}: {sc.get('why') or ''}")
            for e in (sc.get('mismatches') or [])[:15]:
                log(f"    · {e['where']}: 내 셈 {json.dumps(jsonable(e['mine']), ensure_ascii=False)[:160]} · 만든 쪽 {json.dumps(jsonable(e['theirs']), ensure_ascii=False)[:160]}")
            for c, w in (sc.get('theirExtraPicks') or {}).items():
                log(f"    · 만든 쪽만 고른 {c} {w['name']}: 내 셈 탈락 {w['myFail']} · 설계 뜻 {w['design']}")
            for b in (sc.get('designCheck') or {}).get('bad') or []:
                log(f"    · 설계 뜻과 내 셈 다름 {b['code']} {b['name']}: {b['prob']}")
            for k in list((sc.get('invariants') or {})) + ['내 셈 ' + k for k in (sc.get('invariantsMine') or {})]:
                log(f'    · 불변식 {k}')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
