import { html, render, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { live } from 'lit/directives/live.js';
import type { ChatMessage, ThemePreset } from '../core/types';
import { OrfinController } from './controller';
import { formattedText, safeURL } from './format';
import { popoverPosition } from './geometry';
import { icon, orfinMark } from './icons';
import { widgetStyles } from './styles';
import { localeDirection, formatMessage } from '../core/locale';
import { localeOptions } from './i18n';

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
  const style = document.createElement('style');
  if (controller.options.nonce) style.nonce = controller.options.nonce;
  style.textContent = widgetStyles.cssText;
  shadow.append(style);
  const container = document.createElement('div');
  shadow.append(container);
  document.body.append(host);
  try {
    host.showPopover();
  } catch {
    host.removeAttribute('popover');
  }
  let draft = '';
  let wasOpen = false;
  let wasTourVisible = false;
  let lastCount = 0;

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
    html`<button class="suggestion" @click=${action}>
      <span class="suggestion-icon">${icon(type)}</span><span>${label}</span>${icon('chevron')}
    </button>`;

  const message = (message: ChatMessage) =>
    html`<article
      class="message ${message.role}"
      lang=${message.locale ?? controller.settings.locale}
      dir=${message.role === 'assistant' ? localeDirection(message.locale ?? controller.settings.locale) : 'auto'}
    >
      ${message.role === 'assistant' ? html`<div class="message-label">${orfinMark(17)} Orfin</div>` : nothing}
      ${message.tools?.map((tool) => html`<div class="tool">${icon(tool.status === 'complete' ? 'check' : 'settings', 13)}${tool.name === 'highlight_section' ? controller.text.highlightTool : tool.name === 'navigate' ? controller.text.navigateTool : tool.name === 'start_tour' ? controller.text.tourTool : tool.name.replace(/_/g, ' ')} · ${tool.status === 'complete' ? controller.text.complete : tool.status === 'error' ? controller.text.error : controller.text.thinking}</div>`)}
      ${formattedText(message.content)}
      ${message.status === 'streaming' && !message.content ? html`<div class="thinking" aria-label=${controller.text.thinking}><i></i><i></i><i></i></div>` : nothing}
      ${message.sources?.length ? html`<div class="sources" aria-label=${controller.text.sources}>${message.sources.map((source) => (safeURL(source.url) ? html`<a class="source" href=${safeURL(source.url)!} target="_blank" rel="noopener noreferrer">${source.title}</a>` : html`<span class="source">${source.title}</span>`))}</div>` : nothing}
    </article>`;

  const update = () => {
    const { state, settings, text } = controller;
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
    render(
      html`<div
        class="orfin"
        data-theme=${settings.theme}
        lang=${settings.locale}
        dir=${localeDirection(settings.locale)}
      >
        ${state.highlight ? html`<div class="spotlight" data-testid="spotlight" style=${styleMap({ top: `${state.highlight.rect.top}px`, left: `${state.highlight.rect.left}px`, width: `${state.highlight.rect.width}px`, height: `${state.highlight.rect.height}px` })}><span class="spot-label">${controller.sectionText(state.highlight.section).title}</span></div>` : nothing}
        ${
          state.picking
            ? html`<div class="picker-bar" role="status">
                  ${icon('pick')}<span>${text.select}</span><small>${text.escape}</small
                  ><button
                    class="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.cancelPick()}
                  >
                    ${icon('close')}
                  </button>
                </div>
                <details class="section-list">
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
          state.hover && hoverPosition
            ? html`<section
                class="popover"
                role="dialog"
                aria-label=${text.hover}
                style=${styleMap({ top: `${hoverPosition.top}px`, left: `${hoverPosition.left}px`, maxHeight: `${innerHeight - hoverPosition.top - 12}px` })}
              >
                <div class="popover-top">
                  ${orfinMark(20)}<span>Orfin</span
                  ><button
                    class="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.dismissHover()}
                  >
                    ${icon('close', 14)}
                  </button>
                </div>
                <p>${text.hover}</p>
                <div class="popover-actions">
                  <button class="secondary" @click=${() => controller.dismissHover('dismissed')}>
                    ${text.no}</button
                  ><button
                    class="primary"
                    @click=${() => void controller.explain(state.hover!.section)}
                  >
                    ${text.yes}${icon('arrow', 14)}
                  </button>
                </div>
              </section>`
            : nothing
        }
        ${
          state.tour && currentSection && tourPosition
            ? html`<section
                class="popover tour-popover"
                role="dialog"
                aria-label=${text.guidedTour}
                style=${styleMap({ top: `${tourPosition.top}px`, left: `${tourPosition.left}px`, maxHeight: `${innerHeight - tourPosition.top - 12}px` })}
              >
                <div class="popover-top">
                  ${orfinMark(20)}<span>Orfin · ${progress}</span
                  ><button
                    class="icon-button"
                    aria-label=${text.exit}
                    @click=${() => controller.endTour()}
                  >
                    ${icon('close', 14)}
                  </button>
                </div>
                <h3>${currentSection.title}</h3>
                <p>${currentSection.description}</p>
                <div class="popover-actions">
                  <button
                    class="icon-button"
                    aria-label=${text.back}
                    ?disabled=${state.tour.index === 0}
                    @click=${() => void controller.tourStep(state.tour!.index - 1)}
                  >
                    ${icon('back', 15)}</button
                  ><button
                    class="secondary"
                    @click=${() => {
                      controller.askDuringTour();
                      focusInput();
                    }}
                  >
                    ${text.ask}${icon('help', 14)}</button
                  ><button
                    class="primary"
                    @click=${() => void controller.tourStep(state.tour!.index + 1)}
                  >
                    ${state.tour.index === state.tour.sections.length - 1 ? text.finish : text.next}${icon('arrow', 14)}
                  </button>
                </div>
                <div class="tour-progress">
                  ${state.tour.sections.map((_, index) => html`<i class=${index <= state.tour!.index ? 'active' : ''}></i>`)}
                </div>
              </section>`
            : nothing
        }
        ${
          state.open
            ? html`<section
                class="panel"
                part="panel"
                role="dialog"
                aria-label="Orfin"
                aria-modal="false"
              >
                <header class="header" part="header" role="presentation">
                  <div class="avatar">${orfinMark(30)}</div>
                  <div class="heading">
                    <h2>Orfin</h2>
                    <div class="status"><i></i>${state.busy ? text.thinking : text.online}</div>
                  </div>
                  <button
                    class="icon-button"
                    aria-label=${text.settings}
                    @click=${() => controller.preferences()}
                  >
                    ${icon('settings')}</button
                  ><button
                    class="icon-button"
                    aria-label=${text.close}
                    @click=${() => controller.close()}
                  >
                    ${icon('close')}
                  </button>
                </header>
                ${
                  state.tour
                    ? html`<nav class="tour-inline" aria-label=${text.tourControls}>
                        <button
                          class="icon-button"
                          aria-label=${text.back}
                          ?disabled=${state.tour.index === 0}
                          @click=${() => void controller.tourStep(state.tour!.index - 1)}
                        >
                          ${icon('back', 15)}</button
                        ><span>${progress}</span
                        ><button
                          class="secondary"
                          @click=${() => {
                            controller.close();
                          }}
                        >
                          ${text.returnToTour}</button
                        ><button
                          class="primary"
                          @click=${() => void controller.tourStep(state.tour!.index + 1)}
                        >
                          ${state.tour.index === state.tour.sections.length - 1 ? text.finish : text.next}
                        </button>
                      </nav>`
                    : nothing
                }
                ${
                  state.preferences
                    ? html`<div class="conversation preferences">
                        <h3>${text.settings}</h3>
                        <div class="field">
                          <label for="orfin-language">${text.language}</label>
                          <select
                            id="orfin-language"
                            .value=${settings.locale}
                            @change=${(event: Event) => controller.setLocale((event.target as HTMLSelectElement).value)}
                          >
                            ${localeOptions(settings.locale, settings.translations).map((locale) => html`<option value=${locale.code} ?selected=${locale.code === settings.locale}>${locale.label}</option>`)}
                          </select>
                        </div>
                        <div class="field">
                          <label>${text.theme}</label>
                          <div class="themes">
                            ${(['cloud', 'midnight', 'iris'] as ThemePreset[]).map((theme) => html`<button class="theme" aria-pressed=${settings.theme === theme} @click=${() => controller.updateSettings({ theme })}>${text[theme]}</button>`)}
                          </div>
                        </div>
                        <div class="toggle-row">
                          <span id="hover-label">${text.autoHelp}</span
                          ><button
                            class="toggle"
                            role="switch"
                            aria-labelledby="hover-label"
                            aria-checked=${settings.features.hoverHelp}
                            @click=${() => controller.updateSettings({ features: { hoverHelp: !settings.features.hoverHelp } })}
                          ></button>
                        </div>
                        <div class="toggle-row">
                          <span id="memory-label">${text.memory}</span
                          ><button
                            class="toggle"
                            role="switch"
                            aria-labelledby="memory-label"
                            aria-checked=${settings.memory.rememberDismissed}
                            @click=${() => controller.updateSettings({ memory: { rememberDismissed: !settings.memory.rememberDismissed, rememberVisited: !settings.memory.rememberVisited } })}
                          ></button>
                        </div>
                        <button class="secondary" @click=${() => controller.forget()}>
                          ${text.reset}
                        </button>
                      </div>`
                    : html`<div
                        class="conversation"
                        part="conversation"
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions text"
                        aria-label=${text.conversation}
                        aria-busy=${state.busy}
                      >
                        ${
                          !state.messages.length
                            ? html`<div class="welcome">
                                <div class="welcome-mark">${orfinMark(49)}</div>
                                <h3>${controller.options.title ?? text.title}</h3>
                                <p>${controller.options.welcome ?? text.intro}</p>
                                <div class="suggestions">
                                  ${settings.features.tour ? suggestion(text.tour, 'tour', () => void controller.startTour()) : nothing}${settings.features.sectionPicker ? suggestion(text.pick, 'pick', () => controller.pick()) : nothing}${settings.features.chat ? suggestion(text.page, 'page', () => void controller.send(text.pagePrompt)) : nothing}
                                </div>
                              </div>`
                            : repeat(state.messages, (message) => message.id, message)
                        }
                        ${state.error ? html`<div class="error" role="alert">${controller.errorMessage}<br /><button @click=${() => void controller.retry()}>${text.retry}</button></div>` : nothing}
                      </div>`
                }
                ${
                  !state.preferences && settings.features.chat
                    ? html`<div class="composer" part="composer">
                        ${
                          state.selectedSection
                            ? html`<div class="context">
                                ${icon('pick', 12)}<span
                                  >${controller.sectionText(state.selectedSection).title}</span
                                ><button
                                  class="icon-button"
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
                        <div class="input-wrap">
                          <textarea
                            aria-label=${text.placeholder}
                            placeholder=${text.placeholder}
                            maxlength="12000"
                            rows="2"
                            .value=${live(draft)}
                            @input=${(event: Event) => {
                              draft = (event.target as HTMLTextAreaElement).value;
                            }}
                            @keydown=${(event: KeyboardEvent) => {
                              if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
                                event.preventDefault();
                                submit();
                              }
                            }}
                          ></textarea
                          ><button
                            class="send"
                            aria-label=${state.busy ? text.stop : text.send}
                            @click=${() => (state.busy ? controller.stop() : submit())}
                          >
                            ${icon(state.busy ? 'stop' : 'send', 17)}
                          </button>
                        </div>
                        <div class="composer-actions">
                          ${settings.features.sectionPicker ? html`<button class="mini" @click=${() => controller.pick()}>${icon('pick')}${text.pick}</button>` : nothing}<span
                            class="spacer"
                          ></span
                          ><button
                            class="mini"
                            aria-label=${text.clear}
                            @click=${() => controller.clear()}
                          >
                            ${icon('clear')}
                          </button>
                        </div>
                      </div>`
                    : !settings.features.chat
                      ? html`<p class="disabled">${text.disabled}</p>`
                      : nothing
                }
                <footer class="footer">${text.powered}</footer>
              </section>`
            : nothing
        }
        ${!state.picking && !state.tour ? html`<button class="launcher" part="launcher" aria-label=${state.open ? text.close : text.open} aria-expanded=${state.open} ?data-open=${state.open} @click=${() => controller.toggle()}>${state.open ? icon('close', 21) : orfinMark(30)}${state.open ? nothing : html`<span>${text.open}</span>`}</button>` : nothing}
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
    render(nothing, container);
    host.remove();
  });
  update();
  return host;
}
