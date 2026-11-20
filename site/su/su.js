/* 손자병법 길 — 모든 쪽이 손자병법 판(su-sonja*.js) · 「왜 사?」 · 매매일지 · 찾지 못한 쪽도(su-sonja-why.js · 주문 1116-0300)
   사장님 2026-11-16(마카오) 02:00 「그라고 예전 페이지 디자인이 남아 있어 예전 디자인은 모두 삭제 하고 손자병법에 맞게 처음부터 끝까지 깔끔하개 작업해 …」
   — 옛 틀 page() · 옛 꾸밈 파일 켜기(oldCss) · 하늘 · 무하 그림 부품 · 낱말 풀이 덧칠 · 옛 머리 줄 · 이야기 막대 · 탭을 모두 지움
   주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 물음 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답 · 앞 말씀 17:43 「… 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」
   · 2026-11-14 08:27 「… 과거 찌꺼기 버릴것은 버리고」 — 원문 docs/design/sonja-ink-2026-11-15/order-2328.txt)
   길 다섯 화면: 기 1 오늘 #/ → 승 2 꾀 #/k/g01 ~ g36 → 전 3 회사 #/c/<번호> → 결 4 「왜 사?」 #/q/<번호> → 결 5 내 매매일지 #/j
   탭 다섯: 오늘 #/ · 꾀 #/k(꾀 모음) · 멈춤 #/q · 일지 #/j · 정산 #/r/t(서른여섯 꾀 표만)
   지운 쪽(옛 고리로 오면 첫 쪽 · #/k/<번호> 는 그 회사 쪽): 옛 처음 #/b · 땅 지도 #/m · #/m/<땅> · 될 듯 21곳 #/n · 조용한 힘 #/s · 친구에게 #/f · 기록 #/r · 달마다 · 못 된 까닭 · 날마다 · 해마다 · 한국 시장 일곱 · 투자자 열하나 · 1 · 2 · 3등 달력 · 조용한 힘 달력 #/r/(m · w · d · y · k · i · c · s) · #/r/<번호> · 업종 #/i/<업종> · 회사 자세히 #/c/<번호>/more · 1 · 2 · 3등 회사 #/c/<번호>/t · 「왜?」 #/c/<번호>/y/<칸>
   보안 규칙: innerHTML 없음 · 글 속 style 없음 */
import {NAME} from '/next/brand.js';
import {CODE, forwardTo} from '/su/su-data.js';
import {brand} from '/su/su-six.js';
import {h} from '/su/su-fig.js';
import {sonjaShell} from '/su/su-sonja-top.js'; // 머리 줄 · 표지(먼저 칠함) — 본문 su-sonja.js 는 첫 쪽을 열 때 받음(주문 1115-1836 · 느린 휴대폰 첫 화면)
let WHYM = null; const whyM = async () => (WHYM ??= await import('/su/su-why.js')); // 「왜 사?」 · 매매일지는 그 쪽에서 받음(첫 화면이 가볍게 — 주문 2044 느린 휴대폰)

brand(NAME);
const cache = new Map();
export const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
export const D = {S: '/next/data/home-summary.json', co: c => '/atlas/data/co/' + c + '.json'};
/** 쪽 바탕 자료 — 받은 때(home-summary) · 판 날(su21.json) · 옛 꽃 · 돈 자료는 받지 않음(주문 1115-2328) */
export async function base() {
  const [S, T] = await Promise.all([get(D.S), get('/su/data/su21.json')]);
  return {S, asOf: T?.asOf?.board ?? null};
}
export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
export const STEPS = [null, ['오늘', 0], ['꾀', 1], ['회사', 2], ['「왜 사?」', 3], ['내 매매일지', 3]]; // 길 다섯 화면(주문 1115-2328 · 짝: su-sonja-top.js STEP5)
let lastCo = null;
export const cur = () => lastCo;
export const setCur = c => { lastCo = c; };
export const coHref = c => '#/c/' + c;
/* ── 쪽 그리기(모두 손자병법 판) ── */
let SW = null; const sjWhy = async () => (SW ??= await import('/su/su-sonja-why.js')); // 「왜 사?」 · 매매일지 · 찾지 못한 쪽 판
/** 「왜 사?」 · 매매일지에 건네는 것 — 다시 그릴 때(답을 누를 때마다) 쓰는 page = 손자병법 판 */
const whyX = W => ({base, get, cur, setCur, STEPS, page: m => W.sjPage(m, lastCo?.code ?? null).dom, afterPaint: null});
/** 손자병법 판 쪽(첫 쪽 · 꾀 · 회사 · 정산)에 건네는 것 — 받은 때(home-summary)만 · 마지막에 본 회사(멈춤 탭) */
const XS = {base: async () => ({S: await get(D.S)}), get, cur, setCur};
/** 손자병법 판 켜기 — html.sj-on(한지 바탕 · su-sonja.css) · 휴대폰 맨 위 띠 한지 색 */
const SJ_TC = '#F3F8F6';
function sonjaOn() {
  document.documentElement.classList.add('sj-on'); document.documentElement.classList.remove('sj-sub'); // 표지 숨김(sj-sub)은 첫 칠함에만(su-boot.js)
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.setAttribute('content', SJ_TC);
}
/** 지운 쪽(주문 1115-2328) — 옛 고리로 오면 첫 쪽(주소도 #/ 로 바꿈) · 옛 회사 고리 #/k/<번호> 는 그 회사 쪽 */
const GONE_T = /^#\/(b|m|n|s|f|r|g)$/, GONE_M = /^#\/(m|i|r|g)\/.+$|^#\/c\/[0-9A-Z]{6}\/.+$/; // #/g · #/g/<묶음> = 옛 기능 쪽(주문 1114-1306 에서 버림)
/** 손자병법 판 쪽 그리기 — 머리 줄 · main · 이야기 막대 · 탭(옛 page() · afterPaint() 를 거치지 않음) */
async function paintSj(hh, root, make) {
  const v = await make(); if (hh !== (location.hash || '#/')) return;
  sonjaOn(); document.title = v.title + ' · ' + NAME; root.replaceChildren(...v.dom); window.scrollTo(0, 0);
}
let KM = null; const kkoeM = async () => (KM ??= await import('/su/su-sonja-kkoe.js')); // 꾀 · 회사 · 정산 쪽은 그 쪽을 열 때 받음(첫 화면이 가볍게)
async function route() {
  let hh = location.hash || '#/';
  const fw = forwardTo(location.search, hh);
  if (fw) { location.replace(fw); return; }
  const old = /^#\/k\/([0-9A-Z]{6})$/.exec(hh);
  if (old) { history.replaceState(null, '', '#/c/' + old[1]); hh = '#/c/' + old[1]; }
  else if (GONE_T.test(hh) && hh !== '#/r/t' || GONE_M.test(hh) && hh !== '#/r/t') { history.replaceState(null, '', location.pathname + location.search + '#/'); hh = '#/'; }
  const root = document.getElementById('su');
  try {
    const kk = /^#\/k(?:\/(.+))?$/.exec(hh), co = /^#\/c\/([0-9A-Z]{6})$/.exec(hh), q = /^#\/(q|p)(?:\/(.+))?$/.exec(hh);
    if (kk) { const M = await kkoeM(); return await paintSj(hh, root, () => (kk[1] ? M.vKkoe(XS, kk[1]) : M.vKkoeAll(XS))); }
    if (co) { const M = await kkoeM(); return await paintSj(hh, root, () => M.vCo36(XS, co[1])); }
    if (hh === '#/r/t') { const M = await kkoeM(); return await paintSj(hh, root, () => M.vSettle36(XS)); }
    if (hh === '#/l') { const M = await kkoeM(); return await paintSj(hh, root, () => M.vLedger(XS)); } // 장부(주문 1120-1705 · 탭 「장부」)
    if (hh === '#/o') { const M = await kkoeM(); return await paintSj(hh, root, () => M.vPicks(XS)); } // 여러 꾀가 고른 회사(주문 1120-0950 · #/n 은 옛 쪽 이름이라 #/o)
    if (q || hh === '#/j') { // 「왜 사?」 · 매매일지 — 손자병법 판(주문 1116-0300 · 옛 틀을 지움) · 걸음 4 / 5 · 5 / 5
      const [W, Y] = await Promise.all([sjWhy(), whyM()]), X = whyX(W);
      let v;
      if (hh === '#/j') v = await Y.vJournal(X);
      else { let a = q[2] ?? null; try { a = a == null ? null : decodeURIComponent(a); } catch { /* 그대로 */ }
        v = a == null ? await Y.vQuiz(lastCo?.code ?? null, X) : CODE.test(a) ? await Y.vQuiz(a, X) : W.missModel('이 회사를 찾지 못했어요.'); }
      if (hh !== (location.hash || '#/')) return;
      const pg = W.sjPage(v, lastCo?.code ?? null);
      sonjaOn(); document.title = pg.title + ' · ' + NAME; root.replaceChildren(...pg.dom); window.scrollTo(0, 0);
      if (typeof v.later === 'function') v.later().catch(e => console.error(e));
      return;
    }
    // 손자병법 첫 쪽(주문 1115-1706) — 머리 · 본문 · 이야기 막대 · 탭을 새 판이 모두 그림 · 알 수 없는 고리도 첫 쪽
    // 주문 1115-1836 — 머리 줄 · 표지를 자료 · 본문 코드보다 먼저(처음 열 때는 index.html 이 든 것을 그대로 · 다른 쪽에서 오면 새로 그림) → 본문은 받은 뒤 같은 main 에 이어 붙임
    if (!/^#\/?$/.test(hh)) { history.replaceState(null, '', location.pathname + location.search + '#/'); hh = '#/'; } // 모르는 주소는 첫 쪽 · 주소도 #/ 로(주문 1120-0001)
    const sh = sonjaShell(root); sonjaOn();
    if (sh.pre) { for (const c of [...root.children]) if (c !== sh.top && c !== sh.main) c.remove(); } else { root.replaceChildren(sh.top, sh.main); window.scrollTo(0, 0); }
    const sj = await (await import('/su/su-sonja.js')).vSonja(XS, sh);
    if (hh !== (location.hash || '#/')) return;
    if (sj) { document.title = sj.title + ' · ' + NAME; if (sj.keep) root.append(...sj.rest); else root.replaceChildren(...sj.dom); sj.after().catch(e => console.error(e)); return; }
    sh.main.removeAttribute('data-wait'); sh.main.querySelector('.sj-tc0')?.remove(); sh.main.append(h('section', {class: 'sj-sec'}, h('p', {class: 'sj-lead', text: '오늘 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}), h('p', {class: 'sj-safe', text: SAFE})));
  } catch (e) {
    console.error(e);
    if (hh !== (location.hash || '#/')) return;
    const W = await sjWhy().catch(() => null); if (!W) return;
    const pg = W.sjPage(W.missModel('화면을 그리다 멈췄어요. 다시 열어 주세요.'), lastCo?.code ?? null);
    sonjaOn(); document.title = pg.title + ' · ' + NAME; root.replaceChildren(...pg.dom);
  }
}
try { if (localStorage.getItem('su-big-text') === '1') document.documentElement.classList.add('su-lg'); } catch { /* 저장소 없음 */ }
/** 글꼴 표(프리텐다드 · 압축해도 4만 바이트)는 첫 화면을 그린 뒤에 붙임(주문 1120-0226 「첫 화면을 더 가볍게 해서 더 빨리 뜨게」 — 그 전에는 기기 글꼴 · 받으면 바뀜 font-display: swap)
 *  애플 기기(아이폰 · 아이패드 · 맥)는 글꼴 차례 맨 앞이 기기 글꼴이라 프리텐다드를 쓰지 않음 → 글꼴 표도 받지 않음(사장님 2026-10-22 「애플 기기 = 애플 글꼴 · 그 밖 = 프리텐다드」) */
const APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent ?? '');
const fontsLater = () => { if (APPLE || document.querySelector('link[href="/app/fonts.css"]')) return; requestAnimationFrame(() => setTimeout(() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/app/fonts.css'; document.head.append(l); }, 0)); };
window.addEventListener('hashchange', route);
route().finally(fontsLater);
/* 새 판이 올라가면 스스로 새로 고침(주문 1708 · 사장님 2026-11-08 17:08 「왜? 이 디자인이 남아 있어!」 — 휴대폰이 전에 열어 둔 화면을 새로 받지 않고 그대로 보여 줌)
   판 표 /su/version.json = 올릴 때마다 새 표(scripts/atlas11/package.mjs 가 씀 · 저장소에는 「dev」) · 처음 연 때의 표를 기억
   화면이 다시 보일 때(다른 앱에서 돌아옴 · 뒤로 가기로 저장된 화면이 다시 뜸) 표를 새로 받아 바뀌었으면 한 번 새로 고침 · 같거나 못 받으면 그대로(읽는 중에는 바꾸지 않음) */
const VER = '/su/version.json';
const verNow = () => fetch(VER + '?t=' + Date.now(), {cache: 'no-store'}).then(r => (r.ok ? r.json() : null)).then(j => (j && typeof j.v === 'string' && j.v ? j.v : null)).catch(() => null);
let ver0 = null;
verNow().then(v => { if (v && !ver0) ver0 = v; });
async function fresh() {
  if (document.visibilityState !== 'visible') return;
  const v = await verNow(); if (!v) return;
  if (!ver0) { ver0 = v; return; }
  if (v !== ver0) { ver0 = v; location.reload(); }
}
document.addEventListener('visibilitychange', fresh);
window.addEventListener('pageshow', e => { if (e.persisted) fresh(); });
