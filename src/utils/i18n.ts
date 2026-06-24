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
  return value || t(defaultLang, key) || key;
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'zh') return 'zh';
  return 'en';
}

export function switchLangPath(pathname: string, targetLang: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'zh') {
    parts[0] = targetLang;
  } else {
    parts.unshift(targetLang);
  }
  return '/' + parts.join('/');
}
