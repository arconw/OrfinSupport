import type { CustomMenuAction, MenuAction } from '../src/core/types';

import { commandTranslations } from './locales/commands';

export const compareAction: CustomMenuAction = {
  id: 'compare-products',
  label: 'Compare products',
  prompt:
    'Compare Luma 27 and Luma 32 Pro for a small desk. Show me the comparison and explain the price difference.',
  translations: commandTranslations(0),
  requires: ['tools', 'navigation'],
  visibleOn: ['/shop', '/shop/*', '/compare'],
};

export const projectMenu: readonly MenuAction[] = [
  compareAction,
  {
    id: 'analyze-delivery',
    label: 'Analyze delivery',
    prompt:
      'Analyze the current delivery report. Compare the segments and explain what the data supports.',
    translations: commandTranslations(1),
    requires: ['tools'],
    visibleOn: ['/reports'],
  },
  'tour',
  'pick',
  'page',
];
