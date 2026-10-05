import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {OAuth2Client} from 'google-auth-library';
const SESSION='atlas_account',NONCE='atlas_login_nonce';
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const sign=(body,secret)=>createHmac('sha256',secret).update(body).digest('base64url');
function seal(value,secret){const body=encode(value);return body+'.'+sign(body,secret);}
function open(value,secret,now){
  try{
    const [body,sig,...extra]=String(value??'').split('.');if(extra.length||!sig)return null;
    const got=Buffer.from(sig),expected=Buffer.from(sign(body,secret));
    if(got.length!==expected.length||!timingSafeEqual(got,expected))return null;
    const data=JSON.parse(Buffer.from(body,'base64url'));
    return Number.isFinite(data.exp)&&data.exp>now?data:null;
  }catch{return null;}
}
function cookies(req){return Object.fromEntries((req.headers.get('cookie')??'').split(';').map(s=>s.trim().split(/=(.*)/s)).filter(p=>p[0]));}
const cookie=(name,value,age,secure)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure?'; Secure':''}`;
const reply=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
export const accountKey=sub=>createHash('sha256').update(sub).digest('hex');
export async function verifyGoogleCredential(credential,audience){
  const ticket=await new OAuth2Client(audience).verifyIdToken({idToken:credential,audience});
  return ticket.getPayload();
}
export async function handleAccountRequest(req,{read,write,codes,env=process.env,now=Date.now(),verifyGoogle=verifyGoogleCredential}){
  const url=new URL(req.url),secure=url.protocol==='https:',time=Math.floor(now/1000);
  const clientId=env.ATLAS_GOOGLE_CLIENT_ID??'',secret=env.ATLAS_SESSION_SECRET??'';
  const configured=Boolean(clientId.endsWith('.apps.googleusercontent.com')&&secret.length>=32);
  const jar=cookies(req),session=configured?open(jar[SESSION],secret,time):null;
  const user=session?.kind==='account'&&typeof session.sub==='string'?{sub:session.sub,email:session.email,name:session.name}:null;
  const publicUser=user?{accountId:accountKey(user.sub),email:user.email,name:user.name}:null;
  const record=async()=>user?(await read(accountKey(user.sub)))??{revision:0,codes:[],history:[]}:null;
  if(req.method==='GET'){
    if(url.searchParams.get('action')==='config'){
      if(!configured)return reply({configured:false,reason:'Google 로그인 연결 설정이 필요합니다.'});
      const nonce=randomBytes(24).toString('base64url');
      return reply({configured:true,clientId,nonce},200,{'set-cookie':cookie(NONCE,seal({kind:'nonce',nonce,exp:time+600},secret),600,secure)});
    }
    const value=await record();return reply({configured,user:publicUser,watchlist:value?.codes??[],revision:value?.revision??0});
  }
  if(req.method!=='POST')return reply({error:'허용되지 않는 메서드'},405);
  if(req.headers.get('origin')!==url.origin)return reply({error:'다른 사이트 요청은 허용하지 않습니다.'},403);
  if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON 요청이 필요합니다.'},415);
  if(!configured)return reply({error:'Google 로그인·계정 저장 연결 설정이 필요합니다.'},503);
  let body;try{const text=await req.text();if(text.length>20000)throw Error();body=JSON.parse(text);}catch{return reply({error:'요청 형식 오류'},400);}
  if(body.action==='login'){
    const challenge=open(jar[NONCE],secret,time);
    if(!challenge||challenge.kind!=='nonce')return reply({error:'로그인 화면을 다시 열어 주세요.'},401);
    try{
      const identity=await verifyGoogle(body.credential,clientId);
      if(!identity||identity.nonce!==challenge.nonce||identity.email_verified!==true||typeof identity.sub!=='string'||!identity.sub)
        throw Error('identity contract');
      const token=seal({kind:'account',sub:identity.sub,email:identity.email,name:identity.name??identity.email,exp:time+7*86400},secret);
      const response=reply({user:{email:identity.email,name:identity.name??identity.email}});
      response.headers.append('set-cookie',cookie(SESSION,token,7*86400,secure));
      response.headers.append('set-cookie',cookie(NONCE,'',0,secure));return response;
    }catch{return reply({error:'Google 로그인 확인에 실패했습니다. 다시 시도해 주세요.'},401);}
  }
  if(body.action==='logout')return reply({loggedOut:true},200,{'set-cookie':cookie(SESSION,'',0,secure)});
  if(!user)return reply({error:'관심종목 저장에는 로그인이 필요합니다.'},401);
  if(body.expectedAccountId!==publicUser.accountId)return reply({error:'로그인 계정이 바뀌었습니다. 목록을 다시 확인하세요.'},412);
  if(!['watch','clear'].includes(body.action))return reply({error:'지원하지 않는 계정 동작'},400);
  if(body.action==='watch'&&(!codes.includes(body.code)||typeof body.watched!=='boolean'))return reply({error:'원래 52종목 중 하나를 선택하세요.'},400);
  const old=await record();
  if(!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision!==old.revision)
    return reply({error:'다른 기기에서 목록이 변경되었습니다.',watchlist:old.codes,revision:old.revision},409);
  const list=body.action==='clear'?[]:body.watched?[...new Set([...old.codes,body.code])]:old.codes.filter(c=>c!==body.code);
  const next={revision:old.revision+1,codes:list,history:[...(old.history??[]),{at:new Date(now).toISOString(),action:body.action,code:body.code??null,watched:body.watched??null,previousRevision:old.revision}]};
  try{await write(accountKey(user.sub),next,old.revision);}
  catch(e){if(e.code==='CONFLICT')return reply({error:'저장 충돌입니다. 최신 목록을 다시 읽어 주세요.'},409);throw e;}
  return reply({user:publicUser,watchlist:next.codes,revision:next.revision,saved:true});
}
