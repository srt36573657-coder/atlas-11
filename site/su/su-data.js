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

/* ── 육하원칙 엔진 — 주문 1238(사장님 2026-11-04 07:38(+04) 「속단에 운영되는 엔진은 육하원칙에 구조가 되어야 한다」 · docs/design/su-new-2026-11-04/order-1238.txt)
   자료 한 줄 → 누가 · 언제 · 어디서 · 무엇을 · 어떻게 · 왜 여섯 칸 → 화면은 이 칸으로 문장을 지음
   이름표(누가 · 언제 …)는 화면에 쓰지 않음(비서가 회장께 올리는 글처럼 문장에 녹임) · 왜는 늘 자료에 있는 지난 사실(앞날 말 0 · 새 셈 0) */
const batchim = w => { const t = String(w ?? ''), c = t.charCodeAt(t.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const PAIRS = Object.freeze({은: ['은', '는'], 이: ['이', '가'], 을: ['을', '를'], 과: ['과', '와'], 이에요: ['이에요', '예요']});
/** 받침에 맞는 토씨 — jo('삼성생명', '은') → 「삼성생명은」 · jo('제이에스링크', '은') → 「제이에스링크는」 */
export function jo(w, p) { const t = String(w ?? ''), pr = PAIRS[p]; return pr ? t + (batchim(t) ? pr[0] : pr[1]) : t + p; }
export const MARKET_KO = Object.freeze({KOSPI: '코스피', KOSDAQ: '코스닥'});
const lastOf = l => (Array.isArray(l) && l.length >= 2 && fin(l[l.length - 1]) ? l[l.length - 1] - 100 : null);
/** 회사 한 곳의 여섯 칸 — co = {code, name, ind, market} · reasons = reasonsFor 결과 · line · index = 한 달 줄(기준 100 · idxLine) · asOf = 자료 날
    → {who, when, where, what, how, why, kind, code} 또는 null(번호 · 이름이 없으면) */
export function w5hCo({co, reasons = [], line = null, index = null, asOf = null} = {}) {
  if (!co || !CODE.test(co.code ?? '') || !str(co.name)) return null;
  const pick = reasons.find(x => x?.kind === 'pick'), near = reasons.find(x => x?.kind === 'near'), money = reasons.find(x => x?.kind === 'money');
  const c = lastOf(line), i = lastOf(index?.line), mk = MARKET_KO[co.market] ?? null;
  const what = pick ? `이달 꽃 조건 ${pick.ok.length}가지에 모두 맞았어요`
    : near ? `이달 꽃 조건 ${near.ok.length + near.no.length}가지 가운데 ${near.ok.length}가지에 맞았어요`
    : money ? `한 달 동안 시장보다 ${moreLess(money.x)} 오른 ${str(co.ind) ? co.ind + ' ' : ''}업종의 대장이에요` : null;
  const how = c != null ? (i != null ? `한 달 동안 ${pct(c)} 움직였고, 같은 때 ${jo(index.name, '은')} ${pct(i)}였어요` : `한 달 동안 ${pct(c)} 움직였어요`) : null;
  const why = money && str(money.why?.line) ? money.why.line
    : near && near.no.length ? `「${near.no[0]}」 조건 하나만 못 맞았어요`
    : pick ? '이달 꽃 조건을 모두 맞춰서 여기 있어요' : null; // 「회사라서」는 쓰지 않음(화면 낱말 거르기 「사라」에 걸림)
  const where = (pick || near) ? [mk, str(co.ind) ? co.ind + ' 업종' : null].filter(Boolean).join(' ') : mk; // 돈이 몰린 회사는 업종 이름이 무엇을 칸에 있음(같은 말 두 번 0)
  return {code: co.code, kind: pick ? 'pick' : near ? 'near' : money ? 'money' : null, who: co.name, when: dateKo(asOf), where: where || null, what, how, why};
}
/** 업종 한 곳의 여섯 칸 — {name, x, why, rows, count, asOf} → 누가 = 업종 · 어떻게 = 오른 회사 수(rows 의 c) */
export function w5hInd({name, x = null, why = null, rows = [], count = null, asOf = null} = {}) {
  if (!str(name)) return null;
  const known = (Array.isArray(rows) ? rows : []).filter(r => fin(r?.c)), up = known.filter(r => r.c > 0).length;
  const d = dateKo(asOf);
  return {who: name + ' 업종', when: d === '?' ? null : d + '까지', where: null, what: fin(x) ? `한 달 동안 시장보다 ${moreLess(x)} 올랐어요` : null,
    how: known.length ? `값을 아는 회사 ${known.length}곳 가운데 ${up}곳이 한 달 동안 올랐어요` : null,
    why: str(why?.line) ?? null, count: fin(count) ? count : null};
}
/** 지난 기록의 여섯 칸 — rec = {rate, base, n, hits}(bloomList) · mode near · pick */
export function w5hRec(rec, mode = 'near') {
  if (!rec || !fin(rec.rate) || !fin(rec.base)) return null;
  const who = mode === 'near' ? '조건에 가까웠던 회사' : '꽃 조건에 맞았던 회사';
  return {who, when: '지난 기록에서', where: null, what: `100번에 ${rec.rate}번 꽃이 됐어요`, how: `아무 회사나 고르면 100번에 ${rec.base}번이었어요`,
    why: rec.rate > rec.base ? '조건이 맞았던 회사가 아무 회사보다 꽃이 된 적이 많았어요' : rec.rate < rec.base ? '조건에 가까웠던 회사가 아무 회사보다 꽃이 된 적이 적었어요' : '조건에 가까웠던 회사와 아무 회사가 같았어요',
    n: fin(rec.n) ? rec.n : null};
}
/** 여섯 칸 → 문장들(이름표 없이) — [첫 문장(누가 · 언제 · 어디서 · 무엇을), 어떻게, 왜] · 없는 칸은 건너뜀 */
export function say5(w) {
  if (!w) return [];
  const head = w.what ? `${jo(w.who, '은')} ${w.when && w.when !== '?' ? w.when + ' ' : ''}${w.where ? w.where + '에서 ' : ''}${w.what}`.replace(/[.]?$/, '.') : null;
  const end = t => (t && !/[.?!]$/.test(t) ? t + '.' : t);
  return [head, end(w.how), end(w.why)].filter(Boolean);
}

/** 첫 화면이 된 뒤(사장님 2026-11-03 18:33(+04) 「응」 — 물음 「이 새 수르를 첫 화면으로 바꿀까요?」) — 지금 수르(/next/) 고리로 온 사람은 그쪽으로 그대로 이어 줌
    수르 두 길 = '' · '#' · '#/' · '#/c/…' · '#/i/…' · '#/b' · '#/k' · '#/r' · '#/p'(+ '/<번호>' · 주문 1238 새 판 길) · 그 밖의 #/…(#/w/ · #/t/ · #/s/ 보낸 것 · #/why …)는 지금 수르 쪽
    물음표 표 중 lang(말) · sw(말 바꿈) · kakao(카톡 들어오기 결과) · dev 가 있으면 지금 수르 쪽 — 그 밖의 표(?v= · 광고 표 …)는 그대로 둠 · 이어 줄 곳 또는 null */
export const KEEP_Q = Object.freeze(['lang', 'sw', 'kakao', 'dev']);
export function forwardTo(search, hash) {
  const q = String(search ?? ''), hh = String(hash ?? '');
  const su = /^(#\/?)?$/.test(hh) || /^#\/(c|i)\/./.test(hh) || /^#\/[bkrp](\/[0-9A-Z]{6})?$/.test(hh); // 새 판 길 넷(주문 1238 — 꽃 #/b · 조건 #/k · 기록 #/r · 멈춤 #/p · 회사 번호를 붙여도 됨)
  let keep = false;
  try { const sp = new URLSearchParams(q); keep = KEEP_Q.some(k => sp.has(k)); } catch { keep = false; }
  return su && !keep ? null : '/next/' + q + hh;
}
