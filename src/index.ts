import { OrfinController } from './browser/controller';
import type { OrfinOptions } from './browser/controller';
import { mountWidget } from './browser/widget';

export function createOrfin(options: OrfinOptions = {}): OrfinController {
  if (typeof document === 'undefined')
    throw new Error(
      'Mount Orfin in a browser lifecycle hook. Use orfinsupport/server for server routes.',
    );
  const controller = new OrfinController(options);
  mountWidget(controller);
  return controller;
}

export { OrfinController };
export type { OrfinOptions, AssistantState } from './browser/controller';
export * from './core/index';

export { resolveTranslations } from './browser/i18n';
