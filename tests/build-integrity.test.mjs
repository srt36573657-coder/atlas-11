import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {verifyBuild} from '../scripts/verify_build.mjs';

test('release guard rejects stale entry points and stale or unfinished static data',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'atlas-build-check-'));
  const root=pathToFileURL(dir+'/');
  const put=async(p,body)=>{const file=path.join(dir,p);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,body);};
  try {
    await put('publish/index.html','<script type="module" src="/assets/current.js"></script><link rel="stylesheet" href="/assets/current.css">');
    await put('publish/assets/current.js','data-press-code data-actual-overview data-atlas-intro data-smart-toolbar data-smart-jump data-design-edition');
    await put('publish/assets/current.css','.press-workbench{}');
    await put('public/data/atlas.json','new-data');
    await put('publish/data/atlas.json','new-data');
    assert.equal((await verifyBuild(root)).sourceMatchesBuild,true);
    await put('publish/assets/current.js','old-app');
    await assert.rejects(verifyBuild(root),/현재 소개·신문 통합 화면/);
    await put('publish/assets/current.js','data-press-code data-actual-overview');
    await assert.rejects(verifyBuild(root),/현재 소개·신문 통합 화면/);
    await put('publish/assets/current.js','data-press-code data-actual-overview data-atlas-intro');
    await assert.rejects(verifyBuild(root),/현재 소개·신문 통합 화면/);
    await put('publish/assets/current.js','data-press-code data-actual-overview data-atlas-intro data-smart-toolbar data-smart-jump data-design-edition');
    await put('publish/data/atlas.json','old-data');
    await assert.rejects(verifyBuild(root),/현재 원본과 다릅니다/);
    await put('publish/data/atlas.json','new-data');
    await put('public/data/atlas.press.next.json','unfinished');
    await assert.rejects(verifyBuild(root),/미완료 저장 파일/);
  } finally {await fs.rm(dir,{recursive:true,force:true});}
});
