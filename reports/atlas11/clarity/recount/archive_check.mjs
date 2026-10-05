import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const D = ROOT + '/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push(JSON.parse(line));
const sup = new Set(recs.filter(r => r.supersedes).map(r => r.supersedes));
const cur = recs.filter(r => !sup.has(r.id) && r.body.kind === 'live' && r.body.horizon === 1);
for (const fid of ['2026-09-29-atlas11-128de9174cfdfa1f', '2026-09-28-atlas11-90616c6bc916e8d6', '2026-09-28-atlas11-27e1f65cfc167be9']) {
  const pub = JSON.parse(fs.readFileSync(`${ROOT}/reports/atlas11/versions/${fid}.json`, 'utf8'));
  const td = pub.futureDates[0];
  let up = 0, dirMatch = 0, p50Match = 0, ancMatch = 0, n = 0; const mis = [];
  for (const a of pub.assets) {
    const r1 = a.rows[1]; if (r1.date !== td) mis.push(a.code + ' row1 date ' + r1.date);
    if (r1.direction.daily.selected === 'up') up++;
    const s = cur.find(r => r.body.forecastId === fid && r.body.code === a.code && r.body.targetDate === td);
    if (!s) { mis.push(a.code + ' no score'); continue; }
    n++;
    if (s.body.predictedDirection === r1.direction.daily.selected) dirMatch++; else mis.push(`${a.code} dir pub=${r1.direction.daily.selected} score=${s.body.predictedDirection}`);
    if (Math.abs(s.body.predicted.p50 - r1.p50) < 1e-6) p50Match++; else mis.push(`${a.code} p50 pub=${r1.p50} score=${s.body.predicted.p50}`);
    if (s.body.anchor === a.anchor.close) ancMatch++; else mis.push(`${a.code} anchor pub=${a.anchor.close} score=${s.body.anchor}`);
  }
  console.log(`${fid} issuedAt=${pub.issuedAt} target=${td} assets=${pub.assets.length} pubDailyUp=${up} scoresFound=${n} dirMatch=${dirMatch} p50Match=${p50Match} anchorMatch=${anchorMatchFix(ancMatch)} mismatches=${mis.length}`, mis.slice(0, 6));
}
function anchorMatchFix(x) { return x; }
