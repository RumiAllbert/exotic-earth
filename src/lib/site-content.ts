import { locales, localeFor, localizedPath, translator, type Locale } from "../i18n/index.ts";
import messages from "../i18n/messages.json" with { type: "json" };
import { llmsText } from "./llms.ts";
import cv from "../../cv.json" with { type: "json" };

const {
  basics,
  certificates,
  education,
  languages,
  projects,
  publications,
  skills,
  work,
} = cv;

export const SITE_URL = "https://rumicalles.com";

export type DocPageId = "about" | "contact" | "privacy";

export type DocSection = {
  heading: string;
  paragraphs: string[];
};

export type DocPage = {
  id: DocPageId;
  path: string;
  title: string;
  description: string;
  sections: DocSection[];
};

function yearOf(date: string | null | undefined): string {
  if (!date) return "Present";
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "Present";
}

export const NOT_FOUND_MARKDOWN = `# Not found

This path does not exist on rumicalles.com (HTTP 404).

## Where to look next

- [Home](${SITE_URL}/): CV
- [llms.txt](${SITE_URL}/llms.txt): agent index
- [Sitemap](${SITE_URL}/sitemap.md)
- [XML sitemap](${SITE_URL}/sitemap-index.xml)
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)

Request those URLs with \`Accept: text/markdown\`, or append \`.md\`.
`;

export const docPages: Record<DocPageId, DocPage> = {
  about: {
    id: "about",
    path: "/about",
    title: "About",
    description: "I build AI systems and study old languages.",
    sections: [
      { heading: "Hi", paragraphs: ["I'm Rumi, a research engineer and classicist in New York. I lead RL environments and post-training at micro1."] },
      { heading: "These days", paragraphs: ["I also run Aeterna Institute and research AI at the Wolfram Institute.", "I teach computing ethics and AI governance at Fei Tian College."] },
      { heading: "A bit of background", paragraphs: ["I work on LLM personality, Greek and Latin lexicons, and AI interview systems.", "MA Humanities; BS Data Science. I studied Latin and Greek at Vivarium Novum, and Greek in Návplion."] },
    ],
  },
  contact: {
    id: "contact",
    path: "/contact",
    title: "Contact",
    description: "Email, phone, and links.",
    sections: [
      { heading: "Say hi", paragraphs: [basics.email, basics.phone] },
      { heading: "Elsewhere", paragraphs: ["https://www.linkedin.com/in/rumi-calles/", "https://github.com/RumiAllbert", "https://rumicalles.com/llms"] },
    ],
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    title: "Privacy",
    description: "The short version: no ads, accounts, or analytics.",
    sections: [
      { heading: "What gets stored", paragraphs: ["Your theme preference and intro replay limit are stored locally on your device.", "Netlify keeps request logs under its terms. Google Fonts, favicons, and jsDelivr may receive requests when the page loads.", "No analytics, ads, accounts, or sale of visitor data."] },
      { heading: "Questions", paragraphs: [basics.email, "For corrections, email me with the URL."] },
    ],
  },

};

export function docPagePlainText(page: DocPage): string {
  return page.sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join("\n");
}

export function docPageMarkdown(page: DocPage, locale: Locale = "en"): string {
  const t = translator(`/${locale}/`);
  const parts = [`# ${t(page.title)}`, "", t(page.description), ""];
  for (const section of page.sections) {
    parts.push(`## ${t(section.heading)}`, "");
    for (const paragraph of section.paragraphs) {
      parts.push(t(paragraph), "");
    }
  }
  parts.push(`Canonical URL: ${SITE_URL}${localizedPath(page.path, locale)}`, "");
  return parts.join("\n");
}

function formatWork(t: (text: string) => string): string {
  return (work as Array<{
    name: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string | null;
    summary: string;
    highlights?: string[];
    responsibilities?: string[];
    achievements?: string[];
  }>)
    .map((job) => {
      const end = t(yearOf(job.endDate));
      const start = yearOf(job.startDate);
      const lines = [
        `### ${t(job.position)} @ ${job.name}`,
        "",
        `${start}–${end}${job.location ? ` · ${job.location}` : ""}`,
        "",
        t(job.summary),
        "",
      ];
      const details = [...(job.highlights ?? []), ...(job.responsibilities ?? []), ...(job.achievements ?? [])];
      if (details.length) {
        for (const highlight of details) {
          lines.push(`- ${t(highlight)}`);
        }
        lines.push("");
      }
      return lines.join("\n");
    })
    .join("\n");
}

function formatPublications(t: (text: string) => string): string {
  return publications
    .map((pub) => {
      const year = yearOf(pub.date);
      const lines = [
        `### ${t(pub.title)}`,
        "",
        `${pub.authors.join(", ")} · ${year} · ${pub.publisher}`,
        "",
        ...[pub.highlight, pub.abstract].filter(Boolean).map(text => t(text!)),
        "",
      ];
      if (pub.url) lines.push(`[${pub.url}](${pub.url})`, "");
      return lines.join("\n");
    })
    .join("\n");
}

function formatEducation(t: (text: string) => string): string {
  return (education as Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    highlights?: string[];
  }>)
    .map((item) => {
      const start = yearOf(item.startDate);
      const end = yearOf(item.endDate);
      const lines = [
        `### ${item.institution}`,
        "",
        `${t(item.studyType)} · ${t(item.area)} · ${start}–${end}`,
        "",
      ];
      if (item.highlights?.length) {
        for (const highlight of item.highlights) {
          lines.push(`- ${t(highlight)}`);
        }
        lines.push("");
      }
      return lines.join("\n");
    })
    .join("\n");
}

function formatProjects(t: (text: string) => string): string {
  return projects
    .map((project) => {
      const lines = [`### ${project.name}`, "", t(project.description), ""];
      if (project.highlights?.length) {
        for (const highlight of project.highlights) {
          lines.push(`- ${t(highlight)}`);
        }
        lines.push("");
      }
      if (project.url) lines.push(`[${project.url}](${project.url})`, "");
      return lines.join("\n");
    })
    .join("\n");
}

function formatSkills(t: (text: string) => string): string {
  return skills
    .map((group) => `### ${t(group.name)}\n\n${group.keywords.map(t).join(", ")}\n`)
    .join("\n");
}

export function homeMarkdown(locale: Locale = "en"): string {
  const translate = translator(`/${locale}/`);
  const t = (text: string) => Object.hasOwn(messages, text) ? translate(text) : text;
  const local = (path: string) => SITE_URL + localizedPath(path, locale);
  const profiles = basics.profiles
    .map((profile) => `- [${profile.network}](${profile.url})`)
    .join("\n");

  return `# ${basics.name}

${t(basics.label)}

${t(basics.summary)}

- Email: ${basics.email}
- Site: ${SITE_URL}
${profiles}

## ${t("About")}

${t(basics.summary)}

[About](${local("/about")})

## ${t("Languages")}

${languages.map((item) => `- ${t(item.language)}`).join("\n")}

## ${t("Experience")}

${formatWork(t)}
## ${t("Publications")}

${formatPublications(t)}
## ${t("Skills")}

${formatSkills(t)}
## ${t("Education")}

${formatEducation(t)}
${
  certificates.length
    ? `### ${t("Certifications")}

${certificates.map((c) => `- ${t(c.name)} (${c.issuer}, ${yearOf(c.date)})`).join("\n")}
`
    : ""
}
## ${t("Projects")}

${formatProjects(t)}
## ${t("Contact")}

- [Contact](${local("/contact")})
- [Privacy](${local("/privacy")})
- [llms.txt](${SITE_URL}/llms.txt)
- [Sitemap](${SITE_URL}/sitemap.md)
`;
}

export function sitemapMarkdown(): string {
  return `# Sitemap

Public pages on ${SITE_URL}.

## Pages

- [Home](${SITE_URL}/): CV
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)

## Languages

${Object.entries(locales).map(([locale, name]) =>
  ['/', '/about', '/contact', '/privacy'].map(path => {
    const url = localizedPath(path, locale as Locale);
    return `- [${name}: ${path === '/' ? 'CV' : path.slice(1)}](${SITE_URL}${url === '/' || url.endsWith('/') ? url + 'index.md' : url + '.md'})`;
  }).join('\n')).join('\n')}

## Agent files

- [llms.txt](${SITE_URL}/llms.txt)
- [Home (markdown)](${SITE_URL}/index.md)
- [About (markdown)](${SITE_URL}/about.md)
- [Contact (markdown)](${SITE_URL}/contact.md)
- [Privacy (markdown)](${SITE_URL}/privacy.md)
- [XML sitemap](${SITE_URL}/sitemap-index.xml)
`;
}

const PAGE_MARKDOWN: Record<string, () => string> = {
  "/llms": () => llmsText,
  "/": homeMarkdown,
  "/index.html": homeMarkdown,
  "/index.md": homeMarkdown,
  "/about": () => docPageMarkdown(docPages.about),
  "/about/": () => docPageMarkdown(docPages.about),
  "/about.html": () => docPageMarkdown(docPages.about),
  "/about.md": () => docPageMarkdown(docPages.about),
  "/contact": () => docPageMarkdown(docPages.contact),
  "/contact/": () => docPageMarkdown(docPages.contact),
  "/contact.html": () => docPageMarkdown(docPages.contact),
  "/contact.md": () => docPageMarkdown(docPages.contact),
  "/privacy": () => docPageMarkdown(docPages.privacy),
  "/privacy/": () => docPageMarkdown(docPages.privacy),
  "/privacy.html": () => docPageMarkdown(docPages.privacy),
  "/privacy.md": () => docPageMarkdown(docPages.privacy),
  "/sitemap.md": sitemapMarkdown,
};

export function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function markdownForPath(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const locale = localeFor(normalized);
  const path = localizedPath(normalized, 'en');
  if (locale !== 'en') {
    if (['/', '/index.html', '/index.md'].includes(path)) return homeMarkdown(locale);
    const id = path.replace(/\/$|\.(?:html|md)$/g, '').slice(1);
    if (Object.hasOwn(docPages, id)) return docPageMarkdown(docPages[id as DocPageId], locale);
    return null;
  }
  const exact = PAGE_MARKDOWN[path];
  if (exact) return exact();
  if (path.length > 1 && path.endsWith("/")) {
    const trimmed = PAGE_MARKDOWN[path.slice(0, -1)];
    if (trimmed) return trimmed();
  }
  return null;
}

export function isNegotiablePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (path.startsWith("/_astro/") || path.startsWith("/themes/")) return false;
  if (path.endsWith(".md")) return false;
  if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|mjs|map|woff2?|ttf|txt|xml|json|pdf)$/i.test(path)) {
    return false;
  }
  return true;
}

export function markdownResponseHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept, Accept-Encoding",
    "Cache-Control": "public, max-age=300",
  };
}

export function notAcceptableBody(requested: string | null): string {
  return `This resource is available in:
- text/html
- text/markdown

You requested: ${requested || "(empty Accept)"}
`;
}
