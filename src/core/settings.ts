import type { AssistantSettings, SettingsInput } from './types';
import { normalizeLocale } from './locale';
import { themePresets } from './themes';

export const defaultSettings: AssistantSettings = {
  features: {
    chat: true,
    tour: true,
    sectionPicker: true,
    hoverHelp: true,
    navigation: true,
    tools: true,
    pageContext: 'sections',
  },
  memory: {
    storage: 'session',
    rememberVisited: true,
    rememberDismissed: true,
    ttlMs: 86400000,
    key: 'orfin:memory:v1',
  },
  hoverDelay: 2200,
  hoverCooldown: 30000,
  highlightDuration: 2000,
  highlightOpacity: 0.15,
  highlightTransition: 280,
  logo: null,
  theme: 'cloud',
  locale: 'en',
  translations: {},
};

export function resolveSettings(
  input: SettingsInput = {},
  previous = defaultSettings,
): AssistantSettings {
  return {
    theme: input.theme && Object.hasOwn(themePresets, input.theme) ? input.theme : previous.theme,
    logo: input.logo === undefined ? previous.logo : input.logo,
    highlightOpacity: Number.isFinite(input.highlightOpacity)
      ? Math.min(1, Math.max(0, input.highlightOpacity!))
      : previous.highlightOpacity,
    highlightTransition: Number.isFinite(input.highlightTransition)
      ? Math.min(1500, Math.max(0, input.highlightTransition!))
      : previous.highlightTransition,
    locale: normalizeLocale(input.locale ?? previous.locale),
    translations: input.translations ?? previous.translations,
    features: { ...previous.features, ...input.features },
    memory: { ...previous.memory, ...input.memory },
    hoverDelay: Math.max(300, input.hoverDelay ?? previous.hoverDelay),
    hoverCooldown: Math.max(0, input.hoverCooldown ?? previous.hoverCooldown),
    highlightDuration: Math.max(0, input.highlightDuration ?? previous.highlightDuration),
  };
}
