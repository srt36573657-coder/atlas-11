// Runtime entry point. v7 remains reproducible through news-engine.mjs.
import {forecast as empiricalForecast,sourceDataDigest as empiricalDigest,CONDITIONAL_VERSION} from './news-engine.mjs';
export * from './news-engine.mjs';
export const MODEL_VERSION=CONDITIONAL_VERSION;
export const forecast=(input,options={})=>empiricalForecast(input,{...options,conditional:true});
export const sourceDataDigest=(input,origin,cutoff)=>empiricalDigest(input,origin,cutoff,{conditional:true});
