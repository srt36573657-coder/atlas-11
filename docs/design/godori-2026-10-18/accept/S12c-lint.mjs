#!/usr/bin/env node
/* S12c 정적 검사 — 내 css 넷(p-time · p-info · p-x · en): font-size 는 var(--fs-1..6) 만 · margin · padding · gap 은 0 · auto · var(--sp-1..3) 만(음수 없음) — node docs/design/godori-2026-10-18/accept/S12c-lint.mjs [파일…] */
import fs from 'node:fs';
const FILES = (process.argv.slice(2).length ? process.argv.slice(2) : ['site/next/p-time.css', 'site/next/p-info.css', 'site/next/p-x.css', 'site/next/en.css']);
const SP = /^(margin|padding)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$|^(row-|column-)?gap$|^grid-(row-|column-)?gap$/;
const okFs = v => /^var\(--fs-[1-6]\)$/.test(v) || v === 'inherit';
const okSp = v => v === '0' || v === 'auto' || v === 'inherit' || /^var\(--sp-[123]\)$/.test(v);
let bad = 0, nFs = 0, nSp = 0;
for (const f of FILES) {
  const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const prop = m[1], val = m[2].trim().replace(/\s*!important$/, '');
    if (prop === 'font-size') { nFs++; if (!okFs(val)) { bad++; console.log(f, 'font-size', val); } }
    else if (SP.test(prop)) { nSp++; const toks = val.split(/\s+/); if (!toks.every(okSp)) { bad++; console.log(f, prop, val); } }
  }
}
console.log(`font-size ${nFs}줄 · margin/padding/gap ${nSp}줄 · 어긋남 ${bad}`);
process.exit(bad ? 1 : 0);
