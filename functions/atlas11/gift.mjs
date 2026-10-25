import {getStore} from '@netlify/blobs';
import {handleGift, GIFT_STORE} from '../../lib/atlas11/gift.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: ['/api/gift', '/api/gift/*']};

// 친구 셋 선물(사장님 2026-10-25 13:40 「… 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔 … 곳곳에 선물 받기를 다 집어넣어 놔」 · 13:38 「내가 직접 보낼 거야」) — 셈은 lib/atlas11/gift.mjs 한 곳
// 연 기록 · 내 수 · 신청 = 그 기기 선물 열쇠(x-gift-key · 서버에는 해시만) · 신청 목록 · 보냄 표시 = 사장님 열쇠(편지 · 진화 · 고객센터와 같은 해시) · 깃허브 열쇠 없음
export default async function gift(req) {
  return handleGift(req, {store: getStore({name: GIFT_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
