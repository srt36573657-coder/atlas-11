import {RollingPage} from './rolling';
import {Factor36Audit,Factor36Math} from './factor36';
import {CompletionStatus,CompletionDailyReport} from './completion-status';
import {validateWaveBundle} from '../lib/wave-bundle.mjs';
import {WaveReason,WaveScore,WaveMath} from './news-wave';
import {ForecastPulse} from './forecast-pulse';
import {EqualStartPage} from './equal-start';
import {focusReading} from "../lib/focus-reading.mjs";
import {SealedStudyPanel} from "./sealed-study";
import {BreakingWorkbench} from "./breaking";
import {EvolutionWorkbench} from "./evolution";
import {StockPicker,NewsWorkbench,ScoreWorkbench,AccountPanel,useAccount,rankedStocks} from "./workbench";
import {CyclePanel,CycleWorkbench} from './cycles';
import {mergeFomoRecords} from '../lib/fomo-records.mjs';
import {mergeFomoInput} from '../lib/fomo-input.mjs';
import {PriceStory,StockTrendChart,ChartReadingPanel} from './insights';
import {FomoPanel} from './fomo';
import {DailyMovementReason} from './movement';
import {forecastSummary} from '../lib/graph-explanation.mjs';
import {buildSmartGuide,filterStocks,matchesLens,readWatchlist,saveWatchlist} from '../lib/smart-view.mjs';
import {researchCoverage} from '../lib/researched-news.mjs';
import React, { useEffect, useMemo, useRef, useState, useId, useCallback } from "react";
import {
  evaluateForecast,
  validateInput,
  eligibleOrigins,
  checkForecast,
} from "../lib/news-engine.mjs";
import { buildStory, newPlayer, advancePlayer, displayRow } from "../lib/story.mjs";
import { calendarDates, dateRows, buildDailyExplanation } from "../lib/daily-explanation.mjs";
import { DAILY_VIEW, calendarPosition, isPlottablePrice } from "../lib/daily-view-contract.mjs";
import { scopeOf, scopeLabel, scopeCounts, scopeErrors, appliesTo, normalizeEvent } from "../lib/news-scope.mjs";
import { initialState } from "../lib/service.mjs";
import { evidenceStatus } from "../lib/evidence.mjs";
import { api, localLoad, localAction, download, registerDisplayBundle, loadFullLocalState } from "./storage.mjs";
const pct = (v: any, d = 1) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${(v * 100).toFixed(d)}%`;
const probability = (v: any) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
const money = (v: any) =>
  v == null ? "—" : Math.round(v).toLocaleString("ko-KR");
const day = (d: string) => d?.slice(5, 10).replace("-", "/") ?? "—";
const stamp = (d: string) =>
  d
    ? new Date(d).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour12: false,
      })
    : "—";
const tone = (n: number) => (n > 0 ? "up" : n < 0 ? "down" : "");
const colors = ["#e2c078", "#ff9695", "#9dbfff", "#dab0ef", "#9cd6bd"];
const tabs = [
  ["rolling", "오늘 전망"],
  ["graphs", "이전 종목 기록"],
  ["race", "이전 1만원"],
  ["news", "뉴스"],
  ["score", "성적"],
  ["evolution", "진화"],
];
const primaryTab = (tab:string) => tab==='watch'?'graphs':tab==='breaking'?'news':tab;

function NavSymbol({name}:{name:string}){const paths:Record<string,string>={breaking:'M13 2 5 14h6l-1 8 9-13h-6Z',evolution:'M4 18h16M5 14l4-5 4 3 6-8M15 4h4v4',graphs:'M4 18V6m0 12h16M7 12l4-3 4 5 5-3',watch:'m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9Z',news:'M5 4h14v16H5ZM8 8h8M8 12h8M8 16h5',score:'M4 20h16M7 16v-5m5 5V4m5 12V8',math:'M6 5h12M6 19h12M17 5 9 12l8 7',data:'M4 6h6l2 3h8v11H4Z'};return <svg className="nav-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]??paths.data}/></svg>;}
const equations = [
 ["조건부 수익률", "zₜ=(평균 rₜ₋₅:ₜ, 평균 rₜ₋₂₀:ₜ, 평균 rₜ₋₆₀:ₜ); mᵢ,ₜ=Σwₖ(aₖ+βₖ·zᵢ,ₜ)", "자기 종목 가격으로 무변화·축소 평균·릿지 후보를 비교합니다. 계수와 가중치는 9/17 이전 6개 시간순 구간으로 정하고 고정합니다. 새 실제 종가는 특징값을 갱신합니다. 뉴스 방향 유보가 종목 전체 수익률 0을 뜻하지 않습니다. 독립 예측력은 미입증입니다."],
 ["계수와 가중치", "β=(ZᵀZ+λnI)⁻¹Zᵀ(r−a); a=Σr/(n+252); wₖ∝exp[−(Lₖ−Lmin)/L₀]", "자기 종목의 5·20·60일 수익률 특징을 사용합니다. λ는 0.1·1·10이고 불안정 계수는 제외합니다. 1·5·20일 누적 로그수익률 오차를 사용하며, 같은 검증 구간으로 고른 성적을 실전 정확도로 표시하지 않습니다."],
 ["실제 결과 기록", "오차원=실제−당시예측; 절대오차율=|실제−당시예측|/실제", "예측을 덮어쓰지 않고 전망 ID·가격 원본·계산식 버전으로 비교합니다. 가격·방향·범위를 따로 기록하고 확인된 문제·추정 원인·미확인을 구분합니다. 가격 정정은 새 기록으로 추가합니다."],
 ["1. 뉴스 적용 범위", "Aᵢ,ₑ = 시장 공통 / 지수 대상 코드 / 업종 일치 / 기업 코드 일치", "대상이 맞을 때만 반응을 계산합니다. 지수 뉴스는 구성 대상의 출처·공개 시각·적용 기간도 검사합니다. 전체라는 값만으로 기업 뉴스를 52종목에 연결하지 않습니다."],
 ["2. 시간과 근거 소거", "Gₑ = 1[공개 시각≤기준] × 1[반영일∈예측 거래일] × 1[출처·상태·대상 유효]", "미래 정보, 동일 사건 중복, 철회, 잘못된 범위를 제외합니다. 저장한 일정 수정은 당시 버전으로 되돌려 검사합니다. 미국 발표는 한국의 다음 거래일로 연결합니다."],
 ["3. 해당 종목의 과거 반응", "xᵢ,ₑ,ₖ = ln(Pᵢ,τ/Pᵢ,τ−1) − 평균(직전 20일 로그수익률)", "같은 종류·같은 범위에서 이 종목에 연결되는 과거 사건만 사용합니다. 다른 종목만의 사건은 표본을 지우지 않습니다. 직전 20거래일이 끊기면 유보합니다. 급락을 크기만으로 지우지 않습니다. 일별 연관 반응이며 인과 효과의 증명이 아닙니다."],
 ["4. 연구용 방향 계수 소거", "mₖ=k/(k+8)·평균(x₁…xₖ); λ∈{0,¼,½,1}; Lλ=평균|xₖ₊₁−λmₖ|", "과거 반응 5건은 연구용 계산을 시작하는 최소 조건이며 정밀도 인증이 아닙니다. 시간순 검증 3회 이상에서 λ=0보다 MAE·CRPS·Brier가 모두 나쁘지 않은 방향 계수만 남깁니다. 계수 선택용 검사이며 독립적인 예측력 입증이 아닙니다. 하락 경로를 없애지 않습니다."],
 ["5. 종목별 뉴스 값", "wλ∝exp[−4(Lλ−Lmin)/max(L₀,10⁻⁸)]; μᵢ,ₑ=Σwλ·λ·n/(n+8)·평균(x)", "각 종목의 표본·계수·평균 반응·하단·상단을 따로 저장합니다. 혼합 계수의 세 손실을 다시 검사합니다. 방향 근거가 약하면 μ=0, 표본 부족이면 뉴스 계산 제외입니다."],
 ["6. 일반일 변동", "εᵇᵢ,ₜ=rᵢ,D−평균(rᵢ,일반일)", "먼저 같은 과거 일반일을 뽑아 동반 움직임을 유지합니다. 그날이 특정 종목의 고유 사건일이면 그 종목만 자기 일반일로 다시 뽑습니다. 무관한 종목의 뉴스가 이 표본을 바꾸지 않습니다."],
 ["7. 뉴스 몬테카를로", "Rᵇᵢ,ₜ=mᵢ,ₜ + [유효 단일 뉴스일: xᵢ,ₑ,J−평균(xᵢ,ₑ)+μᵢ,ₑ / 그 외: εᵇᵢ,ₜ]", "일반일 변동과 뉴스의 하루 반응을 중복 합산하지 않습니다. 가격 영향 검토 후보 여러 개가 같은 종목·같은 날에 겹치면 결합 근거 부족으로 유보합니다. 설명용 일정은 별도 겹침 주의로 남깁니다. 공동 과거 사건 날짜가 해당 종목에 없으면 자기 표본으로 돌아갑니다."],
 ["8. 가격과 모의 상승 비중", "Pᵇᵢ,ₜ=Pᵇᵢ,ₜ₋₁·exp(Rᵇᵢ,ₜ); 중앙값=Q₀.₅; 범위=[Q₀.₁,Q₀.₉]; p=평균 1[Pᵇ>P출발]", "기본 20,000경로입니다. 첫 거래일은 분포를 직접 합산합니다. 모의 상승 비중은 출발 가격을 넘는 경로 비율입니다. 실제 적중 확률이 아닙니다. SE=√[p(1−p)/B]는 모의 계산 오차일 뿐입니다. 목표 80% 범위도 실제 80%를 보장하지 않습니다."],
 ["9. 분포와 확률 채점", "CRPS(F,y)=평균|X−y|−½평균|X−X′|; BS=평균(p−1[y>0])²", "가격 평균 오차만으로 선택하지 않고 분포·확률도 평가합니다. 보관된 감사는 이전 v6의 과거 자료 재진단이며 v8의 예측력 인증이 아닙니다. 같은 날 종목을 묶고 겹치지 않는 기간을 따로 채점합니다. 모형을 감사 결과에 맞춰 다시 조정하지 않습니다."],
 ["10. 이전 보정의 오용 방지", "p보정=½+αₕ(p−½), αₕ∈{0,¼,½,¾,1}", "이전 v5에서 얻은 α를 v7에 이식하지 않습니다. 현재 α=1, 보정 없는 모의 경로 비율입니다. 보정을 했다는 사실만으로 신뢰할 확률이 되지 않습니다."],
 ["11. 이 종목에서 멈출 뉴스", "Iᵢ,ₑ=(|μᵢ,ₑ|+sd(xᵢ,ₑ))/max(σᵢ,10⁻⁸)", "해당 종목의 주요 경제 발표·I≥1인 뉴스에서 멈춥니다. 계산을 유보한 뉴스도 이유를 설명합니다. 중요도는 확률이 아닙니다."],
 ["12. 독립 재생과 기록 보존", "재생 중 cᵢ←다음 거래일; 뉴스 설명 중 Δcᵢ=0; j≠i이면 Δcⱼ=0", "하루 1초가 기본입니다. 휴장일은 직전 거래일 값을 참고 표시하며 새 종가를 만들지 않습니다. 재생·정지·속도·날짜는 종목마다 독립입니다. 다른 종목과 날짜·속도를 공유하지 않습니다. 재생은 계산값을 바꾸지 않으며 새 전망은 이전 버전을 보존합니다."],
 ["13. 기사 수와 독립 표본", "N_effective = (Σw)² / Σ(w²)", "기사 수를 채우지 않습니다. 같은 경제적 사건·날짜·반응 기간을 먼저 중복 제거합니다. 가중치가 한쪽에 몰리면 유효 표본 수가 줄며, 이 식만으로 시계열 상관이 없어지는 것은 아닙니다. 정해 둔 정밀도 조건과 별도 검증이 필요합니다."],
 ["14. 난수에 흔들리지 않는 모형 평균", "E[Pₜ] = P₀ × ∏ₛ Σⱼ wₛⱼ·exp(rₛⱼ)", "현재 모형의 하루 분포와 시간 독립 가정에서 평균을 직접 합산합니다. 난수 표본평균과 구분하며, 임의의 기울기나 곡선을 추가하지 않습니다. 식을 정확히 계산해도 미래 주가를 정확히 맞춘다는 뜻은 아닙니다."],
 ["15. 모형 가격 분산", "Var(Pₜ) = P₀² × ∏ₛ Σⱼ wₛⱼ·exp(2rₛⱼ) − E[Pₜ]²", "현재 모형에서 가격 분산도 직접 계산합니다. 화면의 중앙값·P10~P90은 모의 경로 요약입니다. 표본평균의 몬테카를로 오차와 실제 시장 예측 오차는 다릅니다."],
 ["16. 날짜별 화면값", "Vᵢ,d = 실제 종가 / 저장된 Q₀.₅ / 휴장일 직전 거래일 참고값", "9/17~10/30 전체 기간을 처음부터 표시합니다. 재생은 표시선과 설명 날짜만 이동시킵니다. 휴장일은 새 가격 행이나 캔들을 만들지 않습니다."],
 ["17. 날짜별 변화율", "Δᵢ,t = Pᵢ,t − Pᵢ,t−1; rᵢ,t = Pᵢ,t/Pᵢ,t−1 − 1", "실제 가격은 직전 실제 종가와, 모형 중앙값은 직전 모형 중앙값과 비교합니다. 평균·중앙값·뉴스 방향 계수는 구분하며, 하루 변화를 특정 뉴스의 인과적 기여율로 나누지 않습니다."],
 ["18. 종목·날짜 설명의 근거", "Eᵢ,d = {가격행ᵢ,d, 연결사건ᵢ,d, 자체표본ᵢ,e, 선택계수ᵢ,e, 출처ᵢ,e}", "같은 뉴스도 해당 종목의 표본·반응·계수·유보 이유를 설명합니다. 뉴스 없는 날과 근거 부족한 날도 따로 표시하며, 확인되지 않은 매출·비용 원인을 만들지 않습니다."],
 ["19. 사건일 분포와 평소 분포 비교", "ΔMᵢ,t = Mᵢ,t−1 × [exp(ℓevent) − exp(ℓordinary)], ℓ = log E[exp(R)]", "저장된 분포 안에서 사건일과 평소의 산술평균 차이를 계산합니다. 모형상의 비교이며 실제 뉴스 효과의 인과 추정이나 중앙값의 개별 뉴스 기여율이 아닙니다. 비교 분포가 없으면 계산하지 않습니다."],
];

function sourceHost(url:string){try{return new URL(url).hostname.replace(/^www\./,'');}catch{return '출처 확인';}}
function SourceLink({source:s,index=0}:any){return <a className="evidence-source" href={s.url} target="_blank" rel="noreferrer"><span>{s.name||`사건 출처 ${index+1}`} <i aria-hidden="true">↗</i></span><small>{sourceHost(s.url)} · 새 창</small></a>;}
function ReadingGuide(){return <details className="reading-guide"><summary>그래프 읽는 법</summary><div className="reading-guide-body"><p><b>흰 선은 실제 종가, 색상 선은 모형 중앙값.</b> 전망은 10월 30일까지 처음부터 전부 보입니다. 재생하면 날짜 표시와 그날의 설명이 움직입니다.</p><p>날짜 칸의 ●는 연결 일정입니다. 중요한 뉴스에서는 멈추며 ‘설명 확인 · 계속’으로 이어갑니다. P10~P90은 모형 안의 범위이며 실제 적중 확률이 아닙니다.</p><p>방향키로 날짜 칸을 살펴보고 Enter로 선택할 수 있습니다. Home / End는 처음 / 마지막 날짜로 이동합니다.</p></div></details>;}
function AtlasIntroduction({onOpen}:any) {
  return <section className="atlas-intro" aria-labelledby="atlas-purpose" data-atlas-intro>
    <div className="atlas-intro-copy">
      <p className="intro-eyebrow"><span className="intro-edition">ATLAS / 52</span> 뉴스 · 시나리오 · 검증</p>
      <h2 id="atlas-purpose"><span>근거로 전망하고,</span> <span>결과로 검증합니다.</span></h2>
      <p className="intro-description">52종목의 뉴스와 과거 주가 반응을 연결해, 날짜별 전망과 그 이유를 보여줍니다.</p><div className="intro-process" aria-label="아틀라스의 읽기 순서"><span><b>01</b> 뉴스의 근거</span><i aria-hidden="true">→</i><span><b>02</b> 날짜별 전망</span><i aria-hidden="true">→</i><span><b>03</b> 실제와 비교</span></div>
    </div>
    <div className="atlas-engraving" aria-hidden="true">
      <svg viewBox="0 0 180 132" fill="none" focusable="false">
        <g stroke="currentColor" transform="translate(88 66) rotate(-22)">
          <circle r="47"/><circle r="55" strokeDasharray="1 5" opacity=".45"/>
          <ellipse rx="23" ry="47"/><ellipse rx="40" ry="47" opacity=".5"/>
          <ellipse rx="47" ry="16"/><path d="M-47 0H47M0-47V47"/>
          <path d="M-40-24C-15-14 15-14 40-24M-40 24C-15 14 15 14 40 24" opacity=".6"/>
          <path d="M-64 0H-58M58 0H64M0-64V-58M0 58V64"/>
        </g>
        <path d="M149 19V31M143 25H155M24 94V102M20 98H28" stroke="currentColor"/>
        <circle cx="153" cy="97" r="2" fill="currentColor"/><circle cx="29" cy="32" r="1.5" fill="currentColor"/>
      </svg>
    </div>
    <button className="intro-open" onClick={onOpen}>아틀라스 소개 <span aria-hidden="true">↗</span></button>
  </section>;
}

function AtlasAbout({onGraphs,onValidation}:any) {
  return <article className="about-atlas" data-atlas-about>
    <p className="intro-eyebrow">ATLAS · 근거를 남기는 주가 연구</p>
    <p className="about-lead">시장 자료와 뉴스를 바탕으로 흐름을 계산하고,<br/>실제 결과로 그 예측을 검증하는 플랫폼.</p>
    <p>ATLAS는 52개 종목의 예정된 뉴스·공시와 과거 주가 반응을 연결해, 앞으로 가능한 가격 흐름을 날짜별로 보여줍니다. 종목을 선택하면 어떤 사건을 계산에 반영했는지, 왜 그런 전망이 나왔는지, 어떤 근거가 부족한지 확인할 수 있습니다.</p>
    <div className="about-principles">
      <section><span>01</span><h3>근거를 연결합니다</h3><p>시장·업종·기업의 뉴스 범위를 구분하고 해당 종목의 과거 반응을 살펴봅니다.</p></section>
      <section><span>02</span><h3>이유를 보여줍니다</h3><p>날짜를 누르면 계산에 반영한 사건과 수치, 판단을 유보한 이유를 확인합니다.</p></section>
      <section><span>03</span><h3>결과를 기록합니다</h3><p>최초 전망을 보존하고 실제 종가와 어디서 얼마나 어긋났는지 비교합니다.</p></section>
    </div>
    <p>처음 만든 전망을 보존하고 실제 종가와 비교하므로, 어디서 얼마나 틀렸는지도 기록으로 확인하는 것이 중요한 특징입니다. 목표는 이 기록을 바탕으로 예측 정확도를 높이는 것입니다.</p>
    <aside className="about-research-state"><b>현재는 연구용 단계입니다.</b><p>예측 성능은 아직 입증되지 않았습니다. 화면과 계산 기능은 구현했지만, 추가 자료의 가격 반영과 예측력 검증에는 해결할 과제가 남아 있습니다.</p></aside>
    <div className="about-actions"><button className="primary" onClick={onGraphs}>종목별 그래프 보기</button><button onClick={onValidation}>현재 검증 결과 보기</button></div>
  </article>;
}

function Modal({ title, children, onClose, fit = false, toolbar }: any) {
  const ref = useRef<HTMLDivElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const before = document.activeElement as HTMLElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const els = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex='-1'])",
          ) ?? [],
        ).filter(el=>{
          if(el.hasAttribute('tabindex')&&el.tabIndex<0)return false;
          for(let node:HTMLElement|null=el;node&&node!==ref.current;node=node.parentElement){
            if(node.hidden||node.hasAttribute('inert')||getComputedStyle(node).display==='none'||getComputedStyle(node).visibility==='hidden')return false;
            if(node.tagName==='DETAILS'&&!(node as HTMLDetailsElement).open){
              const summary=Array.from(node.children).find(child=>child.tagName==='SUMMARY');
              if(!summary?.contains(el))return false;
            }
          }
          return true;
        });
        const first = els[0],
          last = els.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, []);
  return (
    <div
      className={`backdrop ${fit ? "watch-backdrop" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`dialog ${fit ? "watch-dialog" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
      >
        <div className="dialog-title">
          <h2>{title}</h2>
          {toolbar}
          <button aria-label="닫기" onClick={onClose}>
            닫기 ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Chart({
  version,
  input,
  original,
  code,
  onSelect,
  mini = false,
  fitHeight = false,
  cursorDate,
  focusCodes = [],
  onDateSelect,
  showRange = false,
}: any) {
  const clipId = useId().replaceAll(":", "");
  const chartRef=useRef<HTMLDivElement>(null), [measuredWidth,setMeasuredWidth]=useState(mini?340:800), [measuredHeight,setMeasuredHeight]=useState(300);
  useEffect(()=>{
    const el=chartRef.current;if(!el||typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(([entry])=>{if(entry.contentRect.width>0)setMeasuredWidth(Math.max(100,Math.round(entry.contentRect.width)));if(fitHeight&&entry.contentRect.height>0)setMeasuredHeight(Math.max(100,Math.round(entry.contentRect.height)));});
    observer.observe(el);return ()=>observer.disconnect();
  },[]);
  const [hover, setHover] = useState<number | null>(null);
  const dates = calendarDates(input.origin, input.end),
    chosen = code
      ? version.assets.filter((a: any) => a.code === code)
      : version.assets;
  const W = measuredWidth,
    H = fitHeight ? measuredHeight : mini ? 235 : 400,
    L = mini ? 45 : 68,
    R = mini ? 12 : 25,
    T = 22,
    B = 35;
  const sources = new Map(
    input.assets
      .filter((a: any) => !code || a.code === code)
      .map((a: any) => [
        a.code,
        new Map(a.prices.map((p: any) => [p.date, p.close])),
      ]),
  );
  const actual = (c: string, d: string) =>
    (sources.get(c) as Map<string, number>)?.get(d);
  const base = (a: any) => actual(a.code, input.origin) ?? a.originPrice;
  const ret = (a: any, p: number) => p / base(a) - 1;
  const val = chosen.flatMap((a: any) => [
    ...a.rows.flatMap((r: any) =>
      (code && showRange ? [r.p10, r.p50, r.p90] : [r.p50]).filter(isPlottablePrice).map((price:number)=>ret(a,price)),
    ),
    ...dates
      .filter((d: string) => actual(a.code, d) != null)
      .map((d: string) => ret(a, actual(a.code, d))),
  ]);
  const finiteValues = val.filter(Number.isFinite);
  const lo = Math.min(0, ...finiteValues),
    hi = Math.max(0, ...finiteValues),
    pad = Math.max(0.002, (hi - lo) * 0.09);
  const x = (d: string) =>
      L + calendarPosition(d, input.origin, input.end) * (W - L - R),
    y = (v: number) => T + ((hi + pad - v) / (hi - lo + 2 * pad)) * (H - T - B);
  const path = (a: any, rows: any[], field: string) => {
    let pen = false;
    return rows
      .map((r) => {
        const v = r[field];
        if (!isPlottablePrice(v)) {
          pen = false;
          return "";
        }
        const d = `${pen ? "L" : "M"}${x(r.date)},${y(ret(a, v))}`;
        pen = true;
        return d;
      })
      .join(" ");
  };
  const leaders: string[] = [];
  const cursor = cursorDate ?? version.end;
  const events = version.eventGate.accepted.filter(
    (e: any) => !code || chosen.some((a:any)=>a.news.some((p:any)=>p.id===e.id)),
  );
  return (
    <div className="chart-wrap" ref={chartRef} data-full-horizon={input.end} data-range-visible={String(showRange)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          code
            ? `${chosen[0]?.name} 실제 가격과 모형 시나리오`
            : `52종목의 실제 가격과 모형 시나리오`
        }
        onClick={(e) => {
          if (!onDateSelect) return;
          const b = e.currentTarget.getBoundingClientRect();
          if (!b.width) return;
          const i = Math.max(0, Math.min(dates.length-1, Math.round(((((e.clientX-b.left)/b.width)*W-L)/(W-L-R))*(dates.length-1))));
          onDateSelect(dates[i]);
        }}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          if (mini) return;
          const b = e.currentTarget.getBoundingClientRect();
          if (!b.width) return;
          setHover(
            Math.max(
              0,
              Math.min(
                dates.length - 1,
                Math.round(
                  ((((e.clientX - b.left) / b.width) * W - L) / (W - L - R)) *
                    (dates.length - 1),
                ),
              ),
            ),
          );
        }}
      >
        <title>9월 17일 종가 대비 변화 · 실제와 모형 중앙값 · {cursor}</title>
        <defs><clipPath id={clipId}><rect className="reveal-clip" x={L-2} y={T-8} data-entire-period="true" width={Math.max(3,W-L-R+4)} height={H-T-B+16}/></clipPath></defs>
        {Array.from(
          { length: mini ? 3 : 5 },
          (_, i) => lo + ((hi - lo) * i) / (mini ? 2 : 4),
        ).map((v, i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end">
              {pct(v, hi-lo<0.1 ? 2 : 1)}
            </text>
          </g>
        ))}
        {[dates[0], dates[Math.floor(dates.length / 2)], dates.at(-1)].map(
          (d: string) => (
            <text key={d} x={x(d)} y={H - 8} textAnchor="middle">
              {day(d)}
            </text>
          ),
        )}
        {events.map((e: any) => (
          <g key={e.id}>
            <line
              x1={x(e.targetDate)}
              x2={x(e.targetDate)}
              y1={T}
              y2={H - B}
              stroke="var(--chart-event)"
              strokeDasharray="2 5"
            />
            <circle cx={x(e.targetDate)} cy={T - 8} r={3} fill="var(--chart-forecast)">
              <title>
                {day(e.targetDate)} {e.name}
              </title>
            </circle>
          </g>
        ))}
        {[...chosen]
          .sort(
            (a: any, b: any) =>
              Number(leaders.includes(a.code)) -
              Number(leaders.includes(b.code)),
          )
          .map((a: any) => {
            const c = code
              ? (focusCodes.includes(a.code) ? colors[1] : colors[0])
              : (colors[leaders.indexOf(a.code)] ?? "#cbd4e1");
            const cursorRow = a.rows.filter((r:any)=>r.date<=cursor).at(-1);
            const lastActual = dates.filter((d:string)=>d<=cursor && actual(a.code,d)!=null).at(-1);
            const pointPrice = input.calendar.sessions.includes(cursor) ? (cursorRow?.p50 ?? (lastActual ? actual(a.code,lastActual) : null)) : null;
            return (
              <g key={a.code} clipPath={`url(#${clipId})`}>
                {code && showRange && (
                  <polygon
                    points={a.rows.filter((r:any)=>isPlottablePrice(r.p90)&&isPlottablePrice(r.p10))
                      .map((r: any) => `${x(r.date)},${y(ret(a, r.p90))}`)
                      .concat(
                        [...a.rows].filter((r:any)=>isPlottablePrice(r.p90)&&isPlottablePrice(r.p10))
                          .reverse()
                          .map((r: any) => `${x(r.date)},${y(ret(a, r.p10))}`),
                      )
                      .join(" ")}
                    fill="var(--chart-band)" fillOpacity={0.18}
                  />
                )}
                <path
                  data-forecast-code={a.code}
                  data-cursor-date={cursor}
                  data-forecast-start={a.rows[0]?.date}
                  data-forecast-end={a.rows.at(-1)?.date}
                  d={path(a, a.rows, "p50")}
                  stroke={c}
                  strokeWidth={code || focusCodes.includes(a.code) || leaders.includes(a.code) ? 2.8 : 1}
                  fill="none"
                />
                <path
                  d={path(
                    a,
                    dates.map((d: string) => ({
                      date: d,
                      actual: actual(a.code, d),
                    })),
                    "actual",
                  )}
                  stroke={code ? "var(--chart-actual)" : c}
                  strokeWidth={code ? 2.5 : 1.5}
                  fill="none"
                  data-actual-code={a.code}
                />
                {pointPrice != null && (code || leaders.includes(a.code)) && <circle className="current-dot" cx={x(cursor)} cy={y(ret(a,pointPrice))} r={3.5} fill={c}/>} 
                {!code && onSelect && (
                  <path
                    d={path(a, a.rows, "p50")}
                    stroke="transparent"
                    strokeWidth={12}
                    fill="none"
                    onClick={() => onSelect(a.code)}
                  >
                    <title>
                      {a.name} {pct(a.score)}
                    </title>
                  </path>
                )}
              </g>
            );
          })}
        <line className="play-cursor" x1={x(cursor)} x2={x(cursor)} y1={T} y2={H-B} stroke="var(--chart-cursor)" strokeWidth="1" />
        {hover != null && (
          <line
            x1={x(dates[hover])}
            x2={x(dates[hover])}
            y1={T}
            y2={H - B}
            stroke="var(--chart-hover)"
          />
        )}
      </svg>
      {!mini && (
        <div className="chart-legend">
          <span>━ 실제 종가</span>
          <span>┄ 모형 중앙값 · 판단 유보</span>
          {code && <span>{showRange ? "■ P10~P90 범위 표시" : "가격 흐름 확대 · 범위 보기 선택 가능"}</span>}
          <span>● 뉴스 일정 표시일</span>
          <span>9/17 종가 = 0%</span>
        </div>
      )}
      {hover != null && !mini && (
        <div className="hover-card">
          <b>{dates[hover]}</b>
          {chosen
            .filter((a: any) => code || leaders.includes(a.code))
            .map((a: any) => {
              const r = a.rows.find((r: any) => r.date === dates[hover]);
              return (
                <div key={a.code}>
                  {a.name}
                  <strong>
                    {r ? money(r.p50) + "원" : (input.calendar.sessions.includes(dates[hover]) ? "예측 출발 전" : "휴장일")} · 실제{" "}
                    {money(actual(a.code, dates[hover]))}
                  </strong>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
function NewsCard({ e, profile, assessment: suppliedAssessment, expanded = false }: any) {
  const assessment = suppliedAssessment ?? profile?.evidenceAssessment;
  const evidenceLabel = assessment?.classification === "price_evidence_candidate" ? "가격 영향 검토 후보" : assessment?.classification === "context_only" ? "설명용 일정 · 가격 계산 제외" : assessment ? "가격 근거 판단 유보" : "확인된 일정 · 가격 효과 미검증";
  const releaseTime = e.releaseTime ?? e.eventTime ?? e.reviewEvidence?.eventLocalTime?.match(/(?:T|^)(\d{2}:\d{2})/)?.[1];
  const timeZone = e.timeZone ?? e.timezone ?? e.reviewEvidence?.eventTimezone;
  return (
    <article className="news-card">
      <div className="news-card-top">
        <span className="date-label">{day(e.targetDate ?? e.date)}</span>
        <div>
          <h3>{e.name}</h3>
          <p>{e.channel}</p>
        </div>
        <span className="pill">
          {scopeLabel(e)}
        </span>
      </div>
      {e.announcementDate && (
        <p className="muted">
          {['announced','completed'].includes(e.status)?'발표 확인일':e.id?.startsWith('REVIEW:')?(e.datePrecision==='month'?'적용월 시작 표시':'행사·정책일'):'현지 발표'} {e.announcementDate} {releaseTime ?? "시각 미지정"} ·{" "}
          {timeZone}
          <br />
          그래프 표시 거래일 {e.targetDate}
        </p>
      )}
      <p className="muted" data-news-evidence={assessment?.classification ?? "unassessed"}>{evidenceLabel}{assessment?.scheduleVerified ? " · 일정 확인" : ""} · 검증된 적중 확률 없음</p>
      {profile && (
        <>
          <div className="news-numbers">
            <div>
              <small>연구용 평균 반응</small>
              <b className={tone(profile.effect)}>{profile.used ? pct(profile.effect, 2) : "—"}</b>
            </div>
            <div>
              <small>하단 시나리오</small>
              <b>{profile.used ? pct(profile.downside, 2) : "—"}</b>
            </div>
            <div>
              <small>상단 시나리오</small>
              <b>{profile.used ? pct(profile.upside, 2) : "—"}</b>
            </div>
            <div>
              <small>과거 반응</small>
              <b>{profile.sampleCount}건</b>
            </div>
          </div>
          <p className="muted">
            {profile.used ? "연구용 모의 계산 · " + (profile.selection?.status??'3거래일 관측 파장 · 인과효과 미검증') : profile.reason} · 과거
            양의 반응 비율 {probability(profile.positiveFrequency)}. 미래 적중 확률이 아닙니다.
          </p>
          {assessment?.statisticalEligibility && <p className="muted">별도 정밀도 검사: {assessment.statisticalEligibility.eligibleForResearchEstimation ? "연구용 조건 충족 · 실전 검증 아님" : "아직 충족하지 못함"}. 일정 수와 가격 추정 근거를 구분합니다.</p>}
        </>
      )}
      <div className="source-links">
        {(e.sources ?? []).map((s: any, i: number) => (
          <SourceLink key={i} source={s} index={i}/>
        ))}
      </div>
      {profile?.selection && (
        <details open={expanded || undefined}>
          <summary>소거 결과·실제 과거 반응 보기</summary>
          <p className="muted">
            선택 검증 {profile.selection.folds}회 · 영향 계수{" "}
            {profile.selection.lambda.toFixed(3)} · 제외된 표본{" "}
            {profile.excluded.length}건
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>영향 후보</th>
                  <th>과거 검증 오차</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {profile.selection.candidates.map((m: any) => (
                  <tr key={m.lambda}>
                    <td>{m.lambda * 100}%</td>
                    <td>{pct(m.loss, 2)}</td>
                    <td>
                      {m.kept ? "유지" : "제외"} · {m.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sample-list">
            {profile.samples.map((s: any) => (
              <a href={s.source} key={s.date} target="_blank" rel="noreferrer">
                {s.date}{" "}
                <b className={tone(s.value)}>{pct(Math.expm1(s.value), 2)}</b>
              </a>
            ))}
          </div>
          {profile.excluded.length > 0 && (
            <p className="muted">
              {profile.excluded
                .map((x: any) => `${x.date} ${x.reason}`)
                .join(" / ")}
            </p>
          )}
        </details>
      )}
    </article>
  );
}
function ResearchNote({input,code}:any){
 const r=input.newsResearch?.assets?.find((r:any)=>r.code===code);if(!r)return null;
 return <details className="research-note" data-research-code={code}><summary>이 종목 조사 결과·출처</summary><p>{r.name}: {r.rechecks?.at(-1)?.note ?? r.rechecks?.at(-1)?.finding ?? r.note}</p><p>{r.researchBasis}</p><div className="source-links">{r.sources.map((v:any,i:number)=><a key={i} href={v.url} target="_blank" rel="noreferrer">조사 경로 {i+1} ↗</a>)}</div></details>;
}
function ResearchTable({input,version,onSelect}:any){
 const rows=researchCoverage(input,version);if(!rows.length)return null;const n=rows.filter((r:any)=>r.byScope.company+r.byScope.sector+r.byScope.index>0).length;
 return <details className="panel research-overview"><summary>52종목 조사 결과 — 관련 기업·업종 일정 {n}종목 연결</summary><p>참가 일정 확인과 실적·계약 결과 확인은 다릅니다. 기업 일정과 업종 관찰 일정을 구분합니다. 날짜 미확인 계획과 홈페이지 링크는 뉴스 건수에 포함하지 않습니다.</p><div className="research-table table-scroll"><table><thead><tr><th>종목</th><th>기업</th><th>업종</th><th>확인 내용</th></tr></thead><tbody>{rows.map((r:any)=><tr key={r.code}><td><button className="text-button" onClick={()=>onSelect(r.code)}>{r.name}</button></td><td>{r.byScope.company}</td><td>{r.byScope.sector}</td><td>{r.rechecks?.at(-1)?.note ?? r.rechecks?.at(-1)?.finding ?? r.note}</td></tr>)}</tbody></table></div>{input.newsResearch.pending?.map((r:any)=><p key={r.id}><b>{r.name}</b>: {r.note}</p>)}<a href="/downloads/NEWS_RESEARCH_52.md" download>52종목 확인 내역 받기</a></details>;
}
const pressPeriod=(o:any)=>({annual:'연간',half_year:'반기',daily:'하루',year_end_snapshot:'연말 종가',half_year_end_snapshot:'반기 말 종가',daily_snapshot:'해당일 종가'}[o.periodType]??o.periodType);
const pressNumber=(value:any,unit:string)=>Number.isFinite(value)?`${value>0&&(unit==='percent'||unit==='percentage_point')?'+':''}${value.toLocaleString('ko-KR',{maximumFractionDigits:4})}${unit==='KRW'?'원':unit==='point'?'p':unit==='percentage_point'?'%p':unit==='percent'?'%':''}`:'—';
function PressObservations({observations=[]}:any){
 return <div className="press-observations">{observations.map((o:any)=><article key={o.id} data-press-observation={o.id}>
  <div><b>{o.entity}</b><strong>{pressNumber(o.value,o.unit)}</strong></div>
  <p>{o.periodStart?`${o.periodStart} ~ `:''}{o.periodEnd} · {pressPeriod(o)}</p>
  <small>기사에 보고된 {o.metric==='price_return_pct'?'등락률':o.metric==='close_price'?'종가':'지수 종가'} · 일별 학습 표본으로 미사용</small>
  {o.availableAt&&<small>공개 기준 {stamp(o.availableAt)}</small>}
  <div className="source-links">{o.sourceUrls?.map((url:string,i:number)=><a key={url} href={url} target="_blank" rel="noreferrer">기사 원문 {i+1} ↗</a>)}</div>
 </article>)}</div>;
}
function PressHistoryPanel({report,asset,version,date,compact=false}:any){
 const row=report?.rows?.find((r:any)=>r.code===asset.code);
 if(!row)return null;
 const current=report.baselineId===version.id;
 const checks=row.priceChecks??[],warnings=checks.filter((c:any)=>c.status==='warn').length;
 if(compact)return <div className="press-compact" data-press-code={asset.code}><span>신문 직접 수치 {row.observations?.length??0}개</span><small>{!current?'현재 계산에 연결되지 않은 신문 자료':warnings?`가격 대조 차이 ${warnings}건 · 보정 0원`:'기사 근거 연결 · 가격 보정 0원'}</small></div>;
 return <section className="press-panel" data-press-detail={asset.code} data-press-baseline={report.baselineId} aria-label={`${asset.name} 신문 역사 자료`}>
  <div className="press-heading"><h4>신문에서 확인한 과거 수치</h4><span>근거 연결</span></div>
  {!current?<p className="press-result">선택한 과거 전망에는 이 조사 결과를 소급 반영하지 않습니다.</p>:<>
   <div className="press-effect" data-press-price-shift={row.effects?.priceShift??0}><b>10/30 중앙값 보정 {pressNumber(row.effects?.priceShift??0,'KRW')}</b><small>{date<=version.origin?'이 날짜의 실제 가격도 기사의 수치로 수정하지 않습니다.':'확보한 기사를 검토했지만 가격을 바꿀 근거는 아직 부족합니다.'}</small></div>
   <p>{row.effects?.reason}</p>
  </>}
  <details open className="press-own"><summary>{asset.name} 직접 자료 {row.observations?.length??0}개</summary>
   {row.observations?.length?<PressObservations observations={row.observations}/>:<p>현재 묶음에서 이 회사의 직접 수치는 찾지 못했습니다. 다른 회사의 기사 수치로 채우지 않습니다.</p>}
  </details>
  <details className="press-checks"><summary>기사와 보관 가격 대조 {checks.length}건{warnings?` · 차이 ${warnings}건`:''}</summary>
   {!checks.length&&<p>기간과 대상을 맞춰 대조할 가격 자료가 없습니다.</p>}
   {checks.map((c:any)=><article key={c.observationId} data-press-check={c.status}>
    <div><b>{c.date} · {pressPeriod(c)}</b><span>{c.status==='pass'?'표시 수치 일치':c.status==='warn'?'차이 확인':'비교 자료 부족'}</span></div>
    <p>기사 {pressNumber(c.reported,c.unit==='percentage_point'?'percent':c.unit)} · 보관 가격 계산 {pressNumber(c.computed,c.unit==='percentage_point'?'percent':c.unit)}</p>
    <p>대조 차이 {pressNumber(c.difference,c.unit)}</p><small>{c.reason}</small>
   </article>)}
   <p className="muted">일치는 기사 표시 정밀도 안에서 수치가 맞았다는 뜻입니다. 제공자가 서로 독립적인지 확인한 검증은 아닙니다. 차이가 나면 원자료를 보존하고 자동 교체하지 않습니다.</p>
  </details>
  <details><summary>시장·업종 참고와 이 종목의 차이</summary>
   <p>시장 {report.counts?.marketObservations??0}개 · 업종 {report.counts?.sectorObservations??0}개 수치는 시장 전체의 참고 자료입니다. {asset.name}의 고유 반응 표본으로 세지 않습니다.</p>
   <p>ATLAS 업종: {asset.sector}. 기사 속 업종 지수와 이 종목의 공식적인 과거 대응 관계는 미확보입니다.</p>
   <p>연간·반기 등락률을 일별 수익률로 나누거나 반복 주기로 가정하지 않습니다.</p>
  </details>
  {current&&<p className="press-calculation-state">가격 계산 가중치 {row.effects?.liveWeight??0} · 추가 일별 학습 자료 {row.effects?.dailyTrainingRows??0}행 · 실제 신뢰 확률 미산정</p>}
 </section>;
}
function PressHistoryWorkbench({report,version}:any){
 const [sectorKey,setSectorKey]=useState('');
 if(!report)return null;
 const counts=report.counts??{},sectors=report.sectorSummary??[];
 const sector=sectors.find((s:any)=>`${s.indexFamily}:${s.entity}`===sectorKey)??sectors[0];
 return <section className="panel press-workbench" data-press-workbench>
  <div className="press-heading"><div><h3>10년 신문 자료 · 예측 근거에 연결</h3><p>기사 수, 수치 수, 실제 가격에 사용한 표본 수를 구분합니다.</p></div><span>가격 보정 {counts.live??0}/52</span></div>
  <div className="press-stats"><div><b>{counts.sources??0}개</b><small>기사</small></div><div><b>{counts.observations??0}개</b><small>기사 속 수치 · 독립 표본 아님</small></div><div><b>{counts.linkedCompanies??0}/{counts.assets??52}</b><small>직접 기업 수치 확보</small></div></div>
  <p>시장 {counts.marketObservations??0}개 · 업종 {counts.sectorObservations??0}개 · 기업 {counts.companyObservations??0}개. 기사와 보관 가격의 대조 결과는 일치 {counts.pricePass??0}건 · 차이 {counts.priceWarn??0}건 · 자료 부족 {counts.priceMissing??0}건입니다.</p>
  <p className="press-result">{report.baselineId===version.id?'현재 전망의 근거 검토에 반영했습니다. 가격 보정은 0원이며 기존 가격 곡선을 유지합니다.':'선택한 과거 전망에는 이 조사를 소급 반영하지 않습니다.'} 연간·반기 중심의 기사 수치만으로 일별 움직임이나 예측 정확도 개선을 입증할 수 없습니다.</p>
  <details><summary>시장 지수 · 연도별 실제 기사 수치</summary>
   <div className="press-context-grid">{report.marketSummary?.map((market:any)=><div key={market.entity}><h4>{market.entity}</h4><PressObservations observations={market.observations}/></div>)}</div>
  </details>
  <details><summary>업종 지수 · 참고 자료 보기</summary>
   <p>기사에 나온 업종의 등락률입니다. 현재 52종목에 공식적으로 대응시킨 자료는 아닙니다.</p>
   <label className="press-sector-select">업종 선택 <select value={sector?`${sector.indexFamily}:${sector.entity}`:''} onChange={e=>setSectorKey(e.target.value)}>{sectors.map((s:any)=><option key={`${s.indexFamily}:${s.entity}`} value={`${s.indexFamily}:${s.entity}`}>{s.indexFamily} · {s.entity}</option>)}</select></label>
   {sector&&<PressObservations observations={sector.observations}/>} 
  </details>
  <details><summary>52종목 연결·대조 상태</summary><div className="table-scroll"><table><thead><tr><th>종목</th><th>직접 수치</th><th>가격 대조</th><th>가격 보정</th></tr></thead><tbody>{report.rows?.map((r:any)=><tr key={r.code}><td>{r.name}<small>{r.code}</small></td><td>{r.observations?.length??0}개</td><td>{r.priceChecks?.length?`일치 ${r.priceChecks.filter((c:any)=>c.status==='pass').length} · 차이 ${r.priceChecks.filter((c:any)=>c.status==='warn').length} · 부족 ${r.priceChecks.filter((c:any)=>c.status==='missing').length}`:'직접 비교 없음'}</td><td>{pressNumber(r.effects?.priceShift??0,'KRW')}</td></tr>)}</tbody></table></div></details>
  <div className="press-downloads"><a href="/downloads/ATLAS_PRESS_HISTORY_10Y.md" download>기사 조사 내역 ↓</a><a href="/downloads/press_history_report.json" download>종목별 연결·대조 결과 ↓</a></div>
 </section>;
}
function DateGrid({rows,code,name,selected,onSelect}:any) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const rail=ref.current,active=rail?.querySelector<HTMLElement>('[aria-pressed="true"]');if(!rail||!active)return;const left=active.offsetLeft-rail.offsetLeft;if(left<rail.scrollLeft||left+active.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollLeft=Math.max(0,left-(rail.clientWidth-active.offsetWidth)/2);},[selected]);
  const keyboard=(e:React.KeyboardEvent<HTMLDivElement>)=>{const buttons=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('.date-cell')??[]),i=buttons.indexOf(e.target as HTMLButtonElement);if(i<0)return;const next=(e.key==='ArrowRight'||e.key==='ArrowDown')?Math.min(i+1,buttons.length-1):(e.key==='ArrowLeft'||e.key==='ArrowUp')?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;if(next<0)return;e.preventDefault();buttons[next]?.focus({preventScroll:true});const rail=ref.current,b=buttons[next];if(rail&&b)rail.scrollLeft=Math.max(0,b.offsetLeft-rail.offsetLeft-(rail.clientWidth-b.offsetWidth)/2);};
  return <div className="calendar-block"><div className="calendar-caption"><span>날짜를 눌러 이유 보기</span><span>● 연결 일정</span></div><div className="date-grid" ref={ref} role="group" aria-label={`${name} 날짜별 설명`} onKeyDown={keyboard}>
    {rows.map((r:any,i:number)=>{const change=r.kind==='actual'?r.actual?.change:r.kind==='forecast'?r.forecast?.p50Change:null;
      const label=r.kind==='holiday'?'휴장':r.kind==='missing'?'자료 없음':change?pct(change.rate,2):r.kind==='actual'?'실제':'출발';
      const monthStart=i===0||rows[i-1].date.slice(0,7)!==r.date.slice(0,7);
      return <React.Fragment key={r.date}>{monthStart&&<span className="calendar-month" aria-hidden="true">{Number(r.date.slice(5,7))}월</span>}<button className="date-cell" data-kind={r.kind} data-date={r.date} data-date-code={code} tabIndex={selected===r.date?0:-1} aria-pressed={selected===r.date} aria-label={`${name} ${r.date} ${label}${r.events.length?` · 연결 일정 ${r.events.length}건`:''} 설명`} onClick={()=>onSelect(r.date)}>
        <b>{day(r.date)}</b><small>{label}</small>{r.events.length>0&&<span className="date-event-dot" aria-hidden="true">●</span>}
      </button></React.Fragment>;
    })}
  </div></div>;
}
function DailyExplanation({asset,version,input,date}:any) {
  const explanation=useMemo(()=>buildDailyExplanation({asset,version,input,date}),[asset,version,input,date]);
  const f=explanation.forecast, actual=explanation.actual;
  const change=explanation.kind==='actual'?actual?.change:f?.p50Change;
  const eventParagraphs=new Set(explanation.events.flatMap((e:any)=>e.paragraphs));
  const ordinaryText=explanation.paragraphs.filter((text:string)=>!eventParagraphs.has(text));
  const source=input.assets.find((a:any)=>a.code===asset.code)?.priceSource;
  return <section className="daily-explanation" data-daily-code={asset.code} data-daily-date={date} data-daily-kind={explanation.kind} aria-label={`${asset.name} ${date} 예측 이유`}>
    <div className="explanation-heading"><span className="date-kind" data-kind={explanation.kind}>{explanation.kind==='actual'?'실제 관측':explanation.kind==='holiday'?'휴장일 참고':explanation.kind==='missing'?'자료 미확보':'모형 전망'}</span><time dateTime={date}>{date}</time></div><h3>{asset.name} · {day(date)}의 설명</h3>
    <div className="daily-values" role="group" aria-label="선택한 날짜의 가격과 변화">
      <div><span>{explanation.kind==='holiday'?'직전 거래일 참고값':explanation.kind==='actual'?'실제 종가':'모형 중앙값'}</span><b data-daily-price>{money(explanation.value)}원</b><small>{explanation.valueDate}</small></div>
      <div><span>{explanation.kind==='holiday'?'휴장일':'직전 거래일 대비'}</span><b className={change?tone(change.rate):''} data-daily-change>{change?pct(change.rate,2):'—'}</b><small>{change?`${change.amount>0?'+':''}${money(change.amount)}원`:'새로운 가격을 계산하지 않음'}</small></div>
      {f&&<><div><span>모형 평균</span><strong>{money(f.mean)}원</strong><small>{f.meanChange?`전일 평균 대비 ${pct(f.meanChange.rate,3)}`:'출발 가격'}</small></div><div><span>P10~P90 모형 범위</span><strong>{money(f.p10)}~{money(f.p90)}</strong><small>실제 적중 확률 미검증</small></div></>}
    </div>
    <p className="daily-event-count" data-daily-event-count={explanation.events.length}>이 날짜 연결 일정 {explanation.events.length}건 · 수치 반영 {explanation.events.filter((e:any)=>e.used).length}건 · 유보·설명 {explanation.events.filter((e:any)=>!e.used).length}건</p>
    <div className="daily-reason"><b>왜 이렇게 표시했나요?</b>{ordinaryText.map((text:string,i:number)=><p key={i}>{text}</p>)}</div>
    {explanation.events.map((e:any,i:number)=><article className="daily-event" key={e.id} data-daily-event={e.id}>
      <small>{i+1}/{explanation.events.length} · {e.route} · {e.used?'연구 계산 반영':'수치 영향 유보'}</small><h4>{e.title}</h4>
      {e.paragraphs.map((text:string,i:number)=><p key={i}>{text}</p>)}
      {!e.businessContext&&<p className="muted">이 회사의 매출·비용으로 연결되는 구체적 사업 경로는 확인 자료가 부족합니다. 위 설명은 {asset.name} 자체 가격 반응과 저장된 계산 기록을 근거로 합니다.</p>}
      {e.sources.map((s:any,i:number)=><p key={s.url}><SourceLink source={s} index={i}/>{s.publishedAt&&<small> · 공개 {s.publishedAt}</small>}</p>)}
      {e.sampleDates.length>0&&<details className="daily-calculation"><summary>이 종목의 비교 표본 날짜 {e.sampleDates.length}개</summary><p>{e.sampleDates.join(' · ')}</p><p>다른 종목의 표본을 해당 종목의 반응으로 사용하지 않습니다.</p></details>}
      {e.selection&&<details className="daily-calculation"><summary>방향 계수를 남기거나 제외한 이유</summary>{e.selection.candidates.map((c:any,i:number)=><p key={i}>λ={c.lambda??'—'} · {c.kept?'유지':'제외'} · {c.reason??'상세 근거 없음'}</p>)}</details>}
    </article>)}
    {source?.url&&<p className="muted"><a href={source.url} target="_blank" rel="noreferrer">{asset.name} 가격 자료 · {source.provider??'제공자'} ↗</a></p>}
    {change&&<details className="daily-calculation"><summary>날짜별 변화 계산식</summary><code>변화율 = (오늘 표시값 ÷ 직전 거래일 표시값 − 1) × 100</code><p>저장된 값을 사용하며 뉴스의 인과적 기여율로 해석하지 않습니다.</p></details>}
    <p className="daily-reason-state">방향 판단 유보 · 실제 신뢰 확률 미산정</p>
  </section>;
}
function StockClock({asset,version,input,player,onUpdate}:any) {
  const dates=useMemo(()=>input.calendar.sessions.filter((d:string)=>d>=input.origin&&d<=input.end),[input.origin,input.end,input.calendar]);
  const story=useMemo(()=>buildStory(version,asset.code),[version,asset.code]);
  useEffect(()=>{
    if(!player.playing||player.stop)return;
    const timer=setTimeout(()=>onUpdate(asset.code,(current:any)=>advancePlayer(current,dates,story)),player.speed);
    return ()=>clearTimeout(timer);
  },[player.playing,player.date,player.speed,player.stop,asset.code,dates,story,onUpdate]);
  return null;
}
function StockExplanation({asset:a,stop}:any) {
  return <div className="stock-explanation" role="status" data-news-stop={stop.date}>
    {stop.items.map((item:any)=>{const p=item.related.find((r:any)=>r.code===a.code)?.profile;if(!p)return null;return <article key={item.event.id}>
      <small>{scopeLabel(item.event)} · {day(item.event.targetDate)}</small><h4>{item.event.name}</h4>
      <p>{a.name}: {p.used?(Math.abs(p.effect??0)<0.0001?'이 뉴스의 추가 방향 효과는 유보했습니다. 종목 자체의 조건부 수익률과 발표일 분포는 따로 계산합니다.':`과거 자료에서 추정한 평균 반응 ${pct(p.effect,2)}를 반영합니다. 실제 상승·하락 판단은 유보합니다.`):p.reason}</p>
      {p.used&&<p>발표일 모형 범위 <b>{pct(p.downside)} ~ {pct(p.upside)}</b></p>}
      <p className="muted">이 종목의 과거 반응 {p.sampleCount}건 · {['announced','completed'].includes(p.status)?'발표 사실은 확인했지만 시장 예상 대비 차이·가격 영향은 미확인입니다.':'미래 발표 결과를 아는 것은 아닙니다.'}</p>
      <details><summary>이유와 출처</summary><p>{item.reason}. {item.event.channel}</p>{item.event.sources?.map((v:any,i:number)=><a key={i} href={v.url} target="_blank" rel="noreferrer">출처 {i+1} ↗ </a>)}<p>일별 반응에는 다른 요인이 섞일 수 있습니다. 과거 반응은 인과 효과나 적중 보장이 아닙니다.</p></details>
    </article>})}
    <p className="read-next"><span aria-hidden="true">Ⅱ</span> 그래프 아래 ‘설명 확인 · 계속’을 누르면 이어집니다.</p>
  </div>;
}
function SmartDates({rows,origin,date,onSelect}:any){
  const guide=useMemo(()=>buildSmartGuide(rows,origin,date),[rows,origin,date]);
  return <div className="smart-dates" data-smart-dates aria-label="이 종목 핵심 날짜">
    <button data-smart-jump="next" data-target-date={guide.next?.date} disabled={!guide.next} onClick={()=>onSelect(guide.next.date)} title={guide.next?.title??'선택 날짜 이후 연결 일정 없음'}><small>다음 연결 일정</small><b>{guide.next?day(guide.next.date):'남은 일정 없음'}</b><span>{guide.next?`${guide.next.events}건 · 수치 반영 ${guide.next.used}건`:'선택 날짜 이후 기준'}</span></button>
    <button data-smart-jump="change" data-target-date={guide.change?.date} disabled={!guide.change} onClick={()=>onSelect(guide.change.date)} title="전체 미래 구간의 중앙값 하루 변화 절댓값이 가장 큰 날. 뉴스의 인과 효과가 아닙니다."><small>중앙값 변화 최대</small><b>{guide.change?day(guide.change.date):'변화 없음'}</b><span>{guide.change?pct(guide.change.rate,2):'구별되는 모형 변화 없음'}</span></button>
    <button data-smart-jump="range" data-target-date={guide.range?.date} disabled={!guide.range} onClick={()=>onSelect(guide.range.date)} title="전체 미래 구간의 P90−P10 가격 폭이 가장 큰 날. 실제 적중 확률이 아닙니다."><small>모형 범위 최대</small><b>{guide.range?day(guide.range.date):'자료 없음'}</b><span>{guide.range?`${money(guide.range.lower)}~${money(guide.range.upper)}원`:'유효한 모형 범위 없음'}</span></button>
  </div>;
}
function StockCard({asset:a,version,input,original,player:p,onUpdate,onSelect,onFocus,onFomoImport,cycleReport,pressReport,focus=false,watched=false,onWatch}:any) {
  const dates=useMemo(()=>input.calendar.sessions.filter((d:string)=>d>=input.origin&&d<=input.end),[input.origin,input.end,input.calendar]);
  const story=useMemo(()=>buildStory(version,a.code),[version,a.code]);
  const [showRange,setShowRange]=useState(false);
  const [inspector,setInspector]=useState("reason");
  const [reasonOpen,setReasonOpen]=useState(false);
  useEffect(()=>{if(p.stop){setInspector("reason");setReasonOpen(true);}},[p.stop]);
  const reading=useMemo(()=>focusReading({asset:a,input,version,date:p.date}),[a,input,version,p.date]);
  const [readable,setReadable]=useState(false);
  const [commonScale,setCommonScale]=useState(false);
  const newsBody=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(newsBody.current)newsBody.current.scrollTop=0;},[p.date]);
  const forecastInfo=useMemo(()=>forecastSummary(a,version),[a,version]);
  const days=useMemo(()=>dateRows({asset:a,version,input}).filter((r:any)=>r.isSession),[a,version,input]);
  const currentExplanation=days.find((d:any)=>d.date===p.date);
  const row=displayRow(a,input,p.date), counts=scopeCounts(a.news),nextNews=a.news.filter((n:any)=>n.date>p.date).slice(0,3);
  const sessionIndex=Math.max(0,dates.filter((d:string)=>d<=p.date).length-1);
  const dailyChange=currentExplanation?.kind==='actual'?currentExplanation.actual?.change:currentExplanation?.kind==='forecast'?currentExplanation.forecast?.p50Change:null;
  const quoteLabel=row.isHoliday?'휴장 · 직전 종가':row.kind==='실제'?'실제 종가':row.kind==='자료 없음'?'자료 없음':'모형 중앙값';
  const update=(change:any)=>onUpdate(a.code,change);
  const seek=(date:string)=>update((current:any)=>({...current,date,playing:false,session:true,stop:story.find((s:any)=>s.date===date)??null}));
  const toggle=()=>{
    if(!focus&&!p.playing)onFocus(a.code);
    update((current:any)=>{
      if(current.playing)return {...current,playing:false};
      if(current.stop&&current.date===dates.at(-1))return {...current,playing:false,stop:null,session:false};
      return {...current,date:current.date===dates.at(-1)?dates[0]:current.date,playing:true,stop:null,session:true};
    });
  };
  const cardDetails=focus?<>

    <details className="focus-settings"><summary>그래프 설정·계산 상태</summary><div className="focus-settings-body">{p.session&&<button onClick={()=>update((current:any)=>({...current,playing:false,stop:null,session:false}))}>재생 세션 마치기</button>}    <div className="stock-timeline"><div className="timeline-meta"><span>{day(dates[0])}</span><span className="playback-state" data-player-state={p.stop?'news':p.playing?'playing':'paused'}>{p.stop?'Ⅱ 설명 확인 대기':p.playing?'▶ 날짜 재생 중':'선택 날짜'} · {sessionIndex+1} / {dates.length}</span><span>{day(dates.at(-1))}</span></div><input className="stock-date-slider" aria-label={`${a.name} 재생 날짜`} aria-valuetext={`${p.date}, ${sessionIndex+1} / ${dates.length}`} type="range" min="0" max={dates.length-1} value={sessionIndex} onChange={e=>seek(dates[Number(e.target.value)])}/></div>    {<div className="focus-actions" aria-label="빠르게 확인"><button disabled={!reading.latestActualDate} onClick={()=>seek(reading.latestActualDate)}>최근 실제 확인</button><button onClick={()=>seek(input.end)}>10월 30일 전망</button></div>}
    <div className="stock-options">{<button type="button" className="reading-toggle" aria-pressed={readable} onClick={()=>setReadable(v=>!v)}>큰 글씨·선명하게</button>}<label>속도 <select aria-label={`${a.name} 재생 속도`} value={p.speed} onChange={e=>{const speed=Number(e.target.value);update((current:any)=>({...current,speed}));}}><option value="1000">하루 1초</option><option value="1500">하루 1.5초</option><option value="3000">하루 3초</option><option value="5000">하루 5초</option></select></label><label className="chart-options"><input type="checkbox" aria-describedby={focus?`chart-range-note-${a.code}`:undefined} checked={showRange} onChange={e=>setShowRange(e.target.checked)}/> P10~P90 범위 보기</label><label><input type="checkbox" checked={commonScale} onChange={e=>setCommonScale(e.target.checked)}/> 52종목 공통 눈금</label><button className="text-button" onClick={()=>onSelect(a.code)}>뉴스·계산값 보기</button></div>
    <div className="scope-info"><p className="scope-summary">10/30 모형 범위 {money(forecastInfo.lower)}~{money(forecastInfo.upper)}원 · 실제 적중률 미검증</p><div className="scope-chips" aria-label="이 종목의 연결 일정 수">{([['market','시장'],['index','지수'],['sector','업종'],['company','기업']] as const).map(([key,label])=><span key={key} data-empty={counts[key]===0}>{label} <b>{counts[key]}</b></span>)}</div>{counts.sector+counts.company===0&&<p className="scope-gap">확인된 기업·업종 일정 없음 · 상세에서 조사 결과 확인</p>}</div></div></details>
  </>:<>
    <div className="stock-timeline"><div className="timeline-meta"><span>{day(dates[0])}</span><span className="playback-state" data-player-state={p.stop?'news':p.playing?'playing':'paused'}>{p.stop?'Ⅱ 설명 확인 대기':p.playing?'▶ 날짜 재생 중':'선택 날짜'} · {sessionIndex+1} / {dates.length}</span><span>{day(dates.at(-1))}</span></div><input className="stock-date-slider" aria-label={`${a.name} 재생 날짜`} aria-valuetext={`${p.date}, ${sessionIndex+1} / ${dates.length}`} type="range" min="0" max={dates.length-1} value={sessionIndex} onChange={e=>seek(dates[Number(e.target.value)])}/></div>
    <div className="stock-options">{focus&&<button type="button" className="reading-toggle" aria-pressed={readable} onClick={()=>setReadable(v=>!v)}>큰 글씨·선명하게</button>}<label>속도 <select aria-label={`${a.name} 재생 속도`} value={p.speed} onChange={e=>{const speed=Number(e.target.value);update((current:any)=>({...current,speed}));}}><option value="1000">하루 1초</option><option value="1500">하루 1.5초</option><option value="3000">하루 3초</option><option value="5000">하루 5초</option></select></label><label className="chart-options"><input type="checkbox" aria-describedby={focus?`chart-range-note-${a.code}`:undefined} checked={showRange} onChange={e=>setShowRange(e.target.checked)}/> P10~P90 범위 보기</label><label><input type="checkbox" checked={commonScale} onChange={e=>setCommonScale(e.target.checked)}/> 52종목 공통 눈금</label><button className="text-button" onClick={()=>onSelect(a.code)}>뉴스·계산값 보기</button>{!focus&&<button className="text-button" onClick={()=>onFocus(a.code)}>화면에 맞춰 보기 ↗</button>}</div>
    <div className="scope-info"><p className="scope-summary">10/30 모형 범위 {money(forecastInfo.lower)}~{money(forecastInfo.upper)}원 · 실제 적중률 미검증</p><div className="scope-chips" aria-label="이 종목의 연결 일정 수">{([['market','시장'],['index','지수'],['sector','업종'],['company','기업']] as const).map(([key,label])=><span key={key} data-empty={counts[key]===0}>{label} <b>{counts[key]}</b></span>)}</div>{counts.sector+counts.company===0&&<p className="scope-gap">확인된 기업·업종 일정 없음 · 상세에서 조사 결과 확인</p>}{!focus&&<>
      <div className="stock-brief-heading"><span><i aria-hidden="true">◇</i> 날짜로 읽는 전망</span></div>
      <SmartDates rows={days} origin={version.origin} date={p.date} onSelect={(date:string)=>{seek(date);onFocus(a.code);}}/>
      {a.waveModel?<WaveReason asset={a} date={p.date}/>:<DailyMovementReason asset={a} date={p.date}/>}{!a.waveModel&&<PriceStory asset={a} version={version} explanation={currentExplanation}/>}
      <DateGrid rows={days} code={a.code} name={a.name} selected={p.date} onSelect={(date:string)=>{seek(date);onFocus(a.code);}}/>
      <details className="research-drawer"><summary>연구자료 · FOMO · 주기 · 신문 근거</summary><FomoPanel input={input} code={a.code} date={p.date} compact/><CyclePanel report={cycleReport} code={a.code} date={p.date} baselineId={version.id} compact/><PressHistoryPanel report={pressReport} asset={a} version={version} date={p.date} compact/></details>
    </>}</div>
  </>;
  return <article className={`${focus?'focus-card':'mini-card'} ${focus&&readable?'chart-readable':''} ${p.stop?'news-focus':''}`} data-stock-code={a.code} aria-label={`${a.name} 날짜별 전망`}>
    <button className="mini-title" onClick={()=>focus?onSelect(a.code):onFocus(a.code)}><div><small className="stock-identity">{a.sector} <span className="stock-code">{a.code}</span></small><h3>{a.name}</h3><span className="forecast-status" data-evidence-status="research_only"><i aria-hidden="true">◇</i> {a.waveModel?`모형 선택: ${{up:"상승",flat:"보합",down:"하락"}[a.rows.at(-1)?.wave?.horizon?.selected]??"미확보"}`:"방향 판단 유보"}</span></div><div className="end-forecast"><small>10/30 모형 중앙값</small><b data-end-price={a.code}>{money(forecastInfo.endPrice)}원</b><small className="end-comparison" data-end-base={version.origin}>{day(version.origin)} 실제 종가 대비 <span data-end-return={a.code}>{pct(forecastInfo.endReturn,2)}</span></small></div></button>
    {focus?<div className="stock-current focus-comparison" data-focus-comparison={a.code} data-origin-price={forecastInfo.start} data-comparison-state={reading.status}>
      <div className="comparison-date"><time data-play-date dateTime={p.date}>{p.date}</time><span>{reading.status==='HOLIDAY'?'휴장 · 새 종가 없음':reading.status==='CONFLICT'?'종가 상충 · 비교 유보':reading.anchor?'전망 출발 기준 · 적중 평가 대상 아님':reading.status==='NO_SAVED_FORECAST'?'이 전망 작성 전 · 저장된 예측 없음':reading.comparable?'같은 날짜의 기록 비교':'실제와 비교할 자료를 기다립니다'}</span></div>
      <div className="comparison-values"><div><span>{reading.anchor?'출발 기준값':'저장된 예측'}</span><strong data-reading-model>{reading.model===null?'—':`${money(reading.model)}원`}</strong></div><div><span>실제 종가</span><strong data-reading-actual>{reading.actual===null?'미확보':`${money(reading.actual)}원`}</strong></div><div><span>차이 · 실제 − 예측</span><strong data-reading-gap>{reading.anchor?'평가 제외':reading.difference===null?'비교 대기':`${reading.difference>0?'+':''}${money(reading.difference)}원`}</strong><small>{reading.differenceRate===null?'적중 확률 아님':`${pct(reading.differenceRate,2)} · 예측값 대비`}</small></div></div>
    </div>:<>    <div className="stock-current">
      <div className="selected-quote"><span className="quote-caption"><span className="quote-kind">{quoteLabel}</span><time dateTime={p.date} data-play-date>{p.date}</time></span><div className="quote-value"><strong>{money(row.p50)}원</strong>{dailyChange&&<span className={tone(dailyChange.rate)} data-selected-change>{pct(dailyChange.rate,2)}</span>}</div><small>{dailyChange?'전 거래일 대비':row.isHoliday?`${day(row.referenceDate)} 값 참고`:'선택한 날짜의 표시값'}</small></div>
      <div className="forecast-origin" data-origin-price={forecastInfo.start}><span>전망 출발점</span><b>{day(version.origin)} · {money(forecastInfo.start)}원</b><small>실제 종가 기준</small></div>
    </div></>}


    <ForecastPulse cursorDate={p.date} version={version} input={input} asset={a} fitHeight={focus} showRange={showRange} commonScale={commonScale} onDateSelect={(date:string)=>{seek(date);if(!focus)onFocus(a.code);}}/>
    <div className="stock-controls" aria-label={`${a.name} 재생 조작`}>
      {focus&&<button className="day-step" aria-label="이전 날짜" disabled={!dates.some((d:string)=>d<p.date)} onClick={()=>seek(dates.filter((d:string)=>d<p.date).at(-1)??dates[0])}>‹</button>}
      <button className="primary" data-play-toggle onClick={toggle}>{p.stop?(p.date===dates.at(-1)?'설명 확인 · 마치기':'설명 확인 · 계속'):p.playing?'일시 정지':p.date===dates.at(-1)?'처음부터 재생':'▶ 재생'}</button>
      {focus&&<button className="day-step" aria-label="다음 날짜" disabled={!dates.some((d:string)=>d>p.date)} onClick={()=>seek(dates.find((d:string)=>d>p.date)??dates.at(-1))}>›</button>}
      {focus&&<button className="secondary-play" onClick={()=>update((current:any)=>({...newPlayer(dates[0]),speed:current.speed}))}>처음</button>}
      {focus&&<button className="secondary-play" disabled={!story.some((s:any)=>s.date>p.date)} title={story.some((s:any)=>s.date>p.date)?"다음 연결 일정으로 이동":"선택 날짜 이후 연결 일정 없음"} onClick={()=>{const next=story.find((s:any)=>s.date>p.date);if(next)seek(next.date);}}>다음 뉴스</button>}{!focus&&<button className="card-open" onClick={()=>onFocus(a.code)}>이유 보기 ↗</button>}
      {!focus&&p.session&&<button onClick={()=>update((current:any)=>({...current,playing:false,stop:null,session:false}))}>마치기</button>}
      {!focus&&<button className="watch-button" aria-label={`${a.name} 관심종목 ${watched?'해제':'등록'}`} aria-pressed={watched} onClick={()=>onWatch(a.code)}><span aria-hidden="true">{watched?'★':'☆'}</span></button>}
    </div>
    {focus&&<div className="focus-calendar"><DateGrid rows={days} code={a.code} name={a.name} selected={p.date} onSelect={seek}/></div>}
    {focus?cardDetails:<details className="card-details"><summary>날짜·설정·근거 <span>전체 날짜와 계산 자료</span></summary>{cardDetails}</details>}
    {focus&&<button className="mobile-reason-toggle" aria-expanded={reasonOpen} onClick={()=>setReasonOpen(v=>!v)}>이 날짜의 이유 {reasonOpen?"닫기":"보기"}</button>}
    {focus?<aside data-mobile-open={reasonOpen} className="focus-news" aria-label={`${a.name} 뉴스 설명`}>
      <div className="focus-news-heading" data-waiting={Boolean(p.stop)}><button className="mobile-sheet-close" aria-label="이유 닫기" onClick={()=>setReasonOpen(false)}>×</button><h3>{p.stop?'중요 뉴스 · 확인 대기':'날짜별 예측 이유'}</h3><span>{p.date} · {p.stop?'확인할 때까지 멈춤':'날짜 칸을 선택하세요'}</span>{p.stop&&<button className="mobile-sheet-continue" onClick={()=>{toggle();setReasonOpen(false);}}>설명 확인 · 계속</button>}</div>
      <div className="inspector-switch" role="group" aria-label="설명 깊이"><button aria-pressed={inspector==='reason'} onClick={()=>setInspector('reason')}>왜 이렇게 봤나</button><button aria-pressed={inspector==='evidence'} onClick={()=>setInspector('evidence')}>근거·계산값</button></div>
      <div className="focus-news-content" tabIndex={0} ref={newsBody}>
        <div data-inspector="reason" hidden={inspector!=='reason'}>
        {p.stop&&<StockExplanation asset={a} stop={p.stop}/>}
        {a.waveModel?<WaveReason asset={a} date={p.date}/>:<DailyMovementReason asset={a} date={p.date}/>}{!a.waveModel&&<PriceStory asset={a} version={version} explanation={currentExplanation}/>}
        <SmartDates rows={days} origin={version.origin} date={p.date} onSelect={seek}/>
        </div><div data-inspector="evidence" hidden={inspector!=='evidence'}>
        <details className="daily-detail" open><summary>이 날짜의 근거·계산값</summary><DailyExplanation asset={a} version={version} input={input} date={p.date}/></details>
        <ChartReadingPanel asset={a} version={version} input={input} cursorDate={p.date} onDateSelect={seek}/>
        <details className="research-drawer"><summary>연구자료 · FOMO · 주기 · 신문 근거</summary>
        <FomoPanel input={input} code={a.code} date={p.date}/><button className="text-button" onClick={()=>onFomoImport(a.code)}>이 종목 FOMO 원자료 JSON 추가</button>
        <PressHistoryPanel report={pressReport} asset={a} version={version} date={p.date}/>
        <CyclePanel report={cycleReport} code={a.code} date={p.date} baselineId={version.id}/>
        </details>
        </div>
        {!p.stop&&inspector==='reason'&&<details className="news-upcoming"><summary>다음 예정 뉴스 {nextNews.length}건</summary>{nextNews.map((n:any)=><article key={n.id}><small>{day(n.date)} · {scopeLabel(n)}</small><h4>{n.name}</h4><p>{n.used?`이 종목의 과거 반응 ${n.sampleCount}건으로 연구 계산`:n.reason}</p></article>)}</details>}
      </div>
    </aside>:p.stop&&<button className="stopped-banner" data-news-stop={p.stop.date} onClick={()=>onFocus(a.code)}>중요 뉴스 · {p.stop.items[0]?.event.name} — 설명 보기 ↗</button>}
  </article>;
}

function StudioSpark({asset,end}:any){
  const rows=asset.rows.filter((r:any)=>Number.isFinite(r.p50)&&r.p50>0);
  const low=Math.min(...rows.map((r:any)=>r.p50)),high=Math.max(...rows.map((r:any)=>r.p50));
  const start=Date.parse(rows[0]?.date),finish=Date.parse(end);
  const d=rows.map((r:any,i:number)=>`${i?'L':'M'}${(4+92*(Date.parse(r.date)-start)/Math.max(1,finish-start)).toFixed(2)},${(high===low?16:28-24*(r.p50-low)/(high-low)).toFixed(2)}`).join(' ');
  return <svg viewBox="0 0 100 32" aria-hidden="true" data-studio-spark={asset.code} data-forecast-end={end}><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>;
}

export default function Atlas({ initial }: any) {
  const [state, setState] = useState<any>(() => initialState(registerDisplayBundle(initial))),
    [storage, setStorage] = useState("연결 확인 중"),
    [tab, setTab] = useState(() => typeof window!=="undefined" && new URLSearchParams(window.location.search).get("view")==="legacy" ? "graphs" : "rolling"),
    [raceOpened,setRaceOpened]=useState(false),
    [racePlaying,setRacePlaying]=useState(false),
    [archiveOpen,setArchiveOpen]=useState(false),
    [archiveState,setArchiveState]=useState<any>(null),
    [archiveLoading,setArchiveLoading]=useState(false),
    [archiveError,setArchiveError]=useState(''),
    [view, setView] = useState("latest"),
    [query, setQuery] = useState(""),
    [lastStock,setLastStock]=useState<string>(initial.candidate.assets[0]?.code??""),
    [pendingWatch,setPendingWatch]=useState<string|null>(null),
    [lens,setLens]=useState('all'),
    [density,setDensity]=useState('balanced'),
    [galleryMode,setGalleryMode]=useState('studio'),
    [watchlist,setWatchlist]=useState<string[]>(()=>{try{return readWatchlist(window.localStorage,initial.input.assets.map((a:any)=>a.code));}catch{return [];}}),
    [watchSaved,setWatchSaved]=useState(true),
    [selected, setSelected] = useState<string | null>(null),
    [focusStock, setFocusStock] = useState<string | null>(null),
    [focusContext,setFocusContext]=useState<any>(null),
    [modal, setModal] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [token, setToken] = useState(""),
    [paths, setPaths] = useState(20000),
    [origin, setOrigin] = useState(initial.candidate.origin),
    [rankDate, setRankDate] = useState(initial.input.origin),
    [exploreRanking, setExploreRanking] = useState(false),
    [players, setPlayers] = useState<Record<string,any>>({}),
    [pending, setPending] = useState(false),
    [serverConfigured, setServerConfigured] = useState(false);
  const accountController=useAccount();
  const mounted = useRef(true),
    inputRef = useRef<HTMLInputElement>(null),
    newsRef = useRef<HTMLInputElement>(null),
    stockNewsTarget = useRef<string|null>(null),
    cycleRef=useRef<HTMLInputElement>(null),
    fomoRef=useRef<HTMLInputElement>(null), fomoTarget=useRef<string|null>(null),
    workerRef = useRef<Worker | null>(null),
    polling = useRef(false),
    queuedAt = useRef(0),
    playbackLock = useRef(false),
    deferredState = useRef<any>(null),
    stateOrigin = useRef<'local'|'server'>('local'),
    serverStateSeen = useRef(false);
  const focusReturn=useRef<any>(null),pendingFocus=useRef<any>(null),focusRequest=useRef(0),detailReturn=useRef<string|null>(null),archiveRequested=useRef(false);
  const sessionActive=racePlaying||Object.values(players).some((p:any)=>p.session);
  playbackLock.current = sessionActive;
  const updatePlayer=useCallback((code:string,change:any)=>setPlayers(current=>({...current,[code]:change(current[code]??newPlayer(initial.input.origin))})),[initial.input.origin]);
  const [dailyBundle,setDailyBundle]=useState<any>(null),[waveError,setWaveError]=useState('');
  const pendingWave=useRef<any>(null);
  useEffect(()=>{if(!sessionActive&&pendingWave.current){setDailyBundle(pendingWave.current);pendingWave.current=null;}},[sessionActive]);
  const showDailyMovement=true;
  useEffect(()=>{let live=true;fetch('/data/news-wave.json.gz',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('새 전망 자료를 읽지 못했습니다. 배포 파일을 확인해 주세요.');const b=new Uint8Array(await r.arrayBuffer());return b[0]===31&&b[1]===139?new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(b));}).then(r=>{if(live){validateWaveBundle(r);if(playbackLock.current)pendingWave.current=r;else setDailyBundle(r);setWaveError('');}}).catch(e=>{if(live)setWaveError(e.message);});return()=>{live=false;};},[state.active,state.input.actualAsOf]);
  const savedVersion =
    state.versions.find(
      (v: any) => v.id === (view === "latest" ? state.active : view),
    ) ?? initial.candidate;
  useEffect(()=>{if(tab==='race')setRaceOpened(true);},[tab]);
  const waveReady=Boolean(dailyBundle?.displayContext);
  const [waveAdopted,setWaveAdopted]=useState(false);
  useEffect(()=>{if(!sessionActive)setWaveAdopted(Boolean(waveReady));},[waveReady,sessionActive]);
  const dailyReady=waveReady&&waveAdopted;
  const waveView=useMemo(()=>dailyBundle?{...dailyBundle.candidate,eventGate:dailyBundle.displayContext.eventGate,newsCoverage:dailyBundle.displayContext.newsCoverage,evidenceCoverage:dailyBundle.displayContext.evidenceCoverage}:null,[dailyBundle,savedVersion]);
  const version=showDailyMovement&&dailyReady?waveView:savedVersion;
  const headerVersion=tab==='race'&&dailyReady?waveView:version;
  const evidenceRecords: any[] = version.evidenceCoverage?.rows?.flatMap((r:any)=>r.assessments ?? []) ?? [];
  const evidenceClusters = new Map<string,any>();
  for (const r of evidenceRecords) if (!evidenceClusters.has(r.clusterId)) evidenceClusters.set(r.clusterId,r);
  const evidenceTotals = evidenceRecords.length ? {
    candidates: [...evidenceClusters.values()].filter((r:any)=>r.classification==='price_evidence_candidate').length,
    context: [...evidenceClusters.values()].filter((r:any)=>r.classification==='context_only').length,
    abstain: [...evidenceClusters.values()].filter((r:any)=>r.classification==='abstain').length,
  } : null;
  const original = waveView??savedVersion;
  const source = dailyBundle?.displayContext?.input??initial.input,
    assets = rankedStocks(source.assets.map((r: any) => version.assets.find((a: any) => a.code === r.code)).filter(Boolean)),
    visible = filterStocks(assets,{query,lens:tab==='watch'?'watchlist':tab==='graphs'?lens:'all',watchlist});
  useEffect(()=>{setWatchlist(accountController.account.user?accountController.account.watchlist:[]);},[accountController.account]);
  const toggleWatch=(code:string)=>{if(!accountController.account.user){setPendingWatch(code);setModal('account');return;}accountController.save(code,!watchlist.includes(code)).catch((e:any)=>setToast(e.message));};
  const watchLogin=async()=>{const code=pendingWatch;setPendingWatch(null);if(code)try{await accountController.save(code,true);setModal(null);}catch(e:any){setToast(e.message);}};
  const evaluation = useMemo(
    () => evaluateForecast(original, source),
    [original, source],
  );
  const studioAsset=visible.find((a:any)=>a.code===lastStock)??visible[0];
  const chooseStudio=(code:string)=>{if(studioAsset?.code!==code&&studioAsset)updatePlayer(studioAsset.code,(p:any)=>({...p,playing:false}));setLastStock(code);};
  const focusedAsset=version.assets.find((a:any)=>a.code===focusStock);
  const rememberFocusOrigin=(forecastId=version.id,date?:string)=>{
    const context={tab,label:tab==='score'?'성적 목록':tab==='news'?'뉴스 목록':'종목 목록',forecastId,date:date??null};
    focusReturn.current={x:window.scrollX,y:window.scrollY,element:document.activeElement};
    return context;
  };
  const restoreFocusOrigin=()=>{
    const saved=focusReturn.current;focusReturn.current=null;
    window.setTimeout(()=>{if(saved?.element?.isConnected)saved.element.focus({preventScroll:true});if(saved)window.scrollTo?.({left:saved.x,top:saved.y,behavior:'instant' as ScrollBehavior});},0);
  };
  const closeFocus=()=>{if(focusStock)updatePlayer(focusStock,(p:any)=>({...p,playing:false}));setFocusStock(null);setFocusContext(null);restoreFocusOrigin();};
  const switchFocus=(code:string)=>{if(focusStock&&focusStock!==code)updatePlayer(focusStock,(p:any)=>({...p,playing:false}));if(!focusStock)setFocusContext(rememberFocusOrigin());setLastStock(code);setFocusStock(code);};
  const showDetails=(code:string)=>{updatePlayer(code,(p:any)=>({...p,playing:false}));detailReturn.current=focusStock;if(focusStock)updatePlayer(focusStock,(p:any)=>({...p,playing:false}));setFocusStock(null);setSelected(code);};
  const closeDetails=()=>{setSelected(null);if(detailReturn.current){setFocusStock(detailReturn.current);detailReturn.current=null;}else{setFocusContext(null);restoreFocusOrigin();}};
  const selectedAsset = version.assets.find((a: any) => a.code === selected),
    checks = checkForecast(version, source);
  const playDates = source.calendar.sessions.filter((d: string)=>d>=source.origin&&d<=source.end);
  const focusCodes: string[] = [];
  const currentRows = new Map(version.assets.map((a: any)=>[a.code,displayRow(a,source,rankDate)]));
  const acceptState = (next: any, origin:'local'|'server') => {
    if(origin==='server')serverStateSeen.current=true;
    if(playbackLock.current) deferredState.current={state:next,origin};
    else{if(stateOrigin.current!==origin){setArchiveState(null);setArchiveOpen(false);}stateOrigin.current=origin;setState(next);}
  };
  const seek = (date: string) => setRankDate(date);
  useEffect(()=>{
    if(!sessionActive&&deferredState.current){if(stateOrigin.current!==deferredState.current.origin){setArchiveState(null);setArchiveOpen(false);}stateOrigin.current=deferredState.current.origin;setState(deferredState.current.state);deferredState.current=null;setToast("재생을 마쳐 새 자료를 반영했습니다.");}
  },[sessionActive]);
  const actualLatest = source.actualAsOf,
    latestLog = state.collectionLogs.at(-1),
    origins = eligibleOrigins(source);
  const collectionPartial=!!latestLog&&(latestLog.partial===true||latestLog.companyNews?.partial===true||(latestLog.items??[]).some((item:any)=>item.ok===false)||(latestLog.news?.items??[]).some((item:any)=>item.ok===false));
  const collectionStatus=!latestLog?'새 수집 기록 없음':collectionPartial?'최근 수집 일부 실패':latestLog.marketClosed?'휴장일 · 보관 종가 사용':`최근 가격 확인 ${latestLog.fresh??0}/52`;
  const sync = async () => {
    if (polling.current) return;
    polling.current = true;
    try {
      const r = await api();
      if (mounted.current) {
        acceptState(r.state,'server');
        setStorage("운영 서버 연결");
        setServerConfigured(!!r.authConfigured);
        if (
          !queuedAt.current ||
          r.state.collectionLogs.some(
            (l: any) => Date.parse(l.at) >= queuedAt.current,
          )
        ) {
          setPending(false);
          queuedAt.current = 0;
        }
      }
    } catch {
      if (mounted.current) setStorage(serverStateSeen.current?"서버 연결 끊김 · 마지막 자료":"이 기기 저장");
    } finally {
      polling.current = false;
    }
  };
  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const r = await api();
        if (mounted.current) {
          acceptState(r.state,'server');
          setStorage("운영 서버 연결");
          setServerConfigured(!!r.authConfigured);
        }
      } catch {
        try {
          if(!serverStateSeen.current){
            const saved = await localLoad(initial);
            if(saved&&mounted.current&&!serverStateSeen.current)acceptState(saved,'local');
          }
        } catch {}
        if (mounted.current) setStorage(serverStateSeen.current?"서버 연결 끊김 · 마지막 자료":"이 기기 저장");
      }
    })();
    const timer = setInterval(() => {
      if (!document.hidden) sync();
    }, 60000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      workerRef.current?.terminate();
    };
  }, []);
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(sync, 5000);
    return () => clearInterval(t);
  }, [pending]);
  useEffect(()=>{const pause=()=>{if(document.hidden)setPlayers(current=>Object.fromEntries(Object.entries(current).map(([c,p]:any)=>[c,{...p,playing:false}])));};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);},[]);
  useEffect(()=>{setPlayers(current=>Object.fromEntries(Object.entries(current).map(([c,p]:any)=>[c,{...p,playing:false}])));},[tab,selected,query,lens]);
  useEffect(()=>{const active=document.getElementById(`atlas-nav-${primaryTab(tab)}`),rail=active?.parentElement;if(!active||!rail||rail.scrollWidth<=rail.clientWidth)return;const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();if(a.left<r.left+12)rail.scrollLeft+=a.left-r.left-12;else if(a.right>r.right-12)rail.scrollLeft+=a.right-r.right+12;},[tab]);
  useEffect(() => {
    const request=pendingFocus.current;
    if(request?.forecastId===version.id){
      pendingFocus.current=null;
      setPlayers({[request.code]:{...newPlayer(source.origin),date:request.date,playing:false,session:true,stop:buildStory(version,request.code).find((s:any)=>s.date===request.date)??null}});
      setLastStock(request.code);setFocusContext(request.context);setFocusStock(request.code);
    }else{setPlayers({});setFocusStock(null);setFocusContext(null);}
    setRankDate(source.origin);
    setOrigin(origins.at(-1) ?? source.origin);
  }, [savedVersion.id]);
const act = async (action: string, payload: any) => {
    const origin=serverStateSeen.current||stateOrigin.current==='server'?'server':'local';
    const r =
      origin === 'server'
        ? await api(action, payload, token)
        : { state: await localAction(action, payload, initial) };
    acceptState(r.state,origin);
    return r.state;
  };
  const compute = async (input = source) => {
    if (busy) return;
    setBusy(true);
    setToast("52종목의 뉴스 반응을 계산하고 있습니다…");
    try {
      const options = {
        origin,
        paths,
        seed: Number(origin.replaceAll("-", "")),
        informationCutoff:
          origin === origins.at(-1)
            ? input.informationAsOf
            : origin + "T16:00:00+09:00",
      };
      const w = new Worker(new URL("./worker.mjs", import.meta.url), {
        type: "module",
      });
      workerRef.current = w;
      const v: any = await new Promise((resolve, reject) => {
        w.onmessage = ({ data }) =>
          data.ok ? resolve(data.version) : reject(Error(data.error));
        w.onerror = (e) => reject(Error(e.message || "계산 작업 오류"));
        w.postMessage({ input, options, pressData: state.pressResearch?.data, pressCutoff: new Date().toISOString() });
      });
      w.terminate();
      workerRef.current = null;
      await act("candidate", { version: v });
      await act("approve", { id: v.id, requestId: crypto.randomUUID() });
      setView("latest");
      setToast(
        `52종목 · ${v.rowCount.toLocaleString()}행 계산 완료 · 이전 전망 보존${playbackLock.current ? " · 재생 마치기 후 새 전망 표시" : ""}`,
      );
      setModal(null);
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    setBusy(true);
    try {
      queuedAt.current = Date.now();
      const r = await api("refresh", {}, token);
      acceptState(r.state,'server');
      setPending(!!r.queued);
      setToast(r.message ?? "새 가격과 뉴스 일정을 반영했습니다.");
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  };
  const importData = async (file: File | undefined, newsOnly = false) => {
    if (!file) return;
    try {
      if (file.size > 15000000)
        throw Error("15MB 이하 JSON 파일을 사용하세요.");
      const data = JSON.parse(await file.text());
      let input = data;
      if (newsOnly) {
        if (!Array.isArray(data.events))
          throw Error("events 배열이 필요합니다.");
        input = structuredClone(source);
        for (const event of data.events) {
          if (
            !event.id ||
            !event.kind ||
            !event.name ||
            !event.announcementDate ||
            !event.targetDate ||
            !event.availableAt ||
            !event.sources?.length
          )
            throw Error(
              "사건 ID·종류·제목·발표일·반영일·공개 시각·출처가 필요합니다.",
            );
          const errors=scopeErrors(event,input.assets,new Date().toISOString());
          if(errors.length)throw Error(errors.join(" · "));
          const targetCode=stockNewsTarget.current, scope=scopeOf(event);
          if(targetCode&&(scope.type!=="company"||scope.codes.length!==1||scope.codes[0]!==targetCode))throw Error("이 버튼은 선택한 기업 1개의 뉴스만 받습니다. 공통·업종 뉴스는 예정 뉴스 화면에서 추가하세요.");
          const existing=input.events.find((e:any)=>e.id===event.id);
          if(targetCode&&existing&&(scopeOf(existing).type!=="company"||scopeOf(existing).codes?.length!==1||!appliesTo(existing,{code:targetCode})))throw Error("다른 대상의 기존 사건 ID를 덮어쓸 수 없습니다.");
          const i = input.events.findIndex((e: any) => e.id === event.id);
          if (i < 0) input.events.push(normalizeEvent(event));
          else input.events[i] = normalizeEvent(event);
        }
        input.informationAsOf = new Date().toISOString();
      }
      validateInput(input);
      await act("input", { input });
      setToast(
        "자료를 저장했습니다. ‘새 전망 계산’으로 반영하세요. 이전 전망은 유지됩니다.",
      );
    } catch (e: any) {
      setToast(e.message);
    }
  };
  const importFomo=async(file:File|undefined)=>{if(!file)return;try{if(file.size>15000000)throw Error("15MB 이하 JSON을 사용하세요.");const payload=JSON.parse(await file.text());const next=(payload.schema==='atlas-fomo-records-2'?mergeFomoRecords:mergeFomoInput)(source,payload,{targetCode:fomoTarget.current});await act("input",{input:next});setToast("FOMO 원자료 저장 · 이전 값과 관측 시각 보존 · 예측 가격 가중치 0 유지");}catch(e:any){setToast(e.message);}};
  const importCycle=async(file:File|undefined)=>{if(!file)return;try{if(file.size>6000000)throw Error("6MB 이하 JSON을 나누어 입력하세요.");setBusy(true);await act("cycle-input",{data:JSON.parse(await file.text())});setToast("주기 자료 저장·연구 계산 완료 · 원래 전망 보존");}catch(e:any){setToast(e.message);}finally{setBusy(false);}};
  const analyzeCycle=async()=>{try{setBusy(true);await act("cycle-input",{data:{schema:"atlas-cycle-input-1"}});setToast("저장된 자료로 주기 분석 완료 · 같은 입력은 중복 연구를 만들지 않습니다.");}catch(e:any){setToast(e.message);}finally{setBusy(false);}};
  const openFomo=(code:string)=>{fomoTarget.current=code;fomoRef.current?.click();};
  const selectVersion = async (id: string) => {
    if(id!=='latest'&&id!==state.active){setToast('폐기된 전망은 운영 그래프로 열지 않습니다. 현재 전망만 열 수 있습니다.');return false;}
    try {
      const current = state.versions.find((v: any) => v.id === (id==='latest'?state.active:id));
      if(!current)throw Error('선택한 전망 기록을 찾을 수 없습니다.');
      if (current?.detailLoaded === false) {
        const resolvedId=current.id;
        const { version: full } = await api("version", { id:resolvedId });
        setState((s: any) => ({
          ...s,
          versions: s.versions.map((v: any) => (v.id === resolvedId ? full : v)),
        }));
      }
      setView(id);return true;
    } catch (e: any) {
      setToast(e.message);
    }
  };
  const openScoreDate=async(code:string,date:string,id=version.id)=>{
    if(!source.assets.some((a:any)=>a.code===code)||date<source.origin||date>source.end){setToast('이 종목·날짜는 현재 기록 범위에 없습니다.');return;}
    const context=rememberFocusOrigin(id,date),request={sequence:++focusRequest.current,code,date,forecastId:id,context};
    pendingFocus.current=request;
    if(id===version.id){
      pendingFocus.current=null;setLastStock(code);setFocusContext(context);setFocusStock(code);
      updatePlayer(code,(p:any)=>({...p,date,playing:false,session:true,stop:buildStory(version,code).find((s:any)=>s.date===date)??null}));
    }else if(!await selectVersion(id)){if(pendingFocus.current?.sequence===request.sequence)pendingFocus.current=null;}
  };
  const openArchivedRecords=async(open:boolean)=>{
    archiveRequested.current=open;
    if(!open){setArchiveOpen(false);return;}
    if(!state.sealedStudy?.archiveDeferred){setArchiveOpen(true);return;}
    if(archiveLoading)return;
    setArchiveLoading(true);setArchiveError('');
    const requestedOrigin=stateOrigin.current;
    try{
      const full=requestedOrigin==='server'?(await api()).state:await loadFullLocalState(initial);
      if(stateOrigin.current!==requestedOrigin)throw Error('자료 출처가 바뀌었습니다. 현재 자료의 보관 기록을 다시 열어 주세요.');
      if(full.sealedStudy?.archiveDeferred)throw Error('서버의 전체 보관 기록을 확인하지 못했습니다. 연결을 다시 확인해 주세요.');
      if(mounted.current){setArchiveState(full);if(archiveRequested.current)setArchiveOpen(true);}
    }catch(e:any){if(mounted.current)setArchiveError(e.message??'보관 기록을 불러오지 못했습니다.');}
    finally{if(mounted.current)setArchiveLoading(false);}
  };
  const exportState = async () => {
    try {
      setToast("이전 전망의 전체 근거를 준비하고 있습니다…");
      const complete = structuredClone(stateOrigin.current==='server'?state:await loadFullLocalState(initial));
      if(complete.sealedStudy?.archiveDeferred)throw Error('전체 서버 보관 기록을 확인하지 못해 내보내지 않았습니다. 연결을 다시 확인해 주세요.');
      for (let i = 0; i < complete.versions.length; i += 4) {
        await Promise.all(
          complete.versions.slice(i, i + 4).map(async (v: any, j: number) => {
            if (v.detailLoaded === false || v.evidenceDisplayProjection)
              complete.versions[i + j] = (
                await api("version", { id: v.id })
              ).version;
          }),
        );
      }
      download("ATLAS_state.json", complete);
      setToast("전체 전망과 근거 파일을 준비했습니다.");
    } catch (e: any) {
      setToast(e.message);
    }
  };
  const exportCSV = () => {
    const rows = [
      [
        "code",
        "name",
        "origin",
        "date",
        "p10",
        "p50",
        "p90",
        "probUp",
        "newsIds",
      ],
      ...version.assets.flatMap((a: any) =>
        a.rows.map((r: any) => [
          a.code,
          a.name,
          version.origin,
          r.date,
          r.p10,
          r.p50,
          r.p90,
          r.probUp ?? "",
          r.eventIds.join("|"),
        ]),
      ),
    ];
    download(
      `ATLAS_${version.id}.csv`,
      "\ufeff" +
        rows
          .map((r: any[]) =>
            r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  };
  const rankedDay = version.assets
    .map((a: any) => ({
      a,
      r: {...currentRows.get(a.code),return:(currentRows.get(a.code) as any).displayReturn},
    }))
    .sort((a: any, b: any) => b.r.return - a.r.return)
    .slice(0, 8);
  const focusContent=()=>{document.getElementById('atlas-content')?.focus();};
  const navKey=(e:React.KeyboardEvent<HTMLElement>)=>{const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button')),i=buttons.indexOf(e.target as HTMLButtonElement);if(i<0)return;const next=(e.key==='ArrowRight'||e.key==='ArrowDown')?(i+1)%buttons.length:(e.key==='ArrowLeft'||e.key==='ArrowUp')?(i+buttons.length-1)%buttons.length:e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;if(next>=0){e.preventDefault();buttons[next].focus();}};
  if(!dailyReady&&tab!=='rolling')return <main className="loading"><h1>ATLAS · 새 전망 준비</h1><p>{waveError||(!waveReady&&dailyBundle?'현재 자료에 맞는 새 계산이 필요합니다.':'종목별 요인·확률 선택 자료를 읽고 있습니다.')}</p><p>새 계산을 불러오면 그래프가 나타납니다.</p><button onClick={()=>location.reload()}>다시 읽기</button></main>;
  return (
    <main data-design-edition="8.0" data-design-generation="365" data-atelier="8.4" data-ux="8.5" data-experience-version="10.0.0" data-workspace={tab==='graphs'&&galleryMode==='studio'} data-focus-edition="8.9" data-studio="8.8" data-state-origin={stateOrigin.current} id="atlas-top">
      <a className="skip-link" href="#atlas-content" onClick={focusContent}>현재 화면 본문으로 건너뛰기</a>
      {version.assets.map((a:any)=><StockClock key={a.code} asset={a} version={version} input={source} player={players[a.code]??newPlayer(source.origin)} onUpdate={updatePlayer}/>)}
      <header>
        <div className="brand">
          <span className="brand-mark"><img src="/atlas-mark.svg" alt="" width="44" height="44" aria-hidden="true"/></span>
          <div>
            <div className="atelier-wordmark-line"><h1>ATLAS</h1><span className="atelier-edition">10.0</span></div>
            <p>시장의 변화, 판단의 기록</p>
          </div>
        </div>
      <nav data-primary-nav aria-label="화면 선택" onKeyDown={navKey}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            id={`atlas-nav-${id}`}
            aria-controls="atlas-content"
            tabIndex={primaryTab(tab)===id||(!tabs.some(([key])=>key===primaryTab(tab))&&id==='graphs')?0:-1}
            className={primaryTab(tab) === id ? "active" : ""}
            aria-current={primaryTab(tab) === id ? "page" : undefined}
            onClick={() => setTab(id)}
          >
            <NavSymbol name={id}/><span>{label}</span>
          </button>
        ))}
      </nav>
        <div className="header-actions">
          <button className="account-trigger" onClick={()=>setModal("account")} aria-haspopup="dialog">{accountController.account.user?"내 계정":accountController.account.configured?"Google 로그인":"관심종목 저장"}</button>
          <button className="tools-trigger" onClick={()=>setModal("tools")} aria-haspopup="dialog">설정·자료</button>
        </div>
      </header>
      <div className="command-bar" hidden={tab==='rolling'}>
      {tab!=='rolling'&&<p className="evidence-banner" data-archive-notice><b>이전 고정기간 기록</b><span>아래는 9/17~10/30 고정 전망의 보관 화면입니다. 새 20거래일 발행본은 ‘오늘 전망’에서 확인합니다.</span></p>}
      <div className="workspace-context" data-selected-forecast={headerVersion.id}><span title={`전망 작성 ${stamp(headerVersion.createdAt)} · ${headerVersion.id}`}>선택 전망 <b>{day(headerVersion.origin)} 종가 기준</b></span><span>실제 종가 <b>{day(actualLatest)}</b></span><span>기록 마감 <b>10/30</b></span><span className="research-status">{(showDailyMovement||tab==='race')&&dailyReady?'36요인 검토 · 모형 선택 · 적중 미검증':'연구용 · 방향 판단 유보'}</span></div>

      <div className="workspace-data-status" data-collection-state={!latestLog?'unknown':collectionPartial?'partial':latestLog.marketClosed?'stored':'recorded'}><span>{collectionStatus}{latestLog?.marketClosed&&collectionPartial?' · 보관 종가 사용':''}</span><button className="text-button" onClick={()=>setModal('settings')} aria-haspopup="dialog"><span className="desktop-label">갱신 상태 보기</span><span className="mobile-label">자료 상태</span></button></div>
      <details className="record-details"><summary><b className="desktop-label">자료 기준·예측 기록</b><b className="mobile-label">기록</b> <span>검증된 적중 확률 없음</span></summary><div className="evidence-banner" role="status"><b>{version.modelVersion==='atlas-news-wave-1'||version.modelVersion==='atlas-factor36-1'?'모형 방향 선택 · 실전 적중 미검증':'방향 판단 유보'}</b><span>중복 제외 사건 {version.evidenceCoverage?.globalUniqueEventClusters??version.newsCoverage?.acceptedEvents??0}건{evidenceTotals && <> · 영향 검토 후보 {evidenceTotals.candidates}건 · 설명용 일정 {evidenceTotals.context}건{evidenceTotals.abstain>0 && <> · 근거 유보 {evidenceTotals.abstain}건</>}</>} · 검증된 적중 확률 없음</span><button className="text-button" onClick={()=>setTab('score')}>검증 결과 보기</button></div>
      <div className="method-strip">
        <span>
          대상 <b>52종목</b>
        </span>
        <span>
          전망 작성 <b>{stamp(version.createdAt)}</b>
        </span>
        <span>
          계산 <b>종목별 36요인 검토 · 공동 모의 경로</b>
        </span>
      </div>
      <div className="version-bar">
        <div>
          <span className="live-dot" />
          <b>보관된 고정기간 전망</b>
          <span>
            {day(version.origin)} 종가 출발 · {version.paths.toLocaleString()}개
            경로
          </span>
        </div>

      </div>
      </details>
      {(tab==='graphs'||tab==='watch')&&<>
          <div className="workspace-options">
            <button className="gallery-picker mobile-picker" onClick={()=>setModal("picker")}>{studioAsset?.name??'종목 선택'} ▾</button>
            <details className="workspace-menu"><summary>종목·보기 설정</summary><div className="workspace-menu-body">      {sessionActive&&<div className="session-note">종목별 재생 위치를 유지하고 있습니다. 새 자료는 재생을 마친 뒤 반영합니다. <button onClick={()=>setPlayers(current=>Object.fromEntries(Object.entries(current).map(([c,p]:any)=>[c,{...p,playing:false,session:false,stop:null}])))}>재생 모두 마치기</button></div>}
            <details className="discovery-search"><summary>검색</summary><div className="stock-search" role="search"><label htmlFor="atlas-stock-search">종목 찾기</label><div><svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor"/><path d="m12 12 5 5" stroke="currentColor"/></svg><input id="atlas-stock-search" aria-label="그래프 검색" placeholder="종목명 · 업종 · 코드" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();setQuery('');}}}/>{query&&<button aria-label="그래프 검색어 지우기" onClick={()=>{setQuery('');document.getElementById('atlas-stock-search')?.focus();}}>×</button>}</div></div></details>          <div className="studio-view-switch" role="group" aria-label="그래프 배치"><button aria-pressed={galleryMode==='studio'} onClick={()=>setGalleryMode('studio')}>집중해서 보기</button><button aria-pressed={galleryMode==='all'} onClick={()=>{setGalleryMode('all');if(studioAsset)updatePlayer(studioAsset.code,(p:any)=>({...p,playing:false}));}}>52종목 전체 그래프</button></div>
          <div className="research-toolbar" data-smart-toolbar>
            <div className="research-lenses" aria-label="종목 보기 필터">{[['all','전체'],['watchlist','관심종목'],['specific','기업·업종 일정'],['used','수치 반영 일정']].map(([id,label])=><button key={id} data-lens={id} aria-pressed={lens===id} onClick={()=>{setLens(id);setTab('graphs');}}>{label}<span>{assets.filter((a:any)=>matchesLens(a,id,watchlist)).length}</span></button>)}</div>
            <span className="visible-count" role="status" aria-live="polite" aria-atomic="true"><b>{visible.length}</b> / {assets.length}종목{query?` · “${query}” 검색`:watchlist.length&&lens==='watchlist'?' · 내 관심 목록':''}{!watchSaved?' · 관심 목록은 이 화면에서만 유지':''}</span>
          </div>
          <details className="gallery-tools"><summary>보기 설정·읽는 법</summary><ReadingGuide/><div className="density-switch" role="group" aria-label="종목 카드 크기"><button aria-pressed={density==='balanced'} onClick={()=>setDensity('balanced')}>모아 보기</button><button aria-pressed={density==='reading'} onClick={()=>setDensity('reading')}>크게 보기</button></div><p>같은 기준일의 10/30 모형 중앙값 순서입니다. 투자 추천 순위가 아닙니다.</p></details>
</div></details>
          </div>
      </>}
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button aria-label="알림 닫기" onClick={() => setToast("")}>
            ×
          </button>
        </div>
      )}

      <div id="atlas-content" className="atlas-content" tabIndex={-1} role="region" aria-labelledby={["math","data"].includes(tab)?"utility-page-title":`atlas-nav-${primaryTab(tab)}`}>
      <RollingPage active={tab==='rolling'}/>
      {(tab==='news'||tab==='breaking')&&<div className="section-switch" role="group" aria-label="뉴스 종류"><button aria-pressed={tab==='news'} onClick={()=>setTab('news')}>예정 뉴스</button><button aria-pressed={tab==='breaking'} onClick={()=>setTab('breaking')}>돌발 뉴스</button><span>예정과 실제 발생을 구분해 확인합니다.</span></div>}
      {['math','data'].includes(tab)&&<div className="utility-heading"><button onClick={()=>setTab('graphs')}>← 종목으로</button><span id="utility-page-title">{tab==='math'?'계산 방식':'자료·운영 기록'}</span></div>}

      {(tab === "graphs" || tab === "watch") && (
        <>
          {visible.length===0&&<div className="empty-stocks" data-empty-stocks><svg viewBox="0 0 64 64" aria-hidden="true" fill="none"><rect x="10" y="10" width="44" height="44" rx="12" stroke="currentColor"/><circle cx="29" cy="29" r="9" stroke="currentColor"/><path d="m36 36 9 9" stroke="currentColor"/></svg><b>{lens==='watchlist'&&!watchlist.length?'관심종목을 골라보세요.':'조건에 맞는 종목이 없습니다.'}</b><p>{lens==='watchlist'&&!watchlist.length?'종목 카드에서 ☆ 관심을 누르면 이곳에 모입니다.':'검색어를 줄이거나 전체 종목에서 다시 확인하세요.'}</p><button onClick={()=>{setQuery('');setLens('all');setTab('graphs');}}>전체 52종목 보기</button></div>}
          {galleryMode==='studio'&&visible.length>0&&<div className="studio-layout">
            <aside className="studio-roster" aria-label="종목 선택판">
              <div className="studio-roster-heading"><b>52 STOCKS</b><small>10/30 모형 순 · 추천 아님</small></div>
              <div className="studio-roster-list">{visible.map((a:any,i:number)=>{const result=forecastSummary(a,version).endReturn;return <button key={a.code} data-studio-code={a.code} aria-pressed={studioAsset?.code===a.code} onClick={()=>chooseStudio(a.code)} onKeyDown={e=>{let n=i;if(e.key==='ArrowDown')n=Math.min(i+1,visible.length-1);else if(e.key==='ArrowUp')n=Math.max(0,i-1);else if(e.key==='Home')n=0;else if(e.key==='End')n=visible.length-1;else return;e.preventDefault();chooseStudio(visible[n].code);(e.currentTarget.parentElement?.children[n] as HTMLElement)?.focus();}}><span className="studio-rank">{String(i+1).padStart(2,'0')}</span><span className="studio-stock-name"><b>{a.name}</b><small>{a.sector}</small></span><StudioSpark asset={a} end={source.end}/><strong>{Number.isFinite(result)?`${result>=0?'+':''}${(result*100).toFixed(1)}%`:'유보'}</strong></button>;})}</div>
            </aside>
            <section className="studio-stage" data-studio-detail>
              <div className="studio-stage-toolbar"><button onClick={()=>toggleWatch(studioAsset.code)}>{watchlist.includes(studioAsset.code)?'★ 관심종목':'☆ 관심종목'}</button><button onClick={()=>switchFocus(studioAsset.code)}>화면맞춤 ↗</button></div>
              {!focusedAsset&&!selected&&<StockCard focus key={studioAsset.code} asset={studioAsset} version={version} input={source} original={original} player={players[studioAsset.code]??newPlayer(source.origin)} onUpdate={updatePlayer} onSelect={showDetails} onFocus={switchFocus} onFomoImport={openFomo} cycleReport={state.cycleResearch?.report} pressReport={state.pressResearch?.report} watched={watchlist.includes(studioAsset.code)} onWatch={toggleWatch}/>}
            </section>
          </div>}
          {galleryMode==='all'&&<>          <div className="small-multiples" data-density={density}>
            {visible.map((a:any)=><StockCard key={a.code} asset={a} version={version} input={source} original={original} player={players[a.code]??newPlayer(source.origin)} onUpdate={updatePlayer} onSelect={showDetails} onFocus={switchFocus} onFomoImport={openFomo} cycleReport={state.cycleResearch?.report} pressReport={state.pressResearch?.report} watched={watchlist.includes(a.code)} onWatch={toggleWatch} />)}
          </div></>}

        </>
      )}
      {(raceOpened||tab==='race')&&<EqualStartPage input={source} version={dailyReady?waveView:version} active={tab==='race'} onSessionChange={setRacePlaying}/>}
      {tab === "news" && (
        <>
          <div className="section-heading">
            <div>
              <h2>예정 뉴스와 가격 반응의 근거</h2>
              <p>
                아직 나오지 않은 기사 내용을 사실로 만들지 않습니다. 일정과 과거
                반응을 구분합니다.
              </p>
            </div>
            <button onClick={() => {stockNewsTarget.current=null;newsRef.current?.click();}}>
              뉴스 근거 JSON 추가
            </button>
          </div>
          <div className="context-note">
            <b>현재 일정 확인 범위:</b> 공통 경제 뉴스{" "}
            {scopeCounts(version.eventGate.accepted).market}건 · 지수 {scopeCounts(version.eventGate.accepted).index}건 · 업종 {scopeCounts(version.eventGate.accepted).sector}건. 기업 고유 사건{" "}
            {version.newsCoverage.corporateEvents}건. 일정 확인 수이며 가격 촉매 수가 아닙니다. {source.coverage.note}
          </div>
          <NewsWorkbench version={version} code={lastStock} onCode={setLastStock} onOpenDate={openScoreDate}/>
          <details className="panel"><summary>전체 일정 원문·발표 시각</summary><div className="news-grid">{version.eventGate.accepted.map((e:any)=><NewsCard key={e.id} e={e} profile={assets.flatMap((a:any)=>a.news).find((p:any)=>p.id===e.id)}/>)}</div></details>
          <details className="panel"><summary>52종목 조사 내용 전체</summary><ResearchTable input={source} version={version} onSelect={showDetails}/></details>
          {version.eventGate.rejected.length > 0 && (
            <section className="panel">
              <h3>이번 계산에서 제외한 일정</h3>
              {version.eventGate.rejected.map((e: any) => (
                <p key={e.id}>
                  <b>{e.name}</b> — {e.reasons.join(" · ")}
                </p>
              ))}
            </section>
          )}
          <section className="panel">
            <h3>뉴스 하나가 가격에 반영되는 과정</h3>
            <p>
              공식 원문·대상 확인 → 설명용 일정과 영향 검토 후보 구분 → 같은 종목의 독립 과거 반응 확인 →
              근거 부족은 유보 → 연구용 모의 경로와 모형 평균·분산 계산
            </p>
            <p className="muted">
              예: 10/2 미국 고용 발표는 한국 장 마감 후입니다. 주말과 10/5
              휴장을 지나 10/6 가격에 반영합니다. 뉴스의 실제 내용·시장 예상
              대비 차이는 발표 전에는 확정하지 않습니다.
            </p>
          </section>
        </>
      )}
      {tab === "breaking" && <BreakingWorkbench state={{...state,versions:[version],active:version.id,original:version.id,breaking:null}} selectedVersion={version} onAction={(action:string,payload:any)=>act(action,payload)}/>}
      {tab === "evolution" && <><CompletionDailyReport version={version}/><Factor36Audit version={version}/><section className="panel"><h2>새 모형의 개선 기록</h2><p>작성 이후의 실제 결과를 모아 방향·가격 오차를 추적합니다. 아직 관측하지 않은 성적을 개선 근거로 사용하지 않습니다.</p></section><WaveScore version={version} input={source}/></>}
      {tab === "score" && <><CompletionDailyReport version={version}/><WaveScore version={version} input={source}/></>}
      {tab === "math" && <Factor36Math version={version}/>}
      {tab === "data" && <><CompletionStatus version={version}/><section className="panel" data-wave-data><h2>발행본·계산 자료</h2><p>52종목 · 공동 모의 경로 {version.paths.toLocaleString()}개 · 보관 종가 {source.actualAsOf}</p><p>작성 {stamp(version.createdAt)} · {version.id}</p><p>자료 수집, 계산에 사용, 화면 연결과 실제 예측력 검증을 각각 확인합니다. 각 단계의 완료 여부는 위 근거 현황에 기록합니다.</p><a href="/downloads/ATLAS_FACTOR36_52_EQUATIONS.json" download>52종목 방정식·계수 받기</a> · <a href="/data/factor36-status.json" download>이번 검사 보고서</a><p><button onClick={exportCSV}>현재 전망 CSV</button></p></section></>}
      </div>
      <footer className="atlas-footer">
        <details className="intro-details"><summary>ATLAS · 근거로 전망하고, 결과로 검증합니다.</summary><AtlasIntroduction onOpen={()=>setModal('about')}/></details>
        <div className="footer-signature"><span>ATLAS</span><small>뉴스 · 시나리오 · 검증</small></div><div className="footer-evidence">
        <b>ATLAS · 시장이 채점하는 조건부 전망</b>
        <p>
          현재 연결된 것은 확인한 경제·기업·업종 일정{" "}
          {version.newsCoverage.acceptedEvents}건입니다. 일정이 있다는 사실만으로 가격 영향을 확정하지 않습니다. 아직 나오지 않은 뉴스의
          내용과 미래 주가는 확정할 수 없습니다. 기준 시각 뒤에 들어온 실제
          가격은 이전 전망을 고치는 데 쓰지 않습니다.
        </p>
        <p>
          자료: NAVER Finance · 미국 노동통계국 · 미국 연준 · 한국은행 · 기업 IR · 행사 주최 기관. 모든
          가격과 예측은 원화입니다.
        </p>
        </div><div className="footer-actions"><button onClick={()=>setTab("math")}>계산 방식</button><button onClick={()=>setTab("data")}>자료·운영 기록</button><button onClick={()=>{document.getElementById(`atlas-nav-${primaryTab(tab)}`)?.focus();window.scrollTo?.({top:0,behavior:'instant' as ScrollBehavior});}}>맨 위로 ↑</button><a href="/downloads/ATLAS_Design_Learning_Plan.html" download>디자인 학습·기획 기록 ↗</a><small>ATLAS 10.0.0 · WORKSPACE · 연구용</small></div>
      </footer>
      <input
        hidden
        type="file"
        accept=".json,application/json"
        ref={inputRef}
        onChange={(e) => {
          importData(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        hidden
        type="file"
        accept=".json,application/json"
        ref={newsRef}
        onChange={(e) => {
          importData(e.target.files?.[0], true);
          e.target.value = "";
        }}
      />
      <input hidden type="file" accept=".json,application/json" ref={cycleRef} onChange={e=>{importCycle(e.target.files?.[0]);e.target.value="";}}/>
      <input hidden type="file" accept=".json,application/json" ref={fomoRef} onChange={e=>{importFomo(e.target.files?.[0]);e.target.value="";}}/>
      {modal==='picker'&&<Modal title="종목 선택" onClose={()=>setModal(null)}><StockPicker assets={assets} selected={lastStock} onSelect={(code:string)=>{setModal(null);setQuery('');setTab('graphs');switchFocus(code);}}/></Modal>}
      {modal==='account'&&<Modal title="내 관심종목" onClose={()=>setModal(null)}><AccountPanel controller={accountController} onLoggedIn={watchLogin}/></Modal>}
      {modal==='about'&&<Modal title="아틀라스 소개" onClose={()=>setModal(null)}><AtlasAbout onGraphs={()=>{setModal(null);setTab('graphs');}} onValidation={()=>{setModal(null);setTab('score');}}/></Modal>}
      {focusedAsset && <Modal fit title="종목 집중 보기" onClose={closeFocus} toolbar={<><button className="focus-return" onClick={closeFocus}>← {focusContext?.label??'종목 목록'}으로</button><span className="focus-context" data-focus-origin={focusContext?.tab??tab} data-focus-forecast={version.id} data-focus-date={players[focusedAsset.code]?.date??source.origin}>{day(players[focusedAsset.code]?.date??source.origin)} · {day(version.origin)} 출발 전망</span><span className="focus-period">09.17 — 10.30 / 전체 전망</span><button aria-label="이전 종목" disabled={assets.findIndex((a:any)=>a.code===focusStock)<=0} onClick={()=>switchFocus(assets[assets.findIndex((a:any)=>a.code===focusStock)-1].code)}>‹</button><button aria-label="다음 종목" disabled={assets.findIndex((a:any)=>a.code===focusStock)>=assets.length-1} onClick={()=>switchFocus(assets[assets.findIndex((a:any)=>a.code===focusStock)+1].code)}>›</button><select aria-label="화면맞춤 종목 선택" value={focusStock??''} onChange={e=>switchFocus(e.target.value)}>{assets.map((a:any)=><option value={a.code} key={a.code}>{a.name} · {a.sector}</option>)}</select></>}>
        <StockCard focus key={focusedAsset.code} asset={focusedAsset} version={version} input={source} original={original} player={players[focusedAsset.code]??newPlayer(source.origin)} onUpdate={updatePlayer} onSelect={showDetails} onFocus={switchFocus} onFomoImport={openFomo} cycleReport={state.cycleResearch?.report} pressReport={state.pressResearch?.report}/>
      </Modal>}
      {selectedAsset && (
        <Modal
          title={`${selectedAsset.name} · ${selectedAsset.sector}`}
          onClose={closeDetails}
          toolbar={detailReturn.current?<button onClick={closeDetails}>← 날짜별 보기로</button>:undefined}
        >
          <p className="evidence-banner"><b>{selectedAsset.waveModel?'모형 확률 선택 · 적중 미검증':'방향 판단 유보'}</b></p>{selectedAsset.waveModel&&<WaveReason asset={selectedAsset} date={players[selected]?.date??source.end}/>}
          <div className="detail-intro">
            <div>
              <span>{day(version.origin)} 출발 종가</span>
              <strong>{money(selectedAsset.originPrice)}원</strong>
            </div>
            <div>
              <span>10/30 모형 중앙값</span>
              <strong>{money(selectedAsset.rows.at(-1).p50)}원</strong>
            </div>
            <div>
              <span>연구용 뉴스 평균 효과 합계</span>
              <strong className={tone(selectedAsset.newsEffect)}>
                {selectedAsset.waveModel?'일정 참고 · 추가 충격 미산출':pct(selectedAsset.newsEffect, 2)}
              </strong>
            </div>
          </div>
          <Chart
            version={version}
            input={source}
            original={original}
            code={selected}
            cursorDate={players[selected]?.date??source.origin}
          />
          <p className="muted">
            색상 선은 저장된 전망 하나이며, 흰 선은 실제 종가입니다.
            모형 범위는 날짜별 설명에서 숫자로 확인합니다.
          </p>
          {selectedAsset.numericSummary && <p className="muted">10/30 모형 평균 {money(selectedAsset.rows.at(-1).mean)}원 · 모형 표준편차 {money(selectedAsset.numericSummary.rows.at(-1)?.standardDeviation)}원. 현재 분포에서 직접 계산한 값이며 실제 미래 가격의 확정값이 아닙니다. 중앙값과 평균은 서로 다를 수 있습니다.</p>}
          <details><summary>모의 계산 오차와 실제 예측 오차의 차이</summary><PrecisionDetails row={selectedAsset.rows.at(-1)} /><p>10/30 상승 경로 비율: {probability(selectedAsset.rows.at(-1).rawProbUp??selectedAsset.rows.at(-1).probUp)}. {selectedAsset.rows.at(-1).probabilityMonteCarloSE!=null&&<>몬테카를로 표준오차 약 {pct(selectedAsset.rows.at(-1).probabilityMonteCarloSE,2)}p.</>}</p><p>경로 수를 늘리면 모의 계산의 흔들림은 줄지만 없는 뉴스나 잘못된 가정은 고쳐지지 않습니다. 이 수치를 실제 적중 확률이나 신뢰 확률로 사용할 수 없습니다.</p></details>
          <PressHistoryPanel report={state.pressResearch?.report} asset={selectedAsset} version={version} date={players[selected]?.date??source.origin}/>
          <h3>이 종목의 뉴스와 계산값</h3><ResearchNote input={source} code={selected}/>
          <p>{selectedAsset.name}의 일정과 과거 반응을 따로 확인합니다. 시장 {scopeCounts(selectedAsset.news).market} · 지수 {scopeCounts(selectedAsset.news).index} · 업종 {scopeCounts(selectedAsset.news).sector} · 기업 {scopeCounts(selectedAsset.news).company}건</p>
          <p className="muted">위 숫자는 일정 수입니다. 설명용 일정은 가격 효과를 만들지 않으며, 연구용 계산도 검증된 적중 확률이 아닙니다. 업종·기업 뉴스가 없으면 이 빈자리를 공통 뉴스로 채우지 않습니다. 아래 JSON 추가는 대상 기업만 명시한 근거를 받습니다.</p>
          <button onClick={()=>{stockNewsTarget.current=selected;newsRef.current?.click();}}>이 기업 뉴스 JSON 추가</button>
          <div className="detail-news">
            {selectedAsset.news.map((p: any) => (
              <NewsCard
                key={p.id}
                e={
                  version.eventGate.accepted.find((e: any) => e.id === p.id) ??
                  p
                }
                profile={p}
              />
            ))}
          </div>
          <details>
            <summary>뉴스를 넣지 않은 계산과 비교</summary>
            <p>
              같은 일반일 난수로 계산한 비교 가격입니다. 뉴스 효과의 인과 검증을
              뜻하지 않습니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>10/30</th>
                  <th>뉴스 반영</th>
                  <th>뉴스 제외</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>예상 중앙값</td>
                  <td>{money(selectedAsset.rows.at(-1).p50)}원</td>
                  <td>{money(selectedAsset.rows.at(-1).noNewsP50)}원</td>
                </tr>
              </tbody>
            </table>
          </details>
        </Modal>
      )}
      {modal === "tools" && <Modal title="설정·자료" onClose={()=>setModal(null)}>
        <div className="tools-status"><span className="storage-indicator"><i className={storage === "운영 서버 연결" ? "connected" : ""}/>{storage}</span><p>보관 종가 기준 {actualLatest} · {collectionStatus}. {serverStateSeen.current?'서버 연결과 예약 수집의 실행 여부는 별도입니다. 연결이 끊겨도 서버 기록을 이 기기 자료로 대체하지 않습니다.':'정적 페이지에서는 예약 수집이 실행되지 않습니다.'}</p></div>
        <div className="tools-grid">
          <button data-tool-action="calculate" onClick={()=>{setModal(null);setTab('data');}}><b>현재 계산 자료</b><span>52종목 계수·공동 경로 결과 확인</span></button>
          <button data-tool-action="settings" onClick={()=>setModal('settings')}><b>갱신·설정</b><span>수집 상태·서버 연결·관리자 설정</span></button>
          <button onClick={()=>{setModal(null);setTab('math');}}><b>계산 방식</b><span>방정식·입력 조건·근거 확인</span></button>
          <button onClick={()=>{setModal(null);setTab('data');}}><b>자료·운영 기록</b><span>수집 실패·발행 이력·파일 내보내기</span></button>
        </div>
      </Modal>}
      {modal === "calculate" && (
        <Modal
          title="새 전망 계산"
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          <p>
            선택한 날짜의 종가와 그때까지 알려진 예정 뉴스로 52종목을
            계산합니다. 이전 전망은 보존됩니다.
          </p>
          <div className="form-grid">
            <label>
              출발 종가일
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                {origins.map((d: string) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              몬테카를로 경로 수
              <select
                value={paths}
                onChange={(e) => setPaths(Number(e.target.value))}
              >
                {[2000, 10000, 20000].map((n) => (
                  <option key={n} value={n}>
                    {n.toLocaleString()}개 경로
                  </option>
                ))}
              </select>
            </label>
          </div>
          {serverStateSeen.current && (
            <label className="form-label">
              관리자 키
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
              />
            </label>
          )}
          <button className="primary" disabled={busy} onClick={() => compute()}>
            {busy ? "뉴스 반응 계산 중…" : "52종목 계산하고 적용"}
          </button>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="자동 갱신·설정" onClose={() => setModal(null)}>
          <p>
            <b>{storage}</b>
          </p>
          <p>매일 한국시간 16시 수집은 서버의 예약 함수가 배포·설정되어 실제로 실행된 경우에만 동작합니다. 서버 연결이나 관리자 키 설정만으로 자동 수집 완료를 뜻하지 않습니다. 실행 결과는 아래 최근 수집 기록으로 확인합니다.</p>
          {storage !== "운영 서버 연결" && (
            <div className="context-note">
              현재 서버 연결이 없습니다. ZIP을 정적 페이지로만 올리면 예약
              수집이 실행되지 않습니다. 아래 배포 안내에 따라 Netlify 함수를
              함께 배포하세요.
            </div>
          )}
          <label className="form-label">
            관리자 키
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="서버에 등록한 관리자 키"
              autoComplete="off"
            />
          </label>
          <div className="actions-panel">
            <button
              className="primary"
              disabled={busy || storage !== "운영 서버 연결"}
              onClick={refresh}
            >
              지금 가격·뉴스 갱신
            </button>
            <button onClick={sync}>연결 다시 확인</button>
            <a href="/downloads/DEPLOY.md" download>
              자동 갱신 배포 안내 ↓
            </a>
          </div>
          {latestLog && (
            <p className="muted">
              최근 수집 {stamp(latestLog.at)} · 최신 종가 {latestLog.fresh}/52
            </p>
          )}
          <p className="muted">
            관리자 키는 브라우저 저장소에 저장하지 않습니다. 종가 수집 실패나
            뉴스 원문 변경은 운영 기록에서 확인합니다.
          </p>
        </Modal>
      )}
    </main>
  );
}

function PrecisionDetails({row}:{row:any}) {
 const p=row?.numericalPrecision;
 if(!p)return null;
 const single=p.singleDistribution,all=p.wholeForecast;
 const band=(v:any)=>`${v.lower.toLocaleString("ko-KR",{maximumFractionDigits:2})} ~ ${v.upper==null?"상한 미정":v.upper.toLocaleString("ko-KR",{maximumFractionDigits:2})}원`;
 return <div data-numerical-precision>
 <p>계산 표본 {p.paths.toLocaleString()}개 · 고정 경로 DKW 오차 구간</p>
 <p>중앙값의 계산 오차 구간: {band(single.p50)}. 이 종목·날짜 분포에 대한 95% 표본 오차 기준입니다.</p>
 <p>52종목·전체 날짜를 함께 비교할 때의 중앙값 계산 오차 구간: {band(all.p50)}. 모형 상승 비중 범위: {(all.probability[0]*100).toFixed(2)}~{(all.probability[1]*100).toFixed(2)}%.</p>
 <p>동일한 고정 모형에서 독립 경로를 다시 뽑는다는 가정의 계산 오차입니다. 실제 시장 가격의 95% 범위가 아닙니다. 첫 거래일은 가능한 반응과 가중치를 직접 합산하므로 난수 오차가 없습니다.</p>
 <a href="/downloads/ATLAS_PRECISION_7_6.md" download>계산식·검사 결과</a>
 </div>;
}
