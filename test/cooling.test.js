import { en } from '../src/i18n/en.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BUILDINGS,
  BUILDINGS_BY_ID,
  MEASURES,
  NEVER_OPEN_ABOVE,
  requiredGain,
  indoorCurve,
  outdoorCurve,
  outdoorTemperature,
  rankedMeasures,
  ventilationWindow,
} from '../src/cooling.js';

describe('the daily outdoor curve', () => {
  it('hits the low and the high it was given', () => {
    const curve = outdoorCurve(18, 34);
    assert.ok(Math.abs(Math.min(...curve) - 18) < 0.3, `low was ${Math.min(...curve)}`);
    assert.ok(Math.abs(Math.max(...curve) - 34) < 0.3, `high was ${Math.max(...curve)}`);
  });

  it('puts the minimum near dawn and the maximum mid-afternoon', () => {
    const curve = outdoorCurve(18, 34);
    const coldest = curve.indexOf(Math.min(...curve));
    const hottest = curve.indexOf(Math.max(...curve));

    assert.ok(coldest >= 4 && coldest <= 7, `coldest hour was ${coldest}`);
    assert.ok(hottest >= 14 && hottest <= 16, `hottest hour was ${hottest}`);
  });

  it('cools more slowly than it warms, as a real day does', () => {
    // Ten hours up, fourteen down. A single symmetric sine gets this wrong and
    // moves the evening crossover more than an hour too early.
    const morningRate = outdoorTemperature(11, 18, 34) - outdoorTemperature(8, 18, 34);
    const eveningRate = outdoorTemperature(18, 18, 34) - outdoorTemperature(21, 18, 34);
    assert.ok(morningRate > eveningRate, 'the evening should fall more gently');
  });

  it('is continuous across midnight', () => {
    const before = outdoorTemperature(23.99, 18, 34);
    const after = outdoorTemperature(0.01, 18, 34);
    assert.ok(Math.abs(before - after) < 0.2, `jumped from ${before} to ${after}`);
  });

  it('wraps negative and oversized hours instead of producing nonsense', () => {
    assert.equal(outdoorTemperature(-1, 18, 34), outdoorTemperature(23, 18, 34));
    assert.equal(outdoorTemperature(25, 18, 34), outdoorTemperature(1, 18, 34));
  });
});

describe('the indoor curve', () => {
  it('swings less than the air outside', () => {
    const outdoor = outdoorCurve(16, 36);
    const indoor = indoorCurve(16, 36, 'heavy');
    const swing = (curve) => Math.max(...curve) - Math.min(...curve);

    assert.ok(swing(indoor) < swing(outdoor) * 0.6, 'a building damps the day');
  });

  it('peaks later than the air outside', () => {
    const outdoor = outdoorCurve(16, 36);
    const indoor = indoorCurve(16, 36, 'medium');
    const peak = (curve) => curve.indexOf(Math.max(...curve));

    assert.ok(peak(indoor) > peak(outdoor), 'the room lags the air');
  });

  it('makes a roof room far hotter by day and slightly cooler by night', () => {
    // Both halves of this are real, and the second one is the useful half:
    // lightweight construction is punishing in the afternoon and recovers
    // faster overnight, which is precisely why night ventilation is worth
    // more in a roof room than in a masonry building, not less.
    const heavy = indoorCurve(18, 34, 'heavy');
    const roof = indoorCurve(18, 34, 'light');

    assert.ok(
      Math.max(...roof) > Math.max(...heavy) + 4,
      `roof peak ${Math.max(...roof).toFixed(1)} vs masonry ${Math.max(...heavy).toFixed(1)}`
    );
    assert.ok(
      Math.min(...roof) < Math.min(...heavy),
      'and it must give that heat up faster once the air outside drops'
    );

    const afternoon = [13, 14, 15, 16, 17, 18];
    for (const hour of afternoon) {
      assert.ok(roof[hour] > heavy[hour] + 3, `hour ${hour} was not much hotter`);
    }
  });

  it('describes every building it offers', () => {
    for (const building of BUILDINGS) {
      assert.ok(en.buildings[building.id], `${building.id} has no label`);
      assert.ok(en.buildings[`${building.id}Note`]?.length > 20, `${building.id} has no note`);
      assert.ok(building.inertia > 0 && building.inertia <= 1);
      assert.ok(building.lagHours >= 0);
    }
  });
});

describe('the ventilation window', () => {
  it('opens in the evening and closes in the morning', () => {
    const window = ventilationWindow(17, 33, 'medium');

    assert.equal(window.any, true);
    assert.ok(
      window.opensAt >= 17 || window.opensAt <= 2,
      `opened at ${window.opensAt}, which is not an evening`
    );
    assert.ok(window.closesAt >= 5 && window.closesAt <= 11, `closed at ${window.closesAt}`);
  });

  it('is one unbroken stretch across midnight, not two fragments', () => {
    const window = ventilationWindow(17, 33, 'medium');
    let hour = window.opensAt;
    let steps = 0;

    while (hour !== (window.closesAt + 1) % 24 && steps < 24) {
      assert.ok(window.hours[hour].open, `hour ${hour} inside the window is not open`);
      hour = (hour + 1) % 24;
      steps += 1;
    }
    assert.ok(steps > 0 && steps < 24);
  });

  it('refuses to recommend a window when there is not one', () => {
    // A tropical night: the low never drops far enough below the room.
    const window = ventilationWindow(31, 38, 'light');
    if (!window.any) {
      assert.match(window.summary, /no good hour/i);
      assert.equal(window.opensAt, null);
    } else {
      assert.ok(window.bestGain >= 1.0, 'if it does recommend one, it must be worth getting up for');
    }
  });

  it('will not send you to open a window into 34 °C air for one degree', () => {
    // Found by looking at the rendered chart, not by reasoning: the first
    // version opened the window at 17:00 in 34.2 °C air for a 1.3 °C gain.
    // A degree of difference moves almost no heat, and the air coming in is
    // near body temperature and brings its own humidity.
    const window = ventilationWindow(19, 35, 'light');

    for (const entry of window.hours) {
      if (!entry.open) continue;
      assert.ok(
        entry.outdoor <= NEVER_OPEN_ABOVE,
        `hour ${entry.hour} opens into ${entry.outdoor.toFixed(1)} °C air`
      );
      assert.ok(
        entry.gain >= requiredGain(entry.outdoor),
        `hour ${entry.hour}: ${entry.gain.toFixed(1)} °C gain does not justify ` +
          `${entry.outdoor.toFixed(1)} °C air`
      );
    }

    assert.ok(window.opensAt >= 19, `opened at ${window.opensAt}, too early for a hot day`);
  });

  it('demands more the hotter the air outside is', () => {
    assert.ok(requiredGain(20) < requiredGain(28));
    assert.ok(requiredGain(28) < requiredGain(34));
    assert.equal(requiredGain(20), requiredGain(26), 'below 26 °C the base margin is enough');
  });

  it('requires a real temperature difference, not any difference at all', () => {
    const generous = ventilationWindow(17, 33, 'medium', 0.1);
    const strict = ventilationWindow(17, 33, 'medium', 3.0);
    const count = (w) => w.hours.filter((h) => h.open).length;

    assert.ok(count(strict) < count(generous), 'a larger margin must narrow the window');
  });

  it('gives a masonry building a different window than a roof room', () => {
    const heavy = ventilationWindow(18, 34, 'heavy');
    const roof = ventilationWindow(18, 34, 'light');
    const count = (w) => w.hours.filter((h) => h.open).length;

    assert.notEqual(count(heavy), count(roof), 'the building has to matter');
  });

  it('names the coldest hour, since that is when to open everything wide', () => {
    const window = ventilationWindow(17, 33, 'medium');
    const coldest = window.hours.reduce((a, b) => (b.gain > a.gain ? b : a));
    assert.equal(window.bestHour, coldest.hour);
  });

  it('reports the four numbers the page turns into a sentence', () => {
    const window = ventilationWindow(17, 33, 'medium');
    for (const field of ['opensAt', 'closesAt', 'bestHour']) {
      assert.ok(Number.isInteger(window[field]), `${field} is not an hour`);
      assert.ok(window[field] >= 0 && window[field] <= 23, `${field} is out of range`);
    }
    assert.ok(window.bestGain > 0, 'a window worth opening must be worth something');
    assert.match(en.day.windowSummary, /\{opens\}.*\{closes\}/s);
  });
});

describe('the passive measures', () => {
  it('ranks outside shading above inside blinds, by a lot', () => {
    const ranked = rankedMeasures();
    const outside = ranked.findIndex((m) => m.id === 'externalShade');
    const inside = ranked.findIndex((m) => m.id === 'internalBlind');

    assert.ok(outside < inside, 'outside shading must come first');
    assert.equal(
      MEASURES.find((m) => m.id === 'externalShade').effect /
        MEASURES.find((m) => m.id === 'internalBlind').effect,
      5,
      'and the stated ratio should reflect the physics, not be a vague "better"'
    );
  });

  it('explains every measure well enough to act on', () => {
    for (const measure of MEASURES) {
      assert.ok(en.measures[measure.id], `${measure.id} has no label`);
      assert.ok(
        en.measures[`${measure.id}Detail`]?.length > 60,
        `${measure.id} is too vague to follow`
      );
    }
  });

  it('returns them in descending order of effect', () => {
    const ranked = rankedMeasures();
    for (let index = 1; index < ranked.length; index += 1) {
      assert.ok(ranked[index].effect <= ranked[index - 1].effect);
    }
  });
});
