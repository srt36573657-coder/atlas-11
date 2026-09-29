import {hashString} from './engine.mjs';
export function appendEvolutionNote(evolution,payload,{now=new Date().toISOString(),codes=[],start='2026-09-17',end='2026-10-30'}={}){
 if(!evolution||evolution.schema!==1)throw Error('진화 기록을 먼저 초기화하세요.');
 const {code,date,kind}=payload;
 const detail=typeof payload.detail==='string'?payload.detail.trim():'';
 const evidenceUrl=typeof payload.evidenceUrl==='string'?payload.evidenceUrl.trim():'';
 if(!codes.includes(code)||!/^\d{4}-\d{2}-\d{2}$/.test(date??'')||date<start||date>end||!Number.isFinite(Date.parse(date+'T00:00:00Z')))throw Error('종목과 기간 안의 날짜를 확인하세요.');
 if(new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('존재하지 않는 날짜입니다.');
 if(!['ADD','REDUCE','REMOVE','REVIEW'].includes(kind)||detail.length<5||detail.length>3000)throw Error('변경 종류와 5~3000자 근거를 입력하세요.');
 if(evidenceUrl){let u;try{u=new URL(evidenceUrl);}catch{throw Error('출처 URL 오류');}if(u.protocol!=='https:'||u.username||u.password)throw Error('출처는 인증정보 없는 HTTPS 주소여야 합니다.');}
 const kst=new Date(Date.parse(now)+9*3600000).toISOString().slice(0,10);
 if(kst>end)throw Error('진화 기록 기간이 종료되었습니다.');
 const content={code,date,kind,detail,evidenceUrl,status:'HYPOTHESIS',applied:false};
 const id='note-'+hashString(JSON.stringify(content));
 if((evolution.notes??[]).some(n=>n.id===id))return evolution;
 return {...evolution,notes:[...(evolution.notes??[]),{id,...content,recordedAt:now,reason:'사용자 점검 가설 · 인과관계 미확정 · 계수에 자동 반영하지 않음'}]};
}
