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
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

describe("built dist (agent endpoints)", () => {
  it("skips when dist/ is missing", { skip: !existsSync(dist) }, () => {});

  it(
    "homepage HTML has H1, H2 sections, and 500+ characters",
    {
      skip: !existsSync(join(dist, "index.html")),
    },
    () => {
      const html = read("index.html");
      assert.match(html, /<h1[^>]*>/);
      assert.match(html, /id="about-title"/);
      assert.match(html, /id="work-title"/);
      assert.match(html, /id="writing-title"/);
      assert.match(html, /href="\/cv"/);
      assert.doesNotMatch(html, /id="loader"/);
      assert.equal((html.match(/id="hotkeypad"/g) ?? []).length, 1);
      for (const image of html.matchAll(/<img[^>]*src="([^"]+)"/g)) {
        assert.ok(
          existsSync(join(dist, image[1])),
          `Missing image: ${image[1]}`,
        );
      }
      const cv = read("cv/index.html");
      assert.match(cv, /id="experience"/);
      assert.match(cv, /id="education"/);
      assert.match(cv, /id="skills"/);
      assert.match(cv, /<details/);
    assert.match(read("cv.md"), /^## Experience/m);
    const source = JSON.parse(readFileSync(join(dist, "../cv.json"), "utf8"));
    for (const project of source.projects) {
      assert.ok(visibleText(html).includes(project.name), `Missing project: ${project.name}`);
      assert.ok(html.includes(project.url), `Missing project link: ${project.name}`);
    }
    for (const item of [...source.work, ...source.education, ...source.certificates]) {
      const name = item.name ?? item.institution;
      assert.ok(visibleText(cv).includes(name), `Missing CV entry: ${name}`);
    }
      assert.ok(visibleText(html).length >= 500);
    },
  );

  it(
    "404.html includes markdown recovery links",
    {
      skip: !existsSync(join(dist, "404.html")),
    },
    () => {
      const html = read("404.html");
      assert.match(html, /llms\.txt/);
      assert.match(html, /sitemap\.md/);
      assert.match(html, /# Not found/);
    },
  );

  it(
    "trust pages have 500+ characters of text",
    {
      skip: !existsSync(join(dist, "about/index.html")),
    },
    () => {
      for (const page of ["about", "contact", "privacy"]) {
        const text = visibleText(read(`${page}/index.html`));
        assert.ok(text.length >= 500, `${page} is ${text.length} chars`);
      }
    },
  );

  it(
    "copies machine-readable files",
    {
      skip: !existsSync(join(dist, "llms.txt")),
    },
    () => {
      assert.match(read("llms.txt"), /## When to use this/);
      assert.match(read("index.md"), /^# /);
      assert.match(read("about.md"), /^# About/);
      assert.match(read("sitemap.md"), /^# Sitemap/);
      assert.match(read("robots.txt"), /Sitemap:/);
    },
  );
});
