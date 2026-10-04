/**
 * ATLAS 11 · 업종 묶음 · 요즘 불장 업종 11개 · 다음 불장 후보 22곳 — 판을 만들 때 지난 종가로 센다(예측 없음)
 *   2026-10-04 21:04 사장님 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
 *   업종 = 회사마다 붙은 네이버 증권 업종 이름(input.assets[].sector) 그대로 — 화면에는 짧은 이름(INDUSTRY_LABELS)을 쓰고 원래 이름도 함께 둔다
 *   업종의 「20거래일 오름」 = 그 업종 회사들의 지난 20거래일 종가 변화(21번째 전 거래일 종가 → 마지막 종가)를 평균한 값
 *   요즘 불장 업종 = 20거래일 오름이 0보다 큰 업종 가운데 큰 순으로 11개
 *   다음 불장 후보 = 불장 11개 업종 밖의 회사 가운데 지난 20거래일 동안 오른 회사를 많이 오른 순으로 22곳(한 업종 2곳까지)
 *   모두 지난 종가로 센 차례일 뿐이다 — 앞날 값(확률·목표 값·방향)은 만들지 않는다.
 */
import {createHash} from 'node:crypto';

const norm = s => String(s ?? '').replace(/\s+/g, '');
/** 네이버 업종 이름 → 화면에 쓰는 짧은 이름(뜻은 바꾸지 않고 줄이기만) */
const LABELS = {
  '반도체와반도체장비': '반도체', '전자장비와기기': '전자장비·부품', '전자제품': '전자제품', '디스플레이패널': '디스플레이', '디스플레이장비및부품': '디스플레이 장비·부품', '통신장비': '통신장비', '핸드셋': '휴대폰', '컴퓨터와주변기기': '컴퓨터·주변기기', '사무용전자제품': '사무용 전자제품',
  '전기제품': '2차전지·전기제품', '전기장비': '전력기기·전선', '전기유틸리티': '전력', '가스유틸리티': '가스', '복합유틸리티': '복합 유틸리티', '에너지장비및서비스': '에너지 장비', '석유와가스': '석유·가스',
  '조선': '조선', '우주항공과국방': '방산·우주', '기계': '기계', '건설': '건설', '건축자재': '건축자재', '건축제품': '건축제품', '복합기업': '복합기업', '무역회사와판매업체': '상사', '상업서비스와공급품': '사업 서비스',
  '해운사': '해운', '항공화물운송과물류': '물류', '항공사': '항공', '도로와철도운송': '육상 운송', '운송인프라': '운송 시설',
  '제약': '제약', '생물공학': '바이오', '건강관리장비와용품': '의료기기', '생명과학도구및서비스': '바이오 도구·서비스', '건강관리업체및서비스': '병원·헬스 서비스', '건강관리기술': '헬스케어 기술',
  '화장품': '화장품', '식품': '식품', '음료': '음료', '담배': '담배', '섬유,의류,신발,호화품': '의류·신발', '가정용기기와용품': '생활용품', '가구': '가구', '레저용장비와제품': '레저용품',
  '호텔,레스토랑,레저': '호텔·레저', '백화점과일반상점': '백화점·마트', '인터넷과카탈로그소매': '온라인 쇼핑', '전문소매': '전문 소매', '판매업체': '유통', '교육서비스': '교육',
  '게임엔터테인먼트': '게임', '방송과엔터테인먼트': '방송·엔터', '광고': '광고', '출판': '출판', '양방향미디어와서비스': '인터넷 플랫폼', 'IT서비스': 'IT서비스', '소프트웨어': '소프트웨어',
  '다각화된통신서비스': '통신', '무선통신서비스': '무선통신', '은행': '은행', '증권': '증권', '손해보험': '손해보험', '생명보험': '생명보험', '카드': '카드', '기타금융': '기타 금융', '창업투자': '창업투자',
  '자동차': '자동차', '자동차부품': '자동차부품', '화학': '화학', '철강': '철강', '비철금속': '비철금속', '종이와목재': '종이·목재', '포장재': '포장재',
  // 합친 업종(lib/atlas11/universe.mjs INDUSTRY_MERGE) — 이름이 곧 화면 이름
  '보험': '보험', '자동차·부품': '자동차·부품', '인터넷·IT서비스': '인터넷·IT서비스', '식품·담배': '식품·담배', '은행·카드': '은행·카드', '유통': '유통', '운송': '운송', '철강·금속': '철강·금속', '통신': '통신', '전력·가스': '전력·가스'
};
export const INDUSTRY_LABELS = Object.freeze(Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [norm(k), v])));

/** 업종 이름 → {id, label, industry(원래 이름)} · 표에 없는 업종은 원래 이름 그대로 */
export function industryOf(sector) {
  if (!sector) return {id: 'none', label: '업종 모름', industry: null};
  return {id: 'i' + createHash('sha1').update(norm(sector)).digest('hex').slice(0, 8), label: INDUSTRY_LABELS[norm(sector)] ?? String(sector), industry: String(sector)};
}

/** 회사 한 곳의 지난 20거래일 종가 변화(21개 종가가 다 있을 때만) */
export const change20Of = closes => Array.isArray(closes) && closes.length === 21 && closes[0] > 0 && closes[20] > 0 ? Number((closes[20] / closes[0] - 1).toFixed(6)) : null;

/**
 * companies: [{code, name, group:{id,label,industry}, kind, capRank, change20, cFrom, date}]
 * 반환: {groups, hot, next} — groups 는 20거래일 오름이 큰 업종부터(셀 수 없는 업종은 맨 끝) · 업종 안은 시가총액 큰 순(없으면 들어온 차례)
 */
export function industryBoard(companies, {hotCount = 11, nextCount = 22, perIndustry = 2} = {}) {
  const mean = xs => xs.length ? Number((xs.reduce((t, x) => t + x, 0) / xs.length).toFixed(6)) : null;
  const by = new Map();
  companies.forEach((c, k) => { const g = c.group ?? industryOf(null); if (!by.has(g.id)) by.set(g.id, {id: g.id, label: g.label, industry: g.industry, list: []}); by.get(g.id).list.push({c, k}); });
  const groups = [...by.values()].map(g => {
    const list = g.list.sort((x, y) => (x.c.capRank ?? Infinity) - (y.c.capRank ?? Infinity) || x.k - y.k).map(x => x.c);
    const ch = list.map(c => c.change20).filter(v => typeof v === 'number' && Number.isFinite(v));
    const froms = list.map(c => c.cFrom).filter(Boolean).sort(), tos = list.map(c => c.date).filter(Boolean).sort();
    return {id: g.id, label: g.label, industry: g.industry, count: list.length, quality: list.filter(c => c.kind === 'quality').length, trend: list.filter(c => c.kind === 'trend').length, profit: list.filter(c => c.kind === 'profit').length, size: list.filter(c => c.kind === 'size').length, codes: list.map(c => c.code),
      change20: mean(ch), measured: ch.length, up: ch.filter(v => v > 0).length, from: froms[0] ?? null, to: tos.at(-1) ?? null};
  }).sort((a, b) => (a.change20 == null) - (b.change20 == null) || (b.change20 ?? 0) - (a.change20 ?? 0) || a.label.localeCompare(b.label, 'ko'));
  const hotGroups = groups.filter(g => g.change20 != null && g.change20 > 0).slice(0, hotCount);
  const hotIds = new Set(hotGroups.map(g => g.id)), label = new Map(groups.map(g => [g.id, g.label])), taken = new Map(), nextItems = [];
  for (const c of companies.filter(c => !hotIds.has(c.group?.id) && typeof c.change20 === 'number' && c.change20 > 0).sort((a, b) => b.change20 - a.change20 || a.code.localeCompare(b.code))) {
    const n = taken.get(c.group?.id) ?? 0; if (n >= perIndustry) continue;
    taken.set(c.group?.id, n + 1); nextItems.push({code: c.code, name: c.name, groupId: c.group?.id ?? null, groupLabel: label.get(c.group?.id) ?? null, change20: c.change20, kind: c.kind ?? null});
    if (nextItems.length === nextCount) break;
  }
  groups.forEach((g, i) => { g.rank = i + 1; g.hot = hotIds.has(g.id); });
  return {groups,
    hot: {count: hotGroups.length, want: hotCount, days: 20, items: hotGroups.map(g => ({id: g.id, label: g.label, change20: g.change20, up: g.up, measured: g.measured, from: g.from, to: g.to}))},
    next: {count: nextItems.length, want: nextCount, perIndustry, days: 20, items: nextItems}};
}
