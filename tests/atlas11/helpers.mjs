import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const root = process.cwd();
export const readJSON = async f => JSON.parse(await fs.readFile(path.join(root, f), 'utf8'));
let cache = null;
export async function realInputs() {
  if (!cache) cache = {input: await readJSON('public/data/input.json'), calendar: await readJSON('public/data/rolling-calendar.json'), registry: await readJSON('public/data/factor36-registry.json'), records: {schema: 'atlas-factor36-records-1', records: []}};
  return cache;
}
export const tempRoot = async () => fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-'));
export const ISSUED = '2026-09-28T13:00:00.000Z';
