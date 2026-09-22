import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { locales, localeFor, localizedPath, translator } from '../src/i18n/index.ts';
import messages from '../src/i18n/messages.json' with { type: 'json' };
import cv from '../cv.json' with { type: 'json' };
import { docPages } from '../src/lib/site-content.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;').replaceAll('"', '&#34;');

test('every locale renders complete portfolio content and keeps navigation in that language', () => {
  for (const locale of Object.keys(locales) as (keyof typeof locales)[]) {
    const root = locale === 'en' ? '/' : `/${locale}/`;
    const t = translator(root);
    assert.equal(localeFor(root), locale);
    assert.equal(localizedPath('/es/contact', locale), `${root}contact`);
    assert.equal(localizedPath('/zh-Hant/#projects', locale), `${root}#projects`);
    for (const values of Object.values(messages)) {
      if (locale !== 'en') assert.ok(values[locale]?.trim());
    }
    const html = read(`dist${root}index.html`);
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.ok(html.includes(`value="${root}" lang="${locale}" selected`));
    assert.ok(html.includes(`href="${root}contact"`));
    assert.ok(html.includes(`href="${root}about"`));
    assert.ok(html.includes(`hreflang="zh-Hant"`));
    const text = [cv.basics.summary,
      ...cv.work.flatMap(job => [job.position, job.summary, ...job.highlights, ...(job.responsibilities ?? [])]),
      ...cv.education.flatMap(item => [item.studyType, item.area, ...item.highlights]),
      ...cv.certificates.map(item => item.name),
      ...cv.projects.map(item => item.description),
      ...cv.publications.flatMap(item => [item.title, item.highlight, item.abstract])];
    for (const value of text) assert.ok(html.includes(escape(t(value))), `${locale}: missing ${value}`);
    for (const page of Object.values(docPages)) {
      const content = read(`dist${root}${page.id}/index.html`);
      for (const value of page.sections.flatMap(section => [section.heading, ...section.paragraphs])) {
        assert.ok(content.includes(escape(t(value))), `${locale}/${page.id}: missing ${value}`);
      }
    }
  }
  assert.equal(localeFor('/constructor/'), 'en');
  assert.equal(localizedPath('/contact', 'en'), '/contact');
  assert.throws(() => translator('/es/')('untranslated new copy'), /Missing es translation/);
  assert.ok(messages['Language']['zh-Hant'].includes('語'));
});

test('language selection preserves the current section and query', () => {
  const source = read('src/components/LanguageSelect.astro').split('<script>')[1].split('</script>')[0];
  let change: (event: unknown) => void = () => {};
  let destination = '';
  runInNewContext(ts.transpile(source), {
    document: { querySelector: () => ({ addEventListener: (_: string, fn: typeof change) => { change = fn; } }) },
    location: { search: '?ref=portfolio', hash: '#projects', assign: (url: string) => { destination = url; } },
  });
  change({ currentTarget: { value: '/zh-Hant/' } });
  assert.equal(destination, '/zh-Hant/?ref=portfolio#projects');
});
