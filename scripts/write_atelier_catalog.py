"""Publish an honest 365-item implementation ledger; never equate code checks to pixel QA."""
from pathlib import Path
import json,html,collections
root=Path(__file__).resolve().parents[1]
plan=json.loads((root/'public/downloads/atelier/ATLAS_Atelier_365_Plan.json').read_text())
def nums(s):
 out=set()
 for part in s.split(','):
  if '-' in part:
   a,b=map(int,part.split('-'));out.update(range(a,b+1))
  elif part:out.add(int(part))
 return out
# Only list concrete changes here. Physical inspection is separate for every item.
new=nums('1-3,7-12,16,18,21,23,25-29,31,33-35,39-42,44-45,47,49-50,52-53,55,57,59,63-65,69,72-73,75,78-81,83-86,97-99,101,105,107-108,110-113,118-119,121-128,131-132,134,140-142,144,147-148,161-162,165,184,191,215,217-218,221-223,232,240,245-247,248,250,253-256,258,265-268,286-287,289,291,293-294,312,324,327,336-340,351-353,357,359-361,363')
retained=nums('4-6,11,15,19-20,24,36-38,51,58,61-62,71,87-91,94-95,102,116,129,130,135-137,139,143,145-146,151-156,158-160,163,167-168,169-170,172,177,179-180,182-183,185-188,190,193-200,203-211,213-214,219-220,225-230,233-237,243-244,256-257,260,269-275,278-284,288,292,295-298,300-308,313-323,328-334')-new
partial=nums('13-14,17,22,30,32,43,46,48,54,56,60,66-68,74,76-77,82,92-93,96,100,103-104,106,109,114-115,117,120,133,138,149-150,157,164,166,171,173-176,178,181,188-189,192,201-202,212,216,224,231,238-239,241-242,249,251-252,254-255,259,261-262,263,270-272,276-277,279,281-282,284-285,290,299,303,310-311,315-318,321,325-326,329-330,335,341-350,354-356,358,362,364-365')-new-retained
groups={
 'brand':(['src/atelier-brand.css','src/atlas.tsx','public/atlas-mark.svg'],'브랜드·문구·첫 정보 위계를 코드에 반영. 일부 내용은 기존 표시를 보존.'),
 'color':(['src/atelier-brand.css','src/atelier-charts.css','tests/atelier.test.mjs'],'새 팔레트와 금융 색 분리. 자동 대비 검사는 명시된 텍스트·컨트롤·핵심 선 조합을 대상으로 함.'),
 'type':(['src/atelier-brand.css','src/atelier-layout.css'],'서체·숫자·줄간격·모바일 입력 크기 정의. 모든 기기에서의 글꼴 모양을 실측한 것은 아님.'),
 'mark':(['public/atlas-mark.svg','public/favicon.svg','public/atlas-mark-mono.svg','public/atlas-mark-reverse.svg','src/atlas.tsx'],'독자 마크와 SVG 아이콘 규칙. 작은 크기의 실제 화면 검수는 별도 필요.'),
 'surface':(['src/atelier-layout.css','src/atelier-panels.css','src/atelier-charts.css'],'선·모서리·그림자·조작 경계 정리. 장식 경계와 컨트롤 경계를 분리.'),
 'layout':(['src/atelier-layout.css','src/atlas.tsx'],'화면 폭별 탐색·카드·집중 보기 배치. 실제 화면 잘림 및 줄바꿈 검수 대기.'),
 'chart':(['src/atelier-charts.css','src/insights.tsx','tests/atelier.test.mjs'],'의미별 선과 범례를 정리. 기존 좌표·전체기간·선택 날짜 로직 보존.'),
 'news':(['src/atelier-panels.css','src/workbench.tsx','src/breaking.tsx','src/atlas.tsx'],'뉴스 패널·출처·상태 조형 개선. 자료의 근거 자격을 디자인으로 승격하지 않음.'),
 'evolution':(['src/atelier-panels.css','src/atelier-charts.css','src/evolution.tsx','src/breaking.tsx'],'진화·돌발·실제 비교 화면 스타일과 기존 조건을 보존. 학습 성능 향상 인증 아님.'),
 'interaction':(['src/atelier-layout.css','src/atlas.tsx','src/main.tsx'],'버튼·선택·재생·오류 화면. 실제 장치 반응 시간 및 조작 관찰은 미실행.'),
 'mobile':(['src/atelier-layout.css','src/atelier-brand.css'],'44px 조작·16px 입력·반응형 탐색·표 스크롤. 실제 휴대폰 통합 검수 대기.'),
 'accessibility':(['src/atelier-brand.css','src/atelier-layout.css','src/atlas.tsx','tests/atelier.test.mjs'],'키보드·대비·강제 색상·이동 감소의 코드 경계를 확인. 접근성 전체 인증은 아님.'),
 'performance':(['src/main.tsx','src/atelier-brand.css','src/atlas.tsx','scripts/drop-chunk-loader.mjs'],'기존 워커·타이머·복원 및 자료 상태 보존. 실기 성능 측정 미실행.'),
 'trust':(['src/main.tsx','src/atlas.tsx','src/breaking.tsx','src/evolution.tsx','public/downloads/ATELIER365_RELEASE.md'],'미확보·유보·보관 자료·계정 및 서버 연결 상태의 사실 표현 유지.'),
 'qa':(['reports/atelier/validation.json','reports/atelier/review.md','tests/atelier.test.mjs'],'자동 검사·보존 비교·실제 기기 확인은 구분. 과거 결과는 새 정확도 인증이 아님.'),
 'gate':(['reports/atelier/validation.json','public/downloads/ATELIER365_STATUS.json'],'개발 배포판. 픽셀·기기 검증 미완료 항목을 완료로 표시하지 않음.')}
groupkeys=list(groups)
special={
 14:'소개 문장 위계는 통일했지만 모든 문장 길이의 전수 편집은 하지 않음.',
 17:'기존 연구·사건 상태의 정확한 뜻을 보존. 전 상태명을 네 단어로 축약하지 않음.',
 43:'돌발선 색·점선·범례 적용. 모든 끝점 직접 라벨 배치는 미완료.',
 46:'새 토큰과 기존 의미 토큰 연결. 보관한 이전 CSS의 HEX를 전부 삭제하지는 않음.',
 48:'실선·점선 구별 가능. 흑백 인쇄 실물 검수는 미완료.',
 54:'모바일 일반 본문16px 정책. 실제 기기 가독성 조정은 미완료.',
 56:'현재 중요 가격 단위는 보존. 모든 가격의 숫자·원 단위 별도 DOM 분리는 미구현.',
 70:'실제 표시 서체의 0/O·1/I 판독 사용자 시험은 미실행.',
 74:'64 viewBox 마크와32 favicon 원본.24/48 별도 광학 마스터는 미제작.',
 76:'벡터 및 래스터 마크 시트 점검과 실제 디스플레이 픽셀 검수는 구분.',
 80:'단색 반전 SVG 제작. 배경별 실물 브랜드 사용 검수는 별도 필요.',
 103:'장식 인장·이중 테두리를 추가하지 않는 방향을 채택.',
 104:'스티치 장식은 데이터 판독에 이득이 없어 현 판본에는 도입하지 않음.',
 106:'질감 이미지를 추가하지 않고 단색 표면을 채택. 시각 A/B 비교는 미실행.',
 117:'모바일 헤더는 비고정으로 축소. 스크롤 상태별 동적 그림자는 미도입.',
 138:'종목별 상태 보존. 모든 탐색 경로의 이전 스크롤 위치 복원은 보장하지 않음.',
 149:'기존 종목 차트 끝값 표시 유지. 모든 다중 경로의 직접 라벨 확대는 미완료.',
 150:'데이터 좌표를 바꾸지 않았음. 끝 라벨 자동 충돌 해소 알고리즘은 추가하지 않음.',
 164:'기존 뉴스 표식과 날짜별 목록 유지. 겹친 표식의 숫자 묶음 표시는 별도 구현 필요.',
 166:'기존 툴팁 위치 처리 보존. 손가락 가림 실기 검수는 미실행.',
 174:'기존 단계 및 경제사건 식별 보존. 하나의 통합 사건 타임라인은 미구현.',
 175:'공개·관측 시각 자료 보존. 모든 목록 행에서 나란히 표시하지는 않음.',
 176:'시각 정보는 보존. 지연만 모아 보여주는 새 화면은 미구현.',
 178:'확보한 사업 연결 설명만 사용. 새 회사별 근거는 수집하지 않음.',
 189:'기존 영향순 UI와 유보 설명 보존. 이번 디자인에서 산정법은 변경하지 않음.',
 192:'뉴스 패널 위계 개선. 모든 기존 원문을 세 문단으로 재작성하지 않음.',
 216:'기존 내보내기 유지. 모든 내보내기 파일의 필드 확장은 미실행.',
 224:'불필요한 모션 축소. 팝업180~240ms 실기 지연 측정 미실행.',
 231:'슬라이더 날짜 값·aria-valuetext 유지. 손가락 위 떠 있는 라벨 미추가.',
 239:'기존 가져오기 검증 유지. 새 업로드 미리보기 대화상자는 미구현.',
 241:'320px용 제목·날짜·탐색 규칙과 정적 검사 적용. 실제 페이지 가로 넘침 측정 미실행.',
 242:'반응형 경계 구현.360/390/430px 픽셀 캡처는 미실행.',
 248:'선택 메뉴가 가로 레일 밖에 있으면 scrollLeft만 이동. 페이지 스크롤은 변경하지 않음.',
 249:'전체8개 메뉴를 가로 탐색으로 노출. 전용 양끝 스크롤 힌트는 미추가.',
 264:'실제 아이폰·안드로이드 기기에 접속할 수 없어 다운로드·확대 시험 미실행.',
 276:'반응형 코드가 존재하나200% 브라우저 실측 검사는 미실행.',
 277:'320px 대응 규칙 추가. 고배율 실제 보조기술 검수 미실행.',
 285:'기존 폼 오류 텍스트 유지. 모든 필드별 aria-describedby 연결의 전수 검수 대기.',
 290:'통일된 로딩 화면 적용. 실제 레이아웃 이동량 측정은 미실행.',
 299:'기존 리사이즈 처리 보존. 새 제한기나 계측을 추가하지 않음.',
 309:'저속 네트워크·저성능 모바일 실측은 미실행.',
 310:'배포 파일 크기는 포장 검사에 기록. 첫 조작 가능 시간 측정은 미실행.',
 325:'ZIP 종류와 목적을 안내. 앱 내 모든 다운로드의 동적 크기 표시는 미구현.',
 326:'재시도·경량/전체 안내를 제공. 실제 사용자 PC 다운로드 성공은 확인하지 못함.',
 337:'기존 design365 파일과 새 Atelier365 계획·상태를 별도 보존.',
 341:'단색·반전 SVG 및 크기별 마크 시트 보존. 실제 디스플레이 픽셀 검수는 미완료.',
 344:'실제 좌표 코드·전체 자료 불변 검사. 네 상태의 픽셀 전수 검수는 미실행.',
 345:'기존 뉴스 상태 테스트와 UI 코드 보존. 각 상태의 스크린샷 검수는 미실행.',
 346:'기존 진화 상태 테스트와 UI 코드 보존. 각 상태의 스크린샷 검수는 미실행.',
 349:'허용 브라우저에서 로컬 접근 차단. 변경 전후 실제 화면 캡처 없음.',
 350:'CSS·대비·구조 차이 검토. 픽셀 diff는 미실행.',
 355:'ZIP CRC와 번들/HTML 정적 링크를 검사. 사용자의 실제 브라우저 다운로드 시험 미실행.',
 356:'정적 복원 및 포장 구조 검사. Netlify 계정 배포/서버 자격 설정 미실행.',
 362:'초행 사용자 관찰 조사는 미실행.',
 364:'공통 토큰·마크·위계·여백을 구현. 전체 실화면 조형 최종 검수는 대기.',
 365:'데이터 보존·자동 검사 완료 후 개발 배포 ZIP 제공. 실기까지 끝난 정식 출시로 주장하지 않음.'}
items=[]
for item in plan['items']:
 n=int(item['id'][1:]);group=groupkeys[min((n-1)//24,15)];files,note=groups[group]
 code='new' if n in new else 'retained' if n in retained else 'partial' if n in partial else 'pending'
 label={'new':'신규 적용','retained':'기존 기능 유지','partial':'부분 적용·확인 필요','pending':'추가 구현·검수 대기'}[code]
 items.append({**item,'status':label,'implementation':code,'files':files,'evidence':special.get(n,note),'pixelVerified':False})
assert len(items)==365 and len({i['id'] for i in items})==365
counts=dict(collections.Counter(i['status'] for i in items))
out={'edition':'ATELIER365-8.4.0','scope':'표시 체계. 기획365개 전부 구현·검증 완료라는 뜻이 아님.','counts':counts,'pixelBrowserVerified':False,'items':items}
(root/'public/downloads/ATELIER365_STATUS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
esc=html.escape
rows=''.join(f'<article class="entry" data-kind="{i["implementation"]}"><div><span class="id">{i["id"]}</span><span class="status">{i["status"]}</span></div><h3>{esc(i["proposal"])}</h3><p>{esc(i["evidence"])}</p><small>{esc(" · ".join(i["files"]))}</small></article>' for i in items)
swatches=[('Paper','#F5F1E8'),('Porcelain','#FFFCF6'),('Ink','#2D241F'),('Saddle','#B94E20'),('Up','#9E3344'),('Down','#2B5B78')]
palette=''.join(f'<div><i style="background:{c}"></i><b>{n}</b><code>{c}</code></div>' for n,c in swatches)
mark=(root/'public/atlas-mark.svg').read_text()
page='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATLAS · ATELIER365 제작 기록</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f5f1e8;color:#2d241f;font:16px/1.8 -apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif}main{max-width:1240px;margin:auto;padding:32px 40px 80px}header{display:flex;align-items:center;gap:18px;border-bottom:1px solid #cabba8;padding-bottom:24px}header svg{width:64px;height:64px}header b{font:32px Georgia,serif;letter-spacing:.16em}header small{display:block;font-size:12px;color:#65584b}.edition{margin-left:auto;color:#97401b;font-size:12px;letter-spacing:.12em}.hero{padding:64px 0 48px;display:grid;grid-template-columns:1fr 1fr;gap:40px}h1{font-size:44px;line-height:1.35;letter-spacing:-.04em;font-weight:500;margin:8px 0 24px}h2{font-size:24px;font-weight:550}.hero p{max-width:46ch;margin:0;color:#65584b}.eyebrow{color:#97401b;letter-spacing:.13em;font-size:12px}.principles{border-left:1px solid #cabba8;padding-left:32px}.principles h2{margin:8px 0 8px}.principles p{margin-bottom:24px}.palette{display:grid;grid-template-columns:repeat(6,1fr);border-block:1px solid #cabba8;padding:28px 0;gap:16px}.palette i{display:block;height:64px;border:1px solid #cabba8;border-radius:4px}.palette b,.palette code{display:block;font-size:12px;margin-top:6px}.palette code{color:#65584b}.facts{padding:32px;background:#fffcf6;border:1px solid #cabba8;margin:32px 0;border-radius:8px}.facts p{margin:8px 0}.tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;position:sticky;top:0;background:#f5f1e8;padding:16px 0;border-block:1px solid #cabba8;z-index:1}input,select{font:inherit;font-size:16px;min-height:48px;background:#fffcf6;border:1px solid #8c7c6d;border-radius:6px;padding:10px 14px;color:#2d241f}input{flex:1;min-width:180px}a{color:#97401b;text-underline-offset:4px}a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #2b5b78;outline-offset:3px}#count{font-size:13px;color:#65584b}.entries{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}.entry{background:#fffcf6;padding:24px;border:1px solid #cabba8;border-radius:8px;min-width:0}.entry[hidden]{display:none}.entry>div{display:flex;justify-content:space-between;gap:16px;font-size:12px}.id{color:#97401b;letter-spacing:.06em}.status{color:#65584b}.entry h3{font-size:17px;line-height:1.6;font-weight:550;margin:14px 0 8px}.entry p{font-size:14px;line-height:1.85;color:#65584b}.entry small{font-size:12px;overflow-wrap:anywhere;color:#65584b}footer{margin-top:40px;padding-top:24px;border-top:1px solid #cabba8;color:#65584b;font-size:13px}@media(max-width:720px){main{padding:20px 16px 48px}.hero,.entries{grid-template-columns:1fr}.hero{padding:36px 0;gap:24px}h1{font-size:32px}.principles{border-left:0;border-top:1px solid #cabba8;padding:24px 0 0}.palette{grid-template-columns:repeat(3,1fr)}.edition{display:none}.facts{padding:20px}.entry{padding:20px}select{width:100%}}@media print{.tools{display:none}.entry{break-inside:avoid}.entries{display:block}.entry{margin-bottom:12px}}</style>
<main><header>'''+mark+'''<div><b>ATLAS</b><small>시장의 변화, 판단의 기록</small></div><span class="edition">ATELIER 365 / 8.4</span></header>
<section class="hero"><div><span class="eyebrow">DESIGN & CRAFT</span><h1>눈에 보이는 품격.<br>숫자에 남는 정직함.</h1><p>따뜻한 종이색, 절제된 잉크, 필요한 곳의 오렌지. 고유한 마크와 읽기 쉬운 비례로 시장의 변화를 관찰하는 공간을 만들었습니다.</p></div><div class="principles"><h2>그래프가 중심입니다.</h2><p>실제와 모형은 실선·점선으로 구분합니다. 뉴스와 그 이유를 그래프 가까이에서 읽고, 종목별 재생 조작을 바로 이어갑니다.</p><h2>손끝까지 같은 체계입니다.</h2><p>데스크톱의 탐색 레일, 휴대폰의 클릭 목록, 44px 조작 영역과16px 입력. 장식보다 선택과 판독을 먼저 정리했습니다.</p></div></section>
<div class="palette">'''+palette+'''</div>
<section class="facts"><h2>만든 것과 확인한 것을 구분합니다.</h2><p>색·글씨·마크·반응형 배치·차트 선·뉴스 및 진화 패널·오류 화면에 새 체계를 적용했습니다. 전체 가격 자료와 계산 엔진, 기존 발행 전망을 보존하는 릴리스 검사를 수행합니다.</p><p>365개는 제작 기획의 항목 수입니다. 모든 항목의 구현과 실기 검수가 완료됐다는 뜻이 아닙니다. 실제 브라우저 픽셀·휴대폰 검수는 접근 환경 제한으로 미완료이며, 자동 검사 결과를 예측 적중 검증으로 표시하지 않습니다.</p><p>'''+esc(' · '.join(f'{k} {v}개' for k,v in counts.items()))+'''</p><a href="ATELIER365_RELEASE.md">현재 릴리스·검사 결과</a> · <a href="ATELIER365_STATUS.json">365개 상태 원본 JSON</a></section>
<h2>365개 제작 장부</h2><div class="tools"><input id="q" aria-label="제작 항목 검색" placeholder="번호 · 키워드 검색"><select id="filter" aria-label="구현 상태"><option value="all">모든 상태</option><option value="new">신규 적용</option><option value="retained">기존 기능 유지</option><option value="partial">부분 적용·확인 필요</option><option value="pending">추가 구현·검수 대기</option></select><span id="count" role="status">365 / 365</span></div><div class="entries">'''+rows+'''</div><footer>ATLAS 고유 디자인. 실물 화면 캡처가 아닌 제작 기록 문서입니다. 실제 배포 여부와 실기 검수 여부는 릴리스 안내에서 구분합니다.</footer></main><script>const q=document.getElementById('q'),f=document.getElementById('filter'),entries=[...document.querySelectorAll('.entry')];function run(){let n=0;const term=q.value.trim().toLowerCase();for(const e of entries){const show=(f.value==='all'||e.dataset.kind===f.value)&&e.textContent.toLowerCase().includes(term);e.hidden=!show;if(show)n++;}document.getElementById('count').textContent=n+' / 365';}q.addEventListener('input',run);f.addEventListener('change',run);</script></html>'''
(root/'public/downloads/ATELIER365_RELEASE.html').write_text(page)
print(json.dumps({'items':len(items),'counts':counts},ensure_ascii=False))
