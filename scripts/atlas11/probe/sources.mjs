/**
 * 시세 출처 점검(깃허브 실행기에서) — 정규장(KRX 15:30) 종가만 주는 출처를 고르기 위한 원문 수집
 * 결과: reports/atlas11/probe/<시각>/<출처>-<종목>.txt (앞 20KB) + summary.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
const codes = ['005930', '373220', '329180'];
const day = process.argv[2] ?? '20260929';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const out = path.join('reports/atlas11/probe', new Date().toISOString().replace(/[:.]/g, '-')); await fs.mkdir(out, {recursive: true});
const targets = [];
for (const c of codes) {
  targets.push(['naver_fchart', c, `https://fchart.stock.naver.com/sise.nhn?symbol=${c}&timeframe=day&count=3&requestType=0`]);
  targets.push(['naver_siseJson', c, `https://fchart.stock.naver.com/siseJson.nhn?symbol=${c}&requestType=1&startTime=${day.slice(0, 6)}20&endTime=${day}&timeframe=day`]);
  targets.push(['naver_m_basic', c, `https://m.stock.naver.com/api/stock/${c}/basic`]);
  targets.push(['naver_m_price', c, `https://m.stock.naver.com/api/stock/${c}/price?pageSize=3&page=1`]);
  targets.push(['naver_api_chart', c, `https://api.stock.naver.com/chart/domestic/item/${c}/day?startDateTime=${day.slice(0, 6)}250000&endDateTime=${day}0000`]);
  targets.push(['naver_sise_day', c, `https://finance.naver.com/item/sise_day.naver?code=${c}&page=1`]);
  targets.push(['yahoo', c, `https://query1.finance.yahoo.com/v8/finance/chart/${c}.KS?range=5d&interval=1d`]);
  targets.push(['daum', c, `https://finance.daum.net/api/quote/A${c}/days?symbolCode=A${c}&page=1&perPage=3&pagination=true`]);
  targets.push(['mk', c, `https://stock.mk.co.kr/price/home/KR7${c}00${{'005930': '3', '373220': '6', '329180': '0'}[c]}`]);
}
const summary = [];
for (const [src, code, url] of targets) {
  const t = Date.now(); let status = 0, text = '', err = null;
  try { const r = await fetch(url, {headers: {'User-Agent': UA, 'Referer': src === 'daum' ? `https://finance.daum.net/quotes/A${code}` : 'https://finance.naver.com/', 'Accept': '*/*'}, signal: AbortSignal.timeout(15000)}); status = r.status; const buf = Buffer.from(await r.arrayBuffer()); const ct = r.headers.get('content-type') ?? ''; text = /euc-kr/i.test(ct) || src === 'naver_sise_day' ? new TextDecoder('euc-kr').decode(buf) : buf.toString('utf8'); } catch (e) { err = String(e.message); }
  await fs.writeFile(path.join(out, `${src}-${code}.txt`), text.slice(0, 20000));
  summary.push({src, code, url, status, bytes: text.length, ms: Date.now() - t, err});
}
// KRX 정보데이터시스템 (전 종목 하루치 · 공식)
for (const [mkt, label] of [['STK', 'krx_all_stk'], ['KSQ', 'krx_all_ksq']]) {
  let status = 0, text = '', err = null;
  try { const r = await fetch('https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd', {method: 'POST', headers: {'User-Agent': UA, 'Referer': 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest'}, body: new URLSearchParams({bld: 'dbms/MDC/STAT/standard/MDCSTAT01501', locale: 'ko_KR', mktId: mkt, trdDd: day, share: '1', money: '1', csvxls_isNo: 'false'}), signal: AbortSignal.timeout(20000)}); status = r.status; text = await r.text(); } catch (e) { err = String(e.message); }
  const keep = (() => { try { const j = JSON.parse(text); return JSON.stringify({keys: Object.keys(j), rows: (j.OutBlock_1 ?? []).filter(x => codes.includes(x.ISU_SRT_CD)), total: (j.OutBlock_1 ?? []).length, CURRENT_DATETIME: j.CURRENT_DATETIME}); } catch { return text.slice(0, 20000); } })();
  await fs.writeFile(path.join(out, `${label}.txt`), keep);
  summary.push({src: label, code: 'ALL', status, bytes: text.length, err});
}
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary.map(s => [s.src, s.code, s.status, s.bytes, s.err])));
