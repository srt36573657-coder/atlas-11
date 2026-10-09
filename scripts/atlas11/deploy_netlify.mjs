#!/usr/bin/env node
/**
 * ATLAS 11 · 화면(dist/)을 넷리파이에 올린다 — 매일 실행(GitHub Actions)의 마지막 단계.
 *   필요한 것: 환경변수 NETLIFY_AUTH_TOKEN (저장소 비밀) 하나.
 *   사이트: NETLIFY_SITE_ID 가 있으면 그 사이트, 없으면 deploy/netlify-site.json 의 사이트, 그것도 없으면 새 사이트를 만들어 그 파일에 적는다.
 *   aaa7377.com 같은 기존 사이트는 NETLIFY_SITE_ID 로 지정하지 않는 한 건드리지 않는다.
 *   새로 만든 사이트에는 검색 제외(X-Robots-Tag: noindex · robots.txt)를 붙인다 — 공개 주소지만 검색에 걸리지 않게.
 *   열쇠는 화면·로그·파일 어디에도 쓰지 않는다.
 * 남기는 것: reports/atlas11/operations/deploy-latest.json · deploy-log.jsonl · 기록 장부 operation(kind: site_deploy)
 * 함수(2026-10-09 선물형 초대장 · /api/invite): functions/atlas11 만 함께 올린다 — 저장소 밖 임시 폴더에 그 함수 · 함수가 부르는 저장소 파일 · 쓰는 패키지만 옮겨
 *   넷리파이 도구가 거기서 묶게 한다(저장소의 옛 netlify/functions · netlify.toml 은 끼지 않음). 함수를 넣어 올리다 실패하면 함수 없이 한 번 더 올린다(자료 올리기는 멈추지 않음).
 *   함수는 올릴 때마다 같이 올라가야 남는다(넷리파이는 올릴 때마다 통째로 바꿈) — 손 · 평일 16:00 · 19:00 자동 올리기 모두 이 길.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {builtinModules} from 'node:module';
import {appendRecord} from '../../lib/atlas11/records.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const API = 'https://api.netlify.com/api/v1';
const SITE_FILE = 'deploy/netlify-site.json';
export const FUNCTIONS_DIR = 'functions/atlas11';

async function api(method, pathname, token, body) {
  const res = await fetch(API + pathname, {method, headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'atlas11-deploy'}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000)});
  const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw Error(`NETLIFY_API ${method} ${pathname} → ${res.status} ${(json?.message ?? text).slice(0, 160)}`);
  return json;
}

/** 사이트 정하기 — 우선순위: 환경변수 → 저장된 파일 → 새로 만들기(파일에 적음) */
export async function resolveSite({token, envSiteId = process.env.NETLIFY_SITE_ID, rootDir = root, create = true, apiImpl = api, name = null} = {}) {
  if (envSiteId) return {siteId: envSiteId, source: 'env', created: false};
  let saved = null; try { saved = JSON.parse(await fs.readFile(path.join(rootDir, SITE_FILE), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (saved?.siteId) return {siteId: saved.siteId, source: 'file', created: false, url: saved.url ?? null, name: saved.name ?? null};
  // 저장 파일이 없을 때: 이 스크립트가 전에 만든 사이트(atlas11-xxxxxx)가 넷리파이에 있으면 그것을 다시 쓴다 — 기록 커밋이 한 번 실패해도 주소가 날마다 새로 생기지 않게
  try {
    const list = await apiImpl('GET', '/sites?filter=all&per_page=100&name=atlas11-', token);
    const mine = (Array.isArray(list) ? list : []).filter(x => /^atlas11-[a-z0-9]{6}$/.test(x?.name ?? '')).sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
    if (mine.length) {
      const f = mine[0], rec = {siteId: f.id, name: f.name, url: f.ssl_url || f.url, adminUrl: f.admin_url ?? null, createdAt: f.created_at ?? null, foundAt: new Date().toISOString(), createdBy: 'scripts/atlas11/deploy_netlify.mjs', note: '저장 파일이 없어 넷리파이에서 이 스크립트가 전에 만든 사이트를 찾아 다시 씀 · 사이트 번호는 비밀이 아님'};
      await fs.mkdir(path.join(rootDir, 'deploy'), {recursive: true}); await fs.writeFile(path.join(rootDir, SITE_FILE), JSON.stringify(rec, null, 2) + '\n');
      return {siteId: f.id, source: 'found', created: false, url: rec.url, name: f.name, others: mine.length - 1};
    }
  } catch {}
  if (!create) return {siteId: null, source: 'none', created: false};
  const siteName = name ?? `atlas11-${Math.random().toString(36).slice(2, 8)}`;
  const s = await apiImpl('POST', '/sites', token, {name: siteName});
  const rec = {siteId: s.id, name: s.name, url: s.ssl_url || s.url, adminUrl: s.admin_url ?? null, createdAt: new Date().toISOString(), createdBy: 'scripts/atlas11/deploy_netlify.mjs', note: '열쇠(NETLIFY_AUTH_TOKEN)만 넣었을 때 자동으로 만든 사이트 · 사이트 번호는 비밀이 아님 · aaa7377.com 으로 바꾸려면 저장소 비밀 NETLIFY_SITE_ID 에 그 사이트 번호를 넣는다'};
  await fs.mkdir(path.join(rootDir, 'deploy'), {recursive: true});
  await fs.writeFile(path.join(rootDir, SITE_FILE), JSON.stringify(rec, null, 2) + '\n');
  return {siteId: s.id, source: 'created', created: true, url: rec.url, name: rec.name};
}

/** 올릴 폴더 준비: 저장소 밖 임시 폴더로 복사(저장소 netlify.toml 의 함수 설정이 끼지 않게) · 새 사이트면 검색 제외 */
export async function stageDir(distDir, {noindex = true, into = null} = {}) {
  const tmp = into ?? await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-site-'));
  await fs.cp(distDir, tmp, {recursive: true});
  if (noindex) {
    const hp = path.join(tmp, '_headers'); let headers = ''; try { headers = await fs.readFile(hp, 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (!/X-Robots-Tag/i.test(headers)) headers = headers.startsWith('/*\n') ? headers.replace('/*\n', '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n') : '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n' + headers;
    await fs.writeFile(hp, headers);
    await fs.writeFile(path.join(tmp, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  }
  return tmp;
}

/** 함수 준비: rootDir/functions/atlas11 의 .mjs · .js 와 그것이 부르는 저장소 파일(상대 경로) · 패키지(+ 그 의존성)를 stageRoot 에 같은 자리로 옮긴다
 *  반환: null(함수 없음) 또는 {rel, dir, functions, files, packages} — 넷리파이 도구가 stageRoot 에서 돌면 묶을 때 저장소 밖 파일을 빠뜨리지 않는다(2026-10-09 직접 확인) */
export async function stageFunctions(rootDir, stageRoot, fnRel = FUNCTIONS_DIR) {
  let names = [];
  try { names = (await fs.readdir(path.join(rootDir, fnRel))).filter(f => /\.m?js$/.test(f)).sort(); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  if (!names.length) return null;
  const copied = new Set(), pkgs = new Set(), queue = names.map(n => path.join(fnRel, n)), builtin = new Set(builtinModules);
  while (queue.length) {
    const rel = path.normalize(queue.shift()); if (copied.has(rel)) continue;
    if (rel.startsWith('..') || path.isAbsolute(rel)) throw Error('함수가 저장소 밖 파일을 부름: ' + rel);
    copied.add(rel);
    const text = await fs.readFile(path.join(rootDir, rel), 'utf8');
    await fs.mkdir(path.dirname(path.join(stageRoot, rel)), {recursive: true}); await fs.copyFile(path.join(rootDir, rel), path.join(stageRoot, rel));
    for (const m of text.matchAll(/(?:^|[\s;])(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|[\s;])import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] ?? m[2] ?? m[3];
      if (spec.startsWith('.')) queue.push(path.join(path.dirname(rel), spec));
      else if (!spec.startsWith('node:') && !builtin.has(spec.split('/')[0])) pkgs.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
    }
  }
  const seen = new Set(), pq = [...pkgs];
  while (pq.length) {
    const p = pq.shift(); if (seen.has(p)) continue;
    const from = path.join(rootDir, 'node_modules', p);
    try { await fs.access(path.join(from, 'package.json')); } catch { continue; } // 다른 패키지 안쪽(node_modules)에 든 의존성 — 그 패키지를 통째로 옮길 때 같이 옴
    seen.add(p);
    await fs.cp(from, path.join(stageRoot, 'node_modules', p), {recursive: true, dereference: true});
    const pj = JSON.parse(await fs.readFile(path.join(from, 'package.json'), 'utf8'));
    for (const d of Object.keys(pj.dependencies ?? {})) pq.push(d);
  }
  return {rel: fnRel, dir: path.join(stageRoot, fnRel), functions: names.map(n => n.replace(/\.m?js$/, '')), files: [...copied].sort(), packages: [...seen].sort()};
}

function run(cmd, args, env, cwd) {
  return new Promise(resolve => { const p = spawn(cmd, args, {env, cwd, stdio: ['ignore', 'pipe', 'pipe']}); let out = '', err = ''; p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; }); p.on('close', code => resolve({code, out, err})); });
}

export async function deploy({distDir = path.join(root, 'dist'), message = null, now = new Date().toISOString()} = {}) {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) return {state: 'skipped', reason: 'NETLIFY_AUTH_TOKEN 없음 — 저장소 비밀에 넣으면 다음 실행부터 올라감'};
  const site = await resolveSite({token});
  // 올릴 폴더: 임시 뿌리 아래 publish(화면 · 자료) + functions/atlas11(함수) — 넷리파이 도구는 그 뿌리에서 돈다(뿌리의 netlify.toml 은 publish 한 줄)
  const stageRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-site-'));
  const stage = path.join(stageRoot, 'publish'); await fs.mkdir(stage);
  await stageDir(distDir, {noindex: site.source !== 'env', into: stage});
  await fs.writeFile(path.join(stageRoot, 'netlify.toml'), '[build]\n  publish = "publish"\n');
  let fns = null, fnError = null;
  try { fns = await stageFunctions(root, stageRoot); } catch (e) { fnError = String(e.message); }
  const env = {...process.env, NETLIFY_AUTH_TOKEN: token, NETLIFY_SITE_ID: site.siteId};
  const cli = withFns => ['--yes', 'netlify-cli', 'deploy', '--prod', '--dir', 'publish', ...(withFns ? ['--functions', fns.rel] : []), '--site', site.siteId, '--message', message ?? `atlas11 daily ${now.slice(0, 10)}`, '--json'];
  const parse = r => { try { return JSON.parse(r.out.slice(r.out.indexOf('{'))); } catch { return null; } };
  const redact = s => String(s ?? '').split(token).join('***').slice(-600);
  let r = await run('npx', cli(!!fns), env, stageRoot), out = parse(r), fnState = fns ? 'deployed' : fnError ? 'failed' : 'none';
  if (fns && !(r.code === 0 && out)) { // 함수를 넣어 올리다 실패 → 함수 없이 한 번 더(그날 자료는 올라가게)
    fnError = redact(r.err || r.out); fnState = 'failed';
    r = await run('npx', cli(false), env, stageRoot); out = parse(r);
  }
  const result = {schema: 'atlas11-site-deploy-1', at: now, state: r.code === 0 && out ? 'ready' : 'failed', siteSource: site.source, siteCreated: site.created, siteId: site.siteId, url: out?.url ?? site.url ?? null, deployUrl: out?.deploy_url ?? null, deployId: out?.deploy_id ?? null, noindex: site.source !== 'env', files: (await fs.readdir(stage, {recursive: true})).length, exitCode: r.code, error: r.code === 0 ? null : redact(r.err || r.out),
    functions: {state: fnState, names: fns?.functions ?? [], packages: fns?.packages ?? [], error: fnState === 'failed' ? fnError : null}};
  await fs.rm(stageRoot, {recursive: true, force: true});
  const ops = path.join(root, 'reports/atlas11/operations'); await fs.mkdir(ops, {recursive: true});
  await fs.writeFile(path.join(ops, 'deploy-latest.json'), JSON.stringify(result, null, 2));
  await fs.appendFile(path.join(ops, 'deploy-log.jsonl'), JSON.stringify(result) + '\n');
  await appendRecord(root, {type: 'operation', at: now, body: {kind: 'site_deploy', ...result, status: result.state === 'ready' ? '배포 완료' : '배포 실패'}});
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  // 올리기 문(규칙 34 · 2026-10-08 01:31 「너 시스템으로 그짓 못하게 해」) — 빠짐없이 도는 검사가 지금 화면 코드로 실패 0 이 아니면 올리지 않는다(손 · 자동 모두)
  const {artGate} = await import('./art_gate.mjs'), gate = await artGate(root);
  if (!gate.ok) { console.error('올리기 문 막힘 — 사이트에 올리지 않음:\n' + gate.bad.map(x => ' · ' + x).join('\n')); console.log(JSON.stringify({state: 'blocked', gate: gate.bad})); process.exit(3); }
  console.log(`올리기 문 통과 — 빠짐없이 도는 검사 화면 ${gate.report.pages}개 · 맞댄 숫자 ${gate.report.numbers}개 · 실패 0`);
  const out = await deploy({distDir: path.resolve(arg('--dir') ?? 'dist'), message: arg('--message')});
  console.log(JSON.stringify({...out, error: out.error ? out.error.slice(0, 300) : null}));
  process.exitCode = out.state === 'failed' ? 2 : 0;
}
