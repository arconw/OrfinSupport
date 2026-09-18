import { html } from 'lit';
import type { OrfinController } from './controller';
import { supportedThemes } from '../core/themes';
import { localeOptions } from './i18n';

export function renderPreferences(controller: OrfinController) {
  const { settings, text } = controller;
  return html`<div class="conversation preferences" part="conversation preferences">
    <h3>${text.settings}</h3>
    <div class="field" part="field">
      <label for="orfin-language">${text.language}</label>
      <select
        id="orfin-language"
        part="language"
        .value=${settings.locale}
        @change=${(event: Event) => controller.setLocale((event.target as HTMLSelectElement).value)}
      >
        ${localeOptions(settings.locale, settings.translations).map((locale) => html`<option value=${locale.code} ?selected=${locale.code === settings.locale}>${locale.label}</option>`)}
      </select>
    </div>
    <div class="field" part="field">
      <label>${text.theme}</label>
      <div class="themes" part="themes">
        ${supportedThemes.map((theme) => html`<button class="theme" part="theme" aria-pressed=${settings.theme === theme} @click=${() => controller.updateSettings({ theme })}>${text[theme]}</button>`)}
        <button
          class="theme external-theme"
          part="theme external-theme"
          aria-pressed=${settings.theme === 'none'}
          @click=${() => controller.updateSettings({ theme: 'none' })}
        >
          ${text.externalTheme}
        </button>
      </div>
    </div>
    <div class="toggle-row" part="toggle-row">
      <span id="motion-label">${text.motion}</span>
      <button
        class="toggle"
        part="toggle"
        role="switch"
        aria-labelledby="motion-label"
        aria-describedby="motion-hint"
        aria-checked=${settings.motion !== 'none'}
        @click=${() => controller.updateSettings({ motion: settings.motion === 'none' ? 'auto' : 'none' })}
      ></button>
    </div>
    <p id="motion-hint" class="motion-hint" part="motion-hint">${text.motionHint}</p>
    <div class="toggle-row" part="toggle-row">
      <span id="hover-label">${text.autoHelp}</span
      ><button
        class="toggle"
        part="toggle"
        role="switch"
        aria-labelledby="hover-label"
        aria-checked=${settings.features.hoverHelp}
        @click=${() => controller.updateSettings({ features: { hoverHelp: !settings.features.hoverHelp } })}
      ></button>
    </div>
    <div class="toggle-row" part="toggle-row">
      <span id="memory-label">${text.memory}</span
      ><button
        class="toggle"
        part="toggle"
        role="switch"
        aria-labelledby="memory-label"
        aria-checked=${settings.memory.rememberDismissed}
        @click=${() => controller.updateSettings({ memory: { rememberDismissed: !settings.memory.rememberDismissed, rememberVisited: !settings.memory.rememberVisited } })}
      ></button>
    </div>
    <button class="secondary" part="secondary" @click=${() => controller.forget()}>
      ${text.reset}
    </button>
  </div>`;
}
