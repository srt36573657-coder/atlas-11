/**
 * ATLAS 11 · 선물형 초대장 — 저장 · 읽기(서버 쪽 셈 한 곳 · 넷리파이 함수 functions/atlas11/invite.mjs 가 이것을 부른다)
 *   사장님 2026-10-09 16:12(마카오 시각) 첨부 「아틀라스용 ‘카카오톡으로 보내는 선물형 초대장’ 제작 프롬프트」
 *   · 다른 휴대폰에서도 같은 내용으로 열려야 함 → 브라우저가 아니라 서버(넷리파이 Blobs)에 저장
 *   · 추측하기 어려운 공유 번호(무작위 128비트 · 22자) · 주소 · 공유 미리보기에 메시지를 넣지 않음
 *   · 받은 글은 그대로 글자로만(HTML 아님) · 발송 당시 내용을 고치지 않음(고치는 길 없음 · 같은 번호에 다시 쓰지 않음)
 *   · 열 수 있는 기간 180일 — 지나면 「기간이 지난 초대장」(410)
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get(key, {type:'json'}) · setJSON(key, value, {onlyIfNew}) 두 가지만 쓴다(시험은 메모리 저장소로).
 */
import {randomBytes} from 'node:crypto';

export const INVITE_SCHEMA = 'atlas11-invite-1';
export const INVITE_STORE = 'atlas11-invites-v1';
export const LIMITS = Object.freeze({name: 24, message: 300, lines: 12, body: 4096});
export const TTL_DAYS = 180;
export const ID_RE = /^[A-Za-z0-9_-]{22}$/;

/** 무작위 128비트 → base64url 22자 */
export const newId = (bytes = randomBytes(16)) => Buffer.from(bytes).toString('base64url');

const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​‎‏‪-‮⁦-⁩﻿]/g; // 보이지 않는 조종 문자 · 방향 바꾸기 문자(그림 문자를 잇는 ZWJ 는 살림)
const cut = (s, n) => Array.from(s).slice(0, n).join(''); // 글자 수(코드 포인트)로 자름 — 한글 · 그림 문자도 한 글자

/** 이름: 한 줄 · 앞뒤 빈칸 없음 · 24자까지 */
export function cleanName(v) {
  if (typeof v !== 'string') return '';
  return cut(v.normalize('NFC').replace(CTRL, '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim(), LIMITS.name);
}
/** 메시지: 줄 바꿈은 살림(빈 줄 둘 넘으면 하나로) · 12줄 · 300자까지 · 비어도 됨 */
export function cleanMessage(v) {
  if (typeof v !== 'string') return '';
  const lines = v.normalize('NFC').replace(/\r\n?/g, '\n').replace(CTRL, '').replace(/\t/g, ' ').split('\n').map(l => l.replace(/\s+$/g, ''));
  const out = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim().split('\n').slice(0, LIMITS.lines).join('\n');
  return cut(out, LIMITS.message).trim();
}

/** 받은 글 확인 — 받는 사람 · 보내는 사람은 꼭 · 메시지는 비어도 됨 */
export function validateDraft(body) {
  const to = cleanName(body?.to), from = cleanName(body?.from), message = cleanMessage(body?.message ?? '');
  const errors = [];
  if (!to) errors.push({field: 'to', code: 'required'});
  if (!from) errors.push({field: 'from', code: 'required'});
  return {ok: errors.length === 0, errors, draft: {to, from, message}};
}

export function recordOf(draft, {now = new Date(), id}) {
  const createdAt = now.toISOString(), expiresAt = new Date(now.getTime() + TTL_DAYS * 864e5).toISOString();
  return {schema: INVITE_SCHEMA, id, to: draft.to, from: draft.from, message: draft.message, createdAt, expiresAt};
}

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});

/** 만들기 — 같은 번호가 이미 있으면(거의 없음) 새 번호로 다시(세 번까지) */
export async function createInvite(store, body, {now = new Date(), makeId = newId} = {}) {
  const v = validateDraft(body);
  if (!v.ok) return {status: 400, body: {error: 'invalid', fields: v.errors}};
  for (let i = 0; i < 3; i++) {
    const id = makeId(), rec = recordOf(v.draft, {now, id});
    const r = await store.setJSON(id, rec, {onlyIfNew: true});
    if (r?.modified !== false) return {status: 201, body: {id, path: '/i/' + id, expiresAt: rec.expiresAt}};
  }
  return {status: 503, body: {error: 'busy'}};
}

/** 읽기 — 번호 모양이 틀리면 400 · 없으면 404 · 기간이 지났으면 410 */
export async function readInvite(store, id, {now = new Date()} = {}) {
  if (typeof id !== 'string' || !ID_RE.test(id)) return {status: 400, body: {error: 'bad_id'}};
  const rec = await store.get(id, {type: 'json'});
  if (!rec || rec.schema !== INVITE_SCHEMA) return {status: 404, body: {error: 'not_found'}};
  if (Date.parse(rec.expiresAt) <= now.getTime()) return {status: 410, body: {error: 'expired', expiresAt: rec.expiresAt}};
  return {status: 200, body: {to: rec.to, from: rec.from, message: rec.message, createdAt: rec.createdAt, expiresAt: rec.expiresAt}};
}

/** 요청 하나 — GET ?id= 읽기 · POST(같은 사이트에서만 · JSON · 4KB까지) 만들기 · 그 밖 405 */
export async function handleInvite(req, {store, now = () => new Date(), makeId = newId} = {}) {
  try {
    const url = new URL(req.url);
    if (req.method === 'GET') { const r = await readInvite(store, url.searchParams.get('id'), {now: now()}); return json(r.status, r.body); }
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'}); // 다른 사이트의 화면이 대신 만들지 못하게
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      const text = await req.text();
      if (new TextEncoder().encode(text).length > LIMITS.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(text); } catch { return json(400, {error: 'bad_json'}); }
      const r = await createInvite(store, body, {now: now(), makeId});
      return json(r.status, r.body);
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch (e) {
    return json(500, {error: 'server'});
  }
}

/** 시험 · 로컬용 메모리 저장소(넷리파이 Blobs 와 같은 두 가지) */
export function memoryStore() {
  const m = new Map();
  return {
    async get(key, opts) { const v = m.get(key); return v == null ? null : opts?.type === 'json' ? JSON.parse(v) : v; },
    async setJSON(key, value, opts) { if (opts?.onlyIfNew && m.has(key)) return {modified: false}; m.set(key, JSON.stringify(value)); return {modified: true}; },
    _map: m,
  };
}
