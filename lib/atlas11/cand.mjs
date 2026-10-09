/**
 * ATLAS 11 · 매수 검토 후보(최대 7곳) — 규칙 cand-rules-5 「기르기판 — 1년 추세 상위 20% 그물 · 새로 든 초입 7곳 · 석 달 담아 두기」(연구용 · 성능 검증 전)
 *   사장님 2026-10-09 03:09(마카오 시각) 첨부 「ATLAS 제품 재설계 명령 — 목적: 지금 매수할 가치가 있는 후보 7개를 찾는다」 · 03:59 「잡스라면 … 애플의 방식이 중심」
 *   · 13:48 「난 하루에 돈이 몰리는 것을 찾는게 아닌데 요즘 올리곳을 찾아 시스템에 도입 하는거야」 · 14:21 · 14:36 · 15:00 「더 현명하고 지혜로운 방법을 찾아봐」(세 번)
 *   · 15:20 「내가 뭘 해야 해?」 → 15:21 「만들어 줘」(5판 = 기르기판)
 *   셈만(화면 없음) — 판 읽기(lens.mjs)가 부르고 저녁 7시 기록(build_view.mjs)이 그 결과를 고치지 않고 남긴다 · 시험 tests/atlas11/cand.test.mjs
 *   · 따로 다시 세기(파이썬 · 입력 값 · 달력에서): scripts/atlas11/verify/cand_grow_verify.py
 *   지난 판(기록만 · 고치지 않음): 2판(돈이 들어온 업종 1~3위 안) · 3판(1만 번) · 4판(365곳 돈 유입 비율 · 20만 번 다시 뽑기 · cand-rules-4/2026-10-08.json)
 *
 * 한 문장(잡스라면): 「한 곳을 맞히지 말고 — 1년 동안 센 곳을 그물로 넓게 담고, 새로 든 곳을 7곳 보이고, 석 달은 기다린다.」
 *   ① 1년 추세 = 20거래일 전 종가 ÷ 252거래일 전 종가 − 1(마지막 한 달은 뺌 — 바로 앞 한 달은 되돌림이 섞여서) · 소수 넷째 자리로 맞춤(따로 세기와 같은 값)
 *        · 그날 종가가 없거나 252거래일 기록이 모자라면 셀 수 없음(지어내지 않음)
 *   ② 그물 = 1년 추세를 셀 수 있는 곳 가운데 상위 20%(넘파이 분위수와 같은 직선 보간) — 기준선 아래는 그물 밖
 *   ③ 초입 = 오늘 그물 안 · 20거래일 전(같은 셈)에는 그물 밖이던 곳
 *   ④ 기준(낮추지 않음) = 그날 종가 있음 · 마지막 결산 영업이익 · 순이익 흑자 · 위험 공시 없음(30일 · 장 마감 전)
 *   ⑤ 7곳 = ④를 넘은 초입을 1년 추세 큰 순(같으면 종목 기호) · 같은 업종 3곳까지 · 7곳까지 — 모자라면 모자란 대로(기준을 낮춰 채우지 않음)
 *   ⑥ 담는 날 = 2026-10-08부터 60거래일(석 달)마다 — 그 사이 판은 담는 날 첫 기록의 7곳을 그대로 보임(날마다 바꾸지 않음) · 상태만 날마다(그물 안 · 그물 밖 · 재검토)
 *        · 담는 날 기록이 없으면 그날 값으로 다시 셈(그렇다고 적음)
 *   ⑦ 성적 = 담은 날 종가 → 오늘 종가: 7곳 평균 · 그물 전체(담은 날 값으로 다시 셈 · 기준 없이 값만) · 365곳 평균 — 실제 매매 성과 아님
 *   지난 기록 셈(2024-06~2026-10 · 365곳 · 사장님께 보인 카드): 1곳만 고르면 평균의 0.19배 · 그물을 석 달마다 다시 담으면 1.44배 · 석 달 뒤 평균을 이긴 날 100번 중 85번
 *        · 초입 7곳은 석 달 평균 +9.6%p로 가장 컸지만 이긴 날 60% — 그래서 주인공은 그물 · 초입은 표시
 *   돈 유입 비율(외국인+기관 10거래일 ÷ 시가총액) · 포모지수 · 1~365등 · 업종 돈 흐름은 고르는 데 쓰지 않는 곁 정보 · 20만 번 다시 뽑기는 고르는 데서 내림(4판 기록은 그대로)
 *   쓰는 공시 = 그날 장 마감(한국 15:30) 전에 나온 것만 · 목표가 · 기대 수익률 · 앞날 확률은 만들지 않는다.
 */

export const CAND_RULES = Object.freeze({
  id: 'cand-rules-5',
  label: '매수 검토 후보 규칙 5판 — 기르기판: 1년 추세 상위 20% 그물 · 새로 든 초입 7곳 · 석 달 담아 두기(연구용 · 성능 검증 전)',
  want: 7, perSector: 3, sectors: 3, flowDays: 10, windowDays: 30, heatDays: 7, maxR20: 30, evalDays: 20,
  netPct: 20, look: 252, skip: 20, gap: 20, hold: 60, plantFrom: '2026-10-08', wxDays: 200, // 날씨 = 365곳 같은 무게 평균 지수 ÷ 200거래일 평균(경고만) · 그물 = 상위 20% · 1년 = 252거래일 · 마지막 20거래일 뺌 · 초입 = 20거래일 전과 견줌 · 석 달 = 60거래일 · 첫 담는 날
});
/** 4판(2026-10-09 11:35 「20만번」) 숫자 — 다시 뽑기 셈(mcOf · mcDraw · dailyOf)과 4판 기록 따로 세기만 씀 · 5판은 고르는 데 쓰지 않음 */
export const RULES4 = Object.freeze({id: 'cand-rules-4', want: 7, perSector: 3, flowDays: 10, draws: 200000, moreSeeds: 2});
/** 결산 때 「2025.12」 → 「2025년 12월 결산」(화면 글 — 단위 없는 숫자로 읽히지 않게 · 2026-10-09 브라우저 검사 또렷함 3번) */
const fyK = fy => { const m = String(fy ?? '').match(/^(\d{4})\.(\d{1,2})$/); return m ? `${m[1]}년 ${Number(m[2])}월 결산` : '결산'; };
/** 사업 변화 공시(고르는 데 쓰지 않음 — 이유 칸에 함께 보이기만) */
export const CHANGE = [
  {kind: 'contract', label: '수주(공급계약)', re: /공급계약\s?체결|공급계약체결/},
  {kind: 'capex', label: '시설투자', re: /신규시설투자/},
  {kind: 'return', label: '주주환원(소각 · 자기주식 취득)', re: /주식\s?소각|자기주식\s?취득|자기주식취득/},
];
export const EXCLUDE_RE = /매매거래정지|관리종목|상장폐지|불성실공시|감사의견|회생|횡령|배임|투자위험|투자경고종목\s?지정(?!예고)|공급계약\s?해지|공급계약해지/;
export const DILUTE_RE = /유상증자|전환사채|신주인수권|교환사채/;
export const HEAT_RE = /공매도\s?과열|단기과열|투자경고종목\s?지정예고|소수계좌|특정계좌/;

const fin = x => typeof x === 'number' && Number.isFinite(x);
const day = s => String(s ?? '').slice(0, 10);
const kd = d => (d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '날짜 없음');
const pp = v => (fin(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%p` : '계산 불가');
const pc = v => (fin(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%` : '계산 불가');
/** 억 원 → 「+2,947억」 · 「+25.0조」(부호 앞) */
export const eokTxt = v => { if (!fin(v)) return '계산 불가'; const s = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v); return a >= 1e4 ? `${s}${(a / 1e4).toFixed(1)}조` : `${s}${Math.round(a).toLocaleString('ko-KR')}억`; };
const plusDays = (d, n) => { const t = Date.parse(d + 'T00:00:00Z'); return Number.isFinite(t) ? new Date(t + n * 86400e3).toISOString().slice(0, 10) : null; };
/** 그날 장 마감 시각(ISO) — closeAt 「15:30 KST」 · 한국 시각만 셈(미국 판은 후보를 고르지 않음) */
export function cutoffOf(asOf, closeAt = '15:30 KST') {
  const m = String(closeAt ?? '').match(/(\d{1,2}):(\d{2})/); if (!asOf || !m) return null;
  return `${asOf}T${m[1].padStart(2, '0')}:${m[2]}:00+09:00`;
}
const tOf = d => { const t = Date.parse(d?.publishedAt ?? ''); return Number.isFinite(t) ? t : null; };
/** 공시 제목 속 우선주 이름(「투자경고종목 지정(삼성전기우)」) — 보통주 회사 이름과 다르면 우선주 공시(빼지 않고 위험 칸에 표시) */
const prefOf = (title, name) => { const m = String(title).match(/\(([^()]*우[A-Z0-9]?)\)\s*$/); return m && m[1] !== name ? m[1] : null; };



/* ── 20만 번 다시 뽑기(몬테카를로) — 셈은 여기 한 곳 · 같은 셈을 파이썬으로 따로: scripts/atlas11/verify/cand_mc_verify.py ── */
/** 씨앗 — 글(ASCII)을 32비트 수로(FNV-1a) · 같은 규칙 · 같은 판 날짜면 같은 씨앗 */
export function seedOf(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h = (h ^ (text.charCodeAt(i) & 0xff)) >>> 0; h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** 고른 수(mulberry32) — 0 이상 1 미만 · 32비트 정수 셈만(다른 언어로도 같은 줄) */
export function rngOf(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 회사 날마다 값 확인 — daily = {dates(열 날), stocks: Map(code → 열 날 외국인+기관 × 그날 종가 · 억)} · 열 날이 다 있는 곳만 */
export function dailyOf(daily, rules = RULES4) {
  const n = rules.flowDays, okArr = a => Array.isArray(a) && a.length === n && a.every(fin);
  if (!daily?.stocks || !Array.isArray(daily.dates) || daily.dates.length !== n) return {ok: false, why: `회사 날마다 순매수(${n}거래일)가 없어 20만 번 다시 뽑기를 못 함 — 후보를 고르지 않음`};
  const st = daily.stocks instanceof Map ? [...daily.stocks] : Object.entries(daily.stocks);
  return {ok: true, dates: daily.dates, stocks: new Map(st.filter(([, a]) => okArr(a)))};
}
const cmpCode = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
/**
 * 한 번 뽑기(소거법 한 번) — base = 고정 조건을 넘은 회사 [{code, g(업종 id), cap(억), met(진입 조건 1/0), fi(열 날 · 억)}] · ix = 열 날 차례(0~9 · 거듭 가능)
 *   회사마다 뽑은 날 순매수를 차례로 더함(fe) → + 인 곳 → 진입 조건 먼저 · 비율(fe ÷ 시가총액 × 100) 큰 순 · fe 큰 순 · 종목 기호 → 같은 업종 3곳 · 7곳
 *   → 고른 종목 기호(차례대로) · ix = [0 … 9] 이면 지난 열 날 그대로
 */
export function mcDraw(base, ix, rules = RULES4, buf = null) {
  const m = base.length, n = ix.length, fe = buf?.fe ?? new Float64Array(m), pw = buf?.pw ?? new Float64Array(m), cs = [];
  for (let j = 0; j < m; j++) { const d = base[j].fi; let s = 0; for (let i = 0; i < n; i++) s += d[ix[i]]; fe[j] = s; pw[j] = s / base[j].cap * 100; if (s > 0) cs.push(j); }
  cs.sort((p, q) => (base[q].met - base[p].met) || (pw[q] - pw[p]) || (fe[q] - fe[p]) || cmpCode(base[p].code, base[q].code));
  const per = new Map(), picked = [];
  for (const j of cs) {
    if (picked.length >= rules.want) break;
    const g = base[j].g, k = per.get(g) ?? 0; if (k >= rules.perSector) continue;
    per.set(g, k + 1); picked.push(base[j].code);
  }
  return picked;
}
/** 20만 번 — 한 번마다 rnd() 열 번으로 날 차례(⌊rnd × 10⌋)를 뽑아 mcDraw → Map(code → 7곳에 든 횟수) */
export function mcOf({base, days, rules = RULES4, seed, draws = rules.draws}) {
  const rnd = rngOf(seed), ix = new Array(days), counts = new Map(), buf = {fe: new Float64Array(base.length), pw: new Float64Array(base.length)};
  for (let b = 0; b < draws; b++) {
    for (let i = 0; i < days; i++) ix[i] = Math.floor(rnd() * days);
    for (const c of mcDraw(base, ix, rules, buf)) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return {draws, seed, days, counts};
}
/** 횟수 글 — 「165,039번」 · 「20만 번」 */
export const timesTxt = v => (fin(v) ? `${Math.round(v).toLocaleString('ko-KR')}번` : '계산 불가');
export const drawsTxt = v => (fin(v) && v > 0 && v % 10000 === 0 ? `${v / 10000}만 번` : timesTxt(v));
/** 포모지수(돈 유입 · 0~100) — 비율이 여럿 가운데 어디쯤(1등 100 · 꼴찌 0 · 같은 값은 가운데 자리) */
export function inflowIndexOf(values) {
  const xs = values.filter(fin), n = xs.length;
  return v => { if (!fin(v) || !n) return null; if (n === 1) return 100; let lo = 0, eq = 0; for (const x of xs) { if (x < v) lo++; else if (x === v) eq++; } return Math.round(100 * (lo + 0.5 * (eq - 1)) / (n - 1)); };
}

/**
 * 돈이 들어온 업종 — rotation(돈 흐름 · 업종 순환)의 「늘어난 곳」 1위~3위를 차례대로 보고 조건 둘을 더 봄
 *   반환 [{rank(늘어난 곳 차례), id, label, amount(억 · 시장 대비 시가총액 몫 변화), change(10거래일 · %), fi(외국인+기관 · 억), ok, why}]
 */
export function flowSectorsOf(rotation, rules = CAND_RULES) {
  if (!rotation || rotation.none || !Array.isArray(rotation.in)) return [];
  return rotation.in.slice(0, rules.sectors).map((g, i) => {
    const fi = g.who && fin(g.who.foreign) && fin(g.who.institution) ? g.who.foreign + g.who.institution : null;
    const ch = fin(g.change) ? g.change * 100 : null;
    const why = !(fin(g.amount) && g.amount > 0) ? '시가총액 몫이 늘지 않음' : !fin(fi) ? '외국인 · 기관 매매 자료 없음' : fi <= 0 ? `외국인+기관 순매도(${eokTxt(fi)})` : !(fin(ch) && ch > 0) ? `업종 값이 내림(${pc(ch)})` : null;
    return {rank: i + 1, id: g.id, label: g.label, amount: g.amount ?? null, change: ch, fi, ok: !why, why};
  });
}

/** 종목 하나의 판단 재료 — s(판 읽기 종목) · a(일정표 그 종목) · sec(2 · 3판: 돈이 들어온 업종 줄 — 4판은 고르는 데 쓰지 않아 null) */
export function judgeOf({s, a = null, sec = null, asOf, windowFrom, rules = CAND_RULES, cutoff = null, place = 'kr'}) {
  const cutT = cutoff ? Date.parse(cutoff) : null;
  const before = d => (cutT != null && tOf(d) != null ? tOf(d) <= cutT : day(d.publishedAt) <= asOf); // 장 마감 전(시각이 없으면 날짜로)
  const all = a?.disclosures ?? [];
  const ds = all.filter(d => day(d.publishedAt) >= windowFrom && before(d));
  const after = all.filter(d => !before(d) && day(d.publishedAt) >= asOf); // 장 마감 뒤(고르는 데 쓰지 않음)
  const own = d => !prefOf(d.title, s?.name); // 이 회사 보통주 공시(우선주 공시는 위험 칸에만)
  const afterBad = after.find(d => own(d) && EXCLUDE_RE.test(d.title)) ?? after.find(d => DILUTE_RE.test(d.title)) ?? after.find(d => own(d) && HEAT_RE.test(d.title)) ?? null;
  const f = s?.fund ?? {}, fl = s?.fl ?? {};
  const data = s?.status === 'ok' && fin(s?.r20);
  const profitKnown = fin(f.op) && fin(f.net), profit = profitKnown && f.op > 0 && f.net > 0;
  const excl = ds.find(d => own(d) && EXCLUDE_RE.test(d.title)) ?? null;
  const pref = ds.find(d => !own(d) && (EXCLUDE_RE.test(d.title) || HEAT_RE.test(d.title))) ?? null;
  const heatFrom = plusDays(asOf, -rules.heatDays), heats = ds.filter(d => own(d) && HEAT_RE.test(d.title));
  const dil = ds.find(d => DILUTE_RE.test(d.title)) ?? null, heat = heats.find(d => day(d.publishedAt) >= heatFrom) ?? null, heatOld = heat ? null : heats[0] ?? null; // 과열 지정은 며칠짜리 — 7일 안만 진입 조건에서 셈 · 그 전 것은 이력
  const fiE = fin(fl.f10e) && fin(fl.i10e) ? (fl.f10e + fl.i10e) / 1e8 : null; // 억 원(추정)
  const cap = fin(f.cap) && f.cap > 0 ? f.cap : null; // 억 원
  const power = fin(fiE) && cap ? (fiE / cap) * 100 : null; // 회사 크기에 견준 세기(%)
  const flow = fin(fiE) && fiE > 0;
  const ch = ds.filter(d => !EXCLUDE_RE.test(d.title)).map(d => ({d, k: CHANGE.find(x => x.re.test(d.title))})).filter(x => x.k)
    .sort((p, q) => (q.d.level ?? 0) - (p.d.level ?? 0) || String(q.d.publishedAt).localeCompare(String(p.d.publishedAt)));
  const ev = ch[0] ? {title: ch[0].d.title, date: day(ch[0].d.publishedAt), level: ch[0].d.level ?? null, kind: ch[0].k.kind, kindLabel: ch[0].k.label, more: ch.length - 1} : null;
  const r20 = fin(s?.r20) ? s.r20 : null, entryOk = data && r20 <= rules.maxR20 && !dil && !heat;
  const checks = {
    sector: {ok: !!sec?.ok, now: sec ? (sec.ok ? `돈이 들어온 업종 ${sec.rank}위 ${sec.label}` : `${sec.label} — ${sec.why}`) : '돈이 들어온 업종(1위~3위) 밖'},
    data: {ok: data, now: data ? `${kd(s.date)} 종가 있음` : `그날 종가 없음(${s?.status ?? '자료 없음'})`},
    profit: {ok: profit, unknown: !profitKnown, now: profitKnown ? `영업이익 ${f.op > 0 ? '흑자' : '적자'} · 순이익 ${f.net > 0 ? '흑자' : '적자'}(${fyK(f.fy)})` : '결산 자료 모자람'},
    risk: place !== 'kr' ? {ok: true, unknown: true, now: RISK_UNKNOWN} // 미국 판 — 회사 공시 원문 자료가 없음(일정표 공시 칸이 빔) · 「없음」이라 쓰지 않고 「확인 못 함」(2026-10-09 19:29 「미국장 까지 다 대입」)
      : {ok: !excl, now: excl ? `${kd(day(excl.publishedAt))} 「${excl.title}」` : afterBad ? `마감 전 위험 공시 없음 · 마감 뒤 「${afterBad.title}」(그 뒤 판에서 셈)` : '위험 공시 없음'},
    flow: {ok: flow, now: fin(fiE) ? `외국인+기관 ${rules.flowDays}거래일 ${eokTxt(fiE)}(추정)${fin(power) ? ` · 시가총액의 ${power.toFixed(2)}%` : ''}` : '외국인 · 기관 매매 자료 모자람'},
    entry: {ok: entryOk, now: `20거래일 ${pc(r20)}${dil ? ' · 희석 공시' : ''}${heat ? ' · 과열 공시' : ''}`},
    dilute: {ok: !dil, now: dil ? `${kd(day(dil.publishedAt))} 「${dil.title}」` : '희석 공시 없음'},
    heat: {ok: !heat, now: heat ? `${kd(day(heat.publishedAt))} 「${heat.title}」` : heatOld ? `최근 ${rules.heatDays}일 없음 · 이력 ${kd(day(heatOld.publishedAt))} 「${heatOld.title}」` : '과열 공시 없음'},
  };
  const screen = !!sec?.ok && data && profit && !excl && flow, met = screen && entryOk;
  return {screen, met, sec, ev, r20, gap: fin(s?.vsIdx20) ? s.vsIdx20 : null, fiE, cap, power, f10: fl.f10 ?? null, i10: fl.i10 ?? null, checks, dil, heat, heatOld, excl, pref, afterBad, fund: f,
    afterChange: after.filter(d => !EXCLUDE_RE.test(d.title) && CHANGE.some(k => k.re.test(d.title))).map(d => ({title: d.title, at: d.publishedAt}))};
}

/** 가장 큰 위험 한 줄(차례대로 처음 맞는 것) — 5판: 희석 · 과열 공시는 고르는 기준이 아니라 위험 줄 · 가격으로 빼는 선(가지치기)은 두지 않음(석 달 기다리기와 섞으면 결과가 깎임) */
export function riskOf(j, {s, c = null, sameSector = 0, sec = null, inNet = true, next = null, place = 'kr'} = {}) {
  const pos = c?.info?.pos52;
  if (j.afterBad) return {kind: 'after', text: `장 마감 뒤 공시 — ${kd(day(j.afterBad.publishedAt))} 「${j.afterBad.title}」 · 이번 판단에 아직 넣지 않음(그 뒤 판에서 셈)`};
  if (j.dil) return {kind: 'dilute', text: `희석 공시 — ${kd(day(j.dil.publishedAt))} 「${j.dil.title}」 · 주식 수가 늘 수 있음`};
  if (j.heat) return {kind: 'heat', text: `과열 경고 — ${kd(day(j.heat.publishedAt))} 「${j.heat.title}」 · 짧은 기간 쏠림`};
  if (!inNet) return {kind: 'outnet', text: `그물 밖으로 나감 — 1년 추세가 상위 ${CAND_RULES.netPct}% 기준선 아래 · 석 달 동안은 그대로 두고 ${next ? `${kd(next)} 담는 날` : '다음 담는 날'}에 정리`};
  if (fin(j.r20) && j.r20 > CAND_RULES.maxR20) return {kind: 'run', text: `20거래일 ${pc(j.r20)} — 짧은 기간 많이 오름 · 되돌림 폭이 클 수 있음`};
  if (sec?.dir === 'out') return {kind: 'secout', text: `업종(${sec.label})은 돈이 빠진 업종 ${sec.rank}위(시장 대비 ${eokTxt(sec.amount)}) — 업종 돈은 반대 방향`};
  if (fin(pos) && pos >= 0.95) return {kind: 'top52', text: `52주 최고값 근처(1년 범위의 ${Math.round(pos * 100)}% 자리) — 되돌림 폭이 클 수 있음`};
  if (j.heatOld) return {kind: 'heat-old', text: `과열 경고 이력 — ${kd(day(j.heatOld.publishedAt))} 「${j.heatOld.title}」(${CAND_RULES.heatDays}일 지남)`};
  if (j.pref) return {kind: 'pref', text: `우선주 ${prefOf(j.pref.title, s?.name)} — ${kd(day(j.pref.publishedAt))} 「${j.pref.title}」(보통주 아님 · 같은 회사)`};
  if (sameSector > 1) return {kind: 'same', text: `같은 업종 후보 ${sameSector}곳 — 같은 사건에 함께 흔들릴 수 있음`};
  if (place !== 'kr') return {kind: 'one', text: `한 곳만 보면 흔들림이 큼 · 위험 공시는 ${RISK_UNKNOWN_SHORT} — 지난 2년 셈은 한국 판으로만 함(미국 판은 셈 전)`};
  return {kind: 'one', text: '한 곳만 보면 흔들림이 큼 — 지난 2년 초입 7곳은 석 달 뒤 평균을 이긴 날 100번 중 60번(그물 전체 85번)'};
}

/** 탈락 까닭(앞 기록 후보가 이번에 빠졌을 때) — 처음 깨진 조건 */
const failOf = j => (!j ? '판에서 빠짐' : !j.checks.data.ok ? '자료 지연(그날 종가 없음)' : !j.checks.risk.ok ? '위험 공시' : !j.checks.profit.ok ? '적자(영업이익 또는 순이익)' : null);
/** 조건 다섯(4판 · 기록 읽기만) */
export const FLAGS4 = Object.freeze(['그날 종가', '흑자', '위험 공시 없음', '외국인+기관 순매수', '진입 조건']);
/** 조건 여섯(5판) — 그날 종가 · 흑자 · 위험 공시 없음 · 1년 추세 셈 · 그물 안 · 새로 듦(초입) */
export const FLAGS5 = Object.freeze(['그날 종가', '흑자', '위험 공시 없음', '1년 추세 셈', '그물 안(1년 추세 상위 20%)', '새로 듦(초입)']);
export const ST5 = Object.freeze({met: '그물 안', wait: '그물 밖', recheck: '재검토'});
/** 미국 판 위험 공시 — 회사 공시 원문 자료가 없음(2026-10-09 · 「없음」이 아니라 「확인 못 함」) */
export const RISK_UNKNOWN = '확인 못 함 — 미국 판은 회사 공시 원문 자료가 없음';
export const RISK_UNKNOWN_SHORT = '확인 못 함(미국 판 공시 자료 없음)';

/** 넘파이 분위수(기본 · 직선 보간)와 같은 셈 — xs(수) · p(0~100) → 기준선 · 셀 수 있는 값이 없으면 null */
export function quantileOf(xs, p) {
  const a = xs.filter(fin).sort((x, y) => x - y), n = a.length; if (!n) return null;
  const pos = (p / 100) * (n - 1), lo = Math.floor(pos), hi = Math.min(n - 1, lo + 1);
  return a[lo] + (a[hi] - a[lo]) * (pos - lo);
}
const r4 = v => (fin(v) ? Math.round(v * 1e4) / 1e4 : null);
const d1 = v => (fin(v) ? Number(v.toFixed(1)) : null);
/** 1년 추세(소수 넷째 자리 · 비율) — k = 판 날짜의 거래일 차례 · 그날 종가 · 20 · 252거래일 전 종가가 다 있어야(빠지면 null) */
export function trendOf(code, k, ses, priceAt, rules = CAND_RULES) {
  if (!(k >= rules.look) || k >= ses.length) return null;
  const c0 = priceAt(code, ses[k]), a = priceAt(code, ses[k - rules.look]), b = priceAt(code, ses[k - rules.skip]);
  return fin(c0) && fin(a) && fin(b) && a > 0 ? r4(b / a - 1) : null;
}
/**
 * 시장 날씨(경고만 · 고르는 데 쓰지 않음) — 사장님께 보인 기르기판(2026-10-09 15:00) 「날씨로 쉬기는 버림(지난 2년엔 쉬면 오히려 덜었음) → 흐린 날엔 경고만」
 *   지수 = 365곳 같은 무게 평균 — 날마다 (그날 종가 ÷ 앞 거래일 종가 − 1)을 두 값이 다 있는 곳끼리 평균(±50% 넘는 하루 값은 자료 오류로 보고 뺌)해 이어 곱함
 *   ratio = 오늘 지수 ÷ 지난 days 거래일(오늘 포함) 지수 평균 — 1 이상 맑음 · 1 아래 흐림 · 소수 넷째 자리
 *   하루라도 값이 있는 곳이 절반 아래이거나 기록이 모자라면 셀 수 없음(null · 지어내지 않음) · 따로 세기 scripts/atlas11/verify/cand_grow_verify.py
 */
export function weatherOf(codes, k, ses, priceAt, days = CAND_RULES.wxDays) {
  if (!(k >= days) || k >= ses.length || !codes?.length || typeof priceAt !== 'function') return null;
  let lvl = 1, sum = 1;
  for (let i = k - days + 2; i <= k; i++) {
    let s = 0, n = 0;
    for (const c of codes) { const a = priceAt(c, ses[i - 1]), b = priceAt(c, ses[i]); if (fin(a) && fin(b) && a > 0) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s += r; n++; } } }
    if (n < codes.length / 2) return null;
    lvl *= 1 + s / n; sum += lvl;
  }
  const ratio = r4(lvl / (sum / days));
  return {days, ratio, pD: d1((ratio - 1) * 100), state: ratio >= 1 ? 'sunny' : 'cloudy'};
}
/** 담는 날 — 첫 담는 날(plantFrom)부터 hold 거래일마다 · 판 날짜에서 가장 가까운 지난 담는 날 · 다음 담는 날(달력 밖이면 null) · day = 담은 뒤 거래일 수 */
export function plantOf(asOf, ses, rules = CAND_RULES) {
  const k = ses.indexOf(asOf), a = ses.indexOf(rules.plantFrom);
  if (k < 0 || a < 0 || k < a) return {at: asOf, k, next: k >= 0 ? ses[k + rules.hold] ?? null : null, day: 0};
  const j = a + rules.hold * Math.floor((k - a) / rules.hold);
  return {at: ses[j], k: j, next: ses[j + rules.hold] ?? null, day: k - j};
}

/**
 * 판 전체 → 후보 7곳(5판 · 기르기판) · 그물 · 담은 뒤 성적 · 돈 유입 1~365등(곁 정보) · 앞 기록과 바뀐 것
 *   stocks(판 읽기 종목 — fl · fund · g · gl) · board(info.pos52 · groups) · agenda(byCode) · priceAt(code, 날짜 → 종가) · sessions(거래일)
 *   records(후보 기록 — 저녁 기록 · 발행본) · growPubs(5판 규칙 폴더 발행본 — 첫 담는 날이 다른 규칙의 첫 기록과 겹친 날) · rotation(돈 흐름 — 곁 정보)
 */
export function candOf({place = 'kr', asOf, stocks = [], board = null, agenda = null, ref = null, records = [], sessions = [], rules = CAND_RULES, closeAt = '15:30 KST', rotation = null, priceAt = null, growPubs = []}) {
  const cutoff = cutoffOf(asOf, closeAt);
  const ses = [...new Set((sessions ?? []).filter(d => typeof d === 'string'))].sort(), k0 = ses.indexOf(asOf);
  const hd = {rules: rules.id, label: rules.label, asOf, place, want: rules.want, perSector: rules.perSector, window: {days: rules.windowDays, from: asOf ? plusDays(asOf, -rules.windowDays) : null, to: asOf, cutoff},
    index: ref ? {name: ref.name ?? null, r20: fin(ref.r20) ? ref.r20 : null} : null, evalDays: rules.evalDays, flowDays: rules.flowDays, hold: rules.hold, netPct: rules.netPct};
  const notReady = (why, need) => ({...hd, ready: false, items: [], waiting: [], held: [], pool: {universe: stocks.length}, why, need, changes: null, flow: null, rank: null, grow: null, mc: null});
  if (place !== 'kr' && place !== 'us') return notReady('결산 흑자 · 위험 공시(회사 발표 원문) 자료가 없어 기준을 셀 수 없음 — 후보를 고르지 않음(숫자를 지어내지 않음)', ['결산(영업이익 · 순이익)', '공시(회사 발표 원문)']);
  // 미국 판(2026-10-09 19:29 「미국장 까지 다 대입」) — 같은 규칙 · 결산 흑자 = 나스닥 결산표(없으면 네이버 해외주식 결산) · 위험 공시 = 회사 공시 원문 자료가 없어 「확인 못 함」(빼지도 · 없다고 쓰지도 않음) · 외국인+기관 매매 자료가 없어 돈 유입 1~365등 없음
  if (typeof priceAt !== 'function' || !(k0 >= rules.look + rules.gap)) return notReady(`1년 가격 기록(${rules.look + rules.gap}거래일)이 모자라 그물을 셀 수 없음 — 후보를 고르지 않음`, [`종가 ${rules.look + rules.gap}거래일`]);
  // 곁 정보 — 업종 돈 흐름(같은 날 돈 흐름만 · 고르는 데 쓰지 않음)
  const rot = rotation && !rotation.none && rotation.asOf === asOf ? rotation : null;
  const groupOf = new Map((board?.groups ?? []).flatMap(g => (g.codes ?? []).map(c => [c, g.id])));
  const dirOf = gid => {
    const i = (rot?.in ?? []).slice(0, rules.sectors).findIndex(g => g.id === gid); if (i >= 0) return {dir: 'in', rank: i + 1, amount: rot.in[i].amount ?? null};
    const o = (rot?.out ?? []).slice(0, rules.sectors).findIndex(g => g.id === gid); if (o >= 0) return {dir: 'out', rank: o + 1, amount: rot.out[o].amount ?? null};
    return {dir: 'mid', rank: null, amount: null};
  };
  const dirTxt = sc => (sc.dir === 'in' ? `돈이 들어온 업종 ${sc.rank}위(${sc.label})` : sc.dir === 'out' ? `돈이 빠진 업종 ${sc.rank}위(${sc.label})` : `업종 돈 흐름 1위~3위 밖(${sc.label ?? '업종 없음'})`);
  const byC = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const all = stocks.map(s => {
    const j = judgeOf({s, a: agenda?.byCode?.[s.code], sec: null, asOf, windowFrom: hd.window.from, rules, cutoff, place}), g = groupOf.get(s.code) ?? s.g ?? null;
    const sec = {id: g, label: s.gl ?? null, ...dirOf(g)}; j.checks.sector = {ok: null, now: dirTxt(sec)}; // 업종은 곁 정보(조건 아님)
    return {s, c: byC.get(s.code) ?? null, j, sec, g, elig: j.checks.data.ok && j.checks.profit.ok && j.checks.risk.ok,
      m12: trendOf(s.code, k0, ses, priceAt, rules), m12p: trendOf(s.code, k0 - rules.gap, ses, priceAt, rules)};
  });
  // ② 그물 · ③ 초입 — 오늘 · 20거래일 전 각각 셀 수 있는 곳 가운데 상위 20%
  const q = quantileOf(all.map(x => x.m12), 100 - rules.netPct), qp = quantileOf(all.map(x => x.m12p), 100 - rules.netPct);
  for (const x of all) { x.inNet = fin(x.m12) && fin(q) && x.m12 >= q; x.inPrev = fin(x.m12p) && fin(qp) && x.m12p >= qp; x.newc = x.inNet && !x.inPrev; }
  const byTrend = (p, r) => (r.m12 - p.m12) || cmpCode(p.s.code, r.s.code);
  const walk = xs => { const per = new Map(), out = [], held = []; for (const x of xs) { if (out.length >= rules.want) break; const k = per.get(x.g) ?? 0; if (k >= rules.perSector) { held.push(x); continue; } per.set(x.g, k + 1); out.push(x); } return {out, held}; };
  const fresh = all.filter(x => x.elig && x.newc).sort(byTrend), today = walk(fresh);
  const pool = {universe: stocks.length, valid: all.filter(x => fin(x.m12)).length, net: all.filter(x => x.inNet).length, netElig: all.filter(x => x.inNet && x.elig).length, newc: fresh.length,
    data: all.filter(x => x.j.checks.data.ok).length, profit: all.filter(x => x.j.checks.data.ok && x.j.checks.profit.ok).length, risk: all.filter(x => x.elig).length};
  // ⑥ 담는 날 — 그 사이 판은 담는 날 첫 기록(같은 규칙)의 7곳 그대로
  const pl = plantOf(asOf, ses, rules), byCodeAll = new Map(all.map(x => [x.s.code, x]));
  const recAll = [...(records ?? []).filter(r => r && Array.isArray(r.cand)).map(r => ({asOf: r.asOf, recordedAt: r.recordedAt ?? null, rules: r.rules ?? null, cand: r.cand, src: r.src ?? 'record'})),
    ...(growPubs ?? []).filter(p => p && Array.isArray(p.cand)).map(p => ({asOf: p.asOf, recordedAt: p.recordedAt ?? null, rules: p.rules ?? null, cand: p.cand, src: 'pub5'}))];
  const recAt = recAll.filter(r => r.asOf === pl.at && r.rules === rules.id).sort((a, b) => String(a.recordedAt ?? '').localeCompare(String(b.recordedAt ?? '')))[0] ?? null;
  let picked, planted;
  if (pl.at === asOf) { picked = today.out; planted = {at: asOf, next: pl.next, src: 'today', recordedAt: null, day: 0}; }
  else if (recAt) { picked = recAt.cand.map(c => byCodeAll.get(c.code)).filter(Boolean); planted = {at: pl.at, next: pl.next, src: recAt.src, recordedAt: recAt.recordedAt, day: pl.day, missing: recAt.cand.filter(c => !byCodeAll.has(c.code)).map(c => c.name ?? c.code)}; }
  else { // 담는 날 기록이 없음 — 그날 종가로 그물 · 초입을 다시 셈(기준 흑자 · 위험 공시는 오늘 값) · 그렇다고 적음
    const xs = all.map(x => ({x, m: trendOf(x.s.code, pl.k, ses, priceAt, rules), mp: trendOf(x.s.code, pl.k - rules.gap, ses, priceAt, rules)}));
    const qa = quantileOf(xs.map(y => y.m), 100 - rules.netPct), qb = quantileOf(xs.map(y => y.mp), 100 - rules.netPct);
    const fr = xs.filter(y => y.x.elig && fin(y.m) && y.m >= qa && !(fin(y.mp) && y.mp >= qb)).sort((p, r) => (r.m - p.m) || cmpCode(p.x.s.code, r.x.s.code)).map(y => y.x);
    picked = walk(fr).out; planted = {at: pl.at, next: pl.next, src: 'recount', recordedAt: null, day: pl.day};
  }
  // ⑦ 담은 뒤 성적 — 담은 날 종가 → 오늘 종가(7곳 평균 · 그물 전체(담은 날 값으로 다시 셈) · 365곳 평균)
  const retOf = code => { const a = priceAt(code, planted.at), b = priceAt(code, asOf); return fin(a) && fin(b) && a > 0 ? (b / a - 1) * 100 : null; };
  let since = null;
  if (planted.at < asOf) {
    const kp = ses.indexOf(planted.at), mAt = all.map(x => ({code: x.s.code, m: trendOf(x.s.code, kp, ses, priceAt, rules)})), qa = quantileOf(mAt.map(y => y.m), 100 - rules.netPct);
    const avg = codes => { const r = codes.map(retOf).filter(fin); return r.length ? {r: r.reduce((a, b) => a + b, 0) / r.length, n: r.length} : null; };
    const s7 = avg(picked.map(x => x.s.code)), sNet = avg(mAt.filter(y => fin(y.m) && y.m >= qa).map(y => y.code)), sAll = avg(all.map(x => x.s.code));
    since = {from: planted.at, to: asOf, days: planted.day, seven: s7 ? {...s7, rD: d1(s7.r)} : null, net: sNet ? {...sNet, rD: d1(sNet.r)} : null, all: sAll ? {...sAll, rD: d1(sAll.r)} : null,
      gap7: s7 && sAll ? d1(s7.r - sAll.r) : null, gapNet: sNet && sAll ? d1(sNet.r - sAll.r) : null};
  }
  // 돈 유입 1~365등(곁 정보 · 2026-10-09 11:35 「1등부터 365등까지」) — 비율 큰 순 · 포모지수 · 그물 안팎
  const idxOf = inflowIndexOf(all.map(x => x.j.power)), ratioOk = x => fin(x.j.power);
  const byRatio = [...all].sort((p, r) => (Number(ratioOk(r)) - Number(ratioOk(p))) || ((r.j.power ?? 0) - (p.j.power ?? 0)) || ((r.j.fiE ?? 0) - (p.j.fiE ?? 0)) || p.s.code.localeCompare(r.s.code));
  const rankOf = new Map(); byRatio.forEach((x, i) => { if (ratioOk(x)) rankOf.set(x.s.code, i + 1); });
  const pickSet = new Set(picked.map(x => x.s.code));
  const rank = place !== 'kr' ? null : byRatio.map(x => ({r: rankOf.get(x.s.code) ?? null, c: x.s.code, nm: x.s.name, s: x.s.gl ?? null, p: ratioOk(x) ? x.j.power : null, pd: ratioOk(x) ? Number(x.j.power.toFixed(2)) : null, x: idxOf(x.j.power),
    pick: pickSet.has(x.s.code) ? 1 : 0, st: x.inNet ? 'net' : fin(x.m12) ? 'out' : 'na'})); // st = 그물 안 · 그물 밖 · 1년 추세 셀 수 없음
  const endOf = d => { const k = ses.indexOf(d); return k >= 0 && ses[k + rules.evalDays] ? ses[k + rules.evalDays] : null; }, evalEnd = endOf(asOf);
  const prev = recAll.filter(r => r.rules === rules.id && r.asOf < asOf).sort((a, b) => a.asOf.localeCompare(b.asOf) || String(a.recordedAt ?? '').localeCompare(String(b.recordedAt ?? ''))).at(-1) ?? null;
  const same = (records ?? []).find(r => Array.isArray(r?.cand) && r.asOf === asOf) ?? null;
  const qP = fin(q) ? q * 100 : null;
  const items = picked.map((x, i) => {
    const code = x.s.code, sameSector = picked.filter(y => y.g === x.g).length, m12P = fin(x.m12) ? x.m12 * 100 : null;
    const recheck = [!x.j.checks.data.ok ? '그날 종가 없음' : null, !x.j.checks.profit.ok ? '적자(영업이익 또는 순이익)' : null, !x.j.checks.risk.ok ? '위험 공시' : null, x.j.afterBad ? '장 마감 뒤 위험 공시' : null].filter(Boolean);
    const status = recheck.length ? 'recheck' : x.inNet ? 'met' : 'wait';
    const bizBroken = !!(x.j.afterBad && (EXCLUDE_RE.test(x.j.afterBad.title) || DILUTE_RE.test(x.j.afterBad.title)));
    const nextEv = (agenda?.byCode?.[code]?.upcoming ?? []).filter(e => e.date >= asOf).slice(0, 3).map(e => ({date: e.date, name: e.name, level: e.level ?? null}));
    const ret = planted.at < asOf ? retOf(code) : null, rk = rankOf.get(code), fomo = idxOf(x.j.power);
    return {rank: i + 1, code, name: x.s.name, sector: x.s.gl ?? null, g: x.g, close: x.s.close ?? null, date: x.s.date ?? null,
      status, statusText: ST5[status], met: status === 'met', recheckWhy: recheck.join(' · ') || null,
      waitWhy: status === 'wait' ? `그물 밖 — 1년 추세 ${pc(m12P)} · 기준선 ${pc(qP)} 아래(${planted.next ? `${kd(planted.next)} 담는 날에 정리` : '다음 담는 날에 정리'})` : null,
      reason: `1년 추세 ${pc(m12P)}(마지막 ${rules.skip}거래일 뺌) · ${stocks.length}곳 가운데 상위 ${rules.netPct}% 그물(기준선 ${pc(qP)}) · ${kd(planted.at)} 그물에 새로 든 초입`,
      grow: {m12: m12P, m12D: d1(m12P), inNet: x.inNet, newc: x.newc, plantedAt: planted.at, next: planted.next, since: fin(ret) ? {r: ret, rD: d1(ret)} : null},
      flow: {sector: {id: x.g, label: x.s.gl ?? null, dir: x.sec.dir, rank: x.sec.rank, amount: x.sec.amount}, fi: x.j.fiE, f10: x.j.f10, i10: x.j.i10, cap: x.j.cap, power: x.j.power, powerD: fin(x.j.power) ? Number(x.j.power.toFixed(2)) : null, powerRank: rk ?? null, fomo, days: rules.flowDays},
      evidence: x.j.ev, r20: x.j.r20, gap: x.j.gap, r5: fin(x.s.r5) ? x.s.r5 : null, pos52: x.c?.info?.pos52 ?? null, high52: x.c?.info?.high52 ?? null, low52: x.c?.info?.low52 ?? null,
      fund: {fy: x.j.fund.fy ?? null, roe: x.j.fund.roe ?? null, debt: x.j.fund.debtExempt ? null : x.j.fund.debt ?? null, debtExempt: !!x.j.fund.debtExempt, op: x.j.fund.op ?? null, net: x.j.fund.net ?? null, cap: x.j.cap},
      checks: x.j.checks, risk: riskOf(x.j, {s: x.s, c: x.c, sameSector, sec: {...x.sec}, inNet: x.inNet, next: planted.next, place}),
      after: {bad: x.j.afterBad ? {title: x.j.afterBad.title, at: x.j.afterBad.publishedAt} : null, change: x.j.afterChange},
      entry: {rule: `1년 추세 상위 ${rules.netPct}% 그물 · 새로 듦(초입) · 그날 종가 · 흑자 · ${place === 'kr' ? '위험 공시 없음' : `위험 공시 ${RISK_UNKNOWN_SHORT}`}`, ok: status === 'met'},
      exit: {net: {rule: `그물 밖 — 1년 추세가 상위 ${rules.netPct}% 기준선 아래(석 달 동안은 그대로 두고 다음 담는 날 정리)`, broken: !x.inNet, now: `1년 추세 ${pc(m12P)} · 기준선 ${pc(qP)}`},
        business: {rule: place === 'kr' ? '사업 가설 훼손 — 공급계약 해지 · 위험 공시(거래정지 · 투자경고 · 관리종목 등) · 희석 공시 · 새 결산 적자' : `사업 가설 훼손 — 새 결산 적자(위험 공시는 ${RISK_UNKNOWN_SHORT})`, broken: bizBroken || !x.j.checks.profit.ok || !x.j.checks.risk.ok,
          now: bizBroken ? `장 마감 뒤 「${x.j.afterBad.title}」` : !x.j.checks.risk.ok ? x.j.checks.risk.now : !x.j.checks.profit.ok ? x.j.checks.profit.now : x.j.dil ? `희석 공시 「${x.j.dil.title}」(위험 줄에 적음)` : '해당 공시 없음 · 결산 흑자'},
        period: {rule: `담는 기간 — 담은 날부터 ${rules.hold}거래일(석 달)`, start: planted.at, end: planted.next, ended: false}},
      next: {events: nextEv, read: '그 뒤 판(거래일 16:00)의 1년 추세 · 그물 안팎 · 담은 날 대비'}};
  });
  const waiting = fresh.filter(x => !today.out.includes(x) && !today.held.includes(x)).map(x => ({code: x.s.code, name: x.s.name, status: '초입 · 7곳 밖', m12D: d1(x.m12 * 100)}));
  const held = today.held.map(x => ({code: x.s.code, name: x.s.name, sector: x.s.gl ?? null, why: `같은 업종 ${rules.perSector}곳 한도`}));
  let changes = null; // 같은 규칙 앞 기록과 바뀐 것 — 담는 날 사이에는 7곳이 그대로(상태만 바뀜)
  if (prev) {
    const now = new Set(items.map(x => x.code)), before = new Map(prev.cand.map(x => [x.code, x]));
    changes = {from: prev.asOf, to: asOf, added: items.filter(x => !before.has(x.code)).map(x => ({code: x.code, name: x.name, why: `1년 추세 ${pc(x.grow.m12)} · ${kd(planted.at)} 새로 든 초입`})),
      kept: items.filter(x => before.has(x.code)).map(x => ({code: x.code, name: x.name, rankFrom: before.get(x.code).rank, rankTo: x.rank})),
      removed: prev.cand.filter(x => !now.has(x.code)).map(x => { const y = byCodeAll.get(x.code); const why = failOf(y?.j) ?? '담는 날이 바뀌어 새로 담음';
        return {code: x.code, name: x.name, why, status: failOf(y?.j) ? '재검토' : '정리'}; })};
  }
  const flags = Object.fromEntries(all.map(x => [x.s.code, [x.j.checks.data.ok, x.j.checks.profit.ok, x.j.checks.risk.ok, fin(x.m12), x.inNet, x.newc].map(b => (b ? '1' : '0')).join('')])); // FLAGS5
  const flow = rot ? {window: rot.window ?? null, flows: rot.flows ?? null, sectors: (rot.in ?? []).slice(0, rules.sectors).map((g, i) => ({rank: i + 1, id: g.id, label: g.label, amount: g.amount ?? null})),
    out: (rot.out ?? []).slice(0, rules.sectors).map((g, i) => ({rank: i + 1, id: g.id, label: g.label, amount: g.amount ?? null})), pair: rot.pair ? {from: rot.pair.from?.label ?? null, to: rot.pair.to?.label ?? null, start: rot.pair.start ?? null, days: rot.pair.days ?? null} : null,
    waves: (rot.waves ?? []).map(w => ({n: w.n, to: w.to?.label ?? null, from: w.from?.label ?? null, start: w.start, end: w.end, days: w.days}))} : null;
  const grow = {q: qP, qD: d1(qP), qp: fin(qp) ? qp * 100 : null, netPct: rules.netPct, hold: rules.hold, planted, since, weather: weatherOf(stocks.map(s => s.code), k0, ses, priceAt, rules.wxDays ?? 200),
    today: today.out.map(x => ({code: x.s.code, name: x.s.name, m12D: d1(x.m12 * 100)})), // 오늘 새로 든 초입(담는 날이 아니면 다음 담는 날 후보 — 보이기만)
    netCodes: all.filter(x => x.inNet && x.elig).sort(byTrend).map(x => x.s.code), // 그물 안 · 기준을 넘은 곳(1년 추세 큰 순)
    m: Object.fromEntries(all.map(x => [x.s.code, [x.m12, x.m12p]]))}; // 따로 세기(art_expect · 파이썬)가 맞대는 값 — 비율 · 소수 넷째 자리
  return {...hd, ready: true, items, waiting: waiting.slice(0, 20), nWaiting: waiting.length, held, pool, flags, flow, mc: null, rank, recordedToday: !!same, prev: prev ? {asOf: prev.asOf, n: prev.cand.length} : null, changes,
    common: [...new Set(items.map(x => x.g))].map(g => ({g, sector: items.find(x => x.g === g)?.sector ?? null, n: items.filter(x => x.g === g).length})).filter(x => x.n > 1), evalEnd, grow};
}

/** 후보 발행본 — 그날 첫 기록(저녁 기록 · 발행본)에 같은 규칙 후보가 없을 때 처음 낸 목록을 따로 남김(고치지 않음 · public/data/atlas11/cand/<묶음>/<날짜>.json · 규칙이 바뀐 날은 <규칙 이름>/<날짜>.json · scripts/atlas11/cand_record.mjs) */
export const candPubOf = (lens, recordedAt) => (lens?.cand?.ready ? {schema: 'atlas11-cand-1', place: lens.place, asOf: lens.asOf, recordedAt, boardId: lens.boardId ?? null, universe: lens.universe?.id ?? null,
  rules: lens.cand.rules, label: lens.cand.label, window: lens.cand.window, index: lens.cand.index, evalDays: lens.cand.evalDays, evalEnd: lens.cand.evalEnd ?? null, pool: lens.cand.pool,
  grow: lens.cand.grow ? {q: lens.cand.grow.q, qD: lens.cand.grow.qD, netPct: lens.cand.grow.netPct, hold: lens.cand.grow.hold, planted: lens.cand.grow.planted, since: lens.cand.grow.since, netCodes: lens.cand.grow.netCodes, today: lens.cand.grow.today, weather: lens.cand.grow.weather ?? null} : null,
  flow: {window: lens.cand.flow?.window ?? null, sectors: (lens.cand.flow?.sectors ?? []).map(x => ({rank: x.rank, id: x.id, label: x.label, amount: x.amount}))},
  top: (lens.cand.rank ?? []).slice(0, 30).map(x => ({r: x.r, code: x.c, name: x.nm, power: fin(x.p) ? Math.round(x.p * 1e4) / 1e4 : null, fomo: x.x, st: x.st})), // 돈 유입 1~365등 가운데 앞 서른(곁 정보 · 그날 자리)
  cand: candRecordOf(lens.cand), held: lens.cand.held ?? [], nWaiting: lens.cand.nWaiting ?? 0,
  note: '처음 낸 후보 목록 — 고치지 않음(정정은 새 기록) · 평가 = 이 날 종가에서 5 · 10 · 20 · 60거래일 뒤 · 실제 매매 성과 아님'} : null);
/** 저녁 기록에 남길 모양(그날 첫 발행본 — 고치지 않음) */
export const candRecordOf = cand => (cand?.ready ? cand.items.map(x => ({rank: x.rank, code: x.code, name: x.name, g: x.g, close: x.close, date: x.date, status: x.status, reason: x.reason, risk: x.risk.text, gap: x.gap, r20: x.r20,
  ...(x.grow ? {grow: {m12: fin(x.grow.m12) ? Math.round(x.grow.m12 * 1e4) / 1e4 : null, plantedAt: x.grow.plantedAt, inNet: x.grow.inNet}} : {}),
  flow: {sector: x.flow.sector.label, sectorRank: x.flow.sector.rank ?? null, fi: fin(x.flow.fi) ? Math.round(x.flow.fi) : null, power: fin(x.flow.power) ? Math.round(x.flow.power * 1e4) / 1e4 : null, rank: x.flow.powerRank ?? null, fomo: x.flow.fomo ?? null}})) : []);
