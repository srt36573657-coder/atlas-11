# ATLAS 밤하늘 옷 ② — 영상 중심색(색상 293도 · 남보라 밤하늘)으로 토큰 셈 + 대비 검사(tests/atlas11/palette.test.mjs 와 같은 기준 · 기준 숫자 그대로)
#   쓰는 법: python3 scripts/atlas11/design/night_violet/palette.py <폴더>   → <폴더>/palette.json(밝은 · 어두운 토큰 · 대비 표)
#   영상에서 그대로 가져온 색: 위 막대 #141738(색 있는 곳 1위 무리) · 위 막대 단추 #2F3152(전체 2위 무리) · 밤 바탕 #111433(전체 1위 무리)
import sys, json, math
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from okc import *
H_INK, H_TINT, H_ACC = 285, 292, 295
NIGHT, NIGHT2 = '#141738', '#2F3152'   # 영상 색 무리 1위(색 있는 곳 24%) · 전체 무리 2위(16.5%) — 그대로 씀
K = lambda L, C, h: oklch2hex(L, C, h)
light = {
  'bg': K(.94, .016, H_TINT), 'card': K(.987, .006, H_TINT), 'ink': K(.27, .055, H_INK), 'ink2': K(.37, .055, 288), 'sub': K(.48, .05, 290),
  'sep': K(.885, .022, H_TINT), 'fill': K(.942, .016, H_TINT),
  'up': '#B4232F', 'down': '#1F4FB5', 'up-ink': '#A41F2A', 'down-ink': '#1C47A3', 'warn': '#7D4C00',
  'fire-bg': K(.43, .09, H_ACC), 'fire-ink': K(.975, .008, H_TINT),
  'band': NIGHT, 'band-ink': K(.975, .01, H_TINT), 'band-sub': K(.84, .045, H_TINT), 'band-fill': NIGHT2,
}
light['link'] = light['ink']; light['seg-on'] = light['card']; light['bar'] = light['card']; light['eun'] = light['card']
dark = {
  'bg': '#111433', 'card': K(.255, .045, 283), 'ink': K(.95, .015, H_TINT), 'ink2': K(.88, .025, H_TINT), 'sub': K(.74, .045, H_TINT),
  'sep': K(.345, .04, 284), 'fill': K(.29, .04, 284),
  'up': '#FF5A66', 'down': '#5C97FF', 'up-ink': '#FF8088', 'down-ink': '#86B2FF', 'warn': '#FFB547',
  'fire-bg': K(.86, .05, H_ACC), 'seg-on': K(.315, .045, 284), 'bar': K(.19, .035, 280),
  'band': K(.275, .065, 278), 'band-ink': K(.95, .015, H_TINT), 'band-sub': K(.74, .045, H_TINT), 'band-fill': K(.345, .06, 279),
  'eun': K(.70, .09, H_ACC),
}
dark['link'] = dark['ink']; dark['fire-ink'] = dark['bg']
# 강조 하나(--geum · 밝은 · 어두운 같은 하나) — 영상 보라(색상 295도) · 닿는 바탕 모두 3:1 이상이 되는 밝기 범위의 가운데
need = [light[k] for k in ('band', 'bar', 'seg-on', 'card', 'bg')] + [dark[k] for k in ('band', 'bar', 'seg-on', 'card', 'bg')]
ok = []
for i in range(300, 900):
    L = i / 1000; c = K(L, .12, H_ACC)
    if all(contrast(c, b) >= 3.12 for b in need): ok.append(L)
assert ok, 'geum 범위 없음'
Lg = (ok[0] + ok[-1]) / 2; light['geum'] = dark['geum'] = K(Lg, .12, H_ACC)
# palette.test 와 같은 기준
rep, bad = [], []
for mode, t in (('light', light), ('dark', {**light, **dark})):
    for bg in ('bg', 'card'):
        for name, mn in (('ink', 7), ('ink2', 7), ('sub', 4.5), ('link', 4.5), ('up-ink', 4.5), ('down-ink', 4.5), ('warn', 4.5), ('up', 3), ('down', 3)):
            r = contrast(t[name], t[bg]); rep.append(f'{mode} {name}/{bg} {r:.2f}'); (r < mn) and bad.append(rep[-1])
    r = contrast(t['ink'], t['fill']); rep.append(f'{mode} ink/fill {r:.2f}'); (r < 7) and bad.append(rep[-1])
    for fg, bg, mn in (('band-ink', 'band', 7), ('band-sub', 'band', 4.5), ('band-ink', 'band-fill', 7), ('eun', 'band', 3), ('fire-ink', 'fire-bg', 7), ('geum', 'band', 3), ('geum', 'bar', 3), ('geum', 'seg-on', 3), ('geum', 'card', 3), ('geum', 'bg', 3)):
        r = contrast(t[fg], t[bg]); rep.append(f'{mode} {fg}/{bg} {r:.2f}'); (r < mn) and bad.append(rep[-1])
    two, raised = contrast(t['band'], t['bg']), contrast(t['card'], t['bg']); need2 = 1.5 if mode == 'light' else raised
    rep.append(f'{mode} band/bg {two:.2f} (card/bg {raised:.2f})'); (two < need2) and bad.append(rep[-1])
print('geum L 범위', ok[0], ok[-1], '→', round(Lg, 3), light['geum'])
print('LIGHT', json.dumps(light)); print('DARK', json.dumps(dark))
print('BAD', bad)
json.dump({'light': light, 'dark': dark, 'report': rep}, open(sys.argv[1] + '/palette.json', 'w'), indent=1)
