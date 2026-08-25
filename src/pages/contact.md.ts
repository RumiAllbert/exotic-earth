import type { APIRoute } from "astro";
import { docPageMarkdown, docPages, markdownResponseHeaders } from "@/lib/site-content";

export const GET: APIRoute = () =>
  new Response(docPageMarkdown(docPages.contact), {
    headers: markdownResponseHeaders(),
  });
