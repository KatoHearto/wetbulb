/**
 * The one contrast rule this stylesheet cannot afford to lose.
 *
 * `appearance: none` on a <select> strips the native control. The OPTION rows
 * of the open list are still painted by the operating system, so they inherit
 * the page's `color` and — if nothing says otherwise — sit on the OS
 * background. Measured on the shipped stylesheet before this fix:
 *
 *   dark theme, option on a white OS popup   #ece7df on #ffffff   1.23:1
 *   light theme, option on a dark OS popup   #1a1714 on #202020   1.10:1
 *
 * WCAG AA wants 4.5:1. Only the cursor highlight made a row readable, which
 * is exactly how it was reported: "hard to read unless you hover it".
 *
 * The closed control was fine throughout (15.78:1) — which is why every
 * screenshot of this page looked correct, and why this is a test and not an
 * eyeball check.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const css = readFileSync(path.join(here, '..', 'styles.css'), 'utf8');

/** The declarations inside one rule, by selector. */
function block(selector) {
  const index = css.indexOf(selector + ' {');
  assert.notEqual(index, -1, `no rule for \`${selector}\``);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

const declaration = (body, property) => {
  const match = new RegExp(`(?:^|;|\\n)\\s*${property}\\s*:\\s*([^;]+)`).exec(body);
  return match ? match[1].trim() : null;
};

describe('the language switch', () => {
  it('gives the option rows their own background', () => {
    // Not inherited, not transparent, not omitted. Both axes, because
    // inheriting the colour and not the background is what broke it.
    const rows = block('.language-select option');
    const background = declaration(rows, 'background');
    const colour = declaration(rows, 'color');

    assert.ok(background, 'option rows have no background');
    assert.ok(colour, 'option rows have no colour');
    assert.doesNotMatch(background, /transparent|inherit|none/, background);
    assert.match(background, /var\(--/, 'must come from a token, not a literal');
    assert.match(colour, /var\(--/, 'must come from a token, not a literal');
  });

  it('does not leave the control itself transparent', () => {
    const control = block('.language-select');
    const background = declaration(control, 'background');
    assert.ok(background, 'no background at all');
    assert.doesNotMatch(background, /transparent/, 'transparent is what caused this');
  });

  it('draws its own chevron, since appearance:none removed the native one', () => {
    // Without it the control reads as a button, and a button does not promise
    // a list. Border-drawn so it takes the theme's token rather than a
    // hard-coded colour baked into a data URI.
    const arrow = block('.language-pick::after');
    assert.match(arrow, /border-inline-end/, 'no chevron edge');
    assert.match(arrow, /var\(--/, 'chevron colour is hard-coded');
    assert.match(arrow, /pointer-events:\s*none/, 'the chevron would swallow clicks');
    assert.match(block('.language-pick'), /position:\s*relative/, 'chevron has nothing to anchor to');
  });

  it('clears room for the chevron on both sides of the page', () => {
    // The chevron sits on the trailing edge via inset-inline-end, so under RTL
    // it moves to the left and the padding has to move with it.
    assert.match(block('.language-select'), /padding:\s*4px 26px 4px 10px/);
    assert.match(block("[dir='rtl'] .language-select"), /padding:\s*4px 10px 4px 26px/);
  });
});
