/**
 * The state chart: air temperature against humidity, with your point in it.
 *
 * Why this shape and not a gauge or a set of tiles.
 *
 * The data here is not a number. It is *one operating point in a
 * two-dimensional state space that has regions* — and the whole insight the
 * tool exists to deliver is positional: 45 °C dry air and 35 °C humid air sit
 * in completely different places, and the cooler-looking one is the deadly
 * one. A dial showing "32.1" can state that number but cannot show that
 * relationship, because the relationship *is* the second dimension.
 *
 * So: the psychrometric chart, the form thermodynamics already settled on for
 * exactly these data. Every line in it is computed from `psychro.js`, never
 * drawn by eye — the wet-bulb isopleths are found by solving for the humidity
 * at which the wet bulb equals a given value, so the picture and the numbers
 * cannot drift apart.
 *
 * The vertical axis is relative humidity rather than the thermodynamically
 * tidier vapour pressure. That is a deliberate trade: it bends the isopleths
 * into curves, and it means the axis carries the number people actually have
 * from their weather app. A chart whose axis nobody can read is decoration.
 */

import { WET_BULB_LIMITS, fanVerdict, wetBulb } from './psychro.js';

export const DOMAIN = {
  minTemp: 15,
  maxTemp: 50,
  minHumidity: 0,
  maxHumidity: 100,
};

const PAD = { left: 46, right: 14, top: 16, bottom: 40 };
const SIZE = { width: 420, height: 300 };

export const plotWidth = SIZE.width - PAD.left - PAD.right;
export const plotHeight = SIZE.height - PAD.top - PAD.bottom;

export const toX = (celsius) =>
  PAD.left +
  ((celsius - DOMAIN.minTemp) / (DOMAIN.maxTemp - DOMAIN.minTemp)) * plotWidth;

export const toY = (humidity) =>
  PAD.top + (1 - (humidity - DOMAIN.minHumidity) / (DOMAIN.maxHumidity - DOMAIN.minHumidity)) * plotHeight;

export const fromX = (x) =>
  DOMAIN.minTemp + ((x - PAD.left) / plotWidth) * (DOMAIN.maxTemp - DOMAIN.minTemp);

export const fromY = (y) =>
  DOMAIN.maxHumidity - ((y - PAD.top) / plotHeight) * (DOMAIN.maxHumidity - DOMAIN.minHumidity);

export const clampTemp = (celsius) =>
  Math.min(DOMAIN.maxTemp, Math.max(DOMAIN.minTemp, celsius));
export const clampHumidity = (humidity) =>
  Math.min(DOMAIN.maxHumidity, Math.max(DOMAIN.minHumidity, humidity));

const escape = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const round = (value) => Math.round(value * 100) / 100;

/**
 * Humidity at which the wet bulb equals `target`, at a given air temperature.
 *
 * Solved by bisection rather than inverted algebraically: Stull's fit has no
 * closed-form inverse, and bisection is exact to whatever tolerance we ask
 * for on a function this well behaved (wet bulb rises monotonically with
 * humidity, which the test suite pins separately).
 */
export function humidityForWetBulb(celsius, target) {
  if (wetBulb(celsius, 100) < target) return null; // unreachable at this temperature
  if (wetBulb(celsius, 0) > target) return 0; // already past it, even bone dry

  let low = 0;
  let high = 100;
  for (let step = 0; step < 40; step += 1) {
    const mid = (low + high) / 2;
    if (wetBulb(celsius, mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** A wet-bulb isopleth as a polyline across the chart. */
export function isopleth(target, steps = 60) {
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const celsius =
      DOMAIN.minTemp + ((DOMAIN.maxTemp - DOMAIN.minTemp) * index) / steps;
    const humidity = humidityForWetBulb(celsius, target);
    if (humidity === null || humidity > 100) continue;
    points.push({ celsius, humidity });
  }
  return points;
}

const toPath = (points) =>
  points
    .map((p, index) => `${index === 0 ? 'M' : 'L'}${round(toX(p.celsius))} ${round(toY(p.humidity))}`)
    .join(' ');

/**
 * The band where a fan stops helping, traced from `fanVerdict`.
 *
 * Drawn as a region rather than described in a sentence because its shape is
 * the argument: it closes in from *both* sides — too humid to evaporate into,
 * too dry for extra air flow to add anything — and no wording conveys that as
 * quickly as seeing the gap narrow.
 */
export function fanHarmRegion(steps = 48) {
  const upper = [];
  const lower = [];

  for (let index = 0; index <= steps; index += 1) {
    const celsius = DOMAIN.minTemp + ((DOMAIN.maxTemp - DOMAIN.minTemp) * index) / steps;

    let harmfulAbove = null;
    let harmfulBelow = null;
    for (let rh = 100; rh >= 0; rh -= 2) {
      if (fanVerdict(celsius, rh).verdict === 'harmful') harmfulAbove = rh;
      else break;
    }
    for (let rh = 0; rh <= 100; rh += 2) {
      if (fanVerdict(celsius, rh).verdict === 'harmful') harmfulBelow = rh;
      else break;
    }
    if (harmfulAbove !== null) upper.push({ celsius, humidity: harmfulAbove });
    if (harmfulBelow !== null) lower.push({ celsius, humidity: harmfulBelow });
  }

  return { upper, lower };
}

export function render(state) {
  const { celsius, humidity, threshold } = state;
  const parts = [];

  // --- grid ---------------------------------------------------------------
  const temperatureTicks = [15, 20, 25, 30, 35, 40, 45, 50];
  const humidityTicks = [0, 20, 40, 60, 80, 100];

  for (const tick of temperatureTicks) {
    parts.push(
      `<line class="wb-grid" x1="${round(toX(tick))}" y1="${PAD.top}" ` +
        `x2="${round(toX(tick))}" y2="${PAD.top + plotHeight}" />`
    );
    parts.push(
      `<text class="wb-tick" x="${round(toX(tick))}" y="${PAD.top + plotHeight + 14}" ` +
        `text-anchor="middle">${tick}</text>`
    );
  }
  for (const tick of humidityTicks) {
    parts.push(
      `<line class="wb-grid" x1="${PAD.left}" y1="${round(toY(tick))}" ` +
        `x2="${PAD.left + plotWidth}" y2="${round(toY(tick))}" />`
    );
    parts.push(
      `<text class="wb-tick" x="${PAD.left - 6}" y="${round(toY(tick)) + 3}" ` +
        `text-anchor="end">${tick}</text>`
    );
  }

  // --- the danger region, as a filled area under the measured limit --------
  const measured = isopleth(WET_BULB_LIMITS.measuredYoungHealthy);
  if (measured.length > 1) {
    const area =
      toPath(measured) +
      ` L${round(toX(measured.at(-1).celsius))} ${round(toY(100))}` +
      ` L${round(toX(measured[0].celsius))} ${round(toY(100))} Z`;
    parts.push(`<path class="wb-zone-danger" d="${area}" />`);
  }

  // --- wet-bulb isopleths --------------------------------------------------
  for (const target of [20, 24, 28, 31, 35]) {
    const line = isopleth(target);
    if (line.length < 2) continue;

    const isLimit = target === WET_BULB_LIMITS.measuredYoungHealthy;
    const isTheoretical = target === WET_BULB_LIMITS.theoretical;
    const className = isLimit
      ? 'wb-iso wb-iso-measured'
      : isTheoretical
        ? 'wb-iso wb-iso-theoretical'
        : 'wb-iso';

    parts.push(`<path class="${className}" d="${toPath(line)}" />`);

    const label = line[Math.floor(line.length * 0.62)];
    if (label) {
      const labelClass = isLimit
        ? ' wb-iso-label-limit'
        : isTheoretical
          ? ' wb-iso-label-theoretical'
          : '';
      parts.push(
        `<text class="wb-iso-label${labelClass}" ` +
          `x="${round(toX(label.celsius))}" y="${round(toY(label.humidity)) - 4}">` +
          `${target}°</text>`
      );
    }
  }

  // --- the personal threshold, if it differs from the reference ------------
  if (threshold !== undefined && Math.abs(threshold - WET_BULB_LIMITS.measuredYoungHealthy) > 0.2) {
    const personal = isopleth(threshold);
    if (personal.length > 1) {
      parts.push(`<path class="wb-iso wb-iso-personal" d="${toPath(personal)}" />`);
      const label = personal[Math.floor(personal.length * 0.3)];
      if (label) {
        parts.push(
          `<text class="wb-iso-label wb-iso-label-personal" ` +
            `x="${round(toX(label.celsius))}" y="${round(toY(label.humidity)) - 4}">you</text>`
        );
      }
    }
  }

  // --- fan-harm boundary ---------------------------------------------------
  const fan = fanHarmRegion();
  if (fan.upper.length > 1) {
    parts.push(`<path class="wb-fan-edge" d="${toPath(fan.upper)}" />`);
  }
  if (fan.lower.length > 1) {
    parts.push(`<path class="wb-fan-edge" d="${toPath(fan.lower)}" />`);
  }

  // --- the operating point -------------------------------------------------
  const px = round(toX(clampTemp(celsius)));
  const py = round(toY(clampHumidity(humidity)));
  const tw = wetBulb(celsius, humidity);

  parts.push(
    `<line class="wb-crosshair" x1="${PAD.left}" y1="${py}" x2="${px}" y2="${py}" />` +
      `<line class="wb-crosshair" x1="${px}" y1="${PAD.top + plotHeight}" x2="${px}" y2="${py}" />`
  );
  parts.push(`<circle class="wb-point-halo" cx="${px}" cy="${py}" r="11" />`);
  parts.push(`<circle class="wb-point" cx="${px}" cy="${py}" r="5" />`);
  parts.push(
    `<title>${escape(
      `${celsius.toFixed(1)} °C at ${humidity.toFixed(0)} % — wet bulb ${tw.toFixed(1)} °C`
    )}</title>`
  );

  // --- axis titles ---------------------------------------------------------
  parts.push(
    `<text class="wb-axis" x="${PAD.left + plotWidth / 2}" y="${SIZE.height - 6}" ` +
      `text-anchor="middle">air temperature °C</text>`
  );
  parts.push(
    `<text class="wb-axis" transform="rotate(-90 12 ${PAD.top + plotHeight / 2})" ` +
      `x="12" y="${PAD.top + plotHeight / 2}" text-anchor="middle">relative humidity %</text>`
  );

  return (
    `<svg viewBox="0 0 ${SIZE.width} ${SIZE.height}" class="wb-chart-svg" ` +
    `role="img" aria-label="${escape(
      `Air state chart. Your point: ${celsius.toFixed(1)} degrees at ${humidity.toFixed(0)} percent humidity, ` +
        `wet bulb ${tw.toFixed(1)} degrees.`
    )}">${parts.join('')}</svg>`
  );
}

export const GEOMETRY = { PAD, SIZE };
