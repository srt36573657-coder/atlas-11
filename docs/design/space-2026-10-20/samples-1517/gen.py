import os
S=os.path.dirname(os.path.abspath(__file__))
CSS='''*{box-sizing:border-box}body{margin:0;background:#1a1a1a;font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#fff;word-break:keep-all}
.lab{width:390px;padding:14px 16px 10px;background:#1a1a1a}.lab b{color:#F9D21C;font-size:22px}.lab span{display:block;color:#BDBDBD;font-size:21px;margin-top:4px}
.ph{width:390px;height:780px;background:#080808;position:relative;overflow:hidden;border-top:1px solid #333}
.top{height:64px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;border-bottom:1px solid #222}
.bar{position:absolute;left:0;right:0;bottom:0;height:72px;border-top:1px solid #222;display:flex;justify-content:space-around;align-items:center;color:#9a9a9a;font-size:19px}
.bar .on{color:#fff;font-weight:700}
.safe{position:absolute;left:16px;right:16px;bottom:84px;color:#8a8a8a;font-size:17px;text-align:center}
.up{color:#FF6A3D}.gold{color:#F9D21C}.sub{color:#BDBDBD}
.btn{display:flex;align-items:center;justify-content:space-between;min-height:64px;border:1.5px solid #6E6E6E;border-radius:16px;padding:0 18px;font-size:22px;margin:0 16px 12px}
'''
BAR='<div class="bar"><span class="on">오늘</span><span>찾기</span><span>관심</span><span>내 것</span></div>'
SAFE='<div class="safe">지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.</div>'
pages=[
("한 문장","잡스 — 첫 화면에 답 하나만",'''
<div style="padding:120px 24px 0"><p class="sub" style="font-size:22px;margin:0 0 14px">10월 20일 오늘</p>
<h1 style="font-size:40px;line-height:1.3;margin:0">진짜 싹은<br><span class="up">2차전지</span><br>한 곳이에요.</h1>
<p class="sub" style="font-size:22px;margin:22px 0 40px">점 넷이 다 찼어요.</p></div>
<div class="btn" style="background:#fff;color:#111;border:none;font-weight:800">왜 그럴까? <span>›</span></div>'''),
("찾기 하나","구글 — 빈 화면에 찾는 칸 하나",'''
<div style="padding:150px 16px 0;text-align:center"><div style="font-size:44px;font-weight:900;margin-bottom:28px">돌이</div>
<div style="border:1.5px solid #6E6E6E;border-radius:32px;height:64px;display:flex;align-items:center;padding:0 22px;font-size:22px;color:#9a9a9a;text-align:left">업종이나 회사 이름</div>
<div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
<span style="border:1.5px solid #FF6A3D;border-radius:24px;padding:10px 16px;font-size:21px" class="up">진짜 싹 1</span>
<span style="border:1.5px solid #6E6E6E;border-radius:24px;padding:10px 16px;font-size:21px">새로 4</span>
<span style="border:1.5px solid #6E6E6E;border-radius:24px;padding:10px 16px;font-size:21px">꽃 자리</span></div></div>'''),
("시계 하나","잡스 — 시계 한 장이 곧 첫 화면",'''
<div style="padding:24px 16px 0"><p style="font-size:24px;font-weight:800;margin:0 0 8px">지금 몇 시 자리일까?</p>
<svg width="358" height="358" viewBox="0 0 358 358"><circle cx="179" cy="179" r="150" fill="none" stroke="#333" stroke-width="2"/>
<rect x="29" y="29" width="150" height="150" fill="#2a1410"/><line x1="179" y1="20" x2="179" y2="338" stroke="#333"/><line x1="20" y1="179" x2="338" y2="179" stroke="#333"/>
<text x="44" y="64" fill="#FF6A3D" font-size="24" font-weight="800">싹</text><text x="290" y="64" fill="#fff" font-size="24" font-weight="800">꽃</text>
<text x="290" y="320" fill="#BDBDBD" font-size="22">시듦</text><text x="36" y="320" fill="#BDBDBD" font-size="22">잠잠</text>
<circle cx="140" cy="80" r="22" fill="#FF6A3D"/><text x="131" y="88" font-size="22" font-weight="800" fill="#111">1</text>
<circle cx="110" cy="130" r="9" fill="#FF6A3D"/><circle cx="90" cy="150" r="9" fill="#FF6A3D"/><circle cx="150" cy="140" r="9" fill="#FF6A3D"/>
<circle cx="230" cy="110" r="9" fill="#888"/><circle cx="250" cy="240" r="9" fill="#888"/><circle cx="110" cy="240" r="9" fill="#888"/></svg>
<p class="sub" style="font-size:21px;margin:8px 0 0;text-align:center">점을 누르면 그 업종으로 가요.</p></div>'''),
("세 장 넘기기","구글 — 카드 세 장을 옆으로 넘김",'''
<div style="padding:28px 16px 0"><p class="sub" style="font-size:21px;margin:0 0 12px">오늘 세 장 · 1 / 3</p>
<div style="display:flex;gap:12px"><div style="flex:0 0 300px;height:420px;border-radius:24px;background:#1c1c1c;border:1.5px solid #FF6A3D;padding:24px">
<p class="up" style="font-size:22px;font-weight:800;margin:0">진짜 싹</p><p style="font-size:38px;font-weight:900;margin:18px 0">2차전지</p>
<p class="sub" style="font-size:22px;margin:0">열흘 동안 <span class="up">+7.0%</span></p><p class="sub" style="font-size:22px;margin:12px 0 0">점 넷이 다 찼어요.</p></div>
<div style="flex:0 0 300px;height:420px;border-radius:24px;background:#151515;border:1.5px solid #333;padding:24px"><p style="font-size:22px;margin:0">새로 들어온 싹</p></div></div>
<div style="display:flex;gap:8px;justify-content:center;margin-top:18px"><i style="width:28px;height:10px;border-radius:5px;background:#FF6A3D"></i><i style="width:10px;height:10px;border-radius:5px;background:#555"></i><i style="width:10px;height:10px;border-radius:5px;background:#555"></i></div></div>'''),
("신호등 세 줄","잡스 — 싹 · 꽃 · 시듦 세 줄만",'''
<div style="padding:32px 0 0"><p style="font-size:26px;font-weight:800;margin:0 16px 22px">오늘 업종 자리</p>
<div class="btn" style="min-height:96px;border-color:#FF6A3D"><span><b class="up" style="font-size:26px">싹</b><br><span class="sub" style="font-size:21px">곧 필까?</span></span><b style="font-size:34px">42곳 ›</b></div>
<div class="btn" style="min-height:96px"><span><b class="gold" style="font-size:26px">꽃</b><br><span class="sub" style="font-size:21px">지금 핀 곳</span></span><b style="font-size:34px">11곳 ›</b></div>
<div class="btn" style="min-height:96px"><span><b style="font-size:26px">시듦</b><br><span class="sub" style="font-size:21px">지는 곳</span></span><b style="font-size:34px">9곳 ›</b></div></div>'''),
("오늘 한 곳 · 일곱 단","구글 — 한 곳을 끝까지 따라감",'''
<div style="padding:28px 16px 0"><p class="sub" style="font-size:21px;margin:0">오늘 가장 앞선 회사</p><p style="font-size:38px;font-weight:900;margin:8px 0 4px">피노</p>
<p style="font-size:22px;margin:0 0 22px"><span class="sub">2차전지 ·</span> 열흘 <span class="up">+25.3%</span></p>
<p style="font-size:22px;font-weight:700;margin:0 0 10px">일곱 단 가운데 3단</p>
<div style="display:flex;gap:6px;margin-bottom:22px">'''+''.join(f'<i style="flex:1;height:14px;border-radius:7px;background:{"#F9D21C" if k<3 else "#333"}"></i>' for k in range(7))+'''</div>
<div class="btn" style="margin:0 0 12px">4 지나온 길 <span>›</span></div><div class="btn" style="margin:0 0 12px">5 누구와 다투나 <span>›</span></div><div class="btn" style="margin:0">더 깊이 · 6 · 7 <span>›</span></div></div>'''),
("질문 셋","잡스 — 궁금한 것부터 고름",'''
<div style="padding:90px 0 0"><p style="font-size:32px;font-weight:900;margin:0 16px 30px;line-height:1.3">오늘 무엇이<br>궁금해요?</p>
<div class="btn" style="min-height:76px">지금 뜨는 업종은? <span>›</span></div>
<div class="btn" style="min-height:76px">내 관심 업종은 어디? <span>›</span></div>
<div class="btn" style="min-height:76px">이 회사 지난 기록은? <span>›</span></div></div>'''),
]
for i,(name,sub,body) in enumerate(pages,1):
    html=f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}</style></head><body><main id="m"><div class="lab"><b>샘플 {i} · {name}</b><span>{sub}</span></div><div class="ph"><div class="top">돌이</div>{body}{SAFE}{BAR}</div></main></body></html>'
    open(os.path.join(S,f's{i}.html'),'w',encoding='utf-8').write(html)
print('ok')
