import {handlePrice} from '../../lib/atlas11/price.mjs';

export const config = {path: '/api/price'};

// 수르 현재가(주문 2011 · 사장님 2026-11-08 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 첫 페이지 현재가가 바뀌게) — 셈은 lib/atlas11/price.mjs 한 곳
// 열쇠 · 저장소 없음 · 네이버 증권 분봉을 받아 그대로 돌려줌(지어낸 숫자 0) · 넷리파이가 30초(장 중) · 5분(그 밖) 함께 씀
export default async function price(req) {
  return handlePrice(req);
}
