/**
 * When to open the windows, and when opening them is what cooks the room.
 *
 * The commonest mistake in a heat wave is an open window at three in the
 * afternoon. It feels like doing something, and it is a heat source: outdoor
 * air is warmer than indoor air for most of the day, so every hour the window
 * is open is an hour spent importing heat that the walls then hold overnight.
 *
 * There is a window that works, and it is narrower than people think. This
 * module finds it.
 *
 * Everything here is a MODEL, not a measurement. The daily temperature curve
 * is reconstructed from a high and a low, and the indoor response from a
 * single lag constant. Both are stated as such wherever the result is shown —
 * a modelled curve drawn like data is a lie with a nice line width.
 */

/** Hour of the daily minimum: around sunrise, before the sun starts working. */
const HOUR_OF_MINIMUM = 5;
/** Hour of the daily maximum: mid-afternoon, not noon — the ground lags the sun. */
const HOUR_OF_MAXIMUM = 15;

/**
 * Outdoor temperature at a given hour, reconstructed from the day's high and low.
 *
 * Two half-cosines rather than one, because a real day is not symmetric: it
 * warms over the ten hours from dawn to mid-afternoon and cools over the
 * fourteen from mid-afternoon to the next dawn. A single sine puts the
 * evening crossover more than an hour too early, which is exactly the number
 * this module exists to get right.
 */
export function outdoorTemperature(hour, low, high) {
  const h = ((hour % 24) + 24) % 24;
  const amplitude = (high - low) / 2;
  const mean = (high + low) / 2;

  if (h >= HOUR_OF_MINIMUM && h <= HOUR_OF_MAXIMUM) {
    const phase = (h - HOUR_OF_MINIMUM) / (HOUR_OF_MAXIMUM - HOUR_OF_MINIMUM);
    return mean - amplitude * Math.cos(Math.PI * phase);
  }

  const sinceMax = h > HOUR_OF_MAXIMUM ? h - HOUR_OF_MAXIMUM : h + 24 - HOUR_OF_MAXIMUM;
  const nightLength = 24 - (HOUR_OF_MAXIMUM - HOUR_OF_MINIMUM);
  const phase = sinceMax / nightLength;
  return mean + amplitude * Math.cos(Math.PI * phase);
}

/**
 * How a building follows the air outside: damped and late.
 *
 * `inertia` is the fraction of the outdoor swing that reaches the room, and
 * `lagHours` how far behind it arrives. A heavy masonry building barely moves
 * and moves late; a top-floor flat under an uninsulated roof tracks the
 * outside closely and can run hotter than it, which is why `boost` exists.
 */
export const BUILDINGS = [
  {
    id: 'heavy',
    label: 'Solid masonry, thick walls',
    inertia: 0.35,
    lagHours: 5,
    boost: 0,
    note: 'stays cool for days, then stays hot for days once it has warmed through',
  },
  {
    id: 'medium',
    label: 'Ordinary flat or house',
    inertia: 0.55,
    lagHours: 3.5,
    boost: 0.5,
    note: 'follows the day at about half the swing, three hours behind',
  },
  {
    id: 'light',
    label: 'Top floor, or a roof room',
    inertia: 0.75,
    lagHours: 2,
    boost: 2.5,
    note: 'the roof radiates into the room all evening — the deadliest kind of flat',
  },
  {
    id: 'glazed',
    label: 'Large windows facing the sun',
    inertia: 0.8,
    lagHours: 1.5,
    boost: 3.5,
    note: 'glass lets in shortwave sun and traps the longwave heat it becomes',
  },
];

export const BUILDINGS_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]));

/**
 * Indoor temperature through the day, with the windows kept shut.
 *
 * The shut-windows case is the right baseline: it is what the advice below
 * is measured against, and it is what a well-run flat actually does during
 * the day.
 */
export function indoorCurve(low, high, buildingId = 'medium') {
  const building = BUILDINGS_BY_ID.get(buildingId) ?? BUILDINGS_BY_ID.get('medium');
  const mean = (high + low) / 2;

  return Array.from({ length: 24 }, (_, hour) => {
    const lagged = outdoorTemperature(hour - building.lagHours, low, high);
    return mean + (lagged - mean) * building.inertia + building.boost;
  });
}

export function outdoorCurve(low, high) {
  return Array.from({ length: 24 }, (_, hour) => outdoorTemperature(hour, low, high));
}

const formatHour = (hour) => `${String(Math.round(hour) % 24).padStart(2, '0')}:00`;

/** Above this, outdoor air is a bad thing to invite in whatever the room reads. */
export const NEVER_OPEN_ABOVE = 32;

/**
 * How much cooler the outside has to be before opening up is worth it.
 *
 * Not a fixed margin, because a fixed margin gives bad advice at the hot end.
 * A roof room at 35 °C with 34 °C outside clears any small threshold, and
 * "open the windows" is still wrong there: one degree of difference moves
 * almost no heat, while the air coming in is itself near body temperature and
 * carries its own humidity. So the requirement rises with the outdoor
 * temperature, and above `NEVER_OPEN_ABOVE` nothing qualifies at all.
 *
 * Found by looking at the output rather than by reasoning about it: the first
 * version recommended opening up at 17:00 in 34 °C air for a 1.3 °C gain.
 */
export function requiredGain(outdoorCelsius, base = 1.0) {
  return base + Math.max(0, (outdoorCelsius - 26) * 0.5);
}

/**
 * The ventilation window: the hours when outdoor air is genuinely worth letting in.
 */
export function ventilationWindow(low, high, buildingId = 'medium', margin = 1.0) {
  const outdoor = outdoorCurve(low, high);
  const indoor = indoorCurve(low, high, buildingId);

  const worthwhile = Array.from({ length: 24 }, (_, hour) => {
    const gain = indoor[hour] - outdoor[hour];
    const needed = requiredGain(outdoor[hour], margin);
    return {
      hour,
      outdoor: outdoor[hour],
      indoor: indoor[hour],
      gain,
      needed,
      open: gain >= needed && outdoor[hour] <= NEVER_OPEN_ABOVE,
    };
  });

  const openHours = worthwhile.filter((entry) => entry.open);

  if (openHours.length === 0) {
    return {
      hours: worthwhile,
      any: false,
      summary:
        'Outdoor air never drops meaningfully below indoor air today. There is no ' +
        'good hour to ventilate — keep everything shut and shaded, and cool ' +
        'yourself rather than the room.',
      opensAt: null,
      closesAt: null,
      bestHour: null,
    };
  }

  // The window wraps past midnight, so walk from the afternoon peak forward
  // rather than scanning 0..23 and finding two disconnected pieces.
  let opensAt = null;
  for (let offset = 0; offset < 24; offset += 1) {
    const hour = (HOUR_OF_MAXIMUM + offset) % 24;
    if (worthwhile[hour].open) {
      opensAt = hour;
      break;
    }
  }

  let closesAt = opensAt;
  for (let offset = 1; offset <= 24; offset += 1) {
    const hour = (opensAt + offset) % 24;
    if (!worthwhile[hour].open) break;
    closesAt = hour;
  }

  const best = openHours.reduce((a, b) => (b.gain > a.gain ? b : a));

  return {
    hours: worthwhile,
    any: true,
    opensAt,
    closesAt,
    bestHour: best.hour,
    bestGain: best.gain,
    summary:
      `Open everything from about ${formatHour(opensAt)} and shut it again by ` +
      `${formatHour((closesAt + 1) % 24)}. The coldest air of the night arrives ` +
      `around ${formatHour(best.hour)}, ${best.gain.toFixed(1)} °C below the room.`,
  };
}

/**
 * Passive measures, ranked by what they are actually worth.
 *
 * The ranking is the point. Most heat advice is a flat list in which
 * "close the curtains" sits beside "shade the window from outside", as if
 * they were comparable — they differ by about a factor of five, because one
 * intercepts sunlight before it becomes heat in the room and the other
 * catches it afterwards.
 */
export const MEASURES = [
  {
    id: 'external-shade',
    label: 'Shade the glass from outside',
    effect: 5,
    detail:
      'Shutters, awnings, a parasol, a sheet pegged outside — anything that stops ' +
      'sunlight before it crosses the glass. Roughly five times the effect of the ' +
      'same fabric hung inside.',
  },
  {
    id: 'night-vent',
    label: 'Flush the heat out at night',
    effect: 4,
    detail:
      'Windows on opposite sides open together during the cool hours. Cross ' +
      'ventilation moves several times the air of one open window, and it is the ' +
      'only way to get yesterday’s heat back out of the walls.',
  },
  {
    id: 'internal-blind',
    label: 'Close curtains and blinds',
    effect: 1,
    detail:
      'Worth doing, and far weaker than it feels: by the time light reaches an ' +
      'indoor curtain the energy is already in the room. Light-coloured and ' +
      'reflective helps a little.',
  },
  {
    id: 'appliances',
    label: 'Switch off everything that runs warm',
    effect: 2,
    detail:
      'An oven, a tumble dryer, a desktop machine and a dozen standby lights are ' +
      'a few hundred watts of heater in a room you are trying to cool. Cook ' +
      'outside or cold.',
  },
  {
    id: 'one-room',
    label: 'Give up on the flat, defend one room',
    effect: 3,
    detail:
      'Pick the coolest room — north-facing, ground floor, heavy walls — and shut ' +
      'the rest. Cooling one room is achievable; cooling a flat, with these ' +
      'means, is not.',
  },
  {
    id: 'damp-cloth',
    label: 'Cool yourself, not the room',
    effect: 4,
    detail:
      'A wet cloth on the neck and forearms, feet in cool water, damp clothing. ' +
      'When the air cannot be changed this is what remains, and it works — it ' +
      'adds the evaporation your sweat can no longer manage.',
  },
];

export function rankedMeasures() {
  return [...MEASURES].sort((a, b) => b.effect - a.effect);
}
