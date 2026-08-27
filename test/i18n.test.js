import assert from 'node:assert/strict';
import test from 'node:test';

import { BUNDLES, LANGUAGES, DEFAULT_LANGUAGE, keysOf } from '../src/i18n/index.js';
import { translator, formatNumber, placeholdersIn } from '../src/i18n/core.js';

const REFERENCE = keysOf(BUNDLES[DEFAULT_LANGUAGE]);

/**
 * Keys whose value is deliberately identical to English, per language.
 *
 * Measured, then read one by one -- not guessed. See the test that uses it.
 */
const BANDS = ['globe.band1', 'globe.band2', 'globe.band3', 'globe.band4', 'globe.band5', 'globe.band6'];
const SOURCES = ['readout.sourceMagnus', 'readout.sourceNWS', 'readout.sourceStull'];

// `units.percent` is "%" in all six. `units.celsius` is "°C" in five and "°م"
// in Arabic -- the one place a unit is genuinely written differently, and the
// reason these are keys rather than literals in the source at all.
const UNITS = ['units.celsius', 'units.percent'];

const REVIEWED_COINCIDENCES = {
  de: [...UNITS, 'day.axisCelsius', 'factors.diabetes', ...BANDS, 'globe.north', 'globe.south', 'globe.west', 'masthead.privacyAfter', ...SOURCES].sort(),
  es: [...UNITS, 'day.axisCelsius', 'factors.diabetes', ...BANDS, 'globe.east', 'globe.north', 'globe.south', 'masthead.privacyAfter', ...SOURCES].sort(),
  fr: [...UNITS, 'day.axisCelsius', 'factors.stimulant', ...BANDS, 'globe.east', 'globe.north', 'globe.south', 'masthead.privacyAfter', ...SOURCES, 'where.searchPlaceholder'].sort(),
  hi: [...UNITS, 'day.axisCelsius', ...BANDS, ...SOURCES].sort(),
  ar: ['units.percent', ...BANDS, 'masthead.privacyAfter', ...SOURCES].sort(),
};


test('every declared language has a bundle, and every bundle is declared', () => {
  const declared = LANGUAGES.map((l) => l.code).sort();
  const present = Object.keys(BUNDLES).sort();
  assert.deepEqual(present, declared);
});

test('the reference bundle is not trivially small', () => {
  assert.ok(REFERENCE.length > 200, `only ${REFERENCE.length} keys`);
});

for (const { code } of LANGUAGES) {
  test(`${code}: has every key the reference has`, () => {
    const missing = REFERENCE.filter((k) => !keysOf(BUNDLES[code]).includes(k));
    assert.deepEqual(missing, [], `missing: ${missing.join(', ')}`);
  });

  test(`${code}: has no key the reference lacks`, () => {
    const extra = keysOf(BUNDLES[code]).filter((k) => !REFERENCE.includes(k));
    assert.deepEqual(extra, [], `extra: ${extra.join(', ')}`);
  });

  test(`${code}: every value is a non-empty string`, () => {
    const bad = keysOf(BUNDLES[code]).filter((k) => {
      const v = k.split('.').reduce((o, p) => o?.[p], BUNDLES[code]);
      return typeof v !== 'string' || v.trim() === '';
    });
    assert.deepEqual(bad, []);
  });

  test(`${code}: placeholders match the reference exactly`, () => {
    const ref = BUNDLES[DEFAULT_LANGUAGE];
    const mismatches = [];
    for (const key of REFERENCE) {
      const get = (b) => key.split('.').reduce((o, p) => o?.[p], b);
      const want = placeholdersIn(get(ref));
      const got = placeholdersIn(get(BUNDLES[code]));
      if (want.join(',') !== got.join(',')) {
        mismatches.push(`${key}: want [${want}] got [${got}]`);
      }
    }
    assert.deepEqual(mismatches, [], mismatches.join('\n'));
  });

  test(`${code}: no sentence is left in English`, () => {
    // A hand-kept allowlist was the first attempt and it was wrong: it made me
    // list "Diabetes" as an exception because Spanish spells it the same way.
    // The real failure mode is a forgotten PARAGRAPH, not a coinciding word,
    // so the rule is about length. Values of 30 characters or fewer are allowed
    // to match English -- proper nouns, units, single terms, a full stop.
    if (code === DEFAULT_LANGUAGE) return;
    const same = REFERENCE.filter((k) => {
      const get = (b) => k.split('.').reduce((o, p) => o?.[p], b);
      const ref = get(BUNDLES[DEFAULT_LANGUAGE]);
      return ref.length > 30 && get(BUNDLES[code]) === ref;
    });
    assert.deepEqual(same, [], `still English: ${same.join(', ')}`);
  });

  test(`${code}: coincides with English exactly where it was reviewed to`, () => {
    // The length rule above cannot see a SHORT label left in English -- measured:
    // it let "Dew point" through, because 9 characters is also the length of
    // "Diabetes", which legitimately coincides. No length can separate those.
    // So the coinciding set is frozen instead. Every entry below was looked at:
    // numeric band labels, author names, a unit, compass letters, a full stop,
    // and the handful of words that are genuinely spelled the same. Adding an
    // untranslated label changes the set and fails here -- which is the point.
    if (code === DEFAULT_LANGUAGE) return;
    const same = REFERENCE.filter((k) => {
      const get = (b) => k.split('.').reduce((o, p) => o?.[p], b);
      return get(BUNDLES[code]) === get(BUNDLES[DEFAULT_LANGUAGE]);
    });
    assert.deepEqual(same, REVIEWED_COINCIDENCES[code]);
  });
}

test('a missing key is loud, not silent', () => {
  const seen = [];
  const t = translator({ a: { b: 'x' } }, { onMissing: (k) => seen.push(k) });
  assert.equal(t('a.b'), 'x');
  assert.equal(t('a.nope'), '[a.nope]');
  assert.deepEqual(seen, ['a.nope']);
});

test('interpolation keeps an unknown placeholder visible', () => {
  const t = translator({ s: 'a {one} b {two}' });
  assert.equal(t('s', { one: 1 }), 'a 1 b {two}');
});

test('numbers format per locale and carry no unit', () => {
  assert.equal(formatNumber(28.35, 'en', { digits: 1 }), '28.4');
  assert.equal(formatNumber(28.35, 'de', { digits: 1 }), '28,4');
  assert.equal(formatNumber(1234, 'de', { digits: 0 }), '1.234');
});

test('Arabic is the only right-to-left language declared', () => {
  const rtl = LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code);
  assert.deepEqual(rtl, ['ar']);
});
