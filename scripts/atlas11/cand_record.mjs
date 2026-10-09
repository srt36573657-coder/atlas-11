#!/usr/bin/env node
/**
 * ATLAS 11 · 매수 검토 후보 발행본 남기기(한 번만 · 고치지 않음) — 사장님 2026-10-09 03:09(마카오 시각) 「ATLAS 제품 재설계 명령」 13
 *   「선정 당시의 후보군 · 자료 · 순위 · 이유 · 위험 · 가격 · 시각 · 조건 · 모델 버전을 보존한다 · 이후 결과를 알고 과거 이유를 다시 쓰지 않는다」
 *   날마다 기록은 저녁 7시 기록(build_view.mjs · 그날 판으로 셈한 후보가 함께 남음)이 맡는다. 이 도구는 그 기록에 후보가 없는 날(규칙을 처음 낸 날)에만
 *   지금 판으로 셈한 후보 목록을 public/data/atlas11/cand/<묶음>/<그날>.json 에 한 번 남긴다 — 파일이 있으면 쓰지 않음(flag wx) · 같은 날 저녁 기록에 후보가 있으면 쓰지 않음
 *   규칙이 바뀐 날(2026-10-09 10:14 「모테카를로 … 소거법」 → cand-rules-3): 그날 첫 기록(다른 규칙)은 그대로 두고(평가 대상 = 그날 첫 기록 — 고치지 않음)
 *     새 규칙의 첫 목록을 public/data/atlas11/cand/<묶음>/<규칙 이름>/<그날>.json 에 따로 한 번 남긴다(같은 날 · 같은 종가에서 두 규칙을 나중에 견줄 수 있게 · 판 읽기는 읽지 않음)
 *   node scripts/atlas11/cand_record.mjs [--dry]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {lensFrom, LENS_PLACES, dirName} from './lens/build.mjs';
import {candPubOf} from '../../lib/atlas11/cand.mjs';

const root = process.cwd(), dry = process.argv.includes('--dry'), now = new Date().toISOString();
const lens = await lensFrom(root, 'kr', {made: now});
const pub = candPubOf(lens, now);
if (!pub) { console.log(JSON.stringify({wrote: false, why: lens.cand?.why ?? '후보를 셀 수 없음'})); process.exit(0); }
const uni = dirName(lens.universe?.id);
let dir = path.join(root, LENS_PLACES.kr.cand, uni), file = path.join(dir, `${pub.asOf}.json`);
const ev = await fs.readFile(path.join(root, LENS_PLACES.kr.evening, uni, `${pub.asOf}.json`), 'utf8').then(JSON.parse).catch(() => null);
const first = Array.isArray(ev?.cand) ? {rules: ev.candRules ?? null, src: '저녁 기록'} : await fs.readFile(file, 'utf8').then(t => ({rules: JSON.parse(t).rules ?? null, src: '후보 발행본'})).catch(() => null);
if (first && first.rules === pub.rules) { console.log(JSON.stringify({wrote: false, why: `${pub.asOf} ${first.src}에 같은 규칙(${pub.rules}) 후보가 이미 있음(그 기록이 첫 기록)`})); process.exit(0); }
if (first) { dir = path.join(dir, dirName(pub.rules)); file = path.join(dir, `${pub.asOf}.json`); pub.note += ` · 같은 날 첫 기록은 ${first.src}(${first.rules ?? '규칙 이름 없음'}) — 그 기록이 평가 대상 · 이 파일은 새 규칙의 첫 목록(나란히 견주기용)`; }
if (dry) { console.log(JSON.stringify({dry: true, file: path.relative(root, file), n: pub.cand.length, asOf: pub.asOf, boardId: pub.boardId, codes: pub.cand.map(x => x.code)})); process.exit(0); }
await fs.mkdir(dir, {recursive: true});
try { await fs.writeFile(file, JSON.stringify(pub, null, 1) + '\n', {flag: 'wx'}); }
catch (e) { if (e.code === 'EEXIST') { console.log(JSON.stringify({wrote: false, why: '이미 있음(고치지 않음)', file: path.relative(root, file)})); process.exit(0); } throw e; }
console.log(JSON.stringify({wrote: true, file: path.relative(root, file), n: pub.cand.length, asOf: pub.asOf, recordedAt: now, codes: pub.cand.map(x => x.code)}));
