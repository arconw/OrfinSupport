'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ReactNode } from 'react';
import { createOrfin } from '../index';
import { resolveSettings } from '../core/settings';
import type { AssistantSettings, Locale, SettingsInput } from '../core/types';
import type { OrfinController, OrfinOptions } from '../browser/controller';

export interface OrfinSupportProps {
  options: OrfinOptions;
  onReady?: (controller: OrfinController) => void;
  children?: ReactNode;
}

export interface OrfinContextValue {
  controller: OrfinController | null;
  settings: AssistantSettings;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  updateSettings: (settings: SettingsInput) => void;
}

const OrfinContext = createContext<OrfinContextValue | null>(null);

export function OrfinSupport({ options, onReady, children }: OrfinSupportProps) {
  const latest = useRef({ options, onReady });
  latest.current = { options, onReady };
  const initial = useRef(resolveSettings(options));
  const previousOptions = useRef(options);
  const current = useRef<OrfinController | null>(null);
  const [controller, setController] = useState<OrfinController | null>(null);
  useEffect(() => {
    const instance = createOrfin({ ...latest.current.options, ...initial.current });
    current.current = instance;
    setController(instance);
    latest.current.onReady?.(instance);
    return () => {
      instance.destroy();
      current.current = null;
    };
  }, []);
  useEffect(() => {
    if (previousOptions.current !== options) {
      current.current?.updateSettings(options);
      previousOptions.current = options;
    }
  }, [options]);
  const subscribe = useCallback(
    (listener: () => void) => controller?.subscribe(listener) ?? (() => {}),
    [controller],
  );
  const snapshot = useCallback(() => controller?.settings ?? initial.current, [controller]);
  const serverSnapshot = useCallback(() => initial.current, []);
  const settings = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const updateSettings = useCallback((input: SettingsInput) => {
    initial.current = resolveSettings(input, current.current?.settings ?? initial.current);
    current.current?.updateSettings(input);
  }, []);
  const setLocale = useCallback((locale: Locale) => updateSettings({ locale }), [updateSettings]);
  const value = useMemo(
    () => ({ controller, settings, locale: settings.locale, setLocale, updateSettings }),
    [controller, settings, setLocale, updateSettings],
  );
  return createElement(OrfinContext.Provider, { value }, children);
}

export const OrfinProvider = OrfinSupport;

export function useOrfin(): OrfinContextValue {
  const context = useContext(OrfinContext);
  if (!context) throw new Error('useOrfin must be used inside OrfinProvider or OrfinSupport.');
  return context;
}
