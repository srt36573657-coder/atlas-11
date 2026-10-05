import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {chromium} from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

// Run against an already-built deployment directory. Does not modify or build it.
const web=path.resolve(process.argv[2]||'../release/web'),out='reports/completion-ui';
fs.mkdirSync(out,{recursive:true});
const report={at:new Date().toISOString(),physicalDevice:false,buildIndexSHA256:createHash('sha256').update(fs.readFileSync(path.join(web,'index.html'))).digest('hex'),checks:[],errors:[]};
const expected=JSON.parse(fs.readFileSync(path.join(web,'data/completion-status.json'))),bundle=JSON.parse(gunzipSync(fs.readFileSync(path.join(web,'data/news-wave.json.gz'))));
report.forecastId=bundle.id;
const server=spawn('python3',['-m','http.server','5186','--bind','127.0.0.1','--directory',web],{stdio:'ignore'});
let browser,page;
const check=(name,pass)=>{report.checks.push({name,pass});if(!pass)throw Error(name);};
try{
  await new Promise(resolve=>setTimeout(resolve,350));
  browser=await chromium.launch({executablePath:process.env.ATLAS_CHROMIUM||'/tmp/atlas-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process']});
  page=await browser.newPage({viewport:{width:1366,height:768},acceptDownloads:true});page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto('http://127.0.0.1:5186');await page.locator('.focus-card [data-factor36-reason]').waitFor({timeout:60000});
  check('52 selectable stocks keep the active forecast',await page.locator('[data-studio-code]').count()===52&&await page.locator('[data-selected-forecast]').getAttribute('data-selected-forecast')===bundle.id);
  await page.locator('.tools-trigger').click();await page.locator('[data-tool-action="calculate"]').click();
  await page.locator('[data-completion-state="ready"]').waitFor({timeout:10000});
  check('evidence ledger matches the exact chart issuance',await page.locator('[data-completion-forecast]').getAttribute('data-completion-forecast')===bundle.id&&expected.forecastId===bundle.id);
  check('52 click-selectable evidence stocks',await page.locator('[data-completion-stock]').count()===52);
  check('36 factors and separate FOMO each expose six stages',await page.locator('[data-completion-factor]').count()===37&&await page.locator('.completion-stage').count()===222);
  const totals=await page.locator('.completion-totals article b').allTextContents();
  check('source, calculation, FOMO totals are measured separately',totals[0].startsWith(String(expected.summary.factorTypesWithRawSource))&&totals[1].startsWith(String(expected.summary.factorTypesUsed))&&totals[2].startsWith(String(expected.summary.fomoComputedStocks)));
  let selectedAll=true;
  for(const stock of expected.stocks){
    await page.locator(`[data-completion-stock="${stock.code}"]`).click();
    selectedAll=selectedAll&&await page.locator('[data-completion-selected]').getAttribute('data-completion-selected')===stock.code
      &&await page.locator('[data-completion-factor]').count()===37
      &&await page.locator('.completion-selected h3').textContent().then(text=>text.includes(stock.name));
  }
  check('all 52 company buttons actually select their own 36-factor and FOMO evidence',selectedAll);
  const last=expected.stocks.at(-1);await page.locator(`[data-completion-stock="${last.code}"]`).click();
  check('last company selection changes only its evidence',await page.locator('[data-completion-selected]').getAttribute('data-completion-selected')===last.code&&await page.locator('.completion-selected h3').textContent().then(text=>text.includes(last.name)));
  const press=JSON.parse(fs.readFileSync(path.join(web,'data/newspaper-evidence.json'))),pressObservations=press.sources.filter(source=>source.sourceBodyRead===true&&source.snapshotVerified===true).flatMap(source=>(source.observations??[]).filter(o=>o.scope==='market'||o.targetCodes?.includes(last.code)));
  await page.locator('.completion-newspaper > summary').click();await page.locator('[data-newspaper-source]').first().waitFor();
  check('newspaper observations show only the chosen company and market-wide evidence',await page.locator('[data-newspaper-target]').count()===pressObservations.length&&await page.locator('[data-newspaper-target]').evaluateAll((elements,code)=>elements.every(e=>['market',code].includes(e.getAttribute('data-newspaper-target'))),last.code));
  check('newspaper supplement states not used in current forecast and shows publication/observation dates',await page.locator('.completion-newspaper').textContent().then(text=>text.includes('현재 전망 계산에 미반영')&&text.includes('발표')&&text.includes('ATLAS 확인')));
  await page.locator('.completion-newspaper > summary').click();
  await page.getByRole('button',{name:'계산 사용',exact:true}).click();
  check('used filter agrees with saved calculation states',await page.locator('[data-completion-factor]').count()===1+last.factors.filter(f=>f.calculation?.status==='ready').length);
  await page.getByRole('button',{name:'전체 36',exact:true}).click();
  await page.locator('[data-completion-factor="FOMO"] > summary').click();
  check('FOMO shows its own six-stage evidence, without missing-as-zero',await page.locator('[data-completion-factor="FOMO"]').textContent().then(text=>text.includes(Number.isFinite(last.fomo.score)?'관측 점수 '+last.fomo.score:'점수 미산출')));
  for(const [width,height]of [[1366,768],[390,844],[320,740]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(100);
    check('ledger has no horizontal overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('stock selection has touch-size height '+width,await page.locator('[data-completion-stock]').evaluateAll(elements=>elements.every(e=>e.getBoundingClientRect().height>=36)));
    await page.screenshot({path:`${out}/evidence-${width}.png`});
  }
  await page.setViewportSize({width:1366,height:768});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.completion-heading a').click()]);
  const downloadPath=path.resolve(out,'ATLAS_52_Factor_Status.json');await download.saveAs(downloadPath);
  check('browser downloads a JSON file, whose issue and bytes match deployed evidence',download.suggestedFilename()==='ATLAS_52_Factor_Status.json'&&await download.failure()===null&&fs.readFileSync(downloadPath).equals(fs.readFileSync(path.join(web,'data/completion-status.json'))));
  const [equations]=await Promise.all([page.waitForEvent('download'),page.locator('[data-wave-data] a[download]').first().click()]);
  await equations.saveAs(path.resolve(out,'ATLAS_FACTOR36_52_EQUATIONS.json'));
  const equationRows=JSON.parse(fs.readFileSync(path.resolve(out,'ATLAS_FACTOR36_52_EQUATIONS.json')));
  check('equation download is actual JSON for the original 52 stocks, not an HTML fallback',await equations.failure()===null&&Array.isArray(equationRows)&&equationRows.length===52&&expected.stocks.every(stock=>equationRows.some(row=>row.code===stock.code)));
  await page.locator('.completion-operation summary').click();
  check('installation and execution states are not inferred from code presence',await page.locator('.completion-operation').textContent().then(text=>text.includes(`서버 설치 ${expected.operation?.serverInstalled===true?'확인':expected.operation?.serverInstalled===false?'미설치':'미확인'}`)&&text.includes(`예약 연결 ${expected.operation?.schedulerInstalled===true?'확인':expected.operation?.schedulerInstalled===false?'미설치':'미확인'}`)));
  await page.locator('#atlas-nav-score').click();await page.locator('[data-completion-daily-state="ready"]').waitFor({timeout:10000});
  check('daily report uses the same forecast as all charts',await page.locator('[data-daily-forecast]').getAttribute('data-daily-forecast')===bundle.id);
  const score=JSON.parse(fs.readFileSync(path.join(web,'data/completion-daily-score.json')));
  check('daily observation count is dates rather than 52 independent stocks',await page.locator('.completion-daily').textContent().then(text=>text.includes(`관측 ${score.byDate.length}거래일`)&&text.includes('52번의 독립 시험으로 세지 않습니다')));
  if(!score.byDate.length)check('missing outcomes are not a zero-percent hit rate',await page.locator('.completion-daily-pending').textContent().then(text=>text.includes('적중률은 아직 미산출')));
  const [dailyDownload]=await Promise.all([page.waitForEvent('download'),page.locator('.completion-daily .completion-heading a').click()]);
  await dailyDownload.saveAs(path.resolve(out,'ATLAS_Daily_Report.json'));
  check('daily report downloads as the exact deployed JSON',await dailyDownload.failure()===null&&fs.readFileSync(path.resolve(out,'ATLAS_Daily_Report.json')).equals(fs.readFileSync(path.join(web,'data/completion-daily-score.json'))));
  await page.locator('#atlas-nav-evolution').click();await page.locator('[data-factor-metric="directionAccuracy"]').waitFor();await page.setViewportSize({width:390,height:844});
  check('new diagnostic metrics remain legible with the dark mobile table theme',await page.locator('[data-factor-metric="directionAccuracy"] th').evaluate(e=>{const style=getComputedStyle(e),rgb=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number),lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0),fg=lum(style.color),bg=lum(style.backgroundColor);return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)>=4.5;}));
  check('no browser runtime exceptions',report.errors.length===0);
}catch(error){report.errors.push(error.stack||String(error));if(page)await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});}
finally{report.passed=!report.errors.length&&report.checks.every(check=>check.pass);fs.writeFileSync(`${out}/browser.json`,JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();server.kill();}
console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
