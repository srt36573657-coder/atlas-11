// 앵무새 막비 그리기(사장님 2026-10-13 03:39 「이 앵무새로 귀엽게 재미나게 그리고 위트있게 해」 · 「적당히 하면 안돼」)
//   사장님이 기르시는 갈라 앵무새 막비 — 옅은 분홍 모자 · 모자 위 분홍 점 · 장밋빛 얼굴 · 회색 눈테 · 상아빛 부리 · 회색 날개
//   그림 파일 없이 코드로(SVG) — 사이트의 달 · 1장 · 소개 영상 · 링크 미리보기가 모두 이 한 벌을 씀
//   빨강(오름) · 파랑(내림)과 헷갈리지 않게 장밋빛은 차분한 분홍(채도를 낮춤)
export const C = {
  face0: '#EBA2B7', face1: '#DC849F', face2: '#C76D8F', body0: '#E595AC', body1: '#C8708F',
  cap0: '#FFF8FA', cap1: '#F9E1E9', cap2: '#F0C6D4', crest: ['#FCEDF2', '#F8DFE8', '#F2D1DD'], spot: '#E6A5B9',
  wing0: '#D5D9E0', wing1: '#ADB3BE', wing2: '#8A919F', beak0: '#FFFCF6', beak1: '#E8DDCA', beakLo: '#CFC0A5',
  ring: '#EEF1F6', pupil: '#28191F', blush: '#B9476F', brow: '#D7859C', foot: '#959CA8', gold: '#E9C46A',
};
let uid = 0;
/** 막비 한 마리(viewBox 0 0 240 270) — o: {tilt, blink(0~1), glasses, wingUp · wingL · wingR(0~1 · 날개 펴기), crestUp(0~1), id, beakOpen(0~1)} */
export function makbi(o = {}) {
  const k = o.id ?? `mb${++uid}`, tilt = o.tilt ?? -7, blink = Math.min(1, Math.max(0, o.blink ?? 0)), wu = o.wingUp ?? 0, wl = o.wingL ?? wu, wr = o.wingR ?? wu, cu = o.crestUp ?? 0, bo = o.beakOpen ?? 0;
  const eyeRy = 20 * (1 - blink * 0.92), pupR = 12.5 * (1 - blink * 0.95), shine = blink < 0.5;
  const eye = (cx, flip) => `<ellipse cx="${cx}" cy="116" rx="19" ry="${eyeRy.toFixed(2)}" fill="${C.ring}"/>` +
    (blink < 0.85 ? `<ellipse cx="${cx + (flip ? -1 : 1)}" cy="118" rx="12.5" ry="${pupR.toFixed(2)}" fill="${C.pupil}"/>` : `<path d="M${cx - 13} 117 q13 7 26 0" fill="none" stroke="${C.pupil}" stroke-width="3.2" stroke-linecap="round"/>`) +
    (shine ? `<circle cx="${cx - 5}" cy="111" r="4.8" fill="#fff"/><circle cx="${cx + 4}" cy="123" r="2" fill="#fff" opacity=".85"/>` : '');
  const crestRot = -cu * 16;
  return `<g class="makbi">
  <defs>
    <radialGradient id="${k}f" cx="50%" cy="35%" r="72%"><stop offset="0" stop-color="${C.face0}"/><stop offset=".66" stop-color="${C.face1}"/><stop offset="1" stop-color="${C.face2}"/></radialGradient>
    <radialGradient id="${k}b" cx="50%" cy="22%" r="80%"><stop offset="0" stop-color="${C.body0}"/><stop offset="1" stop-color="${C.body1}"/></radialGradient>
    <radialGradient id="${k}c" cx="44%" cy="20%" r="82%"><stop offset="0" stop-color="${C.cap0}"/><stop offset=".55" stop-color="${C.cap1}"/><stop offset="1" stop-color="${C.cap2}"/></radialGradient>
    <linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.wing0}"/><stop offset=".6" stop-color="${C.wing1}"/><stop offset="1" stop-color="${C.wing2}"/></linearGradient>
    <linearGradient id="${k}k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.beak0}"/><stop offset=".7" stop-color="${C.beak1}"/><stop offset="1" stop-color="${C.beakLo}"/></linearGradient>
    <clipPath id="${k}h"><circle cx="120" cy="108" r="74"/></clipPath>
    <filter id="${k}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.8"/></filter>
  </defs>
  <path d="M106 238 C108 258 132 262 134 238 Z" fill="${C.wing2}"/>
  <g transform="rotate(${(wl * 62).toFixed(1)} 84 178)"><path d="M70 170 C46 184 40 222 58 246 C66 240 70 232 74 224 C76 238 82 246 90 250 C92 222 92 194 86 172 Z" fill="url(#${k}w)"/><path d="M60 214 q8 4 14 -2 M62 230 q8 4 14 -2" fill="none" stroke="#7B8290" stroke-width="2" stroke-linecap="round" opacity=".5"/></g>
  <g transform="rotate(${(-wr * 62).toFixed(1)} 156 178)"><path d="M170 170 C194 184 200 222 182 246 C174 240 170 232 166 224 C164 238 158 246 150 250 C148 222 148 194 154 172 Z" fill="url(#${k}w)"/><path d="M180 214 q-8 4 -14 -2 M178 230 q-8 4 -14 -2" fill="none" stroke="#7B8290" stroke-width="2" stroke-linecap="round" opacity=".5"/></g>
  <ellipse cx="120" cy="198" rx="54" ry="52" fill="url(#${k}b)"/>
  <g fill="none" stroke="#AE4A70" stroke-width="2.2" stroke-linecap="round" opacity=".26"><path d="M100 186 q7 5 14 0"/><path d="M122 192 q7 5 14 0"/><path d="M108 204 q7 5 14 0"/><path d="M130 212 q7 5 14 0"/><path d="M98 218 q7 5 14 0"/><path d="M118 228 q7 5 14 0"/></g>
  <g fill="${C.foot}"><path d="M101 240 q-7 10 -3 15 q6 -2 9 -8 q3 8 9 8 q2 -6 -4 -15 z"/><path d="M139 240 q7 10 3 15 q-6 -2 -9 -8 q-3 8 -9 8 q-2 -6 4 -15 z"/></g>
  <g class="mb-head" transform="rotate(${tilt} 120 150)">
    <g transform="rotate(${crestRot.toFixed(1)} 124 44)">
      <path d="M104 44 C96 26 104 10 118 13 C113 22 115 31 122 38 Z" fill="${C.crest[0]}"/>
      <path d="M116 38 C114 18 130 6 144 14 C135 19 133 28 135 39 Z" fill="${C.crest[1]}"/>
      <path d="M130 42 C135 27 152 21 162 31 C151 32 145 38 143 47 Z" fill="${C.crest[2]}"/>
    </g>
    <circle cx="120" cy="108" r="74" fill="url(#${k}f)"/>
    <g clip-path="url(#${k}h)"><path d="M40 118 C38 62 76 30 120 30 C164 30 202 62 200 118 C182 100 162 92 147 96 C137 92 129 98 120 100 C111 98 103 92 93 96 C78 92 58 100 40 118 Z" fill="url(#${k}c)" filter="url(#${k}s)"/>
      <g fill="${C.spot}" opacity=".62"><ellipse cx="150" cy="62" rx="9" ry="6"/><ellipse cx="94" cy="58" rx="6.5" ry="4.5"/><ellipse cx="128" cy="76" rx="6" ry="4"/><ellipse cx="172" cy="86" rx="5" ry="3.5"/><ellipse cx="110" cy="44" rx="4" ry="3"/></g></g>
    <g class="mb-eyes">${eye(88, false)}${eye(152, true)}</g>
    <path d="M71 99 q17 -9 35 0 M134 99 q17 -9 35 0" fill="none" stroke="${C.brow}" stroke-width="3" stroke-linecap="round" opacity=".75"/>
    <ellipse cx="71" cy="146" rx="13" ry="8" fill="${C.blush}" opacity=".26"/><ellipse cx="169" cy="146" rx="13" ry="8" fill="${C.blush}" opacity=".26"/>
    <g transform="translate(120 136) scale(.86) translate(-120 -136)">
    <path d="M108 ${150 + bo * 6} Q120 ${164 + bo * 10} 132 ${150 + bo * 6} Q128 ${166 + bo * 10} 120 ${168 + bo * 10} Q112 ${166 + bo * 10} 108 ${150 + bo * 6} Z" fill="${C.beakLo}"/>
    <path d="M104 130 C106 117 134 117 136 130 C137 145 128 156 120 162 C112 156 103 145 104 130 Z" fill="url(#${k}k)"/>
    <path d="M112 124 q8 -4 16 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>
    </g>
    ${o.glasses ? `<g fill="none" stroke="${C.gold}" stroke-width="3.4"><circle cx="88" cy="116" r="23"/><circle cx="152" cy="116" r="23"/><path d="M111 112 q9 -6 18 0"/><path d="M65 110 l-14 -6 M175 110 l14 -6" stroke-linecap="round"/></g><g fill="#fff" opacity=".18"><circle cx="88" cy="116" r="21"/><circle cx="152" cy="116" r="21"/></g>` : ''}
  </g>
</g>`;
}
/** 머리만(달 · 둥근 아이콘) — viewBox 0 0 100 100 · 얼굴이 둥근 창을 채움 */
export function makbiHead(o = {}) { // 몸 · 날개 · 발 · 꼬리를 뺀 머리만(발 색 #959CA8 = C.foot — 정규식 안에서는 ${} 가 안 풀려 글자로 적음)
  return `<g transform="translate(50 57) scale(.53) translate(-120 -112)">${makbi({...o, tilt: o.tilt ?? -6}).replace(/<path d="M106 238[^>]*\/>|<g transform="rotate\([^)]*84 178\)">[\s\S]*?<\/g>\s*<g transform="rotate\([^)]*156 178\)">[\s\S]*?<\/g>|<ellipse cx="120" cy="198"[^>]*\/>|<g fill="none" stroke="#AE4A70"[\s\S]*?<\/g>|<g fill="#959CA8">[\s\S]*?<\/g>/g, '')}</g>`;
}
export const svg = (w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${extra}>${body}</svg>`;

// ── 홍표 첨단 차림(사장님 2026-10-14(싱가포르) 21:50 「막비 이름을 홍표 라고 해」 · 21:59 「판타스틱하게 만들어줘 아이어맨 처럼」 · 22:29 「더 아이어맨스럽게 … 아틀란스에 올려」) ──
//   남의 캐릭터 모양은 쓰지 않음 — 홍표만의 빛 눈 가리개(내리면 눈을 덮고 · 올리면 이마 위) · 은빛 날개 덮개 · 발 불꽃통 · 청록 불꽃
//   같은 그림 좌표(240×270) · 그림 안 이름(id)은 GEAR_DEFS 의 fg · vg · metal · gl 을 씀(영상 화면은 제 DEFS 에 같은 이름이 있음)
const _f1 = x => x.toFixed(1), _f2 = x => x.toFixed(2);
export const GEAR_DEFS = '<filter id="gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
  + '<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".25" stop-color="#BFFFF4"/><stop offset=".6" stop-color="#2EC4B6"/><stop offset="1" stop-color="#2EC4B6" stop-opacity="0"/></linearGradient>'
  + '<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FFFF0"/><stop offset=".5" stop-color="#2FCFB8"/><stop offset="1" stop-color="#0E6E68"/></linearGradient>'
  + '<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FBFA"/><stop offset=".45" stop-color="#B4CDCB"/><stop offset="1" stop-color="#6E8B89"/></linearGradient>';
const HP_VP = 'M56 99 Q120 83 184 99 Q190 118 182 135 Q120 151 58 135 Q50 118 56 99 Z';
const HP_WL = 'M70 170 C46 184 40 222 58 246 C66 240 70 232 74 224 C76 238 82 246 90 250 C92 222 92 194 86 172 Z', HP_WR = 'M170 170 C194 184 200 222 182 246 C174 240 170 232 166 224 C164 238 158 246 150 250 C148 222 148 194 154 172 Z';
const HP_GL = 'M68 174 C56 182 50 196 52 210 C60 206 68 200 76 196 C78 188 78 180 74 172 Z', HP_GLL = 'M57 203 C63 197 69 193 76 191';
const hpMir = p => p.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => (240 - +x) + ' ' + y), HP_GR = hpMir(HP_GL), HP_GRL = hpMir(HP_GLL);
/** 눈 가리개 — v: 1 = 눈을 덮음 · 0 = 이마 위로 올림 · t: 때(빛줄이 지나감) */
export function visorSvg(v, t, tilt) {
  const dy = (1 - v) * -50, sc = 1 - (1 - v) * .22, scan = 58 + ((t * .85) % 1) * 126;
  return '<g transform="rotate(' + tilt + ' 120 150)"><g transform="translate(0 ' + _f1(dy) + ') translate(120 116) scale(1 ' + sc.toFixed(3) + ') translate(-120 -116)">'
    + '<clipPath id="vc"><path d="' + HP_VP + '"/></clipPath><path d="' + HP_VP + '" fill="url(#vg)" opacity="' + _f2(.42 + .2 * v) + '"/>'
    + '<g clip-path="url(#vc)"><rect x="' + _f1(scan) + '" y="80" width="12" height="74" fill="#E8FFFB" opacity="' + _f2(.5 * v) + '"/></g>'
    + '<path d="' + HP_VP + '" fill="none" stroke="#C8FFF6" stroke-width="3.2" filter="url(#gl)"/><path d="M70 101 Q120 89 170 101" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>'
    + '<path d="M53 113 l-12 -4 M187 113 l12 -4" stroke="#C8FFF6" stroke-width="4.5" stroke-linecap="round"/><circle cx="48" cy="114" r="8" fill="url(#metal)" stroke="#CFFFF7" stroke-width="1.6"/><circle cx="192" cy="114" r="8" fill="url(#metal)" stroke="#CFFFF7" stroke-width="1.6"/></g></g>';
}
/** 발 불꽃 — f: 세기(0 ~ 1) · y0: 불꽃이 나오는 높이(발 불꽃통이 있으면 258) */
export function flameSvg(f, t, y0) {
  if (f <= .01) return ''; let s = '';
  [[104, y0 || 251], [136, y0 || 251]].forEach(([x, y], i) => {
    const L = (30 + 46 * f) * (1 + .16 * Math.sin(t * 43 + i * 2.1) + .09 * Math.sin(t * 71 + i)), w = 10 + 4 * f;
    s += '<path d="M' + (x - w) + ' ' + y + ' Q' + x + ' ' + _f1(y + L * 1.3) + ' ' + (x + w) + ' ' + y + ' Z" fill="url(#fg)" opacity="' + _f2(.5 + .5 * f) + '" filter="url(#gl)"/><path d="M' + _f1(x - w * .42) + ' ' + y + ' Q' + x + ' ' + _f1(y + L * .62) + ' ' + _f1(x + w * .42) + ' ' + y + ' Z" fill="#fff" opacity="' + _f2(.85 * f) + '"/>';
  });
  return s;
}
export function wingGlow(g, wl, wr) {
  if (g <= .01) return '';
  return '<g fill="none" stroke="#9FFFF0" stroke-width="3.2" opacity="' + _f2(g) + '" filter="url(#gl)"><path transform="rotate(' + _f1(wl * 62) + ' 84 178)" d="' + HP_WL + '"/><path transform="rotate(' + _f1(-wr * 62) + ' 156 178)" d="' + HP_WR + '"/></g>';
}
/** 은빛 날개 덮개 · 발 불꽃통 — g: {guard, boot(0 ~ 1 · 붙은 정도), gL · gR · bootOff(날아오는 자리)} */
export function gearSvg(g, o) {
  let s = ''; if (!g) return s;
  if (g.guard > .01) {
    const a = g.gL || [0, 0], b = g.gR || [0, 0];
    s += '<g opacity="' + _f2(g.guard) + '"><g transform="translate(' + _f1(a[0]) + ' ' + _f1(a[1]) + ') rotate(' + _f1(o.wingL * 62) + ' 84 178)"><path d="' + HP_GL + '" fill="url(#metal)" stroke="#CFFFF7" stroke-width="1.6"/><path d="' + HP_GLL + '" fill="none" stroke="#7FFFE6" stroke-width="2.6" stroke-linecap="round" filter="url(#gl)"/></g>'
      + '<g transform="translate(' + _f1(b[0]) + ' ' + _f1(b[1]) + ') rotate(' + _f1(-o.wingR * 62) + ' 156 178)"><path d="' + HP_GR + '" fill="url(#metal)" stroke="#CFFFF7" stroke-width="1.6"/><path d="' + HP_GRL + '" fill="none" stroke="#7FFFE6" stroke-width="2.6" stroke-linecap="round" filter="url(#gl)"/></g></g>';
  }
  if (g.boot > .01) {
    const c = g.bootOff || [0, 0];
    s += '<g opacity="' + _f2(g.boot) + '" transform="translate(' + _f1(c[0]) + ' ' + _f1(c[1]) + ')">' + [104, 136].map(x => '<rect x="' + (x - 13) + '" y="238" width="26" height="20" rx="9" fill="url(#metal)" stroke="#CFFFF7" stroke-width="1.5"/><ellipse cx="' + x + '" cy="258" rx="11" ry="3.6" fill="#7FFFE6" filter="url(#gl)"/>').join('') + '</g>';
  }
  return s;
}
/** 홍표 한 마리(첨단 차림) — o: makbi 의 몸짓 + visor · vs(가리개 보임) · visorOff · flame · glowWing · g: gearSvg 의 g */
export function hongpyo(o, t, g) {
  return flameSvg(o.flame, t, g && g.boot > .5 ? 258 : 251) + makbi({id: o.id ?? 'hp', tilt: o.tilt, blink: o.blink, wingL: o.wingL, wingR: o.wingR, crestUp: o.crestUp, beakOpen: o.beakOpen}) + gearSvg(g, o) + wingGlow(o.glowWing, o.wingL, o.wingR)
    + (o.vs > .01 ? '<g opacity="' + _f2(o.vs) + '" transform="translate(0 ' + _f1(o.visorOff || 0) + ')">' + visorSvg(o.visor, t, o.tilt) + '</g>' : '');
}
