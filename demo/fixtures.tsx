import { createOrfin } from '../src/index';
import type { OrfinOptions } from '../src/index';
import { createDemoTransport } from './mock';

const options: OrfinOptions = {
  transport: createDemoTransport(),
  initiallyOpen: true,
  features: { hoverHelp: false },
  memory: { storage: 'none' },
  sections: [
    {
      id: 'remote',
      title: 'Destination section',
      description: 'Found after a full page reload.',
      path: '/destination.html',
    },
  ],
  allowedPaths: ['/destination.html'],
};
const kind = new URLSearchParams(location.search).get('framework') ?? 'vanilla';
const root = document.getElementById('framework-root')!;
let dispose: () => void;
if (kind === 'react') {
  const [{ createRoot }, { OrfinSupport, useOrfin }] = await Promise.all([
    import('react-dom/client'),
    import('../src/adapters/react'),
  ]);
  function LocaleControls() {
    const { locale, setLocale } = useOrfin();
    return (
      <div>
        <output id="host-locale">{locale}</output>
        <button id="set-french" onClick={() => setLocale('fr')}>
          Français
        </button>
      </div>
    );
  }
  const app = createRoot(root);
  app.render(
    <OrfinSupport
      options={options}
      onReady={(controller) => {
        window.__orfin = controller;
      }}
    >
      <LocaleControls />
    </OrfinSupport>,
  );
  dispose = () => app.unmount();
} else if (kind === 'vue-composable') {
  const [{ createApp, h, watch }, { useOrfin }] = await Promise.all([
    import('vue'),
    import('../src/adapters/vue'),
  ]);
  const app = createApp({
    setup() {
      const api = useOrfin(options);
      watch(api.controller, (controller) => {
        window.__orfin = controller ?? undefined;
      });
      return () =>
        h('div', [
          h('output', { id: 'host-locale' }, api.locale.value),
          h(
            'button',
            {
              id: 'set-french',
              onClick: () => {
                api.locale.value = 'fr';
              },
            },
            'Français',
          ),
        ]);
    },
  });
  app.mount(root);
  dispose = () => app.unmount();
} else if (kind === 'vue') {
  const [{ createApp, h }, { OrfinSupport }] = await Promise.all([
    import('vue'),
    import('../src/adapters/vue'),
  ]);
  const app = createApp({
    render: () =>
      h(OrfinSupport, {
        options,
        onReady: (controller) => {
          window.__orfin = controller;
        },
      }),
  });
  app.mount(root);
  dispose = () => app.unmount();
} else if (kind === 'angular') {
  await import('@angular/compiler');
  const [{ Component, signal }, { bootstrapApplication }, { provideOrfin, ORFIN, injectOrfin }] =
    await Promise.all([
      import('@angular/core'),
      import('@angular/platform-browser'),
      import('../src/adapters/angular'),
    ]);
  const optionLocale = signal('en');
  class FixtureApp {
    api = injectOrfin();
    french() {
      this.api.setLocale('fr');
    }
    polish() {
      optionLocale.set('pl');
    }
  }
  Component({
    selector: 'fixture-app',
    standalone: true,
    template:
      '<p>Angular integration mounted.</p><output id="host-locale">{{ api.locale() }}</output><button id="set-french" (click)="french()">Français</button><button id="set-polish" (click)="polish()">Polski</button>',
  })(FixtureApp);
  root.innerHTML = '<fixture-app></fixture-app>';
  const app = await bootstrapApplication(FixtureApp, {
    providers: [provideOrfin(() => ({ ...options, locale: optionLocale() }))],
  });
  window.__orfin = app.injector.get(ORFIN) ?? undefined;
  dispose = () => app.destroy();
} else {
  const controller = createOrfin(options);
  window.__orfin = controller;
  dispose = () => controller.destroy();
}
document.getElementById('unmount')!.addEventListener('click', () => dispose());
