import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildRollingForecast,persistRollingForecast,readRollingPublications} from '../lib/rolling-forecast.mjs';

const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const read=async(file,otherwise)=>{try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT'&&otherwise!==undefined)return otherwise;throw e;}};
const issuedAt=arg('--now')??new Date().toISOString(),paths=arg('--paths');
const [bundle,recordsPayload,registry,calendar,priorPublications,latest]=await Promise.all([
 read('public/data/atlas.json'),read('public/data/factor36-records.json',{schema:'atlas-factor36-records-1',records:[]}),read('public/data/factor36-registry.json'),read('public/data/rolling-calendar.json',null),readRollingPublications(),read('public/data/rolling-forecast.json',null)
]);
const files=['lib/factor36.mjs','lib/factor36-input.mjs','lib/factor36-simulation.mjs','lib/rolling-forecast.mjs','scripts/build_rolling_forecast.mjs'];
const implementationSHA256=createHash('sha256').update((await Promise.all(files.map(f=>fs.readFile(f,'utf8')))).join('\n')).digest('hex');
const publication=buildRollingForecast({bundle,recordsPayload,registry,calendar:calendar??undefined,issuedAt,paths:paths?Number(paths):undefined,implementationSHA256,priorPublications});
const result=await persistRollingForecast(publication,{expectedLatestId:latest?.id??null});
console.log(JSON.stringify({...result,publication:undefined,summary:result.publication.summary,dataStatus:result.publication.dataStatus}));
