import {getStore} from '@netlify/blobs';
import {handleJinhwa, JINHWA_STORE} from '../../lib/atlas11/jinhwa.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: ['/api/jinhwa', '/api/jinhwa/*']};

// 꼴똘이 진화 칸(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [9] 8 「확인과 되돌리기는 넷리파이 함수가 사장님 열쇠를 맞대고 저장소에 적는다」) — 셈은 lib/atlas11/jinhwa.mjs 한 곳
// 쓰기 = 사장님 열쇠(편지 여는 밤과 같은 해시 · ATLAS_INVITE_OWNER_SHA256 은 시험 서버만) · 읽기 /api/jinhwa/status = 열쇠 없이 번호 · 상태 · 때만 · 깃허브 열쇠 없음
export default async function jinhwa(req) {
  return handleJinhwa(req, {store: getStore({name: JINHWA_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
