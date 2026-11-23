/* 손자병법 미국판 — 한국판과 같은 서른여섯 꾀 셈으로 미국 365곳을 골라 보임(자료: /su/data/us/su-us.json · 만드는 곳 scripts/atlas11/us/su_us.py)
   모두 한글 · 값은 달러 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · innerHTML 없음 · 글 속 style 없음 */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) { if (k === 'text') e.textContent = v; else e.setAttribute(k, v); }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
};
const fin = v => typeof v === 'number' && Number.isFinite(v);
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const dateKo = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d ?? ''); if (!m) return '?'; const w = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay(); return `${+m[2]}월 ${+m[3]}일(${WD[w]})`; };
/** 「100달러가 131.9달러」 — % 대신(한국판 「100원이 ○원」과 같은 말) */
const usd100 = v => !fin(v) ? '?' : '100달러가 ' + (Math.round((1 + v) * 1000) / 10).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '달러';
const price = v => !fin(v) ? '?' : v.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '달러';
const cls = v => (fin(v) && v < 0 ? 'us-dn' : 'us-upc');
const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';

function spark(line) {
  const v = (line ?? []).filter(fin); if (v.length < 3) return null;
  const lo = Math.min(...v), hi = Math.max(...v), W = 300, H = 56, r = hi - lo || 1;
  const pts = v.map((x, i) => (i / (v.length - 1) * W).toFixed(1) + ',' + (H - 4 - (x - lo) / r * (H - 8)).toFixed(1)).join(' ');
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.setAttribute('class', 'us-spark'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', '한 달 종가 꺾은선');
  const p = document.createElementNS(NS, 'polyline'); p.setAttribute('points', pts); s.append(p); return s;
}
const dayWord = v => !fin(v) ? '값 없음' : v === 0 ? '그대로' : (v > 0 ? '하루 만에 ' : '하루 만에 ') + usd100(v);
function coRow(D, c) {
  const x = D.co[c]; if (!x) return null;
  return el('li', {}, el('div', {class: 'us-co'},
    el('span', {class: 'us-co-n', text: x.name}), el('span', {class: 'us-co-p', text: price(x.close)}),
    el('span', {class: 'us-co-i', text: x.ind}), el('span', {class: 'us-co-d ' + cls(x.d20), text: '한 달 ' + usd100(x.d20)})));
}
function kkoe(D, k) {
  const L = D.lists[k] ?? [], vol = L.length === 0 && ['g08', 'g13', 'g19', 'g29', 'g32'].includes(k);
  const n = Number(k.slice(1));
  const d = el('details', {class: 'us-kk', id: 'kk-' + k},
    el('summary', {}, el('span', {class: 'us-kk-n', text: `${n}. ${D.name[k]} (${D.han[k]})`}), el('span', {class: 'us-kk-m', text: L.length ? `이번 판에서 고른 회사 ${L.length}곳` : (vol ? '사고판 양 자료가 없어 쉬어요' : '이번 판에는 맞는 회사가 없어요')})),
    el('div', {class: 'us-kk-body'},
      el('p', {class: 'us-rule', text: '뜻: ' + D.mean[k]}),
      el('p', {class: 'us-rule', text: '고르는 법: ' + D.say[k]}),
      L.length ? el('ul', {class: 'us-li'}, L.map(c => coRow(D, c))) : el('p', {class: 'us-empty', text: vol ? D.volNote : (D.why[k] || '꾀 뜻에 맞는 곳이 없어 고르지 않았어요.')})));
  return d;
}
function sunCard(D) {
  const S = D.sun, i = S.ix;
  const land = i.d20 >= 0.03 && i.fromHigh > -0.02 ? '넓은 들판 — 지난 한 달 오름이 이어진 땅'
    : i.fromHigh <= -0.1 ? '비탈길 — 높은 값에서 많이 내려온 땅'
    : i.d20 <= -0.03 ? '내리막 — 지난 한 달 내림이 이어진 땅'
    : '고갯길 — 크게 오르내리지 않고 숨을 고르는 땅';
  return el('section', {class: 'us-card', 'aria-label': '요즘 미국 시장 형세'},
    el('h2', {text: '요즘 미국 장은 이런 땅이에요'}),
    el('p', {class: 'us-big', text: land}),
    el('p', {class: 'us-note', text: `미국 대표 500곳 지수(S&P 500)는 지난 한 달에 ${usd100(i.d20)}가 됐어요. 하루 만에는 ${usd100(i.d1)}예요.`}),
    el('p', {class: 'us-note', text: `1년 가운데 가장 높았던 값보다 ${i.fromHigh >= 0 ? '위' : '아래'}에 있어요(그 값을 100으로 보면 ${(Math.round((1 + i.fromHigh) * 1000) / 10).toLocaleString('ko-KR')}).`}),
    el('p', {class: 'us-note', text: `우량주 ${S.n1}곳 가운데 하루 만에 오른 곳 ${S.up1}곳, 내린 곳 ${S.down1}곳이에요. 한 달로 보면 ${S.n20}곳 가운데 ${S.up20}곳이 올랐어요.`}),
    spark(i.line));
}
function allList(D) {
  const wrap = el('section', {class: 'us-card', 'aria-label': '미국 우량주 365곳'});
  const inp = el('input', {class: 'us-find', type: 'search', placeholder: '회사 이름 · 업종으로 찾기', 'aria-label': '회사 찾기', autocomplete: 'off'});
  const box = el('div', {});
  const inK = {}; for (const k of D.kinds) for (const c of D.lists[k] ?? []) (inK[c] ??= []).push(k);
  const codes = Object.keys(D.co);
  const by = {}; for (const c of codes) (by[D.co[c].ind] ??= []).push(c);
  const inds = Object.keys(by).sort((a, b) => a.localeCompare(b, 'ko'));
  const draw = q => {
    box.replaceChildren(); const t = q.trim(); let n = 0;
    for (const ind of inds) {
      const cs = by[ind].filter(c => !t || D.co[c].name.includes(t) || ind.includes(t)); if (!cs.length) continue;
      n += cs.length;
      box.append(el('h3', {class: 'us-grp', text: `${ind} (${cs.length}곳)`}), el('ul', {class: 'us-li'}, cs.map(c => {
        const x = D.co[c], ks = inK[c] ?? [];
        return el('li', {}, el('details', {class: 'us-det'},
          el('summary', {}, el('span', {class: 'us-co-n', text: x.name}), el('span', {class: 'us-co-p', text: price(x.close)}), el('span', {class: 'us-co-i', text: ks.length ? `이번 판 꾀 ${ks.length}곳에 들었어요` : '이번 판 꾀에는 없어요'}), el('span', {class: 'us-co-d ' + cls(x.d20), text: '한 달 ' + usd100(x.d20)})),
          el('div', {class: 'us-more'},
            el('p', {text: `하루 만에 ${usd100(x.d1)} · 한 해 가장 높은 값 ${price(x.hi52)} · 가장 낮은 값 ${price(x.lo52)}`}),
            spark(x.line),
            ks.length ? el('p', {text: '든 꾀: ' + ks.map(k => D.name[k]).join(' · ')}) : null,
            x.late ? el('p', {text: '이 회사 값은 다른 회사보다 늦게 들어왔어요(' + dateKo(x.date) + ').'}) : null)));
      })));
    }
    if (!n) box.append(el('p', {class: 'us-empty', text: '찾는 회사가 없어요.'}));
  };
  inp.addEventListener('input', () => draw(inp.value)); draw('');
  wrap.append(el('h2', {text: `미국 우량주 ${D.n}곳 모두`}), el('p', {class: 'us-note', text: '업종마다 묶어 이름 차례로 놓았어요. 누르면 지난 기록이 펼쳐져요.'}), inp, box);
  return wrap;
}
async function main() {
  const root = document.getElementById('us');
  let D = null;
  try { D = await (await fetch('/su/data/us/su-us.json')).json(); } catch { D = null; }
  if (!D || !D.co) { root.replaceChildren(el('p', {class: 'us-wait', text: '미국 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); root.removeAttribute('aria-busy'); return; }
  const sets = [...new Set(D.kinds.map(k => D.set[k]))];
  const kk = el('section', {'aria-label': '서른여섯 꾀'}, el('h2', {class: 'us-h1', text: '서른여섯 꾀로 본 미국 회사'}),
    el('p', {class: 'us-sub', text: '한국판과 같은 셈이에요. 꾀마다 그 꾀 모습을 가장 닮은 회사를 일곱 곳까지 골랐어요. 맞는 곳이 모자라면 채우지 않아요.'}),
    sets.map(s => [el('h3', {class: 'us-grp', text: s}), D.kinds.filter(k => D.set[k] === s).map(k => kkoe(D, k))]));
  root.replaceChildren(
    el('h1', {class: 'us-h1', text: '손자병법 · 미국판'}),
    el('p', {class: 'us-sub', text: `${dateKo(D.asOf)} 뉴욕 장이 끝난 값 · 미국 우량주 ${D.n}곳 · 값은 달러(미국 돈)예요.`}),
    sunCard(D), kk, allList(D),
    el('p', {class: 'us-safe', text: SAFE}),
    el('p', {class: 'us-note', text: '숫자는 네이버 증권 해외주식에서 받았어요. 회사 이름은 한글로 적었어요.'}));
  root.removeAttribute('aria-busy');
  document.title = '손자병법 · 미국판';
}
main();
