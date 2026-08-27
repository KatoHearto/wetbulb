import * as chart from './src/chart.js';
import * as dayChart from './src/daychart.js';
import * as dayView from './src/dayview.js';
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
      `aria-pressed="false" title="${escape(preset.note)}">${escape(preset.label)}</button>`
  ).join('');
}

function buildFactors() {
  $('factors').innerHTML = GROUPS.map((group) => {
    const rows = FACTORS.filter((factor) => factor.group === group.id)
      .map(
        (factor) =>
          `<label class="factor">` +
          `<input type="checkbox" data-factor="${escape(factor.id)}">` +
          `<span class="factor-label">${escape(factor.label)}</span>` +
          `<span class="factor-shift">−${factor.shift.toFixed(1)}°</span>` +
          `<span class="factor-why">${escape(factor.why)}</span>` +
          `</label>`
      )
      .join('');
    return `<div class="factor-group"><h3>${escape(group.label)}</h3>${rows}</div>`;
  }).join('');
}

function buildBuildings() {
  $('buildings').innerHTML = BUILDINGS.map(
    (building) =>
      `<label>` +
      `<input type="radio" name="building" value="${escape(building.id)}"` +
      `${building.id === state.building ? ' checked' : ''}>` +
      `<span>${escape(building.label)}</span>` +
      `<span class="building-note">${escape(building.note)}</span>` +
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
        `<span class="weight-value">${measure.effect}× worth</span>` +
        `</div>` +
        `<div><p class="measure-title">${escape(measure.label)}</p>` +
        `<p class="measure-detail">${escape(measure.detail)}</p></div>` +
        `</div>`
    )
    .join('');
}

const LEGEND = [
  { key: 'measured', text: `${WET_BULB_LIMITS.measuredYoungHealthy}° measured` },
  { key: 'theoretical', text: `${WET_BULB_LIMITS.theoretical}° theoretical` },
  { key: 'personal', text: 'yours' },
  { key: 'fan', text: 'no fan' },
  { key: 'iso', text: 'wet bulb' },
];

function buildLegend() {
  $('chart-legend').innerHTML = LEGEND.map(
    (entry) =>
      `<span class="legend-key"><span class="legend-swatch ${entry.key}"></span>${escape(entry.text)}</span>`
  ).join('');

  $('day-legend').innerHTML =
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--warm);border-top-style:dashed"></span>outdoors (modelled)</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-color:var(--cool);border-top-style:dashed"></span>indoors (modelled)</span>` +
    `<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--cool) 30%, transparent)"></span>worth opening up</span>`;
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
      ? `${result.margin.toFixed(1)} °C left`
      : `${Math.abs(result.margin).toFixed(1)} °C past`;

  const fanText = { helps: 'helps', marginal: 'barely', harmful: 'makes it worse' }[fan.verdict];

  const table =
    `<table class="readout-table">` +
    row('Wet-bulb temperature', `${result.wetBulb.toFixed(1)} °C`, 'Stull 2011', true) +
    row('Your threshold', `${result.threshold.toFixed(1)} °C`, result.shift > 0 ? `−${result.shift.toFixed(1)} shifted` : 'reference') +
    row('Margin', marginText, 'threshold − wet bulb') +
    row('A fan here', fanText, 'heat balance') +
    row('Heat index', `${heatIndex(state.celsius, state.humidity).toFixed(0)} °C`, 'NWS') +
    row('Dew point', `${dewPoint(state.celsius, state.humidity).toFixed(1)} °C`, 'Magnus') +
    `</table>`;

  // The bar reads from a full margin of 12 °C down to zero, so it shrinks as
  // conditions worsen rather than growing — the direction matches the danger.
  const fill = Math.max(0, Math.min(100, (result.margin / 12) * 100));

  $('readout').className = `readout band-${result.band.id}`;
  $('readout').innerHTML =
    `<div class="readout-verdict">` +
    `<span class="readout-band">${escape(result.band.label)}</span>` +
    `<p class="readout-headline">${escape(result.band.headline)}</p>` +
    `</div>` +
    table +
    `<div class="margin-bar"><div class="margin-fill" style="width:${fill}%"></div></div>` +
    `<p class="margin-caption">${escape(accuracy.note)}</p>`;

  return result;
}

function renderActions() {
  const list = actions(state.celsius, state.humidity, [...state.factors]);
  $('actions').innerHTML = list
    .map(
      (entry) =>
        `<li class="tone-${escape(entry.tone)}">` +
        `<div><p class="action-title">${escape(entry.title)}</p>` +
        `<p class="action-detail">${escape(entry.detail)}</p></div>` +
        `</li>`
    )
    .join('');
}

function renderShiftSummary() {
  const factorIds = [...state.factors];
  const result = assess(state.celsius, state.humidity, factorIds);

  if (factorIds.length === 0) {
    $('shift-summary').innerHTML =
      'Nothing selected — the numbers above describe a <strong>young, healthy, ' +
      'acclimatised adult sitting still in the shade</strong>. That is who the ' +
      'published limits were measured on.';
    return;
  }

  $('shift-summary').innerHTML =
    `${factorIds.length} factor${factorIds.length === 1 ? '' : 's'} selected. ` +
    `Threshold moved down by <strong>${result.shift.toFixed(1)} °C</strong> of wet bulb, ` +
    `to <strong>${result.threshold.toFixed(1)} °C</strong>. ` +
    `Each further factor counts for less than the last — three risk factors do not ` +
    `make someone three times as fragile.`;
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

    $('day-sub').innerHTML =
      'Measured hourly values for this place. The <strong>large marker</strong> is ' +
      'the most dangerous hour, the small one the hottest — they are rarely the ' +
      'same hour, and the gap is the reason this tool exists.';

    $('window-summary').innerHTML = ventilation.any
      ? escape(ventilation.summary).replace(/(\d{2}:00)/g, '<strong>$1</strong>')
      : escape(ventilation.summary ?? 'Not enough hourly data to judge ventilation.');
    $('day-legend').innerHTML = measuredLegend();
    return;
  }

  const result = dayChart.render(state.low, state.high, state.building, hour);
  $('day-chart').innerHTML = result.svg;
  $('window-summary').innerHTML = result.window.any
    ? escape(result.window.summary).replace(/(\d{2}:00)/g, '<strong>$1</strong>')
    : escape(result.window.summary);
}

function measuredLegend() {
  return (
    '<span class="legend-key"><span class="legend-swatch" style="border-color:var(--hot);border-top-width:2px"></span>wet bulb (measured)</span>' +
    '<span class="legend-key"><span class="legend-swatch" style="border-color:var(--warm);border-top-style:dotted"></span>your threshold</span>' +
    '<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--cool) 30%, transparent)"></span>worth opening up</span>' +
    '<span class="legend-key"><span class="legend-swatch" style="border-top-width:8px;border-color:color-mix(in srgb, var(--critical) 45%, transparent)"></span>past your threshold</span>'
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
    const gap = Math.abs(peak.offsetHours);
    const direction = peak.offsetHours < 0 ? 'earlier' : 'later';

    blocks.push(
      finding(
        peak.coincide ? 'The peaks line up today' : `The worst hour is ${gap} h ${direction} than the hottest`,
        peak.coincide
          ? `Today the hottest hour and the most dangerous hour both fall at ` +
            `${hhmm(peak.worst.hour)}. That is the exception, not the rule.`
          : `The thermometer peaks at ${hhmm(peak.hottest.hour)} with ` +
            `${peak.hottest.celsius.toFixed(1)} °C. But the air is hardest on a body at ` +
            `${hhmm(peak.worst.hour)}, when it is ${peak.worst.celsius.toFixed(1)} °C — ` +
            `${(peak.hottest.celsius - peak.worst.celsius).toFixed(1)} °C cooler and ` +
            `${peak.worst.humidity} % humid. Wet bulb ${peak.worst.wetBulb.toFixed(1)} ` +
            `against ${peak.hottest.wetBulb.toFixed(1)}.`,
        peak.coincide ? 'flat' : 'strong',
        'hourly forecast'
      )
    );
  }

  // --- 2. nights that give nothing back ------------------------------------
  if (nights.current > 0 || nights.ahead > 0) {
    const total = nights.current + nights.ahead;
    blocks.push(
      finding(
        `${nights.current} night${nights.current === 1 ? '' : 's'} without relief` +
          (nights.ahead > 0 ? `, ${nights.ahead} more coming` : ''),
        `The night is when a body unloads the heat it took on during the day. ` +
          `Above ${nights.threshold} °C it stops doing that. Heat waves rarely kill ` +
          `on the first day — they kill on the third and fourth, and this run is ` +
          `${total} long.`,
        total >= 3 ? 'strong' : 'flat',
        'daily minima'
      )
    );
  } else if (nights.nights.length > 0) {
    blocks.push(
      finding(
        'The nights are still cooling down',
        `Every night in this window drops below ${nights.threshold} °C, so the body ` +
          'gets its chance to recover. That is the single biggest thing separating ' +
          'an uncomfortable week from a dangerous one.',
        'good',
        'daily minima'
      )
    );
  }

  // --- 3. acclimatisation, answered ----------------------------------------
  if (acc.known) {
    blocks.push(
      finding(
        acc.unacclimatised
          ? `This is ${acc.difference.toFixed(1)} °C hotter than anything last week`
          : 'Your body has seen this heat before',
        acc.unacclimatised
          ? `Today reaches ${acc.todayMax.toFixed(1)} °C; the warmest day of the past ` +
            `${acc.days} was ${acc.warmestRecent.toFixed(1)} °C. Acclimatisation takes ` +
            'one to two weeks, which is why the first heat wave of a summer is ' +
            'reliably the deadliest — at temperatures the same people shrug off in August.'
          : `Today reaches ${acc.todayMax.toFixed(1)} °C and last week already got to ` +
            `${acc.warmestRecent.toFixed(1)} °C. Adapted people sweat sooner and lose ` +
            'less salt doing it.',
        acc.unacclimatised ? 'strong' : 'good',
        'past 7 days'
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

const hhmm = (hour) => `${String(hour).padStart(2, '0')}:00`;

// -------------------------------------------------------------- location ----

function setStatus(html, kind = 'info') {
  $('where-status').className = `where-status where-${kind}`;
  $('where-status').innerHTML = html;
}

async function loadWeather(latitude, longitude, label) {
  setStatus(`<span class="spin">Fetching hourly weather for ${escape(label)}…</span>`, 'busy');

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

    const stamp = state.forecast.today;
    setStatus(
      `<strong>${escape(label)}</strong> · ${escape(state.forecast.place.timezone)} · ` +
        `${escape(stamp)}<br>` +
        `<span class="where-detail">Coordinates sent: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}. ` +
        `Nothing else left this browser.</span>`,
      'ok'
    );
    draw();
  } catch (error) {
    const message = error instanceof WeatherError ? error.message : String(error);
    setStatus(escape(message), 'error');
  }
}

function syncFactorBoxes() {
  for (const box of $('factors').querySelectorAll?.('[data-factor]') ?? []) {
    box.checked = state.factors.has(box.dataset.factor);
  }
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
  $('temp-out').textContent = `${state.celsius.toFixed(1)} °C`;
  $('humidity-out').textContent = `${state.humidity} %`;

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

buildPresets();
buildFactors();
buildBuildings();
buildMeasures();
buildLegend();

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
    $('high-out').textContent = `${state.high} °C`;
  }
  $('low-out').textContent = `${state.low} °C`;
  renderDay();
});

$('high').addEventListener('input', (event) => {
  state.high = Number(event.target.value);
  if (state.high < state.low + 2) {
    state.low = state.high - 2;
    $('low').value = String(state.low);
    $('low-out').textContent = `${state.low} °C`;
  }
  $('high-out').textContent = `${state.high} °C`;
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

  setStatus('<span class="spin">Looking up the place…</span>', 'busy');
  try {
    const [best] = await searchPlace(query);
    await loadWeather(best.latitude, best.longitude, best.label);
  } catch (error) {
    setStatus(escape(error instanceof WeatherError ? error.message : String(error)), 'error');
  }
});

$('here').addEventListener('click', async () => {
  setStatus('<span class="spin">Asking the browser where you are…</span>', 'busy');
  try {
    const position = await currentPosition();
    await loadWeather(position.latitude, position.longitude, 'your location');
  } catch (error) {
    setStatus(escape(error instanceof WeatherError ? error.message : String(error)), 'error');
  }
});

setConditions(state.celsius, state.humidity);
