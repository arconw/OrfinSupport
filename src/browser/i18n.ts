import { en } from '../locales/en';
import { es } from '../locales/es';
import { fr } from '../locales/fr';
import { de } from '../locales/de';
import { pt } from '../locales/pt';
import { it } from '../locales/it';
import { nl } from '../locales/nl';
import { pl } from '../locales/pl';
import { uk } from '../locales/uk';
import { ru } from '../locales/ru';
import { tr } from '../locales/tr';
import { ar } from '../locales/ar';
import { hi } from '../locales/hi';
import { zh } from '../locales/zh';
import { ja } from '../locales/ja';
import { ko } from '../locales/ko';
import type { TranslationKey, TranslationMessages, TranslationOverrides } from '../locales/types';
import { languageName, localeChain, normalizeLocale, supportedLocales } from '../core/locale';

export const translations: Record<string, TranslationMessages> = {
  en,
  es,
  fr,
  de,
  pt,
  it,
  nl,
  pl,
  uk,
  ru,
  tr,
  ar,
  hi,
  zh,
  ja,
  ko,
};

export function resolveTranslations(
  locale: string,
  overrides: TranslationOverrides = {},
): TranslationMessages {
  const resolved: TranslationMessages = { ...en };
  for (const language of localeChain(locale)) {
    if (Object.hasOwn(translations, language)) Object.assign(resolved, translations[language]);
    const custom = Object.hasOwn(overrides, language) ? overrides[language] : undefined;
    for (const key of Object.keys(en) as TranslationKey[]) {
      const value = custom?.[key];
      if (typeof value === 'string' && value.trim()) resolved[key] = value;
    }
  }
  return resolved;
}

export function localeOptions(locale: string, overrides: TranslationOverrides) {
  const options: { code: string; label: string }[] = [...supportedLocales];
  for (const code of [...Object.keys(overrides), locale].map(normalizeLocale)) {
    if (!options.some((option) => option.code === code))
      options.push({ code, label: languageName(code, code) });
  }
  return options;
}
