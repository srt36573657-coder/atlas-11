// 업종 36개 · 180곳 · 요즘 불장 업종 11개 · 다음 불장 후보 22곳 — 2026-10-04 21:04 사장님
//   「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
// 고르기 규칙(i36-v1)과 불장·후보 셈법은 가짜 후보로 따로 보고, 실제 제안·입력은 저장된 파일로 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {I36, selectIndustry36, failsOf, TREND_GROUPS} from '../../lib/atlas11/universe.mjs';
import {industryBoard, industryOf, change20Of} from '../../lib/atlas11/industries.mjs';
import {switchNow} from '../../scripts/atlas11/switch_now.mjs';
import {UNIVERSE_CONFIG, RETIRED_DIR} from '../../lib/atlas11/universe-switch.mjs';
import {root, readJSON, tempRoot, INPUT_928} from './helpers.mjs';

// 가짜 후보: 업종 40개(트렌드 업종 4개 포함) · 업종마다 회사 수와 우량 여부를 다르게
const GOOD = {op: 10, net: 8, opPrev: 9, netPrev: 7, roe: 12, debt: 50, fiscalYear: '2025.12'}, BAD = {...GOOD, roe: 1};
function fakeCandidates() {
  const trendSectors = TREND_GROUPS.flatMap(g => g.sectors).slice(0, 4), out = [];
  let rank = 1;
  for (let k = 0; k < 40; k++) {
    const sector = k < 4 ? trendSectors[k] : `업종${String(k).padStart(2, '0')}`;
    const n = k === 39 ? 4 : 7; // 마지막 업종은 고를 수 있는 회사가 4곳뿐
    for (let j = 0; j < n; j++) {
      const code = String(100000 + k * 100 + j * 10), good = k < 4 ? j % 2 === 0 : j < (k === 38 ? 5 : 6);
      out.push({code, name: `회사${code}`, market: 'KOSPI', endType: 'stock', sector, capRank: rank++, marketCapEok: 100000 - k * 1000 - j * 10, history: {ok: true}, metrics: good ? GOOD : BAD});
    }
  }
  return out;
}

test('고르기 i36-v1: 고를 수 있는 회사(우량이거나 트렌드 업종)만 · 업종마다 시가총액 큰 5곳 · 5곳 시가총액 합이 큰 36개 업종 · 모두 180곳', () => {
  const cands = fakeCandidates(), sel = selectIndustry36(cands, I36);
  assert.equal(sel.ok, true); assert.equal(sel.picked.length, 180); assert.equal(new Set(sel.picked.map(c => c.code)).size, 180);
  const by = new Map(); for (const c of sel.picked) by.set(c.sector, [...(by.get(c.sector) ?? []), c]);
  assert.equal(by.size, 36); assert.ok([...by.values()].every(cs => cs.length === 5));
  assert.ok(!by.has('업종39'), '고를 수 있는 회사가 4곳뿐인 업종은 빠짐');
  assert.ok(sel.picked.every(c => !failsOf(c, I36).length || c.trend), '우량이 아니면 트렌드 업종 회사');
  assert.ok(sel.picked.filter(c => c.kind === 'trend').every(c => c.trend), '트렌드 표시는 트렌드 업종에만');
  for (const [sector, cs] of by) { const pool = cands.filter(c => c.sector === sector && (!failsOf(c, I36).length || TREND_GROUPS.some(g => g.sectors.includes(sector)))).sort((a, b) => b.marketCapEok - a.marketCapEok).slice(0, 5); assert.deepEqual(cs.map(c => c.code), pool.map(c => c.code), sector + ' 시가총액 큰 5곳'); }
  const chosenCaps = sel.counts.chosen.map(x => x.capEok); assert.deepEqual(chosenCaps, [...chosenCaps].sort((a, b) => b - a), '업종 차례 = 5곳 시가총액 합 큰 순');
  assert.ok(sel.counts.chosen.at(-1).capEok >= Math.max(...sel.counts.notChosenFilled.map(x => x.capEok)), '뽑히지 않은 업종은 36번째보다 작다');
});

test('불장·후보 셈법: 20거래일 변화 = 종가 21개의 처음→끝 · 불장은 오른 업종만 큰 순 11개까지 · 후보는 불장 업종 밖 오른 회사만 큰 순 22곳까지 · 한 업종 2곳까지', () => {
  assert.equal(change20Of([...Array(21)].map((_, i) => 100 + i * 5)), 1); assert.equal(change20Of([1, 2, 3]), null);
  // 업종 15개 · 업종마다 3곳 · 업종 k 의 회사 변화 = (8 - k)% 근처(앞 8개 업종만 오름)
  const companies = [];
  for (let k = 0; k < 15; k++) for (let j = 0; j < 3; j++) companies.push({code: String(200000 + k * 10 + j), name: `회사${k}-${j}`, group: industryOf(`가짜업종${k}`), kind: 'quality', capRank: k * 3 + j + 1, change20: (8 - k) / 100 + (j - 1) / 1000, cFrom: '2026-09-02', date: '2026-10-02'});
  companies.push({code: '299990', name: '혼자 오른 회사', group: industryOf('가짜업종14'), kind: 'trend', capRank: 99, change20: 0.1, cFrom: '2026-09-02', date: '2026-10-02'});
  const {groups, hot, next} = industryBoard(companies);
  assert.equal(groups.length, 15);
  assert.deepEqual(hot.items.map(x => x.label), [...Array(8)].map((_, k) => `가짜업종${k}`), '오른 업종이 8개뿐이면 불장도 8개');
  assert.ok(hot.items.every((x, i) => x.change20 > 0 && (!i || hot.items[i - 1].change20 >= x.change20)));
  assert.equal(next.items[0].name, '혼자 오른 회사', '업종은 내렸어도 혼자 많이 오른 회사는 후보');
  assert.ok(next.items.every(x => x.change20 > 0 && !hot.items.some(h => h.id === x.groupId)));
  assert.deepEqual(next.items.map(x => x.name), ['혼자 오른 회사', '회사8-2'], '불장 업종 밖에서 오른 회사는 둘뿐(업종 평균이 0 인 가짜업종8 의 +0.1% 회사 포함)');
  const many = industryBoard(companies, {hotCount: 2});
  assert.equal(many.hot.items.length, 2);
  const per = {}; for (const x of many.next.items) per[x.groupId] = (per[x.groupId] ?? 0) + 1;
  assert.ok(Object.values(per).every(v => v <= 2) && many.next.items.length <= 22);
  assert.ok(many.next.items.every((x, i) => !i || many.next.items[i - 1].change20 >= x.change20));
});

test('바로 바꾸기(switch_now --proposal-dir): 새 제안을 next 로 올리고 바로 바꿈 · 옛 next 는 「대신함」으로 history · 지금 입력은 보관 · 장부에 한 줄 · 두 번 돌려도 한 번만', async () => {
  const dir = await tempRoot(), old = await readJSON(INPUT_928);
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true}); await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  const mk = async (sub, id, assets) => { const d = `reports/atlas11/universe/${sub}`; await fs.mkdir(path.join(dir, d), {recursive: true}); const ni = {...old, assets, universe: {id, label: id, rules: id.split('-').slice(1, 3).join('-')}}; const text = JSON.stringify(ni); await fs.writeFile(path.join(dir, d, 'next-input.json'), text); await fs.writeFile(path.join(dir, d, 'proposal.json'), JSON.stringify({id, ok: true})); return {d, text}; };
  const fresh = old.assets.slice(0, 10).map((x, i) => ({...x, code: String(910000 + i * 10), name: '가짜' + i}));
  const a = await mk('a', 'u2-qt180-v1-x', old.assets.slice(0, 30)), b = await mk('b', 'u2-i36-v1-x', [...old.assets.slice(10, 40), ...fresh]);
  await fs.mkdir(path.join(dir, 'config/atlas11'), {recursive: true});
  await fs.writeFile(path.join(dir, UNIVERSE_CONFIG), JSON.stringify({schema: 'atlas11-universe-config-1', order: {at: '18:10'}, current: {id: 'u1-sector52'}, next: {id: 'u2-qt180-v1-x', count: 30, input: a.d + '/next-input.json', inputSHA256: createHash('sha256').update(a.text).digest('hex'), switchOn: '2026-10-06'}, selectRules: 'qt180-v1', history: []}));
  const order = {at: '2026-10-04 21:04 KST', by: '사장님', text: ['업종 36개에서 180개 회사를 찾아'], decided: []};
  const r = await switchNow({rootDir: dir, now: '2026-10-04T12:30:00.000Z', order, proposalDir: b.d});
  assert.equal(r.switched, true); assert.equal(r.from, 'u1-sector52'); assert.equal(r.to, 'u2-i36-v1-x'); assert.equal(r.kept, 30); assert.equal(r.added, 10); assert.equal(r.dropped, 22);
  const cfg = await readJSON(path.relative(root, path.join(dir, UNIVERSE_CONFIG))), input = await readJSON(path.relative(root, path.join(dir, 'public/data/input.json')));
  assert.equal(cfg.current.id, 'u2-i36-v1-x'); assert.equal(cfg.next, null); assert.equal(cfg.selectRules, 'i36-v1'); assert.deepEqual(cfg.order, order);
  assert.ok(cfg.history.some(h => h.next?.id === 'u2-qt180-v1-x' && /대신함/.test(h.status)), '옛 next 는 대신했다고 남음');
  assert.equal(input.universe.id, 'u2-i36-v1-x'); assert.equal(input.assets.length, 40);
  const retired = await readJSON(path.relative(root, path.join(dir, RETIRED_DIR, 'u1-sector52.json'))); assert.equal(retired.assets.length, 52); assert.equal(retired.retiredOn, '2026-10-04');
  const lines = (await fs.readFile(path.join(dir, 'reports/atlas11/ledger/operation/2026-10-04.jsonl'), 'utf8')).trim().split('\n').map(l => JSON.parse(l));
  assert.equal(lines.filter(l => l.body.kind === 'universe_switch').length, 1);
  const again = await switchNow({rootDir: dir, now: '2026-10-04T12:31:00.000Z', order});
  assert.equal(again.switched, false);
});

test('실제 묶음: 21:31 원자료로 i36-v1 을 다시 고르면 저장된 제안과 같다 · 설정·입력이 그 제안을 가리킨다 · 업종 36개 × 5곳 · 옛 52종목은 보관', async () => {
  const {proposeFromBundle} = await import('../../scripts/atlas11/collect_universe.mjs');
  const zlib = await import('node:zlib');
  const dir = 'reports/atlas11/universe/2026-10-04-i36', proposal = await readJSON(dir + '/proposal.json');
  const bundle = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root, proposal.bundle.file))).toString('utf8'));
  const u1 = await readJSON(RETIRED_DIR + '/u1-sector52.json');
  const again = proposeFromBundle(bundle, {input: u1, now: proposal.createdAt, rules: I36});
  assert.equal(again.proposal.ok, true);
  assert.deepEqual(again.proposal.picked.map(p => p.code), proposal.picked.map(p => p.code));
  const cfg = await readJSON(UNIVERSE_CONFIG), text = await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'), input = JSON.parse(text);
  assert.equal(cfg.current.id, 'u2-i36-v1-2026-10-04'); assert.equal(cfg.next, null); assert.ok(['i36-v1', 's365-v1'].includes(cfg.selectRules), '2026-10-05 05:07 「365개로」 뒤 다음 고르기는 s365-v1');
  assert.equal(input.universe.id, cfg.current.id); assert.equal(createHash('sha256').update(text).digest('hex'), cfg.current.inputSHA256);
  assert.equal(input.assets.length, 180); assert.equal(new Set(input.assets.map(a => a.code)).size, 180);
  const by = {}; for (const a of input.assets) by[a.industry ?? a.sector] = (by[a.industry ?? a.sector] ?? 0) + 1;
  assert.equal(Object.keys(by).length, 36); assert.ok(Object.values(by).every(v => v === 5));
  const kinds = input.assets.reduce((m, a) => (m[a.quality.kind] = (m[a.quality.kind] ?? 0) + 1, m), {});
  assert.deepEqual(kinds, proposal.counts.kinds); assert.ok((kinds.quality ?? 0) + (kinds.trend ?? 0) >= 150, '우량·트렌드가 대부분');
  assert.equal(u1.assets.length, 52); assert.equal(u1.retiredOn, '2026-10-04');
  assert.ok(cfg.history.some(h => h.next?.id === 'u2-qt180-v1-2026-10-04' && /대신함/.test(h.status)));
});
