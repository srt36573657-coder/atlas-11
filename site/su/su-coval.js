/* 회사 쪽 값과 실적 · 더 알아보기(주문 1120-1447 · 사장님 2026-11-20(마카오) 14:47 「검색한 기업의 상세 정보를 한눈에 … 연간 수익률 및 기간별 주가 변동률 현재 주가와 과거 주가 흐름 …
   기업의 매출, 영업이익 등 주요 재무지표 … 예전에 있던 회사 7단 분석과 그리고 뉴스 그리고 공시가 있어야 한다 … 머스크라면 … 단순하고 본질 중심 … 간편하게」 · 15:27 「모든 작업을 5시까지 …」)
   자료 = /atlas/data/co/<번호>.json(올리기 작업이 날마다 만듦 · 고치지 않음) — close(장이 열린 날마다 마지막 값 · 맨 끝 = c.price) · fin(확정 결산 세 해 · 억 원 · 예상치 없음) · per · pbr
   본질(docs/손자병법_본질.md) — 손실 먼저(1년 가운데 가장 낮을 때를 맨 앞에) · 「%」 대신 「100원이 ○원」 · 앞날을 맞히지 않음(증권사 앞날 값 · 사고팔기 의견은 화면에 적지 않고 바깥 고리만 — 15:27 보고)
   때 = 장이 열린 날 수(1주 5 · 1달 20 · 3달 60 · 1년 250 — 「한 달은 장이 열린 날 스무 번」과 같은 잣대) */
import {h, s} from '/su/su-fig.js';
import {head, endSeal, mday, w100} from '/su/su-sonja.js';
import {COVAL_RULE, eok, closes, spans, yearOf} from '/su/su-coval-core.js';
const NF = new Intl.NumberFormat('ko-KR');
const ok = v => typeof v === 'number' && Number.isFinite(v);

/** 1년 꺾은선 — 가는 먹선 · 1년 전 값 점선 · 가장 낮을 때 남빛 점 · 끝 점 */
function yearPic(Y) {
  const W = 320, H = 132, P = 10, {y} = Y, hi = Math.max(...y), lo = Math.min(...y), f = v => Math.round(v * 10) / 10;
  const x = i => P + (W - 2 * P) * i / (y.length - 1), yy = v => P + (H - 2 * P) * (hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo));
  const g = s('svg', {class: 'sj-cypic', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none'});
  g.append(s('path', {class: 'sj-cybase', d: `M${P} ${f(yy(Y.base))}H${W - P}`}));
  g.append(s('polyline', {class: 'sj-cyline', points: y.map((v, i) => f(x(i)) + ',' + f(yy(v))).join(' ')}));
  if (Y.dd < 0) { g.append(s('circle', {class: 'sj-cypk', cx: f(x(Y.pkI)), cy: f(yy(y[Y.pkI])), r: 4.5})); g.append(s('circle', {class: 'sj-cylo', cx: f(x(Y.loI)), cy: f(yy(y[Y.loI])), r: 5.5})); }
  g.append(s('circle', {class: 'sj-cyend', cx: f(x(y.length - 1)), cy: f(yy(Y.now)), r: 4.5}));
  return g;
}
/** 값과 실적 칸 — 자료가 없으면 null(억지로 채우지 않음) */
export function coValSec(co) {
  const cl = closes(co), c = co?.c ?? {};
  if (cl.length < 2) return null;
  const Y = yearOf(cl), SP = spans(cl), F = co?.fin, pd = typeof c.priceDate === 'string' ? mday(c.priceDate) : null;
  const yrs = F && Array.isArray(F.years) ? F.years.map((t, i) => ({t: String(t).slice(0, 4), rev: F.rev?.[i], op: F.op?.[i], net: F.net?.[i]})).filter(r => /^\d{4}$/.test(r.t) && (ok(r.rev) || ok(r.op) || ok(r.net))).reverse() : [];
  const money = (k, v, up, dn) => ok(v) ? h('span', {class: 'sj-cfm' + (v < 0 ? ' sj-cfdn' : ''), 'data-k': k}, h('span', {class: 'sj-cfk', text: v < 0 ? dn : up}), h('b', {text: eok(v)})) : null;
  const per = ok(co?.per) && co.per > 0 ? co.per : null, pbr = ok(co?.pbr) && co.pbr > 0 ? co.pbr : null;
  return h('section', {class: 'sj-sec sj-coval', 'aria-label': '값과 실적', 'data-rule': COVAL_RULE, 'data-n': String(cl.length)},
    head('값', '한눈에', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '값과 실적'}))),
    h('p', {class: 'sj-cynow'}, h('span', {text: '지금 값'}), h('b', {text: NF.format(cl[cl.length - 1]) + '원'}), pd ? h('span', {class: 'sj-cyd', text: pd + ' 마지막 값'}) : null),
    Y ? h('p', {class: 'sj-cylow', 'data-say': ''}, h('b', {text: (Y.days >= 250 ? '1년' : '지난 ' + Y.days + '번 장날') + (Y.dd < 0 ? ' 사이 가장 크게 떨어졌을 때, 100원이 ' + w100(Y.dd) + '이 됐어요.' : ' 사이 떨어진 날이 없었어요.')})) : null,
    Y ? h('figure', {class: 'sj-cyfig', 'aria-label': (Y.days >= 250 ? '1년' : '지난 ' + Y.days + '번 장날') + ' 값 꺾은선 · 처음 ' + NF.format(Y.base) + '원 · 가장 크게 떨어진 바닥 ' + NF.format(Y.lo) + '원 · 지금 ' + NF.format(Y.now) + '원'},
      yearPic(Y), h('figcaption', {}, h('span', {text: '점선 = ' + (Y.days >= 250 ? '1년' : Y.days + '번 장날') + ' 전 값'}), Y.dd < 0 ? h('span', {text: '큰 점 = 가장 크게 떨어진 바닥'}) : null)) : null,
    SP.length ? h('ul', {class: 'sj-cysp'}, ...SP.map(([k, r]) => h('li', {'data-span': k}, h('span', {text: k + ' 동안'}), h('b', {text: '100원이 ' + w100(r)})))) : null,
    yrs.length ? h('div', {class: 'sj-cfin'},
      h('h3', {class: 'sj-cfh', text: '한 해 동안 번 돈'}),
      h('ol', {class: 'sj-cfl'}, ...yrs.map(r => h('li', {class: 'sj-cfy', 'data-year': r.t}, h('b', {class: 'sj-cft', text: r.t + '년'}),
        money('rev', r.rev, '판 돈', '판 돈'), money('op', r.op, '장사로 번 돈', '장사로 잃은 돈'), money('net', r.net, '남은 돈', '잃은 돈'))))) : null,
    per || pbr ? h('p', {class: 'sj-cfx'}, per ? h('span', {text: '회사 값은 한 해 남은 돈의 ' + per.toFixed(1).replace(/\.0$/, '') + '배예요.'}) : null, pbr ? h('span', {text: '회사 값은 가진 살림의 ' + pbr.toFixed(1).replace(/\.0$/, '') + '배예요.'}) : null) : null,
    h('p', {class: 'sj-note', text: '출처 네이버 증권 · 값은 장이 열린 날마다 마지막 값 · 번 돈은 확정된 결산만 적었어요(예상 숫자는 쓰지 않아요). 지난 기록이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSeal('값'));
}
/** 더 알아보기 칸 — 옛 7단 분석(이 사이트 안 옛 쪽) · 뉴스와 공시 · 증권사 글(바깥 네이버 증권 · 우리 화면에는 적지 않음) */
export function coLinkSec(code, c) {
  if (!/^[0-9A-Z]{6}$/.test(String(code ?? ''))) return null;
  const nx = p => '/next/?su=back#/' + p, enc = encodeURIComponent, g = typeof c?.g === 'string' && /^[\w-]+$/.test(c.g) ? c.g : null, ind = typeof c?.i === 'string' && c.i ? c.i : null;
  const seven = [g ? ['1', '갈래', nx('ch/g/' + enc(g))] : null, ind ? ['2', '업종', nx('ch/i/' + enc(ind))] : null, ['3', '회사', nx('w/' + code)], ['4', '지나온 길', nx('w/' + code + '/past')],
    ['5', '누구와 다투나', nx('w/' + code + '/rivals')], ['6', '앞으로 클까?', nx('w/' + code + '/grow')], ['7', '범위', nx('w/' + code + '/range')]].filter(Boolean);
  const out = (href, b, sp) => h('a', {class: 'sj-colk sj-colout', href, target: '_blank', rel: 'noopener noreferrer'}, h('b', {text: b}), h('span', {text: sp}), h('i', {'aria-hidden': 'true', text: '↗'}));
  return h('section', {class: 'sj-sec sj-colink', 'aria-label': '더 알아보기'},
    head('길', '한 걸음 더', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '더 알아보기'}))),
    h('h3', {class: 'sj-cfh', text: '옛 7단 분석'}), // 「더 알아보기」+「회사」가 붙어 읽히면 「기회」가 됨 — 낱말 거르기
    h('ol', {class: 'sj-co7'}, ...seven.map(([k, t, href]) => h('li', {'data-step': k}, h('a', {class: 'sj-colk', href}, h('span', {class: 'sj-co7n', 'aria-hidden': 'true', text: k}), h('b', {text: t}), h('i', {'aria-hidden': 'true', text: '›'}))))),
    h('h3', {class: 'sj-cfh', text: '뉴스와 공시'}),
    out('https://finance.naver.com/item/news.naver?code=' + code, '뉴스 · 공시 보기', '네이버 증권 · 바깥 쪽이 열려요'),
    h('h3', {class: 'sj-cfh', text: '증권사 글'}),
    h('p', {class: 'sj-rule', text: '증권사가 내놓은 앞날 값과 사고팔기 의견은 여기에 적지 않아요. 앞날을 맞히는 글이라서예요. 보고 싶으면 바깥 쪽에서 보세요.'}),
    out('https://finance.naver.com/item/coinfo.naver?code=' + code, '증권사 글 보기', '네이버 증권 · 바깥 쪽이 열려요'),
    endSeal('길'));
}
