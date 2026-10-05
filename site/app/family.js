/* ATLAS 11 · 큰 갈래 — 업종 73개를 큰 갈래 12개로 묶는 표 (화면에서만 묶음 · 판 자료의 업종 73개는 그대로)
   2026-10-05 10:24 사장님 「잡스라면 … 큰틀에서 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」
     · 19번 「73칸 위에 큰 갈래 층」 — 업종 탭 맨 위 갈래 단추(누르면 그 갈래 업종만)
     · 20번 「불장 11칸을 큰 흐름으로」 — 불장 탭에서 같은 갈래 업종을 한 장에
   갈래 이름과 나눔은 ATLAS 가 업종 이름을 보고 정한 것이다([가정] — 판에 큰 갈래 칸이 없다).
   모르는 업종 이름은 「그 밖」으로 간다 · tests/atlas11/family.test.mjs 가 지금 판의 업종이 모두 갈래를 찾는지 본다 */

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

const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const byName = new Map(FAMILIES.flatMap(f => f.names.map(n => [norm(n), f])));

/** 업종 이름 → 큰 갈래(이름이 꼭 맞는 것 먼저 · 「반도체」로 시작하면 반도체 · 그 밖) */
export function familyOf(label) {
  const n = norm(label);
  return byName.get(n) ?? FAMILIES.find(f => f.prefix && n.startsWith(f.prefix)) ?? OTHER;
}

/** 업종 목록(판 차례 그대로) → 큰 갈래 묶음 [{fam, groups}] · 갈래 차례 = 그 갈래의 가장 앞 업종 차례 */
export function groupByFamily(groups) {
  const out = new Map();
  for (const g of groups) { const f = familyOf(g.label); if (!out.has(f.id)) out.set(f.id, {fam: f, groups: []}); out.get(f.id).groups.push(g); }
  return [...out.values()];
}
