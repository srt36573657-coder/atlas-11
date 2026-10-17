/* 고도리 — 「친구야, 왜 사?」 질문 열한 개(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 2 ~ 6 · 13)
   철학: 사기 전에 내 이유를 확인하는 문(은행이 송금 전 사기를 묻듯) · 말투: 친구처럼 · 색 🟢 0점 🟡 1점 🔴 2점
   whyCard(G) = 첫 화면 가운데 칸(한 화면에 질문 하나 · 눌러서 고름 · 답마다 고도리 한마디 · 끝나면 점수 합 0 ~ 22 · 네 묶음 막대 · 판정 · 기록 쌓기)
   render(arg) = #/why · meRecords(G) = 「나」 칸 기록(날짜 · 한 달 뒤 결과 · 지우는 단추 없음 — 명령 13 「틀린 것도 지우지 마라」)
   질문 · 답 · 격언은 사장님 글 그대로(격언 = data-proper) · 이름은 brand.js 한 곳(규칙 76) */
import {NAME, josa} from './brand.js';
const NX = globalThis.NX;
const {h} = NX;
const PT = {g: 0, y: 1, r: 2};
/** 질문 열한 개 — 답은 사장님 글의 차례 그대로 · one = 그 답에 고도리 한마디 */
export const QS = [
  {q: '왜 사?', a: [['r', '친구 말', '친구 말만 듣고 사면, 팔 때도 친구 말을 기다리게 돼.'], ['y', '뉴스', '뉴스는 모두가 같이 봐. 내 이유를 하나 더 찾아봐.'], ['g', '내가 따져 봄', '좋아! 내 이유가 있으면 흔들릴 때 버틸 수 있어.']], say: '남의 말로 산 주식은 남의 말에 판다'},
  {q: '공부했어?', a: [['g', '했다', '좋아, 아는 만큼 덜 무서워.'], ['y', '조금', '조금 더 알아보자. 무엇을 파는 회사인지부터.'], ['r', '안 했다', '모르는 회사는 떨어질 때 더 무서워.']], say: '모르는 주식은 사지 마라'},
  {q: '뭐가 좋아?', a: [['g', '돈을 잘 번다', '돈을 잘 버는 회사는 오래 볼 힘이 있어.'], ['y', '클 일이 있다', '클 일이 정말 일어날지 날짜를 적어 두자.'], ['r', '그냥 오를 것 같다', '느낌은 이유가 아니야. 한 번 더 생각해 보자.']], say: '느낌은 이유가 아니다'},
  {q: '얼마 넣어?', a: [['g', '내 돈 열에 하나 이하', '좋아, 틀려도 다시 일어설 수 있어.'], ['y', '반쯤', '반은 많아. 조금 줄이면 마음이 편해.'], ['r', '거의 다·빌린 돈', '빌린 돈은 밤잠을 뺏어. 오늘은 줄이자.']], say: '빚으로 산 주식은 잠을 뺏는다'},
  {q: '흐름은?', a: [['g', '조용히 조금씩 오름', '조용히 오를 때가 마음 편히 볼 때야.'], ['y', '떨어지는 중', '떨어지는 칼은 잡지 말자. 멈추는지 보자.'], ['r', '다들 떠들며 급등', '다들 떠들 때는 이미 늦었을 수 있어.']], say: '소문에 팔고 조용할 때 사라'},
  {q: '얼마나 올랐어?', a: [['g', '아직', '아직이면 서두를 까닭이 없어.'], ['y', '조금', '조금 올랐으면 어디까지 볼지 정해 두자.'], ['r', '벌써 두 배', '두 배 오른 뒤엔 내릴 길도 길어.']], say: '무릎에 사서 어깨에 팔아라'},
  {q: '떨어지면?', a: [['g', '팔 곳 정함', '좋아, 정한 대로만 하면 돼.'], ['y', '생각만', '생각만 하면 그때 가서 흔들려. 숫자로 적어 둬.'], ['r', '안 정함', '사기 전에 팔 곳부터 정하자.']], say: '사기 전에 팔 곳부터 정해라'},
  {q: '오르면?', a: [['g', '정함', '좋아, 욕심이 날 때 그 숫자를 보자.'], ['y', '모름', '오를 때 어디서 나눌지 미리 정해 두자.'], ['r', '끝까지 간다', '끝까지는 아무도 몰라. 나눠서 챙기자.']], say: '손해는 짧게 이익은 길게'},
  {q: '언제 쓸 돈?', a: [['g', '1년 넘게', '오래 둘 돈이면 기다릴 수 있어.'], ['y', '몇 달 안', '몇 달 안에 쓸 돈은 흔들리면 곤란해.'], ['r', '곧', '곧 쓸 돈은 주식에 넣지 말자.']], say: '급한 돈은 주식에 넣지 마라'},
  {q: '마음은?', a: [['g', '차분', '차분하면 좋은 값을 기다릴 수 있어.'], ['r', '놓칠까 급함', '급하면 가장 비싼 값을 치르게 돼.'], ['r', '본전 생각', '본전 생각은 판단을 흐려. 오늘은 쉬자.']], say: '급한 마음이 가장 비싼 값을 치른다'},
  {q: '나눠 넣어?', a: [['g', '세 곳 이상', '좋아, 하나가 넘어져도 괜찮아.'], ['y', '두 곳', '한 곳 더 나눠 담으면 마음이 편해.'], ['r', '한 곳', '달걀을 한 바구니에 담지 말자.']], say: '달걀을 한 바구니에 담지 마라'},
];
/** 네 묶음(명령 5) — 질문 번호(1부터) */
export const GROUPS = [['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]];
/** 점수 · 🔴 수 · 묶음 · 판정(명령 6) — ans = 답 자리(0 ~ 2) 열한 개 */
export function judge(ans) {
  const pts = ans.map((k, i) => PT[QS[i].a[k][0]]);
  const score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length;
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  const verdict = score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '좋아, 정해 둔 대로만';
  return {score, reds, groups, verdict};
}
const KEY = 'atlas:godori-why';
export function records() { try { const x = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } }
function save(rec) { try { const all = records(); all.unshift(rec); localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200))); return true; } catch { return false; } }
const dot = c => h('span', {class: 'wy-dot wy-' + c, 'aria-hidden': 'true'});
const VTONE = {'좋아, 정해 둔 대로만': 'g', '반만 준비됐어': 'y', '오늘은 쉬어 가자': 'r'};
/** 묶음 막대 넷 — 묶음 점수 ÷ 묶음 최대(점수가 낮을수록 준비된 것) */
function bars(groups, small) {
  return h('div', {class: 'wy-bars' + (small ? ' sm' : '')}, ...GROUPS.map(([n, qs]) => {
    const max = qs.length * 2, v = groups?.[n] ?? 0, fill = h('i', {class: 'wy-fill wy-' + (v === 0 ? 'g' : v * 2 >= max ? 'r' : 'y')});
    fill.style.setProperty('width', Math.round(v / max * 100) + '%');
    return h('div', {class: 'wy-bar'}, h('span', {class: 'wy-bn', text: n}), h('span', {class: 'wy-track', 'aria-hidden': 'true'}, fill), h('b', {class: 'num', text: `${v} / ${max}`}));
  }));
}
const fmtDay = iso => { const d = new Date(iso); return isNaN(d) ? '?' : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };

/** 첫 화면 칸 · #/why — 한 화면에 질문 하나 */
export function whyCard(G, {page = false} = {}) {
  const box = h('section', {class: 'wy' + (page ? ' page' : ''), 'aria-label': '친구야, 왜 사?'});
  const ans = new Array(QS.length).fill(null);
  let i = 0, said = false;
  const live = h('p', {class: 'wy-live', 'aria-live': 'polite'});
  const draw = () => {
    const head = h('div', {class: 'wy-head'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40}),
      h('div', {}, h('h2', {class: 'wy-h', text: '친구야, 왜 사?'}), h('p', {class: 'wy-sub', text: `사기 전에 ${josa(NAME, '랑')} 내 이유를 확인해요.`})));
    if (i >= QS.length) return box.replaceChildren(head, result(), live);
    const Q = QS[i], step = h('p', {class: 'wy-step num', text: `${i + 1} / ${QS.length}`});
    const opts = h('div', {class: 'wy-opts', role: 'group', 'aria-label': Q.q});
    Q.a.forEach(([c, t], k) => {
      const b = h('button', {class: 'wy-opt' + (ans[i] === k ? ' on' : ''), type: 'button', 'aria-pressed': String(ans[i] === k)}, dot(c), h('span', {text: t}));
      b.addEventListener('click', () => { ans[i] = k; said = true; draw(); box.querySelector('.wy-next')?.focus(); });
      opts.append(b);
    });
    const nodes = [head, step, h('h3', {class: 'wy-q', text: `${i + 1}. ${Q.q}`}), opts];
    if (said && ans[i] != null) {
      live.textContent = `${NAME}: ${Q.a[ans[i]][2]}`;
      nodes.push(h('p', {class: 'wy-one'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}), h('span', {text: Q.a[ans[i]][2]})),
        h('p', {class: 'wy-say'}, h('span', {class: 'wy-sayk', text: '격언 '}), h('q', {'data-proper': '', text: Q.say})));
    } else live.textContent = '';
    const nav = h('div', {class: 'wy-nav'});
    if (i > 0) { const b = h('button', {class: 'wy-back', type: 'button', text: '‹ 앞으로'}); b.addEventListener('click', () => { i--; said = ans[i] != null; draw(); }); nav.append(b); }
    if (ans[i] != null) { const b = h('button', {class: 'wy-next', type: 'button', text: i === QS.length - 1 ? '결과 보기 ›' : '다음 ›'}); b.addEventListener('click', () => { i++; said = i < QS.length && ans[i] != null; draw(); if (i >= QS.length) finish(); }); nav.append(b); }
    nodes.push(nav, live);
    box.replaceChildren(...nodes);
  };
  let last = null;
  const finish = () => {
    const J = judge(ans);
    last = {at: new Date().toISOString(), asOf: G?.asOf ?? null, answers: [...ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups,
      picks: (G?.picks ?? []).map(p => ({code: p.code, name: p.name, price: p.price, w: p.w}))};
    last.saved = save(last);
    draw();
  };
  const result = () => {
    const J = last ?? {...judge(ans), saved: false};
    live.textContent = `점수 ${J.score} / 22 · ${J.verdict}`;
    const again = h('button', {class: 'wy-next', type: 'button', text: '다시 하기'});
    again.addEventListener('click', () => { ans.fill(null); i = 0; said = false; last = null; draw(); });
    return h('div', {class: 'wy-res'},
      h('p', {class: 'wy-score'}, h('span', {text: '점수 '}), h('b', {class: 'num', text: String(J.score)}), h('span', {class: 'num', text: ' / 22'}), h('span', {class: 'wy-reds', text: ` · 🔴 ${J.reds}개`})),
      h('p', {class: 'wy-verdict wy-v' + VTONE[J.verdict]}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 32, height: 32}), h('b', {text: `「${J.verdict}」`})),
      bars(J.groups),
      h('p', {class: 'wy-note', text: '점수가 낮을수록 준비된 거예요. 막대가 길면 그 묶음을 한 번 더 생각해 봐.'}),
      h('p', {class: 'wy-note', text: J.saved ? '오늘 답을 「나」 칸에 날짜와 함께 쌓았어요.' : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
      h('div', {class: 'wy-nav'}, again, h('a', {class: 'wy-link', href: '#/me', text: '「나」 칸 기록 보기 ›'})));
  };
  draw();
  return box;
}

/** 「나」 칸 — 쌓인 기록(새 것부터) · 30일 지난 기록은 고른 곳마다 그 뒤 ±x% · 비중으로 묶은 합 · 지우는 단추 없음 */
export function meRecords() {
  const list = records().filter(r => r && typeof r === 'object'), box = h('section', {class: 'wy-me', 'aria-label': '왜 사? 기록'}); // 깨진 줄은 그리기에서만 건너뜀(지우지 않음 — 명령 13)
  box.append(h('h2', {class: 'sec', text: `왜 사? 기록 ${list.length}번`}));
  if (!list.length) { box.append(h('p', {class: 'note', text: '아직 기록이 없어요. 첫 화면 「친구야, 왜 사?」에 답하면 날짜와 함께 여기 쌓여요.'})); return box; }
  box.append(h('p', {class: 'note', text: `틀린 것도 지우지 않아요. 한 달이 지나면 그날 ${NAME} 칸 회사들이 그 뒤 얼마나 움직였는지 붙여요.`}));
  for (const r of list.slice(0, 30)) {
    const row = h('div', {class: 'wy-rec'},
      h('p', {class: 'wy-rh'}, h('b', {text: fmtDay(r.at)}), h('span', {class: 'num', text: ` · 점수 ${r.score} / 22`}), h('span', {class: 'wy-v' + (VTONE[r.verdict] ?? 'y'), text: ` · ${r.verdict}`})),
      bars(r.groups, true));
    const age = (Date.now() - Date.parse(r.at)) / 864e5;
    if (r.picks?.length) {
      if (age < 30) row.append(h('p', {class: 'note', text: `그날 ${NAME} 칸 ${r.picks.length}곳 · 한 달 뒤(${fmtDay(new Date(Date.parse(r.at) + 30 * 864e5).toISOString())})에 결과를 붙여요.`}));
      else { const out = h('p', {class: 'note', text: '한 달 뒤 결과를 셈하는 중…'}); row.append(out); later(r, out); }
    }
    box.append(row);
  }
  return box;
}
async function later(r, out) {
  const got = await Promise.all(r.picks.map(p => NX.getJson('co/' + p.code + '.json').then(j => ({p, now: j?.c?.price ?? null}))));
  const ok = got.filter(x => x.now > 0 && x.p.price > 0);
  if (!ok.length) { out.textContent = '? 지금 값을 못 받았어요.'; return; }
  const ws = ok.reduce((s, x) => s + x.p.w, 0), tot = ok.reduce((s, x) => s + x.p.w * (x.now / x.p.price - 1) * 100, 0) / ws;
  out.replaceChildren(h('span', {text: `한 달 뒤 결과 · ${ok.length}곳 비중으로 묶은 합 `}), h('b', {class: 'num ' + NX.cls(tot), text: NX.pct(tot)}),
    ...(ok.length < r.picks.length ? [h('span', {text: ` · ? ${r.picks.length - ok.length}곳은 지금 값 없음`})] : []));
}

export async function render() {
  const G = NX.gdr ? await NX.gdr() : null; // 고도리 칸 자료(/next/data/gdr.json) — 못 받으면 null
  return {title: '왜 사? 열한 질문', nodes: [whyCard(G, {page: true}), h('p', {class: 'safe', text: josa(NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})]};
}
