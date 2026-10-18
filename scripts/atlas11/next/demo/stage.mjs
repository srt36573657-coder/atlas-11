/**
 * 60초 시연 영상 — 무대 쪽 두 장(사장님 2026-10-18 order-0015 [11] 5 「60초 시연 영상을 만들어 보고에 붙여라 … 가짜 카카오로 찍었다고 화면에 적어라. 말과 글상자를 같게 하라」 · 일꾼 D1)
 *   stageHtml()  — 영상에 찍히는 무대 한 장: 위 띠(늘 보이는 「시험용 가짜 카카오로 찍었어요」) · 가운데 폰 화면(iframe 390×700 · 2배로 키움) · 아래 띠(장면 글상자 + 누름 수) · 누르는 곳 표시 · 맞추기 번쩍임
 *   cardHtml(card) — 친구가 받는 카톡 카드 흉내 한 장(진짜 카카오톡 카드는 카카오톡 안에서만 그려져 찍을 수 없음 · 글은 p-share.js cardOf() 가 만든 진짜 카드 글 그대로)
 *   모든 글씨는 390 폭 폰 기준 21px 이상(위 띠 21 · 글상자 24 · 누름 수 28) — 무대는 2배(--u)로 그려 영상에서 또렷하게
 *   이 파일은 사이트 파일이 아님(시험 서버가 아닌 Playwright 가 /__demo/ 주소로 끼워 줌) — 사이트에는 아무것도 올라가지 않음
 */
export const U = 2; // 390 폭 폰 기준 1px = 영상 2px
export const DISCLAIMER = '시험용 가짜 카카오로 찍었어요';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export function stageHtml({frameSrc = 'about:blank', u = U} = {}) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>시연 무대</title>
<link rel="stylesheet" href="/atlas/fonts.css">
<style>
:root{--u:${u}px}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#0b0f17;color:#fff;overflow:hidden;width:calc(390*var(--u));height:calc(844*var(--u));font-family:"Pretendard","Noto Sans CJK KR","Noto Sans KR","Apple SD Gothic Neo",system-ui,sans-serif}
#top{position:absolute;left:0;top:0;width:100%;height:calc(44*var(--u));background:#ffb300;color:#111;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(21*var(--u));letter-spacing:-.02em;z-index:5}
#phone{position:absolute;left:0;top:calc(44*var(--u));width:390px;height:700px;border:0;background:#000;transform:scale(${u});transform-origin:0 0}
#bot{position:absolute;left:0;top:calc(744*var(--u));width:100%;height:calc(100*var(--u));background:#101828;display:flex;align-items:center;gap:calc(8*var(--u));padding:0 calc(12*var(--u));z-index:5}
#cap{flex:1;min-width:0;font-weight:800;font-size:calc(24*var(--u));line-height:1.25;letter-spacing:-.03em;color:#fff;word-break:keep-all}
#cap.in{animation:capin 260ms ease-out}
@keyframes capin{from{opacity:0;transform:translateY(calc(6*var(--u)))}to{opacity:1;transform:none}}
#chip{flex:none;width:calc(124*var(--u));height:calc(80*var(--u));border-radius:calc(14*var(--u));background:#ffb300;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
#tag{font-size:calc(21*var(--u));font-weight:700}
#num{font-size:calc(28*var(--u));font-weight:900}
#num.bump{animation:bump 320ms ease-out}
@keyframes bump{0%{transform:scale(1.35)}100%{transform:scale(1)}}
#tap{position:absolute;left:0;top:0;width:calc(56*var(--u));height:calc(56*var(--u));margin:calc(-28*var(--u)) 0 0 calc(-28*var(--u));border-radius:50%;border:calc(4*var(--u)) solid #ffb300;background:rgba(255,179,0,.26);box-shadow:0 0 0 calc(2*var(--u)) rgba(0,0,0,.6);pointer-events:none;opacity:0;z-index:50}
#tap.on{animation:press 720ms ease-out forwards}
@keyframes press{0%{opacity:0;transform:scale(1.9)}26%{opacity:1;transform:scale(1)}56%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1)}}
#seq{position:absolute;left:0;top:calc(841*var(--u));width:calc(24*var(--u));height:calc(3*var(--u));display:flex;z-index:60}
#seq i{display:block;width:calc(3*var(--u));height:100%;background:#101828}
#seq i.on{background:#2a3f66}
</style></head><body>
<div id="top">${esc(DISCLAIMER)}</div>
<iframe id="phone" name="phone" title="폰 화면" src="${esc(frameSrc)}"></iframe>
<div id="bot"><div id="cap"></div><div id="chip"><span id="tag"></span><b id="num">누름 0</b></div></div>
<div id="tap"></div><div id="seq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<script>
(() => {
  const u = ${u};
  const $ = id => document.getElementById(id);
  // 장면이 바뀔 때마다 아래 왼쪽 끝 여덟 칸(거의 안 보이는 표)에 번호를 새겨 둠 — 찍은 그림에서 그 번호를 읽어 「글이 처음 보인 그림」을 찾아 소리를 거기에 맞춤
  let seq = 0;
  const cells = () => document.querySelectorAll('#seq i');
  const bump = () => { seq = (seq + 1) & 255; cells().forEach((el, k) => el.classList.toggle('on', !!(seq & (1 << k)))); return seq; };
  const done = s => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r({t: Date.now(), seq: s}))));
  window.stage = {
    u,
    /** 글상자 글(+ 오른쪽 칸 이름표)을 바꿈 */
    cap: async (t, tag) => { const s = bump(); const c = $('cap'); c.textContent = t; c.classList.remove('in'); void c.offsetWidth; if (t) c.classList.add('in'); if (tag != null) $('tag').textContent = tag; return done(s); },
    /** 누르는 곳 표시와 누름 수를 같은 그림에 함께 올림 */
    tapNum: async (x, y, n) => {
      const s = bump(), e = $('tap'), c = $('num');
      e.classList.remove('on'); e.style.left = (x * u) + 'px'; e.style.top = (y * u) + 'px';
      c.textContent = '누름 ' + n; c.classList.remove('bump');
      void e.offsetWidth; void c.offsetWidth; e.classList.add('on'); c.classList.add('bump');
      return done(s);
    },
    now: async () => done(seq),
  };
})();
</script></body></html>`;
}

/** 친구가 받는 카톡 카드 흉내 — card = p-share.js cardOf() 의 {title, said[], value, imageUrl, buttons[{title, url}], url} */
export function cardHtml(card, {sentAt = '오후 3:12', dayLabel = '10월 12일'} = {}) {
  const b = card.buttons ?? [];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>친구 카톡 카드(시험용 흉내)</title>
<link rel="stylesheet" href="/atlas/fonts.css">
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%;background:#dfe7ef;color:#1b1f27;font-family:"Pretendard","Noto Sans CJK KR","Noto Sans KR",system-ui,sans-serif}
.hd{height:56px;display:flex;align-items:center;gap:12px;padding:0 16px;background:#cfd9e4;border-bottom:1px solid #b9c6d4;font-size:21px}
.hd b{font-weight:800}.hd .hint{margin-left:auto;font-size:17px;color:#33414f;font-weight:700}
.day{margin:16px auto 8px;width:max-content;padding:4px 16px;border-radius:999px;background:rgba(0,0,0,.14);font-size:17px;color:#26323f}
.row{display:flex;align-items:flex-start;gap:8px;padding:8px 16px 0}
.av{flex:none;width:44px;height:44px;border-radius:16px;background:#8fa3b8;color:#fff;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800}
.bub{flex:1;min-width:0}
.card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid #c9d3de}
.card img{display:block;width:100%;height:auto;aspect-ratio:1200/630;object-fit:cover}
.body{padding:16px}
.t{display:block;font-size:24px;font-weight:800;margin-bottom:8px}
.d{margin:0 0 4px;font-size:21px;line-height:1.35;color:#2b3340}
.v{margin:8px 0 0;font-size:21px;font-weight:800;color:#111}
.btn{display:flex;align-items:center;justify-content:center;min-height:56px;border-top:1px solid #dbe2ea;font-size:21px;font-weight:800;color:#1b1f27;text-decoration:none;background:#fff}
.btn.p{background:#f2f5f8}
small{display:block;margin:4px 0 0 8px;font-size:17px;color:#4b5a69}
</style></head><body>
<div class="hd"><span>‹</span><b>친구</b><span class="hint">카톡 카드 모양(시험용 흉내)</span></div>
<div class="day">${esc(dayLabel)}</div>
<div class="row"><span class="av">친</span><div class="bub"><div class="card">
<img src="${esc(card.imageUrl ? new URL(card.imageUrl, 'http://x').pathname : '/og-makbi.jpg')}" alt="">
<div class="body"><b class="t">${esc(card.title)}</b>${(card.said ?? []).map(s => `<p class="d">${esc(s)}</p>`).join('')}<p class="v">${esc(card.value)}</p></div>
<a class="btn p" id="start" href="${esc(b[0]?.url ?? '#')}">${esc(b[0]?.title ?? '')}</a>
<a class="btn" id="see" href="${esc(b[1]?.url ?? '#')}">${esc(b[1]?.title ?? '')}</a>
</div><small>${esc(sentAt)}</small></div></div>
</body></html>`;
}
