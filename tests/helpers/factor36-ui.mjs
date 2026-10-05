import{gunzipSync}from'node:zlib';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
import {JSDOM} from 'jsdom';
import {IDBFactory,IDBKeyRange} from 'fake-indexeddb';
import {createHash} from 'node:crypto';
import {createDisplayBundle,displayStateFromBundle} from '../../lib/display-bundle.mjs';
import {initialState,clientState} from '../../lib/service.mjs';

// Existing factor36 component checks use an explicit archived route. New rolling checks
// pass the clean root URL so the new default is tested independently.
// Transform the actual TSX components; assertions below inspect mounted DOM and
// real React interactions, not source-code regex matches or replacement stubs.
const require=createRequire(import.meta.url),modules=new Map();
async function component(file){
  const absolute=fileURLToPath(new URL(file,import.meta.url));
  if(!modules.has(absolute))modules.set(absolute,(async()=>{
    let {code}=await transformWithOxc(fs.readFileSync(absolute,'utf8'),absolute,{jsx:{runtime:'automatic'}});
    // CSS is verified by the built-browser tests; JSDOM's ESM data URLs cannot load CSS.
    code=code.replace(/^import\s+['"][^'"]+\.css['"];?\s*$/gm,'');
    const imports=[...code.matchAll(/^import\s+[^;]*?\sfrom\s*(['"])([^'"]+)\1/gm)];
    for(const match of imports){
      const spec=match[2];let replacement;
      if(spec.startsWith('.')){
        let target=path.resolve(path.dirname(absolute),spec);
        if(!path.extname(target))target+='.tsx';
        replacement=target.endsWith('.tsx')?await componentURL(target):pathToFileURL(target).href;
      }else replacement=pathToFileURL(require.resolve(spec)).href;
      code=code.replaceAll(match[0],match[0].replace(`${match[1]}${spec}${match[1]}`,JSON.stringify(replacement)));
    }
    return 'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
  })());
  return import(await modules.get(absolute));
}

async function componentURL(absolute){await component(pathToFileURL(absolute).href);return modules.get(absolute);}

async function mounted(callback,{fetchImpl,url='https://atlas-unit.test/?view=legacy'}={}){
  const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url,pretendToBeVisual:true});
  const restore=new Map(),set=(key,value)=>{restore.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});};
  for(const key of ['window','document','navigator','HTMLElement','Event','MouseEvent','KeyboardEvent','MutationObserver','getComputedStyle'])set(key,dom.window[key]);
  set('requestAnimationFrame',fn=>{fn();return 0;});set('IS_REACT_ACT_ENVIRONMENT',true);
  set('ResizeObserver',class{observe(){} disconnect(){}});
  set('indexedDB',new IDBFactory());set('IDBKeyRange',IDBKeyRange);
  const requests=[];
  set('fetch',async (url,options)=>{requests.push(String(url));if(url==='/data/atlas.json')return Response.json(JSON.parse(fs.readFileSync('public/data/atlas.json')));if(url==='/data/news-wave.json.gz')return Response.json(JSON.parse(gunzipSync(fs.readFileSync('public/data/news-wave.json.gz'))));if(url==='/data/factor36-status.json'||url==='/data/factor36-collection.json')return Response.json(JSON.parse(fs.readFileSync('public'+url)));if(url==='/api/account')return Response.json({configured:false,user:null,watchlist:[],revision:0});if(fetchImpl)return fetchImpl(url,options);throw Error('fixture: no live API');});
  const intervals=[],nativeSetInterval=globalThis.setInterval;
  set('setInterval',(callback,delay,...args)=>{const handle=nativeSetInterval(callback,delay,...args);handle.unref?.();intervals.push({callback,delay,handle});return handle;});
  const {default:React,act}=await import('react'),{createRoot}=await import('react-dom/client');
  const root=createRoot(document.getElementById('root'));
  const scrollCalls=[];let scrollY=0;
  Object.defineProperty(window,'innerWidth',{value:390,configurable:true});
  Object.defineProperty(window,'innerHeight',{value:844,configurable:true});
  Object.defineProperty(window,'scrollY',{get:()=>scrollY,configurable:true});
  window.scrollTo=options=>{scrollCalls.push(options);if(typeof options==='object')scrollY=options.top??scrollY;};
  // Viewport values exercise state and semantic controls only: jsdom does not lay out pixels.
  const wait=async predicate=>{for(let i=0;i<150;i++){if(predicate())return;await act(async()=>{await new Promise(r=>setTimeout(r,10));});}assert.fail('Expected UI condition did not appear');};
  const key=async(target,key,options={})=>act(async()=>target.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...options})));
  const tick=async()=>act(async()=>{await new Promise(r=>setTimeout(r,5));});
  const render=element=>act(async()=>{root.render(element);await new Promise(r=>setTimeout(r,0));});
  const click=async element=>{assert.ok(element,'interactive target exists');await act(async()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));};
  const change=async(element,value)=>{assert.ok(element,'select exists');await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('change',{bubbles:true}));});};
  const button=(label,within=document)=>[...within.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
  try{await callback({React,act,root,render,click,change,button,dom,wait,key,tick,scrollCalls,requests,intervals});}
  finally{for(const timer of intervals)clearInterval(timer.handle);await act(async()=>root.unmount());dom.window.close();for(const[key,descriptor]of restore)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];}
}


export{component,mounted};
