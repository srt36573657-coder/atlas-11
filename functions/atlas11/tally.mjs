import {getStore} from '@netlify/blobs';
import {handleTally, TALLY_STORE} from '../../lib/atlas11/tally.mjs';
import {OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

export const config = {path: ['/api/tally', '/api/tally/sum']};

// 꼴똘이 합계 칸(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [10] 3 「사람 이름도, 기기 번호도, 쿠키도 없이 날마다 합계만 센다. 서버는 편지 여는 밤과 같은 넷리파이 함수와 저장소」) — 셈은 lib/atlas11/tally.mjs 한 곳
// 받는 것 = {k} 하나 · 두는 것 = 서울 날짜마다 숫자만 · 참고 칸(연 수 · 보낸 수 · 가입 수)은 사장님 열쇠로만 읽음
export default async function tally(req) {
  return handleTally(req, {store: getStore({name: TALLY_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
}
