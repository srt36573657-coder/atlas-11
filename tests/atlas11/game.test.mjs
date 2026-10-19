// 가짜 돈 연습 시험(사장님 2026-10-19 15:02 「가상머니 10억씩 … 30억을 만들면 … 10장」 · 15:04 「일단해」 · site/next/game-rule.js · lib/atlas11/game.mjs)
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {GAME, newAccount, trade, valueOf, eok, okAccount} from '../../site/next/game-rule.js';
import {gameState, gameTrade, listPrizes, prizeCode} from '../../lib/atlas11/game.mjs';
import {memoryStore, storeUpdate, verifyCode} from '../../lib/atlas11/kakao-store.mjs';

const SECRET = 'y'.repeat(40), MH = 'B'.repeat(43);
test('처음 10억 · 목표 30억 · 상품권 10만 원 열 장', () => {
  assert.equal(GAME.start, 1e9); assert.equal(GAME.goal, 3e9); assert.deepEqual({...GAME.prize}, {count: 10, each: 100000});
  const a = newAccount(); assert.equal(a.cash, 1e9); assert.ok(okAccount(a));
});
test('사기 · 팔기 — 현금보다 많이 못 삼 · 가진 것보다 많이 못 팜 · 평균값으로 산 돈을 뺌', () => {
  let a = newAccount();
  assert.equal(trade(a, {code: '005930', side: 'b', q: 5000, px: 234000}).why, 'cash');
  let r = trade(a, {code: '005930', side: 'b', q: 1000, px: 234000}); assert.ok(r.ok); a = r.acc;
  assert.equal(a.cash, 1e9 - 234e6); assert.deepEqual(a.pos['005930'], {q: 1000, cost: 234e6});
  assert.equal(trade(a, {code: '005930', side: 's', q: 1001, px: 1}).why, 'hold');
  r = trade(a, {code: '005930', side: 's', q: 400, px: 300000}); assert.ok(r.ok); a = r.acc;
  assert.equal(a.cash, 1e9 - 234e6 + 120e6); assert.deepEqual(a.pos['005930'], {q: 600, cost: 140.4e6});
  assert.equal(trade(a, {code: 'bad', side: 'b', q: 1, px: 1}).why, 'code');
  assert.equal(trade(a, {code: '005930', side: 'b', q: 0, px: 1}).why, 'qty');
});
test('합계 · 값 모르면 산 돈으로 · 그때는 상 아님', () => {
  const a = trade(newAccount(), {code: '005930', side: 'b', q: 1000, px: 1e6}).acc;
  assert.equal(valueOf(a, {'005930': 3e6}).total, 3e9); assert.equal(valueOf(a, {'005930': 3e6}).won, true);
  const u = valueOf(a, {}); assert.equal(u.won, false); assert.deepEqual(u.unknown, ['005930']);
});
test('원 글 — 억 · 만', () => { assert.equal(eok(1e9), '10억 원'); assert.equal(eok(1234567890), '12억 3,456만 원'); assert.equal(eok(0), '0원'); });
test('서버 — 값은 서버가 받음 · 30억 넘으면 상 번호 한 번 · 사장님 맞대기 · 목록에 사람 표 없음', async () => {
  const s = memoryStore(); let px = 1e6;
  const deps = {secret: SECRET, priceOf: async () => px, update: storeUpdate, now: new Date('2026-10-20T03:00:00Z')};
  const st0 = await gameState(s, MH, deps); assert.equal(st0.value.total, 1e9); assert.equal(st0.prize, null);
  const t = await gameTrade(s, MH, {code: '005930', side: 'b', q: 1000}, deps); assert.ok(t.ok); assert.equal(t.state.value.total, 1e9);
  px = 3e6; const st1 = await gameState(s, MH, deps);
  assert.equal(st1.value.won, true); assert.match(st1.prize, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  const st2 = await gameState(s, MH, deps); assert.equal(st2.prize, st1.prize);
  assert.equal((await listPrizes(s)).length, 1); assert.deepEqual(Object.keys((await listPrizes(s))[0]).sort(), ['at', 'used']);
  const KEY = 'test-owner-key-0123456789', HASH = createHash('sha256').update(KEY).digest('hex');
  const v = await verifyCode(s, st1.prize, {ownerKey: KEY, ownerHash: HASH, secret: SECRET});
  assert.equal(v.body.kind, 'prize'); assert.equal(v.body.used, false);
  assert.equal((await verifyCode(s, st1.prize, {ownerKey: KEY, ownerHash: HASH, secret: SECRET})).body.used, true);
  assert.equal(prizeCode(MH, SECRET).length, 12);
});
test('서버 — 값을 못 받으면 사고팔기 안 됨', async () => {
  const s = memoryStore(); const r = await gameTrade(s, MH, {code: '005930', side: 'b', q: 1}, {secret: SECRET, priceOf: async () => null, update: storeUpdate});
  assert.equal(r.ok, false); assert.equal(r.why, 'price');
});
