#!/usr/bin/env python3
"""봉인(타임캡슐) — 사장님 2026-10-11 14:37 · 14:39 「자 구글팀 애플팀 그리고 클로드 팀은 아틀라세에서 잘한것 180개를 찾는다 그래서 더 개선하고
현재에 집중하며 과거도 존중하며 3년후 5년후 10년후에 이야기를 담에내는 섹시한 묘미를 담은 아틀란스를 한층 업그래이드하라 과감하게 하라」

앞날 값은 그리지 않는다(규칙 49 · 금지 말 「예측」). 대신 고른 날의 365곳 · 후보 모두를 그날 종가 그대로 잠그고,
3년 · 5년 · 10년 뒤 같은 날(장이 쉬면 그 뒤 첫 거래일) 종가로 다시 연다. 셈 규칙도 지금 함께 적어 잠근다 — 결과를 보고 규칙을 바꾸지 못하게
(기준을 셈 전에 적어 둔 커밋과 같은 뜻). 봉인 번호 = 잠근 내용(날 · 규칙 · 회사 · 종가)의 sha256 — 한 글자만 바뀌어도 번호가 달라짐.
봉인 1호(2026-10-11)는 그때 골라 낸 목록(옛 36곳)도 함께 잠갔음 — 그 파일 · 번호는 그대로 두고, 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」로
새 봉인에는 그 목록을 넣지 않음 · 화면은 그 목록 셈 · 줄을 보이지 않음(site_build.py ⑥).

쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/capsule.py --id 1
  → reports/atlas11/t365/capsule/capsule-1.json(새 파일만 · 있으면 멈춤 — 봉인은 고치지 않는다 · 바꾸려면 새 번호)
재료: universe.json 의 지금 판(proposal.json 365곳 + 밖 = 후보 모두) · 모음(bundle.json.gz) 네이버 일봉의 고른 날 종가
"""
import argparse, gzip, hashlib, json, os, sys
from datetime import date, datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
CAP_DIR = os.path.join(ROOT, 'reports', 'atlas11', 't365', 'capsule')
SAID = '사장님 2026-10-11 14:37 · 14:39 「… 현재에 집중하며 과거도 존중하며 3년후 5년후 10년후에 이야기를 담에내는 섹시한 묘미를 담은 아틀란스를 한층 업그래이드하라 과감하게 하라」'
YEARS = (3, 5, 10)


def plus_years(d, n):
    """같은 달 · 같은 날(2월 29일이면 2월 28일)"""
    try:
        return d.replace(year=d.year + n)
    except ValueError:
        return d.replace(year=d.year + n, day=28)


def rules_text(seal, opens):
    k = lambda s: '%d년 %d월 %d일' % tuple(int(x) for x in s.split('-'))
    return [
        '다시 여는 날: 봉인 날(%s)로부터 %s — 그날 장이 쉬면 그 뒤 첫 거래일 종가' % (k(seal), ' · '.join('%d년 뒤 %s' % (o['y'], k(o['date'])) for o in opens)),
        '셈: 회사마다 그날 종가 ÷ 봉인 날 종가 — 같은 돈을 나눠 사서 그대로 둔 것처럼 평균(365곳 · 후보 모두를 따로)',
        '견줌: 365곳 ↔ 후보 모두(고르기 전 바탕) — 「골라서 나았나」만 셈',
        '값이 없는 곳(상장폐지 · 합병 · 거래정지 등)은 「?」로 따로 세고, 값 있는 곳 평균과 「없는 곳을 0원으로 친 평균(가장 나쁘게)」을 함께 적음',
        '배당은 넣지 않음(주가만) · 하루 30% 넘게 바뀐 날(주식 수가 바뀌었을 수 있음)이 있으면 「?」',
        '봉인 뒤 지금까지: 같은 셈을 그날까지 마지막 종가로 회차마다(하루 4번) 다시 함 — 그날 값이 없으면 그 앞 값',
        '이 규칙은 봉인과 함께 잠금 — 바꾸려면 새 봉인(다음 번호)을 만들고 이 봉인은 그대로 둠',
    ]


def digest_of(cap):
    """봉인 번호 — 잠근 내용을 열쇠 차례 · 빈칸 없는 JSON 글(UTF-8)로 바꿔 sha256(노드 site_verify.mjs 가 같은 글로 따로 셈)"""
    body = {k: cap[k] for k in ('id', 'seal', 'version', 'opens', 'rules', 'members', 'picks36', 'pool') if k in cap}  # picks36 = 봉인 1호에만(그때 잠근 그대로)
    return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', type=int, required=True)
    a = ap.parse_args()
    act = json.load(open(os.path.join(HERE, 'universe.json'), encoding='utf-8'))
    pro = json.load(open(os.path.join(ROOT, act['dir'], 'proposal.json'), encoding='utf-8'))
    seal = act['asOf']
    if pro.get('asOf', seal) != seal:
        sys.exit('capsule: 고른 날이 서로 다름 — universe %s · proposal %s' % (seal, pro.get('asOf')))
    bnd = json.load(gzip.open(os.path.join(ROOT, act['bundle']), 'rt', encoding='utf-8'))
    s8 = seal.replace('-', '')

    num = lambda x: int(x) if x is not None and float(x).is_integer() else x  # 5480.0 → 5480 — 노드(site_verify.mjs)도 같은 글로 봉인 번호를 다시 셈

    def close(c):
        for r in (((bnd['stocks'].get(c) or {}).get('fchart') or {}).get('rows') or []):
            if r[0] == s8 and r[4] and r[4] > 0:
                return num(r[4])
        return None

    members = [[p['code'], p['name'], close(p['code'])] for p in pro['picked']]
    if any(m[2] is None for m in members):
        sys.exit('capsule: 봉인 날 종가가 없는 365곳 회사: %s' % [m[0] for m in members if m[2] is None])
    pool = [[x['code'], close(x['code'])] for x in pro['picked'] + pro['outside']]
    d0 = date.fromisoformat(seal)
    opens = [{'y': y, 'date': plus_years(d0, y).isoformat()} for y in YEARS]
    cap = {'schema': 'atlas-t365-capsule-1', 'id': a.id, 'seal': seal, 'version': act['version'],
           'sealedAt': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'said': SAID,
           'source': '종가 = %s(네이버 일봉) · 365곳 · 후보 = %s/proposal.json' % (act['bundle'], act['dir']),
           'opens': opens, 'rules': rules_text(seal, opens), 'members': members, 'pool': pool}
    cap['digest'] = digest_of(cap)
    os.makedirs(CAP_DIR, exist_ok=True)
    path = os.path.join(CAP_DIR, 'capsule-%d.json' % a.id)
    with open(path, 'x', encoding='utf-8') as f:  # 새 파일만 — 봉인은 고치지 않는다
        json.dump(cap, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(json.dumps({'file': os.path.relpath(path, ROOT), 'seal': seal, 'members': len(members), 'pool': len(pool),
                      'poolNoClose': sum(1 for p in pool if p[1] is None), 'opens': opens, 'digest': cap['digest']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
