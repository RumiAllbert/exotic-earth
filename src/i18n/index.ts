// Latin and Attic prose retain modern technical terms in English; Spanish uses Mexican usage.
import messages from './messages.json' with { type: 'json' };

export const locales = { en: 'English', es: 'Español', 'zh-Hant': '中文', it: 'Italiano', la: 'Latina', grc: 'Ἑλληνική' };
export type Locale = keyof typeof locales;
export const languageTag = (locale: Locale) => locale === 'es' ? 'es-MX' : locale;
export function localeFor(path: string): Locale {
  const segment = path.split('/')[1];
  return Object.hasOwn(locales, segment) ? segment as Locale : 'en';
}
export function localizedPath(path: string, locale: Locale): string {
  const current = localeFor(path);
  const base = current === 'en' ? path : path.slice(current.length + 1) || '/';
  return locale === 'en' ? base : `/${locale}${base === '/' ? '/' : base}`;
}
export function translator(path: string) {
  const locale = localeFor(path);
  return (text: string): string => {
    if (locale === 'en') return text;
    const entry = (messages as Record<string, Record<string, string>>)[text];
    if (!entry?.[locale]) throw new Error(`Missing ${locale} translation: ${text}`);
    return entry[locale];
  };
}
