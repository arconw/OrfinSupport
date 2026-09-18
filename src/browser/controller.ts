import { defaultSettings, resolveSettings } from '../core/settings';
import { createHttpTransport } from '../core/transport';
import type {
  AssistantSettings,
  BrowserAction,
  ChatMessage,
  ChatTransport,
  Locale,
  Section,
  SettingsInput,
} from '../core/types';
import { spotlightRect } from './geometry';
import type { Rect } from './geometry';
import { resolveTranslations } from './i18n';
import { formatMessage, localizeSection } from '../core/locale';
import { OrfinError, errorMessages, isOrfinErrorCode } from '../core/errors';
import type { OrfinErrorCode } from '../core/errors';
import { SectionMemory } from './memory';
import { availableElement, SectionRegistry } from './registry';
import { navigatePage, pendingSection } from './navigation';
import { TourPlan } from './tour';
import type { TourState } from './tour';

export interface OrfinOptions extends SettingsInput {
  endpoint?: string;
  transport?: ChatTransport;
  sections?: Section[];
  initiallyOpen?: boolean;
  title?: string;
  welcome?: string;
  navigate?: (path: string) => void | Promise<void>;
  allowedPaths?: string[];
  themeVariables?: Record<`--orfin-${string}`, string>;
  nonce?: string;
  onEvent?: (event: { type: string; detail?: unknown }) => void;
  actions?: Record<
    string,
    (
      payload: Record<string, unknown>,
      context: { signal: AbortSignal; controller: OrfinController },
    ) => void | Promise<void>
  >;
}

export interface AssistantState {
  open: boolean;
  busy: boolean;
  picking: boolean;
  preferences: boolean;
  messages: ChatMessage[];
  selectedSection?: Section;
  highlight?: { section: Section; rect: Rect };
  hover?: { section: Section; rect: Rect };
  tour?: TourState;
  error?: OrfinErrorCode;
  errorStatus?: number;
}

export class OrfinController {
  readonly state: AssistantState;
  settings: AssistantSettings;
  readonly registry: SectionRegistry;
  readonly memory: SectionMemory;
  readonly options: OrfinOptions;
  private readonly transport: ChatTransport;
  private listeners = new Set<() => void>();
  private cleanupCallbacks: (() => void)[] = [];
  private abort?: AbortController;
  private lifecycle = new AbortController();
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private highlightTimer?: ReturnType<typeof setTimeout>;
  private hoverId?: string;
  private lastHover = 0;
  private target?: HTMLElement;
  private observer?: ResizeObserver;
  private destroyed = false;
  private tourRevision = 0;
  private highlightRevision = 0;
  private tourPlan?: TourPlan;
  private pageObserver?: MutationObserver;
  private pendingTourStep?: number;

  constructor(options: OrfinOptions) {
    this.options = options;
    this.settings = resolveSettings(options);
    this.registry = new SectionRegistry(options.sections ?? []);
    this.memory = new SectionMemory(this.settings.memory);
    this.transport =
      options.transport ?? createHttpTransport({ endpoint: options.endpoint ?? '/api/orfin' });
    this.state = {
      open: options.initiallyOpen ?? false,
      busy: false,
      picking: false,
      preferences: false,
      messages: [],
    };
    this.bind();
    const pending = pendingSection(this.settings.memory.key);
    if (pending)
      queueMicrotask(() => {
        if (this.settings.features.navigation) void this.highlight(pending);
      });
  }

  get text() {
    return resolveTranslations(this.settings.locale, this.settings.translations);
  }
  get errorMessage() {
    const code = this.state.error;
    return code
      ? this.text[errorMessages[code]] +
          (this.state.errorStatus ? ` (${this.state.errorStatus})` : '')
      : undefined;
  }
  sectionText(section: Section) {
    return localizeSection(section, this.settings.locale);
  }
  setLocale(locale: Locale) {
    this.updateSettings({ locale });
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  onCleanup(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }
  private emit(type?: string, detail?: unknown) {
    if (this.destroyed) return;
    for (const listener of this.listeners) listener();
    if (type) this.options.onEvent?.({ type, detail });
  }
  open() {
    this.refreshContext();
    this.state.open = true;
    this.dismissHover();
    this.emit('open');
  }
  close() {
    this.state.open = false;
    this.state.preferences = false;
    this.emit('close');
  }
  toggle() {
    if (this.state.open) this.close();
    else this.open();
  }
  preferences() {
    this.state.preferences = !this.state.preferences;
    this.emit();
  }

  updateSettings(input: SettingsInput) {
    const previousMemory = this.settings.memory;
    this.settings = resolveSettings(input, this.settings);
    if (JSON.stringify(previousMemory) !== JSON.stringify(this.settings.memory))
      this.memory.configure(this.settings.memory);
    if (!this.settings.features.hoverHelp) this.dismissHover();
    if (!this.settings.features.tour) this.endTour();
    if (!this.settings.features.sectionPicker) this.cancelPick();
    if (!this.settings.features.chat) this.stop();
    if (this.settings.features.pageContext === 'sections') this.registry.cleanup();
    this.emit('settings', this.settings);
  }

  clear() {
    this.stop();
    this.state.messages = [];
    this.state.error = undefined;
    this.state.errorStatus = undefined;
    this.state.selectedSection = undefined;
    this.emit('clear');
  }
  stop() {
    this.abort?.abort();
    this.abort = undefined;
    this.state.busy = false;
    this.emit();
  }
  forget() {
    this.memory.clear();
    this.lastHover = 0;
    this.emit('memory-cleared');
  }

  async send(content: string) {
    const text = content.trim().slice(0, 12000);
    if (!text || this.state.busy || !this.settings.features.chat || this.destroyed) return;
    this.open();
    this.state.error = undefined;
    this.state.errorStatus = undefined;
    this.state.busy = true;
    this.state.messages.push({ id: crypto.randomUUID(), role: 'user', content: text });
    const messages = this.state.messages
      .filter((message) => message.content && message.status !== 'error')
      .slice(-40)
      .map(({ role, content }) => ({ role, content: content.slice(0, 12000) }));
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      locale: this.settings.locale,
      content: '',
      status: 'streaming',
      tools: [],
      sources: [],
    };
    this.state.messages.push(reply);
    const abort = new AbortController();
    this.abort = abort;
    this.emit('message', { role: 'user' });
    try {
      for await (const event of this.transport.stream(
        {
          messages,
          page: this.registry.page(
            this.settings.features.pageContext,
            this.state.selectedSection?.id,
            this.settings.locale,
          ),
          features: this.settings.features,
          locale: this.settings.locale,
        },
        abort.signal,
      )) {
        if (abort.signal.aborted) break;
        if (event.type === 'delta') reply.content += event.text;
        if (event.type === 'sources') reply.sources = event.sources;
        if (event.type === 'tool') {
          reply.tools = [
            ...(reply.tools ?? []).filter((tool) => tool.id !== event.tool.id),
            event.tool,
          ];
        }
        if (event.type === 'action') await this.perform(event.action);
        if (event.type === 'error')
          throw new OrfinError(isOrfinErrorCode(event.code) ? event.code : 'reply', event.message);
        this.emit();
      }
      reply.status = abort.signal.aborted ? 'cancelled' : 'complete';
    } catch (error) {
      reply.status = abort.signal.aborted ? 'cancelled' : 'error';
      reply.tools = reply.tools?.map((tool) =>
        tool.status === 'running' ? { ...tool, status: 'error' } : tool,
      );
      if (!abort.signal.aborted) {
        this.state.error = error instanceof OrfinError ? error.code : 'reply';
        this.state.errorStatus = error instanceof OrfinError ? error.status : undefined;
      }
    } finally {
      if (this.abort === abort) {
        this.state.busy = false;
        this.abort = undefined;
      }
      this.emit('reply', { status: reply.status });
    }
  }

  async retry() {
    const index = this.state.messages.findLastIndex((message) => message.role === 'user');
    const message = this.state.messages[index];
    if (!message || this.state.busy) return;
    this.state.messages.splice(index);
    await this.send(message.content);
  }

  async explain(section: Section) {
    this.dismissHover();
    this.cancelPick();
    if (await this.highlight(section.id)) {
      this.state.selectedSection = section;
      this.memory.remember(section.id, 'visited');
    }
    await this.send(formatMessage(this.text.explain, { title: this.sectionText(section).title }));
  }

  pick() {
    if (!this.settings.features.sectionPicker) return;
    this.endTour();
    this.dismissHover();
    this.state.picking = true;
    this.state.open = false;
    this.registry.discover(this.settings.features.pageContext);
    this.emit('pick-start');
  }
  cancelPick() {
    this.state.picking = false;
    if (!this.state.tour) this.clearHighlight();
    this.emit();
  }
  dismissHover(decision?: 'visited' | 'dismissed') {
    clearTimeout(this.hoverTimer);
    if (decision && this.state.hover) this.memory.remember(this.state.hover.section.id, decision);
    this.state.hover = undefined;
    this.emit();
  }

  private refreshContext = () => {
    const selected = this.state.selectedSection;
    if (!this.state.tour && selected && !this.registry.element(selected.id)) {
      this.state.selectedSection = undefined;
      this.emit();
    }
  };

  private position = () => {
    this.refreshContext();
    const tour = this.state.tour;
    if (tour && this.tourPlan && this.pendingTourStep === undefined) {
      const current = tour.sections[tour.index]!;
      if (this.target && !this.target.isConnected) this.tourPlan.skip(current.id);
      const next = this.tourPlan.refresh(tour, this.settings.features.navigation);
      if (!next) {
        this.state.selectedSection = undefined;
        this.endTour();
        this.open();
        return;
      }
      this.state.tour = next;
      const section = next.sections[next.index]!;
      if (section.id !== current.id || this.registry.element(section.id) !== this.target) {
        void this.tourStep(next.index);
        return;
      }
    }
    if (this.target && availableElement(this.target) && this.state.highlight) {
      this.state.highlight.rect = spotlightRect(this.target);
      this.emit();
    } else if (this.state.highlight) this.clearHighlight();
    if (this.state.hover) {
      const element = this.registry.element(this.state.hover.section.id);
      if (element) {
        this.state.hover.rect = spotlightRect(element);
        this.emit();
      } else this.dismissHover();
    }
  };

  private resize = () => {
    if (this.state.tour && this.target && availableElement(this.target))
      this.target.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
    this.position();
  };

  private showHighlight(section: Section, element: HTMLElement) {
    clearTimeout(this.highlightTimer);
    this.observer?.disconnect();
    this.target = element;
    this.state.highlight = { section, rect: spotlightRect(element) };
    this.observer = new ResizeObserver(this.position);
    this.observer.observe(element);
    this.emit('highlight', { sectionId: section.id });
  }
  clearHighlight() {
    this.highlightRevision++;
    clearTimeout(this.highlightTimer);
    this.observer?.disconnect();
    this.target = undefined;
    this.state.highlight = undefined;
    this.emit();
  }

  async highlight(id: string, persistent = false) {
    const revision = ++this.highlightRevision;
    const section = this.registry
      .discover(this.settings.features.pageContext)
      .find((section) => section.id === id);
    if (!section || this.destroyed) return false;
    if (this.registry.isPresent(id) && !this.registry.element(id)) return false;
    if (!this.registry.element(id) && section.path) {
      if (!this.settings.features.navigation) return false;
      await this.navigate(section.path, id);
    }
    if (this.registry.isPresent(id) && !this.registry.element(id)) return false;
    const element = await this.registry.waitForElement(id, this.lifecycle.signal);
    if (!element || this.destroyed || revision !== this.highlightRevision) return false;
    element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
    this.showHighlight(section, element);
    if (!persistent)
      this.highlightTimer = setTimeout(
        () => this.clearHighlight(),
        this.settings.highlightDuration,
      );
    return true;
  }

  async navigate(path: string, sectionId?: string) {
    if (!this.settings.features.navigation || this.destroyed) return;
    if (!this.state.tour) this.state.selectedSection = undefined;
    this.dismissHover();
    const destination = await navigatePage({
      path,
      sectionId,
      allowedPaths:
        this.options.allowedPaths ??
        this.registry
          .discover(this.settings.features.pageContext)
          .flatMap((section) => (section.path ? [section.path] : [])),
      storageKey: this.settings.memory.key,
      navigate: this.options.navigate,
    });
    this.emit('navigate', { path: destination });
  }

  async startTour() {
    if (!this.settings.features.tour) return;
    if (this.state.tour) this.endTour();
    this.cancelPick();
    this.dismissHover();
    const discovered = this.registry.discover(this.settings.features.pageContext, true);
    const ordered = discovered
      .filter((section) => section.tourOrder !== undefined)
      .sort((a, b) => a.tourOrder! - b.tourOrder!);
    this.tourPlan = new TourPlan(ordered, this.registry);
    let tour = this.tourPlan.refresh(undefined, this.settings.features.navigation);
    if (!tour) {
      this.tourPlan = new TourPlan(
        discovered.filter((section) => this.registry.element(section.id)),
        this.registry,
      );
      tour = this.tourPlan.refresh(undefined, this.settings.features.navigation);
    }
    if (!tour) {
      this.tourPlan = undefined;
      return;
    }
    this.state.tour = tour;
    this.state.open = false;
    await this.tourStep(0);
  }
  async tourStep(index: number) {
    const tour = this.state.tour;
    if (!tour) return;
    if (index >= tour.sections.length) {
      this.endTour();
      this.open();
      return;
    }
    tour.index = Math.max(0, index);
    const section = tour.sections[tour.index]!;
    const revision = ++this.tourRevision;
    this.pendingTourStep = revision;
    clearTimeout(this.highlightTimer);
    this.state.selectedSection = section;
    this.emit('tour-step', { index: tour.index, sectionId: section.id });
    let highlighted = false;
    try {
      highlighted = await this.highlight(section.id, true);
    } catch {
      highlighted = false;
    }
    if (revision !== this.tourRevision) return;
    this.pendingTourStep = undefined;
    if (highlighted) this.memory.remember(section.id, 'visited');
    else this.tourPlan?.skip(section.id);
    this.position();
  }
  endTour() {
    this.tourRevision++;
    this.pendingTourStep = undefined;
    this.tourPlan = undefined;
    this.state.tour = undefined;
    this.clearHighlight();
    this.emit('tour-end');
  }
  askDuringTour() {
    this.open();
    this.emit('focus-input');
  }

  private async perform(action: BrowserAction) {
    if (action.type === 'custom') {
      if (!this.settings.features.tools) return;
      const handler = Object.hasOwn(this.options.actions ?? {}, action.name)
        ? this.options.actions?.[action.name]
        : undefined;
      if (
        !handler ||
        !action.payload ||
        typeof action.payload !== 'object' ||
        Array.isArray(action.payload)
      )
        throw new OrfinError('reply', 'Project action unavailable or invalid.');
      await handler(action.payload, {
        signal: this.abort?.signal ?? this.lifecycle.signal,
        controller: this,
      });
      this.emit('action', { name: action.name });
    }
    if (action.type === 'highlight' && this.settings.features.sectionPicker)
      await this.highlight(action.sectionId);
    if (action.type === 'navigate' && this.settings.features.navigation) {
      await this.navigate(action.path, action.sectionId);
      if (action.sectionId) await this.highlight(action.sectionId);
    }
    if (action.type === 'tour' && this.settings.features.tour) await this.startTour();
  }

  private bind() {
    const signal = this.lifecycle.signal;
    this.pageObserver = new MutationObserver(this.position);
    this.pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'class',
        'style',
        'hidden',
        'aria-hidden',
        'inert',
        'data-orfin-private',
        'data-orfin-section',
      ],
    });
    window.addEventListener('popstate', this.refreshContext, { signal });
    window.addEventListener('hashchange', this.refreshContext, { signal });
    document.addEventListener(
      'pointermove',
      (event) => {
        if (
          event.pointerType === 'touch' ||
          event
            .composedPath()
            .some((node) => node instanceof Element && node.hasAttribute('data-orfin-root'))
        )
          return;
        const section = this.registry.fromTarget(event.target, this.settings.features.pageContext);
        if (this.state.picking) {
          const element = section ? this.registry.element(section.id) : undefined;
          if (section && element && this.state.highlight?.section.id !== section.id)
            this.showHighlight(section, element);
          else if (!section) this.clearHighlight();
          return;
        }
        if (
          !this.settings.features.hoverHelp ||
          this.state.tour ||
          this.state.open ||
          this.state.busy
        )
          return;
        if (section?.id === this.hoverId) return;
        this.hoverId = section?.id;
        clearTimeout(this.hoverTimer);
        if (
          !section ||
          this.memory.has(section.id) ||
          Date.now() - this.lastHover < this.settings.hoverCooldown
        )
          return;
        this.hoverTimer = setTimeout(() => {
          if (this.state.open || this.state.tour || this.state.picking) return;
          const element = this.registry.element(section.id);
          if (element) {
            this.state.hover = { section, rect: spotlightRect(element) };
            this.lastHover = Date.now();
            this.emit('hover', { sectionId: section.id });
          }
        }, this.settings.hoverDelay);
      },
      { signal, passive: true },
    );
    document.addEventListener(
      'click',
      (event) => {
        if (
          event
            .composedPath()
            .some((node) => node instanceof Element && node.hasAttribute('data-orfin-root'))
        )
          return;
        if (this.state.picking) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const section = this.registry.fromTarget(
            event.target,
            this.settings.features.pageContext,
          );
          if (section) void this.explain(section);
          return;
        }
        this.dismissHover();
      },
      { signal, capture: true },
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          this.dismissHover();
          this.cancelPick();
          this.endTour();
          this.close();
        }
      },
      { signal },
    );
    window.addEventListener('scroll', this.position, { signal, capture: true, passive: true });
    window.addEventListener('resize', this.resize, { signal, passive: true });
    window.addEventListener(
      'blur',
      () => {
        this.hoverId = undefined;
        this.dismissHover();
      },
      { signal },
    );
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    this.destroyed = true;
    this.lifecycle.abort();
    clearTimeout(this.hoverTimer);
    clearTimeout(this.highlightTimer);
    this.observer?.disconnect();
    this.pageObserver?.disconnect();
    this.registry.cleanup();
    this.listeners.clear();
    for (const cleanup of this.cleanupCallbacks) cleanup();
  }
}

export { defaultSettings };
