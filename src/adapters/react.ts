'use client';

import { useEffect, useRef } from 'react';
import { createOrfin } from '../index';
import type { OrfinController, OrfinOptions } from '../index';

export interface OrfinSupportProps {
  options: OrfinOptions;
  onReady?: (controller: OrfinController) => void;
}

export function OrfinSupport({ options, onReady }: OrfinSupportProps) {
  const latest = useRef({ options, onReady });
  latest.current = { options, onReady };
  const controller = useRef<OrfinController | null>(null);
  useEffect(() => {
    const instance = createOrfin(latest.current.options);
    controller.current = instance;
    latest.current.onReady?.(instance);
    return () => {
      instance.destroy();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    controller.current?.updateSettings(options);
  }, [options]);
  return null;
}
