/* 새 첫 화면 칸들(사장님 2026-10-28(서울) 10:55 처음 본 사람의 말 · 11:12 「어」 — 첫 화면부터 처음 보는 사람 눈높이로 다시 짜기 · 11:21 「5배빨리해」
   · 12:00 「배경을 최고급 핑크로」 · 12:09 「글보다는 주식 도식화로 표현을 정말 많이해 대범하게 해」)
   명령문 docs/design/why-mock-2026-10-28/order-1055.txt · order-1112.txt · order-1200.txt · order-1209.txt — 글은 짧게 · 숫자는 그림으로
   2026-10-29 01:48 「이 36이 둘이를 다 함께 아주 직관적으로」(order-0148.txt) — 네 걸음 ① 찾기(소개) ② 보기(지난 기록 · 오늘 자리) ③ 묻기(질문 11개) ④ 돌아보기(한 달 뒤)
   2026-10-29 12:45 ~ 13:33 「바보도 … 요즘 주식판을 한눈에 · 헷갈리게 글을 적는 것 모두 빼 · 분명한 이야기만」(docs/design/babo-2026-10-29/order-1245.txt · brief.md) —
   ① 돈 흐름(맨 위 · 돈이 몰린 곳 셋 · 빠진 곳 셋) ② 고른 회사(오늘 맞은 회사 · 100곳 중 몇 곳 · 최근 두 달) · 업종 점 그림 · 오늘 시장 ③ 묻기(질문 11개) ④ 돌아보기 · 칸마다 스승 한 줄(서른여섯 + 셋)
   뺀 것: 네 걸음 단추 줄 · 근거 셋 카드 · 오늘 자리 줄 · 기둥 둘 · 100만 원 막대 · 해마다 · 틀린 까닭 고리 · 날마다 · 고른 길 깔때기 · 조건 수별 막대 · 네 칸 막대 · 「읽는 법」 · 점검 셋 퍼센트
   옛 차례: 소개(코스피 석 달 그림) → 업종 지도(점 그림 · 네 자리 막대 · 조건 수별 막대) → 조건으로 고른 회사(기둥 둘 · 100만 원 막대 · 해마다 · 틀린 까닭 고리 · 날마다 · 고른 길 깔때기)
   → 오늘 시장(코스닥 석 달 · 오른 · 내린 회사 · 사고판 돈) → 사기 전 확인(네 걸음 그림) → 공식 안내
   숫자는 자료 그대로(home.json · theme-home.json · theme-bloom.json · 요약 파일) — 지어 채우지 않음 · 못 받으면 「?」
   글은 textContent 로만 · 색은 home-new.css(글 속 style 없음 · 너비만 CSSOM) · 그림은 svg(바둑판 셈 밖) · 앞날 말 없음 · 사고팔기 권하지 않음 */
import {RULE} from './theme-rule.js';
import {ON as EN} from './i18n.js'; // 영어 판이면 까닭 열한 가지 글은 자료 파일의 영어 글을 그대로(flow-why.json en) — 한국어 판은 아무것도 안 바뀜

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const num = n => Number(n).toLocaleString('ko-KR');
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r0 = v => Math.round(v);
const md = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? `${+m[2]}월 ${+m[3]}일` : '?'; };
const mdS = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? `${+m[2]}.${+m[3]}` : '?'; };
const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '');
const p2 = v => sgn(v) + Math.abs(v).toFixed(2) + '%';
const T = (s, x, y, t, cls, anchor = 'start') => { const e = sv('text', {class: cls, x: (+x).toFixed(1), y: (+y).toFixed(1), 'text-anchor': anchor}); e.textContent = t; s.append(e); return e; };
const svgBox = (cls, W, H, label) => sv('svg', {class: 'nh-svg ' + cls, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label});
/** 네 자리 쉬운 이름 — 놓는 자리는 theme-rule.js zoneOf 그대로(가로 RULE.bloomX · 세로 0) */
export const ZNAME = Object.freeze({S: '막 오르기 시작', B: '한 달 내내 강함', W: '강하다 꺾임', Q: '조용함'});
const ZORDER = ['S', 'B', 'Q', 'W']; // 위 왼쪽 · 위 오른쪽 · 아래 왼쪽 · 아래 오른쪽

/** 석 달 선 그림(지수 · 날마다 마감 값) — 칠한 넓이(한 색 · 옅게) · 가장 높은 · 낮은 날 점 · 마지막 값 */
function lineChart(x, {W = 340, H = 168, cls = 'nh-kc', name = ''} = {}) {
  const rows = (Array.isArray(x?.rows) ? x.rows : []).filter(r => Array.isArray(r) && fin(r[1]));
  if (rows.length < 2) return null;
  const L = 6, R = 6, Tp = 26, B = 26, pw = W - L - R, ph = H - Tp - B, vs = rows.map(r => r[1]), lo = Math.min(...vs), hi = Math.max(...vs), pad = (hi - lo) * 0.08 || 1;
  const sx = i => L + (i / (rows.length - 1)) * pw, sy = v => Tp + ((hi + pad - v) / (hi - lo + 2 * pad)) * ph;
  const s = svgBox(cls, W, H, `${name} 석 달 · ${md(rows[0][0])}부터 ${md(rows[rows.length - 1][0])}까지 · 마지막 ${num(r0(vs[vs.length - 1]))}`);
  const pts = rows.map((r, i) => `${sx(i).toFixed(1)},${sy(r[1]).toFixed(1)}`);
  s.append(sv('path', {class: 'nh-ka', d: `M${sx(0).toFixed(1)},${Tp + ph} L${pts.join(' L')} L${sx(rows.length - 1).toFixed(1)},${Tp + ph} Z`}), sv('path', {class: 'nh-kl', d: 'M' + pts.join(' L')}));
  const iHi = vs.indexOf(hi), iLo = vs.indexOf(lo), last = rows.length - 1;
  const mark = (i, t, up) => { const x = sx(i), y = sy(vs[i]); s.append(sv('circle', {class: 'nh-km', cx: x.toFixed(1), cy: y.toFixed(1), r: 4}));
    if (up) T(s, Math.min(Math.max(x, L + 46), W - R - 46), y - 9, t, 'nh-kt', 'middle'); else { const right = x < W * 0.6; T(s, right ? x + 9 : x - 9, y + 6, t, 'nh-kt', right ? 'start' : 'end'); } };
  mark(iHi, '높은 ' + num(r0(hi)), true); if (iLo !== iHi) mark(iLo, '낮은 ' + num(r0(lo)), false);
  s.append(sv('circle', {class: 'nh-klast', cx: sx(last).toFixed(1), cy: sy(vs[last]).toFixed(1), r: 6}));
  T(s, L, H - 4, mdS(rows[0][0]), 'nh-kd'); T(s, W - R, H - 4, mdS(rows[last][0]), 'nh-kd', 'end');
  return s;
}
/** 지수 칸 — 이름 · 마지막 값 · 하루 % · 석 달 그림 */
function idxCard(x, name, big = false) {
  const g = lineChart(x, {W: 340, H: big ? 168 : 132, name}); if (!g) return null;
  const c = fin(x.day) ? (Math.round(x.day * 100) === 0 ? 'fl' : x.day > 0 ? 'up' : 'dn') : '';
  return h('div', {class: 'nh-idx' + (big ? ' nh-idx-big' : ''), 'data-num': ''},
    h('div', {class: 'nh-ih'}, h('span', {class: 'nh-in', text: name + ' 석 달'}), h('b', {class: 'num nh-iv', text: fin(x.close) ? num(Math.round(x.close * 100) / 100) : '?'}), h('b', {class: 'num nh-ic ' + c, text: fin(x.day) ? p2(x.day) : '?'})), g);
}


/** 맨 위 = ① 돈 흐름(사장님 2026-10-29(서울) 12:45 「바보가 있어 바보를 주식하게」 · 12:51 「요즘 주식판을 한눈에 … 돈이 이렇게 흘러서」 · 13:33 「헷갈리게 글을 적는 것 모두 빼 · 분명한 이야기만」
   · docs/design/babo-2026-10-29/order-1245.txt) — 한 달(20거래일) 동안 시장보다 가장 더 오른 업종 셋 · 가장 덜 오른 업종 셋(theme-home.json inds x = 업종이 오른 비율에서 시장이 오른 비율을 뺀 값)
   막대 길이 = 그 값(여섯 가운데 가장 큰 값이 끝) · 끝 글 「8% 더」 「19% 덜」 · 순위 번호 없음(망치는 길 「수익 순위」 아님 — 오른 곳과 내린 곳을 함께) · 빨간 글은 숫자 글만(check_white ④)
   스승 한 줄 = 애덤 스미스(국부론 1편 7장 — 사려는 사람이 많으면 값이 시장 값보다 오름) · 여는 동안 칸(boot-home.js)은 같은 틀 · 같은 높이(빈 줄 여섯) — 글은 tests/atlas11/home-new.test.mjs 가 맞댐 */
export const FLOW_N = 3;
export function flowRows(TH) {
  const s = (TH?.inds ?? []).filter(i => fin(i?.x) && typeof i?.n === 'string').sort((a, b) => b.x - a.x);
  return {up: s.filter(i => i.x > 0).slice(0, FLOW_N), dn: s.filter(i => i.x < 0).slice(-FLOW_N).reverse()};
}
const amt = v => { const a = Math.abs(v); return a < 1 ? a.toFixed(1) : String(Math.round(a)); };
/** 스승 한 줄 — 동그라미 첫 글자 · 이름 · 한 문장(지어낸 따옴말이 아니라 그 사람 생각을 쉬운 말로 · docs/design/babo-2026-10-29/brief.md 출처) */
/** 스승 이름 → 서른아홉 스승 카드(#/sage/<이름> · p-sage.js · 사장님 2026-10-29 19:14 「정말 정말 쉽기 이용하고 따딱딱」) — 누르면 그 사람 한 장 · 모양 · 크기는 그대로(누르는 자리 48px) */
export const SAGE_ID = Object.freeze({'애덤 스미스': 'adamsmith', '소크라테스': 'socrates', '리콴유': 'leekuanyew', '다윈': 'darwin', '덩샤오핑': 'dengxiaoping', '퍼스': 'peirce'});
export const sage = (who, say) => h(SAGE_ID[who] ? 'a' : 'p', {class: 'nh-sage', href: SAGE_ID[who] ? '#/sage/' + SAGE_ID[who] : null}, h('i', {'aria-hidden': 'true', text: '“'}), h('b', {text: who}), ' ', h('span', {text: say}));
/* 몰린 곳마다 까닭 열한 가지(사장님 2026-10-30(서울) 04:27 「그 돈이 몰리는 이유를 … 왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼 … 잡스라면 어떻게 표현 할 것인지 … 돈 · 상황 · 정치 여러 가지 각도」
   · 05:03 「응」 — 그림 시안 「한 줄 결론, 불빛 열한 개, 누르면 자세히. 모르는 것은 「?」 그대로」 · 결정표 docs/design/why11-2026-10-30/decision.md · 말씀 원문 order-0427.txt)
   자료 = /next/data/flow-why.json(올릴 때 한 번 · scripts/atlas11/next/build/flow_why.mjs · 따로 다시 세기 scripts/atlas11/verify/flow_why_verify.py — 틀림 0 일 때만 둠)
   줄 하나 = 누르는 칸(details · summary) 하나: 막대 줄 → 「왜?」 한 줄(마디마다 한 줄 · 늘 두 줄 자리) → 불빛 열한 개(돈 · 회사 · 상황 · 정치) · 펼치면 열한 가지 글과 기록 출처
   자료가 없거나 기준 날이 막대(theme-home.json)와 다르면 「왜? 아직 못 셌어요.」 · 불빛은 모두 「?」(같은 높이 — 여는 동안 칸 boot-home.js 와 같은 자리 · 밀림 0)
   시장이 내린 달(몰린 곳 가운데 한 곳이라도 실제로 내림)은 머리 「시장이 n% 내릴 때 · 여기는 버텼어요」 · 칸 이름 「덜 내린 곳」 「더 내린 곳」(자료 head — 결정표 4)
   앞날 말 · 사고팔기 말 없음 · 기사 제목은 그대로 옮기고 신문 · 날짜를 붙임(까닭이라고 단정하지 않음) */
export const WHY_SCHEMA = 'dori-flow-why-1';
const WG = [['돈', 'Money', [1, 2, 3]], ['회사', 'Firms', [4, 5, 6]], ['상황', 'Market', [7, 8, 9]], ['정치', 'Politics', [10, 11]]]; // 불빛 무리(자료가 없을 때도 같은 틀 · flow_why.mjs GROUPS 와 같음)
/** 까닭 자료가 첫 화면 막대와 같은 날 것인가 */
export const whyOk = (TH, W) => !!(W && W.schema === WHY_SCHEMA && typeof TH?.asOf === 'string' && W.asOf === TH.asOf && Array.isArray(W.inds));
const DOT = 15, DG = 3;
/** 불빛 — 켜짐(on · 기록으로 맞음) 칠한 동그라미 · 꺼짐(off · 아님) 빈 동그라미 · 모름(q) 점선 동그라미 안 「?」(그림 — 글 셈 밖) */
function dots(ss) {
  const w = ss.length * DOT + (ss.length - 1) * DG, s = sv('svg', {class: 'y11-dots', viewBox: `0 0 ${w} ${DOT}`, width: w, height: DOT, 'aria-hidden': 'true'});
  ss.forEach((st, j) => { const cx = j * (DOT + DG) + DOT / 2, k = st === 'on' || st === 'off' ? st : 'q'; s.append(sv('circle', {class: 'y11-' + (k === 'q' ? 'qd' : k), cx, cy: DOT / 2, r: DOT / 2 - 1})); if (k === 'q') T(s, cx, DOT / 2 + 3.6, '?', 'y11-qt', 'middle'); });
  return s;
}
const lightsLabel = ls => { const n = st => ls.filter(x => x === st).length; return EN ? `Of 11 reasons: ${n('on')} yes, ${n('off')} no, ${n('q')} unknown` : `까닭 열한 가지 가운데 맞음 ${n('on')} · 아님 ${n('off')} · 모름 ${n('q')}`; };
/** 불빛 줄 — 무리 넷(불빛 · 이름) */
function lightRow(ls) {
  const all = Array.from({length: 11}, (_, j) => (ls?.[j] === 'on' || ls?.[j] === 'off' ? ls[j] : 'q'));
  return h('div', {class: 'y11-lt', role: 'img', 'aria-label': lightsLabel(all)}, ...WG.map(([ko, en, ks]) => h('span', {class: 'y11-g'}, dots(ks.map(k => all[k - 1])), h('i', {text: EN ? en : ko}))));
}
/** 「열한 가지 보기 ›」 — 늘 한 줄(그림 시안 04:4x 그대로 · 좁은 폭에서도 같은 높이) · 펼치면 화살이 아래로 */
const moreLine = () => h('div', {class: 'y11-m'}, h('span', {text: EN ? 'See all 11' : '열한 가지 보기'}), h('i', {'aria-hidden': 'true', text: '›'}));
/** 「왜?」 한 줄 — 마디마다 한 줄(block) · 자료가 없으면 「아직 못 셌어요.」 */
const whyLine = lines => h('div', {class: 'y11-l'}, h('b', {class: 'y11-q', text: EN ? 'Why?' : '왜?'}),
  h('span', {class: 'y11-t'}, ...(Array.isArray(lines) && lines.length ? lines : [EN ? 'Not counted yet.' : '아직 못 셌어요.']).map(t => h('span', {text: t}))));
/** 펼친 칸 — 불빛 뜻 · 무리 넷(이름 · 물음) · 열한 가지(번호 · 이름 · 기록 한 줄 · 출처 한 줄) · 대표 회사 기록이라는 말 */
function whyList(w, W) {
  const L = o => (EN ? o?.en : o?.ko), key = (st, ko, en) => h('span', {class: 'y11-k'}, dots([st]), h('span', {text: EN ? en : ko}));
  const groups = Array.isArray(W.groups) && W.groups.length ? W.groups : WG.map(([ko, en, ks]) => ({ko, en, ks}));
  return h('div', {class: 'y11-x'},
    h('p', {class: 'y11-key'}, key('on', '기록으로 맞음', 'Yes by the record'), key('off', '아님', 'No'), key('q', '아직 모름', 'Not known yet')),
    ...groups.map(g => h('div', {class: 'y11-gr'},
      h('p', {class: 'y11-gh'}, h('b', {text: EN ? g.en : g.ko}), L(g.q) ? h('span', {text: L(g.q)}) : null),
      h('ol', {class: 'y11-ol'}, ...(g.ks ?? []).map(k => {
        const it = (w.items ?? []).find(x => x?.k === k), st = it?.s === 'on' || it?.s === 'off' ? it.s : 'q', tx = L(it);
        return h('li', {class: 'y11-li', 'data-s': st}, dots([st]), h('div', {class: 'y11-tx'},
          h('p', {class: 'y11-nm'}, h('b', {class: 'num', text: String(k)}), h('span', {text: L(W.names?.[k]) ?? ''})),
          h('p', {class: 'y11-tt', text: tx?.t ?? '?'}),
          tx?.sub ? h('p', {class: 'y11-sub', text: tx.sub}) : null));
      })))),
    L(W.note) ? h('p', {class: 'y11-note', text: L(W.note)}) : null);
}
/** 몰린 곳 한 줄 — 막대 줄 + 「왜?」 + 불빛(자료가 있으면 누르는 칸 · 없으면 같은 모양 「?」) */
function upItem(bar, w, W) {
  if (!w) return h('li', {class: 'y11-i'}, h('div', {class: 'y11-box y11-none'}, h('div', {class: 'y11-s'}, bar, whyLine(null), lightRow(null), moreLine())));
  return h('li', {class: 'y11-i'}, h('details', {class: 'y11-box'}, h('summary', {class: 'y11-s'}, bar, whyLine(EN ? w.why?.en : w.why?.ko), lightRow(w.lights), moreLine()), whyList(w, W)));
}
/** 빈 자리(몰린 곳이 셋보다 적은 날) — 여는 동안 칸과 같은 높이 */
const upEmpty = () => h('li', {class: 'y11-i y11-e'}, h('div', {class: 'y11-box'}, h('div', {class: 'y11-s'}, h('div', {class: 'nh-fr nh-f0'}), h('div', {class: 'y11-l'}), h('div', {class: 'y11-lt'}), h('div', {class: 'y11-m'}))));
function flowMap(TH, W = null) {
  const {up, dn} = flowRows(TH), max = Math.max(1, ...[...up, ...dn].map(i => Math.abs(i.x))), ok = whyOk(TH, W), head = ok && W.head ? W.head : null;
  const keys = head ? (EN ? head.keys?.en : head.keys?.ko) ?? [] : [];
  const bar = (i, k, tag) => { const b = h('i', {class: 'nh-fbar', 'aria-hidden': 'true'}); b.style.width = Math.max(8, (Math.abs(i.x) / max) * 100).toFixed(1) + '%'; // 줄 안을 채운 막대(이름 · 값 글은 막대 위)
    return h(tag, {class: 'nh-fr'}, b, h('span', {class: 'nh-fn', 'data-proper': '', text: i.n}), h('b', {class: 'num', text: amt(i.x) + (k === 'up' ? '% 더' : '% 덜')})); };
  const upList = h('ol', {class: 'nh-fl nh-fl-up'}, ...Array.from({length: FLOW_N}, (_, j) => (up[j] ? upItem(bar(up[j], 'up', 'div'), ok ? W.inds.find(x => x?.n === up[j].n && Array.isArray(x.items)) ?? null : null, W) : upEmpty())));
  const dnList = h('ol', {class: 'nh-fl nh-fl-dn'}, ...Array.from({length: FLOW_N}, (_, j) => (dn[j] ? bar(dn[j], 'dn', 'li') : h('li', {class: 'nh-fr nh-f0'}))));
  return h('div', {class: 'nh-fm', role: 'group', 'aria-label': '한 달 동안 시장보다 더 오른 업종과 덜 오른 업종'},
    h('p', {class: 'nh-fk nh-fk-up'}, h('i', {'aria-hidden': 'true'}), h('span', {text: keys[0] ?? '돈이 몰린 곳'})), upList,
    h('p', {class: 'nh-fk nh-fk-dn'}, h('i', {'aria-hidden': 'true'}), h('span', {text: keys[1] ?? '돈이 빠진 곳'})), dnList,
    h('p', {class: 'nh-fc', text: up.length || dn.length ? '한 달 동안 시장과 견준 값이에요.' : '? 업종 자료를 아직 못 받았어요.'}),
    sage('애덤 스미스', '사려는 사람이 많으면 값이 올라요.'));
}
const goPick = () => document.getElementById('nh-p2')?.scrollIntoView({behavior: 'smooth', block: 'start'}); // ② 고른 회사 칸으로(주소 # 는 그대로)
/** ① 돈 흐름 — 머리(늘 두 줄) · 「권하지 않습니다」(첫 한 화면 안 — 까닭 열한 가지로 칸이 길어져 맨 아래에서 머리 밑으로 · 2026-10-30) · 돈 흐름 판 · ② 로 내려가는 단추 */
export function heroBox(TH = null, W = null) {
  const head = whyOk(TH, W) && W.head ? W.head : null, hl = head ? (EN ? head.en : head.ko) : null;
  return h('section', {class: 'nh-hero', 'aria-label': '요즘 돈 흐름'},
    h('p', {class: 'nh-pm'}, h('i', {'aria-hidden': 'true', text: '1'}), h('span', {text: '돈 흐름'})),
    h('h2', {class: 'nh-h1'}, h('span', {text: hl?.[0] ?? '요즘 돈은'}), ' ', h('span', {class: 'nh-acc', text: hl?.[1] ?? '여기로 몰렸어요'})), // 늘 두 줄(여는 동안 칸과 같은 높이 · 영어 엔진이 문장을 나누지 않게 줄마다 한 덩이)
    h('p', {class: 'nh-no', text: '앞날을 맞히거나 사고팔기를 권하지 않습니다.'}),
    flowMap(TH, W),
    h('div', {class: 'nh-door'}, h('button', {type: 'button', class: 'nh-go nh-gopick', onclick: goPick}, h('span', {text: '지난 기록으로 고른 회사 보기'}), h('i', {'aria-hidden': 'true', text: '›'}))));
}
/** 마디 머리 — 동그라미 번호 · 마디 이름 · 큰 숫자 줄 · 결론 한 줄 · 작은 풀이 한 줄 */
export function partHead({n, k, big = [], line = '', cap = '', id = 'nh-p' + n}) {
  return h('div', {class: 'nh-part', id},
    h('p', {class: 'nh-pm'}, h('i', {'aria-hidden': 'true', text: n}), h('span', {text: k})),
    big.length ? h('p', {class: 'nh-pb', 'data-num': ''}, ...big) : null,
    line ? h('h2', {class: 'nh-pl', text: line}) : null,
    cap ? h('p', {class: 'nh-pc', text: cap}) : null);
}
/** 100칸 그림 — 칠한 칸 = 100곳 가운데 n곳(자연 빈도 · 샘플 21 뮐러브로크만 · 32 닐슨) */
function waffle(n, cls, label) { // 10 × 10 칸
  const s = svgBox('nh-waf ' + cls, 120, 120, `${label} 100곳 중 ${n}곳`);
  for (let i = 0; i < 100; i++) s.append(sv('rect', {class: i < n ? 'on' : 'off', x: (i % 10) * 12 + 1, y: Math.floor(i / 10) * 12 + 1, width: 10, height: 10, rx: 2}));
  return s;
}
/** ③ 묻기 머리 — 질문 11개 · 스승 둘(소크라테스 「돌아보지 않는 삶은 살 가치가 없다」(변론 38a) · 리콴유 「정한 규칙은 지킨다」) — 옛 점검 셋 퍼센트 · 「못 넘은 2,741번」 줄은 뺌(13:33 「헷갈리게 글을 적는 것 모두 빼」) */
export function partDo() {
  const head = partHead({n: '3', k: '묻기', big: [h('b', {class: 'num', text: '11'}), h('span', {text: '개 질문'})], line: '사기 전에 한 번 더 확인하세요', cap: '약 2분 · 답은 이 기기에만 남아요'});
  head.append(sage('소크라테스', '왜 사는지 스스로 물어봐요.'), sage('리콴유', '정한 규칙은 꼭 지켜요.'));
  return head;
}

/** 업종 점 그림 — 점 하나 = 업종 하나 · 가로 = 최근 20거래일 시장보다 더 오른 정도(%p) · 세로 = 최근 5거래일 · 기준선 가로 RULE.bloomX · 세로 0 · 축 화살표와 뜻은 그림 안에 */
function plot(TH) {
  const I = (TH?.inds ?? []).filter(i => fin(i?.x) && fin(i?.y) && ZNAME[i.z]);
  const W = 340, H = 360, L = 28, Tp = 10, R = 8, B = 54, pw = W - L - R, ph = H - Tp - B;
  const X0 = Math.floor(Math.min(-5, ...I.map(i => i.x)) - 2), X1 = Math.ceil(Math.max(RULE.bloomX + 10, ...I.map(i => i.x)) + 2);
  const Y0 = Math.floor(Math.min(-5, ...I.map(i => i.y)) - 3), Y1 = Math.ceil(Math.max(5, ...I.map(i => i.y)) + 3.5); // 위 · 아래 이름 자리를 비움(점이 이름을 가리지 않게)
  const sx = x => L + ((x - X0) / (X1 - X0)) * pw, sy = y => Tp + ((Y1 - y) / (Y1 - Y0)) * ph, qx = sx(RULE.bloomX), qy = sy(0);
  const cnt = TH?.count ?? {};
  const s = svgBox('nh-plot', W, H, `업종 ${num(I.length)}개 점 그림 · ` + ZORDER.map(z => `${ZNAME[z]} ${fin(cnt[z]) ? cnt[z] : '?'}개`).join(' · '));
  const rect = (z, x, y, w, hh) => s.append(sv('rect', {class: 'nh-zq nh-zq-' + z, x: x.toFixed(1), y: y.toFixed(1), width: Math.max(0, w).toFixed(1), height: Math.max(0, hh).toFixed(1)}));
  rect('S', L, Tp, qx - L, qy - Tp); rect('B', qx, Tp, L + pw - qx, qy - Tp); rect('Q', L, qy, qx - L, Tp + ph - qy); rect('W', qx, qy, L + pw - qx, Tp + ph - qy);
  s.append(sv('line', {class: 'nh-zline', x1: qx.toFixed(1), y1: Tp, x2: qx.toFixed(1), y2: Tp + ph}), sv('line', {class: 'nh-zline', x1: L, y1: qy.toFixed(1), x2: L + pw, y2: qy.toFixed(1)}));
  // 지나온 길(조건 넷을 다 채운 곳 · 한 달 동안 가장 센 곳) — 옅은 선 · 처음 자리 작은 점
  const hiX = [...I].sort((a, b) => b.x - a.x)[0], lab = [...new Set([...I.filter(i => i.sc === 4), hiX].filter(Boolean))];
  for (const i of lab) { const t = (Array.isArray(i.t) ? i.t : []).filter(p => Array.isArray(p) && fin(p[0]) && fin(p[1])); if (t.length < 2) continue;
    s.append(sv('polyline', {class: 'nh-trail', points: t.map(p => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')}), sv('circle', {class: 'nh-trail0', cx: sx(t[0][0]).toFixed(1), cy: sy(t[0][1]).toFixed(1), r: 3})); }
  for (const i of I) s.append(sv('circle', {class: 'nh-dot nh-dot-' + i.z + (i.sc === 4 ? ' nh-dot4' : ''), cx: sx(i.x).toFixed(1), cy: sy(i.y).toFixed(1), r: i.sc === 4 ? 8 : 5.5}));
  T(s, L + 6, Tp + 20, `${ZNAME.S} ${fin(cnt.S) ? cnt.S : '?'}`, 'nh-zl nh-zl-S'); T(s, L + pw - 6, Tp + 20, `${ZNAME.B} ${fin(cnt.B) ? cnt.B : '?'}`, 'nh-zl nh-zl-B', 'end');
  T(s, L + 6, Tp + ph - 9, `${ZNAME.Q} ${fin(cnt.Q) ? cnt.Q : '?'}`, 'nh-zl nh-zl-Q'); T(s, L + pw - 6, Tp + ph - 9, `${ZNAME.W} ${fin(cnt.W) ? cnt.W : '?'}`, 'nh-zl nh-zl-W', 'end');
  for (const i of lab) { const x = sx(i.x), y = sy(i.y), right = x < L + pw * 0.62; T(s, right ? x + 11 : x - 11, y + 5, i.n, 'nh-dl', right ? 'start' : 'end'); }
  // 축 — 화살표와 기준 숫자를 그림 안에(글 풀이 대신)
  s.append(sv('line', {class: 'nh-axl', x1: L, y1: H - 22, x2: L + pw, y2: H - 22}), sv('path', {class: 'nh-axh', d: `M${L + pw - 7},${H - 26} L${L + pw},${H - 22} L${L + pw - 7},${H - 18}`}));
  T(s, L + pw - 10, H - 28, '한 달 동안 시장보다 더 오름', 'nh-axt', 'end'); // 「+5%p」 · 「0」 눈금 글은 뺌(2026-10-29 13:33 「헷갈리게 글을 적는 것 모두 빼」 — 줄은 그대로)
  s.append(sv('line', {class: 'nh-axl', x1: 10, y1: Tp + ph, x2: 10, y2: Tp}), sv('path', {class: 'nh-axh', d: `M6,${Tp + 7} L10,${Tp} L14,${Tp + 7}`}));
  T(s, 20, Tp + ph * 0.26, '닷새 동안 더 오름', 'nh-axt nh-axv', 'middle').setAttribute('transform', `rotate(-90 20 ${(Tp + ph * 0.26).toFixed(1)})`);
  return {svg: s, n: I.length};
}

/** 업종 칸 — 둘이 물음(「?」로 끝남 · data-say) · 날짜 · 점 그림 · 한 문장 · 네 자리 이름과 수 · 힘이 고르게 붙은 업종(조건 넷 · sc 4) · 업종 모두 보기
   2026-10-29 13:33 「헷갈리게 글을 적는 것 모두 빼 · 분명한 이야기만」 — 네 칸 막대(이름 · 수가 아래 줄과 겹침) · 조건 수별 막대 · 「읽는 법」(%p · 거래일 풀이)은 뺌 */
export function mapBox(TH, news = null) {
  if (!TH?.inds?.length) return h('section', {class: 'nh-sec nh-map', 'data-w': 'theme'}, h('h2', {class: 'nh-h2', 'data-say': '', text: '지금 업종은 어디쯤 있나요?'}), h('p', {class: 'nh-p', text: '? 업종 자료를 아직 못 받았습니다. 잠시 뒤 다시 열어 주세요.'}));
  const {svg, n} = plot(TH), cnt = TH.count ?? {}, real = TH.inds.filter(i => i.sc === 4).map(i => i.n);
  return h('section', {class: 'nh-sec nh-map', 'data-w': 'theme', 'aria-label': '업종 점 그림'},
    h('h2', {class: 'nh-h2', 'data-say': '', text: `지금 업종 ${num(n)}개는 어디쯤 있나요?`}),
    h('p', {class: 'nh-d', text: `${md(TH.asOf)} 종가 기준 · 점 하나가 업종 하나`}), news,
    h('div', {class: 'nh-plotw'}, svg),
    h('p', {class: 'nh-say', text: '오른쪽 위로 갈수록 요즘 돈이 더 몰린 업종이에요.'}),
    h('ul', {class: 'nh-leg', 'aria-label': '네 자리 이름과 업종 수'}, ...ZORDER.map(z => h('li', {class: 'nh-lg nh-lg-' + z}, h('i', {'aria-hidden': 'true'}), h('span', {text: ZNAME[z]}), h('b', {class: 'num', text: fin(cnt[z]) ? cnt[z] + '개' : '?'})))),
    real.length ? h('p', {class: 'nh-real'}, h('span', {class: 'nh-rk', text: '힘이 고르게 붙은 업종'}), h('b', {'data-proper': '', text: real.join(', ')})) : h('p', {class: 'nh-real nh-real0'}, h('span', {class: 'nh-rk', text: '힘이 고르게 붙은 업종은 오늘 없습니다.'})),
    h('a', {class: 'nh-link', href: '#/f/ind'}, h('span', {text: `업종 ${num(n)}개 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'})));
}

/** 최근 두 달(기록 달력 가운데 한 달이 지난 날 — theme-home.js pickPQ 와 같은 셈) */
function recent(B) {
  const days = Array.isArray(B?.cal?.days) ? B.cal.days.filter(d => d && typeof d.d === 'string') : [];
  const done = days.filter(d => d.hit + d.miss > 0), sum = f => done.reduce((p, d) => p + (Number(f(d)) || 0), 0);
  const D = sum(d => d.hit + d.miss), N = sum(d => d.bn);
  return {P: D ? Math.round((sum(d => d.hit) / D) * 100) : null, Q: N ? Math.round((sum(d => d.bh) / N) * 100) : null, n: D};
}

/** ② 고른 회사(본질 1 「싹에서 꽃이 되는 종목을 지난 기록으로 엄선해 찾아 준다」 · 2 ② 「지난 기록만 보여 준다」) — 사장님 2026-10-29 13:30 「이거 사라는 못넣어도 이게 확율이 좋은듯해 수익성이 이렇다는 할수 있잖아」
   · 13:33 「모든 회사는 스물네 번이었어요 … 일예로 이론 거야 분명한 이야기만 해」 — 주어가 분명한 문장 둘(「이렇게 고른 회사 100곳 중 n곳 …」 · 「같은 날 아무 회사나 골랐다면 100곳 중 n곳」)
   · 오늘 조건에 맞은 회사(theme-bloom.json today — 이름만 · 「사라」 말 없음) · 100칸 그림 둘 · 최근 두 달(지면 진 대로 · 손실 숨기기 없음 — 다윈 「내 생각과 어긋난 사실은 바로 적는다」(자서전))
   · 덩샤오핑 「흰 고양이든 검은 고양이든 쥐를 잡으면 좋은 고양이」(1962 — 말보다 결과) · 고리 둘(#/t/pick · #/t/picks — check_theme ⑪ 차례 그대로) */
function todayPicks(B) {
  if (!B?.today) return h('p', {class: 'nh-tp nh-tp0', text: '? 오늘 고른 회사를 아직 못 받았어요.'});
  const list = (Array.isArray(B.today.inds) ? B.today.inds : []).flatMap(i => (Array.isArray(i?.co) ? i.co : []).map(c => ({n: c?.[1], i: i?.n}))).filter(x => typeof x.n === 'string' && x.n);
  if (!list.length) return h('p', {class: 'nh-tp nh-tp0', text: '오늘은 조건에 맞은 회사가 없어요.'});
  return h('div', {class: 'nh-tp'}, h('p', {class: 'nh-tpk', text: `오늘 조건에 맞은 회사 ${num(list.length)}곳`}),
    h('ul', {class: 'nh-tpl'}, ...list.slice(0, 5).map(x => h('li', {}, h('b', {'data-proper': '', text: x.n}), typeof x.i === 'string' ? h('small', {'data-proper': '', text: x.i}) : null))));
}
const wfig = (n, cls, label) => h('figure', {class: 'nh-wf'}, waffle(n, cls, label), h('figcaption', {}, h('b', {class: 'num', text: n + '곳'}), h('span', {text: label})));
export function recordBox(B) {
  const R = B?.record?.all, ok = R && fin(R.rate) && fin(R.base) && Number.isInteger(R.n);
  const box = h('section', {class: 'nh-sec nh-rec', id: 'nh-p2', 'data-w': 'record', 'aria-label': '지난 기록으로 고른 회사'},
    h('p', {class: 'nh-pm'}, h('i', {'aria-hidden': 'true', text: '2'}), h('span', {text: '고른 회사'})),
    h('h2', {class: 'nh-pl', text: '돈이 몰린 업종에서 지난 기록으로 골라요'}), todayPicks(B));
  if (!ok) { box.append(h('p', {class: 'nh-p', text: '? 지난 기록을 아직 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), recLinks()); return box; }
  const a = Math.round(R.rate), b = Math.round(R.base), rc = recent(B);
  box.append(h('div', {class: 'nh-wafs'}, wfig(a, 'me', '이렇게 고른 회사'), wfig(b, 'all', '아무 회사나')),
    h('p', {class: 'nh-say', text: `이렇게 고른 회사 100곳 중 ${a}곳이 한 달 뒤 시장보다 5% 넘게 더 올랐어요.`}),
    h('p', {class: 'nh-say', text: `같은 날 아무 회사나 골랐다면 100곳 중 ${b}곳이었어요.`}));
  if (rc.P != null && rc.Q != null) box.append(h('div', {class: 'nh-warn' + (rc.P < rc.Q ? ' nh-worse' : '')},
    h('p', {class: 'nh-wt', text: rc.P < rc.Q ? `최근 두 달은 100곳 중 ${rc.P}곳 대 ${rc.Q}곳으로 졌어요.` : `최근 두 달은 100곳 중 ${rc.P}곳 대 ${rc.Q}곳으로 앞섰어요.`}), sage('다윈', '내 생각과 다른 기록도 바로 적어요.')));
  box.append(sage('덩샤오핑', '말보다 결과를 봐요.'), recLinks());
  return box;
}
const recLinks = () => h('div', {class: 'nh-links'},
  h('a', {class: 'nh-link', href: '#/t/pick'}, h('span', {text: '날짜별 기록 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
  h('a', {class: 'nh-link', href: '#/t/picks'}, h('span', {text: '고른 회사 모두 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));

/** 사고판 돈 — 개인 · 외국인 · 기관 한 줄씩(이름 · 막대 길이 = 크기 · 빨강 = 더 산 돈 · 파랑 = 더 판 돈 · 값 글) — 억 원 */
function flowBars(F) {
  const x = F?.KOSPI ?? null; if (!x) return null;
  const who = [['개인', x.personal], ['외국인', x.foreign], ['기관', x.institutional]].filter(([, v]) => fin(v)); if (!who.length) return null;
  const W = 340, rowH = 42, H = who.length * rowH + 4, x0 = 62, maxW = 150, sc = maxW / Math.max(...who.map(([, v]) => Math.abs(v)), 1);
  const eok = v => { const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? num(j) + '조' + (r ? ' ' : '') : '') + (r || !j ? num(r) + '억' : ''); };
  const s = svgBox('nh-flow', W, H, `${md(x.date)} 코스피 사고판 돈 · ` + who.map(([n, v]) => `${n} ${v >= 0 ? '더 산 돈' : '더 판 돈'} ${eok(v)} 원`).join(' · '));
  who.forEach(([n, v], i) => { const y = 2 + i * rowH, w = Math.max(4, Math.abs(v) * sc), c = v >= 0 ? 'nh-buy' : 'nh-sell';
    T(s, 0, y + rowH / 2 + 2, n, 'nh-wl');
    s.append(sv('rect', {class: 'nh-fbar ' + c, x: x0, y: y + 6, width: w.toFixed(1), height: rowH - 16, rx: 5}));
    T(s, x0 + w + 8, y + rowH / 2 + 2, (v >= 0 ? '+' : '−') + eok(v), 'nh-fvv ' + c); });
  return s;
}
/** 오늘 시장 — app.js 가 만든 띠(data-w=today)와 시황 사실(data-w=news) · 코스닥 석 달 · 사고판 돈 */
export function mktBox(band, news, H = null) {
  const kp = H?.idx?.KOSPI ? idxCard(H.idx.KOSPI, '코스피', true) : null, kq = H?.idx?.KOSDAQ ? idxCard(H.idx.KOSDAQ, '코스닥') : null, fl = flowBars(H?.flows);
  return h('section', {class: 'nh-sec nh-mkt', 'aria-label': '오늘 시장'}, h('h2', {class: 'nh-h2', text: '오늘 시장'}), band, kp, kq, news,
    fl ? h('div', {class: 'nh-chart'}, h('p', {class: 'nh-ck', text: '코스피 · 누가 더 사고 팔았나'}), fl, h('ul', {class: 'nh-lg3', 'aria-hidden': 'true'}, h('li', {class: 'nh-l-buy'}, h('i'), h('span', {text: '더 산 돈'})), h('li', {class: 'nh-l-sell'}, h('i'), h('span', {text: '더 판 돈'})))) : null);
}

/** 사기 전에 확인하기(③ 묻기 · data-w=gdr) — 첫 고리 #/why · 다 답한 기기 #/gdr(본질 문 ④) · 네 걸음 그림은 맨 위 한 곳(2026-10-29 · 같은 그림 두 번 뺌 — 노자 「덜어 냄」) */
export function whyBox({done = false} = {}) {
  const go = h('a', {class: 'nh-go', href: '#/why'}, h('span', {text: '「왜 사?」 시작하기'}), h('i', {'aria-hidden': 'true', text: '›'}));
  const back = done ? h('a', {class: 'nh-link', href: '#/gdr'}, h('span', {text: '지난 답 돌아보기'}), h('i', {'aria-hidden': 'true', text: '›'})) : null;
  return h('section', {class: 'nh-sec nh-why', 'data-w': 'gdr', 'aria-label': '사기 전에 확인하기'}, back, go); // 제목 · 「약 2분」 줄은 ③ 묻기 머리에 한 번만(2026-10-29 13:33 같은 말 두 번 뺌)
}
/** ④ 돌아보기(2026-10-29 네 걸음 · 본질 「한 달 뒤 그날 정한 대로 했어?로 돌아보게 한다」) — 마르쿠스 아우렐리우스 「날마다 돌아봄」 · 다윈 「어긋난 사실을 바로 적음」 · 사마천 「있는 그대로」
   한 달 된 기록이 있는 기기만 「한 달 전에 정한 대로 했나요?」 줄(app.js monthLine · a.w-month) · 한 달 뒤 쪽 고리 #/why/later */
export function backBox({month = null} = {}) {
  const head = partHead({n: '4', k: '돌아보기', line: '정한 대로 했는지 봐요', cap: '한 달 뒤에 묻고, 틀린 것도 지우지 않아요.'}); // 두 글꼴 모두 한 줄(글꼴이 와도 칸 안이 안 밀리게)
  head.append(sage('퍼스', '해 본 결과로 맞았는지 봐요.')); // 퍼스 「생각의 뜻은 해 본 결과에 있다」(1878 「생각을 어떻게 또렷하게 할까」)
  if (month) head.append(month);
  head.append(h('a', {class: 'nh-link', href: '#/why/later'}, h('span', {text: '한 달 뒤 기록 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
  return head;
}

/** 맨 아래 공식 안내 — 본질 세 줄 칸(app.js essenceBox · data-w=ess)과 안내 두 줄 */
export function footBox(ess) {
  return h('section', {class: 'nh-foot', 'aria-label': '안내'},
    h('h2', {class: 'nh-fh', text: '안내'}), ess,
    h('p', {class: 'nh-fp', text: '이 사이트는 투자 자문이 아닙니다. 지난 기록은 앞날을 보장하지 않습니다.'}),
    h('p', {class: 'nh-fp', text: '투자 판단과 그 결과는 투자하는 사람에게 있습니다.'}));
}
