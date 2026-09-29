export function createAtlasFetch(nativeFetch,baseURL){
 const pending=new Map();
 const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 async function load(kind){
  const mr=await nativeFetch(new URL(kind==='rolling'?'/data/rolling-manifest.json':kind==='display'?'/data/atlas-display-manifest.json':'/data/atlas-manifest.json',baseURL));
  if(!mr.ok)throw Error('자료 목록을 읽지 못했습니다.');
  const m=await mr.json();
  if(m.schema!==1||!Array.isArray(m.chunks)||m.chunks.length<1||m.chunks.length>16)throw Error('자료 목록 형식 오류');
  if(!Number.isSafeInteger(m.originalBytes)||m.originalBytes<=0||m.originalBytes>250_000_000||!/^([a-f0-9]{64})$/.test(m.originalSHA256))throw Error('자료 크기·지문 형식 오류');
  const pathRule=kind==='rolling'?/^\/data\/rolling-part-\d+\.bin$/:kind==='display'?/^\/data\/atlas-display-part-\d+\.bin$/:/^\/data\/atlas-part-\d+\.bin$/;
  const parts=await Promise.all(m.chunks.map(async c=>{
   if(!pathRule.test(c.path)||!Number.isSafeInteger(c.bytes)||c.bytes<=0||c.bytes>4_000_000||!/^([a-f0-9]{64})$/.test(c.sha256))throw Error('자료 경로·크기 오류');
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
   try{const r=await nativeFetch(new URL(c.path,baseURL),{signal:controller.signal});if(!r.ok)throw Error('자료 전송 실패');const bytes=await r.arrayBuffer();if(bytes.byteLength!==c.bytes||await sha(bytes)!==c.sha256)throw Error('자료 전송 검증 실패');return bytes;}finally{clearTimeout(timer);}
  }));
  if(typeof DecompressionStream!=='function')throw Error('브라우저를 최신 버전으로 업데이트해 주세요.');
  const bytes=await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(bytes.byteLength!==m.originalBytes||await sha(bytes)!==m.originalSHA256)throw Error('복원 자료 검증 실패');
  return bytes;
 }
 return async function atlasFetch(resource,options){
  const u=new URL(typeof resource==='string'||resource instanceof URL?resource:resource.url,baseURL);
  const method=options?.method??resource?.method??'GET';
  if(u.origin!==new URL(baseURL).origin||!['/data/atlas.json','/data/atlas-full.json','/data/rolling-forecast.json'].includes(u.pathname)||method.toUpperCase()!=='GET')return nativeFetch(resource,options);
  const kind=u.pathname==='/data/rolling-forecast.json'?'rolling':u.pathname==='/data/atlas.json'?'display':'archive';
  if(!pending.has(kind))pending.set(kind,load(kind).catch(e=>{pending.delete(kind);throw e;}));
  return new Response(await pending.get(kind),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','X-Atlas-Payload':kind}});
 };
}
