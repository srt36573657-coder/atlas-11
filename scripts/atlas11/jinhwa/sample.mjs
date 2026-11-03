#!/usr/bin/env node
// 샘플 열하나를 한 판에 — 사장님 2026-11-04 01:20(+04) 「응」(물음 「앞으로 진화도 매번 샘플 열하나를 만들고 하나로 모을까요?」 · 주문 0620)
//   앞 주문 0508(00:08(+04) 「샘플을 11가지 만든다음 11가지에 장점을 1곳에 모아 물흐르듯 아주 자연스럽게 만들어봐」) — 원문 docs/design/jinhwa-paper-2026-11-04/
//   만드는 회차(make)의 일꾼 열하나가 렌즈마다 새 첫 화면 샘플을 하나씩 만든다. 이 도구는 일꾼에게 줄 자료 한 장(--snap)과 샘플을 찍고 재는 일(--shoot)만 한다 — 샘플은 일꾼이 만든다.
//   --snap : 작업 폴더의 site/(begin 이 지금 사이트 자료로 바꾼 판)에서 site/su/su-data.js 셈 그대로 고른 자료 한 장(새 셈 없음)
//   --shoot: 샘플 폴더의 index.html 을 360 너비로 처음 · 회사 · 업종 세 쪽 찍고 잰다(가장 작은 글씨 · 작은 누르는 곳 · 옆 넘침 · 화면 오류)
//   쓰는 법: node scripts/atlas11/jinhwa/sample.mjs --snap --dir . --out <일 폴더>/samples/data.json
//            node scripts/atlas11/jinhwa/sample.mjs --shoot <샘플 폴더> --data <일 폴더>/samples/data.json
//   끝 코드: 0 했음 · 1 막음(잰 값이 선을 넘음 · 못 찍음) · 2 잘못 넣음
//   브라우저: createRequire('/opt/node-tools/')('playwright') · executablePath /opt/pw-browsers/chromium(shots.mjs 와 같음)
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import * as SD from '../../../site/su/su-data.js';

export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
export const MIN_FONT = 17, MIN_TAP = 48;

/** 일꾼에게 줄 자료 한 장 — J = {B, TH, W, S, H, M, co(code) → 회사 자료} · su-data.js 셈 그대로(첫 화면 · 회사 · 업종 쪽이 보이는 것과 같음) */
export function snapshot(J) {
  const {B = null, TH = null, W = null, S = null, H = null, M = null, co = () => null} = J ?? {};
  const bl = SD.bloomList(B), mo = SD.moneyList(TH, W);
  const asOf = B?.asOf ?? TH?.asOf ?? W?.asOf ?? null;
  const coOf = code => {
    const x = co(code), c = x?.c; if (!c || typeof c.name !== 'string') return null;
    return {code, name: c.name, ind: typeof c.i === 'string' ? c.i : null, market: c.market ?? null, reasons: SD.reasonsFor(code, bl, mo),
      line: SD.coLine(x), index: SD.idxLine(H, c.market, H?.base, H?.asOf), asOf: H?.asOf ?? null};
  };
  const codes = [...bl.rows.map(r => r.code), ...mo.map(r => r.code)].filter((v, i, a) => a.indexOf(v) === i);
  const inds = [...new Set([...bl.rows.map(r => r.ind), ...mo.map(r => r.ind)].filter(Boolean))].map(n => {
    const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === n), rows = SD.indRows(M, n);
    return {name: n, x: typeof t?.x === 'number' ? t.x : null, why: SD.whyOf(W, n), rows: rows.slice(0, 12), count: rows.length, asOf: M?.asOf ?? null};
  });
  return {schema: 'jinhwa-sample-data-1', note: '새 첫 화면 샘플용 자료 — 지금 사이트 자료를 site/su/su-data.js 셈 그대로 고른 것(새 셈 없음)', asOf,
    home: {bloom: bl, money: mo}, companies: codes.map(coOf).filter(Boolean), industries: inds, safe: SAFE,
    summary: S ? {coN: S.coN ?? null, fetchedAt: S.fetchedAt ?? null} : null};
}
/** 사이트 뿌리(next/data · atlas/data 가 든 폴더 — 작업 폴더면 그 안의 site/)에서 읽어 자료 한 장(못 읽은 파일은 null) */
export function snapFrom(dir) {
  const d0 = path.resolve(String(dir ?? '.')), R = fs.existsSync(path.join(d0, 'site', 'next', 'data')) ? path.join(d0, 'site') : d0;
  const J = p => { try { return JSON.parse(fs.readFileSync(path.join(R, p), 'utf8')); } catch { return null; } };
  if (!fs.existsSync(path.join(R, 'next', 'data'))) return {ok: false, why: '폴더에 next/data 가 없음 — ' + dir};
  const d = snapshot({B: J('next/data/theme-bloom.json'), TH: J('next/data/theme.json'), W: J('next/data/flow-why.json'), S: J('next/data/home-summary.json'),
    H: J('atlas/data/home.json'), M: J('atlas/data/mkt.json'), co: c => (SD.CODE.test(c) ? J('atlas/data/co/' + c + '.json') : null)});
  return {ok: true, data: d};
}
/** 샘플이 찍을 세 쪽 — 처음 · 첫 회사(꽃이 될 회사 먼저 · 없으면 돈이 몰린 회사) · 그 회사의 업종 */
export function routesOf(d) {
  const first = d?.home?.bloom?.rows?.[0] ?? d?.home?.money?.[0] ?? null;
  const out = [['home', '#/']];
  if (first?.code && SD.CODE.test(first.code)) out.push(['co', '#/c/' + first.code]);
  if (first?.ind) out.push(['ind', '#/i/' + encodeURIComponent(first.ind)]);
  return out;
}
/** 잰 값 → 걸린 까닭(빈 = 지남) */
export function measureWhy(name, m) {
  const why = [];
  if (!(m?.minFont >= MIN_FONT - 0.05)) why.push(`${name} 가장 작은 글씨 ${m?.minFont ?? '?'}px — ${MIN_FONT}px 이상으로`);
  if (m?.smallTapCount) why.push(`${name} 작은 누르는 곳 ${m.smallTapCount}개 — ${MIN_TAP}px 이상으로`);
  if (m?.hScroll) why.push(`${name} 옆으로 넘침`);
  if (m?.errors?.length) why.push(`${name} 화면 오류 ${m.errors.length}개`);
  if (m && m.safe === false) why.push(`${name} 안전 문장이 없음`);
  return why;
}
/** 샘플 찍기 · 재기 — {ok, pages[], why[]} */
export async function shootSample(folder, {data = null, executablePath = '/opt/pw-browsers/chromium'} = {}) {
  const dir = path.resolve(String(folder ?? ''));
  if (!folder || !fs.existsSync(path.join(dir, 'index.html'))) return {ok: false, pages: [], why: ['샘플 폴더에 index.html 이 없음 — ' + folder]};
  const routes = routesOf(data);
  if (routes.length < 3) return {ok: false, pages: [], why: ['자료에 첫 회사가 없어 회사 · 업종 쪽 길을 못 정함 — --data 를 주세요']};
  let browser = null; const pages = [], why = [];
  try {
    const {chromium} = createRequire('/opt/node-tools/')('playwright');
    browser = await chromium.launch({executablePath, args: ['--disable-dev-shm-usage']});
    for (const [name, hash] of routes) {
      const p = await browser.newPage({viewport: {width: 360, height: 780}, deviceScaleFactor: 1});
      const errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
      await p.goto('file://' + path.join(dir, 'index.html') + hash);
      await p.waitForTimeout(1600);
      const m = await p.evaluate(([SAFE_T, TAP]) => {
        const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        let min = 99;
        for (const el of document.querySelectorAll('body *')) {
          if (!vis(el) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          min = Math.min(min, parseFloat(getComputedStyle(el).fontSize));
        }
        const small = [...document.querySelectorAll('a,button,[role=button]')].filter(vis).filter(e => e.getBoundingClientRect().height < TAP - 0.5);
        return {minFont: min, smallTapCount: small.length, hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          height: document.documentElement.scrollHeight, safe: (document.body.innerText || '').includes(SAFE_T)};
      }, [SAFE, MIN_TAP]);
      await p.screenshot({path: path.join(dir, 'shot-' + name + '.png'), fullPage: true});
      const pg = {name, route: hash, ...m, errors: errs.slice(0, 3)};
      pages.push(pg); why.push(...measureWhy(name, pg));
      await p.close();
    }
  } catch (e) { why.push('찍지 못함 — ' + String(e?.message ?? e).slice(0, 160)); }
  finally { if (browser) await browser.close().catch(() => {}); }
  return {ok: !why.length, pages, why};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const say = (o, code) => { process.stdout.write(JSON.stringify(o) + '\n'); process.exit(code); };
  if (argv.includes('--snap')) {
    const out = arg('--out'); if (!out) say({ok: false, why: '--out 이 없음'}, 2);
    const r = snapFrom(arg('--dir', '.')); if (!r.ok) say(r, 1);
    fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true}); fs.writeFileSync(out, JSON.stringify(r.data, null, 1) + '\n');
    say({ok: true, out, asOf: r.data.asOf, mode: r.data.home.bloom.mode, bloom: r.data.home.bloom.rows.length, money: r.data.home.money.length, companies: r.data.companies.length, industries: r.data.industries.length, routes: routesOf(r.data).map(x => x[1])}, 0);
  } else if (argv.includes('--shoot')) {
    const folder = arg('--shoot'); if (!folder) say({ok: false, why: '--shoot <샘플 폴더> 가 없음'}, 2);
    let data = null; const dp = arg('--data'); if (dp) { try { data = JSON.parse(fs.readFileSync(dp, 'utf8')); } catch { say({ok: false, why: '--data 를 못 읽음 — ' + dp}, 2); } }
    const r = await shootSample(folder, {data}); say(r, r.ok ? 0 : 1);
  } else say({ok: false, why: '쓰는 법: --snap --dir . --out <파일> · --shoot <샘플 폴더> --data <파일>'}, 2);
}
