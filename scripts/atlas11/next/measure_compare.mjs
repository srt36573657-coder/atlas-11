#!/usr/bin/env node
/**
 * 고치기 전 · 뒤 맞대기 표(사장님 2026-10-18 00:15 [11] 1 「고치기 전과 뒤를 같은 자로 재서 표로 내라」)
 *   읽기만: reports/atlas11/measure/before-<날>.json · after-<날>.json(같은 자 measure.mjs) → after 옆에 compare-<날>.md
 *   쓰는 법: node scripts/atlas11/next/measure_compare.mjs [--day 2026-10-18]
 *   칸: 화면마다 길이(화면 수) · 글씨 가짓수(#view) · 왼쪽 줄 · 17px 아래 글 수 + 첫 화면 시장 숫자 수 · 매매일지 누름 수 · 합계 줄
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const DAY = arg('--day', '2026-10-18'), DIR = path.join(ROOT, 'reports/atlas11/measure');
const B = JSON.parse(fs.readFileSync(path.join(DIR, `before-${DAY}.json`), 'utf8')), A = JSON.parse(fs.readFileSync(path.join(DIR, `after-${DAY}.json`), 'utf8'));
// 채널 업종 화면은 전 · 뒤 주소가 다름(고른 업종이 바뀜) — 「#/ch/i/…」 끼리 하나로 맞댐
const key = k => (k.startsWith('#/ch/i/') ? '#/ch/i/(업종 하나)' : k.startsWith('#/s/') ? '#/s/(친구 쪽)' : k);
const norm = S => Object.fromEntries(Object.entries(S).map(([k, v]) => [key(k), v]));
const bs = norm(B.screens), as = norm(A.screens), keys = [...new Set([...Object.keys(bs), ...Object.keys(as)])];
const f = x => (x == null ? '?' : String(x)), arrow = (b, a) => `${f(b)} → ${f(a)}`;
const rows = keys.map(k => { const b = bs[k], a = as[k]; return `| \`${k}\` | ${arrow(b?.px, a?.px)} | ${arrow(b?.screens, a?.screens)} | ${arrow(b?.fontKinds, a?.fontKinds)} | ${arrow(b?.leftLines, a?.leftLines)} | ${arrow(b?.under17, a?.under17)} |`; });
const sum = (S, k) => Object.values(S).reduce((t, v) => t + (Number.isFinite(v?.[k]) ? v[k] : 0), 0);
const cnt = (S, p) => Object.values(S).filter(p).length;
const hb = B.screens['#/']?.home, ha = A.screens['#/']?.home;
const taps = J => J.extras?.whyTaps?.taps ?? J.extras?.why?.taps ?? null; // measure.mjs extras.whyTaps = {taps, typed, result, steps}
const lines = [
  `# 고치기 전 · 뒤 같은 자 맞대기 — ${DAY}`, '',
  `전: ${B.at} (${B.base}) · 뒤: ${A.at} (${A.base}) · 자 = \`scripts/atlas11/next/measure.mjs\` 머리말(한국어 360×640 · 새 기기) · 표는 \`measure_compare.mjs\` 가 두 파일에서 셈`, '',
  '| 화면 | 길이 px | 화면 수 | 글씨 가짓수(#view) | 왼쪽 줄 | 17px 아래 글 |', '|---|---|---|---|---|---|', ...rows, '',
  '## 모두 더해', '',
  `- 화면 수: ${keys.length}곳(전 ${Object.keys(bs).length} · 뒤 ${Object.keys(as).length})`,
  `- 17px 아래 글이 있는 화면: ${cnt(bs, v => v.under17 > 0)} → ${cnt(as, v => v.under17 > 0)} · 17px 아래 글 수 합: ${sum(bs, 'under17')} → ${sum(as, 'under17')}`,
  `- 길이 합: ${sum(bs, 'px')}px → ${sum(as, 'px')}px`,
  `- 첫 화면 길이: ${f(B.screens['#/']?.px)}px(${f(B.screens['#/']?.screens)}화면) → ${f(A.screens['#/']?.px)}px(${f(A.screens['#/']?.screens)}화면)`,
  `- 첫 화면 안(y<640) 시장 숫자: ${f(hb?.numsFirstScreen)} → ${f(ha?.numsFirstScreen)}`,
  `- 첫 화면 급등 카드: ${f(hb?.surgeCards)} → ${f(ha?.surgeCards)}`,
  `- 매매일지 누름(엔터 · 질문 · 보기 · 결과 모두): ${f(taps(B))} → ${f(taps(A))}`, '',
];
const out = path.join(DIR, `compare-${DAY}.md`);
fs.writeFileSync(out, lines.join('\n'));
console.log(lines.slice(-9).join('\n') + '\n→ ' + path.relative(ROOT, out));
