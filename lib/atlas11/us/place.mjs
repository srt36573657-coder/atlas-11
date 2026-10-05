/**
 * ATLAS 미국 판 · 시장 값(화면 글 · 지수 띠 · 일정 종류) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   화면 코드(site/app)는 한국 판과 같다 — 판 목록(manifest.place)에 이 값을 넣으면 화면이 달러 · 뉴욕 16:00 종가 · 수급 없음으로 바뀐다(site/app/util.js place)
 *   출처 이름은 실제로 쓴 출처만 적는다(sources — 수집기가 적어 둔 것) · 지어낸 출처 없음
 */

/** 미국 시장 일정 가운데 판에 싣는 종류(확인된 일정표 public/data/atlas11/schedule-events.json · 시장 공통) — 한국은행(BOK)은 뺀다 */
export const US_EVENT_KINDS = Object.freeze(['FOMC', 'CPI', 'JOBS', 'PPI', 'JOLTS']);

/** 지수 띠(뉴욕) — 기호 → 화면 이름 */
export const US_INDEX = Object.freeze([
  Object.freeze({symbol: '.INX', name: 'S&P 500'}),
  Object.freeze({symbol: '.IXIC', name: '나스닥 종합'}),
  Object.freeze({symbol: '.DJI', name: '다우존스'}),
]);

/** 판 목록에 넣는 시장 값 — sources: {prices, names, industry, finance, news} 실제로 쓴 출처 이름 */
export function usPlace(sources = {}) {
  const price = sources.prices ?? '네이버 증권 해외주식', news = sources.news ?? null, ind = sources.industry ?? '네이버 증권 해외주식 업종';
  return {id: 'us', label: '미국', unit: '달러', digits: 2,
    close: '16:00(뉴욕)', closeAt: '16:00 뉴욕 시각', exchange: '뉴욕증권거래소 · 나스닥 정규장',
    flows: false, flowsNone: '미국은 투자자별(외국인·기관) 매매를 날마다 공개하지 않음',
    disclosures: false, disclosuresNone: '미국 공시는 아직 싣지 않음',
    moves: false,
    foot: `종가: 뉴욕증권거래소 · 나스닥 정규장 16:00(뉴욕 시각) 종가(${price})${news ? ` · 기사: ${news}` : ''} · 일정: 공식 발표처 · 「미국 주식 자료 받기」를 누를 때 새로 올림`,
    notDo: '지난 기록만 보여 줍니다(뉴욕 16:00 종가 · 누를 때 올림)',
    contextSource: `출처: ${news ?? '기사 없음'} · 기사는 제목만 저장(본문 없음)`,
    contextNone: '아직 이 회사의 기사 기록이 없습니다',
    industryNote: `${ind} 이름(화면에는 그 이름 그대로) · 작은 업종은 회사가 5곳이 안 되어 빠짐`,
    industrySource: ind};
}

/** 지수 띠 — context.index 의 원문 행(날짜 · 종가 · 등락%) → manifest.market (값이 비거나 숫자가 아니면 싣지 않음) */
export function usMarketOf(snap, file = null) {
  const ok = x => typeof x === 'number' && Number.isFinite(x), ISO = /^\d{4}-\d{2}-\d{2}$/;
  const items = (snap?.index ?? []).filter(i => i.rows?.length).map(i => { const r = i.rows.at(-1), name = US_INDEX.find(x => x.symbol === i.symbol)?.name ?? i.name ?? i.symbol;
    return {symbol: i.symbol, name, date: r.date, close: r.close, changePct: r.changePct, sourceName: i.sourceName ?? '네이버 증권 해외 지수', sourceUrl: i.sourceUrl ?? null}; })
    .filter(x => ok(x.close) && ok(x.changePct) && ISO.test(x.date ?? ''));
  return items.length ? {day: snap.day ?? null, fetchedAt: snap.fetchedAt ?? null, record: file, items, closeTime: '16:00 뉴욕 시각'} : null;
}

/** 뉴욕 시각 — DST(서머타임)를 따라 Intl 로 센다 → {date:'YYYY-MM-DD', hm:'HH:MM', weekday:0-6} */
export function newYork(at = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'})
    .formatToParts(new Date(at)).map(x => [x.type, x.value]));
  const hour = p.hour === '24' ? '00' : p.hour;
  return {date: `${p.year}-${p.month}-${p.day}`, hm: `${hour}:${p.minute}`, weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday)};
}

/** 그 날짜의 종가가 굳었나 — 뉴욕 날짜가 지났거나, 그날 17:00(뉴욕) 뒤 · 장중 값(아직 안 끝난 날)을 종가로 쓰지 않는다 */
export const usCloseFinal = (date, now = new Date()) => { const ny = newYork(now); return date < ny.date || (date === ny.date && ny.hm >= '17:00'); };
