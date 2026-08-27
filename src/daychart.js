/**
 * The day chart: two temperature curves and the hours where one crosses under
 * the other.
 *
 * Different data from the state chart, so deliberately a different instrument.
 * Here the shape is a *time series with a crossing*, and the crossing is the
 * whole answer: it is the hour at which opening a window stops importing heat
 * and starts exporting it.
 *
 * Both curves are drawn dashed. They are reconstructed from a high and a low,
 * not measured, and a modelled curve drawn with a solid confident line is a
 * lie told with stroke-width. The shaded band is the only thing here that is a
 * conclusion rather than an estimate, so it is the only filled shape.
 */

import { n, t } from './i18n/index.js';
import { BUILDINGS_BY_ID, indoorCurve, outdoorCurve, ventilationWindow } from './cooling.js';

const SIZE = { width: 420, height: 220 };
const PAD = { left: 34, right: 12, top: 14, bottom: 30 };

const plotWidth = SIZE.width - PAD.left - PAD.right;
const plotHeight = SIZE.height - PAD.top - PAD.bottom;

const round = (value) => Math.round(value * 100) / 100;

const escape = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function render(low, high, buildingId, currentHour = null) {
  const outdoor = outdoorCurve(low, high);
  const indoor = indoorCurve(low, high, buildingId);
  const windowResult = ventilationWindow(low, high, buildingId);

  const all = [...outdoor, ...indoor];
  const min = Math.floor(Math.min(...all) - 1);
  const max = Math.ceil(Math.max(...all) + 1);

  const toX = (hour) => PAD.left + (hour / 23) * plotWidth;
  const toY = (value) => PAD.top + (1 - (value - min) / (max - min)) * plotHeight;

  const parts = [];

  // --- grid ---------------------------------------------------------------
  for (const hour of [0, 6, 12, 18, 23]) {
    parts.push(
      `<line class="wb-day-grid" x1="${round(toX(hour))}" y1="${PAD.top}" ` +
        `x2="${round(toX(hour))}" y2="${PAD.top + plotHeight}" />`
    );
    parts.push(
      `<text class="wb-tick" x="${round(toX(hour))}" y="${PAD.top + plotHeight + 13}" ` +
        `text-anchor="middle">${String(hour).padStart(2, '0')}</text>`
    );
  }

  const step = max - min > 20 ? 10 : 5;
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) {
    parts.push(
      `<line class="wb-day-grid" x1="${PAD.left}" y1="${round(toY(value))}" ` +
        `x2="${PAD.left + plotWidth}" y2="${round(toY(value))}" />`
    );
    parts.push(
      `<text class="wb-tick" x="${PAD.left - 5}" y="${round(toY(value)) + 3}" ` +
        `text-anchor="end">${value}</text>`
    );
  }

  // --- the ventilation window, as a band -----------------------------------
  // Drawn per hour rather than as one rectangle so a window that wraps past
  // midnight appears as the two visible pieces it actually is on this axis.
  for (const entry of windowResult.hours) {
    if (!entry.open) continue;
    const x = toX(entry.hour) - plotWidth / 46;
    parts.push(
      `<rect class="wb-day-window" x="${round(Math.max(PAD.left, x))}" y="${PAD.top}" ` +
        `width="${round(plotWidth / 23)}" height="${plotHeight}" />`
    );
  }

  // --- curves --------------------------------------------------------------
  const path = (values) =>
    values
      .map((value, hour) => `${hour === 0 ? 'M' : 'L'}${round(toX(hour))} ${round(toY(value))}`)
      .join(' ');

  parts.push(`<path class="wb-day-indoor" d="${path(indoor)}" />`);
  parts.push(`<path class="wb-day-outdoor" d="${path(outdoor)}" />`);

  if (currentHour !== null) {
    parts.push(
      `<line class="wb-day-now" x1="${round(toX(currentHour))}" y1="${PAD.top}" ` +
        `x2="${round(toX(currentHour))}" y2="${PAD.top + plotHeight}" />`
    );
  }

  parts.push(
    `<text class="wb-axis" x="${PAD.left + plotWidth / 2}" y="${SIZE.height - 4}" ` +
      `text-anchor="middle">${escape(t('day.axisHour'))}</text>`
  );
  parts.push(
    `<text class="wb-axis" transform="rotate(-90 10 ${PAD.top + plotHeight / 2})" ` +
      `x="10" y="${PAD.top + plotHeight / 2}" text-anchor="middle">${escape(t('day.axisCelsius'))}</text>`
  );

  const hhmm = (hour) => `${String(hour % 24).padStart(2, '0')}:00`;
  const description = windowResult.any
    ? t('day.windowSummary', {
        opens: hhmm(windowResult.opensAt),
        closes: hhmm(windowResult.closesAt + 1),
        best: hhmm(windowResult.bestHour),
        gain: n(windowResult.bestGain, 1),
      })
    : t('day.windowNone');

  return {
    svg:
      `<svg viewBox="0 0 ${SIZE.width} ${SIZE.height}" class="wb-chart-svg" role="img" ` +
      `aria-label="${escape(`${t('day.subModelled').replace(/<[^>]+>/g, '')} ${description}`)}">` +
      parts.join('') +
      `</svg>`,
    window: windowResult,
    building: BUILDINGS_BY_ID.get(buildingId) ?? BUILDINGS_BY_ID.get('medium'),
  };
}
