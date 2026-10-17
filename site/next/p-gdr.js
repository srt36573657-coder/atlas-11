/* 고도리 칸 — 다섯 문으로 거른 곳과 나눠 담는 비중(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 9 ~ 12 · 14)
   자료 = /next/data/gdr.json(gdr-v1 · scripts/atlas11/next/gdr/pick.mjs · 결정표 docs/design/godori-2026-10-17/brief.md)
   gdrSection(G) = 첫 화면 칸(작은 칸 → 누르면 열림 · 내 돈 넣으면 금액 다시 셈) · render(arg) = #/gdr · #/gdr/<번호>
   말은 「사라」 대신 「나라면 이렇게 하겠어」(명령 14) · 순위 글은 「n번」 · 회사 이름 · 격언은 남의 글(data-proper) · 이름은 brand.js 한 곳(규칙 76)
   2026-10-17 21:10 「하나로 묶은 명령문」 [6] 고도리 칸 안전(일 나누기 brief2.md · 일꾼 D):
   ① 열한 질문을 마친 사람에게만 엶(p-why.js doneOnce — 아니면 짧은 잠금 + #/why · 같은 화면에서 마치면 그 자리에서 엶)
   ② 곳마다 「틀린다면 이유」 한 줄(gdr.json wrong · wrong-v1 — 화면은 그 글 그대로 · 없으면 「?」)
   ③ 성적은 고른 날부터 같은 때 코스피와 견줌(회사 = co/<번호>.json 오늘 값 · 코스피 = home.json idx.KOSPI.rows · 날짜가 안 맞으면 「?」 — 시장이 오르면 아무거나 오름)
   ④ 나빠도 숨기지 않음 — 가장 나쁜 곳 · 값을 못 받은 곳 수 · 날이 적어도 적은 대로 */
import {NAME, josa} from './brand.js';
import * as WHY from './p-why.js'; // 매매일지(일꾼 B)의 doneOnce() — 없거나 못 읽으면 기록을 직접 읽음
const NX = globalThis.NX;
const {h} = NX;
const KEY = 'atlas:godori-money', WHY_KEY = 'atlas:godori-why', BASE = 10000000;
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const md = d => { const p = String(d ?? '').split('-'); return p.length === 3 ? `${+p[1]}월 ${+p[2]}일` : '?'; };
const getMoney = () => { try { const v = +localStorage.getItem(KEY); return Number.isFinite(v) && v >= 10000 ? Math.floor(v) : BASE; } catch { return BASE; } };
const setMoney = v => { try { localStorage.setItem(KEY, String(v)); } catch { /* 기억 못 함 — 이 화면에만 */ } };
const wTxt = w => (Number.isInteger(w) ? String(w) : w.toFixed(1)) + '%';
const pctEl = x => h('b', {class: 'num ' + NX.cls(x), text: NX.pct(x)});
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1);

/** 열한 질문을 한 번이라도 끝냈나([6] 1) — 매매일지 doneOnce() 먼저 · 없으면 기록(답 열한 개)을 직접 봄 */
export function opened() {
  try { if (typeof WHY.doneOnce === 'function') return !!WHY.doneOnce(); } catch { return false; }
  try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); return Array.isArray(x) && x.some(r => Array.isArray(r?.answers) && r.answers.length === 11 && r.answers.every(k => k === 0 || k === 1 || k === 2)); } catch { return false; }
}

/** 잠금 — 짧게 · 열한 질문으로 보냄 · 같은 화면에서 질문을 마치면 1.5초 안에 그 자리에서 엶(화면을 떠나면 멈춤) */
function lockBox(G, opt) {
  const box = h('section', {class: 'gdr lock' + (opt.page ? ' page' : ''), 'aria-label': `${NAME} 칸`},
    h('div', {class: 'gdr-head'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40}),
      h('div', {}, h('h2', {class: 'gdr-h', text: `${NAME} 칸은 잠겨 있어`}), h('p', {class: 'gdr-sub', text: '「왜 사?」 열한 질문을 한 번 끝내면 열려요.'}))),
    h('p', {class: 'gdr-note', text: '남이 고른 곳을 보기 전에 내 이유부터 확인하자.'}),
    h('a', {class: 'gdr-go', href: '#/why', text: '열한 질문 하러 가기 ›'}));
  let seen = false; const t0 = Date.now();
  const t = setInterval(() => {
    if (box.isConnected) seen = true; else { if (seen || Date.now() - t0 > 60000) clearInterval(t); return; }
    if (opened()) { clearInterval(t); box.replaceWith(gdrSection(G, opt)); }
  }, 1500);
  return box;
}

/* 고른 날 뒤 성적 — 회사마다 오늘 값(co/<번호>.json c.price · c.priceDate) ÷ 고른 날 값 · 같은 때 코스피(home.json idx.KOSPI.rows 의 두 날 값) */
async function perfOf(G) {
  const [H, cos] = await Promise.all([NX.need ? NX.need('home').catch(() => null) : null, Promise.all(G.picks.map(p => NX.getJson('co/' + p.code + '.json').catch(() => null)))]);
  const rows = Array.isArray(H?.idx?.KOSPI?.rows) ? H.idx.KOSPI.rows.filter(r => Array.isArray(r) && typeof r[0] === 'string' && r[1] > 0) : [];
  const K = new Map(rows.map(r => [r[0].slice(0, 10), r[1]])), at = G.asOf, per = new Map();
  G.picks.forEach((p, i) => {
    const c = cos[i]?.c, now = c?.price > 0 ? c.price : null, d = typeof c?.priceDate === 'string' ? c.priceDate.slice(0, 10) : null;
    if (!now || !d || !(p.price > 0) || d < at) { per.set(p.code, {miss: true}); return; }
    const k0 = K.get(at), k1 = K.get(d), kOk = !!(k0 && k1);
    per.set(p.code, {r: (now / p.price - 1) * 100, kr: kOk ? (k1 / k0 - 1) * 100 : null, d, n: kOk ? rows.filter(x => x[0] > at && x[0] <= d).length : null, zero: d === at});
  });
  return per;
}
/** 묶음 — 비중대로 · 같은 날 값끼리만(날이 다르면 「?」) · 가장 나쁜 곳 · 가장 좋은 곳 · 못 받은 곳 수 */
function perfSum(G, per) {
  const ok = G.picks.filter(p => per.get(p.code) && !per.get(p.code).miss), miss = G.picks.length - ok.length;
  if (!ok.length) return {none: true, miss};
  const days = [...new Set(ok.map(p => per.get(p.code).d))];
  if (days.length > 1) return {mixed: true, miss};
  const d = days[0], f = per.get(ok[0].code);
  if (d === G.asOf) return {zero: true, miss};
  const ws = ok.reduce((s, p) => s + p.w, 0), r = ok.reduce((s, p) => s + p.w * per.get(p.code).r, 0) / ws;
  const worst = ok.reduce((a, p) => (per.get(p.code).r < per.get(a.code).r ? p : a)), best = ok.reduce((a, p) => (per.get(p.code).r > per.get(a.code).r ? p : a)); // 같으면 번호 작은 곳(picks 는 번호 차례)
  return {r, kr: f.kr, n: f.n, d, miss, k: ok.length, worst, best};
}
/** 카드 한 줄 — 이 회사 · 같은 때 코스피 */
function perfLine(el, G, x) {
  if (!x) el.replaceChildren(h('span', {text: '고른 날 뒤 성적을 셈하는 중…'}));
  else if (x.miss) el.replaceChildren(h('span', {text: '? 고른 날 뒤 값을 못 받았어요.'}));
  else if (x.zero) el.replaceChildren(h('span', {text: `고른 날(${md(G.asOf)}) 뒤로 아직 잴 날이 없어요.`}));
  else el.replaceChildren(h('span', {text: `고른 날(${md(G.asOf)}) 뒤 이 회사 `}), pctEl(x.r), h('span', {text: ' · 같은 때 코스피 '}), x.kr == null ? h('b', {class: 'num q', text: '?'}) : pctEl(x.kr));
}
/** 성적 칸 — 나빠도 숨기지 않음([6] 4) */
function perfBox(el, G, per) {
  const head = h('h3', {class: 'gdr-ph', text: '고른 날 뒤 성적'});
  if (!per) { el.replaceChildren(head, h('p', {class: 'gdr-pl', text: '셈하는 중…'})); return; }
  const S = perfSum(G, per), kids = [head];
  if (S.none) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '고른 곳의 지금 값을 하나도 못 받았어요.'})));
  else if (S.mixed) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '회사마다 마지막 값 날짜가 달라 묶음은 못 셌어요. 카드마다 봐 주세요.'})));
  else if (S.zero) kids.push(h('p', {class: 'gdr-pl', text: `고른 날(${md(G.asOf)}) 종가가 마지막 자료라 아직 잴 날이 없어요. 자료가 새로 오면 같은 때 코스피와 함께 보여 줄게요.`}));
  else {
    kids.push(h('p', {class: 'gdr-pl gdr-pd', text: `${md(G.asOf)} → ${md(S.d)} · ${S.n == null ? '?' : S.n}거래일`}),
      h('p', {class: 'gdr-pr'}, h('span', {text: `고른 ${S.k}곳 묶음(비중대로) `}), pctEl(S.r)),
      h('p', {class: 'gdr-pr'}, h('span', {text: '같은 때 코스피 '}), S.kr == null ? h('b', {class: 'num q', text: '?'}) : pctEl(S.kr)));
    if (S.kr == null) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '같은 날 코스피 값이 자료에 없어 견주지 못했어요.'})));
    else { const df = S.r - S.kr, z = one(df) === '0.0'; kids.push(h('p', {class: 'gdr-pl', text: z ? '코스피와 거의 같아요.' : `코스피보다 ${one(df)}%p ${df > 0 ? '높아요' : '낮아요'}.`})); }
    if (S.k >= 2) for (const [lab, p] of [['가장 나쁜 곳 ', S.worst], ['가장 좋은 곳 ', S.best]])
      kids.push(h('p', {class: 'gdr-pl'}, h('span', {text: lab + p.no + '번 '}), h('span', {'data-proper': '', text: p.name}), h('span', {text: ' '}), pctEl(per.get(p.code).r)));
    kids.push(h('p', {class: 'gdr-pl gdr-pn', text: '시장이 오르면 아무 회사나 올라요. 그래서 같은 때 코스피와 같이 봐요. 날이 적을수록 우연이 커요.'}));
  }
  if (S.miss) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: `${S.miss}곳은 지금 값을 못 받아 묶음에서 뺐어요.`})));
  el.replaceChildren(...kids);
}

/** 카드 하나 — 번호 · 업종 · 이유 한 줄 · 틀린다면 이유 · 고른 날 뒤 성적 · 비중 · 금액 · 팔 선 · 절반 팔 선 · 「나라면」 · 격언 */
function card(G, p, money, per) {
  const amt = Math.floor(money * p.w / 100), pl = h('p', {class: 'gdr-perf', 'data-code': p.code});
  perfLine(pl, G, per ? per.get(p.code) : null);
  return h('div', {class: 'gdr-card', id: 'gdr-' + p.no},
    h('p', {class: 'gdr-ch'}, h('b', {class: 'num', text: p.no + '번 '}), h('a', {class: 'gdr-name', href: '#/w/' + NX.enc(p.code), 'data-proper': '', text: p.name}), h('span', {class: 'gdr-ind', text: ' · ' + p.ind})),
    h('p', {class: 'gdr-why', text: p.reason}),
    h('p', {class: 'gdr-wrong'}, h('span', {class: 'gdr-wk', text: '틀린다면 이유 '}), typeof p.wrong === 'string' && p.wrong.trim() ? h('span', {text: p.wrong}) : h('span', {}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '아직 못 셌어요.'}))),
    pl,
    h('dl', {class: 'gdr-dl'},
      h('div', {}, h('dt', {text: '비중'}), h('dd', {class: 'num', text: wTxt(p.w)})),
      h('div', {}, h('dt', {text: '금액'}), h('dd', {class: 'num gdr-amt', text: won(amt)})),
      h('div', {}, h('dt', {text: '팔 선'}), h('dd', {class: 'num', text: won(p.sell)})),
      h('div', {}, h('dt', {text: '절반 팔 선'}), h('dd', {class: 'num', text: won(p.half)}))),
    h('p', {class: 'gdr-me'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}),
      h('span', {text: `나라면 ${won(money)} 가운데 ${won(amt)}만 담겠어. ${won(p.price)}에서 ${won(p.sell)} 아래로 가면 팔고, ${won(p.half)}에 닿으면 절반은 팔겠어.`})),
    h('p', {class: 'gdr-say'}, h('span', {class: 'gdr-sayk', text: '격언 '}), h('q', {'data-proper': '', text: G.sayings?.[p.saying] ?? ''})));
}

/** 첫 화면 칸 · #/gdr — open = 처음 열어 둘 번호 · 열한 질문을 마치기 전에는 잠금([6] 1) */
export function gdrSection(G, opt = {}) {
  const {page = false, open = null} = opt;
  if (!opened()) return lockBox(G, opt);
  const box = h('section', {class: 'gdr' + (page ? ' page' : ''), 'aria-label': josa(NAME, '라면') + ' 이렇게 나눠 담겠어'});
  if (!G || !Array.isArray(G.picks)) { box.append(h('h2', {class: 'gdr-h', text: `${NAME} 칸`}), h('p', {class: 'note', text: `? ${NAME} 칸 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.`})); return box; }
  let money = getMoney(), opened1 = open, per = null;
  const cash = G.counts?.cash ?? 0, wsum = G.picks.reduce((s, p) => s + p.w * 10, 0) / 10;
  const input = h('input', {class: 'gdr-in num', type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': '내 돈(원)', value: money.toLocaleString('ko-KR')});
  const cells = h('div', {class: 'gdr-cells', role: 'list'}), slot = h('div', {class: 'gdr-slot', 'aria-live': 'polite'}), sumP = h('p', {class: 'gdr-sum'}), pbox = h('div', {class: 'gdr-pf', 'aria-live': 'polite'});
  const draw = () => {
    cells.replaceChildren(...G.picks.map(p => {
      const b = h('button', {class: 'gdr-cell' + (opened1 === p.no ? ' on' : ''), type: 'button', role: 'listitem', 'aria-expanded': String(opened1 === p.no), 'aria-controls': 'gdr-' + p.no},
        h('span', {class: 'gdr-no num', text: p.no + '번'}), h('span', {class: 'gdr-cn', 'data-proper': '', text: p.name}), h('span', {class: 'gdr-cw num', text: wTxt(p.w)}));
      b.addEventListener('click', () => { opened1 = opened1 === p.no ? null : p.no; draw(); });
      return b;
    }), h('div', {class: 'gdr-cell cash', role: 'listitem'}, h('span', {class: 'gdr-no', text: '쉬는 돈'}), h('span', {class: 'gdr-cw num', text: wTxt(cash)})));
    const P = G.picks.find(p => p.no === opened1);
    slot.replaceChildren(...(P ? [card(G, P, money, per)] : []));
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
    cells, slot, sumP, pbox,
    h('p', {class: 'gdr-note', text: `${NAME} 생각일 뿐이에요. 지난 기록으로 나눠 본 거고, 정하는 건 친구야.`}),
    ...(NX.D?.mkt?.asOf && G.asOf < NX.D.mkt.asOf ? [h('p', {class: 'gdr-stale'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: `고른 날은 ${md(G.asOf)} 종가예요. 사이트 자료는 ${md(NX.D.mkt.asOf)}까지라 지금 값과 다를 수 있어요.`}))] : []), // 거래량이 있는 모음 날로 고름 — 사이트 자료가 더 새면 밝힘
    ...(G.counts?.managed == null ? [h('p', {class: 'gdr-q'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '관리 종목 · 투자 경고는 아직 못 걸렀어요. 사기 전에 꼭 확인해.'}))] : []),
    ...(G.picks.length < 36 ? [h('p', {class: 'gdr-note', text: `다섯 문을 다 지난 곳이 ${G.picks.length}곳뿐이라 모자란 대로 담았어요. 남는 몫은 쉬는 돈이에요.`})] : []),
    ...(page ? [] : [h('a', {class: 'more', href: '#/gdr', text: '어떻게 골랐나 보기 ›'})]));
  draw();
  perfBox(pbox, G, null);
  perfOf(G).then(x => { per = x; perfBox(pbox, G, per); for (const el of box.querySelectorAll('.gdr-perf[data-code]')) perfLine(el, G, per.get(el.getAttribute('data-code'))); })
    .catch(() => { per = new Map(G.picks.map(p => [p.code, {miss: true}])); perfBox(pbox, G, per); for (const el of box.querySelectorAll('.gdr-perf[data-code]')) perfLine(el, G, {miss: true}); });
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
  if (G && opened()) nodes.push(funnel(G)); // 잠겨 있으면 짧게(잠금 칸만)
  nodes.push(h('p', {class: 'safe', text: `${josa(NAME, '는')} 지난 기록만 보여 줘요. 나눠 담는 칸도 ${NAME} 생각이에요.`}));
  if (no && opened()) requestAnimationFrame(() => document.getElementById('gdr-' + no)?.scrollIntoView({block: 'center'}));
  return {title: josa(NAME, '라면') + ' 이렇게', nodes};
}
