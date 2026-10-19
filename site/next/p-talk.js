/* 이야기 칸(#/talk) — 지금 아틀란스(site/atlas/atlas.js viewTalk · talkFacts)를 새 화면으로 옮김(2026-10-17 04:23 「에이전트 총 동원해」 · 규칙 74)
   사장님 2026-10-16(싱가포르) 21:44 · 22:25 「작업해」 — 남의 글은 옮기지 않음(네이버 인기 토론은 고리 하나) · 이야깃거리는 사이트 자료로 화면에서 셈 ·
   격언 · 유튜브는 /atlas/talk.json(출처 확인한 것만 · 남의 말은 data-proper — 금지 말 셈 밖)
   셈 · 글은 옛 쪽 그대로(scripts/atlas11/next/check_misc.mjs 가 옛 쪽과 맞대 봄) · 모양만 새 아틀란스(제목 → 그림 → 이야깃거리 → 접은 칸) */
import {warn} from '/next/warn.js'; // 노란 경고 글은 두 줄까지 — 길면 「?」 한 줄로 접힘(사장님 2026-10-18 [10] 10 · warn.js)
import {shareButtons} from '/next/share-btn.js'; // 카톡 단추 한 곳(KB1) — 이야깃거리 카드 · 줄(일꾼 KB2)
const NX = globalThis.NX;
const {h} = NX;
const NB = ' ';
const pct = x => NX.pct(x);
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
/** 조사 — 옛 쪽 josa 그대로(한글이 아니면 둘 다 「은(는)」) */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
/** 글 속 「·」 · % 뒤 토씨가 줄 첫머리로 갈리지 않게(옛 쪽 tx 그대로) */
const tx = s => String(s).replace(/ · /g, NB + '· ').replace(/([^\s])·(?=[^\s])/g, '$1⁠·').replace(/([」%])(?=[가-힣])/g, '$1⁠');
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
/** 맨 아래 — 옛 쪽 foot 의 글(자료 · 때 · 장 중 값) + 새 아틀란스 안전 문장(옛 「매수 · 매도 …」 글은 쓰지 않을 말이라 같은 뜻의 새 글로) */
function foot(C) {
  return h('footer', {class: 'ptalk-foot'},
    h('p', {class: 'ptalk-links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? warn(`? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`, {cls: 'in'}) : null,
    h('p', {class: 'safe', text: '돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}),
    h('p', {class: 'safe ptalk-safe2', text: '투자 상담이 아니에요. 지난 기록을 센 공부예요.'}));
}

/* 격언 · 유튜브 목록(/atlas/talk.json — /atlas/data/ 밖) · 못 받으면 null(15초 뒤 다시) */
let talkP = null, talkAt = 0;
function talkJson() {
  if (talkP && (talkP.ok !== false || Date.now() - talkAt < 15000)) return talkP;
  talkAt = Date.now();
  const p = fetch('/atlas/talk.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null).then(j => { p.ok = !!j; return j; });
  talkP = p; return p;
}

/** 이름을 불러도 되는 곳(옛 쪽 tkOk 그대로) — 하루 30% 넘게 튄 곳(j) · 빈 날 · 값이 사흘 그대로(거래가 멈췄을 수 있음)는 뺌 */
const tkOk = c => !!c && !c.j && Array.isArray(c.l) && c.l.length > 2 && c.l.every(x => x != null) && !c.l.some((x, k) => k >= 2 && x === c.l[k - 1] && x === c.l[k - 2]);
/** 오늘의 이야깃거리 — 옛 쪽 talkFacts 셈 그대로 · 새 화면은 누를 곳(href)만 덧붙임 */
function talkFacts(C, M, H, S) {
  const out = [], ok = Object.keys(M).filter(k => tkOk(M[k])).sort(), N = C.days;
  let b = null; // ① 내리 오른 날 — 가장 길게 이어 오른 곳(같으면 더 오른 곳 · 번호 차례)
  for (const k of ok) { const l = M[k].l; let run = 0, mx = 0; for (let i = 1; i < l.length; i++) { run = l[i] > l[i - 1] ? run + 1 : 0; if (run > mx) mx = run; } if (!b || mx > b.k || (mx === b.k && M[k].c > M[b.c].c)) b = {c: k, k: mx}; }
  if (b && b.k >= 3) out.push({t: '내리 오른 날', s: `지난 ${M[b.c].l.length - 1}거래일 동안 ${josa(M[b.c].n, '은', '는')} ${b.k}거래일 내리 올랐어요. 모든 회사 가운데 가장 길어요.`, line: M[b.c].l, code: b.c, href: '#/w/' + NX.enc(b.c)});
  let g = null; // ② 같은 업종 다른 길 — 5곳 넘는 업종에서 업종 평균보다 가장 크게 앞선 곳
  for (const ind of C.industries ?? []) { if (!(ind.n >= 5) || ind.chg == null) continue; for (const k of ind.members ?? []) { const m = M[k]; if (!tkOk(m) || m.c == null || m.c <= ind.chg) continue; const d = m.c - ind.chg; if (!g || d > g.d) g = {ind, c: k, d}; } }
  if (g) out.push({t: '같은 업종 다른 길', s: `지난 ${N}거래일 동안 ${g.ind.name} 업종 ${g.ind.n}곳은 평균 ${pct(g.ind.chg)}인데, 그 안에서 ${josa(M[g.c].n, '은', '는')} ${pct(M[g.c].c)}예요.`, href: '#/w/' + NX.enc(g.c)});
  const all = Object.values(M).filter(m => m && !m.j && m.c != null), two = all.filter(m => m.c >= 100).length, half = all.filter(m => m.c <= -50).length; // ③ 두 배 · 반 토막(수만)
  if (all.length) out.push({t: '두 배와 반 토막', s: `지난 ${N}거래일 동안 값이 두 배 넘게 된 곳은 ${two}곳, 반 넘게 내린 곳은 ${half}곳이에요.`});
  const bm = C.facts?.bigMkt ?? []; // ④ 몸값 1 · 2등
  if (bm.length >= 2 && bm[0].chg != null && bm[1].chg != null) out.push({t: '몸값 1등과 2등', s: `지난 ${N}거래일 동안 몸값 1등 ${josa(bm[0].name, '은', '는')} ${pct(bm[0].chg)}, 2등 ${josa(bm[1].name, '은', '는')} ${pct(bm[1].chg)}예요.`, href: M[bm[0].code] ? '#/w/' + NX.enc(bm[0].code) : null});
  for (const key of ['KOSPI', 'KOSDAQ']) { const x = H?.idx?.[key]; if (!x || H?.stale?.idx || x.hi?.vs == null || x.lo?.vs == null) continue; // ⑤ 3달 꼭대기와 바닥(못 받은 값이면 뺌)
    out.push({t: '3달 꼭대기와 바닥', s: `${md(x.date)} ${josa(key === 'KOSPI' ? '코스피' : '코스닥', '은', '는')} 3달 꼭대기보다 ${pct(x.hi.vs)}, 3달 바닥보다 ${pct(x.lo.vs)}예요.`, href: '#/w/' + key}); }
  if (S && S.n != null) out.push({t: '5일 동안 크게 오른 곳', s: `${md(S.asOf)}까지 5거래일 「급등」 칸에 든 곳은 ${S.n}곳이에요.` + (S.bands?.b40?.n != null ? ` 40% 넘게 오른 곳은 ${S.bands.b40.n}곳이에요.` : ''), href: '#/surge'}); // ⑥ 급등 칸(수만)
  const T = C.time; // ⑦ 봉인 상자
  if (T?.seal && T.since?.days != null && T.since?.chg365 != null) out.push({t: '봉인 상자', s: `${md(T.seal)}에 봉인한 상자는 그 뒤 ${T.since.days}거래일 동안 평균 ${pct(T.since.chg365)}예요.`, href: '#/time'});
  return out;
}

const TK_CAT = [['대가', '투자 대가'], ['슈카', '쉬운 경제 이야기'], ['역사', '버블과 위기의 역사'], ['기초', '차트 기초']];
const ext = (href, kids, cls) => h('a', {class: cls, href, target: '_blank', rel: 'noopener noreferrer'}, ...kids);

/* 카톡 줄(사장님 2026-10-18 16:39 [6] 1 · 6 · 일꾼 KB2) — 회사로 가는 이야깃거리(고리 #/w/<번호> · 회사 주식)만 카톡 단추(share-btn.js 하나) · 지수 · 급등 칸 · 봉인 줄은 종목 줄이 아니라 뺌 */
const kkOf = (href, M) => { const c = /^#\/w\/([0-9A-Z]{6})$/.exec(String(href ?? ''))?.[1]; return c && M[c] ? shareButtons({code: c, name: M[c].n, kind: 'share'}, {kakao: true}) : null; };
const kkFact = (a, href, M) => { const kb = kkOf(href, M); return kb ? h('div', {class: 'kkr ptalk-kr', 'data-kkrow': 'talk.fact'}, a, kb) : a; };

export async function render() {
  const [core, mkt, home, surge, T] = await Promise.all([NX.need('core'), NX.need('mkt'), NX.need('home'), NX.need('surge'), talkJson()]);
  if (!core) return {title: '오늘의 이야기', nodes: NX.noData()};
  const M = mkt?.companies ?? {}, F = talkFacts(core, M, home, surge);
  const root = h('div', {class: 'ptalk', 'data-page': 'talk'});
  root.append(h('h1', {class: 'wt', text: '오늘의 이야기'}), h('p', {class: 'ptalk-hon', text: '지난 기록으로 만든 이야깃거리예요. 사고팔 곳을 고른 목록이 아니에요.'}));
  // 그림 한 장 — 첫 이야깃거리(내리 오른 곳)의 선 · 처음엔 멈춘 그림 · 누르면 그 회사(보는 화면)
  const f0 = F[0], c0 = f0?.line ? M[f0.code] : null;
  if (c0) {
    const x = NX.c20(c0);
    const cd = NX.card(f0.href, NX.thumb(f0.line, (f0.line.length - 1) + '일', {x}), `${c0.n}, ${f0.line.length - 1}거래일 동안 ${pct(x)}`, `${f0.t} · ${c0.i || '?'} 업종`, NX.first(c0.i || c0.n)), kb = kkOf(f0.href, M);
    root.append(kb ? h('div', {class: 'kkr kkc', 'data-kkrow': 'talk.card'}, cd, kb) : cd); // 카톡 단추 = 카드 밑 글 줄 오른쪽 끝(KB2 · 앱 큰 카드와 같은 꼴 app.css .kkc)
  }
  root.append(h('h2', {class: 'sec', text: '오늘의 이야깃거리'}));
  if (F.length) root.append(h('ol', {class: 'ptalk-list'}, ...F.map(f => h('li', {}, f.href
    ? kkFact(h('a', {class: 'ptalk-fact', href: f.href}, h('span', {class: 'ptalk-ft'}, h('b', {class: 'ptalk-t', text: f.t}), h('span', {text: tx(f.s)})), h('i', {class: 'ptalk-go', 'aria-hidden': 'true', text: '›'})), f.href, M)
    : h('div', {class: 'ptalk-fact'}, h('span', {class: 'ptalk-ft'}, h('b', {class: 'ptalk-t', text: f.t}), h('span', {text: tx(f.s)})))))));
  else root.append(h('p', {class: 'q ptalk-q0', text: '? 이번에는 이야깃거리를 만들 자료를 못 받았어요.'}));
  if (!T) { root.append(h('p', {class: 'q ptalk-q0', text: '? 격언과 영상 목록을 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), foot(core)); return {title: '오늘의 이야기', nodes: [root]}; }
  // 대가 한마디 — 그날 하나(자료 날로 돌림 · 옛 쪽과 같은 날 같은 말) + 모두 보기(접은 칸)
  const day = Math.floor(Date.parse((core.asOf ?? '2026-10-16') + 'T00:00:00Z') / 864e5), mx = T.maxims ?? [], today = mx.length ? mx[day % mx.length] : null;
  const mk = (m, big) => h('figure', {class: 'ptalk-qt' + (big ? ' big' : '')}, h('blockquote', {lang: 'ko', 'data-proper': '1', text: m.ko}), h('p', {class: 'ptalk-en', lang: 'en', 'data-proper': '1', text: m.en}), // 남의 말(대가의 말 그대로 · 출처 확인) — 금지 말 셈 밖
    h('figcaption', {}, h('b', {lang: 'ko', text: m.who}), ' · ', m.url ? h('a', {href: m.url, target: '_blank', rel: 'noopener noreferrer', lang: 'ko', text: m.src}) : h('span', {lang: 'ko', text: m.src})));
  root.append(h('h2', {class: 'sec', text: '대가 한마디'}), h('p', {class: 'note', text: '말한 사람과 출처를 확인한 것만 실었어요.'}));
  if (today) root.append(mk(today, true));
  root.append(h('details', {class: 'ptalk-more'}, h('summary', {text: `격언 ${mx.length}개 모두 보기`}), h('div', {class: 'ptalk-in'}, ...mx.map(m => mk(m, false)))));
  // 유튜브 — 갈래마다 · 밖 사이트로 나감(새 창)
  const yt = T.youtube ?? [];
  root.append(h('h2', {class: 'sec', text: `유튜브 ${yt.length}개`}), h('p', {class: 'note', text: '돌이가 만든 영상이 아니에요. 앞날 맞히기와 종목 찍어 주기 영상은 뺐어요.'}));
  for (const [k, name] of TK_CAT) {
    const xs = yt.filter(y => y[2] === k); if (!xs.length) continue;
    root.append(h('h3', {class: 'ptalk-cat', text: name}), h('ul', {class: 'ptalk-yt'}, ...xs.map(([id, title]) => h('li', {}, ext('https://www.youtube.com/watch?v=' + encodeURIComponent(id),
      [h('i', {class: 'ptalk-pl', 'aria-hidden': 'true'}), h('span', {lang: 'ko', 'data-proper': '1', text: title}), h('i', {class: 'ptalk-go', 'aria-hidden': 'true', text: '›'})])))));
  }
  if (T.hot?.url) root.append(h('h2', {class: 'sec', text: '사람들 이야기'}), h('p', {class: 'note', text: '남의 글은 옮겨 싣지 않아요. 보고 싶으면 네이버로 나가요.'}),
    ext(T.hot.url, [h('span', {text: '네이버 증권 인기 토론 구경 가기'}), h('i', {class: 'ptalk-go', 'aria-hidden': 'true', text: '›'})], 'ptalk-out'));
  root.append(foot(core));
  return {title: '오늘의 이야기', nodes: [root]};
}
