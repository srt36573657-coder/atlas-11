/* 옛 기능 명단 — 수르 새 판(/su/)이 옛 기능을 하나씩 새 판 안에서 열게 하는 자료(빈 파일에서 새로 씀 · 화면 코드 없음)
   사장님 2026-11-04 18:54(+03) 「수르 명령서 — 잡스 판」 [자료 2. 옛 기능 — 모두 셋 아래로 모은다] · [4] 1 ~ 8
     「자료 2의 기능을 하나도 빼지 말고 넣어라」 「모든 기능이 새 판 안에서 열리게 해라」 「셋에 안 이어지는 기능은 따로 보고해라 (지우지 말고 사장님이 정하시게 한다)」
     (원문 docs/design/su-jobs-2026-11-05/order-0054.txt)
   한 줄 = {id, name, [say], group, helps, open, how, owner}
     say   = 화면 이름(있을 때만) — 자료 2 이름에 화면에 쓰지 않는 말(「매수」)이 들어 있으면 화면에는 이 이름으로 보임(name 은 자료 2 글자 그대로)
     id    = 짧은 영문 이름(겹치지 않음) · 하늘 열다섯은 하늘 그림 파일(su-sky.js SKY_ITEMS)의 이름과 같게 둠
     name  = 자료 2 글자 그대로(「·」로 이어 쓴 것은 하나씩 나눔)
     group = 자료 2 묶음 — hot 불장을 돕는 것 · bloom 꽃을 돕는 것 · money 돈을 돕는 것 · stop 사기 전에 멈추게 돕는 것 · guide 길잡이 · sky 하늘 (뒷배경) · guest 손님 부르기 · back 뒤에서 도는 것
     helps = 셋 가운데 무엇을 돕나 — 셋 묶음은 그 묶음 그대로 · 나머지는 하나씩 따져 hot | bloom | money | three(셋 모두) · 셋에 안 이어지면 null(사장님이 정하실 것)
     open  = 오늘 그 기능이 열리는 주소 — '#/…' = 수르 새 판 길(/su/ 뒤에 붙임) · '/…' = 같은 사이트 옛 쪽 · null = 여는 쪽이 없음(까닭은 how)
     how   = 손님 눈에 보이는 것 한 줄(쉬운 말)
     owner = 사장님 열쇠 휴대폰에서만 열리면 true
   open 은 2026-11-05 시험 서버(scripts/atlas11/invite_dev.mjs)와 진짜 브라우저로 하나씩 열어 봄 — 열린 주소 · 첫 제목 · 글 길이 · 「찾지 못했어요」 「화면을 그리지 못했어요」 여부를 적은 기록은 이 일의 작업 폴더 feat-verify.json
   회사 번호가 든 길
     · '#/c/180640/more'(회사 자세히 — 출목표 · 뉴스 · 수급 · 뜨거운 태양)는 21곳 안 회사만 열림 — 180640 한진칼 = 2026-11-04 판 불장 첫 회사 · 판이 바뀌면 그날 21곳 안 번호로 바꿔 열어야 함
     · 옛 쪽 회사 길은 늘 있는 회사로 둠 — 005930 삼성전자(반도체 업종 가장 큰 회사) · 반도체 업종
   글은 자료일 뿐 — 화면에 그릴 때는 그리는 쪽이 textContent 로(보안 규칙) */

export const FEAT = Object.freeze([
  /* ── 불장을 돕는 것 ── */
  {id: 'surge5', name: '급등 다섯 칸', group: 'hot', helps: 'hot', open: '/next/#/surge', how: '닷새 동안 크게 오른 회사를 다섯 칸(모두 · 오른 폭 넷)으로 보고, 며칠 뒤 어땠는지도 함께 봐요', owner: false},
  {id: 'surgecal', name: '급등 달력', group: 'hot', helps: 'hot', open: '/next/#/cal', how: '닷새에 크게 올라 뽑힌 회사가 날마다 옮기고 빠지는 것을 달력으로 따라가요', owner: false},
  {id: 'today', name: '오늘 시장', group: 'hot', helps: 'hot', open: '/next/#/today', how: '코스피 · 코스닥 하루, 오른 곳과 내린 곳, 누가 사고팔았나를 한 쪽에 모아요', owner: false},
  {id: 'index', name: '지수 화면', group: 'hot', helps: 'hot', open: '/next/#/w/KOSPI', how: '코스피 석 달 줄과 높은 값 · 낮은 값 — 아래에 코스닥과 큰 업종', owner: false},
  // 한 해 다시 보기 = 테마 시계 첫 화면 칸(theme-home.js homeBlock · yearBox · theme-year.js) — 새 첫 화면(home-new.js)이 이 칸을 부르지 않아 오늘 어느 쪽에도 안 그려짐(브라우저로 /next/#/ 확인)
  {id: 'year', name: '한 해 다시 보기', group: 'hot', helps: 'hot', open: null, how: '싹 1 · 2 · 3번 업종의 지난 1년 줄을 차례로 그려 보이던 칸 — 첫 화면을 새로 짜며 빠져 지금 여는 곳이 없어요', owner: false},
  // 예비 탭 = 옛 아틀란스(site/app · #/similar) — 옛 판은 2026-10-15 사장님 「영구 삭제」 · 진짜 사이트 / 는 수르(/su/)로 가고 #/similar 는 /next/ 첫 화면으로 떨어짐(옛 화면은 시험 서버에서도 「자료 목록을 읽지 못했습니다」)
  {id: 'similar', name: '예비 탭', group: 'hot', helps: 'hot', open: null, how: '옛 아틀란스 「예비」 탭 — 옛 화면을 지운 뒤로 여는 곳이 없어요', owner: false},
  // 이슈 칸 = 옛 아틀란스 기록 탭(#/log)의 「이슈」 줄 — 지금 업데이트 기록(/next/#/up)은 업데이트 줄만 보이고 이슈 줄은 거름
  {id: 'issue', name: '이슈 칸', group: 'hot', helps: 'hot', open: null, how: '옛 기록 탭의 날마다 장 이슈 한 줄 — 옛 화면을 지운 뒤로 여는 곳이 없어요', owner: false},
  {id: 'news', name: '뉴스', group: 'hot', helps: 'hot', open: '#/c/180640/more', how: '회사 자세히 쪽 — 그 회사 이름이 나온 뉴스 수(21곳 안 회사만)', owner: false},
  {id: 'road', name: '출목표', group: 'hot', helps: 'hot', open: '#/c/180640/more', how: '회사 자세히 쪽 — 한 달을 하루씩, 오른 날 ●와 내린 날 ○로 놓은 판(21곳 안 회사만)', owner: false},
  // 뜨거운 태양 = 회사 자세히 쪽 해 그림(su-21.js sun52) — 옛 「모아 보기」(옛 아틀란스 #/road/sun)는 없음
  {id: 'sun', name: '뜨거운 태양', group: 'hot', helps: 'hot', open: '#/c/180640/more', how: '회사 자세히 쪽 해 그림 — 1년 낮은 값과 높은 값 사이 자리, 높은 값 가까이면 햇살(모아 보기 쪽은 지금 없어요)', owner: false},

  /* ── 꽃을 돕는 것 ── */
  {id: 'bloomco', name: '꽃 될 회사', group: 'bloom', helps: 'bloom', open: '#/b', how: '이달 꽃 조건에 맞은 회사 — 없는 날은 가장 가까운 회사와 그 이유', owner: false}, // 옛 쪽 = /next/#/t/picks(같은 자료 theme-bloom.json)
  {id: 'record', name: '지난 기록', group: 'bloom', helps: 'bloom', open: '#/r', how: '조건에 맞은 회사가 지난날 100번에 몇 번 꽃이 됐나 — 기록 서랍 여섯', owner: false}, // 옛 쪽 = /next/#/t/pick
  {id: 'sprout', name: '싹', group: 'bloom', helps: 'bloom', open: '/next/#/t/sprout', how: '싹 자리에 든 업종 모두 — 맨 앞 셋은 크게', owner: false},
  {id: 'sproutcal', name: '싹 달력', group: 'bloom', helps: 'bloom', open: '/next/#/t/cal', how: '날짜마다 큐피트가 찾은 싹 1 · 2 · 3번 업종과 그 뒤 줄', owner: false},
  // 테마 시계 = 네 자리 시계 그림(theme-home.js clock) — 첫 화면 칸은 빠졌고 「시계 읽는 법」 쪽에 그대로 있음
  {id: 'clock', name: '테마 시계', group: 'bloom', helps: 'bloom', open: '/next/#/t/how', how: '업종을 싹 · 꽃 · 시듦 · 잠잠 네 자리에 찍은 시계 그림과 읽는 법', owner: false},
  {id: 'themeind', name: '테마 업종', group: 'bloom', helps: 'bloom', open: '/next/#/t/i/반도체', how: '한 업종의 점 넷 — 지나온 길 · 번지는 중 · 큰 회사 · 함께 움직인 회사', owner: false},
  {id: 'themeco', name: '테마 회사', group: 'bloom', helps: 'bloom', open: '/next/#/t/c/005930', how: '그 회사가 업종보다 먼저 움직였나, 뒤따랐나', owner: false},
  // 고도리 칸 = 지금 이름 「수르 칸」(p-gdr.js) — 열한 질문을 끝낸 기기만 열림 · 그 전에는 잠긴 칸과 「왜 사?」 고리
  {id: 'godori', name: '고도리 칸', group: 'bloom', helps: 'bloom', open: '/next/#/gdr', how: '열한 질문을 끝낸 휴대폰에만 열려요 — 조건 다섯을 지난 회사와 틀린다면 이유', owner: false},
  {id: 'cond', name: '조건 찾기', group: 'bloom', helps: 'bloom', open: '/next/#/cond', how: '조건 셋을 차례로 걸어 회사를 거르고 남은 곳을 봐요', owner: false},
  {id: 'seal', name: '봉인', group: 'bloom', helps: 'bloom', open: '/next/#/time', how: '그날 365곳을 잠가 3 · 5 · 10년 뒤 다시 여는 기록', owner: false},
  {id: 'co7', name: '회사 7단', group: 'bloom', helps: 'bloom', open: '/next/#/w/005930', how: '회사 한 곳을 일곱 단으로 — 지나온 길 · 누구와 다투나 · 앞으로 클까 · 범위까지', owner: false},

  /* ── 돈을 돕는 것 ── */
  {id: 'flow', name: '돈의 흐름', group: 'money', helps: 'money', open: '/next/#/', how: '첫 화면 맨 위 「돈 흐름」 — 한 달 동안 시장보다 더 오른 업종 셋, 덜 오른 업종 셋', owner: false},
  {id: 'supply', name: '수급', group: 'money', helps: 'money', open: '#/c/180640/more', how: '회사 자세히 쪽 — 닷새 동안 외국인 · 기관 · 개인이 사고판 차이(21곳 안 회사만)', owner: false},
  {id: 'lights11', name: '말하는 불빛 11', group: 'money', helps: 'money', open: '/next/#/', how: '첫 화면 「돈 흐름」에서 몰린 업종 줄을 펼치면 이유 열한 가지 불빛과 말', owner: false},
  // 「왜 그럴까」 열한 걸음 — 첫 화면 「오늘 시장」의 「왜 그런지 보기」 단추 안에도 같은 그림(why-chain.js) · 바로 열리는 쪽은 테마 회사의 「왜 그럴까?」
  {id: 'why11', name: '「왜 그럴까」 열한 걸음', group: 'money', helps: 'money', open: '/next/#/t/c/005930/why', how: '한 사실이 다음 물음을 부르는 열한 걸음 그림 — 첫 화면 「왜 그런지 보기」도 같아요', owner: false},
  {id: 'inflow', name: '몰린 곳', group: 'money', helps: 'money', open: '/next/#/', how: '첫 화면 「돈 흐름」의 돈이 몰린 업종 셋', owner: false},
  {id: 'outflow', name: '빠진 곳', group: 'money', helps: 'money', open: '/next/#/', how: '첫 화면 「돈 흐름」의 돈이 빠진 업종 셋', owner: false},
  {id: 'landmap', name: '업종 지도', group: 'money', helps: 'money', open: '#/m', how: '우량주 365곳을 열 땅으로 — 땅 · 업종 · 회사 세 번 누름', owner: false},
  // 만수르 단추 = 바깥 주소(https://shin-yxy.gino.im/)로 나가는 단추 — 같은 사이트 안에서는 그 단추가 있는 쪽을 적음(새 판 「친구에게」 칸 · 옛 첫 화면 「돈 흐름」 머리 알약도 같음)
  //   묶음대로 helps = money 로 적었으나 단추가 가는 곳은 수르 밖 — su-21.js 는 「셋과 안 이어짐」으로 적어 둠(사장님이 정하실 것)
  {id: 'mansour', name: '천사 단추', group: 'money', helps: 'money', open: '#/f', how: '「친구에게」 쪽 천사 칸 — 누르면 사장님이 정하신 바깥 주소로 나가요', owner: false},

  /* ── 사기 전에 멈추게 돕는 것 — 셋 가운데 어느 회사를 사려 해도 똑같이 쓰는 것은 three ── */
  {id: 'whybuy', name: '「왜 사?」 열한 질문', group: 'stop', helps: 'three', open: '#/q', how: '사기 전에 열한 가지를 묻고 준비 점수와 「좋아 · 반만 · 쉬어」를 보여 줘요', owner: false},
  {id: 'journal', name: '매매일지', group: 'stop', helps: 'three', open: '#/j', how: '「왜 사?」에 답한 기록이 날짜와 함께 쌓여요 — 이 휴대폰에만', owner: false},
  {id: 'later', name: '한 달 뒤', group: 'stop', helps: 'three', open: '#/j', how: '매매일지 안 「한 달 전 약속」 — 한 달 지난 기록에 「그날 정한 대로 했어?」를 물어요', owner: false}, // 옛 쪽 = /next/#/why/later
  {id: 'holdcheck', name: '내 종목 점검', group: 'stop', helps: 'three', open: '/next/#/me', how: '가진 회사를 산 이유 · 조건 · 약속으로 다시 봐요 — 이 기기에만', owner: false},
  {id: 'watch', name: '관심', group: 'stop', helps: 'three', open: '/next/#/sub', how: '담아 둔 업종과 회사가 한곳에 — 자리가 바뀌면 첫 화면에서 알려요', owner: false},
  // 시황 = 지수 하루 · 오른 곳과 내린 곳 · 닷새 가장 오른 업종 · 한 달 큰 갈래 — 짧은 때의 움직임이라 hot
  {id: 'market', name: '시황', group: 'stop', helps: 'hot', open: '/next/#/shorts', how: '한 화면에 사실 하나 — 시장이 왜 움직였나를 위로 밀며 봐요', owner: false},
  {id: 'game', name: '가짜 돈 연습', group: 'stop', helps: 'three', open: '/next/#/game', how: '가짜 돈 10억 원으로 해 보는 연습 — 진짜 돈은 오가지 않아요', owner: false},
  // 같은 쪽 맨 위 「자동으로 산 기록」 칸 — 사장님 열쇠 기기만(p-game.js autoBox · /api/auto) · 싹 1 ~ 3번 업종에서 고르므로 bloom
  {id: 'autobuy', name: '가짜 돈 자동 매수(사장님만)', say: '가짜 돈 자동 거래 연습', group: 'stop', helps: 'bloom', open: '/next/#/game', how: '사장님 휴대폰에서만 — 싹 1 · 2 · 3번 업종의 큰 회사를 가짜 돈으로 저절로 산 기록', owner: true},

  /* ── 길잡이 ── */
  {id: 'search', name: '종목 검색', group: 'guide', helps: 'three', open: '/next/#/find', how: '회사 이름 · 첫 글자 · 번호로 찾아요 — 맨 위 「찾기」 단추', owner: false},
  // 첫 화면 칩 = 칩 줄(app.js CHIPS · 10개) — 오늘 첫 화면에는 없고 칩 쪽(#/f/…) 맨 위에 있음 · 칩에 「미국」이 아직 남아 있음(명령서 [1] 1 미국 빼기와 부딪힘)
  {id: 'chips', name: '첫 화면 칩', group: 'guide', helps: 'three', open: '/next/#/f/rise', how: '오르는 업종 · 급등 · 대장주 · 고른 곳 · 업종 · 달력 · 조건 찾기를 한 줄 단추로 골라요', owner: false},
  {id: 'surparrot', name: '앵무새 큐피트', group: 'guide', helps: 'three', open: '#/', how: '모든 쪽 아래 「다음」 단추의 분홍 앵무새 — 화면과 화면을 이어 줘요', owner: false},
  // 신 72 = 재미로 단 방 지킴이(사장님 10월 31일 「재미삼아 적절한 곳에」) — 셋을 찾는 데 쓰지 않음
  {id: 'roman72', name: '로마 신 72', group: 'guide', helps: null, open: '/next/#/roman', how: '로마 신 일흔두 명의 얼굴과 이야기 — 방마다 지킴이 이름표로도 달려요', owner: false},
  // 스승 39 = 생각 공부(명령서 [5] 7 「사기 전에 멈추는 길의 길잡이」) — 멈추는 길 곁에 서지만 셋을 직접 찾거나 보이지는 않음
  {id: 'sage39', name: '서른아홉 스승', group: 'guide', helps: null, open: '/next/#/sage', how: '스승 서른아홉 명의 얼굴과 한마디 — 모두 듣기 · 이어 듣기', owner: false},
  // 돌 시계 = 쪽 제목 옆 작은 돌 시계(stone-clock.js miniClock) — 그 쪽의 싹 · 꽃 자리를 짚으므로 bloom · 첫 화면 큰 돌 시계는 새 첫 화면에서 빠짐
  {id: 'stoneclock', name: '돌 시계', group: 'guide', helps: 'bloom', open: '/next/#/t/sprout', how: '쪽 제목 옆 작은 돌 시계 — 그 쪽이 싹 · 꽃 · 시듦 · 잠잠 어디쯤인지 짚어요', owner: false},
  {id: 'fontsize', name: '글씨 크기', group: 'guide', helps: 'three', open: '#/', how: '맨 위 「글씨」 단추로 화면 글씨를 크게 해요', owner: false},
  {id: 'readaloud', name: '읽어 주기', group: 'guide', helps: 'three', open: '#/', how: '아래 「듣기」 단추 — 큰 값과 뜻 줄을 소리로 읽어 줘요', owner: false},
  // 영어 = 옛 쪽 위 막대 지구 단추(?lang=en) — 새 판(/su/)은 ?lang= 이 오면 옛 쪽으로 넘겨 줌(su-data.js forwardTo) · 끝 #/ 은 ?su= 를 붙여도 첫 화면 길이 남게
  {id: 'english', name: '영어 단추', group: 'guide', helps: 'three', open: '/next/?lang=en#/', how: '지구 단추 — 옛 화면을 영어로 봐요(새 판은 아직 한국어만)', owner: false},

  /* ── 하늘 (뒷배경) — 누르는 쪽이 아니라 open 은 null · 셋을 돕지 않는 꾸밈이라 helps 도 null
     2026-10-22 사장님 「배경 반짝이가 너무 시선이가요」 「눈아파요」로 옛 하늘(next/sky.js · sky-fly.js · space.css)은 모든 쪽에서 빠짐 · 상품권 「우주 영상 1분」 안에만 남음
     새 판은 하늘 층(su-sky.js · su-sky.css)이 열다섯을 무하풍으로 다시 그려 하나씩 천천히 날림(명령서 [6] 8 · 9) ── */
  {id: 'star', name: '별', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 무하풍 별 그림이 하나씩 천천히 지나가요', owner: false},
  {id: 'polaris', name: '북극성', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 북극성 그림이 하나씩 천천히 지나가요', owner: false},
  {id: 'aurora', name: '오로라', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 오로라 띠가 하나씩 천천히 지나가요', owner: false},
  {id: 'meteor', name: '별똥별', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 별똥별이 하나씩 천천히 지나가요', owner: false},
  {id: 'dragon', name: '용', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 용 한 마리가 하나씩 천천히 지나가요', owner: false},
  {id: 'angels', name: '천사 다섯', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 천사 다섯이 하나씩 천천히 지나가요', owner: false},
  {id: 'peterpan', name: '피터팬과 팅커벨', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 피터팬과 팅커벨이 하나씩 천천히 지나가요', owner: false},
  {id: 'bichon', name: '하얀 비숑', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 하얀 비숑이 하나씩 천천히 지나가요', owner: false},
  {id: 'parrot', name: '나는 앵무새', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 하늘을 나는 앵무새가 하나씩 천천히 지나가요', owner: false},
  {id: 'heart', name: '하트 별자리', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 하트 별자리가 하나씩 천천히 지나가요', owner: false},
  // 10월 22일에 뺀 것(자료 2 「10월 22일에 뺀 것」) — 사장님이 하늘 풍경만 다시 넣으라 하심(명령서 [1] 9) · 태양계는 우주 영상 1분에도 없음
  {id: 'solar', name: '태양계', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 10월 22일에 뺐던 태양계, 다시 그려 하나씩 천천히 지나가요', owner: false},
  {id: 'comet', name: '혜성', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 10월 22일에 뺐던 혜성, 다시 그려 하나씩 천천히 지나가요', owner: false},
  {id: 'rocket', name: '우주선', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 10월 22일에 뺐던 우주선, 다시 그려 하나씩 천천히 지나가요', owner: false},
  {id: 'ufo', name: '비행접시', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 10월 22일에 뺐던 비행접시, 다시 그려 하나씩 천천히 지나가요', owner: false},
  {id: 'dragons', name: '용 두 마리', group: 'sky', helps: null, open: null, how: '뒷배경 하늘 층 — 10월 22일에 뺐던 용 두 마리, 다시 그려 하나씩 천천히 지나가요', owner: false},

  /* ── 손님 부르기 — 셋을 담아 건네는 것만 helps 를 적음 · 가입 · 선물 · 편지 · 초대장 · 영상은 null ── */
  {id: 'kakaosend', name: '카톡 보내기', group: 'guest', helps: 'three', open: '/next/#/today', how: '쪽마다 · 칸마다 「카톡 보내기」 — 보고 있는 것을 친구에게 보내요(오른 숫자는 빼고)', owner: false}, // 옛 쪽 모든 쪽 맨 아래 · 칸 제목마다(kk-all.js) — 첫 화면만 빠짐
  {id: 'kakaojoin', name: '카톡 가입', group: 'guest', helps: null, open: '/next/#/why', how: '매매일지 쪽 커피 쿠폰 칸의 「카톡으로 가입하기」 — 가입하면 내 기록 넷을 서버에도 지켜요', owner: false}, // 열한 질문을 끝낸 뒤 「이 기록 지키기」 칸에도 같은 길
  {id: 'intro', name: '소개 쪽', group: 'guest', helps: 'three', open: '/hello.html', how: '큐피트가 무엇을 하는 곳인지 한 장 — 불장 · 꽃이 될 · 돈이 몰리는 회사를 7곳씩 찾는다는 소개와 1분 영상', owner: false},
  {id: 'spacefilm', name: '우주 영상 1분', group: 'guest', helps: null, open: '/hello.html#hp-uv', how: '소개 쪽 「큐피트의 우주 · 1분」 영상 — 끝까지 보면 상품권 받기가 열려요', owner: false}, // 상품권 방(/next/#/gift) 둘째 걸음에도 같은 영상
  {id: 'giftroom', name: '상품권 방', group: 'guest', helps: null, open: '/next/#/gift', how: '친구 셋에게 소개하고 우주 영상 1분을 끝까지 보면 스타벅스 상품권', owner: false},
  {id: 'coffee', name: '커피 쿠폰', group: 'guest', helps: null, open: '/next/#/why', how: '열한 질문을 끝까지 하면 하루 1점 — 10점이면 커피 쿠폰 한 장(한 달 한 장)', owner: false},
  {id: 'letter', name: '편지 여는 밤', group: 'guest', helps: null, open: '/letter.html', how: '월요일부터 쓴 편지가 금요일 밤 8시에 다 함께 열려요', owner: false},
  {id: 'invite', name: '초대장', group: 'guest', helps: null, open: '/invite.html', how: '받는 사람 · 보내는 사람 · 짧은 말을 적어 선물 같은 초대장을 카톡으로 보내요', owner: false},
  // 오늘의 이야기 = 내리 오른 날 같은 짧은 때의 움직임 이야깃거리 · 대가 한마디 — hot
  {id: 'talk', name: '오늘의 이야기', group: 'guest', helps: 'hot', open: '/next/#/talk', how: '지난 기록으로 만든 이야깃거리 — 내리 오른 날 같은 것과 대가 한마디', owner: false},
  // 쇼츠 · 구독 = 옛 유튜브 뼈대 이름(2026-10-17 21:10 명령문 「쇼츠 → 시황 · 구독 → 관심」) — 위 시황 · 관심과 같은 쪽
  {id: 'shorts', name: '쇼츠', group: 'guest', helps: 'hot', open: '/next/#/shorts', how: '옛 이름 「쇼츠」 — 지금은 시황 쪽, 사실 장마다 카톡 보내기', owner: false},
  {id: 'subscribe', name: '구독', group: 'guest', helps: 'three', open: '/next/#/sub', how: '옛 이름 「구독」 — 지금은 관심 쪽, 업종 · 회사의 「관심 담기」로 모아요', owner: false},

  /* ── 뒤에서 도는 것 — 결과가 보이는 쪽을 open 에 적음 ── */
  // 종가 자동 올림 = 하루 정해진 때의 업데이트(예약 작업 atlas11-daily · evening) — 셋의 자료가 모두 이것으로 새로 들어오므로 three · 회차마다 업데이트 기록에 남음
  {id: 'closeauto', name: '종가 자동 올림', group: 'back', helps: 'three', open: '/next/#/up', how: '하루 정해진 때에 그날 값을 저절로 받아 올려요 — 회차마다 업데이트 기록에 남아요', owner: false},
  {id: 'jinhwa', name: '진화', group: 'back', helps: null, open: '/next/#/jinhwa', how: '큐피트가 나아진 것을 하나씩 보여요 — 만든 사람이 확인한 것만 세어요', owner: false},
  {id: 'updates', name: '업데이트 기록', group: 'back', helps: null, open: '/next/#/up', how: '언제 무엇을 새로 받았는지 회차마다 — 새로 든 곳 · 빠진 곳', owner: false},
  {id: 'help', name: '고객센터', group: 'back', helps: null, open: '/next/#/help', how: '한마디 남기기 · 물어보기 · 고객센터 안내', owner: false},
  // 도움말 = 옛 「고른 곳」 셈(멍거 · 린치 조건 56곳 · ml-v1) 풀이 — 21곳이 쓰는 우량주 365곳(n365-v1) 셈은 이 쪽에 없음 · 그래서 null
  {id: 'info', name: '도움말', group: 'back', helps: null, open: '/next/#/info', how: '큐피트가 어떻게 셌나 — 멍거 · 린치 조건 깔때기와 자료 · 때', owner: false},
  {id: 'admin', name: '관리자', group: 'back', helps: null, open: '/next/#/admin', how: '사장님 휴대폰에서만 — 쿠폰 번호 확인 · 가입 수 · 고객센터 글', owner: true},
  // 합계 세기 = tally.js → /api/tally(멈춤 · 약속 · 연 수) — 셈은 모든 기기에서 돌지만 합계를 보는 칸(진화 쪽 「잣대 셋」)은 사장님 열쇠 기기에만
  {id: 'tally', name: '합계 세기', group: 'back', helps: null, open: '/next/#/jinhwa', how: '멈춤 · 약속 수를 날마다 세어요 — 진화 쪽 「잣대 셋」에서 사장님 휴대폰에만 보여요', owner: true},
  // 쉬운 말 사전 = 낱말표(next/glossary.js) + 새 판 풀이(su-word.js) — 새 판 모든 쪽에 걸리고 맨 아래에 붙인 수를 적음
  {id: 'glossary', name: '쉬운 말 사전', group: 'back', helps: 'three', open: '#/', how: '어려운 낱말을 쉬운 말로 바꾸고 못 바꾼 낱말엔 풀이 — 쪽 맨 아래에 그 수', owner: false},
  // 말 거르기 = next/words.js(편지 · 별명 · 보내는 말 · 화면 검사) — 걸리는 것이 보이는 쪽은 편지 쓰는 칸과 카톡 보내기 글상자
  {id: 'wordfilter', name: '말 거르기', group: 'back', helps: null, open: '/letter.html', how: '편지 · 별명 · 보내는 말에 쓰지 않을 말이 있으면 짚어 주고 고칠 때까지 막아요', owner: false},
  {id: 'privacy', name: '개인정보', group: 'back', helps: null, open: '/privacy.html', how: '무엇을 모으고 어디에 쓰며 언제 지우는지 — 개인정보 처리방침', owner: false},
]);
