import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import type { OrfinController } from './controller';
import { resolveMenuActions } from '../core/menu';
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
  const available = () =>
    resolveMenuActions(
      controller.settings,
      {
        url: location.href,
        locale: controller.settings.locale,
        features: controller.settings.features,
      },
      controller.text,
      controller.state.busy,
    );
  const items = () =>
    Array.from(shadow.querySelectorAll<HTMLButtonElement>('.action-item:not(:disabled)'));
  const focusItem = (button?: HTMLButtonElement) => {
    (button ?? trigger())?.focus({ preventScroll: true });
    const menu = shadow.querySelector<HTMLElement>('.actions-menu');
    if (!button || !menu) return;
    const bottom = button.offsetTop + button.offsetHeight;
    if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
    else if (button.offsetTop < menu.scrollTop) menu.scrollTop = button.offsetTop;
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
  const choose = (key: string) => {
    const action = available().find((item) => item.key === key);
    if (!action || action.disabled) return;
    close();
    if (action.builtin === 'tour') void controller.startTour();
    else if (action.builtin === 'pick') controller.pick();
    else {
      void controller.send(action.prompt ?? controller.text.pagePrompt);
      shadow.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true });
    }
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
      const { text } = controller;
      const commands = available();
      const focused = shadow.activeElement as HTMLElement | null;
      const focusedKey = focused?.dataset.actionId;
      if (!commands.length) {
        open = false;
        presence.dispose();
        if (focusedKey || focused === trigger())
          queueMicrotask(() =>
            shadow.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true }),
          );
        return nothing;
      }
      if (open && focusedKey)
        queueMicrotask(() => {
          if (!open) return;
          const target = items().find((item) => item.dataset.actionId === focusedKey) ?? items()[0];
          if (shadow.activeElement !== target) focusItem(target);
        });
      presence.reconcile(open ? true : undefined, duration);
      const action = (command: (typeof commands)[number]) =>
        html`<button
          class="action-item"
          part="action-item"
          role="menuitem"
          tabindex="-1"
          data-action-id=${command.key}
          ?disabled=${command.disabled}
          @click=${() => choose(command.key)}
        >
          <span class="action-icon" part="action-icon">${icon(command.builtin ?? 'actions')}</span>
          <span class="action-label" part="action-label">${command.label}</span
          >${icon('chevron', 14)}
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
                ${repeat(commands, (command) => command.key, action)}
              </div>`
            : nothing
        }
      </div>`;
    },
  };
}
