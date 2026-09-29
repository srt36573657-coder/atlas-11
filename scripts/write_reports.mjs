// Old feature report writers certify immutable historical installation snapshots.
// A later numerical release writes its own current report without rewriting those snapshots.
import fs from 'node:fs';
const current=JSON.parse(fs.readFileSync('public/data/atlas.json'));
const dailyAt=Date.parse(current.dailyRefresh?.at??current.dailyRefresh?.startedAt??'');
if(JSON.parse(fs.readFileSync('package.json')).version==='10.0.0'){
 await import('./write_rolling_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.5.0'){
 await import('./build_newspaper_evidence.mjs');
 await import('./write_completion_status.mjs');
 await import('./write_completion_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.4.0'){
 await import('./write_factor36_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.3.0'){
 await import('./write_race52_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.2.0'){
 await import('./write_wave_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.1.2'){
 await import('./write_session_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.1.1'){
 await import('./write_pulse_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.1.0'){
 await import('./write_fomo_v2_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='9.0.0'){
 await import('./write_workspace_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.9.0'){
 await import('./write_focus_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.8.0'){
 await import('./write_studio_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.7.0'){
 await import('./write_learned_design_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.6.1'){
 await import('./write_single_view_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.6.0'){
 await import('./write_sealed_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.5.0'){
 await import('./write_clarity_report.mjs');
}else if(JSON.parse(fs.readFileSync('package.json')).version==='8.4.0'){
 await import('./write_atelier_report.mjs');
}else if(current.breaking){
 await import('./write_breaking_report.mjs');
}else if(current.evolution){
 await import('./write_evolution_report.mjs');
}else if(current.auditRelease && !(Number.isFinite(dailyAt)&&dailyAt>Date.parse(current.auditRelease.at))){
 await import('./write_audit_release_report.mjs');
}else if(JSON.parse(fs.readFileSync('public/data/atlas.json')).dailyRefresh){
 await import('./write_daily_refresh_report.mjs');
}else if(JSON.parse(fs.readFileSync('public/data/atlas.json')).conditionalUpdate){
 await import('./write_implementation_v8_reports.mjs');
}else{
await import('./write_reports_v7.mjs');
if(JSON.parse(fs.readFileSync('public/data/atlas.json')).precisionUpdate){
 await import('./write_precision_reports.mjs');
}else{
 await import('./write_fomo_reports.mjs');
 await import('./write_cycle_reports.mjs');
 await import('./write_press_reports.mjs');
}

}
