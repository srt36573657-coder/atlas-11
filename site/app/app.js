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
import {renderTomorrow, stopStory, voice, voiceTurnedOn} from './view-tomorrow.js';

const app = {view: null, manifest: null};
/* 3차(2026-10-02 01:34 사장님 승인 3차 디자인 · 「aaa7377에 연결해봐」): 아래 탭은 둘 — 「내일」(#/forecast · 처음 화면) · 「성적」.
   진화는 지우지 않고 성적·자료 상태 화면에서 글 링크로 연다. 종목 상세(#/stock/CODE)는 그대로(「내일」 탭에 속함). */
const TABS = ['forecast', 'scores'];
/* 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」: 아래 탭 가운데에 「게임」(아틀라스 게임 · 따로 된 쪽 game/)을 더한다.
   게임은 이 앱의 # 화면이 아니라 다른 쪽이므로 routes 에 넣지 않고 아래 탭에만 링크로 둔다. */
const GAME_TAB = {href: 'game/', route: 'game', label: '게임'};
const ICON = {
  forecast: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="4.6"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5"/></g></svg>',
  game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="11" height="15" rx="2"/><path d="M9 21h9a2 2 0 0 0 2-2V8"/></svg>',
  scores: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20v-8M12 20V5M19 20v-5"/></svg>',
};
const routes = [
  {id: 'forecast', label: '내일', icon: '◔', match: /^#\/(forecast)?$|^$|^#\/?$/, render: renderTomorrow},
  {id: 'stock', label: '종목', tab: 'forecast', match: /^#\/stock\/\d{6}$/, render: renderForecast, aux: true},
  // 1만원 비교(여러 날 경주)는 「내일 하루만」이면 꺼 둠(2026-10-02 사장님 명령) — 메뉴에서 빼고, 주소로 오면 「꺼 둠」 한 줄만
  {id: 'race', label: '1만원 비교', icon: '≋', match: /^#\/race/, render: renderRace, off: m => Boolean(m?.tomorrowOnly)},
  {id: 'scores', label: '성적', icon: '✓', match: /^#\/scores/, render: renderScores},
  {id: 'evolution', label: '진화', icon: '↻', match: /^#\/evolution/, render: renderEvolution},
  {id: 'status', label: '자료 상태', icon: '▤', match: /^#\/status/, render: renderStatus, aux: true},
  {id: 'records', label: '기록', icon: '≡', match: /^#\/records/, render: renderRecords, aux: true},
];
const FONT_STEPS = [100, 125, 150, 175, 200];

function applyFont() { const step = Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0))); document.documentElement.style.fontSize = FONT_STEPS[step] + '%'; document.documentElement.dataset.fontStep = String(step); }
/** 소리 단추 그림 — 선으로 그린 확성기(이모지 대신 · 3차 시안과 같은 그림, 글자색을 따른다) */
function speakerIcon() {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, String(v));
  for (const d of ['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13']) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
  return svg;
}

/** 맨 위: 둥근 단추 둘만 — 「가」(글씨 100→125→150→175→200→100%) · 🔊(소리) */
function header() {
  const top = document.getElementById('top');
  const speakBtn = h('button', {class: 'round speak', id: 'voice-btn', type: 'button', 'aria-label': '소리로 듣기', 'aria-pressed': 'false', onclick: () => {
    voice.on = !voice.on; speakBtn.classList.toggle('on', voice.on); speakBtn.setAttribute('aria-pressed', String(voice.on));
    if (!voice.on) { stopSpeak(); return; }
    if (!(app.view === 'forecast' && voiceTurnedOn())) speakScreen(state.summary || '읽을 내용이 없습니다');
  }}, speakerIcon());
  top.replaceChildren(h('div', {class: 'top-inner'},
    h('button', {class: 'round font', id: 'font-btn', type: 'button', 'aria-label': '글씨 크기', onclick: () => { prefs.set('font', (prefs.get('font', 0) + 1) % FONT_STEPS.length); applyFont(); fontLabel(); if (app.view !== 'forecast') route(); }}, '가'),
    speakBtn));
  fontLabel();
  const tab = (href, id, label) => h('a', {href, class: 'bottom-link', dataset: {route: id}}, h('span', {class: 'icon', 'aria-hidden': 'true', html: ICON[id]}), h('span', {class: 'label'}, label));
  const links = TABS.map(id => routes.find(r => r.id === id)).map(r => tab('#/' + r.id, r.id, r.label));
  links.splice(1, 0, tab(GAME_TAB.href, GAME_TAB.route, GAME_TAB.label)); // 내일 · 게임 · 성적
  const bottom = document.getElementById('bottom'); bottom.dataset.tabs = String(links.length);
  bottom.replaceChildren(...links);
}
function fontLabel() { const b = document.getElementById('font-btn'); if (b) b.setAttribute('aria-label', `글씨 크기 ${FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0)))]}% (누를 때마다 커지고 200% 다음은 100%)`); }
function markActive(id) { for (const el of document.querySelectorAll('[data-route]')) el.classList.toggle('active', el.dataset.route === id); }

async function route() {
  const hash = location.hash || '#/forecast';
  const r = routes.find(r => r.match.test(hash)) ?? routes[0];
  pauseAllPlayers(); pauseRace(); stopSpeak(); stopStory();
  markActive(r.tab ?? r.id); app.view = r.id; state.summary = '';
  const main = document.getElementById('main');
  main.dataset.view = r.id; document.body.dataset.view = r.id;
  try {
    await (r.off?.(app.manifest) ? renderOff : r.render)(main, {hash, manifest: app.manifest});
    // 「내일」 밖의 화면: 시장 띠(코스피·코스닥·기준 시각)는 본문 맨 위에 그대로 · 성적·자료 상태에는 진화로 가는 글 링크
    if (r.id !== 'forecast') main.prepend(marketStrip(app.manifest));
    if (r.id === 'scores' || r.id === 'status') main.append(h('p', {class: 'evo-link'}, h('a', {href: '#/evolution'}, '진화 기록 보기 ›')));
    // 2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면): 「내일」 아래에 있던 「기록 · 자료 상태」 링크를 성적 화면 아래로 옮김(가는 길은 그대로)
    if (r.id === 'scores') main.append(h('p', {class: 't-links'}, h('a', {href: '#/records'}, '기록'), h('a', {href: '#/status'}, '자료 상태')));
  }
  catch (e) { main.replaceChildren(failure('화면을 그리지 못했습니다', e)); }
  window.scrollTo({top: 0});
}
/** 꺼 둔 화면: 지우지 않고 「꺼 둠」 한 줄만 (futureDays 20 이면 다시 켜짐) */
function renderOff(main, {manifest}) {
  state.summary = '1만원 비교는 꺼 두었습니다. ' + (manifest?.tomorrowOnly?.note ?? '');
  main.replaceChildren(h('section', {class: 'card panel', 'data-off': 'race'}, h('h1', {class: 'panel-title'}, '1만원 비교 · 꺼 둠'), h('p', {class: 'banner off-note', role: 'note'}, `1만원 비교(여러 날 경주)는 꺼 두었습니다(${manifest?.tomorrowOnly?.since ?? '2026-10-02'} 사장님 명령 · 지난 기록은 그대로)`), h('p', null, h('a', {href: '#/forecast'}, '전망 보기 ›'))));
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
  header();
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseAllPlayers(); pauseRace(); } });
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
}
start();
