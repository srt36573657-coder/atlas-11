// 탐침 — 올라간 사이트(aaa7377.com)를 직접 받아 봄(사장님 2026-10-13 02:21 「너 안하거 다해 해고 1천만번 확인해」)
//   이 컴퓨터는 바깥 연결이 막혀 깃허브 실행기에서 받음 · 결과 reports/atlas11/probe/live-check/summary.json
//   파일마다 응답 · 크기 · sha256 · 표시(새 화면 · 새 문턱이 정말 올라갔나) — 저장소 dist 와 sha256 을 맞대 봄(화면 코드는 같아야 · 자료는 회차마다 새로 셈)
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const dir = 'reports/atlas11/probe/live-check'; await fs.mkdir(dir, {recursive: true});
const B = 'https://aaa7377.com';
const T = [['/', ['atlas.js']], ['/atlas/', ['atlas.js']], ['/atlas/atlas.js', ['function gauge(', 'function homeToday(', '평소와 견줌', '평소의 2.5배 넘게', "class: 'hstep'"]], ['/atlas/atlas.css', ['.gauge', '.hstep']],
  ['/atlas/data/home.json', ['"rule":"home-v3"', '"why":']], ['/atlas/data/updates.json', ['home-v3']], ['/media/makbi-hello.svg', []], ['/media/makbi-moon.svg', []], ['/hello.html', []]];
const out = [];
for (const [p, marks] of T) {
  let status = 0, bytes = 0, sha = null, has = {}, err = null, type = '';
  try {
    const r = await fetch(B + p + (p.includes('?') ? '&' : '?') + 'v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(20000)});
    status = r.status; type = r.headers.get('content-type') ?? ''; const buf = Buffer.from(await r.arrayBuffer()); bytes = buf.length; sha = crypto.createHash('sha256').update(buf).digest('hex');
    const text = buf.toString('utf8'); for (const m of marks) has[m] = text.includes(m);
    if (p === '/atlas/data/home.json') { try { const j = JSON.parse(text); has._home = {rule: j.rule, kst: j.kst, alerts: (j.alerts ?? []).map(a => `${a.kind}:${a.key}:${a.why ?? '-'}`)}; } catch {} }
  } catch (e) { err = String(e.message); }
  out.push({path: p, status, type, bytes, sha256: sha, has, err});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify({made: new Date().toISOString(), base: B, files: out}, null, 1));
console.log(JSON.stringify(out.map(x => [x.path, x.status, x.bytes, Object.values(x.has).filter(v => v === false).length])));
