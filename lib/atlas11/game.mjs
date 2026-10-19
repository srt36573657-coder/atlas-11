/**
 * 돌이 · 가짜 돈 연습 서버 셈(사장님 2026-10-19(싱가포르) 15:02 「회원 가입 한 사람에게 가상머니 10억씩을 준다 그래서 30억을 만들면 스타벅스 상품권 10만원짜리 10장 준다 …」 · 15:04 「일단해」)
 *   계좌 셈은 화면과 같은 site/next/game-rule.js · 이 파일은 저장(gm/<회원 표>)과 값 받기 · 상 번호(gp/)만
 *   값 = 사이트 회사 파일(/atlas/data/co/<번호>.json c.price)을 서버가 직접 받음 — 화면이 보낸 값은 믿지 않음
 *   상 = 합계가 30억 원 이상이 된 첫 때 한 번 · 번호 12자(회원 표 + 비밀값) · 받는 사람이 번호를 보내면 사장님이 관리자 화면에서 맞대고 상품권을 직접 보냄
 *   이름 · 전화를 받지 않음 · 탈퇴하면 gm/ 지움 · 상 장부(gp/)는 사람 표 없이 남음
 */
import {createHmac} from 'node:crypto';
import {GAME, newAccount, okAccount, trade, valueOf, CODE_RE} from '../../site/next/game-rule.js';

const CODE_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const hmac = (secret, s) => createHmac('sha256', secret).update(s).digest();
export const gmKey = mh => 'gm/' + mh;
export const gpKey = (secret, code) => 'gp/' + hmac(secret, 'dori-gp:' + code).toString('base64url');
export function prizeCode(mh, secret) {
  let x = BigInt('0x' + hmac(secret, 'dori-prize:' + mh).toString('hex')), s = '';
  for (let i = 0; i < 12; i++) { s += CODE_ABC[Number(x % 31n)]; x /= 31n; }
  return s;
}
const show = c => c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8, 12);

/** 지금 값 받기 — priceOf(번호) → 수 | null (넷리파이에서는 같은 사이트 파일을 받음) */
export const sitePriceOf = (origin, fetchFn = fetch) => async code => {
  if (!CODE_RE.test(code)) return null;
  try { const r = await fetchFn(new URL('/atlas/data/co/' + code + '.json', origin), {cache: 'no-store'}); if (!r.ok) return null; const j = await r.json(); const p = j?.c?.price; return Number.isFinite(p) && p > 0 ? p : null; } catch { return null; }
};
async function pricesOf(acc, priceOf) { const out = {}; await Promise.all(Object.keys(acc.pos).map(async c => { out[c] = await priceOf(c); })); return out; }

/** 회원 계좌 보기 → {acc, value, prize(번호 | null)} — 처음이면 10억 원 계좌를 만듦 · 30억 넘었으면 상 장부를 씀(한 번) */
export async function gameState(store, mh, {secret, priceOf, now = new Date(), update}) {
  let acc = await store.get(gmKey(mh), {type: 'json'});
  if (!okAccount(acc)) { acc = newAccount(); await store.setJSON(gmKey(mh), acc, {onlyIfNew: true}); acc = (await store.get(gmKey(mh), {type: 'json'})) ?? acc; }
  const v = valueOf(acc, await pricesOf(acc, priceOf));
  let prize = acc.prize ? show(prizeCode(mh, secret)) : null;
  if (v.won && !acc.prize) {
    const code = prizeCode(mh, secret);
    await store.setJSON(gpKey(secret, code), {schema: GAME.schema, at: now.toISOString(), total: Math.round(v.total)}, {onlyIfNew: true});
    await update(store, gmKey(mh), p => (okAccount(p) && !p.prize ? {...p, prize: now.toISOString()} : undefined));
    acc = {...acc, prize: now.toISOString()}; prize = show(code);
  }
  return {acc, value: v, prize};
}
/** 회원 사기 · 팔기 — 값은 서버가 받음 · 맞바꿈 쓰기 → {ok, why?, state} */
export async function gameTrade(store, mh, {code, side, q}, {secret, priceOf, now = new Date(), update}) {
  const px = await priceOf(code);
  if (!px) return {ok: false, why: 'price'};
  let why = null;
  await update(store, gmKey(mh), p => { const r = trade(okAccount(p) ? p : newAccount(), {code, side, q, px, t: now.getTime()}); if (!r.ok) { why = r.why; return undefined; } why = null; return {...r.acc, ...(p?.prize ? {prize: p.prize} : {})}; });
  const state = await gameState(store, mh, {secret, priceOf, now, update});
  return why ? {ok: false, why, state} : {ok: true, state};
}
/** 사장님 — 상 번호 맞대기 · 목록 */
export async function verifyPrize(store, code, {secret, now = new Date(), mark = true, update}) {
  const key = gpKey(secret, code), p = await store.get(key, {type: 'json'});
  if (!p || typeof p !== 'object' || typeof p.at !== 'string') return {ok: false, used: false};
  if (p.used) return {ok: true, kind: 'prize', used: true, at: p.at, usedAt: p.used};
  if (mark) await update(store, key, q => (q && !q.used ? {...q, used: now.toISOString()} : undefined));
  return {ok: true, kind: 'prize', used: false, at: p.at, usedAt: mark ? now.toISOString() : null};
}
export async function listPrizes(store) {
  const out = [], r = await store.list({prefix: 'gp/'});
  for (const b of r?.blobs ?? []) { const p = await store.get(b.key, {type: 'json'}); if (p && typeof p.at === 'string') out.push({at: p.at, used: p.used ?? null}); }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
