/**
 * Language selection, and being honest about what a translation is worth.
 *
 * The rules this follows, and why each one is here:
 *
 *   · **No silent fallback.** A missing key returns a visible marker, never
 *     the English quietly. A page that is 80 % translated and looks 100 %
 *     translated earns trust it has not got — and the sentences here are
 *     things like "switch the fan off" and "call emergency services".
 *
 *   · **The reader is told.** None of these translations has been checked by
 *     a native speaker. That is stated on the page, in the reader's own
 *     language, not in a footnote — and the English is named as the version
 *     that governs if they diverge.
 *
 *   · **Numbers are not text.** Decimal separators follow the locale, but
 *     °C stays °C and 31 stays 31. A unit that changed with the language
 *     would be a different claim.
 */

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'wetbulb.language.v1';

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code);
const BY_CODE = new Map(LANGUAGES.map((language) => [language.code, language]));

export function languageInfo(code) {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LANGUAGE);
}

/**
 * Pick a language from what the browser says, without over-reaching.
 *
 * `navigator.languages` is a preference list, so it is walked in order and
 * the first supported match wins. Regional tags are reduced to their base —
 * somebody with `de-AT` gets German rather than English, which is obviously
 * right and is exactly what a strict match would get wrong.
 */
export function detectLanguage(navigatorLike = globalThis.navigator) {
  const preferences = navigatorLike?.languages?.length
    ? navigatorLike.languages
    : [navigatorLike?.language].filter(Boolean);

  for (const preference of preferences) {
    const base = String(preference).toLowerCase().split('-')[0];
    if (BY_CODE.has(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

export function storedLanguage(storage = globalThis.localStorage) {
  try {
    const stored = storage?.getItem(STORAGE_KEY);
    return stored && BY_CODE.has(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function rememberLanguage(code, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, code);
    return true;
  } catch {
    // A private window, or storage switched off. The page still works; the
    // choice simply does not survive a reload, and that is not worth an error.
    return false;
  }
}

/**
 * A `?lang=` in the address, if it names a language this build has.
 *
 * This is what makes a link shareable -- "read this page in Hindi" has to be
 * expressible as a URL, or it is not something anyone can pass on.
 */
export function queryLanguage(search = globalThis.location?.search) {
  if (!search) return null;
  const match = /[?&]lang=([A-Za-z-]+)/.exec(String(search));
  if (!match) return null;
  const base = match[1].toLowerCase().split('-')[0];
  return BY_CODE.has(base) ? base : null;
}

/**
 * The address beats a stored choice, which beats the browser, which is English.
 *
 * The address comes first because it is the most explicit thing a reader can
 * do: they followed a link that named a language, and a remembered preference
 * from last week should not silently override that.
 */
export function resolveLanguage({ navigator: nav, storage, search } = {}) {
  return queryLanguage(search) ?? storedLanguage(storage) ?? detectLanguage(nav);
}

/**
 * Look up a dotted key.
 *
 * Returns `undefined` for a miss rather than a fallback, so `translator`
 * below can decide loudly what to do about it.
 */
export function lookup(bundle, key) {
  let node = bundle;
  for (const part of String(key).split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  if (typeof node === 'string') return node;
  return isPluralForm(node) ? node : undefined;
}

/**
 * A key whose value is a set of plural forms rather than one string.
 *
 * `_count` names the placeholder that decides which form is used. Naming it
 * explicitly beats a convention like "always {count}", because the sentences
 * that need this already had their own names for the number -- {current},
 * {ahead}, {days} -- and renaming those in six languages to satisfy the
 * mechanism would be the mechanism deciding the prose.
 */
export function isPluralForm(node) {
  return Boolean(node) && typeof node === 'object' && typeof node._count === 'string';
}

/**
 * The set of {named} placeholders a template uses, sorted.
 *
 * The parity test compares these across bundles. A translation that drops
 * `{threshold}` still reads like a sentence -- it just silently stops naming
 * the number the sentence is about, and nothing else would catch that.
 */
export function placeholdersIn(template) {
  const found = new Set();
  const scan = (text) => String(text).replace(/\{(\w+)\}/g, (whole, name) => found.add(name));

  if (isPluralForm(template)) {
    // Every form is scanned, not just one. A translation that names the number
    // in its plural form and forgets it in the singular reads fine until the
    // day the count is 1 -- which for "1 night without relief" is the day it
    // matters most.
    for (const [name, form] of Object.entries(template)) {
      if (name !== '_count') scan(form);
    }
  } else {
    scan(template);
  }
  return [...found].sort();
}

/**
 * Pick the plural form this language uses for this number.
 *
 * `Intl.PluralRules` is the whole point: Arabic has six categories, French
 * counts zero as singular, and the "(s)" in the first draft of these bundles
 * was wrong in both languages at once. Measured: ar gives zero/one/two/few/
 * many/other for 0/1/2/3/11/100; fr gives "one" for 0.
 */
export function selectPlural(forms, count, code) {
  const category = new Intl.PluralRules(code).select(Number(count));
  return forms[category] ?? forms.other ?? forms.one;
}

/** Substitute {named} placeholders. Unknown ones are left visible, not blanked. */
export function interpolate(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (whole, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole
  );
}

/**
 * Build a translator for one bundle.
 *
 * `onMissing` exists so the test suite can turn a gap into a failure while
 * the page turns it into a visible marker. Neither of them silently papers
 * over it.
 */
export function translator(bundle, { code = DEFAULT_LANGUAGE, onMissing } = {}) {
  const t = (key, values) => {
    const template = lookup(bundle, key);
    if (template === undefined) {
      onMissing?.(key);
      return `[${key}]`;
    }
    if (isPluralForm(template)) {
      const count = values?.[template._count];
      return interpolate(selectPlural(template, count ?? 0, code), values);
    }
    return interpolate(template, values);
  };

  t.has = (key) => lookup(bundle, key) !== undefined;
  return t;
}

/** Every dotted key in a bundle, sorted — the shape two bundles must share. */
export function keysOf(bundle, prefix = '') {
  const keys = [];
  for (const [name, value] of Object.entries(bundle)) {
    const path = prefix ? `${prefix}.${name}` : name;
    // A plural object is one KEY, not one key per form -- otherwise Arabic,
    // with six categories where German has two, could never match the
    // reference shape, and the parity test would be measuring grammar rather
    // than coverage.
    if (typeof value === 'string' || isPluralForm(value)) keys.push(path);
    else if (value && typeof value === 'object') keys.push(...keysOf(value, path));
  }
  return keys.sort();
}

/**
 * Format a number for a locale, keeping the unit out of it.
 *
 * `Intl` handles the decimal comma German and Spanish expect and the digits
 * Hindi and Arabic may prefer. The unit is appended separately because it is
 * not language: a degree Celsius is a degree Celsius everywhere, and a
 * "translated" unit would be a different measurement.
 */
export function formatNumber(value, code, { digits = 1 } = {}) {
  if (!Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(code, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}
