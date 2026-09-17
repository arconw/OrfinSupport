import type { AssistantSettings, SettingsInput } from './types';

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
  theme: 'cloud',
  locale: 'en',
};

export function resolveSettings(
  input: SettingsInput = {},
  previous = defaultSettings,
): AssistantSettings {
  return {
    theme: input.theme ?? previous.theme,
    locale: input.locale ?? previous.locale,
    features: { ...previous.features, ...input.features },
    memory: { ...previous.memory, ...input.memory },
    hoverDelay: Math.max(300, input.hoverDelay ?? previous.hoverDelay),
    hoverCooldown: Math.max(0, input.hoverCooldown ?? previous.hoverCooldown),
    highlightDuration: Math.max(0, input.highlightDuration ?? previous.highlightDuration),
  };
}
