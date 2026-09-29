/* ATLAS 11 · 껍데기·길찾기 — 메뉴 넷: 전망 / 1만원 비교 / 성적 / 진화. 자료 상태는 보조. */
import {h, stamp, speakScreen, stopSpeak, korDate, shortDate} from './util.js';
import {state, loadManifest, prefs, url} from './store.js';
import {renderForecast, pauseAllPlayers} from './view-forecast.js';
import {renderRace, pauseRace} from './view-race.js';
import {renderScores, renderEvolution, renderStatus} from './view-scores.js';
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
function integrityText() { const i = state.integrity; if (!i.available) return '무결성 검사: 보안 연결이 아니라 이 기기에서는 확인 불가'; if (i.failed.length) return `무결성 검사: 실패 ${i.failed.length}개 (${i.failed.join(', ')})`; return `무결성 검사: 읽은 파일 ${i.checked.length}개 전부 발행본 목록의 SHA-256 과 일치`; }
function header(m) {
  const top = document.getElementById('top');
  const fresh = m.dataStatus === 'current_close';
  const pop = h('div', {class: 'popover', id: 'edition-pop', hidden: true, role: 'dialog', 'aria-label': '발행본 정보'},
    h('h3', null, '이 화면의 발행본'),
    h('dl', null, h('dt', null, '발행본'), h('dd', null, h('code', null, m.forecastId)), h('dt', null, '기준일'), h('dd', null, `${korDate(m.actualAsOf)} ${fresh ? '확정 종가' : '보관 종가'}`), h('dt', null, '발행 시각'), h('dd', null, stamp(m.issuedAt) + ' (한국)'), h('dt', null, '미래'), h('dd', null, `${m.horizon}거래일 · ${shortDate(m.futureDates[0])}~${shortDate(m.futureDates.at(-1))}`), h('dt', null, '경로'), h('dd', null, `${(m.summary?.stocks ?? 52)}종목 × 모의 경로 ${Number(m.summary?.paths ?? 20000).toLocaleString('ko-KR')}`), h('dt', null, '검증'), h('dd', {id: 'integrity-text'}, integrityText())),
    h('p', {class: 'muted xs'}, '모든 화면이 이 한 발행본을 읽습니다. 다른 발행본의 숫자를 섞지 않습니다.'),
    h('button', {class: 'ctl', type: 'button', onclick: () => { pop.hidden = true; }}, '닫기'));
  const chip = h('button', {class: 'data-chip ' + (fresh ? 'fresh' : 'stale'), type: 'button', 'aria-expanded': 'false', 'aria-controls': 'edition-pop', title: '발행본 정보 보기', onclick: () => { pop.hidden = !pop.hidden; chip.setAttribute('aria-expanded', String(!pop.hidden)); document.getElementById('integrity-text').textContent = integrityText(); }}, h('span', {class: 'dot'}), h('span', {class: 'chip-long'}, `${fresh ? '확정 종가' : '보관 종가'} ${korDate(m.actualAsOf)}`), h('span', {class: 'chip-short'}, `${m.actualAsOf.slice(5).replace('-', '/')} ${fresh ? '확정' : '보관'}`));
  top.replaceChildren(
    h('div', {class: 'top-inner'},
      h('a', {class: 'brand', href: '#/forecast', 'aria-label': 'ATLAS 처음 화면'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('span', {class: 'brand-sub'}, '52종목 · 20거래일')),
      h('nav', {class: 'top-nav', 'aria-label': '주요 화면'}, ...routes.filter(r => !r.aux).map(r => h('a', {href: '#/' + r.id, class: 'top-link', dataset: {route: r.id}}, r.label))),
      h('div', {class: 'top-tools'},
        chip, pop,
        h('button', {class: 'tool', type: 'button', 'aria-label': '글씨 작게', onclick: () => { prefs.set('font', Math.max(0, prefs.get('font', 0) - 1)); applyFont(); }}, 'A−'),
        h('button', {class: 'tool', type: 'button', 'aria-label': '글씨 크게 (최대 200%)', onclick: () => { prefs.set('font', Math.min(FONT_STEPS.length - 1, prefs.get('font', 0) + 1)); applyFont(); }}, 'A+'),
        h('button', {class: 'tool speak', type: 'button', 'aria-label': '이 화면 읽어주기', 'aria-pressed': 'false', onclick: ev => { const b = ev.currentTarget; if (b.classList.toggle('on')) { b.setAttribute('aria-pressed', 'true'); if (!speakScreen(state.summary || '읽을 내용이 없습니다')) b.classList.remove('on'); setTimeout(() => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }, 30000); } else { stopSpeak(); b.setAttribute('aria-pressed', 'false'); } }}, '🔊'),
        h('a', {class: 'tool aux', href: '#/records', 'aria-label': '기록 검색'}, '기록'),
        h('a', {class: 'tool aux', href: '#/status', 'aria-label': '자료 상태'}, '자료 상태'))));
  document.getElementById('bottom').replaceChildren(...routes.filter(r => !r.aux).map(r => h('a', {href: '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}}, h('span', {class: 'icon', 'aria-hidden': 'true'}, r.icon), h('span', null, r.label))));
  document.addEventListener('atlas:integrity', () => { const el = document.getElementById('integrity-text'); if (el) el.textContent = integrityText(); });
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
  return h('section', {class: 'card failure', role: 'alert'}, h('h1', null, title), h('p', {class: 'muted'}, String(e?.message ?? e)), state.lastGood ? h('p', {class: 'muted'}, `마지막 정상 자료: 발행본 ${state.lastGood.forecastId} · 기준일 ${state.lastGood.actualAsOf}`) : null, h('button', {class: 'primary', type: 'button', onclick: () => location.reload()}, '다시 불러오기'));
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
  const pop = document.getElementById('edition-pop'); if (pop && !pop.hidden) { pop.hidden = true; document.querySelector('.data-chip')?.setAttribute('aria-expanded', 'false'); }
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
