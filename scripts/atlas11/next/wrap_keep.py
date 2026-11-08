#!/usr/bin/env python3
# 수르 틀 안 옛 쪽 — 밤 무대 판(html.clock)을 뗀 뒤에도 자리 · 크기는 지금 그대로(주문 2011 · 사장님 2026-11-08 20:11 「모든 페이지를 첫페이지 기준으로」 · 20:26 「아니 이것도 같이 작업해」)
#   su-wrap.js 가 수르 틀일 때 clock 을 떼면 그 판에 딸린 색 아닌 규칙(글 크기 17px · 굵기 · 칸 짜임 · 여백 · 테 두께 …)도 함께 빠짐
#   → 옛 쪽 꾸밈 파일(site/next 의 stone · theme-home · clock · home-new · home-talk)에서 선택자에 .clock 이 든 규칙의 「색 아닌 칸」만 골라
#     .clock 자리를 .su-jobs 로 바꿔 적음(무게 그대로 · 첫 페이지 판일 때 · 원래 차례 그대로) — 색은 su-wrap-jobs.css 의 첫 페이지 값이 맡음
#   테 두께가 든 칸(border · border-top …)은 두께 · 모양을 그대로 두고 색만 가는 회색 #E5E5EA · 바깥 테(outline) · 그림자 · 칠 · 색 이름(--*) · 투명도 · 거르개는 뺌
# 짓기: python3 scripts/atlas11/next/wrap_keep.py → site/su/su-wrap-jobs.css 의 표시 줄 사이를 새로 씀 · --check = 다르면 끝 코드 1(시험 tests/atlas11/su.test.mjs)
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SRC = ['site/next/stone.css', 'site/next/theme-home.css', 'site/next/clock.css', 'site/next/home-new.css', 'site/next/home-talk.css']  # /next/index.html 이 받는 차례 · home-talk 는 칸을 열 때 뒤에 붙음
OUT = os.path.join(ROOT, 'site/su/su-wrap-jobs.css')
BEGIN = '/* ── 밤 판 자리 · 크기 지킴(아래는 scripts/atlas11/next/wrap_keep.py 가 지음 · 손으로 고치지 않음) ── */'
END = '/* ── 지은 것 끝 ── */'
DROP = re.compile(r'^(color|color-scheme|background(-[a-z-]+)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-color|border-image(-[a-z-]+)?|outline(-[a-z-]+)?|fill(-opacity)?|stroke(-opacity)?|box-shadow|text-shadow|caret-color|accent-color|text-decoration(-[a-z-]+)?|--.*|opacity|stop-color|stop-opacity|flood-color|lighting-color|filter|backdrop-filter|-webkit-backdrop-filter|-webkit-text-stroke.*|-webkit-text-fill-color|mix-blend-mode|scrollbar-color|-webkit-tap-highlight-color)$')
BORDER = re.compile(r'^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?$')
HAIR = '#E5E5EA'

def strip_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)

def parse(s, wrap, out):
    i, start, n = 0, 0, len(s)
    while i < n:
        c = s[i]
        if c in '"\'':
            q = c; i += 1
            while i < n and s[i] != q:
                if s[i] == '\\': i += 1
                i += 1
            i += 1; continue
        if c == '{':
            pre = s[start:i].strip(); d = 0; j = i
            while j < n:
                if s[j] == '{': d += 1
                elif s[j] == '}':
                    d -= 1
                    if d == 0: break
                j += 1
            body = s[i + 1:j]
            if pre.startswith('@'):
                if pre.split()[0].lower() in ('@media', '@supports', '@container'): parse(body, wrap + [pre], out)
            else: out.append((tuple(wrap), pre, body))
            i = j + 1; start = i; continue
        if c == ';' and s[start:i].strip().startswith('@'): start = i + 1
        i += 1

def split_top(s, sep):
    parts, d, cur = [], 0, ''
    for ch in s:
        if ch in '([': d += 1
        elif ch in ')]': d -= 1
        if ch == sep and d == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur)
    return [p.strip() for p in parts if p.strip()]

def decls(body):
    out = []
    for d in split_top(body, ';'):
        if ':' not in d: continue
        k, v = d.split(':', 1); k = k.strip().lower(); v = v.strip()
        if k and v: out.append((k, v))
    return out

COLOR_TOKEN = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\bvar\(--[\w-]+\)|\b(currentColor|transparent|white|black|red|gold)\b')
def border_value(v):
    if v.strip() in ('0', 'none', '0 none'): return v
    imp = ' !important' if '!important' in v else ''
    v = v.replace('!important', '').strip()
    t = COLOR_TOKEN.sub('', v).strip()
    t = re.sub(r'\s+', ' ', t)
    if not t: return None
    w = [float(x) for x in re.findall(r'(\d*\.?\d+)px', t)]
    if 'thick' in t or 'medium' in t or any(x > 2 for x in w): return None  # 두꺼운 테 = 그림 모양(▶ 세모 · 굵은 띠) — 옛 흰 판 것 그대로 둠
    return f'{t} {HAIR}{imp}'

def keep_rules():
    out = []
    for f in SRC:
        p = os.path.join(ROOT, f)
        if not os.path.exists(p): continue
        rs = []; parse(strip_comments(open(p, encoding='utf-8').read()), [], rs)
        for wrap, pre, body in rs:
            sels = []
            for sel in split_top(pre, ','):
                if not re.search(r'\.clock\b', sel): continue
                if re.search(r':not\([^)]*\.clock', sel): continue  # 「clock 이 없을 때」 규칙은 이미 걸림
                sels.append(re.sub(r'\.clock\b', '.su-jobs', sel))
            if not sels: continue
            ds = []
            for k, v in decls(body):
                if BORDER.match(k):
                    b = border_value(v)
                    if b: ds.append((k, b))
                    continue
                if DROP.match(k): continue
                ds.append((k, v))
            if ds: out.append((f, wrap, ', '.join(sels), ds))
    return out

def emit(rules):
    lines, last = [], None
    for f, wrap, sel, ds in rules:
        if f != last: lines.append(f'/* {f} */'); last = f
        body = sel + ' { ' + '; '.join(f'{k}: {v}' for k, v in ds) + '; }'
        for w in reversed(wrap): body = w + ' { ' + body + ' }'
        lines.append(body)
    return '\n'.join(lines) + '\n'

def build(css):
    if BEGIN not in css or END not in css: raise SystemExit('su-wrap-jobs.css 에 표시 줄이 없음')
    head, rest = css.split(BEGIN, 1); tail = rest.split(END, 1)[1]
    rules = keep_rules()
    return head + BEGIN + '\n' + emit(rules) + END + tail, len(rules)

if __name__ == '__main__':
    css = open(OUT, encoding='utf-8').read()
    want, n = build(css)
    if '--check' in sys.argv[1:]:
        if css != want: print('su-wrap-jobs.css 의 지은 칸이 옛 꾸밈 파일과 달라요 — python3 scripts/atlas11/next/wrap_keep.py 로 다시 지으세요'); sys.exit(1)
        print('su-wrap-jobs.css 지은 칸 = 옛 꾸밈 파일', n)
    else:
        open(OUT, 'w', encoding='utf-8').write(want); print('지음 · 규칙', n)
