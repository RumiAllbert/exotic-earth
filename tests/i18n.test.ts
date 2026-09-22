import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { locales, languageTag, localeFor, localizedPath, translator } from '../src/i18n/index.ts';
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
    assert.ok(html.includes(`<html lang="${languageTag(locale)}">`));
    assert.ok(html.includes(`href="${root}" lang="${languageTag(locale)}" hreflang="${languageTag(locale)}" aria-current="page"`));
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
        assert.ok(content.replace(/<[^>]+>/g, "").includes(escape(t(value))), `${locale}/${page.id}: missing ${value}`);
      }
    }
  }
  assert.equal(localeFor('/constructor/'), 'en');
  assert.equal(localizedPath('/contact', 'en'), '/contact');
  assert.throws(() => translator('/es/')('untranslated new copy'), /Missing es translation/);
  assert.ok(messages['Language']['zh-Hant'].includes('語'));
});

test('language disclosure preserves location and dismisses with Escape, outside click and focus departure', () => {
  const source = read('src/components/LanguageSelect.astro').split('<script>')[1].split('</script>')[0];
  const events: Record<string, Function> = {};
  const outside: Record<string, Function> = {};
  const link = { href: 'https://rumicalles.com/zh-Hant/' };
  let focused = false;
  const picker = {
    open: true,
    querySelectorAll: () => [link],
    querySelector: () => ({ focus: () => { focused = true; } }),
    addEventListener: (name: string, fn: Function) => { events[name] = fn; },
    contains: (node: unknown) => node === link,
  };
  const location = { search: '?ref=portfolio', hash: '#projects' };
  runInNewContext(ts.transpile(source), {
    document: { querySelector: () => picker, addEventListener: (name: string, fn: Function) => { outside[name] = fn; } },
    location, URL,
  });
  assert.equal(link.href, 'https://rumicalles.com/zh-Hant/?ref=portfolio#projects');
  location.hash = '#contact';
  events.click({ target: { closest: () => link } });
  assert.equal(link.href, 'https://rumicalles.com/zh-Hant/?ref=portfolio#contact');
  events.keydown({ key: 'Escape', stopPropagation() {} });
  assert.equal(picker.open, false);
  assert.equal(focused, true);
  picker.open = true;
  outside.pointerdown({ target: link });
  assert.equal(picker.open, true);
  outside.pointerdown({ target: {} });
  assert.equal(picker.open, false);
  picker.open = true;
  events.focusout({ relatedTarget: link });
  assert.equal(picker.open, true);
  events.focusout({ relatedTarget: null });
  assert.equal(picker.open, false);
});

test('classical versions retain modern technical terminology and Spanish uses the requested invitation', () => {
  for (const locale of ['la', 'grc']) {
    const t = translator(`/${locale}/`);
    for (const term of ['Director of Research Engineering', 'Data Science', 'Machine Learning', 'Deep Learning', 'NLP & LLMs']) {
      assert.equal(t(term), term);
    }
  }
  assert.equal(translator('/es/')("let's chat :)"), 'platiquemos :)');
  assert.equal(languageTag('es'), 'es-MX');
});
