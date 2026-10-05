import React from "react";
import { createRoot } from "react-dom/client";
import Atlas from "./atlas";
import {RollingHome} from "./rolling";
import "./workspace.css";
import "./factor36-theme.css";

class ScreenBoundary extends React.Component<any,{error:string|null}>{
  state={error:null as string|null};
  static getDerivedStateFromError(error:Error){return{error:error.message};}
  render(){return this.state.error?<main className="atlas-loading atlas-failure" data-atelier="8.4" role="alert"><img src="/atlas-mark.svg" alt="" width="64" height="64"/><span className="loading-edition">ATLAS</span><h1>화면을 다시 열어 주세요</h1><p>저장된 전망은 그대로 보존됩니다.</p><details><summary>오류 내용</summary>{this.state.error}</details><button className="primary" onClick={()=>location.reload()}>다시 열기</button></main>:this.props.children;}
}
const root = createRoot(document.getElementById("root")!);
const archiveRequested = new URLSearchParams(window.location.search).get("view")==="legacy";
if (!archiveRequested) {
  root.render(<ScreenBoundary><RollingHome/></ScreenBoundary>);
} else {
root.render(
  <main className="atlas-loading" role="status" aria-live="polite"><img src="/atlas-mark.svg" alt="" width="64" height="64"/><span className="loading-edition">ATLAS</span><h1>예측과 실제, 한눈에</h1><p>52종목의 그래프와 날짜별 근거를 불러오고 있습니다…</p><span className="loading-rule" aria-hidden="true"/></main>,
);
fetch("/data/atlas.json")
  .then((r) => {
    if (!r.ok) throw Error("자료 파일을 찾을 수 없습니다.");
    return r.json();
  })
  .then((data) => root.render(<ScreenBoundary><Atlas initial={data} /></ScreenBoundary>))
  .catch((e) =>
    root.render(
      <main className="atlas-loading atlas-failure" data-atelier="8.4" role="alert">
        <img src="/atlas-mark.svg" alt="" width="64" height="64"/>
        <span className="loading-edition">ATLAS</span>
        <h1>자료를 불러오지 못했습니다</h1>
        <p>{e.message}</p>
        <p>ZIP 안의 전체 파일을 함께 배포해야 합니다.</p>
        <button className="primary" onClick={() => location.reload()}>다시 불러오기</button>
      </main>,
    ),
  );

}
