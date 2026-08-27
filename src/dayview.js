/**
 * The day, drawn from measured hours.
 *
 * Two instruments, because there are two questions and they have different
 * shapes:
 *
 *   `renderDay`    — a time series against a threshold, with the hottest hour
 *                    and the most dangerous hour marked *separately*. The gap
 *                    between those two markers is the whole point: they are
 *                    six hours apart in Delhi, nine in Tokyo, and nobody who
 *                    reads a thermometer would guess it.
 *
 *   `renderNights` — fourteen discrete cells, one per night. A different
 *                    cardinality wants a different form: not a curve but a
 *                    sequence, because what matters is *how many in a row*.
 *
 * Solid strokes here, unlike the modelled chart this replaces: these hours are
 * measured. The indoor curve stays dashed, because a room still has no sensor
 * in it.
 */

import { WET_BULB_LIMITS } from './psychro.js';

const DAY = { width: 460, height: 230 };
const DAY_PAD = { left: 38, right: 14, top: 18, bottom: 34 };

const dayWidth = DAY.width - DAY_PAD.left - DAY_PAD.right;
const dayHeight = DAY.height - DAY_PAD.top - DAY_PAD.bottom;

const round = (value) => Math.round(value * 100) / 100;
const pad2 = (value) => String(value).padStart(2, '0');

const escape = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * The wet bulb through the day, against the threshold for this person.
 */
export function renderDay(hours, { threshold, ventilation = null, nowHour = null } = {}) {
  const usable = hours.filter((entry) => entry.wetBulb !== null);
  if (usable.length < 6) {
    return `<svg viewBox="0 0 ${DAY.width} ${DAY.height}" class="wb-chart-svg" role="img" ` +
      `aria-label="Not enough hourly data to draw the day."><text class="wb-axis" ` +
      `x="${DAY.width / 2}" y="${DAY.height / 2}" text-anchor="middle">not enough data</text></svg>`;
  }

  const values = usable.map((entry) => entry.wetBulb);
  const ceiling = Math.max(...values, threshold, WET_BULB_LIMITS.measuredYoungHealthy) + 2;
  const floor = Math.min(...values, threshold) - 2;

  const toX = (hour) => DAY_PAD.left + (hour / 23) * dayWidth;
  const toY = (value) =>
    DAY_PAD.top + (1 - (value - floor) / (ceiling - floor)) * dayHeight;

  const parts = [];

  // --- grid ---------------------------------------------------------------
  for (const hour of [0, 6, 12, 18, 23]) {
    parts.push(
      `<line class="wb-day-grid" x1="${round(toX(hour))}" y1="${DAY_PAD.top}" ` +
        `x2="${round(toX(hour))}" y2="${DAY_PAD.top + dayHeight}" />`
    );
    parts.push(
      `<text class="wb-tick" x="${round(toX(hour))}" y="${DAY_PAD.top + dayHeight + 13}" ` +
        `text-anchor="middle">${pad2(hour)}</text>`
    );
  }

  const step = ceiling - floor > 14 ? 5 : 2;
  for (let value = Math.ceil(floor / step) * step; value <= ceiling; value += step) {
    parts.push(
      `<text class="wb-tick" x="${DAY_PAD.left - 5}" y="${round(toY(value)) + 3}" ` +
        `text-anchor="end">${value}</text>`
    );
  }

  // --- the ventilation window, underneath everything -----------------------
  if (ventilation?.rows) {
    for (const row of ventilation.rows) {
      if (!row.open) continue;
      parts.push(
        `<rect class="wb-day-window" x="${round(toX(row.hour) - dayWidth / 46)}" ` +
          `y="${DAY_PAD.top}" width="${round(dayWidth / 23)}" height="${dayHeight}" />`
      );
    }
  }

  // --- the region above the personal threshold -----------------------------
  const overPath = [];
  let open = false;
  for (const entry of usable) {
    const above = entry.wetBulb >= threshold;
    if (above && !open) {
      overPath.push(`M${round(toX(entry.hour))} ${round(toY(threshold))}`);
      open = true;
    }
    if (above) overPath.push(`L${round(toX(entry.hour))} ${round(toY(entry.wetBulb))}`);
    if (!above && open) {
      overPath.push(`L${round(toX(entry.hour))} ${round(toY(threshold))} Z`);
      open = false;
    }
  }
  if (open) {
    const last = usable.at(-1);
    overPath.push(`L${round(toX(last.hour))} ${round(toY(threshold))} Z`);
  }
  if (overPath.length > 0) {
    parts.push(`<path class="wb-over-threshold" d="${overPath.join(' ')}" />`);
  }

  // --- threshold line ------------------------------------------------------
  parts.push(
    `<line class="wb-threshold-line" x1="${DAY_PAD.left}" y1="${round(toY(threshold))}" ` +
      `x2="${DAY_PAD.left + dayWidth}" y2="${round(toY(threshold))}" />`
  );
  parts.push(
    `<text class="wb-threshold-label" x="${DAY_PAD.left + dayWidth}" ` +
      `y="${round(toY(threshold)) - 4}" text-anchor="end">your threshold ${threshold.toFixed(1)}°</text>`
  );

  // --- the measured wet-bulb curve, solid because it is measured -----------
  const curve = usable
    .map((entry, index) => `${index === 0 ? 'M' : 'L'}${round(toX(entry.hour))} ${round(toY(entry.wetBulb))}`)
    .join(' ');
  parts.push(`<path class="wb-wetbulb-curve" d="${curve}" />`);

  // --- the two markers that must not be confused ---------------------------
  const hottest = usable.reduce((a, b) => (b.celsius > a.celsius ? b : a));
  const worst = usable.reduce((a, b) => (b.wetBulb > a.wetBulb ? b : a));

  parts.push(
    `<g class="wb-mark wb-mark-hot"><title>${escape(
      `Hottest hour: ${pad2(hottest.hour)}:00, ${hottest.celsius.toFixed(1)} °C`
    )}</title>` +
      `<line x1="${round(toX(hottest.hour))}" y1="${DAY_PAD.top + dayHeight}" ` +
      `x2="${round(toX(hottest.hour))}" y2="${round(toY(hottest.wetBulb))}" />` +
      `<circle cx="${round(toX(hottest.hour))}" cy="${round(toY(hottest.wetBulb))}" r="3.2" /></g>`
  );

  parts.push(
    `<g class="wb-mark wb-mark-worst"><title>${escape(
      `Most dangerous hour: ${pad2(worst.hour)}:00, wet bulb ${worst.wetBulb.toFixed(1)} °C`
    )}</title>` +
      `<line x1="${round(toX(worst.hour))}" y1="${DAY_PAD.top + dayHeight}" ` +
      `x2="${round(toX(worst.hour))}" y2="${round(toY(worst.wetBulb))}" />` +
      `<circle cx="${round(toX(worst.hour))}" cy="${round(toY(worst.wetBulb))}" r="4.5" /></g>`
  );

  if (nowHour !== null) {
    parts.push(
      `<line class="wb-day-now" x1="${round(toX(nowHour))}" y1="${DAY_PAD.top}" ` +
        `x2="${round(toX(nowHour))}" y2="${DAY_PAD.top + dayHeight}" />`
    );
  }

  parts.push(
    `<text class="wb-axis" x="${DAY_PAD.left + dayWidth / 2}" y="${DAY.height - 4}" ` +
      `text-anchor="middle">hour of day</text>`
  );
  parts.push(
    `<text class="wb-axis" transform="rotate(-90 10 ${DAY_PAD.top + dayHeight / 2})" ` +
      `x="10" y="${DAY_PAD.top + dayHeight / 2}" text-anchor="middle">wet bulb °C</text>`
  );

  return (
    `<svg viewBox="0 0 ${DAY.width} ${DAY.height}" class="wb-chart-svg" role="img" ` +
    `aria-label="${escape(
      `Wet-bulb temperature through the day. Hottest hour ${pad2(hottest.hour)}, ` +
        `most dangerous hour ${pad2(worst.hour)}.`
    )}">${parts.join('')}</svg>`
  );
}

const NIGHTS = { width: 460, height: 76 };

/**
 * Fourteen nights as fourteen cells.
 *
 * A curve would be wrong here. The question is not "how warm was each night"
 * but "how many in a row", and a run of filled cells answers that at a glance
 * in a way a line does not.
 */
export function renderNights(nights) {
  const cells = nights.nights;
  if (cells.length === 0) return '';

  const padding = { left: 8, right: 8, top: 20, bottom: 22 };
  const width = NIGHTS.width - padding.left - padding.right;
  const cellWidth = width / cells.length;
  const cellHeight = 26;

  const parts = [];

  cells.forEach((night, index) => {
    const x = padding.left + index * cellWidth;
    const isToday = index === nights.todayIndex;
    const classes = [
      'wb-night',
      night.tropical ? 'wb-night-hot' : 'wb-night-cool',
      Number.isFinite(night.minimum) ? '' : 'wb-night-unknown',
      isToday ? 'wb-night-today' : '',
    ]
      .filter(Boolean)
      .join(' ');

    parts.push(
      `<g class="${classes}"><title>${escape(
        `${night.date}: low ${Number.isFinite(night.minimum) ? `${night.minimum.toFixed(1)} °C` : 'unknown'}` +
          `${night.tropical ? ' — no relief' : ''}`
      )}</title>` +
        `<rect x="${round(x + 1)}" y="${padding.top}" width="${round(cellWidth - 2)}" ` +
        `height="${cellHeight}" /></g>`
    );
  });

  // Only the ends and today get a label: fourteen dates would be unreadable.
  const label = (index, text, anchor) =>
    `<text class="wb-tick" x="${round(padding.left + index * cellWidth + cellWidth / 2)}" ` +
    `y="${padding.top + cellHeight + 13}" text-anchor="${anchor}">${escape(text)}</text>`;

  parts.push(label(0, cells[0].date.slice(5), 'start'));
  parts.push(label(nights.todayIndex, 'today', 'middle'));
  parts.push(label(cells.length - 1, cells.at(-1).date.slice(5), 'end'));

  parts.push(
    `<text class="wb-axis" x="${padding.left}" y="13">nights below ${nights.threshold}°C give the body a chance</text>`
  );

  return (
    `<svg viewBox="0 0 ${NIGHTS.width} ${NIGHTS.height}" class="wb-chart-svg" role="img" ` +
    `aria-label="${escape(
      `${nights.longest} consecutive nights without relief in this window.`
    )}">${parts.join('')}</svg>`
  );
}
