import type { MemoryOptions } from '../core/types';

type Decision = 'visited' | 'dismissed';
type Entry = { decision: Decision; expires: number };

export class SectionMemory {
  private entries: Record<string, Entry> = Object.create(null);
  constructor(private options: MemoryOptions) {
    this.read();
  }

  configure(options: MemoryOptions) {
    this.options = options;
    this.entries = Object.create(null);
    this.read();
  }
  private storage(): Storage | undefined {
    try {
      return this.options.storage === 'local'
        ? localStorage
        : this.options.storage === 'session'
          ? sessionStorage
          : undefined;
    } catch {
      return undefined;
    }
  }
  private read() {
    try {
      const parsed: unknown = JSON.parse(this.storage()?.getItem(this.options.key) ?? '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [id, entry] of Object.entries(parsed)) {
          if (
            entry &&
            typeof entry === 'object' &&
            'expires' in entry &&
            typeof entry.expires === 'number' &&
            entry.expires > Date.now() &&
            'decision' in entry &&
            ['visited', 'dismissed'].includes(String(entry.decision))
          )
            this.entries[id] = entry as Entry;
        }
      }
    } catch {
      this.entries = Object.create(null);
    }
  }
  has(id: string): boolean {
    const entry = this.entries[id];
    return Boolean(
      entry &&
      entry.expires > Date.now() &&
      (entry.decision === 'visited'
        ? this.options.rememberVisited
        : this.options.rememberDismissed),
    );
  }
  remember(id: string, decision: Decision) {
    if (decision === 'visited' ? !this.options.rememberVisited : !this.options.rememberDismissed)
      return;
    this.entries[id] = { decision, expires: Date.now() + this.options.ttlMs };
    try {
      this.storage()?.setItem(this.options.key, JSON.stringify(this.entries));
    } catch {
      return;
    }
  }
  clear() {
    this.entries = Object.create(null);
    try {
      this.storage()?.removeItem(this.options.key);
    } catch {
      return;
    }
  }
}
