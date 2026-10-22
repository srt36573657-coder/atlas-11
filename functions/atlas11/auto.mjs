import {getStore} from '@netlify/blobs';
import {handleAuto, AUTO_STORE} from '../../lib/atlas11/auto.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: ['/api/auto', '/api/auto/*']};

// 자동으로 산 기록 · 가짜 돈(사장님 2026-10-22 08:35 「자동 매수 프로그램을 만들어라 …」 · 08:50 「가짜돈으로 해」) — 셈은 lib/atlas11/auto.mjs 한 곳
// 보기 · 팔기 = 사장님 열쇠(x-atlas-owner · 편지 · 진화 · 고객센터와 같은 해시) · 셈(tick) = 열쇠 없이(같은 날 자료면 아무 일 없음) · 깃허브 열쇠 없음
export default async function auto(req) {
  return handleAuto(req, {store: getStore({name: AUTO_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
