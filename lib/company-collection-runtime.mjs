// Node-only adapter. service.mjs and the browser do not import network/DNS code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildSourceRegistry52,collectSources52} from './news-collection52.mjs';

export function createCompanyCollector({directory=null,onSnapshot=null,deadlineMs=120000,...collectorOptions}={}){
  return async({input,previous,now=new Date(),fetcher})=>{
    if(!previous&&directory){
      try{previous={registry:JSON.parse(await fs.readFile(path.join(directory,'registry.json'),'utf8')),state:JSON.parse(await fs.readFile(path.join(directory,'state.json'),'utf8')),report:JSON.parse(await fs.readFile(path.join(directory,'latest.json'),'utf8'))};}
      catch(error){if(error.code!=='ENOENT')throw error;}
    }
    const registry=buildSourceRegistry52(input,{previousRegistry:previous?.registry});
    const age=now.getTime()-Date.parse(previous?.report?.endedAt??'');
    const sameRegistry=previous?.registry&&JSON.stringify(previous.registry.sources.map(s=>s.id).sort())===JSON.stringify(registry.sources.map(s=>s.id).sort());
    if(sameRegistry&&previous?.state&&age>=0&&age<15*60000)return{...previous,registry,report:{...previous.report,reusedObservation:true,reusedAt:now.toISOString()},exitCode:previous.report.partial?2:0};
    const started=Date.now(),clock=()=>new Date(now.getTime()+Date.now()-started);
    const snapshot=onSnapshot??(directory?async({body,metadata})=>{
      const file=path.join(directory,'snapshots',metadata.contentSha256+'.bin');await fs.mkdir(path.dirname(file),{recursive:true});
      try{await fs.writeFile(file,body,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
      await fs.writeFile(file+'.json',JSON.stringify(metadata));
    }:null);
    // Normal environment proxy only when Node explicitly enabled its support.
    const proxyEnabled=process.execArgv.includes('--use-env-proxy')||process.env.NODE_USE_ENV_PROXY==='1';
    const result=await collectSources52(registry,{...collectorOptions,deadlineMs,now:clock,previousState:previous?.state,
      ...(fetcher?{fetcher}:proxyEnabled?{fetcher:globalThis.fetch}:{}),...(snapshot?{onSnapshot:snapshot}:{}),
      ...(directory?{onAttempt:async log=>{await fs.mkdir(directory,{recursive:true});await fs.appendFile(path.join(directory,'attempts.jsonl'),JSON.stringify(log)+'\n');}}:{}),
    });
    if(directory){
      for(const [name,value]of [['registry',registry],['state',result.state],['latest',result.report]]){
        const target=path.join(directory,name+'.json'),temp=target+'.tmp-'+process.pid;
        await fs.mkdir(directory,{recursive:true});await fs.writeFile(temp,JSON.stringify(value));await fs.rename(temp,target);
      }
    }
    return result;
  };
}
