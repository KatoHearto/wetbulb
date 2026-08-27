/**
 * The physics of humid air, and of a body trying to shed heat into it.
 *
 * Everything in this file is a pure function of measurable quantities. That is
 * deliberate: the claims this tool makes about someone's safety rest on these
 * numbers, so they have to be checkable by anyone, against sources that are
 * not this file.
 *
 * Sources, named so they can be argued with:
 *
 *   Stull, R. (2011). "Wet-Bulb Temperature from Relative Humidity and Air
 *   Temperature." J. Appl. Meteor. Climatol. 50, 2267-2269.
 *
 *   Rothfusz, L. P. (1990). "The Heat Index Equation." NWS Southern Region
 *   Technical Attachment SR/SSD 90-23.
 *
 *   Alduchov & Eskridge (1996), Magnus-form coefficients for saturation
 *   vapour pressure.
 *
 *   Gagge's two-node partitioning of dry and evaporative heat exchange, as
 *   used in ASHRAE 55; the Lewis relation links the two coefficients.
 *
 *   Jay, O. et al. (2019) and Morris, N. B. et al. (2019/2021) for the two
 *   measured fan cases the model is tested against.
 */

// --- saturation vapour pressure -------------------------------------------

/** Magnus coefficients over water (Alduchov & Eskridge 1996). */
const MAGNUS_B = 17.625;
const MAGNUS_C = 243.04;

/** Saturation vapour pressure over water, in kPa, for a temperature in °C. */
export function saturationVapourPressure(celsius) {
  return 0.61094 * Math.exp((MAGNUS_B * celsius) / (MAGNUS_C + celsius));
}

/** Actual vapour pressure, in kPa. */
export function vapourPressure(celsius, relativeHumidity) {
  return (relativeHumidity / 100) * saturationVapourPressure(celsius);
}

/** Dew point in °C — the temperature at which this air would start condensing. */
export function dewPoint(celsius, relativeHumidity) {
  const rh = Math.max(0.01, Math.min(100, relativeHumidity));
  const gamma =
    Math.log(rh / 100) + (MAGNUS_B * celsius) / (MAGNUS_C + celsius);
  return (MAGNUS_C * gamma) / (MAGNUS_B - gamma);
}

/** Relative humidity implied by an air temperature and a dew point. */
export function relativeHumidityFromDewPoint(celsius, dewPointCelsius) {
  const ratio =
    saturationVapourPressure(dewPointCelsius) / saturationVapourPressure(celsius);
  return Math.max(0, Math.min(100, 100 * ratio));
}

// --- wet-bulb temperature --------------------------------------------------

/**
 * Wet-bulb temperature in °C, by Stull's (2011) empirical fit.
 *
 * This is *the* number that decides whether a body can still cool itself.
 * Air temperature alone cannot: at 45 °C and 10 % humidity a healthy person
 * sweats and survives; at 35 °C and 90 % they cannot, because there is
 * nowhere for the sweat to evaporate to.
 *
 * Stull's fit is stated for standard sea-level pressure, roughly -20 °C to
 * 50 °C and 5 % to 99 % humidity, with errors under about 1 °C over that
 * range and larger errors at the cold-and-dry corner. `wetBulbAccuracy()`
 * below reports when a query sits outside that envelope rather than
 * pretending the number is equally good everywhere.
 */
export function wetBulb(celsius, relativeHumidity) {
  const rh = Math.max(0, Math.min(100, relativeHumidity));

  // At saturation the wet bulb has nothing to evaporate into, so it reads the
  // air temperature exactly. Stull's fit is within a few hundredths there;
  // this branch makes the identity exact instead of nearly exact, because it
  // is the anchor every other value is judged against.
  if (rh >= 100) return celsius;

  return (
    celsius * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(celsius + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}

/** Where Stull's fit is trustworthy, and where it is not. */
export function wetBulbAccuracy(celsius, relativeHumidity) {
  const inTemperature = celsius >= -20 && celsius <= 50;
  const inHumidity = relativeHumidity >= 5 && relativeHumidity <= 99;

  if (inTemperature && inHumidity) {
    return { level: 'good', note: 'within the range Stull fitted (error < ~1 °C)' };
  }
  if (!inHumidity && relativeHumidity < 5) {
    return {
      level: 'poor',
      note: 'below 5 % humidity the fit drifts; treat this as indicative only',
    };
  }
  return {
    level: 'edge',
    note: 'outside the fitted range — the value is an extrapolation',
  };
}

// --- heat index ------------------------------------------------------------

const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;
const toCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

/**
 * US National Weather Service heat index, returned in °C.
 *
 * Included because it is the number most people have actually seen, so the
 * tool can connect what it says to what they already half-know. It is a
 * shade temperature for a walking adult and says nothing about sun exposure.
 */
export function heatIndex(celsius, relativeHumidity) {
  const t = toFahrenheit(celsius);
  const rh = Math.max(0, Math.min(100, relativeHumidity));

  // Below about 80 °F the full regression is not valid; the NWS uses this
  // simple average and only switches to Rothfusz above the threshold.
  const simple = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
  if ((simple + t) / 2 < 80) return toCelsius(simple);

  let hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    0.00683783 * t * t -
    0.05481717 * rh * rh +
    0.00122874 * t * t * rh +
    0.00085282 * t * rh * rh -
    0.00000199 * t * t * rh * rh;

  // The two adjustments the NWS applies at the dry and humid corners.
  if (rh < 13 && t >= 80 && t <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  } else if (rh > 85 && t >= 80 && t <= 87) {
    hi += ((rh - 85) / 10) * ((87 - t) / 5);
  }

  return toCelsius(hi);
}

// --- can a body still shed heat? ------------------------------------------

/**
 * Assumptions of the heat-balance model, kept in one place so they can be
 * shown to the user rather than buried.
 */
export const BODY = {
  /** Skin temperature of a heat-stressed person, °C. */
  skinTemperature: 35,
  /** Fully wetted skin: the most evaporation physiology allows. */
  skinWettedness: 1,
  /**
   * Ceiling on evaporative cooling set by how fast a person can sweat,
   * W/m². About 1 L/h over 1.8 m² — the upper end for an acclimatised
   * adult, and not sustainable for long.
   */
  maxSweatCooling: 400,
  /** Still indoor air, m/s. */
  stillAir: 0.2,
  /** Air moving over skin in front of a household fan, m/s. */
  fanAir: 4.0,
};

/** Convective heat transfer coefficient, W/(m²·K), for forced air flow. */
export function convectiveCoefficient(airSpeed) {
  return 8.3 * Math.pow(Math.max(0.05, airSpeed), 0.6);
}

/**
 * Net heat a body can shed, W/m², positive when it is losing heat.
 *
 * Two channels, and their opposition is the whole story:
 *
 *   dry   `h_c · (T_skin − T_air)`  — **negative** once the air is hotter
 *                                     than skin: the air heats you
 *   wet   `h_e · w · (P_skin − P_air)` — the only channel left above skin
 *                                     temperature, and it is capped by how
 *                                     fast you can sweat
 *
 * Moving air multiplies *both*. That is why a fan is not simply good: it
 * scales up the heat coming in as well as the cooling going out, and which
 * one wins depends on the humidity.
 */
export function heatBalance(celsius, relativeHumidity, airSpeed) {
  const hc = convectiveCoefficient(airSpeed);
  // Lewis relation: evaporative and convective transfer scale together.
  const he = 16.5 * hc;

  const dry = hc * (BODY.skinTemperature - celsius);

  const skinVapour = saturationVapourPressure(BODY.skinTemperature);
  const airVapour = vapourPressure(celsius, relativeHumidity);
  const evaporativeCapacity = he * BODY.skinWettedness * (skinVapour - airVapour);

  // Capped both ways: sweat cannot cool faster than it is produced, and air
  // wetter than the skin condenses onto it rather than drying it.
  const wet = Math.min(Math.max(evaporativeCapacity, 0), BODY.maxSweatCooling);

  return {
    dry,
    wet,
    net: dry + wet,
    evaporativeCapacity,
    sweatLimited: evaporativeCapacity > BODY.maxSweatCooling,
    airSpeed,
  };
}

/**
 * Does a fan help here, or does it make things worse?
 *
 * Public advice usually reduces to "switch the fan off above 35 °C", and
 * that rule is wrong in the direction that matters. Measured:
 *
 *   40 °C / 50 % — a fan **lowers** core temperature and heart rate
 *                  (Jay et al. 2019)
 *   47 °C / 10 % — a fan **raises** core temperature
 *                  (Morris et al., dry-heat condition)
 *
 * Both are above 35 °C. The difference is humidity: in humid heat the fan
 * still buys a great deal of evaporation, while in dry heat evaporation is
 * already sweat-limited, so all the extra air flow does is carry more heat
 * *in*. The model reproduces both cases, and the test suite pins them.
 */
export function fanVerdict(celsius, relativeHumidity) {
  const still = heatBalance(celsius, relativeHumidity, BODY.stillAir);
  const fanned = heatBalance(celsius, relativeHumidity, BODY.fanAir);
  const gain = fanned.net - still.net;

  let verdict;
  let reason;

  if (gain > 20) {
    verdict = 'helps';
    reason =
      'moving air carries away far more sweat than it brings heat in — the fan ' +
      'is doing real work here';
  } else if (gain > 0) {
    verdict = 'marginal';
    reason =
      'the fan still helps, but barely; it is close to the point where the heat ' +
      'it blows onto you cancels the evaporation it buys';
  } else {
    verdict = 'harmful';
    reason =
      'the air is hotter than your skin and your sweating is already at its ' +
      'limit, so faster air only delivers heat to you — a fan makes this worse';
  }

  return {
    verdict,
    reason,
    gain,
    still: still.net,
    fanned: fanned.net,
    sweatLimited: fanned.sweatLimited,
  };
}

/**
 * How close this air is to the point where cooling stops being possible.
 *
 * Two thresholds, and the difference between them is the honest part:
 *
 *   35 °C wet-bulb is the *theoretical* limit (Sherwood & Huber 2010) — the
 *   point at which no amount of sweating can shed metabolic heat, for anyone.
 *
 *   ~31 °C wet-bulb is where it actually starts, measured on young healthy
 *   subjects in a climate chamber (Vecellio et al. 2022). For older adults
 *   it is lower still.
 *
 * Quoting only the 35 makes the danger look four degrees further away than
 * it is, so this function carries both and names which is which.
 */
export const WET_BULB_LIMITS = {
  theoretical: 35,
  measuredYoungHealthy: 31,
};

export function survivalMargin(celsius, relativeHumidity) {
  const tw = wetBulb(celsius, relativeHumidity);
  return {
    wetBulb: tw,
    toMeasured: WET_BULB_LIMITS.measuredYoungHealthy - tw,
    toTheoretical: WET_BULB_LIMITS.theoretical - tw,
    pastMeasured: tw >= WET_BULB_LIMITS.measuredYoungHealthy,
    pastTheoretical: tw >= WET_BULB_LIMITS.theoretical,
  };
}
