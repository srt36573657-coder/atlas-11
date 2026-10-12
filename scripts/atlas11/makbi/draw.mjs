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
