/* 로마 신 72(#/roman) — 사장님 2026-10-30(+03) 22:23 「그냥재미삼아 적절한곳에 배치해봐 둘리에」(docs/design/roman72-site-2026-10-31/order-0423.txt)
   앞 일 2026-10-31 02:49(+08) 「이제는 로마신화에 72명 먼저 선정해」 — 고른 일흔두 명(docs/design/roman72-2026-10-31/roman72.json)을 둘이 안 일흔두 자리에 한 명씩 앉힘
   자료 = site/next/roman72.js(자리 · 신 · 왜 여기 — 검사 scripts/atlas11/next/check_roman.mjs 가 고른 목록과 맞댐)
   쪽 = 큰 제목 → 자리 무리 여덟 단추 → 무리마다 카드(자리 · 신 이름 · 라틴 이름 · 누구 · 왜 여기 · 무리) → 끝 한 줄 · 안전 문장
   카드를 누르면 그 자리로 감(제 주소가 없는 단추 · 쪽은 고리 없는 카드) · 영어 화면은 자료의 영어 글을 바로 그림
   읽는 종이 판(서른아홉 스승과 같은 판 — p-roman.css · app.js whiteFor html.pg-roman) · 앞날 말 · 사고팔기 말 없음 */
import {ON as EN} from './i18n.js';
import {NAME, NAME_EN, josa} from './brand.js'; // 이름은 한 곳(규칙 76)
import {GROUPS, GODS, ZONES, SEATS} from './roman72.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const L = EN ? 1 : 0;
const fill = s => String(s).split('{N}').join(EN ? NAME_EN : NAME);

/** 화면 말(자료 밖) — 한국어 · 영어 두 벌 */
const T = EN ? {
  title: '72 Roman Gods', lead: `Seventy-two Roman gods each take one seat in ${NAME_EN}.`, lead2: 'The seats are just for fun. Tap a card to go there.',
  zones: 'Eight places', seats: n => `${n} seats`, why: 'Why here?', go: 'Go there', here: 'No page of its own',
  end: 'The god stories come from old Roman writings and myths.', end2: 'Each god has one seat. No god sits twice.',
} : {
  title: '로마 신 72', lead: `${NAME} 안 일흔두 자리에 로마 신이 한 명씩 앉았어요.`, lead2: '재미로 앉힌 자리예요. 카드를 누르면 그 자리로 가요.',
  zones: '여덟 곳', seats: n => `${n}자리`, why: '왜 여기?', go: '가 보기', here: '제 쪽이 따로 없어요',
  end: '신 이야기는 로마 옛 글과 신화에서 왔어요.', end2: '신 하나에 자리 하나예요. 두 번 앉은 신은 없어요.',
};
const SAFE = `${josa(NAME, '는')} 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.`; // 둘이 안전 문장(둘이 단추 안 · 서른아홉 스승과 같은 글 — 영어 화면은 엔진 사전이 바꿈)

/** 카드 하나 — 자리 · 신 이름(+ 라틴 이름) · 누구 · 왜 여기 · 무리 · 고리면 › */
function card(s, i) {
  const [, spKo, spEn, href, gn, whyKo, whyEn] = s, g = GODS[gn], grp = g[5];
  const name = EN ? g[2] : g[0], showLa = !EN || g[1] !== g[2];
  const kids = [
    h('span', {class: 'rm-spot', text: fill(EN ? spEn : spKo)}),
    h('span', {class: 'rm-god'}, h('b', {class: 'rm-gn', text: name}), showLa ? h('span', {class: 'rm-la', lang: 'la', text: g[1]}) : null),
    h('span', {class: 'rm-one', text: EN ? g[4] : g[3]}),
    h('span', {class: 'rm-why'}, h('b', {class: 'rm-wl', text: T.why}), h('span', {class: 'rm-wt', text: fill(EN ? whyEn : whyKo)})),
    h('span', {class: 'rm-grp g' + grp}, h('i', {'aria-hidden': 'true'}), h('span', {text: GROUPS[grp - 1][L]})),
  ];
  const at = {class: `rm-card g${grp}`, 'data-n': String(gn), 'data-i': String(i + 1)};
  return h('li', {}, href
    ? h('a', {...at, href}, ...kids, h('i', {class: 'rm-go', 'aria-hidden': 'true', text: '›'}))
    : h('div', {...at, class: at.class + ' rm-here'}, ...kids, h('span', {class: 'rm-no', text: T.here})));
}

/** 자리 무리 하나 — 번호 동그라미 · 이름 · 한 줄 · 카드들 */
function zone(z, k) {
  const rows = SEATS.map((s, i) => [s, i]).filter(([s]) => s[0] === z.id);
  return h('section', {class: 'rm-zone', id: 'rm-z-' + z.id, 'aria-labelledby': 'rm-h-' + z.id},
    h('h2', {class: 'rm-zh', id: 'rm-h-' + z.id}, h('span', {class: 'rm-zn', 'aria-hidden': 'true', text: String(k + 1)}), h('span', {class: 'rm-zt', text: fill(z.name[L])})),
    h('p', {class: 'rm-zp', text: fill(z.note[L])}),
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
