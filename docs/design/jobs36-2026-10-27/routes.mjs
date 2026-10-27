import fs from 'node:fs';
const D = '/home/claude/atlas-11/site/next/data/';
const TH = JSON.parse(fs.readFileSync(D + 'theme.json', 'utf8')), TM = JSON.parse(fs.readFileSync(D + 'theme-more.json', 'utf8'));
const TOP = TH.order.S[0] ?? TH.order.B[0] ?? TH.inds[0].n, LEAD = TM.inds[TOP]?.top?.[0];
const ib = '#/t/i/' + encodeURIComponent(TOP), cb = LEAD ? '#/t/c/' + LEAD.c : null;
export const ROUTES = [
  ['#/', '첫 화면'], ['#/t/picks', '꽃 될 회사'], ['#/t/pick', '지난 기록'], ['#/why', '왜 사?'], ['#/dori', '돌이'], ['#/why/later', '한 달 뒤'],
  ['#/t/sprout', '싹 자리'], ['#/t/bloom', '꽃 자리'], ['#/t/wilt', '시듦 자리'], ['#/t/cal', '싹 달력'],
  [ib, '업종 한 곳'], [ib + '/path', '지나온 길'], [ib + '/spread', '번지는 중일까'], [ib + '/big', '큰 회사도 움직였을까'], [ib + '/co', '함께 움직인 회사'], [ib + '/near', '이웃 업종'],
  [cb, '회사 한 곳'], [cb + '/lead', '먼저일까 뒤따름일까'], [cb + '/why', '왜 그럴까?'], [cb + '/rank', '업종 안 자리'], [cb + '/unknown', '아직 모르는 것'], [cb + '/keep', '관심 담기'],
  ['#/w/' + LEAD.c + '/past', '회사 지나온 길'], ['#/find', '회사 찾기'], ['#/me', '보유종목'], ['#/sub', '관심'], ['#/t/alert', '알림'], ['#/today', '오늘 장'],
  ['#/game', '가짜 돈 연습'], ['#/jinhwa', '진화'], ['#/t/today', '오늘 정리'], ['#/t/hello', '돌이 인사'], ['#/t/how', '시계 읽는 법'], ['#/gift', '상품권'], ['#/help', '고객센터'], ['#/shorts', '짧은 영상']];
export const META = {TOP, LEAD};
