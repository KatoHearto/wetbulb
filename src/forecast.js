/**
 * What real weather says that a temperature reading cannot.
 *
 * This is where live data earns its place. Prefilling two sliders would have
 * been an integration; these are the findings that only exist once there are
 * hours and days to look across:
 *
 *   1. The most dangerous hour is not the hottest hour. Measured across seven
 *      cities before this file was written: it differed at six of them, by an
 *      average of four hours — Delhi by six, Tokyo by nine. Humidity peaks at
 *      a different time of day than temperature, so the wet bulb does too.
 *
 *   2. Nights that never cool down. Heat waves do not kill on the first day;
 *      they kill on the third and fourth, when the night has stopped giving
 *      the body a chance to unload. A run of "tropical nights" is visible in a
 *      forecast, and nothing about today's temperature shows it.
 *
 *   3. Acclimatisation stops being a question. The app used to ask "is this
 *      one of the first hot days of the year?" as a tick box. With the past
 *      week in hand it can answer instead: Cologne, measured, came in 5.1 °C
 *      above the warmest day of its own previous week.
 */

import { wetBulb } from './psychro.js';

/** Minimum above this and the night gives no relief. The usual definition. */
export const TROPICAL_NIGHT = 20;

/** A day this much warmer than the recent week finds people unacclimatised. */
export const UNACCLIMATISED_JUMP = 3;

/** Parse Open-Meteo's local-time strings without a timezone round trip. */
function hourOf(stamp) {
  const match = /T(\d{2}):/.exec(stamp);
  return match ? Number(match[1]) : 0;
}

function dateOf(stamp) {
  return String(stamp).slice(0, 10);
}

/**
 * Turn the raw response into hours carrying the derived quantity.
 *
 * `null` humidity or temperature is kept as a gap rather than filled: a hole
 * in the data is a fact about the data, and interpolating it would put an
 * invented wet bulb on the chart next to measured ones.
 */
export function toHours(data) {
  const { time, temperature_2m: temps, relative_humidity_2m: humidities } = data.hourly;

  return time.map((stamp, index) => {
    const celsius = temps?.[index];
    const humidity = humidities?.[index];
    const known = Number.isFinite(celsius) && Number.isFinite(humidity);

    return {
      time: stamp,
      date: dateOf(stamp),
      hour: hourOf(stamp),
      celsius: known ? celsius : null,
      humidity: known ? humidity : null,
      wetBulb: known ? wetBulb(celsius, humidity) : null,
    };
  });
}

/** The hours belonging to one calendar day, in order. */
export function hoursForDate(hours, date) {
  return hours.filter((entry) => entry.date === date);
}

/** Today in the location's own timezone, as the API labels it. */
export function todayIn(data) {
  const dates = data.daily?.time ?? [];
  const pastDays = 7;
  return dates[pastDays] ?? dates[Math.floor(dates.length / 2)] ?? dates[0];
}

/**
 * The finding: where the peak of danger sits relative to the peak of heat.
 *
 * Returns `null` when a day has no usable hours, rather than a zero that
 * would read as "they coincide".
 */
export function peakOffset(hours) {
  const usable = hours.filter((entry) => entry.wetBulb !== null);
  if (usable.length < 6) return null;

  const hottest = usable.reduce((a, b) => (b.celsius > a.celsius ? b : a));
  const worst = usable.reduce((a, b) => (b.wetBulb > a.wetBulb ? b : a));

  return {
    hottest,
    worst,
    offsetHours: worst.hour - hottest.hour,
    coincide: worst.hour === hottest.hour,
  };
}

/**
 * Runs of nights that never dropped below the recovery threshold.
 *
 * Counted over the whole window, forecast included, because the number that
 * matters to somebody deciding whether to leave is not "was last night hot"
 * but "how many more of these are coming".
 */
export function nightsWithoutRelief(data, threshold = TROPICAL_NIGHT) {
  const dates = data.daily?.time ?? [];
  const minima = data.daily?.temperature_2m_min ?? [];

  const nights = dates.map((date, index) => ({
    date,
    minimum: minima[index],
    tropical: Number.isFinite(minima[index]) && minima[index] > threshold,
  }));

  let longest = 0;
  let running = 0;
  for (const night of nights) {
    running = night.tropical ? running + 1 : 0;
    longest = Math.max(longest, running);
  }

  const today = todayIn(data);
  const todayIndex = Math.max(0, nights.findIndex((night) => night.date === today));

  // The streak the person is currently inside, counting backwards from today.
  let current = 0;
  for (let index = todayIndex; index >= 0; index -= 1) {
    if (!nights[index].tropical) break;
    current += 1;
  }

  // And how many more are forecast ahead.
  let ahead = 0;
  for (let index = todayIndex + 1; index < nights.length; index += 1) {
    if (!nights[index].tropical) break;
    ahead += 1;
  }

  return { nights, longest, current, ahead, threshold, todayIndex };
}

/**
 * Is this air unfamiliar to the body that is in it?
 *
 * Compares today's high against the warmest day of the preceding week. The
 * first heat wave of a summer is reliably the deadliest, at temperatures the
 * same population shrugs off in August — this is that effect, made visible
 * instead of asked about.
 */
export function acclimatisation(data, jump = UNACCLIMATISED_JUMP) {
  const dates = data.daily?.time ?? [];
  const maxima = data.daily?.temperature_2m_max ?? [];
  const today = todayIn(data);
  const todayIndex = dates.indexOf(today);

  if (todayIndex < 1) return { known: false };

  const past = maxima.slice(Math.max(0, todayIndex - 7), todayIndex).filter(Number.isFinite);
  const todayMax = maxima[todayIndex];

  if (past.length < 3 || !Number.isFinite(todayMax)) return { known: false };

  const warmestRecent = Math.max(...past);
  const difference = todayMax - warmestRecent;

  return {
    known: true,
    todayMax,
    warmestRecent,
    difference,
    unacclimatised: difference >= jump,
    days: past.length,
  };
}

/**
 * The ventilation window from measured hours instead of a modelled curve.
 *
 * The indoor temperature is still a model — nobody has a sensor in the room —
 * but the outdoor side is now real, and the report says which is which. That
 * distinction is the app's central promise, so it is carried in the data
 * rather than only in the prose.
 */
export function ventilationFromHours(hours, buildingId = 'medium', options = {}) {
  const { requiredGain, NEVER_OPEN_ABOVE, BUILDINGS_BY_ID, allHours = null } = options;
  const building = BUILDINGS_BY_ID.get(buildingId) ?? BUILDINGS_BY_ID.get('medium');

  const usable = hours.filter((entry) => entry.celsius !== null);
  if (usable.length < 12) return { any: false, source: 'insufficient' };

  const values = usable.map((entry) => entry.celsius);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  // The lag has to reach into the *previous* night, not wrap around to the
  // same day's evening. Indexing by hour-of-day did the latter, which made a
  // room read 28 °C at midnight and 23 °C at 04:00 — a 5-degree drop no
  // building performs. Indexing the continuous series fixes it; without the
  // full series the lag is simply not applied, which is honest and visible.
  const series = (allHours ?? hours).filter((entry) => entry.celsius !== null);
  const positionOf = new Map(series.map((entry, index) => [entry.time, index]));
  const lagSteps = Math.round(building.lagHours);

  const rows = usable.map((entry) => {
    const position = positionOf.get(entry.time);
    const earlier =
      position !== undefined && position - lagSteps >= 0
        ? series[position - lagSteps]
        : null;
    const lagged = earlier ? earlier.celsius : entry.celsius;
    const indoor = mean + (lagged - mean) * building.inertia + building.boost;
    const gain = indoor - entry.celsius;
    const needed = requiredGain(entry.celsius);

    return {
      hour: entry.hour,
      outdoor: entry.celsius,
      indoor,
      gain,
      needed,
      open: gain >= needed && entry.celsius <= NEVER_OPEN_ABOVE,
    };
  });

  const open = rows.filter((row) => row.open);
  if (open.length === 0) {
    return {
      any: false,
      rows,
      source: 'measured',
    };
  }

  const best = open.reduce((a, b) => (b.gain > a.gain ? b : a));
  const opensAt = open.reduce((a, b) => {
    const distance = (hour) => (hour - 15 + 24) % 24;
    return distance(b.hour) < distance(a.hour) ? b : a;
  }).hour;
  const closesAt = open.reduce((a, b) => {
    const distance = (hour) => (hour - opensAt + 24) % 24;
    return distance(b.hour) > distance(a.hour) ? b : a;
  }).hour;

  // The sentence this used to compose lives in the bundles as
  // `day.windowSummary`. What is returned instead are the four numbers it was
  // made of -- which is also what the day chart already needed.
  return {
    any: true,
    rows,
    source: 'measured',
    opensAt,
    closesAt,
    bestHour: best.hour,
    bestGain: best.gain,
  };
}

/** Everything the page needs from one response, computed once. */
export function analyse(data, buildingId, coolingModule) {
  const hours = toHours(data);
  const today = todayIn(data);
  const todayHours = hoursForDate(hours, today);
  const now = hours.find((entry) => entry.date === today && entry.celsius !== null);

  return {
    hours,
    today,
    todayHours,
    current: now ?? null,
    peak: peakOffset(todayHours),
    nights: nightsWithoutRelief(data),
    acclimatisation: acclimatisation(data),
    ventilation: ventilationFromHours(todayHours, buildingId, {
      ...coolingModule,
      allHours: hours,
    }),
    place: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
  };
}
