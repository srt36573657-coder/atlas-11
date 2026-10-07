/**
 * ATLAS 중국 · 일본 · 베트남 판 — 시장 값 한곳(받기 · 고르기 · 화면 글) · 사장님 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
 *   미국 판(lib/atlas11/us/*)과 같은 생각 · 같은 출처(네이버 증권 해외주식) — 거래소 이름은 깃허브 실행기 시험(reports/atlas11/world/probe/2026-10-07T03-20-34-289Z)에서 열린 것만:
 *     중국 SHANGHAI 1,832곳 · SHENZHEN 2,163곳 / 일본 TOKYO 3,974곳 / 베트남 HOCHIMINH 410곳 · HANOI 299곳
 *   지수: 상하이 종합(.SSEC) · 선전 성분(.SZSC) · CSI 300(.CSI300) / 닛케이 225(.N225) · 토픽스(.TOPX) / VN 지수(.VNI) · HNX 지수(.HNXI) — 같은 시험에서 열림
 *   장 마감(네이버 원문 stockExchangeType.endTime · 같은 시험): 상하이 · 선전 15:00 · 도쿄 15:30 · 호찌민 · 하노이 15:00 — 그 나라 시각 · 종가는 마감 1시간 뒤부터 굳은 값으로 씀
 *   이 파일은 값만(받기 · 쓰기 없음) — 시험: tests/atlas11/world.test.mjs
 */

export const WORLD = Object.freeze({
  cn: Object.freeze({
    id: 'cn', label: '중국', city: '상하이', tz: 'Asia/Shanghai', close: '15:00', finalAfter: '16:00',
    exchanges: Object.freeze(['SHANGHAI', 'SHENZHEN']), perExchange: Object.freeze({SHANGHAI: 2000, SHENZHEN: 2200}), // 2026-10-07 첫 실행: 2,000곳 안에서는 5곳을 채운 업종이 70개뿐(350곳) → 상장 약 4,000곳 가운데 3,000곳으로
    exchangeText: '상하이 · 선전 증권거래소 정규장', unit: '위안', currency: 'CNY', digits: 2,
    index: Object.freeze([Object.freeze({symbol: '.SSEC', name: '상하이 종합'}), Object.freeze({symbol: '.SZSC', name: '선전 성분'}), Object.freeze({symbol: '.CSI300', name: 'CSI 300'})]),
    yahoo: rc => String(rc ?? ''), // 600519.SS · 000001.SZ 그대로
    poolTop: 3000, industries: 73, perIndustry: 5, flexible: false,
  }),
  jp: Object.freeze({
    id: 'jp', label: '일본', city: '도쿄', tz: 'Asia/Tokyo', close: '15:30', finalAfter: '16:30',
    exchanges: Object.freeze(['TOKYO']), perExchange: Object.freeze({TOKYO: 2000}),
    exchangeText: '도쿄 증권거래소 정규장', unit: '엔', currency: 'JPY', digits: 0,
    index: Object.freeze([Object.freeze({symbol: '.N225', name: '닛케이 225'}), Object.freeze({symbol: '.TOPX', name: '토픽스'})]),
    yahoo: rc => String(rc ?? ''), // 7203.T 그대로
    poolTop: 2000, industries: 73, perIndustry: 5, flexible: false,
  }),
  vn: Object.freeze({
    id: 'vn', label: '베트남', city: '호찌민', tz: 'Asia/Ho_Chi_Minh', close: '15:00', finalAfter: '16:00',
    exchanges: Object.freeze(['HOCHIMINH', 'HANOI']), perExchange: Object.freeze({HOCHIMINH: 500, HANOI: 400}),
    exchangeText: '호찌민 · 하노이 증권거래소 정규장', unit: '동', currency: 'VND', digits: 0,
    index: Object.freeze([Object.freeze({symbol: '.VNI', name: 'VN 지수'}), Object.freeze({symbol: '.HNXI', name: 'HNX 지수'})]),
    yahoo: rc => String(rc ?? '').replace(/\.(HM|HN)$/, '.VN'), // 야후는 베트남 회사를 .VN 으로
    // 베트남은 상장 회사가 약 700곳 — 업종마다 5곳을 채운 업종 수만큼(73개가 안 됨) · 「업종마다 5곳」은 같게 [판단]
    poolTop: 700, industries: 73, perIndustry: 5, flexible: true,
  }),
});
export const WORLD_IDS = Object.freeze(Object.keys(WORLD));
export const worldOf = id => { const m = WORLD[id]; if (!m) throw Error(`WORLD_MARKET ${String(id).slice(0, 10)} — cn · jp · vn 가운데 하나`); return m; };

/** 그 나라 시각 — {date:'YYYY-MM-DD', hm:'HH:MM', weekday:0-6} */
export function localTime(tz, at = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'})
    .formatToParts(new Date(at)).map(x => [x.type, x.value]));
  const hour = p.hour === '24' ? '00' : p.hour;
  return {date: `${p.year}-${p.month}-${p.day}`, hm: `${hour}:${p.minute}`, weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday)};
}
/** 그 날짜의 종가가 굳었나 — 그 나라 날짜가 지났거나, 그날 마감 1시간 뒤(finalAfter)가 지났을 때만 · 장중 값을 종가로 쓰지 않는다 */
export const closeFinal = (m, date, now = new Date()) => { const t = localTime(m.tz, now); return date < t.date || (date === t.date && t.hm >= m.finalAfter); };

/** 판 목록에 넣는 시장 값(화면 글) — 미국 판 usPlace 와 같은 칸 · sources: 실제로 쓴 출처 이름 */
export function worldPlace(m, sources = {}) {
  const price = sources.prices ?? '네이버 증권 해외주식', news = sources.news ?? null, ind = sources.industry ?? '네이버 증권 해외주식 업종';
  return {id: m.id, label: m.label, unit: m.unit, digits: m.digits,
    close: `${m.close}(${m.city})`, closeAt: `${m.close} ${m.city} 시각`, exchange: m.exchangeText,
    flows: false, flowsNone: `${m.label}은 투자자별(외국인·기관) 매매를 날마다 싣지 않음`,
    disclosures: false, disclosuresNone: `${m.label} 공시는 아직 싣지 않음`,
    moves: false,
    // 새로 올리는 때(2026-10-07 사이트에 붙이며): 한국 판 저녁 실행이 끝날 때마다 저절로 받고(.github/workflows/atlas11-world.yml) 새 종가면 사이트에 올림 — 깃허브 예약이 늦게 오는 날이 많아 「밤」
    foot: `종가: ${m.exchangeText} ${m.close}(${m.city} 시각) 종가(${price})${news ? ` · 기사: ${news}` : ''} · 평일 밤(한국 시각)에 새로 올림`,
    notDo: `지난 기록만 보여 줍니다(${m.city} ${m.close} 종가 · 평일 밤에 올림)`,
    contextSource: `출처: ${news ?? '기사 없음'} · 기사는 제목만 저장(본문 없음)`,
    contextNone: '아직 이 회사의 기사 기록이 없습니다',
    industryNote: `${ind} 이름(화면에는 그 이름 그대로) · 작은 업종은 회사가 5곳이 안 되어 빠짐`,
    industrySource: ind};
}

/** 지수 띠 — context.index 의 원문 행 → manifest.market */
export function worldMarketOf(m, snap, file = null) {
  const ok = x => typeof x === 'number' && Number.isFinite(x), ISO = /^\d{4}-\d{2}-\d{2}$/;
  const items = (snap?.index ?? []).filter(i => i.rows?.length).map(i => { const r = i.rows.at(-1), name = m.index.find(x => x.symbol === i.symbol)?.name ?? i.name ?? i.symbol;
    return {symbol: i.symbol, name, date: r.date, close: r.close, changePct: r.changePct, sourceName: i.sourceName ?? '네이버 증권 해외 지수', sourceUrl: i.sourceUrl ?? null}; })
    .filter(x => ok(x.close) && ok(x.changePct) && ISO.test(x.date ?? ''));
  return items.length ? {day: snap.day ?? null, fetchedAt: snap.fetchedAt ?? null, record: file, items, closeTime: `${m.close} ${m.city} 시각`} : null;
}
