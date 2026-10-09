/**
 * ATLAS 11 · 매수 검토 후보(최대 7곳) — 규칙 cand-rules-4 「365곳 전체 · 돈 유입 비율 · 20만 번 다시 뽑아 소거」(연구용 · 성능 검증 전)
 *   사장님 2026-10-09 03:09(마카오 시각) 첨부 「ATLAS 제품 재설계 명령 — 목적: 지금 매수할 가치가 있는 후보 7개를 찾는다」 · 03:59 「잡스라면 … 애플의 방식이 중심」
 *   · 10:14 「7개에 종목을 선정할때 모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템을 구축하여 다시 7개에 종목을 찾아내라」(3판)
 *   · 11:35 「전종목 365개를 대상으로 해서 돈에 유입이 강력한 7개에 종목을 찾아내는 것이다 비율계산을 해야 한다 그러면 포모지수가 나올거야
 *            1등부터 365등까지 그것도 나열하는 곳을 만들어 그래서 몬테카를로 방법 20만번 소거법 20만돌 해서 찾아내」 · 11:57 「현명하게 해봐」(4판)
 *   셈만(화면 없음) — 판 읽기(lens.mjs)가 부르고 저녁 7시 기록(build_view.mjs)이 그 결과를 고치지 않고 남긴다 · 시험 tests/atlas11/cand.test.mjs
 *   · 따로 다시 세기(파이썬 · 같은 씨앗 → 같은 횟수): scripts/atlas11/verify/cand_mc_verify.py
 *   지난 판: 2판(돈이 들어온 업종 1~3위 안 · 세기 순) = 2026-10-08 첫 기록 · 3판(같은 업종 안 · 1만 번) = cand-rules-3/2026-10-08.json — 둘 다 고치지 않음
 *
 * 한 문장(잡스라면): 「365곳 모두를 돈 유입 비율로 1등부터 줄 세우고, 지난 10거래일을 20만 번 다시 뽑아 흔들어도 자주 남은 곳부터 7곳을 남긴다.」
 *   ① 돈 유입 비율 = 외국인+기관 10거래일 순매수(추정 · 날마다 순매수 주식 수 × 그날 종가) ÷ 시가총액 × 100(%) — 회사 크기에 견줌(큰 회사가 금액만 커 보이지 않게)
 *        · 거래대금에 견준 비율은 거래대금을 모으지 않아 셀 수 없음(지어내지 않음)
 *   ② 포모지수(돈 유입 · 0~100) = 그 비율이 365곳(비율을 셀 수 있는 곳) 가운데 어디쯤인지 — 1등 100 · 꼴찌 0(같은 값은 가운데 자리)
 *        1~365등 목록(rank) = 비율 큰 순 · 매매 자료가 모자란 곳은 맨 뒤(등수 없음) — 옛 ATLAS 포모(가격 열기)와 다른 값
 *   ③ 기준(낮추지 않음) = 그날 종가 있음 · 마지막 결산 영업이익 · 순이익 흑자 · 위험 공시 없음 · 외국인+기관 10거래일 순매수 + — 업종 조건은 없음(365곳 전체 · 11:35)
 *   ④ 20만 번 다시 뽑기(몬테카를로) — 지난 10거래일 가운데 열 날을 다시 뽑아(같은 날 거듭 · 빠짐 있음) 그 날들로 회사마다 비율을 다시 셈
 *        → 한 번마다 소거법: 기준 ③의 고정 조건을 넘은 곳 가운데 그 날들 순매수가 + 인 곳 → 진입 조건 충족 먼저 → 비율 큰 순 → 금액 → 종목 기호 → 같은 업종 3곳 · 7곳
 *        → 회사마다 「7곳에 든 횟수」(20만 번 중 몇 번) · 씨앗 = 「규칙 이름|판 날짜」(FNV-1a + mulberry32 — 누가 돌려도 같은 횟수)
 *   ⑤ 소거법(마지막) = ③을 넘은 곳을 [진입 조건 충족 먼저 → 7곳에 든 횟수 많은 순 → 비율 → 금액 → 종목 기호]로 세우고 같은 업종 3곳 · 7곳까지 남김
 *        · 진입 조건 먼저 = 이미 20거래일 +30% 넘게 오른 곳(조건 대기)은 충족한 곳이 모자랄 때만 — 뒤늦게 따라 사는 것을 막는 2판부터의 기준(11:57 「현명하게」)
 *        · 뺀 곳은 까닭(같은 업종 3곳 한도 · 7곳 밖) · 「돈은 세게 들어왔지만 이미 많이 오른 곳」(surged)은 따로 보임 · 절반 아래는 위험 줄에
 *        · 흔들림 검사 = 씨앗만 바꿔(끝에 |1 · |2) 20만 번을 두 번 더 → 7곳 · 차례가 같은지(공식 답은 첫 씨앗) · 열 날 그대로 한 번씩 뽑으면 다시 뽑기 전 차례와 같아야(스스로 맞대기)
 *   진입 조건(상태 — 순위와 따로): 20거래일 수익률 +30% 이하 · 희석 공시 없음(30일) · 과열 공시 없음(7일) · 상태 = 조건 충족 · 조건 대기 · 재검토(마감 뒤 위험 공시 · 가격 기준 이탈)
 *   업종 돈 흐름(돈 흐름 화면 · 업종 순환)은 고르는 데 쓰지 않고 곁 정보로만(들어온 업종 1~3위 · 빠진 업종 1~3위 · 그 밖)
 *   쓰는 공시 = 그날 장 마감(한국 15:30) 전에 나온 것만 · 「20만 번 중 몇 번」은 지난 열 날을 다시 뽑아 센 횟수(지난 자료가 얼마나 단단한지) — 앞날 오를 확률이 아니다
 *   목표가 · 기대 수익률 · 앞날 확률은 만들지 않는다.
 */

export const CAND_RULES = Object.freeze({
  id: 'cand-rules-4',
  label: '매수 검토 후보 규칙 4판 — 365곳 전체 · 돈 유입 비율 · 20만 번 다시 뽑아 소거(연구용 · 성능 검증 전)',
  want: 7, perSector: 3, sectors: 3, flowDays: 10, windowDays: 30, heatDays: 7, maxR20: 30, evalDays: 20, stopFromRecord: -10, stopGapPp: -5,
  draws: 200000, // 20만 번 다시 뽑기(11:35) — 횟수 흔들림(표준오차)이 많아야 0.12%p
  moreSeeds: 2, // 흔들림 검사 — 씨앗을 바꿔 두 번 더
});
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
export function dailyOf(daily, rules = CAND_RULES) {
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
export function mcDraw(base, ix, rules = CAND_RULES, buf = null) {
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
export function mcOf({base, days, rules = CAND_RULES, seed, draws = rules.draws}) {
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
export function judgeOf({s, a = null, sec = null, asOf, windowFrom, rules = CAND_RULES, cutoff = null}) {
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
    profit: {ok: profit, unknown: !profitKnown, now: profitKnown ? `영업이익 ${f.op > 0 ? '흑자' : '적자'} · 순이익 ${f.net > 0 ? '흑자' : '적자'}(${f.fy ?? '결산'})` : '결산 자료 모자람'},
    risk: {ok: !excl, now: excl ? `${kd(day(excl.publishedAt))} 「${excl.title}」` : afterBad ? `마감 전 위험 공시 없음 · 마감 뒤 「${afterBad.title}」(그 뒤 판에서 셈)` : '위험 공시 없음'},
    flow: {ok: flow, now: fin(fiE) ? `외국인+기관 ${rules.flowDays}거래일 ${eokTxt(fiE)}(추정)${fin(power) ? ` · 시가총액의 ${power.toFixed(2)}%` : ''}` : '외국인 · 기관 매매 자료 모자람'},
    entry: {ok: entryOk, now: `20거래일 ${pc(r20)}${dil ? ' · 희석 공시' : ''}${heat ? ' · 과열 공시' : ''}`},
    dilute: {ok: !dil, now: dil ? `${kd(day(dil.publishedAt))} 「${dil.title}」` : '희석 공시 없음'},
    heat: {ok: !heat, now: heat ? `${kd(day(heat.publishedAt))} 「${heat.title}」` : heatOld ? `최근 ${rules.heatDays}일 없음 · 이력 ${kd(day(heatOld.publishedAt))} 「${heatOld.title}」` : '과열 공시 없음'},
  };
  const screen = !!sec?.ok && data && profit && !excl && flow, met = screen && entryOk;
  return {screen, met, sec, ev, r20, gap: fin(s?.vsIdx20) ? s.vsIdx20 : null, fiE, cap, power, f10: fl.f10 ?? null, i10: fl.i10 ?? null, checks, dil, heat, heatOld, excl, pref, afterBad, fund: f,
    afterChange: after.filter(d => !EXCLUDE_RE.test(d.title) && CHANGE.some(k => k.re.test(d.title))).map(d => ({title: d.title, at: d.publishedAt}))};
}

/** 가장 큰 위험 한 줄(차례대로 처음 맞는 것) */
export function riskOf(j, {s, c = null, sameSector = 0, mc = null, sec = null}) {
  const pos = c?.info?.pos52;
  if (j.afterBad) return {kind: 'after', text: `장 마감 뒤 공시 — ${kd(day(j.afterBad.publishedAt))} 「${j.afterBad.title}」 · 이번 판단에 아직 넣지 않음(그 뒤 판에서 셈)`};
  if (j.dil) return {kind: 'dilute', text: `희석 공시 — ${kd(day(j.dil.publishedAt))} 「${j.dil.title}」 · 주식 수가 늘 수 있음`};
  if (j.heat) return {kind: 'heat', text: `과열 경고 — ${kd(day(j.heat.publishedAt))} 「${j.heat.title}」 · 짧은 기간 쏠림`};
  if (fin(j.r20) && j.r20 > CAND_RULES.maxR20) return {kind: 'run', text: `20거래일 ${pc(j.r20)} — 돈이 값에 이미 실렸을 수 있음(${CAND_RULES.maxR20}% 넘음)`};
  if (mc && fin(mc.n) && fin(mc.of) && mc.n * 2 < mc.of) return {kind: 'mc', text: `${drawsTxt(mc.of)} 다시 뽑아 ${timesTxt(mc.n)}만 7곳에 듦(절반 아래) — 며칠에 기댄 돈 유입일 수 있음`};
  if (sec?.dir === 'out') return {kind: 'secout', text: `업종(${sec.label})은 돈이 빠진 업종 ${sec.rank}위(시장 대비 ${eokTxt(sec.amount)}) — 회사로 들어온 돈과 업종 돈이 반대 방향`};
  if (fin(pos) && pos >= 0.95) return {kind: 'top52', text: `52주 최고값 근처(1년 범위의 ${Math.round(pos * 100)}% 자리) — 되돌림 폭이 클 수 있음`};
  if (j.heatOld) return {kind: 'heat-old', text: `과열 경고 이력 — ${kd(day(j.heatOld.publishedAt))} 「${j.heatOld.title}」(${CAND_RULES.heatDays}일 지나 진입 조건에서는 셈하지 않음)`};
  if (j.pref) return {kind: 'pref', text: `우선주 ${prefOf(j.pref.title, s?.name)} — ${kd(day(j.pref.publishedAt))} 「${j.pref.title}」(보통주 아님 · 같은 회사)`};
  if (sameSector > 1) return {kind: 'same', text: `같은 업종 후보 ${sameSector}곳 — 같은 사건에 함께 흔들릴 수 있음`};
  return {kind: 'turn', text: '돈 유입은 자주 바뀜 — 그 뒤 판에서 외국인+기관 순매수가 이어지는지 확인'};
}

/** 탈락 까닭(앞 기록 후보가 이번에 빠졌을 때) — 처음 깨진 조건 */
const failOf = j => (!j ? '판에서 빠짐' : !j.checks.data.ok ? '자료 지연(그날 종가 없음)' : !j.checks.risk.ok ? '위험 공시'
  : !j.checks.profit.ok ? '적자(영업이익 또는 순이익)' : !j.checks.flow.ok ? '돈 유입 이탈 — 외국인+기관 순매도' : null);
/** 조건 다섯(4판) — 그날 종가 · 흑자 · 위험 공시 없음 · 외국인+기관 순매수 + · 진입 조건 */
export const FLAGS4 = Object.freeze(['그날 종가', '흑자', '위험 공시 없음', '외국인+기관 순매수', '진입 조건']);

/**
 * 판 전체 → 후보 7곳 · 1~365등(rank) · 뺀 곳 · 앞 기록과 바뀐 것
 *   stocks(판 읽기 종목 — fl.f10e · fl.i10e · fund.cap · g · gl) · board(info.pos52 · groups) · agenda(byCode) · daily(회사 날마다 순매수 — 20만 번 다시 뽑기)
 *   rotation(돈 흐름 — 곁 정보만 · 고르는 데 쓰지 않음) · records(후보 기록) · sessions(거래일)
 */
export function candOf({place = 'kr', asOf, stocks = [], board = null, agenda = null, ref = null, records = [], sessions = [], rules = CAND_RULES, closeAt = '15:30 KST', rotation = null, daily = null}) {
  const cutoff = cutoffOf(asOf, closeAt);
  const hd = {rules: rules.id, label: rules.label, asOf, place, want: rules.want, perSector: rules.perSector, window: {days: rules.windowDays, from: asOf ? plusDays(asOf, -rules.windowDays) : null, to: asOf, cutoff},
    index: ref ? {name: ref.name ?? null, r20: fin(ref.r20) ? ref.r20 : null} : null, evalDays: rules.evalDays, flowDays: rules.flowDays};
  const notReady = (why, need) => ({...hd, ready: false, items: [], waiting: [], held: [], pool: {universe: stocks.length}, why, need, changes: null, flow: null, rank: null});
  if (place !== 'kr') return notReady('외국인 · 기관 매매와 공시 자료가 없어 「돈이 들어온 회사」를 셀 수 없음 — 후보를 고르지 않음(숫자를 지어내지 않음)', ['외국인 · 기관 순매매(날마다)', '공시(회사 발표 원문)']);
  if (!stocks.some(s => fin(s.fl?.f10e))) return notReady('외국인 · 기관 매매 자료가 없어 「돈이 들어온 회사」를 셀 수 없음 — 후보를 고르지 않음', ['외국인 · 기관 순매매(날마다)']);
  const D = dailyOf(daily, rules); // ④ 20만 번 다시 뽑기의 날마다 값 — 없으면 고르지 않음(다시 뽑기 없는 셈으로 몰래 돌아가지 않음)
  if (!D.ok) return notReady(D.why, [`회사 날마다 외국인+기관 순매수(${rules.flowDays}거래일)`]);
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
    const j = judgeOf({s, a: agenda?.byCode?.[s.code], sec: null, asOf, windowFrom: hd.window.from, rules, cutoff}), g = groupOf.get(s.code) ?? s.g ?? null;
    const sec = {id: g, label: s.gl ?? null, ...dirOf(g)}; j.checks.sector = {ok: null, now: dirTxt(sec)}; // 업종은 곁 정보(조건 아님)
    const ratio = fin(j.power), screen = ratio && j.checks.data.ok && j.checks.profit.ok && j.checks.risk.ok && j.checks.flow.ok;
    return {s, c: byC.get(s.code) ?? null, j, sec, g, ratio, screen, met: screen && j.checks.entry.ok};
  });
  const pool = {universe: stocks.length, flow: all.filter(x => x.ratio).length};
  pool.data = all.filter(x => x.ratio && x.j.checks.data.ok).length; pool.profit = all.filter(x => x.ratio && x.j.checks.data.ok && x.j.checks.profit.ok).length;
  pool.risk = all.filter(x => x.ratio && x.j.checks.data.ok && x.j.checks.profit.ok && x.j.checks.risk.ok).length; pool.screen = all.filter(x => x.screen).length; pool.met = all.filter(x => x.met).length;
  // ④ 20만 번 다시 뽑기 — 고정 조건(종가 · 흑자 · 위험 공시 없음)을 넘고 열 날 값이 다 있는 곳 모두 · 씨앗 = 규칙 이름|판 날짜
  const mcBase = all.filter(x => x.j.checks.data.ok && x.j.checks.profit.ok && x.j.checks.risk.ok && fin(x.j.cap) && x.g != null && D.stocks.has(x.s.code))
    .map(x => ({code: x.s.code, g: x.g, cap: x.j.cap, met: x.j.checks.entry.ok ? 1 : 0, fi: D.stocks.get(x.s.code)})).sort((p, q) => cmpCode(p.code, q.code));
  const days = D.dates.length, seed = seedOf(`${rules.id}|${asOf}`), mc = mcOf({base: mcBase, days, rules, seed}), nOf = code => mc.counts.get(code) ?? 0;
  // ⑤ 소거법 — ③을 넘은 곳을 진입 조건 → 7곳에 든 횟수 → 비율 → 금액 → 기호 차례로 세우고 같은 업종 3곳 · 7곳까지(나머지는 까닭과 함께 뺌)
  const order0 = (p, q) => (q.met - p.met) || ((q.j.power ?? -1e9) - (p.j.power ?? -1e9)) || ((q.j.fiE ?? -1e9) - (p.j.fiE ?? -1e9)) || p.s.code.localeCompare(q.s.code); // 다시 뽑기 전(열 날 그대로) 차례
  const orderBy = counts => (p, q) => (q.met - p.met) || ((counts.get(q.s.code) ?? 0) - (counts.get(p.s.code) ?? 0)) || order0(p, q);
  const walk = xs => { const per = new Map(), out = []; for (const x of xs) { if (out.length >= rules.want) break; const k = per.get(x.g) ?? 0; if (k >= rules.perSector) continue; per.set(x.g, k + 1); out.push(x.s.code); } return out; };
  const screened = all.filter(x => x.screen), ranked = [...screened].sort(orderBy(mc.counts));
  const per = new Map(), picked = [], held = [], over = [];
  for (const x of ranked) {
    const k = per.get(x.g) ?? 0;
    if (k >= rules.perSector) { held.push({code: x.s.code, name: x.s.name, sector: x.s.gl ?? null, why: `같은 업종 ${rules.perSector}곳 한도`, mc: nOf(x.s.code)}); continue; }
    if (picked.length >= rules.want) { over.push(x); continue; }
    per.set(x.g, k + 1); picked.push(x);
  }
  const asIs = mcDraw(mcBase, D.dates.map((_, i) => i), rules), plain = walk([...screened].sort(order0)); // 스스로 맞대기 — 열 날 그대로 한 번씩 = 다시 뽑기 전 차례
  const alts = Array.from({length: rules.moreSeeds ?? 0}, (_, k) => walk([...screened].sort(orderBy(mcOf({base: mcBase, days, rules, seed: seedOf(`${rules.id}|${asOf}|${k + 1}`)}).counts)))); // 흔들림 검사
  // ② 1~365등 — 돈 유입 비율 큰 순 · 포모지수(0~100) · 매매 자료가 모자란 곳은 맨 뒤(등수 없음)
  const idxOf = inflowIndexOf(all.map(x => x.j.power));
  const byRatio = [...all].sort((p, q) => (q.ratio - p.ratio) || ((q.j.power ?? 0) - (p.j.power ?? 0)) || ((q.j.fiE ?? 0) - (p.j.fiE ?? 0)) || p.s.code.localeCompare(q.s.code));
  const rankOf = new Map(); byRatio.forEach((x, i) => { if (x.ratio) rankOf.set(x.s.code, i + 1); });
  const flags5 = x => [x.j.checks.data.ok, x.j.checks.profit.ok, x.j.checks.risk.ok, x.j.checks.flow.ok, x.j.checks.entry.ok].map(b => (b ? '1' : '0')).join('');
  const pickSet = new Set(picked.map(x => x.s.code));
  const rank = byRatio.map(x => ({r: rankOf.get(x.s.code) ?? null, c: x.s.code, nm: x.s.name, s: x.s.gl ?? null, p: x.ratio ? x.j.power : null, pd: x.ratio ? Number(x.j.power.toFixed(2)) : null, x: idxOf(x.j.power),
    n: nOf(x.s.code), pick: pickSet.has(x.s.code) ? 1 : 0, st: x.met ? 'met' : x.screen ? 'wait' : 'out'})); // r 등수 · c 기호 · nm 이름 · s 업종 · p 비율(%) · pd 보여 줄 비율(소수 둘째 자리 — 판 읽기 파일이 넷째 자리로 줄인 값을 다시 반올림하면 끝자리가 틀릴 수 있어 먼저 셈) · x 포모지수 · n 20만 번 중 7곳에 든 횟수 · st 상태(met 충족 · wait 대기 · out 기준 밖)
  const endOf = d => { const k = sessions.indexOf(d); return k >= 0 && sessions[k + rules.evalDays] ? sessions[k + rules.evalDays] : null; }, evalEnd = endOf(asOf);
  const prev = [...records].filter(r => Array.isArray(r?.cand) && r.asOf && r.asOf < asOf).sort((p, q) => p.asOf.localeCompare(q.asOf)).at(-1) ?? null;
  const same = [...records].find(r => Array.isArray(r?.cand) && r.asOf === asOf) ?? null; // 오늘 기록(첫 발행본)이 이미 있으면
  const items = picked.map((x, i) => {
    const code = x.s.code, sameSector = picked.filter(y => y.g === x.g).length;
    const recFrom = same?.cand?.some(y => y.code === code) ? same : prev?.cand?.some(y => y.code === code) ? prev : null, rec = recFrom?.cand.find(y => y.code === code) ?? null; // 처음 기록된 값(가격 기준선)
    const refClose = rec?.close ?? x.s.close, refDate = rec?.date ?? x.s.date, fromRef = fin(refClose) && fin(x.s.close) ? (x.s.close / refClose - 1) * 100 : null;
    const stop = fin(refClose) ? refClose * (1 + rules.stopFromRecord / 100) : null;
    const priceBroken = (fin(fromRef) && fromRef <= rules.stopFromRecord) || (fin(x.j.gap) && x.j.gap <= rules.stopGapPp);
    const nextEv = (agenda?.byCode?.[code]?.upcoming ?? []).filter(e => e.date >= asOf).slice(0, 3).map(e => ({date: e.date, name: e.name, level: e.level ?? null}));
    const recheck = [x.j.afterBad ? '장 마감 뒤 위험 공시' : null, priceBroken ? '가격 기준 이탈' : null].filter(Boolean); // 재검토 — 고른 뒤 깨진 조건(순위는 그대로 · 상태만)
    const status = recheck.length ? 'recheck' : x.met ? 'met' : 'wait';
    const bizBroken = !!(x.j.afterBad && (EXCLUDE_RE.test(x.j.afterBad.title) || DILUTE_RE.test(x.j.afterBad.title)));
    const mcx = {n: nOf(code), of: mc.draws, low: nOf(code) * 2 < mc.draws}, rk = rankOf.get(code), fomo = idxOf(x.j.power);
    return {rank: i + 1, code, name: x.s.name, sector: x.s.gl ?? null, g: x.g, close: x.s.close ?? null, date: x.s.date ?? null, mc: mcx,
      status, statusText: {met: '조건 충족', wait: '조건 대기', recheck: '재검토'}[status], met: x.met, recheckWhy: recheck.join(' · ') || null,
      waitWhy: x.met ? null : [fin(x.j.r20) && x.j.r20 > rules.maxR20 ? `20거래일 ${pc(x.j.r20)}(급등)` : null, x.j.dil ? '희석 공시' : null, x.j.heat ? '과열 공시' : null].filter(Boolean).join(' · '),
      reason: `돈 유입 비율 ${x.j.power.toFixed(2)}%(${stocks.length}곳 중 ${rk}위 · 포모지수 ${fomo}점) · 외국인+기관 ${rules.flowDays}거래일 ${eokTxt(x.j.fiE)} · ${drawsTxt(mc.draws)} 다시 뽑아 ${timesTxt(mcx.n)} 7곳에 듦`,
      flow: {sector: {id: x.g, label: x.s.gl ?? null, dir: x.sec.dir, rank: x.sec.rank, amount: x.sec.amount}, fi: x.j.fiE, f10: x.j.f10, i10: x.j.i10, cap: x.j.cap, power: x.j.power, powerD: Number(x.j.power.toFixed(2)), powerRank: rk, fomo, days: rules.flowDays}, // powerD = 보여 줄 비율(소수 둘째 자리 · 위 pd 와 같은 까닭)
      evidence: x.j.ev, r20: x.j.r20, gap: x.j.gap, r5: fin(x.s.r5) ? x.s.r5 : null, pos52: x.c?.info?.pos52 ?? null, high52: x.c?.info?.high52 ?? null, low52: x.c?.info?.low52 ?? null,
      fund: {fy: x.j.fund.fy ?? null, roe: x.j.fund.roe ?? null, debt: x.j.fund.debtExempt ? null : x.j.fund.debt ?? null, debtExempt: !!x.j.fund.debtExempt, op: x.j.fund.op ?? null, net: x.j.fund.net ?? null, cap: x.j.cap},
      checks: x.j.checks, risk: riskOf(x.j, {s: x.s, c: x.c, sameSector, mc: mcx, sec: {...x.sec}}),
      after: {bad: x.j.afterBad ? {title: x.j.afterBad.title, at: x.j.afterBad.publishedAt} : null, change: x.j.afterChange},
      entry: {rule: `20거래일 수익률 ${pc(rules.maxR20)} 이하 · 희석 · 과열 공시 없음`, ok: x.met},
      exit: {flow: {rule: `돈 유입 이탈 — 이 회사 외국인+기관 ${rules.flowDays}거래일이 순매도로 바뀜`, broken: false, now: `비율 ${x.j.power.toFixed(2)}% · ${stocks.length}곳 중 ${rk}위 · 외국인+기관 ${eokTxt(x.j.fiE)}`},
        business: {rule: '사업 가설 훼손 — 공급계약 해지 · 위험 공시(거래정지 · 투자경고 · 관리종목 등) · 희석 공시 · 새 결산 적자', broken: bizBroken,
          now: bizBroken ? `장 마감 뒤 「${x.j.afterBad.title}」` : x.j.dil ? `희석 공시 「${x.j.dil.title}」(진입 조건에서 셈)` : '해당 공시 없음 · 결산 흑자'},
        price: {rule: `가격 기준 이탈 — 처음 기록한 종가 대비 ${pc(rules.stopFromRecord)} 아래 또는 20거래일 지수 대비 ${pp(rules.stopGapPp)} 아래(그 값에 판다는 뜻 아님 · 체결 값은 다를 수 있음)`, refClose, refDate, recorded: !!rec, stop, fromRef, broken: priceBroken},
        period: {rule: `평가 기간 — 기록한 날부터 ${rules.evalDays}거래일`, start: recFrom?.asOf ?? null, end: recFrom ? endOf(recFrom.asOf) : evalEnd, ended: !!(recFrom && endOf(recFrom.asOf) && endOf(recFrom.asOf) <= asOf)}},
      next: {events: nextEv, read: '그 뒤 판(거래일 16:00)의 외국인+기관 순매수 · 1등~365등 자리'}};
  });
  const waiting = over.map(x => ({code: x.s.code, name: x.s.name, status: x.met ? '조건 충족' : '조건 대기', mc: nOf(x.s.code)})); // 기준은 넘었지만 7곳 밖(소거 · 이름과 횟수만)
  let changes = null; // 앞 기록과 바뀐 것 — 신규 · 유지 · 제외(제외는 까닭: 처음 깨진 조건 · 아니면 순위 밖 · 업종 한도)
  if (prev) {
    const now = new Set(items.map(x => x.code)), before = new Map(prev.cand.map(x => [x.code, x]));
    changes = {from: prev.asOf, to: asOf, added: items.filter(x => !before.has(x.code)).map(x => ({code: x.code, name: x.name, why: `돈 유입 비율 ${stocks.length}곳 중 ${x.flow.powerRank}위 · 외국인+기관 ${eokTxt(x.flow.fi)}`})),
      kept: items.filter(x => before.has(x.code)).map(x => ({code: x.code, name: x.name, rankFrom: before.get(x.code).rank, rankTo: x.rank})),
      removed: prev.cand.filter(x => !now.has(x.code)).map(x => { const y = all.find(z => z.s.code === x.code); const why = failOf(y?.j) ?? (held.some(h => h.code === x.code) ? '같은 업종 한도' : '순위 밖(조건은 그대로)');
        return {code: x.code, name: x.name, why, status: failOf(y?.j) ? '재검토' : '대기'}; })};
  }
  const flags = Object.fromEntries(all.map(x => [x.s.code, flags5(x)])); // 종목마다 조건 다섯(그날 종가 · 흑자 · 위험 공시 없음 · 외국인+기관 순매수 · 진입 조건 — FLAGS4)
  const flow = rot ? {window: rot.window ?? null, flows: rot.flows ?? null, sectors: (rot.in ?? []).slice(0, rules.sectors).map((g, i) => ({rank: i + 1, id: g.id, label: g.label, amount: g.amount ?? null})),
    out: (rot.out ?? []).slice(0, rules.sectors).map((g, i) => ({rank: i + 1, id: g.id, label: g.label, amount: g.amount ?? null})), pair: rot.pair ? {from: rot.pair.from?.label ?? null, to: rot.pair.to?.label ?? null, start: rot.pair.start ?? null, days: rot.pair.days ?? null} : null,
    waves: (rot.waves ?? []).map(w => ({n: w.n, to: w.to?.label ?? null, from: w.from?.label ?? null, start: w.start, end: w.end, days: w.days}))} : null;
  const off = items.map(x => x.code), key = a => [...a].sort().join();
  const mcSum = {draws: mc.draws, seed, days: D.dates, base: mcBase.length, half: Math.ceil(mc.draws / 2), low: items.filter(x => x.mc.low).length,
    asIs: {same: asIs.join() === plain.join(), picked: asIs, plain},
    seeds: {n: alts.length, sameSet: alts.every(a => key(a) === key(off)), sameOrder: alts.every(a => a.join() === off.join()), moved: off.filter((c, i) => alts.some(a => a[i] !== c)).map(c => ({code: c, name: items.find(x => x.code === c)?.name ?? c}))},
    out: [...held.map(h => ({code: h.code, name: h.name, n: h.mc, why: h.why})), ...over.slice(0, 10).map(x => ({code: x.s.code, name: x.s.name, n: nOf(x.s.code), why: `${rules.want}곳 밖${x.met ? '' : ' · 조건 대기'}`}))],
    surged: screened.filter(x => !x.met).sort((p, q) => (q.j.power - p.j.power) || p.s.code.localeCompare(q.s.code)).slice(0, 5)
      .map(x => ({code: x.s.code, name: x.s.name, power: x.j.power, rank: rankOf.get(x.s.code), r20: x.j.r20, n: nOf(x.s.code), why: [fin(x.j.r20) && x.j.r20 > rules.maxR20 ? `20거래일 ${pc(x.j.r20)}` : null, x.j.dil ? '희석 공시' : null, x.j.heat ? '과열 공시' : null].filter(Boolean).join(' · ')})),
    counts: Object.fromEntries([...mc.counts].sort((p, q) => cmpCode(p[0], q[0]))), // 따로 다시 세기가 맞대는 값(한 번이라도 든 곳 모두)
    entrants: mcBase.map(p => [p.code, p.met])}; // 다시 뽑기에 든 회사(고정 조건을 넘은 곳) · 진입 조건(1 = 충족)
  return {...hd, ready: true, items, waiting: waiting.slice(0, 20), nWaiting: waiting.length, held, pool, flags, flow, mc: mcSum, rank, recordedToday: !!same, prev: prev ? {asOf: prev.asOf, n: prev.cand.length} : null, changes,
    common: [...new Set(items.map(x => x.g))].map(g => ({g, sector: items.find(x => x.g === g)?.sector ?? null, n: items.filter(x => x.g === g).length})).filter(x => x.n > 1), evalEnd};
}

/** 후보 발행본 — 그날 저녁 기록이 이미 남은 뒤(그 기록에 후보가 없을 때) 처음 낸 목록을 따로 남김(고치지 않음 · public/data/atlas11/cand/<묶음>/<날짜>.json · 규칙이 바뀐 날은 <규칙 이름>/<날짜>.json · scripts/atlas11/cand_record.mjs) */
export const candPubOf = (lens, recordedAt) => (lens?.cand?.ready ? {schema: 'atlas11-cand-1', place: lens.place, asOf: lens.asOf, recordedAt, boardId: lens.boardId ?? null, universe: lens.universe?.id ?? null,
  rules: lens.cand.rules, label: lens.cand.label, window: lens.cand.window, index: lens.cand.index, evalDays: lens.cand.evalDays, evalEnd: lens.cand.evalEnd ?? null, pool: lens.cand.pool,
  flow: {window: lens.cand.flow?.window ?? null, sectors: (lens.cand.flow?.sectors ?? []).map(x => ({rank: x.rank, id: x.id, label: x.label, amount: x.amount}))},
  mc: lens.cand.mc ? {draws: lens.cand.mc.draws, seed: lens.cand.mc.seed, days: lens.cand.mc.days, base: lens.cand.mc.base, seeds: lens.cand.mc.seeds, out: lens.cand.mc.out, surged: lens.cand.mc.surged} : null,
  top: (lens.cand.rank ?? []).slice(0, 30).map(x => ({r: x.r, code: x.c, name: x.nm, power: fin(x.p) ? Math.round(x.p * 1e4) / 1e4 : null, fomo: x.x, n: x.n, st: x.st})), // 1~365등 가운데 앞 서른(그날 자리 · 고치지 않음)
  cand: candRecordOf(lens.cand), held: lens.cand.held ?? [], nWaiting: lens.cand.nWaiting ?? 0,
  note: '처음 낸 후보 목록 — 고치지 않음(정정은 새 기록) · 평가 = 이 날 종가에서 5 · 10 · 20거래일 뒤 · 실제 매매 성과 아님'} : null);
/** 저녁 기록에 남길 모양(그날 첫 발행본 — 고치지 않음) */
export const candRecordOf = cand => (cand?.ready ? cand.items.map(x => ({rank: x.rank, code: x.code, name: x.name, g: x.g, close: x.close, date: x.date, status: x.status, reason: x.reason, risk: x.risk.text, gap: x.gap, r20: x.r20,
  flow: {sector: x.flow.sector.label, sectorRank: x.flow.sector.rank ?? null, fi: fin(x.flow.fi) ? Math.round(x.flow.fi) : null, power: fin(x.flow.power) ? Math.round(x.flow.power * 1e4) / 1e4 : null, rank: x.flow.powerRank ?? null, fomo: x.flow.fomo ?? null},
  ...(x.mc ? {mc: {n: x.mc.n, of: x.mc.of}} : {})})) : []);
