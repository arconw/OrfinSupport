# Localization

Orfin uses **English by default**. The widget includes complete catalogs for English (`en`), Spanish (`es`), French (`fr`), German (`de`), Portuguese (`pt`), Italian (`it`), Dutch (`nl`), Polish (`pl`), Ukrainian (`uk`), Russian (`ru`), Turkish (`tr`), Arabic (`ar`), Hindi (`hi`), Simplified Chinese (`zh`), Japanese (`ja`) and Korean (`ko`). Arabic uses right-to-left layout. `supportedLocales` exports the codes and native labels for your own language menu.

## Configuration and widget preferences

```ts
import { createOrfin } from 'orfinsupport';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  locale: 'fr-CA',
});

orfin.setLocale('ja');
orfin.updateSettings({ locale: 'ar' });
```

Visitors can also change Language in the widget’s preferences. Every method updates the same controller setting and emits a `settings` event. The demo’s Playground language menu stays in sync. Changing a language preserves the conversation, current tour step, selected section and remembered hover choices. Settings are not automatically persisted across reloads; connect them to your application’s preference storage if needed.

All widget labels, accessible names, hover prompts, tour controls, preset names, tool statuses, built-in tool names and recoverable errors are translated. Project names, source titles, custom tool names, page contents and messages belong to the host application. Supply translations for those when appropriate. The sample playground includes translated section descriptions and deterministic replies in all 16 languages; its host dashboard remains English.

## React and Next.js

`OrfinProvider` is an alias of `OrfinSupport`. Both render one assistant and provide context to their children. `useOrfin()` reads that context and must be used inside either provider.

```tsx
'use client';

import { OrfinProvider, useOrfin } from 'orfinsupport/react';
import { supportedLocales } from 'orfinsupport';

function LanguagePicker() {
  const { locale, setLocale } = useOrfin();
  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value)}
      aria-label="Language"
    >
      {supportedLocales.map((language) => (
        <option key={language.code} value={language.code}>
          {language.label}
        </option>
      ))}
    </select>
  );
}

export function Assistant() {
  return (
    <OrfinProvider options={{ endpoint: '/api/orfin', locale: 'en' }}>
      <LanguagePicker />
    </OrfinProvider>
  );
}
```

The hook returns `{ controller, settings, locale, setLocale, updateSettings }`. `controller` is `null` during SSR and before mounting. `locale` and `settings` update when the visitor changes widget preferences. The provider uses an external-store subscription and cleans up in React Strict Mode. The [Next.js example](../examples/next/app/assistant.tsx) includes this language control and is tested in a production build.

## Vue

Use the component’s reactive `options` prop or the `useOrfin` composable. The composable owns one widget, so it replaces the component in this example.

```vue
<script setup lang="ts">
import { useOrfin } from 'orfinsupport/vue';
import { supportedLocales } from 'orfinsupport';

const { locale, controller, updateSettings } = useOrfin({
  endpoint: '/api/orfin',
  locale: 'en',
});
</script>

<template>
  <select v-model="locale" aria-label="Language">
    <option v-for="language in supportedLocales" :key="language.code" :value="language.code">
      {{ language.label }}
    </option>
  </select>
</template>
```

`locale` is a writable computed ref; `settings` is a readonly computed ref; `controller` is a shallow ref. `setLocale()` and `updateSettings()` are also available. Pass a reactive options object, ref or getter to update settings from application state. The composable mounts and disposes inside Vue’s component lifecycle. The `OrfinSupport` component exposes the same API plus `getController()` and emits `ready`.

## Angular

Register `provideOrfin({ endpoint: '/api/orfin', locale: 'en' })` in your application providers. Call `injectOrfin()` in an injection context, such as a component field initializer:

```ts
import { Component } from '@angular/core';
import { injectOrfin } from 'orfinsupport/angular';

@Component({
  selector: 'app-language',
  standalone: true,
  template:
    '<button (click)="orfin.setLocale(\'fr\')">Français</button><span>{{ orfin.locale() }}</span>',
})
export class LanguageControl {
  readonly orfin = injectOrfin();
}
```

The API returns readonly `locale` and `settings` signals, `setLocale()`, `updateSettings()` and the controller. Widget preference changes update the signals. `provideOrfin(() => ({ endpoint: '/api/orfin', locale: appLocale() }))` can follow an existing application signal. `ORFIN` still exposes the raw controller and is `null` during SSR. Cleanup belongs to Angular’s `DestroyRef`.

## Custom translations and fallback

```ts
const orfin = createOrfin({
  locale: 'fr-CA',
  translations: {
    fr: { title: 'Bonjour au studio', intro: 'Comment puis-je vous aider ?' },
    'fr-CA': { title: 'Bienvenue au studio' },
    sv: { title: 'Hej från Orfin', send: 'Skicka meddelande' },
  },
});
```

`TranslationMessages`, `TranslationKey` and `TranslationOverrides` are exported types. All overrides are optional. `resolveTranslations(locale, overrides)` returns a complete dictionary. Use canonical BCP 47 keys such as `fr-CA`; the selected locale itself is normalized, so `pt-br` becomes `pt-BR`.

Resolution starts with English, then applies the base language, script and exact regional variant in order. At each level a custom override wins over the built-in translation. A missing or empty custom string falls back to the built-in or English text. For an additional language such as Swedish, provide its strings under `sv`; missing keys stay English. An unknown language without translations displays English. Invalid locale syntax becomes `en`.

`updateSettings({ translations: nextOverrides })` replaces the override map. Use an empty object to remove overrides. Static `title` and `welcome` options take precedence over translated welcome text; use the `title` and `intro` translation keys when that text must change with the language. The `explain` message supports `{title}`; `stepProgress` supports `{current}` and `{total}`.

## Translated section content

```ts
const sections = [
  {
    id: 'projects',
    title: 'Projects',
    description: 'Track progress and deadlines.',
    tourOrder: 0,
    translations: {
      fr: { title: 'Projets', description: 'Suivez les progrès et les échéances.' },
      ja: { title: 'プロジェクト', description: '進捗と期限を確認できます。' },
    },
  },
];
```

Pass the catalog to both the browser and server when using trusted section instructions. Tour descriptions, picker labels, spotlight labels and the selected-section context use the localized values. Missing section translations retain the base title and description. Section IDs, paths and prompts stay stable. The browser request strips both technical prompts and translation maps, sending only the resolved public section text. DOM-only sections follow the title and description currently rendered by your application.

## Response language and errors

The selected `locale` travels with every chat request. The server validates the tag and explicitly instructs the model to answer in that language even when the visitor’s question or reference documents use another language. Unknown language codes fall back to English; valid additional languages can use custom UI translations. This relies on the chosen model’s language capabilities. Existing messages remain unchanged; an in-flight answer retains the language selected when its request began.

Built-in transports and handlers use stable `OrfinError` codes: `connection`, `rateLimit`, `unauthorized`, `invalidResponse`, `incomplete`, `timeout` and `reply`. The widget resolves these through the current translation catalog, including when the language changes after an error. Custom transports may throw `new OrfinError('timeout', 'Diagnostic')` or emit `{ type: 'error', code: 'timeout', message: 'Diagnostic' }`. Diagnostics are not rendered in the widget; unknown errors receive the localized generic retry message.
