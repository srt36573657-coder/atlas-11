/**
 * ATLAS 11 · 「지난 6개월 앞서 달린 곳」 — 지도 탭 맨 아래 접힌 상자 하나의 셈(예측 없음 · 지난 종가로만)
 *   사장님 2026-10-06 14:55 「해」 — 14:48 카드의 「1 해」: ATLAS 지도에 ① 지수가 1년 가운데 가장 높던 값보다 몇 % 아래인지
 *     ② 지난 6달 앞서 달린 업종 안의 앞서 달린 회사를 지난 기록으로만 붙인다 · 앞날 말은 넣지 않는다 · 올리기는 사장님 단추
 *   잣대는 공부와 같게(reports/atlas11/study/대세 상승 초입 — 20년 기록 · 한국과 미국.md · scripts/atlas11/study/third_way_20y.py):
 *     회사 = 지난 120거래일 종가 변화(121번째 전 거래일 종가 → 마지막 종가) · 그 120일 안에 하루 오르내림이 한도(한국 31% · 미국 50%)를
 *            넘는 날이 있으면 셈하지 않는다(액면 분할 같은 자료 끊김 — 한국 하루 가격 제한은 30%)
 *     업종 = 그 업종 회사들의 하루 오르내림을 같은 무게로 평균해 이어 붙인 지수의 지난 120거래일 변화
 *            (판 전체 거래일 차례 위에서 · 그 날 회사 3곳 넘게 있을 때만 그 날을 더함 · 한도 넘는 날은 뺌 · 처음 날과 마지막 날이 모두 있어야 셈)
 *     앞서 달림 = 셀 수 있는 것 가운데 위 20%(백분위 0.8 이상 · 같은 값은 평균 순위 — pandas rank(pct=True) 와 같음) · 업종은 10개 넘게 셀 수 있을 때만
 *     두 겹 = 회사도 위 20% · 그 회사의 업종도 위 20%(공부의 「업종 + 회사」)
 *   지수 자리 = 마지막 종가 ÷ 지난 250거래일 가운데 가장 높은 종가 − 1(250개가 다 있을 때만)
 *   앞날 값(확률 · 방향 · 목표)은 만들지 않는다 — 공부의 「그 뒤 6달」 숫자도 판에 싣지 않는다(판에는 지난 120거래일 · 250거래일만).
 */
export const LEAD6 = Object.freeze({days: 120, top: 0.2, minMembers: 3, minGroups: 10, yearDays: 250, jump: Object.freeze({kr: 0.31, us: 0.5})});

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const finite = x => typeof x === 'number' && Number.isFinite(x);
const round = (x, d = 6) => finite(x) ? Number(x.toFixed(d)) : null;

/** 같은 값은 평균 순위로 나눈 백분위 — [0.1, 0.5, 0.5] → [1/3, 2.5/3, 2.5/3] */
export function pctRank(xs) {
  const ix = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]), out = new Array(xs.length);
  for (let i = 0; i < ix.length;) {
    let j = i; while (j + 1 < ix.length && ix[j + 1][0] === ix[i][0]) j++;
    const r = ((i + j) / 2 + 1) / ix.length; for (let k = i; k <= j; k++) out[ix[k][1]] = r;
    i = j + 1;
  }
  return out;
}

/** 회사 한 곳 — rows(날짜 차례 · 확정 종가) → 지난 days 거래일 변화 · 그 안에 한도 넘는 날이 있으면 null */
export function changeOf(rows, {days = LEAD6.days, jump = LEAD6.jump.kr} = {}) {
  if (!Array.isArray(rows) || rows.length < days + 1) return null;
  const w = rows.slice(-(days + 1));
  for (let i = 1; i < w.length; i++) if (!(w[i].close > 0 && w[i - 1].close > 0) || Math.abs(w[i].close / w[i - 1].close - 1) > jump) return null;
  return round(w.at(-1).close / w[0].close - 1);
}

/**
 * 업종 하나 — 회사들 rows → 판 거래일 차례(dates) 위에서 같은 무게 하루 오르내림 지수의 지난 days 거래일 변화
 *   dates: 판 전체 회사 날짜를 모은 차례(오름차순 · 마지막 = 판 마지막 날) · 회사마다 하루 오르내림 = 그 회사 바로 앞 종가 → 그 날 종가
 */
export function groupChangeOf(memberRows, dates, {days = LEAD6.days, jump = LEAD6.jump.kr, minMembers = LEAD6.minMembers} = {}) {
  if (!Array.isArray(dates) || dates.length < days + 1) return null;
  const pos = new Map(dates.map((d, i) => [d, i])), sum = new Float64Array(dates.length), cnt = new Int32Array(dates.length);
  for (const rows of memberRows) for (let i = 1; i < (rows?.length ?? 0); i++) {
    const p = pos.get(rows[i].date); if (p === undefined) continue;
    const r = rows[i].close / rows[i - 1].close - 1; if (!finite(r) || Math.abs(r) > jump) continue;
    sum[p] += r; cnt[p]++;
  }
  const last = dates.length - 1, first = last - days;
  if (cnt[last] < minMembers || cnt[first] < minMembers) return null; // 처음 날 · 마지막 날 지수가 있어야(공부의 「지수 값이 없는 날」과 같음)
  let v = 1; for (let p = first + 1; p <= last; p++) if (cnt[p] >= minMembers) v *= 1 + sum[p] / cnt[p];
  return round(v - 1);
}

/**
 * 판 전체 — companies: [{code, groupId, rows}] (rows = 확정 종가 · 날짜 차례) · place: 'kr' | 'us'
 * 반환: {days, top, from, to, groups: Map(id → {change120, lead}), companies: Map(code → {change120, lead}), measured: {groups, companies}, lead: {groups, companies, both}, cut: {group, company}}
 */
export function lead6Of(companies, {place = 'kr', days = LEAD6.days, top = LEAD6.top, minGroups = LEAD6.minGroups} = {}) {
  const jump = LEAD6.jump[place] ?? LEAD6.jump.kr;
  const dates = [...new Set(companies.flatMap(c => (c.rows ?? []).map(r => r.date)))].filter(d => ISO.test(d)).sort();
  const cm = new Map(companies.map(c => [c.code, {change120: changeOf(c.rows, {days, jump}), lead: false}]));
  const byGroup = new Map(); for (const c of companies) { if (!byGroup.has(c.groupId)) byGroup.set(c.groupId, []); byGroup.get(c.groupId).push(c.rows ?? []); }
  const gm = new Map([...byGroup].map(([id, rows]) => [id, {change120: groupChangeOf(rows, dates, {days, jump}), lead: false}]));
  const mark = (m, need) => {
    const ks = [...m].filter(([, v]) => finite(v.change120)); if (ks.length < need) return null;
    const rk = pctRank(ks.map(([, v]) => v.change120)); let cut = null;
    ks.forEach(([, v], i) => { v.lead = rk[i] >= 1 - top; if (v.lead && (cut === null || v.change120 < cut)) cut = v.change120; }); // 공부와 같게 rank ≥ 0.8
    return cut;
  };
  const gCut = mark(gm, minGroups), cCut = mark(cm, 1);
  const groupOf = new Map(companies.map(c => [c.code, c.groupId]));
  const both = [...cm].filter(([code, v]) => v.lead && gm.get(groupOf.get(code))?.lead).length;
  return {days, top, jump, from: dates.length > days ? dates[dates.length - 1 - days] : null, to: dates.at(-1) ?? null, groups: gm, companies: cm,
    measured: {groups: [...gm.values()].filter(v => finite(v.change120)).length, companies: [...cm.values()].filter(v => finite(v.change120)).length},
    lead: {groups: [...gm.values()].filter(v => v.lead).length, companies: [...cm.values()].filter(v => v.lead).length, both}, cut: {group: gCut, company: cCut}};
}

/** 지수 자리 — rows(지수 종가) 가운데 upTo 날까지 · 지난 yearDays 거래일 가운데 가장 높은 종가와 견줌(같은 값이면 앞 날) */
export function indexPosition(rows, {upTo = null, yearDays = LEAD6.yearDays} = {}) {
  const r = (rows ?? []).filter(x => ISO.test(x?.date ?? '') && finite(x.close) && x.close > 0 && (!upTo || x.date <= upTo)).sort((a, b) => a.date.localeCompare(b.date));
  if (r.length < yearDays) return null;
  const w = r.slice(-yearDays), last = w.at(-1); let hi = w[0]; for (const x of w) if (x.close > hi.close) hi = x;
  return {date: last.date, close: last.close, high: hi.close, highDate: hi.date, gap: round(last.close / hi.close - 1), days: w.length, from: w[0].date};
}

/**
 * 쌓아 둔 지수 종가(stored) + 관측 묶음의 지수 행(live) — 쌓아 둔 날은 그대로 두고(기록은 덮어쓰지 않음) 없는 날만 upTo 날까지 붙인다
 *   upTo = 판 마지막 확정 종가 날 — 장중에 모은 관측 묶음의 그 날 값이 쌓이지 않게
 *   같은 날 값이 다르면(0.01% 넘게) 바꾸지 않고 mismatch 에 적는다
 */
export function mergeIndexRows(stored, live, {upTo}) {
  const have = new Map((stored ?? []).filter(x => ISO.test(x?.date ?? '') && finite(x.close)).map(x => [x.date, {date: x.date, close: x.close}]));
  const added = [], mismatch = [];
  for (const x of live ?? []) {
    if (!ISO.test(x?.date ?? '') || !finite(x.close) || !(x.close > 0) || !upTo || x.date > upTo) continue;
    const old = have.get(x.date);
    if (old) { if (Math.abs(old.close / x.close - 1) > 1e-4) mismatch.push({date: x.date, stored: old.close, live: x.close}); continue; }
    have.set(x.date, {date: x.date, close: x.close}); added.push(x.date);
  }
  return {rows: [...have.values()].sort((a, b) => a.date.localeCompare(b.date)), added: added.sort(), mismatch};
}
