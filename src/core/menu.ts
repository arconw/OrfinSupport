import type { AssistantSettings, BuiltInMenuAction, MenuActionContext } from './types';
import type { TranslationMessages } from '../locales/types';
import { localeChain } from './locale';

export interface ResolvedMenuAction {
  key: string;
  label: string;
  builtin?: BuiltInMenuAction;
  prompt?: string;
  disabled: boolean;
}

export function resolveMenuActions(
  settings: AssistantSettings,
  context: MenuActionContext,
  text: TranslationMessages,
  busy: boolean,
): ResolvedMenuAction[] {
  const result: ResolvedMenuAction[] = [];
  const seen = new Set<string>();
  const enabled = {
    tour: settings.features.tour,
    pick: settings.features.sectionPicker,
    page: settings.features.chat,
  };
  for (const action of settings.menuActions ?? ['tour', 'pick', 'page']) {
    if (typeof action === 'string') {
      const key = `builtin:${action}`;
      if (!enabled[action] || seen.has(key)) continue;
      seen.add(key);
      result.push({
        key,
        builtin: action,
        label: text[action],
        disabled: action === 'page' && busy,
      });
      continue;
    }
    const key = `custom:${action.id}`;
    if (!action.id.trim() || seen.has(key) || !settings.features.chat) continue;
    if (action.requires?.some((feature) => !settings.features[feature])) continue;
    try {
      if (action.visibleOn) {
        const address = new URL(context.url);
        const path = address.hash.startsWith('#/')
          ? address.hash.slice(1).split('?')[0]!
          : address.pathname;
        if (
          !action.visibleOn.some((route) =>
            route.endsWith('/*')
              ? path === route.slice(0, -2) || path.startsWith(route.slice(0, -1))
              : path === route,
          )
        )
          continue;
      }
      if (action.visible && !action.visible(context)) continue;
    } catch {
      continue;
    }
    let { label, prompt } = action;
    for (const locale of localeChain(settings.locale)) {
      const translation = action.translations?.[locale];
      label = translation?.label ?? label;
      prompt = translation?.prompt ?? prompt;
    }
    if (!label.trim() || !prompt.trim()) continue;
    seen.add(key);
    result.push({ key, label, prompt, disabled: busy });
  }
  return result;
}
