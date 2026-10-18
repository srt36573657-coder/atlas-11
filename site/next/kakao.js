/* 고도리 카카오 — 브라우저 쪽(사장님 2026-10-18 00:15 「72개와 카톡 두 번 가입」 [2] 4 ~ 10 · [3] 7 · [4] 9 · 일 나누기 brief4 K2 · 일꾼 K2c)
   NX.kakao = {on, member(), ref(), friends(), ready(), sdkReady(), canSend(), start(fromPath), startUrl(path, opt), offer(where), withdraw(), exportFile(), sendCard(card), sync()} — index.html 에서 app.js 바로 다음 줄에 <script type="module" src="/next/kakao.js"></script>
     withdraw() = true | false · exportFile() = {ok, name, bytes, keys} | false · 가입 여부가 알려지거나 바뀌면 window 에 'nx:kakao' 알림(detail {on, member})
   · 꺼짐이 기본 — 스위치(SWITCH · 아래 한 곳)가 꺼져 있으면 서버를 묻지도 않음(요청 0 · 카카오 도구 0 · 카카오 주소 0). 켜져 있어도 GET /api/kakao/me 가 404 · 오류 · {on:false} 면 꺼짐
     꺼져 있으면 start · offer · withdraw · sendCard · sync 는 아무 일도 안 하고(false) · exportFile 만 늘 됨(요청 0)
     켤 때 함께 바꿀 것(한꺼번에): 이 파일 SWITCH = true · config/atlas11/kakao.json "on": true · 넷리파이 환경 값(열쇠) · 보안 머리말(script-src — 카카오 도구를 쓸 때만) · SDK 세 값 — 시험이 SWITCH 와 config 가 같은지 맞대 봄(tests/atlas11/kakao-client.test.mjs)
   · 시험 서버(127.0.0.1 · localhost)에서만: 쪽을 열기 전에 globalThis.__GODORI_KAKAO_TEST__ = true 이거나 주소에 ?kakaodev=1 이면 켜진 것으로 보고 서버(가짜 카카오 포함)를 물음. 실제 사이트는 이 값을 심을 길이 없음
   · 서버를 묻는 때 — 처음 온 사람에게는 첫 화면에서 묻지 않음: 보내기 글상자를 열 때 · 매매일지를 끝낼 때 · 앞서 가입한 기기(atlas:kakao:member) · 카카오 동의 화면에서 막 돌아온 쪽(?kakao=ok|none)만. 이 탭에서는 한 번(sessionStorage)
   · 이 기기에 두는 것(개인정보 처리방침에 같은 이름) — localStorage: atlas:kakao:member ("1" = 이 기기에서 카카오로 시작한 적 있음) · atlas:kakao:offered ("1" = 「이 기록 지키기」를 한 번 보임) ·
     atlas:kakao:base (마지막으로 서버와 맞춘 관심 · 나중에 볼 것 목록 — 이 기기에서 뺀 것을 서버에 알리려고) / sessionStorage(이 탭에서만): atlas:kakao:status (서버 답 잠깐 기억) · atlas:kakao:silent (조용한 로그인 마지막 시도 시각)
   · 기록 넷 = KEYS(매매일지 · 관심 · 나중에 볼 것 · 보유종목) — 내 돈 칸(atlas:godori-money)은 읽지도 쓰지도 올리지도 않음. 가입한 사람만 서버에 합쳐 올리고(서버가 지우지 않고 합침) 이 기기 기록은 줄지 않음
   · 로그인 증표는 서버가 준 HttpOnly 쿠키뿐 — 이 코드는 읽지 못함 · 화면 저장소에 두지 않음 · 받는 것은 카카오 회원 번호뿐(이름 · 사진 · 전화번호는 받지 않음 — 서버)
   · 카카오 도구(SDK)는 카드 보내기에만 씀 — SDK.src · SDK.integrity · 열쇠가 모두 채워져야만 받음(지금은 비어 있음 · 보안 규칙(CSP)도 그대로). 가입 자체는 도구 없이 주소 이동만으로 됨 */
import {NAME_EN} from './brand.js';

export const SWITCH = false; // 카카오 켜기 스위치 — 열쇠가 생겨 사장님이 켜라고 하실 때만 true (config/atlas11/kakao.json "on" 과 늘 같아야 함)
export const KEYS = Object.freeze(['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold']);
export const NEVER = 'atlas:godori-money';
export const FLAG_MEMBER = 'atlas:kakao:member', FLAG_OFFERED = 'atlas:kakao:offered', BASE = 'atlas:kakao:base', SS_STATUS = 'atlas:kakao:status', SS_SILENT = 'atlas:kakao:silent';
export const API = '/api/kakao';
export const SDK = Object.freeze({src: '', integrity: '', key: ''}); // 열쇠가 생기면 채움(src = 카카오 도구 주소 · integrity = 그 판의 SRI 값 · key = 자바스크립트 열쇠(공개 열쇠)) — 비어 있는 동안 아무것도 받지 않음
const WATCH = ['atlas:new:sub', 'atlas:new:later']; // 뺀 것을 서버에 알리는 두 목록(서버 PUT 의 off)
const STATUS_MS = 10 * 60e3, SILENT_MS = 30 * 60e3, SYNC_MS = 20e3, FAIL_MS = 5 * 60e3;
const REF_RE = /^[A-Za-z0-9_-]{4,40}$/, CODE_RE = /^[A-Za-z0-9-]{4,24}$/;

/* 꼴 */
const jparse = s => { try { return JSON.parse(s); } catch { return undefined; } };
const store = s => ({
  get(k) { try { return s?.getItem(k) ?? null; } catch { return null; } },
  set(k, v) { try { s.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { s.removeItem(k); } catch { /* 못 지움 */ } },
});
/** 카카오 동의 화면을 거친 뒤 돌아올 쪽 — 같은 사이트의 길(「/…」)이어야 함(서버가 512자 · 같은 사이트만 받음). 「#/…」만 오면 지금 쪽의 길(시험판 ?dev=1 포함)을 앞에 붙임 · 이상하면 fallback */
export function cleanTo(x, loc = {}, fallback = null) {
  const base = (loc.pathname || '/') + (loc.search || '');
  let s = String(x ?? '').trim();
  if (/^https?:\/\//i.test(s)) { try { const u = new URL(s); s = loc.origin && u.origin === loc.origin ? u.pathname + u.search + u.hash : ''; } catch { s = ''; } }
  if (s.startsWith('#/')) s = base + s;
  if (!s.startsWith('/') || s.startsWith('//') || s.length > 512 || /[\u0000-\u001F\u007F\\]/.test(s)) return fallback ?? base + '#/';
  return s;
}
/** 같은 사이트 주소인가(카드에 넣는 주소는 우리 것만) */
const sameSite = (u, origin) => { try { const p = new URL(String(u), origin); return (p.protocol === 'https:' || p.protocol === 'http:') && p.origin === origin; } catch { return false; } };

/** 기기 기록 합치기(지우지 않음) — 매매일지 = 때(at) + 종목 · 관심 · 나중에 볼 것 = 글자 목록(이 기기 차례가 먼저) · 보유종목 = id(판 것 · 잘못 적은 것 표시가 있는 쪽을 씀)
    local · remote = {열쇠: 값}. 반환 = 합친 {열쇠: 값} (열쇠 넷 밖은 버림 · 내 돈 칸은 절대 안 넣음) — 서버도 같은 일을 하지만 이 기기 화면이 서버 없이도 같은 결과를 갖게 */
export function mergeKeys(local, remote) {
  const out = {};
  for (const k of KEYS) {
    const a = Array.isArray(local?.[k]) ? local[k] : [], b = Array.isArray(remote?.[k]) ? remote[k] : [];
    if (!a.length && !b.length) { if (Array.isArray(local?.[k]) || Array.isArray(remote?.[k])) out[k] = []; continue; }
    if (k === 'atlas:godori-why') {
      const seen = new Map();
      for (const r of [...a, ...b]) { if (!r || typeof r !== 'object') continue; const id = String(r.at ?? '') + '|' + String(r.code ?? ''); if (!seen.has(id)) seen.set(id, r); }
      out[k] = [...seen.values()].sort((x, y) => (Date.parse(y.at) || 0) - (Date.parse(x.at) || 0));
    } else if (k === 'atlas:godori-hold') {
      const seen = new Map(), order = [];
      for (const r of [...a, ...b]) {
        if (!r || typeof r !== 'object') continue;
        const id = typeof r.id === 'string' && r.id ? r.id : JSON.stringify(r);
        if (!seen.has(id)) { seen.set(id, r); order.push(id); continue; }
        const old = seen.get(id); if (!(old.sold || old.wrong) && (r.sold || r.wrong)) seen.set(id, r); // 판 것이 다시 살아나지 않게
      }
      out[k] = order.map(id => seen.get(id));
    } else {
      out[k] = [...new Set([...a, ...b].filter(x => typeof x === 'string'))];
    }
  }
  return out;
}

/** 기록 파일 이름 — 이름은 brand.js 한 곳(영어 이름) */
export const fileName = (now = new Date()) => `${NAME_EN.toLowerCase()}-records-${now.toISOString().slice(0, 10)}.json`;

export function createKakao(env = {}) {
  const g = globalThis;
  const E = {
    fetch: env.fetch ?? (typeof g.fetch === 'function' ? g.fetch.bind(g) : null),
    ls: store(env.ls ?? (() => { try { return g.localStorage; } catch { return null; } })()),
    ss: store(env.ss ?? (() => { try { return g.sessionStorage; } catch { return null; } })()),
    loc: env.loc ?? g.location ?? {hostname: '', origin: '', pathname: '/', search: '', hash: ''},
    ua: env.ua ?? g.navigator?.userAgent ?? '',
    now: env.now ?? Date.now,
    go: env.go ?? (u => { g.location.assign(u); }),
    replaceUrl: env.replaceUrl ?? (u => { try { g.history.replaceState(g.history.state, '', u); } catch { /* 못 바꿈 */ } }),
    emit: env.emit ?? (d => { try { g.dispatchEvent(new g.CustomEvent('nx:kakao', {detail: d})); } catch { /* 창 아님 */ } }), // 가입 여부가 알려지거나 바뀌면 화면에 알림(보유종목 쪽이 다시 그림)
    download: env.download ?? browserDownload,
    showOffer: env.showOffer ?? browserOffer,
    addScript: env.addScript ?? browserScript,
    kakao: typeof env.kakao === 'function' ? env.kakao : env.kakao !== undefined ? () => env.kakao : () => g.Kakao,
    sdk: env.sdk ?? SDK,
    switchOn: env.switchOn ?? SWITCH,
    test: () => (env.test !== undefined ? !!env.test : g.__GODORI_KAKAO_TEST__ === true),
  };
  const st = {on: false, member: false, ref: null, friends: null, next: null, code: null};
  let probeP = null, probeAt = 0, probeFail = false, lastSnap = null, sdkP = null, syncP = null, timer = null, failAt = 0, told = 'off:0';
  /** 켜짐 · 가입 상태가 지난번 알림과 다르면 한 번 알림('nx:kakao') */
  const tell = () => { const k = (st.on ? 'on' : 'off') + ':' + (st.member ? 1 : 0); if (k === told) return; told = k; try { E.emit({on: st.on, member: st.member}); } catch { /* 듣는 쪽 오류는 무시 */ } };
  const local = () => /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1)$/.test(String(E.loc.hostname ?? ''));
  const query = () => { try { return new URLSearchParams(E.loc.search ?? ''); } catch { return new URLSearchParams(''); } };
  /** 켜 볼까 — 스위치가 켜졌거나, 시험 서버에서 시험 표시가 있을 때만 */
  const trying = () => E.switchOn === true || (local() && (E.test() || query().get('kakaodev') === '1'));
  const inKakaoTalk = () => /KAKAOTALK/i.test(E.ua);
  const flagged = () => E.ls.get(FLAG_MEMBER) === '1';

  /* 서버 말 받기 — 늘 같은 사이트 · 쿠키는 같은 사이트에만 */
  async function call(method, path, body, opt = {}) {
    if (!E.fetch) return {ok: false, status: 0, json: null};
    const text = body === undefined ? undefined : JSON.stringify(body);
    try {
      const r = await E.fetch(path, {method, credentials: 'same-origin', cache: 'no-store', keepalive: !!opt.keepalive && (text?.length ?? 0) < 60000, // 작은 글만 탭을 닫는 중에도 보냄(큰 글은 keepalive 가 막힘)
        headers: text === undefined ? {accept: 'application/json'} : {accept: 'application/json', 'content-type': 'application/json'}, body: text});
      let json = null; try { json = await r.json(); } catch { /* 본문 없음 */ }
      return {ok: r.ok, status: r.status, json};
    } catch { return {ok: false, status: 0, json: null}; }
  }
  function apply(j) {
    const on = j?.on === true;
    st.on = on; st.member = on && j.member === true;
    st.ref = st.member && typeof j.ref === 'string' && REF_RE.test(j.ref) ? j.ref : null;
    st.friends = st.member && Number.isInteger(j.friends) && j.friends >= 0 ? j.friends : null;
    st.next = st.member && Number.isInteger(j.next) && j.next >= 0 ? j.next : null;
    st.code = st.member && typeof j.code === 'string' && CODE_RE.test(j.code) ? j.code : null;
    if (st.member) E.ls.set(FLAG_MEMBER, '1');
    return st;
  }
  /** 서버가 켜졌나 · 내가 회원인가를 이 탭에서 한 번만 물음(스위치가 꺼져 있으면 묻지도 않음) — 늘 풀림(실패해도 꺼짐으로) */
  function ready() {
    if (probeP && !(probeFail && E.now() - probeAt > 60e3)) return probeP; // 네트워크가 끊겨 못 물었으면 1분 뒤 다시
    probeFail = false; probeAt = E.now();
    if (!trying()) return (probeP = Promise.resolve(api));
    const c = jparse(E.ss.get(SS_STATUS) ?? ''), t = E.now();
    if (c && typeof c === 'object' && Number.isFinite(c.t) && t - c.t >= 0 && t - c.t < STATUS_MS) { apply(c.s); return (probeP = Promise.resolve(api).then(afterStatus)); }
    return (probeP = call('GET', API + '/me').then(r => {
      if (!r.ok && r.status !== 404) probeFail = true;
      apply(r.ok ? r.json : null);
      if (r.ok || r.status === 404) E.ss.set(SS_STATUS, JSON.stringify({t: E.now(), s: {on: st.on, member: st.member, ref: st.ref, friends: st.friends, next: st.next, code: st.code}}));
      return api;
    }).then(afterStatus));
  }
  /** 켜진 것을 안 뒤 — 카카오 도구 받기(열쇠가 있을 때만) · 회원이면 기록 맞추기 · 조용한 로그인(카톡 안 + 앞서 가입한 기기만) */
  async function afterStatus() {
    tell();
    if (!st.on) return api;
    loadSdk();
    if (st.member) { watch(); sync().catch(() => {}); return api; }
    if (flagged() && inKakaoTalk()) { const last = Number(E.ss.get(SS_SILENT)); if (!(Number.isFinite(last) && E.now() - last < SILENT_MS) && E.ss.set(SS_SILENT, String(E.now()))) api.start(null, {silent: true}); } // 시도 시각을 적을 수 없는 기계는 하지 않음(되풀이 막기)
    return api;
  }

  /* 카카오 도구(SDK) — 주소 · 판 값 · 열쇠가 모두 있을 때만 받음 */
  function loadSdk() {
    if (sdkP) return sdkP;
    if (!st.on) return Promise.resolve(false);
    const K = E.kakao(), key = E.sdk.key;
    if (K?.Share && typeof K.isInitialized === 'function') { try { if (!K.isInitialized() && key) K.init(key); } catch { /* 이미 켜짐 */ } return Promise.resolve(true); }
    if (!E.sdk.src || !E.sdk.integrity || !key) return Promise.resolve(false);
    sdkP = new Promise(res => E.addScript(E.sdk.src, E.sdk.integrity, ok => { try { if (ok) { const k = E.kakao(); if (!k.isInitialized()) k.init(key); } res(!!ok); } catch { res(false); } }));
    return sdkP;
  }

  /* 기록 맞추기(회원만) — 서버 GET /api/kakao/data → {data, at} · PUT {data, off?} → {ok, at, data(합친 것), added, skipped, off} · 서버도 합치고 지우지 않음 */
  const readKeys = () => { const o = {}; for (const k of KEYS) { const raw = E.ls.get(k); if (raw == null) continue; const v = jparse(raw); if (v !== undefined) o[k] = v; } return o; };
  const snapString = () => KEYS.map(k => E.ls.get(k) ?? '').join('\u0001');
  const saveBase = d => { const b = {}; for (const k of WATCH) if (Array.isArray(d?.[k])) b[k] = d[k]; E.ls.set(BASE, JSON.stringify(b)); };
  function writeBack(merged, here) {
    let changed = 0;
    for (const k of KEYS) {
      if (!Array.isArray(merged?.[k])) continue;
      const s = JSON.stringify(merged[k]);
      if (s === JSON.stringify(here[k] ?? null) || (here[k] === undefined && !merged[k].length)) continue; // 같거나 둘 다 빈 것은 안 씀
      if (E.ls.set(k, s)) changed++;
    }
    return changed;
  }
  async function sync() {
    if (!api.member()) return {ok: false, why: 'not-member'};
    if (syncP) return syncP;
    syncP = (async () => {
      const here = readKeys();
      const got = await call('GET', API + '/data');
      if (got.status === 401) { st.member = false; E.ss.del(SS_STATUS); tell(); return {ok: false, why: 'login-expired'}; } // 로그인이 풀림 — 기록은 그대로 · 이 기기 표시는 남김(조용한 로그인 · 다시 권유)
      if (!got.ok) { failAt = E.now(); return {ok: false, why: 'get-' + got.status}; }
      const remote = got.json && typeof got.json.data === 'object' && got.json.data ? got.json.data : {};
      // 이 기기에서 뺀 관심 · 나중에 볼 것 = 마지막으로 맞춘 목록(BASE)에는 있었는데 지금은 없는 것 → 서버 사본에서도 빼고 서버에 알림(off)
      const base = jparse(E.ls.get(BASE) ?? '') ?? {}, off = {};
      for (const k of WATCH) {
        const b = Array.isArray(base[k]) ? base[k] : [], l = Array.isArray(here[k]) ? here[k] : [];
        const gone = b.filter(x => typeof x === 'string' && !l.includes(x)); if (gone.length) off[k] = gone;
      }
      const remote2 = {...remote}; for (const k of Object.keys(off)) if (Array.isArray(remote[k])) remote2[k] = remote[k].filter(x => !off[k].includes(x));
      const merged = mergeKeys(here, remote2);
      const put = await call('PUT', API + '/data', Object.keys(off).length ? {data: merged, off} : {data: merged}, {keepalive: true});
      const final = put.ok && put.json && typeof put.json.data === 'object' && put.json.data ? mergeKeys(merged, put.json.data) : merged; // 서버가 합친 것까지(이 기기 기록은 줄지 않음)
      const changed = writeBack(final, here);
      if (put.ok) { saveBase(final); lastSnap = snapString(); failAt = 0; } else failAt = E.now();
      return {ok: put.ok, pulled: Object.keys(remote).length > 0, changed, off: Object.keys(off).length, status: put.status};
    })().finally(() => { syncP = null; });
    return syncP;
  }
  function watch() {
    if (timer || typeof g.addEventListener !== 'function') return;
    const check = () => { if (api.member() && snapString() !== lastSnap && !(failAt && E.now() - failAt < FAIL_MS)) sync().catch(() => {}); };
    timer = true;
    g.addEventListener('hashchange', check);
    g.document?.addEventListener?.('visibilitychange', () => { if (g.document.visibilityState === 'hidden') check(); });
    if (typeof g.setInterval === 'function') timer = g.setInterval(check, SYNC_MS);
  }

  /** 가입 시작 주소 — /api/kakao/start?to=<돌아올 길>[&ref=<보낸 사람 표>][&prompt=none] · 사이에 우리 화면 없이 서버가 곧바로 카카오 동의 화면으로 보냄 */
  function startUrl(fromPath, opt = {}) {
    const to = cleanTo(fromPath ?? (E.loc.pathname || '/') + (E.loc.search || '') + (E.loc.hash || ''), E.loc);
    const ref = opt.ref; // 보낸 사람 표는 호출한 쪽이 줌(카드 단추 = 보낸 사람이 회원일 때만) — 주소 속 ref 는 읽지 않음
    return API + '/start?to=' + encodeURIComponent(to) + (typeof ref === 'string' && REF_RE.test(ref) ? '&ref=' + encodeURIComponent(ref) : '') + (opt.silent ? '&prompt=none' : '');
  }

  const api = {
    get on() { return st.on === true; },
    member: () => st.on === true && st.member === true,
    ref: () => (st.on === true && st.member === true ? st.ref : null),
    friends: () => (st.on === true && st.member === true ? {n: st.friends, next: st.next, code: st.code} : null),
    ready, sync, startUrl, state: () => ({...st}),
    /** 카카오톡 카드를 지금 보낼 수 있나(켜짐 + 카카오 도구가 켜짐) — 동기 */
    canSend() { if (!st.on) return false; const K = E.kakao(); return !!(K?.Share && typeof K.Share.sendDefault === 'function' && (typeof K.isInitialized !== 'function' || K.isInitialized())); },
    /** 서버 답을 받고 카카오 도구까지 켠 뒤 canSend() 를 풀어 줌(실패해도 false 로 풀림 · 던지지 않음) */
    async sdkReady() { try { await ready(); if (!st.on) return false; await loadSdk(); } catch { return false; } return api.canSend(); },
    /** 「카카오로 시작하기」 — 카카오 동의 화면으로 바로 보냄(주소 하나) · 꺼져 있거나 이미 회원이면 false · fromPath 가 없으면 지금 쪽 */
    start(fromPath, opt = {}) {
      if (!api.on || api.member()) return false;
      E.go(startUrl(fromPath, opt)); return true;
    },
    /** 가입 권유 — 매매일지를 끝낸 순간 한 번(where === 'journal') · 꺼짐 · 회원 · 이미 보임이면 아무것도 안 함. 권유 칸을 그렸으면 true */
    async offer(where) {
      if (where !== 'journal') return false;
      await ready();
      if (!api.on || api.member()) return false;
      if (E.ls.get(FLAG_OFFERED) === '1' && !flagged()) return false; // 앞서 가입했던 기기(로그인이 풀림)는 다시 권해도 됨
      let shown = false;
      try { shown = (await E.showOffer(api)) === true; } catch { shown = false; }
      if (shown) E.ls.set(FLAG_OFFERED, '1');
      return shown;
    },
    /** 탈퇴 — 서버가 카카오 연결을 먼저 끊고(안 되면 502 · 아무것도 안 지움 · 그대로 회원) 된 뒤에만 서버 사본을 지움(덜 지워지면 500 · 연결은 이미 끊김 · 다시 누르면 마침) → 이 기기에서 가입 표시만 지움. 이 기기 기록은 그대로.
        풀리는 값: 서버가 「다 했다」({ok: true, unlinked: true} · 쿠키도 지움)고 한 때만 true · 아니면 false(회원 아님 · 꺼짐 · 502 · 500 · 403 · 망 오류 — 이 기기 가입 표시는 그대로이니 화면은 「마치지 못했어요 · 다시」라고 말할 것) · 로그인이 이미 풀렸으면(401) 회원이 아닌 것으로 바뀜(표시는 남김) */
    async withdraw() {
      if (!api.on || !api.member()) return false;
      const r = await call('POST', API + '/withdraw');
      if (r.status === 401) { st.member = false; E.ss.del(SS_STATUS); tell(); return false; } // 로그인이 풀려 있음 — 서버 사본은 그대로 · 이 기기 표시(atlas:kakao:member)는 남겨 조용한 로그인 · 다시 권유가 되게
      if (!(r.ok && r.json && r.json.ok === true && r.json.unlinked !== false)) return false;
      E.ls.del(FLAG_MEMBER); E.ls.del(BASE); E.ss.del(SS_STATUS); E.ss.del(SS_SILENT);
      st.member = false; st.ref = null; st.friends = null; st.next = null; st.code = null; lastSnap = null;
      tell();
      return true;
    },
    /** 이 기기 기록 넷을 파일 하나로 — 꺼져 있어도 늘 됨 · 요청 0 · 내 돈 칸은 안 넣음. 됐으면 {ok:true, name, bytes, keys} · 브라우저가 내려받기를 막으면 false */
    exportFile() {
      const keys = readKeys(), names = Object.keys(keys);
      const text = JSON.stringify({schema: 'godori-device-records-1', exportedAt: new Date(E.now()).toISOString(), keys}, null, 1);
      const name = fileName(new Date(E.now()));
      let ok = false; try { ok = E.download(name, text) === true; } catch { ok = false; }
      return ok ? {ok: true, name, bytes: text.length, keys: names.length} : false;
    },
    /** 카카오톡 그림 카드(feed) 보내기 — card = {title, description, imageUrl?, url, buttons: [{title, url}] (둘까지)} · 주소는 모두 우리 사이트 것만 · 켜짐 + 카카오 도구가 켜졌을 때만 · 보냈으면 true */
    sendCard(card) {
      if (!api.on || !card || typeof card !== 'object') return false;
      const K = E.kakao();
      if (!K?.Share || typeof K.Share.sendDefault !== 'function') return false;
      if (typeof K.isInitialized === 'function' && !K.isInitialized()) return false;
      const o = E.loc.origin ?? '', link = u => ({mobileWebUrl: u, webUrl: u});
      const btns = (Array.isArray(card.buttons) ? card.buttons : []).filter(b => b && typeof b.title === 'string' && b.title && sameSite(b.url, o)).slice(0, 2);
      if (!card.title || !sameSite(card.url, o) || !btns.length) return false;
      const content = {title: String(card.title), link: link(card.url)};
      if (card.description) content.description = String(card.description);
      if (card.imageUrl && sameSite(card.imageUrl, o)) content.imageUrl = card.imageUrl;
      try { K.Share.sendDefault({objectType: 'feed', content, buttons: btns.map(b => ({title: b.title, link: link(b.url)}))}); return true; } catch { return false; }
    },
  };
  /** 쪽을 열 때 한 번 — 카카오 동의 화면에서 돌아온 표(?kakao=ok|none)를 읽고 주소에서 지움 · 앞서 가입한 기기 또는 막 돌아온 쪽만 서버를 물음. 나머지는 가만히 있음 */
  api.boot = () => {
    const q = query(), back = q.get('kakao');
    if (back) {
      E.ss.del(SS_STATUS); // 막 동의를 마치고 돌아옴 — 앞서 적어 둔 서버 답(회원 아님)을 버림
      if (back === 'none') E.ss.set(SS_SILENT, String(E.now())); // 조용한 로그인이 안 됐음 — 이 탭에서는 다시 안 함
      q.delete('kakao'); const rest = q.toString();
      E.replaceUrl((E.loc.pathname || '/') + (rest ? '?' + rest : '') + (E.loc.hash || ''));
    }
    if (flagged() || back) ready().catch(() => {});
    return api;
  };
  return api;
}

/* ───── 브라우저에서만 쓰는 손발(시험에서는 바꿔 끼움) ───── */
function browserDownload(name, text) {
  try {
    const url = URL.createObjectURL(new Blob([text], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener'; a.hidden = true;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000); return true;
  } catch { return false; }
}
function browserScript(src, integrity, done) {
  const s = document.createElement('script'); s.src = src; s.integrity = integrity; s.crossOrigin = 'anonymous'; s.async = true;
  s.addEventListener('load', () => done(true), {once: true}); s.addEventListener('error', () => done(false), {once: true});
  document.head.append(s);
}
/** 매매일지 결과 카드 바로 밑에 권유 칸 — 모양과 글은 p-share.js 의 offerBox(모양 파일 p-share.css) · 결과가 안 보이면 안 그림 */
async function browserOffer(api) {
  const card = document.querySelector('section.wy');
  if (!card || !card.querySelector('.wy-res') || document.querySelector('.ps-offer')) return false;
  const m = await globalThis.NX?.mod?.('share');
  const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(x => (x.getAttribute('href') || '').endsWith('/next/p-share.css'));
  if (link && !link.sheet) await new Promise(res => { link.addEventListener('load', res, {once: true}); link.addEventListener('error', res, {once: true}); setTimeout(res, 1500); }); // 모양이 붙은 뒤에 그림(깜빡임 없이)
  if (typeof m?.offerBox !== 'function' || !card.isConnected || !card.querySelector('.wy-res') || document.querySelector('.ps-offer')) return false;
  card.after(m.offerBox({start: () => api.start(null)}));
  return true;
}

/* NX 에 붙임 — app.js 가 NX 를 만든 뒤(index.html 에서 app.js 다음 줄) · 아직 없으면 잠깐 기다림 */
export const kakao = typeof window !== 'undefined' && typeof document !== 'undefined' ? createKakao() : null;
if (kakao) {
  let tries = 0;
  const attach = () => {
    const N = globalThis.NX;
    if (N && typeof N === 'object') { N.kakao = kakao; kakao.boot(); return; }
    if (++tries < 40) setTimeout(attach, tries < 5 ? 0 : 100);
  };
  attach();
}
