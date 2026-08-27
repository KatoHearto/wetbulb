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

## The globe, and the arithmetic that shaped it

A globe you can turn and zoom, showing where wet-bulb temperature is
structurally high. Drawn in **raw WebGL** — no Three.js, no library. That is
about four hundred lines for a sphere, three matrices, two shaders and an
orbit camera, against roughly 600 KB for the alternative, on a page whose
promise is that it has no dependencies.

### Why the zones are not live

The obvious design is a live grid: fetch the world, colour it by today's wet
bulb. It was measured and rejected, and the measurement is worth repeating
because the documentation does not state it.

**A bulk request counts per coordinate, not per request.** One request
carrying 600 coordinates returned `200`, and the very next request — five
coordinates — returned `429`. A single call had consumed the entire
600-per-minute allowance.

| | calls per visitor | visitors per day |
|---|---|---|
| the page without a globe | 1 | **10,000** |
| a globe of 66 cities | 67 | 149 |
| a globe as a 600-point grid | 601 | **16** |

A live grid would have made the page unusable after sixteen people, on a tool
whose purpose is to be there during a heat wave. Live zones would have cost
98.5 % of everyone who could otherwise have used it.

### What is drawn instead, and why it says more

The question "where is it dangerous" is not really about today. The Ganges
delta, the Punjab, the North China Plain and the Gulf are dangerous as a
property of geography, not as a property of Tuesday. So the globe carries a
**climatology**, computed once and shipped as data:

- 408 land cells on a 6° grid
- the **95th percentile** of hourly wet bulb across the hot season
- three years of ERA5 reanalysis, May–Aug north of 15°S and Nov–Feb south
- built by [`tools/build_climatology.py`](tools/build_climatology.py), which is
  resumable and rate-limited to well under the free allowance

The hottest cells it finds, with no geography told to it:

```
28.2 °C   22°N  90°E     the Ganges delta
28.1 °C   34°N  72°E     the Punjab
27.9 °C   28°N  72°E     Rajasthan
27.8 °C   34°N 120°E     the North China Plain
```

That is the map the literature describes, arrived at from hourly temperature
and humidity alone.

Your own location, when you fetch it, is marked on that map — the one live
point, in the structural context.

### Two things the globe admits

**Nothing on it reaches 29 °C, and that is not reassurance.** A 95th percentile
across a whole season describes the weather a place has most summers, not its
worst hour. Single hours go far higher; 35 °C wet bulb has been recorded on the
Persian Gulf coast. The legend greys out the bands no cell reaches rather than
letting a full-looking scale imply otherwise.

**A 6° cell is about 650 km.** It averages a coastline with a plateau, a city
with a field. The page says so under the globe.

### Found by looking at it

The first version drew each cell as a point sprite and every cell came out with
a **black triangle punched through it**. A 6° patch drawn as two flat triangles
sags 1 − cos(3°) ≈ 0.0014 below the sphere at its centre; the cells were lifted
by 0.0015, leaving thirteen ten-thousandths of clearance, and the faceted sphere
came through. Radii are staggered now — sphere 1.0, zones 1.006, coastline
1.012, marker 1.03.

**Half the globe vanished when you turned it — and my own screenshots missed
it.** The fragment shader decided visibility by comparing the surface normal
against the camera, but the normal had been through the model matrix and the
camera position had not: two different spaces. The visible hemisphere therefore
rotated *with* the planet instead of staying put. At 90° of spin half the cells
were gone; at 180° the two vectors were exactly opposed and every fragment was
discarded.

It survived review because every still I took was of a stationary camera, and a
still cannot show a defect whose whole character is that it depends on where the
camera is. It took someone turning the thing. The test that now guards it walks
the camera through 360° in 5° steps and asserts both that the point under the
camera is always visible and that the visible fraction never jumps — the
signature of the failure was not a gradual fade but a collapse.

The third version had a colour ramp whose two cool bands differed by less than
a nuance. Most of the planet's land sits in those bands, so the dangerous fifth
was hard to find. The ramp holds the cool end back and steps up sharply at
25 °C, where a climate stops being uncomfortable and starts constraining what a
body can do outdoors.

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
node --test        # 162 tests, Node 18+, no dependencies
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

## Six languages, and the warning that comes with them

The tool's own map says where the heat is: the Gangetic plain, the Punjab, the
North China Plain, the Persian Gulf. An English-only heat tool is least useful
exactly where heat is worst, which is a strange thing for a tool about heat to
be. So the page reads in six languages.

| | | keys | strings | words | plural categories |
|---|---|---|---|---|---|
| `en` | English — source | 275 | 282 | 2 949 | 2 |
| `de` | Deutsch | 275 | 282 | 2 853 | 2 |
| `es` | Español | 275 | 289 | 3 282 | 3 |
| `fr` | Français | 275 | 289 | 3 296 | 3 |
| `hi` | हिन्दी | 275 | 282 | 3 352 | 2 |
| `ar` | العربية — right-to-left | 275 | 310 | 2 740 | 6 |

**None of the five translations has been checked by a native speaker**, and
the page says so, in the language being read, above everything else it says.
That matters more here than on most pages: this one contains the sentences
"switch the fan off", "call emergency services" and "get to cooler air now".
A mistranslation of those does harm that a mistranslated marketing page does
not. English governs; every other language carries a link back to it.

Portuguese was left out on purpose rather than added for the count. Six
unchecked translations are already more trust than this can carry.

### Plurals are a mechanism, not a "(s)"

The first draft of these bundles wrote `{current} night(s) without relief`,
and in Arabic `{current} ليلة/ليالٍ`. Nobody writes that. Worse, it cannot be
made right by writing it more carefully, because the rules differ per language
in ways a parenthesis has no way to express. Measured with `Intl.PluralRules`:

| count | en / de | fr / hi | ar |
|---|---|---|---|
| 0 | other | **one** | zero |
| 1 | one | one | one |
| 2 | other | other | **two** |
| 3 | other | other | **few** |
| 11 | other | other | **many** |
| 100 | other | other | other |

Arabic needs six forms and has a real dual: ليلة واحدة, ليلتان, ثلاث ليالٍ.
French and Hindi count zero as singular. So a plural key is an object of
forms with a `_count` naming which placeholder decides:

```js
nightsTitle: {
  _count: 'current',
  zero: 'لا ليلة دون راحة',
  one:  'ليلة واحدة دون راحة',
  two:  'ليلتان دون راحة',
  few:  '{current} ليالٍ دون راحة',
  many: '{current} ليلة دون راحة',
  other:'{current} ليلة دون راحة',
},
```

Seven keys need this. The tests assert that each carries **exactly** the
categories its language declares — not more, not fewer — and that its
`_count` matches the reference's.

**A bug this found in my own work.** I wrote the French singular as
`Une nuit sans répit`, spelling the number as a word, because in English and
German "one" means exactly 1. In French it also covers 0 — so a count of zero
rendered as *"one night without relief"*, which says the opposite of what
happened. There is now a guard for it: sample which numbers fall into each
category, and if a category covers more than one number, its form must contain
the count placeholder. It found seven keys in French and seven in Hindi.

### What the tests hold

- every bundle has exactly the same 275 keys, and matching `{placeholder}` sets
  in every plural form, not just one
- no value longer than 30 characters is still English; the values that *are*
  identical are frozen as a reviewed per-language list
- every `data-i18n` hook in `index.html` names a key that exists
- switching language at runtime redraws everything, flips `dir` for Arabic,
  and is lossless switching back
- **typesetting**, per language: French never lets a plain space stand before
  `:` `;` `!` `?` (U+00A0 before a colon, U+202F before the rest — both
  invisible in the source, which is why they need a test); Spanish opens every
  question with `¿`; Hindi ends sentences with `।` not `.`; Arabic uses `،` `؛`
  `؟`; German has no ASCII transliteration and never switches from *du* to *Sie*

### The same sentence went wrong in four languages

`Do not stop taking anything on your own` has an implied object in English.
None of Spanish, French, Arabic or Hindi carries it for free, and in three of
them the sentence came out meaning **"do not stop of your own accord"** —
advice about persistence, on a line about medication. Fixed in all four by
naming the object: *ningún tratamiento*, *aucun traitement*, *أيّ دواء*.

Two more of the same kind: Spanish `Para el trabajo físico` reads as *"For
physical work"* at least as readily as *"Stop physical work"* — it is a
heading on a safety instruction and it was ambiguous. French `Quoi faire` is
simply not how a French heading asks that question.

### What the screenshots found this round

Three German keys shipped ASCII-transliterated — `Heisseste`, `Gefaehrlichste`,
`Naechte`. They came from a generator script written under a different repo's
ASCII-only rule for pipeline artefacts, applied out of habit to text a reader
sees. The guard for it is a **stem list, not a rule**: the first version
flagged `ae|oe|ue` anywhere and produced 17 false alarms in one run
(`Mauerwerk`, `Querlüftung`, `dauert`, even the placeholder `{value}`). German
is full of legitimate *au-e* and *qu-e*. A green result there means "none of
the usual suspects", not "no transliteration anywhere".

### Five native-speaker reviews, and what only a fresh reader could find

A reader looked at the German and said `who.heading` — "Wer in dieser Luft ist" —
reads like a word-for-word rendering of "Who is in this air". He was right, and
the reason I had not caught it is structural rather than careless: **I wrote
those sentences.** My check ran against the same instinct that produced them.
The measurable things I did find — umlauts, plural categories, punctuation
widths. Word order I could not, because word order was the thing I got wrong.

So each language got a fresh reviewer, briefed as a specialist in that language
and in translation criticism, reading the English source beside the target and
returning findings with finished replacements. **420 changes across five
bundles**, plus a dash pass over German.

**The findings that were not about style:**

| | | |
|---|---|---|
| `ar` | `peakOffsetTitle` had **"بعد" (after) fixed in the sentence**, then filled `{direction}` with "قبل" (before) | every earlier-peak read *"comes one hour after before the hottest hour"* — the time direction inverted |
| `fr` | `actions.emergencyDetail`: "refroidissez la personne" | *refroidir quelqu'un* is French slang for **killing** them. On the resuscitation line |
| `fr` | `masthead.privacyBefore`: "vos coordonnées" | means **name, address, phone number** in everyday French — in the privacy sentence, promising the opposite |
| `fr` | `measures.appliancesDetail`: "veilleuses" | means **children's night lights**, not appliance standby LEDs — the advice became inapplicable |
| `hi` | `meta.title`: "ठंडा होना" of a person | means **calming down**; "ठंडा पड़ना" means dying. In the page title |
| `hi` | `factors.diabetesWhy` | subject and object had swapped: the sentence said *sweating* weakens something |
| `ar` | `factors.aloneWhy`: "ضربة الشمس" (sunstroke) | the page's own text says most deaths happen **indoors, out of the sun**. The reviewer caught the self-contradiction, not just the term |
| `es` | "tiempo real", three times | reads as **real time**, not "real weather" — including the privacy line |
| `de` | `presets.indoorsNote`: "wo die meisten Hitzetoten sterben" | a *Hitzetoter* is already dead. The sentence said where dead people die |

**Two corrections of my own corrections.** Last round I "fixed" `chart.heading`
away from "Où cet air vous place" / "Dónde te coloca este aire", because
*placer/colocar* looked like a calque. All three reviewers put it back, with an
argument I did not have: the heading sits over a **position** diagram
(temperature against humidity, with a point labelled "you"), and "what this air
does to you" promises physiology the chart does not show. My first draft was
right and my fix was the error. And I had changed German "echtes Wetter" to
"echte Messwerte" — but what is fetched is a **forecast**; the file says so
itself two keys away. Five keys claimed a data quality the tool does not have,
including the privacy sentence.

**A reviewer who corrected himself, twice.** The German reviewer's first pass
flagged the imperative forms "Richte", "Öffne", "Verabrede" as inconsistent
shortenings. In his second pass he withdrew it: German stems ending in -d, -t
or consonant+n take the -e **obligatorily**. Had I applied his first finding, he
would have dictated grammatical errors into the file. He also retracted his own
praise for `chart.heading` once the other two reviewers contradicted him —
"I checked the heading against the original and never checked what stands under
it, which is exactly the fault I criticise in translators."

**How the findings were applied.** Not by hand. A checker resolves each dotted
key down through its sections — `heading:` alone occurs eight times per file —
finds the source block, and refuses the whole batch, writing nothing, if any
proposal drops a `{placeholder}`, matches no unique block, or changes nothing.
It refused four times during this round, each time correctly.

The German dash pass ran separately, and only over `U+2014`: the minus sign in
the readout (`U+2212`) and the hyphens in "Höchst- und", "Herz- oder",
"Standby-Lämpchen" are different characters and had to survive. 47 replaced, 2
minus signs and 3 hyphens untouched, the numeric ranges (`22–25°`) already
correct and left alone. Both facts now have tests.

### The switch nobody could read

Reported: the language dropdown is hard to read unless you hover it. The cause
is one declaration. `appearance: none` strips the native control, and
`background: transparent` then leaves the OPTION rows with an inherited
near-white colour and no background of their own — while the popup list is
painted by the operating system. Measured on the shipped stylesheet:

| | | |
|---|---|---|
| dark theme, option on a white OS popup | `#ece7df` on `#ffffff` | **1.23:1** |
| light theme, option on a dark OS popup | `#1a1714` on `#202020` | **1.10:1** |
| the closed control, for comparison | `#ece7df` on `#0e0d0c` | 15.78:1 |

AA wants 4.5:1. Only the cursor highlight made a row legible, which is exactly
how it was reported. It failed in **both** themes for opposite reasons: the
page declares `color-scheme: dark light`, so the popup follows the operating
system rather than the page.

The closed control was fine throughout — which is why every screenshot ever
taken of this page looked correct, and why the fix carries a test rather than
an eyeball check. The rows now get an explicit background *and* colour, both
from tokens; measured back out of a real browser at `#ece7df` on `#151312`
(15.05:1) and `#1a1714` on `#fffdf9` (17.57:1).

It also grew the chevron that `appearance: none` had removed. Without it the
control reads as a button, and a button does not promise a list. Drawn from
borders so it inherits the theme's token — a data-URI arrow would have needed
a hard-coded colour — and the padding that clears it flips under RTL.

### What is deliberately not translated

The charts and the globe do not mirror under RTL. A time axis running 00 to 23
and a temperature axis running cold to hot are not script; flipping them would
put midnight on the right and call it a translation.

The German text says *du*, not *Sie*. The page's own risk table says its
readers are over 65, over 75, pregnant, on medication — a group German health
writing usually addresses formally. It says *du* anyway, because the
instructions are short imperatives ("Geh da raus") and the German formal
imperative turns those into something a public authority would send you in the
post, at exactly the moment the sentence needs to be urgent. That is a
judgement call and a native speaker may overrule it; it is one search-and-
replace away.

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
- **The globe is a climatology, not a forecast.** It shows where heat is a
  standing property of a place. Today's weather is the point you fetch, not the
  colours underneath it.
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
