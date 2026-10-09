/**
 * ATLAS 11 · 선물형 초대장 저장 · 읽기 — 넷리파이 함수(2세대 · 주소 /api/invite)
 *   저장소: 넷리파이 Blobs(사이트 하나에 묶인 저장소 · 강한 일관성) — 셈은 lib/atlas11/invite.mjs 한 곳
 *   올리기: scripts/atlas11/deploy_netlify.mjs 가 이 폴더(functions/atlas11)만 함께 올린다(저장소의 옛 netlify/functions 는 올리지 않음)
 */
import {getStore} from '@netlify/blobs';
import {handleInvite, INVITE_STORE} from '../../lib/atlas11/invite.mjs';

export const config = {path: '/api/invite'};

export default async function invite(req) {
  return handleInvite(req, {store: getStore({name: INVITE_STORE, consistency: 'strong'})});
}
