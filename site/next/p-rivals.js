/* 5단 누구와 다투나 — 지금 아틀란스(site/atlas/atlas.js viewRivals · peerBars · viewMissing)를 새 화면으로 옮김
   (사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」)
   셈 · 뜻 있는 글은 옛 쪽 그대로: 같은 업종 안 매출 막대(위 다섯 곳 + 이 회사) · 판의 모양 · 경쟁 회사(기사 · 따로 확인한 글) · 무엇을 팔고 누가 사나(접음) · 자료 줄
   새 화면 말투: 큰 제목 → 챕터 일곱 → 그림(막대) → 숫자 · 설명 → 판의 모양 그림 → 경쟁 회사 카드 → 접은 칸 → 다음 챕터
   주가는 보지 않음(빨강 · 파랑 없음) · 막대 줄을 누르면 그 회사의 5단(#/w/<번호>/rivals)
   남의 글(세 팀 이야기 · 회사 이름)은 data-proper — 지금 아틀란스 site_check 와 같은 뜻(금지 말 셈 밖 · 남이 쓴 사실 「국내 1위」 같은 것)
   보안 규칙: 글은 textContent 로만 · 꾸밈은 p-rivals.css 와 CSSOM(style.setProperty) 으로만 */
const NX = globalThis.NX;
const {h, sv} = NX;
const NB = '\u00a0'; // 붙임 띄어쓰기 — 「10월 / 13일」로 갈라지지 않게(지금 아틀란스 md 와 같음)
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; // 반올림은 크기로(지금 아틀란스와 같음)
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월' + NB + (+p[2]) + '일'; };
/** 억 원 · 조 원(지금 아틀란스 eok 그대로) */
function eok(v) { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + r1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; }
/** 조사 — 받침 있으면 앞말 · 없으면 뒷말 · 한글이 아니면 둘 다(지금 아틀란스 josa 그대로) */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
const SHAPES = ['혼자 앞섬', '몇 곳이 나눔', '다투는 곳이 많음', '새로 생기는 판'];
const SHAPE_SAY = {'혼자 앞섬': '사실상 혼자 앞서 있습니다. 이런 회사는 남보다 높은 이익이 천천히 줄어듭니다.', '몇 곳이 나눔': '큰 회사 몇 곳이 나눠 가진 판입니다.', '다투는 곳이 많음': '비슷한 회사가 많아 값 싸움이 흔한 판입니다. 남보다 높은 이익은 빨리 줄어듭니다.', '새로 생기는 판': '시장이 막 생겨 순서가 아직 정해지지 않았습니다.'};
/** 세 팀 이야기가 없을 때 — 고른 곳은 「아직 없음」 · 고른 곳 밖은 「조사 전」(지금 아틀란스 storyNone 그대로) */
const storyNone = (pk, C) => (pk ? '? 세 팀 이야기는 아직 없습니다 — 멍거 · 린치 조건에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'
  : `? 세 팀 이야기는 조사 전입니다 — 이야기는 ${pickName(C)}만 사람이 조사해 씁니다. 이 회사는 숫자만 보입니다.`);
// 안전 문장 — 옛 맨 아래 「저는 투자 상담사가 아닙니다 · … 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다」와 같은 뜻을 새 화면 말로(쓰지 않을 말 「매수 · 매도」 없이 · 3단 회사 쪽 p-co 와 같은 글)
const SAFE = '저는 투자 상담사가 아니에요. 보드리는 지난 기록만 보여 줘요. 사고팔기나 들고 있기를 권하지 않고, 시장 앞날도 말하지 않아요.';

/** 맨 아래 — 자료 줄(지금 아틀란스 foot 의 출처 · 기준일 · 바탕 회사 줄 그대로) · 아직 바뀔 수 있는 값 「?」 · 안전 문장 */
function foot(C) {
  return [h('p', {class: 'privals-foot', text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'privals-foot privals-qf', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {class: 'safe privals-safe', text: SAFE})].filter(Boolean);
}

/** 그림 한 장 — 우리나라 상장 같은 업종 안 매출 막대(위 다섯 곳 + 이 회사 · 지금 아틀란스 peerBars 셈 그대로) · 다른 회사 줄은 그 회사의 5단으로 */
function peerBars(c, G, code, X, C) {
  const I = G.ind, top = G.top || [], inTop = top.some(t => t[2] === code);
  const rows = top.map(([nm, val, cc]) => [nm, val, cc === code, cc]);
  if (!inTop && I.me != null) rows.push([`${c.name}(${I.rank ?? '?'}번째)`, I.me, true, code]);
  const mx = Math.max(1, ...rows.map(r => r[1] || 0));
  const F = C.funnel || {}, all = F.companies ?? F.universe;
  const box = h('section', {class: 'privals-box', 'aria-label': '같은 업종 안 크기'});
  box.append(h('h2', {class: 'privals-h'}, `우리나라 상장 회사 ${all != null ? all.toLocaleString('ko-KR') : '?'}곳 안 「`, h('span', {class: 'privals-iname', text: I.name}), `」 ${I.n}곳 가운데 매출 `, h('b', {class: 'privals-rank', text: `${I.rank ?? '?'}번째`})));
  const ul = h('ul', {class: 'privals-peers', 'aria-label': `같은 업종 ${I.size === 'net' ? '순이익' : '매출'} 막대 — ` + rows.map(r => `${r[0]} ${eok(r[1])}`).join(', ')});
  let links = 0;
  for (const [nm, val, me, cc] of rows) {
    const bar = h('i', {class: 'privals-pb' + (me ? ' privals-mebar' : '')});
    bar.style.setProperty('width', Math.max(2, (val || 0) / mx * 100) + '%');
    const inner = [h('span', {class: 'privals-pn', 'data-proper': true, text: nm}), h('b', {class: 'privals-pv', text: eok(val)}), h('span', {class: 'privals-pt', 'aria-hidden': 'true'}, bar)];
    const go = !me && cc && X.co[cc];
    if (go) links++;
    ul.append(h('li', {class: me ? 'privals-me' : null}, go
      ? h('a', {class: 'privals-pr', href: '#/w/' + NX.enc(cc) + '/rivals', 'aria-label': `${nm} ${eok(val)} — 그 회사의 5단 누구와 다투나`}, ...inner, h('i', {class: 'privals-chev', 'aria-hidden': 'true', text: '›'}))
      : h('div', {class: 'privals-pr'}, ...inner)));
  }
  box.append(rows.length ? ul : h('p', {class: 'privals-q0', text: '? 막대로 견줄 매출 값이 없습니다'}));
  box.append(h('p', {class: 'privals-note', text: `${I.size === 'net' ? '매출이 없는 업종이라 순이익으로 셉니다 · ' : ''}이 회사 = 이 ${I.n}곳 매출 합의 ${I.share != null ? r1(I.share).toFixed(1) + '%' : '?'}(시장 점유율이 아님) · 매출이 절반 ~ 두 배인 비슷한 크기 ${I.near ?? '?'}곳 · 후보 밖 · 업종이 다르게 묶인 회사 · 나라 밖 경쟁 회사는 이 막대에 없습니다(아래 이름에만).`}));
  box.append(h('p', {class: 'privals-src', text: '네이버 증권 결산 · 10월 10일 모음 · 보드리 업종으로 셈'}));
  if (links) box.append(h('p', {class: 'privals-tap', text: '다른 회사 줄을 누르면 그 회사의 5단이 열려요.'}));
  return box;
}

/** 판의 모양 네 가지 그림 — 이 회사의 판만 진하게(입체 없음 · 동그라미 수와 크기로 판을 보여 줌) */
const SHAPE_DOTS = {
  '혼자 앞섬': [[26, 22, 15], [53, 13, 4], [57, 30, 4]],
  '몇 곳이 나눔': [[15, 22, 10], [37, 22, 9], [58, 22, 8]],
  '다투는 곳이 많음': [[11, 14, 5], [25, 14, 5], [39, 14, 5], [53, 14, 5], [18, 30, 5], [32, 30, 5], [46, 30, 5], [60, 30, 5]],
  '새로 생기는 판': [[22, 22, 12, 1], [48, 16, 6, 1], [54, 32, 5, 1]],
};
function shapePic(shape) {
  const known = SHAPES.includes(shape);
  return h('div', {class: 'privals-shapes', role: 'img', 'aria-label': known ? `판의 모양 네 가지 — 이 회사는 「${shape}」` : '판의 모양 네 가지'},
    ...SHAPES.map(s => {
      const svg = sv('svg', {viewBox: '0 0 72 44', 'aria-hidden': 'true', focusable: 'false'});
      for (const [cx, cy, r, dash] of SHAPE_DOTS[s]) svg.append(sv('circle', {cx, cy, r, 'stroke-dasharray': dash ? '3 3' : null}));
      return h('div', {class: 'privals-shp' + (s === shape ? ' privals-on' : ''), 'aria-hidden': 'true'}, svg, h('span', {text: s}));
    }));
}

/** 경쟁 회사 한 곳 — 이름 · 어디 회사 · 한 줄 · 기사(새 창) 또는 따로 확인한 글 · 확인 못 한 것은 그렇다고(지금 아틀란스 viewRivals 그대로) */
function rivalCard(r) {
  const out = r.url ? h('a', {class: 'privals-go', href: r.url, target: '_blank', rel: 'noopener noreferrer', text: '기사'})
    : r.chk && r.chk.v === '기사로 확인' && r.chk.url ? h('a', {class: 'privals-go', href: r.chk.url, target: '_blank', rel: 'noopener noreferrer', text: '따로 확인한 글'})
      : h('p', {class: 'privals-rw2', text: r.chk ? `(따로 찾아봄 · ${r.chk.v})` : '(기사 확인 안 함 · 널리 알려진 이름)'});
  return h('li', {class: 'privals-rv'},
    h('p', {class: 'privals-rt'}, h('b', {'data-proper': true, text: r.name}), h('span', {class: 'privals-rw', 'data-proper': true, text: r.where || '?'})),
    r.note ? h('p', {class: 'privals-rnote', 'data-proper': true, text: r.note}) : null, out);
}

/** 깔때기 두 갈래(지금 아틀란스 funnel 그대로 — 없는 주소일 때 · 멈춘 자리) */
function funnel(r, C) {
  const F = C.funnel || {}, wrap = h('div', {class: 'privals-funnels'});
  for (const g of F.groups ?? []) {
    const stop = r ? (g.k === 'mg' ? r.sm : r.sl) : null, at = stop ? (g.stop?.[stop] ?? g.steps.length) : g.steps.length;
    const ol = h('ol', {class: 'privals-funnel'});
    g.steps.forEach((s, ix) => {
      const fill = h('i', {class: 'privals-ff', 'aria-hidden': 'true'}); fill.style.setProperty('width', (F.universe ? s.n / F.universe * 100 : 0) + '%');
      ol.append(h('li', {class: stop ? (ix < at ? 'privals-past' : ix === at ? 'privals-stop' : 'privals-no') : null}, fill, h('span', {}, h('b', {text: s.n.toLocaleString('ko-KR') + '곳'}), ' ', h('span', {text: s.t}))));
    });
    wrap.append(h('p', {class: 'privals-fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
const stopSay = (r, C) => (C.funnel?.groups ?? []).map(g => `${g.name}은 「${g.stopName?.[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';

/** 없는 주소 — 바탕 회사에서 빠진 회사(펀드 · 우선주 …)면 이름 · 까닭 · 깔때기(지금 아틀란스 viewMissing 그대로) */
async function missing(code, C) {
  const head = h('h1', {class: 'wt', text: '없는 주소입니다'});
  const say = h('p', {class: 'privals-say', text: code ? `「${code}」는 지금 ${pickName(C)}에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'});
  const more = h('div', {});
  if (code) {
    const N = await NX.getJson('names.json'), r = N?.rows?.find?.(x => x.c === code);
    if (r) { head.textContent = `${r.n} — 지금 ${pickName(C)} 밖`; say.textContent = `${josa(r.n, '은', '는')} ${stopSay(r, C)} — 새 1년 성적표가 나오면 다시 셉니다.`; more.append(h('div', {class: 'privals-why', 'data-proper': true, text: r.w}), funnel(r, C)); }
  }
  return {title: head.textContent, nodes: [head, say, more, h('a', {class: 'more', href: '#/find', text: '회사 찾기 ›'}), h('a', {class: 'more', href: '#/', text: '처음 화면으로'}), ...foot(C)]};
}

export async function render(arg) {
  const code = String(arg ?? '').split('/')[0];
  await Promise.all([NX.need('core'), NX.need('mkt')]);
  const X = NX.ix();
  if (!X) return {title: '누구와 다투나', nodes: NX.noData()};
  const C = X.core;
  // 회사 자료 — 고른 곳 = comp.json · 고른 곳 밖 = co/<번호>.json 의 c · line(지금 아틀란스 coEntry 그대로) · 성장 자료(grow)는 회사마다 co/<번호>.json
  // 회사 파일은 모든 회사(core.co7 · 모음 보통주)에만 있음 — 그 밖 번호(펀드 · 우선주 · 잘못 든 주소)는 받으러 가지 않음(없는 파일 404 를 내지 않게)
  const m = Object.hasOwn(X.co, code) ? X.co[code] : null, coFile = () => NX.getJson('co/' + NX.enc(code) + '.json'), coP = m ? coFile() : null; // 회사 파일 · 고른 곳 자료를 함께 받음
  const comp = await NX.getJson('comp.json'), pkC = comp?.companies && Object.hasOwn(comp.companies, code) ? comp.companies[code] : null;
  const co = await (coP ?? (pkC ? coFile() : null));
  let c = null, pk = false;
  if (pkC) { c = pkC; pk = true; }
  else if (!comp && m?.p) { c = {name: m.n, i: m.i}; pk = true; } // 고른 곳 자료를 못 받음 — 모든 회사 자료의 이름 · 업종으로
  else if (C.co7 && co?.c && co.line) c = co.c;
  if (!c && !(m && !co)) return missing(code, C);
  const tail = () => [h('div', {class: 'privals-next'}, h('p', {class: 'privals-nx'}, h('b', {text: '6단 앞으로 클까?'}), h('span', {text: '1 · 3 · 5 · 10년 뒤 회사 크기(매출) — 주가 아님'})), NX.chapNext(code, '5')), ...foot(C)]; // 다음 단 글(지금 아틀란스 다음 단 단추 글 그대로)
  const name = c?.name ?? m.n, G = co?.grow, S = G?.story;
  const nodes = [
    h('h1', {class: 'wt', text: name + ' — 누구와 다투나?'}),
    h('p', {class: 'ws privals-ws', text: '판의 모양 · 경쟁 회사 · 같은 업종 안 크기 — 주가는 보지 않습니다'}),
    NX.chaps(code, '5'),
    h('p', {class: 'privals-lv'}, h('b', {text: '7단 중 5단'}), ' · 누구와 다투나 ', h('span', {text: '· 조사'})), // 앎의 종류 — 5단은 조사(지금 아틀란스 7단 표시와 같은 글)
  ];
  if (!co) { nodes.push(...NX.noData('회사 자료'), ...tail()); return {title: name + ' · 누구와 다투나', nodes}; } // 회사 파일을 못 받음(망) — 없는 주소가 아님 · 잠시 뒤 다시
  if (!G || !G.ind) { nodes.push(h('p', {class: 'privals-q', text: '? 이 회사의 성장 자료를 못 읽었습니다'}), ...tail()); return {title: name + ' · 누구와 다투나', nodes}; }
  nodes.push(peerBars(c, G, code, X, C));
  nodes.push(h('h2', {class: 'sec', text: '판의 모양 · 경쟁 회사'}));
  if (S) {
    nodes.push(shapePic(S.shape));
    nodes.push(h('p', {class: 'privals-shape'}, h('b', {text: S.shape}), ' — ', SHAPE_SAY[S.shape] || ''));
    if (S.rivals?.length) nodes.push(h('h3', {class: 'privals-h3', text: `경쟁 회사 ${S.rivals.length}곳`}), h('ul', {class: 'privals-rivals'}, ...S.rivals.map(rivalCard)));
    else nodes.push(h('p', {class: 'privals-q', text: '? 이름을 댈 만한 경쟁 회사를 못 찾았습니다'}));
  } else nodes.push(h('p', {class: 'privals-q', text: storyNone(pk, C)}));
  if (S && (S.sells || S.why)) { // 무엇을 팔고 누가 사나 — 긴 글(그 시장 · 최근 큰 일)은 접음(지금 아틀란스 그대로)
    nodes.push(h('details', {class: 'privals-more'}, h('summary', {text: '무엇을 팔고, 누가 사나요? — 눌러서 보기'}), h('div', {class: 'privals-inner'},
      S.sells ? h('p', {'data-proper': true, text: S.sells}) : null,
      S.why ? h('p', {}, h('b', {text: '손님이 고르는 까닭 · 약점: '}), h('span', {'data-proper': true, text: S.why})) : null,
      S.market ? h('p', {}, h('b', {text: '그 시장: '}), h('span', {'data-proper': true, text: S.market})) : null,
      S.events && S.events !== '없음' ? h('p', {}, h('b', {text: '최근 큰 일: '}), h('span', {'data-proper': true, text: S.events})) : null)));
  }
  nodes.push(...tail());
  return {title: name + ' · 누구와 다투나', nodes};
}
