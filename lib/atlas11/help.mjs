/**
 * 돌이 · 고객센터 — 서버 쪽 셈 한 곳(넷리파이 함수 functions/atlas11/help.mjs 가 부름 · 경로 /api/help · /api/help/*)
 *   사장님 2026-10-21(서울) 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간이 있으면 좋울것 같아 … 구글과잡스라면 그리고 나라면 … 섹시하게 만들어」
 *   · 23:05 말투 둘 · 23:09 「아 해 섹시하게」(차례 ③ 고객센터 — 간결하게)
 *   한 줄: 한마디(좋았어요 · 바라요 · 안 돼요)와 물음을 받아 돌이 만드는 사람(사장님 열쇠 x-atlas-owner)이 읽고 답함 · 답은 물은 기기에서만 봄
 *   · 보낸 기기 = 고객센터 열쇠(무작위 32바이트 · 그 기기 localStorage atlas:help:dev) — 저장소에는 SHA-256 만 · 이름 · 전화번호 · 이메일은 받지 않음(연락처 꼴이면 빼고 보내 달라고 함)
 *   · 사장님이 「모두에게 보이기」를 고른 물음과 답만 「많이 묻는 것」에 보임(물은 사람 표시 없음 · 물음 글은 사장님이 다듬을 수 있음)
 *   · 두는 기간 1년(지난 글은 읽을 때 지움) · 보낸 사람은 「지우기」로 언제든 지움 · 사장님도 지울 수 있음
 *   · 너무 잦으면 막음: 한 기기 10분 5개 · 하루 20개 · 사이트 모두 하루 400개
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get · setJSON · delete · list 넷만 씀(시험은 메모리 저장소 — letter.mjs memoryStore)
 * 저장소 열쇠: i/<번호> 글 · d/<기기 해시>/<번호> 기기 표 · p/<번호> 모두에게 보이는 물음과 답 · r/<서울 날짜>/<기기 해시> · r/<서울 날짜>/all 잦기
 */
import {randomBytes, createHash} from 'node:crypto';
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';
import {LIM, KINDS, TONES, VOICES, DEV_RE, ID_RE, cleanText, contactOf, pageOf} from '../../site/next/help-rule.js';

export const HELP_SCHEMA = 'atlas11-help-1';
export const HELP_STORE = 'atlas11-help-v1';
export const CAP = Object.freeze({body: 6144, answer: 1000, pubQ: 200, mine: 50, all: 300, per10m: 5, perDay: 20, dayAll: 400, keepDays: 365});
export {LIM, KINDS, TONES, VOICES, DEV_RE, ID_RE, cleanText, contactOf, pageOf};

const KST = 9 * 3600e3;
export const sha = s => createHash('sha256').update(String(s), 'utf8').digest('hex');
const seoulDay = ms => new Date(ms + KST).toISOString().slice(0, 10);
/** 글 번호 — 때(36진 9자 · 차례대로 늘어섬) + 무작위 12자 */
export const newId = ms => Math.floor(ms).toString(36).padStart(9, '0') + '-' + randomBytes(9).toString('base64url');

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});
const R = (status, body) => ({status, body});
const keysOf = async (store, prefix) => ((await store.list({prefix}))?.blobs ?? []).map(b => b.key);
const getJ = (store, key) => store.get(key, {type: 'json'}).catch(() => null);
/** 여럿을 스무 개씩 나눠 받음 */
async function getMany(store, keys) {
  const out = [];
  for (let i = 0; i < keys.length; i += 20) out.push(...(await Promise.all(keys.slice(i, i + 20).map(k => getJ(store, k)))));
  return out;
}
const old = (it, nowMs) => !it?.at || nowMs - Date.parse(it.at) > CAP.keepDays * 864e5;
async function dropItem(store, it) {
  await Promise.all([store.delete('i/' + it.id), it.dev ? store.delete(`d/${it.dev}/${it.id}`) : null, store.delete('p/' + it.id)].filter(Boolean));
}
/** 보낸 사람에게 보이는 꼴(기기 해시 없음) */
const forMe = it => ({id: it.id, kind: it.kind, tone: it.tone ?? null, voice: it.voice, text: it.text, at: it.at, status: it.status, answer: it.answer ?? null, answeredAt: it.answeredAt ?? null});

/** 보내기 — 한마디 또는 물음 */
export async function send(store, dev, body, now) {
  const kind = KINDS.includes(body?.kind) ? body.kind : null;
  if (!kind) return R(400, {error: 'kind'});
  const tone = kind === 'note' ? (TONES.includes(body?.tone) ? body.tone : null) : null;
  if (kind === 'note' && !tone) return R(400, {error: 'tone'});
  if (body?.agree !== true) return R(400, {error: 'agree'});
  const text = cleanText(body?.text);
  if (Array.from(text).length < LIM.min) return R(400, {error: 'short'});
  const what = contactOf(text);
  if (what) return R(422, {error: 'contact', what});
  const t = now.getTime(), day = seoulDay(t), rk = `r/${day}/${dev}`, ak = `r/${day}/all`;
  const [mine, all] = await Promise.all([getJ(store, rk), getJ(store, ak)]);
  const ts = Array.isArray(mine?.ts) ? mine.ts.filter(x => Number.isFinite(x) && x <= t) : [];
  if (ts.length >= CAP.perDay) return R(429, {error: 'day'});
  if (ts.filter(x => t - x < 10 * 60e3).length >= CAP.per10m) return R(429, {error: 'slow'});
  if ((all?.n ?? 0) >= CAP.dayAll) return R(429, {error: 'busy'});
  const id = newId(t), at = now.toISOString();
  const item = {schema: HELP_SCHEMA, id, kind, tone, voice: VOICES.includes(body?.voice) ? body.voice : 'easy', text, page: pageOf(body?.page), at, dev, status: 'new', answer: null, answeredAt: null, public: false};
  await store.setJSON('i/' + id, item);
  await store.setJSON(`d/${dev}/${id}`, {at});
  await Promise.all([store.setJSON(rk, {ts: [...ts, t]}), store.setJSON(ak, {n: (all?.n ?? 0) + 1})]);
  return R(200, {ok: true, id, at});
}

/** 내 글 — 새것부터 50개 · 1년 지난 글은 지움 */
export async function mine(store, dev, now) {
  const ids = (await keysOf(store, `d/${dev}/`)).map(k => k.slice(k.lastIndexOf('/') + 1)).filter(x => ID_RE.test(x)).sort().reverse().slice(0, CAP.mine);
  const items = await getMany(store, ids.map(x => 'i/' + x)), out = [], t = now.getTime();
  for (let i = 0; i < ids.length; i++) {
    const it = items[i];
    if (!it || it.dev !== dev) { await store.delete(`d/${dev}/${ids[i]}`); continue; } // 사장님이 지운 글의 기기 표
    if (old(it, t)) { await dropItem(store, it); continue; }
    out.push(forMe(it));
  }
  return out;
}

/** 내 글 지우기 — 내 기기 글만(남의 번호면 없는 것과 같게 404) */
export async function forget(store, dev, id) {
  if (typeof id !== 'string' || !ID_RE.test(id)) return R(400, {error: 'id'});
  const it = await getJ(store, 'i/' + id);
  if (!it || it.dev !== dev) return R(404, {error: 'not_found'});
  await dropItem(store, it);
  return R(200, {ok: true});
}

/** 많이 묻는 것 — 사장님이 모두에게 보이기로 고른 물음과 답 */
export async function faq(store) {
  const keys = await keysOf(store, 'p/'), rows = await getMany(store, keys);
  return rows.filter(r => r && typeof r.q === 'string' && typeof r.a === 'string').sort((a, b) => String(b.at).localeCompare(String(a.at))).map(r => ({id: r.id, q: r.q, a: r.a, at: r.at}));
}

/** 사장님 — 모든 글(새것부터 300개) · 수 */
export async function all(store, now) {
  const keys = (await keysOf(store, 'i/')).sort().reverse(), t = now.getTime(), items = [];
  for (const it of await getMany(store, keys)) {
    if (!it?.id) continue;
    if (old(it, t)) { await dropItem(store, it); continue; }
    items.push(it);
  }
  const counts = {all: items.length, fresh: items.filter(x => x.status === 'new').length, note: items.filter(x => x.kind === 'note').length, ask: items.filter(x => x.kind === 'ask').length, waiting: items.filter(x => x.kind === 'ask' && !x.answer).length};
  return {counts, items: items.slice(0, CAP.all).map(it => ({...forMe(it), page: it.page ?? '', public: !!it.public}))};
}

/** 사장님 — 답하기 · 읽음 · 지우기 */
export async function ownerAct(store, body, now) {
  const id = body?.id;
  if (typeof id !== 'string' || !ID_RE.test(id)) return R(400, {error: 'id'});
  const it = await getJ(store, 'i/' + id);
  if (!it) return R(404, {error: 'not_found'});
  if (body.op === 'drop') { await dropItem(store, it); return R(200, {ok: true}); }
  if (body.op === 'read') { if (it.status === 'new') await store.setJSON('i/' + id, {...it, status: 'read'}); return R(200, {ok: true}); }
  // answer
  const answer = cleanText(body.answer, CAP.answer);
  if (Array.from(answer).length < LIM.min) return R(400, {error: 'short'});
  const pub = body.public === true, at = now.toISOString();
  const next = {...it, answer, answeredAt: at, status: 'answered', public: pub};
  await store.setJSON('i/' + id, next);
  if (pub) {
    const q = cleanText(typeof body.pubQ === 'string' && body.pubQ.trim() ? body.pubQ : it.text, CAP.pubQ);
    await store.setJSON('p/' + id, {schema: HELP_SCHEMA, id, q, a: answer, at});
  } else await store.delete('p/' + id);
  return R(200, {ok: true, answeredAt: at});
}

export async function handleHelp(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256} = {}) {
  try {
    const url = new URL(req.url), t = now(), owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash);
    const key = req.headers.get('x-help-key'), dev = typeof key === 'string' && DEV_RE.test(key) ? sha(key) : null;
    const sub = url.pathname.replace(/^\/api\/help\/?/, '');
    if (req.method === 'GET') {
      if (sub === 'faq') return json(200, {items: await faq(store)});
      if (sub === 'mine') return dev ? json(200, {items: await mine(store, dev, t)}) : json(401, {error: 'key'});
      if (sub === 'all') return owner ? json(200, await all(store, t)) : json(403, {error: 'owner_only'});
      return json(404, {error: 'not_found'});
    }
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'});
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > CAP.body) return json(413, {error: 'too_large'});
      const raw = await req.text();
      if (new TextEncoder().encode(raw).length > CAP.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(raw); } catch { return json(400, {error: 'bad_json'}); }
      const op = body?.op;
      if (op === 'send') { if (!dev) return json(401, {error: 'key'}); const r = await send(store, dev, body, t); return json(r.status, r.body); }
      if (op === 'forget') { if (!dev) return json(401, {error: 'key'}); const r = await forget(store, dev, body.id); return json(r.status, r.body); }
      if (['answer', 'read', 'drop'].includes(op)) { if (!owner) return json(403, {error: 'owner_only'}); const r = await ownerAct(store, body, t); return json(r.status, r.body); }
      return json(400, {error: 'bad_op'});
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch {
    return json(500, {error: 'server'});
  }
}
