"""새 ATLAS 바탕 365곳(t365-v1) — 기준(우량 문 · 2026 흐름 · 2027 흐름) · 사장님 2026-10-10 23:18"""
import json
FIN={'은행','증권','생명보험','손해보험','카드','기타금융','창업투자'}
# 수주 업종 — 미리 받은 돈(선수금 · 계약부채)이 빚으로 잡혀 부채비율로 재지 않음(금융과 같은 까닭) [판단]
ORDER={'조선','우주항공과국방'}
# 2027 흐름 업종(네이버 업종) — 공식 근거가 있는 것만: ① 2027년 정부 예산안(2026-09-01 국무회의 · 정책브리핑) ② 2026년 9월 수출 증가 20% 이상(산업통상부 2026-10-01)
THEMES27 = {
 'AI·반도체':        (['반도체와반도체장비','전자장비와기기','전자제품','컴퓨터와주변기기'], '예산: AI·반도체 메가프로젝트 · 반도체특별회계 / 수출: 반도체 +262.8% · 컴퓨터(SSD) +435.3%'),
 'AI 데이터센터 전력': (['전기장비'], '예산: AI 데이터센터 메가프로젝트 / 수출: 전기기기 +23.4%'),
 '피지컬 AI·로봇·AI 전환': (['기계','IT서비스','소프트웨어'], '예산: 피지컬 AI 메가프로젝트 · 제조 AI 전환 3조 7,261억 원(+128.5%)'),
 '우주항공·방산':     (['우주항공과국방'], '예산: 미래 성장엔진(우주·항공) · 안전·안보 38조 3,000억 원'),
 '조선':             (['조선'], '수출: 선박 +29.9%'),
 '첨단바이오':        (['제약','생물공학','생명과학도구및서비스','건강관리장비와용품','건강관리기술'], '예산: 미래 성장엔진(첨단바이오) · 10대 전략기술'),
 'K-뷰티·K-컬처':     (['화장품','게임엔터테인먼트','방송과엔터테인먼트'], '예산: 미래 성장엔진(K-컬처) / 수출: 화장품 +31.4%'),
 '이차전지·전기차':    (['전기제품'], '예산: 전기차 보조금 30만 대 → 43만 대 / 수출: 이차전지 +14.0%'),
 '통신장비·양자':      (['통신장비'], '예산: 10대 전략기술(양자 등) / 수출: 무선통신기기 +23.4%'),
 '에너지·자원안보':    (['석유와가스','에너지장비및서비스'], '예산: 산업·자원안보 강화 +84.5% / 수출: 석유제품 +72.0%'),
}
SECTOR2THEME = {s: t for t,(ss,_) in THEMES27.items() for s in ss}
def nz(s): return (s or '').replace(' ','')
def isfin(r): return nz(r['sector']) in FIN
def fv(r,key,per):
    d=r['fin'].get(key); return None if not d else d.get(per)
def growth(r):
    """이익이 늘어남 — 회사마다 결산 달이 달라도 같은 셈: 마지막 확정 해 다음 해 예상(증권사 예상치)이 있으면 그것 > 마지막 확정 해 ·
    없으면 마지막 확정 해 > 그 앞 해 · 금융은 순이익 · 그 밖은 영업이익"""
    k='net' if isfin(r) else 'op'
    d=r['fin'].get(k) or {}; per=r['fin'].get('periods') or []
    act=[p for p in per if not p.endswith('E') and d.get(p) is not None]
    if not act: return False, None, None, None
    last=act[-1]; yr=int(last[:4]); nxt=[p for p in per if p.endswith('E') and p.startswith(str(yr+1)) and d.get(p) is not None]
    if nxt: return (d[nxt[0]]>d[last]), 'e', d[last], d[nxt[0]]
    if len(act)>=2: return (d[last]>d[act[-2]]), 'a', d[act[-2]], d[last]
    return False, None, None, None
def blue(r, cap=2000, atv=5, debt=200, days=260):
    m=r['metrics'] or {}
    if (r['capEok'] or 0) < cap: return '시가총액 %s억 원 미만'%f'{cap:,}'
    if (r['px']['n'] or 0) < days: return '주가 기록 1년 미만'
    if (r['px']['atvEok'] or 0) < atv: return '하루 거래대금 %d억 원 미만'%atv
    if not (m.get('net') or 0) > 0: return '마지막 결산 순이익 적자'
    if not isfin(r) and not (m.get('op') or 0) > 0: return '마지막 결산 영업이익 적자'
    if not isfin(r) and nz(r['sector']) not in ORDER and not (m.get('debt') is not None and m['debt'] <= debt): return '부채비율 %d%% 초과'%debt
    return None
