import type { PageContext, Section } from '../core/types';
import { localizeSection } from '../core/locale';

const excluded =
  'script,style,noscript,input,textarea,select,[contenteditable],[data-orfin-private],[data-orfin-root],[hidden],[aria-hidden="true"]';

export function availableElement(element: HTMLElement): boolean {
  if (
    !element.isConnected ||
    element.closest(
      '[data-orfin-private],[data-orfin-root],[hidden],[aria-hidden="true"],[inert]',
    ) ||
    !element.checkVisibility({ visibilityProperty: true, opacityProperty: true })
  )
    return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function visibleText(element: Element, limit = 12000): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(excluded) || !parent.checkVisibility())
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let text = '';
  while (walker.nextNode() && text.length < limit)
    text += ` ${walker.currentNode.textContent?.trim() ?? ''}`;
  return text.replace(/\s+/g, ' ').trim().slice(0, limit);
}

export class SectionRegistry {
  constructor(
    private readonly catalog: Section[],
    private readonly root: ParentNode = document,
  ) {}

  element(id: string): HTMLElement | undefined {
    return Array.from(this.root.querySelectorAll<HTMLElement>('[data-orfin-section]')).find(
      (element) => element.dataset.orfinSection === id && availableElement(element),
    );
  }

  isPresent(id: string): boolean {
    return Array.from(this.root.querySelectorAll<HTMLElement>('[data-orfin-section]')).some(
      (element) => element.dataset.orfinSection === id,
    );
  }

  waitForElement(id: string, signal: AbortSignal): Promise<HTMLElement | undefined> {
    if (signal.aborted) return Promise.resolve(undefined);
    const found = this.element(id);
    if (found) return Promise.resolve(found);
    return new Promise((resolve) => {
      const finish = (element?: HTMLElement) => {
        observer.disconnect();
        clearTimeout(timeout);
        signal.removeEventListener('abort', cancel);
        resolve(element);
      };
      const observer = new MutationObserver(() => {
        const element = this.element(id);
        if (element) finish(element);
      });
      const cancel = () => finish();
      const timeout = setTimeout(() => finish(), 4000);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      signal.addEventListener('abort', cancel, { once: true });
    });
  }

  discover(mode: 'sections' | 'page', includeUnavailable = false): Section[] {
    if (mode === 'page') {
      for (const [index, element] of Array.from(
        this.root.querySelectorAll<HTMLElement>('main section, main article, main [role="region"]'),
      ).entries()) {
        if (
          !element.hasAttribute('data-orfin-section') &&
          !element.closest('[data-orfin-private],[data-orfin-root]')
        ) {
          element.dataset.orfinSection = `page-${index}`;
          element.dataset.orfinDiscovered = 'true';
        }
      }
    }
    const sections = new Map(this.catalog.map((section) => [section.id, section]));
    for (const element of this.root.querySelectorAll<HTMLElement>('[data-orfin-section]')) {
      const id = element.dataset.orfinSection;
      if (
        !id ||
        !/^[\w-]{1,100}$/.test(id) ||
        element.closest('[data-orfin-private],[data-orfin-root]') ||
        (!includeUnavailable && !availableElement(element)) ||
        (mode === 'sections' && element.dataset.orfinDiscovered)
      )
        continue;
      if (!sections.has(id))
        sections.set(id, {
          id,
          title: (
            element.dataset.orfinTitle ??
            element.querySelector('h1,h2,h3,h4')?.textContent ??
            id
          )
            .trim()
            .slice(0, 200),
          description: (element.dataset.orfinDescription ?? visibleText(element, 2000)).slice(
            0,
            2000,
          ),
          path: location.pathname,
          ...(element.dataset.orfinOrder ? { tourOrder: Number(element.dataset.orfinOrder) } : {}),
        });
    }
    return [...sections.values()].slice(0, 100);
  }

  fromTarget(target: EventTarget | null, mode: 'sections' | 'page'): Section | undefined {
    if (!(target instanceof Element)) return;
    this.discover(mode);
    const element = target.closest<HTMLElement>('[data-orfin-section]');
    if (!element || !availableElement(element)) return;
    return this.discover(mode).find((section) => section.id === element.dataset.orfinSection);
  }

  page(mode: 'sections' | 'page', selectedSectionId?: string, locale = 'en'): PageContext {
    return {
      url: `${location.origin}${location.pathname}`,
      title: document.title.slice(0, 300),
      sections: this.discover(mode).map((source) => {
        const {
          prompt: _prompt,
          translations: _translations,
          ...section
        } = localizeSection(source, locale);
        return section;
      }),
      ...(selectedSectionId ? { selectedSectionId } : {}),
      ...(mode === 'page'
        ? { text: visibleText(document.querySelector('main') ?? document.body) }
        : {}),
    };
  }

  cleanup() {
    for (const element of this.root.querySelectorAll<HTMLElement>('[data-orfin-discovered]')) {
      delete element.dataset.orfinSection;
      delete element.dataset.orfinDiscovered;
    }
  }
}
