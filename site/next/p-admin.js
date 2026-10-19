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
    if (S?.code) rows.push(h('p', {class: 'cp-t', text: '이번 달 쿠폰 번호예요. 돌이를 알려 준 분께 이 번호를 카톡으로 보내 주세요. 확인한 뒤 커피 쿠폰을 보내 드려요.'}), h('p', {class: 'cp-code num', text: S.code}), sendCode('돌이 커피 쿠폰 번호 ' + S.code)); // 받을 곳 — 사장님 15:24 「너가 알아서 해」: 알려 준 분께 카톡으로(이름 · 전화를 받지 않음)
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
  return {title: '관리자 화면', nodes: [root]};
}
export const render = renderAdmin;
