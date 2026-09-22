import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

test('navigation floats after scrolling and expands again at the top, including restored pages', () => {
  const source = readFileSync(new URL('../src/components/SiteNav.astro', import.meta.url), 'utf8').split('<script>')[1].split('</script>')[0];
  let compact = false;
  const events: Record<string, () => void> = {};
  const window = { scrollY: 200, addEventListener: (name: string, fn: () => void) => { events[name] = fn; } };
  runInNewContext(ts.transpile(source), {
    window,
    document: { querySelector: () => ({ classList: { toggle: (name: string, value: boolean) => {
      assert.equal(name, 'is-scrolled'); compact = value;
    } } }) },
  });
  assert.equal(compact, true);
  window.scrollY = 0; events.scroll(); assert.equal(compact, false);
  window.scrollY = 48; events.scroll(); assert.equal(compact, false);
  window.scrollY = 49; events.scroll(); assert.equal(compact, true);
  window.scrollY = 0; events.pageshow(); assert.equal(compact, false);
});
