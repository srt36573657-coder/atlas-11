/* ATLAS 로고 샘플 11개 — 2026-10-05 21:07 사장님 「심볼 만들어 · 아틀라스가 지도라는 뜻 · 지도 판처럼 의미가 있게 · 샘플 11개」
   (처음에 「심부름」으로 잘못 읽어 지도 샘플을 만들었고, 23:49 「로고 만들어 달라는 거야」로 바로잡음)
   로고 하나 = 100×100 칸에 그리는 함수 · 색 셋(밝은 판 · 밤 판 · 앱 아이콘)에서 같은 모양
   빨강은 「오름」 한 자리에만(ATLAS 약속: 빨강 = 오름) */
(function () {
  const PAL = {
    light: {bg: '#F8FBF7', fg: '#1B3B32', jade: '#4F8F77', soft: '#BFD6CB', up: '#B4232F'},
    dark: {bg: '#13261F', fg: '#E8F1EB', jade: '#7FB79D', soft: '#2F4C42', up: '#FF5A66'},
    icon: {bg: '#1B3B32', fg: '#F2F8F4', jade: '#8CC6AC', soft: '#3A6A5C', up: '#FF6B74'},
  };
  // 모서리를 둥글린 세모(꼭짓점 위) — 등고선 · 봉우리
  const roundTri = (cx, cy, w, h, r) => {
    const P = [[cx, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
    const at = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L]; };
    let s = '';
    for (let i = 0; i < 3; i++) {
      const p = P[i], prev = P[(i + 2) % 3], next = P[(i + 1) % 3];
      const a = at(p, prev, r), b = at(p, next, r);
      s += (i ? ' L' : 'M') + a.map(v => v.toFixed(2)).join(',') + ' Q' + p.join(',') + ' ' + b.map(v => v.toFixed(2)).join(',');
    }
    return s + ' Z';
  };
  // 지형도 고리 — 여덟 방향 반지름을 조금씩 다르게 해 손으로 그린 등고선처럼(같은 모양을 크기만 바꿔 겹침)
  const K = [[1.00, .90, 1.06, 1.12, .96, .86, .95, 1.04], [1.02, .92, 1.03, 1.08, .97, .88, .96, 1.02], [1.0, .95, 1.02, 1.05, .98, .92, .97, 1.0]];
  const blob = (cx, cy, rx, ry, ki) => {
    const k = K[ki], n = k.length, P = k.map((f, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + rx * f * Math.cos(a), cy + ry * f * Math.sin(a)]; });
    let d = `M${P[0][0].toFixed(2)},${P[0][1].toFixed(2)}`;
    for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1.map(v => v.toFixed(2)).join(',')} ${c2.map(v => v.toFixed(2)).join(',')} ${p2.map(v => v.toFixed(2)).join(',')}`; }
    return d + 'Z';
  };
  const star4 = (x, y, R, r) => { let s = ''; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, d = i % 2 ? r : R; s += (i ? 'L' : 'M') + (x + d * Math.cos(a)).toFixed(2) + ',' + (y + d * Math.sin(a)).toFixed(2); } return s + 'Z'; };

  const MARKS = [
    {id: 'compass', line: '방향을 읽는 판 · 위(북)는 오름', name: '나침반 A', map: '나침반 — 지도에서 방향을 읽는 도구', stock: 'A 의 꼭대기가 북쪽 바늘 — 판에서 위(북)는 오름', red: '빨간 바늘 = 오름 쪽',
      draw: p => `
        <circle cx="50" cy="52" r="42" fill="none" stroke="${p.fg}" stroke-width="4.5"/>
        <path d="M92 52h-7M15 52H8M50 94v-7" stroke="${p.fg}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M31 81 50 25 69 81" fill="none" stroke="${p.fg}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M38.5 62h23" stroke="${p.jade}" stroke-width="7" stroke-linecap="round"/>
        <path d="M50 4 57.5 22h-15Z" fill="${p.up}"/>`},
    {id: 'contour', line: '높이를 그리는 판 · 봉우리 = 많이 오름', name: '등고선 봉우리', map: '등고선 — 지도에서 땅의 높이를 그리는 선', stock: '안쪽 고리일수록 높은 곳 — 많이 오른 업종이 봉우리', red: '빨간 점 = 가장 높이 오른 곳',
      draw: p => `
        <path d="${blob(47, 57, 39, 34, 0)}" fill="none" stroke="${p.fg}" stroke-width="4.6"/>
        <path d="${blob(53, 49, 25, 22, 1)}" fill="none" stroke="${p.fg}" stroke-width="4.6"/>
        <path d="${blob(58, 42, 12.5, 11, 2)}" fill="none" stroke="${p.jade}" stroke-width="4.6"/>
        <circle cx="59" cy="41" r="4.4" fill="${p.up}"/>`},
    {id: 'globe', line: '둥근 세계 위의 오름 길', name: '지구와 오름 길', map: '경위선 지구 — 지도책 첫 장의 둥근 세계', stock: '지구 위를 오르며 지나는 길 — 한국 판 · 미국 판의 오름 길', red: '빨간 길과 점 = 오른 흐름과 닿은 곳',
      draw: p => `
        <circle cx="48" cy="52" r="38" fill="none" stroke="${p.fg}" stroke-width="5"/>
        <ellipse cx="48" cy="52" rx="15" ry="38" fill="none" stroke="${p.jade}" stroke-width="3"/>
        <path d="M10 52h76M14 33h68M14 71h68" stroke="${p.jade}" stroke-width="3"/>
        <path d="M17 78 34 63l13 8 30-36" fill="none" stroke="${p.up}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="17" cy="78" r="5" fill="${p.bg}" stroke="${p.up}" stroke-width="3.5"/>
        <circle cx="79" cy="32" r="9" fill="${p.up}" stroke="${p.bg}" stroke-width="3.5"/>`},
    {id: 'folded', line: '접은 지도 세 칸이 오르는 막대로', name: '접은 지도책', map: '접은 지도 — 펼치면 판이 되는 지도책', stock: '접힌 세 칸이 차례로 높아짐 — 오르는 막대', red: '빨간 길 = 칸을 따라 오른 길',
      draw: p => `
        <path d="M12 88 37 82V54L12 60Z" fill="${p.soft}"/>
        <path d="M37 82 63 88V38L37 32Z" fill="${p.jade}"/>
        <path d="M63 88 88 82V12L63 18Z" fill="${p.fg}"/>
        <path d="M18 76 31 66 44 70 56 56 69 50 82 28" fill="none" stroke="${p.up}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0.1 9"/>
        <circle cx="82" cy="28" r="5.5" fill="${p.up}"/>`},
    {id: 'land', line: '넓이 = 회사 크기인 땅 지도', name: '땅 나누기', map: '땅 지도 — 나라 · 도 · 마을로 나눈 땅', stock: '칸 넓이 = 회사 크기 · 365곳을 한 장에', red: '빨간 칸 = 가장 붉게 오른 땅',
      draw: p => `
        <rect x="9" y="9" width="44" height="50" rx="9" fill="${p.jade}"/>
        <rect x="9" y="64" width="44" height="27" rx="7" fill="${p.fg}"/>
        <rect x="58" y="9" width="33" height="28" rx="7" fill="${p.up}"/>
        <rect x="58" y="42" width="15" height="22" rx="5" fill="${p.soft}"/>
        <rect x="76" y="42" width="15" height="22" rx="5" fill="${p.fg}"/>
        <rect x="58" y="69" width="33" height="22" rx="7" fill="${p.jade}"/>`},
    {id: 'pin', line: '지금 여기 · 핀 속 ∧ = 오름', name: '지도 핀', map: '지도 핀 — 「지금 여기」를 꽂는 표', stock: '핀 속 ∧ = 오름 · 오늘 판이 선 자리', red: '빨간 점 = 오름의 꼭대기',
      draw: p => `
        <path d="M50 95C39 80 18 61 18 40a32 32 0 0 1 64 0c0 21-21 40-32 55Z" fill="${p.fg}"/>
        <path d="M35 52 50 30 65 52" fill="none" stroke="${p.bg}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="50" cy="18.5" r="5.5" fill="${p.up}"/>`},
    {id: 'stars', line: '같이 움직인 별을 이은 A', name: '별자리 A', map: '별자리 지도 — 옛 사람이 하늘에 그린 지도', stock: '같이 움직인 회사를 이으면 A 모양 별자리', red: '빨간 별 = 가장 밝게 오른 별',
      draw: p => `
        <path d="M24 86 37 57 50 20 63 57 76 86M37 57h26" fill="none" stroke="${p.jade}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="86" r="6" fill="${p.fg}"/><circle cx="76" cy="86" r="6" fill="${p.fg}"/>
        <circle cx="37" cy="57" r="5.2" fill="${p.fg}"/><circle cx="63" cy="57" r="5.2" fill="${p.fg}"/>
        <path d="${star4(50, 20, 15, 4.2)}" fill="${p.up}"/>
        <circle cx="82" cy="30" r="2" fill="${p.jade}"/><circle cx="16" cy="40" r="1.8" fill="${p.jade}"/><circle cx="88" cy="62" r="1.6" fill="${p.jade}"/>`},
    {id: 'metro', line: '두 흐름이 만나 A 가 된 노선도', name: '노선도 A', map: '지하철 노선도 — 길과 갈아타는 곳을 그린 지도', stock: '두 노선(시대 흐름)이 만나 A 가 됨 · 흰 칸 = 환승역', red: '빨간 역 = 가장 많이 오른 역',
      draw: p => `
        <path d="M27 92V66L50 22l23 44v26" fill="none" stroke="${p.jade}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 66h82" stroke="${p.fg}" stroke-width="9" stroke-linecap="round"/>
        <rect x="20.5" y="57" width="13" height="18" rx="6.5" fill="${p.bg}" stroke="${p.fg}" stroke-width="3.5"/>
        <rect x="66.5" y="57" width="13" height="18" rx="6.5" fill="${p.bg}" stroke="${p.fg}" stroke-width="3.5"/>
        <circle cx="50" cy="22" r="8.5" fill="${p.up}" stroke="${p.bg}" stroke-width="3.5"/>`},
    {id: 'seal', line: '지도 격자 위에 새긴 A 도장', name: '청자 인장', map: '좌표 격자 — 지도의 가로세로 줄', stock: '도장처럼 남기는 기록 · 격자 위에 새긴 A', red: '빨간 점 = 오름 한 자리',
      draw: p => `
        <rect x="8" y="8" width="84" height="84" rx="16" fill="${p.fg}"/>
        <rect x="16.5" y="16.5" width="67" height="67" rx="9" fill="none" stroke="${p.bg}" stroke-width="2.6"/>
        <path d="M39 18v64M61 18v64M18 39h64M18 61h64" stroke="${p.bg}" stroke-width="1.4" opacity=".45"/>
        <path d="M32.5 76 50 28 67.5 76" fill="none" stroke="${p.bg}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 60h20" stroke="${p.bg}" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="72" cy="28" r="5.5" fill="${p.up}"/>`},
    {id: 'titan', line: '세계를 받친 A · 지금 인장을 키운 모양', name: '하늘을 받친 아틀라스', map: '아틀라스 — 하늘(세계)을 어깨에 진 거인 · 지도책 이름의 뿌리', stock: 'A 다리가 세계를 받침 · 지금 위 막대의 작은 인장(혼천의)을 키운 모양', red: '빨간 점 = 세계에서 오른 곳',
      draw: p => `
        <circle cx="50" cy="31" r="23" fill="none" stroke="${p.fg}" stroke-width="4.8"/>
        <ellipse cx="50" cy="31" rx="23" ry="8.5" transform="rotate(-24 50 31)" fill="none" stroke="${p.jade}" stroke-width="3.2"/>
        <path d="M27 93 44 56M73 93 56 56" stroke="${p.fg}" stroke-width="8.5" stroke-linecap="round"/>
        <path d="M36 76h28" stroke="${p.fg}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="64" cy="15.5" r="5" fill="${p.up}"/>`},
    {id: 'book', line: '아틀라스 = 지도책 그대로', name: '펼친 지도책', map: '지도책 — 아틀라스라는 말의 뜻 그대로', stock: '두 쪽에 걸친 길이 오름 — 한국 판 · 미국 판 두 쪽', red: '빨간 길과 점 = 오른 길과 닿은 곳',
      draw: p => `
        <path d="M50 28C39 21 22 20 8 24v54c14-4 31-3 42 4Z" fill="${p.soft}" stroke="${p.fg}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 28c11-7 28-8 42-4v54c-14-4-31-3-42 4Z" fill="${p.soft}" stroke="${p.fg}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M22 26v52M36 28v52M64 28v52M78 26v52" stroke="${p.jade}" stroke-width="1.8" opacity=".7"/>
        <path d="M15 66 28 58 40 63 60 46 72 51 84 36" fill="none" stroke="${p.up}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="84" cy="36" r="5.5" fill="${p.up}" stroke="${p.bg}" stroke-width="2"/>`},
  ];
  // 견줌용: 지금 사이트 위 막대의 작은 인장(혼천의 · style.css 의 --seal 그대로 크게)
  const NOW = {id: 'now', name: '지금 사이트', map: '지금 위 막대의 작은 인장(혼천의)', stock: '', red: '',
    draw: p => `<circle cx="50" cy="50" r="41" fill="none" stroke="${p.jade}" stroke-width="8.4"/><ellipse cx="50" cy="50" rx="41" ry="15.6" transform="rotate(-24 50 50)" fill="none" stroke="${p.jade}" stroke-width="8.4"/>`};

  const svg = (m, pal, size, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${title ?? m.name}">${m.draw(PAL[pal])}</svg>`;
  window.LOGO = {PAL, MARKS, NOW, svg};
})();
