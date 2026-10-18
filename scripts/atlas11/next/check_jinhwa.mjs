#!/usr/bin/env node
// 진화 칸(#/jinhwa) · 합계 칸 신호 검사 — 사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [9] 1 ~ 10 · [10] 1 ~ 6 · [보고] 7 · 일꾼 KD
//   잣대 docs/design/kkolttori-2026-10-18/accept/KD.md · 화면 site/next/p-jinhwa.js · 서버 lib/atlas11/jinhwa.mjs · tally.mjs(시험 서버 scripts/atlas11/invite_dev.mjs 가 같은 셈으로 띄움)
//   쓰는 법: node scripts/atlas11/next/check_jinhwa.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 짧아서 늘 모두 돎) · 열쇠 = 환경 ATLAS_DEV_OWNER_KEY(없고 127.0.0.1 이면 시험 서버 열쇠 testowner-key-1234567890)
//   ① 문 밖(offDeviceOpens — 0 이어야 함): 열쇠 없음 · 깊은 주소 #/jinhwa/x · 짧은 열쇠 · 틀린 열쇠 · 서버가 「아님」(403 · 404) · 서버 못 닿음 · 보유종목 바로 가기(#/me)
//      = 진화 칸이 한 번이라도 그려진 수 + 「진화 칸」 줄이 붙은 수 + 창 제목에 「진화 칸」이 든 수 · 열쇠 없는 기기의 p-jinhwa 모듈 받은 수 · 끝 주소 #/ · 주소 기록 늘지 않음
//   ② 열쇠 기기(시험 서버만 — 진짜 사이트는 「?」): 시험 자료(/__dev/jinhwa-data 와 브라우저 바꿔치기 · 번호는 이번 검사만의 것)로
//      맨 위 본질 줄 = 자료 essence · 「진화 n번째」 · 기다리는 진화 카드 수 = waiting 수 · 카드마다 이름 · 전후 그림 둘 · 확인 단추 하나 · 섬기는 본질 · 세 사람 셋 · 어림 · pick 카드에만 「세 사람이 고른 것」
//      확인 → 「확인함 · 다음 업데이트 ○시에 들어가요」 꼴 + ○ = 진화 회차 차례 셈(p-jinhwa slotPlan) + 서버 confirmed · 다시 누름 → 「확인」 + withdrawn · 둘째 확인은 다음 업데이트
//      진화한 것(새 날짜부터 · 채점 글 · 되돌리기 → revert · 다시 → kept · 되돌린 것은 단추 없음) · 고친 고장 줄 수 · 잣대 셋(30 아래 「모으는 중」 · 참고 숫자 접힘)
//      빈 자료 「기다리는 진화 0」 · 자료 못 받음 「?」 · 상태 못 받음(단추 잠김 · 「?」) · 합계 못 받음 「?」 · 360×640 첫 화면(본질 줄 · n · 첫 카드 이름 · 그림 · 확인 단추가 아래 단추 줄 위)
//      세 폭(320 · 360 · 390) 옆 넘침 0 · 17px 아래 글 0 · 44px 안 되는 누름 자리 0 · 쓰지 않을 말 0 · 영어(en-src.json 그대로) 남은 한글 0 · 보유종목 「진화 칸」 줄 1 → 누르면 진화 칸
//   ③ 서버(시험 서버만): 열쇠 없는 쓰기 403 · 모르는 번호 404 · 들어간 것 확인 409 · status 칸 = {id, state, at} · 합계 POST {k} 204 · 다른 칸 400 · sum 열쇠 없이 참고 칸 없음 · 열쇠면 있음
//   ④ 신호(검사 표시 __kkTally · /api/tally 는 브라우저 안에서 받아 버림 — 진짜 합계에 안 섞임): 쪽 열 때 visit 한 번 · 매매일지 끝냄(쉬어 가자 → stop_rest · 아니면 stop) ·
//      한 달 답(했어 → promise_yes · 안 했어 → promise) · 몸 = {k} 하나 · 쿠키 · 넘겨준 주소 없음 · 검사 표시 없는 자동 브라우저는 0
//   실패가 하나라도 있으면 끝 코드 1 · 시험 서버인데 시험 길(/__dev/jinhwa-data)이 없으면 끝 코드 2(옛 판 시험 서버 — 다시 띄움) · 결과 맨 위 offDeviceOpens
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 창 제목 맞대기
import {screenHits} from '../../../site/next/words.js';
import {slotPlan, slotLabel} from '../../../site/next/p-jinhwa.js'; // 「○시」 기대 값 = 화면과 같은 셈(그 셈 자체는 tests/atlas11/jinhwa.test.mjs 가 진화 회차 차례와 맞댐)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null);
const ALL = argv.includes('--all'); // 받기만(늘 모두 돎)
const LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base);
const KEY = process.env.ATLAS_DEV_OWNER_KEY || (LOCAL ? 'testowner-key-1234567890' : null);
const OWNER = 'atlas11:invite:owner', ROUTE = '#/jinhwa', HOME = '#/', ME = '#/me';
const T0 = Date.now();
const R = {schema: 'kkolttori-check-jinhwa-1', at: new Date().toISOString(), base, mode: LOCAL ? 'local' : 'live', all: ALL, offDeviceOpens: null, off: [], key: '?', server: '?', beacon: '?', en: '?', counts: {pass: 0, fail: 0}, fails: [], warn: []};
const pass = () => { R.counts.pass++; };
const fail = (what, why) => { R.counts.fail++; R.fails.push(`${what} — ${why}`); console.log('실패 ' + what + ' — ' + why); };
const check = (ok, what, why = '') => (ok ? pass() : fail(what, why));
const warn = w => { R.warn.push(w); console.log('알림 ' + w); };
const url = (hash, q = '') => base + NEXT + q + hash;
const getJ = async (p, o = {}) => { const r = await fetch(base + p, {cache: 'no-store', ...o}); return {status: r.status, body: await r.json().catch(() => null)}; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── 시험 자료(이번 검사만의 번호 · 본질 줄은 본질 파일 첫 줄) ── */
const NONCE = Date.now().toString(36);
const ID = k => `jh${NONCE}-${k}`;
const ESS = (await fs.readFile(path.join(ROOT, 'docs/골똘이_본질.md'), 'utf8')).split('\n').find(l => /^1\.\s/.test(l))?.replace(/^1\.\s*/, '').trim() ?? '?';
const iso = t => new Date(t).toISOString(), DAY = 864e5;
const card = (k, o = {}) => {
  const id = ID('w' + k);
  return {id, title: `시험 대안 ${k} — 질문 글 한 줄을 더 짧게`, pick: !!o.pick, serves: '두 본질 2 ① 「왜 사?」 열한 질문으로 내 이유를 확인한다', before: `data/jinhwa/${id}-before.png`, after: `data/jinhwa/${id}-after.png`,
    voices: {kahneman: '더 빨리 사게 하지 않아요.', munger: '망치는 길에 닿지 않아요.', popper: '틀리면 되돌릴 조건이 있어요.'},
    predict: {text: '멈춤 수가 늘어요', measure: 'stop', days: 10}, revert: '멈춤 수가 줄면 되돌려요', premortem: '1년 뒤 실패했다면 글이 길어서', big: !!o.big, risks: o.risks ?? [], branch: `jinhwa/check-${k}`, files: ['site/next/p-why.js'], checks: {changed: 0, preview: 0}};
};
const done = (k, at, o = {}) => ({id: ID(k), title: `시험 진화 ${k}`, at: iso(at), before: `data/jinhwa/${ID(k)}-before.png`, after: `data/jinhwa/${ID(k)}-after.png`, predict: {text: '멈춤 수가 늘어요', measure: 'stop', days: 10}, score: {at: null, ok: null, text: '채점 전 — 들어간 뒤 10거래일이 지나면 매겨요'}, ...o});
const NOW = Date.now();
const FIX = {schema: 'kkolttori-jinhwa-1', made: iso(NOW), essence: ESS, n: 3, next: iso(NOW + 3600e3),
  waiting: [card(1, {pick: true}), card(2), card(3, {big: true, risks: ['위험 한 줄 하나', '위험 한 줄 둘']})],
  applied: [done('a20', NOW - 20 * DAY, {score: {at: iso(NOW - DAY), ok: true, text: '들어가기 전보다 나아졌어요'}}), done('a10', NOW - 10 * DAY, {reverted: {at: iso(NOW - 5 * DAY)}}), done('a2', NOW - 2 * DAY)], // 회차 꼴 = 오래된 것부터
  fixed: [{at: iso(NOW - 3 * DAY), what: '시험 고장 — 깨진 고리 하나'}, {at: iso(NOW - DAY), what: '시험 고장 — 날짜 「?」'}],
  facts: {mismatch: 0, at: iso(NOW - 3600e3)}};
const EMPTY = {...FIX, n: 0, waiting: [], applied: [], fixed: [], facts: {mismatch: null, at: null}};
const [W1, W2, W3] = FIX.waiting.map(w => w.id), A2 = ID('a2'), A10 = ID('a10'), A20 = ID('a20');
/** 작은 PNG(72 × 128 · 한 색) — 전후 그림 바꿔치기 */
function png(w, h, rgb) {
  const tab = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xffffffff; for (const x of b) c = tab[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'latin1'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  const row = Buffer.alloc(1 + w * 3); for (let i = 0; i < w; i++) row.set(rgb, 1 + i * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(Buffer.concat(Array.from({length: h}, () => row)))), chunk('IEND', Buffer.alloc(0))]);
}
const PNG = png(72, 128, [70, 110, 160]);

/* ── 브라우저 ── */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** 새 칸 — key = 이 기기 열쇠(null 이면 없음) · test = 신호 검사 표시 · watch = 진화 칸 그려짐 · 줄 · 제목을 처음부터 셈 */
async function ctxOf({w = 360, h = 640, key = null, test = false, recs = null} = {}) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, serviceWorkers: 'block'});
  await ctx.addInitScript(([k, ownerK, t, rs]) => {
    try { if (k != null) localStorage.setItem(ownerK, k); if (rs) localStorage.setItem('atlas:godori-why', JSON.stringify(rs)); } catch { /* 기억 못 하는 쪽 */ }
    if (t) window.__kkTally = 'test';
    const seen = window.__jhSeen = {drawn: 0, row: 0, title: 0};
    const look = n => { if (n.nodeType !== 1) return; if (n.matches('.jh, [data-page="jinhwa"]') || n.querySelector('.jh, [data-page="jinhwa"]')) seen.drawn++; if (n.matches('a.jh-row') || n.querySelector('a.jh-row')) seen.row++; };
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) look(n); if (/진화 칸/.test(document.title)) seen.title++; }).observe(document, {childList: true, subtree: true, characterData: true});
  }, [key, OWNER, test, recs]);
  return ctx;
}
/** 쪽 하나 — 화면 오류 · 요청을 셈 */
async function pageOf(ctx) {
  const p = await ctx.newPage(), net = {mod: 0, api: [], tally: [], errs: []};
  p.on('request', q => { const u = q.url(); if (/\/next\/p-jinhwa\.js(\?|$)/.test(u)) net.mod++; if (/\/api\/jinhwa\//.test(u)) net.api.push(u.replace(base, '')); });
  p.on('pageerror', e => net.errs.push('pageerror ' + String(e.message).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) net.errs.push('console ' + m.text().slice(0, 160)); });
  p.net = net;
  return p;
}
const settle = p => p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 15000}).catch(() => {});
const seen = p => p.evaluate(() => ({...window.__jhSeen, hash: location.hash, hist: history.length, docTitle: document.title}));

/* ── ① 문 밖 ── */
const offCases = [
  {name: '열쇠 없음', key: null, hash: ROUTE},
  {name: '깊은 주소 #/jinhwa/x', key: null, hash: ROUTE + '/x'},
  {name: '짧은 열쇠', key: 'short', hash: ROUTE},
  {name: '틀린 열쇠', key: 'wrong-key-000000000000000000', hash: ROUTE, live: true},
  {name: '서버가 아님(403)', key: KEY ?? 'any-key-0000000000000000', hash: ROUTE, me: 403},
  {name: '서버에 길 없음(404)', key: KEY ?? 'any-key-0000000000000000', hash: ROUTE, me: 404},
  {name: '서버 못 닿음', key: KEY ?? 'any-key-0000000000000000', hash: ROUTE, me: 'abort'},
  {name: '보유종목 바로 가기 · 열쇠 없음', key: null, hash: ME},
  {name: '보유종목 바로 가기 · 틀린 열쇠', key: 'wrong-key-000000000000000000', hash: ME},
  {name: '보유종목 바로 가기 · 서버 못 닿음', key: KEY ?? 'any-key-0000000000000000', hash: ME, me: 'abort'},
  {name: '앱 안에서 #/jinhwa 로 감 · 열쇠 없음', key: null, hash: ROUTE, inApp: true},
  {name: '앱 안에서 #/jinhwa 로 감 · 틀린 열쇠', key: 'wrong-key-000000000000000000', hash: ROUTE, inApp: true},
];
let offOpens = 0, hist0 = null;
{ const ctx = await ctxOf({}), p = await ctx.newPage(); await p.goto(url(HOME), {waitUntil: 'domcontentloaded'}); hist0 = await p.evaluate(() => history.length); await ctx.close(); } // 바로 연 쪽의 주소 기록 수(브라우저 빈 쪽 포함)
for (const c of offCases) {
  const ctx = await ctxOf({key: c.key}), p = await pageOf(ctx);
  try {
    if (c.me) await p.route(/\/api\/jinhwa\/me(\?|$)/, r => (c.me === 'abort' ? r.abort('connectionrefused') : r.fulfill({status: c.me, contentType: 'application/json', body: '{"error":"x"}'})));
    else if (!LOCAL && !c.live) await p.route(/\/api\/jinhwa\//, r => r.fulfill({status: 403, contentType: 'application/json', body: '{"error":"owner_only"}'})); // 진짜 사이트에 묻지 않음(틀린 열쇠 한 길만 진짜로)
    let wantHist = hist0;
    if (c.inApp) { await p.goto(url(HOME), {waitUntil: 'domcontentloaded'}); await settle(p); wantHist = (await p.evaluate(() => history.length)) + 1; await p.evaluate(h => { location.hash = h; }, c.hash); await sleep(300); } // 고리를 누른 것처럼 — 기록 하나가 늘고 그 자리가 #/ 로 바뀜(#/jinhwa 는 안 남음)
    else await p.goto(url(c.hash), {waitUntil: 'domcontentloaded'});
    await settle(p);
    if (c.hash === ME) await p.waitForSelector('#view .hd-sc', {timeout: 15000}).catch(() => fail('보유종목 바로 가기 칸', c.name + ' — 칸이 안 그려짐'));
    await sleep(c.hash === ME ? 1500 : 900);
    const s = await seen(p), n = s.drawn + s.row + s.title;
    offOpens += n;
    const row = {name: c.name, opens: n, drawn: s.drawn, row: s.row, title: s.title, hash: s.hash, hist: s.hist, mod: p.net.mod, api: p.net.api.length};
    R.off.push(row);
    check(n === 0, '[9] 1 문 밖에서 진화 칸 · 줄 · 제목 0', `${c.name} ${JSON.stringify(row)}`);
    if (c.hash !== ME) { check(s.hash === HOME, '문 밖 → 첫 화면(#/)', `${c.name} 「${s.hash}」`); check(s.hist === wantHist, '문 밖 — 주소 기록에 #/jinhwa 가 남지 않음(바꿔 씀)', `${c.name} history ${s.hist} ≠ ${wantHist}`); }
    if (!c.key || c.key === 'short') { check(p.net.mod === 0, '열쇠 없는 기기는 진화 칸 모듈을 받지 않음', `${c.name} ${p.net.mod}번`); check(p.net.api.length === 0, '열쇠 없는 기기는 서버에 묻지 않음', `${c.name} ${p.net.api.join(' ')}`); }
    check(!p.net.errs.length, '화면 오류 0', `${c.name} ${p.net.errs.join(' | ')}`);
  } catch (e) { fail('문 밖 판 멈춤', `${c.name}: ${String(e.message).split('\n')[0]}`); }
  await ctx.close();
}
R.offDeviceOpens = offOpens;
console.log(`문 밖 ${offCases.length}길 · 진화 칸이 열린 수 ${offOpens}`);

/* ── ② · ③ 열쇠 기기 · 서버(시험 서버만) ── */
const hook = LOCAL ? await fetch(base + '/__dev/jinhwa-data', {method: 'DELETE'}).then(r => r.status).catch(() => 0) : 0;
let keyCode = 0;
if (!LOCAL) { R.key = R.server = R.en = '? 진짜 사이트 — 사장님 열쇠가 없어 열쇠 길은 못 봄'; }
else if (hook !== 200 || !KEY) { R.key = R.server = R.en = `? 시험 서버에 진화 칸 시험 길이 없음(${hook}) — scripts/atlas11/invite_dev.mjs 를 다시 띄우면 봄`; keyCode = 2; console.log('못 봄 ' + R.key); }
else {
  const setData = d => fetch(base + '/__dev/jinhwa-data', {method: 'POST', body: JSON.stringify(d)});
  const status = async () => new Map(((await getJ('/api/jinhwa/status')).body?.items ?? []).map(x => [x.id, x]));
  const H = {'content-type': 'application/json', 'x-atlas-owner': KEY};
  const post = (op, id, h = H) => fetch(`${base}/api/jinhwa/${op}`, {method: 'POST', headers: h, body: JSON.stringify({id})}).then(async r => ({status: r.status, body: await r.json().catch(() => null)}));
  /** 열쇠 기기 쪽 — jdata = 브라우저가 받는 진화 자료(null = 404) · st · sum = 상태 · 합계 바꿔치기(null 이면 서버 그대로) */
  async function keyPage({w = 360, h = 640, jdata = FIX, st = null, sum = null, en = false, hash = ROUTE} = {}) {
    const ctx = await ctxOf({w, h, key: KEY}), p = await pageOf(ctx);
    await p.route(/\/next\/data\/jinhwa\.json(\?|$)/, r => (jdata ? r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(jdata)}) : r.fulfill({status: 404, body: 'not found'})));
    await p.route(/\/next\/data\/jinhwa\/[^/]+\.png(\?|$)/, r => (/-(w1|a2)-(before|after)\.png/.test(r.request().url()) ? r.fulfill({status: 200, contentType: 'image/png', body: PNG}) : r.fulfill({status: 404, body: ''}))); // 둘째 · 셋째 카드는 「? 그림 없음」 길
    if (st) await p.route(/\/api\/jinhwa\/status(\?|$)/, r => r.fulfill(st));
    if (sum) await p.route(/\/api\/tally\/sum/, r => r.fulfill(sum));
    if (en) {
      const S = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8'));
      const body = JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 'check_jinhwa — en-src.json 그대로', entities: S.entities, templates: S.templates});
      await p.route(/\/next\/i18n\/en\.json(\?|$)/, r => r.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body}));
    }
    await p.goto(url(hash, en ? '&lang=en' : ''), {waitUntil: 'domcontentloaded'});
    if (hash === ROUTE) await p.waitForSelector('#view .jh', {timeout: 15000});
    return {ctx, p};
  }
  const MODEL = () => {
    const q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)], tx = e => e?.textContent.trim() ?? null;
    const root = q('#view .jh');
    return root && {
      ess: tx(q('.jh-ess', root)), essKo: q('.jh-ess', root)?.getAttribute('lang'), n: tx(q('.jh-n', root)), h2: qa('h2.sec', root).map(tx), notes: qa('.note', root).map(tx),
      cards: qa('.jh-card', root).map(c => ({id: c.dataset.id, name: tx(q('.jh-name', c)), figs: qa('figure.jh-fig', c).length, img: qa('img.jh-img', c).length, noimg: qa('.jh-noimg', c).length, btns: qa('button', c).length, ok: tx(q('.jh-ok', c)), dis: !!q('.jh-ok', c)?.disabled,
        badge: tx(q('.jh-badge', c)), big: tx(q('.jh-bigt', c)), voices: qa('ul.jh-voices li', c).map(tx), lines: qa('.jh-line', c).map(tx), risks: qa('.jh-risk', c).length})),
      done: qa('.jh-done', root).map(d => ({id: d.dataset.id, dd: tx(q('.jh-dd', d)), score: tx(q('.jh-score', d)), rv: tx(q('.jh-rv', d)), text: tx(d)})),
      fix: qa('ul.jh-fix li', root).map(tx), ms: qa('.jh-ms > p.jh-m', root).map(tx), few: qa('.jh-ms .jh-few', root).length, ref: !!q('details.jh-ref', root), refOpen: !!q('details.jh-ref[open]', root),
      title: document.title, hash: location.hash};
  };
  const LAYOUT = () => {
    const root = document.querySelector('#view .jh'); if (!root) return null;
    const vw = innerWidth, small = [], tiny = [], out = [], words = [];
    for (const el of root.querySelectorAll('*')) {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim()).map(n => n.nodeValue.trim()).join(' ');
      if (own && parseFloat(cs.fontSize) < 16.95) small.push(`${el.tagName.toLowerCase()}.${el.className} ${cs.fontSize} 「${own.slice(0, 24)}」`);
      if (own && !el.closest('[lang="ko"], [data-proper]')) words.push(own);
      if (el.matches('a[href], button, summary, input, select, textarea, [role="button"]') && (r.height < 43.5 || r.width < 43.5)) tiny.push(`${el.tagName.toLowerCase()}.${el.className} ${Math.round(r.width)}×${Math.round(r.height)} 「${el.textContent.trim().slice(0, 20)}」`);
      if (r.right > vw + 0.5 || r.left < -0.5) { let a = el.parentElement, clip = false; while (a && a !== document.body) { if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) { clip = true; break; } a = a.parentElement; } if (!clip) out.push(`${el.tagName.toLowerCase()}.${el.className} ${Math.round(r.left)}~${Math.round(r.right)}`); }
    }
    const tabs = document.querySelector('.tabs')?.getBoundingClientRect().top ?? innerHeight, bot = s => root.querySelector(s)?.getBoundingClientRect().bottom ?? Infinity;
    return {vw, sw: document.scrollingElement.scrollWidth, small, tiny, out, words, fold: {tabs, ess: bot('.jh-ess'), n: bot('.jh-n'), name: bot('.jh-card .jh-name'), pics: bot('.jh-card .jh-pics'), ok: bot('.jh-card .jh-ok')}};
  };
  const want = async (items, sets) => { const t = Date.now(); return [t, t - 15e3].map(now => { const plan = slotPlan(items, now, sets); return id => slotLabel(id.includes('-a') ? 'revert' : 'confirm', plan.get(id) ?? null, now); }); };
  const setsOf = d => ({waiting: new Set(d.waiting.map(w => w.id)), applied: new Set(d.applied.filter(a => !a.reverted).map(a => a.id))});
  try {
    await setData(FIX);
    // ② 맨 위 · 카드 · 첫 화면 · 모양(360 × 640)
    let {ctx, p} = await keyPage();
    await p.waitForFunction(() => document.querySelectorAll('#view .jh .jh-card .jh-ok').length > 0 && !document.querySelector('#view .jh .jh-card .jh-ok[disabled]'), null, {timeout: 10000}).catch(() => {});
    let M = await p.evaluate(MODEL);
    const pos = await seen(p);
    check(pos.drawn >= 1 && pos.title >= 1, '문 밖 셈의 맞는 짝 — 열쇠 기기에서는 같은 셈이 진화 칸 · 제목을 셈(셈이 헛돌지 않음)', JSON.stringify(pos));
    check(M.ess === ESS && M.essKo === 'ko', '[9] 2 맨 위 본질 한 줄 = 자료 essence(사장님 글 그대로 · 바꾸지 않음)', `「${M.ess}」`);
    check(M.n === `진화 ${FIX.n}번째`, '[9] 2 「진화 n번째」 = 자료 n', `「${M.n}」`);
    check(M.title === '진화 칸 · ' + NEW_NAME, '창 제목', `「${M.title}」`);
    check(M.h2[0] === `기다리는 진화 ${FIX.waiting.length}` && M.cards.length === FIX.waiting.length, '[9] 3 기다리는 진화 카드 수 = waiting 수', `${M.h2[0]} · ${M.cards.length}`);
    check(JSON.stringify(M.cards.map(c => c.id)) === JSON.stringify([W1, W2, W3]), '카드 차례 = 자료 차례(1번 = 세 사람이 고른 것)', M.cards.map(c => c.id).join());
    for (const [i, c] of M.cards.entries()) {
      const w = FIX.waiting[i];
      check(c.name === w.title && c.figs === 2 && c.btns === 1 && c.ok === '확인' && c.voices.length === 3, '[9] 3 · 4 카드마다 이름 · 전후 그림 둘 · 확인 단추 하나 · 세 사람 셋', JSON.stringify(c).slice(0, 300));
      check(c.voices.join('|') === `카너먼 ${w.voices.kahneman}|멍거 ${w.voices.munger}|포퍼 ${w.voices.popper}`, '세 사람 한마디 = 자료', c.voices.join('|'));
      check(c.lines.some(l => l === `섬기는 본질 ${w.serves}`) && c.lines.some(l => l === `어림 ${w.predict.text}`) && c.lines.some(l => l === `되돌릴 조건 ${w.revert}`) && c.lines.some(l => l === `사전 부검 ${w.premortem}`), '섬기는 본질 · 어림 · 되돌릴 조건 · 사전 부검', c.lines.join(' | ').slice(0, 300));
      check((c.badge === '세 사람이 고른 것') === !!w.pick, '[9] 3 「세 사람이 고른 것」은 1번에만', `${i + 1}번 「${c.badge}」`);
      check(w.big ? c.big === '큰 것' && c.risks === 2 : !c.big && !c.risks, '[8] 8 큰 것 꼬리표 + 위험 두 줄', `${i + 1}번 ${c.big} ${c.risks}`);
    }
    check(M.cards[0].img === 2 && M.cards[1].noimg === 2, '전후 그림 — 받으면 그림 · 못 받으면 「? 그림 없음」', `${M.cards[0].img} · ${M.cards[1].noimg}`);
    let L = await p.evaluate(LAYOUT);
    const F = L.fold;
    check(Math.max(F.ess, F.n, F.name, F.pics, F.ok) <= F.tabs + 0.5, '[9] 10 360 × 640 첫 화면 = 본질 줄 · n · 첫 카드 이름 · 그림 · 확인 단추가 아래 단추 줄 위', JSON.stringify(F));
    R.key = {fold: F};
    // 확인 → 확인함(○시) → 서버 confirmed · 다시 누름 → 거둠 · 둘째 확인 → 다음 업데이트
    const st0 = await status();
    check(!st0.has(W1) && !st0.has(W2), '[9] 4 누르기 전 서버 상태 없음', [...st0.keys()].join());
    const click = async (sel, re) => { await p.locator(sel).click({timeout: 8000}); await p.waitForFunction(([s, r]) => new RegExp(r).test(document.querySelector(s)?.textContent ?? '') && !document.querySelector(s)?.disabled, [sel, re], {timeout: 8000}); return (await p.textContent(sel)).trim(); };
    const sel = (cls, id) => `#view .jh [data-id="${id}"] .${cls}`;
    let t1 = await click(sel('jh-ok', W1), '^확인함 · ');
    let st = await status();
    check(st.get(W1)?.state === 'confirmed', '[9] 4 확인 → 서버 confirmed(사장님 열쇠로 적음)', JSON.stringify(st.get(W1)));
    check(/^확인함 · (다음 업데이트 \d{1,2}시에|\d{1,2}시 업데이트에|\d{1,2}월 \d{1,2}일 \d{1,2}시 업데이트에) 들어가요$/.test(t1), '[9] 4 「확인함 · 다음 업데이트 ○시에 들어가요」 꼴', `「${t1}」`);
    let W = await want([...st.values()], setsOf(FIX));
    check(W.some(f => f(W1) === t1), '「○시」 = 진화 회차 차례 셈(회차 = 업데이트 30분 전 · 하나씩)', `「${t1}」 · 기대 「${W[0](W1)}」`);
    const t2 = await click(sel('jh-ok', W2), '^확인함 · ');
    st = await status(); W = await want([...st.values()], setsOf(FIX));
    check(st.get(W2)?.state === 'confirmed' && W.some(f => f(W2) === t2) && t2 !== t1, '[1] 5 둘째 확인은 다음 업데이트(업데이트마다 하나)', `「${t1}」 · 「${t2}」 · 기대 「${W[0](W2)}」`);
    t1 = await click(sel('jh-ok', W1), '^확인$');
    st = await status();
    check(st.get(W1)?.state === 'withdrawn', '[9] 5 들어가기 전 다시 누름 → 확인을 거둠(withdrawn)', JSON.stringify(st.get(W1)));
    const t2b = (await p.textContent(sel('jh-ok', W2))).trim(); W = await want([...st.values()], setsOf(FIX));
    check(W.some(f => f(W2) === t2b), '거둔 뒤 남은 확인의 「○시」를 다시 셈', `「${t2b}」 · 기대 「${W[0](W2)}」`);
    // 진화한 것 — 새 날짜부터 · 채점 글 · 되돌리기 · 되돌린 것
    M = await p.evaluate(MODEL);
    check(JSON.stringify(M.done.map(d => d.id)) === JSON.stringify([A2, A10, A20]), '[9] 6 진화한 것 — 날짜 차례(새 날짜부터)', M.done.map(d => d.id).join());
    check(M.h2.includes(`진화한 것 ${FIX.applied.length}`), '「진화한 것 n」', M.h2.join(' | '));
    const dA2 = M.done[0], dA10 = M.done[1], dA20 = M.done[2];
    check(/^\d{1,2}월 \d{1,2}일 들어감$/.test(dA2.dd ?? ''), '[9] 6 들어간 날짜', `「${dA2.dd}」`);
    check(dA2.score === '채점 전 — 들어간 뒤 10거래일이 지나면 매겨요' && dA20.score === '10거래일 뒤 · 맞았어요 — 들어가기 전보다 나아졌어요', '[10] 6 10거래일 뒤 채점 글(아직 · 맞았어요)', `「${dA2.score}」 · 「${dA20.score}」`);
    check(dA2.rv === '되돌리기' && dA20.rv === '되돌리기' && dA10.rv == null && /되돌렸어요 · \d{1,2}월 \d{1,2}일/.test(dA10.text), '[9] 6 되돌리기 단추(되돌린 것은 단추 없이 「되돌렸어요 · 날짜」)', `${dA2.rv} · ${dA10.rv} · ${dA20.rv}`);
    const r1 = await click(sel('jh-rv', A2), '^되돌리기 함 · ');
    st = await status(); W = await want([...st.values()], setsOf(FIX));
    check(st.get(A2)?.state === 'revert' && W.some(f => f(A2) === r1), '[9] 6 되돌리기 → 서버 revert · 「되돌리기 함 · 다음 업데이트 ○시에 되돌려요」', `${JSON.stringify(st.get(A2))} 「${r1}」 · 기대 「${W[0](A2)}」`);
    const t2c = (await p.textContent(sel('jh-ok', W2))).trim(); W = await want([...st.values()], setsOf(FIX));
    check(W.some(f => f(W2) === t2c), '되돌리기가 먼저 — 확인은 그다음 업데이트로(진화 회차 차례)', `「${t2c}」 · 기대 「${W[0](W2)}」`);
    await click(sel('jh-rv', A2), '^되돌리기$');
    st = await status();
    check(st.get(A2)?.state === 'kept', '되돌리기를 다시 눌러 거둠(kept)', JSON.stringify(st.get(A2)));
    // 고친 고장 · 잣대 셋
    check(M.fix.length === FIX.fixed.length && M.h2.includes(`고친 고장 ${FIX.fixed.length}`) && /시험 고장 — 날짜/.test(M.fix[0]), '[9] 7 고친 고장 줄 수 = fixed 수(새 날짜부터)', M.fix.join(' | '));
    check(M.ms.length === 3 && /^① 멈춤 /.test(M.ms[0]) && /^② 약속 /.test(M.ms[1]) && /^③ 사실 화면 숫자가 자료와 다른 곳 0곳 · \d{1,2}월 \d{1,2}일 기준$/.test(M.ms[2]), '[10] 1 잣대 셋(멈춤 · 약속 · 사실)', M.ms.join(' | '));
    check(M.ref && !M.refOpen, '[10] 2 참고 숫자는 접힌 칸(잣대가 아님)', `${M.ref} ${M.refOpen}`);
    L = await p.evaluate(LAYOUT);
    for (const [k, v] of [['small', '17px 아래 글'], ['tiny', '44px 안 되는 누름 자리'], ['out', '화면 밖으로 나간 칸']]) check(!L[k].length, `[9] 10 ${v} 0(360)`, L[k].slice(0, 4).join(' | '));
    const sw = L.words.flatMap(t => screenHits(t).map(w => `「${t.slice(0, 30)}」 ${w}`));
    check(!sw.length, '쓰지 않을 말 0(진화 칸 내 글)', sw.slice(0, 3).join(' | '));
    check(!p.net.errs.length, '화면 오류 0(열쇠 기기)', p.net.errs.join(' | '));
    await ctx.close();
    // 세 폭 넘침 · 모양
    for (const w of [320, 390]) {
      ({ctx, p} = await keyPage({w}));
      L = await p.evaluate(LAYOUT);
      check(L.sw <= L.vw && !L.out.length && !L.small.length && !L.tiny.length, `[9] 10 ${w}폭 — 옆 넘침 · 화면 밖 · 17px · 44px 0`, JSON.stringify({sw: L.sw, vw: L.vw, out: L.out.slice(0, 2), small: L.small.slice(0, 2), tiny: L.tiny.slice(0, 2)}));
      await ctx.close();
    }
    // 빈 자료 · 자료 못 받음 · 상태 못 받음 · 합계 못 받음 · 합계 30 문턱
    ({ctx, p} = await keyPage({jdata: EMPTY}));
    M = await p.evaluate(MODEL);
    check(M.h2[0] === '기다리는 진화 0' && M.cards.length === 0 && M.notes.includes('기다리는 진화가 없어요. 다음 진화 회차가 대안 셋을 올려요.') && M.h2.includes('진화한 것 0') && M.h2.includes('고친 고장 0') && M.n === '진화 0번째', '빈 칸은 정직하게(「기다리는 진화 0」)', M.h2.join(' | '));
    check(/^③ 사실 화면 숫자가 자료와 다른 곳 \?$/.test(M.ms[2] ?? ''), '사실 잣대를 모르면 「?」', `「${M.ms[2]}」`);
    await ctx.close();
    ({ctx, p} = await keyPage({jdata: null}));
    M = await p.evaluate(MODEL);
    check(M.ess === '?' && M.n === '진화 ?번째' && M.h2[0] === '기다리는 진화 ?' && M.notes.includes('? 진화 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'), '자료 못 받음 → 「?」', `${M.ess} · ${M.n} · ${M.h2[0]}`);
    await ctx.close();
    ({ctx, p} = await keyPage({st: {status: 500, contentType: 'application/json', body: '{"error":"server"}'}}));
    M = await p.evaluate(MODEL);
    check(M.cards.every(c => c.dis) && M.notes.includes('? 확인 상태를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'), '상태를 못 받으면 단추를 잠그고 「?」(모르고 누르지 않게)', M.cards.map(c => c.dis).join());
    await ctx.close();
    ({ctx, p} = await keyPage({sum: {status: 500, contentType: 'application/json', body: '{}'}}));
    M = await p.evaluate(MODEL);
    check(M.ms[0] === '? 합계를 받지 못했어요.', '합계를 못 받으면 「?」', `「${M.ms[0]}」`);
    await ctx.close();
    const SUM = {schema: 'kkolttori-tally-1', tz: 'Asia/Seoul', to: '2026-10-19', n: 14, days: [], total: {stop: 12, stop_rest: 3, promise: 40, promise_yes: 31}, ref: [], refTotal: {visit: 100, share: 4, signup: 2}};
    ({ctx, p} = await keyPage({sum: {status: 200, contentType: 'application/json', body: JSON.stringify(SUM)}}));
    M = await p.evaluate(MODEL);
    check(M.ms[0] === '① 멈춤 매매일지를 끝낸 수 12번 · 그중 「오늘은 쉬어 가자」 3번 · 모으는 중' && M.ms[1] === '② 약속 「그날 정한 대로 했어?」에 답한 수 40번 · 그중 「했어」 31번' && M.few === 1, '[10] 5 표본 30 아래는 「모으는 중」 · 넘으면 그대로(판단 글 없음)', M.ms.slice(0, 2).join(' | '));
    await ctx.close();
    // 영어(en-src.json 그대로) — 진화 칸 안 남은 한글 0(사장님 글 · 회차 글 lang="ko" 빼고)
    ({ctx, p} = await keyPage({en: true}));
    await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 10000}).catch(() => {});
    await sleep(400);
    const left = await p.evaluate(() => {
      const out = [], root = document.querySelector('#view .jh'), HAN = /[가-힣]/;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (HAN.test(n.nodeValue) && !n.parentElement.closest('[lang="ko"], [data-proper], script, style')) out.push(n.nodeValue.trim().slice(0, 40));
      for (const el of root.querySelectorAll('[aria-label], [alt], [title]')) for (const a of ['aria-label', 'alt', 'title']) { const v = el.getAttribute(a); if (v && HAN.test(v) && !el.closest('[lang="ko"]')) out.push(`${a}=${v.slice(0, 40)}`); }
      if (HAN.test(document.title.replace(/골똘이/g, ''))) out.push('title=' + document.title);
      return out;
    });
    R.en = {left: left.length};
    check(!left.length, '영어 — 진화 칸 안 남은 한글 0(사전 = en-src.json)', left.slice(0, 6).join(' | '));
    await ctx.close();
    // 보유종목 「진화 칸」 줄 — 열쇠 기기에서만 하나 · 누르면 진화 칸
    ({ctx, p} = await keyPage({hash: ME}));
    await p.waitForSelector('#view .hd-sc a.jh-row', {timeout: 10000}).catch(() => {});
    const rows = await p.locator('#view a.jh-row').count();
    check(rows === 1, '[9] 1 열쇠 기기 보유종목 바로 가기에 「진화 칸」 줄 하나', `${rows}줄`);
    check((await seen(p)).row >= 1, '문 밖 셈의 맞는 짝 — 열쇠 기기에서는 같은 셈이 「진화 칸」 줄을 셈', JSON.stringify(await seen(p)));
    if (rows === 1) { await p.locator('#view a.jh-row').click(); await p.waitForSelector('#view .jh', {timeout: 10000}).catch(() => {}); check(await p.locator('#view .jh').count() === 1, '「진화 칸」 줄 → 진화 칸', await p.evaluate(() => location.hash)); }
    await ctx.close();
    // ③ 서버
    const sv = {};
    sv.noKey = (await post('confirm', W3, {'content-type': 'application/json'})).status;
    sv.wrongKey = (await post('confirm', W3, {'content-type': 'application/json', 'x-atlas-owner': 'wrong-key-000000000000000000'})).status;
    sv.unknown = (await post('confirm', ID('nope'))).status;
    sv.appliedConfirm = (await post('confirm', A20)).body?.error;
    sv.revertedRevert = (await post('revert', A10)).body?.error;
    sv.withdrawNever = (await post('withdraw', W3)).body?.error;
    const items = (await getJ('/api/jinhwa/status')).body?.items ?? [];
    sv.statusKeys = [...new Set(items.map(x => Object.keys(x).join(',')))];
    check(sv.noKey === 403 && sv.wrongKey === 403, '[9] 8 열쇠 없는 · 틀린 열쇠 쓰기 403', `${sv.noKey} · ${sv.wrongKey}`);
    check(sv.unknown === 404, '자료에 없는 번호 404', String(sv.unknown));
    check(sv.appliedConfirm === 'applied' && sv.revertedRevert === 'reverted' && sv.withdrawNever === 'not_confirmed', '들어간 것 · 되돌린 것 · 확인 안 한 것은 못 바꿈(409)', JSON.stringify(sv));
    check(JSON.stringify(sv.statusKeys) === '["id,state,at"]', '[9] 8 열쇠 없는 읽기 = 번호 · 상태 · 때 셋뿐', JSON.stringify(sv.statusKeys));
    const s0 = (await getJ('/api/tally/sum?days=1', {headers: {'x-atlas-owner': KEY}})).body;
    sv.tallyOk = await fetch(base + '/api/tally', {method: 'POST', headers: {'content-type': 'application/json'}, body: '{"k":"share"}'}).then(r => r.status);
    sv.tallyBad = await fetch(base + '/api/tally', {method: 'POST', headers: {'content-type': 'application/json'}, body: '{"k":"share","who":"x"}'}).then(r => r.status);
    const s1 = (await getJ('/api/tally/sum?days=1', {headers: {'x-atlas-owner': KEY}})).body, pub = (await getJ('/api/tally/sum?days=1')).body;
    check(sv.tallyOk === 204 && sv.tallyBad === 400 && s1?.refTotal?.share === (s0?.refTotal?.share ?? -9) + 1, '[10] 3 합계 POST {k} 204 · 다른 칸 400 · 숫자만 하나 늚', JSON.stringify({sv: [sv.tallyOk, sv.tallyBad], before: s0?.refTotal, after: s1?.refTotal}));
    check(pub && !('ref' in pub) && !('refTotal' in pub) && Array.isArray(pub.days) && typeof pub.days[0]?.day === 'string', '[10] 2 열쇠 없는 합계 읽기 = 잣대 칸만(참고 칸 없음 · 날 칸 day)', JSON.stringify(pub).slice(0, 200));
    R.server = sv;
  } catch (e) { fail('열쇠 기기 판 멈춤', String(e.message).split('\n')[0]); }
  await setData(null).catch(() => {}); await fetch(base + '/__dev/jinhwa-data', {method: 'DELETE'}).catch(() => {});
}

/* ── ④ 신호 ── */
const hasTally = await fetch(base + '/next/tally.js', {cache: 'no-store'}).then(r => r.ok).catch(() => false);
if (!hasTally) R.beacon = '? 이 사이트에 합계 칸 신호(/next/tally.js)가 아직 없음';
else {
  const B = {};
  const tap = async p => { const got = []; await p.route(/\/api\/tally(\?|$)/, r => { const q = r.request(); got.push({body: q.postData(), cookie: q.headers().cookie ?? null, ref: q.headers().referer ?? null, method: q.method()}); r.fulfill({status: 204, body: ''}); }); return got; };
  const ks = got => got.map(g => { try { const o = JSON.parse(g.body); return Object.keys(o).length === 1 ? o.k : 'bad'; } catch { return 'bad'; } });
  const code = await (async () => { const m = (await getJ('/atlas/data/mkt.json')).body?.companies ?? {}; return m['005930'] ? '005930' : Object.keys(m)[0]; })();
  /** 매매일지 끝까지 — 답 k 번째(0 = 모두 초록 · 2 = 모두 빨강 → 「오늘은 쉬어 가자」) */
  async function journal(p, k) {
    await p.goto(url('#/why/' + code), {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => { const e = document.querySelector('#view .wy-stk:not([hidden])'); return !!e && !/받는 중/.test(e.textContent) && !!document.querySelector('#view .wy-opt'); }, null, {timeout: 20000});
    for (let q = 0; q < 11; q++) {
      const step = (await p.textContent('#view .wy-step'))?.trim();
      await p.locator('#view .wy-opt').nth(k).click({timeout: 8000});
      await p.waitForFunction(s => { const e = document.querySelector('#view .wy-step'); return !!document.querySelector('#view .wy-why') || (e && e.textContent.trim() !== s); }, step, {timeout: 8000});
    }
    await p.waitForSelector('#view .wy-why', {timeout: 15000});
    await p.fill('#view .wy-why', '이익이 반으로 줄어서');
    if (!(await p.inputValue('#view .wy-sell')) || !(await p.inputValue('#view .wy-half'))) { await p.fill('#view .wy-sell', '50000'); await p.fill('#view .wy-half', '90000'); }
    await p.locator('#view .wy-nav .wy-next').click();
    await p.waitForSelector('#view .wy-res', {timeout: 15000});
    await sleep(500);
    return (await p.textContent('#view .wy-res'))?.trim() ?? '';
  }
  try {
    let ctx = await ctxOf({test: true}), p = await pageOf(ctx), got = await tap(p);
    await p.goto(url(HOME), {waitUntil: 'domcontentloaded'}); await settle(p); await sleep(1200);
    await p.evaluate(() => { location.hash = '#/me'; }); await settle(p); await sleep(400); await p.evaluate(() => { location.hash = '#/'; }); await settle(p); await sleep(400);
    B.visit = ks(got);
    check(JSON.stringify(B.visit) === '["visit"]', '[10] 2 쪽 열 때 「연 수」 한 번(화면을 옮겨도 더 안 셈)', JSON.stringify(B.visit));
    check(got.every(g => g.method === 'POST' && !g.cookie && !g.ref), '[10] 3 신호에 쿠키 · 넘겨준 주소 없음', JSON.stringify(got).slice(0, 200));
    got.length = 0;
    const res1 = await journal(p, 2);
    B.rest = ks(got).filter(k => k !== 'visit');
    check(/오늘은 쉬어 가자/.test(res1) && JSON.stringify(B.rest) === '["stop_rest"]', '[10] 1 매매일지를 끝냄 · 「오늘은 쉬어 가자」 → stop_rest 한 번', `${JSON.stringify(B.rest)} 「${res1.slice(0, 30)}」`);
    await ctx.close();
    ctx = await ctxOf({test: true}); p = await pageOf(ctx); got = await tap(p);
    const res2 = await journal(p, 0);
    B.stop = ks(got).filter(k => k !== 'visit');
    check(!/오늘은 쉬어 가자/.test(res2) && JSON.stringify(B.stop) === '["stop"]', '[10] 1 매매일지를 끝냄(쉬어 가자 아님) → stop 한 번', `${JSON.stringify(B.stop)} 「${res2.slice(0, 30)}」`);
    await ctx.close();
    // 한 달 답 — 한 달(장 스무 번) 지난 기록 둘(옛 꼴 · 종목 없음)
    const D = (await getJ('/atlas/data/days.json')).body?.dates ?? [], s = D[D.length - 30];
    if (!s) fail('한 달 답 신호', '날짜 줄(days.json)을 못 받음');
    else {
      const rec = i => ({at: new Date(Date.parse(s + 'T01:00:00Z') + i * 60e3).toISOString(), asOf: s, answers: Array(11).fill(0), score: 0, reds: 0, verdict: '좋아, 정해 둔 대로만', groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, picks: []});
      ctx = await ctxOf({test: true, recs: [rec(1), rec(0)]}); p = await pageOf(ctx); got = await tap(p);
      await p.goto(url('#/why'), {waitUntil: 'domcontentloaded'});
      await p.waitForFunction(() => document.querySelectorAll('#view .wy-later button.wy-kb').length >= 4, null, {timeout: 20000});
      got.length = 0;
      await p.locator('#view .wy-rec').nth(0).locator('.wy-later button', {hasText: /^했어$/}).click(); await sleep(600);
      await p.locator('#view .wy-rec').nth(1).locator('.wy-later button', {hasText: /^안 했어$/}).click(); await sleep(600);
      B.promise = ks(got).filter(k => k !== 'visit');
      check(JSON.stringify(B.promise) === '["promise_yes","promise"]', '[10] 1 한 달 답 — 「했어」 → promise_yes · 「안 했어」 → promise · 한 번씩', JSON.stringify(B.promise));
      await ctx.close();
    }
    // 검사 표시 없는 자동 브라우저 — 신호 0(검사가 진짜 합계를 부풀리지 않음)
    ctx = await ctxOf({}); p = await pageOf(ctx); got = await tap(p);
    await p.goto(url(HOME), {waitUntil: 'domcontentloaded'}); await settle(p); await sleep(1500);
    B.bot = got.length;
    check(B.bot === 0, '자동 브라우저(navigator.webdriver)는 신호 0', `${B.bot}번`);
    await ctx.close();
    check([...B.visit, ...B.rest, ...B.stop, ...(B.promise ?? [])].every(k => k !== 'bad'), '몸 = {k} 하나', JSON.stringify(B));
    R.beacon = B;
  } catch (e) { fail('신호 판 멈춤', String(e.message).split('\n')[0]); }
}

await browser.close();
R.seconds = Math.round((Date.now() - T0) / 100) / 10;
R.ok = R.counts.fail === 0 && keyCode === 0;
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(R, null, 1) + '\n'); }
console.log(`진화 칸 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail} · 진화 칸이 사장님 기기 밖에서 열린 수 ${R.offDeviceOpens} · ${R.seconds}초${keyCode ? ' · 열쇠 길 못 봄' : ''}`);
process.exit(R.counts.fail ? 1 : keyCode);
