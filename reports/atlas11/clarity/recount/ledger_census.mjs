import fs from 'node:fs';
import path from 'node:path';
const R = '/home/claude/atlas/ATLAS/reports/atlas11/ledger';
const TYPES = ['collection','forecast','score','analysis','factor','experiment','model','operation'];
const perDate = {}, perTypeDate = {};
let total = 0, parseErr = 0, blank = 0, trailingNoNewline = [];
const ids = new Map(); const dupIds = [];
const dateMismatch = []; const typeMismatch = [];
const supersedesRefs = [];
const kinds = {};
const dirsFound = fs.readdirSync(R);
console.log('ledger dirs present:', dirsFound);
for (const t of TYPES) {
  const dir = path.join(R, t);
  if (!fs.existsSync(dir)) { console.log('MISSING type dir:', t); continue; }
  for (const fn of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, fn);
    const raw = fs.readFileSync(full, 'utf8');
    if (raw.length && !raw.endsWith('\n')) trailingNoNewline.push(t + '/' + fn);
    const lines = raw.split('\n');
    const fdate = fn.replace(/\.jsonl$/, '');
    let n = 0;
    for (const line of lines) {
      if (line.trim() === '') { if (line !== '') blank++; continue; }
      n++;
      let rec;
      try { rec = JSON.parse(line); } catch (e) { parseErr++; continue; }
      if (ids.has(rec.id)) dupIds.push(rec.id + ' in ' + t + '/' + fn + ' and ' + ids.get(rec.id));
      else ids.set(rec.id, t + '/' + fn);
      if (rec.dateKST !== fdate) dateMismatch.push(t + '/' + fn + ' id=' + rec.id + ' dateKST=' + rec.dateKST);
      if (rec.type !== t) typeMismatch.push(t + '/' + fn + ' id=' + rec.id + ' type=' + rec.type);
      if (rec.supersedes) supersedesRefs.push({ id: rec.id, t, fn, supersedes: rec.supersedes });
      const k = t + ':' + (rec.body && rec.body.kind);
      kinds[k] = (kinds[k] || 0) + 1;
    }
    perDate[fdate] = (perDate[fdate] || 0) + n;
    perTypeDate[t + ' ' + fdate] = n;
    total += n;
  }
}
console.log('lines per type/date:', perTypeDate);
console.log('lines per date (all types):', perDate);
console.log('TOTAL lines:', total, ' parseErrors:', parseErr, ' whitespace-only lines:', blank, ' files without trailing newline:', trailingNoNewline);
console.log('duplicate ids:', dupIds.length, dupIds.slice(0, 5));
console.log('dateKST != filename date:', dateMismatch.length, dateMismatch.slice(0, 5));
console.log('type != dir:', typeMismatch.length, typeMismatch.slice(0, 5));
console.log('records with supersedes:', supersedesRefs.length);
for (const s of supersedesRefs.slice(0, 20)) console.log('   ', s.t, s.fn, s.id, '->', JSON.stringify(s.supersedes));
console.log('body.kind by type:', kinds);
