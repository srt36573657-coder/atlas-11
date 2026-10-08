/* ATLAS 11 · 배우 틀(규칙 35) — 사장님 2026-10-08 06:40 「청자로 하지 말고 이 세 캐릭터를 주식 캐릭터로 다시 만들어 곳곳에 재미난 표정 그리고 움직임을 넣어서 한편에 영화처럼 만들어라
   영화는 로미오 줄리엣을 토대로 각본하고 현재 주식상황을 위트있게 표현하라」 · 06:42 「10배 빠르면서도 10배 정교한 구조를 먼저」
   배우 셋(사장님이 보내 주신 그림 셋을 SVG 로 다시 그림 — 둥근 머리 · 큰 눈 · 볼 · 파스텔):
     pig  분홍 돼지 = 로미오 = 돈(돼지저금통 · 정수리 동전 구멍 · 검은 앞머리) — 빠지는 업종에서 몰래 나와 들어가는 업종으로
     cat  리본 흰 고양이 = 줄리엣 = 돈이 들어가는 업종(분홍 리본 · 파란 눈)
     hog  보라 고슴도치 = 티볼트 = 포모(가시가 곤두설수록 포모값이 높음 · 주황 코)
   표정(face): happy 웃음 · love 하트 눈 · shock 깜짝 · sad 울상 · smug 으쓱 · angry 화남 · sleepy 졸림 · wink 윙크 · dizzy 어질 · cheer 만세
   쓰는 법: actor('pig', {x, y, s, face, flip, cls, at, prop}) → SVG 글(발끝이 x · y · s = 크기 1 이면 키 100) · castDefs(p) 를 그 그림 <defs> 에 한 번
   움직임은 그림 틀(art.js) 그대로 — 걸음마다 data-at 하나 · 한 번에 하나(cls: ak-pop · ak-mv · ak-hop · ak-wig · ak-shake · ak-bristle) · 다 끝난 뒤 눈 깜빡임은 한 배우씩 차례로(겹치지 않게)
   그림 속 글자는 없음(이름 · 숫자는 그림 밖 HTML — 73개 말) */
const F = v => (Math.round(v * 10) / 10).toFixed(1);

/** 배우 색(그라데이션) — 그림 하나에 한 번(p = 그 그림 이름표 앞말) */
export function castDefs(p) {
  const rg = (id, a, b, cx = '38%', cy = '32%') => `<radialGradient id="${p}-${id}" cx="${cx}" cy="${cy}" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  return `<defs>${rg('pk', '#FFE3EA', '#F09AB0')}${rg('pkb', '#FFD6DF', '#E98AA2')}${rg('wh', '#FFFFFF', '#DCD6EE')}${rg('pe', '#FFF1EA', '#F3C4B4')}${rg('pu', '#E9C7FF', '#9A5BE0', '45%', '25%')}`
    + `<linearGradient id="${p}-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#F2B33D"/></linearGradient>`
    + `<radialGradient id="${p}-ck" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF6F9A" stop-opacity=".55"/><stop offset="1" stop-color="#FF6F9A" stop-opacity="0"/></radialGradient></defs>`;
}

/* ── 얼굴 부품 — 눈 두 개 자리(e1 · e2) · 크기(r) · 입 자리(m) ── */
const eyeRound = (x, y, r, iris) => `<circle cx="${F(x)}" cy="${F(y)}" r="${F(r)}" fill="${iris}"/><circle cx="${F(x)}" cy="${F(y + r * 0.08)}" r="${F(r * 0.55)}" fill="#1B1230"/><circle cx="${F(x + r * 0.32)}" cy="${F(y - r * 0.36)}" r="${F(r * 0.34)}" fill="#fff"/><circle cx="${F(x - r * 0.38)}" cy="${F(y + r * 0.34)}" r="${F(r * 0.15)}" fill="#fff" fill-opacity=".8"/>`;
const heart = (x, y, r, fill = '#FF5C8A') => `<path d="M${F(x)},${F(y + r * 0.9)} C${F(x - r * 1.5)},${F(y - r * 0.1)} ${F(x - r * 0.9)},${F(y - r * 1.25)} ${F(x)},${F(y - r * 0.45)} C${F(x + r * 0.9)},${F(y - r * 1.25)} ${F(x + r * 1.5)},${F(y - r * 0.1)} ${F(x)},${F(y + r * 0.9)}Z" fill="${fill}"/>`;
const arcUp = (x, y, r, w = 2.2) => `<path d="M${F(x - r)},${F(y + r * 0.2)} Q${F(x)},${F(y - r * 0.9)} ${F(x + r)},${F(y + r * 0.2)}" fill="none" stroke="#2B1B3A" stroke-width="${w}" stroke-linecap="round"/>`;
const arcDn = (x, y, r, w = 2.2) => `<path d="M${F(x - r)},${F(y - r * 0.2)} Q${F(x)},${F(y + r * 0.8)} ${F(x + r)},${F(y - r * 0.2)}" fill="none" stroke="#2B1B3A" stroke-width="${w}" stroke-linecap="round"/>`;
const spiral = (x, y, r) => `<path d="M${F(x)},${F(y)} m0,-${F(r * 0.2)} a${F(r * 0.2)},${F(r * 0.2)} 0 1 1 -${F(r * 0.01)},0 m0,-${F(r * 0.35)} a${F(r * 0.55)},${F(r * 0.55)} 0 1 1 -${F(r * 0.02)},0 m0,-${F(r * 0.4)} a${F(r * 0.95)},${F(r * 0.95)} 0 1 1 -${F(r * 0.02)},0" fill="none" stroke="#2B1B3A" stroke-width="1.6"/>`;
const drop = (x, y, r, fill = '#8FD3FF') => `<path d="M${F(x)},${F(y - r * 1.6)} C${F(x + r)},${F(y - r * 0.2)} ${F(x + r)},${F(y + r)} ${F(x)},${F(y + r)} C${F(x - r)},${F(y + r)} ${F(x - r)},${F(y - r * 0.2)} ${F(x)},${F(y - r * 1.6)}Z" fill="${fill}" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>`;
const zz = (x, y, k = 1) => `<path d="M${F(x)},${F(y)} h${F(6 * k)} l-${F(6 * k)},${F(6 * k)} h${F(6 * k)} M${F(x + 9 * k)},${F(y - 9 * k)} h${F(4 * k)} l-${F(4 * k)},${F(4 * k)} h${F(4 * k)}" fill="none" stroke="#C9C2FF" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`;
const spark = (x, y, r, fill = '#FFE38A') => `<path d="M${F(x)},${F(y - r)} Q${F(x + r * 0.18)},${F(y - r * 0.18)} ${F(x + r)},${F(y)} Q${F(x + r * 0.18)},${F(y + r * 0.18)} ${F(x)},${F(y + r)} Q${F(x - r * 0.18)},${F(y + r * 0.18)} ${F(x - r)},${F(y)} Q${F(x - r * 0.18)},${F(y - r * 0.18)} ${F(x)},${F(y - r)}Z" fill="${fill}"/>`;

/** 얼굴 — face 이름 · 눈(ex1 · ex2 · ey · r · iris) · 입(mx · my · w) · 볼(cy) */
function face(kind, {ex1, ex2, ey, r, iris, mx, my, w, cy, skin}) {
  const cheeks = `<ellipse cx="${F(ex1 - r * 0.6)}" cy="${F(cy)}" rx="${F(r * 1.15)}" ry="${F(r * 0.7)}" fill="url(#PFX-ck)"/><ellipse cx="${F(ex2 + r * 0.6)}" cy="${F(cy)}" rx="${F(r * 1.15)}" ry="${F(r * 0.7)}" fill="url(#PFX-ck)"/>`;
  const smile = `<path d="M${F(mx - w)},${F(my)} Q${F(mx)},${F(my + w * 1.15)} ${F(mx + w)},${F(my)} Q${F(mx)},${F(my + w * 0.45)} ${F(mx - w)},${F(my)}Z" fill="#7A2E4A"/><path d="M${F(mx - w * 0.45)},${F(my + w * 0.55)} Q${F(mx)},${F(my + w * 0.95)} ${F(mx + w * 0.45)},${F(my + w * 0.55)}Z" fill="#FF8FAE"/>`;
  const small = `<path d="M${F(mx - w * 0.55)},${F(my)} Q${F(mx)},${F(my + w * 0.55)} ${F(mx + w * 0.55)},${F(my)}" fill="none" stroke="#7A2E4A" stroke-width="1.6" stroke-linecap="round"/>`;
  const frown = `<path d="M${F(mx - w * 0.55)},${F(my + w * 0.4)} Q${F(mx)},${F(my - w * 0.15)} ${F(mx + w * 0.55)},${F(my + w * 0.4)}" fill="none" stroke="#7A2E4A" stroke-width="1.8" stroke-linecap="round"/>`;
  const oh = `<ellipse cx="${F(mx)}" cy="${F(my + w * 0.3)}" rx="${F(w * 0.38)}" ry="${F(w * 0.5)}" fill="#7A2E4A"/>`;
  const zig = `<path d="M${F(mx - w * 0.6)},${F(my + w * 0.2)} l${F(w * 0.3)},-${F(w * 0.25)} l${F(w * 0.3)},${F(w * 0.25)} l${F(w * 0.3)},-${F(w * 0.25)} l${F(w * 0.3)},${F(w * 0.25)}" fill="none" stroke="#7A2E4A" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;
  const smirk = `<path d="M${F(mx - w * 0.5)},${F(my + w * 0.15)} Q${F(mx + w * 0.1)},${F(my + w * 0.45)} ${F(mx + w * 0.62)},${F(my - w * 0.12)}" fill="none" stroke="#7A2E4A" stroke-width="1.8" stroke-linecap="round"/>`;
  const brow = (x, y, tilt) => `<path d="M${F(x - r * 0.9)},${F(y - r * 1.25 - tilt)} L${F(x + r * 0.9)},${F(y - r * 1.25 + tilt)}" stroke="#2B1B3A" stroke-width="2" stroke-linecap="round"/>`;
  const lid = (x, y) => `<path d="M${F(x - r * 1.05)},${F(y - r * 0.15)} L${F(x + r * 1.05)},${F(y - r * 0.15)} L${F(x + r * 1.05)},${F(y - r * 1.2)} L${F(x - r * 1.05)},${F(y - r * 1.2)}Z" fill="${skin}"/><path d="M${F(x - r * 1.05)},${F(y - r * 0.15)} L${F(x + r * 1.05)},${F(y - r * 0.15)}" stroke="#2B1B3A" stroke-width="1.8" stroke-linecap="round"/>`;
  const eyes = eyeRound(ex1, ey, r, iris) + eyeRound(ex2, ey, r, iris);
  const blink = `<g class="ci-blink">${eyes}</g>`; // 다 끝난 뒤 깜빡임(한 배우씩 · movie.css)
  switch (kind) {
    case 'love': return cheeks + heart(ex1, ey, r * 1.05) + heart(ex2, ey, r * 1.05) + smile;
    case 'shock': return cheeks + `<circle cx="${F(ex1)}" cy="${F(ey)}" r="${F(r * 1.05)}" fill="#fff" stroke="#2B1B3A" stroke-width="1.4"/><circle cx="${F(ex1)}" cy="${F(ey)}" r="${F(r * 0.35)}" fill="#1B1230"/><circle cx="${F(ex2)}" cy="${F(ey)}" r="${F(r * 1.05)}" fill="#fff" stroke="#2B1B3A" stroke-width="1.4"/><circle cx="${F(ex2)}" cy="${F(ey)}" r="${F(r * 0.35)}" fill="#1B1230"/>` + oh + drop(ex2 + r * 2.4, ey - r * 0.6, r * 0.55);
    case 'sad': return cheeks + arcDn(ex1, ey, r * 0.85) + arcDn(ex2, ey, r * 0.85) + brow(ex1, ey + r * 0.4, r * 0.35) + brow(ex2, ey + r * 0.4, -r * 0.35) + frown + drop(ex1 - r * 0.2, ey + r * 1.6, r * 0.42);
    case 'smug': return cheeks + eyes + lid(ex1, ey) + lid(ex2, ey) + smirk;
    case 'angry': return eyes + brow(ex1, ey, -r * 0.45) + brow(ex2, ey, r * 0.45) + zig + `<path d="M${F(ex2 + r * 1.6)},${F(ey - r * 2.2)} l${F(r * 0.5)},${F(r * 0.5)} m0,-${F(r * 0.5)} l-${F(r * 0.5)},${F(r * 0.5)} m${F(r * 0.85)},-${F(r * 0.15)} l${F(r * 0.45)},${F(r * 0.45)} m0,-${F(r * 0.45)} l-${F(r * 0.45)},${F(r * 0.45)}" stroke="#FF4D6D" stroke-width="1.6" stroke-linecap="round"/>`;
    case 'sleepy': return cheeks + arcDn(ex1, ey, r * 0.8) + arcDn(ex2, ey, r * 0.8) + small + zz(ex2 + r * 2.2, ey - r * 2.2, 0.8);
    case 'wink': return cheeks + eyeRound(ex1, ey, r, iris) + arcUp(ex2, ey, r * 0.85) + smile;
    case 'dizzy': return cheeks + spiral(ex1, ey, r) + spiral(ex2, ey, r) + oh;
    case 'cheer': return cheeks + arcUp(ex1, ey, r * 0.85) + arcUp(ex2, ey, r * 0.85) + smile + spark(ex1 - r * 2.6, ey - r * 2.4, r * 0.8) + spark(ex2 + r * 2.8, ey - r * 2, r * 0.6);
    default: return cheeks + blink + smile; // happy
  }
}

/* ── 배우 몸(발끝 50,100 · 키 100) ── */
function pigBody(P, f, prop) {
  return `<g>`
    + `<ellipse cx="50" cy="99" rx="21" ry="3.2" fill="#000" fill-opacity=".22"/>`
    + `<ellipse cx="41" cy="95" rx="6" ry="4.2" fill="#E9879F"/><ellipse cx="59" cy="95" rx="6" ry="4.2" fill="#E9879F"/><path d="M38,97 h6 M56,97 h6" stroke="#8A4B5C" stroke-width="1.4" stroke-linecap="round"/>`
    + `<ellipse cx="50" cy="80" rx="20" ry="17" fill="url(#${P}-pkb)"/>`
    + `<ellipse cx="33" cy="77" rx="6.5" ry="5.5" fill="#F2A1B5"/><ellipse cx="67" cy="77" rx="6.5" ry="5.5" fill="#F2A1B5"/>`
    + `<path d="M29,34 C19,22 20,12 30,15 C38,18 41,26 39,33 Z" fill="#F29CB2"/><path d="M30,30 C25,23 26,18 31,19 C35,21 36,25 35,29 Z" fill="#FFC6D3"/>`
    + `<path d="M71,34 C81,22 80,12 70,15 C62,18 59,26 61,33 Z" fill="#F29CB2"/><path d="M70,30 C75,23 74,18 69,19 C65,21 64,25 65,29 Z" fill="#FFC6D3"/>`
    + `<circle cx="50" cy="50" r="27" fill="url(#${P}-pk)"/>`
    + `<rect x="45" y="23.5" width="10" height="3" rx="1.5" fill="#B9566F" fill-opacity=".75"/>` // 정수리 동전 구멍(돼지저금통)
    + `<path d="M40,27 L43,15 L47,24 L50,12 L53,23 L58,16 L59,27 Q50,22 40,27Z" fill="#3A2A24"/>`
    + `<ellipse cx="50" cy="56.5" rx="10.5" ry="7.2" fill="#F48FA8"/><ellipse cx="50" cy="54.5" rx="7" ry="2.6" fill="#FFB8C8" fill-opacity=".55"/><ellipse cx="46" cy="57" rx="1.9" ry="2.7" fill="#A84661"/><ellipse cx="54" cy="57" rx="1.9" ry="2.7" fill="#A84661"/>`
    + face(f, {ex1: 38.5, ex2: 61.5, ey: 44.5, r: 6.2, iris: '#3B2440', mx: 50, my: 67, w: 5, cy: 56, skin: '#F7B4C4'}).replaceAll('PFX', P)
    + (prop || '') + `</g>`;
}
function catBody(P, f, prop) {
  return `<g>`
    + `<ellipse cx="50" cy="99" rx="20" ry="3.2" fill="#000" fill-opacity=".22"/>`
    + `<path d="M66,90 C82,88 86,74 78,66" fill="none" stroke="#EDE7FA" stroke-width="7" stroke-linecap="round"/>`
    + `<ellipse cx="42" cy="95" rx="6" ry="4.2" fill="#F1ECFB"/><ellipse cx="58" cy="95" rx="6" ry="4.2" fill="#F1ECFB"/>`
    + `<ellipse cx="50" cy="80" rx="18" ry="16" fill="url(#${P}-wh)"/>`
    + `<ellipse cx="34" cy="77" rx="6" ry="5.2" fill="#FBF8FF"/><ellipse cx="66" cy="77" rx="6" ry="5.2" fill="#FBF8FF"/>`
    + `<path d="M27,36 L29,12 L45,27 Z" fill="#F4F0FC"/><path d="M31,30 L32,18 L41,27 Z" fill="#F6A9BE"/><path d="M73,36 L71,12 L55,27 Z" fill="#F4F0FC"/><path d="M69,30 L68,18 L59,27 Z" fill="#F6A9BE"/>`
    + `<circle cx="50" cy="50" r="26" fill="url(#${P}-wh)"/>`
    + `<path d="M50,22 C42,12 33,16 36,23 C38,29 46,26 50,23 Z M50,22 C58,12 67,16 64,23 C62,29 54,26 50,23 Z" fill="#F59DBF" stroke="#E07CA3" stroke-width=".8"/><circle cx="50" cy="22.5" r="3.6" fill="#E9849F"/>` // 분홍 리본
    + face(f, {ex1: 39.5, ex2: 60.5, ey: 48, r: 6, iris: '#3D78D6', mx: 50, my: 60.5, w: 4.2, cy: 57, skin: '#F7F3FF'}).replaceAll('PFX', P)
    + `<path d="M47.5,54.5 h5 l-2.5,3 Z" fill="#F38BA8"/>`
    + `<path d="M24,55 h9 M24,59 l9,-1.5 M76,55 h-9 M76,59 l-9,-1.5" stroke="#CFC8E6" stroke-width=".9" stroke-linecap="round"/>`
    + (prop || '') + `</g>`;
}
function hogBody(P, f, prop, k = 1) {
  const sp = Array.from({length: 13}, (_, i) => { const a = Math.PI * (1.05 + i * 0.9 / 12), r0 = 22, r1 = 37 + (i % 2) * 4; const x0 = 50 + Math.cos(a - 0.12) * r0, y0 = 52 + Math.sin(a - 0.12) * r0, x1 = 50 + Math.cos(a) * r1, y1 = 52 + Math.sin(a) * r1, x2 = 50 + Math.cos(a + 0.12) * r0, y2 = 52 + Math.sin(a + 0.12) * r0; return `M${F(x0)},${F(y0)} L${F(x1)},${F(y1)} L${F(x2)},${F(y2)}Z`; }).join(' ')
    + ' ' + Array.from({length: 6}, (_, i) => { const y = 64 + i * 6, x = 23 - (i % 2) * 3; return `M${F(x + 6)},${F(y - 3)} L${F(x - 5)},${F(y)} L${F(x + 6)},${F(y + 3)}Z M${F(100 - x - 6)},${F(y - 3)} L${F(100 - x + 5)},${F(y)} L${F(100 - x - 6)},${F(y + 3)}Z`; }).join(' ');
  return `<g>`
    + `<ellipse cx="50" cy="99" rx="21" ry="3.2" fill="#000" fill-opacity=".22"/>`
    + `<g class="hog-sp" transform="translate(50 76) scale(${F(k)}) translate(-50 -76)"><path d="${sp}" fill="url(#${P}-pu)" stroke="#7B3FC4" stroke-width=".7" stroke-linejoin="round"/></g>`
    + `<ellipse cx="42" cy="95" rx="6" ry="4.2" fill="#F5C9B9"/><ellipse cx="58" cy="95" rx="6" ry="4.2" fill="#F5C9B9"/>`
    + `<ellipse cx="50" cy="80" rx="18" ry="16" fill="url(#${P}-pe)"/>`
    + `<ellipse cx="34" cy="77" rx="6" ry="5.2" fill="#F8D2C4"/><ellipse cx="66" cy="77" rx="6" ry="5.2" fill="#F8D2C4"/>`
    + `<circle cx="30" cy="31" r="7.5" fill="#F8D2C4"/><circle cx="30" cy="31" r="4.2" fill="#F39BB1"/><circle cx="70" cy="31" r="7.5" fill="#F8D2C4"/><circle cx="70" cy="31" r="4.2" fill="#F39BB1"/>`
    + `<circle cx="50" cy="50" r="25" fill="url(#${P}-pe)"/>`
    + `<path d="M40,27 Q50,40 60,27 Q50,31 40,27Z" fill="#B57BEA"/>`
    + face(f, {ex1: 40, ex2: 60, ey: 48, r: 5.6, iris: '#7A3DB8', mx: 50, my: 61.5, w: 4.6, cy: 57, skin: '#FBDCCF'}).replaceAll('PFX', P)
    + `<ellipse cx="50" cy="56" rx="4.6" ry="3.4" fill="#F28A3C"/><ellipse cx="48.8" cy="54.9" rx="1.4" ry=".9" fill="#FFD2B0"/>`
    + (prop || '') + `</g>`;
}

/* ── 소품(배우 손 · 머리 위) — 배우 몸 안 좌표(키 100) ── */
export const PROP = {
  coin: `<g transform="translate(71,74)"><circle r="8.5" fill="url(#PFX-gd)" stroke="#C8891E" stroke-width="1.2"/><circle r="5.6" fill="none" stroke="#C8891E" stroke-width="1"/><path d="M-2.4,-3.8 v7.6 M2.4,-3.8 v7.6 M-3.6,-1 h7.2" stroke="#B87612" stroke-width="1.1"/></g>`,
  bag: `<g transform="translate(70,70)"><path d="M-9,4 C-11,-6 -5,-10 0,-10 C5,-10 11,-6 9,4 C8,10 -8,10 -9,4Z" fill="url(#PFX-gd)" stroke="#C8891E" stroke-width="1"/><path d="M-4,-10 l4,-5 l4,5" fill="none" stroke="#C8891E" stroke-width="1.4"/></g>`,
  rose: `<g transform="translate(66,70) rotate(-25)"><path d="M0,0 v18" stroke="#3E9B5B" stroke-width="2"/><circle cy="-2" r="5.5" fill="#FF4D6D"/><path d="M-3,-3 q3,-4 6,0" fill="none" stroke="#C81E45" stroke-width="1"/></g>`,
  mask: `<g transform="translate(50,46)"><path d="M-22,-3 C-18,-10 -6,-9 -1,-3 C1,-5 4,-5 6,-3 C11,-9 23,-10 26,-3 C24,6 10,8 5,2 C3,0 -1,0 -3,2 C-8,8 -21,6 -22,-3Z" fill="#9B5DE5" fill-opacity=".9" stroke="#FFD166" stroke-width="1"/></g>`,
  flag: `<g transform="translate(66,46)"><path d="M0,0 v-34" stroke="#C9B49A" stroke-width="1.8"/><path d="M0,-34 l18,6 l-18,6Z" fill="#FF5C8A"/></g>`,
  heart: `<g transform="translate(76,22)">${heart(0, 0, 5)}</g>`,
  zzz: zz(70, 18, 1),
  sweat: drop(78, 38, 3.2),
  spark: spark(80, 20, 5) + spark(18, 26, 3.5),
};

/** 배우 한 명 — who: pig · cat · hog · face · x,y = 발끝 · s = 크기(1 = 키 100) · flip = 왼쪽 보기 · cls/at = 움직임(art.js) · prop = PROP 이름들 · k = 고슴도치 가시 크기(포모) · v = data-v(움직임 값) */
export function actor(who, {x, y, s = 1, face: f = 'happy', flip = false, cls = '', at = null, prop = [], k = 1, v = null, idle = 0, P = 'ak'} = {}) {
  const props = [].concat(prop).filter(Boolean).map(n => (PROP[n] ?? '').replaceAll('PFX', P)).join('');
  const body = who === 'pig' ? pigBody(P, f, props) : who === 'cat' ? catBody(P, f, props) : hogBody(P, f, props, k);
  const tf = `translate(${F(x - 50 * s * (flip ? -1 : 1))},${F(y - 100 * s)}) scale(${F(s * (flip ? -1 : 1))},${F(s)})`;
  const attr = `${cls ? ` class="${cls}"` : ''}${at != null ? ` data-at="${at}"` : ''}${v ? ` data-v="${v}"` : ''}`;
  return `<g${attr}><g class="ci ci-${who} ci-i${idle}" transform="${tf}">${body}</g></g>`;
}
/** 얼굴 크게(자막 앞 · 영화 자막의 말하는 배우) — 그림 속 배우는 작아도 표정이 보이게(2026-10-08 휴대폰 첫 화면 눈 검사: 그림 속 키 30px 안팎이면 표정이 안 보임)
 *  머리 · 어깨만(viewBox 로 자름) · 그림 하나마다 색 이름 앞말(P)이 따로(같은 화면의 그림과 겹치지 않게) */
export function portrait(who, f = 'happy', P = 'pt', prop = []) {
  return `<svg class="ra-pt" viewBox="9 6 82 82" aria-hidden="true" focusable="false">${castDefs(P)}${actor(who, {x: 50, y: 100, s: 1, face: f, prop, k: 0.85, P})}</svg>`;
}
/** 무대 색(그림 하나에 한 번 — art.js defs 가 함께 넣음) */
export const stageDefs = p => `<defs><linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1F5C"/><stop offset="1" stop-color="#4B3B9A"/></linearGradient>`
  + `<radialGradient id="${p}-spot" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#FFF6D6" stop-opacity=".26"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient>`
  + `<linearGradient id="${p}-cur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E1730"/><stop offset=".5" stop-color="#C02A48"/><stop offset="1" stop-color="#7E1730"/></linearGradient></defs>`;
/** 무대(극장) — 보라 하늘 · 비추는 빛 · 양쪽 붉은 막 · 위 주름 막 · 바닥(H = 그림 높이 · 움직이지 않음) — 청자 대신(2026-10-08 06:40) */
export function stage(p, H, {floor = true, spot = 0.5} = {}) {
  const fy = H - 14, cw = 16;
  return `<rect x="0" y="0" width="360" height="${H}" fill="url(#${p}-sky)"/>`
    + `<path d="M${F(180 - 140 * spot)},0 L${F(180 + 140 * spot)},0 L${F(180 + 300 * spot)},${fy} L${F(180 - 300 * spot)},${fy}Z" fill="url(#${p}-spot)"/>`
    + (floor ? `<path d="M0,${fy} H360 V${H} H0Z" fill="#231A4B"/><path d="M0,${fy} H360" stroke="#8E7BFF" stroke-opacity=".35" stroke-width="1.2"/>` : '')
    + `<path d="M0,0 H${cw + 6} C${cw},30 ${cw + 6},${F(H * 0.45)} ${cw - 4},${F(H * 0.62)} C8,${F(H * 0.7)} 4,${F(H * 0.66)} 0,${F(H * 0.72)}Z" fill="url(#${p}-cur)"/>`
    + `<path d="M360,0 H${360 - cw - 6} C${360 - cw},30 ${360 - cw - 6},${F(H * 0.45)} ${364 - cw},${F(H * 0.62)} C352,${F(H * 0.7)} 356,${F(H * 0.66)} 360,${F(H * 0.72)}Z" fill="url(#${p}-cur)"/>`
    + `<path d="M0,0 H360 V7 C300,13 240,5 180,10 C120,5 60,13 0,7Z" fill="#9E1F3B"/>`;
}
