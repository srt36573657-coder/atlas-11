/* ATLAS 11 · 그림 숫자의 기대값 — 판 자료(board.json · agenda.json · /story.json · /changelog.json)로 화면 코드와 따로 셈(규칙 34)
   빠짐없이 도는 검사기(full_check.mjs)와 화면 검사기(browser_check.mjs ⑤-3)가 함께 씀 — 그림이 실은 값(data-check)과 맞댐
   갈래 나누기(family.js 표)만 화면과 같은 자료를 쓰고, 평균 · 차례 · 개수 · 날 수는 여기서 다시 셈 */
import {familyOf} from '../../site/app/family.js';
import {setPlace} from '../../site/app/util.js';
const close = (a, b, eps = 1e-6) => fin(a) && fin(b) && Math.abs(a - b) <= eps;
export const fin = v => typeof v === 'number' && Number.isFinite(v);
const desc = (a, b) => (fin(b) ? b : -Infinity) - (fin(a) ? a : -Infinity);
const byRise = key => (a, b) => desc(a.change20, b.change20) || String(a[key] ?? '').localeCompare(String(b[key] ?? '')); // 같으면 code · id 차례(family.js riseDesc 와 같은 규칙)
/** b = 판(kr · us · cn · jp · vn) · others = [{id, label, n}](위 막대 시장 차례) */
export function expectOf(b, board, agenda, story, log, others) {
  setPlace({id: b});
  const cs = board.companies, byCode = new Map(cs.map(c => [c.code, c])), groups = board.groups ?? [], E = {};
  const Q = key => ({quiet: key}); // 빈 하늘(2026-10-08 05:05 빈 날 막기 — 그 화면 그림이 그릴 값이 없는 날 · scenes.js quietArt 의 data-check)
  // 지도 — 갈래 평균(그 갈래 업종들의 지난 20거래일 평균의 평균) · 가장 큰 · 가장 작은 · 붉은 땅 수
  const fam = new Map();
  for (const g of groups) { const f = familyOf(g.label); if (!fam.has(f.id)) fam.set(f.id, []); fam.get(f.id).push(g); }
  const fams = [...fam].map(([id, gs]) => { const v = gs.map(g => g.change20).filter(fin); return {id, avg: v.length ? v.reduce((t, x) => t + x, 0) / v.length : null}; }).filter(f => fin(f.avg)).sort((a, c) => desc(a.avg, c.avg) || a.id.localeCompare(c.id));
  E.map = fams.length ? {top: fams[0].id, topAvg: fams[0].avg, low: fams.at(-1).id, lowAvg: fams.at(-1).avg, up: fams.filter(f => f.avg > 0).length, n: fams.length} : Q('map');
  E.land = Object.fromEntries([...fam].map(([id, gs]) => { const s = gs.filter(g => fin(g.change20)).sort(byRise('id')); return [id, s.length ? {g0: s[0].id, v0: s[0].change20, g1: s[1]?.id ?? null, up: s.filter(g => g.change20 > 0).length, n: s.length} : Q('land')]; }));
  E.ind = Object.fromEntries(groups.map(g => { const s = (g.codes ?? []).map(c => byCode.get(c)).filter(c => c && fin(c.change20)).sort(byRise('code')); return [g.id, s.length ? {lead: s[0].code, v0: s[0].change20, avg: fin(g.change20) ? g.change20 : null, n: s.length} : Q('industry')]; }));
  E.co = Object.fromEntries(cs.map(c => { const g = groups.find(x => x.id === c.group?.id); return [c.code, {code: c.code, v: fin(c.change20) ? c.change20 : null, avg: fin(g?.change20) ? g.change20 : null, peers: (g?.codes ?? []).filter(x => x !== c.code && byCode.has(x)).length}]; })); // 20거래일 값이 없는 회사도 그림(값 없음 · 2026-10-08 05:05)
  const sim = [...(board.similar?.items ?? [])].filter(x => fin(x.change20)).sort(byRise('code'));
  E.similar = sim.length ? {lead: sim[0].code, v0: sim[0].change20, n: sim.length, common: (board.similar.common ?? []).length} : Q('similar');
  const nx = (board.next?.items ?? []).filter(x => fin(x.change20));
  E.rise = nx.length ? {lead: nx[0].code, v0: nx[0].change20, last: nx.at(-1).code, vl: nx.at(-1).change20, n: nx.length, ok: nx.every((x, i) => i === 0 || x.change20 <= nx[i - 1].change20)} : Q('rise');
  const m = cs.filter(c => fin(c.change20)).sort(byRise('code'));
  E.road = m.length ? {up: m.filter(c => c.change20 > 0).length, down: m.filter(c => c.change20 < 0).length, N: cs.length, lead: m[0].code, v0: m[0].change20} : Q('road');
  // 일정 — 시장 일정 + 회사 · 업종 일정 가운데 별이 가장 많고 가장 이른 것(모은 날 이후) · 그날까지 달력 날 수
  const evs = new Map(); for (const e of Object.values(agenda?.byCode ?? {})) for (const ev of e.upcoming ?? []) if (!evs.has(ev.id)) evs.set(ev.id, ev);
  const day = agenda?.builtDay ?? null, all = [...(agenda?.market ?? []), ...evs.values()].filter(e => e?.date && e?.name && fin(e.level) && (!day || e.date >= day));
  const top = [...all].sort((a, c) => c.level - a.level || a.date.localeCompare(c.date) || a.name.localeCompare(c.name, 'ko'))[0];
  E.agenda = !agenda ? Q('fail') : top ? {date: top.date, day, dd: Math.round((Date.parse(top.date) - Date.parse(day)) / 864e5), level: top.level} : {market: (agenda.market ?? []).length, company: evs.size}; // 일정이 없는 판 — 0건 그림 · 일정 자료를 못 읽은 날 — 화면을 그리지 못함(오류 화면의 빈 하늘)
  E.find = others.length ? {N: others.reduce((t, x) => t + x.n, 0), boards: others.map(x => [x.id, x.n])} : Q('find');
  const es = log?.entries ?? [], days = [...new Set(es.map(e => String(e.live).slice(0, 10)))].sort();
  E.log = es.length ? {n: es.length, days: days.length, last: days.at(-1), lastN: es.filter(e => String(e.live).startsWith(days.at(-1))).length, issue: es.filter(e => e.kind === 'issue').length, update: es.filter(e => e.kind === 'update').length, data: es.filter(e => e.kind === 'data').length} : Q('log');
  const st = board.start;
  const picks = (st?.picks ?? []).map(p => p.mdd).filter(fin);
  E.start = !st ? Q('start') : st.ready ? (picks.length && fin(st.typical?.mdd) ? {worst: Math.min(...picks), typ: st.typical.mdd, n: picks.length} : Q('start')) : {have: st.have?.days ?? 0, need: st.rule?.days ?? 756};
  const rot = b === 'kr' ? story?.rotation : story?.rotations?.[b];
  E.rot = rot && !rot.none && rot.pair ? rot : null; // 없으면 첫 화면은 빈 하늘(E.home)
  E.home = E.rot ? {from: rot.pair.from.id, to: rot.pair.to.id, start: rot.pair.start, days: rot.pair.days, outAmt: rot.out[0].amount, inAmt: rot.in[0].amount, fomo: rot.fomo.to, waves: (rot.waves ?? []).map(x => [x.n, x.to.id, x.start, x.end])} : Q('home'); // 파장 1~5차(06:46 · 셈은 waves_verify.py 가 따로)
  return E;
}
/** data-check(그림이 실은 값) ↔ 기대값 — 숫자는 소수 여섯째 자리까지 · bad(what) 로 알림 · 맞댄 숫자 수를 돌려줌 */
export function compare(got, want, bad) {
  let n = 0;
  if (!want) { bad('기대값 없음(판 자료에 이 그림의 값이 없음)'); return 0; }
  for (const [k, v] of Object.entries(want)) {
    if (k === 'ok') { if (!v) bad('오름 상위 차례가 오른 순이 아님'); continue; }
    const g = got?.[k];
    if (fin(v)) { n++; if (!close(g, Math.round(v * 1e6) / 1e6, 1.5e-6) && !close(g, v)) bad(`${k}: 그림 ${g} · 자료 ${v}`); }
    else if (Array.isArray(v)) { n += v.flat().length; if (JSON.stringify(g) !== JSON.stringify(v)) bad(`${k}: 그림 ${JSON.stringify(g)} · 자료 ${JSON.stringify(v)}`); }
    else if (v != null || g != null) { n++; if (g !== v) bad(`${k}: 그림 ${g} · 자료 ${v}`); }
  }
  return n;
}
/** 보이는 % 글 = 기대 % (소수 한 자리 · 아주 작으면 둘째 자리 — 화면 규칙과 같음) */
export const pctText = v => { const d = Math.abs(v) < 0.0005 ? 2 : 1; return (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%'; };

