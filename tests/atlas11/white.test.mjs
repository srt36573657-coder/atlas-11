// 흰 첫 화면 문 시험(사장님 2026-10-19 02:03 「골똘이 대공사 · 구글과 잡스 판」 [검사] · [하는 법 ②] 6 · [맞았는지] 7 · 일꾼 C)
//   브라우저 없이: 검사 파일이 잣대를 품었는지 · 바뀐 쪽 검사 · 모든 쪽 검사 · 올리기 직전 문에 붙었는지 · 켜는 스위치 · 화면 잣대 한 장이 있고 진화가 못 고치는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const CHECK = 'scripts/atlas11/next/check_white.mjs', GATE = 'scripts/atlas11/next/white_gate.mjs', DOC = 'docs/골똘이_화면잣대.md';

test('검사 파일이 있고 잣대를 품음', () => {
  const s = read(CHECK);
  for (const k of ['ess', 'find', 'today', 'gdr', 'all']) assert.match(s, new RegExp(`'${k}'`), `칸 ${k}`);
  for (const c of ['#080808', '#FFFFFF']) assert.ok(s.includes(c), `색 ${c}`); // 돌 판(2026-10-19 10:31) 바탕 · 글
  for (const w of ['390', '844', '320', '568', '47.5', '16.95', '2500', '200', '0.1', '4.5', '0.6', '0.9']) assert.ok(s.includes(w), `숫자 ${w}`);
  for (const w of ['오늘 장', '시황', '매매일지', '관심', '보유종목', 'jhBtn', 'data-ess', '#/why', 'data-say', 'data-fact', '왜 그럴까\\?', '그날 정한 대로 했어\\?', 'q1', '급등', '그림자', '입체', '작은 빨간 점'])
    assert.ok(s.includes(w), `잣대 ${w}`);
  assert.match(s, /latency: 150/); assert.match(s, /rate: 4/);
});

test('켜는 스위치 한 곳 = white_gate.mjs whiteOn(site/next/home.css)', async () => {
  const s = read(CHECK);
  assert.match(s, /import \{whiteOn, HOME_CSS\} from '\.\/white_gate\.mjs'/);
  assert.match(s, /R\.enforced = !!MOCK \|\| argv\.includes\('--enforce'\) \|\| whiteOn\(ROOT\)/);
  assert.match(s, /process\.exit\(R\.ok \|\| !R\.enforced \? 0 : 1\)/);
  const G = await import(path.join(ROOT, GATE));
  assert.equal(G.HOME_CSS, 'site/next/home.css');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'white-'));
  try {
    assert.equal(G.whiteOn(tmp), false);
    const off = G.whiteGate({root: tmp, dist: tmp});
    assert.equal(off.on, false); assert.equal(off.ok, true); assert.match(off.lines[0], /꺼짐/);
    fs.mkdirSync(path.join(tmp, 'site/next'), {recursive: true}); fs.writeFileSync(path.join(tmp, 'site/next/home.css'), '');
    assert.equal(G.whiteOn(tmp), true);
    const on = G.whiteGate({root: tmp, dist: path.join(tmp, 'empty')}); // 켜졌는데 올리는 폴더가 비면 막음
    assert.equal(on.on, true); assert.equal(on.ok, false); assert.ok(on.lines.some(l => /home\.css 가 없음/.test(l)));
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('정적 문이 망치는 길 · 옛 화면 남김을 잡음(가짜 폴더)', async () => {
  const G = await import(path.join(ROOT, GATE));
  assert.deepEqual(G.ruinIn('html.white a{box-shadow:none!important;perspective:none}'), []);
  assert.equal(G.ruinIn('b{box-shadow:0 1px 2px #000}').length, 1);
  assert.equal(G.ruinIn('b{background:linear-gradient(#fff,#000)}').length, 1);
  assert.equal(G.ruinIn('b{transform:rotateX(10deg)}').length, 1);
  assert.equal(G.ruinIn('b{box-shadow:0 1px red}', {onlyWhite: true}).length, 0, 'app.css 는 html.white 규칙만');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'white-'));
  try {
    fs.mkdirSync(path.join(tmp, 'site/next'), {recursive: true}); fs.writeFileSync(path.join(tmp, 'site/next/home.css'), '');
    const d = path.join(tmp, 'dist'), n = path.join(d, 'next'); fs.mkdirSync(n, {recursive: true});
    const nav = '<nav class="tabs"><a href="#/">오늘 장</a><a href="#/m">시황</a><a href="#/why">매매일지</a><a href="#/s">관심</a><a href="#/me">보유종목</a></nav>';
    fs.writeFileSync(path.join(n, 'index.html'), `<link rel="stylesheet" href="/next/home.css">${nav}`);
    fs.writeFileSync(path.join(n, 'app.css'), 'html.white{--bg:#080808;--ink:#FFFFFF;--gold:#F9D21C;--up:#FF6A3D;--down:#6C86FF}');
    fs.writeFileSync(path.join(n, 'home.css'), '.x{color:red}');
    fs.writeFileSync(path.join(n, 'app.js'), `const a = "jhBtn data-ess data-w data-say data-fact"; document.documentElement.classList.toggle('white', true);`);
    fs.writeFileSync(path.join(d, '_headers'), '/next/*\n  X-Robots-Tag: noindex\n  Cache-Control: no-cache\n');
    const ok = G.whiteGate({root: tmp, dist: d});
    assert.equal(ok.ok, true, ok.lines.join(' | '));
    fs.writeFileSync(path.join(n, 'home.css'), '.x{box-shadow:0 2px 4px #0003}');
    fs.writeFileSync(path.join(d, '_headers'), '/next/*\n  X-Robots-Tag: noindex\n');
    const bad = G.whiteGate({root: tmp, dist: d});
    assert.equal(bad.ok, false);
    assert.ok(bad.lines.some(l => /㉢/.test(l)) && bad.lines.some(l => /㉥/.test(l)), bad.lines.join(' | '));
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('바뀐 쪽 검사: 첫 화면 파일 → check_white · 흰 첫 화면 문', async () => {
  const C = await import(path.join(ROOT, 'scripts/atlas11/next/check_changed.mjs'));
  for (const f of ['site/next/app.js', 'site/next/app.css', 'site/next/home.css', 'site/next/index.html', 'site/next/p-why.js', 'site/next/essence.js', CHECK, GATE]) {
    const k = C.checksFor(f);
    assert.ok(k.includes('check_white'), `${f} → check_white`);
    assert.ok(k.includes('white-gate'), `${f} → white-gate`);
  }
  assert.ok(!C.checksFor('site/next/p-cal.js').includes('check_white'));
  assert.ok(C.checksFor('site/next/home.css').includes('next_check'), 'home.css 도 첫 화면 짝 검사(next_check)');
});

test('모든 쪽 검사 · 올리기 전 기다리기가 쪽 「white」를 셈', async () => {
  const P = await import(path.join(ROOT, 'scripts/atlas11/next/shard/plan.mjs'));
  assert.ok(P.pageNames().includes('white'));
  const W = await import(path.join(ROOT, 'scripts/atlas11/next/wait_preview.mjs'));
  assert.ok(W.expectedPages(fs.readdirSync(path.join(ROOT, 'scripts/atlas11/next'))).includes('white'));
  assert.match(read('scripts/atlas11/next/run_all.mjs'), /\^check_\[a-z0-9\]\+\\\.mjs\$/, 'run_all 은 check_*.mjs 를 모두 돎');
  assert.ok(!/^check_/.test(path.basename(GATE)), '정적 문은 쪽 검사가 아님');
});

test('올리기 직전 문: 본질 문 바로 뒤에 흰 첫 화면 문 · 앞 문은 그대로', () => {
  const s = read('scripts/atlas11/deploy_netlify.mjs');
  const a = s.indexOf("await import('./art_gate.mjs')"), e = s.indexOf("await import('./next/essence_check.mjs')"), w = s.indexOf("await import('./next/white_gate.mjs')"), d = s.indexOf('const out = await deploy(');
  assert.ok(a > 0 && e > a && w > e && d > w, '차례: 올리기 문 → 본질 문 → 흰 첫 화면 문 → 올리기');
  assert.match(s, /if \(!eg\.ok\) \{[^\n]*process\.exit\(3\)/, '본질 문은 그대로 막음');
  assert.match(s, /if \(!wg\.ok\) \{[^\n]*process\.exit\(3\)/, '흰 첫 화면 문도 막음');
});

test('화면 잣대 한 장이 있고 기계 · 진화가 못 고침', async () => {
  const s = read(DOC);
  assert.match(s.split('\n').slice(0, 4).join('\n'), /사장님 말씀.*으로만 고친다\. 기계와 진화 회차는 못 고친다\./);
  for (const w of ['#FFFFFF', '#16181D', '#8A6516', '#D0202E', '#1E5BD8', '390×844', '320×568', '2.5초', '48px']) assert.ok(s.includes(w), w);
  const rows = s.split('## 실패할 길 일곱과 막는 줄')[1]?.split('\n## ')[0].split('\n').filter(l => /^\| [1-7]\. /.test(l)) ?? [];
  assert.equal(rows.length, 7, '실패할 길 일곱');
  for (const r of rows) assert.match(r, /`[^`]+\.(mjs|md)`|`docs\//, '막는 줄마다 파일 이름: ' + r.slice(0, 30));
  const L = await import(path.join(ROOT, 'scripts/atlas11/jinhwa/lib.mjs'));
  for (const f of [DOC, GATE, CHECK]) assert.equal(L.protectedHits([f]).length, 1, `진화 지킴 ${f}`);
  assert.match(L.protectedHits([DOC])[0].why, /화면 잣대/);
  for (const f of ['docs/골똘이_본질.md', 'scripts/atlas11/deploy_netlify.mjs', '.github/workflows/atlas11-daily.yml']) assert.equal(L.protectedHits([f]).length, 1, `앞 지킴 그대로 ${f}`);
});

test('원칙 문서와 기록 탭에 바뀐 앞 규칙을 적음', () => {
  const p = read('docs/ATLAS_원칙.md');
  const r = p.split('\n').find(l => l.startsWith('81. **골똘이 · 흰 첫 화면')) ?? '';
  assert.ok(r, '규칙 81');
  for (const w of ['2026-10-19', '02:03', '규칙 74', '규칙 79 [6]', '판정 글', '오늘은 쉬어 갈까?']) assert.ok(r.includes(w), w);
  const u = JSON.parse(read('reports/atlas11/changelog/updates/u-20261019T032000-golttori-white.json'));
  assert.equal(u.schema, 'atlas11-change-1'); assert.equal(u.kind, 'update'); assert.equal(u.place, 'all');
});
