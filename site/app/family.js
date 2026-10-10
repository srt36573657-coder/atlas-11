/* ATLAS 11 · 큰 갈래 — 업종 73개를 큰 갈래 12개로 묶는 표 (화면에서만 묶음 · 판 자료의 업종 73개는 그대로)
   2026-10-05 10:24 사장님 「잡스라면 … 큰틀에서 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」
     · 19번 「73칸 위에 큰 갈래 층」 — 업종 탭 맨 위 갈래 단추(누르면 그 갈래 업종만)
     · 20번 「불장 11칸을 큰 흐름으로」 — 불장 탭에서 같은 갈래 업종을 한 장에
   갈래 이름과 나눔은 ATLAS 가 업종 이름을 보고 정한 것이다([가정] — 판에 큰 갈래 칸이 없다).
   모르는 업종 이름은 「그 밖」으로 간다 · tests/atlas11/family.test.mjs 가 지금 판의 업종이 모두 갈래를 찾는지 본다 */

import {place} from './util.js';

export const FAMILIES = [
  {id: 'semi', label: '반도체', prefix: '반도체', names: []},
  {id: 'elec', label: '전기·전자', names: ['전기 부품', '휴대폰 부품', '전자장비', '전선·전기장비', '전자부품', '통신장비', '디스플레이 장비', '디스플레이']},
  {id: 'soft', label: '인터넷·소프트웨어', names: ['소프트웨어', 'IT 시스템 통합', 'IT서비스', '인터넷 플랫폼']},
  {id: 'media', label: '통신·미디어·게임', names: ['통신', '방송', '콘텐츠 제작', '연예 기획사', '게임', '사업 서비스·광고']},
  {id: 'energy', label: '2차전지·에너지', names: ['2차전지', '2차전지 장비', '에너지 장비', '전력기기', '전력·가스', '정유·가스']},
  {id: 'mat', label: '소재', names: ['석유화학', '정밀화학', '화학', '철강', '비철금속', '종이·포장재']},
  {id: 'mach', label: '기계·조선·방산', names: ['방산', '항공·우주', '일반 기계', '기계 부품', '로봇·건설기계', '조선', '조선 기자재']},
  {id: 'auto', label: '자동차·운송', names: ['자동차', '자동차부품', '해운', '물류·운송', '항공']},
  {id: 'build', label: '건설', names: ['건설', '건설 엔지니어링', '건축자재', '시멘트']},
  {id: 'bio', label: '바이오·헬스', names: ['헬스케어 기술', '바이오 도구·서비스', '제약', '의료용품', '병원·헬스 서비스', '의료기기', '신약 개발', '바이오 의약품']},
  {id: 'fin', label: '금융·지주', names: ['창투·캐피탈', '증권', '은행·카드', '보험', '복합기업']},
  {id: 'cons', label: '소비·유통', names: ['가전·생활용품', '식품', '음료', '가공식품', '의류·패션', '화장품', '유통', '호텔·레저', '상사']},
];
export const OTHER = {id: 'etc', label: '그 밖', names: []};

/** 미국 판 — 업종 이름(네이버 증권 해외주식 업종 · 한국말)이 한국 판 이름표와 달라 낱말로 가른다(2026-10-05 18:02 「미국 주식도 같은 개념으로」)
   중국 · 일본 · 베트남 판(2026-10-07 05:25 「미국 장 처럼」)도 같은 네이버 해외 업종 이름이라 이 표를 함께 쓴다 — 그 판에만 있는 이름(항만 · 공항 · 민자 발전 · 증류주 · 장난감 …)을 낱말로 더함
   앞 줄이 먼저(항공사 → 자동차·운송 · 항공우주 → 기계·조선·방산) · 한 글자 낱말(「금」)은 「금융」과 섞여 쓰지 않음 [판단]
   2026-10-07: 이름이 꼭 「항공」 · 「금」 하나뿐인 업종만 따로(^…$) · 철 및 강철 · 오일 관련 · 핀테크 · 암호화폐 · 제화도 갈래를 찾게 함(그 전에는 「그 밖」) */
export const US_WORDS = [
  ['semi', /반도체/],
  ['bio', /제약|바이오|생명\s?공학|생명\s?과학|의료|헬스|건강\s?관리|병원|진단|의약|약국/],
  ['fin', /은행|보험|증권|금융|투자|자산\s?(운용|관리)|리츠|REIT|부동산|카드|대출|신용|거래소|저축|지주|핀테크|암호\s?화폐/], // REIT — 「상업용 · 주거용 · 특수 REITs」가 아래 「IT」 낱말에 걸려 인터넷·소프트웨어로 가던 것(2026-10-10 18:22 다섯 팀 전체 검토 · 구글팀)
  ['auto', /자동차|항공사|항공\s?(운송|화물)|운송|물류|철도|트럭|해운|택배|배송|항만|공항|고속도로|^항공$/],
  ['energy', /석유|천연\s?가스|가스|에너지|전력|유틸리티|원자력|우라늄|석탄|재생|태양광|풍력|배터리|2차\s?전지|수도|발전|오일/],
  ['mach', /기계|항공\s?우주|우주|방산|국방|조선|중장비|로봇|자동화|산업\s?(재|장비|기계)|복합\s?기업/],
  ['elec', /전자|전기|통신\s?장비|컴퓨터|하드웨어|휴대폰|디스플레이|광학|계측|측정|부품|사무\s?기기/],
  ['soft', /소프트웨어|(?<![A-Za-z])IT(?![a-z])|인터넷|온라인|데이터|클라우드|정보\s?기술|전산|플랫폼/], // 「IT」는 홀로 쓴 낱말만(REITs 속 IT 아님)
  ['media', /통신|무선|미디어|방송|엔터|게임|광고|출판|영화|음악|콘텐츠/],
  ['mat', /화학|금속|광업|광산|철강|알루미늄|구리|귀금속|종이|포장|목재|비료|소재|시멘트|유리|채굴|타이어|고무|강철|^금$/],
  ['build', /건설|건축|주택|엔지니어링|토목/],
  ['cons', /식품|음료|담배|주류|의류|신발|섬유|화장품|생활|가정|개인\s?용품|소매|유통|백화점|할인점|외식|레스토랑|호텔|여행|레저|카지노|교육|가구|가전|소비|전문점|쇼핑|증류주|포도주|양조|장난감|어린이|오락|직물|가죽|농업|어업|제화/],
].map(([id, re]) => [FAMILIES.find(f => f.id === id), re]);

const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const byName = new Map(FAMILIES.flatMap(f => f.names.map(n => [norm(n), f])));

/** 미국 판 갈래 이름 — 한국 판 이름이 미국 업종과 맞지 않는 셋만(미국 「에너지」 갈래는 석유·가스·전력이 대부분 · 조선은 거의 없음) */
const US_LABEL = {energy: '에너지·전력', mach: '기계·항공우주·방산', fin: '금융·부동산'};
const usFam = new Map(FAMILIES.map(f => [f.id, Object.freeze({...f, label: US_LABEL[f.id] ?? f.label})]));

/** 업종 이름 → 큰 갈래(이름이 꼭 맞는 것 먼저 · 「반도체」로 시작하면 반도체 · 미국 판이면 낱말로 · 그 밖) */
export function familyOf(label) {
  const n = norm(label);
  if (place.id !== 'kr') { const f = US_WORDS.find(([, re]) => re.test(n))?.[0]; return f ? usFam.get(f.id) : OTHER; } // 미국 · 중국 · 일본 · 베트남 판
  return byName.get(n) ?? FAMILIES.find(f => f.prefix && n.startsWith(f.prefix)) ?? OTHER;
}

/** 업종 목록(판 차례 그대로) → 큰 갈래 묶음 [{fam, groups}] · 갈래 차례 = 그 갈래의 가장 앞 업종 차례 */
export function groupByFamily(groups) {
  const out = new Map();
  for (const g of groups) { const f = familyOf(g.label); if (!out.has(f.id)) out.set(f.id, {fam: f, groups: []}); out.get(f.id).groups.push(g); }
  return [...out.values()];
}

/** 가장 많이 오른 순 — 지난 20거래일 변화가 큰 차례(값이 없으면 맨 뒤 · 같으면 code/id 차례)
   2026-10-05 11:36 사장님 「출목표 탭을 클릭하면 가장 상승한순으로 배치해줘」 → 「모든 배치가 가장 많이 상승한순으로 배치해줘」 */
export const riseDesc = (a, b) => (Number.isFinite(b?.change20) ? b.change20 : -Infinity) - (Number.isFinite(a?.change20) ? a.change20 : -Infinity)
  || String(a?.code ?? a?.id ?? '').localeCompare(String(b?.code ?? b?.id ?? ''));
/** 평균(값 있는 것만 · 없으면 null) */
export const meanOf = xs => { const v = xs.filter(Number.isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
/** 큰 갈래를 가장 많이 오른 순으로 — 갈래 평균 = 그 갈래 업종들의 지난 20거래일 평균을 다시 평균 낸 값 · 갈래 안 업종도 오른 순 */
export function familiesByRise(groups) {
  return groupByFamily(groups).map(f => ({fam: f.fam, groups: [...f.groups].sort(riseDesc), avg: meanOf(f.groups.map(g => g.change20))}))
    .sort((a, b) => (Number.isFinite(b.avg) ? b.avg : -Infinity) - (Number.isFinite(a.avg) ? a.avg : -Infinity) || a.fam.id.localeCompare(b.fam.id));
}
