#!/usr/bin/env node
/* 본질 문 — 올리기 직전에 늘 도는 문(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [2] 3 ~ 6 · [11] 6 · 일꾼 KA)
   「essence_check.mjs를 올리기 직전 문(art_gate 등)에서 늘 돌려라. 걸리면 새 판을 올리지 않고 지금 사이트를 그대로 둔다.」
   잣대 = docs/<이름>_본질.md(이름 = site/next/brand.js NAME · 사장님 말씀으로만 고침) · 잠금 = config/atlas11/essence.lock.json · 낱말 = site/next/words.js RUIN(한 곳)

   쓰는 법
     node scripts/atlas11/next/essence_check.mjs                       인자 없음 = 이 저장소의 site 폴더(소스)를 정적으로 봄(진화 회차 gh.mjs essenceFull 이 부름)
     node scripts/atlas11/next/essence_check.mjs --dist <폴더>        묶은 사이트(package.mjs → dist) 또는 site 같은 소스 폴더를 봄 — 기본 정적(브라우저 없이 · 자료 셈)
         [--render]  브라우저 층도(②④⑤⑦ 을 실제 화면으로 · 그 폴더를 잠깐 띄움) · [--pw <playwright 폴더>] [--now <ISO>] [--json] [--out <결과.json>]
     node scripts/atlas11/next/essence_check.mjs --files a,b,c          진화 가지 지킴: 지킴 파일을 건드렸으면 막음
     node scripts/atlas11/next/essence_check.mjs --diff <기준>..<끝>    (git diff --no-renames — 옮기기도 지우기 + 새 파일로 보임)
     import {checkDist, checkEssenceFile, protectedTouched, PROTECTED, essenceGate} from './essence_check.mjs'
     올리기(scripts/atlas11/deploy_netlify.mjs art_gate 바로 뒤) = essenceGate({dist, render: false}) — 걸리면 「본질 문이 막음 — 지금 사이트 그대로」 · 올리지 않음
     브라우저 화면 검사만(깃허브 모든 쪽 검사 · 주소로): scripts/atlas11/next/check_essence.mjs --base <주소> --pw <폴더> --all [--shard k/n] --out <파일>
   끝 코드: 0 = 지나감 · 1 = 막음(까닭마다 ① ~ ⑦ 번호) · 2 = 보지 못함(올리기에서는 막음과 같음)

   보는 것 일곱(명령문 [2] 5) — 정적(브라우저 없이 · 올리기 문) / 화면(브라우저 층 · 모든 쪽 검사)
     ① 본질 파일 · 명령문 파일 sha256 = 잠금 파일의 마지막 줄 · 잠금 줄마다 at(날짜) · words(사장님 원문) · sha256 이 있음                         정적
     ② 첫 화면 본질 세 줄 — 글 틀은 명령문 파일 [5] 2 ① ② ③ 에서 읽음(잠긴 사장님 글) · 회사 수 n = atlas/data/mkt.json 회사 칸을 따로 셈 ·
        받은 때 = 저장소 업데이트 기록(reports/atlas11/t365/updates · 네이버 일봉을 받아 굴린 회차)에서 at 이 그 자료 home.json made 와 같은 것을 따로 찾음
        (없으면 「?」) → essence.js 가 첫 화면과 같은 길(요약 파일 · sumOk)로 만든 세 줄과 맞댐 · app.js 가 essenceBox 를 첫 화면(vHomeAll)에서
        이야기 입구 위에 그림 · 소개 쪽 · 창 설명에 박힌 회사 수도 자료와 같음                                                                       정적 + 화면
     ③ 망치는 길 낱말 0 — next/*.js 글(rename.mjs jsStrings) · next/*.html · /hello.html · /letter.html · /invite.html(+ 그 쪽 스크립트 글) ·
        next/data/*.json 글 · next/i18n/en.json 값 — words.js RUIN(갈래 = 본질 파일의 망치는 길 여덟과 같아야 함) · words.js 자신은 셈 밖           정적
     ④ 칸(#/gdr)은 열한 질문 뒤에만 — p-gdr gdrSection 첫 문 = opened() · opened = 열한 답 기록 · 질문은 열하나(p-why QS) ·
        다른 화면이 칸 번호(칸 n번 · #/gdr/n · 고른 곳)를 보이면 그 함수 또는 부르는 줄에 열한 질문 문이 있어야 함                                  정적 + 화면
     ⑤ 친구가 연 쪽(#/s/…)은 질문부터 — p-share render: 이름 → 질문 → 친구 말 · 친구 말 · 「나도 보내기」는 다 답한 뒤에만(reveal) ·
        질문 모듈을 못 받은 오류 길(catch)에서 여는 것은 막지 않고 적어 둠                                                                            정적 + 화면
     ⑥ 보내는 글에 수익률 0 — 줄의 카톡 단추(share-btn.js shareButtons → pack)와 글상자(p-share.js open)를 브라우저 없는 가짜 쪽에서 진짜로 돌려
        오른 종목(제목에 「+31.2%」) · 급등(반값 한 줄) · 같이 따져 줘 · 시황 쪽을 보냄 → 보낸 제목 · 글 · 주소(풀어서) · 주소 속 말 · 카톡 카드에
        수익률 · 수익 숫자(words.js gainHits) 0 · 거르는 말(sendHits)이 수익 숫자를 아직 막는지                                                    정적(가짜 쪽)
     ⑦ 오래된 날짜에 「?」 — essence.js OLD_HOURS 가 12 ~ 120시간 · 30일 전 받은 때를 넣으면 「?」 · 10분 전이면 「?」 없음 · 모르면 「?」 ·
        실제 자료로 낸 줄도 따로 센 나이와 맞음                                                                                                       정적 + 화면
   보지 않는 것: 영상 · 예약 작업 · 진화 칸(사장님 기기) — 다른 일꾼의 검사 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {execFileSync, spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {jsStrings} from './rename.mjs';
import {RUIN, ruinHits, gainHits} from '../../../site/next/words.js';
import {BRAND, NAME} from '../../../site/next/brand.js';

const SELF = fileURLToPath(import.meta.url);
export const ROOT = path.resolve(path.dirname(SELF), '../../..');
/** 본질 파일 = docs/<이름>_본질.md(이름은 brand.js 한 곳 — 이름이 바뀌고 파일 · 잠금이 안 따라오면 ① 이 막음) */
export const ESSENCE_FILE = `docs/${NAME}_본질.md`, LOCK_FILE = 'config/atlas11/essence.lock.json', ORDER_FILE = 'docs/design/kkolttori-2026-10-18/order-1639.txt';
/** 옛 이름의 본질 파일 길(brand.js was · 17:15 「꼴동이」 — 세 분 동안 쓴 이름이라 was 에 없음) — 진화 가지가 옛 길로 본질 파일을 되살리지 못하게 지킴 목록에 */
export const ESSENCE_OLD = Object.freeze([...new Set([...BRAND.was.map(w => `docs/${w.ko}_본질.md`), 'docs/꼴동이_본질.md'])].filter(f => f !== ESSENCE_FILE));
export const LOCK_SCHEMA = 'kkolttori-essence-lock-1';
export const MARK = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦'];
export const CHECK_NAMES = Object.freeze({1: '본질 파일 해시', 2: '첫 화면 세 줄과 숫자', 3: '망치는 길 낱말 0', 4: `${NAME} 칸은 열한 질문 뒤에만`, 5: '친구가 연 쪽은 질문부터', 6: '보내는 글에 수익률 0', 7: '오래된 날짜에 「?」'});
/** 오래됨 잣대(⑦) — essence.js OLD_HOURS 가 이 범위 밖이면 막음(늘 「?」 이거나 한 달 지나도 「?」 없음을 막으려고) */
export const STALE_H_RANGE = [12, 120];
/** 업데이트 기록(② 받은 때 따로 셈) — 저장소 뿌리 기준 */
export const UPDATES_DIR = 'reports/atlas11/t365/updates';

/* ───────────── 지킴 파일(진화 가지 · [8] 10 「기계는 본질 파일, 망치는 길 목록, 잣대, 이 명령문을 스스로 고치지 못한다」) ─────────────
   카드(KA) 목록 + 문 자신의 두 끝(올리기 deploy_netlify.mjs 의 본질 문 줄 · 모든 쪽 화면 검사 껍데기 check_essence.mjs) — 진화 가지가 문을 빼거나 무르게 못 하게 */
export const PROTECTED = Object.freeze([ESSENCE_FILE, ...ESSENCE_OLD, LOCK_FILE, ORDER_FILE, 'config/atlas11/jinhwa-metrics.v1.json', 'site/next/words.js',
  'scripts/atlas11/next/essence_check.mjs', 'scripts/atlas11/next/check_essence.mjs', 'scripts/atlas11/deploy_netlify.mjs', 'tests/atlas11/essence-gate.test.mjs',
  'scripts/atlas11/jinhwa/', 'lib/atlas11/jinhwa.mjs', 'lib/atlas11/tally.mjs', 'functions/atlas11/jinhwa.mjs', 'functions/atlas11/tally.mjs',
  '.github/workflows/atlas11-daily.yml', '.github/workflows/atlas11-evening.yml']);
/** git 이 감싼 이름(「"docs/\352\274\264…"」 · 옮김 「a -> b」 · 「./a」 · 윈도 빗금 · 맥 NFD 한글)을 저장소 기준 이름으로 */
export function normRel(f) {
  let s = String(f ?? '').trim();
  if (/^".*"$/.test(s)) s = Buffer.from(s.slice(1, -1).replace(/\\([0-7]{3})|\\(.)/g, (m, o, c) => (o ? String.fromCharCode(parseInt(o, 8)) : c === 't' ? '\t' : c === 'n' ? '\n' : c)), 'latin1').toString('utf8');
  s = s.replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/\/{2,}/g, '/').normalize('NFC');
  if (s.startsWith(ROOT.replace(/\\/g, '/') + '/')) s = s.slice(ROOT.length + 1);
  return s;
}
/** 지킴 파일을 건드린 것들(옮김 줄 「a -> b」 · 「a => b」는 두 이름 모두 봄) — 비면 지나감 */
export function protectedTouched(files) {
  const all = [];
  for (const f of files ?? []) for (const x of String(f).split(/\s+(?:->|=>)\s+/)) if (x.trim()) all.push(normRel(x));
  return [...new Set(all.filter(f => PROTECTED.some(p => (p.endsWith('/') ? f.startsWith(p) || f + '/' === p : f === p))))].sort();
}
/** git diff <기준>..<끝> 이름 목록(옮김은 지우기 + 새 파일로) */
export function diffFiles(range, cwd = ROOT) {
  const out = execFileSync('git', ['-c', 'core.quotePath=false', 'diff', '--name-only', '--no-renames', range], {cwd, encoding: 'utf8', maxBuffer: 64e6});
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

/* ───────────── 결과 꼴 ───────────── */
// status: pass(지나감) · fail(막음) · cant(보지 못함 — 올리기에서는 막음과 같음) · 까닭마다 한 줄
const mk = (no, mode) => ({no, name: CHECK_NAMES[no], mode, status: 'pass', reasons: [], notes: [], counts: {}});
const bad = (c, why) => { c.status = 'fail'; c.reasons.push(why); return c; };
const cant = (c, why) => { if (c.status === 'pass') c.status = 'cant'; c.reasons.push('보지 못함 — ' + why); return c; };
const note = (c, t) => { c.notes.push(t); return c; };
/** 같은 번호의 정적 · 화면 결과 합치기 — 하나라도 막으면 막음 · 하나라도 지나가면(나머지는 못 봄) 지나감 · 모두 못 봤으면 못 봄 */
export function mergeChecks(list) {
  const by = new Map();
  for (const c of list) {
    const o = by.get(c.no);
    if (!o) { by.set(c.no, {...c, reasons: [...c.reasons], notes: [...c.notes], counts: {...c.counts}, modes: [c.mode], parts: [c.status]}); continue; }
    o.parts.push(c.status); o.status = o.parts.includes('fail') ? 'fail' : o.parts.includes('pass') ? 'pass' : 'cant';
    o.reasons.push(...c.reasons); o.notes.push(...c.notes);
    for (const [k, v] of Object.entries(c.counts)) o.counts[k in o.counts ? c.mode + '.' + k : k] = v;
    if (!o.modes.includes(c.mode)) o.modes.push(c.mode); o.mode = o.modes.join('+');
  }
  return [...by.values()].map(o => ({...o, ok: o.status === 'pass'})).sort((a, b) => a.no - b.no);
}
/** 끝 코드 — 막힌 것이 있으면 1 · 아니면 못 본 것이 있으면 2 · 아니면 0 */
export const codeOf = checks => (checks.some(c => c.status === 'fail') ? 1 : checks.some(c => c.status === 'cant') ? 2 : 0);

/* ───────────── 파일 읽기 ───────────── */
const exists = p => { try { fs.accessSync(p); return true; } catch { return false; } };
const readText = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = p => { const t = readText(p); if (t == null) return {miss: true}; try { return {v: JSON.parse(t)}; } catch (e) { return {broken: String(e.message).slice(0, 80)}; } };
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const num = n => Number(n).toLocaleString('ko-KR');

/* ───────────── ① 본질 파일 해시 ───────────── */
export async function checkEssenceFile({root = ROOT} = {}) {
  const c = mk(1, 'static');
  const L = readJson(path.join(root, LOCK_FILE));
  if (L.miss) return bad(c, `잠금 파일이 없음(${LOCK_FILE})`);
  if (L.broken) return bad(c, `잠금 파일이 깨짐(${L.broken})`);
  const lock = L.v;
  if (lock?.schema !== LOCK_SCHEMA) bad(c, `잠금 파일 꼴이 다름(schema ${lock?.schema ?? '없음'} — ${LOCK_SCHEMA} 이어야 함)`);
  const files = lock?.files && typeof lock.files === 'object' ? lock.files : {};
  for (const need of [ESSENCE_FILE, ORDER_FILE]) if (!Array.isArray(files[need]) || !files[need].length) bad(c, `잠금 파일에 ${need} 줄이 없음`);
  let n = 0;
  for (const [rel, rows] of Object.entries(files)) {
    if (!Array.isArray(rows) || !rows.length) { bad(c, `잠금 ${rel}: 줄이 없음`); continue; }
    rows.forEach((r, i) => {
      n++;
      const at = typeof r?.at === 'string' ? r.at : '', words = typeof r?.words === 'string' ? r.words.trim() : '';
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(at) || !Number.isFinite(Date.parse(at.length === 16 || /[+-]\d{2}:\d{2}$|Z$/.test(at) ? at : at + 'Z'))) bad(c, `잠금 ${rel} ${i + 1}번째 줄: at(사장님 말씀 날짜 · 예 2026-10-18T16:39+08:00)이 없거나 틀림 「${at}」`);
      if (words.length < 5) bad(c, `잠금 ${rel} ${i + 1}번째 줄: words(사장님 원문)가 없음`);
      if (!/^[0-9a-f]{64}$/.test(r?.sha256 ?? '')) bad(c, `잠금 ${rel} ${i + 1}번째 줄: sha256 이 64자 해시가 아님`);
    });
    const buf = (() => { try { return fs.readFileSync(path.join(root, rel)); } catch { return null; } })();
    if (!buf) { bad(c, `잠금에 적힌 파일이 없음: ${rel}`); continue; }
    const now = sha256(buf), last = rows[rows.length - 1]?.sha256;
    c.counts[rel] = now.slice(0, 8);
    if (now !== last) bad(c, `${rel} 해시가 잠금 마지막 줄과 다름(지금 ${now.slice(0, 8)} · 잠금 ${String(last).slice(0, 8)}) — 이 파일은 사장님 말씀(날짜 · 원문)과 새 해시 한 줄을 잠금에 더할 때만 고침`);
  }
  c.counts.rows = n;
  return c;
}

/* ───────────── ③ 망치는 길 낱말 ───────────── */
/** 본질 파일 「## 망치는 길」 줄의 갈래 이름들 */
export function ruinPathsOf(essenceText) {
  const m = /##\s*망치는 길\s*\n+([^\n#]+)/.exec(String(essenceText ?? ''));
  return m ? m[1].replace(/[.。]\s*$/, '').split(/\s*,\s*/).map(s => s.trim()).filter(Boolean) : [];
}
/** html → 보이는 글 · 꾸밈 글(content · alt · title · aria-label · placeholder) · 쪽이 부르는 이 사이트 스크립트 주소 */
function htmlParts(t) {
  const scripts = [...t.matchAll(/<script\b[^>]*\bsrc\s*=\s*"([^"]+)"/gi)].map(m => m[1]).filter(s => s.startsWith('/') && !s.startsWith('//'));
  const body = t.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  const attrs = [...body.matchAll(/\s(?:content|alt|title|aria-label|placeholder)\s*=\s*"([^"]*)"/gi)].map(m => m[1]);
  const text = body.replace(/<[^>]+>/g, '\n').split('\n').map(x => x.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()).filter(Boolean);
  return {text: [...text, ...attrs], scripts};
}
const deepStrings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(x => deepStrings(x, out)); else if (v && typeof v === 'object') Object.values(v).forEach(x => deepStrings(x, out)); return out; };
/** 사이트의 보이는 글 모음 — [{file, s}] · 못 읽은 파일은 problems */
export function siteStrings(dir) {
  const out = [], problems = [], add = (file, s) => { if (typeof s === 'string' && s.trim()) out.push({file, s}); };
  const nd = path.join(dir, 'next');
  let names = [];
  try { names = fs.readdirSync(nd); } catch { problems.push('next/ 폴더가 없음'); return {out, problems}; }
  const jsFile = (rel, abs) => { const t = readText(abs); if (t == null) { problems.push(rel + ' 없음'); return; } try { for (const x of jsStrings(t)) add(rel, x.s); } catch (e) { problems.push(rel + ' 글 뽑기 실패 — ' + e.message); } };
  for (const f of names.filter(f => f.endsWith('.js')).sort()) if (f !== 'words.js') jsFile('next/' + f, path.join(nd, f)); // words.js = 낱말 목록 자신(화면 글 아님)
  const pages = names.filter(f => f.endsWith('.html')).map(f => 'next/' + f).concat(['hello.html', 'letter.html', 'invite.html']);
  const seenJs = new Set();
  for (const rel of pages) {
    const t = readText(path.join(dir, rel)); if (t == null) { if (!rel.startsWith('next/')) problems.push(rel + ' 없음'); continue; }
    const P = htmlParts(t); for (const s of P.text) add(rel, s);
    for (const src of P.scripts) { const r = src.replace(/^\//, '').replace(/[?#].*$/, ''); if (r.startsWith('next/') || r.endsWith('/words.js') || seenJs.has(r)) continue; seenJs.add(r); jsFile(r, path.join(dir, r)); } // 소개 · 편지 · 초대장 쪽 스크립트 글(next/ 는 위에서 셈)
  }
  try { for (const f of fs.readdirSync(path.join(nd, 'data')).filter(f => f.endsWith('.json')).sort()) { const j = readJson(path.join(nd, 'data', f)); if (j.v !== undefined) for (const s of deepStrings(j.v)) add('next/data/' + f, s); else problems.push('next/data/' + f + ' 못 읽음'); } }
  catch { problems.push('next/data/ 폴더가 없음'); }
  const en = readJson(path.join(nd, 'i18n/en.json'));
  if (en.v !== undefined) {
    const T = en.v?.templates && typeof en.v.templates === 'object' ? en.v.templates : en.v;
    for (const [k, v] of Object.entries(T ?? {})) { if (typeof v !== 'string') continue; if (RUIN.some(p => String(k).includes(p.name))) continue; add('next/i18n/en.json', v); } // 갈래 이름을 그대로 적은 한국어 줄의 영어는 셈 밖(RUIN_OK 와 같은 뜻)
  } else problems.push('next/i18n/en.json 못 읽음');
  return {out, problems};
}
export function checkWords(dir, {root = ROOT} = {}) {
  const c = mk(3, 'static');
  const paths = ruinPathsOf(readText(path.join(root, ESSENCE_FILE)));
  if (!paths.length) bad(c, `본질 파일에서 「망치는 길」 줄을 못 읽음(${ESSENCE_FILE})`);
  const names = RUIN.map(p => p.name);
  for (const p of paths) { const R = RUIN.find(x => x.name === p); if (!R) bad(c, `words.js RUIN 에 본질 파일의 망치는 길 「${p}」 낱말 목록이 없음`); else if (!R.ko.length) bad(c, `words.js RUIN 「${p}」 한국어 낱말이 비어 있음`); }
  for (const n of names) if (paths.length && !paths.includes(n)) bad(c, `words.js RUIN 「${n}」은 본질 파일의 망치는 길에 없음(이름이 다름)`);
  const {out, problems} = siteStrings(dir);
  for (const p of problems) if (/next\/ 폴더가 없음/.test(p)) cant(c, p); else note(c, p);
  const hits = [];
  for (const o of out) for (const h of ruinHits(o.s)) hits.push({...h, file: o.file, s: o.s});
  const seen = new Set();
  for (const h of hits) { const k = h.file + '|' + h.key + '|' + h.s; if (seen.has(k)) continue; seen.add(k); bad(c, `${h.file} — 「${h.name}」 낱말 「${h.word}」 · 「${h.s.replace(/\s+/g, ' ').trim().slice(0, 60)}」`); }
  c.counts = {strings: out.length, words: RUIN.reduce((a, p) => a + p.ko.length + p.en.length, 0), paths: RUIN.length, hits: seen.size};
  return c;
}

/* ───────────── 소스 읽기 도구(④ ⑤ ② 정적) ───────────── */
/** 소스에서 풀이 글 · 따옴표 글 · 정규식을 빈칸으로(줄 바꿈은 그대로) — 괄호 짝 셈이 글 속 { } 에 흔들리지 않게 */
export function codeOnly(src) {
  const s = src.split(''), n = s.length; let i = 0, prev = '';
  const blank = (a, b) => { for (let k = a; k < b && k < n; k++) if (s[k] !== '\n') s[k] = ' '; };
  const tpl = [];
  const readTpl = from => { let k = from; for (; k < n; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === '`') { blank(from, k); return k + 1; } if (src[k] === '$' && src[k + 1] === '{') { blank(from, k); tpl.push(0); return k + 2; } } return n; };
  while (i < n) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); blank(i, e < 0 ? n : e); i = e < 0 ? n : e; continue; }
    if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); blank(i, e < 0 ? n : e + 2); i = e < 0 ? n : e + 2; continue; }
    if (ch === '"' || ch === "'") { let k = i + 1; for (; k < n && src[k] !== ch && src[k] !== '\n'; k++) if (src[k] === '\\') k++; blank(i + 1, k); i = k + 1; prev = 'w'; continue; }
    if (ch === '`') { i = readTpl(i + 1); prev = 'w'; continue; }
    if (ch === '/' && (prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev) || /\b(return|typeof|case|in|of)\s*$/.test(src.slice(Math.max(0, i - 12), i)))) {
      let k = i + 1, cls = false; for (; k < n; k++) { const d = src[k]; if (d === '\\') { k++; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; continue; } if (d === '[') cls = true; else if (d === '/') break; }
      blank(i + 1, k); i = k + 1; prev = 'w'; continue;
    }
    if (ch === '{' && tpl.length) tpl[tpl.length - 1]++;
    if (ch === '}' && tpl.length) { if (tpl[tpl.length - 1] === 0) { tpl.pop(); i = readTpl(i + 1); continue; } tpl[tpl.length - 1]--; }
    if (!/\s/.test(ch)) prev = /[\w$)\]]/.test(ch) ? 'w' : ch;
    i++;
  }
  return s.join('');
}
/** 함수 몸통(여는 { 부터 짝 } 까지) — code = codeOnly 꼴 · at = 함수 머리 자리 · 못 찾으면 null */
function bodyAt(code, at) {
  const o = code.indexOf('{', at); if (o < 0) return null;
  let d = 0; for (let k = o; k < code.length; k++) { if (code[k] === '{') d++; else if (code[k] === '}' && --d === 0) return {start: o, end: k + 1}; }
  return null;
}
/** 여는 ( 의 짝 ) 다음 자리 — 기본값 「opt = {}」 · 「({a, b}) =>」 의 { } 를 몸통으로 읽지 않게 */
function afterParens(code, open) {
  let d = 0; for (let k = open; k < code.length; k++) { if (code[k] === '(') d++; else if (code[k] === ')' && --d === 0) return k + 1; }
  return -1;
}
/** 이름 붙은 함수(function x( · const x = (…) => · const x = async …) 몸통 — 화살 함수가 { 없이 값 하나면 그 줄 끝까지 */
function fnBody(code, name) {
  const re = new RegExp(`(?:^|[\\s;])(?:export\\s+)?(?:async\\s+)?function\\s*\\*?\\s*${name}\\s*\\(|(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?(\\(|[\\w$]+\\s*=>)`, 'm');
  const m = re.exec(code); if (!m) return null;
  let at = m.index + m[0].length;
  if (m[0].endsWith('(')) { at = afterParens(code, at - 1); if (at < 0) return null; }
  const arrow = /^\s*=>\s*/.exec(code.slice(at, at + 40));
  if (arrow) at += arrow[0].length;
  if (code[at] !== '{' && !/^\s*\{/.test(code.slice(at, at + 40))) { const e = code.indexOf('\n', at); return {start: at, end: e < 0 ? code.length : e, head: m.index}; }
  const b = bodyAt(code, at); return b ? {...b, head: m.index} : null;
}
/** 자리 at 를 품은 맨 바깥 선언(맨 위 단 function / const · let = …)의 이름 · 몸통 — 함수면 그 몸통 · 아니면 다음 맨 위 선언 앞까지 */
function enclosingTop(code, at) {
  const re = /^(?:export\s+)?(?:async\s+)?function\s*\*?\s*([\w$]+)\s*\(|^(?:export\s+)?(?:const|let|var)\s+([\w$]+)\s*=/gm;
  let best = null, next = code.length, m;
  while ((m = re.exec(code))) { if (m.index <= at) best = {name: m[1] ?? m[2], head: m.index, fn: m[1] != null, eq: m.index + m[0].length}; else { next = m.index; break; } }
  if (!best) return null;
  let b = null;
  if (best.fn) { const p = afterParens(code, best.eq - 1); if (p > 0) b = bodyAt(code, p); }
  else {
    const rest = code.slice(best.eq, best.eq + 200), a = /^\s*(?:async\s*)?(?:function\b[^(]*|(?=\())/.exec(rest);
    if (a && code[best.eq + a[0].length] === '(') { const p = afterParens(code, best.eq + a[0].length); const ar = p > 0 ? /^\s*(=>)?\s*\{/.exec(code.slice(p, p + 40)) : null; if (ar) b = bodyAt(code, p); }
    else if (/^\s*(?:async\s*)?[\w$]+\s*=>\s*\{/.test(rest)) b = bodyAt(code, best.eq);
  }
  return b && b.start <= at + 1 && at < b.end ? {...best, ...b} : {...best, start: best.head, end: next};
}

/* ───────────── ② 첫 화면 세 줄 · ⑦ 오래된 날짜 — 자료로 따로 셈 ───────────── */
/** 서울 시각 「YYYY-MM-DD HH:MM」 또는 ISO 를 ms 로 · 못 읽으면 NaN */
export function kstMs(t) {
  const s = String(t ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/.exec(s);
  if (!m) { m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]) - 9 * 36e5; return NaN; }
  const base = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
  if (!m[7]) return base - 9 * 36e5; // 띠 없음 = 서울 시각(home.json kst 꼴)
  if (m[7] === 'Z') return base;
  const z = m[7].replace(':', ''), sg = z[0] === '-' ? -1 : 1; return base - sg * (+z.slice(1, 3) * 36e5 + +z.slice(3, 5) * 6e4);
}
/** 받은 때 「○월 ○일 ○시」(서울) — 따로 셈 */
export const whenWords = ms => { const d = new Date(ms + 9 * 36e5); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${d.getUTCHours()}시`; };
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** 명령문 파일 [5] 2 ① ② ③ — 사장님 글 그대로(잠긴 파일 · 줄 바꿈은 띄어쓰기 하나로) · 못 읽으면 null */
export function orderLines(root = ROOT) {
  const t = readText(path.join(root, ORDER_FILE)); if (t == null) return null;
  const sec = /\n\[5 ·[^\n]*\]\n([\s\S]*?)\n\[6 ·/.exec(t)?.[1]; if (!sec) return null;
  const two = /(?:^|\n)2\.([\s\S]*?)\n3\./.exec(sec)?.[1]; if (!two) return null;
  const parts = two.split(/[①②③]/).slice(1).map(s => s.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim());
  return parts.length === 3 && parts.every(Boolean) ? parts : null;
}
/** 기록 하나가 「네이버 증권에서 받아 굴린 업데이트」인가 — 새로 굴린 자료를 올림(rolled) · 일봉을 받음(fetch.ok > 0) · 실패 아님 · 때가 읽힘 */
const gotFresh = r => r && r.served === 'rolled' && Number(r.fetch?.ok) > 0 && r.result !== '실패' && typeof r.at === 'string' && Number.isFinite(Date.parse(r.at));
/** 사이트 자료로 따로 센 것(②) — n = mkt.json 회사 칸(6자리 번호) 수 · 받은 때 = 저장소 업데이트 기록 가운데 at 이 그 자료 home.json made 와 같은 받은 기록 */
export function recount(dir, {root = ROOT} = {}) {
  const r = {n: null, fetchedMs: NaN, fetchedFile: null, src: {}, problems: [], notes: []};
  const M = readJson(path.join(dir, 'atlas/data/mkt.json'));
  if (M.v?.companies && typeof M.v.companies === 'object' && !Array.isArray(M.v.companies)) {
    const all = Object.keys(M.v.companies), keys = all.filter(k => /^[0-9A-Z]{6}$/.test(k));
    r.n = keys.length; r.src.n = 'atlas/data/mkt.json companies';
    if (keys.length !== all.length) r.problems.push(`mkt.json 회사 칸 ${all.length}개 가운데 6자리 번호가 아닌 칸 ${all.length - keys.length}개`);
    if (M.v.n != null && M.v.n !== r.n) r.problems.push(`mkt.json n(${M.v.n}) ≠ 회사 칸 수(${r.n})`);
  } else r.problems.push('atlas/data/mkt.json 회사 목록을 못 읽음');
  const H = readJson(path.join(dir, 'atlas/data/home.json')), S = readJson(path.join(dir, 'next/data/home-summary.json'));
  r.home = H.v ?? null; r.sum = S.v ?? null;
  if (!H.v) r.problems.push('atlas/data/home.json 을 못 읽음');
  const made = typeof H.v?.made === 'string' ? H.v.made : null;
  // 기록 파일 이름 = 받은 때(UTC) · 같은 날 앞뒤 하루 안 파일만 열어 봄(빠르게) — 못 찾으면 받은 때 모름(첫 화면 「?」가 맞음)
  const ud = path.join(root, UPDATES_DIR);
  let names = []; try { names = fs.readdirSync(ud).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)); } catch { r.notes.push(`업데이트 기록 폴더가 없음(${UPDATES_DIR}) — 받은 때는 「?」여야 함`); }
  if (made && Number.isFinite(Date.parse(made))) {
    const ms = Date.parse(made), near = new Set([-1, 0, 1].map(k => new Date(ms + k * 864e5).toISOString().slice(0, 10).replace(/-/g, '')));
    const hit = names.filter(f => near.has(f.slice(0, 8))).sort().reverse().map(f => [f, readJson(path.join(ud, f)).v]).find(([, v]) => gotFresh(v) && v.at === made);
    if (hit) { r.fetchedMs = Date.parse(hit[1].at); r.fetchedFile = UPDATES_DIR + '/' + hit[0]; r.src.fetched = r.fetchedFile; }
    else r.notes.push(`home.json made ${made} 와 같은 받은 기록이 없음 — 받은 때는 「?」여야 함`);
  } else if (H.v) r.notes.push('home.json made 가 없음 — 받은 때는 「?」여야 함');
  return r;
}
/** 첫 화면이 요약 파일을 쓰나(app.js sumOk 와 같은 셈 — 요약 꼴 · src.home = home.json kst) */
export const SUM_SCHEMA = 'godori-home-summary-1';

/* ───────────── 정적 ④ ⑤ ② (소스) ───────────── */
export function checkGdrSource(dir) {
  const c = mk(4, 'static');
  const G = readText(path.join(dir, 'next/p-gdr.js')), W = readText(path.join(dir, 'next/p-why.js'));
  if (G == null) return cant(c, 'next/p-gdr.js 없음');
  if (W == null) return cant(c, 'next/p-why.js 없음');
  const gc = codeOnly(G), wc = codeOnly(W);
  // 질문 열하나
  const qs = /export\s+const\s+QS\s*=\s*\[/.exec(W);
  if (!qs) bad(c, 'p-why.js 에 열한 질문 목록(QS)이 없음');
  else { const b = (() => { let d = 0; for (let k = qs.index + qs[0].length - 1; k < wc.length; k++) { if (wc[k] === '[') d++; else if (wc[k] === ']' && --d === 0) return k; } return -1; })(); const n = (W.slice(qs.index, b).match(/\{\s*q\s*:/g) ?? []).length; c.counts.questions = n; if (n !== 11) bad(c, `질문이 열하나가 아님(p-why.js QS ${n}개)`); }
  const done = fnBody(wc, 'doneOnce');
  if (!done) bad(c, 'p-why.js doneOnce(열한 질문을 끝냈나)가 없음');
  else if (!/fullRec|answers/.test(wc.slice(done.start, done.end))) bad(c, 'p-why.js doneOnce 가 열한 답 기록을 보지 않음');
  const full = /const\s+fullRec\s*=([^\n]+)/.exec(W);
  if (full && !/answers\.length\s*===\s*QS\.length/.test(full[1])) bad(c, 'p-why.js fullRec 이 답 수 = 질문 수(QS.length)를 보지 않음');
  // 칸의 문
  const op = fnBody(gc, 'opened');
  if (!op) bad(c, 'p-gdr.js opened()(열한 질문 문)가 없음');
  else { const ob = G.slice(op.start, op.end); if (!/doneOnce/.test(ob) || !/length\s*===\s*11/.test(ob)) bad(c, 'p-gdr.js opened() 가 doneOnce 와 열한 답 기록을 보지 않음'); }
  const sec = fnBody(gc, 'gdrSection');
  if (!sec) bad(c, 'p-gdr.js gdrSection 이 없음');
  else {
    const body = gc.slice(sec.start, sec.end), gate = /if\s*\(\s*!\s*opened\s*\(\s*\)\s*\)\s*return\s+lockBox\s*\(/.exec(body), pk = body.search(/\bpicks\b/);
    if (!gate) bad(c, 'p-gdr.js gdrSection 에 「열한 질문 전이면 잠금(lockBox)」 문이 없음');
    else if (pk >= 0 && pk < gate.index) bad(c, 'p-gdr.js gdrSection 이 열한 질문 문보다 먼저 고른 곳(picks)을 씀');
  }
  const rd = fnBody(gc, 'render');
  if (rd && /\bfunnel\w*\s*\(/.test(gc.slice(rd.start, rd.end)) && !/opened\s*\(\s*\)/.test(gc.slice(rd.start, rd.end))) bad(c, 'p-gdr.js render 가 열한 질문 문 없이 「어떻게 골랐나」를 그림');
  // 칸 번호 · 고른 곳을 다른 화면이 보이나(칸 n번 · #/gdr/n · GDR.picks) — 그 함수 또는 그 함수를 부르는 줄마다 열한 질문 문이 있어야 함
  //   문 = 부르는 코드(풀이 글 · 따옴표 글 밖) doneOnce( · opened( · gdrOpened( · whyDone( 또는 기록 열쇠 글 'atlas:godori-why' 를 읽음
  const gated = (s, from, to) => { const code = codeOnly(s.slice(from, to)); return /\b(?:doneOnce|opened|gdrOpened|whyDone)\s*\(/.test(code) || jsStrings(s.slice(from, to)).some(x => x.s === 'atlas:godori-why'); };
  let files = []; try { files = fs.readdirSync(path.join(dir, 'next')).filter(f => f.endsWith('.js') && !['p-gdr.js', 'p-why.js', 'words.js'].includes(f)); } catch { /* 위에서 셈 */ }
  let leaks = 0, looked = 0;
  for (const f of files) {
    const src = readText(path.join(dir, 'next', f)) ?? '', code = codeOnly(src);
    const spots = [...code.matchAll(/\bGDR\b\s*\??\.\s*picks|\bgdr\s*\(\s*\)[^;\n]*\.picks/g)].map(m => m.index);
    try { for (const x of jsStrings(src)) if (/#\/gdr\/$/.test(x.s)) spots.push(x.start); } catch { /* 글 뽑기 실패 — 위 코드 자리만 */ }
    const seen = new Set();
    for (const at of spots.sort((a, b) => a - b)) {
      looked++;
      const fn = enclosingTop(code, at); if (!fn || seen.has(fn.name)) continue;
      seen.add(fn.name);
      if (fn.name === 'gdr' || /^(?:GDR|gdrP|gdrFail)$/.test(fn.name)) continue; // 자료 받기(gdr.json 을 받아 둠) — 보이는 곳 아님
      const own = gated(src, fn.start, fn.end);
      const calls = [...code.matchAll(new RegExp('\\b' + fn.name.replace(/\$/g, '\\$') + '\\s*\\(', 'g'))].map(m => m.index).filter(i => i < fn.head || i > fn.end);
      const callerGated = calls.length > 0 && calls.every(i => { const ls = src.lastIndexOf('\n', i) + 1, le = src.indexOf('\n', i); return gated(src, ls, le < 0 ? src.length : le); });
      if (!own && !callerGated) { leaks++; bad(c, `next/${f} ${fn.name}() 가 ${NAME} 칸 번호 · 고른 곳을 열한 질문 문 없이 보임 — ${src.slice(0, at).split('\n').length}번째 줄`); }
    }
  }
  c.counts.picksUsesOutside = looked; c.counts.leaks = leaks;
  return c;
}
export function checkShareSource(dir) {
  const c = mk(5, 'static');
  const S = readText(path.join(dir, 'next/p-share.js'));
  if (S == null) return cant(c, 'next/p-share.js 없음');
  const code = codeOnly(S), rd = fnBody(code, 'render');
  if (!rd) return bad(c, 'p-share.js render(친구가 연 쪽)가 없음');
  const body = code.slice(rd.start, rd.end);
  // 화면 차례: return 의 nodes 속 질문 칸(slot)이 친구 말(after) · 값 칸(valsBox)보다 앞
  const ret = [...body.matchAll(/return\s*\{[^]*?nodes\s*:\s*\[/g)].pop();
  if (!ret) bad(c, 'p-share.js render 의 화면 차례(nodes)를 못 찾음');
  else {
    const from = ret.index + ret[0].length; let d = 1, k = from; for (; k < body.length && d; k++) { if (body[k] === '[') d++; else if (body[k] === ']') d--; }
    const list = body.slice(from, k - 1), at = w => { const m = new RegExp('\\b' + w + '\\b').exec(list); return m ? m.index : -1; };
    const iq = at('slot'), ia = at('after'), iv = at('valsBox');
    c.counts.order = {slot: iq, after: ia, vals: iv};
    if (iq < 0) bad(c, 'p-share.js 친구가 연 쪽 화면에 질문 칸(slot)이 없음');
    else { if (ia >= 0 && ia < iq) bad(c, 'p-share.js 친구 말 칸(after)이 질문보다 위'); if (iv >= 0 && iv < iq) bad(c, 'p-share.js 값 칸(valsBox)이 질문보다 위'); }
  }
  // 친구 말 · 「나도 보내기」는 다 답한 뒤(reveal)에만
  const rv = fnBody(body, 'reveal');
  if (!rv) bad(c, 'p-share.js render 에 「다 답한 뒤 엶(reveal)」이 없음');
  else {
    for (const w of ['msgPart', 'askPart']) for (const m of body.matchAll(new RegExp('\\b' + w + '\\s*\\(', 'g'))) if (m.index < rv.start || m.index > rv.end) bad(c, `p-share.js ${w}(친구 말)를 다 답하기 전에도 부름`);
    // 부르는 자리마다: 질문 끝(onDone · 결과 칸 .wy-res 를 기다리는 줄)이면 지나감 · catch { } 안(질문 모듈을 못 받은 오류 길)이면 적어 둠 · 그 밖이면 막음
    const catches = [...body.matchAll(/\bcatch\s*(?:\([^)]*\))?\s*\{/g)].map(m => bodyAt(body, m.index + m[0].length - 1)).filter(Boolean);
    for (const m of body.matchAll(/\breveal\s*\(/g)) {
      if (m.index >= rv.head && m.index <= rv.start) continue;
      const ls = body.lastIndexOf('\n', m.index) + 1, le = body.indexOf('\n', m.index), line = S.slice(rd.start + ls, rd.start + (le < 0 ? body.length : le));
      if (/onDone|wy-res/.test(line)) continue;
      if (catches.some(b => m.index > b.start && m.index < b.end)) { note(c, `p-share.js 질문 모듈을 못 받으면(오류 길 · catch) 친구 말을 바로 엶 — 「${line.trim().slice(0, 60)}」`); continue; }
      bad(c, `p-share.js reveal 를 질문 끝(onDone · .wy-res) 밖에서 부름 — 「${line.trim().slice(0, 70)}」`);
    }
  }
  const after = /const\s+after\s*=\s*h\(\s*'section'/.test(S) || /\bafter\b/.test(body);
  if (!after) bad(c, 'p-share.js 친구 말 칸(after)을 못 찾음');
  // 「나도 보내기」 단추는 친구 말 칸 안에서만(msgPart · askPart · againBtn)
  for (const w of ['againBtn', 'AGAIN']) for (const m of code.matchAll(new RegExp('\\b' + w + '\\b', 'g'))) {
    const fn = enclosingTop(code, m.index); if (!fn) continue;
    if (!['msgPart', 'askPart', 'againBtn', 'AGAIN'].includes(fn.name) && !(fn.name === 'render' && m.index > rd.start + rv?.start && m.index < rd.start + rv?.end)) bad(c, `p-share.js 「나도 보내기」(${w})를 ${fn.name} 에서 씀 — 다 답한 뒤 칸 밖`);
  }
  return c;
}
export function checkAppSource(dir) {
  const c = mk(2, 'static');
  const A = readText(path.join(dir, 'next/app.js'));
  if (A == null) return cant(c, 'next/app.js 없음');
  const code = codeOnly(A);
  if (!/from\s*['"](?:\/next\/|\.\/)essence\.js['"]/.test(A)) bad(c, 'app.js 가 essence.js(세 줄 셈)를 부르지 않음');
  const box = fnBody(code, 'essenceBox');
  if (!box) bad(c, 'app.js 에 essenceBox() 가 없음');
  else if (!/\bessenceLines\s*\(/.test(code.slice(box.start, box.end))) bad(c, 'app.js essenceBox() 가 essenceLines(자료로 셈한 세 줄)를 쓰지 않음');
  const home = fnBody(code, 'vHomeAll');
  if (!home) bad(c, 'app.js 첫 화면(vHomeAll)이 없음');
  else {
    const b = A.slice(home.start, home.end), cb = code.slice(home.start, home.end), ib = cb.search(/\bessenceBox\s*\(/), it = b.indexOf('tk-entry');
    if (ib < 0) bad(c, 'app.js 첫 화면(vHomeAll)이 essenceBox() 를 그리지 않음');
    else if (it >= 0 && ib > it) bad(c, 'app.js 첫 화면에서 세 줄 칸이 이야기 입구(tk-entry) 아래에 있음([5] 1 「이야기 입구 위」)');
  }
  return c;
}

/* ───────────── 가짜 쪽 시험(②⑥⑦ — 사이트 모듈을 노드에서 진짜로 부름 · 따로 떨어진 작은 일로) ───────────── */
const PROBE_MARK = '\u0001ESSENCE-PROBE ';
function probe(dir, {now = Date.now(), timeoutMs = 45000} = {}) {
  return new Promise(res => {
    const p = spawn(process.execPath, [SELF, '--probe', dir, '--now', String(now)], {stdio: ['ignore', 'pipe', 'pipe']});
    let out = '', err = ''; const t = setTimeout(() => p.kill('SIGKILL'), timeoutMs);
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; });
    p.on('close', code => {
      clearTimeout(t);
      const i = out.lastIndexOf(PROBE_MARK);
      try { if (i < 0) throw Error('표시 없음'); res(JSON.parse(out.slice(i + PROBE_MARK.length))); }
      catch { res({error: `가짜 쪽 시험이 끝나지 못함(끝 코드 ${code}) ${(err || out).trim().split('\n').slice(-4).join(' / ').slice(0, 300)}`}); }
    });
  });
}

/** 가짜 문서 — 브라우저 없는 노드에서 줄의 카톡 단추 · 글상자를 진짜로 돌림(instanceof Node · 고르기 · 누름 · 글 · 숨김) · 자료는 그 사이트 폴더에서 읽음 */
function installFakeDom(dir, captured) {
  class FNode {}
  const flat = ks => ks.flat(Infinity).filter(k => k != null);
  class FText extends FNode {
    constructor(s) { super(); this.nodeType = 3; this.data = String(s); this.parentNode = null; }
    get textContent() { return this.data; }
    set textContent(v) { this.data = String(v ?? ''); }
    remove() { this.parentNode?._drop(this); }
  }
  const matchOne = (el, s) => {
    const m = /^([a-z0-9]*)((?:\.[\w-]+)*)((?:\[[^\]]+\])*)$/i.exec(s); if (!m || !s) return false;
    if (m[1] && m[1].toUpperCase() !== el.tagName) return false;
    const cls = el.className.split(/\s+/);
    if (!(m[2].match(/\.[\w-]+/g) ?? []).every(c => cls.includes(c.slice(1)))) return false;
    for (const a of m[3].match(/\[[^\]]+\]/g) ?? []) {
      const q = /^\[([\w-]+)(?:([$^*]?=)"([^"]*)")?\]$/.exec(a); if (!q) return false;
      const v = el.getAttribute(q[1]); if (v == null) return false;
      if ((q[2] === '=' && v !== q[3]) || (q[2] === '$=' && !v.endsWith(q[3])) || (q[2] === '^=' && !v.startsWith(q[3])) || (q[2] === '*=' && !v.includes(q[3]))) return false;
    }
    return true;
  };
  let doc = null;
  class FEl extends FNode {
    constructor(tag) { super(); Object.assign(this, {nodeType: 1, tagName: String(tag).toUpperCase(), children: [], attrs: {}, listeners: {}, parentNode: null, className: '', value: '', hidden: false, style: {}, dataset: {}, sheet: {}, open: false, readOnly: false, disabled: false}); }
    get classList() {
      const el = this, set = () => new Set(el.className.split(/\s+/).filter(Boolean)), put = s => { el.className = [...s].join(' '); };
      return {add: (...a) => { const s = set(); a.forEach(x => s.add(x)); put(s); }, remove: (...a) => { const s = set(); a.forEach(x => s.delete(x)); put(s); },
        toggle: (x, on) => { const s = set(), w = on ?? !s.has(x); if (w) s.add(x); else s.delete(x); put(s); return w; }, contains: x => set().has(x)};
    }
    setAttribute(k, v) { v = String(v); if (k === 'class') this.className = v; else if (k === 'hidden') this.hidden = true; else this.attrs[k] = v; }
    getAttribute(k) { return k === 'class' ? this.className : k === 'hidden' ? (this.hidden ? '' : null) : this.attrs[k] ?? null; }
    hasAttribute(k) { return k === 'hidden' ? this.hidden : k in this.attrs; }
    removeAttribute(k) { if (k === 'hidden') this.hidden = false; else if (k === 'class') this.className = ''; else delete this.attrs[k]; }
    get id() { return this.attrs.id ?? ''; }
    addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
    removeEventListener(t, f) { this.listeners[t] = (this.listeners[t] ?? []).filter(x => x !== f); }
    dispatchEvent() { return true; }
    _drop(c) { this.children = this.children.filter(x => x !== c); c.parentNode = null; }
    _add(k, front = false) { const c = k instanceof FNode ? k : new FText(k); c.parentNode?._drop(c); c.parentNode = this; if (front) this.children.unshift(c); else this.children.push(c); }
    append(...ks) { for (const k of flat(ks)) this._add(k); }
    prepend(...ks) { for (const k of flat(ks).reverse()) this._add(k, true); }
    replaceChildren(...ks) { for (const c of [...this.children]) this._drop(c); this.append(...ks); }
    after(...ks) { const p = this.parentNode; if (!p) return; const i = p.children.indexOf(this); const add = flat(ks).map(k => (k instanceof FNode ? k : new FText(k))); add.forEach(c => { c.parentNode?._drop(c); c.parentNode = p; }); p.children.splice(i + 1, 0, ...add); }
    before(...ks) { const p = this.parentNode; if (!p) return; const i = p.children.indexOf(this); const add = flat(ks).map(k => (k instanceof FNode ? k : new FText(k))); add.forEach(c => { c.parentNode?._drop(c); c.parentNode = p; }); p.children.splice(i, 0, ...add); }
    remove() { this.parentNode?._drop(this); }
    get firstElementChild() { return this.children.find(c => c instanceof FEl) ?? null; }
    get textContent() { return this.children.map(c => c.textContent ?? '').join(''); }
    set textContent(v) { for (const c of [...this.children]) this._drop(c); if (v != null && v !== '') this._add(String(v)); }
    get innerText() { return this.textContent; }
    get isConnected() { let e = this; while (e.parentNode) e = e.parentNode; return e === doc?.documentElement; }
    _all() { const o = [], w = e => { for (const c of e.children) if (c instanceof FEl) { o.push(c); w(c); } }; w(this); return o; }
    matches(sel) { return String(sel).split(',').some(x => matchOne(this, x.trim())); }
    querySelector(sel) { return this._all().find(e => e.matches(sel)) ?? null; }
    querySelectorAll(sel) { return this._all().filter(e => e.matches(sel)); }
    closest(sel) { let e = this; while (e) { if (e instanceof FEl && e.matches(sel)) return e; e = e.parentNode; } return null; }
    contains(x) { while (x) { if (x === this) return true; x = x.parentNode; } return false; }
    focus() { if (doc) doc.activeElement = this; } blur() {} select() {} setSelectionRange() {}
    showModal() { this.open = true; } show() { this.open = true; } close() { this.open = false; }
    scrollIntoView() {} scrollBy() {} scrollTo() {} getClientRects() { return []; }
    getBoundingClientRect() { return {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0}; }
    click() { const ev = {type: 'click', currentTarget: this, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}}; for (const f of [...(this.listeners.click ?? [])]) f.call(this, ev); }
  }
  const link = new FEl('link'); // 모양 파일은 붙은 것으로(p-share css() 가 기다리지 않게)
  doc = {createElement: t => new FEl(t), createElementNS: (ns, t) => new FEl(t), createTextNode: s => new FText(s), activeElement: null,
    addEventListener() {}, removeEventListener() {}, getElementById: id => doc.documentElement._all().find(e => e.attrs.id === id) ?? null,
    querySelector: sel => (/stylesheet/.test(sel) ? link : doc.documentElement.querySelector(sel)), querySelectorAll: sel => doc.documentElement.querySelectorAll(sel),
    contains: x => doc.documentElement.contains(x)};
  doc.documentElement = new FEl('html'); doc.head = new FEl('head'); doc.body = new FEl('body'); doc.documentElement.append(doc.head, doc.body);
  const G = globalThis;
  Object.assign(G, {document: doc, window: G, Node: FNode, Element: FEl, HTMLElement: FEl, Text: FText, innerWidth: 360, innerHeight: 640,
    requestAnimationFrame: f => setTimeout(f, 0), cancelAnimationFrame: t => clearTimeout(t), matchMedia: () => ({matches: false, addEventListener() {}, removeEventListener() {}}),
    getComputedStyle: () => ({getPropertyValue: () => ''}), addEventListener() {}, removeEventListener() {}, scrollTo() {}});
  const nav = {userAgent: 'essence-check', language: 'ko-KR', share: async d => { captured.push({how: 'share', title: d?.title ?? '', text: d?.text ?? '', url: d?.url ?? ''}); }, clipboard: {writeText: async t => { captured.push({how: 'copy', text: String(t)}); }}};
  const store = () => ({_m: new Map(), getItem(k) { return this._m.has(k) ? this._m.get(k) : null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); }, clear() { this._m.clear(); }});
  for (const [k, v] of [['navigator', nav], ['localStorage', store()], ['sessionStorage', store()]]) { try { Object.defineProperty(G, k, {value: v, configurable: true, writable: true}); } catch { /* 그대로 */ } }
  // 망 = 그 사이트 폴더의 파일(첫 화면과 같은 자료 · 없는 파일은 404)
  G.fetch = async u => {
    const rel = String(u?.url ?? u).replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '');
    const f = path.resolve(dir, '.' + (rel.startsWith('/') ? rel : '/' + rel));
    const buf = f.startsWith(path.resolve(dir) + path.sep) ? (() => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } })() : null;
    return buf == null ? {ok: false, status: 404, json: async () => null, text: async () => ''} : {ok: true, status: 200, json: async () => JSON.parse(buf), text: async () => buf};
  };
  return doc;
}
/** 절대 주소 /next/… 를 그 사이트 폴더로(노드 모듈 고리) */
const HOOK = `export async function resolve(s, c, n) {
  if (s.startsWith('/next/') && c.parentURL && c.parentURL.startsWith('file:')) { const p = new URL(c.parentURL).pathname, i = p.lastIndexOf('/next/'); if (i >= 0) return n(new URL('file://' + p.slice(0, i) + s).href, c); }
  return n(s, c);
}`;
const sleep = ms => new Promise(z => setTimeout(z, ms));
async function until(f, ms = 3000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(15); } return null; }

async function runProbe(dir, {now = Date.now()} = {}) {
  const {register} = await import('node:module');
  register('data:text/javascript,' + encodeURIComponent(HOOK));
  const captured = [], out = {share: {}, essence: {}};
  const doc = installFakeDom(dir, captured);
  const imp = rel => import(pathToFileURL(path.join(dir, rel)).href);
  const dlg = () => doc.body.children.find(e => /\bps-dlg\b/.test(e.className ?? ''));
  // ⑥ 보내는 글 — 오른 종목(자료에서 한 달 오름이 가장 큰 회사 · 회사 파일이 있는 것)
  try {
    const M = readJson(path.join(dir, 'atlas/data/mkt.json')).v ?? {};
    const ups = Object.entries(M.companies ?? {}).filter(([k, o]) => /^[0-9A-Z]{6}$/.test(k) && Number.isFinite(o?.c)).sort((a, b) => b[1].c - a[1].c);
    let UP = null;
    for (const [code, o] of ups.slice(0, 60)) { const co = readJson(path.join(dir, 'atlas/data/co', code + '.json')).v; if (co?.c?.price > 0 && /^\d{4}-\d{2}-\d{2}$/.test(co.c.priceDate ?? '')) { UP = {code, name: String(o.n ?? co.c.name ?? code), c: o.c, price: Math.round(co.c.price), day: co.c.priceDate}; break; } }
    if (!UP) throw Error('오른 회사(회사 파일 있음)를 자료에서 못 찾음');
    out.share.up = UP;
    const gainTitle = `${UP.name} · 5일 +31.2% · 한 달 +${UP.c}%`;
    const B = await imp('next/share-btn.js'), S = await imp('next/p-share.js');
    const runCase = async (id, start, {typed = null, nx = null} = {}) => {
      captured.length = 0;
      const r = {id, sent: [], err: null};
      try {
        dlg()?.querySelector('.ps-x')?.click();
        if (nx) globalThis.NX = nx; else delete globalThis.NX;
        await start();
        const D = await until(dlg, 4000); if (!D) throw Error('글상자가 안 열림');
        if (typed != null) {
          const ta = D.querySelector('textarea.ps-t'); if (!ta) throw Error('글칸 없음');
          ta.value = typed; for (const f of ta.listeners.input ?? []) f({type: 'input', target: ta, currentTarget: ta});
          D.querySelector('.ps-go')?.click(); await sleep(80);
          r.typed = typed; r.blocked = captured.length === 0; r.say = D.querySelector('.ps-m')?.textContent ?? '';
          D.querySelector('.ps-x')?.click();
        } else {
          const b = D.querySelector('.ps-qb') ?? D.querySelector('.ps-go'); if (!b) throw Error('보내기 단추 없음');
          b.click(); await until(() => captured.length > 0, 3000);
        }
        r.sent = captured.map(x => JSON.parse(JSON.stringify(x)));
        for (const x of r.sent) { const m = /#\/s\/[^/]+\/[^/]+\/[^/]+\/[sa]\/([A-Za-z0-9_-]+)\s*$/.exec(x.url || x.card?.url || x.text || ''); if (m && typeof S.decMsg === 'function') x.msg = S.decMsg(m[1]); }
      } catch (e) { r.err = String(e?.message ?? e).slice(0, 200); }
      delete globalThis.NX;
      return r;
    };
    const clickBtn = b => { const x = Array.isArray(b) ? b : [b]; if (!x[0]) throw Error('단추가 안 만들어짐'); x[0].click(); };
    const fakeK = {on: false, share: true, canSend: () => true, sendCard: card => { captured.push({how: 'kakao', card}); return true; }, sdkReady: async () => false, startUrl: () => '', ref: () => null};
    out.share.cases = [
      // 줄의 카톡 단추(KB2 줄이 부르는 꼴) — 쓰는 곳이 실수로 오른 폭 · 수익률을 넘겨도
      await runCase('row', () => clickBtn(B.shareButtons({code: UP.code, name: UP.name, price: UP.price, day: UP.day, kind: 'share', title: gainTitle, chg: 31.2, rate: '+31.2%', text: '5일 +31.2% 올랐어요'}, {kakao: true}))),
      // 급등 줄 — 값 · 날 없이(글상자가 회사 파일에서 채움) · 반값 한 줄은 자료(half36.json)
      await runCase('surge', () => clickBtn(B.shareButtons({code: UP.code, name: UP.name, kind: 'surge', title: gainTitle}, {kakao: true}))),
      // 카톡 그림 카드 길(공유 스위치가 켜졌을 때 — 받는 카드에 담기는 글)
      await runCase('kakao', () => clickBtn(B.shareButtons({code: UP.code, name: UP.name, price: UP.price, day: UP.day, kind: 'surge', title: gainTitle}, {kakao: true})), {nx: {kakao: fakeK}}),
      // 옛 단추 둘의 「같이 따져 줘」
      await runCase('ask', () => clickBtn(B.shareButtons({code: UP.code, name: UP.name, price: UP.price, day: UP.day, title: gainTitle})?.[1])),
      // 회사가 아닌 쪽(시황 · 소개) — 제목 · 같이 가는 글에 지수 오름
      await runCase('page', () => { S.open({kind: 'share', title: `시황 · 코스피 +3.2% · ${NAME}`, text: '오늘 코스피 +3.2% 올랐어요', url: 'https://aaa7377.com/#/shorts/0'}); }),
      // 사람이 친 말 — 수익 숫자는 보내지 않음(막혀야 함)
      await runCase('typed', () => { S.open({kind: 'share', code: UP.code, name: UP.name, price: UP.price, day: UP.day}); }, {typed: '이거 한 달에 30% 먹었어'}),
    ];
    try { const W = await imp('next/words.js'); out.share.filter = ['수익률 30% 났어', '+30% 올랐다', '두 배 먹었어'].map(t => [t, W.sendHits(t).length]); } catch (e) { out.share.filterErr = String(e.message).slice(0, 160); }
  } catch (e) { out.share.error = String(e?.message ?? e).slice(0, 240); }
  // ②⑦ 세 줄 — 첫 화면과 같은 부름(essenceData({summary, now}) → essenceLines)
  try {
    const E = await imp('next/essence.js');
    const sum = readJson(path.join(dir, 'next/data/home-summary.json')).v ?? null;
    const L = s => { const d = E.essenceData({summary: s, now}); return {d: JSON.parse(JSON.stringify(d ?? null)), lines: E.essenceLines(d)}; };
    const base = sum ?? {coN: 1};
    const at = ms => ({...base, fetchedAt: new Date(ms).toISOString()});
    const H = Number.isFinite(E.OLD_HOURS) ? E.OLD_HOURS : null;
    out.essence = {exports: Object.keys(E), oldHours: H, withSum: L(sum), noSum: L(null),
      old: L(at(now - 30 * 864e5)).lines, fresh: L(at(now - 10 * 6e4)).lines, unknown: L({...base, fetchedAt: null}).lines,
      edgeOld: H ? L(at(now - (H + 1) * 36e5)).lines : null, edgeNew: H ? L(at(now - Math.max(0, H - 1) * 36e5)).lines : null};
  } catch (e) { out.essence = {error: 'essence.js 를 부르지 못함 — ' + String(e?.message ?? e).slice(0, 200)}; }
  return out;
}

/* ───────────── ⑥ 판정 · ②⑦ 판정 ───────────── */
const GAIN_WORD = /수익률|수익금|수익\s*인증/;
const decUrl = s => { try { return decodeURIComponent(String(s ?? '')); } catch { return String(s ?? ''); } };
/** 보낸 글 하나의 수익 말 · 숫자(이름 글자는 빼고 봄 — 회사 이름의 「…프로」 같은 글자가 수익 숫자로 읽히지 않게) */
function sentProblems(label, s, names = []) {
  const out = []; let t = String(s ?? '');
  for (const n of names) if (n) t = t.split(n).join(' ○ ');
  if (!t.trim()) return out;
  if (GAIN_WORD.test(t)) out.push(`${label}에 「${GAIN_WORD.exec(t)[0]}」`);
  for (const g of gainHits(t)) if (!out.some(x => x.includes(g.word))) out.push(`${label}에 수익 숫자 「${g.word}」`);
  return out;
}
export function judgeShare(P) {
  const c = mk(6, 'static');
  if (!P || P.error) return cant(c, P?.error ?? '가짜 쪽 시험 결과 없음');
  const S = P.share ?? {};
  if (S.error) return cant(c, '보내기를 돌리지 못함 — ' + S.error);
  const names = [S.up?.name].filter(Boolean);
  let sent = 0, kakao = 0;
  for (const r of S.cases ?? []) {
    if (r.err) { cant(c, `보내기 시험 「${r.id}」 — ${r.err}`); continue; }
    if (r.id === 'typed') { if (!r.blocked) bad(c, `손으로 친 수익 말 「${r.typed}」이 막히지 않고 보내짐`); continue; }
    if (!r.sent.length) { cant(c, `보내기 시험 「${r.id}」 — 보낸 것이 없음`); continue; }
    for (const x of r.sent) {
      sent++;
      const parts = x.how === 'kakao' ? deepStrings(x.card ?? {}).map((s, i) => [`카톡 카드 ${i + 1}`, decUrl(s)]) : [['보낸 제목', x.title], ['보낸 글', decUrl(x.text)], ['보낸 주소', decUrl(x.url)], ['주소 속 말', x.msg]];
      if (x.how === 'kakao') kakao++;
      for (const [label, s] of parts) for (const p of sentProblems(label, s, names)) bad(c, `「${r.id}」 ${p}`);
    }
    if (r.id === 'kakao' && !r.sent.some(x => x.how === 'kakao')) note(c, '카톡 카드 길이 안 탐(카드 대신 공유 창 글만 봄) — p-share 카드 길이 바뀌었을 수 있음');
    if (r.id === 'surge' && !r.sent.some(x => /반값/.test(x.text ?? '') || /반값/.test(JSON.stringify(x.card ?? '')))) note(c, '급등 보내기 글에 반값 한 줄이 없음(half36.json 이 없거나 깨졌을 수 있음)');
  }
  for (const [t, n] of S.filter ?? []) if (!n) bad(c, `거르는 말이 수익 숫자를 못 막음(words.js sendHits 「${t}」 = 0)`);
  if (S.filterErr) cant(c, 'words.js sendHits 를 부르지 못함 — ' + S.filterErr);
  c.counts = {cases: (S.cases ?? []).length, sent, kakao, up: S.up ? `${S.up.name} 한 달 ${S.up.c > 0 ? '+' : ''}${S.up.c}%` : null};
  return c;
}
/** 첫 화면이 쓰는 요약 꼴 — 그 사이트의 app.js 에서 읽음(SUM_SCHEMA) · 못 읽으면 이 문의 값 */
export function appSumSchema(dir) { return /\bconst\s+SUM_SCHEMA\s*=\s*'([^']+)'/.exec(readText(path.join(dir, 'next/app.js')) ?? '')?.[1] ?? SUM_SCHEMA; }
/** 셋째 줄의 받은 때 자리 — 틀 앞뒤를 떼고 남은 것 · 틀과 안 맞으면 null */
const atPart = (line, tpl3) => { const [pre, post] = tpl3.split('○월 ○일 ○시'); return post != null && line.startsWith(pre) && line.endsWith(post) ? line.slice(pre.length, line.length - post.length).trim() : null; };
export function judgeEssence(P, R, {root = ROOT, now = Date.now(), schema = SUM_SCHEMA} = {}) {
  const c2 = mk(2, 'static'), c7 = mk(7, 'static');
  if (!P || P.error) { cant(c2, P?.error ?? '가짜 쪽 시험 결과 없음'); cant(c7, P?.error ?? '가짜 쪽 시험 결과 없음'); return [c2, c7]; }
  const E = P.essence ?? {};
  if (E.error) { bad(c2, E.error); bad(c7, E.error); return [c2, c7]; }
  for (const p of R.problems) bad(c2, '자료 — ' + p);
  for (const n of R.notes) note(c2, n);
  const T = orderLines(root);
  if (!T) { bad(c2, `명령문 파일(${ORDER_FILE})에서 [5] 2 세 줄을 못 읽음`); return [c2, c7]; }
  // 첫 화면이 요약 파일을 쓰나(아니면 숫자 둘이 「?」로 나옴 — 자료와 다름)
  const usable = !!(R.sum && R.sum.schema === schema && R.home && R.sum.src?.home === R.home.kst);
  if (!usable) bad(c2, `첫 화면이 요약 파일을 안 씀(${!R.sum ? '요약 파일 없음' : R.sum.schema !== schema ? '꼴 ' + R.sum.schema + ' ≠ ' + schema : 'src.home ' + R.sum.src?.home + ' ≠ home.json kst ' + R.home?.kst}) — 세 줄 숫자가 「?」로 나옴`);
  const L = (usable ? E.withSum : E.noSum)?.lines;
  if (!Array.isArray(L) || L.length !== 3 || !L.every(s => typeof s === 'string')) { bad(c2, `essenceLines 가 세 줄 글이 아님(${JSON.stringify(L)?.slice(0, 80)})`); return [c2, c7]; }
  if (L[0] !== T[0]) bad(c2, `첫째 줄이 명령문 [5] 2 ① 과 다름 「${L[0]}」`);
  const [p2, s2] = T[1].split(' n곳');
  if (s2 == null) bad(c2, '명령문 [5] 2 ② 에서 「n곳」 자리를 못 찾음');
  else if (R.n == null) cant(c2, '회사 수를 자료로 셀 수 없음');
  else if (L[1] !== `${p2} ${comma(R.n)}곳${s2}`) bad(c2, `둘째 줄 「${L[1]}」 ≠ 자료로 센 「${p2} ${comma(R.n)}곳${s2}」(${R.src.n})`);
  const ap = atPart(L[2], T[2]), H = E.oldHours;
  if (ap == null) bad(c2, `셋째 줄이 명령문 [5] 2 ③ 틀과 다름 「${L[2]}」`);
  else {
    const m = /^(\?)?\s*(\d{1,2})월 (\d{1,2})일 (\d{1,2})시$/.exec(ap), q = ap === '?' || !!m?.[1];
    if (Number.isFinite(R.fetchedMs)) {
      const ex = whenWords(R.fetchedMs), shown = m ? `${+m[2]}월 ${+m[3]}일 ${+m[4]}시` : null, age = (now - R.fetchedMs) / 36e5;
      if (shown !== ex) bad(c2, `받은 때 「${ap}」 ≠ 자료로 찾은 ${ex}(${R.fetchedFile})`);
      if (H != null) { if (age > H && !q) bad(c7, `받은 때가 ${Math.round(age)}시간 전(잣대 ${H}시간)인데 「?」가 없음 「${L[2]}」`); if (age <= H && q) bad(c7, `받은 때가 ${Math.round(age)}시간 전(잣대 ${H}시간 안)인데 「?」가 붙음`); }
      c7.counts.ageH = Math.round(age);
    } else if (ap !== '?') bad(c2, `받은 기록이 없는데(${R.notes.join(' · ') || '받은 때 모름'}) 받은 때 「${ap}」를 보임 — 「?」여야 함`);
    c2.counts.fetched = Number.isFinite(R.fetchedMs) ? whenWords(R.fetchedMs) : '?';
  }
  c2.counts.n = R.n; c2.counts.lines = L;
  // ⑦ 잣대 · 넣어 본 받은 때
  if (H == null) bad(c7, 'essence.js 에 OLD_HOURS(오래됨 잣대)가 없음');
  else if (H < STALE_H_RANGE[0] || H > STALE_H_RANGE[1]) bad(c7, `오래됨 잣대 ${H}시간이 ${STALE_H_RANGE[0]} ~ ${STALE_H_RANGE[1]}시간 밖`);
  const at3 = x => (Array.isArray(x) && typeof x[2] === 'string' ? atPart(x[2], T[2]) : null);
  const qOf = s => s === '?' || /^\?\s*\d{1,2}월/.test(s ?? '');
  const o = at3(E.old), f = at3(E.fresh), u = at3(E.unknown), eo = at3(E.edgeOld), en = at3(E.edgeNew);
  if (o == null || f == null || u == null) cant(c7, '받은 때를 바꿔 넣어 세 줄을 다시 만들지 못함');
  else {
    if (!qOf(o)) bad(c7, `30일 전에 받은 자료로 만든 셋째 줄에 「?」가 없음 「${o}」`);
    if (qOf(f)) bad(c7, `10분 전에 받은 자료로 만든 셋째 줄에 「?」가 붙음(늘 「?」면 뜻이 없음) 「${f}」`);
    if (u !== '?') bad(c7, `받은 때를 모르는데 「?」가 아님 「${u}」`);
    if (eo != null && !qOf(eo)) bad(c7, `잣대보다 한 시간 더 지난 받은 때에 「?」가 없음 「${eo}」`);
    if (en != null && qOf(en)) bad(c7, `잣대보다 한 시간 덜 지난 받은 때에 「?」가 붙음 「${en}」`);
  }
  c7.counts.staleH = H;
  return [c2, c7];
}
/** 소개 쪽 · 창 설명 글의 회사 수가 자료와 같은가(손으로 박은 수가 틀어졌으면 막음) */
export function checkPagesNumbers(dir, R) {
  const c = mk(2, 'static');
  if (R.n == null) return c;
  for (const rel of ['hello.html', 'next/index.html']) {
    const t = readText(path.join(dir, rel)); if (t == null) continue;
    for (const m of t.matchAll(/회사\s*([\d,]{3,})\s*곳/g)) if (m[1] !== num(R.n)) bad(c, `${rel} 회사 ${m[1]}곳 ≠ 자료 ${num(R.n)}곳(손으로 박은 수 — 바뀌면 거짓)`);
  }
  return c;
}

/* ───────────── 정적 모두(--dist) ───────────── */
export async function checkStatic(dir, {root = ROOT, now = Date.now()} = {}) {
  const list = [];
  list.push(await checkEssenceFile({root}));
  if (!exists(path.join(dir, 'next'))) { for (const no of [2, 3, 4, 5, 6, 7]) list.push(cant(mk(no, 'static'), `사이트 폴더에 next/ 가 없음(${dir})`)); return list; }
  const R = recount(dir, {root});
  const P = await probe(dir, {now});
  list.push(checkAppSource(dir), checkPagesNumbers(dir, R), ...judgeEssence(P, R, {root, now, schema: appSumSchema(dir)}));
  list.push(checkWords(dir, {root}), checkGdrSource(dir), checkShareSource(dir), judgeShare(P));
  return list;
}

/* ───────────── 브라우저 층(②④⑤⑥⑦ 실제 화면 · check_essence.mjs 와 함께 씀) ───────────── */
export function loadPlaywright(pwDir = process.env.PW_DIR || '/opt/node-tools/') {
  try { return createRequire(String(pwDir).replace(/\/?$/, '/'))('playwright'); } catch { return null; }
}
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8'};
/** 사이트 폴더를 잠깐 띄움(127.0.0.1 · 빈 자리) — / 와 /next/ 는 /next/index.html */
export function serveDir(dir) {
  const rootAbs = path.resolve(dir);
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/' || p === '/index.html') p = '/next/index.html';
    if (p.endsWith('/')) p += 'index.html';
    const f = path.resolve(rootAbs, '.' + p);
    if (!f.startsWith(rootAbs + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(f, (e, buf) => { if (e) { res.writeHead(404, {'content-type': 'text/plain'}); res.end('not found'); return; } res.writeHead(200, {'content-type': TYPES[path.extname(f).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store'}); res.end(buf); });
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok({base: `http://127.0.0.1:${srv.address().port}`, close: () => new Promise(z => srv.close(() => z()))})));
}
const isLocal = base => /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?/i.test(base);
/** 일감 목록(몫으로 가를 수 있게 이름만) */
export const RENDER_UNITS = Object.freeze(['r2-home', 'r4-gdr', 'r4-home', 'r4-company', 'r4-open', 'r5-friend', 'r7-old']);
/** 더 돌 수 있는 일감(기본 밖) — r6-share = 오른 회사 화면의 실제 단추 → 빠른 말 → 공유 창(카톡 카드가 켜지면 가로챌 수 없어 「보지 못함」) */
export const RENDER_EXTRA = Object.freeze(['r6-share']);

/**
 * 실제 화면 검사 — base = 사이트 주소 · units = 돌 일감(기본 모두) · 돌려줌 {checks: [mk …], ran: [일감], seconds}
 * 자료(회사 수 · 받은 때 · 고른 곳 · 회사 값)는 그 주소에서 받아 따로 셈
 */
export async function renderChecks({base, pw = null, units = RENDER_UNITS, log = () => {}, now = Date.now(), timeout = 30000} = {}) {
  const t0 = Date.now(), PWm = loadPlaywright(pw ?? undefined), checks = {2: mk(2, 'rendered'), 4: mk(4, 'rendered'), 5: mk(5, 'rendered'), 6: mk(6, 'rendered'), 7: mk(7, 'rendered')};
  const ran = [], allCant = why => { for (const c of Object.values(checks)) cant(c, why); return {checks: Object.values(checks), ran, seconds: 0}; };
  if (!PWm) return allCant('playwright 를 못 찾음(--pw · PW_DIR)');
  base = String(base).replace(/\/$/, '');
  const PATH = isLocal(base) ? '/next/?dev=1' : '/next/';
  const get = async rel => { try { const r = await fetch(base + rel, {cache: 'no-store', signal: AbortSignal.timeout(20000)}); return r.ok ? await r.json() : null; } catch { return null; } };
  const [mkt, home, sum, G, days] = await Promise.all([get('/atlas/data/mkt.json'), get('/atlas/data/home.json'), get('/next/data/home-summary.json'), get('/next/data/gdr.json'), get('/atlas/data/days.json')]);
  const n = mkt?.companies ? Object.keys(mkt.companies).filter(k => /^[0-9A-Z]{6}$/.test(k)).length : null;
  // 화면 층은 「올린 자료와 화면이 같은가」 — 받은 때 = 요약 fetchedAt(요약을 첫 화면이 쓸 때 · 자료가 기록과 같은지는 정적 층 ②)
  const sumOn = !!(sum && home && sum.src?.home === home.kst), fetchedMs = sumOn && typeof sum.fetchedAt === 'string' ? Date.parse(sum.fetchedAt) : NaN;
  // 고른 곳이 0 인 날(오늘처럼)은 ④ 를 볼 수 없어 — 그날 gdr.json 꼴 그대로 고른 곳 셋을 채운 판을 이 검사 브라우저 안에서만 줌(사이트 · 파일은 그대로)
  let picks = Array.isArray(G?.picks) ? G.picks : [], gdrStub = null;
  if (!picks.length && G && mkt?.companies) {
    const st = [];
    for (const [code, o] of Object.entries(mkt.companies).filter(([k]) => /^[0-9A-Z]{6}$/.test(k)).slice(0, 40)) {
      const co = await get('/atlas/data/co/' + code + '.json'); const pr = Math.round(Number(co?.c?.price));
      if (pr > 0) st.push({no: st.length + 1, code, name: String(o.n ?? code), ind: String(o.i ?? '?'), w: 3, price: pr, sell: Math.round(pr * 0.9), half: Math.round(pr * 1.2), reason: '본질 문 시험', saying: 0, wrong: '본질 문 시험', g: {}});
      if (st.length === 3) break;
    }
    if (st.length) { gdrStub = JSON.stringify({...G, picks: st, counts: {...(G.counts ?? {}), picked: st.length, cash: 91}}); picks = st; }
  }
  let browser;
  const exe = '/opt/pw-browsers/chromium';
  try { browser = await PWm.chromium.launch(exists(exe) ? {executablePath: exe} : {}); } catch (e) { return allCant('브라우저를 못 띄움 — ' + String(e.message).slice(0, 120)); }
  const page = async ({seed = null, routes = null, init = null} = {}) => {
    const ctx = await browser.newContext({viewport: {width: 360, height: 640}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (seed) await ctx.addInitScript(s => { try { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } catch { /* 기억 못 함 */ } }, seed);
    if (init) await ctx.addInitScript(init);
    if (routes) for (const [pat, fn] of routes) await ctx.route(pat, fn);
    const p = await ctx.newPage(); p.setDefaultTimeout(timeout);
    const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    return {p, ctx, errs};
  };
  const settle = async p => { await p.waitForFunction(() => !document.querySelector('#view .boot') && !document.querySelector('[aria-busy="true"]'), null, {timeout}).catch(() => {}); await p.waitForTimeout(300); };
  const go = async (p, hash) => { await p.goto(base + PATH + hash, {waitUntil: 'domcontentloaded'}); await settle(p); };
  const WHY_SEED = {'atlas:godori-why': JSON.stringify([{at: '2026-01-05T01:00:00.000Z', code: picks[0]?.code ?? '005930', name: picks[0]?.name ?? '?', answers: new Array(11).fill(0), score: 0, verdict: '좋아, 정해 둔 대로만'}])};
  const pickNames = picks.map(x => String(x.name ?? '')).filter(s => s.length >= 2);
  const gdrRoute = () => (gdrStub ? [['**/next/data/gdr.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: gdrStub})]] : null);
  const essenceText = p => p.evaluate(() => { // 세 줄 칸 = #view section.ess(줄마다 [data-ess="1|2|3"] · KC) — 없으면 세 줄 글이 다 든 가장 작은 칸
    const box = document.querySelector('#view section.ess') ?? [...document.querySelectorAll('#view section, #view details, #view div')].filter(e => /열한 질문으로 내 이유부터/.test(e.textContent || '') && /마지막으로 받은 때/.test(e.textContent || '')).sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0];
    if (!box) return null;
    const tk = document.querySelector('#view .tk-entry'), d = box.querySelector('details');
    const seen = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    return {text: box.textContent || '', lines: [1, 2, 3].map(k => box.querySelector(`[data-ess="${k}"]`)?.textContent ?? null), open: d ? d.open : null,
      shown: [1, 2, 3].map(k => seen(box.querySelector(`[data-ess="${k}"]`))), above: !tk || !!(box.compareDocumentPosition(tk) & Node.DOCUMENT_POSITION_FOLLOWING)};
  });
  try {
    for (const u of units) {
      ran.push(u); log('· ' + u);
      if (u === 'r2-home') { // ② 첫 화면 세 줄 — 처음 온 기기(세 줄이 펼쳐 보임) · 다시 온 기기(접혀도 숫자 같음) · 숫자 = 올린 자료
        const c = checks[2], {p, ctx, errs} = await page();
        const at3 = Number.isFinite(fetchedMs) ? whenWords(fetchedMs) : null;
        const look = (E, label) => {
          const m = /회사 ([\d,?]+)곳/.exec(E.text);
          if (n != null) { if (!m) bad(c, `${label} 세 줄에 회사 수가 없음`); else if (m[1] !== num(n)) bad(c, `${label} 화면 회사 ${m[1]}곳 ≠ 자료 ${num(n)}곳${sumOn ? '' : '(요약 파일이 옛것 — src.home ≠ home.json kst)'}`); }
          const w = /마지막으로 받은 때:\s*(\?)?\s*(?:(\d{1,2})월 (\d{1,2})일 (\d{1,2})시)?/.exec(E.text);
          if (!w) bad(c, `${label} 세 줄에 「마지막으로 받은 때:」가 없음`);
          else if (at3 && (w[2] == null || `${+w[2]}월 ${+w[3]}일 ${+w[4]}시` !== at3)) bad(c, `${label} 화면 받은 때 「${w[0].replace(/^.*:\s*/, '')}」 ≠ 자료 ${at3}`);
          else if (!at3 && w[2] != null) bad(c, `${label} 자료에 받은 때가 없는데 화면이 ${+w[2]}월 ${+w[3]}일 ${+w[4]}시를 보임`);
        };
        try {
          await go(p, '#/'); const E = await essenceText(p);
          if (!E) bad(c, '첫 화면에 본질 세 줄 칸이 없음');
          else {
            if (!E.above) bad(c, '세 줄 칸이 이야기 입구(tk-entry) 아래에 있음');
            if (!/주식을 사기 전에/.test(E.text) || !/앞날을 맞히지 않아요/.test(E.text) || !/사고팔기를 권하지 않아요/.test(E.text)) bad(c, '세 줄 글이 명령문 [5] 2 와 다름');
            if (E.shown.some(x => !x)) bad(c, `처음 온 기기인데 세 줄이 다 보이지 않음(보이는 줄 ${E.shown.filter(Boolean).length}/3) — [5] 1 「처음 온 사람에게는 펼치고」`);
            look(E, '처음 연');
            c.counts.first = E.text.replace(/\s+/g, ' ').trim().slice(0, 200);
            await go(p, '#/'); const E2 = await essenceText(p);
            if (!E2) bad(c, '다시 연 첫 화면에 세 줄 칸(접힌 한 줄)이 없음');
            else { look(E2, '다시 연'); c.counts.againOpen = E2.open; }
          }
          if (errs.length) note(c, '화면 오류 ' + errs.slice(0, 2).join(' · '));
        } finally { await ctx.close(); }
      }
      if (u === 'r4-gdr' || u === 'r4-home' || u === 'r4-company') { // ④ 열한 질문 전 — 칸 · 첫 화면 · 고른 회사 화면에 고른 곳이 안 보임
        const c = checks[4], {p, ctx} = await page({routes: gdrRoute()});
        try {
          const hash = u === 'r4-gdr' ? '#/gdr' : u === 'r4-home' ? '#/' : picks[0] ? '#/w/' + picks[0].code : null;
          if (gdrStub) c.counts.stub = picks.length;
          if (!hash) { note(c, '고른 곳이 0 이라 회사 화면은 안 봄'); continue; }
          await go(p, hash);
          const s = await p.evaluate(names => {
            const v = document.querySelector('#view'), g = v?.querySelector('.gdr'), text = (u => u)(g ? g.textContent || '' : '');
            const tags = [...(v?.querySelectorAll('a[href^="#/gdr/"]') ?? [])].map(a => a.textContent.trim());
            const cells = v?.querySelectorAll('.gdr-cell:not(.cash)').length ?? 0;
            const shown = names.filter(nm => (g?.textContent || '').includes(nm));
            return {lock: !!v?.querySelector('.gdr.lock1, a[href="#/why"]'), cells, tags, shown, kan: /칸\s*\d+번/.test(v?.textContent || ''), gtext: text.slice(0, 80)};
          }, pickNames);
          if (s.cells) bad(c, `${hash} — 열한 질문 전인데 꼴똘이 칸 ${s.cells}칸이 보임`);
          if (s.shown.length) bad(c, `${hash} — 열한 질문 전인데 칸에 고른 곳 이름이 보임(${s.shown.slice(0, 3).join(' · ')})`);
          if (s.tags.length || s.kan) bad(c, `${hash} — 열한 질문 전인데 칸 번호 고리가 보임(${s.tags.slice(0, 3).join(' · ') || '꼴똘이 칸 n번'})`);
          if ((u === 'r4-gdr' || u === 'r4-home') && !s.lock) bad(c, `${hash} — 잠금 한 줄(→ #/why)이 없음`);
        } finally { await ctx.close(); }
      }
      if (u === 'r4-open') { // ④ 열한 답 기록을 넣으면 칸이 열림(문이 늘 닫혀 있는 것도 아님)
        const c = checks[4];
        if (!picks.length) { note(c, '고른 곳이 0 이라 열린 칸은 안 봄'); continue; }
        const {p, ctx} = await page({seed: WHY_SEED, routes: gdrRoute()});
        try { await go(p, '#/gdr'); const k = await p.evaluate(() => document.querySelectorAll('#view .gdr-cell:not(.cash)').length); c.counts.openCells = k; if (k !== picks.length) bad(c, `열한 답 기록이 있는데 칸이 ${k}칸(고른 곳 ${picks.length}곳) — 문이 안 열림`); }
        finally { await ctx.close(); }
      }
      if (u === 'r5-friend') { // ⑤ 친구가 연 쪽 — 질문 먼저 · 친구 말 · 「나도 보내기」는 다 답한 뒤
        const c = checks[5], code = picks[0]?.code ?? Object.keys(mkt?.companies ?? {})[0], co = code ? await get('/atlas/data/co/' + code + '.json') : null;
        const price = Math.round(Number(co?.c?.price)), day = /^\d{4}-\d{2}-\d{2}$/.test(co?.c?.priceDate ?? '') ? co.c.priceDate : days?.dates?.at?.(-1);
        if (!code || !(price > 0) || !day) { cant(c, '친구 주소를 만들 회사 값(co 파일)을 못 받음'); continue; }
        const MSG = '본질문 시험 한줄', b64 = Buffer.from(MSG, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const {p, ctx} = await page();
        try {
          await go(p, `#/s/${code}/${day}/${price}/s/${b64}`);
          await p.waitForFunction(() => document.querySelectorAll('#view .wy-opt').length >= 2, null, {timeout}).catch(() => {});
          const s0 = await p.evaluate(m => {
            const v = document.querySelector('#view'), q = v?.querySelector('.wy, .ps-why'), a = v?.querySelector('.ps-after');
            const order = q && a ? !!(q.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) : null;
            const again = [...(v?.querySelectorAll('button') ?? [])].some(b => /나도\s*(친구에게\s*)?보내기/.test(b.textContent || '') || (b.getAttribute('aria-label') || '').includes('나도'));
            return {q: !!q, opts: v?.querySelectorAll('.wy-opt').length ?? 0, order, msg: (document.body.textContent || '').includes(m), again, lock: !!v?.querySelector('.ps-lock')};
          }, MSG);
          if (!s0.q || !s0.opts) bad(c, '친구가 연 쪽에 질문(왜 사?)이 없음');
          if (s0.order === false) bad(c, '친구 말 칸이 질문보다 위');
          if (s0.msg) bad(c, '다 답하기 전에 친구 말이 화면에 있음');
          if (s0.again) bad(c, '다 답하기 전에 「나도 보내기」 단추가 보임');
          for (let k = 0; k < 40; k++) { // 끝까지 답함(check_share finishWhy 와 같은 길)
            const st = await p.evaluate(() => { const w = document.querySelector('#view .ps-why .wy'); if (!w) return 'none'; if (!document.querySelector('#view .ps-lock')) return 'open'; if (w.querySelector('.wy-res')) return 'res'; if (w.querySelector('.wy-why')) return 'lines'; if (w.querySelector('.wy-opt')) return w.querySelector('.wy-opt[aria-pressed="true"]') ? 'next' : 'pick'; return 'wait'; });
            if (st === 'open' || st === 'none' || st === 'res') break;
            if (st === 'wait') { await p.waitForTimeout(150); continue; }
            if (st === 'pick') await p.locator('#view .ps-why .wy-opt').first().click();
            else if (st === 'next') await p.locator('#view .ps-why .wy-next').first().click();
            else { await p.locator('#view .ps-why .wy-why').fill('본질 문 시험'); for (const [s1, v1] of [['.wy-sell', '1000'], ['.wy-half', '2000']]) { const x = p.locator('#view .ps-why ' + s1); if ((await x.count()) && !(await x.inputValue())) await x.fill(v1); } await p.locator('#view .ps-why .wy-next').last().click(); }
            await p.waitForTimeout(60);
          }
          await p.waitForFunction(m => (document.body.textContent || '').includes(m), MSG, {timeout: 6000}).catch(() => {});
          const s1 = await p.evaluate(m => ({msg: (document.body.textContent || '').includes(m), again: [...document.querySelectorAll('#view button')].some(b => /나도\s*(친구에게\s*)?보내기/.test(b.textContent || ''))}), MSG);
          if (!s1.msg) bad(c, '질문에 다 답했는데 친구 말이 안 열림');
          if (!s1.again) note(c, '다 답한 뒤 「나도 보내기」 단추를 못 찾음([6] 9 — KB1 단추 글이 바뀌었을 수 있음)');
          c.counts.code = code;
        } finally { await ctx.close(); }
      }
      if (u === 'r6-share') { // ⑥ 오른 회사 화면에서 실제 단추 → 빠른 말 → 보내기(휴대폰 공유 창을 가로채 봄)
        const c = checks[6];
        const up = Object.entries(mkt?.companies ?? {}).filter(([k, o]) => /^[0-9A-Z]{6}$/.test(k) && Number.isFinite(o?.c) && o.c > 5).sort((a, b) => b[1].c - a[1].c)[0]?.[0] ?? picks[0]?.code;
        if (!up) { cant(c, '오른 회사를 자료에서 못 찾음'); continue; }
        const init = () => { window.__sent = []; Object.defineProperty(navigator, 'share', {configurable: true, value: async d => { window.__sent.push({how: 'share', title: d?.title ?? '', text: d?.text ?? '', url: d?.url ?? ''}); }}); try { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async t => { window.__sent.push({how: 'copy', text: String(t)}); }}}); } catch { /* 그대로 */ } };
        const {p, ctx} = await page({init});
        try {
          await go(p, '#/w/' + up);
          const btn = p.locator('#view button.kk-btn, #view button.act').filter({hasNotText: '같이 따져'}).first();
          if (!(await btn.count())) { cant(c, `#/w/${up} 에서 보내기 단추를 못 찾음`); continue; }
          await btn.click();
          await p.waitForSelector('.ps-dlg .ps-go', {timeout: 8000});
          await p.locator('.ps-dlg .ps-qb').first().click().catch(() => {});
          await p.locator('.ps-dlg .ps-go').click();
          await p.waitForFunction(() => (window.__sent ?? []).length > 0, null, {timeout: 6000}).catch(() => {});
          const sent = await p.evaluate(() => window.__sent ?? []);
          if (!sent.length) cant(c, '보내기를 눌렀는데 보낸 것을 못 잡음(공유 창 · 복사 둘 다 아님 — 카톡 카드면 화면 검사 밖)');
          for (const x of sent) for (const pr of [...sentProblems('보낸 제목', x.title), ...sentProblems('보낸 글', x.text), ...sentProblems('보낸 주소', x.url)]) bad(c, `#/w/${up} ${pr}`);
          c.counts.code = up; c.counts.sent = sent.length;
        } finally { await ctx.close(); }
      }
      if (u === 'r7-old') { // ⑦ 받은 때를 30일 전으로 바꾼 요약(첫 화면이 쓰는 그대로 · src.home 은 home.json kst) — 세 줄에 「?」
        const c = checks[7];
        if (!home || !sum) { cant(c, 'home.json · 요약 파일을 못 받음'); continue; }
        const S2 = {...sum, fetchedAt: new Date(now - 30 * 864e5).toISOString(), src: {...(sum.src ?? {}), home: home.kst}};
        const {p, ctx} = await page({routes: [['**/next/data/home-summary.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(S2)})]]});
        try {
          await go(p, '#/'); const E = await essenceText(p);
          if (!E) bad(c, '첫 화면에 본질 세 줄 칸이 없음');
          else if (!/마지막으로 받은 때:\s*\?/.test(E.text)) bad(c, `30일 전에 받은 자료인데 받은 때에 「?」가 없음 「${E.text.replace(/\s+/g, ' ').slice(-60)}」`);
          else c.counts.old = (E.lines?.[2] ?? '').slice(-24);
        } finally { await ctx.close(); }
      }
    }
  } catch (e) { for (const c of Object.values(checks)) if (c.reasons.length === 0 && c.ok) note(c, '도중에 멈춤'); const c = checks[2]; cant(c, '화면 검사가 멈춤 — ' + String(e.message).slice(0, 160)); }
  finally { await browser.close().catch(() => {}); }
  const done = new Set(ran.map(u => +u[1]));
  return {checks: Object.values(checks).filter(c => done.has(c.no)), ran, seconds: Math.round((Date.now() - t0) / 100) / 10};
}

/* ───────────── 문 하나(--dist) ───────────── */
/** 사이트 폴더 하나를 봄 — render: false(기본 · 정적 · 자료 셈) · true(브라우저 층도 · 그 폴더를 잠깐 띄움) · 'auto'(playwright 가 있으면) · 돌려줌 {ok, code, checks, render, seconds} */
export async function checkDist(dir, {root = ROOT, render = false, pw = null, now = Date.now(), log = () => {}} = {}) {
  const t0 = Date.now();
  dir = path.resolve(dir);
  const list = await checkStatic(dir, {root, now});
  let renderInfo = {ran: [], why: null};
  const want = render === true || (render === 'auto' && !!loadPlaywright(pw ?? undefined));
  if (want) {
    const srv = await serveDir(dir);
    try { const r = await renderChecks({base: srv.base, pw, log, now}); list.push(...r.checks); renderInfo = {ran: r.ran, seconds: r.seconds}; }
    finally { await srv.close(); }
  } else renderInfo.why = render === false ? '--no-render' : 'playwright 없음 — 정적 · 자료 검사만';
  const checks = mergeChecks(list), code = codeOf(checks);
  return {schema: 'kkolttori-essence-check-1', at: new Date().toISOString(), dir, ok: code === 0, code, checks, render: renderInfo, seconds: Math.round((Date.now() - t0) / 100) / 10};
}
/** 사람이 읽는 줄(번호 · 까닭) */
export function report(r) {
  const lines = [];
  for (const c of r.checks) lines.push(`${MARK[c.no]} ${c.name} [${c.mode}] — ${c.status === 'pass' ? '지나감' : c.status === 'cant' ? '보지 못함' : '막음'}`,
    ...c.reasons.slice(0, 12).map(x => `   ${MARK[c.no]} ${x}`), ...(c.reasons.length > 12 ? [`   ${MARK[c.no]} … 그 밖 ${c.reasons.length - 12}가지`] : []),
    ...c.notes.slice(0, 3).map(x => `   ${MARK[c.no]} (적어 둠) ${x}`));
  lines.push(`끝 코드 ${r.code} · ${r.seconds}초 · 화면 층 ${r.render?.ran?.length ? r.render.ran.join(' · ') : '안 돎(' + (r.render?.why ?? '?') + ')'}`);
  return lines;
}
/** 올리기 문(deploy_netlify.mjs art_gate 바로 뒤 · 정적) — {ok, code, lines, result} · 못 보면 ok false(막음) */
export async function essenceGate({dist, root = ROOT, render = false, pw = null, now = Date.now()} = {}) {
  try { const r = await checkDist(dist, {root, render, pw, now}); return {ok: r.code === 0, code: r.code, lines: report(r), result: r}; }
  catch (e) { return {ok: false, code: 2, lines: ['보지 못함 — ' + String(e?.stack ?? e).slice(0, 400)], result: null}; }
}

/* ───────────── 명령 ───────────── */
if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const argv = process.argv.slice(2), arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
  if (argv[0] === '--probe') { const r = await runProbe(path.resolve(argv[1]), {now: Number(arg('--now')) || Date.now()}).catch(e => ({error: String(e?.stack ?? e).slice(0, 400)})); process.stdout.write('\n' + PROBE_MARK + JSON.stringify(r) + '\n', () => process.exit(0)); await new Promise(() => {}); }
  if (argv.includes('--files') || argv.includes('--diff')) {
    let files;
    try { files = argv.includes('--files') ? String(arg('--files', '')).split(',').map(s => s.trim()).filter(Boolean) : diffFiles(arg('--diff')); }
    catch (e) { console.error('보지 못함 — ' + String(e.message).slice(0, 200)); process.exit(2); }
    const hit = protectedTouched(files);
    if (hit.length) { console.error(`본질 문이 막음 — 지킴 파일 ${hit.length}개를 건드림(진화 가지는 본질 · 잣대 · 문을 못 고침):\n` + hit.map(f => ' · ' + f).join('\n')); process.exit(1); }
    console.log(`지킴 파일 0 · 본 파일 ${files.length}개`); process.exit(0);
  }
  if (argv.includes('--help')) { console.log('쓰는 법: [--dist <폴더>(기본 site)] [--render] [--pw <폴더>] [--now <ISO>] [--json] [--out <파일>] · --files a,b · --diff 기준..끝'); process.exit(0); }
  const dist = arg('--dist') ?? path.join(ROOT, 'site'); // 인자 없음 = 이 저장소의 소스 폴더(진화 회차 gh.mjs essenceFull)
  const nowArg = arg('--now'), now = nowArg ? Date.parse(nowArg) : Date.now();
  if (!Number.isFinite(now)) { console.error('보지 못함 — --now 를 못 읽음 「' + nowArg + '」'); process.exit(2); }
  const r = await essenceGate({dist, render: argv.includes('--render') ? true : false, pw: arg('--pw'), now});
  if (arg('--out') && r.result) { await fsp.mkdir(path.dirname(path.resolve(arg('--out'))), {recursive: true}); await fsp.writeFile(path.resolve(arg('--out')), JSON.stringify(r.result, null, 1) + '\n'); }
  if (argv.includes('--json')) console.log(JSON.stringify(r.result ?? {code: r.code, lines: r.lines}, null, 1)); else console.log(r.lines.join('\n'));
  process.exit(r.code);
}
