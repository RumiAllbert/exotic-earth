import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { locales, translator, type Locale } from '../src/i18n/index.ts';
import { docPages, homeMarkdown, markdownForPath } from '../src/lib/site-content.ts';
import { negotiate } from '../src/lib/negotiate.ts';
import edge from '../netlify/edge-functions/markdown-negotiate.ts';

const read = (path: string) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('every language has static semantic HTML and matching discoverable Markdown', () => {
  for (const locale of Object.keys(locales) as Locale[]) {
    const prefix = locale === 'en' ? '' : `${locale}/`;
    const t = translator(`/${prefix}`);
    for (const page of ['', 'about', 'contact', 'privacy']) {
      const path = `/${prefix}${page}`;
      const html = read(`${prefix}${page ? `${page}/` : ''}index.html`);
      const mdPath = `${prefix}${page || 'index'}.md`;
      const md = read(mdPath);
      assert.equal(md, markdownForPath(path));
      assert.match(html, /rel="describedby" href="\/llms.txt"/);
      assert.ok(html.includes(`type="text/markdown" href="/${mdPath}"`));
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      const levels = [...html.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
      for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, path);
      assert.match(md, /^# .+/);
      const response = negotiate(path, 'text/markdown');
      assert.equal(response.kind, 'markdown');
      if (response.kind === 'markdown') { assert.equal(response.status, 200); assert.equal(response.body, md); }
      if (page) {
        const data = docPages[page as keyof typeof docPages];
        for (const section of data.sections) for (const paragraph of section.paragraphs) assert.ok(md.includes(t(paragraph)));
      } else {
        assert.ok(md.length > 500);
        assert.ok(html.includes('.notes[x-cloak]'));
        assert.match(html, /<noscript>[\s\S]*?\.notes\[x-cloak\][\s\S]*?display:\s*flex\s*!important/);
      }
    }
    assert.ok(homeMarkdown(locale).includes(t('Experience')));
    assert.equal(markdownForPath(`/${prefix}missing`), null);
  }
});

test('edge responses preserve negotiation and static files', async () => {
  const origin = async () => new Response('HTML', { headers: { Vary: 'Accept-Encoding' } });
  for (const [accept, status, type] of [['text/markdown', 200, 'text/markdown'], ['application/pdf', 406, 'text/plain'], ['text/html', 200, 'text/plain']] as const) {
    const response = await edge(new Request('https://rumicalles.com/es/', { headers: { Accept: accept } }), { next: origin });
    assert.equal(response?.status, status);
    assert.ok(response?.headers.get('Content-Type')?.startsWith(type));
    assert.match(response?.headers.get('Vary') ?? '', /Accept/);
  }
  for (const path of ['/llms.txt', '/es/index.md', '/resume.pdf']) {
    assert.equal(await edge(new Request(`https://rumicalles.com${path}`, { headers: { Accept: '*/*' } }), { next: origin }), undefined);
  }
});

test('every built public file is reachable over HTTP', { skip: !process.env.SITE_TEST_URL }, async (context) => {
  const base = process.env.SITE_TEST_URL!;
  const files = readdirSync(new URL('../dist/', import.meta.url), { recursive: true, withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => `${file.parentPath}/${file.name}`.split('/dist/')[1]);
  context.diagnostic(`${files.length} public files checked over HTTP`);
  for (const file of files) {
    const path = file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -10)}` : `/${file}`;
    const response = await fetch(base + path);
    assert.equal(response.status, file === '404.html' ? 404 : 200, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0, path);
  }
});

test('machine-readable indexes resolve to built files and structured data stays valid', () => {
  for (const file of ['llms.txt', 'sitemap.md', 'sitemap-index.xml', 'sitemap-0.xml', 'robots.txt']) {
    for (const match of read(file).matchAll(/https:\/\/rumicalles\.com([^\s<)"']*)/g)) {
      const path = match[1].split('#')[0].replace(/^\//, '');
      assert.ok([path, path + '/index.html', path + 'index.html'].some(candidate =>
        existsSync(new URL(`../dist/${candidate}`, import.meta.url))), `${file}: ${path}`);
    }
  }
  for (const locale of Object.keys(locales)) {
    const html = read(`${locale === 'en' ? '' : locale + '/'}index.html`);
    const json = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)![1];
    const person = JSON.parse(json);
    assert.equal(person['@type'], 'Person');
    assert.ok(person.name && person.url && person.email);
  }
});
