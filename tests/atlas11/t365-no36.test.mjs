// 36곳 없음(사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 · 규칙 55) — 화면 코드 · 자료 · 회차 셈에 다시 들어오면 실패
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const BAD = /(?<![\d,])36곳|pick36|view36|tab36|매수 검토|["']#\/36["']/; // 「136곳」 같은 숫자는 아님
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('새 ATLAS 화면 코드에 36곳 화면 · 탭 · 글 없음', () => {
  for (const f of ['site/atlas/atlas.js', 'site/atlas/atlas.css', 'site/atlas/index.html']) assert.ok(!BAD.test(rd(f)), f);
  assert.equal((rd('site/atlas/index.html').match(/<a href="#\/[a-z]*" id="tab/g) ?? []).length, 3, '아래 탭 셋');
  assert.match(rd('site/atlas/atlas.js'), /kind === '36'\) \{ location\.replace\('#\/'\)/, '옛 주소 #/36 은 첫 화면으로');
});

test('새 ATLAS 자료에 36곳 칸 · 글 · 파일 없음 — 7단 범위만', () => {
  const D = path.join(ROOT, 'site/atlas/data');
  assert.ok(!fs.existsSync(path.join(D, 'pick36.json')), 'pick36.json 없음');
  for (const f of fs.readdirSync(D).filter(f => f.endsWith('.json'))) assert.ok(!/(?<![\d,])36곳|pick36|매수 검토/.test(fs.readFileSync(path.join(D, f), 'utf8')), f);
  const r = JSON.parse(fs.readFileSync(path.join(D, 'range.json'), 'utf8'));
  assert.equal(r.schema, 'atlas-new-range-1');
  for (const k of ['picks', 'backtest', 'cutN', 'alive', 'total']) assert.ok(!(k in r), k);
  for (const [c, v] of Object.entries(r.companies)) { assert.ok(!('rank' in v) && !('cut' in v), c); if (v.ok) assert.equal(v.win.length, 4); }
});

test('회차 셈에 36곳 고르기 · 지난 기록 시험 없음', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'scripts/atlas11/t365/pick36.py')) && !fs.existsSync(path.join(ROOT, 'scripts/atlas11/t365/pick36_verify.mjs')));
  assert.ok(!/pick36\.py|pick36_verify|pick36\.json/.test(rd('scripts/atlas11/t365/roll.mjs')));
  assert.ok(!/N_PICK|PER_IND|PAIRS_BT|'picks'|binom/.test(rd('scripts/atlas11/t365/range_mc.py')));
  assert.equal(JSON.parse(rd('scripts/atlas11/t365/universe.json')).range, 'range-v1');
  assert.ok(!('pick36' in JSON.parse(rd('scripts/atlas11/t365/universe.json'))));
});

test('봉인 1호는 그때 잠근 그대로(파일 · 번호) — 화면 자료만 그 목록 줄을 뺌', () => {
  const cap = JSON.parse(rd('reports/atlas11/t365/capsule/capsule-1.json'));
  const body = {}; for (const k of ['id', 'seal', 'version', 'opens', 'rules', 'members', 'picks36', 'pool']) if (k in cap) body[k] = cap[k];
  const canon = x => (Array.isArray(x) ? '[' + x.map(canon).join(',') + ']' : x && typeof x === 'object' ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}' : JSON.stringify(x));
  assert.equal(crypto.createHash('sha256').update(canon(body), 'utf8').digest('hex'), cap.digest, '봉인 번호 그대로');
  const t = JSON.parse(rd('site/atlas/data/time.json')).capsules[0];
  assert.deepEqual(t.rules, cap.rules.filter(r => !r.includes('36곳')));
  assert.ok(t.rulesNote && !/36곳/.test(t.rulesNote));
});
