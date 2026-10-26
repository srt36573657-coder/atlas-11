/* 친구 소개 세기 — 화면 쪽 한 곳(사장님 2026-10-25 13:40 「편지를 보내지 않아도 내가 우리에서 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔
   그렇게 시스템을 짜고 곳곳에 선물 받기를 다 집어넣어 놔 지금부터 만들어」 · 13:38 「내가 직접 보낼 거야」 — 상품권은 사장님이 직접 카톡 선물로)
   · 기기 열쇠 = 무작위 22자(이 기기 localStorage atlas:gift:key · 서버에는 해시만) · 보낸 사람 표 r = 열쇠 SHA-256 앞 16자(보내는 주소에 붙음 · 표로 열쇠를 알 수 없음)
   · 친구가 r 붙은 주소를 열면 /api/gift/visit 한 번(그 기기에서 그 r 은 한 번만 · 제 표면 안 셈) · 주소에서 r 은 바로 지움(다시 퍼지지 않게)
   · 서버 셈 = lib/atlas11/gift.mjs(/api/gift) · 이름은 받지 않음 · 전화번호는 상품권 방(p-gift.js)이 동의를 받고 claim 으로만 보냄
   · 아무 모듈도 받지 않음(작고 동기 · 첫 그림 뒤에 늦게 받음) */
const K = 'atlas:gift:key', KR = 'atlas:gift:ref', KV = 'atlas:gift:v:';
export const KEY_RE = /^[A-Za-z0-9_-]{22}$/, REF_RE = /^[A-Za-z0-9_-]{16}$/, PER = 3;
const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* 저장이 막힌 기기 — 이 쪽을 연 동안만 */ } };
const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
let memKey = null, memRef = null;

/** 이 기기 열쇠(없으면 만듦) */
export function key() {
  let k = get(K);
  if (!KEY_RE.test(k ?? '')) { k = memKey ?? b64u(crypto.getRandomValues(new Uint8Array(16))); put(K, k); }
  memKey = k;
  return k;
}
/** 보낸 사람 표 — 서버 refOf 와 같은 셈(SHA-256 → base64url 앞 16자) */
export async function ref() {
  if (memRef) return memRef;
  const k = key(), c = get(KR);
  if (REF_RE.test(c ?? '') && get(K) === k) return (memRef = c);
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(k)));
  memRef = b64u(d).slice(0, 16);
  put(KR, memRef);
  return memRef;
}
/** 지금 바로 쓸 수 있는 표(미리 ref() 를 불러 두면 있음) */
export const refNow = () => memRef ?? (REF_RE.test(get(KR) ?? '') ? get(KR) : null);
/** 보내는 주소에 표를 붙임 — 우리 사이트 주소만 · 표가 아직 없으면 그대로 */
export function withRef(url, r = refNow()) {
  if (!REF_RE.test(r ?? '')) return url;
  try {
    const u = new URL(url, location.origin);
    if (u.origin !== location.origin) return url;
    u.searchParams.set('r', r);
    return u.href;
  } catch { return url; }
}
/** 친구가 연 주소 — r 이 있으면 주소에서 지우고 한 번 셈 */
export async function visit(loc = location) {
  let r = null;
  try { r = new URLSearchParams(loc.search).get('r'); } catch { r = null; }
  if (!REF_RE.test(r ?? '')) return null;
  try { const u = new URL(loc.href); u.searchParams.delete('r'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch { /* 주소를 못 고침 — 그대로 */ }
  const mine = await ref().catch(() => null);
  if (r === mine) return {self: true};
  if (get(KV + r)) return {again: true};
  try {
    const res = await fetch('/api/gift/visit', {method: 'POST', headers: {'content-type': 'application/json', 'x-gift-key': key()}, body: JSON.stringify({r}), credentials: 'same-origin', cache: 'no-store'});
    if (res.ok) put(KV + r, '1');
    return {ok: res.ok, status: res.status};
  } catch { return null; }
}
/** 내 셈 — {ref, friends, kk, per, claims, next, can} · 못 받으면 null */
export async function me() {
  try {
    const r = await fetch('/api/gift/me', {headers: {'x-gift-key': key()}, cache: 'no-store', credentials: 'same-origin'});
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
/** 선물 받기 — {phone, agree, watched} → {status, ok?, id?, error?} */
export async function claim({phone, agree, watched}) {
  try {
    const r = await fetch('/api/gift/claim', {method: 'POST', headers: {'content-type': 'application/json', 'x-gift-key': key()}, body: JSON.stringify({phone: String(phone ?? ''), agree: agree === true, watched: watched === true}), cache: 'no-store', credentials: 'same-origin'});
    let j = null; try { j = await r.json(); } catch { j = null; }
    return {status: r.status, ...(j && typeof j === 'object' ? j : {})};
  } catch { return {status: 0}; }
}
/** 「상품권 주세요」(사장님 2026-10-26 16:14 · 16:16) — {watched} → {status, ok?, code?, contact?, error?} · 친구 셋을 채운 기기만 사장님 번호와 확인 번호를 받음 */
export async function askGift({watched}) {
  try {
    const r = await fetch('/api/gift/ask', {method: 'POST', headers: {'content-type': 'application/json', 'x-gift-key': key()}, body: JSON.stringify({watched: watched === true}), cache: 'no-store', credentials: 'same-origin'});
    let j = null; try { j = await r.json(); } catch { j = null; }
    return {status: r.status, ...(j && typeof j === 'object' ? j : {})};
  } catch { return {status: 0}; }
}
