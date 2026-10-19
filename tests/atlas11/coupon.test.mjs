// 커피 쿠폰 시험(사장님 2026-10-19 13:54 「11단계다 하면 … 포인트 쌓이고 … 커피쿠폰 한장」 · 13:58 「열번 해야 해 한달에 한번 어 내가 보낼거야」 · lib/atlas11/coupon.mjs)
import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {RULE, pointDays, couponPlan, memberCoupon, verifyCoupon, listCoupons, couponCode, showCoupon} from '../../lib/atlas11/coupon.mjs';
import {memoryStore, verifyCode, storeUpdate} from '../../lib/atlas11/kakao-store.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';
import * as C from '../../site/next/coupon-rule.js';

const SECRET = 'x'.repeat(40), MH = 'A'.repeat(43);
const rec = (day, ok = true) => ({at: day + 'T03:00:00.000Z', code: '005930', name: '삼성전자', answers: ok ? Array(11).fill(1) : Array(10).fill(1)});
const days = (from, n) => Array.from({length: n}, (_, i) => { const d = new Date(Date.parse(from) + i * 864e5); return d.toISOString().slice(0, 10); });

test('규칙 — 열 번 · 하루 한 번 · 한 달 한 장 · 답 열하나', () => {
  assert.deepEqual({...RULE}, {need: 10, perDay: 1, perMonth: 1, answers: 11});
});
test('점수 — 끝까지 답한 기록만 · 하루 1점 · 앞날 기록 0', () => {
  const now = Date.parse('2026-10-20T03:00:00Z');
  const r = [rec('2026-10-01'), rec('2026-10-01'), rec('2026-10-02', false), rec('2026-10-03'), rec('2026-10-25')];
  assert.deepEqual(pointDays(r, {now}), ['2026-10-01', '2026-10-03']);
  assert.deepEqual(pointDays(r, {now, since: '2026-10-01'}), ['2026-10-03']);
});
test('화면 셈(site/next/coupon.js)이 서버 셈과 같음', () => {
  const now = Date.parse('2026-10-20T03:00:00Z'), r = [...days('2026-10-01', 12).map(d => rec(d)), rec('2026-10-05')];
  assert.deepEqual(C.pointDays(r, {now}), pointDays(r, {now}));
  assert.deepEqual(C.RULE, {...RULE});
});
test('열 번 차면 쿠폰 한 장 · 같은 달 두 장 없음 · 다음 달 다시', async () => {
  const s = memoryStore(), recs = days('2026-10-01', 10).map(d => rec(d));
  const a = await memberCoupon(s, MH, recs.slice(0, 9), {secret: SECRET, now: new Date('2026-10-12T03:00:00Z')});
  assert.equal(a.n, 9); assert.equal(a.code, null);
  const b = await memberCoupon(s, MH, recs, {secret: SECRET, now: new Date('2026-10-12T03:00:00Z')});
  assert.equal(b.code, showCoupon(couponCode(MH, '2026-10', SECRET))); assert.equal(b.n, 0);
  const more = [...recs, ...days('2026-10-13', 12).map(d => rec(d))];
  const c = await memberCoupon(s, MH, more, {secret: SECRET, now: new Date('2026-10-30T03:00:00Z')});
  assert.equal(c.codes.length, 1); assert.equal(c.wait, true); assert.equal(c.n, 10);
  const d = await memberCoupon(s, MH, more, {secret: SECRET, now: new Date('2026-11-01T03:00:00Z')});
  assert.equal(d.codes.length, 2); assert.equal(d.code, showCoupon(couponCode(MH, '2026-11', SECRET)));
});
test('사장님 맞대기 — 처음 「보냄」 표시 · 두 번째는 이미 보냄 · 목록에 사람 표 없음', async () => {
  const s = memoryStore(), recs = days('2026-10-01', 10).map(d => rec(d));
  const m = await memberCoupon(s, MH, recs, {secret: SECRET, now: new Date('2026-10-12T03:00:00Z')});
  const code = m.code.replace(/-/g, '');
  const v1 = await verifyCoupon(s, code, {secret: SECRET, update: storeUpdate});
  assert.equal(v1.ok, true); assert.equal(v1.used, false); assert.equal(v1.kind, 'coffee');
  const v2 = await verifyCoupon(s, code, {secret: SECRET, update: storeUpdate});
  assert.equal(v2.used, true);
  const L = await listCoupons(s);
  assert.equal(L.length, 1); assert.deepEqual(Object.keys(L[0]).sort(), ['at', 'month', 'used']);
});
test('관리자 맞대기 길(kakao-store verifyCode)이 커피 번호도 받음 · 사장님 열쇠 아니면 403', async () => {
  const s = memoryStore(), recs = days('2026-10-01', 10).map(d => rec(d));
  const m = await memberCoupon(s, MH, recs, {secret: SECRET, now: new Date('2026-10-12T03:00:00Z')});
  const no = await verifyCode(s, m.code, {ownerKey: 'nope', secret: SECRET});
  assert.equal(no.status, 403);
  const KEY = 'test-owner-key-0123456789', HASH = createHash('sha256').update(KEY).digest('hex');
  const ok = await verifyCode(s, m.code, {ownerKey: KEY, ownerHash: HASH, secret: SECRET});
  assert.equal(ok.status, 200); assert.equal(ok.body.ok, true); assert.equal(ok.body.kind, 'coffee'); assert.equal(ok.body.used, false);
  const again = await verifyCode(s, m.code, {ownerKey: KEY, ownerHash: HASH, secret: SECRET});
  assert.equal(again.body.used, true);
  const none = await verifyCode(s, 'ABCD-EFGH-JKMN', {ownerKey: KEY, ownerHash: HASH, secret: SECRET});
  assert.equal(none.body.ok, false);
  assert.equal(typeof OWNER_KEY_SHA256, 'string');
});
