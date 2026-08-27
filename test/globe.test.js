/**
 * The globe's arithmetic, which is the part that can be wrong silently.
 *
 * A shader mistake looks wrong immediately. A matrix or projection mistake
 * produces a globe that turns smoothly and puts Delhi in the Atlantic, and
 * nobody notices until somebody who knows where Delhi is looks at it.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  identity,
  multiply,
  perspective,
  rotateX,
  rotateY,
  scale,
  toCartesian,
  translate,
} from '../src/mat4.js';
import { COASTLINE } from '../src/coastline.js';
import { LEGEND, colourFor } from '../src/globe.js';

const near = (actual, expected, tolerance, message) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message ?? ''} expected ${expected} ± ${tolerance}, got ${actual}`
  );

describe('matrices', () => {
  it('multiplying by the identity changes nothing', () => {
    const m = rotateY(0.7);
    const product = multiply(m, identity());
    for (let index = 0; index < 16; index += 1) {
      near(product[index], m[index], 1e-6, `element ${index}`);
    }
  });

  it('composes in the order the renderer relies on', () => {
    // multiply(a, b) must mean "apply b, then a" — the opposite convention
    // would rotate the globe about the wrong axis and still look plausible.
    const point = [1, 0, 0, 1];
    const composed = multiply(rotateX(Math.PI / 2), rotateY(Math.PI / 2));

    const apply = (m, v) => [
      m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
      m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
      m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
    ];

    const stepwise = apply(rotateX(Math.PI / 2), [...apply(rotateY(Math.PI / 2), point), 1]);
    const together = apply(composed, point);

    for (let index = 0; index < 3; index += 1) {
      near(together[index], stepwise[index], 1e-6, `component ${index}`);
    }
  });

  it('builds a perspective matrix with the right handedness', () => {
    const projection = perspective(Math.PI / 4, 1, 0.1, 100);
    assert.equal(projection[11], -1, 'the w row must carry -1 for a right-handed view');
    assert.ok(projection[0] > 0 && projection[5] > 0);
  });

  it('translates and scales as stated', () => {
    const t = translate(1, 2, 3);
    assert.deepEqual([t[12], t[13], t[14]], [1, 2, 3]);

    const s = scale(2);
    assert.equal(s[0], 2);
    assert.equal(s[5], 2);
    assert.equal(s[10], 2);
    assert.equal(s[15], 1, 'the homogeneous element must stay 1');
  });
});

describe('placing a point on the sphere', () => {
  it('puts 0°N 0°E on the prime meridian, facing the camera', () => {
    const [x, y, z] = toCartesian(0, 0);
    near(x, 0, 1e-9, 'x');
    near(y, 0, 1e-9, 'y');
    near(z, 1, 1e-9, 'z');
  });

  it('puts the north pole at the top and nowhere else', () => {
    const [x, y, z] = toCartesian(90, 0);
    near(y, 1, 1e-9, 'y');
    near(Math.hypot(x, z), 0, 1e-9, 'the pole has no horizontal component');
  });

  it('sends east to +X, which is what makes the map read correctly', () => {
    const [x, , z] = toCartesian(0, 90);
    near(x, 1, 1e-9, 'x');
    near(z, 0, 1e-9, 'z');
  });

  it('keeps every point on the sphere', () => {
    for (const latitude of [-80, -30, 0, 17, 45, 88]) {
      for (const longitude of [-179, -90, 0, 33, 120, 180]) {
        const [x, y, z] = toCartesian(latitude, longitude);
        near(Math.hypot(x, y, z), 1, 1e-9, `${latitude},${longitude}`);
      }
    }
  });

  it('honours the radius', () => {
    const [x, y, z] = toCartesian(30, 40, 2.5);
    near(Math.hypot(x, y, z), 2.5, 1e-9);
  });

  it('places real cities where they belong relative to each other', () => {
    // A sanity check a wrong sign convention would fail: Delhi is east of
    // Cologne and south of it; Sydney is south of the equator.
    const cologne = toCartesian(50.9, 6.9);
    const delhi = toCartesian(28.6, 77.2);
    const sydney = toCartesian(-33.9, 151.2);

    assert.ok(delhi[0] > cologne[0], 'Delhi must be further east');
    assert.ok(delhi[1] < cologne[1], 'and further south');
    assert.ok(sydney[1] < 0, 'Sydney is below the equator');
  });
});

describe('the coastline data', () => {
  it('is present and plausibly sized', () => {
    assert.ok(COASTLINE.length > 50, `only ${COASTLINE.length} lines`);
    const points = COASTLINE.reduce((sum, line) => sum + line.length, 0);
    assert.ok(points > 1000 && points < 20000, `${points} points is not a coastline`);
  });

  it('holds only valid geographic coordinates', () => {
    for (const line of COASTLINE) {
      assert.ok(line.length >= 2, 'a line needs two points');
      for (const [longitude, latitude] of line) {
        assert.ok(longitude >= -180.5 && longitude <= 180.5, `longitude ${longitude}`);
        assert.ok(latitude >= -90.5 && latitude <= 90.5, `latitude ${latitude}`);
      }
    }
  });

  it('is longitude-first, the order GeoJSON uses', () => {
    // If the pair were flipped, every |value| > 90 would be an illegal
    // latitude — and there are plenty of those in a world coastline.
    const beyond90 = COASTLINE.flat().filter(([longitude]) => Math.abs(longitude) > 90);
    assert.ok(beyond90.length > 100, 'expected many points beyond 90° longitude');
  });
});

describe('the colour ramp', () => {
  it('never returns an undefined colour', () => {
    for (let wetBulb = -10; wetBulb <= 45; wetBulb += 0.5) {
      const colour = colourFor(wetBulb);
      assert.equal(colour.length, 3, `no colour at ${wetBulb}`);
      for (const channel of colour) {
        assert.ok(channel >= 0 && channel <= 1, `channel out of range at ${wetBulb}`);
      }
    }
  });

  it('gets warmer as the wet bulb rises', () => {
    const cool = colourFor(18);
    const hot = colourFor(33);
    assert.ok(hot[0] > cool[0], 'red must increase');
    assert.ok(hot[2] < cool[2], 'blue must decrease');
  });

  it('changes colour at the measured limit', () => {
    assert.notDeepEqual(colourFor(30.9), colourFor(31.1));
  });

  it('has a legend entry for every band it can produce', () => {
    const produced = new Set();
    for (let wetBulb = 0; wetBulb <= 40; wetBulb += 0.25) {
      produced.add(colourFor(wetBulb).join(','));
    }
    const inLegend = new Set(LEGEND.map((entry) => entry.colour.join(',')));

    for (const colour of produced) {
      assert.ok(inLegend.has(colour), `colour ${colour} appears but is not in the legend`);
    }
    assert.equal(produced.size, LEGEND.length, 'and no legend entry is unreachable');
  });

  it('explains each band rather than only naming a range', () => {
    for (const entry of LEGEND) {
      assert.ok(entry.note.length > 10, `${entry.label} has no explanation`);
    }
  });
});

describe('the visible hemisphere', () => {
  /**
   * The shader decides visibility from the sign of the transformed normal's
   * Z component. That is reproduced here in plain arithmetic, because the
   * bug it replaced was invisible to every other kind of test: the globe
   * rendered, the matrices were right, the data was right — and half the
   * planet disappeared as you turned it, because the normal and the camera
   * were being compared in two different spaces.
   *
   * Reproduced before the fix: at 135° and 180° of spin the point directly
   * in front of the camera scored -0.707 and -1.000 and was discarded.
   */
  const apply = (m, v) => [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
  ];

  const modelFor = (cameraLatitude, cameraLongitude) =>
    multiply(
      rotateX((cameraLatitude * Math.PI) / 180),
      rotateY((-cameraLongitude * Math.PI) / 180)
    );

  /** What the fragment shader computes: the normal's Z in view space. */
  const facing = (latitude, longitude, cameraLatitude, cameraLongitude) =>
    apply(modelFor(cameraLatitude, cameraLongitude), toCartesian(latitude, longitude))[2];

  it('shows the point the camera is aimed at, at every longitude', () => {
    for (let longitude = 0; longitude < 360; longitude += 15) {
      const value = facing(20, longitude, 20, longitude);
      assert.ok(
        value > 0.99,
        `at ${longitude}° the point under the camera scored ${value.toFixed(3)} — ` +
          'this is the defect where half the globe vanished as it turned'
      );
    }
  });

  it('hides the far side, at every longitude', () => {
    for (let longitude = 0; longitude < 360; longitude += 15) {
      const opposite = (longitude + 180) % 360;
      const value = facing(-20, opposite, 20, longitude);
      assert.ok(
        value < -0.5,
        `at ${longitude}° the antipode scored ${value.toFixed(3)} and would be drawn`
      );
    }
  });

  it('keeps roughly half the sphere visible from anywhere', () => {
    for (const [cameraLatitude, cameraLongitude] of [[0, 0], [20, 90], [-40, 180], [60, 270]]) {
      let visible = 0;
      let total = 0;
      for (let latitude = -80; latitude <= 80; latitude += 10) {
        for (let longitude = 0; longitude < 360; longitude += 10) {
          total += 1;
          if (facing(latitude, longitude, cameraLatitude, cameraLongitude) > 0) visible += 1;
        }
      }
      const share = visible / total;
      assert.ok(
        share > 0.35 && share < 0.65,
        `from ${cameraLatitude},${cameraLongitude} only ${(share * 100).toFixed(0)} % was visible`
      );
    }
  });

  it('turns smoothly, with no longitude where everything disappears', () => {
    // The failure was not gradual: it went from fine, to half, to nothing.
    // A sudden collapse in the visible count is the signature.
    let previous = null;
    for (let longitude = 0; longitude < 360; longitude += 5) {
      let visible = 0;
      for (let latitude = -60; latitude <= 60; latitude += 15) {
        for (let sample = 0; sample < 360; sample += 15) {
          if (facing(latitude, sample, 20, longitude) > 0) visible += 1;
        }
      }
      assert.ok(visible > 20, `at ${longitude}° only ${visible} points were visible`);
      if (previous !== null) {
        assert.ok(
          Math.abs(visible - previous) < 25,
          `the visible count jumped from ${previous} to ${visible} at ${longitude}°`
        );
      }
      previous = visible;
    }
  });
});
