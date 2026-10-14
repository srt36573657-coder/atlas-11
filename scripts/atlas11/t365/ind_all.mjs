// 후보 모두(now.json 의 모음 회사 모두)에 ATLAS 업종 이름을 붙임 — grow.py 가 「같은 업종 안 크기」를 셀 때 읽음
//   업종 이름은 365곳과 같은 셈(lib/atlas11/universe.mjs group365Of · 네이버 업종 + 표준산업분류)
//   쓰는 법: node scripts/atlas11/t365/ind_all.mjs <now.json>  → 표준 출력 {코드: 업종}
import fs from 'node:fs';
import {group365Of} from '../../../lib/atlas11/universe.mjs';
const now = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = {};
for (const r of now.rows) out[r.code] = group365Of({sector: r.sector, ksic: r.ksic});
process.stdout.write(JSON.stringify(out));
