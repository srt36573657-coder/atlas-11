/* 영어판(주문 1127-2320 · 사장님 2026-11-27(서울) 23:20 「이거 영어 번역판으로도 상단에 탭을 만들어서 만들어 알겠지」)
 *  맨 위 「한국어 · 영어」 탭에서 영어를 고르면(이 휴대폰에 기억) 화면을 다 그린 뒤 #su 안 글 · 이름표(aria-label · placeholder · title · alt)를 영어로 바꿈
 *  한국어판은 그대로(이 파일은 영어를 고른 때만 받음) · 바꾸는 차례 = ① 통째 말(EX) ② 숫자 바꾸기(원 → ₩ · 날 → Nov 18 · 프로 → %) ③ 문장 틀(RULES) ④ 낱말(PH · 꾀 이름 · 업종)
 *  못 바꾼 글은 한국어 그대로 둠(첫 판 = 기록 탭 · 위아래 길잡이 — 나머지 쪽은 이어서) */
import {EX, NAMES_KO, SECTORS} from '/su/su-en-dict.js';

const HAN = /[가-힣]/, MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WDAY = {월: 'Mon', 화: 'Tue', 수: 'Wed', 목: 'Thu', 금: 'Fri', 토: 'Sat', 일: 'Sun'};
const num = x => +String(x).replace(/,/g, '');
const wonOf = (e, man, r) => '₩' + Math.round((e ? parseFloat(String(e).replace(/,/g, '')) * 1e8 : 0) + (man ? num(man) * 1e4 : 0) + (r ? num(r) : 0)).toLocaleString('en-US');
const nameEn = s => NAMES_KO[s] ?? s, secEn = s => SECTORS[s] ?? s;
const signed = (v, way) => (way === '늘었어요' ? '+' : '−') + v;

/** 숫자 바꾸기 — 88원 줄 · 날 · 돈 · 프로 */
export function normNum(s) {
  return s.replace(/88원 줄/g, '88% line')
    .replace(/(\d{4})년 (\d{1,2})월 (\d{1,2})일(?:\(([월화수목금토일])\))?/g, (m, y, mo, d, w) => MON[+mo - 1] + ' ' + +d + ', ' + y + (w ? ' (' + WDAY[w] + ')' : ''))
    .replace(/(\d{1,2})월 (\d{1,2})일(?:\(([월화수목금토일])\))?/g, (m, mo, d, w) => MON[+mo - 1] + ' ' + +d + (w ? ' (' + WDAY[w] + ')' : ''))
    .replace(/(?:(\d[\d,]*(?:\.\d+)?)억\s?)?(?:(\d[\d,]*)만\s?)?(\d[\d,]*)?원/g, (m, e, man, r) => (e || man || r ? wonOf(e, man, r) : m))
    .replace(/([+-]?\d[\d,]*(?:\.\d+)?)프로/g, '$1%');
}
const W = '₩[\\d,]+', P = '[+-]?[\\d.,]+%', N = '\\d[\\d,]*';
/** 문장 틀 — 숫자를 바꾼 뒤의 글에 맞춤(처음부터 끝까지 맞을 때만) */
const RULES = [
  [new RegExp(`^산 날 (.+?) · 산 값 (${W})$`), (m, d, w) => `Bought ${d} · at ${w}`],
  [new RegExp(`^판 날 (.+?) · 판 값 (${W})$`), (m, d, w) => `Sold ${d} · at ${w}`],
  [new RegExp(`^(.+?) 종가 (${W})$`), (m, d, w) => `${d} close ${w}`],
  [new RegExp(`^산 돈 (${W})$`), (m, w) => `Cost ${w}`],
  [new RegExp(`^지금 값 (${W})$`), (m, w) => `Current value ${w}`],
  [new RegExp(`^판 돈 (${W})$`), (m, w) => `Sale proceeds ${w}`],
  [new RegExp(`^(${W}) (늘었어요|줄었어요)$`), (m, w, way) => signed(w, way)],
  [new RegExp(`^(${P}) 올랐어요$`), (m, p) => `Up ${p}`],
  [new RegExp(`^(${P}) 내렸어요$`), (m, p) => `Down ${p}`],
  [/^그대로예요$/, () => 'Unchanged'],
  [new RegExp(`^(${N})번 샀어요$`), (m, n) => `Bought ${n} times`],
  [new RegExp(`^산 비중 (${P})$`), (m, p) => `Share of cost ${p}`],
  [new RegExp(`^지금 값 비중 (${P})$`), (m, p) => `Share of value ${p}`],
  [new RegExp(`^가장 많이 고른 업종은 (.+?)(?:이에요|예요) · (${N})번 가운데 (${N})번$`), (m, s, a, b) => `Most picked sector: ${secEn(s)} · ${b} of ${a}`],
  [new RegExp(`^두 번째는 (.+?)(?:이에요|예요) · (${N})번$`), (m, s, a) => `Second: ${secEn(s)} · ${a}`],
  [/^업종을 모르는 회사만 샀어요$/, () => 'Only companies with an unknown sector'],
  [new RegExp(`^(.+?) 종가 꺾은선 — (.+?) (${W})부터 (.+?) (${W})까지 · 점선은 산 값 (${W})$`), (m, co, d0, w0, d1, w1, b) => `${co} closing prices — ${d0} ${w0} to ${d1} ${w1} · dashed line = buy price ${b}`],
  [new RegExp(`^(.+?) 날마다 수익률 — (.+?)부터 (.+?)까지(?: · 끝 (${P}))?(?: · 산 적 없음)?$`), (m, k, a, b, p) => `${nameEn(k)} daily return — ${a} to ${b}${p ? ' · last ' + p : ''}`],
  [new RegExp(`^들인 돈 (${W}) · 그날 값 (${W})$`), (m, a, b) => `Invested ${a} · value that day ${b}`],
  [new RegExp(`^산 것 (${N})번 · 판 것 (${N})번 · 들고 있는 것 (${N})번\\((${N})곳\\)$`), (m, a, b, c, d) => `Bought ${a} · sold ${b} · held ${c} (${d} companies)`],
  [new RegExp(`^들고 있는 날 (${N})일 · 정한 날\\((${N})일째\\)까지 (${N})일$`), (m, a, n, b) => `Held ${a} days · ${b} days to the set day (day ${n})`],
  [new RegExp(`^들고 있은 날 (${N})일 · 정한 날\\((${N})일째\\)에 팔았어요$`), (m, a, n) => `Held ${a} days · sold on the set day (day ${n})`],
  [new RegExp(`^들고 있은 날 (${N})일 · 88% line 밑으로 내려 팔았어요$`), (m, a) => `Held ${a} days · sold below the 88% line`],
  [new RegExp(`^앞 장날보다 (${W}) (늘었어요|줄었어요)$`), (m, w, way) => `${signed(w, way)} vs. the previous trading day`],
  [new RegExp(`^들인 돈보다 (${W}) (늘었어요|줄었어요)$`), (m, w, way) => `${signed(w, way)} vs. money invested`],
  [new RegExp(`^(모두|이 안에) (${N})번 · 산 돈 (${W}) → (판 돈과 지금 값|판 돈|지금) (${W})$`), (m, w, n, a, k, b) => `${w === '모두' ? 'All' : 'Inside'}: ${n} trades · cost ${a} → ${k === '지금' ? 'now' : k === '판 돈' ? 'proceeds' : 'proceeds and current value'} ${b}`],
  [new RegExp(`^(${N})번 · 산 돈 (${W}) → 판 돈 (${W})$`), (m, n, a, b) => `${n} trades · cost ${a} → proceeds ${b}`],
  [new RegExp(`^(${N})번 · 산 돈 (${W}) → 지금 (${W})$`), (m, n, a, b) => `${n} trades · cost ${a} → now ${b}`],
  [new RegExp(`^산 돈 (${W}) → 지금 (${W})$`), (m, a, b) => `Cost ${a} → now ${b}`],
  [new RegExp(`^산 돈 (${W}) → 판 돈 (${W})$`), (m, a, b) => `Cost ${a} → proceeds ${b}`],
  [new RegExp(`^(${N})번 · (${N})곳$`), (m, a, b) => `${a} trades · ${b} companies`],
  [new RegExp(`^(${N})번 · (${N})번 · (${N})번$`), (m, a, b, c) => `${a} · ${b} · ${c}`],
  [new RegExp(`^(${N})번 · (${N})번$`), (m, a, b) => `${a} · ${b}`],
  [new RegExp(`^(${N})번$`), (m, a) => `${a} trades`],
  [new RegExp(`^(${N})곳$`), (m, a) => `${a} companies`],
  [new RegExp(`^평균 ([\\d.]+)일$`), (m, a) => `Average ${a} days`],
  [new RegExp(`^(${N})개 더 보기 · 남은 (${N})개$`), (m, a, b) => `Show ${a} more · ${b} left`],
  [new RegExp(`^남은 (${N})날 더 보기$`), (m, a) => `Show ${a} more days`],
  [new RegExp(`^나머지 (${N})개 더 보기$`), (m, a) => `Show ${a} more`],
  [new RegExp(`^나머지 꾀 (${N})가지 더 보기$`), (m, a) => `Show ${a} more stratagems`],
  [new RegExp(`^나머지 (${N})곳 더 보기$`), (m, a) => `Show ${a} more companies`],
  [new RegExp(`^나머지 (${N})줄 더 보기$`), (m, a) => `Show ${a} more rows`],
  [new RegExp(`^나머지 격언 (${N})가지 더 보기$`), (m, a) => `Show ${a} more sayings`],
  [new RegExp(`^(${N})등부터 (${N})등까지 더 보기$`), (m, a, b) => `Show #${a} to #${b}`],
  [new RegExp(`^(${N})번째부터 (${N})번째까지 더 보기$`), (m, a, b) => `Show rows ${a} to ${b}`],
  [/^다시 접기$/, () => 'Show less'],
  [/^([\d.,]+)억$/, (m, a) => '₩' + (num(a) / 10).toFixed(2) + 'B'],
  [/^([\d,]+)만$/, (m, a) => '₩' + (num(a) * 1e4).toLocaleString('en-US')],
  [new RegExp(`^그림 서른여섯 개 모두 눈금이 같아요\\. 맨 위가 (${P}), 점선이 0, 맨 아래가 (${P})예요\\.$`), (m, a, b) => `All 36 charts share one scale: top ${a}, dashed line 0, bottom ${b}.`],
  [new RegExp(`^날마다 이 꾀가 쓴 돈이 몇 프로 늘거나 줄었는지 이은 꺾은선이에요\\. 맨 위가 (${P}), 점선이 0, 맨 아래가 (${P})예요\\.$`), (m, a, b) => `Each day, how many % this stratagem's money rose or fell. Top ${a}, dashed line 0, bottom ${b}.`],
  [new RegExp(`^장이 열린 날마다, 그날 종가로 센 값이에요\\. 새 날이 위예요\\. 기록이 (${N})일뿐이라, 오르고 내림이 우연일 수 있어요\\.$`), (m, n) => `Counted at each trading day's close. Newest first. Only ${n} days of records, so ups and downs may be chance.`],
  [new RegExp(`^(${N})번째 · (.+)$`), (m, a, t) => `Tab ${a} · ${EX[t] ?? t}`],
  [new RegExp(`^수익률 (${P}) · (${W}) (늘었어요|줄었어요)$`), (m, p, w, way) => `Return ${p} · ${signed(w, way)}`],
  [new RegExp(`^(.+?) 수익률$`), (m, d) => `Return on ${d}`],
  [new RegExp(`^자료 (.+)$`), (m, d) => `Data as of ${d}`],
  [new RegExp(`^(.+?)부터 (.+?)까지 · 장날 (${N})일 · (.+?) (${P}) (올랐어요|내렸어요)$`), (m, a, b, n, d, p, way) => `${a} to ${b} · ${n} trading days · ${d} ${way === '올랐어요' ? 'up' : 'down'} ${p}`],
  [new RegExp(`^가로는 (.+?)부터 (.+?)까지 장날 (${N})일이에요\\.(.*)$`), (m, a, b, n, rest) => `Across: ${a} to ${b}, ${n} trading days.` + (rest.trim() ? ' Up is red, down is blue.' : '')],
  [new RegExp(`^모두 종가로 (${N})주씩 샀다고 친 가짜 돈이에요\\. 들고 있는 것은 가장 늦은 종가로 셌어요\\.$`), (m, n) => `All paper money: as if ${n} shares were bought at the closing price. Held stocks use the latest close.`],
  [new RegExp(`^날은 장이 열린 날로 셌어요\\. 모두 종가로 (${N})주씩 샀다고 친 가짜 돈이에요\\.$`), (m, n) => `Days are trading days. All paper money: as if ${n} shares were bought at the closing price.`],
  [new RegExp(`^(.+?) 종가로 셌어요 · 모두 가짜 돈이에요$`), (m, d) => `Counted at the ${d} close · all paper money`],
  [new RegExp(`^지금 값으로 모두 (${W}) (늘었어요|줄었어요)$`), (m, w, way) => `At current value, ${signed(w, way)} in total`],
  [new RegExp(`^판 것 모두 (${W}) (늘었어요|줄었어요)$`), (m, w, way) => `All sold: ${signed(w, way)} in total`],
  [new RegExp(`^오른 것 (${N})번 · 내린 것 (${N})번 · 그대로 (${N})번$`), (m, a, b, c) => `Up ${a} · down ${b} · unchanged ${c}`],
  [new RegExp(`^정한 날에 판 것 (${N})번 · 88% line 밑으로 판 것 (${N})번$`), (m, a, b) => `Sold on the set day ${a} · sold below the 88% line ${b}`],
  [new RegExp(`^산 것 (${N})번 · 들고 있는 것 (${N})번 · 판 것 (${N})번\\. 모두 종가로 (${N})주씩 샀다고 친 가짜 돈이에요\\.$`), (m, a, b, c, q) => `Bought ${a} · held ${b} · sold ${c}. All paper money: ${q} shares at the closing price.`],
  [new RegExp(`^산 돈이 가장 큰 꾀는 「(.+?)」예요\\. 모든 산 돈의 (${P})예요\\.$`), (m, k, p) => `The stratagem with the most cost is "${nameEn(k)}" — ${p} of all cost.`],
  [new RegExp(`^들고 있는 (${N})번을 그날 종가로$`), (m, n) => `${n} held, at that day's close`],
  [new RegExp(`^판 것 (${N})번$`), (m, n) => `Sold ${n}`],
  [new RegExp(`^산 것 (${N})번$`), (m, n) => `Bought ${n}`],
  [new RegExp(`^(${N})개월$`), (m, n) => `${n} mo`],
  [new RegExp(`^(${N})년$`), (m, n) => `${n} yr`],
  [new RegExp(`^(${N})억$`), (m, n) => `${n}00M`],
  [new RegExp(`^(${N})단 사고판 기록$`), (m, n) => `${n}-step trade record`],
  [new RegExp(`^(.+?) · 이 꾀가 사고판 회사 보기$`), (m, k) => `${nameEn(k)} · see the stocks this stratagem traded`],
  [new RegExp(`^(.+?) · 사고판 회사$`), (m, k) => `${nameEn(k)} · traded stocks`],
  [new RegExp(`^(.+?) 사고판 회사$`), (m, k) => `${nameEn(k)} traded stocks`],
  [new RegExp(`^(.+?) 사고판 회사 목록$`), (m, k) => `${nameEn(k)} traded stocks list`],
  [new RegExp(`^나눔 — (.+)$`), (m, rest) => 'Breakdown — ' + rest.split(' · ').map(x => { const q = /^(.+?) (\S+%)$/.exec(x); return q ? nameEn(q[1]) + ' ' + q[2] : nameEn(x); }).join(' · ')],
];
/** 낱말 — 문장 틀에 안 맞을 때 남은 한국어 낱말을 바꿈(긴 것 먼저) */
const PH = [['사고판 회사', 'traded stocks'], ['들고 있는 것', 'held'], ['들고 있는 날', 'days held'], ['들고 있은 날', 'days held'], ['판 것', 'sold'], ['산 돈', 'cost'], ['판 돈', 'proceeds'], ['지금 값', 'current value'],
  ['수익률', 'return'], ['산 비중', 'share of cost'], ['산 날', 'bought'], ['판 날', 'sold'], ['산 값', 'buy price'], ['판 값', 'sell price'], ['종가', 'close'], ['장날', 'trading days'], ['꺾은선', 'line chart'], ['가짜 돈', 'paper money'],
  ['늘었어요', 'up'], ['줄었어요', 'down'], ['올랐어요', 'up'], ['내렸어요', 'down'], ['그대로', 'unchanged'], ['모두', 'all'], ['지금', 'now'], ['오늘', 'today'], ['꾀', 'stratagem'], ['회사', 'companies'], ['업종', 'sector'], ['기록', 'records'],
  ['부터', ' from'], ['까지', ' to'], ['번', '×'], ['곳', ' cos'], ['가지', ''], ['일째', 'th day'], ['일', ' days']].sort((a, b) => b[0].length - a[0].length);

export function enText(raw) {
  if (raw == null) return raw;
  const s = String(raw), t = s.replace(/\s+/g, ' ').trim();
  if (!t || !HAN.test(t)) return s;
  if (EX[t] != null) return EX[t];
  if (NAMES_KO[t] != null) return NAMES_KO[t];
  if (SECTORS[t] != null) return SECTORS[t];
  const n = normNum(t);
  if (!HAN.test(n)) return n;
  if (EX[n] != null) return EX[n];
  for (const [re, fn] of RULES) { const m = re.exec(n); if (m) return fn(...m); }
  { const st = /^(\d+)단 (.+)$/.exec(t); if (st) return 'Step ' + st[1] + ' · ' + enText(st[2]); } // 7단 길 「3단 꾀」
  if (/\s·\s/.test(t)) { const parts = t.split(/\s·\s/); if (parts.length > 1) return parts.map(x => enText(x)).join(' · '); } // 「기록 · 7단 사고판 기록」 — 조각마다
  let out = n;
  for (const [ko, en] of Object.entries(NAMES_KO)) if (out.includes(ko)) out = out.split(ko).join(en);
  for (const [ko, en] of Object.entries(SECTORS)) if (ko.length > 1 && out.includes(ko)) out = out.split(ko).join(en);
  if (!HAN.test(out)) return out;
  for (const [ko, en] of PH) if (out.includes(ko)) out = out.split(ko).join(en);
  return out.replace(/\s+/g, ' ').replace(/\s([,.·])/g, '$1').trim();
}
const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
function enNode(n) {
  if (n.nodeType === 3) { if (HAN.test(n.nodeValue) && !n.parentElement?.closest('script,style,[data-en-keep]')) { const v = enText(n.nodeValue), w = (/^\s/.test(n.nodeValue) ? ' ' : '') + v + (/\s$/.test(n.nodeValue) ? ' ' : ''); if (w !== n.nodeValue) n.nodeValue = w; } return; }
  if (n.nodeType !== 1 || n.matches('script,style,[data-en-keep]')) return;
  for (const a of ATTRS) { const v = n.getAttribute(a); if (v && HAN.test(v)) { const e = enText(v); if (e !== v) n.setAttribute(a, e); } } // 바뀔 때만(같은 값을 다시 넣으면 지켜보기가 끝없이 돎)
  for (const c of n.childNodes) enNode(c);
}
const enTitle = () => { if (HAN.test(document.title)) document.title = document.title.split(/\s*·\s*/).map(x => enText(x)).join(' · '); }; // 쪽 이름 · 손자병법 — 조각마다
/** 화면 한 덩이를 영어로 · 뒤에 붙거나 바뀌는 글도 지켜봄(한 번만) */
export function watchEn(root) {
  if (!root || root.dataset.en === '1') return; root.dataset.en = '1';
  document.documentElement.lang = 'en';
  enNode(root); enTitle();
  new MutationObserver(ms => { for (const m of ms) {
    if (m.type === 'childList') for (const a of m.addedNodes) enNode(a);
    else if (m.type === 'characterData') enNode(m.target);
    else if (m.type === 'attributes' && m.target.nodeType === 1) { const v = m.target.getAttribute(m.attributeName); if (v && HAN.test(v)) { const e = enText(v); if (e !== v) m.target.setAttribute(m.attributeName, e); } }
  } enTitle(); }).observe(root, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
}
