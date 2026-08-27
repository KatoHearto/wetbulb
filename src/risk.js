/**
 * Who this air is dangerous for, and what to do about it.
 *
 * The physics in `psychro.js` is the same for everyone. This file is where it
 * stops being the same, because the published limits describe *young, healthy,
 * acclimatised, resting* people — a group most heat deaths do not belong to.
 *
 * Every modifier below shifts the wet-bulb threshold by a stated number of
 * degrees and carries the reason in the same object. That is on purpose: a
 * personalisation you cannot inspect is indistinguishable from a decorative
 * one, and this is a subject where the difference matters.
 *
 * The shifts are calibrated to the direction and rough magnitude reported in
 * the heat-physiology literature. They are **not** clinical thresholds, and
 * the tool says so where a user can see it, not only in a footnote.
 */

import { WET_BULB_LIMITS, fanVerdict, survivalMargin, wetBulb } from './psychro.js';

/**
 * Each factor lowers the wet-bulb temperature at which trouble starts.
 *
 * `shift` is in °C of wet bulb. A shift of 2 means this person reaches the
 * same physiological strain two wet-bulb degrees earlier than the reference
 * young adult — which, on a humid day, can be an hour of afternoon.
 */
export const FACTORS = [
  { id: 'age65', group: 'body', shift: 2.0 },
  { id: 'age75', group: 'body', shift: 3.0 },
  { id: 'infant', group: 'body', shift: 2.5 },
  { id: 'pregnant', group: 'body', shift: 1.5 },
  { id: 'unacclimatised', group: 'body', shift: 1.5 },
  { id: 'cardiovascular', group: 'health', shift: 2.5 },
  { id: 'respiratory', group: 'health', shift: 2.0 },
  { id: 'diabetes', group: 'health', shift: 1.5 },
  { id: 'kidney', group: 'health', shift: 2.0 },
  { id: 'anticholinergic', group: 'medication', shift: 3.0 },
  { id: 'diuretic', group: 'medication', shift: 2.0 },
  { id: 'betablocker', group: 'medication', shift: 1.5 },
  { id: 'antipsychotic', group: 'medication', shift: 2.5 },
  { id: 'stimulant', group: 'medication', shift: 2.0 },
  { id: 'alcohol', group: 'situation', shift: 1.5 },
  { id: 'exertion', group: 'situation', shift: 3.0 },
  { id: 'noAircon', group: 'situation', shift: 1.0 },
  { id: 'alone', group: 'situation', shift: 1.5 },
];

export const FACTORS_BY_ID = new Map(FACTORS.map((factor) => [factor.id, factor]));

export const GROUPS = ['body', 'health', 'medication', 'situation'];


/**
 * Combine the selected factors into one threshold shift.
 *
 * Not a plain sum. Three risk factors do not make somebody three times as
 * fragile, and adding them linearly would drive the threshold below ambient
 * for anyone who ticks a few boxes — which would make the tool cry wolf and
 * then be ignored. Each further factor contributes less, and the total is
 * capped, so the output stays usable for the people who need it most.
 */
export function combineShift(factorIds) {
  const shifts = factorIds
    .map((id) => FACTORS_BY_ID.get(id))
    .filter(Boolean)
    .map((factor) => factor.shift)
    .sort((a, b) => b - a);

  if (shifts.length === 0) return 0;

  let total = 0;
  shifts.forEach((shift, index) => {
    total += shift * Math.pow(0.6, index);
  });

  return Math.min(total, 8);
}

export const BANDS = [
  { id: 'safe', minMargin: 8 },
  { id: 'watch', minMargin: 5 },
  { id: 'strain', minMargin: 2.5 },
  { id: 'danger', minMargin: 0 },
  { id: 'critical', minMargin: -Infinity },
];

/**
 * Assess a set of conditions for a specific person.
 *
 * `margin` is the headline: how many wet-bulb degrees remain before this
 * person reaches the strain that has been *measured* on healthy young adults.
 * Negative means already past it.
 */
export function assess(celsius, relativeHumidity, factorIds = []) {
  const shift = combineShift(factorIds);
  const base = survivalMargin(celsius, relativeHumidity);
  const threshold = WET_BULB_LIMITS.measuredYoungHealthy - shift;
  const margin = threshold - base.wetBulb;

  const band = BANDS.find((candidate) => margin >= candidate.minMargin) ?? BANDS.at(-1);

  return {
    wetBulb: base.wetBulb,
    threshold,
    shift,
    margin,
    band,
    factors: factorIds.map((id) => FACTORS_BY_ID.get(id)).filter(Boolean),
    pastTheoretical: base.pastTheoretical,
  };
}

/**
 * What to actually do, in the order that buys the most.
 *
 * Generic heat advice fails because it is a list of eight equally-weighted
 * suggestions, and a person under heat strain has neither the attention nor
 * the judgement to rank them. These are ordered by how much each one is worth
 * *in these conditions* — and the fan entry can say "switch it off", which no
 * generic list ever does.
 */
export function actions(celsius, relativeHumidity, factorIds = []) {
  const assessment = assess(celsius, relativeHumidity, factorIds);
  const fan = fanVerdict(celsius, relativeHumidity);
  const selected = new Set(factorIds);
  const list = [];

  // `id` names a pair of keys in the language bundles -- `actions.<id>Title`
  // and `actions.<id>Detail`. The prose used to live here and no longer does:
  // a module that decides what is safe should not also decide what language
  // it is said in, and every translation had to reach the same six branches.
  const add = (weight, id, tone = 'do', values) => list.push({ weight, id, tone, values });

  if (assessment.band.id === 'critical' || assessment.pastTheoretical) {
    add(100, 'leave', 'urgent');
  }

  if (fan.verdict === 'harmful') {
    add(90, 'fanOff', 'stop', { reason: fan.verdict });
  } else if (fan.verdict === 'helps' && celsius > 30) {
    add(55, 'fanOn', 'do');
  }

  if (assessment.band.id !== 'safe') add(85, 'wetSkin', 'do');
  if (celsius > 26) add(70, 'shade', 'do');
  if (selected.has('exertion')) add(95, 'stopWork', 'stop');
  if (selected.has('alone')) add(75, 'checkIn', 'do');

  if (selected.has('age65') || selected.has('age75') || selected.has('infant')) {
    add(65, 'drink', 'do');
  }

  if (selected.has('anticholinergic') || selected.has('diuretic') || selected.has('antipsychotic')) {
    add(60, 'pharmacist', 'do');
  }

  add(40, 'ventilate', 'do');

  if (assessment.band.id === 'danger' || assessment.band.id === 'critical') {
    add(80, 'emergency', 'urgent');
  }

  return list.sort((a, b) => b.weight - a.weight);
}
