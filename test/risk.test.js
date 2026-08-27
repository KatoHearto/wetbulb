import { en } from '../src/i18n/en.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BANDS,
  FACTORS,
  FACTORS_BY_ID,
  GROUPS,
  actions,
  assess,
  combineShift,
} from '../src/risk.js';
import { WET_BULB_LIMITS, wetBulb } from '../src/psychro.js';

const ids = (list) => list.map((entry) => entry.id);

describe('the factor table', () => {
  it('gives every factor a reason a person could argue with', () => {
    // The reason lives in the bundle now, so this reaches for it there. It is
    // still the same claim: no factor may move a threshold without saying why.
    for (const factor of FACTORS) {
      const why = en.factors[`${factor.id}Why`];
      assert.ok(why, `${factor.id} has no reason in the bundle`);
      assert.ok(why.length > 40, `${factor.id} has no real explanation`);
      assert.ok(en.factors[factor.id], `${factor.id} has no label in the bundle`);
      assert.ok(factor.shift > 0, `${factor.id} shifts nothing`);
      assert.ok(factor.shift <= 3, `${factor.id} shifts implausibly far`);
    }
  });

  it('files every factor under a group that exists', () => {
    const known = new Set(GROUPS);
    for (const factor of FACTORS) {
      assert.ok(known.has(factor.group), `${factor.id} is in unknown group ${factor.group}`);
    }
  });

  it('has no duplicate ids', () => {
    assert.equal(FACTORS_BY_ID.size, FACTORS.length);
  });

  it('puts the largest shift on suppressed sweating, which is the largest real effect', () => {
    const biggest = [...FACTORS].sort((a, b) => b.shift - a.shift)[0];
    assert.ok(
      ['anticholinergic', 'exertion', 'age75'].includes(biggest.id),
      `unexpected top factor: ${biggest.id}`
    );
  });
});

describe('combining factors', () => {
  it('is zero for nobody in particular', () => {
    assert.equal(combineShift([]), 0);
  });

  it('passes a single factor through unchanged', () => {
    assert.equal(combineShift(['age65']), FACTORS_BY_ID.get('age65').shift);
  });

  it('adds less for each further factor instead of stacking linearly', () => {
    const one = combineShift(['anticholinergic']);
    const two = combineShift(['anticholinergic', 'age75']);
    const linear = FACTORS_BY_ID.get('anticholinergic').shift + FACTORS_BY_ID.get('age75').shift;

    assert.ok(two > one, 'a second factor must still count for something');
    assert.ok(
      two < linear,
      'but not the full amount — three risk factors do not make somebody three times as fragile'
    );
  });

  it('never runs away, however many boxes are ticked', () => {
    const everything = FACTORS.map((factor) => factor.id);
    assert.ok(combineShift(everything) <= 8);
  });

  it('does not care what order the factors arrive in', () => {
    assert.equal(
      combineShift(['age65', 'diuretic', 'alone']),
      combineShift(['alone', 'age65', 'diuretic'])
    );
  });

  it('ignores an id it does not know rather than throwing', () => {
    assert.equal(combineShift(['age65', 'not-a-factor']), combineShift(['age65']));
  });
});

describe('the assessment', () => {
  it('leaves a mild day comfortable for a healthy adult', () => {
    const result = assess(24, 45);
    assert.equal(result.band.id, 'safe');
    assert.ok(result.margin > 8);
  });

  it('moves the threshold for real, not cosmetically', () => {
    const healthy = assess(33, 60);
    const frail = assess(33, 60, ['age75', 'anticholinergic', 'alone']);

    assert.equal(healthy.wetBulb, frail.wetBulb, 'the physics is the same air');
    assert.ok(
      frail.threshold < healthy.threshold - 2,
      'but the threshold has to move by degrees, not decimals'
    );
    assert.ok(frail.margin < healthy.margin - 2);
    assert.notEqual(frail.band.id, healthy.band.id, 'far enough to change the verdict');
  });

  it('reaches "past the limit" for air nobody can shed heat into', () => {
    const result = assess(40, 90);
    assert.equal(result.band.id, 'critical');
    assert.ok(result.margin < 0);
  });

  it('finds the same air safe for one person and dangerous for another', () => {
    // This is the entire argument for personalising at all.
    const conditions = [31, 65];
    const young = assess(...conditions);
    const older = assess(...conditions, ['age75', 'diuretic', 'cardiovascular']);

    assert.ok(
      BANDS.findIndex((b) => b.id === older.band.id) >
        BANDS.findIndex((b) => b.id === young.band.id),
      `${young.band.id} vs ${older.band.id} — the bands should differ`
    );
  });

  it('reports the shift it used, so the number can be checked', () => {
    const result = assess(30, 50, ['age65']);
    assert.equal(result.shift, FACTORS_BY_ID.get('age65').shift);
    assert.equal(result.threshold, WET_BULB_LIMITS.measuredYoungHealthy - result.shift);
  });

  it('keeps the bands ordered by how much room is left', () => {
    const margins = BANDS.map((band) => band.minMargin);
    for (let index = 1; index < margins.length; index += 1) {
      assert.ok(margins[index] < margins[index - 1], 'bands must descend');
    }
  });
});

describe('the actions', () => {
  it('leads with leaving when the air is past the limit', () => {
    const list = actions(42, 85);
    assert.equal(list[0].id, 'leave');
    assert.equal(list[0].tone, 'urgent');
  });

  it('tells you to switch the fan OFF when a fan would hurt', () => {
    const list = actions(47, 10);
    const fanEntry = list.find((entry) => /^fan/.test(entry.id));

    assert.equal(fanEntry.id, 'fanOff');
    assert.equal(fanEntry.tone, 'stop');
    assert.ok(
      list.indexOf(fanEntry) < 3,
      'this is the one piece of advice most likely to be got wrong — it must be near the top'
    );
  });

  it('tells you to USE the fan in humid heat above 35 °C', () => {
    const list = actions(38, 60);
    const fanEntry = list.find((entry) => /^fan/.test(entry.id));

    assert.equal(fanEntry.id, 'fanOn');
    assert.match(
      en.actions.fanOnDetail,
      /backwards/,
      'and it should say the common rule is wrong'
    );
  });

  it('never gives both fan instructions at once', () => {
    for (const [t, rh] of [[30, 50], [38, 60], [42, 20], [47, 10], [45, 80]]) {
      const fans = actions(t, rh).filter((entry) => /^fan/.test(entry.id));
      assert.ok(fans.length <= 1, `${t} °C / ${rh} % produced ${fans.length} fan entries`);
    }
  });

  it('raises stopping work to the top when work is what you are doing', () => {
    const list = actions(34, 55, ['exertion']);
    const stop = list.findIndex((entry) => entry.id === 'stopWork');
    assert.ok(stop >= 0 && stop <= 1, `stopping work ranked ${stop}`);
  });

  it('adds the drinking-schedule advice only for the group whose thirst is unreliable', () => {
    assert.ok(!ids(actions(33, 55)).includes('drink'));
    assert.ok(ids(actions(33, 55, ['age75'])).includes('drink'));
  });

  it('names the emergency sign when things are dangerous', () => {
    const list = actions(39, 75);
    const entry = list.find((item) => item.id === 'emergency');
    assert.ok(entry, 'no emergency entry at all');
    assert.match(en.actions.emergencyDetail, /emergency/i);
    assert.match(en.actions.emergencyDetail, /stopped sweating/i);
  });

  it('does not raise an alarm on a pleasant day', () => {
    const list = actions(22, 50);
    assert.ok(!list.some((entry) => entry.tone === 'urgent'));
    assert.ok(list.length <= 3, 'a mild day should not produce a wall of warnings');
  });

  it('always returns something ordered by weight', () => {
    for (const [t, rh] of [[20, 40], [30, 60], [40, 30], [45, 90]]) {
      const list = actions(t, rh);
      assert.ok(list.length > 0, `${t} °C / ${rh} % produced nothing`);
      for (let index = 1; index < list.length; index += 1) {
        assert.ok(list[index].weight <= list[index - 1].weight, 'out of order');
      }
    }
  });
});
