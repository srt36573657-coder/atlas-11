/**
 * ATLAS 11 · 「불장 닮은 7곳」과 저녁 7시 「들고 남」 — 지난 기록으로만 센다(예측 없음)
 *   2026-10-05 05:03 사장님 「불장에 공통된점을 찾아 아직 불징이 아닌 종목 7개를 … 매일 저녁 7시에 불장에서 내오든 불장같은 것이 불장이 된것이든 즉 여러 주건들에 이동이 내영되게 하라」
 *   05:07 「해」 — 05:05 그림 카드대로: 이름은 「불장 닮은 7곳」(지난 사실) · 「곧 될 가능성」 같은 앞날 말과 숫자는 쓰지 않는다
 *
 *   ① 불장 회사들의 공통점 — 아래 TRAITS(지난 종가 · 수급 · 기사로 셀 수 있는 아홉 가지) 가운데
 *      불장 업종 회사의 절반 넘게 가졌고(MIN_SHARE) 나머지 회사보다 10%p 넘게 많이 가진 것(MIN_GAP)만 「공통점」으로 센다.
 *      그런 것이 셋보다 적으면 불장 쪽이 더 많이 가진 차이가 큰 차례로 셋까지 채운다(채웠다고 적는다).
 *   ② 닮은 7곳 — 불장 업종 밖 회사마다 공통점을 몇 가지 가졌나 센다 → 많이 가진 차례(같으면 지난 20거래일 많이 오른 차례 · 그다음 종목 번호)
 *      한 업종 2곳까지 · 공통점의 절반 넘게 가진 회사만(모자라면 7곳보다 적게)
 *   ③ 들고 남 — 거래일 저녁 7시 실행이 그날 판을 기록(public/data/atlas11/evening/<묶음>/<종가 날짜>.json · 한 번 쓰면 고치지 않음)하고
 *      바로 앞 기록과 맞대어 본다: 불장에 새로 든 업종 · 빠진 업종 · 7곳에서 불장이 된 회사 · 7곳에 새로 든 회사 · 빠진 회사 · 22곳에 들고 난 회사
 *      묶음(180곳 → 365곳 같은)이 바뀌면 업종이 달라 견주지 않는다(묶음마다 기록 폴더가 따로).
 */
const finite = x => typeof x === 'number' && Number.isFinite(x);
const FLAT = 0.001; // ±0.1% 안쪽은 보합(출목표 road.js 와 같은 셈)

/** 지난 20거래일(21개 종가) 가운데 오른 날 수 · 최근 5거래일 변화 */
export const upsOf = cs => Array.isArray(cs) && cs.length >= 21 && cs.every(v => finite(v) && v > 0) ? cs.slice(1).filter((v, i) => v / cs[i] - 1 > FLAT).length : null;
export const r5Of = cs => Array.isArray(cs) && cs.length >= 6 && finite(cs.at(-1)) && finite(cs.at(-6)) && cs.at(-6) > 0 ? cs.at(-1) / cs.at(-6) - 1 : null;

/** 공통점 후보 아홉 — of(회사) = true(가짐) · false(안 가짐) · null(값을 모름 · 셈에서 뺌) */
export const TRAITS = Object.freeze([
  {id: 'ups', chip: '오른 날 많음', rule: '지난 20거래일 가운데 오른 날(+0.1% 넘게)이 10일 이상', of: c => { const u = upsOf(c.c); return u == null ? null : u >= 10; }},
  {id: 'r5', chip: '최근 5거래일 오름', rule: '마지막 종가가 5거래일 전 종가보다 높음', of: c => { const r = r5Of(c.c); return r == null ? null : r > 0; }},
  {id: 'r20', chip: '20거래일 오름', rule: '마지막 종가가 20거래일 전 종가보다 높음', of: c => finite(c.change20) ? c.change20 > 0 : null},
  {id: 'fgn', chip: '외국인 순매수', rule: '최근 5거래일 외국인 순매수 합이 0주보다 많음', of: c => finite(c.brief?.flows?.foreign) ? c.brief.flows.foreign > 0 : null},
  {id: 'ins', chip: '기관 순매수', rule: '최근 5거래일 기관 순매수 합이 0주보다 많음', of: c => finite(c.brief?.flows?.institution) ? c.brief.flows.institution > 0 : null},
  {id: 'hold', chip: '외국인 보유 늘어남', rule: '외국인 보유 비율이 최근 5거래일 사이 늘어남', of: c => { const h = c.brief?.flows?.holdPct; return h && finite(h.first) && finite(h.last) ? h.last > h.first : null; }},
  {id: 'y1', chip: '1년 전보다 높음', rule: '마지막 종가가 252거래일 전 종가보다 높음', of: c => finite(c.info?.ret252) ? c.info.ret252 > 0 : null},
  {id: 'top', chip: '1년 중 높은 쪽', rule: '마지막 종가가 지난 252거래일의 가장 낮은 종가~가장 높은 종가 사이에서 위쪽 20% 안', of: c => finite(c.info?.pos52) ? c.info.pos52 >= 0.8 : null},
  {id: 'news', chip: '기사에 이름', rule: '최근 모은 기사 6건 가운데 회사 이름이 든 기사가 있음', of: c => c.brief && !c.brief.missing?.includes('기사') && finite(c.brief.newsNamed) ? c.brief.newsNamed > 0 : null},
]);
export const SIMILAR_RULES = Object.freeze({want: 7, perIndustry: 2, minShare: 0.5, minGap: 0.10, minCommon: 3});

/**
 * companies: 판의 회사(board.json companies 와 같은 모양 — c · change20 · info · brief · group) · hotIds: 불장 업종 id
 * 반환: {want, count, perIndustry, hotCompanies, restCompanies, filled, traits:[…], common:[id], items:[…]}
 */
export function similarBoard(companies, hotIds, rules = SIMILAR_RULES) {
  const {want, perIndustry, minShare, minGap, minCommon} = {...SIMILAR_RULES, ...rules};
  const hot = companies.filter(c => hotIds.has(c.group?.id)), rest = companies.filter(c => !hotIds.has(c.group?.id));
  const tally = (list, t) => { let yes = 0, known = 0; for (const c of list) { const v = t.of(c); if (v === null || v === undefined) continue; known++; if (v) yes++; } return {yes, known}; };
  const rate = x => x.known ? x.yes / x.known : 0;
  const traits = TRAITS.map(t => { const h = tally(hot, t), r = tally(rest, t); return {id: t.id, chip: t.chip, rule: t.rule, hot: h, rest: r, gap: Number((rate(h) - rate(r)).toFixed(4)), common: false}; });
  let common = traits.filter(t => t.hot.known && rate(t.hot) > minShare && t.gap > minGap), filled = false;
  if (hot.length && common.length < minCommon) {
    const more = traits.filter(t => t.hot.known && t.gap > 0 && !common.includes(t)).sort((a, b) => b.gap - a.gap || TRAITS.findIndex(x => x.id === a.id) - TRAITS.findIndex(x => x.id === b.id));
    const add = more.slice(0, minCommon - common.length); filled = add.length > 0; common = [...common, ...add];
  }
  for (const t of common) t.common = true;
  const ids = TRAITS.filter(t => common.some(x => x.id === t.id)), need = Math.floor(ids.length / 2) + 1; // 공통점의 절반 넘게(6가지면 4가지 이상)
  const scored = rest.map((c, k) => { const has = [], unknown = []; for (const t of ids) { const v = t.of(c); if (v === true) has.push(t.id); else if (v !== false) unknown.push(t.id); } return {c, k, has, unknown}; })
    .filter(x => ids.length && x.has.length >= need)
    .sort((a, b) => b.has.length - a.has.length || (finite(b.c.change20) ? b.c.change20 : -Infinity) - (finite(a.c.change20) ? a.c.change20 : -Infinity) || a.c.code.localeCompare(b.c.code));
  const taken = new Map(), items = [];
  for (const x of scored) {
    const g = x.c.group?.id ?? 'none', n = taken.get(g) ?? 0; if (n >= perIndustry) continue;
    taken.set(g, n + 1);
    items.push({code: x.c.code, name: x.c.name, groupId: x.c.group?.id ?? null, groupLabel: x.c.group?.label ?? null, change20: x.c.change20 ?? null, matched: x.has.length, has: x.has, unknown: x.unknown});
    if (items.length === want) break;
  }
  return {want, count: items.length, perIndustry, need, hotCompanies: hot.length, restCompanies: rest.length, filled, rules: {minShare, minGap, minCommon},
    traits, common: ids.map(t => t.id), items};
}

/** 저녁 7시 기록 한 장(판에서 뽑음) — 업종·회사 id 와 이름만 */
export function eveningRecordOf(board, {universe, recordedAt, run = 'evening', cand = null}) {
  return {schema: 'atlas11-evening-1', universe, asOf: board.asOf, recordedAt, run, boardId: board.boardId,
    ...(cand ? {cand: cand.items, candRules: cand.rules, candPool: cand.pool, ...(cand.mc ? {candMc: cand.mc} : {})} : {}), // 매수 검토 후보(2026-10-09 · 그날 첫 발행본 — 고치지 않음 · lib/atlas11/cand.mjs · candMc = 1만 번 다시 뽑기 씨앗 · 횟수 — 규칙 3판)
    hot: (board.hot?.items ?? []).map(x => ({id: x.id, label: x.label, change20: x.change20})),
    similar: (board.similar?.items ?? []).map(x => ({code: x.code, name: x.name, groupId: x.groupId, groupLabel: x.groupLabel, matched: x.matched})),
    common: board.similar?.common ?? [],
    next: (board.next?.items ?? []).map(x => ({code: x.code, name: x.name, groupId: x.groupId, groupLabel: x.groupLabel}))};
}

/**
 * records: 한 묶음의 저녁 기록들(종가 날짜 차례) → 가장 늦은 기록과 바로 앞 기록의 들고 남
 *   기록이 없으면 null · 하나뿐이면 {first:true}
 */
export function movesOf(records) {
  const list = [...(records ?? [])].filter(r => r?.asOf).sort((a, b) => a.asOf.localeCompare(b.asOf));
  const cur = list.at(-1), prev = list.at(-2);
  if (!cur) return null;
  const base = {universe: cur.universe, to: cur.asOf, at: cur.recordedAt, records: list.length};
  if (!prev) return {...base, first: true, from: null};
  const ids = xs => new Set(xs.map(x => x.id)), codes = xs => new Set(xs.map(x => x.code));
  const hotNow = ids(cur.hot), hotThen = ids(prev.hot), simNow = codes(cur.similar), nextNow = codes(cur.next), nextThen = codes(prev.next);
  const became = prev.similar.filter(x => hotNow.has(x.groupId));
  const becameSet = codes(became);
  const co = x => ({code: x.code, name: x.name, groupLabel: x.groupLabel ?? null});
  return {...base, first: false, from: prev.asOf, fromAt: prev.recordedAt,
    hotIn: cur.hot.filter(x => !hotThen.has(x.id)).map(x => ({id: x.id, label: x.label})),
    hotOut: prev.hot.filter(x => !hotNow.has(x.id)).map(x => ({id: x.id, label: x.label})),
    becameHot: became.map(co),
    similarIn: cur.similar.filter(x => !codes(prev.similar).has(x.code)).map(co),
    similarOut: prev.similar.filter(x => !simNow.has(x.code) && !becameSet.has(x.code)).map(co),
    nextIn: cur.next.filter(x => !nextThen.has(x.code)).map(co),
    nextOut: prev.next.filter(x => !nextNow.has(x.code)).map(co)};
}
