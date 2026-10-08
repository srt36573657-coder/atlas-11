/* ATLAS 11 · 배우 틀(규칙 35) — 신사 · 숙녀 두 사람
   사장님 2026-10-08 06:40 「이 세 캐릭터를 주식 캐릭터로 다시 만들어 곳곳에 재미난 표정 그리고 움직임을 넣어서 한편에 영화처럼」
     → 10:34(마카오 시각) 「로미오 줄리엣 그거 빼 해보니 엉망이다 그리고 캐릭터도 신사 숙녀다운 애들로 변경해 사람으로」
   배우 둘(사람 · 키 100 · 발끝 50,100):
     gent  신사 — 실크 모자(붉은 띠) · 남색 연미복 · 흰 셔츠 · 붉은 나비넥타이 · 흰 장갑 · 콧수염
     lady  숙녀 — 올림머리(금 핀) · 장밋빛 드레스(금 테) · 진주 목걸이 · 흰 긴 장갑 · 금 귀걸이
   표정(face): happy 웃음 · joy 활짝(눈웃음) · cheer 만세(반짝임) · sad 울상(눈물) · shock 깜짝(땀) · smug 으쓱 · angry 화남 · sleepy 졸림 · wink 윙크 · dizzy 어질
     — 판 자료로 고름(오르면 만세 · 내리면 울상 · 셀 날이 없으면 졸림 · 지어내지 않음) · love 는 joy 로 읽음(옛 이름)
   쓰는 법: actor('gent', {x, y, s, face, flip, cls, at, prop}) → SVG 글(발끝이 x · y · s = 크기 1 이면 키 100) · castDefs(p) 를 그 그림 <defs> 에 한 번
   움직임은 그림 틀(art.js) 그대로 — 걸음마다 data-at 하나 · 한 번에 하나 · 다 끝난 뒤 눈 깜빡임은 한 사람씩 차례로(movie.css)
   그림 속 글자는 없음(이름 · 숫자는 그림 밖 HTML — 73개 말) · 글 속 style 속성 없음(CSP) */
const F = v => (Math.round(v * 10) / 10).toFixed(1);

/** 배우 색(그라데이션) — 그림 하나에 한 번(p = 그 그림 이름표 앞말) */
export function castDefs(p) {
  const rg = (id, a, b, cx = '40%', cy = '32%') => `<radialGradient id="${p}-${id}" cx="${cx}" cy="${cy}" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const lg = (id, a, b) => `<linearGradient id="${p}-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<defs>${rg('sk', '#FFE6D6', '#F2C3A4')}${lg('st', '#3E4C86', '#232A52')}${lg('dr', '#E9779C', '#A93F68')}${lg('dr2', '#F7A8C2', '#D9668E')}${lg('gd', '#FFE7A3', '#F2B33D')}`
    + `<radialGradient id="${p}-ck" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF7E9E" stop-opacity=".5"/><stop offset="1" stop-color="#FF7E9E" stop-opacity="0"/></radialGradient></defs>`;
}

/* ── 얼굴 부품 ── */
const INK = '#2B1B3A';
const dot = (x, y, r) => `<circle cx="${F(x)}" cy="${F(y)}" r="${F(r * 0.62)}" fill="#fff"/><circle cx="${F(x)}" cy="${F(y + r * 0.08)}" r="${F(r)}" fill="#2A1C33"/><circle cx="${F(x + r * 0.34)}" cy="${F(y - r * 0.36)}" r="${F(r * 0.36)}" fill="#fff"/>`;
const arcUp = (x, y, r, w) => `<path d="M${F(x - r)},${F(y + r * 0.25)} Q${F(x)},${F(y - r * 0.85)} ${F(x + r)},${F(y + r * 0.25)}" fill="none" stroke="${INK}" stroke-width="${F(w)}" stroke-linecap="round"/>`;
const arcDn = (x, y, r, w) => `<path d="M${F(x - r)},${F(y - r * 0.2)} Q${F(x)},${F(y + r * 0.8)} ${F(x + r)},${F(y - r * 0.2)}" fill="none" stroke="${INK}" stroke-width="${F(w)}" stroke-linecap="round"/>`;
const drop = (x, y, r, fill = '#8FD3FF') => `<path d="M${F(x)},${F(y - r * 1.6)} C${F(x + r)},${F(y - r * 0.2)} ${F(x + r)},${F(y + r)} ${F(x)},${F(y + r)} C${F(x - r)},${F(y + r)} ${F(x - r)},${F(y - r * 0.2)} ${F(x)},${F(y - r * 1.6)}Z" fill="${fill}" stroke="#fff" stroke-opacity=".7" stroke-width=".6"/>`;
const zz = (x, y, k = 1) => `<path d="M${F(x)},${F(y)} h${F(5 * k)} l-${F(5 * k)},${F(5 * k)} h${F(5 * k)} M${F(x + 8 * k)},${F(y - 8 * k)} h${F(3.6 * k)} l-${F(3.6 * k)},${F(3.6 * k)} h${F(3.6 * k)}" fill="none" stroke="#C9C2FF" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`;
const spark = (x, y, r, fill = '#FFE38A') => `<path d="M${F(x)},${F(y - r)} Q${F(x + r * 0.18)},${F(y - r * 0.18)} ${F(x + r)},${F(y)} Q${F(x + r * 0.18)},${F(y + r * 0.18)} ${F(x)},${F(y + r)} Q${F(x - r * 0.18)},${F(y + r * 0.18)} ${F(x - r)},${F(y)} Q${F(x - r * 0.18)},${F(y - r * 0.18)} ${F(x)},${F(y - r)}Z" fill="${fill}"/>`;
const spiral = (x, y, r) => `<path d="M${F(x)},${F(y)} m0,-${F(r * 0.25)} a${F(r * 0.25)},${F(r * 0.25)} 0 1 1 -${F(r * 0.01)},0 m0,-${F(r * 0.4)} a${F(r * 0.65)},${F(r * 0.65)} 0 1 1 -${F(r * 0.02)},0" fill="none" stroke="${INK}" stroke-width="1.1"/>`;

/** 얼굴 — e1 · e2 = 눈 자리 · ey · r = 눈 크기 · m = 입 자리 · w = 입 너비 · cy = 볼 · lash = 속눈썹(숙녀) · br = 눈썹 높이 */
function face(kind, {e1, e2, ey, r, mx, my, w, cy, lash = false, skin}) {
  const sw = Math.max(0.9, r * 0.45);
  const cheeks = `<ellipse cx="${F(e1 - r * 1.2)}" cy="${F(cy)}" rx="${F(r * 1.6)}" ry="${F(r * 0.95)}" fill="url(#PFX-ck)"/><ellipse cx="${F(e2 + r * 1.2)}" cy="${F(cy)}" rx="${F(r * 1.6)}" ry="${F(r * 0.95)}" fill="url(#PFX-ck)"/>`;
  const brow = (x, tilt = 0, lift = 0) => `<path d="M${F(x - r * 1.3)},${F(ey - r * 2.1 - lift + tilt)} Q${F(x)},${F(ey - r * 2.7 - lift)} ${F(x + r * 1.3)},${F(ey - r * 2.1 - lift - tilt)}" fill="none" stroke="#4A3226" stroke-width="${F(sw * 0.9)}" stroke-linecap="round"/>`;
  const brows = (t = 0, lift = 0) => brow(e1, t, lift) + brow(e2, -t, lift);
  const lashes = lash ? `<path d="M${F(e1 - r * 1.1)},${F(ey - r * 0.7)} l-${F(r * 0.7)},-${F(r * 0.5)} M${F(e2 + r * 1.1)},${F(ey - r * 0.7)} l${F(r * 0.7)},-${F(r * 0.5)}" stroke="${INK}" stroke-width="${F(sw * 0.8)}" stroke-linecap="round"/>` : '';
  const smile = `<path d="M${F(mx - w)},${F(my)} Q${F(mx)},${F(my + w * 1.1)} ${F(mx + w)},${F(my)} Q${F(mx)},${F(my + w * 0.4)} ${F(mx - w)},${F(my)}Z" fill="#8C2F4E"/>`;
  const grin = `<path d="M${F(mx - w * 1.25)},${F(my - w * 0.1)} Q${F(mx)},${F(my + w * 1.5)} ${F(mx + w * 1.25)},${F(my - w * 0.1)} Z" fill="#8C2F4E"/><path d="M${F(mx - w * 0.55)},${F(my + w * 0.55)} Q${F(mx)},${F(my + w * 0.95)} ${F(mx + w * 0.55)},${F(my + w * 0.55)}Z" fill="#FF8FAE"/>`;
  const small = `<path d="M${F(mx - w * 0.6)},${F(my + w * 0.1)} Q${F(mx)},${F(my + w * 0.6)} ${F(mx + w * 0.6)},${F(my + w * 0.1)}" fill="none" stroke="#8C2F4E" stroke-width="${F(sw)}" stroke-linecap="round"/>`;
  const frown = `<path d="M${F(mx - w * 0.6)},${F(my + w * 0.5)} Q${F(mx)},${F(my - w * 0.1)} ${F(mx + w * 0.6)},${F(my + w * 0.5)}" fill="none" stroke="#8C2F4E" stroke-width="${F(sw)}" stroke-linecap="round"/>`;
  const oh = `<ellipse cx="${F(mx)}" cy="${F(my + w * 0.35)}" rx="${F(w * 0.42)}" ry="${F(w * 0.55)}" fill="#8C2F4E"/>`;
  const zig = `<path d="M${F(mx - w * 0.7)},${F(my + w * 0.3)} l${F(w * 0.35)},-${F(w * 0.3)} l${F(w * 0.35)},${F(w * 0.3)} l${F(w * 0.35)},-${F(w * 0.3)} l${F(w * 0.35)},${F(w * 0.3)}" fill="none" stroke="#8C2F4E" stroke-width="${F(sw)}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const smirk = `<path d="M${F(mx - w * 0.55)},${F(my + w * 0.2)} Q${F(mx + w * 0.1)},${F(my + w * 0.55)} ${F(mx + w * 0.7)},${F(my - w * 0.15)}" fill="none" stroke="#8C2F4E" stroke-width="${F(sw)}" stroke-linecap="round"/>`;
  const lid = x => `<path d="M${F(x - r * 1.2)},${F(ey - r * 0.1)} L${F(x + r * 1.2)},${F(ey - r * 0.1)} L${F(x + r * 1.2)},${F(ey - r * 1.4)} L${F(x - r * 1.2)},${F(ey - r * 1.4)}Z" fill="${skin}"/><path d="M${F(x - r * 1.2)},${F(ey - r * 0.1)} L${F(x + r * 1.2)},${F(ey - r * 0.1)}" stroke="${INK}" stroke-width="${F(sw)}" stroke-linecap="round"/>`;
  const eyes = `<g class="ci-blink">${dot(e1, ey, r)}${dot(e2, ey, r)}</g>`;
  switch (kind) {
    case 'joy': case 'love': return cheeks + brows(0, r * 0.3) + arcUp(e1, ey, r * 1.1, sw) + arcUp(e2, ey, r * 1.1, sw) + lashes + grin;
    case 'cheer': return cheeks + brows(0, r * 0.4) + arcUp(e1, ey, r * 1.1, sw) + arcUp(e2, ey, r * 1.1, sw) + lashes + grin + spark(e1 - r * 4.2, ey - r * 3.6, r * 1.3) + spark(e2 + r * 4.4, ey - r * 3, r * 1);
    case 'shock': return cheeks + brows(0, r * 0.8) + `<circle cx="${F(e1)}" cy="${F(ey)}" r="${F(r * 1.25)}" fill="#fff" stroke="${INK}" stroke-width="${F(sw * 0.7)}"/><circle cx="${F(e1)}" cy="${F(ey)}" r="${F(r * 0.45)}" fill="#1B1230"/><circle cx="${F(e2)}" cy="${F(ey)}" r="${F(r * 1.25)}" fill="#fff" stroke="${INK}" stroke-width="${F(sw * 0.7)}"/><circle cx="${F(e2)}" cy="${F(ey)}" r="${F(r * 0.45)}" fill="#1B1230"/>` + oh + drop(e2 + r * 4.4, ey - r * 1.4, r * 0.9);
    case 'sad': return cheeks + brows(-r * 0.6) + arcDn(e1, ey, r, sw) + arcDn(e2, ey, r, sw) + lashes + frown + drop(e1 - r * 0.3, ey + r * 2.4, r * 0.75);
    case 'smug': return cheeks + brows(r * 0.2) + dot(e1, ey, r) + dot(e2, ey, r) + lid(e1) + lid(e2) + smirk;
    case 'angry': return brows(r * 0.9) + dot(e1, ey, r) + dot(e2, ey, r) + zig + `<path d="M${F(e2 + r * 3)},${F(ey - r * 4)} l${F(r)},${F(r)} m0,-${F(r)} l-${F(r)},${F(r)}" stroke="#FF4D6D" stroke-width="${F(sw)}" stroke-linecap="round"/>`;
    case 'sleepy': return cheeks + brows() + arcDn(e1, ey, r * 0.9, sw) + arcDn(e2, ey, r * 0.9, sw) + lashes + small + zz(e2 + r * 4, ey - r * 4.5, 0.8);
    case 'wink': return cheeks + brows(0, r * 0.2) + dot(e1, ey, r) + arcUp(e2, ey, r * 1.1, sw) + lashes + smile;
    case 'dizzy': return cheeks + brows(-r * 0.3) + spiral(e1, ey, r * 1.5) + spiral(e2, ey, r * 1.5) + oh;
    default: return cheeks + brows() + eyes + lashes + smile; // happy
  }
}

/* ── 사람 몸(발끝 50,100 · 키 100) ── */
function gentBody(P, f, prop) {
  return `<g>`
    + `<ellipse cx="50" cy="99" rx="17" ry="2.8" fill="#000" fill-opacity=".24"/>`
    + `<path d="M36,62 C31,72 30,84 33,92 L40,92 L41,70Z M64,62 C69,72 70,84 67,92 L60,92 L59,70Z" fill="#1F2546"/>` // 연미복 꼬리
    + `<rect x="42" y="74" width="7.4" height="22" rx="2.4" fill="#262C50"/><rect x="50.6" y="74" width="7.4" height="22" rx="2.4" fill="#262C50"/>`
    + `<ellipse cx="44.6" cy="97.4" rx="6" ry="2.6" fill="#15111F"/><ellipse cx="55.4" cy="97.4" rx="6" ry="2.6" fill="#15111F"/><path d="M41,96.6 h4 M52,96.6 h4" stroke="#fff" stroke-opacity=".35" stroke-width=".8" stroke-linecap="round"/>`
    + `<path d="M35,56 Q50,51 65,56 L63,79 Q50,82 37,79Z" fill="url(#${P}-st)"/>` // 연미복
    + `<path d="M45,55 L55,55 L50,73Z" fill="#F7F4EE"/><path d="M45,55 L50,73 L40.5,63Z" fill="#1A2042"/><path d="M55,55 L50,73 L59.5,63Z" fill="#1A2042"/>` // 셔츠 · 옷깃
    + `<circle cx="50" cy="66" r=".9" fill="#2B2B3A"/><circle cx="50" cy="70" r=".9" fill="#2B2B3A"/><circle cx="47.4" cy="76" r="1.1" fill="#E6C77A"/><circle cx="52.6" cy="76" r="1.1" fill="#E6C77A"/>`
    + `<path d="M50,57.2 L44.6,54.4 L44.6,60 Z M50,57.2 L55.4,54.4 L55.4,60 Z" fill="#C8324F"/><circle cx="50" cy="57.2" r="1.5" fill="#9E1F3B"/>` // 나비넥타이
    + `<path d="M36.5,57 C32,62 30.5,70 31,76" fill="none" stroke="url(#${P}-st)" stroke-width="6.4" stroke-linecap="round"/><path d="M63.5,57 C68,62 69.5,70 69,76" fill="none" stroke="url(#${P}-st)" stroke-width="6.4" stroke-linecap="round"/>`
    + `<circle cx="31" cy="78" r="3.4" fill="#FBFAF6"/><circle cx="69" cy="78" r="3.4" fill="#FBFAF6"/>` // 흰 장갑
    + `<rect x="46.5" y="47" width="7" height="6" rx="2" fill="url(#${P}-sk)"/>`
    + `<circle cx="33.5" cy="35" r="3.3" fill="#F2C3A4"/><circle cx="66.5" cy="35" r="3.3" fill="#F2C3A4"/>`
    + `<circle cx="50" cy="34" r="16.5" fill="url(#${P}-sk)"/>`
    + `<path d="M34.2,30 C35,21 42,18.5 50,18.5 C58,18.5 65,21 65.8,30 C61,26.5 56,25.6 51,25.8 C48,24.2 41,25.6 34.2,30Z" fill="#3A2A22"/>` // 가르마 머리
    + `<path d="M30,20.6 C30,18.4 70,18.4 70,20.6 C70,23 30,23 30,20.6Z" fill="#1C1626"/><path d="M37.5,20 L38.6,3.2 C42,1.8 58,1.8 61.4,3.2 L62.5,20Z" fill="#22202F"/><path d="M38.1,14.5 L61.9,14.5 L62.2,18.6 L37.8,18.6Z" fill="#C8324F"/><path d="M41,4.6 C44,3.6 47,3.4 49,3.5" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.2" stroke-linecap="round"/>` // 실크 모자
    + face(f, {e1: 43.4, e2: 56.6, ey: 33.6, r: 2.9, mx: 50, my: 43.6, w: 4.1, cy: 39.4, skin: '#F7CFB4'}).replaceAll('PFX', P)
    + `<path d="M50,39.2 C47.8,38.3 45,39 44.2,40.8 C46,40.2 47.8,40.5 50,40.3 C52.2,40.5 54,40.2 55.8,40.8 C55,39 52.2,38.3 50,39.2Z" fill="#3A2A22"/>` // 콧수염
    + (prop || '') + `</g>`;
}
function ladyBody(P, f, prop) {
  return `<g>`
    + `<ellipse cx="50" cy="99" rx="23" ry="3" fill="#000" fill-opacity=".24"/>`
    + `<path d="M41,60 L59,60 C64,72 72,86 76,96.5 Q50,101.5 24,96.5 C28,86 36,72 41,60Z" fill="url(#${P}-dr)"/>` // 드레스 치마
    + `<path d="M24.6,96 Q50,100.8 75.4,96" fill="none" stroke="#F2C46B" stroke-width="1.4"/><path d="M44,64 C42,76 38,88 36,97 M56,64 C58,76 62,88 64,97" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.2"/>`
    + `<path d="M40.5,52 Q50,49.5 59.5,52 L58.6,62 Q50,64 41.4,62Z" fill="url(#${P}-dr)"/><path d="M40.5,52 Q45,55.5 50,53 Q55,55.5 59.5,52" fill="none" stroke="#F7A8C2" stroke-width="1.2"/>` // 윗옷 · 목선
    + `<path d="M41.4,62 Q50,64.6 58.6,62" fill="none" stroke="#F2C46B" stroke-width="1.6"/>` // 금 허리띠
    + `<circle cx="38.5" cy="53.5" r="4.6" fill="url(#${P}-dr2)"/><circle cx="61.5" cy="53.5" r="4.6" fill="url(#${P}-dr2)"/>` // 볼록 소매
    + `<path d="M36.2,57 C33.5,63 32.5,69 33,74" fill="none" stroke="#FBFAF6" stroke-width="3.8" stroke-linecap="round"/><path d="M63.8,57 C66.5,63 67.5,69 67,74" fill="none" stroke="#FBFAF6" stroke-width="3.8" stroke-linecap="round"/>` // 긴 장갑
    + `<rect x="46.6" y="45.5" width="6.8" height="6" rx="2" fill="url(#${P}-sk)"/>`
    + `<g fill="#FFFDF5" stroke="#D9CFC0" stroke-width=".3">${[[44.6, 50.6], [46.8, 51.6], [49, 52.1], [51.2, 52.1], [53.4, 51.6], [55.6, 50.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.05"/>`).join('')}</g>` // 진주 목걸이
    + `<path d="M33.2,30 C31,42 33,50 38,52 C36,44 36,37 37.6,31Z M66.8,30 C69,42 67,50 62,52 C64,44 64,37 62.4,31Z" fill="#6B3E26"/>` // 뒤 머리 · 옆 웨이브
    + `<circle cx="50" cy="33" r="16" fill="url(#${P}-sk)"/>`
    + `<circle cx="50" cy="13.6" r="7.6" fill="#7A4A2A"/><path d="M44.5,9.6 C47,7.6 53,7.6 55.5,9.6" fill="none" stroke="#9C6640" stroke-width="1.2" stroke-linecap="round"/><path d="M56.4,10.4 L61,6.6" stroke="#F2C46B" stroke-width="1.4" stroke-linecap="round"/><circle cx="61.4" cy="6.2" r="1.6" fill="url(#${P}-gd)"/>` // 올림머리 · 금 핀
    + `<path d="M34,31 C34.4,21 42,17.2 50,17.2 C58,17.2 65.6,21 66,31 C62,25.4 57,23.6 52,24.2 C49,22.4 42,23.4 34,31Z" fill="#7A4A2A"/><path d="M36,30.6 C37,35 36.4,38.6 34.6,41" fill="none" stroke="#7A4A2A" stroke-width="2.4" stroke-linecap="round"/><path d="M64,30.6 C63,35 63.6,38.6 65.4,41" fill="none" stroke="#7A4A2A" stroke-width="2.4" stroke-linecap="round"/>` // 앞머리 · 귀밑 웨이브
    + `<circle cx="34.6" cy="40.6" r="1.3" fill="url(#${P}-gd)"/><circle cx="65.4" cy="40.6" r="1.3" fill="url(#${P}-gd)"/>` // 금 귀걸이
    + face(f, {e1: 43.6, e2: 56.4, ey: 33.2, r: 2.9, mx: 50, my: 41.4, w: 3.5, cy: 38.6, lash: true, skin: '#F7CFB4'}).replaceAll('PFX', P)
    + ``
    + (prop || '') + `</g>`;
}

/* ── 소품(손 · 머리 위) — 몸 안 좌표(키 100) · 오른손 69,78 · 왼손 31,78 ── */
export const PROP = {
  coin: `<g transform="translate(72,74)"><circle r="6.4" fill="url(#PFX-gd)" stroke="#C8891E" stroke-width="1"/><circle r="4.2" fill="none" stroke="#C8891E" stroke-width=".8"/><path d="M-1.8,-2.8 v5.6 M1.8,-2.8 v5.6 M-2.7,-.7 h5.4" stroke="#B87612" stroke-width=".9"/></g>`,
  cane: `<g><path d="M30.6,79 L27.4,99" stroke="#2A1F2E" stroke-width="2" stroke-linecap="round"/><path d="M30.6,79 C30.8,75.4 34.6,75 35.2,77.6" fill="none" stroke="#C9A24A" stroke-width="2" stroke-linecap="round"/></g>`,
  flag: `<g transform="translate(70,79)"><path d="M0,0 v-40" stroke="#C9B49A" stroke-width="1.6"/><path d="M0,-40 l16,5.5 l-16,5.5Z" fill="#FF5C8A"/></g>`,
  mask: `<g transform="translate(50,33.6) scale(.62)"><path d="M-22,-3 C-18,-10 -6,-9 -1,-3 C1,-5 4,-5 6,-3 C11,-9 23,-10 26,-3 C24,6 10,8 5,2 C3,0 -1,0 -3,2 C-8,8 -21,6 -22,-3Z" fill="#7C4DCC" fill-opacity=".92" stroke="#FFD166" stroke-width="1.2"/><path d="M26,-3 l10,-12" stroke="#FFD166" stroke-width="1.6" stroke-linecap="round"/></g>`,
  watch: `<g transform="translate(72,73)"><path d="M0,-6.4 v-3" stroke="#C8891E" stroke-width="1.2"/><circle r="5.8" fill="url(#PFX-gd)" stroke="#C8891E" stroke-width="1"/><circle r="4.2" fill="#FFFBEF"/><path d="M0,0 V-3 M0,0 L2.2,1.4" stroke="#2A1F2E" stroke-width=".8" stroke-linecap="round"/></g>`,
  fan: `<g transform="translate(70,74) rotate(-20)"><path d="M0,0 L-9,-11 A14,14 0 0 1 9,-11 Z" fill="#F7A8C2" stroke="#F2C46B" stroke-width=".8"/><path d="M0,0 L-4,-13 M0,0 L0,-14 M0,0 L4,-13" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/></g>`,
  zzz: zz(68, 14, 1),
  sweat: drop(70, 26, 2.6),
  spark: spark(76, 14, 4.2) + spark(22, 20, 3),
};

/** 배우 한 명 — who: gent(신사) · lady(숙녀) · face · x,y = 발끝 · s = 크기(1 = 키 100) · flip = 왼쪽 보기 · cls/at = 움직임(art.js) · prop = PROP 이름들 · v = data-v(움직임 값) */
export function actor(who, {x, y, s = 1, face: f = 'happy', flip = false, cls = '', at = null, prop = [], v = null, idle = 0, P = 'ak'} = {}) {
  const w = who === 'lady' ? 'lady' : 'gent'; // 옛 이름(pig · cat · hog)이 남아 있어도 사람으로
  const props = [].concat(prop).filter(Boolean).map(n => (PROP[n] ?? '').replaceAll('PFX', P)).join('');
  const body = w === 'lady' ? ladyBody(P, f, props) : gentBody(P, f, props);
  const tf = `translate(${F(x - 50 * s * (flip ? -1 : 1))},${F(y - 100 * s)}) scale(${F(s * (flip ? -1 : 1))},${F(s)})`;
  const attr = `${cls ? ` class="${cls}"` : ''}${at != null ? ` data-at="${at}"` : ''}${v ? ` data-v="${v}"` : ''}`;
  return `<g${attr}><g class="ci ci-${w} ci-i${idle}" transform="${tf}">${body}</g></g>`;
}
/** 무대 색(그림 하나에 한 번 — art.js defs 가 함께 넣음) */
export const stageDefs = p => `<defs><linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1F5C"/><stop offset="1" stop-color="#4B3B9A"/></linearGradient>`
  + `<radialGradient id="${p}-spot" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#FFF6D6" stop-opacity=".26"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient>`
  + `<linearGradient id="${p}-cur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E1730"/><stop offset=".5" stop-color="#C02A48"/><stop offset="1" stop-color="#7E1730"/></linearGradient></defs>`;
/** 무대(극장) — 보라 하늘 · 비추는 빛 · 양쪽 붉은 막 · 위 주름 막 · 바닥(H = 그림 높이 · 움직이지 않음) */
export function stage(p, H, {floor = true, spot = 0.5} = {}) {
  const fy = H - 14, cw = 16;
  return `<rect x="0" y="0" width="360" height="${H}" fill="url(#${p}-sky)"/>`
    + `<path d="M${F(180 - 140 * spot)},0 L${F(180 + 140 * spot)},0 L${F(180 + 300 * spot)},${fy} L${F(180 - 300 * spot)},${fy}Z" fill="url(#${p}-spot)"/>`
    + (floor ? `<path d="M0,${fy} H360 V${H} H0Z" fill="#231A4B"/><path d="M0,${fy} H360" stroke="#8E7BFF" stroke-opacity=".35" stroke-width="1.2"/>` : '')
    + `<path d="M0,0 H${cw + 6} C${cw},30 ${cw + 6},${F(H * 0.45)} ${cw - 4},${F(H * 0.62)} C8,${F(H * 0.7)} 4,${F(H * 0.66)} 0,${F(H * 0.72)}Z" fill="url(#${p}-cur)"/>`
    + `<path d="M360,0 H${360 - cw - 6} C${360 - cw},30 ${360 - cw - 6},${F(H * 0.45)} ${364 - cw},${F(H * 0.62)} C352,${F(H * 0.7)} 356,${F(H * 0.66)} 360,${F(H * 0.72)}Z" fill="url(#${p}-cur)"/>`
    + `<path d="M0,0 H360 V7 C300,13 240,5 180,10 C120,5 60,13 0,7Z" fill="#9E1F3B"/>`;
}
