import {getStore} from '@netlify/blobs';
import {handleKakao} from '../../lib/atlas11/kakao.mjs';
import {KAKAO_STORE} from '../../lib/atlas11/kakao-store.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';
import {detachKakao, LETTER_STORE} from '../../lib/atlas11/letter.mjs';

export const config = {path: '/api/kakao/*'};

// 고도리 카톡 가입(사장님 2026-10-18 00:15 order-0015 [3] 2 「새 함수 하나, 새 저장소 하나」) — 셈은 lib/atlas11/kakao.mjs 한 곳
// 스위치 = config/atlas11/kakao.json "on" 하나: false 면 올리기(scripts/atlas11/deploy_netlify.mjs SWITCHED_FUNCTIONS)가 이 함수를 아예 올리지 않음 → /api/kakao/* 는 넷리파이 404
// 올라간 뒤에도 넷리파이 환경 값 넷(ATLAS_KAKAO_REST_KEY · ATLAS_KAKAO_CLIENT_SECRET · ATLAS_KAKAO_ADMIN_KEY · ATLAS_KAKAO_HASH_SECRET) 중 하나라도 없으면 모든 길 404
// 저장소는 쓸 때만 엶 · 사장님 열쇠 해시는 편지 여는 밤과 같은 값(ATLAS_INVITE_OWNER_SHA256 은 시험 서버만)
// 탈퇴 · 카카오 연결 끊김 때 편지 여는 밤 회원 기록에 붙인 카카오 회원 표([4] 8)도 뗌(onGone → lib/atlas11/letter.mjs detachKakao · VK F2)
export default async function kakao(req) {
  return handleKakao(req, process.env, {config: {on: true}, store: () => getStore({name: KAKAO_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256,
    onGone: mh => detachKakao(getStore({name: LETTER_STORE, consistency: 'strong'}), mh)});
}
