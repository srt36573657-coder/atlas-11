import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {chromium} from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

// Actual built files only. This script never creates synthetic production news or vintages.
const smoke=process.argv.includes('--smoke');
const web=path.resolve(process.argv[2]||'publish'),out=path.resolve(smoke?'reports/rolling/browser-drop':'reports/rolling/browser');
fs.mkdirSync(out,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const forecastFile=path.join(web,'data/rolling-forecast.json');
const forecastBytes=fs.existsSync(forecastFile)?fs.readFileSync(forecastFile):gunzipSync(Buffer.concat(JSON.parse(fs.readFileSync(path.join(web,'data/rolling-manifest.json'))).chunks.map(part=>fs.readFileSync(path.join(web,part.path)))));
const publication=JSON.parse(forecastBytes);
const report={at:new Date().toISOString(),physicalDevice:false,environment:'local Chromium; no real mobile-network speed claim',buildIndexSHA256:hash(fs.readFileSync(path.join(web,'index.html'))),forecastId:publication.id,checks:[],errors:[],measurements:{}};
const check=(name,pass,details)=>{report.checks.push({name,pass,...(details===undefined?{}:{details})});if(!pass)throw Error(name);};
const server=spawn('python3',['-m','http.server','5194','--bind','127.0.0.1','--directory',web],{stdio:'ignore'});
let browser,page;
const verifyRaw=async()=>{const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-rolling-raw]').click()]);const file=path.join(out,download.suggestedFilename());await download.saveAs(file);const parsed=JSON.parse(fs.readFileSync(file,'utf8'));check('raw issuance JSON download matches all52 saved asset rows',await download.failure()===null&&hash(JSON.stringify(parsed))===hash(JSON.stringify(publication)));};
try{
 await new Promise(resolve=>setTimeout(resolve,300));
 browser=await chromium.launch({executablePath:process.env.ATLAS_CHROMIUM||'/tmp/atlas-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
 report.chromiumVersion=await browser.version();
 page=await browser.newPage({viewport:{width:1280,height:800},acceptDownloads:true});
 page.on('pageerror',e=>report.errors.push(e.message));report.requests=[];page.on('request',r=>report.requests.push(new URL(r.url()).pathname));
 const started=Date.now();await page.goto('http://127.0.0.1:5194');
 await page.locator('[data-rolling-metrics]').waitFor({timeout:60000});
 report.measurements.firstMetricsMs=Date.now()-started;
 check('default page renders the saved rolling issue',await page.locator('[data-rolling-edition]').getAttribute('data-rolling-edition')===publication.id);
 check('five primary metrics render',await page.locator('[data-rolling-metrics]>article').count()===5);
 check('stored-close and issuance dates are separately visible',await page.locator('.rolling-publication').textContent().then(t=>t.includes(publication.actualAsOf)&&t.includes('발행')&&(publication.dataStatus==='current_close'||t.includes('당일 종가 미확보'))));
 if(smoke){
  await page.locator('.rolling-stock-button').click();check('Drop exposes52clickable stocks',await page.locator('[data-rolling-stock]').count()===52);await page.locator('[data-rolling-stock="005930"]').click();
  await page.locator('.rolling-detail>summary').click();const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-rolling-stock-csv]').click()]);const target=path.join(out,download.suggestedFilename());await download.saveAs(target);const selected=publication.assets.find(a=>a.code==='005930');
  check('Drop actually downloads exact stockCSV bytes',await download.failure()===null&&fs.readFileSync(target).equals(fs.readFileSync(path.join(web,selected.csvUrl))));await verifyRaw();
  const [combinedDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-rolling-all-csv]').click()]);const combinedFile=path.join(out,combinedDownload.suggestedFilename());await combinedDownload.saveAs(combinedFile);const combinedRows=fs.readFileSync(combinedFile,'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);check('Drop combinedCSV downloads52 series from exact issuance',await combinedDownload.failure()===null&&combinedRows.length===1093&&combinedRows.slice(1).every(row=>row.includes(publication.id)));
  report.measurements.resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize})));
  check('Drop startup downloadsrolling chunks without archived90MBatlas fetch',report.requests.some(p=>p.startsWith('/data/rolling-part-'))&&!report.requests.some(p=>/^\/data\/atlas(?:[-.])/.test(p)));
  await page.setViewportSize({width:390,height:844});check('Drop mobile390 has no horizontaloverflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'mobile-smoke.png'),fullPage:true});
 }else{
 check('forecast anchor difference is exactly zero',await page.locator('[data-rolling-anchor-difference]').textContent()==='0원');
 check('chart has one actual and one current line',await page.locator('[data-rolling-line="actual"]').count()===1&&await page.locator('[data-rolling-line="current"]').count()===1);
 let selected=publication.assets.find(a=>a.code==='005930')??publication.assets[0];
 check('previous line appears only with actual saved previous vintage',await page.locator('[data-rolling-line="previous"]').count()===(selected.previous?1:0));
 report.measurements.actualDrawnLines=await page.locator('[data-rolling-line]').count();
 check('exactly one band, anchor line, and joint anchor marker',await page.locator('[data-rolling-band]').count()===1&&await page.locator('[data-rolling-anchor-line]').count()===1&&await page.locator('[data-rolling-anchor-point]').count()===1);
 check('line colors/widths and band opacity match contract',await page.locator('[data-rolling-chart]').evaluate(e=>{const a=e.querySelector('[data-rolling-line="actual"]'),c=e.querySelector('[data-rolling-line="current"]'),b=e.querySelector('[data-rolling-band]');return a.getAttribute('stroke')==='#141820'&&a.getAttribute('stroke-width')==='2'&&c.getAttribute('stroke')==='#2563eb'&&c.getAttribute('stroke-width')==='2'&&Number(b.getAttribute('fill-opacity'))===.1;}));
 check('60 actual segments meet 20 forecast segments at identical coordinates',await page.locator('[data-rolling-chart]').evaluate(e=>{const a=e.querySelector('[data-rolling-line="actual"]').getAttribute('d'),c=e.querySelector('[data-rolling-line="current"]').getAttribute('d'),points=s=>[...s.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>m.slice(1).map(Number)),ap=points(a),cp=points(c);return ap.length===60&&cp.length===21&&Math.abs(ap.at(-1)[0]-cp[0][0])<.001&&Math.abs(ap.at(-1)[1]-cp[0][1])<.001;}));
 const originalPath=await page.locator('[data-rolling-line="current"]').getAttribute('d');
 await page.locator('[data-rolling-date]').last().click();
 check('date click changes own explanation while full path remains visible',await page.locator('[data-rolling-reason]').textContent().then(t=>t.includes(selected.rows.at(-1).date))&&await page.locator('[data-rolling-line="current"]').getAttribute('d')===originalPath);
 await page.locator('.rolling-stock-button').click();
 check('52 clickable stock choices without mandatory typing',await page.locator('[data-rolling-stock]').count()===52);
 let allSelected=true;
 for(const asset of publication.assets){
  await page.locator(`[data-rolling-stock="${asset.code}"]`).click();
  allSelected=allSelected&&await page.locator('[data-rolling-chart]').getAttribute('data-rolling-chart')===asset.code&&await page.locator('[data-rolling-reason]').getAttribute('data-rolling-reason')===asset.code&&await page.locator('[data-rolling-anchor-point]').getAttribute('data-anchor-close')===String(asset.anchor.close)&&await page.locator('[data-error-horizon]').count()===4;
  await page.locator('.rolling-stock-button').click();
 }
 check('all 52 choices render their own anchors, reasons, and four error cells',allSelected);
 await page.locator(`[data-rolling-stock="${selected.code}"]`).click();
 await page.locator(`[data-rolling-date="${selected.anchor.date}"]`).click();
 await page.locator('[data-rolling-play]').click();await page.waitForTimeout(1130);
 check('playback advances exactly one trading session in one second',await page.locator('[data-rolling-play-date]').textContent()===selected.rows[1].date);
 if(await page.locator('[data-rolling-play]').textContent()==='일시정지')await page.locator('[data-rolling-play]').click();
 const important=e=>e.used===false||['FOMC','BOK','CPI','PPI','JOBS','JOLTS'].includes(e.kind)||e.important===true||e.requiresAcknowledgement===true||e.importance==='high'||typeof e.importance==='number'&&e.importance>=1||e.evidenceAssessment?.materiality?.status==='potentially_material';
 const news=selected.news.find(e=>important(e)&&selected.rows.some(r=>r.date===e.date)&&e.date>selected.anchor.date);
 if(news){
  const index=selected.rows.findIndex(r=>r.date===news.date);await page.locator(`[data-rolling-date="${selected.rows[index-1].date}"]`).click();await page.locator('[data-rolling-play]').click();await page.locator('[data-rolling-continue]').waitFor({timeout:3000});
  check('real reviewed important news stops playback',await page.locator('[data-rolling-play-date]').textContent()===news.date&&await page.locator('[data-rolling-play]').isDisabled());
  await page.waitForTimeout(1200);check('news pause awaits actual acknowledgement',await page.locator('[data-rolling-play-date]').textContent()===news.date);
  await page.locator('[data-rolling-continue]').click();await page.waitForTimeout(1200);
  check('acknowledgement continues or stops for next unread same-day event',await page.locator('[data-rolling-continue]').count()>0||await page.locator('[data-rolling-play-date]').textContent()!==news.date);
 }
 await page.locator(`[data-rolling-date="${selected.anchor.date}"]`).click();
 await page.locator('.rolling-detail>summary').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-rolling-stock-csv]').click()]);const csv=path.join(out,download.suggestedFilename());await download.saveAs(csv);
 check('stock CSV downloads bytes rather than an HTML fallback',await download.failure()===null&&fs.readFileSync(csv).equals(fs.readFileSync(path.join(web,selected.csvUrl))));await verifyRaw();
 const [allDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-rolling-all-csv]').click()]);const combined=path.join(out,allDownload.suggestedFilename());await allDownload.saveAs(combined);const csvLines=fs.readFileSync(combined,'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 check('combined CSV downloads all 52 own series from the same issue',await allDownload.failure()===null&&csvLines.length===1+52*21&&csvLines.slice(1).every(l=>l.includes(publication.id)));
 await page.locator('.rolling-detail>summary').click();
 await page.getByRole('button',{name:'52종목 · 1만원',exact:true}).click();
 check('all 52 normalized paths and rankings render together',await page.locator('[data-rolling-normalized-line]').count()===52&&await page.locator('[data-rolling-rank]').count()===52);
 check('normalized paths share a 10000 initial coordinate',await page.locator('[data-rolling-normalized-line]').evaluateAll(es=>new Set(es.map(e=>e.getAttribute('d').match(/^M([^ ]+)/)?.[1])).size===1));
 await page.getByLabel('52종목 비교 거래일',{exact:true}).fill('20');
 const expectedRank=[...publication.assets].sort((a,b)=>b.rows[20].p50/b.anchor.close-a.rows[20].p50/a.anchor.close).map(a=>a.code);
 check('final-date ranking uses own normalized returns',JSON.stringify(await page.locator('[data-rolling-rank]').evaluateAll(es=>es.map(e=>e.getAttribute('data-rolling-rank'))))===JSON.stringify(expectedRank));
 await page.screenshot({path:path.join(out,'desktop-52.png'),fullPage:false});
 await page.getByRole('button',{name:'종목 상세',exact:true}).click();
 for(const [width,height]of [[1280,800],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);await page.evaluate(()=>scrollTo(0,0));
  check('no page horizontal overflow at '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check('five metrics and chart fit their container at '+width,await page.locator('[data-rolling-metrics], [data-rolling-chart]').evaluateAll(es=>es.every(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1;})));
  await page.screenshot({path:path.join(out,'screen-'+width+'.png'),fullPage:true});
  await page.locator('.rolling-stock-button').click();
  check('stock buttons retain 44px minimum touch height at '+width,await page.locator('[data-rolling-stock]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)));
  await page.locator(`[data-rolling-stock="${publication.assets.at(-1).code}"]`).click();
 }
 }
 check('no browser runtime exceptions',report.errors.length===0);
}catch(error){report.errors.push(error.stack??String(error));if(page){report.body=(await page.locator('body').textContent()).slice(0,3000);await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});}}
finally{report.passed=!report.errors.length&&report.checks.every(c=>c.pass);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();server.kill();}
console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
