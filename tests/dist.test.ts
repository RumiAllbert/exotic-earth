import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "../dist");

function read(rel: string): string {
  return readFileSync(join(dist, rel), "utf8");
}

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("built dist (agent endpoints)", () => {
  it("skips when dist/ is missing", { skip: !existsSync(dist) }, () => {});

  it("homepage HTML has H1, H2 sections, and 500+ characters", {
    skip: !existsSync(join(dist, "index.html")),
  }, () => {
    const html = read("index.html");
    assert.match(html, /<h1[^>]*>/);
    assert.match(html, /<h2[^>]*>\s*About\s*<\/h2>/);
    assert.match(html, /<h2[^>]*>\s*Experience\s*<\/h2>/);
    assert.match(html, /<h2[^>]*>\s*Publications\s*<\/h2>/);
    assert.ok(visibleText(html).length >= 500);
    const palette = html.split('<ul id="command-results"')[1].split('</ul>')[0];
    assert.equal((palette.match(/<li/g) ?? []).length, 8);
    assert.match(palette.split('<li').at(-1)!, /hiring/);
    assert.match(html, /https:\/\/www.linkedin.com\/in\/rumi-calles\//);

    assert.doesNotMatch(html, /id="news"/);
    assert.match(html, /aria-label="Page progress"/);
    const cv = JSON.parse(readFileSync(join(dist, "../cv.json"), "utf8"));
    assert.equal((html.match(/class="certificate-name"/g) ?? []).length, cv.certificates.length);
    assert.equal((html.match(/class="abstract-preview"/g) ?? []).length, cv.publications.length);
    const hero = html.split('<header class="hero')[1].split('</header>')[0];
    assert.doesNotMatch(hero, /class="(?:role|lede)"/);
    assert.match(html, /href="https:\/\/etymon-ai.com\/"/);
    assert.doesNotMatch(html, /πάντες|All human beings by nature/);
    assert.doesNotMatch(read("index.md"), /## News & appearances/);
    assert.doesNotMatch(hero, /New York/);
  });

  it("404.html includes markdown recovery links", {
    skip: !existsSync(join(dist, "404.html")),
  }, () => {
    const html = read("404.html");
    assert.match(html, /llms\.txt/);
    assert.match(html, /sitemap\.md/);
    assert.match(html, /# Not found/);
  });

  it("supporting pages expose real contact and agent links", () => {
    const html = read('contact/index.html');
    for (const href of ['mailto:rumi.calles@gmail.com', 'tel:+19739364084', 'https://www.linkedin.com/in/rumi-calles/', 'https://github.com/RumiAllbert', '/llms']) {
      assert.ok(html.includes(`href="${href}"`), href);
    }
    const guide = read('llms/index.html');
    assert.match(guide, /href="\/llms.txt" download/);
    assert.match(guide, /href="https:\/\/rumicalles.com\/index.md"/);
  });

  it("copies machine-readable files", {
    skip: !existsSync(join(dist, "llms.txt")),
  }, () => {
    assert.match(read("llms.txt"), /## When to use this/);
    assert.match(read("index.md"), /^# /);
    assert.match(read("about.md"), /^# About/);
    assert.match(read("sitemap.md"), /^# Sitemap/);
    assert.match(read("robots.txt"), /Sitemap:/);
  });
});
