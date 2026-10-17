// 편지 여는 밤 서버 셈 시험(lib/atlas11/letter.mjs) — 메모리 저장소 · 시계를 옮겨 봉인 → 여는 밤
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {weekOf, opensAtOf, badWord, BAD, OKW, handleLetter, memoryStore, LIM} from '../../lib/atlas11/letter.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const KST = h => new Date(h + '+09:00').getTime();
function api(store, clock) {
  return async (method, body, {key, owner, week, origin} = {}) => {
    const url = 'https://aaa7377.com/api/letter' + (week ? '?week=' + week : '');
    const headers = {'content-type': 'application/json'};
    if (key) headers['x-atlas-letter'] = key;
    if (owner) headers['x-atlas-owner'] = owner;
    if (origin) headers.origin = origin;
    const req = new Request(url, {method, headers, body: method === 'POST' ? JSON.stringify(body) : undefined});
    const res = await handleLetter(req, {store, now: () => new Date(clock.t), ownerHash: OWNER_HASH});
    return {status: res.status, body: res.status === 405 ? null : await res.json()};
  };
}

test('여는 밤 = 금요일 20:00(서울) — 그 전이면 그 주 · 그 뒤면 다음 주', () => {
  assert.equal(weekOf(KST('2026-10-19T10:00:00')).id, '2026-10-23'); // 월
  assert.equal(weekOf(KST('2026-10-23T19:59:59')).id, '2026-10-23'); // 금 19:59
  assert.equal(weekOf(KST('2026-10-23T20:00:00')).id, '2026-10-30'); // 금 20:00 → 다음 주
  assert.equal(weekOf(KST('2026-10-17T02:00:00')).id, '2026-10-23'); // 토
  assert.equal(new Date(weekOf(KST('2026-10-19T10:00:00')).opensAt).toISOString(), '2026-10-23T11:00:00.000Z');
  assert.equal(opensAtOf('2026-10-23'), KST('2026-10-23T20:00:00'));
  assert.equal(opensAtOf('2026-10-22'), null); // 목요일
  assert.equal(opensAtOf('2026-13-01'), null);
});

test('막는 말 — 갈래마다 · 띄어쓰기를 빼고 · 보통 글은 지남', () => {
  assert.deepEqual(badWord('내일 사 세 요'), ['사고팔기 말', '사세요']);
  assert.equal(badWord('오픈채팅 오세요')[0], '리딩방 말');
  assert.equal(badWord('연락은 010-1234')[0], '연락처');
  assert.equal(badWord('WWW.example')[0], '연락처');
  assert.equal(badWord('이번 주는 뉴스를 덜 보기로 했어요'), null);
  assert.equal(badWord('급등 탭에서 봤어요'), null); // 사이트 탭 이름은 막지 않음
  assert.equal(badWord('거래가 사라졌어요'), null); // 사라지다는 괜찮음
  assert.deepEqual(badWord('지금 사라'), ['사고팔기 말', '사라']);
});

test('막는 말 한 곳 — 서버 · 화면 letter.js · 보내기 글상자 모두 site/next/words.js', async () => { // 2026-10-17 21:10 [4] 4
  const W = await import('../../site/next/words.js');
  assert.equal(BAD, W.BLOCK); assert.equal(OKW, W.OKW); assert.equal(badWord, W.badWord);
  const src = fs.readFileSync(new URL('../../site/letter.js', import.meta.url), 'utf8');
  assert.match(src, /import \{[^}]*\bbadWord\b[^}]*\} from '\/next\/words\.js'/, 'letter.js 가 /next/words.js 를 부름');
  assert.doesNotMatch(src, /const (BAD|OKW) = \[/, 'letter.js 에 제 목록이 남음');
});

test('초대장 → 들어오기 → 봉인 → 여는 밤 → 배웠어요 · 답 · 신고 · 돌아보기', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  // 사장님 열쇠 없이는 초대장을 못 만듦
  assert.equal((await call('POST', {op: 'mint', n: 2})).status, 403);
  const mint = await call('POST', {op: 'mint', n: 3}, {owner: OWNER});
  assert.equal(mint.status, 201); assert.equal(mint.body.codes.length, 3);
  const [c1, c2, c3] = mint.body.codes;
  // 들어오기
  assert.equal((await call('POST', {op: 'join', code: 'short', nick: '보리차'})).status, 400);
  assert.equal((await call('POST', {op: 'join', code: c1, nick: '대박이'})).body.error, 'word');
  const a = await call('POST', {op: 'join', code: c1, nick: '보리차'});
  assert.equal(a.status, 201); assert.match(a.body.key, /^[A-Za-z0-9_-]{43}$/); assert.equal(a.body.invites.length, LIM.invites);
  assert.equal((await call('POST', {op: 'join', code: c1, nick: '다른이'})).body.error, 'code_used');
  assert.equal((await call('POST', {op: 'join', code: c2, nick: '보리차'})).body.error, 'nick_taken');
  const b = await call('POST', {op: 'join', code: a.body.invites[0], nick: '새벽산책'}); // 회원이 받은 초대장으로
  assert.equal(b.status, 201);
  const c = await call('POST', {op: 'join', code: c3, nick: '구경꾼'});
  // 봉인
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSPI'}, text: '이번 주는 뉴스를 덜 봐요'})).status, 401);
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSPI'}, text: '내일 사세요 꼭'}, {key: a.body.key})).body.error, 'word');
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'zz'}, text: '이번 주는 뉴스를 덜 봐요'}, {key: a.body.key})).body.error, 'bad_what');
  const s1 = await call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSPI'}, text: '이번 주는 뉴스를 덜 보기로 했어요'}, {key: a.body.key});
  assert.equal(s1.status, 201); assert.equal(s1.body.week, '2026-10-23'); assert.equal(s1.body.opensAt, '2026-10-23T11:00:00.000Z');
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSDAQ'}, text: '두 번째 편지를 써 봐요'}, {key: a.body.key})).body.error, 'already');
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'co', code: '005930', name: '삼성전자'}, text: '큰 회사 얘기만 들려요'}, {key: b.body.key})).status, 201);
  // 봉인 중: 수만 · 회원은 제 편지만
  const g0 = await call('GET'); assert.equal(g0.body.open, false); assert.equal(g0.body.count, 2); assert.equal(g0.body.letters, undefined); assert.equal(g0.body.mine, undefined);
  const ga = await call('GET', null, {key: a.body.key}); assert.equal(ga.body.mine.text, '이번 주는 뉴스를 덜 보기로 했어요'); assert.equal(ga.body.letters, undefined);
  assert.deepEqual(ga.body.subjects.map(s => s.name).sort(), ['삼성전자', '코스피']);
  assert.equal(ga.body.me.invites.length, 3); assert.equal(ga.body.me.invites[0].used, true);
  assert.equal((await call('POST', {op: 'learn', week: '2026-10-23', author: 'x'.repeat(22)}, {key: b.body.key})).body.error, 'sealed');
  // 여는 밤
  clock.t = KST('2026-10-23T20:00:00');
  const gn = await call('GET', null, {week: '2026-10-23'}); assert.equal(gn.body.open, true); assert.equal(gn.body.membersOnly, true); assert.equal(gn.body.letters, undefined);
  const gb = await call('GET', null, {key: b.body.key, week: '2026-10-23'}); assert.equal(gb.body.letters.length, 2);
  const la = gb.body.letters.find(l => l.nick === '보리차');
  assert.equal((await call('POST', {op: 'learn', week: '2026-10-23', author: la.id}, {key: b.body.key})).status, 200);
  assert.equal((await call('POST', {op: 'learn', week: '2026-10-23', author: la.id}, {key: b.body.key})).status, 200); // 두 번 눌러도 하나
  assert.equal((await call('POST', {op: 'learn', week: '2026-10-23', author: la.id}, {key: a.body.key})).body.error, 'self');
  assert.equal((await call('POST', {op: 'reply', week: '2026-10-23', author: la.id, text: '카톡 주세요'}, {key: b.body.key})).body.error, 'word');
  assert.equal((await call('POST', {op: 'reply', week: '2026-10-23', author: la.id, text: '저도 그랬어요'}, {key: b.body.key})).status, 201);
  assert.equal((await call('POST', {op: 'reply', week: '2026-10-23', author: la.id, text: '한 번 더'}, {key: b.body.key})).body.error, 'already');
  assert.equal((await call('POST', {op: 'look', week: '2026-10-23', author: la.id, text: '덜 봤더니 편했어요'}, {key: b.body.key})).body.error, 'not_mine');
  assert.equal((await call('POST', {op: 'look', week: '2026-10-23', author: la.id, text: '덜 봤더니 편했어요'}, {key: a.body.key})).status, 200);
  const g2 = await call('GET', null, {key: a.body.key, week: '2026-10-23'}), l2 = g2.body.letters.find(l => l.nick === '보리차');
  assert.equal(l2.learned, 1); assert.equal(l2.replies[0].text, '저도 그랬어요'); assert.equal(l2.look, '덜 봤더니 편했어요'); assert.equal(l2.letters, 1);
  // 신고 → 다른 회원에게는 가려짐 · 사장님은 봄 · 되살림
  const lb = g2.body.letters.find(l => l.nick === '새벽산책');
  assert.equal((await call('POST', {op: 'report', week: '2026-10-23', author: lb.id}, {key: c.body.key})).status, 200);
  assert.equal((await call('GET', null, {key: a.body.key, week: '2026-10-23'})).body.letters.length, 1);
  const go = await call('GET', null, {owner: OWNER, week: '2026-10-23'}); assert.equal(go.body.letters.find(l => l.id === lb.id).hidden, true);
  assert.equal((await call('POST', {op: 'restore', week: '2026-10-23', author: lb.id}, {owner: OWNER})).status, 200);
  assert.equal((await call('GET', null, {key: a.body.key, week: '2026-10-23'})).body.letters.length, 2);
  // 다음 주에는 새 편지
  assert.equal((await call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSDAQ'}, text: '다음 주 편지를 써 봐요'}, {key: a.body.key})).body.week, '2026-10-30');
});

test('문 — 다른 사이트 · 글 꼴 · 크기 · 방법', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  assert.equal((await call('POST', {op: 'mint'}, {owner: OWNER, origin: 'https://evil.example'})).status, 403);
  assert.equal((await call('PUT', {})).status, 405);
  const big = await handleLetter(new Request('https://aaa7377.com/api/letter', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({op: 'join', code: 'x'.repeat(5000)})}), {store, ownerHash: OWNER_HASH});
  assert.equal(big.status, 413);
  const txt = await handleLetter(new Request('https://aaa7377.com/api/letter', {method: 'POST', headers: {'content-type': 'text/plain'}, body: '{}'}), {store, ownerHash: OWNER_HASH});
  assert.equal(txt.status, 415);
  assert.equal((await call('GET', null, {week: '2026-10-22'})).status, 400);
  assert.equal((await call('POST', {op: 'seal', text: 'x'}, {key: 'A'.repeat(43)})).status, 401); // 없는 열쇠
});
