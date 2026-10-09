#!/usr/bin/env node
/* ATLAS 11 · 쉬운 말 백만 번 맞대기(규칙 48) — 사장님 2026-10-09 22:40(마카오 시각) 「다 만든후에 제대로 만들었는지 교차 검증을 100만번하라」
   쉬운 말 셈(site/app/easy.js · 사전 easy-ko.js)을 따로 셈한 답과 맞댐 — 씨앗 고정 · 같은 씨앗이면 같은 결과
   ① 무작위 글: 보통 말 · 사전 열쇠(+ 조사 22쌍 · 붙는 말) · 숫자 · 날짜 · 시각 · 회사 · 업종 이름 · 「…」 · 나눔표( · — → :)를 섞어 만든 글
      → 쉬운 말 = 따로 만든 답(열쇠마다 쉬운 말 + 받침에 맞춘 조사)과 글자 하나까지 같음 · 숫자 모음 같음 · 이름 수 같음 · 어려운 말 0 · 금지 말을 새로 넣지 않음 · 두 번 바꿔도 같음
   ② 한 줄 틀(TPL) 모두: 무작위 값으로 채운 글 → 쉬운 말 = 틀의 쉬운 말에 같은 값(차례 그대로) · 틀 열쇠가 실제 글에서 나옴(채워서 다시 틀로 = 같은 열쇠)
   ③ 사전 자체: 쉬운 말 안에 다른 열쇠 없음(다시 바꾸지 않음) · 금지 말 없음 · 「이 화면은?」 줄(화면마다)은 짧고(30자 안) 어려운 말 · 금지 말 없음
   결과: reports/atlas11/verify/easy-million-latest.json · node scripts/atlas11/verify/easy_million.mjs [--target 1000000] [--seed N] [--out 파일] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {ez, hardLeft, addEasyNames, easyTemplateOf, josaFor, JOSA_PAIRS, JOSA_INV} from '../../../site/app/easy.js';
import {WORDS, TPL, WHAT, HARD} from '../../../site/app/easy-ko.js';
import {PREDICTION_WORDS} from '../../../lib/atlas11/board.mjs';
import {BANNED} from '../../../lib/atlas11/changelog.mjs';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(import.meta.dirname, '../../..');
const TARGET = Number(arg('--target', '1000000')), SEED = Number(arg('--seed', '20261010')), OUT = arg('--out', 'reports/atlas11/verify/easy-million-latest.json');
const t0 = Date.now();
let s32 = SEED >>> 0; const rnd = () => { s32 = (s32 + 0x6D2B79F5) >>> 0; let t = s32; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const perKind = {}, fails = []; let checks = 0;
const ok = (kind, cond, info) => { checks++; perKind[kind] = (perKind[kind] ?? 0) + 1; if (!cond) { if (fails.length < 50) fails.push({kind, ...info}); } };

// 이름(바꾸지 않는 자리) — 사이트 묶음이 있으면 두 판의 회사 · 업종 이름 · 없으면 고정 목록
let names = [];
for (const pre of ['', 'us/']) { try { const bd = JSON.parse(await fs.readFile(path.join(ROOT, 'dist', pre, 'data/atlas11/view/board.json'), 'utf8')); names.push(...bd.companies.map(c => c.name), ...(bd.groups ?? []).map(g => g.label)); } catch {} }
const real = names.length > 0;
if (!real) names = ['삼성전자', 'SK하이닉스', 'NHN', '한화생명', '반도체 장비', 'IT서비스', '전선·전기장비', '팔란티어 테크놀로지스', '오일, 가스 정제 및 마케팅'];
names = [...new Set(names.filter(n => n && n.length >= 2))];
addEasyNames(names);
const W = new Map(WORDS.filter(([k, v]) => k && v != null && k !== v));
const keys = [...W.keys()].filter(k => !/^\s/.test(k) && !W.has(' ' + k) && ![' · ', ' — ', ' → ', ': '].some(x => k.includes(x))); // 앞이 빈칸인 열쇠(' 대비')와 그 짝('대비')은 시험(tests/atlas11/easy.test.mjs)에서 따로 · 나눔표가 든 열쇠는 없어야 함(아래)
const NUM = /[+−\-±]?\d[\d,]*(?:\.\d+)?/g;
const nums = s => (String(s).match(NUM) ?? []).sort().join(' ');
const BAN = new RegExp([PREDICTION_WORDS.source, '사라[!.\\s]|팔라[!.\\s]|추천|목표가|확실|보장|무조건', ...BANNED.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))].join('|'), 'g');
const bans = s => String(s).match(BAN) ?? [];
const countOf = (s, n) => { let c = 0, i = s.indexOf(n); while (i >= 0) { c++; i = s.indexOf(n, i + n.length); } return c; };

// ③ 사전 자체
for (const k of W.keys()) ok('사전 · 열쇠에 나눔표( · — → :)가 없음(나눈 뒤 낱말을 찾으므로 그런 열쇠는 쓰이지 않음 — 한 줄 틀로)', ![' · ', ' — ', ' → ', ': '].some(x => k.includes(x)), {k});
const FILL = ['오늘', '그때', '여기', '모두', '아주', '조금', '먼저', '다시', '함께', '천천히', '그래서', '하나씩'];
for (const f of FILL) ok('사전 · 보통 말은 그대로', ez(f) === f, {f});
for (const [k, v] of W) {
  ok('사전 · 쉬운 말 안에 다른 열쇠 없음(다시 바꾸지 않음)', ez(v) === v, {k, v, again: ez(v)});
  ok('사전 · 쉬운 말에 금지 말 없음', !bans(v).length, {k, v});
  ok('사전 · 쉬운 말에 어려운 말 없음', !hardLeft(v).length, {k, v, hard: hardLeft(v)});
}
for (const [k, v] of Object.entries(TPL)) { ok('틀 · 쉬운 말에 금지 말을 새로 넣지 않음', bans(v).every(b => bans(k).includes(b)), {k, v}); }
for (const [view, w] of Object.entries(WHAT)) { ok('이 화면은? · 30자 안', w.length <= 30, {view, w}); ok('이 화면은? · 어려운 말 없음', !hardLeft(w).length, {view, w}); ok('이 화면은? · 금지 말 없음', !bans(w).length, {view, w}); }

// ② 한 줄 틀 모두 — 무작위 값으로 채움
const DATES = ['10월 8일(목)', '9월 7일(월)', '2026년 10월 9일(금)', '7월 10일(금)', '11월 6일(금)'];
const TIMES = ['15:30', '16:00', '19:04', '06:48', '23:52'];
const QS = ['가격', '수급·기사·공시 기록', '판단이 바뀌는 조건', '미국 주식 자료 받기', '종가'];
const rndNum = () => { const r = rnd(); const v = (rnd() * 400 - 200).toFixed(r < 0.3 ? 0 : 1); return r < 0.15 ? (rnd() < 0.5 ? '+' : '−') + Math.abs(v) : r < 0.25 ? String(Math.floor(rnd() * 900 + 100)) + ',' + String(Math.floor(rnd() * 900 + 100)) : String(Math.abs(v)); };
const fillTpl = (tpl, v) => { const at = {d: 0, t: 0, e: 0, n: 0, q: 0}; return tpl.replace(/\{(d|t|e|n|q)\}/g, (m, k) => { const x = v[k][at[k]++]; return k === 'q' ? `「${x}」` : x; }); };
const fillEasy = (tpl, v) => { const at = {d: 0, t: 0, e: 0, n: 0, q: 0}; return tpl.replace(/\{(d|t|e|n|q)\}/g, (m, k) => { const x = v[k][at[k]++]; return k === 'q' ? `「${ez(x)}」` : x; }); };
const tplEntries = Object.entries(TPL);
for (const [k, val] of tplEntries) {
  const cnt = c => (k.match(new RegExp(`\\{${c}\\}`, 'g')) ?? []).length, cntV = c => (val.match(new RegExp(`\\{${c}\\}`, 'g')) ?? []).length;
  ok('틀 · 값 자리 수가 같음({n} {d} {t} {e} {q})', ['n', 'd', 't', 'e', 'q'].every(c => cnt(c) === cntV(c)), {k, val});
  for (let r = 0; r < 120; r++) {
    const v = {n: Array.from({length: cnt('n')}, rndNum), d: Array.from({length: cnt('d')}, () => pick(DATES)), t: Array.from({length: cnt('t')}, () => pick(TIMES)), e: Array.from({length: cnt('e')}, () => pick(names)), q: Array.from({length: cnt('q')}, () => pick(QS))};
    const s = fillTpl(k, v), e = ez(s), want = fillEasy(val, v);
    ok('틀 · 채운 글이 그 틀로 읽힘(열쇠가 실제 글에서 나옴)', easyTemplateOf(s).key === k || easyTemplateOf(s, {noEnt: true}).key === k, {k, s, got: easyTemplateOf(s).key});
    ok('틀 · 쉬운 말 = 틀의 쉬운 말에 같은 값', e === want, {k, s, e, want});
    ok('틀 · 숫자 모음이 같음', nums(e.replace(/「[^」]*」/g, '')) === nums(s.replace(/「[^」]*」/g, '')), {s, e});
    ok('틀 · 두 번 바꿔도 같음', ez(e) === e, {e, again: ez(e)});
  }
}

// ① 무작위 글
const PAIR_FORMS = JOSA_PAIRS.flatMap(([a, b]) => [[a, a, b], [b, a, b]]), PARTS = [...PAIR_FORMS, ...JOSA_INV.map(x => [x, null, null])];
const SEPS = [' · ', ' — ', ' → ', ': '];
let strings = 0;
while (checks < TARGET) {
  strings++;
  const nParts = 1 + Math.floor(rnd() * 3), parts = [], wants = [], srcNames = [];
  for (let p = 0; p < nParts; p++) {
    const toks = [], wtoks = [], n = 3 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      if (i % 2 === 0) { const f = pick(FILL); toks.push(f); wtoks.push(f); continue; } // 열쇠끼리 붙지 않게 보통 말 사이에
      if (r < 0.62) { // 열쇠(+ 조사)
        const k = pick(keys), rep = W.get(k); let j = rnd() < 0.55 ? pick(PARTS) : null;
        if (j && [...W.keys()].some(k2 => k2 !== k && k2.startsWith(k + j[0]))) j = null; // 열쇠 + 조사가 더 긴 열쇠(「추정」+「치」 = 「추정치」)면 조사 없이 — 긴 열쇠가 먼저(easy.js)
        const glue = /^[가-힣]/.test(k) && rnd() < 0.12 ? String(Math.floor(rnd() * 300)) : ''; // 「20거래일」처럼 숫자에 붙은 열쇠
        const q = rnd() < 0.08; // 「…」 안
        if (q) { toks.push(`「${glue}${k}」`); wtoks.push(`「${glue}${rep}」`); continue; }
        toks.push(glue + k + (j ? j[0] : '')); const jf = j ? (j[1] != null ? josaFor(rep, j[1], j[2]) : j[0]) : ''; wtoks.push(glue + rep + (jf === '라' && /사$/.test(rep) ? '여서' : jf)); // 「회사라 」 → 「회사여서 」(easy.js 와 같은 약속 — 금지 말 「사라 」)
      } else if (r < 0.80) { const x = rnd() < 0.5 ? rndNum() + pick(['%', '곳', '원', '주', '번', '']) : pick([...DATES, ...TIMES]); toks.push(x); wtoks.push(x); }
      else { const nm = pick(names), jj = rnd() < 0.4 ? pick(['는', '은', '의', '와', '이', '가']) : ''; toks.push(nm + jj); wtoks.push(nm + jj); srcNames.push(nm); }
    }
    parts.push(toks.join(' ')); wants.push(wtoks.join(' '));
  }
  const sep = pick(SEPS), s = parts.join(sep), want = wants.join(sep), e = ez(s);
  if (TPL[easyTemplateOf(s).key] != null || TPL[easyTemplateOf(s, {noEnt: true}).key] != null) continue; // 우연히 틀과 같은 글이면(거의 없음) 건너뜀 — 틀은 ②가 봄
  ok('무작위 · 쉬운 말 = 따로 만든 답(낱말 · 조사까지 글자 하나 같음)', e === want, {s, e, want});
  ok('무작위 · 숫자 모음이 같음(빠짐 · 바뀜 0)', nums(e) === nums(s), {s, e});
  for (const nm of new Set(srcNames)) ok('무작위 · 이름은 그대로(회사 · 업종)', countOf(e, nm) >= countOf(s, nm), {s, e, nm});
  ok('무작위 · 어려운 말 0', !hardLeft(e).length, {s, e, hard: hardLeft(e)});
  ok('무작위 · 금지 말을 새로 넣지 않음', bans(e).every(b => bans(s).includes(b)), {s, e});
  ok('무작위 · 두 번 바꿔도 같음', ez(e) === e, {e, again: ez(e)});
}

const report = {schema: 'atlas11-easy-million-1', at: new Date().toISOString(), seed: SEED, target: TARGET, checks, failed: fails.length ? Object.values(perKind).length && fails.length : 0, strings, templates: tplEntries.length, words: W.size, hard: HARD.length, what: Object.keys(WHAT).length, names: names.length, realNames: real, perKind, fails, seconds: Math.round((Date.now() - t0) / 100) / 10};
await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true});
await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({checks, failed: report.failed, strings, templates: tplEntries.length, words: W.size, seconds: report.seconds}));
for (const f of fails.slice(0, 12)) console.log(' ✗', JSON.stringify(f).slice(0, 400));
process.exit(fails.length ? 1 : 0);
