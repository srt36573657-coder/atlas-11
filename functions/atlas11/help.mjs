import {getStore} from '@netlify/blobs';
import {handleHelp, HELP_STORE} from '../../lib/atlas11/help.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: ['/api/help', '/api/help/*']};

// 고객센터(사장님 2026-10-21 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간」 · 23:09 「아 해 섹시하게」) — 셈은 lib/atlas11/help.mjs 한 곳
// 보내기 · 내 글 · 지우기 = 그 기기 고객센터 열쇠(x-help-key · 서버에는 해시만) · 모든 글 · 답하기 = 사장님 열쇠(편지 · 진화와 같은 해시) · 깃허브 열쇠 없음
export default async function help(req) {
  return handleHelp(req, {store: getStore({name: HELP_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
