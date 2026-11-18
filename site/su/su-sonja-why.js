/* 손자병법 판 — 「왜 사?」(#/q · #/q/<번호>) · 내 매매일지(#/j) · 찾지 못한 쪽(주문 1116-0300 · 옛 틀 page() · 옛 꾸밈을 모두 지움)
   사장님 2026-11-16(마카오) 02:00 「… 예전 페이지 디자인이 남아 있어 예전 디자인은 모두 삭제 하고 손자병법에 맞게 처음부터 끝까지 깔끔하개 작업해 …」
   su-why.js 의 쪽 꼴(m: title · tab · step · kick · h1 · big · ink · say · act · body · figs · pro · note · next · asOf · S)을 손자병법 판으로 그림
   머리 줄 · 쪽 머리(걸음 · 머리 글 · 큰 제목 · 먹그림 · 손무 한 줄) · 큰 값과 「그래서」 줄 · 누르는 곳 · 본문 · 그림 · 「자세히」 · 끝 줄 · 이야기 막대 · 탭
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h} from '/su/su-fig.js';
import {NAME} from '/next/brand.js';
import {kstText} from '/next/essence.js';
import {hardLeft} from '/su/su-word.js';
import {topBar, stepTag, endSec, dockNav, tabNav, meanCap} from '/su/su-sonja-top.js';
import {PM, whyMean} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {sonmuPic} from '/su/su-sonja-ink.js';
import {chev, day} from '/su/su-sonja.js';

const NEED = '확인 필요';
/** 「왜 사?」 · 매매일지 그림(su-why.js 의 svg)의 그림 뜻 — 그림 안 맨 위(주문 1116-1313) */
const capOf = (sv, tag = 'figcaption') => meanCap(sv?.getAttribute ? whyMean(sv.getAttribute('class') ?? '', sv.getAttribute('data-cur') ?? '', sv.getAttribute('data-n') ?? '') : null, tag);
/** 큰 값 — 값 · 단위(둘째 값이 있으면 「대」) */
const valText = v => (v.v == null ? [h('b', {class: 'su-needv', text: NEED})] : [h('b', {text: v.v}), v.unit ? h('span', {text: v.unit}) : null,
  ...(v.v2 != null ? [h('em', {text: '대'}), h('b', {text: v.v2}), v.unit ? h('span', {text: v.unit}) : null] : [])]);
/** 「그래서」 한 줄 */
const meanLine = v => h('p', {class: 'su-mean', 'aria-label': '그래서 무슨 뜻'}, h('i', {text: '그래서'}), h('span', {class: v.mean ? null : 'su-needt', text: v.mean ?? NEED}));
/** 자세한 셈 — 이름 · 값 · 어떻게 셌나 */
const proList = pro => (pro?.length ? h('dl', {class: 'sj-pro'}, ...pro.flatMap(r => [h('dt', {text: r.k}), h('dd', {}, h('b', {text: String(r.v)}), r.how ? h('span', {text: ' · ' + r.how}) : null)])) : null);

/** 쪽 하나 — {title, dom} · lc = 마지막에 본 회사 번호(탭 「멈춤」) */
export function sjPage(m, lc = null) {
  const page = m.page ?? (m.tab === 2 ? 'why' : m.tab === 3 ? 'journal' : 'miss');
  const head = h('section', {class: 'sj-sec sj-ph', 'aria-label': m.h1 ?? m.title},
    m.step ? stepTag(m.step) : null,
    m.kick ? h('p', {class: 'sj-k', text: m.kick}) : null,
    h('div', {class: 'sj-today'}, h('h1', {class: 'sj-h1', ...(m.proper ? {'data-proper': ''} : {})}, h('b', {class: 'sj-land', text: m.h1 ?? m.title})),
      m.seal ? h('span', {class: 'sj-seal sj-seal-big sj-seal-up', 'aria-hidden': 'true', text: m.seal}) : null),
    m.ink ? h('figure', {class: 'sj-ink su-fig sj-whyfig'}, capOf(m.ink), m.ink) : null,
    m.say ? h('div', {class: 'sj-says'}, meanCap(PM.sonmu), h('span', {class: 'sj-saysp', 'aria-hidden': 'true'}, sonmuPic({w: 84, h: 100})), h('p', {class: 'sj-do', 'data-say': '', text: m.say})) : null);
  const two = m.big ? h('section', {class: 'sj-sec sj-two su-two', 'aria-label': '큰 값과 그래서'}, h('div', {class: 'su-big'}, h('p', {class: 'su-bv'}, ...valText(m.big))), m.big.label ? h('p', {class: 'su-bl', text: m.big.label}) : null, meanLine(m.big)) : null;
  const act = m.act?.filter(Boolean).length ? h('section', {class: 'sj-sec sj-act', 'aria-label': '누르는 곳'}, ...m.act.filter(Boolean)) : null;
  const body = m.body?.filter(Boolean).length ? h('section', {class: 'sj-sec sj-body'}, ...m.body.filter(Boolean)) : null;
  const figs = m.figs?.filter(Boolean).length ? h('section', {class: 'sj-sec sj-figs', 'aria-label': '그림'}, ...m.figs.filter(Boolean).map(f => (f.tagName === 'FIGURE' ? f : h('figure', {class: 'sj-ink su-fig'}, capOf(f), f)))) : null;
  const more = m.pro?.length || m.note ? h('details', {class: 'sj-drawer sj-whymore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '자세히'}), h('span', {class: 'sj-s2', text: '점수를 센 법'}), chev()),
    proList(m.pro), m.note ? h('p', {class: 'sj-note', text: m.note}) : null) : null;
  const main = h('main', {class: 'sj-page sj-sub', 'data-page': page}, head, two, act, body, figs, more, endSec(day(m.asOf ?? null), m.S?.fetchedAt ? kstText(m.S.fetchedAt) : null));
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = '';
  const nx = m.next ? {href: m.next.href, k: m.next.k ?? (m.next.step ? m.next.step + ' / 5' : null), label: m.next.label} : null;
  return {title: m.title ?? NAME, dom: [topBar(), main, nx ? dockNav(m.step ?? null, nx) : null, tabNav(m.tab ?? -1, lc)].filter(Boolean)};
}
/** 찾지 못한 쪽 — 손자병법 판 · 처음으로 */
export const missModel = t => ({title: '찾지 못했어요', h1: '찾지 못했어요', page: 'miss', tab: -1, say: t, body: [h('a', {class: 'sj-go', href: '#/'}, h('span', {text: '처음으로 · 오늘 시장 보기'}), h('i', {'aria-hidden': 'true', text: '›'}))]});
