// 장부 문(사장님 2026-10-13 02:32 「넌 대충해? 공평하지 않는데」 · 02:33 「숫자도 그리고 너 뭘걸거야?」)
//   틀림 장부 reports/atlas11/trust/ 는 새 파일만 — 밀어 넣을 커밋들이 장부 파일을 지우거나 고치거나 옮기면 막음
//   견주는 곳 = origin/main 과 HEAD 의 갈림점(밀기 전에 fetch · rebase 하므로 올라간 장부 그대로)
import {execFileSync} from 'node:child_process';
const git = (...a) => execFileSync('git', a, {encoding: 'utf8'}).trim();
const DIR = 'reports/atlas11/trust';
let base = '';
try { base = git('merge-base', 'HEAD', 'origin/main'); } catch { console.log('장부 문 — origin/main 이 없어 견줄 곳 없음(새 저장소) · 통과'); process.exit(0); }
const rows = git('diff', '--name-status', '--no-renames', base, 'HEAD', '--', DIR).split('\n').filter(Boolean);
const bad = rows.filter(r => !r.startsWith('A\t'));
if (bad.length) { console.error('장부 문 막힘 — 틀림 장부는 새 파일만(지우기 · 고치기 · 옮기기 안 됨): ' + bad.map(r => r.replace('\t', ' ')).join(' · ')); process.exit(1); }
console.log(`장부 문 통과 — 새 장부 파일 ${rows.length}개`);
