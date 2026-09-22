import type { APIRoute } from 'astro';
import { locales } from '../../i18n/index';
import { markdownForPath, markdownResponseHeaders } from '../../lib/site-content';

export function getStaticPaths() {
  return Object.keys(locales).filter(lang => lang !== 'en').flatMap(lang =>
    ['index', 'about', 'contact', 'privacy'].map(page => ({ params: { lang, page } })));
}

export const GET: APIRoute = ({ url }) =>
  new Response(markdownForPath(url.pathname), { headers: markdownResponseHeaders() });
