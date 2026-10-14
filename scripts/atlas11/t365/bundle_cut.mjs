// 모음에서 어느 날 뒤 일봉 줄만 뺀 새 모음 — 사장님 2026-10-14 09:52(싱가포르) 「지금 싸이트 변경 해」
//   그날 아침(장 중)에 받은 전 종목 모음은 그날 끝나지 않은 일봉 줄이 섞임(틀림 장부 24 · 25번) → 그 줄만 빼고 앞 거래일 종가까지로 고름
//   원래 모음 파일은 그대로 둠(새 파일만) · 목록 · 회사 요약 · 결산 · 업종 원문은 한 글자도 안 바꿈 · 일봉 rows 에서 cut 뒤 날만 뺌
//   쓰는 법: node scripts/atlas11/t365/bundle_cut.mjs <원래 bundle.json.gz> <새 폴더> <cut YYYYMMDD — 이 날까지 남김>
//   만드는 것: <새 폴더>/bundle.json.gz(derived 칸에 원래 파일 · sha256 · 뺀 줄 수) · <새 폴더>/derive.json(같은 내용)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const [, , SRC, DIR, CUT] = process.argv;
if (!SRC || !DIR || !/^\d{8}$/.test(CUT ?? '')) { console.error('쓰는 법: bundle_cut.mjs <원래 bundle.json.gz> <새 폴더> <cut YYYYMMDD>'); process.exit(2); }
const gz = fs.readFileSync(SRC), B = JSON.parse(zlib.gunzipSync(gz).toString('utf8'));
if (fs.existsSync(path.join(DIR, 'bundle.json.gz'))) { console.error('이미 있음(새 파일만): ' + DIR); process.exit(3); }
let removed = 0, touched = 0, kept = 0;
const removedDays = {};
for (const s of Object.values(B.stocks ?? {})) {
  const rows = s?.fchart?.rows; if (!Array.isArray(rows)) continue;
  const keep = rows.filter(r => r[0] <= CUT), drop = rows.length - keep.length;
  for (const r of rows) if (r[0] > CUT) removedDays[r[0]] = (removedDays[r[0]] ?? 0) + 1;
  if (drop) { s.fchart.rows = keep; s.fchart.cut = CUT; removed += drop; touched++; }
  kept += keep.length;
}
const why = '사장님 2026-10-14 09:52(싱가포르) 「지금 싸이트 변경 해」 — 아침(서울 09:44 ~ 09:57) 장 중에 받은 전 종목 모음에서 그날 끝나지 않은 일봉 줄만 뺌(틀림 장부 24 · 25번)';
const derived = {from: path.relative(process.cwd(), path.resolve(SRC)), fromSha256: crypto.createHash('sha256').update(gz).digest('hex'), cut: CUT, removedRows: removed, stocksTouched: touched, keptRows: kept, removedDays,
  untouched: '목록 · 회사 요약(PER · 시가총액 = 받은 때 값) · 결산 · 업종 원문은 그대로', why, made: new Date().toISOString()};
B.derived = derived;
fs.mkdirSync(DIR, {recursive: true});
fs.writeFileSync(path.join(DIR, 'bundle.json.gz'), zlib.gzipSync(Buffer.from(JSON.stringify(B)), {level: 9}), {flag: 'wx'});
fs.writeFileSync(path.join(DIR, 'derive.json'), JSON.stringify(derived, null, 1) + '\n', {flag: 'wx'});
console.log(JSON.stringify({dir: DIR, ...derived}));
