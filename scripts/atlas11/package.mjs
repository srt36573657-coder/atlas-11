/**
 * ATLAS 11 · 배포 묶음 — dist/ (index.html 최상위, 소스 대용량 제외) 와 두 ZIP
 *   node scripts/atlas11/package.mjs [--out ../out] [--no-full]
 *   (1) ATLAS11_Drop_<forecastId>.zip   : dist/ 내용 그대로 (Netlify Drop 용)
 *   (2) ATLAS11_Full_<forecastId>.zip   : 전체 소스·원자료·감사 이력 (node_modules · dist · out 제외)
 * 비밀키는 어떤 ZIP 에도 넣지 않는다 (grep 검사).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run = promisify(execFile);
const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const out = path.resolve(arg('--out') ?? path.join(root, '..', 'out'));
const sha = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
const copyDir = async (from, to) => { await fs.mkdir(to, {recursive: true}); for (const e of await fs.readdir(from, {withFileTypes: true})) { const a = path.join(from, e.name), b = path.join(to, e.name); if (e.isDirectory()) await copyDir(a, b); else await fs.copyFile(a, b); } };
const exists = async f => { try { await fs.access(f); return true; } catch { return false; } };

export async function buildDist() {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11/view/manifest.json'), 'utf8'));
  const dist = path.join(root, 'dist');
  await fs.rm(dist, {recursive: true, force: true}); await fs.mkdir(dist, {recursive: true});
  await copyDir(path.join(root, 'site'), dist);
  await copyDir(path.join(root, 'public/data/atlas11/view'), path.join(dist, 'data/atlas11/view'));
  // 「내일 하루만」(2026-10-02 사장님 명령): 여러 날 전망 원본(20거래일 발행본·9/17 고정판)은 사이트에 싣지 않는다 — 저장소의 원본은 그대로(지우지 않음)
  const multiDay = async f => manifest.tomorrowOnly && (f === 'archive-fixed-20260917.json' || JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11', f), 'utf8')).horizon !== 1);
  for (const f of ['forecast.json', 'archive-fixed-20260917.json']) if (await exists(path.join(root, 'public/data/atlas11', f)) && !(await multiDay(f))) await fs.copyFile(path.join(root, 'public/data/atlas11', f), path.join(dist, 'data/atlas11', f));
  await copyDir(path.join(root, 'public/downloads/atlas11'), path.join(dist, 'downloads/atlas11'));
  // v6: 기록 장부 화면 사본·일일 보고(여섯 문장)·기록 CSV — 화면 「기록」이 읽는다
  for (const d of ['public/data/atlas11/ledger', 'public/data/atlas11/daily']) if (await exists(path.join(root, d))) await copyDir(path.join(root, d), path.join(dist, d.replace('public/', '')));
  if (await exists(path.join(root, 'public/downloads/rolling'))) await copyDir(path.join(root, 'public/downloads/rolling'), path.join(dist, 'downloads/rolling'));
  await fs.mkdir(path.join(dist, 'docs'), {recursive: true});
  for (const f of ['ATLAS11_README.md', 'ATLAS11_REPORT.md']) if (await exists(path.join(root, 'docs', f))) await fs.copyFile(path.join(root, 'docs', f), path.join(dist, 'docs', f));
  await fs.writeFile(path.join(dist, '_headers'), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n/index.html\n  Cache-Control: no-cache\n/data/*\n  Cache-Control: no-cache\n/app/*\n  Cache-Control: no-cache\n");
  // 검사 증거(실제 브라우저 검사 보고·캡처·단위 검사·독립 검증) — 화면 「자료 상태」에서 연다
  await fs.mkdir(path.join(dist, 'docs/evidence'), {recursive: true});
  try { const latest = JSON.parse(await fs.readFile(path.join(root, 'reports/atlas11/browser/latest.json'), 'utf8')); await fs.writeFile(path.join(dist, 'docs/evidence/browser-report.json'), JSON.stringify(latest, null, 1)); const src = path.join(root, latest.dir); for (const f of await fs.readdir(src)) if (/^(pc|mobile)-0[1-8][a-z]?-.*\.png$/.test(f)) await fs.copyFile(path.join(src, f), path.join(dist, 'docs/evidence', f)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  for (const [from, to] of [['reports/atlas11/tests.tap', 'tests.tap'], ['reports/atlas11/verify/independent-check.md', 'independent-check.md']]) if (await exists(path.join(root, from))) await fs.copyFile(path.join(root, from), path.join(dist, 'docs/evidence', to));
  await fs.writeFile(path.join(dist, 'netlify.toml'), '[build]\n  publish = "."\n');
  await fs.writeFile(path.join(dist, 'README.txt'), `ATLAS 11 정적 배포 묶음\n발행본 ${manifest.forecastId} · 기준일 ${manifest.actualAsOf} · 발행 ${manifest.issuedAt}\n\n이 폴더(index.html 이 맨 위)를 그대로 Netlify Drop 에 올리면 화면이 열립니다.\n서버·매일 수집·예약 실행은 포함되지 않습니다. 전체 소스 ZIP 의 docs/ATLAS11_README.md 를 보세요.\n`);
  // 비밀키 검사
  const secretPattern = /(FRED_API_KEY|NAVER_CLIENT_SECRET|KRX_API_KEY|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY-----)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{8,}/;
  const files = []; const walk = async d => { for (const e of await fs.readdir(d, {withFileTypes: true})) { const f = path.join(d, e.name); if (e.isDirectory()) await walk(f); else files.push(f); } }; await walk(dist);
  let bytes = 0; const hashes = {};
  for (const f of files) { const st = await fs.stat(f); bytes += st.size; if (/\.(html|js|css|json|md|txt|toml|csv)$/.test(f) && st.size < 20e6) { const t = await fs.readFile(f, 'utf8'); if (secretPattern.test(t)) throw Error('SECRET_IN_DIST ' + f); } hashes[path.relative(dist, f)] = await sha(f); }
  await fs.writeFile(path.join(dist, 'dist-manifest.json'), JSON.stringify({schema: 'atlas11-dist-manifest-1', forecastId: manifest.forecastId, builtAt: new Date().toISOString(), files: files.length, bytes, hashes}, null, 1));
  return {dist, files: files.length + 1, bytes, forecastId: manifest.forecastId};
}

export async function zipAll({full = true} = {}) {
  const d = await buildDist();
  await fs.mkdir(out, {recursive: true});
  const dropZip = path.join(out, `ATLAS11_Drop_${d.forecastId}.zip`);
  await fs.rm(dropZip, {force: true});
  await run('zip', ['-q', '-r', '-X', dropZip, '.'], {cwd: d.dist, maxBuffer: 1e8});
  const result = {drop: {file: dropZip, bytes: (await fs.stat(dropZip)).size, sha256: await sha(dropZip), files: d.files}};
  if (full) {
    const fullZip = path.join(out, `ATLAS11_Full_${d.forecastId}.zip`);
    await fs.rm(fullZip, {force: true});
    await run('zip', ['-q', '-r', '-X', fullZip, '.', '-x', 'node_modules/*', 'dist/*', 'out/*', '*.tmp', 'reports/atlas11/publish.lock', 'reports/atlas11/operations/run.lock'], {cwd: root, maxBuffer: 1e8});
    result.full = {file: fullZip, bytes: (await fs.stat(fullZip)).size, sha256: await sha(fullZip)};
  }
  // CRC 검사 (unzip -t)
  for (const z of [result.drop.file, result.full?.file].filter(Boolean)) { const {stdout} = await run('unzip', ['-tq', z], {maxBuffer: 1e8}); if (!/No errors detected/.test(stdout)) throw Error('ZIP_CRC ' + z); }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(JSON.stringify(await zipAll({full: !process.argv.includes('--no-full')})));
}
