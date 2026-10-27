// 선물 신청 알림 시험 — 새 신청이 오면 사장님 카톡 「나와의 채팅」으로(고객센터 글과 같은 방 · 같은 작업)
//   사장님 2026-10-25(서울) 15:37 「어 오게 해」 — 물음 「새 신청이 오면 사장님 카톡으로도 알려 드릴까요?」
//   scripts/atlas11/help/forward.mjs(fetchGift · giftMessage · fetchSealed giftStore · ack 「고객센터 번호+선물 번호」) · room.mjs(splitLast)
//   카톡에는 신청한 때 · 친구 수 · 카톡에서 연 수 · 전화번호 끝 네 자리만 — 전체 번호는 관리자 화면에서만(처리방침 #gift-kakao)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {fetchGift, giftMessage, fetchSealed, fetchNew, ack, pairLast, splitLast, newRoomKey, open, GIFT_STORE, GIFT_START, ID_RE, MSG_MAX, CURSOR_KEY,
  friendsMessage, GIFT_PER, FRIENDS_KEY, FRIENDS_START} from '../../scripts/atlas11/help/forward.mjs';
import {handleGift, refOf, GIFT_STORE as LIB_GIFT_STORE, RULE as LIB_RULE} from '../../lib/atlas11/gift.mjs';
import {handleHelp} from '../../lib/atlas11/help.mjs';
import {memoryStore} from '../../lib/atlas11/letter.mjs';
import {NAME} from '../../site/next/brand.js'; // 이름 한 곳(2026-10-27 21:50 둘이)

const read = p => fs.readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const devKey = () => randomBytes(16).toString('base64url');
const KK_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.1';
const T1 = Date.parse('2026-10-25T07:00:00Z'); // 서울 오후 4시 — 선물 넘기기 시작 때(15:00 서울) 뒤
function giftApi(store, clock) {
  return async (p, body, {key, ua} = {}) => {
    const headers = {'content-type': 'application/json'};
    if (key) headers['x-gift-key'] = key;
    if (ua) headers['user-agent'] = ua;
    const res = await handleGift(new Request('https://aaa7377.com/api/gift' + p, {method: 'POST', headers, body: JSON.stringify(body)}), {store, now: () => new Date(clock.t)});
    return {status: res.status, body: await res.json()};
  };
}
/** 보내는 사람 하나 · 친구 셋(둘은 카톡 안) · 신청 하나 → 신청 번호 */
async function oneClaim(store, clock, phone = '010-1234-5678') {
  const call = giftApi(store, clock), me = devKey(), r = refOf(me);
  for (let i = 0; i < 3; i++) assert.equal((await call('/visit', {r}, {key: devKey(), ua: i < 2 ? KK_UA : undefined})).status, 200);
  const c = await call('/claim', {phone, agree: true, watched: true}, {key: me});
  assert.equal(c.status, 200, JSON.stringify(c.body));
  return c.body.id;
}

test('같은 저장소 이름 · 같은 번호 꼴(선물 서버와 맞댐) · 시작 때는 진짜 사이트에 오른 때(15:02 서울) 바로 앞', () => {
  assert.equal(GIFT_STORE, LIB_GIFT_STORE);
  assert.equal(GIFT_START, '2026-10-25T06:00:00.000Z');
  const lib = read('lib/atlas11/gift.mjs');
  assert.ok(lib.includes(String(ID_RE)), '선물 서버 신청 번호 꼴과 같음');
});

test('카톡 한 통 — 때 · 친구 수 · 카톡에서 연 수 · 번호 끝 네 자리만 · 190자 안', () => {
  const m = giftMessage({id: 'x', at: '2026-10-25T07:20:00.000Z', friends: 3, kk: 2, phone: '01012345678', tail: '5678', state: 'wait'});
  assert.equal(m, `[${NAME} 선물] 새 신청이 왔어요\n10월 25일 오후 4시 20분\n친구 3명이 열었어요 · 카톡에서 2명\n전화번호 끝 5678\n관리자 화면에서 번호를 보고 카톡 선물을 보내 주세요.`);
  assert.ok(!m.includes('01012345678') && !m.includes('1234'), '전체 번호는 넣지 않음');
  assert.ok(Array.from(m).length <= MSG_MAX);
  assert.ok(giftMessage({at: 'bad', tail: '12'}).includes('전화번호 끝 ????'), '꼴이 틀린 끝 번호는 숨김');
});

test('새 신청 꺼내기 — 서버가 만든 신청 · 보낼 차례만 알림 · 보낸 표시는 앞으로만 · 이미 보낸 신청은 알리지 않고 지나감', async () => {
  const store = memoryStore(), clock = {t: T1};
  const a = await oneClaim(store, clock);
  const r1 = await fetchGift(store);
  assert.equal(r1.n, 1); assert.equal(r1.last, a); assert.equal(r1.messages.length, 1);
  assert.match(r1.messages[0], /친구 3명이 열었어요 · 카톡에서 2명\n전화번호 끝 5678/);
  assert.ok(!r1.messages[0].includes('010'), '전체 번호 없음');
  // 이미 「보냄」인 신청(사장님이 먼저 보냄)은 알리지 않지만 보낸 표시는 지나감
  clock.t += 11 * 60e3;
  const b = await oneClaim(store, clock, '010-9999-0001');
  const cb = await store.get('c/' + b, {type: 'json'}); await store.setJSON('c/' + b, {...cb, state: 'sent', phone: null});
  const r2 = await fetchGift(store);
  assert.equal(r2.n, 1, '보낼 차례는 a 하나'); assert.equal(r2.last, b, '마지막 번호는 b');
  assert.equal((await ack(memoryStore(), pairLast(null, r2.last), {giftStore: store})).gift.moved, true);
  assert.equal((await fetchGift(store)).n, 0);
  assert.equal((await ack(memoryStore(), pairLast(null, a), {giftStore: store})).gift.moved, false, '뒤로 가지 않음');
});

test('처음(보낸 표시 없음)에는 시작 때 뒤 신청부터', async () => {
  const store = memoryStore(), S = Date.parse(GIFT_START), id = (t, r) => Math.floor(t).toString(36).padStart(9, '0') + '-' + r;
  for (const [t, r] of [[S - 60e3, 'oldoldoldold'], [S + 60e3, 'newnewnewnew']]) await store.setJSON('c/' + id(t, r), {id: id(t, r), at: new Date(t).toISOString(), friends: 3, kk: 0, tail: '1111', state: 'wait'});
  const r = await fetchGift(store);
  assert.equal(r.n, 1); assert.equal(r.last, id(S + 60e3, 'newnewnewnew'));
  assert.equal(await store.get(CURSOR_KEY, {type: 'json'}).catch(() => null), null, '꺼내기는 쓰지 않음(보낸 표시는 ack 만)');
});

test('잠그기 — 고객센터 글 다음에 선물 신청 · n 은 둘을 더함 · last 는 「고객센터 번호+선물 번호」 · 방 열쇠로만 풂', async () => {
  const help = memoryStore(), gift = memoryStore(), clock = {t: T1}, k = newRoomKey();
  const h = await (await handleHelp(new Request('https://aaa7377.com/api/help', {method: 'POST', headers: {'content-type': 'application/json', 'x-help-key': 'k'.repeat(43)}, body: JSON.stringify({op: 'send', kind: 'ask', text: '상품권은 언제 오나요?', agree: true, page: 'gift'})}), {store: help, now: () => new Date(T1)})).json();
  assert.ok(h.ok, JSON.stringify(h));
  const g = await oneClaim(gift, clock);
  const {box} = await fetchSealed(help, k.pub, {giftStore: gift, start: '2026-10-21T00:00:00Z'});
  const got = open(box, k.priv);
  assert.equal(got.n, 2); assert.equal(got.help, 1); assert.equal(got.gift, 1);
  assert.equal(got.last, h.id + '+' + g);
  assert.ok(got.messages[0].startsWith(`[${NAME} 고객센터]`) && got.messages.at(-1).startsWith(`[${NAME} 선물]`));
  assert.deepEqual(splitLast(got.last), {help: h.id, gift: g});
  const done = await ack(help, got.last, {giftStore: gift});
  assert.ok(done.ok && done.moved && done.gift.moved, JSON.stringify(done));
  assert.equal((await fetchNew(help)).n, 0); assert.equal((await fetchGift(gift)).n, 0);
  // 선물 신청만 있을 때 — last 앞이 빈칸
  clock.t += 11 * 60e3;
  const g2 = await oneClaim(gift, clock, '010-2222-3333');
  const only = open((await fetchSealed(help, k.pub, {giftStore: gift})).box, k.priv);
  assert.equal(only.n, 1); assert.equal(only.last, '+' + g2);
  assert.deepEqual(splitLast(only.last), {help: null, gift: g2});
  const d2 = await ack(help, only.last, {giftStore: gift});
  assert.ok(d2.ok && !d2.moved && d2.gift.moved, '고객센터 표시는 그대로 · 선물 표시만');
});

// 친구 셋 알림(사장님 2026-10-26 14:45 「카촉을 8명 보냈는데 내겐 오지 않아 / 너 해결해」) — 신청 전이라도 친구 셋 · 여섯 …이 열면 한 통
const T2 = Date.parse('2026-10-26T05:41:00Z'); // 서울 오후 2시 41분 — 친구 알림 시작 때(14:30 서울) 뒤
async function opens(store, clock, r, n, {kkFirst = 0, gap = 20e3} = {}) {
  const call = giftApi(store, clock);
  for (let i = 0; i < n; i++) { assert.equal((await call('/visit', {r}, {key: devKey(), ua: i < kkFirst ? KK_UA : undefined})).status, 200); clock.t += gap; }
}
test('친구 알림 — 같은 셈(셋) · 카톡 한 통 꼴 · 190자 안 · 번호 · 표 없음', () => {
  assert.equal(GIFT_PER, LIB_RULE.per);
  assert.equal(FRIENDS_START, '2026-10-26T05:30:00.000Z');
  const m = friendsMessage({at: '2026-10-26T05:42:10.000Z', friends: 4, kk: 0, step: 3, ref: 'AAAAAAAAAAAAAAAA'});
  assert.equal(m, `[${NAME} 선물] 친구 3명이 열었어요\n10월 26일 오후 2시 42분\n한 분이 보낸 주소를 친구 4명이 열었어요 · 카톡에서 0명\n그분이 선물 받기에서 신청하면 번호가 함께 와요.`);
  assert.ok(Array.from(m).length <= MSG_MAX && !m.includes('AAAA'));
});
test('친구 알림 — 셋째가 열면 한 통 · 넷 · 다섯은 그대로 · 여섯째에 또 한 통 · 못 보내면 다시(새로 만들지 않음) · 보낸 뒤 0', async () => {
  const store = memoryStore(), clock = {t: T2}, me = devKey(), r = refOf(me);
  await opens(store, clock, r, 2, {kkFirst: 1});
  assert.equal((await fetchGift(store, {now: new Date(clock.t)})).n, 0, '둘은 아직');
  await opens(store, clock, r, 1);
  const a = await fetchGift(store, {now: new Date(clock.t)});
  assert.equal(a.n, 1); assert.match(a.messages[0], /^\[둘이 선물\] 친구 3명이 열었어요\n10월 26일 오후 2시 4\d분\n한 분이 보낸 주소를 친구 3명이 열었어요 · 카톡에서 1명/);
  const again = await fetchGift(store, {now: new Date(clock.t + 3600e3)});
  assert.equal(again.n, 1, '못 보냈으면 다음 시간에 같은 알림'); assert.equal(again.last, a.last, '알림을 새로 만들지 않음');
  assert.equal(((await store.list({prefix: 'e/'})).blobs ?? []).length, 1);
  assert.ok((await ack(memoryStore(), pairLast(null, a.last), {giftStore: store})).gift.moved);
  await opens(store, clock, r, 2);
  assert.equal((await fetchGift(store, {now: new Date(clock.t)})).n, 0, '넷 · 다섯은 알리지 않음');
  await opens(store, clock, r, 1);
  const b = await fetchGift(store, {now: new Date(clock.t)});
  assert.equal(b.n, 1); assert.match(b.messages[0], /^\[둘이 선물\] 친구 6명이 열었어요\n/);
  // 신청도 오면 번호(때)대로 섞임 — 친구 알림 다음에 신청
  clock.t += 60e3;
  const c = await giftApi(store, clock)('/claim', {phone: '010-5555-6666', agree: true, watched: true}, {key: me});
  assert.equal(c.status, 200, JSON.stringify(c.body));
  const d = await fetchGift(store, {now: new Date(clock.t)});
  assert.equal(d.n, 2); assert.ok(d.messages[0].startsWith(`[${NAME} 선물] 친구 6명`) && d.messages[1].startsWith(`[${NAME} 선물] 새 신청`), JSON.stringify(d.messages));
  assert.equal(d.last, c.body.id);
  assert.equal((await store.get(CURSOR_KEY, {type: 'json'})).id, a.last, '꺼내기는 보낸 표시를 옮기지 않음(ack 만)');
});
test('친구 알림 — 셋째가 시작 때 전에 열었으면(시험 기록) 알림 없이 적기만 · 내 고리를 내가 열면 안 셈 · 저장소가 막혀도 신청 알림은 감', async () => {
  const store = memoryStore(), clock = {t: Date.parse(FRIENDS_START) - 30 * 60e3}, me = devKey(), r = refOf(me);
  await opens(store, clock, r, 3, {kkFirst: 2});
  const a = await fetchGift(store, {now: new Date(clock.t)});
  assert.equal(a.n, 0); assert.equal(((await store.list({prefix: 'e/'})).blobs ?? []).length, 0);
  assert.equal((await store.get(FRIENDS_KEY, {type: 'json'})).refs[r], 3, '알린 곳은 적음(다시 세지 않게)');
  assert.equal((await giftApi(store, clock)('/visit', {r}, {key: me})).body.self, true);
  // 연 기록 목록만 막힌 저장소 — 신청 알림은 그대로
  const s2 = memoryStore(), c2 = {t: T2};
  const id = await oneClaim(s2, c2);
  const blocked = {...s2, list: async o => { if (o?.prefix === 'v/') throw Error('막힘'); return s2.list(o); }, get: (...x) => s2.get(...x), setJSON: (...x) => s2.setJSON(...x)};
  const g = await fetchGift(blocked, {now: new Date(c2.t)});
  assert.equal(g.n, 1); assert.equal(g.last, id); assert.ok(g.messages[0].startsWith(`[${NAME} 선물] 새 신청`));
});

test('선물 저장소가 없거나 못 읽어도 고객센터 글은 예전과 같음 · 번호 꼴', async () => {
  const help = memoryStore(), k = newRoomKey();
  const broken = {list: async () => { throw Error('막힘'); }, get: async () => null};
  const a = open((await fetchSealed(help, k.pub, {giftStore: broken})).box, k.priv);
  const b = open((await fetchSealed(help, k.pub)).box, k.priv);
  assert.equal(a.n, 0); assert.equal(a.last, null); assert.equal(b.last, null); assert.equal(b.gift, undefined, '선물 저장소 없이 부르면 예전 꼴 그대로');
  assert.equal(pairLast('000000001-aaaaaaaaaaaa', null), '000000001-aaaaaaaaaaaa');
  for (const bad of ['', '+', 'nope', '000000001-aaaaaaaaaaaa+', '+nope', 'a+b']) assert.equal(splitLast(bad), null, bad);
  assert.equal((await ack(help, '+000000001-aaaaaaaaaaaa')).ok, false, '선물 저장소 없이 선물 번호는 거절');
});

test('방 · 작업 · 처리방침 — 방은 두 꼴 번호를 받음 · 작업 손대지 않음 · 처리방침에 끝 네 자리 줄', () => {
  const room = read('scripts/atlas11/help/room.mjs');
  assert.match(room, /if \(!splitLast\(last\)\) return \{ok: false/);
  const f = read('scripts/atlas11/help/forward.mjs');
  assert.match(f, /giftStore: await netlifyStore\(GIFT_STORE\)/, '보낸 표시는 두 저장소');
  assert.doesNotMatch(f, /console\.log\([^)]*(text|messages\[|\.messages\)|phone)/, '글 · 번호를 기록 줄에 찍지 않음');
  const y = read('.github/workflows/atlas11-help-forward.yml');
  assert.match(y, /inputs\.mode == 'giftprobe'/, '시험 선물 신청 길(사장님 2026-10-25 17:12 「그래」)');
  assert.match(y, /\? pd : '010-0000-0000'/, '시험 신청은 없는 번호(사장님이 번호를 주시면 그 번호 · 17:28)');
  assert.match(y, /PROBE_PHONE: \$\{\{ inputs\.phone \}\}/, '번호는 작업 입력으로만');
  assert.doesNotMatch(y, /console\.log\([^)]*(me\b|phone|key\(\))/, '열쇠 · 번호를 찍지 않음');
  const pv = read('site/privacy.html');
  assert.match(pv, /<li id="gift-kakao">[^<]*끝 네 자리[^<]*<\/li>/);
  assert.match(pv, /operator’s own KakaoTalk chat gets a short notice/);
});

test('「상품권 주세요」 알림(사장님 2026-10-26 16:14 · 16:16) — 확인 번호 넷 · 받는 분 번호 없음 · 190자 안', () => {
  const m = giftMessage({kind: 'ask', id: 'x', at: '2026-10-26T07:20:00.000Z', friends: 3, kk: 1, code: '0427', phone: null, tail: null, state: 'wait'});
  assert.equal(m, `[${NAME} 선물] 상품권 주세요\n10월 26일 오후 4시 20분\n친구 3명이 열었어요 · 카톡에서 1명\n확인 번호 0427\n이 번호를 보내는 분께 상품권을 보내 주세요.`);
  assert.ok(Array.from(m).length <= MSG_MAX);
  assert.ok(giftMessage({kind: 'ask', at: 'bad', code: '12'}).includes('확인 번호 ????'));
});
