#!/usr/bin/env node
/* ATLAS 11 · 올리기 문(규칙 34) — 사장님 2026-10-08 01:31 「너 대충하고 있어 너 시스템으로 그짓 못하게 해」
   사이트에 올리기 직전(deploy_netlify.mjs 맨 앞 · 손으로 올리기 · 평일 16:00 · 19:00 자동 올리기 모두 같은 길)에 이 문을 지난다. 하나라도 걸리면 올리지 않는다:
     ① 빠짐없이 도는 검사(full_check.mjs)의 결과 reports/atlas11/full-check/latest.json 이 있다
     ② 그 결과의 화면 코드 지문 = 지금 화면 코드 지문(site/app 의 .js · .css · 말 사전 .json · site/index.html) — 화면을 고치고 검사를 안 돌리면 여기서 막힘
     ③ 그 결과가 사이트의 모든 판(2026-10-08 18:33 부터 한국 · 미국 — lib/atlas11/places.mjs · 옛 다섯 나라) · 모든 화면(빠른 검사 아님)이고 실패 0
     ④ 말 사전 73개가 같은 열쇠를 다 가짐(만 · 억을 쓰는 말 셋은 그 셋끼리) — 영어로 다 돈 검사가 다른 말에서도 통하게
     ⑤ 그 결과가 두 말(영어 · 한국어 — 사장님이 보는 말 · 가장 좁은 폭 360)로 모든 화면을 돈 것(2026-10-08 05:05 — 한국어는 종류마다 한 곳만 재던 구멍)
     ⑥ 그 결과에 빈 날 길이 있음(자료를 바꿔치기해 값이 비는 날 · 없는 주소에도 그림 한 장인지 — 05:05 빈 날 막기)
     ⑦ 그 결과가 v3 — 73개 말 계산 층(모든 화면의 글을 73개 말로 바꿔 남은 한국어 0) · 74개 말 가장 긴 글 층(말마다 · 화면 종류마다 가장 긴 화면이 한 화면 · 넘침 0)을 돈 것(06:42)
   자료(종가 · 기사)가 날마다 바뀌는 것은 지문에 들지 않는다 — 자동 올리기는 화면 코드가 그대로면 지나간다
   쓰는 법: node scripts/atlas11/art_gate.mjs (지나가면 0 · 막히면 1과 까닭) */
import {SITE_BOARDS} from '../../lib/atlas11/places.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

/** 화면 코드 지문 — site/app 아래 .js · .css · .json(말 사전) + site/index.html · 파일 이름 차례로 이어 sha256 앞 16자 */
export async function codePrint(root) {
  const files = [];
  const walk = async d => { for (const e of (await fs.readdir(d, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) { const f = path.join(d, e.name); if (e.isDirectory()) await walk(f); else if (/\.(js|css|json)$/.test(e.name)) files.push(f); } };
  await walk(path.join(root, 'site/app'));
  files.push(path.join(root, 'site/index.html'));
  const h = createHash('sha256');
  for (const f of files) { h.update(path.relative(root, f).replace(/\\/g, '/') + '\n'); h.update((await fs.readFile(f, 'utf8')).replace(/\r\n/g, '\n')); h.update('\n'); }
  return h.digest('hex').slice(0, 16);
}

/** 말 사전 열쇠 맞춤 — 만 · 억을 그대로 쓰는 말(i18n.js LANG_LIST 의 my) 셋은 중국어와, 나머지는 영어와 */
export async function dictParity(root) {
  const dir = path.join(root, 'site/app/i18n'), bad = [];
  const read = async c => JSON.parse(await fs.readFile(path.join(dir, c + '.json'), 'utf8'));
  const src = await fs.readFile(path.join(root, 'site/app/i18n.js'), 'utf8');
  const my = new Set([...src.matchAll(/code:\s*'([\w-]+)'[^}]*\bmy:\s*true/g)].map(m => m[1]));
  const en = Object.keys((await read('en')).templates), zh = Object.keys((await read('zh')).templates);
  for (const f of await fs.readdir(dir)) {
    if (!f.endsWith('.json')) continue;
    const c = f.slice(0, -5), T = (await read(c)).templates ?? {}, ref = my.has(c) ? zh : en;
    const miss = ref.filter(k => !(k in T) || !String(T[k]).trim());
    if (miss.length) bad.push(`${c}: 사전에 없는 말 ${miss.length}개(${miss.slice(0, 3).join(' / ')})`);
  }
  return bad;
}

/** 번역 면제(2026-10-09 · 사장님 03:14 「번역 작업 하지마 올린 프롬프트 존중해서 작업해」 · 03:59 「알아서 해」) — reports/atlas11/full-check/trans-waiver.json
 *  기한(until · 한국 날짜) 안에서만 · 「번역 안 된 한국어」 실패만 봐줌(그 밖의 실패 · 층을 덜 돈 결과는 그대로 막음) · 파일을 지우면 면제 끝 */
export async function transWaiver(root, today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)) {
  let w = null; try { w = JSON.parse(await fs.readFile(path.join(root, 'reports/atlas11/full-check/trans-waiver.json'), 'utf8')); } catch { return null; }
  return w?.schema === 'atlas11-trans-waiver-1' && /^\d{4}-\d{2}-\d{2}$/.test(w.until ?? '') && today <= w.until && Array.isArray(w.said) && w.said.length ? w : null;
}
/** 검사 결과 하나가 문을 지나는가(②③⑤⑥) — r = latest.json · now = 지금 화면 코드 지문 · waiver = 번역 면제(없으면 null) · 걸린 까닭 목록(비면 지나감) */
export function reportProblems(r, now, waiver = null) {
  const bad = [];
  if (r.code !== now) bad.push(`화면 코드가 검사 뒤에 바뀜(검사 ${r.code} · 지금 ${now}) — 빠짐없이 도는 검사를 다시 돌려야 함`);
  if (r.quick) bad.push('빠른 검사 결과임(모든 화면을 돌지 않음)');
  if (!SITE_BOARDS.every(b => (r.boards ?? []).includes(b))) bad.push(`사이트 판(${SITE_BOARDS.join(' · ')})을 모두 돈 결과가 아님(${(r.boards ?? []).join(' · ')})`); // 2026-10-08 18:33 「한국 미국장만 두고 남머지 장은 삭제해」 — 옛 「다섯 나라」
  const langs = r.langs ?? ['en'];
  if (!['en', 'ko'].every(l => langs.includes(l))) bad.push(`두 말(영어 · 한국어)로 모든 화면을 돈 결과가 아님(${langs.join(' · ')})`);
  if (!(r.edge > 0)) bad.push('빈 날 길(값이 비는 날 · 없는 주소)을 돌지 않은 결과임');
  if (!(r.transLangs >= 73)) bad.push(`73개 말 계산 층(남은 한국어)을 돌지 않은 결과임(${r.transLangs ?? 0}개 말)`); // v3(2026-10-08 06:42 「10배 정교」)
  if (!(r.layoutLangs >= 74)) bad.push(`74개 말 가장 긴 글 층(한 화면 · 넘침)을 돌지 않은 결과임(${r.layoutLangs ?? 0}개 말)`);
  if (!r.d3 || typeof r.d3 !== 'object' || !Object.keys(r.d3).length) bad.push('입체 층(모든 화면 그림에 입체 — 규칙 46 · 2026-10-09 19:27 「모든곳에 3d」)을 돌지 않은 결과임');
  if (!(r.click3?.pairs > 0)) bad.push('3단 클릭 층(모든 화면 쌍 3번 이하 — 규칙 47 · 2026-10-09 21:33 「3단 클릭구조 … 모든곳에 하나도 빠짐없이」)을 돌지 않은 결과임');
  const ez = r.easy; // 쉬운 말 층(규칙 48 · 2026-10-09 22:40 마카오 시각 「아이큐 92 남자 고등학생이 … 교차 검증을 100만번」) — 한국어 쉬운 말로 모든 화면 · 빈 날 길 · 3단 클릭 · 숫자 맞대기 · 어려운 말 맞대기
  if (!(ez?.pages > 0 && ez?.edge > 0 && ez?.click3?.pairs > 0 && ez?.numPages > 0 && ez?.hardChecks > 0)) bad.push('쉬운 말 층(한국어 쉬운 말로 모든 화면 · 빈 날 길 · 3단 클릭 · 숫자 · 어려운 말 맞대기 — 규칙 48)을 돌지 않은 결과임');
  const transOnly = !!waiver && r.shape === true && Number.isInteger(r.transFailed) && r.otherFailed === 0 && r.failed === r.transFailed; // 번역만 남은 결과 + 기한 안 면제
  if ((r.failed !== 0 || !r.ok) && !transOnly) bad.push(`검사 실패 ${r.failed}개${Number.isInteger(r.otherFailed) ? `(번역 밖 ${r.otherFailed}개 · 번역 안 된 한국어 ${r.transFailed}개${waiver ? '' : ' — 번역 면제 없음'})` : ''}`);
  return bad;
}
export async function artGate(root = process.cwd()) {
  const bad = [];
  let r = null;
  try { r = JSON.parse(await fs.readFile(path.join(root, 'reports/atlas11/full-check/latest.json'), 'utf8')); } catch { bad.push('빠짐없이 도는 검사 결과가 없음(node scripts/atlas11/full_check.mjs)'); }
  const waiver = await transWaiver(root);
  if (r) bad.push(...reportProblems(r, await codePrint(root), waiver));
  bad.push(...await dictParity(root));
  return {ok: !bad.length, bad, waiver: waiver && r && r.failed > 0 ? {until: waiver.until, said: waiver.said, transFailed: r.transFailed} : null,
    report: r ? {at: r.at, seconds: r.seconds, pages: r.pages, byLang: r.byLang ?? null, edge: r.edge ?? 0, transLangs: r.transLangs ?? 0, layoutLangs: r.layoutLangs ?? 0, numbers: r.numbers, failed: r.failed, transFailed: r.transFailed ?? null, otherFailed: r.otherFailed ?? null, code: r.code} : null};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const g = await artGate();
  if (g.ok) console.log(`올리기 문 통과 — 화면 ${g.report.pages}개(영어 ${g.report.byLang?.en ?? '?'} · 한국어 ${g.report.byLang?.ko ?? '?'} · 빈 날 ${g.report.edge}) · 번역 ${g.report.transLangs}개 말 · 가장 긴 글 ${g.report.layoutLangs}개 말 · 맞댄 숫자 ${g.report.numbers}개 · ${g.waiver ? `번역 밖 실패 0 · 번역 안 된 한국어 ${g.waiver.transFailed}건은 번역 면제(${g.waiver.until}까지 · ${g.waiver.said[0]})` : '실패 0'} · ${g.report.seconds}초 · 검사 ${g.report.at}`);
  else { console.error('올리기 문 막힘:\n' + g.bad.map(x => ' · ' + x).join('\n')); process.exit(1); }
}
