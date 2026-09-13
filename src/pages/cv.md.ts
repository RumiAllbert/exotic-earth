import type { APIRoute } from "astro";
import { cvMarkdown, markdownResponseHeaders } from "@/lib/site-content";

export const GET: APIRoute = () =>
  new Response(cvMarkdown(), { headers: markdownResponseHeaders() });
