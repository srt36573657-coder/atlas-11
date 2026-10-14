// 막비 그림 · 영상 만들기(사장님 2026-10-13 03:38 · 03:39 「이 앵무새로 귀엽게 재미나게 그리고 위트있게 해」)
//   node scripts/atlas11/makbi/build.mjs [--only svg|og|video]
//   만드는 것(모두 사람 얼굴 없음 · 앵무새 막비만):
//     site/media/makbi-moon.svg   제목 옆 달(둥근 창) 속 막비 얼굴
//     site/media/makbi-icon.svg   둥근 막비 얼굴(옛 판 띠 · 맨 위 1장이 못 열릴 때 띠)
//     site/media/makbi-hello.svg  맨 위 1장 그림(세로 720×880) — 그래프 횃대에 앉은 막비 · 「짹! 지난 기록만」
//     site/og-makbi.jpg           링크 미리보기(1200×630)
//     site/media/makbi-poster.jpg · makbi-intro.mp4 · makbi-intro.webm  소개 영상(720×1280 · 24초 · 소리 없음 · 자막)
//   위트 = 앵무새는 들은 말만 따라 한다 → ATLAS 도 지난 기록만 말한다(앞날 맞히기 없음 · 안전 문장과 같은 뜻)
//   친구 소개 상품권(사장님 2026-10-14 14:56 「카톡으로 아틀란스 소개 10명 … 스타벅스 아메리카노 상품권 1장 … 그 앵무새 영상에도」 · 14:59 「너가 알아서 해 그냥 많이줘」)
//     = 영상 아래 금빛 띠(0.8 ~ 19.4초) + 마지막 장면 맨 아래 상자(안전 문장 줄은 로고 밑으로 옮김) · 길이는 24초 그대로(옛 판 띠 · 소개 쪽 글이 「24초」)
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {makbi, makbiHead, svg, C} from './draw.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const MEDIA = path.join(ROOT, 'site/media');
const TMP = process.env.MAKBI_TMP ?? '/tmp/makbi-build';
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const P = {night: '#0C2824', deep: '#061A17', card: '#12322D', jade: '#6CC7A8', jadeInk: '#9FE0C8', ink: '#EEF6F2', sub: '#B7D0C7', moon: '#F4ECDE', gold: '#E9C46A'};
let seed = 20261013; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const stars = (w, h, n, maxY) => Array.from({length: n}, () => `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * maxY).toFixed(1)}" r="${(0.8 + rnd() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`).join('');

/** 맨 위 1장 — 세로 칸(휴대폰 슬라이드는 세로로 길어 그림을 가운데 맞춰 자름 · object-fit cover · 50% 30%)에 맞춘 세로 그림 720×880
 *  가운데 기둥(가로 140 ~ 580 · 세로 100 ~ 570)에 말풍선 · 막비 · 그래프 횃대 — 넓은 칸에서 위가 잘려도 말풍선이 남게 · 아래 35% 는 화면 글이 덮음
 *  (2026-10-13 05:2x 진짜 브라우저 확인: 가로 그림 720×450 은 양옆이 잘려 「짹!」 · 막비가 잘렸음) */
function helloScene() {
  const W = 720, H = 880, pts = [[0, 600], [90, 586], [170, 600], [250, 566], [330, 578], [360, 548], [430, 560], [510, 528], [600, 540], [720, 514]];
  return svg(W, H, `<defs><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#103A33"/><stop offset=".72" stop-color="${P.night}"/><stop offset="1" stop-color="${P.deep}"/></linearGradient>
    <radialGradient id="hm" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="${P.moon}" stop-opacity=".35"/><stop offset="1" stop-color="${P.moon}" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#hs)"/>${stars(W, H, 60, 520)}
  <circle cx="586" cy="96" r="70" fill="url(#hm)"/><circle cx="586" cy="96" r="40" fill="${P.moon}"/><circle cx="574" cy="88" r="6" fill="#E6DCC8"/><circle cx="598" cy="108" r="4.5" fill="#E6DCC8"/>
  <polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${P.jade}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  ${pts.slice(1, -1).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${P.night}" stroke="${P.jade}" stroke-width="4"/>`).join('')}<circle cx="720" cy="514" r="10" fill="${P.gold}"/>
  <g transform="translate(222 262) scale(1.15)">${makbi({id: 'h', glasses: true, tilt: -9, crestUp: .55})}</g>
  <g transform="translate(150 100)"><path d="M0 22 a22 22 0 0 1 22 -22 h376 a22 22 0 0 1 22 22 v80 a22 22 0 0 1 -22 22 h-168 l-24 30 l-4 -30 h-180 a22 22 0 0 1 -22 -22 z" fill="#FFFFFF"/>
    <text x="210" y="58" text-anchor="middle" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="40" font-weight="800" fill="${P.night}">짹! 지난 기록만</text>
    <text x="210" y="102" text-anchor="middle" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="28" font-weight="600" fill="#2E5B52">들은 것만 따라 말해요</text></g>`);
}
if (!only || only === 'svg') {
  await fs.writeFile(path.join(MEDIA, 'makbi-moon.svg'), svg(100, 100, makbiHead({id: 'm'})));
  await fs.writeFile(path.join(MEDIA, 'makbi-icon.svg'), svg(100, 100, `<circle cx="50" cy="50" r="50" fill="${P.moon}"/>` + makbiHead({id: 'i'})));
  await fs.writeFile(path.join(MEDIA, 'makbi-hello.svg'), helloScene());
  console.log('svg 3');
}
if (only === 'svg') process.exit(0);

// ── 브라우저로 그리기(링크 미리보기 · 영상) ──
const require = createRequire(process.env.PW_DIR ?? '/opt/node-tools/');
const {chromium} = require('playwright');
const exe = process.env.PW_EXE ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const b = await chromium.launch(exe ? {executablePath: exe} : {});
await fs.mkdir(TMP, {recursive: true});
const drawSrc = (await fs.readFile(new URL('./draw.mjs', import.meta.url), 'utf8')).replace(/^export /gm, '');
const fontCss = `<link rel="stylesheet" href="file://${ROOT}/site/atlas/fonts.css">`;
const base = `*{box-sizing:border-box;margin:0}body{font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;-webkit-font-smoothing:antialiased}`;

if (!only || only === 'og') {
  const pg = await b.newPage({viewport: {width: 1200, height: 630}});
  await pg.setContent(`<!doctype html><meta charset="utf-8">${fontCss}<style>${base}
    body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(120% 90% at 22% 30%,#164A41 0%,${P.night} 55%,${P.deep} 100%);color:${P.ink};position:relative}
    .st{position:absolute;inset:0}.mb{position:absolute;left:40px;top:70px;width:470px}
    .bub{position:absolute;left:300px;top:44px;background:#fff;color:${P.night};font-weight:800;font-size:34px;padding:14px 26px;border-radius:24px}
    .bub:after{content:'';position:absolute;left:34px;bottom:-20px;border:14px solid transparent;border-top:22px solid #fff;border-bottom:0}
    .tx{position:absolute;left:600px;top:118px;width:560px}
    h1{font-size:68px;line-height:1.12;font-weight:800;letter-spacing:-1px}
    .who{margin-top:22px;font-size:36px;font-weight:800;color:${P.jadeInk}}
    .wit{margin-top:18px;font-size:30px;line-height:1.45;color:${P.sub};font-weight:600}
    .row{margin-top:30px;display:flex;gap:22px;align-items:center}.btn{background:${P.ink};color:${P.night};font-size:30px;font-weight:800;padding:12px 30px;border-radius:40px}.dom{font-size:26px;color:${P.sub}}</style>
    <body><svg class="st" viewBox="0 0 1200 630">${stars(1200, 630, 70, 630)}</svg>
    <div class="mb"><svg viewBox="0 0 240 270">${makbi({id: 'o', glasses: true, tilt: -8, crestUp: .8})}</svg></div>
    <div class="bub">짹! 지난 기록만</div>
    <div class="tx"><h1>ATLAS를<br>소개합니다</h1><p class="who">안내 · 앵무새 막비</p><p class="wit">앵무새는 들은 것만 말해요.<br>ATLAS도 지난 기록만 말해요.</p>
    <div class="row"><span class="btn">▶ 24초 영상</span><span class="dom">aaa7377.com</span></div></div></body>`, {waitUntil: 'load'});
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.screenshot({path: path.join(ROOT, 'site/og-makbi.jpg'), type: 'jpeg', quality: 88});
  await pg.close(); console.log('og 1');
}

if (!only || only === 'video') {
  const W = 720, H = 1280, FPS = 30, DUR = 24;
  const pg = await b.newPage({viewport: {width: W, height: H}});
  await pg.setContent(`<!doctype html><meta charset="utf-8">${fontCss}<style>${base}
    body{width:${W}px;height:${H}px;overflow:hidden;background:linear-gradient(#123F37 0%,${P.night} 52%,${P.deep} 100%);position:relative;color:${P.ink}}
    #sky,#fx{position:absolute;inset:0}#mb{position:absolute;left:150px;top:470px;width:420px;height:473px;transform-origin:50% 100%}
    #cap{position:absolute;left:40px;right:40px;top:1010px;text-align:center;font-size:52px;font-weight:800;line-height:1.28;letter-spacing:-.5px}
    #sub{position:absolute;left:40px;right:40px;top:380px;text-align:center;font-size:26px;color:${P.sub};font-weight:600}
    .bub{position:absolute;background:#fff;color:${P.night};font-weight:800;font-size:44px;padding:16px 30px;border-radius:30px;white-space:nowrap}
    .bub.l:after{content:'';position:absolute;left:40px;bottom:-24px;border:16px solid transparent;border-top:26px solid #fff;border-bottom:0}
    .bub.r:after{content:'';position:absolute;right:40px;bottom:-24px;border:16px solid transparent;border-top:26px solid #fff;border-bottom:0}
    #logo{position:absolute;left:0;right:0;top:170px;text-align:center}#logo b{display:block;font-size:92px;letter-spacing:10px;font-weight:800}#logo span{display:block;margin-top:10px;font-size:40px;color:${P.jadeInk};font-weight:700}
    #card{position:absolute;left:70px;right:70px;top:150px;height:300px;border-radius:28px;background:${P.card};border:2px solid rgba(159,224,200,.35);overflow:hidden}
    #card h3{position:absolute;left:28px;top:20px;font-size:34px;color:${P.sub};font-weight:700}
    #ball{position:absolute;width:230px;height:230px;top:250px}
    #rib{position:absolute;left:22px;right:22px;top:1180px;padding:8px 10px;border-radius:22px;background:${P.gold};color:#0C2824;text-align:center;font-weight:800;line-height:1.18;opacity:0}
    #rib b{display:block;font-size:34px;white-space:nowrap}#rib span{display:block;font-size:32px}
    #pc{position:absolute;left:40px;right:40px;top:1150px;padding:5px 10px;border-radius:22px;border:3px solid ${P.gold};background:rgba(12,40,36,.94);text-align:center;font-weight:800;line-height:1.1;opacity:0}
    #pc i{display:block;font-style:normal;font-size:28px;color:${P.ink}}#pc b{display:block;font-size:36px;color:${P.gold};white-space:nowrap}#pc span{display:block;font-size:28px;color:${P.ink}}
    </style><body><svg id="sky" viewBox="0 0 ${W} ${H}"></svg><div id="fx"></div><svg id="mb" viewBox="0 0 240 270"></svg><div id="cap"></div><div id="sub"></div><div id="rib"><b>친구 10명 소개하면 스타벅스 커피 1잔!</b><span>문자 010-9011-7377</span></div><div id="pc"><i>친구 10명에게 소개하면</i><b>스타벅스 아메리카노 1잔!</b><span>문자 010-9011-7377</span></div>
    <script>${drawSrc}
    const P=${JSON.stringify(P)}; let sd=7; const R=()=>((sd=(sd*1103515245+12345)%2147483648)/2147483648);
    const ST=Array.from({length:90},()=>[R()*${W},R()*900,0.8+R()*2,R()*6.28]);
    const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), ease=x=>1-Math.pow(1-cl(x),3), back=x=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, win=(t,a,b)=>cl((t-a)/(b-a));
    const pulse=(t,a,d)=>{const x=(t-a)/d;return x<0||x>1?0:Math.sin(Math.PI*x)};
    const CAP=[[0.5,4,'안녕! 나는<br>앵무새 막비야'],[4,9,'앵무새는 들은 말을<br>그대로 따라 해'],[9,14.5,'ATLAS도<br>지난 기록만 보여 줘'],[14.5,19.5,'내일 맞히기는 안 해<br>지난 사실만!'],[19.5,24.1,'오늘 시장,<br>같이 보러 가자!']];
    window.render=t=>{
      document.getElementById('sky').innerHTML=ST.map(([x,y,r,p])=>'<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="#fff" opacity="'+(0.25+0.45*(0.5+0.5*Math.sin(t*2.2+p))).toFixed(2)+'"/>').join('')
        +'<circle cx="590" cy="120" r="120" fill="'+P.moon+'" opacity=".10"/><circle cx="590" cy="120" r="62" fill="'+P.moon+'"/><circle cx="572" cy="108" r="9" fill="#E6DCC8"/><circle cx="606" cy="136" r="6" fill="#E6DCC8"/>';
      // 막비 상태
      let o={id:'v',tilt:-7,crestUp:0,blink:0,glasses:false,wingL:0,wingR:0,beakOpen:0}, y=0, sx=1;
      y=(1-back(win(t,0,.9)))*620;                                   // 1막 아래에서 쏙
      o.crestUp=Math.max(pulse(t,1.0,1.1), t>19.5?pulse(t,19.6,1.4):0, t>9?.35:0);
      o.blink=Math.max(pulse(t,2.6,.22),pulse(t,7.8,.22),pulse(t,13.2,.22),pulse(t,21.6,.22));
      o.tilt=-7-5*ease(win(t,2,3))+(t>4&&t<9?10*Math.sin((t-4)*2.4):0);
      if(t>=4.6&&t<5.4) o.tilt=-14; if(t>=5.4&&t<7.4) o.beakOpen=pulse(t,5.6,1.6)>.15?Math.abs(Math.sin((t-5.6)*14))*.9:0;
      if(t>=9) o.glasses=true;                                       // 3막 안경
      if(t>=9.5&&t<14.5) o.tilt=-4+6*Math.sin((t-9.5)*1.3);
      if(t>=14.5&&t<19.5){ const s=win(t,15.6,17.2); o.tilt=-6+(s>0&&s<1?14*Math.sin((t-15.6)*16):0); o.wingL=o.wingR=.55*pulse(t,15.6,1.8); o.beakOpen=pulse(t,15.8,1.2)*.8; }
      if(t>=19.5){ o.wingR=.85*Math.abs(Math.sin((t-19.6)*5)); o.tilt=-9; o.beakOpen=pulse(t,22.2,.8)*.7; }
      if(t>=9&&t<9.6) sx=1+.04*Math.sin((t-9)*10); const sq=pulse(t,.82,.34); let sy=1-.08*sq; sx*=1+.06*sq;
      const mb=document.getElementById('mb'); mb.innerHTML=makbi(o); mb.style.transform='translateY('+y.toFixed(1)+'px) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
      // 안경이 위에서 내려옴(3막 처음)
      let fx='';
      if(t>=8.6&&t<9.05){ const g=ease(win(t,8.6,9.05)); fx+='<svg style="position:absolute;left:228px;top:'+(250+g*290).toFixed(1)+'px" width="270" height="70" viewBox="40 80 160 40"><g fill="none" stroke="'+P.gold+'" stroke-width="3.4"><circle cx="88" cy="100" r="23"/><circle cx="152" cy="100" r="23"/><path d="M111 96 q9 -6 18 0"/></g></svg>'; }
      // 2막 말풍선 — 「안녕, 막비!」 → 막비가 똑같이 「안녕, 막비!」
      const a1=win(t,4.4,4.7)*(1-win(t,8.6,8.9)), a2=win(t,5.5,5.8)*(1-win(t,8.6,8.9));
      if(a1>0) fx+='<div class="bub l" style="left:40px;top:300px;opacity:'+a1.toFixed(2)+';transform:scale('+(.8+.2*a1).toFixed(2)+')">안녕, 막비!</div><div style="position:absolute;left:46px;top:410px;font-size:30px;color:'+P.sub+';opacity:'+a1.toFixed(2)+'">— 들린 말</div>';
      if(a2>0) fx+='<div class="bub r" style="right:40px;top:400px;opacity:'+a2.toFixed(2)+';transform:scale('+(.8+.2*a2).toFixed(2)+')">안녕, 막비!</div>';
      // 3막 기록장 — 선이 그려지고 점이 찍힘
      if(t>=9&&t<14.5){ const c=win(t,9.2,9.6)*(1-win(t,14.1,14.5)), d=win(t,9.7,12.4); const xs=[30,110,190,270,350,430,510,560], ys=[210,180,196,150,166,120,136,92];
        const n=Math.max(1,Math.round(d*(xs.length-1))); let pth='M'+xs[0]+' '+ys[0]; for(let i=1;i<=n;i++) pth+=' L'+xs[i]+' '+ys[i];
        fx+='<div id="card" style="opacity:'+c.toFixed(2)+'"><h3>기록장 — 지난 20거래일</h3><svg style="position:absolute;left:0;top:30px" width="580" height="270" viewBox="0 0 580 270"><path d="'+pth+'" fill="none" stroke="'+P.jade+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'+xs.slice(0,n+1).map((x,i)=>'<circle cx="'+x+'" cy="'+ys[i]+'" r="7" fill="'+(i===xs.length-1?P.gold:P.card)+'" stroke="'+(i===xs.length-1?P.gold:P.jade)+'" stroke-width="3.5"/>').join('')+'</svg></div>'; }
      // 4막 수정 구슬 「내일은?」 — 굴러 들어왔다가 막비가 고개를 저으면 굴러 나감
      if(t>=14.5&&t<19.5){ const inn=ease(win(t,14.6,15.4)), out=ease(win(t,17.6,18.6)); const x=${W}+20-(inn*(${W}-430))+out*560;
        fx+='<div id="ball" style="left:'+x.toFixed(1)+'px;transform:rotate('+((1-inn+out)*-260).toFixed(0)+'deg)"><svg viewBox="0 0 230 230" width="230" height="230"><defs><radialGradient id="bg" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#E9E2F7"/><stop offset="1" stop-color="#B9A9DD"/></radialGradient></defs><circle cx="115" cy="105" r="92" fill="url(#bg)"/><text x="115" y="134" text-anchor="middle" font-size="96" font-weight="800" fill="'+P.gold+'" font-family="Pretendard Variable,Pretendard,sans-serif">?</text><path d="M55 196 h120 l-14 26 h-92 z" fill="#8E7D5A"/></svg></div>';
        const no=win(t,15.6,15.8)*(1-win(t,17.4,17.7)); if(no>0) fx+='<div class="bub r" style="right:250px;top:330px;opacity:'+no.toFixed(2)+'">아니 아니!</div>'; }
      // 5막 ATLAS
      if(t>=19.5){ const l=ease(win(t,19.6,20.4)); fx+='<div id="logo" style="opacity:'+l.toFixed(2)+';transform:translateY('+((1-l)*-30).toFixed(1)+'px)"><b>ATLAS</b><span>aaa7377.com</span></div>'; }
      document.getElementById('fx').innerHTML=fx;
      const k=CAP.find(c=>t>=c[0]&&t<c[1]); const cap=document.getElementById('cap');
      if(k){ const a=Math.min(win(t,k[0],k[0]+.35),1-win(t,k[1]-.3,k[1])); cap.innerHTML=k[2]; cap.style.opacity=Math.max(0,a).toFixed(2); cap.style.transform='translateY('+((1-ease(win(t,k[0],k[0]+.4)))*18).toFixed(1)+'px)'; } else cap.style.opacity=0;
      document.getElementById('sub').textContent=t>=19.5?'지난 기록을 센 공부예요 · 사고팔기를 권하지 않아요':'';
      // 친구 소개 상품권 — 아래 띠(0.8 ~ 19.4초) · 마지막 장면은 맨 아래 상자(띠는 숨김 · 안전 문장 줄은 로고 밑)
      const rb=document.getElementById('rib'), ra=Math.min(win(t,.8,1.2),1-win(t,19.05,19.45)); rb.style.opacity=Math.max(0,ra).toFixed(2);
      const pc=document.getElementById('pc'), pa=win(t,20.2,20.7); pc.style.opacity=pa.toFixed(2); pc.style.transform='translateY('+((1-ease(pa))*16).toFixed(1)+'px)';
    };</script></body>`, {waitUntil: 'load'});
  await pg.evaluate(() => document.fonts.ready);
  const fdir = path.join(TMP, 'frames'); await fs.rm(fdir, {recursive: true, force: true}); await fs.mkdir(fdir, {recursive: true});
  const N = FPS * DUR;
  for (let i = 0; i < N; i++) {
    await pg.evaluate(t => window.render(t), i / FPS);
    await pg.screenshot({path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92});
  }
  await pg.evaluate(t => window.render(t), 3.2); await pg.screenshot({path: path.join(MEDIA, 'makbi-poster.jpg'), type: 'jpeg', quality: 86});
  await pg.close();
  const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], {stdio: 'inherit'});
  ff('-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(MEDIA, 'makbi-intro.mp4'));
  ff('-i', path.join(MEDIA, 'makbi-intro.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-an', path.join(MEDIA, 'makbi-intro.webm'));
  console.log('video', N, 'frames');
}
await b.close();
