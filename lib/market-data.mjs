// NAVER remains a single provider. A verified envelope is not a second quote.
// Fail closed before merging any row: malformed or mismatched responses leave
// the last normal prices intact in the calling collector.
export function parseNaver(text, code, cutoff, sessions) {
  if(!/^\d{6}$/.test(code)||!validDate(cutoff)||!Array.isArray(sessions))throw Error('NAVER request contract invalid');
  if(typeof text!=='string'||text.length>5*1024*1024)throw Error('NAVER response size/type invalid');
  const charts=[...text.matchAll(/<chartdata\b([^>]*)>([\s\S]*?)<\/chartdata\s*>/gi)];
  if(charts.length!==1)throw Error('NAVER chartdata envelope missing/ambiguous');
  const symbol=charts[0][1].match(/\bsymbol\s*=\s*(["'])(.*?)\1/i)?.[2];
  if(symbol!==code)throw Error('NAVER response symbol mismatch');
  const body=charts[0][2],items=[...body.matchAll(/<item\b([^>]*)\/?\s*>/gi)];
  if(!items.length||items.length>10000)throw Error('NAVER price rows missing/excessive');
  const sessionsSet=new Set(sessions),firstSession=sessions[0],rows=new Map();
  for(const item of items){
    const data=item[1].match(/\bdata\s*=\s*(["'])(.*?)\1/i)?.[2];
    const fields=data?.split('|');
    if(!fields||fields.length!==6||!/^\d{8}$/.test(fields[0]))throw Error('NAVER row structure invalid');
    const raw=fields[0],date=`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
    if(!validDate(date))throw Error('NAVER calendar date invalid');
    if(fields.slice(1).some(v=>!/^\d+(?:\.\d+)?$/.test(v)))throw Error('NAVER numeric field invalid');
    const [open,high,low,close,volume]=fields.slice(1).map(Number);
    if(![open,high,low,close,volume].every(Number.isFinite)||close<=0||volume<0)throw Error('NAVER price/volume invalid');
    // Some suspended sessions have zero O/H/L and a retained closing price.
    const suspended=open===0&&high===0&&low===0&&volume===0;
    if(!suspended&&(low<=0||high<low||open<low||open>high||close<low||close>high))throw Error('NAVER OHLC bounds invalid');
    if(date>cutoff||date<firstSession)continue;
    if(!sessionsSet.has(date))throw Error('NAVER row on an unexpected non-session date');
    const row={date,close,quality:'single_source',volume,open,high,low,
      sources:[{provider:'NAVER',url:`https://finance.naver.com/item/sise.naver?code=${code}`,retrievedAt:cutoff}]};
    const previous=rows.get(date);
    if(previous&&JSON.stringify(previous)!==JSON.stringify(row))throw Error('NAVER contradictory duplicate date');
    rows.set(date,row);
  }
  if(!rows.size)throw Error('NAVER no eligible price rows');
  return [...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;}
