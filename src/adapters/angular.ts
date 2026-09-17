import {
  DestroyRef,
  InjectionToken,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createOrfin } from '../index';
import type { OrfinController, OrfinOptions } from '../index';

export const ORFIN = new InjectionToken<OrfinController | null>('OrfinSupport');

export function provideOrfin(options: OrfinOptions) {
  return makeEnvironmentProviders([
    {
      provide: ORFIN,
      useFactory: () => {
        if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
        const controller = createOrfin(options);
        inject(DestroyRef).onDestroy(() => controller.destroy());
        return controller;
      },
    },
    provideEnvironmentInitializer(() => {
      inject(ORFIN);
    }),
  ]);
}
