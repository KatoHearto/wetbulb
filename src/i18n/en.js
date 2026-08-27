/**
 * English — the source text, and the reference every other bundle is measured
 * against.
 *
 * When a translation and this file disagree, this file is right. That is not
 * a claim about English; it is a claim about provenance. These sentences were
 * written against the physics and the sources, and the others were derived
 * from them without a native speaker checking the result.
 */

export const en = {
  units: {
    celsius: '°C',
    percent: '%',
  },

  meta: {
    title: 'wetbulb — the temperature that decides whether you can cool down',
    description:
      'Air temperature does not tell you whether heat is dangerous. Wet-bulb ' +
      'temperature does. Find out where you stand, whether a fan helps, and which ' +
      'hour of today is really the worst. Works offline; fetches real weather if you ask.',
  },

  masthead: {
    lede: 'Heat kills more people than any other kind of weather — and the number in every warning is the wrong one.',
    blurbBefore: 'Air temperature says almost nothing about whether a body can shed heat.',
    blurbTerm: 'Wet-bulb temperature',
    blurbAfter:
      'decides it. At 45 °C in dry desert air a healthy person sweats and survives. ' +
      'At 35 °C in humid air they cannot, because there is nowhere for the sweat to go.',
    whatLabel: 'what this is',
    what:
      'A calculator and a set of decisions, not a warning service. Give it two numbers, ' +
      'or let it fetch real hourly weather for a place — the sliders keep working either way.',
    privacyBefore: 'No account, no tracking. Works with no network at all — and if you ask it for real weather, it sends only your coordinates to',
    privacyAfter: '.',
  },

  language: {
    label: 'Language',
    machineWarningTitle: 'This translation has not been checked by a native speaker',
    machineWarning:
      'It was produced by the same system that wrote the tool. Where a sentence here ' +
      'and the English version disagree, the English one is right. If something reads ' +
      'wrongly — especially an instruction — please open an issue.',
    original: 'Read the English original',
  },

  where: {
    heading: 'Real weather, if you want it',
    sub:
      'Everything below works from the two sliders alone. Fetching hourly data adds ' +
      'three things the sliders cannot know: which hour of today is actually the worst, ' +
      'how many nights in a row have given no relief, and whether this heat is new to you.',
    searchLabel: 'Search for a place',
    searchPlaceholder: 'Cologne, Delhi, Phoenix…',
    lookUp: 'Look up',
    useLocation: 'Use my location',
    lookingUp: 'Looking up the place…',
    fetching: 'Fetching hourly weather for {place}…',
    askingLocation: 'Asking the browser where you are…',
    sent: 'Coordinates sent: {latitude}, {longitude}. Nothing else left this browser.',
  },

  errors: {
    offline: 'No connection. The sliders still work — this tool never needed the network.',
    timeout: 'The weather service did not answer in time. Try again, or use the sliders.',
    denied: 'Location permission was declined. Search for a place instead, or set the sliders.',
    unsupported: 'This browser will not share a location. Search for a place instead.',
    notFound: 'No place by that name. Try a larger town nearby.',
    server: 'The weather service returned an error. Not something you can fix — try later.',
    malformed: 'The weather service answered with something this app cannot read.',
    generic: 'Something went wrong fetching the weather.',
  },

  findings: {
    sourceHourly: 'hourly forecast',
    sourceDaily: 'daily minima',
    sourcePast: 'past 7 days',

    peakOffsetTitle: 'The worst hour is {hours} h {direction} than the hottest',
    peakEarlier: 'earlier',
    peakLater: 'later',
    peakOffsetDetail:
      'The thermometer peaks at {hottestHour} with {hottestTemp} °C. But the air is ' +
      'hardest on a body at {worstHour}, when it is {worstTemp} °C — {difference} °C ' +
      'cooler and {worstHumidity} % humid. Wet bulb {worstWet} against {hottestWet}.',
    peakSameTitle: 'The peaks line up today',
    peakSameDetail:
      'Today the hottest hour and the most dangerous hour both fall at {hour}. ' +
      'That is the exception, not the rule.',

    nightsTitle: '{current} night(s) without relief',
    nightsMore: ', {ahead} more coming',
    nightsDetail:
      'The night is when a body unloads the heat it took on during the day. Above ' +
      '{threshold} °C it stops doing that. The damage from a heat wave builds over the ' +
      'third and fourth day, and this run is {total} long.',
    nightsCoolTitle: 'The nights are still cooling down',
    nightsCoolDetail:
      'Every night in this window drops below {threshold} °C, so the body gets its ' +
      'chance to recover. That is the single biggest thing separating an uncomfortable ' +
      'week from a dangerous one.',

    acclimatisedTitle: 'Your body has seen this heat before',
    acclimatisedDetail:
      'Today reaches {today} °C and last week already got to {recent} °C. Adapted ' +
      'people sweat sooner and lose less salt doing it.',
    unacclimatisedTitle: 'This is {difference} °C hotter than anything last week',
    unacclimatisedDetail:
      'Today reaches {today} °C; the warmest day of the past {days} was {recent} °C. ' +
      'Acclimatisation takes one to two weeks, which is why the first heat wave of a ' +
      'summer is reliably the most dangerous — at temperatures the same people shrug ' +
      'off in August.',
  },

  chart: {
    heading: 'Where this air puts you',
    sub: 'Drag the point, or use the fields. Every line is computed from the same physics as the numbers beside it.',
    tempLabel: 'Air temperature',
    humidityLabel: 'Relative humidity',
    presetsLabel: 'Or try a real one',
    axisTemp: 'air temperature °C',
    axisHumidity: 'relative humidity %',
    legendMeasured: '{value}° measured',
    legendTheoretical: '{value}° theoretical',
    legendYours: 'yours',
    legendNoFan: 'no fan',
    legendIsopleth: 'wet bulb',
    ariaLabel:
      'Air state chart. Your point: {temp} degrees at {humidity} percent humidity, ' +
      'wet bulb {wetBulb} degrees.',
    youLabel: 'you',
    pointTitle: '{temp} °C at {humidity} % — wet bulb {wetBulb} °C',
  },

  readout: {
    wetBulb: 'Wet-bulb temperature',
    threshold: 'Your threshold',
    margin: 'Margin',
    fan: 'A fan here',
    heatIndex: 'Heat index',
    dewPoint: 'Dew point',
    sourceStull: 'Stull 2011',
    sourceReference: 'reference',
    sourceShifted: '−{shift} shifted',
    sourceMargin: 'threshold − wet bulb',
    sourceBalance: 'heat balance',
    sourceNWS: 'NWS',
    sourceMagnus: 'Magnus',
    marginLeft: '{value} °C left',
    marginPast: '{value} °C past',
    fanHelps: 'helps',
    fanMarginal: 'barely',
    fanHarmful: 'makes it worse',
    accuracyGood: 'within the range Stull fitted (error < ~1 °C)',
    accuracyPoor: 'below 5 % humidity the fit drifts; treat this as indicative only',
    accuracyEdge: 'outside the fitted range — the value is an extrapolation',
  },

  bands: {
    safe: 'Comfortable',
    safeHeadline: 'Your body has plenty of room here.',
    watch: 'Worth watching',
    watchHeadline: 'Manageable, but this is the day to plan around.',
    strain: 'Real strain',
    strainHeadline: 'Your body is working to stay cool, and it is losing ground slowly.',
    danger: 'Dangerous',
    dangerHeadline: 'Heat illness happens in conditions like this.',
    critical: 'Past the limit',
    criticalHeadline: 'This air is beyond what a body can shed heat into. Leave it.',
  },

  who: {
    heading: 'Who is in this air',
    sub:
      'The published limits describe young, healthy, acclimatised people at rest — ' +
      'which is not who dies in heat waves. Each of these moves the threshold by a ' +
      'stated number of degrees.',
    groupBody: 'Who this is for',
    groupHealth: 'Health',
    groupMedication: 'Medication',
    groupSituation: 'Right now',
    noneSelectedBefore: 'Nothing selected — the numbers above describe a',
    noneSelectedTerm: 'young, healthy, acclimatised adult sitting still in the shade',
    noneSelectedAfter: '. That is who the published limits were measured on.',
    selected:
      '{count} factor(s) selected. Threshold moved down by {shift} °C of wet bulb, to ' +
      '{threshold} °C. Each further factor counts for less than the last — three risk ' +
      'factors do not make someone three times as fragile.',
  },

  factors: {
    age65: 'Over 65',
    age65Why: 'sweat production falls with age and the thirst signal weakens, so both the cooling and the cue to drink arrive late',
    age75: 'Over 75',
    age75Why: 'the same effects, further along — most heat-wave deaths are in this group, indoors, alone',
    infant: 'Infant or small child',
    infantWhy: 'a large surface area for their mass, an immature sweat response, and no way to leave the room or ask for water',
    pregnant: 'Pregnant',
    pregnantWhy: 'higher baseline metabolic heat production and blood volume demands',
    unacclimatised: 'First hot days of the year',
    unacclimatisedWhy: 'acclimatisation takes one to two weeks — the first heat wave of a summer is reliably the most dangerous, at temperatures later shrugged off',
    cardiovascular: 'Heart or circulatory condition',
    cardiovascularWhy: 'cooling means pumping blood to the skin, which is work the heart may not have spare capacity for',
    respiratory: 'Lung condition',
    respiratoryWhy: 'heat and the ozone that comes with it both raise the breathing load',
    diabetes: 'Diabetes',
    diabetesWhy: 'can blunt both sweating and the perception of heat strain',
    kidney: 'Kidney condition',
    kidneyWhy: 'fluid balance has less room to absorb the losses sweating causes',
    anticholinergic: 'Anticholinergics',
    anticholinergicWhy: 'they suppress sweating directly — the single largest medication effect here. Many antihistamines, some antidepressants and bladder medicines',
    diuretic: 'Diuretics',
    diureticWhy: 'less circulating fluid to lose before sweating falters',
    betablocker: 'Beta blockers',
    betablockerWhy: 'they cap the heart-rate rise that skin blood flow depends on',
    antipsychotic: 'Antipsychotics',
    antipsychoticWhy: 'can interfere with the brain’s own temperature regulation',
    stimulant: 'Stimulants',
    stimulantWhy: 'raise heat production while masking the exhaustion that would stop you',
    alcohol: 'Drinking alcohol',
    alcoholWhy: 'dehydrates, and removes the judgement that would call a halt',
    exertion: 'Physical work or exercise',
    exertionWhy: 'working muscle can produce ten times the heat of rest — every published survivability limit assumes someone sitting still',
    noAircon: 'No air conditioning available',
    noAirconWhy: 'no fallback if the passive measures are not enough',
    alone: 'Alone, nobody checking in',
    aloneWhy: 'heat stroke takes away the judgement needed to recognise heat stroke — somebody else noticing is often the actual safety mechanism',
  },

  actions: {
    heading: 'What to do, in order',
    sub: 'Ranked by what each one is worth in these conditions. The first line is the one that matters most.',

    leaveTitle: 'Get to cooler air now',
    leaveDetail:
      'Not shade, not a fan — genuinely cooler air. A public building, a shopping ' +
      'centre, a basement, a car with air conditioning. In this air, staying put and ' +
      'coping is not one of the options.',
    fanOffTitle: 'Switch the fan off',
    fanOffDetail:
      '{reason}. Wet your skin instead — a damp cloth or a spray bottle does the ' +
      'evaporating that your sweat can no longer keep up with.',
    fanOnTitle: 'A fan helps here',
    fanOnDetail:
      'Point it at yourself, not around the room — the cooling comes from air moving ' +
      'across skin. Common advice says to switch fans off above 35 °C; in air this ' +
      'humid that advice is backwards.',
    wetSkinTitle: 'Wet your skin',
    wetSkinDetail:
      'A damp cloth on the neck, forearms and face, or a spray bottle. This works when ' +
      'nothing else does, because it adds evaporation your body no longer has the sweat ' +
      'for. It is also the cheapest thing on this list.',
    shadeTitle: 'Shade the windows from the outside',
    shadeDetail:
      'Outside shutters, awnings, even a sheet hung outside stop roughly five times more ' +
      'heat than blinds on the inside. Once sunlight is through the glass the heat is ' +
      'already in the room and curtains only hide it.',
    stopWorkTitle: 'Stop the physical work',
    stopWorkDetail:
      'Every published survivability limit assumes someone sitting still. Working muscle ' +
      'produces up to ten times the heat of rest, and it is the one variable here you ' +
      'control completely.',
    checkInTitle: 'Arrange for someone to check on you',
    checkInDetail:
      'Heat stroke removes the judgement needed to recognise heat stroke. A phone call at ' +
      'a fixed time is a better safeguard than any of your own plans to monitor yourself.',
    drinkTitle: 'Drink on a schedule, not on thirst',
    drinkDetail:
      'Thirst is an unreliable signal in this group, and by the time it arrives the ' +
      'deficit is already there. A glass every hour, whether or not it is wanted.',
    pharmacistTitle: 'Ask a pharmacist about your medication and heat',
    pharmacistDetail:
      'Some medicines suppress sweating outright. Do not stop taking anything on your ' +
      'own — but a pharmacist can tell you in two minutes whether yours is on that list, ' +
      'and it changes how careful today needs to be.',
    ventilateTitle: 'Open up only when outside is cooler than inside',
    ventilateDetail:
      'The rule people get wrong. An open window during the afternoon is a heat source. ' +
      'Shut everything through the day, open it wide the moment the outdoor temperature ' +
      'drops below the indoor one, usually late evening.',
    emergencyTitle: 'Know the sign that changes everything',
    emergencyDetail:
      'Confusion, agitation, or someone who has stopped sweating in heat like this is a ' +
      'medical emergency, not a bad afternoon. Call emergency services, then cool them ' +
      'with water while you wait.',

    fanReasonHelps: 'moving air carries away far more sweat than it brings heat in — the fan is doing real work here',
    fanReasonMarginal: 'the fan still helps, but barely; it is close to the point where the heat it blows onto you cancels the evaporation it buys',
    fanReasonHarmful: 'the air is hotter than your skin and your sweating is already at its limit, so faster air only delivers heat to you — a fan makes this worse',
  },

  day: {
    heading: 'The day, hour by hour',
    subModelled:
      'Two questions on one time axis: when this air is at its worst, and when opening ' +
      'a window stops importing heat. Without a fetched forecast both curves are a ' +
      'model built from a high and a low, drawn dashed for that reason.',
    subMeasured:
      'Measured hourly values for this place. The large marker is the most dangerous ' +
      'hour, the small one the hottest — they are rarely the same hour, and the gap is ' +
      'the reason this tool exists.',
    lowLabel: 'Today’s low',
    highLabel: 'Today’s high',
    buildingLabel: 'Your building',
    axisHour: 'hour of day',
    axisWetBulb: 'wet bulb °C',
    axisCelsius: '°C',
    thresholdLabel: 'your threshold {value}°',
    nightsCaption: 'nights below {threshold}°C give the body a chance',
    today: 'today',
    markHottest: 'Hottest hour: {hour}, {temp} °C',
    markWorst: 'Most dangerous hour: {hour}, wet bulb {wetBulb} °C',
    aria: 'Wet-bulb temperature through the day. Hottest hour {hottest}, most dangerous hour {worst}.',
    nightTooltip: '{date}: low {low}',
    nightTooltipHot: '{date}: low {low} — no relief',
    unknown: 'unknown',
    nightsAria: '{count} consecutive nights without relief in this window.',
    notEnough: 'not enough data',
    legendOutdoors: 'outdoors (modelled)',
    legendIndoors: 'indoors (modelled)',
    legendWindow: 'worth opening up',
    legendWetBulb: 'wet bulb (measured)',
    legendThreshold: 'your threshold',
    legendPast: 'past your threshold',
    windowSummary:
      'Open everything from about {opens} and shut it again by {closes}. The coldest air ' +
      'arrives around {best}, {gain} °C below the room.',
    windowNone:
      'Outdoor air never drops far enough below the room today. No good hour to ' +
      'ventilate — keep everything shut and shaded, and cool yourself instead.',
    windowInsufficient: 'Not enough hourly data to judge ventilation.',
  },

  buildings: {
    heavy: 'Solid masonry, thick walls',
    heavyNote: 'stays cool for days, then stays hot for days once it has warmed through',
    medium: 'Ordinary flat or house',
    mediumNote: 'follows the day at about half the swing, three hours behind',
    light: 'Top floor, or a roof room',
    lightNote: 'the roof radiates into the room all evening — the deadliest kind of flat',
    glazed: 'Large windows facing the sun',
    glazedNote: 'glass lets in shortwave sun and traps the longwave heat it becomes',
  },

  globe: {
    heading: 'Where the heat lives',
    sub:
      'Not today’s weather — the shape of the problem. Each cell is the wet-bulb ' +
      'temperature a place reaches in a normal hot season, from three years of ' +
      'reanalysis. Drag to turn, scroll to zoom. Look up a place above and the globe ' +
      'goes there.',
    ariaLabel: 'A globe showing where wet-bulb temperature is structurally high',
    note: '{cells} land cells at {step}°, {percentile}th percentile wet bulb, {from}–{to}.',
    noWebGL:
      'This browser cannot draw the globe (WebGL is unavailable). Everything else on ' +
      'the page works without it.',
    band1: '< 22°',
    band1Note: 'no heat constraint',
    band2: '22–25°',
    band2Note: 'noticeable in summer',
    band3: '25–27°',
    band3Note: 'work becomes hard',
    band4: '27–29°',
    band4Note: 'dangerous for the vulnerable',
    band5: '29–31°',
    band5Note: 'approaching the measured limit',
    band6: '≥ 31°',
    band6Note: 'past it, in a normal hot season',
    bandEmpty: '{note} — no cell here',
    factHotCellsTitle: '{count} of {total} land cells sit above 26 °C',
    factHotCellsDetail:
      'and they are not scattered: the Ganges delta, the Punjab, the North China Plain, ' +
      'the Gulf. Roughly a fifth of humanity lives inside that handful of cells, which ' +
      'is the whole reason this map is worth drawing.',
    factCeilingTitle: 'Nothing here reaches {limit} °C — and that is not reassurance',
    factCeilingDetail:
      'This is the 95th percentile across a whole hot season, so it describes the ' +
      'weather a place has most summers, not its worst hour. Single hours go far higher: ' +
      '35 °C wet bulb has been recorded on the Persian Gulf coast. A cell at 28 °C spends ' +
      'real hours well past 31.',
    factHottestTitle: 'Hottest cell: {value} °C at {latitude}° {ns}, {longitude}° {ew}',
    factHottestDetail:
      'Each cell is {step}° across — about 650 km — so it averages a coastline with a ' +
      'plateau and a city with a field. Real places inside it diverge in both directions.',
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'W',
  },

  measures: {
    heading: 'What actually cools a room',
    sub:
      'Most heat advice is a flat list in which "close the curtains" sits beside "shade ' +
      'the window from outside", as if they were comparable. They differ by about five ' +
      'times.',
    worth: '{value}× worth',
    externalShade: 'Shade the glass from outside',
    externalShadeDetail:
      'Shutters, awnings, a parasol, a sheet pegged outside — anything that stops ' +
      'sunlight before it crosses the glass. Roughly five times the effect of the same ' +
      'fabric hung inside.',
    nightVent: 'Flush the heat out at night',
    nightVentDetail:
      'Windows on opposite sides open together during the cool hours. Cross ventilation ' +
      'moves several times the air of one open window, and it is the only way to get ' +
      'yesterday’s heat back out of the walls.',
    internalBlind: 'Close curtains and blinds',
    internalBlindDetail:
      'Worth doing, and far weaker than it feels: by the time light reaches an indoor ' +
      'curtain the energy is already in the room. Light-coloured and reflective helps a little.',
    appliances: 'Switch off everything that runs warm',
    appliancesDetail:
      'An oven, a tumble dryer, a desktop machine and a dozen standby lights are a few ' +
      'hundred watts of heater in a room you are trying to cool. Cook outside or cold.',
    oneRoom: 'Give up on the flat, defend one room',
    oneRoomDetail:
      'Pick the coolest room — north-facing, ground floor, heavy walls — and shut the ' +
      'rest. Cooling one room is achievable; cooling a flat, with these means, is not.',
    dampCloth: 'Cool yourself, not the room',
    dampClothDetail:
      'A wet cloth on the neck and forearms, feet in cool water, damp clothing. When the ' +
      'air cannot be changed this is what remains, and it works — it adds the evaporation ' +
      'your sweat can no longer manage.',
  },

  presets: {
    mild: 'Warm summer day',
    mildNote: 'the kind of day nobody worries about, and correctly so',
    europe: 'European heat wave',
    europeNote: 'hot, dry, survivable — and still fills hospitals, because of who is in it',
    gulf: 'Gulf coast, humid',
    gulfNote: 'seven degrees cooler than the heat wave above, and far more dangerous',
    desert: 'Desert, bone dry',
    desertNote: 'the highest number here, and not the worst air on this list',
    monsoon: 'Pre-monsoon, South Asia',
    monsoonNote: 'past the limit measured on healthy young adults in a climate chamber',
    indoors: 'A flat with no ventilation',
    indoorsNote: 'where most heat deaths actually happen — indoors, not in the sun',
  },

  limits: {
    heading: 'What this cannot do',
    doctorLabel: 'not a doctor',
    doctor:
      'Nothing here is medical advice, and the thresholds are calibrated to published ' +
      'physiology, not to you. If someone is confused, agitated, or has stopped sweating ' +
      'in heat, that is an emergency — call, do not calculate.',
    forecastLabel: 'not a forecast',
    forecast:
      'It has no idea what the weather is unless you ask it to look. Official heat ' +
      'warnings know things this does not, including how long the heat has already lasted.',
    limitsLabel: 'two limits, not one',
    limitsText:
      '35 °C wet bulb is the theoretical limit. Around 31 °C is where strain has actually ' +
      'been measured on young healthy subjects. Quoting only the 35 makes the danger look ' +
      'four degrees further away than it is.',
    shadeLabel: 'shade, and standing still',
    shade:
      'Every number here assumes shade and rest. Direct sun adds the equivalent of several ' +
      'degrees; physical work can multiply your heat production tenfold.',
  },

  footer: {
    source: 'Source, sources and test suite on GitHub',
    tagline: 'built to be checked, not believed',
  },
};
