// 지도 샘플 11가지가 함께 쓰는 실제 자료(maps/data.js) — 한국 판 · 미국 판 view 파일과 고를 때 받은 시가총액에서 뽑음
// 지어낸 숫자 없음: 모든 값은 아래 파일에서 그대로 옮기거나 그 값으로 셈
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {setPlace} from '/home/claude/atlas-11/site/app/util.js';
import {FAMILIES, OTHER, familyOf} from '/home/claude/atlas-11/site/app/family.js';

const R = '/home/claude/atlas-11';
const rd = p => JSON.parse(fs.readFileSync(path.join(R, p), 'utf8'));
const out = {made: new Date().toISOString(), sources: {}};

function side(id) {
  const base = id === 'kr' ? 'public/data/atlas11/view' : 'public/data/atlas11/us/view';
  const board = rd(`${base}/board.json`), manifest = rd(`${base}/manifest.json`);
  setPlace(id === 'kr' ? {id: 'kr', label: '한국'} : {id: 'us', label: '미국'});
  // 시가총액: 한국 = 고를 때 제안서(marketCapEok · 억 원) · 미국 = 입력 자료 quality.capUsd(천 달러)
  const cap = new Map();
  if (id === 'kr') {
    const prop = rd('reports/atlas11/universe/2026-10-05-0930/proposal.json');
    for (const x of prop.picked) cap.set(x.code, {cap: x.marketCapEok, market: x.market, roe: x.metrics?.roe ?? null, debt: x.metrics?.debt ?? null, opm: x.metrics?.opm ?? null, net: x.metrics?.net ?? null, revenue: x.metrics?.revenue ?? null});
    out.sources.krCap = 'reports/atlas11/universe/2026-10-05-0930/proposal.json · picked[].marketCapEok(억 원) · 고를 때(2026-10-05 09:20 KST 무렵) 받은 값';
  } else {
    const inp = rd('public/data/atlas11/us/input.json');
    for (const a of inp.assets) { const q = a.quality ?? {}; cap.set(a.code, {cap: Number.isFinite(q.capUsd) ? q.capUsd / 1e6 : null, market: a.exchange ?? null, roe: q.metrics?.roe ?? null, debt: q.metrics?.debt ?? null, opm: null, net: q.metrics?.net ?? null, revenue: q.metrics?.revenue ?? null}); }
    out.sources.usCap = 'public/data/atlas11/us/input.json · assets[].quality.capUsd(천 달러 → 여기서는 십억 달러로 나눔)';
  }
  const fams = [...FAMILIES, OTHER].map(f => ({id: f.id, label: familyOf === null ? f.label : f.label}));
  // 미국 판은 갈래 이름 셋이 다름(family.js US_LABEL) — familyOf 가 돌려주는 이름을 씀
  const famLabel = new Map();
  const groups = board.groups.map(g => { const f = familyOf(g.label); famLabel.set(f.id, f.label); return {id: g.id, label: g.label, fam: f.id, count: g.count, change20: g.change20, up: g.up, measured: g.measured, rank: g.rank, hot: !!g.hot, codes: g.codes, from: g.from, to: g.to}; });
  const famOf = new Map(groups.map(g => [g.id, g.fam]));
  let dates = null;
  const companies = board.companies.map(c => {
    const s = rd(`${base}/stocks/${c.code}.json`);
    const c60 = (s.closes60 ?? []).map(x => x.close);
    if (!dates && s.closes60?.length === 60 && s.closes60.at(-1).date === board.asOf) dates = s.closes60.map(x => x.date);
    const k = cap.get(c.code) ?? {};
    const fl = c.brief?.flows;
    return {code: c.code, name: c.name, nameEn: c.nameEn ?? null, group: c.group.id, groupLabel: c.group.label, fam: famOf.get(c.group.id),
      theme: c.theme?.id ?? null, themeLabel: c.theme?.label ?? null, kind: c.kind, market: k.market ?? null,
      close: c.close, change1: c.change1, change20: c.change20, c: c.c, c60, c60last: s.closes60?.at(-1)?.date ?? null,
      pos52: c.info?.pos52 ?? null, high52: c.info?.high52 ?? null, low52: c.info?.low52 ?? null, ret252: c.info?.ret252 ?? null,
      cap: k.cap ?? null, roe: k.roe ?? null, debt: k.debt ?? null, opm: k.opm ?? null,
      flows: fl ? {foreign: fl.foreign, institution: fl.institution, individual: fl.individual, from: fl.from, to: fl.to, days: fl.days, holdFirst: fl.holdPct?.first ?? null, holdLast: fl.holdPct?.last ?? null} : null};
  });
  const families = [...FAMILIES, OTHER].filter(f => groups.some(g => g.fam === f.id)).map(f => ({id: f.id, label: famLabel.get(f.id) ?? f.label}));
  const pl = manifest.place ?? {};
  const themes = [...new Map(companies.filter(c => c.theme).map(c => [c.theme, c.themeLabel])).entries()].map(([id, label]) => ({id, label}));
  return {place: {id, label: id === 'kr' ? '한국' : '미국', unit: id === 'kr' ? '원' : '달러', close: id === 'kr' ? '15:30' : (pl.close ?? '16:00(뉴욕)'),
      capUnit: id === 'kr' ? '억 원' : '십억 달러', asOf: board.asOf, from: board.companies[0].cFrom, boardId: board.boardId, order: board.order},
    dates20: dates ? dates.slice(-21) : null, dates60: dates, families, themes, groups, companies,
    hot: board.hot?.items?.map(x => x.id) ?? []};
}

out.kr = side('kr');
out.us = side('us');
out.sources.kr = 'public/data/atlas11/view/board.json · stocks/<code>.json(closes60)';
out.sources.us = 'public/data/atlas11/us/view/board.json · stocks/<code>.json(closes60)';
for (const k of ['kr', 'us']) {
  const s = out[k];
  const miss = s.companies.filter(c => !Number.isFinite(c.cap)).map(c => c.code);
  console.log(k, 'companies', s.companies.length, 'groups', s.groups.length, 'families', s.families.map(f => f.label).join('/'), 'capMissing', miss.length, miss.slice(0, 5), 'dates20', s.dates20?.[0], s.dates20?.at(-1), 'flows', s.companies.filter(c => c.flows).length);
}
fs.writeFileSync(new URL('./maps/data.js', import.meta.url), '/* ATLAS 지도 샘플 자료 — prep.mjs 가 판 파일에서 뽑음(손으로 넣은 숫자 없음) */\nwindow.ATLAS = ' + JSON.stringify(out) + ';\n');
console.log('bytes', fs.statSync(new URL('./maps/data.js', import.meta.url)).size);
