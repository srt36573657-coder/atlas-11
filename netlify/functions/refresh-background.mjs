// Archived implementation is in reports/completion/before. Never issue the retired engine.
export default async req=>{
 const token=process.env.ATLAS_JOB_TOKEN??process.env.ATLAS_ADMIN_TOKEN;
 if(!token||req.headers.get('authorization')!==`Bearer ${token}`)return new Response('Unauthorized',{status:401});
 return new Response(JSON.stringify({updated:false,partial:true,exitCode:2,code:'FACTOR36_HOSTED_RUNNER_REQUIRED',message:'Node24의 npm run completion:daily 작업을 사용하세요. 정적 ZIP만으로 서버 실행이 설치되지 않습니다.'}),{status:503,headers:{'content-type':'application/json'}});
};
