import { initialState, transition, upgradeState, clientState } from "../lib/service.mjs";
import { isDisplayBundle, displayOnlyState } from '../lib/display-bundle.mjs';
let registeredBundle=null,serverSeen=false;
const fullBundles=new Map();
export function registerDisplayBundle(bundle){registeredBundle=bundle;return bundle;}
async function fullBundle(bundle=registeredBundle){
 if(!bundle)throw Error('전체 자료 연결 정보가 없습니다.');
 if(!isDisplayBundle(bundle))return bundle;
 const meta=bundle.displayProjection,key=meta.sourceSHA256;
 if(meta.fullURL!=='/data/atlas-full.json'||!/^[a-f0-9]{64}$/.test(key))throw Error('전체 자료 연결 형식 오류');
 if(!fullBundles.has(key))fullBundles.set(key,(async()=>{
  const response=await fetch(meta.fullURL);
  if(!response.ok)throw Error('전체 보관 자료를 불러오지 못했습니다.');
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==meta.sourceBytes)throw Error('배포 자료가 바뀌었습니다. 새로고침 뒤 다시 시도해 주세요.');
  const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  if(actual!==key)throw Error('전체 자료 지문이 첫 화면과 다릅니다. 보관 자료를 교체하지 않았습니다.');
  const complete=JSON.parse(new TextDecoder().decode(bytes));
  if(isDisplayBundle(complete)||complete._displayOnly)throw Error('표시 자료를 전체 보관본으로 사용할 수 없습니다.');
  return complete;
 })().catch(e=>{fullBundles.delete(key);throw e;}));
 return fullBundles.get(key);
}
function displayed(state,bundle){return isDisplayBundle(bundle)?displayOnlyState(clientState(state),bundle.displayProjection):state;}
let dbPromise;
const open = () =>
  (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("atlas-news-v3", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("records");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
async function transaction(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", mode);
    let result,error;
    const fail=e=>{error=e;tx.abort();};
    try{fn(tx.objectStore("records"), (value) => (result = value),fail);}catch(e){fail(e);}
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(error??tx.error);
    tx.onabort = () => reject(error??tx.error ?? Error("저장 취소"));
  });
}
export async function localLoad(bundle){
 if(bundle)registerDisplayBundle(bundle);
 if(!isDisplayBundle(bundle))return transaction(bundle?'readwrite':'readonly',(s,done,fail)=>{const r=s.get('state');r.onsuccess=()=>{try{const next=r.result&&bundle?upgradeState(r.result,bundle):r.result??null;if(next&&next!==r.result)s.put(next,'state');done(next);}catch(e){fail(e);}};});
 // Always read the authoritative state: an older open tab may have edited it without
 // invalidating a new release's display cache. Never select a stale cached projection.
 const saved=await transaction('readonly',(s,done)=>{const r=s.get('state');r.onsuccess=()=>done(r.result??null);});
 if(!saved)return null; // New visitor: no archive download is necessary.
 if(saved._displayOnly)throw Error('표시 자료가 보관 영역에 있습니다. 원본 확인이 필요합니다.');
 if(saved._archiveSourceSHA256===bundle.displayProjection.sourceSHA256)return displayed(saved,bundle);
 return displayed(await loadFullLocalState(bundle),bundle);
}
export async function loadFullLocalState(bundle=registeredBundle){
 if(isDisplayBundle(bundle)){
  const saved=await transaction('readonly',(s,done)=>{const r=s.get('state');r.onsuccess=()=>done(r.result??null);});
  if(saved?._displayOnly)throw Error('표시 자료가 보관 영역에 있습니다. 원본 확인이 필요합니다.');
  if(saved?._archiveSourceSHA256===bundle.displayProjection.sourceSHA256)return saved;
 }
 const complete=await fullBundle(bundle);
 return transaction('readwrite',(s,done,fail)=>{const r=s.get('state');r.onsuccess=()=>{
  try {
   if(r.result?._displayOnly)throw Error('표시 전용 상태가 보관 영역에 있습니다. 원본 확인 전 저장하지 않습니다.');
   let next=r.result?upgradeState(r.result,complete):initialState(complete);
   if(next?._displayOnly)throw Error('전체 상태 복원 실패');
   if(isDisplayBundle(bundle))next={...next,_archiveSourceSHA256:bundle.displayProjection.sourceSHA256};
   if(next!==r.result)s.put(next,'state');
   s.delete('display-state');
   done(next);
  }catch(error){fail(error);}
 };});
}
export async function localAction(action, payload, bundle) {
  bundle=bundle??registeredBundle;
  const saved= isDisplayBundle(bundle)?await transaction('readonly',(s,done)=>{const r=s.get('state');r.onsuccess=()=>done(r.result??null);}):null;
  const reuseSaved=!!saved&&!saved._displayOnly&&saved._archiveSourceSHA256===bundle.displayProjection.sourceSHA256;
  const complete=reuseSaved?null:await fullBundle(bundle);
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readwrite"),
      store = tx.objectStore("records");
    let next, error;
    const read = store.get("state");
    read.onsuccess = () => {
      try {
        if(read.result?._displayOnly)throw Error('표시 자료는 보관 상태를 덮어쓸 수 없습니다.');
        if(reuseSaved&&read.result?._archiveSourceSHA256!==bundle.displayProjection.sourceSHA256)throw Error('다른 창에서 보관 자료가 바뀌었습니다. 다시 시도해 주세요.');
        next = transition(reuseSaved?read.result:read.result ? upgradeState(read.result,complete) : initialState(complete), action, payload);
        if(isDisplayBundle(bundle))next={...next,_archiveSourceSHA256:bundle.displayProjection.sourceSHA256};
        store.put(next, "state");
        store.delete('display-state');
      } catch (e) {
        error = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(displayed(next,bundle));
    tx.onerror = () => reject(error ?? tx.error);
    tx.onabort = () => reject(error ?? Error("저장 취소"));
  });
}
export async function api(action = "state", payload = {}, token = "") {
 let hasJSONResponse=false;
 try {
  const read = action === "state" || action === "version";
  const response = await fetch(
    "/api/atlas" +
      (action === "version"
        ? "?version=" + encodeURIComponent(payload.id)
        : ""),
    {
      signal: AbortSignal.timeout(action === "refresh" ? 120000 : 20000),
      method: read ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(read ? {} : { body: JSON.stringify({ action, ...payload }) }),
    },
  );
  if (
    !(response.headers.get("content-type") ?? "").includes("application/json")
  )
    throw Error("운영 서버 연결 없음");
  hasJSONResponse=true;
  const data = await response.json();
  if (!response.ok) throw Error(data.error ?? "서버 요청 실패");
  serverSeen=true;
  return data;
 }catch(error){
  if(action==='version'&&!serverSeen&&!hasJSONResponse&&isDisplayBundle(registeredBundle)){
   const state=await loadFullLocalState(registeredBundle),version=state.versions.find(v=>v.id===payload.id);
   if(version)return {version};
   throw Error('보관된 전망에서 요청한 버전을 찾지 못했습니다.');
  }
  throw error;
 }
}
export function download(name, body, mime = "application/json") {
  const url = URL.createObjectURL(
    new Blob(
      [typeof body === "string" ? body : JSON.stringify(body, null, 2)],
      { type: mime },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
