import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { pt } from './pt';
import { it } from './it';
import { nl } from './nl';
import { pl } from './pl';
import { uk } from './uk';
import { ru } from './ru';
import { tr } from './tr';
import { ar } from './ar';
import { hi } from './hi';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';
import type { DemoCopy, DemoSectionId } from './types';
import { localeChain } from '../../src/core/locale';

const copies: Record<string, DemoCopy> = {
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
export function demoCopy(locale: string): DemoCopy | undefined {
  return localeChain(locale)
    .map((code) => copies[code])
    .filter(Boolean)
    .at(-1);
}
export function sectionTranslations(id: string) {
  return Object.fromEntries(
    Object.entries(copies).map(([code, copy]) => [code, copy.sections[id as DemoSectionId]]),
  );
}
