// 1년 하늘 빠르기 재기 — 날짜 글이 바뀌는 때를 40초 동안 적어 「한 해를 도는 데 걸리는 시간」과 「되감기」를 셈
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, secs = '60'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(300);
await p.evaluate(() => document.querySelector('.sky').scrollIntoView({block: 'center'}));
const log = await p.evaluate(ms => new Promise(res => { const out = []; const t0 = performance.now(); let last = ''; const tick = () => { const d = document.querySelector('.daylab')?.textContent || ''; const r = document.getElementById('sky-day'); const v = r ? Number(r.value) / 100 : NaN; out.push([Math.round(performance.now() - t0), v]); if (performance.now() - t0 < ms) requestAnimationFrame(tick); else res(out); }; tick(); }), Number(secs) * 1000);
// 앞으로 가는 구간과 뒤로 가는 구간의 빠르기(장/초)를 셈
let fwd = [], back = [], maxBack = 0;
for (let k = 1; k < log.length; k++) { const dt = (log[k][0] - log[k - 1][0]) / 1000, df = log[k][1] - log[k - 1][1]; if (dt <= 0) continue; const v = df / dt; if (df > 0.0001) fwd.push(v); if (df < -0.0001) { back.push(v); maxBack = Math.min(maxBack, v); } }
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const maxF = fwd.length ? Math.max(...fwd) : 0;
// 한 번에 크게 뛴 것(감췄다가 처음으로 — 되감기 없이 한 번에 0 으로)
const jumps = []; for (let k = 1; k < log.length; k++) if (log[k][1] - log[k - 1][1] < -5) jumps.push(log[k][0]);
console.log(JSON.stringify({file: file.split('/').pop(), samples: log.length, fwd_median_fps: +med(fwd).toFixed(2), fwd_max_fps: +maxF.toFixed(2), back_samples: back.length, back_fastest_fps: +(-maxBack).toFixed(1), jumps_ms: jumps, year_secs_at_median: med(fwd) ? +(50 / med(fwd)).toFixed(1) : null}));
await b.close();
