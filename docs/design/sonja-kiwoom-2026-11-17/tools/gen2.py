import sys
S = sys.argv[1]
s1 = open(S + '/sample1.css', encoding='utf-8').read()
s2 = open(S + '/sample2.css', encoding='utf-8').read()
s3 = open(S + '/sample3.css', encoding='utf-8').read()
s1 += '''
/* 샘플 1 손질(참모 토론) — 안 고른 탭 진하게 · 지금 탭 밑줄 · 메뉴 열면 뒤가 어두워지고 「닫기」 · 꾀 도장 채움 */
#su .sj-btab { color: #6E6A7E; }
#su .sj-btab.sj-bcur { color: #1C1B22; box-shadow: inset 0 -4px 0 #1C1B22; }
#su .sj-menu[open]::before { content: ""; position: fixed; inset: 0; background: rgba(20, 18, 30, .38); z-index: -1; }
#su .sj-menu[open] > summary b { font-size: 0; }
#su .sj-menu[open] > summary b::after { content: "닫기"; font-size: 1.0625rem; }
#su .sj-dk { gap: 10px; }
#su .sj-ph .sj-seal-big { background: #6A4CF0; color: #FFFFFF; border: 0; }
'''
s2 += '''
/* 샘플 2 「한지 키움 · 엄지는 멈춤」(참모 11명 가운데 고른 판) — 위 큰 탭 넷(오늘 · 꾀 · 일지 · 정산) · 아래는 막대 하나(멈춤 · 듣기 · 다음) · 아래 탭 · 메뉴 겹침 0
   키움 「주문」 엄지 자리에 「멈춤」 — 손길은 같고 뜻은 반대 · 먹과 밤색만(남빛 단추 0) · 꾀 도장 밤색으로 채움 · 찾기 한 번 */
#su .sj-menu { display: none; }
#su .sj-btab:nth-child(3) { display: none; }
#su .sj-btab { color: #7C6556; }
#su .sj-btab.sj-bcur { color: #3B1A14; box-shadow: inset 0 -4px 0 #3B1A14; }
#su .sj-top:has(.sj-search) .sj-find { display: none; }
#su .sj-bigtext { background: #3B1A14; color: #FBF6EE; }
#su .sj-tabs { left: max(10px, env(safe-area-inset-left, 0px)); right: auto; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); width: 84px; padding: 0; display: block; background: transparent; border: 0; z-index: 32; }
#su .sj-tab { display: none; }
#su .sj-tab:nth-child(3) { display: flex; flex-direction: column; gap: 4px; width: 84px; min-height: 66px; border-radius: 16px; background: #3B1A14; color: #FBF6EE; font-size: 1.25rem; font-weight: 900; }
#su .sj-tab:nth-child(3)::before { content: ""; width: 16px; height: 16px; border: 3px solid #FBF6EE; border-radius: 3px; }
#su .sj-dock { bottom: 0; min-height: 86px; align-content: center; padding-left: calc(106px + env(safe-area-inset-left, 0px)); padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)); }
#su .sj-dk { gap: 10px; }
#su .sj-next { background: #8A5A44; color: #FBF6EE; }
#su .sj-ph .sj-seal-big { background: #8A5A44; color: #FBF6EE; border: 0; }
html.sj-on #su { padding-bottom: calc(110px + env(safe-area-inset-bottom, 0px)); }
'''
s3 = s3.replace('#6B4A3E', '#C9BFB8')
s3 += '''
/* 샘플 3 「먹밤 · 네 막 칩」 — 길은 아래 엄지 줄 하나(위 큰 탭 없음) · 엄지 자리 금빛 「멈춤」 · 꾀 쪽 영화 밑 네 막 칩(지금 막만 금빛 · 그 막 글 한 줄) · 금빛은 멈춤 · 지금 막 · 제목에만 */
#su .sj-btabs { display: none; }
#su .sj-menu { display: none; }
#su .sj-art { filter: invert(.88) hue-rotate(180deg); }
#su .sj-seal-dn { background: #3E5490; }
#su .sj-bigtext, #su .sj-next { background: #2A2833; color: #F3F1F8; box-shadow: inset 0 0 0 1.5px #4A4757; }
#su .sj-tabs { grid-template-columns: repeat(4, minmax(0, 1fr)); }
#su .sj-tab:nth-child(3) { position: fixed; left: max(8px, env(safe-area-inset-left, 0px)); bottom: calc(6px + env(safe-area-inset-bottom, 0px)); width: 76px; min-height: 58px; flex-direction: column; border-radius: 14px; background: #E2B04A; color: #1B1A20; font-weight: 900; }
#su .sj-tab:nth-child(3).sj-cur { background: #E2B04A; color: #1B1A20; }
#su .sj-dk { gap: 10px; }
#su .sj-ph .sj-seal-big { background: #3A3220; color: #E2B04A; border: 0; }
@media (prefers-reduced-motion: no-preference) {
  #su .sj-kfig ol.sj-story { position: relative; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding-bottom: 104px; }
  #su .sj-kfig ol.sj-story > li { display: block; padding: 0; border: 0; background: none; }
  #su .sj-kfig .sj-actt { display: flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 999px; box-shadow: inset 0 0 0 1.5px #4A4757; color: #F3F1F8; font-size: 1.0625rem; }
  #su .sj-kfig .sj-actb { position: absolute; left: 0; right: 0; bottom: 0; min-height: 92px; box-sizing: border-box; padding: 12px 16px; border-radius: 16px; background: #2A2833; color: #F3F1F8; font-size: 1.1875rem; opacity: 0; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li { animation: none; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li .sj-actt { animation: sj-chip1 22s linear 0s 1 both; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(2) .sj-actt { animation-name: sj-chip2; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(3) .sj-actt { animation-name: sj-chip3; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(4) .sj-actt { animation-name: sj-chip4; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li .sj-actb { animation: sj-txt1 22s linear 0s 1 both; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(2) .sj-actb { animation-name: sj-txt2; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(3) .sj-actb { animation-name: sj-txt3; }
  #su .sj-kfig svg.ik-play ~ ol.sj-story > li:nth-child(4) .sj-actb { animation-name: sj-txt4; }
}
@keyframes sj-chip1 { 0% { background: #E2B04A; color: #1B1A20; } 24.9% { background: #E2B04A; color: #1B1A20; } 25% { background: transparent; color: #F3F1F8; } 100% { background: transparent; color: #F3F1F8; } }
@keyframes sj-chip2 { 0% { background: transparent; color: #F3F1F8; } 24.9% { background: transparent; color: #F3F1F8; } 25% { background: #E2B04A; color: #1B1A20; } 55.4% { background: #E2B04A; color: #1B1A20; } 55.5% { background: transparent; color: #F3F1F8; } 100% { background: transparent; color: #F3F1F8; } }
@keyframes sj-chip3 { 0% { background: transparent; color: #F3F1F8; } 55.4% { background: transparent; color: #F3F1F8; } 55.5% { background: #E2B04A; color: #1B1A20; } 83.1% { background: #E2B04A; color: #1B1A20; } 83.2% { background: transparent; color: #F3F1F8; } 100% { background: transparent; color: #F3F1F8; } }
@keyframes sj-chip4 { 0% { background: transparent; color: #F3F1F8; } 83.1% { background: transparent; color: #F3F1F8; } 83.2% { background: #E2B04A; color: #1B1A20; } 100% { background: #E2B04A; color: #1B1A20; } }
@keyframes sj-txt1 { 0% { opacity: 1; } 24.9% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }
@keyframes sj-txt2 { 0% { opacity: 0; } 24.9% { opacity: 0; } 25% { opacity: 1; } 55.4% { opacity: 1; } 55.5% { opacity: 0; } 100% { opacity: 0; } }
@keyframes sj-txt3 { 0% { opacity: 0; } 55.4% { opacity: 0; } 55.5% { opacity: 1; } 83.1% { opacity: 1; } 83.2% { opacity: 0; } 100% { opacity: 0; } }
@keyframes sj-txt4 { 0% { opacity: 0; } 83.1% { opacity: 0; } 83.2% { opacity: 1; } 100% { opacity: 1; } }
'''
open(S + '/sample1b.css', 'w', encoding='utf-8').write(s1)
open(S + '/sample2b.css', 'w', encoding='utf-8').write(s2)
open(S + '/sample3b.css', 'w', encoding='utf-8').write(s3)
print('ok')
