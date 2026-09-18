# Project styling

OrfinSupport supports three levels of styling: a complete preset, preset overrides, and a project-owned appearance with no preset at all. All framework adapters use the same settings.

## Disable the preset

```ts
import { createOrfin } from 'orfinsupport';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  theme: 'none',
  logo: { src: '/brand/assistant.svg', alt: 'Project assistant' },
});
```

`theme: 'none'` leaves the preset stylesheet empty and removes inline preset palette, radius, shadow and header tokens. It does not select a transparent version of Cloud or another built-in theme. Without project CSS, native browser defaults remain visible.

The layout stylesheet stays active: positioning, dimensions, scroll containment, pointer behavior, responsive layout, keyboard focus indicators, disabled-control feedback, spotlight geometry and reduced-motion behavior. The full-viewport host remains transparent and does not intercept input outside interactive surfaces. These are interaction defaults, not a hidden color palette. Visual styles on the exposed components remain overridable; preserve their accessibility and usable geometry when designing a replacement.

## The Shadow DOM boundary

| Mechanism                     | What it controls                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| External `::part()` selectors | The explicitly exposed elements, including their supported pseudo-classes such as `:hover` and `:focus-visible`.   |
| CSS custom properties         | Values inherited through the shadow boundary. A preset or project stylesheet must actually reference the property. |
| `styles` configuration        | Trusted project CSS inserted inside Shadow DOM, with access to internal classes, descendants and attribute states. |

An ordinary selector such as `[data-orfin-root] .panel` cannot reach the panel. `::part(panel)` can. A selector such as `::part(header) button` cannot reach arbitrary descendants either; target the exported control part, or use `styles`. Internal classes in the examples below are usable inside `styles`, not directly from an ordinary application stylesheet.

Setting `--app-surface` or `--orfin-surface` alone in no-preset mode does not paint a panel. Your stylesheet maps those values to `background`. Likewise, the host resets inherited typography; set the font on `::part(orfin)` or `.orfin` inside `styles`.

## Use an external project stylesheet

Load this CSS through your application's normal stylesheet mechanism. The `data-theme` condition makes it stop applying when a built-in preset is restored.

```css
[data-orfin-root] {
  --app-assistant-surface: #f9fff3;
  --app-assistant-text: #263c35;
  --app-assistant-accent: #315947;
}

[data-orfin-root][data-theme='none']::part(orfin) {
  color: var(--app-assistant-text);
  font:
    14px/1.5 Georgia,
    serif;
}

[data-orfin-root][data-theme='none']::part(panel),
[data-orfin-root][data-theme='none']::part(popover),
[data-orfin-root][data-theme='none']::part(picker-bar),
[data-orfin-root][data-theme='none']::part(section-list) {
  background: var(--app-assistant-surface);
  border: 2px solid var(--app-assistant-accent);
  border-radius: 0;
  box-shadow: 0 12px 32px #263c3526;
}

[data-orfin-root][data-theme='none']::part(header) {
  border-bottom: 3px double var(--app-assistant-accent);
}

[data-orfin-root][data-theme='none']::part(launcher),
[data-orfin-root][data-theme='none']::part(send),
[data-orfin-root][data-theme='none']::part(primary) {
  color: #fff;
  background: var(--app-assistant-accent);
  border: 1px solid var(--app-assistant-accent);
  border-radius: 4px;
}

[data-orfin-root][data-theme='none']::part(launcher):hover {
  background: #263c35;
}

[data-orfin-root][data-theme='none']::part(input) {
  color: var(--app-assistant-text);
  background: var(--app-assistant-surface);
  font: inherit;
}

[data-orfin-root][data-theme='none']::part(input):focus-visible {
  outline: 2px solid var(--app-assistant-accent);
}
```

This example covers the main surfaces and primary controls. The complete demo design additionally styles messages, suggestions, settings, errors, secondary controls, tool states and spotlight labels.

## Supply the complete project design

`styles` accepts a CSS string. Use your bundler's CSS-as-text mechanism or a JavaScript string. In the Vite demo, the actual application stylesheet is imported as text:

```ts
import projectStyles from './host-theme.css?inline';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  theme: 'none',
  styles: projectStyles,
});
```

`?inline` is Vite syntax, not an OrfinSupport requirement. Other bundlers can provide the string differently. The [Northstar project stylesheet](../demo/host-theme.css) is maintained by the demo application and passed from [its integration](../demo/ui/App.tsx). It supplies paper surfaces, forest controls, serif typography, square corners and a double-rule header, including tours, hover prompts and preferences. It is not part of the library's preset registry.

Scope CSS to `:host([data-theme='none'])` to keep it installed while switching presets:

```css
:host([data-theme='none']) .orfin {
  font:
    14px/1.5 Georgia,
    serif;
  color: #263c35;
}

:host([data-theme='none']) button,
:host([data-theme='none']) select,
:host([data-theme='none']) textarea {
  color: inherit;
  background: #f9fff3;
  border: 1px solid #315947;
  border-radius: 4px;
}

:host([data-theme='none']) .theme[aria-pressed='true'],
:host([data-theme='none']) .toggle[aria-checked='true'] {
  color: #fff;
  background: #315947;
}

:host([data-theme='none']) button:disabled {
  opacity: 0.5;
}

:host([data-theme='none']) button:focus-visible {
  outline: 2px solid #315947;
  outline-offset: 3px;
}
```

The stylesheet is inserted as text after layout and preset CSS, not as HTML. It is trusted developer configuration and is never sent to the model. The `nonce` option applies to each injected style element. Custom CSS can intentionally alter layout too; avoid hiding focus indicators or overriding reduced-motion safeguards.

## Restore a preset without remounting

```ts
orfin.updateSettings({ theme: 'none', styles: projectStyles });
orfin.updateSettings({ styles: revisedProjectStyles });
orfin.updateSettings({ theme: 'forest', styles: '' });
```

The controller, conversation, selected locale and configured logo remain intact. If all project rules are scoped to no-preset mode, switching to `{ theme: 'forest' }` alone is sufficient. Unscoped CSS continues to apply until replaced or cleared. External project CSS should likewise use `[data-theme='none']` if it must stop applying to presets.

React's `useOrfin().updateSettings`, Vue's `useOrfin().updateSettings` and Angular's `injectOrfin().updateSettings` accept the same changes. No new provider or component instance is needed.

## Surfaces and states

| Area                          | Useful exported parts                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Overall typography and layout | `orfin`, `panel`, `header`, `heading`, `conversation`, `composer`, `footer`                    |
| Identity and launcher         | `launcher`, `avatar`, `logo`, `logo-image`, `welcome-mark`                                     |
| Messages and feedback         | `message`, `user`, `assistant`, `message-label`, `tool`, `source`, `error`, `retry`            |
| Inputs and settings           | `input-wrap`, `input`, `send`, `language`, `theme`, `toggle`, `preferences`, `suggestion`      |
| Tours and hover help          | `popover`, `tour-popover`, `popover-top`, `tour-inline`, `primary`, `secondary`, `icon-button` |
| Selection and spotlight       | `picker-bar`, `section-list`, `spotlight`, `spot-label`                                        |

Use `styles` for attribute states and descendants not individually exposed as parts. A tour popover also exports `popover`, so a common surface rule covers both tours and hover prompts. Adjust spotlight darkness and timing through `highlightOpacity` and `highlightTransition`; both remain independent of the chosen theme.

The project owns contrast, typography and visual state design in no-preset mode. Check the replacement on narrow screens, keyboard focus, loading/disabled/error states and RTL. Orfin retains its accessible labels, runtime locale changes, responsive placement and reduced-motion handling. See [the API reference](API.md#style-tokens) for token defaults when using a preset.
