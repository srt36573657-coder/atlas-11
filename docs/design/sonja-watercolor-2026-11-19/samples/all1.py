import os, re
W = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36'
D = '/home/claude/atlas-11/docs/design/sonja-watercolor-2026-11-19'
NAMES = {}
for line in open(D + '/R1.md', encoding='utf-8'):
    for m in re.finditer(r'(g\d\d) ([^·/]+?) · ([^/]+?)(?= /|$)', line.strip()):
        NAMES[m.group(1)] = (m.group(2).strip(), m.group(3).strip())
out = ['# 1차 판 서른여섯(참모 g01 ~ g36) — 2차 토론 자료', '']
n = 0
for i in range(1, 37):
    g = 'g%02d' % i; p = W + '/raw/r1-%s.md' % g
    nm, lens = NAMES.get(g, ('', ''))
    out.append('## %s 「%s」 · %s' % (g, nm, lens))
    if os.path.exists(p):
        n += 1
        body = open(p, encoding='utf-8').read().strip().split('\n')
        out += [l for l in body if not l.startswith('# ')]
    else:
        out.append('(판 없음)')
    out.append('')
open(D + '/ALL1.md', 'w', encoding='utf-8').write('\n'.join(out))
print('boards', n, 'names', len(NAMES))
