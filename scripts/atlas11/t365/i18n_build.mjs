#!/usr/bin/env node
/**
 * 새 ATLAS 영어 팩 만들기 — 원본(scripts/atlas11/t365/i18n/en-src.json) + 회사 영어 이름 → site/atlas/i18n/en.json · en-names.json
 *   사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」
 *   회사 이름: public/data/atlas11/names-en-all.json(야후 · 새 받기) → 없으면 names-kr.json(옛 365곳) → 그것도 없으면 로마자
 *   이름 끝의 회사 꼴(Co., Ltd. · Inc. · Corporation …)은 뗌 — 화면 칸이 좁음(옛 판 site/app/i18n.js addBoardNames 와 같은 뜻)
 *   틀 검사: 자리표({n} {d} {t} {e} {q} · {n2} 같은 번호)가 원문 열쇠와 같은 수 · 번역에 한글 없음 — 걸리면 끝 코드 1
 *   쓰는 법: node scripts/atlas11/t365/i18n_build.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const tryJ = f => { try { return J(f); } catch { return null; } };
const SRC = J('scripts/atlas11/t365/i18n/en-src.json');
const names = J('site/atlas/data/names.json').rows;
const all = tryJ('public/data/atlas11/names-en-all.json')?.names ?? {}, old = tryJ('public/data/atlas11/names-kr.json')?.names ?? {};
const LEGAL = /[\s,.]*\b(?:co\.?\s*,?\s*ltd|inc|incorporated|corp|corporation|ltd|limited|plc|holdings?\s+co\.?\s*,?\s*ltd)\.?\s*$/i, TAIL_CO = /(?<!&|\band)[\s,]+co\.?\s*$/i;
const MARKET = /^(KOSPI|KOSDAQ|KONEX|KRX)$/i;
const clean = s => { let x = String(s ?? '').trim(); if (!x || MARKET.test(x)) return null; for (let k = 0; k < 3; k++) x = x.replace(LEGAL, '').replace(TAIL_CO, '').trim(); return x || null; };
const RI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const RM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const RF = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const romanize = s => String(s).replace(/[가-힣]+/g, w => { const r = [...w].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; return RI[Math.floor(c / 588)] + RM[Math.floor((c % 588) / 28)] + RF[c % 28]; }).join(''); return r.charAt(0).toUpperCase() + r.slice(1); });
const HAN = /[가-힣]/;
const co = {}; let fromYahoo = 0, fromRoman = 0;
for (const r of names) {
  if (!HAN.test(r.n) || co[r.n] || SRC.entities[r.n]) continue; // 이름 사전(업종 · 갈래)이 먼저
  const en = clean(all[r.c]?.nameEn) ?? clean(old[r.c]?.nameEn);
  if (en && !HAN.test(en)) { co[r.n] = en; fromYahoo++; } else { co[r.n] = romanize(r.n); fromRoman++; }
}
// 로마자 이름 회사(KCC · SOOP · YG PLUS …) — 엔진(i18n.js)이 사전에 없는 줄에서만 이름({e})으로 봄(2026-10-16 · 「KCC 매출 길」 같은 줄이 회사마다 따로 남던 것)
const latin = {};
for (const r of names) { if (HAN.test(r.n) || String(r.n).length < 2 || latin[r.n]) continue; const en = clean(all[r.c]?.nameEn) ?? clean(old[r.c]?.nameEn); latin[r.n] = en && !HAN.test(en) ? en : r.n; }
// 틀 검사
const PH = s => (String(s).match(/\{(?:d|m|t|e|n|q)\d*\}/g) ?? []).map(x => x.replace(/\d+\}$/, '}')).sort().join(' ');
const bad = [];
for (const [k, v] of Object.entries(SRC.templates)) {
  if (typeof v !== 'string' || !v.trim()) { bad.push(['빈 번역', k]); continue; }
  if (HAN.test(v)) bad.push(['번역에 한글', k, v]);
  if (PH(k) !== PH(v)) bad.push(['자리표 다름', k, v]);
}
for (const [k, v] of Object.entries(SRC.entities)) if (!v || HAN.test(v)) bad.push(['이름 번역에 한글', k, v]);
if (bad.length) { console.error(JSON.stringify({bad: bad.length, first: bad.slice(0, 20)}, null, 1)); if (process.argv.includes('--check')) process.exit(1); }
const outDir = path.join(ROOT, 'site/atlas/i18n'); fs.mkdirSync(outDir, {recursive: true});
const dict = {schema: 'atlas-new-i18n-1', lang: 'en', note: '새 ATLAS 영어 팩(scripts/atlas11/t365/i18n_build.mjs 가 만듦 — 손으로 고치지 않음)', entities: SRC.entities, templates: SRC.templates};
const nm = {schema: 'atlas-new-i18n-names-1', lang: 'en', note: '회사 영어 이름 — 야후 파이낸스 영문 정식 이름(회사 꼴은 뗌) · 없으면 로마자', count: Object.keys(co).length, fromYahoo, fromRoman, names: co, latinCount: Object.keys(latin).length, latin};
if (!process.argv.includes('--check')) {
  fs.writeFileSync(path.join(outDir, 'en.json'), JSON.stringify(dict) + '\n');
  fs.writeFileSync(path.join(outDir, 'en-names.json'), JSON.stringify(nm) + '\n');
}
console.log(JSON.stringify({templates: Object.keys(SRC.templates).length, entities: Object.keys(SRC.entities).length, names: Object.keys(co).length, fromYahoo, fromRoman, latin: Object.keys(latin).length, bad: bad.length}));
