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
     아래 탭 다섯: 불장(#/ · 36칸 판) · 예비(#/similar · 불장 닮은 7곳 · 저녁 7시 들고 남) · 22곳(#/rise · 불장 밖에서 오름 상위) · 출목표(#/road) · 일정(#/agenda)
     업종·회사 화면은 들어온 탭에 속한다(예비 탭에서 회사를 누르면 예비 탭이 눌린 채로)
   2026-10-05 10:24 「잡스라면 … 큰틀에서 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」 — 1차 올림(13~15번):
     아래 탭 넷: 불장(#/ · 불장 업종만, 큰 흐름) · 업종(#/map · 73칸 판) · 출목표(#/road) · 일정(#/agenda)
     예비(#/similar) · 오름 상위(#/rise)은 탭 「불장」 안 맨 위 스위치로(parts.js hotSwitch) — 내리지 않고 한 번 눌러 바뀜 · 셋 다 탭 「불장」이 눌린 채로
   2026-10-05 15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」: #/road/sun = 어느 화면에서든 출목표 「태양」으로(태양 하나로 잇기)
   2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 별도의 탭에 … 기록 하는 탭을 만들어 줘」: 아래 탭 여섯째 「기록」(#/log · view-log.js)
     넣으면서 뺀 것(규칙 1): 모든 화면 맨 아래 「기술 정보」 접힘 — 「기록」 탭 맨 아래로 옮김
   2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」: 아래 탭 일곱째 「처음」(#/start · view-start.js · 셈 lib/atlas11/start.mjs · 규칙 21)
     넣으면서 뺀 것(규칙 1): 첫 화면 맨 아래 접힌 「ATLAS가 하지 않는 일」 — 「처음」 탭 맨 아래로 옮김 */
import {h, speakScreen, stopSpeak, place, setPlace} from './util.js';
import {ON as I18N, LANG, LANG_LIST, LANG_INFO, startI18n, addBoardNames} from './i18n.js'; // 언어팩(2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 · 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게」) — 위 막대 말 단추
import {state, loadManifest, loadBoard, loadPlaceBoard, prefs, url} from './store.js';
import {renderHome, renderMap, renderLand} from './view-home.js';
import {renderCompany} from './view-company.js';
import {renderIndustry} from './view-industry.js';
import {renderAgenda} from './view-agenda.js';
import {renderRoad, resetRoad, openSun, openAt, openGroup} from './view-road.js';
import {renderSimilar} from './view-similar.js';
import {renderRise} from './view-rise.js';
import {renderFind} from './view-find.js';
import {renderLog} from './view-log.js';
import {renderStart} from './view-start.js';
import {renderGuide} from './view-guide.js'; // 한국 주식시장 안내(2026-10-07 05:31 「외국인들 특히 한국에 상주하는 외국인들도 한국 주식시장을 제대로 알수 있게」)
import {renderLong} from './view-long.js'; // 500만 원을 오래 들고 있었다면(2026-10-07 05:27 「10년후 20년후 30년후 장기보유 했을시 500만원이 얼마가 될지를 … 매우 보수적인 입장으로 … 부동산과 상대 비교」)
import {renderKorea} from './view-korea.js'; // 한국 주식시장은 몇 위인가(2026-10-07 05:29 「대한민국이 다른 나라에 비해 얼마나 투자처로 우위인지 … 등수와 논리와 자료로」)

const app = {view: null, manifest: null, tab: 'home', places: []};
const ICON = {
  // 불장: 불꽃 하나 · 지도(옛 업종): 크기가 다른 땅 넷 — 로고 5번 「땅 나누기」와 같은 모양(옛: 같은 네 칸)
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8c.7 3.1-1.8 4.7-3.2 6.7C7.7 11 7 12.6 7 14.2a5 5 0 0 0 10 0c0-2.4-1.2-4.1-2.3-5.4-.2 1.5-.9 2.4-1.9 2.9.4-3-.2-6.2-.8-8.9z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="8.5" height="10" rx="1.6"/><rect x="3.5" y="16.5" width="8.5" height="4" rx="1.4"/><rect x="15" y="3.5" width="5.5" height="5.5" rx="1.4"/><rect x="15" y="12" width="5.5" height="8.5" rx="1.6"/></svg>',
  road: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5" cy="5" r="2.6"/><circle cx="5" cy="12" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="12" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="19" cy="12" r="2.6"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3M8 17h6"/></svg>',
  // 찾기: 돋보기(2026-10-05 20:24 「종목을 찾는 기능」)
  find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20.5 20.5"/></svg>',
  // 기록: 거꾸로 도는 화살 + 시계 바늘(지난 일을 적은 곳 · 2026-10-06 16:10 「기록 하는 탭」)
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.2 12a7.8 7.8 0 1 0 2.3-5.5"/><path d="M4.2 3.8v4.6h4.6"/><path d="M12 7.8V12l3 2"/></svg>',
  // 처음: 새싹 하나(처음 사는 사람 · 2026-10-07 00:49 「이대로 사이트에 올려줘」)
  start: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21v-9"/><path d="M12 12c0-4.2 2.9-6.8 7.5-6.8 0 4.4-3 6.8-7.5 6.8z"/><path d="M12 14.5c0-3.3-2.3-5.4-6-5.4 0 3.5 2.4 5.4 6 5.4z"/><path d="M7.5 21h9"/></svg>',
  // 예비: 반짝임 하나(큰 별 + 작은 별) — 「눈여겨볼 것」
  similar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 11.9 9.1 17.5 11 11.9 12.9 10 18.5 8.1 12.9 2.5 11 8.1 9.1z"/><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  // 22곳: 차례 목록(점 셋 + 줄 셋)
  rise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11.5M9 12h11.5M9 18h11.5"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
};
const routes = [
  {id: 'home', tab: 'home', label: '불장', match: /^(#\/?)?$/, render: renderHome},
  {id: 'map', tab: 'map', label: '지도', match: /^#\/map$/, render: renderMap}, // 2026-10-06 00:21 「잡스라면 … 개선하라」 — 옛 이름 「업종」 · 주소는 그대로(#/map)
  {id: 'land', tab: 'map', match: /^#\/map\/f\/[a-z0-9]+$/, render: renderLand}, // 2026-10-06 07:03 「왜 3단 클릭 구조가 아니지?」 — 지도 땅 → 그 갈래 화면 → 업종 → 회사
  {id: 'industry', tab: 'from', match: /^#\/i\/[a-z0-9]+$/, render: renderIndustry},
  {id: 'stock', tab: 'from', match: /^#\/stock\/[A-Za-z0-9][A-Za-z0-9.\-]{0,11}$/, render: renderCompany}, // 한국 6자리 · 미국 영문 기호(2026-10-05 18:02 「미국 주식도」)
  {id: 'similar', tab: 'home', label: '예비', match: /^#\/similar$/, render: renderSimilar},
  {id: 'rise', tab: 'home', label: '오름 상위', match: /^#\/rise$/, render: renderRise},
  {id: 'road', tab: 'road', label: '출목표', match: /^#\/road$/, render: renderRoad},
  {id: 'agenda', tab: 'agenda', label: '일정', match: /^#\/agenda$/, render: renderAgenda},
  {id: 'find', tab: 'find', label: '찾기', match: /^#\/find$/, render: renderFind}, // 2026-10-05 20:24 「아틀란스에서 종목을 찾는 기능을 넣어라」 — 한국 · 미국 판을 함께
  {id: 'log', tab: 'log', label: '기록', match: /^#\/log$/, render: renderLog}, // 2026-10-06 16:10 「… 뭘 어떻게 변화 시켰는지에 대해서 기록 하는 탭」 — 업데이트 · 자료 변경 날짜
  {id: 'guide', tab: 'start', match: /^#\/guide$/, render: renderGuide}, // 아래 탭 「처음」 아래 한 화면(탭을 늘리지 않음 · 규칙 1)
  {id: 'long', tab: 'start', match: /^#\/long$/, render: renderLong}, // 「처음」 아래 한 화면(탭을 늘리지 않음 · 규칙 1 · 24)
  {id: 'korea', tab: 'start', match: /^#\/korea$/, render: renderKorea},
  {id: 'start', tab: 'start', label: '처음', match: /^#\/start$/, render: renderStart}, // 2026-10-06 23:19 「초보들이 뭘사야 안전한지 … 잡스였다면」 · 10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」 — 지난 3년 가장 덜 떨어진 우량 큰 회사 다섯
];
const TABS = ['home', 'map', 'road', 'agenda', 'find', 'log', 'start']; // 일곱째 「처음」(2026-10-07 00:49) — 넣으면서 뺀 것: 첫 화면 맨 아래 접힌 「ATLAS가 하지 않는 일」(「처음」 안으로)
/** 보던 자리 기억(출목표 · 닮은 7곳 · 22곳) — 회사 화면에 갔다 돌아오면 그 자리 */
const KEEP_SCROLL = new Set(['road', 'similar', 'rise', 'map', 'find']), scrollMemo = new Map();
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
/** 말 단추 그림 — 선으로 그린 지구(글자색을 따른다 · 어느 나라 사람이든 「말 고르기」로 읽는 그림) */
function globeIcon() {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, v);
  const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx', 12); circle.setAttribute('cy', 12); circle.setAttribute('r', 9); svg.append(circle);
  for (const d of ['M3 12h18', 'M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9', 'M12 3c-2.5 2.7-3.8 5.7-3.8 9s1.3 6.3 3.8 9']) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
  return svg;
}
/** 말 고르기(2026-10-06 22:00 사장님 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」) — 같은 주소 · 같은 화면을 그 말로 다시 연다(?lang= · 이 기기에 기억 · i18n.js)
 *   말 이름은 그 말 글자로(한국어 · English · 中文) — 어느 말로 보고 있든 자기 말을 찾게 · 지금 말은 눌린 채로 */
/*   2026-10-07 05:13 「언어팩을 주식시장이 있는 전세게 나라가 있잖아 다 만들어」 — 말 74개(i18n.js LANG_LIST): 위 세 말(한국어 · English · 简体中文)은 그대로 맨 위,
 *   나머지는 지금 보고 있는 말의 이름 차례(가나다 · ABC …) · 줄마다 그 말 글자 이름 + 지금 말로 쓴 이름(Intl.DisplayNames · 한국어로 보면 「독일어」) · 맨 위 찾기 칸(이름 · 코드로 거름) */
const langHref = code => location.pathname + '?lang=' + code + location.hash;
const PINNED = ['ko', 'en', 'zh'];
function langItems() {
  let dn = null, col = null; try { dn = new Intl.DisplayNames([LANG_INFO.tag], {type: 'language'}); col = new Intl.Collator(LANG_INFO.tag); } catch {}
  const local = x => { try { const v = dn?.of(x.tag); return v && v.toLowerCase() !== x.tag.toLowerCase() && v !== x.name ? v : ''; } catch { return ''; } };
  const rows = LANG_LIST.map(x => ({...x, local: local(x)}));
  const head = PINNED.map(c => rows.find(x => x.code === c)), rest = rows.filter(x => !PINNED.includes(x.code));
  rest.sort((a, b) => (col ? col.compare(a.local || a.name, b.local || b.name) : (a.local || a.name).localeCompare(b.local || b.name)));
  return [...head, ...rest];
}
function langPicker() {
  const items = langItems();
  const list = h('div', {class: 'lang-list'}, ...items.map(x => h('a', {class: 'lang-i', href: langHref(x.code), lang: x.tag, hreflang: x.tag, dir: x.rtl ? 'rtl' : 'ltr', 'data-code': x.code, 'data-find': `${x.code} ${x.tag} ${x.name} ${x.local}`.toLowerCase(), 'aria-current': x.code === LANG ? 'true' : null,
    onclick: e => { e.currentTarget.setAttribute('href', langHref(x.code)); }}, h('span', {class: 'lang-n'}, x.name), x.local ? h('small', {class: 'lang-s', 'data-ident': ''}, x.local) : null)));
  const find = h('input', {class: 'lang-find', type: 'search', inputmode: 'search', autocomplete: 'off', spellcheck: 'false', placeholder: 'Language · 언어 · 语言', 'aria-label': 'Language · 언어 · 语言', 'data-orig-attr': 'aria-label placeholder',
    oninput: () => { const q = find.value.trim().toLowerCase(); for (const a of list.children) a.hidden = !!q && !a.dataset.find.includes(q); }});
  const box = h('details', {class: 'lang'},
    h('summary', {class: 'round lang-b', 'aria-label': 'Language · 语言 · 언어', title: 'Language · 语言 · 언어', 'data-orig-attr': 'aria-label title'}, globeIcon()),
    h('div', {class: 'lang-menu'}, find, list));
  box.addEventListener('toggle', () => { if (box.open) { list.querySelector('[aria-current="true"]')?.scrollIntoView({block: 'nearest'}); } else { find.value = ''; for (const a of list.children) a.hidden = false; } });
  document.addEventListener('click', e => { if (box.open && !box.contains(e.target)) box.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.open) { box.open = false; box.querySelector('summary')?.focus(); } });
  return box;
}
const voice = {on: false};
/** 맨 위: 둥근 단추 셋 — 말(지구 · 2026-10-06 22:00) · 「가」(글씨 100→125→150→175→200→100%) · 소리 */
function header() {
  const speakBtn = h('button', {class: 'round speak', id: 'voice-btn', type: 'button', 'aria-label': '소리로 듣기', 'aria-pressed': 'false', onclick: () => {
    voice.on = !voice.on; speakBtn.classList.toggle('on', voice.on); speakBtn.setAttribute('aria-pressed', String(voice.on));
    if (voice.on) speakScreen(state.summary || '읽을 내용이 없습니다'); else stopSpeak();
  }}, speakerIcon());
  // 시장 고르기 「한국 · 미국」(2026-10-05 18:02 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」) — 사이트에 판이 둘 있을 때만(places.json · package.mjs 가 씀)
  //   한국 판은 / · 미국 판은 /us/ — 같은 화면 코드, 판만 다름 · 지금 판은 눌린 채로(aria-current)
  //   보던 탭(불장 · 업종 · 출목표 · 일정 · 예비 · 오름 상위)은 그대로 들고 간다 — 회사 · 업종 화면은 판마다 달라 처음 화면으로
  const tabHash = () => /^#\/(map|road|agenda|similar|rise|log|start)?$/.test(location.hash) ? location.hash : '';
  const mkt = app.places.length > 1 ? h('nav', {class: 'mkt', 'aria-label': '시장 고르기'}, ...app.places.map(p => { const href = p.href + (I18N ? '?lang=' + LANG : ''); return h('a', {class: 'mkt-b', href, 'data-place': p.id, 'aria-current': p.id === place.id ? 'page' : null, // 고른 말 그대로(기기에 못 적는 창에서도)
    onclick: e => { if (p.id !== place.id) e.currentTarget.setAttribute('href', href + tabHash()); }}, p.label); })) : null;
  document.getElementById('top').replaceChildren(h('div', {class: 'top-inner' + (mkt ? ' has-mkt' : '')},
    h('a', {class: 'wordmark', href: '#/', 'aria-label': 'ATLAS 처음 화면'}, 'ATLAS'),
    mkt,
    langPicker(),
    h('button', {class: 'round font', id: 'font-btn', type: 'button', 'aria-label': '글씨 크기', onclick: () => { prefs.set('font', (prefs.get('font', 0) + 1) % FONT_STEPS.length); applyFont(); fontLabel(); route(); fitTabs(); }}, '가'),
    speakBtn));
  fontLabel();
  // 탭 이름에는 숫자를 넣지 않는다(2026-10-05 「잡스라면」 28번) — 개수는 화면 안에
  const label = r => r.label;
  // 지금 보고 있는 탭을 다시 누르면 맨 위로(주소가 그대로라 화면은 다시 그리지 않음)
  // 다른 탭에서 「출목표」를 누르면 늘 「오른 순」 첫 탭(1위~20위) 맨 위로(2026-10-05 11:36 「출목표 탭을 클릭하면 가장 상승한순으로」 · 12:28 「그 안에 탭을 더」)
  //   회사 화면에서 되돌아올 때는 보던 묶는 법 · 탭 · 자리 그대로
  const toTop = (e, r) => { if (r.id === 'road' && app.view !== 'road') { resetRoad(); scrollMemo.delete('road'); }
    if (app.view === r.id) { e.preventDefault(); scrollMemo.delete(r.id); window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); } };
  const tab = r => h('a', {href: r.id === 'home' ? '#/' : '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}, onclick: e => toTop(e, r)}, h('span', {class: 'icon', 'aria-hidden': 'true', html: ICON[r.id]}), h('span', {class: 'label'}, label(r)));
  document.getElementById('bottom').replaceChildren(...TABS.map(id => tab(routes.find(r => r.id === id))));
  fitTabs();
}
/** 아래 탭 이름 맞추기(2026-10-07 말 74개 — 독일어 「Termine」「Chronik」 처럼 긴 이름이 일곱 칸 중 제 칸을 넘지 않게)
 *  가장 넘치는 이름에 맞춰 일곱 이름을 같은 비율로 줄인다(--tab-k · 원래 크기의 55% 아래로는 안 줄임) · 말을 바꾼 뒤 · 글씨 단추 · 화면 폭이 바뀔 때 다시 잼 */
function fitTabs() {
  const bar = document.getElementById('bottom'); if (!bar) return;
  bar.style.removeProperty('--tab-k');
  requestAnimationFrame(() => {
    let k = 1;
    for (const a of bar.querySelectorAll('.bottom-link')) { const l = a.querySelector('.label'); if (!l) continue; const room = a.clientWidth - 6, need = l.getBoundingClientRect().width; if (need > room && need > 0) k = Math.min(k, room / need); }
    if (k < 1) bar.style.setProperty('--tab-k', Math.max(0.55, k - 0.01).toFixed(3));
    // 위 막대: 넘치면 시장 단추(한국 · 미국)만 줄임 — 둥근 단추(말 · 글씨 · 소리)는 44px 그대로
    const top = document.querySelector('.top-inner'), mkt = top?.querySelector('.mkt');
    if (top && mkt) { mkt.style.removeProperty('--mkt-k'); const over = top.scrollWidth - top.clientWidth, w = mkt.getBoundingClientRect().width;
      if (over > 0 && w > 0) mkt.style.setProperty('--mkt-k', Math.max(0.45, (w - over - 2) / w).toFixed(3)); }
  });
}
window.addEventListener('resize', () => fitTabs());
function fontLabel() { const b = document.getElementById('font-btn'); if (b) b.setAttribute('aria-label', `글씨 크기 ${FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0)))]}% (누를 때마다 커지고 200% 다음은 100%)`); }
function markActive(id) { for (const el of document.querySelectorAll('[data-route]')) { const on = el.dataset.route === id; el.classList.toggle('active', on); if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); } }

async function route() {
  let hash = location.hash;
  if (hash === '#main') { document.getElementById('main')?.focus(); return; } // 「본문으로 건너뛰기」는 화면을 바꾸지 않는다
  // 「태양 모아 보기 ›」(#/road/sun · 2026-10-05 15:24 「잡스가 … 36가지」 B5 · E) — 어느 화면에서든 출목표 묶는 법 「태양」 맨 위로 · 주소 줄은 #/road 로
  //   #/road/at/CODE = 회사 화면 「오른 순 n위 · 출목표 자리 ›」 · #/road/g/GROUP = 업종 화면 「출목표에서 … 보기 ›」(그 칸 · 그 업종 묶음으로)
  const at = hash.match(/^#\/road\/at\/([A-Za-z0-9][A-Za-z0-9.\-]{0,11})$/)?.[1], grp = hash.match(/^#\/road\/g\/([a-z0-9]+)$/)?.[1], toSun = hash === '#/road/sun' || !!at || !!grp;
  if (toSun) { if (at) openAt(at); else if (grp) openGroup(grp); else openSun(); hash = '#/road'; history.replaceState(null, '', location.pathname + location.search + '#/road'); }
  let r = routes.find(x => x.match.test(hash));
  // 지운 화면의 옛 주소 → 처음 화면(주소 줄도 「#/」로 바꿔 둔다)
  if (!r) { r = routes[0]; hash = '#/'; history.replaceState(null, '', location.pathname + location.search + '#/'); }
  stopSpeak(); voice.on = false; document.getElementById('voice-btn')?.classList.remove('on'); document.getElementById('voice-btn')?.setAttribute('aria-pressed', 'false');
  if (app.view && KEEP_SCROLL.has(app.view)) scrollMemo.set(app.view, window.scrollY);
  if (toSun) scrollMemo.delete('road'); // 태양 보기는 늘 맨 위부터
  if (app.view !== r.id) state.from = app.view; // 회사 화면 「‹ 되돌아가기」가 온 곳을 알도록(글씨 단추로 같은 화면을 다시 그릴 때는 그대로)
  // 업종·회사 화면은 들어온 탭이 눌린 채로(탭 막대에 없는 화면) · 탭 화면이면 그 탭을 기억
  if (r.tab !== 'from') app.tab = r.tab;
  state.tab = app.tab; // 업종 화면 「‹ 되돌아가기」가 들어온 탭(불장 · 업종)을 알도록
  markActive(app.tab); app.view = r.id; state.summary = '';
  document.documentElement.toggleAttribute('data-drawn', drawn.has(r.id)); drawn.add(r.id); // 이 화면을 이미 한 번 그렸으면 선 그리기 움직임 없이
  const main = document.getElementById('main');
  main.dataset.view = r.id; document.body.dataset.view = r.id;
  // 보던 자리로 돌아갈 화면이면 다 그린 뒤 그 자리로 · 아니면 그리기 전에 맨 위로(조금씩 그리는 동안 사람이 내려 본 자리를 끝에 되돌리지 않게)
  const restoring = KEEP_SCROLL.has(r.id) && scrollMemo.has(r.id);
  if (!restoring) window.scrollTo({top: 0});
  try { await r.render(main, {hash, manifest: app.manifest, restoring}); }
  catch (e) { main.replaceChildren(failure('화면을 그리지 못했습니다', e)); }
  setTimeout(() => { if (app.view === r.id) document.documentElement.setAttribute('data-drawn', ''); }, 450); // 다 그린 뒤에는 같은 화면 안에서 다시 그려도(묶음 바꾸기) 움직이지 않음
  if (restoring && app.view === r.id) window.scrollTo({top: scrollMemo.get(r.id) ?? 0});
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
  if (I18N) await startI18n(); // 언어판: 사전을 읽고 이후 그려지는 글자를 모두 그 말로
  applyFont();
  const main = document.getElementById('main');
  main.replaceChildren(h('section', {class: 'b-box loading', role: 'status', 'aria-live': 'polite'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('p', null, '자료를 불러오는 중입니다'),
    h('div', {class: 'sk', 'aria-hidden': 'true'}, h('span', {class: 'sk-t'}), h('span', {class: 'sk-l'}), h('span', {class: 'sk-g'}))));
  try { app.manifest = await loadManifest(); }
  catch (e) { main.replaceChildren(failure('자료 목록을 읽지 못했습니다', e)); return; }
  setPlace(app.manifest.place); // 미국 판이면 달러 · 뉴욕 16:00 종가 · 수급 없음(util.js place) — 한국 판 manifest 에는 place 가 없어 한국 값 그대로
  try { const r = await fetch('/places.json', {cache: 'no-cache'}); if (r.ok) { const p = await r.json(); if (Array.isArray(p?.places)) app.places = p.places.filter(x => x && x.id && x.href && x.label); } } catch {}
  state.places = app.places; // 「찾기」가 다른 시장 판도 함께 찾도록
  if (I18N) { // 회사 이름: 한국 판 = 영어 이름 사전(/data/atlas11/names-kr.json · 없으면 로마자) · 미국 판 = 판의 nameEn — 두 판 모두(찾기 · 기록 이슈 줄에 섞여 나옴) · 첫 화면 전에
    const nk = await fetch('/data/atlas11/names-kr.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null);
    try { addBoardNames(await loadBoard(), nk?.names); } catch {}
    for (const p of app.places) if (p.id !== place.id) { try { addBoardNames((await loadPlaceBoard(p.href)).board, nk?.names); } catch {} }
  }
  header();
  window.addEventListener('hashchange', route);
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
}
start();
