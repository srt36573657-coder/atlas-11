from pathlib import Path
import zipfile,hashlib,json,gzip,re,shutil,sys,subprocess,tempfile
source=Path(__file__).resolve().parents[1];p=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else source/'release';p.mkdir(parents=True,exist_ok=True);publish=source/'publish';web=p/'web'
if web.exists():shutil.rmtree(web)
web.mkdir()
for f in publish.rglob('*'):
 if not f.is_file():continue
 rel=f.relative_to(publish)
 if str(rel) in ['data/atlas.json','data/rolling-forecast.json','data/daily-movement.json','data/daily-movement-display.json','_redirects','CHECK_ATLAS.cmd','DEPLOY_NETLIFY.cmd','DEPLOY_NETLIFY.mjs','netlify.toml'] or f.suffix=='.zip' or str(rel).startswith(('deploy/','source/','archive/')):continue
 # Historical archive copies stay in the full release/source ZIP; static UI uses manifest-backed data.
 # Hidden staging fragments remain in the full source/history ZIP, not the static deployment.
 if any(part.startswith('.') for part in rel.parts):continue
 if f.stat().st_size>=10_000_000:continue
 dest=web/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
raw=(publish/'data/atlas.json').read_bytes();gz=gzip.compress(raw,compresslevel=9,mtime=0);parts=[]
for n,start in enumerate(range(0,len(gz),4_000_000)):
 data=gz[start:start+4_000_000];name=f'/data/atlas-part-{n}.bin';(web/name[1:]).write_bytes(data);parts.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
m={'schema':1,'originalBytes':len(raw),'originalSHA256':hashlib.sha256(raw).hexdigest(),'chunks':parts};(web/'data/atlas-manifest.json').write_text(json.dumps(m))
with tempfile.TemporaryDirectory(prefix='atlas-display-') as tmp:
 display_path=Path(tmp)/'display.json'
 subprocess.run(['node',str(source/'scripts/build_display_bundle.mjs'),str(publish/'data/atlas.json'),str(display_path)],check=True,cwd=source)
 display_raw=display_path.read_bytes()
display_gz=gzip.compress(display_raw,compresslevel=9,mtime=0);display_parts=[]
for n,start in enumerate(range(0,len(display_gz),4_000_000)):
 data=display_gz[start:start+4_000_000];name=f'/data/atlas-display-part-{n}.bin';(web/name[1:]).write_bytes(data);display_parts.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
display_manifest={'schema':1,'originalBytes':len(display_raw),'originalSHA256':hashlib.sha256(display_raw).hexdigest(),'sourceSHA256':m['originalSHA256'],'chunks':display_parts};(web/'data/atlas-display-manifest.json').write_text(json.dumps(display_manifest))
rolling_raw=(publish/'data/rolling-forecast.json').read_bytes();rolling_gz=gzip.compress(rolling_raw,compresslevel=9,mtime=0);rolling_parts=[]
for n,start in enumerate(range(0,len(rolling_gz),4_000_000)):
 data=rolling_gz[start:start+4_000_000];name=f'/data/rolling-part-{n}.bin';(web/name[1:]).write_bytes(data);rolling_parts.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(web/'data/rolling-manifest.json').write_text(json.dumps({'schema':1,'originalBytes':len(rolling_raw),'originalSHA256':hashlib.sha256(rolling_raw).hexdigest(),'chunks':rolling_parts}))
assert gzip.decompress(b''.join((web/x['path'][1:]).read_bytes() for x in rolling_parts))==rolling_raw
shutil.copy2(source/'scripts/drop-chunk-loader.mjs',web/'assets/chunk-loader.mjs')
index=(publish/'index.html').read_text();match=re.search(r'<script type="module" crossorigin src="(/assets/index-[^"/]+\.js)"></script>',index)
assert match is not None, 'Expected immutable Vite application entry, never the generated loader'
main=match.group(1)
assert (web/main.lstrip('/')).is_file(), 'Application entry missing'
assert (web/main.lstrip('/')).read_bytes()==(publish/main.lstrip('/')).read_bytes(), 'Build changed during packaging'
(web/'assets/atlas-start.mjs').write_text("import {createAtlasFetch} from './chunk-loader.mjs';\nwindow.fetch=createAtlasFetch(window.fetch.bind(window),location.href);\nconst fixSourceLink=()=>document.querySelectorAll('a[href=\"/downloads/ATLAS_Program_Source.zip\"]').forEach(a=>{a.href='/README.txt';a.textContent='배포 안내 다운로드';});new MutationObserver(fixSourceLink).observe(document.getElementById('root'),{childList:true,subtree:true});\ntry{await import("+json.dumps(main)+");}catch(e){document.getElementById('root').textContent='화면을 불러오지 못했습니다. 새로고침해 주세요.';console.error(e);}\n")
(web/'index.html').write_text(index.replace(main,'/assets/atlas-start.mjs'))
headers=web/'_headers';headers.write_text(headers.read_text()+'\n/assets/*.mjs\n  Content-Type: application/javascript; charset=utf-8\n')
version=json.loads((source/'package.json').read_text())['version']
(web/'README.txt').write_text(f'ATLAS {version} · Netlify Drop용\nZIP을 풀어 index.html이 바로 들어있는 폴더를 Netlify 수동 배포 영역에 올리세요.\n첫 화면은 표시용 자료를 먼저 읽습니다. 전체 보관 자료는 이전 근거 열기·전체 내보내기·자료 저장 시 필요에 따라 읽습니다.\n첫 화면: 52종목 각각의 실제 종가에서 다음 20거래일 전망. 날짜별 CSV와 이전 발행을 보존합니다. 보관 종가 사용과 당일 확정 종가를 구분하며, 자료 대기를 정확도 개선으로 해석하지 마세요.\n정적 ZIP만으로 서버 자동 수집·구글 로그인이 설치되지 않습니다. 전체 소스 및 별도 서버 설정이 필요합니다. 실제 계정 배포는 미실행입니다.\n')
files=[f for f in web.rglob('*') if f.is_file()];assert max(f.stat().st_size for f in files)<10_000_000;assert sum(f.stat().st_size for f in files)<50_000_000
out=p/'ATLAS_Evolution_Netlify.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in files:z.write(f,f.relative_to(web))
with zipfile.ZipFile(out) as z:assert z.testzip() is None;assert 'index.html' in z.namelist()
assert gzip.decompress(b''.join((web/x['path'][1:]).read_bytes() for x in parts))==raw
assert gzip.decompress(b''.join((web/x['path'][1:]).read_bytes() for x in display_parts))==display_raw
r={'zipBytes':out.stat().st_size,'uncompressedBytes':sum(f.stat().st_size for f in files),'largestFileBytes':max(f.stat().st_size for f in files),'files':len(files),'dataSHA256':m['originalSHA256'],'restoredExactly':True,'displayBytes':len(display_raw),'displayTransferBytes':len(display_gz),'archiveBytes':len(raw),'archiveTransferBytes':len(gz),'displaySourceHashMatches':json.loads(display_raw)['displayProjection']['sourceSHA256']==m['originalSHA256'],'startupArchiveRequests':0,'rollingBytes':len(rolling_raw),'rollingTransferBytes':len(rolling_gz),'rollingRestoredExactly':True};(p/'drop-validation.json').write_text(json.dumps(r,indent=2));print(r)
