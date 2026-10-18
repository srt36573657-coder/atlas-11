#!/usr/bin/env node
/* 본질 문 화면 층 — 모든 쪽 검사용 껍데기(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [2] 5 · 6 · 일꾼 KA)
   셈은 essence_check.mjs renderChecks 한 곳 — 이 파일은 주소 · 몫 · 결과 파일만(지킴 파일 · 진화 가지가 못 고침)
   쓰는 법
     node scripts/atlas11/next/check_essence.mjs --base <사이트 주소> --pw <playwright 폴더> --all [--shard k/n] [--out <결과.json>] [--units r2-home,r7-old]
       --all     = 기본 일감 모두(② 첫 화면 세 줄 · ④ 열한 질문 전 칸 · 첫 화면 · 고른 회사 · 열한 답 뒤 칸 · ⑤ 친구가 연 쪽 · ⑦ 오래된 받은 때)
       --shard k/n = 일감을 n 몫으로 나눈 k 번째(1부터 · 차례대로 돌려 나눔) · --units = 이름으로 고름(r6-share 처럼 기본 밖 일감도)
       --now <ISO> = ⑦ 의 「30일 전」 기준 때(기본 지금)
   끝 코드: 0 = 지나감 · 1 = 막음 또는 보지 못함(까닭은 결과 파일 · 화면에 번호와 함께)
   결과 꼴 {schema: 'kkolttori-essence-render-1', at, base, shard, units, ran, ok, checks: [{no, name, status, reasons, notes, counts}], seconds} */
import fs from 'node:fs/promises';
import path from 'node:path';
import {renderChecks, RENDER_UNITS, RENDER_EXTRA, mergeChecks, MARK} from './essence_check.mjs';

const argv = process.argv.slice(2), arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const base = arg('--base');
if (!base || (!argv.includes('--all') && !arg('--units'))) { console.error('쓰는 법: --base <주소> --pw <playwright 폴더> --all [--shard k/n] [--out <파일>] [--units a,b]'); process.exit(1); }
let units = arg('--units') ? arg('--units').split(',').map(s => s.trim()).filter(Boolean) : [...RENDER_UNITS];
const unknown = units.filter(u => ![...RENDER_UNITS, ...RENDER_EXTRA].includes(u));
if (unknown.length) { console.error('모르는 일감: ' + unknown.join(' · ') + ' — 있는 것: ' + [...RENDER_UNITS, ...RENDER_EXTRA].join(' · ')); process.exit(1); }
const sh = /^(\d+)\/(\d+)$/.exec(arg('--shard', '1/1') ?? '');
if (!sh || +sh[1] < 1 || +sh[1] > +sh[2]) { console.error('--shard 는 k/n(1 ≤ k ≤ n)'); process.exit(1); }
const [k, n] = [+sh[1], +sh[2]];
units = units.filter((_, i) => i % n === k - 1);
const now = arg('--now') ? Date.parse(arg('--now')) : Date.now();
if (!Number.isFinite(now)) { console.error('--now 를 못 읽음'); process.exit(1); }

const t0 = Date.now();
const r = units.length ? await renderChecks({base, pw: arg('--pw'), units, now, log: s => console.log(s)}) : {checks: [], ran: [], seconds: 0};
const checks = mergeChecks(r.checks), ok = checks.every(c => c.status === 'pass');
const out = {schema: 'kkolttori-essence-render-1', at: new Date().toISOString(), base, shard: `${k}/${n}`, units, ran: r.ran, ok,
  checks: checks.map(c => ({no: c.no, name: c.name, status: c.status, reasons: c.reasons, notes: c.notes, counts: c.counts})), seconds: Math.round((Date.now() - t0) / 100) / 10};
for (const c of checks) console.log(`${MARK[c.no]} ${c.name} — ${c.status === 'pass' ? '지나감' : c.status === 'cant' ? '보지 못함' : '막음'}` + c.reasons.map(x => `\n   ${MARK[c.no]} ${x}`).join(''));
console.log(`화면 층 ${k}/${n} · 일감 ${r.ran.length}개(${r.ran.join(' · ') || '없음'}) · ${out.seconds}초 · ${ok ? '지나감' : '막음'}`);
if (arg('--out')) { await fs.mkdir(path.dirname(path.resolve(arg('--out'))), {recursive: true}); await fs.writeFile(path.resolve(arg('--out')), JSON.stringify(out, null, 1) + '\n'); }
process.exit(ok ? 0 : 1);
