// 보드리 소개 영상(소개 쪽 영상 · 1분 · 소리 있음) — 사장님 2026-10-16(싱가포르) 20:53 「홍표라는 앵무새 이름을 보드리로 변경한다 / 그리고 아틀란스가 무엇인지 다시 파악해서
//   1분짜리 영상을 만든다 더 파타스틱하게 아주 재밌게 만든다」 · 21:00 「맞아 아주 효과적이면서 정확하개 빠르게 만든다」 · 21:35 「친구에게 보내는 거 있잖아 그거 영상 1분 짜리 만들라고 한거야
//   … 재밌는 영상 만들고 3명만 추천해도 1만원 스타벅스 준다고 대수정을 해」 · 21:39 「가」
//   옛 35초 판(홍표 · 친구 10명)은 git d4b4bed3 · 장면 열셋: 별똥별 착지 → 「보드리!」 셋 → 따라쟁이 · 「기록 없음」 → 선이 「오늘」에서 멈춤 → 격언 편지 → 다섯 탭(한눈에 · 업종 · 조건 · 급등 · 달력)
//         → 회사 모두(별비 숫자) → 일곱 계단 → 영어 → 친구 3명 → 상품권 · 앵무새는 커피 금지 · 네 거! → 받는 법 → 「보 · 드 · 리」
//   2026-10-17 15:48 「이름을 변경하자 아틀란스에서 보드리로 모두 변경해」 · 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라 현재 것만 하라」
//     = 보이는 사이트 이름은 보드리(영어 Bodri) — 편지 제목 · 휴대폰 맨 위 글자 · 영어로 뒤집는 이름 · 끝 이름 글자 셋(소리도 셋) · 「그래서<br>지난 기록만」
//     · 편지 · 상품권 줄은 지금 화면 site/next/app.js 에서 읽음(옛 site/atlas/atlas.js 는 손대지 않음 · 계단 · 급등 · 조건 · 탭 이름만 읽기)
//   node scripts/atlas11/makbi/video.mjs        → site/media/makbi-intro.mp4 · makbi-intro.webm · makbi-poster.jpg (파일 이름은 그대로 — 사이트 고리를 안 바꿈)
//   HP_T=1.2,2.4 HP_OUT=폴더 → 그 때의 그림만 PNG 로(확인용) · HP_NEWS=1 → 7단이 「뉴스 · 공시」일 때 그림 미리 보기(확인용만)
//   숫자 · 이름은 사이트 파일에서 읽음(박지 않음): 계단 이름 atlas.js LV · 탭 이름 index.html · 급등 칸 SV_TABS · 조건 칸 CD_SLOTS · 편지 제목 · 첫 격언 HELLO_MSG · 친구 수 HELLO_PROMO(next/app.js)
//     · 회사 수 · 기준일 · 업종 수 core.json · 지수 선 home.json · 문자 번호 hello.html
//   스스로 막는 문: 위 값이 없거나 꼴이 다르면 멈춤 · 그린 글에 옛 이름(홍표 · 막비 · 아틀란스 · ATLAS) · 옛 상품권 글 · 옛 친구 수가 나오면 멈춤 · 다 만든 뒤 길이 60초(±0.05)가 아니면 멈춤
//   남의 캐릭터 모양 없음 · 사람 얼굴 없음 · 가게 표시 없음 · 내일 맞히기 없음 · 회사 이름 없음 · 소리는 sound.py 가 계산으로 만듦(남의 음악 · 목소리 없음)
//   그림 조각은 draw.mjs 한 벌(makbi · hongpyo — 함수 이름은 속 이름 · 화면에 안 보임) — 이 화면에는 draw.mjs 글을 그대로 넣음
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..');
const OUT = process.env.HP_OUT ?? path.join(ROOT, 'site/media');
const TMP = process.env.HP_TMP ?? '/tmp/makbi-video';
const ONLY = process.env.HP_T ? process.env.HP_T.split(',').map(Number) : null;
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const exe = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const drawSrc = (await fs.readFile(path.join(HERE, 'draw.mjs'), 'utf8')).replace(/^export /gm, '');
const W = 720, H = 1280, FPS = 30, DUR = 60;
await fs.mkdir(OUT, {recursive: true});

// ── 사이트 사실 읽기(박지 않음) ──
const stop = m => { console.error('멈춤: ' + m); process.exit(1); };
const rd = p => fs.readFile(path.join(ROOT, p), 'utf8');
const AJS = await rd('site/atlas/atlas.js'), IDXH = await rd('site/atlas/index.html'), HELLO = await rd('site/hello.html');
const NJS = await rd('site/next/app.js'); // 지금 화면(보드리) — 편지 · 상품권 줄
import {NAME, NAME_EN} from '../../../site/next/brand.js'; // 보이는 사이트 이름 = 이름 한 곳(규칙 76 · 2026-10-17 「아틀란스에서 보드리로」 → 「보드리를 고도리로」) — 편지 제목과 맞대 봄
const lit = (re, what, src = AJS) => { const m = src.match(re); if (!m) stop(what + ' 못 찾음'); return JSON.parse(m[1].replace(/'/g, '"')); };
const LV = lit(/const LV = (\[[^\]]*\]);/, '계단 이름 LV');
if (LV.length !== 7) stop('계단이 일곱이 아님');
const NEWS = process.env.HP_NEWS === '1' ? (ONLY ? true : stop('HP_NEWS 는 미리 보기만')) : /뉴스/.test(LV[6]);
if (process.env.HP_NEWS === '1') LV[6] = '뉴스 · 공시';
const MSG = lit(/const HELLO_MSG = (\[.*?\]);/s, '편지 HELLO_MSG(next/app.js)', NJS);
if (MSG[0] !== NAME + ' 주식 격언 열 가지' || MSG.length !== 11) stop('편지 제목 · 줄 수가 다름: ' + MSG[0] + ' · ' + MSG.length + '줄');
const MAX1 = MSG[1].replace(/^1\.\s*/, '').match(/^[^.]*\./)?.[0];
if (!MAX1) stop('첫 격언 꼴이 다름');
const MAXW = MSG.slice(1).map(s => s.replace(/^\d+\.\s*/, '').length);
const SV = lit(/const SV_TABS = (\[.*?\]);/, '급등 칸 SV_TABS').map(x => x[1]);
const CD = [...AJS.matchAll(/\{k: '[abc]', name: '([^']+)'/g)].map(m => m[1]);
if (CD.length !== 3) stop('조건 칸이 셋이 아님');
const PROMO = NJS.match(/const HELLO_PROMO = '([^']+)'/)?.[1] ?? stop('HELLO_PROMO(next/app.js) 못 찾음');
const FR = Number(PROMO.match(/(\d+)명만/)?.[1] ?? stop('친구 수 못 찾음'));
if (!(FR >= 1 && FR <= 5)) stop('친구 수 ' + FR + ' — 하나 둘 셋 셈 그림은 다섯까지');
const PHONE = HELLO.match(/문자 보내기 (010-\d{4}-\d{4})/)?.[1] ?? stop('문자 번호 못 찾음');
const TABS = [...(IDXH.match(/<nav class="tabbar"[\s\S]*?<\/nav>/)?.[0] ?? '').matchAll(/id="tab\w+">([^<]+)<\/a>/g)].map(m => m[1]);
if (TABS.join() !== '한눈에,업종,조건,급등,달력') stop('아래 탭이 바뀜: ' + TABS.join());
const core = JSON.parse(await rd('site/atlas/data/core.json')), home = JSON.parse(await rd('site/atlas/data/home.json'));
const NCO = core.mkt?.n, IND = Array.isArray(core.industries) ? core.industries.length : Object.keys(core.industries ?? {}).length;
if (!(NCO > 1000) || !(IND > 10) || !/^\d{4}-\d{2}-\d{2}$/.test(core.asOf ?? '')) stop('core.json 회사 수 · 업종 수 · 기준일');
const ASOF = `${+core.asOf.slice(5, 7)}월 ${+core.asOf.slice(8, 10)}일`;
const closes = k => (home.idx?.[k]?.rows ?? []).map(r => Array.isArray(r) ? r[1] : (r.c ?? r.close)).filter(Number.isFinite);
const K1 = closes('KOSPI'), K2 = closes('KOSDAQ');
if (K1.length < 40 || K2.length < 40) stop('home.json 지수 선이 짧음');
const COUNT = ['하나', '둘', '셋', '넷', '다섯'].slice(0, FR).join(' ');
const NM = [...NAME]; // 끝 이름 글자(하나씩 쾅 — 소리도 같은 수 · sound.py HP_NM)
const D = {TABS, LV, NEWS, MAX1, MAXW, SV, CD, FR, PHONE, NCO, IND, ASOF, K1: K1.slice(-60), K2: K2.slice(-60), KM: K1.slice(-21), COUNT, TITLE: MSG[0], NAME, NAME_EN, NM};
console.log('사실', JSON.stringify({LV7: LV[6], NEWS, MAX1, SV, CD, FR, NCO, IND, ASOF, k1: K1.length, TITLE: MSG[0], NM}));

const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/site/atlas/fonts.css"><style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:#0C0E12;font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;-webkit-font-smoothing:antialiased;color:#F2EFE8;position:relative}
#cam{position:absolute;inset:0;transform-origin:50% 55%}#st,#top{position:absolute;inset:0;width:${W}px;height:${H}px}#ov{position:absolute;inset:0}
.t{position:absolute;white-space:nowrap;font-weight:800;text-align:center;transform:translate(-50%,-50%);line-height:1.15}
.l{text-align:left;transform:translate(0,-50%)}
.hud{color:#BFFFF4;text-shadow:0 0 12px rgba(80,240,210,.85),0 0 2px #07080B;font-weight:800;letter-spacing:1px}
.bub{position:absolute;background:#fff;color:#0C0E12;font-weight:800;font-size:40px;padding:14px 28px;border-radius:30px;white-space:nowrap;transform:translate(-50%,-50%)}
.bub.g{background:rgba(19,22,28,.8);color:#E8FFFA;border:3px solid #7FFFE6;box-shadow:0 0 22px rgba(127,255,230,.5)}
#cap{position:absolute;left:24px;right:24px;top:990px;height:156px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:54px;font-weight:800;line-height:1.24;letter-spacing:-.5px;color:#fff;text-shadow:0 0 20px rgba(127,255,230,.45),0 3px 0 #07080B,0 0 5px #07080B,0 0 2px #07080B}
#band{position:absolute;left:18px;right:18px;top:1170px;padding:8px 8px;border-radius:24px;background:linear-gradient(100deg,#E9B949 0%,#FFE3A0 50%,#E9B949 100%);background-size:220% 100%;color:#0C0E12;text-align:center;font-weight:800;line-height:1.18;opacity:0;box-shadow:0 0 26px rgba(233,185,73,.45)}
#band b{display:block;font-size:33px;white-space:nowrap;letter-spacing:-.5px}#band span{display:block;font-size:30px}
#pc{position:absolute;left:40px;right:40px;top:1146px;padding:6px 10px;border-radius:22px;border:3px solid #E9B949;background:rgba(12,14,18,.94);text-align:center;font-weight:800;line-height:1.12;opacity:0;box-shadow:0 0 30px rgba(233,185,73,.4)}
#pc i{display:block;font-style:normal;font-size:30px;color:#F2EFE8}#pc b{display:block;font-size:38px;color:#FFD98A;white-space:nowrap}#pc span{display:block;font-size:30px;color:#F2EFE8}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
</style><body><div id="cam"><svg id="st" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"></svg><div id="ov"></div><svg id="top" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"></svg></div>
<div id="cap"></div><div id="band"><b>친구 ${FR}명만 소개해도 스타벅스 상품권 1만원!</b><span>문자 ${PHONE}</span></div>
<div id="pc"><i>친구 ${FR}명만 소개해도</i><b>스타벅스 상품권 1만원!</b><span>문자 ${PHONE}</span></div><div id="flash"></div>
<script>${drawSrc}
const D=${JSON.stringify(D)};
let sd=11; const R=()=>((sd=(sd*1103515245+12345)%2147483648)/2147483648);
const STARS=Array.from({length:120},()=>[R()*720,R()*1000,.7+R()*2,R()*6.28]);
const BOKEH=Array.from({length:9},()=>[R()*720,180+R()*900,34+R()*60,R()*6.28,R()<.6?'#2FB89F':'#E9B949']);
const SP=Array.from({length:48},()=>[R()*6.283,.45+R()*.9,1.5+R()*3.5,R()]);
const RAIN=Array.from({length:260},()=>[R()*720,-40-R()*700,R()*6.283,R()*150,R()]);
const ROWS=[[.8,0],[-.3,1],[1.6,2],[.2,3],[-.9,4]].map(([v,i])=>[v,Array.from({length:12},(_,j)=>j/11*v+(R()-.5)*.5)]);
const DOTS=[12,18,23,27,33,38,44,15];
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), ease=x=>1-Math.pow(1-cl(x),3), easeIn=x=>Math.pow(cl(x),2.2), eio=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const back=x=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, win=(t,a,b)=>cl((t-a)/(b-a)), pulse=(t,a,d)=>{const x=(t-a)/d;return x<0||x>1?0:Math.sin(Math.PI*x)};
const fade=(t,a,b,fi=.3,fo=.3)=>Math.max(0,Math.min(win(t,a,a+fi),1-win(t,b-fo,b)));
const lerp=(a,b,x)=>a+(b-a)*x, f1=x=>x.toFixed(1), f2=x=>x.toFixed(2);
const UP='#FF5A65',DN='#5B96FF',GOLD='#E9B949',INK='#F2EFE8',SUB='#B0B5BD',MUTE='#8E959F',CARD='#13161C',CY='#7FFFE6';
const DEFS='<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171A22"/><stop offset=".55" stop-color="#0C0E12"/><stop offset="1" stop-color="#07080B"/></linearGradient>'
 +'<filter id="gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
 +'<filter id="gl2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
 +'<filter id="bk" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>'
 +'<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".25" stop-color="#BFFFF4"/><stop offset=".6" stop-color="#2EC4B6"/><stop offset="1" stop-color="#2EC4B6" stop-opacity="0"/></linearGradient>'
 +'<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FFFF0"/><stop offset=".5" stop-color="#2FCFB8"/><stop offset="1" stop-color="#0E6E68"/></linearGradient>'
 +'<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3A0"/><stop offset=".5" stop-color="#E9B949"/><stop offset="1" stop-color="#C4952F"/></linearGradient>'
 +'<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
 +'<radialGradient id="aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7FFFE6" stop-opacity=".55"/><stop offset=".55" stop-color="#2FB89F" stop-opacity=".18"/><stop offset="1" stop-color="#2FB89F" stop-opacity="0"/></radialGradient>'
 +'<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FBFA"/><stop offset=".45" stop-color="#B4CDCB"/><stop offset="1" stop-color="#6E8B89"/></linearGradient>'
 +'<radialGradient id="moonglow" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#F2EFE8" stop-opacity=".26"/><stop offset="1" stop-color="#F2EFE8" stop-opacity="0"/></radialGradient></defs>';
const T=(x,y,size,txt,cls,op,extra)=>op<=.003?'':'<div class="t '+(cls||'')+'" style="left:'+f1(x)+'px;top:'+f1(y)+'px;font-size:'+size+'px;opacity:'+f2(op)+';'+(extra||'')+'">'+txt+'</div>';
const BUB=(x,y,txt,op,glass,size,sc)=>op<=.003?'':'<div class="bub'+(glass?' g':'')+'" style="left:'+f1(x)+'px;top:'+f1(y)+'px;font-size:'+(size||40)+'px;opacity:'+f2(op)+';transform:translate(-50%,-50%) scale('+f2(sc==null?1:sc)+')">'+txt+'</div>';
const GLOW='color:#FFD98A;font-weight:900;text-shadow:0 0 16px rgba(233,185,73,.8)';
const panel=(x,y,w,h,op,c)=>op<=.003?'':'<g opacity="'+f2(op)+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="22" fill="rgba(19,22,28,.86)" stroke="'+(c||CY)+'" stroke-width="2.5" filter="url(#gl)"/>'
 +'<path d="M'+(x+10)+' '+(y+44)+' v-34 h34 M'+(x+w-44)+' '+(y+10)+' h34 v34 M'+(x+w-10)+' '+(y+h-44)+' v34 h-34 M'+(x+44)+' '+(y+h-10)+' h-34 v-34" fill="none" stroke="'+(c||'#BFFFF4')+'" stroke-width="5" stroke-linecap="round"/></g>';
const sparkle=(x,y,r,c,op)=>op<=.003?'':'<path d="M'+x+' '+(y-r)+' Q'+(x+r*.16)+' '+(y-r*.16)+' '+(x+r)+' '+y+' Q'+(x+r*.16)+' '+(y+r*.16)+' '+x+' '+(y+r)+' Q'+(x-r*.16)+' '+(y+r*.16)+' '+(x-r)+' '+y+' Q'+(x-r*.16)+' '+(y-r*.16)+' '+x+' '+(y-r)+' Z" fill="'+(c||'#FFE3A0')+'" opacity="'+f2(op==null?1:op)+'" filter="url(#gl)"/>';
const burst=(cx,cy,t0,t,dur,n,c,dist)=>{const u=win(t,t0,t0+dur);if(u<=0||u>=1)return '';let s='';for(let i=0;i<n;i++){const [a,sp,r]=SP[i%SP.length],d=(dist||220)*sp*ease(u),x=cx+Math.cos(a+i)*d,y=cy+Math.sin(a+i)*d;s+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*(1-u*.6))+'" fill="'+(c||'#BFFFF4')+'" opacity="'+f2(1-u)+'" filter="url(#gl)"/>';}return s;};
const ring=(cx,cy,t0,t,dur,r0,r1,c,sw,ry)=>{const u=win(t,t0,t0+dur);if(u<=0||u>=1)return '';const r=lerp(r0,r1,ease(u));return '<ellipse cx="'+f1(cx)+'" cy="'+f1(cy)+'" rx="'+f1(r)+'" ry="'+f1(r*(ry||1))+'" fill="none" stroke="'+(c||'#BFFFF4')+'" stroke-width="'+f1((sw||6)*(1-u))+'" opacity="'+f2(1-u)+'" filter="url(#gl)"/>';};
const shake=(t,t0,d,a)=>t>=t0&&t<t0+d?'translate('+f1(Math.sin(t*93)*a*(1-win(t,t0,t0+d)))+'px,'+f1(Math.cos(t*79)*a*(1-win(t,t0,t0+d)))+'px)':'';
// 값 줄 → 선(앞에서부터 frac 만큼) — 끝 점도 돌려줌
const lineOf=(v,x0,x1,y0,y1,frac)=>{const lo=Math.min(...v),hi=Math.max(...v),n=v.length,m=Math.max(1,frac*(n-1));let p='',hx=x0,hy=y1;
 for(let i=0;i<=Math.floor(m);i++){hx=x0+(x1-x0)*i/(n-1);hy=y1-(y1-y0)*(v[i]-lo)/((hi-lo)||1);p+=(i?' L':'M')+f1(hx)+' '+f1(hy);}
 const fi=Math.floor(m);if(fi<n-1&&m>fi){const k=m-fi,xa=x0+(x1-x0)*fi/(n-1),xb=x0+(x1-x0)*(fi+1)/(n-1),ya=y1-(y1-y0)*(v[fi]-lo)/((hi-lo)||1),yb=y1-(y1-y0)*(v[fi+1]-lo)/((hi-lo)||1);hx=lerp(xa,xb,k);hy=lerp(ya,yb,k);p+=' L'+f1(hx)+' '+f1(hy);}
 return {p,hx,hy};};
const comet=(hx,hy,vx,vy,r,op)=>{if(op<=.01)return '';const L=Math.hypot(vx,vy)||1,ux=vx/L,uy=vy/L;let s='<g opacity="'+f2(op)+'">';
 for(let i=16;i>=1;i--){const d=i*r*1.7,rr=r*(1-i/18);s+='<circle cx="'+f1(hx-ux*d)+'" cy="'+f1(hy-uy*d)+'" r="'+f1(Math.max(1.2,rr))+'" fill="'+CY+'" opacity="'+f2(.6*(1-i/17))+'"/>';}
 return s+'<circle cx="'+f1(hx)+'" cy="'+f1(hy)+'" r="'+f1(r*2.4)+'" fill="url(#aura)"/><circle cx="'+f1(hx)+'" cy="'+f1(hy)+'" r="'+f1(r)+'" fill="#fff" filter="url(#gl2)"/></g>';};
// 먹 붓 쓸기(장면 바뀜) — tc 에 화면을 다 덮음
const brush=(t,tc)=>{const u=win(t,tc-.42,tc+.42);if(u<=0||u>=1)return '';const x0=lerp(-1650,820,u);let a='',b='';
 for(let i=0;i<=16;i++){const y=-20+i*82;a+=(i?' L':'M')+f1(x0+1480+((i*37)%5)*22-40)+' '+y;b=' L'+f1(x0+((i*53)%7)*18)+' '+y+b;}
 let s='<path d="'+a+b+' Z" fill="#07080B"/>';for(let i=0;i<7;i++)s+='<rect x="'+f1(x0+120+i*190)+'" y="'+(80+((i*211)%900))+'" width="'+(260+(i%3)*90)+'" height="'+(3+i%3)+'" rx="2" fill="rgba(242,239,232,.07)"/>';return s;};
function hudFrame(op){if(op<=.01)return '';let s='<g opacity="'+f2(op)+'" fill="none" stroke="'+CY+'" stroke-width="2.5" filter="url(#gl)"><path d="M40 250 Q360 118 680 250"/><path d="M70 936 Q360 998 650 936" opacity=".6"/><path d="M30 92 v-52 h52 M690 92 v-52 h-52 M30 892 v52 h52 M690 892 v52 h-52" stroke-width="4"/>';
 for(let i=0;i<=12;i++){const u=i/12,x=40+640*u,y=250-2*132*u*(1-u);s+='<path d="M'+f1(x)+' '+f1(y)+' l0 '+(i%3?8:16)+'" stroke-width="2"/>';}return s+'</g>';}
// 휴대폰 틀(16 ~ 28.9초) — 들어옴 · 나감
const phoneY=t=>t<16.5?(1-back(win(t,16.0,16.5)))*1050:0, phoneOut=t=>ease(win(t,28.5,28.9));
const TAB_SW=[18.5,21,23.5,26], tabX=k=>128+116*k;
// ── 골똘이 자리 · 몸짓(때마다 · 곧은 시계 하나) ──
function bd(t){const o={tilt:-7,blink:0,wingL:0,wingR:0,crestUp:.35,beakOpen:0,visor:0,vs:1,flame:0,glowWing:0,visorOff:0,glasses:0};let X=150,Y=470,S=1.75,sx=1,sy=1,show=1;
 o.blink=Math.max(pulse(t,5.3,.22),pulse(t,10.5,.2),pulse(t,14.1,.2),pulse(t,30.0,.2),pulse(t,39.1,.2),pulse(t,50.4,.2),pulse(t,58.9,.22));
 const feet=(cx,cy,s)=>{S=s;X=cx-120*s;Y=cy-252*s;};
 if(t<3){show=t>=1.45?1:0;o.visor=1;o.flame=t<1.9?1:1-win(t,1.9,2.4);o.glowWing=t<2.2?.9:.9*(1-win(t,2.2,2.9));o.wingL=o.wingR=t<1.9?.3:.3*(1-win(t,1.9,2.3));
  const q=pulse(t,1.45,.42);sy=1-.17*q;sx=1+.13*q;o.tilt=-9;o.crestUp=Math.max(pulse(t,1.6,.8),t>2.2?.6:0);}
 else if(t<6){o.visor=1-eio(win(t,3.0,3.35));o.glowWing=pulse(t,3.2,.55)*.9;o.flame=pulse(t,3.4,.35)*.8;
  for(const a of [3.5,4.0,4.5]){const p=pulse(t,a,.42);if(p>0){o.beakOpen=Math.max(o.beakOpen,p*.9);o.tilt=-9+8*p;o.crestUp=Math.max(o.crestUp,.6+.4*p);sy*=1+.05*p;}}
  if(t>=4.95){o.crestUp=.6;o.tilt=-7+3*Math.sin((t-4.95)*3);}}
 else if(t<9){if(t>=6.85&&t<7.75){o.beakOpen=Math.abs(Math.sin((t-6.9)*13))*.85;o.tilt=-14;}
  if(t>=8.1){const p=pulse(t,8.1,.75);o.wingL=o.wingR=.5*p;sy=1-.07*p;o.tilt=-7+12*p;o.crestUp=.15;}}
 else if(t<12){const g=eio(win(t,9.0,9.45));X=lerp(150,30,g);Y=lerp(470,640,g);S=lerp(1.75,1.05,g);
  o.beakOpen=pulse(t,9.7,.35)*.75;o.crestUp=.5+.5*pulse(t,9.7,.5);o.tilt=t>=11.0?-4+16*ease(win(t,11.0,11.3)):-4;}
 else if(t<16){X=-10;Y=690;S=.95;o.glasses=1;o.crestUp=.4;let nod=0;for(let i=0;i<10;i++)nod=Math.max(nod,pulse(t,13.2+i*.25,.22));o.tilt=-7+9*nod;
  if(t>=15.0){o.beakOpen=t<15.85?Math.abs(Math.sin((t-15.05)*12))*.75:0;o.crestUp=.9;o.tilt=-12;}}
 else if(t<28.5){const py=phoneY(t);let k=0,u=-1;for(let i=0;i<4;i++){if(t>=TAB_SW[i])k=i+1;if(t>=TAB_SW[i]-.45&&t<TAB_SW[i]){k=i;u=win(t,TAB_SW[i]-.45,TAB_SW[i]);}}
  if(t<16.6){const g=eio(win(t,16.0,16.6));feet(lerp(104,tabX(0),g),lerp(929,820+py,g)-Math.sin(Math.PI*g)*160,lerp(.95,.42,g));o.flame=1;o.wingL=o.wingR=.35;}
  else if(u>=0){feet(lerp(tabX(k),tabX(k+1),u),820-Math.sin(Math.PI*u)*80,.42);o.flame=.5+.5*Math.sin(Math.PI*u);o.wingL=o.wingR=.35;o.crestUp=.9;}
  else{feet(tabX(k),820,.42);o.tilt=-6+5*Math.sin(t*2.3);o.crestUp=.6;}}
 else if(t<31.5){if(t<29.05){const g=eio(win(t,28.5,29.05));feet(lerp(tabX(4),566,g),lerp(820,930,g)-Math.sin(Math.PI*g)*120,lerp(.42,.8,g));o.flame=1;o.wingL=o.wingR=.35;}
  else{const j=pulse(t,30.55,.5);feet(566,930-60*j,.8);o.wingL=o.wingR=.8*j;o.crestUp=.5+.5*j;o.tilt=-8+6*Math.sin((t-29)*2);o.beakOpen=pulse(t,30.6,.4)*.6;}}
 else if(t<38){const cxs=j=>112+84*j,tops=j=>900-(j+1)*70,L=k=>31.9+k*.45;
  if(t<31.9){const g=eio(win(t,31.5,31.9));feet(lerp(566,cxs(0),g),lerp(930,tops(0),g)-Math.sin(Math.PI*g)*90,lerp(.8,.5,g));o.flame=1;o.wingL=o.wingR=.35;}
  else if(t<34.6){const k=Math.min(6,Math.floor((t-31.9)/.45)),u=win(t,L(k),L(k)+.45);if(k>=6)feet(cxs(6),tops(6),.5);else{feet(lerp(cxs(k),cxs(k+1),u),lerp(tops(k),tops(k+1),u)-Math.sin(Math.PI*u)*60,.5);o.flame=.55+.45*Math.sin(Math.PI*u);}
   o.wingL=o.wingR=.35;o.glowWing=.7;o.crestUp=.8;o.tilt=-4;}
  else if(t<34.95){feet(cxs(6),tops(6),.5);const p=pulse(t,34.6,.35);o.wingL=o.wingR=.9*p;o.crestUp=1;o.glowWing=1;sy=1+.08*p;}
  else{const g=eio(win(t,34.95,35.45));feet(lerp(cxs(6),550,g),lerp(tops(6),830,g)-Math.sin(Math.PI*g)*80,lerp(.5,1.0,g));o.glasses=t>=35.3?1:0;o.crestUp=.5;o.flame=g<1?.6:0;
   if(t>=35.45){let nod=0;for(let i=0;i<7;i++)nod=Math.max(nod,pulse(t,35.1+i*.18,.2));o.tilt=-7+6*nod;}
   if(t>=36.6){const p=pulse(t,36.6,.6);o.wingL=o.wingR=.55*p;o.crestUp=.6+.4*p;o.beakOpen=pulse(t,36.7,.4)*.6;}}}
 else if(t<41){const g=eio(win(t,38.0,38.4));feet(lerp(550,520,g),lerp(830,902,g),1.0);o.crestUp=t>=39.4?.5+.5*pulse(t,39.4,.6):.4;
  if(t>=40.0&&t<40.75){o.beakOpen=Math.abs(Math.sin((t-40.05)*12))*.85;o.tilt=-13;}}
 else if(t<44.5){const g=eio(win(t,41.0,41.4));feet(lerp(520,324,g),lerp(902,885,g),lerp(1.0,1.45,g));o.crestUp=.5;
  for(let i=0;i<D.FR;i++){const p=pulse(t,41.5+i*.6,.4);if(p>0){sy=1-.08*p;sx=1+.06*p;o.crestUp=.6+.4*p;o.beakOpen=p*.5;}}
  if(t>=43.1&&t<43.75){const p=ease(win(t,43.1,43.25));o.tilt=-7+21*p;o.crestUp=1;o.wingL=o.wingR=.6*p;o.blink=0;sy=1+.06*p;}
  if(t>=43.75){o.tilt=-7+6*Math.sin((t-43.75)*9);o.wingL=o.wingR=.4;o.glowWing=.8;o.crestUp=.9;}}
 else if(t<49.6){const g=eio(win(t,44.5,44.9));X=lerp(150,40,g);Y=lerp(520,560,g);S=lerp(1.45,1.4,g);o.crestUp=.7;o.wingL=o.wingR=.25*pulse(t,44.7,1.2);
  if(t>=46.25&&t<46.65)o.tilt=-7+12*ease(win(t,46.25,46.6));
  if(t>=46.65&&t<47.6){const j=pulse(t,46.65,.6);Y-=60*j;X-=24*j;o.tilt=16;o.crestUp=1;o.wingL=.5;o.blink=0;}
  if(t>=47.6&&t<48.25){o.tilt=8;o.crestUp=.3;}
  if(t>=48.25){o.wingR=.85*ease(win(t,48.25,48.55));o.tilt=-10;o.beakOpen=pulse(t,48.4,.7)*.6;}}
 else if(t<54){const g=eio(win(t,49.6,50.0));X=lerp(40,470,g);Y=lerp(560,660,g);S=lerp(1.4,.8,g);o.crestUp=.6;
  for(let i=0;i<3;i++){const p=pulse(t,50.0+i*.7,.5);if(p>0){o.wingL=.6*p;o.tilt=-10*p-4;}}
  if(t>=52.0){o.beakOpen=pulse(t,52.05,.5)*.6;o.crestUp=.6+.4*pulse(t,52.0,.6);}}
 else{if(t<54.6){const u=easeIn(win(t,54.05,54.6));X=470;Y=660-u*1250;S=.8;o.flame=1;o.wingL=o.wingR=.35;o.glowWing=.9;sy=1+.12*u;}
  else if(t<56.8)show=0;
  else{const g=ease(win(t,56.8,57.35));X=216;Y=lerp(-520,530,g);S=1.2;o.flame=t<57.45?1:.4+.1*Math.sin(t*9);o.glowWing=.8;o.wingL=.25;o.wingR=t>57.5?.6+.3*Math.sin((t-57.5)*7):.25;o.crestUp=.8;o.tilt=-9;
   o.beakOpen=Math.max(pulse(t,57.3,.25),pulse(t,57.65,.25))*.6;const q=pulse(t,57.35,.35);sy=1-.1*q;sx=1+.08*q;}}
 return {o,X,Y,S,sx,sy,show};}
const CAP=[[1.7,3.0,'쾅! 누구지?'],[3.2,6.0,'안녕! 나는<br>골똘이야'],[6.2,9.0,'들은 말만<br>따라 해'],[9.2,12.0,'그래서<br>지난 기록만'],
 [12.2,16.0,'첫 화면엔<br>격언 열 가지'],[16.2,18.5,'한눈에 보는<br>오늘 시장'],[18.7,21.0,'업종 '+D.IND+'개<br>줄 세우기'],[21.2,23.5,'조건 세 개로<br>거르기'],
 [23.7,26.0,'5일 동안<br>많이 오른 곳'],[26.2,28.5,'날마다<br>달력에 기록'],[28.7,31.5,'코스피 코스닥<br>회사 모두'],[31.7,34.9,'누를수록 자세히<br>일곱 계단'],
 [35.0,38.0,D.NEWS?'끝 계단엔<br>뉴스와 공시':'회사 '+D.NCO.toLocaleString('ko-KR')+'곳<br>모두 일곱 계단'],[38.2,41.0,'영어로도<br>봐요'],[41.1,43.1,'친구 '+D.FR+'명만<br>소개하면'],[43.2,44.5,D.COUNT+'<br>벌써 끝!'],
 [44.6,46.5,'스타벅스 상품권<br>1만원!'],[46.6,48.3,'앵무새는<br>커피 못 마셔'],[48.4,49.6,'그러니까<br>네 거!'],[49.7,54.0,'찍어서 문자<br>주면 끝!'],[57.0,59.8,'짹! 같이<br>보러 가자!']];
window.render=t=>{let s=DEFS,o='',tp='',cam='',fl=0;
 // 배경 — 먹빛 밤하늘 · 흐린 빛 방울 · 별 · 달 · 빛줄기
 s+='<rect width="720" height="1280" fill="url(#bg)"/>';
 s+=BOKEH.map(([x,y,r,p,c])=>'<circle cx="'+f1(x+Math.sin(t*.3+p)*34)+'" cy="'+f1(y+Math.cos(t*.25+p)*22)+'" r="'+f1(r)+'" fill="'+c+'" opacity="'+(.06+.035*Math.sin(t*.9+p)).toFixed(3)+'" filter="url(#bk)"/>').join('');
 s+=STARS.map(([x,y,r,p])=>'<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r)+'" fill="#fff" opacity="'+f2(.18+.5*(.5+.5*Math.sin(t*2.1+p)))+'"/>').join('');
 const mo=1-fade(t,9.2,54.4,.4,.4);if(mo>.01)s+='<g opacity="'+f2(mo)+'"><circle cx="600" cy="140" r="110" fill="url(#moonglow)"/><circle cx="600" cy="140" r="54" fill="'+INK+'"/><circle cx="584" cy="128" r="8" fill="#DDD8CD"/><circle cx="614" cy="156" r="5.5" fill="#DDD8CD"/></g>';
 s+='<g opacity=".05"><path d="M'+f1(-200+((t*40)%900))+' 0 l220 0 l-420 1280 l-220 0 z" fill="#BFFFF4"/><path d="M'+f1(300+((t*28)%900))+' 0 l120 0 l-420 1280 l-120 0 z" fill="#BFFFF4"/></g>';
 const st=bd(t),O=st.o;
 // ── 1장면 별똥별인 줄 알았는데 — 쾅! 착지 ──
 if(t<3){if(t>=.1&&t<.95){const u=win(t,.1,.9);s+=comet(lerp(790,-90,u),lerp(110,330,u)-Math.sin(u*Math.PI)*50,-880,220,12,1-win(t,.86,.95));}
  if(t>=.9&&t<1.47){const u=easeIn(win(t,.9,1.45)),a=[-90,430],c=[120,1000],b=[360,700],x=(1-u)*(1-u)*a[0]+2*(1-u)*u*c[0]+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*(1-u)*u*c[1]+u*u*b[1],dx=2*(1-u)*(c[0]-a[0])+2*u*(b[0]-c[0]),dy=2*(1-u)*(c[1]-a[1])+2*u*(b[1]-c[1]);
   s+=comet(x,y,dx,dy,lerp(5,70,u*u),1);}
  fl=pulse(t,1.43,.4)*.95;cam=shake(t,1.45,.5,20);
  if(t>=1.45){for(let i=0;i<9;i++){const a=SP[i][0],u=win(t,1.45+i*.03,2.95),d=60+150*ease(u)*SP[i][1],r=30+85*ease(u);s+='<circle cx="'+f1(360+Math.cos(a)*d)+'" cy="'+f1(905+Math.sin(a)*d*.35-40*u)+'" r="'+f1(r)+'" fill="#8E959F" opacity="'+f2(.32*(1-u))+'" filter="url(#bk)"/>';}
   s+=ring(360,912,1.45,t,.75,30,340,'#BFFFF4',10,.22)+ring(360,914,1.5,t,.9,20,260,GOLD,6,.2)+burst(360,880,1.45,t,.9,32,'#BFFFF4',320);}
  s+=hudFrame(fade(t,1.7,3.3,.3,.3));o+=T(360,215,38,'정체 확인 중…','hud',fade(t,1.85,3.05,.15,.2));
  for(let i=0;i<6;i++)s+=sparkle(120+i*96,300+((i*67)%3)*18,7,'#BFFFF4',pulse(t,1.75+i*.17,.3));}
 // ── 2장면 반짝 점검 · 「골똘이!」 세 번 ──
 else if(t<6){s+=hudFrame(1-win(t,3.0,3.4));s+=ring(360,660,3.0,t,.5,40,200,'#BFFFF4',6);s+=sparkle(232,800,16,'#fff',pulse(t,3.18,.4))+sparkle(492,800,16,'#fff',pulse(t,3.26,.4));
  const a4=fade(t,3.4,6.1,.4,.25);if(a4>0)s+='<g opacity="'+f2(a4*.5)+'" transform="rotate('+f1(t*14)+' 360 659)"><circle cx="360" cy="659" r="262" fill="none" stroke="'+CY+'" stroke-width="2.5" stroke-dasharray="24 14"/></g><g opacity="'+f2(a4*.35)+'" transform="rotate('+f1(-t*20)+' 360 659)"><circle cx="360" cy="659" r="292" fill="none" stroke="'+GOLD+'" stroke-width="2" stroke-dasharray="6 18"/></g>';
  [[3.5,190,450,46],[4.0,532,410,52],[4.5,360,300,64]].forEach(([a5,x,y,sz])=>{const op=fade(t,a5,6.0,.1,.25);if(op>0)o+='<div class="bub" style="left:'+x+'px;top:'+y+'px;font-size:'+sz+'px;opacity:'+f2(op)+';border:3px solid '+CY+';box-shadow:0 0 22px rgba(127,255,230,.6);transform:translate(-50%,-50%) scale('+f2(.6+.4*back(win(t,a5,a5+.25)))+')">골똘이!</div>';s+=ring(x,y,a5,t,.45,10,110,'#FFE3A0',5);});}
 // ── 3장면 따라쟁이 — 「기록 없음」 도장 ──
 else if(t<9){const a1=fade(t,6.15,8.95,.25,.3),a2=fade(t,6.85,8.95,.2,.3);
  if(a1>0){const gx=t<6.35?Math.sin(t*120)*8:0;o+=BUB(300+gx,250,'내일 뭐가 올라?',a1,1)+T(120,322,30,'— 들린 말','hud l',a1);}
  if(a2>0)o+=BUB(470,410,'내일 뭐가 올라?',a2,0,40,.75+.25*back(win(t,6.85,7.1)));
  if(t>=8.1){const u=win(t,8.1,8.28),sc=lerp(2.4,1,ease(u)),op=fade(t,8.1,9.0,.06,.25);cam=shake(t,8.2,.3,10);
   o+='<div class="t" style="left:420px;top:330px;font-size:60px;opacity:'+f2(op)+';color:#FFB547;border:6px solid #FFB547;border-radius:18px;padding:6px 26px;background:rgba(12,14,18,.82);text-shadow:0 0 14px rgba(255,181,71,.7);box-shadow:0 0 26px rgba(255,181,71,.45);transform:translate(-50%,-50%) rotate(-10deg) scale('+f2(sc)+')">기록 없음</div>';
   s+=ring(420,330,8.24,t,.5,30,220,'#FFB547',7,.6)+burst(420,330,8.24,t,.6,18,'#FFB547',200);}}
 // ── 4장면 지난 한 달 — 선이 「오늘」에서 멈춤 ──
 else if(t<12){const ha=fade(t,9.0,10.35,.15,.3);o+=BUB(486,640,'지난 한 달은?',ha,1)+T(360,705,30,'— 들린 말','hud l',ha)+BUB(305,600,'짹!',fade(t,9.6,10.5,.1,.25),0,44,.7+.3*back(win(t,9.6,9.85)));
  const pa=fade(t,9.3,12.4,.3,.01),sl=(1-ease(win(t,9.3,9.75)))*320;
  if(pa>0){s+='<g transform="translate('+f1(sl)+' 0)">'+panel(50,130,620,430,pa);const v=D.KM,up=v[v.length-1]>=v[0],c=up?UP:DN,d=ease(win(t,9.8,11.0)),L=lineOf(v,90,470,215,500,d);
   s+='<path d="M470 180 V530" stroke="'+INK+'" stroke-width="3" stroke-dasharray="10 9" opacity="'+f2(pa*.85)+'"/><rect x="474" y="160" width="190" height="394" fill="rgba(242,239,232,.035)" opacity="'+f2(pa)+'"/>';
   s+='<path d="'+L.p+'" fill="none" stroke="'+c+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="'+f2(pa)+'"/><circle cx="'+f1(L.hx)+'" cy="'+f1(L.hy)+'" r="'+f1(9+(d>=1?4*Math.sin(t*9):0))+'" fill="'+c+'" opacity="'+f2(pa)+'"/>';
   if(d>=1)s+=ring(470,L.hy,11.0,t,.6,10,90,INK,5);s+='</g>';
   o+=T(130+sl,182,34,'지난 한 달','hud l',pa)+T(470+sl,560,30,'오늘','',pa,'color:'+INK)+T(569+sl,460,30,'내일','',pa*.7,'color:'+MUTE);
   o+=T(569+sl,345,120,'?','',pa*(t<11.05?.25:.55+.45*Math.sin(t*7)),'color:'+GOLD+';font-weight:900;text-shadow:0 0 18px rgba(233,185,73,.6)');}
  tp+=brush(t,12);}
 // ── 5장면 편지 — 「골똘이 주식 격언 열 가지」(D.TITLE = next/app.js HELLO_MSG 첫 줄) ──
 else if(t<16){tp+=brush(t,12);const ei=ease(win(t,12.05,12.55)),ex=lerp(820,440,ei),ey=lerp(940,500,ei),er=lerp(28,0,ei),op2=1-win(t,12.75,13.05);
  if(op2>0&&t>=12.05)s+='<g opacity="'+f2(op2)+'" transform="translate('+f1(ex)+' '+f1(ey)+') rotate('+f1(er)+')"><rect x="-150" y="-95" width="300" height="190" rx="14" fill="'+INK+'"/><path d="M-150 -95 L0 '+f1(lerp(15,-170,win(t,12.65,12.85)))+' L150 -95" fill="#D9D4C9" stroke="#BDB7AA" stroke-width="2"/>'
   +'<g transform="translate(0 0) scale('+f2(t<12.6?0:back(win(t,12.6,12.8)))+')"><circle r="30" fill="url(#gold)"/><path d="M8 -16 a18 18 0 1 0 0 32 a14 14 0 1 1 0 -32" fill="#0C0E12" opacity=".75"/></g></g>';
  s+=ring(440,500,12.6,t,.45,20,160,GOLD,5);
  const lp=ease(win(t,12.75,13.1));if(lp>0){const x=lerp(290,190,lp),y=lerp(405,110,lp),w=lerp(300,500,lp),hh=lerp(190,790,lp);
   s+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(hh)+'" rx="18" fill="'+INK+'"/><rect x="'+f1(x+10)+'" y="'+f1(y+10)+'" width="'+f1(w-20)+'" height="'+f1(hh-20)+'" rx="12" fill="none" stroke="'+GOLD+'" stroke-width="2" opacity=".7"/>';
   if(lp>=1){o+=T(440,170,34,D.TITLE,'',fade(t,13.0,16.2,.2,.1),'color:#0C0E12;font-weight:900');
    for(let i=0;i<10;i++){const t0=13.2+i*.25,y2=250+i*62,u=ease(win(t,t0,t0+.22)),w2=Math.min(370,D.MAXW[i]*11.5)*u;
     s+='<circle cx="235" cy="'+y2+'" r="'+f1(20*(t<t0?.0:back(win(t,t0,t0+.2))))+'" fill="'+GOLD+'"/><rect x="270" y="'+(y2-9)+'" width="'+f1(w2)+'" height="18" rx="9" fill="#0C0E12" opacity=".22"/>';
     if(t>=t0)o+=T(235,y2,24,String(i+1),'',1,'color:#0C0E12;font-weight:900');}}}
  if(t>=15.0)o+=BUB(450,690,D.MAX1,fade(t,15.0,16.1,.12,.2),0,40,.7+.3*back(win(t,15.0,15.25)));
  s+=ring(450,690,15.0,t,.5,20,200,'#FFE3A0',5);}
 // ── 6장면 다섯 탭 — 납작한 휴대폰 ──
 else if(t<28.95){const py=phoneY(t),po=phoneOut(t),sc=1-.8*po,al=1-po;
  let g='<g opacity="'+f2(al)+'" transform="translate(360 480) scale('+f2(sc)+') translate(-360 -480) translate(0 '+f1(py)+')">';
  g+='<rect x="70" y="60" width="580" height="840" rx="50" fill="#0C0E12" stroke="#3A3F4A" stroke-width="4"/><path d="M70 150 H650 M70 818 H650" stroke="rgba(242,239,232,.12)" stroke-width="2"/>';
  g+='<circle cx="122" cy="105" r="21" fill="none" stroke="'+INK+'" stroke-width="3"/><path d="M109 112 l8 -8 l7 5 l10 -12" fill="none" stroke="'+INK+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="594" cy="101" r="13" fill="none" stroke="'+INK+'" stroke-width="3.5"/><path d="M603 111 l11 11" stroke="'+INK+'" stroke-width="3.5" stroke-linecap="round"/>';
  let k=0;for(let i=0;i<4;i++)if(t>=TAB_SW[i])k=i+1;
  g+='<rect x="'+(tabX(k)-44)+'" y="880" width="88" height="5" rx="2.5" fill="'+INK+'"/>';
  s+=g;let oo='';oo+=T(158,105,32,D.NAME,'l',1,'color:'+INK+';font-weight:900;letter-spacing:2px');
  D.TABS.forEach((nm,i)=>{oo+=T(tabX(i),850,30,nm,'',1,'color:'+(i===k?INK:MUTE)+';font-weight:'+(i===k?900:700));});
  const box=(x,y,w,h)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="16" fill="'+CARD+'" stroke="rgba(242,239,232,.14)" stroke-width="2"/>';
  const cf=(a,b)=>fade(t,a,b,.15,.15);
  // 6a 한눈에 — 시장 · 지수 두 칸
  let c=cf(16.3,18.5);if(c>0){s+='<g opacity="'+f2(c)+'">'+box(90,225,540,280)+box(90,525,540,280);[[D.K1,290,480,16.4],[D.K2,590,780,16.6]].forEach(([v,y0,y1,t0])=>{const L=lineOf(v,115,605,y0,y1,ease(win(t,t0,t0+1.0)));s+='<path d="'+L.p+'" fill="none" stroke="'+(v[v.length-1]>=v[0]?UP:DN)+'" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';});s+='</g>';
   oo+=T(105,193,34,'시장','l',c,'color:'+INK)+T(112,256,30,'코스피','l',c,'color:'+SUB)+T(112,556,30,'코스닥','l',c,'color:'+SUB);}
  // 6b 업종 — 줄 세우기
  c=cf(18.5,21.0);if(c>0){s+='<g opacity="'+f2(c)+'">';const ord=ROWS.map((r,i)=>i).sort((a,b)=>ROWS[b][0]-ROWS[a][0]);
   ROWS.forEach(([v,pts],i)=>{const tgt=ord.indexOf(i),u=eio(win(t,19.55+tgt*.08,20.25+tgt*.08)),y=lerp(262+i*104,262+tgt*104,u),col=v>=0?UP:DN;
    s+=box(90,y-44,540,88)+'<rect x="112" y="'+f1(y-8)+'" width="'+(90+(i*37)%70)+'" height="16" rx="8" fill="rgba(242,239,232,.2)"/>';const L=lineOf(pts,300,520,y-30,y+30,ease(win(t,18.75,19.4)));
    s+='<path d="'+L.p+'" fill="none" stroke="'+col+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+f1(L.hx)+'" cy="'+f1(L.hy)+'" r="6" fill="'+col+'"/>';
    if(t>=20.35)oo+=T(580,y,32,String(tgt+1),'',c*ease(win(t,20.35+tgt*.06,20.55+tgt*.06)),'color:'+INK+';font-weight:900');});
   s+='</g>';oo+=T(105,193,34,'업종 '+D.IND+'개','l',c,'color:'+INK);}
  // 6c 조건 — 칸 셋이 뽑기처럼 철컥 · 깔때기
  c=cf(21.0,23.5);if(c>0){s+='<g opacity="'+f2(c)+'">';[0,1,2].forEach(i=>{const x=105+i*180,ts=21.6+i*.3;s+=box(x,235,150,190);
    if(t<ts){for(let j=0;j<4;j++){const y=300+((t*900+j*40)%160);if(y<410)s+='<rect x="'+(x+30)+'" y="'+f1(y)+'" width="90" height="12" rx="6" fill="rgba(242,239,232,.28)"/>';}}
    else{s+=ring(x+75,355,ts,t,.4,10,80,CY,5);oo+=T(x+75,358,64,'✓','',c*back(win(t,ts,ts+.2)),'color:'+CY+';text-shadow:0 0 12px rgba(127,255,230,.8)');}
    oo+=T(x+75,268,30,'①②③'[i]+' '+D.CD[i],'',c,'color:'+INK);});
   s+='<path d="M150 470 H570 L405 640 V690 H315 V640 Z" fill="rgba(242,239,232,.06)" stroke="rgba(242,239,232,.3)" stroke-width="3"/>';
   for(let j=0;j<40;j++){const t0=22.3+(j%10)*.05,u=win(t,t0,t0+.55);if(u>0&&u<1){const x0=170+(j*53)%380,x=lerp(x0,360,easeIn(u)),y=lerp(452,640,easeIn(u));s+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="7" fill="'+INK+'" opacity="'+f2(.85*(1-u*.4))+'"/>';}}
   for(let j=0;j<5;j++){const t0=22.95+j*.09,u=ease(win(t,t0,t0+.3));if(u>0)s+='<circle cx="'+f1(lerp(360,210+j*75,u))+'" cy="'+f1(lerp(690,760,u))+'" r="11" fill="'+CY+'" filter="url(#gl)"/>';}
   s+='</g>';oo+=T(105,193,34,'조건','l',c,'color:'+INK);}
  // 6d 급등 — 칸 다섯 · 5일 오름 자
  c=cf(23.5,26.0);if(c>0){s+='<g opacity="'+f2(c)+'">';D.SV.forEach((nm,i)=>{const on=t>=23.6+i*.2;s+='<rect x="'+(92+i*108)+'" y="226" width="96" height="58" rx="29" fill="'+(on?'rgba(242,239,232,.14)':'none')+'" stroke="'+(on?INK:'rgba(242,239,232,.25)')+'" stroke-width="2.5"/>';oo+=T(140+i*108,256,28,nm,'',c*(on?1:.5),'color:'+INK);});
   s+='<path d="M150 765 V340" stroke="'+SUB+'" stroke-width="3"/>';[10,20,30,40].forEach(p=>{const y=765-p*9.5;s+='<path d="M140 '+y+' H610" stroke="rgba(242,239,232,.16)" stroke-width="2" stroke-dasharray="8 8"/>';oo+=T(132,y,28,p+'%','',c,'color:'+SUB+';transform:translate(-100%,-50%)');});
   DOTS.forEach((p,i)=>{const t0=24.0+i*.15,u=ease(win(t,t0,t0+.6)),y=lerp(780,765-Math.min(p,44)*9.5,u);if(u>0){s+='<circle cx="'+(220+i*52)+'" cy="'+f1(y)+'" r="12" fill="'+UP+'"/>';s+=ring(220+i*52,y,t0+.6,t,.4,8,40,UP,4);}});
   s+='</g>';oo+=T(105,193,34,'급등','l',c,'color:'+INK)+T(160,790,28,'5일 오름','l',c,'color:'+SUB)+T(360,316,26,'사고팔 곳을 고른 목록이 아니에요.','',c,'color:'+SUB);}
  // 6e 달력 — 날 카드 · 선택 · 이동 · 탈락
  c=cf(26.0,28.5);if(c>0){s+='<g opacity="'+f2(c)+'">';['선택','이동','탈락'].forEach((tag,i)=>{const t0=26.1+i*.35,u=back(win(t,t0,t0+.35)),y=lerp(900,240+i*180,cl(u))+(1-cl(u))*40;if(t>=t0){s+=box(95,y,530,150)+'<rect x="122" y="'+f1(y+28)+'" width="150" height="18" rx="9" fill="rgba(242,239,232,.3)"/>';
     for(let j=0;j<3;j++){const L=lineOf(ROWS[(i+j)%5][1],122+j*130,232+j*130,y+70,y+128,1);s+='<path d="'+L.p+'" fill="none" stroke="'+(ROWS[(i+j)%5][0]>=0?UP:DN)+'" stroke-width="3.5" stroke-linejoin="round"/>';}
     const ta=t>=t0+.4?back(win(t,t0+.4,t0+.6)):0;if(ta>0){s+='<rect x="'+f1(530-52*ta)+'" y="'+f1(y+40-26*ta)+'" width="'+f1(104*ta)+'" height="'+f1(52*ta)+'" rx="26" fill="'+(i===2?'rgba(142,149,159,.25)':'rgba(242,239,232,.14)')+'" stroke="'+(i===2?MUTE:INK)+'" stroke-width="2.5"/>';oo+=T(530,y+40,28,tag,'',c*cl(ta),'color:'+(i===2?SUB:INK));}}});
   s+='</g>';oo+=T(105,193,34,'달력','l',c,'color:'+INK);}
  s+='</g>';o+='<div style="position:absolute;inset:0;opacity:'+f2(al)+';transform:translate(360px,480px) scale('+f2(sc)+') translate(-360px,-480px) translate(0,'+f1(py)+'px)">'+oo+'</div>';}
 // ── 7장면 회사 모두 — 별비 숫자 ──
 if(t>=28.5&&t<31.6){const a=fade(t,28.6,31.6,.25,.3);RAIN.forEach(([x0,y0,ph,dl,r])=>{const t0=28.6+r*1.2,u=win(t,t0,t0+.7);if(u>0&&u<1){const x=lerp(x0,360+Math.cos(ph)*dl*.6,easeIn(u)),y=lerp(y0,480+Math.sin(ph)*dl*.25,easeIn(u));s+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(2+r*3)+'" fill="'+(r<.15?GOLD:'#BFFFF4')+'" opacity="'+f2(1-u*.7)+'"/>';}});
  const n=Math.round(D.NCO*eio(win(t,28.8,30.5)));o+=T(360,470,134,n.toLocaleString('ko-KR')+'<span style="font-size:62px">곳</span>','',a,'color:'+INK+';font-weight:900;text-shadow:0 0 26px rgba(127,255,230,.35)');
  o+=T(360,330,36,'코스피 · 코스닥','',a,'color:'+SUB)+T(360,598,34,D.ASOF+' 기준','',a*ease(win(t,30.4,30.8)),'color:'+SUB);
  s+=ring(360,470,30.5,t,.8,60,360,'#BFFFF4',10,.5)+burst(360,470,30.5,t,.9,36,'#FFE3A0',330);fl=Math.max(fl,pulse(t,30.48,.3)*.25);}
 // ── 8장면 일곱 계단 ──
 if(t>=31.5&&t<38){const cxs=j=>112+84*j,tops=j=>900-(j+1)*70,L=k=>31.9+k*.45,a=fade(t,31.5,35.2,.3,.3);
  if(a>0){for(let j=0;j<7;j++){const on=t>=L(j)-.02;s+='<rect x="'+(73+84*j)+'" y="'+tops(j)+'" width="78" height="'+(930-tops(j))+'" rx="8" fill="'+(on?'rgba(127,255,230,.2)':'rgba(242,239,232,.05)')+'" stroke="'+(on?'#BFFFF4':'#3A3F4A')+'" stroke-width="2.5" opacity="'+f2(a)+'"'+(on?' filter="url(#gl)"':'')+'/>';
    o+=T(cxs(j),tops(j)+34,30,String(j+1),'hud',a*(on?1:.45));if(on)s+=ring(cxs(j),tops(j),L(j),t,.4,10,60,'#BFFFF4',5,.3);}
   const k=Math.max(0,Math.min(6,Math.floor((t-31.9)/.45)));if(t>=31.9)o+=T(360,215,50,'<span style="color:#BFFFF4">'+(k+1)+'단</span> '+D.LV[k],'',a,'color:#FFFFFF;font-weight:900;text-shadow:0 0 16px rgba(127,255,230,.6);transform:translate(-50%,-50%) scale('+f2(.8+.2*back(win(t,L(k),L(k)+.2)))+')');
   s+=burst(cxs(6),tops(6),34.6,t,.8,26,'#FFE3A0',180);}
  const b=fade(t,34.95,38.1,.3,.1);if(b>0){s+=panel(30,150,390,640,b);D.LV.forEach((nm,i)=>{const t0=35.1+i*.18,on=t>=t0,y=225+i*82,last=i===6;
    s+='<circle cx="80" cy="'+y+'" r="24" fill="'+(on?(last&&D.NEWS?GOLD:'#BFFFF4'):'rgba(242,239,232,.12)')+'" opacity="'+f2(b)+'"/>';
    o+=T(80,y,26,String(i+1),'',b,'color:#0C0E12;font-weight:900')+T(118,y,34,nm,'l',b*(on?1:.4),'color:'+(last&&D.NEWS?'#FFD98A':INK));if(on)s+=ring(80,y,t0,t,.4,10,60,last&&D.NEWS?GOLD:'#BFFFF4',4);});
   if(D.NEWS&&t>=36.4){const u=back(win(t,36.4,36.75)),fx=lerp(760,560,cl(u)),fy=lerp(200,640,cl(u)),fr=lerp(40,-8,cl(u));
    s+='<g transform="translate('+f1(fx)+' '+f1(fy)+') rotate('+f1(fr)+')" opacity="'+f2(b)+'"><rect x="-95" y="-70" width="190" height="140" rx="6" fill="'+INK+'"/><rect x="-80" y="-10" width="160" height="10" rx="5" fill="#0C0E12" opacity=".25"/><rect x="-80" y="12" width="120" height="10" rx="5" fill="#0C0E12" opacity=".25"/><rect x="-80" y="34" width="140" height="10" rx="5" fill="#0C0E12" opacity=".25"/></g>';
    o+=T(fx,fy-40,30,'뉴스','',b*cl(u),'color:#0C0E12;font-weight:900');
    if(t>=37.0){const v=win(t,37.0,37.18);o+='<div class="t" style="left:600px;top:420px;font-size:44px;opacity:'+f2(b)+';color:'+GOLD+';border:5px solid '+GOLD+';border-radius:14px;padding:2px 18px;transform:translate(-50%,-50%) rotate(-8deg) scale('+f2(lerp(2,1,ease(v)))+')">공시</div>'+T(560,482,26,'회사가 직접 낸 알림','',b*ease(win(t,37.2,37.5)),'color:'+INK);cam=shake(t,37.05,.25,7);}}
   else if(t>=36.6)s+=burst(560,650,36.6,t,.8,24,'#FFE3A0',200)+sparkle(470,600,14,'#FFE3A0',pulse(t,36.6,.9))+sparkle(660,560,12,'#fff',pulse(t,36.75,.9));}}
 // ── 9장면 영어로도 ──
 if(t>=38&&t<41.2){const a=fade(t,38.05,41.0,.2,.25),gs=back(win(t,38.1,38.4)),ph=(t-38)*4.2;
  s+='<g opacity="'+f2(a)+'" transform="translate(360 330) scale('+f2(gs)+')" fill="none" stroke="'+INK+'" stroke-width="5"><circle r="120"/><path d="M-120 0 H120 M-104 -60 H104 M-104 60 H104" stroke-width="4"/>';
  for(let k=0;k<3;k++){const rx=Math.abs(Math.cos(ph+k*Math.PI/3))*120;s+='<ellipse rx="'+f1(Math.max(2,rx))+'" ry="120" stroke-width="4"/>';}s+='</g>'+ring(360,330,38.1,t,.5,40,200,INK,5);
  const fu=win(t,38.9,39.25),fs=Math.abs(Math.cos(Math.PI*fu));o+=T(360,560,78,fu<.5?D.NAME:D.NAME_EN,'',a,'color:'+INK+';font-weight:900;letter-spacing:'+(fu<.5?2:4)+'px;transform:translate(-50%,-50%) scaleY('+f2(Math.max(.02,fs))+')');
  const ha=fade(t,39.4,40.95,.12,.25);o+=BUB(215,700,'Hello!',ha,1,44)+T(110,770,30,'— 들린 말','hud l',ha)+BUB(560,615,'Hello!',fade(t,40.0,40.95,.1,.25),0,44,.7+.3*back(win(t,40.0,40.25)));}
 // ── 10장면 친구 셋 ──
 if(t>=40.5&&t<44.55){tp+=brush(t,41);if(t>=41){const a=fade(t,41.0,44.55,.25,.25);let n=0;
  for(let i=0;i<D.FR;i++){const t0=41.5+i*.6,cx=360+(i-(D.FR-1)/2)*180,cy=245,on=t>=t0;if(on)n++;
   if(t>=t0-.18&&t<t0+.12)s+='<rect x="'+(cx-20)+'" y="0" width="40" height="'+(cy+40)+'" fill="url(#aura)" opacity=".9"/>';
   const pop=on?back(win(t,t0,t0+.25)):1;s+='<g transform="translate('+cx+' '+cy+') scale('+f2(pop)+')" opacity="'+f2(a)+'"><rect x="-64" y="-42" width="128" height="84" rx="30" fill="'+(on?'#2FCFB8':'none')+'" stroke="'+(on?'#BFFFF4':'#4FA898')+'" stroke-width="3.5" '+(on?'filter="url(#gl)"':'')+'/><path d="M-30 38 l-14 22 l34 -20 z" fill="'+(on?'#2FCFB8':'#4FA898')+'"/><g fill="'+(on?'#0C0E12':'#4FA898')+'"><circle cx="-26" r="7"/><circle r="7"/><circle cx="26" r="7"/></g></g>';
   if(on)s+=sparkle(324+(i-1)*36,895,12,'#FFE3A0',pulse(t,t0,.5));}
  o+=T(360,375,56,'친구 '+n+' / '+D.FR,'',a,GLOW);
  o+=BUB(545,520,'어? 벌써 끝?',fade(t,43.1,44.4,.1,.2),0,40,.7+.3*back(win(t,43.1,43.35)));
  s+=ring(360,375,43.35,t,.8,40,330,'#FFE3A0',10,.5)+burst(360,375,43.35,t,.9,36,'#FFE3A0',300);
  o+=T(360,470,48,D.FR+'명 완료!','',fade(t,43.4,44.5,.1,.2),'color:#BFFFF4;text-shadow:0 0 16px rgba(80,240,210,.9);transform:translate(-50%,-50%) scale('+f2(.7+.3*back(win(t,43.4,43.65)))+')');}}
 // ── 11장면 상품권 · 커피는 네 거 ──
 if(t>=44.5&&t<49.7){const m=back(win(t,44.85,45.25)),push=eio(win(t,48.25,48.9)),vx=360,vy=lerp(300,420,push),vs=lerp(1,1.25,push),va=fade(t,44.8,49.65,.15,.25);
  for(let i=0;i<28&&t<45;i++){const [a0,sp]=SP[i],u=ease(win(t,44.45,44.95)),d=(1-u)*360*sp;s+='<circle cx="'+f1(vx+Math.cos(a0)*d)+'" cy="'+f1(vy+Math.sin(a0)*d)+'" r="4" fill="#FFE3A0" opacity="'+f2(u)+'" filter="url(#gl)"/>';}
  if(t>=44.85){s+='<g transform="translate('+vx+' '+f1(vy)+') scale('+f2(m*vs)+')" opacity="'+f2(va)+'"><rect x="-210" y="-125" width="420" height="250" rx="26" fill="url(#gold)" filter="url(#gl)"/><rect x="-194" y="-109" width="388" height="218" rx="18" fill="none" stroke="#0C0E12" stroke-width="2.5" stroke-dasharray="9 8" opacity=".35"/>'
    +'<clipPath id="vcl"><rect x="-210" y="-125" width="420" height="250" rx="26"/></clipPath><g clip-path="url(#vcl)"><rect x="'+f1(-330+win(t,45.05,45.75)*700)+'" y="-140" width="110" height="280" fill="url(#shine)" transform="skewX(-18)"/></g></g>';
   o+=T(vx,vy-48*m*vs,Math.round(38*vs),'스타벅스 상품권','',va*cl(m),'color:#0C0E12;font-weight:900')+T(vx,vy+30*m*vs,Math.round(84*vs),'1만원','',va*cl(m),'color:#0C0E12;font-weight:900');
   s+=sparkle(130,190,16,'#fff',.8*va*(.5+.5*Math.sin(t*6)))+sparkle(600,250,12,'#FFE3A0',va*(.5+.5*Math.cos(t*5)))+sparkle(580,470,10,'#fff',.7*va*(.5+.5*Math.sin(t*7+1)));}
  fl=Math.max(fl,pulse(t,44.85,.3)*.35);
  if(t>=46.25){const ca=fade(t,46.25,49.65,.2,.25),cx=lerp(760,560,ease(win(t,46.25,46.6))),cy=760,cs=1+push*1.4;s+='<g opacity="'+f2(ca*(1-push))+'" transform="translate('+f1(cx+push*-120)+' '+f1(cy+push*120)+') scale('+f2(cs)+')"><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7">'
    +[-30,0,30].map((dx,i)=>'<path d="M'+dx+' -110 q-12 -18 0 -36 q12 -18 0 -36" transform="translate(0 '+f1(-((t*40+i*12)%24))+')"/>').join('')+'</g><path d="M-74 -86 h148 l-14 112 q-3 20 -24 20 h-72 q-21 0 -24 -20 z" fill="#fff"/><path d="M72 -66 q42 4 36 44 q-6 30 -44 28" fill="none" stroke="#fff" stroke-width="11"/><ellipse cx="0" cy="58" rx="98" ry="15" fill="#DADADA"/></g>';
   const w=fade(t,46.6,48.2,.08,.25);if(w>0){s+='<rect x="8" y="8" width="704" height="964" rx="26" fill="none" stroke="#FFB547" stroke-width="'+f1(10+6*Math.sin(t*30))+'" opacity="'+f2(w*(.55+.45*Math.sin(t*30)))+'" filter="url(#gl)"/>';
    o+=T(360,120,44,'조심! 앵무새는 커피 금지','',w,'color:#FFB547;font-weight:900;text-shadow:0 0 16px rgba(255,181,71,.85)');}}
  if(t>=48.35)o+=T(540,640,80,'네 거!','',fade(t,48.35,49.65,.1,.2),'color:#FFD98A;font-weight:900;text-shadow:0 0 22px rgba(233,185,73,.9);transform:translate(-50%,-50%) scale('+f2(.6+.4*back(win(t,48.35,48.65)))+')');}
 // ── 12장면 받는 법 ──
 if(t>=49.6&&t<54.3){const a=fade(t,49.6,54.3,.3,.35);s+=panel(60,130,600,525,a,GOLD);o+=T(360,182,42,'이렇게 받아요','',a,GLOW);
  ['카톡으로 친구 '+D.FR+'명 소개','보낸 화면 찍어 문자','스타벅스 상품권 1만원'].forEach((txt,i)=>{const t0=50.0+i*.7,lit=t>=t0,y=268+i*98,pa=a*(lit?1:.35);
   s+='<rect x="92" y="'+(y-38)+'" width="536" height="76" rx="18" fill="'+(lit?'rgba(127,255,230,.14)':'rgba(127,255,230,.04)')+'" stroke="'+(lit?'#BFFFF4':'#4FA898')+'" stroke-width="2.5" opacity="'+f2(a)+'"/><circle cx="134" cy="'+y+'" r="23" fill="'+(lit?GOLD:'#4FA898')+'" opacity="'+f2(a)+'"/>';
   o+=T(134,y,28,String(i+1),'',a,'color:#0C0E12;font-weight:900')+T(170,y,34,txt,'l',pa,'color:'+INK)+T(596,y,38,'✓','',a*ease(win(t,t0,t0+.2)),'color:'+CY+';text-shadow:0 0 12px rgba(80,240,210,.9)');
   if(lit)s+=ring(134,y,t0,t,.5,10,70,'#FFE3A0',5);});
  o+=T(360,562,44,'문자 '+D.PHONE,'',fade(t,52.0,54.3,.2,.3),GLOW)+T(360,612,34,D.FR+'명마다 1만원씩!','',fade(t,52.4,54.3,.2,.3),'color:'+INK);s+=ring(360,562,52.0,t,.6,20,260,GOLD,6,.35);}
 // ── 13장면 「보 · 드 · 리」(D.NM · 첫 글자 54.8초 · 끝 글자 56.15초 = 끝 화음 — 글자 수가 달라도 같은 자리 · 소리는 sound.py 같은 셈) ──
 if(t>=54){if(t<54.7){for(let i=0;i<14;i++){const x=150+((i*67)%420),y=((t*3200+i*190)%1400)-200;s+='<rect x="'+x+'" y="'+f1(1180-y)+'" width="3" height="'+(90+(i%4)*40)+'" fill="#BFFFF4" opacity=".38"/>';}}
  fl=Math.max(fl,pulse(t,54.58,.38)*.7);cam=cam||shake(t,54.6,.4,12);
  const nN=D.NM.length,nS=nN>1?1.35/(nN-1):0;D.NM.forEach((ch,i)=>{const t0=54.8+i*nS,u=win(t,t0,t0+.22);if(t<t0)return;const sc=lerp(2.3,1,back(u)),x=360+(i-(nN-1)/2)*150;
   o+=T(x,282,142,ch,'',cl(u*3),'font-weight:900;color:transparent;background:linear-gradient(100deg,#B9E9DC 0%,#FFFFFF 38%,#7FFFE6 50%,#FFFFFF 62%,#B9E9DC 100%);background-size:300% 100%;background-position:'+f1(100-win(t,56.35+i*.06,57.6+i*.06)*100)+'% 0;-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 14px rgba(127,255,230,.85)) drop-shadow(0 0 36px rgba(47,184,159,.6));transform:translate(-50%,-50%) scale('+f2(sc)+')');
   s+=ring(x,282,t0,t,.45,20,140,'#BFFFF4',7)+burst(x,282,t0,t,.5,12,'#FFE3A0',150);if(t<t0+.2)cam=shake(t,t0,.2,9);});
  s+=sparkle(96,170,18,'#FFE3A0',fade(t,56.3,60,.3,.1)*(.5+.5*Math.sin(t*5)))+sparkle(628,380,14,'#fff',fade(t,56.4,60,.3,.1)*(.5+.5*Math.cos(t*6)))+sparkle(600,150,10,'#FFE3A0',fade(t,56.5,60,.3,.1)*(.5+.5*Math.sin(t*7+2)));
  o+=T(360,392,38,'aaa7377.com','',fade(t,56.6,60.5,.3,.1),'color:'+INK+';font-weight:800;letter-spacing:1px')+T(360,452,30,'지난 기록을 센 공부예요','',fade(t,56.8,60.5,.3,.1),'color:'+SUB+';font-weight:600')+T(360,494,30,'사고팔기를 권하지 않아요','',fade(t,56.9,60.5,.3,.1),'color:'+SUB+';font-weight:600');
  if(t>=57.3)s+=ring(360,860,57.35,t,.7,20,260,'#BFFFF4',8,.25)+burst(360,850,57.35,t,.8,24,'#BFFFF4',240);}
 // 골똘이
 if(st.show){const tr='translate('+f1(st.X)+' '+f1(st.Y)+') scale('+(st.S*st.sx).toFixed(3)+' '+(st.S*st.sy).toFixed(3)+')';
  if(O.glowWing>.3||O.flame>.3)s+='<ellipse cx="'+f1(st.X+120*st.S)+'" cy="'+f1(st.Y+150*st.S)+'" rx="'+f1(170*st.S)+'" ry="'+f1(170*st.S)+'" fill="url(#aura)" opacity="'+f2(Math.max(O.glowWing,O.flame)*.8)+'"/>';
  s+='<g transform="'+tr+'">'+hongpyo(O,t,{boot:1,guard:1})+'</g>';}
 document.getElementById('st').innerHTML=s;document.getElementById('ov').innerHTML=o;document.getElementById('top').innerHTML=tp;document.getElementById('cam').style.transform=cam;document.getElementById('flash').style.opacity=f2(fl);
 const k=CAP.find(c=>t>=c[0]&&t<c[1]),cap=document.getElementById('cap');if(k){const a=Math.min(win(t,k[0],k[0]+.25),1-win(t,k[1]-.22,k[1]));cap.innerHTML=k[2];cap.style.opacity=f2(Math.max(0,a));cap.style.transform='translateY('+f1((1-ease(win(t,k[0],k[0]+.35)))*20)+'px) scale('+f2(.94+.06*ease(win(t,k[0],k[0]+.3)))+')';}else{cap.style.opacity=0;cap.innerHTML='';}
 const bd2=document.getElementById('band');bd2.style.opacity=f2(fade(t,5.0,31.4,.4,.35));bd2.style.backgroundPosition=f1(100-((t*35)%200))+'% 0';
 const pc=document.getElementById('pc'),pa=win(t,56.8,57.3);pc.style.opacity=f2(pa);pc.style.transform='translateY('+f1((1-ease(pa))*18)+'px)';
 return document.body.innerText;};
</script></body>`;

// 그린 글 맞대기 — 옛 이름 · 옛 상품권 글 · 옛 친구 수가 나오면 멈춤
const BAD = [/홍표/, /막비/, /커피 1잔/, /상품권 1장/, /10명/, /아틀란스/, /ATLAS/i, /아\s*틀\s*란\s*스/];
const seen = new Set();
const b = await chromium.launch({executablePath: exe});
const pg = await b.newPage({viewport: {width: W, height: H}});
await pg.setContent(page, {waitUntil: 'load'});
await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
const look = txt => { for (const l of String(txt).split('\n')) if (l.trim()) seen.add(l.trim()); };
const judge = () => {
  const all = [...seen].join('\n');
  for (const re of BAD) if (re.test(all)) stop('그린 글에 ' + re + ' 이(가) 나옴');
  for (const need of ['골똘이!', '스타벅스 상품권 1만원', PHONE, `${FR}명마다 1만원씩!`, D.TITLE, NAME, NAME_EN, '사고팔기를 권하지 않아요'])
    if (!all.includes(need)) stop('그린 글에 「' + need + '」 이(가) 없음');
};
if (ONLY) {
  for (const t of ONLY) { look(await pg.evaluate(x => window.render(x), t)); await pg.screenshot({path: path.join(OUT, `t${String(t).replace('.', '_')}.png`)}); }
  console.log('frames', ONLY.length);
} else {
  const fdir = path.join(TMP, 'frames'); await fs.rm(fdir, {recursive: true, force: true}); await fs.mkdir(fdir, {recursive: true});
  const N = FPS * DUR;
  for (let i = 0; i < N; i++) { const txt = await pg.evaluate(x => window.render(x), i / FPS); if (i % 3 === 0) look(txt); await pg.screenshot({path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92}); }
  judge();
  const PT = Number(process.env.HP_POSTER ?? 58.5);
  await pg.evaluate(x => window.render(x), PT); await pg.screenshot({path: path.join(OUT, 'makbi-poster.jpg'), type: 'jpeg', quality: 86});
  const wav = path.join(TMP, 'sound.wav');
  execFileSync('python3', [path.join(HERE, 'sound.py'), wav], {stdio: 'inherit', env: {...process.env, HP_NEWS: NEWS ? '1' : '0', HP_FR: String(FR), HP_NM: String(NM.length)}});
  const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], {stdio: 'inherit'});
  ff('-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'makbi-intro.mp4'));
  ff('-i', path.join(OUT, 'makbi-intro.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-c:a', 'libopus', '-b:a', '96k', path.join(OUT, 'makbi-intro.webm'));
  for (const f of ['makbi-intro.mp4', 'makbi-intro.webm']) {
    const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(OUT, f)]).toString());
    if (Math.abs(d - DUR) > 0.05) stop(f + ' 길이 ' + d + '초 — 60초가 아님');
  }
  console.log('video', N, 'frames', DUR, 's · 그린 글', seen.size, '줄 맞대기 통과');
}
await b.close();
