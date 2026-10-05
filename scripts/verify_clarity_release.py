"""Verify packaged bytes without rewriting or recalculating any saved forecasts."""
from pathlib import Path
import hashlib,io,json,re,zipfile,gzip,sys
src=Path(__file__).resolve().parents[1]
base=Path(sys.argv[1]).resolve()
raw=(src/'public/data/atlas.json').read_bytes();digest=hashlib.sha256(raw).hexdigest()
r={'version':'8.5.0','dataSHA256':digest,'packages':{}}
for name in ['ATLAS_Netlify.zip','ATLAS_Evolution_Netlify.zip']:
 p=base/name
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None
  assert 'index.html' in z.namelist()
  for href in re.findall(r'(?:src|href)="(/[^"?#]+)"',z.read('index.html').decode()):assert href.lstrip('/') in z.namelist(),href
  assert 'downloads/ATLAS_UX_85.md' in z.namelist()
  if name=='ATLAS_Netlify.zip':
   assert z.read('data/atlas.json')==raw
   with zipfile.ZipFile(io.BytesIO(z.read('downloads/ATLAS_Program_Source.zip'))) as inner:
    assert inner.testzip() is None
    assert json.loads(inner.read('package.json'))['version']=='8.5.0'
    for file in ['public/data/atlas.json','src/atlas.tsx','src/clarity.css','tests/ui.test.mjs','scripts/write_clarity_report.mjs','reports/clarity/release-validation.json']:
     assert inner.read(file)==(src/file).read_bytes(),file
  else:
   m=json.loads(z.read('data/atlas-manifest.json'));parts=[]
   for c in m['chunks']:
    data=z.read(c['path'].lstrip('/'));assert len(data)==c['bytes'];assert hashlib.sha256(data).hexdigest()==c['sha256'];parts.append(data)
   assert gzip.decompress(b''.join(parts))==raw
   assert max(x.file_size for x in z.infolist())<10_000_000
  r['packages'][name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'crc':'PASS','rootIndex':True}
r['innerSourceCRC']='PASS';r['exactDataRestoration']=True
r['release']=json.loads((src/'reports/clarity/release-validation.json').read_text())
(base/'ATLAS_UX_85_Validation.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print(json.dumps(r,ensure_ascii=False))
