/* 커피 쿠폰 · 관리자 화면(사장님 2026-10-19(싱가포르) 13:54 「11단계다 하면 한사람에게 포인트 쌓이고 그러면 커피쿠폰 한장 주는 시스템 만들어 … 이게 관리자 페이지도 있어야 해」
   · 13:58 「열번 해야 해 한달에 한번 어 내가 보낼거야」)
   규칙 = 서버 lib/atlas11/coupon.mjs RULE 사본(시험 tests/atlas11/coupon.test.mjs 가 맞댐): 열한 질문을 끝까지 = 1점 · 하루 1점까지 · 10점 = 쿠폰 1장 · 한 사람에 한 달 1장
   · 쿠폰 칸(couponCard) = 매매일지 쪽 위 · 카톡 회원이면 서버 점수와 이번 달 번호 · 아니면 이 기기 기록으로 센 점수(번호 없음 — 받으려면 카톡 가입)
   · 관리자 화면(#/admin · renderAdmin) = 사장님 열쇠 기기만(p-jinhwa ownerOk) — 쿠폰 번호 맞대기(처음이면 「보냄」 표시) · 쿠폰 목록 · 날마다 가입 수 · 카톡 가입이 꺼져 있으면 그 까닭과 할 일 한 줄
   · 이름 · 전화 · 카톡 번호를 받지 않음 — 받는 사람이 번호를 보내고 사장님이 맞대 본 뒤 선물을 직접 보냄 · 글은 textContent 로만(보안 규칙) */
import {kakao, SIGNUP} from '/next/kakao.js';
import {ownerOk} from '/next/p-jinhwa.js';
import {RULE, pointDays, seoulDay} from '/next/coupon-rule.js';

const K_WHY = 'atlas:godori-why', OWNER = 'atlas11:invite:owner';
const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const toast = t => { try { nx().toast(t); } catch { /* 알림 못 띄움 */ } };
const localRecords = () => { try { const x = JSON.parse(localStorage.getItem(K_WHY) || '[]'); return Array.isArray(x) ? x : null; } catch { return null; } };

/** 번호 보내기 단추 — 휴대폰 보내기 창(카톡이 그 안에) · 못 열면 번호를 복사 */
export function sendCode(text) {
  const b = h('button', {type: 'button', class: 'cp-go', text: '번호 보내기'});
  b.addEventListener('click', async () => { try { if (navigator.share) { await navigator.share({text}); return; } } catch { return; } try { await navigator.clipboard.writeText(text); toast('번호를 복사했어요.'); } catch { toast('? 번호를 복사하지 못했어요.'); } });
  return b;
}
/** 쿠폰 칸 — 점수 막대 하나 · 지금 할 일 한 줄 · 번호(있을 때) */
export function couponCard() {
  const box = h('section', {class: 'cp-card', 'aria-label': '커피 쿠폰'});
  const paint = () => {
    const S = kakao?.coffee?.() ?? null, recs = localRecords();
    const n = S ? S.n : recs ? Math.min(pointDays(recs).length, RULE.need) : null;
    const bar = h('div', {class: 'cp-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(RULE.need), 'aria-valuenow': String(n ?? 0)}, h('i', {class: 'cp-fill'}));
    if (Number.isInteger(n)) bar.firstChild.style.width = Math.round(n / RULE.need * 100) + '%';
    const rows = [h('p', {class: 'cp-h'}, h('span', {text: '커피 쿠폰까지'}), h('b', {class: 'num', text: n == null ? '?' : `${n} / ${RULE.need}`})), bar,
      h('p', {class: 'cp-t', text: '열한 질문을 끝까지 하면 하루에 1점이 쌓여요. 10점이면 커피 쿠폰 한 장이에요. 한 사람에 한 달 한 장이에요.'})];
    if (S?.code) rows.push(h('p', {class: 'cp-t', text: '이번 달 쿠폰 번호예요. 둘이를 알려 준 분께 이 번호를 카톡으로 보내 주세요. 확인한 뒤 커피 쿠폰을 보내 드려요.'}), h('p', {class: 'cp-code num', text: S.code}), sendCode('둘이 커피 쿠폰 번호 ' + S.code)); // 받을 곳 — 사장님 15:24 「너가 알아서 해」: 알려 준 분께 카톡으로(이름 · 전화를 받지 않음)
    else if (S?.wait) rows.push(h('p', {class: 'cp-t', text: '이번 달 쿠폰은 이미 받았어요. 다음 달에 다시 받을 수 있어요.'}));
    else if (!S && kakao?.on) rows.push(h('p', {class: 'cp-t', text: '쿠폰을 받으려면 카톡으로 가입해 주세요. 점수는 이 휴대폰 기록으로 세어 두었어요.'}), (() => { const b = h('button', {type: 'button', class: 'cp-go', text: '카톡으로 가입하기'}); b.addEventListener('click', () => kakao.start(location.hash || '#/why')); return b; })());
    else if (!S) rows.push(h('p', {class: 'cp-t cp-q', text: '쿠폰 받기는 카톡 가입이 열리면 시작해요. 점수는 이 휴대폰에 쌓여요.'}));
    box.replaceChildren(...rows);
  };
  paint();
  kakao?.ready?.().then(paint).catch(() => {});
  return box;
}

/* ── 관리자 화면(#/admin) ── */
const ownerKey = () => { try { const k = localStorage.getItem(OWNER); return typeof k === 'string' && k.length >= 16 && k.length <= 128 ? k : null; } catch { return null; } };
const getOwner = async path => { try { const r = await fetch(path, {headers: {'x-atlas-owner': ownerKey() ?? ''}, cache: 'no-store', credentials: 'same-origin'}); return {status: r.status, json: r.ok ? await r.json() : null}; } catch { return {status: 0, json: null}; } };
const mdOf = iso => { const d = seoulDay(iso); return d ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?'; };

export async function renderAdmin() {
  const root = h('div', {class: 'adm', 'data-page': 'admin'}, h('h1', {class: 'adm-h1', text: '관리자 화면'}));
  if (!(await ownerOk())) { root.append(h('p', {class: 'empty', text: '사장님 휴대폰에서만 열려요.'})); return {title: '관리자 화면', nodes: [root]}; }
  const on = SIGNUP && (await kakao?.ready?.().then(() => kakao.on).catch(() => false));
  if (!on) root.append(h('section', {class: 'adm-sec'}, h('h2', {text: '카톡 가입이 꺼져 있어요'}),
    h('p', {text: '쿠폰은 카톡 가입한 사람에게만 생겨요. 가입을 켜려면 카카오 개발자 사이트의 열쇠 넷이 필요해요.'}),
    h('p', {text: '열쇠를 받는 차례는 「카카오 두 번 가입 — 사장님이 하실 일」 한 장에 있어요.'})));
  // ① 쿠폰 번호 맞대기
  const inp = h('input', {class: 'adm-in', type: 'text', maxlength: 24, placeholder: 'XXXX-XXXX-XXXX', 'aria-label': '쿠폰 번호', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false'});
  const btn = h('button', {type: 'button', class: 'adm-go', text: '확인'}), out = h('p', {class: 'adm-out', 'aria-live': 'polite'});
  btn.addEventListener('click', async () => {
    const v = inp.value.trim(); if (!v) { inp.focus(); return; }
    btn.disabled = true; const r = await getOwner('/api/kakao/verify?code=' + encodeURIComponent(v)); btn.disabled = false;
    const j = r.json;
    out.textContent = r.status === 404 || r.status === 0 ? '? 카톡 가입이 꺼져 있어 맞대 볼 수 없어요.' : r.status === 403 ? '? 사장님 휴대폰이 아니에요.'
      : !j?.ok ? '없는 번호예요. 번호를 다시 봐 주세요.' : j.kind === 'coffee' ? (j.used ? `이미 보낸 쿠폰이에요. ${mdOf(j.usedAt)}에 확인했어요.` : `맞는 쿠폰이에요. ${j.month?.slice(5) ?? '?'}월 쿠폰이에요. 커피 쿠폰을 보내 주세요.`)
      : j.used ? '이미 확인한 친구 소개 번호예요.' : '맞는 친구 소개 번호예요.';
  });
  root.append(h('section', {class: 'adm-sec'}, h('h2', {text: '쿠폰 번호 확인'}), h('p', {text: '받은 번호를 넣고 확인을 누르세요. 처음 확인하면 보낸 것으로 적혀요.'}), h('div', {class: 'adm-row'}, inp, btn), out));
  // ② 쿠폰 목록 · ③ 가입 수
  const [L, D] = on ? await Promise.all([getOwner('/api/kakao/coupons'), getOwner('/api/kakao/counts?days=30')]) : [null, null];
  const list = Array.isArray(L?.json?.coupons) ? L.json.coupons : null;
  root.append(h('section', {class: 'adm-sec'}, h('h2', {text: '쿠폰 목록'}),
    list == null ? h('p', {class: 'empty', text: on ? '? 쿠폰 목록을 받지 못했어요.' : '카톡 가입이 켜지면 여기에 쌓여요.'})
      : !list.length ? h('p', {text: '아직 생긴 쿠폰이 없어요.'})
      : h('ul', {class: 'adm-list'}, ...list.slice(0, 200).map(c => h('li', {}, h('span', {text: `${mdOf(c.at)} 생김`}), h('b', {class: c.used ? 'ok' : 'wait', text: c.used ? '보냄' : '보낼 차례'}))))));
  const days = Array.isArray(D?.json?.days) ? D.json.days : null;
  const sum = days ? days.reduce((a, d) => a + (Number.isInteger(d.done) ? d.done : 0), 0) : null;
  root.append(h('section', {class: 'adm-sec'}, h('h2', {text: '가입한 사람'}), h('p', {text: sum == null ? (on ? '? 가입 수를 받지 못했어요.' : '카톡 가입이 켜지면 여기에 쌓여요.') : `지난 30일 동안 ${sum}명이 가입했어요.`})));
  root.firstChild.after(await giftDesk()); // ⓪ 선물 받을 사람(사장님 2026-10-25 13:40 · 13:38 「내가 직접 보낼 거야」) — 제목 바로 밑(가장 먼저 볼 일)
  root.append(await helpDesk()); // ④ 고객센터 글(사장님 2026-10-21 22:54 · 22:55 · p-help.js)
  return {title: '관리자 화면', nodes: [root]};
}
/* ── 선물 받을 사람(사장님 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」 · 13:38 「내가 직접 보낼 거야」 · /api/gift/list · lib/atlas11/gift.mjs) ──
   친구 셋이 열고 영상을 다 본 사람이 적은 전화번호 · 연 친구 수 · 카톡에서 연 수 · 「보냄 표시」를 누르면 번호를 지움(끝 네 자리만 남김) · 글은 textContent 로만 */
const postGift = async (path, body) => { try { const r = await fetch(path, {method: 'POST', headers: {'content-type': 'application/json', 'x-atlas-owner': ownerKey() ?? ''}, body: JSON.stringify(body), cache: 'no-store', credentials: 'same-origin'}); return r.status; } catch { return 0; } };
const telShow = t => (/^\d{10,11}$/.test(t ?? '') ? t.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') : String(t ?? ''));
async function giftDesk() {
  const sec = h('section', {class: 'adm-sec adm-gift kk-skip'}, h('h2', {text: '선물 받을 사람'})); // kk-skip — 전화번호가 있는 칸이라 카톡 보내기를 달지 않음(kk-all.js)
  const r = await getOwner('/api/gift/list'), items = Array.isArray(r.json?.items) ? r.json.items : null;
  if (!items) { sec.append(h('p', {class: 'empty', text: r.status === 403 ? '? 사장님 휴대폰이 아니에요.' : '? 목록을 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); return sec; }
  let n = items.filter(x => x.state === 'wait').length;
  const say = h('p', {});
  const sayN = () => { say.textContent = n ? `보낼 차례 ${n}명이에요. 확인 번호를 보낸 분께 카톡 선물을 보내고 「보냄 표시」를 누르세요.` : '지금은 보낼 차례가 없어요.'; };
  sayN(); sec.append(say);
  if (items.length) sec.append(h('ul', {class: 'adm-list adm-glist'}, ...items.slice(0, 200).map(x => {
    // 「상품권 주세요」(사장님 2026-10-26 16:14 · 16:16) — 받는 분 번호 대신 확인 번호 넷(그분이 사장님께 카톡 · 문자로 보낸 번호와 맞대 봄)
    const done1 = x.kind === 'ask' ? `보냄 · 확인 번호 ${x.code ?? '????'}` : `보냄 · 끝 ${x.tail ?? '????'}`;
    const mark = x.state === 'wait' ? h('b', {class: 'wait', text: x.kind === 'ask' ? `확인 번호 ${x.code ?? '????'}` : x.phone ? telShow(x.phone) : `번호 지움 · 끝 ${x.tail ?? '????'}`}) : h('b', {class: 'ok', text: done1});
    const li = h('li', {}, h('span', {text: `${mdOf(x.at)} · 친구 ${x.friends ?? 0}명 · 카톡에서 ${x.kk ?? 0}명`}), mark);
    if (x.state === 'wait') {
      const b = h('button', {type: 'button', class: 'adm-go', text: '보냄 표시'});
      b.addEventListener('click', async () => { b.disabled = true; const st = await postGift('/api/gift/done', {id: x.id}); if (st === 200) { mark.replaceWith(h('b', {class: 'ok', text: done1})); b.remove(); n = Math.max(0, n - 1); sayN(); } else { b.disabled = false; toast('? 아직 못 적었어요. 다시 눌러 주세요.'); } });
      li.append(b);
    }
    return li;
  })));
  return sec;
}
export const render = renderAdmin;

/* ── 고객센터 글(사장님 2026-10-21 22:54 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간」 · /api/help/all · lib/atlas11/help.mjs) ──
   새것부터 · 한마디는 「읽음」 · 물음은 답 칸 + 「모두에게 보이기」(물음 글은 다듬어 보일 수 있음) · 지우기는 두 번 눌러야 · 말투(쉬운 말 · 곧은 말)를 보여 줌 — 같은 말투로 답하게
   글은 textContent 로만 · 사람이 쓴 글은 lang="ko" */
const PAGE_NAME = {home: '첫 화면', why: '매매일지', w: '회사', shorts: '시황', sub: '관심', me: '보유종목', t: '테마', jinhwa: '진화', find: '찾기', ch: '업종', surge: '급등', cal: '달력', cond: '조건', info: '도움말', up: '업데이트 기록', talk: '이야기', time: '봉인', today: '오늘 장', gdr: '둘이 칸', admin: '관리자 화면'};
const TONE_NAME = {good: '좋았어요', want: '바라요', broken: '안 돼요'};
const postOwner = async body => { try { const r = await fetch('/api/help', {method: 'POST', headers: {'content-type': 'application/json', 'x-atlas-owner': ownerKey() ?? ''}, body: JSON.stringify(body), cache: 'no-store', credentials: 'same-origin'}); return r.status; } catch { return 0; } };
async function helpDesk() {
  const sec = h('section', {class: 'adm-sec adm-help'}, h('h2', {text: '고객센터 글'}));
  const r = await getOwner('/api/help/all'), items = Array.isArray(r.json?.items) ? r.json.items : null, c = r.json?.counts;
  if (!items) { sec.append(h('p', {class: 'empty', text: r.status === 403 ? '? 사장님 휴대폰이 아니에요.' : '? 고객센터 글을 받지 못했어요.'})); return sec; }
  sec.append(h('p', {text: `새 글 ${c?.fresh ?? 0}개 · 답을 기다리는 물음 ${c?.waiting ?? 0}개 · 모두 ${c?.all ?? items.length}개`}));
  if (!items.length) { sec.append(h('p', {text: '아직 남긴 글이 없어요.'})); return sec; }
  const again = async () => { sec.replaceWith(await helpDesk()); };
  sec.append(h('ul', {class: 'adm-hl'}, ...items.map(it => {
    const head = [it.kind === 'ask' ? '물음' : '한마디 · ' + (TONE_NAME[it.tone] ?? '?'), mdOf(it.at), it.voice === 'direct' ? '곧은 말' : '쉬운 말', it.page ? (PAGE_NAME[it.page] ?? it.page) + '에서' : null].filter(Boolean).join(' · ');
    const li = h('li', {class: 'adm-hrow' + (it.status === 'new' ? ' fresh' : '')}, h('p', {class: 'adm-hh', text: head}), h('p', {class: 'adm-ht', lang: 'ko', text: it.text}));
    const btns = h('div', {class: 'adm-row adm-hb'});
    if (it.kind === 'ask') {
      const ta = h('textarea', {class: 'adm-ta', rows: 3, maxlength: '1000', placeholder: it.voice === 'direct' ? '곧은 말로 답해 주세요' : '쉬운 말로 답해 주세요', 'aria-label': '답'}); ta.value = it.answer ?? '';
      const pubQ = h('input', {class: 'adm-in', type: 'text', maxlength: '200', 'aria-label': '모두에게 보일 물음', placeholder: '모두에게 보일 물음(다듬기)'}); pubQ.value = it.text.slice(0, 200);
      const pub = h('input', {type: 'checkbox', class: 'adm-ck'}); pub.checked = !!it.public;
      const go = h('button', {type: 'button', class: 'adm-go', text: it.answer ? '답 고치기' : '답 달기'});
      go.addEventListener('click', async () => { go.disabled = true; const s = await postOwner({op: 'answer', id: it.id, answer: ta.value, public: pub.checked, pubQ: pubQ.value}); go.disabled = false; if (s === 200) { toast('답을 달았어요.'); again(); } else toast(s === 400 ? '두 글자 넘게 적어 주세요.' : '? 답을 달지 못했어요.'); });
      li.append(ta, h('label', {class: 'adm-pub'}, pub, h('span', {text: '모두에게 보이기 — 많이 묻는 것에 올림'})), pubQ);
      btns.append(go);
    } else if (it.status === 'new') {
      const rd = h('button', {type: 'button', class: 'adm-go', text: '읽음'});
      rd.addEventListener('click', async () => { rd.disabled = true; if ((await postOwner({op: 'read', id: it.id})) === 200) again(); else { rd.disabled = false; toast('? 읽음으로 바꾸지 못했어요.'); } });
      btns.append(rd);
    }
    const del = h('button', {type: 'button', class: 'adm-del', text: '지우기'}); let armed = 0;
    del.addEventListener('click', async () => {
      if (!armed) { del.textContent = '한 번 더 누르면 지워요'; armed = setTimeout(() => { armed = 0; del.textContent = '지우기'; }, 4000); return; }
      clearTimeout(armed); del.disabled = true; if ((await postOwner({op: 'drop', id: it.id})) === 200) { toast('지웠어요.'); again(); } else { del.disabled = false; toast('? 지우지 못했어요.'); }
    });
    btns.append(del); li.append(btns);
    return li;
  })));
  return sec;
}
