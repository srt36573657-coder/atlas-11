/* 신 72 · 스승 39 — 수르 방마다 지킴이 신 이름표 · 사기 전에 멈추는 길의 스승 길잡이(빈 파일에서 새로 씀)
   사장님 2026-11-04 18:54(+03) 「수르 명령서 — 잡스 판」 [5] 4 ~ 9
     「로마 신 72명을 한 명도 빼지 말고 넣어라」 「신은 방마다 지킴이 이름표로 달아라 (사장님 10월 31일 「재미삼아 적절한 곳에」)」
     「서른아홉 스승을 한 명도 빼지 말고 넣어라」 「스승은 사기 전에 멈추는 길의 길잡이로 세워라」
     「신·스승 명단과 얼굴 그림은 옛 것을 써라 (roman72.js와 sage39.json)」 「얼굴 듣기·모두 듣기·이어 듣기를 살려라」
   - 명단 · 얼굴은 옛 것 그대로: /next/roman72.js(GODS · 얼굴 /next/roman-art/<번호>.svg) · /next/data/sage39.json(people · 얼굴 /next/sage-art/<id>.svg)
   - 신 일흔둘 모두 = 길잡이 길의 「로마 신 72」 방(/next/#/roman) · 스승 서른아홉 모두 = 「서른아홉 스승」 방(/next/#/sage — 모두 듣기 · 이어 듣기)
   - 지킴이는 재미로 이은 것 — 앞날을 맞히거나 사고팔기를 권하는 말 없음 · 듣기는 화면 글 그대로 읽음 */
let GODS = null; // 옛 신 명단(/next/roman72.js) — 첫 그림을 막지 않게 늦게 받음(느린 휴대폰 첫 화면 2.5초)
const godsP = () => (GODS ? Promise.resolve(GODS) : import('/next/roman72.js').then(m => (GODS = m.GODS)));
import {h} from '/su/su-fig.js';

/** 수르 방 → 지킴이 신 번호(roman72.js GODS) — 열쇠 = 주소 꼴(#/<k> · #/<k>/<a> 의 k · 「k/*」) */
export const SU_ROOMS = Object.freeze({
  '': 21, m: 17, 'm/*': 63, c: 39, 'c/more': 62, i: 18, q: 43, p: 43, j: 36, f: 55, r: 44, 'r/*': 10, b: 34, k: 29,
  g: 24, 'g/hot': 59, 'g/bloom': 25, 'g/money': 52, 'g/stop': 38, 'g/guide': 1, 'g/guest': 69, 'g/back': 47, 'g/sky': 13,
});
/** 주소 → 방 열쇠 */
export function roomKey(hash = location.hash) {
  const m = /^#\/([a-z]*)(?:\/(.*))?$/.exec(hash || '#/'); if (!m) return '';
  const [, k, a] = m;
  if (k === 'c' && /\/more$/.test(a ?? '')) return 'c/more';
  if (k === 'g' && a) return Object.hasOwn(SU_ROOMS, 'g/' + a) ? 'g/' + a : 'g';
  if (a && Object.hasOwn(SU_ROOMS, k + '/*')) return k + '/*';
  return Object.hasOwn(SU_ROOMS, k) ? k : '';
}
export const godOf = key => { const n = SU_ROOMS[key]; const g = GODS?.[n]; return Array.isArray(g) ? {n, name: g[0], latin: g[1], who: g[3]} : null; }; // GODS[n] = [한국어 이름, 라틴 이름, 영어 이름, 누구(한국어), 누구(영어), 무리]

/** 소리 — 화면 글 그대로(한국어 · 천천히) · 못 하면 조용히 */
export function say(text) {
  try { const sy = globalThis.speechSynthesis; if (!sy || !text) return false; sy.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u); return true; } catch { return false; }
}
const listenBtn = (text, label) => { const b = h('button', {class: 'su-gl-say', type: 'button', 'aria-label': label}, h('span', {'aria-hidden': 'true', text: '🔈'}), h('span', {text: '듣기'})); b.addEventListener('click', () => say(text)); return b; };

/** 방 지킴이 이름표 — 얼굴 · 이름 · 누구 한 줄 · 얼굴 듣기 · 신 72 모두(명단은 늦게 받아 채움) */
export function godTag(hash = location.hash) {
  const key = roomKey(hash); if (!Object.hasOwn(SU_ROOMS, key)) return null;
  const box = h('aside', {class: 'su-god', 'aria-label': '이 방 지킴이 신'});
  godsP().then(() => { const g = godOf(key); if (!g) return;
    const line = josa2(g.name) + ' 이 방 지킴이예요. ' + g.who;
    box.append(h('img', {class: 'su-godf', src: '/next/roman-art/' + g.n + '.svg', alt: '', width: '64', height: '64', loading: 'lazy', decoding: 'async'}),
      h('div', {class: 'su-godt'}, h('p', {class: 'su-godk', text: '재미로 이은 이 방 지킴이'}), h('p', {class: 'su-godn'}, h('b', {text: g.name}), ' ', h('span', {text: g.latin})), h('p', {class: 'su-godw', text: g.who})),
      h('div', {class: 'su-godb'}, listenBtn(line, g.name + ' 얼굴 듣기'), h('a', {class: 'su-godall', href: '/next/?su=guide#/roman', text: '신 72 모두'}))); }).catch(() => box.remove());
  return box;
}
const josa2 = w => w + (/[가-힣]$/.test(w) && (w.charCodeAt(w.length - 1) - 0xac00) % 28 ? '은' : '는');

/* ── 스승 길잡이 ── */
let SAGES = null;
async function sages() {
  if (SAGES) return SAGES;
  try { const r = await fetch('/next/data/sage39.json'); const j = r.ok ? await r.json() : null; SAGES = Array.isArray(j?.people) ? j : null; } catch { SAGES = null; }
  return SAGES;
}
/** 길 단계 → 스승 묶음(sage39.json steps: 1 묻기 · 2 보기 · 3 따지기 · 4 지키기) */
export const STOP_STEP = Object.freeze({q: 1, p: 1, 'c/more': 2, j: 3, f: 4});
/** 스승 길잡이 칸 — 그 단계 스승 가운데 하나(i 번째 · 돌아가며) · 말씀 · 출처 · 얼굴 듣기 · 이어 듣기(그 단계 모두) · 서른아홉 모두 */
export function sageGuide(step, i = 0) {
  const box = h('aside', {class: 'su-sage', 'aria-label': '스승 길잡이'}, h('p', {class: 'su-sagek', text: '사기 전에 멈추는 길 · 스승 길잡이'}));
  sages().then(S => {
    if (!S || !box.isConnected && !box.parentNode) return;
    const ppl = S.people.filter(p => p.step === step), st = S.steps.find(x => x.k === step);
    if (!ppl.length) { box.append(h('p', {text: '스승 말씀을 받지 못했어요. 확인 필요.'})); return; }
    const p = ppl[((i % ppl.length) + ppl.length) % ppl.length], ko = p.ko ?? {};
    const all = ppl.map(x => (x.ko?.name ?? '') + '. ' + (x.ko?.say ?? '')).join(' ');
    box.append(
      st ? h('p', {class: 'su-sages', text: (st.ko?.v ?? '') + ' — ' + (st.ko?.q ?? '')}) : null,
      h('div', {class: 'su-sagep'}, h('img', {class: 'su-sagef', src: '/next/sage-art/' + p.id + '.svg', alt: '', width: '72', height: '72', loading: 'lazy', decoding: 'async'}),
        h('div', {}, h('p', {class: 'su-sagen'}, h('b', {text: ko.name ?? p.id}), ' · ', h('span', {text: ko.key ?? ''})), h('p', {class: 'su-sagesay', text: '「' + (ko.say ?? '') + '」'}), h('p', {class: 'su-sagesrc', text: '출처 · ' + (ko.src ?? p.orig ?? '확인 필요')}))),
      h('p', {class: 'su-sageq', text: ko.today ?? ''}),
      h('div', {class: 'su-sageb'}, listenBtn((ko.name ?? '') + '. ' + (ko.say ?? ''), (ko.name ?? '') + ' 얼굴 듣기'),
        (() => { const b = h('button', {class: 'su-gl-say', type: 'button', 'aria-label': '이 단계 스승 ' + ppl.length + '분 이어 듣기'}, h('span', {'aria-hidden': 'true', text: '🔈'}), h('span', {text: '이어 듣기 ' + ppl.length + '분'})); b.addEventListener('click', () => say(all)); return b; })(),
        h('a', {class: 'su-godall', href: '/next/?su=stop#/sage', text: '서른아홉 모두 · 모두 듣기'})));
  });
  return box;
}
