#!/usr/bin/env node
// 돈 흐름 칸 · 까닭 열한 가지 — 올릴 때 한 번(사장님 2026-10-30(서울) 04:27 「왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼 … 잡스라면 … 돈 · 상황 · 정치 여러 가지 각도」 · 05:03 「응」)
//   결정표 docs/design/why11-2026-10-30/decision.md · 말씀 원문 order-0427.txt · 따로 다시 세기 scripts/atlas11/verify/flow_why_verify.py
//   v2: 08:28 「어 그렇게 해」(물음 「남은 두 불빛도 켜 볼까요? 환율과 금리, 다른 나라예요.」의 답 · order-0828.txt) — 8 환율과 금리 · 9 다른 나라(미국) 켬(결정표 2-2 · 2-3)
//   읽음: <site>/atlas/data/days.json · mkt.json · co/*.json(테마 셈과 같은 읽기) · <site>/next/data/theme-home.json(막대 x — 몰린 곳 셋)
//         <root>/public/data/atlas11/view/board.json(업종 대표) · stocks/<번호>.json(순매매 · 기사 · 종가) · agenda.json(공시)
//         <site>/next/data/fx-rate.json(8 — 올릴 때 fx_rate.mjs 가 받음 · 없으면 8 「?」) · <root>/public/data/atlas11/us/input.json · us/market/INX.json(9)
//   씀:   <site>/next/data/flow-why.json — 화면(site/next/home-new.js)은 이 파일만 읽음 · 못 만들면 던짐(build_data.mjs 가 받아 적고 파일을 지움 — 화면은 「왜?」 줄 없이 그대로)
//   앞날 말 · 사고팔기 말 없음 — 지난 종가 · 순매매 · 공시 제목 · 기사 제목만 · 모르면 「?」
//   쓰는 법: node scripts/atlas11/next/build/flow_why.mjs [--site site] [--view <폴더>]   ·   import {build} from './flow_why.mjs'
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {indexOf, exOf, RULE} from '../../../../site/next/theme-engine.js';
import {josa} from '../../../../site/next/brand.js';
import {romanize} from '../../../../site/next/i18n.js'; // 영어 이름이 없는 회사 = 로마자(영어 판 화면 엔진과 같은 셈 — 영어 글에 한글이 남지 않게)
import {FX_SCHEMA} from './fx_rate.mjs'; // 8 자료 꼴(올릴 때 받는 파일)

export const WHY_SCHEMA = 'dori-flow-why-1';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const FLOW_N = 3; // home-new.js FLOW_N 과 같음(몰린 곳 셋)
export const MIN_EOK = 1; // 1억 원 아래 순매매는 「거의 사고팔지 않았어요」
export const DAYS = 5; // 순매매 날 수(마지막 다섯 날)
/** 무리 넷 · 열한 가지(결정표 2) — q = 펼친 칸 무리 머리 물음(그림 시안 04:4x 그대로) · 영어 이름은 불빛 줄 한 줄에 들게 짧게 */
export const GROUPS = Object.freeze([
  {g: 'money', ko: '돈', en: 'Money', q: {ko: '누가 샀나', en: 'Who bought'}, ks: [1, 2, 3]},
  {g: 'co', ko: '회사', en: 'Firms', q: {ko: '무엇이 달라졌나', en: 'What changed'}, ks: [4, 5, 6]},
  {g: 'sit', ko: '상황', en: 'Market', q: {ko: '세상 날씨', en: 'Market weather and the world'}, ks: [7, 8, 9]},
  {g: 'pol', ko: '정치', en: 'Politics', q: {ko: '나라 일', en: 'Government and the world'}, ks: [10, 11]},
]);
export const NAMES = Object.freeze({
  1: {ko: '외국인', en: 'Foreign investors'}, 2: {ko: '기관', en: 'Institutions'}, 3: {ko: '개인', en: 'Individuals'},
  4: {ko: '좋은 소식', en: 'Good news'}, 5: {ko: '대장 회사', en: 'Lead company'}, 6: {ko: '같이 오른 수', en: 'How many rose'},
  7: {ko: '시장 날씨', en: 'Market weather'}, 8: {ko: '환율과 금리', en: 'Currency and rates'}, 9: {ko: '다른 나라', en: 'Other countries'},
  10: {ko: '정부 정책', en: 'Government policy'}, 11: {ko: '나라 사이 일', en: 'Between countries'},
});
/** 좋은 소식 공시 종류(결정표 2 · 4) — 제목에 그대로 든 말 · 뺄 말 */
export const GOOD = Object.freeze([
  {re: /공급계약\s*체결/, ko: '공급계약', en: 'supply contract'},
  {re: /배당\s*결정/, ko: '배당', en: 'dividend'},
  {re: /자기주식\s*취득/, ko: '자사주 사기', en: 'share buyback'},
  {re: /주식\s*소각\s*결정/, ko: '주식 소각', en: 'share cancellation'},
  {re: /무상증자\s*결정/, ko: '무상증자', en: 'bonus issue'},
  {re: /기업가치\s*제고\s*계획/, ko: '가치 높이기 계획', en: 'value-up plan'},
]);
export const DROP = /해지|정정|철회|취소/;
/** 정한 말(결정표 2 · 10 · 11) — 기사 제목에 이 글이 그대로 들면 맞음 · 「이란」 「중동」은 앞뒤가 한글이 아닐 때만(「~이란 무엇」 · 동네 이름 중동)
 *  뺀 말: 「정책」(회사 배당 정책) · 「세제」(빨래 세제) · 「전쟁」(가격 전쟁 같은 비유) · 「종전」(「종전 최고가」 = 앞의) */
export const POLICY = Object.freeze(['정부', '국회', '법안', '예산', '규제', '보조금', '세법', '장관', '총리', '국토부', '산업부', '기재부', '금융위', '공정위', '대통령실', '특별법', '시행령']);
export const ABROAD = Object.freeze(['관세', '공습', '미사일', '휴전', '제재', '무역', '협정', '트럼프', '시진핑', '푸틴', '중동', '이란', '이스라엘', '우크라이나', '러시아', '북한', '미중']);
const ALONE = new Set(['이란', '중동']);
/** 정한 말 하나가 제목에 드는가 */
export const hasWord = (t, w) => (ALONE.has(w) ? new RegExp(`(?<![가-힣])${w}(?![가-힣])`).test(t) : t.includes(w));
/** 한 줄 결론 차례(결정표 3) — 돈(1 · 2 · 3 을 한 마디로) → 4 → 5 → 6 → 10 → 11 · 7(시장 날씨)은 몰린 곳이면 늘 켜져 줄마다 같은 말이라 다른 까닭이 없을 때만
 *  (큰 검사 1/11 진짜 자료 10월 29일: 세 줄이 모두 「시장보다 덜 내렸고, 외국인이 샀어요.」 — 머리 「시장이 8% 내릴 때 여기는 버텼어요」와 같은 말을 세 번) */
export const ORDER = Object.freeze([1, 2, 3, 4, 5, 6, 9, 8, 10, 11]); // v2 — 9 · 8 을 6 과 10 사이(다른 나라가 환율보다 앞 = 더 쉬운 말)
export const WHY_FALLBACK = 7;

/** 8 환율과 금리(결정표 2-2) — 지난 1년 = 창 첫날까지 240 거래일 · 날 수 120 아래면 모름 · |t| 2 이상 = 뚜렷함 · 이번 달 달러 값 1% · 금리 0.1%p 이상 = 움직임 · 자료 날이 7날 넘게 앞이면 모름 */
export const FX = Object.freeze({L: 240, minN: 120, t: 2, fxMove: 1, rateMove: 0.1, stale: 7});
export {FX_SCHEMA};
/** 9 다른 나라(결정표 2-3) — 한국 업종 → 미국 업종(us/input.json industry) · 보이는 이름 · 영어 — 이름 뜻이 같은 것만(없으면 「?」) */
const US = (us, ko, en) => Object.freeze({us: Object.freeze(us), ko, en});
export const US_MAP = Object.freeze({
  '반도체': US(['반도체'], '반도체', 'semiconductors'),
  '반도체 장비': US(['반도체 장비 및 테스트'], '반도체 장비', 'chip equipment'),
  '반도체 검사·측정': US(['반도체 장비 및 테스트'], '반도체 장비', 'chip equipment'),
  '전자부품': US(['전자 장비 및 부품'], '전자 부품', 'electronic parts'),
  '전자장비': US(['전자 장비 및 부품'], '전자 부품', 'electronic parts'),
  '휴대폰 부품': US(['전자 장비 및 부품'], '전자 부품', 'electronic parts'),
  '통신장비': US(['통신 및 네트워킹'], '통신 장비', 'network gear'),
  '통신': US(['통합 통신 서비스', '무선 통신 서비스'], '통신', 'telecom'),
  '소프트웨어': US(['소프트웨어'], '소프트웨어', 'software'),
  'IT서비스': US(['IT 서비스 및 컨설팅'], 'IT 서비스', 'IT services'),
  'IT 시스템 통합': US(['IT 서비스 및 컨설팅'], 'IT 서비스', 'IT services'),
  '인터넷 플랫폼': US(['온라인 서비스'], '인터넷', 'online services'),
  '제약': US(['제약'], '제약', 'pharma'),
  '바이오 의약품': US(['생명 공학 및 의학 연구'], '생명공학', 'biotech'),
  '신약 개발': US(['생명 공학 및 의학 연구'], '생명공학', 'biotech'),
  '의료기기': US(['첨단 의료 장비 및 기술', '의료 장비, 물품 및 유통'], '의료기기', 'medical devices'),
  '의료용품': US(['의료 장비, 물품 및 유통'], '의료용품', 'medical supplies'),
  '병원·헬스 서비스': US(['의료 시설 및 서비스'], '의료 서비스', 'health services'),
  '은행·카드': US(['은행', '소비자 대출'], '은행 · 카드', 'banks and cards'),
  '증권': US(['투자 은행 및 중개 서비스'], '증권', 'brokers'),
  '보험': US(['손해보험', '생명 및 건강 보험', '복합보험 및 중개인'], '보험', 'insurers'),
  '자동차': US(['자동차 및 트럭 제조'], '자동차', 'automakers'),
  '방산': US(['항공우주 및 방위'], '항공 · 방위', 'aerospace and defense'),
  '항공·우주': US(['항공우주 및 방위'], '항공 · 방위', 'aerospace and defense'),
  '항공': US(['항공사'], '항공사', 'airlines'),
  '물류·운송': US(['지상 화물 및 물류'], '물류', 'logistics'),
  '로봇·건설기계': US(['중장비 및 차량'], '중장비', 'heavy machinery'),
  '일반 기계': US(['산업용 기계 및 장비'], '기계', 'machinery'),
  '기계 부품': US(['산업용 기계 및 장비'], '기계', 'machinery'),
  '전기 부품': US(['전기 부품 및 장비'], '전기 장비', 'electrical equipment'),
  '전선·전기장비': US(['전기 부품 및 장비'], '전기 장비', 'electrical equipment'),
  '전력기기': US(['전기 부품 및 장비'], '전기 장비', 'electrical equipment'),
  '에너지 장비': US(['재생 가능 에너지 장비 및 서비스'], '재생 에너지 장비', 'renewable energy gear'),
  '전력·가스': US(['전력 유틸리티', '천연가스 유틸리티', '복합 유틸리티'], '전기 · 가스', 'power and gas utilities'),
  '정유·가스': US(['오일, 가스 정제 및 마케팅'], '정유', 'oil refiners'),
  '화학': US(['상품 화학'], '화학', 'chemicals'),
  '석유화학': US(['상품 화학'], '화학', 'chemicals'),
  '철강': US(['철 및 강철'], '철강', 'steel'),
  '시멘트': US(['건설 자재'], '건설 자재', 'building materials'),
  '건축자재': US(['건설 자재 및 비품'], '건축 자재', 'building products'),
  '건설': US(['건설 및 엔지니어링', '주택 건설'], '건설', 'construction'),
  '건설 엔지니어링': US(['건설 및 엔지니어링'], '건설 엔지니어링', 'engineering and construction'),
  '부동산': US(['부동산 서비스'], '부동산', 'real estate services'),
  '유통': US(['백화점', '할인점', '식품 소매 및 유통'], '유통', 'retail'),
  '호텔·레저': US(['호텔, 모텔 및 크루즈 라인', '여가 및 오락시설', '카지노 및 도박'], '호텔 · 레저', 'hotels and leisure'),
  '화장품': US(['개인 생활 필수 용품'], '화장품 · 생활용품', 'personal care'),
  '음료': US(['무알콜 음료'], '술 없는 음료', 'soft drinks'),
  '방송': US(['방송'], '방송', 'broadcasting'),
  '콘텐츠 제작': US(['엔터테인먼트 제작'], '엔터테인먼트', 'entertainment'),
  '연예 기획사': US(['엔터테인먼트 제작'], '엔터테인먼트', 'entertainment'),
  '복합기업': US(['소비재 대기업'], '복합기업', 'conglomerates'),
});
export const US_STALE = 5; // 미국 날이 창 첫날 · 끝날보다 5날(달력) 넘게 앞이면 「?」
export const US_MIN = 3;   // b · e 종가가 다 있는 회사 3곳 아래면 「?」

/** 토씨 — 한글 끝은 brand.js josa · 로마자 · 숫자 끝은 읽는 소리로(L 엘 · M 엠 · N 엔 · R 알 · 0 영 · 1 일 · 3 삼 · 6 육 · 7 칠 · 8 팔 = 받침) */
const PAIRS = {이: ['이', '가'], 은: ['은', '는'], 을: ['을', '를'], 과: ['과', '와']};
export function jo(w, p) {
  w = String(w); const last = w.trim().slice(-1);
  if (/[A-Za-z0-9]/.test(last) && PAIRS[p]) return w + (/[LMNRlmnr013678]/.test(last) ? PAIRS[p][0] : PAIRS[p][1]);
  return josa(w, p);
}
const fin = v => typeof v === 'number' && Number.isFinite(v);
const ok = v => typeof v === 'number' && v > 0;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const kday = s => String(s ?? '').slice(0, 10); // 「2026-10-29T07:02:00+09:00」 → 「2026-10-29」(서울 날)
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const mdKo = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
export const mdEn = d => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`;
/** 퍼센트 한 자리(부호 없이 — 오르내림은 글로 말함) */
export const pct1 = v => (Math.round(Math.abs(v) * 1000) / 10).toFixed(1);
const grp = n => String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** 억 원 → 영어 십억 원(한 자리) */
const bil = eok => (Math.abs(eok) / 10).toFixed(1);
export const daysKo = n => (['', '하루', '이틀', '사흘', '나흘', '닷새'][n] ?? `${n}일`);
const cut = (s, n = 40) => { const a = [...String(s ?? '').trim()]; return a.length > n ? a.slice(0, n - 1).join('') + '…' : a.join(''); };

/** 몰린 곳 셋 — home-new.js flowRows 와 같은 잣대(x > 0 · 큰 차례 · 같으면 파일 차례) */
export function pickUp(inds) {
  const s = (inds ?? []).map((i, k) => ({i, k})).filter(({i}) => fin(i?.x) && typeof i?.n === 'string').sort((a, b) => b.i.x - a.i.x || a.k - b.k).map(({i}) => i);
  return s.filter(i => i.x > 0).slice(0, FLOW_N);
}

/** 1 · 2 · 3 돈 — 대표들의 창 안 마지막 다섯 날 순매매(주) × 그날 종가 → 억 원 · {eok, days, from, to, top:{name, en, eok}} · 자료 없음 = null */
export function moneyOf(reps, key, {from, to}) {
  let sum = 0; const dates = new Set(), per = [];
  for (const r of reps) {
    const fl = (r.flows ?? []).filter(f => ISO.test(f?.date ?? '') && f.date > from && f.date <= to && fin(f[key])).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-DAYS);
    if (!fl.length) continue;
    let won = 0;
    for (const f of fl) { const px = r.closeOn(f.date); if (!ok(px)) continue; won += f[key] * px; dates.add(f.date); }
    sum += won; per.push({name: r.name, en: r.en, won});
  }
  if (!dates.size) return null;
  const ds = [...dates].sort(), eok = Math.round(sum / 1e8);
  const top = eok > 0 ? per.reduce((a, b) => (b.won > a.won ? b : a)) : per.reduce((a, b) => (b.won < a.won ? b : a));
  return {eok, days: ds.length, from: ds[0], to: ds[ds.length - 1], top: {name: top.name, en: top.en, eok: Math.round(top.won / 1e8)}};
}

/** 4 좋은 소식 — 대표 공시 가운데 창 안 · 정한 종류 · 뺄 말 없음 · 같은 회사 같은 종류 한 건 → [{name, en, kind, date}](새것 먼저) · agenda 없음 = null */
export function goodOf(reps, {from, to}) {
  if (!reps.some(r => Array.isArray(r.disclosures))) return null;
  const best = new Map(); // 같은 회사 같은 종류 = 가장 새 공시 한 건
  for (const r of reps) for (const d of r.disclosures ?? []) {
    const day = kday(d?.publishedAt), t = String(d?.title ?? '');
    if (!ISO.test(day) || day <= from || day > to || DROP.test(t)) continue;
    const g = GOOD.find(x => x.re.test(t)); if (!g) continue;
    const id = r.code + '|' + g.ko, o = best.get(id);
    if (!o || day > o.date) best.set(id, {name: r.name, en: r.en, kind: g.ko, kindEn: g.en, date: day});
  }
  return [...best.values()].sort((a, b) => (a.date === b.date ? (a.name < b.name ? -1 : a.name > b.name ? 1 : (a.kind < b.kind ? -1 : 1)) : a.date < b.date ? 1 : -1));
}

/** 5 · 6 — 업종 회사 한 달 변화(창 안 하루 ±35% 넘는 날이 있으면 뺌 — 테마 coZoneOf 와 같은 잣대) → [{c, chg}] */
export function memberChanges(cs, closes, T) {
  const k = RULE.win, out = [];
  for (const c of cs) {
    const a = closes.get(c); if (!a || T - k < 0 || !ok(a[T]) || !ok(a[T - k])) continue;
    let jump = false; for (let s = T - k + 1; s <= T; s++) if (ok(a[s - 1]) && ok(a[s]) && Math.abs(a[s] / a[s - 1] - 1) >= RULE.jump) { jump = true; break; }
    if (jump) continue;
    out.push({c, chg: a[T] / a[T - k] - 1});
  }
  return out;
}

/** 10 · 11 기사 — 대표 기사 가운데 창 안 · 제목에 정한 말 · 가장 새것 하나 → {hit} | {hit: null} · 기사 자료 없음 = null */
export function newsOf(reps, words, {from, to}) {
  if (!reps.some(r => Array.isArray(r.news))) return null;
  let hit = null;
  for (const r of reps) for (const n of r.news ?? []) {
    const day = kday(n?.publishedAt), t = String(n?.title ?? '');
    if (!ISO.test(day) || day <= from || day > to) continue;
    const w = words.find(x => hasWord(t, x)); if (!w) continue;
    const at = String(n.publishedAt);
    if (!hit || at > hit.at) hit = {name: r.name, en: r.en, title: t, office: String(n?.office ?? ''), day, at, word: w};
  }
  return {hit};
}

/** JS Math.round 로 d 자리(결정표 2-1 · 2-2 — 가운데는 위로) */
export const rnd = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
/** 두 날짜(YYYY-MM-DD) 사이 달력 날 수(b − a) */
export const dayGap = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
/** 날짜 차례 줄 [[날짜, 값]] 에서 날짜 ≤ d 인 마지막 줄 */
export function lastLE(ser, d) { let r = null; for (const x of ser) { if (x[0] <= d) r = x; else break; } return r; }
/** fx-rate.json 한 줄 묶음이 바른 꼴인가 — [ISO 날짜, 유한한 수] · 날짜가 늘 커짐 */
export function seriesOk(s, pos = false) { // pos = 값이 0 보다 커야(달러 값)
  if (!Array.isArray(s) || !s.length) return false;
  for (let j = 0; j < s.length; j++) { const r = s[j]; if (!Array.isArray(r) || r.length !== 2 || !ISO.test(r[0] ?? '') || !fin(r[1]) || (pos && !(r[1] > 0)) || (j && !(s[j - 1][0] < r[0]))) return false; }
  return true;
}

/** 8 한 쪽(결정표 2-2) — kind 'fx'(달러 값 · % 변화) | 'rate'(금리 · %p 변화) · I 업종 · M 시장 같은 무게 지수(날짜 줄과 같은 칸) · 모름 = null
 *  → {da, db, a, b, move, n, beta, t, clear, moved, aligned} */
export function partOf(ser, kind, dates, I, M, F, T) {
  if (!ser) return null;
  const mp = new Map(ser), xs = [], es = [];
  for (let t = Math.max(1, F - FX.L + 1); t <= F; t++) {
    const d0 = dates[t - 1], d1 = dates[t];
    if (!mp.has(d0) || !mp.has(d1)) continue;
    xs.push(kind === 'fx' ? (mp.get(d1) / mp.get(d0) - 1) * 100 : mp.get(d1) - mp.get(d0));
    es.push(((I[t] / I[t - 1]) / (M[t] / M[t - 1]) - 1) * 100);
  }
  const n = xs.length; if (n < FX.minN) return null;
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length, mx = mean(xs), me = mean(es);
  let sxx = 0, sxy = 0; for (let j = 0; j < n; j++) { sxx += (xs[j] - mx) ** 2; sxy += (xs[j] - mx) * (es[j] - me); }
  if (!(sxx > 0)) return null;
  const beta = sxy / sxx; let ss = 0; for (let j = 0; j < n; j++) ss += (es[j] - me - beta * (xs[j] - mx)) ** 2;
  const s2 = ss / (n - 2); if (!(s2 > 0)) return null;
  const tv = beta / Math.sqrt(s2 / sxx);
  const A = lastLE(ser, dates[F]), B = lastLE(ser, dates[T]);
  if (!A || !B || dayGap(A[0], dates[F]) > FX.stale || dayGap(B[0], dates[T]) > FX.stale) return null;
  const move = kind === 'fx' ? rnd((B[1] / A[1] - 1) * 100, 2) : rnd(B[1] - A[1], 3), t2 = rnd(tv, 2);
  const clear = Math.abs(t2) >= FX.t, moved = Math.abs(move) >= (kind === 'fx' ? FX.fxMove : FX.rateMove);
  return {da: A[0], db: B[0], a: A[1], b: B[1], move, n, beta: rnd(beta, 4), t: t2, clear, moved, aligned: clear && moved && Math.sign(rnd(beta, 4)) === Math.sign(move)}; // 가름은 반올림한 값으로(결정표 2-2 4)
}
/** 8 불빛 — 하나라도 맞음 = 켜짐 · 둘 다 알고 둘 다 아님 = 꺼짐 · 그 밖 = 모름 */
export const light8 = (fx, rate) => (fx?.aligned || rate?.aligned ? 'on' : fx && rate ? 'off' : 'q');

/** 9 미국 같은 업종(결정표 2-3) — usData = {byInd: Map(미국 업종 → [Map(날짜 → 종가)]), inx: [[날짜, 종가]]} | null
 *  → null(짝 없음) | {ind, b, e, n, i, m, x, raw: {i, m}, why: null | 'none' | 'old' | 'few', ko, en}(ko · en = 보이는 이름) */
export function usOf(kind, usData, dF, dT) {
  const mp = US_MAP[kind]; if (!mp) return null;
  const o = {ind: [...mp.us], b: null, e: null, n: null, i: null, m: null, x: null, raw: null, why: null, ko: mp.ko, en: mp.en};
  const inx = usData?.inx ?? [], B = lastLE(inx, dF), E = lastLE(inx, dT), cos = mp.us.flatMap(u => usData?.byInd?.get(u) ?? []);
  o.b = B?.[0] ?? null; o.e = E?.[0] ?? null;
  o.n = B && E ? cos.filter(c => ok(c.get(B[0])) && ok(c.get(E[0]))).length : 0; // n = b · e 종가가 다 있는 회사 수(날을 못 찾으면 0 · 오래돼도 센 수 — 결정표 2-3)
  if (!B || !E) return {...o, why: 'none'};
  if (dayGap(B[0], dF) > US_STALE || dayGap(E[0], dT) > US_STALE) return {...o, why: 'old'};
  if (o.n < US_MIN) return {...o, why: 'few'};
  const S = inx.filter(([d]) => d >= B[0] && d <= E[0]).map(([d]) => d);
  let I = 1;
  for (let j = 1; j < S.length; j++) {
    let s = 0, k = 0;
    for (const c of cos) { const p = c.get(S[j - 1]), q = c.get(S[j]); if (ok(p) && ok(q)) { const r = q / p - 1; if (Math.abs(r) < RULE.jump) { s += r; k++; } } }
    I *= 1 + (k ? s / k : 0);
  }
  const i = I - 1, m = E[1] / B[1] - 1, x = (1 + i) / (1 + m) - 1;
  return {...o, i: rnd(i * 100, 2), m: rnd(m * 100, 2), x: rnd(x * 100, 2), raw: {i, m}};
}
export const light9 = us => (!us || us.x == null ? 'q' : us.x > 0 ? 'on' : 'off');

const L = (s, ko, en, subKo = null, subEn = null) => ({s, ko: {t: ko, sub: subKo}, en: {t: en, sub: subEn}});
const won = v => grp(Math.round(v)), r2 = v => v.toFixed(2);
/** 8 글(결정표 2-2) — 큰 글 = 이번 달 움직임 · 작은 글 = 지난 1년 기록 */
export function text8(fx, rate) {
  const s = light8(fx, rate), K = [fx && {k: 'fx', ...fx}, rate && {k: 'rate', ...rate}].filter(Boolean);
  if (!K.length) return L('q', '환율과 금리 기록이 없어요.', 'No currency or rate record.');
  const up = p => p.move > 0, MV = K.filter(p => p.moved);
  const nums = ps => ({ko: ps.map(p => (p.k === 'fx' ? `1달러 ${won(p.a)}원 → ${won(p.b)}원` : `3년 국채 금리 ${r2(p.a)}% → ${r2(p.b)}%`)).join(' · '),
    en: ps.map(p => (p.k === 'fx' ? `₩${won(p.a)} → ₩${won(p.b)} per dollar` : `3-year bond yield ${r2(p.a)}% → ${r2(p.b)}%`)).join('; ')});
  let t, te, sub, se;
  if (MV.length === 1 && MV[0].k === 'fx') { const p = MV[0]; t = `달러 값이 ${won(p.a)}원에서 ${won(p.b)}원으로 ${up(p) ? '올랐어요' : '내렸어요'}.`; te = `The dollar went from ₩${won(p.a)} to ₩${won(p.b)}.`; }
  else if (MV.length === 1) { const p = MV[0]; t = `금리가 ${r2(p.a)}%에서 ${r2(p.b)}%로 ${up(p) ? '올랐어요' : '내렸어요'}.`; te = `Rates went from ${r2(p.a)}% to ${r2(p.b)}%.`; }
  else if (MV.length === 2) { t = `달러 값이 ${up(MV[0]) ? '오르고' : '내리고'} 금리가 ${up(MV[1]) ? '올랐어요' : '내렸어요'}.`; te = `The dollar ${up(MV[0]) ? 'rose' : 'fell'} and rates ${up(MV[1]) ? 'rose' : 'fell'}.`; }
  else { t = K.length === 2 ? '달러 값과 금리가 거의 그대로였어요.' : K[0].k === 'fx' ? '달러 값이 거의 그대로였어요.' : '금리가 거의 그대로였어요.'; te = K.length === 2 ? 'The dollar and rates barely moved.' : K[0].k === 'fx' ? 'The dollar barely moved.' : 'Rates barely moved.'; }
  if (MV.length) {
    const C = MV.filter(p => p.clear), U = MV.filter(p => !p.clear), ko = [], en = [];
    if (C.length) {
      ko.push(`지난 1년, ${C.map(p => `${p.k === 'fx' ? '달러 값이' : '금리가'} ${p.beta > 0 ? '오를수록' : '내릴수록'}`).join(' · ')} 이 업종이 시장보다 잘했어요.`);
      en.push(`Over the past year, this industry beat the market more ${C.map(p => `when ${p.k === 'fx' ? 'the dollar' : 'rates'} ${p.beta > 0 ? 'rose' : 'fell'}`).join(' and ')}.`);
    }
    if (U.length) {
      const w = U.length === 2 ? '달러 값 · 금리와' : U[0].k === 'fx' ? '달러 값과' : '금리와', we = U.length === 2 ? 'the dollar and rates' : U[0].k === 'fx' ? 'the dollar' : 'rates';
      ko.push(C.length ? `${w.replace(/(과|와)$/, '$1는')} 따로 움직였어요.` : `지난 1년, 이 업종은 ${w} 따로 움직였어요.`);
      en.push(C.length ? `It moved apart from ${we}.` : `Over the past year, this industry moved apart from ${we}.`);
    }
    if (MV.length === 2) { const n2 = nums(MV); ko.push(`(${n2.ko})`); en.push(`(${n2.en})`); }
    sub = ko.join(' '); se = en.join(' ');
  } else { const n2 = nums(K); sub = n2.ko; se = n2.en; }
  if (K.length === 1) { sub += K[0].k === 'fx' ? ' 금리 기록은 없어요.' : ' 달러 값 기록은 없어요.'; se += K[0].k === 'fx' ? ' No rate record.' : ' No dollar record.'; }
  return L(s, t, te, sub, se);
}
/** 9 글(결정표 2-3) */
export function text9(us) {
  if (!us) return L('q', '미국에는 같은 업종 기록이 없어요.', 'No US record for this industry.');
  if (us.x == null) {
    if (us.why === 'few') return L('q', '미국 같은 업종 회사가 너무 적어요.', 'Too few US companies to compare.');
    if (us.why === 'old') return L('q', '미국 기록이 오래돼 못 쟀어요.', 'The US record is too old to compare.');
    return L('q', '미국 기록이 없어요.', 'No US record.');
  }
  const {i, m} = us.raw, s = light9(us);
  const sub = `미국 ${us.ko} ${us.n}곳이 ${pct1(i)}% ${i >= 0 ? '오를' : '내릴'} 때 S&P 500은 ${pct1(m)}% ${m >= 0 ? '올랐어요' : '내렸어요'}. (${mdKo(us.b)} ~ ${mdKo(us.e)})`;
  const se = `US ${us.en} (${us.n} firms) ${i >= 0 ? 'rose' : 'fell'} ${pct1(i)}% while the S&P 500 ${m >= 0 ? 'rose' : 'fell'} ${pct1(m)}% (${mdEn(us.b)}–${mdEn(us.e)}).`;
  return s === 'on' ? L('on', '미국에서도 같은 업종이 시장보다 잘했어요.', 'In the US too, this industry beat the market.', sub, se)
    : L('off', '미국에서는 같은 업종이 시장보다 못했어요.', 'In the US, this industry trailed the market.', sub, se);
}

/** 열한 가지 글(결정표 2) — 셈 결과 → [{k, s, ko:{t, sub}, en:{t, sub}}] */
export function itemsOf({money, good, lead, breadth, mi, pol, abr, fx = null, rate = null, us = null}) {
  const who = {1: ['외국인', 'Foreign investors'], 2: ['기관', 'Institutions'], 3: ['개인', 'Individuals']};
  const it = {};
  for (const k of [1, 2, 3]) {
    const v = money[k], [wk, we] = who[k];
    if (!v) { it[k] = L('q', `${wk} 사고판 기록이 없어요.`, `No trading record for ${we.toLowerCase()}.`); continue; }
    const d = daysKo(v.days), de = `${v.days} day${v.days > 1 ? 's' : ''}`;
    if (v.eok >= MIN_EOK) it[k] = L('on', `${jo(wk, '이')} ${d} 동안 ${grp(v.eok)}억 원 더 샀어요.`, `${we} bought a net ₩${bil(v.eok)} billion over ${de}.`, `가장 많이 산 곳은 ${v.top.name}, ${grp(v.top.eok)}억 원이에요.`, `Bought most: ${v.top.en}, ₩${bil(v.top.eok)} billion.`);
    else if (v.eok <= -MIN_EOK) it[k] = L('off', `${jo(wk, '은')} ${d} 동안 ${grp(v.eok)}억 원 더 팔았어요.`, `${we} sold a net ₩${bil(v.eok)} billion over ${de}.`, `가장 많이 판 곳은 ${v.top.name}, ${grp(v.top.eok)}억 원이에요.`, `Sold most: ${v.top.en}, ₩${bil(v.top.eok)} billion.`);
    else it[k] = L('off', `${jo(wk, '은')} ${d} 동안 거의 사고팔지 않았어요.`, `${we} barely traded over ${de}.`);
  }
  if (!good) it[4] = L('q', '공시 기록이 없어요.', 'No filing record.');
  else if (good.length) it[4] = L('on', `좋은 소식 공시가 ${good.length}건 있었어요.`, `There ${good.length > 1 ? 'were' : 'was'} ${good.length} good-news filing${good.length > 1 ? 's' : ''}.`,
    good.slice(0, 2).map(g => `${g.name} ${g.kind}`).join(', ') + (good.length > 2 ? ' 등' : ''), good.slice(0, 2).map(g => `${g.en} ${g.kindEn}`).join(', ') + (good.length > 2 ? ', and more' : ''));
  else it[4] = L('off', '좋은 소식 공시는 없었어요.', 'No good-news filings.');
  if (!lead) it[5] = L('q', '셀 수 있는 회사가 없어요.', 'No company to measure.');
  else if (lead.chg > 0) it[5] = L('on', `${jo(lead.name, '이')} 한 달 동안 ${pct1(lead.chg)}% 올라 끌었어요.`, `${lead.en} led, up ${pct1(lead.chg)}% in a month.`);
  else it[5] = L('off', `끌어 올린 회사는 없어요. ${jo(lead.name, '이')} ${pct1(lead.chg)}%로 가장 덜 내렸어요.`, `No company pulled it up. ${lead.en} fell the least, ${pct1(lead.chg)}%.`);
  if (!breadth || !breadth.tot) it[6] = L('q', '셀 수 있는 회사가 없어요.', 'No company to measure.');
  else it[6] = L(breadth.up * 2 >= breadth.tot ? 'on' : 'off', `${breadth.tot}곳 가운데 ${breadth.up}곳이 올랐어요.`, `${breadth.up} of ${breadth.tot} companies rose.`);
  {
    const {m, i} = mi, M = pct1(m), I = pct1(i);
    const s = i > m ? 'on' : 'off';
    if (m < 0 && i < 0) it[7] = L(s, `시장이 ${M}% 내릴 때 ${I}%만 내렸어요.`, `The market fell ${M}%; this fell only ${I}%.`);
    else if (m < 0) it[7] = L(s, `시장이 ${M}% 내릴 때 ${I}% 올랐어요.`, `The market fell ${M}%; this rose ${I}%.`);
    else if (i >= 0) it[7] = L(s, `시장이 ${M}% 오를 때 ${I}% 올랐어요.`, `The market rose ${M}%; this rose ${I}%.`);
    else it[7] = L(s, `시장이 ${M}% 오를 때 ${I}% 내렸어요.`, `The market rose ${M}%; this fell ${I}%.`);
  }
  it[8] = text8(fx, rate);
  it[9] = text9(us);
  const news = (k, v, ko, en) => {
    if (!v) return L('q', '기사 기록이 없어요.', 'No news record.');
    if (!v.hit) return L('off', `${ko} 기사는 없었어요.`, `No ${en} news.`);
    const h = v.hit;
    return L('on', `${ko} 기사가 있었어요.`, `There was ${en} news.`, `「${cut(h.title)}」 ${h.office ? h.office + ', ' : ''}${mdKo(h.day)}`, `${h.en} news, ${mdEn(h.day)}`);
  };
  it[10] = news(10, pol, '정부 정책', 'government-policy');
  it[11] = news(11, abr, '나라 사이', 'cross-border');
  return Object.keys(NAMES).map(Number).map(k => ({k, ...it[k]}));
}

/** 한 줄 결론(결정표 3) — 켜진 까닭 가운데 줄마다 다른 것 앞 둘 · 마디마다 한 줄(화면은 마디를 한 줄씩 — 줄마다 작은 글 덩이라 첫 화면 가장 큰 그림이 늦게 그린 이 줄로 바뀌지 않음)
 *  돈 셋은 한 마디로 묶음(「외국인과 기관이 샀고」) · 다른 까닭이 하나도 없으면 시장 날씨(7) 한 마디 */
export function whyOf(items, {m, i}, lead, {fx = null, rate = null} = {}) {
  const on = new Set(items.filter(x => x.s === 'on').map(x => x.k));
  const p8 = fx?.aligned ? ['달러 값이', fx.move > 0, 'the dollar'] : rate?.aligned ? ['금리가', rate.move > 0, 'rates'] : null; // 맞은 쪽 — 달러 값 먼저(결정표 3 · v2)
  const P = {
    7: m < 0 ? (i < 0 ? ['시장보다 덜 내렸고', '시장보다 덜 내렸어요', 'fell less than the market'] : ['시장이 내릴 때 올랐고', '시장이 내릴 때 올랐어요', 'rose as the market fell']) : ['시장보다 더 올랐고', '시장보다 더 올랐어요', 'beat the market'],
    4: ['좋은 소식이 있었고', '좋은 소식이 있었어요', 'good news came out'],
    5: lead ? (n => [`${jo(n, '이')} 끌었고`, `${jo(n, '이')} 끌었어요`, `${lead.en} led`])([...String(lead.name)].length > 9 ? '대장 회사' : lead.name) : null, // 긴 이름은 「대장 회사」(마디 한 줄 — 이름은 펼친 칸 5번에)
    6: ['여러 곳이 같이 올랐고', '여러 곳이 같이 올랐어요', 'many rose together'],
    10: ['정부 정책 기사가 있었고', '정부 정책 기사가 있었어요', 'policy news came out'], 11: ['나라 사이 기사가 있었고', '나라 사이 기사가 있었어요', 'world news came out'],
    9: ['미국에서도 잘했고', '미국에서도 잘했어요', 'US peers did well too'],
    8: p8 && [`${p8[0]} ${p8[1] ? '올랐고' : '내렸고'}`, `${p8[0]} ${p8[1] ? '올랐어요' : '내렸어요'}`, `${p8[2]} ${p8[1] ? 'rose' : 'fell'}`],
  };
  const KO = {1: '외국인', 2: '기관', 3: '개인'}, EN = {1: 'foreigners', 2: 'funds', 3: 'retail'};
  const money = [1, 2, 3].filter(k => on.has(k)), pick = [];
  if (money.length === 1) { const w = jo(KO[money[0]], '이'); pick.push([`${w} 샀고`, `${w} 샀어요`, `${EN[money[0]]} bought`]); }
  else if (money.length === 2) { const w = `${jo(KO[money[0]], '과')} ${jo(KO[money[1]], '이')}`; pick.push([`${w} 샀고`, `${w} 샀어요`, `${EN[money[0]]} and ${EN[money[1]]} bought`]); }
  else if (money.length === 3) pick.push(['외국인, 기관, 개인이 모두 샀고', '외국인, 기관, 개인이 모두 샀어요', 'all three groups bought']);
  for (const k of ORDER) if (k > 3 && pick.length < 2 && on.has(k) && P[k]) pick.push(P[k]);
  if (!pick.length && on.has(WHY_FALLBACK)) pick.push(P[WHY_FALLBACK]);
  if (!pick.length) return null;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  return pick.length === 2 ? {ko: [`${pick[0][0]},`, `${pick[1][1]}.`], en: [`${cap(pick[0][2])},`, `and ${pick[1][2]}.`]} : {ko: [`${pick[0][1]}.`], en: [`${cap(pick[0][2])}.`]};
}

/** 머리 글(결정표 4) — 몰린 곳 가운데 한 곳이라도 실제로 내렸으면(i < 0 — 시장은 그보다 더 내림) 「몰렸어요」 대신 「버텼어요」 · 다 올랐으면 그대로(null) */
export function headOf(m, ups) {
  if (!(m < 0) || !(ups ?? []).some(u => u.i < 0)) return null;
  const a = Math.abs(m) * 100, r = a >= 1 ? String(Math.round(a)) : (Math.round(a * 10) / 10).toFixed(1);
  return {ko: [`시장이 ${r}% 내릴 때`, '여기는 버텼어요'], en: [`Market fell ${r}%,`, 'these held up'], keys: {ko: ['덜 내린 곳', '더 내린 곳'], en: ['Fell less', 'Fell more']}}; // 영어도 줄마다 한 줄(390 폭 26px)
}

const J = async f => JSON.parse(await fs.readFile(f, 'utf8'));
/** 올릴 때 한 번 — <site>/next/data/flow-why.json 을 씀 · 요약 글을 돌려줌 */
/** 9 미국 자료 읽기 — {byInd: Map(미국 업종 → [Map(날짜 → 종가)]), inx: [[날짜, 종가]]} · 못 읽으면 null(9 는 「미국 기록이 없어요」) */
export async function usLoad(usDir) {
  try {
    const [inp, ix] = await Promise.all([J(path.join(usDir, 'input.json')), J(path.join(usDir, 'market', 'INX.json'))]);
    const byInd = new Map();
    for (const a of inp?.assets ?? []) {
      if (typeof a?.industry !== 'string') continue;
      const pm = new Map(); for (const p of a.prices ?? []) if (ISO.test(p?.date ?? '') && ok(p?.close) && !pm.has(p.date)) pm.set(p.date, p.close);
      if (!byInd.has(a.industry)) byInd.set(a.industry, []); byInd.get(a.industry).push(pm);
    }
    const im = new Map(); for (const r of ix?.rows ?? []) if (ISO.test(r?.date ?? '') && ok(r?.close) && !im.has(r.date)) im.set(r.date, r.close); // 같은 날은 처음 값(회사 종가와 같게)
    const inx = [...im].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return {byInd, inx};
  } catch { return null; }
}
/** 8 자료 읽기 — <site>/next/data/fx-rate.json · 꼴이 다르면 두 쪽 모두 null */
export async function fxLoad(siteDir) {
  const fr = await J(path.join(siteDir, 'next', 'data', 'fx-rate.json')).catch(() => null);
  return fr?.schema === FX_SCHEMA && seriesOk(fr.fx, true) && seriesOk(fr.rate) ? {fx: fr.fx, rate: fr.rate} : {fx: null, rate: null};
}

export async function build({siteDir = 'site', viewDir = path.join(ROOT, 'public/data/atlas11/view'), usDir = path.join(ROOT, 'public/data/atlas11/us'), made = new Date().toISOString(), write = true, out = null, minCo = 100} = {}) { // out = 쓸 곳(시험) · minCo = 종가 파일 최소 수(작은 시험 자료만 낮춤)
  const dd = path.join(siteDir, 'atlas', 'data');
  const [days, mkt, TH] = await Promise.all([J(path.join(dd, 'days.json')), J(path.join(dd, 'mkt.json')), J(path.join(siteDir, 'next', 'data', 'theme-home.json'))]);
  const dates = days?.dates, companies = mkt?.companies;
  if (!Array.isArray(dates) || dates.length < RULE.win + 1) throw Error('flow-why: days.json 날짜 줄이 모자람');
  if (!companies || typeof companies !== 'object') throw Error('flow-why: mkt.json 회사 칸 없음');
  const N = dates.length, T = N - 1, from = dates[T - RULE.win], to = dates[T];
  if (TH?.asOf !== to) throw Error(`flow-why: theme-home 기준 ${TH?.asOf} 가 종가 마지막 날 ${to} 와 다름`);
  const closes = new Map();
  const files = (await fs.readdir(path.join(dd, 'co'))).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort();
  await Promise.all(files.map(async f => {
    const code = f.slice(0, 6); if (!companies[code]) return;
    let c; try { c = await J(path.join(dd, 'co', f)); } catch { return; }
    const cl = c?.close, k0 = c?.k0; if (!Array.isArray(cl) || !Number.isInteger(k0)) return;
    const a = new Float64Array(N);
    for (let j = 0; j < cl.length; j++) { const t = j + k0, v = cl[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
    closes.set(code, a);
  }));
  if (closes.size < minCo) throw Error('flow-why: 종가 파일이 너무 적음 ' + closes.size);
  const codes = [...closes.keys()].filter(c => companies[c]).sort();
  const M = indexOf(codes.map(c => closes.get(c)), N), m = M[T] / M[T - RULE.win] - 1;
  const mem = new Map(); for (const c of codes) { const i = companies[c].i; if (typeof i !== 'string') continue; if (!mem.has(i)) mem.set(i, []); mem.get(i).push(c); }
  // 대표(보드) · 이름 영어
  const board = await J(path.join(viewDir, 'board.json')).catch(() => null), agenda = await J(path.join(viewDir, 'agenda.json')).catch(() => null);
  const en = await J(path.join(siteDir, 'next', 'i18n', 'en-names.json')).then(x => x?.names ?? {}).catch(() => ({}));
  const enOf = n => en[n] ?? (/[가-힣]/.test(String(n)) ? romanize(n) : n);
  const [FR, USD] = await Promise.all([fxLoad(siteDir), usLoad(usDir)]);
  const up = pickUp(TH.inds), inds = [];
  for (const u of up) {
    const cs = mem.get(u.n) ?? []; if (cs.length < RULE.minN) throw Error(`flow-why: ${u.n} 회사 ${cs.length}곳(테마와 다름)`);
    const I = indexOf(cs.map(c => closes.get(c)), N), i = I[T] / I[T - RULE.win] - 1, x = exOf(I, M, T, RULE.win) * 100;
    if (Math.abs(x - u.x) > 0.011) throw Error(`flow-why: ${u.n} 막대 x ${u.x} 와 다시 센 x ${x.toFixed(3)} 다름`);
    const ch = memberChanges(cs, closes, T).map(r => ({...r, name: companies[r.c].n}));
    const best = ch.reduce((a, b) => (!a || b.chg > a.chg || (b.chg === a.chg && b.c < a.c) ? b : a), null);
    const lead = best ? {name: best.name, en: enOf(best.name), chg: best.chg, c: best.c} : null;
    const breadth = {up: ch.filter(r => r.chg > 0).length, tot: ch.length};
    const repsB = (board?.companies ?? []).filter(c => c?.group?.industry === u.n).sort((a, b) => (a.code < b.code ? -1 : 1));
    const reps = await Promise.all(repsB.map(async c => {
      const s = await J(path.join(viewDir, 'stocks', c.code + '.json')).catch(() => null), cx = s?.context ?? null;
      const cm = new Map((s?.closes60 ?? []).filter(x => ISO.test(x?.date ?? '') && ok(x?.close)).map(x => [x.date, x.close]));
      return {code: c.code, name: c.name, en: enOf(c.name), flows: Array.isArray(cx?.flows) ? cx.flows : null, news: Array.isArray(cx?.news) ? cx.news : null,
        disclosures: Array.isArray(agenda?.byCode?.[c.code]?.disclosures) ? agenda.byCode[c.code].disclosures : null, closeOn: d => cm.get(d) ?? (ok(c.close) ? c.close : null)};
    }));
    const W = {from, to};
    const money = {1: moneyOf(reps, 'foreignNet', W), 2: moneyOf(reps, 'institutionNet', W), 3: moneyOf(reps, 'individualNet', W)};
    const good = goodOf(reps, W), pol = newsOf(reps, POLICY, W), abr = newsOf(reps, ABROAD, W);
    const fx = partOf(FR.fx, 'fx', dates, I, M, T - RULE.win, T), rate = partOf(FR.rate, 'rate', dates, I, M, T - RULE.win, T), us = usOf(u.n, USD, from, to);
    const items = itemsOf({money, good, lead, breadth, mi: {m, i}, pol, abr, fx, rate, us});
    const why = whyOf(items, {m, i}, lead, {fx, rate});
    inds.push({n: u.n, x: u.x, i: Math.round(i * 10000) / 100, reps: reps.length, why, lights: items.map(x => x.s), items,
      calc: {money: Object.fromEntries(Object.entries(money).map(([k, v]) => [k, v && {eok: v.eok, days: v.days, from: v.from, to: v.to, top: v.top.name, topEok: v.top.eok}])), good: good && good.map(g => `${g.name}|${g.kind}|${g.date}`),
        lead: lead && {c: lead.c, chg: Math.round(lead.chg * 10000) / 100}, breadth, pol: pol && (pol.hit ? `${pol.hit.name}|${pol.hit.day}|${pol.hit.word}` : ''), abr: abr && (abr.hit ? `${abr.hit.name}|${abr.hit.day}|${abr.hit.word}` : ''),
        fx, rate, us: us && {ind: us.ind, b: us.b, e: us.e, n: us.n, i: us.i, m: us.m, x: us.x}}});
  }
  const R = Math.max(0, ...inds.map(x => x.reps));
  const body = {schema: WHY_SCHEMA, made, asOf: to, from, boardAsOf: board?.asOf ?? null, market: {m: Math.round(m * 10000) / 100}, head: headOf(m, inds.map(x => ({i: x.i}))),
    groups: GROUPS.map(({g, ko, en: e, q, ks}) => ({g, ko, en: e, q, ks})), names: NAMES, inds,
    note: {ko: `돈 · 소식 · 기사는 업종마다 대표 ${R}곳 기록이에요. 달러 값은 하나은행이 알린 값, 금리는 3년 국채 금리, 미국은 S&P 500과 같은 업종 회사 기록이에요. 지난 기록만 보여 줘요.`,
      en: `Money, filings and news use ${R} representative companies per industry. The dollar is Hana Bank's posted rate, rates are the 3-year government bond yield, and the US uses the S&P 500 and same-industry firms. Past records only.`}};
  if (write) {
    const file = out ?? path.join(siteDir, 'next', 'data', 'flow-why.json'), tmp = file + '.tmp' + process.pid;
    await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(tmp, JSON.stringify(body) + '\n'); await fs.rename(tmp, file);
  }
  return {body, line: `몰린 곳 ${inds.length}곳 · 기준 ${to} · 시장 ${body.market.m}% · 환율 · 금리 ${FR.fx ? '있음' : '없음'} · 미국 ${USD ? (USD.inx.at(-1)?.[0] ?? '빔') : '없음'} · ` + inds.map(x => `${x.n} 켜짐 ${x.lights.filter(s => s === 'on').length} 모름 ${x.lights.filter(s => s === 'q').length}(8 ${x.lights[7]} · 9 ${x.lights[8]})`).join(' · ')};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), at = k => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : null);
  const r = await build({siteDir: at('--site') ?? 'site', ...(at('--view') ? {viewDir: at('--view')} : {})});
  console.log(r.line);
}
