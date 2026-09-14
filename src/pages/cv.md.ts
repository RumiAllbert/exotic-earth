import type { APIRoute } from "astro";
import { homeMarkdown, markdownResponseHeaders } from "@/lib/site-content";

export const GET: APIRoute = () =>
  new Response(homeMarkdown(), { headers: markdownResponseHeaders() });
