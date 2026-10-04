/* ATLAS 11 · 껍데기·길찾기 — 우량주·시대 트렌드 180곳 판(예측 없음)
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   2026-10-04 20:52 「대표 52개념도 삭제해 총 180개에서 섹타를 구분해」 — 처음 화면은 180곳을 섹터로 나눠 보인다.
   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면(#/stock/CODE) · 두 번이면 어디든
   2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 잡스라면 그리고 애플이라면 해서 추가로 더 만들어」 — 출목표 한 판(#/road)
   아래 탭 셋: 처음 화면(#/ · 이름은 지금 묶음의 곳 수 「180곳」) · 「출목표」(#/road) · 「일정」(#/agenda) — 업종·회사 화면은 처음 화면에 속한다.
   지금 탭을 한 번 더 누르면 맨 위로 · 출목표 한 판은 회사 화면에 갔다 와도 보던 자리 그대로(아이폰 탭 막대처럼).
   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records)는 처음 화면으로 돌린다.
   2026-10-05 02:44 「잡스였다면」 개혁: 불러오는 동안 파일 이름 같은 기술 말 대신 회색 자리 표시(애플 HIG 「바로 열리고, 빈칸 대신 자리 표시」)
     · 그래프 선 그리기(0.3초)는 화면마다 처음 한 번만 — 같은 화면을 다시 그릴 때(묶음 바꾸기 · 글씨 단추)는 움직이지 않는다(애플 HIG 움직임: 목적이 있을 때만)
   2026-10-05 05:03 사장님 「탬을 두개 더 만든다 … 불장 그리고 뭐뭐가 있잖아 그걸 탭 처리로 하지 지금은 밑으로 내려애ㅣㅑ 하잖아」 · 05:07 「해」
     아래 탭 다섯: 불장(#/ · 36칸 판) · 예비(#/similar · 불장 닮은 7곳 · 저녁 7시 들고 남) · 22곳(#/rise · 불장 밖에서 많이 오른 곳) · 출목표(#/road) · 일정(#/agenda)
     업종·회사 화면은 들어온 탭에 속한다(예비 탭에서 회사를 누르면 예비 탭이 눌린 채로) */
import {h, speakScreen, stopSpeak} from './util.js';
import {state, loadManifest, prefs, url} from './store.js';
import {renderHome} from './view-home.js';
import {renderCompany} from './view-company.js';
import {renderIndustry} from './view-industry.js';
import {renderAgenda} from './view-agenda.js';
import {renderRoad} from './view-road.js';
import {renderSimilar} from './view-similar.js';
import {renderRise} from './view-rise.js';

const app = {view: null, manifest: null, tab: 'home'};
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
  road: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5" cy="5" r="2.6"/><circle cx="5" cy="12" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="12" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="19" cy="12" r="2.6"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3M8 17h6"/></svg>',
  // 예비: 반짝임 하나(큰 별 + 작은 별) — 「눈여겨볼 것」
  similar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 11.9 9.1 17.5 11 11.9 12.9 10 18.5 8.1 12.9 2.5 11 8.1 9.1z"/><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  // 22곳: 차례 목록(점 셋 + 줄 셋)
  rise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11.5M9 12h11.5M9 18h11.5"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
};
const routes = [
  {id: 'home', label: '불장', match: /^(#\/?)?$/, render: renderHome},
  {id: 'industry', tab: 'from', match: /^#\/i\/[a-z0-9]+$/, render: renderIndustry},
  {id: 'stock', tab: 'from', match: /^#\/stock\/\d{6}$/, render: renderCompany},
  {id: 'similar', label: '예비', match: /^#\/similar$/, render: renderSimilar},
  {id: 'rise', label: '22곳', match: /^#\/rise$/, render: renderRise},
  {id: 'road', label: '출목표', match: /^#\/road$/, render: renderRoad},
  {id: 'agenda', label: '일정', match: /^#\/agenda$/, render: renderAgenda},
];
const TABS = ['home', 'similar', 'rise', 'road', 'agenda'];
/** 보던 자리 기억(출목표 · 닮은 7곳 · 22곳) — 회사 화면에 갔다 돌아오면 그 자리 */
const KEEP_SCROLL = new Set(['road', 'similar', 'rise']), scrollMemo = new Map();
/** 선 그리기 움직임을 이미 보인 화면 */
const drawn = new Set();
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
  // 「22곳」 탭 이름 = 판에 실린 곳 수(판 목록에 없으면 22곳)
  const label = r => r.id === 'rise' && Number.isInteger(app.manifest?.counts?.next) ? `${app.manifest.counts.next}곳` : r.label;
  // 지금 보고 있는 탭을 다시 누르면 맨 위로(주소가 그대로라 화면은 다시 그리지 않음)
  const toTop = (e, r) => { if (app.view === r.id) { e.preventDefault(); scrollMemo.delete(r.id); window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); } };
  const tab = r => h('a', {href: r.id === 'home' ? '#/' : '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}, onclick: e => toTop(e, r)}, h('span', {class: 'icon', 'aria-hidden': 'true', html: ICON[r.id]}), h('span', {class: 'label'}, label(r)));
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
  if (app.view && KEEP_SCROLL.has(app.view)) scrollMemo.set(app.view, window.scrollY);
  if (app.view !== r.id) state.from = app.view; // 회사 화면 「‹ 되돌아가기」가 온 곳을 알도록(글씨 단추로 같은 화면을 다시 그릴 때는 그대로)
  // 업종·회사 화면은 들어온 탭이 눌린 채로(탭 막대에 없는 화면) · 탭 화면이면 그 탭을 기억
  if (TABS.includes(r.id)) app.tab = r.id;
  markActive(r.tab === 'from' ? app.tab : r.tab ?? r.id); app.view = r.id; state.summary = '';
  document.documentElement.toggleAttribute('data-drawn', drawn.has(r.id)); drawn.add(r.id); // 이 화면을 이미 한 번 그렸으면 선 그리기 움직임 없이
  const main = document.getElementById('main');
  main.dataset.view = r.id; document.body.dataset.view = r.id;
  try { await r.render(main, {hash, manifest: app.manifest}); }
  catch (e) { main.replaceChildren(failure('화면을 그리지 못했습니다', e)); }
  setTimeout(() => { if (app.view === r.id) document.documentElement.setAttribute('data-drawn', ''); }, 450); // 다 그린 뒤에는 같은 화면 안에서 다시 그려도(묶음 바꾸기) 움직이지 않음
  window.scrollTo({top: KEEP_SCROLL.has(r.id) ? (scrollMemo.get(r.id) ?? 0) : 0});
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
  main.replaceChildren(h('section', {class: 'b-box loading', role: 'status', 'aria-live': 'polite'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('p', null, '자료를 불러오는 중입니다'),
    h('div', {class: 'sk', 'aria-hidden': 'true'}, h('span', {class: 'sk-t'}), h('span', {class: 'sk-l'}), h('span', {class: 'sk-g'}))));
  try { app.manifest = await loadManifest(); }
  catch (e) { main.replaceChildren(failure('자료 목록을 읽지 못했습니다', e)); return; }
  header();
  window.addEventListener('hashchange', route);
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
}
start();
