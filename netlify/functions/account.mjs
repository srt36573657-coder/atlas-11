import {getStore} from '@netlify/blobs';
import {handleAccountRequest} from '../../lib/account-service.mjs';
import bundle from '../../public/data/atlas.json' with {type:'json'};
export const config={path:'/api/account'};
export default async function(req,context={}){
  const suffix=(context.deploy?.context??process.env.CONTEXT)==='production'?'production':(context.deploy?.id??process.env.DEPLOY_ID??'local');
  const store=getStore({name:'atlas-accounts-v1-'+suffix,consistency:'strong'});
  return handleAccountRequest(req,{codes:bundle.input.assets.map(a=>a.code),
    read:async key=>(await store.get(key,{type:'json'}))??null,
    write:async(key,value,revision)=>{
      const current=await store.getWithMetadata(key,{type:'json'});
      if((current?.data?.revision??0)!==revision)throw Object.assign(Error('conflict'),{code:'CONFLICT'});
      const result=await store.setJSON(key,value,current?.etag?{onlyIfMatch:current.etag}:{onlyIfNew:true});
      if(!result.modified)throw Object.assign(Error('conflict'),{code:'CONFLICT'});
    }});
}
