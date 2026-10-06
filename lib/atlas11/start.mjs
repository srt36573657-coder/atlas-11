/**
 * ATLAS 11 · 아래 탭 「처음」 — 처음 사는 사람에게 지난 기록으로 찍은 다섯(셈만 · 화면 없음 · 시험: tests/atlas11/start.test.mjs)
 *   사장님 2026-10-06 23:19 「여기서 초보들이 뭘사야 안전한지 알려줘 그 탭을 지혜롭게 만들어봐 잡스였다면」
 *        2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」
 *   기준 하나: 우량(고를 때 표시 kind=quality) · 시가총액 100위 안 가운데, 지난 3년(756거래일) 꼭대기에서 가장 덜 떨어진(가장 깊은 하락이 작은) 다섯
 *     · 앞날 값은 없다 — 지난 종가로 센 차례일 뿐(2026-10-04 15:37 「이제 예측을 하지 않는다」)
 *     · 하루 오르내림이 한도(한국 ±31% · 미국 ±50% — lead6.mjs 와 같음)를 넘는 날이 창 안에 있으면 분할 · 합병 같은 바뀜으로 보고 그 회사는 재지 않는다
 *     · 견줄 값: 창을 다 채운 회사 전부의 가장 깊은 하락 가운데 값 · 지수 1년 변화(있으면)
 *     · 3년 종가가 모자란 판(미국 판 — 2025년 8월 4일부터)은 찍지 않고 「언제부터」만 적는다
 */
import {LEAD6} from './lead6.mjs';

export const START = Object.freeze({days: 756, yearDays: 252, capTop: 100, kind: 'quality', want: 5, jump: LEAD6.jump});
const round = (x, d = 6) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);
const median = xs => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };

/** 한 회사 — rows(날짜 차례 · 확정 종가) → 지난 days 거래일 창의 가장 깊은 하락 · 변화 · 가장 크게 떨어진 하루 · 창이 모자라거나 한도 넘는 날이 있으면 null */
export function drawdownOf(rows, {days = START.days, yearDays = START.yearDays, jump = START.jump.kr} = {}) {
  if (!Array.isArray(rows) || rows.length < days + 1) return null;
  const w = rows.slice(-(days + 1));
  let peak = w[0], mdd = 0, top = w[0], low = w[0], worst = {change: 0, date: null};
  for (let i = 1; i < w.length; i++) {
    const a = w[i - 1].close, b = w[i].close;
    if (!(a > 0 && b > 0)) return null;
    const ch = b / a - 1; if (Math.abs(ch) > jump) return null;
    if (ch < worst.change) worst = {change: ch, date: w[i].date};
    if (b > peak.close) peak = w[i];
    const dd = b / peak.close - 1; if (dd < mdd) { mdd = dd; top = peak; low = w[i]; }
  }
  const last = w.at(-1), y = w.length > yearDays ? w[w.length - 1 - yearDays] : null;
  return {from: w[0].date, to: last.date, mdd: round(mdd), peak: {date: top.date, close: top.close}, trough: {date: low.date, close: low.close},
    change: round(last.close / w[0].close - 1), change1y: y ? round(last.close / y.close - 1) : null, worstDay: {date: worst.date, change: round(worst.change)},
    atLow: mdd < 0 && low.date === last.date};
}

/**
 * 판 전체 — companies: [{code, name, group:{id,label}, kind, capRank, roe, debt, debtExempt, rows}] (rows = board.mjs finalRows)
 *   → {ready:true, rule, days, from, to, measured, candidates, picks[], typical, index1y, sameGroup} | {ready:false, ...언제부터}
 */
export function startOf(companies, {place = 'kr', indexRows = null, indexName = null, days = START.days, yearDays = START.yearDays, capTop = START.capTop, want = START.want} = {}) {
  const jump = START.jump[place] ?? START.jump.kr;
  const longest = Math.max(0, ...companies.map(c => c.rows?.length ?? 0));
  const firstDate = companies.map(c => c.rows?.[0]?.date).filter(Boolean).sort()[0] ?? null;
  const base = {schema: 'atlas11-start-1', place, rule: {kind: START.kind, capTop, days, want, jump}};
  if (longest < days + 1) {
    // 3년 창이 모자람 — 첫 종가 날에서 3년 뒤 그 달부터(어림: 756거래일 ≈ 3년)
    const ready = firstDate ? `${Number(firstDate.slice(0, 4)) + Math.round(days / yearDays)}-${firstDate.slice(5, 7)}` : null;
    return {...base, ready: false, have: {from: firstDate, days: Math.max(0, longest - 1)}, readyMonth: ready};
  }
  const measured = [];
  for (const c of companies) { const d = drawdownOf(c.rows, {days, yearDays, jump}); if (d) measured.push({...c, d}); }
  const cand = measured.filter(x => x.kind === START.kind && Number.isFinite(x.capRank) && x.capRank <= capTop)
    .sort((a, b) => b.d.mdd - a.d.mdd || a.capRank - b.capRank || String(a.code).localeCompare(String(b.code)));
  const picks = cand.slice(0, want).map((x, i) => ({rank: i + 1, code: x.code, name: x.name, group: x.group ? {id: x.group.id, label: x.group.label} : null, capRank: x.capRank,
    roe: Number.isFinite(x.roe) ? x.roe : null, debt: Number.isFinite(x.debt) ? x.debt : null, debtExempt: !!x.debtExempt, ...x.d}));
  const to = measured.map(x => x.d.to).sort().at(-1) ?? null, from = measured.map(x => x.d.from).sort()[0] ?? null;
  // 지수 1년 변화(코스피 · S&P 500) — 판 날짜까지 · 252거래일 앞 종가 대비
  let index1y = null;
  if (Array.isArray(indexRows) && indexRows.length) {
    const r = indexRows.filter(x => x.date <= (to ?? '9999') && x.close > 0);
    if (r.length > yearDays) index1y = {name: indexName, date: r.at(-1).date, from: r[r.length - 1 - yearDays].date, change: round(r.at(-1).close / r[r.length - 1 - yearDays].close - 1)};
  }
  const counts = new Map(); for (const p of picks) if (p.group) counts.set(p.group.label, (counts.get(p.group.label) ?? 0) + 1);
  const sameGroup = [...counts].filter(([, n]) => n > 1).map(([label, n]) => ({label, n})).sort((a, b) => b.n - a.n);
  return {...base, ready: true, from, to, measured: measured.length, candidates: cand.length, picks, typical: {mdd: round(median(measured.map(x => x.d.mdd)))}, index1y, sameGroup};
}

/** 판 검사 — 고른 다섯이 기준대로인가(판을 쓸 때 board.mjs validateBoard 가 부른다) → 문제 목록(비면 통과) */
export function checkStart(s, companies = []) {
  const bad = []; if (!s) return ['없음'];
  if (!s.ready) return s.readyMonth || s.have ? [] : ['언제부터 없음'];
  const byCode = new Map(companies.map(c => [c.code, c]));
  if (!Array.isArray(s.picks) || s.picks.length > s.rule.want) bad.push('다섯보다 많음');
  for (const [i, p] of (s.picks ?? []).entries()) {
    const c = byCode.get(p.code);
    if (!c) bad.push('판에 없는 회사 ' + p.code);
    else if (c.kind !== s.rule.kind) bad.push('우량 아님 ' + p.code);
    if (!(p.capRank <= s.rule.capTop)) bad.push('시가총액 순위 밖 ' + p.code);
    if (!(p.mdd <= 0) || (i && p.mdd > s.picks[i - 1].mdd)) bad.push('가장 깊은 하락 차례 ' + p.code);
    if (p.rank !== i + 1) bad.push('순위 ' + p.code);
  }
  return bad;
}
