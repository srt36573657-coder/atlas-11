import {getStore} from '@netlify/blobs';
import {handleInvite, INVITE_STORE, OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: '/api/invite'};

// 사진 열쇠 해시: 저장소의 값(진짜 열쇠는 사장님 휴대폰에만). ATLAS_INVITE_OWNER_SHA256 은 시험 서버(invite_dev.mjs)가 시험 열쇠를 쓸 때만 — 넷리파이에는 두지 않음
export default async function invite(req) {
  return handleInvite(req, {store: getStore({name: INVITE_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
