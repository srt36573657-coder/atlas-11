import { forecast, checkForecast } from "../lib/forecast-engine.mjs";
import {buildPressHistoryReport,pressSnapshot} from '../lib/press-history.mjs';
self.onmessage = ({ data }) => {
  try {
    const pressCutoff=data.pressCutoff??new Date().toISOString();
    if(data.pressData)pressSnapshot(data.pressData,{cutoff:pressCutoff,stockCodes:data.input.assets.map(a=>a.code)});
    const version = forecast(data.input, data.options);
    const checks = checkForecast(version, data.input);
    if (!checks.ok || !checks.complete)
      throw Error(
        [
          ...checks.errors,
          ...version.blocked.map((a) => a.name + ": " + a.reason),
        ].join(", "),
      );
    const pressReport=data.pressData?buildPressHistoryReport(data.input,version,data.pressData,{cutoff:pressCutoff}):null;
    self.postMessage({ ok: true, version, checks, pressReport });
  } catch (e) {
    self.postMessage({ ok: false, error: e.message });
  }
};
