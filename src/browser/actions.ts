import { html, nothing } from 'lit';
import type { OrfinController } from './controller';
import { icon } from './icons';
import { Presence } from './presence';

export function createActionsMenu(
  controller: OrfinController,
  shadow: ShadowRoot,
  refresh: () => void,
) {
  let open = false;
  const presence = new Presence<boolean>(refresh);
  const lifecycle = new AbortController();
  const trigger = () => shadow.querySelector<HTMLButtonElement>('.actions-trigger');
  const items = () =>
    Array.from(shadow.querySelectorAll<HTMLButtonElement>('.action-item:not(:disabled)'));
  const focusItem = (button?: HTMLButtonElement) => {
    button?.focus({ preventScroll: true });
    const menu = shadow.querySelector('.actions-menu');
    if (!button || !menu) return;
    const bounds = button.getBoundingClientRect();
    const viewport = menu.getBoundingClientRect();
    if (bounds.bottom > viewport.bottom) menu.scrollTop += bounds.bottom - viewport.bottom;
    else if (bounds.top < viewport.top) menu.scrollTop -= viewport.top - bounds.top;
  };
  const close = (restore = false) => {
    if (!open) return;
    open = false;
    refresh();
    if (restore) trigger()?.focus({ preventScroll: true });
  };
  const show = (last = false) => {
    open = true;
    refresh();
    queueMicrotask(() => focusItem(last ? items().at(-1) : items()[0]));
  };
  const choose = (action: () => void) => {
    close();
    action();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        show(event.key === 'ArrowUp' || event.key === 'End');
        return;
      }
      const buttons = items();
      const index = buttons.indexOf(shadow.activeElement as HTMLButtonElement);
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      focusItem(buttons[next]);
    }
    if (event.key === 'Tab' && open) {
      event.preventDefault();
      close();
      const target = event.shiftKey
        ? trigger()
        : shadow.querySelector<HTMLButtonElement>('.clear-conversation');
      target?.focus({ preventScroll: true });
    }
  };
  document.addEventListener(
    'pointerdown',
    (event) => {
      const wrapper = shadow.querySelector('.actions');
      if (open && wrapper && !event.composedPath().includes(wrapper)) close();
    },
    { capture: true, signal: lifecycle.signal },
  );
  controller.onCleanup(() => {
    lifecycle.abort();
    presence.dispose();
  });
  return {
    reset() {
      open = false;
      presence.dispose();
    },
    render(duration: number) {
      const { text, settings } = controller;
      presence.reconcile(open ? true : undefined, duration);
      const action = (label: string, type: 'tour' | 'pick' | 'page', callback: () => void) =>
        html`<button
          class="action-item"
          part="action-item"
          role="menuitem"
          tabindex="-1"
          ?disabled=${type === 'page' && controller.state.busy}
          @click=${() => choose(callback)}
        >
          <span class="action-icon" part="action-icon">${icon(type)}</span>
          <span class="action-label" part="action-label">${label}</span>${icon('chevron', 14)}
        </button>`;
      return html`<div class="actions" part="actions" @keydown=${keydown}>
        <button
          class="actions-trigger"
          part="actions-trigger"
          aria-haspopup="menu"
          aria-expanded=${open}
          aria-controls="orfin-actions-menu"
          @click=${() => (open ? close(true) : show())}
        >
          ${icon('actions', 16)}<span>${text.actions}</span>
          <span class="action-chevron" part="action-chevron">${icon('down', 14)}</span>
        </button>
        ${
          presence.value
            ? html`<div
                id="orfin-actions-menu"
                class="actions-menu"
                part="actions-menu"
                role="menu"
                aria-label=${text.actions}
                aria-hidden=${presence.exiting ? 'true' : nothing}
                ?inert=${presence.exiting}
                data-visible=${presence.visible}
                data-exiting=${presence.exiting}
              >
                ${settings.features.tour ? action(text.tour, 'tour', () => void controller.startTour()) : nothing}
                ${settings.features.sectionPicker ? action(text.pick, 'pick', () => controller.pick()) : nothing}
                ${
                  settings.features.chat
                    ? action(text.page, 'page', () => {
                        void controller.send(text.pagePrompt);
                        shadow
                          .querySelector<HTMLTextAreaElement>('textarea')
                          ?.focus({ preventScroll: true });
                      })
                    : nothing
                }
              </div>`
            : nothing
        }
      </div>`;
    },
  };
}
