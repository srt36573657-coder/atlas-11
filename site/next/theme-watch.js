/* 관심 업종 · 알림(사이트 안) — 사장님 2026-10-19(싱가포르) 20:40 「다해」(못 한 것 1 카톡 알림) · 20:50 「너가 알아서 햐」
   견본 flow36 18 쪽(관심 담기 · 꽃 선 넘으면 알림) · 26 쪽(알림 — 싹에 들어오면 · 꽃 선을 넘으면 · 시듦으로 가면 · 날마다 아침 한 줄)
   이 판은 사이트 안 알림만: 이 기기 저장소(localStorage)에 관심 업종 · 알림 켜짐 · 본 자리를 두고, 돌이를 열면 첫 화면 테마 칸에 바뀐 자리를 알림
   카톡으로 보내기는 아직 없음 — 회원의 카톡 열쇠를 서버에 보관해야 해서 사장님이 분명히 허락하실 때 따로 만듦(2026-10-19 20:52 보고)
   서버에 묻지 않음 · 자리는 theme-home.json / theme.json 의 z(셈은 결정표 그대로) · 글은 textContent 로만 · 수익 숫자 없음
   새 눈 검사(2026-10-19 22시) 고침: 저장이 막히면 「담았어요」라 하지 않음 · 같은 기준 날에 자료를 다시 만들면(16 · 19시) 소식도 다시 셈 ·
   21번째는 말없이 맨 앞을 빼지 않고 막음 · 깨진 기록은 버림 · 꽃 자리로 돌아온 것은 「꽃 선을 넘었어요」라 하지 않음 · 소식은 세 줄까지 */
import {ZONES} from './theme-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
export const K_WATCH = 'dori:watch-ind', K_SET = 'dori:alert-set', K_SEEN = 'dori:watch-seen';
export const WATCH_MAX = 20, NEWS_MAX = 3, MORN_MAX = 5;
/** 알림 넷(견본 26 쪽) — S 싹에 들어오면 · B 꽃 선을 넘으면 · W 시듦으로 가면 · M 날마다 아침 한 줄 */
export const ALERTS = Object.freeze([['S', '관심 업종이 싹에 들어오면'], ['B', '관심 업종이 꽃 선을 넘으면'], ['W', '관심 업종이 시듦으로 가면'], ['M', '날마다 아침 한 줄']]);
export const SAVE_FAIL = '이 기기에 담지 못했어요. 저장이 꺼져 있는지 봐 주세요.';
const get = (k, d) => { try { return nx()?.store ? nx().store.get(k, d) : JSON.parse(localStorage.getItem(k) ?? 'null') ?? d; } catch { return d; } };
/** 저장 — 담겼으면 true · 막혔으면 false(부른 쪽이 「담았어요」라 하지 않게) */
const put = (k, v) => { try { return nx()?.store ? nx().store.set(k, v) === true : (localStorage.setItem(k, JSON.stringify(v)), true); } catch { return false; } };
const okName = n => typeof n === 'string' && n.length > 0 && n.length <= 40;
const okZone = z => (typeof z === 'string' && Object.hasOwn(ZONES, z) ? z : null);
const zmap = o => { const r = {}; if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) if (okName(k) && okZone(v)) r[k] = v; return r; };
const okNews = x => !!x && typeof x === 'object' && okName(x.n) && !!okZone(x.from) && !!okZone(x.to);

/** 관심 업종(담은 차례 · 겹침 없음 · 20곳까지) */
export const watchList = () => { const a = get(K_WATCH, []); return Array.isArray(a) ? [...new Set(a.filter(okName))].slice(0, WATCH_MAX) : []; };
export const isWatched = n => watchList().includes(n);
/** 알림 켜짐 — 처음엔 넷 다 켜짐 */
export function alertSet() { const s = get(K_SET, null), o = {}; for (const [k] of ALERTS) o[k] = s && typeof s === 'object' && typeof s[k] === 'boolean' ? s[k] : true; return o; }
/** 돌려줌 = 이 기기에 담겼나 */
export function setAlert(k, on) { const s = alertSet(); s[k] = !!on; return put(K_SET, s); }
/** 본 자리 {asOf, base:{업종: 앞 기준 날에 마지막으로 본 자리}, zones:{업종: 이 기준 날에 본 자리}}
 *  소식 = base 와 지금 자리가 다른 업종 — 같은 기준 날에 자료를 다시 만들어도(16시 · 19시) 지금 자리로 다시 셈(시계와 소식이 늘 같음) */
const seenOf = () => { const s = get(K_SEEN, null), ok = s && typeof s === 'object' && !Array.isArray(s); return {asOf: ok && typeof s.asOf === 'string' ? s.asOf : null, base: ok ? zmap(s.base) : {}, zones: ok ? zmap(s.zones) : {}}; };
/** 담기 · 빼기 — 돌려줌 {on: 지금 담겼나, ok: 이 기기에 담겼나, full: 20곳이 차서 못 담음}
 *  담을 때 지금 자리를 바탕으로 둠(담자마자 「바뀌었어요」가 나오지 않게) */
export function toggleWatch(n, z = null) {
  if (!okName(n)) return {on: false, ok: false};
  const a = watchList(), was = a.includes(n);
  if (!was && a.length >= WATCH_MAX) return {on: false, ok: true, full: true};
  if (!put(K_WATCH, was ? a.filter(x => x !== n) : [...a, n])) return {on: was, ok: false};
  const s = seenOf(), zz = okZone(z);
  if (was) { delete s.base[n]; delete s.zones[n]; } else if (zz) { s.base[n] = zz; s.zones[n] = zz; }
  put(K_SEEN, s); // 못 담아도 관심 목록은 맞음 — 바탕이 없는 업종은 다음 셈에서 지금 자리를 바탕으로 둠(거짓 소식 없음)
  return {on: !was, ok: true};
}
/** 바뀐 자리 — TH(theme-home.json 또는 theme.json) 지금 자리와 바탕을 견줌 · 새 기준 날이면 앞 날에 본 자리가 새 바탕 */
export function newsOf(TH) {
  const w = watchList(); if (!w.length || !Array.isArray(TH?.inds)) return {news: [], now: []};
  const zOf = new Map(TH.inds.map(i => [i?.n, okZone(i?.z)])), day = typeof TH.asOf === 'string' ? TH.asOf : null, s = seenOf();
  const now = w.map(n => ({n, z: zOf.get(n) ?? null})).filter(x => x.z);
  const next = {asOf: day, base: s.asOf === day ? {...s.base} : {...s.base, ...s.zones}, zones: {...s.zones}};
  for (const n of Object.keys(next.base)) if (!w.includes(n)) delete next.base[n];
  for (const x of now) { if (!next.base[x.n]) next.base[x.n] = x.z; next.zones[x.n] = x.z; }
  for (const n of Object.keys(next.zones)) if (!w.includes(n)) delete next.zones[n];
  if (JSON.stringify(next) !== JSON.stringify(s)) put(K_SEEN, next); // 못 담으면 다음에 다시 셈(소식은 이번 셈 그대로 보임)
  return {news: now.filter(x => next.base[x.n] !== x.z).map(x => ({n: x.n, from: next.base[x.n], to: x.z})).filter(okNews), now};
}
/** 소식 한 줄 글(자리로 · 업종 이름 뒤 조사 없이) — 시듦에서 꽃으로 = 꽃 선은 이미 넘어 있었음 */
export function newsText(x) { return x.to === 'S' ? '싹 자리에 들어왔어요' : x.to === 'B' ? (x.from === 'W' ? '다시 꽃 자리로 왔어요' : '꽃 선을 넘었어요') : x.to === 'W' ? '시듦 자리로 갔어요' : '잠잠 자리로 갔어요'; }
const wanted = (x, set) => (x.to === 'S' ? set.S : x.to === 'B' ? set.B : x.to === 'W' ? set.W : false);

/** 첫 화면 테마 칸 — 관심 업종 소식(담은 업종이 없거나 알릴 것이 없으면 null) · 소식 세 줄 · 아침 한 줄 다섯 곳까지(넘으면 알림 쪽으로) */
export function noticeBox(TH) {
  const {news, now} = newsOf(TH), set = alertSet(), show = news.filter(x => wanted(x, set));
  if (!show.length && !(set.M && now.length)) return null;
  const box = h('section', {class: 'th-news', 'aria-label': '관심 업종 소식'}, h('p', {class: 'th-nh', text: show.length ? '관심 업종 소식' : '관심 업종 지금 자리'}));
  for (const x of show.slice(0, NEWS_MAX)) box.append(h('a', {class: 'th-nl', href: '#/t/i/' + enc(x.n)}, h('b', {text: x.n}), h('span', {text: ' ' + newsText(x)})));
  if (show.length > NEWS_MAX) box.append(h('a', {class: 'th-nl', href: '#/t/alert', 'data-tr': '업종', text: `그 밖에 ${num(show.length - NEWS_MAX)}곳도 자리가 바뀌었어요 ›`}));
  if (set.M && now.length) box.append(h('p', {class: 'th-nm'}, h('span', {text: now.slice(0, MORN_MAX).map(x => x.n + ' ' + (ZONES[x.z] ?? '?')).join(' · ')}), now.length > MORN_MAX ? h('span', {'data-tr': '업종', text: ` 외 ${num(now.length - MORN_MAX)}곳`}) : null));
  box.append(h('a', {class: 'th-hi', href: '#/t/alert', text: '알림 설정 ›'}));
  return box;
}
/** 업종 쪽 · 관심 담기 쪽 단추 — 관심 업종에 담기 · 빼기(토스트) · 막히면(저장 꺼짐 · 20곳 참) 단추는 그대로 두고 까닭을 알림 */
export function watchBtn(i, label = null) {
  const txt = on => (label ? (on ? label + ' ✓' : label) : on ? '관심 업종에 담았어요 ✓' : '관심 업종에 담기');
  const on0 = isWatched(i.n), b = h('button', {class: 'th-keep th-watch', type: 'button', 'aria-pressed': String(on0), text: txt(on0)});
  b.addEventListener('click', e => {
    e.preventDefault();
    const r = toggleWatch(i.n, i.z);
    if (r.full) { nx()?.toast?.(`관심 업종은 ${WATCH_MAX}곳까지예요. 알림 쪽에서 하나를 빼고 담아요.`); return; }
    if (!r.ok) { nx()?.toast?.(SAVE_FAIL); return; }
    b.setAttribute('aria-pressed', String(r.on)); b.textContent = txt(r.on);
    nx()?.toast?.(r.on ? '관심 업종에 담았어요. 자리가 바뀌면 첫 화면에서 알려요.' : '관심 업종에서 뺐어요.');
  });
  return b;
}
/** 알림 쪽 켜기 단추(역할 switch) — 막히면 그대로 */
export function alertSwitch(k, label) {
  const on0 = alertSet()[k], b = h('button', {class: 'th-sw', type: 'button', role: 'switch', 'aria-checked': String(on0), 'aria-label': label, text: on0 ? '켜짐' : '꺼짐'});
  b.addEventListener('click', e => { e.preventDefault(); const on = !alertSet()[k]; if (!setAlert(k, on)) { nx()?.toast?.(SAVE_FAIL); return; } b.setAttribute('aria-checked', String(on)); b.textContent = on ? '켜짐' : '꺼짐'; });
  return h('div', {class: 'th-al'}, h('span', {class: 'th-alt', text: label}), b);
}
export {num};
