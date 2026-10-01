#!/usr/bin/env node
/**
 * W10 · 틀린 42칸마다 「그 방향을 고르게 한 것」 — 기록 장부(정정 안 된 1거래일 칸) + 발행본 + 정확 계산(W9 T14 정확 재현과 같은 방식)
 *   node scripts/atlas11/overhaul/lane-b/w10-against.mjs        → reports/atlas11/overhaul/w10-against.json 을 다시 쓴다
 * 규칙(먼저 맞는 것 하나):
 *   1) 정확 계산 방향 ≠ 발행 방향                                  → 「같은 난수 잡음」
 *   2) 세 항(기본값·F35·F11)을 더한 평균이 ≈0 이거나 고른 방향과 반대 → 「모의 계산 기울기」
 *      ≈0 = |평균| < 0.005%p (화면에 0.00% 로 보이는 값)
 *   3) 그 밖                                                         → 「평균 항」: 고른 방향과 부호가 같은 항들(기본값 포함) · 가장 큰 항
 * 같은 입력이면 같은 바이트를 낸다(시각·커밋을 넣지 않는다). 모형 안의 설명이지 원인 증명이 아니다.
 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {ROOT, liveCells, pickDirection, sha256} from './common.mjs';
import {rebuild, publishedDayOne} from './pubmodel.mjs';
import {dayOneState, shockTable, exactDayOne} from './simulate-variant.mjs';

export const NEAR_ZERO_PP = 0.005; // %p
const OUT = 'reports/atlas11/overhaul/w10-against.json';
const pct = x => x * 100;
const sgn = d => d === 'up' ? 1 : d === 'down' ? -1 : 0;

export function buildAgainst() {
  const cells = liveCells(), wrong = cells.filter(c => !c.dirOk), byPub = {};
  for (const id of [...new Set(wrong.map(c => c.forecastId))].sort()) {
    const R = rebuild(id), st = dayOneState(R.models, R.panel, R.input.assets, R.external), tab = shockTable(R.models, 'mean').table;
    byPub[id] = {R, st, tab, codes: R.input.assets.map(a => a.code)};
  }
  const rows = wrong.map(c => {
    const P = byPub[c.forecastId], i = P.codes.indexOf(c.code), d = publishedDayOne(P.R.pub, i), row = P.R.pub.assets[i].rows.find(r => !r.anchor && r.date === P.R.pub.futureDates[0]);
    const ex = exactDayOne(P.st.mu[i], P.st.h[i], P.tab[i]).probabilities, exactDir = pickDirection(ex);
    const terms = {intercept: pct(row.factor36.intercept), F35: pct(d.contributions.F35), F11: pct(d.contributions.F11)}, meanPp = pct(d.factorMeanLogReturn);
    const s = sgn(c.pred);
    let reason, sameSide = [], largest = null;
    if (exactDir !== c.pred) reason = '같은 난수 잡음';
    else if (Math.abs(meanPp) < NEAR_ZERO_PP || Math.sign(meanPp) !== s) reason = '모의 계산 기울기';
    else {
      reason = '평균 항';
      sameSide = Object.entries(terms).filter(([, v]) => Math.sign(v) === s).map(([k]) => k);
      largest = sameSide.slice().sort((a, b) => Math.abs(terms[b]) - Math.abs(terms[a]))[0] ?? null;
      if (!sameSide.length) reason = '없음';
    }
    return {date: c.date, code: c.code, name: c.name, forecastId: c.forecastId, predDir: c.pred, actDir: c.act, zeroWeight: c.zero,
      published: {up: c.probabilities.up, flat: c.probabilities.flat, down: c.probabilities.down, selected: c.pred},
      exact: {up: ex.up, flat: ex.flat, down: ex.down, selected: exactDir},
      meanPp, terms, reason, sameSideTerms: sameSide, largestTerm: largest, scoreId: c.scoreId, analysisId: c.analysisId};
  });
  const counts = {'같은 난수 잡음': 0, '모의 계산 기울기': 0, '평균 항': 0, '없음': 0};
  for (const r of rows) counts[r.reason]++;
  const tilt = rows.filter(r => r.reason === '모의 계산 기울기'), termRows = rows.filter(r => r.reason === '평균 항');
  const detail = {
    '모의 계산 기울기': {zeroWeight: tilt.filter(r => r.zeroWeight).length, weighted: tilt.filter(r => !r.zeroWeight).length, weightedCells: tilt.filter(r => !r.zeroWeight).map(r => ({date: r.date, code: r.code, name: r.name, meanPp: r.meanPp, predDir: r.predDir}))},
    '같은 난수 잡음': rows.filter(r => r.reason === '같은 난수 잡음').map(r => ({date: r.date, code: r.code, name: r.name, exact: r.exact, published: r.published})),
    '평균 항': {cells: termRows.length, interceptSameSide: termRows.filter(r => r.sameSideTerms.includes('intercept')).length, interceptLargest: termRows.filter(r => r.largestTerm === 'intercept').map(r => ({date: r.date, code: r.code, name: r.name, interceptPp: r.terms.intercept, meanPp: r.meanPp})), largest: termRows.reduce((a, r) => { a[r.largestTerm] = (a[r.largestTerm] ?? 0) + 1; return a; }, {})},
  };
  const ledgerFiles = ['score', 'analysis'].flatMap(k => fs.readdirSync(path.join(ROOT, 'reports/atlas11/ledger', k)).sort().map(f => `reports/atlas11/ledger/${k}/${f}`));
  const out = {schema: 'atlas11-overhaul-w10-against-2', cells: rows.length,
    rule: ['1) 정확 계산 방향 ≠ 발행 방향 → 같은 난수 잡음', `2) 세 항(기본값·F35·F11)을 더한 평균이 ≈0(|평균| < ${NEAR_ZERO_PP}%p · 화면에 0.00%) 이거나 고른 방향과 반대 → 모의 계산 기울기`, '3) 그 밖 → 평균 항(고른 방향과 부호가 같은 항 · 기본값 포함 · 가장 큰 항)', '먼저 맞는 것 하나만'],
    nearZeroPp: NEAR_ZERO_PP, counts, detail, rows,
    sources: {ledger: Object.fromEntries(ledgerFiles.map(f => [f, sha256(fs.readFileSync(path.join(ROOT, f)))])), publications: Object.fromEntries(Object.entries(byPub).map(([id, P]) => [id, P.R.pubSha256])), exact: 'scripts/atlas11/overhaul/lane-b/simulate-variant.mjs exactDayOne(공유 날짜 504개 잔차 표 · W9 T14 정확 재현과 같은 μ·h)'},
    note: '틀린 42칸이 그 방향을 고르게 된 까닭(모형 안의 설명 · 인과 아님) · 장부 = 정정 안 된 1거래일 칸(가장 나중 at) · 세 항 = 발행본 1일째 factor36(기본값 = 절편 · F35 · F11) · 평균 = 세 항의 합(1일째 평균 로그수익률)'};
  return JSON.stringify(out, null, 1) + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const text = buildAgainst();
  fs.writeFileSync(path.join(ROOT, OUT), text);
  const o = JSON.parse(text);
  console.log(JSON.stringify({sha256: sha256(text), counts: o.counts, detail: o.detail}, null, 1));
}
