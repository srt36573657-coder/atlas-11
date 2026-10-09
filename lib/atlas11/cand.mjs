/**
 * ATLAS 11 · 매수 검토 후보(최대 7곳) — 규칙 cand-rules-3 「돈이 들어온 업종 안에서 · 1만 번 다시 뽑아 소거」(연구용 · 성능 검증 전)
 *   사장님 2026-10-09 03:09(마카오 시각) 첨부 「ATLAS 제품 재설계 명령 — 목적: 지금 매수할 가치가 있는 후보 7개를 찾는다」
 *   · 03:53 「7개 돈이 되는 종목을 … 아틀란스 365개에서 돈에 흐름이 강한 업종내에서 종목을 찾아내야 해 지금은 백지 상태에서 하는거야 … 먼저 보고 먼저 해봐」
 *   · 03:59 「알아서 해 단 잡스라면 어떻게 했나가 기준이고 애플의 방식이 중심이야」
 *   · 10:14 「7개에 종목을 선정할때 모테카를로 확율방식을 도입한후 소거법으로 최총 7개를 찾아내는 시스템을 구축하여 다시 7개에 종목을 찾아내라」 → 3판
 *   셈만(화면 없음) — 판 읽기(lens.mjs)가 부르고 저녁 7시 기록(build_view.mjs)이 그 결과를 고치지 않고 남긴다 · 시험 tests/atlas11/cand.test.mjs
 *   · 따로 다시 세기(다른 언어 · 같은 씨앗 → 같은 횟수): scripts/atlas11/verify/cand_mc_verify.py
 *   옛 cand-rules-1(공시 · 실적으로 365곳을 처음부터 거름)은 쓰지 않음 — 사장님 03:53 「잘못 만들고 있어」 · cand-rules-2(아래 ①②③ 그대로 · 몬테카를로 없음)는 2026-10-08 첫 기록에 남음
 *
 * 한 문장(잡스라면): 「돈이 들어온 업종에서 돈이 실제로 들어온 회사를 고르고, 지난 10거래일을 1만 번 다시 뽑아 자주 남은 곳부터 7곳을 남긴다.」
 *   ① 돈이 들어온 업종 = ATLAS 「돈 흐름」(업종 순환 · lib/atlas11/rotation.mjs · 사이트 #/flow/rotation 과 같은 셈)의 「늘어난 곳」 1위~3위
 *        가운데 같은 10거래일 외국인+기관 순매수(추정)가 + 이고 업종 값도 오른 곳 — 두 잣대(시가총액 몫 · 투자자 매매)가 함께 가리킨 업종만
 *   ② 그 업종 안 회사 = 그날 종가 있음 · 마지막 결산 영업이익 · 순이익 흑자 · 위험 공시 없음 · 외국인+기관 10거래일 순매수(추정) + 인 곳(①②가 기준 — 2판과 같음 · 낮추지 않음)
 *   ③ 1만 번 다시 뽑기(몬테카를로) — 지난 10거래일 가운데 열 날을 다시 뽑아(같은 날이 거듭 나올 수도 · 빠질 수도) 그 날들로 ①②와 차례를 처음부터 다시 셈
 *        → 회사마다 「7곳 안에 든 횟수」(1만 번 중 몇 번) · 업종마다 「돈이 들어온 3곳에 든 횟수」
 *        뽑는 수는 씨앗(규칙 이름 | 판 날짜)으로 정해 누가 돌려도 같은 횟수 · 다시 뽑는 회사는 고정 조건(종가 · 흑자 · 위험 공시 없음)을 넘은 곳 모두(업종 차례가 바뀌면 다른 업종 회사도 듦)
 *        날마다 값: 업종 = 그날 옮겨 간 돈 · 그날 지수 오르내림 · 그날 외국인+기관(rotation daily) · 회사 = 그날 외국인+기관 순매수 × 그날 종가(lens) — 열 날을 그대로 한 번씩 뽑으면 2판과 같은 답
 *   ④ 소거법(차례대로 빼기) = ①② 기준을 넘은 회사를 [진입 조건 충족 먼저 → 7곳 안에 든 횟수가 많은 순 → 회사 크기에 견준 외국인+기관 세기 → 금액 → 종목 기호] 차례로 세우고
 *        같은 업종 3곳 · 7곳까지 남기고 나머지를 뺌 — 뺀 곳은 까닭(같은 업종 3곳 한도 · 7곳 밖)과 횟수를 함께 · 7곳은 상한(모자라면 모자란 대로 — 기준을 낮추지 않음)
 *        7곳 안에 든 횟수가 절반(5,000번) 아래면 빼지는 않고 「가장 큰 위험」 줄에 적음(며칠에 기댄 선정일 수 있음)
 *        흔들림 검사 — 씨앗만 바꿔(「규칙 이름|판 날짜|1」~「|4」) 1만 번을 네 번 더 돌려 같은 소거법을 거침 → 7곳 · 차례가 같은지(다르면 바뀐 곳을 적음 · 공식 답은 첫 씨앗)
 *   진입 조건(상태 — 순위와 따로): 20거래일 수익률 +30% 이하(짧은 기간 급등 아님) · 희석 공시 없음(30일) · 과열 공시(공매도 과열 · 단기과열 · 투자경고 지정예고) 없음(7일 — 지정이 며칠짜리라 오래된 것은 이력으로만)
 *   쓰는 공시 = 그날 장 마감(한국 15:30) 전에 나온 것만 — 평가는 그날 종가에서 시작하므로 마감 뒤 공시를 고르는 데 쓰면 미래 정보
 *   상태 = 조건 충족 · 조건 대기 · 재검토(마감 뒤 위험 공시 · 가격 기준 이탈)
 *   금액의 뜻: 업종 순환 금액 = 시장 대비 시가총액 몫의 변화(실제 투자금 아님) · 외국인+기관 금액 = 날마다 순매수 주식 수 × 그날 종가(공식 금액 아님 · 추정)
 * 「1만 번 중 몇 번」은 지난 열 날을 다시 뽑아 센 횟수(지난 자료가 얼마나 단단한지) — 앞날 오를 확률이 아니다. 가중치 · 점수 · 앞날 확률 · 목표가 · 기대 수익률은 만들지 않는다.
 */

export const CAND_RULES = Object.freeze({
  id: 'cand-rules-3',
  label: '매수 검토 후보 규칙 3판 — 돈이 들어온 업종 안에서 · 1만 번 다시 뽑아 소거(연구용 · 성능 검증 전)',
  want: 7, perSector: 3, sectors: 3, flowDays: 10, windowDays: 30, heatDays: 7, maxR20: 30, evalDays: 20, stopFromRecord: -10, stopGapPp: -5,
  draws: 10000, // 1만 번 다시 뽑기(몬테카를로) — 횟수의 흔들림(표준오차)이 많아야 0.5%p
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

/* ── 1만 번 다시 뽑기(몬테카를로) — 셈은 여기 한 곳 · 같은 셈을 파이썬으로 따로: scripts/atlas11/verify/cand_mc_verify.py ── */
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
/** 날마다 값 확인 — rotation.daily(업종: c · lr · fi) · daily(종목: dates · stocks Map(code → 열 날 외국인+기관 억)) · 날짜가 같고 빈 곳이 없어야 */
export function dailyOf(rotation, daily, rules = CAND_RULES) {
  const R = rotation?.daily, n = rules.flowDays, okArr = a => Array.isArray(a) && a.length === n && a.every(fin);
  if (!R || !Array.isArray(R.dates) || R.dates.length !== n || !Array.isArray(R.sectors) || !R.sectors.length) return {ok: false, why: `업종 날마다 값(${n}거래일)이 없어 1만 번 다시 뽑기를 못 함 — 후보를 고르지 않음`};
  if (!daily?.stocks || !Array.isArray(daily.dates) || daily.dates.join() !== R.dates.join()) return {ok: false, why: '종목 날마다 순매수 날짜가 돈 흐름 날짜와 다름 — 섞어 쓰지 않음 · 후보를 고르지 않음'};
  if (!R.sectors.every(g => g?.id && okArr(g.c) && okArr(g.lr) && okArr(g.fi))) return {ok: false, why: '업종 날마다 값에 빈 곳이 있음 — 후보를 고르지 않음'};
  const st = daily.stocks instanceof Map ? [...daily.stocks] : Object.entries(daily.stocks);
  return {ok: true, dates: R.dates, sectors: R.sectors, stocks: new Map(st.filter(([, a]) => okArr(a)))};
}
const cmpCode = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
/** 다시 뽑기에 쓰는 업종별 회사 묶음 */
export function mcBySec(base) { const m = new Map(); for (const p of base) { if (!m.has(p.g)) m.set(p.g, []); m.get(p.g).push(p); } return m; }
/**
 * 한 번 뽑기 — ix(열 날 차례 · 0~9 · 같은 날 거듭 가능)의 날들로 ①②와 차례를 처음부터 다시 셈
 *   업종 금액 · 로그 오르내림 · 외국인+기관을 뽑은 날 차례로 더함 → 금액 + 인 곳을 큰 순(같으면 앞 차례) 3곳 → 외국인+기관 + · 값 + 인 곳만
 *   → 그 업종 회사 가운데 뽑은 날 외국인+기관 합이 + 인 곳 → 진입 조건 먼저 · 세기(합 ÷ 시가총액) · 합 · 종목 기호 차례 → 같은 업종 3곳 · 7곳
 *   → {sectors: 돈이 들어온 업종 id(1~3곳), picked: 고른 회사(차례대로)} · ix = [0 … 9] 이면 지난 열 날 그대로(2판과 같은 셈)
 */
export function mcDraw(D, bySec, ix, rules = CAND_RULES) {
  const S = D.sectors, n = ix.length, amt = new Float64Array(S.length), lr = new Float64Array(S.length), fi = new Float64Array(S.length), up = [];
  for (let j = 0; j < S.length; j++) {
    let a = 0, l = 0, f = 0; const g = S[j];
    for (let i = 0; i < n; i++) { const k = ix[i]; a += g.c[k]; l += g.lr[k]; f += g.fi[k]; }
    amt[j] = a; lr[j] = l; fi[j] = f; if (a > 0) up.push(j);
  }
  up.sort((x, y) => (amt[y] - amt[x]) || (x - y));
  const sectors = [], cs = [];
  for (const j of up.slice(0, rules.sectors)) {
    if (!(fi[j] > 0 && lr[j] > 0)) continue;
    sectors.push(S[j].id);
    for (const p of bySec.get(S[j].id) ?? []) { let fe = 0; for (let i = 0; i < n; i++) fe += p.fi[ix[i]]; if (fe > 0) cs.push({p, fe, pw: fe / p.cap * 100}); }
  }
  cs.sort((x, y) => (y.p.met - x.p.met) || (y.pw - x.pw) || (y.fe - x.fe) || cmpCode(x.p.code, y.p.code));
  const per = new Map(), picked = [];
  for (const c of cs) {
    if (picked.length >= rules.want) break;
    const k = per.get(c.p.g) ?? 0; if (k >= rules.perSector) continue;
    per.set(c.p.g, k + 1); picked.push(c.p.code);
  }
  return {sectors, picked};
}
/**
 * 1만 번 다시 뽑기 — 씨앗으로 정한 고른 수로 한 번마다 열 날을 다시 뽑아(차례대로 rnd() 열 번 → 날 차례 = ⌊rnd × 10⌋) mcDraw
 *   D = dailyOf 결과 · base = 고정 조건을 넘은 회사 [{code, g(업종 id), cap(억), met(진입 조건), fi(열 날 · 억)}]
 *   → {draws, seed, days, picked: Map(code → 7곳에 든 횟수), top: Map(업종 id → 돈이 들어온 3곳에 든 횟수)}
 */
export function mcOf({D, base, rules = CAND_RULES, seed}) {
  const n = D.dates.length, B = rules.draws, rnd = rngOf(seed), bySec = mcBySec(base), picked = new Map(), top = new Map(), ix = new Array(n);
  for (let b = 0; b < B; b++) {
    for (let i = 0; i < n; i++) ix[i] = Math.floor(rnd() * n);
    const r = mcDraw(D, bySec, ix, rules);
    for (const id of r.sectors) top.set(id, (top.get(id) ?? 0) + 1);
    for (const c of r.picked) picked.set(c, (picked.get(c) ?? 0) + 1);
  }
  return {draws: B, seed, days: n, picked, top};
}
/** 횟수 글 — 「6,991번」 · 「1만 번」 */
export const timesTxt = v => (fin(v) ? `${Math.round(v).toLocaleString('ko-KR')}번` : '계산 불가');
export const drawsTxt = v => (fin(v) && v > 0 && v % 10000 === 0 ? `${v / 10000}만 번` : timesTxt(v));

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

/** 종목 하나의 판단 재료 — s(판 읽기 종목) · a(일정표 그 종목) · sec(그 종목 업종이 돈이 들어온 업종이면 그 줄) */
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
export function riskOf(j, {s, c = null, sameSector = 0, mc = null}) {
  const pos = c?.info?.pos52;
  if (j.afterBad) return {kind: 'after', text: `장 마감 뒤 공시 — ${kd(day(j.afterBad.publishedAt))} 「${j.afterBad.title}」 · 이번 판단에 아직 넣지 않음(그 뒤 판에서 셈)`};
  if (j.dil) return {kind: 'dilute', text: `희석 공시 — ${kd(day(j.dil.publishedAt))} 「${j.dil.title}」 · 주식 수가 늘 수 있음`};
  if (j.heat) return {kind: 'heat', text: `과열 경고 — ${kd(day(j.heat.publishedAt))} 「${j.heat.title}」 · 짧은 기간 쏠림`};
  if (fin(j.r20) && j.r20 > CAND_RULES.maxR20) return {kind: 'run', text: `20거래일 ${pc(j.r20)} — 돈이 값에 이미 실렸을 수 있음(${CAND_RULES.maxR20}% 넘음)`};
  if (mc && fin(mc.n) && fin(mc.of) && mc.n * 2 < mc.of) return {kind: 'mc', text: `${drawsTxt(mc.of)} 다시 뽑아 ${timesTxt(mc.n)}만 7곳에 듦(절반 아래) — ${mc.sector ?? '그'} 업종이 돈이 들어온 3곳에 든 것 ${timesTxt(mc.sectorN)} · 며칠에 기댄 선정일 수 있음`};
  if (fin(pos) && pos >= 0.95) return {kind: 'top52', text: `52주 최고값 근처(1년 범위의 ${Math.round(pos * 100)}% 자리) — 되돌림 폭이 클 수 있음`};
  if (j.heatOld) return {kind: 'heat-old', text: `과열 경고 이력 — ${kd(day(j.heatOld.publishedAt))} 「${j.heatOld.title}」(${CAND_RULES.heatDays}일 지나 진입 조건에서는 셈하지 않음)`};
  if (j.pref) return {kind: 'pref', text: `우선주 ${prefOf(j.pref.title, s?.name)} — ${kd(day(j.pref.publishedAt))} 「${j.pref.title}」(보통주 아님 · 같은 회사)`};
  if (sameSector > 1) return {kind: 'same', text: `같은 업종 후보 ${sameSector}곳 — 같은 사건에 함께 흔들릴 수 있음`};
  return {kind: 'turn', text: '돈 흐름은 자주 바뀜 — 그 뒤 판에서 업종 차례 · 외국인+기관 순매수가 이어지는지 확인'};
}

/** 탈락 까닭(앞 기록 후보가 이번에 빠졌을 때) — 처음 깨진 조건 */
const failOf = j => (!j ? '판에서 빠짐' : !j.checks.sector.ok ? '돈 흐름 이탈 — 업종이 돈이 들어온 1위~3위 밖' : !j.checks.data.ok ? '자료 지연(그날 종가 없음)' : !j.checks.risk.ok ? '위험 공시'
  : !j.checks.profit.ok ? '적자(영업이익 또는 순이익)' : !j.checks.flow.ok ? '돈 흐름 이탈 — 외국인+기관 순매도' : null);

/**
 * 판 전체 → 후보 · 조건 대기 · 밀린 곳 · 앞 기록과 바뀐 것
 *   stocks(판 읽기 종목 — fl.f10e · fl.i10e · fund.cap) · board(info.pos52 · groups) · agenda(byCode) · rotation(돈 흐름) · records(후보 기록) · sessions(거래일)
 */
export function candOf({place = 'kr', asOf, stocks = [], board = null, agenda = null, ref = null, records = [], sessions = [], rules = CAND_RULES, closeAt = '15:30 KST', rotation = null, daily = null}) {
  const cutoff = cutoffOf(asOf, closeAt);
  const base = {rules: rules.id, label: rules.label, asOf, place, want: rules.want, perSector: rules.perSector, window: {days: rules.windowDays, from: asOf ? plusDays(asOf, -rules.windowDays) : null, to: asOf, cutoff},
    index: ref ? {name: ref.name ?? null, r20: fin(ref.r20) ? ref.r20 : null} : null, evalDays: rules.evalDays, flowDays: rules.flowDays};
  const notReady = (why, need) => ({...base, ready: false, items: [], waiting: [], held: [], pool: {universe: stocks.length}, why, need, changes: null, flow: null});
  if (place !== 'kr') return notReady('외국인 · 기관 매매와 공시 자료가 없어 「돈이 들어온 회사」를 셀 수 없음 — 후보를 고르지 않음(숫자를 지어내지 않음)', ['외국인 · 기관 순매매(날마다)', '공시(회사 발표 원문)']);
  if (!rotation || rotation.none) return notReady(`돈 흐름(업종 순환)을 셈하지 못함${rotation?.reason ? ` — ${rotation.reason}` : ''} · 후보를 고르지 않음`, ['돈 흐름(업종 순환) 셈']);
  if (rotation.asOf !== asOf) return notReady(`돈 흐름 날짜(${rotation.asOf ?? '없음'})가 판 날짜(${asOf})와 다름 — 섞어 쓰지 않음`, ['같은 날 돈 흐름']);
  if (!stocks.some(s => fin(s.fl?.f10e))) return notReady('외국인 · 기관 매매 자료가 없어 「돈이 들어온 회사」를 셀 수 없음 — 후보를 고르지 않음', ['외국인 · 기관 순매매(날마다)']);
  const D = dailyOf(rotation, daily, rules); // ③ 1만 번 다시 뽑기의 날마다 값 — 없으면 고르지 않음(2판으로 몰래 돌아가지 않음)
  if (!D.ok) return notReady(D.why, [`날마다 업종 값 · 외국인+기관 순매수(${rules.flowDays}거래일)`]);
  const secs = flowSectorsOf(rotation, rules), secOf = new Map();
  for (const sc of secs) for (const code of (board?.groups ?? []).find(g => g.id === sc.id)?.codes ?? []) secOf.set(code, sc);
  const byC = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const windowFrom = base.window.from;
  const all = stocks.map(s => ({s, c: byC.get(s.code) ?? null, j: judgeOf({s, a: agenda?.byCode?.[s.code], sec: secOf.get(s.code) ?? null, asOf, windowFrom, rules, cutoff})}));
  const inSec = all.filter(x => x.j.checks.sector.ok);
  const pool = {universe: stocks.length, sectors: secs.filter(x => x.ok).length, inSector: inSec.length,
    data: inSec.filter(x => x.j.checks.data.ok).length, profit: inSec.filter(x => x.j.checks.data.ok && x.j.checks.profit.ok).length,
    risk: inSec.filter(x => x.j.checks.data.ok && x.j.checks.profit.ok && x.j.checks.risk.ok).length, screen: all.filter(x => x.j.screen).length, met: all.filter(x => x.j.met).length};
  // ③ 1만 번 다시 뽑기 — 고정 조건(종가 · 흑자 · 위험 공시 없음)을 넘은 회사 모두(어느 업종이든) · 씨앗 = 규칙 이름 | 판 날짜
  const groupOf = new Map((board?.groups ?? []).flatMap(g => (g.codes ?? []).map(c => [c, g.id])));
  const mcBase = all.filter(x => x.j.checks.data.ok && x.j.checks.profit.ok && x.j.checks.risk.ok && fin(x.j.cap) && groupOf.has(x.s.code) && D.stocks.has(x.s.code))
    .map(x => ({code: x.s.code, g: groupOf.get(x.s.code), cap: x.j.cap, met: x.j.checks.entry.ok, fi: D.stocks.get(x.s.code)}));
  const seed = seedOf(`${rules.id}|${asOf}`), mc = mcOf({D, base: mcBase, rules, seed});
  const asIs = mcDraw(D, mcBase.length ? mcBySec(mcBase) : new Map(), D.dates.map((_, i) => i), rules); // 열 날을 그대로 한 번씩 — 아래 2판 차례와 같아야(스스로 맞대기)
  const nOf = code => mc.picked.get(code) ?? 0, pctOf = code => Math.round(nOf(code) * 100 / mc.draws), secN = id => mc.top.get(id) ?? 0;
  // ④ 소거법 — ①② 기준을 넘은 곳을 진입 조건 → 7곳에 든 횟수(1% 단위) → 세기 → 금액 → 종목 기호 차례로 세우고 같은 업종 3곳 · 7곳까지 남김(나머지는 까닭과 함께 뺌)
  const order2 = (p, q) => (q.j.met - p.j.met) || ((q.j.power ?? -1e9) - (p.j.power ?? -1e9)) || ((q.j.fiE ?? -1e9) - (p.j.fiE ?? -1e9)) || p.s.code.localeCompare(q.s.code); // 2판 차례
  const orderBy = picked => (p, q) => (q.j.met - p.j.met) || ((picked.get(q.s.code) ?? 0) - (picked.get(p.s.code) ?? 0)) || order2(p, q);
  const order = orderBy(mc.picked), screened = all.filter(x => x.j.screen), ranked = [...screened].sort(order);
  const walk = xs => { const per = new Map(), out = []; for (const x of xs) { if (out.length >= rules.want) break; const k = per.get(x.s.g) ?? 0; if (k >= rules.perSector) continue; per.set(x.s.g, k + 1); out.push(x.s.code); } return out; };
  // 흔들림 검사 — 씨앗만 바꿔 네 번 더(공식 답은 첫 씨앗) · 7곳 · 차례가 같은지
  const alts = [1, 2, 3, 4].map(k => walk([...screened].sort(orderBy(mcOf({D, base: mcBase, rules, seed: seedOf(`${rules.id}|${asOf}|${k}`)}).picked))));
  const as2 = (() => { const per = new Map(), out = []; for (const x of all.filter(y => y.j.screen).sort(order2)) { if (out.length >= rules.want) break; const k = per.get(x.s.g) ?? 0; if (k >= rules.perSector) continue; per.set(x.s.g, k + 1); out.push(x.s.code); } return out; })();
  const sameAsIs = asIs.picked.join() === as2.join() && asIs.sectors.join() === secs.filter(x => x.ok).map(x => x.id).join();
  const per = new Map(), picked = [], held = [], over = [];
  for (const x of ranked) {
    const n = per.get(x.s.g) ?? 0;
    if (n >= rules.perSector) { held.push({code: x.s.code, name: x.s.name, sector: x.s.gl ?? null, why: `같은 업종 ${rules.perSector}곳 한도`, mc: nOf(x.s.code)}); continue; }
    if (picked.length >= rules.want) { over.push(x); continue; }
    per.set(x.s.g, n + 1); picked.push(x);
  }
  const endOf = d => { const k = sessions.indexOf(d); return k >= 0 && sessions[k + rules.evalDays] ? sessions[k + rules.evalDays] : null; }, evalEnd = endOf(asOf);
  const prev = [...records].filter(r => Array.isArray(r?.cand) && r.asOf && r.asOf < asOf).sort((p, q) => p.asOf.localeCompare(q.asOf)).at(-1) ?? null;
  const same = [...records].find(r => Array.isArray(r?.cand) && r.asOf === asOf) ?? null; // 오늘 기록(첫 발행본)이 이미 있으면
  const powerRank = new Map([...ranked].sort((p, q) => ((q.j.power ?? -1e9) - (p.j.power ?? -1e9)) || p.s.code.localeCompare(q.s.code)).map((x, i) => [x.s.code, i + 1])); // 회사 크기에 견준 세기만으로 센 차례(진입 조건과 상관없이)
  const items = picked.map((x, i) => {
    const sameSector = picked.filter(y => y.s.g === x.s.g).length, sec = x.j.sec;
    const recFrom = same?.cand?.some(y => y.code === x.s.code) ? same : prev?.cand?.some(y => y.code === x.s.code) ? prev : null, rec = recFrom?.cand.find(y => y.code === x.s.code) ?? null; // 처음 기록된 값(가격 기준선)
    const refClose = rec?.close ?? x.s.close, refDate = rec?.date ?? x.s.date, fromRef = fin(refClose) && fin(x.s.close) ? (x.s.close / refClose - 1) * 100 : null;
    const stop = fin(refClose) ? refClose * (1 + rules.stopFromRecord / 100) : null;
    const priceBroken = (fin(fromRef) && fromRef <= rules.stopFromRecord) || (fin(x.j.gap) && x.j.gap <= rules.stopGapPp);
    const nextEv = (agenda?.byCode?.[x.s.code]?.upcoming ?? []).filter(e => e.date >= asOf).slice(0, 3).map(e => ({date: e.date, name: e.name, level: e.level ?? null}));
    const recheck = [x.j.afterBad ? '장 마감 뒤 위험 공시' : null, priceBroken ? '가격 기준 이탈' : null].filter(Boolean); // 재검토 — 고른 뒤 깨진 조건(순위는 그대로 · 상태만)
    const status = recheck.length ? 'recheck' : x.j.met ? 'met' : 'wait';
    const bizBroken = !!(x.j.afterBad && (EXCLUDE_RE.test(x.j.afterBad.title) || DILUTE_RE.test(x.j.afterBad.title)));
    const mcx = {n: nOf(x.s.code), of: mc.draws, pct: pctOf(x.s.code), low: nOf(x.s.code) * 2 < mc.draws, sector: sec.label, sectorN: secN(sec.id)};
    return {rank: i + 1, code: x.s.code, name: x.s.name, sector: x.s.gl ?? null, g: x.s.g ?? null, close: x.s.close ?? null, date: x.s.date ?? null, mc: mcx,
      status, statusText: {met: '조건 충족', wait: '조건 대기', recheck: '재검토'}[status], met: x.j.met, recheckWhy: recheck.join(' · ') || null,
      waitWhy: x.j.met ? null : [fin(x.j.r20) && x.j.r20 > rules.maxR20 ? `20거래일 ${pc(x.j.r20)}(급등)` : null, x.j.dil ? '희석 공시' : null, x.j.heat ? '과열 공시' : null].filter(Boolean).join(' · '),
      reason: `돈이 들어온 업종 ${sec.rank}위 ${sec.label}(${rules.flowDays}거래일 시장 대비 ${eokTxt(sec.amount)}) · 외국인+기관 ${rules.flowDays}거래일 ${eokTxt(x.j.fiE)}${fin(x.j.power) ? ` = 시가총액의 ${x.j.power.toFixed(2)}%` : ''} · ${drawsTxt(mc.draws)} 다시 뽑아 ${timesTxt(mcx.n)} 7곳에 듦`,
      flow: {sector: {rank: sec.rank, id: sec.id, label: sec.label, amount: sec.amount, change: sec.change, fi: sec.fi}, fi: x.j.fiE, f10: x.j.f10, i10: x.j.i10, cap: x.j.cap, power: x.j.power, powerRank: powerRank.get(x.s.code) ?? null, days: rules.flowDays},
      evidence: x.j.ev, r20: x.j.r20, gap: x.j.gap, r5: fin(x.s.r5) ? x.s.r5 : null, pos52: x.c?.info?.pos52 ?? null, high52: x.c?.info?.high52 ?? null, low52: x.c?.info?.low52 ?? null,
      fund: {fy: x.j.fund.fy ?? null, roe: x.j.fund.roe ?? null, debt: x.j.fund.debtExempt ? null : x.j.fund.debt ?? null, debtExempt: !!x.j.fund.debtExempt, op: x.j.fund.op ?? null, net: x.j.fund.net ?? null, cap: x.j.cap},
      checks: x.j.checks, risk: riskOf(x.j, {s: x.s, c: x.c, sameSector, mc: mcx}),
      after: {bad: x.j.afterBad ? {title: x.j.afterBad.title, at: x.j.afterBad.publishedAt} : null, change: x.j.afterChange},
      entry: {rule: `20거래일 수익률 ${pc(rules.maxR20)} 이하 · 희석 · 과열 공시 없음`, ok: x.j.met},
      exit: {flow: {rule: `돈 흐름 이탈 — 그 업종이 돈이 들어온 1위~3위에서 빠지거나, 이 회사 외국인+기관 ${rules.flowDays}거래일이 순매도로 바뀜`, broken: false, now: `업종 ${sec.rank}위 · 외국인+기관 ${eokTxt(x.j.fiE)}`},
        business: {rule: '사업 가설 훼손 — 공급계약 해지 · 위험 공시(거래정지 · 투자경고 · 관리종목 등) · 희석 공시 · 새 결산 적자', broken: bizBroken,
          now: bizBroken ? `장 마감 뒤 「${x.j.afterBad.title}」` : x.j.dil ? `희석 공시 「${x.j.dil.title}」(진입 조건에서 셈)` : '해당 공시 없음 · 결산 흑자'},
        price: {rule: `가격 기준 이탈 — 처음 기록한 종가 대비 ${pc(rules.stopFromRecord)} 아래 또는 20거래일 지수 대비 ${pp(rules.stopGapPp)} 아래(그 값에 판다는 뜻 아님 · 체결 값은 다를 수 있음)`, refClose, refDate, recorded: !!rec, stop, fromRef, broken: priceBroken},
        period: {rule: `평가 기간 — 기록한 날부터 ${rules.evalDays}거래일`, start: recFrom?.asOf ?? null, end: recFrom ? endOf(recFrom.asOf) : evalEnd, ended: !!(recFrom && endOf(recFrom.asOf) && endOf(recFrom.asOf) <= asOf)}},
      next: {events: nextEv, read: '그 뒤 판(거래일 16:00)의 돈 흐름 업종 차례 · 외국인+기관 순매수'}};
  });
  const waiting = over.map(x => ({code: x.s.code, name: x.s.name, status: x.j.met ? '조건 충족' : '조건 대기', mc: nOf(x.s.code)})); // 기준은 넘었지만 7곳 밖(소거 · 이름과 횟수만)
  // 앞 기록과 바뀐 것 — 신규 · 유지 · 제외(제외는 까닭: 처음 깨진 조건 · 아니면 순위 밖 · 업종 한도)
  let changes = null;
  if (prev) {
    const now = new Set(items.map(x => x.code)), before = new Map(prev.cand.map(x => [x.code, x]));
    changes = {from: prev.asOf, to: asOf, added: items.filter(x => !before.has(x.code)).map(x => ({code: x.code, name: x.name, why: `돈이 들어온 업종 ${x.flow.sector.rank}위 · 외국인+기관 ${eokTxt(x.flow.fi)}`})),
      kept: items.filter(x => before.has(x.code)).map(x => ({code: x.code, name: x.name, rankFrom: before.get(x.code).rank, rankTo: x.rank})),
      removed: prev.cand.filter(x => !now.has(x.code)).map(x => { const y = all.find(z => z.s.code === x.code); const why = failOf(y?.j) ?? (held.some(h => h.code === x.code) ? '같은 업종 한도' : '순위 밖(조건은 그대로)');
        return {code: x.code, name: x.name, why, status: failOf(y?.j) ? '재검토' : '대기'}; })};
  }
  const flags = Object.fromEntries(all.map(x => [x.s.code, [x.j.checks.sector.ok, x.j.checks.data.ok, x.j.checks.profit.ok, x.j.checks.risk.ok, x.j.checks.flow.ok, x.j.met].map(b => (b ? '1' : '0')).join('')])); // 종목마다 조건 여섯(돈 들어온 업종 · 종가 · 흑자 · 위험 공시 없음 · 외국인+기관 순매수 · 진입 조건)
  const flow = {window: rotation.window ?? null, flows: rotation.flows ?? null, sectors: secs.map(x => ({...x, mc: secN(x.id)})), out: (rotation.out ?? []).map(g => ({id: g.id, label: g.label, amount: g.amount})), pair: rotation.pair ? {from: rotation.pair.from?.label ?? null, to: rotation.pair.to?.label ?? null, start: rotation.pair.start ?? null, days: rotation.pair.days ?? null} : null,
    waves: (rotation.waves ?? []).map(w => ({n: w.n, to: w.to?.label ?? null, from: w.from?.label ?? null, start: w.start, end: w.end, days: w.days}))};
  // 1만 번 다시 뽑기 요약 — 업종(3곳에 든 횟수 큰 순 다섯) · 기준 밖인데 자주 뽑힌 회사(넣지 않음 · 까닭과 함께 셋)
  const labelOf = new Map((board?.groups ?? []).map(g => [g.id, g.label]));
  const whyOut = j => (!j.checks.sector.ok ? '업종이 3곳 밖' : !j.checks.flow.ok ? '외국인+기관 순매도' : '기준 밖'); // 지난 10거래일 그대로 세면
  const mcSum = {draws: mc.draws, seed, days: D.dates, base: mcBase.length, half: Math.ceil(mc.draws / 2),
    sectors: [...mc.top].sort((p, q) => (q[1] - p[1]) || cmpCode(p[0], q[0])).slice(0, 5).map(([id, n]) => ({id, label: labelOf.get(id) ?? id, n, rank: secs.find(x => x.id === id)?.rank ?? null})),
    outside: all.filter(x => !x.j.screen && nOf(x.s.code) > 0).sort((p, q) => (nOf(q.s.code) - nOf(p.s.code)) || p.s.code.localeCompare(q.s.code)).slice(0, 3)
      .map(x => ({code: x.s.code, name: x.s.name, sector: x.s.gl ?? null, n: nOf(x.s.code), why: whyOut(x.j)})),
    out: [...held.map(h => ({code: h.code, name: h.name, n: h.mc, why: h.why})), ...over.map(x => ({code: x.s.code, name: x.s.name, n: nOf(x.s.code), why: `${rules.want}곳 밖`}))],
    low: items.filter(x => x.mc.low).length, asIs: {same: sameAsIs, picked: asIs.picked, rules2: as2},
    seeds: (() => { const off = items.map(x => x.code), key = a => [...a].sort().join(); const moved = off.filter((c, i) => alts.some(a => a[i] !== c));
      return {n: alts.length, sameSet: alts.every(a => key(a) === key(off)), sameOrder: alts.every(a => a.join() === off.join()), moved: moved.map(c => ({code: c, name: items.find(x => x.code === c)?.name ?? c}))}; })(),
    counts: Object.fromEntries([...mc.picked].sort((p, q) => cmpCode(p[0], q[0]))), top: Object.fromEntries([...mc.top].sort((p, q) => cmpCode(p[0], q[0]))), // 따로 다시 세기가 맞대는 값(한 번이라도 든 곳 모두)
    entrants: mcBase.map(p => [p.code, p.met ? 1 : 0]).sort((p, q) => cmpCode(p[0], q[0]))}; // 다시 뽑기에 든 회사(고정 조건을 넘은 곳) · 진입 조건(1 = 충족)
  return {...base, ready: true, items, waiting: waiting.slice(0, 20), nWaiting: waiting.length, held, pool, flags, flow, mc: mcSum, recordedToday: !!same, prev: prev ? {asOf: prev.asOf, n: prev.cand.length} : null, changes,
    common: [...new Set(items.map(x => x.g))].map(g => ({g, sector: items.find(x => x.g === g)?.sector ?? null, n: items.filter(x => x.g === g).length})).filter(x => x.n > 1), evalEnd};
}

/** 후보 발행본 — 그날 저녁 기록이 이미 남은 뒤(그 기록에 후보가 없을 때) 처음 낸 목록을 따로 남김(고치지 않음 · public/data/atlas11/cand/<묶음>/<날짜>.json · scripts/atlas11/cand_record.mjs) */
export const candPubOf = (lens, recordedAt) => (lens?.cand?.ready ? {schema: 'atlas11-cand-1', place: lens.place, asOf: lens.asOf, recordedAt, boardId: lens.boardId ?? null, universe: lens.universe?.id ?? null,
  rules: lens.cand.rules, label: lens.cand.label, window: lens.cand.window, index: lens.cand.index, evalDays: lens.cand.evalDays, evalEnd: lens.cand.evalEnd ?? null, pool: lens.cand.pool,
  flow: {window: lens.cand.flow?.window ?? null, sectors: (lens.cand.flow?.sectors ?? []).map(x => ({rank: x.rank, id: x.id, label: x.label, amount: x.amount, change: x.change, fi: x.fi, ok: x.ok}))},
  mc: lens.cand.mc ? {draws: lens.cand.mc.draws, seed: lens.cand.mc.seed, days: lens.cand.mc.days, base: lens.cand.mc.base, sectors: lens.cand.mc.sectors, out: lens.cand.mc.out} : null,
  cand: candRecordOf(lens.cand), held: lens.cand.held ?? [], nWaiting: lens.cand.nWaiting ?? 0,
  note: '처음 낸 후보 목록 — 고치지 않음(정정은 새 기록) · 평가 = 이 날 종가에서 5 · 10 · 20거래일 뒤 · 실제 매매 성과 아님'} : null);
/** 저녁 기록에 남길 모양(그날 첫 발행본 — 고치지 않음) */
export const candRecordOf = cand => (cand?.ready ? cand.items.map(x => ({rank: x.rank, code: x.code, name: x.name, g: x.g, close: x.close, date: x.date, status: x.status, reason: x.reason, risk: x.risk.text, gap: x.gap, r20: x.r20,
  flow: {sector: x.flow.sector.label, sectorRank: x.flow.sector.rank, fi: fin(x.flow.fi) ? Math.round(x.flow.fi) : null, power: fin(x.flow.power) ? Math.round(x.flow.power * 1e4) / 1e4 : null},
  ...(x.mc ? {mc: {n: x.mc.n, of: x.mc.of}} : {})})) : []);
