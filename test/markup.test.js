/**
 * The markup's translation hooks, checked against the bundles.
 *
 * `index.html` ships English and hangs a `data-i18n` on each piece of it. A
 * hook naming a key that does not exist would put `[some.key]` on screen the
 * moment anyone switched language — visible, but only to whoever switched.
 * This finds it before they do.
 *
 * The reverse direction is deliberately NOT asserted: plenty of keys are used
 * from JavaScript and never appear in the markup, so an unused-key check here
 * would fire on every one of them.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { BUNDLES, DEFAULT_LANGUAGE, keysOf } from '../src/i18n/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const KNOWN = new Set(keysOf(BUNDLES[DEFAULT_LANGUAGE]));

const textHooks = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
const attrHooks = [...html.matchAll(/data-i18n-attr="([^"]+)"/g)].map((m) => m[1]);

describe('the markup hooks', () => {
  it('hangs hooks on the page at all', () => {
    assert.ok(textHooks.length > 30, `only ${textHooks.length} text hooks`);
    assert.ok(attrHooks.length > 0, 'no attribute hooks at all');
  });

  it('names only keys that exist', () => {
    const missing = textHooks.filter((key) => !KNOWN.has(key));
    assert.deepEqual(missing, [], `unknown keys: ${missing.join(', ')}`);
  });

  it('names only keys that exist in its attribute hooks', () => {
    const missing = [];
    for (const hook of attrHooks) {
      for (const pair of hook.split(',')) {
        const index = pair.indexOf(':');
        assert.ok(index > 0, `malformed attribute hook: ${pair}`);
        const key = pair.slice(index + 1).trim();
        if (!KNOWN.has(key)) missing.push(key);
      }
    }
    assert.deepEqual(missing, [], `unknown keys: ${missing.join(', ')}`);
  });

  it('uses each hook once, so nothing is silently overwritten twice', () => {
    const seen = new Map();
    for (const key of textHooks) seen.set(key, (seen.get(key) ?? 0) + 1);
    const repeated = [...seen].filter(([, count]) => count > 1).map(([key]) => key);
    assert.deepEqual(repeated, [], `hung twice: ${repeated.join(', ')}`);
  });

  it('declares the document language and lets the script own it', () => {
    // `lang="en"` is the pre-render's own claim about the pre-rendered text.
    // setLanguage() overwrites it, and the RTL bundle sets `dir` with it.
    assert.match(html, /<html lang="en">/);
  });

  it('carries the language switch and the unchecked-translation warning', () => {
    assert.match(html, /id="language"/, 'no language switch in the markup');
    assert.match(html, /id="language-warning"/, 'no warning element');
    assert.match(
      html,
      /data-i18n="language\.machineWarning"/,
      'the warning must carry the text hook, or it says nothing'
    );
  });
});
