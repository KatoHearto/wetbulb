/**
 * Real conditions, so the chart opens with something true in it.
 *
 * Chosen to make one argument each, and between them to make the argument of
 * the whole tool: the deadliest entry here is not the hottest one.
 */
export const PRESETS = [
  { id: 'mild', celsius: 28, humidity: 45 },
  { id: 'europe', celsius: 38, humidity: 35 },
  { id: 'gulf', celsius: 35, humidity: 75 },
  { id: 'desert', celsius: 46, humidity: 8 },
  { id: 'monsoon', celsius: 40, humidity: 60 },
  { id: 'indoors', celsius: 33, humidity: 70 },
];

export const PRESETS_BY_ID = new Map(PRESETS.map((preset) => [preset.id, preset]));
