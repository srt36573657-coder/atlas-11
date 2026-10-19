/* 가짜 돈 연습(#/game · 사장님 2026-10-19(싱가포르) 15:02 「회원 가입 한 사람에게 가상머니 10억씩을 준다 그래서 30억을 만들면 스타벅스 상품권 10만원짜리 10장 준다 기간은 상관없가 등수도 개의치 않는다 조건은 간단하다」 · 15:04 「일단해」)
   셈 = site/next/game-rule.js(서버 lib/atlas11/game.mjs 와 같음) · 카톡 회원이면 서버 계좌(/api/kakao/game · 값은 서버가 받음 · 30억이면 상 번호) · 아니면 이 기기 계좌(atlas:dori-game · 상 없음)
   열림: PUBLIC 이 false 인 동안 사장님 열쇠 기기에서만(규칙 13 「담겠어 · 팔겠어」는 변호사 서면 의견 전까지 공개 화면에 없음 · 본질 「하지 않을 일」과 부딪힘 — 사장님께 여쭘)
   글은 textContent 로만(보안 규칙) · 진짜 돈은 오가지 않음 */
import {GAME, newAccount, okAccount, trade, valueOf, eok, CODE_RE} from '/next/game-rule.js';
import {kakao} from '/next/kakao.js';
import {ownerOk} from '/next/p-jinhwa.js';
import {sendCode} from '/next/p-admin.js';

export const PUBLIC = true; // 모두에게 열기 — 사장님 2026-10-19 15:47 「변호시에게 확인했어 이상 없다고햐」(변호사 확인 · 서면은 저장소에 없음)
const K = 'atlas:dori-game';
const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const toast = t => { try { nx().toast(t); } catch { /* 알림 못 띄움 */ } };
const loadLocal = () => { try { const a = JSON.parse(localStorage.getItem(K) || 'null'); return okAccount(a) ? a : newAccount(); } catch { return null; } };
const saveLocal = a => { try { localStorage.setItem(K, JSON.stringify(a)); return true; } catch { return false; } };
const PX = new Map();
async function priceOf(code) {
  if (PX.has(code)) return PX.get(code);
  let v = null;
  try { const r = await fetch('/atlas/data/co/' + code + '.json', {cache: 'no-cache'}); const j = r.ok ? await r.json() : null; const p = j?.c?.price; v = Number.isFinite(p) && p > 0 ? {px: p, d: typeof j.c.priceDate === 'string' ? j.c.priceDate : null} : null; } catch { v = null; }
  PX.set(code, v); return v;
}
/** 돈 글 — 한국어는 「9억 7,660만 원」 · 영어 화면은 엔진이 「억 · 만」 두 단위를 함께 못 바꿔 「976,600,000원」(엔진이 million 으로 바꿈) */
const won = v => (document.documentElement.classList.contains('en') ? Math.max(0, Math.floor(Number(v) || 0)).toLocaleString('ko-KR') + '원' : eok(v));
const nameOf = c => nx().ix()?.co?.[c]?.n ?? c;
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const WHY = {cash: '현금이 모자라요.', hold: '가진 주보다 많이 팔 수 없어요.', qty: '주 수를 다시 넣어 주세요.', price: '? 지금 값을 받지 못했어요.', code: '? 회사를 다시 골라 주세요.', account: '? 계좌를 읽지 못했어요.'};

export async function render() {
  const root = h('div', {class: 'gm', 'data-page': 'game'}, h('h1', {class: 'gm-h1', text: '가짜 돈 연습'}));
  const owner = await ownerOk();
  if (!PUBLIC && !owner) { root.append(h('p', {class: 'empty', text: '준비 중이에요. 곧 열려요.'})); return {title: '가짜 돈 연습', nodes: [root]}; }
  if (!PUBLIC) root.append(h('p', {class: 'gm-beta', text: '시험판이에요. 사장님 휴대폰에서만 열려요.'}));
  await nx().findReady().catch(() => null); // 회사 목록(core · mkt · 이름) — 찾기 칸과 같은 셈
  await kakao?.ready?.().catch(() => null);
  const member = !!kakao?.member?.();
  const box = h('div', {class: 'gm-box'});
  root.append(box, h('p', {class: 'safe', text: '가짜 돈이에요. 진짜 돈은 오가지 않아요. 값은 네이버 증권에서 받은 마지막 값이에요.'}));

  let acc = null, prize = null, server = null, pick = null;
  const load = async () => {
    if (member) { try { const r = await fetch('/api/kakao/game', {credentials: 'same-origin', cache: 'no-store'}); server = r.ok ? await r.json() : null; } catch { server = null; } acc = server?.acc ?? null; prize = server?.prize ?? null; }
    else acc = loadLocal();
  };
  const prices = async () => { const o = {}; await Promise.all(Object.keys(acc?.pos ?? {}).map(async c => { o[c] = (await priceOf(c))?.px; })); return o; };
  const doTrade = async (side, q) => {
    if (!pick) return;
    if (member) {
      const r = await fetch('/api/kakao/game', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: JSON.stringify({code: pick, side, q})}).catch(() => null);
      const j = r ? await r.json().catch(() => null) : null;
      if (!r?.ok) { toast(WHY[j?.error] ?? '? 서버에 닿지 못했어요.'); return; }
      server = j; acc = j.acc; prize = j.prize;
    } else {
      const p = await priceOf(pick); if (!p) { toast(WHY.price); return; }
      const r = trade(acc, {code: pick, side, q, px: p.px}); if (!r.ok) { toast(WHY[r.why] ?? '?'); return; }
      acc = r.acc; if (!saveLocal(acc)) toast('? 이 기기가 기록을 기억하지 못해요.');
    }
    toast(side === 'b' ? '가짜 돈으로 샀어요.' : '가짜 돈으로 팔았어요.');
    await paint();
  };

  const find = h('input', {class: 'gm-in', type: 'search', placeholder: '회사 이름이나 번호', 'aria-label': '회사 이름이나 번호', autocomplete: 'off'});
  const hits = h('ul', {class: 'gm-hits'}), deal = h('div', {class: 'gm-deal'});
  find.addEventListener('input', () => {
    const q = find.value.trim(); if (!q) { hits.replaceChildren(); return; }
    const rows = nx().findMatch(q).filter(x => x.k === 'c' && CODE_RE.test(x.c)).slice(0, 5);
    hits.replaceChildren(...(rows.length ? rows.map(x => { const b = h('button', {type: 'button', class: 'gm-hit'}, h('span', {'data-proper': '', text: x.n}), h('small', {text: x.c})); b.addEventListener('click', () => { pick = x.c; hits.replaceChildren(); find.value = ''; paintDeal(); }); return h('li', {}, b); }) : [h('li', {class: 'note', text: '찾는 회사가 없어요.'})]));
  });
  const paintDeal = async () => {
    if (!pick) { deal.replaceChildren(); return; }
    const p = await priceOf(pick), have = acc?.pos?.[pick]?.q ?? 0;
    const qty = h('input', {class: 'gm-q', type: 'number', inputmode: 'numeric', min: '1', step: '1', value: '10', 'aria-label': '주 수'});
    const buy = h('button', {type: 'button', class: 'gm-b', text: '사 보기'}), sell = h('button', {type: 'button', class: 'gm-s', text: '팔아 보기', disabled: have < 1});
    const q = () => { const v = Math.floor(Number(qty.value)); return Number.isInteger(v) && v > 0 ? v : 0; };
    buy.addEventListener('click', () => doTrade('b', q())); sell.addEventListener('click', () => doTrade('s', q()));
    deal.replaceChildren(h('p', {class: 'gm-nm'}, h('b', {'data-proper': '', text: nameOf(pick)}), h('span', {text: p ? `${p.px.toLocaleString('ko-KR')}원 · ${md(p.d)} 값` : '? 값을 못 받았어요'})),
      h('p', {class: 'gm-t', text: p ? `지금 현금으로 ${Math.floor((acc?.cash ?? 0) / p.px).toLocaleString('ko-KR')}주까지 살 수 있어요. 가진 주는 ${have.toLocaleString('ko-KR')}주예요.` : ''}),
      h('div', {class: 'gm-row'}, qty, h('span', {text: '주'}), buy, sell));
  };

  const paint = async () => {
    if (!acc) { box.replaceChildren(h('p', {class: 'empty', text: member ? '? 계좌를 받지 못했어요. 잠시 뒤 다시 열어 주세요.' : '? 이 기기가 기록을 기억하지 못해요.'})); return; }
    const pr = await prices(), v = valueOf(acc, pr);
    const bar = h('div', {class: 'gm-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(GAME.goal), 'aria-valuenow': String(Math.round(v.total))}, h('i', {class: 'gm-fill'}));
    bar.firstChild.style.width = Math.min(100, Math.round(v.total / GAME.goal * 100)) + '%';
    const held = Object.entries(acc.pos);
    const prizeBox = h('section', {class: 'gm-prize'}, h('h2', {text: '30억 원을 만들면'}),
      h('p', {text: `스타벅스 상품권 ${(GAME.prize.each / 10000).toLocaleString('ko-KR')}만 원짜리 ${GAME.prize.count}장을 드려요. 기간과 순위는 없어요.`}),
      prize ? h('p', {class: 'gm-code num', text: prize}) : null, prize ? sendCode('돌이 30억 상 번호 ' + prize) : null,
      h('p', {class: 'gm-t', text: prize ? '돌이를 알려 준 분께 이 번호를 카톡으로 보내 주세요. 확인한 뒤 상품권을 보내 드려요.' : member ? '목표를 넘으면 여기에 상 번호가 생겨요.' : '상은 카톡으로 가입한 사람만 받아요. 지금은 이 기기에서 연습만 해요.'}));
    box.replaceChildren(...[
      h('section', {class: 'gm-sum'}, h('p', {class: 'gm-lb', text: '지금 합계'}), h('p', {class: 'gm-big num', text: won(v.total)}), bar,
        h('p', {class: 'gm-t', text: v.won ? '목표 30억 원을 넘었어요.' : `목표 30억 원까지 ${won(v.left)} 남았어요.`}),
        h('p', {class: 'gm-t', text: `현금 ${won(v.cash)} · 주식 ${won(v.stock)}`}),
        v.unknown.length ? h('p', {class: 'gm-t gm-q', text: `? 값을 못 받은 회사 ${v.unknown.length}곳은 산 돈으로 셌어요.`}) : null),
      prizeBox,
      h('section', {class: 'gm-sec'}, h('h2', {text: '회사 고르기'}), find, hits, deal),
      h('section', {class: 'gm-sec'}, h('h2', {text: '가진 주식'}), held.length ? h('ul', {class: 'gm-list'}, ...held.map(([c, p]) => {
        const now = pr[c], val = Number.isFinite(now) ? p.q * now : null, ch = val != null && p.cost > 0 ? (val / p.cost - 1) * 100 : null;
        const b = h('button', {type: 'button', class: 'gm-own'}, h('span', {'data-proper': '', text: nameOf(c)}), h('small', {text: `${p.q.toLocaleString('ko-KR')}주 가짐 · ${val == null ? '?' : won(val)}`}), h('b', {class: 'num ' + (ch == null ? '' : ch > 0 ? 'up' : ch < 0 ? 'dn' : ''), text: ch == null ? '?' : (ch > 0 ? '+' : ch < 0 ? '−' : '') + Math.abs(ch).toFixed(1) + '%'}));
        b.addEventListener('click', () => { pick = c; paintDeal(); deal.scrollIntoView({block: 'nearest'}); });
        return h('li', {}, b);
      })) : h('p', {class: 'gm-t', text: '아직 가진 주식이 없어요. 위에서 회사를 골라 보세요.'})),
      acc.log.length ? h('section', {class: 'gm-sec'}, h('h2', {text: '최근 기록'}), h('ul', {class: 'gm-log'}, ...acc.log.slice(-5).reverse().map(x => h('li', {text: `${md(new Date(x.t + 9 * 3600e3).toISOString())} ${nameOf(x.c)} ${x.q.toLocaleString('ko-KR')}주 ${x.s === 'b' ? '삼' : '팖'} · ${x.px.toLocaleString('ko-KR')}원`})))) : null].filter(Boolean));
    if (pick) paintDeal();
  };
  await load(); await paint();
  return {title: '가짜 돈 연습', nodes: [root]};
}
