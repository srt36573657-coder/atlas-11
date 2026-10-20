# 올린 쪽(호스트)이 페이지를 감싸는 모양 그대로(10-20 18:3x 받은 7판 index.html 앞 531자) — 표준 모드 · 화면 폭 메타 · [hidden] 규칙
import sys
pre='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
if len(sys.argv)>3 and sys.argv[3]=='rec':
    a="start, still, catchAt(x, y) {"; assert s.count(a)==1; s=s.replace(a,"start, still, get head() { return met && met.hx != null ? [met.hx, met.hy] : null; }, catchAt(x, y) {")
    b="\nrender(true);\n})();\n</scrip"; assert s.count(b)==1; s=s.replace(b,"\nwindow.__t = {SKY};\nrender(true);\n})();\n</scrip")
open(out,'w',encoding='utf-8').write(pre+s+'\n</body></html>'); print('wrapped', out)
