/* ATLAS 11 · 껍데기·길찾기 — 52곳 판(예측 없음)
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   아래 탭 둘: 「52곳」(#/ · 처음 화면) · 「일정」(#/agenda) — 회사 화면(#/stock/CODE)은 「52곳」에 속한다.
   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records)는 처음 화면으로 돌린다. */
import {h, speakScreen, stopSpeak} from './util.js';
import {state, loadManifest, prefs, url} from './store.js';
import {renderHome} from './view-home.js';
import {renderCompany} from './view-company.js';
import {renderAgenda} from './view-agenda.js';

const app = {view: null, manifest: null};
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3M8 17h6"/></svg>',
};
const routes = [
  {id: 'home', label: '52곳', match: /^(#\/?)?$/, render: renderHome},
  {id: 'stock', tab: 'home', match: /^#\/stock\/\d{6}$/, render: renderCompany},
  {id: 'agenda', label: '일정', match: /^#\/agenda$/, render: renderAgenda},
];
const TABS = ['home', 'agenda'];
const FONT_STEPS = [100, 125, 150, 175, 200];

function applyFont() { const step = Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0))); document.documentElement.style.fontSize = FONT_STEPS[step] + '%'; document.documentElement.dataset.fontStep = String(step); }
/** 소리 단추 그림 — 선으로 그린 확성기(글자색을 따른다) */
function speakerIcon() {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, String(v));
  for (const d of ['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13']) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
  return svg;
}
const voice = {on: false};
/** 맨 위: 둥근 단추 둘 — 「가」(글씨 100→125→150→175→200→100%) · 소리 */
function header() {
  const speakBtn = h('button', {class: 'round speak', id: 'voice-btn', type: 'button', 'aria-label': '소리로 듣기', 'aria-pressed': 'false', onclick: () => {
    voice.on = !voice.on; speakBtn.classList.toggle('on', voice.on); speakBtn.setAttribute('aria-pressed', String(voice.on));
    if (voice.on) speakScreen(state.summary || '읽을 내용이 없습니다'); else stopSpeak();
  }}, speakerIcon());
  document.getElementById('top').replaceChildren(h('div', {class: 'top-inner'},
    h('a', {class: 'wordmark', href: '#/', 'aria-label': 'ATLAS 처음 화면'}, 'ATLAS'),
    h('button', {class: 'round font', id: 'font-btn', type: 'button', 'aria-label': '글씨 크기', onclick: () => { prefs.set('font', (prefs.get('font', 0) + 1) % FONT_STEPS.length); applyFont(); fontLabel(); route(); }}, '가'),
    speakBtn));
  fontLabel();
  const tab = r => h('a', {href: r.id === 'home' ? '#/' : '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}}, h('span', {class: 'icon', 'aria-hidden': 'true', html: ICON[r.id]}), h('span', {class: 'label'}, r.label));
  document.getElementById('bottom').replaceChildren(...TABS.map(id => tab(routes.find(r => r.id === id))));
}
function fontLabel() { const b = document.getElementById('font-btn'); if (b) b.setAttribute('aria-label', `글씨 크기 ${FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0)))]}% (누를 때마다 커지고 200% 다음은 100%)`); }
function markActive(id) { for (const el of document.querySelectorAll('[data-route]')) { const on = el.dataset.route === id; el.classList.toggle('active', on); if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); } }

async function route() {
  let hash = location.hash;
  if (hash === '#main') { document.getElementById('main')?.focus(); return; } // 「본문으로 건너뛰기」는 화면을 바꾸지 않는다
  let r = routes.find(x => x.match.test(hash));
  // 지운 화면의 옛 주소 → 처음 화면(주소 줄도 「#/」로 바꿔 둔다)
  if (!r) { r = routes[0]; hash = '#/'; history.replaceState(null, '', location.pathname + location.search + '#/'); }
  stopSpeak(); voice.on = false; document.getElementById('voice-btn')?.classList.remove('on'); document.getElementById('voice-btn')?.setAttribute('aria-pressed', 'false');
  markActive(r.tab ?? r.id); app.view = r.id; state.summary = '';
  const main = document.getElementById('main');
  main.dataset.view = r.id; document.body.dataset.view = r.id;
  try { await r.render(main, {hash, manifest: app.manifest}); }
  catch (e) { main.replaceChildren(failure('화면을 그리지 못했습니다', e)); }
  window.scrollTo({top: 0});
}
function failure(title, e) {
  return h('section', {class: 'b-box failure', role: 'alert'}, h('h1', {class: 'b-box-h'}, title), h('p', {class: 'muted'}, String(e?.message ?? e)), h('button', {class: 'b-btn', type: 'button', onclick: () => location.reload()}, '다시 불러오기'));
}

/* 새 판 감시: 화면을 바꾸지 않고 알림만(다시 열면 새 판) */
async function watchManifest() {
  try {
    const r = await fetch(url('data/atlas11/view/manifest.json'), {cache: 'no-cache'}); if (!r.ok) return;
    const m = await r.json();
    if (m.boardId && app.manifest && m.boardId !== app.manifest.boardId && !document.getElementById('new-board')) {
      document.getElementById('main').prepend(h('div', {id: 'new-board', class: 'b-note', role: 'status'}, '새 자료가 올라왔습니다. ', h('button', {class: 'b-link', type: 'button', onclick: () => location.reload()}, '새 자료로 다시 열기')));
    }
  } catch {}
}

async function start() {
  applyFont();
  const main = document.getElementById('main');
  main.replaceChildren(h('section', {class: 'b-box loading', role: 'status', 'aria-live': 'polite'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('p', null, '자료 목록(manifest.json)을 읽는 중입니다…')));
  try { app.manifest = await loadManifest(); }
  catch (e) { main.replaceChildren(failure('자료 목록을 읽지 못했습니다', e)); return; }
  header();
  window.addEventListener('hashchange', route);
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
}
start();
