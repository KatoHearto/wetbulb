/**
 * Real conditions, so the chart opens with something true in it.
 *
 * Chosen to make one argument each, and between them to make the argument of
 * the whole tool: the deadliest entry here is not the hottest one.
 */
export const PRESETS = [
  {
    id: 'mild',
    label: 'Warm summer day',
    celsius: 28,
    humidity: 45,
    note: 'the kind of day nobody worries about, and correctly so',
  },
  {
    id: 'europe',
    label: 'European heat wave',
    celsius: 38,
    humidity: 35,
    note: 'hot, dry, survivable — and still fills hospitals, because of who is in it',
  },
  {
    id: 'gulf',
    label: 'Gulf coast, humid',
    celsius: 35,
    humidity: 75,
    note: 'seven degrees cooler than the heat wave above, and far more dangerous',
  },
  {
    id: 'desert',
    label: 'Desert, bone dry',
    celsius: 46,
    humidity: 8,
    note: 'the highest number here, and not the worst air on this list',
  },
  {
    id: 'monsoon',
    label: 'Pre-monsoon, South Asia',
    celsius: 40,
    humidity: 60,
    note: 'past the limit measured on healthy young adults in a climate chamber',
  },
  {
    id: 'indoors',
    label: 'A flat with no ventilation',
    celsius: 33,
    humidity: 70,
    note: 'where most heat deaths actually happen — indoors, not in the sun',
  },
];

export const PRESETS_BY_ID = new Map(PRESETS.map((preset) => [preset.id, preset]));
