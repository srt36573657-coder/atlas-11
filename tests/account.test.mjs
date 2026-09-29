import test from 'node:test';import assert from 'node:assert/strict';
import {handleAccountRequest,accountKey} from '../lib/account-service.mjs';
const env={ATLAS_GOOGLE_CLIENT_ID:'fixture.apps.googleusercontent.com',ATLAS_SESSION_SECRET:'test-only-session-secret-with-at-least-32-characters'};
const origin='https://atlas.example',store=new Map();
let nonce='',subject='fixture-user-a';
const dependencies={env,codes:['005930','005380'],now:Date.parse('2026-09-27T02:00:00Z'),
 read:async key=>store.get(key),write:async(key,next,rev)=>{if((store.get(key)?.revision??0)!==rev)throw Object.assign(Error('conflict'),{code:'CONFLICT'});store.set(key,structuredClone(next));},
 verifyGoogle:async(token,aud)=>{assert.equal(token,'fixture-credential');assert.equal(aud,env.ATLAS_GOOGLE_CLIENT_ID);return{sub:subject,email:subject+'@example.test',name:subject,nonce,email_verified:true};}};
const request=(action,payload={},jar='',from=origin)=>new Request(origin+'/api/account'+(action==='config'?'?action=config':''),{method:['config','profile'].includes(action)?'GET':'POST',headers:{origin:from,cookie:jar,'content-type':'application/json'},...(!['config','profile'].includes(action)?{body:JSON.stringify({action,expectedAccountId:accountKey(subject),...payload})}:{})});
async function login(){const challenge=await handleAccountRequest(request('config'),dependencies);nonce=(await challenge.json()).nonce;const cookie=challenge.headers.getSetCookie()[0].split(';')[0];const result=await handleAccountRequest(request('login',{credential:'fixture-credential'},cookie),dependencies);assert.equal(result.status,200);return result.headers.getSetCookie()[0].split(';')[0];}
test('account login binds nonce and issuer identity to an HttpOnly signed session',async()=>{
 const jar=await login();const response=await handleAccountRequest(request('profile',{},jar),dependencies);assert.equal((await response.json()).user.name,subject);
 assert.equal((await handleAccountRequest(request('watch',{code:'005930',watched:true,expectedRevision:0},''),dependencies)).status,401);
 assert.equal((await handleAccountRequest(request('watch',{code:'005930',watched:true,expectedRevision:0},jar,'https://other.example'),dependencies)).status,403);
 const tampered=jar.slice(0,-1)+(jar.endsWith('a')?'b':'a');assert.equal((await (await handleAccountRequest(request('profile',{},tampered),dependencies)).json()).user,null);
});
test('watchlist persists per Google subject and refuses stale writes and foreign codes',async()=>{
 store.clear();subject='fixture-user-a';const a=await login();
 let response=await handleAccountRequest(request('watch',{code:'005930',watched:true,expectedRevision:0},a),dependencies);assert.equal(response.status,200);
 assert.deepEqual((await response.json()).watchlist,['005930']);
 assert.equal((await handleAccountRequest(request('watch',{code:'005380',watched:true,expectedRevision:0},a),dependencies)).status,409);
 assert.equal((await handleAccountRequest(request('watch',{code:'999999',watched:true,expectedRevision:1},a),dependencies)).status,400);
 subject='fixture-user-b';const b=await login();
 assert.equal((await handleAccountRequest(request('watch',{code:'005930',watched:true,expectedRevision:0,expectedAccountId:accountKey('fixture-user-a')},b),dependencies)).status,412);assert.deepEqual((await (await handleAccountRequest(request('profile',{},b),dependencies)).json()).watchlist,[]);
 assert.deepEqual((await (await handleAccountRequest(request('profile',{},a),dependencies)).json()).watchlist,['005930']);
});
test('missing Google configuration and expired nonce cannot pretend a save succeeded',async()=>{
 const noConfig=await handleAccountRequest(request('config'),{...dependencies,env:{}});assert.equal((await noConfig.json()).configured,false);
 const response=await handleAccountRequest(request('login',{credential:'fixture-credential'}),dependencies);assert.equal(response.status,401);
 const challenge=await handleAccountRequest(request('config'),dependencies);nonce=(await challenge.json()).nonce;
 const jar=challenge.headers.getSetCookie()[0].split(';')[0];
 assert.equal((await handleAccountRequest(request('login',{credential:'fixture-credential'},jar),{...dependencies,now:dependencies.now+601000})).status,401);
});
test('wrong nonce and unverified email are rejected before issuing a session',async()=>{
 const response=await handleAccountRequest(request('config'),dependencies);const jar=response.headers.getSetCookie()[0].split(';')[0];
 for(const identity of [{sub:'a',email_verified:true,nonce:'wrong'},{sub:'a',email_verified:false,nonce:(await response.clone().json()).nonce}])
  assert.equal((await handleAccountRequest(request('login',{credential:'fixture-credential'},jar),{...dependencies,verifyGoogle:async()=>identity})).status,401);
});
