import { html, render, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { live } from 'lit/directives/live.js';
import { OrfinController } from './controller';
import type { AssistantState } from './controller';
import { popoverPosition } from './geometry';
import { icon } from './icons';
import { createLogoRenderer } from './logo';
import { themePresets } from '../core/themes';
import { widgetStyles } from './styles';
import { layoutStyles } from './layout';
import { localeDirection, formatMessage } from '../core/locale';
import { keyed } from 'lit/directives/keyed.js';
import { Presence, motionDuration } from './presence';
import { createActionsMenu } from './actions';
import { createMessageRenderer } from './messages';
import { renderPreferences } from './preferences';

export function mountWidget(controller: OrfinController): HTMLElement {
  const host = document.createElement('div');
  host.setAttribute('data-orfin-root', '');
  host.setAttribute('popover', 'manual');
  for (const [name, value] of Object.entries({
    all: 'initial',
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    padding: '0',
    border: 'none',
    background: 'transparent',
    overflow: 'visible',
    'pointer-events': 'none',
    'z-index': '2147483647',
  }))
    host.style.setProperty(name, value, 'important');
  for (const [name, value] of Object.entries(controller.options.themeVariables ?? {}))
    if (name.startsWith('--orfin-')) host.style.setProperty(name, value);
  const shadow = host.attachShadow({ mode: 'open' });
  const [layout, preset, custom] = ['layout', 'preset', 'custom'].map((name) => {
    const style = document.createElement('style');
    style.dataset.orfinStyle = name;
    if (controller.options.nonce) style.nonce = controller.options.nonce;
    shadow.append(style);
    return style;
  });
  layout!.textContent = layoutStyles.cssText;
  const container = document.createElement('div');
  shadow.append(container);
  document.body.append(host);
  try {
    host.showPopover();
  } catch {
    host.removeAttribute('popover');
  }
  const logo = createLogoRenderer(() => update());
  let renderedHighlight = controller.state.highlight;
  let highlightVisible = false;
  let highlightExit: ReturnType<typeof setTimeout> | undefined;
  let highlightFrame = 0;
  let draft = '';
  let wasOpen = false;
  let wasTourVisible = false;
  let lastCount = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const panelPresence = new Presence<AssistantState>(() => update());
  const preferencesPresence = new Presence<boolean>(() => update());
  const hoverPresence = new Presence<{
    position: ReturnType<typeof popoverPosition>;
    section: NonNullable<AssistantState['hover']>['section'];
  }>(() => update());
  const tourPresence = new Presence<{
    position: ReturnType<typeof popoverPosition>;
    tour: NonNullable<AssistantState['tour']>;
    section: ReturnType<OrfinController['sectionText']>;
    progress: string;
  }>(() => update());
  const actions = createActionsMenu(controller, shadow, () => update());
  const message = createMessageRenderer(controller, logo);
  let lastLocale = controller.settings.locale;
  let copyPhase: 'a' | 'b' | undefined;
  const mediaChanged = () => update();
  reducedMotion.addEventListener('change', mediaChanged);

  const submit = () => {
    const value = draft;
    if (!value.trim() || controller.state.busy) return;
    draft = '';
    void controller.send(value);
  };
  const focusInput = () => {
    queueMicrotask(() => shadow.querySelector<HTMLTextAreaElement>('textarea')?.focus());
  };
  const suggestion = (label: string, type: 'tour' | 'pick' | 'page', action: () => void) =>
    html`<button class="suggestion" part="suggestion" @click=${action}>
      <span class="suggestion-icon" part="suggestion-icon">${icon(type)}</span
      ><span>${label}</span>${icon('chevron')}
    </button>`;

  const update = () => {
    const { state, settings, text } = controller;
    const theme = settings.theme === 'none' ? undefined : themePresets[settings.theme];
    const presetCSS = theme ? widgetStyles.cssText : '';
    if (preset!.textContent !== presetCSS) preset!.textContent = presetCSS;
    if (custom!.textContent !== settings.styles) custom!.textContent = settings.styles;
    host.dataset.theme = settings.theme;
    const motionEnabled = settings.motion !== 'none' && !reducedMotion.matches;
    const exitDuration = motionEnabled ? motionDuration(shadow, '--motion-exit', 180) : 0;
    panelPresence.reconcile(state.open ? { ...state } : undefined, exitDuration);
    const panelState = panelPresence.value;
    preferencesPresence.reconcile(state.open && state.preferences ? true : undefined, exitDuration);
    if (!state.open || state.preferences || !settings.features.chat) actions.reset();
    if (lastLocale !== settings.locale) {
      copyPhase = copyPhase === 'a' ? 'b' : 'a';
      lastLocale = settings.locale;
    }
    if (state.highlight) {
      clearTimeout(highlightExit);
      highlightExit = undefined;
      const entering = !renderedHighlight;
      renderedHighlight = state.highlight;
      if (entering) {
        highlightVisible = false;
        cancelAnimationFrame(highlightFrame);
        highlightFrame = requestAnimationFrame(() => {
          highlightFrame = 0;
          highlightVisible = !!controller.state.highlight;
          update();
        });
      } else if (!highlightFrame) highlightVisible = true;
    } else if (renderedHighlight && !highlightExit) {
      highlightVisible = false;
      const duration = motionEnabled ? settings.highlightTransition : 0;
      highlightExit = setTimeout(() => {
        renderedHighlight = undefined;
        highlightExit = undefined;
        update();
      }, duration);
    }
    const conversation = shadow.querySelector('[role="log"]');
    const atBottom =
      !conversation ||
      conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 70;
    const step = state.tour?.sections[state.tour.index];
    const currentSection = step ? controller.sectionText(step) : undefined;
    const progress = state.tour
      ? formatMessage(text.stepProgress, {
          current: new Intl.NumberFormat(settings.locale).format(state.tour.index + 1),
          total: new Intl.NumberFormat(settings.locale).format(state.tour.sections.length),
        })
      : '';
    host.lang = settings.locale;
    host.dir = localeDirection(settings.locale);
    const hoverPosition = state.hover ? popoverPosition(state.hover.rect, 300, 158) : undefined;
    const tourPosition =
      state.highlight && state.tour && !state.open
        ? popoverPosition(state.highlight.rect, 300, 244)
        : undefined;
    hoverPresence.reconcile(
      state.hover && hoverPosition
        ? { section: state.hover.section, position: hoverPosition }
        : undefined,
      exitDuration,
    );
    tourPresence.reconcile(
      state.tour && currentSection && tourPosition
        ? { tour: state.tour, section: currentSection, position: tourPosition, progress }
        : undefined,
      exitDuration,
    );
    const hoverFrame = hoverPresence.value;
    const tourFrame = tourPresence.value;
    render(
      html`<div
        class="orfin"
        part="orfin"
        data-theme=${settings.theme}
        data-motion=${motionEnabled ? 'auto' : 'none'}
        data-copy=${copyPhase ?? nothing}
        data-header=${theme?.header ?? nothing}
        style=${styleMap({
          ...(theme
            ? Object.fromEntries(
                ['accent', 'surface', 'soft', 'text', 'muted', 'border', 'radius', 'shadow'].map(
                  (key) => [
                    `--${key === 'border' ? 'line' : key}`,
                    `var(--orfin-${key}, ${theme[key as keyof typeof theme]})`,
                  ],
                ),
              )
            : {}),
          colorScheme: theme?.scheme ?? 'normal',
          '--spotlight-opacity': String(settings.highlightOpacity),
          '--spotlight-transition': `${motionEnabled ? settings.highlightTransition : 0}ms`,
        })}
        lang=${settings.locale}
        dir=${localeDirection(settings.locale)}
      >
        ${renderedHighlight ? html`<div class="spotlight" part="spotlight" data-visible=${highlightVisible} data-testid="spotlight" style=${styleMap({ top: `${renderedHighlight.rect.top}px`, left: `${renderedHighlight.rect.left}px`, width: `${renderedHighlight.rect.width}px`, height: `${renderedHighlight.rect.height}px` })}><span class="spot-label" part="spot-label">${controller.sectionText(renderedHighlight.section).title}</span></div>` : nothing}
        ${
          state.picking
            ? html`<div class="picker-bar" part="picker-bar" role="status">
                  ${icon('pick')}<span>${text.select}</span><small>${text.escape}</small
                  ><button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.cancelPick()}
                  >
                    ${icon('close')}
                  </button>
                </div>
                <details class="section-list" part="section-list">
                  <summary>${text.pick}</summary>
                  ${controller.registry
                    .discover(settings.features.pageContext)
                    .filter((section) => controller.registry.element(section.id))
                    .map(
                      (section) =>
                        html`<button @click=${() => void controller.explain(section)}>
                          ${controller.sectionText(section).title}
                        </button>`,
                    )}
                </details>`
            : nothing
        }
        ${
          hoverFrame
            ? html`<section
                class="popover"
                part="popover"
                data-visible=${hoverPresence.visible}
                data-exiting=${hoverPresence.exiting}
                ?inert=${hoverPresence.exiting}
                aria-hidden=${hoverPresence.exiting ? 'true' : nothing}
                role="dialog"
                aria-label=${text.hover}
                style=${styleMap({ top: `${hoverFrame.position.top}px`, left: `${hoverFrame.position.left}px`, maxHeight: `${innerHeight - hoverFrame.position.top - 12}px` })}
              >
                <div class="popover-top" part="popover-top">
                  ${logo(controller.settings.logo, 20, state.busy)}<span>Orfin</span
                  ><button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.dismissHover()}
                  >
                    ${icon('close', 14)}
                  </button>
                </div>
                <p>${text.hover}</p>
                <div class="popover-actions" part="popover-actions">
                  <button
                    class="secondary"
                    part="secondary"
                    @click=${() => controller.dismissHover('dismissed')}
                  >
                    ${text.no}</button
                  ><button
                    class="primary"
                    part="primary"
                    @click=${() => void controller.explain(hoverFrame.section)}
                  >
                    ${text.yes}${icon('arrow', 14)}
                  </button>
                </div>
              </section>`
            : nothing
        }
        ${
          tourFrame
            ? html`<section
                class="popover tour-popover"
                part="popover tour-popover"
                data-visible=${tourPresence.visible}
                data-exiting=${tourPresence.exiting}
                ?inert=${tourPresence.exiting}
                aria-hidden=${tourPresence.exiting ? 'true' : nothing}
                role="dialog"
                aria-label=${text.guidedTour}
                style=${styleMap({ top: `${tourFrame.position.top}px`, left: `${tourFrame.position.left}px`, maxHeight: `${innerHeight - tourFrame.position.top - 12}px` })}
              >
                <div class="popover-top" part="popover-top">
                  ${logo(controller.settings.logo, 20, state.busy)}<span
                    >Orfin · ${tourFrame.progress}</span
                  ><button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.exit}
                    @click=${() => controller.endTour()}
                  >
                    ${icon('close', 14)}
                  </button>
                </div>
                ${keyed(
                  tourFrame.section.id,
                  html`<div class="tour-copy" part="tour-copy">
                    <h3>${tourFrame.section.title}</h3>
                    <p>${tourFrame.section.description}</p>
                  </div>`,
                )}
                <div class="popover-actions" part="popover-actions">
                  <button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.back}
                    ?disabled=${tourFrame.tour.index === 0}
                    @click=${() => void controller.tourStep(tourFrame.tour!.index - 1)}
                  >
                    ${icon('back', 15)}</button
                  ><button
                    class="secondary"
                    part="secondary"
                    @click=${() => {
                      controller.askDuringTour();
                      focusInput();
                    }}
                  >
                    ${text.ask}${icon('help', 14)}</button
                  ><button
                    class="primary"
                    part="primary"
                    @click=${() => void controller.tourStep(tourFrame.tour!.index + 1)}
                  >
                    ${tourFrame.tour.index === tourFrame.tour.sections.length - 1 ? text.finish : text.next}${icon('arrow', 14)}
                  </button>
                </div>
                <div class="tour-progress" part="tour-progress">
                  ${tourFrame.tour.sections.map((_, index) => html`<i class=${index <= tourFrame.tour!.index ? 'active' : ''}></i>`)}
                </div>
              </section>`
            : nothing
        }
        ${
          panelState
            ? html`<section
                class="panel"
                part="panel"
                id="orfin-panel"
                data-visible=${panelPresence.visible}
                data-exiting=${panelPresence.exiting}
                ?inert=${panelPresence.exiting}
                aria-hidden=${panelPresence.exiting ? 'true' : nothing}
                role="dialog"
                aria-label="Orfin"
                aria-modal="false"
              >
                <header class="header" part="header" role="presentation">
                  <div class="avatar" part="avatar">
                    ${logo(controller.settings.logo, 30, state.busy)}
                  </div>
                  <div class="heading" part="heading">
                    <h2>Orfin</h2>
                    <div class="status" part="status">
                      <i></i
                      >${panelState.busy ? (panelState.messages.at(-1)?.content ? text.replying : text.thinking) : text.online}
                    </div>
                  </div>
                  <button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.settings}
                    aria-pressed=${panelState.preferences}
                    @click=${() => controller.preferences()}
                  >
                    ${icon('settings')}</button
                  ><button
                    class="icon-button"
                    part="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.close()}
                  >
                    ${icon('close')}
                  </button>
                </header>
                ${
                  panelState.tour
                    ? html`<nav
                        class="tour-inline"
                        part="tour-inline"
                        aria-label=${text.tourControls}
                      >
                        <button
                          class="icon-button"
                          part="icon-button"
                          aria-label=${text.back}
                          ?disabled=${panelState.tour.index === 0}
                          @click=${() => void controller.tourStep(panelState.tour!.index - 1)}
                        >
                          ${icon('back', 15)}</button
                        ><span>${progress}</span
                        ><button
                          class="secondary"
                          part="secondary"
                          @click=${() => {
                            controller.close();
                          }}
                        >
                          ${text.returnToTour}</button
                        ><button
                          class="primary"
                          part="primary"
                          @click=${() => void controller.tourStep(panelState.tour!.index + 1)}
                        >
                          ${panelState.tour.index === panelState.tour.sections.length - 1 ? text.finish : text.next}
                        </button>
                      </nav>`
                    : nothing
                }
                <div class="panel-body" part="panel-body">
                  <div
                    class="chat-view"
                    part="chat-view"
                    data-active=${!panelState.preferences}
                    ?inert=${panelState.preferences}
                    aria-hidden=${panelState.preferences ? 'true' : nothing}
                  >
                    <div
                      class="conversation"
                      part="conversation"
                      role="log"
                      aria-live="polite"
                      aria-relevant="additions text"
                      aria-label=${text.conversation}
                      aria-busy=${panelState.busy}
                    >
                      ${
                        !panelState.messages.length
                          ? html`<div class="welcome" part="welcome">
                              <div class="welcome-mark" part="welcome-mark">
                                ${logo(controller.settings.logo, 49)}
                              </div>
                              <h3>${controller.options.title ?? text.title}</h3>
                              <p>${controller.options.welcome ?? text.intro}</p>
                              <div class="suggestions" part="suggestions">
                                ${settings.features.tour ? suggestion(text.tour, 'tour', () => void controller.startTour()) : nothing}${settings.features.sectionPicker ? suggestion(text.pick, 'pick', () => controller.pick()) : nothing}${settings.features.chat ? suggestion(text.page, 'page', () => void controller.send(text.pagePrompt)) : nothing}
                              </div>
                            </div>`
                          : repeat(panelState.messages, (message) => message.id, message)
                      }
                      ${panelState.error ? html`<div class="error" part="error" role="alert">${controller.errorMessage}<br /><button part="retry" @click=${() => void controller.retry()}>${text.retry}</button></div>` : nothing}
                    </div>
                    ${
                      settings.features.chat
                        ? html`<div class="composer" part="composer">
                            ${
                              panelState.selectedSection
                                ? html`<div class="context" part="context">
                                    ${icon('pick', 12)}<span
                                      >${controller.sectionText(panelState.selectedSection).title}</span
                                    ><button
                                      class="icon-button"
                                      part="icon-button"
                                      aria-label=${text.clearContext}
                                      @click=${() => {
                                        state.selectedSection = undefined;
                                        update();
                                      }}
                                    >
                                      ${icon('close', 12)}
                                    </button>
                                  </div>`
                                : nothing
                            }
                            <div class="input-wrap" part="input-wrap">
                              <textarea
                                part="input"
                                aria-label=${text.placeholder}
                                placeholder=${text.placeholder}
                                maxlength="12000"
                                rows="2"
                                .value=${live(draft)}
                                @input=${(event: Event) => {
                                  draft = (event.target as HTMLTextAreaElement).value;
                                }}
                                @keydown=${(event: KeyboardEvent) => {
                                  if (
                                    event.key === 'Enter' &&
                                    !event.shiftKey &&
                                    !event.isComposing
                                  ) {
                                    event.preventDefault();
                                    submit();
                                  }
                                }}
                              ></textarea
                              ><button
                                class="send"
                                part="send"
                                aria-label=${panelState.busy ? text.stop : text.send}
                                @click=${() => (panelState.busy ? controller.stop() : submit())}
                              >
                                ${icon(panelState.busy ? 'stop' : 'send', 17)}
                              </button>
                            </div>
                            <div class="composer-actions" part="composer-actions">
                              ${actions.render(exitDuration)}<button
                                class="mini clear-conversation"
                                part="mini"
                                aria-label=${text.clear}
                                @click=${() => controller.clear()}
                              >
                                ${icon('clear')}
                              </button>
                            </div>
                          </div>`
                        : !settings.features.chat
                          ? html`<p class="disabled" part="disabled">${text.disabled}</p>`
                          : nothing
                    }
                  </div>
                  ${preferencesPresence.value ? html`<div class="preferences-view" part="preferences-view" data-visible=${preferencesPresence.visible} data-exiting=${preferencesPresence.exiting} ?inert=${preferencesPresence.exiting} aria-hidden=${preferencesPresence.exiting ? 'true' : nothing}>${renderPreferences(controller)}</div>` : nothing}
                </div>
                <footer class="footer" part="footer">${text.powered}</footer>
              </section>`
            : nothing
        }
        ${!state.picking && !state.tour ? html`<button class="launcher" part="launcher" aria-label=${state.open ? text.close : text.open} aria-expanded=${state.open} aria-controls="orfin-panel" ?data-open=${state.open} @click=${() => controller.toggle()}>${state.open ? icon('close', 21) : logo(controller.settings.logo, 30, state.busy)}${state.open ? nothing : html`<span>${text.open}</span>`}</button>` : nothing}
      </div>`,
      container,
    );
    const log = shadow.querySelector('[role="log"]');
    if (log) {
      if (!state.messages.length && lastCount) log.scrollTop = 0;
      else if (state.messages.length && (atBottom || lastCount !== state.messages.length))
        log.scrollTop = log.scrollHeight;
    }
    if (state.open && !wasOpen) {
      focusInput();
    }
    if (!state.open && wasOpen)
      shadow.querySelector<HTMLButtonElement>('.launcher')?.focus({ preventScroll: true });
    if (tourPosition && !wasTourVisible)
      shadow
        .querySelector<HTMLButtonElement>('.tour-popover .primary')
        ?.focus({ preventScroll: true });
    wasTourVisible = !!tourPosition;
    wasOpen = state.open;
    lastCount = state.messages.length;
  };
  const unsubscribe = controller.subscribe(update);
  controller.onCleanup(() => {
    unsubscribe();
    reducedMotion.removeEventListener('change', mediaChanged);
    panelPresence.dispose();
    preferencesPresence.dispose();
    hoverPresence.dispose();
    tourPresence.dispose();
    clearTimeout(highlightExit);
    cancelAnimationFrame(highlightFrame);
    render(nothing, container);
    host.remove();
  });
  update();
  return host;
}
