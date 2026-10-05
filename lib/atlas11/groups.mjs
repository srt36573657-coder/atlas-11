/**
 * ATLAS 11 · 업종 묶음(설명용 아홉 묶음) — 원형 지도·원인 분석의 묶음을 「지금 보는 52종목」에 맞춰 만든다.
 *
 * 2026-10-04 00:51 사장님 「52개 업종에서 찾는 게 아니라 오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경」 →
 *   종목이 바뀌어도 묶음이 따라오게 한다. 옛 52종목(업종마다 대표 1종목)은 예전 묶음(FROZEN_GROUPS)을 한 글자도 바꾸지 않고 그대로 쓴다.
 *   새 종목은 네이버 업종 이름으로 아홉 묶음 중 하나에 넣는다(아래 SECTOR_GROUP · 없으면 낱말로 짐작 · 그래도 없으면 소비재·유통).
 * 묶음은 설명·배치용이며 전망 숫자에 들어가지 않는다(전망의 52종목 폭·평균은 묶음과 무관).
 */

/** 옛 52종목 묶음 — 2026-09-17부터 쓴 그대로(순서 포함) · 바꾸지 않는다 */
export const FROZEN_GROUPS = Object.freeze([
  {id: 'semi', name: '반도체·전자', codes: ['005930', '009150', '066570', '034220', '018260', '010170']},
  {id: 'chem', name: '배터리·화학·소재', codes: ['373220', '051910', '009830', '005490', '010130', '002380']},
  {id: 'auto', name: '자동차·운송', codes: ['005380', '012330', '086280', '003490', '011200']},
  {id: 'fin', name: '금융', codes: ['105560', '032830', '000810', '138040', '029780']},
  {id: 'heavy', name: '조선·기계·방산·건설', codes: ['329180', '034020', '012450', '010120', '000720']},
  {id: 'bio', name: '바이오·헬스', codes: ['207940', '196170', '028300', '226950', '214370']},
  {id: 'net', name: '통신·인터넷·게임·엔터', codes: ['035420', '017670', '030200', '259960', '352820', '030000']},
  {id: 'cons', name: '소비재·유통', codes: ['033780', '003230', '021240', '004170', '278470', '257720', '111770', '035250']},
  {id: 'util', name: '에너지·유틸리티·지주·상사', codes: ['034730', '015760', '036460', '028260', '047050', '012750']},
].map(g => Object.freeze({...g, codes: Object.freeze([...g.codes])})));
export const GROUP_IDS = Object.freeze(FROZEN_GROUPS.map(g => g.id));
const NAME = Object.fromEntries(FROZEN_GROUPS.map(g => [g.id, g.name]));

/** 네이버 업종 이름 → 묶음 (띄어쓰기는 빼고 비교) · 옛 52종목이 들어 있던 묶음과 같게 맞췄다 */
export const SECTOR_GROUP = Object.freeze({
  semi: ['반도체와반도체장비', '디스플레이장비및부품', '디스플레이패널', '전자장비와기기', '전자제품', '핸드셋', '컴퓨터와주변기기', '사무용전자제품', '통신장비', 'IT서비스', '전자부품'],
  chem: ['전기제품', '화학', '철강', '비철금속', '금속과광물', '포장재', '종이와목재', '건축자재', '에너지장비및서비스'],
  auto: ['자동차', '자동차부품', '타이어', '항공사', '항공화물운송과물류', '해운사', '도로와철도운송', '운송인프라'],
  fin: ['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자', '부동산'],
  heavy: ['조선', '기계', '우주항공과국방', '건설', '전기장비', '건축제품'],
  bio: ['제약', '생물공학', '건강관리장비와용품', '건강관리업체및서비스', '생명과학도구및서비스', '건강관리기술'],
  net: ['양방향미디어와서비스', '무선통신서비스', '다각화된통신서비스', '게임엔터테인먼트', '방송과엔터테인먼트', '광고', '소프트웨어', '출판'],
  cons: ['식품', '음료', '담배', '화장품', '가정용기기와용품', '가정용품', '섬유,의류,신발,호화품', '호텔,레스토랑,레저', '백화점과일반상점', '인터넷과카탈로그소매', '레저용장비와제품', '판매업체', '교육서비스', '다각화된소비자서비스', '가구', '문구류'],
  util: ['석유와가스', '전기유틸리티', '가스유틸리티', '복합유틸리티', '수도유틸리티', '복합기업', '무역회사와판매업체', '상업서비스와공급품'],
});
const BY_SECTOR = new Map(Object.entries(SECTOR_GROUP).flatMap(([id, names]) => names.map(n => [n.replace(/\s+/g, ''), id])));
const GUESS = [[/금융|은행|보험|증권|카드|투자/, 'fin'], [/제약|바이오|생물|건강|의료/, 'bio'], [/반도체|전자|디스플레이|컴퓨터|통신장비|IT/, 'semi'], [/화학|철강|금속|소재|종이|포장/, 'chem'],
  [/자동차|운송|항공사|해운|물류|철도/, 'auto'], [/조선|기계|국방|우주|건설|전기장비/, 'heavy'], [/미디어|통신|게임|엔터|광고|소프트|출판/, 'net'], [/유틸|가스|석유|에너지|무역|복합/, 'util']];

/** 업종 이름 하나 → 묶음 id (표에 없으면 낱말로 짐작 · 그래도 없으면 cons) */
export function groupIdOfSector(sector) {
  const s = String(sector ?? '').replace(/\s+/g, '');
  if (BY_SECTOR.has(s)) return BY_SECTOR.get(s);
  for (const [re, id] of GUESS) if (re.test(s)) return id;
  return 'cons';
}

/** 지금 보는 종목들(assets: [{code, sector}] · 순서 = 화면 순서)의 묶음. 옛 52종목 그대로면 옛 묶음을 그대로 돌려준다. */
export function groupsFor(assets) {
  const codes = assets.map(a => a.code), frozen = new Set(FROZEN_GROUPS.flatMap(g => g.codes));
  if (codes.length === frozen.size && codes.every(c => frozen.has(c))) return FROZEN_GROUPS.map(g => ({id: g.id, name: g.name, codes: [...g.codes]}));
  const by = new Map(GROUP_IDS.map(id => [id, []]));
  for (const a of assets) by.get(groupIdOfSector(a.sector)).push(a.code);
  return GROUP_IDS.filter(id => by.get(id).length).map(id => ({id, name: NAME[id], codes: by.get(id)}));
}

/** code → 묶음 찾기 함수. assets 를 주면 그 종목들의 업종으로, 없으면 옛 묶음으로 찾는다(옛 기록 채점용). */
export function makeGroupOf(assets = []) {
  const map = new Map();
  for (const g of FROZEN_GROUPS) for (const c of g.codes) map.set(c, {id: g.id, name: g.name});
  for (const g of groupsFor(assets.length ? assets : [])) for (const c of g.codes) map.set(c, {id: g.id, name: g.name});
  return code => map.get(code) ?? null;
}
