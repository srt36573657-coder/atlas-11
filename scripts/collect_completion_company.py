#!/usr/bin/env python3
"""Bounded, read-only recheck of the existing 52-company source registry.

A successful HTTP response is a preserved document, NOT an approved event or
factor. The reviewed numerical observations live in company-observations.json.
"""
import concurrent.futures, datetime, gzip, hashlib, ipaddress, json, pathlib, re, socket, threading, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/completion'
RAW = OUT / 'raw-company'
LIMIT = 4 * 1024 * 1024
APPROVED_HOSTS = set()
HOST_LOCKS = {}

def stamp():
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')

def public_url(url):
    p=urllib.parse.urlsplit(url)
    if p.scheme!='https' or not p.hostname or p.username or p.password or p.port not in (None,443):
        raise ValueError('non-public HTTPS URL')
    if p.hostname in ('localhost','localhost.localdomain') or p.hostname.endswith(('.local','.internal')):
        raise ValueError('private hostname')
    if p.hostname not in APPROVED_HOSTS:
        raise ValueError('host not in the fixed previously recorded source allowlist')
    try:
        answers=socket.getaddrinfo(p.hostname,443,type=socket.SOCK_STREAM)
    except socket.gaierror:
        # This sandbox has an ordinary HTTPS proxy with remote DNS. Use it only
        # for the fixed public source hosts already in the research registry;
        # never claim that local address resolution succeeded.
        if urllib.request.getproxies().get('https'):
            return 'fixed_source_host_via_environment_https_proxy_remote_dns'
        raise
    for answer in answers:
        if not ipaddress.ip_address(answer[4][0]).is_global:
            raise ValueError('non-public resolved address')
    return 'public_dns_addresses_checked'

class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        public_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def collect(url, codes):
    start=time.monotonic(); at=stamp()
    result={'url':url,'codes':codes,'observedAt':at,'sourceBodyRead':False,'factorApproved':False,'publishedAt':None,'attempts':1}
    try:
        result['addressValidation']=public_url(url)
        request=urllib.request.Request(url,headers={'User-Agent':'ATLAS-source-review/1.0','Accept':'text/html,application/pdf,*/*;q=0.5'})
        with HOST_LOCKS[urllib.parse.urlsplit(url).hostname]:
            with urllib.request.build_opener(PublicRedirect).open(request,timeout=7) as response:
                data=response.read(LIMIT+1)
                if len(data)>LIMIT: raise ValueError('document size exceeds 4 MiB')
                result.update(httpStatus=response.status,finalUrl=response.geturl(),contentType=response.headers.get('Content-Type'),etag=response.headers.get('ETag'),lastModified=response.headers.get('Last-Modified'))
        digest=hashlib.sha256(data).hexdigest(); path=RAW/(digest+'.bin.gz')
        if not path.exists(): path.write_bytes(gzip.compress(data,mtime=0))
        result.update(status='body_downloaded_unreviewed',rawHash=digest,rawPath=str(path.relative_to(ROOT)),bytes=len(data))
        if 'html' in str(result.get('contentType')):
            body=data.decode('utf-8',errors='replace'); title=re.search(r'<title[^>]*>(.*?)</title>',body,re.S|re.I)
            result['title']=re.sub(r'\s+',' ',title.group(1)).strip()[:300] if title else None
            result['extractionStatus']='raw_html_preserved_no_automatic_financial_or_event_approval'
    except Exception as error:
        result.update(status='failed',error=str(error),errorType=type(error).__name__)
    result['elapsedSeconds']=round(time.monotonic()-start,3)
    return result

def main():
    RAW.mkdir(parents=True,exist_ok=True)
    inp=json.loads((ROOT/'public/data/input.json').read_text())
    research=json.loads((ROOT/'public/data/researched-news.json').read_text())['research']['assets']
    # The previous research URLs are provenance-grounded. Secondary/homepage URLs
    # are explicitly retained as routes only; no host label confers factor proof.
    routes={}
    for asset in research:
        sources=asset.get('sources',[])
        url=next((x.get('url') for x in sources if x.get('url','').startswith('https://')),None)
        if url: routes.setdefault(url,[]).append(asset['code'])
    for url in routes:
        host=urllib.parse.urlsplit(url).hostname
        APPROVED_HOSTS.add(host)
        APPROVED_HOSTS.add(host[4:] if host.startswith('www.') else 'www.'+host)
        HOST_LOCKS[host]=threading.BoundedSemaphore(1)
    started=stamp(); results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures={pool.submit(collect,url,codes):url for url,codes in routes.items()}
        for future in concurrent.futures.as_completed(futures): results.append(future.result())
    report={'schema':'atlas-company-source-scan-1','startedAt':started,'completedAt':stamp(),'universeCodes':[x['code'] for x in inp['assets']],'successfulBodies':sum(x['status']=='body_downloaded_unreviewed' for x in results),'failedRequests':sum(x['status']=='failed' for x in results),'newApprovedFactors':0,'newApprovedEvents':0,'meaning':'원문 HTTP 수집 현황. 홈페이지·미검토 응답은 사건/수치 근거 확보가 아님. 과거 조사·실패 이력은 별도 보존.','results':sorted(results,key=lambda x:x['codes'])}
    run=OUT/('company-scan-'+started.replace(':','-')+'.json');run.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (OUT/'company-scan-latest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=False))
    return 2 if report['failedRequests'] else 0

if __name__=='__main__': raise SystemExit(main())
