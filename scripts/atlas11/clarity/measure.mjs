/**
 * 화면 한 장의 「또렷함」 여섯 숫자 — 브라우저 안에서 돈다(page.evaluate 에 그대로 넘긴다 · 바깥 변수를 쓰지 않는다).
 *   1 relDays    「내일·오늘·어제」 수
 *   2 vague      흐릿한 말(최근·곧·지금·다음·많이·조금·대부분·크게)이 든 문장 가운데 숫자·날짜가 없는 문장 수
 *   3 bareNumbers 단위 없는 숫자 수 + 화면에 기준 시각(「9월 30일(수) … 15:30 KST」 또는 「… 종가」)이 없으면 1
 *                (부호는 글만 보고 가려낼 수 없어 숫자 모양 함수가 보장한다 — 한계로 보고한다)
 *   4 graphable  그래프로 바꿀 수 있는데 표·글로 남은 비교 수: 펼쳐진 숫자 표(3행 이상 · 숫자 칸 절반 이상) + 「·」로 이은 숫자 셋 이상의 글줄
 *   5 lowContrast 바탕 대비가 W3C WCAG 2.x AA(보통 글 4.5:1 · 큰 글 3:1) 미만인 글자 요소 수
 *   6 decoColors 뜻 없는 색 가짓수 — OKLCH 채도 0.035 이상인 색 가운데 오름·내림·경고 토큰(--up·--down·--warn 과 옅은 판)이 아닌 것
 * 읽는 범위: #top(머리) + #main(본문). 아래 메뉴·닫힌 접힘 안은 보이지 않으므로 세지 않는다.
 * v2(9/30 밤 → 10/1 새벽, 화면을 고치기 전에 확정): ① 식별자(<code>·[data-ident] 안의 커밋 해시·발행본 ID)는 숫자로 세지 않는다
 *   ② 반투명 색은 실제로 칠해지는 바탕 위에 섞은 뒤 채도를 잰다(6% 불투명 테두리가 「장식 색」으로 잡히던 것 바로잡음)
 *   ③ 4번의 「·로 이은 숫자 셋」에서 헤드라인 한 줄·시장 띠([data-clarity~=headline|strip])는 뺀다 — 헤드라인은 글로 두라는 명령이고 증거 그래프가 바로 아래에 있다
 * v3(2026-10-05 00:40 · 출목표 한 판에 180곳 기사 제목이 보이게 된 뒤): ⑤ 식별자(기사 제목 · 언론사 이름 · [data-ident])는 우리가 쓴 글이 아니라 원문 그대로이므로
 *   1번(내일·오늘·어제)과 2번(흐릿한 말)에서도 세지 않는다(「두산, 다음 도약 위한 준비 끝」 같은 제목) — 앞날 말은 따로 판 묶음 검사와 화면 낱말 검사가 원문 제목까지 본다
 *   ⑥ 식별자로 볼 최소 길이 4 → 3 글자(「뉴스1」 같은 언론사 이름 속 숫자를 단위 없는 숫자로 세던 것) · 검사기 자체 시험(심은 「내일 42 정도.」)은 그대로 잡는다
 *   ④ 덤(여섯 숫자 밖): formatDates = 글 날짜가 「10월 1일(목)」 모양이 아니거나 「9. 30.」 같은 다른 모양인 수 · sentences = 보이는 문장 목록(지운 수·더한 수 세기용)
 */
export function measureClarity(opts = {}) {
  // opts.roots: 잴 곳(기본 #top·#main) · opts.refTime === false 면 「화면에 기준 시각이 있나」는 보지 않는다(출처 칸만 따로 잴 때)
  const roots = (opts.roots ?? ['#top', '#main']).flatMap(sel => [...document.querySelectorAll(sel)]);
  // 계산 빠르게: 요소마다 한 번만 재고 기억한다(조상 사슬을 요소마다 다시 걷지 않음)
  const csMemo = new Map(), CS = e => { let c = csMemo.get(e); if (!c) { c = getComputedStyle(e); csMemo.set(e, c); } return c; };
  const visMemo = new Map(), visibleChain = e => { if (!e || e.nodeType !== 1) return true; if (visMemo.has(e)) return visMemo.get(e); const cs = CS(e); const v = !(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) && visibleChain(e.parentElement); visMemo.set(e, v); return v; };
  // 닫힌 <details> 안(요약 줄 빼고)은 눌러야 열리는 곳이라 보이지 않는 것으로 친다(크롬은 닫힌 칸 안에도 자리를 돌려줄 때가 있다)
  const closedMemo = new Map(), inClosed = e => { if (!e || e.nodeType !== 1) return false; if (closedMemo.has(e)) return closedMemo.get(e); const p = e.parentElement; const v = (p && p.tagName === 'DETAILS' && !p.open && e.tagName !== 'SUMMARY') || inClosed(p); closedMemo.set(e, v); return v; };
  const shown = el => { if (!el.isConnected) return false; if (inClosed(el)) return false; const r = el.getBoundingClientRect(); if (r.width < 1 && r.height < 1) return false; return visibleChain(el); };
  // ---- 글 모으기(보이는 것만) ----
  const svgTexts = []; for (const r of roots) for (const t of r.querySelectorAll('svg text')) if (shown(t)) svgTexts.push(t.textContent.trim());
  const htmlText = roots.map(r => r.innerText).join('\n');
  const lines = [...htmlText.split('\n'), ...svgTexts].map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const sample = (arr, x) => { if (arr.length < 8) arr.push(x); };
  const idents = [...new Set(roots.flatMap(r => [...r.querySelectorAll('code, [data-ident]')]).filter(shown).map(e => e.textContent.trim()).filter(s => s.length >= 3))].sort((a, b) => b.length - a.length);
  const noIdent = l => idents.reduce((t, id) => t.split(id).join(' ⓘ '), l), ourLines = lines.map(noIdent); // 1·2번은 원문(식별자)을 뺀 우리 글만
  const exempt = new Set(roots.flatMap(r => [...r.querySelectorAll('[data-clarity~="headline"], [data-clarity~="strip"]')]).flatMap(e => e.innerText.split('\n').map(s => s.replace(/\s+/g, ' ').trim())).filter(Boolean));
  // 1
  // 2026-10-02 사장님 명령(「ATLAS는 단 하루, 내일만 예측한다」): 바로 뒤에 날짜를 붙인 「내일(10월 2일 금)」은 날짜가 분명하므로 세지 않는다 — 날짜 없는 「내일·오늘·어제」만 센다
  // 2026-10-02 01:34 사장님 승인 3차 디자인: 큰 제목 「내일」 바로 아래에 내일 날짜(「10월 2일 금요일」 · [data-clarity~="date-anchor"])가 보이는 화면에서는
  //   제목·글상자([data-clarity~="dated"])의 「내일」이 그 날짜를 가리키므로 세지 않는다 — 다른 곳의 「내일」과 「오늘·어제」는 그대로 센다(검사기 자체 시험이 그대로 잡는다)
  const anchorOn = roots.some(r => [...r.querySelectorAll('[data-clarity~="date-anchor"]')].some(e => shown(e) && /\d{1,2}월 \d{1,2}일/.test(e.textContent)));
  const datedLines = new Set(anchorOn ? roots.flatMap(r => [...r.querySelectorAll('[data-clarity~="dated"]')]).filter(shown).flatMap(e => e.innerText.split('\n').map(s => s.replace(/\s+/g, ' ').trim())).filter(Boolean) : []);
  const relSamples = []; let relDays = 0; for (const l of ourLines) { const m = (datedLines.has(l) ? l.replace(/내일/g, 'ⓓ') : l).replace(/내일\(\d{1,2}월 \d{1,2}일[^)]*\)/g, 'ⓓ').match(/내일|오늘|어제/g); if (m) { relDays += m.length; sample(relSamples, l.slice(0, 80)); } }
  // 2
  const vagueRe = /최근|곧|지금|다음|많이|조금|대부분|크게/;
  const vagueSamples = []; let vague = 0;
  for (const l of ourLines) for (const s of l.split(/(?<=[.!?])\s+/)) if (vagueRe.test(s) && !/\d/.test(s)) { vague++; sample(vagueSamples, s.slice(0, 80)); }
  // 3 — 날짜·시각·종목 코드·영문 식별자는 먼저 걷어 내고, 남은 숫자 뒤에 단위가 있는지 본다
  const strip = l => idents.reduce((s, id) => s.split(id).join(' ⓘ '), l)
    .replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?/g, ' ⓓ ').replace(/\d{1,2}월\s?\d{1,2}일/g, ' ⓓ ').replace(/\b\d{1,2}\/\d{1,2}\b(?!\s*(일|개|종목|칸|%))/g, ' ⓓ ').replace(/\d{1,2}:\d{2}(:\d{2})?/g, ' ⓣ ')
    .replace(/\b\d{6}\b/g, ' ⓒ ').replace(/[A-Za-z]+[+\-]?\d+[A-Za-z\d]*|\d+[A-Za-z]{1,}(?![A-Za-z])/g, m => /^\d[\d,.]*(%|px|KB|MB|bp|x)$/.test(m) ? m : ' ⓘ ');
  const UNIT = /^\s?(%p|%|원|종류|종목|종|거래일|개월|개|일|칸|건|번|배|곳|명|줄|회|주|년|월|시간|시|분|초|경로|단계|요인|가지|쪽|차|위|만|억|조|천|KB|MB|px|쌍|판|점|표|장|묶음|행|열|파일|층|대|×|bp|포인트|자리|글자|셀|블록|기준일|호|세)/;
  const bareSamples = []; let bare = 0;
  for (const raw of lines) {
    const l = strip(raw);
    for (const m of l.matchAll(/[+−\-±]?\d[\d,]*(?:\.\d+)?/g)) {
      const after = l.slice(m.index + m[0].length, m.index + m[0].length + 8), before = l.slice(Math.max(0, m.index - 1), m.index);
      if (UNIT.test(after)) continue;
      if (/^\/\s?\d/.test(after)) continue; // 분수의 앞 숫자(뒤 숫자에서 단위를 본다)
      if (/[₩$]/.test(before)) continue;
      bare++; sample(bareSamples, `${raw.slice(Math.max(0, m.index - 20), m.index + 24)} ⟵ ${m[0]}`);
    }
  }
  const hasRefTime = /\d{1,2}월\s?\d{1,2}일\s?\((월|화|수|목|금|토|일)\)[^\n]{0,40}(\d{1,2}:\d{2}\s?KST|종가)/.test(htmlText);
  if (!hasRefTime && opts.refTime !== false) { bare++; sample(bareSamples, '화면에 기준 시각(「9월 30일(수) … 15:30 KST」 또는 「… 종가」)이 없음'); }
  // 4
  const graphSamples = []; let graphable = 0;
  for (const r of roots) for (const t of r.querySelectorAll('table')) {
    if (!shown(t)) continue;
    const rows = [...t.querySelectorAll('tbody tr')].filter(shown); if (rows.length < 3) continue;
    const cells = rows.flatMap(tr => [...tr.children]); const numeric = cells.filter(td => /\d/.test(strip(td.innerText).replace(/ⓓ|ⓣ|ⓒ|ⓘ/g, ''))).length;
    if (numeric / Math.max(1, cells.length) >= 0.5) { graphable++; sample(graphSamples, '표: ' + (t.closest('section')?.querySelector('h2')?.textContent ?? '').slice(0, 40) + ` (${rows.length}행)`); }
  }
  // 글줄 비교: 「·」로 이은 줄에서 같은 단위의 값이 셋 이상(단위 없는 숫자는 어느 단위와도 같은 것으로 셈) = 막대로 그릴 수 있는 같은 종류 값의 비교
  //   (한 사건의 서로 다른 성질 — 예: 「오차 1.54% · 방향 틀림 · 80% 범위 안」 — 은 비교가 아니므로 세지 않는다)
  for (const l of htmlText.split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)) {
    if (exempt.has(l) || !/·/.test(l)) continue; const s = strip(l);
    const units = [...s.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map(m => (s.slice(m.index + m[0].length, m.index + m[0].length + 8).match(UNIT) ?? [null, null])[1]);
    const wild = units.filter(u => u == null).length, counts = {}; for (const u of units) if (u) counts[u] = (counts[u] ?? 0) + 1;
    const best = Math.max(0, ...Object.values(counts)) + wild;
    if (units.length >= 3 && best >= 3) { graphable++; sample(graphSamples, '글: ' + l.slice(0, 80)); }
  }
  // 색 도구
  const parse = c => { const m = String(c).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/); if (!m) return null; let a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return [Number(m[1]), Number(m[2]), Number(m[3]), a]; };
  const hex = s => { s = String(s).trim(); if (s.startsWith('#')) { let h = s.slice(1); if (h.length === 3) h = [...h].map(x => x + x).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; } return parse(s); };
  const blend = (fg, bg) => { const a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // 바탕 후보: 조상마다 바탕색 위에 그라데이션의 색 멈춤점을 하나씩 얹어 본 모든 경우(몸통 body 의 그라데이션도 포함) — 글 대비는 가장 나쁜 후보로 잰다
  const bgMemo = new Map();
  const bgsOf = el => {
    if (!el || el.nodeType !== 1) return [[255, 255, 255, 1]];
    if (bgMemo.has(el)) return bgMemo.get(el);
    let bases = bgsOf(el.parentElement); const cs = CS(el), c = parse(cs.backgroundColor);
    if (c && c[3] > 0) bases = bases.map(b => blend(c, b));
    const stops = /gradient/.test(cs.backgroundImage) ? [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m => parse(m[0])).filter(g => g && g[3] > 0) : [];
    if (stops.length) bases = stops.every(g => g[3] >= 1) ? stops.map(g => [...g]) : bases.flatMap(b => [b, ...stops.map(g => blend(g, b))]).slice(0, 24);
    bgMemo.set(el, bases); return bases; };
  const bgOf = el => bgsOf(el)[0];
  // 5
  const contrastSamples = []; let lowContrast = 0;
  const textEls = [];
  for (const r of roots) for (const el of r.querySelectorAll('*')) { if (el.closest('svg') && el.tagName.toLowerCase() !== 'text') continue; const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (own && shown(el)) textEls.push(el); }
  // 겹친 불투명도: 요소와 조상들의 opacity 곱(SVG 는 fill-opacity·stroke-opacity 도)
  const opMemo = new Map(), opacityChain = el => { if (!el || el.nodeType !== 1) return 1; if (opMemo.has(el)) return opMemo.get(el); const a = Number(CS(el).opacity) * opacityChain(el.parentElement); opMemo.set(el, a); return a; };
  for (const el of textEls) {
    const cs = getComputedStyle(el), svgText = el.tagName.toLowerCase() === 'text';
    let fg = parse(svgText ? cs.fill : cs.color); if (!fg) continue;
    fg[3] *= opacityChain(el) * (svgText ? Number(cs.fillOpacity) : 1);
    const bgs = bgsOf(svgText ? el.closest('svg').parentElement : el);
    const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight) || 400, large = size >= 24 || (size >= 18.66 && weight >= 700), need = large ? 3 : 4.5;
    const r = Math.min(...bgs.map(bg => ratio(fg[3] < 1 ? blend(fg, bg) : fg, bg)));
    if (r < need) { lowContrast++; sample(contrastSamples, `${el.textContent.trim().slice(0, 30)} · ${r.toFixed(2)}:1 (필요 ${need}:1)`); }
  }
  // 6
  const rootCS = getComputedStyle(document.documentElement);
  const tokens = ['--up', '--up-soft', '--down', '--down-soft', '--warn', '--warn-soft'].map(k => hex(rootCS.getPropertyValue(k))).filter(Boolean);
  const oklchC = c => { const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const [r, g, b] = c.slice(0, 3).map(lin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s; return Math.hypot(A, B); };
  const semantic = c => tokens.some(t => Math.abs(t[0] - c[0]) + Math.abs(t[1] - c[1]) + Math.abs(t[2] - c[2]) <= 12);
  const deco = new Map();
  // 반투명 색은 실제 바탕 위에 섞은 뒤(눈에 보이는 색) 채도를 잰다
  const note = (c, where, over, alpha = 1) => { if (!c || semantic(c)) return; c = [...c]; c[3] *= alpha; if (c[3] <= 0.001) return; if (c[3] < 1) c = blend(c, over()); if (oklchC(c) < 0.035 || semantic(c)) return; const k = `rgb(${c.slice(0, 3).map(Math.round).join(',')})`; if (!deco.has(k)) deco.set(k, where); };
  const colorsIn = s => [...String(s ?? '').matchAll(/rgba?\([^)]+\)/g)].map(m => parse(m[0])).filter(Boolean);
  for (const r of roots) for (const el of r.querySelectorAll('*')) {
    if (!shown(el)) continue; const cs = getComputedStyle(el), tag = el.tagName.toLowerCase(), where = (el.className?.baseVal ?? el.className ?? tag).toString().slice(0, 30) || tag;
    const inSvg = !!el.closest('svg'), op = opacityChain(el), self = () => bgOf(inSvg ? el.closest('svg').parentElement : el), under = () => bgOf(el.parentElement ?? el);
    if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) note(parse(tag === 'text' ? cs.fill : cs.color), where + ' 글', self, op * (tag === 'text' ? Number(cs.fillOpacity) : 1));
    if (!inSvg) { note(parse(cs.backgroundColor), where + ' 바탕', under, op); for (const c of colorsIn(cs.backgroundImage)) note(c, where + ' 바탕 그라데이션', under, op); for (const c of colorsIn(cs.boxShadow)) note(c, where + ' 그림자', under, op); }
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs['border' + side + 'Width']) > 0 && cs['border' + side + 'Style'] !== 'none') note(parse(cs['border' + side + 'Color']), where + ' 테두리', self, op);
    if (inSvg) {
      for (const [prop, opac, label] of [['fill', 'fillOpacity', '채움'], ['stroke', 'strokeOpacity', '선']]) {
        const v = cs[prop]; if (!v || v === 'none') continue; const a = op * Number(cs[opac]);
        const ref = v.match(/url\("?#([^")]+)"?\)/);
        if (ref) { const g = document.getElementById(ref[1]); for (const st of g?.querySelectorAll('stop') ?? []) { const scs = getComputedStyle(st); note(parse(scs.stopColor), where + ' ' + label + '(그라데이션)', self, a * Number(scs.stopOpacity)); } }
        else note(parse(v), where + ' ' + label, self, a);
      }
    }
  }
  // 덤: 날짜 모양(글은 「10월 1일(목)」 하나 · 「9. 30.」 같은 다른 모양이나 요일 빠진 날짜를 센다)
  const fmtSamples = []; let formatDates = 0;
  for (const l of htmlText.split('\n')) {
    for (const m of l.matchAll(/\d{1,2}월\s?\d{1,2}일(?!\s?\((월|화|수|목|금|토|일)\))/g)) { formatDates++; sample(fmtSamples, l.slice(Math.max(0, m.index - 10), m.index + 20).trim()); }
    for (const m of l.matchAll(/(?<![\d.])\d{1,2}\.\s\d{1,2}\.(?=\s|$)/g)) { formatDates++; sample(fmtSamples, l.slice(Math.max(0, m.index - 10), m.index + 20).trim()); }
  }
  // 덤: 보이는 글 조각 목록(요소마다 자기 글 · 숫자는 #로 바꿔 날마다 같은 조각으로 친다) — 전체 · 첫 화면(스크롤 전 창 안)
  const norm = s => s.replace(/\s+/g, ' ').replace(/[+−\-]?\d[\d,.]*/g, '#').trim();
  const ownText = el => el.tagName.toLowerCase() === 'text' ? el.textContent : [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
  const piece = el => norm(ownText(el));
  const sentences = [...new Set(textEls.map(piece).filter(s => s.length >= 2 && /[가-힣A-Za-z]/.test(s)))];
  // 「문장」 = 그래프 표시(그림 글자·막대 이름·값·범례·눈금) 밖의 글 — 지운 수·더한 수는 이것으로 센다(그래프로 바꾸라는 요구와 부딪히지 않게)
  const GRAPH = 'svg, .bars, .hb, .pbar, .pbar-legend, .legend, .legend-line, .evo-legend, figcaption, .wl-head, .spark, .rank-list';
  // 한 줄로 읽히는 묶음(헤드라인 한 줄 · 시장 띠 한 줄)은 안의 요소가 여럿이어도 문장 하나로 센다
  const ONE = '.hl-line, .mstrip';
  const proseEls = textEls.filter(el => !el.closest(GRAPH)).map(el => el.closest(ONE) ?? el);
  const proseText = el => el.matches(ONE) ? norm(el.innerText) : piece(el);
  const prose = [...new Set(proseEls.map(proseText).filter(s => s.length >= 2 && /[가-힣]/.test(s)))];
  const firstProse = [...new Set(proseEls.filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).map(proseText).filter(s => s.length >= 2 && /[가-힣]/.test(s)))];
  const firstView = [...new Set(textEls.filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).map(piece).filter(s => s.length >= 2 && /[가-힣A-Za-z]/.test(s)))];
  // ---- 7 잘린 글자(10/01 03시 추가): 칸이 좁아 「…」로 잘리거나 넘쳐 가려진 글 · 닫힌 선택 상자의 글이 상자보다 긴 것 · 화면 가장자리 밖으로 나간 글 ----
  //   사장님 휴대폰(10/01 02:49, 어두운 화면·큰 글씨)에서 회사 이름이 한 글자만 보였는데, 1~6번은 글자 내용만 봐서 이것을 세지 못했다 → 목표 0
  const truncSamples = [], truncEls = new Set();
  const add = (el, word) => { truncEls.add(el); truncSamples.push(word.replace(/\s+/g, ' ').trim().slice(0, 34)); };
  // 일부러 옆으로 넘기게 만든 띠(data-scroll="x" · 종목 상세의 날짜 띠 80여 칸)는 뺀다 — 넘겨 보는 조작 칸이지 가려진 글이 아니다
  const intentional = e => !!e.closest('[data-scroll="x"], .date-strip');
  const scroller = e => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const s = CS(p); if (['auto', 'scroll'].includes(s.overflowX)) return true; } return false; };
  // 글을 잘라 먹는 조상 칸(overflow hidden·clip)의 안쪽 테두리 — 글이 이 밖으로 나가면 잘려 보인다(자료 상태 막대 값 「3개」가 판 끝에서 잘리던 결함)
  const clipMemo = new Map(), clipOf = e => { if (clipMemo.has(e)) return clipMemo.get(e); const cs = CS(e); const x = ['hidden', 'clip'].includes(cs.overflowX), y = ['hidden', 'clip'].includes(cs.overflowY); let v = null; if (x || y) { const b = e.getBoundingClientRect(); v = {x, y, l: b.left + (parseFloat(cs.borderLeftWidth) || 0), r: b.right - (parseFloat(cs.borderRightWidth) || 0), t: b.top + (parseFloat(cs.borderTopWidth) || 0), b: b.bottom - (parseFloat(cs.borderBottomWidth) || 0)}; } clipMemo.set(e, v); return v; };
  const range = document.createRange();
  let canvasCtx = null;
  for (const r of roots) for (const el of r.querySelectorAll('*')) {
    if (el.closest('svg') || !shown(el)) continue;
    const cs = CS(el);
    if (el.tagName === 'SELECT') {
      const opt = el.options[el.selectedIndex]; if (!opt) continue;
      canvasCtx ??= document.createElement('canvas').getContext('2d'); canvasCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const need = canvasCtx.measureText(opt.text).width, room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (need > room + 1) add(el, '선택 상자: ' + opt.text);
      continue;
    }
    // 입력 칸의 안내 글(「종목 이름·코드」)이 칸보다 긴 것
    if (el.tagName === 'INPUT' && !el.value && el.placeholder) {
      canvasCtx ??= document.createElement('canvas').getContext('2d'); canvasCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const need = canvasCtx.measureText(el.placeholder).width, room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - (el.type === 'search' ? 4 : 0);
      if (need > room + 1) add(el, '입력 칸 안내 글: ' + el.placeholder);
      continue;
    }
    // 가로로 밀어야 보이는 칸(세로 목록인데 글이 옆으로 넘친 것 — 1만원 비교 순위의 값이 글씨 200% 에서 오른쪽으로 밀려 안 보이던 결함)
    if (!intentional(el) && ['auto', 'scroll'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && (el.innerText || '').trim()) { add(el, '가로로 밀어야 보임: ' + el.innerText); continue; }
    // 「…」 줄임
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && (el.innerText || '').trim()) { add(el, '줄임표: ' + el.innerText); continue; }
    // 자기 글자(글자 조각의 실제 자리)가 화면 밖이나 잘라 먹는 조상 칸 밖으로 나간 것
    if (el.classList.contains('sr') || intentional(el)) continue;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      range.selectNodeContents(n); const t = range.getBoundingClientRect(); if (t.width < 1 || t.height < 1) continue;
      let why = null;
      if (!scroller(el) && (t.right > innerWidth + 1 || t.left < -1)) why = '화면 밖: ';
      else for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const c = clipOf(p); if (c && ((c.x && (t.right > c.r + 1 || t.left < c.l - 1)) || (c.y && (t.bottom > c.b + 1 || t.top < c.t - 1)))) { why = '칸 끝에서 잘림: '; break; } }
      if (why) { add(el, why + el.textContent); break; }
    }
  }
  // 잘린 칸 안의 잘린 칸은 한 번만 센다(바깥 칸이 잘리면 안쪽 글도 함께 잘려 보이므로)
  const truncated = [...truncEls].filter(e => ![...truncEls].some(o => o !== e && o.contains(e))).length;
  const pageOverflowX = document.documentElement.scrollWidth > innerWidth + 1;
  return {relDays, vague, bareNumbers: bare, graphable, lowContrast, decoColors: deco.size, truncated: truncated + (pageOverflowX ? 1 : 0), pageOverflowX, hasRefTime, formatDates, sentences, firstView, prose, firstProse,
    samples: {relDays: relSamples, vague: vagueSamples, bareNumbers: bareSamples, graphable: graphSamples, lowContrast: contrastSamples, decoColors: [...deco.entries()].slice(0, 12).map(([k, v]) => `${k} (${v})`), formatDates: fmtSamples, truncated: truncSamples.slice(0, 60)}};
}
