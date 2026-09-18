import { CheckCheck, Code2, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { AssistantSettings, Features, SettingsInput } from '../../src/core/types';
import { Appearance } from './Appearance';
import { defaultSettings } from '../../src/core/settings';
import type { OrfinController } from '../../src/index';
import { projectMenu } from '../menu-actions';

export function SettingsPage({
  orfin,
  settings,
  update,
}: {
  orfin: OrfinController | null;
  settings: AssistantSettings;
  update: (settings: SettingsInput) => void;
}) {
  const [copied, setCopied] = useState(false);
  const features: {
    key: Exclude<keyof Features, 'pageContext'>;
    title: string;
    description: string;
  }[] = [
    {
      key: 'chat',
      title: 'Conversations',
      description: 'Let visitors ask questions about your product.',
    },
    {
      key: 'tour',
      title: 'Guided tours',
      description: 'A step-by-step introduction, with room for questions.',
    },
    {
      key: 'sectionPicker',
      title: 'Section selection',
      description: 'Point at anything you want to understand.',
    },
    {
      key: 'hoverHelp',
      title: 'Thoughtful nudges',
      description: 'Offer a little help after a visitor lingers.',
    },
    {
      key: 'navigation',
      title: 'Find the way',
      description: 'Open a page and highlight the right section.',
    },
    {
      key: 'tools',
      title: 'Connected tools',
      description:
        'Read workspace metrics, interpret results, compare equipment and update your demo cart.',
    },
  ];
  const config = JSON.stringify(
    {
      endpoint: '/api/orfin',
      theme: settings.theme,
      ...(settings.theme === 'none' ? { styles: settings.styles } : {}),
      logo: settings.logo,
      motion: settings.motion,
      menuActions: settings.menuActions,
      highlightOpacity: settings.highlightOpacity,
      highlightTransition: settings.highlightTransition,
      features: settings.features,
      memory: settings.memory,
      hoverDelay: settings.hoverDelay,
      locale: settings.locale,
    },
    null,
    2,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Your product. Your Orfin.</h1>
          <p>Make a change. Try it out. Find what feels right.</p>
        </div>
        <button className="button" onClick={() => update(defaultSettings)}>
          <RotateCcw size={14} />
          Reset defaults
        </button>
      </div>
      <section className="settings-layout" data-orfin-section="settings">
        <div className="settings-column">
          <Appearance settings={settings} update={update} />
          <section className="settings-card">
            <h2>A helpful memory</h2>
            <p className="card-description">Decide what Orfin remembers between visits.</p>
            <label className="setting-field">
              <span>Remember choices</span>
              <select
                value={settings.memory.storage}
                onChange={(event) =>
                  update({
                    memory: { storage: event.target.value as 'local' | 'session' | 'none' },
                  })
                }
              >
                <option value="session">This session</option>
                <option value="local">Between visits</option>
                <option value="none">In memory only</option>
              </select>
            </label>
            {(['rememberVisited', 'rememberDismissed'] as const).map((key) => (
              <div className="setting-row" key={key}>
                <span>
                  {key === 'rememberVisited'
                    ? 'Remember explained sections'
                    : 'Remember “No, thanks”'}
                </span>
                <button
                  className="switch"
                  role="switch"
                  aria-label={
                    key === 'rememberVisited'
                      ? 'Remember explained sections'
                      : 'Remember declined help'
                  }
                  aria-checked={settings.memory[key]}
                  onClick={() => update({ memory: { [key]: !settings.memory[key] } })}
                />
              </div>
            ))}
            <label className="setting-field">
              <span>Wait before offering help</span>
              <select
                value={settings.hoverDelay}
                onChange={(event) => update({ hoverDelay: Number(event.target.value) })}
              >
                <option value={1200}>1.2 seconds</option>
                <option value={2200}>2.2 seconds</option>
                <option value={4000}>4 seconds</option>
              </select>
            </label>
            <button className="text-button" onClick={() => orfin?.forget()}>
              Clear section history
              <RotateCcw size={12} />
            </button>
          </section>
        </div>
        <div className="settings-column">
          <section className="settings-card">
            <h2>A little more, or a little less</h2>
            <p className="card-description">Turn on the capabilities your visitors need.</p>
            <label className="setting-field">
              <span>Actions menu</span>
              <select
                value={
                  settings.menuActions === null
                    ? 'default'
                    : !settings.menuActions.length
                      ? 'none'
                      : typeof settings.menuActions[0] === 'string'
                        ? 'page-first'
                        : 'project'
                }
                onChange={(event) =>
                  update({
                    menuActions:
                      event.target.value === 'default'
                        ? null
                        : event.target.value === 'none'
                          ? []
                          : event.target.value === 'page-first'
                            ? ['page', 'pick', 'tour']
                            : projectMenu,
                  })
                }
              >
                <option value="project">Project commands · change with the page</option>
                <option value="default">Standard commands</option>
                <option value="page-first">Page explanation first</option>
                <option value="none">Hide the menu</option>
              </select>
            </label>
            <p className="card-description">
              Equipment adds Compare products; Reports adds Analyze delivery. These commands use the
              project’s tools and data.
            </p>
            {features.map((feature) => (
              <div className="feature-row" key={feature.key}>
                <div>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </div>
                <button
                  className="switch"
                  role="switch"
                  aria-label={feature.title}
                  aria-checked={settings.features[feature.key]}
                  onClick={() =>
                    update({ features: { [feature.key]: !settings.features[feature.key] } })
                  }
                />
              </div>
            ))}
            <label className="setting-field context-field">
              <span>Page context</span>
              <select
                value={settings.features.pageContext}
                onChange={(event) =>
                  update({ features: { pageContext: event.target.value as 'sections' | 'page' } })
                }
              >
                <option value="sections">Marked sections only</option>
                <option value="page">Visible page content</option>
              </select>
            </label>
          </section>
          <section className="config-card">
            <div className="section-heading">
              <h2>
                <Code2 size={17} />
                Bring this to your project
              </h2>
              <button
                className="icon-btn"
                aria-label="Copy configuration"
                onClick={() => {
                  void navigator.clipboard.writeText(config).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                {copied ? <CheckCheck size={17} /> : <Copy size={17} />}
              </button>
            </div>
            <pre tabIndex={0} aria-label="Integration configuration">
              {config}
            </pre>
          </section>
        </div>
      </section>
    </>
  );
}
