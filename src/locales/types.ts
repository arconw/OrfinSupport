import type { en } from './en';

export type TranslationKey = keyof typeof en;
export type TranslationMessages = Record<TranslationKey, string>;
export type TranslationOverrides = Record<string, Partial<TranslationMessages>>;
