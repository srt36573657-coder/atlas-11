// 탐침 — 올라간 사이트(aaa7377.com)를 휴대폰 크기(390 × 844)로 열어 화면을 그림으로 남김(사장님 2026-10-25 12:24 「어」 — 첫 화면 · 날짜별 싹 달력이 진짜 사이트에서 그렇게 보이나
//   주문 장부 열린 일 「진짜 사이트 싹 달력 그래프는 아직 사진으로 못 봤어요」 · 이 컴퓨터는 바깥 연결이 막혀 깃허브 실행기에서만 찍음)
//   결과 reports/atlas11/probe/live-shot/(<이름>-390.png = 첫 한 화면 · <이름>-390-long.png = 위에서 3000px 까지 · summary.json)
//   SHOTS = 「이름=#/주소」 쉼표 목록(없으면 첫 화면 · 싹 달력 · 급등 칩 · 삼성전자 · 오늘 시장 · 반도체 업종 — 2026-10-25 「카톡 보내기」 모든 곳) · 시험: LIVE_BASE=http://127.0.0.1:<포트> LIVE_PATH=/next/ · LIVE_OUT=<폴더> · PW_DIR
//   읽기만 함(누르기 · 적기 없음) · 그림에 비밀 값 없음(사이트 화면 그대로)
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, ''), P0 = /^\/[\w\-/]*$/.test(process.env.LIVE_PATH ?? '') ? process.env.LIVE_PATH : '/'; // P0 = 새 화면 길(올라간 사이트 = / · 이 컴퓨터 시험 서버 = /next/)
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-shot'; await fs.mkdir(dir, {recursive: true});
const SHOTS = (process.env.SHOTS || 'home=#/,cal=#/t/cal,surge=#/f/surge,co=#/w/005930,today=#/today,ind=#/ch/i/%EB%B0%98%EB%8F%84%EC%B2%B4').split(',').map(s => s.trim().split('=')).filter(x => x.length === 2 && /^[a-z0-9-]{1,24}$/.test(x[0]) && /^#\/[\w\-/%.]*$/.test(x[1]));
const LONG = 3000; // 긴 그림은 위에서 3000px 까지만(싹 달력 60날을 다 찍으면 그림이 너무 큼)
const out = {made: new Date().toISOString(), base: B, size: [390, 844], shots: []};
const b = await chromium.launch();
try {
  for (const [name, hash] of SHOTS) {
    const sz = /-(\d{3,4})x(\d{3,4})$/.exec(name), vp = sz ? {width: +sz[1], height: +sz[2]} : {width: 390, height: 844}, tag = sz ? '' : '-390'; // 이름 끝 「-390x664」 = 그 화면 크기(사장님 2026-10-27 00:17 「… 첫 화면에 한번에 보일 수 있는 …」 — 낮은 화면을 진짜 사이트에서 잼) · 없으면 390 × 844 그대로
    const ctx = await b.newContext({viewport: vp, deviceScaleFactor: 2, locale: 'ko-KR'});
    await ctx.addInitScript(() => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); } catch { /* 저장 못 함 — 그대로 찍음 */ } });
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const r = {name, hash, size: [vp.width, vp.height], files: [], errs, info: null, err: null};
    try {
      await p.goto(B + P0 + '?v=' + Date.now() + hash, {waitUntil: 'networkidle', timeout: 60000});
      await p.waitForFunction(() => !!document.querySelector('#view') && !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => {});
      await p.waitForTimeout(2500);
      const f1 = `${dir}/${name}${tag}.png`; await p.screenshot({path: f1}); r.files.push(f1);
      const hgt = await p.evaluate(() => document.documentElement.scrollHeight);
      const f2 = `${dir}/${name}${tag}-long.png`; await p.screenshot({path: f2, fullPage: true, clip: {x: 0, y: 0, width: vp.width, height: Math.min(LONG, hgt)}}); r.files.push(f2);
      r.parts = {}; // 칸 하나씩 — 첫 화면 「고른 싹이 꽃이 됐을까?」 칸 · 「돌이가 고른 회사」 결론 · 「그런데」(사장님 2026-10-27 19:52 「돌이가 고른 회사 이제 이거 아니잖라 수정해야지」 — 긴 그림은 붙는 줄이 칸을 가려 칸만 따로 찍고 글도 남김)
      for (const [k, sel] of [['card', '#view a.th-pkhome'], ['end', '#view #pk-end'], ['turn', '#view #pk-turn'], ['hero', '#view section.nh-hero'], ['map', '#view section.nh-map'], ['rec', '#view section.nh-rec'], ['why', '#view section.nh-why']]) { // hero · map · rec · why = 새 첫 화면 칸(2026-10-28 order-1112 — 칸만 따로 찍고 글도 남김)
        const el = await p.$(sel); if (!el) continue;
        await el.evaluate(e => e.scrollIntoView({block: 'center'})); await p.waitForTimeout(400);
        const f3 = `${dir}/${name}${tag}-${k}.png`; await el.screenshot({path: f3}).then(() => r.files.push(f3)).catch(() => {});
        r.parts[k] = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 400);
      }
      r.info = await p.evaluate(() => ({hash: location.hash, title: document.title, h1: document.querySelector('#view h1')?.textContent ?? '', kakaoText: document.querySelectorAll('#view .kk-txt').length, kakaoRow: document.querySelectorAll('#view .kk-btn.kk-row').length, kakaoAll: [...document.querySelectorAll('#view .kk-btn, #view .kk-yel')].filter(b => /카톡 보내기/.test(b.textContent)).length,
        days: document.querySelectorAll('#view section.th-day').length, firstDay: document.querySelector('#view section.th-day h2')?.textContent ?? null, graphs: document.querySelectorAll('#view svg.th-sinsvg').length,
        calgo: !!document.querySelector('#view a.th-calgo'), height: document.documentElement.scrollHeight,
        fold: (() => { const lab = [...document.querySelectorAll('#view .s-apps .s-apl')].map(e => e.getBoundingClientRect().bottom), th = document.querySelector('#view .s-thumb'), tabs = document.querySelector('.tabs'); if (!lab.length) return null; const room = th && th.getBoundingClientRect().height > 0 ? th.getBoundingClientRect().top : (tabs ? tabs.getBoundingClientRect().top : innerHeight); const c = document.querySelector('#view .th-zones .s-art')?.getBoundingClientRect(); return {apps: Math.round(Math.max(...lab)), room: Math.round(room), vh: innerHeight, fit: Math.max(...lab) <= room + 0.5, clock: c ? [Math.round(c.width), Math.round(c.height)] : null}; })(),
        hero: (() => { const e = document.querySelector('#view section.nh-hero'); if (!e) return null; const th = document.querySelector('#view .s-thumb'), tabs = document.querySelector('.tabs'), room = th && th.getBoundingClientRect().height > 0 ? th.getBoundingClientRect().top : (tabs ? tabs.getBoundingClientRect().top : innerHeight), b = e.getBoundingClientRect().bottom; return {bottom: Math.round(b), room: Math.round(room), vh: innerHeight, fit: b <= room + 0.5}; })()})); // fold = 옛 그림 단추 넷(없으면 null) · hero = 새 첫 화면 소개 칸이 찾기 줄 위 한 화면 안(2026-10-28 order-1112)
    } catch (e) { r.err = String(e?.message ?? e).split('\n')[0].slice(0, 200); }
    out.shots.push(r); await ctx.close();
  }
} finally { await b.close(); }
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.shots.map(s => [s.name, s.files.length, s.errs.length, s.err, s.info])));
