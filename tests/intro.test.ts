import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const script = readFileSync(new URL('../src/components/ScholarIntro.astro', import.meta.url), 'utf8').split('<script is:inline>')[1].split('</script>')[0];
test('intro respects daily limit, reduced motion, anchors, storage failure and skip', () => {
  const now = 200000000;
  for (const scenario of ['first', 'recent', 'expired', 'reduced', 'anchor', 'storage', 'local', 'local-anchor', 'click', 'key']) {
    const events: Record<string, () => void> = {};
    const intro = { hidden: true, addEventListener: (key: string, fn: () => void) => { events[key] = fn; } };
    let saved = '';
    runInNewContext(script, {
      document: { getElementById: () => intro }, location: { hostname: scenario.startsWith('local') ? '127.0.0.1' : 'rumicalles.com', hash: scenario.includes('anchor') ? '#about' : '' },
      matchMedia: () => ({ matches: scenario === 'reduced' }), Date: { now: () => now },
      localStorage: { getItem: () => { if (scenario === 'storage') throw Error(); return ['recent', 'local'].includes(scenario) ? String(now - 1000) : scenario === 'expired' ? '1' : null; }, setItem: (_: string, value: string) => { saved = value; } },
      window: { addEventListener: (key: string, fn: () => void) => { events[key] = fn; }, removeEventListener: (key: string) => { delete events[key]; } },
      setTimeout: (fn: () => void) => { events.timeout = fn; return 1; }, clearTimeout: () => {},
    });
    const show = scenario === 'first' || scenario === 'expired' || scenario.startsWith('local') || scenario === 'click' || scenario === 'key';
    assert.equal(intro.hidden, !show, scenario);
    assert.equal(events.scroll, undefined);
    if (show) { assert.equal(saved, scenario.startsWith('local') ? '' : String(now)); events[scenario === 'first' ? 'wheel' : scenario === 'click' ? 'pointerdown' : scenario === 'key' ? 'keydown' : 'timeout'](); assert.equal(intro.hidden, true); assert.equal(events.keydown, undefined); }
  }
});
