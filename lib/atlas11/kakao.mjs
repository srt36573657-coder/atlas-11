/**
 * 고도리 · 카톡 가입 — 서버 길 한 곳(넷리파이 함수 functions/atlas11/kakao.mjs 가 부른다 · 경로 /api/kakao/*)
 *   사장님 2026-10-18(싱가포르) 00:15 명령문 docs/design/godori-2026-10-18/order-0015.txt [2] · [3] · [4] 2 · 6 · 7 · [11] 2 · 4 · [12] 2 · 3
 *   길: start(카드 단추 → 우리 화면 없이 곧바로 카카오 동의 화면 · 표(state) 쿠키) · callback(표 맞대기 · 증표 바꿈은 서버에서만 · 회원 번호만 · 로그인 쿠키)
 *     · me · data(GET · PUT 회원 기록 넷) · withdraw(서버 사본 지움 + 카카오 연결 끊기) · verify(확인 번호 · 사장님 열쇠 기기만) · counts(날마다 두 수 · 사장님 열쇠 기기만)
 *     · unlinked(카카오가 알려 주는 연결 끊김 — 카카오 설정에서 끊어도 서버 사본을 지움)
 *   꺼짐 = config.on 이 true 가 아니거나 넷리파이 환경 값 넷(ENV) 중 하나라도 없음 → 모든 길 404(저장소 · 카카오를 손대지 않음)
 *     · 넷리파이에서는 스위치 파일 config/atlas11/kakao.json "on" 이 true 일 때만 이 함수가 올라감(scripts/atlas11/deploy_netlify.mjs SWITCHED_FUNCTIONS)
 *   · 받는 것은 카카오 회원 번호 하나 — 동의 화면 요청에 scope 없음 · 번호는 /v1/user/access_token_info 로만(프로필 · 이름 · 사진 · 전화 · 생일 부르지 않음)
 *   · 카카오 증표(access · refresh)는 번호를 읽자마자 무효로 하고(/v1/user/logout) 어디에도 두지 않음 · 탈퇴 때 연결 끊기는 어드민 열쇠로(증표를 둘 까닭이 없음)
 *   · 로그인 증표 = 쿠키 __Host-kk_login = <회원 표>.<무작위 256비트>(HttpOnly · Secure · SameSite=Lax · 180일) — 화면 저장소에 두지 않음
 *     저장소에는 그 SHA-256 만(s/<회원 표>/<SHA-256>) · 연결 끊기에 쓸 회원 번호는 그 쿠키로만 열리는 자물쇠(AES-256-GCM) 안에 — 저장소만으로는 번호를 못 읽음
 *   · 다시 온 사람(카톡 안 · prompt=none)은 누름 0 으로 들임 — 조용한 시작은 가입을 만들지 않음(회원이 아니면 kakao=none) · 처음 온 사람은 건드리지 않음
 *   · 날마다 두 수만(시작 단추 누른 수 · 가입 마친 수 — 사람 표 · 시각 없음 · lib/atlas11/kakao-store.mjs) · 기록(log)에는 까닭 낱말만(사람 · 열쇠 · 증표 · code 없음)
 * 저장 · 합치기 · 소개 셈은 lib/atlas11/kakao-store.mjs(K1d) · 이 파일은 넷리파이에 묶이지 않는다(시험 = 메모리 저장소 + 가짜 카카오 tests/atlas11/fake-kakao/)
 * 쓰는 법: handleKakao(Request, env, {config, store | () => store, fetch, kakao, now, log, ownerHash, dev, cookies, wait, onGone}) → Response
 * 2026-10-18 따로 검증(VK) 고침: F3 탈퇴는 카카오 연결 끊기 먼저(안 되면 502 · 아무것도 안 지움) · F2 탈퇴 · 연결 끊김 때 onGone(편지 고리 떼기)
 *   · F4 표 쿠키 서명(HMAC) + 서버가 한 번만(st/<표를 만든 서울 날짜>/<SHA-256> onlyIfNew · F12 이틀 넘은 날 묶음은 돌아옴 때 지움) · F6 시작 누른 수는 꼭대기 이동만 · F10 카카오 기다림 합 8초 · F11 알림 때 지우다 깨지면 500
 */
import {randomBytes, createHash, createHmac, timingSafeEqual, createCipheriv, createDecipheriv} from 'node:crypto';
import {OWNER_KEY_SHA256, ownerKeyOk} from './invite.mjs';
import {bumpDaily, dailyCounts, finishSignup, memberState, isMember, getData, putData, parseDataBody, withdrawMember, verifyCode, memberHash, kakaoIdOf, secretOf, seoulDate, LIMITS as STORE_LIMITS, MH_RE, REF_RE, SECRET_ENV} from './kakao-store.mjs';

export const KAKAO_SCHEMA = 'godori-kakao-1';
/** 길 이름 → 받는 방법 */
export const ROUTES = Object.freeze({start: ['GET'], callback: ['GET'], me: ['GET'], data: ['GET', 'PUT'], withdraw: ['POST'], verify: ['GET'], counts: ['GET'], unlinked: ['GET', 'POST']});
/** 넷리파이 환경 값 이름(값은 넷리파이에만 · 저장소 · 깃허브 · 화면 · 기록에 없음) — 넷이 다 있어야 켜짐 */
export const ENV = Object.freeze({rest: 'ATLAS_KAKAO_REST_KEY', secret: 'ATLAS_KAKAO_CLIENT_SECRET', admin: 'ATLAS_KAKAO_ADMIN_KEY', hash: SECRET_ENV});
export const COOKIE = Object.freeze({login: '__Host-kk_login', state: '__Host-kk_state', secure: true});
export const LOGIN_DAYS = 180, STATE_SEC = 600;
export const KAKAO = Object.freeze({auth: 'https://kauth.kakao.com', api: 'https://kapi.kakao.com'});
/** 카카오를 기다리는 때(ms) — 돌아옴 한 번에 증표 + 번호 + 무효 = 합 8초(넷리파이 함수 시간 안 · VK F10) · 탈퇴의 연결 끊기 6초 */
export const KAKAO_WAIT_MS = Object.freeze({token: 4000, info: 3000, logout: 1000, unlink: 6000});
/** 스위치 파일(config/atlas11/kakao.json)이 없을 때의 값 — 사이트 · 돌아올 쪽 · 돌아올 주소 */
export const DEFAULTS = Object.freeze({on: false, site: 'https://aaa7377.com', page: '/next/', callback: '/api/kakao/callback'});
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const TO_CHARS = /^[A-Za-z0-9\-._~!$&'()*+,;=:@/?#%]*$/; // 주소에 쓰는 글자만(빈칸 · 따옴표 · <> · \ 없음)
const X = 'https://x.invalid';

/* ── 열쇠 · 스위치 ── */
/** 환경 값 넷 → {rest, secret, admin, hash} · 하나라도 없으면 null(그러면 모두 꺼짐) */
export function keysOf(env = {}) {
  const v = n => (typeof env?.[n] === 'string' && env[n].trim() ? env[n].trim() : null);
  const k = {rest: v(ENV.rest), secret: v(ENV.secret), admin: v(ENV.admin), hash: secretOf(env)};
  return k.rest && k.secret && k.admin && k.hash ? k : null;
}
/* 스위치 둘(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [7] 1 · 2 · 일꾼 KB1) — 가입과 공유를 따로 켬(config/atlas11/kakao.json "switches")
   · 가입 = config "on"(옛 이름 그대로 이어 읽음) — 이 파일의 서버 길(/api/kakao/*) · 올리기 SWITCHED_FUNCTIONS · 화면 site/next/kakao.js SWITCH · 편지 KAKAO_ON 이 봄
   · 공유 = 카톡 그림 카드 보내기만 — 서버 길이 없음(화면이 카카오 도구로 바로 보냄) · 따로 켜는 값 없음: config.share.from(config/atlas11/invite.json) "kakao" 의
     key · version · integrity 셋이 다 차면 켜짐(화면 kakao.js sdkOf · 보안 머리말 site_headers.mjs shareKeyIn 과 같은 칸 · 시험 kakao-client ⑯ ⑳) · 이 서버는 공유 값을 읽지도 쓰지도 않음 */
export const signupOn = config => config?.on === true;
export const SHARE_FIELDS = Object.freeze(['kakao.key', 'kakao.version', 'kakao.integrity']);
/** 공유 스위치 — src = config.share.from 파일의 내용(invite.json) · 세 칸이 다 찬 글이면 true(열쇠 값은 이 저장소에 두지 않는 동안 늘 false) */
export const shareOn = src => { const k = src?.kakao; return !!(k && typeof k === 'object' && [k.key, k.version, k.integrity].every(v => typeof v === 'string' && v.trim() !== '')); };
/** 켜졌나(가입 서버 길) — 가입 스위치 on 이 true 이고 열쇠 넷이 다 있음 · 공유 스위치와 상관없음 */
export const switchOn = (config, env) => signupOn(config) && !!keysOf(env);

/* ── 돌아갈 쪽 ── */
/** 돌아갈 쪽 — 「#/…」(쪽 page 를 앞에 붙임) 또는 같은 사이트 쪽(page 아래 · 「/」 · 뿌리의 「/이름.html」) · 512자까지 · 그 밖은 page + 「#/」 */
export function cleanTo(v, page = DEFAULTS.page) {
  const home = page + '#/';
  if (typeof v !== 'string' || !v || v.length > 512 || !TO_CHARS.test(v)) return home;
  const p = v.startsWith('#/') ? page + v : v;
  if (!p.startsWith('/') || p.startsWith('//')) return home;
  let u; try { u = new URL(p, X); } catch { return home; }
  if (u.origin !== X) return home;
  if (!(u.pathname === '/' || u.pathname.startsWith(page) || /^\/[A-Za-z0-9_-]+\.html$/.test(u.pathname))) return home;
  return u.pathname + u.search + u.hash;
}
/** 돌아갈 쪽에 결과 표 kakao=ok | none 을 붙임(화면이 읽고 지움) */
export function withMark(to, mark) { const u = new URL(to, X); u.searchParams.set('kakao', mark); return u.pathname + u.search + u.hash; }

/* ── 응답 ── */
const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
function headers(base, cookies = []) { const h = new Headers(base); for (const c of cookies) h.append('Set-Cookie', c); return h; }
const json = (status, body, cookies) => new Response(JSON.stringify(body), {status, headers: headers(HEAD, cookies)});
const notFound = () => json(404, {error: 'not_found'});
function redirect(location, cookies = [], referrer = 'no-referrer') {
  return new Response(null, {status: 302, headers: headers({'Location': location, 'Cache-Control': 'no-store', 'Referrer-Policy': referrer, 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff'}, cookies)});
}
/** 표가 안 맞음(403) — 짧은 한 장(스크립트 · 꾸밈 없음 · 입력칸 없음) */
function denied(page, cookies) {
  const body = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>다시 눌러 주세요</title><h1>다시 눌러 주세요</h1><h2 lang="en">Please tap again.</h2><h2><a href="${page}">돌아가기 · Back</a></h2></html>`;
  return new Response(body, {status: 403, headers: headers({'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'", 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff'}, cookies)});
}

/* ── 쿠키 · 로그인 ── */
function cookieOf(req, name) {
  for (const part of (req.headers.get('cookie') ?? '').split(';')) { const i = part.indexOf('='); if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim(); }
  return null;
}
const setCookie = (name, value, maxAge, secure) => `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly${secure ? '; Secure' : ''}; SameSite=Lax`;
const clearCookie = (name, secure) => setCookie(name, '', 0, secure);
const sha = s => createHash('sha256').update(String(s), 'utf8').digest('hex');
/** 길이와 상관없이 일정 시간 맞대기 */
function sameText(a, b) { if (typeof a !== 'string' || typeof b !== 'string') return false; return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest()); }
const sessKey = (mh, token) => `s/${mh}/${sha(token)}`;
const sessPre = mh => `s/${mh}/`;
const lockKey = token => createHmac('sha256', token).update('godori-kakao-id-lock-1').digest();
/** 회원 번호를 그 로그인 쿠키로만 열리게 잠금 */
function lockId(id, token) {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', lockKey(token), iv), ct = Buffer.concat([c.update(id, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64url');
}
function openId(box, token) {
  try {
    const b = Buffer.from(String(box), 'base64url'), d = createDecipheriv('aes-256-gcm', lockKey(token), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return kakaoIdOf(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'));
  } catch { return null; }
}
/** 로그인 쿠키 → {mh, token, key, rec} | {bad: true}(쿠키가 있으나 틀림 · 끝남 — 지움) | null(쿠키 없음) */
async function sessionOfReq(req, store, nowMs, names) {
  const v = cookieOf(req, names.login);
  if (v == null || v === '') return null;
  const i = v.indexOf('.'), mh = v.slice(0, i), token = v.slice(i + 1);
  if (i < 0 || !MH_RE.test(mh) || !TOKEN_RE.test(token)) return {bad: true};
  const key = sessKey(mh, token), rec = await store.get(key, {type: 'json'});
  if (!rec || !(Number(rec.exp) > nowMs)) { if (rec) await store.delete(key); return {bad: true}; }
  return {mh, token, key, rec};
}
async function dropSessions(store, mh) { for (const b of (await store.list({prefix: sessPre(mh)}))?.blobs ?? []) await store.delete(b.key); }
/** 같은 사이트에서 온 요청인가(다른 사이트 화면이 대신 보내지 못하게 — SameSite=Lax 쿠키와 함께) */
function sameSite(req, url) {
  const sf = req.headers.get('sec-fetch-site');
  if (sf && sf !== 'same-origin' && sf !== 'none') return false;
  const o = req.headers.get('origin');
  return !o || o === url.origin;
}

/* ── 카카오 부르기(서버에서만) ── */
const form = o => new URLSearchParams(o).toString();
const FORM = 'application/x-www-form-urlencoded;charset=utf-8';
async function kakaoToken(c, code) {
  const r = await c.f(c.base.auth + '/oauth/token', {method: 'POST', headers: {'Content-Type': FORM}, body: form({grant_type: 'authorization_code', client_id: c.keys.rest, redirect_uri: c.redirectUri, code, client_secret: c.keys.secret}), signal: AbortSignal.timeout(c.wait.token)});
  const text = await r.text();
  if (!r.ok) return {why: 'token_' + r.status};
  let j = null; try { j = JSON.parse(text); } catch {}
  return typeof j?.access_token === 'string' && j.access_token ? {access: j.access_token} : {why: 'token_shape'};
}
async function kakaoMemberId(c, access) {
  const r = await c.f(c.base.api + '/v1/user/access_token_info', {headers: {Authorization: 'Bearer ' + access}, signal: AbortSignal.timeout(c.wait.info)});
  const text = await r.text();
  if (!r.ok) return {why: 'info_' + r.status};
  const m = /"id"\s*:\s*"?(\d{1,20})/.exec(text), id = m ? kakaoIdOf(m[1]) : null; // 큰 수도 글자 그대로(JSON 수로 읽으면 자리가 깨질 수 있음)
  return id ? {id} : {why: 'info_shape'};
}
/** 받은 증표를 바로 무효로(카카오 계정 로그인은 그대로 · 실패해도 넘어감) */
async function kakaoLogout(c, access) { try { const r = await c.f(c.base.api + '/v1/user/logout', {method: 'POST', headers: {Authorization: 'Bearer ' + access}, signal: AbortSignal.timeout(c.wait.logout)}); await r.text(); } catch {} }
/** 탈퇴 — 어드민 열쇠로 그 회원 연결 끊기 · 카카오 -101(이 앱과 연결 안 된 사람)은 이미 끊긴 것으로 봄 */
async function kakaoUnlink(c, id) {
  try {
    const r = await c.f(c.base.api + '/v1/user/unlink', {method: 'POST', headers: {Authorization: 'KakaoAK ' + c.keys.admin, 'Content-Type': FORM}, body: form({target_id_type: 'user_id', target_id: id}), signal: AbortSignal.timeout(c.wait.unlink)});
    const text = await r.text();
    if (r.ok) return {ok: true};
    let j = null; try { j = JSON.parse(text); } catch {}
    return j?.code === -101 ? {ok: true, already: true} : {ok: false, why: 'unlink_' + r.status};
  } catch (e) { return {ok: false, why: 'unlink_' + (e?.name ?? 'error')}; }
}

/* ── 길 ── */
/** 카드 단추(누름 1) · 매매일지 권유 · 다시 온 사람(prompt=none) — 우리 화면 없이 곧바로 카카오 동의 화면으로 */
async function start(c) {
  const {url} = c;
  if (!c.dev && url.origin !== c.site) return redirect(c.site + url.pathname + url.search, [], 'no-referrer'); // 돌아올 주소와 같은 집에서 표 쿠키를 굽게
  const silent = url.searchParams.get('prompt') === 'none';
  const to = cleanTo(url.searchParams.get('to'), c.cfg.page);
  const r = url.searchParams.get('ref'), ref = !silent && typeof r === 'string' && REF_RE.test(r) ? r : null;
  const s = randomBytes(32).toString('base64url'); // 남이 못 맞힐 표 256비트
  if (!silent && humanTap(c.req)) await bumpDaily(c.store, 'start', {now: c.t}); // 「카카오로 시작하기」 누른 수 — 사람이 쪽을 여는 꼭대기 이동만(조용한 시작 · 그림 · 숨은 요청 · 미리보기 일꾼은 뺌)
  const a = new URL(c.base.auth + '/oauth/authorize');
  a.searchParams.set('client_id', c.keys.rest);
  a.searchParams.set('redirect_uri', c.redirectUri);
  a.searchParams.set('response_type', 'code');
  a.searchParams.set('state', s);
  if (silent) a.searchParams.set('prompt', 'none');
  const payload = Buffer.from(JSON.stringify({s, to, ref, p: silent ? 1 : 0, t: c.t.getTime()})).toString('base64url');
  return redirect(a.href, [setCookie(c.names.state, payload + '.' + stateSig(c, payload), STATE_SEC, c.names.secure)], 'strict-origin-when-cross-origin');
}
/** 사람이 누른 꼭대기 이동인가 — Sec-Fetch 머리글이 있으면 navigate · document 일 때만(다른 사이트의 그림 · 스크립트 · fetch 는 아님) · 없으면(옛 브라우저 · 앱 안 브라우저) 셈 · 미리보기 일꾼 뺌(VK F6) */
function humanTap(req) {
  const mode = req.headers.get('sec-fetch-mode'), dest = req.headers.get('sec-fetch-dest');
  if (mode && mode !== 'navigate') return false;
  if (dest && dest !== 'document') return false;
  return !/bot|crawl|spider|scrap|preview|facebookexternalhit/i.test(req.headers.get('user-agent') ?? '');
}
/** 표 쿠키 서명 — 서버 비밀값(ATLAS_KAKAO_HASH_SECRET)에서 뽑은 열쇠의 HMAC-SHA256(VK F4) */
const stateSig = (c, payload) => createHmac('sha256', createHmac('sha256', c.keys.hash).update('godori-kakao-state-1').digest()).update(payload).digest('base64url');
function readState(c, v) {
  if (typeof v !== 'string' || !v || v.length > 2048) return null;
  const i = v.lastIndexOf('.'), payload = v.slice(0, i), sig = v.slice(i + 1);
  if (i < 1 || !sameText(sig, stateSig(c, payload))) return null; // 서명 없음 · 다름 → 막음
  try {
    const o = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return o && TOKEN_RE.test(o.s) && typeof o.to === 'string' && (o.ref == null || REF_RE.test(o.ref)) && (o.p === 0 || o.p === 1) && Number.isFinite(o.t) ? o : null;
  } catch { return null; }
}
/** 쓴 표 기억(st/<서울 날짜>/<SHA-256>) 치우기 — 날 묶음 목록 한 번(directories) · STATE_KEEP_DAYS 보다 오래된 날 묶음만 지움(표는 10분만 쓰여 이틀이면 넉넉함)
 *  지우다 깨져도 로그인은 그대로(까닭 낱말만 기록) · 메모리 저장소는 directories 를 몰라 모든 열쇠를 줌 → 열쇠에서 날짜를 읽음 */
export const STATE_KEEP_DAYS = 2;
async function sweepStates(c, nowMs) {
  try {
    const keepFrom = seoulDate(nowMs - STATE_KEEP_DAYS * 864e5), r = await c.store.list({prefix: 'st/', directories: true});
    const days = new Set([...(r?.directories ?? []), ...(r?.blobs ?? []).map(b => b.key)].map(k => String(k).replace(/^st\//, '').split('/')[0]));
    for (const d of days) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= keepFrom) continue;
      for (const b of (await c.store.list({prefix: `st/${d}/`}))?.blobs ?? []) await c.store.delete(b.key);
    }
  } catch (e) { c.log('sweep error ' + (e?.name ?? 'Error')); }
}
/** 카카오에서 돌아옴(누름 2 뒤) — 표 맞대기 → 증표 바꿈(서버) → 회원 번호 → 회원 표 → 가입(처음) 또는 로그인(다시) → 보낸 쪽으로 */
async function callback(c) {
  const {url, req, names} = c, clear = [clearCookie(names.state, names.secure)];
  const st = readState(c, cookieOf(req, names.state)), q = url.searchParams.get('state'), now = c.t.getTime();
  if (!st || !q || !sameText(q, st.s) || now - st.t > STATE_SEC * 1000 || st.t > now + 60e3) return denied(c.cfg.page, clear); // 표가 없거나 다름 · 서명이 다름 · 시간이 지남 → 막음
  const day = seoulDate(st.t); // 표를 만든 날(서명된 때) — 자정을 넘겨 다시 내도 같은 열쇠
  const once = await c.store.setJSON(`st/${day}/${sha(st.s)}`, {d: day}, {onlyIfNew: true}); // 표는 한 번만 — 서버가 쓴 표를 기억(같은 쿠키 · 표를 다시 내면 403 · VK F4)
  if (once?.modified === false) return denied(c.cfg.page, clear);
  await sweepStates(c, now); // 이틀 넘은 날 묶음은 지움(VK F12)
  const to = cleanTo(st.to, c.cfg.page), none = () => redirect(withMark(to, 'none'), clear);
  const code = url.searchParams.get('code');
  if (url.searchParams.has('error') || !code || code.length > 2048) return none(); // 동의 거부 · 조용한 로그인 안 됨 · 카카오 오류 → 가입 없이 그 쪽
  try {
    const tok = await kakaoToken(c, code);
    if (!tok.access) { c.log('callback ' + tok.why); return none(); }
    const who = await kakaoMemberId(c, tok.access);
    await kakaoLogout(c, tok.access);
    if (!who.id) { c.log('callback ' + who.why); return none(); }
    const mh = memberHash(who.id, c.keys.hash);
    if (st.p) { if (!(await isMember(c.store, mh))) return none(); } // 조용한 시작은 가입을 만들지 않음(친구가 직접 한 번 동의해야 가입)
    else await finishSignup(c.store, {mh, ref: st.ref, secret: c.keys.hash, now: c.t}); // 새 회원만 「가입 마친 수」 +1 · 소개 수 +1(K1d)
    const token = randomBytes(32).toString('base64url');
    await c.store.setJSON(sessKey(mh, token), {at: c.t.toISOString(), exp: now + LOGIN_DAYS * 864e5, k: lockId(who.id, token)});
    return redirect(withMark(to, 'ok'), [...clear, setCookie(names.login, mh + '.' + token, LOGIN_DAYS * 86400, names.secure)]);
  } catch (e) { c.log('callback error ' + (e?.name ?? 'Error')); return none(); }
}
const NOT_MEMBER = {on: true, member: false, ref: null, friends: 0, next: null, code: null};
async function me(c) {
  const s = await sessionOfReq(c.req, c.store, c.t.getTime(), c.names), clear = [clearCookie(c.names.login, c.names.secure)];
  if (!s) return json(200, NOT_MEMBER);
  if (s.bad) return json(200, NOT_MEMBER, clear);
  const ms = await memberState(c.store, s.mh, {secret: c.keys.hash, now: c.t});
  if (!ms) { await c.store.delete(s.key); return json(200, NOT_MEMBER, clear); } // 다른 기기에서 탈퇴함
  return json(200, {on: true, member: true, ref: ms.ref ?? null, friends: ms.friends ?? 0, next: ms.next ?? null, code: ms.code ?? null}); // 이름 · 친구 표 없음
}
const memberOnly = cookies => json(401, {error: 'member_only'}, cookies);
async function data(c) {
  const {req} = c, put = req.method === 'PUT';
  if (put) {
    if (!sameSite(req, c.url)) return json(403, {error: 'origin'});
    if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
    if (Number(req.headers.get('content-length') ?? 0) > STORE_LIMITS.body) return json(413, {error: 'too_large'});
  }
  const s = await sessionOfReq(req, c.store, c.t.getTime(), c.names);
  if (!s || s.bad) return memberOnly(s?.bad ? [clearCookie(c.names.login, c.names.secure)] : []); // 가입 안 한 사람의 기록은 이 기기에만
  if (!put) { const r = await getData(c.store, s.mh); return r.status === 401 ? memberOnly() : json(r.status, r.body); }
  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > STORE_LIMITS.body) return json(413, {error: 'too_large'});
  const p = parseDataBody(text);
  if (!p.ok) return json(p.status, {error: p.error, ...(p.key ? {key: p.key} : {})});
  const r = await putData(c.store, s.mh, p.body, {now: c.t});
  return r.status === 401 ? memberOnly() : json(r.status, r.body);
}
/** 회원 하나를 지움 — 다른 저장소의 고리(편지 여는 밤 [4] 8 · onGone) → 카톡 저장소 회원 · 기록 · 소개 고리 → 로그인 기록 · 다시 불러도 됨 */
async function forget(c, mh) {
  if (typeof c.onGone === 'function') await c.onGone(mh);
  const r = await withdrawMember(c.store, mh);
  await dropSessions(c.store, mh);
  return !!r.body?.removed;
}
/** 탈퇴(두 번에 끝 — 화면의 단추 + 확인) — 카카오 연결 끊기를 먼저(VK F3) · 끊겼을 때만 서버 사본 · 로그인 기록 · 편지 고리를 지움 · 이 기기 기록은 화면이 그대로 둠
 *  끊기 안 됨 → 502 {error: 'unlink'} · 아무것도 안 지움(로그인 그대로 → 다시 누르면 됨) · 지우다 깨짐 → 500 {error: 'delete'}(다시 누르면 카카오는 -101 = 이미 끊김 → 마저 지움) */
async function withdraw(c) {
  if (!sameSite(c.req, c.url)) return json(403, {error: 'origin'});
  const s = await sessionOfReq(c.req, c.store, c.t.getTime(), c.names), clear = [clearCookie(c.names.login, c.names.secure)];
  if (!s || s.bad) return memberOnly(s?.bad ? clear : []);
  const id = openId(s.rec.k, s.token);
  if (!id) { c.log('withdraw no_id'); return json(502, {error: 'unlink'}); }
  const u = await kakaoUnlink(c, id);
  if (!u.ok) { c.log('withdraw ' + u.why); return json(502, {error: 'unlink'}); }
  try { return json(200, {ok: true, removed: await forget(c, s.mh), unlinked: true}, clear); }
  catch (e) { c.log('withdraw error ' + (e?.name ?? 'Error')); return json(500, {error: 'delete'}); }
}
async function verify(c) {
  const r = await verifyCode(c.store, c.url.searchParams.get('code') ?? '', {ownerKey: c.req.headers.get('x-atlas-owner'), ownerHash: c.ownerHash, secret: c.keys.hash, now: c.t});
  return json(r.status, r.body);
}
/** 날마다 두 수(사장님 열쇠 기기만) — [{date, start, done}] 새 날 먼저 · 사람 표 없음 */
async function counts(c) {
  if (!ownerKeyOk(c.req.headers.get('x-atlas-owner'), c.ownerHash)) return json(403, {error: 'owner_only'});
  const d = Number(c.url.searchParams.get('days') ?? 30);
  return json(200, {days: await dailyCounts(c.store, {days: Number.isFinite(d) ? Math.min(Math.max(1, Math.floor(d)), 400) : 30, now: c.t})});
}
/** 카카오 연결 끊기 알림(카카오 설정에서 끊음 · 계정 삭제 등) — 대표 어드민 열쇠 머리글로 맞대고 서버 사본 · 로그인 기록 · 편지 고리를 지움
 *  모르는 사람 · 번호 없음 = 200 · 지우다 깨지면 500(VK F11 — 카카오 웹훅 기록에 실패로 남아 사장님이 볼 수 있음) */
async function unlinked(c) {
  if (!sameText(c.req.headers.get('authorization') ?? '', 'KakaoAK ' + c.keys.admin)) return json(401, {error: 'auth'});
  let p = c.url.searchParams;
  if (c.req.method === 'POST') {
    const text = (await c.req.text()).slice(0, 4096);
    if (/json/i.test(c.req.headers.get('content-type') ?? '')) { let j = null; try { j = JSON.parse(text); } catch {} p = new URLSearchParams(Object.entries(j && typeof j === 'object' ? j : {}).map(([k, v]) => [k, String(v)])); }
    else p = new URLSearchParams(text);
  }
  const id = kakaoIdOf(p.get('user_id') ?? '');
  if (id) {
    try { await forget(c, memberHash(id, c.keys.hash)); }
    catch (e) { c.log('unlinked error ' + (e?.name ?? 'Error')); return json(500, {error: 'delete'}); }
  }
  return json(200, {ok: true});
}
const RUN = {start, callback, me, data, withdraw, verify, counts, unlinked};

/** 요청 하나 — 꺼져 있으면 모든 길 404 · 길마다 받는 방법 밖은 405 */
export async function handleKakao(req, env = {}, deps = {}) {
  const cfg = {...DEFAULTS, ...(deps.config ?? {})};
  let url; try { url = new URL(req.url); } catch { return notFound(); }
  const m = /^\/api\/kakao\/([a-z]+)\/?$/.exec(url.pathname), route = m?.[1], keys = keysOf(env);
  if (cfg.on !== true || !keys || !route || !Object.hasOwn(ROUTES, route)) return notFound(); // 저장소 · 카카오를 손대기 전에
  if (!ROUTES[route].includes(req.method)) return new Response(null, {status: 405, headers: headers({...HEAD, Allow: ROUTES[route].join(', ')})});
  const log = typeof deps.log === 'function' ? deps.log : (line => console.warn('[kakao] ' + line));
  const site = deps.dev ? url.origin : String(cfg.site).replace(/\/+$/, '');
  const c = {req, url, cfg, keys, log, dev: !!deps.dev, site, redirectUri: site + cfg.callback,
    store: typeof deps.store === 'function' ? deps.store() : deps.store, f: deps.fetch ?? globalThis.fetch, base: {...KAKAO, ...(deps.kakao ?? {})},
    t: (deps.now ?? (() => new Date()))(), names: {...COOKIE, ...(deps.cookies ?? {})}, ownerHash: deps.ownerHash || OWNER_KEY_SHA256,
    wait: {...KAKAO_WAIT_MS, ...(deps.wait ?? {})}, onGone: deps.onGone ?? null}; // onGone(회원 표) = 탈퇴 · 연결 끊김 때 다른 저장소의 고리를 뗌(편지 여는 밤 detachKakao)
  try { return await RUN[route](c); }
  catch (e) { log('error ' + route + ' ' + (e?.name ?? 'Error')); return json(500, {error: 'server'}); }
}

/** 다른 서버 길(편지 여는 밤 등)이 「지금 카카오 회원인가」를 물을 때 — 회원 표 | null(꺼짐 · 로그인 없음 · 탈퇴) · [4] 8 초대장을 회원에 붙일 때 씀 */
export async function kakaoMemberOf(req, env = {}, deps = {}) {
  const cfg = {...DEFAULTS, ...(deps.config ?? {})}, keys = keysOf(env);
  if (cfg.on !== true || !keys) return null;
  const store = typeof deps.store === 'function' ? deps.store() : deps.store;
  const s = await sessionOfReq(req, store, (deps.now ?? (() => new Date()))().getTime(), {...COOKIE, ...(deps.cookies ?? {})});
  return s && !s.bad && (await isMember(store, s.mh)) ? s.mh : null;
}
