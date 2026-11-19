import json, glob, os, re, collections
W = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36'
D = '/home/claude/atlas-11/docs/design/sonja-watercolor-2026-11-19'
NAMES = {}
for p in glob.glob(W + '/raw/r1-g*.md'):
    g = re.search(r'r1-(g\d\d)', p).group(1)
    m = re.search(r'판 이름:\s*(.+)', open(p, encoding='utf-8').read())
    NAMES[g] = m.group(1).strip() if m else '?'
pick = collections.Counter(); opp = collections.Counter(); merge = collections.Counter()
why = collections.defaultdict(list); owhy = collections.defaultdict(list); keep = []; avoid = []; bad = []; n = 0
for p in sorted(glob.glob(W + '/raw/r2-g*.json')):
    try: v = json.load(open(p, encoding='utf-8'))
    except Exception as e: bad.append(os.path.basename(p)); continue
    n += 1; who = v.get('who') or re.search(r'r2-(g\d\d)', p).group(1)
    for g in v.get('pick', [])[:3]:
        g = re.search(r'g\d\d', str(g)).group(0) if re.search(r'g\d\d', str(g)) else str(g)
        if g == who: continue
        pick[g] += 1
        w = (v.get('pick_why') or {}).get(g)
        if w: why[g].append(w)
    for g in v.get('oppose', [])[:2]:
        g = re.search(r'g\d\d', str(g)).group(0) if re.search(r'g\d\d', str(g)) else str(g)
        opp[g] += 1
        w = (v.get('oppose_why') or {}).get(g)
        if w: owhy[g].append(w)
    mg = sorted(re.search(r'g\d\d', str(x)).group(0) for x in v.get('merge', [])[:2] if re.search(r'g\d\d', str(x)))
    if len(mg) == 2: merge['+'.join(mg)] += 1
    if v.get('keep'): keep.append(v['keep'])
    if v.get('avoid'): avoid.append(v['avoid'])
rank = sorted(set(pick) | set(opp), key=lambda g: (-pick[g], opp[g], g))
out = ['# 2차 토론 셈 — 참모 %d명 표(한 명이 셋 고르고 둘 반대)' % n, '']
out.append('| 판 | 이름 | 고름 | 반대 |'); out.append('|---|---|---|---|')
for g in rank: out.append('| %s | %s | %d | %d |' % (g, NAMES.get(g, '?'), pick[g], opp[g]))
out += ['', '## 많이 나온 합치기']
for k, c in merge.most_common(8): out.append('- %s · %d표' % (k, c))
out += ['', '## 위 판을 고른 까닭(몇 줄)']
for g in rank[:5]:
    out.append('- %s %s: %s' % (g, NAMES.get(g, '?'), ' / '.join(why[g][:6])))
out += ['', '## 반대 까닭(반대 많은 판)']
for g, c in opp.most_common(5):
    out.append('- %s %s(%d): %s' % (g, NAMES.get(g, '?'), c, ' / '.join(owhy[g][:5])))
out += ['', '## 세 샘플 모두 지킬 것'] + ['- ' + k for k in keep] + ['', '## 세 샘플 모두 피할 것'] + ['- ' + a for a in avoid]
if bad: out += ['', '깨진 표: ' + ', '.join(bad)]
open(D + '/TALLY2.md', 'w', encoding='utf-8').write('\n'.join(out))
print('votes', n, 'bad', bad)
for g in rank[:10]: print(g, NAMES.get(g), pick[g], opp[g])
print(merge.most_common(6))
