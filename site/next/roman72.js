/* 로마 신 72 자료(#/roman · p-roman.js 가 그림 · scripts/atlas11/next/check_roman.mjs 가 맞댐)
   사장님 2026-10-30(+03) 22:23 「그냥재미삼아 적절한곳에 배치해봐 둘리에」(docs/design/roman72-site-2026-10-31/order-0423.txt)
   앞 일 2026-10-31 02:49(+08) 「이제는 로마신화에 72명 먼저 선정해」 — 신 일흔둘 · 여섯 무리 · 한 줄 소개는 docs/design/roman72-2026-10-31/roman72.json 그대로(검사가 맞댐)
   자리 일흔둘 = 둘이 안 자리 하나에 신 하나(겹침 0) · 「왜 여기?」 = 그 신의 사실 + 맡는 일(재미로 이은 것) · 앞날 말 · 사고팔기 말 없음
   {N} = 이름(brand.js NAME · NAME_EN — 그리는 쪽이 채움 · 규칙 76) · 화면 · 문서 밖 모듈(DOM 없음 — 검사가 node 로 바로 읽음) */

/** 여섯 무리(roman72.json 차례) — [한국어, 영어] */
export const GROUPS = Object.freeze([
  ['열두 큰 신', 'The Twelve Great Gods'],
  ['로마 토박이 신', 'Native Roman Gods'],
  ['물과 땅과 때의 신', 'Gods of Water, Land, and Time'],
  ['집과 마음과 저승의 신', 'Gods of Home, Mind, and the Underworld'],
  ['좋은 것을 모신 신', 'Gods of Good Things'],
  ['로마를 세운 이야기 속 사람', 'People of the Founding Story'],
].map(x => Object.freeze(x)));

/** 신 일흔둘 — 번호(roman72.json n) → [한국어 이름, 라틴 이름, 영어 이름, 누구(한국어 · 고른 목록 그대로), 누구(영어), 무리 번호 1 ~ 6] */
export const GODS = Object.freeze(Object.fromEntries([
  [1, '유피테르', 'Iuppiter', 'Jupiter', '하늘과 번개의 신이에요. 신들의 왕이에요.', 'God of the sky and thunder. King of the gods.', 1],
  [2, '유노', 'Iuno', 'Juno', '유피테르의 아내예요. 결혼과 아이 낳기를 지켜요.', 'Wife of Jupiter. She protects marriage and childbirth.', 1],
  [3, '미네르바', 'Minerva', 'Minerva', '지혜와 손재주의 여신이에요.', 'Goddess of wisdom and crafts.', 1],
  [4, '마르스', 'Mars', 'Mars', '싸움의 신이에요. 로물루스의 아버지예요.', 'God of war. Father of Romulus.', 1],
  [5, '베누스', 'Venus', 'Venus', '사랑의 여신이에요. 아이네아스의 어머니예요.', 'Goddess of love. Mother of Aeneas.', 1],
  [6, '아폴로', 'Apollo', 'Apollo', '병 고침과 노래와 예언의 신이에요.', 'God of healing, music, and prophecy.', 1],
  [7, '디아나', 'Diana', 'Diana', '숲과 사냥과 달의 여신이에요.', 'Goddess of the woods, hunting, and the moon.', 1],
  [8, '메르쿠리우스', 'Mercurius', 'Mercury', '장사와 길과 소식의 신이에요.', 'God of trade, roads, and messages.', 1],
  [9, '넵투누스', 'Neptunus', 'Neptune', '바다와 물의 신이에요.', 'God of the sea and water.', 1],
  [10, '불카누스', 'Vulcanus', 'Vulcan', '불과 대장간의 신이에요.', 'God of fire and the forge.', 1],
  [11, '베스타', 'Vesta', 'Vesta', '화덕 불의 여신이에요. 여사제들이 나라의 불을 지켰어요.', 'Goddess of the hearth fire. Her priestesses guarded the fire of the state.', 1],
  [12, '케레스', 'Ceres', 'Ceres', '곡식과 거두기의 여신이에요.', 'Goddess of grain and harvest.', 1],
  [13, '야누스', 'Ianus', 'Janus', '문과 시작의 신이에요. 얼굴이 앞뒤 둘이에요.', 'God of doors and beginnings. He has two faces, front and back.', 2],
  [14, '퀴리누스', 'Quirinus', 'Quirinus', '로마 시민의 신이에요. 하늘에 오른 로물루스라고도 했어요.', 'God of the Roman citizens. Some said he was Romulus taken up to the sky.', 2],
  [15, '사투르누스', 'Saturnus', 'Saturn', '씨 뿌리기의 신이에요. 황금시대의 왕이에요.', 'God of sowing seeds. King of the Golden Age.', 2],
  [16, '옵스', 'Ops', 'Ops', '땅의 넉넉함을 지키는 여신이에요.', 'Goddess who keeps the plenty of the earth.', 2],
  [17, '파우누스', 'Faunus', 'Faunus', '들판과 가축의 신이에요.', 'God of fields and herds.', 2],
  [18, '실바누스', 'Silvanus', 'Silvanus', '숲과 밭 가장자리의 신이에요.', 'God of the woods and the edges of fields.', 2],
  [19, '팔레스', 'Pales', 'Pales', '양치기와 가축의 신이에요. 축제 날이 로마의 생일이에요.', 'Deity of shepherds and flocks. The festival day is Rome’s birthday.', 2],
  [20, '테르미누스', 'Terminus', 'Terminus', '땅 경계 돌의 신이에요. 자리를 옮기지 않았어요.', 'God of boundary stones. He would not move from his place.', 2],
  [21, '포르투누스', 'Portunus', 'Portunus', '항구와 문 열쇠의 신이에요.', 'God of harbors and door keys.', 2],
  [22, '콘수스', 'Consus', 'Consus', '거둔 곡식 창고의 신이에요.', 'God of the stored harvest.', 2],
  [23, '벨로나', 'Bellona', 'Bellona', '전쟁의 여신이에요.', 'Goddess of war.', 2],
  [24, '피쿠스', 'Picus', 'Picus', '딱따구리가 된 옛 왕이에요.', 'An old king who became a woodpecker.', 2],
  [25, '플로라', 'Flora', 'Flora', '꽃과 봄의 여신이에요.', 'Goddess of flowers and spring.', 3],
  [26, '포모나', 'Pomona', 'Pomona', '과일나무의 여신이에요.', 'Goddess of fruit trees.', 3],
  [27, '베르툼누스', 'Vertumnus', 'Vertumnus', '계절이 바뀌는 것을 맡은 신이에요. 모습을 마음대로 바꿔요.', 'God of the changing seasons. He can change his shape at will.', 3],
  [28, '리베르', 'Liber', 'Liber', '포도주의 신이에요. 자유의 신이기도 해요.', 'God of wine. He is also a god of freedom.', 3],
  [29, '로비구스', 'Robigus', 'Robigus', '곡식이 병들지 않게 막는 신이에요.', 'God who keeps the grain from disease.', 3],
  [30, '티베리누스', 'Tiberinus', 'Tiberinus', '티베르 강의 신이에요.', 'God of the river Tiber.', 3],
  [31, '유투르나', 'Iuturna', 'Juturna', '샘물의 여신이에요. 투르누스의 누이예요.', 'Goddess of springs. Sister of Turnus.', 3],
  [32, '에게리아', 'Egeria', 'Egeria', '샘의 요정이에요. 누마 왕에게 법을 알려 줬어요.', 'A spring nymph. She taught laws to King Numa.', 3],
  [33, '페로니아', 'Feronia', 'Feronia', '숲과 풀려난 종들의 여신이에요.', 'Goddess of the woods and of freed slaves.', 3],
  [34, '마테르 마투타', 'Mater Matuta', 'Mater Matuta', '새벽의 여신이에요. 아이 기르기를 지켜요.', 'Goddess of dawn. She protects the raising of children.', 3],
  [35, '솔', 'Sol', 'Sol', '해의 신이에요.', 'God of the sun.', 3],
  [36, '루나', 'Luna', 'Luna', '달의 여신이에요.', 'Goddess of the moon.', 3],
  [37, '라레스', 'Lares', 'Lares', '집과 길목을 지키는 작은 신들이에요.', 'Small gods who guard homes and crossroads.', 4],
  [38, '페나테스', 'Penates', 'Penates', '집 곳간을 지키는 신들이에요. 아이네아스가 트로이에서 모셔 왔어요.', 'Gods of the household pantry. Aeneas brought them from Troy.', 4],
  [39, '게니우스', 'Genius', 'Genius', '사람마다 하나씩 따르는 지킴이 신이에요.', 'A guardian spirit that goes with each person.', 4],
  [40, '마네스', 'Manes', 'Manes', '돌아가신 조상의 넋이에요.', 'The spirits of ancestors who have died.', 4],
  [41, '레무레스', 'Lemures', 'Lemures', '떠도는 넋이에요. 5월 밤에 콩을 던져 쫓았어요.', 'Restless spirits. On May nights, Romans threw beans to drive them away.', 4],
  // 보나 데아 — 고른 목록 「여자들만 모신 착한 여신이에요.」는 너무 넓음(남자가 바친 것도 있음 · 남자를 막은 것은 밤 제사) — 다른 일꾼 맞대기(2026-10-31)로 고침(ONE_FIX)
  [42, '보나 데아', 'Bona Dea', 'Bona Dea', '착한 여신이에요. 밤 제사에는 여자들만 모였어요.', 'The Good Goddess. Her nighttime rite was for women only.', 4],
  [43, '카르멘타', 'Carmenta', 'Carmenta', '아이 낳기를 돕는 여신이에요. 에반데르의 어머니예요.', 'Goddess who helps with childbirth. Mother of Evander.', 4],
  [44, '디스 파테르', 'Dis Pater', 'Dis Pater', '땅속 저승의 신이에요.', 'God of the underworld beneath the earth.', 4],
  [45, '프로세르피나', 'Proserpina', 'Proserpina', '저승의 여왕이에요. 케레스의 딸이에요.', 'Queen of the underworld. Daughter of Ceres.', 4],
  [46, '쿠피도', 'Cupido', 'Cupid', '사랑의 화살을 쏘는 아이 신이에요.', 'A child god who shoots arrows of love.', 4],
  [47, '프시케', 'Psyche', 'Psyche', '쿠피도의 아내가 된 사람이에요. 이름 뜻이 넋이에요.', 'A woman who became Cupid’s wife. Her name means soul.', 4],
  [48, '솜누스', 'Somnus', 'Somnus', '잠의 신이에요.', 'God of sleep.', 4],
  [49, '피데스', 'Fides', 'Fides', '약속을 지키는 믿음의 여신이에요.', 'Goddess of trust who keeps promises.', 5],
  [50, '콘코르디아', 'Concordia', 'Concordia', '한마음의 여신이에요.', 'Goddess of harmony.', 5],
  [51, '팍스', 'Pax', 'Pax', '평화의 여신이에요.', 'Goddess of peace.', 5],
  [52, '스페스', 'Spes', 'Spes', '희망의 여신이에요.', 'Goddess of hope.', 5],
  [53, '살루스', 'Salus', 'Salus', '건강과 안녕의 여신이에요.', 'Goddess of health and well-being.', 5],
  [54, '피에타스', 'Pietas', 'Pietas', '부모와 나라를 아끼는 마음의 여신이에요.', 'Goddess of devotion to parents and country.', 5],
  [55, '호노스', 'Honos', 'Honos', '명예의 신이에요.', 'God of honor.', 5],
  [56, '비르투스', 'Virtus', 'Virtus', '용기의 신이에요.', 'God of courage.', 5],
  [57, '빅토리아', 'Victoria', 'Victoria', '이김의 여신이에요.', 'Goddess of victory.', 5],
  [58, '리베르타스', 'Libertas', 'Libertas', '자유의 여신이에요.', 'Goddess of liberty.', 5],
  [59, '포르투나', 'Fortuna', 'Fortuna', '운의 여신이에요. 바퀴를 돌려요.', 'Goddess of luck. She turns a wheel.', 5],
  [60, '멘스', 'Mens', 'Mens', '바른 생각의 여신이에요. 큰 패배 뒤에 신전을 세웠어요.', 'Goddess of right thinking. Rome built her a temple after a great defeat.', 5],
  [61, '아이네아스', 'Aeneas', 'Aeneas', '불탄 트로이를 떠나 이탈리아에 온 영웅이에요.', 'A hero who left burning Troy and came to Italy.', 6],
  [62, '안키세스', 'Anchises', 'Anchises', '아이네아스의 아버지예요. 아들 등에 업혀 트로이를 나왔어요.', 'Father of Aeneas. He left Troy carried on his son’s back.', 6],
  [63, '아스카니우스', 'Ascanius', 'Ascanius', '아이네아스의 아들이에요. 알바 롱가를 세웠어요.', 'Son of Aeneas. He founded Alba Longa.', 6],
  [64, '라비니아', 'Lavinia', 'Lavinia', '라티누스 왕의 딸이에요. 아이네아스의 아내가 됐어요.', 'Daughter of King Latinus. She became the wife of Aeneas.', 6],
  [65, '라티누스', 'Latinus', 'Latinus', '라티움 땅의 왕이에요.', 'King of the land of Latium.', 6],
  [66, '투르누스', 'Turnus', 'Turnus', '아이네아스와 끝까지 싸운 왕이에요.', 'A king who fought Aeneas to the end.', 6],
  // 에반데르 — 고른 목록 「팔라티누스 언덕에 먼저 살던 왕이에요.」의 「팔라」가 화면 금지 말(words.js SCREEN 「팔라」)을 품어 같은 사실을 다른 말로(ONE_FIX)
  [67, '에반데르', 'Evander', 'Evander', '로마가 생기기 전, 훗날 로마의 한 곳이 될 언덕에 살던 왕이에요.', 'A king who lived, before Rome began, on a hill that later became part of Rome.', 6],
  [68, '디도', 'Dido', 'Dido', '카르타고의 여왕이에요. 아이네아스를 사랑했어요.', 'Queen of Carthage. She loved Aeneas.', 6],
  [69, '레아 실비아', 'Rhea Silvia', 'Rhea Silvia', '로물루스와 레무스의 어머니예요.', 'Mother of Romulus and Remus.', 6],
  [70, '로물루스', 'Romulus', 'Romulus', '로마를 세운 첫 왕이에요.', 'The first king, who founded Rome.', 6],
  [71, '레무스', 'Remus', 'Remus', '로물루스의 쌍둥이 형제예요.', 'Twin brother of Romulus.', 6],
  [72, '누마 폼필리우스', 'Numa Pompilius', 'Numa Pompilius', '둘째 왕이에요. 축제와 법을 정했어요.', 'The second king. He set up festivals and laws.', 6],
].map(([n, ...r]) => [n, Object.freeze(r)])));

/** 고른 목록과 다르게 그린 한 줄 — 번호 → 까닭(검사가 이 번호만 맞대기에서 뺌) */
export const ONE_FIX = Object.freeze({
  42: '고른 목록 「여자들만 모신」이 너무 넓음 — 남자를 막은 것은 12월 밤 제사(바친 글의 셋에 하나는 남자) · 다른 일꾼 맞대기 2026-10-31',
  67: '고른 목록 「팔라티누스 언덕에 …」의 「팔라」가 화면 금지 말(words.js SCREEN) · 로마가 생기기 전이라는 때를 더함(리비우스 1권 5장)',
});

/** 자리 무리 여덟 — id · [한국어, 영어] 이름 · [한국어, 영어] 한 줄 */
export const ZONES = Object.freeze([
  {id: 'home', name: ['첫 화면', 'Home'], note: ['첫 화면에서 만나는 신이에요.', 'Gods you meet on the home page.']},
  {id: 'talk', name: ['말하는 불빛 열한 개', 'The eleven talking lights'], note: ['① 돈 흐름에서 「열한 가지 보기」를 펼치면 나오는 불빛이에요.', 'The lights you see when you open the eleven checks under ① Money flow.']},
  {id: 'why', name: ['「왜 사?」 물음 열한 개', 'The eleven “Why buy?” questions'], note: ['아래 「왜 사?」 단추를 누르면 나오는 물음이에요.', 'The questions behind the “Why buy?” button at the bottom.']},
  {id: 'dock', name: ['아래 단추와 {N} 단추 안', 'Bottom buttons and the {N} menu'], note: ['아래 단추 넷과 {N} 단추 안에 있는 쪽이에요.', 'The four bottom buttons and the pages in the {N} menu.']},
  {id: 'top', name: ['위 막대와 작은 단추', 'Top bar and small buttons'], note: ['위 막대와 쪽마다 붙는 작은 단추예요.', 'The top bar and the small buttons found on many pages.']},
  {id: 'theme', name: ['테마 시계', 'Theme clock'], note: ['테마 시계 쪽이에요.', 'The theme clock pages.']},
  {id: 'co', name: ['회사 쪽', 'Company pages'], note: ['회사를 누르면 나오는 쪽이에요. 고리는 삼성전자로 열어요.', 'Pages you see when you tap a company. The links open Samsung Electronics as an example.']},
  {id: 'more', name: ['다른 쪽', 'Other pages'], note: ['그 밖의 쪽과 주소예요.', 'Other pages and addresses.']},
].map(z => Object.freeze(z)));

/** 자리 일흔둘(무리 차례) — [무리 id, 자리 이름(한국어), 자리 이름(영어), 고리(없으면 null — 제 주소가 없는 단추 · 쪽), 신 번호, 왜 여기(한국어), 왜 여기(영어)] */
export const SEATS = Object.freeze([
  ['home', '첫 화면 문', 'Front door', '#/', 21, '문 열쇠를 든 신이라 첫 화면 문을 열어 줘요.', 'He holds the door key, so he opens the front door.'],
  ['home', '① 돈 흐름', '① Money flow', '#/', 30, '강물이 흐르듯 돈이 어디로 흘렀는지 맡아요.', 'Like a river, he watches where the money flowed.'],
  ['home', '맨 위 약속 한 줄', 'The promise line at the top', '#/', 49, '맨 위 한 줄은 늘 지키는 약속이라 약속의 여신이 맡아요.', 'The top line is a promise we always keep, so the goddess of promises guards it.'],
  ['home', '업종 점 그림', 'Industry dot chart', '#/', 7, '숲에서 짐승 자리를 찾듯 업종이 어디쯤 있는지 봐요.', 'As a hunter finds animals in the woods, she sees where each industry is.'],
  ['home', '점 그림의 조용한 자리', 'The quiet corner of the chart', '#/', 48, '조용히 잠든 듯한 업종 자리를 맡아요.', 'He watches the quiet corner where industries seem to sleep.'],
  ['home', '② 고른 회사', '② Picked', '#/', 26, '과일을 살펴 고르듯 지난 기록으로 고른 회사를 맡아요.', 'Like choosing fruit with care, she looks after the companies picked by past records.'],
  ['home', '③ 묻기', '③ Ask', '#/why', 32, '누마 왕은 일을 정하기 전에 이 요정에게 물었다고 해요. 사기 전에 묻는 자리를 맡아요.', 'Legend says King Numa asked her before deciding things. She guards the place where you ask before buying.'],
  ['home', '④ 돌아보기', '④ Look back', '#/why/later', 60, '로마는 큰 패배 뒤에 이 여신의 신전을 세웠어요. 틀린 것도 지우지 않고 돌아보는 자리를 맡아요.', 'Rome built her a temple after a great defeat. She guards the place where you look back without erasing mistakes.'],
  ['home', '업종 모두 보기', 'See all industries', '#/f/ind', 17, '넓은 들판을 둘러보듯 업종을 모두 보여 줘요.', 'As if walking a wide field, he shows every industry.'],
  ['home', '맨 아래 안내', 'The notice at the bottom', '#/', 11, '꺼지지 않게 지킨 불처럼, 맨 아래 안내도 늘 켜 둬요.', 'Like the fire the Vestals kept watch over so it would not go out, the notice at the bottom always stays on.'],

  ['talk', '1번 불빛 · 외국인', 'Light 1 · Foreign investors', '#/', 61, '바다 건너 온 손님이라 다른 나라에서 온 투자자를 맡아요.', 'He came from across the sea, so he looks after investors from other countries.'],
  ['talk', '2번 불빛 · 기관', 'Light 2 · Institutions', '#/', 2, '로마는 유노 모네타 신전 곁에서 돈을 만들었어요. 큰돈을 굴리는 곳을 맡아요.', 'Rome made its coins beside the temple of Juno Moneta. She looks after the big money managers.'],
  ['talk', '3번 불빛 · 개인', 'Light 3 · Individuals', '#/', 14, '로마 시민을 퀴리테스라고 불렀어요. 우리 같은 보통 사람을 맡아요.', 'Roman citizens were called Quirites. He looks after everyday people like us.'],
  ['talk', '4번 불빛 · 좋은 소식', 'Light 4 · Good news', '#/', 64, '아이네아스와 결혼해 두 나라 사람이 하나가 됐어요. 좋은 소식을 맡아요.', 'Her marriage to Aeneas joined two peoples into one. She looks after good news.'],
  ['talk', '5번 불빛 · 끌어 올린 회사', 'Light 5 · The company that pulled it up', '#/', 4, '싸움에서 앞장서는 신이라 맨 앞에서 끌어 올린 회사를 맡아요.', 'As the god who leads into battle, he looks after the company at the front that pulled the rest up.'],
  ['talk', '6번 불빛 · 여러 곳이 같이', 'Light 6 · Rising together', '#/', 50, '여러 곳이 한마음으로 같이 오른 것을 맡아요.', 'She looks after times when many rose together, as if of one mind.'],
  ['talk', '7번 불빛 · 시장과 견주기', 'Light 7 · Against the market', '#/', 57, '시장 전체와 견준 결과를 맡아요.', 'She looks after the result of comparing with the whole market.'],
  ['talk', '8번 불빛 · 날씨', 'Light 8 · Weather', '#/', 1, '비와 번개를 내리는 하늘의 신이라 8번 날씨를 맡아요.', 'As the sky god who sends rain and thunder, he looks after light 8, the weather.'],
  ['talk', '9번 불빛 · 다른 나라', 'Light 9 · Other countries', '#/', 9, '9번 그림은 바다 건너 가게예요. 그래서 바다의 신이 맡아요.', 'Light 9 shows a shop across the sea, so the sea god looks after it.'],
  ['talk', '10번 불빛 · 정부 정책', 'Light 10 · Government policy', '#/', 72, '나라의 법을 정한 왕이라 정부 정책 소식을 맡아요.', 'As the king who set the laws, he looks after government-policy news.'],
  ['talk', '11번 불빛 · 나라 사이', 'Light 11 · Between countries', '#/', 23, '로마는 벨로나 신전에서 다른 나라 사신을 만났어요. 나라 사이 소식을 맡아요.', 'Rome met envoys from other nations at her temple. She looks after cross-border news.'],

  ['why', '「왜 사?」', '“Why buy?”', '#/why', 58, '남의 말에 끌려가지 않고 내 뜻으로 고르는지 물어요.', 'She asks if you choose by your own will, not because others told you.'],
  ['why', '「공부했어?」', '“Did you do your homework?”', '#/why', 3, '지혜의 여신이라 공부했는지 물어요.', 'As the goddess of wisdom, she asks if you did your homework.'],
  ['why', '「뭐가 좋아?」', '“What’s good about it?”', '#/why', 12, '곡식을 거두듯 회사가 무엇으로 돈을 버는지 봐요.', 'Like a harvest, she looks at what the company earns its money from.'],
  ['why', '「얼마 넣어?」', '“How much are you putting in?”', '#/why', 16, '살림이 넉넉하게 남도록 얼마를 넣을지 물어요.', 'She asks how much you will put in, so your household stays well supplied.'],
  ['why', '「흐름은?」', '“What’s the trend?”', '#/why', 31, '샘물이 흐르듯 값이 어떻게 흘러왔는지 봐요.', 'Like spring water, she looks at how the price has flowed.'],
  ['why', '「얼마나 올랐어?」', '“How much has it gone up?”', '#/why', 35, '해가 얼마나 높이 떴는지 보듯 얼마나 올랐는지 봐요.', 'As you see how high the sun is, he looks at how far it has gone up.'],
  ['why', '「떨어지면?」', '“If it drops?”', '#/why', 20, '경계 돌처럼 얼마까지 내려가도 괜찮은지 선을 정했는지 물어요.', 'Like a boundary stone, he asks if you set a line for how big a drop you can accept.'],
  ['why', '「오르면?」', '“If it goes up?”', '#/why', 22, '거둔 곡식을 창고에 넣듯 어디서 거둘지 정했는지 물어요.', 'Like grain put into storage, he asks if you decided where you will reap.'],
  ['why', '「언제 쓸 돈?」', '“When do you need the money?”', '#/why', 15, '씨를 뿌리면 거둘 때까지 기다려요. 언제 쓸 돈인지 물어요.', 'After sowing, you wait for the harvest. He asks when you will need the money.'],
  ['why', '「마음은?」', '“How do you feel?”', '#/why', 51, '마음이 평화롭고 차분한지 물어요.', 'She asks if your mind is calm and at peace.'],
  ['why', '「나눠 넣어?」', '“Spreading it out?”', '#/why', 37, '여럿이 집과 길목을 나눠 지켜요. 여러 곳에 나눠 넣었는지 물어요.', 'Many of them share the guarding of homes and crossroads. They ask if you spread your money out.'],

  ['dock', '꽃 될 회사', 'Bloom picks', '#/t/picks', 25, '꽃의 여신이라 꽃 될 회사 쪽을 맡아요.', 'As the goddess of flowers, she looks after Bloom picks.'],
  ['dock', '지난 기록', 'Past record', '#/t/pick', 40, '로마 사람은 해마다 조상을 기억했어요. 지난 기록을 맡아요.', 'Romans remembered their ancestors every year. They look after the past records.'],
  ['dock', '「왜 사?」 단추', 'The “Why buy?” button', '#/why', 43, '라틴 글자를 처음 알려 줬다는 이야기가 있어요. 적어 두는 매매일지를 맡아요.', 'Legend says she first taught the Latin letters. She looks after the journal you write in.'],
  ['dock', '{N} 단추', 'The {N} button', '#/dori', 70, '쌍둥이로 태어나 둘이서 새 도시를 세우려 했어요. {N} 단추를 맡아요.', 'Born a twin, he and his brother set out to found a new city. He looks after the {N} button.'],
  ['dock', '한 달 뒤', 'One month later', '#/why/later', 36, '달은 한 달에 한 번 차고 기울어요. 한 달 뒤 기록을 맡아요.', 'The moon waxes and wanes once a month. She looks after the one-month-later records.'],
  ['dock', '보유종목', 'Holdings', '#/me', 38, '집 곳간을 지키듯 내가 가진 회사를 맡아요.', 'As they guard the household pantry, they look after the companies you hold.'],
  ['dock', '관심', 'Watch', '#/sub', 5, '사랑의 여신이라 마음에 둔 업종을 맡아요.', 'As the goddess of love, she looks after the industries you care about.'],
  ['dock', '시황', 'Recap', '#/shorts', 33, '페로니아 신전 앞에는 큰 장이 섰어요. 장 이야기인 시황을 맡아요.', 'A big market fair was held at her shrine. She looks after the market recap.'],
  ['dock', '서른아홉 스승', '39 Masters', '#/sage', 6, '델포이의 아폴로 신전에 「너 자신을 알라」가 새겨져 있었어요. 스승들의 생각을 맡아요.', '“Know yourself” was carved at Apollo’s temple at Delphi. He looks after the masters’ ways of thinking.'],
  ['dock', '{N} 인사', 'Hello from {N}', '#/t/hello', 69, '쌍둥이를 낳은 어머니라 {N} 인사를 맡아요.', 'As the mother of twins, she looks after the hello from {N}.'],
  ['dock', '고객센터', 'Help center', '#/help', 42, '신전에서 약초로 아픈 사람을 돌봤어요. 도움이 필요한 사람을 맡아요.', 'At her temple the sick were cared for with herbs. She looks after people who need help.'],

  ['top', '진화', 'Evolve', '#/jinhwa', 47, '그리스 말 프시케에는 나비라는 뜻도 있어요. 나비처럼 바뀌어 가는 진화를 맡아요.', 'In Greek, psyche can also mean butterfly. She looks after Evolve, which keeps changing like a butterfly.'],
  ['top', '상품권', 'Gift card', '#/gift', 55, '좋은 일을 칭찬하는 신이라 친구를 소개한 사람의 상품권을 맡아요.', 'As the god who honors good deeds, he looks after the gift card for people who invite friends.'],
  ['top', '찾기', 'Search', '#/find', 24, '딱따구리가 나무를 콕콕 쪼듯 회사를 찾아요.', 'Like a woodpecker tapping at trees, he searches for companies.'],
  ['top', '글씨 크기 단추', 'Text size button', null, 53, '눈이 편하도록 글씨를 키우는 단추를 맡아요.', 'She looks after the button that makes the text bigger, to rest your eyes.'],
  ['top', '영어 단추', 'Language button', null, 65, '라틴 말이 그의 땅 라티움에서 이름을 얻었어요. 말을 바꾸는 단추를 맡아요.', 'The Latin language is named after his land, Latium. He looks after the language button.'],
  ['top', '카톡 보내기 단추', 'Send on KakaoTalk button', null, 46, '화살을 쏘듯 친구에게 카톡을 보내는 단추를 맡아요.', 'Like shooting an arrow, he looks after the button that sends a KakaoTalk message to a friend.'],

  ['theme', '싹 자리', 'All sprouts', '#/t/sprout', 34, '해가 막 오르는 새벽처럼, 막 오르기 시작한 자리를 맡아요.', 'Like dawn, when the sun just begins to rise, she looks after the zone that is just starting to rise.'],
  ['theme', '꽃 자리', 'Bloom zone', '#/t/bloom', 56, '굳센 힘으로 한 달 내내 강한 자리를 맡아요.', 'With steady courage, he looks after the zone that stayed strong all month.'],
  ['theme', '시듦 자리', 'Fading zone', '#/t/wilt', 45, '그녀가 저승에 있는 동안 어머니 케레스가 슬퍼해서 땅의 곡식이 시들었어요. 강하다 꺾인 자리를 맡아요.', 'While she was in the underworld, her mother Ceres grieved and the crops withered. She looks after the zone that was strong and then turned down.'],
  ['theme', '시계 읽는 법', 'How to read the clock', '#/t/how', 27, '계절이 돌듯 네 자리를 도는 시계 읽는 법을 맡아요.', 'As the seasons turn, he looks after how to read the clock of four zones.'],
  ['theme', '오늘 정리', 'Today’s summary', '#/t/today', 54, '하루를 아끼는 마음으로 오늘 일을 정리해요.', 'With a caring heart, she sums up the day.'],
  ['theme', '싹 달력', 'Sprout calendar', '#/t/cal', 19, '그 축제 날은 4월 21일이에요. 날마다 싹을 적는 달력을 맡아요.', 'That festival falls on April 21. Pales looks after the calendar that notes sprouts each day.'],
  ['theme', '알림', 'Alerts', '#/t/alert', 8, '신들의 소식을 나르는 신이라 알림을 맡아요.', 'As the messenger of the gods, he looks after alerts.'],

  ['co', '회사 한 장', 'A company page', '#/w/005930', 39, '로마 사람은 모임과 장소마다 지킴이 신이 있다고 믿었어요. 회사 한 장을 맡아요.', 'Romans believed groups and places had their own guardian spirit. He looks after each company page.'],
  ['co', '지나온 길', 'Past path', '#/w/005930/past', 62, '트로이를 떠나 먼 길을 지나왔어요. 회사가 지나온 길을 맡아요.', 'He travelled a long road after leaving Troy. He looks after the path a company has taken.'],
  ['co', '누구와 다투나', 'Rivals', '#/w/005930/rivals', 66, '끝까지 다툰 왕이라 회사가 누구와 다투는지 맡아요.', 'As a king who fought to the end, he looks after who a company competes with.'],
  ['co', '앞으로 클까?', 'Will it grow?', '#/w/005930/grow', 63, '어린 아들이 자라 새 도시를 세웠어요. 「앞으로 클까?」를 묻는 쪽을 맡아요.', 'The young son grew up and founded a new city. He looks after the page that asks “Will it grow?”'],
  ['co', '범위 · 확인', 'Range check', '#/w/005930/range', 18, '밭 가장자리를 지키듯 어디부터 어디까지인지 범위를 맡아요.', 'As he guards the edges of fields, he looks after the range, from where to where.'],

  ['more', '오늘 시장', 'Today’s market', '#/today', 52, '로마 채소 시장 안에 스페스 신전이 있었어요. 오늘 시장을 맡아요.', 'Spes had a temple in Rome’s vegetable market. She looks after Today’s market.'],
  ['more', '급등', 'Surge', '#/surge', 59, '운이 갑자기 바뀌듯 갑자기 크게 오른 회사를 맡아요.', 'As luck can change suddenly, she looks after companies that jumped suddenly.'],
  ['more', '달력', 'Calendar', '#/cal', 13, '라틴 말로 1월은 야누아리우스예요. 야누스의 이름에서 왔어요. 달력을 맡아요.', 'January, the first month, is named after Janus. He looks after the calendar.'],
  ['more', '조건 찾기', 'Filter', '#/cond', 29, '곡식이 병드는 것을 막듯 조건으로 하나씩 걸러 보는 쪽을 맡아요.', 'As he keeps disease from the grain, he looks after the page that filters by conditions.'],
  ['more', '오늘의 이야기', 'Today’s talk', '#/talk', 67, '아이네아스에게 옛이야기를 들려줬어요. 오늘의 이야기를 맡아요.', 'He told Aeneas old stories. He looks after Today’s talk.'],
  ['more', '업데이트 기록', 'Update log', '#/up', 10, '대장간에서 두드려 고치듯 고친 기록을 맡아요.', 'Like hammering at a forge, he looks after the log of fixes and updates.'],
  ['more', '봉인', 'Time capsule', '#/time', 44, '땅속에 묻어 두듯 고른 날을 봉인해 몇 해 뒤에 열어요.', 'Like burying something underground, he keeps a sealed day to open years later.'],
  ['more', '어떻게 셌나요', 'How we count', '#/info', 68, '소가죽을 가늘게 잘라 땅을 둘러 쟀다는 이야기가 있어요. 어떻게 셌는지 맡아요.', 'Legend says she cut an ox-hide into thin strips to measure out land. She looks after how we count.'],
  ['more', '{N} 칸', '{N} list', '#/gdr', 71, '쌍둥이 둘 가운데 하나라 {N} 칸을 맡아요.', 'One of the twins, he looks after the {N} list.'],
  ['more', '친구가 연 보내기 쪽', 'A page a friend opened', null, 28, '잔을 나누듯 친구와 나눠 보는 쪽을 맡아요.', 'Like sharing a cup, he looks after pages shared with friends.'],
  ['more', '길 잃은 주소', 'A lost address', null, 41, '떠도는 넋이라 길 잃은 주소를 맡아요. 없는 주소는 첫 화면으로 보내요.', 'As wandering spirits, they look after lost addresses. A missing address goes back to the home page.'],
].map(s => Object.freeze(s)));

/* 방 지킴이(사장님 2026-10-31 05:51(+03) 「응」 — 물음 「방마다 그 신 이름표도 달아 볼까요?」 · docs/design/roman72-site-2026-10-31/order-1151.txt)
   쪽(방) 하나 = 지킴이 신 하나 — 그 쪽 자체가 자리인 신(쪽 안 칸 자리 — 불빛 · 물음 — 은 그 쪽 지킴이가 아님) · 이름표는 roman-tag.js 가 쪽 맨 아래 · 카톡 줄 위에 닮
   열쇠 = 주소 꼴(w/* = 아무 회사 · t/<쪽> · f/<칩>) · 시황(#/shorts)은 한 화면 넘김 쪽이라 이름표 없음 · s = 친구가 연 보내기 쪽(#/s/…) */
export const ROOMS = Object.freeze({
  '': 21, why: 43, 'why/later': 36, 't/picks': 25, 't/pick': 40, dori: 70, me: 38, sub: 5, sage: 6, 't/hello': 69, help: 42,
  jinhwa: 47, gift: 55, find: 24,
  't/sprout': 34, 't/bloom': 56, 't/wilt': 45, 't/how': 27, 't/today': 54, 't/cal': 19, 't/alert': 8,
  'w/*': 39, 'w/*/past': 62, 'w/*/rivals': 66, 'w/*/grow': 63, 'w/*/range': 18,
  today: 52, surge: 59, cal: 13, cond: 29, talk: 67, up: 10, time: 44, info: 68, gdr: 71, 'f/ind': 17, s: 28,
});
/** 주소(k · a — app.js parse 꼴) → 그 방 지킴이 신 번호 · 없으면 null */
export function roomOf(k, a) {
  const s = String(a ?? '').split('/');
  if (k === 'w') return s[0] ? ROOMS['w/*' + (s[1] ? '/' + s[1] : '')] ?? null : null;
  if (k === 't') return ROOMS['t/' + (s[0] || 'hello')] ?? null; // #/t = 둘이 인사 · #/t/sprout/real → 싹 자리 · 업종 · 회사 쪽(t/i · t/c)은 없음
  if (k === 'why') return s[0] === 'later' ? ROOMS['why/later'] : ROOMS.why; // #/why/<번호> = 그 회사로 쓰는 매매일지(같은 방)
  if (k === 'f') return ROOMS['f/' + s[0]] ?? null;
  return Object.hasOwn(ROOMS, k) ? ROOMS[k] : null;
}

/* 말하는 불빛 지킴이(사장님 2026-10-31 07:32(+03) 「어 달면서 신들에 / 이미지도 캐릭터화해서 해」 · docs/design/roman72-site-2026-10-31/order-1332.txt)
   첫 화면 말하는 불빛 번호(1 ~ 11) → 그 자리 신 = SEATS 「talk」 무리 차례 그대로(자리 이름 「n번 불빛 · …」 — 검사가 맞댐) · home-talk.js 말풍선 머리에 얼굴과 이름 */
export const LIGHTS = Object.freeze(Object.fromEntries(SEATS.filter(s => s[0] === 'talk').map((s, i) => [i + 1, s[4]])));

/** 신 캐릭터 그림 주소 — site/next/roman-art/<번호>.svg(scripts/atlas11/next/roman_art.mjs 가 그림 · 글자 없는 그림 · 그림마다 무리 색 동그라미 판) */
export const artOf = n => (GODS[n] ? `/next/roman-art/${n}.svg` : null);
