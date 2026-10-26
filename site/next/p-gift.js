/* 상품권 방(#/gift) — 사장님 2026-10-22(서울) 03:38 「상품권 받는곳이 사용자자 이용많이 한 곳에 있어야 해 구글과 잡스라면 어떻개 하겠어 그렇게해 질문하지말고 바로 해」
   · 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해 사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」
   명령문 원문 docs/design/gift-2026-10-22/order-0149.txt · order-0338.txt
   구글 = 사람들이 이미 있는 곳에서 한 번에 닿음 — 모든 쪽 위 막대의 금빛 선물 단추(app.js giftBtn) → 이 쪽 · 앱 밖(소개 쪽)으로 나가지 않고 여기서 끝냄
   잡스 = 한 쪽 · 걸음 셋(소개 → 1분 → 받기) · 지금 할 걸음 하나만 금빛 번호 · 걸음마다 단추 하나 · 꾸밈 없이 글과 가는 선
   약속을 먼저(「상품권은 우주 영상 1분을 끝까지 본 분께만」) · 본 초 = 실제로 틀어진 구간(gift-rule.js · 건너뛰기 · 빨리 감기는 셈 밖)
   끝까지 본 기기는 소개 쪽(/hello.html)과 같은 표시(atlas:gift:seen) — 어느 쪽에서 봐도 둘 다 열림 · 표시는 이 기기에만(서버로 안 감 · 처리방침에 적음)
   글은 textContent 로만 · 이름은 brand.js · 폭죽 없음 · 사고팔기 · 앞날 말 없음 · 영어는 i18n(en-src.json) */
import {t as L} from './i18n.js';
import {NAME, josa} from './brand.js';
import {GIFT, playedOf, reachOf, done, clampSeek, sayLeft} from './gift-rule.js';
import {ref, withRef, me, claim, askGift, PER} from './gift-ref.js'; // 친구 소개 세기(사장님 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」 · 13:38 「내가 직접 보낼 거야」)

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const seenDay = () => { try { return localStorage.getItem(GIFT.key) || ''; } catch { return ''; } };
const markSeen = () => { try { localStorage.setItem(GIFT.key, new Date().toISOString().slice(0, 10)); } catch { /* 저장이 막힌 기기 — 이번에만 열림 */ } };

/** 걸음 하나 — 번호(지금 할 걸음만 금빛) · 제목 · 한 줄 · 그 밖(단추 · 영상) */
function step(n, title, line, ...rest) {
  return h('li', {class: 'gf-step', 'data-step': String(n)}, h('span', {class: 'gf-no', 'aria-hidden': 'true', text: String(n)}),
    h('div', {class: 'gf-body'}, h('h2', {class: 'gf-h2', text: title}), h('p', {class: 'gf-p', text: line}), ...rest));
}

/* 맨 위 결 단추 글(총정리 2026-10-22 D6 · D7) — 지금 금빛 걸음을 따라 바뀜 · 누르면 그 걸음으로 내려감(단추 · 약속 · 걸음 글은 그대로) */
const NOW = {1: '지금 할 일 · 친구 3명에게 소개해요 ↓', 2: '지금 할 일 · 우주 영상 1분 보기 ↓', 3: '영상을 끝까지 봤어요 · 상품권 주세요 ↓'};
const GIFT_FRIENDS = PER;
/** 친구 수 글 — 내 주소를 연 친구 수(서버가 셈 · /api/gift/me) · 3명마다 상품권 하나 */
export const friendLine = (n, next = GIFT_FRIENDS) => (n < next ? `친구 ${n}명이 열었어요. ${next - n}명 더 열면 상품권을 받을 수 있어요.` : `친구 ${n}명이 열었어요. 상품권을 받을 수 있어요.`);

export function render() {
  const root = h('div', {class: 'gf', 'data-page': 'gift'});
  const now = h('button', {type: 'button', class: 'gf-now'}); // 결 — 약속 칸 바로 밑 한 줄(지금 할 일)
  /* ① 소개 — 소개 쪽(/hello.html · 친구가 열면 우주 · 상품권 칸까지 있음)을 보내기 글상자로 · 주소에 보낸 사람 표(r)가 붙음 · 친구가 열면 서버가 셈(화면 찍기 없음) */
  const said = h('p', {class: 'gf-said', role: 'status', text: friendLine(0)});
  let mine = null; // {friends, next, can, claims} — /api/gift/me
  const count = async () => { const m = await me(); if (!m) { said.textContent = L('? 친구 수를 아직 못 받았어요. 잠시 뒤 다시 열어 주세요.'); return; } mine = m; said.textContent = L(friendLine(m.friends, m.next)); if (m.can && !opened) on(2); if (opened && m.pending?.contact) showCall(m.pending); };
  const again = h('button', {type: 'button', class: 'gf-again', text: '친구 수 다시 보기'});
  again.addEventListener('click', () => { count(); });
  const send = h('button', {type: 'button', class: 'gf-btn kk-pgx kk-yel', text: '카톡 보내기'}); // 「카톡 보내기」(사장님 2026-10-25 12:00 「진짜모든곳에」 · 12:24 「어」) — 이 쪽 보내기 단추라 kk-all.js 가 쪽 단추를 또 달지 않음
  send.addEventListener('click', async () => {
    await ref().catch(() => null); // 보낸 사람 표를 먼저 셈(주소에 붙임)
    await nx().shareBox({kind: 'share', title: L(josa(NAME, '를') + ' 소개합니다'), text: L(`앵무새 ${josa(NAME, '는')} 싹에서 꽃이 되는 종목을 지난 기록으로 찾아 줘요. 앵무새는 들은 것만 말해요!`), url: withRef(new URL('/hello.html', location.origin).href)}).catch(() => null); // 보내는 글 = 본질 1(총정리 D14)
  });
  // 화면 찍는 법(옛 접은 칸)은 뺌 — 친구가 열면 서버가 셈(2026-10-25 13:40 「편지를 보내지 않아도」)
  /* ② 우주 영상 1분 — 기본 막대 없음(건너뛸 막대가 없게) · 큰 단추 하나로 보기 · 멈추기 */
  const v = h('video', {class: 'gf-uv', playsinline: true, preload: 'none', poster: '/media/universe-poster.jpg', width: 720, height: 1280,
    'aria-label': josa(NAME, '의') + ' 우주 1분 — 오로라 · 피터팬과 팅커벨 · 우주선 · 황룡과 청룡 · 천사 다섯 · 하얀 비숑 · 혜성과 별똥별 · 비행접시 · 앵무새 ' + NAME + ' · 하트 별자리'},
  h('source', {src: '/media/universe.mp4', type: 'video/mp4'}), h('source', {src: '/media/universe.webm', type: 'video/webm'}));
  const play = h('button', {type: 'button', class: 'gf-btn gf-play', 'aria-pressed': 'false', text: '우주 영상 보기'});
  const bar = h('progress', {class: 'gf-bar', max: String(GIFT.need), value: '0'});
  const left = h('p', {class: 'gf-left', role: 'status'});
  /* ③ 받기 — 끝까지 본 뒤에만 · 「상품권 주세요」 한 단추(사장님 2026-10-26 16:14 「… 선물받기 누르면 내 카톡과 연결되개 내 카톡 아이디나 내 전화번호 남겨놓고 상푸권 주세요 버튼 만들어그렣게 반자동으로 해놓아」 · 16:16 「일단 내 번호 남겨」)
     서버가 친구 셋을 맞대 본 뒤에만 사장님 번호와 확인 번호 넷을 줌(번호는 코드에 없음 · lib/atlas11/gift.mjs ask) → 그분이 카톡 · 문자로 확인 번호를 보냄 → 사장님이 누군지 알고 직접 보냄
     사장님 번호가 서버에 아직 없으면(503) 예전 전화번호 칸(13:38 「내가 직접 보낼 거야」 길) */
  const lock = h('p', {class: 'gf-lock', text: '영상을 끝까지 보면 여기에 「상품권 주세요」 단추가 나와요.'});
  const thx = h('p', {class: 'gf-thx'});
  const ask = h('button', {type: 'button', class: 'gf-btn gf-claim', text: '상품권 주세요'});
  const res = h('p', {class: 'gf-res', role: 'status'});
  const num = h('b', {class: 'gf-phone'}), code = h('b', {class: 'gf-code'});
  const copy = h('button', {type: 'button', class: 'gf-btn gf-copy', text: '번호 복사'});
  const sms = h('a', {class: 'gf-btn gf-sms', text: '문자 보내기'}); // 고리 주소는 번호를 받은 뒤에만(showCall) — 그 전엔 고리가 아님
  const call = h('div', {class: 'gf-callbox', hidden: true},
    h('p', {class: 'gf-p', text: '사장님께 카톡이나 문자로 확인 번호를 보내 주세요.'}),
    h('p', {class: 'gf-row'}, h('span', {text: '사장님 번호'}), num),
    h('p', {class: 'gf-row'}, h('span', {text: '확인 번호'}), code),
    h('div', {class: 'gf-acts'}, copy, sms),
    h('p', {class: 'gf-p', text: '번호를 저장하면 카톡 친구에도 보여요.'}));
  const dash = p => p.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  let shown = '';
  /** 사장님 번호 · 확인 번호 — 서버가 준 것만(친구 셋을 채운 기기) */
  function showCall(r) {
    const p = String(r?.contact ?? '').replace(/\D/g, ''), c = String(r?.code ?? '');
    if (!/^01\d{8,9}$/.test(p) || !/^\d{4}$/.test(c)) return;
    shown = dash(p); num.textContent = shown; code.textContent = c;
    sms.setAttribute('href', 'sms:' + p + '?&body=' + encodeURIComponent(`${NAME} 상품권 주세요. 확인 번호 ${c}`)); // 받는 사람 = 사장님(한국어 그대로)
    call.hidden = false; ask.hidden = true; res.textContent = L('확인 번호를 꼭 같이 보내 주세요.');
  }
  /* 한 번에 문자 창(사장님 2026-10-26 22:44 「야 너 사용자 정말 쉽게 싱품 받게 기획해 100가지 알겠지 그중에ㅛㅓ 제일 쉬운거 세팅 해놓아」) —
     「상품권 주세요」를 누르면 서버가 맞대 본 뒤 문자 창이 바로 열림(사장님 번호 · 확인 번호가 다 들어 있음 · 받는 분은 보내기만) · 안 열리면 아래 칸의 「문자 보내기」 */
  const openSms = () => { const u = sms.getAttribute('href') ?? ''; if (!u.startsWith('sms:')) return; res.textContent = L('문자 창을 열었어요. 보내기만 누르면 끝이에요.'); try { location.href = u; } catch { /* 문자 창이 안 열리는 곳 — 아래 칸 단추로 */ } };
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(shown); res.textContent = L('번호를 담았어요.'); }
    catch { const r = document.createRange(); r.selectNodeContents(num); const s = getSelection(); s.removeAllRanges(); s.addRange(r); res.textContent = L('번호를 길게 눌러 복사해 주세요.'); }
  });
  /* 예전 전화번호 칸 — 사장님 번호가 서버에 아직 없을 때만 보임 */
  const tel = h('input', {id: 'gf-tel', class: 'gf-tel-in', type: 'tel', inputmode: 'numeric', autocomplete: 'tel', maxlength: '13', placeholder: '010-1234-5678'});
  const agree = h('input', {id: 'gf-agree', class: 'gf-agree', type: 'checkbox'});
  const send2 = h('button', {type: 'button', class: 'gf-btn gf-claim2', text: '번호 보내기'});
  const form = h('div', {class: 'gf-form', hidden: true},
    h('label', {class: 'gf-lab', for: 'gf-tel', text: '상품권 받을 전화번호'}), tel,
    h('label', {class: 'gf-ok', for: 'gf-agree'}, agree, h('span', {text: '상품권을 보내려고 이 번호를 사장님께만 보여 드려요. 보내면 바로 지워요. 동의해요.'})),
    send2);
  const got = h('div', {class: 'gf-got', hidden: true}, thx, ask, res, call, form);
  const bad = r => (r.status === 409 ? friendLine(r.friends ?? mine?.friends ?? 0, r.next ?? mine?.next ?? GIFT_FRIENDS) : r.status === 429 ? '조금 뒤에 다시 눌러 주세요.' : '? 아직 못 열었어요. 잠시 뒤 다시 눌러 주세요.');
  ask.addEventListener('click', async () => {
    ask.disabled = true; res.textContent = L('여는 중이에요…');
    const r = await askGift({watched: true});
    ask.disabled = false;
    if (r.ok) { showCall(r); openSms(); return; }
    if (r.status === 503) { form.hidden = false; ask.hidden = true; res.textContent = L('전화번호를 적어 주시면 사장님이 보내 드려요.'); return; }
    res.textContent = L(bad(r));
  });
  send2.addEventListener('click', async () => {
    if (!agree.checked) { res.textContent = L('동의에 표시해 주세요.'); agree.focus(); return; }
    send2.disabled = true; res.textContent = L('보내는 중이에요.');
    const r = await claim({phone: tel.value, agree: true, watched: true});
    send2.disabled = false;
    if (r.ok) { res.textContent = L('받았어요. 사장님이 이 번호로 카톡 선물을 보내 드려요.'); tel.value = ''; agree.checked = false; count(); return; }
    res.textContent = L(r.error === 'phone' ? '전화번호를 다시 봐 주세요. 010으로 시작하는 번호예요.' : bad(r));
  });
  const steps = h('ol', {class: 'gf-steps'},
    step(1, '친구 3명에게 소개해요', `카톡으로 ${josa(NAME, '를')} 보내요. 친구가 열면 여기서 저절로 세요.`, send, said, again),
    step(2, '우주 영상 1분을 끝까지 봐요', '우주선, 용, 오로라가 나와요.', v, play, bar, left),
    step(3, '상품권 주세요를 눌러요', '누르면 문자 창이 열려요. 보내기만 누르면 끝이에요.', lock, got));
  let opened = false, cur = 1;
  const on = n => { cur = n; for (const li of steps.children) li.classList.toggle('on', li.getAttribute('data-step') === String(n)); now.textContent = L(NOW[n]); };
  /* 결 단추를 누르면 — 지금 걸음(3 = 열린 받기 칸)으로 내려가 그 걸음의 첫 단추에 초점(보내기 · 영상 보기 · 상품권 받기) */
  now.addEventListener('click', () => {
    const to = cur === 3 ? got : steps.querySelector('.gf-step.on'), first = cur === 1 ? send : cur === 2 ? play : !ask.hidden ? ask : !call.hidden ? copy : tel;
    to?.scrollIntoView({block: 'start', behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    first?.focus({preventScroll: true});
  });
  const watched = () => playedOf(v.played);
  const show = s => { bar.value = Math.min(GIFT.need, s); bar.textContent = L(sayLeft(s)); left.textContent = L(sayLeft(s)); };
  const open = first => {
    if (opened) return; opened = true;
    got.hidden = false; lock.hidden = true; show(GIFT.need); on(3);
    thx.textContent = L(first ? '끝까지 봐 주셔서 고마워요! 이제 상품권을 받을 수 있어요.' : '이 휴대폰에서 영상을 끝까지 봤어요. 상품권을 받을 수 있어요.');
    if (first) markSeen();
    if (mine?.pending?.contact) showCall(mine.pending);
    globalThis.__gift = {open: true, first, watched: Math.round(watched() * 10) / 10, where: 'app'};
  };
  const label = () => { play.textContent = L(!v.paused ? '잠깐 멈추기' : v.ended ? '다시 보기' : watched() > 0 ? '이어서 보기' : '우주 영상 보기'); play.setAttribute('aria-pressed', v.paused ? 'false' : 'true'); };
  const toggle = () => {
    if (!v.paused) { v.pause(); return; }
    if (v.ended) v.currentTime = 0;
    const p = v.play(); if (p && p.catch) p.catch(() => { left.textContent = L('영상이 아직 안 열렸어요. 잠시 뒤 다시 눌러 주세요.'); });
    if (!opened) on(2);
  };
  play.addEventListener('click', toggle);
  v.addEventListener('click', toggle); // 그림을 눌러도 보기 · 멈추기
  v.addEventListener('play', label); v.addEventListener('pause', label);
  v.addEventListener('timeupdate', () => { if (!opened) show(watched()); });
  v.addEventListener('seeking', () => { const to = clampSeek(v.currentTime, reachOf(v.played)); if (to !== v.currentTime) v.currentTime = to; }); // 앞으로 건너뛰기 막음(되감기는 됨)
  v.addEventListener('ratechange', () => { if (v.playbackRate !== 1) v.playbackRate = 1; }); // 빨리 감기 막음
  v.addEventListener('ended', () => {
    label();
    if (done(watched(), v.duration, true)) open(true);
    else if (!opened) { left.textContent = L('건너뛴 곳이 있어요. 처음부터 다시 봐 주세요.'); v.currentTime = 0; }
  });
  v.addEventListener('error', () => { left.textContent = L('영상이 아직 안 열렸어요. 잠시 뒤 다시 눌러 주세요.'); }, true);
  if (seenDay()) open(false); else { show(0); on(1); globalThis.__gift = {open: false, where: 'app'}; }
  count(); // 내 주소를 연 친구 수(서버)
  label();
  root.append(
    h('h1', {class: 'gf-h1', text: '상품권'}),
    h('p', {class: 'gf-lead'}, h('b', {text: '스타벅스 상품권 1만원'}), h('span', {text: '친구 3명에게 소개하고 우주 영상 1분을 보면 드려요.'})),
    h('div', {class: 'gf-vow', role: 'note'}, h('b', {text: '먼저 알려 드려요'}), h('span', {text: '상품권은 우주 영상 1분을 끝까지 본 분께만 드려요. 이 약속은 꼭 지켜요.'})),
    now,
    steps,
    h('div', {class: 'gf-pn'}, h('p', {text: '1분은 소중한 시간이에요. 내어 주셔서 고마워요.'}), h('p', {text: '3명마다 1만원씩, 여러 번 받을 수 있어요.'}), h('p', {text: '이벤트가 끝날 때는 이 자리에 먼저 알려 드려요.'})),
    h('p', {class: 'gf-fine'}, '사장님 번호는 친구 셋이 연 분에게만 보여요. ', h('a', {href: '/privacy.html', text: '개인정보 처리방침 ›'})));
  return {title: '상품권', nodes: [root]};
}
