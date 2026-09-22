import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
test('light is the default; saved dark mode, toggling and print restoration still work', () => {
  for (const saved of [null, 'light', 'dark', 'invalid']) {
    const classes = new Set(['light']);
    const classList = { add: (...values: string[]) => values.forEach(v => classes.add(v)), remove: (...values: string[]) => values.forEach(v => classes.delete(v)), contains: (v: string) => classes.has(v) };
    let stored = saved;
    const events: Record<string, () => void> = {};
    const context = { document: { documentElement: { classList }, body: { classList }, getElementById: () => ({ addEventListener: (key: string, fn: () => void) => { events[key] = fn; } }) }, localStorage: { getItem: () => stored, setItem: (_: string, v: string) => { stored = v; } }, window: { addEventListener: (key: string, fn: () => void) => { events[key] = fn; } } };
    const initial = read('src/layouts/Layout.astro').split('<script is:inline>')[1].split('</script>')[0];
    runInNewContext(initial, context);
    assert.deepEqual([...classes], [saved === 'dark' ? 'dark' : 'light']);
    runInNewContext(ts.transpile(read('src/components/ThemeSwitch.astro').split('<script>')[1].split('</script>')[0]), context);
    events.beforeprint(); assert.deepEqual([...classes], ['light']);
    events.afterprint(); assert.deepEqual([...classes], [saved === 'dark' ? 'dark' : 'light']);
    events.click(); assert.deepEqual([...classes], [saved === 'dark' ? 'light' : 'dark']);
  }
});
test('the italic surname is a single separate heading span', () => {
  const html = read('dist/index.html');
  assert.match(html, /<span class="display-italic"[^>]*>Elías Calles<\/span>/);
});
