// 편지 여는 밤 서버 셈 시험(lib/atlas11/letter.mjs) — 메모리 저장소 · 시계를 옮겨 봉인 → 여는 밤
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {weekOf, opensAtOf, badWord, BAD, OKW, handleLetter, memoryStore, LIM, detachKakao} from '../../lib/atlas11/letter.mjs';
import {handleKakao, kakaoMemberOf} from '../../lib/atlas11/kakao.mjs';
import {memoryStore as kakaoMemory, memberHash} from '../../lib/atlas11/kakao-store.mjs';
import {createFakeKakao} from './fake-kakao/fake.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const KST = h => new Date(h + '+09:00').getTime();
function api(store, clock, extra = {}) { // extra = handleLetter 에 더 넘길 것(kakaoOf · kakaoWaitMs) · 부를 때 cookie 로 카카오 로그인 쿠키
  return async (method, body, {key, owner, week, origin, cookie} = {}) => {
    const url = 'https://aaa7377.com/api/letter' + (week ? '?week=' + week : '');
    const headers = {'content-type': 'application/json'};
    if (key) headers['x-atlas-letter'] = key;
    if (owner) headers['x-atlas-owner'] = owner;
    if (origin) headers.origin = origin;
    if (cookie) headers.cookie = cookie;
    const req = new Request(url, {method, headers, body: method === 'POST' ? JSON.stringify(body) : undefined});
    const res = await handleLetter(req, {store, now: () => new Date(clock.t), ownerHash: OWNER_HASH, ...extra});
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

test('거르는 말 빈틈(2026-10-18 [9] 6) — 서버 길에서도 점 · 줄표 · 넓은 숫자 · 한글 숫자 · 새 낱말이 막히고 보통 말 · 회사 이름은 지남', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  const [c1, c2, c3] = (await call('POST', {op: 'mint', n: 3}, {owner: OWNER})).body.codes;
  for (const nick of ['사.야', '무-조-건', '보_장', '수·익', '０１０', '공일공', '추천']) assert.equal((await call('POST', {op: 'join', code: c1, nick})).body.error, 'word', nick); // 별명
  const a = await call('POST', {op: 'join', code: c1, nick: '보리차'}), b = await call('POST', {op: 'join', code: c2, nick: '새벽산책'}), c = await call('POST', {op: 'join', code: c3, nick: '구경꾼'});
  assert.ok(a.status === 201 && b.status === 201 && c.status === 201);
  const seal = (text, key, what = {kind: 'idx', code: 'KOSPI'}) => call('POST', {op: 'seal', what, text}, {key});
  for (const t of ['이건 사.야 해요 정말로', '무-조-건 오를 거예요', '원금 보_장 해요 정말', '수·익 났어요 이번 주', '연락은 ０１０ 으로 해요', '연락은 공일공 으로 해요',
    'T.me/abc 로 와요 정말', '확실한 종목이에요', '추천 드려요 이번 주', '텔레 방으로 와요 정말', '오늘 이 종목 담아 둬요']) assert.equal((await seal(t, a.body.key)).body.error, 'word', t); // 봉인 글
  assert.equal((await seal('시장이 불확실해서 지켜보려고 해요', a.body.key)).status, 201); // 「불확실」 은 지남
  assert.equal((await seal('마음을 담아 이번 주를 지켜봐요', b.body.key)).status, 201); // 맺음말 「마음을 담아」 는 지남
  assert.equal((await seal('2010년에 처음 샀던 기억이 나요', c.body.key, {kind: 'co', code: '017670', name: 'SK텔레콤'})).status, 201); // 「2010년」 · 회사 이름 「SK텔레콤」 은 지남
  const d = (await call('POST', {op: 'mint', n: 1}, {owner: OWNER})).body.codes[0], e = await call('POST', {op: 'join', code: d, nick: '달빛'});
  assert.equal((await seal('이번 주 회사 얘기를 써 봐요', e.body.key, {kind: 'co', code: '123456', name: '무조건오르는회사'})).body.error, 'bad_what'); // 회사 이름도 같은 문
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

/* ── 카카오 회원이 초대장으로 들어오면 그 회원에 붙음(사장님 2026-10-18 00:15 order-0015 [4] 8 「편지 여는 밤 문은 지금처럼 초대장으로만 연다. 카카오 회원이 초대장을 쓰면 그 회원에 붙여라」) ── */
const letterRecs = store => [...store._map].filter(([k]) => k.startsWith('m/')).map(([, v]) => JSON.parse(v));
const mintN = async (call, n = 4) => (await call('POST', {op: 'mint', n}, {owner: OWNER})).body.codes;

test('카카오 붙이기(주머니 가짜) — 회원이면 편지 회원 기록에 붙음 · 아니거나 꺼짐 · 깨짐 · 느림 · 이상한 값은 오늘과 한 글자도 안 다름', async () => {
  const MH = 'K'.repeat(43);
  const mk = kakaoOf => { const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}; return {store, call: api(store, clock, {kakaoOf, kakaoWaitMs: 60})}; };
  // ① 오늘(카카오 연결 없음) — 답 · 기록 꼴
  const T = mk(null), [t1] = await mintN(T.call);
  const today = await T.call('POST', {op: 'join', code: t1, nick: '보리차'});
  assert.equal(today.status, 201); assert.deepEqual(Object.keys(today.body).sort(), ['invites', 'key', 'nick']);
  const shape = Object.keys(letterRecs(T.store)[0]).sort();
  assert.deepEqual(shape, ['at', 'code', 'from', 'id', 'invites', 'nick', 'schema']);
  // ② 카카오 회원 — 붙음 · 부름 한 번(들어오기에서만) · 그 밖 칸은 오늘과 같음 · 화면 답에 회원 표 없음
  const calls = [], K = mk(req => { calls.push(req.method); return MH; }), [k1, k2, k3] = await mintN(K.call);
  const kj = await K.call('POST', {op: 'join', code: k1, nick: '보리차'});
  assert.equal(kj.status, 201); assert.equal(kj.body.kakao, true); assert.deepEqual(Object.keys(kj.body).sort(), ['invites', 'kakao', 'key', 'nick']);
  assert.ok(!JSON.stringify(kj.body).includes(MH), '답에 회원 표 0');
  const [rec] = letterRecs(K.store); assert.equal(rec.kakao, MH);
  const {kakao: _k, ...rest} = rec; assert.deepEqual(Object.keys(rest).sort(), shape, '붙는 칸 하나 말고는 오늘과 같은 꼴');
  assert.equal((await K.call('POST', {op: 'seal', what: {kind: 'idx', code: 'KOSPI'}, text: '이번 주는 뉴스를 덜 보기로 했어요'}, {key: kj.body.key})).status, 201);
  const g = await K.call('GET', null, {key: kj.body.key}); assert.ok(!JSON.stringify(g.body).includes(MH), '모습 답에 회원 표 0');
  assert.equal(g.body.member, true);
  assert.deepEqual(calls, ['POST'], '들어오기 한 번만 물음(만들기 · 봉인 · 모습은 안 부름)');
  // ③ 문은 그대로 초대장으로만 — 카카오 회원도 초대장 없이는 못 들어옴 · 한 번 쓴 초대장은 못 씀 · 열쇠 없이 보면 회원 아님
  assert.equal((await K.call('POST', {op: 'join', code: 'x'.repeat(16), nick: '손님둘'})).body.error, 'no_code');
  assert.equal((await K.call('POST', {op: 'join', code: 'short', nick: '손님둘'})).body.error, 'bad_code');
  assert.equal((await K.call('POST', {op: 'join', code: k1, nick: '손님둘'})).body.error, 'code_used');
  assert.equal((await K.call('GET')).body.member, false);
  assert.equal(letterRecs(K.store).length, 1, '문이 열리지 않아 회원은 그대로 하나');
  // ④ 못 붙는 길 — 오늘과 같은 답 · 같은 기록 꼴(붙는 칸 · 답 칸 0)
  const bad = {'회원 아님(null)': () => null, '꺼짐(undefined)': () => undefined, '깨짐(던짐)': () => { throw Error('boom'); }, '깨짐(거절)': async () => { throw Error('boom'); },
    '느림(안 끝남)': () => new Promise(() => {}), '이상한 값(짧음)': () => 'abc', '이상한 값(수)': () => 42, '이상한 값(43자 아님)': () => 'K'.repeat(44), '이상한 값(글자 밖)': () => '!'.repeat(43)};
  for (const [name, fn] of Object.entries(bad)) {
    const X = mk(fn), [c1] = await mintN(X.call, 1), r = await X.call('POST', {op: 'join', code: c1, nick: '보리차'});
    assert.equal(r.status, 201, name); assert.deepEqual(Object.keys(r.body).sort(), ['invites', 'key', 'nick'], name);
    assert.deepEqual(Object.keys(letterRecs(X.store)[0]).sort(), shape, name);
  }
  // ⑤ 떼기 — 카카오 탈퇴 · 지워 달라는 말에 편지 회원에서 회원 표만 뗌(별명 · 편지는 그대로 · 두 번째는 0)
  const k2j = await K.call('POST', {op: 'join', code: kj.body.invites[0], nick: '새벽산책'}); assert.equal(k2j.body.kakao, true);
  assert.equal(letterRecs(K.store).filter(m => m.kakao === MH).length, 2);
  assert.equal(await detachKakao(K.store, MH), 2); assert.equal(await detachKakao(K.store, MH), 0);
  assert.deepEqual(letterRecs(K.store).map(m => m.nick).sort(), ['보리차', '새벽산책']); assert.ok(letterRecs(K.store).every(m => !('kakao' in m)));
  assert.equal(await detachKakao(K.store, 'nope'), 0); assert.equal(await detachKakao(K.store, undefined), 0);
  assert.equal((await K.call('GET', null, {key: kj.body.key})).body.mine.text, '이번 주는 뉴스를 덜 보기로 했어요', '편지 글은 그대로');
  void k2; void k3;
});

test('카카오 붙이기(진짜 kakaoMemberOf + 가짜 카카오 로그인) — 회원이면 그 회원 표가 붙고 · 탈퇴하면 안 붙고 · 스위치 꺼짐 · 열쇠 없음이면 안 붙음', async () => {
  const SITE = 'https://aaa7377.com', T0 = Date.parse('2026-10-19T00:00:00Z');
  const ENVK = {ATLAS_KAKAO_REST_KEY: 'restKEY0aaaaaaaaaaaaaaaaaaaaaaaa', ATLAS_KAKAO_CLIENT_SECRET: 'clientSECRET0bbbbbbbbbbbbbbbbbbbbb', ATLAS_KAKAO_ADMIN_KEY: 'adminKEY0cccccccccccccccccccccccc', ATLAS_KAKAO_HASH_SECRET: 'hashSECRET0dddddddddddddddddddddddddddddd'};
  const ks = kakaoMemory(), fake = createFakeKakao({restKey: ENVK.ATLAS_KAKAO_REST_KEY, clientSecret: ENVK.ATLAS_KAKAO_CLIENT_SECRET, adminKey: ENVK.ATLAS_KAKAO_ADMIN_KEY});
  const kdeps = {config: {on: true}, store: ks, now: () => new Date(T0), fetch: (u, init) => fake.fetch(u, init), ownerHash: OWNER_HASH, log: () => {}};
  // 카드 단추(누름 1) → 카카오 동의(누름 2) → 로그인 쿠키
  const start = await handleKakao(new Request(SITE + '/api/kakao/start?to=%2Fletter.html'), ENVK, kdeps);
  assert.equal(start.status, 302);
  const stateCookie = start.headers.getSetCookie()[0].split(';')[0], authUrl = start.headers.get('location');
  const agree = new URL(/id="agree" href="([^"]+)"/.exec(await (await fake.handle(new Request(authUrl))).text())[1].replace(/&amp;/g, '&'), authUrl).href;
  const back = await fake.handle(new Request(agree));
  const cb = await handleKakao(new Request(back.headers.get('location'), {headers: {cookie: stateCookie}}), ENVK, kdeps);
  assert.equal(cb.status, 302);
  const login = cb.headers.getSetCookie().find(c => c.startsWith('__Host-kk_login=')).split(';')[0], mh = memberHash(String([...fake.users.keys()][0]), ENVK.ATLAS_KAKAO_HASH_SECRET);
  assert.ok(login.startsWith('__Host-kk_login=' + mh + '.'));
  const kakaoOf = (env = ENVK, on = true) => req => kakaoMemberOf(req, env, {config: {on}, store: ks, now: () => new Date(T0)});
  const run = async (name, kof, cookie) => {
    const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock, {kakaoOf: kof}), [c1] = await mintN(call, 1);
    const r = await call('POST', {op: 'join', code: c1, nick: '보리차'}, {cookie}); assert.equal(r.status, 201, name);
    return {r, rec: letterRecs(store)[0]};
  };
  // ① 로그인한 카카오 회원 → 그 회원 표가 붙음
  const a = await run('회원', kakaoOf(), login); assert.equal(a.rec.kakao, mh); assert.equal(a.r.body.kakao, true);
  // ② 쿠키가 없거나 틀리면 · 스위치가 꺼졌거나 · 열쇠 넷 가운데 하나라도 없으면 붙지 않음(오늘과 같은 길)
  for (const [name, kof, cookie] of [['쿠키 없음', kakaoOf(), undefined], ['쿠키 틀림', kakaoOf(), '__Host-kk_login=nope'], ['다른 회원 표 · 틀린 증표', kakaoOf(), '__Host-kk_login=' + mh + '.' + 'A'.repeat(43)],
    ['스위치 꺼짐', kakaoOf(ENVK, false), login], ['열쇠 없음', kakaoOf({...ENVK, ATLAS_KAKAO_ADMIN_KEY: ''}), login], ['열쇠 모두 없음', kakaoOf({}), login]]) {
    const x = await run(name, kof, cookie); assert.ok(!('kakao' in x.rec), name); assert.equal(x.r.body.kakao, undefined, name);
  }
  // ③ 탈퇴하면(서버 사본 · 로그인 기록 지움) 그 쿠키로는 안 붙음
  const wd = await handleKakao(new Request(SITE + '/api/kakao/withdraw', {method: 'POST', headers: {cookie: login, origin: SITE, 'sec-fetch-site': 'same-origin'}}), ENVK, kdeps);
  assert.equal(wd.status, 200);
  const b = await run('탈퇴 뒤', kakaoOf(), login); assert.ok(!('kakao' in b.rec));
  // ④ 함수 파일은 카카오 모듈을 들어오기 때만 불러 붙임 — 못 불러도 편지는 그대로(넷리파이 묶음에 그대로 따라감)
  const fnSrc = fs.readFileSync(new URL('../../functions/atlas11/letter.mjs', import.meta.url), 'utf8');
  assert.match(fnSrc, /kakaoOf\b/); assert.match(fnSrc, /import\('\.\.\/\.\.\/lib\/atlas11\/kakao\.mjs'\)/); assert.doesNotMatch(fnSrc, /^import .*kakao/m, '카카오 모듈은 맨 위에서 불러 오지 않음(깨져도 편지는 열림)');
});

test('친구 3명 확인 번호 칸(letter.js · 소스 검사) — 사장님 열쇠 기기에서만 묻고 · 켜짐일 때만 그리고 · 사장님 열쇠 머리글로 확인 · 결과 글 셋 · 404 면 칸이 사라짐', () => { // 2026-10-18 order-0015 [4] 7
  const src = fs.readFileSync(new URL('../../site/letter.js', import.meta.url), 'utf8');
  // ① 켜졌나 = /api/kakao/me 를 사장님 열쇠 기기(S.owner)에서만 물음 — 다른 기기는 카카오 길을 한 번도 안 부름
  assert.match(src, /KK = S\?\.owner \? await kakaoOn\(\) : false/);
  assert.match(src, /fetch\('\/api\/kakao\/me', \{cache: 'no-store'\}\)/);
  assert.match(src, /return r\.status === 200/, '켜짐 = 200 일 때만(404 · 못 닿음은 꺼짐)');
  // ② 칸은 사장님 + 켜짐일 때만 그려짐
  assert.match(src, /if \(S\?\.owner\) \{ kids\.push\(ownerCard\(\)\); if \(KK\) kids\.push\(kakaoCard\(\)\); \}/);
  assert.equal((src.match(/kakaoCard\(\)/g) ?? []).length, 2, 'kakaoCard() 는 정의 한 곳 · 부르는 곳 한 곳');
  // ③ 확인 = GET /api/kakao/verify?code= + 사장님 열쇠 머리글(번호는 encodeURIComponent)
  assert.match(src, /fetch\('\/api\/kakao\/verify\?code=' \+ encodeURIComponent\(code\), \{headers: \{'x-atlas-owner': ownerKey\(\) \?\? ''\}, cache: 'no-store'\}\)/);
  // ④ 결과 글 셋(서버 verify 몸: 없는 번호 {ok:false} · 처음 {ok:true, used:false} · 이미 {ok:true, used:true, usedAt} — K1c kakao.test.mjs 가 서버 쪽을 잼)
  assert.match(src, /st === 200 && j\.ok === true && j\.used === false\) say\('ok', '처음 확인'/);
  assert.match(src, /st === 200 && j\.ok === true\) say\('', '이미 확인한 번호'/);
  assert.match(src, /st === 200\) say\('', '없는 번호'/);
  assert.match(src, /st === 403\) say\('', why\(\{error: 'owner_only'\}\)\)/);
  // ⑤ 404(카카오 가입이 꺼짐) → 칸을 지우고 다시 그림
  assert.match(src, /st === 404\) \{ KK = false; render\(\); return; \}/);
  // ⑥ 글은 textContent 로만 · 누르는 동안 단추를 잠가 한 번만 감(서버가 처음 맞댈 때 「확인함」으로 적음)
  assert.doesNotMatch(src, /innerHTML/);
  assert.match(src, /go\.disabled = true; say\('', '맞대는 중이에요…'\)/);
  assert.match(src, /go\.disabled = false;\s*\n\s*if \(st === 404\)/, '응답을 받은 뒤에만 단추를 풂');
  // ⑦ 서버 verify 는 사장님 열쇠가 없으면 403 — 화면이 믿는 약속(몸 모양)을 K1c 코드에서 한 번 더 맞대 봄
  const ks = fs.readFileSync(new URL('../../lib/atlas11/kakao-store.mjs', import.meta.url), 'utf8');
  assert.match(ks, /if \(!ownerKeyOk\(ownerKey, ownerHash\)\) return R\(403, \{error: 'owner_only'\}\)/);
  assert.match(ks, /out = \{ok: true, used: true, at: p\.at \?\? null, usedAt: p\.used\}/);
  assert.match(ks, /return R\(200, \{ok: false, used: false\}\)/);
});
