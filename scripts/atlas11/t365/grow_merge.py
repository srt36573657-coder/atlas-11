#!/usr/bin/env python3
"""회사 성장 이야기 — 애플팀 조사 + 클로드팀 판정을 기록 파일 하나로 묶음(새 파일만 · 봉인하지 않음).
사장님 2026-10-11 16:51 「… 경쟁 회사가 어떻게 되고 있는데 … 독점 회사면 독보적으로 … 경쟁이 많아가지고 좀 그럴 것이다 … 상식적인 얘기로 미래 추론을 해라 …
주가를 … 하라는 얘기가 아니라 회사의 성장을 얘기 하란 얘기야 … 너무 보수적으로도 하지 말고 너무 긍정적으로 … 담백하게」 · 16:56 「3번」(365곳 모두) · 16:57 「이건 봉인하지마」

쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/grow_merge.py <조사 폴더(out/apple-*.json · out/claude-*.json)> [나갈 파일]
  나갈 파일을 안 주면 reports/atlas11/t365/grow/stories-<UTC 때>.json(이미 있으면 멈춤 — 기록은 덮지 않음)
지킴(하나라도 걸리면 멈춤 — 고친 뒤 다시):
  · 판정마다 같은 회사의 조사가 있음 · 1 · 3 · 5 · 10년마다 lo ≤ mid ≤ hi · 0 < lo · hi < 30(배) 이거나 셋 다 null
  · 글 칸에 사이트 금지 말 · 주가 · 목표 주가 · 「유망」 · 「대박」이 없음 · 근거 주소는 http(s) 로 시작
화면은 이 파일을 읽기만 함(site_build.py ⑤ — 회사마다 가장 새 파일의 이야기).
"""
import glob, json, os, re, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률',
          '주가', '목표 주가', '유망', '대박']
HS = ('1', '3', '5', '10')
TEXT_KEYS_R = ('sells', 'shape', 'why_pick', 'market', 'events', 'unknown')


def die(m):
    sys.exit('grow_merge: ' + m)


def texts(o):
    """글 칸을 모두 뽑음(주소 · 날짜 · 코드는 뺌)"""
    if isinstance(o, str):
        yield o
    elif isinstance(o, list):
        for x in o:
            yield from texts(x)
    elif isinstance(o, dict):
        for k, v in o.items():
            if k in ('url', 'date', 'code', 'made', 'batch', 'team'):
                continue
            yield from texts(v)


def check_words(where, o):
    for t in texts(o):
        for w in BANNED:
            if w in t:
                die('%s 에 금지 말 「%s」: %s' % (where, w, t[:60]))


def merge(src):
    research = {}
    for f in sorted(glob.glob(os.path.join(src, 'apple-*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        for c in d['companies']:
            research[c['code']] = dict(c, batch=d['batch'])  # 같은 회사를 다시 조사했으면 뒤 파일(이름 차례)이 이김
    out = {}
    for f in sorted(glob.glob(os.path.join(src, 'claude-*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        for j in d['companies']:
            code = j['code']
            r = research.get(code)
            if not r:
                die('%s 판정에 조사가 없음' % code)
            for h in HS:
                x = (j.get('h') or {}).get(h)
                if not x:
                    die('%s %s년 칸이 없음' % (code, h))
                lo, mid, hi = x.get('lo'), x.get('mid'), x.get('hi')
                if lo is None and mid is None and hi is None:
                    continue
                if None in (lo, mid, hi) or not (0 < lo <= mid <= hi < 30):
                    die('%s %s년 범위가 이상함 %s' % (code, h, (lo, mid, hi)))
            for fct in r.get('facts') or []:
                if not str(fct.get('url', '')).startswith(('http://', 'https://')):
                    die('%s 근거 주소가 http 가 아님: %s' % (code, fct.get('url')))
            for rv in r.get('rivals') or []:
                if rv.get('url') and not str(rv['url']).startswith(('http://', 'https://')):
                    die('%s 경쟁 회사 주소가 http 가 아님: %s' % (code, rv['url']))
            check_words(code + ' 판정', j)
            check_words(code + ' 조사', {k: r.get(k) for k in TEXT_KEYS_R + ('rivals', 'facts')})
            out[code] = {'name': j.get('name') or r.get('name'), 'judgeBatch': d['batch'], 'researchBatch': r['batch'],
                         'judge': {k: j.get(k) for k in ('shape', 'h', 'brk', 'teams', 'keep')},
                         'research': {k: r.get(k) for k in TEXT_KEYS_R + ('rivals', 'facts')},
                         'webFacts': len(r.get('facts') or [])}
    return out


if __name__ == '__main__':
    if len(sys.argv) not in (2, 3):
        die('쓰는 법 python3 scripts/atlas11/t365/grow_merge.py <조사 폴더> [나갈 파일]')
    src = sys.argv[1]
    now = datetime.now(timezone.utc)
    dst = sys.argv[2] if len(sys.argv) == 3 else os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow', 'stories-%s.json' % now.strftime('%Y%m%dT%H%MZ'))
    if os.path.exists(dst):
        die('이미 있는 기록 파일 — 덮지 않음: ' + dst)
    cos = merge(src)
    rec = {'schema': 'atlas-new-grow-stories-1', 'made': now.isoformat(timespec='seconds'), 'sealed': False,
           'why': '사장님 2026-10-11 16:51 회사 성장 이야기 · 16:56 「3번」 365곳 모두 · 16:57 「이건 봉인하지마」 — 새 소식이 나오면 새 파일로 고쳐 씀',
           'teams': {'google': '숫자 — 결산 · 2026E 증권사 평균치 · 우리나라 상장 같은 업종 안 크기(grow.py)',
                     'apple': '제품 · 손님 · 경쟁 회사 · 기사 근거(웹)', 'claude': '반대편 먼저 · 판의 모양 · 1 · 3 · 5 · 10년 매출 배수 범위(2025년 = 1)'},
           'basis': ['Chan · Karceski · Lakonishok 2003 Journal of Finance(NBER w8282) — 빠른 성장은 우연보다 오래 가지 않음 · 증권사 장기 성장 짐작은 좋게 기움 https://nber.org/papers/w8282',
                     'Fama · French 2000 Journal of Business — 경쟁 판에서 이익은 평균으로 돌아옴(해마다 약 38%) https://ideas.repec.org/a/ucp/jnlbus/v73y2000i2p161-75.html'],
           'n': len(cos), 'companies': cos}
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('grow_merge: %d곳 → %s' % (len(cos), os.path.relpath(dst, ROOT)))
