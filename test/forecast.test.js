/**
 * Tested against a stored response, never against the live service.
 *
 * A suite that fetches would be red whenever Open-Meteo has a bad minute, and
 * — worse — it would assert different things on different days, so a genuine
 * regression would be indistinguishable from a change in the weather.
 *
 * The fixture is a real response from Delhi, captured once and committed.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  TROPICAL_NIGHT,
  UNACCLIMATISED_JUMP,
  acclimatisation,
  analyse,
  hoursForDate,
  nightsWithoutRelief,
  peakOffset,
  toHours,
  todayIn,
  ventilationFromHours,
} from '../src/forecast.js';
import { BUILDINGS_BY_ID, NEVER_OPEN_ABOVE, requiredGain } from '../src/cooling.js';
import { wetBulb } from '../src/psychro.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const delhi = JSON.parse(
  readFileSync(path.join(here, 'fixtures', 'delhi.json'), 'utf8')
);

const cooling = { requiredGain, NEVER_OPEN_ABOVE, BUILDINGS_BY_ID };

describe('reading the response', () => {
  it('derives a wet bulb for every hour that has both inputs', () => {
    const hours = toHours(delhi);
    assert.equal(hours.length, delhi.hourly.time.length);

    for (const entry of hours) {
      if (entry.celsius === null) {
        assert.equal(entry.wetBulb, null, 'a gap must stay a gap');
        continue;
      }
      assert.equal(entry.wetBulb, wetBulb(entry.celsius, entry.humidity));
      assert.ok(entry.wetBulb <= entry.celsius + 0.05);
    }
  });

  it('leaves a hole in the data as a hole', () => {
    const holed = {
      ...delhi,
      hourly: {
        ...delhi.hourly,
        temperature_2m: [null, ...delhi.hourly.temperature_2m.slice(1)],
      },
    };
    const hours = toHours(holed);

    assert.equal(hours[0].wetBulb, null);
    assert.equal(hours[0].celsius, null, 'never invent a value to fill a gap');
    assert.notEqual(hours[1].wetBulb, null, 'and only that hour');
  });

  it('reads the local hour without a timezone round trip', () => {
    const hours = toHours(delhi);
    assert.ok(hours.every((entry) => entry.hour >= 0 && entry.hour <= 23));
    assert.equal(hours[0].hour, Number(delhi.hourly.time[0].slice(11, 13)));
  });

  it('picks today as the day after the seven past days', () => {
    assert.equal(todayIn(delhi), delhi.daily.time[7]);
  });

  it('groups a day into its own hours', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    assert.equal(today.length, 24);
    assert.deepEqual(
      today.map((entry) => entry.hour),
      Array.from({ length: 24 }, (_, index) => index)
    );
  });
});

describe('the hottest hour is not the most dangerous one', () => {
  it('finds both peaks separately', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const peak = peakOffset(today);

    assert.ok(peak, 'a full day must produce a result');
    assert.ok(peak.hottest.celsius >= peak.worst.celsius, 'hottest is hottest');
    assert.ok(peak.worst.wetBulb >= peak.hottest.wetBulb, 'and worst is worst');
  });

  it('reports the offset rather than hiding it', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const peak = peakOffset(today);

    assert.equal(peak.offsetHours, peak.worst.hour - peak.hottest.hour);
    assert.equal(peak.coincide, peak.worst.hour === peak.hottest.hour);
  });

  it('separates them on this real day — the finding the feature exists for', () => {
    // Measured across seven cities before any of this was written: the peaks
    // differed at six of them. If they coincided everywhere, the whole
    // feature would be decoration and should be removed rather than shipped.
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const peak = peakOffset(today);

    assert.equal(
      peak.coincide,
      false,
      `Delhi's peaks fell on the same hour (${peak.hottest.hour}) — check the fixture`
    );
    assert.ok(Math.abs(peak.offsetHours) >= 2, `offset was only ${peak.offsetHours} h`);
  });

  it('refuses to guess from a fragment of a day', () => {
    assert.equal(peakOffset([]), null);
    assert.equal(peakOffset(toHours(delhi).slice(0, 3)), null);
  });
});

describe('nights without relief', () => {
  it('marks a night by its minimum, against the stated threshold', () => {
    const result = nightsWithoutRelief(delhi);

    assert.equal(result.threshold, TROPICAL_NIGHT);
    for (const night of result.nights) {
      if (!Number.isFinite(night.minimum)) continue;
      assert.equal(night.tropical, night.minimum > TROPICAL_NIGHT);
    }
  });

  it('counts the streak you are inside, not just the longest one', () => {
    const result = nightsWithoutRelief(delhi);
    assert.ok(result.current >= 0);
    assert.ok(result.longest >= result.current);
  });

  it('counts how many more are forecast, which is the actionable half', () => {
    const result = nightsWithoutRelief(delhi);
    assert.ok(Number.isInteger(result.ahead));
    assert.ok(result.ahead <= result.nights.length);
  });

  it('finds a long run in Delhi and none in a cool synthetic week', () => {
    assert.ok(nightsWithoutRelief(delhi).longest >= 5, 'Delhi in this fixture is relentless');

    const cool = {
      daily: {
        time: ['2026-08-20', '2026-08-21', '2026-08-22'],
        temperature_2m_min: [12, 14, 11],
        temperature_2m_max: [22, 24, 21],
      },
    };
    const result = nightsWithoutRelief(cool);
    assert.equal(result.longest, 0);
    assert.equal(result.current, 0);
  });

  it('survives a missing minimum instead of counting it as cool', () => {
    const gapped = {
      daily: {
        time: ['2026-08-20', '2026-08-21', '2026-08-22'],
        temperature_2m_min: [24, null, 25],
        temperature_2m_max: [34, 35, 36],
      },
    };
    const result = nightsWithoutRelief(gapped);
    assert.equal(result.nights[1].tropical, false);
    assert.equal(result.longest, 1, 'an unknown night breaks the run rather than extending it');
  });
});

describe('acclimatisation, answered instead of asked', () => {
  it('compares today against the warmest day of the past week', () => {
    const result = acclimatisation(delhi);
    assert.equal(result.known, true);
    assert.equal(result.difference, result.todayMax - result.warmestRecent);
    assert.ok(result.days >= 3);
  });

  it('calls a big jump unacclimatised', () => {
    const jumpy = {
      daily: {
        time: ['1', '2', '3', '4', '5', '6', '7', '8'],
        temperature_2m_max: [20, 21, 19, 22, 20, 21, 22, 31],
        temperature_2m_min: [10, 11, 9, 12, 10, 11, 12, 18],
      },
    };
    const result = acclimatisation(jumpy);

    assert.equal(result.unacclimatised, true);
    assert.ok(result.difference >= UNACCLIMATISED_JUMP);
  });

  it('does not call a steady hot week unacclimatised', () => {
    const steady = {
      daily: {
        time: ['1', '2', '3', '4', '5', '6', '7', '8'],
        temperature_2m_max: [38, 39, 38, 38, 39, 38, 38, 38],
        temperature_2m_min: [26, 27, 26, 26, 27, 26, 26, 26],
      },
    };
    assert.equal(acclimatisation(steady).unacclimatised, false);
  });

  it('says it does not know rather than guessing from too little', () => {
    const thin = {
      daily: { time: ['1', '2'], temperature_2m_max: [30, 35], temperature_2m_min: [20, 22] },
    };
    assert.equal(acclimatisation(thin).known, false);
  });
});

describe('the ventilation window from measured hours', () => {
  it('labels its source, because half of it is still a model', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const result = ventilationFromHours(today, 'medium', cooling);

    assert.equal(result.source, 'measured');
  });

  it('applies the same thresholds as the modelled version', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const result = ventilationFromHours(today, 'medium', cooling);

    for (const row of result.rows ?? []) {
      if (!row.open) continue;
      assert.ok(row.outdoor <= NEVER_OPEN_ABOVE);
      assert.ok(row.gain >= requiredGain(row.outdoor));
    }
  });

  it('never makes the room jump, because the lag reaches the previous night', () => {
    // The first version indexed by hour-of-day, so hour 0 with a 4 h lag
    // reached back to hour 20 of the SAME day — the afternoon it was supposed
    // to be recovering from. Measured on live Cologne data it produced 28.2 °C
    // at midnight and 23.6 °C at 04:00: a 4.6 degree drop in four hours that
    // no building performs.
    const hours = toHours(delhi);
    const today = hoursForDate(hours, todayIn(delhi));
    const result = ventilationFromHours(today, 'medium', { ...cooling, allHours: hours });

    const overnight = result.rows.filter((row) => row.hour <= 7);
    for (let index = 1; index < overnight.length; index += 1) {
      const step = Math.abs(overnight[index].indoor - overnight[index - 1].indoor);
      assert.ok(
        step < 2,
        `the room moved ${step.toFixed(1)} °C between ${overnight[index - 1].hour}:00 ` +
          `and ${overnight[index].hour}:00`
      );
    }
  });

  it('falls back to no lag rather than a wrong one without the full series', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const withSeries = ventilationFromHours(today, 'medium', {
      ...cooling,
      allHours: toHours(delhi),
    });
    const without = ventilationFromHours(today, 'medium', cooling);

    assert.ok(withSeries.rows, 'both must still answer');
    assert.ok(without.rows);
  });

  it('gives different buildings different windows', () => {
    const today = hoursForDate(toHours(delhi), todayIn(delhi));
    const count = (id) =>
      (ventilationFromHours(today, id, { ...cooling, allHours: toHours(delhi) }).rows ?? [])
        .filter((r) => r.open).length;

    assert.notEqual(count('heavy'), count('light'));
  });

  it('refuses to answer from a fragment', () => {
    const result = ventilationFromHours(toHours(delhi).slice(0, 4), 'medium', cooling);
    assert.equal(result.any, false);
    assert.equal(result.source, 'insufficient');
  });
});

describe('the whole analysis', () => {
  const result = analyse(delhi, 'medium', cooling);

  it('produces every finding the page shows', () => {
    for (const key of ['hours', 'today', 'todayHours', 'peak', 'nights', 'acclimatisation', 'ventilation']) {
      assert.ok(result[key] !== undefined, `missing ${key}`);
    }
  });

  it('carries the place back, so the page can say where this is', () => {
    assert.equal(result.place.latitude, delhi.latitude);
    assert.ok(result.place.timezone);
  });

  it('is stable — the same fixture gives the same answer twice', () => {
    const again = analyse(delhi, 'medium', cooling);
    assert.deepEqual(result.peak.offsetHours, again.peak.offsetHours);
    assert.deepEqual(result.nights.longest, again.nights.longest);
  });
});
