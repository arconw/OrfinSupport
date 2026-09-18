import { describe, expect, it, afterEach, vi } from 'vitest';
import { defaultSettings, resolveSettings } from '../../src/core/settings';
import { SectionMemory } from '../../src/browser/memory';
import { supportedThemes, themePresets } from '../../src/core/themes';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('settings and memory', () => {
  it('provides five light and five dark accessible theme palettes', () => {
    const luminance = (hex: string) => {
      const rgb = hex
        .slice(1)
        .match(/../g)!
        .map((channel) => parseInt(channel, 16) / 255)
        .map((channel) =>
          channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
        );
      return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
    };
    const contrast = (a: string, b: string) =>
      (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    expect(supportedThemes.filter((name) => themePresets[name].scheme === 'light')).toHaveLength(5);
    expect(supportedThemes.filter((name) => themePresets[name].scheme === 'dark')).toHaveLength(5);
    for (const theme of Object.values(themePresets)) {
      for (const surface of [theme.surface, theme.soft])
        for (const ink of [theme.text, theme.muted, theme.accent])
          expect(contrast(ink, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('updates and resets the logo while bounding spotlight opacity and motion', () => {
    const configured = resolveSettings({
      logo: { src: '/logo.svg', alt: 'Studio' },
      highlightOpacity: 4,
      highlightTransition: -1,
    });
    expect(configured).toMatchObject({
      logo: { src: '/logo.svg', alt: 'Studio' },
      highlightOpacity: 1,
      highlightTransition: 0,
    });
    expect(resolveSettings({ logo: null, highlightOpacity: NaN }, configured)).toMatchObject({
      logo: null,
      highlightOpacity: 1,
    });
  });
  it('merges nested settings without leaking provider or callback fields', () => {
    const config = {
      features: { hoverHelp: false },
      transport: { stream: 'PRIVATE_TRANSPORT' },
      theme: 'iris' as const,
    };
    const resolved = resolveSettings(config);
    expect(resolved.features.chat).toBe(true);
    expect(resolved.features.hoverHelp).toBe(false);
    expect(resolved.theme).toBe('iris');
    expect(resolved).not.toHaveProperty('transport');
    expect(defaultSettings.features.hoverHelp).toBe(true);
  });
  it('changes motion independently from themes and preserves the choice across other updates', () => {
    const unthemed = resolveSettings({ theme: 'none', motion: 'none' });
    expect(resolveSettings({ theme: 'forest', locale: 'ar' }, unthemed)).toMatchObject({
      theme: 'forest',
      locale: 'ar',
      motion: 'none',
    });
    expect(resolveSettings({ motion: 'auto' }, unthemed).motion).toBe('auto');
    expect(defaultSettings.motion).toBe('auto');
  });
  it('keeps in-memory decisions and expires them after their TTL', () => {
    vi.useFakeTimers();
    const memory = new SectionMemory({ ...defaultSettings.memory, storage: 'none', ttlMs: 1000 });
    memory.remember('section', 'dismissed');
    expect(memory.has('section')).toBe(true);
    vi.advanceTimersByTime(1001);
    expect(memory.has('section')).toBe(false);
  });
  it('recovers from blocked and corrupt storage', () => {
    vi.stubGlobal('sessionStorage', {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    });
    const memory = new SectionMemory(defaultSettings.memory);
    memory.remember('projects', 'visited');
    expect(memory.has('projects')).toBe(true);
    memory.clear();
    expect(memory.has('projects')).toBe(false);
    vi.stubGlobal('sessionStorage', { getItem: () => '{broken' });
    expect(new SectionMemory(defaultSettings.memory).has('projects')).toBe(false);
  });
  it('persists only section choices and can forget them', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key),
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    const memory = new SectionMemory(defaultSettings.memory);
    memory.remember('projects', 'dismissed');
    const next = new SectionMemory(defaultSettings.memory);
    expect(next.has('projects')).toBe(true);
    expect(JSON.parse(storage.values().next().value!)).toEqual({
      projects: { decision: 'dismissed', expires: expect.any(Number) },
    });
    next.clear();
    expect(storage.size).toBe(0);
  });
});
