import type { Section } from '../core/types';
import type { SectionRegistry } from './registry';

export interface TourState {
  index: number;
  sections: Section[];
}

export class TourPlan {
  private unavailable = new Set<string>();

  constructor(
    private readonly candidates: Section[],
    private readonly registry: SectionRegistry,
  ) {}

  skip(id: string) {
    this.unavailable.add(id);
  }

  refresh(current: TourState | undefined, navigation: boolean): TourState | undefined {
    const sections = this.candidates.filter(
      (section) =>
        this.registry.element(section.id) ||
        (navigation &&
          section.path &&
          !this.unavailable.has(section.id) &&
          !this.registry.isPresent(section.id)),
    );
    if (!sections.length) return;
    const previous = current?.sections[current.index];
    if (!previous) return { index: 0, sections };
    const retained = sections.findIndex((section) => section.id === previous.id);
    if (retained !== -1) return { index: retained, sections };
    const previousIndex = this.candidates.findIndex((section) => section.id === previous.id);
    const next = sections.findIndex((section) => this.candidates.indexOf(section) > previousIndex);
    return { index: next === -1 ? sections.length - 1 : next, sections };
  }
}
