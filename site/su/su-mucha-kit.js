/* 수르 무하 공용 부품(일꾼 둘이 따로 만든 a · b 가운데 a — 머리 물결 · 두루마리 말림 · 손이 더 무하다움) (docs/design/su-musk-2026-11-05/kit-brief.md) — 선은 모두 채운 모양 · 색은 css(.mk-) · seed 로 같은 그림
   얼굴 단위 h = 이마 위 ~ 턱 끝 · (cx, cy) = 얼굴 가운데 · dir 1 = 오른쪽을 봄 · hair 의 view 는 face 와 같게 */
export const CSS='/su/su-mucha-kit.css';
const NS='http://www.w3.org/2000/svg',PI=Math.PI;
const f=v=>Math.round(v*10)/10;

export function svg(tag,attrs={},...kids){
  const e=document.createElementNS(NS,tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k,String(attrs[k]));
  for (const c of kids.flat(9)) if (c != null&&c !== false) e.append(c);
  return e;
}
const G=(cls,kids,extra={})=>svg('g',{class: cls||null,...extra},kids);
const P=(d,cls)=>svg('path',{d,class: cls});
const C0=(cx,cy,r,cls,sw)=>svg('circle',{cx: f(cx),cy: f(cy),r: f(r),class: cls,'stroke-width': sw == null?null:f(sw*100)/100});
function rnd(seed){
  let a=(Math.imul((seed | 0)+7,2654435761) ^ 0x9E3779B9) >>> 0;
  return ()=>{ a=(a+0x6D2B79F5) >>> 0; let t=Math.imul(a ^ a >>> 15,a | 1); t ^= t+Math.imul(t ^ t >>> 7,t | 61); return ((t ^ t >>> 14) >>> 0)/4294967296; };
}
const D=pts=>'M'+pts.map(p=>f(p[0])+' '+f(p[1])).join(' ');
const sm=(a,b,t)=>{ const x=Math.max(0,Math.min(1,(t-a)/(b-a))); return x*x*(3-2*x); };

function cr(pts,step=2.4,closed=false){
  const n=pts.length;
  if (n<2) return pts.slice();
  const at=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))],out=[pts[0]];
  for (let i=0; i<(closed?n:n-1); i++){
    const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);
    const k=Math.max(1,Math.min(14,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step)));
    for (let j=1; j<=k; j++){
      const t=j/k,t2=t*t,t3=t2*t;
      out.push([0,1].map(d=>0.5*(2*p1[d]+(p2[d]-p0[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(3*p1[d]-p0[d]-3*p2[d]+p3[d])*t3)));
    }
  }
  return out;
}
const blob=(pts,cls)=>P(D(cr(pts,2.4,true))+'Z',cls);

function band(pts,wf,step=2.4){
  const C=cr(pts,step),n=C.length;
  if (n<2) return '';
  const L=[0];
  for (let i=1; i<n; i++) L.push(L[i-1]+Math.hypot(C[i][0]-C[i-1][0],C[i][1]-C[i-1][1]));
  const tot=L[n-1]||1,A=[],B=[],T=[];
  for (let i=0; i<n; i++){
    const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)];
    let tx=b[0]-a[0],ty=b[1]-a[1];
    const d=Math.hypot(tx,ty)||1; tx/=d; ty/=d; T.push([tx,ty]);
    const w=Math.max(0.1,wf(L[i]/tot))/2;
    A.push([C[i][0]-ty*w,C[i][1]+tx*w]); B.push([C[i][0]+ty*w,C[i][1]-tx*w]);
  }
  const w0=Math.max(0.1,wf(0))/2,c=C[0],t0=T[0],cap=[];
  for (let k=1; k<5; k++){ const a=k/5*PI,cs=Math.cos(a),sn=Math.sin(a); cap.push([c[0]+w0*(cs*t0[1]-sn*t0[0]),c[1]+w0*(-cs*t0[0]-sn*t0[1])]); }
  const we=Math.max(0.1,wf(1))/2,e=C[n-1],te=T[n-1];
  return D([...A,[e[0]+te[0]*we*1.3,e[1]+te[1]*we*1.3],...B.reverse(),...cap])+'Z';
}
const lin=(a,b)=>s=>b+(a-b)*Math.pow(1-s,1.1);
const swell=(m,e=0.22)=>s=>m*(e+(1-e)*Math.sin(PI*Math.min(1,s*1.08)));
export function taper(pts,{w0=4,w1=0.5,cls='mk-ink'}={}){ return P(band(pts,lin(w0,w1)),cls); }

function nrm(C){ const m=C.length; return C.map((p,i)=>{ const a=C[Math.max(0,i-1)],b=C[Math.min(m-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1; return [-dy/d,dx/d]; }); }
/* 2판: 가는 올 n 가닥 → 굵은 다발 넷 ~ 여섯(n ≤ 3 이면 n 다발) · 다발마다 뿌리 굵고 끝 가는 띠 + 속 결 셋(어둡게 둘 · 밝게 하나) · S 로 흐르다 끝이 말림 */
export function strands(pts,{n=7,spread=9,w0=2.6,w1=0.25,curl=0.6,seed=1,cls='mk-hair0'}={}){
  const R=rnd(seed),C=cr(pts,3.5),m=C.length;
  if (m<2) return G(cls,[]);
  const N=nrm(C),nb=n<=3?Math.max(1,n | 0):Math.min(6,Math.max(4,Math.round(n*0.6))),bw=Math.max(w0*1.6,spread*1.5/nb),fr=0.6+R()*0.4,ph=R()*2*PI,out=[];
  let dk='',lt='';
  for (let k=0; k<nb; k++){
    const u=nb>1?k/(nb-1)-0.5:0,o=u*spread*(0.8+0.4*R()),amp=spread*(0.14+0.1*R()),p2=ph+(R()-0.5),last=Math.max(2,Math.round((m-1)*(0.8+0.2*R()))),sp=[],bk=bw*(0.8+0.4*R());
    for (let i=0; i<=last; i++){ const t=i/(m-1),off=o*(0.3+0.7*sm(0,0.4,t)-0.3*sm(0.72,1,t))+amp*Math.sin(2*PI*fr*t+p2)*sm(0.04,0.4,t); sp.push([C[i][0]+N[i][0]*off,C[i][1]+N[i][1]*off]); }
    if (curl>0&&(nb<2||R()<0.35+0.4*Math.min(1,curl))){
      const p=sp[sp.length-1],q=sp[sp.length-2],dl=Math.hypot(p[0]-q[0],p[1]-q[1])||1,dx=(p[0]-q[0])/dl,dy=(p[1]-q[1])/dl,sg=u>0.05?1:u<-0.05?-1:(R()<0.5?1:-1);
      const R0=bk*(0.75+0.45*R())*(0.6+curl*0.5),th=(0.9+0.5*R())*PI*Math.min(1.3,0.4+curl),c=[p[0]-dy*sg*R0,p[1]+dx*sg*R0],a0=Math.atan2(p[1]-c[1],p[0]-c[0]),st=Math.max(5,Math.ceil(th*R0/2.5));
      for (let j=1; j<=st; j++){ const t=j/st,a=a0+sg*th*t,r=R0*(1-0.45*t); sp.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)]); }
    }
    const wf=s=>w1+(bk-w1)*Math.pow(1-s,0.5)*(0.72+0.28*sm(0,0.12,s)),ns=nrm(sp),z=sp.length-1;
    const ln=(g,ww,s0,s1)=>{ const a=[]; for (let i=Math.round(s0*z); i<=Math.round(s1*z); i++){ const o2=g*wf(i/z); a.push([sp[i][0]+ns[i][0]*o2,sp[i][1]+ns[i][1]*o2]); } return a.length>1?band(a,s=>ww*wf(s0+(s1-s0)*s),9):''; };
    out.push(P(band(sp,wf,9),null));
    dk+=ln(-0.33,0.15,0.02,0.92)+(bk>5?ln(0.2,0.07,0.25,0.6):'');
    lt+=ln(0.0,0.13,0.06,0.58);
  }
  out.push(P(dk,'mk-hx'),P(lt,'mk-hy'));
  return G(cls,out);
}

function eye(M,ex,ey,ew,inner,iris,fine,hp){
  const Q=a=>M(a.map(([x,y])=>[ex+x*ew*inner,ey+y*ew])),W=ew*hp;
  const lidProf=s=>W*0.1*(s<0.16?0.25+0.75*s/0.16:1-0.82*Math.pow((s-0.16)/0.84,1.25));
  const k=[
    blob(Q([[-0.5,0.05],[-0.26,-0.035],[0.04,-0.06],[0.3,-0.035],[0.5,0.04],[0.28,0.11],[0,0.135],[-0.28,0.11]]),'mk-eyew'),
    blob(Q([[-0.13,-0.05],[0.23,-0.05],[0.235,0.06],[0.05,0.135],[-0.13,0.06]]),'mk-i'+iris),
    blob(Q([[-0.01,-0.045],[0.12,-0.045],[0.11,0.05],[0.0,0.05]]),'mk-pup'),C0(...M([[ex+0.14*ew*inner,ey-0.005*ew]])[0],Math.max(0.3,W*0.035),'mk-eyew'),
    P(band(Q([[-0.66,0.13],[-0.5,0.05],[-0.26,-0.055],[0.04,-0.085],[0.3,-0.055],[0.52,0.035]]),lidProf),'mk-ink'),
    P(band(Q([[-0.38,0.1],[-0.1,0.13],[0.2,0.112]]),swell(Math.max(0.3,W*0.032))),'mk-ink2'),
  ];
  if (fine){
    k.push(P(band(Q([[-0.36,-0.15],[-0.04,-0.215],[0.3,-0.165]]),swell(Math.max(0.25,W*0.028))),'mk-ink2'));
    for (const [bx,by,lx,ly] of [[-0.52,0.05,-0.72,0.2],[-0.42,0.0,-0.6,0.15],[-0.32,-0.04,-0.46,0.1]])
      k.push(P(band(Q([[bx,by],[(bx+lx)/2-0.03,(by+ly)/2],[lx,ly]]),lin(Math.max(0.3,W*0.05),0.1)),'mk-ink'));
  }
  return k;
}

const F3={
  neck: [[-.18,.22],[-.19,.6],[-.235,.97],[-.1,1.01],[.1,1.01],[.245,.97],[.19,.62],[.13,.38]],
  skin: [[.03,-.44],[.2,-.4],[.29,-.28],[.305,-.15],[.29,-.05],[.298,.06],[.268,.2],[.2,.33],[.125,.42],[.06,.458],[-.02,.452],[-.13,.39],[-.235,.26],[-.295,.08],[-.305,-.12],[-.26,-.33],[-.13,-.42]],
  far: [[.3,-.25],[.305,-.15],[.29,-.05],[.298,.06],[.268,.2],[.2,.33],[.125,.42],[.06,.458]],
  near: [[-.295,.02],[-.265,.2],[-.195,.32],[-.1,.415],[.01,.455]],
  nl: [[-.18,.36],[-.19,.62],[-.225,.92]],nr: [[.14,.42],[.18,.64],[.22,.9]],
  brows: [[[.02,-.165],[-.08,-.215],[-.2,-.212],[-.29,-.17]],[[.14,-.168],[.21,-.198],[.29,-.175]]],
  eyes: [[-.11,-.062,.215,1],[.2,-.06,.128,-1]],
  nose: [[.155,-.01],[.178,.07],[.186,.118],[.172,.148],[.148,.154]],nos: [[.058,.145],[.085,.158],[.105,.153]],
  lipU: [[.02,.272],[.065,.255],[.098,.262],[.128,.253],[.175,.268],[.13,.276],[.065,.278]],
  lipL: [[.035,.278],[.1,.28],[.165,.272],[.14,.302],[.09,.312],[.05,.298]],
  mouth: [[.012,.267],[.06,.278],[.1,.276],[.14,.277],[.182,.264]],
  chin: [[.07,.33],[.1,.334],[.13,.329]],
  blush: [[-.13,.12,.11,.06],[.22,.1,.05,.045]],
};
const FP={
  neck: [[-.16,.12],[-.18,.6],[-.235,.97],[-.1,1.01],[.06,1.01],[.17,.97],[.13,.72],[.11,.46]],
  skin: [[.15,-.45],[.205,-.38],[.245,-.25],[.26,-.14],[.25,-.075],[.29,.0],[.333,.08],[.356,.125],[.344,.15],[.303,.163],[.296,.2],[.313,.234],[.299,.258],[.306,.286],[.283,.32],[.264,.348],[.279,.4],[.263,.448],[.21,.485],[.09,.47],[-.03,.4],[-.1,.28],[-.14,.05],[-.14,-.2],[-.04,-.4]],
  nl: [[-.17,.32],[-.18,.62],[-.22,.95]],nr: [[.115,.48],[.13,.72],[.17,.95]],
  brow: [[.235,-.155],[.17,-.185],[.06,-.17]],
  lipU: [[.25,.252],[.296,.226],[.318,.238],[.303,.262],[.27,.262]],
  lipL: [[.268,.267],[.304,.265],[.313,.29],[.287,.31],[.262,.288]],
  mouth: [[.302,.263],[.27,.264],[.248,.255]],
  nos: [[.268,.122],[.282,.142],[.302,.143]],
  blush: [.11,.13,.085,.05],
};

export function face({cx,cy,h=40,dir=1,view='profile',tilt=0,cls='',iris=0}={}){
  const d=dir<0?-1:1,M=a=>a.map(([x,y])=>[x*h*d,y*h]),Wd=v=>Math.max(0.3,v*h),fine=h>=34;
  const L=(pts,wf,c='mk-ink')=>P(band(M(pts),wf),c),k=[];
  const ell=([x,y,rx,ry])=>svg('ellipse',{cx: f(x*h*d),cy: f(y*h),rx: f(rx*h),ry: f(ry*h),class: 'mk-blush'});
  if (view==='profile'){
    const S=FP.skin;
    k.push(blob(M(FP.neck),'mk-skin'),blob(M([[-0.1,0.36],[0.02,0.44],[0.12,0.49],[0.04,0.53],[-0.1,0.45]]),'mk-skin2'),blob(M(S),'mk-skin'),ell(FP.blush),
      blob(M(FP.lipU),'mk-lip'),blob(M(FP.lipL),'mk-lip2'),
      L(FP.nl,swell(Wd(0.02))),L(FP.nr,lin(Wd(0.02),Wd(0.004))),
      L([[0.21,0.485],[0.09,0.47],[-0.03,0.4],[-0.1,0.28]],lin(Wd(0.026),Wd(0.004))),
      L(S.slice(0,19),s=>Wd(0.006+0.02*Math.sin(PI*(0.15+s*0.85)))),
      ...eyeP(M,h,fine),
      L(FP.brow,lin(Wd(0.016),Wd(0.003))),L(FP.nos,swell(Wd(0.009)),'mk-ink2'),L(FP.mouth,swell(Wd(0.011))));
  }else{
    k.push(blob(M(F3.neck),'mk-skin'),blob(M([[-0.17,0.37],[-0.06,0.45],[0.06,0.49],[0.14,0.45],[0.06,0.53],[-0.08,0.5]]),'mk-skin2'),blob(M(F3.skin),'mk-skin'),
      ...F3.blush.map(ell),blob(M(F3.lipU),'mk-lip'),blob(M(F3.lipL),'mk-lip2'),
      L(F3.nl,lin(Wd(0.024),Wd(0.004))),L(F3.nr,swell(Wd(0.012))),
      L(F3.far,s=>Wd(0.004+0.022*Math.pow(Math.sin(PI*(0.2+s*0.72)),1.6))),L(F3.near,swell(Wd(0.016),0.15)),
      ...F3.eyes.flatMap(([x,y,w,inn])=>eye(M,x,y,w,inn,iris,fine,h)),
      ...F3.brows.map((b,i)=>L(b,s=>Wd((i?0.009:0.012)*(0.3+0.7*Math.sin(PI*Math.min(1,0.22+s*0.95)))))),
      L(F3.nose,s=>Wd(0.002+0.01*Math.sin(PI*Math.min(1,0.1+s*0.95)))),L(F3.nos,swell(Wd(0.008)),'mk-ink2'),L(F3.mouth,swell(Wd(0.011),0.35)),L(F3.chin,swell(Wd(0.006)),'mk-ink2'));
  }
  return G(('mk-face '+cls).trim(),k,{transform: `translate(${f(cx)} ${f(cy)}) rotate(${f(tilt*d)})`,'data-mucha': 'outline','aria-hidden': 'true'});
  function eyeP(M2,hh,fn){
    const e=[blob(M2([[0.1,-0.06],[0.17,-0.08],[0.215,-0.058],[0.18,-0.035],[0.12,-0.04]]),'mk-eyew'),
      blob(M2([[0.172,-0.066],[0.208,-0.058],[0.198,-0.038],[0.176,-0.042]]),'mk-i'+iris),
      L([[0.075,-0.055],[0.11,-0.07],[0.17,-0.085],[0.218,-0.057]],s=>Wd(0.004+0.02*Math.sin(PI*Math.min(1,0.2+s)))),
      L([[0.125,-0.036],[0.18,-0.031],[0.207,-0.048]],swell(Wd(0.006)),'mk-ink2')];
    if (fn) e.push(L([[0.1,-0.1],[0.165,-0.117],[0.212,-0.094]],swell(Wd(0.005)),'mk-ink2'),
      ...[[0.214,-0.058,0.24,-0.043],[0.204,-0.064,0.232,-0.05],[0.194,-0.07,0.218,-0.058]].map(([a,b,c,dd])=>L([[a,b],[c,dd]],lin(Wd(0.009),0.1))));
    return e;
  }
}

const H3={
  mass: [[.28,-.12],[.37,-.4],[.25,-.64],[.0,-.76],[-.3,-.75],[-.57,-.6],[-.69,-.32],[-.67,.0],[-.57,.3],[-.4,.36],[-.27,.1],[-.26,-.15],[-.12,-.3],[.1,-.32],[.24,-.2]],
  edge: [[.25,-.64],[.0,-.76],[-.3,-.75],[-.57,-.6],[-.69,-.32],[-.67,.0]],
  lines: [[[.06,-.5],[-.12,-.66],[-.4,-.67],[-.58,-.45],[-.62,-.15]],[[.04,-.49],[-.2,-.58],[-.44,-.5],[-.55,-.25],[-.52,.05]],
    [[.1,-.52],[.0,-.7],[-.25,-.745],[-.5,-.63]],[[.12,-.5],[.27,-.58],[.34,-.42],[.32,-.24]],[[-.2,-.46],[-.37,-.36],[-.43,-.12],[-.41,.15]]],
  lights: [[[-.04,-.62],[-.3,-.69],[-.5,-.56]],[[.17,-.57],[.3,-.47]]],
  locks: [[[-.5,.0],[-.62,.35],[-.5,.75],[-.64,1.15],[-.52,1.6],[-.66,2.0]],[[-.62,-.35],[-.78,.0],[-.72,.45],[-.86,.9],[-.76,1.35],[-.88,1.75]],
    [[.22,.05],[.36,.4],[.28,.8],[.42,1.2],[.34,1.6]],[[-.36,.22],[-.44,.55],[-.33,.9],[-.43,1.3],[-.34,1.7]]],
  swirl: [[-.25,-.74],[-.55,-.64],[-.7,-.34],[-.68,.02],[-.76,.42]],
};
const HP={
  mass: [[.17,-.43],[.14,-.62],[.0,-.74],[-.28,-.78],[-.56,-.67],[-.73,-.4],[-.73,-.08],[-.6,.22],[-.42,.36],[-.2,.3],[-.08,.05],[-.05,-.25],[.08,-.36]],
  edge: [[.14,-.62],[.0,-.74],[-.28,-.78],[-.56,-.67],[-.73,-.4],[-.73,-.08]],
  lines: [[[.13,-.52],[-.05,-.66],[-.35,-.69],[-.6,-.5],[-.66,-.2]],[[.1,-.49],[-.1,-.58],[-.36,-.56],[-.52,-.36],[-.55,-.05]],
    [[.12,-.57],[.0,-.71],[-.3,-.76]],[[-.13,-.42],[-.32,-.37],[-.45,-.16],[-.42,.16]],[[-.25,-.63],[-.5,-.59],[-.65,-.36]]],
  lights: [[[.02,-.64],[-.25,-.72],[-.48,-.62]],[[-.3,-.5],[-.42,-.3]]],
  locks: [[[-.45,.2],[-.5,.55],[-.38,.95],[-.5,1.35],[-.4,1.75],[-.52,2.1]],[[-.66,-.1],[-.8,.3],[-.7,.75],[-.85,1.2],[-.74,1.65]],
    [[-.3,.3],[-.33,.65],[-.22,1.0],[-.31,1.4],[-.22,1.75]],[[-.55,.15],[-.64,.5],[-.56,.9],[-.66,1.3]]],
  swirl: [[-.28,-.76],[-.58,-.66],[-.74,-.36],[-.72,.0],[-.8,.4]],
};
export function hair({cx,cy,h=40,dir=1,tone=0,flow='down',len=2.4,seed=1,view='three'}={}){
  const d=dir<0?-1:1,t=((tone | 0)%8+8)%8,Hd=view==='profile'?HP:H3,sway=flow==='down'?1:1.6;
  const ys=y=>(y<=0.3?y:0.3+(y-0.3)*Math.max(0.6,len)/2.4);
  const M=a=>a.map(([x,y])=>[x*h*d,ys(y)*h]),w=Math.max(0.3,h*0.012);
  const k=[blob(M(Hd.mass),'mk-hb'),
    P(band(M(Hd.edge),swell(Math.max(0.6,h*0.026),0.15)),'mk-hd'),
    ...Hd.lines.map(l=>P(band(M(l),lin(w*1.5,0.15)),'mk-hd')),
    ...Hd.lights.map(l=>P(band(M(l),swell(w*1.6)),'mk-hl'))];
  const sp=h*0.15;
  Hd.locks.forEach((l,i)=>{
    const a=l[0],b=l[l.length-1],g=i%2?1:-1,pts=M([0,0.2,0.4,0.6,0.8,1].map(t=>[a[0]+(b[0]-a[0])*t+(0.1*g*Math.sin(1.6*PI*t)+0.03*(sway-1))*sm(0,0.25,t),a[1]+(b[1]-a[1])*t]));
    k.push(G('mk-sway'+(i%2?'2':''),[strands(pts,{n: i===1?3:2,spread: sp*(i===1?1.3:1),w0: h*0.085,w1: 0.25,curl: 0.75,seed: seed*31+i,cls: 'mk-hb'})]));
  });
  k.push(strands(M(Hd.swirl),{n: 2,spread: sp*0.7,w0: h*0.07,w1: 0.25,curl: 0.8,seed: seed*7+3,cls: 'mk-hb'}));
  return G('mk-hair mk-t'+t,k,{transform: `translate(${f(cx)} ${f(cy)})`,'data-mucha': 'whiplash','aria-hidden': 'true'});
}

function petals(x,y,s,n,kind,rot=0){
  const lw=kind==='daisy'?0.16:kind==='lily'?0.24:0.48,ln=kind==='lily'?1.15:1;
  let d='';
  for (let i=0; i<n; i++){
    const a=rot+i*2*PI/n,ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca,L=s*ln,W=s*lw;
    const tip=[x+ca*L,y+sa*L],c1=[x+ca*L*0.45+px*W,y+sa*L*0.45+py*W],c2=[x+ca*L*0.45-px*W,y+sa*L*0.45-py*W];
    d+=`M${f(x)} ${f(y)}Q${f(c1[0])} ${f(c1[1])} ${f(tip[0])} ${f(tip[1])}Q${f(c2[0])} ${f(c2[1])} ${f(x)} ${f(y)}Z`;
  }
  return d;
}
function flower(x,y,s,kind,rot=0){
  const n={rose: 5,daisy: 11,poppy: 4,lily: 6}[kind]??5;
  const k=[P(petals(x,y,s,n,kind,rot),'mk-fl-'+kind)];
  if (kind==='rose') k.push(P(petals(x,y,s*0.55,5,kind,rot+0.6),'mk-fl-rose2'));
  k.push(C0(x,y,s*(kind==='poppy'?0.3:0.22),kind==='poppy'?'mk-fl-c2':'mk-fl-c'));
  return k;
}
function leafD(x,y,a,L,W){
  const ca=Math.cos(a),sa=Math.sin(a),q=(u,v)=>f(x+ca*u-sa*v)+' '+f(y+sa*u+ca*v);
  return `M${q(0,0)}C${q(L*0.25,-W)} ${q(L*0.7,-W*0.8)} ${q(L,0)}C${q(L*0.65,W*0.7)} ${q(L*0.3,W*0.9)} ${q(0,0)}Z`;
}
function starD(x,y,r){ let d=''; for (let i=0; i<10; i++){ const a=-PI/2+i*PI/5,rr=i%2?r*0.42:r; d+=(i?'L':'M')+f(x+rr*Math.cos(a))+' '+f(y+rr*Math.sin(a)); } return d+'Z'; }
const dotD=(x,y,r)=>`M${f(x-r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2*r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2*r)} 0`;

/* 여인 여덟 [머리색 얼굴 방향 기울기 장식 옷 후광 눈 보석] */
const WOMEN=[[0,'three',1,-6,'rose','peach',0,0,'r'],[1,'profile',-1,3,'pearl','sage',1,1,'g'],[2,'three',-1,7,'daisy','cream',2,0,'b'],[3,'profile',1,-3,'diadem','rose',3,2,'r'],
  [4,'three',1,5,'laurel','sage',0,1,'g'],[5,'three',-1,-7,'poppy','peach',1,0,'r'],[6,'profile',-1,2,'stars','cream',2,2,'b'],[7,'three',1,8,'lily','rose',3,1,'g']];

export function medallion({cx,cy,r,v=0,dir=1,ring='mosaic'}={}){
  const W8=WOMEN[((v | 0)%8+8)%8],[tone,view,d0,tilt,hd,cloth,hf,iris,gem]=W8;
  const d=d0*(dir<0?-1:1),h=r*0.6,fx=cx+d*r*0.05,fy=cy-r*0.1,k=[];
  const X=(u,v2)=>[fx+u*h*d,fy+v2*h];
  k.push(C0(cx,cy,r,'mk-hf'+hf),P(rayD(cx,cy,r*0.32,r*0.8,32,0.05),'mk-hray'),C0(cx,cy,r*0.8,'mk-rim2',Math.max(0.5,r*0.012)));
  const ri=r*0.85,ro=r*0.975,rm=(ri+ro)/2,bw=ro-ri;
  if (ring==='stars'){
    const n=Math.max(12,Math.round(2*PI*rm/9));
    let s1='',s2='';
    for (let i=0; i<n; i++){ const a=i*2*PI/n,x=cx+rm*Math.cos(a),y=cy+rm*Math.sin(a); if (i%2) s2+=dotD(x,y,bw*0.12); else s1+=starD(x,y,bw*0.36); }
    k.push(G(null,[C0(cx,cy,rm,'mk-nightb',bw),P(s1,'mk-star'),P(s2,'mk-star2')],{'data-mucha': 'stars'}));
  }else if (ring==='petal'){
    const n=Math.max(14,Math.round(2*PI*rm/8));
    let a1='',a2='',dt='';
    for (let i=0; i<n; i++){
      const a=i*2*PI/n,x=cx+ri*Math.cos(a),y=cy+ri*Math.sin(a),ca=Math.cos(a),sa=Math.sin(a),L=bw*1.0,W=bw*0.5;
      const pd=`M${f(x)} ${f(y)}Q${f(x+ca*L*0.5-sa*W)} ${f(y+sa*L*0.5+ca*W)} ${f(x+ca*L)} ${f(y+sa*L)}Q${f(x+ca*L*0.5+sa*W)} ${f(y+sa*L*0.5-ca*W)} ${f(x)} ${f(y)}Z`;
      if (i%2) a2+=pd; else a1+=pd;
      const b=a+PI/n; dt+=dotD(cx+(ro-bw*0.15)*Math.cos(b),cy+(ro-bw*0.15)*Math.sin(b),bw*0.1);
    }
    k.push(G(null,[P(a1,'mk-pe-a'),P(a2,'mk-pe-b'),P(dt,'mk-mo-g')],{'data-mucha': 'pastel'}));
  }else{
    const n=Math.max(15,Math.round(2*PI*rm/6.6/3)*3),q=['','',''];
    let dt='';
    for (let i=0; i<n; i++){
      const a=i*2*PI/n,x=cx+rm*Math.cos(a),y=cy+rm*Math.sin(a),s=bw*0.36,ca=Math.cos(a+PI/4),sa=Math.sin(a+PI/4);
      q[i%3]+=`M${f(x+ca*s)} ${f(y+sa*s)}L${f(x-sa*s)} ${f(y+ca*s)}L${f(x-ca*s)} ${f(y-sa*s)}L${f(x+sa*s)} ${f(y-ca*s)}Z`;
      const b=a+PI/n; dt+=dotD(cx+rm*Math.cos(b),cy+rm*Math.sin(b),bw*0.1);
    }
    k.push(G(null,[C0(cx,cy,rm,'mk-mob',bw),P(q[0],'mk-mo-g'),P(q[1],'mk-mo-b'),P(q[2],'mk-mo-n'),P(dt,'mk-mo-d')],{'data-mucha': 'mosaic'}));
  }
  k.push(C0(cx,cy,r,'mk-rim',Math.max(1.2,r*0.034)),C0(cx,cy,ri-r*0.015,'mk-rim2',Math.max(0.5,r*0.012)));
  k.push(hair({cx: fx,cy: fy,h,dir: d,tone,len: 2.15,seed: v+3,view}),face({cx: fx,cy: fy,h,dir: d,view,tilt,iris}));
  const a1=(d>0?40:46)*PI/180,a2=(d>0?46:40)*PI/180,L0=[cx-r*Math.cos(a1),cy+r*Math.sin(a1)],R0=[cx+r*Math.cos(a2),cy+r*Math.sin(a2)];
  const nk=view==='profile'?-0.03:0,SL=[L0,[cx-r*0.52,cy+r*0.46],X(nk-0.42,0.77),X(nk-0.24,0.665)],SR=[R0,[cx+r*0.52,cy+r*0.46],X(nk+0.4,0.77),X(nk+0.24,0.665)];
  const sh=cr([...SL,X(nk,0.69),...SR.slice().reverse()],2.4);
  k.push(P(D(sh)+`A${f(r)} ${f(r)} 0 0 1 ${f(L0[0])} ${f(L0[1])}Z`,'mk-cl-'+cloth));
  for (const [u,e,b2] of [[-0.12,-0.36,-0.06],[0.15,0.3,0.05]]) k.push(P(band([X(nk+u,0.8),X(nk+u*1.5+b2,1.05),[cx+r*e*0.8*d,cy+r*0.78],[cx+r*e*d,cy+r*0.97]],lin(Math.max(0.6,h*0.04),0.15)),'mk-cld-'+cloth));
  k.push(P(band(SL,lin(Math.max(0.9,h*0.05),0.3)),'mk-ink'),P(band(SR,lin(Math.max(0.6,h*0.03),0.25)),'mk-ink'));
  const col=[X(nk-0.24,0.6),X(nk,0.635),X(nk+0.24,0.6),X(nk+0.28,0.71),X(nk,0.755),X(nk-0.28,0.71)];
  k.push(blob(col,'mk-collar'),beads(...X(nk-0.25,0.715),...X(nk+0.25,0.715),{gap: Math.max(2.4,h*0.075),r: Math.max(0.6,h*0.018)}));
  const gp=X(nk,0.755);
  k.push(P(`M${f(gp[0])} ${f(gp[1])}C${f(gp[0]+h*0.07)} ${f(gp[1]+h*0.08)} ${f(gp[0]+h*0.05)} ${f(gp[1]+h*0.17)} ${f(gp[0])} ${f(gp[1]+h*0.2)}C${f(gp[0]-h*0.05)} ${f(gp[1]+h*0.17)} ${f(gp[0]-h*0.07)} ${f(gp[1]+h*0.08)} ${f(gp[0])} ${f(gp[1])}Z`,'mk-gem-'+gem));
 
  const fl=(view==='profile'?[[-0.4,0.16],[-0.47,0.55],[-0.4,0.95],[-0.54,1.35],[-0.46,1.72],[-0.6,2.05]]:[[-0.3,0.12],[-0.42,0.5],[-0.34,0.9],[-0.5,1.3],[-0.42,1.72],[-0.6,2.06]]).map(([u,v2])=>X(u,v2));
  k.push(G('mk-hair mk-t'+tone,[G('mk-sway',[strands(fl,{n: 3,spread: h*0.24,w0: h*0.11,w1: 0.2,curl: 0.75,seed: v*5+2,cls: 'mk-hb'})])]));
  k.push(...crown(hd,fx,fy,h,d,view,gem));
  return G('mk-med',k,{'data-mucha': 'halo','aria-hidden': 'true'});
}
function crown(kind,fx,fy,h,d,view,gem){
  const ox=view==='profile'?-0.2:-0.14,A=a=>[fx+(ox+0.52*Math.cos(a))*h*d,fy+(-0.3+0.47*Math.sin(a))*h];
  const deg=x=>x*PI/180,k=[];
  if (kind==='rose'||kind==='poppy'||kind==='daisy'||kind==='lily'){
    const spots={rose: [[-150,0.15],[-118,0.19],[-86,0.13]],poppy: [[-162,0.2],[-128,0.17]],daisy: [[-160,0.11],[-132,0.13],[-104,0.11],[-78,0.1]],lily: [[-170,0.17],[-140,0.2]]}[kind];
    let lv='';
    for (const [a,s] of spots){ const p=A(deg(a)); lv+=leafD(p[0],p[1],deg(a+25)*d+(d<0?PI:0),s*h*1.4,s*h*0.42); }
    k.push(P(lv,'mk-leaf'));
    spots.forEach(([a,s],i)=>{ const p=A(deg(a)); k.push(...flower(p[0],p[1],s*h,kind,i*0.7)); });
    if (kind==='poppy'){ const p=A(deg(-100)); k.push(P(leafD(p[0],p[1],deg(-60),h*0.12,h*0.06),'mk-fl-poppy')); }
  }else if (kind==='pearl'||kind==='diadem'){
    const arc=[];
    for (let a=-172; a<=-8; a+=14) arc.push(A(deg(a)));
    if (kind==='diadem'){
      k.push(P(band(arc,swell(Math.max(1,h*0.06),0.5)),'mk-gold2'),P(band(arc,swell(Math.max(0.4,h*0.012),0.5)),'mk-gold'));
      for (const a of [-130,-90,-50]){ const p=A(deg(a)); k.push(C0(p[0],p[1],h*(a===-90?0.06:0.04),'mk-gem-'+gem)); }
      for (const a of [-172,-8]){ const p=A(deg(a)); k.push(C0(p[0],p[1]+h*0.08,h*0.07,'mk-gold2'),C0(p[0],p[1]+h*0.08,h*0.035,'mk-gem-'+gem)); }
    }else{
      let dd='';
      for (let i=0; i<arc.length-1; i++) for (let j=0; j<3; j++){ const t=j/3; dd+=dotD(arc[i][0]+(arc[i+1][0]-arc[i][0])*t,arc[i][1]+(arc[i+1][1]-arc[i][1])*t,Math.max(0.6,h*0.022)); }
      k.push(P(dd,'mk-pearl'));
      const p=A(deg(-62)); k.push(C0(p[0],p[1],h*0.055,'mk-gem-'+gem),P(leafD(p[0],p[1],deg(-40),h*0.16,h*0.05)+leafD(p[0],p[1],deg(-80),h*0.14,h*0.05),'mk-leaf'));
    }
  }else if (kind==='laurel'){
    let lv='',br='';
    for (let a=-176; a<=-20; a+=13){ const p=A(deg(a)),t=deg(a+90)*1; lv+=leafD(p[0],p[1],t*d+(d<0?PI:0)+0.5,h*0.15,h*0.05)+leafD(p[0],p[1],t*d+(d<0?PI:0)-0.5+PI,h*0.13,h*0.045); }
    for (const a of [-150,-105,-60]){ const p=A(deg(a)); br+=dotD(p[0],p[1],Math.max(0.7,h*0.03)); }
    k.push(P(lv,'mk-leaf'),P(br,'mk-gem-'+gem));
  }else{
    const p=A(deg(-120)),r=h*0.16;
    k.push(P(`M${f(p[0])} ${f(p[1]-r)}A${f(r)} ${f(r)} 0 1 0 ${f(p[0])} ${f(p[1]+r)}A${f(r*0.78)} ${f(r*0.78)} 0 1 1 ${f(p[0])} ${f(p[1]-r)}Z`,'mk-moon'));
    let st='';
    for (const [a,s] of [[-160,0.06],[-88,0.07],[-60,0.05],[-30,0.045]]){ const q=A(deg(a)); st+=starD(q[0],q[1],h*s); }
    k.push(P(st,'mk-star'));
  }
  return k;
}

const SC=['cream','rose','sage','gold'];
export function scroll({x,y,w,h,ends='both',tone='cream'}={}){
  const t=SC.includes(tone)?tone:'cream',Lr=ends==='both'||ends==='left',Rr=ends==='both'||ends==='right';
  const rx=h*0.4,yc=y+h/2,k0=Math.min(h*0.16,w*0.02),x0=x+(Lr?rx:h*0.5),x1=x+w-(Rr?rx:h*0.5),xm=(x0+x1)/2;
  const top=`M${f(x0)} ${f(y)}Q${f(xm)} ${f(y-2*k0)} ${f(x1)} ${f(y)}`,bot=`M${f(x1)} ${f(y+h)}Q${f(xm)} ${f(y+h-2*k0)} ${f(x0)} ${f(y+h)}`;
  const body=top+(Rr?`L${f(x1)} ${f(y+h)}`:`A${f(h/2)} ${f(h/2)} 0 0 1 ${f(x1)} ${f(y+h)}`)+`Q${f(xm)} ${f(y+h-2*k0)} ${f(x0)} ${f(y+h)}`+(Lr?'Z':`A${f(h/2)} ${f(h/2)} 0 0 1 ${f(x0)} ${f(y)}Z`);
  const k=[P(body,'mk-sc-'+t),P(body,'mk-gl4')];
  const roll=(ex,sg)=>{
    const c=[ex,yc+h*0.1],r0=h*0.24,sp=[[ex,y+0.6]];
    for (let i=0; i<=22; i++){ const u=i/22,a=-PI/2+sg*u*1.75*PI,r=r0*(1-0.72*u); sp.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)]); }
    return [svg('ellipse',{cx: f(c[0]+sg*r0*0.15),cy: f(c[1]),rx: f(r0*0.8),ry: f(r0),class: 'mk-scd-'+t}),P(band(sp,lin(Math.max(0.6,h*0.05),0.25)),'mk-gold')];
  };
  const i=Math.max(2,h*0.1);
  k.push(P(`M${f(x0+(Lr?rx*0.9:0))} ${f(y+i)}Q${f(xm)} ${f(y+i-2*k0)} ${f(x1-(Rr?rx*0.9:0))} ${f(y+i)}M${f(x0+(Lr?rx*0.9:0))} ${f(y+h-i)}Q${f(xm)} ${f(y+h-i-2*k0)} ${f(x1-(Rr?rx*0.9:0))} ${f(y+h-i)}`,'mk-gl2'));
  if (Lr) k.push(...roll(x0,-1));
  if (Rr) k.push(...roll(x1,1));
  const ix=x0+(Lr?rx+4:4),iw=x1-(Rr?rx+4:4)-ix;
  return G('mk-scroll',k,{'data-ix': f(ix),'data-iy': f(y+i+1),'data-iw': f(Math.max(0,iw)),'data-ih': f(h-2*i-2),'data-mucha': 'lettering','aria-hidden': 'true'});
}

const BT=['gold','rose','sage','red','blue'];
const cub=(a,b,c,e,n)=>Array.from({length: n+1},(_,i)=>{ const t=i/n,u=1-t; return [0,1].map(j=>u*u*u*a[j]+3*u*u*t*b[j]+3*u*t*t*c[j]+t*t*t*e[j]); });
export function stemBar({x,y,len,dir='up',w=14,tip='bud',tone='gold',seed=1}={}){
  const t=BT.includes(tone)?tone:'gold',a={up: 0,right: 90,down: 180,left: -90}[dir]??0,L=Math.max(0,+len||0),hw=w/2,tw=w*0.35,rr=Math.min(tw,L/2),top=-L+rr,k=[];
  const shape=(hw2,tw2,rr2,tp)=>`M${f(-hw2)} 0C${f(-hw2)} ${f(tp*0.45)} ${f(-tw2)} ${f(tp*0.7)} ${f(-tw2)} ${f(tp)}A${f(tw2)} ${f(rr2)} 0 0 1 ${f(tw2)} ${f(tp)}C${f(tw2)} ${f(tp*0.7)} ${f(hw2)} ${f(tp*0.45)} ${f(hw2)} 0Z`;
  if (L>0.5){
    k.push(P(shape(hw,tw,rr,top),'mk-bar-'+t));
    if (L>8) k.push(P(shape(hw-1.8,Math.max(0.6,tw-1.8),Math.max(0.5,rr-1.8),top),'mk-gl2'));
    if (L>3){
      const ol=cub([-hw,-0.7],[-hw,top*0.45],[-tw,top*0.7],[-tw,top],7);
      for (let i=1; i<10; i++){ const q=PI+i*PI/10; ol.push([tw*Math.cos(q),top+rr*Math.sin(q)]); }
      ol.push(...cub([tw,top],[tw,top*0.7],[hw,top*0.45],[hw,-0.7],7));
      k.push(P(band(ol,s=>0.4+w*0.12*Math.pow(Math.abs(2*s-1),1.5),9),'mk-barl-'+t));
    }
    if (L>w*3){ const s=seed%2?1:-1,ly=-Math.min(L*0.32,L-w*2); k.push(P(leafD(s*hw*0.35,ly,-PI/2+s*0.62,w*0.78,w*0.24),'mk-leaf')); }
  }
  const b0=-L+0.5;
  if (tip==='bud'){
    const bh=w*0.9,bw=w*0.36,nb=b0-w*0.16;
    k.push(P(`M${f(-w*0.07)} ${f(b0+1)}L${f(-w*0.06)} ${f(nb)}L${f(w*0.06)} ${f(nb)}L${f(w*0.07)} ${f(b0+1)}Z`,'mk-vstem0'),
      P(`M0 ${f(nb)}C${f(bw*1.35)} ${f(nb-bh*0.12)} ${f(bw*0.7)} ${f(nb-bh*0.82)} 0 ${f(nb-bh)}C${f(-bw*0.7)} ${f(nb-bh*0.82)} ${f(-bw*1.35)} ${f(nb-bh*0.12)} 0 ${f(nb)}Z`,'mk-bud-'+t),
      P(leafD(0,nb+0.5,-PI/2-0.2,w*0.66,w*0.17)+leafD(0,nb+0.5,-PI/2+0.2,w*0.66,w*0.17),'mk-leaf'),
      P(band([[0,nb-bh*0.3],[bw*0.12,nb-bh*0.6],[0,nb-bh*0.92]],lin(Math.max(0.4,w*0.04),0.1)),'mk-gl3'));
  }else if (tip==='leaf'){
    k.push(P(leafD(0,b0,-PI/2-0.5,w*0.9,w*0.26)+leafD(0,b0,-PI/2+0.5,w*0.8,w*0.24),'mk-leaf'));
  }else if (tip==='flower'){
    const rf=w*0.56,cy=b0-w*0.12-rf;
    k.push(P(`M${f(-w*0.07)} ${f(b0+1)}L${f(-w*0.06)} ${f(cy)}L${f(w*0.06)} ${f(cy)}L${f(w*0.07)} ${f(b0+1)}Z`,'mk-vstem0'),
      P(leafD(0,cy+rf*0.5,PI*0.85,w*0.5,w*0.15)+leafD(0,cy+rf*0.5,PI*0.15,w*0.5,w*0.15),'mk-leaf'),
      P(petals(0,cy,rf,5,'rose',-PI/2),'mk-bud-'+t),P(petals(0,cy,rf*0.55,5,'rose',-PI/2+0.63),'mk-fl-in'),C0(0,cy,rf*0.24,'mk-fl-c'));
  }else if (tip==='closed'){
    const bh=w*0.9,bw=w*0.34,nb=b0-w*0.16;
    k.push(P(`M${f(-w*0.07)} ${f(b0+1)}L${f(-w*0.06)} ${f(nb)}L${f(w*0.06)} ${f(nb)}L${f(w*0.07)} ${f(b0+1)}Z`,'mk-vstem0'),
      P(`M0 ${f(nb)}C${f(bw*1.3)} ${f(nb-bh*0.15)} ${f(bw*0.5)} ${f(nb-bh*0.85)} 0 ${f(nb-bh)}C${f(-bw*0.5)} ${f(nb-bh*0.85)} ${f(-bw*1.3)} ${f(nb-bh*0.15)} 0 ${f(nb)}Z`,'mk-bud-shut'),
      P(band([[bw*0.15,nb-bh*0.12],[bw*0.3,nb-bh*0.5],[0,nb-bh*0.95]],lin(Math.max(0.4,w*0.05),0.15)),'mk-shut2'),
      P(leafD(0,nb+0.5,-PI/2-0.32,w*0.48,w*0.15)+leafD(0,nb+0.5,-PI/2+0.32,w*0.48,w*0.15)+leafD(0,nb+0.5,-PI/2,w*0.36,w*0.12),'mk-leaf'));
  }
  return G('mk-bar',k,{transform: `translate(${f(x)} ${f(y)})`+(a?` rotate(${a})`:''),'data-mucha': 'vine','aria-hidden': 'true'});
}

export function vine(pts,{w0=5,w1=1,leaves=6,buds=3,seed=1}={}){
  const R=rnd(seed),C=cr(pts,3),m=C.length;
  if (m<2) return G('mk-vine',[],{'data-mucha': 'vine'});
  const Ls=[0];
  for (let i=1; i<m; i++) Ls.push(Ls[i-1]+Math.hypot(C[i][0]-C[i-1][0],C[i][1]-C[i-1][1]));
  const tot=Ls[m-1]||1;
  const at=s=>{ const L=s*tot; let i=1; while (i<m-1&&Ls[i]<L) i++; const a=C[i-1],b=C[i],dl=Ls[i]-Ls[i-1]||1,u=(L-Ls[i-1])/dl; return [[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],Math.atan2(b[1]-a[1],b[0]-a[0])]; };
  const wAt=s=>w1+(w0-w1)*Math.pow(1-s,1.1);
  let lv='',vn='',st='',bd='',sp='';
  const k=[taper(pts,{w0,w1,cls: 'mk-vstem'})];
  for (let i=0; i<leaves; i++){
    const s=0.05+0.9*(i+0.2+R()*0.6)/leaves,[p,a]=at(s),side=(i%2?1:-1)*(R()<0.15?-1:1),sz=(6+w0*1.5)*(0.55+0.8*R())*(1-s*0.3);
    const la=a+side*(0.65+R()*0.45),bx=p[0]-Math.sin(a)*side*wAt(s)*0.4,by=p[1]+Math.cos(a)*side*wAt(s)*0.4;
    lv+=leafD(bx,by,la,sz,sz*(0.3+R()*0.08));
    vn+=`M${f(bx)} ${f(by)}Q${f(bx+Math.cos(la)*sz*0.5-Math.sin(la)*sz*0.05)} ${f(by+Math.sin(la)*sz*0.5+Math.cos(la)*sz*0.05)} ${f(bx+Math.cos(la)*sz*0.85)} ${f(by+Math.sin(la)*sz*0.85)}`;
  }
  for (let i=0; i<buds; i++){
    const s=0.12+0.82*(i+0.3+R()*0.5)/buds,[p,a]=at(s),side=i%2?-1:1,ba=a+side*(0.5+R()*0.4),ln=5+w0*1.2+R()*4;
    const q=[p[0]+Math.cos(ba)*ln,p[1]+Math.sin(ba)*ln],bs=2.6+w0*0.5+R()*1.4;
    st+=`M${f(p[0])} ${f(p[1])}Q${f(p[0]+Math.cos(ba-side*0.4)*ln*0.6)} ${f(p[1]+Math.sin(ba-side*0.4)*ln*0.6)} ${f(q[0])} ${f(q[1])}`;
    const c=Math.cos(ba),sn=Math.sin(ba),T=(u,v)=>f(q[0]+c*u-sn*v)+' '+f(q[1]+sn*u+c*v);
    bd+=`M${T(0,0)}C${T(bs*0.3,bs*0.9)} ${T(bs*1.4,bs*0.6)} ${T(bs*1.9,0)}C${T(bs*1.4,-bs*0.6)} ${T(bs*0.3,-bs*0.9)} ${T(0,0)}Z`;
    sp+=leafD(q[0],q[1],ba+0.5,bs*0.9,bs*0.3)+leafD(q[0],q[1],ba-0.5,bs*0.9,bs*0.3);
  }
  for (let i=0; i<2; i++){
    const s=0.3+0.4*i+R()*0.1,[p,a]=at(s),side=i?1:-1,tp=[p],R0=3+w0*0.6;
    for (let j=1; j<=14; j++){ const u=j/14,aa=a+side*(0.6+u*4.2),r2=R0*(1.6-1.1*u); tp.push([tp[j-1][0]+Math.cos(aa)*r2*0.55,tp[j-1][1]+Math.sin(aa)*r2*0.55]); }
    k.push(P(band(tp,lin(Math.max(0.6,w1*0.9),0.15)),'mk-vstem'));
  }
  k.push(P(st,'mk-vstalk'),P(lv,'mk-vleaf'),P(vn,'mk-vvein'),P(sp,'mk-leaf'),P(bd,'mk-vbud'));
  return G('mk-vine',k,{'data-mucha': 'vine','aria-hidden': 'true'});
}

export function beads(x0,y0,x1,y1,{gap=9,r=1.5}={}){
  const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.floor(L/gap));
  let a='',b='';
  for (let i=0; i<=n; i++){ const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t; if (i%2) b+=dotD(x,y,r*0.55); else a+=dotD(x,y,r); }
  return G('mk-beads',[P(a,'mk-bead'),P(b,'mk-bead2')],{'aria-hidden': 'true'});
}

function rayD(cx,cy,r0,r1,n,wd=0.024){
  let d='';
  for (let i=0; i<n; i++){
    const a=i*2*PI/n,re=i%2?r0+(r1-r0)*0.72:r1,w0=0.004,w1=wd*(i%2?0.7:1);
    const p=(r,aa)=>f(cx+r*Math.cos(aa))+' '+f(cy+r*Math.sin(aa));
    d+=`M${p(r0,a-w0)}L${p(re,a-w1)}L${p(re,a+w1)}L${p(r0,a+w0)}Z`;
  }
  return d;
}
export function rays(cx,cy,r0,r1,{n=40}={}){ return G('mk-rays',[P(rayD(cx,cy,r0,r1,n),'mk-ray')],{'data-mucha': 'halo','aria-hidden': 'true'}); }

/* (x,y)=소매 위 끝 · ang 0=아래로 */
const CL=['ivory','peach','sage','rose','cream'];
const HANDS={
  rest: [[[-.13,.3],[-.15,.6],[-.14,.78]],[[-.05,.3],[-.065,.66],[-.05,.86],[-.035,.91]],[[.035,.3],[.028,.7],[.038,.93],[.052,.98]],[[.11,.3],[.112,.64],[.118,.84],[.135,.89]],[[.15,.1],[.2,.3],[.185,.48],[.16,.56]]],
  hold: [[[-.13,.42],[-.15,.55],[-.08,.63],[-.02,.6]],[[-.05,.44],[-.065,.6],[.01,.69],[.07,.66]],[[.035,.45],[.025,.62],[.09,.71],[.15,.67]],[[.11,.43],[.105,.58],[.16,.66],[.21,.62]],[[.15,.1],[.22,.3],[.17,.48],[.08,.55]]],
  touch: [[[-.12,.3],[-.15,.6],[-.15,.76],[-.13,.8]],[[-.045,.3],[-.06,.66],[-.055,.87],[-.035,.92]],[[.035,.3],[.038,.7],[.05,.94],[.07,.98]],[[.11,.3],[.125,.64],[.145,.84],[.165,.88]],[[.15,.1],[.22,.28],[.25,.42],[.25,.48]]],
};
export function sleeve({x,y,ang=0,len=40,w=16,hand='rest',dir=1,tone='ivory'}={}){
  const d=dir<0?-1:1,t=CL.includes(tone)?tone:'ivory',HL=w*1.25,hp=HANDS[hand]??HANDS.rest,k=[];
  const Hm=a=>a.map(([u,v])=>[u*HL*d,len-w*0.12+v*HL]),lw=Math.max(0.3,HL*0.012),fw=s=>HL*(0.098-0.046*s);
  const fing=pts=>[P(band(Hm(pts),s=>fw(s)+2*lw),'mk-ink'),P(band(Hm(pts),s=>Math.max(0.3,fw(s)-0.2)),'mk-skin')];
  const palm=Hm([[-0.12,-0.25],[-0.13,0.0],[-0.165,0.22],[-0.165,0.43],[-0.1,0.48],[0.0,0.49],[0.1,0.47],[0.152,0.36],[0.162,0.18],[0.12,0.0],[0.11,-0.25]]);
  const pl=[blob(palm,'mk-skin'),P(band(Hm([[-0.13,0.0],[-0.165,0.22],[-0.165,0.42]]),swell(lw*2)),'mk-ink'),P(band(Hm([[0.12,0.0],[0.16,0.18],[0.155,0.34]]),swell(lw*1.4)),'mk-ink2')];
  if (hand==='hold') k.push(...pl,...hp.slice(0,4).flatMap(fing));
  else k.push(...hp.slice(0,4).flatMap(fing),...pl);
  k.push(...fing(hp[4]));
  const S=[[-0.24*w,0],[-0.3*w,len*0.35],[-0.5*w,len*0.72],[-0.82*w,len+w*0.12],[-0.36*w,len+w*0.2],[0.1*w,len+w*0.06],[0.56*w,len-w*0.1],[0.38*w,len*0.55],[0.26*w,0],[0,-w*0.12]].map(([u,v])=>[u*d,v]);
  k.push(blob(S,'mk-cl-'+t));
  for (const [u0,u1,b] of [[-0.12,-0.6,0.1],[0.04,-0.14,-0.08],[0.18,0.34,0.06]]) k.push(P(band([[u0*w*d,len*0.12],[(u0*0.6+u1*0.4+b)*w*d,len*0.48],[(u0*0.2+u1*0.8-b)*w*d,len*0.8],[u1*w*d,len+w*0.1]],lin(Math.max(0.5,w*0.065),0.15)),'mk-cld-'+t));
  k.push(P(band([[-0.24*w*d,0],[-0.3*w*d,len*0.35],[-0.5*w*d,len*0.72],[-0.82*w*d,len+w*0.12]],lin(Math.max(0.6,w*0.07),Math.max(0.4,w*0.03))),'mk-ink'),
    P(band([[0.26*w*d,0],[0.38*w*d,len*0.55],[0.56*w*d,len-w*0.1]],swell(Math.max(0.4,w*0.035))),'mk-ink2'),
    P(band([[-0.82*w*d,len+w*0.12],[-0.36*w*d,len+w*0.2],[0.1*w*d,len+w*0.06],[0.56*w*d,len-w*0.1]],swell(Math.max(0.8,w*0.1),0.4)),'mk-gold'));
  return G('mk-sleeve',k,{transform: `translate(${f(x)} ${f(y)})`+(ang?` rotate(${f(ang)})`:''),'data-mucha': 'outline','aria-hidden': 'true'});
}

/* 2판 새 부품 — leafBar · plaque · ribbon */
const LT=['gold','rose','sage','red'];
export function leafBar({x,y,len,dir='right',w=18,tone='gold',vein=true}={}){
  const t=LT.includes(tone)?tone:'gold',L=Math.max(0,+len||0),hw=w/2,k=[];
  if (L>0.5){
    const m=Math.min(L*0.3,w*1.1),b=hw*0.75;
    k.push(P(`M0 ${f(-b)}C${f(m*0.45)} ${f(-hw)} ${f(m*0.8)} ${f(-hw)} ${f(m)} ${f(-hw)}C${f(m+(L-m)*0.45)} ${f(-hw)} ${f(L-(L-m)*0.25)} ${f(-hw*0.3)} ${f(L)} 0C${f(L-(L-m)*0.25)} ${f(hw*0.3)} ${f(m+(L-m)*0.45)} ${f(hw)} ${f(m)} ${f(hw)}C${f(m*0.8)} ${f(hw)} ${f(m*0.45)} ${f(hw)} 0 ${f(b)}C0.8 ${f(b*0.5)} 0.8 ${f(-b*0.5)} 0 ${f(-b)}Z`,'mk-lf-'+t));
    if (vein&&L>4){
      let sv='';
      const nv=Math.floor((L-w*0.3)/(w*0.75));
      for (let i=1; i<=nv; i++){ const vx=w*0.15+i*(L*0.9-w*0.15)/(nv+1),hx=vx<m?hw:hw*Math.max(0.15,1-Math.pow((vx-m)/(L-m),1.4)),e=Math.min(w*0.5,(L-vx)*0.5); sv+=`M${f(vx)} 0Q${f(vx+e*0.4)} ${f(-hx*0.25)} ${f(vx+e)} ${f(-hx*0.62)}M${f(vx)} 0Q${f(vx+e*0.4)} ${f(hx*0.25)} ${f(vx+e)} ${f(hx*0.62)}`; }
      k.push(P(band([[0.5,0],[L*0.5,0],[L*0.93,0]],lin(Math.max(0.5,w*0.07),0.2)),'mk-lv-'+t));
      if (sv) k.push(P(sv,'mk-lvs'));
    }
  }
  return G('mk-leafbar',k,{transform: `translate(${f(x)} ${f(y)})`+(dir==='left'?' scale(-1 1)':''),'data-mucha': 'vine','aria-hidden': 'true'});
}

const PT=['cream','rose','sage','gold'];
export function plaque({x,y,w,h,tone='cream',knots=true}={}){
  const t=PT.includes(tone)?tone:'cream',ah=Math.min(w/2,h*0.4),k=[];
  const sh=i=>{ const X0=x+i,X1=x+w-i,Y1=y+h-i,a=Math.max(1,ah-i*0.7); return `M${f(X0)} ${f(Y1)}L${f(X0)} ${f(y+i+a)}A${f((X1-X0)/2)} ${f(a)} 0 0 1 ${f(X1)} ${f(y+i+a)}L${f(X1)} ${f(Y1)}Z`; };
  const g=Math.max(2,Math.min(4,h*0.08));
  k.push(P(sh(0),'mk-pq-'+t),P(sh(0),'mk-gl'),P(sh(g),'mk-gl2'));
  if (knots){ const kr=Math.max(2.5,Math.min(6,h*0.11)); for (const kx of [x+kr*0.55,x+w-kr*0.55]) k.push(P(petals(kx,y+ah,kr,5,'rose',-PI/2),'mk-fl-rose'),C0(kx,y+ah,kr*0.3,'mk-fl-c')); }
  const pad=g+3,iw=Math.max(0,w-2*pad),iy=y+ah*(1-Math.sqrt(Math.max(0,1-(iw/w)**2)))+g+1;
  return G('mk-plaque',k,{'data-ix': f(x+pad),'data-iy': f(iy),'data-iw': f(iw),'data-ih': f(Math.max(0,y+h-pad-iy)),'data-mucha': 'lettering','aria-hidden': 'true'});
}

let RB=0;
export function ribbon(pts,{w=26,tone='cream'}={}){
  const t=PT.includes(tone)?tone:'cream',id='mk-rb'+(++RB),hw=w/2;
  let Q=(pts||[]).filter(p=>p&&isFinite(p[0])&&isFinite(p[1]));
  if (Q.length<2) Q=[[0,0],[w*4,0]];
  if (Q[0][0]>Q[Q.length-1][0]) Q=Q.slice().reverse();
  const C=cr(Q,2.5),m=C.length,N=nrm(C),Ls=[0];
  for (let i=1; i<m; i++) Ls.push(Ls[i-1]+Math.hypot(C[i][0]-C[i-1][0],C[i][1]-C[i-1][1]));
  const T=Ls[m-1]||1,ix=l=>{ let i=0; while (i<m-1&&Ls[i]<l) i++; return i; },tl=Math.min(w*1.15,T*0.2),dy=w*0.3,tw=w*0.42;
  const O=(i,o)=>[C[i][0]+N[i][0]*o,C[i][1]+N[i][1]*o],run=(a,b,o)=>{ const r=[]; for (let i=a; i<=b; i++) r.push(O(i,o)); return r; };
  const iA=ix(tl*0.72),iT=Math.max(iA+1,ix(tl)),iB=Math.max(iA+1,ix(T-tl*0.72)),iU=Math.min(iB-1,ix(T-tl)),nL=ix(w*0.36),nR=ix(T-w*0.36);
  const tails=D([O(nL,dy),...run(0,iT,dy-tw),...run(0,iT,dy+tw).reverse()])+'Z'+D([O(nR,dy),...run(iU,m-1,dy-tw).reverse(),...run(iU,m-1,dy+tw)])+'Z';
  const k=[P(tails,'mk-scd-'+t),P(tails,'mk-gl4'),P(D([O(iA,hw),O(iT,dy+tw),O(iA,dy+tw)])+'Z'+D([O(iB,hw),O(iU,dy+tw),O(iB,dy+tw)])+'Z','mk-rbf'),
    P(D([...run(iA,iB,-hw),...run(iA,iB,hw).reverse()])+'Z','mk-pq-'+t),P(D(run(iA,iB,-hw+1.4))+D(run(iA,iB,hw-1.4)),'mk-gl4'),svg('path',{id,d: D(run(iA,iB,0)),class: 'mk-rbp'})];
  return G('mk-ribbon',k,{'data-path': id,'data-len': f(Ls[iB]-Ls[iA]),'data-mucha': 'lettering','aria-hidden': 'true'});
}
