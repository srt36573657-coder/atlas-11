// 돌이 글꼴 — 프리텐다드 가변(사장님 2026-10-22 14:49 「구글과 잡스라면 어떤 폰트를 쓸건지 선택해서 돌이 기가막히게」 · 15:21 「보여주지말고 바로 작업해 최고를 선택해서」)
//   프리텐다드 = 한글 본고딕(구글 · 어도비) + 영문 숫자 Inter — 아이폰 · 갤럭시 · 컴퓨터 어디서나 같은 글씨(기기 글꼴은 휴대폰마다 다름)
//   첫 그림을 늦추지 않게(첫 화면 느린 4G 2.5초 선 · 흰 첫 화면 검사 ③):
//     처음 오신 분 = 기기 글꼴로 먼저 그림 → app.js 가 load 8초 뒤 이 파일을 부름 → 지금 화면 글자에 드는 조각만 받아 둠(/next/font.css · /fonts/pretendard/ · 옛 화면과 같은 파일)
//     → 표 'dori-pf' 를 남기고 다음 화면(주소 #/… 바뀜)부터 html.pf(app.css) — 보던 화면 글씨가 갑자기 바뀌지 않음
//     다시 오신 분 = app.js 맨 앞 한 줄이 처음부터 html.pf + /next/font.css(이 파일은 안 부름)
const sheet = () => new Promise(res => {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = '/next/font.css';
  l.onload = () => res(true);
  l.onerror = () => res(false);
  document.head.append(l);
});

async function warm() {
  if (!(await sheet()) || !document.fonts?.load) return;
  const text = String(document.body?.innerText ?? '').slice(0, 4000) + '0123456789.,%+-';
  try {
    const faces = await document.fonts.load('600 16px "Pretendard Variable"', text);
    if (faces.length) {
      try { localStorage.setItem('dori-pf', '1'); } catch { /* 저장 못 함 — 다음에 다시 받음 */ }
      globalThis.__pfReady = true;
    }
  } catch { /* 못 받으면 기기 글꼴 그대로 */ }
}

if (globalThis.requestIdleCallback) requestIdleCallback(() => warm(), {timeout: 4000});
else warm();
