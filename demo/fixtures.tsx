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
  const [{ createRoot }, { OrfinSupport }] = await Promise.all([
    import('react-dom/client'),
    import('../src/adapters/react'),
  ]);
  const app = createRoot(root);
  app.render(
    <OrfinSupport
      options={options}
      onReady={(controller) => {
        window.__orfin = controller;
      }}
    />,
  );
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
  const [{ Component }, { bootstrapApplication }, { provideOrfin, ORFIN }] = await Promise.all([
    import('@angular/core'),
    import('@angular/platform-browser'),
    import('../src/adapters/angular'),
  ]);
  class FixtureApp {}
  Component({
    selector: 'fixture-app',
    standalone: true,
    template: '<p>Angular integration mounted.</p>',
  })(FixtureApp);
  root.innerHTML = '<fixture-app></fixture-app>';
  const app = await bootstrapApplication(FixtureApp, { providers: [provideOrfin(options)] });
  window.__orfin = app.injector.get(ORFIN) ?? undefined;
  dispose = () => app.destroy();
} else {
  const controller = createOrfin(options);
  window.__orfin = controller;
  dispose = () => controller.destroy();
}
document.getElementById('unmount')!.addEventListener('click', () => dispose());
