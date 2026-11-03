/* 수르 두 길 — 자료 고르기(화면 없음 · 시험이 그대로 부름)
   사장님 2026-11-03 15:49(+04) 「… 잡스라면 수르에 본질 꽃이 될회사 그리고 돈이 몰리는 회사를 찾는데 특화된 수르를 만든다면 어떻게 만들거야 그리고 만들어봐」
   (원문 · 설계 docs/design/su-two-2026-11-03/order-2049.txt)
   새 셈은 없다 — 지금 사이트 자료(theme-bloom · theme · flow-why · atlas/data)를 그대로 골라 보일 줄로만 바꿈 */

export const CODE = /^[0-9A-Z]{6}$/;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const str = v => (typeof v === 'string' && v ? v : null);

/** 31.93 → 「+31.9%」 · −5.67 → 「−5.7%」(빼기는 U+2212 · 지금 사이트와 같음) */
export function pct(v) {
  if (!fin(v)) return '?';
  const a = Math.abs(v).toFixed(1);
  return a === '0.0' ? '0.0%' : (v > 0 ? '+' : '−') + a + '%';
}
/** 업종 · 회사가 시장보다 — 8.87 → 「8.9% 더」 · −32.15 → 「32% 덜」(10 넘으면 자연수) */
export function moreLess(v) {
  if (!fin(v)) return '?';
  const a = Math.abs(v), t = a < 10 ? a.toFixed(1) : String(Math.round(a));
  return t + '% ' + (v >= 0 ? '더' : '덜');
}
/** '2026-11-03' → 「11월 3일」 */
export function dateKo(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? ''));
  return m ? `${+m[2]}월 ${+m[3]}일` : '?';
}
const recOf = r => (r && fin(r.rate) && fin(r.base) ? {rate: Math.round(r.rate), base: Math.round(r.base), n: fin(r.n) ? r.n : null, hits: fin(r.hits) ? r.hits : null} : null);

/** 꽃이 될 회사 — 오늘 고른 회사(pick) · 없는 날은 조건에 가장 가까운 회사(near · 주문 1512 · 고른 회사와 섞지 않음) · 둘 다 없으면 none
    say = 그달 조건(말) · miss = 가까운 회사가 못 맞춘 조건 하나 · rec = 지난 기록(100번에 몇 번 · 아무 회사 몇 번) */
export function bloomList(B) {
  const say = Array.isArray(B?.today?.rule?.say) ? B.today.rule.say.filter(s => typeof s === 'string' && s) : [];
  const inds = Array.isArray(B?.today?.inds) ? B.today.inds : [];
  const picks = inds.flatMap(i => (Array.isArray(i?.co) ? i.co : [])
    .filter(r => Array.isArray(r) && CODE.test(r[0] ?? ''))
    .map(r => ({code: r[0], name: str(r[1]) ?? r[0], ind: str(i?.n) ?? ''})));
  if (picks.length) return {mode: 'pick', rows: picks, say, miss: null, min: null, rec: recOf(B?.honest)};
  const nt = Array.isArray(B?.near?.today) ? B.near.today.filter(r => Array.isArray(r) && CODE.test(r[0] ?? '')) : [];
  if (nt.length) return {mode: 'near', rows: nt.map(r => ({code: r[0], name: str(r[1]) ?? r[0], ind: str(r[2]) ?? '', ix: fin(r[3]) ? r[3] : null})),
    say, miss: str(B?.near?.rule?.say), min: fin(B?.near?.rule?.min) ? B.near.rule.min : null, rec: recOf(B?.near?.rec)};
  return {mode: 'none', rows: [], say, miss: null, min: null, rec: recOf(B?.honest)};
}

/** 돈이 몰린 까닭(flow-why) — 업종 이름 → 한 줄 · 켜진 까닭(외국인 · 기관 · 좋은 소식 …) */
export function whyOf(W, name) {
  const d = (Array.isArray(W?.inds) ? W.inds : []).find(i => i?.n === name);
  if (!d) return null;
  return {line: Array.isArray(d.why?.ko) ? d.why.ko.filter(s => typeof s === 'string').join(' ') : null,
    items: (Array.isArray(d.items) ? d.items : []).filter(it => it?.s === 'on' && typeof it?.ko?.t === 'string').map(it => ({k: it.k, t: it.ko.t, sub: str(it.ko.sub) ?? ''}))};
}

/** 돈이 몰린 회사 — 한 달 동안 시장보다 더 오른 업종 n 곳(theme.json x 큰 차례 · 첫 화면 「돈이 몰린 종목」과 같은 셈 · home-new.js flowRows)의 대장 회사 */
export function moneyList(TH, W, n = 3) {
  // 대장 회사를 모르는 업종은 먼저 빼고 셋을 채움(첫 화면 flowRows 는 셋을 고른 뒤 뺌 — 대장이 다 있는 날은 같은 셋)
  return (Array.isArray(TH?.inds) ? TH.inds : []).filter(i => fin(i?.x) && typeof i?.n === 'string' && i.x > 0)
    .map(i => ({code: CODE.test(i.lead?.[0] ?? '') ? i.lead[0] : null, name: str(i.lead?.[1]), ind: i.n, x: i.x}))
    .filter(r => r.code && r.name).sort((a, b) => b.x - a.x).slice(0, n).map(r => ({...r, why: whyOf(W, r.ind)}));
}

/** 이 회사가 왜 여기 있나 — 고른 회사 · 가까운 회사 · 돈이 몰린 회사(둘 다면 둘 다) · 없으면 빈 목록 */
export function reasonsFor(code, bl, money) {
  const out = [], p = bl.rows.find(r => r.code === code);
  if (p && bl.mode === 'pick') out.push({kind: 'pick', ok: bl.say, no: [], ind: p.ind, rec: bl.rec});
  if (p && bl.mode === 'near') out.push({kind: 'near', ok: bl.say.filter(s => s !== bl.miss), no: bl.miss ? [bl.miss] : [], ind: p.ind, ix: p.ix, min: bl.min, rec: bl.rec});
  const m = money.find(r => r.code === code);
  if (m) out.push({kind: 'money', ind: m.ind, x: m.x, why: m.why});
  return out;
}

/** 지수 한 달 줄 — 회사 줄(co line · 기준일 = 100)과 같은 날들 · 코스닥 회사는 코스닥 */
export function idxLine(H, market, base, asOf) {
  const k = market === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI', rows = H?.idx?.[k]?.rows;
  if (!Array.isArray(rows) || !str(base) || !str(asOf)) return null;
  const sel = rows.filter(r => Array.isArray(r) && typeof r[0] === 'string' && r[0] >= base && r[0] <= asOf && fin(r[1]) && r[1] > 0);
  if (sel.length < 2) return null;
  const b = sel[0][1];
  return {name: k === 'KOSDAQ' ? '코스닥' : '코스피', line: sel.map(r => r[1] / b * 100), from: sel[0][0], to: sel[sel.length - 1][0]};
}
/** 회사 한 달 줄 — co.line(기준일 = 10000) → 100 */
export function coLine(co) {
  const l = Array.isArray(co?.line) ? co.line.filter(fin) : [];
  return l.length >= 2 ? l.map(v => v / 100) : null;
}

/** 업종 회사 — mkt.json 에서 그 업종 모두 · 한 달 동안 많이 오른 차례(지금 사이트 업종 쪽 「많이 오른 순」과 같음) · 값을 모르면 뒤에 이름 차례 */
export function indRows(M, name) {
  const cs = M?.companies && typeof M.companies === 'object' ? M.companies : {};
  return Object.entries(cs).filter(([code, v]) => CODE.test(code) && v?.i === name && str(v?.n))
    .map(([code, v]) => ({code, name: v.n, c: fin(v.c) ? v.c : null}))
    .sort((a, b) => (b.c ?? -Infinity) - (a.c ?? -Infinity) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** 첫 화면이 된 뒤(사장님 2026-11-03 18:33(+04) 「응」 — 물음 「이 새 수르를 첫 화면으로 바꿀까요?」) — 지금 수르(/next/) 고리로 온 사람은 그쪽으로 그대로 이어 줌
    수르 두 길 = '' · '#' · '#/' · '#/c/…' · '#/i/…' · 그 밖의 #/…(#/w/ · #/t/ · #/s/ 보낸 것 · #/why …)는 지금 수르 쪽
    물음표 표 중 lang(말) · sw(말 바꿈) · kakao(카톡 들어오기 결과) · dev 가 있으면 지금 수르 쪽 — 그 밖의 표(?v= · 광고 표 …)는 그대로 둠 · 이어 줄 곳 또는 null */
export const KEEP_Q = Object.freeze(['lang', 'sw', 'kakao', 'dev']);
export function forwardTo(search, hash) {
  const q = String(search ?? ''), hh = String(hash ?? '');
  const su = /^(#\/?)?$/.test(hh) || /^#\/(c|i)\/./.test(hh);
  let keep = false;
  try { const sp = new URLSearchParams(q); keep = KEEP_Q.some(k => sp.has(k)); } catch { keep = false; }
  return su && !keep ? null : '/next/' + q + hh;
}
