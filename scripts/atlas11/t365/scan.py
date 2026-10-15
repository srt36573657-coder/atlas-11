#!/usr/bin/env python3
"""새 ATLAS 조건 찾기 자료(scan.json · sc-v1) — 사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」(업데이트 탭 자리)
  모든 회사(mkt.json 회사 주식 모두)마다 화면이 바로 거를 수 있는 칸만 한 파일로 — 화면이 회사 파일 2,557개를 다 읽지 않게
  재료 = 같은 자료 폴더의 사이트 자료(site_build.py 가 만든 것 — 새로 받지 않음 · 앞날 값 없음):
    몸값 k(억 원) · 1년 등락 y(%) · 3해 순이익이 0보다 큰 해 수 e(0 ~ 3 · 셀 해가 3이 아니면 null) · 마지막 해 ROE r · 마지막 해 빚 비율 d · PER pe · PBR pb
    고른 곳(멍거 · 린치)은 comp.json 의 c 칸(몸값 · 1년 · PER) · 나머지는 co/<번호>.json 의 c 칸 · 성적표(fin)와 PBR 은 co/<번호>.json(고른 곳도)
  쓰는 법: python3 scripts/atlas11/t365/scan.py <자료 폴더>   (따로 세기 scripts/atlas11/t365/scan_verify.mjs)
"""
import json, os, sys

D = sys.argv[1]
J = lambda f: json.load(open(os.path.join(D, f), encoding='utf-8'))
mkt, comp = J('mkt.json'), J('comp.json')['companies']
FIELDS = ['k', 'y', 'e', 'r', 'd', 'pe', 'pb']


def num(x):
    return x if isinstance(x, (int, float)) and not isinstance(x, bool) and x == x else None


rows = {}
for c in mkt['companies']:
    co = json.load(open(os.path.join(D, 'co', c + '.json'), encoding='utf-8'))
    cc = comp.get(c) or co.get('c') or {}
    fin = co.get('fin') or {}
    net = fin.get('net') or []
    e = sum(1 for x in net if num(x) is not None and x > 0) if len(net) == 3 and all(num(x) is not None for x in net) else None
    last = lambda k: (fin.get(k) or [None])[-1] if fin.get(k) else None
    rows[c] = [num(cc.get('cap')), num(cc.get('r1y')), e, num(last('roe')), num(last('debt')), num(co.get('per') if co.get('per') is not None else cc.get('per')), num(co.get('pbr'))]
out = {'schema': 'atlas-new-scan-1', 'version': 'sc-v1', 'asOf': mkt['asOf'], 'base': mkt['base'], 'n': len(rows), 'fields': FIELDS, 'rows': rows}
with open(os.path.join(D, 'scan.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
print(json.dumps({'n': len(rows), 'bytes': os.path.getsize(os.path.join(D, 'scan.json')), 'noCap': sum(1 for r in rows.values() if r[0] is None)}))
