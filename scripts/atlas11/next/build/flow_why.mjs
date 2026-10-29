#!/usr/bin/env node
// 돈 흐름 칸 · 까닭 열한 가지 — 올릴 때 한 번(사장님 2026-10-30(서울) 04:27 「왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼 … 잡스라면 … 돈 · 상황 · 정치 여러 가지 각도」 · 05:03 「응」)
//   결정표 docs/design/why11-2026-10-30/decision.md · 말씀 원문 order-0427.txt · 따로 다시 세기 scripts/atlas11/verify/flow_why_verify.py
//   읽음: <site>/atlas/data/days.json · mkt.json · co/*.json(테마 셈과 같은 읽기) · <site>/next/data/theme-home.json(막대 x — 몰린 곳 셋)
//         <root>/public/data/atlas11/view/board.json(업종 대표) · stocks/<번호>.json(순매매 · 기사 · 종가) · agenda.json(공시)
//   씀:   <site>/next/data/flow-why.json — 화면(site/next/home-new.js)은 이 파일만 읽음 · 못 만들면 던짐(build_data.mjs 가 받아 적고 파일을 지움 — 화면은 「왜?」 줄 없이 그대로)
//   앞날 말 · 사고팔기 말 없음 — 지난 종가 · 순매매 · 공시 제목 · 기사 제목만 · 모르면 「?」
//   쓰는 법: node scripts/atlas11/next/build/flow_why.mjs [--site site] [--view <폴더>]   ·   import {build} from './flow_why.mjs'
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {indexOf, exOf, RULE} from '../../../../site/next/theme-engine.js';
import {josa} from '../../../../site/next/brand.js';
import {romanize} from '../../../../site/next/i18n.js'; // 영어 이름이 없는 회사 = 로마자(영어 판 화면 엔진과 같은 셈 — 영어 글에 한글이 남지 않게)

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
/** 한 줄 결론 차례(결정표 3) */
export const ORDER = Object.freeze([7, 1, 2, 3, 4, 5, 6, 10, 11]);

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

const L = (s, ko, en, subKo = null, subEn = null) => ({s, ko: {t: ko, sub: subKo}, en: {t: en, sub: subEn}});

/** 열한 가지 글(결정표 2) — 셈 결과 → [{k, s, ko:{t, sub}, en:{t, sub}}] */
export function itemsOf({money, good, lead, breadth, mi, pol, abr, reps}) {
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
  it[8] = L('q', '환율과 금리는 아직 안 재요.', "We don't measure currency and rates yet.");
  it[9] = L('q', '다른 나라 같은 업종은 아직 안 재요.', "We don't compare other countries yet.");
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

/** 한 줄 결론(결정표 3) — 켜진 것 가운데 차례로 앞 둘 · 마디마다 한 줄(화면은 마디를 한 줄씩 — 줄마다 작은 글 덩이라 첫 화면 가장 큰 그림이 늦게 그린 이 줄로 바뀌지 않음) */
export function whyOf(items, {m, i}, lead) {
  const on = new Set(items.filter(x => x.s === 'on').map(x => x.k));
  const P = {
    7: m < 0 ? (i < 0 ? ['시장보다 덜 내렸고', '시장보다 덜 내렸어요', 'fell less than the market'] : ['시장이 내릴 때 올랐고', '시장이 내릴 때 올랐어요', 'rose as the market fell']) : ['시장보다 더 올랐고', '시장보다 더 올랐어요', 'beat the market'],
    1: ['외국인이 샀고', '외국인이 샀어요', 'foreigners bought'], 2: ['기관이 샀고', '기관이 샀어요', 'institutions bought'], 3: ['개인이 샀고', '개인이 샀어요', 'individuals bought'],
    4: ['좋은 소식이 있었고', '좋은 소식이 있었어요', 'good news came out'],
    5: lead ? [`${jo(lead.name, '이')} 끌었고`, `${jo(lead.name, '이')} 끌었어요`, `${lead.en} led`] : null,
    6: ['여러 곳이 같이 올랐고', '여러 곳이 같이 올랐어요', 'many rose together'],
    10: ['정부 정책 기사가 있었고', '정부 정책 기사가 있었어요', 'policy news came out'], 11: ['나라 사이 기사가 있었고', '나라 사이 기사가 있었어요', 'world news came out'],
  };
  const pick = ORDER.filter(k => on.has(k) && P[k]).slice(0, 2).map(k => P[k]);
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
export async function build({siteDir = 'site', viewDir = path.join(ROOT, 'public/data/atlas11/view'), made = new Date().toISOString(), write = true, out = null, minCo = 100} = {}) { // out = 쓸 곳(시험) · minCo = 종가 파일 최소 수(작은 시험 자료만 낮춤)
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
    const items = itemsOf({money, good, lead, breadth, mi: {m, i}, pol, abr, reps});
    const why = whyOf(items, {m, i}, lead);
    inds.push({n: u.n, x: u.x, i: Math.round(i * 10000) / 100, reps: reps.length, why, lights: items.map(x => x.s), items,
      calc: {money: Object.fromEntries(Object.entries(money).map(([k, v]) => [k, v && {eok: v.eok, days: v.days, from: v.from, to: v.to, top: v.top.name, topEok: v.top.eok}])), good: good && good.map(g => `${g.name}|${g.kind}|${g.date}`),
        lead: lead && {c: lead.c, chg: Math.round(lead.chg * 10000) / 100}, breadth, pol: pol && (pol.hit ? `${pol.hit.name}|${pol.hit.day}|${pol.hit.word}` : ''), abr: abr && (abr.hit ? `${abr.hit.name}|${abr.hit.day}|${abr.hit.word}` : '')}});
  }
  const R = Math.max(0, ...inds.map(x => x.reps));
  const body = {schema: WHY_SCHEMA, made, asOf: to, from, boardAsOf: board?.asOf ?? null, market: {m: Math.round(m * 10000) / 100}, head: headOf(m, inds.map(x => ({i: x.i}))),
    groups: GROUPS.map(({g, ko, en: e, q, ks}) => ({g, ko, en: e, q, ks})), names: NAMES, inds,
    note: {ko: `돈 · 소식 · 기사는 업종마다 대표 ${R}곳 기록이에요. 지난 기록만 보여 줘요.`, en: `Money, filings and news use ${R} representative companies per industry. Past records only.`}};
  if (write) {
    const file = out ?? path.join(siteDir, 'next', 'data', 'flow-why.json'), tmp = file + '.tmp' + process.pid;
    await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(tmp, JSON.stringify(body) + '\n'); await fs.rename(tmp, file);
  }
  return {body, line: `몰린 곳 ${inds.length}곳 · 기준 ${to} · 시장 ${body.market.m}% · ` + inds.map(x => `${x.n} 켜짐 ${x.lights.filter(s => s === 'on').length} 모름 ${x.lights.filter(s => s === 'q').length}`).join(' · ')};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), at = k => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : null);
  const r = await build({siteDir: at('--site') ?? 'site', ...(at('--view') ? {viewDir: at('--view')} : {})});
  console.log(r.line);
}
