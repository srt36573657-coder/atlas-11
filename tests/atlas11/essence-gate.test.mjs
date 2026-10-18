// 본질 문 시험(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [2] 6 「문을 세운 뒤 일부러 틀린 판 일곱으로 한 번씩 막혀 보라. 「세웠다」는 증거가 아니다.」 · 일꾼 KA)
//   깨끗한 판 = 지금 사이트 사본(임시 폴더) + 받은 기록 하나 → 일곱 모두 지나감(끝 코드 0)
//   틀린 판 일곱 = 깨끗한 판에서 한 군데씩 바꿈 → 끝 코드 1 · 막은 번호가 그 하나뿐
//   + 지킴 파일(진화 가지) · 올리기 문 자리(deploy_netlify.mjs art_gate 바로 뒤) · 명령 줄 끝 코드 — 60초 안 · 임시 폴더는 끝에 지움
//   「오늘 걸린 곳」(KNOWN) = 10월 18일 실제 사이트에서 본질 문이 막은 곳(리드에게 보고) — 이 시험은 문 자체를 보므로 사본에서만 고침 · 실제 사이트는 올리기 문이 그대로 막음 · 고쳐지면 저절로 아무 일 없음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {essenceGate, protectedTouched, PROTECTED, ESSENCE_FILE, ESSENCE_OLD, LOCK_FILE, ORDER_FILE, UPDATES_DIR, orderLines} from '../../scripts/atlas11/next/essence_check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = path.join(ROOT, 'site');
const T0 = Date.now();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'essence-gate-'));
test.after(() => fs.rmSync(TMP, {recursive: true, force: true}));

const cp = (from, to) => { fs.mkdirSync(path.dirname(to), {recursive: true}); fs.cpSync(from, to, {recursive: true}); };
const readJ = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJ = (f, v) => fs.writeFileSync(f, JSON.stringify(v) + '\n');
/** 꼭 바꿈 — 바꿀 자리가 없으면 시험이 멈춤(조용히 지나가지 않게) */
function must(file, pat, rep) {
  const t = fs.readFileSync(file, 'utf8');
  const hit = typeof pat === 'string' ? t.includes(pat) : pat.test(t);
  if (!hit) throw Error(`틀린 판을 만들 자리를 못 찾음 — ${path.basename(file)} 「${String(pat).slice(0, 60)}」(이 시험을 그 파일에 맞게 고칠 것)`);
  fs.writeFileSync(file, typeof pat === 'string' ? t.split(pat).join(rep) : t.replace(pat, rep));
}
const KNOWN = [ // [사이트 안 파일, 꼴, 바꿈, 까닭] — 오늘 걸린 곳(보고함)
  ['letter.js', /'도장 모으기'/g, "'쓴 주 기록'", '③ 폭죽과 연속 접속 보상 — 쓴 주마다 도장 · 넷째 주 은빛 · 열두째 주 달빛'],
  ['app/invite.js', /매수 검토/g, '지난 기록', '③ 사라고 부추기기 — 옛 초대장 쪽 「매수 검토 후보 · 우선순위」(규칙 55 영구 삭제)'],
  ['next/app.js', 'for (const p of GDR?.picks ?? [])', 'for (const p of (opened() ? GDR?.picks : null) ?? [])', '④ 회사 화면 꼬리표 wTags 가 열한 질문 전에 「칸 n번」을 보임'],
];

/** 깨끗한 판 — {site, root, now} */
function clean(dir) {
  const site = path.join(dir, 'site'), root = path.join(dir, 'root');
  cp(path.join(SITE, 'next'), path.join(site, 'next'));
  for (const f of ['mkt.json', 'home.json', 'core.json', 'days.json']) cp(path.join(SITE, 'atlas/data', f), path.join(site, 'atlas/data', f));
  const M = readJ(path.join(site, 'atlas/data/mkt.json'));
  const top = Object.entries(M.companies).filter(([k, o]) => /^[0-9A-Z]{6}$/.test(k) && Number.isFinite(o?.c)).sort((a, b) => b[1].c - a[1].c).slice(0, 6).map(([k]) => k);
  for (const k of top) { const f = path.join(SITE, 'atlas/data/co', k + '.json'); if (fs.existsSync(f)) cp(f, path.join(site, 'atlas/data/co', k + '.json')); }
  for (const f of ['hello.html', 'hello-send.js', 'letter.html', 'letter.js', 'invite.html', 'app/invite.js', 'privacy.html']) if (fs.existsSync(path.join(SITE, f))) cp(path.join(SITE, f), path.join(site, f));
  for (const f of [ESSENCE_FILE, LOCK_FILE, ORDER_FILE]) cp(path.join(ROOT, f), path.join(root, f));
  // 받은 기록 하나(이 자료 home.json 을 만든 업데이트) · 요약 = 그 받은 때 · 첫 화면이 쓰는 요약(src.home = home.json kst)
  const H = readJ(path.join(site, 'atlas/data/home.json'));
  const stamp = new Date(H.made).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  fs.mkdirSync(path.join(root, UPDATES_DIR), {recursive: true});
  writeJ(path.join(root, UPDATES_DIR, stamp + '.json'), {schema: 'essence-gate-test', at: H.made, served: 'rolled', fetch: {ok: Object.keys(M.companies).length}, result: '바꿈', slot: '14:00', asOf: H.asOf});
  const sp = path.join(site, 'next/data/home-summary.json'), S = readJ(sp);
  Object.assign(S, {coN: Object.keys(M.companies).length, fetchedAt: H.made, src: {...(S.src ?? {}), home: H.kst}});
  writeJ(sp, S);
  for (const [f, pat, rep] of KNOWN) { const p = path.join(site, f); if (!fs.existsSync(p)) continue; const t = fs.readFileSync(p, 'utf8'); if (typeof pat === 'string' ? t.includes(pat) : pat.test(t)) fs.writeFileSync(p, typeof pat === 'string' ? t.split(pat).join(rep) : t.replace(pat, rep)); }
  return {site, root, now: Date.parse(H.made) + 2 * 36e5}; // 받은 지 두 시간 — 「?」 없음이 맞는 때
}
const fails = r => (r.result?.checks ?? []).filter(c => c.status !== 'pass').map(c => c.no);
const why = r => (r.lines ?? []).join('\n');

const BASE = path.join(TMP, 'clean'), FX = clean(BASE);
const variant = name => { const d = path.join(TMP, name); fs.cpSync(BASE, d, {recursive: true}); return {site: path.join(d, 'site'), root: path.join(d, 'root'), now: FX.now}; };

test('깨끗한 판 — 일곱 모두 지나감(끝 코드 0) · 세 줄 숫자 = 자료', async () => {
  const t = Date.now(), r = await essenceGate({dist: FX.site, root: FX.root, now: FX.now});
  assert.equal(r.code, 0, why(r));
  assert.deepEqual(r.result.checks.map(c => c.no), [1, 2, 3, 4, 5, 6, 7]);
  const c2 = r.result.checks.find(c => c.no === 2), M = readJ(path.join(FX.site, 'atlas/data/mkt.json'));
  assert.match(c2.counts.lines[1], new RegExp(`회사 ${Object.keys(M.companies).length.toLocaleString('en-US')}곳`));
  assert.ok(!c2.counts.lines[2].includes('?'), c2.counts.lines[2]);
  assert.deepEqual(c2.counts.lines.map(s => s.replace(/[\d,]+곳/, 'n곳').replace(/\d{1,2}월 \d{1,2}일 \d{1,2}시/, '○월 ○일 ○시')), orderLines(FX.root));
  const c6 = r.result.checks.find(c => c.no === 6);
  assert.ok(c6.counts.sent >= 5, '보낸 것 ' + c6.counts.sent);
  console.log(`깨끗한 판 ${((Date.now() - t) / 1000).toFixed(1)}초 · 세 줄: ${c2.counts.lines.join(' / ')} · 보낸 것 ${c6.counts.sent}`);
});

const WRONG = [
  [1, '본질 파일 한 글자 바꿈', ({root}) => fs.appendFileSync(path.join(root, ESSENCE_FILE), ' ')],
  [2, '요약 파일 회사 수가 자료와 다름', ({site}) => { const f = path.join(site, 'next/data/home-summary.json'), S = readJ(f); S.coN -= 1; writeJ(f, S); }],
  [3, '화면 글에 망치는 길 낱말', ({site}) => must(path.join(site, 'hello.html'), '</body>', '<p>지금이 기회예요. 놓치지 마세요.</p></body>')],
  [4, '칸 잠금 줄을 지움', ({site}) => must(path.join(site, 'next/p-gdr.js'), /\n[ \t]*if \(!opened\(\)\) return lockBox\(G, opt\);/, '')],
  [5, '친구 말 칸을 질문 앞에 둠', ({site}) => must(path.join(site, 'next/p-share.js'), 'nodes: [top,', 'nodes: [top, after,')],
  [6, '보내는 글의 수익 숫자 거름(noGain)을 비움', ({site}) => must(path.join(site, 'next/p-share.js'), /const noGain = s => [^\n]*/, "const noGain = s => String(s ?? '');")],
  [7, '오래된 받은 때에도 「?」를 안 붙임', ({site}) => must(path.join(site, 'next/essence.js'), "(d.old ? '? ' : '')", "''")],
];
for (const [no, name, wreck] of WRONG) {
  test(`틀린 판 ${no} — ${name} → 끝 코드 1 · 막은 번호 ${no} 하나`, async () => {
    const v = variant('w' + no); wreck(v);
    const r = await essenceGate({dist: v.site, root: v.root, now: v.now});
    assert.equal(r.code, 1, why(r));
    assert.deepEqual(fails(r), [no], why(r));
    const c = r.result.checks.find(x => x.no === no);
    console.log(`틀린 판 ${no} 막힘 — ${c.reasons[0]}`);
  });
}

test('지킴 파일 — 진화 가지가 건드리면 막힘 · 옛 이름 길 · 옮김 · git 따옴표 · NFD', () => {
  assert.deepEqual(protectedTouched(['site/next/app.js', 'site/next/p-today.js', 'docs/ATLAS_원칙.md']), []);
  for (const p of PROTECTED) { const f = p.endsWith('/') ? p + 'x.mjs' : p; assert.deepEqual(protectedTouched([f]), [f], p); }
  assert.ok(ESSENCE_OLD.includes('docs/꼴똘이_본질.md') && ESSENCE_OLD.includes('docs/꼴동이_본질.md'), ESSENCE_OLD.join(' '));
  assert.deepEqual(protectedTouched(['docs/new.md -> ' + ESSENCE_FILE]), [ESSENCE_FILE]);
  assert.deepEqual(protectedTouched(['./site/next/words.js', 'site\\next\\words.js']), ['site/next/words.js']);
  const q = '"' + [...Buffer.from(ESSENCE_FILE)].map(b => (b < 128 ? String.fromCharCode(b) : '\\' + b.toString(8))).join('') + '"';
  assert.deepEqual(protectedTouched([q]), [ESSENCE_FILE]);
  assert.deepEqual(protectedTouched([ESSENCE_FILE.normalize('NFD')]), [ESSENCE_FILE]);
  assert.deepEqual(protectedTouched(['scripts/atlas11/jinhwa']), ['scripts/atlas11/jinhwa']);
  const cli = f => spawnSync(process.execPath, [path.join(ROOT, 'scripts/atlas11/next/essence_check.mjs'), '--files', f], {encoding: 'utf8'}).status;
  assert.equal(cli(ESSENCE_FILE + ',site/next/app.js'), 1);
  assert.equal(cli('site/next/app.js,site/next/app.css'), 0);
});

test('올리기 문 자리 — deploy_netlify.mjs 가 art_gate 바로 뒤 · 올리기 앞에서 본질 문을 돌리고 막히면 끝남', () => {
  const s = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/deploy_netlify.mjs'), 'utf8'), main = s.slice(s.lastIndexOf('if (process.argv[1]'));
  const a = main.indexOf('artGate('), e = main.indexOf('essenceGate('), d = main.indexOf('await deploy(');
  assert.ok(a > 0 && e > a && d > e, `차례 art_gate ${a} · 본질 문 ${e} · 올리기 ${d}`);
  assert.match(main.slice(e, d), /if \(!eg\.ok\)[^\n]*본질 문이 막음 — 지금 사이트 그대로[^\n]*process\.exit\(3\)/);
});

test('60초 안', () => { const s = (Date.now() - T0) / 1000; console.log(`모두 ${s.toFixed(1)}초`); assert.ok(s < 60, s + '초'); });
