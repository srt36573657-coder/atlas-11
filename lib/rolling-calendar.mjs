/** Bounded, explicitly sourced KRX sessions. Never invent weekdays beyond reviewed coverage. */
export const ROLLING_CALENDAR_SCHEMA = 'atlas-rolling-calendar-1';
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
export function isCalendarDate(day) {
  return typeof day === 'string' && ISO_DAY.test(day) && Number.isFinite(Date.parse(day)) && new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day;
}
export function validateRollingCalendar(calendar) {
  if (!calendar || !Array.isArray(calendar.sessions) || !calendar.sessions.length) throw Error('ROLLING_CALENDAR_REQUIRED');
  let prior = '';
  for (const day of calendar.sessions) {
    if (!isCalendarDate(day) || day <= prior || [0, 6].includes(new Date(day + 'T00:00:00Z').getUTCDay()) || calendar.holidays?.[day]) throw Error('ROLLING_CALENDAR_INVALID_SESSION:' + day);
    prior = day;
  }
  if (calendar.coverageEnd && (!isCalendarDate(calendar.coverageEnd) || calendar.sessions.at(-1) > calendar.coverageEnd)) throw Error('ROLLING_CALENDAR_COVERAGE');
  return calendar;
}
export function nextTradingSessions(calendar, origin, count = 20) {
  validateRollingCalendar(calendar);
  if (!isCalendarDate(origin) || !calendar.sessions.includes(origin)) throw Error('ROLLING_ORIGIN_NOT_SESSION');
  if (!Number.isInteger(count) || count < 1 || count > 252) throw Error('ROLLING_HORIZON');
  const selected = calendar.sessions.filter(day => day > origin).slice(0, count);
  if (selected.length !== count) throw Error('ROLLING_CALENDAR_COVERAGE_EXHAUSTED');
  return selected;
}
export function priorTradingSession(calendar, target, age) {
  validateRollingCalendar(calendar);
  if (!Number.isInteger(age) || age < 1) throw Error('ROLLING_LOOKBACK');
  const index = calendar.sessions.indexOf(target);
  if (index < 0) throw Error('ROLLING_TARGET_NOT_SESSION');
  return calendar.sessions[index - age] ?? null;
}
/** Date-only arithmetic remains UTC in every machine timezone. */
export function extendReviewedCalendar(base, { coverageEnd, holidays = {}, sources, checkedAt, notices = [] }) {
  validateRollingCalendar(base);
  if (!isCalendarDate(coverageEnd) || coverageEnd > '2026-11-30' || coverageEnd < base.sessions.at(-1) || !Array.isArray(sources) || !sources.length || !Number.isFinite(Date.parse(checkedAt))) throw Error('ROLLING_REVIEW_REQUIRED');
  const combined = { ...(base.holidays ?? {}), ...holidays }, sessions = [...base.sessions];
  for (let time = Date.parse(base.sessions.at(-1) + 'T00:00:00Z') + 86400000; time <= Date.parse(coverageEnd + 'T00:00:00Z'); time += 86400000) {
    const date = new Date(time), day = date.toISOString().slice(0, 10);
    if (![0, 6].includes(date.getUTCDay()) && !combined[day]) sessions.push(day);
  }
  return validateRollingCalendar({schema: ROLLING_CALENDAR_SCHEMA, timezone:'Asia/Seoul', sessions, holidays: combined, coverageStart: sessions[0], coverageEnd, checkedAt, status:'official_holiday_rules_and_published_calendar; special_exchange_closures_subject_to_updates', sources, notices, historicalSessionsPreserved: true});
}
/** Schedule eligibility is separate from a provider's final-close confirmation. */
export function sessionCloseGate(calendar, now = new Date()) {
  validateRollingCalendar(calendar);
  if (!Number.isFinite(now.getTime())) throw Error('ROLLING_INVALID_TIME');
  const local = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'}).format(now), day = local.slice(0, 10);
  if (day > (calendar.coverageEnd ?? calendar.sessions.at(-1))) return {day, status:'calendar_review_required', mayCollectFinalClose:false};
  if (!calendar.sessions.includes(day)) return {day, status:'non_trading_day', mayCollectFinalClose:false};
  const special = calendar.notices?.find(n => n.date === day && n.requiresCloseReview);
  if (special) return {day, status:'special_close_unverified', mayCollectFinalClose:false, reason:special.reason};
  const time = local.slice(11, 16), afterRegularClose = time > '15:30';
  return {day, status:afterRegularClose?'await_final_provider_close':'before_regular_close', regularClose:'15:30', mayCollectFinalClose:afterRegularClose, providerFinalRequired:true, targetDeadline:'16:00', beforeTargetDeadline:time<'16:00'};
}
