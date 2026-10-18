/**
 * ATLAS 11 · 편지 여는 밤 — 서버 쪽 셈 한 곳(넷리파이 함수 functions/atlas11/letter.mjs 가 이것을 부른다 · 경로 /api/letter)
 *   사장님 2026-10-16(싱가포르) 22:03 「아틀란스 커뮤니티도 만들어봐 … 양방향 커무니티」 · 2026-10-17 00:45 「그림보다 100배 더 좋게 … 잡스라면」
 *   · 01:14 「좋아!가 매우 낮아 매우 높게 … 재밌게 … 흥미나개 색시하게 아름답게」 · 01:29 「그래 이제 만들어봐」
 *   한 줄: 월요일부터 쓰고(봉인) 금요일 밤 8시(서울)에 다 함께 연다 — 봉인 중에는 아무도(쓴 사람 빼고) 못 읽는다 → 소문으로 값을 흔드는 길이 없다
 *   · 들어오는 문 = 초대장(무작위 96비트 · 16자) — 사장님(사진 열쇠 x-atlas-owner · invite.mjs 와 같은 열쇠)이 만들고, 회원은 셋씩 받는다(친구 3명 소개와 같은 수)
 *   · 회원 = 별명 + 회원 열쇠(무작위 256비트 · 그 기기에만) — 이름 · 전화번호 · 이메일은 받지 않는다 · 저장소에는 열쇠의 SHA-256 만
 *   · 한 사람 한 주 한 통 · 열린 편지에만 배웠어요 · 한 줄 답(한 사람 한 번) · 돌아보기(쓴 사람 한 번) · 신고(하나라도 있으면 먼저 가림 — 사장님이 보고 되살림)
 *   · 사고팔기 말 · 부추기는 말 · 리딩방 말 · 소문 말 · 연락처 · 바깥 고리 · 거친 말 · 사이트에서 쓰지 않는 말은 봉인 전에 막는다(목록 한 곳 site/next/words.js — 화면 letter.js 도 같은 파일)
 *   · 시험판(닫힌 시험): 열린 편지는 회원만 읽는다. 회원 아닌 사람은 수만 본다
 *   · 카카오(사장님 2026-10-18 order-0015 [4] 8 「편지 여는 밤 문은 지금처럼 초대장으로만 연다. 카카오 회원이 초대장을 쓰면 그 회원에 붙여라」): 들어오기(join)에서만
 *     kakaoOf(req)(= lib/atlas11/kakao.mjs kakaoMemberOf)로 「지금 카카오 회원인가」를 물어 회원이면 편지 회원 기록(m/…)에 그 회원 표(kakao)를 붙임 — 카카오가 꺼져 있거나 회원이 아니면 오늘과 같음
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get · setJSON · delete · list 넷만 쓴다(시험은 메모리 저장소로).
 */
import {randomBytes, createHash, timingSafeEqual} from 'node:crypto';
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';
import {BAD, OKW, badWord} from '../../site/next/words.js'; // 막는 말 한 곳(넷리파이 함수 묶음에 같이 들어감 — deploy_netlify.mjs stageFunctions 가 상대 경로를 따라 옮김)

export const LETTER_SCHEMA = 'atlas11-letter-1';
export const LETTER_STORE = 'atlas11-letters-v1';
export const LIM = Object.freeze({nick: 12, text: 100, look: 60, reply: 40, name: 20, body: 4096, mint: 20, invites: 3});
const KST = 9 * 3600e3, WEEK = 7 * 864e5;
export const CODE_RE = /^[A-Za-z0-9_-]{16}$/, ID_RE = /^[A-Za-z0-9_-]{22}$/, KEY_RE = /^[A-Za-z0-9_-]{43}$/, WEEK_RE = /^\d{4}-\d{2}-\d{2}$/;
/** 카카오 회원 표(lib/atlas11/kakao-store.mjs memberHash · 서버 비밀값으로 만든 43자) — 이 꼴이 아니면 붙이지 않음 */
const KK_RE = /^[A-Za-z0-9_-]{43}$/;
/** 카카오 쪽 답을 기다리는 가장 긴 때(ms) — 넘기면 카카오 회원이 아닌 것으로 보고 오늘과 같은 길로 들어옴 */
const KAKAO_WAIT_MS = 3000;

/** 막는 말 — 한 곳 site/next/words.js(사장님 2026-10-17 21:10 「거르는 말과 쓰지 않을 말을 words.js 한 곳에 모아 같이 써라」)
 *  화면 letter.js · 보내기 글상자 p-share.js 도 같은 파일을 부른다 · badWord = 걸리면 [갈래, 낱말] · 아니면 null — 띄어쓰기를 빼고 봄(「사 세 요」도 걸림) */
export {BAD, OKW, badWord};

export const newId = (n = 16) => randomBytes(n).toString('base64url'); // 16바이트 → 22자 · 12바이트 → 16자 · 32바이트 → 43자
export const sha = s => createHash('sha256').update(String(s), 'utf8').digest('hex');
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]/g;
const cut = (s, n) => Array.from(s).slice(0, n).join('');
/** 한 줄 글 — 조종 문자 · 줄 바꿈을 지우고 n 글자까지 */
export function clean(v, n) {
  if (typeof v !== 'string') return '';
  return cut(v.normalize('NFC').replace(CTRL, '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim(), n);
}

/** 여는 밤 = 금요일 20:00(서울) — 그 순간보다 앞이면 그 주에 봉인됨 · 주 이름 = 그 금요일 날짜 */
export function weekOf(nowMs) {
  const k = new Date(nowMs + KST), add = (5 - k.getUTCDay() + 7) % 7;
  let t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + add, 20) - KST;
  if (t <= nowMs) t += WEEK;
  return {id: new Date(t + KST).toISOString().slice(0, 10), opensAt: t};
}
/** 주 이름 → 여는 시각(ms) · 금요일이 아니거나 꼴이 틀리면 null */
export function opensAtOf(id) {
  if (typeof id !== 'string' || !WEEK_RE.test(id)) return null;
  const [y, m, d] = id.split('-').map(Number), t = Date.UTC(y, m - 1, d, 20) - KST, k = new Date(t + KST);
  return k.getUTCDay() === 5 && k.toISOString().slice(0, 10) === id ? t : null;
}
const prevWeek = id => new Date(opensAtOf(id) - WEEK + KST).toISOString().slice(0, 10);

/** 무엇에 대해 — 지수 둘(코스피 · 코스닥) 또는 회사(번호 6자 · 이름) */
export function cleanWhat(w) {
  if (w?.kind === 'idx' && (w.code === 'KOSPI' || w.code === 'KOSDAQ')) return {kind: 'idx', code: w.code, name: w.code === 'KOSPI' ? '코스피' : '코스닥'};
  if (w?.kind === 'co' && typeof w.code === 'string' && /^[0-9A-Z]{6}$/.test(w.code)) {
    const name = clean(w.name, LIM.name); if (!name || badWord(name)) return null;
    return {kind: 'co', code: w.code, name};
  }
  return null;
}

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});
const R = (status, body) => ({status, body});
const keysOf = async (store, prefix) => ((await store.list({prefix}))?.blobs ?? []).map(b => b.key);

/** 초대장 만들기 — from = 'owner' 또는 회원 번호 · 같은 번호가 있으면 다시(세 번) */
export async function mintCode(store, from, nowIso) {
  for (let i = 0; i < 3; i++) {
    const code = newId(12), r = await store.setJSON('inv/' + code, {schema: LETTER_SCHEMA, from, at: nowIso}, {onlyIfNew: true});
    if (r?.modified !== false) return code;
  }
  throw new Error('busy');
}

/** 회원 열쇠 → 회원 기록(없거나 꼴이 틀리면 null) */
export async function memberOf(store, key) {
  if (typeof key !== 'string' || !KEY_RE.test(key)) return null;
  const id = await store.get('k/' + sha(key), {type: 'json'});
  if (!id?.member || !ID_RE.test(id.member)) return null;
  const m = await store.get('m/' + id.member, {type: 'json'});
  return m?.schema === LETTER_SCHEMA ? m : null;
}

/** 들어오기 — 초대장(한 번만 · 먼저 「씀」 표시를 onlyIfNew 로 잡음) + 별명(겹치면 안 됨) → 회원 열쇠(한 번만 보여 줌) · 새 초대장 셋
 *  카카오 회원이 초대장을 쓰면(사장님 2026-10-18 order-0015 [4] 8 「카카오 회원이 초대장을 쓰면 그 회원에 붙여라」) kakao = 그 회원 표 → 편지 회원 기록에 붙임 · 문은 그대로 초대장으로만 열림
 *  (회원이 아니거나 카카오가 꺼져 있으면 kakao = null → 기록 · 답이 오늘과 한 글자도 안 다름) */
export async function join(store, body, now, {kakao = null} = {}) {
  const code = typeof body?.code === 'string' ? body.code : '', nick = clean(body?.nick, LIM.nick), kk = typeof kakao === 'string' && KK_RE.test(kakao) ? kakao : null;
  if (!CODE_RE.test(code)) return R(400, {error: 'bad_code'});
  if (!nick || Array.from(nick).length < 2) return R(400, {error: 'bad_nick'});
  const bad = badWord(nick); if (bad) return R(400, {error: 'word', group: bad[0], word: bad[1]});
  const inv = await store.get('inv/' + code, {type: 'json'});
  if (!inv) return R(404, {error: 'no_code'});
  const nk = 'n/' + sha(nick.toLowerCase());
  if (await store.get(nk, {type: 'json'})) return R(409, {error: 'nick_taken'});
  const use = await store.setJSON('invu/' + code, {at: now.toISOString()}, {onlyIfNew: true});
  if (use?.modified === false) return R(409, {error: 'code_used'});
  const id = newId(16), key = newId(32), at = now.toISOString();
  const nr = await store.setJSON(nk, {member: id}, {onlyIfNew: true});
  if (nr?.modified === false) { await store.delete('invu/' + code); return R(409, {error: 'nick_taken'}); }
  const invites = [];
  for (let i = 0; i < LIM.invites; i++) invites.push(await mintCode(store, id, at));
  await store.setJSON('m/' + id, {schema: LETTER_SCHEMA, id, nick, at, from: inv.from, code, invites, ...(kk ? {kakao: kk} : {})});
  await store.setJSON('k/' + sha(key), {member: id});
  await store.setJSON('inv/' + code, {...inv, usedBy: id, usedAt: at});
  return R(201, {key, nick, invites, ...(kk ? {kakao: true} : {})});
}

/** 지금 카카오 회원인가(들어오기 때만 부름) — fn(req) = 회원 표 | null · 카카오가 꺼져 있거나 · 회원이 아니거나 · 못 부르거나 · 느리거나 · 깨져도 null = 오늘과 같은 길
 *  (편지 문은 늘 초대장으로만 열림 — 카카오 회원이라고 문이 열리지 않음) */
async function kakaoMember(fn, req, waitMs) {
  if (typeof fn !== 'function') return null;
  let timer;
  try {
    const v = await Promise.race([Promise.resolve().then(() => fn(req)), new Promise(res => { timer = setTimeout(() => res(null), waitMs); })]);
    return typeof v === 'string' && KK_RE.test(v) ? v : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

/** 카카오 회원이 쓴 초대장 · 편지 회원에서 그 회원 표를 뗌(카카오 탈퇴 · 지워 달라는 말에) — 뗀 편지 회원 수 · 편지 글은 그대로(지우기는 따로 말씀하실 때) */
export async function detachKakao(store, mh) {
  if (typeof mh !== 'string' || !KK_RE.test(mh)) return 0;
  let n = 0;
  for (const k of await keysOf(store, 'm/')) {
    const m = await store.get(k, {type: 'json'});
    if (m?.schema === LETTER_SCHEMA && m.kakao === mh) { const {kakao, ...rest} = m; await store.setJSON(k, rest); n++; }
  }
  return n;
}

/** 봉인 — 한 사람 한 주 한 통(onlyIfNew) · 막는 말 · 무엇에 대해 */
export async function seal(store, me, body, now) {
  const text = clean(body?.text, LIM.text), what = cleanWhat(body?.what);
  if (!what) return R(400, {error: 'bad_what'});
  if (Array.from(text).length < 5) return R(400, {error: 'short'});
  const bad = badWord(text); if (bad) return R(400, {error: 'word', group: bad[0], word: bad[1]});
  const w = weekOf(now.getTime()), rec = {schema: LETTER_SCHEMA, week: w.id, member: me.id, nick: me.nick, what, text, at: now.toISOString()};
  const r = await store.setJSON(`w/${w.id}/${me.id}`, rec, {onlyIfNew: true});
  if (r?.modified === false) return R(409, {error: 'already', week: w.id, opensAt: new Date(w.opensAt).toISOString()});
  return R(201, {week: w.id, opensAt: new Date(w.opensAt).toISOString()});
}

/** 열린 편지 하나에 붙는 것 — 배웠어요 수 · 한 줄 답 · 신고 여부 · 쓴 사람의 편지 수(맞은 것만 골라 자랑 못 하게) */
async function decorate(store, week, rec, meId, owner) {
  const base = `${week}/${rec.member}`;
  const [lk, rk, xk, mine] = await Promise.all([keysOf(store, 'l/' + base + '/'), keysOf(store, 'r/' + base + '/'), keysOf(store, 'x/' + base + '/'), keysOf(store, 'w/')]);
  const hidden = xk.length > 0;
  if (hidden && !owner) return null;
  const replies = [];
  for (const k of rk) { const r = await store.get(k, {type: 'json'}); if (r?.text) replies.push({nick: r.nick, text: r.text, at: r.at}); }
  replies.sort((a, b) => a.at < b.at ? -1 : 1);
  const letters = mine.filter(k => k.endsWith('/' + rec.member) && k.split('/')[1] <= week).length;
  return {id: rec.member, nick: rec.nick, what: rec.what, text: rec.text, at: rec.at, look: rec.look ?? null, learned: lk.length,
    learnedByMe: !!meId && lk.includes('l/' + base + '/' + meId), replies, repliedByMe: !!meId && rk.includes('r/' + base + '/' + meId),
    reportedByMe: !!meId && xk.includes('x/' + base + '/' + meId), letters, ...(owner ? {hidden, reports: xk.length} : {})};
}

/** 그 주의 모습 — 봉인 중: 수 · 무엇에 대해 쓴 수만(회원은 제 편지도) · 열림: 회원(과 사장님)만 편지 모두 */
export async function stateOf(store, {week, me, owner, now}) {
  const cur = weekOf(now.getTime()), id = week ?? cur.id, opensAt = opensAtOf(id);
  if (opensAt == null) return R(400, {error: 'bad_week'});
  const keys = await keysOf(store, `w/${id}/`), recs = [];
  for (const k of keys) { const r = await store.get(k, {type: 'json'}); if (r?.schema === LETTER_SCHEMA) recs.push(r); }
  const open = now.getTime() >= opensAt, by = {};
  for (const r of recs) { const n = r.what?.name ?? '?'; by[n] = (by[n] ?? 0) + 1; }
  const subjects = Object.entries(by).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 5).map(([name, n]) => ({name, n}));
  const out = {week: id, opensAt: new Date(opensAt).toISOString(), now: now.toISOString(), current: cur.id, prev: prevWeek(cur.id), open, count: recs.length, subjects, member: !!me, owner: !!owner};
  if (me) {
    const mineRec = recs.find(r => r.member === me.id);
    out.mine = mineRec ? {what: mineRec.what, text: mineRec.text, at: mineRec.at, look: mineRec.look ?? null} : null;
    const used = await Promise.all((me.invites ?? []).map(c => store.get('invu/' + c, {type: 'json'})));
    out.me = {nick: me.nick, invites: (me.invites ?? []).map((c, i) => ({code: c, used: !!used[i]})),
      weeks: (await keysOf(store, 'w/')).filter(k => k.endsWith('/' + me.id)).map(k => k.split('/')[1]).sort()};
  }
  if (open && (me || owner)) {
    const list = [];
    for (const r of recs) { const d = await decorate(store, id, r, me?.id, owner); if (d) list.push(d); }
    list.sort((a, b) => b.learned - a.learned || (a.at < b.at ? -1 : 1));
    out.letters = list;
  } else if (open) out.membersOnly = true;
  return R(200, out);
}

/** 열린 편지에 하는 일 — 배웠어요 · 한 줄 답 · 신고 · 돌아보기(쓴 사람) */
export async function act(store, me, body, now) {
  const week = body?.week, author = body?.author, opensAt = opensAtOf(week);
  if (opensAt == null) return R(400, {error: 'bad_week'});
  if (now.getTime() < opensAt) return R(403, {error: 'sealed'});
  if (typeof author !== 'string' || !ID_RE.test(author)) return R(400, {error: 'bad_author'});
  const lk = `w/${week}/${author}`, rec = await store.get(lk, {type: 'json'});
  if (!rec) return R(404, {error: 'no_letter'});
  const base = `${week}/${author}/${me.id}`, at = now.toISOString();
  if (body.op === 'learn') { if (author === me.id) return R(400, {error: 'self'}); await store.setJSON('l/' + base, {at}, {onlyIfNew: true}); return R(200, {ok: true}); }
  if (body.op === 'report') { if (author === me.id) return R(400, {error: 'self'}); await store.setJSON('x/' + base, {at, nick: me.nick}, {onlyIfNew: true}); return R(200, {ok: true, hidden: true}); }
  if (body.op === 'reply') {
    const text = clean(body?.text, LIM.reply); if (Array.from(text).length < 2) return R(400, {error: 'short'});
    const bad = badWord(text); if (bad) return R(400, {error: 'word', group: bad[0], word: bad[1]});
    const r = await store.setJSON('r/' + base, {nick: me.nick, text, at}, {onlyIfNew: true});
    return r?.modified === false ? R(409, {error: 'already'}) : R(201, {ok: true});
  }
  if (body.op === 'look') {
    if (author !== me.id) return R(403, {error: 'not_mine'});
    if (rec.look) return R(409, {error: 'already'});
    const text = clean(body?.text, LIM.look); if (Array.from(text).length < 2) return R(400, {error: 'short'});
    const bad = badWord(text); if (bad) return R(400, {error: 'word', group: bad[0], word: bad[1]});
    await store.setJSON(lk, {...rec, look: text, lookAt: at}); return R(200, {ok: true});
  }
  return R(400, {error: 'bad_op'});
}

/** 사장님 일 — 초대장 만들기 · 가린 편지 되살리기 · 지우기 */
export async function ownerAct(store, body, now) {
  if (body.op === 'mint') {
    const n = Math.max(1, Math.min(LIM.mint, Number(body.n) || 1)), at = now.toISOString(), codes = [];
    for (let i = 0; i < n; i++) codes.push(await mintCode(store, 'owner', at));
    return R(201, {codes});
  }
  const week = body?.week, author = body?.author;
  if (opensAtOf(week) == null || typeof author !== 'string' || !ID_RE.test(author)) return R(400, {error: 'bad_target'});
  if (body.op === 'restore') { for (const k of await keysOf(store, `x/${week}/${author}/`)) await store.delete(k); return R(200, {ok: true}); }
  if (body.op === 'remove') { await store.delete(`w/${week}/${author}`); return R(200, {ok: true}); }
  return R(400, {error: 'bad_op'});
}

/** 요청 하나 — GET ?week= 모습 · POST(같은 사이트 · JSON · 4KB) op = join | seal | learn | reply | report | look | mint | restore | remove
 *  kakaoOf(req) = 「지금 카카오 회원인가」(lib/atlas11/kakao.mjs kakaoMemberOf 를 함수 파일이 넘김 · 시험은 가짜) → 회원 표 | null — 들어오기(join)에서만 부름 */
export async function handleLetter(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256, kakaoOf = null, kakaoWaitMs = KAKAO_WAIT_MS} = {}) {
  try {
    const url = new URL(req.url), t = now(), owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash);
    const me = await memberOf(store, req.headers.get('x-atlas-letter'));
    if (req.method === 'GET') {
      const week = url.searchParams.get('week'), r = await stateOf(store, {week: week || null, me, owner, now: t});
      return json(r.status, r.body);
    }
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'});
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > LIM.body) return json(413, {error: 'too_large'});
      const text = await req.text();
      if (new TextEncoder().encode(text).length > LIM.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(text); } catch { return json(400, {error: 'bad_json'}); }
      const op = body?.op;
      if (op === 'join') { const r = await join(store, body, t, {kakao: await kakaoMember(kakaoOf, req, kakaoWaitMs)}); return json(r.status, r.body); }
      if (['mint', 'restore', 'remove'].includes(op)) { if (!owner) return json(403, {error: 'owner_only'}); const r = await ownerAct(store, body, t); return json(r.status, r.body); }
      if (!me) return json(401, {error: 'member_only'});
      if (op === 'seal') { const r = await seal(store, me, body, t); return json(r.status, r.body); }
      if (['learn', 'reply', 'report', 'look'].includes(op)) { const r = await act(store, me, body, t); return json(r.status, r.body); }
      return json(400, {error: 'bad_op'});
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch (e) {
    return json(500, {error: 'server'});
  }
}

/** 시험 · 로컬용 메모리 저장소(넷리파이 Blobs 와 같은 넷 + list) */
export function memoryStore() {
  const m = new Map();
  return {
    async get(key, opts) { const v = m.get(key); if (v == null) return null; return opts?.type === 'json' ? JSON.parse(v) : v; },
    async setJSON(key, value, opts) { if (opts?.onlyIfNew && m.has(key)) return {modified: false}; m.set(key, JSON.stringify(value)); return {modified: true}; },
    async delete(key) { m.delete(key); },
    async list(opts) { const p = opts?.prefix ?? ''; return {blobs: [...m.keys()].filter(k => k.startsWith(p)).sort().map(key => ({key, etag: ''})), directories: []}; },
    _map: m,
  };
}
