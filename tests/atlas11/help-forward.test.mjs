// 고객센터 새 글 → 사장님 카톡 시험(scripts/atlas11/help/forward.mjs · room.mjs · .github/workflows/atlas11-help-forward.yml)
//   사장님 2026-10-22(서울) 07:48 「여기에 글을 남기면 카톡 게시물말고 다른 방한나더 별로 만들어 내 카톡으로 오게해라」 — docs/design/helpkakao-2026-10-22/order-0748.txt
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pickNew, toMessages, whenKo, newRoomKey, seal, open, toAnnotations, fromAnnotations, fetchNew, ack, HELP_STORE, ID_RE, CURSOR_KEY, MSG_MAX, MAX_ITEMS} from '../../scripts/atlas11/help/forward.mjs';
import {HELP_STORE as LIB_STORE, ID_RE as LIB_ID, handleHelp} from '../../lib/atlas11/help.mjs';
import {memoryStore} from '../../lib/atlas11/letter.mjs';

const read = p => fs.readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const id = (t, r = 'aaaaaaaaaaaa') => Math.floor(t).toString(36).padStart(9, '0') + '-' + r;
const T0 = Date.parse('2026-10-22T07:47:00+09:00');

test('같은 저장소 이름 · 같은 글 번호 꼴(고객센터 서버와 맞댐)', () => {
  assert.equal(HELP_STORE, LIB_STORE);
  assert.equal(String(ID_RE), String(LIB_ID));
  assert.equal(CURSOR_KEY.startsWith('i/'), false, '보낸 표시가 글 목록에 섞이지 않음');
});

test('새 글 고르기 — 보낸 표시 뒤만 · 때 차례 · 많아야 열 개 · 기기 표시와 답은 뺌', () => {
  const items = Array.from({length: 14}, (_, i) => ({id: id(T0 + i * 1000, ('b' + i).padEnd(12, 'x')), kind: 'note', tone: 'good', text: '좋아요 ' + i, at: new Date(T0 + i * 1000).toISOString(), dev: 'secret-hash', answer: '답', page: 'home'}));
  const r = pickNew([...items].reverse(), items[1].id);
  assert.equal(r.items.length, MAX_ITEMS);
  assert.equal(r.more, 2);
  assert.equal(r.items[0].id, items[2].id, '보낸 표시 다음부터');
  assert.ok(r.items.every(x => !('dev' in x) && !('answer' in x)), '기기 표시 · 답 없음');
  assert.deepEqual(pickNew(items, items.at(-1).id).items, [], '다 보냈으면 없음');
  assert.equal(pickNew([{id: 'bad', text: 'x'}], '').items.length, 0, '번호 꼴이 틀린 글은 뺌');
});

test('카톡 글 — 머리 · 때 · 보던 화면 · 한 통 190자 안 · 길면 나눔 · 글은 그대로', () => {
  assert.equal(whenKo('2026-10-21T22:47:00Z'), '10월 22일 오전 7시 47분');
  assert.equal(whenKo('2026-10-22T06:00:00Z'), '10월 22일 오후 3시');
  const one = toMessages({kind: 'note', tone: 'want', page: 'gift', at: '2026-10-21T22:47:00Z', text: '상품권 받는 법을 더 크게 써 주세요'});
  assert.equal(one.length, 1);
  assert.match(one[0], /^\[돌이 고객센터\] 한마디 · 바라요\n10월 22일 오전 7시 47분 · 보던 화면 상품권 방\n\n상품권 받는 법을 더 크게 써 주세요$/);
  const long = 'ㄱ'.repeat(470) + '끝';
  const many = toMessages({kind: 'ask', at: '2026-10-21T22:47:00Z', text: long});
  assert.ok(many.length >= 3, '나눔');
  assert.ok(many.every(m => Array.from(m).length <= MSG_MAX), many.map(m => Array.from(m).length).join(','));
  assert.match(many[0], /^\[돌이 고객센터\] 물음\n/);
  assert.match(many[1], /^\[돌이 고객센터 · 이어서 2\/\d\]\n/);
  const back = many.map((m, i) => (i === 0 ? m.split('\n\n').slice(1).join('\n\n').replace(/ \(1\/\d+\)$/, '') : m.split('\n').slice(1).join('\n'))).join('');
  assert.equal(back, long, '글 한 글자도 안 바뀜');
});

test('잠그기 — 방 열쇠로만 풀림 · 알림 줄로 갔다 와도 같음 · 다른 열쇠는 못 풂', () => {
  const k = newRoomKey(), other = newRoomKey();
  const obj = {schema: 'x', messages: ['[돌이 고객센터] 한마디\n비밀 글'], last: id(T0)};
  const box = seal(obj, k.pub);
  assert.ok(!JSON.stringify(box).includes('비밀'), '맨글 없음');
  const lines = toAnnotations(box);
  assert.ok(lines.length <= 10, '한 걸음 알림 열 줄 안');
  const list = lines.map(l => { const m = /^::notice title=([^:]+)::(.*)$/.exec(l); return {title: m[1], message: m[2], annotation_level: 'notice'}; });
  const back = fromAnnotations(list);
  assert.equal(back.ok, true, back.why);
  assert.deepEqual(open(back.box, k.priv), obj);
  assert.throws(() => open(back.box, other.priv));
  assert.equal(fromAnnotations(list.slice(0, -1)).ok, false, '조각이 모자라면 닫힌 쪽');
});

test('저장소 — 고객센터 서버가 쓴 글을 꺼냄 · 보낸 표시는 앞으로만', async () => {
  const store = memoryStore(), dev = 'k'.repeat(43);
  const call = async (body, t) => (await handleHelp(new Request('https://aaa7377.com/api/help', {method: 'POST', headers: {'content-type': 'application/json', 'x-help-key': dev}, body: JSON.stringify(body)}), {store, now: () => new Date(t)})).json();
  const a = await call({op: 'send', kind: 'note', tone: 'good', text: '첫 화면이 예뻐요', agree: true, page: 'home'}, T0);
  const b = await call({op: 'send', kind: 'ask', text: '상품권은 언제 오나요?', agree: true, page: 'gift'}, T0 + 60e3);
  assert.ok(a.ok && b.ok, JSON.stringify([a, b]));
  const r1 = await fetchNew(store, {now: new Date(T0 + 120e3)});
  assert.equal(r1.n, 2); assert.equal(r1.last, b.id);
  assert.ok(r1.messages[0].includes('첫 화면이 예뻐요') && r1.messages[1].includes('상품권은 언제 오나요?'));
  assert.equal((await ack(store, a.id)).moved, true);
  assert.equal((await fetchNew(store)).n, 1, '보낸 것 뒤 하나');
  assert.equal((await ack(store, a.id)).moved, false, '같은 번호면 그대로');
  assert.equal((await ack(store, b.id)).moved, true);
  assert.equal((await ack(store, a.id)).moved, false, '뒤로 가지 않음');
  assert.equal((await fetchNew(store)).n, 0);
  assert.equal((await ack(store, 'nope')).ok, false);
});

test('깃허브 작업 · 방 — 읽기 권한만 · 넷리파이 열쇠는 작업 비밀 · 글을 찍지 않음', () => {
  const y = read('.github/workflows/atlas11-help-forward.yml');
  assert.match(y, /permissions:\n {2}contents: read/);
  assert.match(y, /secrets\.NETLIFY_AUTH_TOKEN/);
  assert.doesNotMatch(y, /schedule:|cron:/, '부르는 것은 방(매시)')
  const f = read('scripts/atlas11/help/forward.mjs');
  assert.doesNotMatch(f, /console\.log\([^)]*(text|messages\[|\.messages\))/, '글을 기록 줄에 찍지 않음');
  const room = read('scripts/atlas11/help/room.mjs');
  assert.match(room, /'-f', `pub=\$\{key\.pub\}`/);
  assert.match(room, /mode: 0o600/);
});
