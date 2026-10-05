import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
const read=p=>fs.readFileSync(p,'utf8'),sha=b=>createHash('sha256').update(b).digest('hex');
const groups=['brand','shell','charts','evidence','responsive','accessibility'];
test('evolution release preserves historical bundle fields and unchanged model files',()=>{
 const before=JSON.parse(read('reports/design365/preservation-before.json'));
 for(const [p,h] of Object.entries(before)){if(p==='lib/service.mjs'||p.startsWith('public/data/'))continue;assert.equal(sha(fs.readFileSync(p)),p==='lib/story.mjs'?JSON.parse(read('reports/factor36/before-source/lib-manifest.json'))[p]:h,p);}
 const snapshot=JSON.parse(read('reports/evolution/preservation-before.json')),current=JSON.parse(read('public/data/atlas.json'));const saved=new Map([current.original,...current.priorVersions,current.candidate].map(v=>[v.id,v]));for(const [id,h] of Object.entries(snapshot.versions))assert.equal(sha(JSON.stringify(saved.get(id))),h,'preserved forecast '+id);assert.equal(sha(JSON.stringify(current.original)),'1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca');
 const b=JSON.parse(read('public/data/atlas.json'));assert.equal(b.input.assets.length,52);assert.ok(new Set([b.original,...b.priorVersions,b.candidate].map(v=>v.id)).size>=17);assert.equal(b.candidate.modelVersion,'atlas-news-8.0.1');
});
test('365 design checkpoints have unique IDs and explicit implementation status',()=>{
 const rows=groups.flatMap(g=>JSON.parse(read('reports/design365/'+g+'.json')));
 assert.equal(rows.length,365);assert.deepEqual(rows.map(x=>x.id).sort(),Array.from({length:365},(_,i)=>'D'+String(i+1).padStart(3,'0')));
 for(const r of rows){for(const k of ['title','problem','solution','evidence','acceptance'])assert.ok(r[k],r.id+' '+k);assert.ok(['implemented','planned','verified_existing'].includes(r.status));}
});
test('historical six themes remain packaged but the current workspace has workspace and current factor36 theme',()=>{
 const main=read('src/main.tsx');
 const imports=[...main.matchAll(/import\s+["'](.+\.css)["']/g)].map(m=>m[1]);
 assert.deepEqual(imports,['./workspace.css','./factor36-theme.css']);
 for(const g of groups){const p='src/design365-'+g+'.css';assert.ok(postcss.parse(read(p)).nodes.length);assert.ok(!main.includes('./design365-'+g+'.css'));}
 const source=read('scripts/package_source.mjs');for(const g of groups)assert.ok(source.includes('design365-'+g+'.css'));
 const active=read('src/workspace.css');assert.match(active,/@import '\.\/legacy-support\.css' layer\(support\)/);assert.ok(!/@import .*?(atelier|studio|focus|learned-design)\.css/.test(active));
});
const luminance=h=>{const c=h.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('principal text tokens and finance colors meet 4.5:1 on ivory',()=>{
 for(const color of ['#382c2a','#665851','#716158','#71522e','#a12c3a','#265a88'])assert.ok(contrast(color,'#f6f2e9')>=4.5,color);
 assert.ok(contrast('#fffdf9','#382c2a')>=7);
});
test('brand mark remains visible and desktop three columns begin at 1500px',()=>{
 const shell=read('src/design365-shell.css'),responsive=read('src/design365-responsive.css');
 assert.match(shell,/\.brand-mark\s*\{\s*background:#fffdf9/);assert.ok(!responsive.includes('@media(min-width:1101px) and (max-width:1659px)'));
 for(const p of ['public/atlas-mark.svg','public/favicon.svg']){const svg=read(p);assert.match(svg,/<svg/);assert.ok(!/(?:href|src)=["']https?:|<script/i.test(svg));}
});
test('build includes revised styles, brand assets, full horizon and keyboard controls',()=>{
 const html=read('publish/index.html'),js=html.match(/src="(\/assets\/[^\"]+\.js)"/)[1],css=html.match(/href="(\/assets\/[^\"]+\.css)"/)[1];
 const bundle=read('publish'+js),style=read('publish'+css);
 for(const token of ['data-design-generation','data-chart-keyboard','atlas-mark.svg'])assert.ok(bundle.includes(token),token);
 for(const token of ['.nav-symbol','.atlas-loading','prefers-reduced-motion','forced-colors'])assert.ok(style.includes(token),token);
 assert.equal(sha(fs.readFileSync('public/data/atlas.json')),sha(fs.readFileSync('publish/data/atlas.json')));
});
