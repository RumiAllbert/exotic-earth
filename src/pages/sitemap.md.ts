import type { APIRoute } from "astro";
import { markdownResponseHeaders, sitemapMarkdown } from "@/lib/site-content";

export const GET: APIRoute = () =>
  new Response(sitemapMarkdown(), { headers: markdownResponseHeaders() });
