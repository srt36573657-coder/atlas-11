/* 고도리 칸 — 다섯 문으로 거른 곳과 나눠 담는 비중(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 9 ~ 12 · 14)
   자료 = /next/data/gdr.json(gdr-v1 · scripts/atlas11/next/gdr/pick.mjs · 결정표 docs/design/godori-2026-10-17/brief.md)
   gdrSection(G) = 첫 화면 칸(작은 칸 → 누르면 열림 · 내 돈 넣으면 금액 다시 셈) · render(arg) = #/gdr · #/gdr/<번호>
   말은 「사라」 대신 「나라면 이렇게 하겠어」(명령 14) · 순위 글은 「n번」 · 회사 이름 · 격언은 남의 글(data-proper) · 이름은 brand.js 한 곳(규칙 76) */
import {NAME, josa} from './brand.js';
const NX = globalThis.NX;
const {h} = NX;
const KEY = 'atlas:godori-money', BASE = 10000000;
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const md = d => { const p = String(d ?? '').split('-'); return p.length === 3 ? `${+p[1]}월 ${+p[2]}일` : '?'; };
const getMoney = () => { try { const v = +localStorage.getItem(KEY); return Number.isFinite(v) && v >= 10000 ? Math.floor(v) : BASE; } catch { return BASE; } };
const setMoney = v => { try { localStorage.setItem(KEY, String(v)); } catch { /* 기억 못 함 — 이 화면에만 */ } };
const wTxt = w => (Number.isInteger(w) ? String(w) : w.toFixed(1)) + '%';

/** 카드 하나 — 번호 · 업종 · 이유 한 줄 · 비중 · 금액 · 팔 선 · 절반 팔 선 · 격언 · 「나라면」 */
function card(G, p, money) {
  const amt = Math.floor(money * p.w / 100);
  return h('div', {class: 'gdr-card', id: 'gdr-' + p.no},
    h('p', {class: 'gdr-ch'}, h('b', {class: 'num', text: p.no + '번 '}), h('a', {class: 'gdr-name', href: '#/w/' + NX.enc(p.code), 'data-proper': '', text: p.name}), h('span', {class: 'gdr-ind', text: ' · ' + p.ind})),
    h('p', {class: 'gdr-why', text: p.reason}),
    h('dl', {class: 'gdr-dl'},
      h('div', {}, h('dt', {text: '비중'}), h('dd', {class: 'num', text: wTxt(p.w)})),
      h('div', {}, h('dt', {text: '금액'}), h('dd', {class: 'num gdr-amt', text: won(amt)})),
      h('div', {}, h('dt', {text: '팔 선'}), h('dd', {class: 'num', text: won(p.sell)})),
      h('div', {}, h('dt', {text: '절반 팔 선'}), h('dd', {class: 'num', text: won(p.half)}))),
    h('p', {class: 'gdr-me'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}),
      h('span', {text: `나라면 ${won(money)} 가운데 ${won(amt)}만 담겠어. ${won(p.price)}에서 ${won(p.sell)} 아래로 가면 팔고, ${won(p.half)}에 닿으면 절반은 팔겠어.`})),
    h('p', {class: 'gdr-say'}, h('span', {class: 'gdr-sayk', text: '격언 '}), h('q', {'data-proper': '', text: G.sayings?.[p.saying] ?? ''})));
}

/** 첫 화면 칸 · #/gdr — open = 처음 열어 둘 번호 */
export function gdrSection(G, {page = false, open = null} = {}) {
  const box = h('section', {class: 'gdr' + (page ? ' page' : ''), 'aria-label': josa(NAME, '라면') + ' 이렇게 나눠 담겠어'});
  if (!G || !Array.isArray(G.picks)) { box.append(h('h2', {class: 'gdr-h', text: `${NAME} 칸`}), h('p', {class: 'note', text: `? ${NAME} 칸 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.`})); return box; }
  let money = getMoney(), opened = open;
  const cash = G.counts?.cash ?? 0, wsum = G.picks.reduce((s, p) => s + p.w * 10, 0) / 10;
  const input = h('input', {class: 'gdr-in num', type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': '내 돈(원)', value: money.toLocaleString('ko-KR')});
  const cells = h('div', {class: 'gdr-cells', role: 'list'}), slot = h('div', {class: 'gdr-slot', 'aria-live': 'polite'}), sumP = h('p', {class: 'gdr-sum'});
  const draw = () => {
    cells.replaceChildren(...G.picks.map(p => {
      const b = h('button', {class: 'gdr-cell' + (opened === p.no ? ' on' : ''), type: 'button', role: 'listitem', 'aria-expanded': String(opened === p.no), 'aria-controls': 'gdr-' + p.no},
        h('span', {class: 'gdr-no num', text: p.no + '번'}), h('span', {class: 'gdr-cn', 'data-proper': '', text: p.name}), h('span', {class: 'gdr-cw num', text: wTxt(p.w)}));
      b.addEventListener('click', () => { opened = opened === p.no ? null : p.no; draw(); });
      return b;
    }), h('div', {class: 'gdr-cell cash', role: 'listitem'}, h('span', {class: 'gdr-no', text: '쉬는 돈'}), h('span', {class: 'gdr-cw num', text: wTxt(cash)})));
    const P = G.picks.find(p => p.no === opened);
    slot.replaceChildren(...(P ? [card(G, P, money)] : []));
    const amts = G.picks.reduce((s, p) => s + Math.floor(money * p.w / 100), 0);
    sumP.replaceChildren(h('span', {text: '비중 합 '}), h('b', {class: 'num', text: wTxt(Math.round((wsum + cash) * 10) / 10)}), h('span', {text: ` · 담는 돈 ${won(amts)} · 쉬는 돈 ${won(money - amts)}`}));
  };
  input.addEventListener('input', () => {
    const v = +String(input.value).replace(/[^0-9]/g, '');
    money = v >= 10000 ? v : BASE; setMoney(money); draw();
  });
  input.addEventListener('blur', () => { input.value = money.toLocaleString('ko-KR'); });
  box.append(
    h('div', {class: 'gdr-head'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40}),
      h('div', {}, h('h2', {class: 'gdr-h', text: '나라면 이렇게 나눠 담겠어'}), h('p', {class: 'gdr-sub', text: `${md(G.asOf)} 종가 · 다섯 문을 다 지난 ${G.picks.length}곳`}))),
    h('label', {class: 'gdr-money'}, h('span', {text: '내 돈'}), input, h('span', {text: '원'})),
    cells, slot, sumP,
    h('p', {class: 'gdr-note', text: `${NAME} 생각일 뿐이에요. 지난 기록으로 나눠 본 거고, 정하는 건 친구야.`}),
    ...(NX.D?.mkt?.asOf && G.asOf < NX.D.mkt.asOf ? [h('p', {class: 'gdr-stale'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: `고른 날은 ${md(G.asOf)} 종가예요. 사이트 자료는 ${md(NX.D.mkt.asOf)}까지라 지금 값과 다를 수 있어요.`}))] : []), // 거래량이 있는 모음 날로 고름 — 사이트 자료가 더 새면 밝힘
    ...(G.counts?.managed == null ? [h('p', {class: 'gdr-q'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '관리 종목 · 투자 경고는 아직 못 걸렀어요. 사기 전에 꼭 확인해.'}))] : []),
    ...(G.picks.length < 36 ? [h('p', {class: 'gdr-note', text: `다섯 문을 다 지난 곳이 ${G.picks.length}곳뿐이라 모자란 대로 담았어요. 남는 몫은 쉬는 돈이에요.`})] : []),
    ...(page ? [] : [h('a', {class: 'more', href: '#/gdr', text: '어떻게 골랐나 보기 ›'})]));
  draw();
  return box;
}

/** 어떻게 골랐나 — 상장 종목부터 고른 곳까지 수(gdr.json counts) · 기준 숫자는 쉬운 말로 */
function funnel(G) {
  const c = G.counts ?? {}, R = G.rules ?? {}, n = x => (x == null ? '?' : Number(x).toLocaleString('ko-KR'));
  const li = (a, b) => h('li', {}, h('span', {text: a}), h('b', {class: 'num', text: b}));
  return h('section', {class: 'gdr-fun', 'aria-label': '어떻게 골랐나'},
    h('h2', {class: 'sec', text: '어떻게 골랐나'}),
    h('ol', {class: 'gdr-ol'},
      li('상장된 모든 종목', n(c.listed) + '개'),
      li('그 가운데 회사 주식', n(c.companies) + '곳'),
      li('거래가 너무 적어 뺀 곳', n(c.outThin) + '곳'),
      li('거래가 멈춰 뺀 곳', n(c.outHalt) + '곳'),
      li('관리 종목으로 뺀 곳', c.managed == null ? '? 아직 못 거름' : n(c.managed) + '곳'),
      li('남은 곳', n(c.afterOut) + '곳'),
      li('이익 늘었나', n(c.g1) + '곳'),
      li('아직 조용한가', n(c.g2) + '곳'),
      li('석 달 천천히 올랐나', n(c.g3) + '곳'),
      li('두 배 넘게 안 올랐나', n(c.g4) + '곳'),
      li('돈 들어오는 업종인가', n(c.g5) + '곳'),
      li('다섯 문을 다 지난 곳', n(c.passAll) + '곳'),
      li('고른 곳', n(c.picked) + '곳'),
      li('쉬는 돈', wTxt(c.cash ?? 0))),
    h('h2', {class: 'sec', text: '기준 숫자'}),
    h('ul', {class: 'gdr-ul'},
      h('li', {text: `거래가 너무 적음: 최근 20거래일 하루 평균 거래대금이 ${n((R.thin ?? 0) / 1e8)}억 원보다 적은 곳`}),
      h('li', {text: '거래 멈춤: 최근 5거래일 가운데 거래가 없던 날이 있는 곳'}),
      h('li', {text: '이익 늘었나: 마지막 해 영업이익이 0보다 크고 그 앞 해보다 많은 곳'}),
      h('li', {text: `아직 조용한가: 최근 20거래일 거래대금이 그 앞 120거래일 평균의 ${R.quietX ?? '?'}배 안이고, 5일 오름이 ${R.hot5 ?? '?'}% 아래인 곳`}),
      h('li', {text: `석 달 천천히 올랐나: 60거래일 동안 ${R.r60?.[0] ?? '?'} ~ ${R.r60?.[1] ?? '?'}% 오르고, 하루에 ${R.jump ?? '?'}% 넘게 뛴 날이 없고, 그 사이 가장 높은 값의 ${Math.round((R.keep ?? 0) * 100)}% 위에 있는 곳`}),
      h('li', {text: `두 배 넘게 안 올랐나: 지난 250거래일 가장 낮은 값의 ${R.low2x ?? '?'}배 아래인 곳`}),
      h('li', {text: `돈 들어오는 업종인가: 업종 거래대금이 앞 60거래일보다 ${R.indX ?? '?'}배 넘게 늘고, 업종 회사들이 20거래일 동안 가운데 값으로 오른 곳`}),
      h('li', {text: '고르기: 영업이익이 많이 는 차례로 한 업종 세 곳까지, 서른여섯 곳까지'}),
      h('li', {text: '비중: 1 ~ 12번 3% · 13 ~ 24번 2.5% · 25 ~ 36번 2% · 남는 몫은 쉬는 돈'}),
      h('li', {text: `팔 선: 지금 값에서 ${Math.round((1 - (R.sell ?? 0.9)) * 100)}% 내린 값 · 절반 팔 선: 지금 값에서 ${Math.round(((R.half ?? 1.2) - 1) * 100)}% 오른 값`})));
}

export async function render(arg) {
  const [G] = await Promise.all([NX.gdr ? NX.gdr() : null, NX.need ? NX.need('mkt') : null]), no = /^\d+$/.test(String(arg ?? '')) ? +arg : null; // mkt = 사이트 자료 날짜(고른 날과 견줌)
  const nodes = [gdrSection(G, {page: true, open: no})];
  if (G) nodes.push(funnel(G));
  nodes.push(h('p', {class: 'safe', text: `${josa(NAME, '는')} 지난 기록만 보여 줘요. 나눠 담는 칸도 ${NAME} 생각이에요.`}));
  if (no) requestAnimationFrame(() => document.getElementById('gdr-' + no)?.scrollIntoView({block: 'center'}));
  return {title: josa(NAME, '라면') + ' 이렇게', nodes};
}
