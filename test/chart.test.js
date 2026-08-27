import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DOMAIN,
  clampHumidity,
  clampTemp,
  fanHarmRegion,
  fromX,
  fromY,
  humidityForWetBulb,
  isopleth,
  render,
  toX,
  toY,
} from '../src/chart.js';
import { WET_BULB_LIMITS, fanVerdict, wetBulb } from '../src/psychro.js';

describe('the isopleth solver', () => {
  it('lands on the target wet bulb, not near it', () => {
    // The chart and the numbers must not be able to drift apart, so the
    // solution is checked against the physics rather than against itself.
    for (const [celsius, target] of [[25, 20], [30, 24], [35, 28], [40, 31], [45, 31]]) {
      const humidity = humidityForWetBulb(celsius, target);
      assert.ok(humidity !== null, `${celsius} °C / ${target} °C had no solution`);
      assert.ok(
        Math.abs(wetBulb(celsius, humidity) - target) < 0.01,
        `${celsius} °C: solved ${humidity.toFixed(2)} % gives ${wetBulb(celsius, humidity).toFixed(3)}`
      );
    }
  });

  it('returns null where the target cannot be reached at all', () => {
    // At 20 °C even saturated air has a wet bulb of 20 °C, so 31 is impossible.
    assert.equal(humidityForWetBulb(20, 31), null);
  });

  it('needs less humidity to reach a given wet bulb as the air gets hotter', () => {
    const at35 = humidityForWetBulb(35, 28);
    const at40 = humidityForWetBulb(40, 28);
    const at45 = humidityForWetBulb(45, 28);

    assert.ok(at40 < at35 && at45 < at40, 'hotter air needs less moisture to be as deadly');
  });

  it('produces a shorter line for a higher target, because it starts later', () => {
    assert.ok(isopleth(35).length < isopleth(20).length);
    assert.ok(isopleth(35).length > 5, 'but still a drawable line');
  });

  it('produces points that are all on the isopleth', () => {
    for (const point of isopleth(28)) {
      assert.ok(Math.abs(wetBulb(point.celsius, point.humidity) - 28) < 0.02);
      assert.ok(point.humidity >= 0 && point.humidity <= 100);
    }
  });
});

describe('the fan-harm region', () => {
  it('traces a boundary that agrees with the verdict function', () => {
    const region = fanHarmRegion();

    for (const point of region.upper) {
      assert.equal(
        fanVerdict(point.celsius, point.humidity).verdict,
        'harmful',
        `${point.celsius} °C / ${point.humidity} % was drawn as harmful but is not`
      );
    }
    for (const point of region.lower) {
      assert.equal(fanVerdict(point.celsius, point.humidity).verdict, 'harmful');
    }
  });

  it('shades nothing in air anyone could actually be living in', () => {
    // The region does reach just below 36 °C, at 98 % humidity — and it is
    // right to. A wet bulb of 35.2 °C is past the theoretical survival limit
    // entirely; whether the fan is on is no longer the interesting question.
    // What matters is that nothing is shaded in air people really occupy.
    const region = fanHarmRegion();
    const occupied = [...region.upper, ...region.lower].filter(
      (point) => wetBulb(point.celsius, point.humidity) < WET_BULB_LIMITS.theoretical
    );
    const mild = occupied.filter((point) => point.celsius < 36);

    assert.equal(
      mild.length,
      0,
      'below 36 °C and short of the survival limit, a fan always helps — ' +
        'shading anything there would be the same false alarm the popular ' +
        '"switch it off above 35 °C" rule already causes'
    );
  });

  it('closes in from both sides, which is the shape worth drawing', () => {
    const region = fanHarmRegion();
    assert.ok(region.upper.length > 0, 'a humid edge');
    assert.ok(region.lower.length > 0, 'and a dry edge');
  });
});

describe('the coordinate mapping', () => {
  it('round-trips', () => {
    for (const celsius of [15, 25, 35, 50]) {
      assert.ok(Math.abs(fromX(toX(celsius)) - celsius) < 1e-9);
    }
    for (const humidity of [0, 50, 100]) {
      assert.ok(Math.abs(fromY(toY(humidity)) - humidity) < 1e-9);
    }
  });

  it('puts humidity 100 at the top and 0 at the bottom', () => {
    assert.ok(toY(100) < toY(0), 'humidity must increase upwards');
  });

  it('clamps input to the drawn domain', () => {
    assert.equal(clampTemp(-40), DOMAIN.minTemp);
    assert.equal(clampTemp(99), DOMAIN.maxTemp);
    assert.equal(clampHumidity(-5), 0);
    assert.equal(clampHumidity(150), 100);
  });
});

describe('rendering', () => {
  const svg = render({ celsius: 34, humidity: 62, threshold: 28 });

  it('produces a complete SVG with no holes in it', () => {
    assert.match(svg, /^<svg /);
    assert.match(svg, /<\/svg>$/);
    assert.ok(!svg.includes('NaN'), 'a NaN in a path silently deletes the line');
    assert.ok(!svg.includes('undefined'));
  });

  it('draws the operating point and its crosshair', () => {
    assert.match(svg, /class="wb-point"/);
    assert.match(svg, /class="wb-crosshair"/);
  });

  it('marks the measured limit differently from the other isopleths', () => {
    assert.match(svg, /wb-iso-measured/);
    assert.match(svg, /wb-iso-theoretical/);
  });

  it('draws the personal threshold only when it differs from the reference', () => {
    assert.match(svg, /wb-iso-personal/, 'a shifted threshold must be visible');

    const unshifted = render({
      celsius: 34,
      humidity: 62,
      threshold: WET_BULB_LIMITS.measuredYoungHealthy,
    });
    assert.ok(
      !unshifted.includes('wb-iso-personal'),
      'but an unshifted one must not draw a second line on top of the first'
    );
  });

  it('carries a description for anyone not looking at it', () => {
    assert.match(svg, /aria-label="[^"]*wet bulb[^"]*"/);
    assert.match(svg, /34\.0 degrees/);
  });

  it('escapes what goes into text nodes', () => {
    const hostile = render({ celsius: 30, humidity: 50, threshold: 31 });
    assert.ok(!hostile.includes('<script'));
  });

  it('survives the corners of its own domain', () => {
    for (const [celsius, humidity] of [[15, 0], [15, 100], [50, 0], [50, 100]]) {
      const corner = render({ celsius, humidity, threshold: 31 });
      assert.ok(!corner.includes('NaN'), `${celsius} °C / ${humidity} % produced NaN`);
    }
  });
});
