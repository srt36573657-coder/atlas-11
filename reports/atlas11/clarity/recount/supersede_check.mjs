import fs from 'node:fs';
import path from 'node:path';
const D = '/home/claude/atlas/ATLAS/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) { let i = 0; for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push({ ...JSON.parse(line), _file: fn, _line: ++i }); }
const byId = new Map(recs.map(r => [r.id, r]));
const supList = r => r.supersedes == null ? [] : (Array.isArray(r.supersedes) ? r.supersedes : [r.supersedes]);
const superseded = new Map(); // targetId -> [superseding ids]
let missingTargets = [], arrayForm = 0;
for (const r of recs) {
  if (Array.isArray(r.supersedes)) arrayForm++;
  for (const t of supList(r)) {
    if (!byId.has(t)) missingTargets.push(r.id + '->' + t);
    if (!superseded.has(t)) superseded.set(t, []);
    superseded.get(t).push(r.id);
  }
}
console.log('records', recs.length, 'with supersedes', recs.filter(r => supList(r).length).length, 'array-form', arrayForm);
console.log('supersedes targets missing from score ledger:', missingTargets.length, missingTargets.slice(0, 5));
console.log('targets superseded by >1 record (forks):', [...superseded.entries()].filter(([k, v]) => v.length > 1).length);
// chain depth
const depth = r => { let d = 0, cur = r; const seen = new Set(); while (supList(cur).length) { const t = supList(cur)[0]; if (seen.has(t) || !byId.has(t)) break; seen.add(t); cur = byId.get(t); d++; } return d; };
const depthHist = {}; for (const r of recs) { const d = depth(r); depthHist[d] = (depthHist[d] || 0) + 1; }
console.log('chain depth histogram (0=original):', depthHist);
// identity preserved across corrections?
const F = ['kind', 'forecastId', 'issuedAt', 'originDate', 'code', 'targetDate', 'horizon', 'modelVersion', 'shadowOf'];
let diffs = {};
const changedFields = {};
for (const r of recs) for (const t of supList(r)) {
  const o = byId.get(t); if (!o) continue;
  for (const f of F) if (JSON.stringify(o.body[f]) !== JSON.stringify(r.body[f])) diffs[f] = (diffs[f] || 0) + 1;
  for (const f of Object.keys(r.body)) if (JSON.stringify(o.body[f]) !== JSON.stringify(r.body[f])) changedFields[f] = (changedFields[f] || 0) + 1;
}
console.log('identity-field differences between superseding and superseded:', diffs);
console.log('fields that change in corrections (count):', changedFields);
// correctionReason distribution, files of superseding vs superseded
const reasons = {}; for (const r of recs) if (supList(r).length) { const k = r.correctionReason + ' | ' + r._file + ' <- ' + byId.get(supList(r)[0])?._file; reasons[k] = (reasons[k] || 0) + 1; }
console.log('correctionReason | file(new) <- file(old):', reasons);
// kind/horizon of superseded records
const supKinds = {}; for (const t of superseded.keys()) { const o = byId.get(t); if (!o) continue; const k = o.body.kind + ' h' + o.body.horizon + ' ' + o.body.targetDate; supKinds[k] = (supKinds[k] || 0) + 1; }
console.log('superseded records by kind/horizon/targetDate:', supKinds);
// shadow / evaluable
const flags = {}; for (const r of recs) { const k = r.body.kind + ' shadowOf=' + (r.body.shadowOf ? 'set' : 'null') + ' evaluable=' + r.body.evaluable + ' mv=' + r.body.modelVersion; flags[k] = (flags[k] || 0) + 1; }
console.log('kind/shadow/evaluable/modelVersion:', flags);
// ordering: does 'at' of superseding exceed 'at' of superseded?
let atOrderBad = 0; for (const r of recs) for (const t of supList(r)) { const o = byId.get(t); if (o && !(r.at >= o.at)) atOrderBad++; }
console.log('corrections whose at < superseded at:', atOrderBad);
