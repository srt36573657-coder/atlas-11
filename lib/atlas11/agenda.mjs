/**
 * ATLAS 11 · 일정·공시 표(화면 묶음 agenda.json) — 회사마다 「다가오는 일정」과 「최근 공시」에 중요도(★)를 붙인다.
 *   2026-10-04 08:19 사장님 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기해줘」 · 「이거 처음부터 다시 해」
 *
 * 어디서 오나(지어낸 일정 없음)
 *   · 다가오는 일정 = 발행본 종목마다 붙어 있는 확인된 일정(public/data/atlas.json 의 연구 일정표 → lib/atlas11/forecast.mjs compactNews)
 *       시장 공통(미국 금리·물가·고용, 한국은행) · 업종(전시회·학회) · 회사 고유(배당 기준일·유상증자·기업설명회 …) — 일정마다 공식 출처 주소가 있다
 *       회사 일정은 그 회사 코드, 업종 일정은 그 업종 이름이 맞을 때만 붙인다(종목을 바꿔도 같은 규칙으로 다시 붙음)
 *   · 최근 공시 = 날마다 16:00 실행 때 모으는 관측 묶음(reports/atlas11/context — 네이버 증권 공시 목록 · KOSCOM)의 최근 30일
 * 중요도(★★★ 아주 중요 · ★★ 중요 · ★ 참고)는 일정·공시의 「종류」로 매긴 ATLAS 규칙이다 [판단] — 주가에 미친 크기를 잰 값이 아니고, 전망 숫자에도 넣지 않는다.
 * 「내일 하루만」(2026-10-02)은 예측을 내일 하나로 줄인 명령이다. 일정은 예측이 아니므로 내일 뒤 날짜라도 이 표에서만 보인다(전망 값은 여전히 내일 하나).
 */

export const AGENDA_SCHEMA = 'atlas11-view-agenda-1';
export const LEVELS = Object.freeze({3: {stars: '★★★', word: '아주 중요'}, 2: {stars: '★★', word: '중요'}, 1: {stars: '★', word: '참고'}});
export const DISCLOSURE_DAYS = 30;

/** 일정 종류 → 중요도 · 없는 종류는 1(참고) */
export const EVENT_KIND_LEVEL = Object.freeze({
  FOMC: 3, BOK: 3,                                   // 금리 결정(미국 연준 · 한국은행)
  CPI: 2, JOBS: 2,                                   // 미국 물가 · 고용
  PPI: 1, JOLTS: 1,                                  // 미국 생산자물가 · 구인
  CAPITAL_INCREASE: 3, DIVIDEND_RECORD: 3, COMPANY_REDISCLOSURE: 3, DRUG_APPROVAL: 3, EARNINGS: 3,   // 회사 돈·주식 수·실적이 걸린 일
  COMPANY_IR: 2, COMPANY_KPW_IR: 2, COMPANY_GOVERNANCE_RECOMMENDATION: 2, COMPANY_PRODUCT_PRESENTATION: 2, AIRLINE_FUEL_POLICY: 2, GAS_PAYMENT_POLICY: 2,
});
export const EVENT_RULES = [
  '★★★ 금리 결정(미국 연준 · 한국은행) · 회사의 증자·배당 기준일·실적·재공시·신약 승인',
  '★★ 미국 물가·고용 발표 · 회사 설명회(IR) · 신제품 발표 · 주주 기준일 · 요금 정책',
  '★ 미국 생산자물가·구인 발표 · 업종 전시회·학회 · 회사 행사(전시 참가·공연·세미나 등)',
];

/** 공시 제목 → 중요도 — ① 늘 나오는 안내(파생상품 가격제한폭·기준가격·추가상장·회의 결과 …)는 ★ ② 큰 일 ★★★ ③ 중간 ★★ ④ 그 밖 ★
 *  자회사·종속회사 일(「(자회사의 주요경영사항)」)은 한 칸 낮춘다 · 「(정정)」은 원래 공시와 같은 칸
 *  관측 묶음의 corporateAction 표시(배당락·자기주식·소각까지 넓게 잡음)는 쓰지 않는다 — 제목 낱말로만 */
const ROUTINE = /가격제한폭 확대요건|기준가격 안내|시장조치안내|^\S*\s*주식선물|주식선물ㆍ|주식옵션|주식매수선택권|지속가능경영보고서|자율준수프로그램|변경상장|추가상장|결과(\(|$|\s)|발행결과|해외증권거래소|단일계좌|소수계좌|종가급변/;
const D3 = /영업\(잠정\)실적|잠정\)?실적|결산실적공시|매출액또는손익구조|유상증자|무상증자|감자|합병|분할|병합|최대주주|매매거래정지|상장폐지|관리종목|횡령|배임|회생|파산|영업정지|경영권 분쟁|단일판매ㆍ공급계약|공급계약 ?체결|전환사채|신주인수권부사채|교환사채/;
const D2 = /기업설명회|\bIR\b|배당|주주총회소집|주주명부폐쇄|기준일|자기주식|자사주|소각|타법인주식|신규시설투자|투자판단|장래사업|풍문|조회공시|공매도 과열|투자경고|소송|대표이사|기업가치 제고|채무보증|중대재해/;
const SUBSIDIARY = /\((자회사|종속회사)의 주요경영사항\)/;
export const DISCLOSURE_RULES = [
  '★★★ 실적·실적 발표 예고 · 증자·감자·합병·분할 · 최대주주 변경 · 거래정지·상장폐지 · 큰 공급계약 · 전환사채 · 경영권 다툼',
  '★★ 설명회(IR) · 배당 · 주주총회 소집 · 기준일 · 자기주식·소각 · 다른 회사 지분 · 시설투자 · 해명·조회공시 · 투자경고 · 소송 · 대표 변경',
  '★ 늘 나오는 안내(파생상품 가격제한폭 · 기준가격 · 추가상장 · 회의 결과 등)와 그 밖 · 자회사 일은 한 칸 낮춤',
];
/** 앞으로 있을 일을 알리는 공시(예고·알림) — 날짜는 공시 원문에 있다(제목만 저장하므로 이 표에는 공시한 날만) */
const NOTICE = [[/결산실적공시 예고|실적.*예고/, '예고 · 실적 발표'], [/기업설명회|\bIR\b.*개최/, '예고 · 설명회'], [/주주총회소집/, '예고 · 주주총회'], [/주주명부폐쇄|기준일 (설정|결정)|\(기준일\)/, '예고 · 기준일'], [/매매거래정지 예고|거래정지 예고/, '예고 · 거래정지'], [/지정예고|지정 예고/, '예고 · 투자경고 지정']];

export const eventLevel = e => EVENT_KIND_LEVEL[e?.kind] ?? 1;
export function disclosureLevel(title) {
  const t = String(title ?? '');
  if (ROUTINE.test(t)) return 1;
  const base = D3.test(t) ? 3 : D2.test(t) ? 2 : 1;
  return SUBSIDIARY.test(t) ? Math.max(1, base - 1) : base;
}
export function noticeOf(title) { const t = String(title ?? ''); if (ROUTINE.test(t)) return null; for (const [re, word] of NOTICE) if (re.test(t)) return word; return null; }

const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);
const daysBefore = (day, n) => new Date(Date.parse(day + 'T00:00:00Z') - n * 86400000).toISOString().slice(0, 10);
/** 회사 이름 머리말(「현대자동차(주) 」 · 「(주)KB금융지주 」 · 「주식회사 크래프톤 」 · 「엘에스일렉트릭 주식회사 」 · 「실리콘투 」)을 떼어 짧게 */
export function shortTitle(title, name) {
  let t = String(title ?? '').trim();
  const cut = re => { const m = t.match(re); if (m && m[0].length < t.length) t = t.slice(m[0].length).trim(); };
  cut(/^주식회사\s+\S+\s+/); cut(/^\(주\)\S+\s+/); cut(/^\S+\(주\)\s+/); cut(/^\S+\s+주식회사\s+/);
  if (name && t.startsWith(name + ' ')) t = t.slice(name.length + 1).trim();
  return t;
}
const eventItem = e => { const src = (e.sources ?? []).find(x => /^https:\/\//.test(x.url ?? ''));
  return {id: e.id, date: e.date, name: e.name, kind: e.kind, scope: e.scope?.type ?? null, route: e.route ?? null, level: eventLevel(e), note: e.channel ?? null, source: src ? {name: src.name ?? '공식 출처', url: src.url} : null}; };
const byDateThenLevel = (a, b) => a.date.localeCompare(b.date) || b.level - a.level || a.name.localeCompare(b.name, 'ko');

/**
 * publication: 발행본 원본(내일만으로 줄이기 전 — 줄인 판은 내일 뒤 일정을 지운다) · input: 지금 52종목 · snap: 관측 묶음(없어도 됨) · now: 묶음 만든 시각
 * 반환: {schema, builtDay, market:[…], byCode:{code:{name, sector, upcoming:[…], disclosures:[…], disclosureDays, missing}}, rules, sources}
 */
export function buildAgenda({publication, input, snap = null, now = new Date().toISOString(), disclosureDays = DISCLOSURE_DAYS}) {
  const builtDay = koreaDay(now), from = daysBefore(builtDay, disclosureDays);
  const pool = new Map();
  for (const a of publication?.assets ?? []) for (const n of a.news ?? []) if (n?.id && /^\d{4}-\d{2}-\d{2}$/.test(n.date ?? '') && !pool.has(n.id)) pool.set(n.id, n);
  const upcoming = [...pool.values()].filter(n => n.date >= builtDay);
  const market = upcoming.filter(n => n.scope?.type === 'market').map(eventItem).sort(byDateThenLevel);
  const discBy = new Map((snap?.disclosures ?? []).map(d => [d.code, d]));
  const byCode = {};
  for (const a of input?.assets ?? []) {
    const mine = upcoming.filter(n => (n.scope?.type === 'company' && (n.scope.codes ?? []).includes(a.code)) || (n.scope?.type === 'sector' && (n.scope.sectors ?? []).includes(a.sector)));
    const d = discBy.get(a.code);
    const disclosures = (d?.items ?? []).filter(i => typeof i.publishedAt === 'string' && i.publishedAt.slice(0, 10) >= from && i.publishedAt.slice(0, 10) <= builtDay)
      .map(i => ({id: i.id ?? null, publishedAt: i.publishedAt, title: shortTitle(i.title, a.name), level: disclosureLevel(i.title), notice: noticeOf(i.title), corporateAction: i.corporateAction === true}))
      // 같은 날 같은 제목(국내·해외 설명회 두 건 등)은 한 줄로 · 몇 건인지 적는다
      .reduce((acc, x) => { const k = x.publishedAt.slice(0, 10) + '|' + x.title, same = acc.find(y => y.key === k); if (same) same.times++; else acc.push({...x, key: k, times: 1}); return acc; }, [])
      .map(({key, ...x}) => x)
      .sort((x, y) => y.level - x.level || y.publishedAt.localeCompare(x.publishedAt));
    byCode[a.code] = {name: a.name, sector: a.sector ?? null, upcoming: mine.map(eventItem).sort(byDateThenLevel), disclosures, disclosureDays, missing: d ? [] : ['공시']};
  }
  return {schema: AGENDA_SCHEMA, builtDay, generatedAt: now, forecastId: publication?.forecastId ?? null, market, byCode,
    levels: LEVELS, rules: {events: EVENT_RULES, disclosures: DISCLOSURE_RULES, note: '중요도는 일정·공시의 종류로 매긴 ATLAS 규칙입니다 · 주가에 미친 크기를 잰 값이 아니고 전망 숫자에 넣지 않습니다'},
    sources: {events: '발행본 종목마다 붙은 확인된 일정(공식 출처 주소 포함 · public/data/atlas.json 연구 일정표)', disclosures: snap ? {provider: '네이버 증권 공시 목록(KOSCOM)', day: snap.day ?? null, fetchedAt: snap.fetchedAt ?? null, windowDays: disclosureDays} : null}};
}
