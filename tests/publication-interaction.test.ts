import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

test('touch previews remain open after pointer leave and focus loss', () => {
  const source = readFileSync(new URL('../src/components/sections/Publications.astro', import.meta.url), 'utf8').split('<script>')[1].split('</script>')[0];
  for (const desktop of [false, true]) {
    const events: Record<string, (event?: any) => void> = {};
    const details = { open: false, contains: () => false, matches: () => false,
      querySelector: () => ({ addEventListener: (name: string, fn: () => void) => { events[name] = fn; } }),
      addEventListener: (name: string, fn: () => void) => { events[name] = fn; } };
    runInNewContext(ts.transpile(source), {
      matchMedia: () => ({ matches: desktop }),
      document: { querySelectorAll: () => [details], activeElement: null },
      requestAnimationFrame: (fn: () => void) => fn(),
    });
    events.pointerenter({ pointerType: 'mouse' });
    assert.equal(details.open, desktop);
    details.open = true; // Native disclosure was tapped open.
    events.pointerleave({ pointerType: desktop ? 'mouse' : 'touch' });
    events.focusout();
    assert.equal(details.open, !desktop);
    events.keydown({ key: 'Escape' });
    assert.equal(details.open, false);
  }
});
