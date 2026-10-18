// 고도리 칸 목록 받기 kind.mjs + 장 끝난 뒤 다시 고르기 .github/workflows/godori-pick.yml 시험(망 없이 · 견본만)
//   node --test tests/atlas11/gdr-kind.test.mjs
//   견본 = tests/atlas11/fixtures/kind/*(형식 견본 · 실제 KIND / 네이버 응답이 아님 · 이름 · 번호 · 날짜는 꾸민 값)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {collectLists, parseKindList, parseNaverList, parseTable, buildNameMap, normCode, normName, decodeKr, MIN, NAMES} from '../../scripts/atlas11/next/gdr/kind.mjs';
import {normLists} from '../../scripts/atlas11/next/gdr/v2/data.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const FX = path.join(ROOT, 'tests/atlas11/fixtures/kind'), fx = f => fs.readFileSync(path.join(FX, f));
const NOW = new Date('2026-10-18T03:00:00Z'); // 서울 2026-10-18 12:00
/** 가짜 받기 — 주소 조각 → 견본(바이트 · charset 없음 = 실제 KIND 처럼 utf-8 로 먼저 읽힘) · 'throw' = 망 끊김 · 숫자 = 그 상태 */
const fakeFetch = (routes, seen = []) => async url => {
  seen.push(url);
  for (const [frag, v] of routes) if (url.includes(frag)) {
    if (v === 'throw') throw new Error('ECONNRESET');
    if (typeof v === 'number') return new Response('x', {status: v});
    return new Response(fx(v), {status: 200, headers: {'content-type': 'text/html'}});
  }
  return new Response('없음', {status: 404});
};

test('EUC-KR 바이트 · UTF-8 · 번호 칸 앞 0 · A 붙은 번호 · 새 꼴 번호', () => {
  const t = decodeKr(fx('adminissue-euckr.html'));
  assert.match(t, /견본관리01/);
  const r = parseKindList(t, 'managed', {today: '2026-10-18'});
  assert.equal(r.why, null); assert.equal(r.codes.length, 12);
  assert.ok(r.codes.includes('000100') && r.codes.includes('900101')); // '100' → 000100
  assert.deepEqual(r.codes, [...r.codes].sort());
  const h = parseKindList(decodeKr(fx('tradinghalt-utf8.html')), 'halted', {today: '2026-10-18'});
  assert.deepEqual(h.codes, ['0126Z0', '900201', '900202', '900203', '900204', '900206']);
  assert.equal(normCode('5930'), '005930'); assert.equal(normCode('A005930'), '005930'); assert.equal(normCode('0126Z0'), '0126Z0'); assert.equal(normCode('ABCDEF'), null); assert.equal(normCode(''), null);
});

test('이름만 있는 표 → 상장 목록 이름으로 번호 · 해제된 경고는 뺌 · 못 바꾼 이름이 있으면 목록 전체 null', () => {
  const html = decodeKr(fx('investwarn-warning-utf8.html'));
  assert.match(parseKindList(html, 'warning', {today: '2026-10-18'}).why, /^UNMAPPED:3/); // 지도 없이 = 못 바꿈(풀린 하나는 뺀 뒤 셋)
  const map = buildNameMap({corpHtml: decodeKr(fx('corplist-euckr.html'))});
  const r = parseKindList(html, 'warning', {today: '2026-10-18', nameMap: map});
  assert.deepEqual(r.codes, ['900301', '900302', '900304']); // 다(9월 20일 해제) 뺌 · 라(10월 30일 해제 예정) 남김 · (주) · 띄어쓰기 무시
  assert.equal(r.released, 1);
  const partial = new Map(map); partial.delete(normName('견본경고라'));
  assert.equal(parseKindList(html, 'warning', {today: '2026-10-18', nameMap: partial}).codes, null);
  const amb = buildNameMap({corpHtml: decodeKr(fx('corplist-euckr.html')), mkt: {companies: {'999999': {n: '견본경고가'}}}}); // 같은 이름 다른 번호
  assert.equal(amb.get(normName('견본경고가')), '#');
  assert.equal(parseKindList(html, 'warning', {today: '2026-10-18', nameMap: amb}).codes, null);
});

test('빈 표 · 표 없음 · 엉뚱한 쪽 · 최소 수 미달 → 「?」(null) — 「위험 없음」으로 바꾸지 않음', () => {
  const empty = decodeKr(fx('investwarn-danger-empty.html'));
  assert.deepEqual(parseKindList(empty, 'danger', {today: '2026-10-18'}).codes, []); // 날짜 칸 있는 진짜 빈 목록
  assert.equal(parseKindList(empty, 'managed', {today: '2026-10-18'}).codes, null); // 관리종목이 0 = 잘린 것
  assert.match(parseKindList(empty, 'managed', {today: '2026-10-18'}).why, /^BELOW_MIN:0<10/);
  const form = decodeKr(fx('kind-search-form.html'));
  assert.deepEqual(parseKindList(form, 'danger', {today: '2026-10-18'}), {codes: null, why: 'EMPTY_UNSURE', n: 0, released: 0});
  assert.equal(parseKindList('<html>점검 중</html>', 'danger', {}).why, 'NO_TABLE');
  assert.equal(parseKindList('<table><tr><td>가</td><td>나</td></tr></table>', 'danger', {}).why, 'NO_HEADER');
  assert.equal(parseTable('').why, 'NO_TABLE');
  const nav = decodeKr(fx('naver-trading-halt-euckr.html'));
  assert.deepEqual(parseNaverList(nav, 'halted').codes, ['900201', '900202', '900203', '900204', '900205', '900206']);
  assert.equal(parseNaverList(nav.replace(/\/item\/main\.naver\?code=\w+/g, '#'), 'danger').codes, null); // 네이버로 대신 받은 빈 목록은 안 받음
  assert.deepEqual(MIN, {managed: 10, warning: 0, danger: 0, halted: 5});
});

test('모아 받기: KIND 넷 + 거래정지는 KIND 망 끊김 → 네이버 · DART 는 부르지 않음 · G1c normLists 가 그대로 읽음', async () => {
  const seen = [];
  const res = await collectLists({now: NOW, pauseMs: 0, backoffMs: [0, 0], fetch: fakeFetch([
    ['adminissue.do', 'adminissue-euckr.html'], ['tradinghaltissue.do', 'throw'], ['menuIndex=2', 'investwarn-warning-utf8.html'],
    ['menuIndex=3', 'investwarn-danger-empty.html'], ['corpList.do', 'corplist-euckr.html'], ['trading_halt.naver', 'naver-trading-halt-euckr.html']], seen)});
  assert.equal(res.schema, 'godori-kind-1'); assert.equal(res.asOf, '2026-10-18'); assert.equal(res.fetchedAt, NOW.toISOString());
  assert.deepEqual(Object.keys(res.lists), NAMES);
  assert.equal(res.lists.managed.length, 12); assert.deepEqual(res.lists.warning, ['900301', '900302', '900304']); assert.deepEqual(res.lists.danger, []);
  assert.deepEqual(res.lists.halted, ['900201', '900202', '900203', '900204', '900205', '900206']);
  assert.deepEqual(res.via, {managed: 'kind', warning: 'kind', danger: 'kind', halted: 'naver'});
  assert.deepEqual(res.why, {managed: null, warning: null, danger: null, halted: null});
  assert.deepEqual(res.dart, {ok: false, cb: null, rights: null, why: 'NO_OPENDART_KEY'});
  assert.ok(seen.length >= 6 && seen.every(u => !/dart/i.test(u)), 'DART 주소를 부르지 않음');
  assert.ok(seen.some(u => /searchFromDate=2024-10-18&searchToDate=2026-10-18/.test(u)), '시장경보는 지정일 2년 안');
  const L = normLists(JSON.parse(JSON.stringify(res)));
  assert.equal(L.asOf, '2026-10-18');
  assert.equal(L.sets.get('managed').size, 12); assert.equal(L.sets.get('danger').size, 0); assert.ok(L.sets.get('halted').has('900205'));
  assert.equal(L.sets.get('cb'), null); assert.equal(L.sets.get('rights'), null);
});

test('망이 모두 끊김 → 목록 넷 모두 null(「?」) · 까닭 · 파일은 씀', async () => {
  const res = await collectLists({now: NOW, pauseMs: 0, backoffMs: [0, 0], fetch: async () => { throw new Error('ENOTFOUND'); }});
  assert.deepEqual(res.lists, {managed: null, warning: null, danger: null, halted: null});
  assert.deepEqual(res.n, {managed: null, warning: null, danger: null, halted: null});
  for (const n of NAMES) assert.match(res.why[n], /^FETCH_FAILED.* · naver FETCH_FAILED/);
  const L = normLists(res); assert.ok(NAMES.every(n => L.sets.get(n) === null));
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gdr-kind-')), 'kind-latest.json');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/atlas11/next/gdr/kind.mjs'), '--fixture', path.join(FX, 'none'), '--out', out, '--no-naver'], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr); const f = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.ok(NAMES.every(n => f.lists[n] === null) && f.dart.ok === false);
});

/* ---------- godori-pick.yml ---------- */
const WF = fs.readFileSync(path.join(ROOT, '.github/workflows/godori-pick.yml'), 'utf8');
const crons = txt => [...txt.matchAll(/^\s*-\s*cron:\s*'([^']+)'/gm)].map(m => m[1]);

test('예약: 모두 서울 평일 20:10 ~ 23:59(장 · 저녁 장 끝난 뒤) · 다른 예약과 안 겹침 · 손 시작 있음', () => {
  const mine = crons(WF); assert.ok(mine.length >= 1);
  for (const c of mine) {
    const [mi, h, dom, mon, dow] = c.split(/\s+/); assert.equal(dom, '*'); assert.equal(mon, '*'); assert.equal(dow, '1-5');
    const kst = (+h + 9) * 60 + +mi; assert.ok(kst >= 20 * 60 + 10 && kst < 24 * 60, `${c} = 서울 ${Math.floor(kst / 60)}:${kst % 60} — 같은 평일 20:10 뒤여야`);
  }
  const others = fs.readdirSync(path.join(ROOT, '.github/workflows')).filter(f => f !== 'godori-pick.yml' && /\.ya?ml$/.test(f)).flatMap(f => crons(fs.readFileSync(path.join(ROOT, '.github/workflows', f), 'utf8')));
  const hm = c => c.split(/\s+/).slice(0, 2).join(' ');
  for (const c of mine) assert.ok(!others.some(o => hm(o) === hm(c)), `${c} 가 다른 예약과 같은 때`);
  assert.match(WF, /^\s{2}workflow_dispatch:/m);
});

test('올리기 없음 · 비밀은 GITHUB_TOKEN 만 · 권한 contents: write 만 · 제 동시 묶음', () => {
  assert.doesNotMatch(WF, /netlify|deploy/i);
  assert.ok([...WF.matchAll(/secrets\.(\w+)/g)].every(m => m[1] === 'GITHUB_TOKEN'));
  assert.match(WF, /^permissions:\n {2}contents: write\nconcurrency:\n {2}group: godori-pick\n/m);
  assert.doesNotMatch(WF, /atlas11-daily\.yml.*>|>\s*\.github/); // 예약 작업 파일을 쓰지 않음
});

test('넣기는 따로 세기(verify2) 성공 · 새 판일 때만 · 정한 파일만 · verify2 없으면 실패', () => {
  const steps = WF.split(/\n {6}- name: /).slice(1).map(s => ({name: s.split('\n')[0], body: s}));
  const commit = steps.find(s => s.name.startsWith('main 에 넣기')), verify = steps.find(s => s.name.startsWith('따로 세기')), pick = steps.find(s => s.name.startsWith('고르기'));
  assert.ok(commit && verify && pick);
  assert.match(commit.body, /if: .*steps\.pick\.outputs\.made == 'true'.*steps\.verify\.outcome == 'success'/);
  assert.match(verify.body, /verify2\.py 없음[^\n]*exit 1/);
  assert.match(verify.body, /python3 -I scripts\/atlas11\/next\/gdr\/verify2\.py --bundle "\$W\/bundle\.json\.gz" --site site\/atlas\/data --asof "\$\{\{ steps\.merge\.outputs\.asof \}\}"/);
  assert.match(verify.body, /prev=\(--prev "\$W\/prev-gdr\.json"\)[\s\S]*"\$\{prev\[@\]\}"/); // pick2 와 같은 앞 판(채점)
  for (const f of ['--quarters reports/atlas11/godori/quarter-latest.json', '--lists reports/atlas11/godori/kind-latest.json', '--gdr site/next/data/gdr.json', '--gates site/next/data/gates.json', '--private "$W/private.json"']) assert.ok(verify.body.includes(f), f);
  assert.match(pick.body, /pick2\.mjs --bundle "\$W\/bundle\.json\.gz" --asof "\$\{\{ steps\.merge\.outputs\.asof \}\}"/);
  const added = [...commit.body.matchAll(/git add ([^\n;]+)/g)].flatMap(m => m[1].split(/\s+/)).filter(x => x && !x.startsWith('"$'));
  const allowed = ['site/next/data/gdr.json', 'site/next/data/gates.json', 'reports/atlas11/godori/kind-latest.json'];
  assert.deepEqual(added.filter(x => !allowed.includes(x)), []);
  assert.match(commit.body, /for f in reports\/atlas11\/godori\/quarter-latest\.json reports\/atlas11\/godori\/verify2-latest\.json; do \[ -f "\$f" \] && git add "\$f"; done/);
  // 공개 안 하는 파일(팔 선 · 닿은 수 — [9] 1)은 임시 폴더에만: 넣지도 산출물로 올리지도 않음
  assert.doesNotMatch(WF, /git add[^\n]*private/);
  const upload = steps.find(s => s.name.startsWith('받은 원문')); assert.ok(upload); assert.doesNotMatch(upload.body, /private/);
  assert.ok([...WF.matchAll(/--private "([^"]+)"/g)].every(m => m[1] === '$W/private.json'));
  assert.match(WF, /echo "W=\$RUNNER_TEMP\/gdr" >> "\$GITHUB_ENV"/); // $W = 실행기 임시 폴더(저장소 밖)
});

test('YAML 로 읽힘(파이썬 yaml 이 있을 때)', t => {
  const r = spawnSync('python3', ['-I', '-c', 'import sys,json,yaml;d=yaml.safe_load(open(sys.argv[1]));print(json.dumps({"on":list(d[True].keys()),"jobs":list(d["jobs"].keys()),"steps":len(d["jobs"]["pick"]["steps"]),"perm":d["permissions"]}))', path.join(ROOT, '.github/workflows/godori-pick.yml')], {encoding: 'utf8'});
  if (r.status !== 0 && /No module named/.test(r.stderr)) { t.skip('PyYAML 없음'); return; }
  assert.equal(r.status, 0, r.stderr);
  const d = JSON.parse(r.stdout); assert.deepEqual(d.on, ['schedule', 'workflow_dispatch']); assert.deepEqual(d.jobs, ['pick']); assert.deepEqual(d.perm, {contents: 'write'}); assert.ok(d.steps >= 10);
});

test('이어 붙이기 셈(워크플로 안 merge.mjs): 겹친 날 확인 · 수정주가 회사 안 붙임 · 장 중 오늘 줄 뺌 · --asof = 달력 마지막 날', () => {
  const lines = WF.split('\n'), a = lines.findIndex(l => l.includes("<<'EOF'")), b = lines.findIndex((l, i) => i > a && l.trim() === 'EOF');
  const body = lines.slice(a + 1, b), ind = Math.min(...body.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdr-merge-')), w = (f, s) => { fs.mkdirSync(path.dirname(path.join(dir, f)), {recursive: true}); fs.writeFileSync(path.join(dir, f), s); };
  w('merge.mjs', body.map(l => l.slice(ind)).join('\n'));
  const base = [['20261012', 1, 1, 1, 100, 10], ['20261013', 1, 1, 1, 101, 11]], co = ['A00001', 'B00002', 'C00003', 'D00004', 'E00005'];
  const stocks = Object.fromEntries(co.map(c => [c, {fchart: {rows: base.map(r => [...r])}, finance: {text: null}}]));
  w('b/bundle.json.gz', zlib.gzipSync(JSON.stringify({schema: 'x', stocks})));
  w('scripts/atlas11/t365/universe.json', JSON.stringify({bundle: 'b/bundle.json.gz'}));
  w('site/atlas/data/mkt.json', JSON.stringify({asOf: '2026-10-13', companies: Object.fromEntries(co.map(c => [c, {n: c}]))}));
  const fresh = [['20261013', 101, 11], ['20261014', 102, 12], ['20261015', 103, 13]];
  w('closes/20261015T120000Z.json.gz', zlib.gzipSync(JSON.stringify({ok: 4, rows: {A00001: fresh, B00002: [['20261013', 50, 11], ['20261014', 51, 12]], C00003: [['20261014', 102, 12]], E00005: fresh, D00004: fresh}})));
  const run = now => { const r = spawnSync(process.execPath, ['merge.mjs', 'closes', 'out/bundle.json.gz'], {cwd: dir, encoding: 'utf8', env: {...process.env, GDR_NOW: now}}); fs.mkdirSync(path.join(dir, 'out'), {recursive: true}); return r; };
  fs.mkdirSync(path.join(dir, 'out'), {recursive: true});
  let r = run('2026-10-15T11:30:00Z'); // 서울 목요일 20:30 — 장 끝남
  assert.equal(r.status, 0, r.stderr); assert.equal(r.stdout.trim(), 'asof=2026-10-15');
  let B = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'out/bundle.json.gz'))));
  assert.deepEqual(B.stocks.A00001.fchart.rows.slice(-2), [['20261014', null, null, null, 102, 12], ['20261015', null, null, null, 103, 13]]);
  assert.equal(B.stocks.B00002.fchart.rows.length, 2); // 겹친 날 종가가 다름(수정주가) → 안 붙임
  assert.equal(B.stocks.C00003.fchart.rows.length, 2); // 겹친 날 없음 → 안 붙임
  let rep = JSON.parse(fs.readFileSync(path.join(dir, 'out/merge.json'), 'utf8'));
  assert.deepEqual([rep.codes, rep.added, rep.adjusted, rep.noOverlap, rep.cutToday], [3, 6, ['B00002'], ['C00003'], false]);
  r = run('2026-10-15T03:00:00Z'); // 서울 목요일 12:00 — 장 중: 오늘(15일) 줄은 뺌 → 14일까지
  assert.equal(r.stdout.trim(), 'asof=2026-10-14');
  B = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'out/bundle.json.gz'))));
  assert.equal(B.stocks.A00001.fchart.rows.at(-1)[0], '20261014');
  rep = JSON.parse(fs.readFileSync(path.join(dir, 'out/merge.json'), 'utf8')); assert.equal(rep.cutToday, true);
  fs.rmSync(path.join(dir, 'closes'), {recursive: true}); r = run('2026-10-15T11:30:00Z'); // 일봉을 못 받음 → 지금 모음 날
  assert.equal(r.stdout.trim(), 'asof=2026-10-13');
});
