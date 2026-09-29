import fs from'node:fs/promises';
const r=JSON.parse(await fs.readFile('reports/prediction-candidate/result.json')),f=JSON.parse(await fs.readFile('reports/prediction-candidate/forecast-research.json'));
const path='public/downloads/ATLAS_PREDICTION_PROGRESS.md';
const table=`\n## 실제 실행 결과\n\n|항목|A|B|\n|---|---:|---:|\n|평균 절대 가격 오차율|${r.A.meanErrorPct.toFixed(6)}%|${r.B.meanErrorPct.toFixed(6)}%|\n|상위5 순위 적중 합계 /600|${r.A.rankHits}|${r.B.rankHits}|\n\n수치 채택 조건: ${r.numericalGate?'통과':'미통과'}. 운영 채택: 아니오. 자료 검증 제한을 유지합니다.\n\n비교행 ${r.rows.toLocaleString()}개, 52종목의 별도 후보 전망20거래일 계산. 발행시각 ${f.issuedAt}. 모형 경로20,000개이며 적중확률 인증이 아닙니다.\n`;
await fs.appendFile(path,table);
const csv=['종목코드,종목명,기준종가,날짜,후보중앙값,하단P10,상단P90,하루방향,모형비율,상승모형비율,보합모형비율,하락모형비율,운영채택'];for(const a of f.assets)for(const row of a.rows)csv.push([a.code,a.name,a.anchor,row.date,row.p50,row.p10,row.p90,row.wave.daily.selected,row.wave.daily.modelProbability,row.wave.daily.probabilities.up,row.wave.daily.probabilities.flat,row.wave.daily.probabilities.down,false].join(','));
await fs.writeFile('public/downloads/ATLAS_Candidate_52.csv','\ufeff'+csv.join('\n'));
console.log(table);

const names={up:'상승',flat:'보합',down:'하락'};
const lines=f.assets.map(a=>{const r=a.rows.at(-1),q=r.wave.horizon;return `|${a.code}|${a.name}|${a.anchor.toLocaleString()}|${Math.round(r.p50).toLocaleString()}|${((r.p50/a.anchor-1)*100).toFixed(2)}%|${names[q.selected]}|${(q.modelProbability*100).toFixed(1)}%|`;});
await fs.appendFile(path,'\n## 52종목 후보 전망 · 운영 미채택\n\n마지막 거래일 기준 누적 방향이며 모형 비율은 적중률이 아닙니다. 뉴스·전체FOMO는 수치 미반영입니다.\n\n|코드|종목|실제 기준종가|20거래일 중앙값|중앙값 변화|누적 방향 선택|모형 비율|\n|---|---|---:|---:|---:|---|---:|\n'+lines.join('\n')+'\n');
