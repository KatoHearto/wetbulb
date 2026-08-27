import * as chart from './src/chart.js';
import { currentInfo, initLanguage, n, onLanguageChange, setLanguage, t } from './src/i18n/index.js';
import { DEFAULT_LANGUAGE, LANGUAGES } from './src/i18n/core.js';
import * as dayChart from './src/daychart.js';
import * as dayView from './src/dayview.js';
import { LEGEND as GLOBE_LEGEND, colourFor, createGlobe } from './src/globe.js';
import { CLIMATOLOGY, CLIMATOLOGY_META } from './src/climatology.js';
import { analyse } from './src/forecast.js';
import { WeatherError, currentPosition, fetchForecast, searchPlace } from './src/weather.js';
import {
  BUILDINGS,
  BUILDINGS_BY_ID,
  MEASURES,
  NEVER_OPEN_ABOVE,
  rankedMeasures,
  requiredGain,
} from './src/cooling.js';
import { FACTORS, GROUPS, actions, assess } from './src/risk.js';
import { PRESETS } from './src/presets.js';
import { WET_BULB_LIMITS, dewPoint, fanVerdict, heatIndex, wetBulbAccuracy } from './src/psychro.js';

const $ = (id) => document.getElementById(id);

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );


/**
 * A temperature, in the reader's numerals and the reader's unit.
 *
 * Arabic writes the degree sign with its own letter (°م), and Intl gives the
 * decimal separator its locale's form. Neither survives being typed into a
 * template literal, which is what this replaced.
 */
const degrees = (value, digits) => `${n(value, digits)} ${t('units.celsius')}`;

/**
 * A number with its unit, for the bolding pass.
 *
 * Matching a literal "°C" stopped working the moment the unit became a
 * translation; this matches a run of digits followed by any non-space unit,
 * which holds for °C and °م alike.
 */
const NUMBER_WITH_UNIT = /(\d[\d.,\u0660-\u0669]*\s*°\S*)/g;

const state = {
  celsius: 32,
  humidity: 60,
  factors: new Set(),
  low: 18,
  high: 34,
  building: 'medium',
  // Null until the user asks for real weather. Everything below has to work
  // without it, so this is an addition and never a dependency.
  forecast: null,
  raw: null,
  place: null,
};

const COOLING = { requiredGain, NEVER_OPEN_ABOVE, BUILDINGS_BY_ID };

// --------------------------------------------------------------- chrome ----

function buildPresets() {
  $('presets').innerHTML = PRESETS.map(
    (preset) =>
      `<button type="button" class="preset" data-preset="${escape(preset.id)}" ` +
      `aria-pressed="false" title="${escape(t(`presets.${preset.id}Note`))}">` +
      `${escape(t(`presets.${preset.id}`))}</button>`
  ).join('');
}

function buildFactors() {
  $('factors').innerHTML = GROUPS.map((group) => {
    const rows = FACTORS.filter((factor) => factor.group === group)
      .map(
        (factor) =>
          `<label class="factor">` +
          `<input type="checkbox" data-factor="${escape(factor.id)}">` +
          `<span class="factor-label">${escape(t(`factors.${factor.id}`))}</span>` +
          `<span class="factor-shift">−${n(factor.shift, 1)}°</span>` +
          `<span class="factor-why">${escape(t(`factors.${factor.id}Why`))}</span>` +
          `</label>`
      )
      .join('');
    const heading = t(`who.group${group[0].toUpperCase()}${group.slice(1)}`);
    return `<div class="factor-group"><h3>${escape(heading)}</h3>${rows}</div>`;
  }).join('');
}

function buildBuildings() {
  $('buildings').innerHTML = BUILDINGS.map(
    (building) =>
      `<label>` +
      `<input type="radio" name="building" value="${escape(building.id)}"` +
      `${building.id === state.building ? ' checked' : ''}>` +
      `<span>${escape(t(`buildings.${building.id}`))}</span>` +
      `<span class="building-note">${escape(t(`buildings.${building.id}Note`))}</span>` +
      `</label>`
  ).join('');
}

function buildMeasures() {
  const ranked = rankedMeasures();
  const top = Math.max(...MEASURES.map((measure) => measure.effect));

  $('measures').innerHTML = ranked
    .map(
      (measure) =>
        `<div class="measure">` +
        `<div class="measure-weight">` +
        `<div class="weight-bar"><div class="weight-fill" style="width:${(100 * measure.effect) / top}%"></div></div>` +
        `<span class="weight-value">${escape(t('measures.worth', { value: measure.effect }))}</span>` +
        `</div>` +
        `<div><p class="measure-title">${escape(t(`measures.${measure.id}`))}</p>` +
        `<p class="measure-detail">${escape(t(`measures.${measure.id}Detail`))}</p></div>` +
        `</div>`
    )
    .join('');
}

function chartLegend() {
  return [
    { key: 'measured', text: t('chart.legendMeasured', { value: WET_BULB_LIMITS.measuredYoungHealthy }) },
    { key: 'theoretical', text: t('chart.legendTheoretical', { value: WET_BULB_LIMITS.theoretical }) },
    { key: 'personal', text: t('chart.legendYours') },
    { key: 'fan', text: t('chart.legendNoFan') },
    { key: 'iso', text: t('chart.legendIsopleth') },
  ];
}

function buildLegend() {
  $('chart-legend').innerHTML = chartLegend()
    .map(
      (entry) =>
        `<span class="legend-key"><span class="legend-swatch ${entry.key}"></span>${escape(entry.text)}</span>`
    )
    .join('');

  $('day-legend').innerHTML =
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--warm);border-top-style:dashed"></span>${escape(t('day.legendOutdoors'))}</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--cool);border-top-style:dashed"></span>${escape(t('day.legendIndoors'))}</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--cool) 30%, transparent)"></span>${escape(t('day.legendWindow'))}</span>`;
}

// -------------------------------------------------------------- readout ----

function row(label, value, source, primary = false) {
  return (
    `<tr${primary ? ' class="primary"' : ''}>` +
    `<th>${escape(label)}</th>` +
    `<td class="value">${escape(value)}</td>` +
    `<td class="source">${escape(source)}</td>` +
    `</tr>`
  );
}

function renderReadout() {
  const factorIds = [...state.factors];
  const result = assess(state.celsius, state.humidity, factorIds);
  const fan = fanVerdict(state.celsius, state.humidity);
  const accuracy = wetBulbAccuracy(state.celsius, state.humidity);

  const marginText =
    result.margin >= 0
      ? t('readout.marginLeft', { value: n(result.margin, 1) })
      : t('readout.marginPast', { value: n(Math.abs(result.margin), 1) });

  const fanText = t(`readout.fan${fan.verdict[0].toUpperCase()}${fan.verdict.slice(1)}`);

  const table =
    `<table class="readout-table">` +
    row(t('readout.wetBulb'), degrees(result.wetBulb, 1), t('readout.sourceStull'), true) +
    row(
      t('readout.threshold'),
      degrees(result.threshold, 1),
      result.shift > 0 ? t('readout.sourceShifted', { shift: n(result.shift, 1) }) : t('readout.sourceReference')
    ) +
    row(t('readout.margin'), marginText, t('readout.sourceMargin')) +
    row(t('readout.fan'), fanText, t('readout.sourceBalance')) +
    row(t('readout.heatIndex'), degrees(heatIndex(state.celsius, state.humidity), 0), t('readout.sourceNWS')) +
    row(t('readout.dewPoint'), degrees(dewPoint(state.celsius, state.humidity), 1), t('readout.sourceMagnus')) +
    `</table>`;

  // The bar reads from a full margin of 12 °C down to zero, so it shrinks as
  // conditions worsen rather than growing — the direction matches the danger.
  const fill = Math.max(0, Math.min(100, (result.margin / 12) * 100));

  $('readout').className = `readout band-${result.band.id}`;
  $('readout').innerHTML =
    `<div class="readout-verdict">` +
    `<span class="readout-band">${escape(t(`bands.${result.band.id}`))}</span>` +
    `<p class="readout-headline">${escape(t(`bands.${result.band.id}Headline`))}</p>` +
    `</div>` +
    table +
    `<div class="margin-bar"><div class="margin-fill" style="width:${fill}%"></div></div>` +
    `<p class="margin-caption">` +
    `${escape(t(`readout.accuracy${accuracy.level[0].toUpperCase()}${accuracy.level.slice(1)}`))}</p>`;

  return result;
}

function renderActions() {
  const list = actions(state.celsius, state.humidity, [...state.factors]);
  $('actions').innerHTML = list
    .map(
      (entry) =>
        `<li class="tone-${escape(entry.tone)}">` +
        `<div><p class="action-title">${escape(t(`actions.${entry.id}Title`))}</p>` +
        `<p class="action-detail">${escape(actionDetail(entry))}</p></div>` +
        `</li>`
    )
    .join('');
}

/**
 * The fan entry is the one action whose detail quotes a reason, and the reason
 * is a verdict id rather than a sentence -- so it is looked up here and passed
 * in as a value. Every other action's detail needs nothing.
 */
function actionDetail(entry) {
  if (!entry.values?.reason) return t(`actions.${entry.id}Detail`);
  const verdict = entry.values.reason;
  const reason = t(`actions.fanReason${verdict[0].toUpperCase()}${verdict.slice(1)}`);
  return t(`actions.${entry.id}Detail`, { reason });
}

function renderShiftSummary() {
  const factorIds = [...state.factors];
  const result = assess(state.celsius, state.humidity, factorIds);

  if (factorIds.length === 0) {
    $('shift-summary').innerHTML =
      escape(t('who.noneSelectedBefore')) +
      ` <strong>${escape(t('who.noneSelectedTerm'))}</strong>` +
      escape(t('who.noneSelectedAfter'));
    return;
  }

  // The two numbers are bolded after escaping, so a translation cannot inject
  // markup and cannot lose the emphasis either: the placeholders carry it.
  $('shift-summary').innerHTML = escape(
    t('who.selected', {
      count: factorIds.length,
      shift: n(result.shift, 1),
      threshold: n(result.threshold, 1),
    })
  ).replace(NUMBER_WITH_UNIT, '<strong>$1</strong>');
}

function renderDay(threshold) {
  const hour = new Date().getHours();

  // Measured hours when we have them, the reconstructed curve when we do not,
  // and the caption says which — that boundary is this app's main promise.
  if (state.forecast) {
    const { todayHours, ventilation, nights } = state.forecast;
    $('day-chart').innerHTML =
      dayView.renderDay(todayHours, { threshold, ventilation, nowHour: hour }) +
      dayView.renderNights(nights);

    $('day-sub').innerHTML = escape(t('day.subMeasured'));
    $('window-summary').innerHTML = windowSentence(ventilation);
    $('day-legend').innerHTML = measuredLegend();
    return;
  }

  $('day-sub').innerHTML = escape(t('day.subModelled'));
  const result = dayChart.render(state.low, state.high, state.building, hour);
  $('day-chart').innerHTML = result.svg;
  $('window-summary').innerHTML = windowSentence(result.window);
}

const hhmm = (hour) => `${String(hour % 24).padStart(2, '0')}:00`;

/**
 * The ventilation sentence, built from the four numbers the model returns.
 *
 * Composing it here rather than in `forecast.js` is what lets it exist in six
 * languages: the module that decides *when* to open a window has no opinion
 * about what language to say it in.
 */
function windowSentence(ventilation) {
  if (!ventilation) return escape(t('day.windowInsufficient'));
  if (!ventilation.any) return escape(t('day.windowNone'));

  return escape(
    t('day.windowSummary', {
      opens: hhmm(ventilation.opensAt),
      closes: hhmm(ventilation.closesAt + 1),
      best: hhmm(ventilation.bestHour),
      gain: n(ventilation.bestGain, 1),
    })
  ).replace(/(\d{2}:00)/g, '<strong>$1</strong>');
}

function measuredLegend() {
  return (
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--hot);border-top-width:2px"></span>${escape(t('day.legendWetBulb'))}</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--warm);border-top-style:dotted"></span>${escape(t('day.legendThreshold'))}</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--cool) 30%, transparent)"></span>${escape(t('day.legendWindow'))}</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--critical) 45%, transparent)"></span>${escape(t('day.legendPast'))}</span>`
  );
}

// -------------------------------------------------------------- findings ----

/**
 * What live data adds that two sliders cannot.
 *
 * Each block states its own basis. A finding whose provenance is invisible is
 * indistinguishable from one the app invented, and this app's whole argument
 * is that you can check it.
 */
function renderFindings() {
  const container = $('findings');

  if (!state.forecast) {
    container.innerHTML = '';
    return;
  }

  const { peak, nights, acclimatisation: acc } = state.forecast;
  const blocks = [];

  // --- 1. the hour that is actually worst ---------------------------------
  if (peak) {
    blocks.push(
      finding(
        peak.coincide
          ? t('findings.peakSameTitle')
          : t('findings.peakOffsetTitle', {
              hours: Math.abs(peak.offsetHours),
              direction: t(peak.offsetHours < 0 ? 'findings.peakEarlier' : 'findings.peakLater'),
            }),
        peak.coincide
          ? t('findings.peakSameDetail', { hour: hhmm(peak.worst.hour) })
          : t('findings.peakOffsetDetail', {
              hottestHour: hhmm(peak.hottest.hour),
              hottestTemp: n(peak.hottest.celsius, 1),
              worstHour: hhmm(peak.worst.hour),
              worstTemp: n(peak.worst.celsius, 1),
              difference: n(peak.hottest.celsius - peak.worst.celsius, 1),
              worstHumidity: n(peak.worst.humidity, 0),
              worstWet: n(peak.worst.wetBulb, 1),
              hottestWet: n(peak.hottest.wetBulb, 1),
            }),
        peak.coincide ? 'flat' : 'strong',
        t('findings.sourceHourly')
      )
    );
  }

  // --- 2. nights that give nothing back ------------------------------------
  if (nights.current > 0 || nights.ahead > 0) {
    const total = nights.current + nights.ahead;
    blocks.push(
      finding(
        t('findings.nightsTitle', { current: nights.current }) +
          (nights.ahead > 0 ? t('findings.nightsMore', { ahead: nights.ahead }) : ''),
        t('findings.nightsDetail', {
          threshold: n(nights.threshold, 0),
          // The run length is itself a counted noun ("3 nights" / "one night"),
          // so it is translated before it is substituted rather than dropped in
          // as a bare number the sentence then has to agree with.
          total: t('findings.nightsRun', { total }),
        }),
        total >= 3 ? 'strong' : 'flat',
        t('findings.sourceDaily')
      )
    );
  } else if (nights.nights.length > 0) {
    blocks.push(
      finding(
        t('findings.nightsCoolTitle'),
        t('findings.nightsCoolDetail', { threshold: n(nights.threshold, 0) }),
        'good',
        t('findings.sourceDaily')
      )
    );
  }

  // --- 3. acclimatisation, answered ----------------------------------------
  if (acc.known) {
    blocks.push(
      finding(
        acc.unacclimatised
          ? t('findings.unacclimatisedTitle', { difference: n(acc.difference, 1) })
          : t('findings.acclimatisedTitle'),
        acc.unacclimatised
          ? t('findings.unacclimatisedDetail', {
              today: n(acc.todayMax, 1),
              days: acc.days,
              recent: n(acc.warmestRecent, 1),
            })
          : t('findings.acclimatisedDetail', {
              today: n(acc.todayMax, 1),
              recent: n(acc.warmestRecent, 1),
            }),
        acc.unacclimatised ? 'strong' : 'good',
        t('findings.sourcePast')
      )
    );
  }

  container.innerHTML = blocks.join('');
}

function finding(title, detail, tone, source) {
  return (
    `<article class="finding finding-${escape(tone)}">` +
    `<p class="finding-source">${escape(source)}</p>` +
    `<h3 class="finding-title">${escape(title)}</h3>` +
    `<p class="finding-detail">${escape(detail)}</p>` +
    `</article>`
  );
}

// -------------------------------------------------------------- location ----

function setStatus(html, kind = 'info') {
  $('where-status').className = `where-status where-${kind}`;
  $('where-status').innerHTML = html;
}

async function loadWeather(latitude, longitude, label) {
  setStatus(
    `<span class="spin">${escape(t('where.fetching', { place: label }))}</span>`,
    'busy'
  );

  try {
    const data = await fetchForecast(latitude, longitude);
    state.forecast = analyse(data, state.building, COOLING);
    // Kept because ventilation depends on the building, which can change
    // after the fetch — and analyse() needs the raw response, not its output.
    state.raw = data;
    state.place = { label, latitude, longitude, timezone: data.timezone };

    const now = state.forecast.current;
    if (now) {
      // Move the sliders to the real reading, so the chart above shows the
      // actual air rather than a leftover guess.
      setConditions(now.celsius, now.humidity);
    }

    // Acclimatisation is now known rather than asked, so the tick box sets
    // itself — and unsets itself, which matters more.
    const acc = state.forecast.acclimatisation;
    if (acc.known) {
      if (acc.unacclimatised) state.factors.add('unacclimatised');
      else state.factors.delete('unacclimatised');
      syncFactorBoxes();
    }

    // Take the globe to the place, so the map and the numbers agree.
    globe?.focus(latitude, longitude);

    const stamp = state.forecast.today;
    setStatus(
      `<strong>${escape(label)}</strong> · ${escape(state.forecast.place.timezone)} · ` +
        `${escape(stamp)}<br>` +
        `<span class="where-detail">${escape(
          t('where.sent', { latitude: n(latitude, 2), longitude: n(longitude, 2) })
        )}</span>`,
      'ok'
    );
    draw();
  } catch (error) {
    setStatus(escape(errorText(error)), 'error');
  }
}

/**
 * A thrown weather error names its kind; the sentence comes from the bundle.
 *
 * An unknown throw falls back to `errors.generic` rather than to the raw
 * exception text, which would be English no matter what language the page is
 * in -- and would also be the wrong register for someone who just wanted the
 * weather.
 */
function errorText(error) {
  if (error instanceof WeatherError) {
    const key = `errors.${ERROR_KEYS[error.kind] ?? 'generic'}`;
    if (t.has?.(key)) return t(key);
  }
  return t('errors.generic');
}

const ERROR_KEYS = {
  offline: 'offline',
  timeout: 'timeout',
  denied: 'denied',
  unsupported: 'unsupported',
  'not-found': 'notFound',
  server: 'server',
  malformed: 'malformed',
};

function syncFactorBoxes() {
  for (const box of $('factors').querySelectorAll?.('[data-factor]') ?? []) {
    box.checked = state.factors.has(box.dataset.factor);
  }
}

// ---------------------------------------------------------------- globe ----

let globe = null;

/**
 * Start the globe, or say plainly why there is no globe.
 *
 * WebGL is missing or blocked often enough — old hardware, locked-down
 * browsers, remote desktops — that an empty rectangle would be a real
 * outcome for real people. It gets a sentence instead.
 */
function startGlobe() {
  const canvas = $('globe');

  try {
    globe = createGlobe(canvas, { latitude: 22, longitude: 58 });
  } catch (error) {
    canvas.replaceWith?.(canvas);
    $('globe-note').textContent = t('globe.noWebGL');
    $('globe-note').className = 'globe-note globe-note-error';
    return;
  }

  renderGlobeText();
}

/**
 * The globe's words, separated from the globe's WebGL so a language change can
 * redraw them without touching the context.
 */
function renderGlobeText() {
  // Mark the bands no cell reaches. Showing a full scale is right — it is
  // what the colours mean — but leaving the reader to assume every band is
  // populated would overstate what the data says.
  const present = new Set(CLIMATOLOGY.map((cell) => colourFor(cell[2]).join(',')));

  $('globe-legend').innerHTML = GLOBE_LEGEND.map((entry) => {
    const used = present.has(entry.colour.join(','));
    return (
      `<div class="globe-key${used ? '' : ' globe-key-empty'}">` +
      `<span class="globe-swatch" style="background:${rgb(entry.colour)}"></span>` +
      `<span class="globe-key-label">${escape(t(`globe.${entry.id}`))}</span>` +
      `<span class="globe-key-note">${escape(
        used
          ? t(`globe.${entry.id}Note`)
          : t('globe.bandEmpty', { note: t(`globe.${entry.id}Note`) })
      )}</span>` +
      `</div>`
    );
  }).join('');

  renderGlobeFacts();

  $('globe-note').textContent = t('globe.note', {
    cells: CLIMATOLOGY_META.cells,
    step: CLIMATOLOGY_META.step,
    percentile: CLIMATOLOGY_META.percentile,
    from: CLIMATOLOGY_META.years[0],
    to: CLIMATOLOGY_META.years.at(-1),
  });
}

const rgb = (colour) =>
  `rgb(${colour.map((channel) => Math.round(channel * 255)).join(',')})`;

/**
 * The three sentences the map is worth, computed from the shipped data rather
 * than written down — so they cannot drift away from what is drawn.
 */
function renderGlobeFacts() {
  const past29 = CLIMATOLOGY.filter((cell) => cell[2] >= 29);
  const worst = CLIMATOLOGY.reduce((a, b) => (b[2] > a[2] ? b : a));

  const hot = CLIMATOLOGY.filter((cell) => cell[2] >= 26);

  const facts = [
    [
      t('globe.factHotCellsTitle', { count: hot.length, total: CLIMATOLOGY.length }),
      t('globe.factHotCellsDetail'),
    ],
    [
      t('globe.factCeilingTitle', { limit: past29.length > 0 ? 31 : 29 }),
      t('globe.factCeilingDetail'),
    ],
    [
      t('globe.factHottestTitle', {
        value: n(worst[2], 1),
        latitude: n(Math.abs(worst[0]), 0),
        ns: t(worst[0] >= 0 ? 'globe.north' : 'globe.south'),
        longitude: n(Math.abs(worst[1]), 0),
        ew: t(worst[1] >= 0 ? 'globe.east' : 'globe.west'),
      }),
      t('globe.factHottestDetail', { step: CLIMATOLOGY_META.step }),
    ],
  ];

  $('globe-facts').innerHTML = facts
    .map(
      ([title, detail]) =>
        `<div class="globe-fact"><p class="globe-fact-title">${escape(title)}</p>` +
        `<p class="globe-fact-detail">${escape(detail)}</p></div>`
    )
    .join('');
}

// -------------------------------------------------------------- language ----

/**
 * Resolve every `data-i18n` hook in the static markup.
 *
 * The markup ships English. This overwrites it, and if a key were missing the
 * translator would put `[key]` on screen rather than quietly leaving the
 * English behind -- a gap you can see is a gap that gets fixed.
 */
function applyStaticText(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of node.dataset.i18nAttr.split(',')) {
      const index = pair.indexOf(':');
      if (index < 0) continue;
      node.setAttribute(pair.slice(0, index).trim(), t(pair.slice(index + 1).trim()));
    }
  }
}

function buildLanguageSwitch() {
  const select = $('language');
  if (!select) return;

  // Each option is labelled in its own language, never in the current one. A
  // reader looking for their language is scanning for a word they recognise,
  // and "Arabic" is not that word for someone who reads Arabic.
  select.innerHTML = LANGUAGES.map(
    (language) =>
      `<option value="${escape(language.code)}" lang="${escape(language.code)}">` +
      `${escape(language.native)}</option>`
  ).join('');

  select.value = currentInfo().code;
  select.addEventListener('change', () => setLanguage(select.value));
}

/**
 * Say plainly that a translation is unchecked, in the language being read.
 *
 * English is the source, so it carries no warning. Every other language does,
 * and it stays visible rather than hiding behind a tooltip: the tool gives
 * safety instructions, and a reader is entitled to know how much weight the
 * wording will bear.
 */
function renderLanguageWarning() {
  const banner = $('language-warning');
  if (!banner) return;
  const isSource = currentInfo().code === DEFAULT_LANGUAGE;
  banner.hidden = isSource;

  const link = $('language-original');
  if (link) link.hidden = isSource;
}

/** Everything on the page that carries words, redrawn in the new language. */
function applyLanguage() {
  applyStaticText();
  renderLanguageWarning();
  buildPresets();
  buildFactors();
  buildBuildings();
  buildMeasures();
  buildLegend();
  syncFactorBoxes();
  draw();
}

// ---------------------------------------------------------------- draw ----

function draw() {
  const result = renderReadout();
  $('chart').innerHTML = chart.render({
    celsius: state.celsius,
    humidity: state.humidity,
    threshold: result.threshold,
  });
  renderActions();
  renderShiftSummary();
  renderFindings();
  renderDay(result.threshold);
  attachDrag();
}

// ---------------------------------------------------------- interaction ----

function setConditions(celsius, humidity) {
  state.celsius = chart.clampTemp(Math.round(celsius * 2) / 2);
  state.humidity = chart.clampHumidity(Math.round(humidity));

  $('temp').value = String(state.celsius);
  $('humidity').value = String(state.humidity);
  $('temp-out').textContent = degrees(state.celsius, 1);
  $('humidity-out').textContent = `${n(state.humidity, 0)} ${t('units.percent')}`;

  for (const button of document.querySelectorAll('[data-preset]')) {
    button.setAttribute('aria-pressed', 'false');
  }
  draw();
}

/**
 * Dragging the point is the primary input, because the insight this chart
 * carries is positional: you learn more by moving through the space and
 * watching the verdict change than by typing two numbers into it.
 */
function attachDrag() {
  const svg = $('chart').querySelector('svg');
  if (!svg) return;

  const move = (event) => {
    const rect = svg.getBoundingClientRect();
    const box = svg.viewBox.baseVal;
    const x = ((event.clientX - rect.left) / rect.width) * box.width;
    const y = ((event.clientY - rect.top) / rect.height) * box.height;
    setConditions(chart.fromX(x), chart.fromY(y));
  };

  let dragging = false;

  svg.addEventListener('pointerdown', (event) => {
    dragging = true;
    svg.setPointerCapture(event.pointerId);
    move(event);
    event.preventDefault();
  });
  svg.addEventListener('pointermove', (event) => {
    if (dragging) move(event);
  });
  svg.addEventListener('pointerup', (event) => {
    dragging = false;
    try {
      svg.releasePointerCapture(event.pointerId);
    } catch {
      /* the pointer was already gone; nothing to release */
    }
  });
  svg.addEventListener('pointercancel', () => {
    dragging = false;
  });
}

// ----------------------------------------------------------------- wire ----

// The language has to be settled before anything renders: every builder below
// reads through `t()`, and a builder that ran first would have to be run again.
initLanguage();
buildLanguageSwitch();
applyStaticText();
renderLanguageWarning();

buildPresets();
buildFactors();
buildBuildings();
buildMeasures();
buildLegend();

onLanguageChange(() => {
  applyLanguage();
  // The globe's legend and facts are built once at start-up, so they need
  // their own nudge -- everything else goes through applyLanguage().
  if (globe) renderGlobeText();
});

$('temp').addEventListener('input', (event) =>
  setConditions(Number(event.target.value), state.humidity)
);
$('humidity').addEventListener('input', (event) =>
  setConditions(state.celsius, Number(event.target.value))
);

$('presets').addEventListener('click', (event) => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  const preset = PRESETS.find((entry) => entry.id === button.dataset.preset);
  if (!preset) return;
  setConditions(preset.celsius, preset.humidity);
  button.setAttribute('aria-pressed', 'true');
});

$('factors').addEventListener('change', (event) => {
  const id = event.target.dataset?.factor;
  if (!id) return;
  if (event.target.checked) state.factors.add(id);
  else state.factors.delete(id);
  draw();
});

$('low').addEventListener('input', (event) => {
  state.low = Number(event.target.value);
  if (state.low > state.high - 2) {
    state.high = state.low + 2;
    $('high').value = String(state.high);
    $('high-out').textContent = degrees(state.high, 0);
  }
  $('low-out').textContent = degrees(state.low, 0);
  renderDay();
});

$('high').addEventListener('input', (event) => {
  state.high = Number(event.target.value);
  if (state.high < state.low + 2) {
    state.low = state.high - 2;
    $('low').value = String(state.low);
    $('low-out').textContent = degrees(state.low, 0);
  }
  $('high-out').textContent = degrees(state.high, 0);
  renderDay();
});

$('buildings').addEventListener('change', (event) => {
  if (event.target.name !== 'building') return;
  state.building = event.target.value;
  if (state.raw) {
    state.forecast = analyse(state.raw, state.building, COOLING);
  }
  draw();
});

$('place-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = $('place').value.trim();
  if (!query) return;

  setStatus(`<span class="spin">${escape(t('where.lookingUp'))}</span>`, 'busy');
  try {
    const [best] = await searchPlace(query);
    await loadWeather(best.latitude, best.longitude, best.label);
  } catch (error) {
    setStatus(escape(errorText(error)), 'error');
  }
});

$('here').addEventListener('click', async () => {
  setStatus(`<span class="spin">${escape(t('where.askingLocation'))}</span>`, 'busy');
  try {
    const position = await currentPosition();
    await loadWeather(position.latitude, position.longitude, t('where.useLocation'));
  } catch (error) {
    setStatus(escape(errorText(error)), 'error');
  }
});

startGlobe();
setConditions(state.celsius, state.humidity);
