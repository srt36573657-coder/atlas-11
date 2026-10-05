/* ATLAS 지도 샘플 — 함께 쓰는 도구(숫자 꼴 · 날짜 · 색 · 땅 나누기 · 그림 그리기)
   모든 숫자는 window.ATLAS(data.js · 판 파일에서 뽑은 실제 값)에서 셈해서 넣는다 — 손으로 쓴 숫자 금지 */
(function () {
  const A = window.ATLAS;
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = d => WD[new Date(d + 'T12:00:00Z').getUTCDay()];
  const L = {
    A, finite,
    /** '2026-10-02' → '10월 2일(금)' */
    korDate: d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${weekday(d)})` : '—',
    /** '2026-10-02' → '10월 2일' */
    md: d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '',
    /** 0.4176 → '+41.8%' · 음수는 '−'(사이트와 같은 빼기표) */
    pct: (v, d = 1) => finite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%' : '없음',
    /** 오름 ▲ · 내림 ▼ */
    tri: v => finite(v) ? (v > 0 ? '▲' : v < 0 ? '▼' : '') : '',
    cls: v => finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : '') : '',
    /** 억 원 → '1,613조 5,729억 원' 꼴(짧게: '1,613조 원') */
    won: (eok, short = true) => {
      if (!finite(eok)) return '없음';
      const jo = Math.floor(eok / 10000), rest = Math.round(eok - jo * 10000);
      if (jo <= 0) return `${Math.round(eok).toLocaleString('ko-KR')}억 원`;
      if (short) return `${(eok / 10000 >= 100 ? Math.round(eok / 10000) : Math.round(eok / 1000) / 10).toLocaleString('ko-KR')}조 원`;
      return `${jo.toLocaleString('ko-KR')}조 ${rest.toLocaleString('ko-KR')}억 원`;
    },
    /** 십억 달러 → '5조 6,382억 달러'(짧게: '5.6조 달러' / '183억 달러') */
    usd: (b, short = true) => {
      if (!finite(b)) return '없음';
      const eok = b * 10; // 10억 달러 = 1 → 억 달러 단위
      if (eok >= 10000) return short ? `${(Math.round(eok / 1000) / 10).toLocaleString('ko-KR')}조 달러` : `${Math.floor(eok / 10000)}조 ${Math.round(eok % 10000).toLocaleString('ko-KR')}억 달러`;
      return `${Math.round(eok).toLocaleString('ko-KR')}억 달러`;
    },
    sum: xs => xs.filter(finite).reduce((s, x) => s + x, 0),
    mean: xs => { const v = xs.filter(finite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; },
    median: xs => { const v = xs.filter(finite).sort((a, b) => a - b); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; },
    /** 한 판(kr/us)의 찾기 도구 */
    side: id => {
      const s = A[id];
      const g = new Map(s.groups.map(x => [x.id, x])), f = new Map(s.families.map(x => [x.id, x])), c = new Map(s.companies.map(x => [x.code, x]));
      return {...s, groupOf: gid => g.get(gid), famOf: fid => f.get(fid), company: code => c.get(code),
        companiesOf: gid => s.companies.filter(x => x.group === gid), groupsOf: fid => s.groups.filter(x => x.fam === fid)};
    },
    /** CSS 변수 값 */
    tok: name => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    /** '#RRGGBB' → [r,g,b] */
    rgb: hex => { const h = hex.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); },
    mix: (a, b, t) => { const A1 = L.rgb(a), B1 = L.rgb(b); return '#' + A1.map((x, i) => Math.round(x + (B1[i] - x) * t).toString(16).padStart(2, '0')).join(''); },
    /** 오름·내림 칠 — 0 근처는 옅은 판 색, 크게 오를수록 진한 빨강 · 크게 내릴수록 진한 파랑(max 에서 가장 진함) */
    heat: (v, max = 0.3) => {
      const flat = L.tok('--map-flat'); if (!finite(v)) return flat;
      const t = Math.min(1, Math.abs(v) / max), k = 0.12 + 0.88 * Math.pow(t, 0.75);
      return L.mix(flat, v >= 0 ? L.tok('--map-up') : L.tok('--map-down'), Math.abs(v) < 0.0005 ? 0 : k);
    },
    /** 칠 위 글자색(밝기로 고름) */
    inkOn: hex => { const [r, g, b] = L.rgb(hex).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); const Lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; return Lum > 0.22 ? L.tok('--map-ink-dark') : L.tok('--map-ink-light'); },
    /** 땅 나누기(squarified treemap) — items: [{value, ...}] → 같은 객체에 x,y,w,h 를 붙여 돌려줌(값 큰 순) */
    squarify: (items, x, y, w, h) => {
      const list = items.filter(it => it.value > 0).sort((a, b) => b.value - a.value);
      const total = list.reduce((s, it) => s + it.value, 0); if (!total) return [];
      const scale = (w * h) / total; const out = [];
      let rest = list.map(it => ({it, a: it.value * scale}));
      let rx = x, ry = y, rw = w, rh = h;
      const worst = (row, side) => { const s = row.reduce((t, r) => t + r.a, 0); const mx = Math.max(...row.map(r => r.a)), mn = Math.min(...row.map(r => r.a)); return Math.max(side * side * mx / (s * s), (s * s) / (side * side * mn)); };
      while (rest.length) {
        const side = Math.min(rw, rh); let row = [rest[0]], i = 1;
        while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) { row.push(rest[i]); i++; }
        const s = row.reduce((t, r) => t + r.a, 0);
        if (rw >= rh) { const cw = s / rh; let cy = ry; for (const r of row) { const ch = r.a / cw; Object.assign(r.it, {x: rx, y: cy, w: cw, h: ch}); out.push(r.it); cy += ch; } rx += cw; rw -= cw; }
        else { const ch = s / rw; let cx = rx; for (const r of row) { const cw = r.a / ch; Object.assign(r.it, {x: cx, y: ry, w: cw, h: ch}); out.push(r.it); cx += cw; } ry += ch; rh -= ch; }
        rest = rest.slice(i);
      }
      return out;
    },
    /** HTML 요소 */
    el: (tag, attrs, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs ?? {})) { if (v == null || v === false) continue; if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v); } for (const k of kids.flat()) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(String(k))); return e; },
    /** SVG 요소 */
    sv: (tag, attrs, ...kids) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs ?? {})) if (v != null && v !== false) e.setAttribute(k, v); for (const k of kids.flat()) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(String(k))); return e; },
    /** 글자 폭 어림(px) — 칸 안에 이름이 들어가는지 볼 때 */
    textW: (s, size) => { const c = L._cv || (L._cv = document.createElement('canvas').getContext('2d')); c.font = `700 ${size}px ${L.tok('--font') || 'serif'}`; return c.measureText(String(s)).width; },
    /** 씨앗 있는 난수(같은 그림이 늘 같게) */
    rand: seed => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; },
    /** 머리 · 물음 · 범례 · 읽은 것 · 근거 채우기 */
    fill: ({num, title, sub, question, legend = [], reads = [], foot = [], why}) => {
      const q = id => document.getElementById(id);
      q('num').textContent = num; q('title').textContent = title; q('sub').textContent = sub;
      q('tag').replaceChildren(L.el('span', null, `ATLAS 지도 샘플 ${num} / 11`), L.el('span', null, '2026년 10월 5일(월) 만듦'));
      q('question').innerHTML = question;
      q('legend').replaceChildren(...legend.map(([sw, text]) => L.el('div', {class: 'lg'}, sw, L.el('span', {html: text}))));
      q('reads').replaceChildren(...reads.map(t => L.el('li', {html: t})));
      q('foot').replaceChildren(...foot.map(t => L.el('p', {html: t})));
      if (why) { const w = q('why'); w.innerHTML = why; w.hidden = false; }
    },
    /** 범례 칸 하나(색 네모) */
    swatch: color => { const s = L.el('span', {class: 'sw'}); s.style.background = color; return s; },
    /** 범례 칸 하나(빨강 ← 그대로 → 파랑 띠) */
    ramp: (max = 0.3) => { const s = L.sv('svg', {class: 'sw', viewBox: '0 0 54 26', width: 54, height: 26}); const steps = [-1, -0.6, -0.25, 0, 0.25, 0.6, 1]; steps.forEach((t, i) => s.append(L.sv('rect', {x: i * 54 / 7, y: 0, width: 54 / 7 + 0.5, height: 26, fill: L.heat(t * max, max)}))); return s; },
  };
  window.L = L;
})();
