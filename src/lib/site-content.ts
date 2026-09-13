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

- [Home](${SITE_URL}/): CV, research, publications, and projects
- [llms.txt](${SITE_URL}/llms.txt): agent index, when-to-use guidance, and how to fetch pages
- [Sitemap](${SITE_URL}/sitemap.md): markdown site map
- [XML sitemap](${SITE_URL}/sitemap-index.xml): machine-readable URL list
- [About](${SITE_URL}/about): identity, affiliations, and research focus
- [Contact](${SITE_URL}/contact): email and public profiles
- [Privacy](${SITE_URL}/privacy): what this site collects

Request those URLs with \`Accept: text/markdown\` (or append \`.md\`) to get a clean text body.
`;

export const docPages: Record<DocPageId, DocPage> = {
  about: {
    id: "about",
    path: "/about",
    title: "About",
    description:
      "Who Rumi Alexander Elías Calles is, where he works, and what to cite.",
    sections: [
      {
        heading: "Identity",
        paragraphs: [
          "Rumi Alexander Elías Calles is a research engineer and classicist based in New York. He leads research engineering for human-evaluation AI systems, and writes at the intersection of machine intelligence, classical languages, and philosophy of mind.",
          "This page is the identity record for this site. Use it to verify who he is before citing a paper, recommending him for a role, or sending a collaboration note. The CV page contains the full professional history; this page is the shorter account of current work and affiliations.",
        ],
      },
      {
        heading: "Current work",
        paragraphs: [
          "He is Director of Research Engineering at micro1, where he designs RL environments and post-training pipelines: task specs, reward signals, evaluation loops, data curation, and preference or reward modeling used in production training. He founded Aeterna Institute, a classical liberal arts project organized around the Trivium, Quadrivium, and Socratic method. He is also an affiliate researcher at the Wolfram Institute, working on minds, machines, and intelligence, including conceptual spaces, machine ethics, and activation-level interpretability.",
          "He teaches ethics and philosophy of computing as an adjunct professor at Fei Tian College, with emphasis on AI governance and privacy. Earlier he built production NLU and recommendation-evaluation systems, and spent two years as a data scientist at The Epoch Times on churn models, publishing pipelines, and NLP over unstructured content.",
        ],
      },
      {
        heading: "Research and training",
        paragraphs: [
          "Published work includes Abliterator, a framework for studying and steering LLM personality traits through activation engineering; PhiloBERTA, a cross-lingual transformer measuring semantic alignment between ancient Greek and Latin; a large-scale comparison of speech-to-text, LLM, and text-to-speech stacks on more than 300,000 AI-conducted interviews; and De Suspensione, on inflection, composition, and the outward drift of thought under digital memory and generative models.",
          "He holds an MA in Humanities from Ralston College (full-tuition scholarship, intensive Greek residency) and a BS in Data Science from Fei Tian College. He completed linguistic immersion at Academia Vivarium Novum, where Latin and Ancient Greek were the spoken languages of daily life, and a Greek residency at Harvard's Center for Hellenic Studies in Návplion.",
        ],
      },
    ],
  },
  contact: {
    id: "contact",
    path: "/contact",
    title: "Contact",
    description:
      "How to reach Rumi Alexander Elías Calles for research, teaching, or talks.",
    sections: [
      {
        heading: "Direct contact",
        paragraphs: [
          `Email is the right first channel: ${basics.email}. That address is the public contact for research engineering, classical-language projects, teaching, and talks. Include who you are, what you want him to look at, and any deadline. He reads email himself; there is no ticket queue, chatbot, or scheduling API on this site.`,
          `Phone: ${basics.phone}. Prefer email unless you already have an established thread. Location: ${basics.location.city}, ${basics.location.region}, ${basics.location.countryCode}.`,
        ],
      },
      {
        heading: "Public profiles",
        paragraphs: [
          "LinkedIn: https://linkedin.com/in/rumi-allbert — professional history and introductions.",
          "GitHub: https://github.com/RumiAllbert — code, papers-adjacent repos (Abliterator, Latinium, Vertor, Loqui TTS), and experiments.",
          "Personal site: https://rumicalles.com — selected work, writing, and the full CV. Machine-readable entry point: https://rumicalles.com/llms.txt. For a clean text copy of any page, request it with Accept: text/markdown or use the matching .md URL.",
        ],
      },
      {
        heading: "What to write about",
        paragraphs: [
          "Good reasons to write: collaboration on RL environments, post-training, or human-evaluation systems; questions about the published papers; invitations to teach or speak on AI evaluation, interpretability, or classical languages; and serious notes on Aeterna Institute or classical study.",
          "This is not a company support desk, a hiring portal, or a product with an agent API. There is nothing to purchase and no account to create. If you are an automated agent contacting on behalf of a person, say so, name the person, and keep the ask specific.",
        ],
      },
    ],
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    title: "Privacy",
    description:
      "What rumicalles.com collects, what it does not, and how to reach the operator.",
    sections: [
      {
        heading: "Who operates this site",
        paragraphs: [
          `This site is the personal CV of ${basics.name}, operated by him, hosted on Netlify, and served at ${SITE_URL}. It is not a product company, marketplace, or account-based service. There is no user registration, no customer database, and no advertising network run from these pages.`,
          `Questions about this policy: ${basics.email}. That is also the contact on /contact. This policy describes the public site only. Third-party sites linked from papers, GitHub, or LinkedIn have their own policies.`,
        ],
      },
      {
        heading: "What is collected",
        paragraphs: [
          "The site is a static CV. Pages do not require cookies to read. A theme preference (light or dark) may be stored in the browser's localStorage so the next visit can restore it; that value stays on your device and is not sent to a server as a tracking identifier.",
          "The host, Netlify, processes standard request logs (IP address, user agent, requested URL, timestamps) in order to serve the site, stop abuse, and operate the CDN. Those logs are handled under Netlify's own terms. This site does not run a separate analytics pixel, does not sell visitor data, and does not build advertising profiles from visits.",
          "If you email the address on /contact, that correspondence lives in email, not in a CRM on this domain. Do not send passwords or payment details. There is nothing to pay for here.",
        ],
      },
      {
        heading: "Agents, markdown, and automated clients",
        paragraphs: [
          "Automated clients may fetch /llms.txt, /sitemap.md, /sitemap-index.xml, and page URLs with Accept: text/markdown. Those endpoints exist so agents can read the same public facts humans see, without executing JavaScript. Fetching them does not create an account and does not grant extra personal data.",
          "If you want a page removed from a training corpus, or want a correction to biographical facts, email the address above with the URL and the change you are asking for. This site will update the canonical pages; it cannot force third-party crawlers to forget a prior copy.",
        ],
      },
    ],
  },
};

export function docPagePlainText(page: DocPage): string {
  return page.sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join("\n");
}

export function docPageMarkdown(page: DocPage): string {
  const parts = [`# ${page.title}`, "", page.description, ""];
  for (const section of page.sections) {
    parts.push(`## ${section.heading}`, "");
    for (const paragraph of section.paragraphs) {
      parts.push(paragraph, "");
    }
  }
  parts.push(`Canonical URL: ${SITE_URL}${page.path}`, "");
  return parts.join("\n");
}

function formatWork(): string {
  return (work as Array<{
    name: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string | null;
    summary: string;
    highlights?: string[];
  }>)
    .map((job) => {
      const end = yearOf(job.endDate);
      const start = yearOf(job.startDate);
      const lines = [
        `### ${job.position} @ ${job.name}`,
        "",
        `${start}–${end}${job.location ? ` · ${job.location}` : ""}`,
        "",
        job.summary,
        "",
      ];
      if (job.highlights?.length) {
        for (const highlight of job.highlights) {
          lines.push(`- ${highlight}`);
        }
        lines.push("");
      }
      return lines.join("\n");
    })
    .join("\n");
}

function formatPublications(): string {
  return publications
    .map((pub) => {
      const year = yearOf(pub.date);
      const lines = [
        `### ${pub.title}`,
        "",
        `${pub.authors.join(", ")} · ${year} · ${pub.publisher}`,
        "",
        pub.highlight ?? pub.abstract,
        "",
      ];
      if (pub.url) lines.push(`[${pub.url}](${pub.url})`, "");
      return lines.join("\n");
    })
    .join("\n");
}

function formatEducation(): string {
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
        `${item.studyType} in ${item.area} · ${start}–${end}`,
        "",
      ];
      if (item.highlights?.length) {
        for (const highlight of item.highlights) {
          lines.push(`- ${highlight}`);
        }
        lines.push("");
      }
      return lines.join("\n");
    })
    .join("\n");
}

function formatProjects(): string {
  return projects
    .map((project) => {
      const lines = [`### ${project.name}`, "", project.description, ""];
      if (project.highlights?.length) {
        for (const highlight of project.highlights) {
          lines.push(`- ${highlight}`);
        }
        lines.push("");
      }
      if (project.url) lines.push(`[${project.url}](${project.url})`, "");
      return lines.join("\n");
    })
    .join("\n");
}

function formatSkills(): string {
  return skills
    .map((group) => `### ${group.name}\n\n${group.keywords.join(", ")}\n`)
    .join("\n");
}

export function cvMarkdown(): string {
  const profiles = basics.profiles
    .map((profile) => `- [${profile.network}](${profile.url})`)
    .join("\n");

  return `# ${basics.name}

${basics.label}

${basics.location.city}, ${basics.location.region}

${basics.summary}

- Email: ${basics.email}
- Site: ${SITE_URL}
${profiles}

## About

${basics.summary}

He leads research engineering for RL environments and post-training, writes on machine intelligence and classical languages, and teaches ethics of computing. Full narrative: [About](${SITE_URL}/about).

## Languages

${languages.map((item) => `- ${item.language}`).join("\n")}

## Experience

${formatWork()}
## Publications

${formatPublications()}
## Skills

${formatSkills()}
## Education

${formatEducation()}
${
  certificates.length
    ? `### Certificates

${certificates.map((c) => `- ${c.name} (${c.issuer}, ${yearOf(c.date)})`).join("\n")}
`
    : ""
}
## Projects

${formatProjects()}
## Contact

Research engineering, classical philosophy, or both.

- [Contact page](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)
- [llms.txt](${SITE_URL}/llms.txt)
- [Sitemap](${SITE_URL}/sitemap.md)
`;
}

export function homeMarkdown(): string {
  return `# ${basics.name}

Research engineer & classicist

Ancient languages. Artificial minds. I work on both.

I'm Rumi Calles. I lead research engineering at micro1, study how language models behave, and build tools for people who care about words.

## Projects

Selected work: Etymon.ai, Vertor, and LLM Abliterator. The full project index follows.

${formatProjects()}
## Publications

Featured essay: De Suspensione: Inflection, Composition, and the Long Drift Outward.

${formatPublications()}
## About

${basics.summary}

My studies have taken me through data science, the humanities, and daily life in Latin and Ancient Greek at Academia Vivarium Novum.

## Experience

${work.filter(job => !job.endDate).slice(0, 3).map(job => `- ${job.position} at ${job.name}`).join("\n")}

[Full curriculum vitae](${SITE_URL}/cv) · [CV in Markdown](${SITE_URL}/cv.md)

## Contact

- Email: ${basics.email}
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)
`;
}

export function sitemapMarkdown(): string {
  return `# Sitemap

Machine-readable twin of the public pages on ${SITE_URL}.

## Pages

- [Home](${SITE_URL}/): CV, research, publications, and projects
- [Curriculum vitae](${SITE_URL}/cv): full experience, education, publications, skills, and certificates
- [CV (markdown)](${SITE_URL}/cv.md): text version of the full CV
- [About](${SITE_URL}/about): identity, affiliations, and research focus
- [Contact](${SITE_URL}/contact): email, profiles, and what to write about
- [Privacy](${SITE_URL}/privacy): collection, hosting, and agent access

## Agent files

- [llms.txt](${SITE_URL}/llms.txt): index and when-to-use guidance
- [Home (markdown)](${SITE_URL}/index.md): markdown twin of the homepage
- [About (markdown)](${SITE_URL}/about.md)
- [Contact (markdown)](${SITE_URL}/contact.md)
- [Privacy (markdown)](${SITE_URL}/privacy.md)
- [XML sitemap](${SITE_URL}/sitemap-index.xml)
`;
}

const PAGE_MARKDOWN: Record<string, () => string> = {
  "/": homeMarkdown,
  "/index.html": homeMarkdown,
  "/index.md": homeMarkdown,
  "/cv": cvMarkdown,
  "/cv/": cvMarkdown,
  "/cv.html": cvMarkdown,
  "/cv.md": cvMarkdown,
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
  const path = normalizePath(pathname);
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
  if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|mjs|map|woff2?|ttf|txt|xml|json)$/i.test(path)) {
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
