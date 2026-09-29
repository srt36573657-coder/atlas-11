import {createCycleState,appendCycleReport} from './cycle-research.mjs';
import {collectCycleData} from './cycle-collection.mjs';
export function createCycleCollector({config,apiKey=process.env.KRX_API_KEY??''}={}){
 return async({input,version,previous,now=new Date(),fetcher})=>{
  const state=previous??createCycleState(input,version);
  let resolved=config;
  if(resolved===undefined){
   try{resolved=JSON.parse(process.env.ATLAS_CYCLE_CONFIG_JSON??'{}');}
   catch{throw Error('ATLAS_CYCLE_CONFIG_JSON 형식 오류 · 기존 정상 자료를 보존합니다.');}
  }
  const result=await collectCycleData(input,state.data,{config:resolved,apiKey,now,fetcher});
  const next=appendCycleReport({...state,data:result.data},input,version,{cutoff:now.toISOString()});
  next.collection=result.log;(next.collectionLogs??=[]).push(result.log);
  return next;
 };
}
