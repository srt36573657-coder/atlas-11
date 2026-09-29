import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const {chromium}=await import(process.env.ATLAS_PLAYWRIGHT??'playwright');

import {spawn} from 'node:child_process';import fs from 'node:fs';
const dir='reports/design-90';
const server=process.env.ATLAS_BROWSER_ROOT?spawn('python3',['-m','http.server','5173','--bind','127.0.0.1','--directory',process.env.ATLAS_BROWSER_ROOT],{stdio:'ignore'}):spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5173'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,700));
console.log('Server starting, browser launch');
const b=await chromium.launch({executablePath:process.env.ATLAS_CHROMIUM,args:process.env.ATLAS_CHROMIUM_ARGS?JSON.parse(fs.readFileSync(process.env.ATLAS_CHROMIUM_ARGS,'utf8')):['--no-sandbox'],headless:true});
console.log("Browser launched");
const p=await b.newPage({viewport:{width:1366,height:640}});const out={root:process.env.ATLAS_BROWSER_ROOT??'development',browser:await b.version(),checks:[],errors:[],viewports:[],physicalDevice:false};
p.on('pageerror',e=>{out.errors.push(e.message);console.log('pageerror',e.message)});p.on('console',m=>{if(m.type()==='error')console.log('console',m.text())});
const check=(name,pass,detail)=>{out.checks.push({name,pass,detail});console.log(name,pass,detail??'')};
try{
 console.log('Opening deployment');await p.goto('http://127.0.0.1:5173/');console.log('Page loaded');await p.waitForTimeout(4000);console.log((await p.locator('body').innerText()).slice(0,700));await p.screenshot({path:dir+'/deployment-start.png'});await p.locator('.focus-card').waitFor({timeout:120000});await p.evaluate(()=>document.fonts.ready);
 check('52 selectable stocks',await p.locator('[data-studio-code]').count()===52);
 await p.locator('[data-studio-code]').filter({hasText:'올릭스'}).click();
 await p.locator('.focus-card [data-date="2026-10-15"]').click();
 check('Olix 10/15 important-news stop',await p.locator('.focus-card [data-play-date]').textContent()==='2026-10-15',await p.locator('.focus-news-heading').innerText());
 for(const [width,height] of [[1366,640],[1280,600],[390,844],[360,800],[430,932],[320,640],[683,320]]){
  await p.setViewportSize({width,height});if(width<1024&&await p.locator('.mobile-sheet-close').isVisible())await p.locator('.mobile-sheet-close').click();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);
  const m=await p.evaluate(()=>{
   const rect=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,display:getComputedStyle(e).display}};
   return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,chart:rect('.focus-card .chart-wrap'),controls:rect('.focus-card .stock-controls'),title:rect('.focus-card .mini-title'),comparison:rect('.focus-card .focus-comparison'),settings:rect('.focus-settings'),font:getComputedStyle(document.querySelector('.mini-title h3')).fontFamily};
  });out.viewports.push(m);check(`${width} no horizontal page overflow`,m.scrollWidth<=width,m.scrollWidth);
  check(`${width} title and quote separated`,m.title.bottom<=m.comparison.y+1);
  check(`${width} graph and playback separated`,m.chart.bottom<=m.controls.y+1);
  if(width>=1024){check(`${width} chart and controls visible`,m.chart.y<=260&&m.controls.bottom<=height,m);check(`${width} chart height >=216`,m.chart.height>=216);}
  await p.screenshot({path:`${dir}/screen-${width}x${height}.png`,fullPage:true});
 }
 await p.setViewportSize({width:390,height:844});
 if(await p.locator('.mobile-sheet-close').isVisible())await p.locator('.mobile-sheet-close').click();await p.locator('.mobile-reason-toggle').click();check('Mobile reason sheet opens',await p.locator('.focus-news').isVisible());
 await p.screenshot({path:`${dir}/mobile-reason.png`});
 await p.getByRole('button',{name:'이유 닫기',exact:true}).click();check('Mobile reason sheet closes',!(await p.locator('.focus-news').isVisible()));
 await p.locator('.mobile-picker').click();check('Click-only stock picker',await p.getByRole('dialog').isVisible());await p.screenshot({path:`${dir}/mobile-picker.png`});await p.keyboard.press('Escape');
 await p.setViewportSize({width:1366,height:640});
 await p.locator('.focus-card .date-cell[data-date="2026-10-30"]').click();check('No next news disables button',await p.locator('.focus-card .secondary-play').filter({hasText:'다음 뉴스'}).isDisabled());
 check('One next news action',await p.locator('.focus-card button').filter({hasText:/^다음 뉴스$/}).count()===1);
 for(const id of ['news','score','evolution']){await p.locator('#atlas-nav-'+id).click();await p.waitForTimeout(300);await p.screenshot({path:`${dir}/page-${id}.png`,fullPage:false});check(`Tab ${id} opens`,await p.locator('#atlas-nav-'+id).getAttribute('aria-current')==='page');}
 await p.locator('#atlas-nav-graphs').click();check('Date preserved after tabs',await p.locator('.focus-card [data-play-date]').textContent()==='2026-10-30');
 // Font-loading failure: readable fallback and no overlap still required.
 await p.route('**/fonts/**',r=>r.abort());await p.reload();await p.locator('.focus-card').waitFor({timeout:120000});
 const gap=await p.evaluate(()=>document.querySelector('.mini-title').getBoundingClientRect().bottom<=document.querySelector('.focus-comparison').getBoundingClientRect().top);check('Font failure no title overlap',gap);
}catch(e){out.errors.push(e.stack);console.error(e);}finally{out.passed=out.checks.every(x=>x.pass)&&out.errors.length===0;fs.writeFileSync(`${dir}/browser.json`,JSON.stringify(out,null,2));await b.close();server.kill();}
if(!out.passed)process.exitCode=1;
