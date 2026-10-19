/* 관심 업종 · 알림(사이트 안) — 사장님 2026-10-19(싱가포르) 20:40 「다해」(못 한 것 1 카톡 알림) · 20:50 「너가 알아서 햐」
   견본 flow36 18 쪽(관심 담기 · 꽃 선 넘으면 알림) · 26 쪽(알림 — 싹에 들어오면 · 꽃 선을 넘으면 · 시듦으로 가면 · 날마다 아침 한 줄)
   이 판은 사이트 안 알림만: 이 기기 저장소(localStorage)에 관심 업종 · 알림 켜짐 · 지난번 본 자리를 두고, 돌이를 열면 첫 화면 테마 칸에 바뀐 자리를 알림
   카톡으로 보내기는 아직 없음 — 회원의 카톡 열쇠를 서버에 보관해야 해서 사장님이 분명히 허락하실 때 따로 만듦(2026-10-19 20:52 보고)
   서버에 묻지 않음 · 자리는 theme-home.json / theme.json 의 z(셈은 결정표 그대로) · 글은 textContent 로만 · 수익 숫자 없음 */
import {ZONES} from './theme-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
export const K_WATCH = 'dori:watch-ind', K_SET = 'dori:alert-set', K_SEEN = 'dori:watch-seen';
export const WATCH_MAX = 20;
/** 알림 넷(견본 26 쪽) — S 싹에 들어오면 · B 꽃 선을 넘으면 · W 시듦으로 가면 · M 날마다 아침 한 줄 */
export const ALERTS = Object.freeze([['S', '관심 업종이 싹에 들어오면'], ['B', '관심 업종이 꽃 선을 넘으면'], ['W', '관심 업종이 시듦으로 가면'], ['M', '날마다 아침 한 줄']]);
const get = (k, d) => { try { return nx()?.store ? nx().store.get(k, d) : JSON.parse(localStorage.getItem(k) ?? 'null') ?? d; } catch { return d; } };
const put = (k, v) => { try { return nx()?.store ? nx().store.set(k, v) : (localStorage.setItem(k, JSON.stringify(v)), true); } catch { return false; } };
const okName = n => typeof n === 'string' && n.length > 0 && n.length <= 40;

/** 관심 업종(담은 차례 · 겹침 없음 · 20곳까지) */
export const watchList = () => { const a = get(K_WATCH, []); return Array.isArray(a) ? [...new Set(a.filter(okName))].slice(0, WATCH_MAX) : []; };
export const isWatched = n => watchList().includes(n);
/** 알림 켜짐 — 처음엔 넷 다 켜짐 */
export function alertSet() { const s = get(K_SET, null), o = {}; for (const [k] of ALERTS) o[k] = s && typeof s[k] === 'boolean' ? s[k] : true; return o; }
export function setAlert(k, on) { const s = alertSet(); s[k] = !!on; return put(K_SET, s); }
/** 지난번 본 자리 {asOf, zones:{업종: 자리}, news:[{n, from, to}]} */
const seenOf = () => { const s = get(K_SEEN, null); return s && typeof s === 'object' && s.zones && typeof s.zones === 'object' ? {asOf: typeof s.asOf === 'string' ? s.asOf : null, zones: s.zones, news: Array.isArray(s.news) ? s.news : []} : {asOf: null, zones: {}, news: []}; };
/** 담기 · 빼기 — 담을 때 지금 자리를 「본 자리」로 둠(담자마자 「바뀌었어요」가 나오지 않게) · 돌려줌 = 담김 여부 */
export function toggleWatch(n, z = null) {
  if (!okName(n)) return false;
  const a = watchList(), on = !a.includes(n), next = on ? [...a, n].slice(-WATCH_MAX) : a.filter(x => x !== n);
  put(K_WATCH, next);
  const s = seenOf();
  if (on && z && ZONES[z]) s.zones[n] = z; else if (!on) { delete s.zones[n]; s.news = s.news.filter(x => x.n !== n); }
  put(K_SEEN, s);
  return on;
}
/** 바뀐 자리 — TH(theme-home.json 또는 theme.json)의 기준 날이 바뀔 때마다 한 번 셈(같은 날 다시 열면 같은 소식) */
export function newsOf(TH) {
  const w = watchList(); if (!w.length || !TH?.inds) return {news: [], now: []};
  const zOf = new Map(TH.inds.map(i => [i.n, i.z])), s = seenOf();
  const now = w.map(n => ({n, z: zOf.get(n) ?? null})).filter(x => x.z);
  if (s.asOf !== TH.asOf) {
    const news = now.filter(x => s.zones[x.n] && s.zones[x.n] !== x.z).map(x => ({n: x.n, from: s.zones[x.n], to: x.z}));
    const zones = {...s.zones}; for (const x of now) zones[x.n] = x.z;
    put(K_SEEN, {asOf: TH.asOf, zones, news}); return {news, now};
  }
  for (const x of now) if (!s.zones[x.n]) { s.zones[x.n] = x.z; put(K_SEEN, s); }
  return {news: s.news.filter(x => w.includes(x.n)), now};
}
/** 소식 한 줄 글(자리로 · 업종 이름 뒤 조사 없이) — 켜짐(S · B · W)을 따름 · 잠잠으로 간 것은 아침 한 줄에만 */
export function newsText(x) { return x.to === 'S' ? '싹 자리에 들어왔어요' : x.to === 'B' ? '꽃 선을 넘었어요' : x.to === 'W' ? '시듦 자리로 갔어요' : '잠잠 자리로 갔어요'; }
const wanted = (x, set) => (x.to === 'S' ? set.S : x.to === 'B' ? set.B : x.to === 'W' ? set.W : false);

/** 첫 화면 테마 칸 — 관심 업종 소식(담은 업종이 없거나 알릴 것이 없으면 null) */
export function noticeBox(TH) {
  const {news, now} = newsOf(TH), set = alertSet(), show = news.filter(x => wanted(x, set));
  if (!show.length && !(set.M && now.length)) return null;
  const box = h('section', {class: 'th-news', 'aria-label': '관심 업종 소식'}, h('p', {class: 'th-nh', text: show.length ? '관심 업종 소식' : '관심 업종 지금 자리'}));
  for (const x of show) box.append(h('a', {class: 'th-nl', href: '#/t/i/' + enc(x.n)}, h('b', {text: x.n}), h('span', {text: ' ' + newsText(x)})));
  if (set.M && now.length) box.append(h('p', {class: 'th-nm', text: now.map(x => x.n + ' ' + (ZONES[x.z] ?? '?')).join(' · ')}));
  box.append(h('a', {class: 'th-hi', href: '#/t/alert', text: '알림 설정 ›'}));
  return box;
}
/** 업종 쪽 · 관심 담기 쪽 단추 — 관심 업종에 담기 · 빼기(토스트) */
export function watchBtn(i, label = null) {
  const txt = on => (label ? (on ? label + ' ✓' : label) : on ? '관심 업종에 담았어요 ✓' : '관심 업종에 담기');
  const on0 = isWatched(i.n), b = h('button', {class: 'th-keep th-watch', type: 'button', 'aria-pressed': String(on0), text: txt(on0)});
  b.addEventListener('click', e => { e.preventDefault(); const on = toggleWatch(i.n, i.z); b.setAttribute('aria-pressed', String(on)); b.textContent = txt(on); nx()?.toast?.(on ? '관심 업종에 담았어요. 자리가 바뀌면 첫 화면에서 알려요.' : '관심 업종에서 뺐어요.'); });
  return b;
}
/** 알림 쪽 켜기 단추(역할 switch) */
export function alertSwitch(k, label) {
  const on0 = alertSet()[k], b = h('button', {class: 'th-sw', type: 'button', role: 'switch', 'aria-checked': String(on0), 'aria-label': label, text: on0 ? '켜짐' : '꺼짐'});
  b.addEventListener('click', e => { e.preventDefault(); const on = !alertSet()[k]; setAlert(k, on); b.setAttribute('aria-checked', String(on)); b.textContent = on ? '켜짐' : '꺼짐'; });
  return h('div', {class: 'th-al'}, h('span', {class: 'th-alt', text: label}), b);
}
export {num};
