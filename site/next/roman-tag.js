/* 방 지킴이 이름표(사장님 2026-10-31 05:51(+03) 「응」 — 물음 「방마다 그 신 이름표도 달아 볼까요?」 · docs/design/roman72-site-2026-10-31/order-1151.txt)
   쪽(방)마다 맨 아래 · 카톡 줄 위에 그 방 지킴이 로마 신 이름표 하나 — 누르면 로마 신 72 쪽 그 신 카드(#/roman/<번호>)
   지킴이 표 = roman72.js ROOMS · roomOf(주소 → 신 번호) · 이름 = GODS(고른 목록 그대로)
   app.js route 가 쪽을 그린 뒤 이 모듈을 받아 place 를 부름(첫 화면은 다 그린 뒤 · 가장 큰 그림을 늦추지 않게) · 모양은 roman-tag.css(받은 뒤에 붙임 — 모양 없는 한순간 0)
   쪽 차례 기계(jobs-order.js jobsTail · jobsBoldLate)는 이 이름표(.rmt)를 맨 아래 작은 줄로 셈 — 이름표 때문에 다른 칸이 옮겨지지 않음 */
import {ON as EN} from './i18n.js';
import {GODS, roomOf, artOf} from './roman72.js';

const CSS = '/next/roman-tag.css';
let cssP = null;
/** 모양 파일 한 번 — 붙은 뒤(늦어도 3초) */
const css = () => (cssP ??= new Promise(res => {
  let l = document.querySelector(`link[href="${CSS}"]`);
  if (l?.sheet) { res(); return; }
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS; document.head.append(l); }
  const t = setTimeout(res, 3000), done = () => { clearTimeout(t); res(); };
  l.addEventListener('load', done, {once: true}); l.addEventListener('error', done, {once: true});
}));

/** 이름표 하나 — 「(얼굴) 이 방 지킴이 · 신 이름 ›」 · 얼굴 = 신 캐릭터 그림(사장님 2026-10-31 07:32(+03) 「이미지도 캐릭터화해서 해」 · order-1332.txt) — 이름이 바로 옆이라 그림 이름은 비움(alt="") */
export function tagOf(n) {
  const g = GODS[n]; if (!g) return null;
  const a = document.createElement('a'), im = document.createElement('img'), l = document.createElement('span'), b = document.createElement('b'), i = document.createElement('i');
  im.className = 'rmt-a'; im.alt = ''; im.width = 44; im.height = 44; im.decoding = 'async'; im.src = artOf(n); // 곧바로 받음(늦게 받기 없음) — 쪽을 그린 뒤 단 한 번 · 단 뒤 누름에 그림 요청이 끼지 않게(check_hold 「기록 파일 누를 때 망 요청 0」)
  a.className = 'rmt'; a.href = '#/roman/' + n; a.dataset.n = String(n);
  l.className = 'rmt-l'; l.textContent = EN ? 'Room guardian' : '이 방 지킴이';
  b.className = 'rmt-n'; b.textContent = EN ? g[2] : g[0];
  i.setAttribute('aria-hidden', 'true'); i.textContent = '›';
  a.append(im, l, ' ', b, ' ', i); // 한 글줄(안쪽은 inline) — 글 시작 왼쪽 줄 잣대(measure_type · check_why [10] 7)에 칸 셋이 따로 잡히지 않게 · 가운데 맞춤 한 덩이
  return a;
}

/** 쪽에 이름표 달기 — k · a = app.js parse 꼴 · root = #view · alive() = 아직 같은 쪽인지 · 돌려줌 = 단 이름표(없으면 null) */
export async function place(k, a, root, alive = () => true) {
  const n = roomOf(k, a); if (!n || !root) return null;
  const tag = tagOf(n); if (!tag) return null;
  const im = tag.querySelector('img'), seen = im ? Promise.race([im.decode().catch(() => {}), new Promise(r => setTimeout(r, 3000))]) : null; // 얼굴 그림을 먼저 받아 둠(늦어도 3초) — 단 때 이미 그려진 그림
  await Promise.all([css(), seen]);
  if (!alive() || !root.isConnected || root.querySelector(':scope > .rmt')) return null;
  const kk = root.querySelector(':scope > .kk-pgrow'); // 카톡 쪽 줄(맨 아래)이 이미 있으면 그 위 · 아직 없으면 끝(카톡 줄은 뒤에 붙음)
  if (kk) kk.before(tag); else root.append(tag);
  return tag;
}
