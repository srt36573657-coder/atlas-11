#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 명령문 잠금 검사
 *   node atlas4h/scripts/check_command.mjs
 *   칸 파일(atlas4h/command/NN-*.txt)을 index.json 순서대로 이어 붙이면 original.txt 와 바이트까지 같은지,
 *   원문·칸마다 sha256 이 index.json 과 같은지 본다. 하나라도 다르면 종료코드 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'command');
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

export function checkCommand(dir = DIR) {
  const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  const original = fs.readFileSync(path.join(dir, idx.original.file));
  const problems = [];
  if (sha(original) !== idx.original.sha256) problems.push(`원문 sha256 다름: ${sha(original)}`);
  const parts = idx.sections.map(s => {
    const buf = fs.readFileSync(path.join(dir, s.file));
    if (sha(buf) !== s.sha256) problems.push(`${s.file} sha256 다름`);
    return buf;
  });
  if (!Buffer.concat(parts).equals(original)) problems.push('칸 파일을 이어 붙인 것이 원문과 다름');
  return {ok: problems.length === 0, sections: idx.sections.length, originalSha256: idx.original.sha256, problems};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = checkCommand();
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
}
