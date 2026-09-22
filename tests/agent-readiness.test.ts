import { llmsText } from "../src/lib/llms.ts";
import { preferredType, setVaryAccept, VARY_ACCEPT } from "../src/lib/accept.ts";
import { negotiate } from "../src/lib/negotiate.ts";
import {
  SITE_URL,
  docPagePlainText,
  docPages,
  homeMarkdown,
  markdownForPath,
  NOT_FOUND_MARKDOWN,
} from "../src/lib/site-content.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";


describe("Accept negotiation (acceptmarkdown.com)", () => {
  it("serves markdown when Accept: text/markdown", () => {
    assert.equal(preferredType("text/markdown"), "text/markdown");
  });

  it("honors q-values: markdown over html at 0.8", () => {
    assert.equal(
      preferredType("text/markdown, text/html;q=0.8"),
      "text/markdown",
    );
  });

  it("serves html when Accept: text/html", () => {
    assert.equal(preferredType("text/html"), "text/html");
  });

  it("rejects markdown at q=0 and falls back to html", () => {
    assert.equal(preferredType("text/markdown;q=0, text/html"), "text/html");
  });

  it("returns 406 when the only listed type is rejected", () => {
    assert.equal(preferredType("text/markdown;q=0"), null);
  });

  it("defaults to html when Accept is missing", () => {
    assert.equal(preferredType(null), "text/html");
  });

  it("defaults to html for */*", () => {
    assert.equal(preferredType("*/*"), "text/html");
  });

  it("returns 406 for an unsupported exclusive type", () => {
    assert.equal(preferredType("application/pdf"), null);
  });

  it("sets Accept on Vary without duplicating", () => {
    const headers = new Headers({ Vary: "Accept-Encoding" });
    setVaryAccept(headers);
    const vary = headers.get("Vary") ?? "";
    assert.match(vary, /accept/i);
    assert.match(vary, /accept-encoding/i);
    setVaryAccept(headers);
    assert.equal(
      (headers.get("Vary") ?? "").split(",").filter((t) => t.trim().toLowerCase() === "accept")
        .length,
      1,
    );
  });
});

describe("negotiate()", () => {
  it("returns markdown for the homepage with Accept: text/markdown", () => {
    const result = negotiate("/", "text/markdown");
    assert.equal(result.kind, "markdown");
    if (result.kind !== "markdown") return;
    assert.equal(result.status, 200);
    assert.equal(result.headers["Content-Type"], "text/markdown; charset=utf-8");
    assert.equal(result.headers.Vary, VARY_ACCEPT);
    assert.match(result.body, /^# /);
  });

  it("returns markdown 404 with recovery links for unknown paths", () => {
    const result = negotiate("/some-path-that-does-not-exist", "text/markdown");
    assert.equal(result.kind, "markdown");
    if (result.kind !== "markdown") return;
    assert.equal(result.status, 404);
    assert.match(result.body, /llms\.txt/);
    assert.match(result.body, /sitemap\.md/);
    assert.match(result.body, /sitemap-index\.xml/);
  });

  it("passes HTML through when Accept prefers html", () => {
    const result = negotiate("/", "text/html");
    assert.equal(result.kind, "html");
  });

  it("skips static assets", () => {
    assert.equal(negotiate("/og-image.png", "text/markdown").kind, "skip");
    assert.equal(negotiate("/llms.txt", "text/markdown").kind, "skip");
    assert.equal(negotiate("/index.md", "text/markdown").kind, "skip");
  });

  it("returns 406 with available types listed", () => {
    const result = negotiate("/", "application/pdf");
    assert.equal(result.kind, "not_acceptable");
    if (result.kind !== "not_acceptable") return;
    assert.match(result.body, /text\/markdown/);
    assert.match(result.body, /text\/html/);
    assert.equal(result.headers.Vary, VARY_ACCEPT);
  });
});

describe("page markdown", () => {
  it("homepage markdown has H1, H2 sections, and 500+ characters", () => {
    const md = homeMarkdown();
    assert.match(md, /^# .+/);
    assert.match(md, /^## About/m);
    assert.match(md, /^## Experience/m);
    assert.match(md, /^## Publications/m);
    assert.ok(md.replace(/\s+/g, " ").length >= 500);
  });

  it("maps /about, /contact, /privacy to markdown", () => {
    assert.ok(markdownForPath("/about")?.startsWith("# About"));
    assert.ok(markdownForPath("/contact")?.startsWith("# Contact"));
    assert.ok(markdownForPath("/privacy")?.startsWith("# Privacy"));
  });

  it("supporting pages stay concise and contain their essential facts", () => {
    for (const page of Object.values(docPages)) {
      assert.ok(docPagePlainText(page).length < 900);
      assert.ok(page.sections.every(section => section.paragraphs.length > 0));
    }
    assert.match(docPagePlainText(docPages.about), /micro1/);
    assert.match(docPagePlainText(docPages.contact), /rumi.calles@gmail.com/);
    assert.match(docPagePlainText(docPages.privacy), /Netlify/);
    assert.match(docPagePlainText(docPages.privacy), /intro replay/);
    assert.match(docPagePlainText(docPages.privacy), /Google Fonts/);
  });

  it("404 markdown points at sitemap, llms.txt, and home", () => {
    assert.match(NOT_FOUND_MARKDOWN, new RegExp(`${SITE_URL}/llms\\.txt`));
    assert.match(NOT_FOUND_MARKDOWN, /sitemap\.md/);
    assert.match(NOT_FOUND_MARKDOWN, /HTTP 404/);
  });
});

describe("llms.txt", () => {
  const llms = llmsText;

  it("follows llmstxt.org: H1, blockquote, then H2 file lists", () => {
    assert.match(llms, /^# /);
    assert.match(llms, /^> /m);
    assert.match(llms, /^## /m);
  });

  it("has only linked file-list entries after H2 headings", () => {
    const sections = llms.split(/^## .+$/m).slice(1);
    for (const section of sections) for (const line of section.trim().split('\n')) {
      if (line.trim()) assert.match(line, /^- \[.+\]\(https:\/\/[^)]+\)(?:: .*)?$/);
    }
    assert.ok(llms.length < 1200);
    assert.match(llms, /linkedin.com\/in\/rumi-calles\//);
  });

  it("includes when-to-use guidance", () => {
    assert.match(llms, /## When to use this/i);
    assert.match(llms, /\[.+\]\(https:\/\/rumicalles\.com.+\)/);
  });

  it("tells agents how to fetch markdown and how to contact", () => {
    assert.match(llms, /Accept: text\/markdown/);
    assert.match(llms, /rumi\.calles@gmail\.com/);
  });
});
