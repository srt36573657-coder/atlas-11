import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Refuse a release whose entry page or copied data belongs to an older build.
// This guard does not change forecasts, source data or existing test results.
export async function verifyBuild(root=new URL('../',import.meta.url)) {
  const read=p=>fs.readFile(new URL(p,root));
  const hash=b=>createHash('sha256').update(b).digest('hex');
  const html=(await read('publish/index.html')).toString();
  const js=html.match(/<script\b[^>]*\bsrc="(\/assets\/[^"/]+\.js)"/);
  const css=html.match(/<link\b[^>]*\bhref="(\/assets\/[^"/]+\.css)"/);
  if(!js||!css)throw Error('빌드 시작 페이지의 JS/CSS 연결을 확인할 수 없습니다.');
  const main=(await read('publish'+js[1])).toString();
  const style=(await read('publish'+css[1])).toString();
  if(!main.includes('data-press-code')||!main.includes('data-actual-overview')||!main.includes('data-atlas-intro')||!main.includes('data-smart-toolbar')||!main.includes('data-smart-jump')||!main.includes('data-design-edition')||!style.includes('.press-workbench'))
    throw Error('빌드 시작 페이지가 현재 소개·신문 통합 화면을 가리키지 않습니다.');
  let copied=0;
  async function verifyPublic(folder='') {
    for(const entry of await fs.readdir(new URL('public/'+folder,root),{withFileTypes:true})) {
      const relative=folder+entry.name;
      if(entry.isSymbolicLink())throw Error('정적 자료 심볼릭 링크 거부: '+relative);
      if(entry.isDirectory())await verifyPublic(relative+'/');
      else {
        if(/\.next\.json$/.test(relative))throw Error('미완료 저장 파일이 배포 입력에 있습니다: '+relative);
        const source=await read('public/'+relative), built=await read('publish/'+relative);
        if(hash(source)!==hash(built))throw Error('배포 자료가 현재 원본과 다릅니다: '+relative);
        copied++;
      }
    }
  }
  await verifyPublic();
  return {entry:js[1],css:css[1],copiedFiles:copied,sourceMatchesBuild:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await verifyBuild()));
