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
  {
    id: 'age65',
    group: 'body',
    label: 'Over 65',
    shift: 2.0,
    why:
      'sweat production falls with age and the thirst signal weakens, so both ' +
      'the cooling and the cue to drink arrive late',
  },
  {
    id: 'age75',
    group: 'body',
    label: 'Over 75',
    shift: 3.0,
    why:
      'the same effects, further along — most heat-wave deaths are in this ' +
      'group, indoors, alone',
  },
  {
    id: 'infant',
    group: 'body',
    label: 'Infant or small child',
    shift: 2.5,
    why:
      'a large surface area for their mass, an immature sweat response, and no ' +
      'way to leave the room or ask for water',
  },
  {
    id: 'pregnant',
    group: 'body',
    label: 'Pregnant',
    shift: 1.5,
    why: 'higher baseline metabolic heat production and blood volume demands',
  },
  {
    id: 'unacclimatised',
    group: 'body',
    label: 'First hot days of the year',
    shift: 1.5,
    why:
      'acclimatisation takes one to two weeks — the first heat wave of a summer ' +
      'is reliably the deadliest, at temperatures later shrugged off',
  },
  {
    id: 'cardiovascular',
    group: 'health',
    label: 'Heart or circulatory condition',
    shift: 2.5,
    why:
      'cooling means pumping blood to the skin, which is work the heart may not ' +
      'have spare capacity for',
  },
  {
    id: 'respiratory',
    group: 'health',
    label: 'Lung condition',
    shift: 2.0,
    why: 'heat and the ozone that comes with it both raise the breathing load',
  },
  {
    id: 'diabetes',
    group: 'health',
    label: 'Diabetes',
    shift: 1.5,
    why: 'can blunt both sweating and the perception of heat strain',
  },
  {
    id: 'kidney',
    group: 'health',
    label: 'Kidney condition',
    shift: 2.0,
    why: 'fluid balance has less room to absorb the losses sweating causes',
  },
  {
    id: 'anticholinergic',
    group: 'medication',
    label: 'Anticholinergics',
    shift: 3.0,
    why:
      'they suppress sweating directly — the single largest medication effect ' +
      'here. Many antihistamines, some antidepressants and bladder medicines',
  },
  {
    id: 'diuretic',
    group: 'medication',
    label: 'Diuretics',
    shift: 2.0,
    why: 'less circulating fluid to lose before sweating falters',
  },
  {
    id: 'betablocker',
    group: 'medication',
    label: 'Beta blockers',
    shift: 1.5,
    why: 'they cap the heart-rate rise that skin blood flow depends on',
  },
  {
    id: 'antipsychotic',
    group: 'medication',
    label: 'Antipsychotics',
    shift: 2.5,
    why: 'can interfere with the brain’s own temperature regulation',
  },
  {
    id: 'stimulant',
    group: 'medication',
    label: 'Stimulants',
    shift: 2.0,
    why: 'raise heat production while masking the exhaustion that would stop you',
  },
  {
    id: 'alcohol',
    group: 'situation',
    label: 'Drinking alcohol',
    shift: 1.5,
    why: 'dehydrates, and removes the judgement that would call a halt',
  },
  {
    id: 'exertion',
    group: 'situation',
    label: 'Physical work or exercise',
    shift: 3.0,
    why:
      'working muscle can produce ten times the heat of rest — every published ' +
      'survivability limit assumes someone sitting still',
  },
  {
    id: 'noAircon',
    group: 'situation',
    label: 'No air conditioning available',
    shift: 1.0,
    why: 'no fallback if the passive measures are not enough',
  },
  {
    id: 'alone',
    group: 'situation',
    label: 'Alone, nobody checking in',
    shift: 1.5,
    why:
      'heat stroke takes away the judgement needed to recognise heat stroke — ' +
      'somebody else noticing is often the actual safety mechanism',
  },
];

export const FACTORS_BY_ID = new Map(FACTORS.map((factor) => [factor.id, factor]));

export const GROUPS = [
  { id: 'body', label: 'Who this is for' },
  { id: 'health', label: 'Health' },
  { id: 'medication', label: 'Medication' },
  { id: 'situation', label: 'Right now' },
];

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
  {
    id: 'safe',
    label: 'Comfortable',
    headline: 'Your body has plenty of room here.',
    minMargin: 8,
  },
  {
    id: 'watch',
    label: 'Worth watching',
    headline: 'Manageable, but this is the day to plan around.',
    minMargin: 5,
  },
  {
    id: 'strain',
    label: 'Real strain',
    headline: 'Your body is working to stay cool, and it is losing ground slowly.',
    minMargin: 2.5,
  },
  {
    id: 'danger',
    label: 'Dangerous',
    headline: 'Heat illness happens in conditions like this.',
    minMargin: 0,
  },
  {
    id: 'critical',
    label: 'Past the limit',
    headline: 'This air is beyond what a body can shed heat into. Leave it.',
    minMargin: -Infinity,
  },
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

  const add = (weight, title, detail, tone = 'do') =>
    list.push({ weight, title, detail, tone });

  if (assessment.band.id === 'critical' || assessment.pastTheoretical) {
    add(
      100,
      'Get to cooler air now',
      'Not shade, not a fan — genuinely cooler air. A public building, a ' +
        'shopping centre, a basement, a car with air conditioning. In this air, ' +
        'staying put and coping is not one of the options.',
      'urgent'
    );
  }

  if (fan.verdict === 'harmful') {
    add(
      90,
      'Switch the fan off',
      `${fan.reason}. Wet your skin instead — a damp cloth or a spray bottle ` +
        'does the evaporating that your sweat can no longer keep up with.',
      'stop'
    );
  } else if (fan.verdict === 'helps' && celsius > 30) {
    add(
      55,
      'A fan helps here',
      'Point it at yourself, not around the room — the cooling comes from air ' +
        'moving across skin. Common advice says to switch fans off above 35 °C; ' +
        'in air this humid that advice is backwards.',
      'do'
    );
  }

  if (assessment.band.id !== 'safe') {
    add(
      85,
      'Wet your skin',
      'A damp cloth on the neck, forearms and face, or a spray bottle. This ' +
        'works when nothing else does, because it adds evaporation your body no ' +
        'longer has the sweat for. It is also the cheapest thing on this list.',
      'do'
    );
  }

  if (celsius > 26) {
    add(
      70,
      'Shade the windows from the outside',
      'Outside shutters, awnings, even a sheet hung outside stop roughly five ' +
        'times more heat than blinds on the inside. Once sunlight is through ' +
        'the glass the heat is already in the room and curtains only hide it.',
      'do'
    );
  }

  if (selected.has('exertion')) {
    add(
      95,
      'Stop the physical work',
      'Every published survivability limit assumes someone sitting still. ' +
        'Working muscle produces up to ten times the heat of rest, and it is the ' +
        'one variable here you control completely.',
      'stop'
    );
  }

  if (selected.has('alone')) {
    add(
      75,
      'Arrange for someone to check on you',
      'Heat stroke removes the judgement needed to recognise heat stroke. ' +
        'A phone call at a fixed time is a better safeguard than any of your own ' +
        'plans to monitor yourself.',
      'do'
    );
  }

  if (selected.has('age65') || selected.has('age75') || selected.has('infant')) {
    add(
      65,
      'Drink on a schedule, not on thirst',
      'Thirst is an unreliable signal in this group, and by the time it arrives ' +
        'the deficit is already there. A glass every hour, whether or not it is ' +
        'wanted.',
      'do'
    );
  }

  if (selected.has('anticholinergic') || selected.has('diuretic') || selected.has('antipsychotic')) {
    add(
      60,
      'Ask a pharmacist about your medication and heat',
      'Some medicines suppress sweating outright. Do not stop taking anything on ' +
        'your own — but a pharmacist can tell you in two minutes whether yours is ' +
        'on that list, and it changes how careful today needs to be.',
      'do'
    );
  }

  add(
    40,
    'Open up only when outside is cooler than inside',
    'The rule people get wrong. An open window during the afternoon is a heat ' +
      'source. Shut everything through the day, open it wide the moment the ' +
      'outdoor temperature drops below the indoor one, usually late evening.',
    'do'
  );

  if (assessment.band.id === 'danger' || assessment.band.id === 'critical') {
    add(
      80,
      'Know the sign that changes everything',
      'Confusion, agitation, or someone who has stopped sweating in heat like ' +
        'this is a medical emergency, not a bad afternoon. Call emergency ' +
        'services, then cool them with water while you wait.',
      'urgent'
    );
  }

  return list.sort((a, b) => b.weight - a.weight);
}
