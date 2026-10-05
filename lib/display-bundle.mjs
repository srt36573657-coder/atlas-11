// Display-only transport. It must never replace a full persisted state or model input.
export const DISPLAY_SCHEMA='atlas-display-bundle-1';
export function isDisplayBundle(bundle){return bundle?.displayProjection?.schema===DISPLAY_SCHEMA;}
export function displayStateFromBundle(bundle){
 if(!isDisplayBundle(bundle)||!bundle.displayState||!Array.isArray(bundle.versionMetadata))throw Error('표시 자료 형식 오류');
 const detailed=new Map([bundle.original,bundle.candidate].map(v=>[v?.id,v]));
 const versions=bundle.versionMetadata.map(v=>detailed.get(v.id)??v);
 if(versions.some(v=>!v?.id)||!versions.some(v=>v.id===bundle.displayState.active)||!versions.some(v=>v.id===bundle.displayState.original))throw Error('표시 전망 목록이 완전하지 않습니다.');
 return {...bundle.displayState,input:bundle.input,versions,_displayOnly:true,displayProjection:bundle.displayProjection};
}
export function displayOnlyState(client,projection){
 if(!client?.input||!Array.isArray(client.versions))throw Error('표시 상태가 없습니다.');
 const {sealedStudy,...rest}=client;
 const archived=sealedStudy?.archiveDeferred===true?sealedStudy.summary:{studies:sealedStudy?.studies?.length??0,reports:sealedStudy?.reports?.length??0,proofs:sealedStudy?.proofs?.length??0,errors:sealedStudy?.errors?.length??0};
 return {...rest,_displayOnly:true,displayProjection:projection,sealedStudy:{schema:1,studies:[],reports:[],proofs:[],errors:[],archiveDeferred:true,summary:archived}};
}
export function createDisplayBundle(bundle,client,{sourceSHA256,sourceBytes}){
 if(!/^[a-f0-9]{64}$/.test(sourceSHA256)||!Number.isSafeInteger(sourceBytes)||sourceBytes<=0)throw Error('원본 표시 연결 지문 오류');
 if(bundle.input?.assets?.length!==52||new Set(bundle.input.assets.map(a=>a.code)).size!==52)throw Error('표시 자료는 52개 고유 종목이 필요합니다.');
 const projection={schema:DISPLAY_SCHEMA,displayOnly:true,sourceSHA256,sourceBytes,fullURL:'/data/atlas-full.json',preservesAllCalendarDates:true,archivalDetailsDeferred:true};
 const view=displayOnlyState(client,projection),{input,versions,...displayState}=view;
 const original=versions.find(v=>v.id===view.original),candidate=versions.find(v=>v.id===view.active);
 if(!original?.assets?.length||!candidate?.assets?.length)throw Error('첫 화면 전망 경로가 없습니다.');
 const versionMetadata=versions.map(v=>{const {assets,evidenceCoverage,eventGate,notes,...metadata}=v;return {...metadata,detailLoaded:false,assets:[]};});
 return {schema:bundle.schema,displayProjection:projection,input,original,candidate,displayState,versionMetadata,modelAudit:bundle.modelAudit??null,probabilityAudit:bundle.probabilityAudit??null};
}
