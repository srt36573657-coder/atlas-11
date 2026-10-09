/* ATLAS 11 · 그림 숫자의 기대값 — 판 자료(board.json · agenda.json · /story.json · /changelog.json)로 화면 코드와 따로 셈(규칙 34)
   빠짐없이 도는 검사기(full_check.mjs)와 화면 검사기(browser_check.mjs ⑤-3)가 함께 씀 — 그림이 실은 값(data-check)과 맞댐
   갈래 나누기(family.js 표)만 화면과 같은 자료를 쓰고, 평균 · 차례 · 개수 · 날 수는 여기서 다시 셈 */
import {familyOf} from '../../site/app/family.js';
import {setPlace} from '../../site/app/util.js';
import {CAND_RULES, CHANGE, EXCLUDE_RE, DILUTE_RE, HEAT_RE} from '../../lib/atlas11/cand.mjs'; // 후보 규칙의 숫자 · 낱말 목록만 같이 씀(세는 길은 여기서 따로 — 2026-10-09 「ATLAS 제품 재설계 명령」 14 계산 검증)
const close = (a, b, eps = 1e-6) => fin(a) && fin(b) && Math.abs(a - b) <= eps;
export const fin = v => typeof v === 'number' && Number.isFinite(v);
const desc = (a, b) => (fin(b) ? b : -Infinity) - (fin(a) ? a : -Infinity);
const byRise = key => (a, b) => desc(a.change20, b.change20) || String(a[key] ?? '').localeCompare(String(b[key] ?? '')); // 같으면 code · id 차례(family.js riseDesc 와 같은 규칙)
/** b = 판(kr · us · cn · jp · vn) · others = [{id, label, n}](위 막대 시장 차례) */
export function expectOf(b, board, agenda, story, log, others, lens = null, extra = {}) {
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
  // 불장(#/) — 봉화대 그림(2026-10-08 17:41 마카오 시각 「돈에 흐름과 불장을 분리한다」): 불장 업종 가운데 오른 순 1위 · 그 값 · 2위 · 불장 업종 수 · 셀 값이 없으면 빈 하늘
  const hotG = groups.filter(g => g.hot), hotF = hotG.filter(g => fin(g.change20)).sort(byRise('id'));
  E.home = hotF.length ? {g0: hotF[0].id, v0: hotF[0].change20, g1: hotF[1]?.id ?? null, n: hotG.length} : Q('home');
  const rot = b === 'kr' ? story?.rotation : story?.rotations?.[b];
  E.rot = rot && !rot.none && rot.pair ? rot : null; // 없으면 아래 탭 「돈 흐름」은 빈 하늘(E.flow)
  // 돈 흐름 업종의 회사(17:41 「돈에 흐름에 관련된 종목들을 표기하라」) — [쪽(들어가는 곳 먼저), 차례, 업종, 그 업종 회사 기호(오른 순)]
  E.flowCos = E.rot ? ['in', 'out'].flatMap(side => (rot[side] ?? []).slice(0, 3).map((x, i) => { const g = groups.find(y => y.id === x.id); return [side, i + 1, x.id, (g?.codes ?? []).map(c => byCode.get(c)).filter(Boolean).sort(byRise('code')).map(c => c.code)]; })) : null;
  E.flow = E.rot ? {from: rot.pair.from.id, to: rot.pair.to.id, start: rot.pair.start, days: rot.pair.days, outAmt: rot.out[0].amount, inAmt: rot.in[0].amount, outs: (rot.out ?? []).slice(0, 3).map(x => [x.id, x.amount]), ins: (rot.in ?? []).slice(0, 3).map(x => [x.id, x.amount]), fomo: rot.fomo.to, waves: (rot.waves ?? []).map(x => [x.n, x.to.id, x.start, x.end])} : Q('flow'); // 파장 1~5차(06:46 · 셈은 waves_verify.py 가 따로) · 빠지는 곳 · 들어가는 곳 1위~3위(10월 8일 12:43 · 12:59 「1등부터 3등까지 · 가장 많이 나간 순」)
  // 판 읽기 그림(2026-10-08 20:19 「ATLAS 개편 실행 지시서」) — 판 읽기(lens.json)를 못 읽으면 빈 하늘
  //   시장: 판 자료(board)로 따로 셈 — 그날 종가가 있는 회사 · 지난 20거래일 하루 변화가 한국 가격 제한폭(±30%)을 넘은 회사는 뺌 · 하루 변화 부호 · 공식 지수 하루 변화(판 목록 market)
  const L = lens && !lens.none ? lens : null;
  if (L) {
    // 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 — 시장 · 업종 탭 · 업종 화면 · 회사 화면 그림은 판 읽기(lens.json)의 종목 20거래일 값(r20 · %)으로 그림 → 여기서 화면 코드(calc.js · decomp.js · observe.js)와 다른 길로 다시 셈
    const st = L.stocks ?? [], valid = st.filter(s => fin(s.r20)), rs = valid.map(s => s.r20);
    const avgOf = xs => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : null);
    const medOf = xs => { const v = [...xs].sort((a, c) => a - c), n = v.length; return n ? (n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2) : null; };
    const R = L.market?.ref ?? {}, I = fin(R.r20) ? R.r20 : null;
    // 업종마다 값이 있는 종목 합 · 수(기여 1위 = 합이 가장 큰 업종 · 같으면 판 읽기 차례 앞)
    const secs = (L.sectors ?? []).map(sc => { const ms = (sc.codes ?? []).map(c => st.find(x => x.code === c)).filter(Boolean), ok = ms.filter(x => fin(x.r20)); return {sc, ms, ok, sum: ok.reduce((t, x) => t + x.r20, 0), n: ok.length}; });
    let top = null; for (const x of secs) if (x.n && (!top || x.sum > top.sum)) top = x;
    // 관측 규칙(obs-rules-1)을 따로 셈 — 평평 ±1% · 표본 30곳 · 지수 대 오른 곳 비율 50%
    const N = rs.length, U = N ? (rs.filter(x => x > 0).length / N) * 100 : null, Md = medOf(rs);
    const kind = !fin(I) || N < 30 || !fin(Md) ? 'na' : Math.abs(I) < 1 && Math.abs(Md) < 1 ? 'flat' : I >= 1 && U < 50 ? 'divUp' : I <= -1 && U > 50 ? 'divDown' : (Math.abs(I) >= 1 ? I > 0 : Md > 0) ? 'agreeUp' : 'agreeDown';
    E.market = N ? {idx: I, n: N, up: rs.filter(x => x > 0).length, down: rs.filter(x => x < 0).length, flat: rs.filter(x => x === 0).length, median: Md, mean: avgOf(rs), kind, top: top?.sc.id ?? null} : Q('market');
    // 업종 탭(#/sectors) — 선정 평균을 업종마다 펼침 · 기여 1위 업종을 뺀 평균 · 시가총액 가중(값이 있는 종목 모두 시가총액이 있을 때만)
    const capsOk = valid.length && valid.every(x => fin(x.fund?.cap) && x.fund.cap > 0), wAvg = xs => { const w = xs.reduce((t, x) => t + x.fund.cap, 0); return w > 0 ? xs.reduce((t, x) => t + x.fund.cap * x.r20, 0) / w : null; };
    E.sectors = N ? {G: secs.length, n: N, mean: avgOf(rs), median: Md, up: rs.filter(x => x > 0).length, top: top?.sc.id ?? null, exTop: top && N > top.n ? (rs.reduce((t, x) => t + x, 0) - top.sum) / (N - top.n) : null, wMean: capsOk ? wAvg(valid) : null, u: 'pct'} : Q('sectors');
    // 업종 화면(#/i/…) — 값이 있는 종목(수익률 큰 차례 · 같으면 기호 차례) · 상승 1위 · 1위를 뺀 평균 · 시가총액 가중
    E.ind = Object.fromEntries(secs.map(({sc, ms, ok}) => {
      if (!ok.length) return [sc.id, Q('industry')];
      const srt = [...ok].sort((a, c) => c.r20 - a.r20 || a.code.localeCompare(c.code)), v = srt.map(x => x.r20), wOk = ok.every(x => fin(x.fund?.cap) && x.fund.cap > 0);
      return [sc.id, {id: sc.id, n: ok.length, total: ms.length, mean: avgOf(v), median: medOf(v), up: v.filter(x => x > 0).length, lead: srt[0].code, r0: srt[0].r20, exTop: v.length > 1 ? avgOf(v.slice(1)) : null, wMean: wOk ? wAvg(ok) : null, u: 'pct'}];
    }));
    // 회사 화면 — 판 읽기에 그 종목 · 업종이 있으면 판 읽기 값(없으면 위 판 값 그대로)
    for (const c of cs) { const me = st.find(x => x.code === c.code), sc = me?.g ? (L.sectors ?? []).find(x => x.id === me.g) : null; if (!me || !sc) continue;
      E.co[c.code] = {code: c.code, v: fin(me.r20) ? me.r20 : null, avg: fin(sc.d20?.mean) ? sc.d20.mean : null, peers: (sc.codes ?? []).map(x => st.find(y => y.code === x)).filter(Boolean).length - 1, u: 'pct'}; }
    E.flowwho = fin(extra.flow5?.f) || fin(extra.flow5?.i) ? {f5: fin(extra.flow5.f) ? Math.round(extra.flow5.f / 1e8) : null, i5: fin(extra.flow5.i) ? Math.round(extra.flow5.i / 1e8) : null} : Q('flowwho');
    E.stocks = L.changes ? {up: L.buckets.up, down: L.buckets.down, new: L.buckets.new} : Q('stocks');
    const recs = L.verify?.records ?? [], ev = recs.flatMap(r => Object.values(r.evals).flat());
    E.check = recs.length && (extra.records == null || extra.records === recs.length) ? {records: recs.length, pending: ev.filter(e => e.status === 'pending').length, done: ev.filter(e => e.status === 'done').length} : recs.length ? {records: extra.records} : Q('check');
    // 매수 검토 후보(#/ · 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 · 03:53 「돈에 흐름이 강한 업종내에서」 · 10:14 「모테카를로 … 소거법」 — 규칙 cand-rules-3)
    //   1만 번 다시 뽑은 횟수는 판 읽기(mc.counts — 파이썬 따로 세기 scripts/atlas11/verify/cand_mc_verify.py 가 맞댐) · 소거법 차례(진입 → 횟수 → 세기 → 금액 → 기호 · 같은 업종 3곳 · 7곳)는 여기서 따로
    //   돈 흐름(/story.json rotation — 사이트 「돈 흐름」 화면과 같은 파일)의 늘어난 곳 1~3위 · 판 업종 · 판 읽기 종목 값 · 일정표 공시(agenda.json)로 다섯 조건 · 진입 조건을 따로 셈 · 장 마감 뒤 공시는 뺌
    const CA = L.cand, rot = story?.rotation;
    if (CA?.ready && rot && !rot.none) {
      const asOf = L.asOf, hm = String(L.when?.closeAt ?? '15:30').match(/(\d{1,2}):(\d{2})/), cut = Date.parse(`${asOf}T${hm[1].padStart(2, '0')}:${hm[2]}:00+09:00`);
      const back = n => new Date(Date.parse(asOf + 'T00:00:00Z') - n * 864e5).toISOString().slice(0, 10), from = back(CAND_RULES.windowDays), heatFrom = back(CAND_RULES.heatDays);
      const okSecs = (rot.in ?? []).slice(0, CAND_RULES.sectors).filter(g => g.amount > 0 && (g.who?.foreign ?? 0) + (g.who?.institution ?? 0) > 0 && g.change > 0).map(g => g.id);
      const inSec = new Set(groups.filter(g => okSecs.includes(g.id)).flatMap(g => g.codes ?? []));
      const pref = (t, name) => { const m = String(t).match(/\(([^()]*우[A-Z0-9]?)\)\s*$/); return !!m && m[1] !== name; };
      let n0 = 0, data = 0, profit = 0, risk = 0, screen = 0, met = 0; const elig = [];
      for (const s of st.filter(x => inSec.has(x.code))) {
        n0++;
        const ds = (agenda?.byCode?.[s.code]?.disclosures ?? []).filter(d => { const t = Date.parse(d.publishedAt ?? ''), day = String(d.publishedAt ?? '').slice(0, 10); return day >= from && (Number.isFinite(t) ? t <= cut : day <= asOf); });
        const f = s.fund ?? {}, fl = s.fl ?? {}, okD = s.status === 'ok' && fin(s.r20), okP = fin(f.op) && fin(f.net) && f.op > 0 && f.net > 0;
        const okR = !ds.some(d => !pref(d.title, s.name) && EXCLUDE_RE.test(d.title)), fi = fin(fl.f10e) && fin(fl.i10e) ? fl.f10e + fl.i10e : null;
        if (okD) data++; if (okD && okP) profit++; if (okD && okP && okR) risk++;
        const sc = okD && okP && okR && fin(fi) && fi > 0; if (sc) screen++;
        const heat = ds.some(d => !pref(d.title, s.name) && HEAT_RE.test(d.title) && String(d.publishedAt).slice(0, 10) >= heatFrom), dil = ds.some(d => DILUTE_RE.test(d.title));
        const ok = sc && s.r20 <= CAND_RULES.maxR20 && !heat && !dil; if (ok) met++;
        if (sc) elig.push({code: s.code, g: s.g, met: ok ? 1 : 0, fi: fi / 1e8, cap: s.fund?.cap});
      }
      const draws = CA.mc?.draws ?? 0, nOf = code => CA.mc?.counts?.[code] ?? 0;
      const per = new Map(), order = elig.map(e => ({...e, n: nOf(e.code), pw: fin(e.cap) && e.cap > 0 ? (e.fi / e.cap) * 100 : -1e9}))
        .sort((p, q) => (q.met - p.met) || (q.n - p.n) || (q.pw - p.pw) || (q.fi - p.fi) || p.code.localeCompare(q.code))
        .filter(e => { const k = per.get(e.g) ?? 0; if (k >= CAND_RULES.perSector) return false; per.set(e.g, k + 1); return true; }).slice(0, CAND_RULES.want);
      const stOf = new Map(CA.items.map(x => [x.code, x.status]));
      E.candRows = order.map((e, i) => [e.code, stOf.get(e.code) ?? (e.met ? 'met' : 'wait'), i + 1]); // 화면 줄 차례 = 소거법 차례(따로 셈) · 상태는 판 읽기(재검토는 마감 뒤 공시 · 가격 기준 — 순위와 따로)
      const pw = x => { const s = st.find(y => y.code === x.code), fl = s?.fl ?? {}, cap = s?.fund?.cap; return fin(fl.f10e) && fin(fl.i10e) && fin(cap) && cap > 0 ? Math.round(((fl.f10e + fl.i10e) / 1e8 / cap) * 100 * 1e4) / 1e4 : null; }; // 판 읽기 파일의 소수 넷째 자리와 같게
      // 입체 땅(2026-10-09 08:26 「입체적으로 보여야하는 중심으로」) — 솟은 땅 = 늘어난 곳 1위~3위(금액 · 조건 셋) · 꺼진 땅 = 줄어든 곳 1위~3위 · 탑 = 후보(순위 · 상태 · 세기 소수 둘째 자리)
      const plates = (rot.in ?? []).slice(0, CAND_RULES.sectors).map(g => [g.label, Math.round(g.amount), g.amount > 0 && (g.who?.foreign ?? 0) + (g.who?.institution ?? 0) > 0 && g.change > 0]);
      const pits = (rot.out ?? []).slice(0, 3).map(g => [g.label, Math.round(g.amount)]);
      const towers = order.map((e, i) => [e.code, i + 1, stOf.get(e.code) ?? (e.met ? 'met' : 'wait'), nOf(e.code)]); // 탑 = 1만 번 가운데 7곳에 든 횟수
      E.cand = {universe: st.length, sectors: okSecs.length, inSector: n0, data, profit, risk, screen, met, n: order.length, mc: CAND_RULES.draws, plates, pits, towers};
      const [a, b2] = CA.items, sa = a && st.find(s => s.code === a.code), sb = b2 && st.find(s => s.code === b2.code);
      E.compare = sa && sb ? {a: sa.code, b: sb.code, apow: pw(sa), bpow: pw(sb), ar20: sa.r20, br20: sb.r20} : Q('compare');
    } else { E.cand = Q('cand'); E.compare = Q('compare'); }
  } else { E.market = Q('market'); E.sectors = Q('sectors'); E.flowwho = Q('flowwho'); E.stocks = Q('stocks'); E.check = Q('check'); E.cand = Q('cand'); E.compare = Q('compare'); } // 판 읽기를 못 읽은 날 — 업종 화면 · 회사 화면은 위 판 값 그림 · 후보는 지어내지 않음(빈 축)
  E.watch = Q('watch'); // 검사 창에는 관심 등록이 없음(이 기기 저장 · 빈 하늘)
  { // 읽는 법 연습(#/learn · 2026-10-09 셋째 개정본 0-E) — 연습용 숫자(시험과 같은 입력) · 처음 고른 묶음 B · 가정한 시장 +5% · 관측 규칙 「쏠림」 = 평균 1% 넘게 올랐는데 1위를 빼면 0 이하
    const v = [24, 1, 0, -2, -3], s = [...v].sort((a, c) => a - c), m = v.reduce((t, x) => t + x, 0) / v.length, ex = (v.reduce((t, x) => t + x, 0) - Math.max(...v)) / (v.length - 1);
    E.learn = {set: 'B', n: v.length, mean: m, median: s[2], up: v.filter(x => x > 0).length, exTop: ex, gap: m - 5, kind: m >= 1 && ex <= 0 ? 'concentrated' : 'other', u: 'pct'}; }
  return E;
}
/** 투자자 매매 그림의 기대값 — 회사 화면 파일(stocks/*.json)의 날마다 순매매(주식 수) × 그날 종가(closes60)로 따로 셈(판 읽기와 다른 길) · 마지막 5거래일 줄이 다 있고 종가가 다 있는 회사만 */
export function flowExpect(stockFiles) {
  const dates = [...new Set(stockFiles.flatMap(s => (s?.context?.flows ?? []).map(r => r.date)))].sort().slice(-5);
  if (dates.length < 5) return null;
  let f = 0, i = 0, nf = 0;
  for (const s of stockFiles) {
    const rows = new Map((s?.context?.flows ?? []).map(r => [r.date, r])), cl = new Map((s?.closes60 ?? []).map(r => [r.date, r.close]));
    let ff = 0, ii = 0, ok = true;
    for (const d of dates) { const r = rows.get(d), c = cl.get(d); if (!r || !fin(r.foreignNet) || !fin(r.institutionNet) || !fin(c)) { ok = false; break; } ff += r.foreignNet * c; ii += r.institutionNet * c; }
    if (ok) { f += ff; i += ii; nf++; }
  }
  return nf ? {f, i, n: nf} : null;
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

