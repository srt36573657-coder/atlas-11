import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),sha=b=>createHash('sha256').update(b).digest('hex');
function styles(){const main=read('src/main.tsx');return [...main.matchAll(/import\s+["'](.+\.css)["']/g)].map(m=>({path:'src/'+m[1].replace(/^\.\//,''),css:read('src/'+m[1].replace(/^\.\//,''))}));}
function roots(){const values=new Map();for(const {css} of styles())postcss.parse(css).walkRules(rule=>{if(rule.selector===':root'&&!rule.parent?.name)rule.walkDecls(d=>{if(d.prop.startsWith('--'))values.set(d.prop,d.value);});});return values;}
function resolve(value,map,seen=new Set()){if(!value)return null;if(/^#[0-9a-f]{6}$/i.test(value))return value;const m=value.match(/^var\((--[\w-]+)(?:,.*)?\)$/);if(!m||seen.has(m[1]))return null;return resolve(map.get(m[1]),map,new Set([...seen,m[1]]));}
const luminance=h=>{const v=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('archived Atelier preserves its geometry; 9.4 trading-day geometry has a separate browser check',()=>{
 const snapshot=json('reports/atelier/chart-geometry-before.json');
 const archived=read('reports/single-view/chart-insights-before.tsx');assert.equal(sha(archived),snapshot.sha256,'original chart evidence preserved');
 // The user requested one forecast. Permit exactly four overlay removals,
 // while retaining a byte-for-byte check of every other coordinate and path.
 const replacements=[
  [',commonScale=false,cycleCandidate=null',',commonScale=false'],
  ['...returns,...(cycleCandidate?.rows??[]),...actual','...returns,...actual'],
  ['    {cycleCandidate&&<path data-cycle-forecast={asset.code} d={line(cycleCandidate.rows,"p50",y)} stroke="var(--cycle-line)" strokeWidth="2" strokeDasharray="2 4" fill="none"/>}\n',''],
  ['{cycleCandidate?"보라: 주기 연구 후보 · 금색: 기존 뉴스 모형":"● 방향　● 분포만　○ 설명·유보 · 날짜 선택으로 확인"}','{"● 방향　● 분포만　○ 설명·유보 · 날짜 선택으로 확인"}'],
 ];
 let expected=archived;
 for(const[from,to]of replacements){assert.equal(expected.split(from).length,2,'exact approved overlay transformation');expected=expected.replace(from,to);}
 assert.equal(read('reports/factor36/before-source/src/insights.tsx'),expected,'no unrelated chart geometry changes');
 const source=read('reports/factor36/before-source/src/insights.tsx');assert.match(source,/data-entire-period="true"/);assert.match(source,/strokeDasharray="7 4"/);assert.match(source,/data-forecast-values/);assert.match(source,/data-chart-keyboard/);
});
test('Atelier loaded CSS parses and final text/financial tokens have measurable contrast',()=>{
 const files=styles();assert.ok(files.some(x=>x.path==='src/workspace.css'),'Current workspace stylesheet must actually be imported');for(const file of files)assert.ok(postcss.parse(file.css).nodes.length,file.path);
 const map=roots();for(const bg of ['--background','--surface','--surface-inset'])for(const fg of ['--text','--muted','--subtle','--positive','--negative']){
  const a=resolve(map.get(fg),map),b=resolve(map.get(bg),map);assert.ok(a&&b,'resolvable '+fg+'/'+bg);assert.ok(contrast(a,b)>=4.5,`${fg} ${a} on ${bg} ${b}: ${contrast(a,b)}`);
 }
 for(const fg of ['--chart-actual','--chart-forecast','--chart-event']){const a=resolve(map.get(fg),map),b=resolve(map.get('--surface'),map);assert.ok(a&&b);assert.ok(contrast(a,b)>=3,fg);}
});
test('Atelier styles do not erase scientific labels, actual curves or uncertainty semantics',()=>{
 const critical=/forecast-status|scope-gap|scope-summary|trust|endpoint-label|chart-legend|actual|forecast|evidence|diagnosis/;
 for(const file of styles().filter(x=>x.path.includes('atelier')))postcss.parse(file.css).walkRules(rule=>{if(!critical.test(rule.selector))return;for(const d of rule.nodes??[]){if(d.type!=='decl')continue;assert.ok(!(d.prop==='display'&&d.value==='none'),file.path+' hides '+rule.selector);assert.ok(!(d.prop==='visibility'&&d.value==='hidden'),file.path+' hides '+rule.selector);assert.ok(!(d.prop==='opacity'&&Number(d.value)===0),file.path+' transparent '+rule.selector);assert.ok(!['clip-path','d'].includes(d.prop),file.path+' changes semantic chart geometry '+rule.selector);}});
});
test('Atelier preserves keyboard focus, reduced motion and forced colors fallback in loaded CSS',()=>{
 const all=styles().map(x=>x.css).join('\n'),ast=postcss.parse(all);let focus=false,reduced=false,forced=false;
 ast.walkRules(r=>{if(r.selector.includes(':focus-visible'))r.walkDecls('outline',d=>{if(!/^(none|0)(?:\s|$)/.test(d.value))focus=true;});});
 ast.walkAtRules('media',r=>{if(r.params.includes('prefers-reduced-motion'))reduced=true;if(r.params.includes('forced-colors'))forced=true;});
 assert.ok(focus);assert.ok(reduced);assert.ok(forced);
});

test('Atelier preserves all prior issued forecast identities while allowing daily inputs and new versions',()=>{
 const before=json('reports/atelier/preservation-before.json'),bundle=json('public/data/atlas.json');
 const versions=[bundle.original,...bundle.priorVersions,bundle.candidate],saved=new Map();
 for(const version of versions){const hash=sha(JSON.stringify(version));if(saved.has(version.id))assert.equal(saved.get(version.id),hash,'Conflicting forecast ID '+version.id);saved.set(version.id,hash);}
 assert.equal(Object.keys(before.versions).length,17,'Atelier baseline has17 issued forecasts');
 for(const [id,hash] of Object.entries(before.versions))assert.equal(saved.get(id),hash,'Preserved issued forecast '+id);
 assert.equal(sha(JSON.stringify(bundle.original)),before.originalSHA);
 assert.equal(bundle.input.assets.length,52);assert.equal(new Set(bundle.input.assets.map(a=>a.code)).size,52);
});

test('Atelier actual observations stay solid and all research paths keep dashed matching legend keys',()=>{
 const ast=postcss.parse(read('src/atelier-charts.css'));
 const decl=(selector,prop)=>{let value;ast.walkRules(r=>{if(r.parent?.type==='root'&&r.selector.split(',').map(s=>s.trim()).includes(selector))r.walkDecls(prop,d=>value=d.value);});return value;};
 for(const selector of ['.evo-actual','.breaking-chart-actual'])assert.equal(decl(selector,'stroke-dasharray'),'none',selector);
 for(const selector of ['.evo-original','.evo-baseline','.evo-shadow','.breaking-chart-baseline','.breaking-chart-change'])assert.match(decl(selector,'stroke-dasharray'),/^\d+ \d+$/,selector);
 for(const selector of ['.evo-legend .actual::before','.breaking-chart-legend .actual::before'])assert.equal(decl(selector,'border-top-style'),'solid');
 for(const selector of ['.evo-legend .original::before','.breaking-chart-legend .base::before','.evo-legend .shadow::before','.breaking-chart-legend .change::before'])assert.equal(decl(selector,'border-top-style'),'dashed');
});
test('Atelier scoped panel controls and primary labels use actual contrasting tokens',()=>{
 const map=roots();for(const [a,b,minimum] of [['--control-border','--surface',3],['--muted','--surface',4.5],['--gold','--on-gold',4.5]]){
  const fg=resolve(map.get(a),map),bg=resolve(map.get(b),map);assert.ok(fg&&bg,a+'/'+b);assert.ok(contrast(fg,bg)>=minimum,a+'/'+b+' '+contrast(fg,bg));
 }
 const ast=postcss.parse(read('src/workspace.css'));let controlRule=false;
 ast.walkRules(r=>{if(r.selector.includes('input')&&!r.parent?.name)r.walkDecls(d=>{if(['border','border-color'].includes(d.prop)&&d.value.includes('--control-border'))controlRule=true;});});assert.ok(controlRule,'Forms use control token, not decorative panel border');
});

test('Atelier includes narrow-screen layout, reachable navigation and minimum touch controls',()=>{
 const ast=postcss.parse(read('src/atelier-layout.css'));let smallTitle=false,mobileNav=false,focusScroll=false,touch=false;
 ast.walkRules(r=>{
  if(r.parent?.type==='atrule'&&/max-width:\s*359px/.test(r.parent.params)&&r.selector.includes('.mini-title'))r.walkDecls('grid-template-columns',d=>smallTitle=d.value==='minmax(0,1fr)');
  if(r.selector.includes('nav button:nth-child(n+5)'))r.walkDecls('display',d=>{if(d.value==='flex')mobileNav=true;});
  if(r.selector==='main[data-atelier] .focus-news-content')r.walkDecls('overflow',d=>focusScroll=d.value==='auto');
  if(r.selector==='main[data-atelier] .mini-card .stock-controls button')r.walkDecls('min-height',d=>{if(parseFloat(d.value)>=44)touch=true;});
 });assert.ok(smallTitle,'320px applies narrow title layout');assert.ok(mobileNav,'all navigation entries reachable');assert.ok(focusScroll,'long explanation has internal scroll');assert.ok(touch,'controls at least44px');
});
test('Atelier 320px gallery date grids accommodate 44px targets without seven-column clipping',()=>{
 const ast=postcss.parse(read('src/atelier-layout.css'));let adaptive=false;
 ast.walkRules(r=>{if(r.parent?.type!=='atrule'||!r.parent.params.includes('max-width'))return;
  if(!r.selector.split(',').map(s=>s.trim()).includes('main[data-atelier] .date-grid'))return;
  r.walkDecls('grid-template-columns',d=>{if(/repeat\(auto-fit,\s*minmax\(44px,\s*1fr\)\)/.test(d.value))adaptive=true;});
 });assert.ok(adaptive,'Generic gallery DateGrid must adapt, not only focus-news grid');
});
