import type { Locale, Section } from './types';

export const supportedLocales = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

export function normalizeLocale(locale: string): Locale {
  if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,5}$/.test(locale)) return 'en';
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? 'en';
  } catch {
    return 'en';
  }
}

export function localeChain(locale: string): string[] {
  const normalized = normalizeLocale(locale);
  const parts = normalized.split('-');
  const chain = ['en'];
  for (let length = 1; length <= parts.length; length++)
    chain.push(parts.slice(0, length).join('-'));
  return [...new Set(chain)];
}

export function localeDirection(locale: string): 'ltr' | 'rtl' {
  return ['ar', 'fa', 'he', 'ur', 'ps', 'dv'].includes(normalizeLocale(locale).split('-')[0]!)
    ? 'rtl'
    : 'ltr';
}

export function languageName(locale: string, displayLocale = 'en'): string {
  const normalized = normalizeLocale(locale);
  try {
    const name = new Intl.DisplayNames([normalizeLocale(displayLocale)], {
      type: 'language',
      fallback: 'none',
    }).of(normalized);
    return name ?? 'English';
  } catch {
    return 'English';
  }
}

export function localizeSection(section: Section, locale: string): Section {
  let localized = { ...section };
  for (const language of localeChain(locale)) {
    const translation = section.translations?.[language];
    if (typeof translation?.title === 'string') localized.title = translation.title;
    if (typeof translation?.description === 'string')
      localized.description = translation.description;
  }
  return localized;
}

export function formatMessage(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );
}
