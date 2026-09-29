// Presentation rules. These never change a stored forecast or market input.
export const DAILY_VIEW = Object.freeze({
  version: 'atlas-daily-view-1.0.0',
  assetCount: 52,
  origin: '2026-09-17',
  end: '2026-10-30',
  defaultSpeedMs: 1000,
  showEntireForecast: true,
  replayUnit: 'trading_session',
  priceSeries: 'p50',
  holidayPolicy: 'reference_previous_session_without_new_price_row',
  importantNewsPolicy: 'wait_for_explicit_continue',
  trustProbability: null,
});

export function calendarPosition(date, origin, end) {
  const span = Date.parse(end + 'T00:00:00Z') - Date.parse(origin + 'T00:00:00Z');
  const position = (Date.parse(date + 'T00:00:00Z') - Date.parse(origin + 'T00:00:00Z')) / span;
  return Number.isFinite(position) ? Math.max(0, Math.min(1, position)) : 0;
}

export function isPlottablePrice(value) {
  return Number.isFinite(value) && value > 0;
}
