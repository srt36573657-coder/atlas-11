// Static deployment does not install the Node24 factor36 runner.
// Keep the legacy worker from publishing another engine under the current UI.
export const config={schedule:'0 7 * * 1-5'};
export default async()=>{
 const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
 if(today>'2026-10-30'||today<'2026-09-17')return new Response('Closed');
 return new Response(JSON.stringify({updated:false,partial:true,exitCode:2,code:'FACTOR36_HOSTED_RUNNER_REQUIRED',message:'Node24에서 npm run completion:daily와 배포 연결을 설치해야 합니다. 이전 모형 자동 발행은 차단했습니다.'}),{status:503,headers:{'content-type':'application/json'}});
};
