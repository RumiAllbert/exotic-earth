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
    assert.match(html, /<h2[^>]*>\s*Beyond the work\s*<\/h2>/);
    assert.match(html, /<h2[^>]*>\s*Selected work\s*<\/h2>/);
    assert.match(html, /<h2[^>]*>\s*Selected research\s*<\/h2>/);
    assert.ok(visibleText(html).length >= 500);
    assert.ok(html.indexOf('id="work"') < html.indexOf('id="research"'));
    assert.match(read("cv/index.html"), /Experience/);
    assert.match(read("cv/index.html"), /Skills/);
  });

  it("404.html includes markdown recovery links", {
    skip: !existsSync(join(dist, "404.html")),
  }, () => {
    const html = read("404.html");
    assert.match(html, /llms\.txt/);
    assert.match(html, /sitemap\.md/);
    assert.match(html, /# Not found/);
  });

  it("trust pages have 500+ characters of text", {
    skip: !existsSync(join(dist, "about/index.html")),
  }, () => {
    for (const page of ["about", "contact", "privacy"]) {
      const text = visibleText(read(`${page}/index.html`));
      assert.ok(text.length >= 500, `${page} is ${text.length} chars`);
    }
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
