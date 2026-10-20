import fs from 'node:fs';
import {screenHits} from '/home/claude/atlas-video/site/next/words.js';
const pages = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let n = 0;
for (const [name, text] of pages) { const hits = screenHits(text); if (hits.length) { n += hits.length; console.log(name, hits.join(', ')); } }
console.log('hits', n);
