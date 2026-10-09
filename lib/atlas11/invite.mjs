/**
 * ATLAS 11 · 선물형 초대장 — 저장 · 읽기(서버 쪽 셈 한 곳 · 넷리파이 함수 functions/atlas11/invite.mjs 가 이것을 부른다)
 *   사장님 2026-10-09 16:12(마카오 시각) 첨부 「아틀라스용 ‘카카오톡으로 보내는 선물형 초대장’ 제작 프롬프트」
 *   · 다른 휴대폰에서도 같은 내용으로 열려야 함 → 브라우저가 아니라 서버(넷리파이 Blobs)에 저장
 *   · 추측하기 어려운 공유 번호(무작위 128비트 · 22자) · 주소 · 공유 미리보기에 메시지를 넣지 않음
 *   · 받은 글은 그대로 글자로만(HTML 아님) · 발송 당시 내용을 고치지 않음(고치는 길 없음 · 같은 번호에 다시 쓰지 않음)
 *   · 열 수 있는 기간 180일 — 지나면 「기간이 지난 초대장」(410)
 *   사진(2026-10-09 17:22 · 17:29 마카오 시각 「이 이미지로 판타스틱하게 3d 입체감으로 유기적으로 상호작용하게」 · 「귀엽게 예쁘게 알아서」)
 *   · 사장님이 보내는 초대장에만 — 사진 열쇠(x-atlas-owner 머리글)가 맞을 때만 받는다. 저장소가 공개라 열쇠는 두지 않고 SHA-256 만 둔다
 *   · 사진은 저장소(깃허브)에 넣지 않는다 — 사장님 휴대폰이 고른 사진만 Blobs 「photo/<번호>」에 · 그 초대장 링크를 가진 사람만 봄 · 기간이 지나면 사진도 410
 *   · 휴대폰이 줄여 보낸 JPEG 만(머리 FFD8FF · 끝 FFD9 · 800KB 까지) · 가로세로는 서버가 JPEG 머리에서 직접 읽음(보낸 쪽 숫자를 믿지 않음)
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get · set · setJSON · delete 넷만 쓴다(시험은 메모리 저장소로).
 */
import {randomBytes, createHash, timingSafeEqual} from 'node:crypto';

export const INVITE_SCHEMA = 'atlas11-invite-1';
export const INVITE_STORE = 'atlas11-invites-v1';
export const LIMITS = Object.freeze({name: 24, message: 300, lines: 12, body: 4096, photo: 800_000, photoBody: 1_100_000});
export const TTL_DAYS = 180;
export const ID_RE = /^[A-Za-z0-9_-]{22}$/;
/** 사진 열쇠(사장님 휴대폰에만 있음)의 SHA-256 — 열쇠는 https://aaa7377.com/invite.html#owner=<열쇠> 로 한 번 열면 그 기기에 기억됨 */
export const OWNER_KEY_SHA256 = '847a73ab2c86c146a534a13c0d3187a0523b6e0c00580bc39780ccc50a3bb038';

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

/** 사진 열쇠가 맞나 — 길이가 이상하면 바로 아님 · 같은 길이 해시를 일정 시간 비교 */
export function ownerKeyOk(key, hash = OWNER_KEY_SHA256) {
  if (typeof key !== 'string' || key.length < 16 || key.length > 128) return false;
  const a = createHash('sha256').update(key, 'utf8').digest(), b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** JPEG 가로세로 — SOF 표시(C0~CF · C4 · C8 · CC 빼고)에서 읽음 · 못 읽으면 null */
export function jpegSize(buf) {
  if (!(buf?.length > 4) || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    if (m === 0xFF) { i += 1; continue; } // 채움 바이트
    if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; } // 길이 없는 표시
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      const h = buf.readUInt16BE(i + 5), w = buf.readUInt16BE(i + 7);
      return w > 0 && h > 0 ? {w, h} : null;
    }
    i += 2 + len;
  }
  return null;
}

/** 사진: 「data:image/jpeg;base64,…」 하나 · JPEG 머리와 끝 · 크기 · 가로세로(가장 긴 쪽 2400 이하 · 비율 1:3~3:1) — 아니면 null */
export function photoBytes(v) {
  if (typeof v !== 'string' || v.length > Math.ceil(LIMITS.photo * 4 / 3) + 64) return null;
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(v);
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length < 1024 || buf.length > LIMITS.photo) return null;
  if (buf[0] !== 0xFF || buf[1] !== 0xD8 || buf[2] !== 0xFF || buf[buf.length - 2] !== 0xFF || buf[buf.length - 1] !== 0xD9) return null;
  const size = jpegSize(buf);
  if (!size || Math.max(size.w, size.h) > 2400 || size.w / size.h > 3 || size.h / size.w > 3) return null;
  return {buf, ...size};
}

export function recordOf(draft, {now = new Date(), id, photo = null}) {
  const createdAt = now.toISOString(), expiresAt = new Date(now.getTime() + TTL_DAYS * 864e5).toISOString();
  return {schema: INVITE_SCHEMA, id, to: draft.to, from: draft.from, message: draft.message, createdAt, expiresAt, ...(photo ? {photo: {w: photo.w, h: photo.h}} : {})};
}

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const PHOTO_HEAD = {'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=86400', 'X-Robots-Tag': 'noindex, nofollow, noarchive, noimageindex', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'none'; sandbox"};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});
const photoKey = id => 'photo/' + id;
const arrayBufferOf = buf => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

/** 만들기 — 같은 번호가 이미 있으면(거의 없음) 새 번호로 다시(세 번까지) · 사진은 owner(열쇠 맞음)일 때만 · 사진을 먼저 쓰고 글을 씀(글이 있으면 사진도 있음) */
export async function createInvite(store, body, {now = new Date(), makeId = newId, owner = false} = {}) {
  const v = validateDraft(body);
  if (!v.ok) return {status: 400, body: {error: 'invalid', fields: v.errors}};
  let photo = null;
  if (body?.photo != null) {
    if (!owner) return {status: 403, body: {error: 'photo_owner_only'}};
    photo = photoBytes(body.photo);
    if (!photo) return {status: 400, body: {error: 'invalid', fields: [{field: 'photo', code: 'format'}]}};
  }
  for (let i = 0; i < 3; i++) {
    const id = makeId(), rec = recordOf(v.draft, {now, id, photo});
    if (photo) { const p = await store.set(photoKey(id), arrayBufferOf(photo.buf), {onlyIfNew: true}); if (p?.modified === false) continue; }
    const r = await store.setJSON(id, rec, {onlyIfNew: true});
    if (r?.modified !== false) return {status: 201, body: {id, path: '/i/' + id, expiresAt: rec.expiresAt, photo: !!photo}};
    if (photo) await store.delete(photoKey(id)).catch(() => {}); // 글 번호가 겹침 → 방금 쓴 사진은 지움
  }
  return {status: 503, body: {error: 'busy'}};
}

async function liveRecord(store, id, now) {
  if (typeof id !== 'string' || !ID_RE.test(id)) return {status: 400, body: {error: 'bad_id'}};
  const rec = await store.get(id, {type: 'json'});
  if (!rec || rec.schema !== INVITE_SCHEMA) return {status: 404, body: {error: 'not_found'}};
  if (Date.parse(rec.expiresAt) <= now.getTime()) return {status: 410, body: {error: 'expired', expiresAt: rec.expiresAt}};
  return {status: 200, rec};
}

/** 읽기 — 번호 모양이 틀리면 400 · 없으면 404 · 기간이 지났으면 410 · 사진이 있으면 주소와 가로세로 */
export async function readInvite(store, id, {now = new Date()} = {}) {
  const r = await liveRecord(store, id, now);
  if (!r.rec) return r;
  const rec = r.rec;
  return {status: 200, body: {to: rec.to, from: rec.from, message: rec.message, createdAt: rec.createdAt, expiresAt: rec.expiresAt,
    photo: rec.photo ? {src: '/api/invite?photo=' + id, w: rec.photo.w, h: rec.photo.h} : null}};
}

/** 사진 읽기 — 초대장이 살아 있을 때만(기간이 지나면 사진도 410) */
export async function readPhoto(store, id, {now = new Date()} = {}) {
  const r = await liveRecord(store, id, now);
  if (!r.rec) return r;
  if (!r.rec.photo) return {status: 404, body: {error: 'no_photo'}};
  const bytes = await store.get(photoKey(id), {type: 'arrayBuffer'});
  if (!bytes) return {status: 404, body: {error: 'no_photo'}};
  return {status: 200, bytes};
}

/** 요청 하나 — GET ?id= 읽기 · GET ?photo= 사진 · POST(같은 사이트에서만 · JSON · 글만 4KB · 사진은 열쇠가 맞을 때 1.1MB까지) 만들기 · 그 밖 405 */
export async function handleInvite(req, {store, now = () => new Date(), makeId = newId, ownerHash = OWNER_KEY_SHA256} = {}) {
  try {
    const url = new URL(req.url);
    if (req.method === 'GET') {
      if (url.searchParams.has('photo')) {
        const r = await readPhoto(store, url.searchParams.get('photo'), {now: now()});
        return r.bytes ? new Response(r.bytes, {status: 200, headers: PHOTO_HEAD}) : json(r.status, r.body);
      }
      const r = await readInvite(store, url.searchParams.get('id'), {now: now()}); return json(r.status, r.body);
    }
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'}); // 다른 사이트의 화면이 대신 만들지 못하게
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      const owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash), limit = owner ? LIMITS.photoBody : LIMITS.body;
      if (Number(req.headers.get('content-length') ?? 0) > limit) return json(413, {error: 'too_large'});
      const text = await req.text();
      if (new TextEncoder().encode(text).length > limit) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(text); } catch { return json(400, {error: 'bad_json'}); }
      const r = await createInvite(store, body, {now: now(), makeId, owner});
      return json(r.status, r.body);
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch (e) {
    return json(500, {error: 'server'});
  }
}

/** 시험 · 로컬용 메모리 저장소(넷리파이 Blobs 와 같은 넷) */
export function memoryStore() {
  const m = new Map();
  return {
    async get(key, opts) { const v = m.get(key); if (v == null) return null; if (opts?.type === 'json') return JSON.parse(v); if (opts?.type === 'arrayBuffer') return typeof v === 'string' ? new TextEncoder().encode(v).buffer : v.slice(0); return v; },
    async set(key, value, opts) { if (opts?.onlyIfNew && m.has(key)) return {modified: false}; m.set(key, value instanceof ArrayBuffer ? value.slice(0) : value); return {modified: true}; },
    async setJSON(key, value, opts) { if (opts?.onlyIfNew && m.has(key)) return {modified: false}; m.set(key, JSON.stringify(value)); return {modified: true}; },
    async delete(key) { m.delete(key); },
    _map: m,
  };
}
