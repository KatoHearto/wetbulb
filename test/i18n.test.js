import assert from 'node:assert/strict';
import test from 'node:test';

import { BUNDLES, LANGUAGES, DEFAULT_LANGUAGE, keysOf } from '../src/i18n/index.js';
import { translator, formatNumber, isPluralForm, placeholdersIn } from '../src/i18n/core.js';

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

  test(`${code}: every value is a non-empty string or a full set of plural forms`, () => {
    const bad = keysOf(BUNDLES[code]).filter((k) => {
      const v = k.split('.').reduce((o, p) => o?.[p], BUNDLES[code]);
      if (isPluralForm(v)) return false;
      return typeof v !== 'string' || v.trim() === '';
    });
    assert.deepEqual(bad, []);
  });

  test(`${code}: every plural key carries exactly the forms this language needs`, () => {
    // This is the whole reason plurals are a mechanism rather than a "(s)".
    // Measured: Arabic needs six categories, and French counts zero as
    // singular. A hand-written "night(s)" is wrong in both at once.
    const needed = new Intl.PluralRules(code).resolvedOptions().pluralCategories;
    const problems = [];

    for (const key of REFERENCE) {
      const get = (b) => key.split('.').reduce((o, p) => o?.[p], b);
      const ref = get(BUNDLES[DEFAULT_LANGUAGE]);
      const mine = get(BUNDLES[code]);

      if (isPluralForm(ref) !== isPluralForm(mine)) {
        problems.push(`${key}: plural in one bundle and not the other`);
        continue;
      }
      if (!isPluralForm(mine)) continue;

      const have = Object.keys(mine).filter((name) => name !== '_count').sort();
      const want = [...needed].sort();
      if (have.join(',') !== want.join(',')) {
        problems.push(`${key}: has [${have}], needs [${want}]`);
      }
      if (mine._count !== ref._count) {
        problems.push(`${key}: counts {${mine._count}}, reference counts {${ref._count}}`);
      }
    }

    assert.deepEqual(problems, [], problems.join(' | '));
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

/**
 * Which numbers fall into each plural category, for one language.
 *
 * Sampled rather than reasoned about: the rules differ per language and are
 * not something to assume. 0-200 covers every category boundary these bundles
 * can reach -- Arabic's "many" starts at 11, its "other" at 100.
 */
function numbersPerCategory(code) {
  const rules = new Intl.PluralRules(code);
  const buckets = new Map();
  for (let value = 0; value <= 200; value += 1) {
    const category = rules.select(value);
    buckets.set(category, (buckets.get(category) ?? 0) + 1);
  }
  return buckets;
}

for (const { code } of LANGUAGES) {
  test(`${code}: a plural form covering more than one number names the number`, () => {
    // The trap this exists for, caught in my own French: I wrote the singular
    // as "Une nuit sans répit" with no placeholder, because in English and
    // German "one" means exactly 1. In French and Hindi "one" also covers 0 --
    // so a count of zero rendered as "Une nuit sans répit", which says the
    // opposite of what happened. The category that covers a single number may
    // spell it out; the category that covers many must not.
    const buckets = numbersPerCategory(code);
    const problems = [];

    for (const key of REFERENCE) {
      const forms = key.split('.').reduce((o, p) => o?.[p], BUNDLES[code]);
      if (!isPluralForm(forms)) continue;

      for (const [category, form] of Object.entries(forms)) {
        if (category === '_count') continue;
        if ((buckets.get(category) ?? 0) <= 1) continue;
        if (form === '') continue;
        if (!form.includes(`{${forms._count}}`)) {
          problems.push(
            `${key}.${category} covers ${buckets.get(category)} numbers but never says which`
          );
        }
      }
    }

    assert.deepEqual(problems, [], problems.join(' | '));
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
