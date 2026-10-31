/* 로마 신 72(#/roman) — 사장님 2026-10-30(+03) 22:23 「그냥재미삼아 적절한곳에 배치해봐 둘리에」(docs/design/roman72-site-2026-10-31/order-0423.txt)
   앞 일 2026-10-31 02:49(+08) 「이제는 로마신화에 72명 먼저 선정해」 — 고른 일흔두 명(docs/design/roman72-2026-10-31/roman72.json)을 둘이 안 일흔두 자리에 한 명씩 앉힘
   자료 = site/next/roman72.js(자리 · 신 · 왜 여기 — 검사 scripts/atlas11/next/check_roman.mjs 가 고른 목록과 맞댐)
   쪽 = 큰 제목 → 자리 무리 여덟 단추 → 무리마다 카드(자리 · 신 이름 · 라틴 이름 · 누구 · 왜 여기 · 무리) → 끝 한 줄 · 안전 문장
   얼굴을 누르면 그 신 이야기를 소리로(roman-say.js · order-1558) · 「가 보기 ›」를 누르면 그 자리로 감(제 주소가 없는 단추 · 쪽은 「제 쪽이 따로 없어요」) · 영어 화면은 자료의 영어 글을 바로 그림
   곳마다 맨 위 「(그곳 신 수) 신 차례로 듣기」(말하는 불빛 칸 order-1723 → 여덟 곳 모두 order-1920) — 그곳 카드 차례대로 이어 읽음 · 읽는 카드에 테 · 다시 누르면 멈춤 · 한 번에 한 곳 · 소리를 못 내는 휴대폰은 단추 없음
   읽는 종이 판(서른아홉 스승과 같은 판 — p-roman.css · app.js whiteFor html.pg-roman) · 앞날 말 · 사고팔기 말 없음 */
import {ON as EN} from './i18n.js';
import {NAME, NAME_EN, josa} from './brand.js'; // 이름은 한 곳(규칙 76)
import {GROUPS, GODS, ZONES, SEATS} from './roman72.js';
import {faceBtn, sayAll, storyOf, canSpeak} from './roman-say.js'; // 얼굴을 누르면 그 신 이야기를 소리로(사장님 2026-10-31 10:58(+04) 「응」 · order-1558.txt) · 차례로 듣기(12:23(+04) 「응」 · order-1723.txt)

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const L = EN ? 1 : 0;
const fill = s => String(s).split('{N}').join(EN ? NAME_EN : NAME);

/** 곳마다 신 수를 말로(차례로 듣기 단추 글 — 「열한 신」 · 「Hear all eleven」) */
const KO_N = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스무'];
const EN_N = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
/** 화면 말(자료 밖) — 한국어 · 영어 두 벌 */
const T = EN ? {
  title: '72 Roman Gods', lead: `Seventy-two Roman gods each take one seat in ${NAME_EN}.`, lead2: 'The seats are just for fun. Tap a face to hear that god’s story.',
  zones: 'Eight places', seats: n => `${n} seats`, why: 'Why here?', go: 'Go there', here: 'No page of its own',
  end: 'The god stories come from old Roman writings and myths.', end2: 'Each god has one seat. No god sits twice.',
  all: n => `Hear all ${EN_N[n] ?? n} in order`, stop: 'Stop', now: x => `Now: ${x}`,
} : {
  title: '로마 신 72', lead: `${NAME} 안 일흔두 자리에 로마 신이 한 명씩 앉았어요.`, lead2: '재미로 앉힌 자리예요. 얼굴을 누르면 그 신 이야기를 들려줘요.',
  zones: '여덟 곳', seats: n => `${n}자리`, why: '왜 여기?', go: '가 보기', here: '제 쪽이 따로 없어요',
  end: '신 이야기는 로마 옛 글과 신화에서 왔어요.', end2: '신 하나에 자리 하나예요. 두 번 앉은 신은 없어요.',
  all: n => `${KO_N[n] ?? n} 신 차례로 듣기`, stop: '멈추기', now: x => `지금 ${x}`,
};
const SAFE = `${josa(NAME, '는')} 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.`; // 둘이 안전 문장(둘이 단추 안 · 서른아홉 스승과 같은 글 — 영어 화면은 엔진 사전이 바꿈)

/** 카드 하나 — 자리 · 신 얼굴 단추(캐릭터 그림 order-1332 · 누르면 그 신 이야기를 소리로 order-1558) + 신 이름(+ 라틴 이름) · 누구 · 왜 여기 · 무리 · 「가 보기 ›」(제 주소가 있는 자리만)
    카드 = 칸(div) — 얼굴 단추와 「가 보기」 고리를 나눔(단추를 고리 안에 넣지 않음) · 얼굴 그림은 화면 가까이 올 때 받음(loading=lazy · 자리 64px 미리 잡음 — 밀림 0) */
function card(s, i) {
  const [, spKo, spEn, href, gn, whyKo, whyEn] = s, g = GODS[gn], grp = g[5];
  const name = EN ? g[2] : g[0], showLa = !EN || g[1] !== g[2];
  return h('li', {}, h('div', {class: `rm-card g${grp}` + (href ? '' : ' rm-here'), 'data-n': String(gn), 'data-i': String(i + 1)},
    h('span', {class: 'rm-spot', text: fill(EN ? spEn : spKo)}),
    h('span', {class: 'rm-god'}, faceBtn(gn, {size: 64, cls: 'rm-av', lazy: true}),
      h('span', {class: 'rm-gt'}, h('b', {class: 'rm-gn', text: name}), showLa ? h('span', {class: 'rm-la', lang: 'la', text: g[1]}) : null)),
    h('span', {class: 'rm-one', text: EN ? g[4] : g[3]}),
    h('span', {class: 'rm-why'}, h('b', {class: 'rm-wl', text: T.why}), h('span', {class: 'rm-wt', text: fill(EN ? whyEn : whyKo)})),
    h('span', {class: 'rm-grp g' + grp}, h('i', {'aria-hidden': 'true'}), h('span', {text: GROUPS[grp - 1][L]})),
    href ? h('a', {class: 'rm-goa', href}, h('span', {text: T.go}), h('i', {'aria-hidden': 'true', text: '›'})) : h('span', {class: 'rm-no', text: T.here})));
}

/** 차례로 듣기(사장님 2026-10-31 12:23(+04) 「응」 · order-1723.txt — 말하는 불빛 칸 → 14:20(+04) 「응」 · order-1920.txt — 여덟 곳 모두) — 그곳 카드 차례대로 이어 읽음
    읽는 말 = 카드 글 그대로 「n번 불빛, 자리 이름. 신 이름. 누구. 왜 여기」(자리 글은 카드에서 · 이야기는 roman-say.js storyOf) · 글상자 = 「지금 (자리) · (신 이름)」 */
const SVGNS = 'http://www.w3.org/2000/svg';
function playIcon(on) { // 처음 = 세모(듣기) · 읽는 중 = 네모(멈추기) · 글자 없는 그림
  const s = document.createElementNS(SVGNS, 'svg'); for (const [k, v] of Object.entries({viewBox: '0 0 24 24', width: 28, height: 28, 'aria-hidden': 'true', focusable: 'false', fill: 'currentColor'})) s.setAttribute(k, String(v));
  const d = document.createElementNS(SVGNS, on ? 'rect' : 'path');
  for (const [k, v] of Object.entries(on ? {x: 6, y: 6, width: 12, height: 12, rx: 2} : {d: 'M8 5.5v13l10.5-6.5z'})) d.setAttribute(k, String(v));
  s.append(d); return s;
}
/** 소리로 읽는 자리 글 — 동그라미 숫자(①~⑳ · 첫 화면 곳 「① 돈 흐름」 …)는 휴대폰마다 달리 읽어 「1번」 · 「Number 1,」로(글상자 · 카드 글은 그대로) */
const sayable = t => t.replace(/([\u2460-\u2473])\s*/g, (_, c) => { const n = c.charCodeAt(0) - 0x245F; return EN ? `Number ${n}, ` : `${n}번 `; });
const itemsOf = id => [...document.querySelectorAll(`#view #rm-z-${id} .rm-card`)].map(c => {
  const n = +c.dataset.n, story = storyOf(n), spot = c.querySelector('.rm-spot')?.textContent ?? '', name = c.querySelector('.rm-gn')?.textContent ?? '';
  return story ? {text: `${sayable(spot.split(' · ').join(', '))}. ${story}`, label: T.now(`${spot} · ${name}`), card: c, face: c.querySelector('button.rms-face')} : null;
}).filter(Boolean);
function allBar(id, n) {
  if (!canSpeak()) return null; // 소리를 못 내는 휴대폰 — 단추 없음(카드 글은 그대로)
  const t = h('span', {class: 'rm-allt', text: T.all(n)}), cap = h('p', {class: 'rm-allc', 'aria-live': 'polite', hidden: true});
  let ic = playIcon(false);
  const set = on => { t.textContent = on ? T.stop : T.all(n); b.classList.toggle('rm-allon', on); const x = playIcon(on); ic.replaceWith(x); ic = x; };
  const b = h('button', {type: 'button', class: 'rm-allb', onclick: () => sayAll(itemsOf(id), b, {cap, set})}, ic, t);
  return h('div', {class: 'rm-all'}, b, cap);
}

/** 자리 무리 하나 — 번호 동그라미 · 이름 · 한 줄 · 차례로 듣기(그곳 신 수) · 카드들 */
function zone(z, k) {
  const rows = SEATS.map((s, i) => [s, i]).filter(([s]) => s[0] === z.id);
  return h('section', {class: 'rm-zone', id: 'rm-z-' + z.id, 'aria-labelledby': 'rm-h-' + z.id},
    h('h2', {class: 'rm-zh', id: 'rm-h-' + z.id}, h('span', {class: 'rm-zn', 'aria-hidden': 'true', text: String(k + 1)}), h('span', {class: 'rm-zt', text: fill(z.name[L])})),
    h('p', {class: 'rm-zp', text: fill(z.note[L])}),
    allBar(z.id, rows.length),
    h('ul', {class: 'rm-grid'}, rows.map(([s, i]) => card(s, i))));
}

/** #/roman/<번호> — 방 지킴이 이름표(roman-tag.js)에서 온 길 · 그 신 카드를 화면 가운데로 · 테로 표시(쪽을 그린 뒤 · 쪽 길이 맨 위로 돌린 뒤에도 한 번 더) */
function focusCard(n) {
  const at = Date.now(), card = () => document.querySelector(`#view .rm-card[data-n="${n}"]`);
  const go = () => {
    const c = card(); if (!c) { if (Date.now() - at < 4000) setTimeout(go, 120); return; }
    c.classList.add('rm-on');
    const r = c.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 60) c.scrollIntoView({block: 'center'});
  };
  for (const t of [150, 700, 1500]) setTimeout(go, t);
}

export async function render(arg) {
  const n = /^\d{1,2}$/.test(String(arg ?? '')) && GODS[+arg] ? +arg : null;
  if (n) focusCard(n);
  const jump = (z, k) => h('button', {type: 'button', class: 'rm-jump', 'data-z': z.id, onclick: () => document.getElementById('rm-z-' + z.id)?.scrollIntoView({behavior: 'smooth', block: 'start'})},
    h('span', {class: 'rm-jn', 'aria-hidden': 'true', text: String(k + 1)}), h('b', {text: fill(z.name[L])}), h('span', {class: 'rm-jc', text: T.seats(SEATS.filter(s => s[0] === z.id).length)}));
  return {title: T.title, nodes: [h('div', {class: 'rm'},
    h('header', {class: 'rm-hero'}, h('h1', {class: 'h rm-h1', text: T.title}), h('p', {class: 'rm-lead', text: T.lead}), h('p', {class: 'rm-note', text: T.lead2})),
    h('nav', {class: 'rm-jumps', 'aria-label': T.zones}, ZONES.map(jump)),
    ...ZONES.map(zone),
    h('section', {class: 'rm-end', 'aria-label': T.end}, h('p', {class: 'rm-e1', text: T.end2}), h('p', {class: 'rm-e2', text: T.end})),
    h('p', {class: 'safe', text: SAFE}))]};
}
