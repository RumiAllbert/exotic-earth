import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

test('section rail follows scroll position and handles a page without overflow', () => {
  const source = readFileSync(new URL('../src/components/SectionProgress.astro', import.meta.url), 'utf8').split('<script>')[1].split('</script>')[0];
  const links = ['about', 'experience'].map(id => ({ hash: '#' + id, current: false,
    setAttribute() { this.current = true; }, removeAttribute() { this.current = false; } }));
  let progress = '';
  const events: Record<string, () => void> = {};
  const context = {
    innerHeight: 100, scrollY: 0,
    document: { body: {}, documentElement: { scrollHeight: 300 },
      querySelector: (selector: string) => selector === '.section-progress'
        ? { querySelectorAll: () => links, style: { setProperty: (_: string, value: string) => { progress = value; } } }
        : { getBoundingClientRect: () => ({ top: (selector === '#about' ? 0 : 150) - context.scrollY }) } },
    addEventListener: (name: string, callback: () => void) => { events[name] = callback; },
    ResizeObserver: class { observe() {} },
  };
  runInNewContext(ts.transpile(source), context);
  assert.equal(progress, '0');
  assert.equal(links[0].current, true);
  context.scrollY = 200;
  events.scroll();
  assert.equal(progress, '1');
  assert.equal(links[1].current, true);
  assert.equal(links[0].current, false);
  context.document.documentElement.scrollHeight = 100;
  events.resize();
  assert.equal(progress, '1');
});
