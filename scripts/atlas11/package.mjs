/**
 * ATLAS 11 · 배포 묶음 — dist/ (index.html 최상위) 와 ZIP · 지금 묶음 판(예측 없음)
 *   node scripts/atlas11/package.mjs [--out ../out] [--no-full]
 *   (1) ATLAS11_Drop_<boardId>.zip : dist/ 내용 그대로 (Netlify Drop 용)
 *   (2) ATLAS11_Full_<boardId>.zip : 전체 소스·원자료·기록 (node_modules · dist · out 제외)
 * 2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 … 표현하지 마라」: 사이트에는 화면(site/)과 판 묶음(public/data/atlas11/view)만 싣는다.
 *   지난 예측 기록(발행본 · 장부 사본 · 일일 보고 · CSV · 검사 캡처)은 저장소에 보관만 하고 사이트에 싣지 않는다.
 * 비밀키는 어떤 ZIP 에도 넣지 않는다 (grep 검사).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readSiteLog} from '../../lib/atlas11/changelog.mjs';
const run = promisify(execFile);
const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const out = path.resolve(arg('--out') ?? path.join(root, '..', 'out'));
const sha = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
const copyDir = async (from, to) => { await fs.mkdir(to, {recursive: true}); for (const e of await fs.readdir(from, {withFileTypes: true})) { const a = path.join(from, e.name), b = path.join(to, e.name); if (e.isDirectory()) await copyDir(a, b); else await fs.copyFile(a, b); } };

export async function buildDist() {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11/view/manifest.json'), 'utf8'));
  if (manifest.prediction !== 'off' || !manifest.boardId) throw Error('NOT_A_BOARD_BUNDLE — public/data/atlas11/view 는 판 묶음이어야 합니다(node scripts/atlas11/build_view.mjs)');
  const dist = path.join(root, 'dist');
  await fs.rm(dist, {recursive: true, force: true}); await fs.mkdir(dist, {recursive: true});
  await copyDir(path.join(root, 'site'), dist);
  await copyDir(path.join(root, 'public/data/atlas11/view'), path.join(dist, 'data/atlas11/view'));
  // 미국 판(2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」) — 판 묶음이 있으면 같은 화면 코드를 /us/ 에
  //   한국 매일·저녁 실행도 이 함수로 싸서 올리므로(사이트 전체를 바꿈) 미국 판을 여기서 함께 싸야 지워지지 않는다
  //   places.json = 위 막대 「한국 · 미국」 단추가 읽는 판 목록(미국 판이 없으면 한국 하나 → 단추 없음) — 늘 써서 화면이 없는 파일을 부르지 않게
  const usDir = path.join(root, 'public/data/atlas11/us/view');
  const usOk = await fs.readFile(path.join(usDir, 'manifest.json'), 'utf8').then(t => { const m = JSON.parse(t); return m.prediction === 'off' && !!m.boardId && m.place?.id === 'us'; }).catch(() => false);
  if (usOk) { await copyDir(path.join(root, 'site'), path.join(dist, 'us')); await copyDir(usDir, path.join(dist, 'us/data/atlas11/view')); }
  await fs.writeFile(path.join(dist, 'places.json'), JSON.stringify({schema: 'atlas11-places-1', places: [{id: 'kr', label: '한국', href: '/'}, ...(usOk ? [{id: 'us', label: '미국', href: '/us/'}] : [])]}) + '\n');
  // 아래 탭 「기록」(2026-10-06 16:10 사장님 「업데이트한 날짜랑 자료 변경한 날짜를 … 별도의 탭에 … 기록 하는 탭」) — /changelog.json 한 파일(한국 · 미국 판이 함께 읽음)
  //   업데이트 · 자료 변경 기록(reports/atlas11/changelog · reports/atlas11/us/changelog)을 모음 · 올라간 때 = 올리기 기록에서 만든 때 뒤 첫 올림 · 아직이면 이 묶음을 만든 때
  //   검사에 걸린 줄은 빼고 알림만 — 기록 때문에 올리기가 멈추지 않게(빠진 줄은 problems 에 남아 화면 검사가 0 인지 본다)
  let log; try { log = await readSiteLog(root, {now: new Date().toISOString()}); } catch (e) { log = {schema: 'atlas11-changelog-1', generatedAt: new Date().toISOString(), from: null, count: {all: 0, update: 0, data: 0}, entries: [], problems: [{id: null, bad: ['읽지 못함: ' + e.message]}]}; }
  if (log.problems.length) console.warn('changelog problems (left out): ' + JSON.stringify(log.problems.slice(0, 5)));
  await fs.writeFile(path.join(dist, 'changelog.json'), JSON.stringify(log) + '\n');
  await fs.writeFile(path.join(dist, '_headers'), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n/index.html\n  Cache-Control: no-cache\n/data/*\n  Cache-Control: no-cache\n/app/*\n  Cache-Control: no-cache\n/places.json\n  Cache-Control: no-cache\n/us/index.html\n  Cache-Control: no-cache\n/us/data/*\n  Cache-Control: no-cache\n/us/app/*\n  Cache-Control: no-cache\n");
  // 지운 화면(게임 · 옛 자료 파일 주소)은 처음 화면으로 — 옛 즐겨찾기가 빈 쪽에 닿지 않게
  await fs.writeFile(path.join(dist, '_redirects'), '/game/*  /  302\n/game  /  302\n/downloads/*  /  302\n/docs/*  /  302\n' + (usOk ? '/us  /us/  301\n' : '')); // /us(끝 빗금 없음)는 한국 자료를 읽게 되므로 /us/ 로
  await fs.writeFile(path.join(dist, 'netlify.toml'), '[build]\n  publish = "."\n');
  await fs.writeFile(path.join(dist, 'README.txt'), `ATLAS 11 정적 배포 묶음 · ${manifest.universeSet?.label ?? manifest.companies + '곳'} 판\n판 ${manifest.boardId} · 종가 기준일 ${manifest.asOf} · 만든 시각 ${manifest.generatedAt}\n\n이 폴더(index.html 이 맨 위)를 그대로 Netlify Drop 에 올리면 화면이 열립니다.\n매일 수집·예약 실행은 포함되지 않습니다.\n`);
  // 비밀키 검사
  const secretPattern = /(FRED_API_KEY|NAVER_CLIENT_SECRET|KRX_API_KEY|NETLIFY_AUTH_TOKEN|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY-----)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{8,}/;
  const files = []; const walk = async d => { for (const e of await fs.readdir(d, {withFileTypes: true})) { const f = path.join(d, e.name); if (e.isDirectory()) await walk(f); else files.push(f); } }; await walk(dist);
  let bytes = 0; const hashes = {};
  for (const f of files) { const st = await fs.stat(f); bytes += st.size; if (/\.(html|js|css|json|md|txt|toml|csv)$/.test(f) && st.size < 20e6) { const t = await fs.readFile(f, 'utf8'); if (secretPattern.test(t)) throw Error('SECRET_IN_DIST ' + f); } hashes[path.relative(dist, f)] = await sha(f); }
  await fs.writeFile(path.join(dist, 'dist-manifest.json'), JSON.stringify({schema: 'atlas11-dist-manifest-2', boardId: manifest.boardId, asOf: manifest.asOf, prediction: 'off', builtAt: new Date().toISOString(), files: files.length, bytes, hashes}, null, 1));
  return {dist, files: files.length + 1, bytes, boardId: manifest.boardId};
}

export async function zipAll({full = true} = {}) {
  const d = await buildDist();
  await fs.mkdir(out, {recursive: true});
  const dropZip = path.join(out, `ATLAS11_Drop_${d.boardId}.zip`);
  await fs.rm(dropZip, {force: true});
  await run('zip', ['-q', '-r', '-X', dropZip, '.'], {cwd: d.dist, maxBuffer: 1e8});
  const result = {drop: {file: dropZip, bytes: (await fs.stat(dropZip)).size, sha256: await sha(dropZip), files: d.files}};
  if (full) {
    const fullZip = path.join(out, `ATLAS11_Full_${d.boardId}.zip`);
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
