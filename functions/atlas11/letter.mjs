import {getStore} from '@netlify/blobs';
import {handleLetter, LETTER_STORE} from '../../lib/atlas11/letter.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: '/api/letter'};

// 편지 여는 밤(사장님 2026-10-17 01:29 「그래 이제 만들어봐」) — 셈은 lib/atlas11/letter.mjs 한 곳
// 시험 서버(invite_dev.mjs)에서만: ATLAS_LETTER_DEV=1 이면 ATLAS_LETTER_SKEW_MS 만큼 시계를 옮겨 여는 밤을 미리 시험 — 넷리파이에는 두지 않음
export default async function letter(req) {
  const skew = process.env.ATLAS_LETTER_DEV === '1' ? Number(process.env.ATLAS_LETTER_SKEW_MS || 0) : 0;
  return handleLetter(req, {store: getStore({name: LETTER_STORE, consistency: 'strong'}), now: () => new Date(Date.now() + skew),
    ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
