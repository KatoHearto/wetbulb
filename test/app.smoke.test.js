/**
 * A smoke test for the page, not just its arithmetic.
 *
 * There is no browser in CI, so this installs the smallest DOM `app.js`
 * actually touches, with one sharp edge: `getElementById` is backed by the
 * real id list parsed out of `index.html` and throws for anything else.
 *
 * Pure logic tests stay green forever while markup and script drift apart.
 * Rename a section in the HTML and the app quietly renders into an element
 * that no longer exists — here that is an immediate failure naming the id.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, describe, it } from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

function idsInMarkup() {
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
}

class StubElement {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.className = '';
    this.dataset = {};
    this.listeners = new Map();
    this.children = [];
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }

  setAttribute(name, value) {
    this.dataset[name] = value;
  }

  closest() {
    return null;
  }
}

function installDom(ids) {
  const elements = new Map();

  globalThis.document = {
    getElementById(id) {
      if (!ids.has(id)) {
        throw new Error(
          `app.js asks for #${id}, which does not exist in index.html — ` +
            'the markup and the script have drifted apart'
        );
      }
      if (!elements.has(id)) elements.set(id, new StubElement(id));
      return elements.get(id);
    },
    querySelectorAll: () => [],
    createElement: () => new StubElement('created'),
  };

  globalThis.window = {};
  return elements;
}

describe('the page renders', () => {
  let elements;

  before(async () => {
    elements = installDom(idsInMarkup());
    await import('../app.js');
  });

  it('asks only for elements that exist in the markup', () => {
    assert.ok(elements.size > 0, 'app.js never touched the page at all');
  });

  it('fills the state chart with a real SVG', () => {
    const html = elements.get('chart').innerHTML;
    assert.match(html, /^<svg /);
    assert.match(html, /class="wb-point"/, 'the operating point must be there');
    assert.ok(!html.includes('NaN'));
  });

  it('renders the readout as a table, not a stack of sentences', () => {
    const html = elements.get('readout').innerHTML;
    assert.match(html, /<table class="readout-table">/);
    assert.match(html, /Wet-bulb temperature/);
    assert.match(html, /Stull 2011/, 'every number should name where it comes from');
    assert.match(html, /class="readout-band"/);
  });

  it('names a band that the stylesheet has a colour for', () => {
    const className = elements.get('readout').className;
    assert.match(className, /band-(safe|watch|strain|danger|critical)/);

    const css = readFileSync(path.join(root, 'styles.css'), 'utf8');
    const band = className.match(/band-(\w+)/)[0];
    assert.ok(css.includes(`.${band}`), `${band} has no rule in styles.css`);
  });

  it('lists every factor, with its shift and its reason', () => {
    const html = elements.get('factors').innerHTML;
    const checkboxes = (html.match(/data-factor="/g) || []).length;

    assert.equal(checkboxes, 18, 'all factors should be offered');
    assert.match(html, /factor-why/);
    assert.match(html, /−\d\.\d°/, 'each one must show what it costs');
  });

  it('offers the presets with their notes as titles', () => {
    const html = elements.get('presets').innerHTML;
    assert.match(html, /data-preset="gulf"/);
    assert.match(html, /title="[^"]*more dangerous[^"]*"/);
  });

  it('produces an ordered action list', () => {
    const html = elements.get('actions').innerHTML;
    assert.match(html, /<li class="tone-/);
    assert.match(html, /action-title/);
  });

  it('draws the day chart and states the window in words', () => {
    assert.match(elements.get('day-chart').innerHTML, /^<svg /);
    assert.match(elements.get('window-summary').innerHTML, /\d{2}:00|no good hour/i);
  });

  it('ranks the measures with a bar apiece', () => {
    const html = elements.get('measures').innerHTML;
    assert.match(html, /weight-fill/);
    assert.match(html, /Shade the glass from outside/);
  });

  it('says who the unmodified numbers describe', () => {
    assert.match(
      elements.get('shift-summary').innerHTML,
      /young, healthy, acclimatised/,
      'the default case must be named, not left implied'
    );
  });

  it('builds a legend whose keys match the classes in the chart', () => {
    const legend = elements.get('chart-legend').innerHTML;
    const svg = elements.get('chart').innerHTML;

    for (const key of ['measured', 'theoretical', 'fan']) {
      assert.match(legend, new RegExp(`legend-swatch ${key}`), `legend lacks ${key}`);
      assert.ok(svg.includes(key), `the chart draws nothing for ${key}`);
    }
  });

  it('escapes everything that reaches the page as text', () => {
    for (const id of ['factors', 'actions', 'measures', 'readout']) {
      assert.ok(!elements.get(id).innerHTML.includes('<script'), id);
    }
  });

  it('wires up every control the markup offers', () => {
    for (const id of ['temp', 'humidity', 'presets', 'factors', 'low', 'high', 'buildings']) {
      const element = elements.get(id);
      assert.ok(element, `#${id} was never looked up`);
      assert.ok(element.listeners.size > 0, `#${id} has no handler attached`);
    }
  });
});
