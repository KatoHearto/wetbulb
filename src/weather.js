/**
 * Fetching real weather, and being honest that this is a network request.
 *
 * The page used to promise "no network". That was true, and it stopped being
 * true the moment this file existed, so the promise changed rather than the
 * behaviour being hidden. What actually leaves the browser:
 *
 *   · a latitude and longitude, rounded to two decimals (about 1 km), to
 *     api.open-meteo.com
 *   · a place name, if you type one, to geocoding-api.open-meteo.com
 *
 * Nothing else. No identifier, no account, no key — Open-Meteo needs none —
 * and nothing at all until you press a button. The app stays fully usable
 * with the sliders alone, which is why the fetch is an addition and not a
 * dependency.
 *
 * Open-Meteo (https://open-meteo.com) is free for non-commercial use and
 * serves CORS `*`; both were measured before this was written rather than
 * assumed from documentation.
 */

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';

/** Round coordinates before sending them: ~1 km is plenty for the weather. */
export const COORD_PRECISION = 2;

export const ERRORS = {
  OFFLINE: 'offline',
  TIMEOUT: 'timeout',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
  NOT_FOUND: 'not-found',
  SERVER: 'server',
  MALFORMED: 'malformed',
};

/**
 * Every failure gets its own message, because "could not load weather" tells
 * the user nothing about whether to retry, move, or give up and use the
 * sliders.
 */
/**
 * A thrown error carries its `kind`, and the page looks the sentence up.
 *
 * The English text used to live here. It moved because an error message is the
 * one string a user is guaranteed to read at their least patient moment, and
 * shipping it in one language while the rest of the page speaks another is
 * exactly where a translation gap becomes visible.
 */

export class WeatherError extends Error {
  constructor(kind, cause) {
    super(kind);
    this.kind = kind;
    this.cause = cause;
  }
}

const round = (value) => Number(Number(value).toFixed(COORD_PRECISION));

async function getJSON(url, { timeout = 12000, fetchImpl } = {}) {
  const doFetch = fetchImpl ?? globalThis.fetch;
  if (typeof doFetch !== 'function') throw new WeatherError(ERRORS.UNSUPPORTED);

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

  let response;
  try {
    response = await doFetch(url, controller ? { signal: controller.signal } : undefined);
  } catch (error) {
    if (error?.name === 'AbortError') throw new WeatherError(ERRORS.TIMEOUT, error);
    throw new WeatherError(ERRORS.OFFLINE, error);
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (!response.ok) throw new WeatherError(ERRORS.SERVER, response.status);

  try {
    return await response.json();
  } catch (error) {
    throw new WeatherError(ERRORS.MALFORMED, error);
  }
}

/** The exact URL a fetch would use — exported so the page can show it. */
export function forecastUrl(latitude, longitude) {
  const parameters = new URLSearchParams({
    latitude: String(round(latitude)),
    longitude: String(round(longitude)),
    hourly: 'temperature_2m,relative_humidity_2m',
    daily: 'temperature_2m_max,temperature_2m_min',
    past_days: '7',
    forecast_days: '7',
    timezone: 'auto',
  });
  return `${FORECAST}?${parameters}`;
}

export async function fetchForecast(latitude, longitude, options = {}) {
  const data = await getJSON(forecastUrl(latitude, longitude), options);
  if (!data?.hourly?.time || !data?.daily?.time) {
    throw new WeatherError(ERRORS.MALFORMED);
  }
  return data;
}

export async function searchPlace(name, options = {}) {
  const query = String(name ?? '').trim();
  if (query.length < 2) throw new WeatherError(ERRORS.NOT_FOUND);

  const parameters = new URLSearchParams({ name: query, count: '5', format: 'json' });
  const data = await getJSON(`${GEOCODING}?${parameters}`, options);

  const results = data?.results ?? [];
  if (results.length === 0) throw new WeatherError(ERRORS.NOT_FOUND);

  return results.map((entry) => ({
    name: entry.name,
    region: entry.admin1 ?? '',
    country: entry.country ?? '',
    latitude: entry.latitude,
    longitude: entry.longitude,
    label: [entry.name, entry.admin1, entry.country].filter(Boolean).join(', '),
  }));
}

/**
 * Ask the browser where it is.
 *
 * Wrapped rather than used directly so that a refusal is a *named* outcome
 * with its own message. A geolocation error that reaches the user as
 * "undefined" is worse than no feature at all.
 */
export function currentPosition({ timeout = 10000, geolocation } = {}) {
  const source = geolocation ?? globalThis.navigator?.geolocation;
  if (!source) return Promise.reject(new WeatherError(ERRORS.UNSUPPORTED));

  return new Promise((resolve, reject) => {
    source.getCurrentPosition(
      (position) =>
        resolve({
          latitude: round(position.coords.latitude),
          longitude: round(position.coords.longitude),
          accuracy: position.coords.accuracy,
        }),
      (error) => {
        const kind =
          error?.code === 1
            ? ERRORS.DENIED
            : error?.code === 3
              ? ERRORS.TIMEOUT
              : ERRORS.OFFLINE;
        reject(new WeatherError(kind, error));
      },
      { timeout, maximumAge: 600000, enableHighAccuracy: false }
    );
  });
}
