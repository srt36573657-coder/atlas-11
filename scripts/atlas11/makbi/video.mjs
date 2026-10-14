// 홍표 소개 영상(사이트 소개 영상 · 35초 · 소리 있음) — 사장님 2026-10-14(싱가포르) 21:34 「막비가 아틀란스가 무엇인지 그리고 소개하면 스타벅스 1만원 커피상품권 주는 그런 내용 재밌게 담은 시나리오」 ·
//   21:50 「막비 이름을 홍표 라고 해」 · 21:59 「사이트 이름은 아틀란스 앵무새 이름은 홍표 그리고 판타스틱하게 만들어줘 아이어맨 처럼 말이야」 · 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」
//   node scripts/atlas11/makbi/video.mjs        → site/media/makbi-intro.mp4 · makbi-intro.webm · makbi-poster.jpg (파일 이름은 그대로 — 사이트 고리를 안 바꿈)
//   HP_T=1.2,2.4 HP_OUT=폴더 → 그 때의 그림만 PNG 로(확인용)
//   장면: 처음 6.5초 = 출동 준비 → 장비가 날아와 붙음(발 불꽃통 · 날개 덮개 · 빛 눈 가리개) → 장착 완료 → 날아오름 → 내려앉기 → 「홍표!」 세 번
//         그 뒤 = 따라쟁이 → 기록장(회사 모두 · 요즘 오르는 업종 · 7칸 계단) → 수정 구슬 「기록 없음」 → 친구 10명(발가락 8 + 날개 2) → 상품권 · 커피 조심 · 네 거! → 받는 법 → 「아틀란스」
//   남의 캐릭터 모양 없음 · 사람 얼굴 없음 · 가게 표시 없음 · 내일 맞히기 없음 · 소리는 sound.py 가 계산으로 만듦(남의 음악 없음 · 목소리 없음)
//   그림 조각은 draw.mjs 한 벌(makbi · hongpyo · 눈 가리개 · 장비) — 이 화면에는 draw.mjs 글을 그대로 넣음
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
const W = 720, H = 1280, FPS = 30, DUR = 35;
await fs.mkdir(OUT, {recursive: true});

const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/site/atlas/fonts.css"><style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:#061A17;font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;-webkit-font-smoothing:antialiased;color:#EEF6F2;position:relative}
#cam{position:absolute;inset:0;transform-origin:50% 55%}#st{position:absolute;inset:0;width:${W}px;height:${H}px}#ov{position:absolute;inset:0}
.t{position:absolute;white-space:nowrap;font-weight:800;text-align:center;transform:translate(-50%,-50%);line-height:1.15}
.hud{color:#BFFFF4;text-shadow:0 0 12px rgba(80,240,210,.85),0 0 2px #04110F;font-weight:800;letter-spacing:1px}
.bub{position:absolute;background:#fff;color:#0C2824;font-weight:800;font-size:40px;padding:14px 28px;border-radius:30px;white-space:nowrap;transform:translate(-50%,-50%)}
.bub.g{background:rgba(20,70,66,.72);color:#DFFFF8;border:3px solid #7FFFE6;box-shadow:0 0 22px rgba(127,255,230,.55)}
#cap{position:absolute;left:24px;right:24px;top:990px;height:156px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:54px;font-weight:800;line-height:1.24;letter-spacing:-.5px;color:#fff;text-shadow:0 0 20px rgba(80,240,210,.6),0 3px 0 #04110F,0 0 5px #04110F,0 0 2px #04110F}
#band{position:absolute;left:22px;right:22px;top:1170px;padding:8px 10px;border-radius:24px;background:linear-gradient(100deg,#E9C46A 0%,#FFE7A8 50%,#E9C46A 100%);background-size:220% 100%;color:#0C2824;text-align:center;font-weight:800;line-height:1.18;opacity:0;box-shadow:0 0 26px rgba(233,196,106,.5)}
#band b{display:block;font-size:34px;white-space:nowrap}#band span{display:block;font-size:30px}
#pc{position:absolute;left:40px;right:40px;top:1146px;padding:6px 10px;border-radius:22px;border:3px solid #E9C46A;background:rgba(6,26,23,.94);text-align:center;font-weight:800;line-height:1.12;opacity:0;box-shadow:0 0 30px rgba(233,196,106,.45)}
#pc i{display:block;font-style:normal;font-size:28px;color:#EEF6F2}#pc b{display:block;font-size:38px;color:#FFD98A;white-space:nowrap}#pc span{display:block;font-size:28px;color:#EEF6F2}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
</style><body><div id="cam"><svg id="st" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"></svg><div id="ov"></div></div>
<div id="cap"></div><div id="band"><b>친구 10명 소개하면 스타벅스 상품권 1만원!</b><span>문자 010-9011-7377</span></div>
<div id="pc"><i>친구 10명에게 소개하면</i><b>스타벅스 상품권 1만원!</b><span>문자 010-9011-7377</span></div><div id="flash"></div>
<script>${drawSrc}
const P={night:'#0C2824',deep:'#061A17',card:'#12322D',jade:'#6CC7A8',jadeInk:'#9FE0C8',ink:'#EEF6F2',sub:'#B7D0C7',moon:'#F4ECDE',gold:'#E9C46A',cyan:'#7FFFE6',amber:'#FFB547'};
let sd=11; const R=()=>((sd=(sd*1103515245+12345)%2147483648)/2147483648);
const STARS=Array.from({length:110},()=>[R()*720,R()*1050,.7+R()*2,R()*6.28]);
const BOKEH=Array.from({length:9},()=>[R()*720,180+R()*900,34+R()*60,R()*6.28,R()<.6?'#2FB89F':'#E9C46A']);
const SP=Array.from({length:48},()=>[R()*6.283,.45+R()*.9,1.5+R()*3.5,R()]);
const LN=Array.from({length:6},()=>Array.from({length:60},()=>R()));
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), ease=x=>1-Math.pow(1-cl(x),3), easeIn=x=>Math.pow(cl(x),2.2), eio=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const back=x=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, win=(t,a,b)=>cl((t-a)/(b-a)), pulse=(t,a,d)=>{const x=(t-a)/d;return x<0||x>1?0:Math.sin(Math.PI*x)};
const fade=(t,a,b,fi=.3,fo=.3)=>Math.max(0,Math.min(win(t,a,a+fi),1-win(t,b-fo,b)));
const lerp=(a,b,x)=>a+(b-a)*x, f1=x=>x.toFixed(1), f2=x=>x.toFixed(2);
const DEFS='<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E3A35"/><stop offset=".55" stop-color="#0A2622"/><stop offset="1" stop-color="#041411"/></linearGradient>'
 +'<filter id="gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
 +'<filter id="gl2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
 +'<filter id="bk" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>'
 +'<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".25" stop-color="#BFFFF4"/><stop offset=".6" stop-color="#2EC4B6"/><stop offset="1" stop-color="#2EC4B6" stop-opacity="0"/></linearGradient>'
 +'<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FFFF0"/><stop offset=".5" stop-color="#2FCFB8"/><stop offset="1" stop-color="#0E6E68"/></linearGradient>'
 +'<radialGradient id="ballg" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#E9E2F7"/><stop offset="1" stop-color="#9A86D0"/></radialGradient>'
 +'<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE7A8"/><stop offset=".5" stop-color="#E9C46A"/><stop offset="1" stop-color="#C99A3C"/></linearGradient>'
 +'<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
 +'<radialGradient id="aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7FFFE6" stop-opacity=".55"/><stop offset=".55" stop-color="#2FB89F" stop-opacity=".18"/><stop offset="1" stop-color="#2FB89F" stop-opacity="0"/></radialGradient>'
 +'<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FBFA"/><stop offset=".45" stop-color="#B4CDCB"/><stop offset="1" stop-color="#6E8B89"/></linearGradient>'
 +'<radialGradient id="moonglow" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#F4ECDE" stop-opacity=".28"/><stop offset="1" stop-color="#F4ECDE" stop-opacity="0"/></radialGradient></defs>';
// 홍표 첨단 차림 그림(visorSvg · flameSvg · wingGlow · gearSvg · hongpyo)은 draw.mjs 에 있음(위 drawSrc)
// ── 처음 6.5초 — 출동 준비 · 장착 · 날아오름 · 내려앉기 · 홍표 세 번 ──
function hpIntro(t){const o={tilt:-7,blink:0,wingL:0,wingR:0,crestUp:0,beakOpen:0,visor:1,vs:0,flame:0,glowWing:0,visorOff:0};let X=150,Y=470,S=1.75,sx=1,sy=1;const show=t>=.45?1:0,ap=ease(win(t,.45,.85));
 const g={boot:0,guard:0,bootOff:[0,0],gL:[0,0],gR:[0,0]};o.blink=t<1.05?1:pulse(t,6.0,.22);
 const pb=ease(win(t,.65,1.0)),pg=ease(win(t,1.05,1.4)),pv=ease(win(t,1.45,1.8));
 g.boot=t>=.65?cl(pb*1.5):0;g.bootOff=[0,(1-pb)*300];g.guard=t>=1.05?cl(pg*1.5):0;g.gL=[-(1-pg)*330,-(1-pg)*70];g.gR=[(1-pg)*330,-(1-pg)*70];o.vs=t>=1.45?cl(pv*1.5):0;o.visorOff=(1-pv)*-330;
 o.glowWing=t>=1.8&&t<3.6?.85:(t>=3.6?.85*(1-win(t,3.6,4.3)):0);o.crestUp=Math.max(pulse(t,1.85,.7),t>=4.4?.6:0);
 if(t>=2.25&&t<2.6){const q=win(t,2.25,2.6);sy=1-.1*q;sx=1+.06*q;o.flame=.45*q;}
 if(t>=2.6&&t<3.0){const u=easeIn(win(t,2.6,3.0));Y=470-u*1150;o.flame=1;o.wingL=o.wingR=.35;}
 if(t>=3.0&&t<3.6){const u=easeIn(win(t,3.0,3.6));Y=-760+u*1230;o.flame=1;o.wingL=o.wingR=.32;}
 if(t>=3.6){const q=pulse(t,3.6,.38);sy=1-.13*q;sx=1+.1*q;o.flame=1-win(t,3.6,4.1);o.wingL=o.wingR=.32*(1-win(t,3.6,4.0));o.tilt=-9;o.visor=1-eio(win(t,4.1,4.45));}
 for(const a of [4.5,5.0,5.5]){const p=pulse(t,a,.42);if(p>0){o.beakOpen=Math.max(o.beakOpen,p*.9);o.tilt=-9+7*p;o.crestUp=Math.max(o.crestUp,.6+.4*p);sy*=1+.03*p;}}
 if(t<.85){const k=.85+.15*ap;sx*=k;sy*=k;}
 return {o,X,Y,S,sx,sy,show,g,ap};}
function hudFrame(op,gw,gf){if(op<=.01)return '';let s='<g opacity="'+f2(op)+'" fill="none" stroke="#7FFFE6" stroke-width="2.5" filter="url(#gl)"><path d="M40 250 Q360 118 680 250"/><path d="M70 936 Q360 998 650 936" opacity=".6"/><path d="M30 92 v-52 h52 M690 92 v-52 h-52 M30 892 v52 h52 M690 892 v52 h-52" stroke-width="4"/>';
 for(let i=0;i<=12;i++){const u=i/12,x=40+640*u,y=250-2*132*u*(1-u)*1.0;s+='<path d="M'+f1(x)+' '+f1(y)+' l0 '+(i%3?8:16)+'" stroke-width="2"/>';}s+='</g>';
 if(gw!=null){[[34,gw],[672,gf]].forEach(([x,v])=>{s+='<g opacity="'+f2(op)+'"><rect x="'+x+'" y="420" width="14" height="300" rx="7" fill="none" stroke="#7FFFE6" stroke-width="2"/><rect x="'+(x+3)+'" y="'+f1(717-294*v)+'" width="8" height="'+f1(294*v)+'" rx="4" fill="#7FFFE6" filter="url(#gl)"/></g>';});}
 return s;}
// ── 홍표 자리 · 몸짓(때마다) ──
function hp(t){const o={tilt:-7,blink:0,wingL:0,wingR:0,crestUp:0,beakOpen:0,visor:0,vs:1,flame:0,glowWing:0};let X=150,Y=470,S=1.75,sx=1,sy=1,show=1;
 o.blink=Math.max(pulse(t,3.2,.22),pulse(t,6.6,.22),pulse(t,17.4,.2),pulse(t,22.3,.2),pulse(t,31.3,.22));
 if(t<3.5){const f=win(t,.55,1.6);Y=470-(1-easeIn(f))*980;show=t<.55?0:1;o.flame=t<1.6?1:1-win(t,1.6,2.1);o.wingL=o.wingR=t<1.6?.32:.32*(1-win(t,1.6,2.0));o.glowWing=t<1.9?.9:.9*(1-win(t,1.9,2.6));
  const q=pulse(t,1.6,.38);sy=1-.13*q;sx=1+.1*q;o.crestUp=Math.max(pulse(t,1.85,.9),t>2.3?.65:0);o.tilt=-9;o.visor=1-eio(win(t,2.7,3.05));o.beakOpen=pulse(t,2.9,.6)*.55;}
 else if(t<7){o.visor=0;o.tilt=-7-5*ease(win(t,3.5,4.2));if(t>=4.5&&t<5.6){o.beakOpen=Math.abs(Math.sin((t-4.55)*13))*.85;o.tilt=-14;}if(t>=5.7){o.tilt=-6+8*pulse(t,5.7,.7);o.crestUp=pulse(t,5.7,.9);}}
 else if(t<14){const g=eio(win(t,6.85,7.35));X=lerp(150,210,g);Y=lerp(470,600,g);S=lerp(1.75,1.25,g);o.visor=eio(win(t,7.0,7.35));o.crestUp=.35;o.tilt=-4+3*Math.sin((t-7)*1.4);
  if(t>=9.3&&t<11.7){o.wingR=.5*ease(win(t,9.4,9.8));o.tilt=-8;}
  if(t>=11.6){// 계단 — 한 칸 0.3초 · 1칸 11.8초 → 7칸 13.6초
   const k0=Math.floor((t-11.8)/.3),k=Math.max(0,Math.min(6,k0)),u=k0>=0&&k0<6?cl(((t-11.8)-k0*.3)/.3):1;const stx=j=>90+j*77+38.5,sty=j=>900-(j+1)*55;
   let cx,cy;if(t<11.8){const g2=eio(win(t,11.6,11.8));cx=lerp(360,stx(0),g2);cy=lerp(919,sty(0),g2);S=lerp(1.25,.62,g2);}else if(k0>=6){cx=stx(6);cy=sty(6);S=.62;}else{cx=lerp(stx(k),stx(k+1),u);cy=lerp(sty(k),sty(k+1),u)-Math.sin(Math.PI*u)*46;S=.62;}
   X=cx-120*S;Y=cy-255*S;o.flame=k0>=0&&k0<6?.55+.45*Math.sin(Math.PI*u):(t<11.8?.4:.25);o.wingL=o.wingR=.35;o.glowWing=.7;o.tilt=-4;o.crestUp=.8;}}
 else if(t<17){const g=eio(win(t,13.85,14.3));X=lerp(90+6*77+38.5-120*.62,40,g);Y=lerp(900-7*55-255*.62,520,g);S=lerp(.62,1.5,g);o.visor=1;o.flame=.3*(1-g);o.tilt=-6;
  if(t>=15.2&&t<16.6){o.tilt=-6+14*Math.sin((t-15.2)*15)*pulse(t,15.2,1.4);o.beakOpen=pulse(t,15.3,1.1)*.7;}}
 else if(t<22.5){const g=eio(win(t,16.9,17.3));X=lerp(40,150,g);Y=lerp(520,470,g);S=lerp(1.5,1.75,g);o.visor=1-eio(win(t,17.0,17.35));o.crestUp=.5;
  if(t>=19&&t<21){o.tilt=-7+17*ease(win(t,19,19.4));o.crestUp=.2;}if(t>=20&&t<21)o.crestUp=pulse(t,20,.6);
  if(t>=21){o.wingL=o.wingR=.92*ease(win(t,21,21.25));o.glowWing=ease(win(t,21,21.3));o.crestUp=1;o.beakOpen=pulse(t,21.4,.9)*.6;o.tilt=-8;}}
 else if(t<26.5){const g=eio(win(t,22.4,22.8));X=lerp(150,40,g);Y=lerp(470,560,g);S=lerp(1.75,1.4,g);o.crestUp=.7;o.wingL=o.wingR=.25*pulse(t,22.6,1.2);
  if(t>=24.25&&t<24.65){o.tilt=-7+12*ease(win(t,24.25,24.6));}
  if(t>=24.65&&t<25.6){const j=pulse(t,24.65,.6);Y-=60*j;X-=24*j;o.tilt=16;o.crestUp=1;o.wingL=.5;o.blink=0;}
  if(t>=25.55){o.wingR=.85*ease(win(t,25.55,25.85));o.tilt=-10;o.beakOpen=pulse(t,25.7,.7)*.6;}}
 else{if(t<29){const g=eio(win(t,26.4,26.8));X=lerp(40,270,g);Y=lerp(560,720,g);S=lerp(1.4,.75,g);o.wingR=.55;o.tilt=-6;o.crestUp=.6;o.visor=0;}
  else{const g=eio(win(t,29,29.6));X=lerp(270,216,g);Y=lerp(720,456,g)-6*Math.sin((t-29.6)*3)*win(t,29.6,30);S=lerp(.75,1.2,g);o.flame=t<29.7?1:.42+.1*Math.sin(t*9);o.glowWing=.8;o.visor=1-eio(win(t,30.0,30.4));
   o.wingL=.25;o.wingR=t>30.3?.6+.3*Math.sin((t-30.3)*7):.25;o.crestUp=.8;o.tilt=-9;o.beakOpen=pulse(t,30.4,.6)*.6;}}
 return {o,X,Y,S,sx,sy,show};}
const CAP=[[0.8,3.6,'홍표,<br>출동!'],[3.9,6.5,'안녕! 나는<br>앵무새 홍표야'],[6.6,9.5,'앵무새는 들은 말을<br>그대로 따라 해'],[9.6,11.8,'아틀란스는<br>주식 기록장이야'],[11.8,14.2,'요즘 오르는 업종도<br>한눈에!'],[14.2,16.5,'누를수록 자세히!<br>7칸 계단'],
 [16.6,19.5,'내일 맞히기는 안 해!<br>지난 사실만!'],[19.6,21.5,'친구 10명에게<br>소개하면…'],[21.5,23.5,'하나, 둘 … 여덟!<br>발가락 끝!'],[23.5,25.0,'날개로<br>아홉, 열!'],[25.1,26.7,'스타벅스 상품권<br>1만원!'],[26.7,29.0,'앵무새는 커피 못 마셔<br>그러니까 네 거!'],[29.1,31.5,'보낸 화면 찍어<br>문자 주면 끝!'],[32.1,35.1,'짹! 같이<br>보러 가자!']];
const T=(x,y,size,txt,cls,op,extra)=>'<div class="t '+(cls||'')+'" style="left:'+f1(x)+'px;top:'+f1(y)+'px;font-size:'+size+'px;opacity:'+f2(op)+';'+(extra||'')+'">'+txt+'</div>';
const panel=(x,y,w,h,op,c)=>'<g opacity="'+f2(op)+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="22" fill="rgba(16,70,64,.42)" stroke="'+(c||'#7FFFE6')+'" stroke-width="2.5" filter="url(#gl)"/>'
 +'<path d="M'+(x+10)+' '+(y+44)+' v-34 h34 M'+(x+w-44)+' '+(y+10)+' h34 v34 M'+(x+w-10)+' '+(y+h-44)+' v34 h-34 M'+(x+44)+' '+(y+h-10)+' h-34 v-34" fill="none" stroke="'+(c||'#BFFFF4')+'" stroke-width="5" stroke-linecap="round"/></g>';
const sparkle=(x,y,r,c,op)=>'<path d="M'+x+' '+(y-r)+' Q'+(x+r*.16)+' '+(y-r*.16)+' '+(x+r)+' '+y+' Q'+(x+r*.16)+' '+(y+r*.16)+' '+x+' '+(y+r)+' Q'+(x-r*.16)+' '+(y+r*.16)+' '+(x-r)+' '+y+' Q'+(x-r*.16)+' '+(y-r*.16)+' '+x+' '+(y-r)+' Z" fill="'+(c||'#FFE7A8')+'" opacity="'+f2(op==null?1:op)+'" filter="url(#gl)"/>';
const burst=(cx,cy,t0,t,dur,n,c,dist)=>{const u=win(t,t0,t0+dur);if(u<=0||u>=1)return '';let s='';for(let i=0;i<n;i++){const [a,sp,r]=SP[i%SP.length],d=(dist||220)*sp*ease(u),x=cx+Math.cos(a+i)*d,y=cy+Math.sin(a+i)*d;s+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r*(1-u*.6))+'" fill="'+(c||'#BFFFF4')+'" opacity="'+f2(1-u)+'" filter="url(#gl)"/>';}return s;};
const ring=(cx,cy,t0,t,dur,r0,r1,c,sw,ry)=>{const u=win(t,t0,t0+dur);if(u<=0||u>=1)return '';const r=lerp(r0,r1,ease(u));return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+f1(r)+'" ry="'+f1(r*(ry||1))+'" fill="none" stroke="'+(c||'#BFFFF4')+'" stroke-width="'+f1((sw||6)*(1-u))+'" opacity="'+f2(1-u)+'" filter="url(#gl)"/>';};
window.render=tn=>{const t=tn<6.5?tn:(tn<9.5?3.5+(tn-6.5)*(3.5/3):tn-2.5);let s=DEFS,o='';
 // 배경 — 밤하늘 · 흐린 빛 방울 · 별 · 달 · 빛줄기
 s+='<rect width="720" height="1280" fill="url(#bg)"/>';
 s+=BOKEH.map(([x,y,r,p,c])=>'<circle cx="'+f1(x+Math.sin(t*.3+p)*34)+'" cy="'+f1(y+Math.cos(t*.25+p)*22)+'" r="'+f1(r)+'" fill="'+c+'" opacity="'+(.07+.04*Math.sin(t*.9+p)).toFixed(3)+'" filter="url(#bk)"/>').join('');
 s+=STARS.map(([x,y,r,p])=>'<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r)+'" fill="#fff" opacity="'+f2(.2+.5*(.5+.5*Math.sin(t*2.1+p)))+'"/>').join('');
 s+='<g opacity="'+f2(1-fade(t,16.9,26.5,.4,.4))+'"><circle cx="600" cy="140" r="110" fill="url(#moonglow)"/><circle cx="600" cy="140" r="54" fill="#F4ECDE"/><circle cx="584" cy="128" r="8" fill="#E6DCC8"/><circle cx="614" cy="156" r="5.5" fill="#E6DCC8"/></g>';
 s+='<g opacity=".07"><path d="M'+f1(-200+((t*40)%900))+' 0 l220 0 l-420 1280 l-220 0 z" fill="#BFFFF4"/><path d="M'+f1(300+((t*28)%900))+' 0 l120 0 l-420 1280 l-120 0 z" fill="#BFFFF4"/></g>';
 const st=tn<6.5?hpIntro(tn):hp(t), O=st.o, G=st.g||{boot:1,guard:1}; let cam='', fl=0;
 // ── 처음 장면: 출동 준비 · 장착 · 날아오름 · 내려앉기 · 홍표 세 번 ──
 if(tn<6.5){const bo=fade(tn,0,1.0,.15,.3),X0=150,Y0=470,S0=1.75;
  s+='<circle cx="360" cy="640" r="150" fill="none" stroke="#7FFFE6" stroke-width="4" stroke-dasharray="'+f1(943*ease(win(tn,0,.6)))+' 943" transform="rotate(-90 360 640)" opacity="'+f2(bo*(1-ease(win(tn,.5,.9))))+'" filter="url(#gl)"/>';
  o+=T(360,640,40,'출동 준비','hud',fade(tn,.1,.85,.15,.25));
  s+=hudFrame(fade(tn,.1,3.7,.3,.3),ease(win(tn,1.05,1.4)),ease(win(tn,.65,1.0)));
  if(tn>=.3&&tn<3.7){const hf=fade(tn,.3,3.7,.3,.3);o+=T(41,392,26,'날개','hud',hf)+T(679,392,26,'불꽃','hud',hf);}
  if(tn>=.45&&tn<2.75){const b=fade(tn,.45,2.75,.2,.25);s+='<rect x="'+f1(360-120*b)+'" y="0" width="'+f1(240*b)+'" height="1280" fill="url(#aura)" opacity="'+f2(b*.95)+'"/>';
   for(let i=0;i<18;i++){const x=262+((i*41)%196),y=1000-((tn*420+i*97)%900);s+='<circle cx="'+x+'" cy="'+f1(y)+'" r="'+(1.5+(i%3))+'" fill="#BFFFF4" opacity="'+f2(.7*b)+'" filter="url(#gl)"/>';}}
  s+=ring(X0+104*S0,Y0+252*S0,1.0,tn,.45,10,70,'#BFFFF4',6)+ring(X0+136*S0,Y0+252*S0,1.0,tn,.45,10,70,'#BFFFF4',6)+ring(X0+62*S0,Y0+192*S0,1.4,tn,.45,10,85,'#BFFFF4',6)+ring(X0+178*S0,Y0+192*S0,1.4,tn,.45,10,85,'#BFFFF4',6)+ring(X0+120*S0,Y0+116*S0,1.8,tn,.55,20,170,'#BFFFF4',7);
  fl=Math.max(pulse(tn,1.0,.2)*.16,pulse(tn,1.4,.2)*.16,pulse(tn,1.8,.26)*.3);
  o+=T(360,388,48,'장착 완료!','',fade(tn,1.95,2.7,.12,.25),'color:#BFFFF4;font-weight:900;text-shadow:0 0 18px rgba(80,240,210,.95)');
  s+=ring(360,916,2.6,tn,.6,20,240,'#BFFFF4',8,.25)+ring(360,150,2.92,tn,.5,20,320,'#E9C46A',6,.45)+burst(360,920,2.6,tn,.7,20,'#BFFFF4',220);
  if(tn>=2.6&&tn<3.6){for(let i=0;i<16;i++){const x=150+((i*67)%420),y=tn<3.0?((1400-(tn*3400+i*190)%1500)):(((tn*3200+i*190)%1500)-200);s+='<rect x="'+x+'" y="'+f1(y)+'" width="3" height="'+(90+(i%4)*40)+'" fill="#BFFFF4" opacity=".38"/>';}}
  if(tn>=2.6&&tn<2.75){const a2=(1-win(tn,2.6,2.75))*8;cam='translate('+f1(Math.sin(tn*90)*a2)+'px,'+f1(Math.cos(tn*77)*a2)+'px)';}
  s+=ring(360,916,3.6,tn,.75,30,330,'#BFFFF4',10,.22)+ring(360,916,3.66,tn,.9,20,250,'#E9C46A',6,.2)+burst(360,900,3.6,tn,.9,30,'#BFFFF4',300);
  if(tn>=3.6&&tn<4.2){const a3=(1-win(tn,3.6,4.2))*16;cam='translate('+f1(Math.sin(tn*95)*a3)+'px,'+f1(Math.cos(tn*83)*a3)+'px)';}
  fl=Math.max(fl,pulse(tn,3.58,.32)*.45);
  if(tn>=3.9){const a4=fade(tn,3.9,6.6,.4,.2);s+='<g opacity="'+f2(a4*.5)+'" transform="rotate('+f1(tn*14)+' 360 659)"><circle cx="360" cy="659" r="262" fill="none" stroke="#7FFFE6" stroke-width="2.5" stroke-dasharray="24 14"/></g><g opacity="'+f2(a4*.35)+'" transform="rotate('+f1(-tn*20)+' 360 659)"><circle cx="360" cy="659" r="292" fill="none" stroke="#E9C46A" stroke-width="2" stroke-dasharray="6 18"/></g>';}
  [[4.5,190,450,46],[5.0,532,410,52],[5.5,360,300,64]].forEach(([a5,x,y,sz])=>{const op=fade(tn,a5,6.45,.1,.25);if(op>0)o+='<div class="bub" style="left:'+x+'px;top:'+y+'px;font-size:'+sz+'px;opacity:'+f2(op)+';border:3px solid #7FFFE6;box-shadow:0 0 22px rgba(127,255,230,.6);transform:translate(-50%,-50%) scale('+f2(.6+.4*back(win(tn,a5,a5+.25)))+')">홍표!</div>';s+=ring(x,y,a5,tn,.45,10,110,'#FFE7A8',5);});}
 // ── 2장면 따라쟁이 ──
 else if(t<7){if(tn>=6.5&&tn<6.8)fl=0;const a1=fade(t,3.7,6.95,.25,.3),a2=fade(t,4.6,6.95,.2,.3);
  if(a1>0){const gx=(t<3.85?Math.sin(t*120)*8:0);o+='<div class="bub g" style="left:'+f1(270+gx)+'px;top:330px;opacity:'+f2(a1)+'">아틀란스가 뭐야?</div>'+T(150,402,30,'— 들린 말','hud',a1);}
  if(a2>0)o+='<div class="bub" style="left:470px;top:470px;opacity:'+f2(a2)+';transform:translate(-50%,-50%) scale('+f2(.75+.25*back(win(t,4.6,4.9)))+')">아틀란스가 뭐야?</div>';
  const a3=fade(t,5.75,6.95,.12,.3);if(a3>0)o+=T(600,600,58,'앗!','',a3,'color:#FFD98A;text-shadow:0 0 16px rgba(233,196,106,.8);transform:translate(-50%,-50%) scale('+f2(.6+.4*back(win(t,5.75,6.0)))+')');}
 // ── 3장면 아틀란스 기록장(분석) ──
 else if(t<14){fl=pulse(t,7.18,.3)*.3;s+=hudFrame(fade(t,7.0,14.0,.3,.3)*.75);
  if(t<7.9)o+=T(360,560,32,'기록 보는 중…','hud',fade(t,7.1,7.9,.15,.25));
  if(t<11.75){const pa=fade(t,7.3,11.75,.35,.3),sl=(1-ease(win(t,7.3,7.75)))*300;
   s+='<g transform="translate('+f1(sl)+' 0)">'+panel(60,150,600,370,pa);
   if(t<9.35){const a=fade(t,7.5,9.4,.3,.25);for(let i=0;i<6;i++){let p='';for(let j=0;j<=24;j++){const x=90+j*22.5,ph=Math.floor(t*14)+j,v=LN[i][(ph%60+60)%60];p+=(j?' L':'M')+f1(x)+' '+f1(258+i*40+(v-.5)*26);}
     s+='<path d="'+p+'" fill="none" stroke="'+(i%3===1?'#E9C46A':'#7FFFE6')+'" stroke-width="3" stroke-linejoin="round" opacity="'+f2(a*(.5+.08*i))+'" filter="url(#gl)"/>';}
    o+=T(360+sl,192,34,'우리나라 주식 회사 모두','hud',a);}
   else{const a=fade(t,9.3,11.75,.25,.3),d=ease(win(t,9.55,10.6));const pts=[[100,470],[170,440],[230,455],[300,400],[370,410],[440,350],[510,360],[600,262]];
    let L=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);L+=l;}
    let rem=d*L,p='M'+pts[0][0]+' '+pts[0][1],hx=pts[0][0],hy=pts[0][1];for(let i=1;i<pts.length&&rem>0;i++){const k=Math.min(1,rem/seg[i-1]);hx=lerp(pts[i-1][0],pts[i][0],k);hy=lerp(pts[i-1][1],pts[i][1],k);p+=' L'+f1(hx)+' '+f1(hy);rem-=seg[i-1];}
    s+='<path d="'+p+'" fill="none" stroke="#7FFFE6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="'+f2(a)+'" filter="url(#gl2)"/>';
    if(d<1)s+='<circle cx="'+f1(hx)+'" cy="'+f1(hy)+'" r="11" fill="#fff" opacity="'+f2(a)+'" filter="url(#gl2)"/>';
    else{const lk=ease(win(t,10.6,10.95)),r=lerp(90,34,lk);s+='<circle cx="600" cy="262" r="12" fill="#E9C46A" opacity="'+f2(a)+'" filter="url(#gl)"/><g opacity="'+f2(a)+'" stroke="#E9C46A" stroke-width="4" fill="none" filter="url(#gl)"><circle cx="600" cy="262" r="'+f1(r)+'"/><path d="M600 '+f1(262-r-16)+' v24 M600 '+f1(262+r-8)+' v24 M'+f1(600-r-16)+' 262 h24 M'+f1(600+r-8)+' 262 h24"/></g>';
     o+=T(462,262,32,'찾았다!','',a*lk,'color:#FFD98A;text-shadow:0 0 14px rgba(233,196,106,.85)');}
    o+=T(330+sl,192,34,'요즘 오르는 업종','hud',a);}
   s+='</g>';}
  else{const a=fade(t,11.6,14.05,.25,.25);
   for(let j=0;j<7;j++){const x=90+j*77,top=900-(j+1)*55,lit=t>=11.8+j*.3-.05;s+='<rect x="'+x+'" y="'+top+'" width="77" height="'+(930-top)+'" fill="'+(lit?'rgba(127,255,230,.24)':'rgba(127,255,230,.07)')+'" stroke="'+(lit?'#BFFFF4':'#4FA898')+'" stroke-width="2.5" opacity="'+f2(a)+'"'+(lit?' filter="url(#gl)"':'')+'/>';
    o+=T(x+38.5,top+30,30,String(j+1),'hud',a*(lit?1:.45));}
   o+=T(205,420,46,'7칸 계단','',a,'color:#FFD98A;text-shadow:0 0 16px rgba(233,196,106,.8)');
   s+=burst(90+6*77+38.5,900-7*55,13.6,t,.8,24,'#FFE7A8',160);
   for(let j=0;j<6;j++)s+=ring(90+(j+1)*77+38.5,900-(j+1)*55,11.8+(j+1)*.3,t,.4,10,60,'#BFFFF4',5,.3);}}
 // ── 4장면 내일은 몰라 ──
 else if(t<17){const a=fade(t,14.05,17.0,.3,.25),inn=ease(win(t,14.1,14.7)),dz=win(t,16.1,16.8),bx=lerp(800,525,inn),by=600+8*Math.sin(t*3),sc=1-dz*.9;
  if(dz<1){s+='<g opacity="'+f2(a*(1-dz*.6))+'" transform="translate('+f1(bx)+' '+f1(by)+') scale('+f2(sc)+')"><circle r="120" fill="url(#ballg)" filter="url(#gl)"/><ellipse cx="-38" cy="-46" rx="34" ry="20" fill="#fff" opacity=".65"/></g>';
   o+=T(bx,by+8,130,'?','',a*(1-dz),'color:#E9C46A;font-weight:900;text-shadow:0 0 18px rgba(233,196,106,.7);transform:translate(-50%,-50%) scale('+f2(sc)+')');
   o+=T(bx,by-168,44,'내일은?','',a*(1-dz),'color:#EEF6F2;text-shadow:0 0 12px rgba(0,0,0,.6)');}
  s+=burst(525,600,16.1,t,.9,40,'#D9CCFF',330);
  if(t>=14.8&&t<15.7){const u=win(t,14.8,15.6);s+='<rect x="390" y="'+f1(470+u*270)+'" width="270" height="16" fill="#7FFFE6" opacity=".55" filter="url(#gl2)"/>';}
  o+=T(525,812,40,'기록 없음','',fade(t,15.45,16.4,.12,.25),'color:#FFB547;text-shadow:0 0 14px rgba(255,181,71,.8)');
  const nb=fade(t,15.25,16.75,.12,.25);if(nb>0)o+='<div class="bub" style="left:230px;top:430px;opacity:'+f2(nb)+'">아니 아니!</div>';}
 // ── 5장면 친구 10명 작전 ──
 else if(t<22.5){const a=fade(t,17.05,22.6,.3,.25);let n=0;
  for(let i=0;i<10;i++){const t0=i<8?17.35+i*.24:21.1+(i-8)*.2,cx=120+(i%5)*120,cy=200+Math.floor(i/5)*100,lit=t>=t0;if(lit)n++;
   if(t>=t0-.18&&t<t0+.12)s+='<rect x="'+(cx-16)+'" y="0" width="32" height="'+(cy+30)+'" fill="url(#aura)" opacity=".9"/>';
   const pop=lit?back(win(t,t0,t0+.25)):1;s+='<g transform="translate('+cx+' '+cy+') scale('+f2(pop)+')" opacity="'+f2(a)+'"><rect x="-42" y="-28" width="84" height="56" rx="20" fill="'+(lit?'#2FCFB8':'none')+'" stroke="'+(lit?'#BFFFF4':'#4FA898')+'" stroke-width="3" '+(lit?'filter="url(#gl)"':'')+'/><path d="M-20 26 l-10 16 l24 -14 z" fill="'+(lit?'#2FCFB8':'#4FA898')+'"/><g fill="'+(lit?'#0C2824':'#4FA898')+'"><circle cx="-18" r="5"/><circle r="5"/><circle cx="18" r="5"/></g></g>';}
  o+=T(360,372,50,'친구 '+n+' / 10','',a,'color:#FFD98A;font-weight:900;text-shadow:0 0 16px rgba(233,196,106,.8)');
  if(t>=19&&t<21){const f=fade(t,19.05,21.0,.2,.2);s+=sparkle(332,918,12,'#FFE7A8',f*(.6+.4*Math.sin(t*20)))+sparkle(388,918,12,'#FFE7A8',f*(.6+.4*Math.cos(t*20)));o+=T(170,880,40,'발가락 8','',f,'color:#FFD98A;text-shadow:0 0 14px rgba(233,196,106,.85)');}
  o+=T(590,560,62,'어?','',fade(t,19.95,21.0,.1,.2),'color:#EEF6F2;text-shadow:0 0 14px rgba(0,0,0,.6)');
  if(t>=21){o+=T(612,700,40,'날개 2','',fade(t,21.05,22.5,.15,.25),'color:#FFD98A;text-shadow:0 0 14px rgba(233,196,106,.85)')+T(150,880,40,'발가락 8','',fade(t,21.05,22.5,.15,.25),'color:#FFD98A;text-shadow:0 0 14px rgba(233,196,106,.85)');
   s+=ring(360,372,21.45,t,.8,40,330,'#FFE7A8',10,.5)+burst(360,372,21.45,t,.9,36,'#FFE7A8',300);
   o+=T(360,440,44,'10명 완료!','',fade(t,21.5,22.5,.1,.2),'color:#BFFFF4;text-shadow:0 0 16px rgba(80,240,210,.9);transform:translate(-50%,-50%) scale('+f2(.7+.3*back(win(t,21.5,21.75)))+')');}}
 // ── 6장면 상품권 도착 · 커피는 네 거 ──
 else if(t<26.5){const m=back(win(t,22.85,23.25)),push=eio(win(t,25.55,26.2)),vx=360,vy=lerp(300,420,push),vs=lerp(1,1.25,push),va=fade(t,22.8,26.6,.15,.25);
  for(let i=0;i<28&&t<23;i++){const [a0,sp]=SP[i],u=ease(win(t,22.45,22.95)),d=(1-u)*360*sp;s+='<circle cx="'+f1(vx+Math.cos(a0)*d)+'" cy="'+f1(vy+Math.sin(a0)*d)+'" r="4" fill="#FFE7A8" opacity="'+f2(u)+'" filter="url(#gl)"/>';}
  if(t>=22.85){s+='<g transform="translate('+vx+' '+f1(vy)+') scale('+f2(m*vs)+')" opacity="'+f2(va)+'"><rect x="-210" y="-125" width="420" height="250" rx="26" fill="url(#gold)" filter="url(#gl)"/><rect x="-194" y="-109" width="388" height="218" rx="18" fill="none" stroke="#0C2824" stroke-width="2.5" stroke-dasharray="9 8" opacity=".35"/>'
    +'<clipPath id="vcl"><rect x="-210" y="-125" width="420" height="250" rx="26"/></clipPath><g clip-path="url(#vcl)"><rect x="'+f1(-330+win(t,23.05,23.75)*700)+'" y="-140" width="110" height="280" fill="url(#shine)" transform="skewX(-18)"/></g></g>';
   o+=T(vx,vy-48*m*vs,Math.round(38*vs),'스타벅스 상품권','',va*cl(m),'color:#0C2824;font-weight:900')+T(vx,vy+30*m*vs,Math.round(84*vs),'1만원','',va*cl(m),'color:#0C2824;font-weight:900');
   s+=sparkle(130,190,16,'#fff',.8*va*(.5+.5*Math.sin(t*6)))+sparkle(600,250,12,'#FFE7A8',va*(.5+.5*Math.cos(t*5)))+sparkle(580,470,10,'#fff',.7*va*(.5+.5*Math.sin(t*7+1)));}
  fl=Math.max(fl,pulse(t,22.85,.3)*.35);
  if(t>=24.15){const ca=fade(t,24.15,26.6,.2,.25),cx=lerp(760,560,ease(win(t,24.15,24.5)));s+='<g opacity="'+f2(ca*(1-push))+'" transform="translate('+f1(cx)+' 760)"><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7">'
    +[-30,0,30].map((dx,i)=>'<path d="M'+dx+' -110 q-12 -18 0 -36 q12 -18 0 -36" transform="translate(0 '+f1(-((t*40+i*12)%24))+')"/>').join('')+'</g><path d="M-74 -86 h148 l-14 112 q-3 20 -24 20 h-72 q-21 0 -24 -20 z" fill="#fff"/><path d="M72 -66 q42 4 36 44 q-6 30 -44 28" fill="none" stroke="#fff" stroke-width="11"/><ellipse cx="0" cy="58" rx="98" ry="15" fill="#DADADA"/></g>';
   const w=fade(t,24.6,25.75,.08,.25);if(w>0){s+='<rect x="8" y="8" width="704" height="1264" rx="26" fill="none" stroke="#FFB547" stroke-width="'+f1(10+6*Math.sin(t*30))+'" opacity="'+f2(w*(.55+.45*Math.sin(t*30)))+'" filter="url(#gl)"/>';
    o+=T(360,120,44,'조심! 앵무새는 커피 금지','',w,'color:#FFB547;font-weight:900;text-shadow:0 0 16px rgba(255,181,71,.85)');}}
  if(t>=25.6)o+=T(540,660,76,'네 거!','',fade(t,25.65,26.6,.1,.2),'color:#FFD98A;font-weight:900;text-shadow:0 0 22px rgba(233,196,106,.9);transform:translate(-50%,-50%) scale('+f2(.6+.4*back(win(t,25.65,25.95)))+')');}
 // ── 7장면 받는 법 · 끝 ──
 else{if(t<29.4){const a=fade(t,26.5,29.4,.3,.35);s+=panel(60,130,600,500,a,'#E9C46A');o+=T(360,180,40,'이렇게 받아요','',a,'color:#FFD98A;font-weight:900;text-shadow:0 0 14px rgba(233,196,106,.8)');
   ['카톡으로 친구 10명 소개','보낸 화면 찍어 문자','스타벅스 상품권 1만원'].forEach((txt,i)=>{const t0=26.75+i*.6,lit=t>=t0,y=262+i*96,pa=a*(lit?1:.35);
    s+='<rect x="96" y="'+(y-36)+'" width="528" height="72" rx="18" fill="'+(lit?'rgba(127,255,230,.16)':'rgba(127,255,230,.05)')+'" stroke="'+(lit?'#BFFFF4':'#4FA898')+'" stroke-width="2.5" opacity="'+f2(a)+'"/><circle cx="138" cy="'+y+'" r="22" fill="'+(lit?'#E9C46A':'#4FA898')+'" opacity="'+f2(a)+'"/>';
    o+=T(138,y,28,String(i+1),'',a,'color:#0C2824;font-weight:900')+T(170,y,32,txt,'',pa,'transform:translate(0,-50%);text-align:left;color:#EEF6F2')+T(590,y,36,'✓','',a*ease(win(t,t0,t0+.2)),'color:#7FFFE6;text-shadow:0 0 12px rgba(80,240,210,.9)');
    if(lit)s+=ring(138,y,t0,t,.5,10,70,'#FFE7A8',5);});
   o+=T(360,560,42,'문자 010-9011-7377','',fade(t,28.15,29.4,.2,.3),'color:#FFD98A;font-weight:900;text-shadow:0 0 16px rgba(233,196,106,.85)')+T(360,610,32,'10명마다 1만원씩!','',fade(t,28.35,29.4,.2,.3),'color:#EEF6F2');}
  if(t>=29){s+=ring(360,880,29,t,.7,20,260,'#BFFFF4',8,.25);if(t<29.7){for(let i=0;i<10;i++){const x=240+((i*53)%240),y=((t*3000+i*170)%1300)-100;s+='<rect x="'+x+'" y="'+f1(y)+'" width="3" height="'+(80+(i%3)*50)+'" fill="#BFFFF4" opacity=".4"/>';}}
   fl=Math.max(fl,pulse(t,29.45,.35)*.6);if(t<29.5){const a2=(1-win(t,29,29.5))*7;cam='translate('+f1(Math.sin(t*90)*a2)+'px,'+f1(Math.cos(t*77)*a2)+'px)';}
   const ta=ease(win(t,29.5,30.2));if(ta>0){o+=T(360,262,128,'아틀란스','',ta,'font-weight:900;letter-spacing:6px;color:transparent;background:linear-gradient(100deg,#8FD9C4 0%,#FFFFFF 38%,#7FFFE6 50%,#FFFFFF 62%,#8FD9C4 100%);background-size:300% 100%;background-position:'+f1(100-win(t,29.6,31.6)*100)+'% 0;-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 14px rgba(127,255,230,.9)) drop-shadow(0 0 40px rgba(47,184,159,.75));transform:translate(-50%,-50%) scale('+f2(1.25-.25*ta)+')');
    s+=sparkle(118,190,18,'#FFE7A8',ta*(.5+.5*Math.sin(t*5)))+sparkle(606,330,14,'#fff',ta*(.5+.5*Math.cos(t*6)))+sparkle(560,186,10,'#FFE7A8',ta*(.5+.5*Math.sin(t*7+2)));}
   o+=T(360,354,34,'aaa7377.com','',fade(t,29.95,32.5,.3,.1),'color:#9FE0C8;font-weight:700;letter-spacing:1px')+T(360,402,27,'지난 기록을 센 공부예요 · 사고팔기를 권하지 않아요','',fade(t,30.1,32.5,.3,.1),'color:#B7D0C7;font-weight:600');}}
 // 홍표
 if(st.show){const tr='translate('+f1(st.X)+' '+f1(st.Y)+') scale('+(st.S*st.sx).toFixed(3)+' '+(st.S*st.sy).toFixed(3)+')';
  if(O.glowWing>.3||O.flame>.3)s+='<ellipse cx="'+f1(st.X+120*st.S)+'" cy="'+f1(st.Y+150*st.S)+'" rx="'+f1(170*st.S)+'" ry="'+f1(170*st.S)+'" fill="url(#aura)" opacity="'+f2(Math.max(O.glowWing,O.flame)*.8)+'"/>';
  s+='<g transform="'+tr+'" opacity="'+f2(st.ap==null?1:st.ap)+'">'+hongpyo(O,tn<6.5?tn:t,G)+'</g>';}
 document.getElementById('st').innerHTML=s;document.getElementById('ov').innerHTML=o;document.getElementById('cam').style.transform=cam;document.getElementById('flash').style.opacity=f2(fl);
 const k=CAP.find(c=>tn>=c[0]&&tn<c[1]),cap=document.getElementById('cap');if(k){const a=Math.min(win(tn,k[0],k[0]+.25),1-win(tn,k[1]-.22,k[1]));cap.innerHTML=k[2];cap.style.opacity=f2(Math.max(0,a));cap.style.transform='translateY('+f1((1-ease(win(tn,k[0],k[0]+.35)))*20)+'px) scale('+f2(.94+.06*ease(win(tn,k[0],k[0]+.3)))+')';}else cap.style.opacity=0;
 const bd=document.getElementById('band');bd.style.opacity=f2(fade(tn,4.0,19.35,.4,.35));bd.style.backgroundPosition=f1(100-((tn*35)%200))+'% 0';
 const pc=document.getElementById('pc'),pa=win(t,30.25,30.75);pc.style.opacity=f2(pa);pc.style.transform='translateY('+f1((1-ease(pa))*18)+'px)';};
</script></body>`;

const b = await chromium.launch({executablePath: exe});
const pg = await b.newPage({viewport: {width: W, height: H}});
await pg.setContent(page, {waitUntil: 'load'});
await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
if (ONLY) {
  for (const t of ONLY) { await pg.evaluate(x => window.render(x), t); await pg.screenshot({path: path.join(OUT, `t${String(t).replace('.', '_')}.png`)}); }
  console.log('frames', ONLY.length);
} else {
  const fdir = path.join(TMP, 'frames'); await fs.rm(fdir, {recursive: true, force: true}); await fs.mkdir(fdir, {recursive: true});
  const N = FPS * DUR;
  for (let i = 0; i < N; i++) { await pg.evaluate(x => window.render(x), i / FPS); await pg.screenshot({path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92}); }
  const PT = Number(process.env.HP_POSTER ?? 33.5);
  await pg.evaluate(x => window.render(x), PT); await pg.screenshot({path: path.join(OUT, 'makbi-poster.jpg'), type: 'jpeg', quality: 86});
  const wav = path.join(TMP, 'sound.wav');
  execFileSync('python3', [path.join(HERE, 'sound.py'), wav], {stdio: 'inherit'});
  const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], {stdio: 'inherit'});
  ff('-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'makbi-intro.mp4'));
  ff('-i', path.join(OUT, 'makbi-intro.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-c:a', 'libopus', '-b:a', '96k', path.join(OUT, 'makbi-intro.webm'));
  console.log('video', N, 'frames', DUR, 's');
}
await b.close();
