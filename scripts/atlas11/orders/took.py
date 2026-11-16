#!/usr/bin/env python3
"""주문마다 걸린 시간 — 주문 때(at)부터 장부에 처음 「성공」이 적힌 때까지(분)
사장님 2026-11-16(마카오) 16:06 「작업 속도를 3배 빠르게 해봐 싸이트 개선하는 속도를」 — 정말 세 배 빨라졌는지 숫자로 보이게
  · 성공 때 = 장부(reports/atlas11/orders/ledger.json) 깃 기록에서 그 주문이 처음 「성공」인 커밋의 때(손으로 고친 때가 아님)
  · 셈 = 성공한 주문마다 took(분) · 맨 위 took 칸에 바탕(이 날 앞 성공 스무 건의 가운데 값 · 평균)과 그 뒤(가운데 값 · 평균 · 몇 배)
  · 쓰는 법: python3 scripts/atlas11/orders/took.py [--since 2026-11-16T17:06+09:00] [--write]  (--write 가 없으면 보이기만)"""
import json, statistics, subprocess, sys
from datetime import datetime

P = 'reports/atlas11/orders/ledger.json'
SINCE = '2026-11-16T17:06+09:00'   # 세 배 말씀(마카오 16:06 = 서울 17:06) — 이 뒤에 들어온 주문이 「그 뒤」


def arg(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


def first_success():
    """주문 번호 → 장부에 처음 「성공」이 적힌 커밋 때(ISO)"""
    log = subprocess.run(['git', 'log', '--format=%H %cI', '--reverse', '--', P], capture_output=True, text=True, check=True).stdout
    out = {}
    for line in log.splitlines():
        if not line.strip():
            continue
        sha, t = line.split(' ', 1)
        show = subprocess.run(['git', 'show', sha + ':' + P], capture_output=True, text=True)
        try:
            L = json.loads(show.stdout)
        except ValueError:
            continue
        for o in L.get('orders', []):
            if o.get('state') == '성공' and o.get('id') not in out:
                out[o['id']] = t
    return out


def mins(a, b):
    return round((datetime.fromisoformat(b) - datetime.fromisoformat(a)).total_seconds() / 60)


def main():
    since = arg('--since', SINCE)
    L = json.load(open(P, encoding='utf-8'))
    fs = first_success()
    rows = []
    for o in L['orders']:
        if o.get('state') == '성공' and o['id'] in fs:
            t = mins(o['at'], fs[o['id']])
            if t >= 0:
                o['took'] = t
                rows.append((o['at'], o['id'], t))
    rows.sort()
    sp = datetime.fromisoformat(since)
    before = [t for at, _, t in rows if datetime.fromisoformat(at) < sp][-20:]
    after = [t for at, _, t in rows if datetime.fromisoformat(at) >= sp]
    med = lambda v: round(statistics.median(v)) if v else None
    avg = lambda v: round(sum(v) / len(v)) if v else None
    T = {'why': '주문 때부터 장부에 처음 성공이 적힌 때까지 걸린 분 — 사장님 2026-11-16(마카오) 16:06 「작업 속도를 3배 빠르게 해봐」',
         'since': since, 'base': {'n': len(before), 'median': med(before), 'mean': avg(before)},
         'goal': round(med(before) / 3) if before else None,
         'after': {'n': len(after), 'median': med(after), 'mean': avg(after)},
         'times': round(med(before) / med(after), 1) if before and after and med(after) else None,
         'src': 'scripts/atlas11/orders/took.py'}
    L['took'] = T
    print(json.dumps(T, ensure_ascii=False))
    for at, i, t in rows[-8:]:
        print(i, t, '분')
    if '--write' in sys.argv:
        open(P, 'w', encoding='utf-8').write(json.dumps(L, ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__':
    main()
