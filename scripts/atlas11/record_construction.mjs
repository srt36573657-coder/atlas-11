#!/usr/bin/env node
/**
 * 「공사 기록」 한 줄을 기록 장부(operation · kind: construction)에 덧붙인다.
 *   공사 = 사람이(또는 Claude 가) 수집·분석·기록·화면 장치를 고친 것. 시장 결과로 식·요인·무게가 바뀐 「진화」와 섞지 않는다.
 *   node scripts/atlas11/record_construction.mjs --date 2026-09-30 --title "…" --heard "…" --commits c0f6377,8d03782 --docs docs/ATLAS11_REPORT.md
 *   --heard = 이 공사로 시장의 답을 더 잘 듣게 된 점 한 줄. 나중에 적는 기록이면 recordedLater: true 가 붙는다(적은 시각 at 은 지금).
 *   덧붙이기만 한다. 같은 내용을 두 번 적으면 기록 ID 가 같아 한 번만 남는다.
 */
import path from 'node:path';
import {appendRecord} from '../../lib/atlas11/records.mjs';

const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);

export async function recordConstruction(rootDir, {date, title, heard, commits = [], docs = [], at = new Date().toISOString()}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw Error('CONSTRUCTION_DATE');
  if (!title || !heard) throw Error('CONSTRUCTION_TEXT');
  const body = {kind: 'construction', date, title, heard, sources: {commits, docs}, recordedLater: date < koreaDay(at), status: '공사 기록'};
  return appendRecord(rootDir, {type: 'operation', dateKST: date, at, body});
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
  const list = v => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const r = await recordConstruction(process.cwd(), {date: arg('--date'), title: arg('--title'), heard: arg('--heard'), commits: list(arg('--commits')), docs: list(arg('--docs')), at: arg('--at') ?? undefined});
  console.log(JSON.stringify({id: r.record.id, dateKST: r.record.dateKST, duplicate: r.duplicate, file: r.file}));
}
