import en from '../i18n/en.json';
import zh from '../i18n/zh.json';

export type Lang = 'en' | 'zh';

const translations: Record<Lang, any> = { en, zh };

const defaultLang: Lang = 'en';

export const languages: Record<Lang, string> = {
  en: 'English',
  zh: '中文',
};

export function t(lang: Lang, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  if (value !== undefined && value !== null) return String(value);
  // Only fall back to defaultLang if we're not already at the default
  if (lang !== defaultLang) return t(defaultLang, key);
  // At defaultLang with no match — return the key itself
  return key;
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'zh') return 'zh';
  return 'en';
}

export function switchLangPath(pathname: string, targetLang: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  // Remove existing language prefix if present
  if (parts[0] === 'en' || parts[0] === 'zh') {
    parts.shift();
  }
  // Add prefix only for non-default locales
  if (targetLang !== defaultLang) {
    parts.unshift(targetLang);
  }
  return '/' + parts.join('/') || '/';
}

/** Get the URL path prefix for a language: '/' for default locale, '/zh/' otherwise */
export function langPathPrefix(lang: Lang): string {
  return lang === defaultLang ? '/' : `/${lang}/`;
}

/** Get the full URL for a given language, handling prefixDefaultLocale: false */
export function getLangUrl(url: string, targetLang: Lang): string {
  const u = new URL(url);
  let path = u.pathname;
  // Strip existing language prefix
  path = path.replace(/^\/(en|zh)(\/|$)/, '/');
  // Add target language prefix if not default
  if (targetLang !== defaultLang) {
    path = '/' + targetLang + (path === '/' ? '' : path);
  }
  u.pathname = path || '/';
  return u.toString();
}
