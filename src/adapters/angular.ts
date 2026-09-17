import {
  DestroyRef,
  InjectionToken,
  PLATFORM_ID,
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createOrfin } from '../index';
import { resolveSettings } from '../core/settings';
import type { Locale, SettingsInput } from '../core/types';
import type { OrfinController, OrfinOptions } from '../browser/controller';

export const ORFIN = new InjectionToken<OrfinController | null>('OrfinSupport');
const ORFIN_OPTIONS = new InjectionToken<() => OrfinOptions>('OrfinSupport options');

export function provideOrfin(options: OrfinOptions | (() => OrfinOptions)) {
  const readOptions = () => (typeof options === 'function' ? options() : options);
  return makeEnvironmentProviders([
    { provide: ORFIN_OPTIONS, useValue: readOptions },
    {
      provide: ORFIN,
      useFactory: () => {
        if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
        const controller = createOrfin(readOptions());
        if (typeof options === 'function') effect(() => controller.updateSettings(readOptions()));
        inject(DestroyRef).onDestroy(() => controller.destroy());
        return controller;
      },
    },
    provideEnvironmentInitializer(() => {
      inject(ORFIN);
    }),
  ]);
}

export function injectOrfin() {
  const controller = inject(ORFIN);
  const settings = signal(controller?.settings ?? resolveSettings(inject(ORFIN_OPTIONS)()));
  const unsubscribe = controller?.subscribe(() => settings.set(controller.settings));
  inject(DestroyRef).onDestroy(() => unsubscribe?.());
  const updateSettings = (input: SettingsInput) => {
    settings.set(resolveSettings(input, settings()));
    controller?.updateSettings(input);
  };
  const locale = computed(() => settings().locale);
  const setLocale = (value: Locale) => updateSettings({ locale: value });
  return { controller, settings: settings.asReadonly(), locale, setLocale, updateSettings };
}
