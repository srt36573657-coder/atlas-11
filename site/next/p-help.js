/* 고객센터(#/help · #/help/say · #/help/ask · #/help/guide) — 사장님 2026-10-21(서울) 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간이 있으면 좋울것 같아
   … 구글과잡스라면 그리고 나라면 아름답게 묘미나개 만든다 멋지게 섹시하게 만들어」 · 23:05 「1.주식을잘모르는아이들을위한 편안한 쉬운 말투 2.주식을 이미 아는 사람들이 확실하게 볼수잇는 돌리지않는말투」
   · 23:09 「아 해 섹시하게」(지인 말 「너무 번잡해 … 간결하게 · 지금은 ai수준. 미래는 테슬라처럼」 뒤 — 차례 ③ 고객센터는 간결하게)
   잡스 = 한 화면 · 문 셋(한마디 · 물음 · 안내) · 한 번에 한 문만 열림 · 꾸밈 없이 글과 선만 · 구글 = 묻기 전에 「많이 묻는 것」 · 받은 것과 지우는 법을 그 자리에 적음
   말투 둘(위 단추 · 이 기기 기억 atlas:help:voice): 쉬운 말(아이도 편한 해요체) · 곧은 말(아는 사람이 바로 보는 합니다체 · 짧은 이름)
   보내기 = /api/help(lib/atlas11/help.mjs) · 이 기기 열쇠(atlas:help:dev · 무작위 32바이트)는 처음 보낼 때 만듦(열기만 하면 아무것도 남기지 않음) · 서버에는 해시만
   받는 것: 쓴 글 · 고른 갈래 · 말투 · 보던 화면 이름(길 첫 마디) · 때 — 이름 · 전화번호 · 이메일은 받지 않음(연락처 꼴이면 빼고 보내 달라고 함 · help-rule.js contactOf)
   본질: 사고팔기를 권하지 않음 · 앞날을 맞히지 않음 — 「많이 묻는 것」 답은 사이트에 이미 적힌 사실만(개인정보 처리방침 · 본질 한 장 · 첫 화면 본질 줄)
   글은 textContent 로만 · 사람이 쓴 글(물음 · 답)은 lang="ko"(영어 엔진이 바꾸지 않음) · 지우기는 두 번 눌러야(첫 번에 글이 바뀜) · 폭죽 없음 */
import {LIM, contactOf, cleanText} from './help-rule.js';
import {NAME, josa} from './brand.js'; // 이름은 한 곳(규칙 76) — 글에 이름을 박지 않음

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const toast = t => { try { nx().toast(t); } catch { /* 알림 못 띄움 */ } };
const K_DEV = 'atlas:help:dev', K_VOICE = 'atlas:help:voice', EMAIL = 'srt36573657@gmail.com';
const ls = {get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } }};
const devKey = (make = false) => {
  const k = ls.get(K_DEV); if (k && /^[A-Za-z0-9_-]{43}$/.test(k)) return k;
  if (!make) return null;
  const b = new Uint8Array(32); crypto.getRandomValues(b);
  const nk = btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return ls.set(K_DEV, nk) ? nk : null;
};
const mdOf = iso => { const t = Date.parse(iso); if (!Number.isFinite(t)) return '?'; const d = new Date(t + 9 * 36e5).toISOString(); return `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`; };
/** 보던 화면 — 고객센터로 오기 바로 전 길의 첫 마디(회사 번호 · 글 번호는 버림) */
/** 보던 화면 — 고객센터로 오기 바로 전 길(app.js 가 globalThis.NX_FROM 에 둠)의 첫 마디 · 회사 번호 · 글 번호는 버림 · 첫 화면은 'home' */
export function pageFrom(hash = globalThis.NX_FROM) { const m = /^#\/([a-z]{0,12})(?:\/|$)/.exec(String(hash || '')); if (!m) return ''; return m[1] === 'help' ? '' : (m[1] || 'home'); }

/* ── 말투 둘(사장님 23:05) — easy = 쉬운 말 · direct = 곧은 말 ── */
export const V = {
  easy: {
    note: ['남겨 주신 말은 한 줄도 빠짐없이 제가 직접 읽어요.', `그 말들이 모여 ${josa(NAME, '가')} 자라요.`], sign: `${josa(NAME, '를')} 만든 사람`,
    say: ['한마디 남기기', '좋았던 것, 바라는 것, 안 되는 것을 알려 주세요'], ask: ['물어보기', '궁금한 것을 물으면 이 휴대폰에서 답을 받아요'], guide: ['고객센터 안내', `연락할 곳과 ${NAME}의 약속`],
    tones: {good: '좋았어요', want: '바라요', broken: '안 돼요'},
    ph: {good: '무엇이 좋았나요?', want: '무엇이 있으면 좋을까요?', broken: '어디에서 무엇이 안 되나요?', ask: `${NAME} 쓰는 법을 물어보세요`},
    privacy: '이름, 전화번호, 이메일은 적지 마세요.', consent: `보내면 이 글과 보던 화면 이름이 ${josa(NAME, '를')} 만든 사람에게 가요.`,
    send: '보내기', askSend: '물어보기', askNote: `어떤 주식을 사고팔지는 답하지 않아요. ${NAME} 쓰는 법은 무엇이든 물어보세요.`,
    echoH: `${josa(NAME, '가')} 들은 말`, okSay: '한 글자도 바꾸지 않고 그대로 전했어요. 고마워요.', okAsk: '그대로 전했어요. 답이 오면 아래 내가 남긴 글에 보여요.', echoUp: '바뀐 것은 업데이트 기록에 남겨요',
    errContact: '전화번호나 이메일은 빼고 보내 주세요.', errShort: '두 글자 넘게 적어 주세요.', errBusy: '잠시 뒤에 다시 보내 주세요.', errNet: '? 보내지 못했어요. 잠시 뒤 다시 해 주세요.', errKey: '? 이 휴대폰에 기억할 수 없어 보내지 못했어요.',
    faqH: '많이 묻는 것', mineH: '내가 남긴 글', mineEmpty: '아직 남긴 글이 없어요.', mineDev: '이 휴대폰에서만 보여요.', mineErr: '? 남긴 글을 받지 못했어요.',
    wait: '답을 기다려요', sent: '잘 전했어요', ansBy: `${josa(NAME, '를')} 만든 사람의 답`, del: '지우기', delAgain: '한 번 더 누르면 지워요', deleted: '지웠어요.',
    howH: '이렇게 도와드려요', how: ['한마디와 물음은 언제든 남길 수 있어요.', `남긴 글은 ${josa(NAME, '를')} 만든 사람이 직접 읽어요.`, '답은 물어보기의 내가 남긴 글에 와요.'],
    mailH: '개인정보나 급한 일은 이메일로 알려 주세요.', copy: '주소 복사', copied: '이메일 주소를 담았어요.',
    promiseH: `${NAME}의 약속`, promise: ['사고팔기를 권하지 않아요.', '앞날을 맞히지 않아요.', '광고를 붙이지 않고, 기록을 팔지 않아요.'],
    keep: '남긴 글은 1년 뒤에 지워요. 지우기를 누르면 바로 지워져요.',
    ansGot: '답이 왔어요 · {n}개 ›', ansWait: '답을 기다려요 · {n}개 ›', howLink: '시계 읽는 법 ›', // 맨 위 결(총정리 2026-10-22 D1) · 첫 물음 밑 고리(D4)
    faq: [[`${josa(NAME, '는')} 무엇을 해 줘요?`, '싹에서 꽃이 되는 종목을 지난 기록으로 찾아 줘요. 앞날은 맞히지 않아요.'], // 본질 1(사장님 2026-10-22 16:56 「싹에서 꽃이 되는 종목」 · 중심이자 시작)을 맨 앞에(총정리 D4)
      ['가입해야 쓸 수 있나요?', '아니요. 가입하지 않아도 모든 화면을 볼 수 있어요.'], ['어떤 주식을 사면 돼요?', `${josa(NAME, '는')} 사고팔기를 권하지 않아요. 지난 기록만 보여 줘요.`],
      ['앞으로 오를지 알려 줘요?', `아니요. ${josa(NAME, '는')} 앞날을 맞히지 않아요.`], ['숫자는 어디서 와요?', '네이버 증권에서 받아요.'],
      ['내 기록은 어디에 남아요?', '가입하지 않으면 이 휴대폰에만 남아요.'], ['매매일지는 뭐예요?', '사기 전에 「왜 사?」 열한 질문으로 내 이유를 확인하는 곳이에요.']],
  },
  direct: {
    note: ['모든 글은 운영자가 직접 읽습니다.', '의견은 다음 업데이트를 정하는 데 씁니다.'], sign: '운영자',
    say: ['의견 보내기', '좋은 점 · 요청 · 오류'], ask: ['질문하기', '답변은 이 기기에서 확인'], guide: ['운영 안내', '연락처 · 원칙 · 보관 기간'],
    tones: {good: '좋은 점', want: '요청', broken: '오류'},
    ph: {good: '좋은 점을 적어 주세요', want: '요청 사항을 적어 주세요', broken: '화면 이름과 증상을 적어 주세요', ask: '질문을 적어 주세요'},
    privacy: '개인정보는 적지 마세요. 이름 · 전화번호 · 이메일', consent: '전송: 본문 · 보던 화면 이름 · 시각. 운영자만 봅니다.',
    send: '보내기', askSend: '질문 보내기', askNote: '종목 · 매매 판단에는 답하지 않습니다. 사용법 질문만 받습니다.',
    echoH: '접수한 원문', okSay: '원문 그대로 운영자에게 전달했습니다.', okAsk: '원문 그대로 전달했습니다. 답변은 아래 「내 글」에 표시됩니다.', echoUp: '반영 내역: 업데이트 기록',
    errContact: '연락처가 들어 있습니다. 지우고 다시 보내 주세요.', errShort: '2자 이상 입력해 주세요.', errBusy: '요청이 많습니다. 잠시 후 다시 시도해 주세요.', errNet: '? 전송 실패. 잠시 후 다시 시도해 주세요.', errKey: '? 이 기기에 저장할 수 없어 전송하지 못했습니다.',
    faqH: '자주 묻는 질문', mineH: '내 글', mineEmpty: '남긴 글 없음', mineDev: '이 기기에서만 표시됩니다.', mineErr: '? 내 글을 불러오지 못했습니다.',
    wait: '답변 대기', sent: '전달됨', ansBy: '운영자 답변', del: '삭제', delAgain: '한 번 더 눌러 삭제', deleted: '삭제했습니다.',
    howH: '운영 방식', how: ['접수: 언제든', '확인: 운영자가 직접', '답변: 질문하기 › 내 글'],
    mailH: '개인정보 · 긴급 문의', copy: '주소 복사', copied: '이메일 주소를 복사했습니다.',
    promiseH: '운영 원칙', promise: ['사고팔기 권유 없음', '주가 전망 없음', '광고 없음 · 기록 판매 없음'],
    keep: '보관: 1년 · 「삭제」를 누르면 즉시 삭제',
    ansGot: '답변 {n}건 ›', ansWait: '답변 대기 {n}건 ›', howLink: '시계 읽는 법 ›',
    faq: [[`${josa(NAME, '는')} 무엇을 하나요?`, '테마가 될 수 있는 업종을 지난 기록으로 찾습니다. 전망은 하지 않습니다.'],
      ['가입이 필요한가요?', '아니요. 모든 화면은 가입 없이 열립니다.'], ['종목을 골라 주나요?', '아니요. 사고팔기를 권하지 않습니다. 지난 기록만 보여 줍니다.'],
      ['주가 전망을 하나요?', '하지 않습니다. 지난 기록만 다룹니다.'], ['숫자 출처는?', '네이버 증권입니다.'],
      ['기록은 어디에 저장되나요?', '가입하지 않으면 이 기기 브라우저에만 저장됩니다. 서버로 보내지 않습니다.'], ['매매일지 기능은?', '사기 전에 「왜 사?」 열한 질문으로 이유를 점검합니다. 한 달 뒤 「그날 정한 대로 했어?」로 돌아봅니다.']],
  },
};
const voiceNow = () => (ls.get(K_VOICE) === 'direct' ? 'direct' : 'easy');

/* ── 서버 ── */
async function api(method, path, body) {
  const key = devKey(method === 'POST' && body?.op === 'send');
  if (!key && !(method === 'GET' && path === '/faq')) return {status: key === null && method === 'POST' ? -1 : 401, json: null};
  try {
    const r = await fetch('/api/help' + path, {method, headers: {...(key ? {'x-help-key': key} : {}), ...(method === 'POST' ? {'content-type': 'application/json'} : {})}, body: method === 'POST' ? JSON.stringify(body) : undefined, cache: 'no-store', credentials: 'omit'});
    let json = null; try { json = await r.json(); } catch { /* 빈 몸 */ }
    return {status: r.status, json};
  } catch { return {status: 0, json: null}; }
}

/* ── 그리기 ── */
const chev = () => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'hp-chev'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M9 6l6 6-6 6'); s.append(p); return s; };

/** 보낸 뒤 — 앵무새 돌이가 들은 말을 한 글자도 바꾸지 않고 따라 말함(본질 4 「앵무새는 들은 것만 따라 말한다」 · 사장님 2026-10-22 01:22 「사람들에게 감동을 줘」)
 *  글은 서버에 간 그대로(cleanText 뒤) · 폭죽 없음 — 돌이가 살며시 나와 고개를 두 번 끄덕임(움직임 줄이기면 멈춘 그림) */
function echoCard(L, kind, text) {
  return h('div', {class: 'hp-echo'},
    h('img', {class: 'hp-parrot', src: '/media/makbi-hello.svg', alt: '', width: 64, height: 80, decoding: 'async'}),
    h('div', {class: 'hp-echo-t'},
      h('p', {class: 'hp-echo-h', text: L.echoH}),
      h('p', {class: 'hp-echo-q', lang: 'ko', text: '「' + text + '」'}),
      h('p', {class: 'hp-echo-s', text: kind === 'note' ? L.okSay : L.okAsk}),
      kind === 'note' ? h('a', {class: 'hp-echo-up', href: '#/up', text: L.echoUp + ' ›'}) : null));
}

function form(L, kind, onSent) {
  let tone = 'good';
  const box = h('div', {class: 'hp-form'});
  const chips = kind === 'note' ? h('div', {class: 'hp-tones', role: 'radiogroup', 'aria-label': L.say[0]}, ...['good', 'want', 'broken'].map(t => {
    const b = h('button', {type: 'button', class: 'hp-tone', role: 'radio', 'aria-checked': String(t === tone), 'data-tone': t, text: L.tones[t]});
    b.addEventListener('click', () => { tone = t; for (const c of chips.children) c.setAttribute('aria-checked', String(c.dataset.tone === t)); ta.placeholder = L.ph[t]; ta.focus({preventScroll: true}); });
    return b;
  })) : null;
  const ta = h('textarea', {class: 'hp-ta', rows: 4, maxlength: String(LIM.text), placeholder: kind === 'note' ? L.ph.good : L.ph.ask, 'aria-label': kind === 'note' ? L.say[0] : L.ask[0]});
  const cnt = h('span', {class: 'hp-cnt num', 'aria-hidden': 'true', text: `0 / ${LIM.text}`});
  const out = h('p', {class: 'hp-out', role: 'status', 'aria-live': 'polite'});
  const go = h('button', {type: 'button', class: 'hp-go', text: kind === 'note' ? L.send : L.askSend});
  const echo = h('div', {class: 'hp-echo-box', hidden: true, 'aria-live': 'polite'});
  ta.addEventListener('input', () => { cnt.textContent = `${Array.from(ta.value).length} / ${LIM.text}`; out.textContent = ''; out.className = 'hp-out'; });
  go.addEventListener('click', async () => {
    const text = cleanText(ta.value);
    const say = (t, bad) => { out.textContent = t; out.className = 'hp-out' + (bad ? ' bad' : ' ok'); };
    if (Array.from(text).length < LIM.min) { say(L.errShort, true); ta.focus(); return; }
    if (contactOf(text)) { say(L.errContact, true); ta.focus(); return; }
    go.disabled = true;
    const r = await api('POST', '', {op: 'send', kind, tone: kind === 'note' ? tone : undefined, text, agree: true, page: pageFrom(), voice: voiceNow()});
    go.disabled = false;
    if (r.status === 200) { ta.value = ''; cnt.textContent = `0 / ${LIM.text}`; out.textContent = ''; out.className = 'hp-out'; echo.replaceChildren(echoCard(L, kind, text)); echo.hidden = false; onSent?.(); return; }
    if (r.status === -1) return say(L.errKey, true);
    if (r.json?.error === 'contact') return say(L.errContact, true);
    if (r.json?.error === 'short') return say(L.errShort, true);
    if (r.status === 429) return say(L.errBusy, true);
    say(L.errNet, true);
  });
  ta.addEventListener('focus', () => { echo.hidden = true; });
  box.append(...[chips, ta, h('div', {class: 'hp-meta'}, h('span', {class: 'hp-fine', text: L.privacy}), cnt), h('p', {class: 'hp-fine', text: L.consent}), go, out, echo].filter(Boolean));
  return box;
}

/** 내가 남긴 글 — onItems(items) = 받은 글 목록을 맨 위 결 단추(render 의 hp-ans)에 넘김(못 받으면 null · 열쇠 없으면 빈 목록) · box.ready = 다 그린 때 */
function mineList(L, onItems) {
  const box = h('section', {class: 'hp-mine', 'aria-label': L.mineH});
  const tell = x => { try { onItems?.(x); } catch { /* 결 단추 못 그림 — 목록은 그대로 */ } };
  const paint = async () => {
    const head = [h('h3', {class: 'hp-h3', text: L.mineH}), h('p', {class: 'hp-fine', text: L.mineDev})];
    if (!devKey()) { box.replaceChildren(...head, h('p', {class: 'hp-empty', text: L.mineEmpty})); tell([]); return; }
    const r = await api('GET', '/mine');
    const items = Array.isArray(r.json?.items) ? r.json.items : null;
    tell(items);
    if (!items) { box.replaceChildren(...head, h('p', {class: 'hp-empty', text: L.mineErr})); return; }
    if (!items.length) { box.replaceChildren(...head, h('p', {class: 'hp-empty', text: L.mineEmpty})); return; }
    box.replaceChildren(...head, h('ul', {class: 'hp-list'}, ...items.map(it => {
      const del = h('button', {type: 'button', class: 'hp-del', text: L.del});
      let armed = 0;
      del.addEventListener('click', async () => {
        if (!armed) { del.textContent = L.delAgain; del.classList.add('armed'); armed = setTimeout(() => { armed = 0; del.textContent = L.del; del.classList.remove('armed'); }, 4000); return; }
        clearTimeout(armed); del.disabled = true;
        const d = await api('POST', '', {op: 'forget', id: it.id});
        if (d.status === 200 || d.status === 404) { toast(L.deleted); paint(); } else { del.disabled = false; toast(L.errNet); }
      });
      const tag = it.kind === 'note' ? (L.tones[it.tone] ?? '') : L.ask[0];
      return h('li', {class: 'hp-item'},
        h('p', {class: 'hp-when', text: tag + ' · ' + mdOf(it.at)}), // 한 글줄(영어 엔진 틀 「갈래 · {d}」)
        h('p', {class: 'hp-q', lang: 'ko', text: it.text}),
        it.answer ? h('div', {class: 'hp-a'}, h('p', {class: 'hp-by', text: L.ansBy + ' · ' + mdOf(it.answeredAt)}), h('p', {lang: 'ko', text: it.answer}))
          : h('p', {class: 'hp-st', text: it.kind === 'ask' ? L.wait : L.sent}),
        del);
    })));
  };
  box.ready = paint();
  box.refresh = () => (box.ready = paint());
  return box;
}

function faqList(L) {
  const box = h('section', {class: 'hp-faq', 'aria-label': L.faqH}, h('h3', {class: 'hp-h3', text: L.faqH}));
  const q = (a, b, own, more = null) => h('details', {class: 'hp-qa'}, h('summary', {}, h('span', own ? {lang: 'ko', text: a} : {text: a}), chev()), h('p', own ? {lang: 'ko', text: b} : {text: b}), more);
  const list = h('div', {class: 'hp-qas'}, ...L.faq.map(([a, b], i) => q(a, b, false, i === 0 ? h('a', {class: 'hp-qlink', href: '#/t/how', text: L.howLink}) : null))); // 첫 물음(무엇을 해 줘요?) 답 밑 「시계 읽는 법 ›」(총정리 D4)
  box.append(list);
  api('GET', '/faq').then(r => { const xs = Array.isArray(r.json?.items) ? r.json.items : []; for (const x of xs.slice(0, 12)) list.append(q(x.q, x.a, true)); }); // 사장님이 모두에게 보이기로 고른 물음(사람이 쓴 글 — 영어로 안 바꿈)
  return box;
}

function guide(L) {
  const copy = h('button', {type: 'button', class: 'hp-copy', text: L.copy});
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(EMAIL); toast(L.copied); } catch { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } });
  const mail = h('span', {class: 'hp-mail', text: EMAIL});
  return h('div', {class: 'hp-guide'},
    h('h3', {class: 'hp-h3', text: L.howH}), h('ul', {class: 'hp-lines'}, ...L.how.map(t => h('li', {text: t}))),
    h('h3', {class: 'hp-h3', text: L.mailH}), h('div', {class: 'hp-mailrow'}, mail, copy),
    h('h3', {class: 'hp-h3', text: L.promiseH}), h('ul', {class: 'hp-lines'}, ...L.promise.map(t => h('li', {text: t}))),
    h('p', {class: 'hp-fine', text: L.keep}),
    h('p', {class: 'hp-links'}, h('a', {href: '#/info', text: '도움말'}), h('a', {href: '#/up', text: '업데이트 기록'}), h('a', {href: '/privacy.html', text: '개인정보 처리방침'})));
}

/** 맨 위 결 단추(총정리 2026-10-22 D1) — 답이 온 글이 있으면 {got: true, text: 「답이 왔어요 · n개 ›」} · 답 없이 기다리는 물음만 있으면 {got: false, text: 「답을 기다려요 · n개 ›」}
 *  그 밖(남긴 글 없음 · 한마디만 · 못 받음)은 null = 단추 없음 · 「읽음」 기억은 두지 않음(새 저장 열쇠 0) */
export function ansOf(L, items) {
  if (!Array.isArray(items)) return null;
  const has = it => typeof it?.answer === 'string' && it.answer.trim() !== '';
  const got = items.filter(has).length, wait = items.filter(it => it?.kind === 'ask' && !has(it)).length;
  return got ? {got: true, text: L.ansGot.replace('{n}', String(got))} : wait ? {got: false, text: L.ansWait.replace('{n}', String(wait))} : null;
}

export function render(arg) {
  const want = ['say', 'ask', 'guide'].includes(arg) ? arg : null;
  const root = h('div', {class: 'hp', 'data-page': 'help'});
  let open = want, last = null, curMine = null; // last = 마지막으로 받은 내 글 목록(말투 · 문을 바꿔 다시 그려도 결 단추가 깜빡이지 않게 · 이 쪽을 연 동안만 · 저장 0)
  const title = h('h1', {class: 'hp-h1', text: '고객센터'}); // 한 번만 만듦 — app.js 가 붙이는 돌 그림(stoneArt)이 말투 · 문을 바꿔도 남게
  const smooth = () => !(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const paint = () => {
    const L = V[voiceNow()];
    const vt = h('div', {class: 'hp-voice', role: 'radiogroup', 'aria-label': '말투'}, ...[['easy', '쉬운 말'], ['direct', '곧은 말']].map(([k, t]) => {
      const b = h('button', {type: 'button', class: 'hp-vb', role: 'radio', 'aria-checked': String(voiceNow() === k), text: t});
      b.addEventListener('click', () => { if (voiceNow() === k) return; ls.set(K_VOICE, k); paint(); });
      return b;
    }));
    /* 결 — 답이 왔는지 맨 위에서 바로(물어보기 문 · 맨 아래 「내가 남긴 글」까지 내려가지 않아도) · 누르면 물어보기 문을 열고 내 글로 내려감 · 자료는 아래 내 글 목록이 받는 것 그대로(서버 물음 더 없음) */
    const ans = h('button', {type: 'button', class: 'hp-ans', hidden: true});
    const setAns = items => { const a = ansOf(L, items); ans.hidden = !a; ans.classList.toggle('got', !!a?.got); if (a) ans.textContent = a.text; };
    ans.addEventListener('click', () => {
      open = 'ask'; paint();
      const m = curMine; Promise.resolve(m?.ready).finally(() => requestAnimationFrame(() => { if (m?.isConnected) m.scrollIntoView({block: 'start', behavior: smooth() ? 'smooth' : 'auto'}); }));
    });
    const mine = mineList(L, items => { last = items; setAns(items); });
    curMine = mine;
    if (last) setAns(last);
    const panels = {say: () => form(L, 'note'), ask: () => h('div', {}, faqList(L), h('p', {class: 'hp-note', text: L.askNote}), form(L, 'ask', () => mine.refresh()), mine), guide: () => guide(L)};
    const doors = ['say', 'ask', 'guide'].map(k => {
      const id = 'hp-' + k, btn = h('button', {type: 'button', class: 'hp-door', 'aria-expanded': String(open === k), 'aria-controls': id},
        h('span', {class: 'hp-dt'}, h('b', {text: L[k][0]}), h('span', {text: L[k][1]})), chev());
      const pane = h('div', {class: 'hp-pane', id, role: 'region', 'aria-label': L[k][0], hidden: open !== k}, open === k ? panels[k]() : null);
      btn.addEventListener('click', () => { open = open === k ? null : k; paint(); if (open) requestAnimationFrame(() => root.querySelector('#hp-' + open)?.previousElementSibling?.scrollIntoView({block: 'start', behavior: 'smooth'})); });
      return [btn, pane];
    }).flat();
    const note = h('figure', {class: 'hp-note-card'}, h('blockquote', {}, h('p', {class: 'hp-n1', text: L.note[0]}), h('p', {class: 'hp-n2', text: L.note[1]})), h('figcaption', {text: '— ' + L.sign}));
    root.replaceChildren(title, ans, vt, note, h('div', {class: 'hp-doors'}, ...doors));
  };
  paint();
  /* #/help/say · ask · guide 로 바로 열면 그 문(이름 · 쓰는 칸 · 보내기)을 화면 맨 위에(총정리 D2) — app.js 가 그린 뒤 맨 위로 올리므로 두 틀 뒤에 */
  if (want) requestAnimationFrame(() => requestAnimationFrame(() => { const d = root.querySelector('#hp-' + want)?.previousElementSibling; if (d?.isConnected) d.scrollIntoView({block: 'start'}); }));
  return {title: '고객센터', nodes: [root]};
}
