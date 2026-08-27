/**
 * The bundle registry and the live translator.
 *
 * Bundles are imported statically rather than fetched on demand. Six
 * languages of prose is about 90 KB — smaller than the coastline the globe
 * already carries — and dynamic import would mean the page needs the network
 * to change language, which contradicts the thing it promises on the masthead.
 */

import { ar } from './ar.js';
import { de } from './de.js';
import { en } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { hi } from './hi.js';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  formatNumber,
  keysOf,
  languageInfo,
  rememberLanguage,
  resolveLanguage,
  translator,
} from './core.js';

export const BUNDLES = { en, de, es, fr, hi, ar };

export { LANGUAGES, DEFAULT_LANGUAGE, languageInfo, keysOf };

let current = DEFAULT_LANGUAGE;
let translate = translator(BUNDLES[DEFAULT_LANGUAGE], { code: DEFAULT_LANGUAGE });
const listeners = new Set();

/** The active translator. Call it as `t('some.key', { value: 1 })`. */
export function t(key, values) {
  return translate(key, values);
}

export function currentLanguage() {
  return current;
}

export function currentInfo() {
  return languageInfo(current);
}

/** A number in the active locale, without a unit glued to it. */
export function n(value, digits = 1) {
  return formatNumber(value, current, { digits });
}

export function onLanguageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Switch language.
 *
 * A missing bundle is refused rather than silently ignored: the caller asked
 * for something specific, and quietly staying in the old language would look
 * like the button is broken.
 */
export function setLanguage(code, { remember = true } = {}) {
  if (!BUNDLES[code]) return false;

  current = code;
  translate = translator(BUNDLES[code], { code });
  if (remember) rememberLanguage(code);

  const info = languageInfo(code);
  const root = globalThis.document?.documentElement;
  if (root) {
    root.lang = code;
    root.dir = info.dir;
  }

  for (const listener of listeners) listener(code, info);
  return true;
}

/** Pick up the stored or browser-preferred language at start-up. */
export function initLanguage() {
  const code = resolveLanguage();
  setLanguage(BUNDLES[code] ? code : DEFAULT_LANGUAGE, { remember: false });
  return current;
}
