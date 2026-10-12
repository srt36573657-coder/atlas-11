// 얼굴 문(사장님 2026-10-13 03:38 「내딸 얼굴 세상에 공개 하면 안돼 모든 흔적 다 지워」)
//   저장소 기록에서도 지운 옛 사람 얼굴 그림 판(블롭 번호 목록 scripts/atlas11/probe/old-media-blobs.txt)이
//   밀어 넣을 커밋(HEAD)의 파일 가운데 하나라도 다시 들어 있으면 막음 — 같은 그림을 되살리는 일을 기계가 막음
//   목록을 못 읽거나 비어 있으면 막음(조용히 통과하지 않음)
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const LIST = process.env.FACE_LIST ?? 'scripts/atlas11/probe/old-media-blobs.txt';
let old;
try { old = new Set(fs.readFileSync(LIST, 'utf8').split(/\s+/).filter(Boolean)); } catch { console.error('얼굴 문 막힘 — 지운 그림 목록을 못 읽음: ' + LIST); process.exit(1); }
if (!old.size) { console.error('얼굴 문 막힘 — 지운 그림 목록이 비어 있음'); process.exit(1); }
const rows = execFileSync('git', ['ls-tree', '-r', process.env.FACE_REF ?? 'HEAD'], {encoding: 'utf8', maxBuffer: 1 << 28}).split('\n').filter(Boolean);
const hit = rows.map(r => r.split(/\s+/)).filter(([, type, id]) => type === 'blob' && old.has(id)).map(r => r.slice(3).join(' '));
if (hit.length) { console.error(`얼굴 문 막힘 — 지운 옛 얼굴 그림이 다시 들어 있음 ${hit.length}개: ${hit.slice(0, 5).join(' · ')}`); process.exit(1); }
console.log(`얼굴 문 통과 — 파일 ${rows.length}개 중 지운 옛 그림 0개(목록 ${old.size}개)`);
