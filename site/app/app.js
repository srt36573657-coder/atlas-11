/* ATLAS 11 · 껍데기·길찾기 — 메뉴 넷: 전망 / 1만원 비교 / 성적 / 진화. 자료 상태는 보조.
   v9: 머리 = 메뉴 한 줄 + 시장 띠 한 줄(코스피·코스닥·기준 시각). 발행본 정보 칩은 지우고 각 화면 헤드라인 숫자의 출처 칸으로 옮김. */
import {h, speakScreen, stopSpeak, korDate} from './util.js';
import {state, loadManifest, prefs, url} from './store.js';
import {marketStrip} from './frame.js';
import {renderForecast, pauseAllPlayers} from './view-forecast.js';
import {renderRace, pauseRace} from './view-race.js';
import {renderScores, renderStatus} from './view-scores.js';
import {renderEvolution} from './view-evolution.js';
import {renderRecords} from './view-records.js';

const app = {view: null, manifest: null};
const routes = [
  {id: 'forecast', label: '전망', icon: '◔', match: /^#\/(forecast|stock\/\d{6})?$|^$|^#\/?$/, render: renderForecast},
  {id: 'race', label: '1만원 비교', icon: '≋', match: /^#\/race/, render: renderRace},
  {id: 'scores', label: '성적', icon: '✓', match: /^#\/scores/, render: renderScores},
  {id: 'evolution', label: '진화', icon: '↻', match: /^#\/evolution/, render: renderEvolution},
  {id: 'status', label: '자료 상태', icon: '▤', match: /^#\/status/, render: renderStatus, aux: true},
  {id: 'records', label: '기록', icon: '≡', match: /^#\/records/, render: renderRecords, aux: true},
];
const FONT_STEPS = [100, 125, 150, 175, 200];

function applyFont() { const step = Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0))); document.documentElement.style.fontSize = FONT_STEPS[step] + '%'; document.documentElement.dataset.fontStep = String(step); }
function header(m) {
  const top = document.getElementById('top');
  top.replaceChildren(
    h('div', {class: 'top-inner'},
      h('a', {class: 'brand', href: '#/forecast', 'aria-label': 'ATLAS 처음 화면'}, h('span', {class: 'wordmark'}, 'ATLAS')),
      h('nav', {class: 'top-nav', 'aria-label': '주요 화면'}, ...routes.filter(r => !r.aux).map(r => h('a', {href: '#/' + r.id, class: 'top-link', dataset: {route: r.id}}, r.label))),
      h('div', {class: 'top-tools'},
        h('button', {class: 'tool', type: 'button', 'aria-label': '글씨 작게', onclick: () => { prefs.set('font', Math.max(0, prefs.get('font', 0) - 1)); applyFont(); route(); }}, 'A−'),
        h('button', {class: 'tool', type: 'button', 'aria-label': '글씨 크게 (최대 200%)', onclick: () => { prefs.set('font', Math.min(FONT_STEPS.length - 1, prefs.get('font', 0) + 1)); applyFont(); route(); }}, 'A+'),
        h('button', {class: 'tool speak', type: 'button', 'aria-label': '이 화면 읽어주기', 'aria-pressed': 'false', onclick: ev => { const b = ev.currentTarget; if (b.classList.toggle('on')) { b.setAttribute('aria-pressed', 'true'); if (!speakScreen(state.summary || '읽을 내용이 없습니다')) b.classList.remove('on'); setTimeout(() => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }, 30000); } else { stopSpeak(); b.setAttribute('aria-pressed', 'false'); } }}, '🔊'),
        h('a', {class: 'tool aux', href: '#/records', 'aria-label': '기록 검색', dataset: {route: 'records'}}, '기록'),
        h('a', {class: 'tool aux', href: '#/status', 'aria-label': '자료 상태', dataset: {route: 'status'}}, '자료 상태'))),
    marketStrip(m));
  document.getElementById('bottom').replaceChildren(...routes.filter(r => !r.aux).map(r => h('a', {href: '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}}, h('span', {class: 'icon', 'aria-hidden': 'true'}, r.icon), h('span', null, r.label))));
}
function markActive(id) { for (const el of document.querySelectorAll('[data-route]')) el.classList.toggle('active', el.dataset.route === id); }

async function route() {
  const hash = location.hash || '#/forecast';
  const r = routes.find(r => r.match.test(hash)) ?? routes[0];
  pauseAllPlayers(); pauseRace(); stopSpeak();
  markActive(r.id); app.view = r.id; state.summary = '';
  const main = document.getElementById('main');
  main.dataset.view = r.id;
  try { await r.render(main, {hash, manifest: app.manifest}); }
  catch (e) { main.replaceChildren(failure('화면을 그리지 못했습니다', e)); }
  window.scrollTo({top: 0});
}
function failure(title, e) {
  return h('section', {class: 'card failure', role: 'alert'}, h('h1', null, title), h('p', {class: 'muted'}, String(e?.message ?? e)), state.lastGood ? h('p', {class: 'muted'}, `마지막 정상 자료: 발행본 `, h('code', null, state.lastGood.forecastId), ` · 기준 ${korDate(state.lastGood.actualAsOf)} 15:30 KST 종가`) : null, h('button', {class: 'primary', type: 'button', onclick: () => location.reload()}, '다시 불러오기'));
}

/* 새 발행본 감시: 재생 중에 바꾸지 않고 알림만 (다음에 열 때 적용) */
async function watchManifest() {
  try {
    const r = await fetch(url('data/atlas11/view/manifest.json'), {cache: 'no-cache'}); if (!r.ok) return;
    const m = await r.json();
    if (m.forecastId && app.manifest && m.forecastId !== app.manifest.forecastId && !document.getElementById('new-edition')) {
      document.getElementById('main').prepend(h('div', {id: 'new-edition', class: 'banner'}, `새 발행본(${m.forecastId})이 올라왔습니다. 지금 화면은 ${app.manifest.forecastId} 그대로 유지합니다. `, h('button', {class: 'link', type: 'button', onclick: () => location.reload()}, '새 발행본으로 다시 열기')));
    }
  } catch {}
}

/* Esc: 열린 알림·바텀시트·팝오버를 닫는다 */
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return;
  const notice = document.getElementById('notice'); if (notice && !notice.hidden) { notice.querySelector('button')?.click(); return; }
  const sheet = document.querySelector('.explain.open'); if (sheet) { sheet.querySelector('.close')?.click(); return; }
  const src = [...document.querySelectorAll('.hl-src')].find(x => !x.hidden); if (src) { src.hidden = true; document.querySelector(`[aria-controls="${src.id}"]`)?.setAttribute('aria-expanded', 'false'); }
});

async function start() {
  applyFont();
  const main = document.getElementById('main');
  main.replaceChildren(h('section', {class: 'card loading', role: 'status', 'aria-live': 'polite'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('p', null, '발행본 목록(manifest.json)을 읽는 중입니다…'), h('div', {class: 'skeleton-grid', 'aria-hidden': 'true'}, ...Array.from({length: 8}, () => h('div', {class: 'skeleton'})))));
  try { app.manifest = await loadManifest(); }
  catch (e) { main.replaceChildren(failure('발행본을 읽지 못했습니다', e)); return; }
  header(app.manifest);
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseAllPlayers(); pauseRace(); } });
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
}
start();
