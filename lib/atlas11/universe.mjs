/**
 * ATLAS 11 · 종목 고르기(우량 52) — 2026-10-04 00:51 사장님 「52개 업종에서 찾는 게 아니라 오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경하자」,
 *   01:00 「알아서 해」 → 다섯 가지를 제 안대로 정함(채팅 기록):
 *   ① 고르는 법: 시가총액 상위 300곳 중 2년 연속 흑자 · 빚이 적음(부채비율 150% 이하 · 금융회사 제외) · ROE 5% 이상 → 점수 순 52곳 · 한 업종 4곳까지
 *   ② 오를지 내릴지는 지금처럼 ATLAS가 매일 따로 적는다(고르는 데 「오를 것 같다」를 쓰지 않는다 — 지난 120거래일 후향 방향 맞힘 51.7%라 쓸 근거가 없음)
 *   ③ 다시 고르기: 한 달에 한 번  ④ 바꾸는 날: 2026-10-06 실행 · 옛 52종목 기록은 그대로 보관  ⑤ 화면 말: 「튼튼한 회사 52곳」(사라·추천 같은 말 없음)
 *
 * 이 파일은 네트워크를 쓰지 않는다(받은 원문을 풀고 · 규칙대로 고르고 · 새 입력을 만든다). 받기는 scripts/atlas11/collect_universe.mjs.
 * 같은 원문이면 언제나 같은 52곳이 나온다(정렬 기준: 점수 → 시가총액 → 종목코드).
 */
import {createHash} from 'node:crypto';

export const UNIVERSE_SCHEMA = 'atlas11-universe-proposal-1';
export const BUNDLE_SCHEMA = 'atlas11-universe-bundle-1';

/** 규칙 판 하나 — 바꾸면 version 을 올린다(옛 판은 기록에 남는다)
 *  q52-v1(2026-10-04 01:00): 점수 순(ROE 40% · 빚 적음 30% · 크기 30%) — 첫 실제 실행(reports/atlas11/universe/2026-10-04)에서 삼성전자(시가총액 1위 · 조건 통과)가
 *    한 업종 4곳 제한에 밀려 빠지고 HPSP(103위)·클래시스(216위)가 들어옴 → 「우량」의 뜻(크고 튼튼한 회사)과 어긋나 v2 로 바꿈
 *  q52-v2(2026-10-04 02:00): 조건(흑자·ROE·빚)은 그대로 · 순서만 「조건을 다 넘은 회사 가운데 시가총액 큰 순」 · 거래정지 날(회사 분할·액면분할)은 빠진 날로 치지 않음(그날도 종가가 있음) */
export const QUALITY52_V1 = Object.freeze({
  version: 'q52-v1',
  label: '튼튼한 회사 52곳',
  poolTop: 300,            // 시가총액 순위(코스피·코스닥 합쳐서) 이 안에서만
  minHistoryRows: 600,     // 일봉 600개 이상(모형 학습 · 연쇄 지도 504거래일)
  completeSessions: 505,   // 마지막 505거래일은 빠진 날·멈춘 날이 없어야 함
  profitYears: 2,          // 최근 결산 2년 연속 흑자(영업이익·당기순이익 · 금융회사는 당기순이익만)
  roeMinPct: 5,            // 최근 결산 ROE 5% 이상
  debtMaxPct: 150,         // 최근 결산 부채비율 150% 이하(금융회사는 빼고 봄 — 예금·보험금이 빚으로 잡히는 구조)
  perSectorMax: 4,         // 한 업종(네이버 업종) 4곳까지
  count: 52,
  weights: Object.freeze({roe: 0.4, debt: 0.3, size: 0.3}),
  financialSectors: Object.freeze(['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자']),
  // 52곳이 안 차면 이 순서로 한 단계씩만 늦춘다(어느 단계를 썼는지 기록)
  relax: Object.freeze([Object.freeze({debtMaxPct: 200}), Object.freeze({roeMinPct: 3}), Object.freeze({profitYears: 1})]),
  says: '시가총액 상위 300곳 중 2년 연속 흑자 · 부채비율 150% 이하(금융회사 제외) · ROE 5% 이상인 회사를 점수(ROE 40% · 빚 적음 30% · 회사 크기 30%) 순으로 52곳 · 한 업종 4곳까지',
});
export const QUALITY52 = Object.freeze({...QUALITY52_V1, version: 'q52-v2', order: 'size', haltedDaysAllowed: true,
  says: '시가총액 상위 300곳 중 2년 연속 흑자 · 부채비율 150% 이하(금융회사 제외) · ROE 5% 이상을 모두 넘은 회사를 시가총액 큰 순으로 52곳 · 한 업종 4곳까지'});

/**
 * qt180-v1(2026-10-04 18:10 사장님 「이제 이런식으로 180개 회사를 찾는다 우량주 그리고 시대 트랜드 주식만」)
 *   우량주 = q52-v2 의 네 조건(시가총액 300위 안 · 2년 연속 흑자 · ROE 5% 이상 · 부채비율 150% 이하 · 금융회사는 빚 기준 빼고)을 모두 넘은 회사 — 전부 넣는다(한 업종 몇 곳 제한 없음)
 *   시대 트렌드 = 아래 여덟 흐름 업종(네이버 업종 이름)에 든 회사 — 우량 조건을 못 넘었어도 시가총액 300위 안 · 보통주 · 가격 이력이 고르면 넣을 수 있다
 *   고르는 차례: 우량주 전부(시가총액 큰 순) → 남은 자리를 「우량은 아니지만 트렌드 업종」 회사로 시가총액 큰 순으로 채움
 *   어떤 업종을 시대 트렌드로 볼지는 ATLAS 가 정한 것 [판단] — 앞날 값이 아니라 업종 이름으로만 가른다
 */
export const TREND_GROUPS = Object.freeze([
  Object.freeze({id: 'ai-chip', label: 'AI·반도체', sectors: Object.freeze(['반도체와반도체장비', '전자장비와기기'])}),
  Object.freeze({id: 'power', label: '전력·원전·에너지', sectors: Object.freeze(['전기장비', '전기유틸리티', '에너지장비및서비스'])}),
  Object.freeze({id: 'battery', label: '2차전지', sectors: Object.freeze(['전기제품'])}),
  Object.freeze({id: 'ship-defense', label: '조선·방산·우주', sectors: Object.freeze(['조선', '우주항공과국방'])}),
  Object.freeze({id: 'machine-robot', label: '기계·로봇·원전 설비', sectors: Object.freeze(['기계'])}),
  Object.freeze({id: 'bio', label: '바이오·헬스', sectors: Object.freeze(['제약', '생물공학', '건강관리장비와용품', '생명과학도구및서비스'])}),
  Object.freeze({id: 'k-culture', label: 'K-뷰티·푸드·콘텐츠', sectors: Object.freeze(['화장품', '식품', '게임엔터테인먼트', '방송과엔터테인먼트'])}),
  Object.freeze({id: 'platform', label: 'AI 플랫폼·소프트웨어', sectors: Object.freeze(['양방향미디어와서비스', 'IT서비스'])}),
]);
export const trendGroupOf = sector => TREND_GROUPS.find(g => g.sectors.includes(String(sector ?? '').replace(/\s+/g, ''))) ?? null;
export const QT180 = Object.freeze({...QUALITY52, version: 'qt180-v1', label: '우량주·시대 트렌드 180곳', count: 180, perSectorMax: Infinity, relax: Object.freeze([]), order: 'size', mix: 'quality-first',
  trendGroups: TREND_GROUPS,
  says: '시가총액 상위 300곳 가운데 ① 우량주(2년 연속 흑자 · ROE 5% 이상 · 부채비율 150% 이하 · 금융회사는 빚 기준 빼고)를 모두 넣고 ② 남은 자리는 시대 트렌드 여덟 업종(AI·반도체 · 전력·원전·에너지 · 2차전지 · 조선·방산·우주 · 기계·로봇 · 바이오·헬스 · K-뷰티·푸드·콘텐츠 · AI 플랫폼)의 회사로 시가총액 큰 순으로 채운 180곳'});

/**
 * i36-v1(2026-10-04 21:01·21:04 사장님 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」)
 *   업종 = 네이버 증권 업종 이름 · 회사가 모자란 작은 업종 몇 개는 가까운 업종과 합친다(INDUSTRY_MERGE · ATLAS 가 정함 [판단] · 화면 이름에 합친 것이 드러남)
 *   업종마다 5곳 — 시가총액 900위 안 · 보통주 · 가격 이력 고름 · 업종 이름을 아는 회사 가운데
 *     ① 우량주(네 조건 · 금융회사는 빚 기준 빼고) 또는 시대 트렌드 업종 회사를 시가총액 큰 순으로
 *     ② 모자라면 최근 결산 흑자인 회사(표시 「흑자」)로 ③ 그래도 모자라면 그 업종의 큰 회사(표시 「채움」)로 채운다
 *   5곳을 채운 업종 가운데 그 5곳 시가총액 합이 큰 36개 업종 → 180곳
 *   (2026-10-04 21:31 자료: 우량·트렌드만으로 5곳을 채우는 업종은 30개뿐 — 36개를 맞추려고 ②·③을 둠 · 몇 곳이 ②·③인지 기록에 남김)
 *   요즘 불장 업종 11개 · 다음 불장 후보 22곳은 고를 때가 아니라 판을 만들 때 지난 종가로 센다(lib/atlas11/industries.mjs)
 */
export const INDUSTRY_MERGE = Object.freeze({
  '손해보험': '보험', '생명보험': '보험', '자동차': '자동차·부품', '자동차부품': '자동차·부품', '양방향미디어와서비스': '인터넷·IT서비스', 'IT서비스': '인터넷·IT서비스',
  '식품': '식품·담배', '담배': '식품·담배', '은행': '은행·카드', '카드': '은행·카드', '백화점과일반상점': '유통', '인터넷과카탈로그소매': '유통',
  '해운사': '운송', '항공화물운송과물류': '운송', '항공사': '운송', '도로와철도운송': '운송', '철강': '철강·금속', '비철금속': '철강·금속',
  '다각화된통신서비스': '통신', '무선통신서비스': '통신', '전기유틸리티': '전력·가스', '가스유틸리티': '전력·가스', '복합유틸리티': '전력·가스'});
export const industryKeyOf = sector => sector ? (INDUSTRY_MERGE[String(sector).replace(/\s+/g, '')] ?? String(sector)) : null;
export const I36 = Object.freeze({...QUALITY52, version: 'i36-v1', label: '업종 36개 · 180곳', poolTop: 900, count: 180, industries: 36, perIndustry: 5, perSectorMax: 5, relax: Object.freeze([]), order: 'size', mix: 'industry',
  trendGroups: TREND_GROUPS, merge: INDUSTRY_MERGE, fill: Object.freeze(['quality-or-trend', 'profit', 'size']),
  says: '시가총액 900위 안 · 업종(네이버 증권 업종 · 작은 업종 몇 개는 합침)마다 5곳 — 우량주이거나 시대 트렌드 업종 회사를 시가총액 큰 순으로, 모자라면 흑자 회사, 그래도 모자라면 그 업종 큰 회사로 채움 · 5곳 시가총액 합이 큰 업종 36개 · 모두 180곳'});

/**
 * s365-v1(2026-10-05 05:07 사장님 「지금 180개를 365개로 한다 업종도 늘리고 더 세분화 한다」)
 *   업종을 더 잘게: 한국거래소 KIND 상장회사 목록의 업종(한국표준산업분류 · 예: 「반도체 제조업」 「특수 목적용 기계 제조업」 「전자부품 제조업」)으로 나눈다
 *     — 네이버 증권 업종 이름표 쪽이 바뀌어(2026-10-04 · 98곳이 업종 모름으로 빠짐) 네이버 업종만으로는 이름을 다 알 수 없고, 네이버 업종(약 79개)은 5곳을 채우는 업종이 40개뿐이었다
 *   업종(세분)마다 5곳 — 시가총액 1300위 안 · 보통주 · 가격 이력 고름 · 고르는 차례는 i36-v1 과 같다(우량이거나 시대 트렌드 → 흑자 → 그 업종 큰 회사)
 *   5곳 시가총액 합이 큰 73개 업종 → 365곳(73 × 5) · KRX 업종으로 5곳이 안 차는 회사들은 네이버 업종으로 한 번 더 묶어 본다(이름은 네이버 업종)
 *   시대 트렌드: 네이버 업종 이름(TREND_GROUPS) 또는 KRX 업종 이름의 낱말(KSIC_TREND) — ATLAS 가 정함 [판단] · 앞날 값으로 고르지 않는다
 */
export const KSIC_TREND = Object.freeze([
  [/반도체|전자부품|인쇄회로|전자 부품/, 'ai-chip'], [/축전지|일차전지|전지 제조/, 'battery'], [/발전기|전동기|변압기|전기 공급|원자력|송전|배전|전선|전기 변환/, 'power'],
  [/선박|항공기|우주|무기|총포|방위|탄약/, 'ship-defense'], [/로봇|특수 목적용 기계|일반 목적용 기계|엔진|펌프|베어링|기계장비/, 'machine-robot'],
  [/의약|의료|생물|바이오|자연과학 및 공학 연구|치과|진단|의학/, 'bio'], [/화장품|식료품|식품|음료|게임|영상|오디오|방송|음악|엔터|기록물/, 'k-culture'],
  [/소프트웨어|컴퓨터 프로그래밍|정보서비스|자료처리|포털|인터넷|시스템 통합/, 'platform']]);
export const ksicTrendOf = ksic => { const k = String(ksic ?? ''); const hit = KSIC_TREND.find(([re]) => re.test(k)); return hit ? TREND_GROUPS.find(g => g.id === hit[1]) ?? null : null; };
const normK = s => String(s ?? '').replace(/\s+/g, '');
/** KRX 업종 이름 → 화면에 쓰는 짧은 이름(뜻은 바꾸지 않고 줄이기만 · 자주 나오는 것은 손으로 고친 이름) */
export const KSIC_SHORT = Object.freeze({});
export const ksicLabel = ksic => KSIC_SHORT[normK(ksic)] ?? String(ksic ?? '').replace(/\s*제조업$/, '').replace(/\s*(서비스)?업$/, (m, svc) => svc ? ' 서비스' : '').replace(/\s+및\s+/g, '·').replace(/\s+/g, ' ').trim();
export const S365 = Object.freeze({...QUALITY52, version: 's365-v1', label: '업종 73개 · 365곳', poolTop: 1300, count: 365, industries: 73, perIndustry: 5, perSectorMax: 5, relax: Object.freeze([]), order: 'size', mix: 'sub-industry',
  trendGroups: TREND_GROUPS, merge: INDUSTRY_MERGE, fill: Object.freeze(['quality-or-trend', 'profit', 'size']),
  says: '시가총액 1300위 안 · 업종(한국거래소 업종 = 한국표준산업분류 · 모자라면 네이버 증권 업종)마다 5곳 — 우량주이거나 시대 트렌드 업종 회사를 시가총액 큰 순으로, 모자라면 흑자 회사, 그래도 모자라면 그 업종 큰 회사로 채움 · 5곳 시가총액 합이 큰 업종 73개 · 모두 365곳'});

// ---------- 숫자 ----------
export const num = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/,/g, '').trim();
  const m = /^[+-]?\d+(\.\d+)?/.exec(s.replace(/^[^\d+-]+/, ''));
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};
/** 「1,607조 7,266억」 → 억원(16,077,266) · 「7,266억」 → 7,266 */
export function koreanAmountEok(text) {
  if (typeof text !== 'string') return null;
  const jo = /([\d,]+)\s*조/.exec(text), eok = /([\d,]+)\s*억/.exec(text);
  if (!jo && !eok) return num(text);
  return (jo ? num(jo[1]) * 10000 : 0) + (eok ? num(eok[1]) : 0);
}
const strip = html => String(html ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const sha = s => createHash('sha256').update(s).digest('hex');

// ---------- 원문 풀기 ----------
/** m.stock.naver.com /api/stocks/marketValue/{KOSPI|KOSDAQ} → [{code, name, market, endType, listValue}] (listValue 는 그 목록 안 순위용) */
export function parseMarketValueJson(text, market) {
  const j = JSON.parse(text);
  const list = Array.isArray(j) ? j : Array.isArray(j?.stocks) ? j.stocks : Array.isArray(j?.result?.stocks) ? j.result.stocks : null;
  if (!list) throw Error('MARKET_VALUE_JSON_SHAPE');
  return list.map(s => ({code: String(s.itemCode ?? s.code ?? ''), name: s.stockName ?? s.name ?? null, market, endType: s.stockEndType ?? null, listValue: num(s.marketValue)})).filter(x => /^\d{6}$/.test(x.code));
}
/** finance.naver.com /sise/sise_market_sum.naver (EUC-KR 표) → 같은 모양 · 시가총액 칸은 머리글 이름으로 찾는다 */
export function parseMarketSumHtml(html, market) {
  const table = /<table[^>]*class="type_2"[^>]*>([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? html;
  const heads = [...table.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m => strip(m[1]));
  const capAt = heads.findIndex(h => h.replace(/\s/g, '') === '시가총액');
  if (capAt < 0) throw Error('MARKET_SUM_HEADER');
  const out = [];
  for (const tr of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const link = /href="\/item\/main\.naver\?code=(\d{6})"[^>]*>([^<]+)<\/a>/i.exec(tr[1]); if (!link) continue;
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => strip(m[1]));
    out.push({code: link[1], name: strip(link[2]), market, endType: null, listValue: num(tds[capAt])});
  }
  if (!out.length) throw Error('MARKET_SUM_ROWS');
  return out;
}
/** finance.naver.com /sise/sise_group.naver?type=upjong → [{no, name}] */
export function parseUpjongList(html) {
  const out = [], seen = new Set();
  for (const m of html.matchAll(/sise_group_detail\.naver\?type=upjong&(?:amp;)?no=(\d+)"[^>]*>([^<]+)<\/a>/gi)) { const no = m[1]; if (seen.has(no)) continue; seen.add(no); out.push({no, name: strip(m[2])}); }
  if (!out.length) throw Error('UPJONG_LIST_EMPTY');
  return out;
}
/** 한국거래소 KIND 상장회사 목록(corpList.do?method=download · 표 HTML · EUC-KR) → Map(code → {code, name, ksic, products})
 *   머리글 이름으로 칸을 찾는다(회사명 · 종목코드 · 업종 · 주요제품) · 종목코드는 앞 0 이 빠져 올 수 있어 6자리로 채운다 · 숫자 아닌 코드는 뺀다 */
export function parseKindCorpList(html) {
  const rows = [...String(html ?? '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(x => strip(x[1])));
  const head = rows.find(r => r.includes('회사명') && r.includes('종목코드'));
  if (!head) throw Error('KIND_HEADER');
  const iName = head.indexOf('회사명'), iCode = head.indexOf('종목코드'), iInd = head.indexOf('업종'), iProd = head.indexOf('주요제품');
  const out = new Map();
  for (const r of rows) {
    if (r === head) continue;
    const raw = String(r[iCode] ?? '').trim(); if (!/^\d{1,6}$/.test(raw)) continue;
    const code = raw.padStart(6, '0');
    out.set(code, {code, name: r[iName] || null, ksic: (iInd >= 0 && r[iInd]) || null, products: (iProd >= 0 && r[iProd]) || null});
  }
  if (!out.size) throw Error('KIND_ROWS');
  return out;
}
/** 네이버 업종 이름 찾기(이름표 쪽이 바뀐 뒤 · 2026-10-05) — JSON 이면 그 번호를 가진 객체의 이름 칸, HTML 이면 제목 · 옛 링크 모양 · 페이지 속 JSON 조각 */
const NAME_KEYS = ['name', 'groupName', 'industryName', 'upjongName', 'title'], NO_KEYS = ['no', 'groupNo', 'industryCode', 'upjongNo', 'code', 'id'];
export function industryNameFrom(text, no) {
  if (!text) return null;
  const ok = v => typeof v === 'string' && v.trim() && v.length <= 40 && /[가-힣]/.test(v) && !/네이버|증권|NAVER|업종\s*상세/.test(v);
  try {
    const j = JSON.parse(text), seen = new Set();
    const walk = o => { if (!o || typeof o !== 'object' || seen.has(o)) return null; seen.add(o);
      if (!Array.isArray(o)) { const id = NO_KEYS.map(k => o[k]).find(v => v != null); const nm = NAME_KEYS.map(k => o[k]).find(ok); if (nm && id != null && String(id) === String(no)) return nm.trim(); if (o.groupInfo && ok(o.groupInfo.name)) return o.groupInfo.name.trim(); }
      for (const v of Object.values(o)) { const r = walk(v); if (r) return r; } return null; };
    const r = walk(j); if (r) return r;
  } catch { /* HTML */ }
  const t = String(text);
  const link = new RegExp(`type=upjong&(?:amp;)?no=${no}"[^>]*>([^<]+)<`).exec(t); if (link && ok(strip(link[1]))) return strip(link[1]);
  const js = new RegExp(`\\\\?"(?:no|groupNo|industryCode)\\\\?"\\s*:\\s*\\\\?"?${no}\\\\?"?[^{}]{0,200}?\\\\?"(?:name|groupName|industryName)\\\\?"\\s*:\\s*\\\\?"([^"\\\\]{1,40})`).exec(t); if (js && ok(js[1])) return js[1].trim();
  const title = /<title>([^<]+)<\/title>/i.exec(t)?.[1]; const head = title ? strip(title).split(/\s*[:|\-–]\s*/)[0] : null; if (ok(head)) return head;
  return null;
}
/** 업종 목록 JSON/HTML → [{no, name}] (여러 모양을 받아 줌) */
export function parseIndustryList(text) {
  const out = new Map();
  try {
    const j = JSON.parse(text), seen = new Set();
    const walk = o => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
      if (!Array.isArray(o)) { const id = NO_KEYS.map(k => o[k]).find(v => v != null && /^\d{2,4}$/.test(String(v))); const nm = NAME_KEYS.map(k => o[k]).find(v => typeof v === 'string' && /[가-힣]/.test(v) && v.length <= 40); if (id != null && nm) out.set(String(id), nm.trim()); }
      for (const v of Object.values(o)) walk(v); };
    walk(j);
  } catch { try { for (const x of parseUpjongList(text)) out.set(x.no, x.name); } catch { /* 모양 모름 */ } }
  return [...out].map(([no, name]) => ({no, name}));
}
/** 업종 상세 → 그 업종 종목코드들 */
export function parseUpjongDetail(html) {
  return [...new Set([...html.matchAll(/\/item\/main\.naver\?code=(\d{6})/g)].map(m => m[1]))];
}
/** m.stock.naver.com /api/stock/{code}/integration (2026-09-29 실제 응답 확인: reports/atlas11/probe/deep/naver-integration-005930.json) */
export function parseIntegration(text) {
  const j = JSON.parse(text);
  if (!j || typeof j !== 'object' || !Array.isArray(j.totalInfos)) throw Error('INTEGRATION_SHAPE');
  const info = Object.fromEntries(j.totalInfos.map(t => [t.code, t.value]));
  return {code: String(j.itemCode ?? ''), name: j.stockName ?? null, endType: j.stockEndType ?? null, industryCode: j.industryCode != null ? String(j.industryCode) : null,
    marketCapEok: koreanAmountEok(info.marketValue), per: num(info.per), eps: num(info.eps), pbr: num(info.pbr), bps: num(info.bps), dividendYield: num(info.dividendYieldRatio),
    high52: num(info.highPriceOf52Weeks), low52: num(info.lowPriceOf52Weeks), tradingValueText: info.accumulatedTradingValue ?? null,
    industryPeers: (j.industryCompareInfo ?? []).map(p => ({code: String(p.itemCode ?? ''), name: p.stockName ?? null}))};
}
const rowKey = t => String(t ?? '').replace(/\s+/g, '').replace(/\(.*?\)/g, '');
/** m.stock.naver.com /api/stock/{code}/finance/annual → {periods:[{key,title,consensus}], rows:{이름:{key:값}}} */
export function parseFinanceJson(text) {
  const j = JSON.parse(text), fi = j?.financeInfo ?? j;
  const periods = (fi?.trTitleList ?? []).map(t => ({key: String(t.key ?? t.title), title: String(t.title ?? t.key).replace(/\.$/, ''), consensus: t.isConsensus === 'Y'}));
  const rows = {};
  for (const r of fi?.rowList ?? []) rows[rowKey(r.title)] = Object.fromEntries(Object.entries(r.columns ?? {}).map(([k, v]) => [String(k), num(typeof v === 'object' && v ? v.value : v)]));
  if (!periods.length || !Object.keys(rows).length) throw Error('FINANCE_JSON_SHAPE');
  return {periods, rows, source: 'finance_json'};
}
/** finance.naver.com /item/main.naver 의 「기업실적분석」 표(cop_analysis) → 같은 모양(연간 칸만) */
export function parseCopAnalysisHtml(html) {
  const at = html.indexOf('cop_analysis'); if (at < 0) throw Error('COP_ANALYSIS_ABSENT');
  const section = html.slice(at, html.indexOf('</table>', at) + 8);
  const thead = /<thead[^>]*>([\s\S]*?)<\/thead>/i.exec(section)?.[1] ?? '';
  const annualCols = Number(/colspan="(\d+)"[^>]*>[\s\S]*?최근\s*연간\s*실적/i.exec(thead)?.[1] ?? /최근\s*연간\s*실적[\s\S]*?colspan="(\d+)"/i.exec(thead)?.[1] ?? 4) || 4;
  const trs = [...thead.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(x => strip(x[1])));
  const periodRow = trs.find(r => r.some(x => /^\d{4}\.\d{2}/.test(x))) ?? [];
  const periods = periodRow.filter(x => /^\d{4}\.\d{2}/.test(x)).slice(0, annualCols).map(x => ({key: x.slice(0, 7), title: x.slice(0, 7), consensus: /\(E\)/.test(x)}));
  const tbody = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(section)?.[1] ?? '';
  const rows = {};
  for (const tr of tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const name = strip(/<th[^>]*>([\s\S]*?)<\/th>/i.exec(tr[1])?.[1]); if (!name) continue;
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => num(strip(m[1])));
    rows[rowKey(name)] = Object.fromEntries(periods.map((p, i) => [p.key, tds[i] ?? null]));
  }
  if (!periods.length || !Object.keys(rows).length) throw Error('COP_ANALYSIS_SHAPE');
  return {periods, rows, source: 'cop_analysis_html'};
}
/** 결산 숫자 고르기: 확정(추정 아님) 연간 칸의 마지막 둘 */
export function financeMetrics(fin) {
  if (!fin) return null;
  const actual = fin.periods.filter(p => !p.consensus), last = actual.at(-1), prev = actual.at(-2);
  const row = names => { for (const n of names) { const k = Object.keys(fin.rows).find(x => x === rowKey(n)) ?? Object.keys(fin.rows).find(x => x.startsWith(rowKey(n))); if (k) return fin.rows[k]; } return null; };
  const at = (names, p) => { const r = row(names); return r && p ? r[p.key] ?? null : null; };
  const OP = ['영업이익'], NET = ['당기순이익', '지배주주순이익', '순이익'];
  return {source: fin.source, fiscalYear: last?.title ?? null, prevYear: prev?.title ?? null,
    revenue: at(['매출액', '영업수익'], last), op: at(OP, last), opPrev: at(OP, prev), net: at(NET, last), netPrev: at(NET, prev),
    roe: at(['ROE'], last), debt: at(['부채비율'], last), opm: at(['영업이익률'], last)};
}

// ---------- 가격 이력 점검 ----------
/** rows: [{date, close, volume}] · sessions: 거래일 달력 · asOf: 이 날까지만 본다 */
export function historyCheck(rows, sessions, {asOf, minRows = QUALITY52.minHistoryRows, completeSessions = QUALITY52.completeSessions, haltedDaysAllowed = QUALITY52.haltedDaysAllowed === true} = {}) {
  const usable = rows.filter(r => r.date <= asOf && r.close > 0), by = new Map(usable.map(r => [r.date, r]));
  const recent = sessions.filter(d => d <= asOf).slice(-completeSessions);
  const missing = recent.filter(d => !by.has(d)), halted = recent.filter(d => by.has(d) && !(by.get(d).volume > 0));
  return {rows: usable.length, first: usable[0]?.date ?? null, last: usable.at(-1)?.date ?? null, missing: missing.length, halted: halted.length, firstMissing: missing[0] ?? null,
    ok: usable.length >= minRows && recent.length === completeSessions && !missing.length && (haltedDaysAllowed || !halted.length)};
}

// ---------- 고르기 ----------
/** 보통주만: 코드 끝자리 0(우선주는 5·7·9 …) · 스팩 · 리츠(이름 끝) · ETF/ETN 제외 — 「메리츠」처럼 이름 가운데 「리츠」는 걸리지 않게 */
export const notCommon = (code, name) => !/^\d{5}0$/.test(String(code)) || /스팩|리츠$|REIT|ETF$|ETN$/i.test(String(name ?? ''));
const isFinancial = (sector, rules) => rules.financialSectors.includes(String(sector ?? '').replace(/\s+/g, ''));
/** 후보 하나가 못 넘은 문들(빈 배열이면 통과) */
export function failsOf(c, rules = QUALITY52) {
  const f = [], fin = isFinancial(c.sector, rules), m = c.metrics;
  if (notCommon(c.code, c.name) || (c.endType && c.endType !== 'stock')) f.push('보통주 아님');
  if (!(c.capRank <= rules.poolTop)) f.push(`시가총액 ${rules.poolTop}위 밖`);
  if (!c.sector && !c.ksic) f.push('업종 모름'); // 네이버 업종도 KRX 업종(한국표준산업분류)도 모를 때만
  if (!c.history?.ok) f.push(c.history ? `가격 이력 부족(${c.history.rows}일 · 빠진 날 ${c.history.missing} · 멈춘 날 ${c.history.halted})` : '가격 이력 없음');
  if (!m) { f.push('결산 자료 없음'); return f; }
  const years = [[m.op, m.net], [m.opPrev, m.netPrev]].slice(0, rules.profitYears);
  if (years.some(([op, net]) => !(net > 0) || (!fin && !(op > 0)))) f.push(`${rules.profitYears}년 연속 흑자 아님`);
  if (!(m.roe >= rules.roeMinPct)) f.push(`ROE ${rules.roeMinPct}% 미만`);
  if (!fin && !(m.debt <= rules.debtMaxPct)) f.push(m.debt == null ? '부채비율 모름' : `부채비율 ${rules.debtMaxPct}% 초과`);
  return f;
}
/** 0~1 순위(같은 값은 평균 순위) · 큰 값이 1 */
function pct(values) {
  const idx = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), out = Array(values.length);
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const r = values.length > 1 ? ((i + j) / 2) / (values.length - 1) : 1; for (let k = i; k <= j; k++) out[idx[k][1]] = r; i = j + 1; }
  return out;
}
/**
 * selectQuality52(candidates, rules) → {ok, step, rules, picked:[…52], checked:[…모든 후보와 못 넘은 문], counts}
 *   candidates: [{code, name, market, endType, sector, capRank, marketCapEok, history:{ok,…}, metrics}]
 */
export function selectQuality52(candidates, rules = QUALITY52) {
  let last = null;
  for (let step = 0; step <= rules.relax.length; step++) {
    const r = {...rules, ...Object.assign({}, ...rules.relax.slice(0, step)), step};
    const checked = candidates.map(c => ({...c, fails: failsOf(c, r)}));
    const pass = checked.filter(c => !c.fails.length);
    const roeP = pct(pass.map(c => c.metrics.roe)), sizeP = pct(pass.map(c => Math.log(c.marketCapEok || 1)));
    const nonFin = pass.map(c => !isFinancial(c.sector, r)), debtVals = pass.map((c, i) => nonFin[i] ? -c.metrics.debt : null);
    const debtP0 = pct(debtVals.filter(v => v != null)); let k = 0; const debtP = debtVals.map(v => v == null ? 0.5 : debtP0[k++]);
    const scored = pass.map((c, i) => ({...c, debtExempt: !nonFin[i], parts: {roe: roeP[i], debt: debtP[i], size: sizeP[i]}, score: r.weights.roe * roeP[i] + r.weights.debt * debtP[i] + r.weights.size * sizeP[i]}))
      .sort((a, b) => r.order === 'size' ? b.marketCapEok - a.marketCapEok || a.code.localeCompare(b.code) : b.score - a.score || b.marketCapEok - a.marketCapEok || a.code.localeCompare(b.code));
    const perSector = new Map(), picked = [], capped = [];
    for (const c of scored) { const n = perSector.get(c.sector) ?? 0; if (n >= r.perSectorMax) { capped.push(c.code); continue; } perSector.set(c.sector, n + 1); picked.push(c); if (picked.length === r.count) break; }
    const counts = {candidates: candidates.length, passed: pass.length, picked: picked.length, cappedBySector: capped.length, failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
    last = {ok: picked.length === r.count, step, rules: r, picked: picked.map((c, i) => ({...c, rank: i + 1})), checked, counts};
    if (last.ok) return last;
  }
  return last;
}
/**
 * selectQualityTrend(candidates, rules = QT180) → {ok, step, rules, picked:[…], checked, counts}
 *   picked 마다 kind: 'quality'(우량 조건을 모두 넘음) | 'trend'(우량은 아니지만 트렌드 업종) · trend: 트렌드 묶음 {id, label} 또는 null
 */
export function selectQualityTrend(candidates, rules = QT180) {
  const r = {...rules, step: 0};
  const checked = candidates.map(c => ({...c, fails: failsOf(c, r), trend: trendGroupOf(c.sector)}));
  const bySize = (a, b) => (b.marketCapEok ?? 0) - (a.marketCapEok ?? 0) || a.code.localeCompare(b.code);
  const quality = checked.filter(c => !c.fails.length).sort(bySize);
  // 트렌드 칸: 보통주 · 시가총액 순위 안 · 가격 이력이 고르고 · 업종이 여덟 흐름 가운데 하나 (우량 네 조건은 보지 않음)
  const trendOk = c => c.trend && !notCommon(c.code, c.name) && (!c.endType || c.endType === 'stock') && c.capRank <= r.poolTop && c.history?.ok === true;
  const trendOnly = checked.filter(c => c.fails.length && trendOk(c)).sort(bySize);
  const picked = [...quality.slice(0, r.count).map(c => ({...c, kind: 'quality'})), ...trendOnly.slice(0, Math.max(0, r.count - quality.length)).map(c => ({...c, kind: 'trend'}))]
    .map((c, i) => ({...c, rank: i + 1, debtExempt: isFinancial(c.sector, r), score: null, parts: null}));
  const counts = {candidates: candidates.length, quality: quality.length, trendOnly: trendOnly.length, picked: picked.length, pickedQuality: picked.filter(c => c.kind === 'quality').length, pickedTrend: picked.filter(c => c.kind === 'trend').length,
    byTrend: Object.fromEntries(TREND_GROUPS.map(g => [g.label, picked.filter(c => c.trend?.id === g.id).length])), otherQuality: picked.filter(c => !c.trend).length,
    failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
  return {ok: picked.length === r.count, step: 0, rules: r, picked, checked, counts};
}
/**
 * selectIndustry36(candidates, rules = I36) → {ok, step, rules, picked:[…180], checked, counts}
 *   picked 마다 kind: 'quality'(우량 네 조건을 모두 넘음) | 'trend'(우량은 아니지만 시대 트렌드 업종) | 'profit'(둘 다 아니지만 최근 결산 흑자) | 'size'(업종 5곳을 채우려고 넣은 그 업종 큰 회사)
 *   industry: 합친 업종 이름(INDUSTRY_MERGE) · industryRank: 고른 업종 차례(5곳 시가총액 합이 큰 순)
 */
export function selectIndustry36(candidates, rules = I36) {
  const r = {...rules, step: 0};
  const checked = candidates.map(c => ({...c, fails: failsOf(c, r), trend: trendGroupOf(c.sector), industry: industryKeyOf(c.sector)}));
  const bySize = (a, b) => (b.marketCapEok ?? 0) - (a.marketCapEok ?? 0) || a.code.localeCompare(b.code);
  const base = c => !notCommon(c.code, c.name) && (!c.endType || c.endType === 'stock') && c.capRank <= r.poolTop && c.history?.ok === true && !!c.sector;
  const profit = c => { const m = c.metrics; return !!m && m.net > 0 && (isFinancial(c.sector, r) || m.op > 0); };
  const kindOf = c => !c.fails.length ? 'quality' : c.trend ? 'trend' : profit(c) ? 'profit' : 'size';
  const steps = (r.fill ?? ['quality-or-trend']).map(f => f === 'quality-or-trend' ? ['quality', 'trend'] : [f]);
  const pool = checked.filter(base).map(c => ({...c, kind: kindOf(c)}));
  const by = new Map(); for (const c of pool) { if (!by.has(c.industry)) by.set(c.industry, []); by.get(c.industry).push(c); }
  const full = [...by].map(([industry, list]) => {
    const picks = steps.flatMap(ks => list.filter(c => ks.includes(c.kind)).sort(bySize)).slice(0, r.perIndustry);
    return {industry, sectors: [...new Set(list.map(c => c.sector))], strict: list.filter(c => c.kind === 'quality' || c.kind === 'trend').length, picks, capEok: picks.reduce((t, c) => t + (c.marketCapEok ?? 0), 0)};
  });
  const filled = full.filter(x => x.picks.length === r.perIndustry).sort((a, b) => b.capEok - a.capEok || a.industry.localeCompare(b.industry));
  const chosen = filled.slice(0, r.industries);
  const picked = chosen.flatMap((ind, k) => ind.picks.map(c => ({...c, industryRank: k + 1}))).map((c, i) => ({...c, rank: i + 1, debtExempt: isFinancial(c.sector, r), score: null, parts: null}));
  const kinds = picked.reduce((m, c) => (m[c.kind] = (m[c.kind] ?? 0) + 1, m), {});
  const counts = {candidates: candidates.length, pool: pool.length, unknownIndustry: checked.filter(c => !c.sector).length, industriesInPool: full.length, industriesFilled: filled.length, industriesStrict: full.filter(x => x.strict >= r.perIndustry).length,
    industries: chosen.length, picked: picked.length, kinds, pickedQuality: kinds.quality ?? 0, pickedTrend: kinds.trend ?? 0,
    chosen: chosen.map((x, k) => ({rank: k + 1, industry: x.industry, sectors: x.sectors, strict: x.strict, filled: x.picks.filter(c => c.kind === 'profit' || c.kind === 'size').length, capEok: x.capEok})),
    notChosenFilled: filled.slice(r.industries).map(x => ({industry: x.industry, capEok: x.capEok})),
    short: full.filter(x => x.picks.length < r.perIndustry).sort((a, b) => b.picks.length - a.picks.length).map(x => ({industry: x.industry, have: x.picks.length})),
    failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
  return {ok: picked.length === r.count && chosen.length === r.industries, step: 0, rules: r, picked, checked, counts};
}
/**
 * selectSub365(candidates, rules = S365) → {ok, step, rules, picked:[…365], checked, counts}
 *   ① KRX 업종(ksic)마다 묶어 5곳을 채운 업종 ② KRX 업종으로 5곳이 안 찬 회사들은 네이버 업종(합친 이름)으로 다시 묶어 5곳을 채운 업종
 *   ①·② 를 합쳐 5곳 시가총액 합이 큰 차례로 73개 · picked 마다 industry(화면 이름) · industryRank · ksic · groupBy('ksic'|'naver')
 */
export function selectSub365(candidates, rules = S365) {
  const r = {...rules, step: 0};
  const checked = candidates.map(c => ({...c, fails: failsOf(c, r), trend: trendGroupOf(c.sector) ?? ksicTrendOf(c.ksic)}));
  const bySize = (a, b) => (b.marketCapEok ?? 0) - (a.marketCapEok ?? 0) || a.code.localeCompare(b.code);
  const base = c => !notCommon(c.code, c.name) && (!c.endType || c.endType === 'stock') && c.capRank <= r.poolTop && c.history?.ok === true && (!!c.ksic || !!c.sector);
  const profit = c => { const m = c.metrics; return !!m && m.net > 0 && (isFinancial(c.sector, r) || m.op > 0); };
  const kindOf = c => !c.fails.length ? 'quality' : c.trend ? 'trend' : profit(c) ? 'profit' : 'size';
  const steps = (r.fill ?? ['quality-or-trend']).map(f => f === 'quality-or-trend' ? ['quality', 'trend'] : [f]);
  const pool = checked.filter(base).map(c => ({...c, kind: kindOf(c)}));
  const groupsOf = (list, keyOf, labelOf, by) => {
    const m = new Map(); for (const c of list) { const k = keyOf(c); if (!k) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(c); }
    return [...m].map(([key, cs]) => { const picks = steps.flatMap(ks => cs.filter(c => ks.includes(c.kind)).sort(bySize)).slice(0, r.perIndustry);
      return {key, by, label: labelOf(cs[0]), names: [...new Set(cs.map(c => by === 'ksic' ? c.ksic : c.sector))], size: cs.length, strict: cs.filter(c => c.kind === 'quality' || c.kind === 'trend').length, picks, capEok: picks.reduce((t, c) => t + (c.marketCapEok ?? 0), 0)}; });
  };
  const first = groupsOf(pool, c => c.ksic ? 'k:' + normK(c.ksic) : null, c => ksicLabel(c.ksic), 'ksic');
  const fullFirst = first.filter(g => g.picks.length === r.perIndustry);
  const inFull = new Set(fullFirst.flatMap(g => g.picks.map(c => c.code)).concat(fullFirst.flatMap(g => pool.filter(c => c.ksic && 'k:' + normK(c.ksic) === g.key).map(c => c.code))));
  const rest = pool.filter(c => !inFull.has(c.code));
  const second = groupsOf(rest, c => c.sector ? 'n:' + industryKeyOf(c.sector) : null, c => industryKeyOf(c.sector), 'naver').filter(g => g.picks.length === r.perIndustry);
  // 화면 이름이 겹치면(KRX 짧은 이름 = 네이버 이름) 뒤 것에 갈래를 붙인다
  const all = [...fullFirst, ...second].sort((a, b) => b.capEok - a.capEok || a.key.localeCompare(b.key));
  const chosen = all.slice(0, r.industries), used = new Map();
  for (const g of chosen) { const n = used.get(g.label) ?? 0; used.set(g.label, n + 1); if (n) g.label = `${g.label} (${g.by === 'ksic' ? g.names[0] : '네이버 ' + g.names[0]})`; }
  const picked = chosen.flatMap((g, k) => g.picks.map(c => ({...c, industry: g.label, industryRank: k + 1, groupBy: g.by}))).map((c, i) => ({...c, rank: i + 1, debtExempt: isFinancial(c.sector, r), score: null, parts: null}));
  const kinds = picked.reduce((m, c) => (m[c.kind] = (m[c.kind] ?? 0) + 1, m), {});
  const counts = {candidates: candidates.length, pool: pool.length, withKsic: pool.filter(c => c.ksic).length, unknownIndustry: checked.filter(c => !c.sector && !c.ksic).length,
    groupsKsic: first.length, groupsKsicFilled: fullFirst.length, groupsNaverFilled: second.length, industries: chosen.length, picked: picked.length, kinds, pickedQuality: kinds.quality ?? 0, pickedTrend: kinds.trend ?? 0,
    chosen: chosen.map((g, k) => ({rank: k + 1, industry: g.label, by: g.by, names: g.names, size: g.size, strict: g.strict, filled: g.picks.filter(c => c.kind === 'profit' || c.kind === 'size').length, capEok: g.capEok})),
    notChosenFilled: all.slice(r.industries).map(g => ({industry: g.label, by: g.by, capEok: g.capEok})),
    short: first.filter(g => g.picks.length < r.perIndustry).sort((a, b) => b.picks.length - a.picks.length).slice(0, 60).map(g => ({industry: g.label, have: g.picks.length})),
    failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
  return {ok: picked.length === r.count && chosen.length === r.industries, step: 0, rules: r, picked, checked, counts};
}
const tally = xs => Object.fromEntries([...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]));
const fmt = (v, d = 1) => v == null ? '없음' : Number(v).toFixed(d);
/** 화면·기록용 한 줄(쉬운 말) */
export const whyLine = c => c.metrics ? `${c.metrics.fiscalYear ?? '최근'} 결산 ROE ${fmt(c.metrics.roe)}% · ${c.debtExempt ? '금융회사(빚 기준 제외)' : `부채비율 ${fmt(c.metrics.debt, 0)}%`} · 시가총액 ${c.capRank}위` : `결산 자료 없음 · 시가총액 ${c.capRank}위`;

/** 화면에 적을 「이 52곳은 어떻게 골랐나」(실제로 쓴 규칙 단계 그대로 · 쉬운 말) */
export function howLines(r = QUALITY52) {
  if (r.mix === 'sub-industry') return [`시가총액 ${r.poolTop}위 안(코스피·코스닥 보통주 · 가격 이력이 고른 회사)에서 고름`, `업종은 한국거래소 업종(한국표준산업분류 · 예: 반도체 제조업 · 전자부품 제조업)으로 잘게 나눔 · 그 업종으로 ${r.perIndustry}곳이 안 차는 회사는 네이버 증권 업종으로 한 번 더 묶음`,
    `업종마다 ${r.perIndustry}곳: 우량주(${r.profitYears}년 연속 흑자 · ROE ${r.roeMinPct}% 이상 · 부채비율 ${r.debtMaxPct}% 이하 · 은행·보험 같은 금융회사는 빚 기준 빼고) 또는 시대 트렌드 업종(${(r.trendGroups ?? TREND_GROUPS).map(g => g.label).join(' · ')}) 회사를 시가총액 큰 순으로 · 모자라면 흑자 회사(「흑자」) · 그래도 모자라면 그 업종 큰 회사(「채움」)`,
    `${r.perIndustry}곳 시가총액 합이 큰 ${r.industries}개 업종 · 모두 ${r.count}곳 · 업종 짧은 이름과 시대 트렌드 업종은 ATLAS 가 정한 것`];
  if (r.mix === 'industry') return [`시가총액 ${r.poolTop}위 안(코스피·코스닥 보통주 · 가격 이력이 고른 회사)에서 고름`, `업종(네이버 증권 업종)마다 ${r.perIndustry}곳: 우량주(${r.profitYears}년 연속 흑자 · ROE ${r.roeMinPct}% 이상 · 부채비율 ${r.debtMaxPct}% 이하 · 은행·보험 같은 금융회사는 빚 기준 빼고) 또는 시대 트렌드 업종(${(r.trendGroups ?? TREND_GROUPS).map(g => g.label).join(' · ')}) 회사를 시가총액 큰 순으로`,
    `모자라면 최근 결산 흑자 회사(「흑자」), 그래도 모자라면 그 업종의 큰 회사(「채움」)로 채움 · 작은 업종 몇 개는 가까운 업종과 합침(보험 · 자동차·부품 · 인터넷·IT서비스 · 식품·담배 · 은행·카드 · 유통 · 운송 · 철강·금속 · 통신 · 전력·가스)`,
    `${r.perIndustry}곳 시가총액 합이 큰 ${r.industries}개 업종 · 모두 ${r.count}곳 · 업종을 합친 것과 시대 트렌드 업종은 ATLAS 가 정한 것`];
  if (r.mix === 'quality-first') return [`시가총액 ${r.poolTop}위 안(코스피·코스닥 보통주)에서 고름`, `우량주: ${r.profitYears}년 연속 흑자 · ROE ${r.roeMinPct}% 이상 · 부채비율 ${r.debtMaxPct}% 이하(은행·보험 같은 금융회사는 빼고 봄)를 모두 넘은 회사는 전부 넣음`,
    `시대 트렌드: ${(r.trendGroups ?? TREND_GROUPS).map(g => g.label).join(' · ')} 업종의 회사로 남은 자리를 시가총액 큰 순으로 채움(우량 조건은 안 봄)`, `모두 ${r.count}곳 · 어떤 업종을 시대 트렌드로 볼지는 ATLAS 가 정한 것`];
  return [`시가총액 ${r.poolTop}위 안(코스피·코스닥 보통주)`, `${r.profitYears === 1 ? '최근 결산' : `${r.profitYears}년 연속`} 흑자`, `부채비율 ${r.debtMaxPct}% 이하(은행·보험 같은 금융회사는 빼고 봄)`, `ROE ${r.roeMinPct}% 이상`,
    r.order === 'size' ? `위 조건을 모두 넘은 회사 가운데 시가총액 큰 순으로 ${r.count}곳 · 한 업종 ${r.perSectorMax}곳까지` : `점수 순(ROE ${Math.round(r.weights.roe * 100)}% · 빚 적음 ${Math.round(r.weights.debt * 100)}% · 회사 크기 ${Math.round(r.weights.size * 100)}%) · 한 업종 ${r.perSectorMax}곳까지`];
}

// ---------- 새 입력 만들기 ----------
/**
 * buildNextInput(base, picked, {histories, now, proposalId, rules}) → 새 input(52종목)
 *   · 지금 52종목에 이미 있는 종목은 그 가격 기록(검토된 종가 포함)을 그대로 이어 쓴다 — 옛 채점과 숫자가 어긋나지 않게
 *   · 새 종목은 받은 일봉(네이버 fchart · 수정주가)을 달력 첫날부터 넣는다
 */
export function buildNextInput(base, picked, {histories, now, proposalId, rules = QUALITY52}) {
  const sessions = base.calendar.sessions, first = sessions[0];
  const assets = picked.map((c, i) => {
    const old = base.assets.find(a => a.code === c.code);
    const prices = old ? old.prices : histories[c.code].rows.filter(r => r.date >= first).map(r => ({date: r.date, close: r.close, open: r.open, high: r.high, low: r.low, volume: r.volume}));
    return {id: i + 1, code: c.code, name: c.name, sector: c.sector, ...(c.industry ? {industry: c.industry} : {}), ...(c.ksic ? {ksic: c.ksic} : {}), leaderStatus: `${rules.label} · ${rules.version} · ${proposalId} 선정 ${i + 1}위 · ${whyLine(c)}`,
      priceSource: old ? {...old.priceSource, carriedFrom: 'u1-sector52'} : {provider: 'NAVER', url: histories[c.code].url, retrievedAt: histories[c.code].fetchedAt, quality: 'single_source', note: '종목 고를 때 받은 일봉 이력(네이버 · 수정주가) · 이후는 매일 수집기가 15:30 종가로 이어 붙임'},
      quality: {rules: rules.version, rank: i + 1, score: Number.isFinite(c.score) ? Number(c.score.toFixed(4)) : null, capRank: c.capRank, marketCapEok: c.marketCapEok, fiscalYear: c.metrics?.fiscalYear ?? null, roe: c.metrics?.roe ?? null, debt: c.debtExempt ? null : c.metrics?.debt ?? null, debtExempt: c.debtExempt, op: c.metrics?.op ?? null, net: c.metrics?.net ?? null, market: c.market,
        ...(c.kind ? {kind: c.kind, trend: c.trend ? {id: c.trend.id, label: c.trend.label} : null, fails: c.kind === 'quality' ? [] : c.fails.map(x => x.replace(/\(.*\)/, ''))} : {})},
      prices};
  });
  const lastDates = assets.map(a => a.prices.filter(p => p.close > 0).at(-1)?.date).sort();
  const asOf = lastDates[0];
  return {...base, actualAsOf: asOf, retrievedAt: now.slice(0, 10), informationAsOf: now, assets,
    universe: {id: proposalId, rules: rules.version, step: rules.step ?? 0, label: rules.label, says: rules.says, how: howLines(rules), selectedAt: now, previous: base.universe?.id ?? 'u1-sector52'},
    priceRevisions: [], priceBasisReview: {asOf, note: '종목 바꾸기로 새로 시작 · 이어 쓴 종목의 옛 검토 기록은 옛 입력 보관본에 그대로 있음', carriedCodes: assets.filter(a => a.priceSource.carriedFrom).map(a => a.code)}};
}
export const inputSHA = input => sha(JSON.stringify(input));
