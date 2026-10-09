/**
 * ATLAS 11 · 판 읽기(lens) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부)의 다섯 질문을 한 파일로
 *   ① 지금 시장은 어떤 상태인가 ② 어느 주체가 어느 업종을 사고팔며 가격은 어떻게 반응하는가 ③ 어떤 종목에 새로운 변화가 생겼는가
 *   ④ 앞으로 어떤 사건을 확인해야 하는가(일정은 agenda.json 그대로) ⑤ 지금까지의 선정 기준은 실제로 유효했는가
 * 셈은 모두 공통 계산(site/app/calc.js · 산식 calc-1) · 규칙은 RULES(실험 규칙 lens-rules-1 · 검증 전 · 숫자를 함께 보임)
 * 원칙(지시서 그대로): 관측 사실 · 계산 결과 · 해석 · 미확인을 나눔 · 같은 기간 같은 종가 기준 · 빠진 값은 0 으로 채우지 않고 뺀 수와 사유
 *   · 공식 순매매 「금액」이 없으면 순매수 주식 수 × 그날 종가 = 「추정액」(공식 값과 섞지 않음) · 미국에 없는 자료는 만들어 넣지 않음
 *   · 최초 기록(저녁 기록 public/data/atlas11/evening)은 고치지 않음 · 평가일이 오지 않았으면 「평가 대기」
 * 쓰는 곳: scripts/atlas11/package.mjs 가 판마다 data/atlas11/view/lens.json 으로 싣는다(쌀 때마다 저장소 자료로 다시 셈 · 판 이름 boardId 를 달아 화면이 판과 맞댐)
 */
import {CALC_VERSION, summarize, pctRet, gapPp, mean, stdev, pathStats, fin, median, meanExSelf} from '../../site/app/calc.js';
import {candOf} from './cand.mjs'; // 매수 검토 후보(2026-10-09 03:09 「ATLAS 제품 재설계 명령」)

export const LENS_SCHEMA = 'atlas11-lens-1';
/** 실험 규칙(검증 전 · 기준 숫자는 ATLAS 가 정함 — 화면에 규칙과 실제 숫자를 함께 보임) */
export const RULES = Object.freeze({
  id: 'lens-rules-1', since: '2026-10-08',
  minN: 3, // 업종 판단에 필요한 유효 종목 수(그보다 적으면 「판단 보류」)
  broadUp: 60, // 동반 강세: 평균 > 0 · 중앙값 > 0 · 상승 1위 제외 평균 > 0 · 상승 비율 ≥ 60%
  narrowUp: 50, // 일부 종목 주도: 평균 > 0 인데 (중앙값 ≤ 0 또는 상승 1위 제외 평균 ≤ 0 또는 상승 비율 < 50%)
  // 강세 확산: 20거래일 평균 > 0 · 5거래일 평균 > 0 · 5거래일 상승 비율 > 20거래일 상승 비율
  // 강세 약화: 20거래일 평균 > 0 · 5거래일 평균 < 0 · 5거래일 상승 비율 < 50%
  priceLimitKr: 30, // 한국 하루 가격 제한폭(±30%) — 하루 변화가 이보다 크면 가격 기준이 바뀐 것으로 보고(분할 · 병합 · 권리락 등) 「기업행사 확인 필요」로 뺌
  staleSessions: 2, // 마지막 종가가 기준일보다 2거래일 넘게 늦으면 「오래된 종가(거래정지 여부 확인 필요)」
});
/** 기업행사 공시 낱말 — 가격 기준이 바뀔 수 있는 것(확인 필요 표시만 · 빼는 것은 가격 제한폭을 넘은 날이 있을 때) */
const CA_WORDS = new Set(['분할', '병합', '무상증자', '권리락', '감자', '합병', '매매거래정지', '거래정지', '상장폐지']);
const pickDay = iso => (typeof iso === 'string' ? iso.slice(0, 10) : null);

/** 가격 줄 → 날짜 지도 */
function priceMap(rows) { const m = new Map(); for (const r of rows ?? []) if (r?.date && fin(r.close) && r.close > 0) m.set(r.date, r); return m; }

/**
 * @param {object} a
 *   place('kr'|'us') · board · manifest · agenda(없어도 됨) · assets(input.json assets — code · prices) · snap(관측 묶음 — flows · disclosures · 없어도 됨)
 *   evening(저녁 기록 — 날짜 차례 · 없어도 됨) · index({symbol, name, rows:[{date, close}]} · 없어도 됨) · sessions(거래일 — 기준일 뒤 날도 있으면 평가일을 셈) · made(만든 때)
 */
export function lensOf({place = 'kr', board, manifest = {}, agenda = null, assets = [], snap = null, evening = [], index = null, sessions = [], made = new Date().toISOString(), placeInfo = {}, events = [], candPubs = [], rotation = null, growPubs = []}) {
  const problems = [];
  const asOf = board?.asOf ?? null, companies = board?.companies ?? [], groups = board?.groups ?? [];
  const ses = [...new Set((sessions ?? []).filter(d => typeof d === 'string'))].sort();
  const k0 = ses.indexOf(asOf);
  if (k0 < 0) problems.push(`거래일 달력에 기준일 ${asOf} 없음`);
  const sesAt = k => (k >= 0 && k < ses.length ? ses[k] : null);
  const back = n => (k0 >= 0 ? sesAt(k0 - n) : null); // 기준일에서 n거래일 앞
  const prices = new Map(assets.map(a => [String(a.code), priceMap(Array.isArray(a.prices) ? a.prices : [])]));
  const closeOn = (code, d) => (d ? prices.get(code)?.get(d)?.close ?? null : null);
  const nameOf = new Map(companies.map(c => [c.code, c.name]));
  // 결산 — 한국 판은 quality 에 바로 · 미국 판은 quality.metrics(나스닥 결산표 · 없으면 네이버 해외주식 결산 — scripts/atlas11/us/collect.mjs)에 있음
  //   2026-10-09 19:29 「미국장 까지 다 대입」 — 미국 판도 결산 흑자(영업이익 · 순이익)를 셀 수 있게 이어 줌 · 결산 달은 「2025.12」 꼴로(「2025-12-31」 · 「2025.12.31」)
  const fyOf = v => { const m = String(v ?? '').match(/^(\d{4})[-.](\d{1,2})/); return m ? `${m[1]}.${m[2].padStart(2, '0')}` : v ?? null; };
  const fundOf = new Map(assets.map(a => { const q = a.quality ?? null, m = q?.metrics; return [String(a.code), m ? {...q, ...m, fiscalYear: fyOf(m.fiscalYear), roe: fin(q.roe) ? q.roe : m.roe, debt: fin(q.debt) ? q.debt : m.debt} : q]; }));

  /* ── 기업행사 · 거래정지 공시(관측 묶음) ── */
  const caDisc = new Map();
  for (const x of snap?.disclosures ?? []) for (const it of x.items ?? []) if (it.corporateAction && CA_WORDS.has(it.actionWord)) {
    const l = caDisc.get(x.code) ?? []; l.push({day: pickDay(it.publishedAt), word: it.actionWord, title: it.title}); caDisc.set(x.code, l);
  }

  /* ── 종목 상태 · 같은 기간 수익률(기준일 종가 · 1 · 5 · 20거래일 전 종가) ── */
  const w = {d1: back(1), d5: back(5), d20: back(20), d60: back(60)};
  const stocks = companies.map(c => {
    const code = c.code, pm = prices.get(code) ?? new Map();
    const last = [...pm.keys()].filter(d => !asOf || d <= asOf).sort().at(-1) ?? null;
    const lag = last && k0 >= 0 ? k0 - ses.indexOf(last) : null;
    let status = 'ok';
    if (!last) status = 'missing';
    else if (last !== asOf) status = lag != null && lag > RULES.staleSessions ? 'stale' : 'late';
    // 가격 기준이 바뀐 날(한국 하루 제한폭 ±30% 를 넘은 변화) — 20거래일 안
    const jumps = [];
    if (place === 'kr' && k0 >= 20) for (let k = k0 - 19; k <= k0; k++) { const a = closeOn(code, ses[k - 1]), b = closeOn(code, ses[k]); const r = pctRet(b, a); if (fin(r) && Math.abs(r) > RULES.priceLimitKr) jumps.push({day: ses[k], r}); }
    if (status === 'ok' && jumps.length) status = 'ca'; // 하루 변화가 가격 제한폭(±30%)을 넘은 날(jumps — 화면이 날짜를 씀)
    const cas = (caDisc.get(code) ?? []).filter(x => x.day && (!w.d20 || x.day >= w.d20));
    const ok = status === 'ok', end = ok ? closeOn(code, asOf) : null;
    const r = n => (ok ? pctRet(end, closeOn(code, w['d' + n])) : null);
    const q = fundOf.get(code);
    return {code, name: c.name, g: c.group?.id ?? null, gl: c.group?.label ?? null, sec: c.sector ?? null, kind: c.kind ?? null,
      date: last, close: last ? closeOn(code, last) : null, status, lag, jumps: jumps.map(j => j.day), cas: cas.length ? [...new Set(cas.map(x => x.word))] : [],
      r1: r(1), r5: r(5), r20: r(20), r60: r(60),
      fund: q ? {fy: q.fiscalYear ?? null, roe: fin(q.roe) ? q.roe : null, debt: fin(q.debt) ? q.debt : null, debtExempt: !!q.debtExempt, op: fin(q.op) ? q.op : null, net: fin(q.net) ? q.net : null, cap: fin(q.marketCapEok) ? q.marketCapEok : null, capDay: q.capDay ?? null} : null};
  });
  const byCode = new Map(stocks.map(s => [s.code, s]));
  const statusCount = st => stocks.filter(s => s.status === st).length;
  const excl = xs => ({late: xs.filter(s => s.status === 'late').length, stale: xs.filter(s => s.status === 'stale').length, ca: xs.filter(s => s.status === 'ca').length, missing: xs.filter(s => s.status === 'missing').length});

  /* ── ① 언제 ── */
  const when = {asOf, basis: 'close', closeAt: placeInfo.closeAt ?? null, generatedAt: manifest.generatedAt ?? null, collectedAt: snap?.fetchedAt ?? manifest.market?.fetchedAt ?? null,
    companies: companies.length, current: statusCount('ok') + statusCount('ca'), late: statusCount('late'), stale: statusCount('stale'), missing: statusCount('missing'), ca: statusCount('ca'),
    lateList: stocks.filter(s => s.status === 'late' || s.status === 'stale' || s.status === 'missing').map(s => ({code: s.code, name: s.name, date: s.date, status: s.status})),
    windows: {d1: w.d1, d5: w.d5, d20: w.d20}};

  /* ── ② 시장: 공식 지수 · 시장 전체(모으지 않음) · ATLAS 선정 표본 ── */
  const idxRows = (index?.rows ?? []).filter(r => r?.date && fin(r.close) && (!asOf || r.date <= asOf)).sort((a, b) => a.date.localeCompare(b.date));
  const idxOn = d => idxRows.find(r => r.date === d)?.close ?? null;
  const idxLast = idxRows.at(-1) ?? null;
  const idxRet = n => (idxLast && idxLast.date === asOf ? pctRet(idxLast.close, idxOn(w['d' + n])) : null);
  const daily = idxRows.slice(-21).map((r, i, a) => (i ? pctRet(r.close, a[i - 1].close) : null)).slice(1);
  const indexInfo = index ? {symbol: index.symbol, name: index.name, date: idxLast?.date ?? null, close: idxLast?.close ?? null, r1: idxRet(1), r5: idxRet(5), r20: idxRet(20), r60: idxRet(60),
    vol20: daily.length === 20 ? stdev(daily) : null, source: index.source ?? null} : null;
  const mkItems = (manifest.market?.items ?? []).map(x => ({symbol: x.symbol, name: x.name, date: x.date, close: x.close, changePct: fin(x.changePct) ? x.changePct : null, sourceName: x.sourceName ?? null, sourceUrl: x.sourceUrl ?? null}));
  const okS = stocks.filter(s => s.status === 'ok');
  const market = {index: mkItems, ref: indexInfo,
    sample: {scope: 'atlas', n: companies.length, d1: summarize(stocks.map(s => s.r1)), d5: summarize(stocks.map(s => s.r5)), d20: summarize(stocks.map(s => s.r20)), excluded: excl(stocks)},
    whole: {status: 'none', reason: '시장 전체 종목의 오름 · 내림 수를 모으지 않음'},
    value: {status: 'none', reason: '거래대금을 모으지 않음'}};

  /* ── ③ 업종(ATLAS 분류 73개 · 5곳씩) · 공식 업종(네이버 업종) ── */
  const r20Idx = indexInfo?.r20 ?? null, r5Idx = indexInfo?.r5 ?? null;
  const stateOf = (d20, d5) => {
    if (!d20 || d20.n < RULES.minN) return {level: 'na', trend: null};
    let level;
    if (!(d20.mean > 0)) level = 'weak';
    else if (d20.median > 0 && d20.exTop1 > 0 && d20.upRatio >= RULES.broadUp) level = 'broad';
    else if (!(d20.median > 0) || !(d20.exTop1 > 0) || d20.upRatio < RULES.narrowUp) level = 'narrow';
    else level = 'mixed';
    let trend = null;
    if (d20.mean > 0 && d5 && d5.n >= RULES.minN) {
      if (d5.mean > 0 && d5.upRatio > d20.upRatio) trend = 'spread';
      else if (d5.mean < 0 && d5.upRatio < 50) trend = 'fade';
    }
    return {level, trend};
  };
  const sectors = groups.map(g => {
    const ms = (g.codes ?? []).map(c => byCode.get(c)).filter(Boolean);
    const d20 = summarize(ms.map(s => s.r20)), d5 = summarize(ms.map(s => s.r5)), st = stateOf(d20, d5);
    const caps = ms.map(s => s.fund?.cap).filter(fin);
    return {id: g.id, label: g.label, official: [...new Set(ms.map(s => s.sec).filter(Boolean))], n: ms.length, codes: ms.map(s => s.code), hot: !!g.hot, rank: g.rank ?? null,
      from: w.d20, to: asOf, d20, d5, vs20: gapPp(d20.mean, r20Idx), vs5: gapPp(d5.mean, r5Idx), ...st, excluded: excl(ms),
      cap: {selectedEok: caps.length === ms.length && caps.length ? caps.reduce((a, b) => a + b, 0) : null, coverage: null, why: '업종 전체 시가총액을 모으지 않음'},
      whole: {status: 'none', why: '업종 전체 종목 값을 모으지 않음(선정 5곳만)'}};
  });
  const officialMap = new Map();
  for (const s of stocks) if (s.sec) { const l = officialMap.get(s.sec) ?? []; l.push(s); officialMap.set(s.sec, l); }
  const official = [...officialMap].map(([name, ms]) => { const d20 = summarize(ms.map(s => s.r20)), d5 = summarize(ms.map(s => s.r5)); return {name, n: ms.length, groups: [...new Set(ms.map(s => s.g).filter(Boolean))], d20, d5, ...stateOf(d20, d5)}; })
    .sort((a, b) => (b.d20.mean ?? -Infinity) - (a.d20.mean ?? -Infinity));
  const tally = (xs, key) => xs.reduce((o, x) => { o[x[key] ?? 'none'] = (o[x[key] ?? 'none'] ?? 0) + 1; return o; }, {});
  const breadth = {atlas: {n: sectors.length, level: tally(sectors, 'level'), trend: tally(sectors, 'trend')}, official: {n: official.length, level: tally(official, 'level'), trend: tally(official, 'trend')}};

  /* ── ② 돈 흐름: 투자자별 순매매(공식 = 주식 수 · 금액은 추정) ── */
  let flows = {available: false, reason: placeInfo.flowsNone ?? '투자자별 매매 자료 없음'};
  let candDaily = null; // 종목마다 날마다 외국인+기관 순매수 × 그날 종가(억) — 매수 검토 후보의 다시 뽑기(4판 20만 번)만 씀(판 읽기 파일에는 싣지 않음)
  if (place === 'kr' && Array.isArray(snap?.flows) && snap.flows.length) {
    const dates = [...new Set(snap.flows.flatMap(f => (f.rows ?? []).map(r => r.date)))].filter(d => !asOf || d <= asOf).sort();
    const last10 = dates.slice(-10), lastN = n => last10.slice(-n);
    const rowsOf = new Map(snap.flows.map(f => [f.code, new Map((f.rows ?? []).map(r => [r.date, r]))]));
    const WHO = [['foreign', 'foreignNet'], ['institution', 'institutionNet'], ['individual', 'individualNet']];
    // 한 종목 · 한 주체 · n일 합(주식 수 · 추정액) — 그 n일 줄이 다 있어야 셈(빠지면 null)
    const sumOf = (code, key, n) => {
      const m = rowsOf.get(code); if (!m) return null; let sh = 0, est = 0, estOk = true;
      for (const d of lastN(n)) { const r = m.get(d); if (!r || !fin(r[key])) return null; sh += r[key]; const c = closeOn(code, d); if (fin(c)) est += r[key] * c; else estOk = false; }
      return {sh, est: estOk ? est : null};
    };
    // 여러 종목 합 — 주식 수는 그 n일 줄이 다 있는 종목만 · 추정액은 그날 종가까지 다 있는 종목만(빠진 종목 수를 함께 · 0 으로 채우지 않음)
    const sumSet = (codes, key, n) => { let sh = 0, est = 0, nOk = 0, nEst = 0; for (const c of codes) { const v = sumOf(c, key, n); if (!v) continue; nOk++; sh += v.sh; if (fin(v.est)) { est += v.est; nEst++; } } return {n: nOk, of: codes.length, sh: nOk ? sh : null, est: nEst ? est : null, nEst, estMissing: nOk - nEst}; };
    const all = companies.map(c => c.code);
    const persist = (codes, key) => { // 날마다 표본 합의 부호 — 순매수 날 수 · 끝에서부터 같은 부호로 이어진 날 수
      const day = last10.map(d => { let s = 0, n = 0; for (const c of codes) { const r = rowsOf.get(c)?.get(d); if (r && fin(r[key])) { s += r[key]; n++; } } return n ? s : null; });
      const signs = day.map(v => (fin(v) ? Math.sign(v) : 0)); const lastSign = signs.at(-1) ?? 0; let streak = 0; for (let i = signs.length - 1; i >= 0 && signs[i] === lastSign && lastSign !== 0; i--) streak++;
      return {days: last10.length, buyDays: signs.filter(x => x > 0).length, sellDays: signs.filter(x => x < 0).length, streak, streakSign: lastSign, byDay: day};
    };
    const provisional = last10.length ? snap.flows.some(f => (f.rows ?? []).some(r => r.date === last10.at(-1) && r.status !== 'reported')) : false;
    const mk = {};
    for (const [who, key] of WHO) mk[who] = {d1: sumSet(all, key, 1), d5: sumSet(all, key, 5), d10: sumSet(all, key, 10), d20: null, persist: persist(all, key)};
    const gFlows = sectors.map(sc => { const o = {id: sc.id, label: sc.label}; for (const [who, key] of WHO) o[who] = sumSet(sc.codes, key, 5); const fi = fin(o.foreign.est) && fin(o.institution.est) ? o.foreign.est + o.institution.est : null; o.fiEst5 = fi;
      o.agree = !fin(fi) || !fin(sc.d5.mean) || fi === 0 || sc.d5.mean === 0 ? 'na' : (fi > 0) === (sc.d5.mean > 0) ? 'same' : 'diff'; o.r5 = sc.d5.mean; return o; });
    const sFlows = stocks.map(s => ({code: s.code, f5: sumOf(s.code, 'foreignNet', 5), i5: sumOf(s.code, 'institutionNet', 5), p5: sumOf(s.code, 'individualNet', 5), f1: sumOf(s.code, 'foreignNet', 1), i1: sumOf(s.code, 'institutionNet', 1),
      f10: sumOf(s.code, 'foreignNet', 10), i10: sumOf(s.code, 'institutionNet', 10)})); // 10거래일 = 업종 순환(돈 흐름)과 같은 창 — 매수 검토 후보(2026-10-09 cand-rules-2)가 씀
    candDaily = {dates: last10, stocks: new Map(stocks.map(s => [s.code, (() => { // 열흘 줄이 다 있고 그날 종가가 다 있어야(빠지면 null — sumOf 와 같음)
      const m = rowsOf.get(s.code); if (!m) return null; const out = [];
      for (const d of last10) { const r = m.get(d), c = closeOn(s.code, d); if (!r || !fin(r.foreignNet) || !fin(r.institutionNet) || !fin(c)) return null; out.push((r.foreignNet + r.institutionNet) * c / 1e8); }
      return out; })()]))};
    for (const x of sFlows) { const s = byCode.get(x.code); s.fl = {f5: x.f5?.sh ?? null, i5: x.i5?.sh ?? null, p5: x.p5?.sh ?? null, f5e: x.f5?.est ?? null, i5e: x.i5?.est ?? null, f1: x.f1?.sh ?? null, i1: x.i1?.sh ?? null,
      f10: x.f10?.sh ?? null, i10: x.i10?.sh ?? null, f10e: x.f10?.est ?? null, i10e: x.i10?.est ?? null, d10: last10.length, from10: last10[0] ?? null}; }
    const top = (key, dir) => stocks.filter(s => fin(s.fl?.[key])).sort((a, b) => dir * (b.fl[key] - a.fl[key])).slice(0, 5).map(s => ({code: s.code, name: s.name, g: s.g, gl: s.gl, est: s.fl[key], r5: s.r5}));
    flows = {available: true, unit: 'shares', official: {amount: null, why: '공식 순매매 금액(원)은 모으지 않음 — 공식 값은 순매수 주식 수'},
      estimate: '추정액 = 날마다 순매수 주식 수 × 그날 종가의 합(공식 금액 아님)', source: snap.flows[0]?.sourceUrl?.replace(/\/stock\/\d+\//, '/stock/{종목}/') ?? null, fetchedAt: snap.fetchedAt ?? null,
      dates: last10, provisional, provisionalDay: provisional ? last10.at(-1) : null, ratio: {value: null, why: '거래대금을 모으지 않아 「거래대금 대비 순매수 비율」은 계산 불가'},
      market: mk, d20: {why: `순매매는 ${last10.length}거래일치만 모음 — 20거래일 누적은 계산 불가`}, groups: gFlows,
      top: {foreignBuy: top('f5e', 1), foreignSell: top('f5e', -1), instBuy: top('i5e', 1), instSell: top('i5e', -1)}};
  }

  /* ── ③ 변화 · ⑤ 검증: 저녁 기록(고치지 않음) ── */
  const recs = [...(evening ?? [])].filter(r => r?.asOf).sort((a, b) => a.asOf.localeCompare(b.asOf));
  // 매수 검토 후보 기록 — 날짜마다 처음 남은 목록 하나(저녁 기록의 cand · 후보 발행본 가운데 먼저 남은 것 · 둘 다 고치지 않음)
  const candRecs = (() => {
    const by = new Map();
    const put = (x, src) => { if (!x?.asOf || !Array.isArray(x.cand)) return; const o = by.get(x.asOf); if (!o || Date.parse(x.recordedAt ?? '') < Date.parse(o.recordedAt ?? '')) by.set(x.asOf, {asOf: x.asOf, recordedAt: x.recordedAt ?? null, boardId: x.boardId ?? null, universe: x.universe ?? null, rules: (src === 'evening' ? x.candRules : x.rules) ?? null, cand: x.cand, src}); };
    for (const r of recs) put(r, 'evening'); for (const p of candPubs ?? []) put(p, 'pub');
    return [...by.values()].sort((a, b) => a.asOf.localeCompare(b.asOf));
  })();
  const cur = recs.at(-1) ?? null, prev = recs.at(-2) ?? null;
  const membersOf = rec => { const set = new Map(); if (!rec) return set;
    for (const x of rec.next ?? []) set.set(x.code, [...(set.get(x.code) ?? []), 'next']);
    for (const x of rec.similar ?? []) set.set(x.code, [...(set.get(x.code) ?? []), 'similar']);
    for (const g of rec.hot ?? []) for (const c of groups.find(y => y.id === g.id)?.codes ?? []) set.set(c, [...(set.get(c) ?? []), 'hot']);
    return set; };
  const mNow = membersOf(cur), mPrev = membersOf(prev);
  const lateAt = (code, rec) => { // 그 기록을 남길 때 그 날 종가가 아직 없었나(종가 줄의 관측 시각이 기록보다 늦음)
    const row = prices.get(code)?.get(rec?.asOf); if (!rec?.recordedAt) return null; if (!row) return true; return row.observedAt ? Date.parse(row.observedAt) > Date.parse(rec.recordedAt) : null; };
  const causeOf = (code, entering) => {
    if (prev && cur && prev.universe !== cur.universe) return 'universe';
    const s = byCode.get(code); if (s && s.status !== 'ok' && s.status !== 'ca') return 'late';
    if (entering && prev && lateAt(code, prev) === true) return 'caught';
    return 'price';
  };
  // 새 공시(앞 기록을 남긴 때 뒤) — 일정 묶음(agenda.json)의 중요도 별과 함께 · 같은 공시(같은 번호)는 한 번
  const sinceAt = prev?.recordedAt ?? null, newDisc = [];
  if (sinceAt && agenda?.byCode) for (const [code, x] of Object.entries(agenda.byCode)) for (const d of x.disclosures ?? []) if (d.publishedAt && Date.parse(d.publishedAt) > Date.parse(sinceAt) && !newDisc.some(y => y.id === d.id && y.code === code)) newDisc.push({code, name: x.name, id: d.id ?? null, title: d.title, publishedAt: d.publishedAt, level: d.level ?? null});
  newDisc.sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || b.publishedAt.localeCompare(a.publishedAt));
  const changes = cur ? {from: prev?.asOf ?? null, fromAt: prev?.recordedAt ?? null, to: cur.asOf, at: cur.recordedAt, first: !prev,
    hotIn: (cur.hot ?? []).filter(x => !(prev?.hot ?? []).some(y => y.id === x.id)).map(x => ({id: x.id, label: x.label})),
    hotOut: (prev?.hot ?? []).filter(x => !(cur.hot ?? []).some(y => y.id === x.id)).map(x => ({id: x.id, label: x.label})),
    nextIn: (cur.next ?? []).filter(x => !(prev?.next ?? []).some(y => y.code === x.code)).map(x => x.code), nextOut: (prev?.next ?? []).filter(x => !(cur.next ?? []).some(y => y.code === x.code)).map(x => x.code),
    similarIn: (cur.similar ?? []).filter(x => !(prev?.similar ?? []).some(y => y.code === x.code)).map(x => x.code), similarOut: (prev?.similar ?? []).filter(x => !(cur.similar ?? []).some(y => y.code === x.code)).map(x => x.code),
    disclosures: newDisc.slice(0, 40), nDisclosures: newDisc.length, nTop: newDisc.filter(x => x.level === 3).length} : null;

  /* ── ③ 종목 묶음: 새로 발견 · 근거 강화 · 근거 약화 (실험 규칙 · 앞 기록과 견줌) ── */
  const sincePrev = code => (prev ? pctRet(closeOn(code, asOf), closeOn(code, prev.asOf)) : null);
  const datesSince = prev ? [...new Set(snap?.flows?.flatMap(f => (f.rows ?? []).map(r => r.date)) ?? [])].filter(d => d > prev.asOf && (!asOf || d <= asOf)) : [];
  const fiSince = code => { if (!prev || !datesSince.length) return null; const f = snap?.flows?.find(x => x.code === code); if (!f) return null; let s = 0; for (const d of datesSince) { const r = (f.rows ?? []).find(x => x.date === d); if (!r || !fin(r.foreignNet) || !fin(r.institutionNet)) return null; s += r.foreignNet + r.institutionNet; } return s; };
  const groupSince = new Map(sectors.map(sc => [sc.id, mean(sc.codes.map(c => (byCode.get(c)?.status === 'ok' ? sincePrev(c) : null)))]));
  const discSince = code => newDisc.filter(x => x.code === code);
  for (const s of stocks) {
    const now = mNow.get(s.code) ?? [], was = mPrev.get(s.code) ?? [], why = [];
    const rs = s.status === 'ok' ? sincePrev(s.code) : null, gs = s.g ? groupSince.get(s.g) : null, fi = fiSince(s.code), nd = discSince(s.code);
    s.since = prev ? {from: prev.asOf, r: rs, vsGroup: gapPp(rs, gs), fiShares: fi, disc: nd.length, discTop: nd.filter(x => x.level === 3).length} : null;
    s.lists = [...new Set(now)];
    let bucket = null;
    const entered = now.filter(x => !was.includes(x)), left = was.filter(x => !now.includes(x));
    if (prev && entered.length && !was.length) { bucket = 'new'; why.push({k: 'enter', lists: entered, cause: causeOf(s.code, true)}); }
    else if (prev && nd.some(x => x.level === 3)) { bucket = 'new'; why.push({k: 'info', n: nd.filter(x => x.level === 3).length}); }
    if (!bucket && prev && was.length && !now.length) { bucket = 'down'; why.push({k: 'leave', lists: left, cause: causeOf(s.code, false)}); }
    if (!bucket && prev && was.length && now.length) {
      const beat = fin(rs) && fin(gs) ? rs > gs : null, buy = fin(fi) ? fi > 0 : null;
      if (beat === true && buy === true) { bucket = 'up'; why.push({k: 'both', vsGroup: gapPp(rs, gs), fi}); }
      else if (beat === false && buy === false) { bucket = 'down'; why.push({k: 'both', vsGroup: gapPp(rs, gs), fi}); }
    }
    s.bucket = bucket; s.bucketWhy = why;
  }
  // 최초 포착 이후(저녁 기록에 처음 든 날 · 그 기록의 종가부터 지금까지) — 지수와 같은 기간
  for (const s of stocks) {
    const first = recs.find(r => membersOf(r).has(s.code));
    if (!first) { s.firstSeen = null; continue; }
    const r0 = s.status === 'ok' ? pctRet(closeOn(s.code, asOf), closeOn(s.code, first.asOf)) : null, i0 = idxLast?.date === asOf ? pctRet(idxLast.close, idxOn(first.asOf)) : null;
    s.firstSeen = {asOf: first.asOf, recordedAt: first.recordedAt, lists: [...new Set(membersOf(first).get(s.code))], r: r0, idx: i0, gap: gapPp(r0, i0), records: recs.filter(r => membersOf(r).has(s.code)).length};
  }
  // 같은 업종 안 비교(자기 자신 뺀 평균 · 업종 평균 · 시장) — 20거래일
  for (const sc of sectors) { const vals = sc.codes.map(c => byCode.get(c)?.r20 ?? null); sc.codes.forEach((c, i) => { const s = byCode.get(c); s.vsPeers20 = s.status === 'ok' ? gapPp(s.r20, meanExSelf(vals, i)) : null; s.vsGroup20 = s.status === 'ok' ? gapPp(s.r20, sc.d20.mean) : null; s.vsIdx20 = gapPp(s.r20, r20Idx); }); }

  /* ── ⑤ 검증: 기록마다 5 · 10 · 20거래일 뒤 결과(평가일이 안 왔으면 평가 대기) ── */
  const H = [5, 10, 20], latest = asOf;
  const evalList = (rec, codes, h) => {
    const k = ses.indexOf(rec.asOf), due = k >= 0 ? sesAt(k + h) : null;
    if (!due) return {h, due: null, status: 'nodate'};
    if (!latest || due > latest) return {h, due, status: 'pending'};
    const rows = codes.map(code => { const path = []; for (let i = k; i <= k + h; i++) path.push(closeOn(code, ses[i])); return {code, ps: pathStats(path)}; });
    const ok = rows.filter(r => r.ps), rets = ok.map(r => r.ps.ret), mk = pctRet(idxOn(due), idxOn(rec.asOf));
    const grpOf = code => { const s = byCode.get(code); const g = sectors.find(x => x.id === s?.g); return g ? mean(g.codes.filter(c => c !== code).map(c => pathStats([closeOn(c, rec.asOf), closeOn(c, due)])?.ret ?? null)) : null; };
    const vsMk = ok.map(r => gapPp(r.ps.ret, mk)), vsG = ok.map(r => gapPp(r.ps.ret, grpOf(r.code)));
    return {h, due, status: 'done', n: ok.length, excluded: rows.length - ok.length, ret: summarize(rets), market: mk, vsMarket: summarize(vsMk), vsGroup: summarize(vsG),
      losses: rets.filter(x => x < 0).length, mdd: summarize(ok.map(r => r.ps.mdd)), minRet: summarize(ok.map(r => r.ps.minRet)),
      success: {rule: '시장(지수) 대비 수익률 격차 > 0', n: vsMk.filter(fin).length, hit: vsMk.filter(x => fin(x) && x > 0).length}};
  };
  const momentumTop = (rec, size) => { // 비교 기준: 같은 날 단순 최근 20거래일 상승률 상위(그날까지 종가만)
    const k = ses.indexOf(rec.asOf); if (k < 20) return [];
    return companies.map(c => ({code: c.code, r: pctRet(closeOn(c.code, rec.asOf), closeOn(c.code, ses[k - 20]))})).filter(x => fin(x.r)).sort((a, b) => b.r - a.r).slice(0, size).map(x => x.code);
  };
  const verify = {rules: '선정 = 저녁 기록(그 날 저녁 7시 뒤 한 번 · 고치지 않음)', success: '성공 = 같은 기간 지수 대비 수익률 격차가 0%p 보다 큼(실험 정의)', priceBasis: '가격수익률(배당 빼고) · 수정주가 여부 확인 안 됨',
    records: [...recs, ...candRecs.filter(c => !recs.some(r => r.asOf === c.asOf))].sort((a, b) => a.asOf.localeCompare(b.asOf)).map(r => {
      const ev = recs.includes(r), cr = candRecs.find(c => c.asOf === r.asOf) ?? null; // cr = 그날 처음 남은 후보 목록(저녁 기록 · 후보 발행본 — 지난 날을 다시 만들지 않음)
      const lists = {...(cr ? {cand: cr.cand.map(x => x.code)} : {}), ...(ev ? {next: (r.next ?? []).map(x => x.code), similar: (r.similar ?? []).map(x => x.code), hot: (r.hot ?? []).flatMap(g => groups.find(y => y.id === g.id)?.codes ?? [])} : {})};
      const base = {...(lists.cand ? {cand: momentumTop(r, lists.cand.length)} : {}), ...(ev ? {next: momentumTop(r, lists.next.length)} : {})}; // 비교 기준: 같은 날 같은 수의 단순 20거래일 상승률 상위
      return {asOf: r.asOf, recordedAt: r.recordedAt, boardId: r.boardId ?? null, universe: r.universe ?? null, candOnly: !ev, cand: cr ? {recordedAt: cr.recordedAt, src: cr.src, rules: cr.rules} : null,
        sizes: {...(ev ? {next: lists.next.length, similar: lists.similar.length, hot: (r.hot ?? []).length, hotCodes: lists.hot.length} : {}), ...(lists.cand ? {cand: lists.cand.length} : {})},
        evals: Object.fromEntries(Object.keys(lists).map(key => [key, H.map(h => evalList(r, lists[key], h))])), baseline: Object.fromEntries(Object.keys(base).map(key => [key, H.map(h => evalList(r, base[key], h))]))};
    }),
    turnover: recs.slice(1).map((r, i) => { const p = recs[i], diff = (a, b, f) => ({in: a.filter(x => !b.some(y => f(y) === f(x))).length, out: b.filter(x => !a.some(y => f(y) === f(x))).length, n: a.length});
      return {from: p.asOf, to: r.asOf, next: diff(r.next ?? [], p.next ?? [], x => x.code), similar: diff(r.similar ?? [], p.similar ?? [], x => x.code), hot: diff(r.hot ?? [], p.hot ?? [], x => x.id)}; }),
    unique: {next: new Set(recs.flatMap(r => (r.next ?? []).map(x => x.code))).size, similar: new Set(recs.flatMap(r => (r.similar ?? []).map(x => x.code))).size, hot: new Set(recs.flatMap(r => (r.hot ?? []).map(x => x.id))).size},
    picks: {next: recs.reduce((t, r) => t + (r.next ?? []).length, 0), similar: recs.reduce((t, r) => t + (r.similar ?? []).length, 0), hot: recs.reduce((t, r) => t + (r.hot ?? []).length, 0)}};
  verify.firstDue = verify.records.flatMap(r => Object.values(r.evals).flat()).filter(e => e.status === 'pending').map(e => e.due).sort()[0] ?? null;
  verify.done = verify.records.flatMap(r => Object.values(r.evals).flat()).filter(e => e.status === 'done').length;

  /* ── ④ 일정: 확인된 일정표(공식 출처) — 직접 관련 종목 · 업종 참고 종목 · 확정 여부 · 지난 일정은 그날 관측(인과 아님) ── */
  const lvOf = new Map(); for (const e of agenda?.market ?? []) lvOf.set(e.id, e.level); for (const x of Object.values(agenda?.byCode ?? {})) for (const e of x.upcoming ?? []) lvOf.set(e.id, e.level);
  const dayRet = (code, d) => { const k = ses.indexOf(d); return k > 0 ? pctRet(closeOn(code, d), closeOn(code, ses[k - 1])) : null; };
  const idxDay = d => { const i = idxRows.findIndex(r => r.date === d); return i > 0 ? pctRet(idxRows[i].close, idxRows[i - 1].close) : null; };
  const evOut = (events ?? []).filter(e => e?.date && e?.name).map(e => {
    const sc = e.scope ?? {}, direct = (sc.codes ?? []).filter(c => byCode.has(c)), secs = sc.sectors ?? [];
    const ref = sc.type === 'sector' ? stocks.filter(s => secs.includes(s.sec)).map(s => s.code) : [];
    const past = asOf && e.date <= asOf;
    return {id: e.id, date: e.date, name: e.name, kind: e.kind ?? null, scope: sc.type ?? null, route: e.route ?? null, status: e.status ?? null, level: lvOf.get(e.id) ?? null,
      sources: (e.sources ?? []).map(x => ({name: x.name ?? null, url: x.url ?? null})), seen: pickDay((e.sources ?? []).map(x => x.retrievedAt).filter(Boolean).sort()[0] ?? null), direct, sectors: secs, ref: ref.slice(0, 8), nRef: ref.length,
      after: past ? {session: ses.includes(e.date), idx: idxDay(e.date), stocks: direct.map(c => ({code: c, day: dayRet(c, e.date)}))} : null};
  }).sort((a, b) => a.date.localeCompare(b.date) || (b.level ?? 0) - (a.level ?? 0));

  const nBucket = b => stocks.filter(s => s.bucket === b).length;
  // 매수 검토 후보(2026-10-09 03:09 「ATLAS 제품 재설계 명령」 · lib/atlas11/cand.mjs · 연구용 · 성능 검증 전) — 기록(고치지 않음)은 날짜마다 처음 남은 목록
  const cand = candOf({place, asOf, stocks, board, agenda, ref: market.ref, records: candRecs, sessions: ses, closeAt: placeInfo.closeAt ?? '15:30 KST', rotation, priceAt: closeOn, growPubs}); // 5판(기르기판 · 2026-10-09 15:21 「만들어 줘」) — priceAt = 종가(1년 추세 · 담은 뒤 성적) · growPubs = 5판 규칙 폴더 발행본(첫 담는 날) · rotation = 돈 흐름(곁 정보)
  // 선정 이후 결과(13 「최초 발행본과 이후 실제 관측」) — 후보 기록에 처음 든 날의 종가부터 지금까지 · 지수와 같은 기간 · 그때 적은 이유는 고치지 않고 그대로
  const hist = {};
  for (const cr of candRecs) for (const x of cr.cand) {
    const o = hist[x.code];
    if (!o) hist[x.code] = {first: {asOf: cr.asOf, recordedAt: cr.recordedAt, src: cr.src, rank: x.rank, close: x.close ?? null, date: x.date ?? null, status: x.status ?? null, reason: x.reason ?? null, risk: x.risk ?? null}, records: 1, last: {asOf: cr.asOf, rank: x.rank}};
    else { o.records++; o.last = {asOf: cr.asOf, rank: x.rank}; }
  }
  for (const [code, o] of Object.entries(hist)) {
    const s = byCode.get(code), r0 = s?.status === 'ok' ? pctRet(closeOn(code, asOf), closeOn(code, o.first.asOf)) : null, i0 = idxLast?.date === asOf ? pctRet(idxLast.close, idxOn(o.first.asOf)) : null;
    Object.assign(o, {name: s?.name ?? null, r: r0, idx: i0, gap: gapPp(r0, i0), now: cand.items.some(y => y.code === code), due: (() => { const k = ses.indexOf(o.first.asOf); return k >= 0 ? sesAt(k + (cand.evalDays ?? 20)) : null; })()});
  }
  cand.hist = hist; cand.records = candRecs.map(c => ({asOf: c.asOf, recordedAt: c.recordedAt, src: c.src, n: c.cand.length}));
  return {schema: LENS_SCHEMA, boardId: board?.boardId ?? null, place, asOf, made, calc: CALC_VERSION, rules: RULES,
    universe: {id: manifest.universeSet?.id ?? null, label: manifest.universeSet?.label ?? null, selectedOn: manifest.universeSet?.selectedOn ?? null},
    when, market, sectors, official, breadth, flows, changes, events: evOut, buckets: {new: nBucket('new'), up: nBucket('up'), down: nBucket('down'), all: stocks.length}, stocks, verify, problems, cand};
}

/** 렌즈가 스스로 맞는지(싣기 전 검사) — 틀린 것 목록(비면 통과) */
export function checkLens(l) {
  const bad = [];
  if (l?.schema !== LENS_SCHEMA) bad.push('schema');
  if (!l?.boardId) bad.push('boardId 없음');
  for (const sc of l?.sectors ?? []) { if (sc.d20.n + sc.d20.excluded !== sc.n) bad.push(`${sc.id} 개수가 맞지 않음`); if (sc.d20.n && !fin(sc.d20.mean)) bad.push(`${sc.id} 평균 없음`); }
  for (const s of l?.stocks ?? []) if (s.status !== 'ok' && (fin(s.r20) || fin(s.r5) || fin(s.r1))) bad.push(`${s.code} 상태 ${s.status} 인데 수익률이 있음`);
  return bad;
}

/** 싣는 글(JSON) — 셈은 반올림 없이 끝낸 뒤 싣는 값만 소수 넷째 자리로(화면은 한 자리 · 파일 크기를 줄임) */
export const lensJson = l => JSON.stringify(l, (k, v) => (typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v) ? Math.round(v * 1e4) / 1e4 : v));
