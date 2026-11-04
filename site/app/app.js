/* ATLAS 11 · 껍데기·길찾기 — 우량주·시대 트렌드 180곳 판(예측 없음)
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   2026-10-04 20:52 「대표 52개념도 삭제해 총 180개에서 섹타를 구분해」 — 처음 화면은 180곳을 섹터로 나눠 보인다.
   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면(#/stock/CODE) · 두 번이면 어디든
   2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 잡스라면 그리고 애플이라면 해서 추가로 더 만들어」 — 출목표 한 판(#/road)
   아래 탭 셋: 처음 화면(#/ · 이름은 지금 묶음의 곳 수 「180곳」) · 「출목표」(#/road) · 「일정」(#/agenda) — 업종·회사 화면은 처음 화면에 속한다.
   지금 탭을 한 번 더 누르면 맨 위로 · 출목표 한 판은 회사 화면에 갔다 와도 보던 자리 그대로(아이폰 탭 막대처럼).
   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records)는 처음 화면으로 돌린다.
   2026-10-05 02:44 「잡스였다면」 개혁: 불러오는 동안 파일 이름 같은 기술 말 대신 회색 자리 표시(애플 HIG 「바로 열리고, 빈칸 대신 자리 표시」)
     · 그래프 선 그리기(0.3초)는 화면마다 처음 한 번만 — 같은 화면을 다시 그릴 때(묶음 바꾸기 · 글씨 단추)는 움직이지 않는다(애플 HIG 움직임: 목적이 있을 때만)
   2026-10-05 05:03 사장님 「탬을 두개 더 만든다 … 불장 그리고 뭐뭐가 있잖아 그걸 탭 처리로 하지 지금은 밑으로 내려애ㅣㅑ 하잖아」 · 05:07 「해」
     아래 탭 다섯: 불장(#/ · 36칸 판) · 예비(#/similar · 불장 닮은 7곳 · 저녁 7시 들고 남) · 22곳(#/rise · 불장 밖에서 오름 상위) · 출목표(#/road) · 일정(#/agenda)
     업종·회사 화면은 들어온 탭에 속한다(예비 탭에서 회사를 누르면 예비 탭이 눌린 채로)
   2026-10-05 10:24 「잡스라면 … 큰틀에서 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」 — 1차 올림(13~15번):
     아래 탭 넷: 불장(#/ · 불장 업종만, 큰 흐름) · 업종(#/map · 73칸 판) · 출목표(#/road) · 일정(#/agenda)
     예비(#/similar) · 오름 상위(#/rise)은 탭 「불장」 안 맨 위 스위치로(parts.js hotSwitch) — 내리지 않고 한 번 눌러 바뀜 · 셋 다 탭 「불장」이 눌린 채로
   2026-10-05 15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」: #/road/sun = 어느 화면에서든 출목표 「태양」으로(태양 하나로 잇기)
   2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 별도의 탭에 … 기록 하는 탭을 만들어 줘」: 아래 탭 여섯째 「기록」(#/log · view-log.js)
     넣으면서 뺀 것(규칙 1): 모든 화면 맨 아래 「기술 정보」 접힘 — 「기록」 탭 맨 아래로 옮김
   2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」: 아래 탭 일곱째 「처음」(#/start · view-start.js · 셈 lib/atlas11/start.mjs · 규칙 21)
     넣으면서 뺀 것(규칙 1): 첫 화면 맨 아래 접힌 「ATLAS가 하지 않는 일」 — 「처음」 탭 맨 아래로 옮김
   2026-10-09 03:09(마카오 시각) 「ATLAS 제품 재설계 명령 — 지금 매수할 가치가 있는 후보 7개를 찾는다」 9 「탐색 구조를 세 가지 작업으로」:
     아래 탭 넷 = 후보 7(#/ · 매수 검토 후보 · 비교 #/compare) · 관심(#/watch · 관심 · 추적) · 검증(#/check · 운영 기록) · 탐색(#/market — 시장 · 업종 · 종목 · 일정을 맨 위 줄로 오감)
     옛 주소는 모두 그대로 열림(옛 첫 화면 「시장」은 #/market · 넣으면서 뺀 것(규칙 1): 위 막대 관심 ★ — 아래 탭 「관심」이 대신) */
import {h, speakScreen, stopSpeak, place, setPlace, korDate} from './util.js';
import {ON as I18N, LANG, LANG_LIST, LANG_INFO, startI18n, addBoardNames} from './i18n.js';
import {EASY, startEasy, addEasyNames, whatLine, levelButton, glossaryBox} from './easy.js'; // 쉬운 말(2026-10-09 22:40 마카오 시각 「아이큐 92 남자 고등학생이 이해하고 공감가며 사용할수 있도록 … 글은 참쉽게 그리고 ui/ux도 정말 쉽게」 · 규칙 48) — 한국어 화면 · 전문가 말은 단추 하나로
import {familyOf} from './family.js'; // 쉬운 말이 바꾸지 않을 이름(갈래) // 언어팩(2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 · 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게」) — 위 막대 말 단추
import {state, loadManifest, loadBoard, loadPlaceBoard, prefs, url} from './store.js';
import {renderHome, renderMap, renderLand} from './view-home.js';
import {renderMarket} from './view-market.js'; // 탐색 안 「시장」(#/market · 옛 첫 화면 — 2026-10-08 20:19 마카오 시각 「ATLAS 개편 실행 지시서」 — ① 언제 ~ ⑤ 다음 확인)
import {renderCand, renderCompare} from './view-cand.js'; // 아래 탭 「후보 7」 첫 화면(#/) · 다른 후보와 비교(2026-10-09 03:09 「ATLAS 제품 재설계 명령」)
import {exploreNav} from './parts.js'; // 탐색 맨 위 줄(시장 · 업종 · 종목 · 일정)
import {renderFlowWho} from './view-flowwho.js'; // 시장 안 「투자자 매매」(지시서 6 · 2026-10-09 메인 탭 다섯 — 옛 「돈 흐름」 탭에서 옮김)
import {renderSectors} from './view-sectors.js'; // 아래 탭 「업종」(2026-10-09 「ATLAS 업데이트 실행 프롬프트」 4 · 6 — 평균 펼치기 · 업종 진단)
import {renderStocks} from './view-stocks.js'; // 아래 탭 「종목」(지시서 7 — 찾기 · 정렬 · 거르기 · 전체 목록 · 옛 「찾기」 탭)
import {renderCheck} from './view-check.js'; // 아래 탭 「검증」 첫 화면 「선정 결과」(지시서 9)
import {renderWatch} from './view-watch.js'; // 관심종목(위 막대 ★ · 지시서 3 · 7 — 여섯째 탭 없음)
import {renderFlow} from './view-flow.js'; // 업종 안 「업종 순환」(옛 아래 탭 「돈 흐름」 · 2026-10-08 17:41 마카오 시각 「돈에 흐름과 불장을 분리한다」 · 2026-10-09 업종 탭 안으로)
import {renderCompany} from './view-company.js';
import {renderIndustry} from './view-industry.js';
import {renderAgenda} from './view-agenda.js';
import {renderRoad, resetRoad, openSun, openAt, openGroup} from './view-road.js';
import {renderSimilar} from './view-similar.js';
import {renderRise} from './view-rise.js';
import {renderLog} from './view-log.js';
import {renderStart} from './view-start.js';
import {renderGuide} from './view-guide.js'; // 한국 주식시장 안내(2026-10-07 05:31 「외국인들 특히 한국에 상주하는 외국인들도 한국 주식시장을 제대로 알수 있게」)
import {renderLearn} from './view-learn.js'; // 읽는 법 연습 「같은 평균, 다른 구조」(2026-10-09 셋째 개정본 0-E · 연습용 숫자 · 안내 안)
import {renderLong} from './view-long.js'; // 500만 원을 오래 들고 있었다면(2026-10-07 05:27 「10년후 20년후 30년후 장기보유 했을시 500만원이 얼마가 될지를 … 매우 보수적인 입장으로 … 부동산과 상대 비교」)
import {quietArt} from './scenes.js'; // 오류 화면도 그림 한 장(빈 하늘 · 2026-10-08 05:05 빈 날 막기)
import {renderKorea} from './view-korea.js'; // 한국 주식시장은 몇 위인가(2026-10-07 05:29 「대한민국이 다른 나라에 비해 얼마나 투자처로 우위인지 … 등수와 논리와 자료로」)

const app = {view: null, manifest: null, tab: 'cand', places: []};
const ICON = {
  // 후보 7: 줄 셋 앞 체크(검토할 목록 · 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 9)
  cand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6.5l1.8 1.8 3.2-3.6"/><path d="M3.5 13l1.8 1.8 3.2-3.6"/><path d="M11.5 7h9M11.5 13.5h9M11.5 19.5h9"/></svg>',
  // 관심: 별(옛 위 막대 ★ — 아래 탭으로)
  watch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
  // 탐색: 나침반(시장 · 업종 · 종목 · 일정을 직접 찾아봄)
  explore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/></svg>',
  // 시장: 오르내리는 선 하나와 바닥 줄(2026-10-08 20:19 「ATLAS 개편 실행 지시서」 — 아래 탭 다섯: 시장 · 돈 흐름 · 종목 · 일정 · 검증)
  market: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5h17"/><path d="M4 16l4.5-5 3.5 3 6.5-8"/><path d="M15 6h3.5v3.5"/></svg>',
  // 업종: 세로 축 하나에서 뻗은 길이가 다른 막대 셋(평균 펼치기 · 업종마다 기여 — 2026-10-09)
  sectors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4.5 3.5v17"/><path d="M4.5 7.5h13M4.5 12h8M4.5 16.5h15"/></svg>',
  // 종목: 줄 셋과 돋보기(목록 · 찾기)
  stocks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3.5 6h9M3.5 12h6M3.5 18h6"/><circle cx="16.5" cy="13.5" r="4"/><path d="M19.4 16.4 21.5 18.5"/></svg>',
  // 검증: 동그라미 안 체크
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.7 2.7L16.2 9.4"/></svg>',
  // 위 막대: 찾기(돋보기) · 관심(별) · 안내(i) · 보기(점 셋)
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20.5 20.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.5" cy="12" r="1.9"/></svg>',
  // 불장: 불꽃 하나 · 지도(옛 업종): 크기가 다른 땅 넷 — 로고 5번 「땅 나누기」와 같은 모양(옛: 같은 네 칸)
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8c.7 3.1-1.8 4.7-3.2 6.7C7.7 11 7 12.6 7 14.2a5 5 0 0 0 10 0c0-2.4-1.2-4.1-2.3-5.4-.2 1.5-.9 2.4-1.9 2.9.4-3-.2-6.2-.8-8.9z"/></svg>',
  // 돈 흐름: 동전 하나 → 화살(돈이 옮겨 감 · 2026-10-08 17:41)
  flow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="12" r="4.5"/><path d="M7.5 9.8v4.4"/><path d="M13.5 12h7.5"/><path d="M17.8 8.6 21.2 12l-3.4 3.4"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="8.5" height="10" rx="1.6"/><rect x="3.5" y="16.5" width="8.5" height="4" rx="1.4"/><rect x="15" y="3.5" width="5.5" height="5.5" rx="1.4"/><rect x="15" y="12" width="5.5" height="8.5" rx="1.6"/></svg>',
  road: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5" cy="5" r="2.6"/><circle cx="5" cy="12" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="12" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="19" cy="12" r="2.6"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3M8 17h6"/></svg>',
  // 찾기: 돋보기(2026-10-05 20:24 「종목을 찾는 기능」)
  find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20.5 20.5"/></svg>',
  // 기록: 거꾸로 도는 화살 + 시계 바늘(지난 일을 적은 곳 · 2026-10-06 16:10 「기록 하는 탭」)
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.2 12a7.8 7.8 0 1 0 2.3-5.5"/><path d="M4.2 3.8v4.6h4.6"/><path d="M12 7.8V12l3 2"/></svg>',
  // 처음: 새싹 하나(처음 사는 사람 · 2026-10-07 00:49 「이대로 사이트에 올려줘」)
  start: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21v-9"/><path d="M12 12c0-4.2 2.9-6.8 7.5-6.8 0 4.4-3 6.8-7.5 6.8z"/><path d="M12 14.5c0-3.3-2.3-5.4-6-5.4 0 3.5 2.4 5.4 6 5.4z"/><path d="M7.5 21h9"/></svg>',
  // 예비: 반짝임 하나(큰 별 + 작은 별) — 「눈여겨볼 것」
  similar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 11.9 9.1 17.5 11 11.9 12.9 10 18.5 8.1 12.9 2.5 11 8.1 9.1z"/><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  // 22곳: 차례 목록(점 셋 + 줄 셋)
  rise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11.5M9 12h11.5M9 18h11.5"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
};
const routes = [
  // 2026-10-09 03:09(마카오 시각) 「ATLAS 제품 재설계 명령」 9 — 아래 탭 넷: 후보 7 · 관심 · 검증 · 탐색(시장 · 업종 · 종목 · 일정) · 옛 화면은 지우지 않고 그 탭 안으로(옛 주소 그대로)
  // (옛: 2026-10-08 20:19 「ATLAS 개편 실행 지시서」 아래 탭 다섯 · 2026-10-09 01:41 「ATLAS 업데이트 실행 프롬프트」 4 시장 · 업종 · 종목 · 일정 · 검증)
  {id: 'cand', tab: 'cand', label: '후보 7', match: /^(#\/?)?$/, render: renderCand}, // 매수 검토 후보(최대 7곳) — ① 시장 · 기간 · 시점 ② 후보 ③ 이유 ④ 상태 · 위험
  {id: 'compare', tab: 'cand', match: /^#\/compare(\/[A-Za-z0-9][A-Za-z0-9.\-]{0,11}){0,2}$/, render: renderCompare}, // 다른 후보와 비교(같은 기간 · 같은 기준)
  {id: 'market', tab: 'market', label: '탐색', match: /^#\/market$/, render: renderMarket}, // 시장(옛 첫 화면 #/ — ① 기준 ~ ⑤ 다음 행동) · 아래 탭 「탐색」의 첫 화면
  {id: 'flow', tab: 'market', match: /^#\/flow$/, render: renderFlowWho}, // 투자자 매매(실제 매매) — 시장 안(옛 아래 탭 「돈 흐름」 첫 화면 · 주소 그대로)
  {id: 'sectors', tab: 'market', match: /^#\/sectors$/, render: renderSectors}, // 업종 진단 · 평균 펼치기(2026-10-09)
  {id: 'rotation', tab: 'market', match: /^#\/flow\/rotation$/, render: renderFlow}, // 업종 순환(시장 대비 시가총액 변화 · 상대 강도) — 업종 안(주소 그대로)
  {id: 'hot', tab: 'market', match: /^#\/hot$/, render: renderHome}, // 옛 아래 탭 「불장」(2026-10-05 05:03) — 업종 안 「불장」
  {id: 'map', tab: 'market', match: /^#\/map$/, render: renderMap}, // 2026-10-06 00:21 「잡스라면 … 개선하라」 — 주소 그대로(#/map) · 업종 안 「지도」
  {id: 'land', tab: 'market', match: /^#\/map\/f\/[a-z0-9]+$/, render: renderLand}, // 2026-10-06 07:03 「왜 3단 클릭 구조가 아니지?」 — 지도 땅 → 그 갈래 화면 → 업종 → 회사
  {id: 'industry', tab: 'from', match: /^#\/i\/[a-z0-9]+$/, render: renderIndustry},
  {id: 'stock', tab: 'from', match: /^#\/stock\/[A-Za-z0-9][A-Za-z0-9.\-]{0,11}$/, render: renderCompany}, // 한국 6자리 · 미국 영문 기호(2026-10-05 18:02 「미국 주식도」)
  {id: 'stocks', tab: 'market', match: /^#\/stocks$/, render: renderStocks}, // 찾기 · 정렬 · 거르기 · 새로 발견 · 근거 강화 · 근거 약화 · 전체 비교(지시서 7) — 옛 #/find 는 여기로
  {id: 'road', tab: 'market', match: /^#\/road$/, render: renderRoad}, // 출목표(2026-10-04 22:12) — 종목 안 보기
  {id: 'similar', tab: 'market', match: /^#\/similar$/, render: renderSimilar},
  {id: 'rise', tab: 'market', match: /^#\/rise$/, render: renderRise},
  {id: 'agenda', tab: 'market', match: /^#\/agenda$/, render: renderAgenda},
  {id: 'check', tab: 'check', label: '검증', match: /^#\/check$/, render: renderCheck}, // 선정 결과(지시서 9) · 후보 기록과 단순 선정 비교
  {id: 'log', tab: 'check', match: /^#\/log$/, render: renderLog}, // 운영 기록(옛 아래 탭 「기록」 · 2026-10-06 16:10) — 검증 안
  {id: 'watch', tab: 'watch', label: '관심', match: /^#\/watch$/, render: renderWatch}, // 관심 · 추적 — 아래 탭(옛 위 막대 ★)
  {id: 'guide', tab: 'guide', match: /^#\/guide$/, render: renderGuide}, // 안내(위 막대 ⓘ) — 옛 아래 탭 「처음」 아래 화면들
  {id: 'long', tab: 'guide', match: /^#\/long$/, render: renderLong},
  {id: 'learn', tab: 'guide', match: /^#\/learn$/, render: renderLearn},
  {id: 'korea', tab: 'guide', match: /^#\/korea$/, render: renderKorea},
  {id: 'start', tab: 'guide', match: /^#\/start$/, render: renderStart}, // 옛 아래 탭 「처음」(2026-10-07 00:49) — 위 막대 「안내」
];
const TABS = ['cand', 'watch', 'check', 'market']; // 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 9 — 세 가지 작업(후보 7 · 관심 · 추적 · 검증) + 직접 탐색(시장 · 업종 · 종목 · 일정)
const TAB_HREF = {cand: '#/', watch: '#/watch', check: '#/check', market: '#/market'};
const EX_ROOT = new Set(['market', 'sectors', 'stocks', 'agenda']); // 탐색 네 곳의 첫 화면(parts.js EXPLORE) — 위 줄 [시장 · 업종 · 종목 · 일정]은 여기에만
/** 보던 자리 기억(출목표 · 닮은 7곳 · 22곳 · 업종 진단 · 업종 화면) — 회사 화면에 갔다 돌아오면 그 자리(지시서 0-E 「모바일에서 업종으로 돌아오면 보던 자리」)
 *  업종 화면(#/i/…)은 업종마다 따로 기억(주소마다) · 나머지는 화면마다 */
const KEEP_SCROLL = new Set(['cand', 'road', 'similar', 'rise', 'map', 'stocks', 'hot', 'sectors', 'industry', 'market', 'agenda', 'watch', 'check']), scrollMemo = new Map(); // 2026-10-09 후보 7 · 탐색 · 관심 · 검증도(뒤로 오면 선택 · 스크롤 · 초점 — 재설계 명령 8)
/** 보던 화면에서 마지막으로 누른 링크(주소) — 그 화면으로 돌아오면 자리와 함께 초점도 그 링크로(2026-10-09 「ATLAS 업데이트 실행 프롬프트 — 통합본」 0-D 「뒤로 가면 이전 선택·스크롤·초점이 돌아온다」)
 *  고른 상태(평균 펼치기의 「제외」 · 「모두 보기」)는 decomp.js 가 같은 주소에서 되살림(state.restoring) */
const focusMemo = new Map();
const memoKey = (id, hash) => (id === 'industry' ? hash : id);
/** 선 그리기 움직임을 이미 보인 화면 */
const drawn = new Set();
const FONT_STEPS = [100, 125, 150, 175, 200];

function applyFont() { const step = Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0))); document.documentElement.style.fontSize = FONT_STEPS[step] + '%'; document.documentElement.dataset.fontStep = String(step); }
/** 소리 단추 그림 — 선으로 그린 확성기(글자색을 따른다) */
function speakerIcon() {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, String(v));
  for (const d of ['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13']) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
  return svg;
}
/** 말 단추 그림 — 선으로 그린 지구(글자색을 따른다 · 어느 나라 사람이든 「말 고르기」로 읽는 그림) */
function globeIcon() {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, v);
  const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx', 12); circle.setAttribute('cy', 12); circle.setAttribute('r', 9); svg.append(circle);
  for (const d of ['M3 12h18', 'M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9', 'M12 3c-2.5 2.7-3.8 5.7-3.8 9s1.3 6.3 3.8 9']) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
  return svg;
}
/** 말 고르기(2026-10-06 22:00 사장님 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」) — 같은 주소 · 같은 화면을 그 말로 다시 연다(?lang= · 이 기기에 기억 · i18n.js)
 *   말 이름은 그 말 글자로(한국어 · English · 中文) — 어느 말로 보고 있든 자기 말을 찾게 · 지금 말은 눌린 채로 */
/*   2026-10-07 05:13 「언어팩을 주식시장이 있는 전세게 나라가 있잖아 다 만들어」 — 말 74개(i18n.js LANG_LIST): 위 세 말(한국어 · English · 简体中文)은 그대로 맨 위,
 *   나머지는 지금 보고 있는 말의 이름 차례(가나다 · ABC …) · 줄마다 그 말 글자 이름 + 지금 말로 쓴 이름(Intl.DisplayNames · 한국어로 보면 「독일어」) · 맨 위 찾기 칸(이름 · 코드로 거름) */
const langHref = code => location.pathname + '?lang=' + code + location.hash;
const PINNED = ['ko', 'en', 'zh'];
function langItems() {
  let dn = null, col = null; try { dn = new Intl.DisplayNames([LANG_INFO.tag], {type: 'language'}); col = new Intl.Collator(LANG_INFO.tag); } catch {}
  const local = x => { try { const v = dn?.of(x.tag); return v && v.toLowerCase() !== x.tag.toLowerCase() && v !== x.name ? v : ''; } catch { return ''; } };
  const rows = LANG_LIST.map(x => ({...x, local: local(x)}));
  const head = PINNED.map(c => rows.find(x => x.code === c)), rest = rows.filter(x => !PINNED.includes(x.code));
  rest.sort((a, b) => (col ? col.compare(a.local || a.name, b.local || b.name) : (a.local || a.name).localeCompare(b.local || b.name)));
  return [...head, ...rest];
}
function langPicker() {
  const items = langItems();
  const list = h('div', {class: 'lang-list'}, ...items.map(x => h('a', {class: 'lang-i', href: langHref(x.code), lang: x.tag, hreflang: x.tag, dir: x.rtl ? 'rtl' : 'ltr', 'data-code': x.code, 'data-find': `${x.code} ${x.tag} ${x.name} ${x.local}`.toLowerCase(), 'aria-current': x.code === LANG ? 'true' : null,
    onclick: e => { e.currentTarget.setAttribute('href', langHref(x.code)); }}, h('span', {class: 'lang-n'}, x.name), x.local ? h('small', {class: 'lang-s', 'data-ident': ''}, x.local) : null)));
  const find = h('input', {class: 'lang-find', type: 'search', inputmode: 'search', autocomplete: 'off', spellcheck: 'false', placeholder: 'Language · 언어 · 语言', 'aria-label': 'Language · 언어 · 语言', 'data-orig-attr': 'aria-label placeholder',
    oninput: () => { const q = find.value.trim().toLowerCase(); for (const a of list.children) a.hidden = !!q && !a.dataset.find.includes(q); }});
  const box = h('details', {class: 'lang'},
    h('summary', {class: 'round lang-b', 'aria-label': 'Language · 语言 · 언어', title: 'Language · 语言 · 언어', 'data-orig-attr': 'aria-label title'}, globeIcon()),
    h('div', {class: 'lang-menu'}, find, list));
  box.addEventListener('toggle', () => { if (box.open) { list.querySelector('[aria-current="true"]')?.scrollIntoView({block: 'nearest'}); } else { find.value = ''; for (const a of list.children) a.hidden = false; } });
  document.addEventListener('click', e => { if (box.open && !box.contains(e.target)) box.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.open) { box.open = false; box.querySelector('summary')?.focus(); } });
  return box;
}
const voice = {on: false};
/** 맨 위: 둥근 단추 셋 — 말(지구 · 2026-10-06 22:00) · 「가」(글씨 100→125→150→175→200→100%) · 소리 */
function header() {
  const speakBtn = h('button', {class: 'round speak', id: 'voice-btn', type: 'button', 'aria-label': '소리로 듣기', 'aria-pressed': 'false', onclick: () => {
    voice.on = !voice.on; speakBtn.classList.toggle('on', voice.on); speakBtn.setAttribute('aria-pressed', String(voice.on));
    if (voice.on) speakScreen(state.summary || '읽을 내용이 없습니다'); else stopSpeak();
  }}, speakerIcon());
  // 시장 고르기 「한국 · 미국」(2026-10-05 18:02 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」) — 사이트에 판이 둘 있을 때만(places.json · package.mjs 가 씀)
  //   한국 판은 / · 미국 판은 /us/ — 같은 화면 코드, 판만 다름 · 지금 판은 눌린 채로(aria-current)
  //   보던 탭 · 하위 화면은 그대로 들고 간다(「ATLAS 개편 실행 지시서」 11 — 탭을 옮겨도 맥락 유지) — 회사 · 업종 화면은 판마다 달라 그 탭 첫 화면으로
  const tabHash = () => { const x = location.hash; if (/^#\/(market|hot|map|flow|flow\/rotation|sectors|stocks|road|similar|rise|agenda|check|log|watch|start|guide|long|korea|learn)?$/.test(x)) return x; if (/^#\/compare/.test(x)) return '#/compare'; const r = routes.find(y => y.match.test(x)); return r && r.tab === 'from' ? TAB_HREF[app.tab] ?? '' : ''; }; // 비교는 판마다 후보가 달라 짝 없이
  const mktLinks = () => app.places.map(p => { const href = p.href + (I18N ? '?lang=' + LANG : ''); return h('a', {class: 'mkt-b', href, 'data-place': p.id, 'aria-current': p.id === place.id ? 'page' : null, // 고른 말 그대로(기기에 못 적는 창에서도)
    onclick: e => { if (p.id !== place.id) e.currentTarget.setAttribute('href', href + tabHash()); }}, p.label); });
  let mkt = null;
  if (app.places.length === 2) mkt = h('nav', {class: 'mkt', 'aria-label': '시장 고르기'}, ...mktLinks());
  else if (app.places.length > 2) {
    const here = app.places.find(p => p.id === place.id) ?? {label: place.label};
    mkt = h('details', {class: 'mkt mkt-pick'}, h('summary', {class: 'mkt-cur', 'aria-label': '시장 고르기', 'data-place': place.id}, here.label), h('nav', {class: 'mkt-menu', 'aria-label': '시장 고르기'}, ...mktLinks()));
    document.addEventListener('click', e => { if (mkt.open && !mkt.contains(e.target)) mkt.open = false; });
  }
  // 위 막대(「ATLAS 개편 실행 지시서」 3 — ATLAS 홈 · 한국/미국 · 찾기 · 안내): 둥근 단추 셋 — 찾기(#/stocks · 글 칸에 바로) · 안내 ⓘ(#/start) · 보기 — 관심 ★ 은 2026-10-09 아래 탭 「관심」으로(재설계 명령 9)
  //   · 보기(점 셋) = 말 고르기(74개) · 글씨 크기 · 소리로 듣기를 한 묶음으로(좁은 화면에서 보조 기능을 묶음 · PC 도 같은 구조)
  const iconLink = (href, key, label, view) => h('a', {class: 'round tb-b', href, 'aria-label': label, title: label, 'data-view': view, html: ICON[key], onclick: () => { if (view === 'stocks') state.focusSearch = true; }});
  const fontBtn = h('button', {class: 'round font', id: 'font-btn', type: 'button', 'aria-label': '글씨 크기', onclick: () => { prefs.set('font', (prefs.get('font', 0) + 1) % FONT_STEPS.length); applyFont(); fontLabel(); route(); fitTabs(); }}, '가');
  const more = h('details', {class: 'tb-more'}, h('summary', {class: 'round tb-b', 'aria-label': '말 · 글씨 · 소리', title: '말 · 글씨 · 소리', html: ICON.more}),
    h('div', {class: 'tb-menu'}, langPicker(), fontBtn, speakBtn, levelButton())); // 쉬운 말 ↔ 전문가 말(한국어 화면에서만 · 규칙 48)
  document.addEventListener('click', e => { if (more.open && !more.contains(e.target)) more.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && more.open && !more.querySelector('.lang[open]')) { more.open = false; more.querySelector('summary')?.focus(); } });
  document.getElementById('top').replaceChildren(h('div', {class: 'top-inner' + (mkt ? ' has-mkt' : '')},
    h('a', {class: 'wordmark', href: '#/', 'aria-label': 'ATLAS 처음 화면'}, h('span', {class: 'wm-t'}, 'ATLAS')),
    mkt,
    iconLink('#/stocks', 'search', '종목 찾기', 'stocks'), iconLink('#/start', 'info', '안내', 'guide'),
    more));
  fontLabel();
  // 탭 이름에는 숫자를 넣지 않는다(2026-10-05 「잡스라면」 28번) — 개수는 화면 안에
  const label = r => r.label;
  // 지금 보고 있는 탭을 다시 누르면 맨 위로(주소가 그대로라 화면은 다시 그리지 않음)
  // 다른 탭에서 「출목표」를 누르면 늘 「오른 순」 첫 탭(1위~20위) 맨 위로(2026-10-05 11:36 「출목표 탭을 클릭하면 가장 상승한순으로」 · 12:28 「그 안에 탭을 더」)
  //   회사 화면에서 되돌아올 때는 보던 묶는 법 · 탭 · 자리 그대로
  const toTop = (e, r) => { if (r.id === 'road' && app.view !== 'road') { resetRoad(); scrollMemo.delete('road'); }
    if (app.view === r.id) { e.preventDefault(); scrollMemo.delete(r.id); window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); } };
  const tab = r => h('a', {href: TAB_HREF[r.id] ?? '#/' + r.id, class: 'bottom-link', dataset: {route: r.id}, onclick: e => toTop(e, r)}, h('span', {class: 'icon', 'aria-hidden': 'true', html: ICON[r.id === 'market' ? 'explore' : r.id]}), h('span', {class: 'label'}, label(r)));
  document.getElementById('bottom').replaceChildren(...TABS.map(id => tab(routes.find(r => r.id === id))));
  fitTabs();
}
/** 아래 탭 이름 맞추기(2026-10-07 말 74개 — 독일어 「Termine」「Chronik」 처럼 긴 이름이 일곱 칸 중 제 칸을 넘지 않게 · 2026-10-08 17:41 여덟 칸 — 칸 안 여백 6 → 2px)
 *  가장 넘치는 이름에 맞춰 여덟 이름을 같은 비율로 줄인다(--tab-k · 원래 크기의 72% 아래로는 안 줄임 · 2026-10-08 탭 여덟 — 옛 일곱 · 55%) · 말을 바꾼 뒤 · 글씨 단추 · 화면 폭이 바뀔 때 다시 잼 */
function fitTabs() {
  const bar = document.getElementById('bottom'); if (!bar) return;
  bar.style.removeProperty('--tab-k');
  requestAnimationFrame(() => {
    let k = 1;
    for (const a of bar.querySelectorAll('.bottom-link')) { const l = a.querySelector('.label'); if (!l) continue; const room = a.clientWidth - 2, need = Math.max(l.scrollWidth, l.getBoundingClientRect().width); if (need > room && need > 0) k = Math.min(k, room / need); } // 이름 전체 폭(scrollWidth) — 칸에 잘린 폭(…)으로 재면 덜 줄어 「돈 흐…」처럼 잘렸음(2026-10-08 탭 여덟)
    if (k < 1) bar.style.setProperty('--tab-k', Math.max(0.72, k - 0.01).toFixed(3)); // 여덟 칸(2026-10-08) — 다 같이 72% 아래로는 안 줄임(글씨 11px 아래로 가지 않게) · 그래도 넘치는 긴 이름만 끝을 「…」로(style.css)
    // 위 막대: 넘치면 시장 단추(한국 · 미국)만 줄임 — 둥근 단추(말 · 글씨 · 소리)는 44px 그대로
    const top = document.querySelector('.top-inner'), mkt = top?.querySelector('.mkt');
    if (top && mkt) { mkt.style.removeProperty('--mkt-k'); const over = top.scrollWidth - top.clientWidth, w = mkt.getBoundingClientRect().width;
      if (over > 0 && w > 0) mkt.style.setProperty('--mkt-k', Math.max(0.45, (w - over - 2) / w).toFixed(3)); }
  });
}
window.addEventListener('resize', () => fitTabs());
function fontLabel() { const b = document.getElementById('font-btn'); if (b) b.setAttribute('aria-label', `글씨 크기 ${FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, prefs.get('font', 0)))]}% (누를 때마다 커지고 200% 다음은 100%)`); }
function markActive(id) { for (const el of document.querySelectorAll('[data-route]')) { const on = el.dataset.route === id; el.classList.toggle('active', on); if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); }
  for (const el of document.querySelectorAll('.tb-b[data-view]')) { if (el.dataset.view === id) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); } } // 위 막대 관심 ★ · 안내 ⓘ(아래 탭이 아닌 화면)

/** 하규 응원 · 건의 받는 곳 — 모든 화면 맨 위(위 막대 바로 아래 · 사장님 2026-10-08 14:42(마카오 시각) 「하규야 힘내라하고 연락처가 아래 있다 위로 올려」)
 *  맨 아래 줄(parts.js foot)에서 옮김(규칙 1 — 두 번 나오지 않게) · 번호는 식별자 · 누르면 문자 앱(나라 밖에서도 되게 +82) · 응원 글은 17:44 「하규 화이팅! 비서실장 화이팅」(말 73개 사전에 새로 넣음)
 *  자료 목록을 읽기 전에 그림(자료를 못 읽은 오류 화면에도 맨 위에) */
function topNote() {
  document.getElementById('topnote')?.replaceChildren(h('p', {class: 'tn-cheer'}, '하규 화이팅! 비서실장 화이팅'), // 2026-10-08 17:44(마카오 시각) 「하규 화이팅! 비서실장 화이팅 이렇게 수정 하자」 — 옛 「하규야, 힘내라 — 늘 응원한다」
    h('p', {class: 'tn-contact b-contact'}, '건의는 카톡이나 문자로', ' ', h('a', {href: 'sms:+821090117377', 'data-ident': ''}, '010-9011-7377')));
}
/** 첫 화면 맞추기(규칙 30 · 2026-10-08 14:42 맨 위 줄이 생겨 첫 화면이 그만큼 내려감) — 그림 아래 이름 · 숫자(.ra-lab)의 아래 끝이 아래 탭 위에 오도록
 *  넘치는 만큼만 그림(.ra-art)을 작게(가운데 · 원래 폭의 60% 아래로는 줄이지 않음) · 넘치지 않으면 그대로 · 화면을 그린 뒤 · 화면 크기가 바뀔 때 · 글꼴을 다 읽은 뒤 다시 잼 */
function fitFirst() {
  if (!document.querySelector('#main .ra-art svg.ra-svg')) return; // 2026-10-09 자료 차트(HTML 막대 · 글자)는 폭을 줄이면 줄이 늘어 더 길어짐 — 옛 그림(SVG)만 줄임
  if (document.querySelector('#main [data-first]')) return; // 판단 정보가 먼저인 화면(시장 · 투자자 매매 · 종목 · 검증 · 관심종목 — 「ATLAS 개편 실행 지시서」 4)은 그림이 정보 아래라 줄이지 않음
  const ra = document.querySelector('#main .ra'), art = ra?.querySelector('.ra-art'); if (!art) return;
  art.style.removeProperty('width'); art.style.removeProperty('margin-inline');
  const labs = [...ra.querySelectorAll('.ra-lab')], bar = document.getElementById('bottom'); if (!labs.length || !bar) return;
  const over = Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) + window.scrollY - bar.getBoundingClientRect().top; // 쪽 맨 위에서 본 자리(내려 본 자리와 상관없이)
  const r = art.getBoundingClientRect(); if (over <= 0 || !r.width || !r.height) return;
  art.style.width = `${Math.floor(r.width * Math.max(0.6, 1 - (over + 3) / r.height))}px`; art.style.marginInline = 'auto';
}
window.addEventListener('resize', () => fitFirst());
document.fonts?.addEventListener?.('loadingdone', () => fitFirst()); // 글꼴을 늦게 다 읽으면 글 높이가 바뀜
async function route() {
  let hash = location.hash;
  if (hash === '#main') { document.getElementById('main')?.focus(); return; } // 「본문으로 건너뛰기」는 화면을 바꾸지 않는다
  // 「태양 모아 보기 ›」(#/road/sun · 2026-10-05 15:24 「잡스가 … 36가지」 B5 · E) — 어느 화면에서든 출목표 묶는 법 「태양」 맨 위로 · 주소 줄은 #/road 로
  //   #/road/at/CODE = 회사 화면 「오른 순 n위 · 출목표 자리 ›」 · #/road/g/GROUP = 업종 화면 「출목표에서 … 보기 ›」(그 칸 · 그 업종 묶음으로)
  const at = hash.match(/^#\/road\/at\/([A-Za-z0-9][A-Za-z0-9.\-]{0,11})$/)?.[1], grp = hash.match(/^#\/road\/g\/([a-z0-9]+)$/)?.[1], toSun = hash === '#/road/sun' || !!at || !!grp;
  if (toSun) { if (at) openAt(at); else if (grp) openGroup(grp); else openSun(); hash = '#/road'; history.replaceState(null, '', location.pathname + location.search + '#/road'); }
  // 옛 아래 탭 「찾기」(#/find · 2026-10-05 20:24)는 아래 탭 「종목」의 찾기 칸으로(「ATLAS 개편 실행 지시서」 7 — 찾기 · 목록 통합) · 주소 줄도 #/stocks
  if (hash === '#/find') { hash = '#/stocks'; state.focusSearch = true; history.replaceState(null, '', location.pathname + location.search + '#/stocks'); }
  let r = routes.find(x => x.match.test(hash));
  // 지운 화면의 옛 주소 → 처음 화면(주소 줄도 「#/」로 바꿔 둔다)
  if (!r) { r = routes[0]; hash = '#/'; history.replaceState(null, '', location.pathname + location.search + '#/'); }
  stopSpeak(); voice.on = false; document.getElementById('voice-btn')?.classList.remove('on'); document.getElementById('voice-btn')?.setAttribute('aria-pressed', 'false');
  if (app.view && KEEP_SCROLL.has(app.view)) scrollMemo.set(app.memo ?? app.view, window.scrollY);
  if (toSun) scrollMemo.delete('road'); // 태양 보기는 늘 맨 위부터
  if (app.view !== r.id) { state.from = app.view; state.fromHash = app.hash ?? null; } // 회사 화면 「‹ 되돌아가기」가 온 곳을 알도록(글씨 단추로 같은 화면을 다시 그릴 때는 그대로) · 비교 화면은 주소(짝)까지
  if (r.id !== 'industry' && r.id !== 'stock') state.origin = r.id; // 업종 화면 「‹ 되돌아가기」 = 업종 · 회사 화면을 거쳐 오기 전 마지막 탭 화면(출목표 → 회사 → 업종이면 출목표)
  // 업종·회사 화면은 들어온 탭이 눌린 채로(탭 막대에 없는 화면) · 탭 화면이면 그 탭을 기억
  if (r.tab !== 'from') app.tab = r.tab;
  state.tab = app.tab; // 업종 화면 「‹ 되돌아가기」가 들어온 탭(불장 · 업종)을 알도록
  markActive(app.tab); app.view = r.id; app.hash = hash; app.memo = memoKey(r.id, hash); state.summary = '';
  document.documentElement.toggleAttribute('data-drawn', drawn.has(r.id)); drawn.add(r.id); // 이 화면을 이미 한 번 그렸으면 선 그리기 움직임 없이
  const main = document.getElementById('main');
  main.dataset.view = r.id; document.body.dataset.view = r.id;
  // 보던 자리로 돌아갈 화면이면 다 그린 뒤 그 자리로 · 아니면 그리기 전에 맨 위로(조금씩 그리는 동안 사람이 내려 본 자리를 끝에 되돌리지 않게)
  const restoring = KEEP_SCROLL.has(r.id) && scrollMemo.has(app.memo);
  if (!restoring) window.scrollTo({top: 0});
  const focus = !!state.focusSearch && r.id === 'stocks'; state.focusSearch = false;
  state.restoring = restoring; // 돌아온 화면이면 그 화면 부품이 고른 상태를 되살림(decomp.js)
  // 화면 넘김 움직임(2026-10-09 「ATLAS 제품 재설계 명령」 10 「후보를 누른다 → 같은 종목의 선정 근거로 자연스럽게 이어진다」):
  //   후보 목록에서 누른 이름(state.vt)이 종목 화면 「후보 판단」 머리로 옮겨 감 — 사람이 누른 때만 · 움직임 줄이기면 없음 · 못 하는 브라우저는 그냥 바뀜(같은 정보)
  const vt = state.vt; state.vt = null;
  const draw = async () => { try { await r.render(main, {hash, manifest: app.manifest, restoring, focus}); } catch (e) { main.replaceChildren(...failure('화면을 그리지 못했습니다', e)); }
    if (EX_ROOT.has(r.id)) main.querySelector('.b-page')?.prepend(exploreNav(r.id));
    if (EASY) { const w = whatLine(r.id, place.id), pg = main.querySelector('.b-page') ?? main, top = pg.querySelector(':scope > .ex-nav, :scope > .hl-bar'); if (w) { if (top) top.after(w); else pg.prepend(w); } }
    if (EASY && r.id === 'start') { const g = glossaryBox(), pg = main.querySelector('.b-page') ?? main, ft = pg.querySelector(':scope > .b-foot'); if (g) { if (ft) ft.before(g); else pg.append(g); } } // 「처음」 맨 아래 어려운 말 풀이(뉴스 말 → 쉬운 말 · 규칙 48) // 쉬운 말 화면 맨 위 「이 화면은?」 한 줄(탐색 네 곳은 위 줄 바로 아래 · 첫 화면은 「친구에게 소개하기」 띠 바로 아래 — 규칙 45 그대로 · 규칙 48)
    }; // 옛 지도 섬(그림 칸 맨 아래 입체 섬)은 지움 — 사장님 2026-10-10 09:51 · 09:53 「3d 영구 삭제해」 · 「모두다」 // 탐색 맨 위 줄(시장 · 업종 · 종목 · 일정) — 네 곳의 첫 화면에만(Apple 처럼 — 들어간 보기 · 땅 화면은 「보기 바꾸기」 · 「‹ 되돌아가기」 한 줄만 · 그림 이름 · 숫자가 한 화면에)
  if (vt?.el?.isConnected && typeof document.startViewTransition === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    vt.el.style.setProperty('view-transition-name', vt.name);
    try { const t = document.startViewTransition(() => draw()); await t.updateCallbackDone; t.finished.finally(() => { for (const el of document.querySelectorAll('[data-vt]')) { el.style.removeProperty('view-transition-name'); el.removeAttribute('data-vt'); } }).catch(() => {}); }
    catch { await draw(); }
  } else await draw();
  fitFirst(); setTimeout(fitFirst, 0); // 그린 뒤 한 번 · 번역(말 사전)이 글을 바꾼 뒤 한 번 더
  setTimeout(() => { if (app.view === r.id) document.documentElement.setAttribute('data-drawn', ''); }, 450); // 다 그린 뒤에는 같은 화면 안에서 다시 그려도(묶음 바꾸기) 움직이지 않음
  if (restoring && app.view === r.id) { window.scrollTo({top: scrollMemo.get(app.memo) ?? 0});
    const want = focusMemo.get(app.memo), el = want && !focus && (!document.activeElement || document.activeElement === document.body) ? [...main.querySelectorAll('a[href]')].find(x => x.getAttribute('href') === want) : null;
    if (el) el.focus({preventScroll: true}); } // 누르고 나갔던 링크에 초점(화면 읽기 · 자판으로 이어 감 · 화면은 움직이지 않음) — 찾기 칸에 커서를 둔 화면(돋보기) · 그린 화면이 초점을 정한 때는 건드리지 않음
  state.restoring = false;
}
/** 오류 화면 — 맨 위 그림 한 장(빈 하늘 · 제목은 그림 이름 · 규칙 1 넣으면서 뺀 것: 상자 제목) · 아래 까닭 한 줄 · 다시 불러오기 / 그림을 못 그려도 알림은 그대로 */
function failure(title, e) {
  let art = null; try { art = quietArt({key: 'fail', label: title}); } catch {}
  const last = prefs.get('lastOk', null); // 이 기기에서 마지막으로 제대로 읽은 자료(통합본 0-I 「조회 실패는 마지막 정상 자료의 시점을 표시한다」)
  const why = String(e?.message ?? e); // 까닭(기술 글 · 파일 이름 · HTTP 번호) — 한국어로 된 까닭은 그대로 둠(lang="ko" · 제목과 단추는 그 말로)
  return [art, h('section', {class: 'b-box failure', role: 'alert'}, art ? null : h('h1', {class: 'b-box-h'}, title), last?.asOf ? h('p', {class: 'b-note'}, `이 기기에서 마지막으로 읽은 자료: ${korDate(last.asOf)} 종가`) : null, h('button', {class: 'b-btn', type: 'button', onclick: () => location.reload()}, '다시 불러오기'),
    h('details', {class: 'b-tech'}, h('summary', null, '기술 정보'), h('p', {class: 'muted', lang: /[가-힣]/.test(why) ? 'ko' : null}, why)))].filter(Boolean); // 까닭은 접어 둠(글을 줄임 · 규칙 13)
}

/* 새 판 감시: 화면을 바꾸지 않고 알림만(다시 열면 새 판) */
async function watchManifest() {
  try {
    const r = await fetch(url('data/atlas11/view/manifest.json'), {cache: 'no-cache'}); if (!r.ok) return;
    const m = await r.json();
    if (m.boardId && app.manifest && m.boardId !== app.manifest.boardId && !document.getElementById('new-board')) {
      document.getElementById('main').prepend(h('div', {id: 'new-board', class: 'b-note', role: 'status'}, `새 자료가 올라왔습니다(${m.asOf ? korDate(m.asOf) + ' 종가' : '날짜 없음'}) · 지금 화면은 그대로 · `, h('button', {class: 'b-link', type: 'button', onclick: () => location.reload()}, '새 자료로 다시 열기'))); // 읽던 화면 · 다시 보기를 바꾸지 않음 — 적용은 사람이 고름(통합본 0-I)
    }
  } catch {}
}

async function start() {
  if (I18N) await startI18n(); // 언어판: 사전을 읽고 이후 그려지는 글자를 모두 그 말로
  else if (EASY) startEasy(); // 쉬운 말(한국어 화면 기본 · 규칙 48): 이후 그려지는 글자를 쉬운 말 사전으로
  applyFont(); topNote();
  const main = document.getElementById('main');
  main.replaceChildren(h('section', {class: 'b-box loading', role: 'status', 'aria-live': 'polite'}, h('span', {class: 'wordmark'}, 'ATLAS'), h('p', null, '자료를 불러오는 중입니다'),
    h('div', {class: 'sk', 'aria-hidden': 'true'}, h('span', {class: 'sk-t'}), h('span', {class: 'sk-l'}), h('span', {class: 'sk-g'}))));
  try { app.manifest = await loadManifest(); }
  catch (e) { main.replaceChildren(...failure('자료 목록을 읽지 못했습니다', e)); return; }
  if (app.manifest.asOf) prefs.set('lastOk', {asOf: app.manifest.asOf, boardId: app.manifest.boardId}); // 다음에 못 읽으면 이 날짜를 알림
  setPlace(app.manifest.place); // 미국 판이면 달러 · 뉴욕 16:00 종가 · 수급 없음(util.js place) — 한국 판 manifest 에는 place 가 없어 한국 값 그대로
  try { const r = await fetch('/places.json', {cache: 'no-cache'}); if (r.ok) { const p = await r.json(); if (Array.isArray(p?.places)) app.places = p.places.filter(x => x && x.id && x.href && x.label); } } catch {}
  state.places = app.places; // 「찾기」가 다른 시장 판도 함께 찾도록
  if (I18N) { // 회사 이름: 한국 판 = 영어 이름 사전(/data/atlas11/names-kr.json · 없으면 로마자) · 미국 판 = 판의 nameEn — 두 판 모두(찾기 · 기록 이슈 줄에 섞여 나옴) · 첫 화면 전에
    const nk = await fetch('/data/atlas11/names-kr.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null);
    try { addBoardNames(await loadBoard(), nk?.names); } catch {}
    // 다른 판(미국 · 중국 · 일본 · 베트남 — 2026-10-07 05:25 「미국 장 처럼」)은 함께 받아(하나씩 기다리지 않음) 이름만 더함 · 못 읽은 판은 건너뜀
    const others = await Promise.allSettled(app.places.filter(p => p.id !== place.id).map(p => loadPlaceBoard(p.href)));
    for (const r of others) if (r.status === 'fulfilled') { try { addBoardNames(r.value.board, nk?.names); } catch {} }
  }
  if (EASY) { try { const bd = await loadBoard(); addEasyNames([...bd.companies.map(c => c.name), ...(bd.groups ?? []).flatMap(g => [g.label, familyOf(g.label)?.label])]); } catch {} } // 회사 · 업종 · 갈래 이름은 쉬운 말로 바꾸지 않음
  header();
  // 출목표 보기(종목 안 · #/road)를 다른 화면에서 열면 늘 「오른 순」 첫 탭 맨 위(옛 아래 탭 「출목표」 약속 그대로 — 2026-10-05 11:36 「출목표 탭을 클릭하면 가장 상승한순으로」) · 회사 화면에서 되돌아올 때는 보던 자리
  document.addEventListener('click', e => { const a = e.target.closest?.('a.hs-b[data-seg="road"]'); if (a && app.view !== 'road') { resetRoad(); scrollMemo.delete('road'); } });
  window.addEventListener('hashchange', route);
  document.addEventListener('click', e => { const a = e.target.closest?.('#main a[href^="#/"]'); if (a && app.view && KEEP_SCROLL.has(app.view)) focusMemo.set(app.memo ?? app.view, a.getAttribute('href')); }, true); // 돌아올 때 초점 자리(위 focusMemo)
  setInterval(watchManifest, 5 * 60 * 1000);
  await route();
  // 검사기 손잡이(2026-10-08 06:42 「10배 빠르면서도 10배 정교한 시스템」) — 빠짐없이 도는 검사기가 기다리지 않고 다 그린 순간 잼:
  // atlasRoute(주소) = 주소를 바꾸고 그 화면을 다 그릴 때까지 기다림 · atlasFont(단) = 글씨 크기 · data-ready = 첫 화면까지 다 그림(사람이 쓰는 길은 그대로)
  window.atlasRoute = async hh => { history.replaceState(null, '', location.pathname + location.search + hh); await route(); };
  window.atlasFont = n => { prefs.set('font', n); applyFont(); fontLabel(); fitTabs(); };
  document.documentElement.dataset.ready = '1';
}
start();
