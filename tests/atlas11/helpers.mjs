import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const root = process.cwd();
/** 검사용 고정 입력: 2026-09-28 종가까지의 실제 입력 사본(매일 자라는 public/data/input.json 대신 · 검사가 날짜에 따라 달라지지 않게) */
export const INPUT_928 = 'tests/atlas11/fixtures/input-2026-09-28.json';
export const readJSON = async f => JSON.parse(await fs.readFile(path.join(root, f), 'utf8'));
let cache = null;
export async function realInputs() {
  if (!cache) cache = {input: await readJSON(INPUT_928), calendar: await readJSON('public/data/rolling-calendar.json'), registry: await readJSON('public/data/factor36-registry.json'), records: {schema: 'atlas-factor36-records-1', records: []}};
  return cache;
}
export const tempRoot = async () => fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-'));
export const ISSUED = '2026-09-28T13:00:00.000Z';
