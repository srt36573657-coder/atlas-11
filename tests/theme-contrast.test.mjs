import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../src/globals.css',import.meta.url),'utf8');
const palette=Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[a-f0-9]{6});/g)].map(m=>[m[1],m[2]]));
function luminance(hex){
 assert.match(hex??'',/^#[a-f0-9]{6}$/);
 const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];
}
function contrast(foreground,background){const [high,low]=[luminance(palette[foreground]),luminance(palette[background])].sort((a,b)=>b-a);return(high+0.05)/(low+0.05);}
test('wine theme normal text and links retain at least 4.5:1 across every panel state',()=>{
 for(const surface of ['background','surface','surface-raised','surface-hover','surface-inset','surface-note'])
  for(const foreground of ['text','muted','gold','positive','negative'])
   assert.ok(contrast(foreground,surface)>=4.5,`${foreground} on ${surface}: ${contrast(foreground,surface)}`);
 for(const gold of ['gold','gold-hover'])assert.ok(contrast('on-gold',gold)>=4.5);
});
test('interactive boundaries, focus accents and essential graph strokes retain 3:1',()=>{
 for(const surface of ['background','surface','surface-raised','surface-inset'])
  for(const foreground of ['control-border','gold','chart-actual','chart-forecast','chart-event','chart-cursor'])
   assert.ok(contrast(foreground,surface)>=3,`${foreground} on ${surface}: ${contrast(foreground,surface)}`);
});
