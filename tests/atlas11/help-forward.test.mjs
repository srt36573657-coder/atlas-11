// 고객센터 새 글 → 사장님 카톡 시험(scripts/atlas11/help/forward.mjs · room.mjs · .github/workflows/atlas11-help-forward.yml)
//   사장님 2026-10-22(서울) 07:48 「여기에 글을 남기면 카톡 게시물말고 다른 방한나더 별로 만들어 내 카톡으로 오게해라」 — docs/design/helpkakao-2026-10-22/order-0748.txt
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pickNew, toMessages, whenKo, newRoomKey, seal, open, toAnnotations, fromAnnotations, fetchNew, fetchSealed, annParts, ack, startCursor, FWD_START, HELP_STORE, ID_RE, CURSOR_KEY, MSG_MAX, MAX_ITEMS, ANN_MAX} from '../../scripts/atlas11/help/forward.mjs';
import {HELP_STORE as LIB_STORE, ID_RE as LIB_ID, handleHelp} from '../../lib/atlas11/help.mjs';
import {failStreak, pickRun, newTag, checkSent, doneRoom} from '../../scripts/atlas11/help/room.mjs';
import os from 'node:os';
import path from 'node:path';
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
  const r1 = await fetchNew(store, {now: new Date(T0 + 120e3), start: '2026-10-21T00:00:00Z'});
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

test('처음(보낸 표시 없음)에는 처리방침 카톡 줄이 오른 뒤 글부터 — 그 전 글은 안 감 · 같은 때 글은 들어감', async () => {
  const store = memoryStore(), S = Date.parse(FWD_START);
  assert.ok(S >= Date.parse('2026-10-22T05:00:00Z'), '사장님께 말씀드린 올림 때(14:00 서울)보다 앞이 아님');
  for (const [t, r] of [[S - 86400e3, 'old0'], [S - 1, 'old1'], [S, 'same'], [S + 5e3, 'new1']]) {
    const it = {id: id(t, r.padEnd(12, 'q')), kind: 'note', tone: 'good', text: r, page: 'home', at: new Date(t).toISOString()};
    await store.setJSON('i/' + it.id, it);
  }
  const r = await fetchNew(store);
  assert.deepEqual(r.items.map(x => x.text), ['same', 'new1']);
  assert.ok(startCursor() < id(S, 'A'.repeat(12)) && startCursor() > id(S - 1, 'z'.repeat(12)));
  assert.equal((await ack(store, r.last)).moved, true);
  assert.equal((await fetchNew(store)).n, 0, '보낸 표시가 생기면 그 뒤만');
});

test('아주 긴 글 열 개(4바이트 글자 500자씩 · 마구잡이)도 막히지 않음 — 넘치면 글 수를 줄여 알림 줄 조각 안 · 남은 글은 다음 시간', async () => {
  const store = memoryStore(), k = newRoomKey();
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 10; i++) {
    const text = Array.from({length: 500}, () => String.fromCodePoint(0x20000 + Math.floor(rnd() * 0xA6DF))).join('');
    const it = {schema: 'atlas11-help-item-1', id: id(T0 + i * 1000, ('e' + i).padEnd(12, 'z')), kind: 'note', tone: 'good', text, page: 'home', at: new Date(T0 + i * 1000).toISOString(), dev: 'x', status: 'new'};
    await store.setJSON('i/' + it.id, it);
  }
  assert.equal((await fetchNew(store, {start: '2026-10-21T00:00:00Z'})).n, 10);
  const all = await fetchSealed(store, k.pub, {start: '2026-10-21T00:00:00Z'});
  assert.ok(annParts(all.box) <= ANN_MAX && toAnnotations(all.box).length <= ANN_MAX + 1, '보통 한도 안');
  assert.equal(all.r.n + all.r.more, 10);
  const {r, box} = await fetchSealed(store, k.pub, {maxParts: 3, start: '2026-10-21T00:00:00Z'}); // 한도를 좁혀 줄이는 길을 꼭 지나게
  assert.ok(annParts(box) <= 3, String(annParts(box)));
  assert.ok(r.n >= 1 && r.n < 10 && r.more === 10 - r.n, `${r.n} + ${r.more}`);
  const got = open(box, k.priv);
  assert.equal(got.n, r.n); assert.equal(got.last, r.last); assert.equal(got.items, undefined, '묶음에 글 목록은 없음(카톡 글만)');
  assert.ok(got.messages.every(m => Array.from(m).length <= MSG_MAX));
});

test('연달아 막힌 수 — 새것부터 · 잘 된 것에서 멈춤 · 도는 것은 건너뜀(꼭 3 일 때 한 번 알림)', () => {
  const at = m => new Date(T0 + m * 60e3).toISOString();
  const runs = [{status: 'completed', conclusion: 'success', createdAt: at(0)}, {status: 'completed', conclusion: 'failure', createdAt: at(60)}, {status: 'completed', conclusion: 'cancelled', createdAt: at(120)}, {status: 'in_progress', conclusion: null, createdAt: at(121)}, {status: 'completed', conclusion: 'failure', createdAt: at(180)}];
  assert.equal(failStreak(runs), 3);
  assert.equal(failStreak(runs.slice(0, 3)), 2);
  assert.equal(failStreak([...runs, {status: 'completed', conclusion: 'success', createdAt: at(240)}]), 0);
  assert.equal(failStreak(null), 0);
});

test('내가 부른 작업 찾기 — 이름 끝 방 표시가 같은 것만(두 방이 함께 불러도 섞이지 않음)', () => {
  const t0 = T0, at = s => new Date(T0 + s * 1000).toISOString(), a = newTag(), b = newTag();
  assert.match(a, /^[0-9a-f]{10}$/); assert.notEqual(a, b);
  const list = [{databaseId: 1, event: 'workflow_dispatch', createdAt: at(5), displayTitle: 'atlas11-help-forward fetch ' + b}, {databaseId: 2, event: 'workflow_dispatch', createdAt: at(3), displayTitle: 'atlas11-help-forward fetch ' + a}, {databaseId: 3, event: 'workflow_dispatch', createdAt: at(-60), displayTitle: 'atlas11-help-forward fetch ' + a}];
  assert.equal(pickRun(list, a, t0), 2);
  assert.equal(pickRun(list, b, t0), 1);
  assert.equal(pickRun(list, 'nope', t0), null);
});

test('보낸 통 수 — 카톡 도구가 「성공」이라 답한 통 수를 넘겨야 보낸 표시 · 꺼낸 글 수와 같아야 함(2026-10-25 17:28 「오지 않랐어」)', async () => {
  assert.equal(checkSent('', 1).ok, false, '수가 없으면 막음');
  assert.equal(checkSent(undefined, null).ok, false);
  assert.equal(checkSent('0', 1).ok, false, '0통은 보낸 것이 아님');
  assert.equal(checkSent('x', 1).ok, false);
  assert.equal(checkSent('1', 2).ok, false, '덜 보냄');
  assert.equal(checkSent('3', 2).ok, false, '더 셈');
  assert.deepEqual(checkSent('2', 2), {ok: true, sent: 2});
  assert.deepEqual(checkSent(' 1 ', null), {ok: true, sent: 1}, '파일을 못 읽으면 수만 봄');
  // 깃허브를 부르기 전에 막힘 — 꺼낸 파일에 글 둘인데 한 통만 보냈다고 하면 보낸 표시 없음
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'room-sent-')), file = path.join(dir, 'help-forward.json');
  fs.writeFileSync(file, JSON.stringify({messages: ['[돌이 고객센터] 가', '[돌이 선물] 나'], last: '+' + id(T0), n: 2, more: 0}));
  const r1 = await doneRoom({run: '1', last: '+' + id(T0), sent: '1', file});
  assert.equal(r1.ok, false); assert.match(r1.why, /1\/2/);
  const r0 = await doneRoom({run: '1', last: '+' + id(T0), file});
  assert.equal(r0.ok, false); assert.match(r0.why, /--sent/);
  fs.rmSync(dir, {recursive: true, force: true});
  const room = read('scripts/atlas11/help/room.mjs');
  assert.match(room, /tag = `\$\{newTag\(\)\}-s\$\{s\.sent\}`/, '보낸 표시 작업 이름 끝에 보낸 통 수');
  assert.match(room, /messages: r\.messages\}/, '꺼낸 결과에 보낼 글을 실음(방이 파일을 따로 안 열어도 됨)');
  assert.match(room, /sent: arg\('--sent', ''\)/);
  // 이름 끝 표시로 찾기는 그대로 — 「-s1」이 붙어도 내 작업만
  const t0 = Date.parse('2026-10-25T09:00:00Z'), tg = newTag() + '-s1';
  assert.equal(pickRun([{databaseId: 7, event: 'workflow_dispatch', createdAt: '2026-10-25T09:00:05Z', displayTitle: 'atlas11-help-forward ack ' + tg}], tg, t0), 7);
});

test('깃허브 작업 · 방 — 읽기 권한만 · 넷리파이 열쇠는 작업 비밀 · 글을 찍지 않음', () => {
  const y = read('.github/workflows/atlas11-help-forward.yml');
  assert.match(y, /permissions:\n {2}contents: read/);
  assert.match(y, /secrets\.NETLIFY_AUTH_TOKEN/);
  assert.doesNotMatch(y, /schedule:|cron:/, '부르는 것은 방(매시)')
  const f = read('scripts/atlas11/help/forward.mjs');
  assert.doesNotMatch(f, /console\.log\([^)]*(text|messages\[|\.messages\))/, '글을 기록 줄에 찍지 않음');
  const room = read('scripts/atlas11/help/room.mjs');
  assert.match(room, /'-f', `pub=\$\{key\.pub\}`, '-f', `tag=\$\{tag\}`/);
  assert.match(y, /run-name: atlas11-help-forward \$\{\{ inputs\.mode \}\} \$\{\{ inputs\.tag \}\}/);
  assert.match(room, /mode: 0o600/);
});
