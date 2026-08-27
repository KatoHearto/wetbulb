/**
 * Typesetting conventions, per language.
 *
 * This is the part of "sounds like a native wrote it" that a machine can
 * actually check. It does not judge a sentence — it checks whether the text
 * follows its own language's conventions or the source language's, which is
 * a different question and a decidable one.
 *
 * Everything asserted here was measured before it was asserted. The French
 * spacing was 22 plain spaces and 0 no-break spaces when this file was
 * written; the German bundle had three ASCII-transliterated umlauts left over
 * from a script that generated keys under a different repo's ASCII rule.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BUNDLES, DEFAULT_LANGUAGE, keysOf } from '../src/i18n/index.js';
import { isPluralForm } from '../src/i18n/core.js';

const KEYS = keysOf(BUNDLES[DEFAULT_LANGUAGE]);
const get = (bundle, key) => key.split('.').reduce((o, p) => o?.[p], bundle);

/** Every string a language actually renders, plural forms included. */
function everyString(code) {
  const out = [];
  for (const key of KEYS) {
    const value = get(BUNDLES[code], key);
    if (isPluralForm(value)) {
      for (const [name, form] of Object.entries(value)) {
        if (name !== '_count') out.push([`${key}.${name}`, form]);
      }
    } else {
      out.push([key, value]);
    }
  }
  return out;
}

const NBSP = ' ';
const NNBSP = ' ';

describe('French typesetting', () => {
  it('never lets a plain space stand before : ; ! ?', () => {
    // French sets a space before these, and it must not break. A plain space
    // lets the colon fall to the start of the next line, which is the visible
    // mark of French typed by someone who does not set French.
    const offenders = everyString('fr')
      .filter(([, text]) => / [:;!?]/.test(text))
      .map(([key]) => key);
    assert.deepEqual(offenders, [], `plain space before punctuation in: ${offenders.join(', ')}`);
  });

  it('uses a no-break space before a colon and a narrow one before ; ! ?', () => {
    // The Imprimerie nationale rule. Both characters are invisible in the
    // source, which is exactly why they need a test rather than a comment.
    const text = everyString('fr').map(([, value]) => value).join('\n');
    assert.ok(text.includes(`${NBSP}:`), 'no espace insécable before any colon');
    assert.ok(text.includes(`${NNBSP};`) || text.includes(`${NNBSP}!`) || text.includes(`${NNBSP}?`),
      'no espace fine insécable anywhere');

    const wrongWidth = everyString('fr')
      .filter(([, value]) => new RegExp(`${NBSP}[;!?]|${NNBSP}:`).test(value))
      .map(([key]) => key);
    assert.deepEqual(wrongWidth, [], `wrong space width in: ${wrongWidth.join(', ')}`);
  });

  it('writes apostrophes as ’, not as a straight quote', () => {
    const offenders = everyString('fr')
      .filter(([, text]) => /\w'\w/.test(text))
      .map(([key]) => key);
    assert.deepEqual(offenders, []);
  });
});

describe('German spelling', () => {
  it('has no ASCII transliteration left in it', () => {
    // Three of these shipped: "Heisseste", "Gefaehrlichste", "Naechte". They
    // came from a generator script written under the Exokortex's ASCII-only
    // rule for pipeline artefacts — a rule this repo does not have, applied
    // out of habit to text a reader sees.
    //
    // The first version of this check flagged ae/oe/ue anywhere and produced
    // 17 false alarms in one run: "Mauerwerk", "Querlüftung", "dauert", even
    // the placeholder {value}. German is full of legitimate au-e and qu-e, so
    // the letter pair alone decides nothing.
    //
    // What follows is a STEM LIST, not a rule: the words this particular text
    // is likely to contain in transliterated form. It is a sample, not a
    // proof — a new German word transliterated in some future edit can slip
    // past it, and the honest reading of a green result here is "none of the
    // usual suspects", not "no transliteration anywhere".
    const STEMS = [
      'naecht', 'gefaehr', 'waerm', 'kuehl', 'koerper', 'hoeh', 'fuer', 'ueber',
      'moeg', 'zaehl', 'spaet', 'staerk', 'schwaech', 'haeuf', 'taeg', 'draussen',
      'muess', 'koenn', 'wuerd', 'haett', 'laeng', 'aendert', 'waer', 'groess',
      'heisse', 'schliess', 'fuess', 'weiss', 'strass', 'aeuss',
    ];
    const offenders = [];

    for (const [key, text] of everyString('de')) {
      const prose = text.replace(/\{\w+\}/g, ' ').toLowerCase();
      for (const stem of STEMS) {
        if (prose.includes(stem)) offenders.push(`${key}: ${stem}`);
      }
    }

    assert.deepEqual(offenders, [], offenders.join(', '));
  });

  it('addresses the reader as du throughout, never switching to Sie', () => {
    // Mixing the two is the single most obvious tell in German. The page is
    // a tool, not a letter from an office, so it says du — and must keep
    // saying it.
    const offenders = everyString('de')
      .filter(([, text]) => /\b(Ihnen|Ihrem|Ihrer|Ihres)\b/.test(text))
      .map(([key]) => key);
    assert.deepEqual(offenders, [], `formal address in: ${offenders.join(', ')}`);
  });
});

describe('Spanish punctuation', () => {
  it('opens every question with ¿ and every exclamation with ¡', () => {
    const offenders = [];
    for (const [key, text] of everyString('es')) {
      const questions = (text.match(/\?/g) ?? []).length;
      const openers = (text.match(/¿/g) ?? []).length;
      if (questions !== openers) offenders.push(`${key}: ${openers} ¿ for ${questions} ?`);

      const bangs = (text.match(/!/g) ?? []).length;
      const openBangs = (text.match(/¡/g) ?? []).length;
      if (bangs !== openBangs) offenders.push(`${key}: ${openBangs} ¡ for ${bangs} !`);
    }
    assert.deepEqual(offenders, [], offenders.join(', '));
  });
});

describe('Hindi punctuation', () => {
  it('ends sentences with a danda, not a full stop', () => {
    // Devanagari uses । where Latin script uses a period. It keeps the comma,
    // which is why only the sentence end is checked here — an earlier version
    // of this probe counted 135 "wrong" commas that were all correct.
    const offenders = [];
    for (const [key, text] of everyString('hi')) {
      // A full stop directly after Devanagari, not part of a number or an
      // abbreviation like °C.
      if (/[ऀ-ॿ]\.(\s|$)/.test(text)) offenders.push(key);
    }
    assert.deepEqual(offenders, [], `Latin full stop after Devanagari in: ${offenders.join(', ')}`);
  });
});

describe('Arabic punctuation', () => {
  it('uses Arabic comma, semicolon and question mark', () => {
    const offenders = [];
    for (const [key, text] of everyString('ar')) {
      // Latin punctuation inside Arabic prose. Digits and the ASCII names
      // that stay Latin (Stull, NWS, Magnus, GitHub) are left alone.
      const stripped = text.replace(/[A-Za-z0-9{}%°.\s—–\-…()]/g, '');
      if (/[,;?]/.test(stripped)) offenders.push(`${key}: ${stripped.match(/[,;?]/g)}`);
    }
    assert.deepEqual(offenders, [], offenders.join(', '));
  });
});
