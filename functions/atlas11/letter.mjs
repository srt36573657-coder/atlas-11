import {getStore} from '@netlify/blobs';
import {handleLetter, LETTER_STORE} from '../../lib/atlas11/letter.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: '/api/letter'};

// 편지 여는 밤(사장님 2026-10-17 01:29 「그래 이제 만들어봐」) — 셈은 lib/atlas11/letter.mjs 한 곳
// 시험 서버(invite_dev.mjs)에서만: ATLAS_LETTER_DEV=1 이면 ATLAS_LETTER_SKEW_MS 만큼 시계를 옮겨 여는 밤을 미리 시험 — 넷리파이에는 두지 않음
// 카카오 회원이 초대장으로 들어오면 그 회원에 붙임(사장님 2026-10-18 order-0015 [4] 8): 카카오 모듈은 들어오기 때만 불러옴 — 못 부르거나 · 열쇠 넷이 없거나 · 회원이 아니면 null = 오늘과 같은 길(편지 쪽은 카카오 때문에 깨지지 않음)
//   스위치는 카카오 함수와 같은 값을 따름: 환경 값 넷이 다 있고 로그인 쿠키가 살아 있는 회원일 때만(카카오 함수가 안 올라가 있으면 로그인 쿠키가 생길 수 없음)
const kakaoOf = async req => {
  const [{kakaoMemberOf}, {KAKAO_STORE}] = await Promise.all([import('../../lib/atlas11/kakao.mjs'), import('../../lib/atlas11/kakao-store.mjs')]);
  return kakaoMemberOf(req, process.env, {config: {on: true}, store: () => getStore({name: KAKAO_STORE, consistency: 'strong'})});
};
export default async function letter(req) {
  const skew = process.env.ATLAS_LETTER_DEV === '1' ? Number(process.env.ATLAS_LETTER_SKEW_MS || 0) : 0;
  return handleLetter(req, {store: getStore({name: LETTER_STORE, consistency: 'strong'}), now: () => new Date(Date.now() + skew),
    ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256, kakaoOf});
}
