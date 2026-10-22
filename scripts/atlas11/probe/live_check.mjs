// 탐침 — 올라간 사이트(aaa7377.com)를 직접 받아 봄(사장님 2026-10-13 02:21 「너 안하거 다해 해고 1천만번 확인해」)
//   이 컴퓨터는 바깥 연결이 막혀 깃허브 실행기에서 받음 · 결과 reports/atlas11/probe/live-check/summary.json
//   파일마다 응답 · 크기 · sha256 · 표시(새 화면 · 새 문턱이 정말 올라갔나) — 저장소 dist 와 sha256 을 맞대 봄(화면 코드는 같아야 · 자료는 회차마다 새로 셈)
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const dir = 'reports/atlas11/probe/live-check'; await fs.mkdir(dir, {recursive: true});
const B = 'https://aaa7377.com';
const T = [['/', ['atlas.js']], ['/atlas/', ['atlas.js']], ['/atlas/atlas.js', ['function gauge(', 'function homeToday(', '평소와 견줌', '평소의 2.5배 넘게', "class: 'hstep'"]], ['/atlas/atlas.css', ['.gauge', '.hstep']],
  ['/atlas/data/home.json', ['"rule":"home-v3"', '"why":']], ['/atlas/data/updates.json', ['home-v3']], ['/media/makbi-hello.svg', []], ['/media/makbi-moon.svg', []], ['/hello.html', []],
  // 싹 달력(사장님 2026-10-22 11:55 · 12:17 「1 · 2 · 3 … 달력으로 · 기록이 없으면 하수」) — 자료 · 쪽 · 첫 화면 고리가 정말 올라갔나
  ['/next/data/theme-cal.json', ['"schema":"dori-theme-1-cal"', '"keepFrom":"2026-10-22"']], ['/next/p-theme.js', ['function pCal(', '싹 달력']], ['/next/theme-home.js', ["'#/t/cal'", '날마다 찾은 세 곳 달력']], ['/next/data/theme-home.json', ['"record"']]];
const out = [];
for (const [p, marks] of T) {
  let status = 0, bytes = 0, sha = null, has = {}, err = null, type = '';
  try {
    const r = await fetch(B + p + (p.includes('?') ? '&' : '?') + 'v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(20000)});
    status = r.status; type = r.headers.get('content-type') ?? ''; const buf = Buffer.from(await r.arrayBuffer()); bytes = buf.length; sha = crypto.createHash('sha256').update(buf).digest('hex');
    const text = buf.toString('utf8'); for (const m of marks) has[m] = text.includes(m);
    if (p === '/next/data/theme-home.json') { try { const j = JSON.parse(text); has._rec = {asOf: j.asOf, all: j.record?.all ?? null, sprout: j.record?.sprout ?? null, real: j.record?.real ?? null, top: j.order?.S?.slice(0, 3) ?? null}; } catch {} } // 싹 달력 맨 위 「아무 업종은 100번 가운데 n번」 = record.all.p
    if (p === '/next/data/theme-cal.json') { try { const j = JSON.parse(text), done = (j.days ?? []).filter(x => x.top?.length && typeof x.top[0].hit === 'boolean'), all3 = done.flatMap(x => x.top.filter(i => typeof i.hit === 'boolean')); has._cal = {asOf: j.asOf, days: j.days?.length ?? 0, kept: (j.days ?? []).filter(x => x.k).length, done: done.length, hit1: done.filter(x => x.top[0].hit).length, all3: all3.length, hit3: all3.filter(i => i.hit).length, last: j.days?.at(-1) ?? null}; } catch {} }
    if (p === '/atlas/data/home.json') { try { const j = JSON.parse(text); has._home = {rule: j.rule, kst: j.kst, alerts: (j.alerts ?? []).map(a => `${a.kind}:${a.key}:${a.why ?? '-'}`)}; } catch {} }
  } catch (e) { err = String(e.message); }
  out.push({path: p, status, type, bytes, sha256: sha, has, err});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify({made: new Date().toISOString(), base: B, files: out}, null, 1));
console.log(JSON.stringify(out.map(x => [x.path, x.status, x.bytes, Object.values(x.has).filter(v => v === false).length])));
