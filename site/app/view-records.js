/* ATLAS 11 · 기록 검색(8종류 장부 · 날짜/종목/업종/요인/정답오답/원인/모델/채택 상태) · 일일 보고(여섯 문장) · 자동 진화 등록부 */
import {h, num, pct, pctPoint, korDate, shortDate, stamp, dirWord, dirMark, finite, download, csvCell} from './util.js';
import {loadLedger, loadData, loadCards, setSummary, url} from './store.js';

const f2 = v => finite(v) ? v.toFixed(2) : '—';
const f3 = v => finite(v) ? v.toFixed(3) : '—';
const f4 = v => finite(v) ? v.toFixed(4) : '—';
const section = (title, ...children) => h('section', {class: 'card panel'}, h('h2', null, title), ...children);
const table = (head, rows, cls = '') => h('div', {class: 'table-wrap'}, h('table', {class: 'table records ' + cls}, h('thead', null, h('tr', null, ...head.map(x => h('th', null, x)))), h('tbody', null, ...rows.map(r => h('tr', null, ...r.map(c => h('td', null, c)))))));
const pill = (text, kind = 'muted') => h('span', {class: 'pill ' + kind}, text);
const CLASS_KIND = {1: 'ok', 2: 'warn', 3: 'warn', 4: 'bad', 5: 'muted'};
const TYPE_LABEL = {collection: '수집', forecast: '예측', score: '채점', analysis: '원인 분석', factor: '요인', experiment: '실험', model: '모델', operation: '운영'};

/** 여섯 문장 일일 보고 블록 (성적·기록 화면에서 공용) */
export function sentencesBlock(report) {
  if (!report) return h('p', {class: 'muted'}, '일일 보고가 아직 없습니다(첫 실행 뒤 생성).');
  const labels = {marketChange: '오늘 시장에서 확인된 변화', didWell: '우리가 잘한 판단', didWrong: '우리가 잘못한 판단', unexplained: '아직 설명하지 못한 부분', experiments: '오늘 시험하거나 채택·기각한 변경', nextCheck: '다음 거래일에 확인할 사항'};
  return h('div', null, h('ol', {class: 'sentences'}, ...Object.entries(labels).map(([k, label]) => h('li', {'data-speak': `${label}. ${report.sentences[k]}`}, h('b', null, label), h('span', null, report.sentences[k])))), h('p', {class: 'muted xs'}, `${korDate(report.date)} 보고 · 생성 ${stamp(report.generatedAt)} · 상태 ${report.operation?.status ?? '—'} · 운영 모델 ${report.evolution?.operatingModel ?? '—'}`));
}

/* ---------- 기록 검색 ---------- */
export async function renderRecords(main, {manifest, hash = ''}) {
  const [ledger, cards] = await Promise.all([loadLedger(), loadCards()]);
  const index = ledger.index, dailyIndex = ledger.index?.dailyReports ?? null;
  const q = Object.fromEntries(new URLSearchParams(hash.split('?')[1] ?? ''));
  const lastDate = index?.dates?.at(-1) ?? '', firstWithRecords = lastDate && index?.byDate?.[lastDate] ? (['score', 'analysis', 'experiment', 'model', 'forecast', 'collection', 'factor', 'operation'].find(t => index.byDate[lastDate][t] > 0) ?? 'score') : 'score';
  const filt = {type: q.type ?? firstWithRecords, date: q.date ?? lastDate, code: q.code ?? '', group: q.group ?? '', factor: q.factor ?? '', cls: q.cls ?? '', cause: q.cause ?? '', model: q.model ?? '', status: q.status ?? ''};
  setSummary(index ? `기록 검색. ${index.dates.length}일치 기록, 종류별 합계: ${Object.entries(index.totals).map(([k, v]) => `${TYPE_LABEL[k]} ${v}건`).join(', ')}.` : '기록 장부가 아직 없습니다. 첫 실행 뒤 생깁니다.');
  const head = h('section', {class: 'lead'}, h('h1', {class: 'h1', 'data-speak': '기록'}, '기록'), h('p', {class: 'muted'}, '수집·예측·채점·원인 분석·요인·실험·모델·운영 8종류를 날짜별로 남깁니다. 덮어쓰지 않고 덧붙이며, 정정은 이전 기록 ID에 연결됩니다.'));
  if (!index || !index.dates.length) { main.replaceChildren(head, section('기록 없음', h('p', null, '아직 기록 장부가 비어 있습니다. 매일 실행기(run_daily)가 처음 돌면 그날부터 쌓입니다.'), h('p', {class: 'muted small'}, `발행본 ${ledger.forecastId}`))); return; }
  // 일일 보고 (최근)
  const latestReport = ledger.dailyReport ?? null;
  const reportBox = h('div'), reportSel = h('select', {class: 'select', 'aria-label': '보고 날짜', onchange: async ev => { const r = await loadData('daily/' + ev.target.value + '.json'); reportBox.replaceChildren(sentencesBlock(r)); }}, ...(dailyIndex?.dates ?? []).slice().reverse().map(d => h('option', {value: d, selected: d === latestReport?.date}, korDate(d))));
  reportBox.replaceChildren(sentencesBlock(latestReport));
  // 검색 도구
  const sel = (name, label, options, value) => h('label', {class: 'field'}, h('span', {class: 'lbl'}, label), h('select', {class: 'select small', 'aria-label': label, dataset: {filter: name}, onchange: ev => { filt[name] = ev.target.value; go(); }}, h('option', {value: ''}, '전체'), ...options.map(([v, l]) => h('option', {value: v, selected: v === value}, l))));
  const facetOpts = f => Object.keys(index.facets?.[f] ?? {}).sort().map(k => [k, k]);
  const groups = [...new Set(cards.cards.map(c => c.info?.groupName).filter(Boolean))];
  const groupIds = Object.fromEntries(cards.cards.filter(c => c.info?.group).map(c => [c.info.groupName, c.info.group]));
  const typeRow = h('div', {class: 'filters types', role: 'group', 'aria-label': '기록 종류'}, ...Object.keys(TYPE_LABEL).map(t => h('button', {class: 'filter' + (filt.type === t ? ' on' : ''), type: 'button', dataset: {type: t}, 'aria-pressed': String(filt.type === t), onclick: () => { filt.type = t; go(); }}, `${TYPE_LABEL[t]} ${index.totals[t] ?? 0}`)));
  const dateSel = h('label', {class: 'field'}, h('span', {class: 'lbl'}, '날짜'), h('select', {class: 'select small', 'aria-label': '날짜', onchange: ev => { filt.date = ev.target.value; go(); }}, h('option', {value: ''}, '전체(최근 30일)'), ...index.dates.slice().reverse().map(d => h('option', {value: d, selected: d === filt.date}, `${korDate(d)} (${Object.values(index.byDate[d]).reduce((s, x) => s + x, 0)})`))));
  const filters = h('div', {class: 'filters'}, dateSel,
    sel('code', '종목', cards.cards.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(c => [c.code, `${c.name} ${c.code}`]), filt.code),
    sel('group', '업종(묶음)', groups.map(g => [groupIds[g], g]), filt.group),
    sel('factor', '요인', Array.from({length: 36}, (_, i) => 'F' + String(i + 1).padStart(2, '0')).map(f => [f, f]), filt.factor),
    sel('cls', '정답·오답', ['방향·크기 모두 맞음', '방향 맞고 크기 틀림', '크기 허용·방향 틀림', '방향·크기 모두 틀림', '평가 보류'].map(c => [c, c]), filt.cls),
    sel('cause', '원인 종류', ['자료 오류', '자료 지연', '시장 상태', '업종 변화', '기업 사건', '수급', '심리·과열', '요인 중복', '가중치', '영향 시차', '변동성·범위', '방정식 구조', '미설명'].map(c => [c, c]), filt.cause),
    sel('model', '모델 버전', facetOpts('modelVersions'), filt.model),
    sel('status', '채택 상태', facetOpts('statuses'), filt.status));
  const resultBox = h('div', {class: 'records-result', 'aria-live': 'polite'}), countLabel = h('span', {class: 'muted small'});
  const dlRow = h('div', {class: 'toggles'});
  async function go() {
    for (const b of typeRow.children) { b.classList.toggle('on', b.dataset.type === filt.type); b.setAttribute('aria-pressed', String(b.dataset.type === filt.type)); }
    const params = new URLSearchParams(Object.entries(filt).filter(([, v]) => v)); history.replaceState(null, '', '#/records?' + params.toString());
    const dates = filt.date ? [filt.date] : index.dates.slice(-30);
    resultBox.replaceChildren(h('p', {class: 'muted'}, '읽는 중…'));
    let rows = [];
    for (const d of dates) { const f = `${filt.type}/${d}.json`; if (!index.files[f]) continue; try { rows.push(...await loadData('ledger/' + f, {sha256: index.files[f].sha256})); } catch (e) { resultBox.replaceChildren(h('p', {class: 'warn'}, String(e.message))); return; } }
    const superseded = new Set(rows.map(r => r.supersedes).filter(Boolean));
    rows = rows.filter(r => {
      const b = r.body ?? {};
      if (filt.code && b.code !== filt.code) return false;
      if (filt.group && (b.group ?? '') !== filt.group && (b.groupName ?? '') !== filt.group) return false;
      if (filt.factor && b.factorId !== filt.factor && !(Array.isArray(b.causes) && false)) return false;
      if (filt.cls && b.classLabel !== filt.cls) return false;
      if (filt.cause && !(b.causes ?? []).some(c => (typeof c === 'string' ? c : c.category) === filt.cause)) return false;
      if (filt.model && b.modelVersion !== filt.model && b.operatingModel !== filt.model) return false;
      if (filt.status && b.status !== filt.status) return false;
      return true;
    });
    countLabel.textContent = `${rows.length}건 (정정으로 대체된 기록 ${rows.filter(r => superseded.has(r.id)).length}건 포함)`;
    resultBox.replaceChildren(renderTable(filt.type, rows, superseded));
    dlRow.replaceChildren(...[
      filt.date && index.files[`${filt.type}/${filt.date}.json`] ? h('a', {class: 'ctl btn-download', href: url(`/downloads/atlas11/ledger/${filt.type}-${filt.date}.csv`), download: `ATLAS_${filt.type}_${filt.date}.csv`}, 'CSV 내려받기(그날 전체)') : null,
      h('button', {class: 'ctl btn-download', type: 'button', onclick: () => download(`ATLAS_${filt.type}_${filt.date || 'recent'}_filtered.json`, JSON.stringify(rows, null, 1), 'application/json;charset=utf-8')}, '걸러진 JSON 내려받기'),
      h('button', {class: 'ctl btn-download', type: 'button', onclick: () => download(`ATLAS_${filt.type}_${filt.date || 'recent'}_filtered.csv`, rowsCSV(rows))}, '걸러진 CSV 내려받기')].filter(Boolean));
  }
  main.replaceChildren(head,
    section('일일 보고 · 여섯 문장', h('div', {class: 'controls-row'}, h('label', {class: 'field'}, h('span', {class: 'lbl'}, '날짜'), reportSel)), reportBox),
    section('기록 검색', typeRow, filters, h('div', {class: 'controls-row'}, countLabel), resultBox, dlRow, h('p', {class: 'muted xs'}, `장부 원본: reports/atlas11/ledger/<종류>/<날짜>.jsonl · 화면은 복사본을 색인의 SHA-256 으로 대조 · 발행본 ${ledger.forecastId}`)));
  await go();
}

function rowsCSV(rows) {
  const keys = []; for (const r of rows) for (const k of Object.keys(r.body ?? {})) if (!keys.includes(k)) keys.push(k);
  const cell = v => csvCell(v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : v);
  return ['id,type,dateKST,at,supersedes,' + keys.join(','), ...rows.map(r => [r.id, r.type, r.dateKST, r.at, r.supersedes ?? '', ...keys.map(k => cell(r.body?.[k]))].join(','))].join('\r\n');
}

function renderTable(type, rows, superseded) {
  if (!rows.length) return h('p', {class: 'muted'}, '조건에 맞는 기록이 없습니다.');
  const mark = r => superseded.has(r.id) ? pill('정정됨', 'muted') : r.supersedes ? pill('정정본', 'warn') : '';
  const link = code => h('a', {href: '#/stock/' + code}, code);
  switch (type) {
    case 'score': return table(['종목', '기준일→목표일', '기간', '예측', '실제', '오차', '방향(예측/실제)', '띠', '분류', '모델', ''], rows.sort((a, b) => a.body.targetDate.localeCompare(b.body.targetDate) || a.body.horizon - b.body.horizon).map(r => { const b = r.body; return [h('span', null, b.name, ' ', link(b.code)), `${shortDate(b.originDate)}→${shortDate(b.targetDate)}`, b.horizon + '일', num(b.predicted?.p50) + '원', num(b.actual) + '원', f2(b.ape) + '%', `${dirMark(b.predictedDirection)}${dirWord(b.predictedDirection)} / ${dirMark(b.actualDirection)}${dirWord(b.actualDirection)}`, b.covered == null ? '—' : b.covered ? '담김' : '벗어남', pill(b.classLabel, CLASS_KIND[b.class] ?? 'muted'), h('code', {class: 'xs'}, b.modelVersion), mark(r)]; }), 'small');
    case 'analysis': return h('div', null, ...rows.map(r => { const b = r.body; if (b.kind === 'daily_aggregate') return h('details', {class: 'more', open: true}, h('summary', null, `${korDate(b.date)} 총괄 · 채점 ${b.evaluated}건 · 52종목 평균 ${b.market ? pct(b.market.basketReturn) : '—'}`), b.market ? h('p', {class: 'small'}, `상승 ${b.market.up} · 하락 ${b.market.down} · 보합 ${b.market.flat} · 크게 움직인 종목 ${b.topMovers.map(m => `${m.name} ${pct(m.change)}`).join(', ')}`) : null, table(['분류', '건수'], Object.entries(b.byClass ?? {}).map(([k, v]) => [k, v])), table(['원인 가설', '건수'], Object.entries(b.causeCounts ?? {}).map(([k, v]) => [k, v])), (b.byGroup ?? []).length ? table(['묶음', '건수', '방향 정답률', '평균 오차', '부호 있는 오차 평균'], b.byGroup.map(g => [g.groupName, g.n, pctPoint(g.directionAccuracy, 0), f2(g.meanAPE) + '%', f2(g.meanSignedErrorPct) + '%'])) : null, h('p', {class: 'muted xs'}, `미설명 몫 평균 ${b.unexplainedMeanShare != null ? pctPoint(b.unexplainedMeanShare, 0) : '—'} · 우연 의심 ${b.luckySuspects} · 틀렸지만 띠 안 ${b.reasonableMisses}`)); return h('details', {class: 'more analysis-cell'}, h('summary', null, h('b', null, b.name), ` ${b.horizon}일 · ${shortDate(b.originDate)}→${shortDate(b.targetDate)} · `, pill(b.classLabel, CLASS_KIND[b.class] ?? 'muted'), ' ', ...(b.causes ?? []).map(c => pill(c, 'warn')), mark(r)), h('h4', null, '확인된 사실'), h('ul', {class: 'plain small'}, ...b.facts.map(f => h('li', null, f))), h('h4', null, '모형 내부 기여'), h('ul', {class: 'plain small'}, ...b.modelContribution.map(f => h('li', null, f))), h('h4', null, '원인 가설'), b.hypotheses.length ? h('ul', {class: 'plain small'}, ...b.hypotheses.map(x => h('li', null, h('b', null, x.category), ` (${x.strength}) — ${x.evidence}`, h('div', {class: 'muted xs'}, '반대 근거: ' + x.counterEvidence)))) : h('p', {class: 'small muted'}, '없음(정답)'), h('h4', null, '미확인'), h('ul', {class: 'plain small muted'}, ...b.unverified.map(f => h('li', null, f))), b.flags?.luckyNote ? h('p', {class: 'small warn'}, b.flags.luckyNote) : null, b.flags?.reasonableNote ? h('p', {class: 'small'}, b.flags.reasonableNote) : null, h('p', {class: 'muted xs'}, `발행본 ${b.forecastId} · 모델 ${b.modelVersion}`)); }));
    case 'experiment': return table(['후보', '가족', '바꾼 것', '운영 오차', '후보 오차', '운영 적중', '후보 적중', '관문', 'P(후보 우세)', '결정', ''], rows.map(r => { const b = r.body; return [h('code', {class: 'xs'}, b.candidateId), b.family, b.label ?? b.error ?? '', b.four ? f4(b.four.operatingErrorPct) + '%' : '—', b.four ? f4(b.four.candidateErrorPct) + '%' : '—', b.four?.operatingRankHits ?? '—', b.four?.candidateRankHits ?? '—', b.gates ? Object.entries(b.gates).map(([k, v]) => `${k} ${v ? '✓' : '✕'}`).join(' ') : '—', b.uncertainty ? `${(b.uncertainty.probabilityCandidateBetter * 100).toFixed(0)}% · 블록 ${b.uncertainty.blocksBetter}/6` : '—', pill(b.status ?? b.decision ?? '—', b.status === '실전 관찰' ? 'ok' : b.status === '기각' ? 'bad' : 'muted'), mark(r)]; }), 'small');
    case 'model': return table(['종류', '후보/버전', '에서 → 로', '이유', '적용', '상태'], rows.map(r => { const b = r.body; return [b.kind, h('code', {class: 'xs'}, b.modelVersion ?? b.candidateId ?? ''), `${b.from ?? '—'} → ${b.to ?? b.modelVersion ?? '—'}`, b.reason ?? (b.evidence ? JSON.stringify(b.evidence).slice(0, 120) : ''), b.appliesFrom ?? '', pill(b.status ?? '', b.status === '채택' ? 'ok' : b.status === '되돌림' || b.status === '기각' ? 'bad' : 'muted')]; }), 'small');
    case 'factor': return table(['요인', '이름', '상태', '연결 종목', '계수≠0', '최근 관측', '평균 |가중치|', 'D+1 평균 기여', '모델'], rows.sort((a, b) => a.body.factorId.localeCompare(b.body.factorId)).map(r => { const b = r.body; return [h('b', null, b.factorId), b.name, pill(b.status, b.status === '미확보' ? 'muted' : 'ok'), `${b.stocksUsing}/52`, `${b.stocksNonZero ?? '—'}/52`, b.latestObservation ?? '—', b.meanAbsWeight != null ? f4(b.meanAbsWeight) : '—', b.meanDailyContributionD1 != null ? (b.meanDailyContributionD1 * 100).toFixed(4) + '%' : '—', h('code', {class: 'xs'}, b.modelVersion)]; }), 'small');
    case 'collection': return h('div', null, ...rows.map(r => { const b = r.body; return h('details', {class: 'more'}, h('summary', null, `${korDate(b.day)} · ${b.attempted ? `시도 · ${b.provider ?? '—'} · 관측 ${b.observations.length} · 오류 ${b.errors.length}` : '시도 안 함'} `, pill(b.status, b.status === 'ok' ? 'ok' : b.status === 'partial' ? 'warn' : 'muted'), b.delayed ? pill('수집 지연', 'warn') : ''), b.observations.length ? table(['종목', '출처', '관측 시각', '확정', '행 수', '마지막 날짜'], b.observations.map(o => [link(o.code), h('a', {href: o.sourceUrl, target: '_blank', rel: 'noopener'}, new URL(o.sourceUrl).hostname), stamp(o.observedAt), o.finalClose ? '예' : '아니오', o.rows, o.lastDate]), 'small') : null, b.errors.length ? h('ul', {class: 'plain small warn'}, ...b.errors.map(e => h('li', null, `${e.code ?? ''} ${e.stockCode ?? ''} ${e.message ?? ''}`))) : null); }));
    case 'forecast': return table(['종류', '발행본', '모델', '기준일', '재사용', '출발점 차이 0', '상태'], rows.map(r => { const b = r.body; return [b.kind === 'shadow' ? `그림자(${b.candidateId})` : '운영', h('code', {class: 'xs'}, b.forecastId), b.modelVersion, b.actualAsOf, b.reused ? '예' : '아니오', b.anchorMatches != null ? b.anchorMatches + '/52' : '—', pill(b.status, 'ok')]; }), 'small');
    case 'operation': return table(['시각', '상태', '코드', '단계', '수집', '채점', '진화', '발행본', '경고'], rows.map(r => { const b = r.body; return [stamp(b.at), pill(b.status ?? '', b.status === 'complete' ? 'ok' : b.status === 'partial' ? 'warn' : 'bad'), b.exitCode ?? '—', (b.steps ?? []).map(s => `${s.step.replace(/^\d_/, '')}${s.status === 'ok' ? '✓' : '✕'}`).join(' '), b.collection ? `${b.collection.attempted ? '시도' : '안 함'} ${b.collection.observations ?? 0}/${b.collection.errors ?? 0}` : '—', b.scoring ? `${b.scoring.evaluated}건(+${b.scoring.newRecords})` : '—', b.evolution ? `검증 ${b.evolution.backtested} 채택 ${b.evolution.adopted} 기각 ${b.evolution.rejected} 관찰 ${b.evolution.observing} 복귀 ${b.evolution.rolledBack}` : '—', h('code', {class: 'xs'}, (b.forecastId ?? '').slice(0, 26)), (b.warnings ?? []).join(' · ') || (b.error ?? '')]; }), 'small');
    default: return table(['id', '내용'], rows.map(r => [h('code', {class: 'xs'}, r.id), JSON.stringify(r.body).slice(0, 200)]));
  }
}

/* ---------- 자동 진화 등록부(진화 화면에 붙임) ---------- */
export function evolutionAutoSections(auto) {
  if (!auto) return [section('자동 진화', h('p', {class: 'muted'}, '진화 설정이 없습니다.'))];
  const c = auto.config, sp = auto.scoringPolicy;
  const statusKind = k => ({adopted: 'ok', observing: 'ok', rejected: 'bad', rolledBack: 'bad', pending: 'warn', backtested: 'warn'}[k] ?? 'muted');
  const A = auto.operatingBacktest;
  const candRows = auto.candidates.map(x => [h('span', null, h('code', {class: 'xs'}, x.candidateId), h('div', {class: 'xs muted'}, x.family)), x.label, pill(x.status, statusKind(x.statusKey)),
    x.four ? h('span', null, `${f4(x.four.operatingErrorPct)}% → `, h('b', {class: x.four.candidateErrorPct < x.four.operatingErrorPct ? 'up' : 'down'}, f4(x.four.candidateErrorPct) + '%')) : '—',
    x.four ? h('span', null, `${x.four.operatingRankHits} → `, h('b', {class: x.four.candidateRankHits >= x.four.operatingRankHits ? 'up' : 'down'}, x.four.candidateRankHits), h('span', {class: 'muted xs'}, `/${x.four.rankMaximum}`)) : '—',
    x.summary && A ? `${pctPoint(A.summary.dir20, 1)} → ${pctPoint(x.summary.dir20, 1)}` : '—', x.summary && A ? `${pctPoint(A.summary.cov20, 0)} → ${pctPoint(x.summary.cov20, 0)}` : '—',
    x.gates ? h('span', {class: 'xs'}, ...Object.entries(x.gates.gates).map(([k, g]) => h('span', {class: 'pill ' + (g.passed ? 'ok' : 'bad')}, `${k} ${g.passed ? '✓' : '✕'}`))) : '—',
    x.gates?.uncertainty ? `${(x.gates.uncertainty.probabilityCandidateBetter * 100).toFixed(0)}% · ${x.gates.uncertainty.blocksBetter}/${x.gates.uncertainty.blocks}` : '—',
    x.gates ? h('span', {class: 'xs'}, x.gates.reasons.join(' · ')) : (x.pendingReason ?? x.rejectReason ?? '검증 전')]);
  const ftable = auto.factorTable?.length ? table(['요인', '이름', '상태', '연결', '계수≠0', '최근 관측', '|가중치| 평균', 'D+1 기여 평균', '변경 이력'], auto.factorTable.map(f => [h('b', null, f.factorId), f.name, pill(f.status, f.status === '미확보' ? 'muted' : 'ok'), `${f.stocksUsing}/52`, `${f.stocksNonZero ?? '—'}/52`, f.latestObservation ?? '—', f.meanAbsWeight != null ? f4(f.meanAbsWeight) : '—', f.meanDailyContributionD1 != null ? (f.meanDailyContributionD1 * 100).toFixed(4) + '%' : '—', (f.changeHistory ?? []).join(', ') || '없음']), 'small') : h('p', {class: 'muted'}, '요인 기록은 첫 실행 뒤 생깁니다.');
  return [
    section('자동 진화 · 지금 상태', h('div', {class: 'kv'}, kv('운영 모델', auto.operating.modelVersion), kv('운영 명세', auto.operating.spec?.label ?? auto.operating.specId), kv('적용 시작', auto.operating.since ? stamp(auto.operating.since) : '초기'), kv('직전 검증 버전', auto.previousValidated?.modelVersion ?? '없음'), kv('채택 횟수', String(auto.adoptions.length)), kv('복귀 횟수', String(auto.rollbacks.length)), kv('등록 사건', String(auto.events)), kv('마지막 결정', auto.lastNoChange ? `변경 없음(${auto.lastNoChange.reason ?? ''})` : '—')),
      h('p', {class: 'small'}, '상태 흐름: ', ...c.states.map(s => pill(s, 'muted'))), h('p', {class: 'muted xs'}, `채택 조건: ${c.adoption.coreRule} · 그리고 관문(${Object.keys(c.adoption.gates).join('·')}) · 불확실성 ${c.adoption.uncertainty}`), h('p', {class: 'muted xs'}, `실전 관찰: ${c.liveObservation.rule} (최소 ${c.liveObservation.minScoredDates} 채점일) · 복귀: ${c.rollback.triggers[0].rule}`), h('p', {class: 'muted xs'}, `한도: 실행당 새 검증 ${c.limits.maxCandidatesPerRun}개 · 관찰 동시 ${c.limits.maxLiveObservationCandidates}개 · 20거래일당 채택 ${c.limits.maxAdoptionsPer20TradingDays}회 · 냉각 ${c.limits.cooldownTradingDaysAfterAdoption}거래일 · 검증 예산 ${c.limits.backtestTimeBudgetMinutes}분 · 설정 ${c.version} (모델이 스스로 바꾸지 못함)`)),
    section('후보와 네 숫자 · 관문 · 결정', A ? h('p', {class: 'small'}, `운영 A 시간순 검증: 평균 가격 오차율 ${f4(A.summary.meanErrorPct)}% · D+20 상위5 순위 적중 ${A.summary.rankHits}/${A.origins * 5} · 방향 ${pctPoint(A.summary.dir20, 1)} · 담김 ${pctPoint(A.summary.cov20, 0)} · ${A.origins}기준일 · ${c.validation.paths}경로 · 시드 ${c.validation.seed}`) : h('p', {class: 'muted'}, '운영 A 검증 결과 없음'),
      table(['후보', '바꾼 것', '상태', '① 오차율 운영→후보', '③ 순위 적중 운영→후보', 'D+20 방향', '80% 담김', '관문', 'P(우세)·블록', '결정 사유'], candRows, 'small'),
      h('p', {class: 'muted xs'}, '네 숫자 = ①운영 오차율 ②후보 오차율 ③운영 순위 적중 ④후보 순위 적중. 순위 적중은 같은 기준일 예측 상위5와 실제 상위5의 교집합(동률: 수익률 내림차순 뒤 종목코드). 후보는 한 번에 한 변수만 바꾼다. 검증 통과 후보는 운영과 나란히 그림자 발행으로 실전 관찰한다.')),
    auto.adoptions.length || auto.rollbacks.length ? section('채택·복귀 이력', table(['시각', '종류', '버전', '이유·근거', '적용'], [...auto.adoptions.map(a => [stamp(a.at), '채택', a.modelVersion, JSON.stringify(a.evidence?.observation ?? {}).slice(0, 140), a.appliesFrom ?? '']), ...auto.rollbacks.map(r => [stamp(r.at), '되돌림', `${r.from} → ${r.to}`, r.reason, r.appliesFrom ?? ''])], 'small')) : section('채택·복귀 이력', h('p', {class: 'muted'}, '아직 채택·복귀가 없습니다(변경 없음도 정상 결과).')),
    section('36요인 관리표', ftable, h('p', {class: 'muted xs'}, '원자료 확보 상태 · 사용 여부 · 종목별 가중치 요약 · D+1 기여 · 변경 이력. 자료 부족과 효과 없음은 다르다: 미확보 요인은 계수 0 이지 관측값 0 이 아니다.')),
    sp ? section('채점 정책(결과 보기 전에 고정)', table(['항목', '값'], [['버전 · 고정 시각', `${sp.version} · ${stamp(sp.frozenAt)} (첫 채점 ${sp.firstScorableClose})`], ['보합 경계', `±${(sp.flatDelta * 100).toFixed(1)}%`], ['가격 허용 오차', Object.entries(sp.priceHitTolerancePct).map(([k, v]) => `${k}일 ${v}%`).join(' · ')], ['근거', sp.priceHitBasis], ['분류', sp.classes.map(k => `${k.id} ${k.label}`).join(' / ')], ['원인 종류', sp.causeCategories.join(' · ')], ['근거 구분', sp.evidenceLabels.join(' / ')]])) : null,
  ];
}
const kv = (k, v) => h('div', {class: 'kv-item'}, h('span', {class: 'k'}, k), h('b', {class: 'v'}, v));
