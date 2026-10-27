/* 편지 여는 밤(사장님 2026-10-17 01:29 「그래 이제 만들어봐」) — 월요일부터 쓰고(봉인) 금요일 밤 8시(서울)에 다 함께 엶
 *   서버 /api/letter(lib/atlas11/letter.mjs) · 회원 열쇠는 이 기기에만(localStorage atlas11:letter:key) · 사장님 열쇠는 초대장 쪽과 같은 자리(atlas11:invite:owner)
 *   그 주의 실제 기록 = 사이트 자료(/atlas/data/home.json 지수 · mkt.json 회사)로 그림 · 못 받으면 「?」
 *   보안 규칙(script-src 'self' · style-src 'self') — 글 속 스타일 · 스크립트 없음 · 받은 글은 글자로만(textContent) */
// 2026-10-18 고도리 · 72개와 카톡 두 번 가입 [7] 10 — 맨 아래 단추 다섯(letter.html) · 돌아가기 단추 높이 48px(render 맨 끝) · 초대 못 받은 기기(열쇠도 초대 주소도 없음)에는 첫 장에 「지금은 초대받은 분만」 + 「여는 밤까지 n일 n시간 n분 남았어요」(hero · 서버 시계로 셈)
// 2026-10-18 [4] 7 — 사장님 열쇠 기기(S.owner)에만 「친구 3명 확인 번호」 칸(kakaoCard): 번호 + 「확인」 → GET /api/kakao/verify?code= (사장님 열쇠 머리글) → 처음 확인 · 이미 확인한 번호 · 없는 번호 · 카카오 가입이 꺼져 있으면(/api/kakao/* 404) 칸 자체를 안 그림
// 거르는 말 = 한 곳 /next/words.js(사장님 2026-10-17 21:10 「letter.js 거르는 말과 next_check 쓰지 않을 말을 words.js 한 곳에 모아 같이 써라」 — 서버 lib/atlas11/letter.mjs 도 같은 파일)
// 보내기 = /next/p-share.js 글상자(「친구에게 무슨 말을 할래?」 · 걸리면 고치게 · 글 + 주소 함께)
import {badWord} from '/next/words.js';
import {open as shareBox} from '/next/p-share.js';
/* 카카오 켜기 스위치(2026-10-18 K2c 「스위치 꺼짐 = 카카오 요청 0」) — site/next/kakao.js SWITCH · config/atlas11/kakao.json "on" 과 늘 같아야 함(켤 때 셋을 함께 바꿈 · 시험 kakao-client ⑯ 이 셋을 맞대 봄).
   /next/kakao.js 를 여기서 부르면 카카오 도구 전체(createKakao · NX 붙이기 기다림)가 편지 쪽에 만들어져서 불 하나만 따로 둠. 꺼져 있으면 /api/kakao/* 를 아예 부르지 않음(사장님 열쇠 기기도) */
const KAKAO_ON = true;
/** 시험 서버(127.0.0.1 · localhost)에서만: 쪽을 열기 전에 __GODORI_KAKAO_TEST__ = true 이거나 주소에 ?kakaodev=1 이면 켜진 것으로 보고 물음 — site/next/kakao.js 와 같은 규칙(실제 사이트에서는 시험 표시가 있어도 스위치만 봄) */
const KAKAO_TRY = KAKAO_ON || (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1)$/.test(location.hostname) && (globalThis.__GODORI_KAKAO_TEST__ === true || new URLSearchParams(location.search).get('kakaodev') === '1')); // 쪽을 열 때 한 번만 봄(열쇠를 주소에서 지울 때 ?kakaodev=1 도 함께 지워짐)
const kakaoTry = () => KAKAO_TRY;
const API = '/api/letter', KEY = 'atlas11:letter:key', OWNER = 'atlas11:invite:owner';
const josa = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 ? '은' : '는'; };
const store = {get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }};
const $ = (q, r = document) => r.querySelector(q);
function h(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(a ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const svgE = (tag, a = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); return e; };
const joinCode = () => /(?:^#|&)join=([A-Za-z0-9_-]{16})(?:&|$)/.exec(location.hash)?.[1]; // 초대 주소의 초대장 번호(없으면 undefined)
const kst = iso => new Date(Date.parse(iso) + 9 * 3600e3);
const md = iso => { const d = kst(iso); return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일'; };
const pct = x => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(Math.round(x * 10) / 10).toFixed(1) + '%';
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 소리 — 누를 때만(봉인 쾅 · 종이 · 맑은 종) */
let AC = null;
const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); return AC; } catch { return null; } };
function tone(f0, f1, d, g, delay = 0) { const a = ac(); if (!a) return; const o = a.createOscillator(), v = a.createGain(), t = a.currentTime + delay;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(v).connect(a.destination); o.start(t); o.stop(t + d + .05); }
function noise(d, f, g, delay = 0) { const a = ac(); if (!a) return; const n = a.createBuffer(1, Math.floor(a.sampleRate * d), a.sampleRate), ch = n.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const s = a.createBufferSource(), bp = a.createBiquadFilter(), v = a.createGain(), t = a.currentTime + delay; s.buffer = n; bp.type = 'bandpass'; bp.frequency.value = f; v.gain.value = g; s.connect(bp).connect(v).connect(a.destination); s.start(t); }
const sThud = () => { tone(140, 48, .35, .5, .5); noise(.12, 600, .45, .5); }, sPaper = () => { noise(.16, 3200, .3); noise(.12, 2600, .22, .14); }, sChime = (d = 0) => { tone(880, 870, .7, .16, d); tone(1320, 1310, .9, .1, d + .12); };

/* 서버 */
const myKey = () => store.get(KEY), ownerKey = () => store.get(OWNER);
async function api(method, body, week) {
  const headers = {'content-type': 'application/json'}, k = myKey(), o = ownerKey();
  if (k) headers['x-atlas-letter'] = k; if (o) headers['x-atlas-owner'] = o;
  try {
    const r = await fetch(API + (week ? '?week=' + encodeURIComponent(week) : ''), {method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
    let j = null; try { j = await r.json(); } catch { j = null; }
    return {status: r.status, body: j ?? {}};
  } catch { return {status: 0, body: {error: 'net'}}; }
}
function why(b, kind) {
  const e = b?.error;
  if (e === 'word') return '「' + b.word + '」 같은 ' + b.group + josa(b.group) + ' 못 넣어요. 바꿔 볼까요?';
  return ({already: kind === 'seal' ? '이번 주 편지는 벌써 봉인했어요.' : '벌써 한 번 했어요.', code_used: '이미 쓴 초대장이에요.', no_code: '초대장을 찾지 못했어요.', bad_code: '초대장 주소가 이상해요.',
    nick_taken: '다른 분이 쓰는 별명이에요.', bad_nick: '별명을 두 글자 넘게 써 주세요.', short: kind === 'seal' ? '다섯 글자 넘게 써 주세요.' : '두 글자 넘게 써 주세요.', sealed: '아직 봉인 중이에요.',
    member_only: '초대받은 분만 쓸 수 있어요.', owner_only: '사장님 기기에서만 할 수 있어요.', bad_what: '무엇에 대해 쓸지 골라 주세요.', self: '내 편지에는 할 수 없어요.'})[e] ?? '지금은 편지함에 닿지 못했어요. 잠시 뒤 다시 해 보세요.';
}

/* 사이트 자료 — 그 주의 실제 기록 */
let DATA = null;
async function siteData() {
  if (DATA) return DATA;
  const get = async u => { try { const r = await fetch(u, {cache: 'no-cache'}); return r.ok ? await r.json() : null; } catch { return null; } };
  const [home, mkt] = await Promise.all([get('/atlas/data/home.json'), get('/atlas/data/mkt.json')]);
  DATA = {home, mkt}; return DATA;
}
/** 주(금요일 날짜)의 선 — 앞 금요일 종가 + 월 ~ 금 종가 · 못 구하면 null */
function weekLine(what, week) {
  const rows = DATA?.home?.idx?.KOSPI?.rows; if (!Array.isArray(rows)) return null;
  const fri = week, mon = new Date(Date.parse(week + 'T00:00:00Z') - 4 * 864e5).toISOString().slice(0, 10);
  let pts = null;
  if (what.kind === 'idx') pts = DATA.home.idx?.[what.code]?.rows?.map(r => [r[0], r[1]]);
  else {
    // 회사 선은 날짜 없이 값만 — 코스피 날짜 줄에 맞춤 · 처음 날(base) 이 맞고, 끝 날(asOf) 도 맞거나 코스피 쪽이 아직 덜 받았을 때만 · 어긋나면 그리지 않음(「?」)
    const M = DATA?.mkt, c = M?.companies?.[what.code], i = rows.findIndex(r => r[0] === M?.base), n = c?.l?.length ?? 0;
    const endOk = i >= 0 && (rows.length - i >= n ? rows[i + n - 1][0] === M.asOf : rows[rows.length - 1][0] < M.asOf);
    if (n && endOk) pts = c.l.slice(0, rows.length - i).map((v, j) => [rows[i + j][0], v]);
  }
  if (!pts) return null;
  const inWeek = pts.filter(p => p[0] >= mon && p[0] <= fri && Number.isFinite(p[1]));
  if (!inWeek.length) return null;
  const before = pts.filter(p => p[0] < mon && Number.isFinite(p[1])).slice(-1);
  const line = [...before, ...inWeek];
  return line.length >= 2 ? {line, chg: (line[line.length - 1][1] / line[0][1] - 1) * 100, last: line[line.length - 1][0]} : null;
}
function spark(w, sealedDay) {
  const v = w.line.map(p => p[1]), lo = Math.min(...v), hi = Math.max(...v), n = v.length, up = w.chg >= 0, c = up ? '#FF5A65' : '#5B96FF';
  const xy = i => [10 + i * 300 / (n - 1), 12 + (hi - v[i]) * 96 / ((hi - lo) || 1)];
  const s = svgE('svg', {class: 'sp', viewBox: '0 0 320 120', role: 'img', 'aria-label': '그 주의 실제 기록 선'});
  s.append(svgE('polyline', {points: v.map((_, i) => xy(i).map(x => x.toFixed(1)).join(',')).join(' '), fill: 'none', stroke: c, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, class: 'ln'}));
  const k = w.line.findIndex(p => p[0] === sealedDay);
  if (k >= 0) { const [x, y] = xy(k); s.append(svgE('circle', {cx: x.toFixed(1), cy: y.toFixed(1), r: 9, fill: '#E9B949', class: 'seal-dot'})); }
  const [x1, y1] = xy(n - 1); s.append(svgE('circle', {cx: x1.toFixed(1), cy: y1.toFixed(1), r: 7, fill: c}));
  return s;
}

/* 그리기 */
const root = $('#lt');
let S = null, P = null, tickT = null, pick = null, KK = false; // KK = 카카오 가입이 켜져 있나(사장님 열쇠 기기에서만 물음)
const OPENED = new Set(); // 여는 밤 다시 읽기는 한 번만
function env(cls = '') { return h('div', {class: 'env ' + cls, 'aria-hidden': 'true'}, h('div', {class: 'bd'}), h('div', {class: 'fl'}), h('div', {class: 'wax'}, h('img', {alt: '', src: '/media/makbi-icon.svg'}))); }
function hero() {
  const guest = !!S && !S.member && !S.owner && !joinCode(); // 초대 못 받은 기기 = 열쇠도 초대 주소도 없음(사장님 2026-10-18 [7] 10 「초대 못 받은 사람에게는 「지금은 초대받은 분만」과 여는 밤까지 남은 때를 보여라」)
  const clock = h('b', {class: 'clk', text: '…'});
  const sub = S ? (S.subjects?.length ? '많이 쓴 곳 ' + S.subjects.slice(0, 3).map(x => x.name + ' ' + x.n).join(', ') : '아직 봉인된 편지가 없어요') : '';
  const box = h('section', {class: 'hero', 'aria-label': '편지 여는 밤'},
    h('p', {class: 'kick', text: '둘이 편지'}), env(),
    h('h1', {class: 'hbig'}, '금요일 밤,', h('br'), '편지가 열려요'),
    h('p', {class: 'hsub', text: '월요일부터 쓰고, 금요일 밤 8시에 다 함께 열어요.'}),
    h('div', {class: 'clock' + (guest ? ' guest' : '')}, h('small', {text: guest ? '지금은 초대받은 분만' : (S ? md(S.opensAt) : '') + ' 여는 밤까지'}), clock),
    S ? h('p', {class: 'live'}, '이번 주 봉인된 편지 ', h('b', {text: S.count.toLocaleString('ko-KR') + '통'})) : null,
    S ? h('p', {class: 'live sm', text: sub}) : null);
  clearInterval(tickT);
  const tick = () => { if (!S) return; const s = Math.max(0, Date.parse(S.opensAt) - (Date.now() + (S.off ?? 0))) / 1000; // 서버 시계로 셈(기기 시계가 틀려도)
    const d = Math.floor(s / 86400), hh = String(Math.floor(s % 86400 / 3600)).padStart(2, '0'), mm = String(Math.floor(s % 3600 / 60)).padStart(2, '0');
    clock.textContent = guest ? '여는 밤까지 ' + d + '일 ' + hh + '시간 ' + mm + '분 남았어요' : d + '일 ' + hh + '시간 ' + mm + '분 ' + String(Math.floor(s % 60)).padStart(2, '0') + '초';
    if (s <= 0) { clearInterval(tickT); if (!OPENED.has(S.opensAt)) { OPENED.add(S.opensAt); sChime(); setTimeout(load, 1500); } } };
  tick(); tickT = setInterval(tick, 1000);
  return box;
}
function msgEl() { return h('p', {class: 'msg', role: 'status', 'aria-live': 'polite'}); }

function joinCard(code) {
  const nick = h('input', {class: 'in', maxlength: 12, placeholder: '별명 두 글자 넘게', 'aria-label': '별명', autocomplete: 'nickname'}), m = msgEl();
  const go = h('button', {class: 'gold', type: 'button', text: '편지함에 들어가기', onclick: async () => {
    const n = nick.value.trim(), bad = badWord(n);
    if (bad) { m.textContent = why({error: 'word', group: bad[0], word: bad[1]}); return; }
    go.disabled = true; m.textContent = '들어가는 중이에요…';
    const r = await api('POST', {op: 'join', code, nick: n});
    if (r.status === 201) { store.set(KEY, r.body.key); history.replaceState(null, '', location.pathname); sChime(); m.textContent = '어서 오세요, ' + r.body.nick + '님!'; setTimeout(load, 600); return; }
    go.disabled = false; m.textContent = why(r.body);
  }});
  return h('section', {class: 'card join'}, h('p', {class: 'bodri', text: '둘이가 초대장을 가져왔어요!'}),
    h('p', {text: '편지함에서 쓸 별명을 정해 주세요.'}), h('p', {class: 'note', text: '이름과 전화번호는 받지 않아요.'}), nick, go, m);
}

function writeCard() {
  pick = null;
  const chips = h('div', {class: 'chips'}), found = h('div', {class: 'found'}), m = msgEl();
  const ta = h('textarea', {class: 'ta serif', maxlength: 100, placeholder: '이번 주 무엇이 보이나요? 금요일 밤의 나에게 써 보세요.', 'aria-label': '편지 글'});
  const cnt = h('p', {class: 'cnt', text: '0 / 100'}), bod = h('p', {class: 'bod', role: 'status', 'aria-live': 'polite', text: '무엇에 대해 쓸지 먼저 골라 주세요.'});
  const sealB = h('button', {class: 'gold big', type: 'button', disabled: true, text: '봉인하기'});
  const choose = (w, btn) => { pick = w; for (const x of chips.querySelectorAll('.chip')) x.setAttribute('aria-pressed', String(x === btn)); judge(); };
  for (const [code, name] of [['KOSPI', '코스피'], ['KOSDAQ', '코스닥']]) { const b = h('button', {class: 'chip', type: 'button', 'aria-pressed': 'false', text: name, onclick: () => choose({kind: 'idx', code}, b)}); chips.append(b); }
  const q = h('input', {class: 'in sm', placeholder: '회사 이름 찾기', 'aria-label': '회사 이름 찾기', oninput: async () => {
    const s = q.value.trim(); found.replaceChildren(); if (s.length < 1) return;
    const d = await siteData(), cs = d.mkt?.companies ?? {}, out = [];
    for (const [code, c] of Object.entries(cs)) { if (c.n?.includes(s)) out.push([code, c.n]); if (out.length >= 6) break; }
    if (!out.length) { found.append(h('p', {class: 'note', text: '찾는 회사가 없어요.'})); return; }
    for (const [code, name] of out) { const b = h('button', {class: 'chip', type: 'button', 'aria-pressed': 'false', text: name, onclick: () => { chips.append(b); found.replaceChildren(); q.value = ''; choose({kind: 'co', code, name}, b); }}); found.append(b); }
  }});
  function judge() {
    const s = ta.value.trim(); cnt.textContent = Array.from(s).length + ' / 100'; const bad = badWord(s);
    bod.className = 'bod';
    if (bad) { bod.textContent = why({error: 'word', group: bad[0], word: bad[1]}); bod.classList.add('no'); sealB.disabled = true; return; }
    if (!pick) { bod.textContent = '무엇에 대해 쓸지 먼저 골라 주세요.'; sealB.disabled = true; return; }
    if (Array.from(s).length < 5) { bod.textContent = '다섯 글자 넘게 써 주세요.'; sealB.disabled = true; return; }
    bod.textContent = '좋아요. 봉인할 수 있어요.'; bod.classList.add('ok'); sealB.disabled = false;
  }
  ta.addEventListener('input', judge);
  sealB.addEventListener('click', async () => {
    if (sealB.disabled) return; sealB.disabled = true; m.textContent = '';
    const r = await api('POST', {op: 'seal', what: pick, text: ta.value.trim()});
    if (r.status === 201) { sealShow(r.body.opensAt); setTimeout(load, reduce() ? 1500 : 2900); return; }
    sealB.disabled = false; m.textContent = why(r.body, 'seal');
  });
  return h('section', {class: 'card', id: 'write'}, h('h2', {text: '이번 주 편지 쓰기'}), h('p', {text: '무엇에 대해 쓸까요?'}), chips, q, found, ta, cnt, bod, sealB, m,
    h('p', {class: 'note', text: '사고팔기 말, 소문, 연락처는 둘이가 막아요. 한 사람 한 주 한 통이에요.'}));
}
function sealShow(opensAt) {
  const ov = h('div', {class: 'seal-ov', role: 'status', 'aria-live': 'polite'}, env('big'), h('p', {class: 't1', text: '쾅! 봉인됐어요'}), h('p', {class: 't2', text: md(opensAt) + ' 금요일 밤 8시에 열려요'}));
  document.body.append(ov); requestAnimationFrame(() => ov.classList.add('go')); sPaper(); sThud();
  try { navigator.vibrate?.([0, 500, 40]); } catch {}
  setTimeout(() => ov.remove(), reduce() ? 1400 : 2800);
}
function mineCard() {
  return h('section', {class: 'card mine'}, env('sm'), h('h2', {text: '이번 주 편지는 봉인됐어요'}),
    h('p', {class: 'note', text: S.mine.what.name + ' · ' + md(S.mine.at) + '에 봉인'}), h('p', {class: 'serif quiet', text: '「' + S.mine.text + '」'}),
    h('p', {class: 'note', text: '지금은 나만 보여요. ' + md(S.opensAt) + ' 금요일 밤 8시에 모두에게 열려요.'}),
    h('button', {class: 'ghost', type: 'button', text: '봉인 소식 카톡 보내기', onclick: () => share('둘이에 편지를 봉인했어요. 금요일 밤 8시에 같이 열어요!', location.origin + '/letter.html')}));
}
/** 보내기 — 글상자부터(text = 같이 가는 편지 쪽 소개 한 줄 · 사람이 쓰는 말은 글상자) */
function share(text, url) { return shareBox({kind: 'share', title: '둘이 편지', text, url}); }
function toast(t) { const e = h('p', {class: 'toast', role: 'status', text: t}); document.body.append(e); setTimeout(() => e.remove(), 2600); }

function letterCard(L, week) {
  const isMe = S?.member && P?.me && L.nick === P.me.nick, act = !!S?.member, m = msgEl(); // 누르기는 회원만 · 사장님 기기(회원 아님)는 보기와 되살리기만
  const w = DATA ? weekLine(L.what, week) : null, sealedDay = kst(L.at).toISOString().slice(0, 10);
  const rec = h('div', {class: 'rec'}, h('div', {class: 'rt'}, h('span', {text: '그 주의 실제 기록'}), w ? h('b', {class: w.chg >= 0 ? 'up' : 'dn', text: L.what.name + ' ' + pct(w.chg)}) : h('b', {class: 'q', text: '?'})),
    w ? spark(w, sealedDay) : h('div', {class: 'qq', text: '?'}),
    w ? h('div', {class: 'rd'}, h('span', {text: md(w.line[0][0] + 'T00:00:00Z')}), h('span', {class: 'gd', text: '● 봉인한 날'}), h('span', {text: md(w.last + 'T00:00:00Z')})) : h('p', {class: 'note', text: '이번 주 기록을 아직 못 받았어요.'}));
  const learn = h('button', {class: 'pill' + (L.learnedByMe ? ' on' : ''), type: 'button', 'aria-pressed': String(!!L.learnedByMe), disabled: !act || isMe || L.learnedByMe ? true : null},
    '배웠어요 ', h('b', {text: String(L.learned)}));
  learn.addEventListener('click', async () => { const r = await api('POST', {op: 'learn', week, author: L.id}); if (r.status === 200) { learn.classList.add('on'); learn.disabled = true; learn.setAttribute('aria-pressed', 'true'); $('b', learn).textContent = String(L.learned + 1); sChime(); } else m.textContent = why(r.body); });
  const report = isMe || !act ? null : h('button', {class: 'pill dim', type: 'button', text: L.reportedByMe ? '신고했어요' : '신고', disabled: L.reportedByMe ? true : null, onclick: async () => {
    if (!confirm('이 편지를 신고할까요? 사장님이 볼 때까지 가려져요.')) return;
    const r = await api('POST', {op: 'report', week, author: L.id}); m.textContent = r.status === 200 ? '신고했어요. 사장님이 볼 때까지 가려져요.' : why(r.body); }});
  const reps = h('ul', {class: 'reps'}, ...L.replies.map(r => h('li', {}, h('b', {text: r.nick}), ' ' + r.text)));
  let replyForm = null;
  if (act && !isMe && !L.repliedByMe) {
    const inp = h('input', {class: 'in sm', maxlength: 40, placeholder: '한 줄 답', 'aria-label': '한 줄 답'});
    replyForm = h('form', {class: 'rep', onsubmit: async e => { e.preventDefault(); const t = inp.value.trim(), bad = badWord(t);
      if (bad) { m.textContent = why({error: 'word', group: bad[0], word: bad[1]}); return; }
      const r = await api('POST', {op: 'reply', week, author: L.id, text: t});
      if (r.status === 201) { reps.append(h('li', {}, h('b', {text: P.me.nick}), ' ' + t)); replyForm.remove(); m.textContent = '올렸어요.'; } else m.textContent = why(r.body); }}, inp, h('button', {class: 'ghost', type: 'submit', text: '답하기'}));
  }
  let look = L.look ? h('p', {class: 'look'}, h('span', {text: '돌아보기'}), L.look) : null;
  if (!look && isMe) {
    const inp = h('input', {class: 'in sm', maxlength: 60, placeholder: '한 주 뒤의 나는 어떤가요?', 'aria-label': '돌아보기'});
    look = h('form', {class: 'rep', onsubmit: async e => { e.preventDefault(); const t = inp.value.trim(), bad = badWord(t);
      if (bad) { m.textContent = why({error: 'word', group: bad[0], word: bad[1]}); return; }
      const r = await api('POST', {op: 'look', week, author: L.id, text: t});
      if (r.status === 200) look.replaceWith(h('p', {class: 'look'}, h('span', {text: '돌아보기'}), t)); else m.textContent = why(r.body); }}, inp, h('button', {class: 'ghost', type: 'submit', text: '남기기'}));
  }
  const owner = S?.owner && L.hidden != null ? h('div', {class: 'own'}, h('p', {class: 'note', text: L.hidden ? '신고 ' + L.reports + '건 · 가려짐' : '가려지지 않음'}),
    L.hidden ? h('button', {class: 'ghost', type: 'button', text: '되살리기', onclick: async () => { const r = await api('POST', {op: 'restore', week, author: L.id}); m.textContent = r.status === 200 ? '되살렸어요.' : why(r.body); }}) : null,
    h('button', {class: 'ghost', type: 'button', text: '지우기', onclick: async () => { if (!confirm('이 편지를 지울까요?')) return; const r = await api('POST', {op: 'remove', week, author: L.id}); m.textContent = r.status === 200 ? '지웠어요.' : why(r.body); }})) : null;
  return h('article', {class: 'lt' + (L.hidden ? ' hid' : '')},
    h('div', {class: 'lth'}, h('b', {text: L.nick}), h('span', {text: L.what.name + ' · ' + md(L.at) + ' 봉인'})),
    h('p', {class: 'ltx serif', text: '「' + L.text + '」'}), rec, look,
    h('div', {class: 'acts'}, learn, report, h('span', {class: 'note', text: L.nick + '님 편지 ' + L.letters + '통'})), reps, replyForm, m, owner);
}

// 쓴 주마다 쌓이던 도장 칸(넷째 주 은빛 · 열두째 주 달빛)은 지움 — 연속 접속 보상(본질 파일 「망치는 길」 · 사장님 2026-10-18 16:39 명령문 · 본질 문 ③ · 일꾼 KI) · 다른 보상은 넣지 않음
function invitesCard() {
  const inv = S?.me?.invites ?? [];
  return h('section', {class: 'card'}, h('h2', {text: '우리 셋 — 초대장'}), h('p', {text: '친구 셋에게 초대장을 보내 같이 열어요.'}),
    h('div', {class: 'tickets'}, ...inv.map((x, i) => x.used ? h('div', {class: 'tk used'}, h('b', {text: '초대장 ' + (i + 1)}), '친구가 들어왔어요')
      : h('button', {class: 'tk', type: 'button', onclick: () => share('둘이 편지 여는 밤에 초대해요. 금요일 밤 8시에 같이 열어요!', location.origin + '/letter.html#join=' + x.code)}, h('b', {text: '초대장 ' + (i + 1)}), '보내기'))),
    h('p', {class: 'note', text: '초대장 하나에 한 사람만 들어올 수 있어요.'}));
}
function ownerCard() {
  const out = h('div', {class: 'codes'}), m = msgEl();
  const mk = h('button', {class: 'gold', type: 'button', text: '초대장 5장 만들기', onclick: async () => {
    mk.disabled = true; const r = await api('POST', {op: 'mint', n: 5}); mk.disabled = false;
    if (r.status !== 201) { m.textContent = why(r.body); return; }
    for (const c of r.body.codes) out.append(h('button', {class: 'tk', type: 'button', onclick: () => share('둘이 편지 여는 밤에 초대해요. 금요일 밤 8시에 같이 열어요!', location.origin + '/letter.html#join=' + c)}, h('b', {text: '새 초대장'}), '보내기'));
    m.textContent = '초대장 ' + r.body.codes.length + '장을 만들었어요. 누르면 보내기가 열려요.';
  }});
  return h('section', {class: 'card own'}, h('h2', {text: '사장님 자리'}), h('p', {text: '이 기기는 사장님 열쇠가 있어요.'}), mk, out, m);
}
/** 카카오 가입이 켜져 있나 — 스위치(KAKAO_ON · 시험 서버는 kakaoTry)가 꺼져 있으면 서버를 묻지도 않음(요청 0) · 켜져 있으면 /api/kakao/me 가 200 이면 켜짐 · 404 · 못 닿음이면 꺼진 것으로 봄(확인 번호 칸을 아예 안 그림) */
async function kakaoOn() { if (!kakaoTry()) return false; try { const r = await fetch('/api/kakao/me', {cache: 'no-store'}); await r.arrayBuffer().catch(() => {}); return r.status === 200; } catch { return false; } } // 몸을 끝까지 읽어 닫음(안 읽으면 요청이 끝나지 않은 것으로 남음)
/** 사장님 자리 · 친구 3명 확인 번호(사장님 2026-10-18 order-0015 [4] 7 「사장님 열쇠 기기에서 그 번호를 맞대 볼 수 있게 하라」) — 사장님 열쇠 기기 + 카카오 켜짐일 때만 그려짐
 *  서버가 처음 맞댈 때 「확인함」으로 적으므로(두 번째부터 「이미 확인한 번호」) 누르는 동안은 단추를 잠가 한 번만 감 */
function kakaoCard() {
  const m = h('p', {class: 'msg kkr', role: 'status', 'aria-live': 'polite'});
  const inp = h('input', {class: 'in', type: 'text', maxlength: 24, placeholder: 'XXXX-XXXX-XXXX', 'aria-label': '친구 3명 확인 번호', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false'});
  const when = iso => { const t = Date.parse(iso); if (!Number.isFinite(t)) return ''; const d = kst(iso); return md(iso) + ' ' + d.getUTCHours() + '시 ' + String(d.getUTCMinutes()).padStart(2, '0') + '분'; };
  const say = (tone, head, sub) => { m.className = 'msg kkr' + (tone ? ' ' + tone : ''); m.replaceChildren(...[head ? h('b', {text: head}) : null, sub ? h('span', {text: sub}) : null].filter(Boolean)); };
  const go = h('button', {class: 'gold', type: 'button', text: '확인', onclick: async () => {
    const code = inp.value.trim();
    if (!code) { say('', '번호를 넣어 주세요.'); inp.focus(); return; }
    if (!kakaoTry()) { KK = false; render(); return; } // 스위치가 꺼짐 — 카카오 길을 부르지 않고 칸을 지움
    go.disabled = true; say('', '맞대는 중이에요…');
    let st = 0, j = {};
    try { const x = await fetch('/api/kakao/verify?code=' + encodeURIComponent(code), {headers: {'x-atlas-owner': ownerKey() ?? ''}, cache: 'no-store'}); st = x.status; try { j = (await x.json()) ?? {}; } catch { j = {}; } } catch { st = 0; }
    go.disabled = false;
    if (st === 404) { KK = false; render(); return; } // 카카오 가입이 꺼짐 — 칸을 지움
    if (st === 200 && j.ok === true && j.used === false) say('ok', '처음 확인', when(j.at) ? when(j.at) + '에 만든 번호예요.' : '');
    else if (st === 200 && j.ok === true) say('', '이미 확인한 번호', when(j.usedAt) ? when(j.usedAt) + '에 확인했어요.' : '');
    else if (st === 200) say('', '없는 번호', '번호를 다시 봐 주세요.');
    else if (st === 403) say('', why({error: 'owner_only'}));
    else say('', '지금은 확인하지 못했어요. 잠시 뒤 다시 해 보세요.');
  }});
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go.click(); } });
  return h('section', {class: 'card kk'}, h('h2', {text: '친구 3명 확인 번호'}), h('p', {text: '친구 소개로 받은 번호를 넣고 맞대 보세요.'}), h('p', {class: 'note', text: '처음 확인하면 서버에 「확인함」으로 적혀요.'}), inp, go, m);
}
function keyCard() {
  return h('details', {class: 'card keyd'}, h('summary', {text: '다른 기기에서도 쓰려면'}),
    h('p', {text: '열쇠 주소를 보관해 두세요. 그 주소를 열면 같은 편지함이 열려요.'}),
    h('button', {class: 'ghost', type: 'button', text: '열쇠 주소 담기', onclick: async () => { try { await navigator.clipboard.writeText(location.origin + '/letter.html#key=' + myKey()); toast('열쇠 주소를 담았어요. 남에게 보내지 마세요.'); } catch { toast('담지 못했어요.'); } }}));
}

async function load() {
  const r = await api('GET'); S = r.status === 200 ? r.body : null;
  if (S) S.off = Date.parse(S.now) - Date.now();
  P = null;
  if (S && (S.member || S.owner)) { const p = await api('GET', null, S.prev); P = p.status === 200 ? p.body : null; if (P?.letters?.length) await siteData(); }
  KK = S?.owner ? await kakaoOn() : false; // 사장님 열쇠 기기에서만 물음(다른 사람 기기는 카카오 길을 안 부름)
  render();
}
function render() {
  const join = joinCode();
  const kids = [hero()];
  if (!S) kids.push(h('section', {class: 'card'}, h('p', {text: '지금은 편지함에 닿지 못했어요.'}), h('button', {class: 'ghost', type: 'button', text: '다시 열기', onclick: load})));
  else if (!S.member) {
    if (join) kids.push(joinCard(join));
    else kids.push(h('section', {class: 'card'}, h('h2', {text: '초대받은 분만 쓸 수 있어요'}), h('p', {text: '둘이를 쓰는 친구에게 초대장을 받아 보세요.'}),
      h('p', {class: 'note', text: '열린 편지도 지금은 회원만 읽어요.'}), h('a', {class: 'ghost link', href: '/hello.html', text: '둘이 소개 보기 ›'})));
  } else kids.push(S.mine ? mineCard() : writeCard());
  if (S && (S.member || S.owner)) {
    const sec = h('section', {class: 'open'}, h('h2', {text: md(S.prev + 'T11:00:00Z') + ' 여는 밤'}));
    if (P?.letters?.length) { sec.append(h('p', {class: 'note', text: '배웠어요가 많은 편지부터 보여요.'})); for (const L of P.letters) sec.append(letterCard(L, S.prev)); }
    else sec.append(h('p', {class: 'note', text: '지난주엔 열린 편지가 없어요. 이번 주가 첫 여는 밤이에요.'}));
    kids.push(sec);
  }
  if (S?.member) kids.push(invitesCard(), keyCard());
  if (S?.owner) { kids.push(ownerCard()); if (KK) kids.push(kakaoCard()); }
  kids.push(h('p', {class: 'foot', text: '편지는 쓴 사람의 말이에요. 둘이는 사고팔기를 권하지 않아요.'}), h('p', {class: 'foot'}, h('a', {class: 'ghost link back', href: '/', text: '둘이로 돌아가기 ›'}))); // 돌아가기 = 단추 꼴 · 높이 48px(사장님 2026-10-18 [7] 10 「돌아가기 단추는 44px 이상」 — 잰 값 25px)
  root.replaceChildren(...kids);
}

/* 주소의 열쇠 — #key= 는 이 기기에 넣고 주소에서 바로 지움 · #owner= 는 초대장 쪽과 같은 자리에 */
(function keysFromUrl() {
  const k = /(?:^#|&)key=([A-Za-z0-9_-]{43})(?:&|$)/.exec(location.hash)?.[1], o = /(?:^#|&)owner=([A-Za-z0-9_-]{16,128})(?:&|$)/.exec(location.hash)?.[1];
  if (k) store.set(KEY, k); if (o) store.set(OWNER, o);
  if (k || o) history.replaceState(null, '', location.pathname);
})();
load();
