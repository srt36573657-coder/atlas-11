"""새 ATLAS 바탕 365곳(t365-v1) ③ 기록 — 쓰는 법: python3 scripts/atlas11/t365/record.py <고르기 결과 json> <기록 폴더>
   proposal.json(기준 · 숫자 · 365곳과 까닭 한 줄) · list.csv — 고르기만 기록(사이트 · 지금 365곳은 바꾸지 않음 · 사장님 확인 뒤 적용)"""
import json, sys, os, csv
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from rules import THEMES27, FIN, ORDER
P = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
def won(v):
    if v is None: return '없음'
    a = abs(v); s = '−' if v < 0 else ''
    return f"{s}{a/1e4:.1f}조 원" if a >= 1e4 else f"{s}{a:,.0f}억 원"
def why(x):
    item = '순이익' if (x['sector'] or '').replace(' ', '') in FIN else '영업이익'
    g = f"{item} {won(x['gA'])} → {won(x['gB'])}" + ('(다음 해 예상)' if x['growthBy'] == 'e' else '(지난 두 해)')
    parts = []
    if x['t26']: parts.append(f"2026 흐름: 1년 {x['r1y']*100:+.0f}% · {g}")
    if x['t27']: parts.append(f"2027 흐름: {x['theme']} 업종" + ('' if x['t26'] else f" · {g}"))
    return ' | '.join(parts)
rows = [{'rank': i + 1, 'code': x['code'], 'name': x['name'], 'market': x['market'], 'sector': x['sector'], 'capEok': x['capEok'], 'r1y': round(x['r1y'], 4) if x['r1y'] is not None else None,
         't26': x['t26'], 't27': x['t27'], 'theme': x['theme'], 'growthBy': x['growthBy'], 'from': x['gA'], 'to': x['gB'], 'why': why(x)} for i, x in enumerate(P['picked'])]
rules = {
 'version': 't365-v1', 'label': '새 ATLAS 바탕 365곳 — 대표 우량주 가운데 2026 · 2027 흐름',
 'said': '사장님 2026-10-10 23:18(서울) 「우리나라 대표 우량주365개를 아틀라스에 기본 데이타로 한다 그런데 그365개는 2026는 트랜드 주식과 2027년 트랜드가 될 주식만 어떤 기준을 세워 먼저 축출부터 한다 이것부터해」',
 'data': f"코스피 · 코스닥 시가총액 목록 · 결산 · 일봉 모음(reports/atlas11/universe/2026-10-05-0940/bundle.json.gz · 모은 때 {P['collectedAt']}) · 주가는 {P['asOf']} 종가까지",
 'gate': ['보통주(우선주 · 스팩 · 리츠 · ETF · ETN 빼고)', '시가총액 1,000억 원 이상', '주가 기록 260거래일(1년) 이상', '하루 거래대금 3억 원 이상(최근 60거래일 평균)',
          '마지막 결산 흑자 — 영업이익 · 순이익 모두(금융은 순이익만)', '부채비율 200% 이하 — 금융(예금 · 보험금) · 조선 · 방산(미리 받은 돈)은 빚이 크게 잡히는 구조라 빼고 봄'],
 'trend26': '지난 1년(252거래일) 주가 +20% 이상 그리고 이익이 늘어남',
 'trend27': '2027 흐름 업종(정부 2027년 예산안 · 2026년 9월 수출 증가로 확인한 10가지)에 들고 이익이 늘어남',
 'growth': '이익이 늘어남 = 다음 해 예상(증권사 예상치)이 마지막 확정 해보다 큼 · 예상치가 없으면 마지막 확정 해가 그 앞 해보다 큼 · 금융은 순이익 · 그 밖은 영업이익',
 'order': '두 흐름 모두 든 곳 → 한 흐름에만 든 곳 · 각각 시가총액 큰 순 → 365곳',
 'themes': [{'theme': t, 'sectors': ss, 'evidence': ev} for t, (ss, ev) in THEMES27.items()],
 'sources': ['정부 2027년 예산안(2026-09-01 국무회의 · 정책브리핑) — https://www.tossbank.com/articles/2027budget',
             '산업통상부 2027년 예산안 — https://biz.sbs.co.kr/amp/article/20000331968',
             '산업통상부 「2026년 9월 수출입 동향」(2026-10-01) — https://news.mtn.co.kr/news-detail/2026100111035751735'],
 'limits': ['위험 공시(관리종목 · 거래정지 등)는 이 모음에 없어 거르지 못함 — 다음 단계', '2027년 예상 이익은 이 모음에 없음(2026년까지) — 2027 흐름은 업종 근거 + 이익 기세로만',
            '업종을 흐름에 잇는 표는 ATLAS 가 정한 것 [판단] — 업종 안 모든 회사가 그 흐름의 회사라는 뜻이 아님', '고른 목록일 뿐 — 맞는지 아직 모름 · 투자 권유 아님'],
 'check': '따로 짠 셈(다른 에이전트 · 같은 기준 · 원문에서 다시 셈)과 같은 365곳 같은 차례 — 결산 달이 12월이 아닌 곳의 이익 비교도 같은 방식으로 맞춤',
}
prop = {'schema': 'atlas11-t365-proposal-1', 'made': __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(timespec='seconds'), 'rules': rules,
        'counts': {'universe': P['universe'], 'gate': P['pool'], 'gateFails': P['fails'], 'union': P['union'], 'both': P['both'], 'only26': P['only26'], 'only27': P['only27'], 'picked': len(rows), 'cutCapEok': P['cutCapEok']},
        'picked': rows, 'nextOut': [{'code': x['code'], 'name': x['name'], 'capEok': x['capEok'], 't26': x['t26'], 't27': x['t27'], 'theme': x['theme']} for x in P['dropped']]}
json.dump(prop, open(os.path.join(out, 'proposal.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(os.path.join(out, 'list.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['차례', '종목코드', '회사', '시장', '업종', '시가총액(억 원)', '1년 주가(%)', '2026 흐름', '2027 흐름', '흐름 업종', '까닭'])
    for r in rows: w.writerow([r['rank'], r['code'], r['name'], r['market'], r['sector'], r['capEok'], None if r['r1y'] is None else round(r['r1y'] * 100, 1), 'O' if r['t26'] else '', 'O' if r['t27'] else '', r['theme'] or '', r['why']])
print(len(rows), rows[0]['why'], '|', rows[-1]['name'], rows[-1]['why'])
