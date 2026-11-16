import sys, re
S = sys.argv[1]
base = open(S + '/base.css', encoding='utf-8').read()
def block(c):
    return '''
/* ── 샘플 판(주문 1117-0724 · 사장님 2026-11-17(마카오) 06:58 「먼저 Ui/ux르를 100가지 분석해 … 샘플 3개 제출해」) — ''' + c['name'] + ''' ── */
html.sj-on { --sj-serif: ''' + c['serif'] + '''; }
html.sj-on:has(#su) body, html.sj-on:has(#su) body::before { background: ''' + c['bg'] + '''; }
#su .sj-page { background: ''' + c['bg'] + '''; }
#su .sj-top { position: relative; z-index: auto; flex-wrap: wrap; background: ''' + c['bg'] + '''; border-bottom: 0; box-shadow: none; padding-top: 6px; padding-bottom: 6px; }
#su .sj-brand { font-family: ''' + c['brandf'] + '''; font-size: 1.375rem; font-weight: 900; letter-spacing: ''' + c['brandls'] + '''; color: ''' + c['ink'] + '''; }
#su .sj-btn { border: 0; border-radius: 999px; background: ''' + c['pill'] + '''; color: ''' + c['pilltx'] + '''; font-weight: 800; padding: 0 14px; box-shadow: ''' + c['sh1'] + '''; }
#su .sj-bigtext { background: ''' + c['bigbg'] + '''; color: ''' + c['bigtx'] + '''; }
#su .sj-btabs { flex: 1 1 100%; display: flex; gap: 18px; align-items: flex-end; padding: 6px 2px 2px; overflow-x: auto; scrollbar-width: none; }
#su .sj-btab { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; min-width: 48px; font-family: var(--sj-sans); font-size: 1.75rem; font-weight: 900; color: ''' + c['muted'] + '''; text-decoration: none; white-space: nowrap; letter-spacing: -.01em; }
#su .sj-btab.sj-bcur { color: ''' + c['ink'] + '''; }
#su .sj-search { flex: 1 1 100%; display: flex; align-items: center; justify-content: space-between; min-height: 58px; margin: 8px 0 4px; padding: 0 20px 0 24px; border-radius: 999px; background: ''' + c['card'] + '''; color: ''' + c['sub'] + '''; font-size: 1.1875rem; font-weight: 700; text-decoration: none; box-shadow: ''' + c['sh2'] + '''; }
#su .sj-searchi { position: relative; width: 22px; height: 22px; border: 3.5px solid ''' + c['acc'] + '''; border-radius: 50%; box-sizing: border-box; }
#su .sj-searchi::after { content: ""; position: absolute; right: -7px; bottom: -6px; width: 9px; height: 3.5px; border-radius: 2px; background: ''' + c['acc'] + '''; transform: rotate(45deg); }
#su .sj-sec { margin: 14px 0; padding: 28px 18px 78px; border-radius: 24px; background: ''' + c['card'] + '''; box-shadow: ''' + c['sh2'] + '''; }
''' + c['titles'] + '''
#su .sj-chip, #su .sj-thco { border: 0; border-radius: 16px; background: ''' + c['chip'] + '''; }
#su .sj-chip b[data-i]::before, #su .sj-thco b[data-i]::before { content: attr(data-i); display: inline-flex; align-items: center; justify-content: center; width: 1.7em; height: 1.7em; margin-right: 8px; border-radius: 50%; background: ''' + c['b0'] + '''; color: ''' + c['btx'] + '''; font-size: .82em; font-weight: 900; vertical-align: middle; }
#su .sj-chip b[data-c="1"]::before, #su .sj-thco b[data-c="1"]::before { background: ''' + c['b1'] + '''; }
#su .sj-chip b[data-c="2"]::before, #su .sj-thco b[data-c="2"]::before { background: ''' + c['b2'] + '''; }
#su .sj-chip b[data-c="3"]::before, #su .sj-thco b[data-c="3"]::before { background: ''' + c['b3'] + '''; }
#su .sj-chip b[data-c="4"]::before, #su .sj-thco b[data-c="4"]::before { background: ''' + c['b4'] + '''; }
#su .sj-next { border-radius: 16px; background: ''' + c['nextbg'] + '''; color: ''' + c['nexttx'] + '''; }
#su .sj-dock { background: ''' + c['bar'] + '''; border-top: 1px solid ''' + c['line'] + '''; }
#su .sj-tabs { background: ''' + c['bar'] + '''; border-top: 1px solid ''' + c['line'] + '''; padding-left: calc(88px + env(safe-area-inset-left, 0px)); }
#su .sj-tab { border-radius: 12px; color: ''' + c['muted'] + '''; font-size: 1.125rem; font-weight: 800; }
#su .sj-tab.sj-cur { background: transparent; color: ''' + c['ink'] + '''; font-weight: 900; }
#su .sj-menu { position: fixed; left: max(8px, env(safe-area-inset-left, 0px)); bottom: calc(6px + env(safe-area-inset-bottom, 0px)); z-index: 40; }
#su .sj-menu > summary { list-style: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; width: 72px; min-height: 56px; border-radius: 12px; background: ''' + c['menubg'] + '''; color: ''' + c['menufg'] + '''; cursor: pointer; }
#su .sj-menu > summary::-webkit-details-marker { display: none; }
#su .sj-menu > summary b { font-size: 1.0625rem; font-weight: 900; line-height: 1; }
#su .sj-menui { display: block; width: 24px; height: 2.5px; border-radius: 2px; background: ''' + c['menufg'] + '''; box-shadow: 0 -6px 0 ''' + c['menufg'] + ''', 0 6px 0 ''' + c['menufg'] + '''; margin: 8px 0 12px; }
#su .sj-menul { position: absolute; left: 0; bottom: calc(100% + 10px); display: grid; min-width: 220px; padding: 8px; border-radius: 20px; background: ''' + c['card'] + '''; box-shadow: ''' + c['sh3'] + '''; }
#su .sj-menul a { display: flex; align-items: center; min-height: 50px; padding: 0 16px; border-radius: 12px; color: ''' + c['ink'] + '''; font-size: 1.1875rem; font-weight: 800; text-decoration: none; }
'''
SANS = 'var(--sj-sans)'
# 샘플 2 — 한지 키움
c2 = dict(name='샘플 2 「한지 키움」 — 한지 바탕 · 종이 카드 · 먹 글 · 남빛 강조 · 붓 제목은 그대로', serif="'Noto Serif KR', 'Noto Serif CJK KR', 'AppleMyungjo', 'Nanum Myeongjo', serif",
  bg='#F1E3D3', card='#FBF6EE', ink='#3B1A14', sub='#8E7466', muted='#B39C88', acc='#1F2A44', pill='#FBF6EE', pilltx='#3B1A14', bigbg='#1F2A44', bigtx='#FBF6EE',
  brandf="var(--sj-serif)", brandls='.26em', chip='#F6EDE2', b0='#1F2A44', b1='#3B1A14', b2='#5A4636', b3='#2F4A5C', b4='#6B4A3A', btx='#FBF6EE', nextbg='#3B1A14', nexttx='#FBF6EE',
  bar='#FBF6EE', line='#E2D3C2', menubg='#1F2A44', menufg='#FBF6EE',
  sh1='0 1px 2px rgba(59, 26, 20, .06), 0 2px 8px rgba(59, 26, 20, .07)', sh2='0 1px 2px rgba(59, 26, 20, .05), 0 8px 22px rgba(59, 26, 20, .07)', sh3='0 4px 10px rgba(59, 26, 20, .1), 0 14px 36px rgba(59, 26, 20, .18)',
  titles='#su .sj-h2 { font-weight: 900; }\n')
# 샘플 3 — 먹밤 키움(어두운 먹 바탕 · 금빛 강조)
MAP3 = [('#F1E3D3', '#16151C'), ('#E7D3BF', '#24222C'), ('#3B1A14', '#F3F1F8'), ('#8A5A44', '#E2B04A'), ('#B8A08E', '#4A4757'), ('#8E7466', '#9B97AD'), ('#D9C9AE', '#3A3846'), ('#FBF6EC', '#1E1D25'), ('#F3E3BC', '#3A3220'), ('#A87A44', '#E2B04A'), ('#7A4C38', '#E2B04A')]
c3 = dict(name='샘플 3 「먹밤 키움」 — 어두운 먹 바탕 · 짙은 카드 · 흰 글 · 금빛 강조 · 그림은 등불처럼', serif=SANS,
  bg='#16151C', card='#211F29', ink='#F3F1F8', sub='#9B97AD', muted='#6F6B82', acc='#E2B04A', pill='#2A2833', pilltx='#F3F1F8', bigbg='linear-gradient(90deg, #F0C766, #D6962E)', bigtx='#1B1A20',
  brandf=SANS, brandls='0', chip='#2A2833', b0='#3C4FB0', b1='#7A5AF0', b2='#178A80', b3='#55627A', b4='#9A4FA6', btx='#FFFFFF', nextbg='linear-gradient(90deg, #F0C766, #D6962E)', nexttx='#1B1A20',
  bar='#1B1A21', line='#2C2A35', menubg='#E2B04A', menufg='#1B1A20',
  sh1='0 1px 2px rgba(0, 0, 0, .3)', sh2='0 1px 2px rgba(0, 0, 0, .35), 0 8px 24px rgba(0, 0, 0, .35)', sh3='0 4px 10px rgba(0, 0, 0, .4), 0 14px 36px rgba(0, 0, 0, .5)',
  titles='#su .sj-h2, #su .sj-h2 .sj-brush { font-family: var(--sj-sans); font-weight: 900; color: #F3F1F8; }\n#su .sj-land { color: #E2B04A; }\n#su .sj-bw { color: #E2B04A; }\n')
s2 = base + block(c2)
s3 = base
for a, b in MAP3: s3 = s3.replace(a, b)
s3 += block(c3)
open(S + '/sample2.css', 'w', encoding='utf-8').write(s2)
open(S + '/sample3.css', 'w', encoding='utf-8').write(s3)
# 샘플 1 손질 — 큰 탭 누르는 곳 48 × 48
s1 = open(S + '/sample1.css', encoding='utf-8').read()
s1 = s1.replace("#su .sj-btab { display: inline-flex; align-items: center; min-height: 48px;", "#su .sj-btab { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; min-width: 48px;")
open(S + '/sample1.css', 'w', encoding='utf-8').write(s1)
print('ok', len(s2), len(s3))
