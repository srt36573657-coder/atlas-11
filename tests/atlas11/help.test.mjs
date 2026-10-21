// 고객센터 서버 셈 시험(lib/atlas11/help.mjs · site/next/help-rule.js) — 메모리 저장소 · 시계를 옮겨 봄
//   사장님 2026-10-21 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간」 · 23:05 말투 둘 · 23:09 「아 해 섹시하게」
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash, randomBytes} from 'node:crypto';
import {handleHelp, CAP, contactOf, cleanText, pageOf, ID_RE} from '../../lib/atlas11/help.mjs';
import {memoryStore} from '../../lib/atlas11/letter.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const devKey = () => randomBytes(32).toString('base64url');
function api(store, clock) {
  return async (method, path, body, {key, owner, origin, type} = {}) => {
    const headers = {'content-type': type ?? 'application/json'};
    if (key) headers['x-help-key'] = key;
    if (owner) headers['x-atlas-owner'] = owner;
    if (origin) headers.origin = origin;
    const req = new Request('https://aaa7377.com/api/help' + path, {method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined});
    const res = await handleHelp(req, {store, now: () => new Date(clock.t), ownerHash: OWNER_HASH});
    return {status: res.status, body: res.status === 405 ? null : await res.json()};
  };
}
const T0 = Date.parse('2026-10-21T00:00:00Z'); // 서울 아침 9시 — 하루 셈이 서울 날짜를 넘지 않게

test('연락처 꼴 — 휴대폰 · 집 전화 · +82 · 이메일은 잡고 종목 번호 · 날짜 · 금액은 지남', () => {
  for (const s of ['연락 010-1234-5678 주세요', '01012345678', '010 1234 5678', '+82 10-1234-5678', '(010)1234-5678', '０１０-１２３４-５６７８', '02-123-4567', '031 123 4567']) assert.equal(contactOf(s), 'phone', s);
  for (const s of ['메일 abc@naver.com', 'abc @ gmail . com', 'abc＠daum.net']) assert.equal(contactOf(s), 'email', s);
  for (const s of ['삼성전자 005930 이 안 열려요', 'S-Oil 010950 화면', '2026-10-21 기록이 이상해요', '10,000,000원', '매매일지 11번 질문', '010 은 이상한 숫자', '9시 30분에 열었어요', '2010년 이야기']) assert.equal(contactOf(s), null, s);
});

test('글 다듬기 — 보이지 않는 글자 · 빈 줄 · 12줄 · 500자 · 화면 이름', () => {
  assert.equal(cleanText('  안녕​하세요  \n\n\n둘째 줄 \r\n셋째'), '안녕하세요\n\n둘째 줄\n셋째');
  assert.equal(cleanText(Array.from({length: 20}, (_, i) => '줄' + i).join('\n')).split('\n').length, 12);
  assert.equal(Array.from(cleanText('가'.repeat(900))).length, 500);
  assert.equal(cleanText(42), '');
  assert.equal(pageOf('why'), 'why');
  assert.equal(pageOf('w/005930'), '');
  assert.equal(pageOf('WHY'), '');
});

test('한마디 보내기 → 내 글 → 사장님 읽음 · 지우기', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), key = devKey();
  assert.equal((await call('POST', '', {op: 'send', kind: 'note', tone: 'good', text: '줄 그림이 예뻐요', agree: true, page: 'why', voice: 'easy'})).status, 401); // 열쇠 없음
  assert.deepEqual((await call('POST', '', {op: 'send', kind: 'note', text: '갈래 없음', agree: true}, {key})).body, {error: 'tone'});
  assert.deepEqual((await call('POST', '', {op: 'send', kind: 'note', tone: 'good', text: '동의 없음'}, {key})).body, {error: 'agree'});
  assert.deepEqual((await call('POST', '', {op: 'send', kind: 'note', tone: 'good', text: ' ', agree: true}, {key})).body, {error: 'short'});
  assert.deepEqual((await call('POST', '', {op: 'send', kind: 'note', tone: 'want', text: '연락 010-1234-5678', agree: true}, {key})).body, {error: 'contact', what: 'phone'});
  const r = await call('POST', '', {op: 'send', kind: 'note', tone: 'good', text: '줄 그림이 예뻐요', agree: true, page: 'w/005930', voice: 'direct'}, {key});
  assert.equal(r.status, 200); assert.ok(ID_RE.test(r.body.id));
  const m = await call('GET', '/mine', null, {key});
  assert.equal(m.body.items.length, 1);
  assert.deepEqual(Object.keys(m.body.items[0]).sort(), ['answer', 'answeredAt', 'at', 'id', 'kind', 'status', 'text', 'tone', 'voice']); // 기기 해시 · 화면 이름은 돌려주지 않음
  assert.equal(m.body.items[0].voice, 'direct');
  // 저장소에는 열쇠가 아니라 해시만
  assert.ok(![...store._map.keys()].some(k => k.includes(key)) && ![...store._map.values()].some(v => v.includes(key)));
  // 남의 기기 · 사장님 아닌 사람
  assert.equal((await call('GET', '/mine', null, {key: devKey()})).body.items.length, 0);
  assert.equal((await call('GET', '/all')).status, 403);
  assert.equal((await call('POST', '', {op: 'read', id: r.body.id}, {owner: 'wrong-key-0000000000000000'})).status, 403);
  // 사장님 — 모두 보기 · 읽음
  const a = await call('GET', '/all', null, {owner: OWNER});
  assert.equal(a.body.counts.fresh, 1); assert.equal(a.body.items[0].page, ''); // 회사 번호는 버림
  assert.equal((await call('POST', '', {op: 'read', id: r.body.id}, {owner: OWNER})).status, 200);
  assert.equal((await call('GET', '/all', null, {owner: OWNER})).body.counts.fresh, 0);
  // 남의 글은 못 지움(없는 것과 같게) · 내 글은 지움 — 저장소에서 모두 사라짐
  assert.equal((await call('POST', '', {op: 'forget', id: r.body.id}, {key: devKey()})).status, 404);
  assert.equal((await call('POST', '', {op: 'forget', id: r.body.id}, {key})).status, 200);
  assert.equal([...store._map.keys()].filter(k => !k.startsWith('r/')).length, 0);
});

test('물음 → 사장님 답 · 모두에게 보이기(물음 글 다듬기) → 많이 묻는 것 · 거두기', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), key = devKey();
  const q = await call('POST', '', {op: 'send', kind: 'ask', text: '매매일지는 어디에 남아요?', agree: true, voice: 'easy'}, {key});
  assert.equal(q.status, 200);
  assert.equal((await call('GET', '/mine', null, {key})).body.items[0].status, 'new');
  assert.deepEqual((await call('POST', '', {op: 'answer', id: q.body.id, answer: ' '}, {owner: OWNER})).body, {error: 'short'});
  clock.t += 3600e3;
  const ans = await call('POST', '', {op: 'answer', id: q.body.id, answer: '가입하지 않으면 이 휴대폰에만 남아요.', public: true, pubQ: '매매일지는 어디에 남나요?'}, {owner: OWNER});
  assert.equal(ans.status, 200);
  const mine = (await call('GET', '/mine', null, {key})).body.items[0];
  assert.equal(mine.answer, '가입하지 않으면 이 휴대폰에만 남아요.'); assert.equal(mine.status, 'answered');
  const f = (await call('GET', '/faq')).body.items;
  assert.equal(f.length, 1); assert.equal(f[0].q, '매매일지는 어디에 남나요?'); assert.deepEqual(Object.keys(f[0]).sort(), ['a', 'at', 'id', 'q']);
  // 거두기(모두에게 안 보이기)
  await call('POST', '', {op: 'answer', id: q.body.id, answer: '가입하지 않으면 이 휴대폰에만 남아요.', public: false}, {owner: OWNER});
  assert.equal((await call('GET', '/faq')).body.items.length, 0);
  // 사장님이 지우면 물은 기기에서도 사라짐
  await call('POST', '', {op: 'drop', id: q.body.id}, {owner: OWNER});
  assert.equal((await call('GET', '/mine', null, {key})).body.items.length, 0);
});

test('잦기 — 10분 5개 · 하루 20개 · 사이트 하루 400개', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), key = devKey();
  const one = k => call('POST', '', {op: 'send', kind: 'note', tone: 'want', text: '바라는 것 ' + clock.t, agree: true}, {key: k});
  for (let i = 0; i < CAP.per10m; i++) assert.equal((await one(key)).status, 200);
  assert.deepEqual((await one(key)).body, {error: 'slow'});
  clock.t += 11 * 60e3; assert.equal((await one(key)).status, 200);
  for (let i = 0; i < 30 && (await call('GET', '/mine', null, {key})).body.items.length < CAP.perDay; i++) { clock.t += 11 * 60e3; await one(key); }
  clock.t += 11 * 60e3; assert.deepEqual((await one(key)).body, {error: 'day'});
  store._map.set('r/' + new Date(clock.t + 9 * 3600e3).toISOString().slice(0, 10) + '/all', JSON.stringify({n: CAP.dayAll}));
  assert.deepEqual((await one(devKey())).body, {error: 'busy'});
});

test('1년 지난 글은 읽을 때 지움 · 막는 길(다른 곳 · 글꼴 · 크기 · 모르는 일)', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), key = devKey();
  await call('POST', '', {op: 'send', kind: 'ask', text: '오래된 물음', agree: true}, {key});
  clock.t += (CAP.keepDays + 1) * 864e5;
  assert.equal((await call('GET', '/mine', null, {key})).body.items.length, 0);
  assert.equal([...store._map.keys()].filter(k => !k.startsWith('r/')).length, 0);
  assert.equal((await call('POST', '', {op: 'send', kind: 'ask', text: '다른 곳', agree: true}, {key, origin: 'https://evil.example'})).status, 403);
  assert.equal((await call('POST', '', {op: 'send'}, {key, type: 'text/plain'})).status, 415);
  assert.equal((await call('POST', '', 'x'.repeat(CAP.body + 10), {key})).status, 413);
  assert.equal((await call('POST', '', '{bad', {key})).status, 400);
  assert.equal((await call('POST', '', {op: 'nope'}, {key})).status, 400);
  assert.equal((await call('GET', '/nope')).status, 404);
  assert.equal((await call('PUT', '')).status, 405);
});

test('화면 글 — 쓰지 않을 말 0 · 망치는 길 낱말 0 · 말투 둘이 같은 칸을 다 가짐 · 처리방침에 고객센터', async () => {
  const fs = await import('node:fs');
  const read = f => fs.readFileSync(new URL('../../' + f, import.meta.url), 'utf8');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const {jsStrings} = await import('../../scripts/atlas11/next/rename.mjs');
  for (const f of ['site/next/p-help.js', 'site/next/help-rule.js']) {
    const bad = jsStrings(read(f)).map(x => x.s).flatMap(s => [...screenHits(s).map(w => `「${s}」 ${w}`), ...ruinHits(s).map(x => `「${s}」 ${x.word}`)]);
    assert.deepEqual(bad, [], f);
  }
  const {V} = await import('../../site/next/p-help.js');
  const shape = o => Object.entries(o).map(([k, v]) => k + ':' + (Array.isArray(v) ? 'a' + v.length : typeof v === 'object' ? '{' + Object.keys(v).sort().join(',') + '}' : 's')).sort().join(' ');
  assert.equal(shape(V.easy), shape(V.direct), '쉬운 말과 곧은 말이 같은 칸');
  assert.equal(V.easy.faq.length, V.direct.faq.length);
  const priv = read('site/privacy.html');
  assert.match(priv, /<li id="help">고객센터: /);
  assert.match(priv, /<code>atlas:help:dev<\/code>/);
  assert.match(priv, /고객센터 글: 남긴 날부터 1년이 지나면 지워요/);
  assert.match(priv, /The help center keeps/);
  assert.match(read('site/next/index.html'), /<footer class="foot"><a href="#\/help">고객센터<\/a>/);
});
