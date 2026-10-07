/**
 * 오늘의 돈 이야기 — 셈 한 곳(받기 · 쓰기 없음)
 *   사장님 2026-10-07 16:34 「아틀라스, 왕초보에게 시장을 해석시키지 마라. 네가 해석하고, 눈으로 이해되는 결과를 보여줘라.
 *     한국·미국·일본·중국·베트남을 자동 분석해 가장 근거가 뚜렷한 돈 이야기 하나를 골라라 … [이 일이 생겼다] → [그래서 여기가 돈을 받는다] ⇢ [다음은 여기가 필요하다]
 *     … 기업 지출·주식 투자금·기대감은 구분해라. 실제 돈을 받는지 미확인이면 '수혜 기대'라고 써라. 근거와 날짜를 붙여라. 모르는 연결은 그리지 마라」
 *   · 16:35 「난 답하지 않는다 지혜로운 답을 스스로 찾아서 하라」
 *
 * 어떻게 고르나(날마다 판을 쌀 때 저절로 — scripts/atlas11/story/build.mjs · package.mjs)
 *   ① 이어짐 표 CHAINS: 사람이(Claude) 근거를 보고 적어 둔 연결만 — 일 → 돈 받는 역할 ⇢ 다음 역할 · 선 위 까닭 · 확인할 것 · 다시 판단할 것
 *      (모르는 연결은 그리지 않는다 — 표에 없는 연결은 화면에 나오지 않음)
 *   ② 모은 기사 제목(다섯 판 · 날짜 · 출처 · 주소)을 넷으로 나눔 — 기대감(기대 · 가시화 · 눈앞 · 주목 · 물음표) > 주식 투자금(주가 · 강세 · 급등 · 외국인)
 *      > 실제 돈(매출 · 영업이익 · 실적 · 수주 · 계약 · 수출 증가 · 출하 확대 · 사상 최대 · 주문) > 기업 지출(투자 확대 · 설비 투자 · 증설 · 착공) > 보도
 *      앞날 말(lib/atlas11/board.mjs PREDICTION_WORDS)이 든 제목은 쓰지 않는다
 *   ③ 이야기마다 — 함께 오른 시장 수(그 역할의 업종이 그 판 불장 11개 안) · 돈 받는 역할의 실제 돈 기사 수 · 일 기사 수
 *      일 기사 1개 이상 + 실제 돈 기사 1개 이상인 이야기만 · 점수 = 3 × 함께 오른 시장 + 2 × 실제 돈(4개까지) + 일(3개까지) · 같으면 표 차례
 *   ④ 다음 역할: 실제 돈 기사가 있으면 「이미 돈을 받기 시작함」 · 없으면 「수혜 기대」 — 그래도 다음 장면은 늘 점선 · 「예상」
 *   ⑤ 고를 것이 없으면 { none: true } — 화면은 「근거가 뚜렷한 돈 이야기가 없는 날」이라고 적는다(지어내지 않음)
 * 화면 글은 쉬운 말(회사 이름보다 하는 일 · 나라 이름보다 역할) — 기사 제목은 원문 그대로(날짜 · 출처 · 주소와 함께)
 * 시험: tests/atlas11/story.test.mjs
 */
import {PREDICTION_WORDS} from './board.mjs';

export const STORY = Object.freeze({schema: 'atlas11-story-1', windowDays: 21, hotTop: 11});

/** 역할 — 판의 업종 이름(한국 판 · 바깥 판)과 기사 낱말 */
export const ROLES = Object.freeze({
  chip: {name: '기억 반도체 · 반도체 장비', does: '컴퓨터가 잠깐 기억하는 칩, 그리고 칩을 만드는 기계', kr: /^반도체/, abroad: /^반도체/,
    words: /메모리|HBM|D램|디램|낸드|반도체|마이크론|하이닉스|어드밴테스트|도쿄\s?일렉트론|TSMC|파운드리|웨이퍼/},
  power: {name: '전기를 보내는 설비 — 변압기 · 전선', does: '발전소의 전기를 공장 · 건물까지 보내는 기계와 선', kr: /^(전력기기|전선·전기장비)$/, abroad: /^(중전기장비|전기 부품 및 장비)$/,
    words: /변압기|전력\s?망|전력\s?기기|전선|케이블|초고압|배전|송전|중전기|전력\s?설비/},
  gen: {name: '전기를 만드는 설비 — 발전기 · 원전', does: '전기를 만들어 내는 기계와 발전소', kr: /^에너지 장비$/, abroad: /^(재생 가능 에너지 장비 및 서비스)$/,
    words: /발전기|가스\s?터빈|원전|원자력|SMR|발전\s?설비|비상\s?발전/},
  ship: {name: '배를 만드는 곳', does: '큰 배를 설계하고 만드는 곳', kr: /^조선$/, abroad: /^조선$/,
    words: /조선|선박|LNG선|컨테이너선|수주.{0,6}척/},
  shipParts: {name: '배에 들어가는 엔진 · 부품', does: '배를 움직이는 엔진과 배 안의 기계', kr: /^조선 기자재$/, abroad: /^$/,
    words: /선박\s?엔진|엔진|기자재|추진기/},
  arms: {name: '무기를 만드는 곳', does: '자주포 · 전투기 · 미사일을 만드는 곳', kr: /^(방산|항공·우주)$/, abroad: /^항공우주 및 방위$/,
    words: /방산|무기|자주포|전투기|미사일|K9|K2|천무|레드백/},
  armsCare: {name: '탄약 · 정비 · 부품', does: '무기를 쓰는 동안 채우고 고치는 일', kr: /^$/, abroad: /^$/,
    words: /탄약|정비|MRO|후속\s?지원/},
  refine: {name: '기름을 정제하는 곳', does: '원유를 휘발유 · 경유로 만드는 곳', kr: /^정유·가스$/, abroad: /^오일, 가스 정제 및 마케팅$/,
    words: /정유|정제\s?마진|석유제품|휘발유|경유/},
  tanker: {name: '기름을 나르는 배', does: '정제한 기름을 바다로 실어 나르는 배', kr: /^해운$/, abroad: /^오일 및 가스 수송 서비스$/,
    words: /유조선|탱커|운임/},
});

/** 일(이 일이 생겼다) — 기사 낱말 · 그 돈의 갈래(기업 지출 · 나라 지출 · 공급) */
export const EVENTS = Object.freeze({
  aidc: {text: '인공지능을 돌리는 큰 컴퓨터 건물(데이터센터)에 큰 회사들이 돈을 더 쓴다', money: '기업 지출', words: /데이터\s?센터|AIDC|AI\s?인프라|빅테크.{0,10}투자|AI\s?투자|하이퍼\s?스케일/},
  ships: {text: '세계에서 새 배 주문이 늘었다', money: '기업 지출', words: /선박\s?발주|발주.{0,6}(증가|늘|척)|신조선|수주\s?잔고/},
  arms: {text: '여러 나라가 나라를 지키는 데 돈을 더 쓴다', money: '나라 지출', words: /국방비|방위비|국방\s?예산|군비/},
  oil: {text: '휘발유 · 경유 같은 기름 제품이 모자라졌다', money: '공급 줄어듦', words: /석유제품.{0,8}(수출\s?중단|부족)|정제\s?마진|공급\s?차질|감산/},
});

/** 이어짐 표 — 근거를 보고 적은 연결만(모르는 연결은 그리지 않는다) · 차례 = 같은 점수일 때 앞선 것 */
export const CHAINS = Object.freeze([
  {id: 'aidc-chip-power', event: 'aidc', now: 'chip', next: 'power',
    why1: '데이터센터의 컴퓨터는 기억 반도체 없이 돌지 못한다', changed: '데이터센터에서 쓰는 기억 반도체가 실제로 더 팔렸다',
    why2: '데이터센터 한 곳이 작은 도시만큼 전기를 쓴다', check: '변압기 · 전선 회사의 주문과 수출이 계속 느는가',
    confirm: '변압기 · 전선의 주문과 수출이 {m}월에도 늘어난 것', rethink: '큰 회사들이 데이터센터에 쓰는 돈을 줄인다는 발표, 또는 기억 반도체 값이 내림'},
  {id: 'aidc-power-gen', event: 'aidc', now: 'power', next: 'gen',
    why1: '데이터센터 한 곳이 작은 도시만큼 전기를 쓴다', changed: '변압기 · 전선의 주문과 수출이 실제로 늘었다',
    why2: '보낼 전기 자체가 모자라다', check: '데이터센터에 전기를 대는 발전 설비 주문이 실제로 나오는가',
    confirm: '데이터센터에 전기를 대는 발전 설비 주문 · 계약 소식', rethink: '데이터센터 짓기를 미룬다는 발표, 또는 변압기 주문이 줄어듦'},
  {id: 'ships-ship-parts', event: 'ships', now: 'ship', next: 'shipParts',
    why1: '주문받은 배 값은 배를 만들면서 나눠 받는다', changed: '새 배 주문이 실제로 들어왔다',
    why2: '배 한 척마다 엔진과 기계가 따로 들어간다', check: '엔진 · 부품 회사의 주문이 실제로 느는가',
    confirm: '엔진 · 부품 회사의 수주 소식', rethink: '새 배 주문이 줄거나 배 값이 내린다는 소식'},
  {id: 'arms-arms-care', event: 'arms', now: 'arms', next: 'armsCare',
    why1: '나라들이 무기를 새로 사거나 늘린다', changed: '무기를 파는 계약이 실제로 맺어졌다',
    why2: '무기는 쓰는 동안 탄을 채우고 고쳐야 한다', check: '정비 · 부품 계약이 실제로 나오는가',
    confirm: '정비 · 부품 계약 소식', rethink: '전쟁이 멈추거나 국방 예산을 줄인다는 발표'},
  {id: 'oil-refine-tanker', event: 'oil', now: 'refine', next: 'tanker',
    why1: '모자라면 정제한 기름 값이 오른다', changed: '정제한 기름으로 남는 돈이 실제로 커졌다',
    why2: '모자란 곳으로 기름을 실어 날라야 한다', check: '기름 나르는 배 삯(운임)이 실제로 오르는가',
    confirm: '기름 나르는 배 삯이 오른 숫자', rethink: '기름 제품 수출이 다시 풀린다는 발표'},
]);

/** 기사 제목 → 돈의 갈래 — hype 기대감 · stock 주식 투자금 · real 실제 돈 · capex 기업 지출 · report 보도 · null(앞날 말 — 쓰지 않음) */
const HYPE = /기대|가시화|눈앞|넘나|넘을까|될까|나올까|주목|수혜|유망|탑픽|다음 타자|더 간다|기회|\?|？|…왜/;
const STOCK = /주가|주식|株|강세|급등|급락|약세|上|불기둥|신고가|외국인|기관|순매수|순매도|러브콜|덩실|랠리|시총|시가총액|특징주|핫종목|증시|종목|뜨는|뜨거/;
const REAL = /매출|영업이익|순이익|실적|수주|공급\s?계약|계약\s?체결|납품|수출.{0,10}(증가|급증|늘|최대|돌파|호조)|출하.{0,8}(확대|증가|늘)|사상\s?최대|최대\s?실적|주문|마진.{0,4}(최고|최대)/;
const CAPEX = /\d[\d,.]*\s?(억|조|만)?\s?(달러|弗|원|엔|위안).{0,8}투자|투자\s?(확대|늘|계획|예정)|설비\s?투자|증설|착공|건설|캐펙스|CAPEX/i;
export function classify(title) {
  const t = String(title ?? '');
  if (!t.trim() || PREDICTION_WORDS.test(t)) return null;
  return HYPE.test(t) ? 'hype' : STOCK.test(t) ? 'stock' : REAL.test(t) ? 'real' : CAPEX.test(t) ? 'capex' : 'report';
}
export const KIND_WORD = Object.freeze({real: '실제 돈', capex: '기업 지출', stock: '주식 투자금', hype: '기대감', report: '보도'});

const day = iso => String(iso ?? '').slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
/** 기사 모음 → 기간 안 · 같은 제목 하나 · 날짜 · 갈래 */
export function newsPool(items, refDate, windowDays = STORY.windowDays) {
  const from = addDays(refDate, -windowDays), to = addDays(refDate, 2), seen = new Set(), out = [];
  for (const n of items) {
    const d = day(n?.publishedAt), title = String(n?.title ?? '').replace(/\s+/g, ' ').trim(), key = title.replace(/[^가-힣A-Za-z0-9]/g, '').slice(0, 18);
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d < from || d > to || seen.has(key)) continue;
    const kind = classify(title); if (!kind) continue;
    seen.add(key); out.push({date: d, at: String(n.publishedAt), office: n.office ?? null, title, url: /^https:\/\//.test(n.url ?? '') ? n.url : null, kind, place: n.place ?? null});
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}
/** 근거 고르기 — kinds 차례(앞이 먼저) · 같은 갈래면 굳은 정도(사상 최대 · 몇 배 · 급증 · % 증가 > 수주 · 계약 · 금액 > 그 밖) · 그다음 새것 */
const STRONG = /사상\s?최대|최대\s?실적|\d+(\.\d+)?배|급증|수출.{0,10}(증가|급증|늘)|\d+%\s?(증가|늘)/, MID = /수주|공급\s?계약|계약\s?체결|납품|\d[\d,.]*\s?(억|조)?\s?(달러|弗|원|엔|위안)/;
export const strength = t => STRONG.test(t) ? 2 : MID.test(t) ? 1 : 0;
/** 제목 속 금액(대강 달러로 — 차례를 정할 때만 씀 · 화면에 쓰지 않음) — 「5180억弗」 · 「18억 달러」 · 「2900억 규모」(원) */
const UNITS = {만: 1e4, 억: 1e8, 조: 1e12}, CUR = {달러: 1, 弗: 1, 원: 1 / 1400, 엔: 1 / 150, 위안: 1 / 7};
export function amountOf(t) {
  let best = 0;
  for (const m of String(t ?? '').matchAll(/(\d[\d,]*(?:\.\d+)?)\s?(만|억|조)?\s?(달러|弗|원|엔|위안)/g)) { const v = Number(m[1].replace(/,/g, '')) * (UNITS[m[2]] ?? 1) * CUR[m[3]]; if (Number.isFinite(v) && v > best) best = v; }
  return best;
}
const pick = (pool, words, kinds, n) => pool.filter(x => words.test(x.title) && kinds.includes(x.kind))
  .sort((a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind) || strength(b.title) - strength(a.title) || (a.kind === 'capex' ? amountOf(b.title) - amountOf(a.title) : 0) || (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, n);

/** 역할의 주식 투자금 — 판마다 그 역할 업종(가장 많이 오른 것) · 불장 11개 안인가 */
export function roleMoves(role, boards) {
  const out = [];
  for (const b of boards) {
    const re = b.place === 'kr' ? role.kr : role.abroad, groups = (b.groups ?? []).filter(g => re.test(g.label ?? '') && Number.isFinite(g.change20));
    if (!groups.length) continue;
    const best = [...groups].sort((x, y) => y.change20 - x.change20)[0];
    out.push({place: b.place, label: best.label, change20: best.change20, hot: groups.some(g => g.hot), asOf: b.asOf, from: best.from ?? null, to: best.to ?? null});
  }
  return out;
}

/** 이야기 하나 셈 — 점수 · 근거 */
export function scoreChain(chain, boards, pool) {
  const ev = EVENTS[chain.event], now = ROLES[chain.now], next = ROLES[chain.next];
  const evItems = pick(pool, ev.words, ['capex', 'real', 'report', 'stock'], 2);
  const nowReal = pick(pool, now.words, ['real'], 4), nowStock = pick(pool, now.words, ['stock'], 1), nowHype = pick(pool, now.words, ['hype'], 1);
  const nextReal = pick(pool, next.words, ['real'], 1), nextHype = pick(pool, next.words, ['hype'], 1);
  const moves = roleMoves(now, boards), hotMarkets = moves.filter(m => m.hot && m.change20 > 0).length;
  const ok = evItems.length >= 1 && nowReal.length >= 1;
  const score = 3 * hotMarkets + 2 * Math.min(nowReal.length, 4) + Math.min(evItems.length, 3);
  return {chain, ok, score, hotMarkets, evItems, nowReal, nowStock, nowHype, nextReal, nextHype, moves, nextMoves: roleMoves(next, boards)};
}

/** 오늘의 돈 이야기 — boards: [{place, label, asOf, groups}] · items: 기사([{publishedAt, office, title, url, place}]) */
export function buildStory({boards, items, made}) {
  const refDate = boards.map(b => b.asOf).filter(Boolean).sort().at(-1) ?? day(made);
  const pool = newsPool(items, refDate), scored = CHAINS.map(c => scoreChain(c, boards, pool));
  const ranked = scored.filter(s => s.ok).sort((a, b) => b.score - a.score || CHAINS.indexOf(a.chain) - CHAINS.indexOf(b.chain));
  const asOf = Object.fromEntries(boards.map(b => [b.place, b.asOf]));
  const others = boards.map(b => { const top = [...(b.groups ?? [])].filter(g => Number.isFinite(g.change20)).sort((x, y) => y.change20 - x.change20)[0]; return top ? {place: b.place, label: top.label, change20: top.change20, asOf: b.asOf} : null; }).filter(Boolean);
  const base = {schema: STORY.schema, made, refDate, asOf, window: {from: addDays(refDate, -STORY.windowDays), to: refDate}, news: pool.length,
    candidates: scored.map(s => ({id: s.chain.id, ok: s.ok, score: s.score, hotMarkets: s.hotMarkets, event: s.evItems.length, real: s.nowReal.length}))};
  const s = ranked[0];
  if (!s) {
    const all = boards.flatMap(b => (b.groups ?? []).filter(g => g.hot).map(g => ({place: b.place, label: g.label, change20: g.change20}))).sort((x, y) => y.change20 - x.change20).slice(0, 3);
    return {...base, none: true, stockOnly: all, others};
  }
  const c = s.chain, ev = EVENTS[c.event], now = ROLES[c.now], next = ROLES[c.next];
  const month = Number(refDate.slice(5, 7)) % 12 + 1;
  const used = new Set(s.moves.filter(m => m.hot && m.change20 > 0).map(m => m.place));
  return {...base, none: false, chain: c.id, score: s.score,
    event: {text: ev.text, money: ev.money, evidence: s.evItems},
    why1: c.why1,
    now: {role: now.name, does: now.does, changed: c.changed,
      real: {state: 'confirmed', evidence: s.nowReal.slice(0, 2)},
      stock: {markets: s.moves.filter(m => m.hot && m.change20 > 0), evidence: s.nowStock},
      hype: {evidence: s.nowHype}},
    why2: c.why2,
    next: {role: next.name, does: next.does, label: '예상', check: c.check, state: s.nextReal.length ? 'started' : 'expected',
      evidence: s.nextReal.length ? s.nextReal : s.nextHype, markets: s.nextMoves.filter(m => m.hot && m.change20 > 0)},
    confirm: c.confirm.replace('{m}', String(month)), rethink: c.rethink,
    others: others.filter(o => !used.has(o.place))};
}

/** 판에 싣기 전 검사 — 비면 통과 */
export function checkStory(st) {
  const bad = [];
  if (!st || st.schema !== STORY.schema) return ['schema'];
  if (st.none) return Array.isArray(st.stockOnly) ? [] : ['stockOnly'];
  const ev = [...(st.event?.evidence ?? []), ...(st.now?.real?.evidence ?? []), ...(st.now?.stock?.evidence ?? []), ...(st.now?.hype?.evidence ?? []), ...(st.next?.evidence ?? [])];
  if (!st.event?.evidence?.length) bad.push('일 근거 없음');
  if (!st.now?.real?.evidence?.length) bad.push('실제 돈 근거 없음');
  for (const e of ev) { if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? '')) bad.push('근거 날짜'); if (e.url != null && !/^https:\/\//.test(e.url)) bad.push('근거 주소'); if (!KIND_WORD[e.kind]) bad.push('근거 갈래'); }
  const ours = [st.event?.text, st.why1, st.now?.role, st.now?.does, st.now?.changed, st.why2, st.next?.role, st.next?.does, st.next?.check, st.confirm, st.rethink].join(' ');
  if (PREDICTION_WORDS.test(ours)) bad.push('앞날 말(우리 글)');
  if (st.next?.label !== '예상') bad.push('다음 장면 표시');
  return bad;
}
