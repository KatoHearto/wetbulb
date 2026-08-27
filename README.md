# wetbulb

[![CI](https://github.com/KatoHearto/wetbulb/actions/workflows/ci.yml/badge.svg)](https://github.com/KatoHearto/wetbulb/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)

**Heat kills more people than any other kind of weather — and the number in every warning is the wrong one.**

→ **[Open it](https://katohearto.github.io/wetbulb/)** — no install, no account. Works with no network at all; ask it for real weather and it sends nothing but coordinates.

---

## The problem

Air temperature says almost nothing about whether a body can shed heat.

At **45 °C in dry desert air**, a healthy person sweats and survives.
At **35 °C in humid air**, they cannot — there is nowhere for the sweat to go.

The quantity that decides it is the **wet-bulb temperature**, and almost nobody
has heard of it. Warnings, apps and thermometers all report the other number.

Three consequences, each of which kills people every summer:

| The belief | What actually happens |
|---|---|
| "It's only 35 °C, that's survivable" | at 90 % humidity that is past the limit measured on healthy young adults |
| "Switch the fan off above 35 °C" | in **humid** heat the fan is the one thing still cooling you — this advice removes it |
| "Open the windows, get some air in" | an open window in the afternoon is a heat source; it imports heat the walls keep all night |

## What it does

Give it a temperature and a humidity — from your weather app, or by dragging
the point around the chart — and it tells you:

- **Where you are in the state space.** Not a number in a box: a position, with
  the survival limits drawn as lines you can see yourself approaching.
- **Whether a fan helps or hurts, right here.** Computed from a heat balance,
  not from a rule of thumb, and it will tell you to switch it off.
- **Who is in this air.** The published limits describe young, healthy,
  acclimatised people at rest. Eighteen factors — age, medication, exertion,
  being alone — each move the threshold by a stated number of degrees.
- **What to do, in order.** Ranked by what each action is worth *in these
  conditions*, not a flat list of eight equal suggestions.
- **When to open the windows**, modelled across the day for your building.

## Real weather, and what it adds

Point it at a place and it fetches hourly data from
[Open-Meteo](https://open-meteo.com) — no key, no account, no tracking. The
sliders keep working with no network at all; the fetch is an addition, never a
dependency.

Three findings exist only once there are hours and days to look across. Each
was measured before it was built, because a feature that turns out to say
nothing should be dropped rather than shipped.

**1. The most dangerous hour is not the hottest hour.**

Humidity peaks at a different time of day than temperature, so the wet bulb
does too. Measured across seven cities:

| | hottest | most dangerous | offset |
|---|---|---|---|
| Delhi | 16:00 | 10:00 | **−6 h** |
| Tokyo | 12:00 | 03:00 | **−9 h** |
| Miami | 14:00 | 11:00 | −3 h |
| Cologne | 17:00 | 17:00 | 0 |

Six of seven differed, by four hours on average. Somebody who steps out at ten
because "it's not hot yet" walks into the worst hour of the day. The chart
marks both peaks, with different weights, so the gap is visible rather than
asserted — and when they do coincide, as in Cologne, it says that instead.

**2. Nights that never cool down.**

A heat wave rarely does its worst on day one. The damage accumulates over the
third and fourth, once the night has stopped letting a body unload what it took
on. A run of nights above 20 °C is plain in a forecast and invisible in a
thermometer reading. Delhi, measured: eight behind, six ahead.

**3. Acclimatisation stops being a question.**

The tool used to *ask* "is this one of the first hot days of the year?" With the
past week in hand it answers instead — Cologne came in **5.0 °C above the
warmest day of its own previous week**, and the factor set itself. Adaptation
takes one to two weeks, which is why the first heat wave of a summer is
reliably the most dangerous.

### What leaves your browser

A latitude and longitude rounded to two decimals (about 1 km), and a place name
if you type one. Nothing else, and nothing at all until you press a button. The
page says so where you can see it, and the status line repeats the exact
coordinates it sent.

The old claim on this page was "no account, no network". That stopped being true
when this feature existed, so the claim changed rather than the behaviour being
quietly hidden.

## The chart is the argument

The centre of the page is a **psychrometric chart**, because the insight is
positional and no dial can carry it. 45 °C dry and 35 °C humid sit in different
places, and the cooler-looking one is the deadly one — that relationship *is*
the second dimension.

Every line in it is computed from the physics module, never drawn by eye. The
wet-bulb isopleths are found by solving for the humidity at which the wet bulb
equals a given value, so the picture and the numbers cannot drift apart. The
[chart tests](test/chart.test.js) check each drawn point against `wetBulb()`
directly.

## Honesty as form

Several decisions here cost something and were made anyway.

**Two limits, not one.** 35 °C wet bulb is the *theoretical* survival limit
(Sherwood & Huber 2010). Around **31 °C** is where strain has actually been
*measured*, on young healthy subjects in a climate chamber (Vecellio et al.
2022). Quoting only the 35 makes the danger look four degrees further away than
it is, so both are drawn, labelled, and told apart by line style as well as
colour.

**Modelled things are dashed.** The daily temperature curves are reconstructed
from a high and a low. They are estimates, so they are drawn as estimates — a
modelled curve with a solid confident line is a lie told with stroke-width.

**Personalisation that can be inspected.** Every factor shows its shift in
degrees and its reason. They do not simply add up: each further factor counts
for less than the last, because three risk factors do not make somebody three
times as fragile, and a linear sum would drive the threshold below ambient for
anyone who ticks a few boxes — after which the tool cries wolf and gets ignored.

**It says what it is not.** Not a doctor, not a forecast, no idea where you
are. That block is on the page, not in a footnote.

## The physics, and where to check it

| Quantity | Source |
|---|---|
| Wet-bulb temperature | Stull, R. (2011), *J. Appl. Meteor. Climatol.* 50, 2267–2269 |
| Heat index | Rothfusz, L. P. (1990), NWS Southern Region SR/SSD 90-23 |
| Saturation vapour pressure | Alduchov & Eskridge (1996), Magnus form |
| Dry/evaporative partitioning | Gagge two-node, as used in ASHRAE 55 |
| Fan verdict | Jay et al. (2019); Morris et al., dry-heat condition |
| Survival limits | Sherwood & Huber (2010); Vecellio et al. (2022) |

The test suite checks against **published values**, not against the
implementation's own output — a test that records what the code said proves
only that the code has not changed.

```bash
node --test        # 140 tests, Node 18+, no dependencies
```

Among them, the anchors that would catch a wrong scale:

- at 100 % humidity the wet bulb must **equal** the air temperature, exactly
- the wet bulb is never above the air temperature, over the whole domain
- Stull's own worked values at 20/30/40 °C
- the NWS heat-index table at two points
- the two measured fan experiments, which disagree with each other and with
  the popular rule

## What the fan model found

The rule everyone repeats is "switch fans off above 35 °C". The measured
evidence contradicts it:

- **40 °C / 50 %** — a fan *lowers* core temperature and heart rate (Jay 2019)
- **47 °C / 10 %** — a fan *raises* core temperature (Morris, dry heat)

Both are above 35 °C. The difference is humidity, and the heat balance explains
why: in humid heat the fan still buys a great deal of evaporation, while in dry
heat evaporation is already at the sweat-rate ceiling, so extra air flow only
delivers heat.

The model reproduces both, and the region where a fan turns harmful is drawn on
the chart. It closes in from *both* sides — too humid to evaporate into, too dry
for more air flow to add anything — which no sentence conveys as fast as the
picture does.

## Two bugs found by looking

**The screenshot lied before the page did.** Headless Edge refuses to lay out
below about 496 CSS pixels: asking for a 440-pixel window renders at 496 and
crops, which looks exactly like a horizontal overflow bug. Measured with a probe
page reporting its own `innerWidth` — and the first "fix" for it, an
`overflow-x: hidden` on the body, was removed again. Hiding the symptom is worse
than the symptom.

**The ventilation window opened at 17:00 into 34 °C air**, because a roof room
at 35 °C technically beats it by a degree. One degree moves almost no heat,
while the air coming in is near body temperature and carries its own humidity.
The requirement now rises with the outdoor temperature, and above 32 °C nothing
qualifies. Found in the rendered chart, not by reasoning; pinned by a test.

**The room jumped five degrees overnight.** The indoor curve from measured
hours indexed the lag by hour-of-day, so midnight with a four-hour lag reached
back to *the same day's* eight in the evening — the afternoon it was supposed to
be recovering from. Live Cologne data showed 28.2 °C at midnight and 23.6 °C at
04:00, a drop no building performs. Indexing the continuous series fixed it, and
[a regression test](test/forecast.test.js) now fails if the room moves more than
2 °C in an hour.

## Honest limits

- **Not medical advice.** The thresholds are calibrated to published
  physiology, not to you. Confusion, agitation or someone who has stopped
  sweating in heat is an emergency — call, do not calculate.
- **Not a warning service.** It has no idea what the weather is or where you
  are. Official heat warnings know things this does not, including how many
  days the heat has already lasted, which matters a great deal.
- **Shade and rest are assumed**, as they are in every published limit. Direct
  sun adds several degrees of effective load; physical work can multiply heat
  production tenfold.
- **The daily curve is a model**, reconstructed from two numbers. It is drawn
  dashed for that reason.
- **The forecast is a forecast.** Open-Meteo is a model, not a sensor on your
  street. The indoor curve is a model on top of that, and the page marks which
  is which.
- **Stull's fit has an envelope**: roughly −20 to 50 °C and 5 to 99 % humidity.
  Outside it the tool says so rather than quietly extrapolating.

## Running it

```bash
git clone https://github.com/KatoHearto/wetbulb
cd wetbulb
python -m http.server 8000     # any static server; ES modules need one
node --test                    # the suite
```

Plain HTML, CSS and ES modules. No build step, no dependencies, no framework.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, and if a number in it is wrong,
open an issue with the source that says so.
