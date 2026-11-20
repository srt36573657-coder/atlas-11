"""손자병법 사이트 전체 뒤 배경 — site/su/su-bg.svg 를 만든다(주문 1120-1449)
사장님 2026-11-20(마카오) 14:49 「이배경을 손자병법 싸이트 전체 뒤 배경으로 하라」(첫 쪽 「손자병법 한 폭」 산수 그림을 보내시며)
바탕 = site/su/su-sonja-scroll.svg(주문 1119-1623 · 1119-1648 한 폭) 그대로에서 번호 도장 여섯과 정산 점선만 뺌(뒤 배경이라 글 · 번호가 없어야 함)
쓰임: python3 scripts/atlas11/next/su_bg.py  (한 폭 그림을 고치면 다시 돌림)
"""
import os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..')
src = open(os.path.join(ROOT, 'site/su/su-sonja-scroll.svg'), encoding='utf-8').read()
out = src
# 1) 번호 도장 여섯(동그라미 + 숫자 글) — 마지막 <g><circle …>…6</text></g>
m = re.search(r'<g><circle cx="30" cy="200"[\s\S]*?>6</text></g>', out)
assert m, '번호 도장 무리를 찾지 못함'
out = out[:m.start()] + out[m.end():]
# 2) 정산 흐르는 점선(stroke-dasharray="0.1 6" 무리)
m2 = re.search(r'<g fill="none" stroke="#566A71" stroke-width="1.6" stroke-dasharray="0.1 6"[^>]*>[\s\S]*?</g>', out)
assert m2, '정산 점선 무리를 찾지 못함'
out = out[:m2.start()] + out[m2.end():]
assert '<text' not in out, '글이 남음'
out = out.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice"', 1)
out = out.replace('>\n<defs>', '>\n<!-- 손자병법 전체 뒤 배경(주문 1120-1449) · scripts/atlas11/next/su_bg.py 가 su-sonja-scroll.svg 에서 번호 도장 · 정산 점선을 빼서 만듦 · 손으로 고치지 않음 -->\n<defs>', 1)
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'site/su/su-bg.svg')
open(dst, 'w', encoding='utf-8').write(out)
print(dst, len(out.encode('utf-8')), 'bytes')
