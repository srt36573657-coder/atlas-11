#!/usr/bin/env python3
"""회사 성장 이야기 — 「따로 다시 확인」 기록(새 파일만).
사장님 2026-10-11 17:56 「예약」 4차 「판정을 쓰지 않은 다른 에이전트가 사실 표본(근거 주소가 정말 그 말을 하는지)을 따로 다시 확인합니다」
  표본(sample.json — 기사 사실 · 업종 고르게 · 정해진 씨앗) + 확인 결과(check-v*.json · 맞음 / 일부만 맞음 / 틀림 / 못 엶)
  + 「기사로 못 봄」 경쟁 회사 표본(rivals.json) + 확인 결과(check-rivals.json · 기사로 확인 / 다른 일을 함 / 확인 못 함)
  → reports/atlas11/t365/grow/check-<UTC>.json · 화면(시간 화면 요약)은 가장 새 파일의 수만 읽음(site_build ⑤-1)
쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/grow_check.py <표본 폴더(sample.json · rivals.json · out/check-*.json)> [나갈 파일]
"""
import glob, json, os, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FACT = ('맞음', '일부만 맞음', '틀림', '못 엶')
RIV = ('기사로 확인', '다른 일을 함', '확인 못 함')


def die(m):
    sys.exit('grow_check: ' + m)


def build(src):
    sample = json.load(open(os.path.join(src, 'sample.json'), encoding='utf-8'))
    got = {}
    for f in sorted(glob.glob(os.path.join(src, 'out', 'check-v*.json'))):
        for x in json.load(open(f, encoding='utf-8'))['items']:
            got[x['id']] = x
    facts = []
    for s in sample:
        x = got.get(s['id'])
        if not x:
            die('확인 결과가 없는 사실 %s' % s['id'])
        if x['verdict'] not in FACT:
            die('모르는 판정 %s %s' % (s['id'], x['verdict']))
        facts.append(dict(s, verdict=x['verdict'], why=x.get('why', ''), seen=x.get('seen', '')))
    rivals = []
    rp = os.path.join(src, 'rivals.json')
    if os.path.exists(rp):
        rs = json.load(open(rp, encoding='utf-8'))
        rg = {x['id']: x for x in json.load(open(os.path.join(src, 'out', 'check-rivals.json'), encoding='utf-8'))['items']}
        for s in rs:
            x = rg.get(s['id'])
            if not x or x['verdict'] not in RIV:
                die('경쟁 회사 확인 결과가 없거나 모르는 판정 %s' % s['id'])
            rivals.append(dict(s, verdict=x['verdict'], why=x.get('why', ''), url=x.get('url', '')))
    return facts, rivals


if __name__ == '__main__':
    if len(sys.argv) not in (2, 3):
        die('쓰는 법 python3 scripts/atlas11/t365/grow_check.py <표본 폴더> [나갈 파일]')
    now = datetime.now(timezone.utc)
    dst = sys.argv[2] if len(sys.argv) == 3 else os.path.join(ROOT, 'reports', 'atlas11', 't365', 'grow', 'check-%s.json' % now.strftime('%Y%m%dT%H%MZ'))
    if os.path.exists(dst):
        die('이미 있는 기록 파일 — 덮지 않음: ' + dst)
    facts, rivals = build(sys.argv[1])
    rec = {'schema': 'atlas-new-grow-check-1', 'made': now.isoformat(timespec='seconds'),
           'why': '사장님 2026-10-11 17:56 「예약」 4차 — 판정을 쓰지 않은 다른 에이전트가 근거 기사를 직접 열어 그 말을 하는지 확인',
           'facts': {'n': len(facts), **{v: sum(1 for f in facts if f['verdict'] == v) for v in FACT}, 'items': facts},
           'rivals': {'n': len(rivals), **{v: sum(1 for r in rivals if r['verdict'] == v) for v in RIV}, 'items': rivals}}
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('grow_check: 사실 %d개(%s) · 경쟁 회사 %d개(%s) → %s' % (len(facts), ' · '.join('%s %d' % (v, rec['facts'][v]) for v in FACT),
                                                       len(rivals), ' · '.join('%s %d' % (v, rec['rivals'][v]) for v in RIV), os.path.relpath(dst, ROOT)))
