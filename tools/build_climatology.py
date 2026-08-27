"""Compute where wet-bulb temperature is structurally dangerous, once.

Run by hand. The result is committed and shipped with the page, so a visitor
costs zero API calls:

    python tools/build_climatology.py

Why this is not live data. A bulk request counts per coordinate, not per
request — measured: one request carrying 600 coordinates exhausted the whole
600-per-minute allowance, and every following request, even a five-point one,
returned HTTP 429. A live world grid would therefore support about sixteen
page views per day. Doing the work once here leaves the page's live budget
entirely to the single point a visitor actually asks about.

The quantity computed per cell is the **95th percentile of hourly wet-bulb
temperature across the hot season**, over three years. Not the maximum: a
single freak hour is weather, and this map is about where the heat is
structural. Not the mean either, which would wash out precisely the extremes
that matter.

Resumable, because it takes a while and a half-finished run should not have to
start over.
"""

import json
import math
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
CACHE = HERE / ".climatology-cache.json"
OUT = HERE.parent / "src" / "climatology.js"
LAND_SOURCE = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/"
    "geojson/ne_110m_land.geojson"
)

STEP = 6.0            # degrees between grid points
LAT_MIN, LAT_MAX = -56, 72   # the inhabited band
YEARS = [2022, 2023, 2024]
PERCENTILE = 95

# Be a good guest: the free tier allows 600/minute, so stay well under it.
CALLS_PER_MINUTE = 240
PAUSE = 60.0 / CALLS_PER_MINUTE


def wet_bulb(celsius, humidity):
    """Stull (2011). Duplicated from src/psychro.js so this tool stands alone."""
    humidity = max(0.0, min(100.0, humidity))
    if humidity >= 100:
        return celsius
    return (
        celsius * math.atan(0.151977 * math.sqrt(humidity + 8.313659))
        + math.atan(celsius + humidity)
        - math.atan(humidity - 1.676331)
        + 0.00391838 * humidity**1.5 * math.atan(0.023101 * humidity)
        - 4.686035
    )


# --- land mask -------------------------------------------------------------


def load_land_polygons():
    request = urllib.request.Request(LAND_SOURCE, headers={"User-Agent": "wetbulb-build/1.0"})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = json.load(response)

    polygons = []
    for feature in data["features"]:
        geometry = feature["geometry"]
        if geometry["type"] == "Polygon":
            polygons.append(geometry["coordinates"][0])
        elif geometry["type"] == "MultiPolygon":
            for polygon in geometry["coordinates"]:
                polygons.append(polygon[0])
    return polygons


def point_in_ring(longitude, latitude, ring):
    inside = False
    count = len(ring)
    for index in range(count):
        x1, y1 = ring[index]
        x2, y2 = ring[(index + 1) % count]
        if (y1 > latitude) != (y2 > latitude):
            x = x1 + (latitude - y1) * (x2 - x1) / (y2 - y1)
            if x > longitude:
                inside = not inside
    return inside


def on_land(longitude, latitude, polygons):
    return any(point_in_ring(longitude, latitude, ring) for ring in polygons)


# --- the hot season, by hemisphere ----------------------------------------


def hot_months(latitude):
    """Four months bracketing the local hot season.

    The tropics have no real winter, so they get the same window as the
    northern hemisphere; being wrong there costs little, because their
    seasonal swing in wet bulb is small compared with the wet/dry cycle.
    """
    if latitude < -15:
        return [(11, 1), (2, 28)]  # southern summer, Nov to Feb
    return [(5, 1), (8, 31)]       # northern summer, May to Aug


def fetch_hours(latitude, longitude, year):
    (start_month, start_day), (end_month, end_day) = hot_months(latitude)

    if start_month > end_month:  # window wraps the new year
        start = f"{year - 1}-{start_month:02d}-{start_day:02d}"
        end = f"{year}-{end_month:02d}-{end_day:02d}"
    else:
        start = f"{year}-{start_month:02d}-{start_day:02d}"
        end = f"{year}-{end_month:02d}-{end_day:02d}"

    url = (
        f"https://archive-api.open-meteo.com/v1/archive?latitude={latitude}"
        f"&longitude={longitude}&start_date={start}&end_date={end}"
        "&hourly=temperature_2m,relative_humidity_2m"
    )

    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=120) as response:
                data = json.load(response)
            hourly = data.get("hourly", {})
            temps = hourly.get("temperature_2m") or []
            humidities = hourly.get("relative_humidity_2m") or []
            return [
                wet_bulb(t, h)
                for t, h in zip(temps, humidities)
                if t is not None and h is not None
            ]
        except urllib.error.HTTPError as error:
            if error.code == 429:
                time.sleep(20 * (attempt + 1))
                continue
            return None
        except Exception:
            time.sleep(5)
    return None


def percentile(values, which):
    if not values:
        return None
    ordered = sorted(values)
    index = min(len(ordered) - 1, int(len(ordered) * which / 100))
    return ordered[index]


def main():
    print("Land-Maske laden…")
    polygons = load_land_polygons()

    points = []
    latitude = LAT_MIN
    while latitude <= LAT_MAX:
        longitude = -180.0
        while longitude < 180.0:
            if on_land(longitude, latitude, polygons):
                points.append((round(latitude, 2), round(longitude, 2)))
            longitude += STEP
        latitude += STEP

    print(f"{len(points)} Landpunkte bei {STEP}° Raster")
    print(f"{len(points) * len(YEARS)} Anfragen, gedrosselt auf {CALLS_PER_MINUTE}/min")
    print(f"geschaetzte Dauer: {len(points) * len(YEARS) * PAUSE / 60:.0f} Minuten\n")

    cache = {}
    if CACHE.exists():
        cache = json.loads(CACHE.read_text(encoding="utf-8"))
        print(f"{len(cache)} Punkte bereits im Zwischenspeicher\n")

    started = time.time()
    for index, (latitude, longitude) in enumerate(points):
        key = f"{latitude},{longitude}"
        if key in cache:
            continue

        values = []
        for year in YEARS:
            got = fetch_hours(latitude, longitude, year)
            if got:
                values.extend(got)
            time.sleep(PAUSE)

        cache[key] = round(percentile(values, PERCENTILE), 2) if values else None

        done = index + 1
        if done % 20 == 0 or done == len(points):
            elapsed = time.time() - started
            rate = done / elapsed if elapsed else 0
            remaining = (len(points) - done) / rate / 60 if rate else 0
            print(f"  {done}/{len(points)}  noch ~{remaining:.0f} min")
            CACHE.write_text(json.dumps(cache), encoding="utf-8")

    CACHE.write_text(json.dumps(cache), encoding="utf-8")

    cells = [
        [float(key.split(",")[0]), float(key.split(",")[1]), value]
        for key, value in sorted(cache.items())
        if value is not None
    ]

    body = json.dumps(cells, separators=(",", ":"))
    OUT.write_text(
        "/**\n"
        " * Where wet-bulb temperature is structurally dangerous.\n"
        " *\n"
        f" * Each cell: [latitude, longitude, {PERCENTILE}th percentile wet bulb in °C].\n"
        " *\n"
        f" * Computed once from ERA5 reanalysis via Open-Meteo's archive API over\n"
        f" * {YEARS[0]}–{YEARS[-1]}, hot season only (May–Aug north of 15°S,\n"
        " * Nov–Feb south of it), on a "
        f"{STEP}° land grid. Wet bulb by Stull (2011).\n"
        " *\n"
        f" * The {PERCENTILE}th percentile, not the maximum: one freak hour is weather,\n"
        " * and this map is about where the heat is structural. Not the mean\n"
        " * either, which would wash out the extremes that matter.\n"
        " *\n"
        " * Shipped rather than fetched, deliberately. A bulk request counts per\n"
        " * coordinate: one 600-point request exhausts the whole per-minute\n"
        " * allowance, so a live grid would serve about sixteen page views a day.\n"
        " * Computing it once leaves the live budget for the point a visitor asks\n"
        " * about.\n"
        " *\n"
        " * Generated by tools/build_climatology.py — do not edit by hand.\n"
        " */\n\n"
        f"export const CLIMATOLOGY = {body};\n\n"
        f"export const CLIMATOLOGY_META = {json.dumps({'years': YEARS, 'step': STEP, 'percentile': PERCENTILE, 'cells': len(cells)})};\n",
        encoding="utf-8",
    )

    values = [cell[2] for cell in cells]
    print(f"\n{OUT.name}: {len(cells)} Zellen, {len(body) // 1024} KB")
    if values:
        print(f"  Tw {PERCENTILE}. Perzentil: min {min(values):.1f}, max {max(values):.1f}")
        for threshold in (26, 28, 30, 31):
            count = sum(1 for value in values if value >= threshold)
            print(f"  ueber {threshold} °C: {count} Zellen ({100 * count / len(values):.0f} %)")


if __name__ == "__main__":
    main()
