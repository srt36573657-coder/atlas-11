import os, re
W = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36'
D = '/home/claude/atlas-11/docs/design/sonja-watercolor-2026-11-19'
NAMES = {}
for line in open(D + '/R1.md', encoding='utf-8'):
    for m in re.finditer(r'(g\d\d) ([^·/]+?) · ([^/]+?)(?= /|$)', line.strip()):
        NAMES[m.group(1)] = (m.group(2).strip(), m.group(3).strip())
KEYS = [('판 이름', 30), ('한 줄 생각', 70), ('지금 구조에서 버릴 것', 230), ('새 구조', 430), ('효율 장치', 190), ('수채화 모양', 230), ('눈이 약한', 80), ('위험 둘', 170), ('표지 한 줄', 60)]
def fields(text):
    lines = text.split('\n'); cur = None; got = {}
    for l in lines:
        m = re.match(r'^[-*#\s]*(판 이름|한 줄 생각|공부한 것|지금 구조에서 버릴 것|새 구조|효율 장치|수채화 모양|눈이 약한|위험 둘|표지 한 줄)', l)
        if m:
            cur = m.group(1); got[cur] = l.lstrip('-*# ').strip()
        elif cur:
            got[cur] += ' ' + l.strip()
    return got
out = ['# 1차 판 서른여섯 — 표 던지기용 줄인 판(전문은 ALL1.md)', '']
n = 0
for i in range(1, 37):
    g = 'g%02d' % i; p = W + '/raw/r1-%s.md' % g
    nm, lens = NAMES.get(g, ('', ''))
    out.append('## %s · %s' % (g, lens))
    if not os.path.exists(p):
        out.append('(판 없음)'); out.append(''); continue
    n += 1
    f = fields(open(p, encoding='utf-8').read())
    for k, lim in KEYS:
        v = f.get(k)
        if not v: continue
        v = re.sub(r'\s+', ' ', v)
        if len(v) > lim: v = v[:lim].rstrip() + ' …'
        out.append('- ' + v)
    out.append('')
open(D + '/VOTE1.md', 'w', encoding='utf-8').write('\n'.join(out))
print('boards', n)
t = '\n'.join(out); i = t.index('## g19 ')
open(D + '/VOTE1a.md', 'w', encoding='utf-8').write(t[:i])
open(D + '/VOTE1b.md', 'w', encoding='utf-8').write('# 1차 판 — 뒤쪽(g19 ~ g36)\n\n' + t[i:])
