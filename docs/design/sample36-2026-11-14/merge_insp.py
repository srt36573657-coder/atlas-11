# 검사단 결과 모으기 — python3 merge_insp.py <N> → FIX-<N>.md · 점수판 insp/score.json
import json, glob, sys, os
N = int(sys.argv[1])
NAME = {'L01':'1초 판별','L02':'눈이 약한 분','L03':'말','L04':'숫자','L05':'빠짐','L06':'부추김','L07':'손자병법다움',
        'L08':'손가락','L09':'첫 화면','L10':'겹침 · 잘림','L11':'색과 꾸밈','L12':'처음 온 어르신'}
rows = []; scores = {}
for f in sorted(glob.glob(f'insp/s{N}-L*.json')):
    try: d = json.load(open(f))
    except Exception as e: print('못 읽음', f, e); continue
    L = d.get('lens') or os.path.basename(f)[3:6]
    scores[L] = d.get('score')
    for x in d.get('found', []):
        rows.append((int(x.get('level', 1)), L, x.get('where',''), x.get('see',''), x.get('fix','')))
rows.sort(key=lambda r: (-r[0], r[1]))
out = [f'# 샘플 {N} 고칠 것 — 검사단 {len(scores)}명 · 찾은 것 {len(rows)}개', '']
for lv, title in ((3,'꼭 고침'),(2,'고치면 좋아짐'),(1,'작은 것')):
    part = [r for r in rows if r[0]==lv]
    if not part: continue
    out.append(f'## {title} {len(part)}')
    for i, (_, L, w, s, fx) in enumerate(part, 1):
        out.append(f'{i}. [{L} {NAME.get(L,"")}] 「{w}」 — {s} → {fx}')
    out.append('')
open(f'FIX-{N}.md', 'w').write('\n'.join(out))
sp = 'insp/score.json'
S = json.load(open(sp)) if os.path.exists(sp) else {}
S[str(N)] = scores
json.dump(S, open(sp, 'w'), ensure_ascii=False, indent=1)
print(f'샘플 {N}: 검사 {len(scores)} · 찾은 것 {len(rows)} (꼭 {sum(r[0]==3 for r in rows)} · 좋아짐 {sum(r[0]==2 for r in rows)} · 작은 {sum(r[0]==1 for r in rows)}) · 평균 점수', round(sum(v for v in scores.values() if v)/max(1,len([v for v in scores.values() if v])),1))
