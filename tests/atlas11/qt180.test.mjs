// 180곳(우량주 그리고 시대 트렌드) — 2026-10-04 18:10 사장님 「이제 이런식으로 180개 회사를 찾는다 우량주 그리고 시대 트랜드 주식만」 · 18:24 「알아서 해」
// 바뀌지 않는 실제 파일로 본다: 10/4 새벽 원자료(reports/atlas11/universe/2026-10-04/bundle.json.gz) · 그 원자료로 고른 제안(2026-10-04-qt180) · 9/28 입력 사본
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {QT180, TREND_GROUPS, trendGroupOf, selectQualityTrend, failsOf} from '../../lib/atlas11/universe.mjs';
import {proposeFromBundle, candidatesFromBundle, lastCompletedSession} from '../../scripts/atlas11/collect_universe.mjs';
import {buildBoard, validateBoard} from '../../lib/atlas11/board.mjs';
import {collectContext} from '../../scripts/atlas11/collect_context.mjs';
import {classifyRun} from '../../scripts/atlas11/scheduler.mjs';
import {alreadyDone} from '../../scripts/atlas11/already_done.mjs';
import {UNIVERSE_CONFIG} from '../../lib/atlas11/universe-switch.mjs';
import {root, readJSON, tempRoot, INPUT_928} from './helpers.mjs';

const BUNDLE = 'reports/atlas11/universe/2026-10-04/bundle.json.gz', DIR = 'reports/atlas11/universe/2026-10-04-qt180';
const bundle = async () => JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root, BUNDLE))).toString('utf8'));

test('고르기 qt180-v1: 우량 네 조건을 모두 넘은 회사는 전부(146곳) · 남은 34자리는 트렌드 8갈래 업종에서 시가총액 큰 순 · 같은 원자료로 다시 고르면 저장된 제안과 같다', async () => {
  const b = await bundle(), proposal = await readJSON(DIR + '/proposal.json'), input = await readJSON(INPUT_928);
  const sessions = input.calendar.sessions, asOf = lastCompletedSession(sessions, b.now);
  const cands = candidatesFromBundle(b, {sessions, asOf, input});
  const sel = selectQualityTrend(cands, QT180);
  assert.equal(sel.ok, true); assert.equal(sel.picked.length, 180); assert.equal(new Set(sel.picked.map(c => c.code)).size, 180);
  const q = sel.picked.filter(c => c.kind === 'quality'), t = sel.picked.filter(c => c.kind === 'trend');
  assert.equal(q.length, 146); assert.equal(t.length, 34);
  assert.ok(q.every(c => failsOf(c, QT180).length === 0), '우량은 네 조건을 모두 넘음');
  assert.ok(t.every(c => failsOf(c, QT180).length > 0 && trendGroupOf(c.sector) && c.capRank <= 300 && c.history?.ok), '트렌드는 우량 조건은 못 넘었지만 8갈래 업종 · 300위 안 · 가격 이력 고름');
  assert.ok(cands.filter(c => !failsOf(c, QT180).length).every(c => q.some(x => x.code === c.code)), '조건을 넘은 회사는 하나도 빠지지 않음');
  const size = xs => xs.map(c => c.marketCapEok); assert.deepEqual(size(t), [...size(t)].sort((x, y) => y - x), '트렌드는 시가총액 큰 순');
  const leftOut = cands.filter(c => failsOf(c, QT180).length && trendGroupOf(c.sector) && c.history?.ok && c.capRank <= 300 && !t.some(x => x.code === c.code));
  assert.ok(leftOut.every(c => c.marketCapEok <= t.at(-1).marketCapEok), '뽑히지 않은 트렌드 회사는 뽑힌 가장 작은 회사보다 크지 않음');
  assert.deepEqual(TREND_GROUPS.map(g => g.label), ['AI·반도체', '전력·원전·에너지', '2차전지', '조선·방산·우주', '기계·로봇·원전 설비', '바이오·헬스', 'K-뷰티·푸드·콘텐츠', 'AI 플랫폼·소프트웨어']);
  // 저장된 제안(2026-10-04 18:16 실행)과 같은 회사 · 같은 차례
  const again = proposeFromBundle(b, {input, now: proposal.createdAt, rules: QT180}); // 입력은 고정 사본(9/28 · 같은 52곳) — 바꾼 뒤의 input.json 에 기대지 않게
  assert.deepEqual(again.proposal.picked.map(p => p.code), proposal.picked.map(p => p.code));
  assert.deepEqual(proposal.picked.map(p => p.code), sel.picked.map(c => c.code));
});

test('설정 기록: 10월 6일(화)로 잡았던 180곳(qt180) 바꾸기는 업종 36개(i36)로 대신했다고 history 에 남고 · 그 새 입력 파일은 해시 그대로 보관', async () => {
  const cfg = await readJSON(UNIVERSE_CONFIG), h = cfg.history?.find(x => x.next?.id === 'u2-qt180-v1-2026-10-04');
  assert.ok(h, 'qt180 설정이 history 에 남음'); assert.match(h.status, /대신함/);
  const text = await fs.readFile(path.join(root, h.next.input), 'utf8'), next = JSON.parse(text);
  assert.equal(createHash('sha256').update(text).digest('hex'), h.next.inputSHA256);
  assert.equal(next.universe.id, h.next.id); assert.equal(next.assets.length, 180); assert.equal(new Set(next.assets.map(a => a.code)).size, 180);
  assert.ok(next.assets.every(a => a.prices.filter(p => p.close > 0).length >= 260), '1년 숫자를 셀 만큼(260거래일 이상)');
  assert.ok(cfg.history.some(x => x.next?.id === 'u2-q52-v2-2026-10-04'), '그 전 52곳 설정도 기록으로 남음');
});

test('판 묶음(qt180 180곳 입력으로): 업종 칸이 회사를 한 번씩만 · 요즘 불장 업종(오른 업종만 · 11개까지 · 큰 순) · 다음 불장 후보(불장 업종 밖 · 오른 회사만 · 한 업종 2곳까지 · 22곳까지) · 묶음 검사가 고친 판을 잡음', async () => {
  const next = await readJSON(DIR + '/next-input.json'), now = '2026-10-04T09:30:00.000Z';
  const files = buildBoard({input: next, now}), b = files.get('board.json');
  assert.equal(b.companies.length, 180); assert.deepEqual(b.kinds, {quality: 146, trend: 34, profit: 0, size: 0});
  assert.equal(b.groups.reduce((s, g) => s + g.count, 0), 180);
  assert.equal(b.groups.length, new Set(next.assets.map(a => a.sector)).size, '업종 칸 = 네이버 업종 수');
  assert.ok(b.companies.every(c => b.groups.find(g => g.codes.includes(c.code)).id === c.group.id));
  const hot = b.hot.items, nx = b.next.items;
  assert.ok(hot.length <= 11 && hot.every((x, i) => x.change20 > 0 && (!i || hot[i - 1].change20 >= x.change20)));
  assert.deepEqual(hot.map(x => x.id), b.groups.filter(g => g.change20 > 0).slice(0, 11).map(g => g.id), '불장 = 20거래일 오름이 가장 큰 업종부터');
  const hotIds = new Set(hot.map(x => x.id)), per = {};
  for (const x of nx) per[x.groupId] = (per[x.groupId] ?? 0) + 1;
  assert.ok(nx.length <= 22 && nx.every((x, i) => x.change20 > 0 && !hotIds.has(x.groupId) && (!i || nx[i - 1].change20 >= x.change20)) && Object.values(per).every(v => v <= 2));
  const c20 = c => c.c.length === 21 ? c.c[20] / c.c[0] - 1 : null, g0 = b.groups[0], cs = g0.codes.map(code => b.companies.find(c => c.code === code));
  assert.ok(Math.abs(g0.change20 - cs.map(c20).filter(v => v != null).reduce((t, v) => t + v, 0) / cs.filter(c => c20(c) != null).length) < 1e-5, '업종 20거래일 = 회사들 평균(종가 21개로 셈)');
  assert.equal(validateBoard(files, {input: next, now}), true);
  const tamper = (fn, re) => { const broken = new Map(files), bb = structuredClone(b); fn(bb); broken.set('board.json', bb); const m = structuredClone(files.get('manifest.json')); m.files['board.json'].sha256 = createHash('sha256').update(JSON.stringify(bb)).digest('hex'); broken.set('manifest.json', m); assert.throws(() => validateBoard(broken, {input: next, now}), re); };
  tamper(bb => { bb.groups[0].codes.push(bb.groups[1].codes[0]); bb.groups[0].count++; }, /BOARD_GROUPS/);
  tamper(bb => { bb.hot.items.reverse(); }, /BOARD_HOT/);
  tamper(bb => { const hg = bb.groups.find(g => g.hot), c = bb.companies.find(x => x.code === hg.codes[0]); bb.next.items[0] = {code: c.code, name: c.name, groupId: hg.id, groupLabel: hg.label, change20: c.change20, kind: c.kind}; }, /BOARD_NEXT/);
});

test('관측 수집: 바꾸는 날에는 새 묶음 회사도 함께 모은다(바꾼 첫날 저녁부터 공시·기사가 보이게) · 바꾸기 전 날에는 지금 회사만', async () => {
  const dir = await tempRoot(), old = await readJSON(INPUT_928);
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true}); await fs.mkdir(path.join(dir, 'config/atlas11'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json')); await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  const extra = old.assets.slice(0, 8).map((a, i) => ({...a, code: String(910000 + i * 10), name: '가짜' + i}));
  const next = {...old, assets: [...old.assets.slice(0, 26), ...extra], universe: {id: 'u-test', label: '가짜 34곳'}}, text = JSON.stringify(next);
  await fs.mkdir(path.join(dir, 'reports/atlas11/universe/t'), {recursive: true}); await fs.writeFile(path.join(dir, 'reports/atlas11/universe/t/next.json'), text);
  await fs.writeFile(path.join(dir, UNIVERSE_CONFIG), JSON.stringify({next: {id: 'u-test', count: 34, input: 'reports/atlas11/universe/t/next.json', inputSHA256: createHash('sha256').update(text).digest('hex'), switchOn: '2026-09-29'}}));
  const fetcher = {get: async url => ({ok: false, url, error: 'STUB', attempts: []}), raw: new Map()};
  const before = await collectContext({now: '2026-09-28T07:05:00.000Z', rootDir: dir, fetcher});
  const ctxBefore = await readJSON(path.relative(root, path.join(dir, before.written)));
  assert.equal(ctxBefore.assets, 52); assert.equal(ctxBefore.nextUniverse, undefined, '바꾸는 날 전');
  const on = await collectContext({now: '2026-09-29T07:05:00.000Z', rootDir: dir, fetcher});
  const ctx = await readJSON(path.relative(root, path.join(dir, on.written)));
  assert.equal(ctx.assets, 60, '지금 52곳 + 새로 들어올 8곳'); assert.deepEqual(ctx.nextUniverse, {id: 'u-test', count: 34, added: 8, from: 'proposal'});
});

test('매일 실행 결과 읽기: 예비 예약 문·자체 예약기는 그 실행이 센 곳 수(expectedStocks)로 끝났는지 본다 · 옛 기록은 52', () => {
  const now = '2026-10-07T07:40:00.000Z', day = '2026-10-07';
  assert.equal(alreadyDone({dayKST: day, at: now, status: 'complete', exitCode: 0, confirmedTodayStocks: 180, expectedStocks: 180}, now).skip, true);
  assert.equal(alreadyDone({dayKST: day, at: now, status: 'partial', exitCode: 2, confirmedTodayStocks: 179, expectedStocks: 180}, now).skip, false);
  assert.equal(alreadyDone({dayKST: day, at: now, status: 'complete', exitCode: 0, confirmedTodayStocks: 52}, now).skip, true, '옛 기록(곳 수 없음)은 52');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'partial', prediction: 'off', confirmedTodayStocks: 120, expectedStocks: 180}}), 'retry');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'partial', prediction: 'off', confirmedTodayStocks: 180, expectedStocks: 180}}), 'complete_with_warnings');
});
