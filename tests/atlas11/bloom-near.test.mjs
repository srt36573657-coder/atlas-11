// 빈 날 가장 가까운 회사 셋(사장님 2026-11-03 12:01(+04) 「어 그렇게 해」 — 물음 「꽃이 될 종목이 없는 날에는 조건에 가장 가까운 회사 셋을 따로 보여 드릴까요?」 · 주문 1512)
//   ① 저장소 자료로 올리기 셈(theme build)을 돌리고, 따로 다시 세기(scripts/atlas11/verify/bloom_near_verify.mjs — 엔진 · 낱 조건 셈을 안 씀)와 오늘 셋 · 지난 기록이 칸마다 같음
//   ② 고른 회사가 있는 날은 오늘 셋이 비고 · 고른 회사와 섞이지 않음 · 셋 넘지 않음 · 업종 조건만 안 맞음
//   ③ 셈을 하나라도 바꾸면 따로 다시 세기가 「다름」(끝 코드 1)을 냄 — 올리기 셈(build_data)은 그때 near 를 뺌
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../../scripts/atlas11/next/build/theme.mjs';
import {verifyNear} from '../../scripts/atlas11/verify/bloom_near_verify.mjs';
import {NEAR} from '../../site/next/theme-engine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function siteAt(lastCut = 0) { // 저장소 자료(site/atlas/data)를 임시 폴더로 — lastCut > 0 이면 마지막 날을 그만큼 잘라 고른 회사가 있는 날로
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-near-'));
  fs.cpSync(path.join(ROOT, 'site', 'atlas', 'data'), path.join(dir, 'atlas', 'data'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'next', 'data'), {recursive: true});
  fs.copyFileSync(path.join(ROOT, 'site', 'next', 'data', 'bloom-months.json'), path.join(dir, 'next', 'data', 'bloom-months.json'));
  if (lastCut > 0) {
    const f = path.join(dir, 'atlas', 'data', 'days.json'), d = JSON.parse(fs.readFileSync(f, 'utf8'));
    d.dates = d.dates.slice(0, d.dates.length - lastCut); fs.writeFileSync(f, JSON.stringify(d));
  }
  await build({siteDir: dir, keptFile: path.join(dir, 'kept.json')});
  return {dir, B: JSON.parse(fs.readFileSync(path.join(dir, 'next', 'data', 'theme-bloom.json'), 'utf8'))};
}

test('빈 날 가장 가까운 회사 셋 — 엔진 = 따로 다시 세기(오늘 셋 · 지난 기록) · 셋 넘지 않음 · 고른 회사와 섞이지 않음', async () => {
  const {dir, B} = await siteAt();
  assert.ok(B.near && typeof B.near === 'object', '그 달 조건이 업종 한 달 앞섬 + 회사 조건이면 near 가 있음');
  assert.ok(Object.hasOwn(NEAR.ix, B.near.rule.atom), '안 맞은 조건 = ix1 ~ ix4 하나');
  assert.equal(B.near.rule.min, NEAR.ix[B.near.rule.atom]);
  assert.ok(B.near.today.length <= NEAR.n, '셋 넘지 않음');
  if (B.today.n > 0) assert.equal(B.near.today.length, 0, '고른 회사가 있는 날은 오늘 셋이 빔');
  const picked = new Set(B.today.inds.flatMap(i => i.co.map(r => r[0])));
  for (const r of B.near.today) {
    assert.ok(!picked.has(r[0]), '고른 회사와 섞이지 않음');
    assert.ok(Number.isFinite(r[3]) && r[3] < B.near.rule.min, `${r[1]} — 업종 조건만 안 맞음(업종이 앞선 % ${r[3]} < ${B.near.rule.min})`);
    assert.ok(Number.isFinite(r[4]) && r[4] < 5, `${r[1]} — 싹(한 달 앞선 % < 5)`);
  }
  for (let k = 1; k < B.near.today.length; k++) assert.ok(B.near.today[k - 1][3] >= B.near.today[k][3], '업종이 더 오른 차례');
  const R = B.near.rec;
  assert.ok(Number.isInteger(R.n) && Number.isInteger(R.hits) && R.hits <= R.n && Number.isInteger(R.days) && R.baseHits <= R.baseN, '기록 꼴');
  if (R.n) assert.equal(R.rate, Math.round((R.hits / R.n) * 10000) / 100); if (R.baseN) assert.equal(R.base, Math.round((R.baseHits / R.baseN) * 10000) / 100);
  const v = verifyNear(dir);
  assert.equal(v.code, 0, '따로 다시 세기와 같음 — ' + JSON.stringify(v.diffs ?? v.why));
  // ③ 셈을 바꾸면 「다름」
  const f = path.join(dir, 'next', 'data', 'theme-bloom.json'), b = JSON.parse(fs.readFileSync(f, 'utf8'));
  b.near.rec.hits += 1; fs.writeFileSync(f, JSON.stringify(b));
  assert.equal(verifyNear(dir).code, 1, '기록 하나만 달라도 다름');
  if (B.near.today.length >= 2) { const c = JSON.parse(JSON.stringify(B)); [c.near.today[0], c.near.today[1]] = [c.near.today[1], c.near.today[0]]; fs.writeFileSync(f, JSON.stringify(c)); assert.equal(verifyNear(dir).code, 1, '차례가 달라도 다름'); }
});

test('빈 날 가까운 셋 — 화면 글: 고른 회사가 아님을 먼저 · 맞은 · 안 맞은 조건 · 지난 빈 날 기록(아무 회사와 견줌) · 앞날 말 · 사고팔기 말 없음', () => {
  const src = fs.readFileSync(path.join(ROOT, 'site', 'next', 'p-theme.js'), 'utf8'), home = fs.readFileSync(path.join(ROOT, 'site', 'next', 'home-new.js'), 'utf8');
  for (const t of ['조건에 가장 가까운 회사', '조건에 다 맞지는 않아요. 큐피트가 고른 회사가 아니에요.', '맞은 조건', '안 맞은 조건', '지난 빈 날 가장 가까운 회사는 100번에']) assert.ok(src.includes(t), `p-theme.js 에 「${t}」 없음`);
  for (const t of ['가까운 곳', '조건에 가장 가까운 회사', '조건에 다 맞지는 않아요. 큐피트가 고른 회사가 아니에요.']) assert.ok(home.includes(t), `home-new.js 에 「${t}」 없음`);
  const part = src.slice(src.indexOf('// 빈 날 가장 가까운 회사 셋'), src.indexOf("return {title, nodes: [h('div', {class: 'tc th-picks'"));
  assert.ok(!/추천|매수|매도|사세요|파세요|예측|확률|유망|기회/.test(part), '앞날 · 사고팔기 말');
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'atlas11', 'next', 'i18n', 'en-src.json'), 'utf8')).templates;
  for (const t of ['가까운 곳', '조건에 가장 가까운 회사', '조건에 다 맞지는 않아요. 큐피트가 고른 회사가 아니에요.', '맞은 조건', '안 맞은 조건', '지난 빈 날 가장 가까운 회사는 100번에 {n}번 꽃이 됐어요.']) assert.ok(typeof en[t] === 'string' && en[t], `영어 사전에 「${t}」 없음`);
});
