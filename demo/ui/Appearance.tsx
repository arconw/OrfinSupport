import { Check, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { AssistantSettings, SettingsInput } from '../../src/core/types';
import { supportedLocales } from '../../src/core/locale';
import { supportedThemes, themePresets } from '../../src/core/themes';

export function Appearance({
  settings,
  update,
}: {
  settings: AssistantSettings;
  update: (input: SettingsInput) => void;
}) {
  const [customLogo, setCustomLogo] = useState('');
  const selectedLogo = !settings.logo
    ? 'default'
    : settings.logo.src.endsWith('northstar-mark.svg')
      ? 'northstar'
      : settings.logo.src.endsWith('studio-mark.svg')
        ? 'studio'
        : 'custom';
  return (
    <section className="settings-card">
      <div className="section-heading">
        <h2>Make it feel at home</h2>
        <SlidersHorizontal size={17} />
      </div>
      <p className="card-description">Five light themes. Five dark. One familiar guide.</p>
      {(['light', 'dark'] as const).map((scheme) => (
        <div className="theme-family" key={scheme}>
          <h3>{scheme === 'light' ? 'Light' : 'Dark'}</h3>
          <div className="theme-previews">
            {supportedThemes
              .filter((name) => themePresets[name].scheme === scheme)
              .map((name) => {
                const theme = themePresets[name];
                return (
                  <button
                    className={`theme-preview ${settings.theme === name ? 'selected' : ''}`}
                    style={
                      Object.fromEntries(
                        Object.entries(theme).map(([key, value]) => [`--preview-${key}`, value]),
                      ) as CSSProperties
                    }
                    key={name}
                    aria-pressed={settings.theme === name}
                    onClick={() => update({ theme: name })}
                  >
                    <span className="preview-window">
                      <i />
                      <i />
                      <i />
                      <span />
                    </span>
                    <strong>{name[0]!.toUpperCase() + name.slice(1)}</strong>
                    {settings.theme === name && <Check size={12} />}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
      <label className="setting-field">
        <span>Language</span>
        <select
          aria-label="Language"
          value={settings.locale}
          onChange={(event) => update({ locale: event.target.value })}
        >
          {supportedLocales.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.label}
            </option>
          ))}
        </select>
      </label>
      <p className="card-description">
        The interface and new replies follow this language. You can still ask Orfin to answer in
        another one.
      </p>
      <div className="logo-settings">
        <label className="setting-field">
          <span>Assistant logo</span>
          <select
            aria-label="Assistant logo"
            value={selectedLogo}
            onChange={(event) => {
              const value = event.target.value;
              update({
                logo:
                  value === 'default'
                    ? null
                    : value === 'custom'
                      ? { src: customLogo || './custom-logo.svg', alt: 'Custom assistant' }
                      : {
                          src: `./${value === 'northstar' ? 'northstar' : 'studio'}-mark.svg`,
                          alt: value === 'northstar' ? 'Northstar assistant' : 'Studio assistant',
                        },
              });
            }}
          >
            <option value="default">Orfin original</option>
            <option value="northstar">Northstar star</option>
            <option value="studio">Studio monogram</option>
            <option value="custom">Custom image URL</option>
          </select>
        </label>
        {selectedLogo === 'custom' && (
          <>
            <label className="setting-field">
              <span>Logo image URL</span>
              <input
                aria-label="Logo image URL"
                value={customLogo}
                placeholder="https://your-site.com/assistant.svg"
                onChange={(event) => {
                  setCustomLogo(event.target.value);
                  update({
                    logo: {
                      src: event.target.value,
                      alt: settings.logo?.alt ?? 'Custom assistant',
                    },
                  });
                }}
              />
            </label>
            <label className="setting-field">
              <span>Logo alternative text</span>
              <input
                aria-label="Logo alternative text"
                value={settings.logo?.alt ?? ''}
                onChange={(event) =>
                  update({ logo: { src: settings.logo?.src ?? '', alt: event.target.value } })
                }
              />
            </label>
          </>
        )}
        <p className="card-description">
          Updates the launcher, header, messages and welcome screen. Unavailable images fall back to
          Orfin.
        </p>
      </div>
      <label className="setting-field spotlight-field">
        <span>
          Background dimming <strong>{Math.round(settings.highlightOpacity * 100)}%</strong>
        </span>
        <input
          aria-label="Background dimming"
          type="range"
          min="0"
          max="0.85"
          step="0.05"
          value={settings.highlightOpacity}
          onChange={(event) => update({ highlightOpacity: Number(event.target.value) })}
        />
      </label>
      <p className="card-description">
        15% keeps the page softly visible. Motion follows your device’s reduced-motion preference.
      </p>
    </section>
  );
}
