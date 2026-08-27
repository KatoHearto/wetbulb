/**
 * The four-by-four matrices a 3D view needs, and nothing else.
 *
 * Written out rather than pulled in, because the page promises no
 * dependencies and this is the entire amount of linear algebra a globe with an
 * orbiting camera requires. Column-major, like WebGL expects.
 */

export function identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function perspective(fieldOfView, aspect, near, far) {
  const f = 1 / Math.tan(fieldOfView / 2);
  const range = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * range, -1,
    0, 0, 2 * far * near * range, 0,
  ]);
}

export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += a[k * 4 + row] * b[column * 4 + k];
      }
      out[column * 4 + row] = sum;
    }
  }
  return out;
}

export function translate(x, y, z) {
  const out = identity();
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

export function rotateX(radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const out = identity();
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  return out;
}

export function rotateY(radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const out = identity();
  out[0] = c;
  out[2] = -s;
  out[8] = s;
  out[10] = c;
  return out;
}

export function scale(factor) {
  const out = identity();
  out[0] = out[5] = out[10] = factor;
  return out;
}

/**
 * A point on the unit sphere from geographic coordinates.
 *
 * Longitude runs east, latitude north, and the prime meridian faces +Z — the
 * convention that makes a naive equirectangular texture line up without a
 * flip, which is one fewer thing to get wrong.
 */
export function toCartesian(latitude, longitude, radius = 1) {
  const phi = (latitude * Math.PI) / 180;
  const lambda = (longitude * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  return [
    radius * cosPhi * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * cosPhi * Math.cos(lambda),
  ];
}
