/**
 * The numbers in this file come from published sources, not from running the
 * code and writing down what it said. That distinction is the entire value of
 * the suite: a test that records the implementation's own output proves only
 * that the implementation has not changed, never that it is right.
 */

import { en } from '../src/i18n/en.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BODY,
  WET_BULB_LIMITS,
  convectiveCoefficient,
  dewPoint,
  fanVerdict,
  heatBalance,
  heatIndex,
  relativeHumidityFromDewPoint,
  saturationVapourPressure,
  survivalMargin,
  vapourPressure,
  wetBulb,
  wetBulbAccuracy,
} from '../src/psychro.js';

const near = (actual, expected, tolerance, message) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message ?? ''} expected ${expected} ± ${tolerance}, got ${actual.toFixed(3)}`
  );

describe('saturation vapour pressure', () => {
  // Reference values from standard steam tables, in kPa.
  it('matches the steam table at 0 °C', () => {
    near(saturationVapourPressure(0), 0.6113, 0.002);
  });

  it('matches at 20 °C', () => {
    near(saturationVapourPressure(20), 2.339, 0.01);
  });

  it('matches at 35 °C — skin temperature, the value the model leans on', () => {
    near(saturationVapourPressure(35), 5.629, 0.02);
  });

  it('matches at 100 °C, where it must equal one atmosphere', () => {
    near(saturationVapourPressure(100), 101.3, 3.0);
  });

  it('rises monotonically', () => {
    for (let t = -10; t < 50; t += 1) {
      assert.ok(saturationVapourPressure(t + 1) > saturationVapourPressure(t));
    }
  });
});

describe('dew point', () => {
  it('equals the air temperature at saturation', () => {
    for (const t of [0, 10, 20, 30, 40]) {
      near(dewPoint(t, 100), t, 0.05, `at ${t} °C`);
    }
  });

  it('is never above the air temperature', () => {
    for (let t = -5; t <= 45; t += 5) {
      for (let rh = 5; rh <= 100; rh += 5) {
        assert.ok(dewPoint(t, rh) <= t + 1e-9, `${t} °C / ${rh} %`);
      }
    }
  });

  it('round-trips through relative humidity', () => {
    for (const [t, rh] of [[25, 40], [30, 70], [15, 90], [38, 25]]) {
      const td = dewPoint(t, rh);
      near(relativeHumidityFromDewPoint(t, td), rh, 0.5, `${t} °C / ${rh} %`);
    }
  });

  it('gives the textbook value for a warm humid day', () => {
    // 30 °C at 70 % RH has a dew point close to 24 °C.
    near(dewPoint(30, 70), 24.0, 0.4);
  });
});

describe('wet-bulb temperature', () => {
  // Stull (2011), Table 1 — the paper's own worked values.
  it('matches Stull at 20 °C / 50 %', () => {
    near(wetBulb(20, 50), 13.7, 0.4);
  });

  it('matches Stull at 30 °C / 50 %', () => {
    near(wetBulb(30, 50), 22.0, 0.4);
  });

  it('matches Stull at 40 °C / 50 %', () => {
    near(wetBulb(40, 50), 30.5, 0.5);
  });

  it('equals the air temperature at 100 % humidity, exactly', () => {
    // The anchor: with saturated air there is nothing to evaporate into, so a
    // wet thermometer reads the same as a dry one. Anything else here would
    // mean the whole scale is offset.
    for (const t of [10, 20, 25, 30, 35, 40, 45]) {
      assert.equal(wetBulb(t, 100), t, `at ${t} °C`);
    }
  });

  it('is never above the air temperature', () => {
    for (let t = 0; t <= 50; t += 2) {
      for (let rh = 5; rh <= 100; rh += 5) {
        assert.ok(wetBulb(t, rh) <= t + 0.05, `${t} °C / ${rh} % gave ${wetBulb(t, rh)}`);
      }
    }
  });

  it('rises with humidity at fixed temperature', () => {
    for (let rh = 10; rh < 100; rh += 10) {
      assert.ok(
        wetBulb(35, rh + 10) > wetBulb(35, rh),
        `humidity ${rh} -> ${rh + 10} did not raise the wet bulb`
      );
    }
  });

  it('rises with temperature at fixed humidity', () => {
    for (let t = 10; t < 45; t += 5) {
      assert.ok(wetBulb(t + 5, 60) > wetBulb(t, 60));
    }
  });

  it('shows the point of the whole tool: 45 °C dry is survivable, 35 °C humid is not', () => {
    const dryDesert = wetBulb(45, 10);
    const humidCity = wetBulb(35, 90);

    assert.ok(dryDesert < WET_BULB_LIMITS.measuredYoungHealthy, `dry gave ${dryDesert}`);
    assert.ok(humidCity > WET_BULB_LIMITS.measuredYoungHealthy, `humid gave ${humidCity}`);
    assert.ok(
      humidCity > dryDesert,
      'the cooler-looking air is the deadlier one — this is the claim the tool exists to make'
    );
  });

  it('reports where the fit is trustworthy and where it is not', () => {
    assert.equal(wetBulbAccuracy(30, 50).level, 'good');
    assert.equal(wetBulbAccuracy(30, 2).level, 'poor');
    assert.equal(wetBulbAccuracy(60, 50).level, 'edge');
  });
});

describe('heat index', () => {
  // NWS published heat index table, converted from °F.
  it('matches the NWS table at 32 °C / 70 %', () => {
    // 90 °F at 70 % RH is 106 °F on the NWS chart.
    near(heatIndex(32.2, 70), 41.1, 1.2);
  });

  it('matches the NWS table at 38 °C / 40 %', () => {
    // 100 °F at 40 % RH is 109 °F.
    near(heatIndex(37.8, 40), 42.8, 1.2);
  });

  it('is close to the air temperature in cool dry air', () => {
    near(heatIndex(21, 30), 21, 2.0);
  });

  it('rises with humidity in hot air', () => {
    assert.ok(heatIndex(35, 70) > heatIndex(35, 30));
  });
});

describe('the heat balance', () => {
  it('turns the dry channel negative once the air is hotter than skin', () => {
    const cool = heatBalance(25, 50, BODY.stillAir);
    const hot = heatBalance(42, 50, BODY.stillAir);

    assert.ok(cool.dry > 0, 'cooler air should carry heat away');
    assert.ok(hot.dry < 0, 'air above skin temperature heats you — this is the trap');
  });

  it('leaves no evaporative cooling when the air is as wet as skin', () => {
    // 40 °C at 100 % humidity: the air already holds more vapour than skin
    // can add, so sweating buys nothing at all.
    const balance = heatBalance(40, 100, BODY.stillAir);
    assert.equal(balance.wet, 0);
    assert.ok(balance.net < 0, 'net heat gain, with no way to shed it');
  });

  it('caps evaporation at the sweat rate rather than letting it run away', () => {
    const desert = heatBalance(45, 5, BODY.fanAir);
    assert.equal(desert.wet, BODY.maxSweatCooling);
    assert.equal(desert.sweatLimited, true);
  });

  it('scales both channels with air speed', () => {
    assert.ok(convectiveCoefficient(4) > convectiveCoefficient(0.2));
    const still = heatBalance(40, 50, BODY.stillAir);
    const fanned = heatBalance(40, 50, BODY.fanAir);

    assert.ok(Math.abs(fanned.dry) > Math.abs(still.dry), 'more heat in');
    assert.ok(fanned.wet > still.wet, 'and more sweat out');
  });
});

describe('the fan verdict', () => {
  // These two are the point of the model, and they come from measurements on
  // human subjects, not from this code.
  it('says a fan HELPS at 40 °C / 50 % — Jay et al. 2019 measured lower core temperature', () => {
    const result = fanVerdict(40, 50);
    assert.equal(result.verdict, 'helps');
    assert.ok(result.gain > 0);
  });

  it('says a fan HARMS at 47 °C / 10 % — Morris et al. measured higher core temperature', () => {
    const result = fanVerdict(47, 10);
    assert.equal(result.verdict, 'harmful');
    assert.ok(result.gain < 0);
  });

  it('contradicts the common "switch it off above 35 °C" rule, on purpose', () => {
    // The popular rule would switch the fan off in both cases. In humid heat
    // that advice removes the one thing still cooling the person.
    const humid = fanVerdict(38, 60);
    assert.equal(
      humid.verdict,
      'helps',
      'humid heat above 35 °C is exactly where a fan still earns its keep'
    );
  });

  it('turns against the fan at BOTH ends of the humidity range', () => {
    // Not a monotone slope — a window. The fan fails for two opposite
    // reasons, and both are real:
    //
    //   very humid — the air already holds more vapour than skin, so there is
    //                no evaporation left to speed up, only heat to blow on
    //   very dry   — evaporation is already at the sweat-rate ceiling, so the
    //                extra air flow adds nothing but convective heat load
    //
    // The first version of this test assumed a slope and was wrong. The
    // measured shape is what the tool has to draw.
    const at45 = (rh) => fanVerdict(45, rh);

    assert.equal(at45(70).verdict, 'harmful', 'humid end');
    assert.equal(at45(30).verdict, 'helps', 'the window in between');
    assert.equal(at45(5).verdict, 'harmful', 'dry end');

    assert.ok(
      at45(30).gain > at45(70).gain && at45(30).gain > at45(5).gain,
      'the middle must be better than either extreme'
    );
  });

  it('keeps the window open everywhere in ordinary summer heat', () => {
    for (let rh = 10; rh <= 90; rh += 10) {
      assert.notEqual(
        fanVerdict(34, rh).verdict,
        'harmful',
        `a fan should never be harmful at 34 °C, but it was at ${rh} % humidity`
      );
    }
  });

  it('narrows the window as the air gets hotter', () => {
    const width = (t) => {
      let count = 0;
      for (let rh = 5; rh <= 95; rh += 5) {
        if (fanVerdict(t, rh).verdict !== 'harmful') count += 1;
      }
      return count;
    };

    assert.ok(width(34) > width(42), '42 °C must be more restrictive than 34 °C');
    assert.ok(width(42) > width(48), '48 °C more restrictive still');
  });

  it('always reaches a verdict the page has words for', () => {
    // The explanation moved to the bundles. What must hold here is that every
    // verdict this function can return HAS an explanation waiting for it --
    // a fourth verdict added later would fail this rather than render `[key]`.
    for (const [t, rh] of [[25, 50], [40, 50], [47, 10]]) {
      const { verdict } = fanVerdict(t, rh);
      assert.ok(['helps', 'marginal', 'harmful'].includes(verdict), `${t}/${rh}: ${verdict}`);
      const key = `fanReason${verdict[0].toUpperCase()}${verdict.slice(1)}`;
      assert.ok(en.actions[key]?.length > 30, `${verdict} has no reason in the bundle`);
    }
  });
});

describe('the survival margin', () => {
  it('carries both limits and does not collapse them into one', () => {
    const margin = survivalMargin(35, 80);
    assert.ok(margin.toMeasured < margin.toTheoretical);
    assert.equal(
      WET_BULB_LIMITS.theoretical - WET_BULB_LIMITS.measuredYoungHealthy,
      4,
      'the four degrees between theory and measurement are the honest part'
    );
  });

  it('flags air past the measured limit before the theoretical one', () => {
    // A wet bulb of about 32 °C: past what has been measured as survivable,
    // still short of the textbook 35.
    const margin = survivalMargin(36, 75);
    assert.ok(margin.wetBulb > 31 && margin.wetBulb < 35, `got ${margin.wetBulb}`);
    assert.equal(margin.pastMeasured, true);
    assert.equal(margin.pastTheoretical, false);
  });

  it('leaves comfortable air with a wide margin', () => {
    assert.ok(survivalMargin(22, 45).toMeasured > 15);
  });
});
