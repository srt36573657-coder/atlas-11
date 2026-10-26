#!/usr/bin/env node
// 고객센터 새 글을 사장님 카톡으로 — 깃허브 작업 쪽(사장님 2026-10-22(서울) 07:48 「여기에 글을 남기면 카톡 게시물말고 다른 방한나더 별로 만들어 내 카톡으로 오게해라」
//   · 08:44 「… 최고에 방식을 찾아서 하라」 · 명령문 docs/design/helpkakao-2026-10-22/order-0748.txt)
//   길: 일하는 방(매시 · scripts/atlas11/help/room.mjs) → 깃허브 작업 .github/workflows/atlas11-help-forward.yml(이 파일 --fetch)
//       → 넷리파이 저장소(atlas11-help-v1)의 「보낸 표시」 뒤 새 글만 꺼냄 → 방이 준 열쇠로 잠가 알림 줄(annotations)로 돌려줌
//       → 방이 풀어 카톡 「나에게 보내기」로 한 통씩 보냄 → 다 보낸 뒤 --ack 로 「여기까지 보냄」(두 번 안 보냄 · 못 보냈으면 다음 시간에 다시)
//   왜 이 길: Claude 예약 방은 aaa7377.com 과 깃허브 묶음 받기가 막힘(scripts/atlas11/jinhwa/read.mjs 머리 · 2026-10-18 확인) · 사장님 열쇠를 쓰지 않음
//   지키는 것: 사람 글은 깃허브 기록에 맨글로 남지 않음(방마다 새 열쇠 X25519 → AES-256-GCM 으로 잠금 · 기록 줄에는 수만) · 기기 표시(해시) · 답 글은 보내지 않음
//             · 글은 한 글자도 바꾸지 않음 · 한 번에 10개까지(남으면 다음 시간) · 카톡 한 통 190자 안(길면 나눔)
//   선물 신청 알림도 같은 길로(사장님 2026-10-25(서울) 15:37 「어 오게 해」 — 물음 「새 신청이 오면 사장님 카톡으로도 알려 드릴까요?」) — 저장소 atlas11-gift-v1 의 새 신청 c/<번호>
//     카톡에는 신청한 때 · 친구 수 · 카톡에서 연 수 · 전화번호 끝 네 자리만(전체 번호는 관리자 화면에서만 · 처리방침 #gift-kakao) · 보낸 표시는 저장소마다 따로(fwd/cursor)
//     방에 돌려주는 last = 고객센터 글 번호(선물 신청이 없을 때 · 예전과 같음) 또는 「<고객센터 번호 또는 빈칸>+<선물 신청 번호>」 — --ack 가 둘을 따로 앞으로 옮김
//   쓰는 법(깃허브 작업): node scripts/atlas11/help/forward.mjs --fetch --pub <방 공개 열쇠 base64> --out sealed.json  (환경 NETLIFY_SITE_ID · NETLIFY_AUTH_TOKEN)
//                         node scripts/atlas11/help/forward.mjs --annotate sealed.json
//                         node scripts/atlas11/help/forward.mjs --ack <글 번호>
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const FWD_SCHEMA = 'atlas11-help-forward-1';
export const HELP_STORE = 'atlas11-help-v1'; // lib/atlas11/help.mjs HELP_STORE 와 같음(이 파일은 따로 돎 — 시험이 맞댐)
export const CURSOR_KEY = 'fwd/cursor';
/** 넘기기 시작 때 — 보낸 표시가 아직 없을 때만 씀 · 처리방침에 「카톡으로도 전해져요」 줄이 사이트에 오른 뒤 글부터
 *  그 전 글은 처리방침에 없던 길이라 보내지 않음(사이트 고객센터에서 그대로 봄) · 올린 직후 보낸 표시를 올린 때로 한 번 옮김(작업 mode=ack · 앞으로만)
 *  이 값은 그 한 번을 잊었을 때의 안전판(2026-10-22 14:00 서울 — 사장님께 말씀드린 올림 때) */
export const FWD_START = '2026-10-22T05:00:00.000Z';
/** 시작 때의 보낸 표시 — 글 번호 앞 9자(때)와 같은 꼴 + 「-」(같은 때 글보다 앞) */
export const startCursor = (iso = FWD_START) => Math.floor(Date.parse(iso)).toString(36).padStart(9, '0') + '-';
export const ID_RE = /^[0-9a-z]{9}-[A-Za-z0-9_-]{12}$/; // site/next/help-rule.js ID_RE 와 같음(시험이 맞댐)
export const MAX_ITEMS = 10, MSG_MAX = 190;

const TONE = {good: '좋았어요', want: '바라요', broken: '안 돼요'};
const PAGE = {home: '첫 화면', f: '첫 화면 목록', why: '매매일지', gdr: '돌이 칸', w: '회사 화면', t: '테마 시계', shorts: '시황', sub: '관심', me: '보유종목', find: '찾기', today: '오늘 시장', gift: '상품권 방', jinhwa: '진화', info: '도움말', up: '업데이트 기록', ch: '업종 채널', i: '업종', s: '받은 카드', cal: '달력', cond: '조건 찾기', surge: '급등'};
const KST = 9 * 3600e3;
/** 「10월 22일 오전 7시 47분」 — 서울 때 */
export function whenKo(iso) {
  const t = Date.parse(iso); if (!Number.isFinite(t)) return '';
  const d = new Date(t + KST), h = d.getUTCHours(), m = d.getUTCMinutes();
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시${m ? ' ' + m + '분' : ''}`;
}
/** 글 하나 → 카톡 글 여러 통(한 통 MSG_MAX 자 안) — 첫 통 = 머리 · 때 · 보던 화면 · 글 앞부분 · 다음 통 = 「이어서 n/m」 */
export function toMessages(it, {max = MSG_MAX} = {}) {
  const kind = it.kind === 'ask' ? '물음' : '한마디' + (TONE[it.tone] ? ' · ' + TONE[it.tone] : '');
  const page = PAGE[it.page] ?? (it.page ? it.page : '');
  const head = `[돌이 고객센터] ${kind}\n${[whenKo(it.at), page ? '보던 화면 ' + page : ''].filter(Boolean).join(' · ')}\n\n`;
  const text = Array.from(String(it.text ?? ''));
  const whole = Array.from(head).length + text.length <= max;
  const first = whole ? text.length : Math.max(20, max - Array.from(head).length - 8); // 나뉘면 끝에 「 (1/n)」 자리
  const parts = [text.slice(0, first).join('')];
  for (let i = first; i < text.length;) { const room = max - 22; parts.push(text.slice(i, i + room).join('')); i += room; }
  if (parts.length === 1) return [head + parts[0]];
  return parts.map((p, i) => (i === 0 ? head + p + ` (1/${parts.length})` : `[돌이 고객센터 · 이어서 ${i + 1}/${parts.length}]\n${p}`));
}
/** 보낸 표시 뒤 새 글만 — 번호 차례(번호 앞 9자 = 때) · 많아야 max 개 · 기기 표시 · 답은 뺌 */
export function pickNew(items, cursor, {max = MAX_ITEMS} = {}) {
  const fresh = items.filter(it => it && typeof it.id === 'string' && ID_RE.test(it.id) && (!cursor || it.id > cursor) && typeof it.text === 'string')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {items: fresh.slice(0, max).map(it => ({id: it.id, kind: it.kind, tone: it.tone ?? null, page: it.page ?? '', at: it.at, text: it.text})), more: Math.max(0, fresh.length - max)};
}

// ───────────── 잠그기 · 풀기(방이 준 공개 열쇠 — 깃허브 기록에는 잠긴 글만) ─────────────
const INFO = Buffer.from('atlas11-help-forward-v1');
const keyOf = (shared, salt) => Buffer.from(crypto.hkdfSync('sha256', shared, salt, INFO, 32));
/** 방 쪽 새 열쇠 한 쌍 — {pub: base64 DER, priv: PEM} */
export function newRoomKey() {
  const {publicKey, privateKey} = crypto.generateKeyPairSync('x25519');
  return {pub: publicKey.export({type: 'spki', format: 'der'}).toString('base64'), priv: privateKey.export({type: 'pkcs8', format: 'pem'})};
}
export function seal(obj, pubB64) {
  const roomPub = crypto.createPublicKey({key: Buffer.from(String(pubB64), 'base64'), format: 'der', type: 'spki'});
  if (roomPub.asymmetricKeyType !== 'x25519') throw Error('열쇠 꼴이 x25519 가 아님');
  const eph = crypto.generateKeyPairSync('x25519'), epk = eph.publicKey.export({type: 'spki', format: 'der'});
  const key = keyOf(crypto.diffieHellman({privateKey: eph.privateKey, publicKey: roomPub}), epk), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv), ct = Buffer.concat([c.update(zlib.gzipSync(Buffer.from(JSON.stringify(obj), 'utf8'), {level: 9})), c.final()]);
  return {v: 1, epk: epk.toString('base64'), iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), ct: ct.toString('base64')};
}
export function open(box, privPem) {
  if (box?.v !== 1) throw Error('잠긴 글 꼴이 아님');
  const epk = Buffer.from(box.epk, 'base64');
  const key = keyOf(crypto.diffieHellman({privateKey: crypto.createPrivateKey(privPem), publicKey: crypto.createPublicKey({key: epk, format: 'der', type: 'spki'})}), epk);
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(box.iv, 'base64'));
  d.setAuthTag(Buffer.from(box.tag, 'base64'));
  return JSON.parse(zlib.gunzipSync(Buffer.concat([d.update(Buffer.from(box.ct, 'base64')), d.final()])).toString('utf8'));
}

// ───────────── 알림 줄(scripts/atlas11/jinhwa/read.mjs 와 같은 꼴 · 이름만 help-fwd-) ─────────────
export const ANN_PREFIX = 'help-fwd-', ANN_CHUNK = 3000, ANN_MAX = 9;
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
export function toAnnotations(obj, {chunk = ANN_CHUNK, max = ANN_MAX} = {}) {
  const b64 = Buffer.from(JSON.stringify(obj), 'utf8').toString('base64'), parts = [];
  for (let i = 0; i < b64.length; i += chunk) parts.push(b64.slice(i, i + chunk));
  if (!parts.length || parts.length > max) throw Error(`너무 큼(조각 ${parts.length}개 · ${max}개까지)`);
  return [`::notice title=${ANN_PREFIX}head::v1 n=${parts.length} len=${b64.length} sha=${sha256(b64)}`, ...parts.map((p, i) => `::notice title=${ANN_PREFIX}${i}::${p}`)];
}
export function fromAnnotations(list) {
  if (!Array.isArray(list)) return {ok: false, why: '알림 목록 꼴이 아님'};
  const mine = list.filter(a => typeof a?.title === 'string' && a.title.startsWith(ANN_PREFIX) && (a.annotation_level ?? 'notice') === 'notice');
  const heads = [...new Set(mine.filter(a => a.title === ANN_PREFIX + 'head').map(a => String(a.message ?? '').trim()))];
  if (heads.length !== 1) return {ok: false, why: heads.length ? '머리 줄이 여럿' : '머리 줄이 없음'};
  const m = /^v1 n=(\d+) len=(\d+) sha=([0-9a-f]{64})$/.exec(heads[0]);
  if (!m) return {ok: false, why: '머리 줄 꼴이 틀림'};
  const n = Number(m[1]), parts = new Map();
  if (n < 1 || n > ANN_MAX) return {ok: false, why: `조각 수가 이상함(${n})`};
  for (const a of mine) {
    const k = /^help-fwd-(\d+)$/.exec(a.title)?.[1]; if (k == null) continue;
    const i = Number(k), msg = String(a.message ?? '').trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(msg)) return {ok: false, why: `조각 ${i} 가 base64 가 아님`};
    if (parts.has(i) && parts.get(i) !== msg) return {ok: false, why: `조각 ${i} 가 둘이고 서로 다름`};
    parts.set(i, msg);
  }
  if (parts.size !== n || [...parts.keys()].some(i => i < 0 || i >= n)) return {ok: false, why: `조각이 모자라거나 남음(${parts.size} / ${n})`};
  const b64 = Array.from({length: n}, (_, i) => parts.get(i)).join('');
  if (b64.length !== Number(m[2]) || sha256(b64) !== m[3]) return {ok: false, why: '길이나 sha256 이 다름'};
  try { return {ok: true, box: JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))}; } catch { return {ok: false, why: 'JSON 이 아님'}; }
}

// ───────────── 저장소(넷리파이 Blobs — 시험은 메모리 저장소) ─────────────
const getJ = (store, key) => store.get(key, {type: 'json'}).catch(() => null);

// ───────────── 선물 신청 알림(사장님 2026-10-25 15:37 「어 오게 해」) ─────────────
export const GIFT_STORE = 'atlas11-gift-v1'; // lib/atlas11/gift.mjs GIFT_STORE 와 같음(시험이 맞댐 · 신청 번호 꼴도 ID_RE 와 같음)
/** 선물 신청 넘기기 시작 때 — 친구 셋 세기가 진짜 사이트에 오른 때(2026-10-25 15:02 서울) 바로 앞 · 그 뒤 신청부터 */
export const GIFT_START = '2026-10-25T06:00:00.000Z';
/** 신청 하나 → 카톡 한 통 — 때 · 친구 수 · 카톡에서 연 수 · 번호 끝 네 자리(전체 번호는 넣지 않음) */
export function giftMessage(c) {
  const n = Number.isInteger(c?.friends) ? c.friends : 0, kk = Number.isInteger(c?.kk) ? c.kk : 0;
  // 「상품권 주세요」(사장님 2026-10-26 16:14 · 16:16) — 받는 분 번호는 없음 · 그분이 사장님께 카톡 · 문자로 보낼 확인 번호 넷만
  if (c?.kind === 'ask') return `[돌이 선물] 상품권 주세요\n${whenKo(c?.at)}\n친구 ${n}명이 열었어요 · 카톡에서 ${kk}명\n확인 번호 ${/^\d{4}$/.test(String(c?.code ?? '')) ? c.code : '????'}\n이 번호를 보내는 분께 상품권을 보내 주세요.`;
  const tail = /^\d{4}$/.test(String(c?.tail ?? '')) ? c.tail : '????';
  return `[돌이 선물] 새 신청이 왔어요\n${whenKo(c?.at)}\n친구 ${n}명이 열었어요 · 카톡에서 ${kk}명\n전화번호 끝 ${tail}\n관리자 화면에서 번호를 보고 카톡 선물을 보내 주세요.`;
}
// ───────────── 친구 셋 알림(사장님 2026-10-26(서울) 14:45 「카촉을 8명 보냈는데 내겐 오지 않아 / 너 해결해」) ─────────────
//   신청 전이라도 한 분이 보낸 주소를 친구 셋 · 여섯 · 아홉 …이 처음 열면 사장님께 한 통(전에는 지인이 선물 받기에서 신청해야만 알림이 갔음)
//   · 꺼낼 때(매시) 연 기록 v/<표>/<기기> 를 표마다 세어 알린 곳(fwd/friends)보다 높은 셋의 배수가 되면 알림 e/<번호> 를 하나 만듦(표마다 그 배수에 한 번)
//   · 알림 번호는 신청 번호와 같은 꼴(만든 때 + 무작위) — 보낸 표시 fwd/cursor 하나로 신청과 함께 차례대로 보냄(못 보냈으면 다음 시간에 다시 · 알림은 다시 만들지 않음)
//   · 카톡에는 때 · 친구 수 · 카톡에서 연 수만(누가 보냈는지 · 번호 · 표 없음)
//   · 그 배수째 친구가 FRIENDS_START 전에 열었으면 알림 없이 알린 곳만 적음 — 그 전 셋은 제 시험 기록(10-25 17:30 · 17:54 · 18:19 · 10-26 14:08)
export const GIFT_PER = 3; // lib/atlas11/gift.mjs RULE.per 와 같음(시험이 맞댐)
export const FRIENDS_KEY = 'fwd/friends', FRIENDS_START = '2026-10-26T05:30:00.000Z';
const V_RE = /^v\/([A-Za-z0-9_-]{16})\/[0-9a-f]{32}$/;
const eventId = ms => Math.floor(ms).toString(36).padStart(9, '0') + '-' + crypto.randomBytes(9).toString('base64url');
/** 친구 알림 하나 → 카톡 한 통 */
export function friendsMessage(e) {
  const n = Number.isInteger(e?.friends) ? e.friends : 0, kk = Number.isInteger(e?.kk) ? e.kk : 0, s = Number.isInteger(e?.step) && e.step > 0 ? e.step : GIFT_PER;
  return `[돌이 선물] 친구 ${s}명이 열었어요\n${whenKo(e?.at)}\n한 분이 보낸 주소를 친구 ${n}명이 열었어요 · 카톡에서 ${kk}명\n그분이 선물 받기에서 신청하면 번호가 함께 와요.`;
}
/** 알림 만들기 — 만든 알림 번호들 · 연 기록을 다 못 읽은 표는 이번에 건너뜀(다음 시간에 다시) */
export async function markFriends(store, {now = new Date(), start = FRIENDS_START, per = GIFT_PER} = {}) {
  const by = new Map();
  for (const b of ((await store.list({prefix: 'v/'}))?.blobs) ?? []) { const m = V_RE.exec(b.key ?? ''); if (m) by.set(m[1], [...(by.get(m[1]) ?? []), b.key]); }
  const saved = await getJ(store, FRIENDS_KEY), marks = saved?.refs && typeof saved.refs === 'object' ? {...saved.refs} : {};
  const made = [], t0 = Date.parse(start);
  let t = now.getTime(), touched = false;
  for (const [ref, keys] of [...by].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
    const step = Math.floor(keys.length / per) * per, had = Number.isInteger(marks[ref]) ? marks[ref] : 0;
    if (step < per || step <= had) continue;
    const rows = (await Promise.all(keys.map(k => getJ(store, k)))).filter(r => r && Number.isFinite(Date.parse(r.at)));
    if (rows.length !== keys.length) continue;
    const at = rows.map(r => Date.parse(r.at)).sort((a, b) => a - b)[step - 1];
    marks[ref] = step; touched = true;
    if (!(at >= t0)) continue;
    const id = eventId(t++);
    await store.setJSON('e/' + id, {schema: 'atlas11-gift-event-1', kind: 'friends', id, ref, at: new Date(at).toISOString(), made: now.toISOString(), friends: keys.length, kk: rows.filter(r => r.kk === true).length, step});
    made.push(id);
  }
  if (touched) await store.setJSON(FRIENDS_KEY, {schema: 'atlas11-gift-friends-1', at: now.toISOString(), refs: marks});
  return made;
}
/** 보낸 표시 뒤 새 신청 · 친구 알림 — {n 보낼 차례 수, more, last 꺼낸 마지막 번호(이미 보낸 신청도 지나감), messages} · 이미 「보냄」인 신청은 알리지 않음
 *  신청(c/)과 친구 알림(e/)은 번호(때)대로 섞어 보냄 · 친구 알림을 못 만들어도 신청 알림은 그대로 */
export async function fetchGift(store, {max = MAX_ITEMS, start = GIFT_START, now = new Date(), friends = true, friendsStart} = {}) {
  if (friends) await markFriends(store, {now, start: friendsStart}).catch(() => null);
  const cur = await getJ(store, CURSOR_KEY), cursor = typeof cur?.id === 'string' && ID_RE.test(cur.id) ? cur.id : startCursor(start);
  const idsOf = async p => (((await store.list({prefix: p}))?.blobs) ?? []).map(b => b.key.slice(2)).filter(x => ID_RE.test(x) && x > cursor).map(id => ({id, p}));
  const all = [...(await idsOf('c/')), ...(await idsOf('e/'))].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const take = all.slice(0, max), rows = await Promise.all(take.map(x => getJ(store, x.p + x.id).then(v => ({p: x.p, v}))));
  const messages = [];
  for (const {p, v} of rows) {
    if (!v?.id || !ID_RE.test(v.id)) continue;
    if (p === 'c/' && v.state === 'wait') messages.push(giftMessage(v));
    else if (p === 'e/' && v.kind === 'friends') messages.push(friendsMessage(v));
  }
  return {n: messages.length, more: Math.max(0, all.length - max), last: take.at(-1)?.id ?? null, messages};
}
/** 방에 돌려줄 번호 — 선물 신청이 없으면 고객센터 번호 그대로(예전과 같음) · 있으면 「고객센터 번호+선물 번호」 */
export const pairLast = (help, gift) => (gift ? `${help ?? ''}+${gift}` : help ?? null);
/** 방이 돌려준 번호 풀기 — {help, gift} · 꼴이 틀리면 null */
export function splitLast(s) {
  s = String(s ?? '');
  if (ID_RE.test(s)) return {help: s, gift: null};
  const m = /^([0-9a-z]{9}-[A-Za-z0-9_-]{12})?\+([0-9a-z]{9}-[A-Za-z0-9_-]{12})$/.exec(s);
  return m ? {help: m[1] ?? null, gift: m[2]} : null;
}
/** 새 글 꺼내기 — {schema, at, cursor, n, more, last, items, messages} */
export async function fetchNew(store, {max = MAX_ITEMS, now = new Date(), start = FWD_START} = {}) {
  const cur = await getJ(store, CURSOR_KEY), cursor = typeof cur?.id === 'string' && ID_RE.test(cur.id) ? cur.id : startCursor(start);
  const keys = (((await store.list({prefix: 'i/'}))?.blobs) ?? []).map(b => b.key).filter(k => ID_RE.test(k.slice(2)) && (!cursor || k.slice(2) > cursor)).sort();
  const items = [];
  for (let i = 0; i < Math.min(keys.length, max + 40); i += 20) items.push(...(await Promise.all(keys.slice(i, i + 20).map(k => getJ(store, k)))));
  const pick = pickNew(items, cursor, {max});
  pick.more += Math.max(0, keys.length - (max + 40));
  const messages = pick.items.flatMap(it => toMessages(it));
  return {schema: FWD_SCHEMA, at: now.toISOString(), cursor, n: pick.items.length, more: pick.more, last: pick.items.at(-1)?.id ?? null, items: pick.items, messages};
}
/** 알림 줄 조각 수(머리 줄 빼고) — toAnnotations 와 같은 셈 */
export const annParts = box => Math.ceil(Buffer.from(JSON.stringify(box), 'utf8').toString('base64').length / ANN_CHUNK);
/** 꺼내 잠그기 — 잠긴 묶음이 알림 줄 아홉 조각 안에 들 때까지 글 수를 줄임(10 → 5 → 2 → 1 · 남은 글은 다음 시간에)
 *  아주 긴 글(그림 글자 500자 열 개 등)에 막혀 한 시간도 못 보내는 일이 없게 · 묶음에는 카톡 글만(글 목록은 빼 크기 절반) */
export async function fetchSealed(store, pub, {steps = [MAX_ITEMS, 5, 2, 1], now, start, maxParts = ANN_MAX, giftStore = null, giftStart} = {}) {
  const g = giftStore ? await fetchGift(giftStore, {start: giftStart}).catch(() => null) : null; // 선물 신청을 못 읽어도 고객센터 글은 그대로 감
  for (const max of steps) {
    const r = await fetchNew(store, {max, now, start});
    const box = g
      ? seal({schema: r.schema, at: r.at, n: r.n + g.n, more: r.more + g.more, last: pairLast(r.last, g.last), messages: [...r.messages, ...g.messages], help: r.n, gift: g.n}, pub)
      : seal({schema: r.schema, at: r.at, n: r.n, more: r.more, last: r.last, messages: r.messages}, pub);
    if (annParts(box) <= maxParts) return {r, g, box};
  }
  throw Error('글 하나도 알림 줄에 들지 않음');
}
/** 여기까지 보냄 — 앞으로만(뒤로 가지 않음) · 틀린 번호는 거절 */
async function ack1(store, id, now) {
  const cur = await getJ(store, CURSOR_KEY);
  if (typeof cur?.id === 'string' && cur.id >= id) return {ok: true, moved: false, cursor: cur.id};
  await store.setJSON(CURSOR_KEY, {id, at: now.toISOString()});
  return {ok: true, moved: true, cursor: id};
}
export async function ack(store, id, {now = new Date(), giftStore = null} = {}) {
  const p = typeof id === 'string' ? splitLast(id) : null;
  if (!p) return {ok: false, why: '번호 꼴이 틀림'};
  if (p.gift && !giftStore) return {ok: false, why: '선물 저장소가 없음'};
  const h = p.help ? await ack1(store, p.help, now) : {ok: true, moved: false, cursor: null};
  if (!p.gift) return h;
  return {...h, gift: await ack1(giftStore, p.gift, now)};
}
async function netlifyStore(name = HELP_STORE) {
  const siteID = process.env.NETLIFY_SITE_ID, token = process.env.NETLIFY_AUTH_TOKEN;
  if (!siteID || !token) throw Error('넷리파이 열쇠가 없음(작업 환경)');
  const {getStore} = await import('@netlify/blobs');
  return getStore({name, siteID, token, consistency: 'strong'});
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : d; };
  try {
    if (a.includes('--annotate')) { for (const l of toAnnotations(JSON.parse(fs.readFileSync(arg('--annotate', 'sealed.json'), 'utf8')))) console.log(l); process.exit(0); }
    if (a.includes('--ack')) {
      const r = await ack(await netlifyStore(), arg('--ack', ''), {giftStore: await netlifyStore(GIFT_STORE)});
      console.log(r.ok ? `보낸 표시 ${r.moved ? '옮김' : '그대로'} — ${String(r.cursor).slice(0, 9)}${r.gift ? ` · 선물 신청 ${r.gift.moved ? '옮김' : '그대로'} — ${String(r.gift.cursor).slice(0, 9)}` : ''}` : '보낸 표시를 못 옮김 — ' + r.why);
      process.exit(r.ok ? 0 : 1);
    }
    if (a.includes('--fetch')) {
      const pub = arg('--pub', ''), out = arg('--out', 'sealed.json');
      if (!/^[A-Za-z0-9+/=]{40,120}$/.test(pub) || !/^[\w.\-/]+\.json$/.test(out)) { console.error('쓰는 법: --fetch --pub <base64> --out 파일.json'); process.exit(2); }
      const giftStore = await netlifyStore(GIFT_STORE).catch(() => null);
      const {r, g, box} = await fetchSealed(await netlifyStore(), pub, {giftStore});
      fs.writeFileSync(out, JSON.stringify(box) + '\n');
      const kk = r.messages.length + (g ? g.messages.length : 0);
      console.log(`새 글 ${r.n}개 · 선물 신청 · 친구 알림 ${g ? g.n + '개' : '못 읽음'} · 카톡 ${kk}통 · 남은 글 ${r.more}개`); // 글은 찍지 않음(잠긴 묶음에만)
      process.exit(0);
    }
    console.error('쓰는 법: forward.mjs --fetch --pub <base64> --out sealed.json | --annotate sealed.json | --ack <번호>'); process.exit(2);
  } catch (e) { console.error('고객센터 넘기기 실패 — ' + String(e?.message ?? e).slice(0, 160)); process.exit(1); }
}
