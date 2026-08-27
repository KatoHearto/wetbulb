/**
 * The globe: a sphere, the coastlines on it, and the wet-bulb zones under them.
 *
 * Written against raw WebGL rather than a library. Three.js would be around
 * 600 KB — larger than everything else on this page put together — and this
 * needs perhaps four hundred lines of it: a sphere, three matrices, two
 * shaders and an orbit camera. The page promises no dependencies, and that
 * promise is worth more than the convenience.
 *
 * What is drawn, and why it is not live:
 *
 *   the zones      the 95th-percentile wet bulb of the hot season, computed
 *                  once from three years of reanalysis and shipped as data
 *   the coastlines Natural Earth 110 m, simplified, shipped as data
 *   your point     the one place you actually asked about, live
 *
 * A live world grid was measured and rejected: a bulk request counts per
 * coordinate, so one 600-point request exhausts the entire per-minute
 * allowance and a globe of live data would serve sixteen page views a day.
 * The structural map is also the better answer — where heat is dangerous is a
 * property of a place, not of a Tuesday.
 */

import { CLIMATOLOGY, CLIMATOLOGY_META } from './climatology.js';
import { COASTLINE } from './coastline.js';
import {
  multiply,
  perspective,
  rotateX,
  rotateY,
  toCartesian,
  translate,
} from './mat4.js';

const VERTEX_SHADER = `
attribute vec3 position;
attribute vec3 colour;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float pointScale;
varying vec3 vColour;
varying vec3 vNormal;
void main() {
  vColour = colour;
  vNormal = normalize(mat3(model) * position);
  gl_Position = projection * view * model * vec4(position, 1.0);
  gl_PointSize = pointScale / max(0.6, gl_Position.w);
}
`;

/**
 * The fragment shader carries the one piece of shading that is not decoration:
 * facing away from the camera fades a fragment out. Without it the far side of
 * the globe draws over the near side and the whole thing reads as a flat disc.
 *
 * The test compares the normal against +Z, and that is the whole subtlety.
 * `vNormal` has already been through the model matrix, so it lives in view
 * space, where the camera always looks down −Z from the origin and a surface
 * facing the viewer has a normal pointing at +Z. The first version compared it
 * against the camera's position in the *globe's* frame instead: two different
 * spaces, so the visible hemisphere rotated with the planet rather than staying
 * put. At 180° of spin the two were exactly opposed and every fragment was
 * discarded — the globe simply vanished.
 */
const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vColour;
varying vec3 vNormal;
uniform float minAlpha;
uniform float rounded;
void main() {
  // View space: the viewer is at the origin looking down -Z, so anything
  // turned towards them has a normal with a positive Z component.
  float facing = normalize(vNormal).z;
  if (facing < -0.08) discard;

  // Point sprites are square. The location marker is a marker, so it gets
  // cut to a disc with a ring; everything else keeps its own geometry.
  float edge = 1.0;
  if (rounded > 0.5) {
    float r = length(gl_PointCoord - vec2(0.5));
    if (r > 0.5) discard;
    edge = smoothstep(0.5, 0.34, r) * 0.55 + smoothstep(0.30, 0.24, r) * 0.45;
  }

  float alpha = clamp((facing + 0.08) * 2.2, minAlpha, 1.0);
  gl_FragColor = vec4(vColour, alpha * edge);
}
`;

/**
 * The colour ramp.
 *
 * Deliberately not a smooth gradient. The two cool bands are held back —
 * dark, low-contrast, nearly the colour of the ocean — and the warm ones step
 * up sharply. Most of the planet's land is in the cool bands, and a ramp that
 * gave them equal visual weight would produce a pretty map in which the
 * dangerous fifth is hard to find.
 *
 * The step between 25 and 27 is the largest on purpose: that is where a
 * climate stops being uncomfortable and starts constraining what a body can
 * do outdoors.
 */
const RAMP = [
  { limit: 22, colour: [0.16, 0.24, 0.33] },
  { limit: 25, colour: [0.29, 0.41, 0.47] },
  { limit: 27, colour: [0.69, 0.60, 0.36] },
  { limit: 29, colour: [0.89, 0.53, 0.20] },
  { limit: 31, colour: [0.86, 0.27, 0.13] },
  { limit: 99, colour: [0.71, 0.09, 0.14] },
];

export function colourFor(wetBulb) {
  for (const stop of RAMP) {
    if (wetBulb < stop.limit) return stop.colour;
  }
  return RAMP.at(-1).colour;
}

export const LEGEND = RAMP.map((step, index) => ({
  id: `band${index + 1}`,
  colour: step.colour,
}));


function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader failed to compile: ${log}`);
  }
  return shader;
}

function buildProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`program failed to link: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/** A UV sphere, as triangles, for the body of the globe. */
function sphereGeometry(rings = 48, segments = 96) {
  const positions = [];
  const colours = [];
  const ocean = [0.055, 0.075, 0.095];

  for (let ring = 0; ring < rings; ring += 1) {
    const phi1 = (ring / rings) * Math.PI - Math.PI / 2;
    const phi2 = ((ring + 1) / rings) * Math.PI - Math.PI / 2;

    for (let segment = 0; segment < segments; segment += 1) {
      const theta1 = (segment / segments) * Math.PI * 2;
      const theta2 = ((segment + 1) / segments) * Math.PI * 2;

      const corners = [
        [phi1, theta1], [phi2, theta1], [phi2, theta2],
        [phi1, theta1], [phi2, theta2], [phi1, theta2],
      ];

      for (const [phi, theta] of corners) {
        positions.push(
          Math.cos(phi) * Math.sin(theta),
          Math.sin(phi),
          Math.cos(phi) * Math.cos(theta)
        );
        colours.push(...ocean);
      }
    }
  }

  return { positions: new Float32Array(positions), colours: new Float32Array(colours) };
}

/** Coastlines, lifted just clear of the surface so they are not z-fought. */
function coastlineGeometry(radius = 1.012) {
  const positions = [];
  const colours = [];
  const ink = [0.42, 0.46, 0.5];

  for (const line of COASTLINE) {
    for (let index = 0; index + 1 < line.length; index += 1) {
      const [lon1, lat1] = line[index];
      const [lon2, lat2] = line[index + 1];
      // A segment crossing the antimeridian would otherwise be drawn straight
      // through the middle of the planet.
      if (Math.abs(lon2 - lon1) > 180) continue;
      positions.push(...toCartesian(lat1, lon1, radius));
      positions.push(...toCartesian(lat2, lon2, radius));
      colours.push(...ink, ...ink);
    }
  }

  return { positions: new Float32Array(positions), colours: new Float32Array(colours) };
}

/**
 * Each climatology cell as a patch of surface, not a dot.
 *
 * The question was about zones, and a scatter of points is not a zone: it
 * reads as a sample, leaves the eye to interpolate, and changes apparent
 * density with the projection — the poles look crowded for no reason. Two
 * triangles per cell, sized to the grid, make a continuous field where the
 * data is continuous and leave honest gaps where it is not.
 *
 * The patch is drawn slightly under-size so neighbouring cells do not
 * z-fight along their shared edge, which produces a faint lattice that reads
 * as structure rather than as an artefact.
 */
function zoneGeometry(radius = 1.006, step = CLIMATOLOGY_META.step ?? 6) {
  // The offset has to clear the cell's own chord sag, not just the sphere.
  // A 6° patch drawn as two flat triangles dips 1 − cos(3°) ≈ 0.0014 below the
  // sphere at its centre; at the first offset of 0.0015 that left thirteen
  // ten-thousandths of clearance, and the faceted sphere punched through it as
  // black triangles in every cell.
  const positions = [];
  const colours = [];
  const half = (step / 2) * 0.94;

  for (const [latitude, longitude, wetBulb] of CLIMATOLOGY) {
    const colour = colourFor(wetBulb);

    // Clamp so a polar cell does not fold over the pole and invert itself.
    const south = Math.max(-89.5, latitude - half);
    const north = Math.min(89.5, latitude + half);
    const west = longitude - half;
    const east = longitude + half;

    const corners = [
      toCartesian(south, west, radius),
      toCartesian(north, west, radius),
      toCartesian(north, east, radius),
      toCartesian(south, west, radius),
      toCartesian(north, east, radius),
      toCartesian(south, east, radius),
    ];

    for (const corner of corners) {
      positions.push(...corner);
      colours.push(...colour);
    }
  }

  return {
    positions: new Float32Array(positions),
    colours: new Float32Array(colours),
    count: positions.length / 3,
  };
}

function makeBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

/**
 * Create the globe in a canvas.
 *
 * Returns a handle with `focus(latitude, longitude)` and `destroy()`, or
 * throws if WebGL is unavailable — the caller is expected to catch that and
 * say so, rather than leaving an empty rectangle on the page.
 */
export function createGlobe(canvas, options = {}) {
  const gl =
    canvas.getContext('webgl', { antialias: true, alpha: true }) ??
    canvas.getContext('experimental-webgl');
  if (!gl) throw new Error('WebGL is not available in this browser');

  const program = buildProgram(gl);
  gl.useProgram(program);

  const attributes = {
    position: gl.getAttribLocation(program, 'position'),
    colour: gl.getAttribLocation(program, 'colour'),
  };
  const uniforms = {
    model: gl.getUniformLocation(program, 'model'),
    view: gl.getUniformLocation(program, 'view'),
    projection: gl.getUniformLocation(program, 'projection'),
    pointScale: gl.getUniformLocation(program, 'pointScale'),
    minAlpha: gl.getUniformLocation(program, 'minAlpha'),
    rounded: gl.getUniformLocation(program, 'rounded'),
  };

  const sphere = sphereGeometry();
  const coast = coastlineGeometry();
  const zones = zoneGeometry();

  const buffers = {
    spherePosition: makeBuffer(gl, sphere.positions),
    sphereColour: makeBuffer(gl, sphere.colours),
    coastPosition: makeBuffer(gl, coast.positions),
    coastColour: makeBuffer(gl, coast.colours),
    zonePosition: makeBuffer(gl, zones.positions),
    zoneColour: makeBuffer(gl, zones.colours),
    markerPosition: gl.createBuffer(),
    markerColour: gl.createBuffer(),
  };

  const camera = {
    latitude: 20,
    longitude: 0,
    distance: 3.2,
    targetLatitude: 20,
    targetLongitude: 0,
    targetDistance: 3.2,
  };

  let marker = null;
  let running = true;

  function setMarker(latitude, longitude) {
    marker = { latitude, longitude };
    const position = new Float32Array(toCartesian(latitude, longitude, 1.03));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.markerPosition);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.markerColour);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 1]), gl.STATIC_DRAW);
  }

  function focus(latitude, longitude, { distance = 2.1, immediate = false } = {}) {
    setMarker(latitude, longitude);
    camera.targetLatitude = Math.max(-80, Math.min(80, latitude));
    camera.targetLongitude = longitude;
    camera.targetDistance = distance;

    // Easing is what makes a jump legible, but it needs frames to happen in.
    // A first render, or a still capture, has none — so it can ask to arrive.
    if (immediate) {
      camera.latitude = camera.targetLatitude;
      camera.longitude = camera.targetLongitude;
      camera.distance = camera.targetDistance;
    }
  }

  function bind(positionBuffer, colourBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.enableVertexAttribArray(attributes.colour);
    gl.vertexAttribPointer(attributes.colour, 3, gl.FLOAT, false, 0, 0);
  }

  function draw() {
    if (!running) return;

    // Ease towards the target so a jump to a new place reads as a movement,
    // which is what makes a globe legible rather than teleporting.
    camera.latitude += (camera.targetLatitude - camera.latitude) * 0.08;
    camera.distance += (camera.targetDistance - camera.distance) * 0.08;
    let delta = camera.targetLongitude - camera.longitude;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    camera.longitude += delta * 0.08;

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const projection = perspective(
      (38 * Math.PI) / 180,
      canvas.width / canvas.height,
      0.1,
      100
    );
    const view = translate(0, 0, -camera.distance);
    const model = multiply(
      rotateX((camera.latitude * Math.PI) / 180),
      rotateY((-camera.longitude * Math.PI) / 180)
    );

    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.projection, false, projection);
    gl.uniformMatrix4fv(uniforms.view, false, view);
    gl.uniformMatrix4fv(uniforms.model, false, model);

    gl.uniform1f(uniforms.minAlpha, 1);
    gl.uniform1f(uniforms.pointScale, 1);
    gl.uniform1f(uniforms.rounded, 0);
    bind(buffers.spherePosition, buffers.sphereColour);
    gl.drawArrays(gl.TRIANGLES, 0, sphere.positions.length / 3);

    const zoom = 3.2 / camera.distance;
    gl.uniform1f(uniforms.minAlpha, 0);
    bind(buffers.zonePosition, buffers.zoneColour);
    gl.drawArrays(gl.TRIANGLES, 0, zones.count);

    gl.uniform1f(uniforms.minAlpha, 0);
    bind(buffers.coastPosition, buffers.coastColour);
    gl.drawArrays(gl.LINES, 0, coast.positions.length / 3);

    if (marker) {
      gl.uniform1f(uniforms.rounded, 1);
      gl.uniform1f(uniforms.pointScale, 22 * zoom * ratio);
      gl.uniform1f(uniforms.minAlpha, 0);
      bind(buffers.markerPosition, buffers.markerColour);
      gl.drawArrays(gl.POINTS, 0, 1);
    }

    requestAnimationFrame(draw);
  }

  // --- interaction ---------------------------------------------------------

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onDown = (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event) => {
    if (!dragging) return;
    const speed = 0.22 * (camera.distance / 3.2);
    camera.targetLongitude -= (event.clientX - lastX) * speed;
    camera.targetLatitude = Math.max(
      -85,
      Math.min(85, camera.targetLatitude + (event.clientY - lastY) * speed)
    );
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onUp = (event) => {
    dragging = false;
    try {
      canvas.releasePointerCapture?.(event.pointerId);
    } catch {
      /* the pointer was already released */
    }
  };

  const onWheel = (event) => {
    event.preventDefault();
    const factor = Math.exp(event.deltaY * 0.0012);
    camera.targetDistance = Math.max(1.25, Math.min(6, camera.targetDistance * factor));
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // Pinch, for the platform where this matters most.
  let pinchStart = null;
  const distanceBetween = (touches) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );

  const onTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchStart = { gap: distanceBetween(event.touches), distance: camera.targetDistance };
    }
  };
  const onTouchMove = (event) => {
    if (event.touches.length === 2 && pinchStart) {
      event.preventDefault();
      const ratio = pinchStart.gap / distanceBetween(event.touches);
      camera.targetDistance = Math.max(1.25, Math.min(6, pinchStart.distance * ratio));
    }
  };
  const onTouchEnd = () => {
    pinchStart = null;
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  if (options.latitude !== undefined && options.longitude !== undefined) {
    focus(options.latitude, options.longitude);
  }

  requestAnimationFrame(draw);

  return {
    focus,
    meta: CLIMATOLOGY_META,
    destroy() {
      running = false;
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
  };
}
