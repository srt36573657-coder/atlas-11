import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
for (const base of [ROOT + '/reports/atlas11/ledger', ROOT + '/public/data/atlas11/ledger']) {
  const hasModel = fs.existsSync(base + '/model');
  const modelFiles = hasModel ? fs.readdirSync(base + '/model') : [];
  let modelRecs = 0, kindHits = [], textHits = 0;
  for (const t of fs.readdirSync(base)) {
    const dir = path.join(base, t); if (!fs.statSync(dir).isDirectory()) continue;
    for (const fn of fs.readdirSync(dir)) {
      const raw = fs.readFileSync(path.join(dir, fn), 'utf8');
      const recs = raw.trim().startsWith('[') ? JSON.parse(raw) : raw.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
      for (const r of recs) {
        if (r.type === 'model') modelRecs++;
        if (r.body && (r.body.kind === 'adoption' || r.body.kind === 'rollback')) kindHits.push(t + '/' + fn + ' ' + r.id);
      }
      textHits += (raw.match(/"kind":"(adoption|rollback)"/g) || []).length;
    }
  }
  console.log(base.replace(ROOT + '/', ''), '| model dir exists:', hasModel, 'files:', modelFiles, '| type=model records:', modelRecs, '| body.kind adoption/rollback:', kindHits.length, '| raw text "kind":"adoption|rollback" hits:', textHits);
}
// modelVersion across all forecast issues referenced by live scores
const D = ROOT + '/reports/atlas11/ledger/score';
const mv = {};
for (const fn of fs.readdirSync(D)) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) { const b = JSON.parse(line).body; if (b.kind === 'live') mv[b.forecastId] = b.modelVersion; }
console.log('live-scored forecast issues -> modelVersion:', mv);
