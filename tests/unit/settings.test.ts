import { describe, expect, it, afterEach, vi } from 'vitest';
import { defaultSettings, resolveSettings } from '../../src/core/settings';
import { SectionMemory } from '../../src/browser/memory';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('settings and memory', () => {
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
