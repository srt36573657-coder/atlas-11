/* ATLAS 11 · 논평 — 화면마다 제목 아래 한 줄(결론 먼저 · 숫자는 판에서 그대로 · 앞날 말 없음)
   사장님 2026-10-07 03:17 「아틀람스를 섹시하게 논평이 있는 구조로 만든다 섹시란 무엇인가 · 100번 고민한후 자율적으로 하라」
   · 섹시 = 봐야 할 것 하나만 빛나고 나머지는 물러나는 것(사장님 교본 2026-08-31 「하나만 비추고 나머지는 어둠」)
     → 화면마다 빛나는 것은 논평 한 줄 하나 · 큰 글씨 · 왼쪽 금빛 줄 · 한 번만 천천히 밝혀짐(움직이는 것 하나)
   · 논평 = 「결론을 맨 앞에 두고 근거는 뒤에」 — 머리 한 줄(무엇이 일어났나) + 작은 근거 한 줄(숫자) → 그 아래가 화면 전체(증거)
   · 쓰는 법: 부정형으로 열지 않는다 · 사실은 단정 · 앞날은 말하지 않는다(2026-10-04 「이제 예측을 하지 않는다」) · 사고팔라는 말 없음
   · 셈은 여기 한 곳(판 board.json · 일정 agenda.json 만 읽는 순수 함수) — 시험 tests/atlas11/comment.test.mjs · 검사기 browser_check 「논평」이 따로 셈
   · 찾기 · 기록 화면에는 달지 않는다(도구 · 기록 화면이라 할 말이 화면 그 자체) */
import {h, pct, korDate, finite} from './util.js';
import {familiesByRise, familyOf, meanOf, riseDesc} from './family.js';

/** 변화 한 개(소수 한 자리 · 아주 작으면 둘째 자리) */
const p1 = v => pct(v, finite(v) && Math.abs(v) < 0.0005 ? 2 : 1);
/** %p — 두 변화의 차이(정수) */
const pp = v => `${Math.round(Math.abs(v) * 100)}%p`;
const NUM_KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const nm = name => ({n: name, ident: true}); // 회사 이름 — 식별자(이름 속 숫자를 단위 없는 숫자로 세지 않게)
const lb = label => ({n: label}); // 업종 · 갈래 이름
/** 조각 → 글(시험 · 소리) */
export const plain = parts => (parts ?? []).map(p => (typeof p === 'string' ? p : p.n)).join('');

/** 탭 「불장」 첫 화면 — 판을 이끄는 갈래 · 혼자 앞선 업종 · 번진 갈래 수 */
export function homeComment(board) {
  const groups = board?.groups ?? [], hot = groups.filter(g => g.hot);
  if (!hot.length) return {id: 'home', kind: 'cold', head: [`업종 ${groups.length}개가 쉬어 간 판`], sub: ['지난 20거래일 평균이 오른 업종 0개']};
  const flows = familiesByRise(hot), f0 = flows[0], g = [...hot].sort(riseDesc);
  const gap = g.length > 1 && finite(g[0].change20) && finite(g[1].change20) ? g[0].change20 - g[1].change20 : null;
  if (f0.groups.length >= 2 && f0.groups.length / hot.length >= 0.4) return {id: 'home', kind: 'lead', head: ['판을 이끄는 건 ', lb(f0.fam.label)], sub: [`불장 ${hot.length}개 중 ${f0.groups.length}개 · 갈래 평균 ${p1(f0.avg)}`]};
  if (gap != null && gap >= 0.15) return {id: 'home', kind: 'solo', head: ['맨 앞은 ', lb(g[0].label)], sub: [`${p1(g[0].change20)} · 2위와 차이 ${pp(gap)}`]};
  return {id: 'home', kind: 'spread', head: [`불은 ${flows.length}갈래로 번졌다`], sub: [`불장 ${hot.length}개 · 1위 `, lb(g[0].label), ` ${p1(g[0].change20)}`]};
}

/** 탭 「지도」 — 가장 붉은 땅(큰 갈래 평균이 가장 큰 곳) · 붉은 땅 수 · 가장 푸른 땅 */
export function mapComment(board) {
  const fams = familiesByRise(board?.groups ?? []).filter(f => finite(f.avg));
  if (!fams.length) return null;
  const top = fams[0], low = fams.at(-1), up = fams.filter(f => f.avg > 0).length;
  if (!(top.avg > 0)) return {id: 'map', kind: 'cold', head: [`땅 ${fams.length}개 모두 푸르다`], sub: ['가장 덜 내린 땅 ', lb(top.fam.label), ` ${p1(top.avg)}`]};
  return {id: 'map', kind: 'red', head: ['가장 붉은 땅, ', lb(top.fam.label)],
    sub: low.avg < 0 && low !== top ? [`${p1(top.avg)} · 땅 ${fams.length}개 중 ${up}개 붉음 · 가장 푸른 땅 `, lb(low.fam.label), ` ${p1(low.avg)}`] : [`${p1(top.avg)} · 땅 ${fams.length}개 중 ${up}개 붉음`]};
}

/** 지도 갈래 화면 — 갈래를 이끄는 업종 */
export function landComment(board, famId) {
  const gs = (board?.groups ?? []).filter(g => familyOf(g.label).id === famId && finite(g.change20)).sort(riseDesc);
  if (!gs.length) return null;
  const g0 = gs[0], g1 = gs[1];
  if (gs.length === 1) return {id: 'land', kind: 'one', head: [`업종 하나, ${p1(g0.change20)}`], sub: [lb(g0.label)]};
  const sub = [`${p1(g0.change20)} · 2위 `, lb(g1.label), ` ${p1(g1.change20)}`]; // 글 조각은 「 · 」로 시작하지 않게(말 바꾸기가 조각마다 틀을 찾음)
  if (g0.change20 > 0) return {id: 'land', kind: 'lead', head: ['갈래를 이끄는 건 ', lb(g0.label)], sub};
  return {id: 'land', kind: 'cold', head: ['가장 덜 내린 건 ', lb(g0.label)], sub};
}

/** 업종 화면 — 업종을 이끄는 회사 · 모두 오름 · 모두 내림 */
export function industryComment(board, g) {
  if (!g) return null;
  const byCode = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const cs = (g.codes ?? []).map(code => byCode.get(code)).filter(c => c && finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const c0 = cs[0], up = cs.filter(c => c.change20 > 0).length, down = cs.filter(c => c.change20 < 0).length;
  if (cs.length > 1 && up === cs.length) return {id: 'industry', kind: 'all-up', head: [`${cs.length}곳 모두 올랐다`], sub: ['맨 앞 ', nm(c0.name), ` ${p1(c0.change20)} · 업종 평균 ${p1(g.change20)}`]};
  if (cs.length > 1 && down === cs.length) return {id: 'industry', kind: 'all-down', head: [`${cs.length}곳 모두 내렸다`], sub: ['가장 덜 내린 ', nm(c0.name), ` ${p1(c0.change20)} · 업종 평균 ${p1(g.change20)}`]};
  return {id: 'industry', kind: 'lead', head: ['업종을 이끄는 건 ', nm(c0.name)], sub: [`${p1(c0.change20)} · 업종 평균 ${p1(g.change20)} · ${cs.length}곳 중 ${up}곳 오름`]};
}

/** 회사 화면 — 업종 안 자리 · 업종과 거꾸로 간 회사(둘 다 2% 넘게 움직였을 때만) */
export function companyComment(board, s) {
  if (!s || !finite(s.change20)) return null;
  const g = (board?.groups ?? []).find(x => x.id === s.group?.id);
  if (!g) return null;
  const byCode = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const peers = (g.codes ?? []).map(code => byCode.get(code)).filter(c => c && finite(c.change20)).sort(riseDesc);
  const n = peers.length, k = peers.findIndex(c => c.code === s.code) + 1;
  if (!k) return null;
  const sub = [`${p1(s.change20)} · 업종 평균 ${p1(g.change20)}`];
  if (finite(g.change20) && Math.abs(s.change20) >= 0.02 && Math.abs(g.change20) >= 0.02 && Math.sign(s.change20) !== Math.sign(g.change20)) return {id: 'company', kind: 'against', head: ['업종과 거꾸로 갔다'], sub};
  if (n > 1 && k === 1) return {id: 'company', kind: 'first', head: [`업종 ${n}곳 중 맨 앞`], sub};
  if (n > 1 && k === n) return {id: 'company', kind: 'last', head: [`업종 ${n}곳 중 맨 뒤`], sub};
  return {id: 'company', kind: 'rank', head: [`업종 ${n}곳 중 ${k}위`], sub};
}

/** 탭 「출목표」 — 몇 곳이 올랐나(많은 쪽을 말함) · 근거는 아래 칸들(오른 순) */
export function roadComment(board) {
  const cs = (board?.companies ?? []).filter(c => finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const up = cs.filter(c => c.change20 > 0).length, down = cs.filter(c => c.change20 < 0).length, N = board.companies.length;
  const head = up >= down ? [`${N}곳 중 ${up}곳이 올랐다`] : [`${N}곳 중 ${down}곳이 내렸다`];
  return {id: 'road', kind: up >= down ? 'up' : 'down', head, sub: []}; // 근거 줄 없음 — 바로 아래 칸들이 오른 순(1위가 첫 칸)이라 화면이 곧 근거 · 휴대폰 첫 화면에 첫 칸이 들게
}

/** 탭 「일정」 — 별이 가장 많은 일정 가운데 가장 이른 것 · events = 시장 일정 + 회사 · 업종 일정 [{date, name, level, scope}] */
export function agendaComment(events) {
  const es = (events ?? []).filter(e => e?.date && e?.name && finite(e.level));
  if (!es.length) return null;
  const top = [...es].sort((a, b) => b.level - a.level || a.date.localeCompare(b.date) || a.name.localeCompare(b.name, 'ko'))[0];
  return {id: 'agenda', kind: 'next', head: [`${korDate(top.date)}, `, {n: top.name, ident: true, ko: top.scope !== 'market'}], sub: [`별 ${top.level}개 — 일정 ${es.length}건 중 별이 가장 많고 가장 이른 날`]};
}

/** 탭 「처음」 — 찍은 곳들이 보통 회사보다 얼마나 덜 떨어졌나 · 3년이 모자란 판은 언제 여나 */
export function startComment(board) {
  const s = board?.start;
  if (!s) return null;
  if (!s.ready) {
    if (!s.readyMonth) return null;
    return {id: 'start', kind: 'wait', head: [`${Number(s.readyMonth.slice(0, 4))}년 ${Number(s.readyMonth.slice(5, 7))}월에 문을 연다`], sub: [`3년 종가가 쌓이는 때 · 지금은 ${s.have?.days ?? 0}거래일`]};
  }
  const picks = s.picks ?? [], n = picks.length, typ = s.typical?.mdd;
  if (!n || !finite(typ) || typ >= 0) return null;
  const worst = Math.min(...picks.map(p => p.mdd)), word = `${NUM_KO[n] ?? n} 곳`;
  return {id: 'start', kind: Math.abs(worst) <= Math.abs(typ) * 0.55 ? 'half' : 'less',
    head: [Math.abs(worst) <= Math.abs(typ) * 0.55 ? `${word}, 보통의 절반만 떨어졌다` : `${word} 모두 보통보다 덜 떨어졌다`],
    sub: [`가장 깊어도 ${pct(worst, 0)} · 보통 회사 ${pct(typ, 0)}`]};
}

/** 화면에 — 머리(빛나는 한 줄) · 근거(작은 한 줄) · 위 작은 이름표 「논평」 */
const partEl = p => (typeof p === 'string' ? p : h('span', {class: 'cm-n', 'data-ident': p.ident ? '' : null, lang: p.ko ? 'ko' : null}, p.n));
export function commentBox(c) {
  if (!c) return null;
  return h('section', {class: 'cm', 'aria-label': '논평', 'data-comment': c.id, 'data-kind': c.kind},
    h('p', {class: 'cm-tag'}, '논평'),
    h('p', {class: 'cm-h', 'data-speak': ''}, ...c.head.map(partEl)),
    c.sub?.length ? h('p', {class: 'cm-s'}, ...c.sub.map(partEl)) : null);
}
/** 소리 · 요약 맨 앞에 붙일 한 문장 */
export const commentSay = c => (c ? `${plain(c.head)}. ${plain(c.sub)}. ` : '');
