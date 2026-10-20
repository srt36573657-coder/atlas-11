// 쪽 검사 공통 — 자료 다시 받기 · 화면 다시 열기 · 옛 쪽 · 새 쪽 시간 재기(2026-10-17 21:10 고도리 하나로 묶은 명령문 [1] 8 · 9 · 일꾼 G)
//   까닭(지금 사이트 검사에서 실패 셋 — en · range · rivals): 실행기에서 aaa7377.com 을 세게 두드리면(rivals 가 회사 파일 2,557개를 24개씩 4초 안에 받음)
//   그 실행기의 요청이 몇 분 동안 끊기거나 늦음 → 「fetch failed」 · 「자료를 못 받음」 · 회사 파일 수백 개 「자료 없음」 · 그다음 열 곳 남짓 「다 그리지 못함」(net::ERR_TIMED_OUT)
//   (같은 검사를 올리기 전 검사 — 실행기 안 시험 서버 — 로 돌리면 실패 0 · 2026-10-17 네 번 모두 같은 꼴)
//   그래서 ① 한꺼번에 두드리지 않고(pool) ② 자료 받기는 망 탈에만 기다렸다 다시(fetchJSON) ③ 화면은 망 탈이 있었던 열기를 믿지 않고 새로 고쳐 다시(settle)
//   — 망 탈이 아닌 실패(404 · 잘못 그림 · 망 탈 없이 못 그림)는 지금과 똑같이 실패 · 망 탈이 3분 넘게 이어지면 「망 막힘」 실패(조용히 넘기지 않음)
//   ④ 옛 쪽(/atlas/) · 새 쪽(/next/) 여는 데 쓴 초를 셈(timer) — 결과 파일 time = {old, new, wall, oldPct, oldShare}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = ms => Math.round(ms * (0.75 + Math.random() * 0.5));
const LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(\/|$)/i;
/** 이 검사가 실제 사이트(원격)를 보나 — 시험 서버(127.0.0.1)면 한꺼번에 받아도 됨 */
export const isRemote = base => !LOCAL.test(String(base));

/** 받기 셈(결과 파일 net) — 다시 받은 수 · 기다린 초 · 까닭 */
export const NET = {req: 0, retry: 0, waitMs: 0, why: {}, page: {retry: 0, waitMs: 0, blocked: 0, why: {}}};
export const netSummary = () => ({req: NET.req, retry: NET.retry, waitSec: Math.round(NET.waitMs / 1000), why: NET.why,
  page: {retry: NET.page.retry, waitSec: Math.round(NET.page.waitMs / 1000), blocked: NET.page.blocked, why: NET.page.why}});
const note = (o, k) => { o[k] = (o[k] || 0) + 1; };

/**
 * 자료 받기 — 한 번에 20초 · 망 끊김(fetch failed · 시간 넘음 · 몸이 끊김) · 429 · 5xx 면 1 · 2 · 4 · 8 · 16 · 30초(흔들기 ±25% · Retry-After 따름) 뒤 다시 · 모두 2분 30초 안
 * 그 밖의 답(404 · 403 …)은 다시 받지 않고 바로 Error(label + ' ' + 번호) — 앞과 같은 글(정말 없는 파일은 지금처럼 실패)
 * @param {string} url
 * @param {string} label 실패 글 앞머리(예: 'core.json')
 * @param {{as?: 'json'|'text'|'response', init?: RequestInit, tries?: number, timeout?: number, budget?: number}} [o]
 */
export async function fetchJSON(url, label = url, {as = 'json', init = {}, tries = 7, timeout = 20000, budget = 150000} = {}) {
  const t0 = Date.now();
  let last = '';
  for (let i = 0; ; i++) {
    NET.req++;
    let wait = jitter(Math.min(30000, 1000 * 2 ** i));
    try {
      const r = await fetch(url, {cache: 'no-store', ...init, signal: AbortSignal.timeout(timeout)});
      if (r.status === 429 || r.status >= 500 || (r.status === 403 && isRemote(url))) { // 실제 사이트 403 = 넷리파이가 세게 두드린 실행기를 잠깐 막음(2026-10-19 · 20 cal 403 · grow 회사 파일 수백 개) — 기다렸다 다시
        last = 'HTTP ' + r.status;
        const ra = Number(r.headers.get('retry-after'));
        if (ra > 0) wait = Math.min(30000, ra * 1000);
        await r.arrayBuffer().catch(() => null);
      } else if (!r.ok) {
        const e = Error(label + ' ' + r.status); e.http = r.status; throw e;
      } else if (as === 'response') return r;
      else return as === 'text' ? await r.text() : await r.json(); // 몸이 끊기거나 반만 오면(SyntaxError · terminated) 아래에서 다시
    } catch (e) {
      if (e?.http) throw e;
      last = String(e?.cause?.code || e?.name || e?.message || e).slice(0, 60);
    }
    note(NET.why, last);
    if (i + 1 >= tries || Date.now() - t0 + wait > budget) throw Error(`${label} ${last} · ${i + 1}번 받아 봄`);
    NET.retry++; NET.waitMs += wait;
    await sleep(wait);
  }
}

/** 여럿을 n 개씩만(차례 그대로) — 실제 사이트를 한꺼번에 두드리지 않게 */
export async function pool(items, n, fn) {
  const out = new Array(items.length); let k = 0;
  await Promise.all(Array.from({length: Math.max(1, Math.min(n, items.length))}, async () => { while (k < items.length) { const i = k++; out[i] = await fn(items[i], i); } }));
  return out;
}

/**
 * 화면 망 지킴 — 이 사이트로 가는 요청 가운데 망 탈(끊김 · 시간 넘음 · 429 · 5xx)을 셈 · 오래 걸려 있는 요청(멈춤)을 앎
 * 셈 밖: 다른 곳 요청 · 404 같은 보통 답 · 길을 바꿔 그만둔 요청(ERR_ABORTED) · 검사가 일부러 막은 요청(p.route · 이 칸에서는 쓰지 않음)
 */
export function watch(p, base) {
  const origin = new URL(base).origin, pend = new Map();
  const net = p._net = {n: 0, last: '', pend};
  const mine = u => u.startsWith(origin), KEEP = new Set(['document', 'script', 'stylesheet', 'fetch', 'xhr', 'image', 'font']); // 영상(media) 같은 긴 받기는 멈춤 셈 밖
  p.on('request', rq => { if (mine(rq.url()) && KEEP.has(rq.resourceType())) pend.set(rq, Date.now()); });
  p.on('requestfinished', rq => { pend.delete(rq); });
  p.on('requestfailed', rq => {
    pend.delete(rq);
    const t = rq.failure()?.errorText || '';
    if (!mine(rq.url()) || /ERR_ABORTED/.test(t)) return;
    net.n++; net.last = t + ' ' + rq.url().slice(origin.length, origin.length + 70);
  });
  const remote = isRemote(base);
  p.on('response', rs => { const s = rs.status(); if ((s === 429 || s >= 500 || (s === 403 && remote)) && mine(rs.url())) { net.n++; net.last = 'HTTP ' + s + ' ' + rs.url().slice(origin.length, origin.length + 70); } });
  return p;
}
/** 지금 15초 넘게 답이 없는 이 사이트 요청 수 */
const stalled = p => { let n = 0; const now = Date.now(); for (const t of p._net?.pend?.values() ?? []) if (now - t > 15000) n++; return n; };

/** 망 탈로 열기에 실패해 크로미움 오류 쪽(chrome-error://)에 머문 화면인가 — 이때 주소만 바꿔서는 아무것도 열리지 않음 */
const dead = p => /^chrome-error:/.test(p.url());
const NETERR = /net::ERR_|ERR_(CONNECTION|TIMED_OUT|NAME|NETWORK|EMPTY_RESPONSE|HTTP2|SSL)|Navigation timeout|Timeout \d+ms exceeded/;
/**
 * 화면 열기 — attempt(k) 가 true(다 그림)를 내고 그동안 망 탈이 없으면 끝
 *   망 탈이 있었으면(못 받은 자료로 「?」를 그렸을 수 있음 · 앱은 못 받은 자료를 15초 · 쪽 모듈은 끝까지 기억) 이 열기를 믿지 않고
 *   2 · 5 · 10 · 20 · 30초 기다렸다 마지막 바른 주소로 새로 열어(앱이 기억한 실패를 지움) 다시 엶 · 그 열기의 화면 오류 줄(받기 실패)은 지움
 *   못 그렸는데 15초 넘게 답 없는 요청이 걸려 있으면(net::ERR_TIMED_OUT 전) · 화면이 크로미움 오류 쪽이면 · 열기가 망 오류로 멈추면 그것도 망 탈
 *   (2026-10-17 흉내 시험: 새로 열기가 망 탈에 걸려 오류 쪽에 머물자 그 뒤 모든 회사가 「다 그리지 못함」 — 오류 쪽이면 attempt 를 부르지 않고 다시 엶)
 *   망 탈 없이 못 그리면 false(앞과 같은 실패 — 부른 쪽이 「다 그리지 못함」 등) · 망 탈이 budget(3분) 넘게 이어지면 fail('망 막힘', what) 뒤 null
 * @returns {Promise<boolean|null>} true = 깨끗이 다 그림 · false = 망 탈 없이 못 그림 · null = 망 막힘(이미 실패로 적음)
 */
export async function settle(p, attempt, {what = '', fail = null, budget = 180000} = {}) {
  const t0 = Date.now();
  let good = dead(p) ? null : p.url(); // 다시 열 곳 — 마지막으로 제대로 열린 주소(처음 열기 전이면 about:blank — 그때는 attempt 가 엶)
  let n0 = p._net?.n ?? 0; // 망 탈 셈의 시작 — 다시 열기(reload) 앞에서 잡음: 다시 연 문서가 503 · 끊김이면 그 바퀴의 망 탈로 셈(앱 없는 「busy」 쪽에서 주소만 바꾸다 「다 그리지 못함」이 된 일 · 흉내 시험)
  for (let k = 0; ; k++) {
    let why = '', ok = false, bad = 0, stuck = 0;
    if (dead(p) && good) why = '오류 쪽'; // 돌아갈 주소가 있으면 먼저 그리로(아래) — 없으면(처음 열기) attempt 가 엶
    else if (k > 0 && (p._net?.n ?? 0) > n0) { bad = p._net.n - n0; why = '다시 열기 망 탈'; } // 다시 연 것부터 망 탈 — 그 쪽에서 attempt 를 부르지 않고 또 기다림
    else {
      const e0 = p._errs?.length ?? 0;
      try { ok = await attempt(k); } catch (e) { if (!NETERR.test(String(e?.message)) && !dead(p)) throw e; why = String(e.message).match(NETERR)?.[0] ?? '열기 오류'; }
      bad = (p._net?.n ?? 0) - n0; stuck = ok ? 0 : stalled(p);
      if (!why && !bad && !stuck && !dead(p)) return !!ok;
      why ||= dead(p) ? '오류 쪽' : bad ? (p._net.last.replace(/ \/.*$/, '') || '망 탈') : '답 없는 요청';
      if (p._errs) p._errs.length = e0; // 망 탈 때 쌓인 「Failed to load resource」 · 그 열기의 화면 오류는 다시 연 열기로 판정
      if (!dead(p) && !/^about:blank/.test(p.url())) good = p.url();
    }
    note(NET.page.why, why);
    if (process.env.NET_DEBUG) console.error(`[settle] ${what} 번 ${k} ok=${ok} bad=${bad} stuck=${stuck} ${why} ${p._net?.last ?? ''} ${Math.round((Date.now() - t0) / 1000)}s`);
    const wait = jitter([2000, 5000, 10000, 20000, 30000][Math.min(k, 4)]);
    if (Date.now() - t0 + wait > budget) {
      NET.page.blocked++;
      if (fail) fail('망 막힘', `${what} · ${Math.round((Date.now() - t0) / 1000)}초 동안 ${k + 1}번 열어 봄 · ${why} ${p._net?.last ?? ''}`.trim());
      return null;
    }
    NET.page.retry++; NET.page.waitMs += wait;
    await sleep(wait);
    n0 = p._net?.n ?? 0;
    // 새로 엶 — 앱이 기억한 실패를 지움 · 살아 있는 화면은 reload(같은 주소 goto 는 # 만 같아 새로 열리지 않음) · 오류 쪽이면 마지막 바른 주소로 goto(실패하면 다음 바퀴가 다시)
    if (!dead(p)) await p.reload({waitUntil: 'domcontentloaded', timeout: 30000}).catch(() => null);
    else if (good && !/^about:blank/.test(good)) await p.goto(good, {waitUntil: 'domcontentloaded', timeout: 30000}).catch(() => null);
  }
}

/** 화면이 쓰는 모양 파일(link stylesheet)이 다 붙을 때까지(실제 사이트에서 쪽 모듈 .css 가 늦게 와 누르는 자리를 23px 로 잰 일 — #/info) · 못 붙은 것 목록(없으면 []) */
export async function stylesReady(p, timeout = 15000) {
  const ok = await p.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].every(l => l.sheet), null, {timeout}).then(() => true, () => false);
  return ok ? [] : p.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].filter(l => !l.sheet).map(l => l.getAttribute('href')));
}

/**
 * 옛 쪽 · 새 쪽 시간 — tm.old(fn) · tm.new(fn) 으로 감싼 때를 셈(둘을 함께 열면 겹친 때도 제 몫으로 셈)
 * get() → {old, new, wall(초), oldPct = 옛 쪽 ÷ 검사 전체, oldShare = 옛 쪽 ÷ (옛 + 새)}
 */
export function timer(t0 = Date.now()) {
  const T = {old: 0, new: 0, nOld: 0, nNew: 0};
  const wrap = k => async fn => { const s = Date.now(); try { return await fn(); } finally { T[k] += Date.now() - s; T[k === 'old' ? 'nOld' : 'nNew']++; } };
  return {old: wrap('old'), new: wrap('new'), raw: T,
    get() { const wall = Date.now() - t0, r = x => Math.round(x / 100) / 10;
      return {old: r(T.old), new: r(T.new), wall: r(wall), opensOld: T.nOld, opensNew: T.nNew, oldPct: wall ? Math.round(T.old / wall * 1000) / 10 : 0, oldShare: T.old + T.new ? Math.round(T.old / (T.old + T.new) * 1000) / 10 : 0}; }};
}
/** 화면 하나의 일(goto · evaluate · waitForFunction · click …)에 쓴 때를 tm 의 옛 쪽 · 새 쪽 몫으로 셈 — side = 'old' | 'new' | null(그때 주소로: /atlas/ = 옛 쪽) */
export function timePage(p, tm, side = null) {
  for (const k of ['goto', 'reload', 'evaluate', 'waitForFunction', 'waitForSelector', 'waitForTimeout', 'click', 'textContent']) {
    const f = p[k].bind(p);
    p[k] = (...a) => tm[side ?? (/\/atlas\//.test(k === 'goto' ? String(a[0]) : p.url()) ? 'old' : 'new')](() => f(...a)); // goto 는 갈 주소로
  }
  return p;
}
