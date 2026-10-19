/**
 * 돌이 · 커피 쿠폰(사장님 2026-10-19(싱가포르) 13:54 「11단계다 하면 한사람에게 포인트 쌓이고 그러면 커피쿠폰 한장 주는 시스템 만들어 … 관리자 페이지도 있어야 해」
 *   · 13:58 「열번 해야 해 한달에 한번 어 내가 보낼거야」 — 지인 의견 「이걸끝까지 적으면 포인트가 쌓인다거나」)
 *   규칙(RULE): 열한 질문을 끝까지 답한 기록 한 번 = 1점 · 하루(서울 날짜)에 1점까지(마구 눌러 모으기를 막음 — Claude 가 더한 규칙 · 사장님께 알림)
 *              10점 = 커피 쿠폰 1장 · 한 사람(카톡 회원)에 한 달(서울 달)에 1장까지 · 쿠폰을 받으면 그때까지의 점수는 씀(다음 쿠폰은 받은 날 다음 날부터 셈)
 *   쿠폰 = 12자 확인 번호(kakao-store codeOf 와 같은 셈 · 회원 표 + 달 · 서버 비밀값 — 저장하지 않아도 같은 번호) · 받는 사람이 번호를 사장님께 카톡으로 보냄 → 사장님이 관리자 화면에서 맞대고 선물을 직접 보냄
 *   서버에 두는 것: cp/<회원 표> = {since(이날까지 점수는 씀 · 서울 날짜), got: [{month, at}]} · cf/<번호 HMAC> = {month, at, used?} — 이름 · 전화 · 카톡 번호 없음
 *   점수는 회원 기록(md/<회원 표> 의 atlas:godori-why)에서 셈 — 화면이 올린 기록이라 날짜를 속일 수 있음 → 한 달 한 장 · 카톡 한 사람 한 표로 막음
 *   이 파일은 넷리파이에 묶이지 않음(시험 = 메모리 저장소 · tests/atlas11/coupon.test.mjs) · 화면 셈(이 기기만)도 같은 pointsOf 를 씀(site/next/coupon.js 사본 · 시험이 맞댐)
 */
import {createHmac} from 'node:crypto';

export const COUPON_SCHEMA = 'dori-coupon-1';
export const RULE = Object.freeze({need: 10, perDay: 1, perMonth: 1, answers: 11});
const KST = 9 * 3600e3;
export const seoulDay = t => { const ms = typeof t === 'number' ? t : Date.parse(t); return Number.isFinite(ms) ? new Date(ms + KST).toISOString().slice(0, 10) : null; };
export const seoulMonth = t => seoulDay(t)?.slice(0, 7) ?? null;

/** 끝까지 답한 기록인가 — 답 열하나가 모두 0 · 1 · 2 */
export const fullRecord = r => !!r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === RULE.answers && r.answers.every(k => Number.isInteger(k) && k >= 0 && k <= 2);

/** 기록 → 점수 난 날(서울 날짜 · 하루 1점 · 차례대로) — since 가 있으면 그 날 다음부터 · 앞날(now 뒤) 기록은 셈 안 함 */
export function pointDays(records, {since = null, now = Date.now()} = {}) {
  const today = seoulDay(now), days = new Set();
  for (const r of Array.isArray(records) ? records : []) {
    if (!fullRecord(r)) continue;
    const d = seoulDay(r.at);
    if (!d || d > today || (since && d <= since)) continue;
    days.add(d);
  }
  return [...days].sort();
}

/** 쿠폰 상태 셈(저장 없음) — {n: 지금 점수, need, month: 이번 달, gotThisMonth, ready: 지금 받을 수 있나, wait: 점수는 찼지만 이번 달은 받음} */
export function couponPlan(records, cp, {now = Date.now()} = {}) {
  const month = seoulMonth(now), got = Array.isArray(cp?.got) ? cp.got : [];
  const n = pointDays(records, {since: typeof cp?.since === 'string' ? cp.since : null, now}).length;
  const gotThisMonth = got.filter(g => g?.month === month).length >= RULE.perMonth;
  return {n: Math.min(n, RULE.need), raw: n, need: RULE.need, month, gotThisMonth, ready: n >= RULE.need && !gotThisMonth, wait: n >= RULE.need && gotThisMonth};
}

/* ── 서버(넷리파이 블롭 꼴 저장소 · kakao-store 와 같은 get/setJSON/delete/list) ── */
const CODE_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // kakao-store CODE_ABC 와 같은 31자(헷갈리는 0 · O · 1 · I · L 없음 · normCode 가 그대로 받음)
const hmac = (secret, s) => createHmac('sha256', secret).update(s).digest();
/** 쿠폰 번호(12자) — 회원 표 + 달 + 비밀값 */
export function couponCode(mh, month, secret) {
  let x = BigInt('0x' + hmac(secret, 'dori-coffee:' + mh + ':' + month).toString('hex')), s = '';
  for (let i = 0; i < 12; i++) { s += CODE_ABC[Number(x % 31n)]; x /= 31n; }
  return s;
}
export const showCoupon = c => c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8, 12);
export const cpKey = mh => 'cp/' + mh;
export const cfKey = (secret, code) => 'cf/' + hmac(secret, 'dori-cf:' + code).toString('base64url');

/** 회원 쿠폰 — 점수가 찼고 이번 달 아직이면 쿠폰을 만듦(번호 장부 cf/ 먼저 · cp/ 다음) · → {n, need, month, code(이번 달 번호 | null), codes(받은 번호 모두), wait} */
export async function memberCoupon(store, mh, records, {secret, now = new Date()} = {}) {
  if (typeof secret !== 'string' || secret.length < 32) throw new TypeError('coupon: secret');
  const t = now.getTime(), cp0 = await store.get(cpKey(mh), {type: 'json'});
  let cp = cp0 && typeof cp0 === 'object' ? cp0 : {schema: COUPON_SCHEMA, since: null, got: []};
  const plan = couponPlan(records, cp, {now: t});
  if (plan.ready) {
    const at = now.toISOString(), code = couponCode(mh, plan.month, secret);
    await store.setJSON(cfKey(secret, code), {schema: COUPON_SCHEMA, month: plan.month, at}, {onlyIfNew: true});
    cp = {schema: COUPON_SCHEMA, since: seoulDay(t), got: [...(Array.isArray(cp.got) ? cp.got : []), {month: plan.month, at}]};
    await store.setJSON(cpKey(mh), cp);
  }
  const after = couponPlan(records, cp, {now: t}), got = cp.got ?? [];
  const codes = got.map(g => ({month: g.month, code: showCoupon(couponCode(mh, g.month, secret))}));
  return {n: after.n, need: after.need, month: after.month, code: codes.find(c => c.month === after.month)?.code ?? null, codes, wait: after.wait || after.gotThisMonth};
}

/** 사장님 — 쿠폰 번호 맞대기(처음이면 「보냄」 표시) · {ok, kind: 'coffee', used, month, at, usedAt} | {ok: false} */
export async function verifyCoupon(store, code, {secret, now = new Date(), mark = true, update}) {
  const key = cfKey(secret, code);
  const p = await store.get(key, {type: 'json'});
  if (!p || typeof p !== 'object' || typeof p.month !== 'string') return {ok: false, used: false};
  if (p.used) return {ok: true, kind: 'coffee', used: true, month: p.month, at: p.at ?? null, usedAt: p.used};
  if (mark) { if (typeof update === 'function') await update(store, key, q => (q && !q.used ? {...q, used: now.toISOString()} : undefined)); else await store.setJSON(key, {...p, used: now.toISOString()}); }
  return {ok: true, kind: 'coffee', used: false, month: p.month, at: p.at ?? null, usedAt: mark ? now.toISOString() : null};
}

/** 사장님 — 쿠폰 목록(새것 먼저 · 번호 · 사람 표 없음) → [{month, at, used}] */
export async function listCoupons(store) {
  const out = [];
  const r = await store.list({prefix: 'cf/'});
  for (const b of r?.blobs ?? []) { const p = await store.get(b.key, {type: 'json'}); if (p && typeof p.month === 'string') out.push({month: p.month, at: p.at ?? null, used: p.used ?? null}); }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
